```ts
import * as THREE from "three";
import { createBuilder, catmull, limb } from "agentic-3js-builder";

export const meta = {
  name: "Qilin blockout",
  description: "Scaled hooved chimera with antlers, dragon head, cloud mane and tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const SCALE = "#2f9e7a", BELLY = "#f2e2a8", GOLD = "#e8b84a", MANE = "#e0475f", HOOF = "#2a2230", HORN = "#f4d27a", DARK = "#1b1424";

  const hips = b.joint("hips", { at: [0, 1.15, -0.55], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.15, -0.55], [0, 1.2, 0], [0, 1.3, 0.55]]), { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 1.3, 0.55], [0, 1.5, 0.85], [0, 1.72, 1.05]]), { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.72, 1.05], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 1.2], dir: [0, -0.05, 1], role: "jaw" });

  // body
  b.loft(
    [
      { at: [0, 1.15, -0.85], w: 0.4, h: 0.45 },
      { at: [0, 1.15, -0.45], w: 0.55, h: 0.6 },
      { at: [0, 1.15, 0.1], w: 0.55, h: 0.62 },
      { at: [0, 1.25, 0.6], w: 0.5, h: 0.6 },
    ],
    { color: SCALE, bone: [hips, spine.joints[0], spine.joints[1]] },
  );
  b.loft(
    [
      { at: [0, 0.98, -0.4], w: 0.35, h: 0.2 },
      { at: [0, 0.98, 0.4], w: 0.35, h: 0.2 },
    ],
    { color: BELLY, bone: spine.joints[0] },
  );
  b.sweep(neck, [0.2, 0.14], { color: SCALE });

  // head
  b.part(new THREE.BoxGeometry(0.26, 0.24, 0.3), SCALE, { bone: head, at: [0, 1.74, 1.12] });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.24), SCALE, { bone: head, at: [0, 1.68, 1.34] });
  b.part(new THREE.BoxGeometry(0.19, 0.06, 0.22), BELLY, { bone: jaw, at: [0, 1.6, 1.3] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), DARK, { bone: head, at: [0, 1.7, 1.46] });

  for (const s of [1, -1]) {
    // antlers
    b.sweep(catmull([[s * 0.07, 1.84, 1.05], [s * 0.1, 2.05, 0.95], [s * 0.2, 2.25, 0.85]]), [0.03, 0.01], { bone: head, color: HORN });
    b.sweep(catmull([[s * 0.1, 2.0, 0.97], [s * 0.22, 2.1, 0.95], [s * 0.3, 2.2, 0.98]]), [0.02, 0.006], { bone: head, color: HORN });
    b.part(new THREE.ConeGeometry(0.04, 0.16, 5), SCALE, { bone: head, at: [s * 0.16, 1.8, 0.98], rotation: [0, 0, -s * 70] });

    // legs
    for (const z of [-0.6, 0.55]) {
      const front = z > 0;
      const pts = limb(
        [s * 0.22, 1.05, z],
        [s * 0.22, 0.08, z + (front ? 0.04 : 0)],
        [0.45, 0.38, 0.22],
        front ? [[0, 0, 1], [0, 0, -1]] : [[0, 0, 1], [0, 0, -1]],
      );
      const n = front ? "F" : "H";
      const side = s > 0 ? "L" : "R";
      const leg = b.chain(`leg${n}${side}`, pts, {
        parent: front ? spine.joints[1] : hips,
        names: [`hip${n}${side}`, `knee${n}${side}`, `ankle${n}${side}`, `hoof${n}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.1, 0.05], { color: SCALE });
      b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.1, 6), HOOF, { bone: leg.tip ?? leg.joints[2], at: [s * 0.22, 0.05, z + (front ? 0.04 : 0)] });
    }
  }

  // cloud mane
  const mane = [[0, 1.95, 1.0], [0, 1.85, 0.8], [0, 1.7, 0.55], [0, 1.55, 0.3]];
  mane.forEach((p, i) => {
    b.part(new THREE.IcosahedronGeometry(0.17 - i * 0.015, 0), MANE, { bone: neck.joints[i < 2 ? 1 : 0], at: p });
  });
  b.part(new THREE.IcosahedronGeometry(0.14, 0), GOLD, { bone: spine.joints[1], at: [0, 1.62, 0.15] });

  // tail
  const tail = b.chain("tail", catmull([[0, 1.2, -0.85], [0, 1.2, -1.2], [0, 1.0, -1.5], [0, 0.75, -1.7]]), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.09, 0.04], { color: SCALE });
  b.part(new THREE.IcosahedronGeometry(0.2, 0), MANE, { bone: tail.joints[2], at: [0, 0.7, -1.78], scale: [0.8, 1.3, 1] });

  return b.root;
}
```