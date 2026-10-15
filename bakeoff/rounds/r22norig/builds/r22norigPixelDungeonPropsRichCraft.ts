import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { bezier } from "../../../../src/path";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, stepped, tileBox } from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "A dungeon corner in chunky pixel art: ruined brick wall with barred window, torch, shackles and poster; barrels, stacked crates, an open treasure chest spilling gold, a burning brazier, a skull pile with a candle, a sword in the flagstones, potions, a sack and a bucket.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.02;
const FL = 0.08; // flagstone top
const D = Math.PI / 180;

// ---------- palette ----------
const STONE = ["#1c1e26", "#2e313b", "#444854", "#5d6270", "#7a8090"];
const WOODR = ["#24130a", "#3f2310", "#5c3519", "#7b4c26", "#9a6535"];
const GOLDR = ["#7a4e0c", "#b07a14", "#e0a820", "#f6cf48", "#fff0a0"];
const SACKR = ["#4a3a22", "#6b5532", "#8c7344", "#aa9058"];
const STEELR = ["#4a525e", "#6c7683", "#8f9aa8", "#bcc6d2"];
const IRONR = ["#15171d", "#272a33", "#3a3e49", "#565c69"];
const IRON = "#2f333c";
const IRONL = "#5b6270";
const BRASS = "#c99a2e";
const DARK = "#0c0b10";
const BONE = "#e0d6b4";
const BONED = "#b3a67d";
const WAX = "#e8dcc0";
const MOSS = "#4a7a2a";
const MOSSD = "#2f5a22";
const WOODDK = "#4a2a14";
const NAIL = "#aab0bb";
const GOLDS = ["#f2c230", "#c8921a", "#ffe27a"];
const RUBBLE = ["#4b4f5b", "#5d6270", "#3a3d48"];

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- pixel textures ----------
const WALL = pixelTexture(64, 96, (g) => {
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    const ox = (row % 2) * 8;
    const lx = (x + ox) % 16;
    if (y % 8 === 0 || lx === 0) return STONE[0];
    const brick = Math.floor((x + ox) / 16) + row * 7;
    let v = 0.35 + 0.3 * hash(brick) + 0.12 * (hash(x * 3 + y * 17) - 0.5);
    if (y % 8 === 1) v += 0.18;
    if (lx === 1) v += 0.08;
    if (y % 8 === 7) v -= 0.15;
    return pick(STONE, v, bayer(x, y));
  });
  for (let i = 0; i < 14; i++) g.set(Math.floor(hash(i) * 64), Math.floor(hash(i + 50) * 96), MOSSD);
  for (let i = 0; i < 8; i++) g.set(Math.floor(hash(i + 90) * 64), Math.floor(hash(i + 20) * 96), MOSS);
});

const FLAGS = pixelTexture(40, 40, (g) => {
  g.fill((x, y) => {
    if (x < 1 || y < 1) return STONE[0];
    let v = 0.4 + 0.25 * hash(Math.floor(x / 4) + Math.floor(y / 4) * 11) + 0.12 * (hash(x + y * 40) - 0.5);
    if (x === 1 || y === 1) v += 0.2;
    if (x > 37 || y > 37) v -= 0.12;
    return pick(STONE, v, bayer(x, y));
  });
  let cx = 8;
  for (let y = 6; y < 30; y++) {
    cx += hash(y * 3) > 0.6 ? 1 : 0;
    g.set(cx, y, STONE[0]);
  }
  for (let i = 0; i < 6; i++) g.set(Math.floor(hash(i + 7) * 40), Math.floor(hash(i + 70) * 40), MOSSD);
});

