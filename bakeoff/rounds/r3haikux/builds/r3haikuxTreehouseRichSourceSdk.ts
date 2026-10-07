import * as THREE from "three";
import { createBuilder, grain, mottle, paint, rng, scales, spots, stripes, svg } from "../../../../src/index";

export const meta = {
  name: "Treehouse diorama",
  description:
    "A cozy treehouse on a grassy round base: a thick old oak with a wide leafy crown, a red-shingled cabin with a round window nestled in the branches, a rope ladder, a wooden swing, a pennant, a lantern, mushrooms and a bicycle.",
};

/** Cabin floor height (m) and the cabin's centre, on the model's left (+X) side of the trunk. */
const FLOOR = 3.02;
const CX = 1.7;
const CZ = 0.3;
/** A point on or around the cabin: dx along the model's left, dy above the floor, dz forward. */
const cabinAt = (dx: number, dy: number, dz: number): number[] => [CX + dx, FLOOR + dy, CZ + dz];
/** The point a fraction s of the way from a to c. */
const between = (a: number[], c: number[], s: number): number[] => a.map((v, i) => v + (c[i] - v) * s);

const LEAF_GREEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 3C49 14 58 33 53 47C49 57 39 61 32 61C25 61 15 57 11 47C6 33 15 14 32 3Z" fill="#5fae45"/>
  <path d="M32 9V55M32 22L45 15M32 22L19 15M32 37L49 29M32 37L15 29" stroke="#2f6e2c" stroke-width="2.6" stroke-linecap="round" fill="none"/>
</svg>`;

const LEAF_GOLD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M32 3C49 14 58 33 53 47C49 57 39 61 32 61C25 61 15 57 11 47C6 33 15 14 32 3Z" fill="#e9a23b"/>
  <path d="M32 9V55M32 22L45 15M32 22L19 15M32 37L49 29M32 37L15 29" stroke="#8f4f1a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
</svg>`;

