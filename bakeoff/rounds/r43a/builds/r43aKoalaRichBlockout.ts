import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description: "Blockout of a koala clinging to an upright eucalyptus branch on a round base.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  const FUR = "#8c8f96", BELLY = "#d9d6cc", DARK = "#2a2a30", BARK = "#8a6a4a", LEAF = "#5f8f5a", BASE = "#6b4a2f", PINK = "#d9a0a0";

  // stand
  const root = b.joint("root", { at: [0, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.06, 8), BASE, { bone: root, at: [0, 0.03, 0] });
  // trunk (vertical branch)
  b.part(new THREE.CylinderGeometry(0.07, 0.085, 1.0, 8), BARK, { bone: root, at: [0, 0.55, -0.05] });
  // side branch with leaves
  b.rod([0, 0.95, -0.05], [-0.3, 1.2, -0.05], 0.025, BARK, { bone: root });
  b.part(new THREE.BoxGeometry(0.18, 0.05, 0.14), LEAF, { bone: root, at: [-0.34, 1.22, -0.05] });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.12), LEAF, { bone: root, at: [-0.15, 1.12, -0.05] });

  // koala: sits on trunk, body upright, facing +Z (clinging with back to viewer-facing front)
  const hips = b.joint("hips", { parent: root, at: [0, 0.4, 0.1], dir: [0, 1, 0.1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.65, 0.12], dir: [0, 1, 0.05], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.88, 0.14], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.92, 0.15], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.98, 0.2], dir: [0, 0, 1], role: "jaw" });

  b.part(new THREE.BoxGeometry(0.3, 0.5, 0.26), FUR, { bone: hips, at: [0, 0.6, 0.1] });
  b.part(new THREE.BoxGeometry(0.22, 0.32, 0.05), BELLY, { bone: chest, at: [0, 0.62, 0.25] });
  b.part(new THREE.BoxGeometry(0.34, 0.28, 0.3), FUR, { bone: head, at: [0, 1.08, 0.17] });
  b.part(new THREE.BoxGeometry(0.2, 0.08, 0.1), FUR, { bone: head, at: [0, 1.0, 0.36] });
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.08), DARK, { bone: head, at: [0, 1.08, 0.42] });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.12), PINK, { bone: jaw, at: [0, 0.96, 0.3] });
  for (const s of [1, -1]) {
    // ears
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), FUR, { bone: head, at: [s * 0.2, 1.24, 0.14], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), BELLY, { bone: head, at: [s * 0.2, 1.24, 0.17], dir: [0, 0, 1] });
    // eyes
    b.part(new THREE.BoxGeometry(0.04, 0.04, 0.02), DARK, { bone: head, at: [s * 0.1, 1.14, 0.33] });
    // arms hugging trunk
    const sh = [s * 0.18, 0.78, 0.1] as [number, number, number];
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, catmull([sh, [s * 0.2, 0.68, 0.17], [s * 0.07, 0.62, 0.1]]), { parent: chest, names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s > 0 ? "L" : "R"}`], role: "arm" });
    b.sweep(arm, 0.045, { color: FUR });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.1), DARK, { bone: chest, at: [s * 0.06, 0.62, 0.0] });
    // legs
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, catmull([[s * 0.13, 0.45, 0.05], [s * 0.2, 0.38, 0.22], [s * 0.08, 0.28, 0.05]]), { parent: hips, names: [`hip${s > 0 ? "L" : "R"}`, `knee${s > 0 ? "L" : "R"}`], role: "leg" });
    b.sweep(leg, 0.055, { color: FUR });
    b.part(new THREE.BoxGeometry(0.1, 0.06, 0.1), DARK, { bone: hips, at: [s * 0.08, 0.28, 0.0] });
  }
  return b.root;
}
