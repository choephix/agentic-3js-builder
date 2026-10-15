import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, stepped, tileBox } from "../../../../kits/pixel";
import type { PixelGrid } from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description:
    "A torch-lit dungeon corner in pixel art: an iron-bound treasure chest with its lid thrown open on a gold hoard, two wall torches, a candle niche, hanging shackles, barrels (one open with glowing slime, one spilled), scattered bones with an impaled skull, a triggered spike trap with its pressure plate and darts, a rat and a dropped torch.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every ramp runs dark to light and is snapped to 6-bit VGA levels.
const R = (colors: string[]) => colors.map((c) => snapColor(c, 64));
const STONE = R(["#14121c", "#222032", "#343248", "#4b4862", "#68647f", "#8a86a2"]);
const STONE_W = R(["#1c120e", "#38201a", "#5c3826", "#8c5836", "#c08044", "#f0b062"]);
const WOOD = R(["#1a0e06", "#2e1a0c", "#4a2c15", "#6a421e", "#8c5b2c", "#b27a3e"]);
const IRON = R(["#101218", "#1e222c", "#343a48", "#4e5668", "#737c90", "#a2acc0"]);
const RUST = R(["#2a120a", "#4a2010", "#74361a", "#a05224"]);
const BONE = R(["#3e342a", "#6e6250", "#a09474", "#c8bc9a", "#e8e0c4", "#faf4de"]);
const MOSS = R(["#0e1c0c", "#1c3a14", "#2e6020", "#4c8a2c", "#7ab83c"]);
const BLOOD = R(["#220404", "#480808", "#741010", "#a01c1c"]);
const GOLD = R(["#4e3006", "#8a5a10", "#c48a1c", "#eeb82e", "#ffe066", "#fff4aa"]);
const VELVET = R(["#2a0610", "#4a0c1c", "#701428", "#9c2038"]);
const CLOTH = R(["#1a1410", "#2e241a", "#4a3a28", "#6e5a3e", "#96805a"]);
const FUR = R(["#1e1612", "#3a2c24", "#5a463a", "#7e6656", "#a08a76"]);
const SLIME = R(["#0c2a10", "#1a5a1e", "#2e9a2a", "#5ad03a", "#a4f060"]);

const Y0 = 0.08; // top of the floor slab
const T = 0.02; // the texel size of the big surfaces
const T2 = 0.01; // half-size texels for small things

// ---------------------------------------------------------------------------------------------------------------
// Light: the torches' warm pools, shared by the baked floor and wall textures.
const TORCH_X = [-0.55, 0.45];
const LIGHTS: readonly (readonly [number, number, number, number])[] = [
  [TORCH_X[0], 1.34, -0.62, 1],
  [TORCH_X[1], 1.34, -0.62, 1],
  [0.95, 1.3, -0.8, 0.5],
];
const lightAt = (x: number, y: number, z: number) => {
  let f = 0;
  for (const [lx, ly, lz, k] of LIGHTS) f += k * Math.max(0, 1 - Math.hypot(x - lx, y - ly, z - lz) / 2.1) ** 1.8;
  return Math.min(f, 1.2);
};
/** A stone texel: cool in shadow, torch-warm where the light reaches, dithered at the boundary. */
const stoneShade = (v: number, f: number, px: number, py: number) => {
  const t = bayer(px, py);
  return f > 0.1 + 0.42 * t
    ? pick(STONE_W, Math.min(1, v * 0.62 + f * 0.6), t)
    : pick(STONE, Math.min(1, v + f * 0.22), t);
};

const hash = (x: number, y: number, s: number) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s) * (1 - sx) + hash(xi + 1, yi, s) * sx;
  const c = hash(xi, yi + 1, s) * (1 - sx) + hash(xi + 1, yi + 1, s) * sx;
  return a * (1 - sy) + c * sy;
};

/** Irregular masonry: rows of blocks with a lit bevel, shadowed lower edge and dark joints. */
function masonry(
  g: PixelGrid,
  r: () => number,
  rows: [number, number],
  cols: [number, number],
  world: (px: number, py: number) => [number, number, number],
) {
  let y = 0;
  while (y < g.h) {
    const rh = Math.round(rows[0] + r() * (rows[1] - rows[0]));
    let x = -Math.floor(r() * 10);
    while (x < g.w) {
      const cw = Math.round(cols[0] + r() * (cols[1] - cols[0]));
      const base = 0.3 + r() * 0.28;
      for (let yy = 0; yy < rh; yy++)
        for (let xx = 0; xx < cw; xx++) {
          const px = x + xx;
          const py = y + yy;
          if (px < 0 || px >= g.w || py >= g.h) continue;
          const [wx, wy, wz] = world(px, py);
          const f = lightAt(wx, wy, wz);
          let v = base + (vnoise(px * 0.35, py * 0.35, 4) - 0.5) * 0.3 + (r() - 0.5) * 0.1;
          if (xx === cw - 1 || yy === rh - 1) v = -0.2;
          else if (xx === 0 || yy === 0) v += 0.2;
          else if (xx === cw - 2 || yy === rh - 2) v -= 0.1;
          g.set(px, py, stoneShade(Math.max(v, 0), f, px, py));
        }
      x += cw;
    }
    y += rh;
  }
}

/** A blobby stain with a noisy edge; `paint` gets the depth inside it (0 centre … 1 edge). */
function stain(
  g: PixelGrid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  paint: (d: number, x: number, y: number) => string | undefined,
) {
  for (let y = Math.floor(cy - ry - 3); y <= cy + ry + 3; y++)
    for (let x = Math.floor(cx - rx - 3); x <= cx + rx + 3; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + (vnoise(x * 0.25, y * 0.25, seed) - 0.5) * 0.7;
      if (d < 1) {
        const c = paint(Math.max(d, 0), x, y);
        if (c) g.set(x, y, c);
      }
    }
}

