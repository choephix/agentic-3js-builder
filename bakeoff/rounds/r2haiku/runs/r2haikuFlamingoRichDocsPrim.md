```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, paint } from "agentic-3js-builder";

export const meta = {
  name: "flamingo",
  description: "A tall candy-pink flamingo standing in shallow water, with an S-curved neck, a bent bicoloured bill and long rose legs.",
};

const PINK = "#ffb6c9";
const PALE_PINK = "#ffd9e3";
const CORAL = "#ff6f5e";
const ROSE = "#e0517a";
const BLACK = "#1c1a1f";
const EYE = "#f5e663";
const PUPIL = "#15131a";
const WATER = "#8fdcea";
const FOAM = "#e8fbff";

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton: hips, body spine, S-curved neck, head and jaw.
  const hips = b.joint("hips", { at: [0, 0.96, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.3],
      [0, 1.06, -0.1],
      [0, 1.1, 0.06],
      [0, 1.14, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.2],
      [0, 1.3, 0.3],
      [0, 1.46, 0.22],
      [0, 1.57, 0.3],
      [0, 1.6, 0.42],
    ]),
    {
      parent: spine.joints[2],
      names: ["neck1", "neck2", "neck3", "neck4", "head"],
      role: "neck",
    },
  );
  const head = neck.joints[neck.joints.length - 1];
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.02 }),
    role: "jaw",
  });

  // Body and neck tubes: one continuous skin each.
  b.sweep(spine, (t) => 0.05 + 0.13 * Math.sin(Math.PI * (0.08 + 0.84 * t)), {
    color: PINK,
    sides: 10,
  });
  b.sweep(neck, (t) => 0.062 - 0.024 * t, { color: PINK, sides: 8 });

  // Head, eyes and bill.
  b.part(new THREE.SphereGeometry(0.065, 10, 8), PINK, { bone: head });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.05, forward: 0.035, up: 0.02 }),
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.058, forward: 0.046, up: 0.02 }),
    });
  }

  const billPaint = paint((_p, _n, s) => (s[0] > 0.6 ? BLACK : PALE_PINK));

  // Upper bill: arcs forward, then hooks down.
  b.sweep(
    bezier(
      head.local({ forward: 0.03, up: -0.01 }),
      head.local({ forward: 0.09, up: -0.02 }),
      head.local({ forward: 0.13, up: -0.06 }),
      head.local({ forward: 0.11, up: -0.1 }),
    ),
    [0.02, 0.008],
    { bone: head, color: billPaint },
  );

  // Lower mandible on the jaw joint, so the mouth can open.
  b.sweep(
    bezier(
      head.local({ forward: 0.03, up: -0.03 }),
      head.local({ forward: 0.09, up: -0.05 }),
      head.local({ forward: 0.12, up: -0.085 }),
      head.local({ forward: 0.1, up: -0.1 }),
    ),
    [0.014, 0.006],
    { bone: jaw, color: billPaint },
  );

  // Wings: flank-hugging extrusions in the side plane, coral deepening to black tips.
  const wingPaint = paint((_p, _n, s) => (s[0] < -0.22 ? BLACK : s[0] < -0.02 ? CORAL : PINK));
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.2, -0.02],
        [0.12, 0.1],
        [-0.05, 0.14],
        [-0.22, 0.08],
        [-0.36, 0.0, "sharp"],
        [-0.2, -0.08],
        [0.0, -0.12],
        [0.14, -0.08],
      ],
      {
        at: [s * 0.13, 1.1, -0.05],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.004,
        smoothing: 1,
        color: wingPaint,
        bone: spine.joints[1],
      },
    );
  }

  // Legs: digitigrade, knobbly knees and hocks, webbed feet.
  const webOutline: [number, number][] = [
    [0, -0.03],
    [-0.08, 0.04],
    [-0.05, 0.1],
    [0, 0.06],
    [0.05, 0.1],
    [0.08, 0.04],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.07, 0.94, -0.02],
      [s * 0.06, 0.02, 0.1],
      [0.24, 0.34, 0.36],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const knee = leg.joints[1];
    const hock = leg.joints[2];
    const foot = leg.joints[3];

    b.sweep(leg, [0.024, 0.012], { color: ROSE, sides: 6 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), ROSE, { bone: knee });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), ROSE, { bone: hock });

    b.extrude(webOutline, {
      at: [s * 0.06, 0.018, 0.1],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.008,
      color: ROSE,
      bone: foot,
    });

    // Ripple ring where the foot meets the water.
    b.part(new THREE.TorusGeometry(0.09, 0.006, 5, 14), FOAM, {
      at: [s * 0.06, 0.042, 0.05],
      rotation: [90, 0, 0],
    });
  }

  // Shallow water pool: its bottom sits on y = 0, feet stand inside it.
  b.part(new THREE.CylinderGeometry(0.9, 0.9, 0.04, 20), WATER, { at: [0, 0.02, 0] });

  return b.root;
}
```