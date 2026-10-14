import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "treehouse",
  description: "A two-room treehouse on a tall trunk: plank walls, a red gabled roof, a glowing window, a rope ladder and a leafy crown.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });

  // Palette
  const BARK = "#6b4a2e";
  const BARK_D = "#4a3220";
  const LEAF_A = "#3f8f3a";
  const LEAF_B = "#5fae45";
  const LEAF_C = "#2f6b33";
  const WOOD = "#c9925a";
  const WOOD_D = "#9c6a3c";
  const ROOF = "#b8443a";
  const GLASS = "#ffd166";
  const DOOR = "#7a4a26";
  const ROPE = "#d9c39a";
  const GRASS = "#7bbf4e";
  const POT = "#c25b3b";
  const FLAG = "#f2c14e";

  const P = (g: THREE.BufferGeometry, c: string, x: number, y: number, z: number) =>
    b.part(g, c, { at: [x, y, z] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (r: number, detail = 1) => new THREE.IcosahedronGeometry(r, detail);

  const cx = 2.4; // house centre, offset to +X so the trunk stands clear of the deck

  // Ground patch
  P(new THREE.CylinderGeometry(3.6, 3.8, 0.2, 28), GRASS, 0, 0, 0);

  // Trunk, flared at the base
  P(new THREE.CylinderGeometry(0.3, 0.6, 7.8, 12), BARK, 0, 3.9, 0);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    const root = box(0.35, 0.22, 0.9);
    root.rotateY(Math.PI / 2 - a);
    P(root, BARK_D, Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5);
  }
  // Knots
  P(ball(0.07, 0), BARK_D, -0.25, 2.0, 0.5);
  P(ball(0.06, 0), BARK_D, 0.42, 3.1, -0.2);
  P(ball(0.06, 0), BARK_D, -0.38, 5.2, -0.15);

  // Branches that hold the deck and reach into the crown
  b.sweep([[0.1, 3.6, 0.0], [0.9, 3.85, -0.6], [1.9, 3.8, -1.2]], 0.13, { color: BARK });
  b.sweep([[0.0, 3.4, 0.2], [1.5, 3.7, 1.2], [3.3, 3.65, 1.5]], 0.12, { color: BARK });
  b.sweep([[0.0, 6.8, 0.0], [-1.2, 7.6, -0.8], [-2.2, 8.2, -1.6]], 0.14, { color: BARK });
  b.sweep([[0.0, 7.2, 0.0], [0.5, 8.4, 0.4], [1.0, 9.2, 0.9]], 0.14, { color: BARK });

  // Deck
  P(box(3.6, 0.2, 3.6), WOOD, cx, 4.0, 0);

  // Walls
  P(box(0.12, 1.7, 3.4), WOOD, cx - 1.7, 4.95, 0); // left
  P(box(0.12, 1.7, 3.4), WOOD, cx + 1.7, 4.95, 0); // right
  P(box(3.4, 1.7, 0.12), WOOD, cx, 4.95, -1.7); // back
  P(box(1.0, 1.7, 0.12), WOOD, cx - 1.2, 4.95, 1.7); // front, left of door
  P(box(1.0, 1.7, 0.12), WOOD, cx + 1.2, 4.95, 1.7); // front, right of door
  P(box(1.4, 0.4, 0.12), WOOD_D, cx, 5.6, 1.7); // lintel over the door

  // Door frame and window dressing
  P(box(1.3, 1.2, 0.04), DOOR, cx, 4.7, 1.76);
  P(box(0.06, 0.6, 0.7), GLASS, cx + 1.77, 5.0, 0);
  P(box(0.1, 0.06, 0.9), WOOD_D, cx + 1.8, 4.68, 0);
  P(box(0.06, 0.6, 0.7), GLASS, cx - 1.77, 5.0, 0);
  P(box(0.1, 0.06, 0.9), WOOD_D, cx - 1.8, 4.68, 0);
  P(box(0.7, 0.6, 0.06), GLASS, cx, 5.0, -1.77);
  P(box(0.8, 0.07, 0.12), WOOD_D, cx, 4.68, -1.77);

  // Gabled roof, square faces aligned to the walls
  const roofGeo = new THREE.ConeGeometry(2.8, 1.5, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  P(roofGeo, ROOF, cx, 6.55, 0);

  // Flagpole and flag
  P(box(0.05, 1.0, 0.05), BARK_D, cx, 7.8, 0);
  P(box(0.5, 0.28, 0.02), FLAG, cx + 0.27, 8.15, 0);

  // Ladder on the front of the trunk, rising under the deck
  P(box(0.07, 4.0, 0.07), WOOD_D, 0.9, 2.0, 0.9);
  P(box(0.07, 4.0, 0.07), WOOD_D, 1.3, 2.0, 0.9);
  for (let y = 0.4; y <= 3.6; y += 0.45) {
    P(box(0.5, 0.05, 0.07), WOOD, 1.1, y, 0.9);
  }

  // Rope hanging from the deck edge
  b.sweep([[4.15, 3.9, 1.6], [4.4, 2.2, 1.9], [4.55, 0.5, 2.1]], 0.035, { color: ROPE });

  // Lantern on a bracket by the front corner
  P(box(0.25, 0.04, 0.04), BARK_D, cx + 1.85, 5.22, 1.8);
  P(ball(0.16, 1), GLASS, cx + 1.85, 5.0, 1.85);

  // Potted plant on the deck
  P(box(0.4, 0.3, 0.4), POT, cx - 0.9, 4.25, 1.2);
  P(ball(0.24, 1), LEAF_B, cx - 0.9, 4.62, 1.2);

  // Crown: low-poly leaf clusters, alternating greens
  const crown: [number, number, number, number][] = [
    [-2.2, 8.2, -1.6, 1.4],
    [-1.0, 8.6, 0.2, 1.6],
    [0.6, 9.2, 0.8, 1.7],
    [2.2, 8.0, -1.0, 1.5],
    [1.0, 9.6, -0.6, 1.4],
    [-2.4, 7.2, 1.0, 1.1],
    [3.2, 7.0, 1.8, 1.0],
    [-0.2, 10.0, 0.0, 1.1],
    [4.0, 8.6, -2.2, 1.2],
  ];
  const leafColours = [LEAF_A, LEAF_B, LEAF_C];
  crown.forEach(([x, y, z, r], i) => {
    P(ball(r, 1), leafColours[i % leafColours.length], x, y, z);
  });

  // Shrubs at the foot of the tree
  P(ball(0.45, 1), LEAF_C, -1.6, 0.25, 1.4);
  P(ball(0.35, 1), LEAF_B, 2.0, 0.2, 2.9);

  return b.root;
}
