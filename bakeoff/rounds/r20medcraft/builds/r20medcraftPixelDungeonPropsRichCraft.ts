import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A dungeon corner in chunky pixel art: an open treasure chest spilling coins, wall and standing torches with dithered firelight, three banded barrels, a bone pile with skulls, and a spike trap with a skull on one spike.",
  style: "pixel art",
  commit: "88fc1f0",
};

type P = [number, number, number];

const C = {
  iron: "#3b4152",
  ironHi: "#7d869b",
  ironDk: "#242836",
  base: "#14151d",
  gold: "#e8b23a",
  goldDk: "#b57a1e",
  goldHi: "#ffe27a",
  wood: "#6b3d18",
  woodDk: "#3d2210",
  woodHi: "#9a6330",
  bone: "#d9d2b4",
  boneDk: "#a89f80",
  boneHi: "#efe9cf",
  cloth: "#4a3320",
  char: "#1b1410",
  blood: "#7a1020",
  bloodHi: "#a81c2c",
  wax: "#efe6c4",
  moss: "#3f6b2a",
  mossDk: "#2a4a1e",
  mossHi: "#6a9a3a",
  soot: "#1b1722",
  wine: "#6b1020",
  wineHi: "#8c1a2c",
  pit: "#0b0b12",
  ember: "#ffb040",
  capRed: "#b02a30",
  white: "#ffffff",
};

const STONE_RAMP = ["#1c1e2a", "#2b2e3d", "#3b3f52", "#4f546a", "#7a8099"];
const BRICK_RAMP = ["#2a2230", "#3a2f42", "#4d4057", "#625470", "#7a6a88"];
const WOOD_RAMP = ["#2a1608", "#4a2a10", "#6b3d18", "#8a5424", "#a8703a"];
const BARREL_RAMP = ["#2a170a", "#4a2a12", "#6a3e1a", "#8a5726"];
const MOSS_RAMP = ["#2a4a1e", "#3f6b2a", "#6a9a3a"];
const BONE_RAMP = ["#7c735a", "#a89f80", "#cbc3a3", "#e6dfc2", "#f4efd6"];
const STEEL = ["#4b5266", "#7d869b", "#aab3c6", "#d6dcea"];
const BLOOD = ["#4a0a14", "#7a1020", "#a81c2c"];

const TEXEL = 0.016;

// ---------------------------------------------------------------------------------------------------------------
// Textures

const mkStone = (seed: number) =>
  pixelTexture(32, 32, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      if (x === 0 || y === 0) return STONE_RAMP[4];
      if (x === 31 || y === 31) return STONE_RAMP[0];
      const e = Math.min(x, y, 31 - x, 31 - y) / 6;
      return pick(STONE_RAMP, 0.38 + 0.28 * r() + 0.12 * Math.min(e, 1) - 0.1, bayer(x, y));
    });
    let cx = 4 + Math.floor(r() * 24);
    let cy = 4 + Math.floor(r() * 12);
    for (let k = 0; k < 11; k++) {
      g.set(cx, cy, STONE_RAMP[0]);
      cx += Math.floor(r() * 3) - 1;
      cy += r() < 0.8 ? 1 : 0;
    }
    for (let k = 0; k < 14; k++) g.set(Math.floor(r() * 32), 8 + Math.floor(r() * 24), MOSS_RAMP[Math.floor(r() * 3)]);
  });
const STONES = [mkStone(1), mkStone(2), mkStone(3)];

const mkBrick = (seed: number) =>
  pixelTexture(32, 32, (g) => {
    const r = rng(seed);
    g.fill((x, y) => {
      const row = Math.floor(y / 8);
      const ly = y % 8;
      const off = row % 2 ? 8 : 0;
      const bx = (x + off) % 16;
      const idx = Math.floor((x + off) / 16) + row * 3;
      if (ly === 7 || bx === 15) return "#15131c";
      const t = ((idx * 37 + seed * 11) % 10) / 10;
      const v = 0.3 + 0.4 * t + 0.15 * r() + (ly === 0 ? 0.2 : 0) - (ly === 6 ? 0.12 : 0);
      return pick(BRICK_RAMP, v, bayer(x, y));
    });
    for (let k = 0; k < 6; k++) g.set(Math.floor(r() * 32), 16 + Math.floor(r() * 16), MOSS_RAMP[Math.floor(r() * 3)]);
  });
const BRICKS = [mkBrick(4), mkBrick(5)];

