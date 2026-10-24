import * as THREE from "three";
import { catmull, createBuilder, frame, mix, noise, paint, polyline, rng, smoothstep, svg } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Oasis Caravan Stop",
  description:
    "A Journey-inspired desert diorama: a sculpted dune island with a turquoise oasis pond, palms, a ruined glyph gate, a striped tent and awning camp, a campfire, two camels and a scarf-trailing robed traveler.",
};

// ---------------------------------------------------------------------------------------------------------------
// Basics

type V = [number, number, number];
type Col = string | readonly [number, number, number];
type OP = [number, number] | [number, number, "sharp"];
const D2R = Math.PI / 180;
const UPV = new THREE.Vector3(0, 1, 0);

const R = 2.3; // island radius
const PX = -0.5; // pond centre
const PZ = 0.25;
const FX = 0.75; // campfire
const FZ = 0.45;
const WATER_Y = 0.375;
const WD: V = [-0.93, 0, 0.37]; // wind direction (toward the viewer's left)
const WP: V = [-0.37, 0, -0.93]; // horizontal perpendicular to the wind

/** A local frame: yaw about +Y, uniform scale k, origin in model space. */
class Loc {
  x: number;
  y: number;
  z: number;
  yaw: number;
  k: number;
  q: THREE.Quaternion;
  constructor(x: number, y: number, z: number, yaw = 0, k = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.k = k;
    this.q = new THREE.Quaternion().setFromAxisAngle(UPV, yaw);
  }
  p(v: V): THREE.Vector3 {
    return new THREE.Vector3(v[0] * this.k, v[1] * this.k, v[2] * this.k)
      .applyQuaternion(this.q)
      .add(new THREE.Vector3(this.x, this.y, this.z));
  }
  d(v: V): THREE.Vector3 {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q);
  }
  rot(e: V = [0, 0, 0]): THREE.Quaternion {
    return this.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0] * D2R, e[1] * D2R, e[2] * D2R)));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Terrain height field

const ridge = (u: number, a: number, k1: number, k2: number) => a * Math.exp(u >= 0 ? -k1 * u : k2 * u);

function H(x: number, z: number): number {
  let h = 0.5 + 0.03 * Math.sin(x * 2.3 + z * 1.1) + 0.025 * Math.sin(z * 3.1 - x * 1.7 + 1.0);
  h += ridge(z + 1.45 - 0.28 * Math.sin(x * 1.25 + 0.6), 0.36, 1.5, 5.0); // back dune, sharp crest
  h += ridge(1.9 - (0.7 * x - 0.7 * z), 0.3, 1.6, 4.5); // back-right dune
  h += ridge(1.8 + 0.8 * x + 0.6 * z, 0.26, 1.7, 4.5); // back-left dune
  const pm = smoothstep(1.9, 1.1, Math.hypot(x - 0.7, z - 0.55));
  h += (0.52 - h) * pm * 0.9; // flatter camp ground
  const d = Math.hypot((x - PX) / 0.72, (z - PZ) / 0.5);
  const t = smoothstep(1.35, 0.75, d);
  return h * (1 - t) + 0.27 * t; // pond basin
}

function N(x: number, z: number): V {
  const e = 0.03;
  const dx = (H(x + e, z) - H(x - e, z)) / (2 * e);
  const dz = (H(x, z + e) - H(x, z - e)) / (2 * e);
  const l = Math.hypot(dx, 1, dz);
  return [-dx / l, 1 / l, -dz / l];
}

