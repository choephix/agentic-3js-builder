import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, grain, mix, noise, paint, smoothstep, svg } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Storey Pagoda",
  description:
    "A Japanese temple gotō-no-tō: stone kidan platform, vermilion posts, bracket sets, five curving tiled hip roofs with wind bells, and a bronze-and-gilt sōrin finial with rings, water flames and chains.",
};

type V3 = [number, number, number];
type P2 = [number, number];

const b = createBuilder({ name: "pagoda", paintSize: 2048 });
const PI = Math.PI;
type Fill = Parameters<typeof b.part>[1];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const VERM = "#b3301f";
const VERM_D = "#7f2116";
const GREEN = "#2d6e59";
const CREAM = "#efe7d0";
const GOLD = "#dcab33";
const DARKWOOD = "#3c2419";
const IRON = "#2a2a2e";
const RIDGE = "#707d87";
const FASCIA = "#4a2a22";
const GILT = metal("gilt");
const BRONZE = metal("bronze", { verdigris: 0.55, tarnish: 0.4 });

// ---------------------------------------------------------------------------------------------------------------
// Paints
const LACQUER = paint((p, n) => {
  const t = noise(p, 0.5, 11);
  const base = mix("#b8331f", "#8f2216", t * 0.8);
  return mix(base, "#df5a3c", 0.3 * smoothstep(0.4, 1, n.y));
});

const STONE = paint((p, n) => {
  const big = noise(p, 0.7, 4);
  const fine = noise(p, 0.12, 8);
  let c = mix("#8c897f", "#bab6a6", big * 0.7 + fine * 0.3);
  if (Math.abs(n.y) < 0.5) {
    const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
    const rowH = 0.28;
    const row = Math.floor(p.y / rowH);
    const fu = ((u / 0.9 + (row % 2) * 0.5) % 1 + 1) % 1;
    const fv = ((p.y / rowH) % 1 + 1) % 1;
    if (fu < 0.02 || fv < 0.05) c = mix(c, "#4f4c46", 0.7);
  }
  if (p.y < 0.5) c = mix(c, "#4e6a3c", (1 - p.y / 0.5) * 0.5 * smoothstep(0.4, 0.7, noise(p, 0.5, 3)));
  return mix(c, "#d3cfc0", 0.25 * smoothstep(0.7, 1, n.y));
});

const WOOD = grain("#7a5638", "#563a26", { size: 0.05, axis: "z" });

const plasterPaint = (yb: number, yp: number) =>
  paint((p) => {
    const streak = noise(new THREE.Vector3(p.x * 3 + p.z * 3, p.y * 0.35, 0), 1, 21);
    let c = mix("#f1e9d3", "#d3c4a0", 0.55 * smoothstep(0.5, 0.8, streak));
    const dyb = p.y - yb;
    if (dyb < 0.7) c = mix(c, "#8d7b5f", 0.45 * (1 - dyb / 0.7));
    const dtop = yp + 0.9 - p.y;
    if (dtop < 1.4) c = mix(c, "#9d8d6e", 0.5 * (1 - dtop / 1.4) * smoothstep(0.3, 0.7, streak));
    return c;
  });

const tilePaint = (R: number, seed: number) =>
  paint((p, n) => {
    const ax = Math.abs(p.x);
    const az = Math.abs(p.z);
    const d = Math.max(ax, az);
    const lat = ax > az ? p.z : p.x;
    const wave = Math.abs((((lat / 0.3) % 1) + 1) % 1 - 0.5) * 2;
    const row = ((((R - d) / 0.42) % 1) + 1) % 1;
    let c = mix("#2b343c", "#56636d", smoothstep(0.15, 0.85, wave));
    c = mix(c, "#1b2228", smoothstep(0.82, 1, row) * 0.7);
    c = mix(c, "#7d8a94", 0.22 * smoothstep(0.3, 1, n.y));
    c = mix(c, "#4d6b45", 0.45 * smoothstep(0.62, 0.8, noise(p, 0.9, seed)));
    if (Math.abs(ax - az) < 0.14) c = mix(c, "#7b8892", 0.6);
    return c;
  });

