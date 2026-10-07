```ts
import * as THREE from "three";
import { createBuilder, rng, stripes, mottle, svg } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island Diorama",
  description: "Cozy lighthouse, keeper's cottage, jetty, rowboat, gulls and flowers on a rocky island with turquoise water on a round base.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const base = b.joint("base", { at: [0, 0.05, 0] });
  const R = rng(5);

  const WOOD = "#8a5a33", DWOOD = "#5e3b22", ROCK = "#7d7f86", ROCK2 = "#9a9ca3";
  const RED = "#d83a32", WHITE = "#f6f1e6", IRON = "#26272c", GLOW = "#ffe27a";
  const WATER = "#2fc4c4", FOAM = "#ffffff", GRASS = "#5fae4a", GRASS2 = "#3f8c3a";
  const ROOF = "#a8442f", WALL = "#efe3c8", BLUE = "#2f6fc4";

  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: base, at, flat: true, ...o });

  // display base
  part(new THREE.CylinderGeometry(2.0, 2.1, 0.12, 32), WOOD, [0, 0.06, 0]);
  part(new THREE.CylinderGeometry(2.12, 2.12, 0.04, 32), DWOOD, [0, 0.14, 0]);
  // water
  part(new THREE.CylinderGeometry(1.95, 1.95, 0.2, 32), WATER, [0, 0.2, 0]);
  // wave bumps
  for (let i = 0; i < 14; i++) {
    const a = R() * 6.28, d = 1.2 + R() * 0.65;
    part(new THREE.BoxGeometry(0.25 + R() * 0.2, 0.02, 0.05), "#7fe3e0", [Math.cos(a) * d, 0.31, Math.sin(a) * d], { rotation: [0, R() * 180, 0] });
  }
  // foam rings
  part(new THREE.CylinderGeometry(1.05, 1.05, 0.03, 18), FOAM, [0, 0.31, 0]);

  // island rock layers
  part(new THREE.CylinderGeometry(0.95, 1.05, 0.2, 9), ROCK, [0, 0.38, 0]);
  part(new THREE.CylinderGeometry(0.85, 0.95, 0.15, 8), ROCK2, [0, 0.52, 0], { rotation: [0, 15, 0] });
  part(new THREE.CylinderGeometry(0.78, 0.85, 0.05, 10), GRASS, [0, 0.62, 0]);
  // boulders around
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.28 + R() * 0.3, d = 0.95 + R() * 0.15;
    const s = 0.1 + R() * 0.12;
    part(new THREE.DodecahedronGeometry(s, 0), i % 2 ? ROCK : ROCK2, [Math.cos(a) * d, 0.36 + s * 0.5, Math.sin(a) * d], { rotation: [R() * 90, R() * 90, 0] });
  }

  // lighthouse at back-left
  const LX = -0.2, LZ = -0.2;
  const tower = b.lathe(
    [[0, 0], [0.3, 0], [0.19, 1.5], [0, 1.5]],
    { at: [LX, 0.64, LZ], bone: base, segments: 12, color: stripes(WHITE, RED, { size: 0.3, axis: "y", width: 0.5 }) },
  );
  void tower;
  for (let i = 0; i < 5; i++) {
    const y = 0.64 + i * 0.3 + 0.15;
    const r = 0.3 - (0.11 * (i * 0.3 + 0.15)) / 1.5;
    part(new THREE.CylinderGeometry(r - 0.005 + 0.012, r + 0.04, 0.15, 12), i % 2 ? WHITE : RED, [LX, y, LZ]);
  }
  // door and windows
  part(new THREE.BoxGeometry(0.12, 0.2, 0.05), BLUE, [LX, 0.76, LZ + 0.29]);
  for (const y of [1.3, 1.75]) part(new THREE.BoxGeometry(0.07, 0.12, 0.05), GLOW, [LX, y, LZ + 0.22 - (y - 1.3) * 0.07]);
  // gallery
  const gy = 2.2;
  part(new THREE.CylinderGeometry(0.34, 0.3, 0.06, 12), IRON, [LX, gy, LZ]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.28;
    part(new THREE.BoxGeometry(0.02, 0.14, 0.02), IRON, [LX + Math.cos(a) * 0.33, gy + 0.1, LZ + Math.sin(a) * 0.33]);
  }
  part(new THREE.TorusGeometry(0.33, 0.012, 4, 12), IRON, [LX, gy + 0.17, LZ], { rotation: [90, 0, 0] });
  // lantern room
  part(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 8), GLOW, [LX, gy + 0.18, LZ]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28 + 0.4;
    part(new THREE.BoxGeometry(0.02, 0.3, 0.02), IRON, [LX + Math.cos(a) * 0.175, gy + 0.18, LZ + Math.sin(a) * 0.175]);
  }
  part(new THREE.SphereGeometry(0.09, 8, 6), "#fff6c0", [LX, gy + 0.18, LZ]);
  part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), IRON, [LX, gy + 0.35, LZ]);
  part(new THREE.ConeGeometry(0.2, 0.22, 8), RED, [LX, gy + 0.48, LZ]);
  part(new THREE.SphereGeometry(0.035, 6, 4), IRON, [LX, gy + 0.62, LZ]);

  // cottage at front-right
  const CX = 0.35, CZ = 0.3;
  part(new THREE.BoxGeometry(0.5, 0.3, 0.38), WALL, [CX, 0.79, CZ], { rotation: [0, -15, 0] });
  part(new THREE.CylinderGeometry(0.01, 0.31, 0.2, 4, 1), ROOF, [CX, 1.04, CZ], { rotation: [0, 30, 0], scale: [1, 1, 0.78] });
  part(new THREE.BoxGeometry(0.09, 0.17, 0.03), BLUE, [CX + 0.0, 0.73, CZ + 0.2], { rotation: [0, -15, 0] });
  part(new THREE.SphereGeometry(0.008, 4, 3), "#ffd54a", [CX + 0.03, 0.73, CZ + 0.22]);
  for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.08, 0.08, 0.03), GLOW, [CX + s * 0.16 + 0.04, 0.82, CZ + 0.2 - s * 0.04], { rotation: [0, -15, 0] });
  }
  // crooked chimney
  part(new THREE.BoxGeometry(0.08, 0.14, 0.08), "#8d4b3a", [CX + 0.14, 1.12, CZ - 0.03], { rotation: [0, 0, -6] });
  part(new THREE.BoxGeometry(0.08, 0.1, 0.08), "#8d4b3a", [CX + 0.15, 1.22, CZ - 0.03], { rotation: [0, 10, -14] });
  part(new THREE.BoxGeometry(0.1, 0.02, 0.1), IRON, [CX + 0.17, 1.28, CZ - 0.03], { rotation: [0, 10, -14] });
  for (let i = 0; i < 3; i++) part(new THREE.SphereGeometry(0.03 + i * 0.012, 6, 4), "#e8e8ee", [CX + 0.2 + i * 0.04, 1.36 + i * 0.09, CZ - 0.03]);

  // jetty
  const JX = 0.1, JZ0 = 1.0;
  for (let i = 0; i < 8; i++) {
    part(new THREE.BoxGeometry(0.34, 0.03, 0.09), i % 2 ? WOOD : DWOOD, [JX + 0.5 + i * 0.0, 0.5, 0], { scale: [1, 1, 1], at: [0.9 + i * 0.1, 0.46, 0.75 + i * 0.0] , rotation: [0, 90, 0] });
  }
  void JZ0;
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 5), DWOOD, [0.95 + i * 0.25, 0.3, 0.75 + s * 0.15]);
  }
  // rowboat
  const bx = 1.3, bz = 1.1;
  part(new THREE.BoxGeometry(0.28, 0.06, 0.62), "#b8402f", [bx, 0.34, bz], { rotation: [0, -10, 0] });
  part(new THREE.BoxGeometry(0.26, 0.04, 0.5), "#f0d9a8", [bx, 0.37, bz], { rotation: [0, -10, 0] });
  part(new THREE.ConeGeometry(0.14, 0.2, 4), "#b8402f", [bx + 0.03, 0.34, bz + 0.38], { rotation: [90, -10, 45] });
  part(new THREE.BoxGeometry(0.28, 0.03, 0.05), WOOD, [bx, 0.42, bz], { rotation: [0, -10, 0] });
  b.rod([1.2, 0.45, 0.85], [bx + 0.03, 0.4, bz + 0.3], 0.008, { color: "#d8c28a", bone: base });
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 4), WOOD, [bx + 0.2, 0.42, bz - 0.05], { rotation: [70, 0, 25] });

  // gulls
  for (const g of [[-0.7, 0.8, 0.5, 20], [0.9, 0.7, -0.5, -40]]) {
    const [x, y, z, r] = g;
    part(new THREE.SphereGeometry(0.06, 6, 5), WHITE, [x, y, z], { scale: [0.8, 0.8, 1.3], rotation: [0, r, 0] });
    part(new THREE.SphereGeometry(0.04, 6, 5), WHITE, [x + Math.sin(r * 0.0175) * 0.07, y + 0.06, z + Math.cos(r * 0.0175) * 0.07]);
    part(new THREE.ConeGeometry(0.015, 0.05, 4), "#f5a623", [x + Math.sin(r * 0.0175) * 0.12, y + 0.06, z + Math.cos(r * 0.0175) * 0.12], { rotation: [90, r, 0] });
    part(new THREE.BoxGeometry(0.1, 0.01, 0.05), "#9aa0aa", [x, y + 0.03, z - 0.02], { rotation: [0, r, 0], scale: [1.2, 1, 1] });
    part(new THREE.ConeGeometry(0.03, 0.08, 4), "#9aa0aa", [x - Math.sin(r * 0.0175) * 0.1, y, z - Math.cos(r * 0.0175) * 0.1], { rotation: [-90, r, 0] });
    for (const s of [-1, 1]) part(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 3), "#f5a623", [x + s * 0.02, y - 0.06, z]);
    part(new THREE.SphereGeometry(0.008, 4, 3), IRON, [x + Math.sin(r * 0.0175) * 0.09 + 0.02, y + 0.075, z + Math.cos(r * 0.0175) * 0.09]);
  }

  // grass tufts and flowers
  const flowerC = ["#ffd23f", "#ff7aa8", "#ffffff", "#b58cff"];
  for (let i = 0; i < 26; i++) {
    const a = R() * 6.28, d = 0.2 + R() * 0.6;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.abs(x - LX) < 0.35 && Math.abs(z - LZ) < 0.35) continue;
    if (Math.abs(x - CX) < 0.35 && Math.abs(z - CZ) < 0.3) continue;
    if (i % 3) {
      for (let k = 0; k < 3; k++) part(new THREE.ConeGeometry(0.018, 0.1 + R() * 0.05, 4), k % 2 ? GRASS : GRASS2, [x + (k - 1) * 0.02, 0.69, z], { rotation: [0, 0, (k - 1) * 18] });
    } else {
      part(new THREE.CylinderGeometry(0.006, 0.006, 0.1, 3), GRASS2, [x, 0.69, z]);
      part(new THREE.SphereGeometry(0.03, 5, 4), flowerC[i % 4], [x, 0.76, z]);
      part(new THREE.SphereGeometry(0.014, 4, 3), "#f59a1a", [x, 0.78, z]);
    }
  }
  // rocks on island top
  for (let i = 0; i < 4; i++) {
    const a = 2.3 + i * 0.7;
    part(new THREE.DodecahedronGeometry(0.07, 0), ROCK2, [Math.cos(a) * 0.65, 0.68, Math.sin(a) * 0.65], { rotation: [R() * 90, R() * 90, 0] });
  }

  return b.root;
}
```