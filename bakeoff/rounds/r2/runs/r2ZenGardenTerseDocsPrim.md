```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Japanese Garden",
  description: "A small zen garden with a pond, arched bridge, stone lantern, raked gravel, pine, maple and a torii gate.",
};

export default function build() {
  const b = createBuilder({ name: "garden" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);

  const GRAVEL = "#e6dfcc", RAKE = "#cfc6ae", MOSS = "#5e8a3c", MOSS2 = "#4a7430";
  const STONE = "#8d8d86", STONE2 = "#6f706b", WATER = "#4f9db0", WOOD = "#8a4b2a";
  const RED = "#c8321f", DARK = "#2b2622", TRUNK = "#5b3f2a", PINE = "#2f5f35", PINE2 = "#3d7440";
  const MAPLE = "#d6402a", MAPLE2 = "#e8782b", PINK = "#f0b6c4", BLACK = "#1c1c1c";

  // ground base
  b.part(new THREE.BoxGeometry(8, 0.2, 8), MOSS, { at: [0, -0.08, 0] });
  b.part(new THREE.BoxGeometry(8.2, 0.12, 8.2), TRUNK, { at: [0, -0.06, 0] });
  b.part(new THREE.BoxGeometry(8, 0.2, 8), mottle(MOSS, MOSS2, { size: 0.6, seed: 2 }), { at: [0, -0.08, 0] });

  // gravel zone (left-back) with rake lines
  b.part(new THREE.BoxGeometry(3.2, 0.06, 3.0), GRAVEL, { at: [-2.2, 0.05, -2.3] });
  for (let i = 0; i < 9; i++)
    b.part(new THREE.BoxGeometry(2.9, 0.02, 0.05), RAKE, { at: [-2.2, 0.09, -3.6 + i * 0.3] });
  // rocks in gravel
  const rock = (x: number, z: number, s: number, c = STONE) => {
    b.part(new THREE.DodecahedronGeometry(s, 0), c, { at: [x, s * 0.6, z], scale: [1, 0.75, 1.2], rotation: [0, R() * 90, 0], flat: true });
  };
  rock(-2.6, -2.4, 0.38);
  rock(-2.15, -2.1, 0.22, STONE2);
  rock(-3.0, -2.0, 0.15);
  b.part(new THREE.SphereGeometry(0.2, 6, 4), MOSS, { at: [-2.6, 0.5, -2.4], scale: [1, 0.4, 1] });

  // pond
  b.part(new THREE.CylinderGeometry(1.7, 1.8, 0.14, 12), STONE2, { at: [1.3, 0.04, 0.3], flat: true });
  b.part(new THREE.CylinderGeometry(1.5, 1.5, 0.16, 12), WATER, { at: [1.3, 0.06, 0.3], flat: true });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rock(1.3 + Math.cos(a) * 1.7, 0.3 + Math.sin(a) * 1.7, 0.16 + R() * 0.14, i % 2 ? STONE : STONE2);
  }
  // lily pads
  for (const [x, z] of [[0.8, 0.0], [1.7, 0.7], [1.5, -0.4], [0.9, 0.9]])
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 8), MOSS2, { at: [x, 0.16, z] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), PINK, { at: [1.7, 0.2, 0.7] });

  // arched bridge across pond (along X)
  const bridge = catmull([[-0.5, 0.2, 0.3], [0.4, 0.62, 0.3], [1.3, 0.8, 0.3], [2.2, 0.62, 0.3], [3.1, 0.2, 0.3]]);
  b.sweep(bridge, { radius: [0.4, 0.4], color: WOOD, section: "box" });
  b.sweep(bridge.slice(0, 1), { radius: (t) => [0.3, 0.07], color: RED, section: "box", caps: "flat" });
  for (const s of [1, -1]) {
    const z = 0.3 + s * 0.36;
    const rail = catmull([[-0.3, 0.55, z], [0.5, 0.95, z], [1.3, 1.15, z], [2.1, 0.95, z], [2.9, 0.55, z]]);
    b.sweep(rail, 0.035, { color: RED, sides: 6 });
    for (let i = 0; i < 6; i++) {
      const p = rail.at(i / 5);
      const base = bridge.at(i / 5);
      b.rod([p.x, base.y + 0.1, z], [p.x, p.y, z], 0.03, { color: RED, sides: 6 });
    }
  }

  // stone lantern
  const lx = -1.2, lz = 1.8;
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 6), STONE, { at: [lx, 0.1, lz], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6), STONE, { at: [lx, 0.45, lz], flat: true });
  b.part(new THREE.CylinderGeometry(0.28, 0.16, 0.1, 6), STONE2, { at: [lx, 0.8, lz], flat: true });
  b.part(new THREE.BoxGeometry(0.28, 0.26, 0.28), STONE, { at: [lx, 0.98, lz] });
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.3), "#ffd479", { at: [lx, 0.98, lz] });
  b.part(new THREE.ConeGeometry(0.5, 0.3, 4), STONE2, { at: [lx, 1.25, lz], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), STONE, { at: [lx, 1.43, lz] });

  // torii gate (front right)
  const tx = 2.6, tz = 2.6;
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 2.2, 8), RED, { at: [tx + s * 0.8, 1.1, tz] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), BLACK, { at: [tx + s * 0.8, 0.03, tz] });
  }
  b.part(new THREE.BoxGeometry(2.5, 0.14, 0.2), BLACK, { at: [tx, 2.12, tz] });
  b.part(new THREE.BoxGeometry(2.2, 0.12, 0.16), RED, { at: [tx, 2.27, tz] });
  b.part(new THREE.BoxGeometry(1.9, 0.09, 0.12), RED, { at: [tx, 1.8, tz] });
  b.part(new THREE.BoxGeometry(0.1, 0.4, 0.12), RED, { at: [tx, 1.98, tz] });
  // stepping stones
  for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 7), STONE, { at: [tx - i * 0.45 + R() * 0.1, 0.1, tz - 0.7 - i * 0.4], flat: true });

  // pine tree
  const px = -3, pz = 1.2;
  const trunk = catmull([[px, 0, pz], [px + 0.2, 0.7, pz], [px - 0.1, 1.4, pz + 0.1], [px + 0.3, 2.1, pz]]);
  b.sweep(trunk, [0.2, 0.08], { color: TRUNK, sides: 6 });
  const pad = (x: number, y: number, z: number, r: number, c: string) =>
    b.part(new THREE.SphereGeometry(r, 7, 4), c, { at: [x, y, z], scale: [1.4, 0.45, 1.2], flat: true });
  pad(px + 0.9, 1.5, pz, 0.6, PINE);
  pad(px - 0.7, 1.2, pz + 0.3, 0.5, PINE2);
  pad(px + 0.3, 2.3, pz, 0.7, PINE);
  pad(px - 0.3, 2.0, pz - 0.5, 0.45, PINE2);
  b.rod([px, 1.3, pz], [px + 0.8, 1.45, pz], 0.04, { color: TRUNK, sides: 5 });

  // maple tree
  const mx = 3.0, mz = -1.8;
  b.sweep(catmull([[mx, 0, mz], [mx - 0.1, 0.8, mz], [mx + 0.1, 1.5, mz]]), [0.17, 0.08], { color: TRUNK, sides: 6 });
  b.rod([mx, 1.2, mz], [mx - 0.6, 1.8, mz + 0.2], 0.05, { color: TRUNK, sides: 5 });
  b.rod([mx, 1.3, mz], [mx + 0.6, 1.9, mz - 0.2], 0.05, { color: TRUNK, sides: 5 });
  const cols = [MAPLE, MAPLE2, MAPLE];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.4 + R() * 0.15, 0), cols[i % 3], {
      at: [mx + Math.cos(a) * 0.65, 2.0 + R() * 0.5, mz + Math.sin(a) * 0.65], flat: true,
    });
  }
  b.part(new THREE.IcosahedronGeometry(0.6, 0), MAPLE2, { at: [mx, 2.5, mz], flat: true });
  // fallen petals
  for (let i = 0; i < 14; i++)
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 5), i % 2 ? MAPLE : MAPLE2, {
      at: [mx + (R() - 0.5) * 2.5, 0.11, mz + (R() - 0.3) * 2.5], rotation: [0, R() * 90, 0],
    });

  // bamboo clump
  for (let i = 0; i < 6; i++) {
    const x = -3.4 + R() * 0.5, z = -3.4 + R() * 0.5, h = 2.2 + R() * 0.8;
    b.sweep([[x, 0, z], [x + 0.05, h, z]], 0.04, { color: "#7aa84a", sides: 6 });
    for (let k = 1; k < 5; k++)
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 6), "#4f7a30", { at: [x + 0.01 * k, (h * k) / 5, z] });
    b.part(new THREE.SphereGeometry(0.25, 5, 3), "#6fae4e", { at: [x, h, z], scale: [1, 0.5, 1], flat: true });
  }

  // low fence
  for (let i = 0; i < 12; i++) {
    b.part(new THREE.BoxGeometry(0.08, 0.5, 0.08), WOOD, { at: [-3.8 + i * 0.4, 0.3, 3.85] });
  }
  b.part(new THREE.BoxGeometry(4.8, 0.06, 0.06), TRUNK, { at: [-1.6, 0.45, 3.85] });

  return b.root;
}
```