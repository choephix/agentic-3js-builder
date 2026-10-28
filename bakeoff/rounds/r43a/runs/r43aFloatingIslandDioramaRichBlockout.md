```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Sky Island",
  description: "Blockout of a floating sky island with ruins, a waterfall and trees.",
};

export default function build() {
  const b = createBuilder({ name: "skyisland" });
  b.joint("root", { at: [0, 0, 0] });

  const ROCK = "#7a6a5a", ROCKD = "#5a4c42", GRASS = "#6cc04a", STONE = "#d9d2bc",
    WATER = "#6fd6ff", TRUNK = "#6b4a30", LEAF = "#3f9e4a", LEAF2 = "#8ccf4f", GOLD = "#e8c25a";

  // Underside rock: inverted stacked cones
  b.part(new THREE.CylinderGeometry(2.6, 1.6, 0.9, 9), ROCK, { at: [0, 2.9, 0] });
  b.part(new THREE.CylinderGeometry(1.6, 0.7, 1.2, 8), ROCKD, { at: [0, 1.85, 0] });
  b.part(new THREE.ConeGeometry(0.7, 1.2, 7), ROCK, { at: [0.1, 0.6, 0], rotation: [180, 0, 0] });
  b.part(new THREE.ConeGeometry(0.3, 0.8, 6), ROCKD, { at: [-0.9, 1.0, 0.5], rotation: [180, 0, 0] });

  // Grass top
  b.part(new THREE.CylinderGeometry(2.7, 2.6, 0.25, 9), GRASS, { at: [0, 3.47, 0] });

  // Ruins: pillars, arch lintel, floor slab
  b.part(new THREE.BoxGeometry(1.4, 0.1, 1.4), STONE, { at: [-0.8, 3.65, 0.6] });
  for (const [x, z, h] of [[-1.4, 0.1, 1.2], [-0.2, 0.1, 0.8], [-1.4, 1.2, 0.6], [-0.2, 1.2, 1.1]]) {
    b.part(new THREE.BoxGeometry(0.2, h, 0.2), STONE, { at: [x, 3.6 + h / 2, z] });
  }
  b.part(new THREE.BoxGeometry(1.5, 0.15, 0.22), STONE, { at: [-0.8, 4.8, 0.1] });
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.3), GOLD, { at: [-0.8, 3.8, 0.65] });

  // Trees
  for (const [x, z, s] of [[1.3, -0.6, 1], [1.8, 0.7, 0.8], [0.4, -1.6, 0.9]]) {
    b.part(new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.9 * s, 6), TRUNK, { at: [x, 3.6 + 0.45 * s, z] });
    b.part(new THREE.IcosahedronGeometry(0.5 * s, 0), LEAF, { at: [x, 4.5 * 1 + 0.2 * s - 0.1, z] });
    b.part(new THREE.IcosahedronGeometry(0.32 * s, 0), LEAF2, { at: [x + 0.2 * s, 4.75, z + 0.1] });
  }

  // Waterfall from front edge
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.5), WATER, { at: [0.8, 3.62, 2.3] });
  b.part(new THREE.BoxGeometry(0.6, 2.8, 0.12), WATER, { at: [0.8, 2.2, 2.62] });
  b.part(new THREE.SphereGeometry(0.3, 6, 4), WATER, { at: [0.8, 0.7, 2.62] });

  return b.root;
}
```