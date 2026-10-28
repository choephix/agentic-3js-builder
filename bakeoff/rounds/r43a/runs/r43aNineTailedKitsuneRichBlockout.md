```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "Blockout of a standing fox with nine fanned tails and spirit flames.",
};

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const FUR = "#f4ece0", ORANGE = "#e8863a", DARK = "#2a1a2e", FLAME = "#6fd8ff", RED = "#c43030";

  const hips = b.joint("hips", { at: [0, 0.62, -0.25], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.25], [0, 0.66, 0.05], [0, 0.72, 0.3]]), {
    parent: hips, names: ["spine1", "spine2"], role: "spine",
  });
  b.sweep(spine, [0.17, 0.15], { color: FUR });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), FUR, { at: [0, 0.62, -0.25], bone: hips });

  const neck = b.chain("neck", catmull([[0, 0.72, 0.3], [0, 0.88, 0.4], [0, 1.0, 0.46]]), {
    parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck",
  });
  b.sweep(neck, [0.1, 0.085], { color: FUR });

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.02, 0.47], dir: [0, 0, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), FUR, { bone: head, at: [0, 1.04, 0.5] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.99, 0.58], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.08, 0.04, 0.16), FUR, { bone: head, at: [0, 1.02, 0.65] });
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.13), FUR, { bone: jaw, at: [0, 0.97, 0.64] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { bone: head, at: [0, 1.04, 0.73] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.06, 0.2, 4), ORANGE, { bone: head, at: [s * 0.08, 1.2, 0.46] });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), RED, { bone: head, at: [s * 0.07, 1.07, 0.61] });
  }

  const legs: [number, number, string][] = [[0.11, 0.2, "F"], [0.11, -0.3, "H"]];
  for (const [x, z, n] of legs)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const top = [s * x, 0.58, z];
      const mid = [s * x, 0.32, z + 0.02];
      const foot = [s * x, 0.04, z + 0.04];
      const leg = b.chain(`leg${n}${side}`, [top, mid, foot], {
        parent: n === "F" ? spine.joints[1] : hips,
        names: [`hip${n}${side}`, `knee${n}${side}`, `paw${n}${side}`], role: "leg",
      });
      b.sweep(leg, [0.055, 0.035], { color: n === "F" ? ORANGE : FUR });
      b.part(new THREE.BoxGeometry(0.09, 0.05, 0.14), DARK, { bone: leg.tip ?? leg.joints[1], at: [s * x, 0.025, z + 0.07] });
    }

  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 1.0;
    const dx = Math.sin(a);
    const base: number[] = [0, 0.7, -0.4];
    const tail = b.chain(`tail${i + 1}`, catmull([
      base, [dx * 0.3, 0.85, -0.75], [dx * 0.7, 1.05 + 0.1 * Math.cos(a), -1.0], [dx * 1.0, 1.3, -1.15],
    ]), { parent: hips, names: [`tail${i + 1}a`, `tail${i + 1}b`, `tail${i + 1}c`], role: "tail" });
    b.sweep(tail, [0.07, 0.12, 0.1, 0.01], { bands: [[0.8, i % 2 ? FUR : ORANGE], [1, FUR]], color: FUR });
    b.part(new THREE.ConeGeometry(0.06, 0.16, 5), FLAME, { bone: tail.joints[2], at: [dx * 1.0, 1.4, -1.17] });
  }

  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.045, 0.14, 5), FLAME, { bone: head, at: [s * 0.3, 1.1, 0.5] });

  return b.root;
}
```