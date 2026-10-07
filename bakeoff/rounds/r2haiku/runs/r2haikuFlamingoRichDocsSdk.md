```ts
import * as THREE from "three";
import { createBuilder, limb, gradient, countershade, catmull, bezier } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Greater flamingo",
  description: "A standing flamingo in shallow water: candy-pink body, coral wings with black flight-feather tips, S-neck, bent two-tone beak, webbed rose legs.",
};

const PINK = "#ff8fb8";
const BELLY = "#ffc9de";
const CORAL = "#ff6b5e";
const ROSE = "#e35d86";
const BEAK = "#ffc2d1";
const BLACK = "#1c1b22";
const YELLOW = "#f3ef9a";
const WATER = "#9fe3dc";
const RIPPLE = "#d8f8f3";

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Root sits in the body, in the middle of the hips.
  const hips = b.joint("hips", { at: [0, 0.9, -0.1] });

  // Body: tail at the back, chest at the front. Joints: tail, back, chest.
  const bodyPath = catmull([
    [0, 0.9, -0.36],
    [0, 0.92, -0.14],
    [0, 0.96, 0.06],
    [0, 1.02, 0.24],
  ]);
  const spine = b.chain("spine", bodyPath, { parent: hips, names: ["tail", "back", "chest"], role: "spine" });
  b.sweep(spine, [0.05, 0.14, 0.17, 0.14, 0.1], {
    color: countershade(PINK, BELLY, { level: 0 }),
  });

  // Tail plume: a flat coral fan at the rear.
  b.extrude(
    [
      [-0.06, 0],
      [0.06, 0],
      [0.09, -0.1],
      [0, -0.17],
      [-0.09, -0.1],
    ],
    { at: [0, 0.93, -0.3], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.012, bevel: 0.003, color: CORAL, bone: spine.joints[0] },
  );

  // S-curved neck, rising from the chest, bending back, then forward into the head.
  const neckPath = catmull([
    [0, 1.0, 0.24],
    [0, 1.18, 0.34],
    [0, 1.34, 0.26],
    [0, 1.42, 0.3],
    [0, 1.5, 0.4],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3", "neck4", "head"],
    role: "neck",
  });
  b.sweep(neck, [0.065, 0.045, 0.036, 0.035, 0.04], { color: PINK });

  // Head: the neck's tip joint.
  const head = neck.joints[neck.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.062, 10, 8), PINK, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.01 }),
    scale: [1, 0.95, 1.25],
  });

  // Pale yellow eyes with dark pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 8, 6), YELLOW, {
      bone: head,
      at: head.local({ left: s * 0.057, up: 0.022, forward: 0.02 }),
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 5), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.072, up: 0.022, forward: 0.02 }),
    });
  }

  // Bent beak: pale pink base, black tip.
  const beakPath = bezier(
    head.local({ forward: 0.03, up: -0.005 }),
    head.local({ forward: 0.13, up: -0.01 }),
    head.local({ forward: 0.2, up: -0.05 }),
    head.local({ forward: 0.2, up: -0.12 }),
  );
  b.sweep(beakPath, (t: number) => [0.026 - 0.012 * t, 0.018 - 0.008 * t], {
    bone: head,
    color: BEAK,
    bands: [
      [0.72, BEAK],
      [1, BLACK],
    ],
  });

  // Wings folded along the flanks: coral coverts, black flight-feather tips.
  const wingOutline: OutlinePoint[] = [
    [0, 0.02],
    [0.12, 0.07],
    [0.3, 0.075],
    [0.42, 0.04],
    [0.48, -0.02, "sharp"],
    [0.36, -0.05],
    [0.2, -0.08],
    [0.06, -0.05],
  ];
  const wingTip: OutlinePoint[] = [
    [0.3, 0.02],
    [0.42, 0.04],
    [0.48, -0.02, "sharp"],
    [0.36, -0.05],
    [0.24, -0.075],
  ];
  for (const s of [1, -1]) {
    const wingAt = [s * 0.15, 0.98, 0.1];
    const coral = gradient(PINK, CORAL, [0, 1.0, 0.12], [0, 0.92, -0.38]);
    b.extrude(wingOutline, {
      at: wingAt,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.006,
      smoothing: 1,
      color: coral,
      bone: spine.joints[1],
    });
    b.extrude(wingTip, {
      at: wingAt,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.044,
      bevel: 0.006,
      color: BLACK,
      bone: spine.joints[1],
    });
  }

  // Long rose legs: feathered thigh, bare tarsus bending backward at the knee, webbed feet.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.08, 0.86, -0.08];
    const foot = [s * 0.08, 0.03, 0.0];
    const pts = limb(hip, foot, [0.42, 0.45], [0, 0, -1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    b.sweep(leg, [0.03, 0.022, 0.014], {
      color: ROSE,
      bands: [
        [0.48, PINK],
        [1, ROSE],
      ],
    });

    // Knobbly knee.
    b.part(new THREE.SphereGeometry(0.03, 8, 6), ROSE, { bone: knee, at: knee.at });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), ROSE, {
      bone: knee,
      at: knee.local({ back: 0.012, up: 0.01 }),
    });

    // Three toes spreading forward, joined by a webbed slab.
    const toeL = ankle.local({ left: -0.085, forward: 0.07, up: -0.018 });
    const toeM = ankle.local({ forward: 0.12, up: -0.018 });
    const toeR = ankle.local({ left: 0.085, forward: 0.07, up: -0.018 });
    b.capsule(ankle, toeL, 0.011, { color: ROSE });
    b.capsule(ankle, toeM, 0.011, { color: ROSE });
    b.capsule(ankle, toeR, 0.011, { color: ROSE });
    b.slab(
      [
        ankle.at,
        toeL,
        ankle.local({ left: -0.045, forward: 0.085, up: -0.018 }),
        toeM,
        ankle.local({ left: 0.045, forward: 0.085, up: -0.018 }),
        toeR,
      ],
      { color: ROSE, thickness: 0.004, bone: ankle },
    );
  }

  // Shallow water pool the model stands in, with a couple of ripple rings.
  b.part(new THREE.CylinderGeometry(0.75, 0.75, 0.02, 28), WATER, { at: [0, 0, 0], bone: hips });
  const ringA = new THREE.RingGeometry(0.3, 0.33, 32).rotateX(-Math.PI / 2).translate(0.25, 0.013, -0.1);
  const ringB = new THREE.RingGeometry(0.45, 0.47, 36).rotateX(-Math.PI / 2).translate(-0.3, 0.013, 0.2);
  b.part(ringA, RIPPLE, { at: [0, 0, 0], bone: hips });
  b.part(ringB, RIPPLE, { at: [0, 0, 0], bone: hips });

  return b.root;
}
```