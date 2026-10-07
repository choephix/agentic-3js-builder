import * as THREE from "three";
import { createBuilder, catmull, grain, mottle, scales, spots, stripes } from "../../../../src/index";

export const meta = {
  name: "treehouse",
  description: "A cozy oak treehouse diorama on a grassy round base, with a rope ladder, swing, lantern, pennant, mushrooms and a bicycle.",
};

// Palette
const BARK_D = "#4a3423";
const BARK_L = "#7a5a3c";
const WOOD_L = "#c9a06a";
const WOOD_D = "#9c7344";
const RED = "#c8402f";
const RED_D = "#8f2a20";
const TRIM = "#f1e6cf";
const GLASS = "#9fe3ff";
const DOOR = "#4a2e1c";
const LEAF_D = "#2f6b2a";
const LEAF_L = "#63a84a";
const GRASS_D = "#5c9a3a";
const GRASS_L = "#86c24f";
const SOIL = "#6b4a2e";
const ROPE = "#d8b77a";
const MUSH_STEM = "#f3ead8";
const TEAL = "#2f8f8a";
const BLACK = "#222222";
const FLAG_Y = "#f2c230";
const GLOW = "#ffd45a";
const BRASS = "#b58a3c";

// Ground level: the grass top of the round base.
const G = 0.36;

