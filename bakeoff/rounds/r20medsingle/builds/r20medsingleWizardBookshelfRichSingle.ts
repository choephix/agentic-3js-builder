import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall indigo-and-gold arcane bookcase under a pointed crescent crown: runed tomes, scrolls in a vase, glowing orbs and an armillary, candles, potions and crystals, on a star rug with a floor candelabra.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type B = ReturnType<typeof createBuilder>;
type Col = string | Paint;
type V3 = [number, number, number];
type Spec = [number, number, number, number];

let b: B;
let rootJoint: ReturnType<B["joint"]>;
let r: () => number;
const bin = new Map<Col, THREE.BufferGeometry[]>();

// ---------------------------------------------------------------- palette
const WOOD = cel(grain("#4d4fa3", "#3e4190", { size: 0.04, axis: "y" }));
const SHELF = cel(grain("#454894", "#383b82", { size: 0.03, axis: "x" }));
const TRIM = cel(grain("#35377c", "#2a2c66", { size: 0.03, axis: "x" }));
const BACK = cel("#1c1f55");
const PAGE = cel("#f7ecd0", "#d9c7a0");
const GOLD = "#f6c64e";
const GOLDC = cel("#f6c64e", "#c78a2b");
const PAPER1 = cel("#f3e4bd", "#d5bd8a");
const PAPER2 = cel("#e9d2b0", "#c9ab80");
const PAPER3 = cel("#d7e6f0", "#a9bdd0");
const WAXC = cel("#fff2d6");
const WAXL = cel("#d9b8ff");
const WAXR = cel("#ff8aa0");
const VASEC = cel("#2fa6a0");
const ROCK = cel("#4a3f8a");
const RUG = cel("#7a2850");
const INKC = cel("#1f6f8f");
const PLATE = "#24184a";
const WICK = "#2a1a1a";
const CORK = "#b98350";
const DOWEL = "#6a3d2a";
const FEATHER = "#f2eeff";
const COVERS: Paint[] = [
  cel("#c93a52"),
  cel("#27a6a0"),
  cel("#7a4fc4"),
  cel("#2f9e5e"),
  cel("#e08a2c"),
  cel("#4a8fe0"),
  cel("#e86a9a"),
  cel("#efe3c4"),
  cel("#2b3a73"),
  cel("#8c3a7a"),
];

type Tex = THREE.Texture;
let T: {
  runes: Tex[];
  frame: Tex;
  spiral: Tex;
  orbBlue: Tex;
  orbViolet: Tex;
  orbGreen: Tex;
  orbAmber: Tex;
};

// ---------------------------------------------------------------- helpers
const IDENT = new THREE.Quaternion();
const ONE = new THREE.Vector3(1, 1, 1);
const eq = (rot: V3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));

function add(color: Col, geo: THREE.BufferGeometry, pos: THREE.Vector3, quat: THREE.Quaternion = IDENT, scale: THREE.Vector3 = ONE) {
  geo.applyMatrix4(new THREE.Matrix4().compose(pos, quat, scale));
  let list = bin.get(color);
  if (!list) bin.set(color, (list = []));
  list.push(geo);
}

function A(color: Col, geo: THREE.BufferGeometry, p: V3, rot?: V3, scale?: V3) {
  add(color, geo, new THREE.Vector3(p[0], p[1], p[2]), rot ? eq(rot) : undefined, scale ? new THREE.Vector3(scale[0], scale[1], scale[2]) : undefined);
}

function flush() {
  for (const [color, list] of bin) {
    const merged = mergeGeometries(list);
    if (!merged) throw new Error("wizardBookshelf: could not merge geometry");
    b.part(merged, color, { bone: rootJoint, at: [0, 0, 0] });
  }
  bin.clear();
}

const box = (c: Col, w: number, h: number, d: number, x: number, y: number, z: number, rot?: V3) =>
  A(c, new THREE.BoxGeometry(w, h, d), [x, y, z], rot);
const cyl = (c: Col, rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, rot?: V3) =>
  A(c, new THREE.CylinderGeometry(rt, rb, h, seg), [x, y, z], rot);

class Grp {
  readonly q: THREE.Quaternion;
  constructor(
    readonly o: THREE.Vector3,
    ry = 0,
    rz = 0,
  ) {
    this.q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry * DEG, rz * DEG, "YXZ"));
  }
  at(l: V3) {
    return new THREE.Vector3(l[0], l[1], l[2]).applyQuaternion(this.q).add(this.o);
  }
  quat(rot?: V3) {
    const q = this.q.clone();
    if (rot) q.multiply(eq(rot));
    return q;
  }
  add(color: Col, geo: THREE.BufferGeometry, l: V3, rot?: V3, scale?: V3) {
    add(color, geo, this.at(l), this.quat(rot), scale ? new THREE.Vector3(scale[0], scale[1], scale[2]) : undefined);
  }
  tex(geo: THREE.BufferGeometry, texture: Tex, l: V3, rot?: V3, strength = 0) {
    const p = b.part(geo, "#ffffff", { at: this.at(l), quat: this.quat(rot), texture });
    if (strength > 0) glow(p, strength);
    return p;
  }
  lit(geo: THREE.BufferGeometry, color: string, l: V3, rot?: V3, strength = 1, scale?: V3) {
    return glow(b.part(geo, color, { at: this.at(l), quat: this.quat(rot), ...(scale ? { scale } : {}) }), strength);
  }
}
const G = (x: number, y: number, z: number, ry = 0, rz = 0) => new Grp(new THREE.Vector3(x, y, z), ry, rz);

