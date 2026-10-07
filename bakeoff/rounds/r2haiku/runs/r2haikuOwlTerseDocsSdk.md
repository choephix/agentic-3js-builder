```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  stripes,
  countershade,
  type OutlinePoint,
} from "agentic-3js-builder";

export const meta = {
  name: "owl",
  description: "A stylised perched-ground owl: round body, facial disc, big gold eyes, ear tufts, folded wings, yellow feet.",
};

const BROWN = "#7b5a3a";
const DARK = "#3f2c1c";
const CREAM = "#e8d6b0";
const HEAD = "#8a6a46";
const DISC = "#c99a62";
const GOLD = "#f2b233";
const PUPIL = "#150d08";
const RIM = "#2a1d12";
const BEAK = "#3a3a3a";
const LEG = "#e7b75a";
const CLAW = "#2a2a2a";
const WING = "#5a4128";
const WING_LIGHT = "#9b7a50";
const EAR = "#4a3322";

export default function build() {
  const b = createBuilder({ name: "owl" });

  // Skeleton: hips -> spine -> head, legs, tail.
  const hips = b.joint("hips", { at: [0, 0.2, 0], role: "spine" });

  const spine = b.chain("spine", catmull([[0, 0.2, 0], [0, 0.3, 0], [0, 0.4, 0.02]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const top = spine.joints[spine.joints.length - 1];

  const head = b.joint("head", {
    parent: top,
    at: [0, 0.48, 0.03],
    dir: [0, 1, 0.12],
    role: "head",
  });

  // Body: a plump tube along the spine, widest in the middle.
  const bodyPaint = countershade(stripes(BROWN, DARK, { size: 0.05, axis: "y" }), CREAM, { level: -0.2 });
  b.sweep(spine, (t: number) => [0.12 + 0.03 * Math.sin(Math.PI * t), 0.14 + 0.02 * Math.sin(Math.PI * t)], {
    color: bodyPaint,
  });

  // Head: a flat-shaded ball, a flattened facial disc, and big eyes.
  b.part(new THREE.SphereGeometry(0.13, 14, 10), HEAD, {
    bone: head,
    at: [0, 0.5, 0.02],
    scale: [1.1, 1, 0.95],
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.1, 12, 8), DISC, {
    bone: head,
    at: [0, 0.5, 0.11],
    scale: [1.3, 1.05, 0.4],
    flat: true,
  });

  const ringAround = (cx: number, cy: number, cz: number, r: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a), cz];
    });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 12, 8), GOLD, {
      bone: head,
      at: [s * 0.05, 0.52, 0.14],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), PUPIL, {
      bone: head,
      at: [s * 0.05, 0.52, 0.18],
      flat: true,
    });
    b.sweep(catmull(ringAround(s * 0.05, 0.52, 0.13, 0.052), { closed: true }), 0.008, {
      color: RIM,
      bone: head,
    });
    // Ear tufts.
    b.spike([s * 0.07, 0.6, 0], [s * 0.25, 1, -0.25], 0.1, 0.028, { color: EAR, bone: head });
  }

  // Hooked beak.
  b.spike([0, 0.49, 0.13], [0, -0.5, 1], 0.07, 0.03, { color: BEAK, bone: head });

  // Folded wings, flat extruded silhouettes on each flank.
  const wingOutline: OutlinePoint[] = [
    [0.03, 0.14],
    [0.07, 0.02],
    [0.05, -0.08],
    [0.0, -0.13],
    [-0.03, -0.17, "sharp"],
    [-0.06, -0.1],
    [-0.05, 0.02],
    [-0.03, 0.13],
  ];
  const wingPaint = stripes(WING, WING_LIGHT, { size: 0.04, axis: "y" });
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.155, 0.3, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      smoothing: 1,
      color: wingPaint,
      bone: spine.joints[1],
    });
  }

  // Short fanned tail.
  const tail = b.chain("tail", catmull([[0, 0.24, -0.03], [0, 0.14, -0.1], [0, 0.04, -0.14]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });
  b.sweep(tail, (t: number) => [0.045 * (1 - 0.4 * t), 0.018], { color: WING });

  // Legs with feet and claws.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.06, 0.16, 0],
        [s * 0.07, 0.08, 0.01],
        [s * 0.07, 0.03, 0.02],
      ]),
      {
        parent: hips,
        names: [`thigh${side}`, `shin${side}`],
        role: "leg",
      },
    );
    b.sweep(leg, 0.017, { color: LEG });

    const ankle = leg.joints[1];
    const F: [number, number, number] = [s * 0.07, 0.02, 0.02];
    const toeTips: [number, number, number][] = [
      [s * 0.07 - 0.025, 0.01, 0.1],
      [s * 0.07, 0.01, 0.105],
      [s * 0.07 + 0.025, 0.01, 0.1],
      [s * 0.07, 0.01, -0.03],
    ];
    for (const tip of toeTips) {
      b.capsule(F, tip, 0.011, { color: LEG, bone: ankle });
      b.spike(tip, [0, -0.15, 1], 0.014, 0.004, { color: CLAW, bone: ankle });
    }
  }

  return b.root;
}
```