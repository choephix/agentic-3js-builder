import * as THREE from "three";
import { createBuilder, catmull, grain, mottle, spots, scales, stripes, rng } from "../../../../src/index";

export const meta = {
  name: "Oak Treehouse Diorama",
  description:
    "A cozy round grassy diorama: an old oak with a wide leafy crown, a wooden cabin with a red shingle roof, round window, lantern and pennant, a rope ladder, a swing, mushrooms and a bicycle.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });
  const r = rng(7);
  const D = Math.PI / 180;
  const G = 0.34; // grass top

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], rot: number[] = [0, 0, 0], o: any = {}) =>
    b.part(geo, color, { at, rotation: rot, flat: true, ...o });
  const R = (a: any, c: any, rad: number, color: string, sides = 6) =>
    b.rod(a, c, rad, { color, sides });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // palette
  const WOOD = "#b07a45", DARK = "#6b4326", ROPE = "#d1b07a", LEAF = ["#4f8f3a", "#5ea044", "#3f7d33", "#6fb04c"];
  const BARK = grain("#5a3d2b", "#7d5b40", { size: 0.05 });
  const PLANKS = stripes("#c9965a", "#a8763f", { size: 0.12, axis: [1, 0, 1], width: 0.15, wobble: 0.04 });
  const DECK = stripes("#b98a52", "#8f6638", { size: 0.1, axis: "x", width: 0.12, wobble: 0.03 });
  const SHINGLE = scales(["#b93a2e", "#c4463a", "#a83024"], "#6e1d17", { size: 0.075, width: 0.14 });

  // ---------- base ----------
  P(cyl(1.5, 1.55, 0.3, 24), mottle("#6b4a30", "#4f3623", { size: 0.18 }), [0, 0.15, 0]);
  P(cyl(1.62, 1.6, 0.12, 24), mottle("#5fa843", "#4d9238", { size: 0.25 }), [0, 0.28, 0]);
  // grass tufts
  for (let i = 0; i < 46; i++) {
    const a = r() * 6.283, d = 0.35 + Math.sqrt(r()) * 1.15;
    P(new THREE.ConeGeometry(0.035, 0.12 + r() * 0.08, 4), LEAF[i % 4], [Math.sin(a) * d, G + 0.05, Math.cos(a) * d], [
      (r() - 0.5) * 30, r() * 90, (r() - 0.5) * 30,
    ]);
  }
  // stepping stones
  [[0.45, 1.3], [0.2, 1.42], [-0.15, 1.45]].forEach(([x, z]) =>
    P(cyl(0.12, 0.13, 0.04, 7), "#9a9a94", [x, G + 0.01, z], [0, r() * 60, 0]),
  );

  // ---------- trunk ----------
  const trunkPath = catmull([[0, 0.28, 0], [0, 0.9, 0], [0.02, 1.6, 0], [0, 2.4, 0], [0, 3.3, 0]]);
  b.sweep(trunkPath, [0.52, 0.36, 0.3, 0.26, 0.2], { color: BARK, sides: 10 });
  for (let i = 0; i < 6; i++) {
    const a = (20 + i * 60) * D;
    b.capsule([Math.sin(a) * 0.3, 0.7, Math.cos(a) * 0.3], [Math.sin(a) * 0.78, G - 0.02, Math.cos(a) * 0.78], [0.12, 0.04], { color: BARK, sides: 6 });
  }
  P(new THREE.IcosahedronGeometry(0.09, 0), "#2d1c12", [0, 2.15, 0.25], [0, 0, 0], { scale: [1, 1.5, 0.4] });
  // branches into the crown
  [[0.9, 3.35, 0.25], [-0.85, 3.3, -0.3], [0.2, 3.4, -0.9], [-0.2, 3.35, 0.8]].forEach((t) =>
    b.capsule([0, 2.7, 0], t, [0.14, 0.05], { color: BARK, sides: 6 }),
  );

  // ---------- crown ----------
  const blobs: Array<{ c: THREE.Vector3; rad: number }> = [];
  blobs.push({ c: new THREE.Vector3(0, 4.1, 0), rad: 0.75 });
  for (let i = 0; i < 18; i++) {
    const a = i * 2.4, d = 0.3 + r() * 0.95;
    blobs.push({ c: new THREE.Vector3(Math.sin(a) * d, 3.55 + 0.55 * (1 - d / 1.3) + (r() - 0.5) * 0.3, Math.cos(a) * d), rad: 0.5 + r() * 0.25 });
  }
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.3;
    blobs.push({ c: new THREE.Vector3(Math.sin(a) * 1.3, 3.2 + r() * 0.2, Math.cos(a) * 1.3), rad: 0.42 + r() * 0.08 });
  }
  blobs.push({ c: new THREE.Vector3(-1.05, 2.95, 0.1), rad: 0.38 });
  blobs.forEach((bl, i) =>
    P(new THREE.IcosahedronGeometry(bl.rad, 1), LEAF[i % 4], bl.c.toArray(), [r() * 360, r() * 360, 0], { scale: [1, 0.85, 1] }),
  );
  for (let i = 0; i < 16; i++) {
    const bl = blobs[Math.floor(r() * blobs.length)];
    const dir = new THREE.Vector3(r() - 0.5, 0.2 + r() * 0.8, r() - 0.5).normalize();
    P(new THREE.IcosahedronGeometry(0.04, 0), "#f2a0b8", bl.c.clone().addScaledVector(dir, bl.rad * 0.92).toArray());
  }

  // ---------- platform ----------
  const PC = 0.4;
  P(cyl(1.0, 1.0, 0.07, 10), DECK, [0, 1.065, PC]);
  for (const a of [45, 135, 225, 315]) {
    const s = Math.sin(a * D), c = Math.cos(a * D);
    R([s * 0.28, 0.65, c * 0.28], [s * 0.8, 1.04, c * 0.8 + 0.2], 0.035, DARK);
  }
  const posts = [60, 90, 120, 150, 180, 210, 240, 270, 300];
  const pp = (a: number) => [Math.sin(a * D) * 0.93, Math.cos(a * D) * 0.93 + PC];
  posts.forEach((a, i) => {
    const [x, z] = pp(a);
    P(box(0.045, 0.3, 0.045), WOOD, [x, 1.25, z]);
    if (i > 0) {
      const [x0, z0] = pp(posts[i - 1]);
      R([x0, 1.36, z0], [x, 1.36, z], 0.015, DARK, 5);
    }
  });

  // ---------- cabin ----------
  const CZ = 0.8, FZ = 1.175;
  P(box(0.9, 0.8, 0.75), PLANKS, [0, 1.5, CZ]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(box(0.05, 0.82, 0.05), DARK, [sx * 0.45, 1.5, CZ + sz * 0.375]);
  b.extrude([[-0.45, 0], [0.45, 0], [0, 0.36]], { color: PLANKS, at: [0, 1.9, CZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.74 });
  // roof
  const ang = Math.atan2(0.4, 0.55) / D;
  P(box(0.72, 0.05, 1.04), SHINGLE, [0.275, 2.1, CZ], [0, 0, -ang]);
  P(box(0.72, 0.05, 1.04), SHINGLE, [-0.275, 2.1, CZ], [0, 0, ang]);
  R([0, 2.31, CZ - 0.53], [0, 2.31, CZ + 0.53], 0.035, "#7a2119");
  // chimney
  P(box(0.14, 0.5, 0.14), "#8a8580", [-0.3, 2.18, 0.5]);
  P(box(0.19, 0.04, 0.19), "#6e6a66", [-0.3, 2.45, 0.5]);
  // door
  P(box(0.24, 0.56, 0.04), DARK, [-0.17, 1.38, FZ + 0.005]);
  P(box(0.04, 0.56, 0.05), "#4d2f1a", [-0.17, 1.38, FZ + 0.01]);
  P(new THREE.IcosahedronGeometry(0.02, 0), "#e0b43c", [-0.09, 1.36, FZ + 0.04]);
  P(box(0.32, 0.04, 0.12), "#8a8580", [-0.17, 1.12, FZ + 0.06]);
  // round window
  P(cyl(0.115, 0.115, 0.02, 10), "#f6d78a", [0.2, 1.52, FZ], [90, 0, 0]);
  P(new THREE.TorusGeometry(0.125, 0.02, 5, 12), DARK, [0.2, 1.52, FZ + 0.01]);
  P(box(0.24, 0.015, 0.02), DARK, [0.2, 1.52, FZ + 0.015]);
  P(box(0.015, 0.24, 0.02), DARK, [0.2, 1.52, FZ + 0.015]);
  for (const x of [0.04, 0.36]) P(box(0.06, 0.28, 0.02), "#3f7f86", [x, 1.52, FZ + 0.01]);
  P(box(0.3, 0.07, 0.08), "#7a4f2a", [0.2, 1.34, FZ + 0.05]);
  ["#f0607a", "#ffd34d", "#ffffff", "#f0607a"].forEach((c, i) =>
    P(new THREE.IcosahedronGeometry(0.03, 0), c, [0.09 + i * 0.07, 1.4, FZ + 0.05]),
  );
  // lantern
  R([-0.38, 1.8, FZ], [-0.38, 1.8, FZ + 0.14], 0.012, "#2f2f2f", 5);
  R([-0.38, 1.8, FZ + 0.14], [-0.38, 1.7, FZ + 0.14], 0.007, "#2f2f2f", 4);
  P(cyl(0.05, 0.05, 0.1, 6), "#ffcf5a", [-0.38, 1.62, FZ + 0.14]);
  P(new THREE.ConeGeometry(0.065, 0.05, 6), "#2f2f2f", [-0.38, 1.7, FZ + 0.14]);
  P(cyl(0.055, 0.045, 0.025, 6), "#2f2f2f", [-0.38, 1.56, FZ + 0.14]);
  // pennant
  R([0, 2.3, CZ], [0, 2.78, CZ], 0.012, "#d8d8d0", 5);
  P(new THREE.IcosahedronGeometry(0.025, 0), "#e0b43c", [0, 2.8, CZ]);
  b.extrude([[0, 0], [0.32, -0.08], [0, -0.16]], { color: "#e8b030", at: [0, 2.76, CZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012 });

  // ---------- rope ladder ----------
  const LZ = 1.2;
  for (const x of [0.44, 0.7]) R([x, 1.08, LZ], [x, G + 0.01, LZ], 0.012, ROPE, 5);
  for (let y = G + 0.15; y < 1.05; y += 0.17) P(cyl(0.016, 0.016, 0.3, 5), WOOD, [0.57, y, LZ], [0, 0, 90]);

  // ---------- swing ----------
  b.sweep(catmull([[0, 2.2, 0], [-0.55, 2.4, 0.05], [-1.1, 2.52, 0.1]]), [0.17, 0.1, 0.05], { color: BARK, sides: 7 });
  for (const z of [-0.11, 0.27]) R([-0.85, 2.46, z], [-0.85, 0.8, z], 0.012, ROPE, 5);
  P(box(0.16, 0.035, 0.42), WOOD, [-0.85, 0.78, 0.08]);

  // ---------- mushrooms ----------
  const redCap = spots("#d9372b", "#ffffff", { size: 0.05, amount: 0.7 });
  const orgCap = spots("#e8913a", "#fff3d0", { size: 0.04, amount: 0.6 });
  const mush = (x: number, z: number, s: number, cap: any) => {
    P(cyl(0.03 * s, 0.04 * s, 0.12 * s, 6), "#f1e6cc", [x, G + 0.06 * s, z]);
    P(new THREE.SphereGeometry(0.095 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cap, [x, G + 0.115 * s, z]);
  };
  mush(-0.5, 0.75, 1.3, redCap);
  mush(-0.66, 0.9, 0.9, redCap);
  mush(-0.4, 0.98, 0.7, orgCap);
  mush(0.6, -0.55, 1.0, orgCap);
  mush(0.45, -0.7, 0.7, redCap);

  // flowers
  [[-1.1, 0.7, "#f0607a"], [-1.25, 0.2, "#ffd34d"], [1.2, 0.9, "#ffffff"], [0.9, 1.0, "#f0607a"], [-0.4, -1.0, "#ffd34d"], [0.3, -1.2, "#f0607a"], [-1.0, -0.7, "#ffffff"]].forEach(
    ([x, z, c]) => {
      R([x as number, G, z as number], [x as number, G + 0.14, z as number], 0.006, "#3f7d33", 4);
      P(new THREE.IcosahedronGeometry(0.04, 0), c as string, [x as number, G + 0.16, z as number]);
    },
  );

  // ---------- bicycle ----------
  const yaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
  const BO = new THREE.Vector3(1.05, G, -0.2);
  const W = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(yaw).add(BO);
  const BP = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rot = [0, 0, 0]) =>
    b.part(geo, color, {
      at: W(x, y, z),
      quat: yaw.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D))),
      flat: true,
    });
  const BR = (p: number[], q: number[], rad: number, color: string) =>
    R(W(p[0], p[1], p[2]), W(q[0], q[1], q[2]), rad, color, 5);
  const FRAME = "#2e9aa6";
  for (const wx of [-0.4, 0.4]) {
    BP(new THREE.TorusGeometry(0.21, 0.022, 5, 16), "#2b2b2b", wx, 0.23, 0);
    BP(cyl(0.025, 0.025, 0.06, 6), "#c0c0c0", wx, 0.23, 0, [90, 0, 0]);
    for (const a of [0, 60, 120]) BP(box(0.42, 0.006, 0.006), "#cfcfcf", wx, 0.23, 0, [0, 0, a]);
  }
  const Rr = [-0.4, 0.23, 0], BB = [-0.02, 0.13, 0], ST = [-0.14, 0.52, 0], HT = [0.3, 0.56, 0], HB = [0.33, 0.46, 0], Fr = [0.4, 0.23, 0];
  BR(Rr, BB, 0.014, FRAME);
  BR(Rr, ST, 0.014, FRAME);
  BR(BB, ST, 0.016, FRAME);
  BR(ST, HT, 0.016, FRAME);
  BR(BB, HT, 0.018, FRAME);
  BR(HT, HB, 0.02, FRAME);
  BR(HB, Fr, 0.014, "#cfcfcf");
  BR(ST, [-0.16, 0.57, 0], 0.012, "#cfcfcf");
  BP(box(0.12, 0.03, 0.07), "#3a2a20", -0.16, 0.59, 0);
  BR(HT, [0.28, 0.65, 0], 0.012, "#cfcfcf");
  BR([0.28, 0.65, -0.21], [0.28, 0.65, 0.21], 0.011, "#cfcfcf");
  for (const z of [-0.21, 0.21]) BP(cyl(0.014, 0.014, 0.05, 5), "#2b2b2b", 0.28, 0.65, z, [90, 0, 0]);
  BP(box(0.14, 0.09, 0.2), "#d9b36a", 0.36, 0.72, 0);
  BP(cyl(0.05, 0.05, 0.012, 8), "#cfcfcf", BB[0], BB[1], 0.05, [90, 0, 0]);
  BR([BB[0], BB[1], 0.07], [BB[0] + 0.08, BB[1] - 0.04, 0.07], 0.01, "#2b2b2b");
  BR([BB[0], BB[1], -0.07], [BB[0] - 0.08, BB[1] + 0.04, -0.07], 0.01, "#2b2b2b");
  BR([-0.05, 0.14, 0.02], [-0.1, 0.0, 0.14], 0.01, "#cfcfcf");

  return b.root;
}
