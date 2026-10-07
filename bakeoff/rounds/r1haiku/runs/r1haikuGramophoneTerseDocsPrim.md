```ts
import * as THREE from "three";
import { createBuilder, catmull, grain } from "agentic-3js-builder";

const WOOD_A = "#8a5a2b";
const WOOD_B = "#5a3518";
const BRASS = "#d4a33a";
const BRASS_DARK = "#9c7424";
const BLACK = "#1b1b1d";
const FELT = "#2e5e4a";
const RED = "#b3262e";
const CREAM = "#efe3c4";

export const meta = {
  name: "gramophone",
  description: "A wind-up gramophone: wooden cabinet, brass turntable, flared horn and tonearm, on a record.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // Skeleton: cabinet root, horn and tonearm joints.
  const base = b.joint("base", { at: [0, 0, 0] });
  const neck = [0, 0.11, -0.13];
  const hornAt = [0, 0.27, -0.11];
  const hornDir = [0, 0.6, 0.8]; // up and forward, unit length
  const horn = b.joint("horn", { parent: base, at: hornAt, dir: hornDir });

  const pivot = [0.15, 0.13, -0.12];
  const P0 = pivot;
  const P1 = [0.15, 0.17, -0.06];
  const P2 = [0.13, 0.16, 0.02];
  const P3 = [0.11, 0.14, 0.08];
  const arm = b.joint("tonearm", { parent: base, at: P0, aim: P1 });

  // Cabinet: wood box standing on the floor, with grain.
  b.part(new THREE.BoxGeometry(0.36, 0.11, 0.34), grain(WOOD_A, WOOD_B, { size: 0.05, axis: "x" }), {
    bone: base,
    at: [0, 0.055, 0],
  });

  // Brass corner plates.
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.03, 0.022, 0.03), BRASS_DARK, {
        bone: base,
        at: [sx * 0.165, 0.1, sz * 0.155],
      });

  // Turntable: brass plate, felt mat, record, centre label and spindle.
  const tt = [0, 0.116, 0.02];
  b.part(new THREE.CylinderGeometry(0.135, 0.14, 0.012, 28), BRASS, { bone: base, at: tt });
  b.part(new THREE.CylinderGeometry(0.128, 0.128, 0.004, 28), FELT, { bone: base, at: [0, 0.124, 0.02] });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.004, 32), BLACK, { bone: base, at: [0, 0.128, 0.02] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.003, 20), RED, { bone: base, at: [0, 0.1315, 0.02] });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.038, 8), BRASS, { bone: base, at: [0, 0.151, 0.02] });

  // Crank on the right side of the cabinet.
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), BRASS, {
    bone: base,
    at: [0.185, 0.06, -0.14],
    dir: [1, 0, 0],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8), BRASS_DARK, {
    bone: base,
    at: [0.205, 0.06, -0.14],
    dir: [1, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), RED, { bone: base, at: [0.235, 0.06, -0.14] });

  // Neck pipe from the cabinet up to the horn.
  b.rod(neck, hornAt, 0.016, { bone: horn, color: BRASS });

  // Flared horn: a shell lathed around the horn axis.
  b.lathe(
    [
      [0, 0],
      [0.025, 0],
      [0.2, 0.42, "sharp"],
      [0.18, 0.42, "sharp"],
      [0.012, 0.03],
      [0, 0.03],
    ],
    { at: hornAt, axis: hornDir, segments: 16, bone: horn, color: BRASS },
  );

  // Red banding ring around the flare.
  b.part(new THREE.TorusGeometry(0.108, 0.008, 6, 20), RED, {
    bone: horn,
    at: [0, 0.27 + 0.2 * hornDir[1], -0.11 + 0.2 * hornDir[2]],
    dir: hornDir,
    axis: "z",
  });

  // Tonearm: pivot post, curved arm, head and stylus.
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 10), BRASS_DARK, {
    bone: base,
    at: [pivot[0], pivot[1] - 0.02, pivot[2]],
  });
  b.sweep(catmull([P0, P1, P2, P3]), 0.007, { bone: arm, color: BRASS });
  b.part(new THREE.BoxGeometry(0.035, 0.014, 0.03), BRASS_DARK, { bone: arm, at: P3 });
  b.part(new THREE.CylinderGeometry(0.004, 0.003, 0.012, 6), BLACK, {
    bone: arm,
    at: [P3[0], P3[1] - 0.008, P3[2]],
  });

  return b.root;
}
```