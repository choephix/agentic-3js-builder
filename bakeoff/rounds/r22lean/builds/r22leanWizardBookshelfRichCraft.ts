import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { cells, grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall plum-wood wizard's bookshelf with a moon-crowned pediment, gold trim, spell tomes, scrolls, glowing orbs, potions and candles, cel-shaded in high-fantasy anime style.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type Fill = string | Paint;

const GOLD = "#f2c14e";
const GOLD_D = "#b9822a";
const PARCH = "#f3e2b3";
const WAX = "#fff1cf";
const FLAME = "#ffcf5a";
const FLAME_CORE = "#fff6c8";
const RED = "#b8324a";

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const R = rng(7);

  // ---------- palette & paints ----------
  const WOOD = cel(grain("#7a4466", "#693a5a", { size: 0.012, axis: "y", seed: 2 }), "#4a2745");
  const WOOD_H = cel(grain("#8d5278", "#7a4466", { size: 0.012, axis: "x", seed: 5 }), "#573052");
  const BACK = paint((p) => {
    const c = cells(p, 0.11, 3);
    if (c.d1 < 0.007) return GOLD;
    return mottle("#2a1f5e", "#3b2c7a", { size: 0.2, seed: 4 }).at(p, new THREE.Vector3(0, 0, 1));
  });
  const BOOKS = ["#b8324a", "#2f5fb3", "#2f9a72", "#7a3fb0", "#d8782a", "#1f8fa8", "#a02f7a", "#4a4fb8"].map((c) => cel(c));
  const PAGE = cel("#fbefd0", "#e3cfa0");
  const BRASS = cel(GOLD, GOLD_D);
  const URN = cel(mottle("#2f9a9a", "#46bdb0", { size: 0.08, seed: 9 }), "#1f6a78");

  // ---------- textures ----------
  const spineTex = (variant: number) => {
    let body = "";
    if (variant === 0)
      body = `<rect x="1" y="8" width="18" height="4" fill="#f2c14e"/><rect x="1" y="88" width="18" height="4" fill="#f2c14e"/><rect x="8" y="30" width="4" height="40" fill="#f2c14e"/><circle cx="10" cy="50" r="6" fill="none" stroke="#f2c14e" stroke-width="3"/>`;
    else if (variant === 1)
      body = `<rect x="1" y="6" width="18" height="3" fill="#ffe9a8"/><rect x="1" y="13" width="18" height="3" fill="#ffe9a8"/><path d="M10 34 L16 50 L10 66 L4 50 Z" fill="#f2c14e"/><rect x="1" y="84" width="18" height="3" fill="#ffe9a8"/><rect x="1" y="91" width="18" height="3" fill="#ffe9a8"/>`;
    else
      body = `<rect x="1" y="18" width="18" height="4" fill="#f2c14e"/><rect x="1" y="78" width="18" height="4" fill="#f2c14e"/><path d="M5 35 L15 35 M5 45 L15 45 M5 55 L15 55 M5 65 L15 65" stroke="#ffe9a8" stroke-width="3"/>`;
    return svg(`<svg viewBox="0 0 20 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
  };
  const SPINES = [spineTex(0), spineTex(1), spineTex(2)];

  const ORB_TEX = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#6fd8ff"/><circle cx="20" cy="22" r="22" fill="#a9efff"/><circle cx="46" cy="46" r="20" fill="#9b7bff"/><path d="M0 34 Q16 18 32 34 T64 30" stroke="#ffffff" stroke-width="4" fill="none"/><path d="M0 52 Q16 40 32 52 T64 50" stroke="#d6c4ff" stroke-width="4" fill="none"/><circle cx="14" cy="14" r="5" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const RUNES = svg(
    `<svg viewBox="0 0 40 200" xmlns="http://www.w3.org/2000/svg"><g stroke="#7fe8ff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M20 6 L20 194"/><path d="M8 20 L20 30 L32 20"/><circle cx="20" cy="56" r="9"/><path d="M8 84 L32 84 M8 84 L20 100 L32 84"/><path d="M10 116 L20 130 L30 116 L20 106 Z"/><path d="M8 150 L32 150 M20 140 L20 162"/><path d="M8 178 Q20 164 32 178"/></g></svg>`,
    { size: 256 },
  );
  const PAGES = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#fbefd0"/><g stroke="#5a3a6a" stroke-width="2.5"><path d="M8 12 H52 M8 20 H46 M8 28 H52 M8 36 H40 M8 44 H52 M8 52 H48"/></g><circle cx="30" cy="66" r="8" fill="none" stroke="#b8324a" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const SCROLL_TEX = svg(
    `<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="70" fill="#f3e2b3"/><rect x="0" y="0" width="40" height="4" fill="#c99a52"/><rect x="0" y="66" width="40" height="4" fill="#c99a52"/><g stroke="#6a3f7a" stroke-width="2.5"><path d="M6 14 H34 M6 22 H30 M6 30 H34 M6 38 H26"/></g><path d="M20 46 L26 56 L14 56 Z" fill="none" stroke="#b8324a" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: Fill, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { at: [x, y, z], rotation: rot } : { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, color: Fill, x: number, y: number, z: number, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, rot ? { at: [x, y, z], rotation: rot } : { at: [x, y, z] });
  const sph = (r: number, color: Fill, x: number, y: number, z: number, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], scale: sc });
  const ring = (r: number, t: number, color: Fill, x: number, y: number, z: number, rot: number[]) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 20), color, { at: [x, y, z], rotation: rot });

  // ---------- carcass ----------
  const T = [0.1575, 0.6375, 1.0975, 1.5575];
  const BOARD_Y = [0.14, 0.62, 1.08, 1.54];
  // plinth & feet
  box(1.66, 0.1, 0.42, WOOD_H, 0, 0.05, 0);
  box(1.7, 0.025, 0.44, BRASS, 0, 0.1125, 0);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.46, WOOD_H, s * 0.78, 0.05, 0);
    sph(0.035, BRASS, s * 0.78, 0.115, 0.215);
  }
  // side panels
  for (const s of [1, -1]) {
    box(0.05, 1.82, 0.36, WOOD, s * 0.75, 1.03, 0);
    box(0.012, 1.82, 0.012, BRASS, s * 0.75, 1.03, 0.186);
    box(0.07, 0.03, 0.38, BRASS, s * 0.75, 0.15, 0);
    for (let i = 0; i < 15; i++) sph(0.008, BRASS, s * 0.75, 0.25 + i * 0.12, 0.19);
    glow(b.part(new THREE.PlaneGeometry(0.28, 1.4), "#ffffff", { at: [s * 0.7785, 1.03, 0], dir: [s, 0, 0], axis: "z", texture: RUNES }), 1);
    box(0.012, 1.5, 0.3, WOOD_H, s * 0.7745, 1.03, 0);
  }
  // back
  b.part(new THREE.BoxGeometry(1.46, 1.84, 0.03), BACK, { at: [0, 1.03, -0.165] });
  // boards
  BOARD_Y.forEach((y, i) => {
    box(1.46, 0.035, 0.34, WOOD_H, 0, y, 0);
    box(1.46, 0.016, 0.01, BRASS, 0, y, 0.175);
    for (const s of [1, -1]) {
      box(0.018, 0.04, 0.02, BRASS, s * 0.72, y + 0.01, 0.17);
      cyl(0.004, 0.004, 0.05, BRASS, s * 0.7, y - 0.04, 0.182, 5);
      sph(0.012, BRASS, s * 0.7, y - 0.07, 0.182, [1, 1.4, 1]);
      b.spike([s * 0.7, y - 0.075, 0.182], [0, -1, 0], 0.045, 0.011, { color: RED, sides: 6 });
    }
    if (i === 0) return;
  });
  // cap
  box(1.62, 0.06, 0.4, WOOD_H, 0, 1.96, 0);
  box(1.66, 0.02, 0.43, BRASS, 0, 2.0, 0);
  for (let i = 0; i < 13; i++) box(0.04, 0.03, 0.01, BRASS, -0.72 + i * 0.12, 1.94, 0.205);
  // pediment
  b.extrude(
    [
      [-0.8, 0],
      [0.8, 0],
      [0.62, 0.1],
      [0.3, 0.17],
      [0.12, 0.3],
      [0, 0.36],
      [-0.12, 0.3],
      [-0.3, 0.17],
      [-0.62, 0.1],
    ],
    { at: [0, 2.01, 0], x: [1, 0, 0], thickness: 0.3, bevel: 0.01, smoothing: 1, color: WOOD },
  );
  b.extrude(
    [
      [-0.62, 0],
      [0.62, 0],
      [0.5, 0.07],
      [0.25, 0.12],
      [0.09, 0.22],
      [0, 0.26],
      [-0.09, 0.22],
      [-0.25, 0.12],
      [-0.5, 0.07],
    ],
    { at: [0, 2.03, 0.15], x: [1, 0, 0], thickness: 0.012, color: "#3b2c7a" },
  );
  // crescent moon
  const cres: Array<[number, number]> = [];
  for (let a = 100; a <= 260; a += 20) cres.push([0.1 * Math.cos((a * Math.PI) / 180), 0.1 * Math.sin((a * Math.PI) / 180)]);
  for (let a = 260; a >= 100; a -= 20) cres.push([0.045 + 0.085 * Math.cos((a * Math.PI) / 180), 0.085 * Math.sin((a * Math.PI) / 180)]);
  b.extrude(cres, { at: [0, 2.14, 0.17], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: BRASS });
  for (const [sx, sy, sr] of [[0.18, 2.2, 0.018], [-0.2, 2.12, 0.014], [0.3, 2.1, 0.012], [0.08, 2.26, 0.01]]) {
    glow(b.part(new THREE.OctahedronGeometry(sr), "#ffe9a8", { at: [sx, sy, 0.17] }));
  }
  // pediment finial
  cyl(0.012, 0.03, 0.06, BRASS, 0, 2.4, 0, 6);
  glow(sph(0.045, "#8fe8ff", 0, 2.47, 0), 1.2);
  ring(0.07, 0.006, BRASS, 0, 2.47, 0, [90, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.01, 0.035, 0.12, BRASS, s * 0.78, 2.07, 0, 6);
    sph(0.025, BRASS, s * 0.78, 2.15, 0);
    glow(b.part(new THREE.OctahedronGeometry(0.03), "#8fe8ff", { at: [s * 0.78, 2.2, 0], scale: [1, 1.5, 1] }), 1);
  }

  // ---------- books ----------
  const book = (x: number, y0: number, w: number, h: number, d: number, lean = 0) => {
    const col = BOOKS[Math.floor(R() * BOOKS.length)];
    const z = -0.14 + d / 2;
    const th = (lean * Math.PI) / 180;
    const cy = y0 + (h / 2) * Math.cos(th) + (w / 2) * Math.abs(Math.sin(th));
    const rot = [0, 0, lean];
    box(w, h, d, col, x, cy, z, rot);
    // page edge peek top
    box(w * 0.86, 0.006, d * 0.9, PAGE, x - Math.sin(th) * (h / 2 + 0.003), cy + Math.cos(th) * (h / 2 + 0.003), z - 0.005, rot);
    const tex = SPINES[Math.floor(R() * 3)];
    b.part(new THREE.PlaneGeometry(w * 0.9, h * 0.92), "#ffffff", { at: [x, cy, z + d / 2 + 0.003], dir: [0, 0, 1], axis: "z", texture: tex, rotation: rot });
    if (R() < 0.3) box(w * 1.02, 0.012, 0.012, BRASS, x, cy - h * 0.46, z + d / 2 + 0.002, rot);
  };
  const fillRow = (x0: number, x1: number, y0: number, maxH: number) => {
    let x = x0;
    while (x < x1 - 0.06) {
      const w = 0.035 + R() * 0.04;
      const h = maxH * (0.62 + R() * 0.38);
      const d = 0.2 + R() * 0.07;
      if (x + w > x1 - 0.045) {
        book(x1 - w / 2 - 0.03, y0, w, h, d, -13);
        return;
      }
      book(x + w / 2, y0, w, h, d);
      x += w + 0.004;
    }
  };
  const flatStack = (x: number, y0: number, z: number, n: number, bw: number) => {
    let y = y0;
    for (let i = 0; i < n; i++) {
      const th = 0.035 + R() * 0.02;
      const col = BOOKS[(i * 3 + Math.floor(x * 10)) & 7 & (BOOKS.length - 1)];
      const rot = [0, (R() - 0.5) * 20, 0];
      box(bw, th, bw * 0.72, col, x + (R() - 0.5) * 0.02, y + th / 2, z, rot);
      box(bw * 0.95, th * 0.6, bw * 0.72 * 1.02, PAGE, x, y + th / 2, z + 0.004, rot);
      box(bw * 1.01, th * 1.02, 0.01, BRASS, x, y + th / 2, z - bw * 0.36 + 0.002, rot);
      y += th;
    }
    return y;
  };

  // ---------- props ----------
  const candle = (x: number, y: number, z: number, h: number, r = 0.016) => {
    cyl(r * 2.2, r * 2.4, 0.012, BRASS, x, y + 0.006, z, 8);
    cyl(r, r, h, WAX, x, y + 0.012 + h / 2, z, 8);
    box(0.008, 0.05, 0.008, WAX, x + r * 0.9, y + 0.012 + h - 0.02, z, [0, 0, 0]);
    sph(0.009, WAX, x + r * 0.9, y + 0.012 + h - 0.05, z, [1, 1.2, 1]);
    cyl(0.002, 0.002, 0.014, INK, x, y + 0.012 + h + 0.006, z, 4);
    glow(sph(0.015, FLAME, x, y + 0.012 + h + 0.03, z, [0.8, 1.7, 0.8]), 1.2);
    glow(b.part(new THREE.ConeGeometry(0.011, 0.04, 6), FLAME, { at: [x, y + 0.012 + h + 0.065, z] }), 1.2);
    glow(sph(0.007, FLAME_CORE, x, y + 0.012 + h + 0.026, z, [0.8, 1.6, 0.8]), 1.5);
  };
  const candelabra = (x: number, y: number, z: number) => {
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.06, 0.02],
        [0.025, 0.04],
        [0.02, 0.1],
        [0.03, 0.14],
        [0, 0.14],
      ],
      { at: [x, y, z], color: BRASS, segments: 8 },
    );
    cyl(0.02, 0.02, 0.1, BRASS, x, y + 0.19, z, 6);
    box(0.2, 0.012, 0.016, BRASS, x, y + 0.24, z);
    ring(0.04, 0.007, BRASS, x - 0.1, y + 0.255, z, [0, 90, 0]);
    ring(0.04, 0.007, BRASS, x + 0.1, y + 0.255, z, [0, 90, 0]);
    candle(x, y + 0.245, z, 0.1);
    candle(x - 0.1, y + 0.245, z, 0.07);
    candle(x + 0.1, y + 0.245, z, 0.085);
  };
  const orb = (x: number, y: number, z: number, r: number) => {
    b.lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.065, 0.02],
        [0.032, 0.04],
        [0.03, 0.07],
        [0.06, 0.1],
        [0, 0.1],
      ],
      { at: [x, y, z], color: BRASS, segments: 8 },
    );
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.78;
      b.spike([x + Math.cos(a) * r * 0.5, y + 0.1 + r * 0.2, z + Math.sin(a) * r * 0.5], [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4], 0.07, 0.008, { color: GOLD, sides: 5 });
    }
    glow(b.part(new THREE.SphereGeometry(r, 10, 8), "#ffffff", { at: [x, y + 0.1 + r * 0.85, z], texture: ORB_TEX }), 1.1);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      glow(b.part(new THREE.OctahedronGeometry(0.01), "#d6f6ff", { at: [x + Math.cos(a) * (r + 0.03), y + 0.1 + r * (1.2 + i * 0.3), z + Math.sin(a) * 0.04] }));
    }
  };
  const armillary = (x: number, y: number, z: number) => {
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.06, 0.015],
        [0.02, 0.04],
        [0.02, 0.07],
        [0, 0.07],
      ],
      { at: [x, y, z], color: BRASS, segments: 8 },
    );
    const cy = y + 0.17;
    ring(0.1, 0.006, BRASS, x, cy, z, [0, 0, 0]);
    ring(0.1, 0.006, GOLD, x, cy, z, [0, 90, 0]);
    ring(0.1, 0.006, BRASS, x, cy, z, [90, 0, 0]);
    ring(0.075, 0.005, GOLD, x, cy, z, [60, 20, 0]);
    rodSafe(x, cy - 0.11, x, cy + 0.11, z);
    glow(sph(0.035, "#ffd36b", x, cy, z), 1.3);
    glow(sph(0.012, "#8fe8ff", x + 0.1, cy, z), 1);
  };
  function rodSafe(x0: number, y0: number, x1: number, y1: number, z: number) {
    b.rod([x0, y0, z], [x1, y1, z], 0.004, { color: GOLD, sides: 4 });
  }
  const potion = (x: number, y: number, z: number, col: string, s = 1) => {
    glow(sph(0.035 * s, col, x, y + 0.035 * s, z), 0.9);
    cyl(0.012 * s, 0.014 * s, 0.05 * s, col, x, y + 0.08 * s, z, 6);
    ring(0.014 * s, 0.003, BRASS, x, y + 0.105 * s, z, [90, 0, 0]);
    cyl(0.013 * s, 0.01 * s, 0.025 * s, "#b98a5a", x, y + 0.12 * s, z, 6);
    ring(0.034 * s, 0.003, GOLD, x, y + 0.04 * s, z, [90, 0, 0]);
  };
  const hourglass = (x: number, y: number, z: number) => {
    cyl(0.04, 0.04, 0.012, BRASS, x, y + 0.006, z, 8);
    cyl(0.04, 0.04, 0.012, BRASS, x, y + 0.134, z, 8);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      cyl(0.004, 0.004, 0.12, GOLD, x + Math.cos(a) * 0.036, y + 0.07, z + Math.sin(a) * 0.036, 4);
    }
    b.part(new THREE.ConeGeometry(0.03, 0.055, 8), "#cfe9f2", { at: [x, y + 0.099, z], rotation: [180, 0, 0] });
    b.part(new THREE.ConeGeometry(0.03, 0.055, 8), "#cfe9f2", { at: [x, y + 0.041, z] });
    glow(b.part(new THREE.ConeGeometry(0.02, 0.03, 8), "#f6d78a", { at: [x, y + 0.03, z] }), 0.8);
  };
  const scroll = (x: number, y: number, z: number, len: number, r: number, tint: string) => {
    cyl(r, r, len, PARCH, x, y, z, 8, [0, 0, 90]);
    cyl(r * 0.55, r * 0.55, len + 0.03, "#e0c58a", x, y, z, 6, [0, 0, 90]);
    cyl(r + 0.003, r + 0.003, 0.016, tint, x, y, z, 8, [0, 0, 90]);
    cyl(r * 1.35, r * 1.35, 0.012, BRASS, x - len / 2 - 0.012, y, z, 6, [0, 0, 90]);
    cyl(r * 1.35, r * 1.35, 0.012, BRASS, x + len / 2 + 0.012, y, z, 6, [0, 0, 90]);
  };

  // ROW 0: scroll pile | books | flat stack with candle
  {
    const y0 = T[0];
    const r = 0.033;
    const cx = -0.5;
    const tints = [RED, "#2f5fb3", "#2f9a72", "#7a3fb0", "#d8782a", RED];
    [-0.068, 0, 0.068].forEach((z, i) => scroll(cx + (i - 1) * 0.01, y0 + r, z + 0.0, 0.4, r, tints[i]));
    [-0.034, 0.034].forEach((z, i) => scroll(cx + (i ? 0.02 : -0.02), y0 + r + 0.057, z, 0.4, r, tints[i + 3]));
    scroll(cx, y0 + r + 0.114, 0, 0.4, r, tints[5]);
    fillRow(-0.26, 0.26, y0, 0.4);
    const top = flatStack(0.5, y0, 0.0, 4, 0.26);
    candle(0.5, top, 0.0, 0.1);
    flatStack(0.5, 0, 0, 0, 0.1);
  }
  // ROW 1: books | crystal ball | potions | hourglass | lean books
  {
    const y0 = T[1];
    fillRow(-0.72, -0.2, y0, 0.38);
    orb(-0.02, y0, 0.0, 0.1);
    potion(0.2, y0, -0.02, "#6dff9a", 1.2);
    potion(0.28, y0, 0.06, "#ff7ad0", 1);
    potion(0.3, y0, -0.06, "#ffb54a", 0.9);
    hourglass(0.42, y0, 0.0);
    fillRow(0.5, 0.72, y0, 0.36);
  }
  // ROW 2: lectern | books | candelabra | books
  {
    const y0 = T[2];
    // lectern with open book
    box(0.3, 0.02, 0.2, WOOD_H, -0.5, y0 + 0.01, 0.0);
    box(0.06, 0.1, 0.06, WOOD, -0.5, y0 + 0.07, -0.02);
    box(0.26, 0.012, 0.05, BRASS, -0.5, y0 + 0.14, 0.04, [-35, 0, 0]);
    for (const s of [1, -1]) {
      box(0.115, 0.012, 0.16, BOOKS[3], -0.5 + s * 0.06, y0 + 0.2, -0.015, [-35, 0, 0]);
      b.part(new THREE.PlaneGeometry(0.11, 0.15), "#ffffff", { at: [-0.5 + s * 0.058, y0 + 0.207, -0.012], rotation: [-35, 0, 0], texture: PAGES });
      box(0.11, 0.006, 0.006, GOLD, -0.5 + s * 0.058, y0 + 0.14, 0.063, [-35, 0, 0]);
    }
    glow(sph(0.013, "#8fe8ff", -0.5, y0 + 0.27, -0.02), 1.2);
    fillRow(-0.34, 0.2, y0, 0.38);
    candelabra(0.46, y0, 0.0);
    fillRow(0.62, 0.72, y0, 0.3);
    box(0.01, 0.01, 0.01, GOLD, 0.72, y0, 0);
  }
  // ROW 3: books | armillary | books | candle, inkwell
  {
    const y0 = T[3];
    fillRow(-0.72, -0.28, y0, 0.33);
    armillary(-0.1, y0, 0.0);
    fillRow(0.08, 0.5, y0, 0.32);
    // inkwell with quill
    cyl(0.03, 0.035, 0.05, INK, 0.58, y0 + 0.025, 0.02, 8);
    cyl(0.018, 0.02, 0.012, BRASS, 0.58, y0 + 0.056, 0.02, 8);
    b.rod([0.58, y0 + 0.06, 0.02], [0.63, y0 + 0.26, 0.02], 0.003, { color: PARCH, sides: 4 });
    b.membrane([[0.6, y0 + 0.12, 0.02], [0.63, y0 + 0.26, 0.02]], [[0.64, y0 + 0.12, 0.02], [0.645, y0 + 0.26, 0.02]], { thickness: 0.004, color: RED });
    candle(0.68, y0, 0.0, 0.14, 0.014);
  }

  // ---------- floor dressing ----------
  {
    const top = flatStack(1.04, 0, 0.08, 5, 0.3);
    candle(1.04, top, 0.08, 0.16, 0.02);
    flatStack(1.06, 0, 0.0, 0, 0.1);
    // scroll urn
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.13, 0.12],
        [0.12, 0.28],
        [0.09, 0.34],
        [0.1, 0.36],
        [0.07, 0.36],
        [0.075, 0.3],
        [0.1, 0.12],
        [0.08, 0.02],
        [0, 0.02],
      ],
      { at: [-1.02, 0, 0.05], color: URN, segments: 10, smoothing: 0 },
    );
    ring(0.12, 0.008, GOLD, -1.02, 0.2, 0.05, [90, 0, 0]);
    ring(0.095, 0.007, GOLD, -1.02, 0.33, 0.05, [90, 0, 0]);
    const tn = [RED, "#2f5fb3", "#2f9a72", "#d8782a", "#7a3fb0"];
    tn.forEach((c, i) => {
      const a = (i * Math.PI * 2) / 5;
      const lx = Math.cos(a) * 0.035;
      const lz = Math.sin(a) * 0.035;
      const hgt = 0.55 + (i % 3) * 0.08;
      b.rod([-1.02 + lx * 0.3, 0.3, 0.05 + lz * 0.3], [-1.02 + lx * 2, 0.3 + hgt, 0.05 + lz * 2], 0.018, { color: PARCH, sides: 8, caps: "flat" });
      b.rod([-1.02 + lx * 1.9, 0.3 + hgt - 0.05, 0.05 + lz * 1.9], [-1.02 + lx * 2, 0.3 + hgt - 0.03, 0.05 + lz * 2], 0.021, { color: c, sides: 8, caps: "flat" });
      sph(0.022, BRASS, -1.02 + lx * 2, 0.3 + hgt + 0.015, 0.05 + lz * 2);
    });
    // glowing potion on floor beside urn
    potion(-0.9, 0, 0.28, "#8fe8ff", 1.8);
    // loose scroll
    scroll(-0.95, 0.03, 0.4, 0.3, 0.03, RED);
    // standing hanging scroll banner
    b.part(new THREE.PlaneGeometry(0.2, 0.35), "#ffffff", { at: [0.3, 1.03, 0.2], texture: SCROLL_TEX });
  }

  return b.root;
}
