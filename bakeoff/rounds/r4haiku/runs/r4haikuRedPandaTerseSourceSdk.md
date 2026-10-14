```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, interpolate, mottle, paint } from "agentic-3js-builder";

export const meta = {
  name: "Red panda",
  description:
    "A red panda at rest on all fours: rust coat, cream face and muzzle, dark legs, a cream jaw and a ringed tail held low behind.",
};

// Palette
const RUST = "#b9552a";
const RUST_LIGHT = "#d06c36";
const RUST_DEEP = "#8a3819";
const CREAM = "#f1e3c9";
const DARK = "#2a1a13";
const EYE_BROWN = "#3a2119";
const EYE = "#0c0807";
const NOSE = "#120c0a";
const CLAW = "#1a1210";

// The head's rest position in model metres, used to lay the face paint.
const HEAD_Y = 0.345;
const HEAD_Z = 0.25;
const TEAR_TOP = new THREE.Vector3(0.05, 0.0, 0.0);
const TEAR_LOW = new THREE.Vector3(0.05, -0.045, 0.035);

function distanceToSegment(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const ab = b.clone().sub(a);
  const t = THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1);
  return a.clone().addScaledVector(ab, t).distanceTo(p);
}

// Coat: mottled rust on the back and flanks, dark brown on the belly.
const bodyFur = mottle(RUST_LIGHT, RUST_DEEP, { size: 0.07, seed: 3 });
const bodyPaint = countershade(bodyFur, DARK, { level: -0.2, soft: 0.3 });

// Face: rust crown, cream muzzle and lower cheeks, dark eye rings and tear lines.
const headFur = mottle(RUST_LIGHT, RUST_DEEP, { size: 0.045, seed: 11, contrast: 0.8 });
const headPaint = paint((p) => {
  const q = new THREE.Vector3(Math.abs(p.x), p.y - HEAD_Y, p.z - HEAD_Z);
  if (Math.hypot(q.x - 0.05, q.y - 0.013, (q.z - 0.012) * 1.5) < 0.028) return EYE_BROWN;
  if (distanceToSegment(q, TEAR_TOP, TEAR_LOW) < 0.0085) return EYE_BROWN;
  if (q.z > 0.03 || (q.x > 0.035 && q.y < -0.012 && q.z > -0.03)) return CREAM;
  return headFur;
});

// Body thickness along the spine: full haunches, slightly narrower chest.
const bodyRadius = (t: number): [number, number] => [
  interpolate([0, 0.5, 1], [0.075, 0.085, 0.072], t),
  interpolate([0, 0.5, 1], [0.082, 0.086, 0.08], t),
];

export default function redPanda() {
  const b = createBuilder({ name: "red panda", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis, spine, neck and head, jaw and ears, four legs, a tail.
  b.joint("pelvis", { at: [0, 0.23, -0.1] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.235, -0.06],
      [0, 0.25, 0.04],
      [0, 0.27, 0.12],
    ]),
    { parent: "pelvis", names: ["spine1", "spine2"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.27, 0.12],
      [0, 0.31, 0.18],
      [0, 0.335, 0.215],
    ]),
    { parent: "spine2", names: ["neck1", "neck2", "head"], role: "neck" },
  );

  b.joint("jaw", { parent: "head", at: [0, 0.305, 0.23], dir: [0, -0.15, 1], role: "jaw" });
  const earL = b.joint("earL", {
    parent: "head",
    at: [0.05, 0.382, 0.215],
    dir: [0.2, 1, -0.05],
    up: [0, 0, 1],
    role: "hinge",
  });
  const earR = b.joint("earR", {
    parent: "head",
    at: [-0.05, 0.382, 0.215],
    dir: [-0.2, 1, -0.05],
    up: [0, 0, 1],
    role: "hinge",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.238, -0.12],
      [0, 0.265, -0.2],
      [0, 0.3, -0.3],
      [0, 0.31, -0.4],
      [0, 0.29, -0.49],
      [0, 0.25, -0.55],
    ]),
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"], role: "tail" },
  );

  // Body and neck: one smooth skin each, bending across the joints they run through.
  b.sweep(spine, bodyRadius, { name: "body", color: bodyPaint, sides: 10 });
  b.sweep(neck, [0.06, 0.05, 0.046], { name: "neck", color: bodyPaint, sides: 10 });

  // Head: the skull and muzzle as one loft, the lower jaw as its own piece.
  b.loft(
    [
      { at: [0, 0.345, 0.205], w: 0.09, h: 0.09 },
      { at: [0, 0.35, 0.235], w: 0.12, h: 0.11 },
      { at: [0, 0.345, 0.265], w: 0.115, h: 0.105 },
      { at: [0, 0.333, 0.297], w: 0.075, h: 0.07 },
      { at: [0, 0.33, 0.315], w: 0.05, h: 0.05 },
    ],
    { name: "head", color: headPaint, bone: "head", sides: 10 },
  );
  b.loft(
    [
      { at: [0, 0.305, 0.23], w: 0.06, h: 0.03 },
      { at: [0, 0.3, 0.27], w: 0.058, h: 0.028 },
      { at: [0, 0.3, 0.3], w: 0.04, h: 0.024 },
    ],
    { name: "jaw", color: CREAM, bone: "jaw", sides: 8 },
  );

  // Face details: eyes with catchlights, a black nose, whiskers.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.015, 12, 8), EYE, { bone: "head", at: [s * 0.054, 0.358, 0.262] });
    b.part(new THREE.SphereGeometry(0.0042, 8, 6), "#ffffff", { bone: "head", at: [s * 0.058, 0.364, 0.271] });
  }
  b.part(new THREE.SphereGeometry(0.017, 12, 8), NOSE, {
    bone: "head",
    at: [0, 0.332, 0.334],
    scale: [1.25, 0.8, 0.9],
  });
  for (const s of [1, -1]) {
    for (const [y0, y1] of [
      [0.337, 0.346],
      [0.332, 0.333],
      [0.327, 0.32],
    ]) {
      b.rod([s * 0.024, y0, 0.308], [s * 0.1, y1, 0.35], 0.0016, { color: DARK, bone: "head", sides: 4 });
    }
  }

  // Ears: rounded rust discs facing forward, with a cream inner patch on the front.
  for (const ear of [earL, earR]) {
    b.part(new THREE.SphereGeometry(0.032, 14, 10), RUST, { frame: ear, scale: [1, 1, 0.38] });
    b.part(new THREE.SphereGeometry(0.024, 10, 8), CREAM, {
      frame: ear,
      at: ear.local([0, 0.002, 0.011]),
      scale: [0.85, 0.85, 0.3],
    });
  }

  // Legs: dark, with paws on the floor and small dark claws.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const x = s * 0.055;
    b.chain(
      `fore${side}`,
      catmull([
        [x, 0.215, 0.11],
        [x, 0.12, 0.118],
        [x, 0.035, 0.11],
      ]),
      {
        parent: "spine2",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        contact: [x, 0, 0.125],
      },
    );
    const fore = b.chain(
      `fore${side}`,
      catmull([
        [x, 0.215, 0.11],
        [x, 0.12, 0.118],
        [x, 0.035, 0.11],
      ]),
      {
        parent: "spine2",
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        contact: [x, 0, 0.125],
      },
    );
    b.sweep(fore, [0.032, 0.023, 0.02], { name: `fore${side}`, color: DARK, sides: 8 });
    b.part(new THREE.SphereGeometry(0.03, 12, 8), DARK, {
      bone: `wrist${side}`,
      at: [x, 0.015, 0.124],
      scale: [1.05, 0.5, 1.3],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0072, 8, 6), CLAW, {
        bone: `wrist${side}`,
        at: [x + k * 0.011, 0.0068, 0.158],
        scale: [1, 0.9, 1.5],
      });
    }

    const xh = s * 0.06;
    const hind = b.chain(
      `hind${side}`,
      catmull([
        [xh, 0.225, -0.1],
        [xh, 0.12, -0.09],
        [xh, 0.035, -0.105],
      ]),
      {
        parent: "pelvis",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [xh, 0, -0.085],
      },
    );
    b.sweep(hind, [0.04, 0.03, 0.022], { name: `hind${side}`, color: DARK, sides: 8 });
    b.part(new THREE.SphereGeometry(0.034, 12, 8), DARK, {
      bone: `ankle${side}`,
      at: [xh, 0.017, -0.08],
      scale: [1, 0.5, 1.4],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0075, 8, 6), CLAW, {
        bone: `ankle${side}`,
        at: [xh + k * 0.012, 0.007, -0.034],
        scale: [1, 0.9, 1.5],
      });
    }
  }

  // Tail: long and bushy, ringed rust and dark brown, dark at the tip.
  b.sweep(tail, [0.034, 0.052, 0.056, 0.05, 0.037, 0.026], {
    name: "tail",
    color: bodyFur,
    sides: 10,
    bands: [
      [0.1, bodyFur],
      [0.19, DARK],
      [0.31, bodyFur],
      [0.4, DARK],
      [0.53, bodyFur],
      [0.62, DARK],
      [0.75, bodyFur],
      [0.84, DARK],
      [1, DARK],
    ],
  });

  return b.root;
}
```