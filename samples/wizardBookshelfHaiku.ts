import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Fill } from "../src/context";
import { rng } from "../src/math";
import { grain, paint } from "../src/paint";
import type { ColorInput, Paint } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";
import { cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arched wizard's bookcase with a cupboard base, gold-trimmed tomes, scrolls, glowing crystal orbs, potions " +
    "and candles, a candelabra and a painted rug, in a cel-shaded high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

type Vec3 = [number, number, number];
type PartOpts = NonNullable<Parameters<Builder["part"]>[2]>;

// Palette: every surface colour is a cel paint (lit tone and hue-shifted shadow). Glowing pieces are flat colours.
const WOOD = cel("#7d4b2e", "#4b2a4a");
const WOOD_DARK = cel("#4a2a2c", "#2a1838");
const WOOD_LIGHT = cel("#a86f3e", "#6e3f52");
const GOLD = cel("#ffd66e", "#d98f3c");
const GOLD_DEEP = cel("#e8a23f", "#a4502e");
const PAGE = cel("#fff0d2", "#eec59e");
const PARCH = cel("#f6e0b0", "#d4a06c");
const WAX = cel("#fff8e8", "#f0d0ac");
const INKWELL = cel("#3a4fb0", "#1f2a6e");
const GLASS = cel("#d8f0ff", "#8fb6d6");
const RUG = cel("#b5304c", "#6a1d4a");
const RUG_LIGHT = cel("#d9587a", "#8e2c5a");
const RUG_DARK = cel("#5a1a3e", "#2e1236");
const RIBBON = cel("#d23a52", "#7e1f4c");
const GEM = cel("#e0427a", "#8a2360");
const BOOK_COVERS = [
  cel("#c8344a", "#7a1f4a"), // crimson
  cel("#2fb8a8", "#1d6f86"), // teal
  cel("#3550b8", "#25307a"), // navy
  cel("#2fa15a", "#1e6a5a"), // emerald
  cel("#7c3aa6", "#44207a"), // plum
  cel("#e08a2c", "#a64d2c"), // ochre
  cel("#f08aa6", "#b04f83"), // rose
  cel("#8a6a3a", "#4d3154"), // leather
];

// Self-lit pieces (flat colours, see kits/glow).
const FLAME = "#ffb04a";
const FLAME_CORE = "#fff3b0";
const CYAN = "#7ff4ff";
const VIOLET = "#c9a2ff";
const EMERALD = "#8dffb4";
const WHITE = "#ffffff";

/** Spine of a tome at surface coordinate v: gold bands and a parchment label, else the cover. */
function spineAt(v: number, cover: Paint): ColorInput {
  if ((v > 0.12 && v < 0.18) || (v > 0.82 && v < 0.88)) return GOLD;
  if (v > 0.4 && v < 0.58) return PARCH;
  return cover;
}

// Upright tomes show the spine (+z) with bands, the page block on top and gold corners on the covers. Flat tomes
// show a gold-framed cover on top, the spine at +x and cream page edges.
const TOMES = BOOK_COVERS.map((cover) => ({
  up: paint((_p, n, s) => {
    if (n.y > 0.5) return PAGE;
    if (n.z > 0.5) return spineAt(s[1], cover);
    const e = Math.min(s[0], 1 - s[0], s[1], 1 - s[1]);
    return e < 0.07 ? GOLD_DEEP : cover;
  }),
  flat: paint((_p, n, s) => {
    if (n.y > 0.5) {
      const e = Math.min(s[0], 1 - s[0], s[1], 1 - s[1]);
      if (e < 0.06) return GOLD;
      if (Math.abs(s[0] - 0.5) + Math.abs(s[1] - 0.5) < 0.12) return GOLD_DEEP;
      return cover;
    }
    if (n.x > 0.5) return spineAt(s[0], cover);
    return PAGE;
  }),
}));

// Cupboard doors: a raised panel framed in gold.
const doorPaint = paint((_p, n, s) => {
  if (n.z < 0.5) return WOOD;
  const e = Math.min(s[0], 1 - s[0], s[1], 1 - s[1]);
  if (e < 0.05) return WOOD_DARK;
  if (e < 0.08) return GOLD_DEEP;
  if (e < 0.14) return WOOD;
  return WOOD_LIGHT;
});

const grainPaint = grain(WOOD_DARK, WOOD, { size: 0.03, axis: "y" });

// Rug: gold-edged crimson field with a diamond lattice.
const rugPaint = paint((p, n) => {
  if (n.y < 0.5) return RUG_DARK;
  const e = Math.min(1.05 - Math.abs(p.x), 0.45 - Math.abs(p.z - 0.5));
  if (e < 0.04) return GOLD_DEEP;
  if (e < 0.07) return RUG_DARK;
  if (e < 0.11) return GOLD;
  const d = zigzag((p.x + p.z) / 0.16) + zigzag((p.x - p.z) / 0.16);
  return d > 1.0 ? RUG_LIGHT : RUG;
});

const SIGIL_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<circle cx="32" cy="32" r="29" stroke="#ffd66e" stroke-width="2.4"/>
<circle cx="32" cy="32" r="22" stroke="#e7a33f" stroke-width="1.6"/>
<path d="M32 10 L51 43 L13 43 Z" stroke="#ffd66e" stroke-width="2"/>
<path d="M32 54 L13 21 L51 21 Z" stroke="#7ff4ff" stroke-width="1.4"/>
<path d="M32 3 V9 M32 55 V61 M3 32 H9 M55 32 H61" stroke="#ffd66e" stroke-width="2"/>
</g>
<circle cx="32" cy="32" r="4" fill="#fff3b0"/>
</svg>`;

const FILIGREE_SVG = `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="#ffd66e" stroke-width="3.2" stroke-linecap="round">
<path d="M12 94 C6 40 56 22 72 56 C84 84 50 96 46 70"/>
<path d="M30 86 C32 58 52 50 62 62"/>
<path d="M18 60 C24 40 40 34 46 40"/>
<path d="M64 20 Q76 8 88 18 Q76 30 64 20 Z"/>
</g>
<g fill="#ffd66e">
<circle cx="78" cy="36" r="4"/>
<circle cx="48" cy="50" r="2.5"/>
</g>
<g transform="translate(200 0) scale(-1 1)" fill="none" stroke="#ffd66e" stroke-width="3.2" stroke-linecap="round">
<path d="M12 94 C6 40 56 22 72 56 C84 84 50 96 46 70"/>
<path d="M30 86 C32 58 52 50 62 62"/>
<path d="M18 60 C24 40 40 34 46 40"/>
<path d="M64 20 Q76 8 88 18 Q76 30 64 20 Z"/>
</g>
<g transform="translate(200 0) scale(-1 1)" fill="#ffd66e">
<circle cx="78" cy="36" r="4"/>
<circle cx="48" cy="50" r="2.5"/>
</g>
</svg>`;

/** The crescent moon for the crown medallion, as an outline centred on its origin. */
function crescentOutline(): number[][] {
  const R = 0.065;
  const c = 0.03;
  const ri = 0.055;
  const ix = (R * R - ri * ri + c * c) / (2 * c);
  const iy = Math.sqrt(R * R - ix * ix);
  const aOut = Math.atan2(iy, ix);
  const pts: number[][] = [];
  for (let i = 0; i <= 14; i++) {
    const a = aOut + ((2 * Math.PI - 2 * aOut) * i) / 14;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  const phiB = Math.atan2(-iy, ix - c);
  const phiA = Math.atan2(iy, ix - c);
  for (let i = 1; i <= 13; i++) {
    const phi = phiB + ((phiA - 2 * Math.PI - phiB) * i) / 14;
    pts.push([c + ri * Math.cos(phi), ri * Math.sin(phi)]);
  }
  return pts;
}

const WOOD_ARCH = [
  [-0.74, 2.08, "sharp"],
  [0.74, 2.08, "sharp"],
  [0.74, 2.32],
  [0.36, 2.48],
  [0, 2.56, "sharp"],
  [-0.36, 2.48],
  [-0.74, 2.32],
];
const GOLD_ARCH = [
  [-0.77, 2.08, "sharp"],
  [0.77, 2.08, "sharp"],
  [0.77, 2.33],
  [0.39, 2.5],
  [0, 2.6, "sharp"],
  [-0.39, 2.5],
  [-0.77, 2.33],
];

const BOARD_Y = [0.1, 0.58, 1.06, 1.54, 2.02];
const FLOOR = [0.12, 0.6, 1.08, 1.56];
const TOP = 2.1;
const FRONT_BOOK = 0.195;

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 2048 });
  const r = rng(1984);
  // Everything except the left door hangs on the root bone; the door pivots on its own hinge joint.
  const root = b.joint("root", { at: [0, 0, 0] });

  const SIGIL = svg(SIGIL_SVG, { size: 256 });
  const FILIGREE = svg(FILIGREE_SVG, { size: 512 });

  const box = (w: number, h: number, d: number, at: Vec3, color: Fill, extra: PartOpts = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at, ...extra });
  const ball = (rad: number, at: Vec3, color: Fill, seg = 14) =>
    b.part(new THREE.SphereGeometry(rad, seg, Math.round(seg * 0.7)), color, { bone: root, at });

  // Tall tomes standing on y0 between x0 and x1, spines toward +z, with the odd bookmark ribbon.
  const tomeRow = (x0: number, x1: number, y0: number, maxH: number) => {
    let x = x0;
    for (;;) {
      const t = 0.03 + r() * 0.025;
      if (x + t > x1) break;
      const h = maxH * (0.7 + r() * 0.3);
      const d = 0.22 + r() * 0.04;
      const z = FRONT_BOOK - d / 2;
      const cover = TOMES[Math.floor(r() * TOMES.length)].up;
      box(t, h, d, [x + t / 2, y0 + h / 2, z], cover);
      if (r() < 0.22) box(0.008, 0.07, 0.006, [x + t / 2, y0 + h, z + d / 2 - 0.05], RIBBON);
      x += t + 0.004 + r() * 0.004;
      if (r() < 0.08) x += 0.035;
    }
  };

  // A pile of flat tomes from y0 at (x, z); returns the top of the pile.
  const flatStack = (x: number, y0: number, z: number, n: number, w: number) => {
    let y = y0;
    for (let i = 0; i < n; i++) {
      const t = 0.03 + r() * 0.012;
      const d = 0.2 + r() * 0.05;
      const ww = w * (0.85 + r() * 0.25);
      const cover = TOMES[Math.floor(r() * TOMES.length)].flat;
      box(ww, t, d, [x + (r() - 0.5) * 0.02, y + t / 2, z + (r() - 0.5) * 0.02], cover, {
        rotation: [0, (r() - 0.5) * 16, 0],
      });
      y += t;
    }
    return y;
  };

  // A rolled scroll lying along x or z, with a ribbon wrap and wooden dowel ends.
  const scroll = (x: number, y: number, z: number, len: number, rad: number, axis: "x" | "z", paper: Fill) => {
    const d: Vec3 = axis === "z" ? [0, 0, 1] : [1, 0, 0];
    b.part(new THREE.CylinderGeometry(rad, rad, len, 10), paper, { bone: root, at: [x, y, z], dir: d });
    b.part(new THREE.CylinderGeometry(rad * 1.12, rad * 1.12, 0.014, 10), RIBBON, {
      bone: root,
      at: [x, y, z],
      dir: d,
    });
    for (const s of [-1, 1]) {
      const k = s * (len / 2 + 0.008);
      b.part(new THREE.CylinderGeometry(rad * 0.3, rad * 0.3, 0.02, 8), WOOD_LIGHT, {
        bone: root,
        at: [x + d[0] * k, y, z + d[2] * k],
        dir: d,
      });
    }
  };

  // A brass candlestick with a wax candle and a two-layer flame; s scales the holder and flame.
  const candleStick = (x: number, y: number, z: number, s: number, waxH: number) => {
    b.lathe(
      [
        [0, 0],
        [0.04 * s, 0],
        [0.04 * s, 0.01 * s],
        [0.012 * s, 0.025 * s],
        [0.008 * s, 0.06 * s],
        [0.026 * s, 0.07 * s],
        [0.026 * s, 0.085 * s],
        [0, 0.085 * s],
      ],
      { bone: root, at: [x, y, z], color: GOLD_DEEP },
    );
    const top = y + 0.07 * s + waxH;
    b.part(new THREE.CylinderGeometry(0.011 * s, 0.011 * s, waxH, 10), WAX, {
      bone: root,
      at: [x, y + 0.07 * s + waxH / 2, z],
    });
    b.part(new THREE.BoxGeometry(0.003 * s, 0.012 * s, 0.003 * s), INK, {
      bone: root,
      at: [x, top + 0.004 * s, z],
    });
    glow(
      b.lathe(
        [
          [0, 0],
          [0.012 * s, 0],
          [0.013 * s, 0.02 * s],
          [0.009 * s, 0.045 * s],
          [0.003 * s, 0.068 * s],
          [0, 0.078 * s],
        ],
        { bone: root, at: [x, top, z], color: FLAME, smoothing: 1 },
      ),
      1.6,
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [0.005 * s, 0],
          [0.006 * s, 0.018 * s],
          [0, 0.034 * s],
        ],
        { bone: root, at: [x, top + 0.002 * s, z], color: FLAME_CORE, smoothing: 1 },
      ),
      2,
    );
  };

  // A glowing crystal orb in a gold cup on a stem, with a cradle ring and a glint.
  const orb = (x: number, y: number, z: number, rad: number, colour: string) => {
    b.lathe(
      [
        [0, 0],
        [0.8 * rad, 0],
        [0.8 * rad, 0.12 * rad],
        [0.3 * rad, 0.28 * rad],
        [0.22 * rad, 0.5 * rad],
        [0.55 * rad, 0.62 * rad],
        [0.6 * rad, 0.8 * rad],
        [0, 0.8 * rad],
      ],
      { bone: root, at: [x, y, z], color: GOLD_DEEP },
    );
    const cy = y + 1.5 * rad;
    glow(b.part(new THREE.SphereGeometry(rad, 14, 10), colour, { bone: root, at: [x, cy, z] }), 1);
    b.part(new THREE.TorusGeometry(0.86 * rad, 0.06 * rad, 6, 24), GOLD, {
      bone: root,
      at: [x, y + 1.0 * rad, z],
      rotation: [90, 0, 0],
    });
    glow(
      b.part(new THREE.SphereGeometry(0.16 * rad, 8, 6), WHITE, {
        bone: root,
        at: [x - 0.36 * rad, cy + 0.4 * rad, z + 0.84 * rad],
      }),
      1,
    );
  };

  // A glowing potion flask with a cork: the liquid is a flat emerald or violet glow.
  const potion = (x: number, y: number, z: number, colour: string) => {
    glow(
      b.lathe(
        [
          [0, 0],
          [0.034, 0],
          [0.04, 0.03],
          [0.036, 0.07],
          [0.012, 0.1],
          [0.012, 0.125],
          [0, 0.125],
        ],
        { bone: root, at: [x, y, z], color: colour, smoothing: 1 },
      ),
      0.8,
    );
    box(0.02, 0.022, 0.02, [x, y + 0.136, z], WOOD_LIGHT);
  };

  // A three-branch candelabra standing on y; k scales every length.
  const candelabra = (x: number, y: number, z: number, k: number) => {
    b.lathe(
      [
        [0, 0],
        [0.12 * k, 0],
        [0.12 * k, 0.03 * k],
        [0.05 * k, 0.07 * k],
        [0.02 * k, 0.14 * k],
        [0, 0.14 * k],
      ],
      { bone: root, at: [x, y, z], color: GOLD },
    );
    b.rod([x, y + 0.12 * k, z], [x, y + 0.72 * k, z], 0.016 * k, { bone: root, color: GOLD });
    ball(0.03 * k, [x, y + 0.36 * k, z], GEM, 10);
    candleStick(x, y + 0.72 * k, z, 0.9 * k, 0.16 * k);
    for (const sg of [-1, 1]) {
      const tip: Vec3 = [x + sg * 0.16 * k, y + 0.88 * k, z];
      b.sweep(
        catmull([
          [x, y + 0.6 * k, z],
          [x + sg * 0.09 * k, y + 0.74 * k, z],
          tip,
        ]),
        0.012 * k,
        { bone: root, color: GOLD },
      );
      candleStick(tip[0], tip[1], tip[2], 0.85 * k, 0.14 * k);
    }
  };

  // Carcass: plinth, sides with rivets, back with a sigil, shelf boards and cornice.
  box(1.62, 0.08, 0.46, [0, 0.04, 0.02], WOOD_DARK);
  box(1.62, 0.012, 0.012, [0, 0.074, 0.252], GOLD_DEEP);
  for (const s of [-1, 1]) {
    box(0.04, 2.02, 0.42, [s * 0.78, 1.09, 0], WOOD);
    box(0.012, 2.02, 0.012, [s * 0.78, 1.09, 0.216], GOLD_DEEP);
    for (const y of [0.34, 0.82, 1.3, 1.78]) ball(0.011, [s * 0.78, y, 0.218], GOLD, 8);
  }
  box(1.52, 2.02, 0.02, [0, 1.09, -0.2], grainPaint);
  for (const y of [0.34, 0.82, 1.3, 1.78]) box(1.5, 0.05, 0.03, [0, y, -0.225], WOOD_LIGHT);
  b.part(new THREE.PlaneGeometry(0.7, 0.7), WHITE, { bone: root, at: [0, 1.42, -0.188], texture: SIGIL });
  for (const y of BOARD_Y) {
    box(1.52, 0.04, 0.42, [0, y, 0], WOOD);
    box(1.52, 0.04, 0.012, [0, y, 0.216], GOLD_DEEP);
  }
  box(1.66, 0.06, 0.46, [0, 2.07, 0], WOOD_LIGHT);
  box(1.66, 0.014, 0.014, [0, 2.04, 0.233], GOLD);

  // Cupboard doors: the left door hangs on a hinge joint and swings open.
  const hingeL = b.joint("doorL", { parent: root, at: [-0.74, 0.34, 0.202], dir: [0, 1, 0], role: "hinge" });
  box(0.74, 0.44, 0.024, [-0.37, 0.34, 0.202], doorPaint, { bone: hingeL });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), WHITE, { bone: hingeL, at: [-0.37, 0.34, 0.2165], texture: SIGIL });
  b.part(new THREE.SphereGeometry(0.014, 10, 7), GOLD, { bone: hingeL, at: [-0.04, 0.34, 0.228] });
  b.pose(hingeL, { axis: [0, 1, 0], deg: -28 });
  box(0.74, 0.44, 0.024, [0.37, 0.34, 0.202], doorPaint);
  b.part(new THREE.PlaneGeometry(0.2, 0.2), WHITE, { bone: root, at: [0.37, 0.34, 0.2165], texture: SIGIL });
  ball(0.014, [0.04, 0.34, 0.228], GOLD, 10);
  box(0.022, 0.08, 0.026, [-0.74, 0.2, 0.202], GOLD_DEEP);
  box(0.022, 0.08, 0.026, [-0.74, 0.48, 0.202], GOLD_DEEP);

  // Cupboard interior, seen through the open door.
  for (let i = 0; i < 4; i++) scroll(-0.6 + i * 0.055, FLOOR[0] + 0.028, 0, 0.26, 0.028, "z", i % 2 ? PARCH : PAGE);
  for (let i = 0; i < 2; i++) scroll(-0.57 + i * 0.12, FLOOR[0] + 0.078, -0.02, 0.24, 0.026, "z", PARCH);
  flatStack(-0.2, FLOOR[0], 0, 4, 0.22);

  // Shelf 1: a row of tomes, a flat stack with a scroll, a cyan orb and a candle.
  tomeRow(-0.735, -0.13, FLOOR[1], 0.36);
  const top1 = flatStack(0.1, FLOOR[1], 0.04, 4, 0.2);
  scroll(0.1, top1 + 0.02, 0.04, 0.2, 0.02, "x", PARCH);
  orb(0.44, FLOOR[1], 0.06, 0.065, CYAN);
  candleStick(0.66, FLOOR[1], 0.05, 1, 0.12);

  // Shelf 2: a divider, a rack of scrolls on the left, tomes, two potions and two candles on the right.
  box(0.024, 0.44, 0.4, [0, FLOOR[2] + 0.22, 0], WOOD_DARK);
  for (let i = 0; i < 8; i++)
    scroll(-0.68 + i * 0.06, FLOOR[2] + 0.028, 0, 0.3, 0.024 + r() * 0.006, "z", i % 3 === 0 ? PAGE : PARCH);
  for (let i = 0; i < 4; i++) scroll(-0.65 + i * 0.11, FLOOR[2] + 0.082, -0.02, 0.28, 0.025, "z", PAGE);
  tomeRow(0.03, 0.34, FLOOR[2], 0.38);
  potion(0.4, FLOOR[2], 0.03, EMERALD);
  potion(0.48, FLOOR[2], -0.05, VIOLET);
  candleStick(0.6, FLOOR[2], 0.05, 0.9, 0.1);
  candleStick(0.7, FLOOR[2], -0.05, 0.9, 0.14);

  // Shelf 3: a row of tall tomes, a candle trio on a gold plate, an inkwell with a quill, an emerald orb.
  tomeRow(-0.735, -0.24, FLOOR[3], 0.4);
  box(0.22, 0.012, 0.13, [-0.13, FLOOR[3] + 0.006, 0.02], GOLD_DEEP);
  candleStick(-0.19, FLOOR[3] + 0.012, 0, 0.8, 0.1);
  candleStick(-0.13, FLOOR[3] + 0.012, 0.04, 0.9, 0.14);
  candleStick(-0.07, FLOOR[3] + 0.012, -0.02, 0.7, 0.09);
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.03],
      [0.026, 0.05],
      [0.012, 0.06],
      [0.013, 0.072],
      [0, 0.072],
    ],
    { bone: root, at: [0.02, FLOOR[3], 0.06], color: INKWELL, smoothing: 1 },
  );
  b.spike([0.02, FLOOR[3] + 0.07, 0.06], [0.22, 1, 0.08], 0.2, 0.005, { bone: root, color: PAGE });
  flatStack(0.27, FLOOR[3], -0.02, 3, 0.2);
  orb(0.5, FLOOR[3], 0.04, 0.07, EMERALD);
  tomeRow(0.6, 0.735, FLOOR[3], 0.36);

  // Crown: a recessed gold-backed arch rising from the cornice, with filigree, a medallion and crescent, a finial and pinnacles.
  b.extrude(GOLD_ARCH, {
    bone: root,
    at: [0, 0, -0.135],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.005,
    smoothing: 2,
    color: GOLD_DEEP,
  });
  b.extrude(WOOD_ARCH, {
    bone: root,
    at: [0, 0, -0.1],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.04,
    bevel: 0.006,
    smoothing: 2,
    color: WOOD_LIGHT,
  });
  b.part(new THREE.PlaneGeometry(0.84, 0.36), WHITE, { bone: root, at: [0, 2.36, -0.076], texture: FILIGREE });
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.09, 0.008],
      [0.085, 0.016],
      [0, 0.02],
    ],
    { bone: root, at: [0, 2.32, -0.08], axis: [0, 0, 1], color: GOLD, smoothing: 1 },
  );
  b.extrude(crescentOutline(), {
    bone: root,
    at: [0, 2.32, -0.054],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: GOLD,
  });
  ball(0.03, [0, 2.6, -0.12], GOLD, 10);
  glow(b.part(new THREE.SphereGeometry(0.02, 10, 7), CYAN, { bone: root, at: [0, 2.65, -0.12] }), 1);
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.035, 0.22, 8), GOLD, { bone: root, at: [s * 0.78, TOP + 0.11, 0.1] });
    glow(
      b.part(new THREE.SphereGeometry(0.02, 10, 7), VIOLET, { bone: root, at: [s * 0.78, TOP + 0.23, 0.1] }),
      1,
    );
  }

  // Top of the case: a flat stack with a scroll, a violet orb, a gold hourglass and a small candelabra.
  const top2 = flatStack(-0.6, TOP, 0.06, 4, 0.26);
  scroll(-0.6, top2 + 0.022, 0.06, 0.24, 0.022, "x", PAGE);
  orb(-0.2, TOP, 0.05, 0.12, VIOLET);
  const hgX = 0.12;
  const hgZ = 0.06;
  for (const y of [TOP + 0.01, TOP + 0.33]) box(0.16, 0.02, 0.16, [hgX, y, hgZ], GOLD_DEEP);
  for (const [dx, dz] of [
    [-0.07, -0.07],
    [0.07, -0.07],
    [-0.07, 0.07],
    [0.07, 0.07],
  ]) {
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.31, 6), GOLD_DEEP, {
      bone: root,
      at: [hgX + dx, TOP + 0.18, hgZ + dz],
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.06, 0.02],
      [0.018, 0.16],
      [0.06, 0.3],
      [0.06, 0.32],
      [0, 0.32],
    ],
    { bone: root, at: [hgX, TOP + 0.02, hgZ], color: GLASS, smoothing: 1 },
  );
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.016, 0.12],
      [0, 0.12],
    ],
    { bone: root, at: [hgX, TOP + 0.02, hgZ], color: GOLD, smoothing: 1 },
  );
  candelabra(0.42, TOP, 0.04, 0.42);

  // Floor on the rug: a tall candelabra, a flat stack with a scroll, an open book, a lone scroll and a candle.
  box(2.1, 0.012, 0.9, [0, 0.006, 0.5], rugPaint);
  candelabra(-0.92, 0, 0.62, 1);
  const top3 = flatStack(0.55, 0, 0.55, 5, 0.24);
  scroll(0.55, top3 + 0.026, 0.55, 0.26, 0.026, "x", PARCH);
  box(0.15, 0.014, 0.2, [0.125, 0.019, 0.8], PAGE, { rotation: [0, 0, 1.5] });
  box(0.15, 0.014, 0.2, [0.275, 0.019, 0.8], PAGE, { rotation: [0, 0, -1.5] });
  box(0.024, 0.02, 0.21, [0.2, 0.022, 0.8], WOOD_DARK);
  scroll(0.86, 0.028, 0.35, 0.3, 0.028, "x", PARCH);
  candleStick(0.84, 0, 0.72, 1.2, 0.2);

  return b.root;
}