const PLANKS = pixelTexture(48, 35, (g) => {
  const r = rng(21);
  g.fill((x, y) => {
    const row = Math.floor(y / 7);
    const ly = y % 7;
    if (ly === 6) return WOOD_RAMP[0];
    if (x === (row * 17 + 9) % 48) return WOOD_RAMP[0];
    const v =
      0.5 + 0.18 * Math.sin((x + row * 9) * 0.35 + ly * 0.3) + 0.2 * (r() - 0.5) + (row % 2 ? 0.06 : -0.04) + (ly === 0 ? 0.12 : 0);
    return pick(WOOD_RAMP, v, bayer(x, y));
  });
  for (let row = 0; row < 5; row++) {
    g.set(2, row * 7 + 3, "#1a1a22");
    g.set(45, row * 7 + 3, "#1a1a22");
  }
});

const FLAME = pixelArt(
  [
    "...r....",
    "..rr....",
    "..ror...",
    ".rooor..",
    ".rooor.r",
    ".roooorr",
    "roooyoor",
    "rooyyoor",
    "rooywyor",
    "rooywyor",
    ".rooyoor",
    "..rrrr..",
  ],
  { r: "#e0471a", o: "#ff9a1f", y: "#ffe36b", w: "#fff6c8" },
);

const HALO = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5) / 8;
    if (d >= 1) return "";
    const a = (1 - d) ** 1.3;
    if (a <= bayer(x, y)) return "";
    return d < 0.35 ? "#ffe49a" : "#ffc060";
  });
});

const SKULL_ROWS = ["..wwww..", ".wwwwww.", "wwkwwkww", "wwkwwkww", ".wwwwww.", "..wkkw..", "..w.w.w."];
const MARK_SKULL = pixelArt(["..wwww..", ".wwwwww.", "wwkwwkww", "wwkwwkww", ".wwwwww.", "..wkkw..", "..wwww..", "..w.w.w."], {
  w: "#e8e0c0",
  k: "#1a120a",
});
const MARK_X = pixelArt(
  ["r......r", ".r....r.", "..r..r..", "...rr...", "...rr...", "..r..r..", ".r....r.", "r......r"],
  { r: "#c0392b" },
);
const MARK_FLASK = pixelArt(
  ["...kk...", "...kk...", "..kggk..", ".kgwggk.", ".kggggk.", ".kggggk.", "..kkkk..", "........"],
  { k: "#1a120a", g: "#4ac24a", w: "#e8f8d0" },
);

const KEYHOLE = pixelArt(
  ["hhhhhhhh", "hggggggd", "hggkkggd", "hgkkkkgd", "hggkkggd", "hggkkggd", "hggggggd", "dddddddd"],
  { h: "#ffe27a", g: "#e8b23a", d: "#b57a1e", k: "#1a120a" },
);

const BANNER = pixelTexture(16, 24, (g) => {
  const r = rng(3);
  const ramp = ["#4a0f1a", "#6e1624", "#8e1f30", "#a82a3c"];
  g.fill((x, y) => {
    if (y >= 19 && Math.abs(x - 7.5) < (y - 18) * 0.8) return "";
    if ((x === 1 || x === 14 || y === 1) && !(y >= 19 && Math.abs(x - 7.5) < (y - 18) * 0.8 + 1.5)) return "#e8b23a";
    return pick(ramp, 0.5 + 0.25 * Math.sin(x * 0.8) + 0.2 * r(), bayer(x, y));
  });
  g.stamp(4, 6, SKULL_ROWS, { w: "#ece4c6", k: "#2a0a10" });
  for (let k = 0; k < 8; k++) g.set(Math.floor(r() * 16), 17 + Math.floor(r() * 3), "");
});

const webTex = (right: boolean) =>
  pixelTexture(12, 12, (g) => {
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        const x = right ? 11 - i : i;
        const d = Math.hypot(i, j);
        const onRay = i === 0 || j === 0 || i === j || (i === 2 * j && i < 12) || (j === 2 * i && j < 12);
        const onArc = Math.abs(d - 4.5) < 0.6 || Math.abs(d - 8.5) < 0.6;
        if ((onRay || onArc) && d < 11.5) g.set(x, j, "#cfd3dc");
      }
    }
  });
const WEB_L = webTex(false);
const WEB_R = webTex(true);

