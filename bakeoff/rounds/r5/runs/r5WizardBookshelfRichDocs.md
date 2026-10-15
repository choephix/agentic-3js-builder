```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, grain, gradient, rng, spiral, svg } from "agentic-3js-builder";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "Tall high-fantasy anime bookcase: aubergine wood with gold trim, twisted corner columns, a starry moon pediment, glowing orbs on gold stands, tomes, scroll pyramids, candles, potions and an hourglass.",
};

type V3 = [number, number, number];

const GOLD = "#f2c14e";
const DKGOLD = "#b8862b";
const PAGE = "#f3e9c8";
const PARCH = "#eadbb0";
const PARCH2 = "#d8c28c";
const TAN = "#b58a4a";
const DARKT = "#6e4a26";
const RIB_RED = "#d63a52";
const RIB_TEAL = "#2bb3b0";
const WAX_A = "#fff3d6";
const WAX_B = "#c9a6ff";
const WAX_C = "#ffb3cf";
const DRIP = "#fff9ea";
const WICK = "#2a2230";
const FLAME_O = "#ff9a2a";
const FLAME_Y = "#ffe46b";
const GLASS = "#bfeaff";
const SAND = "#f4c35a";
const WOODF = "#6b3a4a";
const CORK = "#a0693a";
const WHITE = "#ffffff";
const SPARK_A = "#fff7c2";
const SPARK_B = "#c9f4ff";
const COVERS = [
  "#c2314a",
  "#2f55c9",
  "#1f9d9a",
  "#2e9a4e",
  "#7a3fc4",
  "#e08a1e",
  "#e86a9a",
  "#efe6d0",
  "#d9552b",
  "#243a7a",
  "#7d1f3a",
  "#6fd0a8",
];

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const raw: any = rng(2024);
  const rnd = (): number =>
    typeof raw === "function" ? raw() : typeof raw.next === "function" ? raw.next() : raw.random();
  function pick<T>(a: T[]): T {
    return a[Math.floor(rnd() * a.length) % a.length];
  }

  // ---------- merged-geometry batches (one part per colour) ----------
  const batches = new Map<string, THREE.BufferGeometry[]>();
  function addM(color: string, geo: THREE.BufferGeometry, m?: THREE.Matrix4) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (m) g.applyMatrix4(m);
    const arr = batches.get(color) ?? [];
    arr.push(g);
    batches.set(color, arr);
  }
  const mat = (pos: V3, rot: V3, sc: V3) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
  const box = (c: string, w: number, h: number, d: number, pos: V3, rot: V3 = [0, 0, 0]) =>
    addM(c, new THREE.BoxGeometry(w, h, d), mat(pos, rot, [1, 1, 1]));
  const cyl = (c: string, rt: number, rb: number, h: number, pos: V3, rot: V3 = [0, 0, 0], seg = 10) =>
    addM(c, new THREE.CylinderGeometry(rt, rb, h, seg), mat(pos, rot, [1, 1, 1]));
  const sph = (c: string, r: number, pos: V3, sc: V3 = [1, 1, 1], ws = 8, hs = 6) =>
    addM(c, new THREE.SphereGeometry(r, ws, hs), mat(pos, [0, 0, 0], sc));
  const cone = (c: string, r: number, h: number, pos: V3, seg = 8) =>
    addM(c, new THREE.ConeGeometry(r, h, seg), mat(pos, [0, 0, 0], [1, 1, 1]));
  const oct = (c: string, r: number, pos: V3, sc: V3 = [1, 1, 1]) =>
    addM(c, new THREE.OctahedronGeometry(r), mat(pos, [0, 0, 0], sc));
  const torus = (c: string, R: number, t: number, pos: V3, rot: V3) =>
    addM(c, new THREE.TorusGeometry(R, t, 4, 24), mat(pos, rot, [1, 1, 1]));

  // ---------- paints & textures ----------
  const WOOD_V = grain("#5b3345", "#3d2030", { size: 0.025, axis: "y" });
  const WOOD_H = grain("#704055", "#4d2a3a", { size: 0.03, axis: "x" });
  const CROWN = gradient("#3a2f86", "#7a45b8", [0, 2.235, 0], [0, 2.8, 0]);

  let backStars = "";
  for (let i = 0; i < 46; i++) {
    const x = (4 + rnd() * 134).toFixed(1);
    const y = (4 + rnd() * 186).toFixed(1);
    const r = (0.7 + rnd() * 0.9).toFixed(2);
    backStars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${rnd() < 0.5 ? "#fff6c8" : "#bfe9ff"}"/>`;
  }
  for (let i = 0; i < 9; i++) {
    const x = 8 + rnd() * 126;
    const y = 8 + rnd() * 178;
    const s = 2.5 + rnd() * 2;
    backStars += `<path d="M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z" fill="#fff2a8"/>`;
  }
  const backTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 142 194">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2468"/><stop offset="0.55" stop-color="#1b1a4f"/><stop offset="1" stop-color="#2a1747"/></linearGradient>
