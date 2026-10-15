import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";
import { pixelTexture, pixelArt, tileBox, cellPaint, pick, bayer, snapColor, stepped } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A pixel-art dungeon corner: flagstone floor and back walls, banded treasure chest with spilled coins, barrels, stacked crates, a wall torch, a potion shelf, a skull-and-bone pile with a candle, a weapon rack, cobwebs and a cracked pot.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const snap = (c: string) => snapColor(c, 32);

// ---------- palette ----------
const STONE = ["#1b1a22", "#2c2b36", "#40404f", "#58586a", "#75758a", "#9696aa"].map(snap);
const MOSS = ["#1a2a14", "#2a4420", "#3f6a2c", "#5c8f3c"].map(snap);
const WOOD = ["#2a170c", "#4a2a14", "#6b3f1e", "#8a5a2c", "#a87a3e"].map(snap);
const IRON = ["#16161c", "#2a2c36", "#444858", "#6a7084", "#98a0b4"].map(snap);
const GOLD = ["#6a4a10", "#b0801c", "#e0b030", "#fff08a"].map(snap);
const BONE = ["#6a5c44", "#a89878", "#d8cfae", "#f4efd8"].map(snap);
const CLOTH = ["#3a0e18", "#6a1626", "#a02438", "#d04a56"].map(snap);
const CLAY = ["#3a1c10", "#6a3420", "#9a5232", "#c27a4a"].map(snap);
const BLACK = snap("#0a0a10");
const FLAME_R = snap("#e03a10");
const FLAME_O = snap("#ff8a1c");
const FLAME_Y = snap("#ffe05a");
const FLAME_W = snap("#fffbd0");
const POT_G = snap("#3ad45a");
const POT_P = snap("#b04aff");
const POT_B = snap("#3a9aff");
const POT_R = snap("#ff4a5a");
const WAX = snap("#e8e0c0");

// ---------- tiles ----------
function flagTile() {
  const r = rng(11);
  return pixelTexture(48, 48, (g) => {
    // 3 rows of staggered flagstones, 16px tall each
    g.fill((x, y) => {
      const row = Math.floor(y / 16);
      const off = row % 2 ? 8 : 0;
      const lx = (x + off) % 24;
      const ly = y % 16;
      if (ly === 0 || lx === 0) return STONE[0];
      const edge = ly === 1 || lx === 1 ? 1 : 0;
      const shade = 0.5 + 0.25 * (r() - 0.5) + (edge ? 0.22 : 0) - (ly > 13 || lx > 21 ? 0.15 : 0);
      return pick(STONE.slice(1), shade, bayer(x, y));
    });
    for (let i = 0; i < 26; i++) g.set(Math.floor(r() * 48), Math.floor(r() * 48), STONE[1]);
    for (let i = 0; i < 18; i++) g.set(Math.floor(r() * 48), Math.floor(r() * 48), STONE[5]);
  });
}
function brickTile() {
  const r = rng(21);
  return pixelTexture(48, 48, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const off = row % 2 ? 8 : 0;
      const lx = (x + off) % 16;
      const ly = y % 8;
      if (ly === 0 || lx === 0) return STONE[0];
      const hi = ly === 1 || lx === 1;
      const base = 0.4 + 0.3 * r() + (hi ? 0.18 : 0) - (ly >= 7 ? 0.12 : 0);
      return pick(STONE.slice(1, 5), base, bayer(x, y));
    });
    // moss creeping from bottom
    g.fill((x, y) => {
      const d = (47 - y) / 47;
      const m = r() * 0.7 - d * 1.6 + 0.35 + 0.1 * Math.sin(x * 0.9);
      if (m > 0.55) return pick(MOSS, 0.3 + r() * 0.6, bayer(x, y));
      return undefined;
    });
    // cracks
    let cx = 30;
    for (let y = 4; y < 30; y++) {
      cx += Math.floor(r() * 3) - 1;
      g.set(cx, y, STONE[0]);
    }
  });
}
function plankTile() {
  const r = rng(31);
  return pixelTexture(32, 30, (g) => {
    g.fill((x, y) => {
      const ly = y % 6;
      if (ly === 0) return WOOD[0];
      const grain = (Math.sin(x * 0.7 + Math.floor(y / 6) * 2.3) + 1) / 2;
      const v = 0.45 + 0.2 * grain + (ly === 1 ? 0.22 : 0) - (ly === 5 ? 0.1 : 0) + 0.12 * (r() - 0.5);
      return pick(WOOD.slice(1), v, bayer(x, y));
    });
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(r() * 28);
      const y = Math.floor(r() * 5) * 6 + 3;
      g.set(x, y, WOOD[0]);
      g.set(x + 1, y, WOOD[0]);
    }
    for (let y = 0; y < 5; y++) g.set(y % 2 ? 2 : 29, y * 6 + 3, IRON[3]);
  });
}
function crateTile() {
  const r = rng(41);
  return pixelTexture(16, 16, (g) => {
    g.fill((x, y) => {
      const border = x < 2 || y < 2 || x > 13 || y > 13;
      const diag = Math.abs(x - y) < 2 || Math.abs(x - (15 - y)) < 1;
      if (border) return pick(WOOD.slice(1), 0.55 + (x === 0 || y === 0 ? 0.2 : -0.1), 0.5);
      if (diag) return pick(WOOD.slice(1), 0.35 + 0.2 * r(), bayer(x, y));
      return pick(WOOD.slice(1), 0.5 + 0.25 * (r() - 0.5), bayer(x, y));
    });
    for (const [x, y] of [[1, 1], [14, 1], [1, 14], [14, 14]]) g.set(x, y, IRON[4]);
  });
}
function ironTile() {
  const r = rng(51);
  return pixelTexture(16, 16, (g) => {
    g.fill((x, y) => pick(IRON.slice(1, 5), 0.35 + 0.35 * (1 - y / 15) + 0.1 * (r() - 0.5), bayer(x, y)));
    for (let x = 1; x < 16; x += 5) {
      g.set(x, 3, IRON[4]);
      g.set(x, 12, IRON[0]);
    }
  });
}
function lidTile() {
  const r = rng(61);
  return pixelTexture(32, 16, (g) => {
    g.fill((x, y) => {
      const ly = y % 4;
      if (ly === 0) return WOOD[0];
      return pick(WOOD.slice(1), 0.5 + 0.22 * Math.sin(x * 0.5 + y) + 0.15 * (r() - 0.5) + (ly === 1 ? 0.15 : 0), bayer(x, y));
    });
  });
}
function bookTile(cover: string[]) {
  return pixelTexture(8, 14, (g) => {
    g.fill((x, y) => {
      if (x === 0) return cover[0];
      if (x === 7) return cover[1];
      if (y === 0 || y === 13) return cover[1];
      return pick(cover, 0.55 + (y % 3 === 0 ? 0.15 : 0), 0.5);
    });
    g.fill(() => GOLD[2], [1, 3, 6, 1]);
    g.fill(() => GOLD[2], [1, 10, 6, 1]);
    g.set(3, 6, GOLD[3]);
    g.set(4, 7, GOLD[3]);
  });
}

