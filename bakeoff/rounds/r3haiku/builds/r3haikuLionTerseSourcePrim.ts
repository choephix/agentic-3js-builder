import * as THREE from "three";
import { countershade, createBuilder, frame, mottle } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "A stylised male lion in rest pose: mane rings, countershaded body, tufted tail, jointed jaw.",
};

export default function lion() {
  const b = createBuilder({ name: "lion", detail: 1, paintSize: 1024 });

  const BODY = countershade("#c58a3a", "#f0d6a0", { level: 0.1, soft: 0.4 });
  const MANE = mottle("#6e3c16", "#3f200c", { size: 0.22, seed: 3 });
  const MUZZLE = "#eed3a0";
  const DARK = "#2d1a10";
  const EYE = "#f2c230";
  const TUFT = "#3d2212";

  const ball = (r: number, seg = 10) =>
    new THREE.SphereGeometry(r, b.segments(seg), b.segments(Math.round(seg * 0.7)));

  // Skeleton: spine, neck, head with a hinged jaw.
  b.joint("hips", { at: [0, 0.98, -0.5] });
  b.joint("chest", { parent: "hips", at: [0, 1.08, 0.35], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 1.25, 0.7], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.32, 0.92], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.18, 0.99], dir: [0, -1, 0], up: [0, 0, 1], role: "jaw" });

  // Torso: one smooth loft from the hips through the chest.
  b.loft(
    [
      { at: [0, 1.0, -0.55], w: 0.5, h: 0.58 },
      { at: [0, 1.05, -0.1], w: 0.56, h: 0.62 },
      { at: [0, 1.1, 0.3], w: 0.6, h: 0.66 },
      { at: [0, 1.14, 0.6], w: 0.5, h: 0.6 },
    ],
    { name: "body", color: BODY, bone: ["hips", "chest"] },
  );

  // Tail: a tapering chain ending in a dark tuft.
  const tail = b.chain("tail", [
    [0, 0.98, -0.85],
    [0, 0.92, -1.2],
    [0, 0.7, -1.36],
    [0, 0.42, -1.4],
  ], { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, { radius: [0.07, 0.05, 0.035, 0.028], color: BODY });
  b.part(ball(0.09, 10), TUFT, { at: [0, 0.4, -1.41], bone: "tail3", scale: [1, 1.3, 1] });

  // Legs: front from the chest, back from the hips. Each is a chain with a paw tip joint.
  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;
    const x = 0.2 * s;

    const fore = b.chain(`foreLeg${side}`, [
      [x, 1.0, 0.45],
      [x, 0.55, 0.5],
      [x, 0.12, 0.5],
      [x, 0.06, 0.62],
    ], {
      parent: "chest",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(fore, { radius: [0.12, 0.085, 0.065, 0.06], color: BODY });
    b.part(ball(0.075), BODY, { at: [x, 0.045, 0.66], bone: `paw${side}`, scale: [1, 0.6, 1.3] });

    const hind = b.chain(`hindLeg${side}`, [
      [x, 0.98, -0.5],
      [x, 0.6, -0.42],
      [x, 0.2, -0.62],
      [x, 0.06, -0.5],
    ], {
      parent: "hips",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      role: "leg",
    });
    b.sweep(hind, { radius: [0.13, 0.09, 0.06, 0.06], color: BODY });
    b.part(ball(0.075), BODY, { at: [x, 0.045, -0.5], bone: `hindPaw${side}`, scale: [1, 0.6, 1.3] });
  }

  // Head: round skull, muzzle, cheeks, nose, eyes, ears.
  b.part(ball(0.2, 14), BODY, { at: [0, 1.32, 0.92], bone: "head" });
  b.capsule([0, 1.27, 0.97], [0, 1.25, 1.1], 0.09, { color: MUZZLE, bone: "head" });
  b.part(ball(0.1), MUZZLE, { at: [-0.1, 1.25, 0.98], bone: "head" });
  b.part(ball(0.1), MUZZLE, { at: [0.1, 1.25, 0.98], bone: "head" });
  b.part(ball(0.04, 8), DARK, { at: [0, 1.265, 1.19], bone: "head" });
  b.capsule([0, 1.18, 0.99], [0, 1.17, 1.1], 0.065, { color: MUZZLE, bone: "jaw" });

  for (const s of [1, -1]) {
    b.part(ball(0.04, 8), EYE, { at: [0.075 * s, 1.36, 1.08], bone: "head" });
    b.part(ball(0.018, 6), DARK, { at: [0.075 * s, 1.36, 1.12], bone: "head" });
    b.part(ball(0.055, 8), MANE, { at: [0.14 * s, 1.47, 0.9], bone: "head" });
  }

  // Mane: two rings of shaggy balls framing the head and shoulders.
  b.ring(frame([0, 1.32, 0.83], [0, 0, 1]), { count: 18, radius: 0.24 }, (item) =>
    b.part(ball(0.11, 8), MANE, { frame: item, bone: "head" }),
  );
  b.ring(frame([0, 1.3, 0.74], [0, 0, 1]), { count: 20, radius: 0.3 }, (item) =>
    b.part(ball(0.13, 8), MANE, { frame: item, bone: "neck" }),
  );

  return b.root;
}
