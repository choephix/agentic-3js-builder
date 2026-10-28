import * as THREE from "three";
import { createBuilder, grain, paint, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "wizard_bookshelf",
  description: "A tall oak wizard's bookcase: tomes with gilt bands, rolled scrolls, glowing orbs and candles, a brass crest.",
};

// Scale constants
const W = 1.2; // width
const D = 0.36; // depth
const H = 2.1; // height
const T = 0.04; // side thickness
const BOARD = 0.035;

// Palette
const OAK_DARK = "#4a2a14";
const OAK_LIGHT = "#8a5a2e";
const BRASS = "#d9a441";
const GOLD = "#f0c15a";
const PARCH = "#f1dfb0";
const CREAM = "#fff1d0";
const BOOK_COLORS = ["#7a1f2b", "#1e3a6e", "#245e3a", "#4b2366", "#8a5a1c", "#2b4f5e", "#6b1d4a"];

const SHELVES = [0.12, 0.62, 1.12, 1.62, 2.08];
const STOP = [0.12, 0.22, -0.02, 0.5]; // right end of each compartment's book run

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const r = rng(7);

  const woodSide = paint((p, n) => grain(OAK_LIGHT, OAK_DARK, { size: 0.05, axis: "y", seed: 3 })(p, n));
  const woodShelf = grain(OAK_LIGHT, OAK_DARK, { size: 0.05, axis: "x", seed: 5 });

  // Textures
  const SPINE = svg(
    `<svg viewBox="0 0 16 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="64" fill="#e8d7a6"/>
      <rect x="2" y="4" width="12" height="3" fill="#7a2a1a"/>
      <rect x="2" y="57" width="12" height="3" fill="#7a2a1a"/>
      <rect x="3" y="18" width="10" height="28" fill="#f5e6bd" stroke="#4a2410" stroke-width="1"/>
      <path d="M5 24h6M5 30h6M5 36h4M5 42h5" stroke="#4a2410" stroke-width="1.6"/>
    </svg>`,
    { size: 128 },
  );
  const RUNES = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="160" fill="#1b1a3a"/>
      <circle cx="50" cy="80" r="38" fill="none" stroke="#e7b84d" stroke-width="2.5"/>
      <circle cx="50" cy="80" r="26" fill="none" stroke="#e7b84d" stroke-width="1.5"/>
      <path d="M50 42 L62 80 L50 118 L38 80Z" fill="none" stroke="#7fe8ff" stroke-width="2"/>
      <path d="M10 10 L20 20 M90 10 L80 20 M10 150 L20 140 M90 150 L80 140" stroke="#e7b84d" stroke-width="2"/>
      <path d="M50 14 v10 M50 136 v10 M14 80 h10 M76 80 h10" stroke="#e7b84d" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string | THREE.Texture, tex?: THREE.Texture) =>
    b.part(
      new THREE.BoxGeometry(w, h, d),
      typeof color === "string" ? color : "#ffffff",
      tex ? { at: [x, y, z], flat: true, texture: tex } : { at: [x, y, z], flat: true },
    );

  // Carcass
  box(T, H, D, -(W / 2 - T / 2), H / 2, 0, woodSide);
  box(T, H, D, W / 2 - T / 2, H / 2, 0, woodSide);
  box(W - 2 * T + 0.02, H - 0.1, 0.02, 0, H / 2 - 0.02, -D / 2 + 0.01, OAK_DARK, RUNES);
  for (const y of SHELVES) box(W, BOARD, D, 0, y, 0, woodShelf);
  // Plinth and gilt edge trim
  box(W + 0.05, 0.1, D + 0.03, 0, 0.05, 0.005, OAK_DARK);
  for (const sx of [-1, 1]) box(0.01, H - 0.2, 0.01, sx * (W / 2 - T / 2), H / 2, D / 2 + 0.005, BRASS);

  // Crest at the top
  b.part(
    new THREE.BoxGeometry(W + 0.08, 0.06, D + 0.04),
    OAK_DARK,
    { at: [0, H + 0.02, 0], flat: true },
  );
  b.part(
    b.part ? new THREE.BoxGeometry(0.2, 0.02, 0.02) : new THREE.BoxGeometry(0.2, 0.02, 0.02),
    BRASS,
    { at: [0, H + 0.06, D / 2 + 0.01], flat: true },
  );
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.11, 0.02],
      [0.06, 0.05],
      [0.06, 0.09],
      [0.13, 0.16],
      [0.03, 0.26],
      [0, 0.3],
    ],
    { at: [0, H + 0.06, 0], color: BRASS, smoothing: 1 },
  );
  glow(b.part(new THREE.SphereGeometry(0.025, 8, 6), "#9fe8ff", { at: [0, H + 0.4, 0] }), 1.4);

  // Books in each compartment
  const palette = BOOK_COLORS;
  for (let c = 0; c < 4; c++) {
    const yb = SHELVES[c] + BOARD / 2;
    let x = -W / 2 + T + 0.012;
    while (x < STOP[c]) {
      const w = 0.034 + r() * 0.026;
      if (r() < 0.07) {
        x += w * 0.8;
        continue;
      }
      const h = 0.22 + r() * 0.18;
      const d = D - 0.07;
      const z = (r() - 0.5) * 0.03;
      const cx = x + w / 2;
      const col = palette[Math.floor(r() * palette.length)];
      box(w, h, d, cx, yb + h / 2, z, col, r() < 0.25 ? SPINE : undefined);
      box(w + 0.003, 0.012, d + 0.004, cx, yb + h - 0.02, z, GOLD);
      box(w + 0.003, 0.012, d + 0.004, cx, yb + 0.02, z, GOLD);
      x += w + 0.002;
    }
  }

  // Lying stack of tomes in the third compartment
  for (let k = 0; k < 3; k++) {
    const yb = SHELVES[2] + BOARD / 2 + 0.02 + k * 0.042;
    box(0.2, 0.038, 0.24, 0.1 + (k % 2) * 0.01, yb, 0, palette[(k + 2) % palette.length], k === 1 ? SPINE : undefined);
    box(0.205, 0.006, 0.245, 0.1 + (k % 2) * 0.01, yb + 0.012, 0, GOLD);
  }

  // Rolled scrolls in the first compartment, ribbon and end rods
  const yb0 = SHELVES[0] + BOARD / 2;
  for (const [z, dx] of [
    [-0.07, 0],
    [0.05, 0.02],
  ] as const) {
    const x = 0.3 + dx;
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 10), PARCH, { at: [x, yb0 + 0.022, z], dir: [1, 0, 0] });
    box(0.2, 0.05, 0.012, x, yb0 + 0.022, z, "#8a1a1a");
    for (const e of [-0.105, 0.105])
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.01, 10), OAK_DARK, {
        at: [x + e, yb0 + 0.022, z],
        dir: [1, 0, 0],
      });
  }

  // Candles in the second compartment
  const yb1 = SHELVES[1] + BOARD / 2;
  for (const cx of [0.36, 0.5]) {
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.04, 0.012],
        [0.012, 0.03],
        [0.012, 0.05],
        [0, 0.05],
      ],
      { at: [cx, yb1, 0], color: BRASS },
    );
    const top = yb1 + 0.05 + 0.06;
    b.part(new THREE.CylinderGeometry(0.016, 0.017, 0.12, 8), CREAM, { at: [cx, top, 0] });
    glow(b.part(new THREE.SphereGeometry(0.013, 6, 4), "#ffb347", { at: [cx, top + 0.075, 0] }), 1.6);
  }

  // Orb on a brass pedestal in the third compartment
  const yb2 = SHELVES[2] + BOARD / 2;
  const orbX = 0.42;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.015],
      [0.035, 0.03],
      [0.02, 0.06],
      [0.045, 0.075],
      [0, 0.085],
    ],
    { at: [orbX, yb2, 0], color: BRASS },
  );
  glow(b.part(new THREE.SphereGeometry(0.055, 12, 8), "#7fe8ff", { at: [orbX, yb2 + 0.085 + 0.055, 0] }), 1.3);

  // Two orbs on the top board, flanking the crest
  for (const [x, col] of [
    [-0.35, "#ff5d7a"],
    [0.35, "#b38cff"],
  ] as const) {
    const top = SHELVES[4] + BOARD / 2;
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.07, 0.015],
        [0.035, 0.03],
        [0.02, 0.06],
        [0.045, 0.075],
        [0, 0.085],
      ],
      { at: [x, top, 0], color: BRASS },
    );
    glow(b.part(new THREE.SphereGeometry(0.05, 12, 8), col, { at: [x, top + 0.085 + 0.05, 0] }), 1.3);
  }

  return b.root;
}