const sc = (pts: Array<[number, number]>, k: number): Array<[number, number]> =>
  pts.map(([x, y]): [number, number] => [x * k, y * k]);

// ---------------------------------------------------------------- props
function tome(
  x: number,
  yTop: number,
  zFront: number,
  t: number,
  h: number,
  d: number,
  cover: Paint,
  o: { lean?: number; rune?: number; glowRune?: boolean; plate?: boolean; band?: boolean } = {},
) {
  const lean = o.lean ?? 0;
  const g = G(x, yTop + (lean ? (t / 2) * Math.sin(Math.abs(lean) * DEG) : 0), zFront - d / 2, 0, lean);
  g.add(cover, new THREE.BoxGeometry(t, h, d), [0, h / 2, 0]);
  g.add(PAGE, new THREE.BoxGeometry(t - 0.016, h - 0.016, d - 0.01), [0, h / 2, -0.009]);
  g.add(GOLD, new THREE.BoxGeometry(t + 0.006, 0.012, 0.006), [0, h * 0.1, d / 2 + 0.002]);
  g.add(GOLD, new THREE.BoxGeometry(t + 0.006, 0.012, 0.006), [0, h * 0.9, d / 2 + 0.002]);
  if (o.band) {
    g.add(GOLD, new THREE.BoxGeometry(t + 0.004, 0.007, 0.005), [0, h * 0.22, d / 2 + 0.0015]);
    g.add(GOLD, new THREE.BoxGeometry(t + 0.004, 0.007, 0.005), [0, h * 0.78, d / 2 + 0.0015]);
  }
  if (o.plate !== false) {
    g.add(PLATE, new THREE.BoxGeometry(t * 0.7, h * 0.34, 0.006), [0, h * 0.5, d / 2 + 0.0015]);
    g.tex(new THREE.PlaneGeometry(t * 0.62, h * 0.3), T.runes[(o.rune ?? 0) % T.runes.length], [0, h * 0.5, d / 2 + 0.0052], undefined, o.glowRune ? 1 : 0);
  }
}

function row(x0: number, yTop: number, specs: Spec[], zf = 0.15) {
  let x = x0;
  specs.forEach((s, i) => {
    const [t, h, d, c] = s;
    const jit = (r() - 0.5) * 0.03;
    tome(x + t / 2, yTop, zf + jit, t, h, d, COVERS[c % COVERS.length], {
      rune: i + c,
      glowRune: (i * 7 + c) % 5 === 0,
      band: (i + c) % 2 === 1,
      plate: (i + c) % 4 !== 3,
    });
    x += t + 0.002;
  });
  return x;
}

function flatBook(x: number, yBase: number, z: number, w: number, d: number, h: number, cover: Paint, ry: number, ornate = false) {
  const g = G(x, yBase, z, ry);
  g.add(cover, new THREE.BoxGeometry(w, 0.012, d), [0, 0.006, 0]);
  g.add(cover, new THREE.BoxGeometry(w, 0.012, d), [0, h - 0.006, 0]);
  g.add(cover, new THREE.BoxGeometry(0.016, h, d), [-w / 2 + 0.008, h / 2, 0]);
  g.add(PAGE, new THREE.BoxGeometry(w - 0.03, h - 0.02, d - 0.02), [0.006, h / 2, 0]);
  g.tex(new THREE.PlaneGeometry(w - 0.03, d - 0.03), T.frame, [0.004, h + 0.0015, 0], [-90, 0, 0]);
  g.add(GOLD, new THREE.BoxGeometry(0.022, 0.008, d + 0.004), [-w / 2 + 0.01, h * 0.5, 0], undefined, [1, 0.3, 1]);
  if (ornate) {
    g.lit(new THREE.SphereGeometry(0.018, 8, 6), "#5ee0ff", [0.004, h + 0.006, 0], undefined, 1.2, [1, 0.6, 1]);
    g.add(GOLD, new THREE.BoxGeometry(0.01, h * 0.7, 0.04), [w / 2 + 0.001, h / 2, 0]);
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        g.add(GOLD, new THREE.BoxGeometry(0.03, 0.004, 0.03), [sx * (w / 2 - 0.02), h + 0.002, sz * (d / 2 - 0.02)]);
  }
}

const FLAME: Array<[number, number]> = [
  [0, 0],
  [0.009, 0.004],
  [0.011, 0.014],
  [0.006, 0.03],
  [0, 0.055],
];

