import * as THREE from "three";
import { createBuilder, rng, stripes, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Lighthouse Island",
  description: "A striped lighthouse on a tiny rocky island with a dock, boat and gallery.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const tower = b.joint("tower", { parent: base, at: [0, 0.5, 0], dir: [0, 1, 0] });
  const lamp = b.joint("lamp", { parent: tower, at: [0, 3.2, 0], dir: [0, 1, 0] });

  const ROCK = mottle("#6b6a68", "#8a8780", { size: 0.35, seed: 3 });
  const ROCK2 = "#59585a";
  const GRASS = mottle("#5f9a45", "#7bb552", { size: 0.2, seed: 5 });
  const RED = "#d8342c", WHITE = "#f4f1ea", DARK = "#2a2d36", GOLD = "#f2c744";
  const WATER = "#3a86b8";
  const SAND = "#d9c48c", WOOD = "#8a5a34";

  // sea disc
  b.part(new THREE.CylinderGeometry(2.6, 2.6, 0.06, 20), WATER, { bone: base, at: [0, 0.0, 0], flat: true });
  // island: stacked faceted rocks
  const r = rng(11);
  b.part(new THREE.CylinderGeometry(1.5, 1.9, 0.35, 9), SAND, { bone: base, at: [0, 0.15, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.1, 1.45, 0.4, 8), ROCK, { bone: base, at: [0, 0.45, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.95, 1.05, 0.12, 8), GRASS, { bone: base, at: [0, 0.69, 0], flat: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.4;
    const d = 1.45 + r() * 0.5;
    const s = 0.14 + r() * 0.2;
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 2 ? ROCK : ROCK2, {
      bone: base, at: [Math.cos(a) * d, 0.12 + s * 0.3, Math.sin(a) * d], scale: [1, 0.7, 1], flat: true,
    });
  }
  // grass tufts / bushes
  for (let i = 0; i < 6; i++) {
    const a = 0.6 + i * 0.9 + r() * 0.3;
    const d = 0.65 + r() * 0.25;
    b.part(new THREE.IcosahedronGeometry(0.1 + r() * 0.06, 0), "#3f7d3a", {
      bone: base, at: [Math.cos(a) * d, 0.8, Math.sin(a) * d], flat: true,
    });
  }
  // base plinth
  b.part(new THREE.CylinderGeometry(0.5, 0.58, 0.2, 10), "#7d7a78", { bone: tower, at: [0, 0.8, 0], flat: true });

  // tower: striped lathe-like frustum
  const towerCol = stripes(WHITE, RED, { size: 0.5, axis: "y", width: 0.5, wobble: 0 });
  b.part(new THREE.CylinderGeometry(0.28, 0.42, 2.5, 12), towerCol, { bone: tower, at: [0, 2.15, 0] });
  // door
  b.part(new THREE.BoxGeometry(0.16, 0.28, 0.06), WOOD, { bone: tower, at: [0, 1.04, 0.41] });
  b.part(new THREE.SphereGeometry(0.08, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), WOOD, { bone: tower, at: [0, 1.18, 0.405], scale: [1, 1, 0.4] });
  // windows
  for (const y of [1.7, 2.3, 2.85]) {
    const rad = 0.42 - ((y - 0.9) / 2.5) * 0.14;
    b.part(new THREE.BoxGeometry(0.09, 0.14, 0.05), DARK, { bone: tower, at: [0, y, rad - 0.01] });
    b.part(new THREE.BoxGeometry(0.09, 0.14, 0.05), DARK, { bone: tower, at: [rad - 0.01, y + 0.2, 0], rotation: [0, 90, 0] });
  }
  // gallery
  b.part(new THREE.CylinderGeometry(0.5, 0.42, 0.08, 12), DARK, { bone: lamp, at: [0, 3.42, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.34, 0.3, 0.06, 12), WHITE, { bone: lamp, at: [0, 3.38, 0] });
  // railing
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 4), DARK, { bone: lamp, at: [Math.cos(a) * 0.47, 3.54, Math.sin(a) * 0.47] });
  }
  b.part(new THREE.TorusGeometry(0.47, 0.012, 4, 20), DARK, { bone: lamp, at: [0, 3.62, 0], rotation: [90, 0, 0] });
  // lantern room
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.3, 8), "#bfe9f2", { bone: lamp, at: [0, 3.61, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), GOLD, { bone: lamp, at: [0, 3.61, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.BoxGeometry(0.02, 0.32, 0.02), DARK, { bone: lamp, at: [Math.cos(a) * 0.245, 3.61, Math.sin(a) * 0.245] });
  }
  // roof
  b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.04, 8), DARK, { bone: lamp, at: [0, 3.78, 0] });
  b.part(new THREE.ConeGeometry(0.26, 0.26, 8), RED, { bone: lamp, at: [0, 3.93, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, { bone: lamp, at: [0, 4.09, 0] });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), DARK, { bone: lamp, at: [0, 4.2, 0] });

  // dock
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.12), WOOD, { bone: base, at: [1.45 + i * 0.13 * 0 + 0.0, 0.3, 0.9 + i * 0.13], rotation: [0, 0, 0], scale: [1, 1, 1] });
  }
  for (const z of [0.9, 1.4]) for (const x of [1.32, 1.58]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 5), "#5e3b20", { bone: base, at: [x, 0.2, z] });
  }
  // little boat
  b.part(new THREE.BoxGeometry(0.22, 0.08, 0.5), "#c24a3a", { bone: base, at: [1.95, 0.08, 1.0], flat: true });
  b.part(new THREE.ConeGeometry(0.11, 0.2, 4), "#c24a3a", { bone: base, at: [1.95, 0.08, 1.35], rotation: [90, 45, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.4), WHITE, { bone: base, at: [1.95, 0.125, 1.0] });

  // tiny keeper hut
  b.part(new THREE.BoxGeometry(0.4, 0.26, 0.3), WHITE, { bone: base, at: [-0.6, 0.88, 0.2] });
  b.part(new THREE.ConeGeometry(0.32, 0.2, 4), RED, { bone: base, at: [-0.6, 1.11, 0.2], rotation: [0, 45, 0], scale: [1, 1, 0.8], flat: true });
  b.part(new THREE.BoxGeometry(0.08, 0.12, 0.02), WOOD, { bone: base, at: [-0.6, 0.83, 0.36] });

  return b.root;
}
