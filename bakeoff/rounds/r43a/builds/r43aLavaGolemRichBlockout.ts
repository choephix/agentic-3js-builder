import * as THREE from "three";
import { createBuilder, limb } from "../../../../src/index";

export const meta = {
  name: "Lava Golem",
  description: "Blockout of a hulking basalt golem with molten core, massive arms and legs.",
};

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const BASALT = "#3a3640";
  const DARK = "#26232b";
  const LAVA = "#ff7a1a";

  const hips = b.joint("hips", { at: [0, 1.5, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.9, 0], dir: [0, 1, 0.1], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.9, 0.1], dir: [0, 1, 0.2], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.05, 0.15], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.15, 0.3], dir: [0, 0, 1], role: "jaw" });

  // torso masses
  b.part(new THREE.BoxGeometry(1.5, 0.8, 1.0), DARK, { bone: hips, at: [0, 1.6, 0] });
  b.part(new THREE.BoxGeometry(2.1, 1.5, 1.3), BASALT, { bone: chest, at: [0, 2.45, 0.05] });
  b.part(new THREE.BoxGeometry(1.2, 1.0, 0.1), LAVA, { bone: chest, at: [0, 2.4, 0.7] });
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.5), BASALT, { bone: chest, at: [0, 2.6, -0.8] });
  // head
  b.part(new THREE.BoxGeometry(0.9, 0.7, 0.8), BASALT, { bone: head, at: [0, 3.35, 0.2] });
  b.part(new THREE.BoxGeometry(0.7, 0.25, 0.6), DARK, { bone: jaw, at: [0, 2.95, 0.3] });
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.05), LAVA, { bone: head, at: [0, 3.4, 0.62] });
  for (const s of [1, -1]) {
    b.spike([s * 0.3, 3.65, 0.1], [s * 0.45, 1, -0.2], 0.5, 0.1, { bone: head, color: DARK });
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // arms
    b.part(new THREE.BoxGeometry(0.9, 0.8, 0.9), DARK, { bone: chest, at: [s * 1.5, 3.0, 0] });
    const arm = limb([s * 1.5, 2.95, 0], [s * 2.1, 0.55, 0.5], [1.2, 1.2], [[0, 0, -1]]);
    const armC = b.chain(`arm${side}`, arm, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(armC, [0.42, 0.34], { color: BASALT });
    b.part(new THREE.BoxGeometry(0.9, 0.85, 0.9), DARK, { bone: armC.tip!, at: [s * 2.1, 0.45, 0.5] });
    b.part(new THREE.BoxGeometry(0.3, 0.3, 0.3), LAVA, { bone: armC.joints[1], at: arm[1] });
    // legs
    const leg = limb([s * 0.6, 1.5, 0], [s * 0.7, 0.2, 0.1], [0.8, 0.8], [[0, 0, 1]]);
    const legC = b.chain(`leg${side}`, leg, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(legC, [0.4, 0.33], { color: BASALT });
    b.part(new THREE.BoxGeometry(0.8, 0.4, 1.1), DARK, { bone: legC.tip!, at: [s * 0.7, 0.2, 0.25] });
    b.part(new THREE.BoxGeometry(0.2, 0.3, 0.2), LAVA, { bone: legC.joints[1], at: leg[1] });
  }

  return b.root;
}