// ---------- textures for flat decals ----------
const SKULL = pixelArt(
  [
    "..wwwwww..",
    ".wwwwwwww.",
    "wwwwwwwwww",
    "wkkwwwwkkw",
    "wkkwwwwkkw",
    "wwwwkkwwww",
    ".wwwkkwww.",
    ".wwwwwwww.",
    "..wkwkwk..",
    "..wwwwww..",
  ],
  { w: BONE[2], k: BLACK },
);
const COIN = pixelArt(["..yy..", ".yYYy.", "yYyyYy", "yYyyYy", ".yYYy.", "..yy.."], { y: GOLD[1], Y: GOLD[3] });
const FLAME_TEX = pixelArt(
  [
    "....y....",
    "...yoy...",
    "...yoy...",
    "..yooory.",
    "..oowwor.",
    ".yoowwooy",
    ".oowwwwoo",
    ".roowwoor",
    ".rroooorr",
    "..rrooor.",
    "...rrrr..",
  ],
  { y: FLAME_Y, o: FLAME_O, r: FLAME_R, w: FLAME_W },
);
const WEB = pixelArt(
  [
    "w.......w.......w",
    ".w......w......w.",
    "..w.....w.....w..",
    "...w..wwwww..w...",
    "....wwww.w.wwww..",
    "w...w.w..w.w.w..w",
    "wwwwwwwwwwwwwwwww",
    "....w.w..w.w.w...",
    "....w..w.w..w....",
    ".....w..www.w....",
    ".....w...w...w...",
    "......w..w...w...",
  ],
  { w: STONE[5] },
);
const RUNE = pixelArt(
  [
    "..g..g..",
    ".gggggg.",
    "g..gg..g",
    "g.gggg.g",
    "..g..g..",
    ".g.gg.g.",
    "g..gg..g",
    "..g..g..",
  ],
  { g: POT_G },
);
const LABEL = pixelArt(["wwwwww", "wkwkkw", "wwkwkw", "wkkwww", "wwwwww"], { w: WAX, k: WOOD[1] });
const BANNER_TEX = pixelTexture(14, 22, (g) => {
  g.fill((x, y) => pick(CLOTH.slice(0, 4), 0.55 + 0.2 * Math.sin(x * 0.9) - y / 70, bayer(x, y)));
  g.fill(() => GOLD[1], [0, 0, 14, 2]);
  g.fill(() => GOLD[2], [0, 0, 14, 1]);
  g.fill(() => GOLD[1], [0, 20, 14, 2]);
  // zigzag tail
  for (let x = 0; x < 14; x++) {
    const cut = x < 7 ? Math.floor((6 - x) / 1.5) : Math.floor((x - 7) / 1.5);
    for (let y = 21 - cut; y < 22; y++) g.set(x, y, "");
  }
  // emblem: crossed diamond
  g.stamp(3, 6, ["....gg....", "...gGGg...", "..gGggGg..", ".gGg..gGg.", "..gGggGg..", "...gGGg...", "....gg...."], {
    g: GOLD[1],
    G: GOLD[3],
  });
});

