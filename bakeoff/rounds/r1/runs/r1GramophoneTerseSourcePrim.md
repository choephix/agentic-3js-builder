```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, rng } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description: "Antique wind-up gramophone with wooden cabinet, brass horn, tonearm and record.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });
  const r = rng(5);
  b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("platter", { parent: "base", at: [0, 0.33, 0], dir: [0, 1, 0], role: "hinge" });
  b.joint("tonearm", { parent: "base", at: [0.17, 0.4, -0.12], dir: [0, 1, 0], role: "hinge" });
  b.joint("crank", { parent: "base", at: [0.2, 0.2, 0], dir: [1, 0, 0], role: "hinge" });

  const wood = paint((p, n) => {
    const v = noise(new THREE.Vector3(p.x * 0.2, p.y * 6, p.z * 0.2), 0.05, 3);
    return mix("#6b3a1c", "#8a5028", v);
  });
  const brass = "#c9962e";
  const brassDark = "#9a6e1c";
  const black = "#1a1a1c";

  // cabinet
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.4), wood, { bone: "base", at: [0, 0.16, 0] });
  b.part(new THREE.BoxGeometry(0.43, 0.03, 0.43), "#4e2a12", { bone: "base", at: [0, 0.325, 0] });
  b.part(new THREE.BoxGeometry(0.43, 0.025, 0.43), "#4e2a12", { bone: "base", at: [0, 0.0125, 0] });
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.SphereGeometry(0.02, 6, 5), brassDark, { bone: "base", at: [sx * 0.19, 0.01, sz * 0.19] });
  // front grille panel
  b.part(new THREE.BoxGeometry(0.26, 0.17, 0.01), "#2b160a", { bone: "base", at: [0, 0.17, 0.205] });
  for (let i = 0; i < 6; i++)
    b.part(new THREE.BoxGeometry(0.22, 0.008, 0.012), brass, { bone: "base", at: [0, 0.105 + i * 0.026, 0.208] });
  // corner trim
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.BoxGeometry(0.02, 0.3, 0.02), "#3e200d", { bone: "base", at: [sx * 0.2, 0.16, sz * 0.2] });

  // crank
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), brass, { bone: "crank", at: [0.22, 0.2, 0], rotation: [0, 0, 90] });
  b.part(new THREE.BoxGeometry(0.01, 0.07, 0.01), brass, { bone: "crank", at: [0.255, 0.165, 0] });
  b.part(new THREE.SphereGeometry(0.018, 6, 5), "#3e200d", { bone: "crank", at: [0.26, 0.125, 0] });

  // turntable
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 20), brassDark, { bone: "platter", at: [0, 0.345, 0] });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.008, 24), black, { bone: "platter", at: [0, 0.355, 0] });
  for (const rr of [0.06, 0.09, 0.115])
    b.part(new THREE.TorusGeometry(rr, 0.0015, 3, 24), "#2e2e32", { bone: "platter", at: [0, 0.3605, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.003, 14), "#b3322a", { bone: "platter", at: [0, 0.3615, 0] });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), brass, { bone: "platter", at: [0, 0.375, 0] });

  // horn: stack of cones/rings flaring toward +z and up
  const hornBase = new THREE.Vector3(0, 0.5, -0.05);
  b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 8), brass, { bone: "base", at: [0, 0.4, -0.12] });
  const segs = 9;
  let prev = new THREE.Vector3(0, 0.5, -0.14);
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const rad = 0.035 + 0.28 * Math.pow(t, 2.2);
    const next = new THREE.Vector3(0, 0.5 + t * 0.12 + 0.25 * Math.pow(t, 3), -0.14 + t * 0.22 + 0.1 * t);
    const rad2 = 0.035 + 0.28 * Math.pow((i + 1) / segs, 2.2);
    const len = prev.distanceTo(next);
    const mid = prev.clone().add(next).multiplyScalar(0.5);
    const dir = next.clone().sub(prev).normalize();
    b.part(new THREE.CylinderGeometry(rad2, rad, len * 1.02, 12, 1, true), i % 2 ? brass : "#d6a63a", {
      bone: "base", at: mid, dir, axis: "y",
    });
    prev = next;
  }
  // horn rim
  b.part(new THREE.TorusGeometry(0.315, 0.008, 4, 20), brassDark, { bone: "base", at: prev, dir: prev.clone().sub(new THREE.Vector3(0, 0.5, -0.14)).normalize(), axis: "z" });
  // horn neck elbow
  b.part(new THREE.SphereGeometry(0.045, 8, 6), brass, { bone: "base", at: [0, 0.47, -0.13] });
  // horn support
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6), brassDark, { bone: "base", at: [0, 0.4, -0.12] });

  // tonearm
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), brass, { bone: "tonearm", at: [0.17, 0.375, -0.12] });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), brass, {
    bone: "tonearm", at: [0.1, 0.4, -0.02], aim: [0.04, 0.4, 0.08],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.018, 0.03), brassDark, { bone: "tonearm", at: [0.04, 0.395, 0.08] });
  b.part(new THREE.ConeGeometry(0.004, 0.02, 5), "#ddd", { bone: "tonearm", at: [0.04, 0.38, 0.08], rotation: [180, 0, 0] });

  void r;
  return b.root;
}
```