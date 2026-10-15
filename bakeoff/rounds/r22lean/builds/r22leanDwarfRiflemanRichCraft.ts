import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, mottle, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, heroic dwarf marksman with a braided copper beard, horned steel helm, gold-trimmed pauldrons and a flared brass-banded blunderbuss held at port arms.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// Palette (cel-shaded, hand-painted look)
const SKIN = cel(mottle("#e2a173", "#d68c60", { size: 0.05, contrast: 0.5, seed: 3 }));
const NOSE = cel("#d9795a");
const CHEEK = cel("#e48b6c");
const BEARD = cel(grain("#d2631f", "#a8420f", { size: 0.012, axis: "y", seed: 5 }), "#7c2c10");
const BEARD2 = cel("#e07a2c", "#8e3412");
const TUNIC = cel(mottle("#2f66b4", "#2a58a0", { size: 0.05, contrast: 0.6, seed: 8 }), "#1c2f78");
const TUNIC_STRIPE = cel(stripes("#2f66b4", "#e8c25a", { size: 0.05, axis: "y", width: 0.12, wobble: 0.1, seed: 2 }), "#1c2f78");
const LEATHER = cel(mottle("#8a5428", "#6e401c", { size: 0.04, contrast: 0.7, seed: 11 }), "#4a2412");
const LEATHER2 = cel("#5a361a", "#2e1a14");
const PANTS = cel(mottle("#6b4a3a", "#5a3d30", { size: 0.04, contrast: 0.5, seed: 4 }), "#3a2230");
const STEEL = cel(mottle("#9fb2c4", "#7f93a8", { size: 0.06, contrast: 0.6, seed: 6 }), "#4a5a88");
const DARKSTEEL = cel("#4c5566", "#262a40");
const GOLD = cel("#f0bf2e", "#b0661a");
const WOOD = cel(grain("#9a6034", "#744119", { size: 0.012, axis: "z", seed: 9 }), "#4a2a1a");
const BONE = cel("#f1e6c4", "#b9a483");
const FUR = cel("#e6dfcc", "#a9a0a8");
const RED = cel("#b8322a", "#6a1a30");
const WHITE = "#f7f3e6";
const PUPIL = INK;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarfRifleman" });

  const part = (g: THREE.BufferGeometry, c: Parameters<typeof b.part>[1], at: number[], o: PartOptions = {}) =>
    b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: Parameters<typeof b.part>[1], at: number[], o?: PartOptions) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);
  const ball = (r: number, c: Parameters<typeof b.part>[1], at: number[], scale?: number[], o?: PartOptions) =>
    part(new THREE.SphereGeometry(r, 10, 7), c, at, { ...o, scale: scale ?? 1 });
  const cyl = (rt: number, rb: number, h: number, c: Parameters<typeof b.part>[1], at: number[], o?: PartOptions, seg = 10) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const torus = (r: number, t: number, c: Parameters<typeof b.part>[1], at: number[], o?: PartOptions) =>
    part(new THREE.TorusGeometry(r, t, 6, 14), c, at, o);

  // ---------------- legs & boots ----------------
  ball(0.2, PANTS, [0, 0.52, 0], [1, 0.7, 0.8]);
  for (const s of [1, -1]) {
    const x = s * 0.125;
    b.rod([x, 0.52, 0], [x, 0.24, 0.01], 0.088, PANTS, { sides: 8 });
    box(0.23, 0.035, 0.36, DARKSTEEL, [x, 0.0175, 0.04]); // sole
    box(0.2, 0.2, 0.28, LEATHER, [x, 0.135, 0.02]); // boot upper
    ball(0.1, LEATHER, [x, 0.1, 0.16], [1, 0.75, 1]); // toe cap
    box(0.1, 0.05, 0.1, DARKSTEEL, [x, 0.065, 0.2]); // toe plate
    box(0.21, 0.06, 0.07, LEATHER2, [x, 0.065, -0.1]); // heel
    cyl(0.118, 0.118, 0.06, LEATHER2, [x, 0.25, 0.01], undefined, 10);
    box(0.1, 0.04, 0.012, GOLD, [x, 0.25, 0.128]); // boot buckle
    for (const dz of [0.0, 0.07]) ball(0.011, GOLD, [x + s * 0.0, 0.17 + dz * 0.2, 0.158 + dz * 0.15]);
    ball(0.062, STEEL, [x, 0.37, 0.085], [1, 1, 0.6]); // knee pad
    torus(0.05, 0.008, GOLD, [x, 0.37, 0.115], { scale: [1, 1, 0.5] });
  }

  // ---------------- torso ----------------
  cyl(0.27, 0.25, 0.5, TUNIC, [0, 0.75, 0], { scale: [1, 1, 0.82] }, 14);
  // leather vest on front half
  part(new THREE.CylinderGeometry(0.278, 0.258, 0.46, 14, 1, true, -1.25, 2.5), LEATHER, [0, 0.76, 0], {
    scale: [1, 1, 0.82],
  });
  // vest lacing
  for (let i = 0; i < 6; i++) {
    const y = 0.93 - i * 0.06;
    box(0.045, 0.008, 0.01, GOLD, [0, y, 0.2275]);
  }
  box(0.01, 0.34, 0.01, LEATHER2, [0, 0.78, 0.226]);
  // tunic hem stripe
  cyl(0.255, 0.255, 0.05, TUNIC_STRIPE, [0, 0.505, 0], { scale: [1, 1, 0.82] }, 14);
  // belt
  cyl(0.262, 0.262, 0.08, LEATHER2, [0, 0.56, 0], { scale: [1, 1, 0.82] }, 14);
  box(0.095, 0.075, 0.022, GOLD, [0, 0.56, 0.226]);
  box(0.05, 0.04, 0.01, DARKSTEEL, [0, 0.56, 0.239]);
  for (let i = -5; i <= 5; i++) {
    if (Math.abs(i) < 2) continue;
    const a = i * 0.2;
    ball(0.011, GOLD, [0.266 * Math.sin(a), 0.56, 0.266 * 0.82 * Math.cos(a)]);
  }
  // pouches
  for (const s of [1, -1]) {
    const px = s * 0.19;
    box(0.09, 0.085, 0.05, LEATHER, [px, 0.5, 0.165], { rotation: [0, s * 22, 0] });
    box(0.095, 0.035, 0.055, LEATHER2, [px, 0.535, 0.167], { rotation: [0, s * 22, 0] });
    ball(0.01, GOLD, [px + s * 0.01, 0.52, 0.195]);
  }
  // tankard on back-left hip
  cyl(0.04, 0.036, 0.09, WOOD, [0.2, 0.45, -0.14], { rotation: [0, 0, 8] });
  cyl(0.042, 0.042, 0.012, GOLD, [0.2, 0.47, -0.14], { rotation: [0, 0, 8] });
  torus(0.025, 0.007, GOLD, [0.245, 0.45, -0.14], { rotation: [0, 90, 0] });

  // gorget & fur mantle
  torus(0.16, 0.03, STEEL, [0, 1.0, 0.0], { rotation: [90, 0, 0], scale: [1, 1, 0.9] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ball(0.055, FUR, [0.215 * Math.sin(a), 1.005, 0.17 * Math.cos(a)], [1, 0.8, 1]);
  }

  // ---------------- bandolier ----------------
  const strapPath = catmull([
    [-0.2, 1.0, 0.15],
    [-0.1, 0.9, 0.225],
    [0.05, 0.78, 0.238],
    [0.18, 0.66, 0.19],
    [0.246, 0.6, 0.05],
  ]);
  b.sweep(strapPath, 0.022, LEATHER2, { section: "box", sides: 4 });
  for (let i = 0; i < 6; i++) {
    const p = strapPath.at(0.12 + i * 0.12);
    cyl(0.014, 0.014, 0.06, BONE, [p.x, p.y, p.z + 0.012], { rotation: [0, 0, 28] }, 6);
    cyl(0.015, 0.015, 0.012, GOLD, [p.x, p.y, p.z + 0.012], { rotation: [0, 0, 28] }, 6);
  }
  // powder horn on left hip
  const horn = catmull([
    [0.25, 0.64, 0.06],
    [0.31, 0.56, 0.1],
    [0.325, 0.46, 0.1],
    [0.29, 0.37, 0.06],
  ]);
  b.sweep(horn, [0.036, 0.008], BONE, { sides: 7 });
  ball(0.03, GOLD, [0.25, 0.65, 0.06]);

  // ---------------- backpack ----------------
  box(0.34, 0.4, 0.18, LEATHER, [0, 0.8, -0.27]);
  box(0.355, 0.1, 0.2, LEATHER2, [0, 0.95, -0.27]);
  box(0.06, 0.08, 0.012, GOLD, [0, 0.9, -0.372]);
  cyl(0.08, 0.08, 0.44, RED, [0, 1.06, -0.3], { rotation: [0, 0, 90] });
  for (const x of [-0.13, 0.13]) torus(0.085, 0.009, LEATHER2, [x, 1.06, -0.3], { rotation: [0, 90, 0] });
  cyl(0.085, 0.085, 0.06, STEEL, [-0.1, 0.7, -0.375], { rotation: [90, 0, 0] }, 12); // canteen
  cyl(0.06, 0.06, 0.02, GOLD, [-0.1, 0.7, -0.41], { rotation: [90, 0, 0] }, 8);
  cyl(0.065, 0.075, 0.09, DARKSTEEL, [0.1, 0.62, -0.37]); // cook pot
  torus(0.07, 0.006, DARKSTEEL, [0.1, 0.67, -0.37], { rotation: [0, 90, 0] });
  for (const s of [1, -1]) b.rod([s * 0.2, 0.98, -0.02], [s * 0.15, 0.7, -0.19], 0.016, LEATHER2, { sides: 4 });

  // ---------------- head ----------------
  ball(0.15, SKIN, [0, 1.12, 0.02], [1, 0.95, 0.95]);
  for (const s of [1, -1]) {
    ball(0.032, SKIN, [s * 0.15, 1.1, 0.0], [0.7, 1.1, 1]); // ears
    ball(0.034, CHEEK, [s * 0.085, 1.125, 0.13], [1, 1, 0.8]);
    ball(0.023, WHITE, [s * 0.058, 1.14, 0.14], [1, 1, 0.8]); // eye
    ball(0.013, PUPIL, [s * 0.058, 1.14, 0.155], [1, 1, 0.8]);
    ball(0.005, WHITE, [s * 0.052, 1.148, 0.165]);
    // bushy brows
    box(0.075, 0.026, 0.035, BEARD2, [s * 0.06, 1.183, 0.145], { rotation: [0, 0, -s * 22] });
    box(0.04, 0.02, 0.03, BEARD, [s * 0.1, 1.17, 0.12], { rotation: [0, 0, -s * 35] });
    // sideburns / hair under helm
    ball(0.05, BEARD, [s * 0.145, 1.15, -0.03], [0.8, 1.2, 1]);
    // mustache curls
    const stache = catmull([
      [0, 1.068, 0.2],
      [s * 0.07, 1.04, 0.205],
      [s * 0.14, 1.05, 0.17],
      [s * 0.17, 1.095, 0.14],
    ]);
    b.sweep(stache, [0.034, 0.012], BEARD2, { sides: 7 });
  }
  ball(0.046, NOSE, [0, 1.09, 0.16], [1, 0.95, 1]);
  ball(0.012, "#b85a44", [0, 1.062, 0.2]);

  // ---------------- beard ----------------
  ball(0.15, BEARD, [0, 1.0, 0.09], [1, 1, 0.75]);
  b.spike([0, 1.0, 0.13], [0, 0.76, 0.2], null, 0.12, BEARD, { sides: 8 });
  for (let i = 0; i < 5; i++) {
    // fur-like strand tufts on beard front
    const a = (i - 2) * 0.55;
    b.spike([0.1 * Math.sin(a) * 0.9, 1.02, 0.17 * Math.cos(a) * 0.9 + 0.03], [0.12 * Math.sin(a), 0.82 - Math.abs(i - 2) * 0.03, 0.2], null, 0.03, BEARD2, { sides: 5 });
  }
  for (const s of [1, -1]) {
    const braid = catmull([
      [s * 0.08, 0.96, 0.2],
      [s * 0.085, 0.88, 0.245],
      [s * 0.075, 0.8, 0.255],
      [s * 0.09, 0.72, 0.255],
      [s * 0.08, 0.64, 0.255],
    ]);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const p = braid.at(t);
      const odd = i % 2 === 1;
      ball(0.036 - 0.012 * t, odd ? BEARD : BEARD2, [p.x + (odd ? 0.01 : -0.01), p.y, p.z], [1, 1.3, 1], {
        rotation: [0, 0, (odd ? 1 : -1) * 28],
      });
    }
    const end = braid.at(1);
    cyl(0.026, 0.026, 0.025, GOLD, [end.x, end.y - 0.02, end.z], undefined, 8);
    b.spike([end.x, end.y - 0.03, end.z], [end.x, end.y - 0.1, end.z], null, 0.022, BEARD2, { sides: 6 });
    ball(0.022, RED, [end.x, end.y - 0.005, end.z + 0.02]);
    // gold ring higher up
    const r = braid.at(0.35);
    torus(0.03, 0.007, GOLD, [r.x, r.y, r.z], { rotation: [90, 0, 0] });
  }

  // ---------------- helmet ----------------
  b.lathe(
    [
      [0, 0],
      [0.168, 0],
      [0.172, 0.025],
      [0.155, 0.1],
      [0.09, 0.165],
      [0, 0.19],
    ],
    { at: [0, 1.185, 0.01], smoothing: 1, segments: 14, color: STEEL },
  );
  torus(0.172, 0.014, GOLD, [0, 1.2, 0.01], { rotation: [90, 0, 0] });
  torus(0.162, 0.01, GOLD, [0, 1.29, 0.01], { rotation: [90, 0, 0], scale: [1, 1, 1] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ball(0.011, GOLD, [0.172 * Math.sin(a), 1.2, 0.01 + 0.172 * Math.cos(a)]);
  }
  box(0.04, 0.1, 0.014, STEEL, [0, 1.165, 0.172]); // nasal guard
  b.spike([0, 1.36, 0.01], [0, 1.47, 0.01], null, 0.025, GOLD, { sides: 6 });
  box(0.025, 0.13, 0.15, GOLD, [0, 1.39, 0.01]); // crest
  for (const s of [1, -1]) {
    const hornPath = catmull([
      [s * 0.15, 1.27, 0.01],
      [s * 0.235, 1.28, 0.01],
      [s * 0.3, 1.36, 0.02],
      [s * 0.29, 1.46, 0.04],
    ]);
    b.sweep(hornPath, [0.036, 0.008], BONE, { sides: 7 });
    torus(0.035, 0.009, GOLD, [s * 0.165, 1.272, 0.01], { rotation: [0, 90, 0] });
    box(0.04, 0.09, 0.07, STEEL, [s * 0.162, 1.13, 0.0], { rotation: [0, 0, s * 8] }); // cheek guard
  }

  // ---------------- blunderbuss ----------------
  const bx0 = -0.14;
  const by0 = 0.92;
  const bz0 = 0.0;
  const d = new THREE.Vector3(0.2, 0.18, 0.8).normalize();
  const P = (s: number, dx = 0, dy = 0, dz = 0): number[] => [bx0 + d.x * s + dx, by0 + d.y * s + dy, bz0 + d.z * s + dz];
  b.frustumBox(P(-0.22), P(0.2), [0.07, 0.13], [0.05, 0.075], { color: WOOD });
  box(0.078, 0.135, 0.016, GOLD, P(-0.225), { dir: d, axis: "z" }); // butt plate
  box(0.05, 0.075, 0.2, DARKSTEEL, P(0.12, 0, 0.0), { dir: d, axis: "z" }); // lock plate
  box(0.012, 0.075, 0.016, GOLD, P(0.1, 0, 0.055), { dir: d, axis: "z", rotation: [0, 0, 0] }); // hammer
  ball(0.016, GOLD, P(0.14, 0, 0.03));
  torus(0.032, 0.006, GOLD, P(0.1, 0, -0.045), { rotation: [0, 90, 0] }); // trigger guard
  b.rod(P(0.18), P(0.64), 0.034, DARKSTEEL, { sides: 8 });
  b.rod(P(0.64), P(0.8), [0.034, 0.088], STEEL, { sides: 10 });
  b.rod(P(0.78), P(0.805), 0.092, GOLD, { sides: 10 });
  part(new THREE.CircleGeometry(0.075, 10), "#15151c", P(0.8061), { dir: d, axis: "z" });
  for (const s of [0.24, 0.36, 0.5, 0.62]) b.rod(P(s - 0.012), P(s + 0.012), 0.04, GOLD, { sides: 8 });
  b.rod(P(0.2, 0, 0.036), P(0.62, 0, 0.036), 0.006, GOLD, { sides: 4 }); // engraved line
  b.rod(P(0.22, 0, -0.045), P(0.7, 0, -0.045), 0.008, WOOD, { sides: 5 }); // ramrod
  ball(0.012, GOLD, P(0.7, 0, -0.045));
  box(0.04, 0.03, 0.04, GOLD, P(0.17, 0, 0.04), { dir: d, axis: "z" }); // pan/breech trim
  // sling
  b.sweep(
    catmull([P(-0.1, 0, -0.07), [-0.22, 0.82, -0.15], [-0.27, 1.0, -0.06], P(0.5, 0, -0.06)]),
    0.012,
    LEATHER2,
    { section: "box", sides: 4 },
  );

  // ---------------- arms ----------------
  const arm = (s: number, shoulder: number[], elbow: number[], hand: number[]) => {
    ball(0.135, STEEL, [s * 0.325, 0.985, 0.0], [1, 0.75, 1.05]);
    torus(0.125, 0.013, GOLD, [s * 0.325, 0.935, 0.0], { rotation: [90, 0, 0] });
    for (let i = 0; i < 5; i++) {
      const a = i * 0.7 - 1.4;
      ball(0.011, GOLD, [s * 0.325 + 0.125 * Math.sin(a), 0.935, 0.125 * Math.cos(a)]);
    }
    b.rod(shoulder, elbow, 0.075, TUNIC, { sides: 8 });
    ball(0.078, TUNIC, elbow);
    b.rod(elbow, hand, [0.07, 0.062], TUNIC, { sides: 8 });
    const lp = (t: number) => [
      elbow[0] + (hand[0] - elbow[0]) * t,
      elbow[1] + (hand[1] - elbow[1]) * t,
      elbow[2] + (hand[2] - elbow[2]) * t,
    ];
    b.rod(lp(0.35), lp(0.92), [0.083, 0.07], STEEL, { sides: 8 }); // vambrace
    b.rod(lp(0.33), lp(0.37), 0.088, GOLD, { sides: 8 });
    b.rod(lp(0.88), lp(0.92), 0.075, GOLD, { sides: 8 });
    ball(0.058, SKIN, hand);
  };
  arm(-1, [-0.31, 0.96, 0.02], [-0.34, 0.76, 0.16], [-0.116, 0.89, 0.095]);
  arm(1, [0.31, 0.96, 0.02], [0.26, 0.8, 0.24], [-0.045, 0.945, 0.332]);
  // fingers over the barrel / grip
  for (let i = 0; i < 3; i++) {
    ball(0.016, SKIN, [-0.115 + i * 0.0, 0.925, 0.07 + i * 0.03], [1, 1, 1]);
    ball(0.016, SKIN, [-0.02 - 0.005 * i, 0.985, 0.31 + i * 0.03]);
  }

  return b.root;
}
