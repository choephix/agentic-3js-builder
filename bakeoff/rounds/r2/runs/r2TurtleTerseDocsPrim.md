```ts
import * as THREE from "three";
import { createBuilder, catmull, mottle, patches, rng } from "agentic-3js-builder";

export const meta = {
  name: "Sea Turtle",
  description: "Green sea turtle in a rest pose: domed scute shell, flippers spread, jointed neck, head and jaw, short tail.",
};

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });
  const SKIN = mottle("#7d8a55", "#5a6a3c", { size: 0.07, seed: 3 });
  const SKIN_PALE = "#c9c28a";
  const SHELL = patches("#3a2a16", ["#8f6a38", "#7a5a2f", "#9c7c46", "#6e5028"], { size: 0.16, gap: 0.12, seed: 5 });
  const RIM = "#b59a5c";
  const BELLY = "#e3d9a6";
  const BEAK = "#a88a4a";
  const DARK = "#14110d";
  const WHITE = "#f4f1e4";
  void rng;

  const body = b.joint("body", { at: [0, 0.15, 0], role: "spine" });

  // Shell
  b.part(new THREE.SphereGeometry(1, 14, 9), SHELL, { bone: body, at: [0, 0.15, -0.02], scale: [0.38, 0.17, 0.5], flat: true });
  b.part(new THREE.SphereGeometry(1, 12, 6), BELLY, { bone: body, at: [0, 0.07, -0.02], scale: [0.34, 0.07, 0.46], flat: true });
  const rimPts: number[][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    rimPts.push([Math.sin(a) * 0.385, 0.13, -0.02 + Math.cos(a) * 0.5]);
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.028, { bone: body, color: RIM, sides: 6 });
  // Keel ridge studs along the back
  for (let i = 0; i < 5; i++) {
    const z = 0.28 - i * 0.14;
    b.part(new THREE.ConeGeometry(0.03, 0.035, 5), "#5a4025", { bone: body, at: [0, 0.3 - Math.abs(z) * 0.08, z], flat: true });
  }

  // Neck and head
  const neck = b.chain("neck", catmull([[0, 0.17, 0.3], [0, 0.2, 0.47], [0, 0.25, 0.62]]), {
    parent: body, names: ["neck1", "neck2"], role: "neck",
  });
  b.sweep(neck, [0.065, 0.052], { color: SKIN, sides: 8 });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.25, 0.62], dir: [0, 0, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN, { bone: head, at: head.local([0, 0.03, 0.005]), scale: [0.95, 1.25, 0.85] });
  b.frustumBox(head.local([0, 0.07, 0.0]), head.local([0, 0.135, -0.012]), [0.085, 0.05], [0.04, 0.03], { bone: head, color: BEAK });
  const jaw = b.joint("jaw", {
    parent: head, at: head.local([0, 0.03, -0.035]), aim: head.local([0, 0.13, -0.035]), role: "jaw",
  });
  b.frustumBox(head.local([0, 0.045, -0.04]), head.local([0, 0.125, -0.036]), [0.07, 0.02], [0.035, 0.016], { bone: jaw, color: "#8d7238" });
  for (const s of [1, -1]) {
    const e = b.part(new THREE.SphereGeometry(0.02, 6, 4), WHITE, { bone: head, at: head.local([s * 0.06, 0.05, 0.02]) });
    b.part(new THREE.SphereGeometry(0.013, 6, 4), DARK, { bone: head, at: head.local([s * 0.073, 0.055, 0.022]) });
    void e;
    // brow scale
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), SKIN_PALE, { bone: head, at: head.local([s * 0.055, 0.055, 0.047]) });
  }

  // Flippers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `armF${side}`,
      catmull([[s * 0.27, 0.13, 0.2], [s * 0.6, 0.12, 0.2], [s * 0.98, 0.1, 0.06]]),
      { parent: body, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(front, (t) => [0.09 * (1 - t * 0.55) + 0.012, 0.024 * (1 - t) + 0.01], { color: SKIN, sides: 8, caps: "round" });
    const rear = b.chain(
      `legR${side}`,
      catmull([[s * 0.2, 0.12, -0.36], [s * 0.38, 0.11, -0.5], [s * 0.55, 0.1, -0.68]]),
      { parent: body, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(rear, (t) => [0.06 * (1 - t * 0.5) + 0.01, 0.02 * (1 - t) + 0.008], { color: SKIN, sides: 8, caps: "round" });
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.12, -0.46], [0, 0.11, -0.58], [0, 0.1, -0.7]]), {
    parent: body, names: ["tail1", "tail2"], role: "tail",
  });
  b.sweep(tail, [0.04, 0.012], { color: SKIN, sides: 6, caps: "point" });

  return b.root;
}
```