// ---------- helpers ----------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
  const rand = rng(7);

  const FLAG = flagTile();
  const BRICK = brickTile();
  const PLANK = plankTile();
  const CRATE = crateTile();
  const IRONT = ironTile();
  const LID = lidTile();

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    tile?: THREE.Texture,
    opts: { texel?: number; rot?: number; randomize?: boolean } = {},
  ) => {
    const t = opts.texel ?? TEXEL;
    if (tile) {
      const g = tileBox(size, tile, t, opts.randomize ? { rand } : undefined);
      return b.part(g, "#ffffff", { at, texture: tile, rotation: [0, opts.rot ?? 0, 0] });
    }
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: [0, opts.rot ?? 0, 0] });
  };
  const flat = (w: number, h: number, tex: THREE.Texture, at: [number, number, number], dir: [number, number, number], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });

  // painted cells for curved things
  const woodPaint = cellPaint(
    0.016,
    (c) => c.pick(WOOD.slice(1), 0.5 + 0.22 * Math.sin(c.at.y * 90 + c.at.x * 12) + 0.25 * (noise(c.at, 0.1, 3) - 0.5)),
    { dither: true },
  );
  const ironPaint = cellPaint(
    0.012,
    (c) => c.pick(IRON.slice(1), 0.4 + 0.35 * c.n.y + 0.2 * (c.random(2) - 0.5)),
    { dither: true },
  );
  const bonePaint = cellPaint(0.01, (c) => c.pick(BONE, 0.45 + 0.35 * c.n.y + 0.2 * (c.random(1) - 0.5)), { dither: true });
  const clayPaint = cellPaint(0.012, (c) => c.pick(CLAY, 0.4 + 0.4 * c.n.y + 0.25 * (noise(c.at, 0.06, 4) - 0.5)), {
    dither: true,
  });
  const waxPaint = cellPaint(0.008, (c) => c.pick([WAX, "#c8c09a", "#f6f0d6"].map(snap), 0.4 + 0.3 * c.n.x + 0.2 * (c.random(3) - 0.5)));

  // ================= FLOOR =================
  // 2.4 x 2.0 flagstone slab
  box([2.4, 0.1, 2.0], [0, -0.05 + 0.02, 0], STONE[2], FLAG, { randomize: true });
  // darker rim
  box([2.44, 0.04, 0.04], [0, 0.0, 1.0], STONE[1]);
  box([2.44, 0.04, 0.04], [0, 0.0, -1.0], STONE[1]);
  // scattered loose flag chips and cracks
  for (let i = 0; i < 14; i++) {
    const x = (rand() - 0.5) * 2.1;
    const z = (rand() - 0.2) * 1.7;
    box([0.06 + rand() * 0.08, 0.012, 0.05 + rand() * 0.06], [x, 0.026, z], STONE[1 + (i % 3)], undefined, { rot: rand() * 90 });
  }
  // moss patches on floor
  for (let i = 0; i < 9; i++) {
    const x = (rand() - 0.5) * 2.2;
    const z = -0.7 + rand() * 1.5;
    box([0.08 + rand() * 0.14, 0.01, 0.06 + rand() * 0.1], [x, 0.027, z], MOSS[1 + (i % 3)], undefined, { rot: rand() * 90 });
  }

  // ================= WALLS =================
  // back wall (z = -0.95) and left side wall (x = -1.15)
  box([2.4, 1.9, 0.14], [0, 0.97, -0.93], STONE[2], BRICK);
  box([0.14, 1.9, 1.95], [-1.13, 0.97, 0.02], STONE[2], BRICK);
  // wall cap blocks
  for (let i = 0; i < 6; i++) {
    box([0.38, 0.1, 0.18], [-1.0 + i * 0.4, 1.95, -0.93], STONE[3 - (i % 2)], undefined, { rot: 0 });
  }
  for (let i = 0; i < 5; i++) {
    box([0.18, 0.1, 0.38], [-1.13, 1.95, -0.7 + i * 0.4], STONE[3 - (i % 2)]);
  }
  // baseboard
  box([2.4, 0.08, 0.04], [0, 0.07, -0.84], STONE[1]);
  box([0.04, 0.08, 1.9], [-1.04, 0.07, 0.02], STONE[1]);
  // corner pillar
  box([0.26, 1.9, 0.26], [-1.06, 0.97, -0.86], STONE[3], BRICK, { texel: 0.016 });
  box([0.32, 0.1, 0.32], [-1.06, 1.95, -0.86], STONE[4]);
  box([0.32, 0.1, 0.32], [-1.06, 0.07, -0.86], STONE[1]);

  // arrow slit window in back wall
  box([0.1, 0.42, 0.04], [0.55, 1.35, -0.855], BLACK);
  box([0.2, 0.52, 0.03], [0.55, 1.35, -0.86], STONE[1]);
  // wall sconce-like iron rings
  for (const s of [-1, 1]) {
    b.sweep(
      [
        [s * 0.18 + 0.1, 1.02, -0.84],
        [s * 0.18 + 0.1, 0.94, -0.78],
        [s * 0.18 + 0.1, 0.86, -0.84],
        [s * 0.18 + 0.1, 0.94, -0.88],
      ],
      0.012,
      { color: ironPaint, section: { ngon: 4 }, caps: "flat", detail: 0.6 },
    );
  }

  // hanging banner on back wall
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.46, 6), IRON[3], { at: [-0.25, 1.72, -0.82], rotation: [0, 0, 90] });
  for (const s of [-1, 1]) b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD[2], { at: [-0.25 + s * 0.24, 1.72, -0.82] });
  flat(0.38, 0.6, BANNER_TEX, [-0.25, 1.4, -0.855], [0, 0, 1]);

  // cobwebs in corners
  flat(0.45, 0.32, WEB, [-0.94, 1.7, -0.76], [0.7, 0, 0.7], STONE[5]);
  flat(0.4, 0.28, WEB, [-0.45, 0.24, -0.84], [0, 0.2, 1], STONE[5]);

  // ================= TREASURE CHEST =================
  const cx = 0.42;
  const cz = 0.12;
  box([0.7, 0.34, 0.44], [cx, 0.19, cz], WOOD[2], PLANK, { texel: 0.014 });
  // lid: half-cylinder shell
  const lid = b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.01],
      [0.2, 0.1],
      [0.14, 0.17],
      [0.07, 0.205],
      [0, 0.215],
    ],
    { at: [cx, 0.36, cz], axis: [1, 0, 0], segments: 8, color: woodPaint },
  );
  void lid;
  // cap the lid ends
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 8), WOOD[2], { at: [cx + s * 0.36, 0.36, cz], rotation: [0, 0, 90] });
  }
  // iron bands: vertical straps around body and lid
  for (const s of [-1, 1]) {
    const bx = cx + s * 0.24;
    box([0.07, 0.35, 0.47], [bx, 0.19, cz], IRON[2], IRONT, { texel: 0.012 });
    b.part(new THREE.CylinderGeometry(0.225, 0.225, 0.07, 8, 1, true, 0, Math.PI), IRON[2], {
      at: [bx, 0.36, cz],
      rotation: [0, 0, 90],
    });
  }
  // corner brackets & rivets
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box([0.05, 0.36, 0.05], [cx + sx * 0.35, 0.19, cz + sz * 0.225], IRON[1]);
      b.part(new THREE.SphereGeometry(0.014, 5, 4), IRON[4], { at: [cx + sx * 0.35, 0.3, cz + sz * 0.255] });
    }
  // lock plate + keyhole
  box([0.1, 0.12, 0.02], [cx, 0.31, cz + 0.235], GOLD[1]);
  box([0.1, 0.02, 0.022], [cx, 0.365, cz + 0.235], GOLD[2]);
  box([0.02, 0.04, 0.024], [cx, 0.31, cz + 0.238], BLACK);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.024, 6), BLACK, { at: [cx, 0.33, cz + 0.238], rotation: [90, 0, 0] });
  // bottom feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box([0.06, 0.03, 0.06], [cx + sx * 0.3, 0.012, cz + sz * 0.18], WOOD[0]);
  // spilled coins on front lip + floor
  const coinPts: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.05 + rand() * 0.22;
    coinPts.push([cx + 0.05 + Math.cos(a) * d * 1.3, 0.03, cz + 0.36 + Math.abs(Math.sin(a)) * d * 1.1, rand() * 180]);
  }
  coinPts.forEach(([x, y, z, r], i) => {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.007, 6), GOLD[1 + (i % 2)], { at: [x, y + (i % 4) * 0.006, z], rotation: [0, r, 0] });
  });
  // coin pile mound on floor
  b.part(new THREE.CylinderGeometry(0.1, 0.17, 0.06, 7), GOLD[1], { at: [cx + 0.1, 0.05, cz + 0.45] });
  b.part(new THREE.CylinderGeometry(0.06, 0.1, 0.05, 7), GOLD[2], { at: [cx + 0.1, 0.1, cz + 0.45] });
  b.part(new THREE.CylinderGeometry(0.03, 0.06, 0.04, 6), GOLD[3], { at: [cx + 0.1, 0.14, cz + 0.45] });
  flat(0.04, 0.04, COIN, [cx + 0.2, 0.062, cz + 0.52], [0, 1, 0]);
  // ruby gem on lid
  b.part(new THREE.OctahedronGeometry(0.03), POT_R, { at: [cx, 0.6, cz + 0.02], scale: [1, 1.3, 1] });
  // ring of gems on chest front
  for (const s of [-1, 1]) b.part(new THREE.OctahedronGeometry(0.018), s > 0 ? POT_B : POT_G, { at: [cx + s * 0.18, 0.28, cz + 0.235] });
  // spilled gem on floor
  b.part(new THREE.OctahedronGeometry(0.02), POT_P, { at: [cx - 0.2, 0.04, cz + 0.4] });
  // key on floor
  box([0.1, 0.012, 0.016], [cx - 0.3, 0.03, cz + 0.5], GOLD[2], undefined, { rot: 20 });
  b.part(new THREE.TorusGeometry(0.02, 0.007, 4, 8), GOLD[2], { at: [cx - 0.36, 0.032, cz + 0.52], rotation: [90, 0, 0] });
  box([0.016, 0.012, 0.03], [cx - 0.25, 0.03, cz + 0.48], GOLD[1], undefined, { rot: 20 });

  // ================= BARRELS =================
  const barrel = (x: number, z: number, h: number, rot: number) => {
    const prof: Array<[number, number]> = [
      [0, 0],
      [0.15, 0],
      [0.19, h * 0.25],
      [0.21, h * 0.5],
      [0.19, h * 0.75],
      [0.15, h],
      [0, h],
    ];
    b.lathe(prof, { at: [x, 0, z], segments: 8, spin: rot, color: woodPaint });
    // hoops
    for (const [fy, rr] of [
      [0.1, 0.178],
      [0.34, 0.213],
      [0.66, 0.213],
      [0.9, 0.178],
    ] as Array<[number, number]>) {
      const y = h * fy;
      const ring = b.lathe(
        [
          [rr - 0.012, 0],
          [rr + 0.008, 0],
          [rr + 0.008, 0.035],
          [rr - 0.012, 0.035],
        ],
        { at: [x, y - 0.015, z], segments: 8, spin: rot, color: ironPaint },
      );
      void ring;
    }
    // lid top planks
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 8), WOOD[3], { at: [x, h + 0.004, z], rotation: [0, rot, 0] });
    for (let i = -1; i <= 1; i++) box([0.3, 0.004, 0.005], [x, h + 0.012, z + i * 0.07], WOOD[0], undefined, { rot });
    // bung
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 5), WOOD[0], { at: [x + 0.06, h + 0.014, z + 0.05] });
  };
  barrel(-0.62, -0.5, 0.58, 10);
  barrel(-0.25, -0.62, 0.52, 30);
  barrel(-0.82, -0.1, 0.5, 0);
  // tipped barrel with leaking puddle
  const tb = b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.17, 0.12],
      [0.18, 0.24],
      [0.17, 0.36],
      [0.13, 0.48],
      [0, 0.48],
    ],
    { at: [-0.5, 0.18, 0.55], axis: [0.2, 0.0, 1], segments: 8, color: woodPaint },
  );
  void tb;
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 8), WOOD[0], { at: [-0.5, 0.18, 0.55 + 0.49], rotation: [90, 0, 0] });
  box([0.24, 0.006, 0.2], [-0.52, 0.026, 1.0], POT_B, undefined, { rot: 15 });
  box([0.14, 0.006, 0.12], [-0.46, 0.026, 0.9], POT_B, undefined, { rot: 40 });

  // ================= CRATES =================
  const crate = (x: number, y: number, z: number, s: number, rot: number) => {
    box([s, s, s], [x, y + s / 2, z], WOOD[2], CRATE, { texel: s / 16, rot });
  };
  crate(0.95, 0, -0.55, 0.42, 8);
  crate(0.52, 0, -0.62, 0.34, -4);
  crate(0.9, 0.42, -0.55, 0.3, 25);
  crate(0.1, 0, -0.65, 0.26, 12);
  // rope & label on top crate
  flat(0.1, 0.07, LABEL, [0.95, 0.52, -0.395], [0, 0, 1]);
  b.sweep(
    [
      [0.78, 0.7, -0.5],
      [0.85, 0.74, -0.45],
      [0.98, 0.72, -0.4],
      [1.04, 0.66, -0.5],
    ],
    0.01,
    BONE[1],
    { section: { ngon: 4 }, detail: 0.6 },
  );
  // sack on crate
  b.part(new THREE.SphereGeometry(0.1, 7, 5), BONE[1], { at: [0.55, 0.45, -0.62], scale: [1, 1.1, 0.85] });
  b.part(new THREE.CylinderGeometry(0.04, 0.06, 0.05, 6), BONE[0], { at: [0.55, 0.56, -0.62] });
  b.part(new THREE.TorusGeometry(0.045, 0.008, 4, 6), CLOTH[2], { at: [0.55, 0.535, -0.62], rotation: [90, 0, 0] });

  // ================= TORCH =================
  const tx = -1.03;
  const ty = 1.15;
  const tz = 0.25;
  box([0.04, 0.3, 0.04], [tx + 0.03, ty, tz], WOOD[1]);
  b.part(new THREE.CylinderGeometry(0.06, 0.04, 0.1, 6), IRON[2], { at: [tx + 0.03, ty + 0.16, tz] });
  box([0.1, 0.03, 0.1], [tx + 0.02, ty - 0.05, tz], IRON[1]);
  box([0.04, 0.04, 0.16], [tx - 0.02, ty + 0.06, tz], IRON[1]);
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.24), "#ffffff", { at: [tx + 0.05, ty + 0.3, tz], dir: [1, 0, 0], axis: "z", texture: FLAME_TEX }),
    1.4,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.24), "#ffffff", { at: [tx + 0.05, ty + 0.3, tz], dir: [0, 0, 1], axis: "z", texture: FLAME_TEX }),
    1.4,
  );
  glow(b.part(new THREE.OctahedronGeometry(0.06), FLAME_Y, { at: [tx + 0.03, ty + 0.27, tz], scale: [1, 1.4, 1] }), 1.2);
  // soot above torch
  box([0.01, 0.4, 0.2], [-1.055, ty + 0.55, tz], STONE[0]);

  // ================= WALL SHELF WITH POTIONS & BOOKS =================
  const sx0 = 0.25;
  const sy = 1.0;
  const sz = -0.8;
  box([0.9, 0.04, 0.16], [sx0, sy, sz], WOOD[2], undefined);
  box([0.9, 0.012, 0.162], [sx0, sy + 0.022, sz], WOOD[3]);
  for (const s of [-1, 1]) box([0.03, 0.12, 0.14], [sx0 + s * 0.3, sy - 0.08, sz], WOOD[1]);
  box([0.9, 0.04, 0.16], [sx0, sy + 0.45, sz], WOOD[2]);
  box([0.9, 0.012, 0.162], [sx0, sy + 0.472, sz], WOOD[3]);
  for (const s of [-1, 1]) box([0.03, 0.12, 0.14], [sx0 + s * 0.3, sy + 0.37, sz], WOOD[1]);
  // potion bottles
  const bottle = (x: number, y: number, z: number, col: string, big: number) => {
    const body = b.lathe(
      [
        [0, 0],
        [0.035 * big, 0],
        [0.045 * big, 0.03 * big],
        [0.045 * big, 0.06 * big],
        [0.02 * big, 0.09 * big],
        [0.016 * big, 0.12 * big],
        [0, 0.12 * big],
      ],
      { at: [x, y, z], segments: 8, color: col },
    );
    glow(body, 0.9);
    b.part(new THREE.CylinderGeometry(0.02 * big, 0.016 * big, 0.03 * big, 5), WOOD[3], { at: [x, y + 0.135 * big, z] });
  };
  bottle(sx0 - 0.3, sy + 0.022, sz + 0.01, POT_G, 1.1);
  bottle(sx0 - 0.2, sy + 0.022, sz - 0.01, POT_P, 0.9);
  bottle(sx0 - 0.1, sy + 0.022, sz + 0.02, POT_R, 1.2);
  bottle(sx0 + 0.02, sy + 0.022, sz, POT_B, 1.0);
  flat(0.04, 0.03, LABEL, [sx0 - 0.3, sy + 0.06, sz + 0.07], [0, 0, 1]);
  flat(0.04, 0.03, LABEL, [sx0 - 0.1, sy + 0.065, sz + 0.075], [0, 0, 1]);
  // skull on shelf
  flat(0.09, 0.09, SKULL, [sx0 + 0.25, sy + 0.075, sz + 0.07], [0, 0, 1]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), BONE[2], { at: [sx0 + 0.25, sy + 0.075, sz - 0.01], scale: [1, 1, 0.9] });
  // books on upper shelf
  const bookCols = [CLOTH, MOSS, ["#16243a", "#243e6a", "#3a62a0", "#5a8ad0"].map(snap), CLAY, ["#2a1a3a", "#4a2e6a", "#6e4a9a", "#9a74c8"].map(snap)];
  for (let i = 0; i < 8; i++) {
    const tex = bookTile(bookCols[i % bookCols.length]);
    const h = 0.17 + (i % 3) * 0.025;
    const bx = sx0 - 0.36 + i * 0.058;
    b.part(new THREE.BoxGeometry(0.05, h, 0.11), "#ffffff", { at: [bx, sy + 0.478 + h / 2, sz], texture: tex });
  }
  // leaning book
  b.part(new THREE.BoxGeometry(0.05, 0.19, 0.11), bookCols[3][2], { at: [sx0 + 0.27, sy + 0.57, sz], rotation: [0, 0, -18] });
  // hourglass-ish jar on upper shelf
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6), BONE[3], { at: [sx0 + 0.38, sy + 0.525, sz] });
  glow(b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.07, 6), POT_G, { at: [sx0 + 0.38, sy + 0.525, sz] }), 0.8);

  // ================= SKULL & BONE PILE WITH CANDLE =================
  const px = -0.15;
  const pz = 0.5;
  b.part(new THREE.SphereGeometry(0.09, 7, 5), bonePaint, { at: [px, 0.08, pz], scale: [1, 0.9, 1.05] });
  b.part(new THREE.BoxGeometry(0.07, 0.05, 0.06), bonePaint, { at: [px, 0.03, pz + 0.08] });
  flat(0.1, 0.1, SKULL, [px, 0.09, pz + 0.095], [0, 0.0, 1]);
  // eye glow
  for (const s of [-1, 1]) glow(b.part(new THREE.BoxGeometry(0.014, 0.014, 0.006), FLAME_O, { at: [px + s * 0.022, 0.1, pz + 0.098] }), 1.5);
  // bones
  const bone = (a: [number, number, number], c: [number, number, number]) => {
    b.rod(a, c, 0.011, bonePaint, { sides: 5 });
    b.part(new THREE.SphereGeometry(0.019, 5, 4), BONE[2], { at: a });
    b.part(new THREE.SphereGeometry(0.019, 5, 4), BONE[2], { at: c });
  };
  bone([px - 0.25, 0.022, pz + 0.05], [px - 0.05, 0.03, pz + 0.12]);
  bone([px + 0.2, 0.022, pz + 0.18], [px + 0.02, 0.03, pz - 0.05]);
  bone([px + 0.15, 0.022, pz - 0.12], [px + 0.3, 0.025, pz + 0.04]);
  bone([px - 0.12, 0.022, pz - 0.16], [px + 0.1, 0.04, pz - 0.2]);
  // ribs
  for (let i = 0; i < 4; i++) {
    b.sweep(
      [
        [px - 0.28 + i * 0.03, 0.02, pz - 0.25],
        [px - 0.28 + i * 0.03, 0.09 - i * 0.008, pz - 0.2],
        [px - 0.28 + i * 0.03, 0.02, pz - 0.14],
      ],
      0.007,
      BONE[2],
      { section: { ngon: 4 }, caps: "flat", detail: 0.5 },
    );
  }
  // candle on top of skull
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.022, 0.09],
      [0.03, 0.1],
      [0.02, 0.12],
      [0, 0.12],
    ],
    { at: [px, 0.165, pz - 0.01], segments: 6, color: waxPaint },
  );
  // drips
  for (const s of [-1, 1]) b.part(new THREE.BoxGeometry(0.01, 0.04, 0.01), WAX, { at: [px + s * 0.026, 0.23, pz - 0.01 + s * 0.004] });
  box([0.006, 0.02, 0.006], [px, 0.296, pz - 0.01], BLACK);
  glow(b.part(new THREE.PlaneGeometry(0.06, 0.07), "#ffffff", { at: [px, 0.33, pz - 0.01], dir: [0, 0, 1], axis: "z", texture: FLAME_TEX }), 1.4);
  glow(b.part(new THREE.PlaneGeometry(0.06, 0.07), "#ffffff", { at: [px, 0.33, pz - 0.01], dir: [1, 0, 0], axis: "z", texture: FLAME_TEX }), 1.4);
  // wax puddle on skull
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.01, 6), WAX, { at: [px, 0.166, pz - 0.01] });

  // ================= WEAPON RACK =================
  const wx = 0.95;
  const wz = 0.55;
  // frame
  for (const s of [-1, 1]) {
    box([0.06, 0.75, 0.06], [wx + s * 0.28, 0.375, wz], WOOD[1], PLANK, { texel: 0.012 });
    box([0.1, 0.04, 0.2], [wx + s * 0.28, 0.02, wz], WOOD[0]);
  }
  box([0.62, 0.05, 0.06], [wx, 0.72, wz], WOOD[2], PLANK, { texel: 0.012 });
  box([0.62, 0.04, 0.06], [wx, 0.4, wz], WOOD[2], PLANK, { texel: 0.012 });
  // sword leaning
  const sword = (x: number, lean: number, len: number, bladeCol: string) => {
    const y0 = 0.05;
    const dx = Math.sin((lean * Math.PI) / 180);
    const dy = Math.cos((lean * Math.PI) / 180);
    const base: [number, number, number] = [x, y0, wz - 0.03];
    const tip: [number, number, number] = [x + dx * len, y0 + dy * len, wz - 0.03];
    b.rod(base, tip, [0.022, 0.006], bladeCol, { section: "box", caps: "flat" });
    const gripTop: [number, number, number] = [x - dx * 0.02, y0 - 0.02, wz - 0.03];
    void gripTop;
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.03), GOLD[1], { at: base, rotation: [0, 0, -lean] });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 5), CLOTH[1], {
      at: [x - dx * 0.06, y0 - dy * 0.06, wz - 0.03],
      rotation: [0, 0, -lean],
    });
    b.part(new THREE.SphereGeometry(0.022, 5, 4), GOLD[2], { at: [x - dx * 0.12, y0 - dy * 0.12, wz - 0.03] });
    // fuller line
    b.rod([x + dx * 0.08, y0 + dy * 0.08, wz - 0.012], [x + dx * len * 0.85, y0 + dy * len * 0.85, wz - 0.012], 0.004, IRON[2], { caps: "flat" });
  };
  sword(wx - 0.12, 4, 0.62, IRON[4]);
  sword(wx + 0.12, -3, 0.58, IRON[3]);
  // spear on the back
  b.rod([wx - 0.02, 0.0, wz + 0.04], [wx - 0.08, 1.05, wz + 0.04], 0.014, WOOD[3], { sides: 6 });
  b.spike([wx - 0.08, 1.05, wz + 0.04], [0, 1, 0], 0.16, 0.03, IRON[4], { sides: 4 });
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.02), CLOTH[2], { at: [wx - 0.08, 0.98, wz + 0.04] });
  // round shield leaning on rack
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.2, 0.025],
      [0.16, 0.04],
      [0.06, 0.06],
      [0, 0.075],
    ],
    {
      at: [wx + 0.27, 0.28, wz + 0.2],
      axis: [0.25, 0.3, 1],
      segments: 8,
      color: cellPaint(0.012, (c) => (c.s[1] < 0 || Math.floor(c.s[1] / 45) % 2 === 0 ? c.pick(CLOTH, 0.5 + 0.2 * c.n.y) : c.pick(GOLD, 0.45))),
    },
  );
  b.part(new THREE.SphereGeometry(0.035, 6, 4), IRON[4], { at: [wx + 0.27 + 0.02, 0.28 + 0.022, wz + 0.2 + 0.08] });

  // ================= CRACKED POT =================
  const pox = -0.85;
  const poz = 0.88;
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.11, 0.06],
      [0.13, 0.12],
      [0.1, 0.19],
      [0.07, 0.22],
      [0.08, 0.25],
      [0.06, 0.25],
      [0.05, 0.22],
      [0.07, 0.19],
      [0.1, 0.12],
      [0.09, 0.06],
      [0, 0.05],
    ],
    { at: [pox, 0, poz], segments: 8, color: clayPaint },
  );
  // missing chunk shard on floor + rim stripe
  box([0.05, 0.02, 0.04], [pox + 0.14, 0.012, poz + 0.08], CLAY[2], undefined, { rot: 30 });
  box([0.03, 0.015, 0.03], [pox + 0.2, 0.01, poz + 0.02], CLAY[1], undefined, { rot: 60 });
  box([0.012, 0.1, 0.006], [pox + 0.01, 0.14, poz + 0.125], CLAY[0]);
  box([0.012, 0.05, 0.006], [pox + 0.04, 0.07, poz + 0.108], CLAY[0]);
  b.part(new THREE.TorusGeometry(0.08, 0.008, 4, 8), GOLD[1], { at: [pox, 0.25, poz], rotation: [90, 0, 0] });
  // rune on pot
  glow(b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", { at: [pox, 0.12, poz + 0.133], dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.2);

  // ================= SMALL CLUTTER =================
  // stones / rubble in corners
  for (let i = 0; i < 12; i++) {
    const x = -1.0 + rand() * 0.45;
    const z = -0.8 + rand() * 0.45;
    const s = 0.04 + rand() * 0.07;
    b.part(new THREE.DodecahedronGeometry(s, 0), STONE[2 + (i % 3)], { at: [x, s * 0.7, z], rotation: [rand() * 90, rand() * 90, 0] });
  }
  // rats' dropped scroll
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6), BONE[3], { at: [0.0, 0.025, 0.95], rotation: [90, 0, 70] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 6), CLOTH[2], { at: [-0.04, 0.025, 0.97], rotation: [90, 0, 70] });
  // floor moss tufts at wall base
  for (let i = 0; i < 10; i++) {
    const x = -0.95 + i * 0.22;
    box([0.1 + rand() * 0.06, 0.04 + rand() * 0.04, 0.04], [x, 0.05, -0.84], MOSS[1 + (i % 3)], undefined, { rot: 0 });
  }
  // staircase-pixel stalactite drip hanging from shelf
  const DRIP = stepped([[0, 3], [0, 2], [1, 2], [1, 1]].map((v) => [v[0], v[1]] as [number, number]), 0.02, { rows: true });
  b.extrude(DRIP, { at: [0.6, 0.98, -0.78], x: [1, 0, 0], y: [0, -1, 0], thickness: 0.02, color: STONE[3] });

  return b.root;
}
