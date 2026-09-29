// Bunny Bakery Island, in pixel art. A floating island about 1.2 m across that rests on the floor on its rocky
// underside: a tiny bunny-run bakery in a giant red mushroom-cap cottage (round sunburst door left ajar, glowing arched
// windows, a chimney puffing pixel smoke, a striped serving-hatch awning, a chalkboard sign), a stepping-stone path,
// a fenced carrot patch, a stone-rimmed pond with a frog and a waterfall over the edge, flower beds, a blossom tree
// with a swing, a bench, a cart of loaves and cakes, lanterns, a mailbox, pebbles and bushes. Three chubby bunnies (one
// carrying a baguette, one watering flowers, one peeking from the door) and a sleeping cat on the roof are rigged on
// one skeleton with the scenery on its root joint; the island edge shows dirt and stone strata with dangling roots.
// Style: post-Minecraft low-poly. One texel (TEXEL, 7 mm) everywhere: every bunny, cat, plank, window, sign, bread and
// flower is a hand-placed `svg()` pixel drawing (8x8..48x24) rasterised 1:1, wrapped onto boxes as Minecraft-style
// skin sheets or cropped on whole-pixel steps; every round surface (island strata, mushroom cap, stones, bark,
// leaves, water, cakes) is a paint quantised into square hard-edged TEXEL cells. Volumes are boxes, 6-10 sided
// lathes, faceted blobs and stepped slabs.
import * as THREE from "three";
import type { BufferGeometry, Texture } from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { paint } from "../src/paint";
import { polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Bunny Bakery Island",
  builtBy: "Claude Sonnet 5.5",
  description:
    "Pixel-art floating island: a bunny bakery in a red mushroom-cap cottage with a chimney, awning and round door, carrot patch, pond with frog and waterfall, blossom tree with swing, bread cart, three chubby bunnies and a sleeping cat.",
};

type V3 = [number, number, number];
type Grid = string[][];
type Pal = Record<string, string>;

const WHITE = "#ffffff";

/** One pixel, in meters. Every texture texel and every paint cell of the whole scene is this size. */
const T = 0.007;
/** Height of the grass on the island top. */
const G = 0.34;
/** Cottage centre (x, z), the flat-to-centre radius of its octagonal wall, and the wall height. */
const C: [number, number] = [-0.06, -0.13];
const WALL_A = 0.217;
const WALL_R = WALL_A / Math.cos(Math.PI / 8);
const WALL_H = 0.27;
const CAP_Y = G + WALL_H;
const CAP_TOP = CAP_Y + 0.196;

// Flat colours (everything else is a texture or a paint).
const ROOT_A = "#8a5a36";
const ROOT_B = "#6a4126";
const SMOKE_A = "#ffffff";
const SMOKE_B = "#f1f5fb";
const SMOKE_C = "#dfe7f3";
const IRON = "#3b3f4a";
const GOLD = "#f7c84a";
const BRASS = "#d9a23a";
const ROPE = "#ead6a4";
const MAIL = "#e8524f";
const MAIL_DK = "#b93a3c";
const FROG = "#78c957";
const FROG_DK = "#4ea540";
const FROG_LT = "#d9f2a4";
const EYE_DK = "#2d1b2e";
const PINK = "#ff9db8";
const CHERRY = "#e8344c";
const DROP = "#9fe0ff";
const CAN = "#7db7e8";
const CAN_DK = "#548fcf";
const CRYSTAL_A = "#ff8fd0";
const CRYSTAL_B = "#83e6ff";
const PETAL = "#ffc8dc";
const BRICK_CAP = "#a9503c";
const WICKER = "#d9a45c";
const WICKER_DK = "#a8743a";
const CARROT = "#ff9a3c";
const LEAF_GREEN = "#5fb04a";
const CREAM = "#fff3dc";
const LOAF_DARK = "#b56a2c";
const LOAF_MID = "#d98d3f";
const LOAF_LIGHT = "#f2b565";
const STRAW = "#f2d16b";
const STRAW_DK = "#d9b24a";
const MINT = "#82d9bd";
const MINT_DK = "#5cbb9e";
const BOW = "#ff7fa5";
const APRON_DOT = "#ffb3c8";

// ---------------------------------------------------------------------------------------------------------------
// Small tools.

const hash = (x: number, y: number, z: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** The paint cell index of a coordinate. The offset keeps faces that sit exactly on a cell edge from flickering. */
const cell = (v: number) => Math.floor(v / T + 0.37);

const px = (x: number, y: number, z: number): V3 => [x * T, y * T, z * T];

/** Euler XYZ (degrees) as a quaternion. */
const quat = (rx = 0, ry = 0, rz = 0) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG));

/** A local frame at a point on the island turned `yaw` degrees about Y (0 faces +Z, +90 faces +X). */
class Loc {
  readonly q: THREE.Quaternion;

  constructor(
    readonly o: V3,
    yaw: number,
  ) {
    this.q = quat(0, yaw, 0);
  }

  p(v: V3): V3 {
    const r = new THREE.Vector3(...v).applyQuaternion(this.q);
    return [this.o[0] + r.x, this.o[1] + r.y, this.o[2] + r.z];
  }

  d(v: V3): V3 {
    const r = new THREE.Vector3(...v).applyQuaternion(this.q);
    return [r.x, r.y, r.z];
  }

  /** The frame's orientation, then a local Euler turn (degrees). */
  turned(rx = 0, ry = 0, rz = 0) {
    return this.q.clone().multiply(quat(rx, ry, rz));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures.

const blank = (w: number, h: number): Grid => Array.from({ length: h }, () => Array<string>(w).fill(""));

/** A pixel grid (colour strings, "" clear) as an `svg()` drawing: one rect per horizontal run, rasterised 1:1. */
function pixels(g: Grid): Texture {
  const h = g.length;
  const w = g[0].length;
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = g[y][x];
      let n = 1;
      while (x + n < w && g[y][x + n] === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

/** Rows drawn as strings, one character per pixel ('.' clear), coloured from a palette. */
const draw = (rows: string[], pal: Pal): Grid =>
  rows.map((r) => r.split("").map((c) => (c === "." ? "" : pal[c] || "")));

/** A sprite for cards: padded at the top so its longest side is at least 8 pixels (the smallest `svg()` raster). */
function sprite(rows: string[], pal: Pal) {
  const g = draw(rows, pal);
  const w = g[0].length;
  while (g.length < 8 || w < 1) g.unshift(Array<string>(w).fill(""));
  return { tex: pixels(g), w, h: g.length };
}

type Face = "px" | "nx" | "py" | "ny" | "pz" | "nz";
const FACES: Face[] = ["px", "nx", "py", "ny", "pz", "nz"];

/**
 * A skin sheet: the unwrapped faces of several boxes (Minecraft layout) packed on one small pixel grid. Every box
 * gets its own cells; `paint` fills them face by face, `box` returns a BoxGeometry whose UVs read them, so a box of
 * any size in whole pixels keeps square texels.
 */
class Sheet {
  readonly cells: Record<string, { x: number; y: number; w: number; h: number; d: number }> = {};
  readonly grid: Grid;
  private cached: Texture | null = null;

  readonly width: number;

  constructor(width: number, specs: Record<string, V3>) {
    this.width = Math.max(width, ...Object.values(specs).map(([w, , d]) => 2 * (w + d)));
    let x = 0;
    let y = 0;
    let shelf = 0;
    for (const [name, [w, h, d]] of Object.entries(specs)) {
      const cw = 2 * (w + d);
      if (x + cw > this.width) {
        x = 0;
        y += shelf;
        shelf = 0;
      }
      this.cells[name] = { x, y, w, h, d };
      x += cw;
      shelf = Math.max(shelf, d + h);
    }
    this.grid = blank(this.width, Math.max(8, y + shelf));
  }

  /** The face's rectangle on the sheet: [x, y, w, h], y down. */
  rect(name: string, face: Face): [number, number, number, number] {
    const { x, y, w, h, d } = this.cells[name];
    switch (face) {
      case "py":
        return [x + d, y, w, d];
      case "ny":
        return [x + d + w, y, w, d];
      case "nx":
        return [x, y + d, d, h];
      case "pz":
        return [x + d, y + d, w, h];
      case "px":
        return [x + d + w, y + d, d, h];
      case "nz":
        return [x + 2 * d + w, y + d, w, h];
    }
  }

  /** Fill every face pixel from `fn(face, u, v, w, h)`; return "" or undefined to leave a pixel as it is. */
  paint(name: string, fn: (face: Face, u: number, v: number, w: number, h: number) => string | undefined) {
    for (const face of FACES) {
      const [rx, ry, rw, rh] = this.rect(name, face);
      for (let v = 0; v < rh; v++)
        for (let u = 0; u < rw; u++) {
          const c = fn(face, u, v, rw, rh);
          if (c) this.grid[ry + v][rx + u] = c;
        }
    }
  }

  /** Draw rows of a palette onto one face ('.' leaves the pixel). */
  draw(name: string, face: Face, rows: string[], pal: Pal, at: [number, number] = [0, 0]) {
    const [rx, ry] = this.rect(name, face);
    rows.forEach((row, v) =>
      row.split("").forEach((ch, u) => {
        if (ch !== "." && pal[ch] && this.grid[ry + v + at[1]]) this.grid[ry + v + at[1]][rx + u + at[0]] = pal[ch];
      }),
    );
  }

  set(name: string, face: Face, u: number, v: number, color: string) {
    const [rx, ry] = this.rect(name, face);
    this.grid[ry + v][rx + u] = color;
  }

  /** Copy a pixel grid onto one face of a box's cells, top-left corner first. */
  blit(name: string, face: Face, g: Grid) {
    const [rx, ry] = this.rect(name, face);
    g.forEach((row, v) => row.forEach((c, u) => c && (this.grid[ry + v][rx + u] = c)));
  }

  get texture() {
    return (this.cached ??= pixels(this.grid));
  }

  /** The box's geometry, in pixels times TEXEL unless `size` (meters) stretches it. */
  box(name: string, size?: V3) {
    const { w, h, d } = this.cells[name];
    const geo = new THREE.BoxGeometry(...(size ?? px(w, h, d)));
    const uv = geo.getAttribute("uv");
    const H = this.grid.length;
    FACES.forEach((face, f) => {
      const [rx, ry, rw, rh] = this.rect(name, face);
      const corners: [number, number][] = [
        [0, 1],
        [1, 1],
        [0, 0],
        [1, 0],
      ];
      corners.forEach(([u, v], i) => uv.setXY(f * 4 + i, (rx + u * rw) / this.width, 1 - (ry + (1 - v) * rh) / H));
    });
    return geo;
  }
}

/** Wood boards: `S`x`S`, boards `plank` pixels tall, lit top row, shaded bottom row, grain dashes, butt joints, nails. */
type WoodPal = { light: string; mid: string; dark: string; seam: string; nail: string };
const WOOD: WoodPal = { light: "#e9b878", mid: "#d49a5c", dark: "#bd8148", seam: "#8d5a33", nail: "#5e3d24" };
const WOOD_WHITE: WoodPal = { light: "#ffffff", mid: "#fdf1e0", dark: "#eddcc4", seam: "#c9b08f", nail: "#a08a6c" };
const WOOD_MINT: WoodPal = { light: "#b9f2de", mid: "#93e0c4", dark: "#6fc7a9", seam: "#3f9c80", nail: "#2c6f5a" };
const WOOD_DARK: WoodPal = { light: "#b98254", mid: "#9a6a42", dark: "#82552f", seam: "#573620", nail: "#33200f" };

function woodGrid(pal: WoodPal, seed: number, vertical: boolean, S = 32, plank = 8): Grid {
  const r = rng(seed);
  const g = blank(S, S);
  for (let by = 0; by < S / plank; by++) {
    const y0 = by * plank;
    const joint = 5 + Math.floor(r() * (S - 10));
    for (let y = 0; y < plank; y++)
      for (let x = 0; x < S; x++) {
        let c = pal.mid;
        if (y === 0) c = pal.light;
        else if (y === plank - 1) c = pal.seam;
        else if (y === plank - 2) c = pal.dark;
        else {
          const q = r();
          c = q < 0.14 ? pal.dark : q > 0.9 ? pal.light : pal.mid;
        }
        g[y0 + y][x] = c;
      }
    for (let k = 0; k < 3; k++) {
      const gy = y0 + 2 + Math.floor(r() * (plank - 4));
      const gx = Math.floor(r() * S);
      for (let i = 0; i < 3 + Math.floor(r() * 6); i++) g[gy][(gx + i) % S] = pal.dark;
    }
    for (let y = 1; y < plank; y++) g[y0 + y][joint] = pal.seam;
    g[y0 + 2][(joint + 2) % S] = pal.nail;
    g[y0 + plank - 3][(joint + S - 2) % S] = pal.nail;
  }
  return vertical ? g[0].map((_, x) => g.map((row) => row[x])) : g;
}

/** A box whose faces show whole-pixel crops of one square tile, so a plank of any size keeps square texels. */
function cropBox(w: number, h: number, d: number, size: number, rand: () => number) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.getAttribute("uv");
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  faces.forEach(([fw, fh], f) => {
    const nu = Math.min(size, Math.max(1, Math.round(fw / T)));
    const nv = Math.min(size, Math.max(1, Math.round(fh / T)));
    const u0 = Math.floor(rand() * (size - nu + 1)) / size;
    const v0 = Math.floor(rand() * (size - nv + 1)) / size;
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, u0 + uv.getX(k) * (nu / size), v0 + uv.getY(k) * (nv / size));
    }
  });
  return geo;
}

/** Point every uv of the first `count` vertices at one texel, so a cylinder's rim takes one flat colour of a texture. */
function pinUV(geo: BufferGeometry, count: number, u: number, v: number) {
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < count; i++) uv.setXY(i, u, v);
}

/** Round sunburst door leaf, 20x20: an iron rim, eight radial planks, an iron boss with a brass button. */
function doorLeafTexture() {
  const S = 20;
  const g = blank(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - S / 2;
      const dy = y + 0.5 - S / 2;
      const d = Math.hypot(dx, dy);
      if (d > 10) continue;
      let c: string;
      if (d > 8.6) c = (x + y) % 4 === 0 ? "#8a6a52" : "#5e4436";
      else if (d < 1.6) c = "#f7c84a";
      else if (d < 3) c = "#5e4436";
      else {
        const a = ((Math.atan2(dy, dx) / (Math.PI * 2)) * 8 + 8) % 8;
        const k = Math.floor(a);
        const edge = Math.min(a - k, 1 - (a - k)) * d * ((Math.PI * 2) / 8) < 0.55;
        c = edge ? "#7d4b26" : k % 2 === 0 ? "#cf9256" : "#bd7f45";
        if (!edge && (x * 7 + y * 3) % 11 === 0) c = "#e6b57a";
      }
      g[y][x] = c;
    }
  return pixels(g);
}