const soffitPaint = (R: number) =>
  paint((p) => {
    const ax = Math.abs(p.x);
    const az = Math.abs(p.z);
    const lat = ax > az ? p.z : p.x;
    const er = R - Math.max(ax, az);
    const rafter = (((lat / 0.34) % 1) + 1) % 1 < 0.42;
    if (rafter) return er < 0.22 ? CREAM : mix("#6b3a27", "#8a5133", noise(p, 0.4, 2));
    return er < 0.22 ? "#4a2a1f" : "#2f1a13";
  });

// ---------------------------------------------------------------------------------------------------------------
// Textures
function doorSvg(): string {
  let s = `<svg viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="130" fill="#2e1710"/>`;
  for (const x0 of [5, 57]) {
    s += `<rect x="${x0}" y="5" width="48" height="120" fill="#a62d1c" stroke="#5a170f" stroke-width="2"/>`;
    for (let r = 0; r < 4; r++) {
      const y = 11 + r * 28;
      s += `<rect x="${x0 + 6}" y="${y}" width="36" height="22" fill="#8c2418" stroke="#4f130c" stroke-width="1.4"/>`;
      for (const cx of [x0 + 9, x0 + 39])
        for (const cy of [y + 3.5, y + 18.5]) s += `<circle cx="${cx}" cy="${cy}" r="1.7" fill="#e2b43c"/>`;
    }
    s += `<rect x="${x0}" y="5" width="48" height="5" fill="#d4a53a"/><rect x="${x0}" y="120" width="48" height="5" fill="#d4a53a"/>`;
    const hx = x0 === 5 ? 46 : 64;
    s += `<circle cx="${hx}" cy="66" r="6" fill="#5a170f" stroke="#e2b43c" stroke-width="2.4"/><circle cx="${hx}" cy="66" r="2.8" fill="#e2b43c"/>`;
  }
  s += `<rect x="51" y="5" width="8" height="120" fill="#5e170e"/><path d="M55 20 l3 6 -3 6 -3 -6z M55 98 l3 6 -3 6 -3 -6z" fill="#e2b43c"/></svg>`;
  return s;
}

function latticeSvg(): string {
  let s = `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="90" fill="#17100c"/>`;
  for (let i = 0; i < 13; i++) {
    const x = 7 + i * 7;
    s += `<rect x="${x}" y="7" width="3.8" height="76" fill="#5b3524"/><rect x="${x + 0.5}" y="7" width="1.1" height="76" fill="#8a5a3a"/>`;
  }
  for (const y of [30, 58]) s += `<rect x="5" y="${y}" width="90" height="4.2" fill="#6a3a26" stroke="#2a150d" stroke-width="0.8"/>`;
  s += `<rect x="2.5" y="2.5" width="95" height="85" fill="none" stroke="#b42f1e" stroke-width="5"/>`;
  for (const [cx, cy] of [[5, 5], [95, 5], [5, 85], [95, 85]]) s += `<circle cx="${cx}" cy="${cy}" r="3" fill="#e0b040"/>`;
  return s + `</svg>`;
}

function ranmaSvg(): string {
  let s = `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="20" fill="#1e3a36"/>`;
  s += `<rect x="1" y="1" width="98" height="18" fill="none" stroke="#b02e1e" stroke-width="2"/>`;
  s += `<path d="M4 10 C14 0 22 0 30 10 S46 20 55 10 S72 0 80 10 S92 18 97 10" fill="none" stroke="#e0b040" stroke-width="2"/>`;
  for (const x of [17, 50, 83]) {
    s += `<ellipse cx="${x - 7}" cy="6" rx="4" ry="2" fill="#4fb08c"/><ellipse cx="${x + 7}" cy="14" rx="4" ry="2" fill="#4fb08c"/>`;
    s += `<circle cx="${x}" cy="10" r="4.4" fill="#e0b040"/><circle cx="${x}" cy="10" r="1.8" fill="#b02e1e"/>`;
  }
  return s + `</svg>`;
}

