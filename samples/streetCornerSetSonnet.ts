import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame, Spot } from "../src/frame";
import { DEG, rng } from "../src/math";
import { bezier, catmull, spiral } from "../src/path";
import { grain, paint, stripes } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Windwheel Street Corner",
  description:
    "A storybook street corner: tall gold-and-navy lamp post with a glowing lantern, a red arched mailbox with a flag, a wooden bench with a napping cat, and flower boxes, tubs and hanging baskets, set against a half-timbered teahouse corner with teal roof, shutters and bunting.",
  style: "whimsical Genshin mix",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface is a two-tone cel paint; tiny details too, so the whole set shades the same way.
const K = (lit: Col, shadow?: Col) => cel(lit, shadow);
const GOLD = K("#f6c94e", "#c9852a");
const GOLD_PALE = K("#ffe8a0", "#e2b45a");
const NAVY = K("#3b4a6b", "#273252");
const NAVY_DEEP = K("#2a3550", "#1b2238");
const CREAM = K("#fbf0d6", "#e3cfaa");
const STONE = K("#d9d1bd", "#a9a3a6");
const STONE_DK = K("#b9b3a4", "#8a869a");
const TEAL = K("#33b5b1", "#217f9a");
const TEAL_DK = K("#238f9b", "#1b5f7e");
const TEAL_LT = K("#5fd3c2", "#3a9fb4");
const RED = K("#ec5a4f", "#b2314a");
const RED_DK = K("#c43f46", "#8a2442");
const TERRA = K("#e5875a", "#b85a58");
const SOIL = K("#5b3b2e", "#3a2530");
const WOOD_DK = K("#8a5a3c", "#5e3a3f");
const GREEN = K("#6cc24a", "#37935a");
const GREEN_DK = K("#3f9a3c", "#26705a");
const ORANGE_CAT = K("#f2a24a", "#c76a45");
const CAT_WHITE = K("#fff6e6", "#d7c3bd");
const BIRD_Y = K("#ffd84a", "#e39a3a");
const WHITE = K("#ffffff", "#cfd6ec");
const INKC = K("#2b1d3a", "#1a1226");
const PAPER = K("#fffaf0", "#e8dcc8");
const BOOK = K("#4f86d8", "#3a559e");
const GLASS = "#ffd98a";

const hash = (a: number, c: number) => {
  const s = Math.sin(a * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const fract = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------------------------------------------------------
// Layout (meters). +Z faces the viewer, the teahouse wall stands at the back.
const SW = 0.14; // sidewalk top
const ST = 0.06; // street top
const WALL_Z = -1.4; // wall front face
const WALL_B = -2.3; // wall back face
const SIDE_X = 0.85; // right end wall face
const LX = -1.55;
const LZ = 0.3; // lamp post
const DX = -1.25; // door
const WX = -0.03; // window
const MX = 0.8;
const MZ = -0.5; // mailbox
const BX = -0.2;
const BZ = -1.08; // bench centre

// ---------------------------------------------------------------------------------------------------------------
// Surface paints (all cel-shaded): painted detail lives here rather than in geometry.
const FLAGS = [K("#ddd5c1"), K("#d1c9b4"), K("#e4ddcb"), K("#c8c0ab")];
const MORTAR = K("#9d9a8f", "#77768a");

const sidewalkPaint = K(
  paint((p, n) => {
    if (n.y < 0.5) return STONE_DK;
    const dl = Math.hypot(p.x - LX, p.z - LZ);
    if (dl < 0.46) {
      const a = Math.atan2(p.z - LZ, p.x - LX);
      const petal = 0.2 + 0.07 * Math.cos(a * 8);
      if (dl < 0.08) return GOLD;
      if (dl < petal) return Math.floor((a / (Math.PI * 2)) * 16 + 16) % 2 ? TEAL : TEAL_LT;
      if (dl > 0.34 && dl < 0.38) return GOLD;
      if (dl > 0.4 && dl < 0.43) return TEAL_DK;
      return CREAM;
    }
    if (p.z > 0.6 - 0.16 || p.x > 1.0 - 0.16) {
      // gutter band of narrow stones beside the curb
      const along = p.z > 0.6 - 0.16 ? p.x : p.z;
      const c = Math.floor(along / 0.16);
      if (fract(along / 0.16) < 0.08 || Math.abs(p.z - (0.6 - 0.16)) < 0.01) return MORTAR;
      return hash(c, 5) > 0.5 ? STONE : STONE_DK;
    }
    const row = Math.floor(p.z / 0.22);
    const xo = p.x + (row % 2) * 0.16;
    const col = Math.floor(xo / 0.32);
    if (fract(p.z / 0.22) < 0.07 || fract(xo / 0.32) < 0.05) return MORTAR;
    return FLAGS[Math.floor(hash(row, col) * 4)];
  }),
);

const COBBLES = [K("#8f95a9"), K("#9ba1b4"), K("#80879d"), K("#a5aabb"), K("#8a8fa3")];
const streetPaint = K(
  paint((p, n) => {
    if (n.y < 0.5) return STONE_DK;
    // zebra crossing bars across the front street
    if (p.z > 0.8 && p.z < 1.62 && p.x > -1.55 && p.x < -0.15) {
      const u = fract((p.x + 1.55) / 0.26);
      if (u < 0.5) return K(paint((q) => (hash(Math.floor(q.x * 40), Math.floor(q.z * 40)) > 0.82 ? "#d7d1c0" : "#f6efdc")));
    }
    // cobbles: Worley-like, built from a jittered grid
    const s = 0.17;
    const gx = Math.floor(p.x / s);
    const gz = Math.floor(p.z / s);
    let d1 = 9;
    let d2 = 9;
    let id = 0;
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++) {
        const cx = gx + i;
        const cz = gz + j;
        const fx = (cx + 0.2 + 0.6 * hash(cx, cz)) * s;
        const fz = (cz + 0.2 + 0.6 * hash(cz, cx + 9)) * s;
        const d = Math.hypot(p.x - fx, p.z - fz);
        if (d < d1) {
          d2 = d1;
          d1 = d;
          id = hash(cx + 3, cz + 7);
        } else if (d < d2) d2 = d;
      }
    if (d2 - d1 < 0.022) return K("#5d6177");
    return COBBLES[Math.floor(id * 5)];
  }),
);

const plasterTone = (y: number) => (y > 2.36 ? "#f3e2c0" : "#fbf0d6");
const wallPaint = K(
  paint((p, n) => {
    const y = p.y;
    const side = Math.abs(n.x) > 0.5;
    const x = side ? -p.z : p.x;
    const posts = side ? [1.42, 2.28] : [-1.76, -0.815, 0.78];
    const TIMBER = "#7d4d36";
    // stone plinth
    if (y < 0.74) {
      const row = Math.floor((y - 0.1) / 0.13);
      const xo = x + (row % 2) * 0.11;
      const col = Math.floor(xo / 0.22);
      if (fract((y - 0.1) / 0.13) < 0.09 || fract(xo / 0.22) < 0.07) return "#8f8b9c";
      return hash(row, col) > 0.6 ? "#cdc6b5" : hash(row, col) > 0.3 ? "#d9d2bf" : "#bfb9ab";
    }
    if (y < 0.82) return TIMBER;
    if (y > 2.28 && y < 2.36) return TIMBER;
    if (y > 2.76 && !side) return TIMBER;
    for (const px of posts) if (Math.abs(x - px) < 0.045) return TIMBER;
    if (y > 2.36) {
      for (const px of posts) {
        const d = y - 2.36;
        if (d < 0.38 && (Math.abs(x - (px + d)) < 0.03 || Math.abs(x - (px - d)) < 0.03)) return TIMBER;
      }
      if (!side && Math.abs(fract((x + 0.2) / 0.42) - 0.5) < 0.03) return TIMBER;
    }
    if (y > 2.4 && y < 2.72) {
      const u = fract((x + 0.07) / 0.14) - 0.5;
      const dd = Math.abs(u) * 0.14 + Math.abs(y - 2.56);
      if (dd < 0.02) return "#f6c94e";
      if (dd < 0.04) return "#33b5b1";
    }
    // faint hand-painted plaster mottling
    const t = hash(Math.floor(x * 9), Math.floor(y * 9));
    return t > 0.88 ? "#f2e4c4" : plasterTone(y);
  }),
);

const roofPaint = K(
  paint((p, n) => {
    if (n.y < 0.2 && n.z > 0) return TEAL_DK;
    const row = Math.floor(p.y / 0.075);
    const u = fract((p.x + (row % 2) * 0.06) / 0.12);
    const v = fract(p.y / 0.075);
    const col = Math.floor((p.x + (row % 2) * 0.06) / 0.12);
    if (v < 0.2 + 0.18 * Math.abs(2 * u - 1) * 0.0 + 0.16 * (1 - (2 * u - 1) ** 2) * 0 && v < 0.16) return "#1d6c82";
    if (Math.abs(u - 0.5) > 0.47) return "#1d6c82";
    const h = hash(row, col);
    return h > 0.66 ? "#43c7bc" : h > 0.33 ? "#33b0b2" : "#2a9aa8";
  }),
);

const woodGrain = (a: string, c: string, size = 0.035, axis: "x" | "y" | "z" = "x") => K(grain(a, c, { size, axis, seed: 3 }));
const WOOD = woodGrain("#d99f62", "#c68650");
const WOOD_LT = woodGrain("#e6b274", "#d49a5c");
const WOOD_Y = woodGrain("#d99f62", "#c68650", 0.03, "y");
const WOOD_DKG = woodGrain("#8a5a3c", "#774b33", 0.03, "x");

const brickPaint = K(
  paint((p) => {
    const row = Math.floor(p.y / 0.07);
    const xo = p.x + p.z + (row % 2) * 0.09;
    if (fract(p.y / 0.07) < 0.12 || fract(xo / 0.18) < 0.08) return "#a8908a";
    return hash(row, Math.floor(xo / 0.18)) > 0.5 ? "#d8836a" : "#c9705e";
  }),
);

const doorPaint = K(
  paint((p) => {
    const u = p.x - (DX - 0.32);
    const v = p.y - SW;
    if (v > 0.26 && v < 0.34) return NAVY;
    if (v > 0.92 && v < 1.0) return NAVY;
    if (fract(u / 0.1067) < 0.045) return "#5e3a3f";
    const g = hash(Math.floor(u / 0.1067), Math.floor(v * 7));
    return g > 0.55 ? "#a76642" : "#9a5a3a";
  }),
);

const louver = (cx: number, cy: number) =>
  K(
    paint((p) => {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < 0.055) return GOLD;
      if (d < 0.07) return "#1f6f7f";
      if (fract(p.y / 0.05) < 0.3) return "#1f7f8d";
      return "#36b4b0";
    }),
  );

