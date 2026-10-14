```ts
import * as THREE from "three";
import { countershade, createBuilder, scales } from "agentic-3js-builder";

export const meta = {
  name: "Sea turtle",
  description: "A green sea turtle at rest: domed olive shell with scute pattern, pale plastron, paddle flippers, hooked beak and a short tail. About 1 m across the carapace, facing +Z.",
};

// Front flipper blade, in the outline's own (u along the arm, v across it) meters.
const FRONT_FLIPPER: [number, number][] = [
  [0, -0.07],
  [0.18, -0.13],
  [0.4, -0.11],
  [0.58, -0.03],
  [0.66, 0.02],
  [0.5, 0.09],
  [0.22, 0.1],
  [0, 0.07],
];

// Rear flipper blade: smaller and rounder.
const REAR_FLIPPER: [number, number][] = [
  [0, -0.05],
  [0.14, -0.09],
  [0.28, -0.07],
  [0.36, 0],
  [0.26, 0.06],
  [0.1, 0.07],
  [0, 0.05],
];

export default function seaTurtle() {
  const b = createBuilder({ name: "sea-turtle", detail: 1, paintSize: 1024 });

  // Paints: a countershaded green-and-cream skin, and an olive shell covered in scutes.
  const skin = countershade("#5f7a3c", "#e6d7a0", { level: -0.1, soft: 0.4 });
  const shell = scales(["#58682b", "#6c7c33", "#4a5a24"], "#2a3216", { size: 0.12, width: 0.16, seed: 4 });
  const belly = "#e8d9a4";
  const beak = "#d9c27a";
  const dark = "#1d2419";
  const white = "#f4f1e6";

  // Skeleton.
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });
  const neck = b.joint("neck", { parent: body, at: [0, 0.2, 0.36], aim: [0, 0.165, 0.56], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.165, 0.56], aim: [0, 0.16, 0.7], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.14, 0.62], dir: [0, 0, 1], role: "jaw" });

  const shoulderL = b.joint("shoulderL", { parent: body, at: [0.2, 0.16, 0.2], role: "arm" });
  const shoulderR = b.joint("shoulderR", { parent: body, at: [-0.2, 0.16, 0.2], role: "arm" });
  const hipL = b.joint("hipL", { parent: body, at: [0.2, 0.1, -0.3], role: "leg" });
  const hipR = b.joint("hipR", { parent: body, at: [-0.2, 0.1, -0.3], role: "leg" });

  const tail1 = b.joint("tail1", { parent: body, at: [0, 0.14, -0.45], role: "tail" });
  const tail2 = b.joint("tail2", { parent: tail1, at: [0, 0.12, -0.6], role: "tail" });

  // Shell: a flattened dome sitting on the ground (its lowest point is y = 0).
  b.part(new THREE.SphereGeometry(1, 14, 9), shell, {
    bone: body,
    at: [0, 0.2, 0],
    scale: [0.42, 0.2, 0.5],
  });

  // Plastron: the pale belly plate, flaring out past the shell's underside.
  b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.04, 12), belly, {
    bone: body,
    at: [0, 0.03, 0],
    scale: [1, 1, 1.3],
  });

  // Neck and head.
  b.capsule([0, 0.2, 0.34], [0, 0.165, 0.55], [0.1, 0.075], { color: skin, bone: neck, name: "neck" });
  b.part(new THREE.SphereGeometry(0.1, 14, 10), skin, {
    bone: head,
    at: [0, 0.165, 0.6],
    scale: [0.85, 0.8, 1.25],
  });

  // Hooked beak: a cone for the upper jaw, a box for the lower.
  b.part(new THREE.ConeGeometry(0.055, 0.08, 10), beak, {
    bone: head,
    at: [0, 0.158, 0.7],
    aim: [0, 0.15, 0.8],
  });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.13), beak, {
    bone: jaw,
    at: [0, 0.135, 0.66],
  });

  // Eyes, set high on the sides of the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), white, {
      bone: head,
      at: [s * 0.075, 0.18, 0.6],
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), dark, {
      bone: head,
      at: [s * 0.092, 0.182, 0.6],
    });
  }

  // Front flippers: long paddles, outstretched and drooping slightly.
  for (const [side, shoulder] of [
    [1, shoulderL],
    [-1, shoulderR],
  ] as const) {
    b.extrude(FRONT_FLIPPER, {
      name: side > 0 ? "flipperFrontL" : "flipperFrontR",
      color: skin,
      at: [side * 0.2, 0.16, 0.2],
      x: [side * 0.9, -0.15, -0.25],
      y: [0, 0, 1],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      bone: shoulder,
    });
  }

  // Rear flippers: shorter, swept back.
  for (const [side, hip] of [
    [1, hipL],
    [-1, hipR],
  ] as const) {
    b.extrude(REAR_FLIPPER, {
      name: side > 0 ? "flipperRearL" : "flipperRearR",
      color: skin,
      at: [side * 0.2, 0.1, -0.3],
      x: [side * 0.6, -0.05, -0.8],
      y: [0, 0, 1],
      thickness: 0.025,
      bevel: 0.006,
      smoothing: 1,
      bone: hip,
    });
  }

  // Tail: a short, tapering stub in two segments.
  b.capsule([0, 0.15, -0.4], [0, 0.13, -0.55], [0.05, 0.035], { color: skin, bone: tail1, name: "tail1" });
  b.capsule([0, 0.13, -0.55], [0, 0.115, -0.66], [0.035, 0.012], { color: skin, bone: tail2, name: "tail2" });

  return b.root;
}
```