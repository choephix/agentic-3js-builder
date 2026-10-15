// Alchemist's workbench: a cel-shaded, gold-trimmed workbench dressed with potions, books, brass scales and herbs.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A gold-trimmed alchemist's workbench with a glowing potion rack, brass scales, stacked and open spell books, a mortar, drying herbs, a bubbling cauldron and a supply crate, in a bright cel-shaded anime style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const GOLD = "#e8b84a";
const GOLD_D = "#b9852a";
const GOLD_L = "#ffe08a";
const TEAL = "#2fa9a0";
const TEAL_D = "#1d6f78";
const CREAM = "#f6ead0";
const PAPER = "#efe0bb";
const RED = "#c8453f";
const PURPLE = "#7a52b8";
const BLUE = "#4a7fd6";
const GREEN = "#58b45a";
const GREEN_D = "#2f7d45";
const BROWN = "#7a4b2e";
const IRON = "#4d4a5c";
const GLASS = "#cfeef2";
const CORK = "#c9915a";
const STRAW = "#e6c870";
const SACK = "#d9c08f";
const ORANGE = "#f09a3a";
const MAROON = "#8e2f45";
const WOODF = "#9a6a3e";
const WOODFD = "#6d4528";

const T = 0.9; // table top height

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(7);

  // ---------- paints ----------
  const WOOD = cel(grain("#a8743f", "#8f5f32", { size: 0.03, axis: "x" }));
  const WOODV = cel(grain("#a8743f", "#8f5f32", { size: 0.03, axis: "y" }));
  const WOODD = cel(grain("#744a2a", "#5e3a20", { size: 0.03, axis: "x" }));
  const WOODDV = cel(grain("#744a2a", "#5e3a20", { size: 0.03, axis: "y" }));
  const STONE = cel(mottle("#aaa3b4", "#8e8799", { size: 0.04 }));

  // ---------- textures ----------
  let runes = "";
  for (let i = 0; i < 5; i++) {
    const x = 25 + i * 11;
    runes += `<path d="M${x} 40 l4 -6 l4 6 l-4 6 z" fill="none" stroke="#f6d27a" stroke-width="2"/>`;
    runes += `<path d="M${280 - x - 8} 40 l4 -6 l4 6 l-4 6 z" fill="none" stroke="#f6d27a" stroke-width="2"/>`;
  }
  const RUNNER = svg(
    `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
<rect width="280" height="100" fill="#1f6f78"/>
<rect x="5" y="5" width="270" height="90" fill="none" stroke="#e8b84a" stroke-width="3"/>
<rect x="11" y="11" width="258" height="78" fill="none" stroke="#f6d27a" stroke-width="2" stroke-dasharray="6 4"/>
<circle cx="140" cy="50" r="34" fill="#17535e" stroke="#e8b84a" stroke-width="3"/>
<circle cx="140" cy="50" r="26" fill="none" stroke="#f6d27a" stroke-width="2"/>
<path d="M140 22 L164 64 L116 64 Z" fill="none" stroke="#e8b84a" stroke-width="2.5"/>
<path d="M140 78 L116 36 L164 36 Z" fill="none" stroke="#e8b84a" stroke-width="2.5"/>
<circle cx="140" cy="50" r="6" fill="#ffd86b"/>
${runes}
<path d="M20 20 l8 8 M20 28 l8 -8 M252 20 l8 8 M252 28 l8 -8 M20 72 l8 8 M20 80 l8 -8 M252 72 l8 8 M252 80 l8 -8" stroke="#e8b84a" stroke-width="2.2"/>
</svg>`,
    { size: 1024 },
  );

  const emblem = (bg: string) =>
    svg(
      `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<rect width="60" height="80" fill="${bg}"/>
<rect x="3" y="3" width="54" height="74" fill="none" stroke="#e8b84a" stroke-width="2.5"/>
<rect x="7" y="7" width="46" height="66" fill="none" stroke="#f6d27a" stroke-width="1.5"/>
<circle cx="30" cy="40" r="15" fill="none" stroke="#e8b84a" stroke-width="2.2"/>
<path d="M30 20 L36 40 L30 60 L24 40 Z M15 40 L30 34 L45 40 L30 46 Z" fill="#ffd86b" stroke="#b9852a" stroke-width="1"/>
<circle cx="30" cy="40" r="3" fill="#ffffff"/>
</svg>`,
      { size: 256 },
    );
  const EMB_RED = emblem("#a8323a");
  const EMB_TEAL = emblem("#1f7d86");

  let linesL = "";
  for (let i = 0; i < 9; i++) linesL += `<path d="M8 ${12 + i * 5.5} h${40 + ((i * 7) % 9)}" stroke="#7a5230" stroke-width="1.6" stroke-linecap="round"/>`;
  const PAGE_L = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<rect width="60" height="80" fill="#f3e4bd"/>
<rect x="0" y="0" width="60" height="80" fill="none" stroke="#d8c08a" stroke-width="3"/>
<path d="M8 8 h44" stroke="#b9852a" stroke-width="2.4"/>
${linesL}
<circle cx="52" cy="70" r="3" fill="#c8453f"/>
</svg>`,
    { size: 256 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
<rect width="60" height="80" fill="#f3e4bd"/>
<rect x="0" y="0" width="60" height="80" fill="none" stroke="#d8c08a" stroke-width="3"/>
<circle cx="30" cy="30" r="20" fill="none" stroke="#7a5230" stroke-width="2"/>
<circle cx="30" cy="30" r="12" fill="none" stroke="#7a5230" stroke-width="1.6"/>
<path d="M30 10 L40 40 L16 20 L44 20 L20 40 Z" fill="none" stroke="#c8453f" stroke-width="1.8"/>
<path d="M8 58 h44 M8 64 h38 M8 70 h42" stroke="#7a5230" stroke-width="1.6" stroke-linecap="round"/>
<path d="M30 54 v-6" stroke="#2f7d45" stroke-width="2"/>
</svg>`,
    { size: 256 },
  );

  const LEAF = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
