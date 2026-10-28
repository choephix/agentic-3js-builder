import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Dwarf Rifleman",
  description: "Stocky dwarf with braided beard, helmet and a blunderbuss, blockout.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf" });
  const SKIN = "#d9a07a", BEARD = "#c8742e", COAT = "#3a5ca8", LEATHER = "#6b4423";
  const METAL = "#8a8f99", WOOD = "#7a4a22", DARK = "#2b2b33", BRASS = "#c9a23a";

  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.75, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.1, 0.02], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.17, 0.03], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 1.23, 0.1], dir: [0, 0, 1], role: "jaw" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, extra: any = {}) =>
    b.part(g, c, { at, bone, ...extra });

  // torso and belt
  P(box(0.5, 0.42, 0.34), COAT, [0, 0.95, 0], chest);
  P(box(0.46, 0.3, 0.32), LEATHER, [0, 0.62, 0], hips);
  P(box(0.52, 0.08, 0.36), BRASS, [0, 0.77, 0], hips);
  // head, helmet, nose
  P(new THREE.SphereGeometry(0.15, 8, 6), SKIN, [0, 1.3, 0.04], head);
  P(new THREE.SphereGeometry(0.17, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), METAL, [0, 1.35, 0.03], head);
  P(new THREE.SphereGeometry(0.04, 6, 4), "#c98a68", [0, 1.28, 0.2], head);
  // beard and braids
  P(box(0.26, 0.28, 0.14), BEARD, [0, 1.12, 0.14], chest);
  for (const s of [1, -1]) {
    const path = catmull([[s * 0.06, 1.0, 0.2], [s * 0.07, 0.8, 0.22], [s * 0.06, 0.6, 0.22]]);
    b.sweep(path, 0.03, { bone: chest, color: BEARD });
    P(new THREE.SphereGeometry(0.04, 6, 4), BRASS, [s * 0.06, 0.57, 0.22], chest);
  }

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // legs
    const hip = b.joint("hip" + L, { parent: hips, at: [s * 0.14, 0.5, 0], dir: [0, -1, 0], role: "leg" });
    b.joint("knee" + L, { parent: hip, at: [s * 0.14, 0.27, 0.01], dir: [0, -1, 0], role: "leg" });
    b.rod([s * 0.14, 0.5, 0], [s * 0.14, 0.27, 0.01], 0.09, { color: LEATHER, bone: hip });
    b.rod([s * 0.14, 0.27, 0.01], [s * 0.14, 0.1, 0.01], 0.1, { color: DARK, bone: "knee" + L });
    P(box(0.16, 0.1, 0.3), DARK, [s * 0.14, 0.05, 0.06], "knee" + L);
    // shoulders and pauldrons
    P(new THREE.SphereGeometry(0.12, 8, 6), METAL, [s * 0.34, 1.12, 0], chest);
  }

  // arms: right arm (x<0) forward holding gun; left arm bent forward
  const shR = b.joint("shoulderR", { parent: chest, at: [-0.32, 1.08, 0.02], dir: [0, -0.4, 1], role: "arm" });
  const elR = b.joint("elbowR", { parent: shR, at: [-0.34, 0.9, 0.2], dir: [0, 0, 1], role: "arm" });
  b.rod([-0.32, 1.08, 0.02], [-0.34, 0.9, 0.2], 0.075, { color: COAT, bone: shR });
  b.rod([-0.34, 0.9, 0.2], [-0.2, 0.92, 0.45], 0.07, { color: SKIN, bone: elR });
  const shL = b.joint("shoulderL", { parent: chest, at: [0.32, 1.08, 0.02], dir: [0, -1, 0.3], role: "arm" });
  const elL = b.joint("elbowL", { parent: shL, at: [0.36, 0.88, 0.05], dir: [0, -0.5, 1], role: "arm" });
  b.rod([0.32, 1.08, 0.02], [0.36, 0.88, 0.05], 0.075, { color: COAT, bone: shL });
  b.rod([0.36, 0.88, 0.05], [0.25, 0.85, 0.35], 0.07, { color: SKIN, bone: elL });

  // blunderbuss
  P(box(0.07, 0.1, 0.7), WOOD, [-0.12, 0.93, 0.25], elR);
  b.rod([-0.12, 0.97, 0.55], [-0.12, 0.97, 1.0], [0.04, 0.09], { color: METAL, bone: elR });
  P(new THREE.CylinderGeometry(0.1, 0.06, 0.08, 8), DARK, [-0.12, 0.97, 1.02], elR, { dir: [0, 0, 1] });
  P(box(0.08, 0.18, 0.1), WOOD, [-0.12, 0.85, -0.12], elR);

  // backpack
  P(box(0.34, 0.36, 0.16), LEATHER, [0, 0.98, -0.25], chest);

  return b.root;
}
