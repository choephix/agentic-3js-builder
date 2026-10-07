```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Toucan",
  description: "Stylized toucan with a big striped orange beak, white bib and blue eye patch, standing on two feet.",
};

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.2, -0.02] });
  const spine = b.joint("spine", { at: [0, 0.3, 0.0], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.05], parent: spine });
  const head = b.joint("head", { at: [0, 0.45, 0.09], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.41, 0.13], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.2, -0.15], parent: hips });
  const hipL = b.joint("hipL", { at: [0.05, 0.18, 0], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.05, 0.18, 0], parent: hips });
  const wingL = b.joint("wingL", { at: [0.1, 0.33, -0.02], parent: spine });
  const wingR = b.joint("wingR", { at: [-0.1, 0.33, -0.02], parent: spine });

  const BLACK = "#16161c";
  const WHITE = "#f6f2e4";
  const YELLOW = "#f5d33a";
  const ORANGE = "#f08a1c";
  const RED = "#d8302a";
  const BLUE = "#4fb4e0";
  const GREY = "#6f7f93";

  // Body
  b.part(new THREE.SphereGeometry(1, 10, 8), BLACK, { at: [0, 0.27, -0.03], scale: [0.115, 0.17, 0.14], bone: spine });
  // Bib
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, { at: [0, 0.34, 0.06], scale: [0.085, 0.1, 0.07], bone: spine });
  b.part(new THREE.SphereGeometry(1, 8, 6), YELLOW, { at: [0, 0.4, 0.085], scale: [0.07, 0.04, 0.045], bone: neck });
  // Red undertail patch
  b.part(new THREE.SphereGeometry(1, 8, 6), RED, { at: [0, 0.14, -0.1], scale: [0.06, 0.04, 0.05], bone: hips });
  // Head
  b.part(new THREE.SphereGeometry(1, 10, 8), BLACK, { at: [0, 0.45, 0.08], scale: [0.085, 0.085, 0.095], bone: head });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUE, { at: [s * 0.062, 0.47, 0.13], scale: [0.03, 0.04, 0.04], bone: head });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#ffffff", { at: [s * 0.078, 0.475, 0.14], scale: [0.012, 0.016, 0.016], bone: head });
    b.part(new THREE.SphereGeometry(1, 6, 5), BLACK, { at: [s * 0.085, 0.475, 0.145], scale: [0.007, 0.01, 0.01], bone: head });
  }

  // Beak: upper
  b.spike([0, 0.45, 0.12], [0, 0.385, 0.42], null, 0.058, { bone: head });
  b.spike([0, 0.47, 0.13], [0, 0.42, 0.36], null, 0.04, { bone: head });
  // yellow band at base
  b.part(new THREE.SphereGeometry(1, 8, 6), YELLOW, { at: [0, 0.45, 0.17], scale: [0.045, 0.05, 0.03], bone: head });
  // black tip
  b.spike([0, 0.395, 0.34], [0, 0.378, 0.44], null, 0.03, { bone: head });
  // red/orange stripe
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), RED, { at: [0, 0.42, 0.19], bone: head });
  // Beak: lower
  b.spike([0, 0.41, 0.12], [0, 0.35, 0.38], null, 0.04, { bone: jaw });
  b.spike([0, 0.36, 0.33], [0, 0.348, 0.4], null, 0.022, { bone: jaw });

  // Wings
  for (const [s, j] of [[1, wingL], [-1, wingR]] as const) {
    b.part(new THREE.SphereGeometry(1, 8, 6), "#23232b", { at: [s * 0.12, 0.26, -0.05], scale: [0.03, 0.15, 0.1], bone: j });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#2e2e38", { at: [s * 0.13, 0.15, -0.08], scale: [0.02, 0.07, 0.05], bone: j });
  }

  // Tail
  b.spike([0, 0.2, -0.12], [0, 0.04, -0.32], null, 0.06, { bone: tail1 });
  b.spike([0, 0.18, -0.12], [0, 0.07, -0.28], null, 0.045, { bone: tail1 });

  // Legs and feet
  for (const [s, j] of [[1, hipL], [-1, hipR]] as const) {
    b.spike([s * 0.05, 0.18, 0], [s * 0.05, 0.02, 0.01], null, 0.018, { bone: j });
    for (const toe of [-1, 0, 1]) {
      b.spike([s * 0.05, 0.015, 0.01], [s * 0.05 + toe * 0.025, 0.006, 0.08], null, 0.01, { bone: j });
    }
    b.spike([s * 0.05, 0.015, 0.01], [s * 0.05, 0.006, -0.05], null, 0.01, { bone: j });
  }
  // fix color of legs
  void GREY; void ORANGE;

  return b.root;
}
```