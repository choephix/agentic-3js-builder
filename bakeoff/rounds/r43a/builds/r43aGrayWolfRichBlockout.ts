import * as THREE from "three";
import { createBuilder, limb, catmull } from "../../../../src/index";

export const meta = {
  name: "Gray Wolf",
  description: "Blockout of a gray wolf standing alert, facing +Z.",
};

export default function build() {
  const b = createBuilder({ name: "wolf" });
  const GRAY = "#6f737a";
  const DARK = "#3d4046";
  const PALE = "#c9c6bc";

  const hips = b.joint("hips", { at: [0, 0.68, -0.35], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.68, -0.35], [0, 0.72, 0.0], [0, 0.78, 0.35]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([[0, 0.78, 0.35], [0, 0.9, 0.55], [0, 1.0, 0.7]]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.0, 0.7], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.78], dir: [0, 0, 1], role: "jaw" });

  // body
  b.sweep(catmull([[0, 0.68, -0.4], [0, 0.72, 0.0], [0, 0.78, 0.38]]), [0.15, 0.19], {
    bone: [hips, spine.joints[0], spine.joints[1], spine.joints[2]],
    color: GRAY,
  });
  // chest
  b.part(new THREE.SphereGeometry(0.2, 8, 6), PALE, { bone: spine.joints[2], at: [0, 0.7, 0.4], scale: [0.9, 1, 1] });
  // neck
  b.sweep(catmull([[0, 0.78, 0.35], [0, 0.9, 0.55], [0, 1.0, 0.7]]), [0.15, 0.1], {
    bone: [spine.joints[2], neck.joints[0], neck.joints[1]],
    color: GRAY,
  });
  // head
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.22), GRAY, { bone: head, at: [0, 1.02, 0.78] });
  b.part(new THREE.BoxGeometry(0.09, 0.07, 0.2), PALE, { bone: head, at: [0, 0.98, 0.95] });
  b.part(new THREE.BoxGeometry(0.035, 0.03, 0.04), DARK, { bone: head, at: [0, 1.0, 1.06] });
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.18), PALE, { bone: jaw, at: [0, 0.94, 0.93] });
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.045, 0.14, 4), DARK, { bone: head, at: [s * 0.065, 1.16, 0.74] });

  // tail
  const tail = b.chain(
    "tail",
    catmull([[0, 0.72, -0.5], [0, 0.6, -0.8], [0, 0.42, -1.05]]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.07, 0.04], { color: DARK, caps: "round" });

  // legs
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const front = limb(
      [sx * 0.12, 0.7, 0.32],
      [sx * 0.12, 0.04, 0.34],
      [0.3, 0.3, 0.1],
      [[0, 0, -1], [0, 0, 1]],
    );
    const fc = b.chain(`legF${side}`, front, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
    });
    b.sweep(fc, [0.06, 0.035], { color: GRAY });
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.14), DARK, { bone: fc.tip!, at: [sx * 0.12, 0.025, 0.4] });

    const hind = limb(
      [sx * 0.12, 0.68, -0.38],
      [sx * 0.12, 0.04, -0.4],
      [0.33, 0.3, 0.1],
      [[0, 0, 1], [0, 0, -1]],
    );
    const hc = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
    });
    b.sweep(hc, [0.08, 0.035], { color: GRAY });
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.14), DARK, { bone: hc.tip!, at: [sx * 0.12, 0.025, -0.34] });
  }

  return b.root;
}
