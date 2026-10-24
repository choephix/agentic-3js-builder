import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  paint,
  mix,
  noise,
  smoothstep,
  grain,
  countershade,
  svg,
  bezier,
  catmull,
} from "../../../../src/index";
import type { Builder, ColorInput, Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Five-storey pagoda",
  description:
    "A Japanese temple gojū-no-tō: stone platform, five vermilion-and-plaster storeys with bracket-complex eaves, up-swept tiled hip roofs, wind bells, lanterns and a bronze sorin finial with chains.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const fract = (x: number) => x - Math.floor(x);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);

/** Transform a geometry in place: position, then yaw (ry) / pitch (rx) / roll (rz) in radians. */
function put<G extends THREE.BufferGeometry>(g: G, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0): G {
  _e.set(rx, ry, rz, "YXZ");
  _q.setFromEuler(_e);
  _m.compose(_p.set(x, y, z), _q, _s);
  g.applyMatrix4(_m);
  return g;
}

/** Face-local (right, outward) to world (x, z). Face 0 looks +Z, faces turn a quarter each. */
function fp(k: number, lx: number, lz: number): [number, number] {
  const a = (k * Math.PI) / 2;
  const c = Math.round(Math.cos(a));
  const s = Math.round(Math.sin(a));
  return [lx * c + lz * s, -lx * s + lz * c];
}

function latheGeo(pts: [number, number][], seg = 10) {
  return new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );
}

function xyz(a: unknown): [number, number, number] {
  const q = a as { x?: number; y?: number; z?: number } & number[];
  return Array.isArray(a) ? [q[0], q[1], q[2]] : [q.x as number, q.y as number, q.z as number];
}

/** Collects many small primitives and merges them into one part per (colour, texture). */
class Bag {
  private groups = new Map<ColorInput, Map<THREE.Texture | null, THREE.BufferGeometry[]>>();
  private n = 0;
  constructor(
    private b: Builder,
    private tag: string,
  ) {}