/** The frame ring round the door, 24x24: alternating stones, a dark warm interior lit by a few candle pixels. */
function doorFrameTexture() {
  const S = 24;
  const g = blank(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - S / 2;
      const dy = y + 0.5 - S / 2;
      const d = Math.hypot(dx, dy);
      if (d > 12) continue;
      if (d > 10) {
        const k = Math.floor(((Math.atan2(dy, dx) / (Math.PI * 2)) * 16 + 16) % 16);
        g[y][x] = d > 11 ? (k % 2 ? "#cbaa80" : "#b8926a") : "#8a6242";
      } else g[y][x] = y > 15 ? "#5a3343" : hash(x, y, 0, 3) < 0.05 ? "#ffcf7a" : "#3b2130";
    }
  return pixels(g);
}

/** A glowing window: wood frame, warm gradient glass, muntins, pink curtain corners. `arch` rounds the top. */
function windowTexture(w: number, h: number, arch: number, muntin: boolean, curtains: boolean) {
  const g = blank(w, h);
  const inside = (x: number, y: number) => {
    if (y >= arch) return true;
    const dx = Math.max(arch - 0.5 - x, x - (w - arch - 0.5), 0);
    const dy = arch - 0.5 - y;
    return Math.hypot(dx, dy) <= arch;
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge) {
        g[y][x] = y < h / 2 ? "#e2b07a" : "#a8703f";
        continue;
      }
      const t = y / h;
      let c = t < 0.35 ? "#fff0b8" : t < 0.7 ? "#ffdc7a" : "#ffc15a";
      if (hash(x, y, 1, 5) < 0.06) c = "#ffffff";
      g[y][x] = c;
    }
  if (muntin) {
    const cx = Math.floor(w / 2);
    for (let y = 0; y < h; y++) if (g[y][cx] && inside(cx - 1, y) && inside(cx + 1, y) && y > 0) g[y][cx] = "#c98a52";
    const cy = Math.floor(h * 0.62);
    for (let x = 1; x < w - 1; x++) if (g[cy][x]) g[cy][x] = "#c98a52";
  }
  if (curtains)
    for (let y = 1; y < Math.min(6, h); y++)
      for (let x = 1; x < w - 1; x++) {
        if (!g[y][x] || g[y][x] === "#c98a52") continue;
        if (x - 1 < 5 - y || w - 2 - x < 5 - y) g[y][x] = y % 2 ? "#ff9fb8" : "#ff86a5";
      }
  return pixels(g);
}

function windowGrid(w: number, h: number): Grid {
  const g = blank(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) g[y][x] = y < h / 2 ? "#e2b07a" : "#a8703f";
      else {
        const t = y / h;
        g[y][x] = t < 0.4 ? "#fff0b8" : t < 0.75 ? "#ffdc7a" : "#ffc15a";
        if (hash(x, y, 2, 6) < 0.05) g[y][x] = "#ffffff";
      }
    }
  return g;
}

function mergeGrid(base: Grid, over: Grid): Grid {
  return base.map((row, y) => row.map((c, x) => over[y]?.[x] || c));
}

/** Whitewashed / coloured wood variants, cached. */
const woodCache = new Map<string, Texture>();
function woodTexture(name: string, pal: WoodPal, seed: number, vertical: boolean) {
  const key = `${name}${seed}${vertical}`;
  let tex = woodCache.get(key);
  if (!tex) woodCache.set(key, (tex = pixels(woodGrid(pal, seed, vertical))));
  return tex;
}

/** Brick tile, 16x16: staggered courses of three-pixel bricks with pale mortar. */
function brickTexture() {
  const g = blank(16, 16);
  const cols = ["#c9634a", "#b5523c", "#d97a5a", "#a94a37"];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const row = Math.floor(y / 4);
      const off = row % 2 ? 4 : 0;
      const mortar = y % 4 === 3 || (x + off) % 8 === 7;
      const id = Math.floor((x + off) / 8) + row * 3;
      g[y][x] = mortar ? "#f0dcc4" : cols[Math.floor(hash(id, row, 0, 4) * 4)];
      if (!mortar && y % 4 === 0) g[y][x] = "#e08a68";
    }
  return pixels(g);
}

/** Chalkboard, 19x24: wood frame, slate, chalk lettering BUNS, a carrot, a heart, dashes and stars. */
function chalkGrid(): Grid {
  const W = 19;
  const H = 24;
  const g = blank(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      g[y][x] = edge ? "#b8763f" : x === 1 || y === 1 || x === W - 2 || y === H - 2 ? "#7a4a28" : "#2f4f4a";
      if (!edge && hash(x, y, 3, 7) < 0.05 && x > 1 && y > 1 && x < W - 2 && y < H - 2) g[y][x] = "#3b615b";
    }
  const font: Record<string, string[]> = {
    B: ["110", "101", "110", "101", "110"],
    U: ["101", "101", "101", "101", "111"],
    N: ["101", "111", "111", "101", "101"],
    S: ["011", "100", "010", "001", "110"],
  };
  "BUNS"
    .split("")
    .forEach((ch, i) =>
      font[ch].forEach((row, y) => row.split("").forEach((c, x) => c === "1" && (g[3 + y][2 + i * 4 + x] = "#fff6e6"))),
    );
  for (let x = 3; x < 16; x += 2) g[10][x] = "#ffb3c8";
  const carrot = draw(
    ["....gGg....", "...gGgGg...", "....ooo....", "....oOo....", ".....oo....", ".....oo....", "......o...."].slice(
      0,
      7,
    ),
    { g: "#7fd86a", G: "#5fb04a", o: "#ff9a3c", O: "#ffb35a" },
  );
  carrot.forEach((row, y) => row.forEach((c, x) => c && (g[13 + y][2 + x] = c)));
  const heart = draw([".p.p.", "ppppp", "ppppp", ".ppp.", "..p.."], { p: "#ff8fb0" });
  heart.forEach((row, y) => row.forEach((c, x) => c && (g[14 + y][12 + x] = c)));
  for (const [x, y] of [
    [13, 12],
    [16, 19],
    [3, 21],
    [10, 21],
  ])
    g[y][x] = "#fff6e6";
  return g;
}

/** Scalloped awning stripes: `n` pixels per stripe, coral and cream. */
const STRIPE_A = "#f0525a";
const STRIPE_B = "#fff1dc";

/** Loaf icon on a hanging sign: a bunny-eared bun. */
const SIGN_ROWS = [
  "dddddddddddddd",
  "dwwwwwwwwwwwwd",
  "dwwwBBwwBBwwwd",
  "dwwBLLBBLLBwwd",
  "dwwBLBBBBLBwwd",
  "dwBBBBBBBBBBwd",
  "dwBBeBBBBeBBwd",
  "dwBBBBnnBBBBwd",
  "dwwBBBBBBBBwwd",
  "dwwwBBBBBBwwwd",
  "dwwwwwwwwwwwwd",
  "dddddddddddddd",
];

// Flowers and other card sprites: bottom edge on the ground.
const FLOWER_KINDS: [string, string][] = [
  ["#ff6f8f", "#ffb3c6"],
  ["#ffd54a", "#fff0a0"],
  ["#b28cff", "#dccbff"],
  ["#ff9a4a", "#ffd0a0"],
];
function tulip(petal: string, light: string) {
  return sprite([".p.p.", "pPppp", "ppppp", ".ppp.", "..g..", ".gg..", "..gg.", "..g.."], {
    p: petal,
    P: light,
    g: "#5fb04a",
  });
}
function daisy(petal: string, center: string) {
  return sprite([".www.", "wwcww", "wcccw", "wwcww", ".www.", "..g..", ".gg..", "..g.."], {
    w: petal,
    c: center,
    g: "#5fb04a",
  });
}
function bell(petal: string, light: string) {
  return sprite(["..p..", ".pPp.", "..p.p", ".pPp.", "..p..", ".gg..", "..g..", "..g.."], {
    p: petal,
    P: light,
    g: "#5fb04a",
  });
}
const TUFT = sprite([".g...g.", ".gg.gg.", "gGgGgGg", "gGgGgGg"], { g: "#6bc44f", G: "#4ea540" });
const CARROT_TOP = sprite(["g..g...g.", ".gGg.gGg.", ".gGgGgGg.", "..gGGGg..", "..ooOoo..", "...ooo..."], {
  g: "#67c94f",
  G: "#3f9a3a",
  o: CARROT,
  O: "#ffb45a",
});
const CATTAIL = sprite([".b.", ".b.", ".b.", ".B.", ".b.", ".g.", ".g.", "gg."], {
  b: "#7a4a28",
  B: "#9a6234",
  g: "#5fb04a",
});
const ZZZ = sprite(["ZZZZ", "..Z.", ".Z..", "ZZZZ"], { Z: "#dbe8ff" });

// ---------------------------------------------------------------------------------------------------------------
// Paints: square TEXEL cells, small palettes, two clump scales, no gradients.

function vox(palette: string[], seed: number, clump = 3) {
  return paint((p) => {
    const x = cell(p.x);
    const y = cell(p.y);
    const z = cell(p.z);
    const c = hash(Math.floor(x / clump), Math.floor(y / clump), Math.floor(z / clump), seed + 7);
    const v = c * 0.55 + hash(x, y, z, seed) * 0.45;
    return palette[Math.min(palette.length - 1, Math.floor(v * palette.length))];
  });
}

const STONE = vox(["#b8bcc8", "#a4a9b8", "#9096a6", "#7d8394"], 3);
const STONE_PATH = vox(["#d5d0c8", "#c4beb5", "#b3ada6", "#a19b95"], 5, 2);
const BARK = paint((p) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  const stripe = hash(x + z, 0, 0, 9);
  const v = stripe * 0.6 + hash(x, y, z, 2) * 0.4;
  return v < 0.3 ? "#6b4229" : v < 0.65 ? "#845433" : v < 0.9 ? "#9b6641" : "#b47b50";
});
const BLOSSOM = paint((p) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  const v = hash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 12) * 0.6 + hash(x, y, z, 13) * 0.4;
  if (hash(x, y, z, 14) > 0.965) return "#ffffff";
  if (hash(x, y, z, 15) > 0.97) return "#6bbf55";
  return v < 0.28 ? "#f27fa9" : v < 0.55 ? "#ff9cc0" : v < 0.85 ? "#ffb9d3" : "#ffd6e5";
});
const LEAF = paint((p) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  const v = hash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 22) * 0.6 + hash(x, y, z, 23) * 0.4;
  if (hash(x, y, z, 24) > 0.985) return "#ff7fa8";
  return v < 0.3 ? "#3f9a45" : v < 0.6 ? "#54b04d" : v < 0.85 ? "#6ec95a" : "#8ee06c";
});
const SOIL = paint((p) => {
  const x = cell(p.x);
  const z = cell(p.z);
  if (x % 4 === 0) return hash(x, z, 0, 2) < 0.5 ? "#5a3a26" : "#65432b";
  return hash(x, z, 1, 3) < 0.15 ? "#946043" : hash(x, z, 2, 4) < 0.5 ? "#7a4f34" : "#86583b";
});
const WATER = paint((p) => {
  const x = cell(p.x);
  const z = cell(p.z);
  const v = hash(Math.floor(x / 2), Math.floor(z / 2), 4, 31) * 0.6 + hash(x, z, 5, 32) * 0.4;
  if (hash(x, z, 6, 33) > 0.94) return "#e6fbff";
  return v < 0.35 ? "#4fb2e0" : v < 0.7 ? "#66c5ec" : "#86d6f4";
});
const PAD = (cx: number, cz: number, notch: number) =>
  paint((p) => {
    const dx = p.x - cx;
    const dz = p.z - cz;
    const a = ((Math.atan2(dx, dz) / DEG - notch + 540) % 360) - 180;
    if (Math.abs(a) < 14 && Math.hypot(dx, dz) > 0.006) return "#66c5ec";
    const x = cell(p.x);
    const z = cell(p.z);
    return hash(x, z, 8, 41) < 0.2 ? "#4fa63f" : hash(x, z, 9, 42) < 0.5 ? "#6cc455" : "#82d668";
  });
const CRUST = paint((p, n) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  const v = hash(x, y, z, 51);
  if (n.y > 0.5 && (x + z) % 5 === 0 && v > 0.15) return LOAF_LIGHT;
  return n.y > 0.5 ? (v < 0.3 ? LOAF_MID : v < 0.75 ? "#e0a04c" : LOAF_LIGHT) : v < 0.4 ? LOAF_DARK : LOAF_MID;
});
const cake = (topY: number, frost: string, frostDk: string, sponge: string) =>
  paint((p, n) => {
    const x = cell(p.x);
    const z = cell(p.z);
    const y = cell(p.y);
    const drip = 1 + Math.floor(hash(x, z, 1, 61) * 3);
    if (n.y > 0.5) return hash(x, z, 2, 62) < 0.2 ? frostDk : frost;
    if (topY - p.y < drip * T) return hash(x, y, z, 63) < 0.25 ? frostDk : frost;
    return hash(x, y, z, 64) < 0.2 ? "#e8b978" : sponge;
  });
const MUSHROOM_SPOTS = paint((p, n) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  if (n.y < -0.5) return "#f7e2b8";
  const dot = hash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 71) > 0.72;
  const v = hash(x, y, z, 72);
  return dot ? "#fff4de" : v < 0.3 ? "#d94148" : v < 0.7 ? "#e5535a" : "#ef6a70";
});
const STEM = paint((p, n) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  if (n.y > 0.5) return "#f1dfbb";
  const v = hash(x, y, z, 81);
  // A timber beam under the cap and a post at every corner of the octagon.
  const wood = v < 0.3 ? "#b57a45" : v < 0.75 ? "#c98a52" : "#d99a5e";
  if (p.y > G + WALL_H - 0.022) return wood;
  const az = Math.atan2((x - 0.37 + 0.5) * T - C[0], (z - 0.37 + 0.5) * T - C[1]) / DEG;
  const a = (az + 360 + 22.5) % 45;
  if (Math.min(a, 45 - a) * DEG * WALL_R < 0.0105) return wood;
  return v < 0.08 ? "#efd9ae" : v < 0.8 ? "#fff1d6" : "#fffaea";
});
const SMOKE = paint((p) => {
  const v = hash(cell(p.x), cell(p.y), cell(p.z), 91);
  return v < 0.25 ? SMOKE_C : v < 0.55 ? SMOKE_B : SMOKE_A;
});

// ---------------------------------------------------------------------------------------------------------------
// Geometry.

