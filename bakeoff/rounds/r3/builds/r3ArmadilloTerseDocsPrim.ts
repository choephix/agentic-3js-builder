import * as THREE from "three";
import { createBuilder, catmull, limb, rng, scales, countershade } from "../../../../src/index";

export const meta = { name: "Armadillo", description: "Nine-banded armadillo with banded armor shell, rigged in rest pose." };

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  const SHELL = "#8a7260", SHELL2 = "#6e5a4a", BAND = "#9c8672", SKIN = "#c9a58c", DARK = "#2a1d18", PINK = "#d9a0a0", CLAW = "#efe3cf";

  const hips = b.joint("hips", { at: [0, 0.2, -0.12], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.21, 0.12], aim: [0, 0.22, 0.3], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.2, 0.28], aim: [0, 0.19, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.19, 0.38], aim: [0, 0.15, 0.55], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.12, 0.47], aim: [0, 0.1, 0.57], role: "jaw" });

  // body shell
  const coat = countershade(scales(SHELL, SHELL2, { size: 0.05 }), SKIN, { level: -0.2 });
  b.loft(
    [
      { at: [0, 0.2, -0.3], w: 0.2, h: 0.2 },
      { at: [0, 0.22, -0.12], w: 0.3, h: 0.28 },
      { at: [0, 0.23, 0.1], w: 0.32, h: 0.3 },
      { at: [0, 0.21, 0.26], w: 0.22, h: 0.22 },
    ],
    { bone: [hips, chest], color: coat },
  );
  // bands across the back
  for (let i = 0; i < 9; i++) {
    const z = -0.24 + i * 0.045;
    const k = 1 - Math.pow((z + 0.02) / 0.3, 2) * 0.5;
    b.part(new THREE.TorusGeometry(0.15 * k + 0.01, 0.014, 5, 10, Math.PI * 1.15), i % 2 ? BAND : SHELL2, {
      at: [0, 0.2, z],
      rotation: [90, 0, 0],
      scale: [1, 1, 1],
      bone: z < -0.1 ? hips : chest,
    }).mesh.rotation.set(0, 0, 0);
  }
  // shoulder & hip shields
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), SHELL, { at: [0, 0.2, 0.2], scale: [1, 0.95, 0.9], bone: chest, flat: true });
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), SHELL, { at: [0, 0.18, -0.32], scale: [1, 0.95, 0.9], bone: hips, flat: true });

  // neck + head
  b.capsule([0, 0.19, 0.3], [0, 0.18, 0.4], 0.07, { bone: neck, color: SKIN });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), SKIN, { at: [0, 0.18, 0.42], scale: [1, 0.9, 1.1], bone: head, flat: true });
  b.frustumBox([0, 0.16, 0.47], [0, 0.145, 0.6], [0.1, 0.07], [0.04, 0.04], { bone: head, color: SKIN });
  b.frustumBox([0, 0.115, 0.48], [0, 0.11, 0.58], [0.06, 0.025], [0.03, 0.02], { bone: jaw, color: PINK });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), DARK, { at: [0, 0.147, 0.605], bone: head });
  // head shield
  b.part(new THREE.SphereGeometry(0.09, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), SHELL, { at: [0, 0.2, 0.41], rotation: [30, 0, 0], scale: [1, 0.7, 1.1], bone: head, flat: true });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // eyes
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, { at: [s * 0.065, 0.2, 0.47], bone: head });
    // ears
    b.part(new THREE.ConeGeometry(0.035, 0.1, 5), SKIN, { at: [s * 0.07, 0.27, 0.4], rotation: [0, 0, -s * 15], bone: head, flat: true });
    b.part(new THREE.ConeGeometry(0.02, 0.07, 5), PINK, { at: [s * 0.07, 0.268, 0.412], rotation: [0, 0, -s * 15], bone: head, flat: true });

    // legs
    for (const [nm, hz, root] of [["F", 0.2, chest], ["H", -0.26, hips]] as const) {
      const hip: [number, number, number] = [s * 0.12, 0.17, hz];
      const foot: [number, number, number] = [s * 0.14, 0.02, hz + 0.04];
      const pts = limb(hip, foot, [0.08, 0.09], [[0, 0, 1]]);
      const leg = b.chain(`leg${nm}${side}`, pts, { parent: root, names: [`hip${nm}${side}`, `knee${nm}${side}`, `foot${nm}${side}`], role: "leg" });
      b.sweep(leg, [0.055, 0.035], { color: SKIN });
      for (let c = -1; c <= 1; c++)
        b.spike([foot[0] + c * 0.02, 0.025, foot[2] + 0.02], [foot[0] + c * 0.022, 0.012, foot[2] + 0.085], null, 0.012, { color: CLAW, bone: leg.tip ?? leg.joints[1] });
      b.part(new THREE.BoxGeometry(0.07, 0.04, 0.09), SKIN, { at: [foot[0], 0.02, foot[2] + 0.02], bone: leg.tip ?? leg.joints[1] });
    }
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([[0, 0.2, -0.38], [0, 0.17, -0.55], [0, 0.1, -0.72], [0, 0.05, -0.88]]),
    { parent: hips, count: 4, role: "tail" },
  );
  b.sweep(tail, (t) => 0.07 * (1 - t) + 0.015, { color: coat, caps: "point" });
  b.along(tail, 4, (at) => b.part(new THREE.TorusGeometry(0.05, 0.01, 4, 8), SHELL2, { frame: at, rotation: [90, 0, 0], bone: tail.joints[0] }));

  return b.root;
}
