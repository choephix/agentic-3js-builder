import * as THREE from "three";
import { catmull, createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Toucan",
  description: "A keel-billed toucan in rest pose: black body, cream bib, blue eye patch, large orange beak with a black tip.",
};

const BLACK = "#151515";
const CREAM = "#f2ecdc";
const RED = "#d9452b";
const BLUE = "#2f80d8";
const LEG = "#2e2e2e";
const BEAK = paint((p) => (p.z > 0.335 ? "#1b1b1b" : "#f4a51c"));

// Cream bib on the front of the chest, red under-tail, black everywhere else.
const PLUMAGE = paint((p, n) => {
  if (p.z > 0.04 && n.z > 0.3 && p.y < 0.24) return CREAM;
  if (p.z < -0.12 && p.y < 0.2) return RED;
  return BLACK;
});

export default function toucan(): THREE.Object3D {
  const b = createBuilder({ name: "toucan", detail: 1 });

  // Skeleton: hips at the root, a curved spine up to the neck, a tail back, two legs, two wings, a head and a jaw.
  b.joint("hips", { at: [0, 0.2, -0.04] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.04],
      [0, 0.225, 0.05],
      [0, 0.26, 0.16],
    ]),
    { names: ["torso", "chest", "neck"], parent: "hips", role: "spine" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.04],
      [0, 0.185, -0.13],
      [0, 0.165, -0.25],
    ]),
    { names: ["tail1", "tail2", "tailTip"], parent: "hips", role: "tail" },
  );

  const head = b.joint("head", { parent: "neck", at: [0, 0.29, 0.2], dir: [0, 1, 0.3] });
  b.joint("jaw", { parent: "head", at: [0, 0.262, 0.22], role: "jaw" });

  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    b.chain(
      `leg${S}`,
      catmull([
        [s * 0.045, 0.17, 0.0],
        [s * 0.052, 0.095, -0.02],
        [s * 0.05, 0.03, 0.02],
      ]),
      { names: [`hip${S}`, `knee${S}`, `ankle${S}`], parent: "hips", role: "leg" },
    );
    b.joint(`wing${S}`, { parent: "torso", at: [s * 0.05, 0.22, 0.06], role: "wing" });
  }

  // Body: one smooth tube along the spine, tapering toward the neck.
  b.sweep(spine, (t) => [0.068 - 0.026 * t, 0.058 - 0.014 * t], {
    color: PLUMAGE,
    name: "body",
  });

  // Tail: a flat, slightly tapering tube going back.
  b.sweep(tail, (t) => [0.03 - 0.004 * t, 0.012], { color: BLACK, name: "tail" });

  // Head: a round black ball, with blue bare skin and a dark eye on each side.
  b.part(new THREE.SphereGeometry(0.05, b.segments(14), b.segments(10)), BLACK, {
    at: [0, 0.29, 0.2],
    bone: "head",
    name: "head",
  });

  // Beak: the upper mandible rides the head, the lower one rides the jaw so the mouth opens.
  b.extrude(
    [
      [-0.03, -0.012],
      [-0.03, 0.034],
      [0.0, 0.05],
      [0.06, 0.05],
      [0.11, 0.036],
      [0.148, 0.012, "sharp"],
      [0.14, -0.004],
      [0.1, -0.01],
      [0.04, -0.012],
    ],
    {
      color: BEAK,
      at: [0, 0.28, 0.22],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.006,
      bone: "head",
      name: "beakUpper",
    },
  );
  b.extrude(
    [
      [-0.03, 0.01],
      [0.02, -0.012],
      [0.08, -0.028],
      [0.12, -0.04],
      [0.142, -0.036, "sharp"],
      [0.11, -0.02],
      [0.04, -0.004],
      [-0.03, 0.0],
    ],
    {
      color: BEAK,
      at: [0, 0.262, 0.22],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.02,
      bone: "jaw",
      name: "beakLower",
    },
  );

  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Blue bare skin around the eye, then the eye itself.
    b.part(new THREE.SphereGeometry(0.018, b.segments(8), b.segments(6)), BLUE, {
      at: [s * 0.044, 0.292, 0.196],
      scale: [0.5, 1, 1],
      bone: "head",
      name: `eyePatch${S}`,
    });
    b.part(new THREE.SphereGeometry(0.008, b.segments(6), b.segments(5)), "#0a0a0a", {
      at: [s * 0.046, 0.296, 0.2],
      bone: "head",
      name: `eye${S}`,
    });

    // Folded wing lying along the flank.
    b.part(new THREE.SphereGeometry(1, b.segments(10), b.segments(6)), BLACK, {
      at: [s * 0.06, 0.2, 0.0],
      scale: [0.018, 0.05, 0.12],
      bone: `wing${S}`,
      name: `wing${S}`,
    });

    // Legs: a dark sweep along the chain, and three toes on the ground at the ankle.
    b.sweep(
      b.chain
        ? (undefined as never)
        : (undefined as never),
      0,
      {},
    );
  }

  return b.root;
}