<path d="M20 80 L20 12" stroke="#2f7d45" stroke-width="2.4" fill="none"/>
<path d="M20 66 Q4 62 2 48 Q16 50 20 62 Z M20 66 Q36 62 38 48 Q24 50 20 62 Z" fill="#58b45a" stroke="#2f7d45" stroke-width="1.2"/>
<path d="M20 46 Q6 42 4 28 Q17 30 20 42 Z M20 46 Q34 42 36 28 Q23 30 20 42 Z" fill="#6ccb68" stroke="#2f7d45" stroke-width="1.2"/>
<path d="M20 28 Q10 22 12 6 Q22 10 20 24 Z M20 28 Q30 22 28 6 Q18 10 20 24 Z" fill="#8be07a" stroke="#2f7d45" stroke-width="1.2"/>
<path d="M20 14 Q16 4 20 0 Q24 4 20 14 Z" fill="#a6f08f" stroke="#2f7d45" stroke-width="1"/>
</svg>`,
    { size: 160 },
  );
  const LAV = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
<path d="M20 80 L20 24" stroke="#4f8f4a" stroke-width="2.4" fill="none"/>
<path d="M20 60 Q8 52 6 40 M20 56 Q32 48 34 38" stroke="#4f8f4a" stroke-width="2" fill="none"/>
<ellipse cx="20" cy="14" rx="5" ry="12" fill="#8f64d8" stroke="#5a3a9a" stroke-width="1.2"/>
<ellipse cx="14" cy="32" rx="4" ry="8" fill="#a37be8" stroke="#5a3a9a" stroke-width="1.2"/>
<ellipse cx="27" cy="30" rx="4" ry="8" fill="#a37be8" stroke="#5a3a9a" stroke-width="1.2"/>
<ellipse cx="6" cy="34" rx="3.5" ry="7" fill="#b48cf2" stroke="#5a3a9a" stroke-width="1.2"/>
<ellipse cx="34" cy="30" rx="3.5" ry="7" fill="#b48cf2" stroke="#5a3a9a" stroke-width="1.2"/>
</svg>`,
    { size: 160 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
<path d="M20 80 L20 26" stroke="#3f8f50" stroke-width="2.4" fill="none"/>
<path d="M20 58 Q8 56 5 46 Q17 46 20 54 Z" fill="#58b45a" stroke="#2f7d45" stroke-width="1.2"/>
<g fill="#ff8fb4" stroke="#c0446e" stroke-width="1.2">
<ellipse cx="20" cy="12" rx="6" ry="9"/>
<ellipse cx="9" cy="20" rx="6" ry="9" transform="rotate(-60 9 20)"/>
<ellipse cx="31" cy="20" rx="6" ry="9" transform="rotate(60 31 20)"/>
<ellipse cx="13" cy="30" rx="6" ry="8" transform="rotate(-120 13 30)"/>
<ellipse cx="27" cy="30" rx="6" ry="8" transform="rotate(120 27 30)"/>
</g>
<circle cx="20" cy="22" r="5" fill="#ffd86b" stroke="#b9852a" stroke-width="1.2"/>
</svg>`,
    { size: 160 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 20 60" xmlns="http://www.w3.org/2000/svg">
<g stroke="#e8b84a" stroke-width="2.4" stroke-linecap="round" fill="none">
<path d="M10 40 L2 2 M10 40 L6 0 M10 40 L10 0 M10 40 L14 0 M10 40 L18 2"/>
</g>
<path d="M4 44 L16 44 L14 56 L6 56 Z" fill="#ffd86b" stroke="#b9852a" stroke-width="1.6"/>
<path d="M4 50 h12" stroke="#b9852a" stroke-width="1.6"/>
</svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 30 36" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="28" height="34" rx="3" fill="#f3e4bd" stroke="#8a5a32" stroke-width="2"/>
<circle cx="15" cy="15" r="8" fill="none" stroke="#7a5230" stroke-width="1.8"/>
<path d="M15 8 L19 20 L11 20 Z" fill="#c8453f"/>
<path d="M6 28 h18 M9 32 h12" stroke="#7a5230" stroke-width="1.6" stroke-linecap="round"/>
</svg>`,
    { size: 128 },
  );
  let scrolls = "";
  for (let i = 0; i < 16; i++) {
    scrolls += `<circle cx="${5 + i * 10}" cy="4" r="2.4" fill="none" stroke="#e8b84a" stroke-width="0.8"/>`;
    scrolls += `<path d="M${10 + i * 10} 4 q-2.5 -3 -5 0 t-5 0" stroke="#f6d27a" stroke-width="0.7" fill="none"/>`;
  }
  const FILIGREE = svg(
    `<svg viewBox="0 0 162 8" xmlns="http://www.w3.org/2000/svg">
<rect width="162" height="8" fill="#1d6f78"/>
<path d="M0 0.4 H162 M0 7.6 H162" stroke="#e8b84a" stroke-width="0.8"/>
${scrolls}
</svg>`,
    { size: 1024 },
  );
  const RUG = svg(
    `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="100" fill="#8e2f45"/>
<rect x="4" y="4" width="192" height="92" fill="none" stroke="#e8b84a" stroke-width="3"/>
<rect x="10" y="10" width="180" height="80" fill="none" stroke="#f6d27a" stroke-width="2" stroke-dasharray="5 4"/>
<path d="M100 18 L160 50 L100 82 L40 50 Z" fill="#6e2036" stroke="#e8b84a" stroke-width="2.5"/>
<path d="M100 30 L132 50 L100 70 L68 50 Z" fill="none" stroke="#f6d27a" stroke-width="2"/>
<circle cx="100" cy="50" r="7" fill="#e8b84a"/>
<path d="M18 50 l8 -6 l8 6 l-8 6 z M166 50 l8 -6 l8 6 l-8 6 z" fill="none" stroke="#e8b84a" stroke-width="2.2"/>
</svg>`,
    { size: 512 },
  );

  // ---------- helpers ----------
  const P = (geo: THREE.BufferGeometry, color: Fill, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { at, ...o });
  const bx = (w: number, h: number, d: number, color: Fill, at: number[], o: PartOptions = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cy = (rt: number, rb: number, h: number, seg: number, color: Fill, at: number[], o: PartOptions = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const sp = (r: number, color: Fill, at: number[], scale: number[] = [1, 1, 1], o: PartOptions = {}) =>
    P(new THREE.SphereGeometry(r, 8, 6), color, at, { scale, ...o });
  const lat = (pts: OutlinePoint[], color: Fill, at: number[], seg = 12) =>
    b.lathe(pts, { at, color, segments: seg });
  const scaled = (pts: OutlinePoint[], s: number): OutlinePoint[] =>
    pts.map(([x, y]): OutlinePoint => [x * s, y * s]);
  const flatPlane = (w: number, d: number, texture: THREE.Texture, at: number[], o: PartOptions = {}, lift = 0) => {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    g.translate(0, lift, 0);
    return P(g, "#ffffff", at, { texture, ...o });
  };
  const upPlane = (w: number, d: number, texture: THREE.Texture, at: number[]) =>
    P(new THREE.PlaneGeometry(w, d), "#ffffff", at, { dir: [0, 0, 1], axis: "z", texture });

  // ---------- potions ----------
  const FLASK: OutlinePoint[] = [
    [0, 0],
    [0.03, 0],
    [0.052, 0.02],
    [0.06, 0.055],
    [0.052, 0.095],
    [0.03, 0.12],
    [0.021, 0.135],
    [0, 0.135],
  ];
  const FLASK_NECK: OutlinePoint[] = [
    [0, 0.135],
    [0.022, 0.135],
    [0.022, 0.17],
    [0.032, 0.18],
    [0.032, 0.186],
    [0, 0.186],
  ];
  const VIAL: OutlinePoint[] = [
    [0, 0],
    [0.025, 0],
    [0.03, 0.01],
    [0.03, 0.11],
    [0.02, 0.13],
    [0, 0.13],
  ];
  const VIAL_NECK: OutlinePoint[] = [
    [0, 0.13],
    [0.02, 0.13],
    [0.02, 0.155],
    [0.027, 0.162],
    [0.027, 0.166],
    [0, 0.166],
  ];
  const potion = (kind: "flask" | "vial" | "square", x: number, y: number, z: number, s: number, color: string) => {
    if (kind === "flask") {
      glow(lat(scaled(FLASK, s), color, [x, y, z], 10), 0.75);
      lat(scaled(FLASK_NECK, s), GLASS, [x, y, z], 8);
      cy(0.026 * s, 0.026 * s, 0.01 * s, 8, GOLD, [x, y + 0.176 * s, z]);
      cy(0.019 * s, 0.024 * s, 0.03 * s, 8, CORK, [x, y + 0.2 * s, z]);
      upPlane(0.04 * s, 0.048 * s, LABEL, [x, y + 0.06 * s, z + 0.0615 * s]);
      sp(0.007 * s, color, [x + 0.02 * s, y + 0.09 * s, z + 0.05 * s]);
    } else if (kind === "vial") {
      glow(lat(scaled(VIAL, s), color, [x, y, z], 8), 0.75);
      lat(scaled(VIAL_NECK, s), GLASS, [x, y, z], 8);
      cy(0.022 * s, 0.026 * s, 0.014 * s, 8, GOLD, [x, y + 0.166 * s + 0.005, z]);
      sp(0.012 * s, GOLD_D, [x, y + 0.18 * s, z]);
    } else {
      const h = 0.11 * s;
      glow(bx(0.09 * s, h, 0.05 * s, color, [x, y + h / 2, z]), 0.75);
      bx(0.095 * s, 0.01 * s, 0.055 * s, GOLD, [x, y + 0.005 * s, z]);
      bx(0.095 * s, 0.01 * s, 0.055 * s, GOLD, [x, y + h - 0.005 * s, z]);
      bx(0.03 * s, 0.05 * s, 0.03 * s, GLASS, [x, y + h + 0.025 * s, z]);
      cy(0.014 * s, 0.017 * s, 0.026 * s, 6, CORK, [x, y + h + 0.062 * s, z]);
      upPlane(0.036 * s, 0.043 * s, LABEL, [x, y + h * 0.5, z + 0.0265 * s]);
    }
  };

  // ---------- books ----------
  const flatBook = (
    cx: number,
    cy0: number,
    cz: number,
    ang: number,
    len: number,
    th: number,
    dep: number,
    color: string,
    top?: THREE.Texture,
  ) => {
    const a = (ang * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const L = (x: number, y: number, z: number) => [cx + x * c + z * s, cy0 + y, cz - x * s + z * c];
    const ro: PartOptions = { rotation: [0, ang, 0] };
    const bt = 0.008;
    bx(len, bt, dep, color, L(0, -th / 2 + bt / 2, 0), ro);
    bx(len, bt, dep, color, L(0, th / 2 - bt / 2, 0), ro);
    bx(bt, th, dep, color, L(-len / 2 + bt / 2, 0, 0), ro);
    bx(len - 0.018, th - 2 * bt + 0.002, dep - 0.014, PAPER, L(-0.001, 0, 0), ro);
    for (const zz of [-0.3, 0, 0.3])
      bx(bt + 0.004, th + 0.002, 0.012, GOLD, L(-len / 2 + bt / 2 - 0.002, 0, zz * dep), ro);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        bx(0.03, 0.003, 0.03, GOLD, L(sx * (len / 2 - 0.02), th / 2 + 0.0005, sz * (dep / 2 - 0.02)), ro);
    if (top) flatPlane(len - 0.07, dep - 0.07, top, L(0, th / 2 + 0.0015, 0), ro);
  };
  const book = (x: number, y: number, z: number, w: number, h: number, d: number, color: string) => {
    bx(0.006, h, d, color, [x - w / 2 + 0.003, y + h / 2, z]);
    bx(0.006, h, d, color, [x + w / 2 - 0.003, y + h / 2, z]);
    bx(w, h, 0.006, color, [x, y + h / 2, z + d / 2 - 0.003]);
    bx(w - 0.012, h - 0.012, d - 0.008, PAPER, [x, y + h / 2, z - 0.002]);
    for (const f of [0.12, 0.88]) bx(w + 0.002, 0.008, 0.003, GOLD, [x, y + h * f, z + d / 2 + 0.0005]);
    bx(w * 0.6, h * 0.16, 0.003, GOLD_L, [x, y + h * 0.5, z + d / 2 + 0.0005]);
    bx(w * 0.4, h * 0.06, 0.004, color, [x, y + h * 0.5, z + d / 2 + 0.001]);
  };
  const bookRow = (x0: number, y: number, z: number, specs: Array<[number, number, string]>) => {
    let x = x0;
    for (const [w, h, col] of specs) {
      book(x + w / 2, y, z, w, h, 0.17, col);
      x += w + 0.002;
    }
    return x;
  };

  // ================= floor rug =================
  bx(3.1, 0.008, 1.5, MAROON, [0, 0.004, 0.3]);
  flatPlane(3.06, 1.46, RUG, [0, 0.0095, 0.3]);

  // ================= table =================
  bx(1.84, 0.07, 0.8, WOOD, [0, T - 0.035, 0]);
  bx(1.86, 0.012, 0.014, GOLD, [0, T - 0.045, 0.404]);
  bx(1.86, 0.012, 0.014, GOLD, [0, T - 0.045, -0.404]);
  for (const sx of [-1, 1]) bx(0.014, 0.012, 0.8, GOLD, [sx * 0.924, T - 0.045, 0]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      bx(0.07, 0.83, 0.07, WOODV, [sx * 0.82, 0.415, sz * 0.33]);
      bx(0.082, 0.03, 0.082, GOLD, [sx * 0.82, 0.015, sz * 0.33]);
      bx(0.082, 0.025, 0.082, GOLD, [sx * 0.82, 0.8, sz * 0.33]);
      bx(0.075, 0.012, 0.075, GOLD_D, [sx * 0.82, 0.4, sz * 0.33]);
    }
  bx(1.7, 0.21, 0.03, WOODD, [0, 0.725, 0.345]);
  bx(1.7, 0.21, 0.03, WOODD, [0, 0.725, -0.345]);
  for (const sx of [-1, 1]) bx(0.03, 0.21, 0.6, WOODD, [sx * 0.82, 0.725, 0]);
  upPlane(1.64, 0.08, FILIGREE, [0, 0.79, 0.3615]);
  bx(1.7, 0.01, 0.004, GOLD, [0, 0.745, 0.361]);
  for (const x of [-0.52, 0, 0.52]) {
    bx(0.46, 0.11, 0.012, WOOD, [x, 0.68, 0.366]);
    bx(0.48, 0.01, 0.006, GOLD, [x, 0.74, 0.37]);
    bx(0.48, 0.01, 0.006, GOLD, [x, 0.62, 0.37]);
    for (const sx of [-1, 1]) bx(0.01, 0.13, 0.006, GOLD, [x + sx * 0.235, 0.68, 0.37]);
    sp(0.017, GOLD, [x, 0.68, 0.38]);
    bx(0.03, 0.05, 0.003, GOLD_D, [x + 0.08, 0.68, 0.373]);
    bx(0.01, 0.025, 0.004, IRON, [x + 0.08, 0.683, 0.375]);
  }
  // lower shelf
  bx(1.57, 0.03, 0.59, WOODD, [0, 0.25, 0]);
  bx(1.57, 0.03, 0.03, WOODD, [0, 0.215, 0.29]);
  // runner
  flatPlane(1.4, 0.5, RUNNER, [-0.05, T + 0.0025, 0.03]);

  // ---------- under-table stock ----------
  const BARREL: OutlinePoint[] = [
    [0, 0],
    [0.1, 0],
    [0.12, 0.05],
    [0.13, 0.12],
    [0.12, 0.19],
    [0.1, 0.24],
    [0, 0.24],
  ];
  lat(BARREL, WOODDV, [-0.5, 0.265, -0.02]);
  for (const [yy, rr] of [
    [0.05, 0.126],
    [0.19, 0.126],
  ])
    cy(rr, rr, 0.016, 12, IRON, [-0.5, 0.265 + yy, -0.02]);
  cy(0.02, 0.02, 0.03, 8, CORK, [-0.5, 0.265 + 0.12, 0.107], { dir: [0, 0, 1] });
  const JAR: OutlinePoint[] = [
    [0, 0],
    [0.06, 0],
    [0.075, 0.03],
    [0.075, 0.1],
    [0.055, 0.125],
    [0.04, 0.135],
    [0, 0.135],
  ];
  const jar = (x: number, z: number, col: string, lid: string) => {
    lat(JAR, GLASS, [x, 0.265, z], 10);
    cy(0.068, 0.068, 0.07, 10, col, [x, 0.265 + 0.055, z]);
    cy(0.045, 0.045, 0.02, 10, lid, [x, 0.265 + 0.145, z]);
    sp(0.012, GOLD, [x, 0.265 + 0.165, z]);
  };
  jar(-0.1, 0.1, "#e86f9a", GOLD_D);
  jar(0.03, -0.1, "#8be07a", RED);
  jar(0.12, 0.12, "#f0c040", PURPLE);
  flatBook(0.5, 0.265 + 0.025, 0.05, 14, 0.3, 0.05, 0.22, PURPLE);
  flatBook(0.5, 0.265 + 0.07, 0.05, -8, 0.26, 0.04, 0.19, TEAL_D);
  lat(
    [
      [0, 0],
      [0.14, 0],
      [0.15, 0.02],
      [0.12, 0.03],
      [0, 0.03],
    ],
    GOLD_D,
    [0.5, 0.265 + 0.11, 0.05],
    10,
  );

  // ================= back frame, shelves =================
  for (const sx of [-1, 1]) {
    bx(0.07, 1.8, 0.07, WOODDV, [sx * 0.89, 0.9, -0.34]);
    bx(0.085, 0.04, 0.085, GOLD, [sx * 0.89, 0.02, -0.34]);
    bx(0.085, 0.03, 0.085, GOLD, [sx * 0.89, 1.7, -0.34]);
    sp(0.04, GOLD, [sx * 0.89, 1.9, -0.34]);
    cy(0.012, 0.03, 0.05, 6, GOLD, [sx * 0.89, 1.865, -0.34]);
    bx(0.04, 0.04, 0.34, WOODD, [sx * 0.89, 1.7, -0.18]);
    // tassel
    sp(0.018, GOLD, [sx * 0.89, 1.68, -0.02]);
    b.cards([frame([sx * 0.89, 1.665, -0.02], [0, 1, 0])], TASSEL, { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1] });
  }
  bx(1.72, 0.85, 0.03, WOODDV, [0, 1.325, -0.375]);
  bx(1.92, 0.08, 0.1, WOODD, [0, 1.8, -0.34]);
  bx(1.92, 0.012, 0.104, GOLD, [0, 1.846, -0.34]);
  bx(1.92, 0.012, 0.104, GOLD, [0, 1.76, -0.34]);
  // crest
  b.extrude(
    [
      [-0.3, 0],
      [0.3, 0],
      [0.28, 0.04],
      [0.15, 0.07],
      [0.06, 0.12],
      [0, 0.16, "sharp"],
      [-0.06, 0.12],
      [-0.15, 0.07],
      [-0.28, 0.04],
    ],
    { at: [0, 1.846, -0.34], x: [1, 0, 0], thickness: 0.025, bevel: 0.005, color: GOLD },
  );
  glow(sp(0.026, "#5ef2e0", [0, 1.935, -0.322]), 1.2);
  for (const sx of [-1, 1]) sp(0.014, GOLD_L, [sx * 0.2, 1.89, -0.322]);
  // herb rail
  b.rod([-0.89, 1.7, -0.02], [0.89, 1.7, -0.02], 0.014, WOODFD, { sides: 6 });

  // shelves
  for (const [yy, hh] of [
    [1.15, 0.22],
    [1.42, 0.2],
  ] as const) {
    bx(1.72, 0.03, 0.24, WOODD, [0, yy, -0.25]);
    bx(1.72, 0.012, 0.014, GOLD, [0, yy - 0.012, -0.133]);
    for (const sx of [-1, 1]) {
      bx(0.03, 0.08, 0.2, WOODD, [sx * 0.6, yy - 0.055, -0.26]);
    }
    void hh;
  }

  // bottom shelf contents (y = 1.165)
  const sb = 1.165;
  const endX = bookRow(-0.82, sb, -0.27, [
    [0.04, 0.2, RED],
    [0.05, 0.22, TEAL],
    [0.035, 0.18, PURPLE],
    [0.045, 0.21, BLUE],
    [0.05, 0.19, MAROON],
  ]);
  flatBook(-0.55, sb + 0.02, -0.26, 5, 0.22, 0.04, 0.17, GREEN_D);
  flatBook(-0.55, sb + 0.06, -0.26, -4, 0.2, 0.035, 0.16, GOLD_D);
  void endX;
  potion("flask", -0.2, sb, -0.25, 0.9, "#ff5a7a");
  potion("vial", -0.08, sb, -0.25, 0.9, "#4fd1ff");
  potion("flask", 0.06, sb, -0.25, 1, "#7dff6a");
  potion("square", 0.22, sb, -0.25, 1, "#ffb13d");
  potion("vial", 0.31, sb, -0.25, 1, "#b46cff");
  jar(0, 0, "#000000", "#000000"); // placeholder removed below
  // top shelf contents (y = 1.435)
  const st = 1.435;
  potion("flask", -0.78, st, -0.25, 0.85, "#3affd0");
  potion("flask", -0.66, st, -0.25, 0.85, "#b46cff");
  potion("vial", -0.55, st, -0.25, 1, "#ff5a7a");
  potion("square", -0.45, st, -0.25, 1, "#7dff6a");
  // crystal orb on a gold stand
  lat(
    [
      [0, 0],
      [0.08, 0],
      [0.085, 0.015],
      [0.05, 0.03],
      [0.03, 0.06],
      [0.05, 0.075],
      [0, 0.075],
    ],
    GOLD,
    [0, st, -0.25],
    10,
  );
  glow(sp(0.075, "#6ee8ff", [0, st + 0.14, -0.25]), 1.1);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4;
    P(new THREE.TorusGeometry(0.082, 0.006, 4, 12, Math.PI), GOLD, [0, st + 0.14, -0.25], {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  sp(0.016, GOLD_L, [0, st + 0.225, -0.25]);
  flatBook(0.5, st + 0.02, -0.25, 6, 0.28, 0.04, 0.18, RED, EMB_RED);
  flatBook(0.5, st + 0.06, -0.25, -5, 0.24, 0.035, 0.16, TEAL, EMB_TEAL);
  potion("vial", 0.7, st, -0.25, 1, "#ffb13d");
  potion("flask", 0.2, st, -0.25, 0.9, "#4fd1ff");
  potion("vial", 0.3, st, -0.25, 1, "#7dff6a");
  // hanging lamp-less sign: small gold plaque on back panel
  upPlane(0.0001, 0.0001, LABEL, [0, 0.0, 5]);

  // ================= hanging herb bundles =================
  const hangFrames: ReturnType<typeof frame>[] = [];
  for (const x of [-0.72, -0.5, -0.27, -0.05, 0.18, 0.4, 0.62, 0.8]) {
    cy(0.02, 0.016, 0.03, 8, RED, [x, 1.675, -0.02]);
    bx(0.012, 0.02, 0.012, GOLD, [x, 1.69, -0.02]);
    for (let k = 0; k < 4; k++)
      hangFrames.push(frame([x + (k - 1.5) * 0.012, 1.66, -0.02 + (k % 2) * 0.006], [0, 1, 0]));
  }
  b.cards(hangFrames, [LEAF, LAV, FLOWER, LEAF, LAV], {
    size: [0.1, 0.24],
    lean: 180,
    flow: [0, 0, 1],
    spin: 40,
    vary: 0.25,
    rng: rng(11),
  });

  // ================= scales =================
  const sx0 = -0.62;
  const sz0 = 0.0;
  lat(
    [
      [0, 0],
      [0.1, 0],
      [0.1, 0.015],
      [0.07, 0.03],
      [0.04, 0.05],
      [0, 0.05],
    ],
    GOLD,
    [sx0, T, sz0],
    12,
  );
  b.rod([sx0, T + 0.05, sz0], [sx0, T + 0.4, sz0], 0.012, GOLD, { sides: 8 });
  for (const h of [0.15, 0.27]) sp(0.02, GOLD_D, [sx0, T + h, sz0]);
  sp(0.026, GOLD_L, [sx0, T + 0.42, sz0]);
  bx(0.54, 0.014, 0.02, GOLD, [sx0, T + 0.42, sz0]);
  bx(0.5, 0.004, 0.024, GOLD_D, [sx0, T + 0.42, sz0]);
  cy(0.004, 0.012, 0.045, 6, GOLD, [sx0, T + 0.465, sz0]);
  b.rod([sx0, T + 0.42, sz0 + 0.012], [sx0, T + 0.33, sz0 + 0.012], 0.004, IRON);
  for (const sx of [-1, 1]) {
    const px = sx0 + sx * 0.25;
    sp(0.012, GOLD, [px, T + 0.42, sz0]);
    for (const deg of [90, 210, 330]) {
      const rad = (deg * Math.PI) / 180;
      b.rod([px, T + 0.42, sz0], [px + Math.cos(rad) * 0.092, T + 0.17, sz0 + Math.sin(rad) * 0.092], 0.003, GOLD_D);
    }
    lat(
      [
        [0, 0],
        [0.05, 0],
        [0.09, 0.02],
        [0.095, 0.03],
        [0.09, 0.03],
        [0.05, 0.012],
        [0, 0.012],
      ],
      GOLD,
      [px, T + 0.14, sz0],
      12,
    );
  }
  // pan contents
  sp(0.07, GREEN, [sx0 - 0.25, T + 0.15, sz0], [1, 0.35, 1]);
  b.cards([frame([sx0 - 0.25, T + 0.165, sz0], [0, 1, 0])], [LEAF, FLOWER], {
    size: 0.06,
    lean: 50,
    flow: [1, 0, 0],
    spin: 180,
    cross: true,
  });
  for (let i = 0; i < 3; i++)
    cy(0.022 - i * 0.004, 0.022 - i * 0.004, 0.016, 8, i % 2 ? GOLD_L : GOLD_D, [sx0 + 0.25 + (i - 1) * 0.001, T + 0.162 + i * 0.016, sz0]);
  P(new THREE.OctahedronGeometry(0.02, 0), "#5ef2e0", [sx0 + 0.3, T + 0.178, sz0 + 0.03], { scale: [1, 1.5, 1], flat: true });

  // ================= open spell book =================
  const obx = -0.15;
  const obz = 0.12;
  bx(0.52, 0.016, 0.31, TEAL_D, [obx, T + 0.01, obz]);
  bx(0.54, 0.004, 0.012, GOLD, [obx, T + 0.019, obz + 0.155]);
  bx(0.54, 0.004, 0.012, GOLD, [obx, T + 0.019, obz - 0.155]);
  for (const sign of [-1, 1]) {
    const w = 0.235;
    const h = 0.032;
    const tilt = sign * 5;
    const bxp = obx + sign * 0.125;
    const g = new THREE.BoxGeometry(w, h, 0.27);
    g.rotateZ((tilt * Math.PI) / 180);
    P(g, PAPER, [bxp, T + 0.018 + h / 2, obz]);
    const pg = new THREE.PlaneGeometry(w - 0.01, 0.255);
    pg.rotateX(-Math.PI / 2);
    pg.translate(0, h / 2 + 0.002, 0);
    pg.rotateZ((tilt * Math.PI) / 180);
    P(pg, "#ffffff", [bxp, T + 0.018 + h / 2, obz], { texture: sign < 0 ? PAGE_L : PAGE_R });
  }
  glow(sp(0.012, "#ffe08a", [obx, T + 0.07, obz]), 1.3);
  // ribbon marker
  bx(0.01, 0.002, 0.12, RED, [obx + 0.01, T + 0.05, obz + 0.2], {});

  // ================= inkwell & quill =================
  const ix = 0.14;
  const iz = 0.26;
  lat(
    [
      [0, 0],
      [0.035, 0],
      [0.04, 0.02],
      [0.03, 0.04],
      [0.02, 0.045],
      [0, 0.045],
    ],
    "#2b2350",
    [ix, T, iz],
    10,
  );
  cy(0.026, 0.03, 0.01, 10, GOLD, [ix, T + 0.048, iz]);
  b.rod([ix, T + 0.05, iz], [ix + 0.07, T + 0.2, iz + 0.04], 0.003, CREAM);
  P(new THREE.SphereGeometry(1, 6, 4), "#f4f4ff", [ix + 0.095, T + 0.17, iz + 0.05], {
    scale: [0.012, 0.08, 0.003],
    dir: [0.3, 0.8, 0.15],
  });
  P(new THREE.SphereGeometry(1, 6, 4), TEAL, [ix + 0.1, T + 0.19, iz + 0.056], {
    scale: [0.008, 0.045, 0.002],
    dir: [0.3, 0.8, 0.15],
  });

  // ================= mortar & pestle =================
  const mx = -0.34;
  const mz = -0.22;
  lat(
    [
      [0, 0],
      [0.04, 0],
      [0.065, 0.03],
      [0.075, 0.07],
      [0.075, 0.08],
      [0.062, 0.08],
      [0.052, 0.045],
      [0, 0.04],
    ],
    STONE,
    [mx, T, mz],
    10,
  );
  sp(0.048, GREEN_D, [mx, T + 0.06, mz], [1, 0.4, 1]);
  b.cards([frame([mx, T + 0.06, mz], [0, 1, 0])], [LEAF, FLOWER], { size: 0.05, lean: 60, flow: [1, 0, 0], spin: 180 });
  b.rod([mx + 0.01, T + 0.055, mz], [mx + 0.09, T + 0.2, mz - 0.05], [0.012, 0.02], STONE);
  sp(0.024, STONE, [mx + 0.092, T + 0.205, mz - 0.052]);

  // ================= potion rack =================
  const rx = 0.1;
  const rz = -0.19;
  bx(0.4, 0.02, 0.1, WOODF, [rx, T + 0.01, rz]);
  for (const sx of [-1, 1]) bx(0.02, 0.15, 0.02, WOODF, [rx + sx * 0.19, T + 0.095, rz - 0.035]);
  bx(0.4, 0.016, 0.016, WOODF, [rx, T + 0.15, rz - 0.035]);
  bx(0.4, 0.012, 0.014, GOLD, [rx, T + 0.145, rz + 0.052]);
  const rackCols = ["#ff5a7a", "#4fd1ff", "#7dff6a", "#b46cff", "#ffb13d"];
  rackCols.forEach((c, i) => potion("vial", rx - 0.15 + i * 0.075, T + 0.02, rz, 1, c));

  // ================= loose bottles =================
  potion("flask", 0.32, T, 0.2, 1, "#ff5a7a");
  potion("flask", 0.43, T, 0.26, 0.8, "#3affd0");
  potion("square", 0.34, T, -0.02, 1, "#b46cff");

  // ================= candle =================
  const cx = 0.42;
  const cz = -0.2;
  lat(
    [
      [0, 0],
      [0.06, 0],
      [0.065, 0.012],
      [0.04, 0.02],
      [0, 0.02],
    ],
    GOLD,
    [cx, T, cz],
    10,
  );
  cy(0.022, 0.026, 0.12, 8, CREAM, [cx, T + 0.08, cz]);
  sp(0.008, CREAM, [cx + 0.02, T + 0.1, cz + 0.006], [1, 2.4, 1]);
  sp(0.007, CREAM, [cx - 0.018, T + 0.09, cz - 0.01], [1, 2, 1]);
  b.rod([cx, T + 0.14, cz], [cx, T + 0.15, cz], 0.002, IRON);
  glow(cy(0.0, 0.011, 0.045, 6, ORANGE, [cx, T + 0.175, cz]), 1.4);
  glow(cy(0.0, 0.006, 0.026, 6, GOLD_L, [cx, T + 0.17, cz]), 1.5);

  // ================= book stack with crystal =================
  const bkx = 0.72;
  flatBook(bkx, T + 0.025, -0.08, 8, 0.32, 0.05, 0.24, RED);
  flatBook(bkx, T + 0.07, -0.08, -6, 0.28, 0.04, 0.22, TEAL);
  flatBook(bkx, T + 0.1075, -0.08, 12, 0.24, 0.035, 0.19, PURPLE, EMB_RED);
  const ctop = T + 0.125;
  const crystals: Array<[number, number, number, number, number]> = [
    [0, 0, 0.035, 0.1, 0],
    [0.04, 0.02, 0.025, 0.07, 18],
    [-0.035, 0.02, 0.022, 0.06, -22],
    [0.0, -0.04, 0.02, 0.05, 10],
  ];
  for (const [dx, dz, r, h, tilt] of crystals)
    glow(
      P(new THREE.OctahedronGeometry(1, 0), "#5ef2e0", [bkx + dx - 0.03, ctop + h * 0.8, -0.08 + dz], {
        scale: [r, h, r],
        rotation: [0, 0, tilt],
        flat: true,
      }),
      1.1,
    );

  // ================= potted plant =================
  const ppx = 0.78;
  const ppz = 0.27;
  lat(
    [
      [0, 0],
      [0.045, 0],
      [0.065, 0.09],
      [0.07, 0.1],
      [0.06, 0.1],
      [0.058, 0.09],
      [0, 0.09],
    ],
    "#c9663f",
    [ppx, T, ppz],
    10,
  );
  cy(0.07, 0.07, 0.012, 10, GOLD, [ppx, T + 0.095, ppz]);
  cy(0.058, 0.058, 0.01, 10, BROWN, [ppx, T + 0.085, ppz]);
  const potFrames = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return frame([ppx + Math.cos(a) * 0.015, T + 0.09, ppz + Math.sin(a) * 0.015], [0, 1, 0]);
  });
  b.cards(potFrames, [LEAF, LEAF, FLOWER], {
    size: [0.09, 0.2],
    lean: 35,
    flow: (f) => [f.at.x - ppx, 0, f.at.z - ppz],
    vary: 0.25,
    rng: rng(5),
    bend: 20,
  });

  // ================= loose herbs on the table =================
  const looseFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 7; i++)
    looseFrames.push(frame([-0.62 + i * 0.03 + rand() * 0.02, T + 0.004 + i * 0.0005, 0.3 + rand() * 0.04], [0, 1, 0]));
  b.cards(looseFrames, [LEAF, LAV, FLOWER], {
    size: [0.08, 0.2],
    lean: 90,
    flow: (_f, i) => [Math.sin(i * 1.9) * 0.6, 0, -1],
    mirror: true,
    sink: 0,
    rng: rng(2),
  });
  cy(0.012, 0.012, 0.03, 8, RED, [-0.57, T + 0.012, 0.3], { rotation: [0, 0, 90] });

  // ================= cauldron =================
  const kx = -1.28;
  const kz = 0.2;
  lat(
    [
      [0, 0.05],
      [0.1, 0.05],
      [0.2, 0.14],
      [0.24, 0.24],
      [0.22, 0.34],
      [0.23, 0.355],
      [0.2, 0.36],
      [0.19, 0.34],
      [0.2, 0.24],
      [0.17, 0.15],
      [0.1, 0.09],
      [0, 0.09],
    ],
    IRON,
    [kx, 0, kz],
    12,
  );
  cy(0.236, 0.236, 0.016, 12, GOLD_D, [kx, 0.2, kz]);
  cy(0.222, 0.222, 0.012, 12, GOLD_D, [kx, 0.32, kz]);
  glow(cy(0.188, 0.188, 0.008, 12, "#6bf08a", [kx, 0.3, kz]), 1);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    cy(0.02, 0.012, 0.07, 6, IRON, [kx + Math.cos(a) * 0.13, 0.035, kz + Math.sin(a) * 0.13]);
  }
  for (const [dx, dy, dz, r] of [
    [0.05, 0.33, 0.02, 0.025],
    [-0.07, 0.34, -0.05, 0.018],
    [0.0, 0.37, -0.08, 0.014],
    [-0.04, 0.35, 0.09, 0.02],
  ])
    glow(sp(r, "#b9ffc4", [kx + dx, dy, kz + dz]), 1);
  for (const sx of [-1, 1]) P(new THREE.TorusGeometry(0.04, 0.008, 5, 10, Math.PI), IRON, [kx + sx * 0.235, 0.3, kz], { rotation: [0, 90, 0] });
  glow(cy(0.0, 0.03, 0.07, 6, ORANGE, [kx + 0.08, 0.04, kz + 0.1]), 1.2);
  glow(cy(0.0, 0.025, 0.055, 6, GOLD_L, [kx - 0.1, 0.035, kz + 0.04]), 1.2);
  glow(cy(0.0, 0.025, 0.06, 6, ORANGE, [kx - 0.02, 0.04, kz - 0.12]), 1.2);
  b.rod([kx + 0.03, 0.34, kz + 0.01], [kx + 0.2, 0.48, kz + 0.1], 0.008, WOODFD);
  sp(0.03, WOODFD, [kx + 0.03, 0.34, kz + 0.01], [1, 0.5, 1]);

  // ================= supply crate & sack =================
  const qx = 1.25;
  const qz = 0.12;
  bx(0.5, 0.02, 0.34, WOODD, [qx, 0.01, qz]);
  for (const sz of [-1, 1]) {
    bx(0.5, 0.28, 0.02, WOOD, [qx, 0.16, qz + sz * 0.16]);
    bx(0.5, 0.012, 0.024, GOLD_D, [qx, 0.25, qz + sz * 0.16]);
  }
  for (const sx of [-1, 1]) {
    bx(0.02, 0.28, 0.34, WOOD, [qx + sx * 0.24, 0.16, qz]);
    for (const sz of [-1, 1]) bx(0.04, 0.3, 0.04, WOODDV, [qx + sx * 0.24, 0.16, qz + sz * 0.16]);
  }
  bx(0.46, 0.014, 0.3, STRAW, [qx, 0.27, qz]);
  const cp = [
    [-0.12, 0.05, "#ff5a7a"],
    [0.0, -0.05, "#4fd1ff"],
    [0.12, 0.06, "#b46cff"],
    [0.0, 0.08, "#7dff6a"],
  ] as const;
  cp.forEach(([dx, dz, c], i) => potion(i % 2 ? "vial" : "flask", qx + dx, 0.277, qz + dz, 0.95, c));
  const sk = [qx - 0.52, qz + 0.28];
  sp(1, SACK, [sk[0], 0.19, sk[1]], [0.17, 0.2, 0.14], { flat: true });
  cy(0.05, 0.075, 0.1, 8, SACK, [sk[0], 0.37, sk[1]]);
  cy(0.058, 0.058, 0.018, 8, RED, [sk[0], 0.32, sk[1]]);
  P(new THREE.ConeGeometry(0.09, 0.07, 8), SACK, [sk[0], 0.45, sk[1]]);
  b.cards([frame([sk[0], 0.42, sk[1]], [0, 1, 0])], [LEAF, FLOWER, LAV], {
    size: [0.08, 0.16],
    lean: 25,
    flow: [0.5, 0, 0.6],
    spin: 180,
    rng: rng(3),
  });
  return b.root;
}