function crack(g: PixelGrid, r: () => number, x: number, y: number, len: number, dark: string) {
  let a = r() * Math.PI * 2;
  for (let i = 0; i < len; i++) {
    g.set(Math.round(x), Math.round(y), dark);
    a += (r() - 0.5) * 1.1;
    x += Math.cos(a);
    y += Math.sin(a);
    if (r() < 0.08) crack(g, r, x, y, Math.floor(len / 3), dark);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

const FLOOR_W = 140;
const FLOOR_H = 130;
const floorWorld = (px: number, py: number): [number, number, number] => [-1.4 + (px + 0.5) * T, Y0, -1.2 + (py + 0.5) * T];
const FLOOR_PX = (x: number) => (x + 1.4) / T;
const FLOOR_PY = (z: number) => (z + 1.2) / T;

function makeFloor() {
  return pixelTexture(FLOOR_W, FLOOR_H, (g) => {
    const r = rng(11);
    masonry(g, r, [14, 22], [18, 32], floorWorld);
    // blood under the trap, a trail towards the plate, and spatter
    stain(g, FLOOR_PX(0.05), FLOOR_PY(0.55), 30, 24, 2, (d, x, y) =>
      d < 0.9 ? pick(BLOOD, 0.15 + 0.7 * (1 - d) + (hash(x, y, 3) - 0.5) * 0.25, bayer(x, y)) : undefined,
    );
    stain(g, FLOOR_PX(-0.5), FLOOR_PY(0.42), 12, 5, 6, (d, x, y) =>
      d < 0.8 ? pick(BLOOD, 0.1 + 0.5 * (1 - d), bayer(x, y)) : undefined,
    );
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2;
      const rad = 16 + r() * 26;
      const x = Math.round(FLOOR_PX(0.05) + Math.cos(a) * rad * 1.15);
      const y = Math.round(FLOOR_PY(0.55) + Math.sin(a) * rad * 0.9);
      g.set(x, y, BLOOD[1 + Math.floor(r() * 2)]);
      if (r() < 0.4) g.set(x + 1, y, BLOOD[0]);
    }
    // slime puddle in front of the spilled barrel, with a lit rim and glints
    stain(g, FLOOR_PX(0.98), FLOOR_PY(0.88), 14, 18, 8, (d, x, y) => {
      if (d > 0.92) return SLIME[0];
      const v = 0.25 + 0.5 * (1 - d) + (hash(x, y, 9) - 0.5) * 0.25;
      return d > 0.78 ? SLIME[4] : hash(x >> 1, y >> 1, 4) < 0.07 ? SLIME[4] : pick(SLIME, v, bayer(x, y));
    });
    // moss along the wall and in the corners
    for (let y = 0; y < FLOOR_H; y++)
      for (let x = 0; x < FLOOR_W; x++) {
        const edge = Math.max(0, 1 - y / 20) * 0.55 + Math.max(0, 1 - Math.min(x, FLOOR_W - 1 - x) / 14) * 0.3;
        const m = vnoise(x * 0.16, y * 0.16, 5) + edge;
        if (m > 1.08) g.set(x, y, pick(MOSS, 0.2 + (m - 1.08) * 2.2 + (hash(x, y, 1) - 0.5) * 0.4, bayer(x, y)));
      }
    for (let i = 0; i < 16; i++) crack(g, r, r() * FLOOR_W, r() * FLOOR_H, 8 + Math.floor(r() * 14), STONE[0]);
    // loose grit
    for (let i = 0; i < 90; i++) {
      const x = Math.floor(r() * FLOOR_W);
      const y = Math.floor(r() * FLOOR_H);
      g.set(x, y, r() < 0.5 ? STONE[4] : STONE[1]);
    }
  });
}

const WALL_W = 140;
const WALL_H = 80;
const WALL_TOP = Y0 + 1.6;
const wallWorld = (px: number, py: number): [number, number, number] => [-1.4 + (px + 0.5) * T, WALL_TOP - (py + 0.5) * T, -0.9];
const WALL_PX = (x: number) => (x + 1.4) / T;
const WALL_PY = (y: number) => (WALL_TOP - y) / T;
const NICHE_X = 0.95;

function makeWall() {
  return pixelTexture(WALL_W, WALL_H, (g) => {
    const r = rng(21);
    masonry(g, r, [9, 12], [15, 26], wallWorld);
    // soot above each torch
    for (const tx of TORCH_X)
      for (let y = 0; y < WALL_PY(1.45); y++)
        for (let x = 0; x < WALL_W; x++) {
          const dx = Math.abs(x - WALL_PX(tx));
          const w = 4 + (WALL_PY(1.45) - y) * 0.22;
          const k = (1 - dx / w) * (0.4 + 0.6 * (1 - y / WALL_PY(1.45)));
          if (k > 0 && k > hash(x, y, 7) * 0.9) g.set(x, y, pick(STONE, 0.04 + 0.1 * (hash(x, y, 8)), bayer(x, y)));
        }
    // moss at the foot and dripping stains
    for (let y = 0; y < WALL_H; y++)
      for (let x = 0; x < WALL_W; x++) {
        const edge = Math.max(0, (y - (WALL_H - 22)) / 22) * 0.9;
        const m = vnoise(x * 0.14, y * 0.2, 5) + edge;
        if (m > 1.1) g.set(x, y, pick(MOSS, 0.15 + (m - 1.1) * 2 + (hash(x, y, 2) - 0.5) * 0.4, bayer(x, y)));
      }
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(r() * WALL_W);
      const y0 = Math.floor(r() * 10);
      const len = 8 + Math.floor(r() * 26);
      for (let k = 0; k < len; k++) g.set(x, y0 + k, k % 3 === 2 ? MOSS[1] : STONE[0]);
    }
    for (let i = 0; i < 14; i++) crack(g, r, r() * WALL_W, r() * WALL_H, 8 + Math.floor(r() * 12), STONE[0]);
    // missing blocks
    for (const [x0, y0, w, h] of [
      [28, 52, 12, 8],
      [100, 34, 10, 9],
      [64, 12, 14, 9],
    ] as const)
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) g.set(x0 + x, y0 + y, y === 0 || x === 0 ? STONE[0] : x === w - 1 || y === h - 1 ? STONE[3] : STONE[0]);
    // the candle niche: a dark arched recess with a lit lower lip
    const nx0 = Math.round(WALL_PX(NICHE_X)) - 9;
    const ny0 = Math.round(WALL_PY(1.62));
    for (let y = 0; y < 18; y++)
      for (let x = 0; x < 18; x++) {
        const corner = (x < 2 && y < 2) || (x > 15 && y < 2) || (x < 1 && y < 3) || (x > 16 && y < 3);
        if (corner) continue;
        const edge = x === 0 || x === 17 || y === 0;
        g.set(nx0 + x, ny0 + y, edge ? STONE[1] : pick(STONE, 0.03 + 0.1 * (y / 18) + (hash(x, y, 3) - 0.5) * 0.06, bayer(x, y)));
      }
    for (let x = -1; x < 19; x++) {
      g.set(nx0 + x, ny0 - 1, STONE_W[3]);
      g.set(nx0 + x, ny0 + 18, STONE_W[2]);
    }
    // prisoner's tally marks
    for (let grp = 0; grp < 3; grp++)
      for (let k = 0; k < 4; k++)
        for (let y = 0; y < 6; y++) g.set(80 + grp * 7 + k, 29 + y + (grp === 1 ? 2 : 0), STONE[5]);
    for (let k = 0; k < 4; k++) g.set(80 + 3 + k - 2, 29 + 5 - k, STONE[5]);
    for (let k = 0; k < 6; k++) g.set(80 + 7 - 1 + k, 31 + 4 - Math.floor(k * 0.7), STONE[5]);
    // dart holes
    for (const [x, y] of [
      [Math.round(WALL_PX(0.05)), Math.round(WALL_PY(0.55))],
      [Math.round(WALL_PX(0.13)), Math.round(WALL_PY(0.41))],
      [Math.round(WALL_PX(-0.02)), Math.round(WALL_PY(0.33))],
    ])
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) g.set(x + i, y + j, STONE[0]);
  });
}

function makePillar() {
  return pixelTexture(48, 92, (g) => {
    const r = rng(31);
    masonry(g, r, [10, 14], [14, 22], (px, py) => [-1.2 + px * T, Y0 + 1.75 - py * T, -0.8]);
    for (let i = 0; i < 5; i++) crack(g, r, r() * 48, r() * 92, 8 + Math.floor(r() * 10), STONE[0]);
    for (let y = 60; y < 92; y++)
      for (let x = 0; x < 48; x++) {
        const m = vnoise(x * 0.2, y * 0.2, 7) + (y - 60) / 40;
        if (m > 1.15) g.set(x, y, pick(MOSS, 0.2 + (m - 1.15) * 1.6, bayer(x, y)));
      }
  });
}

function makeFlame(seed: number) {
  return pixelTexture(14, 24, (g) => {
    const r = rng(seed);
    for (let y = 0; y < 24; y++) {
      const t = y / 23;
      let hw = 0.6 + 6.2 * Math.pow(t, 0.62);
      if (t > 0.86) hw *= 1 - ((t - 0.86) / 0.14) * 0.55;
      const cx = 7 + Math.sin(t * 5 + seed) * 2.2 * (1 - t) + (seed % 2 ? 1 : -1) * (1 - t) * 1.2;
      for (let x = 0; x < 14; x++) {
        const d = Math.abs(x + 0.5 - cx) / hw + (r() - 0.5) * 0.18;
        if (d > 1) continue;
        const core = t > 0.42 && d < 0.3 + (t - 0.4) * 0.5;
        g.set(x, y, core ? (d < 0.14 ? "#fffbe0" : "#ffe66a") : d < 0.58 ? "#ffa622" : d < 0.82 ? "#e8591a" : "#b82a14");
      }
    }
  });
}

function makeWeb() {
  return pixelTexture(26, 26, (g) => {
    const web = "#c4cadc";
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * (Math.PI / 2);
      for (let s = 0; s < 25; s += 0.5) g.set(Math.round(Math.cos(a) * s), Math.round(Math.sin(a) * s), web);
    }
    for (const rad of [5, 10, 15, 20, 25])
      for (let k = 0; k < 6; k++) {
        const a0 = (k / 6) * (Math.PI / 2);
        const a1 = ((k + 1) / 6) * (Math.PI / 2);
        for (let s = 0; s <= 1; s += 0.08) {
          const a = a0 + (a1 - a0) * s;
          const rr = rad * (1 - 0.1 * Math.sin(s * Math.PI));
          g.set(Math.round(Math.cos(a) * rr), Math.round(Math.sin(a) * rr), web);
        }
      }
  });
}

const LOCK = pixelArt(
  ["kkkkkkkk", "kyyyyyyk", "kyhhhhyk", "kyhddhyk", "kyhddhyk", "kyyddyyk", "kyyyyyyk", "kyhyyhyk", "kyyyyyyk", "kkkkkkkk"],
  { k: "#2a1a08", y: "#c48a1c", h: "#ffe066", d: "#120c08" },
);

function makeRunePlate() {
  return pixelTexture(21, 21, (g) => {
    const r = rng(5);
    g.fill((x, y) => {
      const edge = Math.min(x, y, 20 - x, 20 - y);
      if (edge === 0) return STONE[0];
      if (edge === 1) return STONE[4];
      return pick(STONE, 0.35 + (r() - 0.5) * 0.14 + (x + y < 14 ? 0.08 : 0), bayer(x, y));
    });
    g.stamp(5, 4, [
      "..xxxxxxx..",
      ".xxxxxxxxx.",
      "xxxxxxxxxxx",
      "xx..xxx..xx",
      "xx..xxx..xx",
      "xxxxxxxxxxx",
      ".xxx.x.xxx.",
      "..xxxxxxx..",
      "..x.x.x.x..",
      "..x.x.x.x..",
      "...xxxxx...",
    ], { x: BLOOD[2] });
    g.stamp(5, 5, ["..........."], { x: BLOOD[0] });
    for (const [x, y] of [[2, 2], [18, 2], [2, 18], [18, 18]]) g.set(x, y, IRON[5]);
  });
}

function makePitPlate() {
  return pixelTexture(42, 42, (g) => {
    const r = rng(9);
    g.fill((x, y) => pick(IRON, 0.28 + (r() - 0.5) * 0.16 + (x % 21 === 0 || y % 21 === 0 ? -0.2 : 0), bayer(x, y)));
    for (const hx of [5, 13, 21, 29, 37])
      for (const hy of [5, 13, 21, 29, 37]) {
        for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) g.set(hx + i, hy + j, Math.abs(i) + Math.abs(j) > 3 ? IRON[1] : "#0a0608");
      }
    stain(g, 16, 22, 14, 10, 3, (d, x, y) => (d < 0.9 ? pick(BLOOD, 0.1 + 0.6 * (1 - d), bayer(x, y)) : undefined));
    for (let i = 0; i < 40; i++) g.set(Math.floor(r() * 42), Math.floor(r() * 42), RUST[Math.floor(r() * 4)]);
  });
}

