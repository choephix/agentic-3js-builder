```ts
import * as THREE from "three";
import { createBuilder, patches, rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";

export const meta = {
  name: "Green Sea Turtle",
  description: "Gliding green sea turtle with heart-shaped plated shell, wide flippers and a remora under the shell.",
};

const OLIVE = "#6b7a35";
const MOSS = "#58652b";
const CARAMEL = "#b88a3e";
const AMBER = "#9a6f2c";
const DARK = "#3b2a14";
const CREAM = "#e8dfa8";
const BELLY = "#efe08a";
const SKIN = "#6f8040";
const BEAK = "#c9a766";
const EYE = "#16110b";
const REMORA = "#6c7480";
const REMORA_D = "#3b4048";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "seaTurtle" });
  const hips = b.joint("hips", { at: [0, 0.33, 0], role: "spine" });

  // Shell
  const shellPaint = patches(DARK, [OLIVE, CARAMEL, MOSS, AMBER], { size: 0.15 });
  b.loft(
    [
      { at: [0, 0.3, -0.56], w: 0.08, h: 0.06 },
      { at: [0, 0.33, -0.4], w: 0.45, h: 0.18 },
      { at: [0, 0.36, -0.15], w: 0.8, h: 0.3 },
      { at: [0, 0.37, 0.1], w: 0.92, h: 0.33 },
      { at: [0, 0.36, 0.32], w: 0.78, h: 0.28 },
      { at: [0, 0.33, 0.48], w: 0.5, h: 0.18 },
    ],
    { color: shellPaint, bone: hips },
  );
  // Plastron
  b.loft(
    [
      { at: [0, 0.25, -0.42], w: 0.2, h: 0.08 },
      { at: [0, 0.25, -0.15], w: 0.55, h: 0.1 },
      { at: [0, 0.25, 0.1], w: 0.65, h: 0.1 },
      { at: [0, 0.25, 0.32], w: 0.5, h: 0.09 },
      { at: [0, 0.25, 0.45], w: 0.28, h: 0.07 },
    ],
    { color: BELLY, bone: hips },
  );

  // Neck and head
  const neck = b.chain("neck", catmull([[0, 0.33, 0.4], [0, 0.34, 0.58], [0, 0.36, 0.72]]), {
    parent: hips,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const skinPaint = patches(CREAM, [SKIN, OLIVE, MOSS], { size: 0.05 });
  b.sweep(neck, 0.085, { color: skinPaint });
  const head = b.joint("head", { parent: neck, at: [0, 0.36, 0.72], aim: [0, 0.36, 0.9], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.335, 0.8], aim: [0, 0.335, 0.92], role: "jaw" });
  b.part(new THREE.SphereGeometry(0.1, 10, 8), skinPaint, { bone: head, at: [0, 0.37, 0.8], scale: [1, 0.85, 1.25] });
  b.part(new THREE.BoxGeometry(0.11, 0.035, 0.1), BEAK, { bone: head, at: [0, 0.345, 0.92] });
  b.part(new THREE.BoxGeometry(0.09, 0.03, 0.1), BEAK, { bone: jaw, at: [0, 0.31, 0.89] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, { bone: head, at: [s * 0.085, 0.395, 0.84] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", { bone: head, at: [s * 0.105, 0.405, 0.86] });
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.05), CREAM, { bone: head, at: [s * 0.08, 0.43, 0.83], rotation: [0, 0, s * -20] });
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.3, -0.5], [0, 0.28, -0.7]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });
  b.sweep(tail, [0.045, 0.015], { color: SKIN });

  // Flippers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `flipF${side}`,
      catmull([[s * 0.38, 0.27, 0.22], [s * 0.65, 0.2, 0.3], [s * 1.0, 0.12, 0.15], [s * 1.38, 0.03, -0.08]]),
      { parent: hips, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `flipperTip${side}`], role: "arm" },
    );
    b.sweep(front, (t) => [0.12 * (1 - t) + 0.02, 0.03 * (1 - t) + 0.008], {
      color: patches(CREAM, [SKIN, OLIVE, MOSS], { size: 0.08 }),
      caps: "point",
    });
    const rear = b.chain(
      `flipR${side}`,
      catmull([[s * 0.22, 0.27, -0.4], [s * 0.38, 0.18, -0.58], [s * 0.52, 0.1, -0.8]]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `footTip${side}`], role: "leg" },
    );
    b.sweep(rear, (t) => [0.07 * (1 - t) + 0.015, 0.022 * (1 - t) + 0.007], {
      color: patches(CREAM, [SKIN, OLIVE], { size: 0.07 }),
      caps: "point",
    });
  }

  // Remora riding under the shell
  b.sweep(
    [[0, 0.13, 0.22], [0, 0.13, 0.0], [0, 0.13, -0.14]],
    (t) => 0.05 * (1 - t) + 0.014,
    { bone: hips, color: REMORA, sectors: [[125, 235, "#cfd3d6"]] },
  );
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.17), REMORA_D, { bone: hips, at: [0, 0.18, 0.1] });
  b.extrude(
    [[0, 0], [0.07, 0.05], [0.05, 0], [0.07, -0.05]],
    { at: [0, 0.13, -0.15], x: [0, 0, -1], thickness: 0.01, color: REMORA, bone: hips },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 5, 4), EYE, { bone: hips, at: [s * 0.04, 0.145, 0.17] });
    b.extrude([[0, 0], [0.05, -0.02], [0.02, 0.01]], {
      at: [s * 0.045, 0.12, 0.08], x: [s * 0.5, 0, -1], thickness: 0.006, color: REMORA_D, bone: hips,
    });
  }
  rng(1);

  return b.root;
}
```