const BONE_SHEET_LAYOUT = skinLayout({ cran: [8, 7, 8], jaw: [6, 3, 6] }, 64);
const SKULL_SHEET = pixelTexture(BONE_SHEET_LAYOUT.size[0], BONE_SHEET_LAYOUT.size[1], (g) => {
  const r = rng(5);
  for (const faces of Object.values(BONE_SHEET_LAYOUT.faces))
    for (const rect of Object.values(faces)) g.fill((x, y) => pick(BONE_RAMP, 0.55 + 0.3 * r() - y * 0.01, bayer(x, y)), rect);
  const f = BONE_SHEET_LAYOUT.faces.cran.pz;
  g.stamp(f[0], f[1], ["........", "........", ".kk..kk.", ".kk..kk.", "...kk...", "........", "........"], {
    k: "#14110f",
  });
  const j = BONE_SHEET_LAYOUT.faces.jaw.pz;
  g.stamp(j[0], j[1], ["wkwwkw", "wkwwkw", "......"], { w: "#f4efd6", k: "#2a2418" });
  const c = BONE_SHEET_LAYOUT.faces.cran.px;
  g.stamp(c[0] + 2, c[1] + 1, ["k", "k", ".k"], { k: "#5c5440" });
});

// ---------------------------------------------------------------------------------------------------------------
// Barrel shape and paint

