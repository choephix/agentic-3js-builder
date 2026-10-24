```ts
import * as THREE from "three";
import {
  createBuilder,
  svg,
  rng,
  paint,
  mix,
  noise,
  smoothstep,
  patches,
  countershade,
  mottle,
  grain,
  catmull,
  frame,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Sunny Crumb Bakery",
  description:
    "A cosy Animal Crossing style bakery storefront diorama: striped scalloped awning, glowing display window full of bread and cakes, teal door, bunting-bulb valance, dormer, brick chimney, flower boxes, chalkboard, bread table and a potted topiary on a little grass island.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- dimensions
const W = 4.4;
const D = 3.4;
const HW = W / 2;
const HD = D / 2;
const YW = 4.35; // wall top
const YR = YW + 1.25; // ridge
const FLOOR = 0.2; // grass top
const PAVE = 0.23; // paving top

// ---------------------------------------------------------------- palette
const TRIM = "#fffaf0";
const CREAM = "#fff1d6";
const PINK = "#f6a5b8";
const PINKD = "#e4809a";
const TEAL = "#58b9ae";
const TEALD = "#3c8f8a";
const WOOD = "#a86f3f";
const WOODD = "#6e4527";
const WOODL = "#c58a52";
const SOIL = "#6b4a34";
const GOLD = "#f2c14e";
const IRON = "#3d3a40";
const STONE = "#d9c5a3";
const TERRA = "#d97b4f";
const RED = "#e3604f";
const LEAF = "#6dbb55";
const SACK = "#f3e6c8";
const SMOKE = "#fdfbf5";
const CAP = "#b2503a";
const LAMP = "#ffd479";
const CROIS = "#e8a94e";
const BRASS = "#e2b45c";
const WHITE = "#ffffff";
const ROOFD = "#a8482f";

// ---------------------------------------------------------------- helpers for paints
const hash = (a: number, c: number) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(c | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const plaster = (p: THREE.Vector3) => {
  const t = noise(p, 0.6, 3);
  const v = noise(p, 0.12, 8);
  return mix(mix("#fff4dc", "#fbe3b8", smoothstep(0.35, 0.75, t)), "#ffffff", 0.12 * v);
};

const PLASTER = paint((p) => plaster(p));

const WALL = paint((p, n) => {
  if (p.y < 0.9) {
    const u = (Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x) / 0.2;
    const f = u - Math.floor(u);
    let c = mix("#62c4b8", "#4aa89f", noise(p, 0.4, 5));
    if (f < 0.06) c = mix(c, "#2f7f79", 0.7);
    else if (f > 0.9) c = mix(c, "#9be0d6", 0.35);
    return c;
  }
  return plaster(p);
});

const BRICK = paint((p, n) => {
  const u = (Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x) / 0.16;
  const v = p.y / 0.075;
  const row = Math.floor(v);
  const uu = u + (row & 1) * 0.5;
  const col = Math.floor(uu);
  const fu = uu - col;
  const fv = v - row;
  if (fv < 0.14 || fu < 0.07) return "#e8d3b6";
  const c = mix("#c4553d", "#e07a52", hash(col, row));
  return mix(c, "#4a3a35", 0.55 * smoothstep(YW + 1.55, YW + 1.95, p.y));
});

const ROOF_COLORS = ["#d2694a", "#e07f55", "#c85b43", "#e88d5e"];
const roofPaint = (w: number, l: number) =>
  paint((_p, _n, s) => {
    const x = s[0] * w;
    const z = s[1] * l;
    const row = Math.floor(z / 0.2);
    const cx = (x + (row & 1) * 0.15) / 0.3;
    const col = Math.floor(cx);
    const fx = cx - col;
    const fz = z / 0.2 - row;
    const base = ROOF_COLORS[Math.floor(hash(col, row) * 4)];
    if (fx < 0.04 || fz < 0.08 || fz > 0.9) return mix(base, "#7d3526", 0.55);
    return mix(base, "#ffd2a0", 0.14 * (1 - fz));
  });
const ROOF_MAIN = roofPaint(5.1, 2.6);
const ROOF_DORM = roofPaint(0.68, 0.8);

const GRASS = countershade(mottle("#8fd36a", "#79c25a", { size: 0.5, seed: 2 }), "#8a5f3d", { level: 0.55, soft: 0.12 });
const PAVE_TOP = patches("#b99d7c", ["#ecd8b0", "#f3e2bd", "#dfc79c"], { size: 0.42, gap: 0.07, seed: 4 });
const PAVE_P = paint((_p, n) => (n.y > 0.7 ? PAVE_TOP : "#bfa27e"));
const WOODP = grain(WOOD, WOODD, { size: 0.03, axis: "y", seed: 3 });
const WOODH = grain(WOODL, WOOD, { size: 0.03, axis: "x", seed: 6 });
const BUSHP = countershade(mottle("#5fb04f", "#86cf66", { size: 0.3, seed: 9 }), "#3f8a3f", { level: -0.2 });
const TOPIARY = countershade(mottle("#58aa4c", "#7fcc62", { size: 0.25, seed: 12 }), "#3d8340", { level: -0.1 });
const LOAF = countershade("#f2b865", "#bf7a32", { level: 0.1, soft: 0.5 });
const BAGUETTE = paint((_p, n, s) => {
  const a = ((s[1] % 360) + 360) % 360;
  const top = a < 55 || a > 305;
  if (top && Math.sin(s[0] * 34 + a * 0.03) > 0.55) return "#f7dca0";
  return mix("#dd9a42", "#b4702a", n.y < 0 ? 0.65 : 0.1);
});
const GINGHAM = paint((p, n) => {
  if (n.y < 0.5) return PINKD;
  const a = Math.floor(p.x / 0.05) % 2 === 0;
  const c = Math.floor(p.z / 0.05) % 2 === 0;
  return a && c ? "#e98aa3" : a || c ? "#f9c6d3" : "#fff8f8";
});
const POT = paint((p) => {
  const h = p.y - PAVE;
  if (h > 0.38 && h < 0.43) return "#f2a07a";
  return mix("#d97b4f", "#c46a42", noise(p, 0.2, 2));
});

// ---------------------------------------------------------------- svg pieces
const boule = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="15" ry="10" fill="#d9944a" stroke="#7a431c" stroke-width="2"/><ellipse cy="-3" rx="10" ry="5" fill="#ecb870"/><path d="M-7 -3 L-3 -8 M0 -3 L4 -8 M7 -2 L10 -6" stroke="#8a4f22" stroke-width="2" stroke-linecap="round"/></g>`;
const baguette = (x: number, y: number, r: number, s = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><rect x="-22" y="-5" width="44" height="10" rx="5" fill="#dca052" stroke="#7a431c" stroke-width="2"/><path d="M-14 -3 l5 6 M-4 -3 l5 6 M6 -3 l5 6 M15 -3 l4 6" stroke="#fbe2a8" stroke-width="2" stroke-linecap="round"/></g>`;
const croissant = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-17 6 Q-17 -9 0 -9 Q17 -9 17 6 Q11 1 7 3 Q0 -3 -7 3 Q-11 1 -17 6Z" fill="#e8a94e" stroke="#7a431c" stroke-width="2" stroke-linejoin="round"/><path d="M-6 -8 L-4 2 M6 -8 L4 2" stroke="#b9702c" stroke-width="1.6"/></g>`;
const cupcake = (x: number, y: number, frost: string) =>
  `<g transform="translate(${x} ${y})"><path d="M-8 0 L8 0 L6 10 L-6 10Z" fill="#f4e4c1" stroke="#7a431c" stroke-width="1.6"/><path d="M-9 0 Q-10 -7 -3 -8 Q0 -14 4 -8 Q10 -7 9 0Z" fill="${frost}" stroke="#7a431c" stroke-width="1.6" stroke-linejoin="round"/><circle cx="0" cy="-12" r="2.6" fill="#e3434f" stroke="#7a431c" stroke-width="1"/></g>`;
const cake = (x: number, y: number, s: number, top: string) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="9" width="8" height="8" fill="#f4eee0" stroke="#7a431c" stroke-width="1.6"/><rect x="-18" y="15" width="36" height="4" rx="2" fill="#f4eee0" stroke="#7a431c" stroke-width="1.6"/><rect x="-16" y="-6" width="32" height="15" rx="4" fill="${top}" stroke="#7a431c" stroke-width="1.8"/><path d="M-16 -2 Q-12 5 -8 -2 Q-4 5 0 -2 Q4 5 8 -2 Q12 5 16 -2 L16 -6 L-16 -6Z" fill="#fff7f0" stroke="#7a431c" stroke-width="1.4" stroke-linejoin="round"/><circle cx="-7" cy="-9" r="3.2" fill="#e3434f" stroke="#7a431c" stroke-width="1.2"/><circle cx="6" cy="-9" r="3.2" fill="#e3434f" stroke="#7a431c" stroke-width="1.2"/></g>`;
const pie = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><ellipse rx="19" ry="7" fill="#f4eee0" stroke="#7a431c" stroke-width="1.8"/><ellipse cy="-2" rx="16" ry="6" fill="#d9944a" stroke="#7a431c" stroke-width="1.6"/><path d="M-9 -6 L9 2 M-3 -8 L13 0 M3 -8 L-13 -0 M9 -6 L-9 3" stroke="#f0c07a" stroke-width="2.2" stroke-linecap="round"/></g>`;
const wheat = (x: number) =>
  `<g transform="translate(${x} 70)"><path d="M0 0 Q2 -25 0 -52" stroke="#a87a2a" stroke-width="2.5" fill="none"/>${[0, 1, 2, 3, 4]
    .map(
      (i) =>
        `<ellipse cx="-4" cy="${-48 + i * 8}" rx="2.6" ry="5" transform="rotate(-30 -4 ${-48 + i * 8})" fill="#f2c14e" stroke="#a87a2a" stroke-width=".8"/><ellipse cx="4" cy="${-48 + i * 8}" rx="2.6" ry="5" transform="rotate(30 4 ${-48 + i * 8})" fill="#f2c14e" stroke="#a87a2a" stroke-width=".8"/>`,
    )
    .join("")}<ellipse cx="0" cy="-56" rx="2.6" ry="5" fill="#f2c14e" stroke="#a87a2a" stroke-width=".8"/></g>`;

const valanceSvg = (() => {
  let d = "M0 0 H240 V12 ";
  for (let i = 0; i < 12; i++) d += ` Q${230 - i * 20} 26 ${220 - i * 20} 12`;
  return d + " Z";
})();

// ---------------------------------------------------------------- textures
const T = {
  window: svg(
    `<svg viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b0"/><stop offset="1" stop-color="#ffbf73"/></linearGradient>
      <radialGradient id="hl" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="240" height="130" fill="url(#bg)"/>
    ${[...Array(12)].map((_, i) => `<rect x="${i * 20 + 4}" y="0" width="8" height="130" fill="#ffd9a0" opacity=".4"/>`).join("")}
    <rect width="240" height="130" fill="url(#hl)"/>
    <rect y="48" width="240" height="6" fill="#a8703d"/><rect y="54" width="240" height="3" fill="#c98a55" opacity=".5"/>
    <rect y="90" width="240" height="6" fill="#a8703d"/><rect y="96" width="240" height="3" fill="#c98a55" opacity=".5"/>
    ${boule(22, 38, 1)}${boule(52, 38, 1)}${croissant(84, 40, 1)}${croissant(112, 40, 1)}
    ${cupcake(142, 36, "#f6a5b8")}${cupcake(164, 36, "#ffe08a")}${cupcake(186, 36, "#a8e6cf")}${boule(216, 38, 1)}
    ${cake(36, 66, 1.25, "#ffd9e4")}
    <rect x="86" y="72" width="34" height="18" rx="3" fill="#b9803f" stroke="#7a431c" stroke-width="2"/>
    ${baguette(96, 62, -72, 0.7)}${baguette(104, 60, -90, 0.7)}${baguette(112, 62, -108, 0.7)}
    <path d="M88 78 H118 M88 84 H118" stroke="#7a431c" stroke-width="1.4"/>
    ${pie(150, 82)}${boule(190, 80, 1.1)}${boule(218, 82, 0.9)}
    ${cake(112, 104, 1.1, "#d9f0ff")}
    ${[0, 1, 2, 3].map((i) => `<g transform="translate(${34 + i * 24} 112)"><ellipse rx="10" ry="6" fill="#f4a8b9" stroke="#7a431c" stroke-width="1.6"/><ellipse rx="3.4" ry="2" fill="#ffd9a0"/></g>`).join("")}
    ${cake(190, 104, 1.2, "#ffe9a8")}
    <rect y="116" width="240" height="14" fill="#c98a55"/><rect y="116" width="240" height="3" fill="#e5ad78"/>
    <path d="${valanceSvg}" fill="#f6a5b8" stroke="#c9607b" stroke-width="1.5"/>
    ${[40, 120, 200].map((x) => `<path d="M${x} 14 V30" stroke="#6e4527" stroke-width="1.4"/><circle cx="${x}" cy="34" r="9" fill="#fff4b0" opacity=".45"/><circle cx="${x}" cy="34" r="5" fill="#fff8cc" stroke="#e0b23c" stroke-width="1.2"/>`).join("")}
  </svg>`,
    { size: 768 },
  ),
  sign: svg(
    `<svg viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="296" height="76" rx="20" fill="#fff0cf" stroke="#7a4a2a" stroke-width="5"/>
    <rect x="11" y="11" width="278" height="58" rx="13" fill="none" stroke="#f2a7b6" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
    ${wheat(18)}${wheat(282)}
    ${boule(54, 42, 1.25)}${croissant(246, 42, 1.25)}
    <text x="150" y="55" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="46" fill="#ffffff" stroke="#ffffff" stroke-width="7" stroke-linejoin="round">Bakery</text>
    <text x="150" y="55" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="46" fill="#7a4a2a">Bakery</text>
    <path d="M118 66 q4 -5 8 0 q4 -5 8 0 M166 66 q4 -5 8 0 q4 -5 8 0" stroke="#e4809a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 1024 },
  ),
  door: svg(
    `<svg viewBox="0 0 100 216" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b8"/><stop offset="1" stop-color="#ffc880"/></linearGradient></defs>
    <rect x="1" y="1" width="98" height="214" rx="6" fill="#4db5aa" stroke="#2f7f79" stroke-width="2"/>
    <rect x="9" y="9" width="82" height="112" rx="8" fill="#3a948d"/>
    <rect x="14" y="14" width="72" height="102" rx="5" fill="url(#g)"/>
    <path d="M50 14 V116 M14 48 H86 M14 82 H86" stroke="#3a948d" stroke-width="3"/>
    <path d="M14 14 H86 V26 Q80 36 74 26 Q68 36 62 26 Q56 36 50 26 Q44 36 38 26 Q32 36 26 26 Q20 36 14 26 Z" fill="#f6a5b8" stroke="#c9607b" stroke-width="1.2"/>
    <path d="M40 60 L50 48 L60 60" stroke="#7a4a2a" stroke-width="1.6" fill="none"/>
    <rect x="29" y="60" width="42" height="22" rx="5" fill="#fff4dc" stroke="#b9702c" stroke-width="2"/>
    <text x="50" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#e3604f">OPEN</text>
    <rect x="14" y="130" width="72" height="38" rx="5" fill="#59c3b7" stroke="#2f7f79" stroke-width="2"/>
    <rect x="19" y="135" width="62" height="28" rx="3" fill="none" stroke="#8fe0d4" stroke-width="1.6"/>
    <rect x="14" y="172" width="72" height="22" rx="5" fill="#59c3b7" stroke="#2f7f79" stroke-width="2"/>
    <rect x="19" y="177" width="62" height="12" rx="3" fill="none" stroke="#8fe0d4" stroke-width="1.6"/>
    <rect x="9" y="199" width="82" height="12" rx="3" fill="#e2b45c" stroke="#a87a2a" stroke-width="1.5"/>
    <circle cx="16" cy="205" r="1.6" fill="#a87a2a"/><circle cx="84" cy="205" r="1.6" fill="#a87a2a"/>
  </svg>`,
    { size: 640 },
  ),
  chalk: svg(
    `<svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="78" height="108" rx="6" fill="#b07a47" stroke="#6e4527" stroke-width="2"/>
    <rect x="6" y="6" width="68" height="98" rx="3" fill="#2f4a3d" stroke="#6e4527" stroke-width="1.5"/>
    <text x="40" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#fffbe8">FRESH</text>
    <text x="40" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffd1dc">TODAY!</text>
    <path d="M14 48 Q24 52 34 47 T54 47 T66 48" stroke="#fffbe8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <g fill="none" stroke="#fffbe8" stroke-width="1.8" stroke-linecap="round">
      <ellipse cx="26" cy="66" rx="12" ry="8"/><path d="M19 64 l3 -4 M25 64 l3 -4 M31 65 l3 -4"/>
      <path d="M44 72 Q44 60 52 58 Q60 60 60 72 Z"/><path d="M42 72 H62"/><circle cx="52" cy="55" r="2.5" stroke="#ff9eb3"/>
    </g>
    <path d="M14 86 H66 M14 94 H50" stroke="#fffbe8" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>
    <path d="M62 92 q-3 -4 0 -6 q3 -2 3 1 q3 -3 4 1 q0 3 -7 7z" fill="#ff9eb3"/>
  </svg>`,
    { size: 512 },
  ),
  pretzel: svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#fff0cf" stroke="#7a4a2a" stroke-width="4"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#f2a7b6" stroke-width="2.5" stroke-dasharray="1 6" stroke-linecap="round"/>
    <path d="M28 70 C8 52 20 22 42 30 C56 36 56 56 50 64 M72 70 C92 52 80 22 58 30 C44 36 44 56 50 64 M28 70 C40 84 60 84 72 70" stroke="#8a4a1c" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M28 70 C8 52 20 22 42 30 C56 36 56 56 50 64 M72 70 C92 52 80 22 58 30 C44 36 44 56 50 64 M28 70 C40 84 60 84 72 70" stroke="#d99440" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#ffffff"><circle cx="22" cy="46" r="1.6"/><circle cx="36" cy="36" r="1.6"/><circle cx="78" cy="46" r="1.6"/><circle cx="64" cy="36" r="1.6"/><circle cx="50" cy="80" r="1.6"/><circle cx="38" cy="78" r="1.6"/><circle cx="62" cy="78" r="1.6"/></g>
  </svg>`,
    { size: 256 },
  ),
  attic: svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#ffe9b8"/></linearGradient></defs>
    <circle cx="50" cy="50" r="48" fill="#fff6e0" stroke="#c9b48a" stroke-width="2"/>
    <circle cx="50" cy="50" r="39" fill="url(#s)" stroke="#3c8f8a" stroke-width="5"/>
    <path d="M50 11 V89 M11 50 H89" stroke="#fff6e0" stroke-width="4"/>
    <path d="M22 34 A32 32 0 0 1 38 20" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M14 50 Q24 56 30 78 Q18 72 14 50Z M86 50 Q76 56 70 78 Q82 72 86 50Z" fill="#f6a5b8" opacity=".9"/>
    <path d="M50 4 q-5 -4 -7 1 q-1 5 7 9 q8 -4 7 -9 q-2 -5 -7 -1z" fill="#e4809a" transform="translate(0 -1) scale(.9 .9) translate(5.5 0)"/>
  </svg>`,
    { size: 256 },
  ),
  side: svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdeeff"/><stop offset="1" stop-color="#ffe3a8"/></linearGradient></defs>
    <rect x="2" y="2" width="76" height="96" rx="4" fill="url(#g)" stroke="#fff6e0" stroke-width="3"/>
    <path d="M40 2 V98 M2 50 H78" stroke="#fff6e0" stroke-width="3.5"/>
    <path d="M2 2 H24 Q22 40 8 66 Q4 40 2 2Z M78 2 H56 Q58 40 72 66 Q76 40 78 2Z" fill="#f6a5b8" stroke="#c9607b" stroke-width="1.2"/>
    <path d="M6 58 Q14 54 20 60 M74 58 Q66 54 60 60" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <rect x="31" y="78" width="18" height="16" rx="3" fill="#d97b4f" stroke="#7a3f2a" stroke-width="1.5"/>
    <path d="M40 78 Q30 64 36 56 Q40 66 40 78 M40 78 Q50 64 44 56 Q40 66 40 78" fill="#5fb04f" stroke="#2f6f33" stroke-width="1.2"/>
  </svg>`,
    { size: 384 },
  ),
  mat: svg(
    `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="78" height="48" rx="8" fill="#e3604f" stroke="#a83a2e" stroke-width="2"/>
    <rect x="6" y="6" width="68" height="38" rx="5" fill="none" stroke="#fff1d6" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="40" y="32" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#fff1d6">HELLO</text>
  </svg>`,
    { size: 256 },
  ),
  tuft: svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 40 Q6 20 2 8 Q12 18 14 40Z" fill="#5fb04f" stroke="#2f7a33" stroke-width="1"/>
    <path d="M14 40 Q16 16 20 2 Q26 18 26 40Z" fill="#7fcc62" stroke="#2f7a33" stroke-width="1"/>
    <path d="M26 40 Q28 22 38 10 Q36 26 34 40Z" fill="#5fb04f" stroke="#2f7a33" stroke-width="1"/>
  </svg>`,
    { size: 96 },
  ),
  leafy: svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    ${[-60, -30, 0, 30, 60].map((a) => `<ellipse cx="20" cy="22" rx="5.5" ry="13" transform="rotate(${a} 20 40)" fill="${a % 60 === 0 ? "#5fb04f" : "#7fcc62"}" stroke="#2f6f33" stroke-width="1.2"/>`).join("")}
  </svg>`,
    { size: 128 },
  ),
};

const flowerSvg = (petal: string, mid: string) =>
  svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 63 Q18 46 20 28" stroke="#3f8f3f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="12" cy="48" rx="8" ry="3.6" transform="rotate(-30 12 48)" fill="#5fb04f" stroke="#2f6f33" stroke-width="1.2"/>
    <ellipse cx="28" cy="42" rx="8" ry="3.6" transform="rotate(30 28 42)" fill="#5fb04f" stroke="#2f6f33" stroke-width="1.2"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="20" cy="13" rx="6" ry="9" transform="rotate(${a} 20 22)" fill="${petal}" stroke="#8a4a5c" stroke-width="1"/>`).join("")}
    <circle cx="20" cy="22" r="5.5" fill="${mid}" stroke="#8a4a5c" stroke-width="1"/>
  </svg>`,
    { size: 128 },
  );
const FLOWER_P = flowerSvg("#ff9fbd", "#ffe27a");
const FLOWER_Y = flowerSvg("#fff6c8", "#f2a31e");

// ---------------------------------------------------------------- the model
export default function build() {
  const b = createBuilder({ name: "sunny-crumb-bakery" });
  const R = rng(11);

  const box = (w: number, h: number, d: number, at: V, color: any, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { at, rotation: rot } : { at });

  // a bevelled slab: width w along dirX, height h along y, thickness d
  const soft = (w: number, h: number, d: number, at: V, color: any, bevel = 0.02, dirX: V = [1, 0, 0]) =>
    b.extrude(
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ],
      { at, x: dirX, thickness: d, bevel, color },
    );

  const tex = (
    t: THREE.Texture,
    w: number,
    h: number,
    at: V,
    dir: V = [0, 0, 1],
    opts: { up?: V; glow?: number } = {},
  ) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), WHITE, {
      at,
      dir,
      axis: "z",
      texture: t,
      ...(opts.up ? { up: opts.up } : {}),
    });
    if (opts.glow) glow(p, opts.glow);
    return p;
  };

  const rr = (x0: number, x1: number, z0: number, z1: number, c: number): [number, number][] => [
    [x0 + c, -z1],
    [x1 - c, -z1],
    [x1, -z1 + c],
    [x1, -z0 - c],
    [x1 - c, -z0],
    [x0 + c, -z0],
    [x0, -z0 - c],
    [x0, -z1 + c],
  ];

  // ============================================================ ground
  const grass = b.extrude(rr(-3.5, 3.5, -2.4, 4.7, 0.6), {
    at: [0, 0.1, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.2,
    bevel: 0.03,
    smoothing: 2,
    color: GRASS,
  });
  b.extrude(rr(-3.3, 3.3, 1.7, 4.5, 0.35), {
    at: [0, PAVE / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: PAVE,
    bevel: 0.03,
    smoothing: 1,
    color: PAVE_P,
  });

  // ============================================================ walls
  b.part(new THREE.BoxGeometry(W, YW - 0.1, D), WALL, { at: [0, (YW + 0.1) / 2, 0] });
  soft(W + 0.08, 0.07, D + 0.08, [0, 0.93, 0], TRIM, 0.015);
  soft(W + 0.08, 0.1, D + 0.08, [0, 0.24, 0], TRIM, 0.02);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) soft(0.2, YW - 0.1, 0.2, [sx * HW, (YW + 0.1) / 2, sz * HD], TRIM, 0.03);

  // gable end triangles + round vents
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-HD, 0],
        [HD, 0],
        [0, 1.25, "sharp"],
      ],
      { at: [s * (HW - 0.15), YW - 0.02, 0], x: [0, 0, 1], thickness: 0.3, color: PLASTER },
    );
    tex(T.attic, 0.52, 0.52, [s * (HW + 0.004), YW + 0.45, 0], [s, 0, 0], { glow: 0.4 });
  }

  // ============================================================ roof
  const tanR = 1.25 / HD;
  const thDeg = (Math.atan(tanR) * 180) / Math.PI;
  const eaveZ = HD + 0.35;
  const eaveY = YR - eaveZ * tanR;
  const rlen = Math.hypot(eaveZ, YR - eaveY) + 0.05;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(5.1, 0.12, rlen), ROOF_MAIN, {
      at: [0, (YR + eaveY) / 2 - 0.04, (s * eaveZ) / 2],
      rotation: [s * thDeg, 0, 0],
    });
    b.rod([-2.5, eaveY - 0.1, s * (eaveZ + 0.02)], [2.5, eaveY - 0.1, s * (eaveZ + 0.02)], 0.05, { color: TRIM, sides: 6 });
  }
  b.rod([-2.58, YR + 0.03, 0], [2.58, YR + 0.03, 0], 0.09, { color: ROOFD, sides: 6 });

  // dormer
  const DZ = 1.12;
  b.part(new THREE.BoxGeometry(0.9, 0.7, 0.62), PLASTER, { at: [0, YW + 0.5, DZ] });
  b.extrude(
    [
      [-0.45, 0],
      [0.45, 0],
      [0, 0.3, "sharp"],
    ],
    { at: [0, YW + 0.85, DZ], x: [1, 0, 0], thickness: 0.62, color: PLASTER },
  );
  tex(T.attic, 0.5, 0.5, [0, YW + 0.5, DZ + 0.314], [0, 0, 1], { glow: 0.4 });
  b.part(new THREE.TorusGeometry(0.26, 0.022, 4, 16), TRIM, { at: [0, YW + 0.5, DZ + 0.318] });
  for (const s of [1, -1]) soft(0.07, 0.72, 0.07, [s * 0.46, YW + 0.5, DZ + 0.3], TRIM, 0.01);
  const phi = (Math.atan(0.3 / 0.45) * 180) / Math.PI;
  const yA = YW + 1.15;
  const yE = yA - 0.53 * (0.3 / 0.45);
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.68, 0.05, 0.8), ROOF_DORM, {
      at: [s * 0.265, (yA + yE) / 2 + 0.035, DZ + 0.05],
      rotation: [0, 0, -s * phi],
    });
  b.rod([0, yA + 0.05, DZ - 0.35], [0, yA + 0.05, DZ + 0.45], 0.035, { color: ROOFD, sides: 5 });

  // chimney
  const CX = 1.5;
  const CZ = -0.55;
  b.part(new THREE.BoxGeometry(0.5, 1.95, 0.5), BRICK, { at: [CX, YW + 0.9, CZ] });
  soft(0.62, 0.12, 0.62, [CX, YW + 1.9, CZ], CAP, 0.02);
  for (const dx of [-0.12, 0.12])
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 6), TERRA, { at: [CX + dx, YW + 2.05, CZ] });
  [
    [0.0, 2.35, 0.2],
    [0.12, 2.65, 0.28],
    [0.3, 2.98, 0.34],
  ].forEach(([dx, dy, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 1), SMOKE, { at: [CX + dx, YW + dy, CZ], flat: true }),
  );

  // weathervane
  const WVX = -1.4;
  b.rod([WVX, YR, 0], [WVX, YR + 0.55, 0], 0.016, { color: IRON, sides: 6 });
  b.rod([WVX - 0.18, YR + 0.28, 0], [WVX + 0.18, YR + 0.28, 0], 0.01, { color: IRON, sides: 5 });
  b.rod([WVX, YR + 0.28, -0.18], [WVX, YR + 0.28, 0.18], 0.01, { color: IRON, sides: 5 });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { at: [WVX, YR + 0.58, 0] });
  b.extrude(
    [
      [-0.28, -0.08],
      [-0.2, 0],
      [-0.28, 0.08],
      [0.1, 0.03],
      [0.1, 0.09],
      [0.3, 0, "sharp"],
      [0.1, -0.09],
      [0.1, -0.03],
    ],
    { at: [WVX, YR + 0.46, 0], x: [0, 0, 1], thickness: 0.018, color: GOLD },
  );

  // ============================================================ shop window
  const WX = -0.7;
  const WWd = 2.2;
  const WH = 1.2;
  tex(T.window, WWd, WH, [WX, 1.7, HD + 0.012], [0, 0, 1], { glow: 0.75 });
  soft(WWd + 0.26, 0.12, 0.12, [WX, 2.36, HD + 0.05], TRIM, 0.015);
  soft(WWd + 0.4, 0.09, 0.24, [WX, 1.04, HD + 0.1], TRIM, 0.02);
  for (const s of [1, -1]) soft(0.12, WH + 0.14, 0.12, [WX + s * (WWd / 2 + 0.06), 1.7, HD + 0.05], TRIM, 0.015);
  for (const s of [1, -1]) soft(0.05, WH, 0.06, [WX + s * (WWd / 6), 1.7, HD + 0.035], TRIM, 0.01);
  soft(WWd, 0.05, 0.06, [WX, 2.02, HD + 0.035], TRIM, 0.01);
  // planter
  b.part(new THREE.BoxGeometry(2.0, 0.3, 0.3), WOODH, { at: [WX, 0.72, HD + 0.17] });
  box(2.06, 0.05, 0.34, [WX, 0.9, HD + 0.17], WOODD);
  box(1.92, 0.04, 0.24, [WX, 0.9, HD + 0.17], SOIL);
  for (let i = 0; i < 4; i++) soft(0.04, 0.3, 0.02, [WX - 0.75 + i * 0.5, 0.72, HD + 0.325], WOODD, 0.005);
  const planterFrames = (n: number, x0: number, x1: number, y: number, z: number, jit = 0.04) =>
    Array.from({ length: n }, (_, i) =>
      frame([x0 + ((x1 - x0) * i) / (n - 1) + (R() - 0.5) * jit, y, z + (R() - 0.5) * 0.08], [0, 1, 0]),
    );
  b.cards(planterFrames(12, WX - 0.9, WX + 0.9, 0.9, HD + 0.17), T.leafy, {
    size: [0.22, 0.22],
    vary: 0.25,
    spin: 25,
    rng: R,
    cross: true,
  });
  b.cards(planterFrames(8, WX - 0.85, WX + 0.85, 0.9, HD + 0.17), [FLOWER_P, FLOWER_Y], {
    size: [0.16, 0.26],
    vary: 0.2,
    rng: R,
    cross: true,
  });

  // ============================================================ door
  const DX = 1.45;
  tex(T.door, 0.95, 2.1, [DX, 1.3, HD + 0.043]);
  box(0.95, 2.1, 0.05, [DX, 1.3, HD + 0.015], TEAL);
  for (const s of [1, -1]) soft(0.1, 2.3, 0.14, [DX + s * 0.525, 1.38, HD + 0.05], TRIM, 0.015);
  soft(1.28, 0.14, 0.18, [DX, 2.48, HD + 0.07], TRIM, 0.02);
  b.part(new THREE.SphereGeometry(0.04, 6, 5), BRASS, { at: [DX - 0.33, 1.2, HD + 0.1] });
  box(0.05, 0.16, 0.012, [DX - 0.33, 1.2, HD + 0.075], BRASS);
  soft(1.3, 0.07, 0.4, [DX, 0.265, HD + 0.2], STONE, 0.015);
  tex(T.mat, 0.8, 0.5, [DX, PAVE + 0.006, HD + 0.65], [0, 1, 0], { up: [0, 0, -1] });
  // wall lantern on the pilaster
  const lantern = (x: number, y: number) => {
    b.rod([x, y + 0.12, HD], [x, y + 0.12, HD + 0.18], 0.012, { color: IRON, sides: 5 });
    glow(b.part(new THREE.BoxGeometry(0.12, 0.18, 0.12), LAMP, { at: [x, y, HD + 0.18] }), 1.4);
    b.part(new THREE.ConeGeometry(0.1, 0.09, 4), IRON, { at: [x, y + 0.135, HD + 0.18], rotation: [0, 45, 0] });
    box(0.14, 0.03, 0.14, [x, y - 0.105, HD + 0.18], IRON);
    b.part(new THREE.SphereGeometry(0.02, 5, 4), IRON, { at: [x, y + 0.19, HD + 0.18] });
  };
  lantern(0.7, 1.95);

  // ============================================================ sign
  b.extrude(
    [
      [-1.55, -0.35],
      [1.55, -0.35],
      [1.55, 0.2],
      [1.2, 0.3],
      [0.5, 0.33],
      [0, 0.4],
      [-0.5, 0.33],
      [-1.2, 0.3],
      [-1.55, 0.2],
    ],
    { at: [0, 3.6, HD + 0.07], x: [1, 0, 0], thickness: 0.1, bevel: 0.02, smoothing: 1, color: WOODL },
  );
  tex(T.sign, 2.82, 0.75, [0, 3.6, HD + 0.126]);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 6, 4), PINKD, { at: [s * 1.62, 3.3, HD + 0.1] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), PINKD, { at: [s * 1.62, 3.85, HD + 0.1] });
  }

  // ============================================================ awning
  const AY = 3.1;
  const AL = 1.1;
  const AD = 0.5;
  const nS = 12;
  const aw = 4.2;
  const sw = aw / nS;
  const hh = sw / 2 - 0.002;
  for (let i = 0; i < nS; i++) {
    const x = -aw / 2 + sw * (i + 0.5);
    const col = i % 2 ? CREAM : PINK;
    b.extrude(
      [
        [0, 0],
        [AL, -AD],
        [AL, -AD - 0.05],
        [0, -0.05],
      ],
      { at: [x, AY, HD], x: [0, 0, 1], thickness: sw - 0.004, color: col },
    );
    b.extrude(
      [
        [-hh, 0.03],
        [hh, 0.03],
        [hh, -0.12],
        [0.66 * hh, -0.2],
        [0, -0.24],
        [-0.66 * hh, -0.2],
        [-hh, -0.12],
      ],
      { at: [x, AY - AD, HD + AL], x: [1, 0, 0], thickness: 0.045, bevel: 0.008, smoothing: 1, color: col },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.028, 6, 4), LAMP, { at: [x, AY - AD - 0.27, HD + AL + 0.03] }),
      1.6,
    );
  }
  for (const s of [1, -1])
    b.extrude(
      [
        [0, -0.05],
        [AL, -AD - 0.05],
        [0, -AD - 0.05],
      ],
      { at: [s * (aw / 2 - 0.01), AY, HD], x: [0, 0, 1], thickness: 0.03, color: s > 0 ? PINK : CREAM },
    );
  // awning wall rail
  b.rod([-aw / 2, AY + 0.03, HD + 0.03], [aw / 2, AY + 0.03, HD + 0.03], 0.035, { color: WOODL, sides: 6 });

  // ============================================================ hanging pretzel sign (door-side corner)
  const hx = HW + 0.0;
  b.rod([hx, 3.78, HD + 0.08], [hx, 3.78, HD + 0.95], 0.022, { color: IRON, sides: 6 });
  b.rod([hx, 3.3, HD + 0.08], [hx, 3.74, HD + 0.75], 0.016, { color: IRON, sides: 5 });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), IRON, { at: [hx, 3.78, HD + 0.97] });
  for (const z of [HD + 0.38, HD + 0.78]) b.rod([hx, 3.78, z], [hx, 3.4, z], 0.007, { color: IRON, sides: 4 });
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 14), WOODL, { at: [hx, 3.13, HD + 0.58], dir: [1, 0, 0] });
  for (const s of [1, -1]) tex(T.pretzel, 0.5, 0.5, [hx + s * 0.024, 3.13, HD + 0.58], [s, 0, 0]);

  // ============================================================ side windows
  const sideWindow = (s: number, z: number) => {
    const X = s * HW;
    tex(T.side, 0.8, 1.0, [X + s * 0.012, 2.4, z], [s, 0, 0], { glow: 0.45 });
    const sx = (w: number, h: number, d: number, y: number, zz: number, col: any, xo: number) =>
      soft(w, h, d, [X + s * xo, y, zz], col, 0.015, [0, 0, 1]);
    sx(0.98, 0.1, 0.1, 2.95, z, TRIM, 0.05);
    sx(1.1, 0.08, 0.2, 1.88, z, TRIM, 0.1);
    sx(0.08, 1.0, 0.1, 2.4, z - 0.44, TRIM, 0.05);
    sx(0.08, 1.0, 0.1, 2.4, z + 0.44, TRIM, 0.05);
    for (const q of [-1, 1]) {
      const zz = z + q * 0.7;
      sx(0.36, 1.04, 0.05, 2.42, zz, TEAL, 0.04);
      for (let k = 0; k < 4; k++) sx(0.3, 0.035, 0.02, 2.0 + k * 0.28, zz, TEALD, 0.075);
      b.part(new THREE.SphereGeometry(0.02, 5, 4), PINKD, { at: [X + s * 0.07, 2.42, zz - q * 0.14] });
    }
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.95), WOODH, { at: [X + s * 0.12, 1.77, z] });
    b.cards(
      Array.from({ length: 6 }, (_, i) => frame([X + s * 0.12, 1.88, z - 0.4 + i * 0.16], [0, 1, 0])),
      [FLOWER_P, FLOWER_Y, T.leafy],
      { size: [0.16, 0.24], vary: 0.2, rng: R, cross: true },
    );
  };
  sideWindow(1, 0.35);
  sideWindow(-1, 0.35);

  // ============================================================ props
  // potted topiary
  const TX = -2.8;
  const TZ = 2.1;
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.26, 0.4],
      [0.3, 0.42],
      [0.3, 0.5],
      [0.24, 0.5],
      [0, 0.44],
    ],
    { at: [TX, PAVE, TZ], segments: 9, color: POT },
  );
  b.part(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 9), SOIL, { at: [TX, PAVE + 0.47, TZ] });
  b.rod([TX, PAVE + 0.46, TZ], [TX, PAVE + 1.0, TZ], 0.045, { color: WOODD, sides: 6 });
  const crown = b.part(new THREE.IcosahedronGeometry(1, 1), TOPIARY, {
    at: [TX, PAVE + 1.4, TZ],
    scale: [0.46, 0.4, 0.46],
    flat: true,
  });
  b.part(new THREE.IcosahedronGeometry(1, 1), TOPIARY, {
    at: [TX, PAVE + 1.82, TZ],
    scale: [0.27, 0.25, 0.27],
    flat: true,
  });
  for (const hit of b.surface(crown).scatter(10, { rng: R, minDist: 0.18, filter: (h) => h.n.y > -0.1 }))
    b.stick(new THREE.SphereGeometry(0.035, 5, 4), PINK, hit, { embed: 0.3 });

  // barrel of baguettes
  const BX = 2.75;
  const BZ = 2.0;
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.31, 0.2],
      [0.33, 0.4],
      [0.31, 0.6],
      [0.27, 0.78],
      [0, 0.78],
    ],
    { at: [BX, PAVE, BZ], segments: 10, color: WOODP },
  );
  for (const y of [0.12, 0.66])
    b.part(new THREE.TorusGeometry(y < 0.3 ? 0.29 : 0.285, 0.014, 4, 14), IRON, {
      at: [BX, PAVE + y, BZ],
      rotation: [90, 0, 0],
    });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 10), SACK, { at: [BX, PAVE + 0.79, BZ] });
  [
    [-0.1, -0.05, -0.12, 0.2, -0.05],
    [0.0, 0.08, 0.02, 0.0, 0.2],
    [0.1, -0.02, 0.14, 0.1, 0.1],
    [-0.04, 0.1, -0.08, -0.15, 0.16],
  ].forEach(([ox, oz, dx, dz, _t], i) =>
    b.capsule(
      [BX + ox, PAVE + 0.76, BZ + oz],
      [BX + ox + dx * 0.6, PAVE + 1.25 + (i % 2) * 0.1, BZ + oz + dz * 0.6],
      0.036,
      { color: BAGUETTE, sides: 6 },
    ),
  );

  // flour sacks
  const sack = (x: number, z: number, rot: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), SACK, { at: [x, PAVE + 0.28, z], scale: [0.27, 0.3, 0.21], rotation: [0, rot, 0] });
    b.part(new THREE.CylinderGeometry(0.06, 0.11, 0.14, 7), SACK, { at: [x, PAVE + 0.6, z], rotation: [0, rot, 6] });
    b.part(new THREE.TorusGeometry(0.075, 0.012, 4, 8), RED, { at: [x, PAVE + 0.56, z], rotation: [90, 0, 0] });
    b.part(new THREE.CircleGeometry(0.1, 8), RED, { at: [x, PAVE + 0.28, z + 0.205], dir: [0, 0, 1], axis: "z" });
  };
  sack(BX + 0.1, 2.78, 12);
  sack(BX - 0.42, 2.95, -18);

  // chalkboard A-frame
  const CBX = 0.75;
  const CBZ = 3.25;
  const lean = (10 * Math.PI) / 180;
  const cy = [0, Math.cos(lean), -Math.sin(lean)] as V;
  const cyb = [0, Math.cos(lean), Math.sin(lean)] as V;
  b.extrude(
    [
      [-0.36, -0.49],
      [0.36, -0.49],
      [0.36, 0.49],
      [-0.36, 0.49],
    ],
    { at: [CBX, PAVE + 0.5, CBZ + 0.085], x: [1, 0, 0], y: cy, thickness: 0.05, bevel: 0.015, color: WOODL },
  );
  tex(T.chalk, 0.66, 0.91, [CBX, PAVE + 0.5, CBZ + 0.085].map((v, i) => v + [0, Math.sin(lean), Math.cos(lean)][i] * 0.03) as V, [0, Math.sin(lean), Math.cos(lean)], { up: cy });
  b.extrude(
    [
      [-0.34, -0.49],
      [0.34, -0.49],
      [0.34, 0.49],
      [-0.34, 0.49],
    ],
    { at: [CBX, PAVE + 0.5, CBZ - 0.085], x: [1, 0, 0], y: cyb, thickness: 0.04, bevel: 0.01, color: WOOD },
  );
  b.rod([CBX, PAVE + 0.98, CBZ - 0.0], [CBX, PAVE + 0.98, CBZ + 0.0], 0.01, { color: IRON });

  // bread table
  const TBX = -2.3;
  const TBZ = 3.5;
  const TBY = PAVE + 0.8;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) b.rod([TBX + sx * 0.46, PAVE, TBZ + sz * 0.24], [TBX + sx * 0.44, TBY, TBZ + sz * 0.22], 0.025, { color: WOODD, sides: 6 });
  soft(1.1, 0.06, 0.62, [TBX, TBY - 0.02, TBZ], WOODL, 0.01);
  b.part(new THREE.BoxGeometry(1.18, 0.02, 0.7), GINGHAM, { at: [TBX, TBY + 0.02, TBZ] });
  for (const [dx, dz, rr2] of [
    [-0.38, 0.12, 0.13],
    [-0.18, -0.1, 0.11],
    [-0.38, -0.12, 0.1],
  ])
    b.part(new THREE.IcosahedronGeometry(1, 1), LOAF, {
      at: [TBX + dx, TBY + 0.03 + rr2 * 0.6, TBZ + dz],
      scale: [rr2 * 1.2, rr2 * 0.85, rr2],
      flat: true,
    });
  // basket + baguettes
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.2, 0.16],
      [0.18, 0.16],
      [0.13, 0.03],
      [0, 0.03],
    ],
    { at: [TBX + 0.22, TBY + 0.03, TBZ], segments: 8, color: WOODH },
  );
  [
    [-0.06, 0.05, -0.1],
    [0.0, 0.0, 0.0],
    [0.06, -0.05, 0.1],
  ].forEach(([ox, oz, tilt]) =>
    b.capsule(
      [TBX + 0.22 + ox, TBY + 0.08, TBZ + oz],
      [TBX + 0.22 + ox + tilt, TBY + 0.52, TBZ + oz + tilt * 0.5],
      0.033,
      { color: BAGUETTE, sides: 6 },
    ),
  );
  // croissants
  [
    [0.0, 0.14, 20],
    [0.12, 0.1, -30],
    [0.02, -0.08, 70],
  ].forEach(([ox, oz, rot]) =>
    b.part(new THREE.TorusGeometry(0.06, 0.028, 5, 8, Math.PI * 1.35), CROIS, {
      at: [TBX + ox - 0.05, TBY + 0.06, TBZ + oz],
      rotation: [-90, 0, rot],
      flat: true,
    }),
  );
  // a little cake on a stand
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 10), TRIM, { at: [TBX - 0.02, TBY + 0.16, TBZ - 0.2] });
  b.rod([TBX - 0.02, TBY + 0.04, TBZ - 0.2], [TBX - 0.02, TBY + 0.15, TBZ - 0.2], 0.012, { color: TRIM, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 10), PINK, { at: [TBX - 0.02, TBY + 0.2, TBZ - 0.2] });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), RED, { at: [TBX - 0.02, TBY + 0.26, TBZ - 0.2] });
  // price flag on a stick
  b.rod([TBX + 0.5, TBY + 0.03, TBZ + 0.22], [TBX + 0.5, TBY + 0.3, TBZ + 0.22], 0.006, { color: WOODD, sides: 4 });
  b.extrude(
    [
      [0, 0],
      [0.14, 0],
      [0.11, 0.045],
      [0.14, 0.09],
      [0, 0.09],
    ],
    { at: [TBX + 0.5, TBY + 0.2, TBZ + 0.22], x: [1, 0, 0], thickness: 0.006, color: RED },
  );

  // bushes with berries
  const bush = (x: number, z: number, r: number) => {
    const part = b.part(new THREE.IcosahedronGeometry(1, 1), BUSHP, {
      at: [x, FLOOR + r * 0.5, z],
      scale: [r, r * 0.8, r * 0.9],
      flat: true,
    });
    for (const hit of b.surface(part).scatter(9, { rng: R, minDist: 0.2, filter: (h) => h.n.y > 0.2 }))
      b.stick(new THREE.SphereGeometry(0.04, 5, 4), PINKD, hit, { embed: 0.3 });
  };
  bush(-3.0, -1.1, 0.6);
  bush(3.05, -0.9, 0.55);
  bush(-3.1, 0.9, 0.42);
  bush(0.0, -2.0, 0.5);

  // ============================================================ meadow cards on the grass
  const grassSurf = b.surface(grass);
  const okSpot = (h: { n: { y: number }; at: { x: number; z: number } }) =>
    h.n.y > 0.9 && h.at.z < 1.6 && !(Math.abs(h.at.x) < 2.6 && Math.abs(h.at.z) < 2.1) && !(Math.abs(h.at.x) > 2.4 && Math.abs(h.at.z + 1) < 0.9 && false);
  const fl = grassSurf.scatter(34, { rng: R, minDist: 0.28, filter: okSpot });
  b.cards(fl, [FLOWER_P, FLOWER_Y], { size: [0.2, 0.32], vary: 0.25, rng: R, cross: true });
  const tf = grassSurf.scatter(50, { rng: R, minDist: 0.2, filter: okSpot });
  b.cards(tf, T.tuft, { size: [0.2, 0.2], vary: 0.3, rng: R, cross: true, spin: 40 });

  return b.root;
}
```