function planterPaint(cx: number, y0: number, h: number, pw: number, base: Col, panel: Col, edge: Col, alongZ = false) {
  return K(
    paint((p) => {
      const k = Math.round(((alongZ ? p.z : p.x) - cx) / pw);
      const u = (alongZ ? p.z : p.x) - cx - k * pw;
      const v = p.y - y0;
      const hw = pw * 0.38;
      const top = h * 0.5;
      const inArch = Math.abs(u) < hw && v > h * 0.14 && (v < top || Math.hypot(u, v - top) < hw);
      if (inArch) {
        const e = Math.min(hw - Math.abs(u), v - h * 0.14, v < top ? 9 : hw - Math.hypot(u, v - top));
        return e < 0.014 ? edge : panel;
      }
      return base;
    }),
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings): flowers, leaves, bunting, tassels, emblems, glowing glass.
const petals = (n: number, rx: number, ry: number, cy: number, fill: string, stroke: string) =>
  Array.from(
    { length: n },
    (_, k) =>
      `<ellipse cx="0" cy="${-cy}" rx="${rx}" ry="${ry}" transform="rotate(${(k * 360) / n})" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`,
  ).join("");
const SVG = (inner: string, vb: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
const STEM = `<path d="M24 80 C24 62 25 46 24 30" stroke="#3f9a3a" stroke-width="3.4" fill="none"/><path d="M24 64 C14 60 10 52 9 46 C18 48 23 54 24 64Z" fill="#58b848"/><path d="M24 56 C33 54 38 48 39 42 C30 43 25 48 24 56Z" fill="#4aa43c"/>`;
const daisy = (fill: string, light: string, stroke: string, center: string) =>
  svg(
    SVG(
      `${STEM}<g transform="translate(24 22)">${petals(8, 6, 10, 12, fill, stroke)}${petals(8, 3, 5, 10, light, light)}<circle r="5.6" fill="${center}" stroke="#c98a2b" stroke-width=".8"/><circle cx="-1.6" cy="-1.8" r="1.8" fill="#fff3b0"/></g>`,
      "0 0 48 80",
    ),
    { size: 192 },
  );
const FL_PINK = daisy("#ff8fb1", "#ffc7d8", "#d9567f", "#ffd24a");
const FL_BLUE = daisy("#7fa8ff", "#c3d6ff", "#4a6fd0", "#fff0a0");
const FL_WHITE = daisy("#ffffff", "#fff6d6", "#c9c3d6", "#ffc83a");
const FL_LAV = svg(
  SVG(
    `<path d="M24 80 C24 62 24 44 24 14" stroke="#3f9a3a" stroke-width="3.2" fill="none"/><path d="M24 66 C14 62 11 55 10 49 C18 51 23 57 24 66Z" fill="#58b848"/>${Array.from(
      { length: 8 },
      (_, i) =>
        `<ellipse cx="${24 + (i % 2 ? 4.4 : -4.4)}" cy="${18 + i * 4.6}" rx="4.4" ry="3.6" fill="${i % 3 === 0 ? "#b79cff" : i % 3 === 1 ? "#9c80f0" : "#c9b3ff"}" stroke="#6f55c4" stroke-width="0.7"/>`,
    ).join("")}<ellipse cx="24" cy="10" rx="3.4" ry="4.4" fill="#c9b3ff" stroke="#6f55c4" stroke-width="0.7"/>`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const FL_TULIP = svg(
  SVG(
    `${STEM}<path d="M24 4 C30 10 38 14 36 26 C33 35 15 35 12 26 C10 14 18 10 24 4Z" fill="#ffb234" stroke="#d9741d" stroke-width="1"/><path d="M24 4 C20 12 19 24 24 34 C29 24 28 12 24 4Z" fill="#ffd45e" stroke="#d9741d" stroke-width=".8"/><path d="M14 20 C16 26 20 30 24 34" stroke="#e98a28" stroke-width="1" fill="none"/>`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const FL_BABY = svg(
  SVG(
    `<path d="M24 80 C24 60 24 50 24 40 M24 54 C18 46 14 40 12 30 M24 48 C30 40 34 32 36 22 M24 40 C23 30 24 20 24 12" stroke="#4aa43c" stroke-width="2.6" fill="none"/>${[
      [12, 28],
      [36, 20],
      [24, 10],
      [17, 38],
      [31, 32],
      [24, 24],
    ]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#fffdf4" stroke="#cfc9de" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="1.4" fill="#ffd45e"/>`)
      .join("")}`,
    "0 0 48 80",
  ),
  { size: 192 },
);
const LEAF = svg(
  SVG(
    `<path d="M32 64 C14 52 8 30 16 8 C30 18 36 42 32 64Z" fill="#3f9a3c"/><path d="M32 64 C50 52 56 30 48 8 C34 18 28 42 32 64Z" fill="#4fb043"/><path d="M32 64 C22 46 26 22 32 2 C38 22 42 46 32 64Z" fill="#74cf55"/><path d="M32 64 C29 46 30 24 32 2 C34 22 35 46 32 64Z" fill="#8fe06a"/>`,
    "0 0 64 64",
  ),
  { size: 128 },
);
const LEAF_Y = svg(
  SVG(
    `<path d="M32 64 C14 52 8 30 16 8 C30 18 36 42 32 64Z" fill="#6aa83a"/><path d="M32 64 C50 52 56 30 48 8 C34 18 28 42 32 64Z" fill="#7bbb42"/><path d="M32 64 C22 46 26 22 32 2 C38 22 42 46 32 64Z" fill="#a4d95a"/>`,
    "0 0 64 64",
  ),
  { size: 128 },
);
const IVY = svg(
  SVG(
    `<path d="M16 96 C14 70 18 40 16 4" stroke="#3f8a3a" stroke-width="2.6" fill="none"/>${[8, 26, 44, 62, 80]
      .map(
        (y, i) =>
          `<path d="M16 ${y} C${i % 2 ? 26 : 6} ${y - 10} ${i % 2 ? 30 : 2} ${y + 4} 16 ${y + 8}Z" fill="${i % 2 ? "#5cba45" : "#4aa43c"}"/>`,
      )
      .join("")}`,
    "0 0 32 96",
  ),
  { size: 192 },
);
const GRASS = svg(
  SVG(
    `<path d="M6 32 C6 20 4 10 2 4 C10 12 12 22 14 32Z" fill="#4aa43c"/><path d="M12 32 C12 18 14 8 16 0 C20 10 20 22 22 32Z" fill="#6cc24a"/><path d="M20 32 C22 22 26 14 30 8 C30 18 28 26 28 32Z" fill="#58b848"/>`,
    "0 0 32 32",
  ),
  { size: 96 },
);
const TASSEL = svg(
  SVG(
    `<path d="M12 96 L12 86" stroke="#c9852a" stroke-width="2.4"/><circle cx="12" cy="82" r="5" fill="#f6c94e" stroke="#c9852a" stroke-width="1"/><path d="M4 78 L20 78 L22 70 L2 70Z" fill="#f6c94e" stroke="#c9852a" stroke-width="1"/><path d="M2 70 L22 70 L20 8 L4 8Z" fill="#33b5b1"/><path d="M6 70 L6 8 M10 70 L10 8 M14 70 L14 8 M18 70 L18 8" stroke="#217f9a" stroke-width="1.2"/><path d="M2 58 L22 58" stroke="#f6c94e" stroke-width="2.6"/>`,
    "0 0 24 96",
  ),
  { size: 192 },
);
const FLAG = svg(SVG(`<path d="M0 64 L64 64 L32 4Z" fill="#ffffff"/><path d="M6 60 L58 60 L32 12Z" fill="#e8e8e8"/>`, "0 0 64 64"), { size: 96 });
const EMBLEM = svg(
  SVG(
    `<circle cx="32" cy="32" r="29" fill="#fff4d2" stroke="#f1b93c" stroke-width="3.4"/><circle cx="32" cy="32" r="23" fill="none" stroke="#e8d3a0" stroke-width="1.6"/><path d="M14 36 C16 20 32 12 44 20 C34 18 26 24 28 32 C30 40 40 40 44 34" stroke="#2aa8a6" stroke-width="4.4" stroke-linecap="round" fill="none"/><path d="M20 46 C28 52 42 50 50 38" stroke="#7fd6c8" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="46" cy="20" r="3" fill="#f1b93c"/>`,
    "0 0 64 64",
  ),
  { size: 192 },
);
const SIGN = svg(
  SVG(
    `<rect x="2" y="2" width="116" height="86" rx="12" fill="#fbf0d6" stroke="#f1b93c" stroke-width="4"/><rect x="9" y="9" width="102" height="72" rx="8" fill="none" stroke="#2aa8a6" stroke-width="2.4"/><path d="M36 44 L84 44 C84 64 74 72 60 72 C46 72 36 64 36 44Z" fill="#ffffff" stroke="#3b4a6b" stroke-width="3"/><path d="M84 48 C94 46 96 58 84 60" fill="none" stroke="#3b4a6b" stroke-width="3"/><path d="M40 52 L80 52" stroke="#4f86d8" stroke-width="3"/><path d="M50 38 C46 30 54 28 50 20 M60 38 C56 30 64 28 60 18 M70 38 C66 30 74 28 70 20" stroke="#e5875a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 66 C16 56 20 48 28 46 C28 56 26 62 22 66Z" fill="#58b848"/><path d="M98 66 C104 56 100 48 92 46 C92 56 94 62 98 66Z" fill="#58b848"/>`,
    "0 0 120 90",
  ),
  { size: 320 },
);
const WINDOW_GLASS = svg(
  SVG(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6a0"/><stop offset="1" stop-color="#ffb45c"/></linearGradient></defs><path d="M0 100 V30 A30 30 0 0 1 60 30 V100Z" fill="url(#g)"/><path d="M0 100 V34 C6 40 10 60 16 100Z" fill="#ff8fb1"/><path d="M60 100 V34 C54 40 50 60 44 100Z" fill="#ff8fb1"/><path d="M0 34 C8 44 12 60 16 100 M60 34 C52 44 48 60 44 100" stroke="#d9567f" stroke-width="1.2" fill="none"/><path d="M20 100 V84 H40 V100Z" fill="#7a4a36"/><path d="M30 84 C24 72 22 66 18 62 C26 62 30 70 30 84Z M30 84 C34 70 38 64 44 60 C38 70 34 76 30 84Z" fill="#3f8a3a"/><circle cx="30" cy="54" r="5" fill="#ff8fb1"/>`,
    "0 0 60 100",
  ),
  { size: 256 },
);
const LANTERN_GLASS = svg(
  SVG(
    `<defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset="1" stop-color="#ffc260"/></linearGradient></defs><rect width="600" height="200" fill="url(#l)"/>${Array.from(
      { length: 6 },
      (_, i) =>
        `<g transform="translate(${i * 100} 0)"><path d="M12 188 V70 A38 38 0 0 1 88 70 V188Z" fill="#fff9d8" stroke="#d98a2a" stroke-width="4"/><path d="M50 20 L55 40 L74 45 L55 50 L50 70 L45 50 L26 45 L45 40Z" fill="#ffc94a"/><path d="M20 140 H80" stroke="#d98a2a" stroke-width="3"/><path d="M50 74 V188" stroke="#d98a2a" stroke-width="3"/></g>`,
    ).join("")}`,
    "0 0 600 200",
  ),
  { size: 512 },
);
const MANHOLE = svg(
  SVG(
    `<circle cx="64" cy="64" r="62" fill="#4a5470" stroke="#2a3550" stroke-width="4"/><circle cx="64" cy="64" r="52" fill="none" stroke="#7684a8" stroke-width="3"/>${Array.from(
      { length: 8 },
      (_, k) =>
        `<path d="M64 64 C80 52 92 54 96 66 C88 62 80 66 78 76Z" fill="#7684a8" transform="rotate(${k * 45} 64 64)"/>`,
    ).join("")}<circle cx="64" cy="64" r="9" fill="#f6c94e" stroke="#c9852a" stroke-width="2.4"/>`,
    "0 0 128 128",
  ),
  { size: 256 },
);
const GRATE = svg(
  SVG(
    `<rect width="64" height="24" rx="3" fill="#2a3550"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${5 + i * 7}" y="4" width="3.4" height="16" fill="#0f1424"/>`).join("")}`,
    "0 0 64 24",
  ),
  { size: 192 },
);
const SEED = svg(SVG(`<path d="M16 32 L16 12" stroke="#fff" stroke-width="1.4"/>${petals(10, 1.4, 6, 0, "#ffffff", "#ffffff")}`, "-16 -16 32 32"), { size: 96 });
const CHALK = svg(
  SVG(
    `<rect width="68" height="100" rx="5" fill="#2e4a50"/><rect x="4" y="4" width="60" height="92" rx="3" fill="none" stroke="#f3ead2" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M20 44 L48 44 C48 58 42 64 34 64 C26 64 20 58 20 44Z" fill="#fff6dc" stroke="#f3ead2" stroke-width="1.6"/><path d="M48 47 C56 46 57 56 48 57" fill="none" stroke="#f3ead2" stroke-width="2"/><path d="M26 52 H42" stroke="#7fd6c8" stroke-width="2"/><path d="M28 38 C24 32 32 30 28 22 M36 38 C32 32 40 30 36 20 M44 38 C40 32 48 30 44 22" stroke="#f3ead2" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 74 H54 M18 82 H50 M24 90 H44" stroke="#f3ead2" stroke-width="2.4" stroke-linecap="round"/><path d="M34 16 C24 8 18 14 24 18 C28 20 32 18 34 16 C36 18 40 20 44 18 C50 14 44 8 34 16Z" fill="#ff8fb1"/>`,
    "0 0 68 100",
  ),
  { size: 256 },
);
const AUTUMN = svg(
  SVG(`<path d="M16 30 C4 20 2 8 16 1 C30 8 28 20 16 30Z" fill="#ffffff"/><path d="M16 30 L16 6" stroke="#cfcfcf" stroke-width="1.4"/>`, "0 0 32 32"),
  { size: 96 },
);
const HEART = svg(
  SVG(`<path d="M12 21 C-2 11 2 1 8 3 C10 4 11 6 12 7 C13 6 14 4 16 3 C22 1 26 11 12 21Z" fill="#ffffff"/>`, "0 0 24 24"),
  { size: 96 },
);