function meshOf(pos: number[], uv: number[], idx: number[], dirOf: (c: THREE.Vector3) => THREE.Vector3) {
  const a = new THREE.Vector3();
  const b2 = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cen = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const out: number[] = [];
  for (let i = 0; i < idx.length; i += 3) {
    const ia = idx[i];
    const ib = idx[i + 1];
    const ic = idx[i + 2];
    a.fromArray(pos, ia * 3);
    b2.fromArray(pos, ib * 3);
    c.fromArray(pos, ic * 3);
    cen.copy(a).add(b2).add(c).divideScalar(3);
    nrm.copy(b2).sub(a).cross(c.clone().sub(a));
    if (nrm.dot(dirOf(cen)) < 0) out.push(ia, ic, ib);
    else out.push(ia, ib, ic);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(out);
  g.computeVertexNormals();
  return g;
}

function terrainTop() {
  const NR = 44;
  const NS = 96;
  const pos: number[] = [0, H(0, 0), 0];
  const uv: number[] = [0.5, 0.5];
  const idx: number[] = [];
  for (let i = 1; i <= NR; i++)
    for (let j = 0; j < NS; j++) {
      const r = (R * i) / NR;
      const a = (j / NS) * Math.PI * 2;
      const x = r * Math.sin(a);
      const z = r * Math.cos(a);
      pos.push(x, H(x, z), z);
      uv.push(0.5 + x / (2 * R), 0.5 + z / (2 * R));
    }
  for (let j = 0; j < NS; j++) idx.push(0, 1 + j, 1 + ((j + 1) % NS));
  for (let i = 1; i < NR; i++)
    for (let j = 0; j < NS; j++) {
      const a = 1 + (i - 1) * NS + j;
      const bq = 1 + (i - 1) * NS + ((j + 1) % NS);
      const c = 1 + i * NS + j;
      const d = 1 + i * NS + ((j + 1) % NS);
      idx.push(a, c, bq, bq, c, d);
    }
  return meshOf(pos, uv, idx, () => UPV);
}

function terrainSkirt() {
  const NS = 96;
  const rings: [number, number][] = [
    [1, 1],
    [0.97, 0.72],
    [0.9, 0.42],
    [0.76, 0.16],
    [0.58, 0],
  ];
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  rings.forEach(([rs, ty]) => {
    for (let j = 0; j < NS; j++) {
      const a = (j / NS) * Math.PI * 2;
      const hr = H(R * Math.sin(a), R * Math.cos(a));
      pos.push(R * rs * Math.sin(a), hr * ty, R * rs * Math.cos(a));
      uv.push(j / NS, ty);
    }
  });
  const centre = rings.length * NS;
  pos.push(0, 0, 0);
  uv.push(0.5, 0.5);
  for (let k = 0; k < rings.length - 1; k++)
    for (let j = 0; j < NS; j++) {
      const a = k * NS + j;
      const bq = k * NS + ((j + 1) % NS);
      const c = (k + 1) * NS + j;
      const d = (k + 1) * NS + ((j + 1) % NS);
      idx.push(a, c, bq, bq, c, d);
    }
  const last = (rings.length - 1) * NS;
  for (let j = 0; j < NS; j++) idx.push(centre, last + j, last + ((j + 1) % NS));
  return meshOf(pos, uv, idx, (c) => (c.y < 1e-6 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(c.x, 0, c.z)));
}

// ---------------------------------------------------------------------------------------------------------------
// Paints (Journey: warm lit sand, plum-violet shadows, crisp terminator)

const LIGHT = new THREE.Vector3(0.55, 0.62, 0.45).normalize();

const toon = (c: Col, n: THREE.Vector3, amt = 0.42) => {
  const d = n.dot(LIGHT);
  const s = mix(c, "#4a2a68", amt * (1 - smoothstep(-0.05, 0.22, d)));
  return mix(s, "#fff2c8", 0.2 * smoothstep(0.5, 1, d));
};

const toonCache = new Map<string, ReturnType<typeof paint>>();
const T = (c: string) => {
  let q = toonCache.get(c);
  if (!q) {
    q = paint((_p, n) => toon(c, n));
    toonCache.set(c, q);
  }
  return q;
};

const SAND = paint((p, n) => {
  const d = n.dot(LIGHT);
  const l = smoothstep(-0.03, 0.1, d);
  let c = mix("#a9483f", "#efb867", l);
  c = mix(c, "#fbe6a8", smoothstep(0.45, 0.95, d) * 0.85);
  c = mix(c, "#6e3550", (1 - l) * smoothstep(0.0, -0.55, d) * 0.5);
  const rip = Math.sin((p.x * 0.8 + p.z * 0.6) * 85 + noise(p, 0.35, 2) * 10);
  if (rip > 0.82) c = mix(c, l > 0.5 ? "#dd9f55" : "#8c3a45", 0.4);
  const gd = Math.hypot((p.x - PX) / 0.8, (p.z - PZ) / 0.55);
  c = mix(c, "#b98a4a", smoothstep(1.35, 1.05, gd) * 0.55);
  if (gd < 2.3) {
    const grass = smoothstep(2.3, 1.5, gd) * smoothstep(0.42, 0.58, noise(p, 0.22, 5)) * smoothstep(0.55, 0.9, n.y);
    c = mix(c, mix("#4f7a45", "#a3bb52", l), grass * 0.92);
  }
  const fd = Math.hypot(p.x - FX, p.z - FZ);
  c = mix(c, "#ffc064", smoothstep(0.8, 0.1, fd) * 0.4);
  c = mix(c, "#3a2420", smoothstep(0.2, 0.08, fd) * 0.85);
  if (l > 0.4 && noise(p, 0.02, 9) > 0.75) c = mix(c, "#fffbe8", 0.85);
  return c;
});

const STRATA = paint((p, n) => {
  const ramp = ["#5e2e45", "#7d3a47", "#9d4b45", "#bd6246", "#d98048", "#ea9f55", "#f3be6b", "#f8d98e"];
  const y = p.y + (noise(p, 0.4, 4) - 0.5) * 0.1;
  const i = Math.min(ramp.length - 1, Math.max(0, Math.floor(y / 0.11)));
  let c = mix(ramp[i], ramp[i], 0);
  if (Math.floor(y / 0.037) % 3 === 0) c = mix(c, "#4a2540", 0.25);
  return toon(c, n, 0.3);
});

const WATER = paint((p) => {
  const d = Math.hypot((p.x - PX) / 0.8, (p.z - PZ) / 0.55);
  let c = mix("#17808f", "#4fd6c4", smoothstep(0.1, 0.95, d));
  c = mix(c, "#d9fff0", smoothstep(0.86, 1.02, d) * 0.8);
  if (noise(p, 0.03, 4) > 0.74) c = mix(c, "#ffffff", 0.55);
  return c;
});

const ROCK = paint((p, n) => {
  let c = mix("#a96d52", "#c58c63", noise(p, 0.1, 7));
  c = mix(c, "#6f8c3f", smoothstep(0.5, 0.85, n.y) * 0.45 * smoothstep(0.4, 0.6, noise(p, 0.07, 8)));
  return toon(c, n);
});

const BARK = paint((p, n) => {
  let c = mix("#8a5a3a", "#a87a50", noise(p, 0.15, 2));
  if (Math.sin(p.y * 70 + noise(p, 0.1, 3) * 6) > 0.55) c = mix(c, "#4e301f", 0.55);
  return toon(c, n);
});

const STONE = paint((p, n) => {
  const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
  const rowH = 0.16;
  const row = Math.floor(p.y / rowH);
  const fu = (u + (row & 1) * 0.17) / 0.34;
  const fx = fu - Math.floor(fu);
  const fy = p.y / rowH - row;
  let c = mix("#e0ac70", "#bf8156", noise(p, 0.18, 6));
  c = mix(c, "#f1cf94", smoothstep(0.6, 1, n.y) * 0.6);
  if (fx < 0.045 || fy < 0.05) c = mix(c, "#6b4146", 0.55);
  return toon(c, n);
});

const WOOD = paint((p, n) => {
  let c = mix("#a9743f", "#8a5a32", noise(p, 0.08, 3));
  const f = p.y * 12 - Math.floor(p.y * 12);
  if (f < 0.07) c = mix(c, "#3e2414", 0.6);
  return toon(c, n);
});

const CAMEL = paint((p, n) => {
  let c = mix("#c68a4e", "#e0b070", noise(p, 0.25, 3));
  c = mix(c, "#f1d29a", smoothstep(-0.2, -0.8, n.y) * 0.7);
  return toon(c, n);
});

const BLANKET = paint((p, n) => {
  const k = Math.floor(p.y / 0.03) % 3;
  return toon(k === 0 ? "#b8332b" : k === 1 ? "#f0c26a" : "#2a7388", n);
});

const PACK = paint((p, n) => {
  const k = Math.floor((p.y + p.x + p.z) / 0.035);
  return toon(k % 2 ? "#8f3c2e" : "#e6b45a", n);
});

const CLAY = paint((p, n, s) => {
  const h = s[0];
  let c: Col = mix("#d9743e", "#b9562f", noise(p, 0.1, 5));
  if ((h > 0.1 && h < 0.125) || (h > 0.165 && h < 0.18)) c = "#3d2430";
  else if (h > 0.13 && h < 0.16) c = Math.floor(s[1] / 24) % 2 ? "#f2d79a" : "#d9743e";
  return toon(c, n);
});

const AWN = paint((_p, n, s) => {
  let c: Col = Math.floor(s[0] * 8) % 2 ? "#fff0d0" : "#d9402f";
  if (s[1] > 0.93 || s[1] < 0.04) c = "#2c6f80";
  return toon(c, n);
});

const tentPaint = (cx: number, cz: number, yaw: number, y0: number) => {
  const dx = Math.sin(yaw);
  const dz = Math.cos(yaw);
  return paint((p, n) => {
    const ax = p.x - cx;
    const az = p.z - cz;
    const ang = Math.atan2(ax * dz - az * dx, ax * dx + az * dz);
    const h = p.y - y0;
    const half = 0.36 * (1 - h / 0.58);
    if (h < 0.58 && Math.abs(ang) < half) return toon("#2a1530", n, 0.1);
    let c: Col = Math.floor(ang / (Math.PI / 10) + 100) % 2 ? "#d9402f" : "#fff0d0";
    if (h < 0.06) c = "#7a2a35";
    else if (h < 0.085) c = "#e9b64f";
    if (h > 0.78) c = "#e9b64f";
    return toon(c, n);
  });
};

const robePaint = (cx: number, cz: number, y0: number, k: number, yaw: number) =>
  paint((p, n) => {
    const h = (p.y - y0) / k;
    const ang = Math.atan2(p.x - cx, p.z - cz) - yaw;
    let c: Col = "#c93b2c";
    if (h < 0.035) c = "#f0c070";
    else if (h < 0.1) c = Math.floor((ang + 7) / 0.3925) % 2 ? "#7a2a35" : "#c93b2c";
    else if (Math.abs(Math.atan2(Math.sin(ang), Math.cos(ang))) < 0.18 && h < 0.3) c = "#f1dcae";
    return toon(c, n);
  });

const scarfPaint = paint((_p, n, s) => {
  const a = s[0] * 16;
  const f = a - Math.floor(a);
  let c: Col = "#e03a2d";
  if (s[1] < 0.1 || s[1] > 0.9) c = "#f0c070";
  else if (Math.abs(f - 0.5) + Math.abs(s[1] - 0.5) < 0.32) c = "#ffe9b0";
  return toon(c, n, 0.25);
});

const streamPaint = (c1: string, c2: string) =>
  paint((_p, n, s) => toon(Math.floor(s[0] * 7) % 2 ? c1 : c2, n, 0.25));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const rgbCss = (c: readonly number[]) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;

function frondSvg(): string {
  let leaves = "";
  for (let i = 0; i < 15; i++) {
    const y = 120 - i * 7.4;
    const len = i < 12 ? 27 - i * 0.9 : 14 - (i - 12) * 4;
    const col = rgbCss(mix(i % 2 ? "#3f7a2b" : "#468430", "#9ccb48", i / 14));
    leaves += `<path d="M32 ${y} L${32 - len} ${y - 16} L32 ${y - 4}Z" fill="${col}"/>`;
    leaves += `<path d="M32 ${y} L${32 + len} ${y - 16} L32 ${y - 4}Z" fill="${col}"/>`;
  }
  return `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">${leaves}<path d="M32 4 L25 16 L39 16Z" fill="#a4d04e"/><path d="M32 128 L32 6" stroke="#3b6b25" stroke-width="3"/></svg>`;
}

const FROND = svg(frondSvg(), { size: 256 });

const FLAME = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 95 C9 88 4 62 17 44 C19 54 25 57 28 49 C25 30 34 14 41 1 C44 19 59 33 57 62 C56 80 47 92 32 95Z" fill="#ff4d1a"/>
  <path d="M32 92 C16 86 14 66 23 52 C25 59 29 60 31 54 C30 40 36 28 41 18 C43 32 52 42 50 62 C49 79 43 89 32 92Z" fill="#ff9328"/>
  <path d="M32 88 C23 83 22 70 28 60 C30 66 33 66 34 60 C34 52 38 46 41 40 C42 52 46 58 44 68 C43 80 39 86 32 88Z" fill="#ffd54a"/>
  <path d="M32 83 C27 80 27 72 31 66 C34 70 37 72 37 76 C37 80 35 83 32 83Z" fill="#fff6c0"/></svg>`,
  { size: 192 },
);

const GRASS = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3d7a3a"/><stop offset="1" stop-color="#b7cf5a"/></linearGradient></defs>
  <path d="M22 64 C22 44 14 26 4 8 C16 22 25 42 28 64Z" fill="url(#g)"/>
  <path d="M26 64 C26 40 28 20 30 2 C34 22 34 44 32 64Z" fill="url(#g)"/>
  <path d="M30 64 C32 46 38 30 46 14 C40 34 38 48 36 64Z" fill="url(#g)"/>
  <path d="M18 64 C16 52 10 44 2 38 C12 44 18 52 22 64Z" fill="url(#g)"/>
  <path d="M34 64 C36 54 42 48 47 46 C40 52 38 56 38 64Z" fill="url(#g)"/></svg>`,
  { size: 192 },
);

