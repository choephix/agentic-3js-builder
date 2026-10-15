import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

type P = [number, number, number];

export const meta = {
  name: "monster truck",
  description:
    "Oversized monster truck on huge knobbly tyres: a red cab with pixel flame decals, a roll cage, a light bar, a grinning skull on the hood and a chequered flag.",
};

// One texel of every drawing and cell paint, in meters.
const PX = 0.035;

// Geometry, meters. Tyres are 1.7 m across; the tread is a 16-sided lathe, so the centre sits a hair under its radius
// to leave its lowest facet on the floor.
const WR = 0.842;
const WX = 0.95;
const FZ = 1.5;
const RZ = -1.5;

// Palette.
const RED = "#d8322a";
const RED_HI = "#f2684f";
const RED_LO = "#8e1f1d";
const SEAM = "#3a0f10";
const CHASSIS = "#2c2f3a";
const CHROME = "#c9d0dc";
const DARK = "#1b1d24";
const YELLOW = "#ffd166";
const GLOW = "#fff3c0";

// Body panels: red plates in 16-texel squares with bright bevels, seams and rivets.
const PANEL = pixelTexture(48, 48, (g) =>
  g.fill((x, y) => {
    const sx = x % 16;
    const sy = y % 16;
    if (sx === 0 || sy === 0) return SEAM;
    if (sx === 1 || sy === 1) return RED_HI;
    if ((sx === 3 || sx === 12) && (sy === 3 || sy === 12)) return CHROME;
    return (x * 5 + y * 3) % 13 === 0 ? RED_LO : RED;
  }),
);

// Tinted glass with a frame, a centre pillar and diagonal glints.
function glass(w: number, h: number) {
  return pixelTexture(w, h, (g) =>
    g.fill((x, y) => {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return "#1a1b22";
      if (x === Math.floor(w / 2)) return "#1a1b22";
      if ((x + 2 * y) % 7 === 0) return "#cfe9ff";
      return y < h / 2 ? "#4f93c9" : "#2c5f8f";
    }),
  );
}
const GLASS_FRONT = glass(26, 12);
const GLASS_SIDE = glass(11, 8);

// Grille: chrome bars, a dark mesh and a yellow badge.
const GRILLE = pixelTexture(16, 6, (g) =>
  g.fill((x, y) => {
    if (y === 0 || y === 5) return CHROME;
    if (x >= 7 && x <= 8 && y === 2) return YELLOW;
    if (y === 2 || y === 3) return x % 3 === 0 ? CHROME : "#2a2d36";
    return "#15161b";
  }),
);

// Wheel hub: a gold rim with five bolts and dark spokes.
const HUB = pixelTexture(24, 24, (g) =>
  g.fill((x, y) => {
    const dx = x - 11.5;
    const dy = y - 11.5;
    const d = Math.hypot(dx, dy);
    if (d > 11.6) return undefined;
    if (d > 10) return DARK;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      if (Math.hypot(dx - 7 * Math.cos(a), dy - 7 * Math.sin(a)) < 1.6) return "#fff3c4";
    }
    if (d < 2.6) return YELLOW;
    return Math.abs(Math.sin(2.5 * Math.atan2(dy, dx))) < 0.28 ? "#8a5a1a" : "#f2b632";
  }),
);

// Chequered flag.
const FLAG = pixelTexture(9, 6, (g) => g.fill((x, y) => ((x + y) % 2 ? "#f5f5f5" : DARK)));

// Grinning skull for the hood.
const SKULL = pixelArt(
  [
    "...........",
    "..WWWWWWW..",
    ".WWWWWWWWW.",
    ".WWKKWKKWW.",
    ".WWKKWKKWW.",
    ".WWWWWWWWW.",
    "..WWKKKWW..",
    "..WWWWWWW..",
    "...W.W.W...",
    "...WWWWW...",
  ],
  { W: "#f2efe6", K: "#15121c" },
);

