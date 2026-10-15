import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A grand arched wooden bookcase with gold filigree, starry back panel, rows of rune-stamped tomes, scrolls, glowing orbs on gold claw stands and dripping candles, with floor clutter.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const GOLD = "#e8b83e";
const GOLD_L = "#ffe08a";
const RED = "#c23a4a";
const TEAL_R = "#2f9ab8";
const PAGES = "#f3e8cc";
const WAX = "#f6ecd2";
const WAX_TOP = "#ffe9a8";
const DOWEL = "#8a5530";
const INDIGO = "#2a2250";

const WOOD = cel(grain("#7a4528", "#8d5733", { size: 0.015, axis: "y" }));
const WOOD_H = cel(grain("#7a4528", "#8d5733", { size: 0.015, axis: "x" }));
const WOOD_D = cel(grain("#4a2a1a", "#5a3422", { size: 0.02, axis: "x" }));
const PARCH = mottle("#f6e8c0", "#e3cd96", { size: 0.03, contrast: 0.5 });

const COVER_PAIRS: Array<[string, string]> = [
  ["#8e2a3a", "#6a1c2c"],
  ["#2f4f9e", "#233a7a"],
  ["#2f7a5a", "#215a42"],
  ["#6a3a8e", "#4c2a6a"],
  ["#2a8a94", "#1e6870"],
  ["#c28a2c", "#9a6a1c"],
  ["#4a6ab8", "#35508e"],
  ["#a8483a", "#7e3226"],
];
const COVER: Paint[] = COVER_PAIRS.map(([a, c]) => cel(mottle(a, c, { size: 0.025, contrast: 0.5 })));

const goldStroke = `stroke="#f2c14e" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const RUNES = [
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" ${goldStroke}/><path d="M16 6V26M8 16H24" ${goldStroke}/></svg>`,
    { size: 128 },
  ),
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="16,3 19,12 29,12 21,18 24,28 16,22 8,28 11,18 3,12 13,12" fill="#f2c14e"/></svg>`,
    { size: 128 },
  ),
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M10 6 L22 6 L16 16 L22 26 L10 26 L16 16 Z" ${goldStroke}/></svg>`,
    { size: 128 },
  ),
];

function orbSvg(a: string, c: string, hi: string): string {
  const r = rng(5);
  let stars = "";
  for (let i = 0; i < 22; i++)
    stars += `<circle cx="${(r() * 128).toFixed(1)}" cy="${(r() * 64).toFixed(1)}" r="${(0.8 + r() * 1.2).toFixed(1)}" fill="${hi}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="128" height="64" fill="url(#g)"/><path d="M0 40 Q20 20 40 36 T80 30 T128 40" stroke="${hi}" stroke-width="3" fill="none" opacity="0.7"/><path d="M0 52 Q30 40 60 50 T128 48" stroke="${hi}" stroke-width="2.5" fill="none" opacity="0.5"/>${stars}<ellipse cx="32" cy="18" rx="7" ry="4" fill="#ffffff" opacity="0.9"/></svg>`;
}
const ORB_CYAN = svg(orbSvg("#2fd6ff", "#2a4fd8", "#d9fbff"), { size: 256 });
const ORB_VIOLET = svg(orbSvg("#b25cff", "#4a1f9c", "#f2d9ff"), { size: 256 });
const ORB_AMBER = svg(orbSvg("#ffc247", "#e2552a", "#fff3c4"), { size: 256 });

