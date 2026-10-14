import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  grain,
  mottle,
  paint,
  rng,
  scales,
  stripes,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "An old oak with a little cabin on a deck: ladder, rope swing, lantern, string lights, birdhouse and a pennant.",
};

const C = {
  barkLight: "#8a5e3a",
  barkDark: "#4a2f1d",
  deckA: "#d7a266",
  deckB: "#b5793f",
  wallA: "#f0cb92",
  wallB: "#dcae70",
  trim: "#fbf3df",
  door: "#2f8c8a",
  glow: "#ffd66e",
  gold: "#f2b84b",
  roofA: "#c8603f",
  roofDeep: "#8a3a26",
  stone: "#9aa0a6",
  stoneDark: "#6f757c",
  smoke: "#f4f4f1",
  rope: "#dcc08c",
  dark: "#2e2a2a",
  wood: "#a9703f",
  leafLight: "#86cc4f",
  leafDark: "#2b6130",
  leafDeep: "#1d4a25",
  grass: "#8ccb5e",
  grassDeep: "#5fa23d",
  pink: "#ff7aa8",
  yellow: "#ffd23f",
  orange: "#ff8c42",
  flagRed: "#d9483b",
  birdWall: "#f4e2b8",
  rock: "#8d9399",
  rockDark: "#6a7077",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  b.joint("tree", { at: [0, 0, 0] });

  // ---- Paints -------------------------------------------------------------
  const bark = grain(C.barkLight, C.barkDark, { size: 0.08, axis: "y", seed: 2 });
  const deckWood = stripes(C.deckA, C.deckB, { size: 0.16, axis: "z", seed: 3 });
  const plank = stripes(C.wallA, C.wallB, { size: 0.15, axis: "x", seed: 5 });
  const shingle = scales(C.roofA, C.roofDeep, { size: 0.12, seed: 7 });
  const foliage = countershade(
    mottle(C.leafLight, C.leafDark, { size: 0.55, contrast: 0.7, seed: 4 }),
    C.leafDeep,
    { level: 0.2 },
  );
  const turf = mottle(C.grass, C.grassDeep, { size: 0.45, contrast: 0.5, seed: 8 });
  const pennant = paint((_p, _n, s) => (Math.floor(s[1] / 0.1) % 2 ? C.flagRed : C.trim));

  // ---- Textures -----------------------------------------------------------
  const leaf = (fill: string, vein: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
        `<path d="M16 1C27 8 29 22 16 31C3 22 5 8 16 1Z" fill="${fill}"/>` +
        `<path d="M16 5Q14 17 16 28" stroke="${vein}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
        `</svg>`,
      { size: 128 },
    );
  const leafA = leaf("#8fd14f", "#3f7d2c");
  const leafB = leaf("#5fae3a", "#2c5f25");
  const leafC = leaf("#b8e05e", "#5c8f30");
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
      `<path d="M2 32Q7 14 13 2Q13 18 16 32Z" fill="#7cc24c"/>` +
      `<path d="M11 32Q13 12 22 1Q20 19 22 32Z" fill="#5aa73b"/>` +
      `<path d="M19 32Q23 18 31 10Q27 24 29 32Z" fill="#8fd05a"/>` +
      `</svg>`,
    { size: 96 },
  );

  // ---- Tree ---------------------------------------------------------------
  const trunk = catmull([
    [0, 0, 0],
    [0.05, 1.5, 0.05],
    [0.02, 3.0, 0],
    [-0.08, 4.5, -0.05],
    [-0.05, 6.0, -0.1],
  ]);
  b.sweep(trunk, (t: number) => 0.2 + 0.4 * (1 - t) ** 2, {
    color: bark,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });

  const roots: [number, number, number][] = [
    [0.85, 0.5, 1.0],
    [-0.75, 0.6, 0.95],
    [-0.3, -0.95, 0.9],
    [0.6, -0.8, 0.8],
  ];
  for (const [dx, dz, len] of roots) {
    b.sweep(
      catmull([
        [dx * 0.2, 0.3, dz * 0.2],
        [dx * len * 0.55, 0.14, dz * len * 0.55],
        [dx * len, 0.07, dz * len],
      ]),
      [0.16, 0.05],
      { color: bark, smooth: false },
    );
  }

  // Iron-banded collar where the deck meets the trunk
  b.part(new THREE.TorusGeometry(0.33, 0.05, 6, 14), C.deckB, {
    at: [0, 3.14, 0],
    rotation: [90, 0, 0],
  });

  // Limbs
  b.sweep(
    catmull([
      [-0.02, 4.1, -0.02],
      [0.7, 4.9, -0.6],
      [1.5, 5.5, -1.2],
      [2.1, 5.9, -1.6],
    ]),
    (t: number) => 0.13 - 0.07 * t,
    { color: bark, smooth: false, sides: 8 },
  );
  b.sweep(
    catmull([
      [-0.02, 4.5, -0.02],
      [-0.6, 5.2, -0.9],
      [-1.2, 5.8, -1.5],
    ]),
    (t: number) => 0.12 - 0.06 * t,
    { color: bark, smooth: false, sides: 8 },
  );
  const swing = b.sweep(
    catmull([
      [-0.04, 4.25, 0],
      [-0.9, 4.75, 0.1],
      [-1.6, 5.0, 0.25],
      [-2.2, 5.2, 0.3],
    ]),
    (t: number) => 0.12 - 0.07 * t,
    { color: bark, smooth: false, sides: 8 },
  );

  // Crown: low-poly clumps of foliage, leaf cards scattered over them
  const crownSpheres: [number, number, number, number][] = [
    [0.0, 7.0, -0.6, 1.5],
    [-1.5, 6.4, -0.8, 1.2],
    [1.5, 6.5, -0.9, 1.2],
    [-0.6, 8.0, -0.5, 1.1],
    [0.9, 7.9, -0.7, 1.0],
    [-2.2, 5.6, -0.3, 0.9],
    [2.2, 5.7, -0.9, 0.9],
    [-0.8, 5.3, -1.9, 0.9],
    [1.2, 5.1, -2.0, 0.9],
    [-2.6, 7.0, -1.1, 0.9],
    [2.6, 7.2, -1.3, 0.95],
    [0.0, 5.6, -2.3, 1.0],
    [-1.0, 8.9, -1.2, 0.8],
    [1.6, 8.5, -1.6, 0.8],
    [0.4, 9.2, -0.4, 0.7],
  ];
  const crown = crownSpheres.map(([x, y, z, r]) =>
    b.part(new THREE.SphereGeometry(r, 9, 6), foliage, { at: [x, y, z], flat: true }),
  );
  const crownHits = b
    .surface(crown)
    .scatter(520, { rng: rng(11), minDist: 0.19, filter: (h) => h.n.y > -0.7 });
  b.cards(crownHits, [leafA, leafB, leafC], {
    size: [0.3, 0.42],
    lean: 35,
    vary: 0.25,
    rng: rng(12),
    cross: true,
  });

  // ---- Rope swing and birdhouse -------------------------------------------
  b.part(new THREE.BoxGeometry(0.6, 0.05, 0.22), deckWood, { at: [-2.0, 2.3, 0.3] });
  b.rod([-2.2, 2.33, 0.3], [-2.2, 5.15, 0.3], 0.012, { color: C.rope });
  b.rod([-1.8, 2.33, 0.3], [-1.8, 5.05, 0.3], 0.012, { color: C.rope });

  const perch = b.surface(swing).ray([-1.0, 8.0, 0.11], [0, -1, 0]);
  if (perch) {
    b.stick(new THREE.BoxGeometry(0.24, 0.22, 0.24), C.birdWall, perch, { embed: 0.15 });
    b.stick(new THREE.ConeGeometry(0.2, 0.14, 4), C.roofA, perch.moved([0, 0.19, 0]), {
      embed: 0.15,
      spin: 45,
    });
  }

  // ---- Deck and braces ----------------------------------------------------
  b.part(new THREE.BoxGeometry(3.5, 0.14, 3.2), deckWood, { at: [0.85, 3.05, 0.4] });
  b.rod([0.12, 2.1, 0.1], [1.1, 2.95, 1.5], 0.05, { color: C.barkDark });
  b.rod([-0.1, 2.1, -0.12], [-0.8, 2.95, -1.0], 0.045, { color: C.barkDark });

  // Railing on the right side and the front-right corner
  for (const z of [-0.6, 0.2, 1.0, 2.0]) {
    b.part(new THREE.BoxGeometry(0.07, 0.9, 0.07), C.wood, { at: [2.5, 3.57, z] });
  }
  for (const x of [1.6, 2.05]) {
    b.part(new THREE.BoxGeometry(0.07, 0.9, 0.07), C.wood, { at: [x, 3.57, 2.0] });
  }
  b.rod([2.5, 4.0, 2.0], [2.5, 4.0, -0.6], 0.025, { color: C.trim });
  b.rod([1.6, 4.0, 2.0], [2.5, 4.0, 2.0], 0.025, { color: C.trim });

  // Fairy lights sagging along the right railing
  const lights = catmull([
    [2.62, 4.0, 2.0],
    [2.62, 3.66, 0.7],
    [2.62, 3.66, -0.6],
  ]);
  b.sweep(lights, 0.006, { color: C.dark });
  b.along(lights, 9, (at) => {
    b.part(new THREE.SphereGeometry(0.035, 6, 4), C.glow, { at });
  });

  // Flag pole and pennant at the front-right corner
  b.rod([2.4, 3.12, 1.8], [2.4, 4.85, 1.8], 0.022, { color: C.trim });
  b.extrude(
    [
      [0, 0],
      [0.75, 0.2],
      [0, 0.4],
    ],
    { at: [2.4, 4.3, 1.8], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: pennant },
  );

  // Ladder: two rails leaning on the deck edge, eight rungs
  const top: [number, number, number] = [-0.4, 3.22, 2.05];
  const foot: [number, number, number] = [-0.4, 0.14, 2.9];
  for (const dx of [-0.22, 0.22]) {
    b.rod([top[0] + dx, top[1], top[2]], [foot[0] + dx, foot[1], foot[2]], 0.03, {
      color: C.wood,
    });
  }
  for (let k = 1; k <= 8; k++) {
    const t = k / 9;
    const y = top[1] + (foot[1] - top[1]) * t;
    const z = top[2] + (foot[2] - top[2]) * t;
    b.rod([-0.62, y, z], [-0.18, y, z], 0.018, { color: C.wood });
  }

  // ---- Cabin --------------------------------------------------------------
  b.part(new THREE.BoxGeometry(1.6, 1.8, 1.6), plank, { at: [1.5, 4.0, 0.6] });

  // Gable ends (pentagon: wall top, then the roof's underside, to the ridge)
  b.extrude(
    [
      [0, 0],
      [1.6, 0],
      [1.6, 0.2],
      [0.8, 0.98],
      [0, 0.2],
    ],
    { at: [0.7, 4.9, 1.4], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: plank },
  );
  b.extrude(
    [
      [0, 0],
      [1.6, 0],
      [1.6, 0.2],
      [0.8, 0.98],
      [0, 0.2],
    ],
    { at: [0.7, 4.9, -0.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: plank },
  );

  // Round attic window in the front gable
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 10), C.glow, {
    at: [1.5, 5.25, 1.47],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.14, 0.025, 5, 12), C.trim, { at: [1.5, 5.25, 1.5] });

  // Door with a frame and a gold knob
  b.part(new THREE.BoxGeometry(0.56, 1.24, 0.05), C.trim, { at: [1.25, 3.72, 1.42] });
  b.part(new THREE.BoxGeometry(0.44, 1.12, 0.05), C.door, { at: [1.25, 3.66, 1.46] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), C.gold, { at: [1.36, 3.62, 1.52] });

  // Front window with a flower box
  b.part(new THREE.BoxGeometry(0.6, 0.6, 0.05), C.trim, { at: [1.9, 4.2, 1.42] });
  b.part(new THREE.BoxGeometry(0.48, 0.48, 0.05), C.glow, { at: [1.9, 4.2, 1.47] });
  b.part(new THREE.BoxGeometry(0.05, 0.48, 0.02), C.trim, { at: [1.9, 4.2, 1.5] });
  b.part(new THREE.BoxGeometry(0.48, 0.05, 0.02), C.trim, { at: [1.9, 4.2, 1.5] });
  b.part(new THREE.BoxGeometry(0.66, 0.12, 0.2), C.wood, { at: [1.9, 3.82, 1.5] });
  const flowerColors = [C.pink, C.yellow, C.orange, C.trim];
  const planterFlowers: [number, number, number][] = [
    [1.72, 3.93, 1.52],
    [1.84, 3.95, 1.56],
    [1.96, 3.93, 1.52],
    [2.08, 3.95, 1.56],
  ];
  planterFlowers.forEach(([x, y, z], i) => {
    b.part(new THREE.SphereGeometry(0.05, 6, 4), flowerColors[i % flowerColors.length], {
      at: [x, y, z],
    });
  });

  // Small window on the trunk-facing wall
  b.part(new THREE.BoxGeometry(0.05, 0.56, 0.56), C.trim, { at: [0.685, 4.1, 0.6] });
  b.part(new THREE.BoxGeometry(0.03, 0.46, 0.46), C.glow, { at: [0.645, 4.1, 0.6] });

  // Hanging lantern beside the door
  b.rod([0.9, 4.55, 1.4], [0.9, 4.55, 1.66], 0.02, { color: C.dark });
  b.rod([0.9, 4.55, 1.66], [0.9, 4.44, 1.66], 0.008, { color: C.dark });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), C.glow, { at: [0.9, 4.27, 1.66] });
  b.part(new THREE.ConeGeometry(0.1, 0.07, 6), C.dark, { at: [0.9, 4.395, 1.66] });

  // Roof: two shingled panels, ridge cap, cream fascia
  b.part(new THREE.BoxGeometry(1.5, 0.07, 2.2), shingle, {
    at: [2.05, 5.4, 0.6],
    rotation: [0, 0, -42.1],
  });
  b.part(new THREE.BoxGeometry(1.5, 0.07, 2.2), shingle, {
    at: [0.95, 5.4, 0.6],
    rotation: [0, 0, 42.1],
  });
  b.part(new THREE.BoxGeometry(0.14, 0.09, 2.3), C.roofDeep, { at: [1.5, 5.9, 0.6] });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 2.2), C.trim, { at: [0.44, 4.88, 0.6] });
  b.part(new THREE.BoxGeometry(0.06, 0.1, 2.2), C.trim, { at: [2.56, 4.88, 0.6] });

  // Chimney with two puffs of smoke
  b.part(new THREE.BoxGeometry(0.3, 1.1, 0.3), C.stone, { at: [2.1, 5.5, 0.4] });
  b.part(new THREE.BoxGeometry(0.38, 0.07, 0.38), C.stoneDark, { at: [2.1, 6.085, 0.4] });
  b.part(new THREE.SphereGeometry(0.13, 7, 5), C.smoke, { at: [2.2, 6.4, 0.5], flat: true });
  b.part(new THREE.SphereGeometry(0.09, 6, 4), C.smoke, { at: [2.36, 6.72, 0.55], flat: true });

  // ---- Ground and garden --------------------------------------------------
  const grass = b.part(new THREE.CylinderGeometry(3.3, 3.5, 0.14, 16), turf, {
    at: [0, 0.07, 0],
  });
  const tufts = b
    .surface(grass)
    .scatter(300, { rng: rng(21), minDist: 0.1, filter: (h) => h.n.y > 0.9 });
  b.cards(tufts, tuft, { size: [0.16, 0.28], vary: 0.3, rng: rng(22), cross: true });

  const blooms = b
    .surface(grass)
    .scatter(24, { rng: rng(23), minDist: 0.5, filter: (h) => h.n.y > 0.9 });
  blooms.forEach((h, i) => {
    b.stick(new THREE.SphereGeometry(0.06, 6, 4), flowerColors[i % flowerColors.length], h, {
      embed: 0.3,
    });
  });

  b.part(new THREE.DodecahedronGeometry(0.22, 0), C.rock, {
    at: [-1.2, 0.27, 1.5],
    rotation: [20, 35, 10],
  });
  b.part(new THREE.DodecahedronGeometry(0.14, 0), C.rockDark, {
    at: [2.9, 0.22, 1.2],
    rotation: [10, 60, 0],
  });
  b.part(new THREE.SphereGeometry(0.5, 9, 6), foliage, { at: [1.6, 0.5, 2.7], flat: true });
  b.part(new THREE.SphereGeometry(0.42, 9, 6), foliage, { at: [-1.6, 0.42, 2.5], flat: true });

  return b.root;
}