/** Move a geometry to `at` after turning it (Euler degrees, XYZ) about its own origin. */
function put(geo: BufferGeometry, at: V3, rot: V3 = [0, 0, 0], scale: V3 = [1, 1, 1]) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...at), quat(...rot), new THREE.Vector3(...scale));
  geo.applyMatrix4(m);
  return geo;
}

/** Move a geometry to `at` after turning it by a quaternion about its own origin. */
function putQ(geo: BufferGeometry, at: V3, q: THREE.Quaternion) {
  geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), q, new THREE.Vector3(1, 1, 1)));
  return geo;
}

/** Many geometries as one (flat-shaded, unindexed), for one part. */
function merge(list: BufferGeometry[]) {
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const t = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(t ? t.getX(i) : 0, t ? t.getY(i) : 0);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return out;
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const faceted = (geo: BufferGeometry) => {
  const flat = geo.index ? geo.toNonIndexed() : geo;
  flat.computeVertexNormals();
  return flat;
};
/** A faceted blob: a 20-face icosahedron squashed to an ellipsoid. */
const blob = (r: number, sy = 0.8) => faceted(new THREE.IcosahedronGeometry(r, 0).scale(1, sy, 1));

/** Ray from the origin along azimuth `a` (degrees from +Z toward +X): the distance to a polygon of [x, z]. */
function rayHit(poly: [number, number][], a: number, from: [number, number] = [0, 0]) {
  const dx = Math.sin(a * DEG);
  const dz = Math.cos(a * DEG);
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    const ex = x2 - x1;
    const ez = z2 - z1;
    const den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = ((x1 - from[0]) * ez - (z1 - from[1]) * ex) / den;
    const s = ((x1 - from[0]) * dz - (z1 - from[1]) * dx) / den;
    if (t > 0 && s >= 0 && s <= 1) best = Math.min(best, t);
  }
  return best;
}

/** An island tier's outline as [x, z] points with a lumpy radius. */
function tierPolygon(radius: number, jitter: number, seed: number, n = 18): [number, number][] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.12;
    const rad = radius * (1 - jitter + 2 * jitter * r());
    return [Math.sin(a) * rad, Math.cos(a) * rad] as [number, number];
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The island's own paints (strata, grass, path) and the cap.

/** The stepping-stone path from the door to the front edge, [x, z]. */
const PATH: [number, number][] = [
  [-0.06, 0.125],
  [-0.075, 0.2],
  [-0.05, 0.28],
  [-0.045, 0.36],
  [-0.085, 0.44],
  [-0.11, 0.52],
];

function distToPath(x: number, z: number) {
  let best = Infinity;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [x1, z1] = PATH[i];
    const [x2, z2] = PATH[i + 1];
    const ex = x2 - x1;
    const ez = z2 - z1;
    const t = Math.max(0, Math.min(1, ((x - x1) * ex + (z - z1) * ez) / (ex * ex + ez * ez)));
    best = Math.min(best, Math.hypot(x - x1 - ex * t, z - z1 - ez * t));
  }
  return best;
}

const GRASS = ["#86d264", "#79c95a", "#8fdb6c", "#70c052"];
const PATH_DIRT = ["#ecd3a0", "#e0c18a", "#d3b078"];
const DIRT_A = ["#c98b5e", "#b97a50", "#a86a44"];
const DIRT_B = ["#8e5a3c", "#7d4d33", "#6d4230"];
const SAND = ["#ecd3a0", "#dfc088", "#d1b078"];
const ROCK_LT = ["#c6cad8", "#b3b8c8", "#a1a7ba"];
const RUST = ["#c08a70", "#ae765e", "#9a6450"];
const ROCK = ["#9aa0b2", "#868da0", "#757c90"];
const ROCK_DK = ["#7a8194", "#6b7286", "#5d6478"];

const pick = (palette: string[], v: number) => palette[Math.min(palette.length - 1, Math.floor(v * palette.length))];

function grassTop(x: number, z: number, px_: number, pz: number) {
  const d = distToPath(px_, pz);
  const v = hash(Math.floor(x / 3), Math.floor(z / 3), 1, 11) * 0.55 + hash(x, z, 2, 12) * 0.45;
  if (d < 0.034 || (d < 0.044 && hash(x, z, 3, 13) < 0.5))
    return hash(x, z, 4, 14) > 0.93 ? "#f7ead0" : pick(PATH_DIRT, hash(x, z, 5, 15) * 0.6 + v * 0.4);
  const q = hash(x, z, 6, 16);
  if (q > 0.955) return "#a9ec83";
  if (q < 0.045) return "#5cae44";
  if (hash(x, z, 7, 17) > 0.993) return q < 0.5 ? "#fff6d6" : "#ffb8d6";
  return pick(GRASS, v);
}

/** Dirt over stone strata, wavy by a texel or two, with a grass fringe on top and rare gem and gold flecks. */
function strata(x: number, y: number, z: number, py: number) {
  const wob = (hash(Math.floor(x / 2), 0, Math.floor(z / 2), 5) - 0.5) * 2 * T * 1.4;
  const yy = py + wob;
  const v = hash(x, y, z, 6);
  const clump = hash(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), 8);
  const mix = v * 0.5 + clump * 0.5;
  if (G - py < (1.2 + hash(x, 0, z, 7) * 2.6) * T) return v < 0.3 ? "#57a83f" : v < 0.7 ? "#6cc04c" : "#80d25a";
  if (yy < 0.2 && v > 0.992) return v > 0.996 ? "#83e6ff" : "#ffd23a";
  if (yy > 0.2 && v > 0.96) return v > 0.982 ? "#f2e6cf" : "#e6d3b0";
  if (yy > 0.24) return pick(DIRT_A, mix);
  if (yy > 0.2) return pick(DIRT_B, mix);
  if (yy > 0.178) return pick(SAND, mix);
  if (yy > 0.14) return pick(ROCK_LT, mix);
  if (yy > 0.11) return pick(RUST, mix);
  if (yy > 0.075) return pick(ROCK, mix);
  return pick(ROCK_DK, mix);
}

const ISLAND = paint((p, n) => {
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  if (n.y > 0.6) {
    if (p.y > G - 0.004) return grassTop(x, z, p.x, p.z);
    if (p.y > 0.2 && hash(x, z, 9, 21) < 0.55) return hash(x, z, 10, 22) < 0.5 ? "#5eb047" : "#74c655";
    return strata(x, y, z, p.y);
  }
  if (n.y < -0.6) {
    const v = hash(x, y, z, 23) * 0.5 + hash(Math.floor(x / 2), Math.floor(z / 2), 1, 24) * 0.5;
    return p.y > 0.17 ? pick(["#6d4230", "#5c3828", "#7d4d33"], v) : pick(["#4d5360", "#565c6c", "#434958"], v);
  }
  return strata(x, y, z, p.y);
});

/** The mushroom cap outline: [radius, height above the wall top]. */
const CAP: [number, number][] = [
  [0, 0],
  [0.33, 0],
  [0.36, 0.03],
  [0.352, 0.07],
  [0.31, 0.118],
  [0.24, 0.158],
  [0.14, 0.186],
  [0.1, 0.195],
  [0, 0.196],
];

function capHeight(r: number) {
  for (let i = 2; i < CAP.length - 1; i++) {
    const [r0, y0] = CAP[i];
    const [r1, y1] = CAP[i + 1];
    if (r <= r0 && r >= r1) return y0 + ((y1 - y0) * (r0 - r)) / (r0 - r1);
  }
  return CAP[CAP.length - 1][1];
}

/** Cap spots: [radius from the cap axis, azimuth degrees, spot radius]. */
const SPOT_DEFS: [number, number, number][] = [
  [0.13, 20, 0.04],
  [0.14, 100, 0.045],
  [0.15, 190, 0.04],
  [0.13, 280, 0.05],
  [0.24, 55, 0.046],
  [0.25, 132, 0.04],
  [0.24, 215, 0.05],
  [0.26, 300, 0.04],
  [0.235, 350, 0.038],
  [0.325, 22, 0.032],
  [0.315, 88, 0.034],
  [0.32, 160, 0.03],
  [0.32, 240, 0.034],
  [0.315, 322, 0.03],
];
const CAP_SPOTS = SPOT_DEFS.map(([r, az, s]) => ({
  x: C[0] + r * Math.sin(az * DEG),
  y: CAP_Y + capHeight(r),
  z: C[1] + r * Math.cos(az * DEG),
  s,
}));

const CAP_PAINT = paint((p, n) => {
  const cx = (cell(p.x) - 0.37 + 0.5) * T;
  const cy = (cell(p.y) - 0.37 + 0.5) * T;
  const cz = (cell(p.z) - 0.37 + 0.5) * T;
  if (n.y < -0.5) {
    const a = Math.atan2(cx - C[0], cz - C[1]) / DEG;
    const rr = Math.hypot(cx - C[0], cz - C[1]);
    if (rr > 0.318) return "#e6c08a";
    return Math.floor((a + 360) / 9) % 2 ? "#f2d6a6" : "#fbe8c4";
  }
  for (const s of CAP_SPOTS) {
    const d = Math.hypot(cx - s.x, cy - s.y, cz - s.z);
    if (d < s.s) return d > s.s - T ? "#f6dcc0" : "#fff4de";
  }
  const x = cell(p.x);
  const y = cell(p.y);
  const z = cell(p.z);
  const v = hash(Math.floor(x / 3), Math.floor(y / 3), Math.floor(z / 3), 31) * 0.5 + hash(x, y, z, 32) * 0.5;
  if (n.y > 0.7 && hash(x, y, z, 33) > 0.95) return "#f78a8e";
  return v < 0.3 ? "#cf3f4b" : v < 0.65 ? "#e0505a" : "#ec6169";
});

// ---------------------------------------------------------------------------------------------------------------

type Variant = "nat" | "dark" | "white" | "mint";
const WOODS: Record<Variant, WoodPal> = { nat: WOOD, dark: WOOD_DARK, white: WOOD_WHITE, mint: WOOD_MINT };

type BunnyPal = { fur: string; shade: string; light: string; inner: string; blush: string; nose: string; eye: string };

type BunnySpec = {
  name: string;
  at: V3;
  yaw: number;
  pal: BunnyPal;
  seed: number;
  /** Head pitch (nose down), yaw and roll, degrees. */
  head: V3;
  ears: "up" | "lop";
  splay: number;
  /** Paw targets in local pixels; the shoulders sit at (+-5, 11.5, 0). */
  pawL: V3;
  pawR: V3;
};

const sub = (a: V3, c: V3): V3 => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const add = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const unit = (a: V3): V3 => scl(a, 1 / Math.hypot(...a));
const mid = (a: V3, c: V3): V3 => scl(add(a, c), 0.5);

