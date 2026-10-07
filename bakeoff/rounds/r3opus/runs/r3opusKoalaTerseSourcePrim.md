```ts
import * as THREE from "three";
import { createBuilder, frame, paint, mottle, countershade, spots } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description:
    "A stylized low-poly koala on all fours in a rig-ready rest pose. It has big fluffy ears, a leathery spoon nose, mottled grey fur with a cream belly, curved claws and a gum leaf held in its jaw.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala" });

  // Palette
  const GREY = "#8f9399";
  const DARK = "#6b6f75";
  const CREAM = "#eee7d8";
  const WHITE = "#f7f4ee";
  const INNER = "#d8cfc2";
  const NOSE = "#2a2527";
  const NOSE_HI = "#5a5357";
  const EYE = "#3b2a1f";
  const BLACK = "#111010";
  const CLAW = "#2f2a2a";
  const LEAF = "#6f9a6a";
  const LEAF_RIB = "#b9cf9a";
  const TWIG = "#7a5a3e";

  // Fur paints
  const coat = mottle(GREY, DARK, { size: 0.06, seed: 3, contrast: 0.8 });
  const fur = countershade(coat, CREAM, { level: -0.35, soft: 0.25 });
  const rumpSpeckle = spots(fur, CREAM, { size: 0.03, amount: 0.45, seed: 5 });
  const bodyPaint = paint((p, n) => (p.z < -0.22 && n.z < -0.2 ? rumpSpeckle : fur));

  // ---------------- Skeleton ----------------
  b.joint("hips", { at: [0, 0.31, -0.18], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.31, -0.18],
      [0, 0.32, -0.02],
      [0, 0.33, 0.12],
    ],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.33, 0.12],
      [0, 0.4, 0.22],
    ],
    { parent: "chest", names: ["neck1"], role: "neck" },
  );
  b.joint("head", { at: [0, 0.4, 0.22], parent: "neck1", dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { at: [0, 0.385, 0.32], parent: "head", dir: [0, 0, 1], role: "jaw" });

  // ---------------- Body ----------------
  b.loft(
    [
      { at: [0, 0.29, -0.3], w: 0.18, h: 0.16 },
      { at: [0, 0.31, -0.21], w: 0.32, h: 0.3 },
      { at: [0, 0.32, -0.05], w: 0.34, h: 0.3 },
      { at: [0, 0.33, 0.1], w: 0.3, h: 0.28 },
      { at: [0, 0.35, 0.2], w: 0.2, h: 0.2 },
    ],
    { color: bodyPaint, bone: [spine], sides: 12 },
  );
  // Stubby tail nub
  b.part(new THREE.SphereGeometry(0.03, 8, 6), CREAM, { at: [0, 0.28, -0.3], bone: "hips" });
  // Neck
  b.sweep(neck, 0.1, { color: fur, sides: 10 });

  // ---------------- Legs ----------------
  const legs: Array<{ side: "L" | "R"; s: number; front: boolean }> = [
    { side: "L", s: 1, front: true },
    { side: "R", s: -1, front: true },
    { side: "L", s: 1, front: false },
    { side: "R", s: -1, front: false },
  ];
  for (const { side, s, front } of legs) {
    const x = 0.11 * s;
    const pts: number[][] = front
      ? [
          [0.1 * s, 0.27, 0.12],
          [x, 0.15, 0.14],
          [x, 0.035, 0.15],
        ]
      : [
          [0.11 * s, 0.27, -0.18],
          [0.12 * s, 0.15, -0.13],
          [0.12 * s, 0.035, -0.17],
        ];
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
      : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const leg = b.chain(front ? `arm${side}` : `leg${side}`, pts, {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
    });
    b.sweep(leg, front ? [0.058, 0.048, 0.038] : [0.065, 0.05, 0.04], { color: fur, sides: 9 });

    const wrist = names[2];
    const px = pts[2][0];
    const pz = pts[2][2] + 0.02;
    // Paw pad
    b.part(new THREE.SphereGeometry(0.045, 10, 6), fur, {
      at: [px, 0.03, pz],
      bone: wrist,
      scale: [1, 0.6, 1.3],
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 5), "#4a4446", {
      at: [px, 0.012, pz + 0.005],
      bone: wrist,
      scale: [1, 0.35, 1.3],
    });
    // Claws: two thumbs + three fingers on the hands, four on the feet
    const n = front ? 5 : 4;
    for (let i = 0; i < n; i++) {
      const o = i - (n - 1) / 2;
      const gap = o * (front ? 0.017 : 0.019) + (front && Math.abs(o) > 1.2 ? Math.sign(o) * 0.006 : 0);
      b.spike([px + gap, 0.03, pz + 0.045], [px + gap * 1.3, 0.006, pz + 0.085], null, 0.007, {
        color: CLAW,
        bone: wrist,
        sides: 5,
      });
    }
  }

  // ---------------- Head ----------------
  b.part(new THREE.SphereGeometry(0.12, 14, 10), fur, {
    at: [0, 0.45, 0.27],
    bone: "head",
    scale: [1.2, 0.95, 0.9],
  });
  // White cheek ruffs
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 8, 6), WHITE, {
      at: [0.105 * s, 0.39, 0.29],
      bone: "head",
      scale: [0.8, 1, 1],
    });
  }
  // Big leathery spoon nose
  b.part(new THREE.SphereGeometry(0.04, 10, 8), NOSE, {
    at: [0, 0.42, 0.375],
    bone: "head",
    scale: [0.85, 1.3, 0.75],
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), NOSE_HI, {
    at: [0.006, 0.455, 0.395],
    bone: "head",
    scale: [1, 1.6, 0.6],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, {
      at: [0.013 * s, 0.38, 0.398],
      bone: "head",
      scale: [1.3, 0.8, 0.8],
    });
  }
  // Eyes: small, dark, slit pupil, glint
  for (const s of [1, -1]) {
    const ex = 0.062 * s;
    b.part(new THREE.SphereGeometry(0.019, 8, 6), EYE, { at: [ex, 0.465, 0.358], bone: "head" });
    b.part(new THREE.BoxGeometry(0.004, 0.018, 0.004), BLACK, { at: [ex, 0.465, 0.376], bone: "head" });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), WHITE, { at: [ex + 0.006 * s, 0.473, 0.374], bone: "head" });
    // Dark brow fold
    b.capsule([ex - 0.018 * s, 0.487, 0.35], [ex + 0.016 * s, 0.484, 0.348], 0.005, {
      color: DARK,
      bone: "head",
      sides: 5,
    });
  }

  // Lower jaw (separate, opens on "jaw")
  b.part(new THREE.SphereGeometry(0.035, 9, 6), CREAM, {
    at: [0, 0.352, 0.345],
    bone: "jaw",
    scale: [1.3, 0.6, 1],
  });
  // Gum leaf held in the mouth
  b.rod([0.0, 0.358, 0.37], [0.06, 0.356, 0.36], 0.003, { color: TWIG, bone: "jaw", sides: 5 });
  b.extrude(
    [
      [0, 0, "sharp"],
      [0.03, 0.014],
      [0.075, 0.016],
      [0.13, 0, "sharp"],
      [0.075, -0.011],
      [0.03, -0.01],
    ],
    {
      at: [0.058, 0.356, 0.36],
      x: [1, -0.2, 0.25],
      y: [0, 0.25, 1],
      thickness: 0.003,
      color: LEAF,
      bone: "jaw",
      smoothing: 1,
    },
  );
  b.rod([0.06, 0.358, 0.361], [0.18, 0.334, 0.39], 0.0025, { color: LEAF_RIB, bone: "jaw", sides: 4 });

  // ---------------- Ears ----------------
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const c = new THREE.Vector3(0.145 * s, 0.53, 0.25);
    const axis = new THREE.Vector3(0.85 * s, 0.15, 0.5).normalize();
    const ear = b.joint(`ear${side}`, { at: c, parent: "head", dir: axis });
    b.part(new THREE.SphereGeometry(0.085, 12, 8), fur, {
      at: c,
      dir: axis,
      axis: "z",
      scale: [1, 1, 0.4],
      bone: ear,
    });
    b.part(new THREE.SphereGeometry(0.06, 10, 6), INNER, {
      at: c.clone().addScaledVector(axis, 0.02),
      dir: axis,
      axis: "z",
      scale: [1, 1, 0.3],
      bone: ear,
    });
    // White fluffy fringe round the rim
    b.ring(frame(c, axis), { count: 11, radius: 0.075, fromDeg: -140, toDeg: 140, tilt: 15 }, (it) => {
      b.spike(it, it, 0.034, 0.017, { color: WHITE, bone: ear, sides: 5 });
    });
    // Inner ear tufts
    b.ring(frame(c.clone().addScaledVector(axis, 0.015), axis), { count: 5, radius: 0.03, tilt: 65 }, (it) => {
      b.spike(it, it, 0.03, 0.012, { color: WHITE, bone: ear, sides: 5 });
    });
  }

  return b.root;
}
```