import * as THREE from "three";
import { createBuilder, bezier, catmull, lerp, rng } from "../../../../src/index";
import { grain, mottle, scales, spots } from "../../../../src/index";

export const meta = {
  name: "treehouse",
  description: "A cozy treehouse on a grassy round base: an old oak, a red-roofed cabin with a round window, a rope ladder, a swing, a pennant, a lantern, mushrooms and a bicycle.",
};

// Palette
const GY = 0.26; // grass top height
const BARK = "#6b4a2e";
const BARK_DARK = "#4a3320";
const LEAF = "#4f9a3a";
const LEAF_DARK = "#2d6b2c";
const LEAF_LIGHT = "#8cc24f";
const GRASS = "#7db94a";
const GRASS_DARK = "#5d9a36";
const DIRT = "#7a5a3a";
const WOOD = "#c08a52";
const WOOD_DARK = "#8a5a33";
const ROOF = "#c83a2e";
const ROOF_DARK = "#8e2219";
const CREAM = "#f3ead2";
const GLOW = "#ffd46b";
const BRASS = "#d9a441";
const METAL = "#5b6670";
const ROPE = "#d8c08a";
const FRAME = "#2f74b5";
const TIRE = "#262626";
const FLAG = "#f2c14e";
const RED = "#d8453a";
const STONE = "#9aa3a8";
const BASKET = "#c98b4a";
const PINK = "#e0608f";
const YELLOW = "#ffd166";

