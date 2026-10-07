import * as THREE from "three";
import { createBuilder, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description: "A sitting koala with a big black nose, round fluffy ears, chunky grey fur and a cream belly.",
};

type V3 = [number, number, number];

export default function koala() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });

  // Grey back, cream front, with soft mottling so the fur reads at a glance.
  const fur = countershade(mottle("#8d9399", "#adb3b9", { size: 0.09, seed: 4, contrast: 0.8 }), "#ebe7de", {
    level: -0.05,
    soft: 0.45,
  });
  const cream = "#ebe6dc";
  const ink = "#1d1d20";
  const pink = "#d9b7ae";

  const ball = (radius: number, at: V3, color: string | typeof fur, bone: any, scale?: V3, name?: string) =>
    b.part(new THREE.SphereGeometry(radius, b.segments(12), b.segments(9)), color, { at, bone, scale, name });

  // Skeleton: a spine of joints, a head, and chains for each arm and leg.
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.36, 0.02] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.5, 0.07] });
  const head = b.joint("head", { parent: neck, at: [0, 0.61, 0.1], role: "head" });

  // Body: a plump rump and a round chest.
  ball(0.19, [0, 0.2, -0.02], fur, hips, [1, 0.8, 1.05], "rump");
  ball(0.2, [0, 0.36, 0.02], fur, chest, [0.92, 1.1, 0.95], "torso");
  b.capsule([0, 0.42, 0.04], [0, 0.56, 0.09], 0.11, { color: fur, bone: neck, name: "neck" });

  // Head: wide and round, with a big nose and little dark eyes.
  ball(0.14, [0, 0.61, 0.1], fur, head, [1.08, 0.98, 0.95], "head");
  for (const s of [1, -1]) {
    ball(0.07, [s * 0.12, 0.72, 0.06], fur, head, [1, 1, 0.4], "ear");
    ball(0.045, [s * 0.12, 0.72, 0.085], pink, head, [1, 1, 0.3], "earInner");
    ball(0.026, [s * 0.07, 0.64, 0.2], ink, head, undefined, "eye");
    ball(0.008, [s * 0.065, 0.65, 0.222], "#ffffff", head, undefined, "eyeShine");
  }
  ball(0.075, [0, 0.57, 0.2], cream, head, [1.1, 0.85, 0.9], "muzzle");
  ball(0.04, [0, 0.6, 0.27], ink, head, [1.4, 0.9, 0.9], "nose");

  // Arms hug the chest; a paw and three claws on each.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.15, 0.42, 0.05],
        [s * 0.2, 0.32, 0.15],
        [s * 0.1, 0.3, 0.25],
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, [0.05, 0.04, 0.035], { color: fur, name: `arm${side}` });
    const paw = arm.joints[2];
    ball(0.055, [s * 0.1, 0.3, 0.26], fur, paw, [1.1, 0.9, 1.2], "paw");
    for (const k of [-0.02, 0, 0.02])
      b.spike([s * 0.1 + k, 0.3, 0.3], [0, -0.25, 1], 0.025, 0.006, { color: ink, name: "claw" });
  }

  // Legs fold forward and down; each has a flat foot pad and claws.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.13, 0.18, 0.05],
        [s * 0.2, 0.1, 0.2],
        [s * 0.13, 0.04, 0.24],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.075, 0.06, 0.05], { color: fur, name: `leg${side}` });
    const ankle = leg.joints[2];
    ball(0.05, [s * 0.13, 0.03, 0.27], fur, ankle, [1, 0.6, 1.3], "foot");
    for (const k of [-0.02, 0, 0.02])
      b.spike([s * 0.13 + k, 0.03, 0.31], [0, -0.1, 1], 0.025, 0.006, { color: ink, name: "claw" });
  }

  // A small rounded tail tuft hidden at the back.
  ball(0.05, [0, 0.2, -0.2], fur, hips, undefined, "tail");

  return b.root;
}
