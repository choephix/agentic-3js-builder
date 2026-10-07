```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description: "A stylized koala sitting upright, built from primitives with a full rest-pose skeleton.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala" });
  const FUR = "#8d9299";
  const FURD = "#6f757c";
  const BELLY = "#d9dcdc";
  const NOSE = "#2a2a2e";
  const PINK = "#e8b4b8";
  const CLAW = "#3a3a3a";

  // ---- skeleton (sitting koala, ~0.75 m tall) ----
  const root = b.joint("hips", { at: [0, 0.2, -0.02], dir: [0, 1, 0] });
  const spine1 = b.joint("spine1", { parent: root, at: [0, 0.28, 0], dir: [0, 1, 0.1], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.4, 0.03], dir: [0, 1, 0.1], role: "spine" });
  const neck = b.joint("neck1", { parent: spine2, at: [0, 0.52, 0.06], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.58, 0.08], dir: [0, 1, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.6, 0.15], dir: [0, 0, 1], role: "jaw" });

  const mk = (s: number, sx: number) => {
    const n = s > 0 ? "L" : "R";
    const sh = b.joint("shoulder" + n, { parent: spine2, at: [0.14 * s, 0.47, 0.08], dir: [0.5 * s, -1, 0.5], role: "arm" });
    const el = b.joint("elbow" + n, { parent: sh, at: [0.2 * s, 0.37, 0.14], dir: [0.2 * s, -0.6, 1], role: "arm" });
    const wr = b.joint("wrist" + n, { parent: el, at: [0.22 * s, 0.3, 0.24], dir: [0.1 * s, -0.5, 1], role: "arm" });
    const hip = b.joint("hip" + n, { parent: root, at: [0.13 * s, 0.17, 0.02], dir: [0.3 * s, -0.4, 1], role: "leg" });
    const kn = b.joint("knee" + n, { parent: hip, at: [0.17 * s, 0.14, 0.18], dir: [0, -1, 0.2], role: "leg" });
    const an = b.joint("ankle" + n, { parent: kn, at: [0.17 * s, 0.05, 0.2], dir: [0, 0, 1], role: "leg" });
    const ear = b.joint("ear" + n, { parent: head, at: [0.17 * s, 0.74, 0.03], dir: [0.5 * s, 1, 0], role: "hinge" });
    return { sh, el, wr, hip, kn, an, ear };
  };
  const L = mk(1, 1);
  const R = mk(-1, -1);

  // ---- body ----
  b.part(new THREE.SphereGeometry(0.2, 10, 8), FUR, { at: [0, 0.27, -0.01], scale: [1, 1.1, 0.95], bone: root });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), FUR, { at: [0, 0.4, 0.03], scale: [0.95, 1.1, 0.9], bone: spine1 });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), BELLY, { at: [0, 0.36, 0.13], scale: [0.85, 1.2, 0.5], bone: spine1 });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), FURD, { at: [0, 0.1, -0.12], scale: [1.1, 0.7, 0.8], bone: root });

  // ---- neck & head ----
  b.part(new THREE.CylinderGeometry(0.12, 0.15, 0.14, 8), FUR, { at: [0, 0.54, 0.07], bone: neck });
  b.part(new THREE.SphereGeometry(0.2, 12, 9), FUR, { at: [0, 0.68, 0.12], scale: [1.2, 0.95, 1], bone: head });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), BELLY, { at: [0, 0.62, 0.22], scale: [1.3, 0.8, 0.7], bone: head });
  // Big nose
  b.part(new THREE.BoxGeometry(0.1, 0.13, 0.07), NOSE, { at: [0, 0.675, 0.31], bone: head });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), NOSE, { at: [0, 0.69, 0.3], scale: [1.1, 1.2, 0.8], bone: head });
  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 8, 6), "#111", { at: [0.09 * s, 0.73, 0.27], bone: head });
    b.part(new THREE.SphereGeometry(0.008, 4, 4), "#fff", { at: [0.095 * s, 0.74, 0.295], bone: head });
  }
  // Lower jaw
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.1), BELLY, { at: [0, 0.585, 0.24], bone: jaw });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), PINK, { at: [0, 0.6, 0.27], bone: jaw });

  // Ears: big fluffy
  for (const [s, j] of [[1, L], [-1, R]] as const) {
    b.part(new THREE.SphereGeometry(0.1, 9, 7), FURD, { at: [0.2 * s, 0.76, 0.05], scale: [0.7, 1, 1.05], bone: j.ear });
    b.part(new THREE.SphereGeometry(0.085, 8, 6), "#e9e4e2", { at: [0.21 * s, 0.76, 0.07], scale: [0.55, 0.9, 0.9], bone: j.ear });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), "#f4f1ef", { at: [0.17 * s, 0.82, 0.04], scale: [1, 0.8, 0.9], bone: j.ear });
  }

  // ---- limbs ----
  for (const [s, j] of [[1, L], [-1, R]] as const) {
    // arms reaching forward/down, slightly separated
    b.capsule([0.14 * s, 0.47, 0.08], [0.2 * s, 0.37, 0.14], 0.055, { color: FUR, bone: j.sh });
    b.capsule([0.2 * s, 0.37, 0.14], [0.22 * s, 0.3, 0.24], 0.05, { color: FUR, bone: j.el });
    b.part(new THREE.SphereGeometry(0.05, 7, 6), FURD, { at: [0.225 * s, 0.29, 0.255], scale: [1, 0.8, 1.2], bone: j.wr });
    for (let k = 0; k < 3; k++) {
      const x = (0.2 + k * 0.025) * s;
      b.spike([x, 0.28, 0.28], [0, -0.2, 1], 0.05, 0.011, { color: CLAW, bone: j.wr });
    }
    // legs
    b.capsule([0.13 * s, 0.17, 0.02], [0.17 * s, 0.14, 0.18], 0.08, { color: FUR, bone: j.hip });
    b.capsule([0.17 * s, 0.14, 0.18], [0.17 * s, 0.06, 0.2], 0.06, { color: FUR, bone: j.kn });
    b.part(new THREE.BoxGeometry(0.085, 0.04, 0.12), FURD, { at: [0.17 * s, 0.03, 0.24], bone: j.an });
    for (let k = 0; k < 3; k++) {
      b.spike([(0.145 + k * 0.025) * s, 0.03, 0.3], [0, 0, 1], 0.04, 0.01, { color: CLAW, bone: j.an });
    }
  }

  // fur tufts scattered on chest/cheeks
  const r = rng(5);
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.03, 0.07, 4), "#aeb3b8", {
      at: [Math.cos(a) * 0.13, 0.62, 0.12 + Math.sin(a) * 0.12],
      rotation: [Math.sin(a) * 90, 0, -Math.cos(a) * 90],
      bone: head,
    });
  }

  return b.root;
}
```