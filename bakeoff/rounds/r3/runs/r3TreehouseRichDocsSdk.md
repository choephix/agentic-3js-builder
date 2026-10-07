```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, stripes, grain, scales, mottle, gradient } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Treehouse Diorama",
  description:
    "A round grassy base with an old oak, a wooden cabin with a red shingle roof, round window, pennant, lantern, rope ladder, swing, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const base = b.joint("base", { at: [0, 0, 0] });
  void rng;

  // deterministic local random
  let seed = 12345;
  const R = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const WOOD = "#b8844f", WOOD_D = "#8a5a33", WOOD_L = "#d09f64", BARK = "#6b4a2f", BARK_D = "#4a3322";
  const RED = "#b3322a", RED_D = "#7e1f1c", GRASS = "#6fb04a", SOIL = "#6a4630";
  const GREENS = ["#3f8f3c", "#4fa447", "#2f7a38", "#62b34f"];
  const ROPE = "#d8c08a", GLOW = "#ffd36a", IRON = "#3a3a40";

  const part = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: base, at, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const rod = (a: number[], c: number[], r: number, color: any) => b.rod(a, c, r, { color, bone: base, sides: 6 } as any);

  // ---------- base ----------
  b.lathe(
    [[0, 0], [1.52, 0], [1.6, 0.1], [1.6, 0.17], [0, 0.17]],
    { at: [0, 0, 0], segments: 20, color: mottle(SOIL, "#563621", { size: 0.12 }), bone: base },
  );
  b.lathe(
    [[0, 0.17], [1.63, 0.17], [1.63, 0.23], [1.5, 0.28], [0, 0.28]],
    { at: [0, 0, 0], segments: 20, color: mottle(GRASS, "#5a9d3d", { size: 0.2 }), bone: base },
  );
  const G = 0.28;

  // ---------- trunk ----------
  const trunkPath = catmull([[0, 0.2, 0], [0.02, 1.0, -0.02], [-0.03, 2.0, 0], [0, 3.0, -0.05], [0, 3.6, -0.1]]);
  b.sweep(trunkPath, [0.5, 0.36, 0.31, 0.27, 0.2, 0.1], {
    color: grain(BARK, BARK_D, { size: 0.05 }),
    sides: 10,
    bone: base,
  } as any);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const dx = Math.sin(a), dz = Math.cos(a);
    b.spike([dx * 0.38, 0.5, dz * 0.38], [dx, -0.45, dz], 0.6, 0.14, { color: BARK, bone: base, sides: 6 } as any);
  }
  // branches
  const branches: number[][][] = [
    [[0, 2.3, 0], [-0.5, 2.7, -0.15], [-1.0, 3.2, -0.3]],
    [[0, 2.6, -0.1], [0.5, 3.0, -0.4], [0.8, 3.5, -0.5]],
    [[0, 2.8, -0.1], [-0.2, 3.2, -0.6], [-0.4, 3.7, -0.9]],
  ];
  for (const br of branches) b.sweep(catmull(br), [0.11, 0.04], { color: BARK, sides: 6, bone: base } as any);

  // ---------- crown ----------
  const blobs: number[][] = [[0, 3.9, -0.1, 0.8], [-0.7, 3.5, -0.3, 0.7]];
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, d = 0.3 + R() * 0.9;
    const x = Math.sin(a) * d, z = Math.cos(a) * d - 0.2;
    const front = Math.hypot(x, z - 0.65) < 1.0;
    let y = 3.3 + (1.1 - d) * 0.6 + R() * 0.3;
    if (front) y = Math.max(y, 3.9);
    blobs.push([x, y, z, 0.5 + R() * 0.25]);
  }
  blobs.forEach(([x, y, z, r], i) => {
    part(new THREE.IcosahedronGeometry(r, 1), GREENS[i % 4], [x, y, z], {
      scale: [1.1, 0.85, 1.1],
      rotation: [R() * 90, R() * 90, 0],
      flat: true,
    });
  });

  // ---------- platform & cabin ----------
  box(1.2, 0.08, 1.3, stripes(WOOD, WOOD_D, { size: 0.1, axis: "x" }), [0, 1.56, 0.75]);
  for (const s of [1, -1]) rod([0, 1.1, 0.2], [s * 0.5, 1.54, 1.2], 0.035, WOOD_D);
  rod([0, 1.1, 0.2], [0, 1.54, 1.3], 0.035, WOOD_D);

  const wall = stripes(WOOD_L, WOOD_D, { size: 0.08, axis: "x" });
  box(0.9, 0.65, 0.8, wall, [0, 1.925, 0.65]);
  // corner posts
  for (const sx of [1, -1]) for (const z of [0.25, 1.05]) box(0.05, 0.67, 0.05, WOOD_D, [sx * 0.45, 1.925, z]);
  // gables
  for (const z of [1.04, 0.27])
    b.extrude([[-0.45, 0], [0.45, 0], [0, 0.36]], {
      at: [0, 2.25, z], x: [1, 0, 0], thickness: 0.04, color: wall, bone: base,
    } as any);
  // roof
  const roofPaint = scales(RED, RED_D, { size: 0.09 });
  for (const s of [1, -1])
    box(0.75, 0.05, 1.04, roofPaint, [s * 0.275, 2.4, 0.65], { rotation: [0, 0, -s * 40] });
  box(0.09, 0.07, 1.06, RED_D, [0, 2.64, 0.65], { rotation: [0, 0, 45] });
  // door
  box(0.2, 0.42, 0.03, stripes("#7a4a2a", "#5e3820", { size: 0.05, axis: "x" }), [0.1, 1.83, 1.06]);
  box(0.26, 0.04, 0.04, WOOD_D, [0.1, 2.06, 1.06]);
  for (const s of [1, -1]) box(0.03, 0.44, 0.04, WOOD_D, [0.1 + s * 0.115, 1.83, 1.06]);
  part(new THREE.SphereGeometry(0.015, 6, 4), "#e0b84a", [0.17, 1.82, 1.085]);
  // round window
  part(new THREE.CircleGeometry(0.11, 12), GLOW, [-0.22, 1.98, 1.052], { dir: [0, 0, 1], axis: "z" });
  part(new THREE.TorusGeometry(0.12, 0.02, 5, 14), WOOD_D, [-0.22, 1.98, 1.055], { dir: [0, 0, 1], axis: "z" });
  box(0.23, 0.014, 0.02, WOOD_D, [-0.22, 1.98, 1.065]);
  box(0.014, 0.23, 0.02, WOOD_D, [-0.22, 1.98, 1.065]);
  box(0.3, 0.03, 0.07, WOOD_D, [-0.22, 1.83, 1.09]);
  // flower box under the window
  box(0.26, 0.05, 0.06, "#7a4a2a", [-0.22, 1.79, 1.1]);
  for (let i = 0; i < 4; i++) part(new THREE.IcosahedronGeometry(0.025, 0), ["#ff8fa8", "#fff2a0"][i % 2], [-0.31 + i * 0.06, 1.835, 1.1], { flat: true });
  // side window
  for (const s of [1, -1]) {
    box(0.02, 0.2, 0.2, GLOW, [s * 0.451, 1.95, 0.65]);
    box(0.03, 0.025, 0.24, WOOD_D, [s * 0.455, 1.95, 0.65]);
    box(0.03, 0.24, 0.025, WOOD_D, [s * 0.455, 1.95, 0.65]);
  }
  // railing
  for (const s of [1, -1]) for (const z of [0.15, 0.5, 0.85, 1.36]) box(0.04, 0.3, 0.04, WOOD_D, [s * 0.58, 1.75, z]);
  for (const s of [1, -1]) rod([s * 0.58, 1.9, 0.15], [s * 0.58, 1.9, 1.36], 0.022, WOOD);
  rod([0.58, 1.9, 1.36], [0.05, 1.9, 1.36], 0.022, WOOD);
  box(0.04, 0.3, 0.04, WOOD_D, [0.05, 1.75, 1.36]);
  // pennant
  rod([0, 2.64, 0.65], [0, 3.05, 0.65], 0.012, "#e8e0cc");
  part(new THREE.SphereGeometry(0.025, 6, 4), "#e0b84a", [0, 3.07, 0.65]);
  b.extrude([[0, 0], [0.5, 0.07], [0, 0.16]], {
    at: [0, 2.88, 0.65], x: [0, 0, -1], thickness: 0.012,
    color: gradient("#f2c230", "#e5502e", [0, 0, 0.65], [0, 0, 0.15]), bone: base,
  } as any);
  // lantern
  rod([0.34, 2.18, 1.05], [0.34, 2.18, 1.2], 0.014, IRON);
  rod([0.34, 2.18, 1.2], [0.34, 2.11, 1.2], 0.006, IRON);
  box(0.07, 0.09, 0.07, GLOW, [0.34, 2.05, 1.2]);
  box(0.085, 0.012, 0.085, IRON, [0.34, 2.0, 1.2]);
  box(0.085, 0.012, 0.085, IRON, [0.34, 2.105, 1.2]);
  part(new THREE.ConeGeometry(0.06, 0.04, 4), IRON, [0.34, 2.13, 1.2], { rotation: [0, 45, 0] });

  // ---------- rope ladder ----------
  for (const x of [-0.4, -0.15]) {
    b.rod([x, 1.64, 1.45], [x, 0.3, 1.5], 0.014, { color: ROPE, bone: base, sides: 5 } as any);
    box(0.04, 0.05, 0.05, WOOD_D, [x, 1.62, 1.43]);
  }
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.7) / 9.6;
    const y = 1.64 - t * 1.34, z = 1.45 + t * 0.05;
    b.rod([-0.42, y, z], [-0.13, y, z], 0.016, { color: WOOD, bone: base, sides: 5 } as any);
  }

  // ---------- swing ----------
  const sp = catmull([[0.2, 2.45, -0.05], [0.65, 2.6, -0.15], [1.15, 2.7, -0.2]]);
  b.sweep(sp, [0.1, 0.05], { color: BARK, sides: 6, bone: base } as any);
  const top = sp.at(0.85);
  for (const dz of [-0.2, 0.2]) {
    rod([top.x, top.y - 0.02, top.z + dz], [top.x, 0.98, top.z + dz], 0.013, ROPE);
  }
  box(0.17, 0.04, 0.5, WOOD, [top.x, 0.95, top.z]);
  box(0.17, 0.012, 0.5, WOOD_D, [top.x, 0.975, top.z]);

  // ---------- mushrooms ----------
  const mush = (x: number, z: number, s: number, cap: string) => {
    const h = 0.12 * s, r = 0.08 * s;
    part(new THREE.CylinderGeometry(0.025 * s, 0.035 * s, h, 6), "#f0e6d0", [x, G + h / 2, z]);
    part(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cap, [x, G + h - 0.005, z], { scale: [1, 0.7, 1], flat: true });
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26, th = 0.55 + (i % 2) * 0.3;
      part(new THREE.IcosahedronGeometry(0.014 * s, 0), "#fff6e6", [
        x + Math.sin(th) * Math.cos(a) * r * 0.98,
        G + h - 0.005 + Math.cos(th) * r * 0.7,
        z + Math.sin(th) * Math.sin(a) * r * 0.98,
      ], { flat: true });
    }
  };
  mush(0.62, 0.42, 1.4, "#d63a2f");
  mush(0.8, 0.62, 0.9, "#e0552f");
  mush(0.72, 0.28, 0.7, "#d63a2f");
  mush(-0.45, -0.62, 1.1, "#c9854a");
  mush(-0.25, -0.75, 0.7, "#d63a2f");

  // ---------- bicycle ----------
  const X0 = -0.95, Z0 = 0.75, th = 0.5;
  const BP = (lx: number, ly: number, lz = 0): number[] => [
    X0 + lx * Math.cos(th) + lz * Math.sin(th),
    G + ly,
    Z0 - lx * Math.sin(th) + lz * Math.cos(th),
  ];
  const BIKE = "#2a9d9a";
  for (const hx of [-0.34, 0.32]) {
    part(new THREE.TorusGeometry(0.16, 0.014, 5, 16), "#25252b", BP(hx, 0.16), { dir: [Math.sin(th), 0, Math.cos(th)], axis: "z" });
    part(new THREE.SphereGeometry(0.025, 6, 4), IRON, BP(hx, 0.16));
    for (const a of [0, 60, 120]) {
      const r = (a * Math.PI) / 180;
      b.rod(BP(hx + Math.cos(r) * 0.15, 0.16 + Math.sin(r) * 0.15), BP(hx - Math.cos(r) * 0.15, 0.16 - Math.sin(r) * 0.15), 0.004, { color: "#cfcfcf", bone: base, sides: 4 } as any);
    }
  }
  const rb = BP(-0.34, 0.16), bb = BP(-0.02, 0.12), seat = BP(-0.12, 0.42), head = BP(0.2, 0.42), fh = BP(0.32, 0.16);
  rod(rb, bb, 0.014, BIKE); rod(rb, seat, 0.014, BIKE); rod(bb, seat, 0.014, BIKE);
  rod(seat, head, 0.016, BIKE); rod(bb, head, 0.016, BIKE); rod(head, fh, 0.013, BIKE);
  rod(head, BP(0.18, 0.52), 0.012, IRON);
  rod(BP(0.18, 0.52, -0.11), BP(0.18, 0.52, 0.11), 0.011, IRON);
  box(0.11, 0.025, 0.05, "#5a3a22", BP(-0.12, 0.45), { rotation: [0, (th * 180) / Math.PI, 0] });
  // wicker basket
  box(0.1, 0.07, 0.14, "#c99a55", BP(0.27, 0.5), { rotation: [0, (th * 180) / Math.PI, 0] });

  // ---------- grass tufts, flowers, stones ----------
  const tufts: THREE.BufferGeometry[][] = [[], []];
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2, d = 0.65 + R() * 0.9;
    const g = new THREE.ConeGeometry(0.025, 0.1 + R() * 0.07, 4);
    g.rotateX((R() - 0.5) * 0.5); g.rotateZ((R() - 0.5) * 0.5);
    g.translate(Math.sin(a) * d, G + 0.05, Math.cos(a) * d);
    tufts[i % 2].push(g);
  }
  b.part(mergeGeometries(tufts[0])!, "#4f9a3a", { bone: base, at: [0, 0, 0] });
  b.part(mergeGeometries(tufts[1])!, "#86c25a", { bone: base, at: [0, 0, 0] });
  const fcols = ["#ff8fa8", "#fff2a0", "#ffffff"];
  const fl: THREE.BufferGeometry[][] = [[], [], []];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2, d = 0.8 + R() * 0.7;
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (Math.hypot(x - X0, z - Z0) < 0.6) continue;
    const g = new THREE.IcosahedronGeometry(0.025, 0);
    g.translate(x, G + 0.07, z);
    fl[i % 3].push(g);
    const s = new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4);
    s.translate(x, G + 0.035, z);
    tufts[0].length = tufts[0].length;
    fl[(i + 1) % 3 === i % 3 ? 0 : i % 3].push(s as any);
  }
  fl.forEach((arr, i) => {
    const flat = arr.map((g) => (g.index ? g.toNonIndexed() : g));
    if (flat.length) b.part(mergeGeometries(flat)!, fcols[i], { bone: base, at: [0, 0, 0], flat: true });
  });
  const stones = [[1.0, -0.8], [1.25, 0.2], [-1.2, -0.5], [0.3, 1.45], [-0.3, -1.2]];
  stones.forEach(([x, z], i) =>
    part(new THREE.IcosahedronGeometry(0.09 + (i % 3) * 0.02, 0), i % 2 ? "#9a9a96" : "#80807c", [x, G + 0.02, z], {
      scale: [1.2, 0.6, 1], rotation: [0, i * 40, 0], flat: true,
    }),
  );

  return b.root;
}
```