  add(color: ColorInput, g: THREE.BufferGeometry, tex: THREE.Texture | null = null) {
    let byTex = this.groups.get(color);
    if (!byTex) this.groups.set(color, (byTex = new Map()));
    let list = byTex.get(tex);
    if (!list) byTex.set(tex, (list = []));
    list.push(g);
  }
  box(color: ColorInput, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rx = 0) {
    this.add(color, put(new THREE.BoxGeometry(w, h, d), x, y, z, ry, rx));
  }
  cyl(color: ColorInput, rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number) {
    this.add(color, put(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z));
  }
  ball(color: ColorInput, r: number, x: number, y: number, z: number) {
    this.add(color, put(new THREE.SphereGeometry(r, 6, 4), x, y, z));
  }
  /** Box in face-local coordinates: lx along the face, lz out from the centre. */
  fbox(color: ColorInput, k: number, w: number, h: number, d: number, lx: number, y: number, lz: number) {
    const [x, z] = fp(k, lx, lz);
    this.box(color, w, h, d, x, y, z, (k * Math.PI) / 2);
  }
  fplane(tex: THREE.Texture, k: number, w: number, h: number, lx: number, y: number, lz: number) {
    const [x, z] = fp(k, lx, lz);
    this.add("#ffffff", put(new THREE.PlaneGeometry(w, h), x, y, z, (k * Math.PI) / 2), tex);
  }
  fdisc(tex: THREE.Texture, k: number, r: number, lx: number, y: number, lz: number) {
    const [x, z] = fp(k, lx, lz);
    this.add("#ffffff", put(new THREE.CircleGeometry(r, 8), x, y, z, (k * Math.PI) / 2), tex);
  }
  flush() {
    for (const [color, byTex] of this.groups)
      for (const [tex, geos] of byTex) {
        const g = geos.length === 1 ? geos[0] : mergeGeometries(geos);
        if (!g) throw new Error(`Bag ${this.tag}: could not merge`);
        this.b.part(g, color, {
          at: [0, 0, 0],
          texture: tex ?? undefined,
          name: `${this.tag}.${this.n++}`,
        });
      }
    this.groups.clear();
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const CREAM = "#f0e6c8";
const GREEN = "#2f8a74";
const DARK = "#1d120c";
const IRON = "#2b2a30";
const RIDGE = "#252c33";
const COPING = "#b9b5a7";
const TAG = "#f4efe2";
const STONE_D = "#4b4842";

const RED = countershade(grain("#cc3820", "#a82a16", { size: 0.05, axis: "y" }), "#7e1d10", {
  level: -0.3,
  soft: 0.5,
});
const WOOD_D = grain("#523320", "#3b2316", { size: 0.06, axis: "y" });
const BRONZE = metal("bronze", { verdigris: 0.55, tarnish: 0.5 });
const GILT = metal("gilt");

const PLASTER = paint((p, _n) => {
  const t = noise(p, 0.8, 11);
  const c = mix("#f4edd9", "#e3d8bd", t);
  const st = smoothstep(0.62, 0.85, noise(new THREE.Vector3(p.x * 3, p.y * 0.35, p.z * 3), 0.6, 13));
  return mix(c, "#b9ad92", st * 0.5);
});

const STONE = paint((p, n) => {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  let c: Rgb = mix("#7b776d", "#a6a295", noise(p, 0.45, 4));
  let line: boolean;
  if (ay >= ax && ay >= az) {
    const row = Math.floor(p.z / 0.9);
    const uu = p.x / 1.2 + (row & 1) * 0.5;
    line = fract(uu) < 0.03 || fract(p.z / 0.9) < 0.04;
  } else {
    const u = ax >= az ? p.z : p.x;
    const row = Math.floor(p.y / 0.26);
    const uu = u / 0.85 + (row & 1) * 0.5;
    line = fract(uu) < 0.03 || fract(p.y / 0.26) < 0.05;
  }
  if (line) c = mix(c, "#3c3934", 0.7);
  if (p.y < 0.3 && noise(p, 0.2, 8) > 0.55) c = mix(c, "#56703c", 0.55);
  return c;
});

function tilePaint(Rr: number) {
  return paint((p, n) => {
    const u = Math.abs(p.x);
    const v = Math.abs(p.z);
    const d = Math.max(u, v);
    const along = u > v ? p.z : p.x;
    if (n.y < -0.5) {
      // rafters under the eave
      if (fract(along / 0.22) < 0.18) return "#3d1d12";
      return d > Rr - 0.4 ? "#efe4c6" : "#a02e1b";
    }
    if (n.y < 0.5) {
      // fascia board
      return mix("#efe3c4", "#cfc3a4", noise(p, 0.3, 2));
    }
    let c: Rgb = mix("#363f48", "#56626d", noise(p, 0.4, 7));
    const k = fract(along / 0.2);
    const course = fract(d / 0.32);
    if (k < 0.1 || k > 0.93) c = mix(c, "#1c2228", 0.75);
    else if (course < 0.07) c = mix(c, "#1c2228", 0.45);
    if (noise(p, 0.5, 19) > 0.68) c = mix(c, "#4f6b3a", 0.5);
    if (d > Rr - 0.28) c = mix(c, "#232a31", 0.5);
    if (Math.abs(u - v) < 0.14) c = mix(c, "#222a31", 0.6);
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)

const DOOR = svg(
  `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="120" fill="#2a160e"/>
  <rect x="3" y="3" width="74" height="27" fill="#150b07"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${6 + i * 8}" y="4" width="3" height="25" fill="#c89a5c"/>`).join("")}
  <rect x="3" y="14" width="74" height="3" fill="#c89a5c"/>
  <rect x="3" y="33" width="36" height="84" fill="#b52b1b"/>
  <rect x="41" y="33" width="36" height="84" fill="#b52b1b"/>
  ${[12, 21, 30, 48, 57, 66].map((x) => `<rect x="${x}" y="33" width="1" height="84" fill="#8f1d12"/>`).join("")}
  <rect x="3" y="45" width="74" height="5" fill="#7c1a10"/>
  <rect x="3" y="96" width="74" height="5" fill="#7c1a10"/>
  ${[9, 17, 25, 33, 47, 55, 63, 71].map((x) => `<circle cx="${x}" cy="47.5" r="1.8" fill="#e8be4d"/><circle cx="${x}" cy="98.5" r="1.8" fill="#e8be4d"/>`).join("")}
  <circle cx="35" cy="76" r="4.5" fill="#1a0d08"/><circle cx="35" cy="76" r="3" fill="none" stroke="#e8be4d" stroke-width="1.6"/>
  <circle cx="45" cy="76" r="4.5" fill="#1a0d08"/><circle cx="45" cy="76" r="3" fill="none" stroke="#e8be4d" stroke-width="1.6"/>
</svg>`,
  { size: 384 },
);

const LATTICE = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="80" fill="#b52b1b"/>
  <rect x="5" y="5" width="50" height="70" fill="#120a06"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${8 + i * 7}" y="5" width="3.5" height="70" fill="#d2a46a"/>`).join("")}
  <rect x="5" y="37" width="50" height="3.5" fill="#d2a46a"/>
</svg>`,
  { size: 256 },
);

const LOTUS = svg(
  `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="90" fill="#b52b1b"/>
  <rect x="4" y="4" width="52" height="82" fill="#f2e8cc"/>
  <path d="M6 76 q6 -5 12 0 t12 0 t12 0 t12 0" stroke="#4a8a9a" stroke-width="1.6" fill="none"/>
  <path d="M6 82 q6 -5 12 0 t12 0 t12 0 t12 0" stroke="#4a8a9a" stroke-width="1.6" fill="none"/>
  <ellipse cx="15" cy="68" rx="12" ry="5" fill="#3f8f5a"/>
  <ellipse cx="46" cy="70" rx="11" ry="4.5" fill="#3f8f5a"/>
  <path d="M30 68 Q31 55 30 42" stroke="#2f6f46" stroke-width="3" fill="none"/>
  <g transform="translate(30 40)">
    <ellipse cx="0" cy="-12" rx="6" ry="14" transform="rotate(-62)" fill="#ee7fa0" stroke="#8a2d48" stroke-width="1.2"/>
    <ellipse cx="0" cy="-12" rx="6" ry="14" transform="rotate(62)" fill="#ee7fa0" stroke="#8a2d48" stroke-width="1.2"/>
    <ellipse cx="0" cy="-12" rx="6" ry="14" transform="rotate(-30)" fill="#f6a3bb" stroke="#8a2d48" stroke-width="1.2"/>
    <ellipse cx="0" cy="-12" rx="6" ry="14" transform="rotate(30)" fill="#f6a3bb" stroke="#8a2d48" stroke-width="1.2"/>
    <ellipse cx="0" cy="-13" rx="6" ry="15" fill="#ffd7e0" stroke="#8a2d48" stroke-width="1.2"/>
    <circle cx="0" cy="0" r="3" fill="#e8be4d"/>
  </g>
</svg>`,
  { size: 256 },
);

const FRIEZE = svg(
  `<svg viewBox="0 0 320 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="20" fill="#1d5a4a"/>
  <rect y="0" width="320" height="2.5" fill="#b52b1b"/>
  <rect y="17.5" width="320" height="2.5" fill="#b52b1b"/>
  ${Array.from({ length: 16 }, (_, i) => {
    const x = i * 20;
    return `<path d="M${x} 10 q5 -7 10 0 t10 0" stroke="#f2e8cc" stroke-width="1.6" fill="none"/><circle cx="${x + 10}" cy="6.2" r="1.8" fill="#e8be4d"/><circle cx="${x + 10}" cy="13.8" r="1.3" fill="#e8be4d"/>`;
  }).join("")}
</svg>`,
  { size: 1024 },
);

const TOMOE = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" fill="#262d34"/>
  <circle cx="20" cy="20" r="17" fill="#3a444d" stroke="#8b98a3" stroke-width="2"/>
  ${[0, 120, 240].map((a) => `<g transform="translate(20 20) rotate(${a})"><circle cx="0" cy="-8" r="3.8" fill="#c3ccd3"/><path d="M-3.6 -9.5 Q-10 -3 -5 5 Q-6.5 -2 -1.5 -5.5Z" fill="#c3ccd3"/></g>`).join("")}
</svg>`,
  { size: 96 },
);

