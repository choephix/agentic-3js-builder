import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Wizard's Bookshelf",
  description: "Tall wooden bookshelf with tomes, scrolls, orbs and candles (blockout).",
};

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const WOOD = "#6b4226";
  const DARK = "#4a2c18";
  const RED = "#8c2a3a";
  const BLUE = "#2e4a9c";
  const GREEN = "#2f7a55";
  const PURPLE = "#6a3aa0";
  const PAPER = "#e8d9a8";
  const GOLD = "#d9a83a";
  const WAX = "#f2ead0";
  const ORB = "#6ad0e8";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  const W = 1.4, H = 2.0, D = 0.38, T = 0.04;
  // sides, back, top, plinth
  box(T, H, D, WOOD, W / 2 - T / 2, H / 2, 0);
  box(T, H, D, WOOD, -W / 2 + T / 2, H / 2, 0);
  box(W, H, 0.03, DARK, 0, H / 2, -D / 2 + 0.015);
  box(W + 0.1, 0.06, D + 0.08, DARK, 0, H + 0.01, 0.0);
  box(W, 0.1, D, DARK, 0, 0.05, 0);
  // pointed crown
  b.part(new THREE.ConeGeometry(0.3, 0.3, 4), PURPLE, { at: [0, H + 0.19, 0], rotation: [0, 45, 0] });

  const shelves = [0.1, 0.55, 1.0, 1.45, 1.94];
  for (const y of shelves) box(W, T, D, WOOD, 0, y, 0);

  const cols = [RED, BLUE, GREEN, PURPLE, GOLD];
  // shelf 1: books
  let x = -0.6;
  for (let i = 0; i < 9; i++) {
    const h = 0.32 + (i % 3) * 0.05;
    const w = 0.06 + (i % 2) * 0.03;
    box(w, h, 0.26, cols[i % 5], x + w / 2, 0.12 + h / 2, 0);
    x += w + 0.01;
  }
  // leaning stack of tomes on right
  box(0.3, 0.07, 0.24, RED, 0.45, 0.16, 0);
  box(0.26, 0.06, 0.22, BLUE, 0.45, 0.225, 0);
  box(0.22, 0.06, 0.2, GREEN, 0.45, 0.285, 0);

  // shelf 2: scrolls and books
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), PAPER, {
      at: [-0.55 + i * 0.09, 0.62, 0.02], rotation: [90, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), GOLD, {
      at: [-0.55 + i * 0.09, 0.62, 0.17], rotation: [90, 0, 0],
    });
  }
  x = -0.15;
  for (let i = 0; i < 6; i++) {
    const h = 0.3 + (i % 2) * 0.06;
    box(0.07, h, 0.25, cols[(i + 2) % 5], x + 0.035, 0.57 + h / 2, 0);
    x += 0.085;
  }
  b.part(new THREE.SphereGeometry(0.1, 8, 6), ORB, { at: [0.52, 0.67, 0.02] });
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 8), GOLD, { at: [0.52, 0.59, 0.02] });

  // shelf 3: orbs and candles
  b.part(new THREE.SphereGeometry(0.16, 10, 8), ORB, { at: [-0.35, 1.2, 0.02] });
  b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 8), GOLD, { at: [-0.35, 1.045, 0.02] });
  b.part(new THREE.SphereGeometry(0.11, 8, 6), PURPLE, { at: [0.05, 1.16, 0.02] });
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 8), GOLD, { at: [0.05, 1.045, 0.02] });
  for (const [cx, ch] of [[0.4, 0.22], [0.52, 0.32], [0.62, 0.16]]) {
    b.part(new THREE.CylinderGeometry(0.035, 0.04, ch, 8), WAX, { at: [cx, 1.02 + ch / 2, 0.03] });
    b.part(new THREE.ConeGeometry(0.02, 0.06, 6), "#ffb830", { at: [cx, 1.02 + ch + 0.03, 0.03] });
  }

  // shelf 4: big tomes, flat and upright
  box(0.5, 0.09, 0.3, BLUE, -0.35, 1.5, 0);
  box(0.45, 0.08, 0.28, RED, -0.35, 1.59, 0);
  box(0.4, 0.07, 0.26, GREEN, -0.35, 1.67, 0);
  x = 0.0;
  for (let i = 0; i < 6; i++) {
    const h = 0.34 + (i % 3) * 0.04;
    box(0.08, h, 0.26, cols[(i + 1) % 5], x + 0.04 + 0.1, 1.47 + h / 2, 0);
    x += 0.1;
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.2, 8), WAX, { at: [0.62, 1.57, 0.03] });
  b.part(new THREE.ConeGeometry(0.02, 0.06, 6), "#ffb830", { at: [0.62, 1.7, 0.03] });

  return b.root;
}
