import * as THREE from "three";
import { createBuilder, rng, mottle, stripes, scales, grain } from "../../../../src/index";

export const meta = {
  name: "Oak Treehouse Diorama",
  description:
    "A grassy round base with an old oak, a cabin with a red shingle roof, a round window and a pennant, a rope ladder, a swing, a lantern, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });

  // palette
  const WOOD = "#b9803f", WOOD_D = "#8a5a2b", BARK = "#6b4a2f", BARK_D = "#4f3622";
  const GRASS = "#6fae3f", GRASS_D = "#4f9136", DIRT = "#7a5233";
  const RED = "#c63a2c", RED_D = "#8f2a22";
  const LEAF = ["#3f8f3a", "#58a63f", "#2f7a39", "#74b848"];
  const ROPE = "#d8c28f", STONE = "#a7a39a", GLOW = "#ffe08a", DARK = "#3a2616";

  const box = (w: number, h: number, d: number, at: number[], color: any, rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation });
  const cyl = (rt: number, rb: number, h: number, at: number[], color: any, seg = 8, rotation?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation });
  const ball = (r: number, at: number[], color: any, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, { at });

  // ---- base ----
  cyl(2.25, 2.05, 0.14, [0, 0.07, 0], DIRT, 28);
  cyl(2.3, 2.3, 0.1, [0, 0.17, 0], mottle(GRASS, GRASS_D, { size: 0.35, seed: 3 }), 28);

  // ---- tree ----
  const barkPaint = grain(BARK, BARK_D, { size: 0.05, axis: "y" });
  b.sweep(
    [[0, 0.15, 0], [0.02, 1.0, -0.02], [0, 1.9, 0], [0, 2.7, -0.1], [0, 3.3, -0.15]],
    [0.44, 0.15],
    { color: barkPaint, sides: 9, caps: "round" },
  );
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const c = Math.cos(a), s = Math.sin(a);
    b.spike([c * 0.3, 0.45, s * 0.3], [c, -0.4, s], 0.8, 0.15, { color: BARK });
  }
  // right branch
  b.sweep([[0, 2.3, -0.05], [0.7, 2.7, -0.1], [1.3, 3.1, -0.2]], [0.14, 0.06], { color: barkPaint, sides: 7 });
  // swing branch
  b.sweep([[0, 2.0, 0], [-0.5, 2.25, 0.05], [-1.0, 2.38, 0.1], [-1.6, 2.5, 0.1]], [0.17, 0.07], {
    color: barkPaint,
    sides: 7,
  });

  // crown
  const blobs = [
    [0, 4.1, -0.2, 1.0], [1.2, 3.7, -0.2, 0.9], [-1.2, 3.7, -0.2, 0.9], [0.7, 3.5, -0.9, 0.9],
    [-0.7, 3.5, -0.9, 0.9], [1.9, 3.3, -0.4, 0.7], [-1.9, 3.3, -0.5, 0.75], [0, 3.6, -1.0, 0.8],
    [0.9, 4.2, -0.5, 0.7], [-0.9, 4.2, -0.5, 0.7], [0.5, 3.9, 0.5, 0.55], [-0.6, 3.8, 0.4, 0.55],
  ];
  blobs.forEach((bl, i) => {
    b.part(new THREE.IcosahedronGeometry(bl[3], 1), LEAF[i % 4], {
      at: [bl[0], bl[1], bl[2]],
      scale: [1, 0.85, 1],
      flat: true,
    });
  });

  // ---- platform ----
  const planks = stripes(WOOD, WOOD_D, { size: 0.12, axis: "x", width: 0.15 });
  box(1.5, 0.08, 1.6, [0, 1.6, 0.65], planks);
  for (const s of [1, -1]) {
    b.rod([0, 1.15, 0.15], [s * 0.55, 1.57, 1.35], 0.05, { color: WOOD_D, sides: 6 });
    // posts and side rails
    cyl(0.025, 0.025, 0.42, [s * 0.72, 1.85, -0.1], WOOD_D, 6);
    cyl(0.025, 0.025, 0.42, [s * 0.72, 1.85, 1.42], WOOD_D, 6);
    b.rod([s * 0.72, 2.0, -0.1], [s * 0.72, 2.0, 1.42], 0.02, { color: WOOD, sides: 6 });
    b.rod([s * 0.72, 1.82, -0.1], [s * 0.72, 1.82, 1.42], 0.015, { color: WOOD, sides: 6 });
  }
  cyl(0.025, 0.025, 0.42, [0.25, 1.85, 1.42], WOOD_D, 6);
  b.rod([-0.72, 2.0, 1.42], [0.25, 2.0, 1.42], 0.02, { color: WOOD, sides: 6 });
  b.rod([-0.72, 1.82, 1.42], [0.25, 1.82, 1.42], 0.015, { color: WOOD, sides: 6 });
  // string lights
  for (let i = 0; i < 6; i++) ball(0.025, [-0.72 + i * 0.19, 1.96, 1.44], i % 2 ? GLOW : "#ff9a6b", 5, 4);

  // ---- cabin ----
  box(1.0, 0.8, 0.9, [0, 2.04, 0.7], stripes(WOOD, WOOD_D, { size: 0.1, axis: "x", width: 0.12 }));
  // corner posts
  for (const sx of [1, -1]) for (const z of [0.25, 1.15]) box(0.06, 0.82, 0.06, [sx * 0.5, 2.04, z], WOOD_D);
  // roof
  const shingle = scales(RED, RED_D, { size: 0.09 });
  for (const s of [1, -1]) {
    box(0.8, 0.06, 1.1, [s * 0.33, 2.7, 0.7], shingle, [0, 0, -s * 35]);
  }
  box(0.1, 0.07, 1.12, [0, 2.96, 0.7], RED_D);
  for (const z of [0.25, 1.15]) {
    b.extrude([[-0.5, 0], [0.5, 0], [0, 0.5, "sharp"]], {
      at: [0, 2.44, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      color: WOOD,
    });
  }
  // chimney
  box(0.18, 0.5, 0.18, [0.33, 2.85, 0.45], STONE);
  box(0.22, 0.04, 0.22, [0.33, 3.12, 0.45], "#8b877e");
  ball(0.07, [0.35, 3.25, 0.45], "#d9d9d9", 6, 4);
  ball(0.09, [0.4, 3.42, 0.43], "#e8e8e8", 6, 4);

  // door
  box(0.38, 0.64, 0.03, [-0.15, 1.96, 1.155], WOOD_D);
  box(0.3, 0.58, 0.03, [-0.15, 1.93, 1.17], "#7a3f22");
  ball(0.02, [-0.06, 1.93, 1.2], "#e6c15a", 5, 4);
  box(0.4, 0.04, 0.1, [-0.15, 1.65, 1.2], STONE);

  // round window
  b.part(new THREE.TorusGeometry(0.12, 0.022, 6, 14), WOOD_D, { at: [0.22, 2.12, 1.16] });
  b.part(new THREE.CircleGeometry(0.11, 12), GLOW, { at: [0.22, 2.12, 1.152] });
  box(0.23, 0.014, 0.012, [0.22, 2.12, 1.165], WOOD_D);
  box(0.014, 0.23, 0.012, [0.22, 2.12, 1.165], WOOD_D);
  box(0.3, 0.03, 0.07, [0.22, 1.98, 1.19], WOOD_D);

  // pennant
  cyl(0.014, 0.014, 0.6, [0, 3.26, 1.0], WOOD_D, 6);
  ball(0.03, [0, 3.58, 1.0], "#e6c15a", 6, 4);
  b.extrude([[0, 0], [0.5, 0.09, "sharp"], [0, 0.18]], {
    at: [0, 3.34, 1.0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: "#e0482f",
  });
  b.extrude([[0, 0.04], [0.2, 0.09, "sharp"], [0, 0.14]], {
    at: [0, 3.34, 1.008],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    color: "#ffe08a",
  });

  // lantern
  b.rod([-0.42, 2.18, 1.15], [-0.42, 2.18, 1.3], 0.012, { color: DARK, sides: 5 });
  b.rod([-0.42, 2.18, 1.3], [-0.42, 2.1, 1.3], 0.006, { color: DARK, sides: 4 });
  b.part(new THREE.ConeGeometry(0.07, 0.05, 6), DARK, { at: [-0.42, 2.07, 1.3] });
  box(0.08, 0.1, 0.08, [-0.42, 1.99, 1.3], GLOW);
  box(0.095, 0.02, 0.095, [-0.42, 1.93, 1.3], DARK);

  // ---- rope ladder ----
  for (const x of [0.42, 0.7]) b.rod([x, 1.6, 1.5], [x, 0.26, 1.58], 0.013, { color: ROPE, sides: 5 });
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.5) / 8.4;
    cyl(0.017, 0.017, 0.32, [0.56, 1.6 - t * 1.34, 1.5 + t * 0.08], WOOD, 6, [0, 0, 90]);
  }

  // ---- swing ----
  for (const s of [1, -1]) b.rod([-1.3, 2.42, 0.1 + s * 0.05], [-1.3, 0.78, 0.1 + s * 0.22], 0.012, { color: ROPE, sides: 5 });
  box(0.2, 0.04, 0.55, [-1.3, 0.76, 0.1], WOOD);

  // ---- mushrooms ----
  const shroom = (x: number, z: number, r: number, h: number, color: string) => {
    cyl(r * 0.28, r * 0.35, h, [x, 0.22 + h / 2, z], "#f2e8d0", 7);
    b.part(new THREE.SphereGeometry(r, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), color, {
      at: [x, 0.22 + h, z],
      scale: [1, 0.8, 1],
      flat: true,
    });
    for (let k = 0; k < 5; k++) {
      const a = k * 2.4, e = 0.55 + (k % 2) * 0.35;
      ball(r * 0.14, [x + Math.sin(e) * Math.cos(a) * r * 0.97, 0.22 + h + Math.cos(e) * r * 0.8, z + Math.sin(e) * Math.sin(a) * r * 0.97], "#fff6e6", 5, 3);
    }
  };
  shroom(-0.55, 0.9, 0.14, 0.12, "#d9402f");
  shroom(-0.8, 0.7, 0.09, 0.09, "#e8762f");
  shroom(-0.35, 1.1, 0.07, 0.07, "#d9402f");
  shroom(0.65, -0.65, 0.12, 0.1, "#c9473a");

  // ---- bicycle ----
  const bx = 1.4, bz = 0.3, BIKE = "#2fa6a0";
  const P = (dz: number, y: number) => [bx, y, bz + dz];
  for (const dz of [-0.42, 0.42]) {
    b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 16), "#2b2b2b", { at: P(dz, 0.545), rotation: [0, 90, 0] });
    ball(0.03, P(dz, 0.545), "#bbbbbb", 5, 4);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 4;
      const dy = Math.cos(a) * 0.3, dd = Math.sin(a) * 0.3;
      b.rod(P(dz - dd, 0.545 - dy), P(dz + dd, 0.545 + dy), 0.005, { color: "#cccccc", sides: 4 });
    }
  }
  const fr = { color: BIKE, sides: 6 };
  b.rod(P(-0.42, 0.545), P(-0.02, 0.42), 0.016, fr);
  b.rod(P(-0.42, 0.545), P(-0.17, 0.95), 0.016, fr);
  b.rod(P(-0.02, 0.42), P(-0.17, 0.95), 0.016, fr);
  b.rod(P(-0.17, 0.95), P(0.28, 0.92), 0.016, fr);
  b.rod(P(-0.02, 0.42), P(0.28, 0.92), 0.018, fr);
  b.rod(P(0.28, 0.98), P(0.42, 0.545), 0.014, fr);
  b.rod(P(0.26, 1.0), P(0.3, 1.04), 0.012, { color: "#333333", sides: 5 });
  b.rod([bx - 0.22, 1.04, bz + 0.3], [bx + 0.22, 1.04, bz + 0.3], 0.012, { color: "#333333", sides: 5 });
  box(0.07, 0.035, 0.18, [bx, 0.98, bz - 0.19], "#3a2a22");
  ball(0.03, P(-0.02, 0.42), "#888888", 5, 4);
  box(0.22, 0.13, 0.16, [bx, 1.0, bz + 0.5], "#b07a3a");

  // ---- stepping stones, tufts, flowers ----
  [[0.56, 1.85], [0.75, 2.12], [0.5, 2.35]].forEach(([x, z]) => cyl(0.14, 0.15, 0.04, [x, 0.22, z], STONE, 7));
  const r = rng(11);
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, d = 0.8 + r() * 1.35;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (x > 1.0 && x < 1.8 && z > -0.3 && z < 0.9) continue;
    b.part(new THREE.ConeGeometry(0.03, 0.12 + r() * 0.08, 4), i % 2 ? GRASS_D : "#86c24b", {
      at: [x, 0.27, z],
      flat: true,
    });
  }
  const petals = ["#ffd24a", "#ff8fb1", "#ffffff", "#b58cff"];
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = 1.2 + r() * 0.9;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (x > 1.0 && x < 1.8 && z > -0.3 && z < 0.9) continue;
    cyl(0.006, 0.006, 0.12, [x, 0.28, z], GRASS_D, 4);
    ball(0.035, [x, 0.36, z], petals[i % 4], 5, 4);
  }

  return b.root;
}