// ---------------------------------------------------------------------------------------------------------------
const b = createBuilder({ name: "streetCorner", paintSize: 2048 });
const base = b.joint("base", { at: [0, 0, 0] });
const R = rng(2024);

const arch = (w: number, h: number, n = 8): OutlinePoint[] => {
  const r = w / 2;
  const pts: OutlinePoint[] = [
    [-r, 0],
    [r, 0],
    [r, h - r],
  ];
  for (let i = 1; i < n; i++) {
    const a = (i / n) * Math.PI;
    pts.push([Math.cos(a) * r, h - r + Math.sin(a) * r]);
  }
  pts.push([-r, h - r]);
  return pts;
};

const box = (w: number, h: number, d: number, color: Col, at: V, rot?: V, bone = base) =>
  b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, bone = base, rot?: V) =>
  b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot });
const ball = (r: number, color: Col, at: V, scale?: V, bone = base, seg = 8) =>
  b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { bone, at, scale });
const rod = (a: V, c: V, r: number | [number, number], color: Col, sides = 6, bone = base) =>
  b.rod(a, c, r, { color, sides, bone });
const lathe = (outline: [number, number][], at: V, color: Col, segments = 10, bone = base, smoothing = 0) =>
  b.lathe(outline as OutlinePoint[], { at, color, segments, bone, smoothing });
const ring = (r: number, tube: number, color: Col, at: V, bone = base, rot: V = [90, 0, 0]) =>
  b.part(new THREE.TorusGeometry(r, tube, 5, 12), color, { bone, at, rotation: rot });
const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, bone = base, up?: V) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, up });

// merged little things: one part per colour
const batch = new Map<Col, THREE.BufferGeometry[]>();
function stamp(color: Col, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) {
  const g = geo.clone();
  g.applyMatrix4(
    new THREE.Matrix4().compose(
      new THREE.Vector3(...at),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
      new THREE.Vector3(...scale),
    ),
  );
  let list = batch.get(color);
  if (!list) batch.set(color, (list = []));
  list.push(g);
}
function flush() {
  for (const [color, list] of batch) b.part(mergeGeometries(list)!, color, { bone: base, at: [0, 0, 0] });
  batch.clear();
}
const BOX1 = new THREE.BoxGeometry(1, 1, 1);
const SPH = new THREE.SphereGeometry(1, 6, 4);
const CONE = new THREE.ConeGeometry(1, 1, 6);

// ---------------------------------------------------------------------------------------------------------------
// 1. Ground: cobbled street, flagstone sidewalk with a rounded corner, curb stones.
box(3.6, ST, 4.55, streetPaint, [0, ST / 2, -0.475]);
{
  const sw: OutlinePoint[] = [[-1.8, -0.6]];
  // outline in (x, -z): front edge z = 0.6, rounded corner centre (0.5, 0.1) radius 0.5, right edge x = 1.0
  sw.push([0.5, -0.6]);
  for (let i = 1; i < 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    sw.push([0.5 + Math.sin(a) * 0.5, -(0.1 + Math.cos(a) * 0.5)]);
  }
  sw.push([1.0, -0.1], [1.0, 2.75], [-1.8, 2.75]);
  b.extrude(sw, {
    at: [0, (ST + SW) / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: SW - ST,
    bevel: 0.006,
    color: sidewalkPaint,
    bone: base,
  });
}
// curb blocks
{
  const bh = 0.13;
  const cy = ST + bh / 2;
  let i = 0;
  for (let x = -1.65; x < 0.45; x += 0.3) stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [x, cy, 0.6], [0, 0, 0], [0.28, bh, 0.15]);
  for (let k = 0; k < 5; k++) {
    const a = ((k + 0.5) / 5) * (Math.PI / 2);
    stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [0.5 + Math.sin(a) * 0.5, cy, 0.1 + Math.cos(a) * 0.5], [0, a * (180 / Math.PI), 0], [0.2, bh, 0.15]);
  }
  for (let z = 0.0; z > -2.7; z -= 0.3) stamp(i++ % 2 ? STONE : STONE_DK, BOX1, [1.0, cy, z], [0, 0, 0], [0.15, bh, 0.28]);
}
// manhole + storm grate on the street
plane(0.62, 0.62, MANHOLE, [1.42, ST + 0.003, 0.5], [0, 1, 0], base, [0, 0, -1]);
plane(0.5, 0.19, GRATE, [-0.55, ST + 0.003, 0.7], [0, 1, 0], base, [0, 0, -1]);
// grass tufts in the gaps, fallen leaves, dandelion seeds
{
  const spots: V[] = [];
  for (let i = 0; i < 26; i++) {
    const x = -1.75 + R() * 2.7;
    spots.push([x, SW, -1.38 + R() * 0.07]);
  }
  for (let i = 0; i < 7; i++) spots.push([0.94 + R() * 0.02, SW, -1.2 + R() * 1.2]);
  b.cards(spots.map((p) => frame(p, [0, 1, 0])), GRASS, { size: [0.07, 0.08], lean: 15, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true, bone: base });
  const leaves: V[] = [];
  for (let i = 0; i < 12; i++) leaves.push([-1.5 + R() * 2.4, SW + 0.004, -0.8 + R() * 1.3]);
  for (let i = 0; i < 6; i++) leaves.push([-1.7 + R() * 2.6, ST + 0.004, 0.9 + R() * 0.8]);
  const lf = leaves.map((p) => frame(p, [0, 1, 0]));
  const tints = ["#f0a63a", "#e0703a", "#f6c94e", "#8cc84a"];
  for (let t = 0; t < tints.length; t++)
    b.cards(
      lf.filter((_, i) => i % tints.length === t),
      AUTUMN,
      { size: 0.07, lean: 90, flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)], mirror: true, color: tints[t], bone: base, sink: 0 },
    );
}