function candle(x: number, y: number, z: number, h: number, rad: number, wax: Col, holder = true) {
  const base = holder ? 0.014 : 0;
  if (holder) {
    const R = rad * 2.0;
    cyl(GOLD, R, R * 0.7, 0.012, 10, x, y + 0.006, z);
    A(GOLD, new THREE.TorusGeometry(R * 0.92, 0.004, 5, 12), [x, y + 0.013, z], [90, 0, 0]);
    A(GOLD, new THREE.TorusGeometry(0.02, 0.004, 5, 8), [x + R + 0.012, y + 0.012, z]);
  }
  cyl(wax, rad * 0.94, rad, h, 8, x, y + base + h / 2, z);
  for (let i = 0; i < 3; i++) {
    const a = r() * Math.PI * 2;
    A(
      wax,
      new THREE.SphereGeometry(rad * 0.28, 5, 4),
      [x + Math.cos(a) * rad * 0.95, y + base + h - 0.012 - r() * 0.03, z + Math.sin(a) * rad * 0.95],
      undefined,
      [1, 2.2, 1],
    );
  }
  cyl(WICK, 0.0025, 0.0025, 0.016, 4, x, y + base + h + 0.006, z);
  glow(b.lathe(FLAME, { at: [x, y + base + h + 0.008, z], color: "#ffb23a", segments: 6 }), 1.5);
  glow(b.lathe(sc(FLAME, 0.55), { at: [x, y + base + h + 0.008, z], color: "#fff2b0", segments: 6 }), 1.7);
}

const STAND: Array<[number, number]> = [
  [0, 0],
  [0.062, 0],
  [0.07, 0.01],
  [0.056, 0.02],
  [0.026, 0.036],
  [0.022, 0.052],
  [0.034, 0.066],
  [0.052, 0.088],
  [0.047, 0.092],
  [0.028, 0.074],
  [0, 0.066],
];

function orb(x: number, yTop: number, z: number, rad: number, tex: Tex, armillary = false) {
  const k = rad / 0.07;
  b.lathe(sc(STAND, k), { at: [x, yTop, z], color: GOLDC, segments: 10 });
  const cy = yTop + 0.088 * k + 0.67 * rad;
  glow(b.part(new THREE.SphereGeometry(rad, 14, 10), "#ffffff", { at: [x, cy, z], rotation: [0, -90, 0], texture: tex }), 1.1);
  glow(b.part(new THREE.SphereGeometry(rad * 0.2, 6, 4), "#ffffff", { at: [x + rad * 0.42, cy + rad * 0.52, z + rad * 0.7], scale: [1, 1.5, 0.4] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(rad * 0.08, 5, 4), "#ffffff", { at: [x - rad * 0.3, cy - rad * 0.45, z + rad * 0.8] }), 1.5);
  if (armillary) {
    const R = rad * 1.4;
    A(GOLD, new THREE.TorusGeometry(R, 0.004, 5, 28), [x, cy, z], [90, 0, 0]);
    A(GOLD, new THREE.TorusGeometry(R, 0.004, 5, 28), [x, cy, z], [0, 0, 0]);
    A(GOLD, new THREE.TorusGeometry(R, 0.004, 5, 28), [x, cy, z], [0, 65, 25]);
    for (const a of [20, 140, 260])
      A(GOLD, new THREE.SphereGeometry(0.01, 6, 4), [x + R * Math.cos(a * DEG), cy, z + R * Math.sin(a * DEG)]);
  }
}

function scroll(x: number, y: number, z: number, len: number, rad: number, ry: number, rz: number, paper: Col, ribbon: string) {
  const g = G(x, y, z, ry, rz);
  g.add(paper, new THREE.CylinderGeometry(rad, rad, len, 8), [0, 0, 0], [0, 0, 90]);
  g.tex(new THREE.CircleGeometry(rad * 0.98, 10), T.spiral, [len / 2 + 0.0008, 0, 0], [0, 90, 0]);
  g.tex(new THREE.CircleGeometry(rad * 0.98, 10), T.spiral, [-len / 2 - 0.0008, 0, 0], [0, -90, 0]);
  g.add(DOWEL, new THREE.CylinderGeometry(rad * 0.25, rad * 0.25, len + 0.06, 5), [0, 0, 0], [0, 0, 90]);
  g.add(GOLD, new THREE.SphereGeometry(rad * 0.5, 6, 4), [len / 2 + 0.03, 0, 0]);
  g.add(GOLD, new THREE.SphereGeometry(rad * 0.5, 6, 4), [-len / 2 - 0.03, 0, 0]);
  g.add(ribbon, new THREE.CylinderGeometry(rad * 1.08, rad * 1.08, 0.022, 8), [len * 0.18, 0, 0], [0, 0, 90]);
  g.add(ribbon, new THREE.BoxGeometry(0.006, 0.05, 0.004), [len * 0.18 + 0.012, -rad - 0.02, rad * 0.4]);
}

const BOTTLE: Array<[number, number]> = [
  [0, 0],
  [0.03, 0],
  [0.042, 0.012],
  [0.044, 0.05],
  [0.036, 0.085],
  [0.016, 0.108],
  [0.016, 0.135],
  [0.02, 0.14],
  [0, 0.14],
];

function potion(x: number, yTop: number, z: number, color: string, k = 1) {
  glow(b.lathe(sc(BOTTLE, k), { at: [x, yTop, z], color, segments: 8 }), 0.9);
  cyl(CORK, 0.016 * k, 0.013 * k, 0.03 * k, 6, x, yTop + 0.152 * k, z);
  cyl(GOLD, 0.021 * k, 0.021 * k, 0.006 * k, 8, x, yTop + 0.128 * k, z);
  glow(b.part(new THREE.BoxGeometry(0.006 * k, 0.05 * k, 0.004), "#ffffff", { at: [x + 0.02 * k, yTop + 0.06 * k, z + 0.04 * k] }), 1);
}

function crystal(x: number, yTop: number, z: number, h: number, rad: number, color: string, tilt: number) {
  glow(b.part(new THREE.ConeGeometry(rad, h, 5), color, { at: [x, yTop + h / 2, z], rotation: [0, 0, tilt], flat: true }), 1.2);
}

function tassel(x: number, y: number, z: number) {
  box("#d63a56", 0.008, 0.1, 0.004, x, y - 0.05, z);
  A(GOLD, new THREE.SphereGeometry(0.016, 6, 5), [x, y - 0.108, z]);
  A("#d63a56", new THREE.ConeGeometry(0.02, 0.07, 8), [x, y - 0.15, z]);
  cyl(GOLD, 0.019, 0.019, 0.006, 8, x, y - 0.17, z);
}

function hangStar(x: number, yAttach: number, len: number) {
  box(GOLD, 0.003, len, 0.003, x, yAttach - len / 2, 0.03);
  glow(b.extrude(starPts(0.022, 0.009), { at: [x, yAttach - len - 0.02, 0.03], x: [1, 0, 0], thickness: 0.01, color: "#ffe07a" }), 1.3);
}

function starPts(R: number, rr: number): OutlinePoint[] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (90 + i * 36) * DEG;
    const rad = i % 2 === 0 ? R : rr;
    const p: OutlinePoint = i % 2 === 0 ? [rad * Math.cos(a), rad * Math.sin(a), "sharp"] : [rad * Math.cos(a), rad * Math.sin(a)];
    return p;
  });
}

