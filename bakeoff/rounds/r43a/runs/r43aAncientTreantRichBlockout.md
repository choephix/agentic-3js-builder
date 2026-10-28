```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Ancient Treant",
  description: "Blockout of a towering walking tree guardian: root legs, gnarled trunk torso, branch arms, crown.",
};

export default function build() {
  const b = createBuilder({ name: "treant" });
  const BARK = "#5a3f26";
  const DARK = "#3b2918";
  const MOSS = "#4f7a2e";
  const LEAF = "#3f8a34";

  const hips = b.joint("hips", { at: [0, 2.6, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.6, 0], [0, 3.6, 0.05], [0, 4.6, 0.15]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 4.6, 0.15], [0, 5.0, 0.3], [0, 5.3, 0.45]]), {
    parent: spine.joints[2], names: ["neck1", "neck2", "head"], role: "neck",
  });
  const head = neck.joints[2];

  // trunk torso
  b.sweep(catmull([[0, 2.5, 0], [0, 3.6, 0.05], [0, 4.7, 0.15]]), [0.8, 0.95, 0.75], {
    bone: [hips, spine.joints[0], spine.joints[1], spine.joints[2]], color: BARK, section: { ngon: 8 },
  });
  // head
  b.part(new THREE.BoxGeometry(0.8, 0.8, 0.75), DARK, { bone: head, at: [0, 5.35, 0.5] });
  b.part(new THREE.BoxGeometry(0.4, 0.25, 0.4), MOSS, { bone: head, at: [0, 5.2, 0.9] });
  // crown of foliage
  b.part(new THREE.IcosahedronGeometry(1.5, 0), LEAF, { bone: head, at: [0, 6.5, 0.3], scale: [1.2, 0.9, 1.1] });
  b.part(new THREE.IcosahedronGeometry(0.9, 0), LEAF, { bone: head, at: [-1.1, 6.0, 0.2] });
  b.part(new THREE.IcosahedronGeometry(0.9, 0), LEAF, { bone: head, at: [1.1, 6.0, 0.2] });
  // moss shoulders
  for (const s of [1, -1]) b.part(new THREE.IcosahedronGeometry(0.5, 0), MOSS, { bone: spine.joints[2], at: [s * 0.9, 4.9, 0.1] });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // legs: thick root pillars
    const hip = b.joint(`hip${side}`, { parent: hips, at: [s * 0.55, 2.6, 0], dir: [0, -1, 0] });
    const leg = b.chain(`leg${side}`, [[s * 0.55, 2.6, 0], [s * 0.7, 1.4, 0.2], [s * 0.8, 0.3, 0.45]], {
      parent: hips, names: [`hip${side}2`, `knee${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(leg, [0.5, 0.4, 0.45], { color: BARK, section: { ngon: 7 } });
    // root feet with toes
    b.part(new THREE.BoxGeometry(0.9, 0.3, 1.2), DARK, { bone: leg.tip ?? leg.joints[2], at: [s * 0.8, 0.15, 0.6] });
    for (const t of [-0.3, 0, 0.3])
      b.part(new THREE.ConeGeometry(0.15, 0.7, 5), DARK, { bone: leg.tip ?? leg.joints[2], at: [s * 0.8 + t, 0.12, 1.3], dir: [0, 0, 1] });
    // arms: long branches, extended outward
    const arm = b.chain(`arm${side}`, catmull([[s * 0.8, 4.5, 0.1], [s * 1.9, 4.0, 0.3], [s * 2.8, 3.0, 0.5], [s * 3.2, 2.0, 0.6]]), {
      parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm",
    });
    b.sweep(arm, [0.4, 0.28, 0.2], { color: BARK, section: { ngon: 7 } });
    const hand = arm.tip ?? arm.joints[2];
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.4), DARK, { bone: hand, at: [s * 3.25, 1.9, 0.6] });
    for (const f of [-0.2, 0, 0.2])
      b.spike([s * 3.25 + f, 1.8, 0.6], [f * 1.5 + s * 0.2, -1, 0.3], 0.6, 0.07, { color: DARK, bone: hand });
    // shoulder branch with leaves
    b.spike([s * 0.7, 5.0, 0], [s * 1, 1, -0.2], 1.4, 0.15, { color: BARK, bone: spine.joints[2] });
    b.part(new THREE.IcosahedronGeometry(0.5, 0), LEAF, { bone: spine.joints[2], at: [s * 1.3, 6.3, -0.3] });
  }

  // jaw
  const jaw = b.joint("jaw", { parent: head, at: [0, 5.1, 0.7], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.5, 0.15, 0.4), DARK, { bone: jaw, at: [0, 5.05, 0.85] });

  // back roots as tail
  const tail = b.chain("tail", catmull([[0, 2.7, -0.4], [0, 2.0, -1.0], [0, 1.2, -1.6]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.sweep(tail, [0.35, 0.1], { color: DARK, section: { ngon: 6 } });

  return b.root;
}
```