const PLANK = pixelTexture(32, 30, (g) => {
  g.fill((x, y) => {
    const p = Math.floor(y / 6);
    const ly = y % 6;
    if (ly === 0) return WOODR[0];
    let v = 0.35 + 0.35 * hash(p * 3.3) + 0.1 * Math.sin((x + p * 9) * 0.9);
    if (ly === 1) v += 0.15;
    if (ly === 5) v -= 0.1;
    if ((x * 5 + p * 13) % 23 === 0) v -= 0.2;
    return pick(WOODR, v, bayer(x, y));
  });
  for (let p = 0; p < 5; p++) {
    g.set(2, p * 6 + 3, NAIL);
    g.set(29, p * 6 + 3, NAIL);
  }
});

const POSTER = pixelArt(
  [
    "oooooooooo",
    "oppdddddpo",
    "oppppppppo",
    "opppdddppo",
    "oppdpdpdpo",
    "oppdddddpo",
    "oppdpppdpo",
    "oppppdpppo",
    "oppppppppo",
    "opddddddpo",
    "oppppppppo",
    "opprrrrppo",
    "oppppppppo",
    "oooooooooo",
  ],
  { o: "#6b5430", p: "#d9c48a", d: "#4a3a22", r: "#a83228" },
);

const WEB = pixelTexture(12, 12, (g) => {
  g.fill((x, y) => {
    const dx = 11 - x;
    const dy = 11 - y;
    const d = Math.hypot(dx, dy);
    if (d > 11.5 || d < 0.5) return "";
    const a = Math.atan2(dy, dx);
    const ray = Math.abs(((a + 0.001) % (Math.PI / 8)) - 0) < 0.13 || Math.abs((a % (Math.PI / 8)) - Math.PI / 8) < 0.13;
    const arc = [4, 7.5, 11].some((r) => Math.abs(d - r) < 0.55);
    return ray || arc ? "#cfd2d8" : "";
  });
});

