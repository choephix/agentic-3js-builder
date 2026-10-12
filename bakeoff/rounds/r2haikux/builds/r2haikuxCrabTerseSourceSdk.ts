import * as THREE from "three";
import { countershade, createBuilder, gradient, mottle, rng, spots } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description:
    "A stylised red shore crab: a speckled spined shell, stalked eyes, cream-tipped pincers and eight walking legs.",
};

const RED = "#c2452e";
const SHELL = "#c8402b";
const DEEP = "#7d1e15";
const TIP = "#3b1a14";
const CREAM = "#f4d7a4";
const EYE = "#fbf5e8";
const INK = "#17110e";

export default function crab() {
  const b = createBuilder({ name: "crab", detail: 1 });

  // Paint: a mottled red shell with orange and deep-red spots, cream underneath. Claws fade to cream tips.
  const shell = countershade(
    spots(mottle(SHELL, "#a6301f", { size: 0.09, seed: 2 }), ["#f2aa52", DEEP], { size: 0.045, amount: 0, seed: 4 }),
    CREAM,
    { level: 0.05, soft: 0.3 },
  );
  const claw = gradient(RED, "#f7e6c4", [0, 0.09, 0.19], [0, 0.09, 0.29]);

  // Body: the root joint, then the carapace as a flattened loft.
  const body = b.joint("body", { at: [0, 0.09, 0] });

  const carapace = b.loft(
    [
      { at: [0, 0.09, -0.075], w: 0.1, h: 0.05 },
      { at: [0, 0.09, -0.035], w: 0.19, h: 0.07 },
      { at: [0, 0.09, 0], w: 0.22, h: 0.08 },
      { at: [0, 0.09, 0.035], w: 0.21, h: 0.075 },
      { at: [0, 0.09, 0.065], w: 0.16, h: 0.06 },
      { at: [0, 0.09, 0.085], w: 0.08, h: 0.045 },
    ],
    { color: shell, bone: body, sides: 12, name: "carapace" },
  );

  // Tucked abdomen flap under the rear of the shell.
  b.loft(
    [
      { at: [0, 0.074, -0.03], w: 0.1, h: 0.024 },
      { at: [0, 0.064, -0.075], w: 0.07, h: 0.022 },
      { at: [0, 0.056, -0.11], w: 0.03, h: 0.014 },
    ],
    { color: CREAM, bone: body, sides: 10, name: "abdomen" },
  );

  // Spines along the lateral margins, and a short rostrum at the front.
  for (const s of [1, -1]) {
    b.spike([s * 0.1, 0.09, 0.03], [s * 0.7, 0.25, 0.7], 0.03, 0.01, { color: DEEP, bone: body, name: "spine" });
    b.spike([s * 0.085, 0.092, 0.06], [s * 0.7, 0.2, 0.7], 0.024, 0.008, { color: DEEP, bone: body, name: "spine" });
    b.spike([s * 0.1, 0.088, -0.02], [s * 0.8, 0.1, -0.3], 0.026, 0.008, { color: DEEP, bone: body, name: "spine" });
  }
  b.spike([0, 0.09, 0.07], [0, 0.22, 1], 0.03, 0.011, { color: RED, bone: body, name: "rostrum" });

  // Granules scattered over the top of the shell, seated on the real surface.
  const bumps = b.surface(carapace).scatter(80, {
    rng: rng(11),
    minDist: 0.022,
    filter: (hit) => hit.n.y > 0.3,
  });
  for (const hit of bumps) b.stick(new THREE.SphereGeometry(0.0055, b.segments(6), b.segments(4)), DEEP, hit, { embed: 0.45 });

  // Mouth: a lower jaw plate on a hinge, so it can drop open.
  b.joint("jaw", { parent: body, at: [0, 0.064, 0.06], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  b.extrude(
    [
      [-0.01, -0.035],
      [0.02, -0.04],
      [0.036, -0.02],
      [0.036, 0.02],
      [0.02, 0.04],
      [-0.01, 0.035],
    ],
    { color: CREAM, at: [0, 0.064, 0.06], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.012, bone: "jaw", name: "mandible" },
  );

  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";

    // Eye stalk: a short chain from the front corner of the shell, with a white eye and a dark pupil at the tip.
    const eyeTip = [s * 0.055, 0.155, 0.09];
    const stalk = b.chain(
      `eyeStalk${k}`,
      [
        [s * 0.045, 0.11, 0.07],
        [s * 0.05, 0.135, 0.08],
        eyeTip,
      ],
      { parent: body, names: [`eyeStalk${k}1`, `eyeStalk${k}2`, `eye${k}`], role: "neck" },
    );
    b.sweep(stalk, 0.0065, { color: RED, name: `eyeStalk${k}` });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), EYE, { at: eyeTip, bone: `eye${k}`, name: `eye${k}` });
    b.part(new THREE.SphereGeometry(0.01, b.segments(6), b.segments(4)), INK, {
      at: [s * 0.055, 0.155, 0.108],
      bone: `eye${k}`,
      name: `pupil${k}`,
    });

    // Cheliped: a three-span arm from the shoulder to the hand, ending in a palm with a fixed and a moving finger.
    b.chain(
      `arm${k}`,
      [
        [s * 0.065, 0.09, 0.06],
        [s * 0.11, 0.105, 0.1],
        [s * 0.125, 0.095, 0.15],
        [s * 0.13, 0.09, 0.19],
      ],
      { parent: body, names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`], role: "arm" },
    );
    b.sweep(b.chain(`armTube${k}`, [], {} as never) as never, 0, {} as never);
  }

  return b.root;
}
