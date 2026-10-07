```ts
import * as THREE from "three";
import { createBuilder, grain } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description: "A wind-up gramophone: walnut case, brass turntable with a record, tonearm, and a flared horn.",
};

export default function gramophone() {
  const b = createBuilder({ name: "gramophone" });

  // Bones: the case is the root, the tonearm hangs off it.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("arm", { at: [-0.15, 0.19, 0.12], parent: "base" });

  // Walnut case with a painted grain.
  const walnut = grain("#8a5a2b", "#4a2a12", { size: 0.05, axis: "x" });
  b.part(new THREE.BoxGeometry(0.36, 0.13, 0.36), walnut, { at: [0, 0.085, 0] });

  // Feet.
  for (const [x, z] of [
    [0.15, 0.15],
    [-0.15, 0.15],
    [0.15, -0.15],
    [-0.15, -0.15],
  ]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.02, b.segments(10)), "#1d1410", { at: [x, 0.01, z] });
  }

  // Brass turntable plate and spindle.
  const brass = "#c9a227";
  b.part(new THREE.CylinderGeometry(0.135, 0.14, 0.012, b.segments(28)), brass, { at: [0, 0.156, 0.02] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, b.segments(8)), brass, { at: [0, 0.166, 0.02] });

  // Record and its label.
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.004, b.segments(32)), "#151515", { at: [0, 0.1685, 0.02] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.002, b.segments(20)), "#a3271d", { at: [0, 0.1712, 0.02] });

  // Tonearm: brass post, a bent arm and a small head.
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.07, b.segments(10)), brass, { at: [-0.15, 0.185, 0.12] });
  b.rod([-0.15, 0.22, 0.12], [-0.03, 0.19, 0.05], 0.005, { bone: "arm", name: "tonearm" });
  b.part(new THREE.BoxGeometry(0.022, 0.012, 0.022), brass, { at: [-0.03, 0.19, 0.05], bone: "arm" });

  // Crank on the right side of the case.
  b.rod([-0.19, 0.07, -0.1], [-0.235, 0.07, -0.1], 0.006, { name: "crank" });
  b.part(new THREE.SphereGeometry(0.018, b.segments(12), b.segments(8)), "#1d1410", { at: [-0.245, 0.07, -0.1] });

  // The flared horn: a sweep from the sound box at the back, arcing forward over the record, opening at the bell.
  b.sweep(
    [
      [0.1, 0.2, -0.17],
      [0.13, 0.32, -0.14],
      [0.1, 0.43, -0.02],
      [0.02, 0.48, 0.12],
      [-0.02, 0.5, 0.2],
    ],
    (t: number) => 0.008 + 0.07 * Math.pow(t, 2.2),
    {
      name: "horn",
      color: "#b8862b",
      bands: [
        [0.12, "#8c2a1e"],
        [1, "#c9a227"],
      ],
      caps: { start: "round", end: "none" },
      sides: b.segments(14),
    },
  );

  // Sound box where the horn meets the tonearm side.
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.05), walnut, { at: [0.1, 0.17, -0.17] });

  return b.root;
}
```