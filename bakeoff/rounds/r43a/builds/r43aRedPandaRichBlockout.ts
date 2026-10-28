import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "Red panda on mossy stone",
  description: "Blockout of a red panda balancing on a mossy stone, with a ringed tail, legs and a two-part jaw.",
};

export default function build() {
  const b = createBuilder({ name: "redpanda" });
  const RED = "#c8561e", CREAM = "#f6e6c8", DARK = "#3a2218", STONE = "#8a8f94", MOSS = "#5d9a3c";

  // Stone (floor contact)
  b.part(new THREE.CylinderGeometry(0.3, 0.36, 0.28, 7), STONE, { at: [0, 0.14, 0], bone: undefined });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.04, 7), MOSS, { at: [0, 0.28, 0] });

  const top = 0.3;
  const hips = b.joint("hips", { at: [0, top + 0.2, -0.1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, top + 0.2, -0.1], [0, top + 0.24, 0.06], [0, top + 0.3, 0.18]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, top + 0.3, 0.18], [0, top + 0.36, 0.24], [0, top + 0.4, 0.28]]), {
    parent: spine.joints[spine.joints.length - 1], names: ["neck1", "neck2", "headBase"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, top + 0.4, 0.28], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, top + 0.37, 0.33], aim: [0, top + 0.37, 0.43], role: "jaw" });

  // Body
  b.sweep(catmull([[0, top + 0.2, -0.1], [0, top + 0.24, 0.06], [0, top + 0.3, 0.18]]), [0.11, 0.13, 0.11], {
    bone: [spine], color: RED,
  });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), CREAM, { at: [0, top + 0.2, 0.06], scale: [1, 0.8, 1.2], bone: hips });

  // Head
  b.part(new THREE.SphereGeometry(0.12, 10, 8), RED, { at: [0, top + 0.42, 0.3], scale: [1.2, 0.9, 1], bone: head });
  b.part(new THREE.BoxGeometry(0.09, 0.05, 0.1), CREAM, { at: [0, top + 0.39, 0.41], bone: head });
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.08), CREAM, { at: [0, top + 0.35, 0.4], bone: jaw });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), DARK, { at: [0, top + 0.415, 0.465], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.045, 0.08, 5), RED, { at: [s * 0.09, top + 0.54, 0.27], bone: head });
    b.part(new THREE.ConeGeometry(0.025, 0.05, 5), CREAM, { at: [s * 0.09, top + 0.54, 0.285], bone: head });
  }

  // Tail
  const tailPts: number[][] = [[0, top + 0.22, -0.18], [0, top + 0.3, -0.45], [0, top + 0.28, -0.75], [0, top + 0.15, -0.95]];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.07, 0.08, 0.07, 0.04], {
    color: (t: number) => (t > 0.8 ? DARK : Math.floor(t * 8) % 2 ? "#e8b070" : RED),
  });

  // Legs, spread wide for balance
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb([s * 0.1, top + 0.3, 0.16], [s * 0.17, top, 0.3], [0.13, 0.13], [[0, 0, -1]]);
    const fl = b.chain("arm" + side, front, { parent: spine.joints[spine.joints.length - 1], names: ["shoulder" + side, "elbow" + side, "hand" + side], role: "arm" });
    b.sweep(fl, [0.04, 0.03], { color: DARK });
    const hind = limb([s * 0.1, top + 0.22, -0.14], [s * 0.18, top, -0.28], [0.14, 0.14], [[0, 0, 1]]);
    const hl = b.chain("leg" + side, hind, { parent: hips, names: ["hip" + side, "knee" + side, "foot" + side], role: "leg" });
    b.sweep(hl, [0.05, 0.035], { color: DARK });
    b.part(new THREE.BoxGeometry(0.07, 0.03, 0.12), DARK, { at: [s * 0.18, top + 0.015, -0.25], bone: hl.tip ?? hl.joints[1] });
    b.part(new THREE.BoxGeometry(0.06, 0.03, 0.09), DARK, { at: [s * 0.17, top + 0.015, 0.32], bone: fl.tip ?? fl.joints[1] });
  }

  return b.root;
}
