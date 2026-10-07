```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

const INK = "#15181c";
const SNOW = "#f4f4f0";
const GOLD = "#f29a1f";
const BEAK = "#e8851a";

export const meta = {
  name: "penguin",
  description: "A stylised emperor-style penguin, primitive-built and rig-ready, about 0.75 m tall.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Skeleton: root at the hips, standing on y = 0.
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const chest = b.joint("chest", { at: [0, 0.4, 0], parent: hips });
  const head = b.joint("head", { at: [0, 0.64, 0.01], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.6, 0.09], parent: head });

  const wingL = b.joint("wingL", { at: [0.17, 0.46, 0], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.17, 0.46, 0], parent: chest });

  const tail = b.joint("tail1", { at: [0, 0.18, -0.14], parent: hips });

  const hipL = b.joint("hipL", { at: [0.07, 0.14, 0], parent: hips });
  const ankleL = b.joint("ankleL", { at: [0.07, 0.03, 0.02], parent: hipL });
  const hipR = b.joint("hipR", { at: [-0.07, 0.14, 0], parent: hips });
  const ankleR = b.joint("ankleR", { at: [-0.07, 0.03, 0.02], parent: hipR });

  // Torso: black back, white belly.
  b.part(new THREE.SphereGeometry(1, 18, 12), INK, {
    at: [0, 0.36, 0],
    bone: chest,
    scale: [0.19, 0.28, 0.18],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), SNOW, {
    at: [0, 0.33, 0.07],
    bone: chest,
    scale: [0.14, 0.22, 0.1],
  });

  // Head: black cap with a white face patch.
  b.part(new THREE.SphereGeometry(1, 16, 12), INK, {
    at: [0, 0.64, 0],
    bone: head,
    scale: [0.12, 0.12, 0.12],
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), SNOW, {
    at: [0, 0.64, 0.07],
    bone: head,
    scale: [0.095, 0.095, 0.06],
  });

  // Eyes: white with black pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SNOW, {
      at: [0.05 * s, 0.66, 0.1],
      bone: head,
      scale: [0.022, 0.022, 0.022],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
      at: [0.054 * s, 0.665, 0.118],
      bone: head,
      scale: [0.012, 0.012, 0.012],
    });
  }

  // Beak: pointed upper mandible on the head, flat lower mandible on the jaw.
  b.spike([0, 0.63, 0.11], [0, -0.03, 1], 0.1, 0.03);
  b.part(new THREE.BoxGeometry(0.045, 0.022, 0.08), BEAK, {
    at: [0, 0.6, 0.12],
    bone: jaw,
  });

  // Flippers: flattened black paddles hanging at the sides.
  b.part(new THREE.SphereGeometry(1, 12, 8), INK, {
    at: [0.22, 0.36, -0.01],
    bone: wingL,
    scale: [0.045, 0.2, 0.1],
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), INK, {
    at: [-0.22, 0.36, -0.01],
    bone: wingR,
    scale: [0.045, 0.2, 0.1],
  });

  // Legs and webbed feet.
  for (const [side, hip, ankle] of [
    [1, hipL, ankleL],
    [-1, hipR, ankleR],
  ] as const) {
    const x = 0.07 * side;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), GOLD, {
      at: [x, 0.08, 0],
      bone: hip,
    });
    b.part(new THREE.BoxGeometry(0.08, 0.03, 0.2), GOLD, {
      at: [x, 0.015, 0.07],
      bone: ankle,
    });
  }

  // Tail: a short black fan at the rear.
  b.part(new THREE.SphereGeometry(1, 10, 8), INK, {
    at: [0, 0.2, -0.2],
    bone: tail,
    scale: [0.06, 0.1, 0.04],
  });

  // Golden ear patches on the sides of the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), GOLD, {
      at: [0.1 * s, 0.67, 0.03],
      bone: head,
      scale: [0.03, 0.04, 0.035],
    });
  }

  return b.root;
}
```