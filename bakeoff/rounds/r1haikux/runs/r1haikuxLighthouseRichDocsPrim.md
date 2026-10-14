```ts
import * as THREE from "three";
import { createBuilder, noise, paint, rng, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse island",
  description:
    "A tiny rocky island on a round display base: a red-and-white striped lighthouse with a glowing lantern room and iron gallery, a keeper's cottage with a crooked chimney and blue door, a jetty with a rowboat tied to it, two seagulls, grass tufts and wildflowers, and turquoise water ringed with white foam.",
};

type V3 = [number, number, number];

// ---- palette -------------------------------------------------------------
const RED = "#d93a2b";
const CREAM = "#f7f0e1";
const ROOF = "#b5482f";
const DOME = "#8f2b1f";
const WALL = "#f3e5c6";
const TRIM = "#fbf8f0";
const STONE = "#8e98a4";
const BLUE = "#2f72c2";
const DOOR_DK = "#3b2619";
const WOOD = "#6b4629";
const WOOD_LT = "#b98a57";
const SEAT = "#4a2f1d";
const IRON = "#202329";
const GLASS = "#ffe27a";
const GOLD = "#f0bc4a";
const ROCK = "#959fab";
const ROCK_DK = "#6f7985";
const GRASS = "#78c652";
const GRASS_DK = "#4f9d3b";
const TURQ = "#2ec9c2";
const TURQ_LT = "#6ee6d8";
const TURQ_DP = "#18a0b6";
const FOAM = "#f5fffd";
const INK = "#1e2530";
const GULL = "#fbfbf7";
const WING = "#bccbd6";
const BEAK = "#f4a22a";
const BRICK = "#a2543f";
const CAP = "#2d2d34";
const ROPE = "#b48a57";
const PATH_STONE = "#d6cdbd";
const FLOWERBOX = "#7a4a26";
const BOAT_RED = "#e8583e";
const PINK = "#ff7eab";
const YELLOW = "#ffd23f";
const PUFF = "#f4f6f8";

// ---- layout (metres; base centred on x = z = 0) --------------------------
const WATER_Y = 0.1;
const ISLAND = { x: 0, y: 0.095, z: -0.1 };
const TOWER = { x: -0.1, z: -0.16, y0: 0.28, y1: 0.84 };
const COT = { x: 0.1, z: -0.08 };
const FLOOR = 0.285;
const DECK = { x: -0.07, z: 0.3 };
const BOAT = { x: 0.17, y: 0.098, z: 0.43 };
const PATH_A = { x: 0.1, z: 0.0 };
const PATH_B = { x: -0.03, z: 0.085 };

// island height above ISLAND.y by radius (ascending radius)
const TOP: [number, number][] = [
  [0, 0.19],
  [0.22, 0.19],
  [0.26, 0.18],
  [0.3, 0.14],
  [0.34, 0.1],
  [0.38, 0.06],
  [0.41, 0.02],
];

const islandProfile: OutlinePoint[] = [
  [0, 0],
  [0.4, 0],
  [0.41, 0.02],
  [0.38, 0.06],
  [0.34, 0.1],
  [0.3, 0.14],
  [0.26, 0.18],
  [0.22, 0.19],
  [0, 0.19],
];
const roofOutline: OutlinePoint[] = [
  [-0.1, 0],
  [0.1, 0],
  [0, 0.085],
];
const hullOutline: OutlinePoint[] = [
  [-0.09, 0.052, "sharp"],
  [0.1, 0.052, "sharp"],
  [0.06, 0],
  [-0.07, 0],
];
const wingOutline: OutlinePoint[] = [
  [0, -0.03],
  [0.06, -0.03],
  [0.15, -0.012, "sharp"],
  [0.14, 0.016],
  [0.06, 0.026],
  [0, 0.026],
];

function islandTop(x: number, z: number): number {
  const r = Math.hypot(x - ISLAND.x, z - ISLAND.z);
  for (let i = 0; i + 1 < TOP.length; i++) {
    const [r0, h0] = TOP[i];
    const [r1, h1] = TOP[i + 1];
    if (r <= r1) return ISLAND.y + h0 + ((h1 - h0) * Math.max(0, r - r0)) / (r1 - r0);
  }
  return ISLAND.y;
}

const polar = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [ISLAND.x + r * Math.sin(a), ISLAND.z + r * Math.cos(a)];
};

const rotY = (v: V3, deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};

const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const segDist = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(px - (ax + vx * t), pz - (az + vz * t));
};

export default function build() {
  const b = createBuilder({ name: "lighthouse-island" });
  b.joint("base", { at: [0, 0, 0] });

  // ---- paints ----------------------------------------------------------
  const water = paint((p) => {
    const d = Math.hypot(p.x - ISLAND.x, p.z - ISLAND.z);
    const edge = d - 0.415 + (noise(p, 0.09, 21) - 0.5) * 0.04;
    if (edge < 0.035) return FOAM;
    if (edge < 0.12) return TURQ_LT;
    return edge < 0.25 ? TURQ : TURQ_DP;
  });

  const islandSkin = paint((p, n) => {
    if (n.y > 0.7) return noise(p, 0.06, 4) > 0.45 ? GRASS : GRASS_DK;
    return noise(p, 0.04, 9) > 0.5 ? ROCK : ROCK_DK;
  });

  const planks = paint((p) => (Math.floor(p.x / 0.025) % 2 === 0 ? WOOD_LT : WOOD));
  const wingSkin = paint((_p, _n, s) => (s[0] > 0.15 ? INK : WING));
  const boatSkin = paint((_p, _n, s) => (s[1] > 0.04 ? CREAM : BOAT_RED));

  // ---- textures (svg drawings) ------------------------------------------
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M2 32 C4 22 6 12 9 3 C11 14 12 22 14 32 Z" fill="#3f9a3a"/>
<path d="M11 32 C13 20 14 8 17 0 C18 13 19 22 21 32 Z" fill="#62b84b"/>
<path d="M19 32 C21 22 23 15 27 6 C26 16 27 24 30 32 Z" fill="#2f7f38"/>
</svg>`,
    { size: 128 },
  );

  const flowerSvg = (petal: string, centre: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M16 32 L16 17" stroke="#3f9a3a" stroke-width="2" fill="none"/>
<g fill="${petal}">
<circle cx="16" cy="7.5" r="5.5"/>
<circle cx="23.5" cy="12.5" r="5.5"/>
<circle cx="20.8" cy="21.5" r="5.5"/>
<circle cx="11.2" cy="21.5" r="5.5"/>
<circle cx="8.5" cy="12.5" r="5.5"/>
</g>
<circle cx="16" cy="14.5" r="3.4" fill="${centre}"/>
</svg>`;
  const pinkTex = svg(flowerSvg("#ff7eab", "#ffd23f"), { size: 128 });
  const yellowTex = svg(flowerSvg("#ffd23f", "#ff9f1c"), { size: 128 });
  const whiteTex = svg(flowerSvg("#fffdf6", "#ffc93c"), { size: 128 });

  const plaqueTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 30">
<rect x="1" y="1" width="118" height="28" rx="4" fill="#d9ad4f" stroke="#6e4a14" stroke-width="2"/>
<text x="60" y="20" font-family="Georgia, serif" font-size="14" font-weight="bold" letter-spacing="2" text-anchor="middle" fill="#3b2612">ROCK LIGHT</text>
</svg>`,
    { size: 512 },
  );

  // ---- display base ----------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.06, 36), WOOD, { at: [0, 0.03, 0], flat: true });
  b.part(new THREE.TorusGeometry(0.64, 0.011, 6, 36), WOOD_LT, { at: [0, 0.06, 0], rotation: [90, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.12, 0.03), "#ffffff", { at: [0, 0.03, 0.662], texture: plaqueTex });
  b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.07, 36), water, { at: [0, 0.065, 0] });

  // ---- island ----------------------------------------------------------
  const islandPart = b.lathe(islandProfile, {
    at: [ISLAND.x, ISLAND.y, ISLAND.z],
    segments: 12,
    color: islandSkin,
  });

  // boulders on the shore and in the water
  const islandRocks: [number, number, number][] = [
    [-118, 0.33, 0.05],
    [-62, 0.36, 0.04],
    [148, 0.34, 0.055],
    [40, 0.37, 0.04],
    [-160, 0.31, 0.035],
    [96, 0.33, 0.045],
  ];
  islandRocks.forEach(([deg, r, s], i) => {
    const [x, z] = polar(deg, r);
    b.part(new THREE.DodecahedronGeometry(s, 0), i % 2 === 0 ? ROCK : ROCK_DK, {
      at: [x, islandTop(x, z) - s * 0.4, z],
      rotation: [hash(i) * 90, hash(i + 9) * 90, hash(i + 4) * 90],
      scale: [1, 0.75, 1.1],
      flat: true,
    });
  });

  const waterRocks: [number, number, number][] = [
    [-30, 0.5, 0.045],
    [120, 0.47, 0.04],
  ];
  waterRocks.forEach(([deg, r, s], i) => {
    const [x, z] = polar(deg, r);
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK, {
      at: [x, WATER_Y - s * 0.1, z],
      rotation: [hash(i + 20) * 90, hash(i + 30) * 90, hash(i + 40) * 90],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(s * 1.6, 0.008, 4, 14), FOAM, {
      at: [x, WATER_Y + 0.001, z],
      rotation: [90, 0, 0],
    });
  });

  // ---- striped lighthouse ----------------------------------------------
  const TX = TOWER.x;
  const TZ = TOWER.z;
  const rAt = (y: number) => 0.08 - 0.02 * ((y - TOWER.y0) / (TOWER.y1 - TOWER.y0));
  const bands = 6;
  const bh = (TOWER.y1 - TOWER.y0) / bands;
  for (let k = 0; k < bands; k++) {
    const ya = TOWER.y0 + k * bh;
    const yb = ya + bh;
    b.part(new THREE.CylinderGeometry(rAt(yb), rAt(ya), bh + 0.002, 14), k % 2 === 0 ? RED : CREAM, {
      at: [TX, (ya + yb) / 2, TZ],
      flat: true,
    });
  }
  // stone collar
  b.part(new THREE.CylinderGeometry(0.094, 0.1, 0.03, 12), STONE, { at: [TX, FLOOR, TZ], flat: true });
  // door and windows
  b.part(new THREE.BoxGeometry(0.032, 0.05, 0.01), DOOR_DK, { at: [TX, 0.335, TZ + rAt(0.335) + 0.003] });
  for (const wy of [0.42, 0.7]) {
    const zc = TZ + rAt(wy);
    b.part(new THREE.BoxGeometry(0.03, 0.044, 0.006), TRIM, { at: [TX, wy, zc + 0.003] });
    b.part(new THREE.BoxGeometry(0.02, 0.032, 0.008), INK, { at: [TX, wy, zc + 0.005] });
  }

  // gallery deck, corbels and railing
  const G = TOWER.y1;
  b.part(new THREE.CylinderGeometry(0.086, 0.082, 0.012, 16), IRON, { at: [TX, G + 0.006, TZ], flat: true });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.BoxGeometry(0.012, 0.024, 0.012), IRON, {
      at: [TX + 0.067 * Math.sin(a), G - 0.012, TZ + 0.067 * Math.cos(a)],
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.006, 0.048, 0.006), IRON, {
      at: [TX + 0.08 * Math.sin(a), G + 0.036, TZ + 0.08 * Math.cos(a)],
    });
  }
  b.part(new THREE.TorusGeometry(0.08, 0.0045, 4, 20), IRON, { at: [TX, G + 0.06, TZ], rotation: [90, 0, 0] });

  // lantern room (glowing glass in an iron frame)
  const L = G + 0.012;
  b.part(new THREE.CylinderGeometry(0.06, 0.062, 0.01, 8), IRON, { at: [TX, L + 0.005, TZ], flat: true });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.11, 8), GLASS, { at: [TX, L + 0.065, TZ], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.007, 0.112, 0.007), IRON, {
      at: [TX + 0.052 * Math.sin(a), L + 0.065, TZ + 0.052 * Math.cos(a)],
    });
  }
  b.part(new THREE.CylinderGeometry(0.06, 0.05, 0.012, 8), IRON, { at: [TX, L + 0.126, TZ], flat: true });
  b.part(new THREE.ConeGeometry(0.068, 0.05, 8), DOME, { at: [TX, L + 0.157, TZ], flat: true });
  b.part(new THREE.SphereGeometry(0.009, 8, 6), GOLD, { at: [TX, L + 0.19, TZ] });

  // ---- keeper's cottage -------------------------------------------------
  const cx = COT.x;
  const cz = COT.z;
  const FRONT = cz + 0.055;
  const WALL_TOP = 0.42;
  b.part(new THREE.BoxGeometry(0.17, 0.04, 0.12), STONE, { at: [cx, 0.3, cz] });
  b.part(new THREE.BoxGeometry(0.15, 0.1, 0.11), WALL, { at: [cx, 0.37, cz] });
  b.extrude(roofOutline, {
    at: [cx, WALL_TOP - 0.002, cz],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.17,
    bevel: 0.004,
    color: ROOF,
  });
  // round gable window
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 12), GLASS, {
    at: [cx, WALL_TOP + 0.03, cz + 0.087],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.014, 0.003, 4, 12), TRIM, { at: [cx, WALL_TOP + 0.03, cz + 0.09] });

  // crooked chimney with a little smoke
  const chx = cx + 0.05;
  const chz = cz - 0.05;
  b.part(new THREE.BoxGeometry(0.026, 0.08, 0.026), BRICK, { at: [chx, 0.445, chz] });
  b.part(new THREE.BoxGeometry(0.028, 0.07, 0.028), BRICK, { at: [chx + 0.003, 0.52, chz], rotation: [0, 0, -10] });
  b.part(new THREE.BoxGeometry(0.036, 0.01, 0.036), CAP, { at: [chx + 0.009, 0.557, chz], rotation: [0, 0, -10] });
  b.part(new THREE.SphereGeometry(0.011, 6, 5), PUFF, { at: [chx + 0.015, 0.585, chz + 0.002] });
  b.part(new THREE.SphereGeometry(0.015, 6, 5), PUFF, { at: [chx + 0.028, 0.612, chz + 0.004] });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), PUFF, { at: [chx + 0.046, 0.645, chz + 0.006] });

  // blue door with a gold knob
  b.part(new THREE.BoxGeometry(0.038, 0.062, 0.005), TRIM, { at: [cx, 0.351, FRONT + 0.0025] });
  b.part(new THREE.BoxGeometry(0.03, 0.056, 0.008), BLUE, { at: [cx, 0.348, FRONT + 0.004] });
  b.part(new THREE.SphereGeometry(0.0042, 6, 4), GOLD, { at: [cx + 0.009, 0.345, FRONT + 0.009] });

  // front windows with flower boxes
  for (const sx of [-1, 1]) {
    const wx = cx + sx * 0.045;
    const wy = 0.385;
    b.part(new THREE.BoxGeometry(0.036, 0.036, 0.005), TRIM, { at: [wx, wy, FRONT + 0.0025] });
    b.part(new THREE.BoxGeometry(0.026, 0.026, 0.006), GLASS, { at: [wx, wy, FRONT + 0.005] });
    b.part(new THREE.BoxGeometry(0.026, 0.003, 0.004), TRIM, { at: [wx, wy, FRONT + 0.008] });
    b.part(new THREE.BoxGeometry(0.003, 0.026, 0.004), TRIM, { at: [wx, wy, FRONT + 0.008] });
    b.part(new THREE.BoxGeometry(0.04, 0.012, 0.013), FLOWERBOX, { at: [wx, 0.356, FRONT + 0.0065] });
    for (const fx of [-0.012, 0, 0.012]) {
      b.part(new THREE.SphereGeometry(0.0055, 5, 4), fx === 0 ? YELLOW : PINK, {
        at: [wx + fx, 0.368, FRONT + 0.015],
      });
    }
  }
  // side window
  b.part(new THREE.BoxGeometry(0.004, 0.036, 0.036), TRIM, { at: [cx + 0.0765, 0.385, cz] });
  b.part(new THREE.BoxGeometry(0.006, 0.026, 0.026), GLASS, { at: [cx + 0.0785, 0.385, cz] });

  // stepping stones from the door toward the jetty
  for (let i = 0; i < 5; i++) {
    const t = 0.12 + i * 0.18;
    b.part(new THREE.CylinderGeometry(0.012, 0.014, 0.008, 7), PATH_STONE, {
      at: [PATH_A.x + (PATH_B.x - PATH_A.x) * t, FLOOR, PATH_A.z + (PATH_B.z - PATH_A.z) * t],
    });
  }

  // ---- jetty --------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.36), planks, { at: [DECK.x, 0.125, DECK.z] });
  for (const px of [-0.11, -0.03]) {
    for (const pz of [0.33, 0.45]) {
      b.part(new THREE.CylinderGeometry(0.007, 0.008, 0.03, 6), WOOD, { at: [px, 0.107, pz] });
    }
  }
  b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.03, 8), CAP, { at: [-0.035, 0.15, 0.45] });
  b.part(new THREE.BoxGeometry(0.035, 0.024, 0.03), WOOD_LT, { at: [-0.085, 0.147, 0.23] });

  // ---- rowboat tied at the jetty --------------------------------------------
  b.extrude(hullOutline, {
    at: [BOAT.x, BOAT.y, BOAT.z],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.085,
    bevel: 0.006,
    color: boatSkin,
  });
  b.part(new THREE.BoxGeometry(0.06, 0.004, 0.12), SEAT, { at: [BOAT.x, 0.1535, BOAT.z] });
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.02), WOOD_LT, { at: [BOAT.x, 0.162, BOAT.z + 0.01] });
  b.rod([BOAT.x - 0.01, 0.18, BOAT.z - 0.07], [0.27, 0.15, 0.27], 0.0045, { color: WOOD_LT });
  b.rod([-0.035, 0.165, 0.45], [0.125, 0.14, 0.4], 0.0028, { color: ROPE });

  // ---- seagulls ------------------------------------------------------------
  const gull = (c: V3, yaw: number) => {
    const fwd = rotY([0, 0, 1], yaw);
    const left = rotY([1, 0, 0], yaw);
    const at = (l: number, u: number, f: number): V3 => [
      c[0] + left[0] * l + fwd[0] * f,
      c[1] + u,
      c[2] + left[2] * l + fwd[2] * f,
    ];
    b.part(new THREE.SphereGeometry(0.028, 10, 8), GULL, {
      at: at(0, 0, 0),
      dir: fwd,
      scale: [0.8, 2.1, 0.8],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), GULL, { at: at(0, 0.024, 0.062), flat: true });
    b.part(new THREE.ConeGeometry(0.0065, 0.03, 6), BEAK, { at: at(0, 0.02, 0.085), dir: fwd, flat: true });
    b.part(new THREE.BoxGeometry(0.026, 0.006, 0.05), WING, {
      at: at(0, 0.002, -0.088),
      dir: fwd,
      axis: "z",
      up: [0, 1, 0],
    });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.0045, 5, 4), INK, { at: at(s * 0.01, 0.034, 0.072) });
      const span = norm([left[0] * s, 0.25, left[2] * s]);
      b.extrude(wingOutline, {
        at: at(s * 0.012, 0, 0.01),
        x: span,
        y: fwd,
        thickness: 0.007,
        bevel: 0.002,
        color: wingSkin,
      });
    }
  };
  gull([-0.28, 0.7, 0.05], 20);
  gull([0.24, 0.8, -0.3], -35);

  // ---- grass tufts and wildflowers on the island ----------------------------
  const clear = (x: number, z: number) =>
    Math.hypot(x - TOWER.x, z - TOWER.z) > 0.13 &&
    !(Math.abs(x - COT.x) < 0.1 && Math.abs(z - COT.z) < 0.08) &&
    !(x > -0.15 && x < 0 && z > 0) &&
    segDist(x, z, PATH_A.x, PATH_A.z, PATH_B.x, PATH_B.z) > 0.025;

  const islandSurf = b.surface(islandPart);

  const grassHits = islandSurf.scatter(120, {
    rng: rng(41),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.55 && clear(h.at.x, h.at.z),
  });
  b.cards(grassHits, grassTex, { size: 0.05, cross: true, vary: 0.3, spin: 30, rng: rng(42) });

  const flowerHits = islandSurf.scatter(40, {
    rng: rng(77),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.6 && clear(h.at.x, h.at.z),
  });
  b.cards(flowerHits, [pinkTex, yellowTex, whiteTex],