// The door number "13", drawn in 3x5 digits.
const DIGIT_1 = [".#.", "##.", ".#.", ".#.", "###"];
const DIGIT_3 = ["##.", "..#", ".##", "..#", "##."];
const NUMBER = pixelArt(
  DIGIT_1.map((row, i) => `${row}.${DIGIT_3[i]}`),
  { "#": YELLOW },
);

// Flames that lick back from the cab side: tongues tallest near the tips, rising from a bottom edge.
function flame(tipRight: boolean) {
  return pixelTexture(28, 14, (g) =>
    g.fill((x, y) => {
      const t = (tipRight ? x : 27 - x) / 27;
      const tongue = Math.max(0, 1 - Math.abs(t - 0.78) * 2.6);
      const jag = x % 4 === 1 ? 2 : x % 4 === 3 ? 1 : 0;
      const h = Math.min(13, Math.round(2 + 9 * tongue + jag));
      const up = 13 - y;
      if (up >= h) return undefined;
      const f = up / h;
      return f < 0.45 ? "#fff1a1" : f < 0.75 ? "#ffb13b" : "#e8452c";
    }),
  );
}
const FLAME_RIGHT = flame(true);
const FLAME_LEFT = flame(false);

// Tyres: black rubber with lugs on the tread and a gold ring on each sidewall, one cell per texel-block.
const RUBBER = cellPaint(PX, (c) => {
  if (c.axis === 0) {
    const zc = Math.abs(c.at.z - FZ) < Math.abs(c.at.z - RZ) ? FZ : RZ;
    const r = Math.hypot(c.at.y - WR, c.at.z - zc);
    if (r > 0.69 && r < 0.76) return c.random(9) < 0.8 ? YELLOW : "#c99a3a";
    return "#2a2b33";
  }
  const lug = Math.abs(c.u + c.v) % 3 !== 0;
  return lug ? "#3a3c46" : "#17181d";
});

// Tyre cross-section, radius (x) against axial position (y). Blocky, with chamfered shoulders.
const TYRE: [number, number][] = [
  [0.6, -0.4],
  [0.66, -0.42],
  [0.8, -0.42],
  [0.85, -0.36],
  [0.85, 0.36],
  [0.8, 0.42],
  [0.66, 0.42],
  [0.6, 0.4],
];

const WHEELS: [string, 1 | -1, number][] = [
  ["FL", 1, FZ],
  ["FR", -1, FZ],
  ["RL", 1, RZ],
  ["RR", -1, RZ],
];