export default function treehouse() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("ground", { at: [0, 0, 0], dir: [0, 1, 0] });

  // Paints: colour as a function of where each surface point is.
  const grassTop = mottle("#4c8a2c", "#8cc652", { size: 0.3, contrast: 1.4 });
  const earth = mottle("#8a5d38", "#63422a", { size: 0.16 });
  const ground = paint((_, n) => (n.y > 0.55 ? grassTop : earth));
  const bark = grain("#5b4131", "#8e6c4e", { size: 0.07, axis: "y" });
  const planks = stripes("#e0ad74", "#b98050", { size: 0.16, axis: "y", width: 0.45, wobble: 0.12 });
  const shingles = scales(["#cc5335", "#b6432b", "#d86a40"], "#5a2115", { size: 0.2, width: 0.14 });
  const foliage = scales(["#3f9a40", "#62b04a", "#2f7d37"], "#1d4d24", { size: 0.32, width: 0.16 });
  const pennantCloth = stripes("#e63946", "#fbf1df", { size: 0.22, axis: "x", width: 0.5 });
  const capPaint = spots("#d43d3d", "#fff6e8", { size: 0.07, amount: 0.5 });

  // Flat colours.
  const WOOD = "#9a6b41";
  const WOOD_DARK = "#4a2f1d";
  const WOOD_LIGHT = "#8c6239";
  const DOOR = "#5b3a22";
  const ROPE = "#dccb9f";
  const GLOW = "#ffd166";
  const RED = "#c1121f";
  const TIRE = "#1f1f22";
  const STONE = "#8d8f8c";
  const BLADE = "#5c9a36";
  const STEM = "#f1e6cf";
  const ROOF_RIDGE = "#6e2517";
  const CHIMNEY = "#8e8a82";
  const CHIMNEY_CAP = "#6b675f";

  // The round grassy base: a dirt drum with a grass top.
  b.lathe(
    [[0, 0], [2.0, 0], [2.2, 0.1], [2.2, 0.28], [2.0, 0.38], [0, 0.38]],
    { color: ground, at: [0, 0, 0], segments: 24, name: "base" },
  );
  const rocks = [
    { at: [1.3, 0.36, -1.4], r: 0.2 },
    { at: [-1.5, 0.34, -0.9], r: 0.16 },
    { at: [0.3, 0.36, -1.7], r: 0.13 },
  ];
  for (const rock of rocks)
    b.part(new THREE.DodecahedronGeometry(rock.r, 0), STONE, {
      at: rock.at,
      rotation: [20, 40, 10],
      flat: true,
      name: "rock",
    });

  // Grass tufts scattered over the base.
  const tuftRng = rng(5);
  for (let i = 0; i < 40; i++) {
    const a = tuftRng() * Math.PI * 2;
    const d = 0.85 + 1.05 * Math.sqrt(tuftRng());
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const tilt = [(tuftRng() - 0.5) * 0.7, 1, (tuftRng() - 0.5) * 0.7];
    const len = 0.13 + 0.09 * tuftRng();
    const radius = 0.024 + 0.012 * tuftRng();
    if (d > 1.9 || (x < -0.5 && z > 0.6)) continue;
    b.spike([x, 0.36, z], tilt, len, radius, { color: BLADE });
  }

  // Flowers in the grass.
  const flowers: Array<[number, number, string]> = [
    [1.0, -0.95, "#ff8fab"],
    [-0.9, -1.1, "#ffe066"],
    [1.75, 0.2, "#ffffff"],
    [-1.7, 0.25, "#ff8fab"],
    [0.4, -1.6, "#ffe066"],
    [-0.3, 1.7, "#ffffff"],
  ];
  for (const [x, z, color] of flowers)
    b.part(new THREE.SphereGeometry(0.035, 6, 4), color, { at: [x, 0.42, z], flat: true, name: "flower" });

  // The oak: a flared trunk, roots, and limbs carrying the crown, the swing and the cabin.
  b.lathe(
    [[0, 0.2], [0.82, 0.2], [0.74, 0.5], [0.56, 1.2], [0.46, 2.2], [0.38, 3.1], [0.32, 4.2], [0, 4.2]],
    { color: bark, at: [0, 0, 0], segments: 10, name: "trunk" },
  );
  const roots: number[][][] = [
    [[0.35, 0.34, 0.2], [1.5, 0.2, 0.55]],
    [[-0.3, 0.34, 0.35], [-1.2, 0.2, 0.9]],
    [[-0.4, 0.34, -0.3], [-1.4, 0.2, -0.9]],
    [[0.2, 0.34, -0.5], [0.9, 0.2, -1.3]],
  ];
  for (const [from, to] of roots) b.rod(from, to, [0.18, 0.06], { color: bark });

  b.rod([-0.1, 3.4, 0.1], [-1.5, 4.5, 0.1], [0.2, 0.09], { color: bark });
  b.rod([-0.15, 2.9, 0.05], [-2.25, 3.05, 0.3], [0.18, 0.09], { color: bark }); // swing bough
  b.rod([-0.1, 3.2, 0.2], [-0.9, 4.0, 1.1], [0.16, 0.07], { color: bark });
  b.rod([0.05, 3.7, -0.15], [-0.6, 5.2, -1.5], [0.15, 0.07], { color: bark });
  b.rod([0.1, 3.6, -0.5], [1.6, 4.9, -2.2], [0.17, 0.08], { color: bark });
  // Beams holding up the cabin deck.
  b.rod([0.2, 2.5, 0.2], [0.9, 2.84, 0.4], [0.13, 0.09], { color: bark });
  b.rod([0.15, 2.3, -0.2], [1.5, 2.84, -0.8], [0.12, 0.09], { color: bark });

  // The cabin: deck, plank walls with a peaked front and back, shingled roof, chimney, pennant.
  b.part(new THREE.BoxGeometry(2.4, 0.14, 2.6), WOOD, { at: [CX, FLOOR - 0.07, CZ], name: "deck" });
  b.extrude([[-1.2, 0], [1.2, 0], [1.2, 1.35], [0, 2.5], [-1.2, 1.35]], {
    color: planks,
    at: [CX, FLOOR, CZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 1.8,
    name: "cabin",
  });
  b.slab(
    [cabinAt(-1.38, 1.18, 1.15), cabinAt(-1.38, 1.18, -1.15), cabinAt(0, 2.5, -1.15), cabinAt(0, 2.5, 1.15)],
    { color: shingles, thickness: 0.1, name: "roof" },
  );
  b.slab(
    [cabinAt(1.38, 1.18, 1.15), cabinAt(1.38, 1.18, -1.15), cabinAt(0, 2.5, -1.15), cabinAt(0, 2.5, 1.15)],
    { color: shingles, thickness: 0.1, name: "roof" },
  );
  b.rod(cabinAt(0, 2.56, 1.4), cabinAt(0, 2.56, -0.8), 0.05, { color: ROOF_RIDGE });
  b.part(new THREE.BoxGeometry(0.3, 0.9, 0.3), CHIMNEY, { at: cabinAt(-0.55, 2.0, -0.45), name: "chimney" });
  b.part(new THREE.BoxGeometry(0.38, 0.06, 0.38), CHIMNEY_CAP, { at: cabinAt(-0.55, 2.47, -0.45) });

  // Pennant on a pole at the ridge.
  b.rod(cabinAt(0, 2.3, 0), cabinAt(0, 3.5, 0), [0.03, 0.025], { color: WOOD_DARK });
  b.extrude(
    [[0, 0.22], [1.0, 0], [0, -0.22]],
    {
      color: pennantCloth,
      at: cabinAt(0, 3.3, 0),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      name: "pennant",
    },
  );

  // Gable front: round window with a cross of mullions, and the door.
  b.part(new THREE.TorusGeometry(0.3, 0.05, 8, 14), WOOD_DARK, { at: cabinAt(0, 1.7, 0.92), name: "window-ring" });
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 14), GLOW, {
    at: cabinAt(0, 1.7, 0.9),
    rotation: [90, 0, 0],
    name: "window",
  });
  b.part(new THREE.BoxGeometry(0.5, 0.035, 0.04), WOOD_DARK, { at: cabinAt(0, 1.7, 0.94) });
  b.part(new THREE.BoxGeometry(0.035, 0.5, 0.04), WOOD_DARK, { at: cabinAt(0, 1.7, 0.94) });
  b.part(new THREE.BoxGeometry(0.56, 1.0, 0.05), WOOD_DARK, { at: cabinAt(0, 0.5, 0.9), name: "door-frame" });
  b.part(new THREE.BoxGeometry(0.42, 0.9, 0.06), DOOR, { at: cabinAt(0, 0.47, 0.93), name: "door" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), "#f2c14e", { at: cabinAt(0.12, 0.46, 0.98), flat: true });

  // Lantern on a post beside the door.
  const lanternX = CX + 0.6;
  const lanternZ = CZ + 1.06;
  b.rod([lanternX, FLOOR, lanternZ], [lanternX, FLOOR + 0.55, lanternZ], [0.03, 0.025], { color: WOOD_DARK });
  b.lathe(
    [[0, -0.03], [0.1, -0.03], [0.12, 0.03], [0.12, 0.14], [0.08, 0.2], [0, 0.2]],
    { color: GLOW, at: [lanternX, FLOOR + 0.55, lanternZ], segments: 8, name: "lantern" },
  );
  b.part(new THREE.ConeGeometry(0.15, 0.1, 4), "#3b2a1c", {
    at: [lanternX, FLOOR + 0.55 + 0.25, lanternZ],
    rotation: [0, 45, 0],
    name: "lantern-cap",
  });

  // Rope ladder hanging from under the deck to the grass.
  const ladderTop = [
    [0.82, FLOOR - 0.14, 1.5],
    [1.18, FLOOR - 0.14, 1.5],
  ];
  const ladderFoot = [
    [0.5, 0.42, 1.75],
    [0.86, 0.42, 1.75],
  ];
  b.rod(ladderTop[0], ladderFoot[0], [0.016, 0.014], { color: ROPE });
  b.rod(ladderTop[1], ladderFoot[1], [0.016, 0.014], { color: ROPE });
  for (let k = 1; k <= 8; k++) {
    const s = k / 9;
    b.rod(between(ladderTop[0], ladderFoot[0], s), between(ladderTop[1], ladderFoot[1], s), 0.018, {
      color: WOOD_LIGHT,
    });
  }

  // Swing: two ropes from the bough to a plank seat.
  b.rod([-2.0, 3.02, 0.27], [-2.08, 1.42, 0.25], 0.012, { color: ROPE });
  b.rod([-1.45, 2.99, 0.2], [-1.32, 1.42, 0.25], 0.012, { color: ROPE });
  b.part(new THREE.BoxGeometry(0.8, 0.05, 0.26), WOOD, { at: [-1.7, 1.38, 0.25], name: "swing-seat" });

  // Bicycle parked on the grass, seen side-on.
  const BZ = 1.0;
  const WY = 0.72;
  const rear = [-1.36, WY, BZ];
  const front = [-0.64, WY, BZ];
  const bb = [-1.14, 0.7, BZ];
  const seatTop = [-1.25, 1.08, BZ];
  const headTop = [-0.78, 1.14, BZ];
  const headLow = [-0.82, 0.92, BZ];
  b.part(new THREE.TorusGeometry(0.32, 0.022, 6, 18), TIRE, { at: rear, name: "wheel" });
  b.part(new THREE.TorusGeometry(0.32, 0.022, 6, 18), TIRE, { at: front, name: "wheel" });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), TIRE, { at: bb, rotation: [90, 0, 0], name: "crank" });
  b.rod(bb, rear, 0.02, { color: RED });
  b.rod(seatTop, rear, 0.018, { color: RED });
  b.rod(bb, seatTop, 0.024, { color: RED });
  b.rod(seatTop, headTop, 0.02, { color: RED });
  b.rod(headLow, bb, 0.026, { color: RED });
  b.rod(headLow, front, 0.018, { color: RED });
  b.rod(headTop, [-0.78, 1.26, BZ], 0.02, { color: TIRE });
  b.rod([-0.78, 1.26, BZ - 0.14], [-0.78, 1.26, BZ + 0.14], 0.014, { color: TIRE });
  b.rod([-1.31, 1.13, BZ], [-1.19, 1.13, BZ], [0.04, 0.03], { color: "#2b1a0e" });

  // Mushrooms at the foot of the trunk.
  const capShape = [[0, 0.12], [0.07, 0.12], [0.12, 0.09], [0.15, 0.05], [0.1, 0.02], [0, 0]];
  const mushrooms = [
    [0.95, 1.0, 1.0],
    [1.3, 0.85, 0.7],
    [0.7, 0.6, 0.55],
  ];
  for (const [x, z, s] of mushrooms) {
    b.rod([x, 0.3, z], [x, 0.44, z], [0.035 * s, 0.025 * s], { color: STEM });
    b.lathe(
      capShape.map(([r, h]) => [r * s, h * s]),
      { color: capPaint, at: [x, 0.42, z], segments: 9, name: "mushroom" },
    );
  }

  // Crown: faceted foliage masses, painted with leaf scales.
  const masses: number[][] = [
    [-0.2, 4.8, -0.4, 1.2],
    [-1.4, 4.3, 0.1, 1.0],
    [-2.0, 3.8, -0.2, 0.8],
    [0.9, 5.4, -1.0, 1.0],
    [2.2, 4.4, -1.1, 0.85],
    [-0.9, 5.5, -1.2, 0.9],
    [0.2, 5.6, 0.3, 0.85],
    [-1.0, 3.7, 1.1, 0.7],
    [1.2, 3.95, -2.0, 0.7],
    [-2.5, 4.4, -1.0, 0.7],
    [0.0, 3.8, -2.0, 0.8],
    [-0.4, 3.45, 0.85, 0.6],
  ];
  const crown = masses.map(([x, y, z, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), foliage, { at: [x, y, z], flat: true, name: "foliage" }),
  );

  // Leaf cards scattered over the outside of the crown, drooping outward.
  const leafHits = b.surface(crown).scatter(150, {
    rng: rng(4),
    minDist: 0.1,
    filter: (h) => h.at.y > 2.6,
    keepOut: (p) => p.x > 0.35 && p.x < 3.15 && p.y > 2.7 && p.y < 5.9 && p.z > -0.95 && p.z < 1.5,
  });
  b.cards(leafHits, [svg(LEAF_GREEN, { size: 128 }), svg(LEAF_GOLD, { size: 128 })], {
    name: "leaves",
    size: [0.5, 0.5],
    cross: true,
    lean: 38,
    flow: [0, -1, 0],
    vary: 0.25,
    spin: 45,
    rng: rng(9),
  });

  return b.root;
}