function crescent(R: number, rotDeg: number): OutlinePoint[] {
  const a0 = rotDeg * DEG;
  const rot = (x: number, y: number): OutlinePoint => [x * Math.cos(a0) - y * Math.sin(a0), x * Math.sin(a0) + y * Math.cos(a0)];
  const pts: OutlinePoint[] = [];
  for (let a = 60; a <= 300; a += 20) pts.push(rot(R * Math.cos(a * DEG), R * Math.sin(a * DEG)));
  for (let a = 260; a >= 100; a -= 20) pts.push(rot(0.4 * R + 0.78 * R * Math.cos(a * DEG), 0.78 * R * Math.sin(a * DEG)));
  return pts;
}

function candelabra(x: number, z: number) {
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.11, 0.015],
      [0.07, 0.04],
      [0.03, 0.07],
      [0, 0.07],
    ],
    { at: [x, 0, z], color: GOLDC, segments: 10 },
  );
  b.rod([x, 0.06, z], [x, 0.74, z], [0.022, 0.014], GOLD);
  for (const y of [0.25, 0.45, 0.62]) A(GOLD, new THREE.SphereGeometry(0.034, 8, 6), [x, y, z], undefined, [1, 0.7, 1]);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [x, 0.5, z],
        [x + s * 0.07, 0.5, z],
        [x + s * 0.14, 0.56, z],
        [x + s * 0.15, 0.66, z],
      ]),
      0.011,
      GOLD,
      { caps: "round" },
    );
    candle(x + s * 0.15, 0.67, z, 0.16, 0.022, s > 0 ? WAXL : WAXR, true);
  }
  candle(x, 0.74, z, 0.22, 0.026, WAXC, true);
}