function karakusaSvg(): string {
  let s = `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="20" fill="#b0301f"/>`;
  s += `<rect y="1.5" width="100" height="1.6" fill="#e0b040"/><rect y="16.9" width="100" height="1.6" fill="#e0b040"/>`;
  s += `<path d="M0 10 Q12 2 25 10 T50 10 T75 10 T100 10" fill="none" stroke="#2f8a6c" stroke-width="2.6"/>`;
  for (const x of [12.5, 37.5, 62.5, 87.5]) {
    s += `<ellipse cx="${x}" cy="5.5" rx="4.5" ry="2.4" fill="#e8f0e0"/><ellipse cx="${x + 12.5}" cy="14.5" rx="4.5" ry="2.4" fill="#4fb08c"/>`;
    s += `<circle cx="${x + 6}" cy="10" r="1.5" fill="#e0b040"/>`;
  }
  return s + `</svg>`;
}

function roundelSvg(): string {
  let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#d6a02e" stroke="#6a4a12" stroke-width="2.5"/><circle cx="50" cy="50" r="40" fill="#2c6d58"/>`;
  for (let k = 0; k < 8; k++)
    s += `<ellipse cx="50" cy="23" rx="7" ry="14" fill="#efe6cc" stroke="#1a3d32" stroke-width="1.5" transform="rotate(${k * 45} 50 50)"/>`;
  s += `<circle cx="50" cy="50" r="12" fill="#b0301f" stroke="#e0b040" stroke-width="2.5"/><circle cx="50" cy="50" r="4.2" fill="#e0b040"/></svg>`;
  return s;
}

const DOOR = svg(doorSvg(), { size: 256 });
const LATTICE = svg(latticeSvg(), { size: 256 });
const RANMA = svg(ranmaSvg(), { size: 256 });
const KARA = svg(karakusaSvg(), { size: 256 });
const ROUNDEL = svg(roundelSvg(), { size: 192 });

// ---------------------------------------------------------------------------------------------------------------
// Placement helpers. Face f looks along +Z (0), +X (1), -Z (2), -X (3).
const onFace = (f: number, u: number, y: number, out: number): V3 => {
  const a = (f * PI) / 2;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return [s * out + c * u, y, c * out - s * u];
};

function faceBox(f: number, u: number, y: number, out: number, w: number, h: number, d: number, color: Fill, texture?: THREE.Texture) {
  return b.part(new THREE.BoxGeometry(w, h, d), color, {
    at: onFace(f, u, y, out),
    rotation: [0, f * 90, 0],
    ...(texture ? { texture } : {}),
  });
}

function facePlane(f: number, u: number, y: number, out: number, w: number, h: number, texture: THREE.Texture) {
  return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: onFace(f, u, y, out), rotation: [0, f * 90, 0], texture });
}

const merged = (list: THREE.BufferGeometry[]) => mergeGeometries(list, false)!;

// ---------------------------------------------------------------------------------------------------------------
// Roof geometry: hipped, concave, with upswept corners
type Roof = { R: number; dIn: number; H: number; dB: number };
const THICK0 = 0.28;
const TADD = 0.6;
const LIFT = 0.9;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const rise = (r: Roof, d: number) => r.H * Math.pow(clamp01((1 - d) / (1 - r.dIn)), 1.45);
const roofY = (r: Roof, x: number, z: number) => {
  const ax = Math.abs(x) / r.R;
  const az = Math.abs(z) / r.R;
  const d = Math.max(ax, az, 1e-4);
  const lo = Math.min(ax, az);
  return rise(r, d) + LIFT * Math.pow(lo / d, 3.5) * Math.pow(d, 6);
};
const underY = (r: Roof, x: number, z: number) => {
  const d = Math.max(Math.abs(x), Math.abs(z)) / r.R;
  return roofY(r, x, z) - THICK0 - TADD * clamp01((1 - d) / (1 - r.dB));
};

function roofSurface(r: Roof, y0: number, fn: (x: number, z: number) => number, up: boolean, n = 16) {
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const x = -r.R + (2 * r.R * i) / n;
      const z = -r.R + (2 * r.R * j) / n;
      pos.push(x, y0 + fn(x, z), z);
      uv.push(i / n, j / n);
    }
  const idx = (i: number, j: number) => j * (n + 1) + i;
  const ind: number[] = [];
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const a = idx(i, j);
      const bb = idx(i + 1, j);
      const c = idx(i, j + 1);
      const d = idx(i + 1, j + 1);
      const same = (i + 0.5 - n / 2) * (j + 0.5 - n / 2) > 0;
      const tris = same
        ? [[a, c, d], [a, d, bb]]
        : [[a, c, bb], [bb, c, d]];
      for (const t of tris) (up ? ind.push(t[0], t[1], t[2]) : ind.push(t[0], t[2], t[1]));
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(ind);
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
}

