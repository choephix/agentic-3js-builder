```ts
import * as THREE from "three";
import { createBuilder, scales } from "agentic-3js-builder";

export const meta = {
  name: "Green sea turtle",
  description:
    "A green sea turtle gliding low over the seabed: heart-shaped olive and caramel shell, pale plastron, wide front flippers, short rear flippers and a remora riding under the shell.",
};

// Heart-shaped carapace seen from above (x across, z forward). The notch at the front and the tail tip stay sharp.
const SHELL: Array<[number, number] | [number, number, "sharp"]> = [
  [0, 0.34, "sharp"],
  [0.22, 0.44],
  [0.4, 0.36],
  [0.44, 0.1],
  [0.36, -0.2],
  [0.18, -0.46],
  [0, -0.56, "sharp"],
  [-0.18, -0.46],
  [-0.36, -0.2],
  [-0.44, 0.1],
  [-0.4, 0.36],
  [-0.22, 0.44],
];

// Pale belly plate, a smaller heart under the shell.
const PLASTRON: Array<[number, number] | [number, number, "sharp"]> = [
  [0, 0.4, "sharp"],
  [0.26, 0.36],
  [0.3, 0.1],
  [0.24, -0.2],
  [0, -0.42, "sharp"],
  [-0.24, -0.2],
  [-0.3, 0.1],
  [-0.26, 0.36],
];

// Front flipper outline in the plane y = 0.1 (left side, +X).
const FLIPPER: number[][] = [
  [0.18, 0.1, 0.26],
  [0.36, 0.1, 0.36],
  [0.56, 0.1, 0.38],
  [0.76, 0.1, 0.26],
  [0.8, 0.1, 0.14],
  [0.6, 0.1, 0.06],
  [0.36, 0.1, 0.02],
  [0.18, 0.1, 0.1],
];

// Short rear paddle outline (left side).
const PADDLE: number[][] = [
  [0.14, 0.1, -0.14],
  [0.3, 0.1, -0.2],
  [0.36, 0.1, -0.32],
  [0.26, 0.1, -0.4],
  [0.12, 0.1, -0.3],
];

const mirror = (points: number[][], s: number) => points.map(([x, y, z]) => [x * s, y, z]);

export default function seaTurtle() {
  const b = createBuilder({ name: "green-sea-turtle" });

  // Skeleton: body root, neck to head, jaw, front and rear flippers.
  b.joint("body", { at: [0, 0.1, 0] });

  const neck = b.chain(
    "neck",
    [
      [0, 0.12, 0.3],
      [0, 0.17, 0.48],
      [0, 0.2, 0.6],
    ],
    { parent: "body", role: "neck", names: ["neck1", "neck2", "head"] },
  );

  b.joint("jaw", { parent: "head", at: [0, 0.165, 0.66], dir: [0, 0, 1], role: "jaw" });

  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    b.chain(
      `arm${side}`,
      [
        [0.18 * s, 0.1, 0.18],
        [0.46 * s, 0.1, 0.26],
        [0.74 * s, 0.1, 0.2],
      ],
      { parent: "body", role: "arm", names: [`arm${side}1`, `arm${side}2`, `wrist${side}`] },
    );
    b.joint(`hip${side}`, { parent: "body", at: [0.14 * s, 0.1, -0.2], role: "leg" });
  }

  // Shell: heart outline, olive and caramel scutes traced in dark brown, rounded rim.
  const shellPaint = scales(["#7d7c34", "#b8803f"], "#4a2c14", { size: 0.2, width: 0.16, seed: 3 });
  b.extrude(SHELL, {
    name: "shell",
    color: shellPaint,
    at: [0, 0.2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.1, 0.16],
    bevel: 0.05,
    smoothing: 1,
    bone: "body",
  });

  // Pale yellow belly plate; its underside sits on the floor.
  b.extrude(PLASTRON, {
    name: "plastron",
    color: "#ece0a0",
    at: [0, 0.03, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    bevel: 0.02,
    smoothing: 1,
    bone: "body",
  });

  // Body mass between shell and plastron, visible at the flanks.
  b.part(new THREE.SphereGeometry(1, b.segments(16), b.segments(10)), "#67793a", {
    name: "torso",
    at: [0, 0.1, 0],
    scale: [0.3, 0.09, 0.44],
    bone: "body",
  });

  // Neck tube and head: a blunt head with cream-edged scales.
  b.sweep(neck, [0.085, 0.07], { color: "#6e8b3d", name: "neck" });
  b.part(new THREE.SphereGeometry(0.1, b.segments(14), b.segments(10)), scales(["#6e8b3d", "#5b7a33"], "#efe6b8", {
    size: 0.035,
    width: 0.25,
  }), {
    name: "head",
    bone: "head",
    scale: [1, 0.85, 1.15],
  });

  // Dark wise eyes with a small cream highlight.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 10, 8), "#14110d", {
      name: s > 0 ? "eyeL" : "eyeR",
      bone: "head",
      at: [0.07 * s, 0.225, 0.655],
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 5), "#fff6d8", {
      name: s > 0 ? "glintL" : "glintR",
      bone: "head",
      at: [0.078 * s, 0.232, 0.668],
    });
  }

  // Gentle beak: a dark upper beak over a pale lower jaw that opens on its own joint.
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.1), "#4b5a2a", {
    name: "beakUpper",
    bone: "head",
    at: [0, 0.185, 0.7],
  });
  b.part(new THREE.BoxGeometry(0.06, 0.022, 0.09), "#d8c98a", {
    name: "beakLower",
    bone: "jaw",
    at: [0, 0.162, 0.7],
  });

  // Front flippers, spread wide: a chain for the rig, a flat blade on it.
  const flipperPaint = scales(["#5b7a35", "#4d6b2d"], "#3a4f22", { size: 0.12, width: 0.1, seed: 7 });
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    b.slab(mirror(FLIPPER, s), {
      name: `flipper${side}`,
      color: flipperPaint,
      thickness: 0.025,
      bone: `arm${side}1`,
    });
  }

  // Short rear paddles.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    b.slab(mirror(PADDLE, s), {
      name: `paddle${side}`,
      color: "#5b7a35",
      thickness: 0.02,
      bone: `hip${side}`,
    });
  }

  // Tail: a short tapering stub out from under the back of the shell.
  b.sweep(
    [
      [0, 0.1, -0.5],
      [0, 0.09, -0.66],
      [0, 0.08, -0.8],
    ],
    [0.045, 0.015],
    { color: "#5f7a3a", name: "tail", bone: "body" },
  );

  // Remora riding under the shell's flank: a tapered body, a sucker disc pressed to the shell, and a small tail fin.
  b.sweep(
    [
      [-0.33, 0.1, 0.22],
      [-0.34, 0.085, 0.0],
      [-0.33, 0.08, -0.28],
    ],
    [0.04, 0.012],
    { color: "#4e4b3e", name: "remoraBody", bone: "body" },
  );
  b.part(new THREE.SphereGeometry(1, 12, 6), "#2f2d26", {
    name: "remoraDisc",
    at: [-0.33, 0.125, 0.2],
    scale: [0.06, 0.008, 0.035],
    bone: "body",
  });
  b.slab(
    [
      [-0.33, 0.085, -0.26],
      [-0.33, 0.14, -0.4],
      [-0.33, 0.08, -0.36],
    ],
    { name: "remoraTail", color: "#4e4b3e", thickness: 0.006, bone: "body" },
  );

  return b.root;
}
```