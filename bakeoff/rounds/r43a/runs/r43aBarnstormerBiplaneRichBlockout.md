```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Barnstormer Biplane",
  description: "Blockout of a whimsical open-cockpit biplane with two wings, tail, prop and wheels.",
};

export default function build() {
  const b = createBuilder({ name: "biplane" });
  const RED = "#d94a38", CREAM = "#f4e3b5", DARK = "#3a2a28", WOOD = "#a8743c", STEEL = "#8c939c";
  const fuselage = b.joint("fuselage", { at: [0, 1.0, 0], role: "spine" });
  const prop = b.joint("prop", { parent: fuselage, at: [0, 1.0, 1.55], dir: [0, 0, 1] });

  // fuselage body
  b.sweep(
    catmull([[0, 1.0, 1.4], [0, 1.0, 0.6], [0, 1.0, -0.4], [0, 1.1, -1.5], [0, 1.2, -2.5]]),
    [0.3, 0.3, 0.26, 0.14, 0.05],
    { color: RED, bone: fuselage, caps: "round" },
  );
  // cowling and spinner
  b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.3, 10), STEEL, { bone: fuselage, at: [0, 1.0, 1.4], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.12, 0.2, 8), CREAM, { bone: prop, at: [0, 1.0, 1.7], dir: [0, 0, 1] });
  // propeller
  b.part(new THREE.BoxGeometry(1.8, 0.14, 0.04), WOOD, { bone: prop, at: [0, 1.0, 1.58] });
  // cockpit
  b.part(new THREE.BoxGeometry(0.4, 0.1, 0.5), DARK, { bone: fuselage, at: [0, 1.3, 0.1] });

  // wings
  for (const [y, z, w] of [[1.75, 0.5, 4.6], [1.0, 0.45, 4.2]] as number[][]) {
    b.part(new THREE.BoxGeometry(w, 0.07, 0.85), CREAM, { bone: fuselage, at: [0, y, z] });
    for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.06, 0.88), RED, { bone: fuselage, at: [s * w / 2, y, z] });
  }
  // struts
  for (const s of [1, -1]) for (const x of [0.9, 1.9]) for (const z of [0.2, 0.75]) {
    b.rod([s * x, 1.0, z], [s * x, 1.75, z], 0.025, WOOD, { bone: fuselage });
  }
  // tail
  b.part(new THREE.BoxGeometry(1.4, 0.05, 0.55), CREAM, { bone: fuselage, at: [0, 1.15, -2.2] });
  b.part(new THREE.BoxGeometry(0.05, 0.6, 0.6), RED, { bone: fuselage, at: [0, 1.5, -2.3] });

  // landing gear
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 0.85, 0.7], [s * 0.6, 0.4, 0.9], 0.04, DARK, { bone: fuselage });
    b.rod([s * 0.2, 0.85, 1.1], [s * 0.6, 0.4, 0.9], 0.04, DARK, { bone: fuselage });
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.14, 14), DARK, { bone: fuselage, at: [s * 0.65, 0.4, 0.9], dir: [1, 0, 0] });
  }
  b.part(new THREE.SphereGeometry(0.07, 6, 4), DARK, { bone: fuselage, at: [0, 0.07, -2.2] });
  b.rod([0, 1.05, -2.3], [0, 0.1, -2.2], 0.03, DARK, { bone: fuselage });

  return b.root;
}
```