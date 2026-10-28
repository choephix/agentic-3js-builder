```ts
import * as THREE from "three";
import { createBuilder, catmull, limb } from "agentic-3js-builder";

export const meta = {
  name: "African bush elephant",
  description: "Low-poly blockout of an adult African bush elephant in a neutral rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const SKIN = "#8a8580";
  const DARK = "#6f6a66";
  const TUSK = "#efe6cf";

  const hips = b.joint("hips", { at: [0, 1.9, -0.9], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 2.0, 0.5], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 2.2, 1.5], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.3, 1.9], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.8, 2.5], dir: [0, 0, 1], role: "jaw" });

  // Body barrel
  b.loft(
    [
      { at: [0, 2.0, -1.8], w: 1.4, h: 1.7 },
      { at: [0, 2.1, -0.9], w: 1.9, h: 2.1 },
      { at: [0, 2.15, 0.2], w: 2.0, h: 2.2 },
      { at: [0, 2.2, 1.2], w: 1.7, h: 2.0 },
    ],
    { bone: [hips, chest], color: SKIN },
  );

  // Head
  b.part(new THREE.BoxGeometry(1.2, 1.4, 1.1), SKIN, { bone: head, at: [0, 2.45, 2.0] });
  b.part(new THREE.BoxGeometry(0.5, 0.4, 0.4), DARK, { bone: head, at: [0, 2.0, 2.65] });
  b.part(new THREE.BoxGeometry(0.4, 0.25, 0.35), DARK, { bone: jaw, at: [0, 1.75, 2.6] });

  // Ears
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.1, 0.9], [0.8, 1.0], [1.0, 0.2], [0.5, -0.5]],
      { at: [s * 0.55, 2.7, 1.8], x: [s, 0, 0], thickness: 0.06, color: DARK, bone: head },
    );
  }

  // Trunk
  const trunk = b.chain(
    "trunk",
    catmull([[0, 2.2, 2.4], [0, 1.6, 2.8], [0, 0.9, 3.0], [0, 0.35, 3.2]]),
    { parent: head, role: "tentacle", count: 3 },
  );
  b.sweep(trunk, [0.28, 0.1], { color: SKIN });

  // Tusks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.45, 1.9, 2.4], [s * 0.6, 1.4, 3.0], [s * 0.6, 1.2, 3.6]]),
      [0.1, 0.02],
      { color: TUSK, bone: head, caps: { end: "point" } },
    );
  }

  // Legs
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    for (const [tag, z, root] of [["F", 0.9, chest], ["H", -1.4, hips]] as const) {
      const pts = limb([s * 0.7, 1.4, z], [s * 0.7, 0.12, z], [0.7, 0.7], [[0, 0, 1]]);
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent: root,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `foot${tag}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.38, 0.3], { color: SKIN });
      b.part(new THREE.CylinderGeometry(0.34, 0.36, 0.2, 8), DARK, {
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
        at: [s * 0.7, 0.1, z + 0.03],
      });
    }
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 2.6, -1.9], [0, 2.0, -2.2], [0, 1.2, -2.3]]), {
    parent: hips,
    role: "tail",
    count: 2,
  });
  b.sweep(tail, [0.1, 0.04], { color: DARK });

  return b.root;
}
```