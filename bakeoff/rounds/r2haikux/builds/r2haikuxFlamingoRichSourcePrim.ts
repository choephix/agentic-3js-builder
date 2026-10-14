import * as THREE from "three";
import { catmull, createBuilder, gradient, mottle, scales } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A standing flamingo in shallow water: candy-pink body, coral wings with black flight feathers, S-curved neck, two-tone bent bill, pale yellow eyes, rose legs with knobbly joints and webbed feet.",
};

const PALE = "#ffd9e7";
const CANDY = "#ffaad0";
const CANDY_DEEP = "#ff8cbc";
const CORAL = "#ff6e5e";
const CORAL_EDGE = "#e9503f";
const ROSE = "#dc5a86";
const BEAK = "#ffc4d6";
const INK = "#1c1920";
const EYE = "#f7ea8c";
const RIPPLE = "#f0fdff";
const SAND = "#e5d2a0";

/** A flight feather: a leaf outline, `len` long along +x and `w` wide. */
function leaf(len: number, w: number): Array<[number, number]> {
  return [
    [0, w / 2],
    [len * 0.5, w / 2],
    [len * 0.9, w * 0.25],
    [len, 0],
    [len * 0.9, -w * 0.25],
    [len * 0.5, -w / 2],
    [0, -w / 2],
  ];
}

/** Wing coverts in the wing plane: u runs backward from the shoulder, v up. */
const WING: Array<[number, number]> = [
  [0.0, 0.06],
  [0.1, 0.075],
  [0.22, 0.068],
  [0.33, 0.046],
  [0.42, 0.014],
  [0.48, -0.02],
  [0.44, -0.04],
  [0.34, -0.052],
  [0.22, -0.06],
  [0.1, -0.056],
  [0.0, -0.04],
];

/** Black primaries: base on the trailing edge (u back, v up), angle turned down from straight back, length. */
const PRIMARIES = [
  { u: 0.34, v: -0.05, len: 0.16, angle: 8 },
  { u: 0.38, v: -0.052, len: 0.15, angle: 16 },
  { u: 0.42, v: -0.046, len: 0.13, angle: 24 },
  { u: 0.46, v: -0.03, len: 0.11, angle: 32 },
];

/** The tail fan, in the tail's plane (u up-back from the rump, v across it). */
const TAIL: Array<[number, number]> = [
  [0, 0.03],
  [0.07, 0.05],
  [0.14, 0.045],
  [0.2, 0.012],
  [0.21, -0.01],
  [0.15, -0.04],
  [0.07, -0.05],
  [0, -0.03],
];

