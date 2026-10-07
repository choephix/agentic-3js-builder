```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Penguin",
  description: "A stylized standing penguin built from primitives, with rigged flippers, feet, head and jaws.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.3, 0] });
  const spine = b.joint("spine", { at: [0, 0.45, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.64, 0.02], parent: spine });
  const head = b.joint("head", { at: [0, 0.72, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.72, 0.1], parent: head });
  const shoulderL = b.joint("shoulderL", { at: [0.15, 0.55, 0], parent: spine });
  const shoulderR = b.joint("shoulderR", { at: [-0.15, 0.55, 0], parent: spine });
  const hipL = b.joint("hipL", { at: [0.07, 0.12, 0], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.07, 0.12, 0], parent: hips });
  const footL = b.joint("footL", { at: [0.07, 0.02, 0.03], parent: hipL });
  const footR = b.joint("footR", { at: [-0.07, 0.02, 0.03], parent: hipR });
  const tail = b.joint("tail1", { at: [0, 0.14, -0.14], parent: hips });

  const BLACK = "#1b1f2a";
  const SLATE = "#2c3445";
  const WHITE = "#f4f4ef";
  const ORANGE = "#f08a1c";
  const YELLOW = "#f7c531";
  const sph = new THREE.SphereGeometry(1, 10, 8);
  const cone = new THREE.ConeGeometry(1, 1, 6);
  const box = new THREE.BoxGeometry(1, 1, 1);

  // Body
  b.part(sph, BLACK, { at: [0, 0.36, -0.01], bone: spine, scale: [0.18, 0.31, 0.17] });
  b.part(sph, WHITE, { at: [0, 0.35, 0.04], bone: spine, scale: [0.145, 0.27, 0.13] });
  b.part(sph, SLATE, { at: [0, 0.4, -0.06], bone: spine, scale: [0.15, 0.25, 0.12] });
  // Tail wedge
  b.part(cone, BLACK, { at: [0, 0.1, -0.18], bone: tail, scale: [0.07, 0.16, 0.04], dir: [0, -0.5, -1] });

  // Head
  b.part(sph, BLACK, { at: [0, 0.73, 0.03], bone: head, scale: [0.105, 0.1, 0.105] });
  b.part(sph, YELLOW, { at: [0, 0.65, 0.07], bone: neck, scale: [0.07, 0.04, 0.05] });
  b.part(sph, WHITE, { at: [0.045, 0.72, 0.085], bone: head, scale: [0.03, 0.04, 0.02] });
  b.part(sph, WHITE, { at: [-0.045, 0.72, 0.085], bone: head, scale: [0.03, 0.04, 0.02] });
  b.part(sph, "#000000", { at: [0.05, 0.725, 0.1], bone: head, scale: [0.012, 0.015, 0.01] });
  b.part(sph, "#000000", { at: [-0.05, 0.725, 0.1], bone: head, scale: [0.012, 0.015, 0.01] });

  // Beak: upper and lower
  b.part(cone, ORANGE, { at: [0, 0.72, 0.17], bone: head, scale: [0.032, 0.12, 0.022], dir: [0, -0.05, 1] });
  b.part(cone, "#d96d12", { at: [0, 0.695, 0.15], bone: jaw, scale: [0.026, 0.08, 0.014], dir: [0, -0.05, 1] });

  // Flippers
  b.part(sph, BLACK, { at: [0.19, 0.46, 0], bone: shoulderL, scale: [0.025, 0.15, 0.06], dir: [0.45, -1, 0] });
  b.part(sph, BLACK, { at: [-0.19, 0.46, 0], bone: shoulderR, scale: [0.025, 0.15, 0.06], dir: [-0.45, -1, 0] });

  // Legs and feet
  b.part(box, ORANGE, { at: [0.07, 0.07, 0.01], bone: hipL, scale: [0.04, 0.1, 0.04] });
  b.part(box, ORANGE, { at: [-0.07, 0.07, 0.01], bone: hipR, scale: [0.04, 0.1, 0.04] });
  for (const [side, bone] of [[1, footL], [-1, footR]] as const) {
    b.part(box, ORANGE, { at: [0.07 * side, 0.013, 0.07], bone, scale: [0.1, 0.026, 0.14] });
    for (const t of [-1, 0, 1]) {
      b.part(cone, "#d96d12", {
        at: [0.07 * side + t * 0.035, 0.013, 0.15], bone,
        scale: [0.018, 0.04, 0.012], dir: [t * 0.3, 0, 1],
      });
    }
  }

  return b.root;
}
```