export default function build() {
  const b = createBuilder({ name: "monster-truck" });
  const chassis = b.joint("chassis", { at: [0, 1.1, 0] });

  const box = (w: number, h: number, d: number, color: string, at: P) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at });
  const lamp = (w: number, h: number, d: number, color: string, at: P, strength = 1.2) =>
    glow(b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at }), strength);
  const tiled = (size: P, tile: THREE.Texture, at: P) =>
    b.part(tileBox(size, tile, PX), "#ffffff", { bone: chassis, at, texture: tile });
  const decal = (w: number, h: number, texture: THREE.Texture, at: P, dir: P) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture });
  const bar = (a: P, z: P, r: number, color: string) => b.rod(a, z, r, color, { bone: chassis });

  // Frame, floor and engine.
  box(1.0, 0.3, 4.6, CHASSIS, [0, 1.1, 0]);
  box(1.7, 0.15, 3.3, CHASSIS, [0, 1.325, -0.2]);
  box(0.9, 0.3, 0.9, "#3b3f4b", [0, 1.4, 1.8]);

  // Cab, roof and hood.
  tiled([1.7, 1.2, 1.5], PANEL, [0, 2.0, 0.5]);
  box(1.8, 0.14, 1.7, DARK, [0, 2.67, 0.5]);
  tiled([1.5, 0.45, 1.0], PANEL, [0, 1.6, 1.8]);
  for (const s of [1, -1]) box(0.12, 0.02, 0.95, "#f4efe0", [s * 0.24, 1.836, 1.8]);

  // Rear body, with tail lights on its back.
  tiled([1.6, 0.8, 1.4], PANEL, [0, 1.8, -1.0]);
  for (const s of [1, -1]) lamp(0.28, 0.14, 0.05, "#ff3b2f", [s * 0.55, 1.9, -1.72], 1.2);

  // Bumpers, grille and headlights.
  box(1.9, 0.2, 0.18, CHROME, [0, 0.95, 2.45]);
  box(1.9, 0.2, 0.18, CHROME, [0, 0.95, -2.45]);
  decal(0.8, 0.3, GRILLE, [0, 1.6, 2.305], [0, 0, 1]);
  for (const s of [1, -1]) lamp(0.3, 0.14, 0.08, GLOW, [s * 0.58, 1.6, 2.33], 1.4);

  // Windows, the number and flames on the cab sides; a skull on the hood.
  decal(1.3, 0.6, GLASS_FRONT, [0, 2.2, 1.265], [0, 0, 1]);
  for (const s of [1, -1]) {
    decal(0.55, 0.4, GLASS_SIDE, [s * 0.862, 2.42, 0.85], [s, 0, 0]);
    decal(1.4, 0.7, s > 0 ? FLAME_RIGHT : FLAME_LEFT, [s * 0.862, 1.72, 0.5], [s, 0, 0]);
    decal(0.5, 0.45, SKULL, [s * 0.757, 1.6, 1.8], [s, 0, 0]);
  }
  decal(0.35, 0.25, NUMBER, [0.862, 2.42, -0.05], [1, 0, 0]);

  // Roll cage with a light bar, antenna and chequered flag.
  const cageY = 3.25;
  const Z0 = -0.2;
  const Z1 = 1.1;
  const X = 0.8;
  for (const s of [1, -1]) {
    bar([s * X, 2.7, Z0], [s * X, cageY, Z0], 0.04, DARK);
    bar([s * X, 2.7, Z1], [s * X, cageY, Z1], 0.04, DARK);
    bar([s * X, cageY, Z0], [s * X, cageY, Z1], 0.035, DARK);
    bar([s * X, 2.95, Z0], [s * X, 2.95, Z1], 0.03, DARK);
  }
  bar([-X, cageY, Z1], [X, cageY, Z1], 0.04, DARK);
  bar([-X, cageY, Z0], [X, cageY, Z0], 0.04, DARK);
  lamp(1.0, 0.08, 0.1, GLOW, [0, 3.37, Z1], 1.5);
  bar([-0.75, 2.74, -0.1], [-0.75, 3.9, -0.1], 0.015, DARK);
  decal(0.45, 0.3, FLAG, [-0.52, 3.75, -0.1], [0, 0, 1]);

  // Exhaust stacks, glowing at the top.
  for (const s of [1, -1]) {
    bar([s * 0.82, 1.5, -0.6], [s * 0.82, 3.0, -0.6], 0.05, CHROME);
    glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), "#ff8a2a", { bone: chassis, at: [s * 0.82, 3.06, -0.6] }), 1.2);
  }

  // Wheels: each is a joint on the axle, with a lathe tyre and a hub drawing on its outer face.
  for (const [tag, side, z] of WHEELS) {
    const at: P = [side * WX, WR, z];
    const hub = b.joint(`wheel${tag}`, { parent: chassis, at, dir: [1, 0, 0] });
    b.lathe(TYRE, { at, axis: [1, 0, 0], segments: 16, color: RUBBER, bone: hub, name: `tyre${tag}` });
    b.part(new THREE.CircleGeometry(0.6, 20), "#ffffff", {
      bone: hub,
      at: [side * (WX + 0.43), WR, z],
      dir: [side, 0, 0],
      axis: "z",
      texture: HUB,
      name: `hub${tag}`,
    });
  }

  return b.root;
}