/** Webbed foot around the foot joint: x across, z forward, three toes with the web between them. */
const FOOT: Array<[number, number]> = [
  [-0.018, -0.012],
  [-0.058, 0.035],
  [-0.022, 0.03],
  [0, 0.072],
  [0.022, 0.03],
  [0.058, 0.035],
  [0.018, -0.012],
];

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", detail: 1, paintSize: 1024 });

  // Paints: candy body with feather scallops, coral wings, rose-to-pale neck, rippled shallow water.
  const bodyPaint = scales(gradient(CANDY, CANDY_DEEP, [0, 0.92, 0.14], [0, 0.8, -0.26]), "#ff7fb4", {
    size: 0.04,
    width: 0.14,
  });
  const neckPaint = gradient(CANDY, PALE, [0, 0.92, 0.12], [0, 1.3, 0.26]);
  const wingPaint = scales(gradient(CANDY_DEEP, CORAL, [0.12, 0.86, 0.1], [0.12, 0.86, -0.36]), CORAL_EDGE, {
    size: 0.03,
    width: 0.16,
  });
  const tailPaint = gradient(CANDY_DEEP, CORAL, [0, 0.8, -0.24], [0, 0.92, -0.44]);
  const waterPaint = mottle("#a9efee", "#71cdd9", { size: 0.22, contrast: 1.4 });

  // Skeleton: hips root, S-neck chain ending in the head, legs as chains, wings and tail on the body.
  const hips = b.joint("hips", { at: [0, 0.8, -0.03], dir: [0, 0.2, 1], role: "spine" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.12],
      [0, 1.05, 0.27],
      [0, 1.22, 0.15],
      [0, 1.35, 0.26],
    ]),
    { parent: hips, count: 4, names: ["neck1", "neck2", "neck3", "neck4", "head"], role: "neck" },
  );
  const head = neck.joints[4];

  const upperJaw = b.joint("upperJaw", { parent: head, at: [0, 1.345, 0.3], aim: [0, 1.255, 0.39], role: "jaw" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.325, 0.305], aim: [0, 1.245, 0.385], role: "jaw" });

  const tail = b.joint("tail", { parent: hips, at: [0, 0.8, -0.24], dir: [0, 0.5, -1], role: "tail" });

  // Body: a loft through the torso, neck and tail.
  b.loft(
    [
      { at: [0, 0.8, -0.27], w: 0.05, h: 0.06 },
      { at: [0, 0.8, -0.14], w: 0.17, h: 0.16 },
      { at: [0, 0.83, 0.0], w: 0.24, h: 0.23 },
      { at: [0, 0.86, 0.14], w: 0.22, h: 0.21 },
    ],
    { color: bodyPaint, bone: hips, sides: 12, name: "body" },
  );

  // Neck: one smooth tube bending along the S chain.
  b.sweep(neck, { radius: [0.05, 0.034, 0.027, 0.03, 0.034], color: neckPaint, name: "neck" });

  // Head and eyes: pale yellow with a dark pupil on each side.
  b.part(new THREE.SphereGeometry(0.056, b.segments(12), b.segments(9)), PALE, {
    bone: head,
    scale: [1, 0.92, 1.18],
    name: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), EYE, {
      bone: head,
      at: [0.05 * s, 1.36, 0.285],
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.0062, b.segments(6), b.segments(5)), INK, {
      bone: head,
      at: [0.061 * s, 1.362, 0.292],
      name: "pupil",
    });
  }

  // Bent two-tone bill: a pale pink upper and lower mandible with black tips, each on its own jaw joint.
  b.sweep(catmull([
    [0, 1.345, 0.3],
    [0, 1.315, 0.36],
    [0, 1.255, 0.39],
    [0, 1.215, 0.37],
  ]), {
    radius: (t: number): [number, number] => [0.011 - 0.004 * t, 0.017 - 0.008 * t],
    color: BEAK,
    bands: [
      [0.68, BEAK],
      [1, INK],
    ],
    bone: upperJaw,
    sides: 8,
    name: "upperBill",
  });
  b.sweep(catmull([
    [0, 1.325, 0.305],
    [0, 1.297, 0.36],
    [0, 1.245, 0.385],
    [0, 1.21, 0.365],
  ]), {
    radius: (t: number): [number, number] => [0.009 - 0.003 * t, 0.013 - 0.006 * t],
    color: BEAK,
    bands: [
      [0.68, BEAK],
      [1, INK],
    ],
    bone: jaw,
    sides: 8,
    name: "lowerBill",
  });

  // Legs: a three-segment chain per leg (knee forward in the belly, knobbly hock behind, foot forward),
  // knobs at the bends, and a webbed foot with a ripple ring on the water.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.07 * s;
    const leg = b.chain(
      `leg${side}`,
      [
        [x, 0.74, 0],
        [x, 0.56, 0.06],
        [x, 0.34, -0.05],
        [x, 0, 0.05],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    const [hip, knee, ankle, foot] = leg.joints;
    b.capsule(hip, knee, [0.021, 0.015], { color: ROSE, name: `thigh${side}` });
    b.capsule(knee, ankle, [0.014, 0.011], { color: ROSE, name: `shin${side}` });
    b.capsule(ankle, foot, [0.011, 0.009], { color: ROSE, name: `tarsus${side}` });
    b.part(new THREE.SphereGeometry(0.017, b.segments(10), b.segments(8)), ROSE, {
      bone: knee,
      name: `kneeKnob${side}`,
    });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), ROSE, {
      bone: ankle,
      name: `hockKnob${side}`,
    });
    b.slab(
      FOOT.map(([dx, dz]) => [x + dx, 0, 0.05 + dz]),
      { color: ROSE, thickness: 0.008, bone: foot, name: `webFoot${side}` },
    );
    b.part(new THREE.TorusGeometry(0.09, 0.003, 6, 30), RIPPLE, {
      bone: foot,
      at: [x, 0.002, 0.06],
      rotation: [90, 0, 0],
      name: `ripple${side}`,
    });
  }

  // Wings: coral coverts with black primaries fanning out at the tips, on one joint per wing.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [0.12 * s, 0.86, 0.1];
    const wing = b.joint(`wing${side}`, { parent: hips, at: shoulder, dir: [0, -0.15, -1], role: "wing" });
    b.extrude(WING, {
      color: wingPaint,
      at: shoulder,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.007,
      smoothing: 1,
      bone: wing,
      name: `wing${side}`,
    });
    PRIMARIES.forEach((f, i) => {
      const a = (f.angle * Math.PI) / 180;
      b.extrude(leaf(f.len, 0.04), {
        color: INK,
        at: [0.12 * s, 0.86 + f.v, 0.1 - f.u],
        x: [0, -Math.sin(a), -Math.cos(a)],
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.003,
        smoothing: 1,
        bone: wing,
        name: `primary${side}${i + 1}`,
      });
    });
  }

  // Tail fan, rising from the rump.
  b.extrude(TAIL, {
    color: tailPaint,
    at: [0, 0.8, -0.24],
    x: [0, 0.5, -1],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.005,
    smoothing: 1,
    bone: tail,
    name: "tailFan",
  });

  // Shallow pond: a sandy shore disc with the water surface at y = 0.
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.006, b.segments(24)), waterPaint, {
    bone: "hips",
    at: [0, -0.003, 0],
    name: "pond",
  });
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.012, b.segments(24)), SAND, {
    bone: "hips",
    at: [0, -0.01, 0],
    name: "shore",
  });

  return b.root;
}