// ---------------------------------------------------------------- textures
function makeTextures() {
  const gold = "#ffd96a";
  const runeSvg = (body: string) =>
    svg(`<svg viewBox="0 0 32 64"><g fill="none" stroke="${gold}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`, { size: 128 });
  const runes = [
    runeSvg(`<path d="M16 6 L16 58 M6 18 L26 18"/><circle cx="16" cy="36" r="8"/>`),
    runeSvg(`<path d="M8 8 L24 22 L8 36 L24 50 L16 58"/>`),
    runeSvg(`<path d="M4 32 Q16 14 28 32 Q16 50 4 32 Z"/><circle cx="16" cy="32" r="3.5" fill="${gold}"/><path d="M16 6 V14 M16 50 V58"/>`),
  ];
  const frame = svg(
    `<svg viewBox="0 0 60 80"><g fill="none" stroke="${gold}" stroke-width="1.2">
      <rect x="2" y="2" width="56" height="76" rx="2"/><rect x="6" y="6" width="48" height="68" rx="1" stroke-width="0.8"/>
      <circle cx="30" cy="40" r="12"/>
      <path d="M30 22 L34 36 L48 40 L34 44 L30 58 L26 44 L12 40 L26 36 Z" fill="${gold}" stroke-width="0.4"/>
      </g>
      <path d="M2 8 L8 2 L2 2 Z M58 8 L52 2 L58 2 Z M2 72 L8 78 L2 78 Z M58 72 L52 78 L58 78 Z" fill="${gold}"/></svg>`,
    { size: 512 },
  );
  const spiral = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#ecd9a5"/><g fill="none" stroke="#b88a4a" stroke-width="3"><circle cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="24"/></g><circle cx="32" cy="32" r="3" fill="#b88a4a"/></svg>`,
    { size: 128 },
  );
  const orbTex = (c1: string, c2: string, c3: string) =>
    svg(
      `<svg viewBox="0 0 256 128"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="0.5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs>
      <rect width="256" height="128" fill="url(#g)"/>
      <g fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="5" stroke-linecap="round">
      <path d="M0 90 Q64 40 128 70 T256 50"/><path d="M0 60 Q64 20 128 44 T256 30" stroke-opacity="0.35"/><path d="M0 110 Q64 80 128 100 T256 86" stroke-opacity="0.4"/></g>
      <g fill="#ffffff"><circle cx="100" cy="40" r="3"/><circle cx="150" cy="84" r="4"/><circle cx="60" cy="76" r="2.5"/><circle cx="190" cy="52" r="3"/><circle cx="128" cy="30" r="2"/><circle cx="170" cy="110" r="2.5"/></g></svg>`,
      { size: 256 },
    );
  T = {
    runes,
    frame,
    spiral,
    orbBlue: orbTex("#8fe8ff", "#3a8cff", "#2a2fb0"),
    orbViolet: orbTex("#f0b8ff", "#a64dff", "#4a1a9a"),
    orbGreen: orbTex("#c8ffb0", "#35d68a", "#0f6a6a"),
    orbAmber: orbTex("#fff0a0", "#ffb030", "#d0501a"),
  };
}

function skyTexture() {
  const rs = rng(5);
  let stars = "";
  for (let i = 0; i < 110; i++) {
    const x = rs() * 140;
    const y = rs() * 200;
    const rad = 0.35 + rs() * 0.9;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${rs() < 0.25 ? "#9fe8ff" : "#fff0b8"}"/>`;
  }
  let sparkles = "";
  for (const [x, y] of [
    [20, 24],
    [112, 70],
    [30, 120],
    [95, 150],
    [60, 14],
    [125, 180],
    [14, 176],
    [75, 100],
  ])
    sparkles += `<path d="M${x} ${y - 4} L${x + 1} ${y - 1} L${x + 4} ${y} L${x + 1} ${y + 1} L${x} ${y + 4} L${x - 1} ${y + 1} L${x - 4} ${y} L${x - 1} ${y - 1} Z" fill="#ffffff"/>`;
  return svg(
    `<svg viewBox="0 0 140 200"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171a52"/><stop offset="0.6" stop-color="#2b2b7c"/><stop offset="1" stop-color="#4a2f8a"/></linearGradient></defs>
    <rect width="140" height="200" fill="url(#bg)"/>${stars}${sparkles}
    <path d="M100 16 A14 14 0 1 0 100 44 A10 10 0 1 1 100 16Z" fill="#ffe9a8"/>
    <polyline points="20,40 38,52 55,46 70,66 60,86" fill="none" stroke="#ffd96a" stroke-width="0.7"/>
    <polyline points="90,120 108,134 124,126 130,150" fill="none" stroke="#ffd96a" stroke-width="0.7"/>
    <g fill="#ffd96a"><circle cx="20" cy="40" r="1.5"/><circle cx="38" cy="52" r="1.5"/><circle cx="55" cy="46" r="1.5"/><circle cx="70" cy="66" r="1.5"/><circle cx="60" cy="86" r="1.5"/><circle cx="90" cy="120" r="1.5"/><circle cx="108" cy="134" r="1.5"/><circle cx="124" cy="126" r="1.5"/><circle cx="130" cy="150" r="1.5"/></g></svg>`,
    { size: 1024 },
  );
}

function sideTexture() {
  const gold = "#ffd96a";
  let leaves = "";
  for (const [cx, cy, rot] of [
    [9, 166, -40],
    [31, 146, 40],
    [9, 114, -40],
    [31, 94, 40],
    [13, 66, -40],
    [27, 40, 40],
  ])
    leaves += `<ellipse cx="${cx}" cy="${cy}" rx="5" ry="2.2" transform="rotate(${rot} ${cx} ${cy})" fill="${gold}"/>`;
  return svg(
    `<svg viewBox="0 0 40 200"><g fill="none" stroke="${gold}" stroke-width="1.5" stroke-linecap="round">
    <rect x="2" y="2" width="36" height="196" rx="3" stroke-width="1"/>
    <path d="M20 192 C4 172 36 152 20 128 C4 104 36 84 20 60 C8 44 30 28 20 10"/>
    <circle cx="20" cy="100" r="5"/><path d="M20 93 V107 M13 100 H27" stroke-width="1"/>
    </g>${leaves}
    <g fill="${gold}"><circle cx="20" cy="8" r="2"/><circle cx="20" cy="192" r="2"/><circle cx="8" cy="30" r="1.2"/><circle cx="32" cy="176" r="1.2"/></g></svg>`,
    { size: 800 },
  );
}

