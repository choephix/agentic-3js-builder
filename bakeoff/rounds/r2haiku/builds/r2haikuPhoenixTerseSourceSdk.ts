import * as THREE from "three";
import { countershade, createBuilder, gradient, rng } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description: "A stylised phoenix at rest: flame-coloured body, long tail plumes, fanned wings and a flared crest.",
};

// Flame and plumage paints. Body: red-orange back, gold belly. Flight feathers: pale gold at the root, deep ember at
// the tip. Legs and beak are solid.
const body = countershade("#d9441a", "#ffc93c", { level: -0.1, soft: 0.45 });
const flame = gradient("#ffe27a", "#e0401a", [0, 0.5, 0], [0, 1.15, -0.2]);
const gold = "#f2a30f";
const beak = "#ffb020";
const eyeRing = "#ffd23a";
const random = rng(7);

const b = createBuilder({ name: "phoenix", detail: 1, paintSize: 1024 });

// A feather outline, root at the origin, pointed tip at `len`, in the outline's own x (width) and y (length).
function plume(len: number, width: number): Array<[number, number]> {
  return [
    [0, 0],
    [width * 0.5, len * 0.2],
    [width * 0.6, len * 0.6],
    [width * 0.2, len * 0.92],
    [0, len],
    [-width * 0.2, len * 0.92],
    [-width * 0.6, len * 0.6],
    [-width * 0.5, len * 0.2],
  ];
}

// Skeleton: pelvis root, spine up to the chest, neck to the head.
b.joint("pelvis", { at: [0, 0.44, -0.02], dir: [0, 1, 0.1] });

const spine = b.chain(
  "spine",
  [
    [0, 0.5, 0],
    [0, 0.6, 0.03],
    [0, 0.7, 0.09],
    [0, 0.78, 0.13],
  ],
  { parent: "pelvis", names: ["waist", "back", "chest"], role: "spine" },
);
b.sweep(spine, (t: number) => 0.09 + 0.07 * Math.sin(Math.PI * Math.min(1, t * 1.1)), { color: body, name: "torso" });

const neck = b.chain(
  "neck",
  [
    [0, 0.7, 0.09],
    [0, 0.84, 0.18],
    [0, 0.97, 0.26],
  ],
  { parent: "chest", names: ["neck1", "neck2", "neckTip"], role: "neck" },
);
b.sweep(neck, 0.042, { color: body, name: "neck" });

b.joint("head", { parent: "neckTip", at: [0, 0.99, 0.27], dir: [0, 1, 0.2], role: "head" });
b.joint("jaw", { parent: "head", at: [0, 0.95, 0.32], dir: [0, 0, 1], role: "jaw" });

// Head: a rounded skull, gold-ringed eyes, a flared crest of three flame spikes.
b.part(new THREE.SphereGeometry(0.1, b.segments(14), b.segments(10)), body, {
  bone: "head",
  at: [0, 0.99, 0.27],
  name: "skull",
});
for (const s of [1, -1] as const) {
  b.part(new THREE.SphereGeometry(0.028, b.segments(8), b.segments(6)), eyeRing, {
    bone: "head",
    at: [s * 0.072, 1.0, 0.34],
    name: "eyeRing",
  });
  b.part(new THREE.SphereGeometry(0.016, b.segments(6), b.segments(5)), "#120806", {
    bone: "head",
    at: [s * 0.075, 1.0, 0.35],
    name: "eye",
  });
}
for (const x of [0, 0.055, -0.055]) {
  const tipLean = x === 0 ? 0 : x * 2.5;
  b.spike([x, 1.05, 0.22], [tipLean, 1, -0.5], x === 0 ? 0.3 : 0.24, 0.022, {
    color: flame,
    bone: "head",
    name: "crest",
  });
}

// Beak: upper on the head, lower on the hinged jaw.
b.spike([0, 0.995, 0.31], [0, 0.975, 0.5], null, 0.04, { color: beak, bone: "head", name: "beakUpper" });
b.spike([0, 0.95, 0.32], [0, 0.935, 0.46], null, 0.028, { color: beak, bone: "jaw", name: "beakLower" });

// Wings: each a three-joint arm reaching out and up, with long primaries hanging from its trailing edge.
for (const s of [1, -1] as const) {
  const L = s > 0 ? "L" : "R";
  const wing = b.chain(
    `wing${L}`,
    [
      [0.08 * s, 0.76, 0.05],
      [0.3 * s, 0.9, 0.02],
      [0.54 * s, 0.94, -0.04],
      [0.74 * s, 0.84, -0.12],
    ],
    {
      parent: "chest",
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `finger${L}`],
      role: "wing",
    },
  );
  b.sweep(wing, (t: number) => 0.03 - 0.018 * t, { color: flame, name: `wingBone${L}` });

  for (const t of [0.12, 0.28, 0.44, 0.6, 0.76, 0.9]) {
    b.extrude(plume(0.22 + 0.2 * t, 0.07), {
      color: flame,
      at: wing.at(t),
      x: [0, 0, 1],
      y: [0, -0.85, -0.5],
      thickness: 0.008,
      bevel: 0.003,
      name: `primary${L}`,
    });
  }
}

// Tail: a jointed sweep, with a fan of long plumes that spread a little vertically.
const tail = b.chain(
  "tail",
  [
    [0, 0.5, -0.04],
    [0, 0.45, -0.25],
    [0, 0.38, -0.5],
    [0, 0.34, -0.72],
  ],
  { parent: "pelvis", names: ["tailA", "tailB", "tailC", "tailEnd"], role: "tail" },
);
b.sweep(tail, (t: number) => 0.04 - 0.02 * t, { color: body, name: "tailBone" });
for (let i = 0; i < 5; i++) {
  const t = 0.25 + i * 0.15;
  const phi = (i - 2) * 0.2;
  const len = 0.4 + 0.12 * random() + 0.08 * (1 - Math.abs(i - 2) / 2);
  b.extrude(plume(len, 0.1), {
    color: flame,
    at: tail.at(t),
    x: [1, 0, 0],
    y: [0, Math.sin(phi) - 0.3, -1],
    thickness: 0.01,
    bevel: 0.003,
    name: `plume${i}`,
  });
}

// Legs: digitigrade, the knee bending back, each ending in three toes on the floor.
for (const s of [1, -1] as const) {
  const L = s > 0 ? "L" : "R";
  const leg = b.chain(
    `leg${L}`,
    [
      [0.08 * s, 0.46, 0],
      [0.1 * s, 0.28, -0.07],
      [0.08 * s, 0.1, 0],
      [0.09 * s, 0, 0.1],
    ],
    { parent: "pelvis", names: [`hip${L}`, `knee${L}`, `ankle${L}`, `toe${L}`], role: "leg" },
  );
  b.sweep(leg, (t: number) => 0.024 - 0.01 * t, { color: gold, name: `leg${L}` });
  for (const d of [-0.035, 0, 0.035]) {
    b.rod([0.09 * s, 0.012, 0.1], [0.09 * s + d * 1.6, 0.008, 0.19], 0.011, {
      color: gold,
      bone: `toe${L}`,
      name: `toe${L}`,
    });
  }
}

// Embers: a scatter of small glowing sparks about the tail and wings.
for (let i = 0; i < 8; i++) {
  b.part(new THREE.IcosahedronGeometry(0.018, 0), "#ffd23a", {
    bone: "pelvis",
    at: [(random() - 0.5) * 0.9, 0.5 + random() * 0.7, -0.2 - random() * 0.6],
    name: "ember",
  });
}

export default function phoenix() {
  return b.root;
}
