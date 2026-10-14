```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "hot-air-balloon",
  description:
    "A striped hot-air balloon on its wicker basket, sandbags on the sides, burner lit at the mouth, ropes and a little corner flag.",
};

const SUNFLOWER = "#ffc62b";
const TOMATO = "#e5472f";
const SKY = "#5fb6ec";
const CREAM = "#fff3d4";
const TEAL = "#1d7f8c";
const NAVY = "#1d2c5a";
const WICKER_DARK = "#8a5a2b";
const WICKER_LIGHT = "#d9a866";
const ROPE = "#6b4a2b";
const SAND = "#cfae72";
const BURNER = "#3b3b3b";
const FLAME = "#ff8c1a";
const CORE = "#ffd23f";
const GLOW = "#ff7a1a";

// Envelope profile (radius, height) from top to mouth, in meters before the lift.
const PROFILE: [number, number][] = [
  [0, 19],
  [3, 18.5],
  [5.5, 16.5],
  [6.9, 13],
  [7.2, 10],
  [6.6, 6.5],
  [4.6, 3.5],
  [2.6, 2.2],
  [2.2, 1.8],
];
const LIFT = 3; // envelope sits above the basket
const MOUTH_Y = 1.8 + LIFT;
const GORES = 9;
const GORE_COLORS = [SUNFLOWER, TOMATO, SKY];

// Basket body radius as a function of height.
const bodyR = (y: number) => 1.0 + (0.25 * (y - 0.1)) / 1.5;

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  b.joint("base", { at: [0, 0, 0] });

  // ---- Envelope: nine lathed gores in three colours ----
  const pts = PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
  for (let g = 0; g < GORES; g++) {
    const geo = new THREE.LatheGeometry(
      pts,
      8,
      (g * Math.PI * 2) / GORES,
      (Math.PI * 2) / GORES,
    );
    b.part(geo, GORE_COLORS[g % 3], { at: [0, LIFT, 0] });
  }

  // ---- Patterned band around the widest point ----
  const bandY = 10 + LIFT;
  const band = new THREE.TorusGeometry(7.25, 0.2, 6, 28);
  band.rotateX(Math.PI / 2);
  b.part(band, NAVY, { at: [0, bandY, 0] });

  const TILES = 24;
  for (let i = 0; i < TILES; i++) {
    const a = (i * Math.PI * 2) / TILES;
    const tile = new THREE.BoxGeometry(0.8, 0.9, 0.25);
    tile.rotateY(a);
    b.part(tile, i % 2 === 0 ? CREAM : TEAL, {
      at: [7.5 * Math.sin(a), bandY, 7.5 * Math.cos(a)],
    });
  }

  // ---- Burner at the mouth ----
  const burnerBody = new THREE.CylinderGeometry(0.9, 0.7, 0.7, 10);
  b.part(burnerBody, BURNER, { at: [0, MOUTH_Y - 0.35, 0] });

  const glowRing = new THREE.TorusGeometry(0.95, 0.12, 6, 16);
  glowRing.rotateX(Math.PI / 2);
  b.part(glowRing, GLOW, { at: [0, MOUTH_Y - 0.25, 0] });

  const flame = new THREE.ConeGeometry(0.55, 1.0, 8);
  b.part(flame, FLAME, { at: [0, MOUTH_Y + 0.4, 0] });

  const core = new THREE.SphereGeometry(0.4, 8, 6);
  b.part(core, CORE, { at: [0, MOUTH_Y + 0.1, 0] });

  // ---- Basket: woven wicker body on a base ----
  const bottom = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 12);
  b.part(bottom, WICKER_DARK, { at: [0, 0.05, 0] });

  const body = new THREE.CylinderGeometry(1.25, 1.0, 1.5, 12);
  b.part(body, WICKER_LIGHT, { at: [0, 0.85, 0] });

  // Vertical staves
  const STAVES = 12;
  for (let i = 0; i < STAVES; i++) {
    const a = (i * Math.PI * 2) / STAVES;
    const stave = new THREE.BoxGeometry(0.08, 1.5, 0.06);
    stave.rotateY(a);
    const r = bodyR(0.85) + 0.02;
    b.part(stave, WICKER_DARK, { at: [r * Math.sin(a), 0.85, r * Math.cos(a)] });
  }

  // Horizontal weave rings, alternating dark and light
  [0.35, 0.6, 0.85, 1.1, 1.35].forEach((y, i) => {
    const ring = new THREE.TorusGeometry(bodyR(y) + 0.03, 0.06, 5, 18);
    ring.rotateX(Math.PI / 2);
    b.part(ring, i % 2 === 0 ? WICKER_DARK : WICKER_LIGHT, { at: [0, y, 0] });
  });

  // Rim
  const rim = new THREE.TorusGeometry(1.27, 0.1, 6, 16);
  rim.rotateX(Math.PI / 2);
  b.part(rim, WICKER_DARK, { at: [0, 1.6, 0] });

  // ---- Sandbags hanging on the sides ----
  const bagSpots: [number, number, number][] = [
    [1.55, 0.85, 0.45],
    [-1.55, 0.85, -0.45],
  ];
  for (const [x, y, z] of bagSpots) {
    const bag = new THREE.SphereGeometry(0.32, 8, 6);
    bag.scale(1.3, 0.9, 0.8);
    b.part(bag, SAND, { at: [x, y, z] });

    // short tie rope from the rim down to the bag
    const top: [number, number, number] = [x * 0.9, 1.55, z * 0.9];
    const bagTop: [number, number, number] = [x, y + 0.25, z];
    const len = Math.hypot(
      bagTop[0] - top[0],
      bagTop[1] - top[1],
      bagTop[2] - top[2],
    );
    const tie = new THREE.CylinderGeometry(0.02, 0.02, len, 4);
    b.part(tie, ROPE, {
      at: [
        (top[0] + bagTop[0]) / 2,
        (top[1] + bagTop[1]) / 2,
        (top[2] + bagTop[2]) / 2,
      ],
      aim: bagTop,
    });
  }

  // ---- Suspension ropes: four from basket rim to envelope mouth ----
  const ropeAngles = [0, 90, 180, 270];
  for (const deg of ropeAngles) {
    const a = (deg * Math.PI) / 180;
    const bx = 1.25 * Math.sin(a);
    const bz = 1.25 * Math.cos(a);
    const ex = 2.2 * Math.sin(a);
    const ez = 2.2 * Math.cos(a);
    const start: [number, number, number] = [bx, 1.6, bz];
    const end: [number, number, number] = [ex, MOUTH_Y, ez];
    const len = Math.hypot(ex - bx, MOUTH_Y - 1.6, ez - bz);
    const rope = new THREE.CylinderGeometry(0.035, 0.035, len, 4);
    b.part(rope, ROPE, {
      at: [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2,
      ],
      aim: end,
    });
  }

  // ---- Little flag on a basket corner ----
  const poleX = 0.95;
  const poleZ = 0.95;
  const pole = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4);
  b.part(pole, WICKER_DARK, { at: [poleX, 2.2, poleZ] });

  const flag = new THREE.BoxGeometry(0.7, 0.4, 0.03);
  b.part(flag, TOMATO, { at: [poleX + 0.35, 2.7, poleZ] });

  return b.root;
}
```