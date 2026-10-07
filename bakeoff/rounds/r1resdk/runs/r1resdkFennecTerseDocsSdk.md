```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, gradient, limb } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description: "A small sand-coloured desert fox with huge ears, a black-tipped bushy tail and a rigged jaw, legs and ears.",
};

const FUR = "#e6c294";
const CREAM = "#f7ecd8";
const DARK = "#2b211b";
const PINK = "#e9a9a0";
const TAIL_TIP = "#2e2420";

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const coat = countershade(FUR, CREAM, { level: -0.1 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.15, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.1],
      [0, 0.155, 0.0],
      [0, 0.16, 0.1],
      [0, 0.19, 0.17],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.19, 0.17],
      [0, 0.23, 0.21],
      [0, 0.25, 0.24],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.25, 0.24],
    dir: [0, -0.1, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.02 }),
    aim: head.local({ forward: 0.12, down: 0.025 }),
    role: "jaw",
  });

  // Body
  b.sweep(spine, (t) => [0.058 + 0.012 * t, 0.06 + 0.012 * t], { color: coat });
  b.part(new THREE.SphereGeometry(0.06, 10, 8), coat, { bone: hips, at: [0, 0.15, -0.11], scale: [1, 1, 1.05] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), CREAM, {
    bone: spine.joints[2],
    at: [0, 0.14, 0.16],
    scale: [0.9, 0.9, 0.9],
  });
  b.sweep(neck, [0.046, 0.04], { color: coat });

  // Head
  b.part(new THREE.SphereGeometry(0.06, 10, 8), coat, {
    bone: head,
    at: head.local({ forward: 0.02 }),
    scale: [1.1, 0.92, 1],
  });
  b.frustumBox(head.local({ forward: 0.04 }), head.local({ forward: 0.12, down: 0.01 }), [0.07, 0.06], [0.035, 0.03], {
    bone: head,
    color: CREAM,
  });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.125, down: 0.008 }),
    scale: [1.1, 0.8, 1],
  });
  b.frustumBox(jaw.at, jaw.local([0, 0.09, 0]), [0.05, 0.015], [0.025, 0.012], {
    bone: jaw,
    color: CREAM,
  });

  // Eyes, cheek tufts, ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.012, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.04, forward: 0.05, up: 0.022 }),
    });
    b.part(new THREE.SphereGeometry(0.004, 5, 4), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.045, forward: 0.06, up: 0.03 }),
    });
    b.spike(head.local({ left: s * 0.045, forward: 0.03, down: 0.02 }), [s * 0.6, -0.2, -0.6], 0.05, 0.02, {
      color: CREAM,
      bone: head,
    });
    b.spike(head.local({ left: s * 0.04, forward: 0.0, down: 0.03 }), [s * 0.5, -0.5, -0.5], 0.045, 0.018, {
      color: CREAM,
      bone: head,
    });

    const earAt = head.local({ left: s * 0.05, up: 0.05, forward: -0.01 });
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: earAt,
      dir: [s * 0.3, 1, -0.15],
      role: "hinge",
    });
    b.extrude(
      [
        [-0.032, 0],
        [0.032, 0],
        [0.036, 0.08],
        [0.0, 0.17, "sharp"],
        [-0.032, 0.09],
      ],
      { at: earAt, x: [s, 0, 0], y: [s * 0.3, 1, -0.15], thickness: 0.008, smoothing: 1, color: FUR, bone: ear },
    );
    b.extrude(
      [
        [-0.019, 0.01],
        [0.019, 0.01],
        [0.021, 0.08],
        [0.0, 0.145, "sharp"],
        [-0.019, 0.09],
      ],
      { at: earAt, x: [s, 0, 0], y: [s * 0.3, 1, -0.15], thickness: 0.011, smoothing: 1, color: PINK, bone: ear },
    );
  }

  // Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb(
      [s * 0.045, 0.145, 0.1],
      [s * 0.045, 0.02, 0.11],
      [0.075, 0.07],
      [0, 0, -1],
    );
    const fl = b.chain(`legF${side}`, front, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.026, 0.013], { color: gradient(coat, CREAM, [0, 0.1, 0], [0, 0.03, 0]) });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), CREAM, {
      bone: fl.tip ?? fl.joints[1],
      at: [s * 0.045, 0.012, 0.125],
      scale: [0.9, 0.6, 1.5],
    });

    const hind = limb(
      [s * 0.05, 0.15, -0.1],
      [s * 0.05, 0.02, -0.1],
      [0.07, 0.07, 0.05],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.03, 0.013], { color: gradient(coat, CREAM, [0, 0.1, 0], [0, 0.03, 0]) });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, {
      bone: hl.joints[0],
      at: [s * 0.06, 0.15, -0.1],
      scale: [0.8, 1.1, 1.2],
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), CREAM, {
      bone: hl.tip ?? hl.joints[2],
      at: [s * 0.05, 0.012, -0.085],
      scale: [0.9, 0.6, 1.5],
    });
  }

  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.16, -0.15],
      [0, 0.14, -0.25],
      [0, 0.1, -0.34],
      [0, 0.065, -0.41],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.025, 0.04, 0.046, 0.03], {
    color: FUR,
    bands: [
      [0.78, FUR],
      [1, TAIL_TIP],
    ],
    sectors: [[125, 235, CREAM, 0, 0.78]],
  });

  return b.root;
}
```