// ---------- paints ----------
const WOODP = cellPaint(
  0.02,
  (c) => {
    const key = c.n.y > 0.7 ? c.u : Math.floor(c.s[1] / 30);
    const v = 0.3 + 0.4 * hash(key * 1.7) + 0.15 * (c.random(1) - 0.5) + 0.1 * c.n.y;
    return c.pick(WOODR, v);
  },
  { dither: true },
);
const GOLDP = cellPaint(0.015, (c) => c.pick(GOLDR, 0.45 + 0.4 * c.random(2) + 0.2 * c.n.y), { dither: true });
const IRONP = cellPaint(0.015, (c) => c.pick(IRONR, 0.35 + 0.35 * c.random(4) + 0.2 * c.n.y), { dither: true });
const SACKP = cellPaint(
  0.02,
  (c) => c.pick(SACKR, 0.4 + 0.3 * c.random(1) + 0.1 * (c.v % 2) + 0.2 * c.n.y),
  { dither: true },
);
const STEELP = cellPaint(0.01, (c) => (c.random(3) < 0.14 ? "#8a4a22" : c.pick(STEELR, 0.55 + 0.3 * c.n.x + 0.1 * c.random(5))));

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const R = rng(7);

  // ---------- helpers ----------
  const qOf = (yaw: number, e: [number, number, number] = [0, 0, 0]) =>
    new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(0, yaw * D, 0))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0] * D, e[1] * D, e[2] * D)));

  const bx = (size: [number, number, number], color: string, at: number[], yaw = 0, e: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, quat: qOf(yaw, e) });

  const tb = (
    size: [number, number, number],
    tile: THREE.Texture,
    at: number[],
    yaw = 0,
    step?: [number, number],
    e: [number, number, number] = [0, 0, 0],
  ) =>
    b.part(tileBox(size, tile, TEXEL, step ? { rand: R, step } : { rand: R }), "#ffffff", {
      texture: tile,
      at,
      quat: qOf(yaw, e),
    });

  const T = (cx: number, cz: number, yaw: number) => {
    const c = Math.cos(yaw * D);
    const s = Math.sin(yaw * D);
    return (x: number, y: number, z: number) => [cx + x * c + z * s, y, cz - x * s + z * c];
  };

  const OUT: [number, number][] = [
    [0, 2],
    [0, 4],
    [0, 7],
    [0, 5],
    [0, 3],
  ];
  const IN: [number, number][] = [
    [0, 1],
    [0, 3],
    [0, 4],
    [0, 3],
    [0, 1],
  ];
  const flame = (x: number, y: number, z: number, cell: number) => {
    for (const dir of [
      [1, 0, 0],
      [0, 0, 1],
    ]) {
      glow(b.extrude(stepped(OUT, cell, { start: -2.5 }), { at: [x, y, z], x: dir, thickness: cell, color: "#ff7a1a" }), 1.4);
      glow(b.extrude(stepped(IN, cell, { start: -2.5 }), { at: [x, y, z], x: dir, thickness: cell * 1.4, color: "#ffd84a" }), 1.6);
    }
  };

  // ---------- floor ----------
  bx([2.8, 0.05, 2.4], "#14151b", [0, 0.025, 0]);
  for (let xi = 0; xi < 4; xi++)
    for (let zi = 0; zi < 3; zi++) tb([0.68, 0.08, 0.78], FLAGS, [-1.05 + xi * 0.7, 0.04, -0.8 + zi * 0.8]);

  // ---------- wall ----------
  const wallSec = (x0: number, x1: number, h: number) =>
    tb([x1 - x0, h, 0.22], WALL, [(x0 + x1) / 2, FL + h / 2, -1.05], 0, [16, 8]);
  wallSec(-1.4, -0.5, 1.7);
  wallSec(-0.5, 0.5, 1.05);
  wallSec(0.5, 1.4, 1.5);
  [-0.38, -0.1, 0.2, 0.42].forEach((x, i) =>
    tb([0.22 + (i % 2) * 0.04, 0.08 + 0.05 * (i % 3), 0.22], WALL, [x, FL + 1.05 + 0.05 + 0.02 * (i % 3), -1.05], (i - 1) * 4),
  );
  // moss along wall foot
  for (let i = 0; i < 8; i++) {
    const w = 0.1 + R() * 0.2;
    bx([w, 0.05 + R() * 0.06, 0.03], i % 2 ? MOSS : MOSSD, [-1.3 + i * 0.37, FL + 0.035, -0.935]);
  }
  // barred window on the tall left section
  bx([0.34, 0.46, 0.03], "#07070b", [-0.95, FL + 1.05, -0.935]);
  bx([0.42, 0.04, 0.06], IRON, [-0.95, FL + 1.3, -0.925]);
  bx([0.42, 0.04, 0.06], IRON, [-0.95, FL + 0.8, -0.925]);
  for (const x of [-1.15, -0.75]) bx([0.04, 0.5, 0.06], IRON, [x, FL + 1.05, -0.925]);
  for (let i = 0; i < 4; i++) bx([0.02, 0.46, 0.02], IRONL, [-1.07 + i * 0.08, FL + 1.05, -0.915]);
  bx([0.48, 0.05, 0.1], "#6a6f7c", [-0.95, FL + 0.76, -0.9]);
  // torch on the right section
  bx([0.04, 0.04, 0.14], IRON, [0.95, FL + 0.95, -0.87]);
  bx([0.09, 0.05, 0.09], IRON, [0.95, FL + 1.0, -0.8]);
  bx([0.05, 0.3, 0.05], WOODDK, [0.95, FL + 1.13, -0.8]);
  bx([0.07, 0.07, 0.07], "#d8cdb0", [0.95, FL + 1.3, -0.8], 20);
  flame(0.95, FL + 1.33, -0.8, 0.02);
  bx([0.22, 0.28, 0.01], "#23252d", [0.95, FL + 1.38, -0.936]);
  // shackles on the low wall
  for (const x of [-0.3, -0.1]) {
    bx([0.06, 0.06, 0.03], IRON, [x, FL + 0.95, -0.935]);
    for (let i = 0; i < 6; i++) bx([0.025, 0.05, 0.012], IRONL, [x, FL + 0.88 - i * 0.045, -0.92], i % 2 ? 90 : 0);
    bx([0.08, 0.05, 0.05], IRON, [x, FL + 0.6, -0.915]);
    bx([0.04, 0.03, 0.052], DARK, [x, FL + 0.6, -0.915]);
  }
  // poster
  b.part(new THREE.PlaneGeometry(0.2, 0.28), "#ffffff", {
    texture: POSTER,
    at: [0.28, FL + 0.72, -0.93],
    dir: [0, 0, 1],
    axis: "z",
  });
  for (const x of [0.2, 0.36]) bx([0.012, 0.012, 0.01], NAIL, [x, FL + 0.87, -0.93]);
  // cobweb in the corner above the low section
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    texture: WEB,
    at: [-0.7, FL + 1.25, -0.93],
    dir: [0, 0, 1],
    axis: "z",
  });

  // ---------- barrels ----------
  const PR: [number, number][] = [
    [0.2, 0],
    [0.24, 0.12],
    [0.27, 0.4],
    [0.24, 0.68],
    [0.2, 0.8],
  ];
  const barrel = (x: number, z: number, h: number) => {
    const rad = (y: number) => {
      const yy = y / h;
      for (let i = 0; i < PR.length - 1; i++) {
        const [r0, y0] = PR[i];
        const [r1, y1] = PR[i + 1];
        if (yy <= y1) return r0 + ((r1 - r0) * (yy - y0)) / (y1 - y0);
      }
      return 0.2;
    };
    const outline: [number, number][] = [[0, 0], ...PR.map(([r, y]) => [r, y * h] as [number, number]), [0.18, 0.78 * h], [0, 0.78 * h]];
    b.lathe(outline, { at: [x, FL, z], color: WOODP, segments: 10 });
    for (const yy of [0.08, 0.22, 0.58, 0.72]) {
      const y = yy * h;
      const r = rad(y) + 0.012;
      b.lathe(
        [
          [r - 0.03, y - 0.014],
          [r, y - 0.014],
          [r, y + 0.014],
          [r - 0.03, y + 0.014],
        ],
        { at: [x, FL, z], color: IRONP, segments: 10 },
      );
    }
  };
  barrel(1.05, -0.65, 1);
  barrel(0.6, -0.72, 0.7);
  barrel(1.1, -0.15, 0.85);

  // ---------- crates ----------
  const crate = (x: number, z: number, s: number, yaw: number, y0: number) => {
    const P = T(x, z, yaw);
    tb([s, s, s], PLANK, P(0, y0 + s / 2, 0), yaw, [1, 6]);
    const o = s / 2 - 0.015;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) bx([0.05, s + 0.01, 0.05], WOODDK, P(sx * o, y0 + s / 2, sz * o), yaw);
    for (const sy of [0.02, s - 0.02]) {
      bx([s + 0.01, 0.04, s + 0.01], WOODDK, P(0, y0 + sy, 0), yaw);
    }
    for (const sz of [-1, 1]) {
      bx([s * 1.1, 0.04, 0.012], "#6b4020", P(0, y0 + s / 2, sz * (s / 2 + 0.004)), yaw, [0, 0, 38 * sz]);
      for (const sx of [-0.4, 0.4]) bx([0.014, 0.014, 0.01], NAIL, P(sx * s, y0 + s * 0.5 + sx * s * 0.78 * sz, sz * (s / 2 + 0.01)), yaw);
    }
  };
  crate(-1.0, -0.7, 0.46, 8, FL);
  crate(-1.0, -0.7, 0.34, 30, FL + 0.46);
  crate(-0.52, -0.75, 0.36, -10, FL);
  crate(-0.95, -0.15, 0.3, 25, FL);

  // ---------- chest ----------
  const cx = 0.45;
  const cz = 0.3;
  tb([0.56, 0.3, 0.34], PLANK, [cx, FL + 0.15, cz], 0, [1, 6]);
  bx([0.5, 0.01, 0.28], "#1a1008", [cx, FL + 0.302, cz]);
  bx([0.56, 0.02, 0.03], "#5c3519", [cx, FL + 0.31, cz + 0.155]);
  bx([0.56, 0.02, 0.03], "#5c3519", [cx, FL + 0.31, cz - 0.155]);
  bx([0.03, 0.02, 0.34], "#5c3519", [cx + 0.265, FL + 0.31, cz]);
  bx([0.03, 0.02, 0.34], "#5c3519", [cx - 0.265, FL + 0.31, cz]);
  b.part(new THREE.SphereGeometry(0.2, 8, 5), GOLDP, { at: [cx, FL + 0.31, cz], scale: [1.2, 0.4, 0.75] });
  for (const x of [-0.17, 0.17]) {
    bx([0.04, 0.31, 0.36], IRON, [cx + x, FL + 0.15, cz]);
    for (const y of [0.06, 0.24]) bx([0.016, 0.016, 0.01], BRASS, [cx + x, FL + y, cz + 0.186]);
  }
  bx([0.07, 0.09, 0.012], BRASS, [cx, FL + 0.24, cz + 0.176]);
  bx([0.012, 0.03, 0.004], DARK, [cx, FL + 0.235, cz + 0.183]);
  for (const sx of [-1, 1])
    for (const y of [0.04, 0.26]) bx([0.05, 0.05, 0.012], BRASS, [cx + sx * 0.26, FL + y, cz + 0.176]);
  for (const sx of [-1, 1]) bx([0.03, 0.04, 0.04], IRON, [cx + sx * 0.2, FL + 0.31, cz - 0.18]);
  const lidAt = [cx, FL + 0.46, cz - 0.228];
  tb([0.56, 0.05, 0.34], PLANK, lidAt, 0, [1, 6], [-110, 0, 0]);
  for (const x of [-0.17, 0.17]) bx([0.04, 0.07, 0.36], IRON, [cx + x, lidAt[1], lidAt[2]], 0, [-110, 0, 0]);
  const gem = (c: string, x: number, y: number, z: number) =>
    glow(b.part(new THREE.OctahedronGeometry(0.025), c, { at: [cx + x, FL + y, cz + z] }), 0.6);
  gem("#e0284a", -0.08, 0.37, 0.05);
  gem("#3ad07a", 0.1, 0.36, 0.0);
  gem("#4a8aff", 0.03, 0.385, -0.05);
  for (let i = 0; i < 5; i++)
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), GOLDS[i % 3], {
      at: [cx - 0.15 + i * 0.07, FL + 0.37 + (i % 2) * 0.012, cz + 0.06 - (i % 3) * 0.05],
      rotation: [20 - i * 8, 0, 15 - i * 9],
    });
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const d = 0.3 + R() * 0.25;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), GOLDS[i % 3], {
      at: [cx + Math.cos(a) * d * 0.9, FL + 0.004, cz + 0.28 + Math.abs(Math.sin(a)) * d * 0.7],
      rotation: [0, R() * 90, 0],
    });
  }

  // ---------- brazier ----------
  const bxp = -0.7;
  const bzp = 0.5;
  for (const a of [0, 120, 240]) {
    const sx = Math.sin(a * D);
    const sz = Math.cos(a * D);
    b.rod([bxp + sx * 0.2, FL + 0.5, bzp + sz * 0.2], [bxp + sx * 0.3, FL + 0.01, bzp + sz * 0.3], 0.02, IRON, { sides: 4 });
  }
  b.lathe(
    [
      [0.24, 0.19],
      [0.28, 0.19],
      [0.28, 0.22],
      [0.24, 0.22],
    ],
    { at: [bxp, FL, bzp], color: IRONL, segments: 12 },
  );
  b.lathe(
    [
      [0, 0.5],
      [0.12, 0.48],
      [0.22, 0.54],
      [0.28, 0.64],
      [0.26, 0.66],
      [0, 0.66],
    ],
    { at: [bxp, FL, bzp], color: IRONP, segments: 12 },
  );
  b.lathe(
    [
      [0.25, 0.63],
      [0.3, 0.63],
      [0.3, 0.68],
      [0.25, 0.68],
    ],
    { at: [bxp, FL, bzp], color: IRONL, segments: 12 },
  );
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2;
    const d = R() * 0.17;
    const hot = i % 3 !== 0;
    const c = bx(
      [0.06, 0.05, 0.06],
      hot ? "#d8501c" : "#3a1a12",
      [bxp + Math.cos(a) * d, FL + 0.69, bzp + Math.sin(a) * d],
      R() * 90,
    );
    if (hot) glow(c, 0.9);
  }
  flame(bxp, FL + 0.7, bzp, 0.03);
  for (let i = 0; i < 4; i++)
    glow(bx([0.012, 0.012, 0.012], "#ffd84a", [bxp - 0.12 + i * 0.08, FL + 1.0 + (i % 2) * 0.12, bzp + (i - 1.5) * 0.04]), 1.5);

  // ---------- skull pile ----------
  const skull = (x: number, y: number, z: number, yaw: number, s: number) => {
    const P = T(x, z, yaw);
    b.part(new THREE.SphereGeometry(0.07 * s, 7, 5), BONE, { at: P(0, y + 0.07 * s, 0), scale: [1, 0.95, 1.1], quat: qOf(yaw) });
    for (const sx of [-1, 1]) bx([0.03 * s, 0.03 * s, 0.02 * s], DARK, P(sx * 0.03 * s, y + 0.08 * s, 0.07 * s), yaw);
    bx([0.015 * s, 0.025 * s, 0.02 * s], DARK, P(0, y + 0.055 * s, 0.078 * s), yaw);
    bx([0.07 * s, 0.03 * s, 0.07 * s], BONED, P(0, y + 0.02 * s, 0.025 * s), yaw);
    bx([0.06 * s, 0.012 * s, 0.01 * s], BONE, P(0, y + 0.028 * s, 0.062 * s), yaw);
    bx([0.05 * s, 0.01 * s, 0.01 * s], BONED, P(0, y + 0.018 * s, 0.062 * s), yaw);
  };
  skull(-0.02, FL, 0.85, 20, 1);
  skull(0.17, FL, 0.8, -30, 1);
  skull(0.07, FL + 0.11, 0.84, 160, 0.95);
  b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.1, 6), WAX, { at: [0.07, FL + 0.29, 0.84] });
  bx([0.014, 0.04, 0.014], WAX, [0.085, FL + 0.23, 0.855]);
  glow(bx([0.012, 0.03, 0.012], "#ffd84a", [0.07, FL + 0.355, 0.84]), 1.5);
  const bone = (a: number[], c: number[]) => {
    b.rod(a, c, 0.01, BONE, { sides: 6, caps: "flat" });
    for (const p of [a, c]) b.part(new THREE.SphereGeometry(0.015, 5, 4), BONE, { at: p });
  };
  bone([0.3, FL + 0.012, 0.85], [0.45, FL + 0.012, 0.95]);
  bone([-0.2, FL + 0.012, 0.95], [-0.05, FL + 0.012, 1.05]);
  bone([0.35, FL + 0.012, 1.0], [0.5, FL + 0.012, 0.98]);
  bone([-0.3, FL + 0.012, 0.8], [-0.22, FL + 0.012, 0.68]);
  bone([0.05, FL + 0.012, 1.05], [0.2, FL + 0.012, 1.1]);

  // ---------- sword in the floor ----------
  const sxp = 0.95;
  const szp = 0.8;
  b.part(new THREE.BoxGeometry(0.05, 0.75, 0.012), STEELP, { at: [sxp, FL + 0.34, szp], quat: qOf(35) });
  bx([0.012, 0.6, 0.002], "#555d69", [sxp, FL + 0.38, szp], 35);
  bx([0.2, 0.035, 0.045], IRON, [sxp, FL + 0.72, szp], 35);
  for (const sx of [-1, 1]) bx([0.02, 0.05, 0.05], BRASS, [sxp + Math.cos(35 * D) * sx * 0.1, FL + 0.72, szp - Math.sin(35 * D) * sx * 0.1], 35);
  bx([0.035, 0.14, 0.035], WOODDK, [sxp, FL + 0.8, szp], 35);
  for (let i = 0; i < 3; i++) bx([0.04, 0.012, 0.04], IRON, [sxp, FL + 0.76 + i * 0.04, szp], 35);
  bx([0.055, 0.05, 0.055], BRASS, [sxp, FL + 0.9, szp], 35);

  // ---------- bucket ----------
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.13, 0.22],
      [0.115, 0.22],
      [0.085, 0.02],
      [0, 0.02],
    ],
    { at: [0.15, FL, -0.5], color: WOODP, segments: 8 },
  );
  b.lathe(
    [
      [0.1, 0.14],
      [0.13, 0.14],
      [0.13, 0.17],
      [0.1, 0.17],
    ],
    { at: [0.15, FL, -0.5], color: IRON, segments: 8 },
  );
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.005, 8), "#2d6f9c", { at: [0.15, FL + 0.17, -0.5] });
  b.sweep(
    bezier([0.15 - 0.125, FL + 0.22, -0.5], [0.15, FL + 0.46, -0.5], [0.15 + 0.125, FL + 0.22, -0.5]),
    0.006,
    IRON,
    { sides: 4 },
  );

  // ---------- sack ----------
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.17, 0.1],
      [0.15, 0.22],
      [0.09, 0.28],
      [0.11, 0.34],
      [0.06, 0.37],
      [0, 0.37],
    ],
    { at: [-1.2, FL, 0.2], color: SACKP, segments: 8 },
  );
  b.lathe(
    [
      [0.08, 0.265],
      [0.105, 0.265],
      [0.105, 0.29],
      [0.08, 0.29],
    ],
    { at: [-1.2, FL, 0.2], color: "#c7b27a", segments: 8 },
  );
  for (let i = 0; i < 4; i++)
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), GOLDS[i % 3], {
      at: [-1.0 + i * 0.05, FL + 0.004, 0.42 + (i % 2) * 0.05],
      rotation: [0, i * 30, 0],
    });

  // ---------- potions on the crate ----------
  const potion = (x: number, z: number, c: string) => {
    glow(
      b.lathe(
        [
          [0, 0],
          [0.03, 0],
          [0.035, 0.02],
          [0.035, 0.06],
          [0.015, 0.09],
          [0.015, 0.12],
          [0.02, 0.125],
          [0, 0.125],
        ],
        { at: [x, FL + 0.36, z], color: c, segments: 7 },
      ),
      0.7,
    );
    bx([0.022, 0.025, 0.022], WOODR[3], [x, FL + 0.36 + 0.138, z]);
  };
  potion(-0.62, -0.78, "#d83a4a");
  potion(-0.52, -0.7, "#3ac86a");
  potion(-0.44, -0.8, "#4a8aff");

  // ---------- rubble ----------
  for (let i = 0; i < 9; i++) {
    const h = 0.04 + R() * 0.05;
    bx(
      [0.06 + R() * 0.1, h, 0.06 + R() * 0.08],
      RUBBLE[i % 3],
      [-0.5 + R() * 1.0, FL + h / 2, -0.88 + R() * 0.12],
      R() * 90,
    );
  }

  return b.root;
}
