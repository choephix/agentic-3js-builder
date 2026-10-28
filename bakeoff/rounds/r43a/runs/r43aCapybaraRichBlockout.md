```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Capybara with Bird",
  description: "Blockout of a barrel-bodied capybara standing at rest with a small bird perched on its head.",
};

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const FUR = "#9a6a3c";
  const DARK = "#6e4726";
  const BELLY = "#c49a62";
  const BIRD = "#4fa3d9";
  const BEAK = "#f2b134";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.38, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.4, -0.3], [0, 0.42, 0], [0, 0.44, 0.3]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.44, 0.3], [0, 0.5, 0.45]]), {
    parent: spine.joints[1], names: ["neck1"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.5, 0.45], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.42, 0.62], dir: [0, 0, 1], role: "jaw" });
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.4, -0.62], dir: [0, 0, -1], role: "tail" });

  // body barrel
  b.sweep(catmull([[0, 0.42, -0.5], [0, 0.45, -0.1], [0, 0.46, 0.3]]), [0.2, 0.26, 0.22], {
    bone: [hips, spine.joints[0], spine.joints[1]], color: FUR,
  });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), BELLY, { bone: spine.joints[0], at: [0, 0.3, -0.05], scale: [1.1, 0.7, 2.2] });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), DARK, { bone: tail, at: [0, 0.4, -0.64] });

  // head: box skull, blunt snout, jaw
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.26), FUR, { bone: head, at: [0, 0.52, 0.55] });
  b.part(new THREE.BoxGeometry(0.19, 0.14, 0.14), DARK, { bone: head, at: [0, 0.47, 0.7] });
  b.part(new THREE.BoxGeometry(0.15, 0.04, 0.16), BELLY, { bone: jaw, at: [0, 0.4, 0.66] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 5, 4), DARK, { bone: head, at: [s * 0.08, 0.64, 0.45] });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), "#111111", { bone: head, at: [s * 0.1, 0.57, 0.64] });
  }

  // legs
  for (const [zn, zv] of [["F", 0.22], ["H", -0.42]] as [string, number][]) {
    for (const [sn, s] of [["L", 1], ["R", -1]] as [string, number][]) {
      const root = zn === "F" ? spine.joints[1] : hips;
      const leg = b.chain(`leg${zn}${sn}`, [[s * 0.15, 0.3, zv], [s * 0.15, 0.16, zv + 0.02], [s * 0.15, 0.03, zv + 0.04]], {
        parent: root, names: [`hip${zn}${sn}`, `knee${zn}${sn}`, `foot${zn}${sn}`], role: "leg",
      });
      b.sweep(leg, [0.075, 0.05], { color: DARK });
      b.part(new THREE.BoxGeometry(0.09, 0.04, 0.14), DARK, { bone: leg.tip ?? leg.joints[1], at: [s * 0.15, 0.02, zv + 0.08] });
    }
  }

  // bird on head
  const bird = b.joint("bird", { parent: head, at: [0, 0.65, 0.5], dir: [0, 0, 1] });
  b.part(new THREE.SphereGeometry(0.06, 7, 5), BIRD, { bone: bird, at: [0, 0.71, 0.5], scale: [1, 0.9, 1.25] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), BIRD, { bone: bird, at: [0, 0.77, 0.55] });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), BEAK, { bone: bird, at: [0, 0.77, 0.6], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.03, 0.09, 5), BIRD, { bone: bird, at: [0, 0.72, 0.42], dir: [0, 0, -1] });

  return b.root;
}
```