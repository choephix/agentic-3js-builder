```ts
import * as THREE from "three";
import { createBuilder, rng, limb, mottle, spots, catmull, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Red rock crab",
  description: "A feisty brick-red rock crab with one oversized raised claw, eyes on stalks, eight walking legs and a barnacle and seaweed on its shell.",
};

type V = [number, number, number];
const add = (a: V, d: number[]): V => [a[0] + d[0], a[1] + d[1], a[2] + d[2]];

const BRICK = "#b1412a";
const BRICK_DEEP = "#7e2a1b";
const ORANGE = "#e0802e";
const CREAM = "#f0dfb8";
const LEG = "#8a3322";
const CLAW = "#b8452c";
const DARK = "#2a1410";
const TOOTH = "#3a1c14";
const EYE = "#f4efe2";
const PUPIL = "#120c0a";
const SEAWEED = "#3d6b2c";

export default function build() {
  const b = createBuilder({ name: "rock-crab" });

  // Skeleton root: the body sits on the legs.
  const body = b.joint("body", { at: [0, 0.12, 0], role: "spine" });

  // Shell: a wide, flattened dome, painted brick red with orange and cream speckles.
  const shellPaint = spots(
    spots(mottle(BRICK, BRICK_DEEP, { size: 0.1, seed: 1 }), ORANGE, { size: 0.04, amount: 0.3, seed: 2 }),
    CREAM,
    { size: 0.03, amount: 0.2, seed: 3 },
  );
  const shell = b.part(new THREE.SphereGeometry(1, 14, 9), shellPaint, {
    bone: body,
    at: [0, 0.12, -0.02],
    scale: [0.2, 0.1, 0.16],
  });

  // Brow ridge over the eye stalks.
  b.part(new THREE.SphereGeometry(1, 10, 7), shellPaint, {
    bone: body,
    at: [0, 0.125, 0.16],
    scale: [0.14, 0.05, 0.06],
  });

  // Knobbles across the shell.
  const surf = b.surface(shell);
  const knobs = surf.scatter(40, { rng: rng(7), minDist: 0.035, filter: (h) => h.n.y > -0.2 });
  for (const h of knobs) {
    b.stick(new THREE.SphereGeometry(0.013, 5, 4), BRICK_DEEP, h, { embed: 0.45 });
  }

  // Barnacle and seaweed clinging to the back of the shell.
  const barnacle = surf.around([0, 0.12, -0.02]).at(205, 30);
  if (barnacle) {
    b.stick(new THREE.CylinderGeometry(0.02, 0.025, 0.014, 7), CREAM, barnacle, { embed: 0.35 });
  }
  const weed = surf.around([0, 0.12, -0.02]).at(150, 50);
  if (weed) {
    const pts = [
      weed.at,
      weed.moved([0, 0.03, 0]).at,
      weed.moved([0.012, 0.07, 0.02]).at,
      weed.moved([0.03, 0.1, 0.05]).at,
    ];
    b.sweep(catmull(pts), [0.007, 0.005, 0.0035, 0.001], {
      bone: body,
      color: SEAWEED,
      caps: { end: "point" },
    });
  }

  // Eight jointed walking legs, four per side, with pointed tips.
  const legZs = [0.08, 0.0, -0.08, -0.16];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    legZs.forEach((z, i) => {
      const pts = limb(
        [s * 0.12, 0.12, z],
        [s * 0.36, 0.008, z - 0.04],
        [0.13, 0.17, 0.12],
        [
          [0, 1, 0],
          [0, 1, 0],
        ],
      );
      const leg = b.chain(`leg${sd}${i}`, polyline(pts), {
        parent: body,
        names: [`leg${sd}${i}Hip`, `leg${sd}${i}Knee`, `leg${sd}${i}Ankle`, `leg${sd}${i}Tip`],
        role: "leg",
      });
      b.sweep(leg, [0.024, 0.017, 0.012, 0.004], {
        color: LEG,
        caps: { start: "round", end: "point" },
      });
    });
  }

  // Eye stalks, each ending in an eye with a forward pupil.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const stalk = b.chain(
      `stalk${sd}`,
      polyline([
        [s * 0.06, 0.2, 0.16],
        [s * 0.075, 0.29, 0.2],
        [s * 0.08, 0.36, 0.22],
      ]),
      { parent: body, names: [`stalk${sd}1`, `stalk${sd}2`, `eye${sd}`], role: "neck" },
    );
    const eye = stalk.joints[2];
    b.sweep(stalk, [0.016, 0.013, 0.011], { color: LEG });
    const eyeC: V = [s * 0.08, 0.36, 0.22];
    b.part(new THREE.SphereGeometry(0.036, 8, 6), EYE, { bone: eye, at: eyeC });
    b.part(new THREE.SphereGeometry(0.017, 6, 5), PUPIL, { bone: eye, at: add(eyeC, [0, 0.004, 0.03]) });
  }

  // Claws: a large raised claw on the creature's left, a smaller one on the right.
  // Each has an arm chain, a palm, a fixed and a movable pincer with dark tips and teeth.
  const claw = (s: number, P: { S: V; E: V; W: V; H: V }, k: number) => {
    const sd = s > 0 ? "L" : "R";
    const up = (d: number[]): V => [d[0] * k, d[1] * k, d[2] * k];

    const arm = b.chain(`arm${sd}`, polyline([P.S, P.E, P.W, P.H]), {
      parent: body,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "arm",
    });
    const hand = arm.joints[3];
    b.sweep(arm, [0.034, 0.026, 0.022, 0.024].map((r) => r * k), { color: CLAW });

    // Palm, blocky and rigid on the hand joint.
    b.part(new THREE.SphereGeometry(1, 10, 8), CLAW, {
      bone: hand,
      at: P.H,
      scale: [0.095 * k, 0.07 * k, 0.1 * k],
    });

    // Fixed pincer (upper), with a dark tip and teeth along its lower edge.
    const fixedPath = polyline([
      P.H,
      add(P.H, up([0, 0.035, 0.07])),
      add(P.H, up([0.01, 0.03, 0.16])),
    ]);
    const fixed = b.sweep(fixedPath, [0.03 * k, 0.024 * k, 0.006 * k], {
      bone: hand,
      color: CLAW,
      bands: [
        [0.7, CLAW],
        [1, DARK],
      ],
      caps: { start: "round", end: "point" },
    });
    for (const t of [0.3, 0.46, 0.62]) {
      b.stick(new THREE.ConeGeometry(0.009 * k, 0.022 * k, 4), TOOTH, fixed.at(t, 180), { embed: 0.3 });
    }

    // Movable pincer (lower), angled outward so the claw reads open.
    const movPath = polyline([
      add(P.H, [0, -0.015 * k, 0]),
      add(P.H, up([0.05, -0.035, 0.08])),
      add(P.H, up([0.065, -0.045, 0.15])),
    ]);
    b.sweep(movPath, [0.024 * k, 0.018 * k, 0.005 * k], {
      bone: hand,
      color: CLAW,
      bands: [
        [0.7, CLAW],
        [1, DARK],
      ],
      caps: { start: "round", end: "point" },
    });
  };

  claw(
    1,
    {
      S: [0.1, 0.13, 0.08],
      E: [0.22, 0.2, 0.16],
      W: [0.22, 0.36, 0.34],
      H: [0.2, 0.44, 0.5],
    },
    1,
  );
  claw(
    -1,
    {
      S: [-0.1, 0.13, -0.02],
      E: [-0.2, 0.16, 0.04],
      W: [-0.2, 0.22, 0.16],
      H: [-0.19, 0.27, 0.26],
    },
    0.6,
  );

  return b.root;
}
```