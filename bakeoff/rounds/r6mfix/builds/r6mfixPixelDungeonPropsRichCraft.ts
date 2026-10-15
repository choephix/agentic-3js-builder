import * as THREE from "three";
import { createBuilder, rng, frame, gradient } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { pixelTexture, pixelArt, tileBox, pick, bayer, cellPaint } from "../../../../kits/pixel";

export const meta = {
  name: "dungeon_props",
  description:
    "Pixel-art dungeon vignette on a flagstone slab: banded treasure chest with glowing loot, two flaming torches, stacked barrels, scattered bones with a skull and ribcage, and a spike trap.",
};

const hsh = (a: number, b: number) => {
  let h = Math.imul(a, 374761393) ^ Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

type V = [number, number, number];

// ---------- palettes ----------
const STONER = ["#2a2a38", "#3e3e52", "#56566c", "#70708a", "#8c8ca4"];
const WOODR = ["#2e1a0e", "#4a2c16", "#6a4222", "#8a5a30"];
const BONER = ["#8a7a5c", "#b8a882", "#e0d4b0", "#f4ecd2"];
const IRONR = ["#23232e", "#3c3f4e", "#5a5f74", "#8a90a8"];
const GOLD = "#ffc83a";
const BLOOD = "#a8232a";

// ---------- textures ----------
const makeFlag = (seed: number) =>
  pixelTexture(32, 32, (g) =>
    g.fill((x, y) => {
      const e = Math.min(x, y, 31 - x, 31 - y);
      if (e === 0) return "#16161f";
      if (e === 1) return x === 1 || y === 1 ? "#8c8ca4" : "#33334a";
      const v = 0.28 + 0.35 * hsh(((x >> 3) + seed * 3) | 0, y >> 3) + 0.2 * hsh(x + seed * 50, y);
      if ((x * 3 + y * 2 + seed * 7) % 41 === 0 && hsh(x >> 2, y >> 3) > 0.55) return "#16161f";
      if (seed === 1 && hsh(x >> 1, y >> 1) > 0.93 && e < 6) return "#4f7a34";
      return pick(STONER, v, bayer(x, y));
    }),
  );
const FLAGS = [makeFlag(0), makeFlag(1)];

const BRICK = pixelTexture(32, 32, (g) =>
  g.fill((x, y) => {
    const row = y >> 3;
    const off = (row % 2) * 8;
    const xx = (x + off) % 32;
    if (y % 8 === 0 || xx % 16 === 0) return "#17171f";
    const v = 0.3 + 0.4 * hsh(Math.floor((x + off) / 16), row) + (y % 8 === 1 ? 0.2 : 0) - (y % 8 === 7 ? 0.1 : 0);
    return pick(STONER, v, bayer(x, y));
  }),
);

const WOODT = pixelTexture(32, 30, (g) =>
  g.fill((x, y) => {
    const row = Math.floor(y / 6);
    const ry = y % 6;
    if (ry === 0) return "#1e1008";
    if (ry === 1) return "#9a6a38";
    if ((x === 1 || x === 30) && ry === 3) return "#9aa0b4";
    const v = 0.3 + 0.35 * hsh(Math.floor((x + row * 7) / 9), row) + 0.15 * hsh(x, y);
    return pick(WOODR, v, bayer(x, y));
  }),
);

const FLAME = pixelArt(
  [
    "....r...",
    "...rr...",
    "...ror..",
    "..roor..",
    "..rooyr.",
    ".rroyyor",
    ".roooyor",
    ".royywor",
    ".royywor",
    ".roywyor",
    "..royyr.",
    "...rrr..",
  ],
  { r: "#d8321a", o: "#ff7a1a", y: "#ffd23a", w: "#fff6c0" },
);

// ---------- paints ----------
const BONEP = cellPaint(0.012, (c) => c.pick(BONER, 0.55 + 0.25 * c.n.y + 0.3 * (c.random(2) - 0.5)), { dither: true });
const WOODP = cellPaint(
  0.02,
  (c) => c.pick(WOODR, 0.35 + 0.22 * c.n.y + 0.12 * ((c.u + c.depth) % 2) + 0.35 * (c.random(3) - 0.5)),
  { dither: true },
);
const IRONP = cellPaint(0.012, (c) => c.pick(IRONR, 0.35 + 0.35 * c.n.y + 0.3 * (c.random(5) - 0.5)), { dither: true });
const STONEP = cellPaint(0.02, (c) => c.pick(STONER, 0.3 + 0.3 * c.n.y + 0.4 * c.random(1)), { dither: true });

export default function build() {
  const b = createBuilder({ name: "dungeon_props" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(3);
  const F = 0.1; // floor top

  const box = (size: V, at: V, color: string | Paint, extra: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, bone: root, ...extra });

  // ---------- floor ----------
  box([2.4, 0.08, 1.6], [0, 0.04, 0], "#0e0e14");
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 4; j++) {
      const tex = FLAGS[(i + j) % 2];
      b.part(tileBox([0.396, 0.1, 0.396], tex, 0.396 / 32), "#ffffff", {
        texture: tex,
        bone: root,
        at: [-1.0 + 0.4 * i, 0.05, -0.6 + 0.4 * j],
      });
    }
  // rubble
  const rubble: [number, number, number][] = [
    [-1.1, -0.72, 0.07],
    [-1.12, 0.7, 0.09],
    [1.1, 0.72, 0.06],
    [0.62, 0.74, 0.05],
    [-0.2, 0.72, 0.06],
    [1.14, 0.1, 0.07],
    [-1.14, 0.1, 0.05],
  ];
  for (const [x, z, s] of rubble)
    box([s, s * 0.7, s * 1.1], [x, F + s * 0.35, z], STONEP, { rotation: [0, R() * 90, 0] });

  // ---------- chest ----------
  const cx = -0.5;
  const cz = -0.2;
  const bodyH = 0.32;
  const wb = (size: V) => tileBox(size, WOODT, 0.0225, { rand: R, step: [1, 6] });
  b.part(wb([0.7, bodyH, 0.45]), "#ffffff", { texture: WOODT, bone: root, at: [cx, F + bodyH / 2, cz] });
  for (const s of [1, -1]) {
    box([0.06, bodyH + 0.005, 0.47], [cx + s * 0.22, F + bodyH / 2, cz], IRONP);
    box([0.05, 0.05, 0.05], [cx + s * 0.34, F + 0.03, cz + 0.22], IRONP);
    box([0.05, 0.05, 0.05], [cx + s * 0.34, F + 0.03, cz - 0.22], IRONP);
  }
  box([0.72, 0.04, 0.47], [cx, F + 0.02, cz], IRONP);
  // lock plate
  box([0.1, 0.12, 0.03], [cx, F + 0.26, cz + 0.235], GOLD);
  box([0.02, 0.045, 0.01], [cx, F + 0.26, cz + 0.255], "#1a1008");
  // loot
  glow(box([0.62, 0.03, 0.37], [cx, F + bodyH + 0.015, cz], "#c8861c"), 0.6);
  glow(box([0.48, 0.04, 0.28], [cx, F + bodyH + 0.04, cz], GOLD), 0.8);
  glow(box([0.32, 0.04, 0.18], [cx - 0.02, F + bodyH + 0.08, cz], "#ffe070"), 0.9);
  glow(box([0.06, 0.06, 0.06], [cx + 0.08, F + bodyH + 0.13, cz], "#e0283c", { rotation: [30, 45, 0] }), 1.4);
  glow(box([0.05, 0.05, 0.05], [cx - 0.12, F + bodyH + 0.12, cz + 0.02], "#38d8e8", { rotation: [20, 30, 15] }), 1.4);
  // lid
  const lid = b.joint("lid", { parent: root, at: [cx, F + bodyH, cz - 0.225], dir: [0, 0, 1], role: "hinge" });
  b.part(wb([0.7, 0.1, 0.45]), "#ffffff", { texture: WOODT, bone: lid, at: [cx, F + bodyH + 0.05, cz] });
  b.part(wb([0.62, 0.07, 0.37]), "#ffffff", { texture: WOODT, bone: lid, at: [cx, F + bodyH + 0.135, cz] });
  for (const s of [1, -1]) {
    box([0.06, 0.105, 0.47], [cx + s * 0.22, F + bodyH + 0.05, cz], IRONP, { bone: lid });
    box([0.06, 0.075, 0.39], [cx + s * 0.22, F + bodyH + 0.135, cz], IRONP, { bone: lid });
  }
  box([0.09, 0.08, 0.02], [cx, F + bodyH + 0.05, cz + 0.235], GOLD, { bone: lid });
  b.pose(lid, { axis: [1, 0, 0], deg: -32 });
  // spilled coins
  const coins: [number, number, number][] = [
    [-0.3, 0.1, 25],
    [-0.38, 0.17, 70],
    [-0.2, 0.16, 10],
    [-0.62, 0.15, 50],
    [-0.5, 0.2, 80],
  ];
  for (const [x, z, a] of coins)
    glow(box([0.06, 0.012, 0.06], [x, F + 0.006, z], GOLD, { rotation: [0, a, 0] }), 0.7);

  // ---------- barrels ----------
  const barrel = (x: number, z: number, y0: number, s: number) => {
    const prof: [number, number][] = [
      [0, 0],
      [0.21 * s, 0],
      [0.25 * s, 0.15 * s],
      [0.27 * s, 0.31 * s],
      [0.25 * s, 0.47 * s],
      [0.21 * s, 0.62 * s],
      [0, 0.62 * s],
    ];
    b.lathe(prof, { at: [x, y0, z], segments: 8, color: WOODP, bone: root });
    for (const [h, r] of [
      [0.1, 0.245],
      [0.31, 0.285],
      [0.52, 0.245],
    ] as const)
      b.part(new THREE.CylinderGeometry(r * s, r * s, 0.05 * s, 8), IRONP, { at: [x, y0 + h * s, z], bone: root });
    b.part(new THREE.CylinderGeometry(0.19 * s, 0.19 * s, 0.02, 8), "#7a4e28", { at: [x, y0 + 0.625 * s, z], bone: root });
    box([0.36 * s, 0.006, 0.025], [x, y0 + 0.637 * s, z], "#2e1a0e");
    box([0.025, 0.006, 0.34 * s], [x + 0.08 * s, y0 + 0.637 * s, z], "#2e1a0e");
  };
  barrel(0.85, -0.5, F, 1);
  barrel(0.3, -0.52, F, 0.9);
  barrel(0.85, -0.5, F + 0.62, 0.8);
  // leaking puddle
  box([0.22, 0.01, 0.16], [0.3, F + 0.005, -0.15], "#3a1a22", { rotation: [0, 20, 0] });

  // ---------- torches ----------
  const torch = (x: number, z: number) => {
    const base = F + 0.14;
    b.part(tileBox([0.24, 0.14, 0.24], BRICK, 0.015), "#ffffff", { texture: BRICK, bone: root, at: [x, F + 0.07, z] });
    box([0.07, 0.72, 0.07], [x, base + 0.36, z], WOODP);
    box([0.1, 0.05, 0.1], [x, base + 0.5, z], IRONP);
    box([0.1, 0.05, 0.1], [x, base + 0.14, z], IRONP);
    box([0.14, 0.04, 0.14], [x, base + 0.73, z], IRONP);
    box([0.11, 0.1, 0.11], [x, base + 0.8, z], "#3a2418");
    glow(box([0.08, 0.05, 0.08], [x, base + 0.86, z], "#ff9a2a"), 1.2);
    const cards = b.cards([frame([x, base + 0.86, z], [0, 1, 0])], FLAME, {
      size: [0.2, 0.3],
      flow: [0, 0, 1],
      cross: true,
      sink: 0,
      bone: root,
    });
    glow(cards, 1.5);
  };
  torch(-1.05, -0.62);
  torch(1.0, 0.52);

  // ---------- spike trap ----------
  const tx = 0.25;
  const tz = 0.4;
  for (const s of [1, -1]) {
    b.part(tileBox([0.64, 0.05, 0.06], BRICK, 0.012), "#ffffff", { texture: BRICK, bone: root, at: [tx, F + 0.025, tz + s * 0.29] });
    b.part(tileBox([0.06, 0.05, 0.52], BRICK, 0.012), "#ffffff", { texture: BRICK, bone: root, at: [tx + s * 0.29, F + 0.025, tz] });
    glow(box([0.04, 0.012, 0.04], [tx + s * 0.29, F + 0.054, tz + 0.29], "#ff3a2a"), 1.2);
    glow(box([0.04, 0.012, 0.04], [tx + s * 0.29, F + 0.054, tz - 0.29], "#ff3a2a"), 1.2);
  }
  box([0.52, 0.03, 0.52], [tx, F + 0.015, tz], "#15151c");
  const spikeP = gradient(IRONP, BLOOD, [0, F + 0.1, 0], [0, F + 0.2, 0]);
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const x = tx + i * 0.15;
      const z = tz + j * 0.15;
      box([0.1, 0.006, 0.1], [x, F + 0.032, z], "#000000");
      const h = 0.14 + 0.1 * R() + (i === 0 && j === 0 ? 0.05 : 0);
      b.spike([x, F + 0.03, z], [0, 1, 0], h, 0.04, { color: spikeP, sides: 4, bone: root });
    }

  // ---------- bones ----------
  const longBone = (a: V, c: V) => {
    b.rod(a, c, 0.02, BONEP, { section: "box", bone: root });
    for (const p of [a, c]) {
      box([0.05, 0.045, 0.05], p, BONEP);
    }
  };
  longBone([-0.98, F + 0.025, 0.22], [-0.62, F + 0.025, 0.36]);
  longBone([-0.95, F + 0.025, 0.62], [-0.6, F + 0.025, 0.28]);
  longBone([0.75, F + 0.025, 0.72], [1.1, F + 0.025, 0.4]);
  // skull
  const sx = -0.8;
  const sz = 0.46;
  box([0.2, 0.17, 0.2], [sx, F + 0.12, sz], BONEP);
  box([0.16, 0.05, 0.12], [sx, F + 0.03, sz + 0.03], BONEP);
  for (const s of [1, -1]) {
    box([0.05, 0.05, 0.02], [sx + s * 0.05, F + 0.14, sz + 0.1], "#0c0a10");
  }
  box([0.025, 0.03, 0.02], [sx, F + 0.09, sz + 0.1], "#0c0a10");
  for (const k of [-1, 0, 1]) box([0.01, 0.045, 0.006], [sx + k * 0.035, F + 0.03, sz + 0.092], "#3a3228");
  box([0.18, 0.012, 0.012], [sx, F + 0.056, sz + 0.092], "#3a3228");
  // ribcage lying flat
  const rx = -0.38;
  const rz = 0.45;
  b.rod([rx, F + 0.03, rz - 0.2], [rx, F + 0.03, rz + 0.22], 0.016, BONEP, { section: "box", bone: root });
  for (let k = 0; k < 5; k++) {
    const z = rz - 0.14 + k * 0.07;
    const w = 1 - Math.abs(k - 2) * 0.12;
    for (const s of [1, -1])
      b.sweep(
        [
          [rx, F + 0.03, z],
          [rx + s * 0.07 * w, F + 0.09, z],
          [rx + s * 0.15 * w, F + 0.08, z],
          [rx + s * 0.2 * w, F + 0.015, z],
        ],
        0.013,
        { color: BONEP, section: "box", bone: root },
      );
  }
  box([0.05, 0.04, 0.05], [rx + 0.0, F + 0.035, rz + 0.24], BONEP);

  return b.root;
}