function crownTexture() {
  const gold = "#ffd96a";
  return svg(
    `<svg viewBox="0 0 150 36"><g fill="none" stroke="${gold}" stroke-width="1.1" stroke-linecap="round">
    <path d="M10 33 H140"/>
    <path d="M60 33 C52 33 50 24 56 22 C62 20 64 27 59 28"/>
    <path d="M90 33 C98 33 100 24 94 22 C88 20 86 27 91 28"/>
    </g><g fill="${gold}"><circle cx="22" cy="31" r="1.4"/><circle cx="128" cy="31" r="1.4"/><circle cx="40" cy="31" r="1.2"/><circle cx="110" cy="31" r="1.2"/><circle cx="75" cy="31" r="1.6"/></g></svg>`,
    { size: 1024 },
  );
}

function rugTexture() {
  let diamonds = "";
  for (let i = 0; i < 7; i++) {
    const cx = 35 + i * 27;
    diamonds += `<path d="M${cx} 18 L${cx + 9} 30 L${cx} 42 L${cx - 9} 30 Z" fill="${i % 2 ? "#2fa6a0" : "#f6c64e"}" stroke="#ffe9a8" stroke-width="0.8"/><circle cx="${cx}" cy="30" r="2.2" fill="#7a2850"/>`;
  }
  return svg(
    `<svg viewBox="0 0 230 60"><rect width="230" height="60" fill="#7a2850"/>
    <rect x="3" y="3" width="224" height="54" fill="none" stroke="#f6c64e" stroke-width="1.6"/>
    <rect x="7" y="7" width="216" height="46" fill="none" stroke="#2fa6a0" stroke-width="1.2"/>
    <rect x="11" y="11" width="208" height="38" fill="#5a1f4a"/>${diamonds}
    <g fill="#ffe9a8"><circle cx="16" cy="16" r="1.5"/><circle cx="214" cy="16" r="1.5"/><circle cx="16" cy="44" r="1.5"/><circle cx="214" cy="44" r="1.5"/></g></svg>`,
    { size: 1024 },
  );
}

// ---------------------------------------------------------------- build
const ARCH: OutlinePoint[] = [
  [-0.75, 0],
  [0.75, 0],
  [0.72, 0.05],
  [0.5, 0.12],
  [0.25, 0.25],
  [0, 0.36, "sharp"],
  [-0.25, 0.25],
  [-0.5, 0.12],
  [-0.72, 0.05],
];

