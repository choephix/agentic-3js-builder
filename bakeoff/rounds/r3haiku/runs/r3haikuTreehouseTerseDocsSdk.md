```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, grain, mottle } from "agentic-3js-builder";

const BARK = "#7a5234";
const BARK_2 = "#5b3a24";
const LEAF_A = "#3f8f3a";
const LEAF_B = "#6cb24a";
const LEAF_C = "#9ad05c";
const WOOD = "#c48a4f";
const WALL = "#f4e2bd";
const ROOF = "#b5523b";
const TRIM = "#5a3a22";
const DOOR = "#7a3f2a";
const GLOW = "#ffd27a";
const KNOB = "#e8c05a";
const STONE = "#8d8a86";
const GRASS = "#7cc65a";
const FLAG = "#e0523a";
const TIRE = "#3b2f2a";

export const meta = {
  name: "treehouse",
  description: "A stylized treehouse on a broad oak: a plank deck, a gabled cabin with glowing windows, a ladder, a tyre swing and a flag.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const rand = rng(11);

  // ---- Skeleton and trunk -------------------------------------------------
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.5, 0],
      [0.08, 1.6, 0.02],
      [-0.06, 3.0, 0],
      [0.02, 4.6, 0],
    ]),
    { count: 4, role: "spine" },
  );
  const bark = grain(BARK, BARK_2, { size: 0.12 });
  b.sweep(trunk, [0.5, 0.28], { color: bark });

  // Limbs holding the deck and reaching into the crown.
  b.sweep(
    bezier([0, 3.2, 0], [-0.8, 3.4, -0.2], [-1.4, 3.9, -0.6], [-1.9, 4.4, -0.9]),
    [0.17, 0.06],
    { bone: trunk.joints[2], color: bark },
  );
  b.sweep(
    bezier([0, 3.6, -0.05], [0.9, 3.9, -0.3], [1.5, 4.3, -0.8], [1.9, 4.4, -1.1]),
    [0.15, 0.06],
    { bone: trunk.joints[3], color: bark },
  );
  b.sweep(
    bezier([0, 4.1, 0], [0.2, 4.9, -0.2], [0.4, 5.5, -0.5], [0.6, 6.2, -0.8]),
    [0.13, 0.05],
    { bone: trunk.joints[3], color: bark },
  );

  // ---- Crown: faceted leaf clumps ----------------------------------------
  const L1 = mottle(LEAF_A, LEAF_B, { size: 0.45 });
  const L2 = mottle(LEAF_B, LEAF_C, { size: 0.45 });
  const L3 = mottle(LEAF_A, LEAF_C, { size: 0.45 });
  const clumps: [number, number, number, number, THREE.Color | string | any][] = [
    [-2.0, 5.7, -0.8, 1.25, L1],
    [2.2, 5.9, -0.7, 1.3, L2],
    [0, 6.9, -1.3, 1.35, L3],
    [-0.9, 7.5, 0.1, 1.0, L2],
    [1.1, 7.7, -0.5, 1.05, L1],
    [-2.6, 4.9, 0.7, 0.85, L3],
    [2.6, 5.3, 1.0, 0.85, L1],
    [0.1, 8.1, -0.9, 0.8, L2],
    [-1.1, 6.3, -2.1, 1.0, L3],
  ];
  for (const [x, y, z, r, paint] of clumps) {
    const s = r * (0.92 + 0.16 * rand());
    b.part(new THREE.IcosahedronGeometry(s, 1), paint, { at: [x, y, z], flat: true });
  }

  // ---- Deck and supports -------------------------------------------------
  b.part(new THREE.BoxGeometry(3.4, 0.12, 3.4), WOOD, { at: [0, 4.2, 0] });
  for (const [x, z] of [
    [-1.4, -1.4],
    [1.4, -1.4],
    [-1.4, 1.4],
    [1.4, 1.4],
  ]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 4.1, 6), BARK_2, { at: [x, 2.15, z] });
  }

  // Railing: posts and rails, leaving the front open at the ladder side.
  const railY = 4.85;
  for (const [x, z] of [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6],
    [1.6, 0],
    [-1.6, 0],
    [-0.5, 1.6],
  ]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), WOOD, { at: [x, 4.61, z] });
  }
  b.rod([-1.6, railY, -1.6], [-1.6, railY, 1.6], 0.035, { color: WOOD });
  b.rod([-1.6, railY, -1.6], [1.6, railY, -1.6], 0.035, { color: WOOD });
  b.rod([1.6, railY, -1.6], [1.6, railY, 1.6], 0.035, { color: WOOD });
  b.rod([-0.5, railY, 1.6], [1.6, railY, 1.6], 0.035, { color: WOOD });

  // ---- Cabin --------------------------------------------------------------
  b.part(new THREE.BoxGeometry(3.0, 2.0, 2.6), WALL, { at: [0, 5.26, 0] });

  // Gable ends.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-1.5, 0],
        [1.5, 0],
        [0, 0.95],
      ],
      { at: [0, 6.26, s * 1.3], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, color: WALL },
    );
  }

  // Sloped roof planes and ridge cap.
  b.part(new THREE.BoxGeometry(2.05, 0.12, 3.2), ROOF, { at: [-0.76, 6.76, 0], rotation: [0, 0, 33.7] });
  b.part(new THREE.BoxGeometry(2.05, 0.12, 3.2), ROOF, { at: [0.76, 6.76, 0], rotation: [0, 0, -33.7] });
  b.part(new THREE.BoxGeometry(0.2, 0.14, 3.3), TRIM, { at: [0, 7.3, 0] });

  // Window helper: a framed, glowing pane with a cross, set on a wall.
  const pane = (x: number, y: number, z: number, axis: "x" | "z", sign: number) => {
    const w = 0.62;
    const h = 0.62;
    const t = 0.03;
    const dims = (a: number, bb: number, th: number): [number, number, number] =>
      axis === "z" ? [a, bb, th] : [th, bb, a];
    // Offset d out along the wall normal, du across the wall, dv up.
    const pos = (d: number, du: number, dv: number): [number, number, number] =>
      axis === "z" ? [x + du, y + dv, z + sign * d] : [x + sign * d, y + dv, z + du];

    b.part(new THREE.BoxGeometry(...dims(w, h, t)), TRIM, { at: pos(0, 0, 0) });
    b.part(new THREE.BoxGeometry(...dims(w - 0.14, h - 0.14, 0.02)), GLOW, { at: pos(0.025, 0, 0) });
    b.part(new THREE.BoxGeometry(...dims(w - 0.14, 0.04, 0.03)), TRIM, { at: pos(0.035, 0, 0) });
    b.part(new THREE.BoxGeometry(...dims(0.04, h - 0.14, 0.03)), TRIM, { at: pos(0.035, 0, 0) });
  };
  pane(0.8, 5.6, 1.3, "z", 1);
  pane(-0.5, 5.6, -1.3, "z", -1);
  pane(-1.5, 5.4, 0.2, "x", -1);
  pane(1.5, 5.4, -0.4, "x", 1);

  // Door with a brass knob, and two lanterns above it.
  b.part(new THREE.BoxGeometry(0.6, 1.1, 0.04), DOOR, { at: [0, 4.81, 1.31] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), KNOB, { at: [0.2, 4.8, 1.36], flat: true });
  for (const x of [-0.45, 0.45]) {
    b.part(new THREE.IcosahedronGeometry(0.12, 0), GLOW, { at: [x, 5.55, 1.4], flat: true });
  }

  // ---- Ladder -------------------------------------------------------------
  b.rod([-1.1, 0.2, 1.2], [-1.1, 4.2, 1.6], 0.03, { color: WOOD });
  b.rod([-0.7, 0.2, 1.2], [-0.7, 4.2, 1.6], 0.03, { color: WOOD });
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const y = 0.4 + 3.8 * t;
    const z = 1.2 + 0.4 * t;
    b.rod([-1.1, y, z], [-0.7, y, z], 0.022, { color: WOOD });
  }

  // ---- Tyre swing ---------------------------------------------------------
  b.rod([-2.05, 4.36, -0.9], [-2.05, 2.95, -0.9], 0.012, { color: STONE });
  b.rod([-1.75, 4.36, -0.9], [-1.75, 2.95, -0.9], 0.012, { color: STONE });
  b.part(new THREE.TorusGeometry(0.24, 0.045, 6, 12), TIRE, {
    at: [-1.9, 2.85, -0.9],
    rotation: [90, 0, 0],
  });

  // ---- Flag -----------------------------------------------------------------
  b.rod([0, 7.1, 0], [0, 8.6, 0], 0.03, { color: TRIM });
  b.part(new THREE.BoxGeometry(0.6, 0.36, 0.02), FLAG, { at: [0.32, 8.3, 0] });

  // ---- Ground and stones --------------------------------------------------
  b.part(new THREE.CylinderGeometry(3.6, 3.8, 0.12, 18), GRASS, { at: [0, -0.06, 0], flat: true });
  b.part(new THREE.DodecahedronGeometry(0.22, 0), STONE, { at: [1.9, 0.18, 1.2], flat: true });
  b.part(new THREE.DodecahedronGeometry(0.16, 0), STONE, { at: [-2.3, 0.14, -1.5], flat: true });

  return b.root;
}
```