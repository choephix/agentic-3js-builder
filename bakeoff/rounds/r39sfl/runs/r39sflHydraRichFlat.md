```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, offset } from "agentic-3js-builder";

export const meta = {
  name: "Five-Headed Hydra",
  description: "Scaled five-necked hydra in a grim, battle-scarred God of War style, with bone spikes and glowing eyes.",
};

const SCALE = "#2f4a3a", SCALE_D = "#1d2f26", BELLY = "#b7a678", BONE = "#d8cfae", EYE = "#ffb02a", DARK = "#15110f", BLOOD = "#7a1a14", IRON = "#4a4a50";

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(5);
  const hips = b.joint("hips", { at: [0, 1.5, -0.4], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.7, 0.8], aim: [0, 1.8, 1.4], role: "spine" });

  // body
  b.loft([
    { at: [0, 1.4, -1.6], w: 1.2, h: 1.1 },
    { at: [0, 1.6, -0.4], w: 2.2, h: 1.9 },
    { at: [0, 1.75, 0.8], w: 2.0, h: 1.8 },
    { at: [0, 1.8, 1.4], w: 1.3, h: 1.3 },
  ], { bone: hips, color: SCALE });
  b.loft([
    { at: [0, 0.95, -0.4], w: 1.5, h: 0.5 },
    { at: [0, 1.0, 0.8], w: 1.4, h: 0.5 },
  ], { bone: hips, color: BELLY });

  // tail
  const tailPts: number[][] = [[0, 1.4, -1.4], [0, 1.2, -2.4], [0, 0.9, -3.4], [0.4, 0.6, -4.3]];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, role: "tail", count: 4 });
  b.sweep(tail, [0.5, 0.06], { color: SCALE });

  // legs
  for (const s of [1, -1]) {
    for (const [z, n] of [[0.9, "F"], [-1.0, "H"]] as [number, string][]) {
      const hip = b.joint(`hip${n}${s > 0 ? "L" : "R"}`, { parent: hips, at: [s * 0.9, 1.2, z], dir: [0, -1, 0], role: "leg" });
      b.sweep(catmull([[s * 0.9, 1.2, z], [s * 1.1, 0.7, z + 0.15], [s * 1.1, 0.12, z + 0.3]]), [0.38, 0.2], { bone: hip, color: SCALE_D });
      b.part(new THREE.BoxGeometry(0.6, 0.18, 0.8), SCALE_D, { bone: hip, at: [s * 1.1, 0.09, z + 0.5] });
      for (let i = -1; i <= 1; i++)
        b.spike([s * 1.1 + i * 0.2, 0.1, z + 0.85], [0, 0.1, 1], 0.25, 0.07, { color: BONE, bone: hip });
    }
  }

  // dorsal spikes and armor plates
  for (let i = 0; i < 9; i++) {
    const z = -1.5 + i * 0.35, y = 2.3 - Math.abs(i - 4) * 0.04;
    b.spike([0, y, z], [0, 1, -0.3], 0.3 + R() * 0.2, 0.09, { color: BONE, bone: hips });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.5, 0.08, 0.4), IRON, { bone: hips, at: [s * 0.95, 2.0, -0.8 + i * 0.6], rotation: [0, 0, s * 25] });
  // scars
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.9), BLOOD, { bone: hips, at: [s * 1.12, 1.7, 0.2], rotation: [20, 0, 0] });

  // five necks
  const dirs = [[-1.9, 3.3, 2.2], [-1.0, 4.2, 2.7], [0, 4.7, 3.0], [1.0, 4.2, 2.7], [1.9, 3.3, 2.2]];
  dirs.forEach((tip, k) => {
    const ox = (k - 2) * 0.28;
    const base: number[] = [ox, 2.0, 1.2];
    const mid: number[] = [tip[0] * 0.45, 3.0 + (k % 2) * 0.2, 1.7];
    const path = catmull([base, mid, tip]);
    const neck = b.chain(`neck${k}`, path, { parent: chest, role: "neck", count: 3 });
    b.sweep(neck, [0.32, 0.2], { color: k % 2 ? SCALE : SCALE_D });
    b.along(neck, 4, (at) => b.spike(at, at, 0.18, 0.05, { color: BONE }));
    const head = b.joint(`head${k}`, { parent: neck.joints[2], at: tip, dir: [tip[0] * 0.1, -0.15, 1], role: "head" });
    const jaw = b.joint(`jaw${k}`, { parent: head, at: head.local({ forward: 0.0, down: 0.05 }), dir: [0, -0.1, 1], role: "jaw" });
    // skull and jaws
    b.part(new THREE.BoxGeometry(0.42, 0.3, 0.5), SCALE, { bone: head, at: head.local({ forward: 0.2 }) });
    b.part(new THREE.BoxGeometry(0.3, 0.2, 0.5), SCALE_D, { bone: head, at: head.local({ forward: 0.62, up: -0.02 }) });
    b.part(new THREE.BoxGeometry(0.34, 0.1, 0.8), BELLY, { bone: jaw, at: head.local({ forward: 0.42, down: 0.15 }) });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.06, 6, 4), EYE, { bone: head, at: head.local({ forward: 0.25, up: 0.1, left: s * 0.18 }) });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), EYE, { bone: head, at: head.local({ forward: 0.25, up: 0.1, left: s * 0.18 }) });
      b.spike(head.local({ forward: 0.0, up: 0.12, left: s * 0.15 }), [s * 0.5, 0.4, -1], 0.5, 0.06, { color: BONE, bone: head });
      b.spike(head.local({ forward: 0.7, down: 0.0, left: s * 0.1 }), [0, -1, 0.1], 0.14, 0.03, { color: BONE, bone: head });
      b.spike(head.local({ forward: 0.7, down: 0.17, left: s * 0.1 }), [0, 1, 0.1], 0.12, 0.03, { color: BONE, bone: jaw });
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.04), DARK, { bone: head, at: head.local({ forward: 0.9, up: 0.05, left: s * 0.05 }) });
    }
  });

  // ground contact: feet at y=0
  return b.root;
}
```