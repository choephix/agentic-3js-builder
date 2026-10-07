```ts
import * as THREE from "three";
import { createBuilder, catmull, mottle, paint } from "agentic-3js-builder";

export const meta = {
  name: "Snail",
  description: "A garden snail: a spiral-painted shell on its back, a soft body with a rigged neck and head, and two eye stalks.",
};

export default function snail() {
  const b = createBuilder({ name: "snail", detail: 1, paintSize: 1024 });

  // Root bone on the ground under the foot.
  b.joint("root", { at: [0, 0, 0] });

  // Spine: rear, mid, neck, head. The last name is the head tip, so the head joint sits at the eye stalks' base.
  const body = b.chain(
    "body",
    catmull([
      [0, 0.04, -0.03],
      [0, 0.045, 0.02],
      [0, 0.05, 0.07],
      [0, 0.055, 0.11],
    ]),
    { role: "spine", names: ["rear", "mid", "neck", "head"] },
  );

  // Soft body: a tapering tube, mottled skin colour.
  const skin = mottle("#c7bd96", "#8d8560", { size: 0.03, seed: 3 });
  b.sweep(body, [0.018, 0.021, 0.019, 0.013], { color: skin, name: "body" });

  // Foot: a flat-soled capsule tapering toward the head, its lowest point on the floor.
  b.capsule(
    [0, 0.016, -0.06],
    [0, 0.016, 0.085],
    [0.016, 0.009],
    { color: "#d9cfa6", name: "foot" },
  );

  // Shell: a squashed dome with a painted coil, the spiral running round the shell's side.
  const coil = paint((p) => {
    const dy = p.y - 0.092;
    const dz = p.z + 0.035;
    const d = Math.hypot(dy, dz);
    const a = Math.atan2(dy, dz) / (2 * Math.PI);
    const f = (((d / 0.011 - a) % 1) + 1) % 1;
    return f < 0.18 ? "#5b3a1e" : f < 0.5 ? "#b97d43" : "#e8c48a";
  });
  b.part(new THREE.SphereGeometry(0.05, b.segments(20), b.segments(14)), coil, {
    at: [0, 0.092, -0.035],
    scale: [0.95, 0.8, 1.1],
    bone: "rear",
    name: "shell",
  });

  // Shell apex: a small pale cap on the top of the whorl.
  b.part(new THREE.SphereGeometry(0.013, b.segments(10), b.segments(8)), "#f0e2bd", {
    at: [0, 0.124, -0.058],
    scale: [1, 0.9, 1],
    bone: "rear",
    name: "apex",
  });

  // Breathing hole (pneumostome) on the right flank.
  b.part(new THREE.SphereGeometry(0.0045, b.segments(8), b.segments(6)), "#3b2a1c", {
    at: [0.019, 0.046, 0.025],
    scale: [0.4, 1, 1],
    bone: "mid",
    name: "pneumostome",
  });

  // Eye stalks: each a rigged two-span chain from the head, with a dark eye at its tip.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const stalk = b.chain(
      `stalk${tag}`,
      catmull([
        [side * 0.009, 0.06, 0.09],
        [side * 0.013, 0.085, 0.1],
        [side * 0.014, 0.1, 0.108],
      ]),
      { role: "tentacle" },
    );
    b.sweep(stalk, [0.005, 0.0033], { color: "#7d6f5c", name: `stalk${tag}` });
    b.part(new THREE.SphereGeometry(0.0072, b.segments(12), b.segments(10)), "#17120e", {
      frame: stalk.at(1),
      name: `eye${tag}`,
    });
  }

  return b.root;
}
```