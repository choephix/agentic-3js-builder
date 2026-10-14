```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "A candy-pink flamingo standing tall in shallow water: coral wings with black flight-feather tips, an S-curved neck, a bent pale beak with a black tip, pale yellow eyes and long rose legs with knobbly knees and webbed feet.",
};

const PINK = gradient("#ffb8cc", "#ff9fb4", [0, 0.8, -0.25], [0, 1.0, 0.2]);
const CORAL = gradient("#ff9d86", "#ff5b4a", [0, 1.0, 0.12], [0, 0.9, -0.36]);
const HEAD = "#ffc6d8";
const BLACK = "#1b1b20";
const LEG = "#e8708e";
const EYE = "#f6ec8c";
const WATER = "#8fd3df";
// Pale pink beak that darkens to black over its last few centimetres.
const BEAK = paint((p) => mix("#ffc3d0", "#141414", smoothstep(0.39, 0.43, p.z)));

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", paintSize: 1024 });

  // Body: the spine root, with the trunk as one smooth loft.
  const body = b.joint("body", { at: [0, 0.92, 0] });
  b.loft(
    [
      { at: [0, 0.9, -0.24], w: 0.16, h: 0.17 },
      { at: [0, 0.93, -0.02], w: 0.3, h: 0.28 },
      { at: [0, 0.99, 0.17], w: 0.2, h: 0.22 },
    ],
    { color: PINK, bone: body },
  );

  // Tail: a short upturned fan.
  b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.08, 0.14],
      [0, 0.19],
      [-0.08, 0.14],
    ],
    { name: "tail", color: PINK, at: [0, 0.98, -0.25], x: [1, 0, 0], y: [0, 1, -0.5], thickness: 0.03, bone: body },
  );

  // Neck: an S-curve, skinned as one tube; its tip joint is the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.14],
      [0, 1.16, 0.29],
      [0, 1.34, 0.17],
      [0, 1.46, 0.24],
    ]),
    { parent: body, role: "neck", names: ["neck1", "neck2", "neck3", "head"] },
  );
  b.sweep(neck, (t) => 0.042 - 0.02 * t, { color: PINK, sides: 8 });

  // Head and eyes.
  b.part(new THREE.SphereGeometry(0.062, b.segments(10), b.segments(8)), HEAD, {
    at: [0, 1.47, 0.23],
    bone: "head",
    scale: [1, 0.95, 1.2],
  });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.017, 10, 8), EYE, { at: [sx * 0.05, 1.48, 0.22], bone: "head" });
    b.part(new THREE.SphereGeometry(0.008, 8, 6), BLACK, { at: [sx * 0.062, 1.48, 0.22], bone: "head" });
  }

  // Bent beak: a fixed upper mandible and a hinged lower one.
  const jaw = b.joint("jaw", { parent: "head", at: [0, 1.43, 0.27], dir: [0, 0, 1], role: "jaw" });
  b.sweep(
    catmull([
      [0, 1.47, 0.27],
      [0, 1.46, 0.38],
      [0, 1.41, 0.45],
      [0, 1.34, 0.43],
    ]),
    (t) => [0.024 - 0.01 * t, 0.017 - 0.008 * t],
    { color: BEAK, bone: "head", sides: 8, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 1.43, 0.28],
      [0, 1.41, 0.37],
      [0, 1.37, 0.42],
      [0, 1.33, 0.4],
    ]),
    (t) => [0.018 - 0.008 * t, 0.011 - 0.005 * t],
    { color: BEAK, bone: jaw, sides: 8, name: "beakLower" },
  );

  // Wings: coral plumes with black flight-feather tips, mirrored.
  const wing = (sx: number) => {
    b.extrude(
      [
        [0.16, 0.1],
        [-0.08, 0.12],
        [-0.26, 0.06],
        [-0.34, -0.02],
        [-0.3, -0.07],
        [-0.14, -0.05],
        [0.02, -0.08],
        [0.16, -0.04],
      ],
      { name: "wing", color: CORAL, at: [sx * 0.15, 0.95, 0], thickness: 0.02, bone: body },
    );
    b.extrude(
      [
        [-0.2, -0.02],
        [-0.34, -0.02],
        [-0.3, -0.07],
        [-0.2, -0.07],
      ],
      { name: "wingTip", color: BLACK, at: [sx * 0.163, 0.95, 0], thickness: 0.012, bone: body },
    );
  };
  wing(1);
  wing(-1);

  // Legs: long rose legs with a backward knee, knobbly joints and webbed feet.
  for (const [sx, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [sx * 0.09, 0.84, -0.02],
        [sx * 0.09, 0.46, -0.12],
        [sx * 0.09, 0.13, 0.02],
        [sx * 0.09, 0.03, 0.1],
      ]),
      {
        parent: body,
        role: "leg",
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      },
    );
    b.sweep(leg, (t) => 0.021 - 0.009 * t, { color: LEG, sides: 6 });
    b.part(new THREE.SphereGeometry(0.026, 10, 8), LEG, { at: [sx * 0.09, 0.46, -0.12], bone: `knee${side}` });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), LEG, { at: [sx * 0.09, 0.13, 0.02], bone: `ankle${side}` });

    // Webbed foot: a flat fan lying on the floor.
    b.extrude(
      [
        [-0.02, -0.02],
        [-0.06, 0.03],
        [-0.05, 0.07],
        [0, 0.09],
        [0.05, 0.07],
        [0.06, 0.03],
        [0.02, -0.02],
      ],
      {
        name: `foot${side}`,
        color: LEG,
        at: [sx * 0.09, 0.006, 0.07],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bone: `toe${side}`,
      },
    );
  }

  // Shallow water the feet stand in.
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.012, b.segments(24)), WATER, {
    at: [0, 0.006, 0.05],
    bone: body,
    name: "water",
  });

  return b.root;
}
```