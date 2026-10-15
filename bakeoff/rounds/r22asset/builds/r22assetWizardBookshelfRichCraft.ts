import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { cells, grain, noise, paint, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { DEG, rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall walnut bookcase with a gabled moon crest, crowded with tomes, scrolls, glowing orbs, potions, candles and an owl in a wizard hat, set on a star rug.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const GOLD = "#f1c24f";
const GOLD_D = "#b8862b";
const PAGES = "#f4e6c2";
const PAPER = "#ead9a8";
const PAPER2 = "#d8c08a";
const WAX = "#fbf1d6";
const WAX2 = "#e8d3a0";
const FLAME = "#ff9a2e";
const FLAME_IN = "#ffe27a";
const TEAL = "#6ff3e6";
const PINK = "#ff7aa6";
const AMBER = "#ffd36b";
const VIOLET = "#9b8cff";
const RED = "#a8322d";
const BOOKS = [
  "#7b2d8e",
  "#1f6f78",
  "#a8322d",
  "#2c4f9e",
  "#c78a2a",
  "#3f7d3a",
  "#5a2f6e",
  "#d4562b",
  "#2a3d6e",
  "#8a1f4a",
  "#e0b34a",
  "#3a8f86",
];
const GEMS = [TEAL, PINK, AMBER, VIOLET];

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const root = b.joint("root", { at: [0, 1, 0] });

  // ---------------------------------------------------------------- palette and textures
  const WOOD = cel(grain("#8c5538", "#6f4029", { size: 0.025, axis: "y" }));
  const WOOD_H = cel(grain("#8c5538", "#6f4029", { size: 0.025, axis: "x" }));
  const WOOD_D = cel(grain("#5f3727", "#4a2a1f", { size: 0.025, axis: "x" }));
  const WOOD_DY = cel(grain("#5f3727", "#4a2a1f", { size: 0.025, axis: "y" }));
  const BACK = paint((p) => {
    const c = cells(p, 0.075, 3);
    if (c.d1 < 0.06 && c.id > 0.6) return "#ffe9a0";
    return noise(p, 0.3, 5) > 0.55 ? "#33245c" : "#2a1d4d";
  });
  const RUG = paint((p) => {
    const dx = p.x;
    const dz = p.z - 0.62;
    const d = Math.hypot(dx, dz);
    const a = Math.atan2(dz, dx);
    if (d < 0.07) return GOLD;
    if (d < 0.13) return RED;
    if (d < 0.3) return Math.sin(a * 8) > 0 ? "#3a2a78" : "#2c4f9e";
    if (d < 0.34) return GOLD;
    if (d < 0.56) return Math.sin(a * 12) > 0.6 ? "#7b2d8e" : "#5a2f6e";
    if (d < 0.6) return GOLD;
    if (d < 0.68) return Math.sin(a * 16) > 0 ? RED : "#7a1f2a";
    if (d < 0.72) return GOLD_D;
    return "#2a1d4d";
  });
  const WEAVE = stripes("#b5883f", "#8a6125", { size: 0.02, axis: "y", width: 0.5, wobble: 0.1 });

  const labelSvg = (glyph: string) =>
    svg(
      `<svg viewBox="0 0 24 40"><rect x="1.5" y="1.5" width="21" height="37" rx="3" fill="#f2e2b0" stroke="#7a4a1a" stroke-width="2"/><g stroke="#8a1f2a" stroke-width="2" stroke-linecap="round" fill="none">${glyph}</g></svg>`,
      { size: 96 },
    );
  const LABELS = [
    labelSvg(`<path d="M12 8 L12 32 M7 14 L17 14 M7 24 L17 24"/>`),
    labelSvg(`<path d="M7 9 L17 9 L7 31 L17 31"/><circle cx="12" cy="20" r="3"/>`),
    labelSvg(`<path d="M12 7 L18 20 L12 33 L6 20 Z"/>`),
  ];
  const SPIRAL = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#f4e6c2" stroke="#b8862b" stroke-width="2"/><path d="M16 16 m0 -2 a2 2 0 1 1 -2 2 a4.5 4.5 0 1 1 4.5 4.5 a7 7 0 1 1 -7 -7 a9.5 9.5 0 1 1 9.5 9.5" stroke="#b8862b" stroke-width="1.5" fill="none"/></svg>`,
    { size: 96 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 40 120"><g stroke="#6ff3e6" stroke-width="3" stroke-linecap="round" fill="none"><circle cx="20" cy="20" r="12"/><path d="M20 8 L20 32 M12 20 L28 20"/><path d="M10 50 L20 62 L30 50 M20 62 L20 80"/><path d="M12 92 L28 92 M12 92 L20 108 L28 92"/></g></svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- helpers
  const put = (g: THREE.BufferGeometry, c: Col, at: V, o: PartOptions = {}) => b.part(g, c, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number, c: Col, at: V, o?: PartOptions) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, at: V, o?: PartOptions) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, o);
  const ball = (r: number, c: Col, at: V, o?: PartOptions, ws = 8, hs = 6) =>
    put(new THREE.SphereGeometry(r, ws, hs), c, at, o);
  const oct = (r: number, c: string, at: V, s = 1.4) => glow(put(new THREE.OctahedronGeometry(r, 0), c, at), s);

  const fr = (pivot: V, yaw = 0, tilt = 0) => {
    const cy = Math.cos(yaw * DEG);
    const sy = Math.sin(yaw * DEG);
    const cz = Math.cos(tilt * DEG);
    const sz = Math.sin(tilt * DEG);
    return {
      rot: [0, yaw, tilt] as V,
      at: (l: V): V => {
        const x1 = l[0] * cz - l[1] * sz;
        const y1 = l[0] * sz + l[1] * cz;
        return [pivot[0] + x1 * cy + l[2] * sy, pivot[1] + y1, pivot[2] - x1 * sy + l[2] * cy];
      },
    };
  };
  type Fr = ReturnType<typeof fr>;
  const pf = (f: Fr, g: THREE.BufferGeometry, c: Col, l: V, o: PartOptions = {}) =>
    put(g, c, f.at(l), { rotation: f.rot, ...o });
  const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // A standing book: spine toward +Z, back at the given z. Pivot at the bottom centre.
  function book(x: number, y0: number, zBack: number, w: number, h: number, d: number, c: Col, i: number, tilt = 0) {
    const f = fr([x, y0, zBack + d / 2], 0, tilt);
    pf(f, B(w, h, 0.012), c, [0, h / 2, d / 2 - 0.006]);
    for (const s of [1, -1]) pf(f, B(0.01, h, d), c, [s * (w / 2 - 0.005), h / 2, 0]);
    pf(f, B(w - 0.02, h - 0.016, d - 0.024), PAGES, [0, h / 2, -0.008]);
    pf(f, B(w + 0.004, 0.014, 0.016), GOLD, [0, h * 0.12, d / 2 - 0.002]);
    pf(f, B(w + 0.004, 0.014, 0.016), GOLD, [0, h * 0.88, d / 2 - 0.002]);
    if (w >= 0.04)
      pf(f, new THREE.PlaneGeometry(w * 0.78, h * 0.28), "#ffffff", [0, h * 0.55, d / 2 + 0.008], {
        texture: LABELS[i % 3],
      });
    if (w >= 0.07)
      glow(pf(f, new THREE.SphereGeometry(0.011, 6, 4), GEMS[i % 4], [0, h * 0.3, d / 2 + 0.006]), 1.2);
  }

  // A lying book, spine at its -x end, rotated by yaw about its centre.
  function flatBook(x: number, y0: number, z: number, len: number, t: number, d: number, c: Col, yaw: number, i: number) {
    const f = fr([x, y0, z], yaw, 0);
    pf(f, B(len, 0.01, d), c, [0, 0.005, 0]);
    pf(f, B(len, 0.01, d), c, [0, t - 0.005, 0]);
    pf(f, B(0.016, t, d), c, [-len / 2 + 0.008, t / 2, 0]);
    pf(f, B(len - 0.02, t - 0.02, d - 0.012), PAGES, [0.006, t / 2, 0]);
    pf(f, B(len * 0.7, 0.004, d * 0.7), GOLD, [0.012, t + 0.001, 0]);
    pf(f, B(len * 0.62, 0.005, d * 0.6), c, [0.012, t + 0.003, 0]);
    glow(pf(f, new THREE.SphereGeometry(0.014, 6, 4), GEMS[i % 4], [0.012, t + 0.008, 0]), 1.2);
    pf(f, B(0.02, t + 0.004, 0.014), GOLD, [-len / 2 + 0.008, t / 2, d * 0.32]);
  }
  function stackFlat(x: number, y0: number, z: number, specs: Array<[number, number, number, Col, number]>) {
    let y = y0;
    specs.forEach(([len, t, d, c, yaw], i) => {
      flatBook(x, y, z, len, t, d, c, yaw, i);
      y += t + 0.004;
    });
    return y;
  }

  // A row of standing books; returns the x where it ended.
  function row(x0: number, y0: number, n: number, hmin: number, hmax: number, seed: number, lean = false) {
    const r = rng(seed);
    let x = x0;
    for (let i = 0; i < n; i++) {
      const w = 0.04 + r() * 0.05;
      const h = hmin + r() * (hmax - hmin);
      const d = 0.21 + r() * 0.06;
      const c = BOOKS[(seed + i * 5) % BOOKS.length];
      if (lean && i === n - 1) {
        const cx = x + 0.19 * h + w / 2;
        book(cx, y0, -0.15, w, h, d, c, i + seed, 12);
        x = cx + w / 2 + 0.01;
      } else {
        book(x + w / 2, y0, -0.15, w, h, d, c, i + seed);
        x += w + 0.003;
      }
    }
    return x;
  }

  function candle(x: number, y0: number, z: number, h: number, r: number, fs = 1) {
    cyl(r * 2.4, r * 2.8, 0.012, 10, GOLD, [x, y0 + 0.006, z]);
    cyl(r * 1.5, r * 2.2, 0.012, 10, GOLD_D, [x, y0 + 0.018, z]);
    const b0 = y0 + 0.024;
    cyl(r, r * 1.04, h, 8, WAX, [x, b0 + h / 2, z]);
    cyl(r * 1.06, r * 1.0, 0.008, 8, WAX2, [x, b0 + h, z]);
    cyl(r * 0.4, r * 0.4, h * 0.35, 5, WAX, [x + r * 0.9, b0 + h * 0.8, z + r * 0.2]);
    ball(r * 0.4, WAX, [x + r * 0.9, b0 + h * 0.62, z + r * 0.2], undefined, 5, 4);
    cyl(r * 0.35, r * 0.35, h * 0.22, 5, WAX, [x - r * 0.35, b0 + h * 0.89, z + r * 0.9]);
    ball(r * 0.35, WAX, [x - r * 0.35, b0 + h * 0.78, z + r * 0.9], undefined, 5, 4);
    cyl(0.002, 0.002, 0.014, 4, INK, [x, b0 + h + 0.011, z]);
    glow(put(new THREE.ConeGeometry(0.013 * fs, 0.052 * fs, 6), FLAME, [x, b0 + h + 0.018 + 0.026 * fs, z]), 1.3);
    glow(put(new THREE.ConeGeometry(0.007 * fs, 0.034 * fs, 6), FLAME_IN, [x, b0 + h + 0.018 + 0.017 * fs, z]), 1.6);
  }

  function orb(x: number, y0: number, z: number, r: number, col: string, tilt = 0) {
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.058, 0.01],
        [0.04, 0.022],
        [0.02, 0.04],
        [0.03, 0.06],
        [0.042, 0.068],
        [0, 0.068],
      ],
      { at: [x, y0, z], bone: root, segments: 10, color: GOLD_D },
    );
    const cy = y0 + 0.068 + r * 0.8;
    put(new THREE.TorusGeometry(0.038, 0.007, 5, 10), GOLD, [x, y0 + 0.07, z], { rotation: [90, 0, 0] });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      b.rod(
        [x + Math.cos(a) * 0.038, y0 + 0.07, z + Math.sin(a) * 0.038],
        [x + Math.cos(a) * r * 0.85, cy - r * 0.2, z + Math.sin(a) * r * 0.85],
        0.0045,
        GOLD,
        { bone: root },
      );
    }
    glow(ball(r, col, [x, cy, z], undefined, 10, 8), 0.9);
    const v = new THREE.Vector3(-0.4, 0.5, 0.7).normalize().multiplyScalar(r * 0.96);
    glow(ball(r * 0.17, "#ffffff", [x + v.x, cy + v.y, z + v.z], { scale: [1, 1.3, 0.6] }, 6, 4), 1.5);
    ball(r * 0.08, "#ffffff", [x + r * 0.5, cy - r * 0.55, z + r * 0.68], undefined, 5, 4);
    put(new THREE.TorusGeometry(r * 1.4, 0.0035, 4, 20), GOLD, [x, cy, z], { rotation: [70, 0, 20 + tilt] });
    oct(0.007, "#fff3b0", [x + r * 1.3, cy + r * 0.5, z + r * 0.3]);
    oct(0.006, "#ffffff", [x - r * 1.25, cy + r * 0.9, z + r * 0.2]);
    oct(0.005, "#fff3b0", [x + r * 0.2, cy + r * 1.5, z + r * 0.3]);
  }

  function potion(x: number, y0: number, z: number, h: number, col: string) {
    glow(
      b.lathe(
        [
          [0, 0],
          [0.03, 0],
          [0.036, 0.012],
          [0.036, h * 0.5],
          [0.02, h * 0.66],
          [0.012, h * 0.72],
          [0.012, h * 0.85],
          [0, h * 0.85],
        ],
        { at: [x, y0, z], bone: root, segments: 8, color: col },
      ),
      0.7,
    );
    cyl(0.038, 0.038, h * 0.2, 8, "#f2e2b0", [x, y0 + h * 0.28, z]);
    cyl(0.014, 0.012, 0.022, 6, "#9a6a3a", [x, y0 + h * 0.85 + 0.01, z]);
  }

  function mushroom(x: number, y0: number, z: number, r: number, col: string) {
    cyl(r * 0.3, r * 0.4, r * 1.6, 6, PAGES, [x, y0 + r * 0.8, z]);
    glow(
      put(new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, [x, y0 + r * 1.5, z], {
        scale: [1, 0.8, 1],
      }),
      1,
    );
    for (const [dx, dz] of [
      [0.5, 0.2],
      [-0.4, 0.5],
      [-0.1, -0.5],
    ])
      ball(r * 0.14, "#ffffff", [x + dx * r * 0.7, y0 + r * 1.5 + r * 0.7, z + dz * r * 0.7], undefined, 4, 3);
  }

  function hourglass(x: number, y0: number, z: number) {
    cyl(0.045, 0.045, 0.012, 8, WOOD_D, [x, y0 + 0.006, z]);
    cyl(0.045, 0.045, 0.012, 8, WOOD_D, [x, y0 + 0.128, z]);
    glow(
      b.lathe(
        [
          [0, 0],
          [0.026, 0.004],
          [0.032, 0.022],
          [0.014, 0.048],
          [0.006, 0.055],
          [0.014, 0.062],
          [0.032, 0.088],
          [0.026, 0.106],
          [0, 0.11],
        ],
        { at: [x, y0 + 0.012, z], bone: root, segments: 8, color: "#9fe0e8" },
      ),
      0.5,
    );
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.5;
      cyl(0.004, 0.004, 0.116, 4, GOLD_D, [x + Math.cos(a) * 0.04, y0 + 0.07, z + Math.sin(a) * 0.04]);
    }
  }

  function scrollsUp(x: number, y0: number, z: number, tips: Array<[number, number, number]>) {
    tips.forEach(([dx, dy, dz], i) => {
      const a: V = [x, y0, z];
      const t: V = [x + dx, y0 + dy, z + dz];
      b.rod(a, t, 0.014, i % 2 ? PAPER : PAPER2, { bone: root });
      ball(0.017, "#8a5a32", t, undefined, 6, 4);
      ball(0.01, GOLD, [t[0] + dx * 0.1, t[1] + dy * 0.1 + 0.01, t[2] + dz * 0.1], undefined, 5, 4);
      b.rod(
        [x + dx * 0.55, y0 + dy * 0.55, z + dz * 0.55],
        [x + dx * 0.6, y0 + dy * 0.6, z + dz * 0.6],
        0.0165,
        RED,
        { bone: root },
      );
    });
  }

  function owl(x: number, y0: number, z: number) {
    const OB = "#7a5a8e";
    const OF = "#d9c7e6";
    ball(0.07, OB, [x, y0 + 0.085, z], { scale: [1, 1.15, 0.9] });
    ball(0.05, OF, [x, y0 + 0.08, z + 0.045], { scale: [1, 1.2, 0.6] });
    ball(0.058, OB, [x, y0 + 0.19, z + 0.005], { scale: [1.1, 0.9, 1] });
    for (const s of [1, -1]) {
      ball(0.022, "#fff6d8", [x + s * 0.03, y0 + 0.195, z + 0.045], undefined, 6, 4);
      glow(ball(0.012, TEAL, [x + s * 0.03, y0 + 0.195, z + 0.063], undefined, 5, 4), 1.4);
      ball(0.04, "#5c4270", [x + s * 0.067, y0 + 0.085, z - 0.005], { scale: [0.4, 1.3, 0.7] }, 6, 4);
      box(0.02, 0.01, 0.03, "#f08a2c", [x + s * 0.025, y0 + 0.005, z + 0.04]);
    }
    put(new THREE.ConeGeometry(0.01, 0.03, 5), "#f08a2c", [x, y0 + 0.178, z + 0.068], { dir: [0, -0.4, 1] });
    cyl(0.07, 0.07, 0.008, 10, "#4a2f7a", [x, y0 + 0.238, z + 0.005]);
    cyl(0.047, 0.049, 0.014, 8, GOLD, [x, y0 + 0.248, z + 0.005]);
    put(new THREE.ConeGeometry(0.045, 0.11, 8), "#5a3a9a", [x, y0 + 0.297, z + 0.005], { rotation: [0, 0, 7] });
    oct(0.008, AMBER, [x, y0 + 0.31, z + 0.05]);
  }

  // ---------------------------------------------------------------- carcass
  box(1.4, 0.12, 0.5, WOOD_D, [0, 0.06, 0]);
  box(1.46, 0.025, 0.54, WOOD_D, [0, 0.1325, 0]);
  box(1.46, 0.008, 0.54, GOLD_D, [0, 0.147, 0]);
  for (const s of [1, -1]) {
    box(0.07, 1.85, 0.38, WOOD, [s * 0.62, 1.045, 0]);
    put(new THREE.PlaneGeometry(0.2, 0.6), "#ffffff", [s * 0.657, 1.0, 0], {
      texture: RUNE,
      dir: [s, 0, 0],
      axis: "z",
    });
    glow(
      put(new THREE.PlaneGeometry(0.2, 0.6), "#ffffff", [s * 0.658, 1.0, 0], { texture: RUNE, dir: [s, 0, 0], axis: "z" }),
      1.2,
    );
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.05, 0.04],
        [0.032, 0.07],
        [0.03, 1.78],
        [0.05, 1.82],
        [0.055, 1.85],
        [0, 1.85],
      ],
      { at: [s * 0.655, 0.12, 0.2], bone: root, segments: 8, color: WOOD_DY },
    );
    for (const y of [0.2, 1.1, 1.78])
      put(new THREE.TorusGeometry(0.036, 0.008, 4, 8), GOLD, [s * 0.655, y, 0.2], { rotation: [90, 0, 0] });
    glow(ball(0.032, GOLD, [s * 0.655, 1.985, 0.2], undefined, 8, 6), 0.4);
    box(0.012, 1.7, 0.012, GOLD_D, [s * 0.658, 1.0, 0.19]);
  }
  box(1.2, 1.85, 0.03, BACK, [0, 1.045, -0.17]);
  for (const y of [0.14, 0.62, 1.07, 1.52, 1.95]) {
    box(1.2, 0.04, 0.36, WOOD_H, [0, y, 0]);
    box(1.17, 0.018, 0.008, GOLD, [0, y, 0.184]);
  }
  box(0.025, 0.41, 0.33, WOOD, [-0.045, 0.845, 0.01]);
  box(0.025, 0.41, 0.33, WOOD, [0.305, 0.845, 0.01]);

  // cornice, dentils, gable and moon
  box(1.5, 0.07, 0.48, WOOD_D, [0, 2.0, 0.02]);
  box(1.56, 0.03, 0.5, WOOD_D, [0, 2.045, 0.02]);
  box(1.5, 0.012, 0.006, GOLD, [0, 2.0, 0.263]);
  box(1.56, 0.01, 0.006, GOLD, [0, 2.06, 0.273]);
  const dent: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 17; k++) dent.push(new THREE.BoxGeometry(0.04, 0.03, 0.03).translate(-0.68 + k * 0.085, 1.935, 0.225));
  const dentMerged = mergeGeometries(dent);
  if (dentMerged) put(dentMerged, WOOD_D, [0, 0, 0]);
  const top: Array<[number, number]> = [
    [-0.7, 0],
    [-0.55, 0.1],
    [-0.3, 0.17],
    [-0.12, 0.28],
    [0, 0.34],
    [0.12, 0.28],
    [0.3, 0.17],
    [0.55, 0.1],
    [0.7, 0],
  ];
  const GY = 2.06;
  b.extrude([...top].reverse(), { at: [0, GY, 0.15], x: [1, 0, 0], thickness: 0.05, color: WOOD, bone: root });
  for (let k = 0; k < top.length - 1; k++)
    b.rod([top[k][0], GY + top[k][1], 0.18], [top[k + 1][0], GY + top[k + 1][1], 0.18], 0.007, GOLD, { bone: root });
  const R = 0.09;
  const rr = 0.075;
  const dd = 0.04;
  const ix = (R * R - rr * rr + dd * dd) / (2 * dd);
  const iy = Math.sqrt(R * R - ix * ix);
  const phi = Math.atan2(iy, ix);
  const moon: Array<[number, number]> = [];
  for (let a = phi; a <= 2 * Math.PI - phi + 1e-6; a += Math.PI / 9) moon.push([R * Math.cos(a), R * Math.sin(a)]);
  for (const deg of [270, 240, 210, 180, 150, 120, 90]) moon.push([dd + rr * Math.cos(deg * DEG), rr * Math.sin(deg * DEG)]);
  const moonUp = moon.map(([x, y]): [number, number] => [-y, x]);
  glow(
    b.extrude(moonUp, { at: [0, GY + 0.19, 0.19], x: [1, 0, 0], thickness: 0.015, color: AMBER, bone: root }),
    1.1,
  );
  glow(ball(0.032, "#fff0b0", [0, GY + 0.2, 0.19], undefined, 8, 6), 1.3);
  for (const [sx, sy] of [
    [-0.3, 0.1],
    [0.3, 0.1],
    [-0.18, 0.2],
    [0.2, 0.22],
    [0.45, 0.06],
    [-0.5, 0.06],
  ])
    oct(0.012, "#fff3b0", [sx, GY + sy, 0.2], 1.3);

  // ---------------------------------------------------------------- shelf 1 (top at 0.16)
  {
    const T = 0.16;
    const topY = stackFlat(-0.37, T, -0.02, [
      [0.38, 0.07, 0.26, "#7b2d8e", -6],
      [0.34, 0.06, 0.24, "#1f6f78", 5],
      [0.3, 0.05, 0.22, "#a8322d", -3],
    ]);
    candle(-0.38, topY, -0.02, 0.12, 0.022, 1);
    const end = row(-0.12, T, 5, 0.3, 0.4, 3, true);
    void end;
    orb(0.46, T, 0.0, 0.1, "#3de0d0");
  }

  // ---------------------------------------------------------------- shelf 2 (top at 0.64)
  {
    const T = 0.64;
    row(-0.57, T, 6, 0.26, 0.36, 8, true);
    const c = 0.13;
    const rows: Array<[number, number[]]> = [
      [0.03, [-0.093, -0.031, 0.031, 0.093]],
      [0.084, [-0.062, 0, 0.062]],
      [0.138, [-0.031, 0.031]],
      [0.192, [0]],
    ];
    let n = 0;
    for (const [dy, xs] of rows)
      for (const dx of xs) {
        const col = n % 2 ? PAPER : PAPER2;
        cyl(0.03, 0.03, 0.22, 8, col, [c + dx, T + dy, -0.04], { rotation: [90, 0, 0] });
        put(new THREE.CircleGeometry(0.03, 10), "#ffffff", [c + dx, T + dy, 0.0715], { texture: SPIRAL });
        if (n % 3 === 0) put(new THREE.TorusGeometry(0.031, 0.004, 4, 10), RED, [c + dx, T + dy, -0.01]);
        n++;
      }
    potion(0.38, T, 0.0, 0.13, PINK);
    potion(0.46, T, 0.02, 0.1, "#7dff9b");
    potion(0.54, T, -0.02, 0.16, "#7aa8ff");
    flatBook(0.46, T, 0.0, 0.0, 0.0, 0.0, "#000", 0, 0);
  }

  // ---------------------------------------------------------------- shelf 3 (top at 1.09)
  {
    const T = 1.09;
    orb(-0.47, T, 0.0, 0.05, "#3de0d0");
    orb(-0.33, T, 0.0, 0.04, "#a17cff", 30);
    orb(-0.2, T, 0.0, 0.05, "#ffb347", -20);
    row(-0.1, T, 6, 0.26, 0.36, 13, true);
    mushroom(0.5, T, 0.02, 0.03, "#ff6fa8");
    mushroom(0.55, T, -0.04, 0.022, "#9b8cff");
    mushroom(0.45, T, -0.05, 0.02, "#6ff3e6");
  }

  // ---------------------------------------------------------------- shelf 4 (top at 1.54)
  {
    const T = 1.54;
    row(-0.57, T, 6, 0.26, 0.34, 21, true);
    hourglass(0.0, T, 0.0);
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.06, 0.04],
        [0.075, 0.1],
        [0.05, 0.17],
        [0.04, 0.2],
        [0.055, 0.22],
        [0, 0.22],
      ],
      { at: [0.2, T, 0.0], bone: root, segments: 10, color: "#2f7f93" },
    );
    put(new THREE.TorusGeometry(0.073, 0.005, 4, 10), GOLD, [0.2, T + 0.1, 0], { rotation: [90, 0, 0] });
    scrollsUp(0.2, T + 0.2, 0.0, [
      [-0.03, 0.14, 0.02],
      [0.04, 0.12, -0.02],
      [0.0, 0.15, 0.03],
      [0.05, 0.1, 0.03],
      [-0.05, 0.1, -0.02],
    ]);
    const y = stackFlat(0.45, T, 0.0, [
      [0.26, 0.05, 0.22, "#c78a2a", 8],
      [0.22, 0.045, 0.2, "#2c4f9e", -6],
    ]);
    cyl(0.025, 0.028, 0.035, 8, "#2a1d4d", [0.5, y + 0.0175, 0.04]);
    cyl(0.018, 0.018, 0.012, 8, GOLD, [0.5, y + 0.041, 0.04]);
    b.rod([0.5, y + 0.04, 0.04], [0.54, y + 0.2, 0.0], 0.0035, "#f4f0ff", { bone: root });
    b.spike([0.505, y + 0.08, 0.035], [0.54, y + 0.2, 0.0], null, 0.014, "#a9d4ff", { bone: root });
  }

  // ---------------------------------------------------------------- crown dressing
  candle(-0.62, 2.075, 0.05, 0.1, 0.02, 1);
  candle(-0.42, 2.075, 0.08, 0.06, 0.018, 1);
  candle(0.3, 2.075, 0.06, 0.08, 0.02, 1);
  candle(0.66, 2.075, 0.08, 0.12, 0.02, 1);
  owl(0.5, 2.075, -0.02);
  flatBook(-0.52, 2.075, 0.0, 0.24, 0.04, 0.18, "#5a2f6e", -10, 2);

  // ---------------------------------------------------------------- floor
  cyl(0.76, 0.76, 0.014, 28, RUG, [0, 0.007, 0.62]);
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.09, 0.015],
      [0.02, 0.04],
      [0.02, 0.28],
      [0.07, 0.3],
      [0.075, 0.32],
      [0, 0.32],
    ],
    { at: [-0.92, 0.014, 0.28], bone: root, segments: 10, color: GOLD_D },
  );
  candle(-0.92, 0.334, 0.28, 0.3, 0.05, 1.8);
  const sy = stackFlat(0.92, 0, 0.05, [
    [0.44, 0.08, 0.3, "#8a1f4a", 10],
    [0.4, 0.07, 0.28, "#2a3d6e", -8],
    [0.36, 0.07, 0.26, "#3f7d3a", 6],
    [0.3, 0.06, 0.24, "#d4562b", -12],
    [0.26, 0.05, 0.2, "#7b2d8e", 4],
  ]);
  orb(0.92, sy, 0.05, 0.055, "#ff8fc0");
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.13, 0.2],
      [0.12, 0.21],
      [0, 0.21],
    ],
    { at: [0.75, 0.014, 0.66], bone: root, segments: 10, color: WEAVE },
  );
  put(new THREE.TorusGeometry(0.125, 0.01, 4, 10), GOLD_D, [0.75, 0.2, 0.66], { rotation: [90, 0, 0] });
  scrollsUp(0.75, 0.2, 0.66, [
    [-0.04, 0.2, 0.03],
    [0.05, 0.22, -0.02],
    [0.0, 0.18, 0.06],
    [0.07, 0.16, 0.05],
    [-0.07, 0.17, -0.03],
    [0.02, 0.24, -0.04],
  ]);
  mushroom(-0.55, 0.014, 0.75, 0.05, "#ff6fa8");
  mushroom(-0.46, 0.014, 0.82, 0.035, "#6ff3e6");

  return b.root;
}
