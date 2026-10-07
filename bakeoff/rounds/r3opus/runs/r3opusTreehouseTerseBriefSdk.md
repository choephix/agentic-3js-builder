```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly treehouse: a chunky oak with a plank cabin on a deck, shingled gable roof, ladder, rope swing, pulley bucket, bunting, lantern, weathervane, and a little owl peeking from a knot hole.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });

  const r0: any = rng(7);
  const rand = (): number =>
    typeof r0 === "function"
      ? r0()
      : typeof r0.next === "function"
      ? r0.next()
      : typeof r0.float === "function"
      ? r0.float()
      : r0.random();
  const pick = <T,>(a: T[]): T => a[Math.min(a.length - 1, Math.floor(rand() * a.length))];

  // ---------- palette ----------
  const C = {
    bark: "#6b4a33",
    barkDark: "#4e3424",
    barkLight: "#86603f",
    wood1: "#c98b4f",
    wood2: "#b9783f",
    wood3: "#d9a066",
    rail: "#a86a36",
    baluster: "#e9c48a",
    trim: "#f2e6c9",
    core: "#3b2a1e",
    gable: "#e3a95c",
    roof1: "#c4473a",
    roof2: "#a8362d",
    roof3: "#d2584a",
    roofUnder: "#5a2a22",
    ridge: "#7a2a24",
    leaf1: "#4f9a3c",
    leaf2: "#6cbb47",
    leaf3: "#3a7a34",
    leaf4: "#8fcf55",
    fruit: "#e2453c",
    glass: "#2f5d7c",
    glassLight: "#9fd4e8",
    door: "#3f6f8f",
    doorLine: "#335a74",
    shutter: "#4d8f6a",
    gold: "#e8b84a",
    rope: "#d8c18a",
    metal: "#3a3a3a",
    tin: "#8a9aa6",
    glow: "#ffd257",
    grass: "#5fa83f",
    grassDark: "#4a8a33",
    tuft: "#78c24e",
    rock: "#8d8f93",
    rockDark: "#6f7175",
    mushRed: "#d93b30",
    mushDot: "#fff4e0",
    stem: "#efe3c8",
    pink: "#ff7eb6",
    yellow: "#ffd84d",
    white: "#ffffff",
    flagBlue: "#4aa3df",
    flagYellow: "#f7c843",
    flagGreen: "#6cc070",
    flagRed: "#e5533d",
    dark: "#1e140d",
    black: "#111111",
    pot: "#c8643c",
    moss: "#7fae4a",
    sign: "#e8d3a0",
  };

  // ---------- helpers ----------
  const put = (g: THREE.BufferGeometry, color: string, at: number[]) => {
    b.part(g, color, { at: [at[0], at[1], at[2]] });
  };
  const box = (
    w: number, h: number, d: number, color: string, at: number[],
    rx = 0, ry = 0, rz = 0
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rz) g.rotateZ(rz);
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    put(g, color, at);
  };
  const cyl = (a: number[], c: number[], ra: number, rc: number, color: string, seg = 8) => {
    const dx = c[0] - a[0], dy = c[1] - a[1], dz = c[2] - a[2];
    const len = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(rc, ra, len, seg);
    const th = Math.acos(Math.max(-1, Math.min(1, dy / len)));
    const ph = Math.atan2(dz, dx);
    g.rotateZ(-th);
    g.rotateY(-ph);
    put(g, color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2]);
  };
  const ball = (r: number, color: string, at: number[], detail = 0, sy = 1) => {
    const g = new THREE.IcosahedronGeometry(r, detail);
    if (sy !== 1) g.scale(1, sy, 1);
    put(g, color, at);
  };
  const disc = (r: number, t: number, color: string, at: number[], axis: "x" | "y" | "z", seg = 10) => {
    const g = new THREE.CylinderGeometry(r, r, t, seg);
    if (axis === "z") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    put(g, color, at);
  };
  const tri = (pts: number[][], depth: number, color: string, at: number[], ry = 0) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    if (ry) g.rotateY(ry);
    put(g, color, at);
  };

  // ---------- ground ----------
  const G = [-0.2, 0, 0.4];
  put(new THREE.CylinderGeometry(4.1, 4.25, 0.07, 14), C.grassDark, [G[0], 0.035, G[2]]);
  put(new THREE.CylinderGeometry(3.85, 4.05, 0.12, 14), C.grass, [G[0], 0.06, G[2]]);

  // ---------- trunk ----------
  const TX = 0, TZ = -1.3;
  const T = [
    [TX, 0.0, TZ], [TX + 0.05, 1.6, TZ - 0.02], [TX, 3.2, TZ],
    [TX - 0.08, 5.0, TZ + 0.05], [TX + 0.05, 6.6, TZ], [TX, 7.8, TZ],
  ];
  const TR = [0.62, 0.52, 0.48, 0.42, 0.36, 0.26];
  for (let i = 0; i < T.length - 1; i++) {
    cyl(T[i], T[i + 1], TR[i], TR[i + 1], i % 2 ? C.barkLight : C.bark, 9);
    if (i > 0) ball(TR[i] * 1.01, i % 2 ? C.barkLight : C.bark, T[i], 1);
  }
  // flare + roots
  cyl([TX, 0.02, TZ], [TX, 0.75, TZ], 0.9, 0.58, C.barkDark, 9);
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 + 15) * (Math.PI / 180) + rand() * 0.3;
    const ca = Math.cos(a), sa = Math.sin(a);
    const L = 1.3 + rand() * 0.4;
    cyl([TX + ca * 0.35, 0.5, TZ + sa * 0.35], [TX + ca * L, 0.06, TZ + sa * L], 0.27, 0.07, C.barkDark, 6);
  }
  // moss patches
  for (let k = 0; k < 4; k++) {
    const a = rand() * Math.PI * 2;
    ball(0.16 + rand() * 0.08, C.moss, [TX + Math.cos(a) * 0.6, 0.35 + rand() * 0.3, TZ + Math.sin(a) * 0.6], 0, 0.5);
  }
  // knot hole with owl eyes
  {
    const g = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10);
    g.rotateX(Math.PI / 2);
    g.scale(1, 1.3, 1);
    put(g, C.dark, [0.04, 1.9, -0.79]);
    const t = new THREE.TorusGeometry(0.16, 0.04, 4, 10);
    t.scale(1, 1.3, 1);
    put(t, C.barkDark, [0.04, 1.9, -0.78]);
    for (const s of [-1, 1]) {
      ball(0.045, C.yellow, [0.04 + s * 0.055, 1.95, -0.75], 1);
      ball(0.022, C.black, [0.04 + s * 0.055, 1.95, -0.71], 0);
    }
    const beak = new THREE.ConeGeometry(0.02, 0.05, 4);
    beak.rotateX(Math.PI);
    put(beak, C.flagYellow, [0.04, 1.89, -0.73]);
  }

  // ---------- branches ----------
  const swingA = [-0.3, 4.2, -1.4], swingB = [-3.3, 5.0, -0.3];
  cyl(swingA, swingB, 0.24, 0.09, C.bark, 7);
  cyl([-2.0, 4.65, -0.78], [-2.5, 5.6, -0.9], 0.08, 0.04, C.bark, 6);
  const rightA = [0.3, 5.4, -1.35], rightB = [2.9, 6.5, -0.9];
  cyl(rightA, rightB, 0.22, 0.09, C.bark, 7);
  cyl([1.6, 5.95, -1.12], [1.9, 6.8, -1.6], 0.07, 0.035, C.bark, 6);
  cyl([0, 7.3, TZ], [1.5, 8.6, -0.9], 0.2, 0.08, C.bark, 7);
  cyl([0, 7.3, TZ], [-1.4, 8.5, -1.8], 0.2, 0.08, C.bark, 7);
  cyl([0, 7.5, TZ], [0.3, 8.8, -2.5], 0.18, 0.07, C.bark, 7);

  // ---------- foliage ----------
  const leaves = [C.leaf1, C.leaf2, C.leaf3];
  const clusters: number[][] = [
    [0, 9.3, -1.4, 1.7], [1.6, 8.5, -0.8, 1.25], [-1.7, 8.6, -1.7, 1.35],
    [0.4, 8.4, -2.9, 1.2], [-0.4, 8.3, 0.1, 1.1], [1.2, 9.8, -2.0, 1.0],
    [-1.0, 9.9, -0.7, 1.0], [3.0, 6.9, -0.9, 0.85], [-3.6, 5.5, -0.2, 0.8],
    [2.2, 7.6, -2.2, 0.9], [-2.4, 7.7, -0.4, 0.85],
  ];
  for (const [x, y, z, r] of clusters) {
    ball(r, pick(leaves), [x, y, z], 1, 0.85);
    for (let k = 0; k < 3; k++) {
      const a = rand() * Math.PI * 2;
      const e = 0.3 + rand() * 0.6;
      ball(r * (0.45 + rand() * 0.15), k === 0 ? C.leaf4 : C.leaf2,
        [x + Math.cos(a) * Math.cos(e) * r * 0.7, y + Math.sin(e) * r * 0.6, z + Math.sin(a) * Math.cos(e) * r * 0.7], 0);
    }
    const nf = r > 1 ? 4 : 2;
    for (let k = 0; k < nf; k++) {
      const a = rand() * Math.PI * 2;
      const e = -0.2 + rand() * 0.9;
      ball(0.07, C.fruit,
        [x + Math.cos(a) * Math.cos(e) * r * 0.97, y + Math.sin(e) * r * 0.85 * 0.97, z + Math.sin(a) * Math.cos(e) * r * 0.97], 0);
    }
  }

  // ---------- platform ----------
  const FY = 3.2;
  for (let i = 0; i < 19; i++) {
    const z = -1.6 + 0.09 + i * 0.18;
    box(3.5 + (i % 3) * 0.04, 0.08, 0.17, pick([C.wood1, C.wood2, C.wood3]), [((i % 2) - 0.5) * 0.03, FY - 0.04, z]);
  }
  box(3.56, 0.2, 0.12, C.wood2, [0, FY - 0.18, 1.76]);
  box(3.56, 0.2, 0.12, C.wood2, [0, FY - 0.18, -1.56]);
  for (const x of [-1.62, 0.8, 1.62]) box(0.12, 0.2, 3.4, C.rail, [x, FY - 0.18, 0.1]);
  // stilts and braces
  for (const s of [-1, 1]) {
    cyl([s * 1.55, 0.05, 1.65], [s * 1.55, FY - 0.25, 1.65], 0.11, 0.1, C.barkLight, 7);
    box(0.32, 0.12, 0.32, C.rock, [s * 1.55, 0.12, 1.65], 0, 0.3);
    cyl([s * 0.35, 2.1, -1.2], [s * 1.45, FY - 0.25, 0.0], 0.08, 0.07, C.barkLight, 6);
    cyl([s * 1.55, 2.3, 1.65], [s * 1.55, FY - 0.25, 0.9], 0.06, 0.06, C.wood2, 6);
  }
  cyl([-1.5, 0.7, 1.65], [1.5, 2.8, 1.65], 0.055, 0.055, C.wood2, 6);

  // ---------- cabin walls ----------
  box(2.1, 1.9, 1.7, C.core, [0, FY + 0.95, 0]);
  for (let i = 0; i < 10; i++) {
    const y = FY + 0.095 + i * 0.19;
    const off = (i % 2) * 0.008;
    box(2.2, 0.175, 0.06, pick([C.wood1, C.wood2, C.wood3]), [0, y, 0.87 + off]);
    box(2.2, 0.175, 0.06, pick([C.wood1, C.wood2, C.wood3]), [0, y, -0.87 - off]);
    box(0.06, 0.175, 1.74, pick([C.wood1, C.wood2, C.wood3]), [1.07 + off, y, 0]);
    box(0.06, 0.175, 1.74, pick([C.wood1, C.wood2, C.wood3]), [-1.07 - off, y, 0]);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.14, 1.95, 0.14, C.trim, [sx * 1.1, FY + 0.975, sz * 0.9]);
  box(2.3, 0.1, 0.08, C.trim, [0, FY + 1.9, 0.92]);
  box(2.3, 0.1, 0.08, C.trim, [0, FY + 1.9, -0.92]);

  // door
  const DX = -0.45;
  box(0.66, 1.35, 0.04, C.door, [DX, FY + 0.675, 0.92]);
  {
    const g = new THREE.CylinderGeometry(0.33, 0.33, 0.04, 10, 1, false, -Math.PI / 2, Math.PI);
    g.rotateX(-Math.PI / 2);
    put(g, C.door, [DX, FY + 1.35, 0.92]);
    const t = new THREE.TorusGeometry(0.365, 0.04, 4, 10, Math.PI);
    put(t, C.trim, [DX, FY + 1.35, 0.94]);
  }
  for (const s of [-1, 1]) {
    box(0.02, 1.25, 0.01, C.doorLine, [DX + s * 0.11, FY + 0.65, 0.945]);
    box(0.07, 1.37, 0.06, C.trim, [DX + s * 0.365, FY + 0.685, 0.94]);
  }
  ball(0.035, C.gold, [DX + 0.24, FY + 0.7, 0.96], 0);
  disc(0.1, 0.02, C.glassLight, [DX, FY + 1.2, 0.95], "z", 8);
  put(new THREE.TorusGeometry(0.1, 0.025, 4, 8), C.gold, [DX, FY + 1.2, 0.955]);
  box(0.8, 0.06, 0.2, C.wood2, [DX, FY + 0.03, 1.02]);

  // front window
  const WX = 0.55, WY = FY + 1.05;
  box(0.5, 0.5, 0.03, C.glass, [WX, WY, 0.92]);
  box(0.4, 0.06, 0.01, C.glassLight, [WX - 0.05, WY + 0.06, 0.94], 0, 0, Math.PI / 4);
  box(0.58, 0.05, 0.05, C.trim, [WX, WY + 0.27, 0.94]);
  box(0.58, 0.05, 0.05, C.trim, [WX, WY - 0.27, 0.94]);
  box(0.05, 0.58, 0.05, C.trim, [WX - 0.27, WY, 0.94]);
  box(0.05, 0.58, 0.05, C.trim, [WX + 0.27, WY, 0.94]);
  box(0.03, 0.5, 0.03, C.trim, [WX, WY, 0.94]);
  box(0.5, 0.03, 0.03, C.trim, [WX, WY, 0.94]);
  for (const s of [-1, 1]) {
    const sx = WX + s * 0.41;
    box(0.21, 0.6, 0.035, C.shutter, [sx, WY, 0.93]);
    box(0.17, 0.04, 0.01, C.trim, [sx, WY + 0.2, 0.95]);
    box(0.17, 0.04, 0.01, C.trim, [sx, WY - 0.2, 0.95]);
    box(0.035, 0.42, 0.01, C.trim, [sx, WY, 0.95], 0, 0, s * 0.42);
  }
  box(0.62, 0.14, 0.16, C.wood2, [WX, WY - 0.36, 1.0]);
  for (let i = 0; i < 7; i++) {
    const x = WX - 0.26 + i * 0.087;
    cyl([x, WY - 0.3, 1.0], [x, WY - 0.2, 1.0], 0.008, 0.008, C.leaf3, 4);
    ball(0.04, [C.pink, C.yellow, C.white, C.flagRed][i % 4], [x, WY - 0.19, 1.0 + (i % 2) * 0.03], 0);
    ball(0.035, C.leaf2, [x + 0.03, WY - 0.27, 1.04], 0);
  }

  // side portholes
  for (const s of [-1, 1]) {
    const t = new THREE.TorusGeometry(0.24, 0.05, 5, 10);
    t.rotateY(Math.PI / 2);
    put(t, C.trim, [s * 1.12, FY + 1.1, 0]);
    disc(0.21, 0.03, C.glass, [s * 1.1, FY + 1.1, 0], "x", 10);
    box(0.02, 0.06, 0.32, C.glassLight, [s * 1.12, FY + 1.16, -0.03], 0.6, 0, 0);
    box(0.03, 0.42, 0.03, C.trim, [s * 1.12, FY + 1.1, 0]);
    box(0.03, 0.03, 0.42, C.trim, [s * 1.12, FY + 1.1, 0]);
  }

  // gables
  for (const s of [-1, 1]) {
    tri([[-0.95, 0], [0.95, 0], [0, 0.88]], 0.06, C.gable, [s * 1.08, FY + 1.9, 0], Math.PI / 2);
    disc(0.11, 0.03, C.dark, [s * 1.12, FY + 2.28, 0], "x", 8);
    const t = new THREE.TorusGeometry(0.12, 0.03, 4, 8);
    t.rotateY(Math.PI / 2);
    put(t, C.trim, [s * 1.13, FY + 2.28, 0]);
  }

  // ---------- roof ----------
  const EY = 4.85, EZ = 1.2, RY = 6.0;
  const alpha = Math.atan2(RY - EY, EZ);
  const RL = Math.hypot(RY - EY, EZ);
  for (const s of [1, -1]) {
    const ny = Math.cos(alpha), nz = s * Math.sin(alpha);
    const pt = (t: number, off: number) => [EY + (RY - EY) * t + ny * off, s * EZ * (1 - t) + nz * off];
    const m = pt(0.5, 0.03);
    box(2.9, 0.06, RL + 0.05, C.roofUnder, [0, m[0], m[1]], s * alpha);
    for (let k = 0; k < 7; k++) {
      const t = 0.07 + k * 0.145;
      const p = pt(t, 0.075 + (6 - k) * 0.008);
      for (let j = 0; j < 11; j++) {
        const x = -1.3 + j * 0.29 - (k % 2) * 0.145;
        if (x < -1.42 || x > 1.42) continue;
        const g = new THREE.BoxGeometry(0.27, 0.035, 0.3);
        g.rotateY((rand() - 0.5) * 0.08);
        g.rotateX(s * (alpha + 0.06));
        put(g, pick([C.roof1, C.roof2, C.roof3]), [x, p[0], p[1]]);
      }
    }
    box(2.98, 0.1, 0.05, C.trim, [0, EY - 0.02, s * (EZ + 0.02)]);
    for (const sx of [-1, 1]) {
      const q = pt(0.5, 0.06);
      box(0.06, 0.12, RL + 0.08, C.trim, [sx * 1.47, q[0], q[1]], s * alpha);
    }
  }
  box(3.0, 0.15, 0.15, C.ridge, [0, RY + 0.08, 0], Math.PI / 4);
  for (const sx of [-1, 1]) ball(0.08, C.gold, [sx * 1.5, RY + 0.12, 0], 0);

  // stovepipe
  cyl([0.7, 5.3, -0.55], [0.7, 6.45, -0.55], 0.08, 0.08, C.metal, 8);
  put(new THREE.TorusGeometry(0.09, 0.025, 4, 8).rotateX(Math.PI / 2), C.tin, [0.7, 5.95, -0.55]);
  put(new THREE.ConeGeometry(0.17, 0.13, 8), C.metal, [0.7, 6.52, -0.55]);
  for (let i = 0; i < 3; i++) ball(0.07 + i * 0.03, "#d8dde2", [0.7 + i * 0.12, 6.75 + i * 0.22, -0.6 - i * 0.05], 0);

  // weathervane
  cyl([-1.1, RY + 0.1, 0], [-1.1, RY + 0.8, 0], 0.015, 0.015, C.metal, 5);
  ball(0.05, C.gold, [-1.1, RY + 0.82, 0], 0);
  box(0.03, 0.03, 0.5, C.metal, [-1.1, RY + 0.65, 0]);
  {
    const g = new THREE.ConeGeometry(0.05, 0.12, 4);
    g.rotateX(Math.PI / 2);
    put(g, C.metal, [-1.1, RY + 0.65, 0.3]);
  }
  tri([[0, 0.08], [0, -0.08], [-0.16, 0]], 0.01, C.flagRed, [-1.1, RY + 0.65, -0.25], Math.PI / 2);
  box(0.3, 0.015, 0.015, C.metal, [-1.1, RY + 0.45, 0]);
  box(0.015, 0.015, 0.3, C.metal, [-1.1, RY + 0.45, 0]);

  // ---------- railing ----------
  const railRun = (x0: number, z0: number, x1: number, z1: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const n = Math.max(1, Math.round(len / 0.6));
    for (let i = 0; i <= n; i++) {
      const px = x0 + ((x1 - x0) * i) / n, pz = z0 + ((z1 - z0) * i) / n;
      box(0.09, 0.95, 0.09, C.rail, [px, FY + 0.475, pz]);
      const c = new THREE.ConeGeometry(0.075, 0.08, 4);
      c.rotateY(Math.PI / 4);
      put(c, C.wood3, [px, FY + 0.99, pz]);
    }
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    box(alongX ? len + 0.1 : 0.08, 0.07, alongX ? 0.08 : len + 0.1, C.wood1, [mx, FY + 0.88, mz]);
    box(alongX ? len : 0.05, 0.05, alongX ? 0.05 : len, C.wood1, [mx, FY + 0.16, mz]);
    const m = Math.floor(len / 0.16);
    for (let i = 1; i < m; i++) {
      const u = i / m;
      box(0.035, 0.7, 0.035, C.baluster, [x0 + (x1 - x0) * u, FY + 0.52, z0 + (z1 - z0) * u]);
    }
  };
  railRun(-1.65, 1.72, 0.75, 1.72);
  railRun(-1.65, -1.55, -1.65, 1.72);
  railRun(1.65, -1.55, 1.65, 1.72);
  railRun(-1.65, -1.55, -0.6, -1.55);
  railRun(0.6, -1.55, 1.65, -1.55);

  // pennant pole on the front-left corner
  cyl([-1.65, FY + 0.95, 1.72], [-1.65, 5.4, 1.72], 0.025, 0.02, C.metal, 5);
  ball(0.045, C.gold, [-1.65, 5.43, 1.72], 0);
  tri([[0, 0.12], [0, -0.18], [-0.62, -0.05]], 0.015, C.flagRed, [-1.65, 5.22, 1.72]);
  tri([[0, 0.05], [0, -0.1], [-0.3, -0.03]], 0.02, C.flagYellow, [-1.66, 5.2, 1.72]);

  // ---------- ladder ----------
  const LB = [0, 0.1, 2.75], LT = [0, 4.05, 1.72];
  for (const x of [0.98, 1.42]) cyl([x, LB[1], LB[2]], [x, LT[1], LT[2]], 0.045, 0.04, C.barkLight, 6);
  for (let y = 0.35; y < 3.15; y += 0.3) {
    const z = LB[2] + ((y - LB[1]) / (LT[1] - LB[1])) * (LT[2] - LB[2]);
    cyl([0.95, y, z], [1.45, y, z], 0.03, 0.03, C.wood3, 6);
  }

  // ---------- rope swing ----------
  const onSwing = (t: number) => [
    swingA[0] + (swingB[0] - swingA[0]) * t,
    swingA[1] + (swingB[1] - swingA[1]) * t - 0.1,
    swingA[2] + (swingB[2] - swingA[2]) * t,
  ];
  const s1 = onSwing(0.7), s2 = onSwing(0.84);
  const SY = 0.62;
  for (const p of [s1, s2]) {
    cyl(p, [p[0], SY + 0.03, p[2]], 0.018, 0.018, C.rope, 4);
    put(new THREE.TorusGeometry(0.06, 0.02, 4, 6).rotateX(Math.PI / 2), C.rope, [p[0], p[1] + 0.02, p[2]]);
    ball(0.035, C.rope, [p[0], SY + 0.05, p[2]], 0);
  }
  {
    const dx = s2[0] - s1[0], dz = s2[2] - s1[2];
    const L = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(L + 0.2, 0.05, 0.24);
    g.rotateY(Math.atan2(-dz / L, dx / L));
    put(g, C.flagRed, [(s1[0] + s2[0]) / 2, SY, (s1[2] + s2[2]) / 2]);
  }

  // ---------- pulley bucket ----------
  const PW = [2.3, 6.05, -1.0];
  cyl([2.3, 6.2, -1.0], [2.3, 6.08, -1.0], 0.02, 0.02, C.metal, 4);
  put(new THREE.TorusGeometry(0.18, 0.04, 4, 10), C.metal, PW);
  disc(0.15, 0.03, C.wood3, PW, "z", 8);
  cyl([2.12, 6.05, -1.0], [1.65, FY + 0.9, -0.9], 0.015, 0.015, C.rope, 4);
  cyl([2.48, 6.05, -1.0], [2.4, 3.7, -1.0], 0.015, 0.015, C.rope, 4);
  put(new THREE.TorusGeometry(0.17, 0.015, 4, 8, Math.PI), C.metal, [2.4, 3.5, -1.0]);
  put(new THREE.CylinderGeometry(0.19, 0.15, 0.32, 8), C.tin, [2.4, 3.36, -1.0]);
  for (const y of [3.27, 3.45]) put(new THREE.TorusGeometry(0.175, 0.015, 3, 8).rotateX(Math.PI / 2), C.metal, [2.4, y, -1.0]);
  ball(0.13, C.fruit, [2.4, 3.52, -1.0], 0, 0.6);

  // ---------- birdhouse on the trunk ----------
  box(0.26, 0.3, 0.24, C.flagBlue, [0.02, 7.0, -0.88]);
  for (const s of [-1, 1]) box(0.18, 0.025, 0.3, C.roof1, [0.02 + s * 0.08, 7.2, -0.88], 0, 0, s * -0.65);
  disc(0.05, 0.02, C.dark, [0.02, 7.03, -0.755], "z", 8);
  cyl([0.02, 6.94, -0.76], [0.02, 6.94, -0.68], 0.01, 0.01, C.wood3, 4);

  // ---------- bunting ----------
  const bunt: number[][] = [];
  for (let i = 0; i <= 12; i++) {
    const u = -1 + (2 * i) / 12;
    bunt.push([-1.3 + (2.5 * i) / 12, 4.78 - 0.13 * (1 - u * u), 1.28]);
  }
  for (let i = 0; i < bunt.length - 1; i++) cyl(bunt[i], bunt[i + 1], 0.008, 0.008, C.trim, 3);
  const flagCols = [C.flagBlue, C.flagYellow, C.flagGreen, C.flagRed];
  for (let i = 1; i < bunt.length - 1; i++) {
    tri([[-0.08, 0], [0.08, 0], [0, -0.17]], 0.01, flagCols[i % 4], bunt[i]);
  }

  // ---------- lantern ----------
  const LX = 1.45, LZ = 1.12;
  cyl([LX, 4.86, LZ], [LX, 4.6, LZ], 0.012, 0.012, C.metal, 3);
  put(new THREE.ConeGeometry(0.11, 0.1, 6), C.metal, [LX, 4.55, LZ]);
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.17, 6), C.glow, [LX, 4.42, LZ]);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    box(0.015, 0.18, 0.015, C.metal, [LX + Math.cos(a) * 0.075, 4.42, LZ + Math.sin(a) * 0.075]);
  }
  put(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 6), C.metal, [LX, 4.32, LZ]);

  // ---------- porch props ----------
  put(new THREE.CylinderGeometry(0.19, 0.19, 0.45, 9), C.wood2, [-1.25, FY + 0.225, 1.3]);
  for (const y of [FY + 0.08, FY + 0.37]) put(new THREE.TorusGeometry(0.2, 0.018, 3, 9).rotateX(Math.PI / 2), C.metal, [-1.25, y, 1.3]);
  disc(0.17, 0.02, C.wood3, [-1.25, FY + 0.455, 1.3], "y", 9);
  put(new THREE.CylinderGeometry(0.13, 0.09, 0.2, 7), C.pot, [0.35, FY + 0.1, 1.4]);
  ball(0.17, C.leaf2, [0.35, FY + 0.3, 1.4], 0);
  ball(0.05, C.pink, [0.42, FY + 0.42, 1.48], 0);

  // sign with a painted star on the left stilt
  box(0.62, 0.3, 0.04, C.sign, [-1.55, 1.8, 1.78]);
  {
    const pts: number[][] = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.05 : 0.11;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    tri(pts, 0.015, C.flagRed, [-1.55, 1.8, 1.805]);
  }
  for (const sx of [-1, 1]) ball(0.02, C.metal, [-1.55 + sx * 0.26, 1.88, 1.805], 0);

  // ---------- ground details ----------
  const rocks = [[1.9, 0.12, 2.6, 0.22], [-2.6, 0.1, 1.9, 0.18], [2.6, 0.1, -1.8, 0.26], [-3.0, 0.1, -1.5, 0.2]];
  for (const [x, y, z, r] of rocks) {
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.scale(1, 0.6, 1);
    put(g, rand() > 0.5 ? C.rock : C.rockDark, [x, y + 0.02, z]);
  }
  for (const [x, z] of [[1.2, 3.3], [1.0, 3.85]]) {
    const g = new THREE.DodecahedronGeometry(0.2, 0);
    g.scale(1, 0.25, 1);
    put(g, C.rock, [x, 0.12, z]);
  }
  const mush = [[0.9, -0.4], [1.1, -0.15], [-0.85, -2.3], [-1.1, -2.1]];
  mush.forEach(([x, z], i) => {
    const h = 0.12 + (i % 2) * 0.06;
    put(new THREE.CylinderGeometry(0.03, 0.04, h, 6), C.stem, [x, 0.12 + h / 2, z]);
    const cap = new THREE.SphereGeometry(0.09 + (i % 2) * 0.03, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
    put(cap, C.mushRed, [x, 0.12 + h, z]);
    ball(0.016, C.mushDot, [x + 0.03, 0.12 + h + 0.06, z + 0.02], 0);
    ball(0.016, C.mushDot, [x - 0.04, 0.12 + h + 0.04, z - 0.03], 0);
  });
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const d = 1.6 + rand() * 1.9;
    const x = G[0] + Math.cos(a) * d, z = G[2] + Math.sin(a) * d;
    for (let k = 0; k < 3; k++) {
      const g = new THREE.ConeGeometry(0.035, 0.22 + rand() * 0.1, 3);
      g.rotateZ((k - 1) * 0.35);
      g.rotateY(a);
      put(g, k === 1 ? C.tuft : C.grassDark, [x, 0.22, z]);
    }
    if (i % 3 === 0) ball(0.04, pick([C.pink, C.yellow, C.white]), [x, 0.36, z], 0);
  }

  return b.root;
}
```