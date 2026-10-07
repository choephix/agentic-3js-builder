```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "African Elephant",
  description: "A stylized African bull elephant, rigged with a spine, trunk, jaw, ears, tail and four legs, built from primitives.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });

  const GRAY = "#8a8782";
  const GRAY2 = "#76726e";
  const BELLY = "#a29d97";
  const IVORY = "#efe6cf";
  const DARK = "#2a2523";
  const EAR = "#85817d";
  const EARIN = "#b69690";
  const skin = countershade(mottle(GRAY, GRAY2, { size: 0.35, contrast: 0.6, seed: 3 }), BELLY, { level: -0.3 });

  // ---- spine ----
  const hips = b.joint("hips", { at: [0, 2.1, -1.4] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.1, -1.4],
      [0, 2.15, -0.3],
      [0, 2.2, 0.7],
      [0, 2.2, 1.1],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  b.sweep(spine, (t) => [0.72 + 0.08 * t, 0.8 + 0.06 * t], { color: skin });

  // ---- neck & head ----
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.2, 1.0],
      [0, 2.3, 1.4],
      [0, 2.3, 1.85],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "head"], role: "neck" },
  );
  b.sweep(neck, 0.5, { color: skin });
  const head = neck.tip!;

  b.part(new THREE.SphereGeometry(0.6, 12, 9), skin, { bone: head, at: [0, 2.4, 1.95], scale: [0.95, 1.1, 1] });
  for (const s of [1, -1]) {
    // forehead domes, cheeks
    b.part(new THREE.SphereGeometry(0.3, 9, 7), skin, { bone: head, at: [s * 0.24, 2.85, 2.0] });
    b.part(new THREE.SphereGeometry(0.25, 8, 6), skin, { bone: head, at: [s * 0.38, 2.15, 2.15] });
    // eyes
    b.part(new THREE.SphereGeometry(0.05, 6, 5), DARK, { bone: head, at: [s * 0.53, 2.5, 2.25] });
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.12), GRAY2, { bone: head, at: [s * 0.54, 2.57, 2.24] });
  }

  // ---- jaw ----
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 2.05], aim: [0, 1.9, 2.5], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.5, 0.18, 0.42), BELLY, { bone: jaw, at: [0, 1.95, 2.25] });

  // ---- trunk ----
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.3, 2.4],
      [0, 1.9, 2.85],
      [0, 1.2, 3.05],
      [0, 0.55, 3.0],
      [0, 0.25, 2.7],
    ]),
    { parent: head, role: "tentacle" },
  );
  b.sweep(trunk, [0.3, 0.1], {
    color: countershade(mottle(GRAY, GRAY2, { size: 0.2, seed: 5 }), BELLY, { level: -0.2 }),
    sides: 8,
    caps: "round",
  });
  // finger-like tip
  b.part(new THREE.ConeGeometry(0.06, 0.14, 5), EARIN, { bone: trunk.joints[trunk.joints.length - 1], at: [0, 0.2, 2.62], rotation: [-60, 0, 0] });

  // ---- sides ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // tusks
    const tusk = catmull([
      [s * 0.28, 2.0, 2.15],
      [s * 0.42, 1.6, 2.5],
      [s * 0.46, 1.35, 3.0],
      [s * 0.4, 1.5, 3.5],
    ]);
    b.sweep(tusk, [0.075, 0.012], { bone: head, color: IVORY, sides: 7, caps: { end: "point" } });

    // ears
    const earJ = b.joint(`ear${S}`, { parent: head, at: [s * 0.45, 2.7, 1.7], dir: [s, 0, -0.3], role: "hinge" });
    const outline: [number, number][] = [
      [0, 0.45],
      [0.3, 0.55],
      [0.8, 0.4],
      [1.05, 0],
      [1.0, -0.5],
      [0.7, -0.95],
      [0.35, -0.9],
      [0.05, -0.5],
    ];
    b.extrude(outline, { at: [s * 0.45, 2.7, 1.7], x: [s, 0, -0.3], thickness: 0.04, smoothing: 1, color: EAR, bone: earJ });
    const inner = outline.map(([x, y]) => [x * 0.75 + 0.1, y * 0.75 - 0.05] as [number, number]);
    b.extrude(inner, { at: [s * 0.45, 2.7, 1.7], x: [s, 0, -0.3], thickness: 0.055, smoothing: 1, color: EARIN, bone: earJ });

    // legs: front and rear
    const legs = [
      { tag: "F", names: ["shoulder", "elbow", "wrist", "foot"], z: [0.75, 0.78, 0.74, 0.75] },
      { tag: "H", names: ["hip", "knee", "ankle", "foot"], z: [-1.15, -1.0, -1.15, -1.15] },
    ];
    for (const L of legs) {
      const ys = [1.8, 1.0, 0.5, 0.15];
      const pts = ys.map((y, i) => [s * 0.48, y, L.z[i]]);
      const parent = L.tag === "F" ? spine.joints[2] : spine.joints[0];
      const leg = b.chain(`leg${L.tag}${S}`, pts, {
        parent,
        names: L.names.map((n) => n + L.tag + S),
        role: "leg",
        contact: [s * 0.48, 0, L.z[3]],
      });
      b.sweep(leg, [0.36, 0.3, 0.26, 0.28], { caps: "flat", color: skin });
      const fx = s * 0.48;
      const fz = L.z[3];
      b.part(new THREE.CylinderGeometry(0.31, 0.34, 0.22, 10), GRAY2, { bone: leg.tip!, at: [fx, 0.11, fz] });
      for (const k of [-0.17, 0, 0.17]) {
        b.part(new THREE.BoxGeometry(0.11, 0.08, 0.07), IVORY, {
          bone: leg.tip!,
          at: [fx + k, 0.07, fz + 0.31 - Math.abs(k) * 0.4],
        });
      }
    }
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.5, -1.9],
      [0, 2.1, -2.15],
      [0, 1.6, -2.2],
      [0, 1.2, -2.2],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, [0.08, 0.035], { color: GRAY2, sides: 6, caps: "round" });
  b.spike([0, 1.3, -2.2], [0, -1, 0], 0.28, 0.07, { color: DARK, bone: tail.joints[2] });

  return b.root;
}
```