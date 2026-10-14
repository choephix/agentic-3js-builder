import * as THREE from "three";
import { catmull, createBuilder, mottle } from "../../../../src/index";
import type { Fill } from "../../../../src/index";

export const meta = {
  name: "Sleepy koala",
  description: "A drowsy koala hugging a eucalyptus branch, half asleep, chewing a sprig of leaves.",
};

const FUR = mottle("#9ea2a7", "#858b92", { size: 0.09, seed: 4, contrast: 1.2 });
const CREAM = "#efe5c9";
const BLACK = "#1c1b1e";
const EYE = "#4a2d1b";
const PAW = "#7a8088";
const CLAW = "#2a2b2f";
const BARK = "#7a5a40";
const STEM = "#6e7d5a";
const LEAF_COLORS = ["#5d8f86", "#4a7f78", "#6a9a8c"];

// One eucalyptus leaf, lanceolate, pointed at both ends.
const LEAF = [
  [0, 0, "sharp"],
  [0.03, 0.013],
  [0.07, 0.011],
  [0.1, 0, "sharp"],
  [0.07, -0.011],
  [0.03, -0.013],
] as const;

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });

  const ball = (
    r: number,
    at: [number, number, number],
    bone: string,
    color: Fill,
    scale: [number, number, number] = [1, 1, 1],
  ) => b.part(new THREE.SphereGeometry(r, b.segments(12), b.segments(9)), color, { at, bone, scale });

  const leaf = (at: [number, number, number], dir: [number, number, number], color: string, bone: string) =>
    b.extrude(LEAF, { color, at, x: dir, y: [0, 0, 1], thickness: 0.003, bone, name: "leaf" });

  // Skeleton: hips at the root, chest and head above it.
  b.joint("hips", { at: [0, 0.2, 0] });
  b.joint("chest", { parent: "hips", at: [0, 0.36, 0.02], role: "spine" });
  b.joint("head", { parent: "chest", at: [0, 0.58, 0.08], role: "head" });

  // Arms: the right paw grips the branch, the left paw holds the sprig near the mouth.
  const armL = b.chain("armL", [[0.14, 0.4, 0.05], [0.17, 0.33, 0.2], [0.1, 0.5, 0.27]], {
    parent: "chest",
    names: ["upperArmL", "forearmL", "pawL"],
    role: "arm",
  });
  const armR = b.chain("armR", [[-0.14, 0.4, 0.05], [-0.17, 0.33, 0.2], [-0.07, 0.31, 0.28]], {
    parent: "chest",
    names: ["upperArmR", "forearmR", "pawR"],
    role: "arm",
  });

  // Legs: short, sitting forward, feet flat on the ground.
  const legL = b.chain("legL", [[0.13, 0.2, 0.07], [0.17, 0.11, 0.2], [0.1, 0.03, 0.27]], {
    parent: "hips",
    names: ["thighL", "shinL", "footL"],
    role: "leg",
  });
  const legR = b.chain("legR", [[-0.13, 0.2, 0.07], [-0.17, 0.11, 0.2], [-0.1, 0.03, 0.27]], {
    parent: "hips",
    names: ["thighR", "shinR", "footR"],
    role: "leg",
  });

  // Limbs as smooth tubes that bend with their joints.
  b.sweep(armL, (t) => 0.05 - 0.018 * t, { color: FUR });
  b.sweep(armR, (t) => 0.05 - 0.018 * t, { color: FUR });
  b.sweep(legL, (t) => 0.06 - 0.022 * t, { color: FUR });
  b.sweep(legR, (t) => 0.06 - 0.022 * t, { color: FUR });

  // Body: a rounded ash-grey barrel with a cream chest.
  ball(0.2, [0, 0.25, 0], "hips", FUR, [0.95, 1.1, 0.9]);
  ball(0.05, [0, 0.14, -0.2], "hips", FUR);
  ball(0.15, [0, 0.31, 0.14], "chest", CREAM, [0.75, 0.7, 0.4]);

  // Paws: fat grey hands and feet, with dark claws on the feet.
  ball(0.05, [0.1, 0.5, 0.27], "pawL", FUR, [1.1, 0.9, 1.2]);
  ball(0.05, [-0.07, 0.31, 0.28], "pawR", FUR, [1.1, 0.9, 1.2]);
  for (const sx of [1, -1]) {
    const foot = sx > 0 ? "footL" : "footR";
    const x = sx * 0.1;
    ball(0.05, [x, 0.03, 0.3], foot, PAW, [1.1, 0.6, 1.35]);
    for (const dx of [-0.03, 0, 0.03]) {
      b.spike([x + dx, 0.03, 0.355], [0, -0.2, 1], 0.02, 0.005, { color: CLAW, name: "claw" });
    }
  }

  // Head: big, round, with fluffy ears, a cream muzzle, a black leathery nose and drowsy eyes.
  ball(0.13, [0, 0.62, 0.1], "head", FUR, [1.05, 1, 0.95]);
  ball(0.075, [0, 0.555, 0.18], "head", CREAM, [1.2, 0.75, 0.6]);
  ball(0.05, [0, 0.595, 0.215], "head", BLACK, [1.4, 0.9, 0.85]);
  for (const sx of [1, -1]) {
    ball(0.068, [sx * 0.12, 0.72, 0.04], "head", FUR, [1, 1, 0.35]);
    ball(0.045, [sx * 0.12, 0.72, 0.07], "head", CREAM, [1, 1, 0.25]);
    ball(0.026, [sx * 0.06, 0.635, 0.21], "head", EYE, [1.2, 0.8, 0.5]);
    ball(0.03, [sx * 0.06, 0.652, 0.2], "head", FUR, [1.5, 0.5, 0.6]);
  }

  // The eucalyptus branch: a curving bough across the chest, held by the right paw.
  const bough = catmull([
    [-0.4, 0.12, 0.3],
    [-0.15, 0.27, 0.3],
    [0, 0.35, 0.28],
    [0.2, 0.46, 0.24],
    [0.38, 0.55, 0.2],
  ]);
  b.sweep(bough, (t) => 0.024 - 0.012 * t, { color: BARK, name: "branch" });
  leaf([-0.25, 0.2, 0.3], [-0.6, 0.5, 0.3], LEAF_COLORS[0], "hips");
  leaf([0.28, 0.5, 0.22], [0.5, 0.6, -0.2], LEAF_COLORS[1], "hips");
  leaf([0.3, 0.52, 0.2], [0.8, 0.3, 0.3], LEAF_COLORS[2], "hips");

  // The sprig in the left paw, mid-munch: a stem with leaves along it.
  const stem = catmull([
    [0.1, 0.5, 0.27],
    [0.12, 0.6, 0.3],
    [0.11, 0.7, 0.33],
  ]);
  b.sweep(stem, (t) => 0.006 - 0.003 * t, { color: STEM, bone: "pawL", name: "stem" });
  const sprig: Array<[[number, number, number], [number, number, number]]> = [
    [[0.115, 0.55, 0.29], [0.6, 0.5, 0.3]],
    [[0.12, 0.61, 0.31], [-0.5, 0.6, 0.3]],
    [[0.112, 0.68, 0.33], [0.7, 0.5, 0.2]],
    [[0.11, 0.74, 0.34], [-0.3, 0.9, 0.2]],
    [[0.1, 0.5, 0.28], [-0.8, 0.2, 0.4]],
  ];
  sprig.forEach(([at, dir], i) => leaf(at, dir, LEAF_COLORS[i % LEAF_COLORS.length], "pawL"));

  // Tail: a tuft at the back.
  return b.root;
}
