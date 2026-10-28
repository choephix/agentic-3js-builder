import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, grain, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall high-fantasy anime bookshelf crowded with tomes, scrolls, glowing orbs and candles, crowned by a moon gable and a starry wizard hat.",
};

type V = [number, number, number];
const DEG = Math.PI / 180;

const WOOD = grain("#4a2a3c", "#7e4a4a", { size: 0.12, axis: "y", seed: 4 });
const WOOD_LIGHT = grain("#8a5650", "#c98a62", { size: 0.1, axis: "y", seed: 9 });
const GOLD = "#ffcf4a";
const CREAM = "#fff1d0";
const BOOKS = ["#7b3fd1", "#2fb5c9", "#e0457b", "#3b6fe0", "#2faa6b", "#d9742b", "#9b2f5e", "#5a3cc0", "#c9363a"];

const moonSvg = svg(
  `<svg viewBox="0 0 100 60"><path d="M10 52 Q50 -6 90 52" fill="none" stroke="#10061f" stroke-width="9" stroke-linecap="round"/><path d="M10 52 Q50 -6 90 52" fill="none" stroke="#8ff3ff" stroke-width="4.5" stroke-linecap="round"/><path d="M58 22 a14 14 0 1 0 0 22 a11 11 0 1 1 0 -22z" fill="#fff6b0" stroke="#10061f" stroke-width="2"/><path d="M26 34 l3 -7 l3 7 l-7 -4 h8z M72 36 l2 -5 l2 5 l-5 -3 h6z" fill="#e8ffff"/></svg>`,
  { size: 512 },
);
const runeSvg = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#10061f" stroke-width="7"/><circle cx="32" cy="32" r="28" fill="none" stroke="#ffd0ff" stroke-width="3"/><path d="M32 12 L48 44 H16 Z M32 52 L18 26 H46 Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const coverSvg = svg(
  `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="6" fill="none" stroke="#ffcf4a" stroke-width="4"/><path d="M32 12 L40 32 L32 52 L24 32Z" fill="#ffcf4a"/><circle cx="32" cy="32" r="6" fill="#8ff3ff" stroke="#10061f" stroke-width="2"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(21);

  // ---- merge buckets ----
  const buckets = new Map<string, { c: string; g: number; geos: THREE.BufferGeometry[] }>();
  const put = (c: string, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], sc: V | number = 1, g = 0) => {
    const key = `${c}|${g}`;
    let k = buckets.get(key);
    if (!k) buckets.set(key, (k = { c, g, geos: [] }));
    const s = typeof sc === "number" ? new THREE.Vector3(sc, sc, sc) : new THREE.Vector3(...sc);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ"));
    k.geos.push(geo.clone().applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), q, s)));
  };
  const box = (c: string, s: V, at: V, rot?: V, g = 0) => put(c, new THREE.BoxGeometry(...s), at, rot, 1, g);
  const cyl = (c: string, rt: number, rb: number, h: number, seg: number, at: V, rot?: V, g = 0) =>
    put(c, new THREE.CylinderGeometry(rt, rb, h, seg), at, rot, 1, g);
  const sph = (c: string, r: number, at: V, sc: V | number = 1, g = 0, seg = 8) =>
    put(c, new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), at, [0, 0, 0], sc, g);
  const lathe = (c: string, pts: [number, number][], at: V, seg = 8, g = 0) =>
    put(c, new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), at, [0, 0, 0], 1, g);

  const plank = (name: string, size: V, at: V, paintFill: any = WOOD) =>
    b.part(new THREE.BoxGeometry(...size), paintFill, { bone: root, at, name });

  // ---- carcass ----
  const SHELF = [0.18, 0.74, 1.3, 1.86];
  plank("plinth", [1.52, 0.12, 0.46], [0, 0.06, 0.0], WOOD_LIGHT);
  for (const s of [-1, 1]) {
    plank(`side${s}`, [0.08, 2.1, 0.4], [s * 0.68, 1.11, 0]);
    plank(`sideTrim${s}`, [0.05, 2.0, 0.05], [s * 0.7, 1.1, 0.21], WOOD_LIGHT);
    plank(`foot${s}`, [0.16, 0.12, 0.5], [s * 0.7, 0.06, 0.02], WOOD_LIGHT);
    // gold-capped finials
    sph(GOLD, 0.05, [s * 0.68, 2.3, 0.14], 1);
    cyl(GOLD, 0.03, 0.04, 0.1, 6, [s * 0.68, 2.24, 0.14]);
  }
  plank("back", [1.28, 2.1, 0.03], [0, 1.11, -0.185], "#3a2250");
  SHELF.forEach((y, i) => {
    plank(`shelf${i}`, [1.28, 0.05, 0.38], [0, y - 0.025, 0.0]);
    plank(`lip${i}`, [1.28, 0.025, 0.03], [0, y - 0.04, 0.2], WOOD_LIGHT);
  });
  plank("top", [1.52, 0.07, 0.46], [0, 2.215, 0.0], WOOD_LIGHT);
  // crown gable with moon rune plaque
  b.extrude(
    [[-0.7, 0], [0.7, 0], [0.5, 0.17], [0.0, 0.4], [-0.5, 0.17]],
    { at: [0, 2.25, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.14, bevel: 0.015, color: WOOD, bone: root, name: "gable" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.62, 0.372), "#ffffff", { bone: root, at: [0, 2.31, 0.092], dir: [0, 0, 1], axis: "z", texture: moonSvg, name: "moonPlaque" }),
    1.2,
  );
  // gold corner brackets
  for (const s of [-1, 1])
    for (const y of SHELF.slice(0, 3)) box(GOLD, [0.07, 0.07, 0.02], [s * 0.62, y + 0.04, 0.2]);

  // ---- books ----
  const book = (x: number, y: number, w: number, h: number, d: number, col: string, lean = 0) => {
    const ang = lean;
    const cx = x + Math.sin(ang * DEG) * h * 0.5 * -1;
    box(col, [w, h, d], [x + (lean ? (h / 2) * Math.sin(-lean * DEG) : 0), y + h / 2, 0.0], [0, 0, lean]);
    const f = d / 2 + 0.003;
    const off = (t: number): V => [x + (lean ? (h * t) * Math.sin(-lean * DEG) : 0), y + h * t, f];
    box(GOLD, [w + 0.004, 0.012, 0.006], off(0.18), [0, 0, lean]);
    box(GOLD, [w + 0.004, 0.012, 0.006], off(0.82), [0, 0, lean]);
    if (w > 0.07) box(CREAM, [w * 0.55, 0.03, 0.006], off(0.5), [0, 0, lean]);
    void cx;
  };
  const row = (y: number, x0: number, x1: number, hmin: number, hmax: number, leanEnd = false) => {
    let x = x0;
    while (x < x1) {
      const w = 0.04 + R() * 0.05;
      if (x + w > x1) break;
      const h = hmin + R() * (hmax - hmin);
      const col = BOOKS[Math.floor(R() * BOOKS.length)];
      const isLast = x + w + 0.09 > x1;
      if (leanEnd && isLast) {
        book(x + w / 2 + 0.03, y, w, h, 0.26 + R() * 0.06, col, 14);
      } else book(x + w / 2, y, w, h, 0.26 + R() * 0.08, col);
      x += w + 0.003;
    }
  };
  const flatStack = (x: number, y: number, n: number) => {
    let yy = y;
    for (let i = 0; i < n; i++) {
      const w = 0.3 - i * 0.03;
      const h = 0.05 + R() * 0.02;
      const col = BOOKS[(i * 3 + n) % BOOKS.length];
      const ox = (R() - 0.5) * 0.03;
      box(col, [w, 0.012, 0.22], [x + ox, yy + 0.006, 0]);
      box(col, [w, 0.012, 0.22], [x + ox, yy + h - 0.006, 0]);
      box(col, [0.012, h, 0.22], [x + ox - w / 2 + 0.006, yy + h / 2, 0]);
      box(CREAM, [w - 0.02, h - 0.024, 0.2], [x + ox + 0.004, yy + h / 2, 0.012]);
      box(GOLD, [0.004, h * 0.8, 0.14], [x + ox + w / 2 + 0.0, yy + h / 2, 0.0]);
      yy += h;
    }
    return yy;
  };

  // ---- props ----
  const candle = (x: number, y: number, z: number, h: number) => {
    lathe("#c9a14a", [[0, 0], [0.05, 0], [0.055, 0.012], [0.03, 0.025], [0.012, 0.04], [0, 0.04]], [x, y, z], 8);
    cyl(CREAM, 0.022, 0.025, h, 8, [x, y + 0.04 + h / 2, z]);
    for (const [a, l] of [[0.6, 0.05], [3.0, 0.07], [4.5, 0.04]] as const)
      put(CREAM, new THREE.CapsuleGeometry(0.006, l, 2, 5), [x + Math.cos(a) * 0.024, y + 0.04 + h - l / 2, z + Math.sin(a) * 0.024]);
    cyl("#2a1a14", 0.003, 0.003, 0.02, 4, [x, y + 0.05 + h, z]);
    put("#ff9a2c", new THREE.SphereGeometry(0.02, 7, 5), [x, y + 0.085 + h, z], [0, 0, 0], [0.75, 1.9, 0.75], 1.5);
    put("#fff4b0", new THREE.SphereGeometry(0.011, 6, 4), [x, y + 0.078 + h, z], [0, 0, 0], [0.7, 1.7, 0.7], 1.8);
    // soft halo
    put("#ffd27a", new THREE.OctahedronGeometry(0.008, 0), [x + 0.04, y + 0.14 + h, z], [0, 0, 0], 1, 1.8);
  };
  const orb = (x: number, y: number, z: number, r: number, col: string, core: string) => {
    lathe(GOLD, [[0, 0], [0.09, 0], [0.1, 0.015], [0.05, 0.04], [0.035, 0.08], [0.06, 0.1], [0, 0.1]], [x, y, z], 8);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      put(GOLD, new THREE.ConeGeometry(0.014, 0.07, 4), [x + Math.cos(a) * 0.065, y + 0.1 + 0.03, z + Math.sin(a) * 0.065], [Math.sin(a) * 25, 0, -Math.cos(a) * 25]);
    }
    const cy = y + 0.1 + r * 0.9;
    put(col, new THREE.SphereGeometry(r, 12, 8), [x, cy, z], [0, 0, 0], 1, 0.9);
    put(core, new THREE.OctahedronGeometry(r * 0.45, 0), [x, cy, z], [20, 30, 0], [0.8, 1.3, 0.8], 1.8);
    put("#ffffff", new THREE.SphereGeometry(r * 0.16, 5, 4), [x - r * 0.4, cy + r * 0.45, z + r * 0.55], [0, 0, 0], 1, 1.6);
    put(GOLD, new THREE.TorusGeometry(r * 1.12, 0.007, 4, 14), [x, cy, z], [70, 0, 25]);
  };
  const scrolls = (x: number, y: number) => {
    // little rack of rolled parchment
    box("#6a3a2a", [0.34, 0.02, 0.2], [x, y + 0.01, 0]);
    box("#6a3a2a", [0.02, 0.1, 0.2], [x - 0.16, y + 0.06, 0]);
    box("#6a3a2a", [0.02, 0.1, 0.2], [x + 0.16, y + 0.06, 0]);
    const cols = ["#d94a5a", "#4ab0d9", "#7b3fd1"];
    [[-0.08, 0.05], [0.06, 0.05], [-0.01, 0.12], [0.1, 0.12]].forEach(([dx, dy], i) => {
      const yy = y + 0.04 + dy;
      cyl("#f7e4b8", 0.032, 0.032, 0.3, 8, [x + dx, yy, 0], [0, 0, 90]);
      cyl("#a8743a", 0.036, 0.036, 0.012, 8, [x + dx - 0.14, yy, 0], [0, 0, 90]);
      cyl("#a8743a", 0.036, 0.036, 0.012, 8, [x + dx + 0.14, yy, 0], [0, 0, 90]);
      cyl(cols[i % 3], 0.034, 0.034, 0.02, 8, [x + dx + 0.03, yy, 0], [0, 0, 90]);
    });
  };
  const potion = (x: number, y: number, col: string) => {
    lathe("#bfe8f0", [[0, 0], [0.05, 0], [0.065, 0.04], [0.06, 0.09], [0.02, 0.13], [0.02, 0.17], [0.026, 0.175], [0.026, 0.19], [0, 0.19]], [x, y, 0.02], 8);
    put(col, new THREE.SphereGeometry(0.05, 8, 5), [x, y + 0.05, 0.02], [0, 0, 0], [1, 0.9, 1], 0.8);
    cyl("#c98a52", 0.022, 0.018, 0.035, 6, [x, y + 0.21, 0.02]);
  };

  // shelf 0
  row(SHELF[0], -0.62, -0.05, 0.3, 0.46, true);
  scrolls(0.12, SHELF[0]);
  const top0 = flatStack(0.46, SHELF[0], 4);
  candle(0.46, top0, 0, 0.09);

  // shelf 1
  orb(-0.42, SHELF[1], 0.02, 0.1, "#58d6ff", "#e4ffff");
  row(SHELF[1], -0.24, 0.26, 0.3, 0.46);
  const top1 = flatStack(0.45, SHELF[1], 2);
  candle(0.45, top1, 0, 0.14);
  potion(0.56, top1 - 0.0 > 0 ? SHELF[1] : SHELF[1], "#ff7ac8");

  // shelf 2
  row(SHELF[2], -0.62, -0.18, 0.28, 0.44);
  potion(-0.08, SHELF[2], "#8bff7a");
  potion(0.05, SHELF[2], "#ffd24a");
  row(SHELF[2], 0.17, 0.62, 0.3, 0.42, true);

  // shelf 3
  candle(-0.55, SHELF[3], 0.05, 0.16);
  row(SHELF[3], -0.45, -0.08, 0.28, 0.4);
  orb(0.22, SHELF[3], 0.02, 0.14, "#c28bff", "#fff0ff");
  const top3 = flatStack(0.5, SHELF[3], 3);
  candle(0.5, top3, 0, 0.07);

  // ---- top dressing: wizard hat + candle stack ----
  const hatX = -0.3;
  lathe("#4b2fa0", [[0, 0], [0.3, 0], [0.31, 0.02], [0.28, 0.04], [0.15, 0.06], [0, 0.06]], [hatX, 2.25, 0.0], 12);
  lathe("#5a3cc0", [[0.15, 0], [0.14, 0.12], [0.09, 0.28], [0.04, 0.4], [0, 0.44], [0, 0]], [hatX, 2.28, 0.0], 10);
  put("#ffcf4a", new THREE.CylinderGeometry(0.152, 0.16, 0.035, 10), [hatX, 2.3, 0], [0, 0, 0], 1);
  put("#5a3cc0", new THREE.ConeGeometry(0.06, 0.26, 8), [hatX + 0.09, 2.8, 0], [0, 0, -45], 1);
  put("#ffcf4a", new THREE.OctahedronGeometry(0.03, 0), [hatX - 0.02, 2.55, 0.1], [0, 0, 0], [1, 1, 0.5], 1.4);
  put("#ffcf4a", new THREE.OctahedronGeometry(0.02, 0), [hatX + 0.05, 2.45, 0.1], [0, 0, 0], [1, 1, 0.5], 1.4);
  const t = flatStack(0.38, 2.25, 3);
  candle(0.38, t, 0, 0.12);
  // rune sigil


  // floating sparkles
  for (let i = 0; i < 16; i++) {
    const x = (R() - 0.5) * 1.5;
    const y = 0.5 + R() * 2.3;
    put(i % 2 ? "#fff6b0" : "#9ff5ff", new THREE.OctahedronGeometry(0.014 + R() * 0.01, 0), [x, y, 0.28 + R() * 0.15], [R() * 90, R() * 90, 0], [0.6, 1.4, 0.6], 1.8);
  }
  // cover emblem on the biggest tome of shelf 0 stack
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { bone: root, at: [0.46, top0 - 0.016, 0.115], dir: [0, 1, 0], axis: "z", texture: coverSvg, name: "tomeEmblem" });

  // ---- flush merged buckets ----
  for (const [key, k] of buckets) {
    const m = mergeGeometries(k.geos);
    if (!m) throw new Error("merge failed " + key);
    const p = b.part(m, k.c, { bone: root, at: [0, 0, 0], name: `m_${key}` });
    if (k.g > 0) glow(p, k.g);
  }
  return b.root;
}