const PAGE = pixelArt(["wwwwwwwwwwww", "wnnnnnnnnnnw", "wwwwwwwwwwww", "wnnnnnnnnwww", "wwwwwwwwwwww", "wnnnnnnnnnnw", "wwwwwwwwwwww"], {
  w: "#d6c9a2",
  n: "#6a5238",
});

// ---------------------------------------------------------------------------------------------------------------
// Paints

const woodPaint = cellPaint(
  T,
  (c) => {
    const v = 0.45 + 0.28 * c.n.y + 0.34 * (noise(c.at, 0.12, 2) - 0.5) + (c.random(2) < 0.05 ? -0.22 : 0);
    return c.pick(WOOD, v);
  },
  { dither: true },
);
const stonePaint = cellPaint(
  T,
  (c) => c.pick(STONE, 0.4 + 0.25 * c.n.y + 0.5 * (noise(c.at, 0.16, 3) - 0.5) + (c.random(3) < 0.06 ? -0.22 : 0)),
  { dither: true },
);
const stoneTopPaint = cellPaint(
  T,
  (c) => {
    const f = lightAt(c.at.x, c.at.y, c.at.z);
    const v = 0.4 + 0.25 * c.n.y + 0.5 * (noise(c.at, 0.16, 3) - 0.5);
    return f > 0.12 + 0.4 * c.threshold ? c.pick(STONE_W, Math.min(1, v * 0.62 + f * 0.6)) : c.pick(STONE, v);
  },
  { dither: true },
);
const ironPaint = cellPaint(
  T2,
  (c) => {
    if (c.random(5) < 0.03) return IRON[5];
    const rust = noise(c.at, 0.09, 6);
    if (rust > 0.68) return c.pick(RUST, 0.2 + (rust - 0.68) * 3 + (c.random(1) - 0.5) * 0.3);
    return c.pick(IRON, 0.38 + 0.3 * c.n.y + 0.22 * (c.random(2) - 0.5));
  },
  { dither: true },
);
const bonePaint = cellPaint(
  T2,
  (c) => {
    const v = 0.55 + 0.26 * c.n.y + 0.12 * (c.random(1) - 0.5) + 0.2 * (noise(c.at, 0.05, 3) - 0.5);
    return c.pick(BONE, v);
  },
  { dither: true },
);
const furPaint = cellPaint(T2, (c) => c.pick(FUR, 0.4 + 0.3 * c.n.y + 0.3 * (c.random(1) - 0.5)), { dither: true });
const spikeSteel = cellPaint(
  T2,
  (c) => {
    const h = c.at.y - (Y0 + 0.03);
    if (h < 0.05) return c.pick(RUST, 0.55 + (c.random(1) - 0.5) * 0.4);
    return c.pick(IRON, 0.4 + 0.2 * (h / 0.3) + 0.15 * c.n.x - 0.1 * c.n.z + 0.12 * (c.random(2) - 0.5));
  },
  { dither: true },
);
const spikeBlood = cellPaint(
  T2,
  (c) => {
    const h = c.at.y - (Y0 + 0.03);
    if (h < 0.05) return c.pick(RUST, 0.55 + (c.random(1) - 0.5) * 0.4);
    const drip = h > 0.1 + 0.07 * c.random(4) + (c.u % 2 ? 0.04 : 0);
    if (drip) return c.pick(BLOOD, 0.2 + 0.7 * ((h - 0.1) / 0.2) + 0.3 * (c.random(3) - 0.5));
    return c.pick(IRON, 0.4 + 0.15 * c.n.x);
  },
  { dither: true },
);
const wrapPaint = (base: THREE.Vector3, dir: THREE.Vector3) =>
  cellPaint(
    T2,
    (c) => {
      const s = c.at.clone().sub(base).dot(dir);
      const band = Math.floor(s / 0.02) % 2 === 0;
      const char = noise(c.at, 0.06, 4);
      const v = (band ? 0.55 : 0.3) + 0.2 * c.n.y + 0.25 * (c.random(1) - 0.5) - 0.45 * Math.max(0, char - 0.4);
      return c.pick(CLOTH, v);
    },
    { dither: true },
  );
const hazardPaint = cellPaint(
  T2 * 2,
  (c) => {
    const worn = c.random(4) < 0.28 || noise(c.at, 0.1, 7) > 0.72;
    if (c.n.y < 0.5) return c.pick(STONE, 0.3 + 0.2 * c.n.y);
    if (worn) return c.pick(STONE, 0.4 + 0.2 * (c.random(3) - 0.5));
    return (c.u + c.v) % 6 < 3 ? c.pick(GOLD, 0.35 + 0.12 * (c.random(2) - 0.5)) : c.pick(IRON, 0.12 + 0.08 * c.random(2));
  },
  { dither: true },
);

// ---------------------------------------------------------------------------------------------------------------

type PO = Omit<NonNullable<Parameters<ReturnType<typeof createBuilder>["part"]>[2]>, "bone">;
const UP = new THREE.Vector3(0, 1, 0);

