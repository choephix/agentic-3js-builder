import * as THREE from "three";
import { countershade, createBuilder, spots } from "../../../../src/index";

export const meta = {
  name: "Baby dragon",
  description:
    "A stubby green baby dragon with a cream belly, orange spines and horns, pink wing membranes and a spade-tipped tail, standing on four legs.",
};

const GREEN = "#4f9a5b";
const DARK = "#2c5f3e";
const CREAM = "#f3e6b5";
const ORANGE = "#e8793a";
const HORN = "#f4ead0";
const WING = "#e47f97";
const EYE = "#ffc83d";
const INK = "#1d1d22";

// One paint for the whole body: dark green back with darker spots, cream belly.
const SCALES = countershade(spots(GREEN, DARK, { size: 0.07, amount: 0.3, seed: 3 }), CREAM, {
  level: 0.1,
  soft: 0.5,
});

/** Body thickness along the spine: slim at the hips and chest, full in the middle. */
const bulge = (t: number) => 0.55 + 0.45 * Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));

/** A point on the left side (s = 1) or mirrored to the right (s = -1). +X is the creature's left. */
const at = (s: number, x: number, y: number, z: number): [number, number, number] => [s * x, y, z];

export default function babyDragon() {
  const b = createBuilder({ name: "baby-dragon", paintSize: 2048 });

  // Spine: a root at the hips, three joints along the body, and a neck that ends in the head.
  b.joint("pelvis", { at: [0, 0.42, -0.22] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.42, -0.22],
      [0, 0.45, -0.07],
      [0, 0.49, 0.08],
      [0, 0.53, 0.2],
    ],
    { parent: "pelvis", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  b.sweep(spine, (t): [number, number] => [0.105 * bulge(t), 0.11 * bulge(t)], {
    name: "torso",
    color: SCALES,
    sides: 10,
  });

  const neck = b.chain(
    "neck",
    [
      [0, 0.53, 0.2],
      [0, 0.6, 0.3],
      [0, 0.68, 0.36],
      [0, 0.74, 0.4],
    ],
    { parent: "chest", names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  b.sweep(neck, (t): [number, number] => [0.075 - 0.012 * t, 0.07 - 0.01 * t], {
    name: "neck",
    color: SCALES,
    sides: 10,
  });

  // Head: a lofted skull with a short snout, and a separate lower jaw on a hinge.
  b.joint("head", { parent: "neck3", at: [0, 0.74, 0.4], aim: [0, 0.72, 0.62], role: "head" });
  const skull = b.loft(
    [
      { at: [0, 0.75, 0.4], w: 0.2, h: 0.2 },
      { at: [0, 0.74, 0.48], w: 0.22, h: 0.21 },
      { at: [0, 0.74, 0.55], w: 0.19, h: 0.18 },
      { at: [0, 0.715, 0.62], w: 0.12, h: 0.12 },
      { at: [0, 0.7, 0.67], w: 0.08, h: 0.08 },
    ],
    { name: "skull", color: SCALES, bone: "head", sides: 10 },
  );

  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.655, 0.44], dir: [0, -0.12, 1], role: "jaw" });
  b.rod(jaw, [0, 0.63, 0.62], [0.02, 0.016], { name: "jaw", color: CREAM, sides: 8 });
  b.pose("jaw", { axis: [1, 0, 0], deg: 8 });

  // Face details, seated on the real skull surface.
  const headSurface = b.surface(skull);
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hit = headSurface.nearest([0.1 * s, 0.77, 0.5]);
    b.stick(new THREE.SphereGeometry(0.03, 12, 8), EYE, hit, {
      name: `eye${tag}`,
      embed: 0.33,
      bone: "head",
    });
    const eyeCentre = hit.at.clone().addScaledVector(hit.n, 0.01);
    const pupil = eyeCentre.addScaledVector(hit.n, 0.026);
    b.part(new THREE.SphereGeometry(0.013, 8, 6), INK, { at: pupil, bone: "head", name: `pupil${tag}` });

    const nostril = headSurface.nearest([0.035 * s, 0.71, 0.66]);
    b.stick(new THREE.SphereGeometry(0.009, 8, 6), INK, nostril, {
      name: `nostril${tag}`,
      embed: 0.4,
      bone: "head",
    });
  }

  // Horns sweep back from the brow.
  for (const s of [1, -1]) {
    b.spike([0.07 * s, 0.83, 0.42], [0.1 * s, 0.95, 0.35], null, 0.026, {
      name: "horn",
      color: HORN,
      bone: "head",
    });
  }

  // Spines along the back, angled up and back.
  const backSpines: Array<[number, number, string]> = [
    [-0.16, 0.505, "spine1"],
    [-0.05, 0.5325, "spine2"],
    [0.06, 0.56, "spine2"],
    [0.16, 0.585, "chest"],
  ];
  for (const [z, y, bone] of backSpines) {
    b.spike([0, y, z], [0, 1, -0.25], 0.05, 0.02, { name: "back spine", color: ORANGE, bone });
  }

  // Tail: tapering, with a spade at the tip and a couple of small spines.
  b.chain(
    "tail",
    [
      [0, 0.42, -0.22],
      [0, 0.39, -0.36],
      [0, 0.36, -0.5],
      [0, 0.34, -0.63],
      [0, 0.36, -0.74],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  b.sweep(
    b.chain(
      "tailBody",
      [
        [0, 0.42, -0.22],
        [0, 0.39, -0.36],
        [0, 0.36, -0.5],
        [0, 0.34, -0.63],
        [0, 0.36, -0.74],
      ],
      { parent: "pelvis", names: ["tailA1", "tailA2", "tailA3", "tailA4", "tailAT"], role: "tail" },
    ),
    (t): number => 0.05 - 0.035 * t,
    { name: "tail", color: SCALES, sides: 8 },
  );
  b.slab(
    [
      [0, 0.36, -0.74],
      [0, 0.43, -0.84],
      [0, 0.36, -0.95],
      [0, 0.29, -0.84],
    ],
    { name: "tail spade", color: ORANGE, thickness: 0.018, bone: "tailTipA" },
  );
  b.spike([0, 0.41, -0.4], [0, 1, -0.2], 0.035, 0.014, { name: "tail spine", color: ORANGE, bone: "tailA2" });
  b.spike([0, 0.375, -0.56], [0, 1, -0.2], 0.03, 0.012, { name: "tail spine", color: ORANGE, bone: "tailA3" });

  // Legs, arms-turned-wings and fingers, mirrored for each side.
  for (const [s, tag] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Hind leg: knee bends backward, foot points forward.
    const hind = b.chain(
      `hindLeg${tag}`,
      [at(s, 0.09, 0.4, -0.14), at(s, 0.13, 0.19, -0.1), at(s, 0.12, 0.07, -0.12), at(s, 0.12, 0.03, -0.04)],
      { parent: "pelvis", names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `toe${tag}`], role: "leg" },
    );
    b.sweep(hind, (t): number => 0.06 - 0.025 * t, { name: `hindLeg${tag}`, color: SCALES, sides: 8 });
    for (const dx of [-0.012, 0, 0.012]) {
      b.spike(at(s, 0.12 + dx, 0.03, -0.015), [0, -0.25, 1], 0.028, 0.01, {
        name: "claw",
        color: HORN,
        bone: `toe${tag}`,
      });
    }

    // Fore leg: elbow bends backward, paw points forward.
    const fore = b.chain(
      `foreLeg${tag}`,
      [at(s, 0.09, 0.46, 0.12), at(s, 0.12, 0.24, 0.04), at(s, 0.11, 0.08, 0.1), at(s, 0.1, 0.03, 0.2)],
      { parent: "chest", names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `paw${tag}`], role: "leg" },
    );
    b.sweep(fore, (t): number => 0.05 - 0.02 * t, { name: `foreLeg${tag}`, color: SCALES, sides: 8 });
    for (const dx of [-0.012, 0, 0.012]) {
      b.spike(at(s, 0.1 + dx, 0.03, 0.21), [0, -0.25, 1], 0.028, 0.01, {
        name: "claw",
        color: HORN,
        bone: `paw${tag}`,
      });
    }

    // Wing arm, raised and spread.
    const arm = b.chain(
      `wing${tag}`,
      [at(s, 0.09, 0.57, 0.1), at(s, 0.25, 0.74, 0.04), at(s, 0.38, 0.76, 0)],
      { parent: "chest", names: [`wingRoot${tag}`, `wingElbow${tag}`, `wingWrist${tag}`], role: "wing" },
    );
    b.sweep(arm, (t): number => 0.03 - 0.008 * t, { name: `wingArm${tag}`, color: SCALES, sides: 6 });

    // Three wing fingers fanning from the wrist.
    const wrist = `wingWrist${tag}`;
    const f1 = b.chain(
      `fingerA${tag}`,
      [at(s, 0.38, 0.76, 0), at(s, 0.52, 0.8, 0.07), at(s, 0.66, 0.84, 0.12)],
      { parent: wrist, names: [`fingerA1${tag}`, `fingerA2${tag}`], role: "digit" },
    );
    const f2 = b.chain(
      `fingerB${tag}`,
      [at(s, 0.38, 0.76, 0), at(s, 0.54, 0.74, 0), at(s, 0.7, 0.7, -0.02)],
      { parent: wrist, names: [`fingerB1${tag}`, `fingerB2${tag}`], role: "digit" },
    );
    const f3 = b.chain(
      `fingerC${tag}`,
      [at(s, 0.38, 0.76, 0), at(s, 0.48, 0.66, -0.04), at(s, 0.6, 0.56, -0.08)],
      { parent: wrist, names: [`fingerC1${tag}`, `fingerC2${tag}`], role: "digit" },
    );
    for (const finger of [f1, f2, f3]) {
      void finger;
    }
    b.sweep(f1, (t): number => 0.014 - 0.004 * t, { name: `fingerA${tag}`, color: HORN, sides: 6 });
    b.sweep(f2, (t): number => 0.014 - 0.004 * t, { name: `fingerB${tag}`, color: HORN, sides: 6 });
    b.sweep(f3, (t): number => 0.014 - 0.004 * t, { name: `fingerC${tag}`, color: HORN, sides: 6 });

    // Membrane between the fingers, and from the last finger back to the flank.
    const flank = [at(s, 0.38, 0.76, 0), at(s, 0.26, 0.56, -0.06), at(s, 0.12, 0.44, -0.16)];
    b.membrane(f1, f2, { name: `wingSkinA${tag}`, color: WING, thickness: 0.008, scallop: 0.1 });
    b.membrane(f2, f3, { name: `wingSkinB${tag}`, color: WING, thickness: 0.008, scallop: 0.1 });
    b.membrane(f3, flank, { name: `wingSkinC${tag}`, color: WING, thickness: 0.008, scallop: 0.1 });
  }

  return b.root;
}