function rugSvg(): string {
  let fringe = "";
  let motifs = "";
  for (let x = 6; x <= 94; x += 4) fringe += `<path d="M${x} 6 L${x} 1 M${x} 70 L${x} 75" stroke="#f1c46b" stroke-width="1.6"/>`;
  for (let x = 14; x <= 86; x += 8) motifs += `<path d="M${x} 16 L${x + 3} 20 L${x} 24 L${x - 3} 20Z M${x} 52 L${x + 3} 56 L${x} 60 L${x - 3} 56Z" fill="#f1c46b"/>`;
  return `<svg viewBox="0 0 100 76" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="6" width="96" height="64" fill="#b4322a"/>
  <rect x="2" y="6" width="96" height="64" fill="none" stroke="#f1c46b" stroke-width="3"/>
  <rect x="9" y="13" width="82" height="50" fill="none" stroke="#2c6f80" stroke-width="3"/>
  <path d="M50 22 L80 38 L50 54 L20 38Z" fill="#f4e0b0"/><path d="M50 28 L72 38 L50 48 L28 38Z" fill="#b4322a"/>
  <circle cx="50" cy="38" r="5" fill="#2c6f80"/>${motifs}${fringe}</svg>`;
}
const RUG = svg(rugSvg(), { size: 384 });

const RIPPLE = svg(
  `<svg viewBox="0 0 150 105" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="52" rx="58" ry="38" fill="none" stroke="#d3fbef" stroke-width="1.5" stroke-dasharray="30 22 12 20"/>
  <ellipse cx="75" cy="52" rx="42" ry="27" fill="none" stroke="#e6fff6" stroke-width="1.5" stroke-dasharray="18 14 26 12"/>
  <ellipse cx="75" cy="52" rx="24" ry="14" fill="none" stroke="#d3fbef" stroke-width="1.5" stroke-dasharray="14 12"/>
  <ellipse cx="112" cy="66" rx="12" ry="8" fill="#4f9a45" stroke="#2f6a3a" stroke-width="1.4"/>
  <ellipse cx="38" cy="38" rx="9" ry="6" fill="#58a54a" stroke="#2f6a3a" stroke-width="1.4"/>
  <ellipse cx="96" cy="30" rx="7" ry="5" fill="#4f9a45" stroke="#2f6a3a" stroke-width="1.4"/>
  <circle cx="112" cy="65" r="3.6" fill="#f7a8c4"/><circle cx="112" cy="65" r="1.5" fill="#fff4c0"/>
  <path d="M60 70 l3 3 l-3 3 l-3 -3Z M90 46 l2 2 l-2 2 l-2 -2Z M52 28 l2 2 l-2 2 l-2 -2Z" fill="#ffffff"/></svg>`,
  { size: 600 },
);

const PRINT = svg(
  `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="17" rx="10" ry="15" fill="#a2503e"/>
  <path d="M8 37 Q16 33 24 37 L22 52 Q16 55 10 52Z" fill="#a2503e"/></svg>`,
  { size: 128 },
);

const BANNER = svg(
  `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 100 L38 100 L38 0 L20 14 L2 0Z" fill="#c8362b"/>
  <path d="M2 100 L38 100 L38 0 L20 14 L2 0Z" fill="none" stroke="#f0c26a" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="20" cy="56" r="9" fill="none" stroke="#f6e2a0" stroke-width="2.6"/>
  <circle cx="20" cy="56" r="3" fill="#f6e2a0"/>
  <path d="M10 80 L20 72 L30 80 M12 36 L20 44 L28 36" fill="none" stroke="#f6e2a0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 20 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="35" r="5" fill="#d9402f"/><rect x="8" y="26" width="4" height="6" fill="#f2c25a"/>
  <path d="M10 28 L1 2 L19 2Z" fill="#d9402f"/>
  <path d="M5 6 L9 28 M10 4 L10 28 M15 6 L11 28" stroke="#f2c25a" stroke-width="1.8" fill="none"/></svg>`,
  { size: 128 },
);

const glyphSvg = (c1: string, c2: string) =>
  svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="26" fill="none" stroke="${c1}" stroke-width="3.2"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="${c1}" stroke-width="3.2"/>
  <path d="M32 3 V16 M32 48 V61 M3 32 H16 M48 32 H61" stroke="${c1}" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M32 22 L40 32 L32 42 L24 32Z" fill="${c2}"/><circle cx="32" cy="32" r="2.5" fill="${c1}"/></svg>`,
    { size: 256 },
  );