export default function build() {
  b = createBuilder({ name: "wizardBookshelf" });
  rootJoint = b.joint("base", { at: [0, 0, 0] });
  r = rng(11);
  bin.clear();
  makeTextures();

  // ---- rug
  box(RUG, 2.3, 0.012, 0.6, 0, 0.006, 0.52);
  b.part(new THREE.PlaneGeometry(2.3, 0.6), "#ffffff", { at: [0, 0.0132, 0.52], rotation: [-90, 0, 0], texture: rugTexture() });

  // ---- carcass
  box(TRIM, 1.5, 0.12, 0.5, 0, 0.06, 0);
  box(GOLD, 1.38, 0.012, 0.004, 0, 0.075, 0.2525);
  for (let i = -3; i <= 3; i++) box(GOLD, 0.03, 0.03, 0.006, i * 0.2, 0.04, 0.253, [0, 0, 45]);
  for (const s of [1, -1]) {
    box(WOOD, 0.05, 2.21, 0.4, s * 0.7, 1.225, 0);
    b.part(new THREE.PlaneGeometry(0.36, 1.8), "#ffffff", { at: [s * 0.7275, 1.225, 0], dir: [s, 0, 0], axis: "z", texture: sideTexture() });
    cyl(WOOD, 0.035, 0.035, 2.21, 8, s * 0.7, 1.225, 0.215);
    cyl(GOLD, 0.052, 0.058, 0.03, 8, s * 0.7, 0.15, 0.215);
    cyl(GOLD, 0.05, 0.045, 0.03, 8, s * 0.7, 2.3, 0.215);
    for (const y of [0.5, 0.9, 1.3, 1.7, 2.1]) cyl(GOLD, 0.04, 0.04, 0.012, 8, s * 0.7, y, 0.215);
  }
  for (const y of [0.14, 0.62, 1.08, 1.54, 2.0]) {
    box(SHELF, 1.35, 0.04, 0.4, 0, y, 0);
    box(GOLD, 1.35, 0.01, 0.004, 0, y, 0.2015);
  }
  box(TRIM, 1.5, 0.06, 0.46, 0, 2.3, 0);
  box(TRIM, 1.58, 0.04, 0.5, 0, 2.35, 0);
  box(GOLD, 1.58, 0.012, 0.004, 0, 2.35, 0.252);
  for (let i = 0; i < 15; i++) box(GOLD, 0.04, 0.025, 0.02, -0.63 + i * 0.09, 2.2575, 0.215);
  box(BACK, 1.35, 2.18, 0.02, 0, 1.21, -0.19);
  b.part(new THREE.PlaneGeometry(1.35, 2.18), "#ffffff", { at: [0, 1.21, -0.1785], texture: skyTexture() });

  // ---- crown
  b.extrude(ARCH, { at: [0, 2.37, 0], x: [1, 0, 0], thickness: 0.34, bevel: 0.008, color: TRIM });
  const trim = ARCH.slice(2, 9).map((p) => [p[0], 2.37 + p[1]]);
  for (const z of [0.17, -0.17]) b.sweep(trim.map(([x, y]) => [x, y, z]), 0.011, GOLD, { caps: "round" });
  for (const [x, y] of [
    [-0.5, 0.12],
    [0.5, 0.12],
    [-0.25, 0.25],
    [0.25, 0.25],
  ])
    A(GOLD, new THREE.ConeGeometry(0.02, 0.07, 5), [x, 2.37 + y + 0.03, 0.17]);
  for (const s of [1, -1]) {
    A(GOLD, new THREE.SphereGeometry(0.03, 8, 6), [s * 0.73, 2.42, 0.12]);
    cyl(GOLD, 0.012, 0.016, 0.05, 6, s * 0.73, 2.395, 0.12);
    glow(b.extrude(starPts(0.035, 0.015), { at: [s * 0.4, 2.45, 0.165], x: [1, 0, 0], thickness: 0.02, color: "#ffe07a" }), 1.2);
  }
  b.part(new THREE.PlaneGeometry(1.5, 0.36), "#ffffff", { at: [0, 2.55, 0.1715], texture: crownTexture() });
  b.extrude(crescent(0.09, 90), { at: [0, 2.57, 0.16], x: [1, 0, 0], thickness: 0.03, bevel: 0.005, color: GOLDC });
  glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), "#5ee0ff", { at: [0, 2.6, 0.178] }), 1.3);
  cyl(GOLD, 0.012, 0.016, 0.07, 6, 0, 2.765, 0);
  glow(b.extrude(starPts(0.065, 0.028), { at: [0, 2.84, 0], x: [1, 0, 0], thickness: 0.03, bevel: 0.005, color: "#ffe07a" }), 1.4);

  // ---- S0 (shelf top 0.16)
  const e0 = row(-0.66, 0.16, [
    [0.07, 0.4, 0.28, 0],
    [0.06, 0.37, 0.26, 1],
    [0.085, 0.41, 0.29, 2],
    [0.05, 0.34, 0.24, 3],
    [0.065, 0.38, 0.27, 4],
    [0.09, 0.42, 0.3, 5],
    [0.055, 0.36, 0.25, 6],
  ]);
  tome(e0 + 0.13, 0.16, 0.14, 0.06, 0.37, 0.26, COVERS[7], { lean: 14, rune: 1, glowRune: true, band: true });
  flatBook(0.2, 0.16, 0.02, 0.36, 0.26, 0.05, COVERS[0], -8, true);
  flatBook(0.2, 0.21, 0.02, 0.3, 0.22, 0.04, COVERS[5], 12);
  flatBook(0.2, 0.25, 0.02, 0.26, 0.19, 0.035, COVERS[2], -18);
  orb(0.2, 0.285, 0.02, 0.07, T.orbBlue);
  row(0.42, 0.16, [
    [0.06, 0.36, 0.25, 7],
    [0.07, 0.39, 0.27, 8],
    [0.055, 0.33, 0.24, 9],
  ]);

  // ---- S1 (0.64)
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.08, 0.02],
      [0.075, 0.12],
      [0.095, 0.2],
      [0.085, 0.21],
      [0.06, 0.17],
      [0.05, 0.1],
      [0, 0.1],
    ],
    { at: [-0.5, 0.64, 0], color: VASEC, segments: 10 },
  );
  cyl(GOLD, 0.083, 0.083, 0.01, 10, -0.5, 0.64 + 0.15, 0);
  scroll(-0.515, 0.88, 0, 0.28, 0.026, 0, 98, PAPER1, "#d63a56");
  scroll(-0.49, 0.88, 0.03, 0.27, 0.024, 0, 84, PAPER2, "#2f78d6");
  scroll(-0.5, 0.89, -0.03, 0.26, 0.025, 0, 92, PAPER3, "#2fae7a");
  row(-0.37, 0.64, [
    [0.06, 0.36, 0.25, 3],
    [0.07, 0.38, 0.27, 6],
    [0.05, 0.32, 0.23, 1],
    [0.075, 0.37, 0.26, 9],
    [0.06, 0.35, 0.25, 4],
    [0.065, 0.38, 0.27, 2],
  ]);
  candle(0.11, 0.64, 0.06, 0.17, 0.02, WAXL, true);
  row(0.19, 0.64, [
    [0.055, 0.34, 0.24, 8],
    [0.065, 0.37, 0.26, 5],
  ]);
  orb(0.5, 0.64, 0.04, 0.085, T.orbViolet);
  tassel(-0.63, 1.06, 0.19);
  tassel(0.63, 1.06, 0.19);

  // ---- S2 (1.10)
  row(-0.66, 1.1, [
    [0.07, 0.38, 0.27, 5],
    [0.055, 0.34, 0.24, 8],
    [0.08, 0.39, 0.28, 7],
    [0.05, 0.33, 0.23, 0],
    [0.065, 0.37, 0.26, 3],
  ]);
  candle(-0.23, 1.1, 0.07, 0.2, 0.022, WAXC, true);
  orb(0.05, 1.1, 0.03, 0.085, T.orbAmber, true);
  row(0.25, 1.1, [
    [0.06, 0.35, 0.25, 1],
    [0.075, 0.38, 0.27, 4],
    [0.05, 0.3, 0.22, 6],
    [0.07, 0.37, 0.26, 2],
    [0.06, 0.34, 0.24, 9],
    [0.055, 0.36, 0.25, 5],
  ]);

  // ---- S3 (1.56)
  const pile: Array<[number, number, number, Col, string]> = [
    [1.596, -0.07, 4, PAPER1, "#d63a56"],
    [1.596, 0.0, -5, PAPER2, "#2f78d6"],
    [1.596, 0.07, 3, PAPER3, "#2fae7a"],
    [1.656, -0.035, -3, PAPER2, "#2fae7a"],
    [1.656, 0.035, 6, PAPER1, "#2f78d6"],
    [1.716, 0.0, -4, PAPER3, "#d63a56"],
  ];
  for (const [y, z, ry, paper, rib] of pile) scroll(-0.5, y, z, 0.3, 0.035, ry, 0, paper, rib);
  row(-0.3, 1.56, [
    [0.07, 0.38, 0.27, 7],
    [0.06, 0.35, 0.25, 2],
    [0.075, 0.39, 0.28, 1],
    [0.055, 0.33, 0.24, 6],
    [0.065, 0.37, 0.26, 8],
  ]);
  potion(0.14, 1.56, 0.08, "#ff5fa8");
  potion(0.25, 1.56, 0.08, "#4be3c1", 1.15);
  potion(0.34, 1.56, 0.08, "#a56bff", 0.9);
  row(0.43, 1.56, [
    [0.07, 0.38, 0.27, 3],
    [0.06, 0.34, 0.24, 0],
    [0.08, 0.39, 0.28, 4],
  ]);

  // ---- S4 (2.02)
  row(-0.66, 2.02, [
    [0.045, 0.2, 0.2, 5],
    [0.05, 0.22, 0.21, 2],
    [0.04, 0.18, 0.19, 8],
    [0.055, 0.21, 0.2, 0],
    [0.045, 0.19, 0.18, 6],
  ]);
  orb(-0.22, 2.02, 0.03, 0.075, T.orbGreen);
  candle(0.02, 2.02, 0.08, 0.11, 0.017, WAXR, true);
  candle(0.1, 2.02, 0.05, 0.14, 0.02, WAXC, true);
  cyl(ROCK, 0.1, 0.12, 0.02, 6, 0.5, 2.03, 0.04);
  crystal(0.45, 2.04, 0.04, 0.15, 0.025, "#5ee0ff", 6);
  crystal(0.52, 2.04, 0.06, 0.11, 0.02, "#ff7ac8", -8);
  crystal(0.56, 2.04, 0.0, 0.09, 0.018, "#b08bff", 12);
  hangStar(-0.33, 2.27, 0.05);
  hangStar(0.27, 2.27, 0.05);

  // ---- cornice dressing
  candle(-0.68, 2.37, 0.21, 0.22, 0.026, WAXL, true);
  candle(0.68, 2.37, 0.21, 0.28, 0.03, WAXC, true);
  orb(0.4, 2.37, 0.2, 0.055, T.orbBlue);
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.046, 0.02],
      [0.04, 0.05],
      [0.022, 0.062],
      [0.022, 0.075],
      [0, 0.075],
    ],
    { at: [-0.38, 2.37, 0.2], color: INKC, segments: 8 },
  );
  b.rod([-0.37, 2.445, 0.2], [-0.43, 2.61, 0.2], 0.003, FEATHER);
  A(FEATHER, new THREE.SphereGeometry(0.03, 6, 5), [-0.41, 2.58, 0.2], [0, 0, 19], [0.5, 3, 0.15]);

  // ---- floor props
  flatBook(0.98, 0.012, 0.52, 0.42, 0.3, 0.075, COVERS[0], 8, true);
  flatBook(0.98, 0.087, 0.52, 0.36, 0.26, 0.06, COVERS[5], -12);
  flatBook(0.98, 0.147, 0.52, 0.3, 0.22, 0.05, COVERS[2], 15);
  candle(0.98, 0.197, 0.52, 0.26, 0.034, WAXR, true);
  candelabra(-1.0, 0.5);

  flush();
  return b.root;
}
