```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Monster Truck",
  description: "Blocky pixel-style monster truck with huge tyres, lifted body, and solid axles.",
};

export default function build() {
  const b = createBuilder({ name: "monsterTruck" });
  const RED = "#d3262b", DARK = "#1b1b22", GLASS = "#7fc8e8", STEEL = "#6a6d7c", HUB = "#e6b84a";

  const chassis = b.joint("chassis", { at: [0, 1.2, 0], role: "spine" });

  // frame rails and axles
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.22, 4.2), STEEL, { bone: chassis, at: [s * 0.7, 1.25, 0] });
  }
  for (const z of [1.5, -1.5]) {
    b.part(new THREE.BoxGeometry(2.8, 0.25, 0.25), STEEL, { bone: chassis, at: [0, 0.85, z] });
  }

  // body
  b.part(new THREE.BoxGeometry(2.0, 0.7, 4.0), RED, { bone: chassis, at: [0, 1.75, 0] });
  b.part(new THREE.BoxGeometry(1.9, 0.7, 1.5), RED, { bone: chassis, at: [0, 2.4, -0.2] });
  b.part(new THREE.BoxGeometry(1.8, 0.45, 0.06), GLASS, { bone: chassis, at: [0, 2.45, 0.56] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.4, 1.1), GLASS, { bone: chassis, at: [s * 0.96, 2.45, -0.2] });
  }
  b.part(new THREE.BoxGeometry(2.1, 0.25, 0.3), DARK, { bone: chassis, at: [0, 1.5, 2.1] });
  b.part(new THREE.BoxGeometry(2.1, 0.25, 0.3), DARK, { bone: chassis, at: [0, 1.5, -2.1] });
  b.part(new THREE.BoxGeometry(1.2, 0.15, 0.1), HUB, { bone: chassis, at: [0, 1.85, 2.02] });

  // huge wheels (axis along X)
  for (const sx of [1, -1]) {
    for (const z of [1.5, -1.5]) {
      const name = `wheel${sx > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`;
      const w = b.joint(name, { parent: chassis, at: [sx * 1.5, 0.85, z], dir: [sx, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.75, 10), DARK, { bone: w, at: [sx * 1.5, 0.85, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8), HUB, { bone: w, at: [sx * 1.5, 0.85, z], dir: [1, 0, 0] });
      b.part(new THREE.BoxGeometry(0.4, 0.2, 0.2), STEEL, { bone: chassis, at: [sx * 1.0, 0.85, z] });
    }
  }
  return b.root;
}
```