export default function build() {
  const b = createBuilder({ name: "bunnyBakeryIsland", paintSize: 2048 });
  const rand = rng(17);
  const root = b.joint("root", { at: [0, G, 0], dir: [0, 1, 0] });
  /** Scenery: rigid on the root, geometry already in model space. */
  const fixed = (geo: BufferGeometry, fill: Fill, o: { group?: string; name?: string; texture?: Texture } = {}) =>
    b.part(geo, fill, { bone: root, at: [0, 0, 0], ...o });
  /** Things standing on the grass, [x, z, radius], that flowers and pebbles keep clear of. */
  const occupied: [number, number, number][] = [];
  const hold = (x: number, z: number, r: number) => occupied.push([x, z, r]);
  /** Everything wooden is boxes cropped from a plank tile; each variant and grain direction is flushed as one part. */
  const batches: Record<string, BufferGeometry[]> = {};
  const wood = (variant: Variant, vertical: boolean, w: number, h: number, d: number, at: V3, rot: V3 = [0, 0, 0]) => {
    (batches[`${variant}${vertical ? "V" : "H"}`] ??= []).push(put(cropBox(w, h, d, 32, rand), at, rot));
  };

  // -------------------------------------------------------------------------------------------- island body
  const TIERS: [number, number, number, number, number][] = [
    [0.31, G, 1.0, 0.035, 1],
    [0.262, 0.31, 0.965, 0.05, 2],
    [0.215, 0.262, 0.92, 0.06, 3],
    [0.17, 0.215, 0.86, 0.07, 4],
    [0.125, 0.17, 0.77, 0.08, 5],
    [0.085, 0.125, 0.65, 0.09, 6],
    [0.05, 0.085, 0.5, 0.1, 7],
    [0.02, 0.05, 0.34, 0.1, 8],
  ];
  const polys = TIERS.map(([, , s, j, seed]) => tierPolygon(0.63 * s, j, seed));
  TIERS.forEach(([y0, y1], i) =>
    b.extrude(
      polys[i].map(([x, z]): [number, number] => [x, -z]),
      {
        at: [0, (y0 + y1) / 2, 0],
        x: [1, 0, 0],
        y: [0, 0, -1],
        thickness: y1 - y0,
        color: ISLAND,
        bone: root,
        group: "island",
      },
    ),
  );
  const edge = (a: number) => rayHit(polys[0], a);
  const onIsland = (x: number, z: number, margin: number) => Math.hypot(x, z) + margin <= edge(Math.atan2(x, z) / DEG);

  // Rocky feet: three of them touch the floor.
  for (const [x, z, r, h] of [
    [0, 0, 0.1, 0.05],
    [0.14, 0.07, 0.05, 0.05],
    [-0.11, -0.12, 0.045, 0.048],
  ])
    b.lathe(
      [
        [0, 0],
        [r * 0.55, 0],
        [r, h * 0.55],
        [r * 0.85, h + 0.012],
        [0, h + 0.012],
      ],
      { at: [x, 0, z], segments: 6, color: ISLAND, bone: root, group: "island" },
    );
  // Stalactite spikes hanging under the ledges.
  for (const [a, tier, len] of [
    [-150, 4, 0.07],
    [-100, 4, 0.055],
    [-40, 4, 0.06],
    [15, 5, 0.05],
    [70, 4, 0.065],
    [130, 5, 0.05],
    [175, 4, 0.06],
  ]) {
    const y0 = TIERS[tier][0];
    const rr = rayHit(polys[tier], a) * 0.86;
    b.lathe(
      [
        [0, -len],
        [0.018, 0],
        [0.018, 0.01],
        [0, 0.01],
      ],
      {
        at: [Math.sin(a * DEG) * rr, y0, Math.cos(a * DEG) * rr],
        segments: 5,
        color: ISLAND,
        bone: root,
        group: "island",
      },
    );
  }
  // Boulders and crystals set into the strata.
  const boulders: BufferGeometry[] = [];
  for (const [a, tier, r, dy] of [
    [-125, 2, 0.045, 0.02],
    [-70, 2, 0.038, -0.01],
    [-15, 3, 0.04, 0.0],
    [95, 2, 0.05, 0.01],
    [150, 2, 0.04, -0.005],
    [200, 3, 0.036, 0.0],
  ]) {
    const rr = rayHit(polys[tier], a);
    boulders.push(
      put(
        blob(r, 0.75),
        [
          Math.sin(a * DEG) * (rr - r * 0.2),
          (TIERS[tier][0] + TIERS[tier][1]) / 2 + dy,
          Math.cos(a * DEG) * (rr - r * 0.2),
        ],
        [0, a * 3, 0],
      ),
    );
  }
  fixed(merge(boulders), STONE, { group: "island" });
  const crystalGeo = (r: number, h: number) =>
    faceted(
      new THREE.LatheGeometry([new THREE.Vector2(r, 0), new THREE.Vector2(r, h * 0.6), new THREE.Vector2(0, h)], 6),
    );
  for (const [a, tier, col, tilt] of [
    [-92, 2, CRYSTAL_A, 62],
    [-48, 1, CRYSTAL_B, 55],
    [112, 2, CRYSTAL_B, 60],
    [168, 3, CRYSTAL_A, 58],
  ] as [number, number, string, number][]) {
    const rr = rayHit(polys[tier], a);
    const y = (TIERS[tier][0] + TIERS[tier][1]) / 2;
    const out: V3 = [Math.sin(a * DEG), 0, Math.cos(a * DEG)];
    for (const [k, len] of [
      [0, 0.06],
      [1, 0.04],
    ]) {
      const dir: V3 = [
        out[0] * Math.sin(tilt * DEG) + (k ? 0.25 : 0),
        Math.cos(tilt * DEG) * (k ? 0.5 : 1),
        out[2] * Math.sin(tilt * DEG),
      ];
      b.part(crystalGeo(k ? 0.011 : 0.015, len), col, {
        bone: root,
        at: [
          out[0] * (rr - 0.012) + (k ? 0.012 : 0) * out[2],
          y + (k ? -0.02 : 0),
          out[2] * (rr - 0.012) - (k ? 0.012 : 0) * out[0],
        ],
        dir,
        group: "island",
      });
    }
  }
  // Dangling roots: pixel-stepped strands hanging from the overhanging ledges.
  const AW = 48; // azimuth of the pond and waterfall
  const rootsA: BufferGeometry[] = [];
  const rootsB: BufferGeometry[] = [];
  const strand = (x: number, y: number, z: number, steps: number, seed: number) => {
    const r = rng(seed);
    let cx = x;
    let cy = y;
    for (let i = 0; i < steps; i++) {
      const h = 1 + Math.floor(r() * 3);
      (i % 3 === 0 ? rootsB : rootsA).push(put(box(T, h * T, T), [cx, cy - (h * T) / 2, z]));
      cy -= h * T;
      if (r() < 0.32) {
        cx += (r() < 0.5 ? -1 : 1) * T;
        rootsA.push(put(box(T, T, T), [cx, cy + T / 2, z]));
      }
      if (i === Math.floor(steps / 2) && r() < 0.8) {
        const dir = r() < 0.5 ? -1 : 1;
        for (let k = 1; k < 5; k++)
          rootsB.push(put(box(T, T, T), [cx + dir * k * T, cy - Math.floor(k / 2) * T, z + (r() - 0.5) * T]));
      }
    }
  };
  [-160, -128, -104, -76, -52, -22, 0, 22, 84, 110, 138, 162, 188, 206].forEach((a, i) => {
    if (Math.abs(a - AW) < 14) return;
    const tier = i % 2 === 0 ? 1 : 2;
    const rr = rayHit(polys[tier], a) - 0.004;
    strand(Math.sin(a * DEG) * rr, TIERS[tier][0], Math.cos(a * DEG) * rr, 4 + Math.floor(rand() * 5), 300 + i);
  });
  fixed(merge(rootsA), ROOT_A, { group: "roots" });
  fixed(merge(rootsB), ROOT_B, { group: "roots" });

  // -------------------------------------------------------------------------------------------- cottage
  const [cx, cz] = C;
  const wallPt = (phi: number, out: number, y: number): V3 => [
    cx + (WALL_A + out) * Math.sin(phi * DEG),
    G + y,
    cz + (WALL_A + out) * Math.cos(phi * DEG),
  ];
  const facing = (phi: number): V3 => [Math.sin(phi * DEG), 0, Math.cos(phi * DEG)];
  const decal = (tex: Texture, wpx: number, hpx: number, at: V3, phi: number) =>
    b.part(new THREE.PlaneGeometry(wpx * T, hpx * T), WHITE, {
      texture: tex,
      bone: root,
      at,
      dir: facing(phi),
      axis: "z",
      up: [0, 1, 0],
      group: "cottage",
    });

  b.lathe(
    [
      [0, 0],
      [WALL_R + 0.018, 0],
      [WALL_R + 0.018, 0.03],
      [0, 0.03],
    ],
    { at: [cx, G, cz], segments: 8, spin: 22.5, color: STONE, bone: root, group: "cottage" },
  );
  b.lathe(
    [
      [0, 0],
      [WALL_R, 0],
      [WALL_R, WALL_H],
      [0, WALL_H],
    ],
    { at: [cx, G, cz], segments: 8, spin: 22.5, color: STEM, bone: root, group: "cottage" },
  );
  b.lathe(CAP, { at: [cx, CAP_Y, cz], segments: 10, color: CAP_PAINT, bone: root, group: "cottage" });
  hold(cx, cz, 0.24);

  // Round door: a stone frame with a dark warm interior, and the sunburst leaf swung open on its left hinge.
  const doorY = 0.004 + 12 * T;
  decal(doorFrameTexture(), 24, 24, wallPt(0, 0.003, doorY), 0);
  const OPEN = 100;
  const hinge: V3 = [cx - 0.068, G + doorY, cz + WALL_A + 0.01];
  const leafCenter: V3 = [hinge[0] + 0.068 * Math.cos(OPEN * DEG), hinge[1], hinge[2] + 0.068 * Math.sin(OPEN * DEG)];
  const leafNormal: V3 = [-Math.sin(OPEN * DEG), 0, Math.cos(OPEN * DEG)];
  const leafGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.012, 16);
  pinUV(leafGeo, 34, 0.475, 0.975);
  b.part(leafGeo, WHITE, { texture: doorLeafTexture(), bone: root, at: leafCenter, dir: leafNormal, group: "cottage" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), BRASS, {
    bone: root,
    at: [
      leafCenter[0] - leafNormal[0] * 0.009 + 0.04 * Math.cos(OPEN * DEG),
      leafCenter[1] - 0.004,
      leafCenter[2] - leafNormal[2] * 0.009 + 0.04 * Math.sin(OPEN * DEG),
    ],
    group: "cottage",
  });
  // Doorstep and mat.
  fixed(put(box(0.15, 0.008, 0.05), [cx, G + 0.004, cz + WALL_A + 0.025]), STONE_PATH, { group: "cottage" });
  const mat = new Sheet(16, { mat: [14, 1, 7] });
  mat.paint("mat", (face, u, v) =>
    face === "py" ? (u % 4 < 2 ? "#ff9db8" : "#fff3dc") : v % 2 ? "#e07a98" : "#f7e0c8",
  );
  fixed(mat.box("mat"), WHITE, { texture: mat.texture, group: "cottage" }).mesh.position.set(0, 0, 0);

  // Shop sign above the door.
  const sign = new Sheet(16, { sign: [14, 12, 2] });
  sign.paint("sign", () => "#a8703f");
  for (const face of ["pz", "nz"] as Face[])
    sign.draw("sign", face, SIGN_ROWS, {
      d: "#8d5a33",
      w: "#f2d8a0",
      B: "#d98d3f",
      L: "#f2b565",
      e: EYE_DK,
      n: "#e0526e",
    });
  b.part(sign.box("sign"), WHITE, { texture: sign.texture, bone: root, at: wallPt(0, 0.008, 0.222), group: "cottage" });
  // Windows: two arched ones flanking, side and back ones, and a porthole in the cap.
  const arch = windowTexture(12, 16, 5, true, true);
  const round = windowTexture(12, 12, 6, true, false);
  decal(arch, 12, 16, wallPt(-45, 0.003, 0.17), -45);
  for (const phi of [-90, 90, -135, 135, 180]) decal(arch, 12, 16, wallPt(phi, 0.003, 0.16), phi);
  const hatch = new Sheet(18, {});
  const hatchGrid = mergeGrid(
    windowGrid(18, 12),
    draw(
      [
        "..................",
        "..................",
        "..................",
        "..................",
        "..................",
        "...bb....cc...bb..",
        "..bBBb..cCCc.bBBb.",
        ".bBLLBbcCLLCcBLLBb",
        "ssssssssssssssssss",
        "..................",
        "..................",
        "..................",
      ],
      { b: "#a9612a", B: "#d98d3f", L: "#f2b565", c: "#a9612a", C: "#d98d3f", s: "#8d5a33" },
    ),
  );
  void hatch;
  decal(pixels(hatchGrid), 18, 12, wallPt(45, 0.003, 0.13), 45);
  {
    const a = 0; // porthole on the front slope of the cap
    const r = 0.33;
    const y = CAP_Y + capHeight(r) + 0.004;
    const slope = Math.atan2(capHeight(0.31) - capHeight(0.352), 0.352 - 0.31);
    const nrm: V3 = [Math.sin(a * DEG) * Math.sin(slope), Math.cos(slope), Math.cos(a * DEG) * Math.sin(slope)];
    b.part(new THREE.PlaneGeometry(12 * T, 12 * T), WHITE, {
      texture: round,
      bone: root,
      at: [
        cx + r * Math.sin(a * DEG) + nrm[0] * 0.004,
        y + nrm[1] * 0.004,
        cz + r * Math.cos(a * DEG) + nrm[2] * 0.004,
      ],
      dir: nrm,
      axis: "z",
      up: [0, 1, 0],
      group: "cottage",
    });
  }
  // Serving hatch: counter shelf, striped awning with a scalloped fringe.
  {
    const phi = 45;
    const n = facing(phi);
    const q = quat(0, phi, 0);
    fixed(put(box(0.17, 0.012, 0.05), add(wallPt(phi, 0.024, 0.086), [0, 0, 0]), [0, phi, 0]), STONE_PATH, {
      group: "cottage",
    });
    const awn = new Sheet(32, { awn: [26, 2, 17], fringe: [26, 4, 1] });
    awn.paint("awn", (face, u) =>
      face === "py" || face === "ny" ? (Math.floor(u / 3) % 2 ? STRIPE_B : STRIPE_A) : STRIPE_A,
    );
    awn.paint("fringe", (face, u, v, _w, h) => {
      const s = Math.floor(u / 3) % 2 ? STRIPE_B : STRIPE_A;
      if (face !== "pz" && face !== "nz") return undefined;
      if (v < h - 1) return s;
      return u % 3 === 1 ? s : "";
    });
    const pitch = 20;
    const L2 = 17 * T;
    const back = wallPt(phi, 0.004, 0.2);
    const rot = q.clone().multiply(quat(pitch, 0, 0));
    const toward = new THREE.Vector3(0, 0, L2 / 2).applyQuaternion(rot);
    b.part(awn.box("awn"), WHITE, {
      texture: awn.texture,
      bone: root,
      at: [back[0] + toward.x, back[1] + toward.y + T, back[2] + toward.z],
      quat: rot,
      group: "cottage",
    });
    const frontEdge = new THREE.Vector3(...back).add(new THREE.Vector3(0, 0, L2).applyQuaternion(rot));
    b.part(awn.box("fringe"), WHITE, {
      texture: awn.texture,
      bone: root,
      at: [frontEdge.x + n[0] * 0.001, frontEdge.y - 2 * T + T, frontEdge.z + n[2] * 0.001],
      quat: q,
      group: "cottage",
    });
    // Little pastries on the counter.
    const pastry: BufferGeometry[] = [];
    for (const [k, s] of [
      [-0.05, 0.016],
      [-0.015, 0.02],
      [0.025, 0.017],
      [0.058, 0.014],
    ])
      pastry.push(
        put(new THREE.CylinderGeometry(s, s * 1.15, s * 0.7, 8), add(wallPt(phi, 0.03, 0.098), [0, 0, 0]), [
          0,
          phi,
          0,
        ]).translate(...(new THREE.Vector3(k, 0, 0).applyQuaternion(q).toArray() as V3)),
      );
    fixed(merge(pastry), CRUST, { group: "cottage" });
  }
  // Window box under the left window.
  {
    const phi = -45;
    wood("nat", false, 0.11, 0.028, 0.03, wallPt(phi, 0.02, 0.09), [0, phi, 0]);
    hold(cx - 0.21, cz + 0.06, 0.06);
  }

  // Chimney, with a brick cap and pixel smoke.
  {
    const r = 0.15;
    const az = 150;
    const px_ = cx + r * Math.sin(az * DEG);
    const pz_ = cz + r * Math.cos(az * DEG);
    const ybase = CAP_Y + capHeight(r) - 0.036;
    const h = 0.142;
    b.part(cropBox(0.05, h, 0.05, 16, rand), WHITE, {
      texture: brickTexture(),
      bone: root,
      at: [px_, ybase + h / 2, pz_],
      group: "chimney",
    });
    b.part(box(0.062, 0.014, 0.062), BRICK_CAP, { bone: root, at: [px_, ybase + h + 0.007, pz_], group: "chimney" });
    b.part(box(0.034, 0.003, 0.034), IRON, { bone: root, at: [px_, ybase + h + 0.0145, pz_], group: "chimney" });
    const puffs: BufferGeometry[] = [];
    [
      [0.035, 0.03],
      [0.075, 0.038],
      [0.12, 0.046],
      [0.17, 0.056],
    ].forEach(([dy, s], i) => {
      const o: V3 = [px_ + i * 0.018 + 0.006, ybase + h + dy, pz_ - i * 0.012];
      puffs.push(
        put(box(s, s * 0.8, s), o),
        put(box(s * 0.7, s * 0.6, s * 0.7), [o[0] + s * 0.55, o[1] - s * 0.1, o[2] + s * 0.1]),
        put(box(s * 0.65, s * 0.6, s * 0.65), [o[0] - s * 0.5, o[1] - s * 0.15, o[2] - s * 0.1]),
        put(box(s * 0.6, s * 0.5, s * 0.6), [o[0] + s * 0.1, o[1] + s * 0.5, o[2]]),
      );
    });
    fixed(merge(puffs), SMOKE, { group: "chimney" });
  }

  // -------------------------------------------------------------------------------------------- path and pond
  {
    const stones: BufferGeometry[] = [];
    PATH.forEach(([x, z], i) => {
      const r = 0.034 + 0.006 * hash(i, 0, 0, 3);
      stones.push(
        put(new THREE.CylinderGeometry(r, r * 1.08, 0.012, 6), [x, G + 0.004, z], [0, hash(i, 1, 0, 4) * 60, 0]),
      );
      const a = hash(i, 2, 0, 5) * Math.PI * 2;
      stones.push(
        put(new THREE.CylinderGeometry(0.011, 0.012, 0.008, 5), [
          x + Math.cos(a) * 0.05,
          G + 0.002,
          z + Math.sin(a) * 0.05,
        ]),
      );
      hold(x, z, 0.05);
    });
    fixed(merge(stones), STONE_PATH, { group: "path" });
  }

  const PD = 0.48;
  const P: [number, number] = [Math.sin(AW * DEG) * PD, Math.cos(AW * DEG) * PD];
  hold(P[0], P[1], 0.15);
  const fallR = Math.max(edge(AW), rayHit(polys[1], AW), rayHit(polys[2], AW), rayHit(polys[3], AW)) + 0.012;
  {
    const rim: BufferGeometry[] = [];
    for (let k = 1; k < 8; k++) {
      const a = AW + k * 45;
      const o: [number, number] = [Math.sin(a * DEG), Math.cos(a * DEG)];
      rim.push(put(box(0.078, 0.024, 0.04), [P[0] + o[0] * 0.118, G + 0.011, P[1] + o[1] * 0.118], [0, a, 0]));
      if (k % 2)
        rim.push(put(box(0.03, 0.012, 0.028), [P[0] + o[0] * 0.122, G + 0.03, P[1] + o[1] * 0.122], [0, a + 15, 0]));
    }
    fixed(merge(rim), STONE, { group: "pond" });
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.1, 0.016],
        [0, 0.016],
      ],
      { at: [P[0], G, P[1]], segments: 8, spin: 22.5, color: WATER, bone: root, group: "pond" },
    );
    // The channel to the lip and the waterfall over the edge.
    const c0 = PD + 0.06;
    const len = fallR - c0;
    const rc = c0 + len / 2;
    fixed(
      put(box(0.05, 0.008, len), [Math.sin(AW * DEG) * rc, G + 0.004, Math.cos(AW * DEG) * rc], [0, AW, 0]),
      WATER,
      { group: "pond" },
    );
    const FALL = 42;
    const fall = new Sheet(24, { fall: [7, FALL, 2] });
    const cols = ["#7fd3f5", "#5bbbea", "#a6e6fb", "#5bbbea", "#7fd3f5", "#4aa8dd"];
    fall.paint("fall", (_f, u, v, _w, h) => {
      if (v < 2) return "#e6fbff";
      if (v > h - 5) return hash(u, v, 1, 7) < 0.55 ? "#ffffff" : "#bfeeff";
      const streak = hash(u, Math.floor(v / 3), 2, 8);
      if (hash(u, v, 3, 9) > 0.93) return "#ffffff";
      return streak < 0.25 ? "#a6e6fb" : cols[u % cols.length];
    });
    b.part(fall.box("fall"), WHITE, {
      texture: fall.texture,
      bone: root,
      at: [Math.sin(AW * DEG) * (fallR - 0.002), G + 0.008 - (FALL * T) / 2, Math.cos(AW * DEG) * (fallR - 0.002)],
      quat: quat(0, AW, 0),
      group: "pond",
    });
    const bottom = G + 0.008 - FALL * T;
    const mist: BufferGeometry[] = [];
    const drops: BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const s = 0.018 + hash(i, 0, 0, 1) * 0.016;
      const off: V3 = [
        (hash(i, 1, 0, 2) - 0.5) * 0.06,
        (hash(i, 2, 0, 3) - 0.3) * 0.02,
        (hash(i, 3, 0, 4) - 0.3) * 0.04,
      ];
      const rr = fallR + 0.008 + off[2];
      const tang: V3 = [Math.cos(AW * DEG), 0, -Math.sin(AW * DEG)];
      mist.push(
        put(box(s, s * 0.8, s), [
          Math.sin(AW * DEG) * rr + tang[0] * off[0],
          bottom + 0.004 + off[1],
          Math.cos(AW * DEG) * rr + tang[2] * off[0],
        ]),
      );
    }
    for (let i = 0; i < 7; i++) {
      const rr = fallR + 0.012 + hash(i, 4, 0, 5) * 0.02;
      const t = (hash(i, 5, 0, 6) - 0.5) * 0.05;
      drops.push(
        put(box(0.006, 0.006, 0.006), [
          Math.sin(AW * DEG) * rr + Math.cos(AW * DEG) * t,
          bottom - 0.005 - i * 0.0065,
          Math.cos(AW * DEG) * rr - Math.sin(AW * DEG) * t,
        ]),
      );
    }
    fixed(merge(mist), SMOKE, { group: "pond" });
    fixed(merge(drops), DROP, { group: "pond" });
  }
  // Lily pads, a lotus, a frog and cattails.
  {
    const pad1: [number, number] = [P[0] - 0.035, P[1] + 0.022];
    const pad2: [number, number] = [P[0] + 0.03, P[1] - 0.038];
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 6), PAD(pad1[0], pad1[1], 200), {
      bone: root,
      at: [pad1[0], G + 0.018, pad1[1]],
      group: "pond",
    });
    b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.004, 6), PAD(pad2[0], pad2[1], 30), {
      bone: root,
      at: [pad2[0], G + 0.018, pad2[1]],
      group: "pond",
    });
    const lotus = faceted(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.001, 0),
          new THREE.Vector2(0.014, 0.006),
          new THREE.Vector2(0.013, 0.016),
          new THREE.Vector2(0.004, 0.022),
          new THREE.Vector2(0.001, 0.014),
        ],
        6,
      ),
    );
    b.part(lotus, PINK, { bone: root, at: [pad2[0], G + 0.02, pad2[1]], group: "pond" });
    b.part(box(0.006, 0.006, 0.006), STRAW, { bone: root, at: [pad2[0], G + 0.028, pad2[1]], group: "pond" });
    const f = new Loc([pad1[0], G + 0.02, pad1[1]], 25);
    const fr = (list: BufferGeometry[], w: number, h: number, d: number, p: V3) =>
      list.push(put(box(w, h, d), f.p(p), [0, 25, 0]));
    const g1: BufferGeometry[] = [];
    const g2: BufferGeometry[] = [];
    const g3: BufferGeometry[] = [];
    const g4: BufferGeometry[] = [];
    fr(g1, 0.022, 0.013, 0.024, [0, 0.0075, -0.002]);
    fr(g1, 0.02, 0.01, 0.014, [0, 0.011, 0.012]);
    for (const s of [1, -1]) {
      fr(g1, 0.008, 0.008, 0.008, [s * 0.006, 0.018, 0.011]);
      fr(g4, 0.004, 0.004, 0.003, [s * 0.006, 0.019, 0.0155]);
      fr(g2, 0.007, 0.009, 0.017, [s * 0.013, 0.006, -0.006]);
      fr(g2, 0.005, 0.008, 0.005, [s * 0.008, 0.004, 0.016]);
    }
    fr(g3, 0.014, 0.004, 0.005, [0, 0.008, 0.0195]);
    fixed(merge(g1), FROG, { group: "frog" });
    fixed(merge(g2), FROG_DK, { group: "frog" });
    fixed(merge(g3), FROG_LT, { group: "frog" });
    fixed(merge(g4), EYE_DK, { group: "frog" });
    const reeds = [AW + 165, AW + 195, AW + 140].map((a) =>
      frame([P[0] + Math.sin(a * DEG) * 0.13, G + 0.002, P[1] + Math.cos(a * DEG) * 0.13], [0, 1, 0]),
    );
    b.cards(reeds, CATTAIL.tex, {
      size: [0.028, 0.085],
      cross: true,
      vary: 0.2,
      spin: 30,
      rng: rng(5),
      bone: root,
      group: "pond",
    });
  }

  // -------------------------------------------------------------------------------------------- carrot patch
  const FX0 = -0.46;
  const FX1 = -0.26;
  const FZ0 = 0.2;
  const FZ1 = 0.35;
  hold(-0.36, 0.275, 0.14);
  {
    const fenceRun = (x0: number, z0: number, x1: number, z1: number, gap?: [number, number]) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const alongZ = Math.abs(z1 - z0) > Math.abs(x1 - x0);
      const n = Math.floor(len / 0.022);
      const out = alongZ ? (x0 < -0.36 ? -1 : 1) : z0 < 0.275 ? -1 : 1;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = x0 + (x1 - x0) * t;
        const z = z0 + (z1 - z0) * t;
        if (gap && (alongZ ? z : x) > gap[0] && (alongZ ? z : x) < gap[1]) continue;
        const o: V3 = alongZ ? [x + out * 0.005, G + 0.026, z] : [x, G + 0.026, z + out * 0.005];
        wood("white", true, 0.013, 0.052, 0.007, o, [0, alongZ ? 90 : 0, 0]);
        const cone = new THREE.ConeGeometry(0.0095, 0.011, 4);
        put(cone, [o[0], G + 0.0575, o[2]], [0, 45 + (alongZ ? 90 : 0), 0]);
        pinUV(cone, cone.getAttribute("uv").count, 0.5, 0.48);
        (batches.whiteV ??= []).push(cone);
      }
      const cxm = (x0 + x1) / 2;
      const czm = (z0 + z1) / 2;
      for (const y of [0.016, 0.036]) {
        if (gap) {
          const a0 = alongZ ? z0 : x0;
          const a1 = alongZ ? z1 : x1;
          for (const [s0, s1] of [
            [a0, gap[0]],
            [gap[1], a1],
          ]) {
            const m = (s0 + s1) / 2;
            wood(
              "white",
              false,
              alongZ ? 0.006 : Math.abs(s1 - s0),
              0.008,
              alongZ ? Math.abs(s1 - s0) : 0.006,
              alongZ ? [cxm, G + y, m] : [m, G + y, czm],
            );
          }
        } else wood("white", false, alongZ ? 0.006 : len, 0.008, alongZ ? len : 0.006, [cxm, G + y, czm]);
      }
    };
    fenceRun(FX0, FZ0, FX1, FZ0);
    fenceRun(FX0, FZ1, FX1, FZ1, [-0.335, -0.285]);
    fenceRun(FX0, FZ0, FX0, FZ1);
    fenceRun(FX1, FZ0, FX1, FZ1);
    for (const [x, z] of [
      [FX0, FZ0],
      [FX1, FZ0],
      [FX0, FZ1],
      [FX1, FZ1],
      [-0.36, FZ0],
      [FX0, 0.275],
      [FX1, 0.275],
      [-0.338, FZ1],
      [-0.283, FZ1],
    ]) {
      wood("white", true, 0.018, 0.07, 0.018, [x, G + 0.035, z]);
      wood("white", false, 0.024, 0.008, 0.024, [x, G + 0.073, z]);
    }
    b.part(box(0.192, 0.014, 0.144), SOIL, { bone: root, at: [-0.36, G + 0.007, 0.275], group: "garden" });
    const rows: Frame[] = [];
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 4; j++) {
        if ((i === 4 && j === 3) || (i === 3 && j === 3)) continue;
        rows.push(frame([-0.44 + i * 0.04 + (hash(i, j, 0, 1) - 0.5) * 0.008, G + 0.012, 0.23 + j * 0.033], [0, 1, 0]));
      }
    b.cards(rows, CARROT_TOP.tex, {
      size: [0.048, 0.042],
      cross: true,
      vary: 0.18,
      spin: 25,
      rng: rng(9),
      bone: root,
      group: "garden",
    });
    // A basket of carrots by the gate and two pulled ones on the grass.
    b.part(box(0.042, 0.03, 0.042), WICKER, { bone: root, at: [-0.31, G + 0.015, 0.395], group: "garden" });
    b.part(box(0.046, 0.006, 0.046), WICKER_DK, { bone: root, at: [-0.31, G + 0.03, 0.395], group: "garden" });
    const carrots: BufferGeometry[] = [];
    const tops: BufferGeometry[] = [];
    [
      [-0.008, 0.006, 14, 10],
      [0.008, -0.004, -12, 4],
      [0.0, -0.01, 4, -16],
      [0.004, 0.01, -6, 14],
    ].forEach(([dx, dz, rx, rz], i) => {
      const o: V3 = [-0.31 + dx, G + 0.04, 0.395 + dz];
      carrots.push(put(new THREE.ConeGeometry(0.008, 0.048, 5), o, [180 + rx, i * 40, rz]));
      tops.push(put(box(0.004, 0.022, 0.004), [o[0] + rz * 0.0007, o[1] + 0.028, o[2] - rx * 0.0007], [rx, 0, rz]));
    });
    for (const [x, z, yaw] of [
      [-0.27, 0.41, 30],
      [-0.35, 0.425, -20],
    ]) {
      carrots.push(put(new THREE.ConeGeometry(0.0085, 0.05, 5), [x, G + 0.008, z], [90, yaw, 0]));
      tops.push(
        put(
          box(0.007, 0.006, 0.02),
          [x + Math.sin((yaw + 180) * DEG) * 0.032, G + 0.007, z + Math.cos((yaw + 180) * DEG) * 0.032],
          [0, yaw, 0],
        ),
      );
      hold(x, z, 0.03);
    }
    fixed(merge(carrots), CARROT, { group: "garden" });
    fixed(merge(tops), LEAF_GREEN, { group: "garden" });
    hold(-0.31, 0.395, 0.04);
  }

  // -------------------------------------------------------------------------------------------- chalkboard sign
  {
    const L = new Loc([0.082, G, 0.2], -12);
    const board = new Sheet(48, { board: [19, 24, 2] });
    board.paint("board", () => "#c98a52");
    board.blit("board", "pz", chalkGrid());
    b.part(board.box("board"), WHITE, {
      texture: board.texture,
      bone: root,
      at: L.p([0, 0.0815, 0.005]),
      quat: L.turned(-14, 0, 0),
      group: "sign",
    });
    fixed(putQ(cropBox(0.132, 0.168, 0.012, 32, rand), L.p([0, 0.0815, -0.03]), L.turned(14, 0, 0)), WHITE, {
      texture: woodTexture("dark", WOOD_DARK, 9, true),
      group: "sign",
    });
    hold(0.082, 0.2, 0.09);
  }

  // -------------------------------------------------------------------------------------------- bread cart
  {
    const Y = 20;
    const L = new Loc([0.225, G, 0.15], Y);
    const rot: V3 = [0, Y, 0];
    wood("mint", false, 0.17, 0.008, 0.1, L.p([0, 0.052, 0]), rot);
    for (const s of [1, -1]) {
      wood("mint", false, 0.17, 0.02, 0.006, L.p([0, 0.066, s * 0.047]), rot);
      wood("mint", false, 0.006, 0.02, 0.088, L.p([s * 0.082, 0.066, 0]), rot);
      wood("dark", false, 0.09, 0.008, 0.008, L.p([-0.125, 0.05, s * 0.035]), rot);
      wood("dark", true, 0.008, 0.048, 0.008, L.p([-0.07, 0.024, s * 0.04]), rot);
    }
    wood("dark", false, 0.008, 0.008, 0.1, L.p([0.03, 0.042, 0]), rot);
    const wheelRim: BufferGeometry[] = [];
    const spokes: BufferGeometry[] = [];
    for (const s of [1, -1]) {
      const c = L.p([0.03, 0.042, s * 0.058]);
      wheelRim.push(putQ(new THREE.CylinderGeometry(0.042, 0.042, 0.01, 10), c, L.turned(90, 0, 0)));
      for (const ang of [0, 45, 90, 135]) spokes.push(putQ(box(0.076, 0.006, 0.013), c, L.turned(0, 0, ang)));
    }
    fixed(merge(wheelRim), "#8a5a3a", { group: "cart" });
    fixed(merge(spokes), "#e0a868", { group: "cart" });
    // Loaves in a basket, boules, and a two-tier cake on a stand.
    const top = 0.056;
    b.part(box(0.05, 0.03, 0.05), WICKER, { bone: root, at: L.p([0.058, top + 0.015, 0]), quat: L.q, group: "cart" });
    b.part(box(0.054, 0.006, 0.054), WICKER_DK, {
      bone: root,
      at: L.p([0.058, top + 0.03, 0]),
      quat: L.q,
      group: "cart",
    });
    const baguettes: BufferGeometry[] = [];
    [
      [-0.014, -0.01, 8, -6],
      [0.0, 0.012, -7, 4],
      [0.012, -0.012, 5, 10],
      [0.016, 0.01, -9, -8],
      [-0.006, 0.0, 2, 3],
    ].forEach(([dx, dz, rx, rz]) =>
      baguettes.push(putQ(box(0.012, 0.088, 0.012), L.p([0.058 + dx, top + 0.07, dz]), L.turned(rx, 0, rz))),
    );
    fixed(merge(baguettes), CRUST, { group: "cart" });
    const boule = () =>
      faceted(
        new THREE.LatheGeometry(
          [
            [0.001, 0],
            [0.028, 0],
            [0.031, 0.01],
            [0.026, 0.022],
            [0.013, 0.029],
            [0.001, 0.031],
          ].map(([x, y]) => new THREE.Vector2(x, y)),
          8,
        ),
      );
    fixed(
      merge([
        putQ(boule(), L.p([-0.06, top, -0.024]), L.turned(0, 10, 0)),
        putQ(boule(), L.p([-0.06, top, 0.026]), L.turned(0, 40, 0)),
      ]),
      CRUST,
      { group: "cart" },
    );
    const cx0 = -0.004;
    fixed(putQ(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 8), L.p([cx0, top + 0.014, 0]), L.q), WHITE, {
      group: "cart",
    });
    fixed(putQ(new THREE.CylinderGeometry(0.006, 0.009, 0.012, 6), L.p([cx0, top + 0.006, 0]), L.q), MINT_DK, {
      group: "cart",
    });
    const t1 = G + top + 0.016 + 0.022;
    fixed(
      putQ(new THREE.CylinderGeometry(0.028, 0.028, 0.022, 8), L.p([cx0, top + 0.027, 0]), L.q),
      cake(t1, "#ffc2d4", "#ff9fbb", "#f6d9a0"),
      { group: "cart" },
    );
    const t2 = t1 + 0.018;
    fixed(
      putQ(new THREE.CylinderGeometry(0.019, 0.019, 0.018, 8), L.p([cx0, top + 0.047, 0]), L.q),
      cake(t2, "#fff3dc", "#ffd9e6", "#f6d9a0"),
      { group: "cart" },
    );
    fixed(putQ(new THREE.SphereGeometry(0.0065, 6, 4), L.p([cx0, top + 0.06, 0]), L.q), CHERRY, { group: "cart" });
    hold(0.225, 0.15, 0.12);
  }

  // -------------------------------------------------------------------------------------------- bench, sacks
  {
    const L = new Loc([-0.31, G, cz], -90);
    const rot: V3 = [0, -90, 0];
    for (const i of [-1, 0, 1]) wood("nat", false, 0.17, 0.008, 0.018, L.p([0, 0.055, i * 0.019]), rot);
    wood("nat", false, 0.17, 0.02, 0.008, L.p([0, 0.088, -0.03]), rot);
    wood("nat", false, 0.17, 0.02, 0.008, L.p([0, 0.114, -0.03]), rot);
    for (const s of [1, -1]) {
      wood("dark", true, 0.01, 0.09, 0.01, L.p([s * 0.078, 0.078, -0.03]), rot);
      wood("dark", true, 0.012, 0.05, 0.05, L.p([s * 0.07, 0.025, 0]), rot);
    }
    b.part(box(0.042, 0.014, 0.032), PINK, {
      bone: root,
      at: L.p([0.04, 0.066, -0.004]),
      quat: L.turned(0, 12, 0),
      group: "bench",
    });
    hold(-0.31, cz, 0.11);
    const sack = new Sheet(32, { sack: [8, 8, 6], knot: [3, 2, 3] });
    sack.paint("sack", (_f, u, v) => (hash(u, v, 1, 3) < 0.12 ? "#ecdcc0" : "#fff3dc"));
    sack.paint("knot", () => "#ecdcc0");
    sack.draw(
      "sack",
      "pz",
      ["........", "........", "..pp.pp.", "..pppp..", "...pp...", "........", "........", "........"],
      { p: "#ff8fb0" },
    );
    for (const [x, z, yaw] of [
      [-0.3, -0.255, 20],
      [-0.335, -0.26, -12],
    ]) {
      const s = new Loc([x, G, z], yaw);
      b.part(sack.box("sack"), WHITE, {
        texture: sack.texture,
        bone: root,
        at: s.p([0, 0.028, 0]),
        quat: s.q,
        group: "sack",
      });
      b.part(sack.box("knot"), WHITE, {
        texture: sack.texture,
        bone: root,
        at: s.p([0, 0.0605, 0]),
        quat: s.q,
        group: "sack",
      });
      hold(x, z, 0.04);
    }
  }

  // A crate of apples by the sacks.
  wood("nat", false, 0.05, 0.036, 0.042, [-0.405, G + 0.018, -0.235], [0, 8, 0]);
  wood("dark", false, 0.052, 0.006, 0.044, [-0.405, G + 0.037, -0.235], [0, 8, 0]);
  {
    const apples: BufferGeometry[] = [];
    [
      [-0.014, 0.008],
      [0.004, -0.008],
      [0.014, 0.01],
      [-0.004, 0.004],
    ].forEach(([dx, dz], i) =>
      apples.push(
        put(
          faceted(new THREE.IcosahedronGeometry(0.012, 0)),
          [-0.405 + dx, G + 0.046 + (i === 3 ? 0.014 : 0), -0.235 + dz],
          [0, i * 30, 0],
        ),
      ),
    );
    fixed(merge(apples), CHERRY, { group: "crate" });
    hold(-0.405, -0.235, 0.04);
  }

  // -------------------------------------------------------------------------------------------- lanterns, mailbox
  const lanternSheet = new Sheet(24, { lantern: [5, 6, 5] });
  lanternSheet.paint("lantern", (face, u, v, w, h) => {
    if (face === "py" || face === "ny") return "#4a3a2c";
    if (u === 0 || u === w - 1 || v === 0 || v === h - 1) return "#4a3a2c";
    return v < 2 ? "#fff3b0" : v < 4 ? "#ffd45a" : "#ffb23f";
  });
  for (const [x, z] of [
    [0.01, 0.15],
    [-0.11, 0.47],
    [0.31, 0.0],
  ]) {
    wood("dark", true, 0.011, 0.14, 0.011, [x, G + 0.07, z]);
    wood("dark", false, 0.05, 0.008, 0.008, [x + 0.022, G + 0.135, z]);
    const lx = x + 0.04;
    b.part(lanternSheet.box("lantern", [0.028, 0.034, 0.028]), WHITE, {
      texture: lanternSheet.texture,
      bone: root,
      at: [lx, G + 0.108, z],
      group: "lantern",
    });
    b.part(new THREE.ConeGeometry(0.023, 0.016, 4), "#4a3a2c", {
      bone: root,
      at: [lx, G + 0.133, z],
      rotation: [0, 45, 0],
      group: "lantern",
    });
    b.part(box(0.004, 0.012, 0.004), IRON, { bone: root, at: [lx, G + 0.128, z], group: "lantern" });
    hold(x, z, 0.04);
  }
  {
    const mx = -0.4;
    const mz = 0.4;
    wood("dark", true, 0.012, 0.12, 0.012, [mx, G + 0.06, mz]);
    b.part(box(0.034, 0.03, 0.054), MAIL, { bone: root, at: [mx, G + 0.135, mz], group: "mailbox" });
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.054, 8, 1, false, 0, Math.PI), MAIL, {
      bone: root,
      at: [mx, G + 0.15, mz],
      rotation: [0, 90, 90],
      group: "mailbox",
    });
    b.part(box(0.004, 0.032, 0.012), MAIL_DK, { bone: root, at: [mx + 0.021, G + 0.15, mz - 0.01], group: "mailbox" });
    b.part(box(0.006, 0.016, 0.012), MAIL_DK, { bone: root, at: [mx + 0.021, G + 0.168, mz - 0.01], group: "mailbox" });
    b.part(box(0.024, 0.003, 0.02), CREAM, { bone: root, at: [mx, G + 0.121, mz + 0.033], group: "mailbox" });
    hold(mx, mz, 0.04);
  }

  // -------------------------------------------------------------------------------------------- blossom tree with a swing
  const TX = 0.45;
  const TZ = -0.32;
  {
    b.lathe(
      [
        [0, 0],
        [0.044, 0],
        [0.034, 0.12],
        [0.028, 0.26],
        [0.024, 0.34],
        [0, 0.34],
      ],
      { at: [TX, G, TZ], segments: 6, color: BARK, bone: root, group: "tree" },
    );
    const limbs = [
      put(new THREE.CylinderGeometry(0.009, 0.013, 0.22, 6), [TX, G + 0.272, TZ + 0.11], [90, 0, 0]),
      put(new THREE.CylinderGeometry(0.007, 0.011, 0.1, 6), [TX - 0.04, G + 0.3, TZ + 0.01], [0, 0, 55]),
      put(new THREE.CylinderGeometry(0.007, 0.011, 0.1, 6), [TX + 0.04, G + 0.31, TZ - 0.02], [0, 0, -50]),
    ];
    fixed(merge(limbs), BARK, { group: "tree" });
    const canopy = [
      [0, 0.42, 0, 0.13],
      [0.075, 0.38, 0.03, 0.1],
      [-0.075, 0.39, -0.02, 0.1],
      [0.0, 0.5, -0.01, 0.09],
      [0.03, 0.37, -0.09, 0.09],
      [-0.04, 0.36, 0.08, 0.085],
      [0.1, 0.45, -0.05, 0.07],
    ].map(([dx, dy, dz, r], i) => put(blob(r, 0.8), [TX + dx, G + dy, TZ + dz], [0, i * 33, 0]));
    fixed(merge(canopy), BLOSSOM, { group: "tree" });
    // The swing: a crossbar, two ropes and a plank seat.
    const sz = TZ + 0.2;
    wood("dark", false, 0.09, 0.01, 0.01, [TX, G + 0.266, sz]);
    for (const s of [1, -1])
      b.part(box(0.005, 0.176, 0.005), ROPE, { bone: root, at: [TX + s * 0.038, G + 0.176, sz], group: "swing" });
    wood("nat", false, 0.096, 0.009, 0.034, [TX, G + 0.086, sz]);
    hold(TX, TZ, 0.06);
    hold(TX, sz, 0.06);
    const petals: BufferGeometry[] = [];
    for (let i = 0; i < 26; i++) {
      const a = hash(i, 0, 0, 1) * Math.PI * 2;
      const r = 0.03 + hash(i, 1, 0, 2) * 0.14;
      const x = TX + Math.cos(a) * r;
      const z = TZ + Math.sin(a) * r;
      if (!onIsland(x, z, 0.01)) continue;
      petals.push(put(box(0.009, 0.002, 0.009), [x, G + 0.001, z], [0, hash(i, 2, 0, 3) * 90, 0]));
    }
    for (let i = 0; i < 7; i++)
      petals.push(
        put(
          box(0.008, 0.002, 0.008),
          [
            TX + (hash(i, 3, 0, 4) - 0.5) * 0.24,
            G + 0.08 + hash(i, 4, 0, 5) * 0.16,
            TZ + 0.06 + hash(i, 5, 0, 6) * 0.2,
          ],
          [hash(i, 6, 0, 7) * 60, hash(i, 7, 0, 8) * 90, 0],
        ),
      );
    fixed(merge(petals), PETAL, { group: "tree" });
    // Bunting strung from the lantern post to the tree.
    const A: V3 = [0.31, G + 0.14, 0.0];
    const B: V3 = [TX - 0.03, G + 0.215, TZ + 0.06];
    const bunting = [PINK, STRAW, MINT, "#8fd0ff", "#ffffff"];
    const rope: BufferGeometry[] = [];
    const flags: BufferGeometry[][] = bunting.map(() => []);
    const sag = (t: number): V3 => [
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t - 0.03 * 4 * t * (1 - t),
      A[2] + (B[2] - A[2]) * t,
    ];
    for (let i = 0; i < 14; i++) {
      const p0 = sag(i / 14);
      const p1 = sag((i + 1) / 14);
      const d = sub(p1, p0);
      const hl = Math.hypot(d[0], d[2]);
      const seg = new Loc(mid(p0, p1), Math.atan2(d[0], d[2]) / DEG).turned(Math.atan2(-d[1], hl) / DEG, 0, 0);
      rope.push(putQ(box(0.004, 0.004, Math.hypot(...d) + 0.002), mid(p0, p1), seg));
    }
    const phi = Math.atan2(-(B[2] - A[2]), B[0] - A[0]) / DEG;
    for (let i = 1; i < 14; i++) {
      const p = sag(i / 14);
      flags[i % bunting.length].push(
        put(box(0.02, 0.011, 0.003), [p[0], p[1] - 0.0075, p[2]], [0, phi, 0]),
        put(box(0.011, 0.01, 0.003), [p[0], p[1] - 0.0175, p[2]], [0, phi, 0]),
      );
    }
    fixed(merge(rope), ROPE, { group: "bunting" });
    bunting.forEach((col, i) => fixed(merge(flags[i]), col, { group: "bunting" }));
  }

  // -------------------------------------------------------------------------------------------- bushes, mushrooms, pebbles
  {
    const leaves: BufferGeometry[] = [];
    const berries: BufferGeometry[] = [];
    [
      [-0.5, -0.28, 0.05],
      [-0.42, -0.41, 0.055],
      [0.12, -0.48, 0.05],
      [0.28, -0.46, 0.055],
      [-0.17, -0.5, 0.05],
      [-0.31, 0.47, 0.045],
      [0.5, 0.12, 0.042],
      [0.24, 0.53, 0.045],
      [0.53, -0.08, 0.04],
      [-0.55, 0.05, 0.045],
    ].forEach(([x, z, r], i) => {
      if (!onIsland(x, z, r + 0.03) || Math.hypot(x - cx, z - cz) < 0.26) return;
      leaves.push(
        put(blob(r, 0.8), [x, G + r * 0.6, z], [0, i * 40, 0]),
        put(blob(r * 0.72, 0.8), [x + r * 0.8, G + r * 0.4, z + r * 0.3], [0, i * 20, 0]),
      );
      if (i % 2 === 0) leaves.push(put(blob(r * 0.6, 0.8), [x - r * 0.7, G + r * 0.35, z - r * 0.35]));
      for (let k = 0; k < 5; k++) {
        const a = hash(i, k, 0, 5) * Math.PI * 2;
        const e = 0.3 + hash(i, k, 1, 6) * 0.9;
        berries.push(
          put(box(0.008, 0.008, 0.008), [
            x + Math.cos(a) * r * 0.95 * Math.cos(e),
            G + r * 0.6 + Math.sin(e) * r * 0.75,
            z + Math.sin(a) * r * 0.95 * Math.cos(e),
          ]),
        );
      }
      hold(x, z, r + 0.01);
    });
    fixed(merge(leaves), LEAF, { group: "bushes" });
    fixed(merge(berries), CHERRY, { group: "bushes" });

    const stems: BufferGeometry[] = [];
    const caps: BufferGeometry[] = [];
    [
      [-0.44, -0.06, 1.0],
      [-0.4, -0.02, 0.7],
      [0.1, -0.44, 0.9],
      [0.5, 0.2, 0.75],
      [-0.2, 0.06, 0.65],
    ].forEach(([x, z, s]) => {
      if (!onIsland(x, z, 0.04)) return;
      stems.push(put(new THREE.CylinderGeometry(0.007 * s, 0.009 * s, 0.02 * s, 6), [x, G + 0.01 * s, z]));
      caps.push(
        put(
          faceted(
            new THREE.LatheGeometry(
              [
                [0.001, 0],
                [0.03, 0],
                [0.028, 0.008],
                [0.018, 0.017],
                [0.001, 0.021],
              ].map(([a, c]) => new THREE.Vector2(a * s, c * s)),
              6,
            ),
          ),
          [x, G + 0.02 * s, z],
        ),
      );
      hold(x, z, 0.03);
    });
    fixed(merge(stems), STEM, { group: "mushrooms" });
    fixed(merge(caps), MUSHROOM_SPOTS, { group: "mushrooms" });
  }

  // -------------------------------------------------------------------------------------------- flowers and grass
  const near = (x: number, z: number, m: number) => occupied.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r + m);
  {
    const kinds = [
      [tulip(...FLOWER_KINDS[0]), [] as Frame[]],
      [daisy("#ffffff", "#ffd54a"), [] as Frame[]],
      [bell(...FLOWER_KINDS[2]), [] as Frame[]],
      [tulip(...FLOWER_KINDS[3]), [] as Frame[]],
      [tulip(...FLOWER_KINDS[1]), [] as Frame[]],
    ] as const;
    const tufts: Frame[] = [];
    let placed = 0;
    for (let i = 0; i < 400 && placed < 78; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.62;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (!onIsland(x, z, 0.04) || near(x, z, 0.02) || distToPath(x, z) < 0.05) continue;
      const fr = frame([x, G + 0.001, z], [0, 1, 0]);
      if (rand() < 0.42) tufts.push(fr);
      else kinds[Math.floor(rand() * kinds.length)][1].push(fr);
      placed++;
    }
    // Beds: the mint planter under the watering bunny, and the window box.
    wood("mint", false, 0.11, 0.036, 0.045, [0.225, G + 0.018, 0.51]);
    b.part(box(0.098, 0.006, 0.033), SOIL, { bone: root, at: [0.225, G + 0.037, 0.51], group: "garden" });
    for (let i = 0; i < 5; i++)
      kinds[i % kinds.length][1].push(
        frame([0.185 + i * 0.02, G + 0.04, 0.51 + (hash(i, 0, 0, 1) - 0.5) * 0.02], [0, 1, 0]),
      );
    hold(0.225, 0.51, 0.08);
    const wb = wallPt(-45, 0.02, 0.104);
    b.part(box(0.1, 0.005, 0.024), SOIL, { bone: root, at: wb, rotation: [0, -45, 0], group: "garden" });
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 0.02;
      kinds[(i + 1) % kinds.length][1].push(
        frame([wb[0] + off * Math.cos(-45 * DEG), wb[1] + 0.003, wb[2] - off * Math.sin(-45 * DEG)], [0, 1, 0]),
      );
    }
    for (const [tex, frames] of kinds)
      if (frames.length)
        b.cards(frames, tex.tex, {
          size: [tex.w * T * 1.25, tex.h * T * 1.25],
          cross: true,
          vary: 0.2,
          spin: 35,
          rng: rng(21),
          bone: root,
          group: "flowers",
        });
    b.cards(tufts, TUFT.tex, {
      size: [TUFT.w * T * 1.3, TUFT.h * T * 1.3],
      cross: true,
      vary: 0.25,
      spin: 45,
      rng: rng(22),
      bone: root,
      group: "grass",
    });
    // Pebbles.
    const pebbles: BufferGeometry[] = [];
    for (let i = 0; i < 300 && pebbles.length < 18; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.62;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (!onIsland(x, z, 0.03) || near(x, z, 0.015)) continue;
      const s = 0.007 + rand() * 0.008;
      pebbles.push(put(blob(s, 0.6), [x, G + s * 0.3, z], [0, rand() * 90, 0]));
    }
    fixed(merge(pebbles), STONE, { group: "pebbles" });
    // Two butterflies over the flowers.
    const wings = (a: string, c: string) => sprite(["pp.pp", "pcbcp", ".pbp.", "..b.."], { p: a, c, b: "#5a3a5a" });
    for (const [tex, at] of [
      [wings("#ff9ad0", "#ffd6ec"), [0.03, G + 0.1, 0.4]],
      [wings("#ffd23f", "#fff3b0"), [-0.34, G + 0.12, 0.1]],
    ] as const)
      b.cards([frame(at, [0, 1, 0])], tex.tex, {
        size: [0.045, 0.036],
        lean: 75,
        flow: [0, 0, 1],
        bone: root,
        group: "butterfly",
      });
  }

  // -------------------------------------------------------------------------------------------- wood, flushed
  Object.entries(batches).forEach(([key, list], i) => {
    const variant = key.slice(0, -1) as Variant;
    fixed(merge(list), WHITE, {
      texture: woodTexture(variant, WOODS[variant], 1 + i, key.endsWith("V")),
      group: "wood",
    });
  });

  // -------------------------------------------------------------------------------------------- critters

  function bunny(s: BunnySpec) {
    const n = s.name;
    const pal = s.pal;
    const L = new Loc(s.at, s.yaw);
    const sheet = new Sheet(64, {
      head: [12, 8, 10],
      jaw: [10, 2, 8],
      body: [9, 8, 7],
      arm: [2, 6, 2],
      paw: [3, 3, 3],
      leg: [3, 3, 3],
      foot: [4, 2, 6],
      ear: [3, 5, 2],
      tip: [3, 4, 2],
      tail: [5, 5, 5],
    });
    Object.keys(sheet.cells).forEach((name, k) =>
      sheet.paint(name, (face, u, v) => {
        const r = hash(u + k * 7, v, FACES.indexOf(face), s.seed);
        return r < 0.08 ? pal.shade : r > 0.95 ? pal.light : pal.fur;
      }),
    );
    sheet.paint("paw", () => pal.light);
    sheet.paint("jaw", (face) => (face === "py" ? "#f59aa8" : pal.light));
    sheet.paint("tail", (_f, u, v) => (hash(u, v, 3, s.seed + 5) < 0.3 ? pal.light : "#ffffff"));
    sheet.paint("foot", (face, u, v) =>
      face === "ny" && u >= 1 && u <= 2 && v >= 2 && v <= 4 ? pal.inner : undefined,
    );
    for (const name of ["ear", "tip"])
      sheet.paint(name, (face, u, v) => (face === "pz" && u === 1 && v > 0 ? pal.inner : undefined));
    const pl = { l: pal.light, E: pal.eye, W: "#ffffff", N: pal.nose, K: pal.blush, L: pal.light, M: "#c9707f" };
    sheet.draw(
      "body",
      "pz",
      [
        "........",
        "..lllll..".slice(0, 9),
        ".lllllll.",
        ".lllllll.",
        ".lllllll.",
        ".lllllll.",
        "..lllll..",
        ".........",
      ],
      pl,
    );
    sheet.draw(
      "head",
      "pz",
      [
        "............",
        "............",
        "..WE....WE..",
        "..EE....EE..",
        "..EELLLLEE..",
        ".KK.LNNL.KK.",
        "....MLLM....",
        ".....MM.....",
      ],
      pl,
    );
    const tex = sheet.texture;
    const skin = (name: string, bone: Joint, at: V3, q: THREE.Quaternion, size?: V3) =>
      b.part(sheet.box(name, size), WHITE, { texture: tex, bone, at, quat: q, group: n });

    const body = b.joint(`${n}Body`, {
      parent: root,
      at: L.p(px(0, 7, 0)),
      dir: L.d([0, 1, 0]),
      role: "spine",
      group: n,
    });
    skin("body", body, L.p(px(0, 9, 0)), L.q);
    const Rh = quat(...s.head);
    const hp = px(0, 13, 0.5);
    const H = (v: V3): V3 => {
      const r = new THREE.Vector3(...v).multiplyScalar(T).applyQuaternion(Rh);
      return L.p([hp[0] + r.x, hp[1] + r.y, hp[2] + r.z]);
    };
    const Hd = (v: V3): V3 => L.d(new THREE.Vector3(...v).applyQuaternion(Rh).toArray() as V3);
    const qHead = L.q.clone().multiply(Rh);
    const head = b.joint(`${n}Head`, { parent: body, at: L.p(hp), dir: Hd([0, 1, 0]), role: "head", group: n });
    skin("head", head, H([0, 5, 0]), qHead);
    const jaw = b.joint(`${n}Jaw`, { parent: head, at: H([0, 0, -2]), dir: Hd([0, 0, 1]), role: "jaw", group: n });
    skin("jaw", jaw, H([0, 0, 1]), qHead);

    // Ears: two-joint chains, upright or hanging along the cheeks.
    const upEars = s.ears === "up";
    for (const side of [1, -1]) {
      const sn = side > 0 ? "L" : "R";
      const sp = s.splay * DEG;
      const base: V3 = upEars ? [side * 3.5, 9, -1] : [side * 5.7, 6.8, -1];
      const d1: V3 = upEars ? unit([side * Math.sin(sp), Math.cos(sp), -0.12]) : unit([side * 0.62, -0.78, 0.05]);
      const d2: V3 = upEars
        ? unit([side * Math.sin(sp + 0.25), Math.cos(sp + 0.25), -0.28])
        : unit([side * 0.28, -0.96, 0.08]);
      const e0 = H(base);
      const e1 = H(add(base, scl(d1, 5)));
      const e2 = H(add(add(base, scl(d1, 5)), scl(d2, 4)));
      const chain = b.chain(`${n}Ear${sn}Chain`, polyline([e0, e1, e2]), {
        parent: head,
        names: [`${n}Ear${sn}`, `${n}EarTip${sn}`],
        group: n,
      });
      const facingIn = upEars ? Hd([0, 0, 1]) : Hd([-side, 0, 0]);
      b.part(sheet.box("ear"), WHITE, {
        texture: tex,
        bone: chain.joints[0],
        at: mid(e0, e1),
        dir: sub(e1, e0),
        up: facingIn,
        group: n,
      });
      b.part(sheet.box("tip"), WHITE, {
        texture: tex,
        bone: chain.joints[1],
        at: mid(e1, e2),
        dir: sub(e2, e1),
        up: facingIn,
        group: n,
      });
    }

    // Arms reach for the paw targets.
    const paws = ([1, -1] as const).map((side) => {
      const sn = side > 0 ? "L" : "R";
      const sh = L.p(px(side * 5, 11.5, 0));
      const paw = L.p(scl(side > 0 ? s.pawL : s.pawR, T));
      const along = unit(sub(paw, sh));
      const chain = b.chain(`${n}Arm${sn}Chain`, polyline([sh, paw, add(paw, scl(along, 0.01))]), {
        parent: body,
        names: [`${n}Arm${sn}`, `${n}Paw${sn}`],
        role: "arm",
        group: n,
      });
      const len = Math.hypot(...sub(paw, sh));
      b.part(sheet.box("arm", [2 * T, len, 2 * T]), WHITE, {
        texture: tex,
        bone: chain.joints[0],
        at: mid(sh, paw),
        dir: along,
        group: n,
      });
      b.part(sheet.box("paw"), WHITE, {
        texture: tex,
        bone: chain.joints[1],
        at: add(paw, scl(along, T)),
        dir: along,
        group: n,
      });
      return { joint: chain.joints[1], at: paw, along };
    });

    // Short legs and big feet.
    for (const side of [1, -1]) {
      const sn = side > 0 ? "L" : "R";
      const chain = b.chain(
        `${n}Leg${sn}Chain`,
        polyline([L.p(px(side * 2.5, 5, 0)), L.p(px(side * 2.5, 2, 0)), L.p(px(side * 2.5, 1, 2.5))]),
        {
          parent: body,
          names: [`${n}Hip${sn}`, `${n}Foot${sn}`],
          role: "leg",
          contact: L.p(px(side * 2.5, 0, 1)),
          group: n,
        },
      );
      skin("leg", chain.joints[0], L.p(px(side * 2.5, 3.5, 0)), L.q);
      skin("foot", chain.joints[1], L.p(px(side * 2.5, 1, 1)), L.q);
    }
    const tail = b.joint(`${n}Tail`, {
      parent: body,
      at: L.p(px(0, 7.5, -3.5)),
      dir: L.d([0, 0.3, -1]),
      role: "tail",
      group: n,
    });
    skin("tail", tail, L.p(px(0, 7.5, -6)), L.q);
    return { L, sheet, tex, body, head, jaw, H, qHead, paws };
  }

  const CREAM_BUNNY: BunnyPal = {
    fur: "#fff1e0",
    shade: "#f0dcc6",
    light: "#fffaf2",
    inner: "#ffb3c1",
    blush: "#ffb0b8",
    nose: "#ff8fa3",
    eye: "#3d2540",
  };
  const CARAMEL_BUNNY: BunnyPal = {
    fur: "#dea068",
    shade: "#c98650",
    light: "#f8dcb4",
    inner: "#ffb59e",
    blush: "#ff9a94",
    nose: "#d9647a",
    eye: "#3a2226",
  };
  const LAVENDER_BUNNY: BunnyPal = {
    fur: "#cfd3ee",
    shade: "#b9bfe0",
    light: "#f4f0fb",
    inner: "#ffc0d6",
    blush: "#ffb0c8",
    nose: "#ff8fb0",
    eye: "#32284a",
  };

  // Bunny 1: the baker, carrying a baguette down the path.
  {
    const a = bunny({
      name: "bunny1",
      at: [-0.2, G + 0.008, 0.375],
      yaw: 12,
      pal: CREAM_BUNNY,
      seed: 3,
      head: [4, 8, -6],
      ears: "up",
      splay: 9,
      pawL: [3.6, 11.5, 6.2],
      pawR: [-3.6, 8.5, 6.2],
    });
    hold(-0.2, 0.375, 0.07);
    const apron = new Sheet(16, { apron: [9, 7, 1] });
    apron.paint("apron", (f, u, v) => (f === "pz" && (u === 0 || u === 8 || v === 6) ? "#ecdcc8" : "#fffaf2"));
    apron.draw(
      "apron",
      "pz",
      ["...p.p...", "..ppppp..", "...ppp...", "....p....", ".rrrrrrr.", ".r.....r.", ".rrrrrrr."],
      { p: APRON_DOT, r: "#ff9db8" },
    );
    b.part(apron.box("apron"), WHITE, {
      texture: apron.texture,
      bone: a.body,
      at: a.L.p(px(0, 8.6, 4.0)),
      quat: a.L.q,
      group: "bunny1",
    });
    for (const [x, w] of [
      [0, 2],
      [-2.2, 2.2],
      [2.2, 2.2],
    ])
      b.part(box(w * T, 2 * T, 1.6 * T), BOW, {
        bone: a.body,
        at: a.L.p(px(x, 11.4, 4.4)),
        quat: a.L.q,
        group: "bunny1",
      });
    const bag = new Sheet(64, { main: [22, 4, 4], end: [2, 3, 3] });
    for (const name of ["main", "end"])
      bag.paint(name, (face, u, v) => {
        const r = hash(u, v, FACES.indexOf(face), 44);
        if ((face === "py" || face === "pz") && name === "main" && v >= 1 && v <= 2 && (u + v) % 5 === 0)
          return "#f7d798";
        return r < 0.2 ? "#b56a2c" : r < 0.55 ? "#d98d3f" : "#e6a552";
      });
    const tilt = 30;
    const bq = a.L.turned(0, 0, tilt);
    const bc = a.L.p(px(0.5, 9, 6.6));
    const along = new THREE.Vector3(1, 0, 0).applyQuaternion(bq);
    b.part(bag.box("main"), WHITE, { texture: bag.texture, bone: a.body, at: bc, quat: bq, group: "bunny1" });
    for (const s of [1, -1])
      b.part(bag.box("end"), WHITE, {
        texture: bag.texture,
        bone: a.body,
        at: [bc[0] + along.x * s * 12 * T, bc[1] + along.y * s * 12 * T, bc[2] + along.z * s * 12 * T],
        quat: bq,
        group: "bunny1",
      });
  }

  // Bunny 2: the gardener, watering the planter.
  {
    const a = bunny({
      name: "bunny2",
      at: [0.235, G + 0.008, 0.42],
      yaw: -15,
      pal: CARAMEL_BUNNY,
      seed: 5,
      head: [10, -8, 5],
      ears: "up",
      splay: 16,
      pawL: [1.8, 11.2, 5.6],
      pawR: [-1.8, 11.2, 5.6],
    });
    hold(0.235, 0.42, 0.07);
    const overall = (w: number, h: number, d: number, p: V3, col: string, parent: Joint = a.body) =>
      b.part(box(w * T, h * T, d * T), col, { bone: parent, at: a.L.p(px(...p)), quat: a.L.q, group: "bunny2" });
    overall(10, 4.5, 8, [0, 7.25, 0], MINT);
    overall(5, 2.5, 1, [0, 10.75, 3.9], MINT);
    overall(3, 2, 0.6, [0, 8.4, 4.3], MINT_DK);
    for (const s of [1, -1]) {
      overall(1, 1, 0.7, [s * 2, 11.6, 4.5], GOLD);
      overall(1.4, 3, 1, [s * 4, 11.3, 2.5], MINT);
    }
    const hat = (w: number, h: number, d: number, p: V3, col: string) =>
      b.part(box(w * T, h * T, d * T), col, { bone: a.head, at: a.H(p), quat: a.qHead, group: "bunny2" });
    hat(15, 0.8, 13, [0, 9.4, -0.5], STRAW);
    hat(4, 3, 5, [0, 10.6, -1], STRAW);
    hat(4.2, 1, 5.2, [0, 10, -1], BOW);
    for (const [x, z] of [
      [-6.5, 3],
      [6.5, -3],
      [3, -6],
    ])
      hat(1.6, 0.6, 1.6, [x, 9.8, z], STRAW_DK);
    // The watering can, tipped to pour on the planter.
    const cq = a.L.turned(28, 0, 0);
    const cc = a.L.p(px(0, 9.4, 8.6));
    const canGeo: BufferGeometry[] = [];
    const canDk: BufferGeometry[] = [];
    canGeo.push(
      new THREE.CylinderGeometry(0.021, 0.021, 0.03, 8),
      put(box(0.005, 0.03, 0.005), [0, 0.012, -0.027]),
      put(box(0.005, 0.005, 0.022), [0, 0.027, -0.017]),
    );
    canGeo.push(put(box(0.007, 0.007, 0.052), [0, 0.006, 0.044], [-35, 0, 0]));
    canDk.push(
      put(new THREE.CylinderGeometry(0.013, 0.009, 0.006, 8), [0, 0.0295, 0.0715], [55, 0, 0]),
      put(new THREE.CylinderGeometry(0.0215, 0.0215, 0.004, 8), [0, 0.015, 0], [0, 0, 0]),
    );
    b.part(putQ(merge(canGeo), cc, cq), CAN, { bone: a.paws[1].joint, at: [0, 0, 0], group: "bunny2" });
    b.part(putQ(merge(canDk), cc, cq), CAN_DK, { bone: a.paws[1].joint, at: [0, 0, 0], group: "bunny2" });
    const rose = new THREE.Vector3(0, 0.0295, 0.0715).applyQuaternion(cq).add(new THREE.Vector3(...cc));
    const spray = new THREE.Vector3(0, 0.574, 0.819).applyQuaternion(cq).normalize();
    const water: BufferGeometry[] = [];
    for (let k = 1; k <= 9; k++) {
      const t = k * 0.02;
      const p = rose.clone().addScaledVector(spray, 0.22 * t);
      p.y -= 0.5 * 4.5 * t * t;
      if (p.y < G + 0.046) continue;
      water.push(
        put(box(0.006, 0.008, 0.006), [
          p.x + (hash(k, 0, 0, 1) - 0.5) * 0.008,
          p.y,
          p.z + (hash(k, 1, 0, 2) - 0.5) * 0.008,
        ]),
      );
    }
    fixed(merge(water), DROP, { group: "bunny2" });
  }

  // Bunny 3: peeking out of the round door and waving.
  {
    const a = bunny({
      name: "bunny3",
      at: [cx + 0.012, G + 0.008, cz + WALL_A + 0.012],
      yaw: 8,
      pal: LAVENDER_BUNNY,
      seed: 7,
      head: [6, 12, -10],
      ears: "lop",
      splay: 0,
      pawL: [7.5, 16.5, 3.2],
      pawR: [-3.5, 9.2, 5.4],
    });
    for (const [x, y, z, w, h] of [
      [4.6, 8.2, -1, 1.8, 1.6],
      [5.4, 8.2, -1, 1.4, 1.4],
    ])
      b.part(box(w * T, h * T, 1.4 * T), BOW, {
        bone: a.head,
        at: a.H([x, y, z + 0.5]),
        quat: a.qHead,
        group: "bunny3",
      });
    b.part(box(1.2 * T, 1.2 * T, 1.4 * T), "#ff5d8f", {
      bone: a.head,
      at: a.H([5, 8.2, -0.5]),
      quat: a.qHead,
      group: "bunny3",
    });
  }

  // The cat asleep on a cushion at the top of the cap.
  {
    const L = new Loc([cx - 0.004, CAP_TOP + 0.012, cz + 0.01], -28);
    b.part(box(0.12, 0.012, 0.108), BOW, {
      bone: root,
      at: [cx - 0.004, CAP_TOP + 0.006, cz + 0.01],
      quat: L.q,
      group: "cat",
    });
    for (const s of [1, -1])
      for (const t of [1, -1])
        b.part(box(0.01, 0.01, 0.01), "#ff5d8f", {
          bone: root,
          at: L.p([s * 0.06, 0.008 - 0.012, t * 0.054]),
          quat: L.q,
          group: "cat",
        });
    const pal = { fur: "#f2a65a", shade: "#e08a3c", stripe: "#c86f2a", light: "#fde4c4", inner: "#ffa0a8" };
    const sheet = new Sheet(64, {
      body: [10, 6, 12],
      head: [8, 5, 7],
      jaw: [6, 1, 5],
      ear: [2, 3, 1],
      haunch: [3, 4, 6],
      paw: [2, 2, 4],
      tail: [2, 2, 6],
    });
    Object.keys(sheet.cells).forEach((name, k) =>
      sheet.paint(name, (face, u, v) => {
        const r = hash(u + k * 5, v, FACES.indexOf(face), 61);
        const stripe =
          (face === "py" || face === "px" || face === "nx") && (u + (face === "py" ? v : 0)) % 4 === 0 && r > 0.15;
        return stripe ? pal.stripe : r < 0.1 ? pal.shade : pal.fur;
      }),
    );
    sheet.paint("jaw", () => pal.light);
    sheet.paint("paw", () => pal.light);
    sheet.paint("body", (face, u, v) =>
      face === "ny" || (face === "pz" && v > 2 && u > 2 && u < 7) ? pal.light : undefined,
    );
    sheet.paint("tail", (_f, u, v) => (v > 3 && u > 0 && hash(u, v, 5, 62) < 0.5 ? pal.stripe : undefined));
    sheet.draw(
      "head",
      "pz",
      ["........", ".dd..dd.", ".dd..dd.", "...nn...", "..lllll."].map((r) => r.slice(0, 8)),
      { d: "#4a2c2a", n: pal.inner, l: pal.light },
    );
    sheet.set("head", "pz", 2, 1, "#4a2c2a");
    const tex = sheet.texture;
    const skin = (name: string, bone: Joint, at: V3, q: THREE.Quaternion, size?: V3) =>
      b.part(sheet.box(name, size), WHITE, { texture: tex, bone, at, quat: q, group: "cat" });
    const body = b.joint("catBody", {
      parent: root,
      at: L.p(px(0, 3, -1)),
      dir: L.d([0, 0, 1]),
      role: "spine",
      group: "cat",
    });
    skin("body", body, L.p(px(0, 3, -1)), L.q);
    const Rh = quat(8, 0, 10);
    const hp = px(0, 2.4, 6);
    const H = (v: V3): V3 => {
      const r = new THREE.Vector3(...v).multiplyScalar(T).applyQuaternion(Rh);
      return L.p([hp[0] + r.x, hp[1] + r.y, hp[2] + r.z]);
    };
    const qh = L.q.clone().multiply(Rh);
    const head = b.joint("catHead", { parent: body, at: L.p(hp), dir: L.d([0, 0, 1]), role: "head", group: "cat" });
    skin("head", head, H([0, 0.3, 3.5]), qh);
    const jaw = b.joint("catJaw", { parent: head, at: H([0, -2, 1]), dir: L.d([0, 0, 1]), role: "jaw", group: "cat" });
    skin("jaw", jaw, H([0, -2.8, 3.5]), qh);
    for (const side of [1, -1]) {
      const sn = side > 0 ? "L" : "R";
      const ear = b.joint(`catEar${sn}`, {
        parent: head,
        at: H([side * 2.6, 2.5, 1.5]),
        dir: L.d([side * 0.2, 1, 0]),
        group: "cat",
      });
      skin("ear", ear, H([side * 2.6, 4, 1.5]), qh);
      const haunch = b.joint(`catHip${sn}`, {
        parent: body,
        at: L.p(px(side * 5, 3, -3.5)),
        dir: L.d([0, -1, 0.3]),
        role: "leg",
        group: "cat",
      });
      skin("haunch", haunch, L.p(px(side * 5.4, 2.4, -3.5)), L.q);
      const paw = b.joint(`catPaw${sn}`, {
        parent: body,
        at: L.p(px(side * 2, 1.5, 6)),
        dir: L.d([0, 0, 1]),
        role: "arm",
        group: "cat",
      });
      skin("paw", paw, L.p(px(side * 2, 1, 9)), L.q);
    }
    const tailPts: V3[] = [px(0, 3.2, -7), px(4, 2.3, -10), px(8.4, 1.8, -7), px(10, 1.5, -1.5), px(9, 1.5, 4.5)].map(
      (v) => L.p(v),
    );
    const tail = b.chain("catTailChain", polyline(tailPts), {
      parent: body,
      names: ["catTail1", "catTail2", "catTail3", "catTail4"],
      role: "tail",
      group: "cat",
    });
    tail.joints.forEach((j, i) => {
      const len = Math.hypot(...sub(tailPts[i + 1], tailPts[i]));
      b.part(sheet.box("tail", [2 * T, 2 * T, len]), WHITE, {
        texture: tex,
        bone: j,
        at: mid(tailPts[i], tailPts[i + 1]),
        dir: sub(tailPts[i + 1], tailPts[i]),
        axis: "z",
        up: [0, 1, 0],
        group: "cat",
      });
    });
    // Z z z drifting up.
    const zs = [
      [0.055, 0.075, 0.09, 0.018],
      [0.085, 0.11, 0.075, 0.026],
      [0.11, 0.155, 0.055, 0.034],
    ].map(([dx, dy]) => frame([cx + dx, CAP_TOP + dy, cz + 0.06], [0, 1, 0]));
    zs.forEach((f, i) =>
      b.cards([f], ZZZ.tex, {
        size: [ZZZ.w * T * (0.7 + i * 0.35), ZZZ.h * T * (0.7 + i * 0.35)],
        lean: 90,
        flow: [0, 0, 1],
        bone: root,
        group: "cat",
      }),
    );
  }

  return b.root;
}