function fasciaGeo(r: Roof, y0: number, n = 16) {
  const pos: number[] = [];
  const tri = (a: V3, bb: V3, c: V3, o: V3) => {
    const ab = new THREE.Vector3(...bb).sub(new THREE.Vector3(...a));
    const ac = new THREE.Vector3(...c).sub(new THREE.Vector3(...a));
    const cr = ab.cross(ac);
    if (cr.x * o[0] + cr.y * o[1] + cr.z * o[2] < 0) [bb, c] = [c, bb];
    pos.push(...a, ...bb, ...c);
  };
  for (let f = 0; f < 4; f++) {
    const o = onFace(f, 0, 0, 1);
    for (let k = 0; k < n; k++) {
      const u0 = -r.R + (2 * r.R * k) / n;
      const u1 = -r.R + (2 * r.R * (k + 1)) / n;
      const [x0, , z0] = onFace(f, u0, 0, r.R);
      const [x1, , z1] = onFace(f, u1, 0, r.R);
      const t0 = y0 + roofY(r, x0, z0);
      const t1 = y0 + roofY(r, x1, z1);
      tri([x0, t0, z0], [x0, t0 - THICK0, z0], [x1, t1, z1], o);
      tri([x1, t1, z1], [x0, t0 - THICK0, z0], [x1, t1 - THICK0, z1], o);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}

// Tokyo bracket sets, built into three merged lists (arms, blocks, caps)
function bracketSet(
  lists: { arms: THREE.BufferGeometry[]; blocks: THREE.BufferGeometry[]; caps: THREE.BufferGeometry[] },
  tx: number,
  tz: number,
  ang: number,
  yp: number,
  s: number,
) {
  const add = (list: THREE.BufferGeometry[], w: number, h: number, d: number, x: number, y: number, z: number) => {
    const g = new THREE.BoxGeometry(w * s, h * s, d * s);
    g.translate(x * s, y * s, z * s);
    g.rotateY(ang);
    g.translate(tx, yp, tz);
    list.push(g);
  };
  add(lists.arms, 0.24, 0.2, 1.0, 0, 0.12, 0.5);
  add(lists.arms, 1.0, 0.2, 0.24, 0, 0.12, 0);
  add(lists.arms, 0.22, 0.2, 1.3, 0, 0.46, 0.75);
  add(lists.arms, 1.2, 0.18, 0.22, 0, 0.46, 0.95);
  add(lists.blocks, 0.5, 0.3, 0.5, 0, 0.02, 0);
  add(lists.blocks, 0.3, 0.2, 0.3, 0, 0.3, 0.9);
  add(lists.blocks, 0.3, 0.2, 0.3, 0, 0.58, 1.35);
  add(lists.blocks, 0.24, 0.2, 0.24, -0.5, 0.3, 0);
  add(lists.blocks, 0.24, 0.2, 0.24, 0.5, 0.3, 0);
  add(lists.caps, 0.26, 0.22, 0.04, 0, 0.12, 1.02);
  add(lists.caps, 0.24, 0.2, 0.04, 0, 0.46, 1.42);
}

// ---------------------------------------------------------------------------------------------------------------
// Dimensions and stacking
const N = 5;
const R = [6.6, 5.9, 5.2, 4.5, 3.8];
const BW = [3.9, 3.5, 3.1, 2.7, 2.3];
const WH = [4.2, 3.9, 3.7, 3.5, 3.4];
const RH = [1.3, 1.3, 1.3, 1.3, 2.2];
const P = 1.22;
const DECK = P + 0.4;

type Level = { i: number; roof: Roof; yb: number; yp: number; ye: number; top: number };
const levels: Level[] = [];
{
  let yb = DECK;
  for (let i = 0; i < N; i++) {
    const roof: Roof = { R: R[i], dIn: i < N - 1 ? (BW[i + 1] + 0.35) / R[i] : 0.17, H: RH[i], dB: BW[i] / R[i] };
    const yp = yb + WH[i];
    const ye = yp + 0.9 + THICK0 + TADD - rise(roof, roof.dB);
    levels.push({ i, roof, yb, yp, ye, top: ye + RH[i] });
    yb = ye + RH[i] - 0.04;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Stone base
{
  const lower = 9.6;
  const upper = 8.2;
  b.part(new THREE.BoxGeometry(lower * 2, 0.5, lower * 2), STONE, { at: [0, 0.25, 0] });
  b.part(new THREE.BoxGeometry(lower * 2 + 0.3, 0.12, lower * 2 + 0.3), STONE, { at: [0, 0.56, 0] });
  b.part(new THREE.BoxGeometry(upper * 2, 0.6, upper * 2), STONE, { at: [0, 0.8, 0] });
  b.part(new THREE.BoxGeometry(upper * 2 + 0.3, 0.12, upper * 2 + 0.3), STONE, { at: [0, 1.16, 0] });
  for (let f = 0; f < 4; f++) {
    for (let k = 0; k < 3; k++) {
      const top = (k + 1) * 0.207;
      faceBox(f, 0, top / 2, 9.75 + (2 - k) * 0.45 + 0.225, 3.4, top, 0.45, STONE);
      const top2 = 0.62 + (k + 1) * 0.2;
      faceBox(f, 0, (0.55 + top2) / 2, 8.35 + (2 - k) * 0.45 + 0.225, 3.4, top2 - 0.55, 0.45, STONE);
    }
  }
}

// Veranda deck, steps and railing
{
  const Hv = BW[0] + 1.25;
  b.part(new THREE.BoxGeometry(Hv * 2, 0.14, Hv * 2), WOOD, { at: [0, DECK - 0.07, 0] });
  b.part(new THREE.BoxGeometry(Hv * 2 - 0.3, DECK - 0.14 - P + 0.02, Hv * 2 - 0.3), DARKWOOD, { at: [0, (P + DECK - 0.14) / 2, 0] });
  for (let f = 0; f < 4; f++) {
    for (let k = 0; k < 2; k++) {
      const top = P + 0.13 + k * 0.13;
      faceBox(f, 0, (P + top) / 2, Hv + 0.175 + (1 - k) * 0.35, 2.8, top - P, 0.35, WOOD);
    }
    for (const sgn of [1, -1]) {
      const c = (1.4 + Hv) / 2;
      const len = Hv - 1.4;
      faceBox(f, sgn * c, DECK + 0.9, Hv, len, 0.14, 0.14, VERM);
      faceBox(f, sgn * c, DECK + 0.5, Hv, len, 0.1, 0.1, VERM);
    }
  }
  const posts: THREE.BufferGeometry[] = [];
  const caps: THREE.BufferGeometry[] = [];
  const us = [-1.4, 1.4, -2.575, 2.575, -3.86, 3.86, -Hv, Hv];
  for (let f = 0; f < 4; f++)
    for (const u of us) {
      const [x, , z] = onFace(f, u, 0, Hv);
      posts.push(new THREE.CylinderGeometry(0.07, 0.08, 1.0, 6).translate(x, DECK + 0.5, z));
      if (Math.abs(u) === 1.4 || Math.abs(u) === Hv) {
        caps.push(new THREE.SphereGeometry(0.12, 6, 5).scale(1, 1.3, 1).translate(x, DECK + 1.1, z));
      }
    }
  b.part(merged(posts), VERM, { at: [0, 0, 0] });
  b.part(merged(caps), GILT, { at: [0, 0, 0] });
}

// ---------------------------------------------------------------------------------------------------------------
// Storeys
const tips: V3[] = [];

function windBell(x: number, y: number, z: number) {
  const outline: P2[] = [[0, 0.3], [0.05, 0.31], [0.11, 0.25], [0.17, 0.1], [0.21, -0.1], [0.23, -0.14], [0.17, -0.14], [0.15, -0.1], [0, -0.08]];
  b.lathe(outline, { at: [x, y, z], segments: 8, color: BRONZE });
  b.rod([x, y + 0.31, z], [x, y + 0.6, z], 0.012, IRON);
}

for (const L of levels) {
  const i = L.i;
  const B = BW[i];
  const bw = (2 * B) / 3;
  const r = L.roof;

  // Core wall
  const coreTop = L.yp + 0.9;
  b.part(new THREE.BoxGeometry(2 * (B - 0.03), coreTop - L.yb, 2 * (B - 0.03)), plasterPaint(L.yb, L.yp), {
    at: [0, (L.yb + coreTop) / 2, 0],
  });

  // Posts
  for (let f = 0; f < 4; f++)
    for (const u of [-B, -B / 3, B / 3]) {
      const [x, , z] = onFace(f, u, 0, B);
      b.part(new THREE.CylinderGeometry(0.16, 0.18, L.yp - L.yb, 8), LACQUER, { at: [x, (L.yb + L.yp) / 2, z] });
      if (i === 0) b.part(new THREE.CylinderGeometry(0.27, 0.31, 0.16, 8), STONE, { at: [x, L.yb + 0.06, z] });
    }

  // Faces
  for (let f = 0; f < 4; f++) {
    for (const u of [-bw, 0, bw]) faceBox(f, u, L.yp - 0.25, B + 0.01, bw - 0.36, 0.5, 0.34, "#ffffff", KARA);
    faceBox(f, 0, L.yp + 0.1, B, 2 * B + 0.5, 0.2, 0.46, VERM_D);
    faceBox(f, 0, L.yb + 0.28, B + 0.02, 2 * B, 0.3, 0.32, VERM_D);

    const y0c = i === 0 ? L.yb + 0.5 : L.yb + 0.85;
    const ow = i === 0 ? bw - 0.5 : bw - 0.45;
    const oh = L.yp - 1.05 - y0c;
    faceBox(f, 0, y0c + oh / 2, B - 0.02, ow + 0.2, oh + 0.1, 0.2, DARKWOOD);
    facePlane(f, 0, y0c + oh / 2, B + 0.085, ow, oh, i === 0 ? DOOR : LATTICE);
    const yR = L.yp - 0.76;
    faceBox(f, 0, yR, B - 0.02, ow + 0.2, 0.46, 0.1, DARKWOOD);
    facePlane(f, 0, yR, B + 0.035, ow + 0.2, 0.46, RANMA);

    const dia = Math.min(1.0, bw * 0.52);
    for (const u of [-bw, bw]) {
      b.part(new THREE.CircleGeometry(dia / 2, 14), "#ffffff", {
        at: onFace(f, u, L.yb + (WH[i] - 0.5) * 0.5 + 0.1, B - 0.02),
        rotation: [0, f * 90, 0],
        texture: ROUNDEL,
      });
    }
  }

  // Bracket sets
  {
    const lists = { arms: [] as THREE.BufferGeometry[], blocks: [] as THREE.BufferGeometry[], caps: [] as THREE.BufferGeometry[] };
    for (let f = 0; f < 4; f++)
      for (const u of [-B / 3, B / 3]) {
        const [x, , z] = onFace(f, u, 0, B);
        bracketSet(lists, x, z, (f * PI) / 2, L.yp, 1);
      }
    for (const sx of [1, -1])
      for (const sz of [1, -1]) bracketSet(lists, sx * B, sz * B, Math.atan2(sx, sz), L.yp, 1.4);
    b.part(merged(lists.arms), VERM, { at: [0, 0, 0] });
    b.part(merged(lists.blocks), GREEN, { at: [0, 0, 0] });
    b.part(merged(lists.caps), CREAM, { at: [0, 0, 0] });
  }

  // Roof
  b.part(roofSurface(r, L.ye, (x, z) => roofY(r, x, z), true), tilePaint(r.R, 30 + i), { at: [0, 0, 0] });
  b.part(roofSurface(r, L.ye, (x, z) => underY(r, x, z), false), soffitPaint(r.R), { at: [0, 0, 0] });
  b.part(fasciaGeo(r, L.ye), FASCIA, { at: [0, 0, 0] });

  // Round eave tile ends
  {
    const discs: THREE.BufferGeometry[] = [];
    const m = 14;
    for (let f = 0; f < 4; f++)
      for (let k = 0; k < m; k++) {
        const u = -r.R + ((k + 0.5) * 2 * r.R) / m;
        const [x, , z] = onFace(f, u, 0, r.R + 0.03);
        const y = L.ye + roofY(r, x, z) - 0.02;
        const g = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8).rotateX(PI / 2);
        g.rotateY((f * PI) / 2);
        g.translate(x, y, z);
        discs.push(g);
      }
    b.part(merged(discs), CREAM, { at: [0, 0, 0] });
  }

  // Hip ridges, tip ornaments, wind bells
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const pts: V3[] = [];
      for (let k = 0; k <= 8; k++) {
        const d = 1 - ((1 - r.dIn) * k) / 8;
        const x = sx * d * r.R;
        const z = sz * d * r.R;
        pts.push([x, L.ye + roofY(r, x, z) + 0.06, z]);
      }
      b.sweep(catmull(pts), 0.13, { color: RIDGE, sides: 6, smooth: false, caps: "round" });

      const tipY = L.ye + roofY(r, sx * r.R, sz * r.R);
      if (i === N - 1) tips.push([sx * r.R, tipY + 0.1, sz * r.R]);
      const dir = new THREE.Vector3(sx * 0.8, 0.6, sz * 0.8).normalize();
      const at = new THREE.Vector3(sx * (r.R + 0.02), tipY + 0.12, sz * (r.R + 0.02));
      b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.1, 12), GOLD, { at: at.toArray(), dir: dir.toArray() });
      b.part(new THREE.CircleGeometry(0.22, 12), "#ffffff", {
        at: at.clone().addScaledVector(dir, 0.056).toArray(),
        dir: dir.toArray(),
        axis: "z",
        texture: ROUNDEL,
      });
      windBell(sx * (r.R - 0.15), tipY - THICK0 - 0.65, sz * (r.R - 0.15));
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Sōrin finial
{
  const fy = levels[N - 1].top;
  b.part(new THREE.BoxGeometry(1.3, 0.24, 1.3), BRONZE, { at: [0, fy + 0.1, 0] });
  const bowl: P2[] = [[0, 0], [0.62, 0], [0.6, 0.1], [0.5, 0.28], [0.28, 0.42], [0, 0.48]];
  b.lathe(bowl, { at: [0, fy + 0.22, 0], segments: 10, color: BRONZE });
  const lotus: P2[] = [[0, 0], [0.14, 0], [0.3, 0.08], [0.48, 0.28], [0.5, 0.34], [0.38, 0.32], [0.2, 0.2], [0.1, 0.18], [0, 0.18]];
  b.lathe(lotus, { at: [0, fy + 0.7, 0], segments: 10, color: GILT });
  b.rod([0, fy + 0.2, 0], [0, fy + 5.2, 0], 0.085, BRONZE);

  const rings: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 9; k++) {
    rings.push(new THREE.TorusGeometry(0.58 - k * 0.025, 0.045, 4, 14).rotateX(PI / 2).translate(0, fy + 1.25 + k * 0.3, 0));
  }
  b.part(merged(rings), GILT, { at: [0, 0, 0] });

  const FLAME: P2[] = [[-0.3, 0], [0.3, 0], [0.38, 0.3], [0.2, 0.6], [0.05, 1.0], [-0.15, 0.7], [-0.32, 0.4]];
  const flame = FLAME.map(([x, y]) => [x * 0.85, y * 0.85] as P2);
  b.extrude(flame, { at: [0, fy + 3.95, 0], x: [1, 0, 0], thickness: 0.07, color: GILT });
  b.extrude(flame, { at: [0, fy + 3.95, 0], x: [0, 0, 1], thickness: 0.07, color: GILT });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), GILT, { at: [0, fy + 4.95, 0], scale: [1, 0.8, 1] });
  const jewel: P2[] = [[0, 0], [0.12, 0.02], [0.2, 0.12], [0.2, 0.25], [0.1, 0.42], [0, 0.62]];
  glow(b.lathe(jewel, { at: [0, fy + 5.05, 0], segments: 8, color: "#ffd36a" }), 0.9);

  for (const t of tips) b.rod([0, fy + 3.9, 0], t, 0.03, IRON);
}

export default function build() {
  return b.root;
}
