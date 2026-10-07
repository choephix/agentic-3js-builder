```ts
import * as THREE from "three";
import { createBuilder, paint, stripes, grain, mottle, patches, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A cosy oak treehouse: plank platform with railing, gabled cabin with arched door, flower box, chimney, rope ladder-style ladder, swing, lantern and flag.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });
  b.joint("door", { parent: "root", at: [-0.85, 3.5, 2.15], dir: [0, 1, 0], role: "hinge" });

  const P = THREE;
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new P.BoxGeometry(w, h, d), color, { at, bone: "root", ...o });
  const ico = (r: number, color: any, at: number[], o: any = {}) =>
    b.part(new P.IcosahedronGeometry(r, 1), color, { at, bone: "root", flat: true, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    b.part(new P.CylinderGeometry(r1, r0, h, seg), color, { at, bone: "root", ...o });
  const rod = (a: number[], c: number[], r: any, color: any, sides = 6) =>
    b.rod(a, c, r, { color, bone: "root", sides, caps: "flat" });

  const BARK = "#6b4a2f", BARK_D = "#46301e";
  const barkPaint = grain(BARK, BARK_D, { size: 0.09, axis: "y", seed: 2 });
  const WOOD = "#c58f55", WOOD2 = "#b27c46", DARK = "#4a3020";
  const plankWall = stripes("#d9a76a", "#a87442", { size: 0.22, axis: "y", width: 0.1, wobble: 0.05 });
  const roofPaint = mottle("#b8483a", "#8f3329", { size: 0.35, contrast: 1.5 });
  const stone = patches("#6e6a66", "#9a948c", { size: 0.18, gap: 0.12 });
  const GREENS = ["#4f9a3c", "#3f8a35", "#5fab48", "#2f7a3a"];

  // ground
  cyl(5.5, 5.5, 0.12, 16, mottle("#5e9a3e", "#4a8434", { size: 0.8 }), [0, -0.04, 0]);

  // trunk & roots
  b.lathe(
    [[0, 0], [1.0, 0], [0.72, 0.5], [0.52, 1.5], [0.44, 4], [0.36, 7], [0, 8.4]],
    { at: [0, 0, 0], color: barkPaint, segments: 9, bone: "root" },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    rod([Math.cos(a) * 0.4, 0.6, Math.sin(a) * 0.4], [Math.cos(a) * 1.7, -0.02, Math.sin(a) * 1.7], [0.2, 0.07], BARK, 5);
  }

  // branches and canopy
  const blobs: Array<[number, number, number, number]> = [
    [0, 8.6, 0, 2.4], [1.9, 7.9, 0.5, 1.8], [-1.9, 8.0, -0.3, 1.9],
    [0.4, 7.8, 2.0, 1.5], [-0.6, 8.1, -1.9, 1.8], [1.3, 9.6, -0.5, 1.4],
  ];
  blobs.forEach(([x, y, z, r], i) => {
    ico(r, GREENS[i % 4], [x, y, z]);
    if (i > 0) rod([0, 6.3 + i * 0.1, 0], [x * 0.8, y - 0.8, z * 0.8], [0.17, 0.07], BARK, 5);
  });
  const rn = rng(5);
  for (let i = 0; i < 16; i++) {
    const [x, y, z, r] = blobs[i % blobs.length];
    const th = rn() * Math.PI * 2, ph = Math.acos(rn() * 1.2 - 0.5);
    ico(0.1, i % 2 ? "#f4a6c0" : "#f6e27a", [
      x + Math.sin(ph) * Math.cos(th) * r * 0.98,
      y + Math.cos(ph) * r * 0.98,
      z + Math.sin(ph) * Math.sin(th) * r * 0.98,
    ]);
  }

  // swing branch
  rod([0.2, 5.4, -0.2], [3.5, 6.05, -0.95], [0.2, 0.07], BARK, 6);
  ico(0.75, "#4f9a3c", [3.55, 6.35, -0.95]);
  rod([3.0, 5.92, -0.56], [3.0, 1.1, -0.56], 0.015, "#d8c79a", 4);
  rod([3.0, 5.92, -1.06], [3.0, 1.1, -1.06], 0.015, "#d8c79a", 4);
  box(0.3, 0.05, 0.7, WOOD2, [3.0, 1.05, -0.81]);

  // platform
  for (let i = 0; i < 9; i++) box(0.45, 0.12, 4.5, i % 2 ? WOOD : WOOD2, [-1.84 + i * 0.46, 3.44, 0.75]);
  for (const x of [-1.6, 1.6]) box(0.2, 0.2, 4.5, DARK, [x, 3.28, 0.75]);
  for (const z of [-1.2, 2.7]) box(4.3, 0.18, 0.2, DARK, [0, 3.26, z]);
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]])
    rod([sx * 0.25, 2.3, sz * 0.25], [sx * 1.8, 3.2, sz > 0 ? 2.7 : -1.2], [0.1, 0.08], DARK, 5);

  // railing
  const segs: number[][] = [
    [2, 3, -0.8, 3], [-1.6, 3, -2, 3], [2, 3, 2, -1.5], [2, -1.5, -2, -1.5], [-2, -1.5, -2, 3],
  ];
  for (const [x0, z0, x1, z1] of segs) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 0.9));
    for (let i = 0; i <= n; i++)
      rod([x0 + ((x1 - x0) * i) / n, 3.5, z0 + ((z1 - z0) * i) / n], [x0 + ((x1 - x0) * i) / n, 4.5, z0 + ((z1 - z0) * i) / n], 0.05, WOOD2, 4);
    rod([x0, 4.5, z0], [x1, 4.5, z1], 0.05, WOOD, 4);
    rod([x0, 4.0, z0], [x1, 4.0, z1], 0.035, WOOD, 4);
  }

  // ladder
  for (const x of [-1.5, -0.9]) rod([x, 0, 4.1], [x, 3.7, 3.0], 0.05, WOOD2, 4);
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.7) / 9.6;
    rod([-1.5, t * 3.7, 4.1 - t * 1.1], [-0.9, t * 3.7, 4.1 - t * 1.1], 0.03, WOOD, 4);
  }
  for (let i = 0; i < 4; i++) cyl(0.35, 0.33, 0.08, 7, stone, [-1.2 + (i % 2 ? 0.3 : -0.2), 0.03, 4.8 + i * 0.75]);

  // cabin
  box(2.6, 2.0, 2.4, plankWall, [0, 4.5, 0.9]);
  for (const [x, z] of [[-1.3, 2.1], [1.3, 2.1], [-1.3, -0.3], [1.3, -0.3]]) box(0.14, 2.0, 0.14, DARK, [x, 4.5, z]);
  box(2.7, 0.1, 2.5, DARK, [0, 3.55, 0.9]);
  for (const s of [1, -1]) box(2.05, 0.1, 2.9, roofPaint, [s * 0.83, 6.02, 0.9], { rotation: [0, 0, -s * 32] });
  box(0.16, 0.12, 2.95, "#7a2a22", [0, 6.55, 0.9]);
  for (const z of [2.1, -0.3])
    b.extrude([[-1.3, 0], [1.3, 0], [0, 1.0]], { at: [0, 5.5, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, color: "#d9a76a", bone: "root" });
  cyl(0.24, 0.24, 0.05, 10, "#ffe9a0", [0, 5.9, 2.18], { rotation: [90, 0, 0] });
  b.part(new P.TorusGeometry(0.25, 0.04, 5, 10), DARK, { at: [0, 5.9, 2.19], bone: "root" });
  box(0.04, 0.5, 0.03, DARK, [0, 5.9, 2.2]);
  box(0.5, 0.04, 0.03, DARK, [0, 5.9, 2.2]);

  // door (with hinge joint)
  box(0.75, 1.3, 0.08, "#2f6f6a", [-0.5, 4.15, 2.15], { bone: "door" });
  cyl(0.375, 0.375, 0.08, 10, "#2f6f6a", [-0.5, 4.8, 2.15], { rotation: [90, 0, 0], bone: "door" });
  box(0.08, 1.9, 0.02, "#255a56", [-0.5, 4.4, 2.2], { bone: "door" });
  ico(0.05, "#e8c04a", [-0.3, 4.15, 2.23], { bone: "door" });
  box(0.95, 0.08, 0.15, DARK, [-0.5, 3.54, 2.2]);

  // windows
  const win = (at: number[], side: boolean) => {
    const [x, y, z] = at;
    const d = side ? [0.1, 0.8, 0.8] : [0.8, 0.8, 0.1];
    box(d[0], d[1], d[2], DARK, [x, y, z]);
    const o = side ? 0.04 : 0, p = side ? 0 : 0.04;
    box(side ? 0.1 : 0.62, 0.62, side ? 0.62 : 0.1, "#ffe08a", [x + o, y, z + p]);
    box(side ? 0.12 : 0.05, 0.64, side ? 0.05 : 0.12, DARK, [x + o, y, z + p]);
    box(side ? 0.12 : 0.64, 0.05, side ? 0.64 : 0.12, DARK, [x + o, y, z + p]);
  };
  win([0.65, 4.6, 2.12], false);
  win([1.3, 4.6, 0.9], true);
  win([-1.3, 4.6, 0.9], true);
  box(0.3, 0.8, 0.06, "#2f6f6a", [0.15, 4.6, 2.15]);
  box(0.3, 0.8, 0.06, "#2f6f6a", [1.15, 4.6, 2.15]);
  box(0.9, 0.16, 0.24, WOOD2, [0.65, 4.05, 2.25]);
  const fl = ["#e84a5f", "#f7c548", "#f4a6c0", "#ffffff"];
  for (let i = 0; i < 6; i++) {
    ico(0.07, "#3f8a35", [0.28 + i * 0.14, 4.16, 2.25]);
    ico(0.06, fl[i % 4], [0.28 + i * 0.14, 4.25, 2.27 + (i % 2) * 0.03]);
  }

  // chimney + smoke
  box(0.42, 1.4, 0.42, stone, [0.75, 6.35, 0.2]);
  box(0.52, 0.1, 0.52, "#4a4642", [0.75, 7.08, 0.2]);
  [[0.8, 7.4, 0.2, 0.16], [0.95, 7.8, 0.15, 0.22], [1.15, 8.3, 0.1, 0.28]].forEach(([x, y, z, r]) =>
    ico(r, "#e8eaee", [x, y, z]),
  );

  // lantern
  rod([-1.0, 5.1, 2.1], [-1.0, 5.1, 2.5], 0.03, DARK, 4);
  rod([-1.0, 5.1, 2.5], [-1.0, 4.85, 2.5], 0.012, DARK, 4);
  box(0.16, 0.22, 0.16, "#ffd24a", [-1.0, 4.72, 2.5]);
  cyl(0.02, 0.12, 0.08, 4, DARK, [-1.0, 4.87, 2.5]);

  // flag
  rod([0, 6.55, 2.2], [0, 7.4, 2.2], 0.025, DARK, 4);
  box(0.55, 0.3, 0.02, "#e84a5f", [0.28, 7.22, 2.2]);
  ico(0.05, "#f7c548", [0, 7.45, 2.2]);

  // ground details
  [[-2.8, 3.2], [2.8, 3.0], [3.4, 0.5], [-3.0, -1.5]].forEach(([x, z], i) => {
    ico(0.45 + (i % 2) * 0.15, GREENS[i], [x, 0.3, z]);
  });
  [[2.2, 4.0], [-3.4, 1.5]].forEach(([x, z]) => {
    cyl(0.05, 0.06, 0.2, 5, "#f1e6d0", [x, 0.12, z]);
    cyl(0.01, 0.2, 0.14, 7, "#d63a30", [x, 0.28, z]);
    ico(0.03, "#ffffff", [x + 0.07, 0.34, z + 0.07]);
  });
  [[-2.4, 2.2], [3.6, 2.0]].forEach(([x, z]) => ico(0.28, "#8c8a86", [x, 0.1, z]));
  const rf = rng(9);
  for (let i = 0; i < 14; i++) {
    const a = rf() * Math.PI * 2, d = 2.6 + rf() * 2.3;
    ico(0.05, fl[i % 4], [Math.cos(a) * d, 0.1, Math.sin(a) * d]);
  }

  return b.root;
}
```