// ---------------------------------------------------------------------------------------------------------------
// 2. The teahouse corner: half-timbered wall, teal roof, door, window, shutters, sign.
b.extrude(
  [
    [WALL_Z, 0.1],
    [WALL_B, 0.1],
    [WALL_B, 2.73],
    [-1.8, 3.23],
    [WALL_Z, 2.83],
  ],
  { at: [(-1.8 + SIDE_X) / 2, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: SIDE_X + 1.8, color: wallPaint, bone: base },
);
// roof: two slopes meeting at a ridge
const roofW = SIDE_X + 1.8 + 0.3;
const roofC = (-1.95 + (SIDE_X + 0.15)) / 2;
b.extrude(
  [
    [-1.12, 2.55],
    [-1.12, 2.67],
    [-1.8, 3.35],
    [-1.8, 3.23],
  ],
  { at: [roofC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: roofW, color: roofPaint, bevel: 0.01, bone: base },
);
b.extrude(
  [
    [-1.8, 3.35],
    [-2.48, 2.67],
    [-2.48, 2.55],
    [-1.8, 3.23],
  ],
  { at: [roofC, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: roofW, color: roofPaint, bevel: 0.01, bone: base },
);
// eave trim, drops, ridge cap
rod([-1.95, 2.6, -1.1], [SIDE_X + 0.15, 2.6, -1.1], 0.03, GOLD, 6);
for (let x = -1.9; x < SIDE_X + 0.15; x += 0.2) stamp(GOLD, CONE, [x, 2.5, -1.1], [180, 0, 0], [0.03, 0.1, 0.03]);
rod([-1.95, 2.6, -2.5], [SIDE_X + 0.15, 2.6, -2.5], 0.03, GOLD, 6);
rod([-1.98, 3.37, -1.8], [SIDE_X + 0.18, 3.37, -1.8], 0.04, TEAL_DK, 6);
for (let x = -1.8; x < SIDE_X + 0.1; x += 0.25) ball(0.05, GOLD, [x, 3.4, -1.8], [1, 0.7, 1.4], base, 5);
for (const x of [-1.98, SIDE_X + 0.18]) {
  ball(0.05, GOLD, [x, 3.4, -1.8]);
  cyl(0.0, 0.03, 0.16, 5, GOLD, [x + Math.sign(x) * 0.0, 3.5, -1.8]);
}
// gable end trims
for (const x of [-1.95, SIDE_X + 0.15]) {
  rod([x, 2.58, -1.12], [x, 3.38, -1.8], 0.025, GOLD, 6);
  rod([x, 3.38, -1.8], [x, 2.58, -2.48], 0.025, GOLD, 6);
}
// chimney
box(0.34, 0.65, 0.34, brickPaint, [0.35, 3.15, -1.62]);
box(0.42, 0.06, 0.42, STONE, [0.35, 3.5, -1.62]);
cyl(0.06, 0.07, 0.14, 6, TERRA, [0.3, 3.58, -1.62]);
cyl(0.06, 0.07, 0.14, 6, TERRA, [0.42, 3.58, -1.62]);
// downspout and wall brackets
rod([SIDE_X - 0.03, 2.55, -1.33], [SIDE_X - 0.03, SW, -1.33], 0.028, NAVY, 6);
for (const y of [0.5, 1.3, 2.1]) box(0.08, 0.025, 0.1, GOLD, [SIDE_X - 0.03, y, -1.36]);
ball(0.05, NAVY, [SIDE_X - 0.03, SW + 0.02, -1.33]);
// timber post feet
for (const px of [-1.76, -0.815, SIDE_X - 0.07]) box(0.12, 0.05, 0.05, STONE_DK, [px, 0.77, WALL_Z + 0.02]);

// door --------------------------------------------------------------------------------------------
b.extrude(arch(0.86, 1.68, 10), {
  at: [DX, SW, WALL_Z - 0.02],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.08,
  bevel: 0.01,
  color: STONE,
  bone: base,
});
b.extrude(arch(0.66, 1.54, 10), {
  at: [DX, SW, WALL_Z + 0.02],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.05,
  bevel: 0.006,
  color: doorPaint,
  bone: base,
});
box(0.07, 0.07, 0.03, GOLD, [DX, SW + 1.7, WALL_Z + 0.04], [0, 0, 45]); // keystone
ball(0.03, GOLD, [DX, SW + 1.7, WALL_Z + 0.055]);
glow(cyl(0.085, 0.085, 0.02, 10, GLASS, [DX, SW + 1.18, WALL_Z + 0.05], base, [90, 0, 0]), 1.3);
ring(0.095, 0.014, GOLD, [DX, SW + 1.18, WALL_Z + 0.055], base, [0, 0, 0]);
box(0.012, 0.17, 0.012, GOLD, [DX, SW + 1.18, WALL_Z + 0.06]);
box(0.17, 0.012, 0.012, GOLD, [DX, SW + 1.18, WALL_Z + 0.06]);
for (const s of [-1, 1]) {
  box(0.24, 0.035, 0.012, GOLD, [DX + s * 0.2, SW + 0.3, WALL_Z + 0.052]);
  box(0.24, 0.035, 0.012, GOLD, [DX + s * 0.2, SW + 0.96, WALL_Z + 0.052]);
  for (const v of [0.3, 0.96]) ball(0.017, GOLD, [DX + s * 0.29, SW + v, WALL_Z + 0.06], undefined, base, 5);
}
ring(0.04, 0.008, GOLD, [DX - 0.02, SW + 0.9, WALL_Z + 0.07], base, [0, 0, 0]);
cyl(0.03, 0.03, 0.012, 8, GOLD, [DX - 0.02, SW + 0.95, WALL_Z + 0.06], base, [90, 0, 0]);
// chalkboard A-frame sign
{
  const ax = DX - 0.05;
  const az = -0.72;
  const tilt = 12;
  for (const s of [1, -1]) box(0.42, 0.74, 0.03, s > 0 ? WOOD_DKG : WOOD_DK, [ax, SW + 0.37, az + s * 0.1], [-s * tilt, 0, 0]);
  box(0.46, 0.04, 0.05, GOLD, [ax, SW + 0.745, az]);
  plane(0.34, 0.5, CHALK, [ax, SW + 0.4, az + 0.1 + 0.0165 + Math.sin((tilt * Math.PI) / 180) * 0.0], [0, Math.sin((tilt * Math.PI) / 180), Math.cos((tilt * Math.PI) / 180)]);
  for (const s of [-1, 1]) ball(0.012, GOLD, [ax + s * 0.2, SW + 0.745, az], undefined, base, 4);
}
ball(0.04, GOLD, [DX + 0.22, SW + 0.78, WALL_Z + 0.075]);
cyl(0.05, 0.05, 0.012, 8, GOLD, [DX + 0.22, SW + 0.78, WALL_Z + 0.055], base, [90, 0, 0]);
box(0.012, 0.03, 0.01, INKC, [DX + 0.22, SW + 0.68, WALL_Z + 0.056]);
// step and mat
box(0.9, 0.1, 0.38, STONE, [DX, SW + 0.05, WALL_Z + 0.2]);
box(0.8, 0.012, 0.28, K(stripes("#e5875a", "#fbf0d6", { size: 0.09, axis: "x" })), [DX, SW + 0.106, WALL_Z + 0.2]);
// wall lantern at the right post
const WLX = SIDE_X - 0.07;
cyl(0.03, 0.03, 0.025, 6, GOLD, [WLX, 1.62, WALL_Z + 0.015], base, [90, 0, 0]);
rod([WLX, 1.62, WALL_Z + 0.02], [WLX, 1.62, WALL_Z + 0.16], 0.012, GOLD, 5);
glow(cyl(0.055, 0.045, 0.13, 6, GLASS, [WLX, 1.55, WALL_Z + 0.17]), 1.4);
cyl(0.0, 0.075, 0.07, 6, TEAL, [WLX, 1.655, WALL_Z + 0.17]);
ball(0.014, GOLD, [WLX, 1.7, WALL_Z + 0.17], undefined, base, 5);
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2;
  rod([WLX + Math.sin(a) * 0.052, 1.49, WALL_Z + 0.17 + Math.cos(a) * 0.052], [WLX + Math.sin(a) * 0.062, 1.6, WALL_Z + 0.17 + Math.cos(a) * 0.062], 0.006, GOLD, 4);
}

// window -------------------------------------------------------------------------------------------
b.extrude(arch(0.98, 1.12, 10), { at: [WX, 1.2, WALL_Z - 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
b.extrude(arch(0.8, 0.94, 10), { at: [WX, 1.27, WALL_Z + 0.015], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
glow(plane(0.62, 0.78, WINDOW_GLASS, [WX, 1.4 + 0.39, WALL_Z + 0.036], [0, 0, 1]), 1.2);
box(0.022, 0.78, 0.022, TEAL_DK, [WX, 1.79, WALL_Z + 0.045]);
box(0.62, 0.022, 0.022, TEAL_DK, [WX, 1.72, WALL_Z + 0.045]);
box(0.62, 0.022, 0.022, TEAL_DK, [WX, 1.5, WALL_Z + 0.045]);
box(0.08, 0.08, 0.04, GOLD, [WX, 2.3, WALL_Z + 0.0], [0, 0, 45]);
// sill + brackets
box(1.08, 0.06, 0.26, STONE, [WX, 1.2, WALL_Z + 0.1]);
for (const s of [-1, 1]) {
  const c = catmull([[WX + s * 0.4, 1.17, WALL_Z + 0.02], [WX + s * 0.4, 1.06, WALL_Z + 0.05], [WX + s * 0.4, 1.03, WALL_Z + 0.17], [WX + s * 0.4, 1.0, WALL_Z + 0.2]]);
  b.sweep(c, 0.016, { color: NAVY, sides: 5, bone: base });
  ball(0.02, GOLD, [WX + s * 0.4, 1.0, WALL_Z + 0.2], undefined, base, 5);
}
// shutters on hinges
// shutter hinge joints carry their panels
for (const s of [1, -1]) {
  const hx = WX + s * 0.5;
  const j = b.joint(s > 0 ? "shutterL" : "shutterR", { parent: base, at: [hx, 1.26, WALL_Z + 0.03], dir: [0, 1, 0], role: "hinge" });
  // (j is the shutter's bone)
  b.extrude(
    [
      [0, 0],
      [0.23, 0],
      [0.23, 0.92],
      [0.115, 1.02],
      [0, 0.92],
    ],
    { at: [hx, 1.26, WALL_Z + 0.02], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.004, color: louver(hx + s * 0.115, 1.26 + 0.55), bone: j },
  );
  ball(0.015, GOLD, [hx + s * 0.02, 1.4, WALL_Z + 0.042], undefined, j, 5);
  ball(0.015, GOLD, [hx + s * 0.02, 2.12, WALL_Z + 0.042], undefined, j, 5);
}

// side windows on both end walls, each with a round attic window in the gable
for (const sg of [1, -1]) {
  const sz = (WALL_Z + WALL_B) / 2;
  const fx = sg > 0 ? SIDE_X : -1.8;
  b.extrude(arch(0.66, 0.96, 8), { at: [fx - sg * 0.02, 1.3, sz], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
  b.extrude(arch(0.5, 0.8, 8), { at: [fx + sg * 0.015, 1.38, sz], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
  glow(plane(0.4, 0.66, WINDOW_GLASS, [fx + sg * 0.036, 1.44 + 0.33, sz], [sg, 0, 0]), 1.2);
  box(0.022, 0.66, 0.022, TEAL_DK, [fx + sg * 0.045, 1.77, sz]);
  box(0.022, 0.022, 0.4, TEAL_DK, [fx + sg * 0.045, 1.72, sz]);
  box(0.022, 0.022, 0.4, TEAL_DK, [fx + sg * 0.045, 1.56, sz]);
  box(0.06, 0.06, 0.03, GOLD, [fx, 2.34, sz], [45, 0, 0]);
  box(0.26, 0.06, 0.78, STONE, [fx + sg * 0.1, 1.3, sz]);
  for (const s of [-1, 1]) {
    b.sweep(catmull([[fx + sg * 0.02, 1.27, sz + s * 0.3], [fx + sg * 0.05, 1.14, sz + s * 0.3], [fx + sg * 0.17, 1.1, sz + s * 0.3], [fx + sg * 0.2, 1.08, sz + s * 0.3]]), 0.016, { color: NAVY, sides: 5, bone: base });
    ball(0.02, GOLD, [fx + sg * 0.2, 1.08, sz + s * 0.3], undefined, base, 5);
  }
  // attic porthole
  glow(cyl(0.1, 0.1, 0.02, 10, GLASS, [fx + sg * 0.02, 2.93, sz], base, [0, 0, 90]), 1.3);
  ring(0.11, 0.016, GOLD, [fx + sg * 0.03, 2.93, sz], base, [0, 90, 0]);
  box(0.014, 0.2, 0.014, GOLD, [fx + sg * 0.04, 2.93, sz]);
  box(0.014, 0.014, 0.2, GOLD, [fx + sg * 0.04, 2.93, sz]);
}

// hanging sign on a bracket (swings)
{
  const sx = -0.815;
  const bz0 = WALL_Z + 0.03;
  const arm = catmull([[sx, 2.12, bz0], [sx, 2.13, bz0 + 0.3], [sx, 2.1, bz0 + 0.6], [sx, 2.02, bz0 + 0.78]]);
  b.sweep(arm, 0.014, { color: NAVY, sides: 5, bone: base });
  rod([sx, 1.7, bz0], [sx, 2.1, bz0 + 0.4], 0.01, NAVY, 5);
  const curl = spiral([sx, 1.98, bz0 + 0.46], [sx, 2.12, bz0 + 0.5], [1, 0, 0], { turns: 0.9, r1: 0.02 });
  b.sweep(curl, 0.009, { color: GOLD, sides: 5, bone: base });
  ball(0.026, GOLD, [sx, 2.02, bz0 + 0.8], undefined, base, 6);
  const hinge = b.joint("signSwing", { parent: base, at: [sx, 2.0, bz0 + 0.6], dir: [0, -1, 0], role: "hinge" });
  rod([sx, 2.0, bz0 + 0.6], [sx, 1.9, bz0 + 0.6], 0.008, GOLD, 4, hinge);
  b.extrude(
    [
      [-0.26, 0],
      [0.26, 0],
      [0.28, 0.06],
      [0.28, 0.34],
      [0.2, 0.4],
      [-0.2, 0.4],
      [-0.28, 0.34],
      [-0.28, 0.06],
    ],
    { at: [sx, 1.52, bz0 + 0.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.008, color: WOOD_DKG, bone: hinge },
  );
  for (const sd of [1, -1]) {
    plane(0.52, 0.39, SIGN, [sx + sd * 0.0225, 1.72, bz0 + 0.6], [sd, 0, 0], hinge);
  }
  for (const zz of [-0.2, 0.2]) {
    rod([sx, 1.9, bz0 + 0.6 + zz], [sx, 1.93, bz0 + 0.6 + zz], 0.006, GOLD, 4, hinge);
    ball(0.012, GOLD, [sx, 1.92, bz0 + 0.6 + zz], undefined, hinge, 5);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. Street lamp
const lampIron = K(
  paint((p) => {
    const v = p.y - SW;
    if (v > 0.05 && v < 0.075) return GOLD;
    if (v > 0.24 && v < 0.265) return GOLD;
    if (v > 0.36 && v < 0.375) return GOLD;
    return NAVY;
  }),
);
lathe(
  [
    [0, 0],
    [0.2, 0],
    [0.2, 0.03],
    [0.16, 0.06],
    [0.14, 0.1],
    [0.12, 0.2],
    [0.14, 0.25],
    [0.1, 0.31],
    [0.07, 0.37],
    [0.06, 0.44],
    [0, 0.44],
  ],
  [LX, SW, LZ],
  lampIron,
  8,
);
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
  const c = (r: number, y: number): V => [LX + Math.cos(a) * r, y, LZ + Math.sin(a) * r];
  b.sweep(catmull([c(0.2, SW + 0.04), c(0.26, SW + 0.1), c(0.18, SW + 0.2), c(0.1, SW + 0.24)]), 0.014, { color: NAVY, sides: 5, bone: base });
  ball(0.022, GOLD, c(0.2, SW + 0.04), undefined, base, 5);
}
// shaft
b.rod([LX, SW + 0.44, LZ], [LX, 2.28, LZ], [0.05, 0.034], { color: NAVY, sides: 8, bone: base });
for (const [y, r] of [[0.58, 0.06], [1.1, 0.05], [1.65, 0.045]] as const) {
  cyl(r + 0.02, r + 0.02, 0.035, 8, GOLD, [LX, y, LZ]);
  cyl(r + 0.012, r + 0.03, 0.03, 8, NAVY, [LX, y - 0.03, LZ]);
}
ball(0.055, GOLD, [LX, 1.3, LZ]);
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2;
  stamp(GOLD, SPH, [LX + Math.cos(a) * 0.06, 1.3, LZ + Math.sin(a) * 0.06], [0, 0, 0], [0.018, 0.018, 0.018]);
}
// arms
const armR = catmull([[LX, 1.7, LZ], [LX + 0.14, 1.72, LZ], [LX + 0.3, 1.84, LZ], [LX + 0.47, 1.88, LZ]]);
const armL = catmull([[LX, 1.7, LZ], [LX - 0.13, 1.72, LZ], [LX - 0.26, 1.82, LZ], [LX - 0.36, 1.86, LZ]]);
b.sweep(armR, 0.016, { color: NAVY, sides: 6, bone: base });
b.sweep(armL, 0.016, { color: NAVY, sides: 6, bone: base });
b.sweep(spiral([LX + 0.47, 1.82, LZ], [LX + 0.47, 1.88, LZ], [0, 0, -1], { turns: 0.85, r1: 0.02 }), 0.011, { color: GOLD, sides: 5, bone: base });
b.sweep(spiral([LX - 0.36, 1.8, LZ], [LX - 0.36, 1.86, LZ], [0, 0, 1], { turns: 0.85, r1: 0.02 }), 0.011, { color: GOLD, sides: 5, bone: base });
rod([LX, 1.4, LZ], [LX + 0.3, 1.82, LZ], 0.011, GOLD, 5);
rod([LX, 1.4, LZ], [LX - 0.25, 1.8, LZ], 0.011, GOLD, 5);
// scroll braces under the lantern
for (let k = 0; k < 4; k++) {
  const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
  const c = (r: number, y: number): V => [LX + Math.cos(a) * r, y, LZ + Math.sin(a) * r];
  b.sweep(catmull([c(0.03, 2.16), c(0.13, 2.2), c(0.2, 2.32), c(0.15, 2.4)]), 0.011, { color: GOLD, sides: 5, bone: base });
}
// lantern
lathe(
  [
    [0, 0],
    [0.1, 0],
    [0.14, 0.04],
    [0.22, 0.09],
    [0.22, 0.12],
    [0.18, 0.13],
    [0.15, 0.14],
    [0, 0.14],
  ],
  [LX, 2.3, LZ],
  GOLD,
  6,
);
ball(0.05, GOLD, [LX, 2.27, LZ]);
const lanternGlass = b.part(new THREE.CylinderGeometry(0.17, 0.145, 0.44, 6, 1, true), "#ffffff", {
  bone: base,
  at: [LX, 2.66, LZ],
  texture: LANTERN_GLASS,
});
glow(lanternGlass, 1.5);
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2;
  const rb = 0.145 / Math.cos(Math.PI / 6) * 0.0 + 0.145;
  const rt = 0.17;
  rod([LX + Math.sin(a) * rb, 2.44, LZ + Math.cos(a) * rb], [LX + Math.sin(a) * rt, 2.88, LZ + Math.cos(a) * rt], 0.012, GOLD, 5);
}
lathe(
  [
    [0, 0],
    [0.22, 0],
    [0.22, 0.03],
    [0.18, 0.06],
    [0.16, 0.06],
    [0, 0.06],
  ],
  [LX, 2.87, LZ],
  GOLD,
  6,
);
lathe(
  [
    [0, 0],
    [0.3, 0],
    [0.3, 0.02],
    [0.25, 0.07],
    [0.15, 0.15],
    [0.07, 0.24],
    [0.04, 0.28],
    [0, 0.28],
  ],
  [LX, 2.93, LZ],
  K(paint((p) => (fract((Math.atan2(p.z - LZ, p.x - LX) / Math.PI) * 3) < 0.09 ? GOLD : fract((p.y - 2.93) / 0.06) < 0.2 ? "#1f7f8d" : "#33b5b1"))),
  6,
);
ball(0.035, GOLD, [LX, 3.23, LZ]);
cyl(0.0, 0.015, 0.1, 5, GOLD, [LX, 3.3, LZ]);
for (const a of [0, 90]) box(0.12, 0.028, 0.006, GOLD_PALE, [LX, 3.37, LZ], [0, a, 20]);
ball(0.014, GOLD, [LX, 3.37, LZ], undefined, base, 5);
ring(0.205, 0.014, GOLD, [LX, 2.46, LZ], base, [90, 30, 0]);

// hanging flower basket on the right arm
const BAS: V = [LX + 0.47, 1.5, LZ];
lathe(
  [
    [0, 0],
    [0.07, 0],
    [0.11, 0.03],
    [0.14, 0.09],
    [0.15, 0.14],
    [0.13, 0.14],
    [0.12, 0.1],
    [0.08, 0.05],
    [0, 0.03],
  ],
  BAS,
  TERRA,
  8,
);
ring(0.15, 0.014, GOLD, [BAS[0], BAS[1] + 0.14, BAS[2]]);
cyl(0.13, 0.13, 0.01, 8, SOIL, [BAS[0], BAS[1] + 0.125, BAS[2]]);
for (let k = 0; k < 3; k++) {
  const a = (k / 3) * Math.PI * 2 + 0.5;
  rod([LX + 0.47, 1.78, LZ], [BAS[0] + Math.cos(a) * 0.145, BAS[1] + 0.14, BAS[2] + Math.sin(a) * 0.145], 0.005, GOLD, 4);
}
ball(0.024, GOLD, [LX + 0.47, 1.8, LZ], undefined, base, 5);

// tassels
b.cards(
  [frame([LX + 0.17, 2.4, LZ + 0.17], [0, 1, 0]), frame([LX - 0.17, 2.4, LZ + 0.17], [0, 1, 0]), frame([LX - 0.36, 1.84, LZ], [0, 1, 0])],
  TASSEL,
  { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], cross: true, bone: base, sink: 0 },
);

// bird on the left arm
{
  const bp = armL.at(0.55);
  const bx = bp.x;
  const by = bp.y + 0.016;
  ball(0.045, BIRD_Y, [bx, by + 0.05, LZ], [1, 0.9, 1.2]);
  ball(0.03, BIRD_Y, [bx, by + 0.105, LZ + 0.04]);
  b.part(new THREE.ConeGeometry(0.012, 0.03, 5), TERRA, { bone: base, at: [bx, by + 0.1, LZ + 0.075], dir: [0, -0.15, 1] });
  b.part(new THREE.ConeGeometry(0.02, 0.07, 5), TERRA, { bone: base, at: [bx, by + 0.045, LZ - 0.075], dir: [0, 0.2, -1] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), K("#f5b92f", "#d98a2a"), { bone: base, at: [bx + 0.035, by + 0.06, LZ], scale: [0.4, 0.8, 1.2] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), K("#f5b92f", "#d98a2a"), { bone: base, at: [bx - 0.035, by + 0.06, LZ], scale: [0.4, 0.8, 1.2] });
  ball(0.006, INKC, [bx + 0.018, by + 0.115, LZ + 0.06], undefined, base, 4);
  ball(0.006, INKC, [bx - 0.018, by + 0.115, LZ + 0.06], undefined, base, 4);
  rod([bx + 0.008, by + 0.01, LZ + 0.005], [bx + 0.008, by - 0.005, LZ + 0.005], 0.004, TERRA, 4);
  rod([bx - 0.008, by + 0.01, LZ + 0.005], [bx - 0.008, by - 0.005, LZ + 0.005], 0.004, TERRA, 4);
}

// bunting from the lamp arm to the sign bracket
{
  const p0: V = [LX + 0.47, 1.93, LZ];
  const p1: V = [-0.815, 2.04, WALL_Z + 0.03 + 0.8];
  const mid: V = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 0.5, (p0[2] + p1[2]) / 2];
  const path = bezier(p0, mid, p1);
  b.sweep(path, 0.007, { color: GOLD, sides: 4, bone: base });
  const dx = p1[0] - p0[0];
  const dz = p1[2] - p0[2];
  const fl = Math.hypot(dx, dz);
  const flowD: V = [dz / fl, 0, -dx / fl];
  const tints = ["#ec5a4f", "#f6c94e", "#33b5b1", "#ff8fb1"];
  for (let t = 0; t < 4; t++) {
    const frames: Spot[] = [];
    for (let i = t; i < 8; i += 4) {
      const q = path.at(0.09 + (i / 7) * 0.82);
      frames.push(frame([q.x, q.y, q.z], [0, 1, 0]));
    }
    b.cards(frames, FLAG, { size: [0.13, 0.17], lean: 180, flow: flowD, color: tints[t], bone: base, sink: 0, bend: 8 });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 4. Mailbox on a post
{
  const top = SW + 0.95;
  b.rod([MX, SW, MZ], [MX, top, MZ], [0.06, 0.048], { color: WOOD_Y, sides: 8, bone: base });
  cyl(0.085, 0.095, 0.06, 8, STONE, [MX, SW + 0.03, MZ]);
  box(0.16, 0.035, 0.16, CREAM, [MX, top + 0.01, MZ]);
  box(0.38, 0.03, 0.6, NAVY, [MX, top + 0.045, MZ]);
  for (const s of [1, -1]) {
    b.sweep(catmull([[MX, top - 0.12, MZ + s * 0.05], [MX, top - 0.02, MZ + s * 0.12], [MX, top + 0.02, MZ + s * 0.22], [MX, top + 0.04, MZ + s * 0.28]]), 0.012, { color: NAVY, sides: 5, bone: base });
    ball(0.02, GOLD, [MX, top + 0.04, MZ + s * 0.28], undefined, base, 5);
  }
  const y0 = top + 0.06;
  const mbPaint = K(
    paint((p, n) => {
      const v = p.y - y0;
      if (n.y < -0.5) return RED_DK;
      if (v < 0.035) return NAVY;
      for (const d of [-0.215, -0.205, 0.205, 0.215]) if (Math.abs(p.z - MZ - d) < 0.0035) return GOLD;
      return RED;
    }),
  );
  b.extrude(arch(0.32, 0.38, 10), { at: [MX, y0, MZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.52, bevel: 0.012, color: mbPaint, bone: base });
  rod([MX, y0 + 0.381, MZ - 0.25], [MX, y0 + 0.381, MZ + 0.25], 0.012, GOLD, 6);
  // front door on a hinge
  const door = b.joint("mailDoor", { parent: base, at: [MX, y0 + 0.025, MZ + 0.27], dir: [0, 1, 0], role: "hinge" });
  b.extrude(arch(0.3, 0.355, 10), { at: [MX, y0 + 0.025, MZ + 0.261], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: GOLD, bone: door });
  b.extrude(arch(0.25, 0.31, 10), { at: [MX, y0 + 0.045, MZ + 0.274], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: RED, bone: door });
  ball(0.02, GOLD, [MX, y0 + 0.22, MZ + 0.292], undefined, door, 6);
  box(0.12, 0.012, 0.01, GOLD, [MX, y0 + 0.28, MZ + 0.284], undefined, door);
  box(0.1, 0.005, 0.012, INKC, [MX, y0 + 0.28, MZ + 0.29], undefined, door);
  // emblems on the sides
  for (const s of [1, -1]) plane(0.19, 0.19, EMBLEM, [MX + s * 0.1625, y0 + 0.19, MZ], [s, 0, 0]);
  // flag
  const flag = b.joint("mailFlag", { parent: base, at: [MX + 0.17, y0 + 0.14, MZ - 0.06], dir: [0, 1, 0], up: [-1, 0, 0], role: "hinge" });
  ball(0.022, GOLD, [MX + 0.172, y0 + 0.14, MZ - 0.06], undefined, flag, 6);
  rod([MX + 0.172, y0 + 0.14, MZ - 0.06], [MX + 0.172, y0 + 0.34, MZ - 0.06], 0.008, GOLD, 5, flag);
  b.extrude(
    [
      [0, 0],
      [0.15, 0.0],
      [0.11, 0.05],
      [0.15, 0.1],
      [0, 0.1],
    ],
    { at: [MX + 0.172, y0 + 0.25, MZ - 0.06], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: TEAL, bone: flag },
  );
  b.cards([frame([MX + 0.18, y0 + 0.03, MZ + 0.2], [0, 1, 0])], TASSEL, { size: [0.035, 0.14], lean: 180, flow: [1, 0, 0], cross: true, bone: base, sink: 0 });
  // a letter peeking out of the top slot
  box(0.1, 0.01, 0.006, GOLD, [MX, y0 + 0.382, MZ + 0.12]);
  box(0.09, 0.075, 0.003, PAPER, [MX, y0 + 0.4, MZ + 0.12], [-8, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.03, 0.03), "#ff6a86", { bone: base, at: [MX, y0 + 0.405, MZ + 0.1235], dir: [0, -0.14, 1], axis: "z", texture: HEART });
}

// ---------------------------------------------------------------------------------------------------------------
// 5. Bench with a napping cat
{
  const bw = 1.3;
  const seatY = SW + 0.46;
  for (let i = 0; i < 4; i++) {
    box(bw, 0.035, 0.088, i % 2 ? WOOD : WOOD_LT, [BX, seatY - 0.0175, BZ - 0.16 + i * 0.1]);
  }
  // backrest slats lean back against the wall
  for (let i = 0; i < 3; i++) {
    const yy = seatY + 0.2 + i * 0.14;
    box(bw, 0.1, 0.03, i % 2 ? WOOD_LT : WOOD, [BX, yy, BZ - 0.235 - i * 0.02], [-10, 0, 0]);
  }
  // rails under the seat
  rod([BX - bw / 2, seatY - 0.06, BZ - 0.1], [BX + bw / 2, seatY - 0.06, BZ - 0.1], 0.016, NAVY, 5);
  rod([BX - bw / 2, seatY - 0.06, BZ + 0.12], [BX + bw / 2, seatY - 0.06, BZ + 0.12], 0.016, NAVY, 5);
  for (const s of [1, -1]) {
    const x = BX + s * (bw / 2 - 0.03);
    // front leg with foot curl, back leg + back support, armrest with scroll
    b.sweep(catmull([[x, SW, BZ + 0.2], [x, SW + 0.15, BZ + 0.17], [x, seatY - 0.05, BZ + 0.16]]), 0.017, { color: NAVY, sides: 6, bone: base });
    b.sweep(catmull([[x, SW, BZ - 0.3], [x, SW + 0.2, BZ - 0.26], [x, seatY + 0.2, BZ - 0.26], [x, seatY + 0.48, BZ - 0.32]]), 0.017, { color: NAVY, sides: 6, bone: base });
    b.sweep(catmull([[x, seatY - 0.04, BZ + 0.16], [x, seatY + 0.14, BZ + 0.2], [x, seatY + 0.24, BZ + 0.1], [x, seatY + 0.28, BZ - 0.1], [x, seatY + 0.25, BZ - 0.24]]), 0.015, { color: NAVY, sides: 6, bone: base });
    b.sweep(spiral([x, seatY + 0.17, BZ + 0.2], [x, seatY + 0.14, BZ + 0.2], [s, 0, 0], { turns: 0.8, r1: 0.02 }), 0.012, { color: GOLD, sides: 5, bone: base });
    b.sweep(spiral([x, SW + 0.04, BZ + 0.25], [x, SW, BZ + 0.2], [s, 0, 0], { turns: -0.7, r1: 0.015 }), 0.012, { color: GOLD, sides: 5, bone: base });
    ball(0.024, GOLD, [x, seatY + 0.48, BZ - 0.32], undefined, base, 6);
    // curved decorative brace
    b.sweep(catmull([[x, seatY - 0.05, BZ + 0.12], [x, seatY - 0.15, BZ - 0.02], [x, seatY - 0.18, BZ - 0.26]]), 0.009, { color: GOLD, sides: 4, bone: base });
    box(0.07, 0.02, 0.1, NAVY_DEEP, [x, SW + 0.01, BZ + 0.2]);
    box(0.07, 0.02, 0.1, NAVY_DEEP, [x, SW + 0.01, BZ - 0.3]);
  }
  // seat screws
  for (let i = 0; i < 4; i++) for (const s of [1, -1]) stamp(GOLD, SPH, [BX + s * (bw / 2 - 0.05), seatY + 0.002, BZ - 0.16 + i * 0.1], [0, 0, 0], [0.007, 0.004, 0.007]);
  // plaque on the back
  box(0.2, 0.05, 0.006, GOLD, [BX, seatY + 0.34, BZ - 0.285], [-10, 0, 0]);
  box(0.17, 0.028, 0.004, CREAM, [BX, seatY + 0.34, BZ - 0.279], [-10, 0, 0]);
  // cushion + book
  b.part(new THREE.SphereGeometry(0.1, 8, 5), TEAL, { bone: base, at: [BX + 0.42, seatY + 0.03, BZ - 0.02], scale: [1.4, 0.35, 1.1], rotation: [0, 12, 0] });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), GOLD, { bone: base, at: [BX + 0.42, seatY + 0.065, BZ - 0.02], scale: [1, 0.6, 1] });
  box(0.17, 0.035, 0.12, BOOK, [BX + 0.36, seatY + 0.08, BZ - 0.0], [0, -18, 0]);
  box(0.155, 0.025, 0.11, PAPER, [BX + 0.363, seatY + 0.08, BZ + 0.003], [0, -18, 0]);
  box(0.02, 0.037, 0.12, GOLD, [BX + 0.29, seatY + 0.08, BZ - 0.0], [0, -18, 0]);
  // the cat, curled up on the left
  const cx = BX - 0.3;
  const cz = BZ - 0.02;
  const cyy = seatY;
  b.part(new THREE.SphereGeometry(0.12, 8, 6), ORANGE_CAT, { bone: base, at: [cx, cyy + 0.07, cz], scale: [1.15, 0.7, 1.0] });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), ORANGE_CAT, { bone: base, at: [cx + 0.13, cyy + 0.08, cz + 0.07] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), CAT_WHITE, { bone: base, at: [cx + 0.15, cyy + 0.065, cz + 0.12], scale: [1.1, 0.8, 0.9] });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.06, 4), ORANGE_CAT, { bone: base, at: [cx + 0.13 + s * 0.04, cyy + 0.15, cz + 0.06], rotation: [0, 0, -s * 14] });
    b.part(new THREE.ConeGeometry(0.014, 0.035, 4), K("#ffb4a2", "#d9809a"), { bone: base, at: [cx + 0.13 + s * 0.04, cyy + 0.147, cz + 0.07], rotation: [0, 0, -s * 14] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), CAT_WHITE, { bone: base, at: [cx + 0.02 + s * 0.15, cyy + 0.04, cz + 0.13], scale: [0.8, 0.6, 1.2] });
    box(0.034, 0.005, 0.006, INKC, [cx + 0.13 + s * 0.032, cyy + 0.096, cz + 0.137]);
    for (const w of [-1, 1]) rod([cx + 0.13 + s * 0.05, cyy + 0.075, cz + 0.14], [cx + 0.13 + s * 0.1, cyy + 0.075 + w * 0.012, cz + 0.13], 0.0025, WHITE, 3);
  }
  ball(0.012, K("#ff8fa6"), [cx + 0.13, cyy + 0.078, cz + 0.143], undefined, base, 4);
  // tail curled around, with stripes
  b.sweep(catmull([[cx - 0.1, cyy + 0.05, cz - 0.06], [cx - 0.05, cyy + 0.03, cz - 0.17], [cx + 0.1, cyy + 0.03, cz - 0.15], [cx + 0.2, cyy + 0.04, cz - 0.03]]), [0.03, 0.022], {
    color: K(stripes("#f2a24a", "#c76a45", { size: 0.06, axis: "z" })),
    sides: 6,
    bone: base,
  });
  // stripes on the back
  for (let i = 0; i < 3; i++) box(0.012, 0.004, 0.09, K("#c76a45"), [cx - 0.08 + i * 0.07, cyy + 0.13 - i * 0.004, cz - 0.01], [0, 0, 0]);
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Flower boxes and planters
function bloom(area: { cx: number; cz: number; y: number; w: number; d: number }, seed: number, n: number, set: THREE.Texture[], height = 0.26) {
  const r = rng(seed);
  const leafF: Spot[] = [];
  const flF: Spot[] = [];
  for (let i = 0; i < n * 1.4; i++) {
    const x = area.cx + (r() - 0.5) * (area.w - 0.06);
    const z = area.cz + (r() - 0.5) * (area.d - 0.05);
    leafF.push(frame([x, area.y, z], [0, 1, 0]));
  }
  for (let i = 0; i < n; i++) {
    const x = area.cx + (r() - 0.5) * (area.w - 0.08);
    const z = area.cz + (r() - 0.5) * (area.d - 0.06);
    flF.push(frame([x, area.y, z], [0, 1, 0]));
  }
  const outward = (f: Frame): V => {
    const dx = f.at.x - area.cx;
    const dz = f.at.z - area.cz;
    const l = Math.hypot(dx, dz) || 1;
    return [dx / l, 0, dz / l];
  };
  b.cards(leafF, LEAF, { size: [0.17, 0.2], lean: 38, flow: (f) => outward(f), cross: true, vary: 0.3, rng: r, bone: base, bend: 14 });
  b.cards(leafF.filter((_, i) => i % 3 === 0), LEAF_Y, { size: [0.14, 0.16], lean: 55, flow: (f) => outward(f), vary: 0.3, rng: r, bone: base });
  b.cards(flF, set, { size: [0.12, height], lean: 12, flow: (f) => outward(f), cross: true, vary: 0.3, rng: r, bone: base });
}

function trailing(x0: number, x1: number, y: number, z: number, n: number, seed: number) {
  const r = rng(seed);
  const fr: Spot[] = [];
  for (let i = 0; i < n; i++) fr.push(frame([x0 + ((x1 - x0) * (i + 0.3 + r() * 0.4)) / n, y, z], [0, 1, 0]));
  b.cards(fr, IVY, { size: [0.07, 0.12 + r() * 0.1], lean: 180, flow: [0, 0, 1], vary: 0.5, rng: r, cross: true, bone: base, sink: 0 });
}

function woodBox(opts: { cx: number; cz: number; y0: number; w: number; d: number; h: number; base: Col; panel: Col; edge: Col; trim: Col; legs?: boolean; alongZ?: boolean }) {
  const { cx, cz, y0, w, d, h } = opts;
  const long = opts.alongZ ? d : w;
  const pw = Math.max(0.2, long / Math.round(long / 0.26));
  box(w, h, d, planterPaint(opts.alongZ ? cz : cx, y0, h, pw, opts.base, opts.panel, opts.edge, opts.alongZ), [cx, y0 + h / 2, cz]);
  box(w + 0.05, 0.035, d + 0.05, opts.trim, [cx, y0 + h + 0.0, cz]);
  box(w + 0.03, 0.03, d + 0.03, opts.trim, [cx, y0 + 0.015, cz]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.04, h + 0.02, 0.04, opts.trim, [cx + sx * (w / 2), y0 + h / 2, cz + sz * (d / 2)]);
    ball(0.018, GOLD, [cx + sx * (w / 2), y0 + h + 0.03, cz + sz * (d / 2)], undefined, base, 5);
  }
  box(w - 0.04, 0.02, d - 0.04, SOIL, [cx, y0 + h + 0.015, cz]);
  if (opts.legs) for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, y0 - SW, 0.05, WOOD_DK, [cx + sx * (w / 2 - 0.06), SW + (y0 - SW) / 2, cz + sz * (d / 2 - 0.04)]);
  return y0 + h + 0.025;
}
const MIX = [FL_PINK, FL_BLUE, FL_WHITE, FL_LAV, FL_TULIP, FL_BABY, FL_PINK, FL_TULIP];

// window box on the sill
{
  const top = woodBox({ cx: WX, cz: WALL_Z + 0.1, y0: 1.23, w: 0.9, d: 0.2, h: 0.16, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL });
  bloom({ cx: WX, cz: WALL_Z + 0.1, y: top, w: 0.9, d: 0.2 }, 31, 13, MIX, 0.3);
  trailing(WX - 0.4, WX + 0.4, 1.3, WALL_Z + 0.215, 7, 5);
}
// side window boxes (hang over the street and the left corner)
for (const sg of [1, -1]) {
  const sz = (WALL_Z + WALL_B) / 2;
  const bx = (sg > 0 ? SIDE_X : -1.8) + sg * 0.1;
  const top = woodBox({ cx: bx, cz: sz, y0: 1.33, w: 0.2, d: 0.7, h: 0.16, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL, alongZ: true });
  bloom({ cx: bx, cz: sz, y: top, w: 0.2, d: 0.7 }, 44 + sg * 7, 10, MIX, 0.28);
  const r3 = rng(19 + sg);
  const fr: Spot[] = [];
  for (let i = 0; i < 6; i++) fr.push(frame([bx + sg * 0.115, 1.4, sz - 0.3 + (0.6 * (i + 0.3 + r3() * 0.4)) / 6], [0, 1, 0]));
  b.cards(fr, IVY, { size: [0.07, 0.14 + r3() * 0.08], lean: 180, flow: [sg, 0, 0], vary: 0.5, rng: r3, cross: true, bone: base, sink: 0 });
}
// long curbside planter on short legs
{
  const pcx = -0.55;
  const top = woodBox({ cx: pcx, cz: 0.32, y0: SW + 0.1, w: 1.2, d: 0.3, h: 0.26, base: WOOD_DKG, panel: K("#c28850"), edge: GOLD, trim: CREAM, legs: true });
  bloom({ cx: pcx, cz: 0.32, y: top, w: 1.2, d: 0.3 }, 77, 24, MIX, 0.34);
  trailing(pcx - 0.55, pcx + 0.55, SW + 0.1 + 0.27, 0.32 + 0.16, 9, 8);
  // little watering can next to it
  const wx = 0.2;
  const wz = 0.05;
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.11, 8), TEAL, { bone: base, at: [wx, SW + 0.055, wz] });
  ring(0.062, 0.006, GOLD, [wx, SW + 0.11, wz], base);
  rod([wx - 0.05, SW + 0.06, wz], [wx - 0.13, SW + 0.15, wz], 0.012, TEAL_DK, 5);
  b.part(new THREE.ConeGeometry(0.014, 0.05, 5), GOLD, { bone: base, at: [wx - 0.14, SW + 0.16, wz], rotation: [0, 0, 55] });
  b.sweep(catmull([[wx + 0.05, SW + 0.1, wz], [wx + 0.12, SW + 0.16, wz], [wx + 0.07, SW + 0.2, wz], [wx + 0.0, SW + 0.12, wz]]), 0.007, { color: GOLD, sides: 4, bone: base });
}
// tub with a cone topiary beside the bench, pot by the mailbox
{
  const tx = 0.7;
  const tz = -1.2;
  lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.19, 0.28],
      [0.21, 0.3],
      [0.19, 0.3],
      [0.17, 0.27],
      [0, 0.27],
    ],
    [tx, SW, tz],
    TERRA,
    8,
  );
  ring(0.2, 0.015, GOLD, [tx, SW + 0.29, tz]);
  ring(0.17, 0.01, GOLD, [tx, SW + 0.12, tz]);
  b.part(new THREE.ConeGeometry(0.17, 0.48, 7), GREEN_DK, { bone: base, at: [tx, SW + 0.5, tz] });
  b.part(new THREE.ConeGeometry(0.12, 0.32, 7), GREEN, { bone: base, at: [tx, SW + 0.72, tz] });
  ball(0.035, GOLD, [tx, SW + 0.9, tz], undefined, base, 6);
  const bl: Spot[] = [];
  const r2 = rng(14);
  for (let i = 0; i < 14; i++) {
    const a = r2() * Math.PI * 2;
    const h = 0.34 + r2() * 0.45;
    const rr = 0.17 * (1 - (h - 0.3) / 0.7) + 0.02;
    bl.push(frame([tx + Math.cos(a) * rr, SW + h, tz + Math.sin(a) * rr], [Math.cos(a), 0.4, Math.sin(a)]));
  }
  b.cards(bl, [FL_PINK, FL_WHITE], { size: 0.08, lean: 80, flow: [0, -1, 0], vary: 0.3, rng: r2, bone: base, sink: 0.4 });
  // round pot beside the mailbox
  const px = 0.32;
  const pz = -0.28;
  lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.13, 0.19],
      [0.15, 0.21],
      [0.13, 0.21],
      [0.11, 0.18],
      [0, 0.18],
    ],
    [px, SW, pz],
    TERRA,
    8,
  );
  ring(0.14, 0.012, GOLD, [px, SW + 0.2, pz]);
  cyl(0.11, 0.11, 0.008, 8, SOIL, [px, SW + 0.195, pz]);
  bloom({ cx: px, cz: pz, y: SW + 0.2, w: 0.2, d: 0.2 }, 61, 6, [FL_TULIP, FL_PINK, FL_BLUE], 0.3);
}
// ivy climbing the left corner and over the door
{
  const IVYLEAF = svg(
    SVG(
      `<path d="M16 30 C4 24 0 12 6 6 C10 2 14 4 16 10 C18 4 22 2 26 6 C32 12 28 24 16 30Z" fill="#4aa43c"/><path d="M16 30 C10 24 8 14 11 9 C13 12 15 16 16 24Z" fill="#5cba45"/><path d="M16 30 L16 12" stroke="#2f7a30" stroke-width="1.4"/>`,
      "0 0 32 32",
    ),
    { size: 96 },
  );
  const vine = catmull([
    [-1.79, SW + 0.05, WALL_Z + 0.015],
    [-1.75, 0.8, WALL_Z + 0.02],
    [-1.79, 1.3, WALL_Z + 0.02],
    [-1.74, 1.9, WALL_Z + 0.02],
    [-1.6, 2.02, WALL_Z + 0.02],
    [-1.4, 1.98, WALL_Z + 0.02],
    [-1.2, 2.06, WALL_Z + 0.02],
    [-1.0, 2.0, WALL_Z + 0.02],
  ]);
  b.sweep(vine, 0.007, { color: GREEN_DK, sides: 4, bone: base });
  const ri = rng(23);
  const lf: Spot[] = [];
  for (let i = 0; i < 44; i++) {
    const q = vine.at(0.02 + (i / 43) * 0.96);
    lf.push(frame([q.x + (ri() - 0.5) * 0.1, q.y + (ri() - 0.5) * 0.08, WALL_Z + 0.02], [0, 0, 1]));
  }
  b.cards(lf, IVYLEAF, { size: 0.1, lean: 85, flow: (_f, i) => [Math.cos(i * 2.1), Math.sin(i * 2.7) * 0.8 - 0.2, 0], vary: 0.35, rng: ri, spin: 40, bone: base, sink: 0 });
}
// hanging basket blooms
bloom({ cx: BAS[0], cz: BAS[2], y: BAS[1] + 0.13, w: 0.3, d: 0.3 }, 91, 9, [FL_PINK, FL_BLUE, FL_WHITE, FL_TULIP], 0.26);
trailing(BAS[0] - 0.12, BAS[0] + 0.12, BAS[1] + 0.12, BAS[2] + 0.15, 4, 12);
trailing(BAS[0] - 0.12, BAS[0] + 0.12, BAS[1] + 0.12, BAS[2] - 0.15, 4, 13);

