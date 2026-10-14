The diorama is a round plinth with turquoise water and a rocky island. It has a striped lighthouse with a lantern room and balcony, a cottage with a crooked chimney and blue door, a jetty with a rowboat tied to it, two gulls in flight, and grass and wildflowers scattered over the rock. I haven't run this module, so treat the first build as a check.

```ts
import * as THREE from "three";
import { createBuilder, mottle, rng, stripes } from "agentic-3js-builder";

export const meta = {
  name: "lighthouse-diorama",
  description: "A striped lighthouse and keeper's cottage on a rocky island, with a jetty, rowboat, gulls and wildflowers, on a round display base.",
};

// Lighthouse tower origin (base centre)
const TX = -0.22;
const TY = 0.28;
const TZ = -0.2;

// Cottage origin (base centre)
const CX = 0.42;
const CY = 0.28;
const CZ = 0.02;

const RED = "#d7322b";
const WHITE = "#f4f1ea";
const IRON = "#2a2e35";
const GLASS = "#ffe27a";
const ROOF_RED = "#b8322a";
const BRASS = "#d9a441";
const CREAM = "#f5e9d0";
const BRICK = "#9c4a3a";
const SOOT = "#5b3a30";
const BLUE = "#2f6fb3";
const WINDOW = "#ffd77a";
const WOOD = "#6b4428";
const DECK = "#a8713f";
const DECK2 = "#93602f";
const HULL = "#e4572e";
const ROPE = "#b38a55";
const FOAM = "#f8fbfb";
const SMOKE = "#f1f1ee";
const GULL_WHITE = "#f5f6f2";
const GULL_WING = "#8fa3b5";
const BEAK = "#f2b233";
const STEM = "#4a7d2a";
const BOULDER = "#7d858c";
const GRASSES = ["#4f8a2c", "#66a53a", "#7cb84a"];
const FLOWERS = ["#ff7fb0", "#ffd23f", "#ffffff", "#b78cff"];

export default function build() {
  const b = createBuilder({ name: "lighthouse-diorama" });
  b.joint("base", { at: [0, 0, 0] });

  const rnd = rng(21);
  pickRng(rnd);

  // Display plinth with a brass rim
  b.part(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 40), WOOD, { at: [0, 0.06, 0] });
  b.part(new THREE.TorusGeometry(1.4, 0.018, 6, 48).rotateX(Math.PI / 2), BRASS, { at: [0, 0.12, 0] });

  // Turquoise water with white foam rings
  const sea = mottle("#1fb5b0", "#49d8cc", { size: 0.3, seed: 4 });
  b.part(new THREE.CylinderGeometry(1.3, 1.3, 0.04, 40), sea, { at: [0, 0.11, 0] });
  b.part(new THREE.TorusGeometry(1.04, 0.03, 5, 32).rotateX(Math.PI / 2), FOAM, { at: [0, 0.135, 0] });
  b.part(new THREE.TorusGeometry(1.14, 0.018, 4, 40).rotateX(Math.PI / 2), FOAM, { at: [0, 0.13, 0] });

  // Island rock and grassy crown
  const rock = b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [1.02, 0.03],
      [0.9, 0.1],
      [0.7, 0.15],
      [0.4, 0.18],
      [0, 0.18],
    ],
    { at: [0, 0.13, 0], color: mottle("#8d949a", "#6c737a", { size: 0.22, seed: 9 }) },
  );
  const grassPaint = mottle("#5e9b36", "#86bd4c", { size: 0.12, seed: 3 });
  const cap = b.lathe(
    [
      [0, 0.12],
      [0.48, 0.16],
      [0.42, 0.2],
      [0, 0.2],
    ],
    { at: [0, 0.13, 0], color: grassPaint },
  );

  // Boulders on the rock edge
  const boulders: [number, number, number, number][] = [
    [-0.72, 0.2, 0.35, 0.08],
    [-0.45, 0.22, 0.62, 0.06],
    [0.1, 0.22, 0.8, 0.07],
    [-0.82, 0.13, -0.1, 0.07],
  ];
  for (const [x, y, z, r] of boulders) {
    b.part(new THREE.DodecahedronGeometry(r, 0), BOULDER, { at: [x, y, z] });
  }

  // Lighthouse tower
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.11, 0.95],
      [0, 0.95],
    ],
    { at: [TX, TY, TZ], color: stripes(RED, WHITE, { size: 0.22, axis: "y" }) },
  );
  // Door and window on the tower
  b.part(new THREE.BoxGeometry(0.05, 0.12, 0.02), "#4a2c1a", { at: [TX, TY + 0.07, TZ + 0.158] });
  b.part(new THREE.BoxGeometry(0.04, 0.06, 0.02), IRON, { at: [TX, TY + 0.5, TZ + 0.14] });

  // Balcony with iron railing
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 20), IRON, { at: [TX, TY + 0.95, TZ] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 4), IRON, {
      at: [TX + Math.sin(a) * 0.185, TY + 1.025, TZ + Math.cos(a) * 0.185],
    });
  }
  b.part(new THREE.TorusGeometry(0.185, 0.007, 4, 24).rotateX(Math.PI / 2), IRON, {
    at: [TX, TY + 1.085, TZ],
  });

  // Glowing lantern room, roof and finial
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.13, 0.2],
      [0, 0.2],
    ],
    { at: [TX, TY + 0.95, TZ], color: GLASS },
  );
  b.lathe(
    [
      [0, 0],
      [0.17, 0],
      [0.03, 0.14, "sharp"],
      [0, 0.14],
    ],
    { at: [TX, TY + 1.15, TZ], color: ROOF_RED },
  );
  b.part(new THREE.SphereGeometry(0.02, 6, 4), BRASS, { at: [TX, TY + 1.29, TZ] });

  // Keeper's cottage: walls, roof slabs, gables
  const w = CY + 0.2;
  const c = w + 0.1;
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.26), CREAM, { at: [CX, CY + 0.1, CZ] });
  b.part(new THREE.BoxGeometry(0.24, 0.025, 0.32), ROOF_RED, { at: [CX + 0.09, c, CZ], rotation: [0, 0, -28] });
  b.part(new THREE.BoxGeometry(0.24, 0.025, 0.32), ROOF_RED, { at: [CX - 0.09, c, CZ], rotation: [0, 0, 28] });
  b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0, 0.16],
    ],
    { at: [CX, w, CZ + 0.13], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: CREAM },
  );
  b.extrude(
    [
      [-0.19, 0],
      [0.19, 0],
      [0, 0.16],
    ],
    { at: [CX, w, CZ - 0.13], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: CREAM },
  );

  // Crooked chimney with smoke puffs
  b.part(new THREE.BoxGeometry(0.05, 0.2, 0.05), BRICK, { at: [CX + 0.13, w + 0.16, CZ - 0.04], rotation: [0, 0, -10] });
  b.part(new THREE.BoxGeometry(0.065, 0.02, 0.065), SOOT, { at: [CX + 0.147, w + 0.27, CZ - 0.04], rotation: [0, 0, -10] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), SMOKE, { at: [CX + 0.19, w + 0.36, CZ - 0.04] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), SMOKE, { at: [CX + 0.22, w + 0.44, CZ - 0.06] });

  // Blue door and window on the front
  b.part(new THREE.BoxGeometry(0.07, 0.13, 0.012), BLUE, { at: [CX - 0.05, CY + 0.065, CZ + 0.135] });
  b.part(new THREE.BoxGeometry(0.07, 0.06, 0.012), WINDOW, { at: [CX + 0.07, CY + 0.14, CZ + 0.135] });
  b.part(new THREE.BoxGeometry(0.08, 0.008, 0.016), "#ffffff", { at: [CX + 0.07, CY + 0.14, CZ + 0.137] });
  b.part(new THREE.BoxGeometry(0.008, 0.062, 0.016), "#ffffff", { at: [CX + 0.07, CY + 0.14, CZ + 0.137] });

  // Jetty deck, posts and planks
  for (const x of [0.6, 0.95, 1.08]) {
    for (const z of [0.3, 0.42]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 5), WOOD, { at: [x, 0.06, z] });
    }
  }
  for (let k = 0; k < 4; k++) {
    b.part(new THREE.BoxGeometry(0.55, 0.03, 0.034), k % 2 ? DECK2 : DECK, {
      at: [0.82, 0.155, 0.3 + k * 0.035 + 0.0175],
    });
  }

  // Rowboat beside the jetty, with a rope to the deck
  b.extrude(
    [
      [-0.16, 0.06],
      [0.13, 0.06],
      [0.19, 0.01, "sharp"],
      [0.1, -0.03],
      [-0.1, -0.03],
    ],
    { at: [0.9, 0.16, 0.7], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.1, 0.14], color: HULL },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.12), WOOD, { at: [0.9, 0.2, 0.7] });
  b.rod([1.0, 0.2, 0.43], [0.97, 0.2, 0.64], 0.005, { color: ROPE });

  // Grass tufts and wildflowers on the island top
  const hits = b.surface([rock, cap]).scatter(70, {
    rng: rnd,
    minDist: 0.06,
    filter: (h) => h.n.y > 0.55 && !nearHouse(h.at.x, h.at.z),
  });
  hits.forEach((h, i) => {
    if (i % 4 === 0) {
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4), STEM, { at: h.moved([0, 0.035, 0]), dir: h });
      b.part(new THREE.SphereGeometry(0.02, 6, 4), pick(FLOWERS), { at: h.moved([0, 0.075, 0]) });
    } else {
      b.part(new THREE.ConeGeometry(0.022, 0.09, 4), pick(GRASSES), { at: h.moved([0, 0.045, 0]), dir: h });
    }
  });

  // Two seagulls in flight
  gull(-0.55, 1.22, 0.3);
  gull(0.5, 1.5, -0.3);

  return b.root;

  // ---- helpers (closures over b) ----

  function gull(x: number, y: number, z: number) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6).scale(1, 0.8, 1.8), GULL_WHITE, { at: [x, y, z] });
    b.part(new THREE.SphereGeometry(0.032, 6, 4), GULL_WHITE, { at: [x, y + 0.035, z + 0.08] });
    b.part(new THREE.ConeGeometry(0.008, 0.04, 4).rotateX(Math.PI / 2), BEAK, { at: [x, y + 0.03, z + 0.12] });
    b.part(new THREE.BoxGeometry(0.03, 0.01, 0.06), GULL_WING, { at: [x, y + 0.01, z - 0.12] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), IRON, { at: [x - 0.02, y + 0.045, z + 0.1] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), IRON, { at: [x + 0.02, y + 0.045, z + 0.1] });
    for (const s of [1, -1]) {
      b.extrude(
        [
          [-0.04, 0],
          [0.05, 0],
          [0.04, 0.12],
          [0, 0.22, "sharp"],
          [-0.05, 0.12],
        ],
        { at: [x + s * 0.03, y, z], x: [0, 0, 1], y: [s, 0, 0], thickness: 0.012, color: GULL_WING },
      );
    }
  }
}

// Shared random picker (set once per build)
let pickSource: () => number = Math.random;
function pickRng(r: () => number) {
  pickSource = r;
}
function pick<T>(xs: T[]): T {
  return xs[Math.floor(pickSource() * xs.length)];
}

// Keeps grass and flowers off the tower, the cottage and the jetty
function nearHouse(x: number, z: number): boolean {
  return (
    Math.hypot(x - TX, z - TZ) < 0.3 ||
    (x > 0.18 && x < 0.66 && z > -0.14 && z < 0.2) ||
    (x > 0.5 && z > 0.2 && z < 0.5)
  );
}
```