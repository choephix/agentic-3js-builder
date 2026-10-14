import * as THREE from "three";
import { createBuilder, mix, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Penguin",
  description: "A chubby standing penguin: black back, white front, orange beak and webbed feet, built from simple primitives.",
};

const BLACK = "#16181d";
const WHITE = "#f4f4ee";
const ORANGE = "#f08c1e";

// Black back and sides, white front: the front-facing share of each surface decides the colour.
const coat = paint((_p, n) => mix(BLACK, WHITE, smoothstep(0.02, 0.4, n.z)));

// Egg-shaped body profile: x = radius, y = height above the floor (metres).
const BODY_PROFILE: Array<[number, number]> = [
  [0, 0.02],
  [0.1, 0.03],
  [0.16, 0.12],
  [0.18, 0.26],
  [0.17, 0.4],
  [0.14, 0.52],
  [0.1, 0.6],
  [0, 0.64],
];

// A webbed foot in the floor plane: u = across (x), v = forward (z), toes sharp.
const FOOT = [
  [-0.035, -0.03],
  [0.035, -0.03],
  [0.04, 0.02],
  [0, 0.09, "sharp"],
  [-0.04, 0.02],
] as const;

export default function penguin() {
  const b = createBuilder({ name: "penguin" });

  // Spine and head.
  b.joint("pelvis", { at: [0, 0.2, 0] });
  b.joint("chest", { parent: "pelvis", at: [0, 0.4, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 0.56, 0.01], dir: [0, 1, 0.2], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.68, 0.02], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.655, 0.07], dir: [0, 0, 1], role: "jaw" });

  // Body: a lathed egg, painted black on the back and white on the front.
  b.lathe(BODY_PROFILE, {
    name: "body",
    color: coat,
    at: [0, 0, 0],
    bone: "chest",
    smoothing: 1,
    segments: 14,
  });

  // Head: a black ball with white eyes, pupils and a two-part beak on the jaw.
  b.part(new THREE.SphereGeometry(0.1, b.segments(14), b.segments(10)), BLACK, { bone: "head", name: "head" });
  b.spike([0, 0.685, 0.085], [0, -0.08, 1], 0.09, 0.022, { color: ORANGE, bone: "head", name: "beakUpper" });
  b.spike([0, 0.655, 0.07], [0, -0.03, 1], 0.075, 0.018, { color: ORANGE, bone: "jaw", name: "beakLower" });

  // Short tail nub at the back.
  b.spike([0, 0.22, -0.14], [0, -0.3, -1], 0.07, 0.035, { color: BLACK, bone: "pelvis", name: "tail" });

  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Eyes: white with a black pupil set just in front of them.
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), WHITE, {
      at: [0.05 * s, 0.71, 0.08],
      bone: "head",
      name: `eye${S}`,
    });
    b.part(new THREE.SphereGeometry(0.011, b.segments(6), b.segments(5)), "#0b0b0d", {
      at: [0.058 * s, 0.715, 0.093],
      bone: "head",
      name: `pupil${S}`,
    });

    // Flippers: a rigid upper blade on the shoulder joint, a lower blade on the wrist joint.
    b.joint(`wing${S}`, { parent: "chest", at: [0.1 * s, 0.5, 0], dir: [0.2 * s, -1, 0], role: "wing" });
    b.joint(`wrist${S}`, { parent: `wing${S}`, at: [0.15 * s, 0.31, 0], dir: [0, -1, 0] });
    b.slab(
      [
        [0.1 * s, 0.53, -0.035],
        [0.1 * s, 0.52, 0.035],
        [0.15 * s, 0.33, 0.03],
        [0.15 * s, 0.31, -0.02],
      ],
      { color: BLACK, thickness: 0.02, bone: `wing${S}`, name: `flipperUpper${S}` },
    );
    b.slab(
      [
        [0.15 * s, 0.33, 0.03],
        [0.155 * s, 0.3, 0.03],
        [0.16 * s, 0.16, 0.015],
        [0.17 * s, 0.14, 0],
        [0.16 * s, 0.16, -0.02],
        [0.15 * s, 0.32, -0.02],
      ],
      { color: BLACK, thickness: 0.018, bone: `wrist${S}`, name: `flipperLower${S}` },
    );

    // Legs: a short orange leg from the hip to the ankle, and a flat webbed foot on the ankle.
    b.joint(`hip${S}`, { parent: "pelvis", at: [0.07 * s, 0.2, 0], dir: [0, -1, 0], role: "leg" });
    b.joint(`ankle${S}`, { parent: `hip${S}`, at: [0.07 * s, 0.03, 0], dir: [0, -1, 0] });
    b.capsule([0.07 * s, 0.2, 0], [0.07 * s, 0.03, 0], 0.018, {
      color: ORANGE,
      bone: `hip${S}`,
      name: `leg${S}`,
    });
    b.extrude(FOOT, {
      color: ORANGE,
      at: [0.07 * s, 0.006, -0.02],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.004,
      bone: `ankle${S}`,
      name: `foot${S}`,
    });
  }

  return b.root;
}