// floating dandelion seeds drifting by the lamp
b.cards(
  [frame([-0.9, 1.3, 0.55], [0, 1, 0]), frame([-0.2, 2.0, 0.4], [0, 1, 0]), frame([-1.9, 2.5, 0.1], [0, 1, 0])],
  SEED,
  { size: 0.14, lean: 0, flow: [0, 0, 1], cross: true, bone: base, sink: 0 },
);


// ---------------------------------------------------------------------------------------------------------------
// 7. Back of the house: lit windows, a plain door, barrel and crates
{
  const bz = WALL_B;
  for (const wx of [-1.25, 0.5]) {
    b.extrude(arch(0.7, 0.96, 8), { at: [wx, 1.3, bz + 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.06, bevel: 0.008, color: CREAM, bone: base });
    b.extrude(arch(0.54, 0.8, 8), { at: [wx, 1.38, bz - 0.015], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: TEAL_DK, bone: base });
    glow(plane(0.44, 0.66, WINDOW_GLASS, [wx, 1.77, bz - 0.036], [0, 0, -1]), 1.2);
    box(0.022, 0.66, 0.022, TEAL_DK, [wx, 1.77, bz - 0.045]);
    box(0.44, 0.022, 0.022, TEAL_DK, [wx, 1.72, bz - 0.045]);
    box(0.44, 0.022, 0.022, TEAL_DK, [wx, 1.56, bz - 0.045]);
    box(0.06, 0.06, 0.03, GOLD, [wx, 2.34, bz], [0, 0, 45]);
    box(0.8, 0.06, 0.26, STONE, [wx, 1.3, bz - 0.1]);
    const top = woodBox({ cx: wx, cz: bz - 0.1, y0: 1.33, w: 0.64, d: 0.18, h: 0.14, base: WOOD_DKG, panel: K("#b27346"), edge: GOLD, trim: TEAL });
    bloom({ cx: wx, cz: bz - 0.1, y: top, w: 0.64, d: 0.18 }, 90 + Math.round(wx * 10), 8, MIX, 0.26);
  }
  const dx = -0.4;
  b.extrude(arch(0.86, 1.68, 8), { at: [dx, SW, bz + 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.08, bevel: 0.01, color: STONE, bone: base });
  b.extrude(arch(0.66, 1.54, 8), { at: [dx, SW, bz - 0.02], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.006, color: WOOD_DKG, bone: base });
  for (const v of [0.3, 0.96]) box(0.62, 0.035, 0.012, NAVY, [dx, SW + v, bz - 0.05]);
  for (const v of [0.3, 0.96]) for (const s of [-1, 1]) ball(0.017, GOLD, [dx + s * 0.29, SW + v, bz - 0.056], undefined, base, 5);
  ball(0.035, GOLD, [dx + 0.22, SW + 0.78, bz - 0.07]);
  box(0.07, 0.07, 0.03, GOLD, [dx, SW + 1.7, bz - 0.03], [0, 0, 45]);
  box(0.9, 0.1, 0.36, STONE, [dx, SW + 0.05, bz - 0.2]);
  // lantern over the door
  rod([dx, SW + 1.95, bz - 0.02], [dx, SW + 1.95, bz - 0.2], 0.012, GOLD, 5);
  glow(cyl(0.055, 0.045, 0.13, 6, GLASS, [dx, SW + 1.86, bz - 0.2]), 1.4);
  cyl(0.0, 0.075, 0.07, 6, TEAL, [dx, SW + 1.965, bz - 0.2]);
  ball(0.014, GOLD, [dx, SW + 2.01, bz - 0.2], undefined, base, 5);
  // rain barrel under a downspout
  const brx = 0.72;
  const brz = bz - 0.22;
  lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.19, 0.12],
      [0.2, 0.25],
      [0.19, 0.38],
      [0.15, 0.5],
      [0, 0.5],
    ],
    [brx, SW, brz],
    WOOD_Y,
    10,
  );
  for (const [yy, rr] of [[0.08, 0.17], [0.25, 0.205], [0.42, 0.175]] as const) ring(rr, 0.012, NAVY, [brx, SW + yy, brz]);
  cyl(0.14, 0.14, 0.012, 10, TEAL_LT, [brx, SW + 0.49, brz]);
  rod([brx, 2.55, bz - 0.04], [brx, SW + 0.62, brz + 0.04], 0.026, NAVY, 6);
  // crates with apples and a sack
  const kx = -1.3;
  const kz = bz - 0.25;
  const crate = planterPaint(kx, SW, 0.3, 0.17, WOOD_DKG, K("#c28850"), GOLD);
  box(0.38, 0.3, 0.32, crate, [kx, SW + 0.15, kz]);
  box(0.42, 0.03, 0.36, WOOD_LT, [kx, SW + 0.3, kz]);
  box(0.3, 0.24, 0.27, crate, [kx + 0.02, SW + 0.45, kz], [0, 18, 0]);
  for (const [ax, az] of [[-0.08, -0.05], [0.06, -0.07], [0.0, 0.05], [0.1, 0.04], [-0.07, 0.07]] as const)
    stamp(RED, SPH, [kx + ax, SW + 0.6, kz + az], [0, 0, 0], [0.04, 0.038, 0.04]);
  b.part(new THREE.SphereGeometry(0.15, 8, 6), K("#e8d9a8", "#b8a77e"), { bone: base, at: [kx + 0.5, SW + 0.11, kz + 0.02], scale: [1, 0.8, 0.9] });
  ball(0.05, K("#e8d9a8", "#b8a77e"), [kx + 0.5, SW + 0.23, kz + 0.02], [1, 0.6, 1]);
  ring(0.05, 0.01, TEAL, [kx + 0.5, SW + 0.2, kz + 0.02]);
}
// ---------------------------------------------------------------------------------------------------------------
// 8. Handcart full of flowers, parked on the side street
{
  const cx = 1.45;
  const cz = -1.5;
  const by = ST + 0.38;
  const wy = ST + 0.2;
  for (const s of [-1, 1]) {
    const wx = cx + s * 0.3;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), WOOD, { bone: base, at: [wx, wy, cz], rotation: [0, 0, 90] });
    ring(0.2, 0.014, NAVY, [wx, wy, cz], base, [0, 90, 0]);
    cyl(0.045, 0.045, 0.08, 8, GOLD, [wx + s * 0.02, wy, cz], base, [0, 0, 90]);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 4;
      rod([wx + s * 0.026, wy - Math.cos(a) * 0.19, cz - Math.sin(a) * 0.19], [wx + s * 0.026, wy + Math.cos(a) * 0.19, cz + Math.sin(a) * 0.19], 0.011, WOOD_DK, 5);
    }
  }
  rod([cx - 0.3, wy, cz], [cx + 0.3, wy, cz], 0.016, NAVY, 5);
  box(0.54, 0.05, 0.84, WOOD, [cx, by, cz]);
  const side = planterPaint(cz, by, 0.2, 0.28, WOOD_DKG, K("#c28850"), GOLD, true);
  for (const s of [-1, 1]) {
    box(0.035, 0.2, 0.84, side, [cx + s * 0.2775, by + 0.1, cz]);
    rod([cx + s * 0.2775, by + 0.2, cz - 0.42], [cx + s * 0.2775, by + 0.2, cz + 0.42], 0.014, GOLD, 5);
    rod([cx + s * 0.2, by + 0.04, cz + 0.42], [cx + s * 0.2, ST + 0.2, cz + 1.05], 0.016, WOOD_DK, 5);
    ball(0.026, GOLD, [cx + s * 0.2, ST + 0.2, cz + 1.05], undefined, base, 5);
    rod([cx + s * 0.2, ST + 0.22, cz + 0.93], [cx + s * 0.2, ST, cz + 0.93], 0.012, WOOD_DK, 5);
    box(0.04, 0.06, 0.02, GOLD, [cx + s * 0.2, by + 0.03, cz + 0.425]);
  }
  for (const s of [-1, 1]) box(0.54, 0.2, 0.035, WOOD_DKG, [cx, by + 0.1, cz + s * 0.4125]);
  box(0.5, 0.02, 0.8, SOIL, [cx, by + 0.15, cz]);
  bloom({ cx, cz, y: by + 0.16, w: 0.5, d: 0.8 }, 111, 18, MIX, 0.32);
}

flush();
export default function build() {
  return b.root;
}
