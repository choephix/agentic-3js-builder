```ts
import * as THREE from "three";
import type { OutlinePoint } from "agentic-3js-builder";
import { createBuilder, frame, mottle, paint, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse on a tiny island",
  description:
    "A red-and-white striped lighthouse with a lit yellow lantern on a grassy rock island, beside a keeper's cottage, a moored boat, a foam ring and wave decals on the sea.",
};

// Palette
const SEA = "#1e9fd4";
const SEA_DEEP = "#1579ad";
const FOAM = "#f4fbff";
const GRASS = "#7cc653";
const GRASS_DARK = "#55a03d";
const BUSH = "#4f9a3c";
const ROCK = "#a39d90";
const ROCK_DARK = "#7a756a";
const STONE = "#e0d9c8";
const STONE_DARK = "#c6bda8";
const RED = "#cc3b2e";
const WHITE = "#f6f2e9";
const IRON = "#363e48";
const GLASS = "#ffe27a";
const BEAM = "#fff0a0";
const BEAM_CORE = "#fffbd9";
const BRASS = "#e9b84e";
const TILE = "#b5482f";
const WALL = "#f4efe3";
const DOOR = "#5b3923";
const BRICK = "#8e4b3b";
const BOAT = "#2f73b3";
const CREAM = "#f7ecd0";

// Cottage position (model space)
const CX = -3.9;
const CZ = 0.4;
const nearCottage = (x: number, z: number) => x > CX - 1.8 && x < CX + 1.8 && z > CZ - 1.4 && z < CZ + 1.9;

// Profiles: [radius, height] around the y axis
const islandOutline: OutlinePoint[] = [
  [0, -0.15, "sharp"],
  [5.4, -0.15],
  [6.0, 0.35],
  [6.1, 0.9],
  [5.7, 1.5],
  [5.0, 1.95],
  [4.0, 2.2],
  [2.4, 2.32],
  [0, 2.32, "sharp"],
];

const towerOutline: OutlinePoint[] = [
  [0, 2.0, "sharp"],
  [2.45, 2.0],
  [2.45, 2.3],
  [1.72, 2.85],
  [1.5, 8.7],
  [0, 8.7, "sharp"],
];

const deckOutline: OutlinePoint[] = [
  [0, 8.45, "sharp"],
  [2.1, 8.45],
  [2.2, 8.6],
  [2.1, 8.8],
  [0, 8.8, "sharp"],
];

const seaOutline: OutlinePoint[] = [
  [0, -0.2, "sharp"],
  [8.5, -0.2],
  [8.5, 0],
  [0, 0, "sharp"],
];

const foamOutline: OutlinePoint[] = [
  [5.1, -0.01],
  [5.9, -0.01],
  [6.45, 0.05],
  [5.1, 0.07],
];

// Drawings
const tuftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M1 32 Q5 15 13 2 Q12 17 17 32 Z" fill="#ffffff"/>
<path d="M11 32 Q13 12 22 5 Q20 19 27 32 Z" fill="#d6d6d6"/>
<path d="M6 32 Q9 24 4 18 Q13 24 11 32 Z" fill="#b8b8b8"/>
</svg>`;

const waveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M3 22 Q9 6 16 16 Q21 23 29 10" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const windowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 46">
<rect x="0" y="0" width="40" height="46" fill="#9edcee"/>
<path d="M20 0V46M0 23H40" stroke="#ffffff" stroke-width="4"/>
<rect x="2" y="2" width="36" height="42" fill="none" stroke="#f6f0e2" stroke-width="4"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "lighthouse" });

  // Paints
  const grassPaint = mottle(GRASS, GRASS_DARK, { size: 0.5, contrast: 0.5, seed: 4 });
  const rockPaint = mottle(ROCK, ROCK_DARK, { size: 0.9, contrast: 0.6, seed: 8 });
  const plinthPaint = mottle(STONE, STONE_DARK, { size: 0.45, contrast: 0.4, seed: 12 });
  const islandPaint = paint((_p, n) => (n.y > 0.55 ? grassPaint : rockPaint));
  const towerPaint = paint((p) => {
    if (p.y < 2.85) return plinthPaint;
    return Math.floor((p.y - 2.85) / 1.0) % 2 === 0 ? RED : WHITE;
  });
  const seaPaint = paint((_p, n) => (n.y > 0.5 ? SEA : SEA_DEEP));
  const roofPaint = paint((_p, n) => (Math.abs(n.z) > 0.6 ? WALL : TILE));
  const boatPaint = paint((_p, _n, s) => (s[1] > 0.2 ? CREAM : BOAT));

  // Skeleton: the base sits on the floor, the lamp turns the beam
  const base = b.joint("base", { at: [0, 0, 0] });
  const lamp = b.joint("lamp", { parent: base, at: [0, 9.65, 0], dir: [0, 1, 0] });

  // Textures
  const tuft = svg(tuftSvg, { size: 128 });
  const waveTex = svg(waveSvg, { size: 128 });
  const windowTex = svg(windowSvg, { size: 128 });

  // Sea, foam ring and island
  b.lathe(seaOutline, { at: [0, 0, 0], bone: base, segments: 24, color: seaPaint });
  b.lathe(foamOutline, { at: [0, 0, 0], bone: base, segments: 24, smoothing: 1, color: FOAM });

  const island = b.lathe(islandOutline, {
    at: [0, 0, 0],
    bone: base,
    smoothing: 1,
    segments: 12,
    color: islandPaint,
  });
  const islandSurf = b.surface(island);

  // Lighthouse tower
  b.lathe(towerOutline, { at: [0, 0, 0], bone: base, segments: 14, color: towerPaint });
  b.lathe(deckOutline, { at: [0, 0, 0], bone: base, segments: 14, color: IRON });

  // Door, lintel, knob and windows on the tower's front (+Z)
  b.part(new THREE.BoxGeometry(0.5, 0.9, 0.16), DOOR, { bone: base, at: [0, 3.35, 1.72] });
  b.part(new THREE.BoxGeometry(0.62, 0.08, 0.14), WHITE, { bone: base, at: [0, 3.92, 1.72] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { bone: base, at: [0.16, 3.3, 1.82] });
  b.part(new THREE.PlaneGeometry(0.4, 0.46), "#ffffff", {
    bone: base,
    at: [0, 5.4, 1.67],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTex,
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.46), "#ffffff", {
    bone: base,
    at: [0, 7.3, 1.6],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTex,
  });

  // Gallery railing
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 0.85, 0.07), IRON, {
      bone: base,
      at: [2.05 * Math.sin(a), 9.225, 2.05 * Math.cos(a)],
    });
  }
  b.part(new THREE.TorusGeometry(2.05, 0.05, 4, 32).rotateX(Math.PI / 2), IRON, {
    bone: base,
    at: [0, 9.65, 0],
  });

  // Lantern room (rides the lamp joint)
  b.part(new THREE.CylinderGeometry(1.3, 1.3, 1.7, 8), GLASS, { bone: lamp, at: [0, 9.65, 0], flat: true });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.12, 1.74, 0.12), IRON, {
      bone: lamp,
      at: [1.33 * Math.sin(a), 9.65, 1.33 * Math.cos(a)],
    });
  }
  b.part(new THREE.CylinderGeometry(0.28, 1.55, 0.62, 8), IRON, { bone: lamp, at: [0, 10.81, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.14, 7, 5), BRASS, { bone: lamp, at: [0, 11.22, 0] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), IRON, { bone: lamp, at: [0, 11.5, 0] });

  // Light beams, sweeping out to the model's left
  b.extrude(
    [
      [0, -0.3],
      [6.8, -2.0],
      [6.8, 2.0],
      [0, 0.3],
    ],
    { at: [1.2, 9.65, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.06, color: BEAM, bone: lamp },
  );
  b.extrude(
    [
      [0, -0.18],
      [5.0, -0.8],
      [5.0, 0.8],
      [0, 0.18],
    ],
    { at: [1.2, 9.65, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.09, color: BEAM_CORE, bone: lamp },
  );

  // Keeper's cottage
  const winZ = CZ + 0.915;
  b.part(new THREE.BoxGeometry(2.2, 1.6, 1.8), WALL, { bone: base, at: [CX, 2.3, CZ], flat: true });
  b.extrude(
    [
      [-1.4, 0],
      [1.4, 0],
      [0, 1.05],
    ],
    { at: [CX, 3.1, CZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 2.15, color: roofPaint, bone: base },
  );
  b.part(new THREE.BoxGeometry(0.36, 0.95, 0.36), BRICK, {
    bone: base,
    at: [CX + 0.7, 3.8, CZ - 0.25],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.44, 0.84, 0.08), DOOR, { bone: base, at: [CX, 2.62, CZ + 0.91] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), BRASS, { bone: base, at: [CX + 0.14, 2.62, CZ + 0.97] });
  for (const dx of [-0.75, 0.75]) {
    b.part(new THREE.PlaneGeometry(0.5, 0.575), "#ffffff", {
      bone: base,
      at: [CX + dx, 2.72, winZ],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTex,
    });
  }

  // Bushes by the cottage and the tower
  b.part(new THREE.SphereGeometry(0.42, 7, 5), BUSH, { bone: base, at: [-2.5, 2.3, 2.1], flat: true });
  b.part(new THREE.SphereGeometry(0.4, 7, 5), BUSH, { bone: base, at: [3.1, 2.25, -1.5], flat: true });

  // Moored rowing boat, length along X
  b.extrude(
    [
      [-1.4, 0.45],
      [1.4, 0.45],
      [1.25, 0.1],
      [0.9, -0.2],
      [-0.9, -0.2],
      [-1.25, 0.1],
    ],
    {
      at: [-5.0, 0.12, 4.6],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.5, 0.9],
      color: boatPaint,
      bone: base,
    },
  );

  // Grass tufts on the island top
  const grassHits = islandSurf.scatter(200, {
    rng: rng(21),
    minDist: 0.2,
    filter: (h) => h.n.y > 0.5 && Math.hypot(h.at.x, h.at.z) > 2.6 && !nearCottage(h.at.x, h.at.z),
  });
  b.cards(grassHits, tuft, {
    size: [0.22, 0.36],
    lean: 10,
    bend: 14,
    vary: 0.3,
    rng: rng(22),
    color: GRASS,
    sink: 0.2,
  });

  // Boulders on the rocky flanks, above the waterline
  const boulderGeo = (i: number) => {
    const r = [0.42, 0.3, 0.5][i % 3];
    return new THREE.DodecahedronGeometry(r).scale(1.25, 0.75, 1 + (i % 2) * 0.2);
  };
  islandSurf
    .scatter(6, {
      rng: rng(31),
      minDist: 1.8,
      filter: (h) => h.n.y < 0.3 && h.at.y > 0.35,
    })
    .forEach((h, i) => b.stick(boulderGeo(i), i % 2 ? ROCK_DARK : ROCK, h, { embed: 0.4, flat: true }));

  // Wave curls lying on the sea
  const wavePts: [number, number][] = [
    [3.6, -6.4],
    [-2.4, -7.0],
    [6.9, -1.8],
    [-7.1, -0.6],
    [1.6, 7.1],
  ];
  b.cards(
    wavePts.map(([x, z]) => frame([x, 0.02, z], [0, 1, 0])),
    waveTex,
    {
      size: 0.9,
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 1.3), 0, Math.sin(i * 1.3)],
      color: FOAM,
    },
  );

  return b.root;
}
```