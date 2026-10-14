```ts
import * as THREE from "three";
import { createBuilder, paint, spots, stripes, svg, rng } from "agentic-3js-builder";

// Palette
const MINT = "#7fd8c0";
const CREAM = "#fff4df";
const RED = "#e8453c";
const PINK = "#ff8fb8";
const MINT_SCOOP = "#8fe3c8";
const CHOC = "#6b3a22";
const VANILLA = "#fff0c2";
const DARK = "#2b2b33";
const CHROME = "#c9d1d6";
const YELLOW = "#ffd23f";
const GLASS = "#c9f1ff";
const TIRE = "#25252b";
const HUB = "#e9e2d0";
const WAFFLE_A = "#f2c46d";
const WAFFLE_B = "#d9953f";
const SPRINKLES = ["#ff4d6d", "#ffd23f", "#4cc9f0", "#ffffff"];

// Paints
const BODY = spots(MINT, CREAM, { size: 0.3, amount: 0.2, seed: 4 });
const AWNING = stripes(RED, CREAM, { size: 0.16, axis: "x" });
const WAFFLE = paint((_p, _n, s) => ((Math.floor(s[0] * 30) + Math.floor(s[1] / 30)) % 2 ? WAFFLE_A : WAFFLE_B));

// Half-dome outline for a scoop, base on the y = 0 plane
function dome(r: number): [number, number][] {
  const pts: [number, number][] = [[0, 0]];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

// Textures
const sideSign = svg(
  `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="392" height="92" rx="22" fill="${CREAM}"/>
    <rect x="14" y="14" width="372" height="72" rx="14" fill="none" stroke="${RED}" stroke-width="6"/>
    <text x="200" y="68" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="54" text-anchor="middle" fill="${RED}">ICE CREAM</text>
  </svg>`,
  { size: 512 },
);

const menu = svg(
  `<svg viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="420" height="170" rx="14" fill="${DARK}"/>
    <text x="210" y="46" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" text-anchor="middle" fill="${YELLOW}">SCOOPS</text>
    <circle cx="48" cy="90" r="13" fill="${PINK}"/>
    <text x="74" y="98" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#ffffff">Strawberry</text>
    <circle cx="48" cy="130" r="13" fill="${MINT_SCOOP}"/>
    <text x="74" y="138" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#ffffff">Mint</text>
    <circle cx="260" cy="90" r="13" fill="${CHOC}"/>
    <text x="286" y="98" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#ffffff">Choc</text>
    <circle cx="260" cy="130" r="13" fill="${VANILLA}"/>
    <text x="286" y="138" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#ffffff">Vanilla</text>
  </svg>`,
  { size: 512 },
);

export const meta = {
  name: "Ice cream cart",
  description: "A striped-awning ice cream cart on four wheels with a giant waffle-cone sign on the roof.",
};

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });
  const cart = b.joint("cart", { at: [0, 0, 0] });

  // Undercarriage and wheels
  b.part(new THREE.BoxGeometry(1.1, 0.06, 1.2), DARK, { at: [0, 0.27, 0] });
  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.5, 0.5]) {
      b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 12), TIRE, {
        at: [x, 0.16, z],
        rotation: [0, 0, 90],
      });
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.078, 8), HUB, {
        at: [x, 0.16, z],
        rotation: [0, 0, 90],
      });
    }
  }

  // Main body with trims
  const body = b.part(new THREE.BoxGeometry(1.2, 0.7, 1.5), BODY, { at: [0, 0.65, 0] });
  b.part(new THREE.BoxGeometry(1.22, 0.08, 1.52), RED, { at: [0, 0.36, 0] });
  b.part(new THREE.BoxGeometry(1.23, 0.06, 1.53), CREAM, { at: [0, 0.99, 0] });

  // Side lettering
  for (const s of [1, -1]) {
    b.decal(body, sideSign, { at: [s * 0.6, 0.7, 0.1], dir: [s, 0, 0], size: [0.9, 0.225] });
  }

  // Serving window: cream surround, cold glass, counter on top
  b.part(new THREE.BoxGeometry(0.86, 0.36, 0.02), CREAM, { at: [0, 0.8, 0.76] });
  b.part(new THREE.BoxGeometry(0.78, 0.3, 0.01), GLASS, { at: [0, 0.8, 0.775] });
  b.part(new THREE.BoxGeometry(1.14, 0.05, 0.32), CREAM, { at: [0, 1.0, 0.91] });

  // Tubs on the counter
  const tubs = [PINK, MINT_SCOOP, CHOC, VANILLA];
  tubs.forEach((c, i) => {
    b.part(new THREE.CylinderGeometry(0.065, 0.055, 0.08, 10), c, {
      at: [-0.36 + i * 0.24, 1.065, 0.95],
    });
  });

  // Striped awning on two supports
  b.part(new THREE.BoxGeometry(1.34, 0.03, 0.55), AWNING, {
    at: [0, 1.2, 1.0],
    rotation: [12, 0, 0],
  });
  for (const x of [-0.62, 0.62]) {
    b.rod([x, 1.01, 1.15], [x, 1.15, 1.2], 0.02, { color: CHROME });
  }

  // Menu board hung on the front, with a drawn menu on its face
  const board = b.part(new THREE.BoxGeometry(0.9, 0.36, 0.03), CREAM, { at: [0, 1.48, 0.8] });
  b.decal(board, menu, { at: [0, 1.48, 0.816], dir: [0, 0, 1], size: [0.86, 0.34] });

  // Roof, lip and corner posts
  b.part(new THREE.BoxGeometry(1.42, 0.05, 1.68), CREAM, { at: [0, 1.69, 0] });
  b.part(new THREE.BoxGeometry(1.36, 0.07, 1.62), RED, { at: [0, 1.75, 0] });
  for (const x of [-0.58, 0.58]) {
    for (const z of [-0.7, 0.7]) {
      b.rod([x, 1.0, z], [x, 1.71, z], 0.025, { color: CHROME });
    }
  }

  // Roof lights
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.8, 0.8]) {
      b.part(new THREE.SphereGeometry(0.035, 8, 6), YELLOW, { at: [x, 1.69, z] });
    }
  }

  // Push handle at the back
  b.rod([-0.55, 0.9, -0.98], [0.55, 0.9, -0.98], 0.025, { color: CHROME });
  for (const x of [-0.55, 0.55]) {
    b.rod([x, 0.9, -0.98], [x, 0.9, -0.75], 0.02, { color: CHROME });
  }

  // Giant waffle cone on the roof, with three stacked scoops and a cherry
  b.lathe(
    [
      [0, 0],
      [0.13, 0.4],
      [0, 0.4],
    ],
    { at: [0, 1.78, 0], color: WAFFLE },
  );

  const scoopA = b.lathe(dome(0.15), { at: [0, 2.14, 0], color: PINK });
  const scoopB = b.lathe(dome(0.13), { at: [0, 2.25, 0], color: MINT_SCOOP });
  const scoopC = b.lathe(dome(0.11), { at: [0, 2.35, 0], color: CHOC });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), RED, { at: [0, 2.5, 0] });

  // Sprinkles scattered across the upper scoops
  const sprinkle = new THREE.CapsuleGeometry(0.008, 0.03, 2, 4);
  const sprinkleSources = [
    { part: scoopA, seed: 11 },
    { part: scoopB, seed: 12 },
    { part: scoopC, seed: 13 },
  ];
  for (const { part, seed } of sprinkleSources) {
    const hits = b.surface(part).scatter(26, {
      rng: rng(seed),
      minDist: 0.035,
      filter: (h) => h.n.y > 0.3,
    });
    hits.forEach((h, i) => {
      b.stick(sprinkle, SPRINKLES[i % SPRINKLES.length], h, { spin: i * 37 });
    });
  }

  void cart;
  return b.root;
}
```