import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { bezier } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemy bench with glowing elemental potions, an alembic, brass scales, spellbooks, hanging herbs, a lantern and gold-tasselled trim.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P = [number, number, number];
type C = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const R = rng(11);

  // ---------- palette ----------
  const WOOD_X = cel(grain("#a06f48", "#8a5a3a", { size: 0.03, axis: "x", seed: 2 }), "#5e3a4a");
  const WOOD_Y = cel(grain("#a06f48", "#8a5a3a", { size: 0.03, axis: "y", seed: 3 }), "#5e3a4a");
  const DWOOD = cel(grain("#6d4630", "#5c3a2a", { size: 0.025, axis: "x", seed: 4 }), "#3e2438");
  const GOLD = cel("#f6cc5e", "#b9781f");
  const BRASS = cel("#e0a840", "#a8651f");
  const PAPER = cel("#fff1d0", "#e4c79c");
  const GLASS = cel("#e6fbff", "#98c4e6");
  const CORK = cel("#c99a62", "#8f5f46");
  const IRON = cel("#55506e", "#2c2a48");
  const STONE = cel(mottle("#bdb8cc", "#a39fb8", { size: 0.02, seed: 5 }), "#7a76a0");
  const TERRA = cel("#e0794a", "#a8453f");
  const SOIL = cel("#5a3a3a", "#3a2438");
  const TEAL = cel("#2fb7b0", "#1f7a9a");
  const BLUE = cel("#4560b8", "#2c3480");
  const CRIM = cel("#c24858", "#8a2a5a");
  const GREEN = cel("#44a26e", "#26707a");
  const PURP = cel("#8656c4", "#5a3490");
  const BURLAP = cel("#dcba7e", "#a8825a");
  const RED = "#d94b5a";
  const WAX = cel("#fff6e0", "#f0d2a8");

  // ---------- helpers ----------
  const opt = (at: P, rot?: P) => (rot ? { at, rotation: rot } : { at });
  const box = (w: number, h: number, d: number, c: C, at: P, rot?: P) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, opt(at, rot));
  const cyl = (rt: number, rb: number, h: number, seg: number, c: C, at: P, rot?: P) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, opt(at, rot));
  const ball = (r: number, c: C, at: P, sc: P = [1, 1, 1], ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), c, { at, scale: sc });
  const tor = (r: number, t: number, c: C, at: P, rot: P, seg = 12) =>
    b.part(new THREE.TorusGeometry(r, t, 5, seg), c, { at, rotation: rot });
  const lathe = (pts: [number, number][], at: P, c: C, seg = 12) => b.lathe(pts, { at, color: c, segments: seg });

  // ---------- textures ----------
  const LEAF = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 63 C1 42 3 14 16 1 C29 14 31 42 16 63Z" fill="#5fc24c" stroke="#2c7a40" stroke-width="2.4"/><path d="M16 62 V8 M16 44 L8 34 M16 44 L24 34 M16 28 L10 20 M16 28 L22 20" stroke="#2c7a40" stroke-width="2.2" fill="none"/></svg>`,
    { size: 128 },
  );
  const LAVENDER = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 63 V14" stroke="#5d8f4a" stroke-width="2.8"/>${[0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<ellipse cx="${i % 2 ? 11 : 21}" cy="${14 + i * 5}" rx="5" ry="3.6" fill="${i % 2 ? "#a073ea" : "#8656c4"}"/>`,
      )
      .join("")}<ellipse cx="16" cy="7" rx="4.5" ry="5" fill="#b58cf2"/></svg>`,
    { size: 128 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 63 V20" stroke="#3f8f4a" stroke-width="2.8"/><path d="M16 46 Q6 42 5 34 Q14 36 16 46Z M16 38 Q26 34 27 27 Q18 29 16 38Z" fill="#4faa50"/><circle cx="16" cy="14" r="11" fill="#ff8fc0"/><circle cx="16" cy="14" r="5" fill="#ffd54a"/><circle cx="10" cy="10" r="3" fill="#ffb4d6"/><circle cx="22" cy="18" r="3" fill="#ffb4d6"/></svg>`,
    { size: 128 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 60"><path d="M10 0 V12" stroke="#f6cc5e" stroke-width="2.4"/><circle cx="10" cy="14" r="5" fill="#f6cc5e" stroke="#b9781f" stroke-width="1.2"/><path d="M5 20 H15 L17 42 H3Z" fill="#2fb7b0" stroke="#1f7a9a" stroke-width="1.2"/><path d="M4 24 H16 M4 28 H16" stroke="#f6cc5e" stroke-width="1.6"/>${[4, 7, 10, 13, 16]
      .map((x) => `<path d="M${x} 42 V58" stroke="#f6cc5e" stroke-width="1.8"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 40 50"><rect x="2" y="2" width="36" height="46" rx="6" fill="#fff1d0" stroke="#b9781f" stroke-width="2.4"/><circle cx="20" cy="20" r="9" fill="none" stroke="#8656c4" stroke-width="2.4"/><path d="M20 11 L26 28 L12 17 H28 L14 28Z" fill="none" stroke="#2f9a9a" stroke-width="1.8"/><path d="M9 38 H31 M12 43 H28" stroke="#8a5a3a" stroke-width="2.2"/></svg>`,
    { size: 128 },
  );
  const PAGE_L = svg(
    `<svg viewBox="0 0 60 84"><rect width="60" height="84" fill="#fff4da"/><rect x="3" y="3" width="54" height="78" fill="none" stroke="#d6a85a" stroke-width="1"/><circle cx="30" cy="28" r="18" fill="none" stroke="#8a5a3a" stroke-width="1.2"/><circle cx="30" cy="28" r="12" fill="none" stroke="#2f9a9a" stroke-width="1"/><path d="M30 10 L40 40 L16 20 H44 L20 40Z" fill="none" stroke="#c2403f" stroke-width="1"/>${[56, 61, 66, 71, 76]
      .map((y) => `<path d="M8 ${y} H${48 + (y % 3) * 3}" stroke="#8a5a3a" stroke-width="1.4"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 60 84"><rect width="60" height="84" fill="#fff4da"/><rect x="3" y="3" width="54" height="78" fill="none" stroke="#d6a85a" stroke-width="1"/>${[8, 13, 18, 23, 28, 33]
      .map((y) => `<path d="M8 ${y} H${46 + (y % 4) * 2}" stroke="#8a5a3a" stroke-width="1.4"/>`)
      .join("")}<path d="M30 70 V46" stroke="#3f8f4a" stroke-width="1.6"/><path d="M30 60 Q20 56 18 48 Q28 50 30 60Z M30 54 Q40 50 42 43 Q32 45 30 54Z" fill="#5fc24c"/><circle cx="30" cy="42" r="5" fill="#ff8fc0" stroke="#c24858" stroke-width="0.8"/><path d="M8 76 H50" stroke="#8a5a3a" stroke-width="1.4"/></svg>`,
    { size: 256 },
  );
  const diamonds = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((i) => `<path d="M${14 + i * 9} 18 L${18.5 + i * 9} 11 L${23 + i * 9} 18 L${18.5 + i * 9} 25Z" fill="#f6cc5e" stroke="#b9781f" stroke-width="0.6"/>`)
    .join("");
  const RUNNER = svg(
    `<svg viewBox="0 0 100 36"><rect width="100" height="36" fill="#2fb7b0"/><rect x="2" y="2" width="96" height="32" fill="none" stroke="#f6cc5e" stroke-width="1.6"/><rect x="5" y="5" width="90" height="26" fill="none" stroke="#1f7a9a" stroke-width="1"/>${diamonds}<path d="M0 0 L9 18 L0 36Z M100 0 L91 18 L100 36Z" fill="#1f7a9a"/><circle cx="6" cy="18" r="2" fill="#f6cc5e"/><circle cx="94" cy="18" r="2" fill="#f6cc5e"/></svg>`,
    { size: 512 },
  );

  // ---------- table ----------
  const Y0 = 0.9;
  box(1.64, 0.06, 0.74, WOOD_X, [0, 0.87, 0]);
  box(1.52, 0.1, 0.62, DWOOD, [0, 0.79, 0]);
  box(1.5, 0.004, 0.012, GOLD, [0, 0.9005, 0.32]);
  box(1.5, 0.004, 0.012, GOLD, [0, 0.9005, -0.32]);
  box(0.012, 0.004, 0.64, GOLD, [0.78, 0.9005, 0]);
  box(0.012, 0.004, 0.64, GOLD, [-0.78, 0.9005, 0]);
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      box(0.07, 0.84, 0.07, WOOD_Y, [sx * 0.7, 0.42, sz * 0.28]);
      box(0.082, 0.03, 0.082, GOLD, [sx * 0.7, 0.015, sz * 0.28]);
      box(0.078, 0.014, 0.078, GOLD, [sx * 0.7, 0.62, sz * 0.28]);
      box(0.078, 0.014, 0.078, GOLD, [sx * 0.7, 0.76, sz * 0.28]);
      ball(0.012, GOLD, [sx * 0.78, 0.9, sz * 0.36]);
    }
    // side stretchers and drawers
    box(0.03, 0.04, 0.56, DWOOD, [sx * 0.7, 0.12, 0]);
    box(0.46, 0.08, 0.015, WOOD_X, [sx * 0.24, 0.79, 0.3175]);
    box(0.49, 0.092, 0.01, GOLD, [sx * 0.24, 0.79, 0.3125]);
    ball(0.016, GOLD, [sx * 0.24, 0.79, 0.336]);
    box(0.05, 0.02, 0.003, GOLD, [sx * 0.24, 0.768, 0.326]);
    box(0.012, 0.012, 0.003, INK, [sx * 0.24, 0.768, 0.3275]);
  }
  box(1.4, 0.03, 0.56, WOOD_X, [0, 0.22, 0]);
  box(1.4, 0.012, 0.01, GOLD, [0, 0.225, 0.285]);
  box(1.4, 0.03, 0.03, DWOOD, [0, 0.12, 0.28]);
  box(1.4, 0.03, 0.03, DWOOD, [0, 0.12, -0.28]);
  b.part(new THREE.PlaneGeometry(0.76, 0.27), "#ffffff", {
    at: [0.02, 0.9035, 0.2],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: RUNNER,
  });

  // ---------- rack above table ----------
  for (const sx of [1, -1]) {
    box(0.05, 0.9, 0.05, DWOOD, [sx * 0.74, 1.34, -0.3]);
    ball(0.032, GOLD, [sx * 0.74, 1.8, -0.3], [1, 1, 1], 8, 6);
    box(0.062, 0.02, 0.062, GOLD, [sx * 0.74, 1.2, -0.3]);
    box(0.062, 0.02, 0.062, GOLD, [sx * 0.74, 1.74, -0.3]);
    box(0.062, 0.02, 0.062, GOLD, [sx * 0.74, 0.92, -0.3]);
    b.rod([sx * 0.74, 1.15, -0.3], [sx * 0.62, 1.04, -0.3], 0.012, DWOOD);
  }
  box(1.64, 0.04, 0.05, DWOOD, [0, 1.75, -0.3]);
  box(1.56, 0.025, 0.22, WOOD_X, [0, 1.2, -0.3]);
  box(1.56, 0.012, 0.008, GOLD, [0, 1.2, -0.19]);
  for (const bx of [-0.5, 0, 0.5]) box(0.03, 0.04, 0.2, DWOOD, [bx, 1.165, -0.3]);
  glow(
    b.rod([-0.55, 1.77, -0.3], [-0.45, 1.77, -0.3], 0.004, "#7dffd8", { caps: "flat" }),
    1,
  );

  // hanging herb bundles
  for (const bx of [-0.64, -0.52, 0.52, 0.64]) {
    const stems: P[] = [];
    for (let i = 0; i < 5; i++) {
      const dx = (i - 2) * 0.012;
      const dz = ((i % 2) - 0.5) * 0.02;
      const end: P = [bx + dx, 1.5 + (i % 3) * 0.015, -0.3 + dz];
      stems.push(end);
      b.rod([bx, 1.73, -0.3], end, 0.0035, "#5b8f3e", { caps: "flat" });
    }
    cyl(0.014, 0.012, 0.016, 6, RED, [bx, 1.69, -0.3]);
    tor(0.012, 0.003, GOLD, [bx, 1.72, -0.3], [90, 0, 0], 8);
    const fr = [];
    for (const e of stems) {
      fr.push(frame([e[0], e[1] + 0.12, e[2]], [0, 1, 0]));
      fr.push(frame([e[0], e[1] + 0.04, e[2]], [0, 1, 0]));
    }
    b.cards(fr, [LEAF, LEAVES2(), FLOWER], { size: [0.05, 0.13], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.25, spin: 90, rng: R });
  }
  function LEAVES2() {
    return LAVENDER;
  }

  // tassels
  const tasselFr = [
    frame([0.7, 1.2, -0.19], [0, 1, 0]),
    frame([-0.7, 1.2, -0.19], [0, 1, 0]),
    frame([0.8, 0.84, 0.355], [0, 1, 0]),
    frame([-0.8, 0.84, 0.355], [0, 1, 0]),
  ];
  b.cards(tasselFr, TASSEL, { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], cross: true });

  // hanging lantern
  b.rod([0, 1.73, -0.3], [0, 1.68, -0.3], 0.004, GOLD);
  tor(0.02, 0.004, GOLD, [0, 1.675, -0.3], [0, 0, 0], 8);
  lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.03, 0.045],
      [0.01, 0.06],
      [0, 0.06],
    ],
    [0, 1.6, -0.3],
    GOLD,
    8,
  );
  glow(b.part(new THREE.BoxGeometry(0.09, 0.12, 0.09), "#ffd479", { at: [0, 1.54, -0.3] }), 1.3);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) cyl(0.005, 0.005, 0.13, 5, GOLD, [sx * 0.047, 1.54, -0.3 + sz * 0.047]);
  box(0.12, 0.02, 0.12, GOLD, [0, 1.47, -0.3]);
  cyl(0.02, 0.01, 0.025, 6, GOLD, [0, 1.45, -0.3]);

  // ---------- books ----------
  function book(ox: number, oy: number, oz: number, yaw: number, w: number, d: number, h: number, cover: C) {
    const a = (yaw * Math.PI) / 180;
    const L = (lx: number, ly: number, lz: number): P => [
      ox + lx * Math.cos(a) + lz * Math.sin(a),
      oy + ly,
      oz - lx * Math.sin(a) + lz * Math.cos(a),
    ];
    const rot: P = [0, yaw, 0];
    box(w, h, d, cover, L(0, h / 2, 0), rot);
    box(w + 0.006, h - 0.016, d - 0.002, PAPER, L(0, h / 2, -0.006), rot);
    for (const i of [-1, 0, 1]) box(0.012, h + 0.004, 0.005, GOLD, L(i * w * 0.3, h / 2, d / 2 + 0.001), rot);
    box(w * 0.2, h * 0.5, 0.004, GOLD, L(0, h / 2, d / 2 + 0.004), rot);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.03, 0.004, 0.03, GOLD, L(sx * (w / 2 - 0.016), h + 0.001, sz * (d / 2 - 0.016)), rot);
    cyl(0.032, 0.032, 0.004, 10, GOLD, L(0, h + 0.002, -0.01), rot);
    cyl(0.018, 0.018, 0.006, 8, cover, L(0, h + 0.003, -0.01), rot);
    return h;
  }
  let sy = Y0;
  const stack: [number, number, number, number, C][] = [
    [0.26, 0.19, 0.045, BLUE],
    [0.23, 0.17, 0.05, CRIM],
    [0.21, 0.16, 0.035, GREEN],
    [0.17, 0.13, 0.045, PURP],
  ];
  const yaws = [0, 14, -9, 22];
  stack.forEach(([w, d, h, c], i) => {
    sy += book(0.62, sy, -0.05, yaws[i]!, w, d, h, c);
  });
  // candle
  lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.04, 0.006],
      [0.02, 0.012],
      [0, 0.012],
    ],
    [0.62, sy, -0.05],
    GOLD,
    8,
  );
  cyl(0.02, 0.02, 0.07, 8, WAX, [0.62, sy + 0.047, -0.05]);
  ball(0.008, WAX, [0.64, sy + 0.07, -0.03], [1, 1.6, 1], 6, 4);
  b.rod([0.62, sy + 0.082, -0.05], [0.62, sy + 0.09, -0.05], 0.002, IRON, { caps: "flat" });
  glow(b.spike([0.62, sy + 0.09, -0.05], [0, 1, 0], 0.05, 0.014, "#ffb83d", { sides: 6 }), 1.4);
  glow(b.spike([0.62, sy + 0.09, -0.05], [0, 1, 0], 0.025, 0.007, "#fff3b0", { sides: 6 }), 1.6);

  // open book on the runner
  const Yb = 0.9035;
  box(0.38, 0.018, 0.26, BLUE, [0.1, Yb + 0.009, 0.15]);
  box(0.4, 0.006, 0.006, GOLD, [0.1, Yb + 0.004, 0.282]);
  box(0.4, 0.006, 0.006, GOLD, [0.1, Yb + 0.004, 0.018]);
  for (const sx of [1, -1]) {
    box(0.17, 0.02, 0.23, PAPER, [0.1 + sx * 0.095, Yb + 0.028, 0.15]);
    box(0.17, 0.003, 0.002, "#d4a460", [0.1 + sx * 0.095, Yb + 0.02, 0.266]);
    box(0.17, 0.003, 0.002, "#d4a460", [0.1 + sx * 0.095, Yb + 0.03, 0.266]);
    b.part(new THREE.PlaneGeometry(0.15, 0.21), "#ffffff", {
      at: [0.1 + sx * 0.095, Yb + 0.0385, 0.15],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: sx > 0 ? PAGE_R : PAGE_L,
    });
    for (const sz of [1, -1])
      box(0.03, 0.004, 0.03, GOLD, [0.1 + sx * 0.18, Yb + 0.0195, 0.15 + sz * 0.115]);
  }
  box(0.02, 0.024, 0.25, BLUE, [0.1, Yb + 0.026, 0.15]);
  box(0.01, 0.002, 0.15, RED, [0.115, Yb + 0.04, 0.23]);
  b.rod([0.115, Yb + 0.04, 0.3], [0.118, Yb + 0.02, 0.33], 0.004, RED, { caps: "flat" });

  // upright books on the shelf
  const shelfBooks: [number, number, number, C][] = [
    [-0.66, 0.035, 0.2, BLUE],
    [-0.62, 0.04, 0.18, CRIM],
    [-0.575, 0.03, 0.21, GREEN],
    [-0.535, 0.038, 0.17, PURP],
    [-0.495, 0.03, 0.19, TEAL],
  ];
  for (const [x, w, h, c] of shelfBooks) {
    box(w, h, 0.14, c, [x, 1.2125 + h / 2, -0.3]);
    box(w - 0.008, 0.003, 0.13, PAPER, [x, 1.2125 + h + 0.001, -0.305]);
    box(w + 0.002, 0.012, 0.004, GOLD, [x, 1.2125 + h - 0.03, -0.228]);
    box(w + 0.002, 0.012, 0.004, GOLD, [x, 1.2125 + 0.03, -0.228]);
    box(w * 0.7, 0.04, 0.004, GOLD, [x, 1.2125 + h / 2, -0.228]);
  }

  // ---------- potions ----------
  function potion(x: number, y: number, z: number, kind: "round" | "conical" | "vial" | "hex", col: string) {
    if (kind === "round") {
      glow(ball(0.065, col, [x, y + 0.065, z], [1, 1, 1], 10, 8));
      cyl(0.02, 0.026, 0.06, 8, GLASS, [x, y + 0.16, z]);
      cyl(0.028, 0.028, 0.012, 8, GOLD, [x, y + 0.19, z]);
      cyl(0.02, 0.017, 0.03, 8, CORK, [x, y + 0.21, z]);
      tor(0.026, 0.004, RED, [x, y + 0.15, z], [90, 0, 0], 8);
      ball(0.012, "#ffffff", [x - 0.03, y + 0.09, z + 0.045], [0.5, 1.4, 0.3], 6, 4);
    } else if (kind === "conical") {
      glow(
        lathe(
          [
            [0, 0],
            [0.075, 0],
            [0.07, 0.012],
            [0.03, 0.1],
            [0, 0.1],
          ],
          [x, y, z],
          col,
          10,
        ),
      );
      lathe(
        [
          [0, 0.1],
          [0.03, 0.1],
          [0.022, 0.14],
          [0.022, 0.19],
          [0.03, 0.195],
          [0.03, 0.205],
          [0, 0.205],
        ],
        [x, y, z],
        GLASS,
        10,
      );
      cyl(0.02, 0.017, 0.03, 8, CORK, [x, y + 0.22, z]);
      tor(0.032, 0.004, GOLD, [x, y + 0.18, z], [90, 0, 0], 8);
      ball(0.01, "#ffffff", [x - 0.03, y + 0.05, z + 0.04], [0.5, 1.5, 0.3], 6, 4);
    } else if (kind === "vial") {
      glow(cyl(0.03, 0.03, 0.12, 8, col, [x, y + 0.06, z]));
      cyl(0.015, 0.03, 0.03, 8, GLASS, [x, y + 0.135, z]);
      cyl(0.015, 0.015, 0.04, 8, GLASS, [x, y + 0.17, z]);
      cyl(0.016, 0.013, 0.025, 8, CORK, [x, y + 0.2, z]);
      b.part(new THREE.PlaneGeometry(0.04, 0.05), "#ffffff", { at: [x, y + 0.058, z + 0.0315], dir: [0, 0, 1], axis: "z", texture: LABEL });
    } else {
      glow(cyl(0.04, 0.045, 0.12, 6, col, [x, y + 0.06, z]));
      cyl(0.0475, 0.0475, 0.012, 6, GOLD, [x, y + 0.012, z]);
      cyl(0.02, 0.04, 0.04, 6, GLASS, [x, y + 0.14, z]);
      cyl(0.02, 0.02, 0.05, 6, GLASS, [x, y + 0.185, z]);
      ball(0.026, GOLD, [x, y + 0.235, z], [1, 1, 1], 8, 6);
      b.part(new THREE.PlaneGeometry(0.04, 0.05), "#ffffff", { at: [x, y + 0.06, z + 0.0425], dir: [0, 0, 1], axis: "z", texture: LABEL });
    }
  }
  potion(0.14, Y0, -0.24, "round", "#ff6fa8");
  potion(0.25, Y0, -0.24, "vial", "#3de0ff");
  potion(0.36, Y0, -0.24, "hex", "#ffb83d");
  potion(0.46, Y0, -0.24, "conical", "#b07bff");
  potion(0.62, Y0, -0.27, "vial", "#8dff6a");
  potion(-0.04, Y0, -0.12, "conical", "#7dffd3");
  potion(0.4, 0.235, 0.05, "round", "#ff9a4a");
  potion(0.18, 0.235, -0.05, "hex", "#6ae6ff");
  potion(-0.5, 0.235, 0.08, "conical", "#ff6fa8");

  // test tube rack
  const tubeCols = ["#ff6fa8", "#3de0ff", "#8dff6a", "#ffd24a", "#b07bff"];
  tubeCols.forEach((col, i) => {
    const x = -0.28 + i * 0.044;
    glow(cyl(0.013, 0.013, 0.07, 6, col, [x, Y0 + 0.037, 0.3]));
    cyl(0.013, 0.013, 0.07, 6, GLASS, [x, Y0 + 0.107, 0.3]);
  });
  box(0.24, 0.01, 0.05, DWOOD, [-0.18, Y0 + 0.055, 0.3]);
  box(0.24, 0.01, 0.05, DWOOD, [-0.18, Y0 + 0.105, 0.3]);
  for (const sx of [1, -1]) box(0.012, 0.12, 0.05, WOOD_Y, [-0.18 + sx * 0.12, Y0 + 0.06, 0.3]);

  // ---------- alembic ----------
  const ax = -0.25;
  const az = -0.12;
  lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.025, 0.04],
      [0.03, 0.08],
      [0, 0.08],
    ],
    [ax, Y0, az],
    BRASS,
    10,
  );
  glow(b.spike([ax, Y0 + 0.08, az], [0, 1, 0], 0.07, 0.02, "#ffb347", { sides: 6 }), 1.4);
  glow(b.spike([ax, Y0 + 0.08, az], [0, 1, 0], 0.035, 0.01, "#fff0a0", { sides: 6 }), 1.6);
  for (let k = 0; k < 3; k++) {
    const an = (k * 2 * Math.PI) / 3 + 0.5;
    b.rod([ax + 0.085 * Math.cos(an), Y0, az + 0.085 * Math.sin(an)], [ax + 0.05 * Math.cos(an), Y0 + 0.14, az + 0.05 * Math.sin(an)], 0.005, IRON);
  }
  tor(0.05, 0.005, IRON, [ax, Y0 + 0.14, az], [90, 0, 0], 12);
  glow(ball(0.075, "#7dff8a", [ax, Y0 + 0.22, az], [1, 1, 1], 10, 8));
  cyl(0.02, 0.026, 0.07, 8, GLASS, [ax, Y0 + 0.33, az]);
  cyl(0.028, 0.028, 0.012, 8, GOLD, [ax, Y0 + 0.37, az]);
  tor(0.078, 0.004, GOLD, [ax, Y0 + 0.22, az], [90, 0, 0], 12);
  b.sweep(
    bezier([ax, Y0 + 0.38, az], [ax + 0.06, Y0 + 0.5, az], [ax + 0.17, Y0 + 0.42, az], [ax + 0.21, Y0 + 0.215, az]),
    0.009,
    GLASS,
    { sides: 6 },
  );
  for (const t of [0.0, 0.5, 0.98]) {
    ball(0.016, GOLD, [ax + 0.0 + t * 0.21 * 0.9, Y0 + 0.38 - (t > 0.4 ? (t === 0.5 ? -0.03 : 0.16) : 0), az], [1, 0.6, 1], 6, 4);
  }
  glow(ball(0.006, "#7dff8a", [ax + 0.21, Y0 + 0.2, az], [1, 1.5, 1], 6, 4));

  // ---------- scales ----------
  const sx0 = -0.6;
  const sz0 = -0.1;
  lathe(
    [
      [0, 0],
      [0.08, 0],
      [0.075, 0.02],
      [0.03, 0.05],
      [0.02, 0.1],
      [0.016, 0.34],
      [0.026, 0.355],
      [0, 0.36],
    ],
    [sx0, Y0, sz0],
    BRASS,
    8,
  );
  tor(0.026, 0.006, GOLD, [sx0, Y0 + 0.14, sz0], [90, 0, 0], 8);
  box(0.3, 0.012, 0.018, GOLD, [sx0, Y0 + 0.36, sz0]);
  for (const s of [1, -1]) {
    ball(0.012, GOLD, [sx0 + s * 0.15, Y0 + 0.36, sz0], [1, 1, 1], 6, 4);
    const pc: P = [sx0 + s * 0.15, Y0 + 0.16, sz0];
    lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.065, 0.03],
        [0.06, 0.032],
        [0.045, 0.012],
        [0, 0.012],
      ],
      pc,
      BRASS,
      10,
    );
    for (let k = 0; k < 3; k++) {
      const an = (k * 2 * Math.PI) / 3;
      b.rod([sx0 + s * 0.15, Y0 + 0.355, sz0], [pc[0] + 0.06 * Math.cos(an), pc[1] + 0.03, pc[2] + 0.06 * Math.sin(an)], 0.0018, GOLD, { caps: "flat" });
    }
  }
  glow(b.part(new THREE.DodecahedronGeometry(0.022, 0), "#ff5a7a", { at: [sx0 + 0.15, Y0 + 0.197, sz0] }), 1.2);
  [0.026, 0.02, 0.014].forEach((r, i) => {
    cyl(r, r, 0.012, 8, GOLD, [sx0 - 0.15, Y0 + 0.178 + i * 0.012, sz0]);
  });
  for (let i = 0; i < 3; i++) {
    const r = 0.016 + i * 0.006;
    cyl(r, r, 0.018, 8, GOLD, [-0.74 + i * 0.045, Y0 + 0.009, 0.1 + (i % 2) * 0.02]);
    ball(0.006, GOLD, [-0.74 + i * 0.045, Y0 + 0.021, 0.1 + (i % 2) * 0.02], [1, 1, 1], 5, 4);
  }

  // ---------- mortar and pestle ----------
  const mx = -0.46;
  const mz = 0.2;
  lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.065, 0.02],
      [0.075, 0.06],
      [0.07, 0.07],
      [0.06, 0.065],
      [0.04, 0.03],
      [0, 0.03],
    ],
    [mx, Y0, mz],
    STONE,
    10,
  );
  tor(0.07, 0.004, GOLD, [mx, Y0 + 0.062, mz], [90, 0, 0], 10);
  glow(cyl(0.045, 0.045, 0.006, 10, "#8fd16a", [mx, Y0 + 0.047, mz]), 0.7);
  b.rod([mx + 0.01, Y0 + 0.04, mz], [mx + 0.06, Y0 + 0.2, mz + 0.03], [0.011, 0.017], STONE);
  ball(0.017, STONE, [mx + 0.06, Y0 + 0.2, mz + 0.03], [1, 1, 1], 8, 6);
  const mdirs: P[] = [];
  const mfr = [];
  for (let k = 0; k < 6; k++) {
    const an = (k * 2 * Math.PI) / 6;
    mdirs.push([Math.cos(an), 0, Math.sin(an)]);
    mfr.push(frame([mx + 0.02 * Math.cos(an), Y0 + 0.05, mz + 0.02 * Math.sin(an)], [0, 1, 0]));
  }
  b.cards(mfr, [LEAF, LAVENDER], { size: [0.04, 0.09], lean: 55, bend: 25, flow: (_f, i) => mdirs[i]!, rng: R, vary: 0.2 });

  // ---------- potted plant ----------
  const px = -0.68;
  const pz = 0.2;
  lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.055, 0.01],
      [0.065, 0.1],
      [0.07, 0.105],
      [0.07, 0.115],
      [0.06, 0.115],
      [0, 0.1],
    ],
    [px, Y0, pz],
    TERRA,
    10,
  );
  tor(0.064, 0.005, GOLD, [px, Y0 + 0.085, pz], [90, 0, 0], 10);
  tor(0.059, 0.004, GOLD, [px, Y0 + 0.03, pz], [90, 0, 0], 10);
  cyl(0.058, 0.058, 0.008, 10, SOIL, [px, Y0 + 0.108, pz]);
  const pdirs: P[] = [];
  const pfr = [];
  for (let k = 0; k < 9; k++) {
    const an = (k * 2 * Math.PI) / 9;
    pdirs.push([Math.cos(an), 0, Math.sin(an)]);
    pfr.push(frame([px + 0.02 * Math.cos(an), Y0 + 0.11, pz + 0.02 * Math.sin(an)], [0, 1, 0]));
  }
  b.cards(pfr, [LEAF, FLOWER], { size: [0.055, 0.17], lean: 40, bend: 25, flow: (_f, i) => pdirs[i]!, rng: R, vary: 0.2 });
  for (let k = 0; k < 3; k++) {
    const dx = (k - 1) * 0.025;
    b.rod([px + dx * 0.3, Y0 + 0.11, pz], [px + dx, Y0 + 0.27 + k * 0.01, pz + (k % 2) * 0.02], 0.004, "#3f8f4a", { caps: "flat" });
    glow(ball(0.014, k === 1 ? "#ffd966" : "#ff9ed0", [px + dx, Y0 + 0.28 + k * 0.01, pz + (k % 2) * 0.02], [1, 1, 1], 6, 4), 0.8);
  }

  // ---------- inkwell, quill, scroll, crystals ----------
  const ix = 0.62;
  const iz = 0.25;
  lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.042, 0.03],
      [0.03, 0.05],
      [0.02, 0.055],
      [0.02, 0.06],
      [0, 0.06],
    ],
    [ix, Y0, iz],
    IRON,
    8,
  );
  tor(0.042, 0.004, GOLD, [ix, Y0 + 0.03, iz], [90, 0, 0], 8);
  const q0: P = [ix, Y0 + 0.06, iz];
  const q1: P = [ix - 0.07, Y0 + 0.25, iz + 0.05];
  b.rod(q0, q1, 0.0028, PAPER);
  const qd = new THREE.Vector3(q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]).normalize();
  b.extrude(
    [
      [0, 0],
      [0.05, 0.022],
      [0.14, 0.004, "sharp"],
      [0.05, -0.016],
    ],
    {
      at: [q0[0] + (q1[0] - q0[0]) * 0.35, q0[1] + (q1[1] - q0[1]) * 0.35, q0[2] + (q1[2] - q0[2]) * 0.35],
      x: [qd.x, qd.y, qd.z],
      y: [0, 0, 1],
      thickness: 0.002,
      smoothing: 1,
      color: cel("#8fe8e0", "#4a9fc0"),
    },
  );
  // scroll
  cyl(0.02, 0.02, 0.2, 8, PAPER, [0.42, Y0 + 0.02, 0.33], [0, 0, 90]);
  cyl(0.013, 0.013, 0.03, 6, WOOD_Y, [0.3, Y0 + 0.02, 0.33], [0, 0, 90]);
  cyl(0.013, 0.013, 0.03, 6, WOOD_Y, [0.54, Y0 + 0.02, 0.33], [0, 0, 90]);
  ball(0.012, GOLD, [0.28, Y0 + 0.02, 0.33]);
  ball(0.012, GOLD, [0.56, Y0 + 0.02, 0.33]);
  tor(0.022, 0.0035, RED, [0.42, Y0 + 0.02, 0.33], [0, 90, 0], 8);
  b.cards([frame([0.42, Y0 + 0.002, 0.355], [0, 1, 0])], FLOWER, { size: [0.03, 0.05], lean: 90, flow: [0, 0, 1], mirror: true });
  // crystals
  b.part(new THREE.DodecahedronGeometry(0.05, 0), STONE, { at: [0.38, Y0 + 0.02, -0.02], scale: [1, 0.55, 1] });
  const crys: [P, P, number, number, string][] = [
    [[0.38, Y0 + 0.03, -0.02], [0, 1, 0], 0.15, 0.022, "#6ae6ff"],
    [[0.4, Y0 + 0.03, -0.01], [0.5, 1, 0.2], 0.1, 0.016, "#b4f7ff"],
    [[0.36, Y0 + 0.03, -0.03], [-0.5, 1, 0.1], 0.11, 0.017, "#4aa8ff"],
    [[0.38, Y0 + 0.03, 0.0], [0.1, 1, 0.6], 0.08, 0.013, "#9ff0ff"],
  ];
  for (const [base, dir, len, r, col] of crys) glow(b.spike(base, dir, len, r, col, { sides: 6 }), 1.1);

  // ---------- jars on the shelf ----------
  const jarCols = ["#6cae4a", "#e0584a", "#5ad0ff", "#d9a24a", "#9a6be0", "#6cae4a"];
  jarCols.forEach((col, i) => {
    const x = -0.34 + i * 0.115;
    const lit = i === 2 || i === 4;
    const body = lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.045, 0.01],
        [0.045, 0.09],
        [0.035, 0.1],
        [0.03, 0.11],
        [0, 0.11],
      ],
      [x, 1.2125, -0.3],
      col,
      10,
    );
    if (lit) glow(body, 1);
    cyl(0.034, 0.034, 0.022, 8, GOLD, [x, 1.2125 + 0.121, -0.3]);
    ball(0.01, GOLD, [x, 1.2125 + 0.14, -0.3], [1, 1, 1], 6, 4);
    b.part(new THREE.PlaneGeometry(0.045, 0.056), "#ffffff", { at: [x, 1.2125 + 0.052, -0.3 + 0.0465], dir: [0, 0, 1], axis: "z", texture: LABEL });
  });
  // decanter on the shelf
  glow(
    lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.06, 0.05],
        [0.03, 0.12],
        [0.02, 0.2],
        [0, 0.2],
      ],
      [0.55, 1.2125, -0.3],
      "#ff9a4a",
      8,
    ),
    0.9,
  );
  cyl(0.026, 0.02, 0.014, 8, GOLD, [0.55, 1.2125 + 0.207, -0.3]);
  ball(0.024, GOLD, [0.55, 1.2125 + 0.24, -0.3], [1, 1, 1], 8, 6);
  glow(ball(0.05, "#5ad0ff", [0.66, 1.2125 + 0.05, -0.3], [1, 1, 1], 8, 6), 1);
  cyl(0.016, 0.02, 0.05, 8, GLASS, [0.66, 1.2125 + 0.115, -0.3]);
  cyl(0.018, 0.014, 0.025, 8, CORK, [0.66, 1.2125 + 0.153, -0.3]);

  // ---------- under the table ----------
  box(0.34, 0.24, 0.3, WOOD_X, [-0.52, 0.235 + 0.12, -0.1]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.03, 0.25, 0.03, DWOOD, [-0.52 + sx * 0.155, 0.235 + 0.125, -0.1 + sz * 0.135]);
  box(0.36, 0.03, 0.32, DWOOD, [-0.52, 0.235 + 0.255, -0.1]);
  box(0.3, 0.02, 0.01, GOLD, [-0.52, 0.235 + 0.18, 0.056]);
  ball(0.012, GOLD, [-0.52, 0.235 + 0.12, 0.062]);
  lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.13, 0.08],
      [0.12, 0.18],
      [0.07, 0.26],
      [0.05, 0.3],
      [0.07, 0.34],
      [0.03, 0.36],
      [0, 0.36],
    ],
    [0.0, 0.235, 0.05],
    BURLAP,
    10,
  );
  tor(0.052, 0.007, "#8a5a2a", [0, 0.235 + 0.3, 0.05], [90, 0, 0], 8);
  lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.1, 0.08],
      [0.095, 0.17],
      [0.05, 0.24],
      [0.04, 0.3],
      [0.05, 0.31],
      [0, 0.31],
    ],
    [0.5, 0.235, 0.0],
    TEAL,
    10,
  );
  tor(0.097, 0.006, GOLD, [0.5, 0.235 + 0.12, 0.0], [90, 0, 0], 10);
  tor(0.05, 0.006, GOLD, [0.5, 0.235 + 0.27, 0.0], [90, 0, 0], 8);
  b.part(new THREE.TorusGeometry(0.05, 0.01, 5, 8, Math.PI), TEAL, { at: [0.595, 0.235 + 0.17, 0], rotation: [0, 0, -90] });
  box(0.04, 0.012, 0.012, GOLD, [0.5, 0.235 + 0.12, 0.092]);

  return b.root;
}