// Crown blobs: x, y, z, radius
const CROWN: [number, number, number, number][] = [
  [0, 6.5, -1.2, 1.1],
  [-1.7, 5.9, -1.1, 1.0],
  [1.7, 5.9, -1.2, 1.0],
  [-2.5, 5.0, -0.8, 0.9],
  [2.5, 5.1, -0.9, 0.95],
  [-2.0, 6.7, 0.2, 0.9],
  [1.9, 6.5, 0.3, 0.9],
  [0, 5.6, -2.6, 1.0],
  [-1.0, 7.2, -0.5, 0.8],
  [1.0, 7.1, -0.4, 0.8],
  [-3.0, 5.6, 0.5, 0.8],
  [3.0, 4.5, 0.2, 0.8],
  [-2.6, 4.0, -0.2, 0.7],
  [0.5, 6.3, 1.0, 0.6],
  [2.6, 3.4, -0.6, 0.6],
];

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const ground = b.joint("ground", { at: [0, 0, 0] });
  const rand = rng(7);

  const bark = grain(BARK, BARK_DARK, { size: 0.08, axis: "y" });

  // ---- Round grassy base (lowest point y = 0) ----
  b.part(new THREE.CylinderGeometry(3.0, 3.05, 0.2, 40), DIRT, { at: [0, 0.1, 0] });
  b.part(new THREE.CylinderGeometry(2.9, 2.9, 0.06, 40), mottle(GRASS_DARK, GRASS, { size: 0.35, seed: 2 }), {
    at: [0, GY - 0.03, 0],
  });

  // Grass tufts
  for (let i = 0; i < 70; i++) {
    const r = 0.3 + 2.5 * Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    const x = r * Math.cos(a);
    const z = r * Math.sin(a);
    if (Math.hypot(x, z) < 0.5) continue;
    if (Math.abs(x + 1.5) < 0.6 && Math.abs(z) < 0.8) continue; // keep the bicycle clear
    const h = 0.12 + rand() * 0.08;
    b.part(new THREE.ConeGeometry(0.035, h, 4), rand() < 0.5 ? GRASS : GRASS_DARK, {
      at: [x, GY + h / 2, z],
      flat: true,
    });
  }

  // ---- Oak trunk ----
  const trunkPath = catmull([
    [0, GY, 0],
    [0.03, 1.2, 0.02],
    [0.06, 2.3, 0.0],
    [0.0, 3.1, -0.3],
    [-0.05, 4.2, -0.9],
    [-0.05, 5.4, -1.2],
    [0.0, 6.6, -1.2],
  ]);
  b.sweep(trunkPath, (t: number) => 0.2 + 0.26 * (1 - t) ** 2, {
    color: bark,
    sides: 8,
    caps: { start: "flat" },
  });

  // Roots flaring into the grass
  for (const a of [-0.2, 2.0, 4.3]) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      bezier(
        [0.25 * c, GY + 0.14, 0.25 * s],
        [0.6 * c, GY + 0.16, 0.6 * s],
        [1.0 * c, GY + 0.1, 1.0 * s],
        [1.3 * c, GY + 0.07, 1.3 * s],
      ),
      [0.15, 0.05],
      { color: bark, sides: 6 },
    );
  }

  const branch = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    r0: number,
    r1: number,
  ) => b.sweep(bezier(p0, p1, p2, p3), [r0, r1], { color: bark, sides: 6 });

  // Crown branches
  branch([-0.05, 5.0, -1.2], [-0.8, 5.4, -1.3], [-1.6, 5.8, -1.2], [-2.3, 5.2, -0.9], 0.14, 0.04);
  branch([0.0, 5.2, -1.2], [0.8, 5.6, -1.3], [1.6, 5.7, -1.2], [2.3, 5.0, -0.8], 0.14, 0.04);
  branch([0, 5.8, -1.2], [0.2, 6.4, -1.2], [0.6, 7.1, -1.1], [0.9, 7.5, -0.9], 0.1, 0.03);
  branch([0, 5.8, -1.2], [-0.3, 6.5, -1.3], [-0.9, 7.0, -1.2], [-1.2, 7.3, -1.0], 0.1, 0.03);
  branch([0, 5.4, -1.2], [0, 5.8, -1.8], [0, 6.2, -2.2], [0, 6.4, -2.6], 0.1, 0.03);

  // Deck supports
  branch([0.0, 3.0, -0.3], [0.7, 2.9, -0.2], [1.2, 3.1, 0.1], [1.6, 3.25, 0.3], 0.12, 0.07);
  branch([0.0, 3.0, -0.3], [-0.7, 2.9, -0.2], [-1.2, 3.1, 0.1], [-1.6, 3.25, 0.3], 0.12, 0.07);

  // Swing branch
  branch([0.0, 3.4, -0.9], [0.8, 3.8, -0.8], [1.5, 3.95, -0.6], [2.1, 3.98, -0.5], 0.12, 0.05);

  // Leafy crown
  const blobs = CROWN.map(([x, y, z, r], i) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), mottle(LEAF_DARK, i % 3 ? LEAF : LEAF_LIGHT, { size: 0.5, seed: i + 1 }), {
      at: [x, y, z],
      flat: true,
    }),
  );
  // Loose leaf clusters stuck on the crown surface
  const crown = b.surface(blobs);
  const leafHits = crown.scatter(70, { rng: rand, minDist: 0.3, filter: (h) => h.n.y > -0.3 });
  leafHits.forEach((hit, i) => {
    b.stick(new THREE.IcosahedronGeometry(0.22, 0), i % 2 ? LEAF : LEAF_LIGHT, hit, { embed: 0.35, flat: true });
  });

  // ---- Cabin on the deck ----
  // Deck
  b.part(new THREE.BoxGeometry(2.6, 0.12, 2.2), grain(WOOD, WOOD_DARK, { size: 0.06, axis: "x" }), { at: [0, 3.35, 0] });

  // Walls
  b.part(new THREE.BoxGeometry(2.0, 1.4, 1.6), grain(WOOD, WOOD_DARK, { size: 0.05, axis: "x" }), { at: [0, 4.1, 0] });

  // Roof slabs with shingles
  const shingles = scales(ROOF, ROOF_DARK, { size: 0.14 });
  b.part(new THREE.BoxGeometry(1.5, 0.08, 2.3), shingles, { at: [-0.6, 5.1, 0], rotation: [0, 0, 35] });
  b.part(new THREE.BoxGeometry(1.5, 0.08, 2.3), shingles, { at: [0.6, 5.1, 0], rotation: [0, 0, -35] });

  // Gable ends
  const gable: [number, number][] = [
    [-1.0, 0],
    [1.0, 0],
    [0, 0.7],
  ];
  for (const z of [0.8, -0.8]) {
    b.extrude(gable, { at: [0, 4.8, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, color: WOOD });
  }

  // Round window with glass, mullions and a flower box
  b.part(new THREE.TorusGeometry(0.2, 0.035, 8, 16), CREAM, { at: [0, 4.35, 0.81] });
  b.part(new THREE.CircleGeometry(0.2, 12), GLOW, { at: [0, 4.35, 0.812] });
  b.part(new THREE.BoxGeometry(0.36, 0.02, 0.02), CREAM, { at: [0, 4.35, 0.815] });
  b.part(new THREE.BoxGeometry(0.02, 0.36, 0.02), CREAM, { at: [0, 4.35, 0.815] });
  b.part(new THREE.BoxGeometry(0.46, 0.1, 0.12), WOOD_DARK, { at: [0, 4.0, 0.86] });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), PINK, { at: [-0.15, 4.1, 0.9] });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), YELLOW, { at: [0, 4.12, 0.92] });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), CREAM, { at: [0.15, 4.1, 0.9] });

  // Door and knob
  b.part(new THREE.BoxGeometry(0.46, 0.9, 0.05), WOOD_DARK, { at: [-0.4, 3.85, 0.83] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), BRASS, { at: [-0.2, 3.85, 0.86] });

  // Pennant pole and flag on the roof ridge
  b.rod([0, 5.4, 0], [0, 6.3, 0], 0.02, { color: METAL });
  const pennant: [number, number][] = [
    [0, 0],
    [0.7, 0.1],
    [0.55, 0.2],
    [0.7, 0.3],
    [0, 0.36],
  ];
  b.extrude(pennant, { at: [0, 5.95, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: FLAG });

  // Lantern by the door
  b.rod([-0.8, 4.25, 0.8], [-0.8, 4.25, 1.05], 0.02, { color: METAL });
  b.rod([-0.8, 4.25, 1.05], [-0.8, 4.07, 1.05], 0.008, { color: METAL });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), GLOW, { at: [-0.8, 3.95, 1.05] });
  for (const dx of [-0.065, 0.065]) {
    for (const dz of [-0.065, 0.065]) {
      b.rod([-0.8 + dx, 3.84, 1.05 + dz], [-0.8 + dx, 4.06, 1.05 + dz], 0.008, { color: BRASS });
    }
  }
  b.part(new THREE.ConeGeometry(0.1, 0.07, 4), BRASS, { at: [-0.8, 4.1, 1.05], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.09, 0.05, 4), BRASS, { at: [-0.8, 3.8, 1.05], rotation: [180, 45, 0], flat: true });

  // ---- Rope ladder from the deck front ----
  for (const x of [-0.55, -0.95]) {
    b.rod([x, 3.32, 1.15], [x, GY + 0.02, 2.0], 0.02, { color: ROPE });
  }
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    const left = lerp([-0.55, 3.32, 1.15], [-0.55, GY + 0.02, 2.0], t);
    const right = lerp([-0.95, 3.32, 1.15], [-0.95, GY + 0.02, 2.0], t);
    b.rod(left, right, 0.014, { color: WOOD });
  }

  // Ladder foot stones
  b.part(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 7), STONE, { at: [-0.75, GY + 0.02, 2.3], flat: true });
  b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.04, 7), STONE, { at: [-0.6, GY + 0.02, 2.55], flat: true });

  // ---- Swing hanging from the branch ----
  b.rod([1.8, 3.95, -0.5], [1.8, 1.65, -0.5], 0.01, { color: ROPE });
  b.rod([2.1, 3.95, -0.5], [2.1, 1.65, -0.5], 0.01, { color: ROPE });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.2), WOOD, { at: [1.95, 1.6, -0.5] });

  // ---- Mushrooms at the foot of the tree ----
  const mushroom = (x: number, z: number, s: number) => {
    b.part(new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 0.12 * s, 6), CREAM, {
      at: [x, GY + 0.06 * s, z],
    });
    const cap: [number, number][] = [
      [0, 0],
      [0.14 * s, 0.02 * s],
      [0.16 * s, 0.07 * s],
      [0.1 * s, 0.11 * s],
      [0, 0.1 * s],
    ];
    b.lathe(cap, {
      at: [x, GY + 0.1 * s, z],
      segments: 7,
      color: spots(RED, CREAM, { size: 0.06, amount: 0.3 }),
    });
  };
  mushroom(0.8, 0.9, 1.0);
  mushroom(1.05, 1.05, 0.7);
  mushroom(0.9, 1.3, 0.6);
  mushroom(-0.9, -0.9, 0.8);
  mushroom(-1.1, -0.7, 0.55);

  // ---- Bicycle leaning on the tree's foot ----
  const BX = -1.5;
  const BB: [number, number, number] = [BX, 0.6, 0];
  const S: [number, number, number] = [BX, 1.0, -0.4];
  const H: [number, number, number] = [BX, 1.0, 0.4];
  const R: [number, number, number] = [BX, 0.6, -0.5];
  const F: [number, number, number] = [BX, 0.6, 0.5];
  b.part(new THREE.TorusGeometry(0.33, 0.03, 6, 16), TIRE, { at: R, rotation: [0, 90, 0] });
  b.part(new THREE.TorusGeometry(0.33, 0.03, 6, 16), TIRE, { at: F, rotation: [0, 90, 0] });
  b.rod(BB, S, 0.018, { color: FRAME });
  b.rod(S, R, 0.018, { color: FRAME });
  b.rod(BB, R, 0.018, { color: FRAME });
  b.rod(S, H, 0.018, { color: FRAME });
  b.rod(BB, H, 0.018, { color: FRAME });
  b.rod(H, F, 0.018, { color: FRAME });
  b.rod(H, [BX, 1.12, 0.42], 0.018, { color: FRAME });
  b.rod([BX - 0.16, 1.12, 0.42], [BX + 0.16, 1.12, 0.42], 0.015, { color: TIRE });
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.24), TIRE, { at: [BX, 1.03, -0.42] });
  b.part(new THREE.BoxGeometry(0.28, 0.14, 0.2), BASKET, { at: [BX, 1.0, 0.66] });

  return b.root;
}
