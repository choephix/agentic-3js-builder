import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A cluster of dungeon dressing in pixel art: a chained broken pillar, stacked crates, barrels (one brimming with glowing slime), a weapon rack with shield, a scholar's table with candle and potions, a treasure chest with spilled coins, a skull pile, sacks and a flaming brazier.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const hash = (a: number, b: number): number => {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const ramp = (a: string[]): string[] => a.map((c) => snapColor(c, 64));

const WOOD = ramp(["#24150c", "#3d2613", "#5a3a1c", "#7a5230", "#966a3c"]);
const WOOD2 = ramp(["#1c1109", "#33200f", "#4a2f17", "#634125", "#7c5430"]);
const GREYS = ramp(["#1d1f27", "#33363f", "#4c505b", "#6a6f7a", "#8b909a"]);
const SACK = ramp(["#6e5630", "#8f7344", "#b3965a", "#cfb374"]);
const BONES = ramp(["#8f8467", "#b8ad8e", "#d8cfb2", "#ece4c8"]);
const IRON = "#3c4250";
const IRONL = "#6a7284";
const STEEL = "#b9c3d0";
const GOLD = "#e8b830";
const BONE = "#e0d6b8";

const plankTile = (rm: string[], nail: string, seed: number) =>
  pixelTexture(32, 24, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 6);
      const w = y % 6;
      if (w === 0) return rm[0];
      if ((x + row * 11 + seed * 5) % 32 === 0) return rm[0];
      if (w === 1) return pick(rm, 0.78, bayer(x, y));
      const streak = hash(Math.floor(x / (3 + row)), row + seed);
      const v = 0.32 + 0.3 * streak + 0.14 * hash(x, y + seed * 3) - 0.04 * w;
      return pick(rm, v, bayer(x, y));
    });
    g.stamp(2, 2, ["n"], { n: nail });
    g.stamp(29, 2, ["n"], { n: nail });
    g.stamp(2, 20, ["n"], { n: nail });
    g.stamp(29, 20, ["n"], { n: nail });
  });
const PLANK = plankTile(WOOD, "#a09a8c", 1);
const PLANK2 = plankTile(WOOD2, "#7d7a72", 4);

const STONE = pixelTexture(32, 32, (g) => {
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    const off = (row % 2) * 8;
    const bx = Math.floor((x + off) / 16);
    if (y % 8 === 0 || (x + off) % 16 === 0) return GREYS[0];
    const shade = 0.35 + 0.35 * hash(row, bx) + 0.12 * hash(x, y);
    if (y % 8 === 1) return pick(GREYS, shade + 0.25, bayer(x, y));
    if (y % 8 === 7) return pick(GREYS, shade - 0.2, bayer(x, y));
    if (hash(x * 3, y * 7) > 0.93) return "#4f6b3a";
    return pick(GREYS, shade, bayer(x, y));
  });
});

const IRONT = pixelTexture(16, 8, (g) => {
  g.fill((x, y) => (y === 0 ? "#6a7284" : y === 7 ? "#20242c" : pick(["#2a2e38", "#3c4250", "#4a5160"], 0.4 + 0.4 * hash(x, y), bayer(x, y))));
  g.stamp(1, 3, ["r"], { r: "#9aa3b4" });
  g.stamp(14, 3, ["r"], { r: "#9aa3b4" });
});

const FLAME = pixelArt(
  [
    "....o.....",
    "...oo.o...",
    "...oo.oo..",
    "..ooyooo..",
    "..oyyyoo..",
    ".ooyyyyoo.",
    ".ooyyyyoo.",
    ".oyyywyyo.",
    ".oyywwyyo.",
    ".ooywwyoo.",
    "..oyyyyo..",
    "..ooyyoo..",
    "...oooo...",
    "....oo....",
  ],
  { o: "#ff7a1a", y: "#ffd23a", w: "#fff4b8" },
);

const SK = skinLayout({ skull: [8, 8, 8] });
const SKULL = pixelTexture(SK.size[0], SK.size[1], (g) => {
  for (const rect of Object.values(SK.faces.skull))
    g.fill((x, y) => pick(BONES, 0.6 + 0.3 * hash(x, y) - 0.06 * y, bayer(x, y)), rect);
  const f = SK.faces.skull.pz;
  g.stamp(f[0], f[1], ["........", "........", ".kk..kk.", ".kk..kk.", "...kk...", "...kk...", "..k.k.k.", "........"], { k: "#140d0d" });
});

