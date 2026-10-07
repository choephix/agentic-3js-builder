import * as THREE from "three";
import { createBuilder, mottle, paint, scales, spots } from "../../../../src/index";

export const meta = {
  name: "Baby dragon",
  description:
    "A teal baby dragon sitting proudly beside its broken speckled egg, with a buttery belly, orange back spines, amber-webbed wings, a spade-tipped tail and a wisp of smoke.",
};

const TEAL = ["#2fb8a4", "#27a392", "#3cc4ad"];
const SCALES = scales(TEAL, "#16685e", { size: 0.022, width: 0.22, seed: 3 });
const BELLY = mottle("#f8e39c", "#efc86c", { size: 0.04, seed: 5 });
const SKIN = paint((p, n) => (n.z > 0.35 && p.y < 0.17 ? BELLY : SCALES));
const SPINE = "#f28a2e";
const WING = "#e89a3e";
const HORN = "#f3e2b0";
const CLAW = "#f3e2b0";
const EYE = "#f5a623";
const PUPIL = "#140f0b";
const SPADE = "#ef7f2f";
const SMOKE = "#dfe3e8";
const SHELL = spots("#f4eedc", ["#8c6a4f", "#6e9a72"], { size: 0.02, amount: 0.45, seed: 4 });

export default function babyDragon() {
  const b = createBuilder({ name: "baby-dragon", detail: 1, paintSize: 1024 });

  // Skeleton: spine, neck, head and jaw on the midline.
  const hips = b.joint("hips", { at: [0, 0.075, -0.05], dir: [0, 1, 0.2] });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.15, 0.03], dir: [0, 1, 0.35] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.21, 0.07], dir: [0, 1, 0.7], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.25, 0.12], dir: [0, 1, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.222, 0.13], aim: [0, 0.205, 0.2], role: "jaw" });

  // Chubby body: a loft through stations, bending over hips, chest and neck.
  b.loft(
    [
      { at: [0, 0.05, -0.07], w: 0.12, h: 0.09 },
      { at: [0, 0.1, -0.02], w: 0.14, h: 0.13 },
      { at: [0, 0.15, 0.03], w: 0.13, h: 0.13 },
      { at: [0, 0.2, 0.07], w: 0.1, h: 0.1 },
    ],
    { color: SKIN, name: "body", bone: [hips, chest, neck] },
  );

  // Soft orange spines running down the back.
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const z = -0.07 + 0.14 * t;
    const yc = 0.05 + (z + 0.07) * 1.0;
    const half = 0.045 + 0.02 * Math.sin(Math.PI * t);
    b.spike([0, yc + half - 0.012, z], [0, 1, -0.2], 0.03 - 0.012 * t, 0.009 - 0.003 * t, { color: SPINE });
  }

  // Head: skull, snout, lower jaw and a toothy grin.
  b.part(new THREE.SphereGeometry(0.055, b.segments(12), b.segments(9)), SKIN, {
    bone: head,
    at: [0, 0.25, 0.12],
    scale: [1, 0.95, 1.05],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.034, b.segments(10), b.segments(8)), SKIN, {
    bone: head,
    at: [0, 0.238, 0.165],
    scale: [0.9, 0.8, 1.2],
    name: "snout",
  });
  b.capsule(jaw, [0, 0.214, 0.19], [0.014, 0.011], { color: SKIN, name: "jawLower" });
  for (const x of [-0.022, -0.011, 0, 0.011, 0.022]) {
    const z = 0.2 - 0.3 * Math.abs(x);
    b.spike([x, 0.212, z], [0, -1, 0.05], 0.013, 0.004, { color: "#fff6e0" });
  }

  // Stubby horns.
  for (const s of [1, -1]) {
    b.spike([s * 0.03, 0.292, 0.1], [s * 0.35, 1, -0.5], 0.05, 0.012, { color: HORN });
  }

  // Smoke wisp curling from the right nostril.
  b.sweep(
    catmullSmoke(),
    (t: number) => 0.004 + 0.006 * t,
    { color: SMOKE, name: "smoke" },
  );

  // Eyes: big amber globes with slit pupils.
  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.021, b.segments(10), b.segments(8)), EYE, {
      bone: head,
      at: [s * 0.034, 0.262, 0.16],
      name: `eye${S}`,
    });
    b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), PUPIL, {
      bone: head,
      at: [s * 0.04, 0.263, 0.178],
      scale: [0.5, 1.2, 0.6],
      name: `pupil${S}`,
    });
  }

  // Legs, arms, wings and claws, mirrored left and right.
  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const X = (x: number) => s * x;

    // Folded back legs, feet forward on the ground.
    const hip = b.joint(`hip${S}`, { parent: hips, at: [X(0.05), 0.07, -0.03], aim: [X(0.075), 0.03, 0.07] });
    const knee = b.joint(`knee${S}`, { parent: hip, at: [X(0.075), 0.03, 0.07], aim: [X(0.065), 0.012, 0.12] });
    const ankle = b.joint(`ankle${S}`, { parent: knee, at: [X(0.065), 0.012, 0.12], aim: [X(0.065), 0.01, 0.17] });
    b.capsule(hip, knee, [0.034, 0.026], { color: SKIN, name: `thigh${S}` });
    b.capsule(knee, ankle, 0.022, { color: SKIN, name: `shin${S}` });
    b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(7)), SKIN, {
      bone: ankle,
      at: [X(0.065), 0.018, 0.15],
      scale: [0.9, 0.6, 1.5],
      name: `foot${S}`,
    });
    for (const d of [-0.012, 0, 0.012]) {
      b.spike([X(0.065 + d), 0.02, 0.19], [0, -0.3, 1], 0.014, 0.004, { color: CLAW });
    }

    // Short front arms, paws on the ground.
    const shoulder = b.joint(`shoulder${S}`, { parent: chest, at: [X(0.06), 0.15, 0.05], aim: [X(0.075), 0.095, 0.1] });
    const elbow = b.joint(`elbow${S}`, { parent: shoulder, at: [X(0.075), 0.095, 0.1], aim: [X(0.07), 0.04, 0.13] });
    const paw = b.joint(`paw${S}`, { parent: elbow, at: [X(0.07), 0.02, 0.14], aim: [X(0.07), 0.01, 0.2] });
    b.capsule(shoulder, elbow, [0.02, 0.017], { color: SKIN, name: `upperArm${S}` });
    b.capsule(elbow, paw, 0.016, { color: SKIN, name: `forearm${S}` });
    b.part(new THREE.SphereGeometry(0.024, b.segments(10), b.segments(7)), SKIN, {
      bone: paw,
      at: [X(0.07), 0.02, 0.14],
      scale: [1.1, 0.6, 1.3],
      name: `paw${S}`,
    });

    // Oversized wing arm, wrist and four fingers.
    const wingRoot = b.joint(`wingRoot${S}`, { parent: chest, at: [X(0.07), 0.19, 0.0], aim: [X(0.17), 0.27, -0.01] });
    const wingElbow = b.joint(`wingElbow${S}`, { parent: wingRoot, at: [X(0.17), 0.27, -0.01], aim: [X(0.29), 0.24, -0.02] });
    const wingWrist = b.joint(`wingWrist${S}`, { parent: wingElbow, at: [X(0.29), 0.24, -0.02], aim: [X(0.34), 0.33, -0.05] });
    const digit1 = b.joint(`digit1${S}`, { parent: wingWrist, at: [X(0.37), 0.12, 0.01], role: "digit" });
    const digit2 = b.joint(`digit2${S}`, { parent: wingWrist, at: [X(0.4), 0.24, -0.03], role: "digit" });
    const digit3 = b.joint(`digit3${S}`, { parent: wingWrist, at: [X(0.34), 0.33, -0.05], role: "digit" });
    const digit4 = b.joint(`digit4${S}`, { parent: wingWrist, at: [X(0.19), 0.19, -0.12], role: "digit" });
    b.capsule(wingRoot, wingElbow, [0.013, 0.011], { color: SKIN, name: `wingArm${S}` });
    b.capsule(wingElbow, wingWrist, 0.01, { color: SKIN, name: `wingForearm${S}` });
    for (const [k, digit] of [digit1, digit2, digit3, digit4].entries()) {
      b.capsule(wingWrist, digit, [0.007, 0.004], { color: SKIN, name: `finger${k + 1}${S}` });
    }
    b.membrane(
      [wingRoot, wingElbow, wingWrist, digit3, digit2],
      [[X(0.09), 0.13, -0.07], digit1],
      { color: WING, thickness: 0.004, name: `wing${S}` },
    );
  }

  // Chubby tail, sweeping back along the ground and rising to a spade.
  const tail = b.chain(
    "tail",
    catmullTail(),
    { role: "tail", count: 4 },
  );
  b.sweep(tail, (t: number) => 0.03 - 0.016 * t, { color: SKIN, name: "tail" });
  b.extrude(
    [
      [0, -0.02],
      [0.03, 0],
      [0.04, 0.03],
      [0.02, 0.06],
      [0, 0.09],
      [-0.02, 0.06],
      [-0.04, 0.03],
      [-0.03, 0],
    ],
    { color: SPADE, at: [0, 0.07, -0.27], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, name: "spade" },
  );

  // The egg, broken open, with a shard on the ground.
  b.lathe(
    [
      [0, 0],
      [0.05, 0.004],
      [0.063, 0.03],
      [0.066, 0.06],
      [0.058, 0.088],
      [0.046, 0.1],
      [0.036, 0.09],
      [0.028, 0.104],
      [0.014, 0.092],
      [0, 0.1],
    ],
    { color: SHELL, at: [-0.15, 0, 0.02], axis: [0, 1, 0], segments: 14, name: "egg" },
  );
  b.extrude(
    [
      [0, 0],
      [0.03, 0.005],
      [0.02, 0.03],
    ],
    { color: SHELL, at: [-0.07, 0.004, 0.1], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.006, name: "shard" },
  );

  return b.root;
}

/** The smoke wisp: from the right nostril, up and curling. */
function catmullSmoke() {
  return catmullPath([
    [-0.012, 0.248, 0.2],
    [-0.02, 0.27, 0.21],
    [-0.005, 0.29, 0.23],
    [0.02, 0.31, 0.23],
    [0.03, 0.335, 0.21],
  ]);
}

/** The tail's centreline: from inside the rump, out and up to the spade. */
function catmullTail() {
  return catmullPath([
    [0, 0.06, -0.08],
    [0, 0.035, -0.16],
    [0, 0.03, -0.22],
    [0, 0.07, -0.27],
  ]);
}

import { catmull } from "../../../../src/index";
function catmullPath(points: number[][]) {
  return catmull(points as [number, number, number][]);
}
