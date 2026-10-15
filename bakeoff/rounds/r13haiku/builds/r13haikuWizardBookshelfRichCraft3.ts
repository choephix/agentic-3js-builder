import * as THREE from "three";
import type { BufferGeometry, Texture } from "three";
import { createBuilder, grain, mottle, rng, stripes, svg } from "../../../../src/index";
import type { Fill, V3 } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's bookshelf",
  description:
    "A tall honey-oak bookcase under an indigo crest, stacked with jewel-bound tomes, rolled scrolls, a pot of scrolls, glowing orbs and candles.",
};

// Proportions in meters. Bays fill from x = -0.52 (the model's right side) toward +0.52 (its left).
const W = 1.1; // carcass width
const D = 0.36; // carcass depth
const T = 0.03; // side panel thickness
const BOARD = 0.03; // shelf board thickness
const BOARD_Y = [0.1, 0.44, 0.78, 1.12, 1.46, 1.8]; // board bottoms, bottom to top
const TOP = 1.83; // top of the carcass
const CORNICE = 1.88; // top of the cornice: the crest and the top items stand here
const INNER_L = -W / 2 + T;
const INNER_W = W - 2 * T;
const BOOK_D = 0.28; // book depth; spines face the room
const BOOK_Z = -0.025;
const BOOK_FRONT = BOOK_Z + BOOK_D / 2;

// ---------------------------------------------------------------------------------------------------------------
// Paints: honey oak, indigo cornice, gold trim, jewel-toned covers. Everything is cel-shaded.

const WOOD_UPRIGHT = cel(grain("#b07240", "#6e3d20", { size: 0.05, axis: "y" }));
const WOOD_SHELF = cel(grain("#c3834c", "#7d4727", { size: 0.05, axis: "x" }));
const WOOD_BACK = cel(grain("#5e3821", "#341a10", { size: 0.04, axis: "y" }));
const INDIGO = cel(grain("#3d2d7a", "#221a4c", { size: 0.05, axis: "x" }));
const PLINTH = cel("#2c1d40", "#170f26");
const GOLD = cel("#ffd768", "#c58a2c");
const BRASS = cel("#e9b354", "#8e5e1f");
const PARCH = cel(mottle("#f8ebc4", "#d7b77a", { size: 0.06 }));
const PAGES = cel("#fff3da", "#e2c99c");
const WAX = cel("#fff4e0", "#dcb896");
const RED = cel("#c2263a", "#6e1020");
const CREST = cel("#2d2262", "#1a1240");
const POT = cel(stripes("#2f6fc4", "#ffd768", { size: 0.045, axis: "y", width: 0.25 }));
const COVERS = ["#b3263f", "#2c4a9c", "#1f8a6a", "#7a3fb0", "#d9a22a", "#2a7d9c", "#8c2f4a", "#3d5a2a"];
const COVER_PAINTS = COVERS.map((c) => cel(c));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** Points of a star, first tip straight up. */
const starPts = (cx: number, cy: number, R: number, r: number, n: number) => {
  const out: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const q = i % 2 ? r : R;
    out.push(`${(cx + q * Math.cos(a)).toFixed(2)},${(cy + q * Math.sin(a)).toFixed(2)}`);
  }
  return out.join(" ");
};

