import * as THREE from "three";
import { createBuilder, catmull, rng, grain, stripes, mottle, scales } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A plank cabin with a gabled shingle roof, chimney, veranda, ladder and rope swing, built on stilts around a big oak with a low-poly canopy.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  const rand = rng(11);

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });

  const BARK = grain("#6b4a2f", "#47301d", { size: 0.07, axis: "y", seed: 3 });
  const WOOD = stripes("#c98f55", "#a9703c", { size: 0.2, axis: "y", width: 0.2, wobble: 0.05 });
  const PLANK = stripes("#b07a45", "#8d5d33", { size: 0.25, axis: "z", width: 0.12, wobble: 0.05 });
  const DARK = "#5a3b22";
  const ROOF = stripes("#b5472f", "#8e3322", { size: 0.18, axis: "y", width: 0.35, wobble: 0.03 });

  // ground
  b.part(new THREE.CylinderGeometry(4.8, 5.0, 0.12, 14), mottle("#6aa14a", "#4f8a3b", { size: 0.8 }), { at: [0, 0.04, 0.3] });
  for (let i = 0; i < 7; i++) {
    const a = rand() * 6.28, r = 2.5 + rand() * 1.8;
    b.part(new THREE.DodecahedronGeometry(0.15 + rand() * 0.15, 0), "#9a9a92", {
      at: [Math.cos(a) * r, 0.1, Math.sin(a) * r + 0.3], flat: true,
    });
  }

  // trunk
  const trunkPath = catmull([[0, 0, 0], [0.05, 2, -0.05], [0, 4, 0.03], [-0.05, 6, 0], [0, 7.2, 0]]);
  b.sweep(trunkPath, (t: number) => 0.62 - 0.22 * t + Math.max(0, 0.45 * (1 - t * 7)), {
    color: BARK, caps: { start: "flat", end: "round" }, sides: 10,
  });
  const roots: [number, number, number, number][] = [[0.9, 0.9, 0, 0], [-0.9, 0.7, 0.4, 0], [0.2, 0.2, -1.5, 0], [-0.4, -0.6, 1.3, 0]];
  for (const [rx, , rz] of roots.map((r) => [r[0], r[1], r[2]])) {
    b.rod([rx * 0.3, 0.7, rz * 0.3], [rx * 1.6, 0.0, rz * 1.6 + 0.1], [0.24, 0.08], { color: BARK, sides: 6 });
  }

  // stilts
  const posts: [number, number][] = [[-1.8, -1.3], [1.8, -1.3], [-1.8, 2.3], [1.8, 2.3]];
  for (const [x, z] of posts) {
    b.rod([x, 0, z], [x, 3.25, z], 0.11, { color: DARK, sides: 6, caps: "flat" });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 6), "#8a8a82", { at: [x, 0.03, z], flat: true });
  }
  for (const sx of [-1, 1]) {
    b.rod([sx * 0.4, 2.4, 0.2], [sx * 1.8, 1.0, 2.3], 0.06, { color: DARK, sides: 5, caps: "flat" });
  }
  b.rod([0, 2.3, -0.3], [-1.8, 1.0, -1.3], 0.06, { color: DARK, sides: 5, caps: "flat" });
  b.rod([0, 2.3, -0.3], [1.8, 1.0, -1.3], 0.06, { color: DARK, sides: 5, caps: "flat" });

  // platform
  box(4.2, 0.18, 4.2, PLANK, 0, 3.2, 0.5);
  box(4.3, 0.12, 0.12, DARK, 0, 3.08, 2.6);
  box(4.3, 0.12, 0.12, DARK, 0, 3.08, -1.6);
  box(0.12, 0.12, 4.3, DARK, -2.1, 3.08, 0.5);
  box(0.12, 0.12, 4.3, DARK, 2.1, 3.08, 0.5);

  // cabin
  const baseY = 3.29, H = 2.2, cz = 0.8;
  box(2.8, H, 2.4, WOOD, 0, baseY + H / 2, cz);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.16, H + 0.04, 0.16, DARK, sx * 1.4, baseY + H / 2, cz + sz * 1.2);
  box(2.95, 0.12, 2.55, DARK, 0, baseY + H + 0.02, cz);
  box(2.95, 0.12, 2.55, DARK, 0, baseY + 0.04, cz);

  // door
  const fz = cz + 1.2;
  box(0.86, 1.65, 0.06, "#7a4a2a", 0, baseY + 0.85, fz + 0.02);
  box(0.96, 0.1, 0.1, DARK, 0, baseY + 1.72, fz + 0.04);
  box(0.08, 1.7, 0.1, DARK, -0.47, baseY + 0.87, fz + 0.04);
  box(0.08, 1.7, 0.1, DARK, 0.47, baseY + 0.87, fz + 0.04);
  b.part(new THREE.SphereGeometry(0.05, 6, 5), "#e6c25a", { at: [0.28, baseY + 0.85, fz + 0.09] });
  box(0.7, 0.1, 0.5, "#a5a59c", 0, 3.34, fz + 0.3);

  // windows
  const win = (x: number, y: number, z: number, side: boolean) => {
    const sx = side ? 1 : 0, sz = side ? 0 : 1;
    const w = 0.56;
    box(side ? 0.06 : w, w, side ? w : 0.06, "#8fd3ea", x, y, z);
    const f = "#f1e6cf";
    if (side) {
      box(0.1, 0.07, w + 0.12, f, x, y + w / 2, z); box(0.1, 0.07, w + 0.12, f, x, y - w / 2, z);
      box(0.1, w + 0.12, 0.07, f, x, y, z - w / 2); box(0.1, w + 0.12, 0.07, f, x, y, z + w / 2);
      box(0.1, w, 0.04, f, x, y, z);
    } else {
      box(w + 0.12, 0.07, 0.1, f, x, y + w / 2, z); box(w + 0.12, 0.07, 0.1, f, x, y - w / 2, z);
      box(0.07, w + 0.12, 0.1, f, x - w / 2, y, z); box(0.07, w + 0.12, 0.1, f, x + w / 2, y, z);
      box(0.04, w, 0.1, f, x, y, z);
    }
    void sx; void sz;
  };
  for (const sx of [-1, 1]) {
    win(sx * 1.0, baseY + 1.35, fz + 0.02, false);
    box(0.2, 0.7, 0.07, "#2f8a7a", sx * 1.0 - 0.45, baseY + 1.35, fz + 0.06);
    box(0.2, 0.7, 0.07, "#2f8a7a", sx * 1.0 + 0.45, baseY + 1.35, fz + 0.06);
    // flower box
    box(0.7, 0.16, 0.2, DARK, sx * 1.0, baseY + 0.9, fz + 0.14);
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.IcosahedronGeometry(0.09, 0), i % 2 ? "#e8668c" : "#f6c744", {
        at: [sx * 1.0 - 0.24 + i * 0.16, baseY + 1.04, fz + 0.14], flat: true,
      });
    }
    win(sx * 1.43, baseY + 1.3, cz + 0.1, true);
  }

  // roof
  b.extrude([[-1.95, 0], [1.95, 0], [0, 1.35]], {
    color: ROOF, at: [0, baseY + H + 0.08, cz], x: [1, 0, 0], y: [0, 1, 0], thickness: 3.0, name: "roof",
  });
  // eave boards
  for (const sx of [-1, 1]) {
    b.rod([sx * 1.95, baseY + H + 0.08, cz - 1.5], [0, baseY + H + 1.43, cz - 1.5], 0.06, { color: "#f1e6cf", sides: 4, caps: "flat" });
    b.rod([sx * 1.95, baseY + H + 0.08, cz + 1.5], [0, baseY + H + 1.43, cz + 1.5], 0.07, { color: "#f1e6cf", sides: 4, caps: "flat" });
  }
  b.rod([0, baseY + H + 1.4, cz - 1.5], [0, baseY + H + 1.4, cz + 1.5], 0.07, { color: DARK, sides: 5, caps: "flat" });
  // attic window
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 10), "#f1e6cf", { at: [0, baseY + H + 0.6, cz + 1.53], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 10), "#8fd3ea", { at: [0, baseY + H + 0.6, cz + 1.54], rotation: [90, 0, 0] });
  // chimney
  box(0.42, 1.5, 0.42, scales("#a65a45", "#6d3a2e", { size: 0.18 }), 0.95, baseY + H + 0.95, cz - 0.2);
  box(0.54, 0.1, 0.54, "#6d6d68", 0.95, baseY + H + 1.72, cz - 0.2);
  // flag
  b.rod([0, baseY + H + 1.4, cz + 1.5], [0, baseY + H + 2.3, cz + 1.5], 0.025, { color: "#eee", sides: 4 });
  box(0.04, 0.3, 0.5, "#e04a3a", 0, baseY + H + 2.1, cz + 1.78);
  // lantern
  b.rod([0.9, baseY + H + 0.0, fz + 0.55], [0.9, baseY + H - 0.35, fz + 0.55], 0.015, { color: DARK, sides: 4 });
  b.part(new THREE.BoxGeometry(0.2, 0.26, 0.2), "#ffd45a", { at: [0.9, baseY + H - 0.5, fz + 0.55] });
  b.part(new THREE.ConeGeometry(0.17, 0.12, 4), DARK, { at: [0.9, baseY + H - 0.31, fz + 0.55], rotation: [0, 45, 0] });

  // railings
  const rail = (ax: number, az: number, bx: number, bz: number) => {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 0.55));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.rod([ax + (bx - ax) * t, 3.29, az + (bz - az) * t], [ax + (bx - ax) * t, 4.05, az + (bz - az) * t], 0.045, { color: DARK, sides: 5, caps: "flat" });
    }
    b.rod([ax, 4.05, az], [bx, 4.05, bz], 0.06, { color: "#8d5d33", sides: 5, caps: "flat" });
    b.rod([ax, 3.7, az], [bx, 3.7, bz], 0.03, { color: "#8d5d33", sides: 4, caps: "flat" });
  };
  rail(-2.0, 2.5, 0.8, 2.5);
  rail(-2.0, 2.5, -2.0, -1.5);
  rail(2.0, 2.5, 2.0, -1.5);
  rail(-2.0, -1.5, -0.7, -1.5);
  rail(0.7, -1.5, 2.0, -1.5);

  // ladder
  const top = [0, 3.35, 2.55], bot = [0, 0.05, 3.7];
  for (const x of [1.15, 1.75]) b.rod([x, top[1], top[2]], [x, bot[1], bot[2]], 0.05, { color: "#8d5d33", sides: 5, caps: "flat" });
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    box(0.65, 0.05, 0.06, "#b07a45", 1.45, top[1] + (bot[1] - top[1]) * t, top[2] + (bot[2] - top[2]) * t);
  }

  // canopy branches and foliage
  const barkRod = (a: number[], c: number[], r: [number, number]) => b.rod(a, c, r, { color: BARK, sides: 6 });
  barkRod([0, 5.5, 0], [-2.6, 7.4, -1.0], [0.2, 0.07]);
  barkRod([0, 6.0, 0], [2.4, 7.8, -0.8], [0.18, 0.06]);
  barkRod([0, 6.5, 0], [0.4, 8.2, -1.6], [0.18, 0.06]);
  barkRod([0.1, 5.2, -0.2], [-3.4, 5.7, 0.2], [0.2, 0.07]); // swing branch

  const greens = ["#3f8f3a", "#4fa545", "#2f7a35", "#5db04c", "#38853d"];
  const blobs: [number, number, number, number][] = [
    [0, 8.4, -0.3, 2.0], [-2.4, 7.7, -1.0, 1.5], [2.4, 8.0, -0.8, 1.55], [0.5, 9.4, -1.0, 1.5],
    [-1.2, 8.4, -2.0, 1.4], [1.6, 8.4, -2.0, 1.3], [-3.0, 6.9, 0.4, 0.9], [-1.3, 9.2, 0.4, 1.1],
    [1.2, 9.0, 0.5, 1.0], [3.0, 7.2, -1.2, 1.0],
  ];
  blobs.forEach(([x, y, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 1), greens[i % greens.length], {
      at: [x, y, z], scale: [1, 0.82, 1], rotation: [rand() * 90, rand() * 90, 0], flat: true,
    });
  });
  // a few apples
  for (let i = 0; i < 6; i++) {
    const [x, y, z, r] = blobs[i % 5];
    const a = rand() * 6.28;
    b.part(new THREE.IcosahedronGeometry(0.1, 0), "#d9382c", {
      at: [x + Math.cos(a) * r * 0.85, y - r * 0.5, z + Math.sin(a) * r * 0.85 + 0.2], flat: true,
    });
  }

  // rope swing
  for (const z of [-0.4, 0.4]) {
    b.rod([-2.6, 5.4, z], [-2.6, 1.15, z], 0.018, { color: "#d8c08a", sides: 4, caps: "flat" });
  }
  box(0.32, 0.06, 1.0, "#a9703c", -2.6, 1.1, 0);

  return b.root;
}
