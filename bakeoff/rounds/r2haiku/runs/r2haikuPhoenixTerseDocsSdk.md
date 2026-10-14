```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  limb,
  paint,
  type OutlinePoint,
} from "agentic-3js-builder";

const FLAME = "#d8431c";
const ORANGE = "#f07a22";
const GOLD = "#ffc23d";
const BEAK = "#f2b033";
const EYE = "#ffe45c";
const PUPIL = "#1d1512";
const CLAW = "#3b2a20";
const LEG = "#e8963a";

export const meta = {
  name: "phoenix",
  description: "A fire phoenix standing on the ground, wings half raised, crest of flame and a long plumed tail.",
};

const unit = (v: number[]): number[] => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

// A leaf-shaped feather: x runs along its length from the root, y across it.
function leaf(L: number, W: number): OutlinePoint[] {
  return [
    [0, 0],
    [L * 0.25, W * 0.7],
    [L * 0.7, W],
    [L, 0, "sharp"],
    [L * 0.7, -W],
    [L * 0.25, -W * 0.7],
  ];
}

const primaryPaint = paint((_p, _n, s) => (s[0] > 0.3 ? FLAME : GOLD));
const tailPaint = paint((p) => (p.z < -0.6 ? FLAME : p.z < -0.3 ? ORANGE : GOLD));

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, 0], aim: [0, 1.1, 0.1], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.1, 0.1],
      [0, 1.2, 0.22],
      [0, 1.3, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.3, 0.32],
      [0, 1.44, 0.42],
      [0, 1.56, 0.5],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 1.56, 0.5], aim: [0, 1.66, 0.6], role: "head" });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.03 }),
    aim: head.local({ forward: 0.25, up: -0.06 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.12],
      [0, 0.82, -0.42],
      [0, 0.64, -0.72],
      [0, 0.55, -1.0],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---- Torso, neck, head --------------------------------------------------
  const torsoRadius = (t: number) => (t < 0.5 ? 0.1 + 0.08 * (t / 0.5) : 0.18 - 0.06 * ((t - 0.5) / 0.5));
  b.sweep(spine, torsoRadius, { color: countershade(FLAME, GOLD, { level: 0.2 }) });

  b.sweep(neck, (t: number) => 0.075 - 0.02 * t, { color: ORANGE });

  b.part(new THREE.SphereGeometry(0.13, 12, 8), ORANGE, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.03 }),
    flat: true,
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), EYE, {
      bone: head,
      at: head.local({ forward: 0.1, left: s * 0.075, up: 0.03 }),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), PUPIL, {
      bone: head,
      at: head.local({ forward: 0.128, left: s * 0.075, up: 0.03 }),
    });
  }

  // Upper beak, and the lower jaw that opens it.
  b.sweep(
    bezier(
      head.local({ forward: 0.12, up: 0.0 }),
      head.local({ forward: 0.2, up: 0.01 }),
      head.local({ forward: 0.3, up: -0.03 }),
    ),
    [0.05, 0.008],
    { bone: head, color: BEAK, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    bezier(
      jaw.local({ forward: 0.0, up: 0.0 }),
      jaw.local({ forward: 0.1, up: -0.01 }),
      jaw.local({ forward: 0.2, up: -0.03 }),
    ),
    [0.035, 0.006],
    { bone: jaw, color: BEAK, caps: { start: "round", end: "point" } },
  );

  // Crest of five flames sweeping back over the skull.
  for (let i = 0; i < 5; i++) {
    const k = i - 2;
    const x = k * 0.04;
    const base = head.local({ forward: -0.03, left: x, up: 0.08 });
    const ctrl = head.local({ forward: -0.07, left: x * 1.1, up: 0.18 });
    const tip = head.local({
      forward: -0.16 - Math.abs(k) * 0.02,
      left: x * 1.5,
      up: 0.22 - Math.abs(k) * 0.04,
    });
    b.sweep(bezier(base, ctrl, tip), [0.022, 0.002], {
      bone: head,
      color: k === 0 ? FLAME : GOLD,
      caps: { start: "round", end: "point" },
    });
  }

  // ---- Wings --------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.1, 1.24, 0.18],
        [s * 0.4, 1.36, 0.14],
        [s * 0.75, 1.42, 0.02],
        [s * 1.05, 1.38, -0.2],
      ]),
      { parent: spine, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `tip${S}`], role: "wing" },
    );

    b.sweep(wing, (t: number) => 0.045 - 0.025 * t, { color: ORANGE });

    // Feathers lie flat, sweeping outward and back. x = length, y = width.
    const fx = unit([s * 0.6, 0, -0.8]);
    const fy = unit([0.8, 0, s * 0.6]);

    // Primaries toward the wing tip.
    b.along(
      wing,
      6,
      (at) =>
        b.extrude(leaf(0.42, 0.075), {
          at,
          x: fx,
          y: fy,
          thickness: 0.01,
          bevel: 0.003,
          smoothing: 1,
          color: primaryPaint,
        }),
      { from: 0.55, to: 1 },
    );

    // Shorter coverts over the wing root, lifted slightly.
    b.along(
      wing,
      9,
      (at) =>
        b.extrude(leaf(0.22, 0.05), {
          at: at.moved(at.local({ up: 0.02 })),
          x: fx,
          y: fy,
          thickness: 0.008,
          bevel: 0.002,
          smoothing: 1,
          color: ORANGE,
        }),
      { from: 0.1, to: 0.6 },
    );
  }

  // ---- Tail ---------------------------------------------------------------
  b.sweep(tail, (t: number) => 0.05 - 0.025 * t, { color: tailPaint });

  // Long plume feathers fanning flat from the tail.
  b.along(
    tail,
    5,
    (at) =>
      b.extrude(leaf(0.5, 0.09), {
        at,
        x: unit([0, -0.25, -1]),
        y: unit([1, 0, 0]),
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: tailPaint,
      }),
    { from: 0.45, to: 1 },
  );

  // ---- Legs and talons -----------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legPoints = limb(
      [s * 0.1, 0.98, 0.0],
      [s * 0.14, 0.0, 0.16],
      [0.45, 0.42, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${S}`, legPoints, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.05 - 0.02 * t, { color: LEG });

    const foot = leg.tip!;
    for (const k of [-1, 0, 1]) {
      b.capsule(
        foot.local({ forward: 0.0, up: 0.03, left: k * 0.035 }),
        foot.local({ forward: 0.14, up: 0.012, left: k * 0.06 }),
        0.014,
        { bone: foot, color: CLAW },
      );
    }
  }

  return b.root;
}
```