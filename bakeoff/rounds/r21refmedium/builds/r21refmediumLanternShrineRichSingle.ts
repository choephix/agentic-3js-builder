// Roadside shrine: red torii with a straw rope and paper lanterns, a small tiled hokora on stone steps, stone lanterns,
// an offering table, maples, moss and flagstones. Genshin-style cel shading (kits/toon) with glowing lamp light (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, noise, paint, patches } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Lantern Shrine",
  description:
    "A roadside shrine: a lacquered red torii with a straw rope, shide and hanging paper lanterns, a tiled hokora on mossy steps, stone lanterns, an offering table with tangerines, rice, incense and flowers, maples and flagstones.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const R = rng(7);
  const root = b.joint("root", { at: [0, 0, 0] });
  type Jt = typeof root;

  // ---------------------------------------------------------------- helpers
  const P = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(g, color, { bone: root, ...o });
  const box = (color: Fill, w: number, h: number, d: number, x: number, y: number, z: number, o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (
    color: Fill,
    rt: number,
    rb: number,
    h: number,
    seg: number,
    x: number,
    y: number,
    z: number,
    o: PartOptions = {},
  ) => P(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], ...o });
  const ball = (
    color: Fill,
    r: number,
    x: number,
    y: number,
    z: number,
    scale: [number, number, number] = [1, 1, 1],
    o: PartOptions = {},
  ) => P(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], scale, ...o });
  const tor = (
    color: Fill,
    rad: number,
    r: number,
    x: number,
    y: number,
    z: number,
    rot: [number, number, number] = [90, 0, 0],
    bone: Jt = root,
    rs = 4,
    ts = 14,
  ) => P(new THREE.TorusGeometry(rad, r, rs, ts), color, { at: [x, y, z], rotation: rot, bone });
  const turn = (
    pts: OutlinePoint[],
    color: Fill,
    x: number,
    y: number,
    z: number,
    segments = 12,
    bone: Jt = root,
  ) => b.lathe(pts, { at: [x, y, z], color, bone, segments });

  // ---------------------------------------------------------------- palette (cel paints)
  const wear = (axis: "x" | "y" | "z", a: string, c: string, seed: number) => {
    const base = grain(a, c, { size: 0.05, axis, seed });
    return cel(paint((p) => (noise(p, 0.07, seed + 5) > 0.77 ? "#b4623f" : base)));
  };
  const RED_Y = wear("y", "#c8382b", "#b52e26", 1);
  const RED_X = wear("x", "#c8382b", "#b52e26", 2);
  const BLACK_Y = cel(grain("#2a2733", "#37323f", { size: 0.05, axis: "y", seed: 3 }));
  const BLACK_X = cel(grain("#2a2733", "#37323f", { size: 0.05, axis: "x", seed: 4 }));
  const LACQUER = cel("#2e2530", "#1c1722");
  const GOLD = cel("#ecbc4f", "#b97a2c");
  const WOODD_Y = cel(grain("#8a5c38", "#774b2d", { size: 0.035, axis: "y", seed: 5 }));
  const WOODD_X = cel(grain("#8a5c38", "#774b2d", { size: 0.035, axis: "x", seed: 6 }));
  const WOODL = cel(grain("#d2a460", "#bd8c4c", { size: 0.03, axis: "x", seed: 8 }));
  const CREAM = cel("#f4e8d0", "#d9c7b4");
  const WHITE = cel("#f8f5ee", "#cfcbe0");
  const STRAW = cel("#d2aa5e", "#9c7238");
  const BARK = cel("#5c3d30", "#3f2a2e");
  const MOSS = mottle("#7fa83d", "#5f8c37", { size: 0.1, seed: 5 });
  const MOSS_C = cel("#78a83c", "#4a7d37");
  const STONE_LIT = mottle("#a8a79d", "#8f918a", { size: 0.2, seed: 3 });
  const STONE = cel(paint((p, n) => (n.y > 0.25 && noise(p, 0.22, 11) > 0.52 - 0.1 * n.y ? MOSS : STONE_LIT)));
  const STONE_D = cel(mottle("#8d8c86", "#7a7b78", { size: 0.15, seed: 9 }));
  const ROCK = cel(
    paint((p, n) =>
      n.y > 0.3 && noise(p, 0.25, 21) > 0.46 ? MOSS : mottle("#9a9a94", "#7f817f", { size: 0.28, seed: 13 }),
    ),
  );
  const FLAG = cel(
    paint((p, n) =>
      noise(p, 0.2, 31) > 0.6 && n.y > 0.3 ? MOSS : mottle("#b2b0a5", "#9a9a92", { size: 0.3, seed: 17 }),
    ),
  );
  const STEPS = cel(
    paint((p, n) =>
      n.y > 0.6 && noise(p, 0.2, 12) > 0.6
        ? MOSS
        : patches("#6f6e68", ["#aaa89e", "#9c9b93", "#b3b1a6"], { size: 0.5, gap: 0.07, seed: 2 }),
    ),
  );
  const TILE_A = cel("#46755f", "#2c4c4e");
  const TILE_B = cel("#3b6755", "#27433f");
  const TILE_LINE = cel("#223d3b", "#162a2c");
  const GABLE = cel(grain("#8a5a38", "#7a4c2e", { size: 0.04, axis: "y", seed: 14 }));
  const ROOF = paint((p, n, s) => {
    if (Math.abs(n.z) > 0.8) return GABLE;
    const cf = p.z / 0.1;
    const f = cf - Math.floor(cf);
    const rr = Math.abs(s[0]) / 0.09;
    const g = rr - Math.floor(rr);
    if (f < 0.1 || g < 0.08) return TILE_LINE;
    return Math.floor(cf) & 1 ? TILE_A : TILE_B;
  });
  const DOOR = cel(
    paint((p, n) => {
      if (n.z < 0.7) return "#8a5c38";
      const fx = p.x / 0.06 - Math.floor(p.x / 0.06);
      const fy = p.y / 0.06 - Math.floor(p.y / 0.06);
      return fx < 0.14 || fy < 0.14 ? "#5e3a22" : "#c9985a";
    }),
  );
  const ROPE = paint((_p, _n, s) => ((((s[1] - 360 * 14 * s[0]) % 90) + 90) % 90 < 45 ? "#e0bd74" : "#b88c48"));
  const ROPE_S = paint((_p, _n, s) => ((((s[1] - 360 * 6 * s[0]) % 90) + 90) % 90 < 45 ? "#e0bd74" : "#b88c48"));
  const RED_L = cel("#c9382c", "#9f2a2f");
  const TEAL = cel("#2e6f73", "#214f63");
  const PORCELAIN = cel("#ece6d8", "#c7c4d6");
  const ORANGE = cel("#f0842c", "#c9552a");
  const IRON = cel("#2d2a33", "#1b1920");
  const EARTH = cel("#5a4a38", "#3b2f2c");
  const STEM = cel("#5a9a3c", "#3b7a38");
  const AUTUMN = cel("#d9552d", "#a9362f");

  // ---------------------------------------------------------------- drawings
  const petals = (fill: string, line: string, sw = 2.4) =>
    [0, 90, 180, 270]
      .map(
        (a) =>
          `<g transform="rotate(${a} 32 32)"><path d="M32 3 C42 13 42 25 32 31 C22 25 22 13 32 3Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/></g>`,
      )
      .join("") + `<circle cx="32" cy="32" r="4.4" fill="${line}"/>`;
  const EMB = svg(`<svg viewBox="0 0 64 64">${petals("#efc35a", "#6a3d12")}</svg>`, { size: 128 });
  const kamon = [0, 64, 128, 192, 256]
    .map((x) => `<g transform="translate(${x - 20} 44) scale(0.625)">${petals("#e8703a", "#9a3b1c", 3)}</g>`)
    .join("");
  const ribs = [14, 28, 42, 56, 70, 84, 98, 112]
    .map((y) => `<line x1="0" x2="256" y1="${y}" y2="${y}" stroke="#d9a04e" stroke-width="1.6"/>`)
    .join("");
  const LANTERN_TEX = svg(
    `<svg viewBox="0 0 256 128"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5bd62"/><stop offset="0.5" stop-color="#fff1c8"/><stop offset="1" stop-color="#f5bd62"/></linearGradient></defs><rect width="256" height="128" fill="url(#g)"/>${ribs}${kamon}</svg>`,
    { size: 512 },
  );
  const WIN = svg(
    `<svg viewBox="0 0 64 64"><defs><radialGradient id="w"><stop offset="0" stop-color="#fff4c8"/><stop offset="1" stop-color="#ffc35e"/></radialGradient></defs><rect width="64" height="64" fill="url(#w)"/><g transform="translate(14 14) scale(0.55)">${petals("#e8703a", "#9a3b1c", 4)}</g><rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#a87a3e" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const CLOTH = svg(
    `<svg viewBox="0 0 64 72"><rect width="64" height="72" fill="#f1e4cc"/><rect x="3" y="3" width="58" height="66" fill="none" stroke="#d9a94c" stroke-width="2.5"/><g transform="translate(14.4 12.4) scale(0.55)">${petals("#e8703a", "#9a3b1c", 4)}</g><path d="M14 58 L50 58" stroke="#d9a94c" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );
  const mapleSvg = (fill: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><path d="M32 3 L38 20 L54 13 L47 29 L61 34 L44 41 L48 58 L32 48 L16 58 L20 41 L3 34 L17 29 L10 13 L26 20Z" fill="${fill}"/><path d="M32 60 L32 14 M32 34 L16 24 M32 34 L48 24 M32 42 L20 46 M32 42 L44 46" stroke="${vein}" stroke-width="2" fill="none"/></svg>`,
      { size: 128 },
    );
  const MAPLE_R = mapleSvg("#d6402b", "#8a2220");
  const MAPLE_O = mapleSvg("#ec8a34", "#a14a1f");
  const grassSvg = (a: string, c: string, d: string) =>
    svg(
      `<svg viewBox="0 0 48 64"><path d="M6 64 C8 40 4 24 0 6 C12 22 16 40 16 64Z" fill="${a}"/><path d="M18 64 C18 36 22 18 24 0 C30 20 32 40 32 64Z" fill="${c}"/><path d="M32 64 C34 42 40 28 46 12 C46 32 44 48 44 64Z" fill="${d}"/></svg>`,
      { size: 128 },
    );
  const GRASS_A = grassSvg("#6aa83f", "#4f8f38", "#7ab648");
  const GRASS_B = grassSvg("#8ab54a", "#6aa83f", "#5a9a3c");
  const leafSvg = (fill: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 32 64"><path d="M16 64 C2 48 0 20 16 2 C32 20 30 48 16 64Z" fill="${fill}"/><path d="M16 62 L16 8" stroke="${vein}" stroke-width="2.4" fill="none"/></svg>`,
      { size: 128 },
    );
  const LEAF_A = leafSvg("#5f9d3d", "#3f7a2c");
  const LEAF_B = leafSvg("#74ae42", "#4b8a30");
  const flowerSvg = (fill: string, center: string) =>
    svg(
      `<svg viewBox="0 0 32 32">${[0, 72, 144, 216, 288]
        .map((a) => `<ellipse cx="16" cy="8" rx="4.6" ry="7.5" fill="${fill}" transform="rotate(${a} 16 16)"/>`)
        .join("")}<circle cx="16" cy="16" r="4.2" fill="${center}"/></svg>`,
      { size: 128 },
    );
  const FLOWER_W = flowerSvg("#fffaf0", "#f2b63a");
  const FLOWER_O = flowerSvg("#f4913d", "#fff0b0");

  // ---------------------------------------------------------------- shared small parts
  const tassel = (x: number, y: number, z: number, s: number, color: Fill, bone: Jt = root) => {
    turn(
      [
        [0, 0],
        [0.012 * s, 0],
        [0.02 * s, -0.03 * s],
        [0.034 * s, -0.055 * s],
        [0.036 * s, -0.1 * s],
        [0.03 * s, -0.15 * s],
        [0.02 * s, -0.185 * s],
        [0, -0.185 * s],
      ],
      color,
      x,
      y,
      z,
      8,
      bone,
    );
    tor(GOLD, 0.03 * s, 0.006 * s, x, y - 0.05 * s, z, [90, 0, 0], bone);
  };
  const SHIDE: OutlinePoint[] = [
    [0, 0],
    [-0.04, -0.08],
    [0, -0.16],
    [-0.04, -0.24],
    [0, -0.32],
    [0.08, -0.32],
    [0.12, -0.24],
    [0.08, -0.16],
    [0.12, -0.08],
    [0.08, 0],
  ];
  const shide = (x: number, y: number, z: number, s: number) =>
    b.extrude(
      SHIDE.map(([u, v]) => [u * s, v * s] as OutlinePoint),
      { at: [x - 0.04 * s, y, z], x: [1, 0, 0], thickness: 0.006, color: WHITE, bone: root },
    );
  const arch = (half: number, n: number, h0: number, l0: number, l1: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const x = -half + (2 * half * i) / n;
      pts.push([x, l0 * (Math.abs(x) / half) ** 2.2]);
    }
    for (let i = n; i >= 0; i--) {
      const x = -half + (2 * half * i) / n;
      pts.push([x, h0 + l1 * (Math.abs(x) / half) ** 2.2]);
    }
    return pts;
  };

  // ---------------------------------------------------------------- ground
  box(EARTH, 4.1, 0.06, 3.2, 0, 0.03, 0);
  for (let ix = 0; ix < 5; ix++)
    for (let iz = 0; iz < 4; iz++) {
      const cx = -1.6 + 0.8 * ix;
      const cz = -1.125 + 0.75 * iz;
      const hw = 0.38;
      const hd = 0.355;
      const j = () => (R() - 0.5) * 0.08;
      const pts: OutlinePoint[] = [
        [-hw + j(), -hd + j()],
        [j() * 0.5, -hd + j() * 0.3],
        [hw + j(), -hd + j()],
        [hw + j() * 0.3, j() * 0.5],
        [hw + j(), hd + j()],
        [j() * 0.5, hd + j() * 0.3],
        [-hw + j(), hd + j()],
        [-hw + j() * 0.3, j() * 0.5],
      ];
      const t = 0.1 + R() * 0.04;
      b.extrude(pts, { at: [cx, t / 2, cz], x: [1, 0, 0], y: [0, 0, -1], thickness: t, bevel: 0.012, color: FLAG, bone: root });
    }

  // rocks
  const rock = (x: number, z: number, r: number, sx: number, sy: number, sz: number, ry: number) =>
    P(new THREE.DodecahedronGeometry(r, 0), ROCK, {
      at: [x, 0.1 + r * sy * 0.55, z],
      scale: [sx, sy, sz],
      rotation: [R() * 20, ry, R() * 20],
      flat: true,
    });
  rock(-1.55, -0.75, 0.3, 1.1, 0.8, 0.9, 20);
  rock(1.85, -0.9, 0.36, 1.2, 0.85, 1, 70);
  rock(1.5, 1.2, 0.42, 1.1, 0.9, 0.9, 35);
  rock(-1.85, 1.2, 0.3, 1, 0.75, 1.1, 10);
  rock(-0.95, 1.42, 0.17, 1, 0.7, 1, 50);
  rock(0.95, 1.45, 0.2, 1.1, 0.7, 0.9, 80);
  rock(2.0, 0.2, 0.24, 0.9, 0.9, 1, 25);
  rock(-2.0, -0.1, 0.22, 1, 0.8, 1, 60);
  rock(1.15, -1.3, 0.22, 1, 0.8, 1, 5);
  for (const [mx, mz, mr] of [
    [-1.2, 0.35, 0.16],
    [1.25, 0.3, 0.14],
    [-1.4, 1.0, 0.12],
    [1.0, 1.05, 0.14],
    [-0.5, 1.4, 0.12],
    [0.4, 1.42, 0.1],
    [1.9, 0.7, 0.14],
  ] as const)
    ball(MOSS_C, mr, mx, 0.115, mz, [1, 0.25, 0.9]);

  // ---------------------------------------------------------------- torii
  const TX = 1.2;
  for (const s of [1, -1]) {
    cyl(BLACK_Y, 0.165, 0.18, 0.55, 10, s * TX, 0.275, 0);
    cyl(RED_Y, 0.125, 0.15, 2.5, 10, s * TX, 1.75, 0);
    cyl(GOLD, 0.158, 0.16, 0.045, 10, s * TX, 0.57, 0);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      P(new THREE.ConeGeometry(0.03, 0.17, 4), GOLD, {
        at: [s * TX + 0.152 * Math.cos(a), 0.67, 0.152 * Math.sin(a)],
        rotation: [0, 45 + (a * 180) / Math.PI, 0],
      });
    }
    cyl(GOLD, 0.132, 0.134, 0.05, 10, s * TX, 2.12, 0);
    // nuki end cap, wedges
    box(GOLD, 0.035, 0.2, 0.125, s * 1.76, 2.5, 0);
    box(WOODD_Y, 0.05, 0.3, 0.16, s * (TX + 0.17), 2.5, 0);
    box(WOODD_Y, 0.05, 0.3, 0.16, s * (TX - 0.17), 2.5, 0);
    // wrapped rope ring
    tor("#c9a35e", 0.158, 0.04, s * TX, 2.46, 0, [90, 0, 0], root, 5, 14);
  }
  box(RED_X, 3.5, 0.2, 0.12, 0, 2.5, 0);
  box(GOLD, 3.5, 0.02, 0.125, 0, 2.61, 0);
  box(RED_Y, 0.16, 0.36, 0.1, 0, 2.78, 0);
  b.extrude(arch(1.8, 12, 0.2, 0.04, 0.07), { at: [0, 2.84, 0], x: [1, 0, 0], thickness: 0.26, bevel: 0.015, color: RED_X, bone: root });
  b.extrude(arch(2.05, 14, 0.22, 0.14, 0.2), { at: [0, 3.0, 0], x: [1, 0, 0], thickness: 0.36, bevel: 0.02, color: BLACK_X, bone: root });
  for (const s of [1, -1]) {
    box(GOLD, 0.05, 0.3, 0.385, s * 2.06, 3.29, 0, { rotation: [0, 0, -s * 14] });
    for (const f of [1, -1]) box(GOLD, 0.16, 0.07, 0.012, s * 1.97, 3.3, f * 0.186);
    b.sweep(
      catmull([
        [s * 2.07, 3.3, 0],
        [s * 2.2, 3.34, 0],
        [s * 2.26, 3.5, 0],
        [s * 2.16, 3.58, 0],
      ]),
      [0.035, 0.008],
      { color: GOLD, bone: root, sides: 6, caps: { start: "flat", end: "point" } },
    );
  }
  for (const f of [1, -1])
    P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      at: [0, 3.06, f * 0.19],
      dir: [0, 0, f],
      axis: "z",
      texture: EMB,
    });

  // rope, shide, tassels
  const ropeAt = (x: number) => [x, 2.22 + 0.2 * (x / 1.1) ** 2, 0.16];
  b.sweep(catmull([-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map(ropeAt)), 0.04, { color: ROPE, bone: root, sides: 6 });
  for (const x of [-0.8, 0.8]) tassel(x, ropeAt(x)[1] - 0.03, 0.16, 1, STRAW);
  tassel(0, ropeAt(0)[1] - 0.03, 0.16, 1.7, STRAW);
  for (const x of [-0.42, 0.42]) shide(x, ropeAt(x)[1] - 0.03, 0.17, 1.15);
  for (const x of [-0.12, 0.12]) shide(x, ropeAt(x)[1] - 0.03, 0.17, 0.9);

  // hanging paper lanterns, each swings on its own hinge joint
  const hangLantern = (J: Jt, lx: number) => {
    tor("#2a2430", 0.03, 0.008, lx, 2.37, 0, [0, 0, 0], J);
    b.rod([lx, 2.34, 0], [lx, 2.29, 0], 0.008, "#2a2430", { bone: J });
    turn(
      [
        [0, 0],
        [0.12, 0],
        [0.14, 0.015],
        [0.13, 0.035],
        [0.07, 0.06],
        [0.03, 0.075],
        [0.03, 0.04],
        [0, 0.04],
      ],
      LACQUER,
      lx,
      2.25,
      0,
      10,
      J,
    );
    tor(GOLD, 0.142, 0.009, lx, 2.262, 0, [90, 0, 0], J);
    glow(
      P(new THREE.SphereGeometry(0.17, 12, 9), "#ffffff", {
        at: [lx, 2.05, 0],
        scale: [0.95, 1.18, 0.95],
        texture: LANTERN_TEX,
        bone: J,
      }),
      1.3,
    );
    for (const dy of [-0.1, 0, 0.1])
      tor("#d9a04e", 0.1625 * Math.sqrt(1 - (dy / 0.2) ** 2), 0.004, lx, 2.05 + dy, 0, [90, 0, 0], J, 3, 16);
    turn(
      [
        [0, 0],
        [0.12, 0],
        [0.14, -0.015],
        [0.13, -0.035],
        [0.07, -0.06],
        [0.03, -0.075],
        [0, -0.075],
      ],
      LACQUER,
      lx,
      1.85,
      0,
      10,
      J,
    );
    tor(GOLD, 0.142, 0.009, lx, 1.838, 0, [90, 0, 0], J);
    tor("#c9382c", 0.025, 0.005, lx, 1.76, 0, [0, 0, 0], J);
    tassel(lx, 1.775, 0, 1.3, AUTUMN, J);
  };
  const lanternL = b.joint("lanternL", { parent: root, at: [1.5, 2.4, 0], dir: [0, -1, 0], role: "hinge" });
  const lanternR = b.joint("lanternR", { parent: root, at: [-1.5, 2.4, 0], dir: [0, -1, 0], role: "hinge" });
  hangLantern(lanternL, 1.5);
  hangLantern(lanternR, -1.5);

  // ---------------------------------------------------------------- stone lanterns
  const stoneLantern = (x: number, z: number) => {
    turn(
      [
        [0, 0],
        [0.27, 0],
        [0.27, 0.1],
        [0.2, 0.15],
        [0, 0.15],
      ],
      STONE,
      x,
      0.12,
      z,
      6,
    );
    turn(
      [
        [0, 0],
        [0.09, 0],
        [0.1, 0.1],
        [0.085, 0.3],
        [0.1, 0.5],
        [0.09, 0.6],
        [0, 0.6],
      ],
      STONE,
      x,
      0.27,
      z,
      8,
    );
    tor(STONE, 0.098, 0.028, x, 0.57, z, [90, 0, 0], root, 5, 10);
    turn(
      [
        [0, 0],
        [0.15, 0],
        [0.27, 0.05],
        [0.28, 0.1],
        [0.22, 0.13],
        [0, 0.13],
      ],
      STONE,
      x,
      0.87,
      z,
      6,
    );
    box(STONE_D, 0.27, 0.28, 0.27, x, 1.14, z);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(STONE, 0.04, 0.28, 0.04, x + sx * 0.1375, 1.14, z + sz * 0.1375);
    for (const f of [1, -1]) {
      glow(P(new THREE.BoxGeometry(0.16, 0.17, 0.02), "#ffffff", { at: [x, 1.14, z + f * 0.138], texture: WIN }), 1.3);
      glow(P(new THREE.BoxGeometry(0.02, 0.17, 0.16), "#ffffff", { at: [x + f * 0.138, 1.14, z], texture: WIN }), 1.3);
    }
    box(STONE, 0.33, 0.04, 0.33, x, 1.3, z);
    turn(
      [
        [0, 0],
        [0.4, 0],
        [0.42, 0.04],
        [0.34, 0.075],
        [0.12, 0.19],
        [0.07, 0.23],
        [0, 0.23],
      ],
      STONE,
      x,
      1.32,
      z,
      6,
    );
    turn(
      [
        [0, 0],
        [0.06, 0],
        [0.075, 0.04],
        [0.05, 0.09],
        [0.022, 0.13],
        [0, 0.17],
      ],
      STONE,
      x,
      1.55,
      z,
      8,
    );
    ball(GOLD, 0.03, x, 1.73, z);
    ball(MOSS_C, 0.1, x + 0.05, 0.16, z + 0.2, [1, 0.3, 0.8]);
  };
  stoneLantern(1.7, 0.85);
  stoneLantern(-1.7, 0.85);

  // ---------------------------------------------------------------- shrine (hokora)
  const ZS = -1.04;
  box(STEPS, 1.9, 0.15, 0.5, 0, 0.195, -0.5);
  box(STEPS, 1.6, 0.15, 0.85, 0, 0.345, -0.875);
  box(STEPS, 1.4, 0.1, 0.75, 0, 0.47, -1.025);
  box(WOODL, 1.0, 0.06, 0.72, 0, 0.55, ZS);
  for (const s of [1, -1]) {
    for (const f of [1, -1]) box(WOODD_Y, 0.07, 0.72, 0.07, s * 0.45, 0.94, ZS + f * 0.3);
    box(WOODD_Y, 0.03, 0.64, 0.56, s * 0.44, 0.9, ZS);
    box(WOODD_Y, 0.055, 0.64, 0.04, s * 0.395, 0.9, ZS + 0.29);
    box(RED_X, 0.08, 0.08, 0.7, s * 0.5, 1.24, ZS);
    box(WOODD_X, 0.18, 0.05, 0.05, s * 0.56, 1.19, ZS + 0.31);
    box(WOODD_X, 0.05, 0.05, 0.18, s * 0.5, 1.19, ZS + 0.37);
    box(GOLD, 0.052, 0.052, 0.052, s * 0.5, 1.19, ZS + 0.46);
    // veranda posts and rails
    box(RED_Y, 0.04, 0.2, 0.04, s * 0.52, 0.67, ZS + 0.45);
    ball(GOLD, 0.03, s * 0.52, 0.79, ZS + 0.45);
    box(RED_X, 0.22, 0.025, 0.025, s * 0.41, 0.73, ZS + 0.45);
    // doors
    box(DOOR, 0.36, 0.6, 0.03, s * 0.2, 0.9, ZS + 0.29);
    box(GOLD, 0.34, 0.025, 0.012, s * 0.2, 1.12, ZS + 0.31);
    box(GOLD, 0.34, 0.025, 0.012, s * 0.2, 0.68, ZS + 0.31);
    tor(GOLD, 0.03, 0.006, s * 0.06, 0.9, ZS + 0.315, [0, 0, 0], root, 4, 10);
  }
  box(WOODD_Y, 0.84, 0.64, 0.03, 0, 0.9, ZS - 0.29);
  box(RED_X, 1.02, 0.08, 0.08, 0, 1.24, ZS + 0.31);
  box(RED_X, 1.02, 0.08, 0.08, 0, 1.24, ZS - 0.31);
  box(WOODL, 1.1, 0.05, 0.14, 0, 0.545, ZS + 0.4);
  P(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [0, 0.93, ZS + 0.308], dir: [0, 0, 1], axis: "z", texture: EMB });
  const roofTop: OutlinePoint[] = [];
  const hRoof = (u: number) => 0.44 * (1 - u) ** 1.4 + 0.05 * u ** 5;
  for (let i = 8; i >= 1; i--) roofTop.push([-0.74 * (i / 8), hRoof(i / 8)]);
  roofTop.push([0, 0.44]);
  for (let i = 1; i <= 8; i++) roofTop.push([0.74 * (i / 8), hRoof(i / 8)]);
  roofTop.push([0.74, 0.02], [0.62, -0.05], [-0.62, -0.05], [-0.74, 0.02]);
  b.extrude(roofTop, { at: [0, 1.28, ZS], x: [1, 0, 0], thickness: 1.24, bevel: 0.01, color: ROOF, bone: root });
  b.rod([0, 1.73, ZS - 0.62], [0, 1.73, ZS + 0.62], 0.04, TILE_LINE, { bone: root, sides: 6 });
  for (const f of [1, -1]) {
    ball(GOLD, 0.05, 0, 1.75, ZS + f * 0.64);
    P(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      at: [0, 1.46, ZS + f * 0.625],
      dir: [0, 0, f],
      axis: "z",
      texture: EMB,
    });
    P(new THREE.ConeGeometry(0.035, 0.14, 5), GOLD, { at: [0, 1.7, ZS + f * 0.65], rotation: [f * 90, 0, 0] });
  }
  // shrine rope
  b.sweep(
    catmull(
      [
        [-0.45, 1.2],
        [-0.22, 1.13],
        [0, 1.1],
        [0.22, 1.13],
        [0.45, 1.2],
      ].map(([x, y]) => [x, y, ZS + 0.36]),
    ),
    0.017,
    { color: ROPE_S, bone: root, sides: 5 },
  );
  tassel(0, 1.09, ZS + 0.36, 0.8, STRAW);
  for (const x of [-0.22, 0.22]) shide(x, 1.12, ZS + 0.37, 0.55);

  // ---------------------------------------------------------------- offering table
  const TZ = 0.85;
  box(RED_X, 1.1, 0.05, 0.46, 0, 0.545, TZ);
  for (const s of [1, -1])
    for (const f of [1, -1]) {
      box(RED_Y, 0.05, 0.4, 0.05, s * 0.5, 0.32, TZ + f * 0.19);
      box(GOLD, 0.058, 0.03, 0.058, s * 0.5, 0.135, TZ + f * 0.19);
    }
  for (const f of [1, -1]) box(RED_X, 1.0, 0.05, 0.025, 0, 0.47, TZ + f * 0.2);
  for (const s of [1, -1]) {
    box(RED_Z(), 0.025, 0.05, 0.36, s * 0.5, 0.47, TZ);
    box(GOLD, 0.1, 0.04, 0.01, s * 0.49, 0.545, TZ + 0.232);
    box(GOLD, 0.01, 0.04, 0.1, s * 0.555, 0.545, TZ + 0.18);
  }
  function RED_Z() {
    return RED_Y;
  }
  box(CREAM, 0.3, 0.006, 0.47, 0.05, 0.573, TZ);
  P(new THREE.BoxGeometry(0.3, 0.3, 0.008), "#ffffff", { at: [0.05, 0.42, TZ + 0.235], texture: CLOTH });
  for (const s of [1, -1]) tassel(0.05 + s * 0.12, 0.27, TZ + 0.24, 0.8, GOLD);
  const TY = 0.576;
  // vase with flowers
  const vx = -0.42;
  const vz = TZ - 0.05;
  turn(
    [
      [0, 0],
      [0.04, 0],
      [0.055, 0.05],
      [0.045, 0.1],
      [0.026, 0.14],
      [0.03, 0.16],
      [0.02, 0.16],
      [0, 0.15],
    ],
    TEAL,
    vx,
    TY,
    vz,
    10,
  );
  tor(GOLD, 0.052, 0.006, vx, TY + 0.06, vz, [90, 0, 0]);
  const tips: number[][] = [
    [vx - 0.14, TY + 0.5, vz + 0.04],
    [vx, TY + 0.6, vz],
    [vx + 0.12, TY + 0.46, vz - 0.04],
    [vx - 0.06, TY + 0.4, vz + 0.1],
    [vx + 0.07, TY + 0.36, vz + 0.09],
  ];
  const baseP = [vx, TY + 0.15, vz];
  for (const tp of tips) {
    const mid = [(baseP[0] + tp[0]) / 2 + (R() - 0.5) * 0.04, (baseP[1] + tp[1]) / 2, (baseP[2] + tp[2]) / 2];
    b.sweep(catmull([baseP, mid, tp]), 0.006, { color: STEM, bone: root, sides: 4 });
  }
  const whites = tips.slice(0, 3).map((t) => frame(t, [0, 1, 0.35]));
  const oranges = tips.slice(3).map((t) => frame(t, [0, 1, 0.35]));
  b.cards(whites, FLOWER_W, { size: 0.1, lean: 50, flow: [0, 0.1, 1], cross: true, bone: root, rng: rng(3) });
  b.cards(oranges, FLOWER_O, { size: 0.09, lean: 50, flow: [0, 0.1, 1], cross: true, bone: root, rng: rng(4) });
  const vleaves = [0.2, 0.4, 0.55, 0.7].flatMap((t, i) =>
    tips.slice(0, 4).map((tp, k) =>
      frame(
        [baseP[0] + (tp[0] - baseP[0]) * t, baseP[1] + (tp[1] - baseP[1]) * t, baseP[2] + (tp[2] - baseP[2]) * t],
        [(tp[0] - baseP[0]) * 0.8 + Math.cos(i + k), 1, (tp[2] - baseP[2]) * 0.8 + Math.sin(i * 2 + k)],
      ),
    ),
  );
  b.cards(vleaves, [LEAF_A, LEAF_B], {
    size: [0.045, 0.11],
    lean: 55,
    bend: 20,
    flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)],
    bone: root,
    rng: rng(5),
  });
  // tangerine plate
  const px = -0.17;
  turn(
    [
      [0, 0],
      [0.08, 0],
      [0.12, 0.02],
      [0.125, 0.027],
      [0.11, 0.025],
      [0.07, 0.013],
      [0, 0.013],
    ],
    PORCELAIN,
    px,
    TY,
    TZ + 0.02,
    12,
  );
  for (const [ox, oz, oy] of [
    [-0.04, -0.03, 0.05],
    [0.045, -0.02, 0.05],
    [0, 0.045, 0.05],
    [0.0, 0.0, 0.095],
  ] as const) {
    ball(ORANGE, 0.04, px + ox, TY + oy, TZ + 0.02 + oz);
  }
  ball(STEM, 0.012, px, TY + 0.138, TZ + 0.02, [1.4, 0.5, 0.8]);
  // rice in a wooden masu
  box(WOODL, 0.14, 0.065, 0.14, 0.05, TY + 0.033, TZ);
  box(WOODD_X, 0.15, 0.014, 0.15, 0.05, TY + 0.066, TZ);
  ball(WHITE, 0.075, 0.05, TY + 0.075, TZ, [1, 0.7, 1]);
  // incense burner
  const bx = 0.33;
  const bz = TZ - 0.04;
  turn(
    [
      [0, 0.015],
      [0.045, 0.015],
      [0.065, 0.04],
      [0.08, 0.075],
      [0.075, 0.105],
      [0.082, 0.11],
      [0.07, 0.114],
      [0, 0.105],
    ],
    IRON,
    bx,
    TY,
    bz,
    10,
  );
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    P(new THREE.ConeGeometry(0.014, 0.03, 5), IRON, {
      at: [bx + 0.05 * Math.cos(a), TY + 0.012, bz + 0.05 * Math.sin(a)],
      rotation: [180, 0, 0],
    });
  }
  cyl("#9b9aa3", 0.066, 0.066, 0.01, 10, bx, TY + 0.1, bz);
  for (const [ix, iz, lx, lz] of [
    [-0.02, 0, -0.025, 0.01],
    [0.0, 0.02, 0.005, 0.03],
    [0.025, -0.01, 0.03, -0.02],
  ] as const) {
    b.rod([bx + ix, TY + 0.1, bz + iz], [bx + ix + lx, TY + 0.24, bz + iz + lz], 0.004, "#8a5a38", { bone: root, sides: 4 });
    glow(ball("#ff8a3a", 0.007, bx + ix + lx, TY + 0.242, bz + iz + lz), 1.6);
    b.sweep(
      catmull([
        [bx + ix + lx, TY + 0.25, bz + iz + lz],
        [bx + ix + lx + 0.04, TY + 0.4, bz + iz + lz - 0.02],
        [bx + ix + lx - 0.03, TY + 0.55, bz + iz + lz + 0.03],
        [bx + ix + lx + 0.04, TY + 0.7, bz + iz + lz],
      ]),
      [0.007, 0.002],
      { color: "#d6dbea", bone: root, sides: 4, caps: { start: "flat", end: "point" } },
    );
  }
  // sake bottle + cup on the table corner
  turn(
    [
      [0, 0],
      [0.03, 0],
      [0.036, 0.05],
      [0.025, 0.1],
      [0.012, 0.13],
      [0.016, 0.16],
      [0, 0.16],
    ],
    PORCELAIN,
    0.47,
    TY,
    TZ + 0.08,
    8,
  );
  box(RED_L, 0.05, 0.03, 0.004, 0.47, TY + 0.05, TZ + 0.116);
  turn(
    [
      [0, 0],
      [0.02, 0],
      [0.03, 0.035],
      [0.026, 0.037],
      [0, 0.03],
    ],
    PORCELAIN,
    0.47,
    TY,
    TZ - 0.04,
    8,
  );

  // sake pair on the lower step
  for (const s of [1, -1]) {
    turn(
      [
        [0, 0],
        [0.04, 0],
        [0.048, 0.07],
        [0.032, 0.14],
        [0.016, 0.18],
        [0.02, 0.21],
        [0, 0.21],
      ],
      s > 0 ? PORCELAIN : TEAL,
      s * 0.62,
      0.27,
      -0.38,
      8,
    );
    ball(GOLD, 0.014, s * 0.62, 0.485, -0.38);
  }

  // ---------------------------------------------------------------- maple tree
  const tx = -1.6;
  const tz = -0.75;
  const trunk = [
    [tx, 0.1, tz],
    [tx - 0.04, 0.6, tz + 0.02],
    [tx + 0.06, 1.1, tz],
    [tx + 0.12, 1.6, tz - 0.04],
  ];
  b.sweep(catmull(trunk), [0.085, 0.025], { color: BARK, bone: root, sides: 6 });
  const branches = [
    [
      [tx + 0.02, 0.9, tz],
      [tx - 0.2, 1.15, tz + 0.05],
      [tx - 0.4, 1.4, tz + 0.12],
    ],
    [
      [tx + 0.08, 1.2, tz],
      [tx + 0.3, 1.45, tz + 0.05],
      [tx + 0.5, 1.6, tz + 0.12],
    ],
    [
      [tx + 0.1, 1.45, tz - 0.02],
      [tx + 0.0, 1.75, tz - 0.1],
      [tx - 0.15, 1.95, tz - 0.05],
    ],
  ];
  for (const br of branches) b.sweep(catmull(br), [0.03, 0.008], { color: BARK, bone: root, sides: 5 });
  const centres = [
    [tx - 0.4, 1.42, tz + 0.12],
    [tx + 0.5, 1.62, tz + 0.12],
    [tx - 0.15, 1.95, tz - 0.05],
    [tx + 0.15, 1.7, tz - 0.05],
    [tx - 0.2, 1.3, tz + 0.1],
    [tx + 0.28, 1.4, tz + 0.08],
  ];
  const leafFrames = centres.flatMap((c) =>
    Array.from({ length: 16 }, () => {
      const d = [R() - 0.5, R() - 0.3, R() - 0.5];
      const len = Math.hypot(d[0], d[1], d[2]) || 1;
      const u = [d[0] / len, d[1] / len, d[2] / len];
      return frame([c[0] + u[0] * 0.2, c[1] + u[1] * 0.16, c[2] + u[2] * 0.2], u);
    }),
  );
  b.cards(leafFrames, [MAPLE_R, MAPLE_R, MAPLE_O], {
    size: 0.2,
    lean: 70,
    bend: 15,
    vary: 0.25,
    flow: (_f, i) => [Math.cos(i * 2.7), -0.3, Math.sin(i * 2.7)],
    bone: root,
    rng: rng(9),
    sink: 0.2,
  });

  // fallen leaves
  const fallen = Array.from({ length: 26 }, () => frame([(R() * 2 - 1) * 1.9, 0.128, (R() * 2 - 1) * 1.4], [0, 1, 0]));
  b.cards(fallen, [MAPLE_R, MAPLE_O], {
    size: 0.09,
    lean: 90,
    mirror: true,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    bone: root,
    rng: rng(12),
    sink: 0,
  });

  // grass tufts
  const tufts: ReturnType<typeof frame>[] = [];
  for (let tries = 0, got = 0; tries < 160 && got < 38; tries++) {
    const x = (R() * 2 - 1) * 2.0;
    const z = (R() * 2 - 1) * 1.5;
    const edge = Math.abs(x) > 1.65 || z > 1.25 || z < -1.3;
    if (!edge && R() > 0.18) continue;
    if (Math.abs(x) < 0.75 && z > 0.55 && z < 1.15) continue;
    if (Math.abs(x) < 1.0 && z < -0.15) continue;
    got++;
    for (let k = 0; k < 4; k++) tufts.push(frame([x + (R() - 0.5) * 0.1, 0.11, z + (R() - 0.5) * 0.1], [0, 1, 0]));
  }
  b.cards(tufts, [GRASS_A, GRASS_B], {
    size: [0.1, 0.17],
    lean: 10,
    bend: 25,
    cross: true,
    vary: 0.3,
    spin: 180,
    flow: (_f, i) => [Math.cos(i * 2.4), -0.2, Math.sin(i * 2.4)],
    bone: root,
    rng: rng(21),
  });

  // leafy bushes beside the steps and wildflowers
  const bushFrames: ReturnType<typeof frame>[] = [];
  const outward: number[][] = [];
  for (const [cx, cz] of [
    [-1.05, -0.3],
    [1.05, -0.35],
    [-0.9, 0.5],
    [0.95, 0.55],
    [-1.35, 1.0],
    [1.3, 0.2],
  ] as const)
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + R();
      bushFrames.push(frame([cx + 0.04 * Math.cos(a), 0.11, cz + 0.04 * Math.sin(a)], [0.5 * Math.cos(a), 1, 0.5 * Math.sin(a)]));
      outward.push([Math.cos(a), 0, Math.sin(a)]);
    }
  b.cards(bushFrames, [LEAF_A, LEAF_B], {
    size: [0.1, 0.26],
    lean: 40,
    bend: 30,
    vary: 0.25,
    flow: (_f, i) => outward[i],
    bone: root,
    rng: rng(31),
  });
  const wild = [
    [-0.9, 0.52],
    [0.97, 0.58],
    [-1.3, 1.02],
    [1.3, 0.22],
    [-1.05, -0.28],
    [1.08, -0.33],
  ].flatMap(([cx, cz], i) =>
    Array.from({ length: 3 }, (_, k) => frame([cx + (k - 1) * 0.05, 0.3 + 0.04 * ((i + k) % 3), cz + 0.03 * k], [0, 1, 0.3])),
  );
  b.cards(wild, [FLOWER_W, FLOWER_O], { size: 0.07, lean: 40, flow: [0, 0, 1], cross: true, bone: root, rng: rng(41) });

  return b.root;
}
