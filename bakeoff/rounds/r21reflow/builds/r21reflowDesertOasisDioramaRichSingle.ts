import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import type { Path } from "../../../../src/path";
import { countershade, grain, mottle, paint, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import type { Radius, SweepOptions } from "../../../../src/sweep";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A chunky low-poly oasis: turquoise pool with a little waterfall, three bulbous palms, a red and a blue striped tent, a standing and a resting camel in tasselled blankets, campfire, crates, jars and rugs.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const D = Math.PI / 180;
const G = 0.16; // sand surface height

// ---- palette ----
const RED = "#b3322b";
const BLUE = "#2f4f94";
const CREAM = "#f1dfb8";
const GOLD = "#e2b13c";
const TEAL = "#2aa6a0";
const WOOD = "#8a5a2e";
const WOOD_D = "#5b3a1e";
const LEATHER = "#7a4a26";
const CAMEL = "#c9904f";
const CAMEL_L = "#dcb078";
const CAMEL_D = "#8a5a2e";
const STONE_D = "#6f6a66";
const STONE_M = "#8b857e";
const GREEN_A = "#3f9a3a";
const GREEN_B = "#58b445";
const GREEN_C = "#2f7f33";
const TERRA = "#c4673a";
const BLACK = "#1c1410";

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  b.joint("base", { at: [0, 0, 0] });
  const rand = rng(11);

  // ---- local-frame helper: places things relative to a yawed origin ----
  class L {
    q: THREE.Quaternion;
    constructor(
      public o: [number, number, number],
      yaw: number,
    ) {
      this.q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D);
    }
    p(x: number, y: number, z: number) {
      return new THREE.Vector3(x, y, z).applyQuaternion(this.q).add(new THREE.Vector3(this.o[0], this.o[1], this.o[2]));
    }
    dir(x: number, y: number, z: number) {
      return new THREE.Vector3(x, y, z).applyQuaternion(this.q);
    }
    part(
      geo: THREE.BufferGeometry,
      color: Fill,
      x: number,
      y: number,
      z: number,
      rot: number[] = [0, 0, 0],
      sc?: number[],
      texture?: THREE.Texture,
    ) {
      const e = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
      const q = this.q.clone().multiply(e);
      return b.part(geo, color, { at: this.p(x, y, z), quat: q, scale: sc, flat: true, texture });
    }
    box(w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, rot: number[] = [0, 0, 0]) {
      return this.part(new THREE.BoxGeometry(w, h, d), color, x, y, z, rot);
    }
    cyl(rt: number, rb: number, h: number, seg: number, color: Fill, x: number, y: number, z: number, rot: number[] = [0, 0, 0]) {
      return this.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y, z, rot);
    }
    cone(r: number, h: number, seg: number, color: Fill, x: number, y: number, z: number, rot: number[] = [0, 0, 0]) {
      return this.part(new THREE.ConeGeometry(r, h, seg), color, x, y, z, rot);
    }
    ball(r: number, color: Fill, x: number, y: number, z: number, sc?: number[]) {
      return this.part(new THREE.SphereGeometry(r, 7, 5), color, x, y, z, [0, 0, 0], sc);
    }
    rod(a: number[], c: number[], r: number, color: Fill) {
      return b.rod(this.p(a[0], a[1], a[2]), this.p(c[0], c[1], c[2]), r, color, { sides: 5 });
    }
    cat(pts: number[][]) {
      return catmull(pts.map((q) => this.p(q[0], q[1], q[2])));
    }
    sweep(path: Path, radius: Radius, color: Fill, opts: SweepOptions = {}) {
      return b.sweep(path, radius, color, { sides: 7, ...opts });
    }
  }
  const W = new L([0, 0, 0], 0);

  // ---- textures ----
  const rugTex = svg(
    `<svg viewBox="0 0 40 62" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="62" fill="#a52a2a"/>
      <rect x="2" y="2" width="36" height="58" fill="none" stroke="#f1dfb8" stroke-width="2"/>
      <rect x="5" y="5" width="30" height="52" fill="#2f4f94"/>
      <rect x="7" y="7" width="26" height="48" fill="#b3322b"/>
      <polygon points="20,12 30,31 20,50 10,31" fill="#e2b13c"/>
      <polygon points="20,18 26,31 20,44 14,31" fill="#2f4f94"/>
      <polygon points="20,25 23,31 20,37 17,31" fill="#f1dfb8"/>
      <g fill="#f1dfb8"><rect x="8" y="8" width="3" height="3"/><rect x="29" y="8" width="3" height="3"/><rect x="8" y="51" width="3" height="3"/><rect x="29" y="51" width="3" height="3"/></g>
    </svg>`,
    { size: 192 },
  );
  const trimTex = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="8" fill="#f1dfb8"/>
      <rect y="0" width="64" height="1.2" fill="#8a2a22"/><rect y="6.8" width="64" height="1.2" fill="#8a2a22"/>
      <g fill="#2f4f94"><polygon points="4,4 8,1.8 12,4 8,6.2"/><polygon points="20,4 24,1.8 28,4 24,6.2"/><polygon points="36,4 40,1.8 44,4 40,6.2"/><polygon points="52,4 56,1.8 60,4 56,6.2"/></g>
      <g fill="#e2b13c"><polygon points="8,3 9,4 8,5 7,4"/><polygon points="24,3 25,4 24,5 23,4"/><polygon points="40,3 41,4 40,5 39,4"/><polygon points="56,3 57,4 56,5 55,4"/></g>
    </svg>`,
    { size: 256 },
  );
  const cushionTex = svg(
    `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" fill="#d9822b"/><polygon points="8,2 14,8 8,14 2,8" fill="#f1dfb8"/><polygon points="8,5 11,8 8,11 5,8" fill="#8a2a22"/></svg>`,
    { size: 64 },
  );

  // ---- base island ----
  const outline: OutlinePoint[] = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const r = 1.28 + 0.08 * Math.sin(3 * a) + 0.05 * Math.cos(5 * a + 1);
    outline.push([Math.cos(a) * r * 1.05, Math.sin(a) * r]);
  }
  const sandTop = mottle("#ebbb6a", "#dfa957", { size: 0.35, seed: 3 });
  const sandSide = stripes("#c98f45", "#b27536", { size: 0.05, axis: "y", wobble: 0.3, width: 0.5 });
  b.extrude(outline, {
    at: [0, G / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: G,
    color: paint((_p, n) => (n.y > 0.5 ? sandTop : sandSide)),
    name: "island",
  });

  // ---- pool ----
  const POOL_C = [0.1, -0.05];
  const poolPts: OutlinePoint[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const w = 1 + 0.08 * Math.sin(3 * a + 0.5);
    poolPts.push([POOL_C[0] + Math.cos(a) * 0.56 * w, POOL_C[1] + Math.sin(a) * 0.4 * w]);
  }
  b.extrude(poolPts, {
    at: [0, G + 0.004, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.014,
    color: mottle("#22b8c4", "#52e0d6", { size: 0.16, seed: 5 }),
    name: "pool",
  });
  const inPool = (x: number, z: number, k = 1) =>
    ((x - POOL_C[0]) / (0.66 * k)) ** 2 + ((z - POOL_C[1]) / (0.5 * k)) ** 2 < 1;

  // rim stones around the pool
  const rimStone = mottle("#a6937b", "#8e7c68", { size: 0.1, seed: 2 });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + 0.2;
    const w = 1 + 0.08 * Math.sin(3 * a + 0.5);
    const x = POOL_C[0] + Math.cos(a) * 0.58 * w;
    const z = POOL_C[1] + Math.sin(a) * 0.42 * w;
    if (z < -0.35) continue; // cliff side
    const s = 0.04 + rand() * 0.035;
    W.part(new THREE.IcosahedronGeometry(s, 0), rimStone, x, G + s * 0.3, z, [rand() * 90, rand() * 360, rand() * 90], [1.1, 0.7, 1]);
  }
  // stepping stones in water
  for (const [x, z, s] of [
    [0.35, 0.18, 0.06],
    [0.2, 0.25, 0.045],
    [-0.15, 0.1, 0.05],
  ]) {
    W.part(new THREE.IcosahedronGeometry(s, 0), rimStone, x, G + s * 0.3, z, [0, rand() * 360, 0], [1.1, 0.6, 1]);
  }
  // lily pads
  for (const [x, z] of [
    [-0.1, -0.15],
    [0.38, -0.08],
    [0.05, 0.12],
  ]) {
    W.cyl(0.04, 0.04, 0.006, 7, GREEN_B, x, G + 0.015, z);
    W.ball(0.011, "#f2a3c0", x + 0.01, G + 0.022, z);
  }

  // ---- cliff and waterfall ----
  const cliffPaint = mottle("#a6937b", "#8a7864", { size: 0.14, seed: 8 });
  const cliff: number[][] = [
    [-0.32, -0.62, 0.16],
    [-0.12, -0.7, 0.2],
    [0.12, -0.72, 0.22],
    [0.34, -0.66, 0.17],
    [0.55, -0.58, 0.13],
    [-0.5, -0.5, 0.1],
    [-0.05, -0.6, 0.14],
    [0.22, -0.58, 0.12],
    [-0.2, -0.78, 0.15],
    [0.3, -0.8, 0.13],
  ];
  for (const [x, z, s] of cliff) {
    W.part(new THREE.IcosahedronGeometry(s, 0), cliffPaint, x, G + s * 0.75, z, [rand() * 40, rand() * 360, rand() * 40], [1, 1.25, 1]);
  }
  // upper ledge
  W.part(new THREE.IcosahedronGeometry(0.15, 0), cliffPaint, 0.05, G + 0.4, -0.66, [10, 40, 0], [1.3, 0.7, 1]);
  // falling water
  W.box(0.12, 0.3, 0.04, paint((_p, _n, s) => (Math.floor(s[0] * 40) % 2 ? "#8cecf0" : "#bdf6f4")), 0.06, G + 0.2, -0.5);
  W.box(0.1, 0.03, 0.06, "#8cecf0", 0.06, G + 0.36, -0.52);
  for (const [x, z] of [
    [0.02, -0.46],
    [0.1, -0.45],
    [0.06, -0.42],
  ]) W.ball(0.04, "#eefcfb", x, G + 0.03, z, [1, 0.6, 1]);

  // ---- plants ----
  const agave = (x: number, z: number, s: number, n = 9) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand();
      const out = 0.6 + 0.4 * rand();
      b.spike([x, G, z], [Math.cos(a) * out, 0.9, Math.sin(a) * out], 0.2 * s, 0.026 * s, i % 2 ? GREEN_A : GREEN_B, { sides: 4 });
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      b.spike([x, G, z], [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3], 0.17 * s, 0.022 * s, GREEN_C, { sides: 4 });
    }
  };
  const tuft = (x: number, z: number, s: number) => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.spike([x + Math.cos(a) * 0.01, G, z + Math.sin(a) * 0.01], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.1 * s, 0.01 * s, i % 2 ? "#c8b45a" : "#a99a46", { sides: 3 });
    }
  };
  for (const [x, z, s] of [
    [-0.45, -0.4, 1.1],
    [0.7, -0.3, 0.9],
    [-0.3, 0.0, 0.8],
    [-0.95, 0.5, 0.9],
    [-0.1, 0.8, 0.8],
    [0.55, -0.05, 0.9],
    [-0.5, -0.65, 1.0],
    [0.5, -0.7, 0.9],
  ])
    agave(x, z, s);
  for (const [x, z, s] of [
    [-0.7, 0.8, 1],
    [0.1, 0.55, 1],
    [1.0, 0.0, 1.2],
    [0.2, 0.95, 1],
    [-1.1, 0.0, 1],
    [0.95, 0.65, 1.1],
    [-0.45, 0.4, 0.9],
    [0.6, 0.4, 0.9],
  ])
    tuft(x, z, s);

  // ---- rocks ----
  const rockPaint = mottle("#a6937b", "#8e7c68", { size: 0.12, seed: 4 });
  for (const [x, z, s] of [
    [-0.85, 0.9, 0.17],
    [-0.65, 0.75, 0.13],
    [-0.98, 0.75, 0.11],
    [0.95, 0.9, 0.12],
    [1.05, -0.2, 0.15],
    [0.3, 0.88, 0.1],
    [-0.4, 0.95, 0.08],
    [-0.2, 0.65, 0.06],
  ])
    W.part(new THREE.IcosahedronGeometry(s, 0), rockPaint, x, G + s * 0.55, z, [rand() * 40, rand() * 360, rand() * 40], [1, 1.1, 0.9]);
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 0.85;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.9;
    if (inPool(x, z, 1.3)) continue;
    const s = 0.015 + rand() * 0.02;
    W.part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? STONE_M : "#a6937b", x, G + s * 0.3, z, [0, rand() * 360, 0], [1, 0.7, 1]);
  }

  // ---- palms ----
  const palm = (x: number, z: number, lx: number, lz: number, h: number, seed: number) => {
    const r2 = rng(seed);
    const path = catmull([
      [x, G - 0.03, z],
      [x + lx * 0.12, G + h * 0.35, z + lz * 0.12],
      [x + lx * 0.5, G + h * 0.7, z + lz * 0.5],
      [x + lx, G + h, z + lz],
    ]);
    b.sweep(path, [0.07, 0.05, 0.042], paint((_p, _n, s) => (Math.floor((s[0] * h) / 0.05) % 2 ? "#7a4f2b" : "#97693a")), { sides: 7 });
    const top: [number, number, number] = [x + lx, G + h, z + lz];
    b.part(new THREE.SphereGeometry(0.06, 7, 5), "#6f4626", { at: [top[0], top[1] - 0.01, top[2]], flat: true });
    const greens = [GREEN_A, GREEN_B, GREEN_C];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r2() * 0.3;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const len = 0.42 + r2() * 0.1;
      const up = i % 2 ? 0.22 : 0.3;
      const tip: [number, number, number] = [top[0] + ca * len, top[1] + (i % 2 ? -0.1 : -0.04), top[2] + sa * len];
      const mid: [number, number, number] = [top[0] + ca * len * 0.5, top[1] + up, top[2] + sa * len * 0.5];
      b.sweep(bezier(top, mid, tip), (t: number) => [0.014 + 0.075 * Math.max(0, Math.sin(Math.PI * t)) ** 0.7, 0.005], greens[i % 3], {
        sides: 4,
        caps: "point",
      });
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      b.part(new THREE.SphereGeometry(0.03, 6, 4), "#e08a1e", {
        at: [top[0] + Math.cos(a) * 0.05, top[1] - 0.08, top[2] + Math.sin(a) * 0.05],
        scale: [1, 1.3, 1],
        flat: true,
      });
    }
  };
  palm(-0.2, -0.82, -0.12, -0.05, 1.05, 21);
  palm(0.12, -0.92, 0.02, -0.12, 1.3, 22);
  palm(0.45, -0.78, 0.2, 0.0, 0.95, 23);

  // ---- tents ----
  const tent = (cx: number, cz: number, yaw: number, main: string, accent: string) => {
    const t = new L([cx, G, cz], yaw);
    const half = 0.42;
    const wall = 0.2;
    const ridge = 0.54;
    const depth = 0.62;
    const ang = Math.atan2(ridge - wall, half) / D;
    const len = Math.hypot(half, ridge - wall);
    const ridgeAxis = t.dir(0, 0, 1).toArray();
    const roof = stripes(main, CREAM, { size: 0.12, axis: ridgeAxis, width: 0.3, wobble: 0.05 });
    for (const s of [1, -1]) {
      t.box(len, 0.014, depth + 0.04, roof, s * half * 0.5, (wall + ridge) / 2, 0, [0, 0, -s * ang]);
      t.box(0.014, wall, depth, main, s * half, wall / 2, 0);
      // trim valance hanging at the front
      t.part(new THREE.PlaneGeometry(len, 0.05), "#ffffff", s * half * 0.5, (wall + ridge) / 2 - 0.01, depth / 2 + 0.03, [0, 0, -s * ang], undefined, trimTex);
      // curtains tied back
      t.box(0.12, wall + 0.02, 0.012, CREAM, s * 0.33, wall / 2, depth / 2 + 0.01, [0, s * 20, 0]);
      t.box(0.012, 0.2, 0.012, accent, s * 0.27, wall / 2, depth / 2 + 0.03);
      // guy ropes + stakes
      t.rod([s * half, wall, depth / 2], [s * 0.66, 0.01, depth / 2 + 0.12], 0.004, WOOD_D);
      t.rod([s * half, wall, -depth / 2], [s * 0.66, 0.01, -depth / 2 - 0.12], 0.004, WOOD_D);
      t.cone(0.012, 0.05, 5, WOOD_D, s * 0.66, 0.02, depth / 2 + 0.12, [0, 0, s * 20]);
      t.cone(0.012, 0.05, 5, WOOD_D, s * 0.66, 0.02, -depth / 2 - 0.12, [0, 0, s * 20]);
      // eave tassels
      for (const z of [-0.25, 0, 0.25]) t.cone(0.012, 0.045, 5, z === 0 ? GOLD : accent, s * (half + 0.01), wall - 0.03, z, [180, 0, 0]);
      // front corner poles
      t.rod([s * (half + 0.02), 0, depth / 2 + 0.02], [s * (half + 0.02), wall + 0.1, depth / 2 + 0.02], 0.01, WOOD);
      t.ball(0.016, GOLD, s * (half + 0.02), wall + 0.115, depth / 2 + 0.02);
    }
    // back wall (pentagon)
    const back: OutlinePoint[] = [
      [-half, 0],
      [half, 0],
      [half, wall],
      [0, ridge],
      [-half, wall],
    ];
    b.extrude(back, { at: t.p(0, 0, -depth / 2), x: t.dir(1, 0, 0), thickness: 0.014, color: main });
    // ridge pole and finial
    t.rod([0, 0, depth / 2 + 0.03], [0, ridge + 0.05, depth / 2 + 0.03], 0.012, WOOD);
    t.rod([0, 0, -depth / 2 - 0.03], [0, ridge + 0.05, -depth / 2 - 0.03], 0.012, WOOD);
    t.rod([0, ridge + 0.03, depth / 2 + 0.03], [0, ridge + 0.03, -depth / 2 - 0.03], 0.01, WOOD);
    t.ball(0.022, GOLD, 0, ridge + 0.07, depth / 2 + 0.03);
    t.ball(0.022, GOLD, 0, ridge + 0.07, -depth / 2 - 0.03);
    t.cone(0.02, 0.03, 6, GOLD, 0, ridge + 0.1, depth / 2 + 0.03);
    // floor rug and cushions inside
    t.part(new THREE.PlaneGeometry(0.34, 0.5), "#ffffff", 0, 0.006, 0.0, [-90, 0, 0], undefined, rugTex);
    t.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), "#ffffff", -0.2, 0.03, -0.2, [0, 20, 0], undefined, cushionTex);
    t.box(0.1, 0.05, 0.09, "#8a2a40", -0.1, 0.028, -0.24, [0, -15, 6]);
    t.box(0.09, 0.045, 0.09, "#d9822b", 0.2, 0.026, -0.22, [0, 30, 0]);
    return t;
  };
  tent(-0.88, -0.2, 55, RED, BLUE);
  const tb = tent(0.95, -0.4, -48, BLUE, RED);
  // lantern by blue tent
  tb.box(0.04, 0.06, 0.04, "#ffb347", 0.52, 0.03, 0.4);
  glow(tb.cone(0.035, 0.035, 4, BLACK, 0.52, 0.077, 0.4, [0, 45, 0]), 1);
  tb.box(0.044, 0.008, 0.044, BLACK, 0.52, 0.004, 0.4);

  // ---- rugs outside tents ----
  new L([-0.52, G, 0.18], 55).part(new THREE.PlaneGeometry(0.3, 0.46), "#ffffff", 0, 0.004, 0, [-90, 0, 0], undefined, rugTex);
  new L([0.62, G, 0.0], -48).part(new THREE.PlaneGeometry(0.26, 0.4), "#ffffff", 0, 0.004, 0, [-90, 0, 90], undefined, rugTex);

  // ---- crates ----
  const woodP = grain(WOOD, WOOD_D, { size: 0.02, axis: "x", seed: 4 });
  const crate = (x: number, y: number, z: number, yaw: number, w: number, h: number, d: number) => {
    const c = new L([x, y, z], yaw);
    c.box(w, h, d, woodP, 0, h / 2, 0);
    c.box(w + 0.006, 0.012, d + 0.006, WOOD_D, 0, h - 0.01, 0);
    c.box(w + 0.006, 0.012, d + 0.006, WOOD_D, 0, 0.01, 0);
    for (const s of [1, -1]) {
      c.box(0.012, h + 0.004, d + 0.006, WOOD_D, s * (w / 2 - 0.02), h / 2, 0);
    }
    c.box(0.03, 0.03, 0.006, GOLD, 0, h * 0.62, d / 2 + 0.004);
  };
  crate(-1.15, G, -0.1, 70, 0.12, 0.09, 0.09);
  crate(-1.12, G + 0.09, -0.12, 85, 0.1, 0.07, 0.08);
  crate(-1.1, G, 0.15, 60, 0.09, 0.08, 0.09);
  crate(1.1, G, -0.45, -30, 0.14, 0.09, 0.1);
  crate(1.12, G + 0.09, -0.45, -20, 0.1, 0.08, 0.09);
  crate(1.05, G, -0.15, -50, 0.08, 0.07, 0.08);
  crate(0.8, G, 0.85, 10, 0.07, 0.06, 0.07);

  // ---- jars ----
  const jar = (x: number, z: number, s: number, c: string) => {
    const pts: OutlinePoint[] = [
      [0, 0],
      [0.035, 0],
      [0.05, 0.04],
      [0.055, 0.075],
      [0.04, 0.115],
      [0.028, 0.135],
      [0.038, 0.15],
      [0.02, 0.15],
      [0, 0.14],
    ];
    b.lathe(pts, {
      at: [x, G, z],
      segments: 8,
      color: paint((_p, _n, st) => {
        const h = st[0] / s;
        return (h > 0.05 && h < 0.063) || (h > 0.09 && h < 0.1) ? CREAM : h > 0.065 && h < 0.088 ? BLUE : c;
      }),
    });
    b.part(new THREE.TorusGeometry(0.025 * s, 0.005, 4, 6), WOOD_D, { at: [x, G + 0.12 * s, z], rotation: [90, 0, 0] });
  };
  jar(-0.8, 0.32, 1, TERRA);
  jar(-1.05, 0.28, 0.8, "#b8522d");
  jar(1.17, -0.3, 1.1, TERRA);
  jar(1.0, 0.18, 0.8, "#b8522d");

  // ---- campfire ----
  const fx = 0.45;
  const fz = 0.78;
  const fire = new L([fx, G, fz], 0);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    fire.part(new THREE.DodecahedronGeometry(0.03, 0), i % 3 === 0 ? STONE_D : STONE_M, Math.cos(a) * 0.1, 0.02, Math.sin(a) * 0.1, [0, a * 50, 0], [1, 0.8, 1]);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    fire.rod([Math.cos(a) * 0.07, 0.012, Math.sin(a) * 0.07], [-Math.cos(a) * 0.02, 0.05, -Math.sin(a) * 0.02], 0.012, WOOD_D);
  }
  glow(fire.cone(0.04, 0.12, 5, "#ff8a1e", 0, 0.08, 0), 1.4);
  glow(fire.cone(0.022, 0.09, 5, "#ffd54a", 0, 0.08, 0), 1.6);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.9;
    fire.rod([Math.cos(a) * 0.16, 0, Math.sin(a) * 0.16], [0, 0.34, 0], 0.008, WOOD_D);
  }
  fire.rod([0, 0.34, 0], [0, 0.2, 0], 0.003, STONE_D);
  fire.ball(0.045, "#2b2a2c", 0, 0.16, 0, [1, 0.85, 1]);
  fire.cyl(0.048, 0.048, 0.008, 8, STONE_D, 0, 0.2, 0);

  // stool and basket
  const st = new L([0.88, G, 0.78], 20);
  st.box(0.1, 0.014, 0.1, WOOD, 0, 0.1, 0);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) st.rod([sx * 0.04, 0, sz * 0.04], [sx * 0.04, 0.1, sz * 0.04], 0.008, WOOD_D);
  st.box(0.09, 0.008, 0.008, WOOD_D, 0, 0.04, 0.04);
  st.box(0.09, 0.008, 0.008, WOOD_D, 0, 0.04, -0.04);
  const bk = new L([1.03, G, 0.55], 0);
  bk.cyl(0.05, 0.04, 0.1, 8, stripes("#c9a24c", "#a8812f", { size: 0.02, axis: "y", wobble: 0.1, width: 0.5 }), 0, 0.05, 0);
  bk.cyl(0.052, 0.052, 0.012, 8, "#8f6f27", 0, 0.1, 0);

  // ---- camels ----
  const camelHead = (c: L, y: number, z: number) => {
    b.capsule(c.p(0, y + 0.01, z), c.p(0, y - 0.01, z + 0.08), 0.034, CAMEL, { sides: 6 });
    c.ball(0.03, CAMEL_L, 0, y - 0.015, z + 0.1, [1, 0.85, 1.1]);
    c.ball(0.012, CAMEL_D, 0, y - 0.012, z + 0.128);
    for (const s of [1, -1]) {
      c.ball(0.008, BLACK, s * 0.03, y + 0.02, z + 0.03);
      c.ball(0.014, CAMEL_D, s * 0.028, y + 0.032, z + 0.022, [1, 0.6, 1]);
      c.cone(0.011, 0.038, 5, CAMEL_D, s * 0.027, y + 0.055, z - 0.018, [0, 0, -s * 25]);
    }
    c.part(new THREE.TorusGeometry(0.032, 0.004, 4, 7), LEATHER, 0, y - 0.01, z + 0.085);
    c.rod([0, y - 0.02, z + 0.09], [0.05, y - 0.22, z - 0.1], 0.004, WOOD_D);
  };
  const blanket = (c: L, y: number, z: number) => {
    const bp = stripes(RED, BLUE, { size: 0.035, axis: [0, 0, 1], width: 0.45, wobble: 0.05 });
    c.box(0.2, 0.014, 0.17, bp, 0, y, z);
    c.box(0.21, 0.016, 0.014, GOLD, 0, y + 0.002, z + 0.085);
    c.box(0.21, 0.016, 0.014, GOLD, 0, y + 0.002, z - 0.085);
    for (const s of [1, -1]) {
      c.box(0.014, 0.12, 0.17, bp, s * 0.1, y - 0.055, z, [0, 0, 8 * s]);
      c.box(0.016, 0.014, 0.18, GOLD, s * 0.115, y - 0.115, z, [0, 0, 8 * s]);
      for (const k of [-1, 0, 1]) c.cone(0.011, 0.045, 5, k === 0 ? TEAL : GOLD, s * 0.122, y - 0.14, z + k * 0.06, [180, 0, 0]);
      c.box(0.04, 0.08, 0.1, LEATHER, s * 0.13, y - 0.14, z - 0.015);
      c.box(0.042, 0.03, 0.105, "#5e3920", s * 0.13, y - 0.105, z - 0.015);
      c.box(0.006, 0.01, 0.012, GOLD, s * 0.153, y - 0.115, z - 0.015);
    }
    // saddle roll
    c.cyl(0.03, 0.03, 0.2, 7, "#a52a2a", 0, y + 0.03, z + 0.07, [0, 0, 90]);
    c.cyl(0.032, 0.032, 0.012, 7, GOLD, 0.06, y + 0.03, z + 0.07, [0, 0, 90]);
  };
  const coat = mottle(CAMEL, "#bb8445", { size: 0.1, seed: 6 });
  const belly = countershade(coat, CAMEL_L, { level: -0.4 });

  // standing camel
  {
    const c = new L([0.82, G, 0.2], -65);
    c.sweep(c.cat([[0, 0.36, -0.2], [0, 0.37, -0.02], [0, 0.38, 0.16]]), (t) => [0.065 + 0.02 * Math.sin(Math.PI * t), 0.07 + 0.02 * Math.sin(Math.PI * t)], belly);
    c.ball(0.06, coat, 0, 0.46, -0.07, [0.9, 1.1, 1]);
    c.sweep(c.cat([[0, 0.4, 0.17], [0, 0.47, 0.25], [0, 0.6, 0.27], [0, 0.67, 0.3]]), [0.05, 0.032], belly);
    camelHead(c, 0.68, 0.3);
    for (const s of [1, -1])
      for (const z of [0.12, -0.15]) {
        c.sweep(c.cat([[s * 0.055, 0.33, z], [s * 0.05, 0.19, z + 0.006], [s * 0.05, 0.045, z]]), [0.034, 0.02], belly, { sides: 6 });
        c.ball(0.026, CAMEL_D, s * 0.05, 0.2, z + 0.008);
        c.cyl(0.03, 0.032, 0.03, 6, CAMEL_D, s * 0.05, 0.015, z);
      }
    c.sweep(c.cat([[0, 0.38, -0.21], [0, 0.3, -0.27], [0, 0.2, -0.26]]), [0.014, 0.01], CAMEL_D, { sides: 5 });
    c.ball(0.016, BLACK, 0, 0.18, -0.26, [1, 1.4, 1]);
    blanket(c, 0.475, 0.07);
  }
  // resting camel
  {
    const c = new L([-0.15, G, 0.5], 60);
    c.sweep(c.cat([[0, 0.13, -0.2], [0, 0.14, 0], [0, 0.15, 0.15]]), (t) => [0.07 + 0.02 * Math.sin(Math.PI * t), 0.07 + 0.02 * Math.sin(Math.PI * t)], belly);
    c.ball(0.06, coat, 0, 0.235, -0.07, [0.9, 1.1, 1]);
    c.sweep(c.cat([[0, 0.2, 0.15], [0, 0.3, 0.23], [0, 0.42, 0.25], [0, 0.47, 0.29]]), [0.05, 0.032], belly);
    camelHead(c, 0.48, 0.29);
    for (const s of [1, -1]) {
      b.capsule(c.p(s * 0.1, 0.04, -0.14), c.p(s * 0.1, 0.04, 0.1), 0.032, belly, { sides: 6 });
      c.ball(0.03, CAMEL_D, s * 0.1, 0.035, 0.13);
      b.capsule(c.p(s * 0.09, 0.07, 0.08), c.p(s * 0.065, 0.04, 0.22), 0.022, belly, { sides: 6 });
      c.ball(0.024, CAMEL_D, s * 0.065, 0.025, 0.235);
    }
    c.sweep(c.cat([[0, 0.12, -0.21], [0.05, 0.05, -0.28], [0.1, 0.03, -0.3]]), [0.014, 0.01], CAMEL_D, { sides: 5 });
    blanket(c, 0.24, 0.07);
  }

  // dune-edge grass tufts near camels
  tuft(0.65, 0.55, 1);
  tuft(-0.35, 0.65, 1);

  return b.root;
}
