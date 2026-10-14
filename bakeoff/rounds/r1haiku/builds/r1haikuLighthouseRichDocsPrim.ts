import * as THREE from "three";
import { createBuilder, mottle, rng, stripes } from "../../../../src/index";

export const meta = {
  name: "lighthouse-island",
  description: "A striped lighthouse, keeper's cottage, jetty and rowboat on a tiny rocky island in turquoise water.",
};

// Palette
const WOOD = "#6b4a2b";
const BRASS = "#c9a24a";
const WATER = mottle("#1fbfbb", "#63e6d8", { size: 0.35, seed: 3 });
const FOAM = "#ffffff";
const ROCK = mottle("#8e949c", "#646b75", { size: 0.25, seed: 5 });
const GRASS = mottle("#84cc5c", "#4ea642", { size: 0.2, seed: 9 });
const GRASS_BLADE = "#5aa83c";
const STEM = "#3f8f36";
const RED = "#d8402f";
const WHITE = "#f6f3ea";
const TOWER = stripes(RED, WHITE, { size: 0.4, axis: "y" });
const IRON = "#1f2226";
const GLASS = "#ffe98a";
const CREAM = "#f5ead0";
const ROOF = "#8a3b2a";
const BRICK = "#a4503a";
const DOOR = "#2f6fb5";
const WINDOW = "#fff1c4";
const PIER = "#9c6b43";
const PIER_DARK = "#7a5233";
const BOAT = "#f4efe2";
const BOAT_STRIPE = "#e0573c";
const ROPE = "#b89a6a";
const GULL = "#fbfbf8";
const BEAK = "#f2b531";
const PINK = "#f28bb3";
const YELLOW = "#ffd23f";
const PURPLE = "#9b7ede";
const FLOWER_WHITE = "#fff7fb";