/** "x y" on a circle, angle in radians (y down). */
const polar = (cx: number, cy: number, radius: number, angle: number) =>
  `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;

const EMBLEM_STAR = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${starPts(50, 52, 40, 17, 5)}" fill="#ffd768" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="50" cy="52" r="7" fill="#fff6cf"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM_EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 50 Q50 -8 92 50 Q50 108 8 50Z" fill="#fff6e6" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="20" fill="#3fd6e8" stroke="${INK}" stroke-width="4"/>
    <circle cx="50" cy="50" r="9" fill="${INK}"/>
    <circle cx="57" cy="42" r="4.5" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return `<path d="M${polar(50, 50, 34, a)} L${polar(50, 50, 44, a)}" stroke="#ffd768" stroke-width="6" stroke-linecap="round"/>`;
}).join("");

const EMBLEM_SUN = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${SUN_RAYS}
    <circle cx="50" cy="50" r="28" fill="#ff7ad9" stroke="${INK}" stroke-width="5"/>
    <circle cx="42" cy="42" r="6" fill="#ffd1f0"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM_RUNE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,8 90,50 50,92 10,50" fill="#8fe8ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 24 V76 M50 40 L36 30 M50 58 L66 68 M50 68 L36 78" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 128 },
);

const EMBLEMS: Texture[] = [EMBLEM_STAR, EMBLEM_EYE, EMBLEM_SUN, EMBLEM_RUNE];

const FRIEZE_DIAMONDS = Array.from({ length: 10 }, (_, i) => {
  const x = 10 + 20 * i;
  return `<polygon points="${x},1 ${x + 8},8 ${x},15 ${x - 8},8" fill="#ffd768" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>
    <circle cx="${x}" cy="8" r="2.2" fill="#7fe8ff"/>`;
}).join("");

/** The band under the cornice: gold diamonds on a line. */
const FRIEZE = svg(
  `<svg viewBox="0 0 200 16" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="7.2" width="200" height="1.6" fill="#ffd768"/>
    ${FRIEZE_DIAMONDS}
  </svg>`,
  { size: 512 },
);

const CREST_TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return `<circle cx="${(55 + 36 * Math.cos(a)).toFixed(1)}" cy="${(45 + 36 * Math.sin(a)).toFixed(1)}" r="2.4" fill="#ff7ad9"/>`;
}).join("");

/** The sigil in the crest: a star in a gilt ring on indigo. It glows. */
const CREST_SIGIL = svg(
  `<svg viewBox="0 0 110 90" xmlns="http://www.w3.org/2000/svg">
    <circle cx="55" cy="45" r="40" fill="#2d2262" stroke="#ffd768" stroke-width="4"/>
    <circle cx="55" cy="45" r="31" fill="none" stroke="#7fe8ff" stroke-width="2" stroke-dasharray="3 3"/>
    ${CREST_TICKS}
    <polygon points="${starPts(55, 45, 21, 9, 6)}" fill="#ffd768" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="55" cy="45" r="4" fill="#ff7ad9"/>
  </svg>`,
  { size: 512 },
);

/** A red wax seal for a scroll. */
const SEAL = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="26" fill="#c2263a" stroke="#5a0a14" stroke-width="3"/>
    <circle cx="30" cy="30" r="19" fill="none" stroke="#ffd768" stroke-width="2"/>
    <polygon points="${starPts(30, 31, 11, 5, 5)}" fill="#ffd768"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Profiles for the turned parts

const POT_PROFILE: [number, number][] = [
  [0, 0],
  [0.052, 0],
  [0.07, 0.05],
  [0.05, 0.12],
  [0.06, 0.16],
  [0.042, 0.175],
  [0, 0.175],
];
const ORB_STAND: [number, number][] = [
  [0, 0],
  [0.042, 0],
  [0.042, 0.012],
  [0.016, 0.024],
  [0.01, 0.04],
  [0.022, 0.056],
  [0, 0.062],
];
const CANDLE_HOLDER: [number, number][] = [
  [0, 0],
  [0.038, 0],
  [0.04, 0.012],
  [0.014, 0.022],
  [0.012, 0.05],
  [0.024, 0.062],
  [0, 0.062],
];
const FLAME: [number, number][] = [
  [0, 0],
  [0.0085, 0],
  [0.0115, 0.016],
  [0.0065, 0.032],
  [0, 0.046],
];

/** An arch: a flat foot of width 2·hw, then a half circle of radius hw springing at `spring`. */
const archOutline = (hw: number, spring: number): [number, number][] => {
  const pts: [number, number][] = [
    [-hw, 0],
    [hw, 0],
  ];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI;
    pts.push([hw * Math.cos(a), spring + hw * Math.sin(a)]);
  }
  return pts;
};

// ---------------------------------------------------------------------------------------------------------------
// The bays, bottom to top. Each slot takes its width in meters; the widths of a bay sum to INNER_W.

type Slot = {
  kind: "books" | "flat" | "pot" | "lying" | "candle" | "orb";
  width: number;
  color?: string;
};
const BAYS: { floor: number; slots: Slot[] }[] = [
  {
    floor: 0.13,
    slots: [
      { kind: "books", width: 0.42 },
      { kind: "flat", width: 0.26 },
      { kind: "pot", width: 0.16 },
      { kind: "books", width: 0.2 },
    ],
  },
  {
    floor: 0.47,
    slots: [
      { kind: "books", width: 0.3 },
      { kind: "candle", width: 0.1 },
      { kind: "books", width: 0.2 },
      { kind: "orb", width: 0.1, color: "#8fe8ff" },
      { kind: "books", width: 0.34 },
    ],
  },
  {
    floor: 0.81,
    slots: [
      { kind: "books", width: 0.22 },
      { kind: "lying", width: 0.3 },
      { kind: "books", width: 0.34 },
      { kind: "orb", width: 0.1, color: "#ff9ae0" },
      { kind: "books", width: 0.08 },
    ],
  },
  {
    floor: 1.15,
    slots: [
      { kind: "books", width: 0.5 },
      { kind: "candle", width: 0.1 },
      { kind: "books", width: 0.44 },
    ],
  },
  {
    floor: 1.49,
    slots: [
      { kind: "books", width: 0.16 },
      { kind: "orb", width: 0.1, color: "#a8ff9a" },
      { kind: "books", width: 0.2 },
      { kind: "flat", width: 0.3 },
      { kind: "books", width: 0.28 },
    ],
  },
];

type Extra = { dir?: V3; axis?: "x" | "y" | "z"; texture?: Texture; rotation?: V3 };

export default function build() {
  const b = createBuilder({ name: "wizard-bookshelf" });
  const r = rng(21);
  const root = b.joint("shelf", { at: [0, 0, 0] });

  // Every piece goes on the root joint, sharing its material by colour.
  const part = (geo: BufferGeometry, color: Fill, at: V3, extra: Extra = {}) =>
    b.part(geo, color, { bone: root, at, ...extra });
  const box = (w: number, h: number, d: number, color: Fill, at: V3) =>
    part(new THREE.BoxGeometry(w, h, d), color, at);

  // -------------------------------------------------------------------------------------------------------------
  // Carcass

  box(W - 0.04, 0.1, D - 0.04, PLINTH, [0, 0.05, 0]);
  box(W - 0.04, 0.012, 0.006, GOLD, [0, 0.094, 0.163]);

  for (const s of [1, -1]) {
    box(T, TOP - 0.1, D, WOOD_UPRIGHT, [s * (W / 2 - T / 2), (0.1 + TOP) / 2, 0]);
    // A gold pinstripe down the front edge of each side.
    box(0.012, 1.5, 0.006, GOLD, [s * (W / 2 - T / 2), 0.97, 0.183]);
  }

  box(W - 2 * T, TOP - 0.1, 0.012, WOOD_BACK, [0, (0.1 + TOP) / 2, -D / 2 + 0.006]);

  for (const y of BOARD_Y) {
    box(INNER_W, BOARD, D - 0.02, WOOD_SHELF, [0, y + BOARD / 2, -0.01]);
    box(INNER_W, BOARD, 0.006, GOLD, [0, y + BOARD / 2, 0.163]);
  }

  // The cornice, its gold trim, and a row of gold dentils under it.
  box(W + 0.04, CORNICE - TOP, D + 0.03, INDIGO, [0, (TOP + CORNICE) / 2, 0]);
  box(W + 0.05, 0.008, D + 0.03, GOLD, [0, CORNICE + 0.004, 0]);
  for (let i = 0; i < 11; i++) box(0.028, 0.02, 0.02, GOLD, [-0.5 + i * 0.1, 1.82, 0.19]);
  part(new THREE.PlaneGeometry(0.8, 0.064), "#ffffff", [0, 1.855, 0.1975], {
    dir: [0, 0, 1],
    axis: "z",
    texture: FRIEZE,
  });

  // The crest: a dark arch, a gilt rim behind it, a glowing sigil, and a pink finial.
  b.extrude(archOutline(0.28, 0.12), {
    at: [0, CORNICE, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.048,
    bevel: 0.006,
    color: GOLD,
    bone: root,
  });
  b.extrude(archOutline(0.25, 0.12), {
    at: [0, CORNICE, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0.008,
    color: CREST,
    bone: root,
  });
  glow(part(new THREE.PlaneGeometry(0.44, 0.36), "#ffffff", [0, 2.065, 0.034], {
    dir: [0, 0, 1],
    axis: "z",
    texture: CREST_SIGIL,
  }), 1.3);
  part(new THREE.CylinderGeometry(0.026, 0.03, 0.03, 10), BRASS, [0, CORNICE + 0.415, 0]);
  glow(part(new THREE.SphereGeometry(0.03, 14, 10), "#ff9ae0", [0, CORNICE + 0.46, 0]), 1.2);

  // -------------------------------------------------------------------------------------------------------------
  // Contents

  /** A standing book: its spine faces the room, with two gilt bands and maybe an emblem. */
  const standingBook = (cx: number, floor: number, t: number, h: number, pick: number) => {
    box(t, h, BOOK_D, COVER_PAINTS[pick], [cx, floor + h / 2, BOOK_Z]);
    for (const f of [0.08, 0.92]) box(t * 1.04, 0.008, 0.006, GOLD, [cx, floor + h * f, BOOK_FRONT + 0.001]);
    const emblem = Math.floor(r() * 5);
    if (emblem < 4)
      part(new THREE.PlaneGeometry(t * 0.8, t * 0.8), "#ffffff", [cx, floor + h * 0.55, BOOK_FRONT + 0.0045], {
        dir: [0, 0, 1],
        axis: "z",
        texture: EMBLEMS[emblem],
      });
  };

  /** A run of standing books that fills x0..x0+width exactly. */
  const books = (x0: number, width: number, floor: number) => {
    const ts: number[] = [];
    let sum = 0;
    for (;;) {
      const t = 0.026 + r() * 0.02;
      if (sum + t > width) break;
      ts.push(t);
      sum += t;
    }
    const k = sum > 0 ? width / sum : 1;
    let x = x0;
    for (const t0 of ts) {
      const t = t0 * k;
      standingBook(x + t / 2, floor, t, 0.19 + r() * 0.08, Math.floor(r() * COVERS.length));
      x += t;
    }
  };

  /** A flat tome with a cream page block showing on its front edge. */
  const flatBook = (cx: number, floor: number, cz: number, w: number, t: number, d: number, pick: number) => {
    box(w, t, d, COVER_PAINTS[pick], [cx, floor + t / 2, cz]);
    box(w * 0.94, t * 0.55, d * 0.99, PAGES, [cx, floor + t / 2, cz + 0.004]);
  };

  /** Two tomes, one on the other. */
  const flatStack = (x0: number, width: number, floor: number) => {
    const cx = x0 + width / 2;
    const a = Math.floor(r() * COVERS.length);
    flatBook(cx, floor, -0.02, width * 0.92, 0.032, 0.26, a);
    flatBook(cx + 0.008, floor + 0.032, -0.03, width * 0.86, 0.042, 0.24, (a + 3) % COVERS.length);
  };

  /** A rolled scroll lying along x, with gold caps; optionally tied with red ribbon and sealed. */
  const scroll = (cx: number, y: number, cz: number, len: number, tied: boolean) => {
    part(new THREE.CylinderGeometry(0.024, 0.024, len, 12), PARCH, [cx, y, cz], { dir: [1, 0, 0] });
    for (const s of [-1, 1])
      part(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 12), GOLD, [cx + s * (len / 2 - 0.004), y, cz], {
        dir: [1, 0, 0],
      });
    if (tied) {
      box(0.012, 0.054, 0.054, RED, [cx, y, cz]);
      part(new THREE.PlaneGeometry(0.03, 0.03), "#ffffff", [cx + len * 0.28, y, cz + 0.0245], {
        dir: [0, 0, 1],
        axis: "z",
        texture: SEAL,
      });
    }
  };

  /** Two scrolls lying on the bay floor, one tied and sealed. */
  const lying = (cx: number, floor: number) => {
    scroll(cx, floor + 0.024, -0.06, 0.26, true);
    scroll(cx + 0.02, floor + 0.024, 0.04, 0.22, false);
  };

  /** A blue-and-gold pot with three scrolls standing in it. */
  const pot = (cx: number, floor: number) => {
    b.lathe(POT_PROFILE, { at: [cx, floor, 0], color: POT, bone: root, smoothing: 1, segments: 14 });
    [0.22, 0.25, 0.2].forEach((len, i) => {
      const a = 0.4 + i * 2.094;
      const px = cx + 0.02 * Math.cos(a);
      const pz = 0.02 * Math.sin(a);
      const top = floor + 0.04 + len;
      part(new THREE.CylinderGeometry(0.016, 0.016, len, 10), PARCH, [px, floor + 0.04 + len / 2, pz]);
      part(new THREE.CylinderGeometry(0.019, 0.019, 0.012, 10), i === 1 ? RED : GOLD, [px, top - 0.006, pz]);
    });
  };

  /** A brass cup holding a candle, with drips, a wick and a glowing flame. */
  const candle = (cx: number, floor: number, h: number) => {
    const top = floor + 0.062 + h;
    b.lathe(CANDLE_HOLDER, { at: [cx, floor, 0], color: BRASS, bone: root, smoothing: 1, segments: 12 });
    part(new THREE.CylinderGeometry(0.014, 0.016, h, 10), WAX, [cx, floor + 0.062 + h / 2, 0]);
    for (const a of [0.3, 2.4])
      part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.04, 6), WAX, [
        cx + 0.0155 * Math.cos(a),
        top - 0.03,
        0.0155 * Math.sin(a),
      ]);
    part(new THREE.CylinderGeometry(0.0014, 0.0014, 0.014, 4), INK, [cx, top + 0.007, 0]);
    glow(b.lathe(FLAME, { at: [cx, top + 0.012, 0], color: "#ffc247", bone: root, smoothing: 1, segments: 8 }), 2.4);
  };

  /** A brass stand holding a glowing crystal orb, with a gilt ring at its equator. */
  const orb = (cx: number, floor: number, color: string) => {
    b.lathe(ORB_STAND, { at: [cx, floor, 0], color: BRASS, bone: root, smoothing: 1, segments: 12 });
    const cy = floor + 0.099;
    glow(part(new THREE.SphereGeometry(0.045, 16, 12), color, [cx, cy, 0]), 1.1);
    glow(part(new THREE.SphereGeometry(0.011, 6, 5), "#ffffff", [cx - 0.012, cy + 0.018, 0.034]), 2.5);
    part(new THREE.TorusGeometry(0.05, 0.0042, 6, 18), GOLD, [cx, cy, 0], { rotation: [90, 0, 0] });
  };

  for (const bay of BAYS) {
    let x = INNER_L;
    for (const s of bay.slots) {
      const cx = x + s.width / 2;
      if (s.kind === "books") books(x, s.width, bay.floor);
      else if (s.kind === "flat") flatStack(x, s.width, bay.floor);
      else if (s.kind === "pot") pot(cx, bay.floor);
      else if (s.kind === "lying") lying(cx, bay.floor);
      else if (s.kind === "candle") candle(cx, bay.floor, 0.13);
      else orb(cx, bay.floor, s.color ?? "#8fe8ff");
      x += s.width;
    }
  }

  // The top: a tome stack at the left, a candle and an orb at the right, clear of the crest.
  flatStack(-0.54, 0.24, CORNICE);
  candle(0.36, CORNICE, 0.13);
  orb(0.47, CORNICE, "#ffd27a");

  return b.root;
}
