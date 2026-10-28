```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treasure Hoard",
  description: "Blockout of a treasure hoard: open chest, coin heaps, crown, goblets and gems.",
};

export default function build() {
  const b = createBuilder({ name: "hoard" });
  const WOOD = "#6b3f22", DARK = "#3a2314", GOLD = "#e0a82e", GOLD2 = "#f5cf5c";
  const RED = "#c2263a", BLUE = "#2e7fd6", GREEN = "#2fb36b", PURPLE = "#8a45c8", SILVER = "#b9c3d0";
  const rnd = rng(5);

  // Chest (back, centred)
  b.part(new THREE.BoxGeometry(0.9, 0.45, 0.55), WOOD, { at: [0, 0.225, -0.35] });
  b.part(new THREE.BoxGeometry(0.94, 0.06, 0.59), GOLD, { at: [0, 0.45, -0.35] });
  b.part(new THREE.BoxGeometry(0.1, 0.46, 0.6), GOLD, { at: [0.3, 0.23, -0.35] });
  b.part(new THREE.BoxGeometry(0.1, 0.46, 0.6), GOLD, { at: [-0.3, 0.23, -0.35] });
  // Open lid tilted back
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.5), DARK, { at: [0, 0.78, -0.72], rotation: [-100, 0, 0] });
  b.part(new THREE.BoxGeometry(0.94, 0.05, 0.1), GOLD, { at: [0, 0.97, -0.69], rotation: [-100, 0, 0] });
  // Gold fill inside chest
  b.part(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 10), GOLD2, { at: [0, 0.5, -0.35] });

  // Coin heap in front
  b.part(new THREE.ConeGeometry(0.75, 0.4, 10), GOLD, { at: [0, 0.2, 0.25] });
  b.part(new THREE.ConeGeometry(0.4, 0.3, 8), GOLD2, { at: [-0.55, 0.15, 0.1] });
  b.part(new THREE.ConeGeometry(0.35, 0.25, 8), GOLD2, { at: [0.6, 0.125, 0.0] });
  // Loose coins
  for (let i = 0; i < 8; i++) {
    const a = rnd() * 6.28, r = 0.5 + rnd() * 0.5;
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 10), GOLD2, {
      at: [Math.sin(a) * r, 0.01, 0.35 + Math.cos(a) * r * 0.6],
    });
  }
  // Standing coin stacks
  for (let i = 0; i < 5; i++)
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10), GOLD, { at: [0.85, 0.01 + i * 0.02, 0.4] });

  // Crown on heap
  b.part(new THREE.CylinderGeometry(0.2, 0.17, 0.13, 8, 1, true), GOLD2, { at: [0, 0.46, 0.3] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.28;
    b.part(new THREE.ConeGeometry(0.04, 0.12, 5), GOLD2, { at: [Math.sin(a) * 0.19, 0.57, 0.3 + Math.cos(a) * 0.19] });
  }
  b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [0, 0.48, 0.5] });

  // Goblets
  for (const [x, z, c] of [[-0.85, 0.35, GOLD], [-0.7, 0.7, SILVER], [1.0, -0.1, GOLD]] as [number, number, string][]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), c, { at: [x, 0.01, z] });
    b.part(new THREE.CylinderGeometry(0.015, 0.02, 0.14, 6), c, { at: [x, 0.09, z] });
    b.part(new THREE.CylinderGeometry(0.075, 0.035, 0.14, 8), c, { at: [x, 0.23, z] });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { at: [x, 0.3, z] });
  }

  // Gems
  const gems: [number, number, number, string][] = [
    [0.35, 0.3, 0.5, RED], [-0.3, 0.3, 0.55, BLUE], [0.15, 0.4, 0.45, GREEN],
    [-0.9, 0.04, 0.0, PURPLE], [0.5, 0.03, 0.85, BLUE], [-0.2, 0.03, 0.95, GREEN], [0.3, 0.56, -0.3, RED], [-0.3, 0.56, -0.4, PURPLE],
  ];
  for (const [x, y, z, c] of gems)
    b.part(new THREE.OctahedronGeometry(0.05), c, { at: [x, y, z], rotation: [rnd() * 60, rnd() * 90, 0] });

  return b.root;
}
```