const TOWER_X = 0;
const TOWER_Z = -0.25;
const COTTAGE_X = -0.5;
const COTTAGE_Z = 0.25;

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("root", { at: [0, 0, 0] });
  const rnd = rng(11);

  // ---- Display base, water, foam ----
  b.part(new THREE.CylinderGeometry(1.7, 1.76, 0.2, 40), WOOD, { at: [0, 0.1, 0] });
  b.part(new THREE.TorusGeometry(1.7, 0.03, 6, 40), BRASS, { at: [0, 0.2, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 40), WATER, { at: [0, 0.21, 0] });
  b.part(new THREE.TorusGeometry(1.3, 0.035, 6, 28), FOAM, { at: [0, 0.225, 0], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(1.46, 0.02, 5, 28), FOAM, { at: [0, 0.22, 0], rotation: [90, 0, 0] });

  // ---- Island ----
  b.part(new THREE.CylinderGeometry(1.05, 1.25, 0.18, 20), ROCK, { at: [0, 0.3, 0] });
  b.part(new THREE.CylinderGeometry(0.98, 1.04, 0.05, 20), GRASS, { at: [0, 0.415, 0] });

  // Rocks around the island edge, half sunk into the water (keep the jetty side clear)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2;
    const x = Math.sin(a) * 1.12;
    const z = Math.cos(a) * 1.12;
    if (z > 0.55 && Math.abs(x) < 0.4) continue;
    const s = 0.8 + rnd() * 0.5;
    b.part(new THREE.DodecahedronGeometry(0.15 * s, 0), ROCK, {
      at: [x, 0.26, z],
      scale: [1, 0.7, 1],
      rotation: [rnd() * 40, rnd() * 180, rnd() * 40],
    });
  }

  // A couple of rocks on the grass
  b.part(new THREE.DodecahedronGeometry(0.1, 0), ROCK, { at: [0.55, 0.45, -0.55], scale: [1, 0.6, 1.2] });
  b.part(new THREE.DodecahedronGeometry(0.07, 0), ROCK, { at: [-0.85, 0.45, -0.3], scale: [1, 0.7, 1] });

  // ---- Lighthouse tower ----
  const towerBase = 0.44;
  b.part(new THREE.CylinderGeometry(0.22, 0.3, 1.6, 16), TOWER, { at: [TOWER_X, towerBase + 0.8, TOWER_Z] });
  // door and window on the front (+Z)
  b.part(new THREE.BoxGeometry(0.12, 0.22, 0.03), IRON, { at: [TOWER_X, towerBase + 0.11, TOWER_Z + 0.31] });
  b.part(new THREE.BoxGeometry(0.07, 0.12, 0.03), WINDOW, { at: [TOWER_X, 1.1, TOWER_Z + 0.28] });

  // balcony deck, railing and posts
  const balconyY = 2.065;
  b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 16), IRON, { at: [TOWER_X, balconyY, TOWER_Z] });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const px = TOWER_X + Math.sin(a) * 0.34;
    const pz = TOWER_Z + Math.cos(a) * 0.34;
    b.part(new THREE.BoxGeometry(0.025, 0.25, 0.025), IRON, { at: [px, 2.21, pz] });
  }
  b.part(new THREE.TorusGeometry(0.34, 0.014, 5, 20), IRON, {
    at: [TOWER_X, 2.33, TOWER_Z],
    rotation: [90, 0, 0],
  });

  // glowing lantern room, roof and finial
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8), GLASS, { at: [TOWER_X, 2.24, TOWER_Z] });
  b.part(new THREE.ConeGeometry(0.26, 0.2, 8), ROOF, { at: [TOWER_X, 2.54, TOWER_Z] });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), IRON, { at: [TOWER_X, 2.66, TOWER_Z] });

  // ---- Keeper's cottage ----
  const cottageY = 0.44;
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.4), CREAM, { at: [COTTAGE_X, cottageY + 0.15, COTTAGE_Z] });
  // gable end
  b.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0, 0.3],
    ],
    { at: [COTTAGE_X, cottageY + 0.3, COTTAGE_Z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.4, color: CREAM },
  );
  // two sloping roof planes meeting at a ridge
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.62), ROOF, {
    at: [COTTAGE_X - 0.15, 0.93, COTTAGE_Z],
    rotation: [0, 0, 35],
  });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.62), ROOF, {
    at: [COTTAGE_X + 0.15, 0.93, COTTAGE_Z],
    rotation: [0, 0, -35],
  });
  // crooked chimney
  b.part(new THREE.BoxGeometry(0.1, 0.32, 0.1), BRICK, {
    at: [COTTAGE_X + 0.12, 1.05, COTTAGE_Z - 0.2],
    rotation: [0, 0, -12],
  });
  // blue door, window and flower box on the front
  b.part(new THREE.BoxGeometry(0.12, 0.22, 0.03), DOOR, { at: [COTTAGE_X, cottageY + 0.11, COTTAGE_Z + 0.215] });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.03), WINDOW, { at: [COTTAGE_X + 0.2, 0.6, COTTAGE_Z + 0.21] });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.04), WOOD, { at: [COTTAGE_X + 0.2, 0.54, COTTAGE_Z + 0.22] });
  for (const dx of [0.16, 0.2, 0.24]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 5), dx > 0.18 ? PINK : YELLOW, {
      at: [COTTAGE_X + dx, 0.57, COTTAGE_Z + 0.23],
    });
  }

  // ---- Jetty ----
  b.part(new THREE.BoxGeometry(0.34, 0.06, 0.7), PIER, { at: [0, 0.27, 1.15] });
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.34, 0.012, 0.03), PIER_DARK, { at: [0, 0.306, 0.87 + i * 0.14] });
  }
  for (const px of [-0.15, 0.15]) {
    for (const pz of [0.9, 1.4]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), WOOD, { at: [px, 0.2, pz] });
    }
  }

  // ---- Rowboat tied to the jetty ----
  const boatAt: [number, number, number] = [0.4, 0.2, 1.15];
  const hull = [
    [-0.32, 0.12],
    [-0.22, -0.02],
    [0.22, -0.02],
    [0.32, 0.12],
  ] as [number, number][];
  b.extrude(hull, { at: boatAt, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.2, color: BOAT });
  b.extrude(
    [
      [-0.32, 0.12],
      [0.32, 0.12],
      [0.32, 0.08],
      [-0.32, 0.08],
    ],
    { at: boatAt, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.21, color: BOAT_STRIPE },
  );
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.06), WOOD, { at: [0.4, 0.34, 1.15] });
  b.rod([0.17, 0.32, 1.1], [0.3, 0.33, 1.1], 0.008, { color: ROPE });

  // ---- Seagulls (in the air, so they keep their height) ----
  const gull = (x: number, y: number, z: number, yaw: number) => {
    const at: [number, number, number] = [x, y, z];
    b.part(new THREE.SphereGeometry(0.1, 10, 8), GULL, { at, scale: [1, 0.8, 1.8], rotation: [0, yaw, 0] });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), GULL, { at: [x, y + 0.06, z + 0.16] });
    b.part(new THREE.ConeGeometry(0.025, 0.08, 6), BEAK, {
      at: [x, y + 0.05, z + 0.24],
      dir: [0, 0, 1],
    });
    for (const ex of [-0.03, 0.03]) {
      b.part(new THREE.SphereGeometry(0.009, 5, 4), IRON, { at: [x + ex, y + 0.08, z + 0.2] });
    }
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.1), GULL, { at: [x, y + 0.01, z - 0.2] });
    b.part(new THREE.BoxGeometry(0.1, 0.015, 0.06), IRON, { at: [x, y + 0.012, z - 0.23] });
    for (const s of [1, -1]) {
      b.extrude(
        [
          [0, 0.1],
          [0.18, 0.08],
          [0.38, -0.02, "sharp"],
          [0.22, -0.1],
          [0, -0.1],
        ],
        { at: [x, y + 0.03, z], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.015, color: GULL },
      );
    }
  };
  gull(0.55, 1.35, -0.1, 0);
  gull(-0.6, 1.7, -0.5, 0);

  // ---- Grass tufts and wildflowers on the island ----
  const groundY = 0.44;
  const blocked = (x: number, z: number) => {
    if (Math.hypot(x - TOWER_X, z - TOWER_Z) < 0.4) return true;
    if (Math.hypot(x - COTTAGE_X, z - COTTAGE_Z) < 0.42) return true;
    if (z > 0.5 && Math.abs(x) < 0.25) return true;
    return false;
  };
  const flowerColors = [PINK, YELLOW, PURPLE, FLOWER_WHITE];
  for (let i = 0; i < 44; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = 0.2 + Math.sqrt(rnd()) * 0.75;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    if (blocked(x, z)) continue;

    if (i % 3 === 0) {
      const h = 0.1 + rnd() * 0.04;
      const base: [number, number, number] = [x, groundY, z];
      b.spike(base, [0, 1, 0], h, 0.005, { color: STEM });
      b.part(new THREE.SphereGeometry(0.025, 6, 5), flowerColors[i % flowerColors.length], {
        at: [x, groundY + h, z],
      });
    } else {
      for (let k = 0; k < 3; k++) {
        const len = 0.07 + rnd() * 0.04;
        const dir: [number, number, number] = [(rnd() - 0.5) * 0.45, 1, (rnd() - 0.5) * 0.45];
        b.spike([x + (k - 1) * 0.012, groundY, z], dir, len, 0.008, { color: GRASS_BLADE });
      }
    }
  }

  return b.root;
}
