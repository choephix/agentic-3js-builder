import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description: "Blockout of a flame-plumed phoenix with wings spread, standing on y = 0.",
};

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const RED = "#d9381e", ORANGE = "#ff8a1f", GOLD = "#ffd24a", DARK = "#7a1a1a", BEAK = "#f2b640";

  const hips = b.joint("hips", { at: [0, 0.75, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.85, 0.2], aim: [0, 1, 0.5], role: "spine" });
  const neck = b.chain("neck", catmull([[0, 0.95, 0.3], [0, 1.2, 0.45], [0, 1.45, 0.5]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.45, 0.5], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.45, 0.62], dir: [0, 0, 1], role: "jaw" });

  b.part(new THREE.SphereGeometry(0.3, 8, 6), RED, { bone: hips, at: [0, 0.85, 0.05], scale: [0.85, 0.8, 1.35] });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), ORANGE, { bone: chest, at: [0, 0.95, 0.35], scale: [1, 0.9, 1] });
  b.sweep(neck, [0.12, 0.08], { color: ORANGE });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), RED, { bone: head, at: [0, 1.5, 0.55] });
  b.part(new THREE.ConeGeometry(0.05, 0.16, 6), BEAK, { bone: head, at: [0, 1.48, 0.7], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.04, 0.12, 6), BEAK, { bone: jaw, at: [0, 1.44, 0.68], dir: [0, 0, 1] });
  b.spike([0, 1.58, 0.5], [0, 0.6, -0.5], 0.3, 0.04, { color: GOLD, bone: head });
  b.spike([0, 1.58, 0.5], [0, 0.9, -0.2], 0.25, 0.035, { color: ORANGE, bone: head });

  // tail
  const tail = b.chain("tail", catmull([[0, 0.8, -0.2], [0, 0.75, -0.8], [0, 0.6, -1.5], [0, 0.4, -2.2]]), {
    parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail",
  });
  b.sweep(tail, [0.16, 0.03], { color: ORANGE });
  for (const s of [1, -1]) {
    b.spike([0, 0.6, -1.2], [s * 0.35, -0.2, -1], 1.1, 0.05, { color: GOLD, bone: tail.joints[1] });
    b.spike([0, 0.7, -1.0], [s * 0.15, 0.1, -1], 1.3, 0.05, { color: RED, bone: tail.joints[1] });
  }

  // wings
  for (const side of [1, -1]) {
    const n = side > 0 ? "L" : "R";
    const w = b.chain(`wing${n}`, catmull([[side * 0.25, 1.1, 0.25], [side * 0.9, 1.4, 0.1], [side * 1.7, 1.5, -0.1], [side * 2.5, 1.45, -0.3]]), {
      parent: chest, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "wing",
    });
    b.sweep(w, [0.09, 0.04], { color: RED });
    const cols = [GOLD, ORANGE, RED, ORANGE, DARK];
    for (let i = 0; i < 5; i++) {
      const t = 0.3 + i * 0.17;
      const base = w.at(Math.min(t, 1)).at;
      const bj = i < 2 ? w.joints[1] : w.joints[2];
      b.spike(base, [side * (0.25 + i * 0.1), -0.15, -1], 1.3 - i * 0.1, 0.12, { color: cols[i], bone: bj });
    }
    for (let i = 0; i < 3; i++) {
      const base = w.at(0.15 + i * 0.12).at;
      b.spike(base, [side * 0.1, -0.3, -1], 0.7, 0.1, { color: GOLD, bone: w.joints[0] });
    }
  }

  // legs
  for (const side of [1, -1]) {
    const n = side > 0 ? "L" : "R";
    const leg = b.chain(`leg${n}`, [[side * 0.14, 0.7, 0.05], [side * 0.15, 0.4, 0.1], [side * 0.15, 0.05, 0.15]], {
      parent: hips, names: [`hip${n}`, `knee${n}`, `foot${n}`], role: "leg",
    });
    b.sweep(leg, 0.04, { color: BEAK });
    for (const a of [-0.3, 0, 0.3]) {
      b.spike([side * 0.15, 0.04, 0.15], [side * 0.15 + a * 0.3, 0.02, 0.4], null, 0.025, { color: BEAK, bone: leg.joints[2] });
    }
  }

  return b.root;
}
