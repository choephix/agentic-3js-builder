```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = { name: "Dutch windmill", description: "Cozy Animal Crossing style Dutch windmill with brick base, thatched cap and sails." };

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const BRICK = "#c8664a", BRICK2 = "#b4533c", CREAM = "#f6ecd2", WOOD = "#8a5a36", DWOOD = "#5e3a22";
  const ROOF = "#4f7f6a", ROOF2 = "#3f6a58", GLASS = "#9fd8e8", STONE = "#b9b3a4", GRASS = "#8cc760", RED = "#d9534f";
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });

  // Base ring + stone foundation
  part(new THREE.CylinderGeometry(1.75, 1.85, 0.3, 10), STONE, [0, 0.14, 0]);
  // Tapered brick tower (octagonal)
  part(new THREE.CylinderGeometry(1.1, 1.6, 3.4, 8), BRICK, [0, 2.0, 0]);
  // Cream stripe bands
  for (const [y, r] of [[1.0, 1.5], [2.3, 1.32], [3.5, 1.15]] as number[][])
    part(new THREE.CylinderGeometry(r - 0.02, r + 0.04, 0.14, 8), CREAM, [0, y, 0]);
  // Brick accent blocks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    part(new THREE.BoxGeometry(0.25, 0.18, 0.06), BRICK2, [Math.sin(a) * 1.3, 1.65, Math.cos(a) * 1.3], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // Gallery deck
  part(new THREE.CylinderGeometry(1.35, 1.25, 0.15, 8), WOOD, [0, 3.75, 0]);
  // Cap: dome + thatch roof
  part(new THREE.CylinderGeometry(1.0, 1.15, 0.5, 8), CREAM, [0, 4.05, 0]);
  part(new THREE.ConeGeometry(1.4, 1.3, 8), ROOF, [0, 5.0, 0]);
  part(new THREE.ConeGeometry(1.0, 0.7, 8), ROOF2, [0, 5.6, 0]);
  part(new THREE.SphereGeometry(0.14, 6, 4), RED, [0, 6.0, 0]);
  // Door (front +Z)
  part(new THREE.BoxGeometry(0.7, 1.1, 0.1), DWOOD, [0, 0.85, 1.52]);
  part(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8), DWOOD, [0, 1.4, 1.52], { rotation: [90, 0, 0] });
  part(new THREE.BoxGeometry(0.9, 0.1, 0.16), CREAM, [0, 0.28, 1.58]);
  part(new THREE.SphereGeometry(0.05, 6, 4), "#f2c14e", [0.2, 0.9, 1.6]);
  // Windows
  for (const [x, y, z, ry] of [[0, 2.7, 1.2, 0], [1.2, 2.5, 0, 90], [-1.2, 2.5, 0, 90]] as number[][]) {
    part(new THREE.BoxGeometry(0.5, 0.6, 0.08), GLASS, [x, y, z], { rotation: [0, ry, 0] });
    part(new THREE.BoxGeometry(0.62, 0.72, 0.05), CREAM, [x, y, z - (ry ? 0 : 0.02)], { rotation: [0, ry, 0] });
    part(new THREE.BoxGeometry(0.06, 0.6, 0.1), WOOD, [x, y, z], { rotation: [0, ry, 0] });
  }
  // Flower boxes
  for (const c of ["#ff8fb1", "#ffd54a", "#ff8fb1"])
    part(new THREE.SphereGeometry(0.07, 5, 4), c, [(["#ff8fb1", "#ffd54a"].indexOf(c) - 0.5) * 0.3, 2.35, 1.35]);
  part(new THREE.BoxGeometry(0.6, 0.12, 0.2), WOOD, [0, 2.3, 1.3]);

  // Sails hub (front of cap)
  const hubZ = 1.35, hubY = 4.3;
  part(new THREE.CylinderGeometry(0.2, 0.28, 0.6, 8), DWOOD, [0, hubY, 1.1], { rotation: [90, 0, 0] });
  part(new THREE.SphereGeometry(0.22, 8, 6), RED, [0, hubY, hubZ + 0.15]);
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 20) * Math.PI / 180;
    const dx = Math.sin(a), dy = Math.cos(a);
    const rot = [0, 0, (-a * 180) / Math.PI];
    const z = hubZ + 0.02;
    // spar
    part(new THREE.BoxGeometry(0.12, 4.6, 0.1), WOOD, [dx * 2.4, hubY + dy * 2.4, z], { rotation: rot });
    // lattice sail
    const off = 0.3;
    const sx = dx * 2.8 + dy * off, sy = hubY + dy * 2.8 - dx * off;
    part(new THREE.BoxGeometry(0.75, 3.0, 0.05), CREAM, [sx, sy, z + 0.03], { rotation: rot });
    for (let k = 0; k < 5; k++) {
      const d = 1.5 + k * 0.6;
      part(new THREE.BoxGeometry(0.8, 0.07, 0.07), WOOD, [dx * d + dy * off, hubY + dy * d - dx * off, z + 0.07], { rotation: rot });
    }
    part(new THREE.BoxGeometry(0.06, 3.0, 0.07), WOOD, [sx + dy * 0.0, sy, z + 0.07], { rotation: rot });
  }

  // Tiny garden: grass pad + bushes
  part(new THREE.CylinderGeometry(3.2, 3.3, 0.1, 12), GRASS, [0, 0.0, 0.4]);
  for (const [x, z] of [[-2.2, 1.6], [2.3, 1.4], [-1.6, -2.0]])
    part(new THREE.IcosahedronGeometry(0.4, 0), "#5fae4a", [x, 0.35, z]);
  // Path
  part(new THREE.BoxGeometry(0.9, 0.04, 1.6), "#e6d3a3", [0, 0.07, 2.4]);

  return b.root;
}
```