export default function build() {
  const b = createBuilder({ name: "dungeonProps", paintSize: 2048 });
  const root = b.joint("floor", { at: [0, 0, 0] });
  const r = rng(77);

  const P = (geo: THREE.BufferGeometry, color: ColorInput, at: V3, o: PO = {}) => b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, color: ColorInput, at: V3, o: PO = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const vecOf = (v: V3) => new THREE.Vector3(...(v as number[]));

  /** Places geometry already in model space, merged per colour. */
  const mergedPart = (geos: THREE.BufferGeometry[], color: ColorInput, name: string) => {
    if (geos.length === 0) return null;
    return b.part(mergeGeometries(geos)!, color, { bone: root, at: [0, 0, 0], name });
  };
  const inst = (geo: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0]) => {
    geo.applyMatrix4(
      new THREE.Matrix4().compose(
        vecOf(pos),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ")),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    return geo;
  };

  // =============================================================================================================
  // Floor slab, plinth, back wall, pillars
  const floorTex = makeFloor();
  b.part(tileBox([2.9, 0.04, 2.7], floorTex, T, {}), stonePaint, { bone: root, at: [0, 0.02, 0.1], name: "plinth" });
  b.part(tileBox([2.8, 0.04, 2.6], floorTex, T), "#ffffff", { bone: root, at: [0, 0.06, 0.1], texture: floorTex, name: "floor" });

  const wallTex = makeWall();
  b.part(tileBox([2.8, 1.6, 0.3], wallTex, T), "#ffffff", { bone: root, at: [0, Y0 + 0.8, -1.05], texture: wallTex, name: "wall" });

  const pillarTex = makePillar();
  for (const s of [1, -1]) {
    b.part(tileBox([0.28, 1.75, 0.4], pillarTex, T, { rand: r, step: [1, 1] }), "#ffffff", {
      bone: root,
      at: [s * 1.26, Y0 + 0.875, -1.0],
      texture: pillarTex,
      name: "pillar",
    });
    box(0.36, 0.08, 0.48, stoneTopPaint, [s * 1.26, Y0 + 1.79, -0.99], { name: "pillarCap" });
    box(0.4, 0.04, 0.52, stoneTopPaint, [s * 1.26, Y0 + 1.85, -0.99], { name: "pillarCapTop" });
    box(0.34, 0.1, 0.46, stonePaint, [s * 1.26, Y0 + 0.05, -1.0], { name: "pillarBase" });
    box(0.3, 0.04, 0.42, stonePaint, [s * 1.26, Y0 + 0.12, -1.0], { name: "pillarBase" });
  }
  // crumbled wall top
  {
    let x = -1.1;
    while (x < 1.1) {
      const w = 0.16 + r() * 0.14;
      const h = 0.05 + r() * 0.1;
      box(w, h, 0.28, stoneTopPaint, [x + w / 2, WALL_TOP + h / 2 - 0.005, -1.05], { name: "crumble" });
      x += w + 0.01 + r() * 0.04;
    }
  }
  // fallen rubble at the wall foot
  for (const [x, z, s, rot] of [
    [-0.82, -0.82, 0.1, 20],
    [-0.72, -0.78, 0.07, 55],
    [0.1, -0.84, 0.09, 12],
    [0.56, -0.84, 0.07, 70],
    [1.0, -0.82, 0.08, 40],
    [-1.05, 0.05, 0.08, 33],
    [-0.15, 1.2, 0.07, 10],
  ] as const)
    box(s * 1.3, s * 0.8, s, stoneTopPaint, [x, Y0 + s * 0.4, z], { rotation: [0, rot, 0], name: "rubble" });

  // cobwebs in the upper corners, over the barrels
  const WEB = makeWeb();
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: root, at: [-1.1 + 0.25, WALL_TOP - 0.25, -0.898], dir: [0, 0, 1], axis: "z", texture: WEB, name: "webL" });
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: root, at: [1.1 - 0.2, WALL_TOP - 0.2, -0.898], dir: [0, 0, 1], axis: "z", texture: WEB, mirror: false, rotation: [0, 0, 90], name: "webR" });
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: root, at: [-1.1 + 0.17, Y0 + 0.17, -0.898], dir: [0, 0, 1], axis: "z", texture: WEB, rotation: [0, 0, -90], name: "webFoot" });

  // =============================================================================================================
  // Torches
  const flameA = makeFlame(3);
  const flameB = makeFlame(8);
  const coalGeos: THREE.BufferGeometry[] = [];
  function torch(x: number) {
    const Bt = new THREE.Vector3(x, 0.86, -0.855);
    const Tt = new THREE.Vector3(x, 1.3, -0.635);
    const d = Tt.clone().sub(Bt);
    const len = d.length();
    d.normalize();
    // back plate with rivets and a cradle arm
    box(0.15, 0.3, 0.03, ironPaint, [x, 0.98, -0.885], { name: "torchPlate" });
    for (const [dx, dy] of [
      [-0.05, 0.11],
      [0.05, 0.11],
      [-0.05, -0.11],
      [0.05, -0.11],
    ])
      box(0.022, 0.022, 0.012, IRON[5], [x + dx, 0.98 + dy, -0.865], { name: "rivet" });
    b.rod([x, 0.9, -0.87], [x, 0.9, -0.8], 0.025, { section: "box", color: ironPaint, bone: root, name: "torchArm" });
    box(0.1, 0.03, 0.1, ironPaint, [x, 0.84, -0.82], { name: "torchCup" });
    // wooden shaft, iron rings, wrapped head
    b.rod(Bt, Tt.clone().addScaledVector(d, -0.12), 0.026, { section: "box", color: woodPaint, bone: root, name: "torchShaft" });
    for (const t of [0.22, 0.52]) {
      const at = Bt.clone().addScaledVector(d, len * t);
      b.lathe(
        [
          [0.034, -0.014],
          [0.05, -0.014],
          [0.05, 0.014],
          [0.034, 0.014],
        ],
        { at, axis: d, segments: 6, color: ironPaint, bone: root, name: "torchRing" },
      );
    }
    b.rod(
      [x, 1.1, -0.84],
      Bt.clone().addScaledVector(d, len * 0.52).add(new THREE.Vector3(0, 0, -0.03)),
      0.014,
      { section: "box", color: ironPaint, bone: root, name: "torchStay" },
    );
    const headBase = Bt.clone().addScaledVector(d, len * 0.74);
    b.frustumBox(headBase, Tt, [0.065, 0.065], [0.12, 0.12], { color: wrapPaint(headBase, d), bone: root, name: "torchHead" });
    b.frustumBox(Tt.clone().addScaledVector(d, -0.004), Tt.clone().addScaledVector(d, 0.014), [0.13, 0.13], [0.1, 0.1], {
      color: "#2a1c14",
      bone: root,
      name: "torchPitch",
    });
    // flame cards (pixel flames, self-lit) and drifting embers
    const base = Tt.clone().addScaledVector(d, 0.01);
    glow(b.cards([frame(base, [0, 1, 0])], flameA, { size: [0.21, 0.36], cross: true, flow: [0, 0, 1], lean: 0, sink: 0 }), 1.3);
    glow(b.cards([frame(base.clone().add(new THREE.Vector3(0, 0, 0.01)), [0, 1, 0])], flameB, { size: [0.14, 0.24], cross: true, flow: [0.3, 0, 1], lean: 0, sink: 0 }), 1.5);
    for (let i = 0; i < 4; i++)
      coalGeos.push(
        inst(new THREE.BoxGeometry(0.014, 0.014, 0.014), [x + (r() - 0.5) * 0.16, Tt.y + 0.18 + r() * 0.22, Tt.z + (r() - 0.5) * 0.1], [r() * 90, r() * 90, 0]),
      );
  }
  torch(TORCH_X[0]);
  torch(TORCH_X[1]);

  // fallen, burnt-out torch on the floor
  {
    const A = new THREE.Vector3(-0.12, Y0 + 0.027, 1.2);
    const Z = new THREE.Vector3(0.26, Y0 + 0.027, 1.06);
    const dd = Z.clone().sub(A).normalize();
    b.rod(A, Z.clone().addScaledVector(dd, -0.1), 0.026, { section: "box", color: woodPaint, bone: root, name: "deadShaft" });
    const hb = Z.clone().addScaledVector(dd, -0.17);
    b.frustumBox(hb, Z.clone().add(new THREE.Vector3(0, 0.012, 0)), [0.065, 0.065], [0.115, 0.115], { color: wrapPaint(hb, dd), bone: root, name: "deadHead" });
    for (const [dx, dz] of [
      [0.05, 0.05],
      [0.1, -0.04],
      [0.2, 0.0],
    ])
      coalGeos.push(inst(new THREE.BoxGeometry(0.016, 0.012, 0.016), [0.26 + dx * 0.4, Y0 + 0.015, 1.06 + dz], [0, 20 * dx, 0]));
    // soot smudge
    box(0.22, 0.004, 0.12, "#1a1412", [0.38, Y0 + 0.003, 1.08], { rotation: [0, -20, 0], name: "soot" });
  }

  // =============================================================================================================
  // Candle niche on the wall: ledge, skull, candle
  box(0.4, 0.06, 0.24, stoneTopPaint, [NICHE_X, 1.145, -0.8], { name: "ledge" });
  box(0.34, 0.04, 0.04, stonePaint, [NICHE_X, 1.1, -0.68], { name: "ledgeLip" });
  for (const dx of [-0.13, 0.13]) box(0.06, 0.1, 0.16, stonePaint, [NICHE_X + dx, 1.07, -0.82], { name: "corbel" });
  // candle (cream wax, drips, wick, self-lit flame)
  {
    const cx = NICHE_X - 0.09;
    b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.02, 6), IRON[3], { bone: root, at: [cx, 1.185, -0.8], name: "candleDish" });
    b.part(new THREE.CylinderGeometry(0.022, 0.025, 0.11, 6), "#ece0bd", { bone: root, at: [cx, 1.245, -0.8], name: "candle" });
    for (const [dx, dz, h] of [
      [0.022, 0.0, 0.05],
      [-0.01, 0.022, 0.035],
    ])
      box(0.012, h, 0.012, "#ece0bd", [cx + dx, 1.3 - h / 2 - 0.0, -0.8 + dz], { name: "wax" });
    box(0.006, 0.014, 0.006, "#1a1210", [cx, 1.308, -0.8], { name: "wick" });
    glow(b.cards([frame([cx, 1.31, -0.8], [0, 1, 0])], flameA, { size: [0.05, 0.085], cross: true, flow: [0, 0, 1], sink: 0 }), 1.4);
    // a second, squat candle
    b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.05, 6), "#d9cba4", { bone: root, at: [NICHE_X + 0.1, 1.2, -0.84], name: "candle2" });
    box(0.005, 0.012, 0.005, "#1a1210", [NICHE_X + 0.1, 1.232, -0.84], { name: "wick" });
    glow(b.cards([frame([NICHE_X + 0.1, 1.234, -0.84], [0, 1, 0])], flameB, { size: [0.04, 0.07], cross: true, flow: [0, 0, 1], sink: 0 }), 1.4);
  }

  // =============================================================================================================
  // Skulls (Minecraft-style skin sheet, one texel = 1 cm)
  const SK = 0.0105;
  const skinSizes = { cran: [16, 11, 16], maxi: [12, 5, 9], jaw: [12, 4, 11] } as const;
  const sk = skinLayout({ cran: [...skinSizes.cran], maxi: [...skinSizes.maxi], jaw: [...skinSizes.jaw] }, 64);
  const SKULL = pixelTexture(sk.size[0], sk.size[1], (g) => {
    const rr = rng(41);
    for (const faces of Object.values(sk.faces))
      for (const [face, rect] of Object.entries(faces)) {
        const shade = face === "py" ? 0.82 : face === "ny" ? 0.32 : face === "pz" ? 0.68 : 0.55;
        g.fill((x, y) => pick(BONE, shade + (rr() - 0.5) * 0.18 - (y / rect[3]) * 0.04, bayer(x, y)), rect);
      }
    const f = sk.faces.cran.pz;
    // eye sockets, brow ridge, temple shading
    for (const ex of [2, 10]) {
      g.fill(() => "#120c0a", [f[0] + ex, f[1] + 4, 4, 4]);
      g.fill(() => BONE[1], [f[0] + ex, f[1] + 8, 4, 1]);
      g.set(f[0] + ex + 1, f[1] + 5, "#2a1410");
    }
    g.fill(() => BONE[5], [f[0] + 1, f[1] + 3, 14, 1]);
    g.fill(() => BONE[3], [f[0] + 6, f[1] + 3, 4, 1]);
    // cracks on the dome
    const top = sk.faces.cran.py;
    for (let i = 0; i < 9; i++) g.set(top[0] + 3 + i, top[1] + 2 + ((i * 7) % 5), BONE[0]);
    for (let i = 0; i < 5; i++) g.set(top[0] + 8 + (i % 2), top[1] + 6 + i, BONE[1]);
    const m = sk.faces.maxi.pz;
    g.fill(() => "#1c120e", [m[0] + 5, m[1], 2, 2]);
    g.set(m[0] + 5, m[1] + 2, "#1c120e");
    g.set(m[0] + 6, m[1] + 2, "#1c120e");
    for (let x = 0; x < 12; x++) {
      g.set(m[0] + x, m[1] + 3, x % 2 ? BONE[1] : BONE[5]);
      g.set(m[0] + x, m[1] + 4, x % 2 ? "#120c0a" : BONE[4]);
    }
    const j = sk.faces.jaw.pz;
    for (let x = 0; x < 12; x++) {
      g.set(j[0] + x, j[1], x % 2 ? BONE[1] : BONE[5]);
      g.set(j[0] + x, j[1] + 1, x % 2 ? "#120c0a" : BONE[4]);
    }
    for (const side of [sk.faces.cran.px, sk.faces.cran.nx]) g.fill(() => BONE[1], [side[0] + 5, side[1] + 4, 3, 3]);
  });
  const skullPart = (px: [number, number, number], size: readonly [number, number, number], key: "cran" | "maxi" | "jaw") =>
    skinBox(SKULL, sk.faces[key], SK) && ({ geo: skinBox(SKULL, sk.faces[key], SK), c: px.map((v) => v * SK) as [number, number, number], size });

  function skull(origin: V3, yaw: number, pitch: number, roll: number, o: { jaw?: boolean; jawOpen?: number } = {}) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ"));
    const O = vecOf(origin);
    const put = (item: ReturnType<typeof skullPart>, extra?: { pivot: THREE.Vector3; angle: number }) => {
      const local = vecOf(item.c);
      const qq = q.clone();
      if (extra) {
        const qe = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), extra.angle * DEG);
        local.sub(extra.pivot).applyQuaternion(qe).add(extra.pivot);
        qq.multiply(qe);
      }
      const pos = local.applyQuaternion(q).add(O);
      b.part(item.geo, "#ffffff", { bone: root, at: pos, quat: qq, texture: SKULL, name: "skull" });
    };
    put(skullPart([0, 13.5, 3], skinSizes.cran, "cran"));
    put(skullPart([0, 6.5, 7], skinSizes.maxi, "maxi"));
    if (o.jaw !== false) put(skullPart([0, 2, 6.5], skinSizes.jaw, "jaw"), { pivot: vecOf([0, 5 * SK, 0]), angle: -(o.jawOpen ?? 8) });
  }

  // =============================================================================================================
  // Long bones, ribcage, pelvis
  const longBone = (a: V3, c: V3, rad = 0.013) => {
    const A = vecOf(a);
    const C = vecOf(c);
    const dir = C.clone().sub(A).normalize();
    const side = new THREE.Vector3().crossVectors(dir, UP);
    if (side.lengthSq() < 0.05) side.set(1, 0, 0);
    side.normalize();
    b.rod(A.clone().addScaledVector(dir, rad * 1.6), C.clone().addScaledVector(dir, -rad * 1.6), [rad * 1.05, rad * 0.85], {
      section: "box",
      color: bonePaint,
      bone: root,
      name: "longBone",
    });
    const k = rad * 2.1;
    P(new THREE.BoxGeometry(k, k * 1.5, k), bonePaint, A.clone().addScaledVector(dir, k * 0.5), { dir, name: "boneHead" });
    for (const s of [-1, 1])
      P(new THREE.BoxGeometry(k * 0.9, k * 1.4, k * 1.1), bonePaint, C.clone().addScaledVector(side, s * rad * 1.1).addScaledVector(dir, -k * 0.5), { dir, name: "condyle" });
  };

  function ribcage(origin: V3, yaw: number, roll: number, scale = 1, missing: number[] = []) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw * DEG, roll * DEG, "YXZ"));
    const O = vecOf(origin);
    const tf = (x: number, y: number, z: number) => new THREE.Vector3(x * scale, y * scale, z * scale).applyQuaternion(q).add(O);
    const spineStart = 0;
    // vertebrae and spinal rod
    b.rod(tf(0, 0.014, spineStart), tf(0, 0.014, 0.4), 0.008, { section: "box", color: bonePaint, bone: root, name: "spine" });
    for (let i = 0; i < 10; i++) {
      const z = 0.02 + i * 0.04;
      P(new THREE.BoxGeometry(0.034 * scale, 0.028 * scale, 0.028 * scale), bonePaint, tf(0, 0.016, z), { quat: q, name: "vertebra" });
      P(new THREE.BoxGeometry(0.01 * scale, 0.012 * scale, 0.016 * scale), bonePaint, tf(0, 0.034, z), { quat: q, name: "spinous" });
    }
    const sizes = [0.62, 0.8, 0.95, 1, 0.97, 0.86, 0.66];
    sizes.forEach((sc, i) => {
      for (const s of [1, -1]) {
        if (missing.includes(i * 2 + (s > 0 ? 0 : 1))) continue;
        const z = 0.05 + i * 0.044;
        const pts = [
          tf(s * 0.016, 0.022, z),
          tf(s * 0.078 * sc, 0.03 * sc, z - 0.004),
          tf(s * 0.122 * sc, 0.085 * sc, z - 0.012),
          tf(s * 0.108 * sc, 0.145 * sc, z - 0.02),
          tf(s * 0.05 * sc, 0.178 * sc, z - 0.03),
          tf(s * 0.018 * sc, 0.184 * sc, z - 0.034),
        ];
        b.sweep(catmull(pts), 0.0068 * scale, { section: "box", color: bonePaint, bone: root, caps: "flat", name: "rib" });
      }
    });
    P(new THREE.BoxGeometry(0.036 * scale, 0.014 * scale, 0.2 * scale), bonePaint, tf(0, 0.19, 0.17), { quat: q, name: "sternum" });
  }

  function pelvis(origin: V3, yaw: number, roll = 0) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw * DEG, roll * DEG, "YXZ"));
    const O = vecOf(origin);
    const tf = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(O);
    P(new THREE.BoxGeometry(0.07, 0.04, 0.07), bonePaint, tf(0, 0.03, 0), { quat: q, name: "sacrum" });
    for (const s of [1, -1]) {
      const wing = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, s * 0.45)));
      P(new THREE.BoxGeometry(0.13, 0.03, 0.1), bonePaint, tf(s * 0.1, 0.05, -0.01), { quat: wing, name: "ilium" });
      P(new THREE.BoxGeometry(0.04, 0.028, 0.08), bonePaint, tf(s * 0.075, 0.02, 0.07), { quat: q, name: "ischium" });
    }
    P(new THREE.BoxGeometry(0.06, 0.026, 0.026), bonePaint, tf(0, 0.02, 0.1), { quat: q, name: "pubis" });
  }

  // --- the skeleton that met the trap: ribcage on the spikes, skull on a spike, scattered limbs
  const TRAP_X = 0.05;
  const TRAP_Z = 0.55;
  const PIT_TOP = Y0 + 0.1;
  const SPIKE_BASE = Y0 + 0.03;
  const spikeTop = (ix: number, iz: number, hgt = 0.32) => [TRAP_X + ix * 0.16, SPIKE_BASE + hgt, TRAP_Z + iz * 0.16] as const;

  // ribcage lying across the spike tips
  ribcage([TRAP_X - 0.2, SPIKE_BASE + 0.27, TRAP_Z - 0.28], 20, 14, 1.0, [1, 8]);
  // skull driven onto a corner spike (jawless)
  {
    const t = spikeTop(2, 2, 0.5);
    skull([t[0], t[1] - 0.06, t[2]], 215, 12, -8, { jaw: false });
  }
  // second skull rolled to the floor with its jaw hanging
  skull([-0.82, Y0 + 0.0, 0.98], 160, 0, 8, { jawOpen: 24 });
  skull([-1.05, Y0 + 0.0, 0.5], 40, 0, 0, { jaw: false });
  // loose bones
  longBone([-0.6, Y0 + 0.015, 1.1], [-0.2, Y0 + 0.015, 0.95]);
  longBone([-1.1, Y0 + 0.015, 0.2], [-0.95, Y0 + 0.015, 0.72], 0.012);
  longBone([0.42, PIT_TOP + 0.012, TRAP_Z - 0.15], [0.9, Y0 + 0.012, TRAP_Z - 0.6], 0.012); // femur sliding off the rim
  longBone([-0.38, Y0 + 0.012, 0.75], [-0.5, Y0 + 0.012, 1.18], 0.011);
  longBone([0.78, Y0 + 0.012, 1.2], [1.1, Y0 + 0.012, 1.3], 0.011);
  pelvis([-0.95, Y0 + 0.012, 1.05], 30, 4);
  ribcage([-0.5, Y0 + 0.004, 1.34], 95, 0, 0.55, [0, 3, 6, 9]);
  // hand bones near the plate, jaw bone
  {
    const hand: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2;
      hand.push(inst(new THREE.BoxGeometry(0.026, 0.011, 0.011), [-0.7 + Math.cos(a) * 0.12 * r(), Y0 + 0.006, 0.55 + Math.sin(a) * 0.12 * r()], [0, r() * 180, 0]));
    }
    mergedPart(hand, bonePaint, "fingerBones");
    const vert: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 7; i++)
      vert.push(inst(new THREE.BoxGeometry(0.034, 0.026, 0.03), [-0.2 + r() * 0.5, Y0 + 0.013, 1.0 + r() * 0.35], [0, r() * 180, 0]));
    mergedPart(vert, bonePaint, "strayVertebrae");
  }

  // =============================================================================================================
  // Spike trap
  box(1.04, 0.1, 0.1, hazardPaint, [TRAP_X, Y0 + 0.05, TRAP_Z - 0.47], { name: "pitFrame" });
  box(1.04, 0.1, 0.1, hazardPaint, [TRAP_X, Y0 + 0.05, TRAP_Z + 0.47], { name: "pitFrame" });
  box(0.1, 0.1, 0.84, hazardPaint, [TRAP_X - 0.47, Y0 + 0.05, TRAP_Z], { name: "pitFrame" });
  box(0.1, 0.1, 0.84, hazardPaint, [TRAP_X + 0.47, Y0 + 0.05, TRAP_Z], { name: "pitFrame" });
  box(1.12, 0.028, 1.12, stoneTopPaint, [TRAP_X, Y0 + 0.014, TRAP_Z], { name: "pitSurround" });
  const PIT = makePitPlate();
  b.part(tileBox([0.84, 0.04, 0.84], PIT, T), "#ffffff", { bone: root, at: [TRAP_X, Y0 + 0.012 + 0.0, TRAP_Z], texture: PIT, name: "pitFloor" });
  // one sunken screw per corner
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.03, 0.016, 0.03, IRON[5], [TRAP_X + sx * 0.47, PIT_TOP + 0.006, TRAP_Z + sz * 0.47], { name: "frameBolt" });
  const bloody = new Set(["-1,-1", "-1,0", "0,-1", "2,2", "1,1", "-2,-1"]);
  for (let ix = -2; ix <= 2; ix++)
    for (let iz = -2; iz <= 2; iz++) {
      const key = `${ix},${iz}`;
      const hgt = ix === 2 && iz === 2 ? 0.5 : 0.28 + r() * 0.08 + (Math.abs(ix) + Math.abs(iz) === 0 ? -0.04 : 0);
      const geo = new THREE.ConeGeometry(0.04, hgt, 4, 1);
      geo.rotateY(Math.PI / 4);
      const x = TRAP_X + ix * 0.16;
      const z = TRAP_Z + iz * 0.16;
      box(0.085, 0.03, 0.085, ironPaint, [x, SPIKE_BASE + 0.005, z], { name: "spikeCollar" });
      P(geo, bloody.has(key) ? spikeBlood : spikeSteel, [x, SPIKE_BASE + 0.02 + hgt / 2, z], { name: "spike" });
    }

  // pressure plate with a skull rune, and its sunken frame
  const RUNE = makeRunePlate();
  const PLATE = [-0.85, 0.3] as const;
  b.part(tileBox([0.42, 0.03, 0.42], RUNE, T2 * 2), "#ffffff", { bone: root, at: [PLATE[0], Y0 + 0.012, PLATE[1]], texture: RUNE, name: "pressurePlate" });
  for (const [dx, dz, w, d] of [
    [0, -0.235, 0.5, 0.05],
    [0, 0.235, 0.5, 0.05],
    [-0.235, 0, 0.05, 0.42],
    [0.235, 0, 0.05, 0.42],
  ] as const)
    box(w, 0.04, d, stonePaint, [PLATE[0] + dx, Y0 + 0.02, PLATE[1] + dz], { name: "plateFrame" });
  // darts that fired from the wall
  for (const [x, y, len] of [
    [0.05, 0.55, 0.2],
    [0.13, 0.41, 0.15],
  ] as const) {
    b.rod([x, y, -0.9], [x, y, -0.9 + len], 0.005, { section: "box", color: IRON[3], bone: root, name: "dart" });
    b.spike([x, y, -0.9 + len], [0, 0, 1], 0.001, 0.0, { color: IRON[3] });
    box(0.03, 0.002, 0.045, "#b02828", [x, y, -0.9 + len - 0.02], { name: "dartFletch" });
    box(0.002, 0.03, 0.045, "#b02828", [x, y, -0.9 + len - 0.02], { name: "dartFletch" });
  }
  // a dart lying on the floor
  b.rod([0.62, Y0 + 0.006, 1.0], [0.8, Y0 + 0.006, 0.9], 0.005, { section: "box", color: IRON[3], bone: root, name: "dart" });

  // =============================================================================================================
  // Chest
  const CX = -0.6;
  const CZ = -0.42;
  const CW = 0.92;
  const CD = 0.56;
  const CTOP = Y0 + 0.36;
  const chestPaint = cellPaint(
    T2,
    (c) => {
      const lx = c.at.x - CX;
      const ly = c.at.y - Y0;
      const lz = c.at.z - CZ;
      const strapX = Math.abs(Math.abs(lx) - 0.29) < 0.04;
      const cornerFront = c.axis === 2 && Math.abs(lx) > CW / 2 - 0.05;
      const cornerSide = c.axis === 0 && Math.abs(lz) > CD / 2 - 0.05;
      const band = ly < 0.05 || ly > 0.31;
      if (c.axis !== 1 && ((c.axis === 2 && (strapX || cornerFront)) || cornerSide || band)) {
        const rivet = (c.u % 5 === 0 && c.v % 5 === 0) || ((band || cornerSide) && c.u % 7 === 0 && c.v % 5 === 0);
        if (rivet) return IRON[5];
        const rust = noise(c.at, 0.08, 6);
        if (rust > 0.7) return c.pick(RUST, 0.25 + (rust - 0.7) * 3);
        return c.pick(IRON, 0.34 + 0.25 * c.n.y + 0.24 * (c.random(2) - 0.5));
      }
      if (c.axis === 1 && c.n.y > 0) return c.pick(WOOD, 0.3 + 0.1 * c.random(1));
      const plank = Math.floor(ly / 0.06);
      const seam = ((c.v % 6) + 6) % 6 === 0 && c.axis !== 1;
      const pv = 0.38 + 0.28 * hash(plank, c.axis, 5) + 0.28 * (noise(c.at, 0.1, 2) - 0.5);
      if (seam) return c.pick(WOOD, 0.08);
      const knot = c.random(3) < 0.03;
      return c.pick(WOOD, pv + (knot ? -0.22 : 0.1 * (c.random(1) - 0.5)));
    },
    { dither: true },
  );
  // body: solid base, four walls around a coin cavity
  const wallH = CTOP - Y0;
  box(CW, wallH - 0.1, CD, chestPaint, [CX, Y0 + (wallH - 0.1) / 2, CZ], { name: "chestBase" });
  box(CW, 0.1, 0.05, chestPaint, [CX, CTOP - 0.05, CZ + CD / 2 - 0.025], { name: "chestFrontWall" });
  box(CW, 0.1, 0.05, chestPaint, [CX, CTOP - 0.05, CZ - CD / 2 + 0.025], { name: "chestBackWall" });
  for (const s of [1, -1]) box(0.05, 0.1, CD - 0.1, chestPaint, [CX + s * (CW / 2 - 0.025), CTOP - 0.05, CZ], { name: "chestSideWall" });
  // raised iron straps and corner caps
  for (const s of [1, -1]) {
    box(0.075, wallH - 0.002, 0.014, ironPaint, [CX + s * 0.29, Y0 + wallH / 2, CZ + CD / 2 + 0.006], { name: "strap" });
    box(0.075, wallH - 0.002, 0.014, ironPaint, [CX + s * 0.29, Y0 + wallH / 2, CZ - CD / 2 - 0.006], { name: "strap" });
    for (const t of [1, -1]) {
      box(0.016, wallH - 0.002, 0.07, ironPaint, [CX + s * (CW / 2 + 0.006), Y0 + wallH / 2, CZ + t * (CD / 2 - 0.035)], { name: "cornerPost" });
      box(0.07, wallH - 0.002, 0.016, ironPaint, [CX + s * (CW / 2 - 0.035), Y0 + wallH / 2, CZ + t * (CD / 2 + 0.006)], { name: "cornerPost" });
    }
    box(0.016, 0.085, CD - 0.02, ironPaint, [CX + s * (CW / 2 + 0.006), Y0 + 0.2, CZ], { name: "sideBand" });
  }
  box(CW + 0.03, 0.06, CD + 0.03, ironPaint, [CX, Y0 + 0.03, CZ], { name: "chestFoot" });
  // feet
  for (const s of [1, -1]) for (const t of [1, -1]) box(0.09, 0.03, 0.09, ironPaint, [CX + s * 0.4, Y0 + 0.015, CZ + t * 0.23], { name: "chestPaw" });
  // lock plate on the front
  b.part(new THREE.PlaneGeometry(0.1, 0.125), "#ffffff", { bone: root, at: [CX, CTOP - 0.1, CZ + CD / 2 + 0.017], dir: [0, 0, 1], axis: "z", texture: LOCK, name: "lock" });

  // hoard: coin mound, bars, gems, spilled coins
  const goldShades = ["#c48a1c", "#eeb82e", "#ffe066"];
  const coinGroups: THREE.BufferGeometry[][] = [[], [], []];
  for (let i = 0; i < 110; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r());
    const x = CX + Math.cos(a) * rad * (CW / 2 - 0.07);
    const z = CZ + Math.sin(a) * rad * (CD / 2 - 0.07);
    const h = CTOP - 0.06 + (1 - rad * rad) * 0.1 + r() * 0.025;
    coinGroups[Math.floor(r() * 3)].push(inst(new THREE.CylinderGeometry(0.027, 0.027, 0.008, 8), [x, h, z], [(r() - 0.5) * 60, r() * 180, (r() - 0.5) * 60]));
  }
  for (let i = 0; i < 26; i++) {
    const x = CX + 0.1 + r() * 0.8;
    const z = CZ + 0.4 + r() * 0.5;
    coinGroups[Math.floor(r() * 3)].push(inst(new THREE.CylinderGeometry(0.027, 0.027, 0.008, 8), [x, Y0 + 0.005 + (r() < 0.2 ? 0.009 : 0), z], [r() < 0.15 ? 70 : 0, r() * 180, 0]));
  }
  coinGroups.forEach((g, i) => mergedPart(g, goldShades[i], "coins"));
  box(0.15, 0.05, 0.075, "#ffe066", [CX - 0.22, CTOP + 0.01, CZ - 0.1], { rotation: [0, 14, 0], name: "goldBar" });
  box(0.15, 0.05, 0.075, "#eeb82e", [CX - 0.2, CTOP + 0.06, CZ - 0.1], { rotation: [0, -8, 0], name: "goldBar" });
  box(0.15, 0.05, 0.075, "#c48a1c", [CX - 0.3, CTOP + 0.03, CZ + 0.04], { rotation: [0, 70, 10], name: "goldBar" });
  // gems (glowing) and a goblet
  const gem = (color: string, at: V3, s: number, rot: V3 = [0, 0, 0]) =>
    glow(P(new THREE.OctahedronGeometry(s), color, at, { rotation: rot, name: "gem" }), 0.9);
  gem("#d4203c", [CX + 0.12, CTOP + 0.11, CZ + 0.02], 0.032, [0, 30, 0]);
  gem("#20c060", [CX + 0.26, CTOP + 0.075, CZ - 0.06], 0.026, [20, 10, 0]);
  gem("#2a70f0", [CX + 0.02, CTOP + 0.1, CZ + 0.1], 0.024, [0, 60, 12]);
  gem("#e060f0", [CX - 0.05, CTOP + 0.125, CZ - 0.04], 0.022, [0, 0, 20]);
  gem("#d4203c", [CX + 0.78 - 0.3, Y0 + 0.03, CZ + 0.62], 0.026, [10, 40, 0]);
  gem("#2a70f0", [CX + 0.28, Y0 + 0.022, CZ + 0.75], 0.02, [0, 20, 30]);
  b.lathe(
    [
      [0, 0],
      [0.034, 0],
      [0.012, 0.012],
      [0.012, 0.045],
      [0.042, 0.06],
      [0.05, 0.1],
      [0.04, 0.1],
      [0.034, 0.066],
      [0, 0.062],
    ],
    { at: [CX + 0.3, CTOP + 0.045, CZ + 0.08], segments: 8, color: "#eeb82e", bone: root, name: "goblet" },
  );

  // lid: stepped barrel-vault on a hinge joint, opened to the back
  const hinge = [CX, CTOP, CZ - CD / 2] as const;
  const lid = b.joint("chestLid", { parent: root, at: hinge, dir: [1, 0, 0], role: "hinge" });
  const LC = 0.03;
  const LW = CW + 0.04;
  const lidOutline = stepped(
    [
      [0, 19],
      [0, 19],
      [0, 19],
      [1, 18],
      [2, 17],
      [3, 16],
      [5, 14],
      [8, 11],
    ],
    LC,
    { rows: true },
  );
  const LZ0 = -0.015;
  const lidPaint = cellPaint(
    T2,
    (c) => {
      const rel = c.at.clone().sub(vecOf(hinge));
      const strapX = Math.abs(Math.abs(rel.x) - 0.29) < 0.04;
      if (c.axis === 0 || strapX || (c.axis === 2 && c.v < 3 + Math.round(CTOP * 100) % 1)) {
        const rivet = (c.u % 5 === 0 && c.v % 5 === 0) || (c.axis === 0 && c.u % 6 === 0 && c.v % 6 === 0);
        if (rivet) return IRON[5];
        const rust = noise(c.at, 0.08, 6);
        if (rust > 0.7) return c.pick(RUST, 0.25 + (rust - 0.7) * 3);
        return c.pick(IRON, 0.34 + 0.25 * c.n.y + 0.24 * (c.random(2) - 0.5));
      }
      if (c.n.y < -0.5) {
        // velvet lining with a gold trim
        const edge = Math.abs(rel.x) > CW / 2 - 0.05 || rel.z > 0.5;
        if (edge) return c.pick(GOLD, 0.45 + 0.1 * (c.random(1) - 0.5));
        return c.pick(VELVET, 0.35 + 0.3 * noise(c.at, 0.04, 1) + (c.random(2) - 0.5) * 0.2);
      }
      const arcLen = rel.z + rel.y * 1.1;
      const seam = Math.abs(((arcLen / 0.07) % 1) - 0.5) > 0.44;
      const pv = 0.38 + 0.28 * hash(Math.floor(arcLen / 0.07), 3, 5) + 0.28 * (noise(c.at, 0.1, 2) - 0.5);
      if (seam) return c.pick(WOOD, 0.08);
      return c.pick(WOOD, pv + 0.1 * (c.random(1) - 0.5) + 0.12 * c.n.y);
    },
    { dither: true },
  );
  b.extrude(lidOutline, {
    at: [CX, CTOP + 0.001, hinge[2] + LZ0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: LW,
    color: lidPaint,
    bone: lid,
    name: "lidShell",
  });
  // iron end plates and the front hasp, riding the lid
  for (const s of [1, -1]) {
    // bottom rim bands
    box(0.014, 0.03, 0.57, ironPaint, [CX + s * (LW / 2 + 0.005), CTOP + 0.015, hinge[2] + 0.27], { name: "lidRim", bone: lid });
  }
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.014), ironPaint, { bone: lid, at: [CX, CTOP + 0.06, CZ + CD / 2 + 0.012], name: "hasp" });
  b.part(new THREE.PlaneGeometry(0.06, 0.075), "#ffffff", { bone: lid, at: [CX, CTOP + 0.06, CZ + CD / 2 + 0.021], dir: [0, 0, 1], axis: "z", texture: LOCK, name: "haspLock" });
  // hinge barrels at the back
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), ironPaint, { bone: lid, at: [CX + s * 0.29, CTOP + 0.02, hinge[2] - 0.012], rotation: [0, 0, 90], name: "hingePin" });
  b.pose(lid, { axis: [1, 0, 0], deg: -72 });

  // =============================================================================================================
  // Barrels
  const BAR: readonly (readonly [number, number])[] = [
    [0, 0.26],
    [0.07, 0.3],
    [0.2, 0.345],
    [0.45, 0.375],
    [0.7, 0.345],
    [0.83, 0.3],
    [0.9, 0.27],
  ];
  const rAt = (h: number) => {
    for (let i = 1; i < BAR.length; i++)
      if (h <= BAR[i][0]) {
        const t = (h - BAR[i - 1][0]) / (BAR[i][0] - BAR[i - 1][0]);
        return BAR[i - 1][1] + (BAR[i][1] - BAR[i - 1][1]) * t;
      }
    return BAR[BAR.length - 1][1];
  };
  const HOOPS = [0.11, 0.27, 0.62, 0.79];

  function barrel(origin: V3, axisIn: V3, o: { scale?: number; open?: boolean; seed?: number; slimeInside?: boolean } = {}) {
    const s = o.scale ?? 1;
    const O = vecOf(origin);
    const ax = vecOf(axisIn).normalize();
    const ref = Math.abs(ax.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
    const U = new THREE.Vector3().crossVectors(ref, ax).normalize();
    const V = new THREE.Vector3().crossVectors(ax, U);
    const seed = o.seed ?? 1;
    const paint = cellPaint(
      T,
      (c) => {
        const rel = c.at.clone().sub(O);
        const ha = rel.dot(ax);
        const h = ha / s;
        const q = rel.clone().addScaledVector(ax, -ha);
        const rad = q.length() / s;
        const cap = Math.abs(c.n.dot(ax)) > 0.85;
        if (o.open && h > 0.1 && (rad < rAt(h) - 0.026 || (cap && h > 0.7 && rad < 0.245))) {
          return o.slimeInside ? c.pick(SLIME, 0.15 + 0.25 * c.random(1) + (h > 0.85 ? 0.2 : 0)) : c.pick(WOOD, 0.1 + 0.12 * c.random(1));
        }
        if (cap) {
          const pu = q.dot(U) / s;
          const seam = Math.abs(((pu / 0.09) % 1) - 0.5) > 0.44 || rad > 0.255;
          if (rad > 0.255) return c.pick(WOOD, 0.22 + 0.1 * c.random(1));
          return c.pick(WOOD, (seam ? 0.1 : 0.5 + 0.2 * hash(Math.floor(pu / 0.09), seed, 3)) + 0.12 * (c.random(1) - 0.5));
        }
        const ang = Math.atan2(q.dot(V), q.dot(U));
        const sf = (ang / (Math.PI * 2)) * 20;
        const idx = Math.floor(sf);
        const frac = sf - idx;
        const seam = frac < 0.12;
        const v = 0.46 + 0.26 * c.n.y + 0.28 * hash(idx, seed, 5) + 0.22 * (noise(c.at, 0.09, seed) - 0.5);
        if (seam) return c.pick(WOOD, 0.08);
        return c.pick(WOOD, v + 0.12 * (c.random(1) - 0.5) + (c.random(7) < 0.03 ? -0.25 : 0));
      },
      { dither: true },
    );
    const prof: [number, number][] = BAR.map(([h, rr]) => [rr * s, h * s]);
    const outline: [number, number][] = o.open
      ? [[0, 0], ...prof, [0.245 * s, 0.9 * s], [0.24 * s, 0.12 * s], [0, 0.12 * s]]
      : [[0, 0], ...prof, [0.25 * s, 0.88 * s], [0, 0.88 * s]];
    b.lathe(outline, { at: O, axis: ax, segments: 10, color: paint, bone: root, name: "barrel" });
    for (const hh of HOOPS) {
      const rr = rAt(hh) * s;
      b.lathe(
        [
          [rr - 0.012 * s, (hh - 0.028) * s],
          [rr + 0.012 * s, (hh - 0.028) * s],
          [rr + 0.012 * s, (hh + 0.028) * s],
          [rr - 0.012 * s, (hh + 0.028) * s],
        ],
        { at: O, axis: ax, segments: 10, color: ironPaint, bone: root, name: "hoop" },
      );
    }
    return { O, ax, U, V };
  }

  // A: closed barrel with candle, book and scroll on its lid
  barrel([1.05, Y0, -0.5], [0, 1, 0], { seed: 2 });
  {
    const top = Y0 + 0.88;
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.018, 6), IRON[3], { bone: root, at: [1.05 - 0.1, top + 0.009, -0.55], name: "candleDish" });
    b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.15, 6), "#ece0bd", { bone: root, at: [1.05 - 0.1, top + 0.093, -0.55], name: "candle" });
    box(0.014, 0.07, 0.014, "#ece0bd", [1.05 - 0.1 + 0.03, top + 0.15, -0.55], { name: "wax" });
    box(0.014, 0.05, 0.014, "#ece0bd", [1.05 - 0.1, top + 0.14, -0.55 + 0.03], { name: "wax" });
    box(0.07, 0.003, 0.07, "#ece0bd", [1.05 - 0.1, top + 0.019, -0.55], { name: "waxPool" });
    box(0.006, 0.016, 0.006, "#1a1210", [1.05 - 0.1, top + 0.176, -0.55], { name: "wick" });
    glow(b.cards([frame([1.05 - 0.1, top + 0.178, -0.55], [0, 1, 0])], flameA, { size: [0.07, 0.12], cross: true, flow: [0, 0, 1], sink: 0 }), 1.4);
    // open book
    for (const s of [1, -1])
      P(new THREE.BoxGeometry(0.095, 0.014, 0.13), "#ffffff", [1.05 + 0.1 + s * 0.049, top + 0.012, -0.44], { texture: PAGE, rotation: [0, 12, s * -4], name: "bookPage" });
    box(0.2, 0.01, 0.138, "#5a1428", [1.05 + 0.1, top + 0.003, -0.44], { rotation: [0, 12, 0], name: "bookCover" });
    // rolled scroll with a wax seal
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), "#d6c9a2", { bone: root, at: [1.05 + 0.13, top + 0.024, -0.62], rotation: [0, 0, 90], name: "scroll" });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 6), "#a01c1c", { bone: root, at: [1.05 + 0.13, top + 0.024, -0.62], rotation: [0, 0, 90], name: "seal" });
    // pewter mug
    b.lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.04, 0.07],
        [0.036, 0.07],
        [0.03, 0.01],
        [0, 0.01],
      ],
      { at: [1.05 - 0.02, top + 0.002, -0.35], segments: 8, color: IRON[4], bone: root, name: "mug" },
    );
  }

  // B: open barrel brimming with glowing slime, with a ladle
  barrel([0.6, Y0, -0.6], [0, 1, 0], { seed: 4, open: true, slimeInside: true });
  glow(b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.012, 10), "#5ad03a", { bone: root, at: [0.6, Y0 + 0.82, -0.6], name: "slime" }), 0.8);
  for (const [dx, dz, rad] of [
    [0.08, 0.05, 0.03],
    [-0.1, 0.0, 0.022],
    [0.0, -0.11, 0.026],
  ] as const)
    glow(b.part(new THREE.SphereGeometry(rad, 6, 4), "#a4f060", { bone: root, at: [0.6 + dx, Y0 + 0.82, -0.6 + dz], name: "bubble" }), 0.9);
  b.rod([0.6, Y0 + 0.88, -0.6], [0.43, Y0 + 1.02, -0.5], 0.012, { section: "box", color: woodPaint, bone: root, name: "ladleHandle" });
  b.part(new THREE.CylinderGeometry(0.045, 0.03, 0.04, 8), "#554438", { bone: root, at: [0.6, Y0 + 0.85, -0.6], name: "ladleBowl" });

  // C: spilled barrel on its side, mouth towards the viewer
  {
    const dirC = new THREE.Vector3(-0.5, 0, 0.87).normalize();
    const centre = new THREE.Vector3(1.0, Y0 + 0.3745, 0.1);
    const baseC = centre.clone().addScaledVector(dirC, -0.45);
    barrel(baseC, dirC, { seed: 6, open: true, slimeInside: true });
    // slime film in the mouth and a drip lip
    glow(
      b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.01, 10), "#5ad03a", {
        bone: root,
        at: baseC.clone().addScaledVector(dirC, 0.62),
        dir: dirC,
        name: "slimeMouth",
      }),
      0.6,
    );
    // wedge chock
    box(0.12, 0.07, 0.12, woodPaint, [1.0 + 0.3, Y0 + 0.035, 0.0], { rotation: [0, 35, 0], name: "chock" });
  }

  // =============================================================================================================
  // Hanging chains and shackles on the wall
  const link = (x: number, y: number, face: boolean) => {
    if (face) {
      box(0.03, 0.055, 0.012, ironPaint, [x, y, -0.865], { name: "link" });
    } else {
      box(0.012, 0.055, 0.03, ironPaint, [x, y, -0.865], { name: "link" });
    }
  };
  box(0.1, 0.1, 0.04, ironPaint, [-0.1, 1.5, -0.88], { name: "chainPlate" });
  box(0.03, 0.03, 0.05, IRON[5], [-0.1, 1.5, -0.86], { name: "chainBolt" });
  for (const [x, n] of [
    [-0.15, 9],
    [-0.05, 6],
  ] as const) {
    for (let i = 0; i < n; i++) link(x, 1.5 - 0.045 - i * 0.05, i % 2 === 0);
    // open iron cuff at the chain's end
    const yEnd = 1.5 - 0.045 - n * 0.05;
    b.sweep(arc([x, yEnd - 0.07, -0.865], [x, yEnd, -0.865], [0, 0, 1], 300), 0.012, { section: "box", color: ironPaint, bone: root, caps: "flat", name: "cuff" });
    box(0.05, 0.03, 0.03, ironPaint, [x, yEnd + 0.012, -0.865], { name: "cuffHinge" });
  }
  // a chain pile on the floor under the cuffs
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    box(0.03, 0.012, 0.055, ironPaint, [0.0 + Math.cos(a) * 0.05 + i * 0.01, Y0 + 0.006 + (i % 2) * 0.012, -0.78 + Math.sin(a) * 0.04], { rotation: [0, a * 60, i % 2 ? 90 : 0], name: "floorLink" });
  }

  // =============================================================================================================
  // Rusty sword on the floor
  {
    const A = new THREE.Vector3(0.45, Y0 + 0.012, 1.25);
    const Z = new THREE.Vector3(0.15, Y0 + 0.012, 1.0);
    const dd = Z.clone().sub(A).normalize();
    const bladeStart = A.clone().addScaledVector(dd, 0.12);
    b.frustumBox(bladeStart, Z, [0.05, 0.012], [0.012, 0.008], { color: ironPaint, bone: root, name: "blade" });
    b.rod(A, bladeStart, 0.012, { section: "box", color: woodPaint, bone: root, name: "swordGrip" });
    P(new THREE.BoxGeometry(0.15, 0.022, 0.026), ironPaint, bladeStart.clone().addScaledVector(dd, -0.012), { dir: new THREE.Vector3(-dd.z, 0, dd.x), name: "crossguard" });
    box(0.03, 0.03, 0.03, IRON[4], [A.x, A.y, A.z], { rotation: [0, 30, 0], name: "pommel" });
  }

  // =============================================================================================================
  // A rat by the slime
  {
    const RX = 1.13;
    const RZ = 1.1;
    const q = new THREE.Quaternion().setFromAxisAngle(UP, 215 * DEG);
    const tf = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(new THREE.Vector3(RX, Y0, RZ));
    P(new THREE.BoxGeometry(0.075, 0.07, 0.17), furPaint, tf(0, 0.045, 0), { quat: q, name: "ratBody" });
    P(new THREE.BoxGeometry(0.06, 0.055, 0.075), furPaint, tf(0, 0.042, 0.115), { quat: q, name: "ratHead" });
    P(new THREE.BoxGeometry(0.03, 0.03, 0.04), "#d890a0", tf(0, 0.035, 0.17), { quat: q, name: "ratSnout" });
    box(0.012, 0.012, 0.012, "#f0a0b0", tf(0, 0.04, 0.193).toArray(), { quat: q, name: "ratNose" });
    for (const s of [1, -1]) {
      P(new THREE.BoxGeometry(0.03, 0.036, 0.008), "#d890a0", tf(s * 0.032, 0.083, 0.1), { quat: q, name: "ratEar" });
      glow(P(new THREE.BoxGeometry(0.01, 0.01, 0.008), "#ff3030", tf(s * 0.031, 0.056, 0.148), { quat: q, name: "ratEye" }), 1);
      P(new THREE.BoxGeometry(0.022, 0.03, 0.03), furPaint, tf(s * 0.03, 0.015, 0.06), { quat: q, name: "ratFrontLeg" });
      P(new THREE.BoxGeometry(0.026, 0.034, 0.05), furPaint, tf(s * 0.035, 0.017, -0.06), { quat: q, name: "ratHindLeg" });
    }
    b.sweep(catmull([tf(0, 0.04, -0.09), tf(0, 0.03, -0.17), tf(0.04, 0.012, -0.25), tf(0.1, 0.012, -0.29)]), [0.01, 0.004], {
      section: "box",
      color: "#d890a0",
      bone: root,
      caps: "flat",
      name: "ratTail",
    });
  }

  // =============================================================================================================
  // Glowing coals / embers (merged)
  mergedPart(coalGeos, "#ff9a2a", "embers") && glow(b.part(new THREE.BoxGeometry(0.001, 0.001, 0.001), "#ff9a2a", { bone: root, at: [0, 0, 0], name: "emberDot" }));

  return b.root;
}
