```ts
import { SphereGeometry } from "three";
import { createBuilder, grain } from "agentic-3js-builder";

export const meta = {
  name: "Telescope",
  description: "A navy refractor telescope on a wooden tripod, with brass fittings, a finder scope and an eyepiece.",
};

const TILT = Math.PI / 6;
const MOUNT = [0, 1.02, 0];
/** The tube's axis, pointing forward and up. */
const AXIS = [0, Math.sin(TILT), Math.cos(TILT)];
/** The tube's top, perpendicular to the axis. */
const TOP = [0, Math.cos(TILT), -Math.sin(TILT)];

/**
 * A point on the tube's axis `t` metres from the mount, lifted `lift` toward the tube's top and shifted `side`
 * along the model's x (left is +X, right is -X).
 */
const P = (t: number, lift = 0, side = 0) => [
  side,
  MOUNT[1] + AXIS[1] * t + TOP[1] * lift,
  AXIS[2] * t + TOP[2] * lift,
];

const NAVY = "#1f3d73";
const WHITE = "#f1f1ee";
const DARK = "#2b2f36";
const BLACK = "#121316";
const BRASS = "#c9a24a";
const LENS = "#6f96c9";
const wood = grain("#9b6b3f", "#6e4727", { size: 0.03, axis: "y" });

export default function telescope() {
  const b = createBuilder({ name: "telescope" });

  // Skeleton: the tripod stands on the root, the head sits on it, and the tube pitches on the head.
  b.joint("root", { at: [0, 0, 0] });
  b.joint("head", { at: [0, 0.93, 0], parent: "root" });
  b.joint("tube", { at: MOUNT, dir: AXIS, up: TOP, parent: "head" });

  // Tripod head: a turned hub.
  b.lathe(
    [
      [0, -0.03],
      [0.075, -0.03],
      [0.085, 0.0],
      [0.07, 0.04],
      [0.035, 0.06],
      [0, 0.06],
    ],
    { color: DARK, at: [0, 0.93, 0], bone: "head", name: "hub" },
  );

  // Three wooden legs, splayed to the floor, with rubber feet.
  const feet: Array<[number, number]> = [
    [0, 0.5],
    [0.43, -0.25],
    [-0.43, -0.25],
  ];
  for (const [x, z] of feet) {
    b.rod([0, 0.93, 0], [x, 0, z], [0.022, 0.013], { color: wood, bone: "head", name: "leg" });
    b.part(new SphereGeometry(0.03, 10, 8), "#1d1d1d", { at: [x, 0.02, z], bone: "root", name: "foot" });
  }

  // Leg spreader: three dark bars between the legs at 60% of their length.
  const mids = feet.map(([x, z]) => [x * 0.6, 0.93 * 0.4, z * 0.6]);
  for (let i = 0; i < mids.length; i++) {
    b.rod(mids[i], mids[(i + 1) % mids.length], 0.008, { color: DARK, bone: "head", name: "spreader" });
  }

  // Yoke: two fork arms from the hub up to the altitude axle, and brass knobs on the ends.
  for (const s of [1, -1]) {
    b.rod([s * 0.04, 0.95, 0], [s * 0.11, 1.02, 0], 0.018, { color: DARK, bone: "head", name: "fork" });
    b.part(new SphereGeometry(0.016, 10, 8), BRASS, { at: [s * 0.12, 1.02, 0], bone: "head", name: "knob" });
  }
  b.rod([-0.115, 1.02, 0], [0.115, 1.02, 0], 0.011, { color: BRASS, bone: "head", name: "axle" });

  // Optical tube: navy body tapering toward the objective.
  b.rod(P(-0.22), P(0.3), [0.06, 0.05], { color: NAVY, bone: "tube", name: "tube" });

  // Dark mounting collars that the yoke cradles.
  b.rod(P(-0.1), P(-0.07), 0.068, { color: DARK, bone: "tube", name: "collar" });
  b.rod(P(0.1), P(0.13), 0.068, { color: DARK, bone: "tube", name: "collar" });

  // White shroud around the objective, with the glass set just in front of it.
  b.rod(P(0.2), P(0.31), 0.064, { color: WHITE, bone: "tube", name: "shroud" });
  b.rod(P(0.305), P(0.32), 0.046, { color: LENS, bone: "tube", name: "objective" });

  // Rear focuser, brass focus knob and eyepiece.
  b.rod(P(-0.22), P(-0.3), 0.038, { color: DARK, bone: "tube", caps: "round", name: "focuser" });
  b.part(new SphereGeometry(0.018, 12, 8), BRASS, { at: P(-0.26, 0, -0.05), bone: "tube", name: "focusKnob" });
  b.rod(P(-0.3), P(-0.38), [0.024, 0.02], { color: BLACK, bone: "tube", name: "eyepiece" });

  // Finder scope on a bracket along the top of the tube.
  b.rod(P(-0.06), P(-0.06, 0.07), 0.01, { color: DARK, bone: "tube", name: "finderBracket" });
  b.rod(P(-0.06, 0.07), P(0.12, 0.07), 0.02, { color: BLACK, bone: "tube", name: "finder" });
  b.rod(P(0.12, 0.07), P(0.125, 0.07), 0.024, { color: LENS, bone: "tube", name: "finderLens" });

  return b.root;
}
```