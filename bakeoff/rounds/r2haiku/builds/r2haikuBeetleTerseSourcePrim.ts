import * as THREE from "three";
import { createBuilder, catmull, grain } from "../../../../src/index";

const BODY = "#2b1e14";
const LEG = "#3b2b1e";
const CLAW = "#17110b";
const HORN = "#7a5428";
const EYE = "#0b0806";
const SHELL = grain("#5b3b1f", "#2a1a0c", { size: 0.006, axis: "z", seed: 3 });

export const meta = {
  name: "Stag beetle",
  description: "A stag beetle in rest pose: glossy grained elytra, six jointed legs and branched jaw-like mandibles.",
};

export default function stagBeetle() {
  const b = createBuilder({ name: "stag beetle", detail: 1, paintSize: 1024 });

  // Skeleton: body root, head, and one jaw joint per side.
  const body = b.joint("body", { at: [0, 0.0125, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.0135, 0.025], role: "head" });

  // Head and eyes.
  b.part(new THREE.SphereGeometry(0.0085, b.segments(12), b.segments(8)), BODY, {
    at: [0, 0.0135, 0.025],
    bone: head,
    scale: [1, 0.85, 0.95],
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Compound eyes.
    b.part(new THREE.SphereGeometry(0.0022, b.segments(8), b.segments(6)), EYE, {
      at: [s * 0.0075, 0.0148, 0.027],
      bone: head,
    });

    // Clubbed antenna.
    const tip: [number, number, number] = [s * 0.004, 0.0185, 0.048];
    b.sweep(
      catmull([
        [s * 0.004, 0.0158, 0.031],
        [s * 0.006, 0.0172, 0.04],
        tip,
      ]),
      0.0006,
      { color: LEG, bone: head },
    );
    b.part(new THREE.SphereGeometry(0.0012, b.segments(6), b.segments(5)), LEG, { at: tip, bone: head });

    // Mandible: a curved, tapering jaw on its own joint, with an inner tooth.
    const jaw = b.joint(`mandible${side}`, { parent: head, at: [s * 0.003, 0.0145, 0.028], role: "jaw" });
    b.sweep(
      catmull([
        [s * 0.003, 0.0145, 0.028],
        [s * 0.009, 0.0155, 0.04],
        [s * 0.007, 0.0175, 0.055],
        [s * 0.002, 0.0175, 0.062],
      ]),
      (t: number) => 0.0032 - 0.0017 * t,
      { color: HORN, bone: jaw },
    );
    b.spike([s * 0.0075, 0.0168, 0.046], [-s * 0.6, 0.25, 0.75], 0.007, 0.0013, { color: HORN, bone: jaw });
    b.spike([s * 0.0085, 0.0158, 0.036], [-s * 0.5, 0.2, 0.85], 0.004, 0.0011, { color: HORN, bone: jaw });

    // Six legs: three pairs, each a four-joint chain with capsule segments and a claw.
    const pairs: Array<[string, number]> = [
      ["F", 0.011],
      ["M", 0.0],
      ["H", -0.013],
    ];
    for (const [p, z] of pairs) {
      const chain = b.chain(
        `leg${p}${side}`,
        [
          [s * 0.008, 0.0125, z],
          [s * 0.025, 0.0055, z + 0.002],
          [s * 0.031, 0.003, z - 0.001],
          [s * 0.035, 0.0006, z - 0.005],
        ],
        {
          parent: body,
          role: "leg",
          names: [`hip${p}${side}`, `knee${p}${side}`, `ankle${p}${side}`, `foot${p}${side}`],
        },
      );
      const [hip, knee, ankle, foot] = chain.joints;
      b.capsule(hip, knee, [0.0024, 0.0019], { color: LEG, bone: hip });
      b.capsule(knee, ankle, [0.0019, 0.0013], { color: LEG, bone: knee });
      b.capsule(ankle, foot, [0.0013, 0.001], { color: LEG, bone: ankle });
      b.spike(foot, [0, 0, -1], 0.0035, 0.0007, { color: CLAW, bone: foot });
    }

    // Elytron: one grained wing case per side, meeting on the midline.
    b.loft(
      [
        { at: [s * 0.008, 0.0135, 0.004], w: 0.016, h: 0.017 },
        { at: [s * 0.008, 0.0135, -0.014], w: 0.017, h: 0.017 },
        { at: [s * 0.008, 0.013, -0.03], w: 0.013, h: 0.013 },
        { at: [s * 0.004, 0.0125, -0.041], w: 0.006, h: 0.007 },
      ],
      { color: SHELL, bone: body },
    );
  }

  // Pronotum: the dark domed shield behind the head.
  b.loft(
    [
      { at: [0, 0.0132, 0.026], w: 0.014, h: 0.01 },
      { at: [0, 0.014, 0.014], w: 0.026, h: 0.016 },
      { at: [0, 0.014, 0.004], w: 0.028, h: 0.018 },
    ],
    { color: BODY, bone: body },
  );

  return b.root;
}
