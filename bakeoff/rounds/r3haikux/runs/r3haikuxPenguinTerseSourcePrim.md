```ts
import * as THREE from "three";
import { createBuilder, mix, mottle, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Penguin",
  description:
    "A standing penguin about 0.73 m tall: black back and flippers, white front, a dark head with white eye rings, an orange beak and webbed feet. Rigged on hips, spine, neck, head with a hinged lower beak, two flippers, two legs and a tail.",
};

const WHITE = "#f4f5f1";
const BEAK = "#f2a01e";
const FEET = "#ea7a1f";
const INK = "#0b0c10";
const GLINT = "#ffffff";

// Near-black slate with soft mottling, so the dark parts read as feathers rather than a flat fill.
const BLACK = mottle("#12151b", "#2b3140", { size: 0.14, seed: 4, contrast: 0.6 });

// Countershading: white where the surface faces forward (the belly), black over the back and flanks.
const BODY = paint((p, n) => mix(BLACK.at(p, n), WHITE, smoothstep(0.16, 0.34, n.z)));

const HEAD_C = new THREE.Vector3(0, 0.635, 0.012);
const HEAD_R = 0.1;

/** A point on the head in direction (x, y, z) from its centre, `lift` metres off the surface. */
function onHead(x: number, y: number, z: number, lift = 0) {
  return HEAD_C.clone().addScaledVector(new THREE.Vector3(x, y, z).normalize(), HEAD_R + lift);
}

/** An eye: s = +1 the creature's left (+X), s = -1 its right. */
const eye = (s: number, lift = 0) => onHead(s * 0.42, 0.22, 0.88, lift);
const EYES = [eye(1), eye(-1)];

// Black head with a white ring round each eye.
const HEAD = paint((p, n) =>
  mix(
    BLACK.at(p, n),
    WHITE,
    smoothstep(0.036, 0.028, Math.min(p.distanceTo(EYES[0]), p.distanceTo(EYES[1]))),
  ),
);

// A webbed foot in the ground plane: x = side, y = forward. Three toes fan out from a short heel.
const FOOT: Array<[number, number]> = [
  [0, -0.03],
  [0.018, -0.018],
  [0.046, 0.045],
  [0.014, 0.028],
  [0, 0.07],
  [-0.014, 0.028],
  [-0.046, 0.045],
  [-0.018, -0.018],
];

export default function penguin() {
  const b = createBuilder({ name: "penguin", detail: 1, paintSize: 1024 });

  // Skeleton: a root at the hips, a three-bone spine, neck, head and a hinged jaw.
  b.joint("hips", { at: [0, 0.2, 0] });
  b.chain(
    "spine",
    [
      [0, 0.2, 0],
      [0, 0.33, 0],
      [0, 0.47, 0],
      [0, 0.56, 0],
    ],
    { parent: "hips", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  b.joint("neck", { parent: "spine3", at: [0, 0.55, 0], dir: [0, 1, 0.2], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.6, 0.01], dir: [0, 1, 0.1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.622, 0.09], dir: [0, 0, 1], role: "jaw" });

  // Tail: a short chain behind the hips, swept as a flat fan.
  const tail = b.chain(
    "tail",
    [
      [0, 0.24, -0.09],
      [0, 0.2, -0.14],
      [0, 0.17, -0.18],
    ],
    { parent: "hips", names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number): [number, number] => [0.036 - 0.02 * t, 0.008], {
    name: "tail",
    color: BLACK,
    caps: { start: "round", end: "point" },
  });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Flipper: a wing chain from the shoulder, swept as a flat blade that is thin front to back and tapers to a point.
    const wing = b.chain(
      `wing${L}`,
      [
        [s * 0.1, 0.47, 0],
        [s * 0.19, 0.41, 0],
        [s * 0.27, 0.345, 0],
      ],
      { parent: "spine3", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "wing" },
    );
    b.sweep(wing, (t: number): [number, number] => [0.042 - 0.03 * t, 0.009], {
      name: `flipper${L}`,
      color: BLACK,
      caps: { start: "round", end: "point" },
    });

    // Leg: a chain from the hip to the ankle, with a tube along it and a webbed foot on the ankle.
    const leg = b.chain(
      `leg${L}`,
      [
        [s * 0.06, 0.2, -0.01],
        [s * 0.065, 0.11, 0],
        [s * 0.065, 0.026, 0.01],
      ],
      { parent: "hips", names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, 0.013, { name: `leg${L}`, color: FEET });
    b.extrude(FOOT, {
      name: `foot${L}`,
      color: FEET,
      at: [s * 0.065, 0.008, 0.01],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.016,
      bevel: 0.005,
      bone: `ankle${L}`,
    });
  }

  // Body: an ellipsoid on the spine, countershaded black back and white front.
  b.part(new THREE.SphereGeometry(1, b.segments(14), b.segments(10)), BODY, {
    name: "body",
    at: [0, 0.335, 0],
    scale: [0.14, 0.22, 0.15],
    bone: "spine2",
  });

  // Head: a sphere on the head bone, with white eye rings painted on.
  b.part(new THREE.SphereGeometry(HEAD_R, b.segments(14), b.segments(10)), HEAD, {
    name: "head",
    at: HEAD_C,
    bone: "head",
  });

  // Eyes: a black pupil with a small white glint, stood proud of the eye rings.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), INK, {
      name: `pupil${L}`,
      at: eye(s, 0.004),
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.0035, b.segments(6), b.segments(4)), GLINT, {
      name: `glint${L}`,
      at: onHead(s * 0.44, 0.27, 0.86, 0.008),
      bone: "head",
    });
  }

  // Beak: a tapering upper mandible on the head and a thinner lower one on the hinged jaw.
  b.sweep(
    [
      [0, 0.645, 0.09],
      [0, 0.635, 0.17],
    ],
    (t: number): [number, number] => [0.021 - 0.013 * t, 0.018 - 0.011 * t],
    { name: "beakUpper", color: BEAK, bone: "head", caps: { start: "round", end: "point" } },
  );
  b.sweep(
    [
      [0, 0.622, 0.09],
      [0, 0.617, 0.155],
    ],
    (t: number): [number, number] => [0.018 - 0.01 * t, 0.008 - 0.004 * t],
    { name: "beakLower", color: BEAK, bone: "jaw", caps: { start: "round", end: "point" } },
  );

  return b.root;
}
```