<radialGradient id="r" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#5b4cc8" stop-opacity="0.6"/><stop offset="1" stop-color="#5b4cc8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="142" height="194" fill="url(#g)"/>
<rect width="142" height="194" fill="url(#r)"/>
<circle cx="71" cy="98" r="46" fill="none" stroke="#7a66f0" stroke-width="1.5" opacity="0.55"/>
<circle cx="71" cy="98" r="38" fill="none" stroke="#7a66f0" stroke-width="1.2" opacity="0.4"/>
<path d="M71 52 L103 120 L36 75 L106 75 L39 120 Z" fill="none" stroke="#8c7bff" stroke-width="1.3" opacity="0.5"/>
<path d="M18 30 L40 46 L62 28 L84 40" fill="none" stroke="#9fd8ff" stroke-width="1.1" opacity="0.5"/>
<path d="M96 150 L112 164 L126 148 L120 172" fill="none" stroke="#9fd8ff" stroke-width="1.1" opacity="0.5"/>
${backStars}
</svg>`,
    { size: 512 },
  );

  function orbTex(light: string, mid: string, dark: string, accent: string) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
<defs><radialGradient id="o" cx="0.5" cy="0.5" r="0.55"><stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
<rect width="128" height="64" fill="url(#o)"/>
<path d="M36 44 C46 12 84 12 92 34 S70 56 58 40" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
<path d="M48 30 C56 22 72 24 76 34" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
<circle cx="52" cy="20" r="2" fill="#ffffff"/><circle cx="82" cy="44" r="1.6" fill="#ffffff"/><circle cx="70" cy="14" r="1.2" fill="#ffffff"/>
</svg>`,
      { size: 256 },
    );
  }
  const texCyan = orbTex("#e6ffff", "#3fd0f0", "#1a4fa8", "#b8fffa");
  const texMagenta = orbTex("#fff0ff", "#e24fd0", "#6a1e9a", "#ffd0f6");
  const texAmber = orbTex("#fffbe0", "#ffb13a", "#b8461c", "#fff0a0");

  // ---------- books ----------
  function bookAt(c: V3, t: number, h: number, d: number, color: string, tilt: number, yaw: number) {
    const m = new THREE.Matrix4()
      .makeTranslation(c[0], c[1], c[2])
      .multiply(new THREE.Matrix4().makeRotationY(yaw))
      .multiply(new THREE.Matrix4().makeRotationZ(tilt));
    const L = (col: string, w: number, hh: number, dd: number, x: number, y: number, z: number) =>
      addM(col, new THREE.BoxGeometry(w, hh, dd).translate(x, y, z), m);
    L(color, t, h, 0.014, 0, 0, d / 2 - 0.007);
    L(color, 0.008, h, d - 0.014, t / 2 - 0.004, 0, -0.007);
    L(color, 0.008, h, d - 0.014, -(t / 2 - 0.004), 0, -0.007);
    L(PAGE, Math.max(0.01, t - 0.016), h - 0.016, d - 0.024, 0, 0, -0.004);
    const fr = rnd() < 0.5 ? [0.14, 0.86] : [0.12, 0.5, 0.88];
    for (const f of fr) L(GOLD, t + 0.004, 0.012, 0.01, 0, -h / 2 + h * f, d / 2 - 0.002);
    if (t > 0.04 && rnd() < 0.6) {
      L(PAGE, t * 0.72, 0.05, 0.004, 0, h * 0.1, d / 2 + 0.002);
      if (rnd() < 0.5) {
        addM(
          rnd() < 0.5 ? "#3ad6c8" : "#ff5fa2",
          new THREE.OctahedronGeometry(0.011).scale(1, 1.4, 0.6).translate(0, -h * 0.18, d / 2 + 0.004),
          m,
        );
      }
    }
  }
  function standBook(x: number, top: number, zFront: number, t: number, h: number, d: number, color: string, tilt = 0) {
    const cy = top + (h / 2) * Math.cos(Math.abs(tilt)) + (t / 2) * Math.sin(Math.abs(tilt));
    bookAt([x, cy, zFront - d / 2], t, h, d, color, tilt, 0);
  }
  function flatBook(cx: number, top: number, cz: number, len: number, t: number, d: number, color: string, yaw: number) {
    bookAt([cx, top + t / 2, cz], t, len, d, color, Math.PI / 2, yaw);
  }
  function row(top: number, x0: number, x1: number, o: { hMin?: number; hMax?: number; lean?: boolean } = {}) {
    const hMin = o.hMin ?? 0.26;
    const hMax = o.hMax ?? 0.34;
    const reserve = o.lean ? 0.16 : 0;
    let x = x0;
    for (;;) {
      const t = 0.032 + rnd() * 0.04;
      if (x + t > x1 - reserve) break;
      const h = hMin + rnd() * (hMax - hMin);
      const d = 0.26 + rnd() * 0.06;
      standBook(x + t / 2, top, 0.155 - rnd() * 0.02, t, h, d, pick(COVERS));
      x += t + 0.002;
    }
    if (o.lean) {
      const a = 0.2 + rnd() * 0.1;
      const t = 0.045;
      const h = hMin + 0.5 * (hMax - hMin);
      const cx = x + (h / 2) * Math.sin(a) + (t / 2) * Math.cos(a) + 0.003;
      standBook(cx, top, 0.15, t, h, 0.3, pick(COVERS), a);
    }
  }

  // ---------- props ----------
  function scroll(x: number, y: number, zFront: number, len: number, r: number, body: string, ribbon: string) {
    const rx: V3 = [Math.PI / 2, 0, 0];
    cyl(body, r, r, len, [x, y, zFront - len / 2], rx, 10);
    cyl(TAN, r * 0.8, r * 0.8, 0.008, [x, y, zFront + 0.002], rx, 10);
    cyl(PARCH, r * 0.6, r * 0.6, 0.012, [x, y, zFront + 0.003], rx, 10);
    cyl(TAN, r * 0.4, r * 0.4, 0.016, [x, y, zFront + 0.004], rx, 8);
    cyl(DARKT, r * 0.15, r * 0.15, 0.02, [x, y, zFront + 0.005], rx, 6);
    cyl(ribbon, r * 1.07, r * 1.07, 0.022, [x, y, zFront - len * 0.55], rx, 10);
  }

  function candle(x: number, y: number, z: number, h: number, r: number, wax: string, drips: number) {
    cyl(wax, r, r * 1.05, h, [x, y + h / 2, z], [0, 0, 0], 10);
    for (let i = 0; i < drips; i++) {
      const a = rnd() * Math.PI * 2;
      const L = 0.03 + rnd() * 0.05;
      const dx = Math.cos(a) * (r + 0.002);
      const dz = Math.sin(a) * (r + 0.002);
      cyl(DRIP, 0.0045, 0.0045, L, [x + dx, y + h - L / 2, z + dz], [0, 0, 0], 5);
      sph(DRIP, 0.0065, [x + dx, y + h - L, z + dz], [1, 1, 1], 6, 4);
    }
    cyl(WICK, 0.0016, 0.0016, 0.018, [x, y + h + 0.007, z], [0, 0, 0], 4);
    sph(FLAME_O, 0.012, [x, y + h + 0.02, z], [1, 1.15, 1], 8, 6);
    cone(FLAME_O, 0.012, 0.045, [x, y + h + 0.0425, z], 8);
    sph(FLAME_Y, 0.007, [x, y + h + 0.02, z], [1, 1.2, 1], 6, 4);
    cone(FLAME_Y, 0.007, 0.032, [x, y + h + 0.036, z], 6);
  }
  function dish(x: number, y: number, z: number) {
    cyl(DKGOLD, 0.05, 0.056, 0.012, [x, y + 0.006, z], [0, 0, 0], 12);
    torus(GOLD, 0.052, 0.004, [x, y + 0.012, z], [Math.PI / 2, 0, 0]);
  }

  const STAND: any[] = [
    [0, 0],
    [0.07, 0],
    [0.072, 0.012],
    [0.05, 0.022],
    [0.022, 0.04],
    [0.02, 0.06],
    [0.045, 0.085],
    [0.05, 0.095],
    [0.035, 0.09],
    [0, 0.07],
  ];
  function orb(x: number, y: number, z: number, R: number, tex: any) {
    b.lathe(STAND, { at: [x, y, z], color: DKGOLD, segments: 10 });
    const cy = y + 0.095 + Math.sqrt(R * R - 0.0025) - 0.004;
    b.part(new THREE.SphereGeometry(R, 14, 10), WHITE, { at: [x, cy, z], rotation: [0, -90, 0], texture: tex });
    torus(GOLD, R * 1.28, 0.0045, [x, cy, z], [0.9, 0, 0.3]);
    torus(GOLD, R * 1.28, 0.0045, [x, cy, z], [-0.4, 0.6, 1.2]);
    sph(WHITE, R * 0.12, [x - R * 0.4, cy + R * 0.55, z + R * 0.72], [1, 1, 0.6], 6, 4);
    for (let i = 0; i < 5; i++) {
      const a = rnd() * Math.PI * 2;
      oct(i % 2 ? SPARK_A : SPARK_B, 0.009, [x + Math.cos(a) * R * 1.9, cy + (rnd() * 1.4 - 0.5) * R, z + Math.sin(a) * R * 1.9], [1, 1.7, 1]);
    }
  }

  function hourglass(x: number, top: number, z: number) {
    cyl(WOODF, 0.052, 0.052, 0.014, [x, top + 0.007, z], [0, 0, 0], 12);
    cyl(WOODF, 0.052, 0.052, 0.014, [x, top + 0.133, z], [0, 0, 0], 12);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      cyl(GOLD, 0.004, 0.004, 0.12, [x + Math.cos(a) * 0.043, top + 0.07, z + Math.sin(a) * 0.043], [0, 0, 0], 5);
    }
    cyl(SAND, 0.006, 0.04, 0.055, [x, top + 0.0415, z], [0, 0, 0], 8);
    cyl(GLASS, 0.006, 0.006, 0.008, [x, top + 0.072, z], [0, 0, 0], 6);
    cyl(GLASS, 0.04, 0.006, 0.055, [x, top + 0.1025, z], [0, 0, 0], 8);
  }

  function potion(x: number, top: number, z: number, r: number, col: string) {
    sph(col, r, [x, top + r, z], [1, 1.05, 1], 10, 8);
    const nh = r * 1.1;
    cyl(col, r * 0.3, r * 0.34, nh, [x, top + 1.9 * r + nh / 2, z], [0, 0, 0], 8);
    cyl(DKGOLD, r * 0.42, r * 0.42, 0.008, [x, top + 1.9 * r + nh, z], [0, 0, 0], 8);
    cyl(CORK, r * 0.28, r * 0.32, r * 0.5, [x, top + 1.9 * r + nh + r * 0.25, z], [0, 0, 0], 8);
    sph(WHITE, r * 0.13, [x - r * 0.4, top + r * 1.4, z + r * 0.85], [1, 1.5, 0.6], 5, 4);
  }

  // ---------- cabinet structure ----------
  const S = [0.2, 0.62, 1.02, 1.42, 1.8];

  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) cyl(DKGOLD, 0.05, 0.06, 0.08, [sx * 0.7, 0.04, sz * 0.18], [0, 0, 0], 8);

  // plinth + shelves
  b.part(new THREE.BoxGeometry(1.58, 0.12, 0.46), WOOD_H, { at: [0, 0.14, 0] });
  box(DKGOLD, 1.6, 0.02, 0.01, [0, 0.12, 0.235]);
  box(GOLD, 1.5, 0.012, 0.008, [0, 0.19, 0.232]);
  for (let i = 1; i < 5; i++) {
    b.part(new THREE.BoxGeometry(1.38, 0.04, 0.4), WOOD_H, { at: [0, S[i] - 0.02, 0.01] });
    box(DKGOLD, 1.38, 0.028, 0.012, [0, S[i] - 0.016, 0.216]);
  }
  // sides
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.07, 1.94, 0.42), WOOD_V, { at: [s * 0.725, 1.17, 0] });
  // back
  box("#241a40", 1.4, 1.94, 0.02, [0, 1.17, -0.2]);
  b.part(new THREE.PlaneGeometry(1.38, 1.94), WHITE, { at: [0, 1.17, -0.187], dir: [0, 0, 1], axis: "z", texture: backTex });
  // top & cornice
  b.part(new THREE.BoxGeometry(1.62, 0.06, 0.48), WOOD_H, { at: [0, 2.17, 0] });
  b.part(new THREE.BoxGeometry(1.68, 0.035, 0.52), WOOD_H, { at: [0, 2.2175, 0] });
  box(GOLD, 1.62, 0.02, 0.012, [0, 2.15, 0.246]);
  box(GOLD, 1.68, 0.012, 0.012, [0, 2.235, 0.262]);
  box(DKGOLD, 1.64, 0.014, 0.012, [0, 2.2, 0.254]);

  // twisted corner columns
  for (const s of [1, -1]) {
    const cx = s * 0.745;
    const cz = 0.2;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 1.94, 8), WOOD_V, { at: [cx, 1.17, cz] });
    cyl(GOLD, 0.045, 0.045, 0.03, [cx, 0.215, cz], [0, 0, 0], 8);
    cyl(GOLD, 0.045, 0.045, 0.03, [cx, 2.125, cz], [0, 0, 0], 8);
    cyl(DKGOLD, 0.038, 0.038, 0.02, [cx, 2.0, cz], [0, 0, 0], 8);
    cyl(DKGOLD, 0.038, 0.038, 0.02, [cx, 0.34, cz], [0, 0, 0], 8);
    const coil = spiral([cx, 0.24, cz], [cx + 0.037, 0.24, cz], [0, 1, 0], { turns: 8.5, r1: 0.037, pitch: 0.2 });
    b.sweep(coil, 0.006, { color: GOLD, sides: 4 });
  }

  // side inlays
  const starPts = (R: number, r: number) => {
    const pts: any[] = [];
    for (let i = 0; i < 10; i++) {
      const ang = Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? R : r;
      const p: any = [Math.cos(ang) * rad, Math.sin(ang) * rad];
      if (i % 2 === 0) p.push("sharp");
      pts.push(p);
    }
    return pts;
  };
  for (const s of [1, -1]) {
    const x = s * 0.763;
    b.extrude(starPts(0.08, 0.034), { at: [x, 1.2, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: GOLD });
    b.extrude(starPts(0.04, 0.017), { at: [x, 0.7, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: GOLD });
    b.extrude(starPts(0.04, 0.017), { at: [x, 1.72, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: GOLD });
  }

  // pediment
  const sy = 0.58;
  const halfR: number[][] = [
    [0.84, 0.06],
    [0.7, 0.1],
    [0.56, 0.15],
    [0.44, 0.23],
    [0.34, 0.34],
    [0.25, 0.47],
    [0.17, 0.6],
    [0.1, 0.72],
    [0.04, 0.82],
  ];
  const ped: any[] = [
    [-0.84, 0, "sharp"],
    [0.84, 0, "sharp"],
    ...halfR.map((p) => [p[0], p[1] * sy]),
    [0, 0.9 * sy, "sharp"],
    ...halfR
      .slice()
      .reverse()
      .map((p) => [-p[0], p[1] * sy]),
  ];
  const pedBorder = ped.map((p) => {
    const q: any = [p[0] * 1.045, p[1] * 1.07 - 0.012];
    if (p.length > 2) q.push("sharp");
    return q;
  });
  b.extrude(pedBorder, { at: [0, 2.235, 0.06], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: GOLD });
  b.extrude(ped, { at: [0, 2.235, 0.06], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.008, color: CROWN });

  // moon
  const moonPts = (R: number, rotDeg: number) => {
    const c = 0.45;
    const r = 0.8;
    const xi = (1 - r * r + c * c) / (2 * c);
    const yi = Math.sqrt(1 - xi * xi);
    const th0 = Math.atan2(yi, xi);
    const pts: number[][] = [];
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const th = th0 + ((2 * Math.PI - 2 * th0) * i) / n;
      pts.push([Math.cos(th), Math.sin(th)]);
    }
    const phiLow = Math.atan2(-yi, xi - c);
    const phiUp = Math.atan2(yi, xi - c);
    const m = 10;
    for (let i = 1; i < m; i++) {
      const phi = phiLow + ((phiUp - 2 * Math.PI - phiLow) * i) / m;
      pts.push([c + r * Math.cos(phi), r * Math.sin(phi)]);
    }
    const a = (rotDeg * Math.PI) / 180;
    return pts.map((p) => [R * (p[0] * Math.cos(a) - p[1] * Math.sin(a)), R * (p[0] * Math.sin(a) + p[1] * Math.cos(a))]);
  };
  b.extrude(moonPts(0.11, 30) as any, { at: [0, 2.235 + 0.28, 0.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: GOLD });
  oct("#3ad6c8", 0.03, [0, 2.235 + 0.1, 0.108], [1, 1.5, 0.7]);
  torus(GOLD, 0.04, 0.005, [0, 2.235 + 0.1, 0.1], [0, 0, 0]);
  for (const s of [1, -1]) {
    b.extrude(starPts(0.034, 0.014), { at: [s * 0.42, 2.235 + 0.075, 0.098], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GOLD });
    b.extrude(starPts(0.02, 0.009), { at: [s * 0.25, 2.235 + 0.17, 0.098], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GOLD });
  }

  // finials
  const FIN: any[] = [
    [0, 0],
    [0.03, 0],
    [0.03, 0.02],
    [0.018, 0.03],
    [0.018, 0.06],
    [0.032, 0.08],
    [0.032, 0.095],
    [0.018, 0.11],
    [0, 0.16],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) b.lathe(FIN, { at: [sx * 0.79, 2.235, sz * 0.225], color: GOLD, segments: 8 });

  // ---------- shelf 0 : tomes and scroll cubby ----------
  row(S[0], -0.68, -0.05, { hMin: 0.28, hMax: 0.36, lean: true });
  cyl(COVERS[4], 0.034, 0.034, 0.3, [0.05, S[0] + 0.15, 0.02], [0, 0, 0], 10);
  cyl(GOLD, 0.038, 0.038, 0.025, [0.05, S[0] + 0.3, 0.02], [0, 0, 0], 10);
  cyl(GOLD, 0.038, 0.038, 0.02, [0.05, S[0] + 0.012, 0.02], [0, 0, 0], 10);
  cyl(GOLD, 0.037, 0.037, 0.012, [0.05, S[0] + 0.15, 0.02], [0, 0, 0], 10);
  b.part(new THREE.BoxGeometry(0.03, 0.38, 0.38), WOOD_V, { at: [0.14, 0.39, 0] });
  const pyr = [5, 4, 3, 2];
  for (let ri = 0; ri < pyr.length; ri++) {
    for (let ci = 0; ci < pyr[ri]; ci++) {
      const x = 0.425 + (ci - (pyr[ri] - 1) / 2) * 0.098;
      scroll(x, S[0] + 0.047 + ri * 0.085, 0.13 - rnd() * 0.05, 0.25 + rnd() * 0.05, 0.045, pick([PARCH, PARCH, PARCH2]), pick([RIB_RED, RIB_TEAL, GOLD]));
    }
  }

  // ---------- shelf 1 : tomes, cyan orb, stack ----------
  row(S[1], -0.68, 0.14, { hMin: 0.25, hMax: 0.33, lean: true });
  orb(0.36, S[1], 0.0, 0.085, texCyan);
  flatBook(0.585, S[1], 0.05, 0.15, 0.04, 0.22, COVERS[1], 0.15);
  flatBook(0.58, S[1] + 0.04, 0.05, 0.13, 0.036, 0.2, COVERS[0], -0.2);
  dish(0.585, S[1] + 0.076, 0.05);
  candle(0.585, S[1] + 0.088, 0.05, 0.08, 0.016, WAX_C, 2);

  // ---------- shelf 2 : hourglass, candle stack ----------
  row(S[2], -0.68, -0.3, { hMin: 0.26, hMax: 0.34, lean: true });
  hourglass(-0.14, S[2], 0.02);
  flatBook(0.16, S[2], 0.04, 0.22, 0.045, 0.24, COVERS[3], 0.12);
  flatBook(0.16, S[2] + 0.045, 0.04, 0.18, 0.04, 0.2, COVERS[5], -0.18);
  dish(0.16, S[2] + 0.085, 0.04);
  candle(0.16, S[2] + 0.097, 0.04, 0.12, 0.022, WAX_A, 3);
  row(S[2], 0.34, 0.68, { hMin: 0.25, hMax: 0.33, lean: true });

  // ---------- shelf 3 : candle cluster, potions ----------
  row(S[3], -0.68, -0.1, { hMin: 0.22, hMax: 0.3, lean: true });
  cyl(DKGOLD, 0.12, 0.13, 0.012, [0.17, S[3] + 0.006, 0.0], [0, 0, 0], 12);
  torus(GOLD, 0.125, 0.005, [0.17, S[3] + 0.012, 0.0], [Math.PI / 2, 0, 0]);
  candle(0.12, S[3] + 0.012, 0.03, 0.15, 0.024, WAX_A, 3);
  candle(0.22, S[3] + 0.012, -0.02, 0.09, 0.02, WAX_B, 2);
  candle(0.17, S[3] + 0.012, -0.07, 0.21, 0.026, WAX_C, 3);
  potion(0.44, S[3], 0.03, 0.045, "#ff6fa8");
  potion(0.54, S[3], 0.03, 0.055, "#b44cff");
  potion(0.63, S[3], 0.03, 0.04, "#4dd8ff");

  // ---------- shelf 4 : magenta orb, tomes, stack ----------
  orb(-0.47, S[4], 0.0, 0.08, texMagenta);
  row(S[4], -0.3, 0.15, { hMin: 0.24, hMax: 0.31, lean: true });
  flatBook(0.42, S[4], 0.04, 0.24, 0.045, 0.24, COVERS[6], -0.1);
  flatBook(0.42, S[4] + 0.045, 0.04, 0.2, 0.045, 0.22, COVERS[9], 0.2);
  dish(0.42, S[4] + 0.09, 0.04);
  candle(0.42, S[4] + 0.102, 0.04, 0.1, 0.022, WAX_B, 3);
  potion(0.62, S[4], 0.04, 0.035, "#4dffb0");

  // ---------- cabinet top ----------
  orb(-0.6, 2.235, 0.15, 0.085, texAmber);
  flatBook(0.58, 2.235, 0.16, 0.26, 0.045, 0.2, COVERS[2], 0.1);
  flatBook(0.58, 2.28, 0.16, 0.22, 0.04, 0.18, COVERS[10], -0.15);
  flatBook(0.58, 2.32, 0.16, 0.18, 0.04, 0.16, COVERS[7], 0.2);
  dish(0.58, 2.36, 0.16);
  candle(0.58, 2.372, 0.16, 0.12, 0.022, WAX_A, 3);

  // ---------- floor props ----------
  const lens = [0.3, 0.27, 0.24, 0.2];
  const ths = [0.05, 0.045, 0.04, 0.04];
  let ty = 0;
  for (let i = 0; i < 4; i++) {
    flatBook(-1.08, ty, 0.12, lens[i], ths[i], 0.22 - i * 0.015, pick(COVERS), (rnd() - 0.5) * 0.5);
    ty += ths[i];
  }
  dish(-1.08, ty, 0.12);
  candle(-1.08, ty + 0.012, 0.12, 0.2, 0.028, WAX_A, 4);
  potion(1.0, 0, 0.18, 0.07, "#b44cff");
  potion(1.14, 0, 0.1, 0.055, "#ff6fa8");
  potion(1.06, 0, 0.3, 0.045, "#4dd8ff");
  cyl(COVERS[4], 0.04, 0.04, 0.34, [1.18, 0.17, 0.3], [0, 0, 0], 10);
  cyl(GOLD, 0.044, 0.044, 0.03, [1.18, 0.34, 0.3], [0, 0, 0], 10);
  cyl(GOLD, 0.044, 0.044, 0.03, [1.18, 0.015, 0.3], [0, 0, 0], 10);

  // ---------- flush batches into parts ----------
  for (const [color, arr] of batches) {
    const g = mergeGeometries(arr);
    if (g) b.part(g, color, { bone: root, at: [0, 0, 0] });
  }

  return b.root;
}
```