export default function build() {
  const b = createBuilder({ name: "treehouse" });

  // Root joint. Everything here is static scenery, so it all rides the root.
  b.joint("root", { at: [0, 0, 0] });

  // ---------- Base ----------
  b.part(new THREE.CylinderGeometry(3.0, 2.8, 0.3, 28), SOIL, { at: [0, 0.15, 0] });
  b.part(new THREE.CylinderGeometry(3.0, 3.0, 0.06, 28), mottle(GRASS_D, GRASS_L, { size: 0.25, seed: 4 }), {
    at: [0, 0.33, 0],
  });

  // ---------- Tree ----------
  const bark = grain(BARK_D, BARK_L, { size: 0.1, axis: "y" });
  b.sweep(
    catmull([
      [0, 0.3, 0],
      [0.05, 1.4, 0.03],
      [-0.03, 2.4, 0],
      [0, 3.0, 0],
    ]),
    [0.45, 0.2],
    { color: bark },
  );
  // Roots spreading over the grass
  b.sweep(
    catmull([
      [0, 0.4, 0],
      [0.5, 0.42, 0.3],
      [0.95, 0.3, 0.35],
    ]),
    [0.2, 0.05],
    { color: bark },
  );
  b.sweep(
    catmull([
      [0, 0.4, 0],
      [-0.5, 0.42, -0.25],
      [-0.9, 0.3, -0.5],
    ]),
    [0.18, 0.05],
    { color: bark },
  );

  // Branches
  b.sweep(
    catmull([
      [0, 2.5, 0],
      [0.6, 3.0, 0.1],
      [1.5, 3.6, 0.3],
      [2.0, 4.1, 0.1],
    ]),
    [0.2, 0.07],
    { color: bark },
  );
  b.sweep(
    catmull([
      [0, 2.6, 0],
      [-0.7, 3.2, -0.2],
      [-1.6, 3.8, -0.4],
      [-2.0, 4.2, -0.3],
    ]),
    [0.2, 0.06],
    { color: bark },
  );
  // Swing branch
  b.sweep(
    catmull([
      [0, 2.3, 0],
      [-0.8, 2.5, 0.1],
      [-1.6, 2.85, -0.05],
      [-2.1, 3.0, -0.2],
    ]),
    [0.16, 0.06],
    { color: bark },
  );
  // Cabin support branch
  b.sweep(
    catmull([
      [0, 2.7, 0],
      [0.4, 2.7, 0.5],
      [0.7, 2.6, 0.9],
    ]),
    [0.13, 0.06],
    { color: bark },
  );

  // ---------- Canopy ----------
  const canopy: [number, number, number, number, number][] = [
    [0, 4.7, -0.2, 1.2, 1],
    [-1.3, 4.3, -0.4, 1.0, 2],
    [1.4, 4.5, -0.3, 1.0, 3],
    [0.4, 5.5, 0.2, 1.05, 4],
    [-0.9, 5.3, -0.9, 0.95, 5],
    [1.1, 5.2, 0.9, 0.9, 6],
    [-1.9, 4.0, -0.6, 0.85, 7],
    [2.1, 4.1, 0.1, 0.8, 8],
    [-0.3, 4.4, 1.2, 0.8, 9],
    [0.2, 6.0, -0.3, 0.8, 10],
  ];
  for (const [x, y, z, r, seed] of canopy) {
    b.part(new THREE.IcosahedronGeometry(r, 1), mottle(LEAF_D, LEAF_L, { size: 0.35, seed }), {
      at: [x, y, z],
      flat: true,
    });
  }

  // ---------- Cabin ----------
  const plank = grain(WOOD_L, WOOD_D, { size: 0.06, axis: "y" });
  const deck = grain(WOOD_D, WOOD_L, { size: 0.06, axis: "x" });
  const shingle = scales(RED, RED_D, { size: 0.14, seed: 2 });

  // Floor platform
  b.part(new THREE.BoxGeometry(2.6, 0.12, 2.2), deck, { at: [0, 2.6, 0.3] });
  // Walls
  b.part(new THREE.BoxGeometry(1.8, 1.3, 1.6), plank, { at: [0, 3.3, 0.3] });

  // Gable triangles, front and back
  b.extrude(
    [
      [-0.95, 0],
      [0.95, 0],
      [0, 0.6],
    ],
    { at: [0, 3.9, 1.08], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, color: plank },
  );
  b.extrude(
    [
      [-0.95, 0],
      [0.95, 0],
      [0, 0.6],
    ],
    { at: [0, 3.9, -0.48], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, color: plank },
  );

  // Gable roof: two shingled slabs sloping off a ridge along Z
  b.part(new THREE.BoxGeometry(1.4, 0.08, 2.1), shingle, { at: [0.5, 4.0, 0.3], rotation: [0, 0, -35] });
  b.part(new THREE.BoxGeometry(1.4, 0.08, 2.1), shingle, { at: [-0.5, 4.0, 0.3], rotation: [0, 0, 35] });

  // Round window on the front gable wall
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), TRIM, { at: [0, 3.45, 1.12], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 12), GLASS, { at: [0, 3.45, 1.16], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.34, 0.03, 0.02), TRIM, { at: [0, 3.45, 1.17] });
  b.part(new THREE.BoxGeometry(0.03, 0.34, 0.02), TRIM, { at: [0, 3.45, 1.17] });

  // Door
  b.part(new THREE.BoxGeometry(0.5, 0.95, 0.06), DOOR, { at: [-0.35, 3.15, 1.12] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: [-0.22, 3.15, 1.17] });

  // Lantern by the door on a bracket
  b.rod([-0.9, 3.5, 1.1], [-0.82, 3.5, 1.25], 0.015, { color: WOOD_D });
  b.part(new THREE.BoxGeometry(0.12, 0.16, 0.12), GLOW, { at: [-0.82, 3.2, 1.25] });
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.17), BRASS, { at: [-0.82, 3.31, 1.25] });
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.17), BRASS, { at: [-0.82, 3.09, 1.25] });

  // Pennant flag on the ridge
  b.rod([0, 4.42, 0.3], [0, 5.2, 0.3], 0.02, { color: WOOD_D });
  b.extrude(
    [
      [0, 0],
      [0.6, 0.12],
      [0, 0.24],
    ],
    {
      at: [0, 4.95, 0.3],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      color: stripes(FLAG_Y, RED, { size: 0.08, axis: "y" }),
    },
  );

  // ---------- Rope ladder from the floor edge to the grass ----------
  const top1: [number, number, number] = [0.5, 2.52, 1.35];
  const top2: [number, number, number] = [0.9, 2.52, 1.35];
  const bot1: [number, number, number] = [0.6, G + 0.02, 1.95];
  const bot2: [number, number, number] = [1.0, G + 0.02, 1.95];
  b.rod(top1, bot1, 0.014, { color: ROPE });
  b.rod(top2, bot2, 0.014, { color: ROPE });
  const rungs = 7;
  for (let i = 1; i <= rungs; i++) {
    const t = i / (rungs + 1);
    const y = top1[1] + (bot1[1] - top1[1]) * t;
    const z = top1[2] + (bot1[2] - top1[2]) * t;
    const x1 = top1[0] + (bot1[0] - top1[0]) * t;
    const x2 = top2[0] + (bot2[0] - top2[0]) * t;
    b.rod([x1, y, z], [x2, y, z], 0.012, { color: ROPE });
  }

  // ---------- Swing hanging from the swing branch ----------
  const seatY = 1.4;
  b.rod([-1.9, 2.8, -0.1], [-1.95, seatY, -0.1], 0.012, { color: ROPE });
  b.rod([-1.3, 2.8, -0.1], [-1.25, seatY, -0.1], 0.012, { color: ROPE });
  b.part(new THREE.BoxGeometry(0.8, 0.05, 0.22), deck, { at: [-1.6, seatY, -0.1] });

  // ---------- Mushrooms at the foot of the tree ----------
  const mushroom = (x: number, z: number, s: number) => {
    const P = (pts: [number, number][]): [number, number][] => pts.map(([u, v]) => [u * s, v * s]);
    b.lathe(
      P([
        [0, 0],
        [0.035, 0],
        [0.04, 0.04],
        [0.03, 0.07],
        [0, 0.07],
      ]),
      { at: [x, G, z], color: MUSH_STEM, segments: 7 },
    );
    b.lathe(
      P([
        [0, 0.06],
        [0.05, 0.06],
        [0.09, 0.08],
        [0.12, 0.1],
        [0.1, 0.13],
        [0.05, 0.14],
        [0, 0.14],
      ]),
      { at: [x, G, z], color: spots(RED, TRIM, { size: 0.05, amount: 0.3 }), segments: 7 },
    );
  };
  mushroom(0.85, 0.75, 1.0);
  mushroom(1.15, 0.45, 0.75);
  mushroom(0.6, 1.0, 0.6);

  // ---------- Bicycle leaning at the foot of the tree, side view along X ----------
  const cx = -1.6;
  const cz = 1.5;
  const hubY = G + 0.33;
  const wheelR = 0.33;
  const bb: [number, number, number] = [cx, hubY, cz];
  const seatTop: [number, number, number] = [cx - 0.2, hubY + 0.46, cz];
  const head: [number, number, number] = [cx + 0.45, hubY + 0.4, cz];
  const rearHub: [number, number, number] = [cx - 0.55, hubY, cz];
  const frontHub: [number, number, number] = [cx + 0.55, hubY, cz];

  for (const dx of [-0.55, 0.55]) {
    b.part(new THREE.TorusGeometry(wheelR, 0.03, 6, 16), BLACK, { at: [cx + dx, hubY, cz] });
  }
  b.rod(rearHub, bb, 0.02, { color: TEAL });
  b.rod(bb, seatTop, 0.02, { color: TEAL });
  b.rod(seatTop, rearHub, 0.016, { color: TEAL });
  b.rod(seatTop, head, 0.02, { color: TEAL });
  b.rod(bb, head, 0.022, { color: TEAL });
  b.rod(head, frontHub, 0.016, { color: TEAL });
  b.rod(head, [cx + 0.5, hubY + 0.58, cz], 0.012, { color: BLACK });
  b.part(new THREE.BoxGeometry(0.2, 0.04, 0.1), BLACK, { at: [cx - 0.25, hubY + 0.52, cz] });

  return b.root;
}
