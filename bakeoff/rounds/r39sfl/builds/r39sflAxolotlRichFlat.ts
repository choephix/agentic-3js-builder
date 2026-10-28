import * as THREE from "three";
import { createBuilder, catmull, offset } from "../../../../src/index";

export const meta = { name: "Chibi Axolotl", description: "A chibi axolotl with big frilly pink gills, stubby legs and a finned tail." };

const SKIN = "#f7c9d4", BELLY = "#fde8ec", GILL = "#e8457a", GILL2 = "#ff7aa6", DARK = "#2a1626", WHITE = "#ffffff", BLUSH = "#ff9db5", SPOT = "#e9a3b8";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const root = b.joint("hips", { at: [0, 0.12, -0.05], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.14, -0.05], [0, 0.15, 0.1], [0, 0.16, 0.2]]), { parent: root, names: ["spine1", "spine2"], role: "spine" });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.17, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.12, 0.3], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.12, -0.15], [0, 0.11, -0.4], [0, 0.1, -0.65], [0, 0.11, -0.85]]), { parent: root, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // body
  b.sweep(catmull([[0, 0.14, -0.3], [0, 0.15, -0.05], [0, 0.16, 0.15]]), [0.13, 0.15, 0.13], { bone: root, color: SKIN, sectors: [[125, 235, BELLY]] });
  // tail
  b.sweep(tail, (t) => 0.1 * (1 - t) + 0.025, { color: SKIN });
  const fin: [number, number][] = [[0, 0], [0.7, 0], [0.8, 0.1], [0.5, 0.2], [0.2, 0.17], [0, 0.09]];
  b.extrude(fin.map(([x, y]) => [x, y] as [number, number]), { at: [0, 0.2, -0.78], x: [0, 0, 1], thickness: 0.01, color: GILL2, bone: tail.joints[1], smoothing: 1 }).mesh.rotation.y = 0;

  // head (wide, flat, chibi big)
  b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { bone: head, at: [0, 0.2, 0.3], scale: [0.25, 0.17, 0.22] });
  b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, { bone: jaw, at: [0, 0.12, 0.38], scale: [0.19, 0.04, 0.14] });
  // smile
  b.part(new THREE.BoxGeometry(0.22, 0.008, 0.01), DARK, { bone: head, at: [0, 0.145, 0.5] });
  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.045, 10, 8), DARK, { bone: head, at: [s * 0.12, 0.25, 0.46] });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), WHITE, { bone: head, at: [s * 0.125, 0.268, 0.495] });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), WHITE, { bone: head, at: [s * 0.108, 0.235, 0.5] });
    // blush
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 10), BLUSH, { bone: head, at: [s * 0.17, 0.18, 0.44], dir: [s * 0.4, 0, 1] });
    // nostrils
    b.part(new THREE.SphereGeometry(0.008, 5, 4), DARK, { bone: head, at: [s * 0.035, 0.22, 0.51] });
    // gills: three frilly stalks each side
    for (let i = 0; i < 3; i++) {
      const ang = 0.35 + i * 0.4;
      const base: [number, number, number] = [s * 0.22, 0.26 + (i - 1) * 0.0, 0.2];
      const dir: [number, number, number] = [s * Math.cos(ang) * 0.9, Math.sin(ang) * 1.0 + (i === 0 ? -0.1 : 0.1), -0.25];
      const len = 0.2 - i * 0.02;
      const tip = offset(base, dir, len);
      const g = b.sweep([base, tip], [0.016, 0.007], { bone: head, color: GILL });
      void g;
      // frills
      for (let k = 0; k < 4; k++) {
        const t = 0.3 + k * 0.2;
        const p = offset(base, dir, len * t);
        const side: [number, number, number] = [0, 0.1, 0.0];
        b.spike(p, [dir[0] * 0.3, dir[1] + 1, dir[2]], 0.07 - k * 0.008, 0.012, { bone: head, color: GILL2 });
        b.spike(p, [dir[0] * 0.3, dir[1] - 1, dir[2]], 0.06 - k * 0.008, 0.011, { bone: head, color: GILL2 });
        void side;
      }
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GILL2, { bone: head, at: tip });
    }
    // legs: stubby with 4 toes
    const hipZ = [0.12, -0.2];
    hipZ.forEach((z, li) => {
      const sh = b.joint(`${li ? "hind" : "front"}${s > 0 ? "L" : "R"}`, { parent: root, at: [s * 0.14, 0.1, z], dir: [s * 0.8, -0.5, li ? -0.3 : 0.3], role: "leg" });
      const foot: [number, number, number] = [s * 0.22, 0.03, z + (li ? -0.05 : 0.05)];
      b.capsule([s * 0.13, 0.11, z], foot, 0.04, { bone: sh, color: SKIN });
      for (let t = -1.5; t <= 1.5; t++) {
        b.spike([foot[0], 0.03, foot[2]], [s * 0.3, -0.1, 1 + t * 0.0 + (li ? -0.5 : 0.5) + 0], 0.001, 0.001, { bone: sh, color: SKIN });
        b.capsule([foot[0] + s * 0.01, 0.025, foot[2]], [foot[0] + s * 0.03 + t * s * 0.0, 0.02, foot[2] + 0.06 + 0], 0.012, { bone: sh, color: BELLY });
        void t;
      }
      for (let t = 0; t < 3; t++) {
        b.part(new THREE.SphereGeometry(0.014, 6, 4), SPOT, { bone: sh, at: [foot[0] + s * (t - 1) * 0.0 + (t - 1) * 0.025 * s * 0 + 0, 0.022, foot[2] + 0.06 + (t - 1) * 0.0] });
      }
    });
    // body spots
    for (let k = 0; k < 3; k++) b.part(new THREE.SphereGeometry(0.02, 6, 4), SPOT, { bone: root, at: [s * (0.06 + k * 0.025), 0.285 - k * 0.015, -0.15 + k * 0.12], scale: [1, 0.4, 1] });
  }
  return b.root;
}