const wheel = (cx: number, cy: number, r: number, col: string, sw: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}"/>` +
  Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + r * Math.cos(a)).toFixed(2)}" y2="${(cy + r * Math.sin(a)).toFixed(2)}" stroke="${col}" stroke-width="${sw * 0.8}"/>`;
  }).join("") +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="${col}"/>`;

const LANTERN = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="64" fill="#d62a1a"/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 8}" y="0" width="1.6" height="64" fill="#a31c10"/>`).join("")}
  <rect y="0" width="128" height="7" fill="#1b100b"/>
  <rect y="57" width="128" height="7" fill="#1b100b"/>
  <circle cx="32" cy="32" r="16" fill="#f6efdc"/>
  <circle cx="96" cy="32" r="16" fill="#f6efdc"/>
  ${wheel(32, 32, 11, "#1b0f0a", 2)}${wheel(96, 32, 11, "#1b0f0a", 2)}
</svg>`,
  { size: 256 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 100 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="48" fill="#d9a935"/>
  <rect x="3" y="3" width="94" height="42" fill="#16302a"/>
  ${wheel(50, 24, 14, "#e8be4d", 3)}
  ${[-1, 1].map((s) => `<g transform="translate(${50 + s * 30} 24)"><ellipse cx="0" cy="-6" rx="4" ry="9" fill="#f6a3bb" transform="rotate(${-25 * s})"/><ellipse cx="0" cy="-6" rx="4" ry="9" fill="#ee7fa0" transform="rotate(${25 * s})"/><ellipse cx="0" cy="-7" rx="4" ry="10" fill="#ffd7e0"/></g>`).join("")}
</svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------
// Proportions

const NS = 5;
const W = [2.7, 2.5, 2.3, 2.1, 1.9]; // half width of each storey body
const BH = [3.7, 3.1, 2.9, 2.7, 2.5]; // body heights
const OVER = 2.0; // eave overhang past the body
const BRK = 0.6; // bracket zone height
const RISE = [1.6, 1.5, 1.45, 1.4, 1.35];
const LIFT = 0.85; // corner up-sweep
const THICK = 0.32; // roof edge thickness
const R = W.map((w) => w + OVER);

/** Height of the roof's top surface above the eave plane at Chebyshev radius r (0..1), corner factor t (0..1). */
const topH = (i: number, r: number, t: number) =>
  THICK + RISE[i] * Math.pow(Math.max(1 - r, 0), 1.35) + LIFT * t ** 3 * r ** 4;
const lowH = (r: number, t: number) => LIFT * t ** 3 * r ** 4;

// storey layout
const y0: number[] = [];
const yB: number[] = [];
const yb: number[] = [];
{
  let base = 1.15;
  for (let i = 0; i < NS; i++) {
    y0[i] = base;
    yB[i] = base + BH[i];
    yb[i] = yB[i] + BRK;
    if (i < NS - 1) base = yb[i] + topH(i, W[i + 1] / R[i], 0) - 0.1;
  }
}

function roofGeometry(i: number): THREE.BufferGeometry {
  const Rr = R[i];
  const n = 16;
  const top: THREE.Vector3[][] = [];
  const bot: THREE.Vector3[][] = [];
  for (let a = 0; a <= n; a++) {
    top.push([]);
    bot.push([]);
    for (let c = 0; c <= n; c++) {
      const u = -1 + (2 * a) / n;
      const v = -1 + (2 * c) / n;
      const au = Math.abs(u);
      const av = Math.abs(v);
      const r = Math.max(au, av);
      const t = r > 1e-6 ? Math.min(au, av) / r : 0;
      top[a].push(new THREE.Vector3(u * Rr, topH(i, r, t), v * Rr));
      bot[a].push(new THREE.Vector3(u * Rr, lowH(r, t), v * Rr));
    }
  }
  const pos: number[] = [];
  const uv: number[] = [];
  const tri = (A: THREE.Vector3, B: THREE.Vector3, C: THREE.Vector3, hint: THREE.Vector3) => {
    const nn = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A));
    const ord = nn.dot(hint) >= 0 ? [A, B, C] : [A, C, B];
    for (const q of ord) {
      pos.push(q.x, q.y, q.z);
      uv.push(q.x / (2 * Rr) + 0.5, q.z / (2 * Rr) + 0.5);
    }
  };
  const UP = new THREE.Vector3(0, 1, 0);
  const DOWN = new THREE.Vector3(0, -1, 0);
  const half = n / 2;
  for (let a = 0; a < n; a++)
    for (let c = 0; c < n; c++) {
      const same = a < half === c < half;
      for (const [grid, hint] of [
        [top, UP],
        [bot, DOWN],
      ] as [THREE.Vector3[][], THREE.Vector3][]) {
        const p00 = grid[a][c];
        const p10 = grid[a + 1][c];
        const p01 = grid[a][c + 1];
        const p11 = grid[a + 1][c + 1];
        if (same) {
          tri(p00, p10, p11, hint);
          tri(p00, p11, p01, hint);
        } else {
          tri(p00, p10, p01, hint);
          tri(p10, p11, p01, hint);
        }
      }
    }
  const loop: [number, number][] = [];
  for (let a = 0; a < n; a++) loop.push([a, 0]);
  for (let c = 0; c < n; c++) loop.push([n, c]);
  for (let a = n; a > 0; a--) loop.push([a, n]);
  for (let c = n; c > 0; c--) loop.push([0, c]);
  for (let k = 0; k < loop.length; k++) {
    const [a1, c1] = loop[k];
    const [a2, c2] = loop[(k + 1) % loop.length];
    const tA = top[a1][c1];
    const tB = top[a2][c2];
    const bA = bot[a1][c1];
    const bB = bot[a2][c2];
    const hint = new THREE.Vector3((tA.x + tB.x) / 2, 0, (tA.z + tB.z) / 2);
    tri(tA, tB, bB, hint);
    tri(tA, bB, bA, hint);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** One bracket cluster (tokyo) on a pillar head: stepped arms, blocks and painted tips. */
function bracket(bag: Bag, k: number, lx: number, yBase: number, w: number, big: boolean) {
  const L1 = big ? 1.0 : 0.8;
  const L2 = big ? 1.6 : 1.25;
  bag.fbox(CREAM, k, 0.36, 0.14, 0.36, lx, yBase + 0.25, w + 0.02);
  const s1 = w - 0.05;
  const e1 = w + L1;
  bag.fbox(RED, k, 0.2, 0.14, e1 - s1, lx, yBase + 0.25, (s1 + e1) / 2);
  bag.fbox(CREAM, k, 0.3, 0.12, 0.3, lx, yBase + 0.25, e1 - 0.05);
  const s2 = w + 0.25;
  const e2 = w + L2;
  bag.fbox(RED, k, 0.2, 0.14, e2 - s2, lx, yBase + 0.38, (s2 + e2) / 2);
  bag.fbox(CREAM, k, 0.32, 0.12, 0.32, lx, yBase + 0.38, e2 - 0.1);
  bag.fbox(GREEN, k, 0.22, 0.13, 0.03, lx, yBase + 0.38, e2 + 0.015);
  if (big) bag.fbox(CREAM, k, 0.3, 0.1, 0.3, lx, yBase + 0.5, e2 - 0.35);
}

function railing(bag: Bag, Wd: number, yd: number, gap: number) {
  const n = Math.round((2 * Wd) / 1.0);
  const step = (2 * Wd) / n;
  const lz = Wd - 0.1;
  for (let k = 0; k < 4; k++)
    for (let j = 0; j < n; j++) {
      const a = -Wd + j * step;
      const bb = a + step;
      const mid = (a + bb) / 2;
      if (gap > 0 && k === 0 && Math.abs(mid) < gap) continue;
      bag.fbox(RED, k, step + 0.12, 0.09, 0.1, mid, yd + 0.95, lz);
      bag.fbox(RED, k, step, 0.06, 0.06, mid, yd + 0.55, lz);
      bag.fbox(RED, k, step, 0.07, 0.07, mid, yd + 0.2, lz);
      bag.fbox(RED, k, 0.05, 0.55, 0.05, mid, yd + 0.55, lz);
      for (const lxp of [a, bb]) {
        const [x, z] = fp(k, lxp, lz);
        bag.box(RED, 0.13, 1.0, 0.13, x, yd + 0.5, z);
        bag.ball(GILT, 0.095, x, yd + 1.08, z);
      }
    }
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "pagoda", paintSize: 2048 });

  // ------------------------------------------------------------------ stone platform and stairs
  {
    const plat = new Bag(b, "platform");
    plat.box(STONE, 13.4, 0.4, 13.4, 0, 0.2, 0);
    plat.box(STONE, 12.4, 0.4, 12.4, 0, 0.6, 0);
    plat.box(COPING, 12.7, 0.1, 12.7, 0, 0.85, 0);
    for (let j = 0; j < 3; j++) {
      const top = 0.675 - j * 0.225;
      const z = 6.2 + 0.25 + j * 0.5;
      plat.box(STONE, 3.4, top, 0.5, 0, top / 2, z);
      for (const s of [1, -1]) plat.box(STONE, 0.32, top + 0.18, 0.5, s * 1.86, (top + 0.18) / 2, z);
    }
    // wooden steps up to the veranda
    const Wd0 = W[0] + 0.9;
    plat.box(WOOD_D, 2.6, 0.25, 0.5, 0, 1.025, Wd0 + 0.25);
    plat.box(WOOD_D, 2.6, 0.13, 0.5, 0, 0.965, Wd0 + 0.75);
    plat.flush();
  }

  // ------------------------------------------------------------------ storeys
  const BELL = latheGeo(
    [
      [0, -0.12],
      [0.12, -0.17],
      [0.16, -0.17],
      [0.14, -0.12],
      [0.1, 0.02],
      [0.07, 0.12],
      [0.04, 0.17],
      [0, 0.17],
    ],
    8,
  );

  for (let i = 0; i < NS; i++) {
    const w = W[i];
    const h = BH[i];
    const Y0 = y0[i];
    const YB = yB[i];
    const Yb = yb[i];
    const Rr = R[i];
    const bag = new Bag(b, `storey${i}`);

    // deck block and railing
    const Wd = w + (i === 0 ? 0.9 : 0.75);
    const deckTop = Y0 + 0.12;
    const deckBottom = i === 0 ? 0.9 : yb[i - 1] + topH(i - 1, Wd / R[i - 1], 0) - 0.15;
    bag.box(WOOD_D, 2 * Wd, deckTop - deckBottom, 2 * Wd, 0, (deckTop + deckBottom) / 2, 0);
    bag.box(RED, 2 * Wd + 0.1, 0.1, 2 * Wd + 0.1, 0, deckTop - 0.05, 0);
    railing(bag, Wd, deckTop, i === 0 ? 1.3 : 0);

    // pillars
    for (let k = 0; k < 4; k++)
      for (const lx of [-w, -w / 3, w / 3]) {
        const [x, z] = fp(k, lx, w);
        bag.cyl(STONE_D, 0.25, 0.28, 0.14, 8, x, deckTop + 0.07, z);
        bag.cyl(RED, 0.17, 0.17, YB - deckTop, 8, x, (YB + deckTop) / 2, z);
      }

    // plaster walls, sill and tie beams, frieze
    bag.box(PLASTER, 2 * (w - 0.08), YB - (Y0 + 0.2), 2 * (w - 0.08), 0, (Y0 + 0.2 + YB) / 2, 0);
    const bw = (2 * w) / 3 - 0.42;
    const wallMid = (Y0 + 0.2 + YB - 0.5) / 2;
    for (let k = 0; k < 4; k++) {
      bag.fbox(RED, k, 2 * w + 0.2, 0.16, 0.22, 0, Y0 + 0.28, w - 0.02);
      bag.fbox(RED, k, 2 * w + 0.2, 0.18, 0.26, 0, YB - 0.41, w + 0.01);
      bag.fplane(FRIEZE, k, 2 * w - 0.2, 0.3, 0, YB - 0.17, w - 0.04);
      const zo = w - 0.05;
      if (i === 0) {
        bag.fplane(DOOR, k, bw, h - 1.35, 0, Y0 + 0.2 + (h - 1.35) / 2, zo);
        for (const s of [1, -1]) {
          bag.fplane(LATTICE, k, bw * 0.75, 1.3, (s * 2 * w) / 3, wallMid + 0.1, zo);
          bag.fbox(RED, k, bw * 0.75 + 0.14, 0.07, 0.14, (s * 2 * w) / 3, wallMid + 0.1 - 0.68, w - 0.02);
        }
        if (k === 0) {
          bag.fplane(PLAQUE, k, 1.1, 0.4, 0, Y0 + 2.85, zo);
          bag.fbox(RED, k, 1.2, 0.05, 0.1, 0, Y0 + 2.62, w - 0.02);
        }
      } else {
        bag.fplane(LATTICE, k, bw * 0.85, h - 1.5, 0, wallMid, zo);
        bag.fbox(RED, k, bw * 0.85 + 0.14, 0.07, 0.14, 0, wallMid - (h - 1.5) / 2 - 0.04, w - 0.02);
        for (const s of [1, -1]) bag.fplane(LOTUS, k, bw * 0.7, (bw * 0.7 * 90) / 60, (s * 2 * w) / 3, wallMid, zo);
      }
    }

    // bracket complexes
    for (let k = 0; k < 4; k++) {
      bag.fbox(RED, k, 2 * w + 0.4, 0.18, 0.36, 0, YB + 0.09, w);
      bag.fbox(RED, k, 2 * (w + 1.5) + 0.3, 0.15, 0.2, 0, YB + 0.5, w + 1.5);
      for (const lx of [-w, -w / 3, w / 3, w]) bracket(bag, k, lx, YB, w, true);
      for (const lx of [(-2 * w) / 3, 0, (2 * w) / 3]) bracket(bag, k, lx, YB, w, false);
    }
    for (const [sx, sz] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const yaw = Math.atan2(sx, sz);
      // lower and upper diagonal corner arms
      bag.box(RED, 0.22, 0.15, 1.9, sx * (w + 0.7), YB + 0.24, sz * (w + 0.7), yaw, -0.14);
      bag.box(RED, 0.22, 0.15, 2.3, sx * (w + 0.85), YB + 0.4, sz * (w + 0.85), yaw, -0.16);
      const ex = w + 1.65;
      bag.box(CREAM, 0.34, 0.14, 0.34, sx * ex, YB + 0.6, sz * ex, yaw);
      bag.box(GREEN, 0.24, 0.14, 0.03, sx * (ex + 0.1), YB + 0.6, sz * (ex + 0.1), yaw);
      // corner post carrying the up-swept eave
      const r = (ex + 0.1) / Rr;
      const roofLow = Yb + lowH(r, 1);
      const postBottom = YB + 0.66;
      bag.box(RED, 0.16, roofLow - postBottom + 0.05, 0.16, sx * ex, (roofLow + postBottom) / 2, sz * ex);
    }

    // roof
    b.part(roofGeometry(i), tilePaint(Rr), { at: [0, Yb, 0], name: `roof${i}` });
    for (const [sx, sz] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const pts: number[][] = [];
      for (let j = 0; j <= 8; j++) {
        const s = 0.05 + (0.95 * j) / 8;
        pts.push([sx * s * Rr, Yb + topH(i, s, 1) + 0.07, sz * s * Rr]);
      }
      b.sweep(catmull(pts), (t: number) => 0.09 + 0.07 * t, {
        color: RIDGE,
        sides: 6,
        caps: "round",
        name: `ridge${i}`,
      });
      // up-curled corner ornament
      const d = Math.SQRT1_2;
      const tip = [sx * Rr - sx * d * 0.05, Yb + topH(i, 1, 1) - 0.02, sz * Rr - sz * d * 0.05];
      b.extrude(
        [
          [-0.5, -0.05],
          [0.1, -0.05],
          [0.28, 0.05],
          [0.34, 0.22],
          [0.26, 0.4],
          [0.12, 0.46],
          [0.14, 0.32],
          [0.08, 0.2],
          [-0.1, 0.16],
          [-0.5, 0.2],
        ],
        { at: tip, x: [sx * d, 0, sz * d], thickness: 0.26, color: RIDGE, name: `cornerTile${i}` },
      );
      // wind bell
      const rr = Rr - 0.12;
      const lh = lowH(rr / Rr, 1);
      const bellTop = Yb + lh - 0.3;
      bag.box(IRON, 0.02, 0.3, 0.02, sx * rr, Yb + lh - 0.15, sz * rr);
      bag.add(BRONZE, put(BELL.clone(), sx * rr, bellTop - 0.17, sz * rr));
      bag.box(TAG, 0.1, 0.2, 0.012, sx * rr, bellTop - 0.17 - 0.28, sz * rr, Math.atan2(sx, sz));
    }
    // round eave-end tiles along each edge
    for (let k = 0; k < 4; k++) {
      const cnt = Math.floor((2 * (Rr - 0.25)) / 0.36);
      for (let j = 0; j <= cnt; j++) {
        const lx = -(Rr - 0.25) + (j * 2 * (Rr - 0.25)) / cnt;
        const t = Math.abs(lx) / Rr;
        bag.fdisc(TOMOE, k, 0.1, lx, Yb + lowH(1, t) + THICK * 0.58, Rr + 0.01);
      }
    }
    bag.flush();
  }

  // ------------------------------------------------------------------ hanging lanterns (first storey, front)
  {
    const lb = new Bag(b, "lanterns");
    const w = W[0];
    const lz = w + 1.5;
    for (const s of [1, -1]) {
      const x = s * (w / 3 + 0.6);
      const cy = yB[0] - 0.55;
      const body = b.part(
        latheGeo(
          [
            [0.2, -0.4],
            [0.3, -0.2],
            [0.33, 0],
            [0.3, 0.2],
            [0.2, 0.4],
          ],
          14,
        ),
        "#ffffff",
        { at: [x, cy, lz], texture: LANTERN, name: "lantern" },
      );
      glow(body, 1.1);
      lb.cyl(DARK, 0.22, 0.22, 0.07, 10, x, cy + 0.43, lz);
      lb.cyl(DARK, 0.22, 0.22, 0.07, 10, x, cy - 0.43, lz);
      lb.box(IRON, 0.02, 0.5, 0.02, x, yB[0] + 0.2, lz);
      lb.box("#b52b1b", 0.06, 0.3, 0.06, x, cy - 0.64, lz);
      lb.ball(GILT, 0.05, x, cy - 0.82, lz);
    }
    lb.flush();
  }

  // ------------------------------------------------------------------ sorin finial
  {
    const ax = yb[NS - 1] + topH(NS - 1, 0, 0);
    const fin = new Bag(b, "sorin");
    fin.box(BRONZE, 1.0, 0.6, 1.0, 0, ax - 0.05, 0);
    fin.box(GILT, 1.06, 0.06, 1.06, 0, ax + 0.27, 0);
    fin.add(
      BRONZE,
      put(
        latheGeo(
          [
            [0, 0],
            [0.52, 0],
            [0.56, 0.1],
            [0.5, 0.26],
            [0.32, 0.4],
            [0, 0.46],
          ],
          12,
        ),
        0,
        ax + 0.3,
        0,
      ),
    );
    fin.add(
      GILT,
      put(
        latheGeo(
          [
            [0, 0],
            [0.2, 0],
            [0.5, 0.05],
            [0.44, 0.17],
            [0.22, 0.24],
            [0, 0.26],
          ],
          12,
        ),
        0,
        ax + 0.74,
        0,
      ),
    );
    fin.cyl(BRONZE, 0.1, 0.1, 2.75, 8, 0, ax + 2.35, 0);
    fin.cyl(BRONZE, 0.07, 0.07, 1.4, 8, 0, ax + 4.4, 0);
    for (let j = 0; j < 9; j++) {
      const y = ax + 1.15 + j * 0.3;
      const rad = 0.48 - j * 0.012;
      fin.cyl(BRONZE, rad, rad, 0.06, 14, 0, y, 0);
      fin.cyl(GILT, rad * 0.55, rad * 0.8, 0.06, 10, 0, y - 0.06, 0);
    }
    fin.add(GILT, put(new THREE.TorusGeometry(0.2, 0.04, 5, 12), 0, ax + 3.85, 0));
    fin.add(GILT, put(new THREE.TorusGeometry(0.2, 0.04, 5, 12), 0, ax + 3.85, 0, Math.PI / 2));
    fin.flush();

    // water flame: two crossed flame plates
    const flame: [number, number][] = [
      [-0.22, 0],
      [0.22, 0],
      [0.28, 0.17],
      [0.2, 0.42],
      [0.26, 0.64],
      [0.1, 0.8],
      [0.02, 1.1],
      [-0.06, 0.8],
      [-0.2, 0.6],
      [-0.24, 0.38],
      [-0.3, 0.17],
    ];
    for (const x of [
      [1, 0, 0],
      [0, 0, 1],
    ])
      b.extrude(flame, { at: [0, ax + 3.95, 0], x, thickness: 0.07, color: GILT, name: "suien" });

    // jewel
    const jewel = b.lathe(
      [
        [0, 0],
        [0.14, 0.05],
        [0.2, 0.2],
        [0.14, 0.38],
        [0.06, 0.52],
        [0, 0.68],
      ],
      { at: [0, ax + 4.85, 0], color: "#ffd24a", segments: 8, name: "hoju" },
    );
    glow(jewel, 0.9);

    // chains to the corners of the top roof
    const top = NS - 1;
    const chainBag = new Bag(b, "chains");
    for (const [sx, sz] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const P = [0, ax + 3.1, 0];
      const C = [sx * (R[top] - 0.1), yb[top] + topH(top, 0.97, 1) + 0.05, sz * (R[top] - 0.1)];
      const K = [(sx * C[0] * 0.5) / sx, (P[1] + C[1]) / 2 - 1.6, (sz * C[2] * 0.5) / sz];
      K[0] = C[0] * 0.5;
      K[2] = C[2] * 0.5;
      const path = bezier(P, K, C);
      b.sweep(path, 0.022, { color: IRON, sides: 5, name: "chain" });
      for (let j = 1; j < 14; j++) {
        const [x, y, z] = xyz(path.at(j / 14));
        chainBag.ball(IRON, 0.045, x, y, z);
      }
    }
    chainBag.flush();
  }

  return b.root;
}