const barrelR = (y: number) => 0.19 + 0.03 * (1 - (y / 0.27) ** 2);
const BARREL_YS = [-0.27, -0.18, -0.09, 0, 0.09, 0.18, 0.27];
const BARREL_OUTLINE: OutlinePoint[] = [
  [0, -0.27],
  ...BARREL_YS.map((y): OutlinePoint => [barrelR(y), y]),
  [0, 0.27],
];
const BARREL = cellPaint(
  TEXEL,
  (c) => {
    const topFace = c.axis === 1;
    const stave = topFace ? Math.floor(c.u / 6) : Math.floor(c.s[1] / 30);
    const tone = 0.35 + (0.12 * ((stave * 7) % 5)) / 5 + 0.25 * c.random(1) + 0.18 * c.n.y;
    if (!topFace && ((c.s[1] % 30) + 30) % 30 < 3.2) return BARREL_RAMP[0];
    if (topFace && ((c.u % 6) + 6) % 6 === 0) return BARREL_RAMP[0];
    if (c.at.y < 0.2 && noise(c.at, 0.1, 5) > 0.62) return c.pick(MOSS_RAMP, 0.3 + 0.5 * c.random(2));
    return c.pick(BARREL_RAMP, tone);
  },
  { dither: true },
);

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);

  const box = (size: P, color: string, at: P, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: root, at, ...o });

  // -------------------------------------------------------------------------------------------------------------
  // Floor
  box([2.62, 0.04, 2.22], C.base, [0, 0.02, 0]);
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 4; j++) {
      const tex = STONES[(i * 3 + j * 5 + i * j) % 3];
      const h = 0.06 + 0.004 * R();
      b.part(tileBox([0.51, h, 0.54], tex, TEXEL), C.white, {
        bone: root,
        at: [-1.04 + i * 0.52, h / 2, -0.825 + j * 0.55],
        texture: tex,
      });
    }

  // -------------------------------------------------------------------------------------------------------------
  // Back wall
  for (let col = 0; col < 5; col++) {
    const x = -1.04 + col * 0.52;
    const rows: [number, number][] = [
      [0.52, 0.32],
      [0.52, 0.84],
      [col % 2 === 0 ? 0.26 : 0.12, col % 2 === 0 ? 1.23 : 1.16],
    ];
    rows.forEach(([h, y], row) => {
      const tex = BRICKS[(col + row) % 2];
      b.part(tileBox([0.52, h, 0.2], tex, TEXEL), C.white, { bone: root, at: [x, y, -1.0], texture: tex });
    });
  }
  // webs in the top corners
  b.part(new THREE.PlaneGeometry(0.24, 0.24), C.white, {
    bone: root,
    at: [-1.17, 1.22, -0.897],
    dir: [0, 0, 1],
    axis: "z",
    texture: WEB_L,
  });
  b.part(new THREE.PlaneGeometry(0.24, 0.24), C.white, {
    bone: root,
    at: [1.17, 1.22, -0.897],
    dir: [0, 0, 1],
    axis: "z",
    texture: WEB_R,
  });
  // moss low on the wall
  for (let k = 0; k < 16; k++) {
    const w = 0.04 + 0.07 * R();
    const hgt = 0.03 + 0.1 * R();
    box([w, hgt, 0.004], [C.moss, C.mossDk, C.mossHi][k % 3], [-1.2 + R() * 2.4, 0.08 + hgt / 2, -0.8985]);
  }
  // banner
  box([0.34, 0.012, 0.012], C.iron, [0.22, 1.16, -0.885], { rotation: [0, 0, 0] });
  for (const s of [-1, 1]) box([0.03, 0.03, 0.03], C.gold, [0.22 + s * 0.18, 1.16, -0.885]);
  b.part(new THREE.BoxGeometry(0.32, 0.5, 0.012), C.white, { bone: root, at: [0.22, 0.89, -0.893], texture: BANNER });
  // hanging chain with shackles
  box([0.08, 0.05, 0.03], C.iron, [-0.95, 1.12, -0.885]);
  box([0.02, 0.02, 0.012], C.ironHi, [-0.95, 1.12, -0.867]);
  for (let i = 0; i < 7; i++) {
    const y = 1.07 - i * 0.04;
    if (i % 2 === 0) box([0.032, 0.05, 0.012], i % 3 === 0 ? C.ironHi : C.iron, [-0.95, y, -0.887]);
    else box([0.012, 0.05, 0.032], C.iron, [-0.95, y, -0.887]);
  }
  box([0.1, 0.05, 0.04], C.iron, [-0.95, 0.77, -0.882]);
  box([0.07, 0.035, 0.05], C.ironDk, [-0.95, 0.77, -0.875]);
  box([0.02, 0.02, 0.012], C.ironHi, [-0.95, 0.77, -0.853]);

  // -------------------------------------------------------------------------------------------------------------
  // Moss, mushrooms on the floor
  const mossBlock = (x: number, z: number, n: number, spread: number) => {
    for (let k = 0; k < n; k++) {
      const s = 0.03 + 0.05 * R();
      box([s, 0.006, s * (0.7 + 0.6 * R())], [C.moss, C.mossDk, C.mossHi][k % 3], [x + (R() - 0.5) * spread, 0.067, z + (R() - 0.5) * spread], {
        rotation: [0, R() * 90, 0],
      });
    }
  };
  mossBlock(-0.2, -0.85, 7, 0.3);
  mossBlock(1.1, -0.85, 6, 0.3);
  mossBlock(0.35, -0.8, 5, 0.25);
  mossBlock(-1.1, 0.95, 7, 0.3);
  mossBlock(1.15, 0.92, 6, 0.3);
  for (const [mx, mz, ms] of [
    [-1.2, -0.82, 1],
    [-1.11, -0.78, 0.7],
    [-1.16, -0.72, 0.5],
  ] as [number, number, number][]) {
    box([0.02 * ms + 0.01, 0.04 * ms + 0.02, 0.02 * ms + 0.01], "#d8d0b4", [mx, 0.06 + (0.04 * ms + 0.02) / 2, mz]);
    box([0.06 * ms + 0.02, 0.025 * ms + 0.012, 0.06 * ms + 0.02], C.capRed, [mx, 0.06 + 0.04 * ms + 0.02 + 0.01, mz]);
    box([0.014 * ms + 0.006, 0.006, 0.014 * ms + 0.006], C.white, [mx + 0.01, 0.06 + 0.04 * ms + 0.02 + 0.02 * ms + 0.012, mz]);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Fire helpers
  const flame = (x: number, y: number, z: number, s: number) => {
    glow(
      b.cards([frame([x, y, z], [0, 1, 0])], FLAME, {
        size: [0.15 * s, 0.23 * s],
        cross: true,
        flow: [0, 0, 1],
        bone: root,
        sink: 0,
      }),
      1.5,
    );
    for (let k = 0; k < 4; k++)
      glow(
        box([0.012, 0.012, 0.012], C.ember, [x + (R() - 0.5) * 0.12 * s, y + 0.1 + R() * 0.2 * s, z + (R() - 0.5) * 0.1 * s], {
          rotation: [R() * 90, R() * 90, 0],
        }),
        1.2,
      );
  };

  const wallTorch = (x: number, y: number) => {
    // soot above, firelight halo
    box([0.1, 0.32, 0.003], C.soot, [x, y + 0.5, -0.8978]);
    b.part(new THREE.PlaneGeometry(0.9, 0.9), C.white, {
      bone: root,
      at: [x, y + 0.36, -0.895],
      dir: [0, 0, 1],
      axis: "z",
      texture: HALO,
    });
    box([0.12, 0.2, 0.036], C.iron, [x, y, -0.882]);
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) box([0.016, 0.016, 0.012], C.ironHi, [x + sx * 0.04, y + sy * 0.075, -0.862]);
    b.rod([x, y - 0.02, -0.864], [x, y - 0.02, -0.8], 0.014, C.iron, { bone: root, sides: 6 });
    b.rod([x, y - 0.06, -0.8], [x, y + 0.32, -0.72], 0.026, C.wood, { bone: root, sides: 6 });
    box([0.075, 0.04, 0.075], C.iron, [x, y + 0.04, -0.779]);
    box([0.075, 0.04, 0.075], C.iron, [x, y + 0.16, -0.754]);
    b.rod([x, y + 0.3, -0.724], [x, y + 0.4, -0.703], 0.045, C.cloth, { bone: root, sides: 6 });
    box([0.07, 0.02, 0.07], C.char, [x, y + 0.41, -0.7]);
    flame(x, y + 0.42, -0.7, 1);
  };
  wallTorch(-0.5, 0.85);
  wallTorch(0.95, 0.85);

  // standing iron torch
  const standTorch = (x: number, z: number) => {
    b.part(new THREE.PlaneGeometry(1.1, 1.1), C.white, { bone: root, at: [x, 0.067, z], dir: [0, 1, 0], axis: "z", texture: HALO });
    b.rod([x, 0.075, z], [x, 0.9, z], 0.02, C.iron, { bone: root, sides: 6 });
    for (const a of [90, 210, 330]) {
      const rad = (a * Math.PI) / 180;
      b.rod([x, 0.42, z], [x + 0.14 * Math.cos(rad), 0.075, z + 0.14 * Math.sin(rad)], 0.014, C.iron, { bone: root, sides: 5 });
      box([0.04, 0.02, 0.04], C.ironHi, [x + 0.14 * Math.cos(rad), 0.07, z + 0.14 * Math.sin(rad)]);
    }
    box([0.06, 0.025, 0.06], C.iron, [x, 0.42, z]);
    box([0.06, 0.025, 0.06], C.iron, [x, 0.66, z]);
    b.lathe(
      [
        [0, 0],
        [0.035, 0],
        [0.06, 0.07],
        [0.05, 0.07],
        [0.03, 0.015],
        [0, 0.015],
      ],
      { at: [x, 0.88, z], segments: 8, color: C.iron, bone: root },
    );
    b.rod([x, 0.9, z], [x, 1.0, z], 0.04, C.cloth, { bone: root, sides: 6 });
    box([0.06, 0.02, 0.06], C.char, [x, 1.01, z]);
    flame(x, 1.02, z, 1.25);
  };
  standTorch(-1.15, 0.05);

  // a dead torch on the floor
  b.rod([0.2, 0.085, -0.5], [0.45, 0.085, -0.32], 0.022, C.woodDk, { bone: root, sides: 6 });
  b.rod([0.45, 0.085, -0.32], [0.52, 0.085, -0.27], 0.035, C.char, { bone: root, sides: 6 });
  box([0.1, 0.004, 0.08], C.soot, [0.5, 0.066, -0.27], { rotation: [0, 35, 0] });

  // -------------------------------------------------------------------------------------------------------------
  // Chest
  const cx = -0.55;
  const cz = -0.55;
  const lid = b.joint("lid", { parent: root, at: [cx, 0.45, cz - 0.23], dir: [0, 0, 1], role: "hinge" });
  const lidBox = (size: P, color: string, at: P) =>
    box(size, color, at, { bone: lid });
  const woodBox = (size: P, at: P, bone = root) =>
    b.part(tileBox(size, PLANKS, TEXEL), C.white, { bone, at, texture: PLANKS });

  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box([0.07, 0.03, 0.07], C.woodDk, [cx + sx * 0.33, 0.075, cz + sz * 0.19]);
  woodBox([0.72, 0.3, 0.46], [cx, 0.24, cz]);
  box([0.76, 0.05, 0.5], C.woodDk, [cx, 0.115, cz]);
  // rim walls
  woodBox([0.72, 0.06, 0.04], [cx, 0.42, cz + 0.21]);
  woodBox([0.72, 0.06, 0.04], [cx, 0.42, cz - 0.21]);
  woodBox([0.04, 0.06, 0.46], [cx + 0.34, 0.42, cz]);
  woodBox([0.04, 0.06, 0.46], [cx - 0.34, 0.42, cz]);
  box([0.64, 0.012, 0.38], C.woodDk, [cx, 0.396, cz]);
  // iron straps and posts
  for (const sx of [-1, 1]) {
    box([0.06, 0.3, 0.47], C.iron, [cx + sx * 0.2, 0.24, cz]);
    box([0.06, 0.06, 0.47], C.ironDk, [cx + sx * 0.2, 0.42, cz]);
    for (const y of [0.13, 0.35]) {
      box([0.02, 0.02, 0.012], C.ironHi, [cx + sx * 0.2, y, cz + 0.239]);
      box([0.02, 0.02, 0.012], C.ironHi, [cx + sx * 0.2, y, cz - 0.239]);
    }
    for (const sz of [-1, 1]) box([0.05, 0.3, 0.05], C.iron, [cx + sx * 0.35, 0.24, cz + sz * 0.215]);
  }
  box([0.11, 0.12, 0.016], C.white, [cx, 0.3, cz + 0.238], { texture: KEYHOLE });
  // lid
  b.part(tileBox([0.74, 0.09, 0.5], PLANKS, TEXEL), C.white, { bone: lid, at: [cx, 0.495, cz], texture: PLANKS });
  b.part(tileBox([0.74, 0.07, 0.39], PLANKS, TEXEL), C.white, { bone: lid, at: [cx, 0.575, cz], texture: PLANKS });
  b.part(tileBox([0.74, 0.04, 0.29], PLANKS, TEXEL), C.white, { bone: lid, at: [cx, 0.63, cz], texture: PLANKS });
  for (const sx of [-1, 1]) {
    lidBox([0.07, 0.1, 0.51], C.iron, [cx + sx * 0.2, 0.495, cz]);
    lidBox([0.07, 0.08, 0.4], C.iron, [cx + sx * 0.2, 0.575, cz]);
    lidBox([0.07, 0.05, 0.3], C.iron, [cx + sx * 0.2, 0.63, cz]);
    lidBox([0.02, 0.02, 0.012], C.ironHi, [cx + sx * 0.2, 0.5, cz + 0.256]);
  }
  lidBox([0.07, 0.1, 0.02], C.ironDk, [cx, 0.5, cz + 0.255]);
  lidBox([0.03, 0.03, 0.012], C.gold, [cx, 0.49, cz + 0.267]);
  lidBox([0.76, 0.03, 0.02], C.iron, [cx, 0.445, cz + 0.25]);

  // coins in the chest
  const coinGeo = (x: number, y: number, z: number, tx: number, tz: number, yaw: number) => {
    const g = new THREE.CylinderGeometry(0.028, 0.028, 0.007, 8);
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(tx, yaw, tz)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    return g;
  };
  const goldSets: THREE.BufferGeometry[][] = [[], [], []];
  for (let k = 0; k < 70; k++) {
    const x = (R() * 2 - 1) * 0.3;
    const z = (R() * 2 - 1) * 0.16;
    const pile = 0.075 * Math.max(0, 1 - (x / 0.32) ** 2) * Math.max(0, 1 - (z / 0.17) ** 2);
    goldSets[k % 3].push(coinGeo(cx + x, 0.4 + pile + R() * 0.015, cz + z, (R() - 0.5) * 0.7, (R() - 0.5) * 0.7, R() * 3));
  }
  for (let k = 0; k < 16; k++) {
    const a = R() * 6.28;
    const d = 0.3 + R() * 0.28;
    goldSets[k % 3].push(coinGeo(cx + Math.cos(a) * d * 0.9, 0.0665, cz + 0.4 + Math.abs(Math.sin(a)) * d * 0.5, (R() - 0.5) * 0.12, (R() - 0.5) * 0.12, R() * 3));
  }
  [C.gold, C.goldDk, C.goldHi].forEach((col, i) => {
    const merged = mergeGeometries(goldSets[i]);
    if (merged) b.part(merged, col, { bone: root, at: [0, 0, 0] });
  });
  for (const [gx, gz, gc] of [
    [-0.1, 0.02, "#e0324a"],
    [0.12, -0.05, "#2fd0e0"],
    [0.02, 0.09, "#5adf6a"],
  ] as [number, number, string][]) {
    const pile = 0.075 * Math.max(0, 1 - (gx / 0.32) ** 2) * Math.max(0, 1 - (gz / 0.17) ** 2);
    glow(b.part(new THREE.OctahedronGeometry(0.024, 0), gc, { bone: root, at: [cx + gx, 0.43 + pile, cz + gz], rotation: [R() * 40, R() * 90, R() * 40], flat: true }), 0.7);
  }
  for (const [gx, gz, gc] of [
    [-0.56, 0.52, "#e0324a"],
    [-0.35, 0.58, "#2fd0e0"],
  ] as [number, number, string][])
    glow(b.part(new THREE.OctahedronGeometry(0.02, 0), gc, { bone: root, at: [gx, 0.083, gz - 0.55 + 0.35], rotation: [R() * 40, R() * 90, 0], flat: true }), 0.7);
  // goblet on the pile
  b.lathe(
    [
      [0, 0],
      [0.028, 0],
      [0.028, 0.006],
      [0.01, 0.014],
      [0.01, 0.04],
      [0.036, 0.075],
      [0, 0.075],
    ],
    { at: [cx - 0.13, 0.46, cz - 0.04], segments: 8, color: C.gold, bone: root },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Barrels
  const barrel = (at: P, axis: P, mark: THREE.Texture) => {
    const body = b.lathe(BARREL_OUTLINE, { at, axis, segments: 12, color: BARREL, bone: root, name: "barrel" });
    const ax = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
    for (const y of [-0.235, -0.1, 0.1, 0.235]) {
      const r = barrelR(y) * 1.045 + 0.003;
      b.part(new THREE.CylinderGeometry(r, r, 0.034, 12), C.iron, {
        bone: root,
        at: [at[0] + ax.x * y, at[1] + ax.y * y, at[2] + ax.z * y],
        dir: axis,
      });
    }
    b.decal(body, mark, { at: [at[0], at[1], at[2] + 0.25], dir: [0, 0, 1], size: [0.13, 0.13], bone: root });
    return body;
  };
  // A: upright with candle
  barrel([0.7, 0.33, -0.68], [0, 1, 0], MARK_X);
  b.rod([0.74, 0.6, -0.65], [0.74, 0.69, -0.65], 0.02, C.wax, { bone: root, sides: 6 });
  box([0.07, 0.012, 0.06], C.wax, [0.74, 0.603, -0.65]);
  box([0.008, 0.02, 0.008], C.char, [0.74, 0.7, -0.65]);
  flame(0.74, 0.705, -0.65, 0.3);
  box([0.012, 0.04, 0.012], C.wax, [0.758, 0.665, -0.632]);
  // B: wine barrel with tap
  barrel([1.03, 0.33, -0.38], [0, 1, 0], MARK_FLASK);
  b.rod([1.03, 0.16, -0.19], [1.03, 0.16, -0.11], 0.016, C.iron, { bone: root, sides: 6 });
  b.rod([1.03, 0.16, -0.11], [1.03, 0.115, -0.11], 0.014, C.ironHi, { bone: root, sides: 6 });
  box([0.05, 0.01, 0.02], C.iron, [1.03, 0.19, -0.16]);
  box([0.16, 0.004, 0.12], C.wine, [1.03, 0.066, -0.06], { rotation: [0, 15, 0] });
  box([0.08, 0.005, 0.06], C.wineHi, [1.03, 0.068, -0.07], { rotation: [0, 15, 0] });
  // C: fallen barrel
  barrel([0.82, 0.28, 0.5], [1, 0, 0.3], MARK_SKULL);
  box([0.2, 0.012, 0.03], C.wood, [0.55, 0.066, 0.82], { rotation: [0, 25, 0] });
  box([0.16, 0.012, 0.03], C.woodDk, [1.1, 0.066, 0.85], { rotation: [0, -40, 0] });
  box([0.1, 0.012, 0.03], C.woodHi, [0.7, 0.066, 0.9], { rotation: [0, 70, 0] });

  // -------------------------------------------------------------------------------------------------------------
  // Spike trap
  const TX = 0.05;
  const TZ = 0.5;
  for (const s of [-1, 1]) {
    b.part(tileBox([0.78, 0.03, 0.07], STONES[0], TEXEL), C.white, { bone: root, at: [TX, 0.075, TZ + s * 0.355], texture: STONES[0] });
    b.part(tileBox([0.07, 0.03, 0.64], STONES[1], TEXEL), C.white, { bone: root, at: [TX + s * 0.355, 0.075, TZ], texture: STONES[1] });
  }
  box([0.64, 0.008, 0.64], C.pit, [TX, 0.066, TZ]);
  const spikeSkull: [number, number] = [3, 1];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const x = TX - 0.225 + i * 0.15;
      const z = TZ - 0.225 + j * 0.15;
      const tall = i === spikeSkull[0] && j === spikeSkull[1];
      const h = tall ? 0.26 : 0.05 + 0.17 * R();
      const y0 = 0.078;
      box([0.07, 0.016, 0.07], C.ironDk, [x, 0.078, z]);
      const paintSpike = cellPaint(0.01, (c) => {
        const f = (c.at.y - y0) / h;
        if (f > 0.72 && c.random(3) < 0.9) return c.pick(BLOOD, 0.4 + 0.6 * c.random(4));
        return c.pick(STEEL, 0.5 + 0.25 * c.n.z + 0.2 * c.n.x + 0.15 * c.random(1));
      });
      b.part(new THREE.ConeGeometry(0.032, h, 4), paintSpike, { bone: root, at: [x, y0 + h / 2, z], rotation: [0, 45, 0] });
    }
  for (let k = 0; k < 8; k++)
    box([0.03 + 0.05 * R(), 0.004, 0.03 + 0.05 * R()], k % 2 ? C.blood : C.bloodHi, [TX - 0.28 + R() * 0.56, 0.0705, TZ - 0.28 + R() * 0.56], {
      rotation: [0, R() * 90, 0],
    });
  box([0.1, 0.004, 0.06], C.blood, [TX + 0.1, 0.066, TZ + 0.44], { rotation: [0, 20, 0] });

  // -------------------------------------------------------------------------------------------------------------
  // Skulls and bones
  const skull = (x: number, fy: number, z: number, yaw: number, extra: P = [0, 0, 0]) => {
    const jawOff = new THREE.Vector3(0, -0.0625, 0.0125).applyAxisAngle(new THREE.Vector3(0, 1, 0), (yaw * Math.PI) / 180);
    b.part(skinBox(SKULL_SHEET, BONE_SHEET_LAYOUT.faces.cran, 0.0125), C.white, {
      bone: root,
      at: [x, fy + 0.08125, z],
      rotation: [extra[0], yaw, extra[2]],
      texture: SKULL_SHEET,
    });
    b.part(skinBox(SKULL_SHEET, BONE_SHEET_LAYOUT.faces.jaw, 0.0125), C.white, {
      bone: root,
      at: [x + jawOff.x, fy + 0.08125 + jawOff.y, z + jawOff.z],
      rotation: [extra[0], yaw, extra[2]],
      texture: SKULL_SHEET,
    });
  };
  skull(TX + 0.15, 0.078 + 0.2 - 0.08125, TZ - 0.075, 160);
  skull(-1.0, 0.098, 0.95, 20);

  const longBone = (a: P, c: P, color: string, r = 0.011) => {
    b.rod(a, c, r, color, { bone: root, sides: 6 });
    const dx = c[0] - a[0];
    const dz = c[2] - a[2];
    const len = Math.hypot(dx, dz) || 1;
    const px = (-dz / len) * 0.011;
    const pz = (dx / len) * 0.011;
    for (const e of [a, c])
      for (const s of [-1, 1]) box([0.024, 0.024, 0.024], color, [e[0] + px * s, e[1], e[2] + pz * s], { rotation: [0, R() * 90, 0] });
  };
  longBone([-1.05, 0.078, 0.9], [-0.82, 0.078, 1.0], C.bone);
  longBone([-1.05, 0.094, 1.0], [-0.84, 0.094, 0.88], C.boneDk);
  longBone([-0.62, 0.078, 0.8], [-0.4, 0.078, 0.62], C.bone);
  longBone([-0.5, 0.078, 0.95], [-0.36, 0.078, 0.86], C.boneDk, 0.009);
  longBone([-1.2, 0.078, 0.42], [-1.0, 0.078, 0.3], C.bone, 0.009);

  // ribcage lying half-buried
  const loc = (ox: number, oz: number, yaw: number) => (lx: number, ly: number, lz: number): P => {
    const c = Math.cos((yaw * Math.PI) / 180);
    const s = Math.sin((yaw * Math.PI) / 180);
    return [ox + lx * c + lz * s, ly, oz - lx * s + lz * c];
  };
  const rc = loc(-0.82, 0.62, 20);
  for (let i = 0; i < 6; i++) {
    const sc = 1 - (0.14 * Math.abs(i - 2.5)) / 2.5;
    const pts: P[] = [];
    for (let k = 0; k <= 6; k++) {
      const a = (k / 6) * Math.PI;
      pts.push(rc(0.1 * sc * Math.cos(a), 0.06 + 0.085 * sc * Math.sin(a), -0.1 + i * 0.04));
    }
    b.sweep(pts, 0.0075, i % 2 ? C.boneDk : C.bone, { bone: root, sides: 5 });
  }
  b.rod(rc(0, 0.068, -0.13), rc(0, 0.068, 0.15), 0.011, C.bone, { bone: root, sides: 6 });
  for (let k = 0; k < 7; k++) box([0.028, 0.02, 0.028], k % 2 ? C.bone : C.boneDk, [-1.15 + R() * 0.9, 0.07, 0.35 + R() * 0.2], { rotation: [0, R() * 90, 0] });
  for (let k = 0; k < 5; k++) {
    const x = -0.55 + R() * 0.12;
    const z = 0.9 + R() * 0.12;
    b.rod([x, 0.07, z], [x + 0.03 + R() * 0.03, 0.07, z + 0.02 + R() * 0.03], 0.005, C.boneHi, { bone: root, sides: 5 });
  }

  b.pose(lid, { axis: [1, 0, 0], deg: -25 });
  return b.root;
}