const SHIELD = pixelTexture(12, 12, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 5.5, y - 5.5);
    if (d > 6) return "";
    if (d > 5) return "#2a1a10";
    if (x === 5 || x === 6 || y === 5 || y === 6) return "#e8b830";
    return (x < 6) !== (y < 6) ? "#b3262b" : "#ecd9a0";
  });
});

const WEB = pixelTexture(16, 16, (g) => {
  for (let i = 0; i < 16; i++) {
    g.set(i, 0, "#d8dce0");
    g.set(0, i, "#d8dce0");
    g.set(i, i, "#d8dce0");
    g.set(Math.floor(i / 2), i, "#d8dce0");
    g.set(i, Math.floor(i / 2), "#d8dce0");
  }
  for (const r of [4, 8, 12]) for (let a = 0; a <= 90; a += 6) g.set(Math.round(r * Math.cos((a * Math.PI) / 180)), Math.round(r * Math.sin((a * Math.PI) / 180)), "#c8ccd2");
});

const WOODPAINT = cellPaint(
  0.02,
  (c) => (c.v % 5 === 0 ? WOOD[0] : c.pick(WOOD, 0.45 + 0.35 * noise(c.at, 0.15, 2) + 0.1 * c.random(4))),
  { dither: true },
);

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const R = rng(11);
  const rr = rng(23);

  const frameOf = (cx: number, cy: number, cz: number, ry: number) => {
    const a = (ry * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return (x: number, y: number, z: number): number[] => [cx + x * c + z * s, cy + y, cz - x * s + z * c];
  };
  const bx = (size: number[], tile: THREE.Texture, at: number[], rot: number[] = [0, 0, 0], step: number = 1) =>
    b.part(tileBox(size, tile, TEXEL, { rand: R, step }), "#ffffff", { texture: tile, at, rotation: rot });
  const flat = (geo: THREE.BufferGeometry, color: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(geo, color, { at, rotation: rot });
  const Bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const Cy = (r: number, h: number, s: number = 8) => new THREE.CylinderGeometry(r, r, h, s);

  // ---------- stone pillar with chains ----------
  {
    const px = -1.3;
    const pz = -0.5;
    bx([0.7, 0.2, 0.7], STONE, [px, 0.1, pz], [0, 0, 0], 8);
    bx([0.5, 1.3, 0.5], STONE, [px, 0.85, pz], [0, 0, 0], 8);
    bx([0.62, 0.15, 0.62], STONE, [px, 1.575, pz], [0, 0, 0], 8);
    bx([0.5, 0.2, 0.28], STONE, [px - 0.06, 1.75, pz - 0.1], [0, 8, 0], 8);
    bx([0.26, 0.12, 0.22], STONE, [px + 0.17, 1.71, pz + 0.12], [0, -14, 0], 8);
    for (let i = 0; i < 6; i++) {
      const s = 0.07 + 0.07 * rr();
      const a = rr() * 6.28;
      bx([s * 1.4, s, s * 1.2], STONE, [px + Math.cos(a) * (0.5 + 0.2 * rr()), s / 2, pz + 0.15 + Math.sin(a) * 0.35 + 0.3], [0, rr() * 90, 0], 8);
    }
    // wall chain with shackle
    flat(Bx(0.07, 0.07, 0.03), IRON, [px, 1.35, pz + 0.26]);
    flat(Bx(0.035, 0.035, 0.035), IRONL, [px, 1.35, pz + 0.28]);
    for (let i = 0; i < 8; i++) {
      const y = 1.3 - i * 0.05;
      if (i % 2 === 0) flat(Bx(0.035, 0.058, 0.01), IRONL, [px, y, pz + 0.285]);
      else flat(Bx(0.01, 0.058, 0.035), IRON, [px, y, pz + 0.285]);
    }
    flat(Bx(0.12, 0.045, 0.045), IRON, [px, 0.88, pz + 0.285]);
    flat(Bx(0.1, 0.012, 0.012), IRONL, [px, 0.905, pz + 0.31]);
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { texture: WEB, at: [px - 0.05, 1.33, pz + 0.2515], dir: [0, 0, 1], axis: "z" });
  }

  // ---------- crates ----------
  const crate = (cx: number, cy: number, cz: number, ry: number, s: number) => {
    const L = frameOf(cx, cy, cz, ry);
    const rot = [0, ry, 0];
    bx([s, s, s], PLANK, L(0, s / 2, 0), rot);
    for (const y of [0.05, s - 0.05]) bx([s + 0.03, 0.06, s + 0.03], IRONT, L(0, y, 0), rot);
    for (const sx of [1, -1]) for (const sz of [1, -1]) bx([0.06, s + 0.01, 0.06], PLANK2, L(sx * (s / 2 - 0.01), s / 2, sz * (s / 2 - 0.01)), rot);
    for (const sz of [1, -1]) bx([s * 0.85, 0.06, 0.016], PLANK2, L(0, s / 2, sz * (s / 2 + 0.006)), [0, ry, sz * 45]);
    for (const sx of [1, -1]) bx([0.016, 0.06, s * 0.85], PLANK2, L(sx * (s / 2 + 0.006), s / 2, 0), [sx * 45, ry, 0]);
    bx([s * 0.8, 0.02, s * 0.2], PLANK2, L(0, s + 0.005, 0), rot);
  };
  crate(-0.55, 0, -0.6, 5, 0.5);
  crate(0.05, 0, -0.62, -8, 0.5);
  crate(-0.5, 0.5, -0.6, 25, 0.4);
  {
    const L = frameOf(0.05, 0, -0.62, -8);
    flat(Bx(0.03, 0.14, 0.012), STEEL, L(0.1, 0.3, 0.255), [0, -8, 20]);
    flat(Bx(0.1, 0.025, 0.025), "#6b3a1c", L(0.12, 0.38, 0.27), [0, -8, 20]);
  }

  // ---------- barrels ----------
  const outer: number[][] = [[0.25, 0], [0.27, 0.05], [0.31, 0.25], [0.33, 0.45], [0.31, 0.65], [0.27, 0.85], [0.25, 0.9]];
  const barrelR = (y: number): number => {
    for (let i = 0; i < outer.length - 1; i++) {
      const [r0, y0] = outer[i];
      const [r1, y1] = outer[i + 1];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.25;
  };
  const barrel = (x: number, z: number, open: boolean) => {
    const paintB = cellPaint(
      0.02,
      (c) => {
        if (c.n.y > 0.6) return WOOD[1];
        const f = (Math.atan2(c.at.x - x, c.at.z - z) + Math.PI) / ((2 * Math.PI) / 10);
        const id = Math.floor(f);
        if (f - id < 0.07) return WOOD[0];
        return c.pick(WOOD, 0.42 + 0.3 * hash(id, 3) + 0.18 * (noise(c.at, 0.12, 5) - 0.5));
      },
      { dither: true },
    );
    const pts: [number, number][] = [[0, 0], ...(outer as [number, number][]), [0.23, 0.87], [0, 0.87]];
    b.lathe(pts, { at: [x, 0, z], segments: 10, color: paintB });
    for (const y0 of [0.12, 0.3, 0.6, 0.78]) {
      const r = barrelR(y0 + 0.02);
      b.lathe(
        [
          [r - 0.01, y0],
          [r + 0.014, y0],
          [r + 0.014, y0 + 0.045],
          [r - 0.01, y0 + 0.045],
        ],
        { at: [x, 0, z], segments: 10, color: IRON },
      );
    }
    if (open) {
      glow(flat(Cy(0.235, 0.02, 10), "#59d65a", [x, 0.86, z]), 0.9);
      for (let i = 0; i < 4; i++) glow(flat(new THREE.SphereGeometry(0.03, 5, 4), "#9cff8a", [x + (rr() - 0.5) * 0.3, 0.87, z + (rr() - 0.5) * 0.3]), 0.9);
    } else {
      flat(Cy(0.235, 0.03, 10), "#4b2f19", [x, 0.885, z]);
      for (let i = -1; i <= 1; i++) flat(Bx(0.012, 0.012, 0.4), WOOD[0], [x + i * 0.12, 0.903, z]);
      flat(Cy(0.03, 0.03, 6), IRON, [x + 0.08, 0.91, z + 0.07]);
    }
  };
  barrel(0.85, -0.6, false);
  barrel(1.4, -0.75, false);
  barrel(1.2, 0.05, true);

  // ---------- weapon rack ----------
  {
    const ry = -75;
    const L = frameOf(2.0, 0, -0.2, ry);
    const a = (ry * Math.PI) / 180;
    const rot = [0, ry, 0];
    bx([1.1, 0.08, 0.4], PLANK2, L(0, 0.04, 0), rot);
    for (const s of [1, -1]) {
      bx([0.08, 1.0, 0.08], PLANK, L(s * 0.52, 0.58, -0.12), rot);
      flat(Bx(0.1, 0.1, 0.1), IRON, L(s * 0.52, 1.1, -0.12), rot);
    }
    bx([1.1, 0.07, 0.07], PLANK, L(0, 0.8, -0.12), rot);
    bx([1.1, 0.07, 0.07], PLANK, L(0, 0.45, -0.12), rot);
    // sword
    flat(Bx(0.05, 0.555, 0.012), STEEL, L(-0.38, 0.3825, -0.04), rot);
    flat(Bx(0.035, 0.035, 0.012), STEEL, L(-0.38, 0.1, -0.04), [0, ry, 45]);
    flat(Bx(0.01, 0.46, 0.004), "#7f8a99", L(-0.38, 0.4, -0.032), rot);
    flat(Bx(0.2, 0.035, 0.04), GOLD, L(-0.38, 0.685, -0.04), rot);
    flat(Cy(0.018, 0.17, 6), "#5a2f1a", L(-0.38, 0.79, -0.04), rot);
    flat(new THREE.SphereGeometry(0.03, 6, 4), GOLD, L(-0.38, 0.89, -0.04));
    // axe
    b.rod(L(-0.1, 0.08, -0.04), L(-0.1, 1.15, -0.04), 0.022, "#6b4423", { sides: 6, caps: "flat" });
    b.extrude(
      [
        [0.02, -0.06],
        [0.17, -0.12],
        [0.19, 0],
        [0.17, 0.12],
        [0.02, 0.06],
      ],
      { at: L(-0.1, 0.98, -0.04), x: [Math.cos(a), 0, -Math.sin(a)], thickness: 0.02, color: STEEL },
    );
    flat(Bx(0.06, 0.05, 0.05), IRON, L(-0.1, 0.98, -0.04), rot);
    flat(Bx(0.07, 0.03, 0.03), IRON, L(-0.15, 0.98, -0.04), rot);
    // spear
    b.rod(L(0.15, 0.08, -0.04), L(0.15, 1.5, -0.04), 0.02, "#7a5230", { sides: 6, caps: "flat" });
    b.spike(L(0.15, 1.5, -0.04), [0, 1, 0], 0.2, 0.04, STEEL, { sides: 4 });
    flat(Bx(0.05, 0.06, 0.05), "#b3262b", L(0.15, 1.44, -0.04), rot);
    // shield
    const n = [Math.sin(a) * 0.97, 0.25, Math.cos(a) * 0.97];
    const c = L(0.4, 0.285, 0.14);
    const off = (d: number) => [c[0] + n[0] * d, c[1] + n[1] * d, c[2] + n[2] * d];
    b.part(Cy(0.29, 0.03, 12), IRON, { at: c, dir: n, axis: "y" });
    b.part(Cy(0.27, 0.05, 12), "#6b4423", { at: off(0.01), dir: n, axis: "y" });
    b.part(new THREE.CircleGeometry(0.26, 12), "#ffffff", { at: off(0.037), dir: n, axis: "z", texture: SHIELD });
    b.part(new THREE.SphereGeometry(0.055, 6, 4), STEEL, { at: off(0.04), scale: [1, 1, 0.5] });
  }

  // ---------- table with candle, books, potions ----------
  {
    const ry = 18;
    const L = frameOf(-1.2, 0, 0.55, ry);
    const rot = [0, ry, 0];
    bx([0.95, 0.06, 0.55], PLANK, L(0, 0.78, 0), rot);
    for (const sx of [1, -1]) for (const sz of [1, -1]) bx([0.07, 0.75, 0.07], PLANK2, L(sx * 0.4, 0.375, sz * 0.22), rot);
    for (const sz of [1, -1]) bx([0.8, 0.07, 0.02], PLANK2, L(0, 0.7, sz * 0.22), rot);
    for (const sx of [1, -1]) bx([0.02, 0.07, 0.4], PLANK2, L(sx * 0.4, 0.7, 0), rot);
    // candle
    flat(Cy(0.06, 0.02, 8), IRON, L(-0.32, 0.82, 0.05));
    flat(Cy(0.03, 0.14, 6), "#efe6c8", L(-0.32, 0.9, 0.05));
    flat(Bx(0.012, 0.04, 0.012), "#efe6c8", L(-0.295, 0.9, 0.05));
    glow(flat(Bx(0.018, 0.04, 0.018), "#ffd23a", L(-0.32, 0.99, 0.05)), 1.5);
    glow(flat(Bx(0.01, 0.02, 0.01), "#fff4b8", L(-0.32, 0.985, 0.05)), 1.5);
    // books
    const book = (x: number, y: number, z: number, r: number, cover: string) => {
      flat(Bx(0.26, 0.05, 0.19), cover, L(x, y, z), [0, ry + r, 0]);
      const LL = frameOf(L(x, y, z)[0], y, L(x, y, z)[2], ry + r);
      flat(Bx(0.24, 0.034, 0.195), "#efe3c0", LL(0.01, 0, 0.006), [0, ry + r, 0]);
      flat(Bx(0.012, 0.052, 0.2), GOLD, LL(-0.125, 0, 0), [0, ry + r, 0]);
    };
    book(0.28, 0.835, -0.08, 0, "#8c2f2a");
    book(0.27, 0.885, -0.07, 20, "#2f5f9a");
    book(0.29, 0.93, -0.08, -10, "#3a7a45");
    // potions
    const potion = (x: number, z: number, h: number, col: string) => {
      glow(flat(Cy(0.032, h, 6), col, L(x, 0.81 + h / 2, z)), 0.7);
      glow(flat(Cy(0.014, 0.06, 6), col, L(x, 0.81 + h + 0.03, z)), 0.7);
      flat(Cy(0.017, 0.025, 6), "#7a5230", L(x, 0.81 + h + 0.07, z));
      flat(Bx(0.036, 0.04, 0.008), "#efe3c0", L(x, 0.81 + h / 2, z + 0.03), rot);
    };
    potion(-0.08, 0.1, 0.1, "#3fbf6a");
    potion(0.02, 0.17, 0.13, "#9a4fd6");
    potion(-0.14, -0.05, 0.08, "#d6414b");
    // mug
    flat(Cy(0.04, 0.09, 8), "#8a5a2c", L(0.05, 0.855, -0.15));
    flat(Cy(0.034, 0.01, 8), "#f1d9a0", L(0.05, 0.9, -0.15));
    b.part(new THREE.TorusGeometry(0.03, 0.008, 4, 6), "#8a5a2c", { at: L(0.09, 0.855, -0.15), rotation: [0, ry, 0] });
    // scroll
    flat(Cy(0.025, 0.3, 8), "#e9dcb4", L(-0.12, 0.84, -0.17), [0, ry, 90]);
    flat(Cy(0.03, 0.02, 6), "#7a5230", L(-0.27, 0.84, -0.17), [0, ry, 90]);
    flat(Cy(0.03, 0.02, 6), "#7a5230", L(0.03, 0.84, -0.17), [0, ry, 90]);
    flat(Bx(0.025, 0.055, 0.055), "#b3262b", L(-0.12, 0.84, -0.17), rot);
    // coins
    for (let i = 0; i < 5; i++) flat(Cy(0.03, 0.008, 8), GOLD, L(0.1 + 0.02 * i, 0.815 + 0.008 * (i % 2), 0.2 + 0.01 * i));
  }

  // ---------- sacks ----------
  const sack = (x: number, z: number, s: number, seed: number) => {
    const paintS = cellPaint(0.02, (c) => (c.random(seed) < 0.06 ? SACK[0] : c.pick(SACK, 0.4 + 0.5 * noise(c.at, 0.1, seed) + 0.1 * c.n.y)), { dither: true });
    b.part(new THREE.SphereGeometry(0.22 * s, 8, 6), paintS, { at: [x, 0.25 * s, z], scale: [1, 1.15, 0.9] });
    b.part(new THREE.CylinderGeometry(0.05 * s, 0.12 * s, 0.1 * s, 6), paintS, { at: [x, 0.5 * s, z] });
    b.part(new THREE.TorusGeometry(0.075 * s, 0.012, 4, 8), "#6b4423", { at: [x, 0.49 * s, z], rotation: [90, 0, 0] });
    flat(Bx(0.05 * s, 0.01, 0.07 * s), SACK[2], [x + 0.03, 0.57 * s, z], [0, 20, 15]);
  };
  sack(-0.52, 0.25, 1, 3);
  sack(-0.5, 0.65, 0.8, 7);

  // ---------- treasure chest ----------
  {
    const ry = 10;
    const L = frameOf(0.1, 0, 0.7, ry);
    const a = (ry * Math.PI) / 180;
    const rot = [0, ry, 0];
    bx([0.7, 0.3, 0.45], PLANK, L(0, 0.15, 0), rot);
    for (const s of [1, -1]) bx([0.06, 0.31, 0.47], IRONT, L(s * 0.25, 0.15, 0), rot);
    for (const y of [0.01]) bx([0.72, 0.04, 0.47], IRONT, L(0, y + 0.02, 0), rot);
    const arc: [number, number][] = [
      [-0.225, 0],
      [0.225, 0],
    ];
    for (let k = 1; k <= 7; k++) arc.push([0.225 * Math.cos((Math.PI * k) / 8), 0.14 * Math.sin((Math.PI * k) / 8)]);
    b.extrude(arc, { at: L(0, 0.3, 0), x: [Math.sin(a), 0, Math.cos(a)], thickness: 0.7, color: WOODPAINT });
    const arc2: [number, number][] = [
      [-0.236, -0.005],
      [0.236, -0.005],
    ];
    for (let k = 1; k <= 7; k++) arc2.push([0.236 * Math.cos((Math.PI * k) / 8), 0.148 * Math.sin((Math.PI * k) / 8)]);
    for (const s of [1, -1])
      b.extrude(arc2, { at: L(s * 0.25, 0.3, 0), x: [Math.sin(a), 0, Math.cos(a)], thickness: 0.06, color: IRON });
    flat(Bx(0.09, 0.1, 0.03), GOLD, L(0, 0.3, 0.235), rot);
    flat(Bx(0.02, 0.04, 0.012), "#1c1209", L(0, 0.3, 0.252), rot);
    for (const sx of [1, -1]) for (const sz of [1, -1]) flat(Bx(0.07, 0.07, 0.07), IRONL, L(sx * 0.34, 0.035, sz * 0.22), rot);
    for (const sx of [1, -1]) for (const sz of [1, -1]) flat(new THREE.SphereGeometry(0.014, 4, 3), GOLD, L(sx * 0.34, 0.2, sz * 0.231));
    // spilled coins and gems
    for (let i = 0; i < 16; i++) {
      const p = L(-0.25 + rr() * 0.6, 0.004 + (i > 10 ? 0.008 : 0), 0.3 + rr() * 0.3);
      flat(Cy(0.035, 0.008, 8), i % 5 === 0 ? "#d4a020" : GOLD, p, [rr() * 12, rr() * 90, rr() * 12]);
    }
    flat(Bx(0.04, 0.04, 0.04), "#d6414b", L(0.3, 0.025, 0.38), [30, 20, 30]);
    flat(Bx(0.035, 0.035, 0.035), "#3fa8d6", L(-0.2, 0.025, 0.42), [20, 40, 30]);
  }

  // ---------- skull pile and bones ----------
  {
    const skull = (x: number, y0: number, z: number, ry: number) => {
      b.part(skinBox(SKULL, SK.faces.skull, 0.015), "#ffffff", { texture: SKULL, at: [x, y0 + 0.07, z], rotation: [0, ry, 0] });
      const L = frameOf(x, y0, z, ry);
      flat(Bx(0.08, 0.035, 0.085), BONE, L(0, 0.025, 0.012), [0, ry, 0]);
      flat(Bx(0.06, 0.01, 0.012), "#140d0d", L(0, 0.036, 0.056), [0, ry, 0]);
    };
    skull(0.6, 0, 0.85, 20);
    skull(0.78, 0, 0.78, -35);
    skull(0.5, 0, 1.0, 160);
    skull(0.69, 0.1, 0.88, 5);
    const bone = (x0: number, z0: number, x1: number, z1: number) => {
      b.rod([x0, 0.015, z0], [x1, 0.015, z1], 0.012, BONE, { sides: 6, caps: "flat" });
      for (const [x, z] of [[x0, z0], [x1, z1]]) {
        flat(new THREE.SphereGeometry(0.022, 5, 4), BONE, [x + 0.006, 0.02, z + 0.008]);
        flat(new THREE.SphereGeometry(0.022, 5, 4), BONE, [x - 0.006, 0.02, z - 0.008]);
      }
    };
    bone(0.35, 1.1, 0.65, 1.2);
    bone(0.9, 0.95, 1.0, 1.2);
    bone(0.45, 0.78, 0.4, 0.95);
    // ribcage
    for (let i = 0; i < 4; i++) b.rod([0.95 + i * 0.04, 0.012, 1.05 + i * 0.03], [1.1 + i * 0.04, 0.012, 1.08 + i * 0.04], 0.01, BONE, { sides: 6, caps: "flat" });
  }

  // ---------- brazier ----------
  {
    const bxp = 1.55;
    const bz = 0.7;
    b.lathe(
      [
        [0, 0.55],
        [0.12, 0.5],
        [0.3, 0.62],
        [0.34, 0.8],
        [0.28, 0.8],
        [0.25, 0.66],
        [0, 0.62],
      ],
      { at: [bxp, 0, bz], segments: 8, color: IRON },
    );
    b.lathe(
      [
        [0.3, 0.74],
        [0.355, 0.74],
        [0.355, 0.78],
        [0.3, 0.78],
      ],
      { at: [bxp, 0, bz], segments: 8, color: IRONL },
    );
    for (let k = 0; k < 3; k++) {
      const an = (k * 2 * Math.PI) / 3;
      b.rod([bxp + 0.32 * Math.cos(an), 0, bz + 0.32 * Math.sin(an)], [bxp + 0.2 * Math.cos(an), 0.58, bz + 0.2 * Math.sin(an)], 0.028, IRON, { sides: 6, caps: "flat" });
    }
    b.lathe(
      [
        [0.23, 0.28],
        [0.28, 0.28],
        [0.28, 0.32],
        [0.23, 0.32],
      ],
      { at: [bxp, 0, bz], segments: 6, color: IRONL },
    );
    b.rod([bxp - 0.2, 0.82, bz - 0.05], [bxp + 0.2, 0.86, bz + 0.08], 0.04, "#4a2a14", { sides: 6 });
    b.rod([bxp - 0.15, 0.84, bz + 0.15], [bxp + 0.18, 0.84, bz - 0.12], 0.035, "#3a200f", { sides: 6 });
    for (let i = 0; i < 7; i++) {
      const col = i % 2 ? "#ff5a1a" : "#ffb02a";
      glow(flat(Bx(0.07, 0.05, 0.07), col, [bxp + (rr() - 0.5) * 0.4, 0.83, bz + (rr() - 0.5) * 0.4], [0, rr() * 90, 0]), 1.2);
    }
    for (let k = 0; k < 4; k++)
      glow(b.part(new THREE.PlaneGeometry(0.36, 0.5), "#ffffff", { texture: FLAME, at: [bxp, 1.07, bz], rotation: [0, k * 90 + 20, 0] }), 1.3);
  }

  // ---------- floor clutter ----------
  for (let i = 0; i < 5; i++) {
    const s = 0.05 + 0.06 * rr();
    bx([s * 1.3, s, s], STONE, [-0.3 + rr() * 1.6, s / 2, 1.1 + rr() * 0.3], [0, rr() * 90, 0], 8);
  }
  flat(Cy(0.05, 0.08, 6), "#7a5230", [-0.15, 0.04, 1.15]);
  glow(flat(Cy(0.03, 0.02, 6), "#ffd23a", [-0.15, 0.09, 1.15]), 1);

  return b.root;
}