function backSvg(): string {
  const r = rng(21);
  let s = "";
  for (let i = 0; i < 90; i++)
    s += `<circle cx="${(r() * 128).toFixed(1)}" cy="${(r() * 190).toFixed(1)}" r="${(0.5 + r() * 0.9).toFixed(1)}" fill="${r() > 0.5 ? "#f6dd8f" : "#cdbcff"}"/>`;
  let lines = "";
  for (let k = 0; k < 6; k++) {
    let d = `M${(r() * 120).toFixed(0)} ${(r() * 180).toFixed(0)}`;
    for (let j = 0; j < 3; j++) d += ` L${(r() * 120 + 4).toFixed(0)} ${(r() * 180 + 4).toFixed(0)}`;
    lines += `<path d="${d}" stroke="#8f7fd8" stroke-width="0.7" fill="none" opacity="0.8"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 190"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2554"/><stop offset="1" stop-color="#3b2f6e"/></linearGradient></defs><rect width="128" height="190" fill="url(#g)"/>${lines}${s}</svg>`;
}
const BACK_TEX = svg(backSvg(), { size: 1024 });

function bandSvg(): string {
  let d = "";
  for (let i = 0; i < 20; i++) {
    const x = 7 + i * 14;
    d += `<path d="M${x} 1 L${x + 3.5} 4 L${x} 7 L${x - 3.5} 4 Z" fill="#e8b83e"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 8"><rect width="280" height="8" fill="#3a2216"/><path d="M0 4 H280" stroke="#e8b83e" stroke-width="0.6"/>${d}</svg>`;
}
const BAND_TEX = svg(bandSvg(), { size: 1400 });

function vineSvg(): string {
  let d = "M5 0";
  let leaves = "";
  for (let y = 0; y <= 380; y += 4) d += ` L${(5 + 2.6 * Math.sin(y / 12)).toFixed(2)} ${y}`;
  for (let y = 14, i = 0; y < 380; y += 26, i++) {
    const x = 5 + 2.6 * Math.sin(y / 12);
    const sd = i % 2 ? 1 : -1;
    leaves += `<ellipse cx="${(x + sd * 2.2).toFixed(1)}" cy="${y}" rx="2.2" ry="1.1" fill="#c9a24a" transform="rotate(${sd * 30} ${(x + sd * 2.2).toFixed(1)} ${y})"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 380"><rect width="10" height="380" fill="#3a2216"/><path d="${d}" stroke="#e8b83e" stroke-width="1.3" fill="none"/>${leaves}</svg>`;
}
const VINE_TEX = svg(vineSvg(), { size: 1520 });

const MOON_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48"><mask id="m"><rect width="120" height="48" fill="white"/><circle cx="68" cy="22" r="17" fill="black"/></mask><circle cx="56" cy="24" r="19" fill="#f2c14e" mask="url(#m)"/><circle cx="90" cy="14" r="3" fill="#f2c14e"/><circle cx="102" cy="30" r="2.2" fill="#f2c14e"/><circle cx="20" cy="12" r="2.5" fill="#f2c14e"/><circle cx="12" cy="32" r="2" fill="#f2c14e"/></svg>`,
  { size: 480 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "wizardBookshelf" });
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: Col, at: V, rot: V = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Col, at: V, rot: V = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, rotation: rot });
  const ball = (r: number, color: Col, at: V, scale: V = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, scale });

  // ---------------- books ----------------
  const book = (cx: number, base: number, w: number, h: number, d: number, ci: number, tilt = 0, zIn?: number) => {
    const z = zIn ?? -0.16 + d / 2;
    const t = (tilt * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const cy = base + (h / 2) * c + (w / 2) * Math.abs(s);
    const P = (lx: number, ly: number, lz: number): V => [cx + lx * c - ly * s, cy + lx * s + ly * c, z + lz];
    const rot: V = [0, 0, tilt];
    const cov = COVER[ci % COVER.length];
    box(w, h, 0.014, cov, P(0, 0, d / 2 - 0.007), rot);
    box(w, h, 0.014, cov, P(0, 0, -d / 2 + 0.007), rot);
    for (const sg of [1, -1]) box(0.012, h, d - 0.028, cov, P(sg * (w / 2 - 0.006), 0, 0), rot);
    box(w - 0.024, h - 0.014, d - 0.028, PAGES, P(0, 0, 0), rot);
    for (const ly of [-0.36 * h, 0.36 * h]) box(w + 0.004, 0.01, 0.005, GOLD, P(0, ly, d / 2 + 0.001), rot);
    if (w > 0.05) for (const ly of [-0.3 * h, 0.3 * h]) box(w + 0.003, 0.004, 0.004, GOLD_L, P(0, ly, d / 2 + 0.001), rot);
    if (w >= 0.045) {
      const sz = w * 0.62;
      b.part(new THREE.PlaneGeometry(sz, sz), "#ffffff", {
        at: P(0, h * 0.06, d / 2 + 0.004),
        rotation: rot,
        texture: RUNES[ci % RUNES.length],
      });
      box(w * 0.5, 0.005, 0.004, GOLD_L, P(0, -h * 0.17, d / 2 + 0.0015), rot);
    }
  };

  const dims = (maxH: number) => ({
    w: 0.034 + R() * 0.034,
    h: maxH - 0.14 * R(),
    d: 0.24 + R() * 0.05,
    ci: Math.floor(R() * COVER.length),
  });

  const row = (x0: number, x1: number, base: number, maxH: number, lean: number) => {
    let xs = x0;
    let xe = x1;
    if (lean !== 0) {
      const k = dims(maxH);
      const t = (Math.abs(lean) * Math.PI) / 180;
      const ext = (k.w / 2) * Math.cos(t) + (k.h / 2) * Math.sin(t);
      if (lean > 0) {
        book(x1 - ext, base, k.w, k.h, k.d, k.ci, lean);
        xe = x1 - 2 * ext - 0.004;
      } else {
        book(x0 + ext, base, k.w, k.h, k.d, k.ci, lean);
        xs = x0 + 2 * ext + 0.004;
      }
    }
    let x = xs;
    for (;;) {
      const k = dims(maxH);
      if (x + k.w > xe) break;
      book(x + k.w / 2, base, k.w, k.h, k.d, k.ci);
      x += k.w + 0.003;
    }
  };

  const stack = (cx: number, base: number, z: number, items: Array<[number, number, number]>) => {
    let y = base;
    for (const [w, len, ci] of items) {
      book(cx + (R() - 0.5) * 0.02, y, w, len, 0.27, ci, 90, z);
      y += w;
    }
    return y;
  };

  // ---------------- scrolls ----------------
  const scroll = (c: V, dir: V, len: number, r: number, rib: string) => {
    const d = new THREE.Vector3(...dir).normalize();
    const dv: V = [d.x, d.y, d.z];
    const at = (t: number): V => [c[0] + d.x * t, c[1] + d.y * t, c[2] + d.z * t];
    b.part(new THREE.CylinderGeometry(r, r, len, 8), PARCH, { at: c, dir: dv });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.012, 8), DOWEL, { at: at(s * (len / 2 + 0.006)), dir: dv });
      b.part(new THREE.SphereGeometry(r * 0.8, 6, 4), GOLD, { at: at(s * (len / 2 + 0.016)) });
    }
    b.part(new THREE.CylinderGeometry(r + 0.004, r + 0.004, 0.02, 8), rib, { at: at(len * 0.2), dir: dv });
    b.part(new THREE.CylinderGeometry(r + 0.006, r + 0.006, 0.004, 8), GOLD, { at: at(len * 0.2 + 0.012), dir: dv });
  };

  const scrollPile = (cx: number, base: number, z: number) => {
    const r = 0.022;
    const rows: Array<[number, number, string]> = [
      [-0.05, 0, RED],
      [0, 0, TEAL_R],
      [0.05, 0, RED],
      [-0.025, 0.038, TEAL_R],
      [0.025, 0.038, RED],
      [0, 0.076, TEAL_R],
    ];
    for (const [dz, dy, rib] of rows)
      scroll([cx + (R() - 0.5) * 0.02, base + r + dy, z + dz], [1, 0, 0.03 * (R() - 0.5)], 0.3, r, rib);
  };

  // ---------------- orbs, candles ----------------
  const motes = (x: number, y: number, z: number, rad: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2;
      const rr = rad * (0.9 + R() * 0.5);
      glow(ball(0.0055, "#fff2b0", [x + Math.cos(a) * rr, y + (R() - 0.3) * rad, z + Math.sin(a) * rr]));
    }
  };

  const orb = (x: number, base: number, z: number, r: number, tex: THREE.Texture) => {
    b.lathe(
      [
        [0, 0],
        [r * 1.5, 0],
        [r * 1.5, 0.012],
        [r, 0.03],
        [r * 0.6, 0.065],
        [r * 0.9, 0.1],
        [r * 0.75, 0.105],
        [0, 0.105],
      ],
      { at: [x, base, z], color: GOLD, segments: 10 },
    );
    const cy = base + 0.1 + r * 0.55;
    glow(b.part(new THREE.SphereGeometry(r, 12, 8), "#ffffff", { at: [x, cy, z], texture: tex }));
    b.part(new THREE.TorusGeometry(r * 1.18, 0.006, 5, 18), GOLD, { at: [x, cy, z], rotation: [75, 0, 20] });
    b.part(new THREE.TorusGeometry(r * 1.12, 0.005, 5, 18), GOLD_L, { at: [x, cy, z], rotation: [20, 0, -70] });
    for (const a of [90, 210, 330]) {
      const rad = (a * Math.PI) / 180;
      b.spike(
        [x + Math.cos(rad) * r * 0.9, base + 0.1, z + Math.sin(rad) * r * 0.9],
        [x + Math.cos(rad) * r * 0.85, cy + r * 0.5, z + Math.sin(rad) * r * 0.85],
        null,
        0.006,
        GOLD,
      );
    }
    motes(x, cy + r * 0.4, z, r * 1.5, 4);
  };

  const candle = (x: number, y: number, z: number, h: number, r = 0.015) => {
    b.lathe(
      [
        [0, 0],
        [r * 3, 0],
        [r * 3, 0.006],
        [r * 1.5, 0.014],
        [0, 0.014],
      ],
      { at: [x, y, z], color: GOLD, segments: 10 },
    );
    const y0 = y + 0.014;
    cyl(r, r * 1.06, h, 8, WAX, [x, y0 + h / 2, z]);
    cyl(r * 0.85, r * 0.85, 0.004, 8, WAX_TOP, [x, y0 + h + 0.001, z]);
    for (let i = 0; i < 3; i++) {
      const a = R() * Math.PI * 2;
      const dl = 0.03 + R() * 0.03;
      const dx = x + Math.cos(a) * r * 1.0;
      const dz = z + Math.sin(a) * r * 1.0;
      cyl(r * 0.28, r * 0.28, dl, 5, WAX, [dx, y0 + h - dl / 2, dz]);
      ball(r * 0.34, WAX, [dx, y0 + h - dl, dz]);
    }
    cyl(0.0015, 0.0015, 0.012, 4, "#2b1a14", [x, y0 + h + 0.008, z]);
    glow(ball(0.011, "#ff9a2e", [x, y0 + h + 0.026, z], [0.8, 1.9, 0.8]));
    glow(ball(0.006, "#fff4b8", [x, y0 + h + 0.019, z], [0.8, 1.7, 0.8]));
  };

  const candelabra = (x: number, y: number, z: number) => {
    b.lathe(
      [
        [0, 0],
        [0.055, 0],
        [0.055, 0.012],
        [0.02, 0.035],
        [0.012, 0.09],
        [0.02, 0.12],
        [0.012, 0.15],
        [0.012, 0.2],
        [0.025, 0.21],
        [0, 0.21],
      ],
      { at: [x, y, z], color: GOLD, segments: 10 },
    );
    for (const s of [1, -1]) {
      b.sweep(
        catmull([
          [x, y + 0.09, z],
          [x + s * 0.045, y + 0.1, z],
          [x + s * 0.075, y + 0.14, z],
        ]),
        0.006,
        { color: GOLD, sides: 6 },
      );
      candle(x + s * 0.075, y + 0.14, z, 0.09, 0.013);
    }
    candle(x, y + 0.2, z, 0.11, 0.014);
  };

  const tassel = (x: number, ytop: number) => {
    b.rod([x, ytop, 0.19], [x, ytop - 0.03, 0.19], 0.003, RED, { sides: 4 });
    ball(0.01, GOLD, [x, ytop - 0.03, 0.19]);
    cyl(0.011, 0.011, 0.006, 6, GOLD, [x, ytop - 0.045, 0.19]);
    b.part(new THREE.ConeGeometry(0.018, 0.05, 6), RED, { at: [x, ytop - 0.07, 0.19] });
  };

  // ---------------- carcass ----------------
  box(1.64, 0.04, 0.52, WOOD_D, [0, 0.02, 0]);
  box(1.56, 0.06, 0.48, WOOD_D, [0, 0.07, 0]);
  for (let i = -3; i <= 3; i++) ball(0.012, GOLD, [i * 0.2, 0.07, 0.245]);
  for (const s of [1, -1]) {
    box(0.08, 2.0, 0.42, WOOD, [s * 0.68, 1.1, 0]);
    b.part(new THREE.PlaneGeometry(0.05, 1.9), "#ffffff", { at: [s * 0.68, 1.12, 0.212], texture: VINE_TEX });
    box(0.1, 0.03, 0.44, GOLD, [s * 0.68, 0.115, 0]);
  }
  box(1.28, 1.96, 0.03, INDIGO, [0, 1.12, -0.19]);
  b.part(new THREE.PlaneGeometry(1.28, 1.9), "#ffffff", { at: [0, 1.11, -0.172], texture: BACK_TEX });

  const boardYs = [0.14, 0.64, 1.14, 1.64];
  for (const yb of boardYs) {
    box(1.28, 0.04, 0.375, WOOD_H, [0, yb, 0.0125]);
    b.part(new THREE.PlaneGeometry(1.28, 0.036), "#ffffff", { at: [0, yb, 0.203], texture: BAND_TEX });
  }
  box(1.46, 0.04, 0.44, WOOD_D, [0, 2.08, 0]);
  b.part(new THREE.PlaneGeometry(1.46, 0.036), "#ffffff", { at: [0, 2.08, 0.223], texture: BAND_TEX });

  // pediment crown
  b.extrude(
    [
      [-0.74, 0],
      [0.74, 0],
      [0.7, 0.07],
      [0.5, 0.14],
      [0.22, 0.24],
      [0, 0.34, "sharp"],
      [-0.22, 0.24],
      [-0.5, 0.14],
      [-0.7, 0.07],
    ],
    { at: [0, 2.1, 0], x: [1, 0, 0], thickness: 0.4, bevel: 0.01, color: WOOD_H },
  );
  b.sweep(
    [
      [-0.7, 2.17, 0.2],
      [-0.5, 2.24, 0.2],
      [-0.22, 2.34, 0.2],
      [0, 2.44, 0.2],
      [0.22, 2.34, 0.2],
      [0.5, 2.24, 0.2],
      [0.7, 2.17, 0.2],
    ],
    0.008,
    { color: GOLD, sides: 6 },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.136), "#ffffff", { at: [0, 2.22, 0.206], texture: MOON_TEX });
  for (const s of [1, -1]) {
    ball(0.03, GOLD, [s * 0.68, 2.17, 0]);
    b.spike([s * 0.68, 2.17, 0], [0, 1, 0], 0.14, 0.022, GOLD);
  }
  orb(0, 2.43, 0, 0.04, ORB_CYAN);

  for (const ytop of [0.62, 1.12, 1.62, 2.06]) for (const x of [-0.56, 0, 0.56]) tassel(x, ytop);

  // ---------------- shelf 0 ----------------
  const top0 = stack(-0.45, 0.16, -0.025, [
    [0.07, 0.34, 0],
    [0.06, 0.3, 3],
    [0.05, 0.27, 5],
  ]);
  orb(-0.45, top0, 0, 0.065, ORB_VIOLET);
  scrollPile(-0.03, 0.16, 0);
  row(0.16, 0.64, 0.16, 0.4, -14);

  // ---------------- shelf 1 ----------------
  row(-0.64, -0.12, 0.66, 0.4, 12);
  orb(0.07, 0.66, 0.02, 0.08, ORB_CYAN);
  candelabra(0.38, 0.66, 0);
  stack(0.575, 0.66, -0.025, [
    [0.045, 0.12, 6],
    [0.04, 0.11, 1],
  ]);

  // ---------------- shelf 2 ----------------
  scrollPile(-0.45, 1.16, 0);
  row(-0.26, 0.2, 1.16, 0.4, 10);
  const top2 = stack(0.42, 1.16, -0.025, [
    [0.06, 0.2, 7],
    [0.05, 0.18, 2],
  ]);
  orb(0.42, top2, 0, 0.075, ORB_AMBER);
  candle(0.58, 1.16, 0.06, 0.1);

  // ---------------- shelf 3 ----------------
  candelabra(-0.5, 1.66, 0);
  row(-0.36, 0.1, 1.66, 0.33, -10);
  orb(0.25, 1.66, 0.02, 0.06, ORB_VIOLET);
  const top3 = stack(0.52, 1.66, -0.025, [
    [0.045, 0.16, 3],
    [0.04, 0.15, 5],
    [0.035, 0.14, 0],
  ]);
  candle(0.52, top3, 0, 0.12);

  // ---------------- floor clutter ----------------
  const topF = stack(-1.0, 0, 0.05, [
    [0.08, 0.36, 1],
    [0.07, 0.32, 7],
    [0.06, 0.3, 4],
    [0.05, 0.27, 2],
  ]);
  candle(-1.0, topF, 0.05, 0.2, 0.02);
  scroll([-0.9, 0.03, 0.36], [1, 0, 0.08], 0.42, 0.03, RED);

  const POT = cel("#2a8a94");
  const potPaint = paint((_p, _n, s) => {
    if (Math.abs(s[0] - 0.06) < 0.008 || Math.abs(s[0] - 0.22) < 0.008) return GOLD;
    const a = ((s[1] % 60) + 60) % 60;
    if (Math.abs(a - 30) < 4 && s[0] > 0.08 && s[0] < 0.2) return "#fff4d2";
    return POT;
  });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.03],
      [0.14, 0.17],
      [0.12, 0.26],
      [0.13, 0.28],
      [0.11, 0.285],
      [0, 0.27],
    ],
    { at: [1.0, 0, -0.05], color: potPaint, segments: 12 },
  );
  const potScrolls: Array<[V, V, string]> = [
    [[0.03, 0.34, 0.0], [0.12, 1, 0.05], RED],
    [[-0.04, 0.36, 0.03], [-0.15, 1, 0.1], TEAL_R],
    [[0.0, 0.33, -0.05], [0.05, 1, -0.15], RED],
    [[-0.02, 0.35, 0.06], [-0.05, 1, 0.2], TEAL_R],
    [[0.05, 0.34, -0.02], [0.2, 1, -0.05], RED],
  ];
  for (const [o, d, rib] of potScrolls) scroll([1.0 + o[0], o[1], -0.05 + o[2]], d, 0.5, 0.02, rib);
  orb(0.9, 0, 0.32, 0.08, ORB_CYAN);

  return b.root;
}