const GLYPH_GLOW = glyphSvg("#ffd98a", "#fff0b8");
const GLYPH_CARVED = glyphSvg("#6b4146", "#8a5a4e");

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "oasis_caravan_stop", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const rnd = rng(7);

  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);

  interface PutOpts {
    scale?: V | number;
    texture?: THREE.Texture;
    flat?: boolean;
  }
  const put = (L: Loc, geo: THREE.BufferGeometry, color: ColorInput, at: V, rot: V = [0, 0, 0], o: PutOpts = {}) => {
    const sc = o.scale ?? 1;
    const s3: V = typeof sc === "number" ? [sc, sc, sc] : sc;
    return b.part(geo, color, {
      at: L.p(at),
      quat: L.rot(rot),
      scale: [s3[0] * L.k, s3[1] * L.k, s3[2] * L.k],
      texture: o.texture,
      flat: o.flat,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kr = (L: Loc, r: any): any => {
    if (L.k === 1) return r;
    if (typeof r === "function")
      return (t: number) => {
        const v = r(t);
        return typeof v === "number" ? v * L.k : [v[0] * L.k, v[1] * L.k];
      };
    if (typeof r === "number") return r * L.k;
    return (r as number[]).map((v) => v * L.k);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tube = (L: Loc, pts: V[], radius: any, color: ColorInput, opts: any = {}) => {
    const w = pts.map((v) => L.p(v));
    return b.sweep(w.length > 2 ? catmull(w) : polyline(w), kr(L, radius), { color, ...opts });
  };

  const lathe = (L: Loc, out: OP[], color: ColorInput, segments = 8, at?: V) =>
    b.lathe(
      out.map((o): OP => (o.length === 3 ? [o[0] * L.k, o[1] * L.k, "sharp"] : [o[0] * L.k, o[1] * L.k])),
      { at: L.p(at ?? [0, 0, 0]), axis: [0, 1, 0], segments, color },
    );

  const rod = (a: V | THREE.Vector3, c: V | THREE.Vector3, r: number, color: ColorInput) => b.rod(a, c, r, { color });

  // ribbons / cloth ---------------------------------------------------------------------------------------------
  const flow = (origin: V, len: number, n: number, droop: number, amp: number, phase: number): V[] => {
    const out: V[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const wave = Math.sin(t * 6.5 + phase) * amp * t;
      const lift = Math.sin(t * 5 + phase * 1.7) * amp * 0.5 * t;
      out.push([
        origin[0] + WD[0] * len * t + WP[0] * wave,
        origin[1] - droop * t * t + lift,
        origin[2] + WD[2] * len * t + WP[2] * wave,
      ]);
    }
    return out;
  };
  const ribbon = (pts: V[], width: (t: number) => number, color: ColorInput, twist = 0) => {
    const A: V[] = [];
    const B: V[] = [];
    pts.forEach((p, i) => {
      const t = i / (pts.length - 1);
      const w = width(t) / 2;
      const ph = twist * t;
      const o: V = [WP[0] * Math.sin(ph) * w, Math.cos(ph) * w, WP[2] * Math.sin(ph) * w];
      A.push([p[0] + o[0], p[1] + o[1], p[2] + o[2]]);
      B.push([p[0] - o[0], p[1] - o[1], p[2] - o[2]]);
    });
    return b.membrane(catmull(A), catmull(B), { color, thickness: 0.004, rows: 2, cols: Math.max(10, pts.length * 2) });
  };

  const GOLD = "#e9b64f";
  const IRON = "#2d2630";
  const ROPE = "#e8d4a0";

  // =============================================================================================================
  // Island
  b.part(terrainTop(), SAND, { bone: base, at: [0, 0, 0] });
  b.part(terrainSkirt(), STRATA, { bone: base, at: [0, 0, 0] });

  // Pond
  b.part(cyl(1, 1, 0.03, 32), WATER, { at: [PX, WATER_Y - 0.015, PZ], scale: [0.8, 1, 0.55] });
  b.part(new THREE.PlaneGeometry(1.5, 1.05), "#ffffff", {
    at: [PX, WATER_Y + 0.004, PZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RIPPLE,
  });

  // Stones round the pond
  for (let i = 0; i < 17; i++) {
    const a = (i / 17) * Math.PI * 2 + rnd() * 0.3;
    const g = 1.16 + rnd() * 0.12;
    const x = PX + 0.72 * g * Math.cos(a);
    const z = PZ + 0.5 * g * Math.sin(a);
    if (Math.hypot(x - FX, z - FZ) < 0.35) continue;
    const s = 0.04 + rnd() * 0.05;
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, {
      at: [x, H(x, z) + s * 0.1, z],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 0.5, rnd() * 6, rnd() * 0.5)),
      scale: [s * 1.25, s * 0.7, s],
      flat: true,
    });
  }

  // Reeds and grass tufts
  const tufts: ReturnType<typeof frame>[] = [];
  const reeds: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2;
    const g = 1.0 + rnd() * 0.55;
    const x = PX + 0.8 * g * Math.cos(a);
    const z = PZ + 0.55 * g * Math.sin(a);
    if (Math.hypot(x, z) > R - 0.2 || H(x, z) < 0.35) continue;
    if (Math.hypot(x - FX, z - FZ) < 0.4) continue;
    (x < PX - 0.3 && g < 1.3 ? reeds : tufts).push(frame([x, H(x, z) - 0.01, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.1, 0.15], vary: 0.4, rng: rnd, spin: 180, cross: true, bend: 15, flow: [0, 0, 1] });
  b.cards(reeds, GRASS, { size: [0.12, 0.34], vary: 0.3, rng: rnd, spin: 180, cross: true, bend: 25, flow: [0, 0, 1] });

  // =============================================================================================================
  // Palms
  const palm = (x: number, z: number, h: number, lean: [number, number]) => {
    const g = H(x, z) - 0.05;
    const P = (t: number): V => [x + lean[0] * t * t, g + h * t, z + lean[1] * t * t];
    const pts: V[] = [];
    for (let i = 0; i <= 6; i++) pts.push(P(i / 6));
    b.sweep(catmull(pts), (t: number) => 0.034 + 0.034 * (1 - t) ** 2, { color: BARK, sides: 7 });
    const top = new THREE.Vector3(...P(1));
    const sc = h / 1.2;
    b.part(sph(7, 5), "#5b3d26", { at: [top.x, top.y + 0.01, top.z], scale: [0.06, 0.05, 0.06] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(sph(6, 4), "#b5472a", {
        at: [top.x + Math.cos(a) * 0.06, top.y - 0.05, top.z + Math.sin(a) * 0.06],
        scale: [0.022, 0.03, 0.022],
      });
    }
    const ring1 = b.ring(frame(top, [0, 1, 0]), { count: 9, radius: 0.03 }).items;
    b.cards(ring1, FROND, { size: [0.3 * sc, 0.8 * sc], lean: -18, bend: 85, flow: [0, -1, 0], vary: 0.18, spin: 6, rng: rnd, sink: 0.05 });
    const ring2 = b.ring(frame(top, [0, 1, 0]), { count: 6, radius: 0.02, fromDeg: 20, toDeg: 320 }).items;
    b.cards(ring2, FROND, { size: [0.26 * sc, 0.62 * sc], lean: -58, bend: 55, flow: [0, -1, 0], vary: 0.18, spin: 6, rng: rnd, sink: 0.05 });
  };
  palm(-1.35, -0.35, 1.25, [0.38, 0.22]);
  palm(-0.85, -0.85, 1.05, [0.2, 0.3]);
  palm(-1.6, 0.5, 0.95, [0.4, -0.12]);
  palm(-0.45, -1.0, 0.7, [0.1, 0.1]);

  // =============================================================================================================
  // Ruined glyph gate
  const GL = new Loc(0.55, 0, -1.28, 0);
  const gH = (lx: number) => H(GL.x + lx, GL.z);
  const PW = 0.27;
  const pilL = -0.45;
  const pilR = 0.5;
  const topL = gH(pilL) + 0.95;
  const topR = gH(pilR) + 0.62;
  const pillar = (lx: number, top: number, w: number, carved: boolean) => {
    const g = gH(lx);
    const y0 = g - 0.25;
    const hw = (y: number) => (w / 2) * (1 - 0.12 * ((y - y0) / (top - y0)));
    b.frustumBox([GL.x + lx, y0, GL.z], [GL.x + lx, top, GL.z], [w, w], [w * 0.88, w * 0.88], { color: STONE });
    put(GL, box(w + 0.1, 0.12, w + 0.1), STONE, [lx, g + 0.02, 0]);
    for (const y of [g + 0.3, g + 0.55]) put(GL, box(hw(y) * 2 + 0.03, 0.035, hw(y) * 2 + 0.03), T("#f0c98a"), [lx, y, 0]);
    const gy = g + 0.43;
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      at: GL.p([lx, gy, hw(gy) + 0.004]),
      dir: [0, 0, 1],
      axis: "z",
      texture: carved ? GLYPH_GLOW : GLYPH_CARVED,
    });
    return hw;
  };
  pillar(pilL, topL, PW, true);
  pillar(pilR, topR, PW, false);
  glow(
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", {
      at: GL.p([pilL, gH(pilL) + 0.43, (PW / 2) * (1 - 0.12 * ((gH(pilL) + 0.43 - (gH(pilL) - 0.25)) / (topL - gH(pilL) + 0.25))) + 0.008]),
      dir: [0, 0, 1],
      axis: "z",
      texture: GLYPH_GLOW,
    }),
    1.1,
  );
  put(GL, box(PW * 0.88 + 0.12, 0.1, PW * 0.88 + 0.12), T("#f0c98a"), [pilL, topL - 0.05, 0]);
  put(GL, box(PW * 0.9, 0.09, PW * 0.9), STONE, [pilR + 0.02, topR + 0.04, 0], [8, 0, 12]);
  put(GL, box(0.12, 0.1, 0.1), STONE, [pilR - 0.08, topR + 0.1, 0.03], [20, 30, -15]);
  put(GL, box(0.82, 0.18, 0.3), STONE, [pilL + 0.34, topL + 0.1, 0], [0, 0, -2]);
  glow(
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      at: GL.p([pilL + 0.3, topL + 0.1, 0.154]),
      dir: [0, 0, 1],
      axis: "z",
      texture: GLYPH_GLOW,
    }),
    1.2,
  );
  for (const bx of [pilL + 0.1, pilL + 0.5]) {
    b.cards([frame(GL.p([bx, topL + 0.02, 0.16]), [0, 1, 0])], BANNER, { size: [0.16, 0.42], lean: 180, flow: [0, 0, 1] });
  }
  // Floating glyph in the gap
  const gy0 = gH(0) + 0.62;
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
        at: GL.p([0.03, gy0, -0.02 * s]),
        dir: [0, 0, s],
        axis: "z",
        texture: GLYPH_GLOW,
      }),
      1.3,
    );
  }
  // Rubble
  const rubble: [number, number, number, number][] = [
    [0.38, 0.3, 0.14, 25],
    [0.62, 0.22, 0.1, -40],
    [0.2, 0.34, 0.09, 70],
    [-0.62, 0.22, 0.11, 15],
  ];
  for (const [lx, lz, s, ry] of rubble) {
    const w = GL.p([lx, 0, lz]);
    put(GL, box(s * 1.3, s, s), STONE, [lx, H(w.x, w.z) + s * 0.25, lz], [rnd() * 14, ry, rnd() * 14]);
  }
  const drum = GL.p([0.15, 0, 0.5]);
  put(GL, cyl(0.1, 0.1, 0.3, 8), STONE, [0.15, H(drum.x, drum.z) + 0.08, 0.5], [0, 20, 90]);

  // Dune-crest pole with streamers
  const poleX = -1.6;
  const poleZ = -0.9;
  const pg = H(poleX, poleZ);
  rod([poleX, pg - 0.05, poleZ], [poleX, pg + 0.95, poleZ], 0.014, T("#7a4a2c"));
  b.part(sph(6, 4), GOLD, { at: [poleX, pg + 0.97, poleZ], scale: 0.026 });
  ribbon(flow([poleX, pg + 0.92, poleZ], 0.8, 12, 0.1, 0.11, 0.2), (t) => 0.1 * (1 - 0.75 * t), streamPaint("#d9402f", "#fff0d0"), 1.2);
  ribbon(flow([poleX, pg + 0.84, poleZ], 0.65, 12, 0.1, 0.1, 1.4), (t) => 0.09 * (1 - 0.75 * t), streamPaint("#2c6f80", "#f0c26a"), 1.0);
  ribbon(flow([poleX, pg + 0.76, poleZ], 0.5, 10, 0.08, 0.08, 2.6), (t) => 0.08 * (1 - 0.7 * t), streamPaint("#f0c26a", "#d9402f"), 0.8);
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    const s = 0.06 - i * 0.008;
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, {
      at: [poleX + Math.cos(a) * 0.12, H(poleX + Math.cos(a) * 0.12, poleZ + Math.sin(a) * 0.12) + 0.01, poleZ + Math.sin(a) * 0.12],
      scale: [s * 1.2, s * 0.7, s],
      flat: true,
    });
  }

  // =============================================================================================================
  // Campfire
  const FG = H(FX, FZ);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const s = 0.045 + (i % 3) * 0.008;
    b.part(new THREE.IcosahedronGeometry(1, 0), "#4a3a3c", {
      at: [FX + Math.cos(a) * 0.17, FG + s * 0.35, FZ + Math.sin(a) * 0.17],
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(i, i * 2, 0)),
      scale: [s * 1.2, s * 0.8, s],
      flat: true,
    });
  }
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.4;
    b.rod([FX + Math.cos(a) * 0.17, FG + 0.03, FZ + Math.sin(a) * 0.17], [FX - Math.cos(a) * 0.03, FG + 0.1, FZ - Math.sin(a) * 0.03], 0.022, {
      bands: [
        [0.72, "#6a4128"],
        [1, "#2a1a16"],
      ],
    });
  }
  const flameFrames: [number, number, number, number][] = [
    [0, 0, 0.2, 0.34],
    [0.05, 0.03, 0.14, 0.24],
    [-0.05, -0.02, 0.13, 0.22],
    [0.02, -0.05, 0.1, 0.18],
  ];
  for (const [dx, dz, w, h] of flameFrames) {
    glow(b.cards([frame([FX + dx, FG + 0.06, FZ + dz], [0, 1, 0])], FLAME, { size: [w, h], cross: true, sink: 0 }), 1.6);
  }
  for (let i = 0; i < 9; i++) {
    const a = rnd() * 6.28;
    const r = 0.05 + rnd() * 0.25;
    glow(
      b.part(new THREE.OctahedronGeometry(0.008 + rnd() * 0.006, 0), "#ffb040", {
        at: [FX + Math.cos(a) * r, FG + 0.25 + rnd() * 0.35, FZ + Math.sin(a) * r],
      }),
      2,
    );
  }
  // Tripod and pot
  const apex = new THREE.Vector3(FX, FG + 0.5, FZ);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.5;
    rod([FX + Math.cos(a) * 0.32, FG - 0.01, FZ + Math.sin(a) * 0.32], apex, 0.012, T("#6b4128"));
  }
  rod(apex, [FX, FG + 0.38, FZ], 0.004, IRON);
  const PL = new Loc(FX, FG + 0.24, FZ);
  lathe(PL, [[0, 0], [0.05, 0], [0.085, 0.04], [0.09, 0.09], [0.08, 0.125], [0, 0.125]], T("#2d2630"), 8);
  put(PL, new THREE.TorusGeometry(0.085, 0.008, 4, 10), IRON, [0, 0.125, 0], [90, 0, 0]);

  // =============================================================================================================
  // Big striped tent
  const TX = 1.45;
  const TZ = -0.25;
  const tentYaw = Math.atan2(FX - TX, FZ - TZ);
  const TY = H(TX, TZ) - 0.02;
  const tp = tentPaint(TX, TZ, tentYaw, TY);
  b.lathe(
    [
      [0.02, 0.93, "sharp"],
      [0.1, 0.74],
      [0.3, 0.4],
      [0.56, 0.12],
      [0.66, 0, "sharp"],
      [0.62, 0, "sharp"],
      [0.52, 0.1],
      [0.27, 0.37],
      [0.07, 0.71],
      [0, 0.86],
    ],
    { at: [TX, TY, TZ], axis: [0, 1, 0], segments: 10, color: tp },
  );
  const TENT_PTS: [number, number][] = [[0, 0.66], [0.12, 0.56], [0.4, 0.3], [0.74, 0.1], [0.93, 0.02]];
  const tentR = (y: number) => {
    for (let i = 0; i < TENT_PTS.length - 1; i++) {
      const [y0, r0] = TENT_PTS[i];
      const [y1, r1] = TENT_PTS[i + 1];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.02;
  };
  for (const s of [1, -1]) {
    const pts: V[] = [0.02, 0.18, 0.34, 0.5, 0.57].map((y) => {
      const th = tentYaw + s * 0.36 * (1 - y / 0.58);
      const r = tentR(y) * 0.965 + 0.012;
      return [TX + Math.sin(th) * r, TY + y, TZ + Math.cos(th) * r] as V;
    });
    b.sweep(catmull(pts), 0.011, { color: GOLD, sides: 5 });
  }
  b.part(new THREE.TorusGeometry(0.64, 0.012, 4, 20), GOLD, { at: [TX, TY + 0.05, TZ], rotation: [90, 0, 0], scale: [1, 1, 1] });
  for (let i = 0; i < 3; i++) {
    const th = tentYaw + [2.3, Math.PI, -2.3][i];
    const sy = 0.45;
    const r0 = tentR(sy) * 0.95;
    const st = new THREE.Vector3(TX + Math.sin(th) * 1.05, H(TX + Math.sin(th) * 1.05, TZ + Math.cos(th) * 1.05), TZ + Math.cos(th) * 1.05);
    rod([TX + Math.sin(th) * r0, TY + sy, TZ + Math.cos(th) * r0], [st.x, st.y + 0.05, st.z], 0.004, ROPE);
    b.part(cone(0.012, 0.07, 5), "#6b4128", { at: [st.x, st.y + 0.02, st.z], rotation: [0, 0, 20] });
  }
  rod([TX, TY + 0.9, TZ], [TX, TY + 1.4, TZ], 0.012, T("#7a4a2c"));
  b.part(sph(6, 4), GOLD, { at: [TX, TY + 0.93, TZ], scale: 0.035 });
  b.part(sph(6, 4), GOLD, { at: [TX, TY + 1.41, TZ], scale: 0.024 });
  ribbon(flow([TX, TY + 1.36, TZ], 0.62, 12, 0.08, 0.1, 0.5), (t) => 0.11 * (1 - 0.75 * t), streamPaint("#d9402f", "#fff0d0"), 1.1);
  ribbon(flow([TX, TY + 1.27, TZ], 0.5, 10, 0.08, 0.08, 2.0), (t) => 0.09 * (1 - 0.75 * t), streamPaint("#2c6f80", "#f0c26a"), 0.9);

  // =============================================================================================================
  // Awning with camp goods
  const AG = H(1.25, 1.2);
  const aHi = AG + 0.68;
  const aLo = AG + 0.42;
  const awningPole = (x: number, z: number, top: number) => {
    rod([x, H(x, z) - 0.04, z], [x, top, z], 0.016, WOOD);
    b.part(sph(6, 4), GOLD, { at: [x, top + 0.012, z], scale: 0.026 });
  };
  awningPole(0.95, 0.95, aHi + 0.01);
  awningPole(0.95, 1.45, aHi + 0.01);
  awningPole(1.55, 0.95, aLo + 0.01);
  awningPole(1.55, 1.45, aLo + 0.01);
  b.membrane(
    catmull([[0.95, aHi, 0.95], [0.95, aHi - 0.03, 1.2], [0.95, aHi, 1.45]]),
    catmull([[1.55, aLo, 0.95], [1.55, aLo - 0.05, 1.2], [1.55, aLo, 1.45]]),
    { color: AWN, thickness: 0.012, rows: 6, cols: 12 },
  );
  const sag = (z: number, d: number) => -d * Math.sin((Math.PI * (z - 0.95)) / 0.5);
  const tasB: ReturnType<typeof frame>[] = [];
  const tasA: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 8; i++) {
    const z = 0.97 + (i * 0.46) / 7;
    tasB.push(frame([1.55, aLo + sag(z, 0.05), z], [0, 1, 0]));
    tasA.push(frame([0.95, aHi + sag(z, 0.03), z], [0, 1, 0]));
  }
  b.cards(tasB, TASSEL, { size: [0.04, 0.09], lean: 180, flow: [0, 0, 1] });
  b.cards(tasA, TASSEL, { size: [0.035, 0.07], lean: 180, flow: [0, 0, 1] });
  // Lantern under the high edge
  const lanY = aHi - 0.03;
  rod([0.95, lanY, 1.2], [0.95, lanY - 0.08, 1.2], 0.004, IRON);
  glow(b.part(cyl(0.04, 0.04, 0.1, 6), "#ffb64a", { at: [0.95, lanY - 0.14, 1.2] }), 1.6);
  b.part(cone(0.055, 0.04, 6), IRON, { at: [0.95, lanY - 0.07, 1.2] });
  b.part(cyl(0.05, 0.05, 0.015, 6), IRON, { at: [0.95, lanY - 0.2, 1.2] });
  // Rug, cushions, crates, jars, sacks, tea
  b.part(new THREE.PlaneGeometry(0.5, 0.38), "#ffffff", {
    at: [1.22, AG + 0.008, 1.2],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUG,
  });
  const cushion = (x: number, z: number, c: string, ry: number) =>
    b.part(sph(8, 5), T(c), { at: [x, AG + 0.035, z], quat: new THREE.Quaternion().setFromAxisAngle(UPV, ry), scale: [0.09, 0.04, 0.07] });
  cushion(1.1, 1.13, "#2c6f80", 0.4);
  cushion(1.3, 1.1, "#e0a43c", -0.3);
  cushion(1.2, 1.32, "#b4322a", 0.1);
  const crate = (x: number, z: number, s: number, ry: number, yOff: number) => {
    const q = new THREE.Quaternion().setFromAxisAngle(UPV, ry);
    b.part(box(s, s, s), WOOD, { at: [x, AG + s / 2 - 0.01 + yOff, z], quat: q });
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) {
        const o = new THREE.Vector3(dx * s * 0.5, 0, dz * s * 0.5).applyQuaternion(q);
        b.part(box(0.02, s + 0.005, 0.02), T("#5a3820"), { at: [x + o.x, AG + s / 2 - 0.01 + yOff, z + o.z], quat: q });
      }
  };
  crate(1.46, 1.0, 0.2, 0.2, 0);
  crate(1.46, 1.0, 0.14, 0.7, 0.2);
  crate(1.25, 0.99, 0.15, -0.3, 0);
  const jarAt = (x: number, z: number, sc: number) => {
    const JL = new Loc(x, H(x, z) - 0.01, z, 0, sc);
    lathe(JL, [[0, 0], [0.045, 0], [0.07, 0.04], [0.085, 0.1], [0.07, 0.17], [0.04, 0.21], [0.055, 0.25], [0, 0.25]], CLAY, 8);
    put(JL, new THREE.TorusGeometry(0.045, 0.01, 4, 8), T("#7a3a28"), [0, 0.215, 0], [90, 0, 0]);
  };
  jarAt(1.02, 1.4, 1);
  jarAt(1.12, 1.43, 0.8);
  jarAt(1.5, 1.38, 1.2);
  const SL = new Loc(1.38, H(1.38, 1.3) - 0.01, 1.3, 0.5);
  lathe(SL, [[0, 0], [0.08, 0], [0.11, 0.05], [0.1, 0.11], [0.06, 0.16], [0.03, 0.17], [0.045, 0.2], [0, 0.2]], T("#d8c08c"), 7);
  put(SL, new THREE.TorusGeometry(0.035, 0.008, 4, 8), T("#9d2f2b"), [0, 0.17, 0], [90, 0, 0]);
  const TL = new Loc(1.2, AG + 0.01, 1.22, 0.3);
  lathe(TL, [[0, 0], [0.04, 0], [0.055, 0.03], [0.055, 0.06], [0.04, 0.08], [0.015, 0.085], [0.015, 0.095], [0, 0.1]], T("#e9b64f"), 8);
  rod(TL.p([0.04, 0.05, 0]), TL.p([0.085, 0.085, 0]), 0.008, GOLD);
  for (const s of [1, -1]) put(TL, cyl(0.014, 0.011, 0.03, 6), T("#f6e2a0"), [s * 0.07, 0.015, 0.06]);

  // =============================================================================================================
  // Camels
  const camel = (L: Loc, kneel: boolean, loaded: boolean) => {
    const dy = kneel ? -0.28 : 0;
    const Y = (x: number, y: number, z: number): V => [x, y + dy, z];
    tube(L, [Y(0, 0.58, -0.42), Y(0, 0.6, -0.1), Y(0, 0.6, 0.2), Y(0, 0.62, 0.4)], (t: number): [number, number] => [
      0.135 + 0.03 * Math.sin(Math.PI * t),
      0.165 + 0.03 * Math.sin(Math.PI * t),
    ], CAMEL);
    put(L, sph(8, 6), CAMEL, Y(0, 0.74, -0.08), [0, 0, 0], { scale: [0.105, 0.115, 0.15] });
    tube(L, [Y(0, 0.66, 0.34), Y(0, 0.8, 0.5), Y(0, 1.0, 0.57), Y(0, 1.1, 0.62)], [0.085, 0.05], CAMEL);
    tube(L, [Y(0, 1.1, 0.62), Y(0, 1.095, 0.74)], [0.062, 0.054], CAMEL);
    tube(L, [Y(0, 1.09, 0.74), Y(0, 1.05, 0.88)], [0.05, 0.043], CAMEL);
    put(L, sph(6, 4), T("#d9a468"), Y(0, 1.045, 0.9), [0, 0, 0], { scale: [0.048, 0.035, 0.04] });
    rod(L.p(Y(0, 1.03, 0.74)), L.p(Y(0, 1.0, 0.87)), 0.022, T("#b98550")); // jaw
    tube(L, [Y(0, 0.68, -0.42), Y(0, 0.6, -0.56), Y(0, 0.42, -0.6)], [0.02, 0.014], CAMEL, { sides: 5 });
    put(L, sph(6, 4), T("#6d4528"), Y(0, 0.38, -0.6), [0, 0, 0], { scale: [0.03, 0.06, 0.03] });
    for (const s of [1, -1]) {
      put(L, cone(0.022, 0.07, 5), CAMEL, Y(s * 0.045, 1.2, 0.6), [0, 0, -25 * s]);
      put(L, sph(6, 4), "#241418", Y(s * 0.057, 1.125, 0.69), [0, 0, 0], { scale: 0.017 });
      put(L, sph(5, 3), "#ffffff", Y(s * 0.064, 1.131, 0.7), [0, 0, 0], { scale: 0.006 });
      put(L, sph(6, 4), T("#b57f4a"), Y(s * 0.056, 1.145, 0.68), [0, 0, 0], { scale: [0.025, 0.012, 0.03] });
      put(L, sph(5, 3), "#3a2020", Y(s * 0.018, 1.06, 0.9), [0, 0, 0], { scale: 0.009 });
      // legs
      const leg = (pts: V[]) => tube(L, pts, (t: number) => 0.052 - 0.024 * t, CAMEL, { sides: 6 });
      if (!kneel) {
        leg([[s * 0.105, 0.5, 0.25], [s * 0.1, 0.27, 0.27], [s * 0.1, 0.045, 0.25]]);
        leg([[s * 0.1, 0.55, -0.3], [s * 0.115, 0.36, -0.2], [s * 0.1, 0.2, -0.33], [s * 0.1, 0.045, -0.3]]);
        put(L, sph(6, 4), T("#8a6040"), [s * 0.1, 0.03, 0.26], [0, 0, 0], { scale: [0.052, 0.03, 0.07] });
        put(L, sph(6, 4), T("#8a6040"), [s * 0.1, 0.03, -0.29], [0, 0, 0], { scale: [0.052, 0.03, 0.07] });
        put(L, sph(5, 4), T("#7a5436"), [s * 0.1, 0.27, 0.3], [0, 0, 0], { scale: 0.03 });
      } else {
        leg([[s * 0.105, 0.38, 0.25], [s * 0.11, 0.06, 0.33], [s * 0.11, 0.055, 0.1]]);
        leg([[s * 0.1, 0.42, -0.3], [s * 0.12, 0.07, -0.5], [s * 0.12, 0.055, -0.2]]);
        put(L, sph(6, 4), T("#8a6040"), [s * 0.11, 0.03, 0.08], [0, 0, 0], { scale: [0.05, 0.03, 0.06] });
        put(L, sph(6, 4), T("#8a6040"), [s * 0.12, 0.03, -0.18], [0, 0, 0], { scale: [0.05, 0.03, 0.06] });
      }
    }
    if (kneel) put(L, sph(6, 4), T("#8a6040"), [0, 0.09, 0.3], [0, 0, 0], { scale: [0.08, 0.05, 0.07] });
    // halter, collar and bell
    put(L, new THREE.TorusGeometry(1, 0.2, 5, 10), "#c9372c", Y(0, 1.065, 0.82), [0, 0, 0], { scale: 0.05 });
    put(L, new THREE.TorusGeometry(1, 0.15, 5, 10), "#c9372c", Y(0, 0.88, 0.54), [-68, 0, 0], { scale: 0.075 });
    put(L, sph(6, 4), GOLD, Y(0, 0.82, 0.6), [0, 0, 0], { scale: 0.022 });
    // girth strap
    put(L, new THREE.TorusGeometry(1, 0.1, 4, 14), "#7a2a35", Y(0, 0.6, 0.1), [0, 0, 0], { scale: [0.16, 0.2, 0.35] });
    // saddle blanket
    put(L, sph(8, 6), BLANKET, Y(0, 0.745, -0.08), [0, 0, 0], { scale: [0.125, 0.125, 0.17] });
    for (const s of [1, -1]) put(L, box(0.02, 0.24, 0.38), BLANKET, Y(s * 0.178, 0.62, -0.05), [0, 0, 8 * s]);
    if (loaded) {
      for (const s of [1, -1]) {
        if (s === 1) {
          put(L, box(0.14, 0.22, 0.3), PACK, Y(0.26, 0.5, -0.06), [0, 0, 6]);
          for (const dz of [-0.08, 0.08]) put(L, box(0.15, 0.015, 0.016), ROPE, Y(0.26, 0.5, -0.06 + dz), [0, 0, 6]);
          put(L, sph(5, 4), T("#e6b45a"), Y(0.27, 0.62, -0.06), [0, 0, 0], { scale: 0.03 });
        } else {
          put(L, cyl(0.085, 0.09, 0.26, 10), WOOD, Y(-0.26, 0.5, -0.06), [0, 0, -4]);
          for (const hy of [-0.08, 0.08]) put(L, cyl(0.093, 0.093, 0.016, 10), T("#4a4250"), Y(-0.26, 0.5 + hy, -0.06), [0, 0, -4]);
        }
        rod(L.p(Y(s * 0.17, 0.74, -0.06)), L.p(Y(s * 0.24, 0.62, -0.06)), 0.008, ROPE);
      }
      put(L, cyl(0.055, 0.055, 0.52, 8), T("#9d2f2b"), Y(0, 0.93, -0.08), [0, 0, 90]);
      for (const s of [1, -1]) put(L, cyl(0.057, 0.057, 0.02, 8), T("#f0c26a"), Y(s * 0.19, 0.93, -0.08), [0, 0, 90]);
    } else {
      put(L, box(0.15, 0.2, 0.28), PACK, Y(0.25, 0.5, -0.06), [0, 0, 6]);
    }
  };
  camel(new Loc(0.1, H(0.1, -0.55) - 0.01, -0.55, Math.atan2(-0.95, 0.7)), false, true);
  camel(new Loc(-0.65, H(-0.65, 1.75) - 0.01, 1.75, Math.atan2(1.05, -1.1)), true, true);

  // =============================================================================================================
  // Traveler
  const FXp = 0.5;
  const FZp = 0.95;
  const LF = new Loc(FXp, H(FXp, FZp) - 0.01, FZp, -0.75, 1.45);
  const rp = robePaint(FXp, FZp, LF.y, LF.k, LF.yaw);
  lathe(LF, [[0, 0], [0.115, 0, "sharp"], [0.118, 0.04], [0.09, 0.2], [0.06, 0.33], [0.055, 0.38], [0, 0.38]], rp, 9);
  lathe(LF, [[0, 0.26], [0.115, 0.26], [0.1, 0.33], [0.06, 0.385], [0, 0.39]], T("#8e2c26"), 9);
  put(LF, sph(8, 6), T("#c93b2c"), [0, 0.45, 0], [0, 0, 0], { scale: [0.058, 0.07, 0.062] });
  b.spike(LF.p([0, 0.5, -0.01]), LF.d([0, 0.55, -0.45]).normalize(), 0.09 * LF.k, 0.04 * LF.k, { color: "#c93b2c" });
  put(LF, sph(7, 5), "#1d1226", [0, 0.445, 0.03], [0, 0, 0], { scale: [0.043, 0.05, 0.04] });
  for (const s of [1, -1])
    glow(put(LF, sph(6, 4), "#fff6c8", [s * 0.02, 0.452, 0.066], [0, 0, 0], { scale: [0.011, 0.017, 0.006] }), 2);
  tube(LF, [[-0.075, 0.34, 0], [-0.085, 0.27, 0.04], [-0.085, 0.22, 0.07]], [0.03, 0.022], T("#c93b2c"), { sides: 6 });
  tube(LF, [[0.075, 0.34, 0], [0.105, 0.28, 0.06], [0.125, 0.24, 0.1]], [0.03, 0.022], T("#c93b2c"), { sides: 6 });
  put(LF, sph(5, 4), "#f1dcae", [-0.085, 0.205, 0.075], [0, 0, 0], { scale: 0.02 });
  put(LF, sph(5, 4), "#f1dcae", [0.13, 0.23, 0.105], [0, 0, 0], { scale: 0.02 });
  rod(LF.p([0.13, 0, 0.11]), LF.p([0.13, 0.64, 0.11]), 0.008 * LF.k, T("#7a4a2c"));
  put(LF, new THREE.TorusGeometry(1, 0.2, 4, 8), GOLD, [0.13, 0.62, 0.11], [0, 0, 0], { scale: 0.022 });
  glow(put(LF, sph(6, 4), "#ffe08a", [0.13, 0.62, 0.11], [0, 0, 0], { scale: 0.014 }), 2.2);
  put(LF, box(0.09, 0.1, 0.05), T("#7a4a2c"), [0, 0.22, -0.1], [10, 0, 0]);
  const scarfBase = LF.p([0, 0.36, -0.045]);
  ribbon(
    flow([scarfBase.x, scarfBase.y, scarfBase.z], 1.15, 18, 0.12, 0.16, 0.3),
    (t) => 0.075 * (1 - 0.35 * t),
    scarfPaint,
    5,
  );
  put(LF, new THREE.TorusGeometry(1, 0.28, 5, 10), scarfPaint, [0, 0.37, 0], [90, 0, 0], { scale: 0.065 });

  // =============================================================================================================
  // Footprints leading in
  let prev: V = [0.05, 0, 2.0];
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    const cx = 0.05 + 0.45 * t + 0.12 * Math.sin(t * 5);
    const cz = 2.0 - 1.0 * t;
    const hx = cx - prev[0];
    const hz = cz - prev[2];
    const hl = Math.hypot(hx, hz) || 1;
    const side = i % 2 ? 1 : -1;
    const x = cx + (-hz / hl) * 0.05 * side;
    const z = cz + (hx / hl) * 0.05 * side;
    b.part(new THREE.PlaneGeometry(0.06, 0.1), "#ffffff", {
      at: [x, H(x, z) + 0.006, z],
      dir: N(x, z),
      axis: "z",
      up: [hx, 0, hz],
      texture: PRINT,
    });
    prev = [cx, 0, cz];
  }

  // Cloth spirit drifting from the gate and glinting motes
  ribbon(flow([0.2, 1.55, -1.1], 1.3, 16, -0.1, 0.22, 1.1), (t) => 0.07 * (1 - 0.6 * t), scarfPaint, 4);
  for (let i = 0; i < 12; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.4 + rnd() * 1.6;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    glow(b.part(new THREE.OctahedronGeometry(0.012 + rnd() * 0.008, 0), "#ffe9a8", { at: [x, H(x, z) + 0.25 + rnd() * 0.9, z] }), 2);
  }

  return b.root;
}
