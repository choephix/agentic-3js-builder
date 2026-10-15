// Alchemist's workbench: a Genshin-style prop group. A carved teal-and-gold apothecary hutch with a gabled crest,
// tasselled valance, shelves of elemental potions, books, a hanging herb pole and lanterns, a turned-leg workbench with
// an open grimoire on a glowing rune cloth, a brass balance, copper alembic, mortar, inkwell and candles, plus a
// cauldron on a tripod, a barrel, a crate and a sack on a patterned rug.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle } from "../../../../src/paint";
import { catmull, spiral } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "An alchemist's workbench prop group: gilded teal apothecary hutch with elemental potions, books, a brass balance, copper alembic, hanging herbs, lanterns, cauldron and rug, in cel-shaded anime style with gold filigree, tassels and elemental glow.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Pt = [number, number];
type PO = { bone?: Joint; rotation?: V; scale?: number | V; flat?: boolean };
type Kind = {
  sil: Pt[];
  fill: number;
  seg: number;
  spin?: number;
  ly: number;
  lw: number;
  lh: number;
  cap: "cork" | "wax" | "gold";
};

// Bottle silhouettes: [radius, height] from the base up to the mouth, heights strictly increasing.
const KINDS: Record<string, Kind> = {
  round: {
    sil: [[0.035, 0], [0.06, 0.012], [0.075, 0.05], [0.078, 0.085], [0.065, 0.12], [0.03, 0.15], [0.02, 0.165], [0.02, 0.2], [0.024, 0.205]],
    fill: 0.11, seg: 10, ly: 0.055, lw: 0.075, lh: 0.07, cap: "cork",
  },
  vial: {
    sil: [[0.018, 0], [0.024, 0.008], [0.024, 0.1], [0.016, 0.118], [0.016, 0.15], [0.02, 0.156]],
    fill: 0.1, seg: 8, ly: 0.05, lw: 0.03, lh: 0.045, cap: "cork",
  },
  flask: {
    sil: [[0.055, 0], [0.058, 0.01], [0.04, 0.09], [0.02, 0.13], [0.018, 0.17], [0.024, 0.178]],
    fill: 0.075, seg: 10, ly: 0.03, lw: 0.05, lh: 0.045, cap: "wax",
  },
  square: {
    sil: [[0.04, 0], [0.042, 0.006], [0.042, 0.11], [0.03, 0.13], [0.018, 0.15], [0.018, 0.18], [0.022, 0.186]],
    fill: 0.12, seg: 4, spin: 45, ly: 0.06, lw: 0.05, lh: 0.07, cap: "cork",
  },
  hex: {
    sil: [[0.045, 0], [0.047, 0.006], [0.047, 0.09], [0.03, 0.115], [0.02, 0.135], [0.02, 0.17], [0.026, 0.176]],
    fill: 0.09, seg: 6, ly: 0.045, lw: 0.05, lh: 0.06, cap: "wax",
  },
  drop: {
    sil: [[0.02, 0], [0.045, 0.01], [0.06, 0.04], [0.065, 0.07], [0.055, 0.105], [0.035, 0.13], [0.02, 0.15], [0.02, 0.19], [0.026, 0.197]],
    fill: 0.1, seg: 10, ly: 0.055, lw: 0.06, lh: 0.07, cap: "wax",
  },
  jar: {
    sil: [[0.05, 0], [0.058, 0.01], [0.058, 0.11], [0.05, 0.12], [0.05, 0.128], [0.056, 0.134]],
    fill: 0.1, seg: 10, ly: 0.055, lw: 0.07, lh: 0.07, cap: "gold",
  },
  carboy: {
    sil: [[0.1, 0], [0.12, 0.02], [0.14, 0.1], [0.14, 0.2], [0.11, 0.28], [0.06, 0.33], [0.045, 0.36], [0.045, 0.42], [0.055, 0.43]],
    fill: 0.26, seg: 10, ly: 0.14, lw: 0.14, lh: 0.15, cap: "cork",
  },
};

const ELEM = ["#ff6a3d", "#3aa7ff", "#7bd84a", "#b36bff", "#8ff0f2", "#5de6c0", "#ffc83a"];

const rAt = (sil: Pt[], y: number) => {
  for (let i = 0; i < sil.length - 1; i++) {
    const [r0, y0] = sil[i];
    const [r1, y1] = sil[i + 1];
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return sil[sil.length - 1][0];
};

const clip = (sil: Pt[], y0: number, y1: number): Pt[] => {
  const out: Pt[] = [[rAt(sil, y0), y0]];
  for (const p of sil) if (p[1] > y0 + 1e-6 && p[1] < y1 - 1e-6) out.push(p);
  out.push([rAt(sil, y1), y1]);
  return out;
};

const rep = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join("");

// A hanging valance: flat top edge, a row of pennant points below.
const pennant = (hw: number, dep: number, n: number): OutlinePoint[] => {
  const w = (2 * hw) / n;
  const pts: OutlinePoint[] = [[-hw, -dep * 0.3]];
  for (let i = 0; i < n; i++) {
    pts.push([-hw + (i + 0.5) * w, -dep, "sharp"]);
    pts.push([-hw + (i + 1) * w, -dep * 0.3]);
  }
  pts.push([hw, 0], [-hw, 0]);
  return pts;
};

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", detail: 0.7 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ------------------------------------------------------------------------------------------------------------
  // Palette: every surface is a two-tone cel paint; glowing parts keep flat colours.
  const woodGrain = (axis: "x" | "y" | "z", a: string, c: string) => cel(grain(a, c, { size: 0.025, axis }));
  const WX = woodGrain("x", "#c07b43", "#a9672f");
  const WY = woodGrain("y", "#c07b43", "#a9672f");
  const WZ = woodGrain("z", "#c07b43", "#a9672f");
  const DX = woodGrain("x", "#85502c", "#6f4122");
  const DY = woodGrain("y", "#85502c", "#6f4122");
  const WICKER = cel(grain("#dcab5c", "#bb8a42", { size: 0.012, axis: "y" }));
  const GOLD = cel("#f7cb52", "#cf8d2c");
  const BRASS = cel("#e0aa48", "#a96f2a");
  const COPPER = cel("#e48f5a", "#b3512f");
  const IRON = cel("#5d6280", "#383b58");
  const STONE = cel(mottle("#d8dde0", "#c1c8d0", { size: 0.05 }), "#8f98ad");
  const PAPER = cel("#fff2d2", "#e6c898");
  const GLASS = cel("#dff6f3", "#9ccfdc");
  const CORK = cel("#d1a165", "#a16d3d");
  const TEAL = cel("#27a79f", "#176b86");
  const DTEAL = cel("#1e6d7d", "#143e5e");
  const CRIM = cel("#c8453d", "#8e2b4a");
  const PLUM = cel("#6f4aa8", "#41306f");
  const FOREST = cel("#4a9a52", "#2a6354");
  const OCHRE = cel("#e0a23a", "#b0662c");
  const LINEN = cel("#efe3c8", "#cdb58c");
  const CLAY = cel("#d9794a", "#a8472f");
  const ROPE = cel("#d9b878", "#a9824a");
  const SOOT = cel("#3c3a52", "#25243a");
  const WAX = cel("#fff6dc", "#ecd2a2");
  const SOIL = cel("#6b4630", "#47291f");

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const gold = "#f7cb52";
  const ink = "#4a2d1a";
  const sigils: Array<(c: string) => string> = [
    (c) => `<path d="M20 8 C26 18 31 22 30 32 C29 40 24 44 20 44 C15 44 10 40 10 32 C10 26 14 24 15 18 C17 22 18 22 20 8Z" fill="${c}"/>`,
    (c) => `<path d="M20 8 C27 20 32 26 32 33 A12 12 0 0 1 8 33 C8 26 13 20 20 8Z" fill="${c}"/>`,
    (c) => `<path d="M10 42 C8 22 20 10 32 10 C34 26 26 42 10 42Z" fill="${c}"/><path d="M10 42 L26 18" stroke="${ink}" stroke-width="2" fill="none"/>`,
    (c) => `<path d="M24 6 L10 30 L19 30 L15 48 L31 24 L22 24Z" fill="${c}"/>`,
    (c) => `<path d="M20 6 L30 26 L20 46 L10 26Z" fill="${c}"/><path d="M10 26 H30 M20 6 V46" stroke="${ink}" stroke-width="1.6" fill="none"/>`,
    (c) => `<path d="M12 32 C10 14 32 12 31 25 C30 34 19 33 20 26" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/><path d="M12 32 C10 14 32 12 31 25 C30 34 19 33 20 26" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`,
    (c) => `<path d="M20 7 L32 19 L28 44 L12 44 L8 19Z" fill="${c}"/><path d="M8 19 H32 M20 7 L16 44 M20 7 L24 44" stroke="${ink}" stroke-width="1.5" fill="none"/>`,
  ];
  const LABELS = ELEM.map((c, i) =>
    svg(
      `<svg viewBox="0 0 40 56"><rect x="1.5" y="1.5" width="37" height="53" rx="6" fill="#f7e8c0" stroke="#c98a2b" stroke-width="3"/><circle cx="20" cy="26" r="17" fill="none" stroke="#c98a2b" stroke-width="1.6"/><g stroke="${ink}" stroke-width="2.2" stroke-linejoin="round">${sigils[i](c)}</g><rect x="9" y="47" width="22" height="2.2" fill="#9a7442"/></svg>`,
      { size: 128 },
    ),
  );
  const GLOSS = svg(
    `<svg viewBox="0 0 10 40"><path d="M5 2 C9 8 9 30 5 38 C1 30 1 8 5 2Z" fill="#f4ffff"/></svg>`,
    { size: 64 },
  );

  const RUG = svg(
    `<svg viewBox="0 0 320 170">
<rect width="320" height="170" fill="#1b5a6e"/>
<rect x="5" y="5" width="310" height="160" fill="none" stroke="${gold}" stroke-width="3"/>
<rect x="12" y="12" width="296" height="146" fill="#efdcab"/>
${rep(36, (i) => `<path d="M${16 + i * 8.2} 15 l4 6 l4 -6z" fill="#c8453d"/><path d="M${16 + i * 8.2} 155 l4 -6 l4 6z" fill="#c8453d"/>`)}
<rect x="24" y="26" width="272" height="118" fill="#2a8f90" stroke="${gold}" stroke-width="2.5"/>
<rect x="30" y="32" width="260" height="106" fill="none" stroke="#fff1c8" stroke-width="1.6" stroke-dasharray="4 3"/>
<circle cx="160" cy="85" r="46" fill="#1b5a6e" stroke="${gold}" stroke-width="3"/>
<circle cx="160" cy="85" r="36" fill="none" stroke="#fff1c8" stroke-width="1.8"/>
<path d="M160 44 L171 74 L202 85 L171 96 L160 126 L149 96 L118 85 L149 74Z" fill="${gold}" stroke="#a8702a" stroke-width="1.5"/>
<circle cx="160" cy="85" r="9" fill="#c8453d" stroke="#fff1c8" stroke-width="2"/>
${[[52, 52], [268, 52], [52, 118], [268, 118]].map(([x, y]) => `<path d="M${x} ${y - 14} L${x + 8} ${y} L${x} ${y + 14} L${x - 8} ${y}Z" fill="${gold}" stroke="#a8702a" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3" fill="#c8453d"/>`).join("")}
${rep(6, (i) => `<circle cx="${84 + i * 30.4}" cy="${i % 2 ? 40 : 130}" r="4" fill="#fff1c8"/>`)}
</svg>`,
    { size: 768 },
  );
  const FRINGE = svg(
    `<svg viewBox="0 0 40 20"><rect x="0" y="15" width="40" height="5" fill="#efdcab"/>${rep(9, (i) => `<path d="M${3 + i * 4.3} 16 L${3 + i * 4.3 + (i % 2 ? 1 : -1)} 2" stroke="#efdcab" stroke-width="2.4" stroke-linecap="round"/>`)}</svg>`,
    { size: 160 },
  );
  const CLOTH = svg(
    `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#1d6f7a"/><circle cx="100" cy="100" r="95" fill="none" stroke="${gold}" stroke-width="3"/><circle cx="100" cy="100" r="72" fill="#238a8c"/><circle cx="100" cy="100" r="40" fill="#1d6f7a"/></svg>`,
    { size: 256 },
  );
  const RUNES = svg(
    `<svg viewBox="0 0 200 200"><g fill="none" stroke="#ffe28a" stroke-width="2.4"><circle cx="100" cy="100" r="88"/><circle cx="100" cy="100" r="74"/><circle cx="100" cy="100" r="30"/><path d="M100 28 L162 136 L38 136Z"/><path d="M100 172 L38 64 L162 64Z"/></g><g fill="#ffe28a">${rep(24, (i) => `<rect x="98.8" y="8" width="2.4" height="${i % 2 ? 8 : 12}" transform="rotate(${i * 15} 100 100)"/>`)}</g></svg>`,
    { size: 512 },
  );
  const PAGE_L = svg(
    `<svg viewBox="0 0 100 130"><rect width="100" height="130" fill="#f8ebc8"/><rect x="5" y="5" width="90" height="120" fill="none" stroke="#c98a2b" stroke-width="1.6"/><circle cx="50" cy="38" r="26" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M50 62 L50 30" stroke="#3b6b32" stroke-width="2.4"/><path d="M50 52 C36 48 34 36 44 30 C50 38 52 46 50 52Z" fill="#6fcf5a" stroke="#2f6b3a" stroke-width="1.4"/><path d="M50 44 C64 40 66 28 56 22 C50 30 48 38 50 44Z" fill="#9be46c" stroke="#2f6b3a" stroke-width="1.4"/>${rep(8, (i) => `<rect x="12" y="${74 + i * 6.2}" width="${64 + ((i * 37) % 22)}" height="2" fill="#7a5a3a"/>`)}</svg>`,
    { size: 256 },
  );
  const PAGE_R = svg(
    `<svg viewBox="0 0 100 130"><rect width="100" height="130" fill="#f8ebc8"/><rect x="5" y="5" width="90" height="120" fill="none" stroke="#c98a2b" stroke-width="1.6"/><rect x="14" y="14" width="46" height="3.6" fill="#8e2b4a"/><circle cx="50" cy="56" r="26" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M50 32 L72 70 L28 70Z" fill="none" stroke="${ink}" stroke-width="1.6"/>${rep(7, (i) => `<circle cx="${50 + 26 * Math.cos(i * 0.8976 - 1.57)}" cy="${56 + 26 * Math.sin(i * 0.8976 - 1.57)}" r="3.6" fill="${ELEM[i]}" stroke="${ink}" stroke-width="1"/>`)}${rep(6, (i) => `<rect x="12" y="${92 + i * 5.6}" width="${60 + ((i * 29) % 26)}" height="2" fill="#7a5a3a"/>`)}</svg>`,
    { size: 256 },
  );
  const POSTER = svg(
    `<svg viewBox="0 0 120 100"><rect x="1.5" y="1.5" width="117" height="97" fill="#f4e2b4" stroke="#8a5a2a" stroke-width="3"/><circle cx="60" cy="46" r="30" fill="none" stroke="${ink}" stroke-width="2"/><path d="M60 18 L86 62 L34 62Z" fill="none" stroke="${ink}" stroke-width="1.8"/><rect x="42" y="30" width="36" height="32" fill="none" stroke="${ink}" stroke-width="1.8"/>${rep(7, (i) => `<circle cx="${60 + 30 * Math.cos(i * 0.8976 - 1.57)}" cy="${46 + 30 * Math.sin(i * 0.8976 - 1.57)}" r="4.4" fill="${ELEM[i]}" stroke="${ink}" stroke-width="1.2"/>`)}<circle cx="60" cy="46" r="6" fill="#c8453d" stroke="${ink}" stroke-width="1.2"/>${rep(4, (i) => `<rect x="14" y="${84 + i * 3.6}" width="${70 + ((i * 17) % 24)}" height="1.8" fill="#7a5a3a"/>`)}</svg>`,
    { size: 256 },
  );
  const NOTE = svg(
    `<svg viewBox="0 0 40 40"><path d="M2 2 H38 V32 L30 38 H2Z" fill="#fff0c2" stroke="#b58a4a" stroke-width="2"/>${rep(5, (i) => `<rect x="6" y="${7 + i * 6}" width="${24 - ((i * 7) % 10)}" height="2.2" fill="#7a5a3a"/>`)}<circle cx="20" cy="3" r="2.6" fill="#c8453d"/></svg>`,
    { size: 96 },
  );
  const SPINE_A = svg(
    `<svg viewBox="0 0 30 100"><rect x="2" y="7" width="26" height="3.2" fill="${gold}"/><rect x="2" y="12.5" width="26" height="1.8" fill="${gold}"/><rect x="2" y="86" width="26" height="3.2" fill="${gold}"/><rect x="2" y="81" width="26" height="1.8" fill="${gold}"/><path d="M15 34 L24 50 L15 66 L6 50Z" fill="${gold}"/><circle cx="15" cy="50" r="3.2" fill="#c8453d"/><circle cx="15" cy="22" r="2.4" fill="${gold}"/><circle cx="15" cy="74" r="2.4" fill="${gold}"/></svg>`,
    { size: 192 },
  );
  const SPINE_B = svg(
    `<svg viewBox="0 0 30 100"><rect x="2" y="6" width="26" height="4" fill="${gold}"/><rect x="2" y="90" width="26" height="4" fill="${gold}"/>${rep(3, (i) => `<rect x="2" y="${30 + i * 16}" width="26" height="2.4" fill="${gold}"/>`)}<circle cx="15" cy="20" r="4" fill="none" stroke="${gold}" stroke-width="2"/><circle cx="15" cy="78" r="4" fill="none" stroke="${gold}" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const COVER = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="${gold}" stroke-width="3.2"/><circle cx="50" cy="50" r="33" fill="none" stroke="${gold}" stroke-width="1.8"/><path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42Z" fill="${gold}"/><circle cx="50" cy="50" r="6" fill="#c8453d"/>${[[10, 10], [90, 10], [10, 90], [90, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${gold}"/>`).join("")}</svg>`,
    { size: 192 },
  );
  const filTile = (k: number) =>
    `<g transform="${k % 2 ? `translate(${k * 40 + 40} 0) scale(-1 1)` : `translate(${k * 40} 0)`}"><path d="M2 15 C2 4 18 4 18 14 C18 20 10 20 10 15" fill="none" stroke="${gold}" stroke-width="2.6" stroke-linecap="round"/><path d="M18 15 C24 8 32 8 38 15 C32 22 24 22 18 15Z" fill="${gold}"/><circle cx="10" cy="15" r="1.8" fill="${gold}"/></g>`;
  const FIL = svg(`<svg viewBox="0 0 200 30">${rep(5, filTile)}</svg>`, { size: 512 });
  const ROUNDELS = svg(
    `<svg viewBox="0 0 630 70">${rep(7, (i) => `<circle cx="${45 + 90 * i}" cy="35" r="29" fill="${ELEM[i]}" stroke="${gold}" stroke-width="5"/><circle cx="${45 + 90 * i}" cy="35" r="17" fill="none" stroke="#fff1c8" stroke-width="2.6"/>`)}</svg>`,
    { size: 1024 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 24 48"><rect x="9" y="0" width="6" height="7" rx="2" fill="${gold}"/><path d="M8 7 h8 l2 6 h-12z" fill="#e0a23a"/>${rep(7, (i) => `<path d="M${9.5 + i * 0.85} 13 Q${5 + i * 2.4} 30 ${3.5 + i * 2.9} 47" stroke="${i % 3 === 1 ? gold : "#c8453d"}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`)}</svg>`,
    { size: 96 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 40 64"><path d="M20 63 L20 46" stroke="#3b6b32" stroke-width="3" stroke-linecap="round"/><path d="M20 48 C4 40 6 14 20 2 C34 14 36 40 20 48Z" fill="#6fcf5a" stroke="#2f6b3a" stroke-width="2"/><path d="M20 48 C28 40 32 30 28 16 C34 28 30 42 20 48Z" fill="#9be46c"/><path d="M20 46 L20 8" stroke="#2f6b3a" stroke-width="1.8"/><path d="M20 36 L11 28 M20 36 L29 28 M20 26 L13 18 M20 26 L27 18" stroke="#2f6b3a" stroke-width="1.6" fill="none"/></svg>`,
    { size: 128 },
  );
  const LAV = svg(
    `<svg viewBox="0 0 24 80"><path d="M12 79 L12 8" stroke="#4a8a45" stroke-width="2.6" stroke-linecap="round"/>${rep(9, (i) => `<ellipse cx="${12 + (i % 2 ? 4 : -4)}" cy="${12 + i * 6}" rx="4.6" ry="3.8" fill="#9a6be0" stroke="#5a3a9a" stroke-width="1.2"/>`)}<ellipse cx="12" cy="7" rx="3.6" ry="4.4" fill="#b58cf0" stroke="#5a3a9a" stroke-width="1.2"/></svg>`,
    { size: 160 },
  );
  const FERN = svg(
    `<svg viewBox="0 0 40 80"><path d="M20 79 L20 6" stroke="#3b7a3d" stroke-width="2.6" stroke-linecap="round"/>${rep(10, (i) => `<path d="M20 ${70 - i * 6.4} L${20 - (17 - i * 1.4)} ${63 - i * 6.4}" stroke="#4da455" stroke-width="3.6" stroke-linecap="round"/><path d="M20 ${70 - i * 6.4} L${20 + (17 - i * 1.4)} ${63 - i * 6.4}" stroke="#5fbd62" stroke-width="3.6" stroke-linecap="round"/>`)}</svg>`,
    { size: 160 },
  );
  const FLOWER = svg(
    `<svg viewBox="0 0 40 64"><path d="M20 63 L20 24" stroke="#3b6b32" stroke-width="3" stroke-linecap="round"/><path d="M20 48 C10 46 8 40 12 36 C18 38 20 44 20 48Z" fill="#6fcf5a" stroke="#2f6b3a" stroke-width="1.4"/>${rep(5, (i) => `<ellipse cx="20" cy="10" rx="5.6" ry="8.4" fill="#ffd0e4" stroke="#c85a8a" stroke-width="1.4" transform="rotate(${i * 72} 20 18)"/>`)}<circle cx="20" cy="18" r="4.4" fill="#ffd34a" stroke="#c88a1a" stroke-width="1.2"/></svg>`,
    { size: 128 },
  );
  const FEATHER = svg(
    `<svg viewBox="0 0 24 100"><path d="M12 98 C-2 70 -2 30 12 2 C26 30 26 70 12 98Z" fill="#f4f7f2" stroke="#2a8d8f" stroke-width="2.2"/><path d="M12 98 L12 6" stroke="#c9b48a" stroke-width="2.4"/>${rep(8, (i) => `<path d="M12 ${88 - i * 9} L${i % 2 ? 22 : 2} ${80 - i * 9}" stroke="#b9dcd8" stroke-width="1.8" fill="none"/>`)}</svg>`,
    { size: 200 },
  );
  const ORB = svg(
    `<svg viewBox="0 0 128 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6ad7ff"/><stop offset="1" stop-color="#b48cff"/></linearGradient></defs><rect width="128" height="64" fill="url(#g)"/><path d="M10 44 C40 10 90 60 120 20" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M20 20 C50 56 80 8 110 48" stroke="#d8f6ff" stroke-width="3" fill="none" stroke-linecap="round"/>${rep(10, (i) => `<circle cx="${(i * 37) % 128}" cy="${(i * 23) % 64}" r="2.2" fill="#ffffff"/>`)}</svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------------------
  // Placement helpers
  const box = (w: number, h: number, d: number, color: Fill, at: V, o: PO = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at, ...o });
  const boxB = (w: number, h: number, d: number, color: Fill, at: V, o: PO = {}) =>
    box(w, h, d, color, [at[0], at[1] + h / 2, at[2]], o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, o: PO = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: root, at, ...o });
  const cylB = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, o: PO = {}) =>
    cyl(rt, rb, h, seg, color, [at[0], at[1] + h / 2, at[2]], o);
  const sph = (r: number, color: Fill, at: V, o: PO = {}, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), color, { bone: root, at, ...o });
  const torus = (r: number, tube: number, color: Fill, at: V, o: PO = {}) =>
    b.part(new THREE.TorusGeometry(r, tube, 4, 10), color, { bone: root, at, rotation: [90, 0, 0], ...o });
  const lath = (outline: Pt[], at: V, color: Fill, o: { segments?: number; spin?: number; bone?: Joint } = {}) =>
    b.lathe(outline, { at, color, bone: root, ...o });
  const rod = (a: V, c: V, rad: number | [number, number], color: Fill, o: { bone?: Joint; sides?: number } = {}) =>
    b.rod(a, c, rad, color, { bone: root, sides: 6, ...o });
  const deco = (tex: THREE.Texture, w: number, h: number, at: V, dir: V = [0, 0, 1], up: V = [0, 1, 0], o: PO = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: root, at, dir, axis: "z", up, texture: tex, ...o });
  const tassels = (pts: V[], size: [number, number], bone?: Joint) =>
    b.cards(pts.map((p) => frame(p, [0, 1, 0])), TASSEL, { size, lean: 180, flow: [0, 0, 1], cross: true, bone: bone ?? root });
  const tuft = (x: number, y: number, z: number, rad: number, n: number, tex: THREE.Texture | THREE.Texture[], size: [number, number], lean: number, seed: number) => {
    const q = rng(seed);
    const fr = Array.from({ length: n }, () => {
      const a = q() * Math.PI * 2;
      const d = Math.sqrt(q()) * rad;
      return frame([x + Math.cos(a) * d, y, z + Math.sin(a) * d], [0, 1, 0]);
    });
    b.cards(fr, tex, {
      size, lean, vary: 0.3, spin: 40, rng: q, bone: root,
      flow: (_f, i) => [Math.cos(i * 2.4 + seed), 0, Math.sin(i * 2.4 + seed)],
    });
  };
  const crystal = (base: V, dir: V, len: number, rad: number, color: string, bone?: Joint) => {
    const d = new THREE.Vector3(...dir).normalize();
    const mid = new THREE.Vector3(...base).addScaledVector(d, len * 0.7);
    const tip = new THREE.Vector3(...base).addScaledVector(d, len);
    const o = { bone: bone ?? root, sides: 6 };
    glow(b.rod(base, mid, rad, color, o), 1);
    glow(b.spike(mid, tip, null, rad, color, o), 1);
  };

  // A potion bottle: glowing liquid below, pale glass shoulder above, cork/wax/lid, gold wire, label and gloss.
  function bottle(k: Kind, x: number, base: number, z: number, e: number, s = 1) {
    const S: Pt[] = k.sil.map(([rr, yy]) => [rr * s, yy * s]);
    const fh = k.fill * s;
    const top = S[S.length - 1];
    const yTop = top[1];
    const liquid = lath([[0, 0], ...clip(S, 0, fh), [0, fh]], [x, base, z], ELEM[e], { segments: k.seg, spin: k.spin });
    glow(liquid, 1);
    if (fh < yTop - 0.002)
      lath([[0, fh], ...clip(S, fh, yTop), [0, yTop]], [x, base, z], GLASS, { segments: k.seg, spin: k.spin });
    const mr = top[0];
    const cy = base + yTop;
    if (k.cap === "cork") {
      cyl(mr * 0.95, mr * 0.78, 0.03 * s, 8, CORK, [x, cy + 0.006 * s, z]);
      torus(mr * 1.02, 0.0035 * s, GLASS, [x, cy - 0.002 * s, z]);
    } else if (k.cap === "wax") {
      b.part(new THREE.SphereGeometry(mr * 1.3, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CRIM, { bone: root, at: [x, cy - 0.006 * s, z] });
      torus(mr * 1.02, 0.0035 * s, GLASS, [x, cy - 0.002 * s, z]);
    } else {
      cyl(mr * 1.15, mr * 1.15, 0.016 * s, 10, GOLD, [x, cy + 0.004 * s, z]);
      sph(0.012 * s, GOLD, [x, cy + 0.016 * s, z]);
    }
    torus(rAt(S, yTop - 0.022 * s) + 0.001, 0.0022 * s, GOLD, [x, base + yTop - 0.022 * s, z]);
    const ly = base + k.ly * s;
    const rr = rAt(S, k.ly * s);
    b.decal(liquid, LABELS[e], { at: [x, ly, z + rr], dir: [0, 0, 1], size: [k.lw * s, k.lh * s], segments: 5, bone: root });
    const gy = base + fh * 0.55;
    const gr = rAt(S, fh * 0.55);
    b.decal(liquid, GLOSS, { at: [x - 0.5 * gr, gy, z + 0.86 * gr], dir: [-0.5, 0, 0.86], size: [0.2 * gr, fh * 0.45], segments: 4, bone: root });
  }

  // A book: two boards, spine, pages and a gold-banded spine drawing; lying ones also get a gold cover mark.
  function book(cx: number, base: number, cz: number, len: number, thick: number, depth: number, color: Fill, spine: THREE.Texture, standing: boolean) {
    const map = (a: number, v: number, c: number): V => (standing ? [v, a, c] : [a, v, c]);
    const ctr: V = [cx, base + (standing ? len / 2 : thick / 2), cz];
    const at = (a: number, v: number, c: number): V => {
      const o = map(a, v, c);
      return [ctr[0] + o[0], ctr[1] + o[1], ctr[2] + o[2]];
    };
    const bd = 0.008;
    const d1 = map(len, bd, depth);
    box(d1[0], d1[1], d1[2], color, at(0, thick / 2 - bd / 2, 0));
    box(d1[0], d1[1], d1[2], color, at(0, -thick / 2 + bd / 2, 0));
    const ds = map(len, thick, 0.012);
    box(ds[0], ds[1], ds[2], color, at(0, 0, depth / 2 - 0.006));
    const dp = map(len - 0.016, thick - 2 * bd, depth - 0.014);
    box(dp[0], dp[1], dp[2], PAPER, at(0, 0, -0.004));
    deco(spine, thick * 0.85, len * 0.95, at(0, 0, depth / 2 + 0.0015), [0, 0, 1], standing ? [0, 1, 0] : [1, 0, 0]);
    if (!standing) {
      const m = Math.min(len, depth) * 0.6;
      deco(COVER, m, m, [cx, base + thick + 0.0015, cz], [0, 1, 0], [0, 0, -1]);
    }
    return base + thick;
  }

  function candle(x: number, base: number, z: number, h: number, rad: number, dish: boolean) {
    let y = base;
    if (dish) {
      lath([[0, 0], [0.04, 0], [0.062, 0.016], [0.062, 0.02], [0.05, 0.02], [0.03, 0.008], [0, 0.008]], [x, base, z], BRASS);
      torus(0.02, 0.005, GOLD, [x + 0.075, base + 0.014, z], { rotation: [0, 0, 0] });
      y = base + 0.008;
    }
    cylB(rad, rad * 1.06, h, 8, WAX, [x, y, z]);
    sph(rad * 0.4, WAX, [x + rad * 0.9, y + h - 0.014, z], { scale: [1, 2.4, 1] }, 6, 4);
    rod([x, y + h, z], [x, y + h + 0.018, z], 0.0025, SOOT, { sides: 4 });
    glow(b.part(new THREE.ConeGeometry(0.012, 0.045, 6), "#ffb347", { bone: root, at: [x, y + h + 0.04, z] }), 1.4);
    glow(b.part(new THREE.ConeGeometry(0.006, 0.026, 6), "#fff1b0", { bone: root, at: [x, y + h + 0.031, z] }), 1.4);
  }

  function pot(x: number, base: number, z: number, s: number, color: Fill, tex: THREE.Texture | THREE.Texture[], n: number, size: [number, number], seed: number) {
    const P = (v: number) => v * s;
    lath(
      [[0, 0], [P(0.034), 0], [P(0.05), P(0.07)], [P(0.058), P(0.072)], [P(0.058), P(0.092)], [0, P(0.086)]],
      [x, base, z], color, { segments: 10 },
    );
    torus(P(0.052), P(0.005), GOLD, [x, base + P(0.07), z]);
    cyl(P(0.052), P(0.052), 0.006, 10, SOIL, [x, base + P(0.09), z]);
    tuft(x, base + P(0.09), z, P(0.03), n, tex, size, 22, seed);
  }

  function mush(x: number, base: number, z: number, s: number) {
    cylB(0.012 * s, 0.017 * s, 0.05 * s, 6, LINEN, [x, base, z]);
    const cy = base + 0.05 * s;
    b.part(new THREE.SphereGeometry(0.036 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CRIM, { bone: root, at: [x, cy, z], scale: [1, 0.75, 1] });
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + s;
      const el = 0.9 - (i % 2) * 0.35;
      sph(0.0065 * s, LINEN, [x + 0.034 * s * Math.cos(el) * Math.cos(a), cy + 0.027 * s * Math.sin(el), z + 0.034 * s * Math.cos(el) * Math.sin(a)], { scale: [1, 0.5, 1] }, 5, 3);
    }
  }

  function hourglass(x: number, base: number, z: number) {
    cylB(0.05, 0.05, 0.012, 8, GOLD, [x, base, z]);
    cylB(0.05, 0.05, 0.012, 8, GOLD, [x, base + 0.162, z]);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const px = x + 0.042 * Math.cos(a);
      const pz = z + 0.042 * Math.sin(a);
      rod([px, base + 0.012, pz], [px, base + 0.162, pz], 0.004, BRASS, { sides: 4 });
    }
    lath([[0, 0], [0.03, 0], [0.04, 0.012], [0.04, 0.03], [0.012, 0.075], [0, 0.075]], [x, base + 0.012, z], "#f2c66b", { segments: 10 });
    lath([[0, 0], [0.012, 0], [0.04, 0.045], [0.04, 0.063], [0.03, 0.075], [0, 0.075]], [x, base + 0.087, z], GLASS, { segments: 10 });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Floor: rug with fringe
  box(3.2, 0.014, 1.7, DTEAL, [0, 0.007, 0.3]);
  deco(RUG, 3.2, 1.7, [0, 0.0185, 0.3], [0, 1, 0], [0, 0, -1]);
  for (const s of [1, -1]) {
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 10; i++) fr.push(frame([s * 1.6, 0.012, -0.5 + (i + 0.5) * 0.17], [0, 1, 0]));
    b.cards(fr, FRINGE, { size: [0.17, 0.09], lean: 90, flow: [s, 0, 0], mirror: true, bone: root });
  }

  // ------------------------------------------------------------------------------------------------------------
  // Workbench: turned legs, stretchers, lower shelf, aprons, top with gold trim, drawer
  const legProfile: Pt[] = [[0, 0], [0.05, 0], [0.05, 0.04], [0.035, 0.07], [0.035, 0.4], [0.055, 0.46], [0.055, 0.52], [0.04, 0.56], [0.04, 0.8], [0.055, 0.84], [0, 0.84]];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      lath(legProfile, [sx * 0.76, 0, sz * 0.34], WY, { segments: 8 });
      torus(0.058, 0.007, GOLD, [sx * 0.76, 0.49, sz * 0.34]);
    }
  box(1.52, 0.045, 0.045, DX, [0, 0.17, 0.34]);
  box(1.52, 0.045, 0.045, DX, [0, 0.17, -0.34]);
  box(0.045, 0.045, 0.68, DZ(), [0.76, 0.17, 0]);
  box(0.045, 0.045, 0.68, DZ(), [-0.76, 0.17, 0]);
  function DZ() {
    return DX;
  }
  box(1.52, 0.03, 0.68, WX, [0, 0.2, 0]);
  box(1.56, 0.1, 0.04, DTEAL, [0, 0.79, 0.38]);
  box(1.56, 0.1, 0.04, DTEAL, [0, 0.79, -0.38]);
  box(0.04, 0.1, 0.72, DTEAL, [0.76, 0.79, 0]);
  box(0.04, 0.1, 0.72, DTEAL, [-0.76, 0.79, 0]);
  deco(FIL, 1.5, 0.07, [0, 0.79, 0.4025]);
  box(1.74, 0.06, 0.84, WX, [0, 0.87, 0]);
  box(1.74, 0.014, 0.014, GOLD, [0, 0.882, 0.424]);
  box(1.74, 0.014, 0.014, GOLD, [0, 0.882, -0.424]);
  box(0.014, 0.014, 0.84, GOLD, [0.874, 0.882, 0]);
  box(0.014, 0.014, 0.84, GOLD, [-0.874, 0.882, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.06, 0.07, 0.06, GOLD, [sx * 0.86, 0.875, sz * 0.41]);
      sph(0.022, GOLD, [sx * 0.86, 0.925, sz * 0.41]);
    }
  b.part(new THREE.BoxGeometry(1.7, 0.004, 0.8), cel(grain("#d08a4d", "#b8743a", { size: 0.03, axis: "x" })), { bone: root, at: [0, 0.902, 0] });

  const drawer = b.joint("drawer", { parent: root, at: [0.3, 0.77, 0.5], dir: [0, 0, 1] });
  const dz = 0.585;
  box(0.56, 0.1, 0.03, DX, [0.3, 0.77, dz], { bone: drawer });
  deco(FIL, 0.5, 0.06, [0.3, 0.77, dz + 0.0165], [0, 0, 1], [0, 1, 0], { bone: drawer });
  cyl(0.026, 0.026, 0.008, 8, GOLD, [0.3, 0.77, dz + 0.019], { bone: drawer, rotation: [90, 0, 0] });
  sph(0.018, GOLD, [0.3, 0.77, dz + 0.035], { bone: drawer });
  box(0.02, 0.07, 0.17, DX, [0.04, 0.755, 0.485], { bone: drawer });
  box(0.02, 0.07, 0.17, DX, [0.56, 0.755, 0.485], { bone: drawer });
  box(0.52, 0.01, 0.17, DX, [0.3, 0.72, 0.485], { bone: drawer });
  box(0.52, 0.07, 0.014, DX, [0.3, 0.755, 0.402], { bone: drawer });
  const gemCols = ["#ff6a3d", "#3aa7ff", "#b36bff", "#7bd84a", "#ffc83a"];
  gemCols.forEach((c, i) => {
    glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), c, { bone: drawer, at: [0.12 + i * 0.07, 0.737, 0.5 + (i % 2) * 0.03], flat: true, rotation: [i * 30, i * 50, 0] }), 1);
  });
  for (let i = 0; i < 4; i++) cyl(0.02, 0.02, 0.004, 10, GOLD, [0.14 + i * 0.01, 0.727 + i * 0.004, 0.545], { bone: drawer });

  // ------------------------------------------------------------------------------------------------------------
  // Hutch: posts, back panel, shelves, aprons, canopy, valance, crest
  for (const sx of [1, -1]) {
    box(0.07, 2.02, 0.07, DY, [sx * 0.84, 1.01, -0.52]);
    box(0.1, 0.05, 0.1, GOLD, [sx * 0.84, 0.025, -0.52]);
    box(0.095, 0.03, 0.095, GOLD, [sx * 0.84, 2.035, -0.52]);
    sph(0.028, GOLD, [sx * 0.84, 2.1, -0.52]);
    for (const y of [1.0, 1.5, 1.95]) torus(0.052, 0.007, GOLD, [sx * 0.84, y, -0.52]);
  }
  box(1.68, 1.12, 0.03, DTEAL, [0, 1.46, -0.575]);
  for (let i = -3; i <= 3; i++) box(0.006, 1.12, 0.004, cel("#17566a", "#0e3350"), [i * 0.24, 1.46, -0.5585]);
  const SH1 = 1.32;
  const SH2 = 1.68;
  for (const [y, apronY] of [[SH1, 1.28], [SH2, 1.64]] as Array<[number, number]>) {
    box(1.6, 0.04, 0.25, WX, [0, y - 0.02, -0.5]);
    box(1.6, 0.012, 0.012, GOLD, [0, y + 0.006, -0.384]);
    b.extrude(pennant(0.8, 0.07, 10), { at: [0, apronY, -0.388], x: [1, 0, 0], thickness: 0.01, color: CRIM, bone: root });
    for (const sx of [1, -1]) box(0.03, 0.04, 0.25, GOLD, [sx * 0.795, y - 0.02, -0.5]);
  }
  const apronTips: V[] = [];
  for (let i = 0; i < 10; i++) apronTips.push([-0.8 + (i + 0.5) * 0.16, 1.28 - 0.07, -0.388]);
  tassels(apronTips, [0.03, 0.06]);

  // canopy roof and valance
  box(2.0, 0.04, 0.54, DTEAL, [0, 2.05, -0.4]);
  box(2.06, 0.02, 0.012, GOLD, [0, 2.04, -0.125]);
  box(2.06, 0.012, 0.012, GOLD, [0, 2.074, -0.125]);
  for (const sx of [1, -1]) {
    sph(0.026, GOLD, [sx * 1.0, 2.05, -0.13]);
    sph(0.026, GOLD, [sx * 1.0, 2.05, -0.66]);
  }
  b.extrude(pennant(0.98, 0.13, 14), { at: [0, 2.03, -0.13], x: [1, 0, 0], thickness: 0.012, color: CRIM, bone: root });
  const valTips: V[] = [];
  for (let i = 0; i < 14; i++) valTips.push([-0.98 + (i + 0.5) * (1.96 / 14), 2.03 - 0.13, -0.13]);
  tassels(valTips, [0.04, 0.09]);
  deco(FIL, 1.9, 0.045, [0, 2.062, -0.1185], [0, 0, 1]);

  // gabled crest with glowing elemental roundels and filigree
  const crest: OutlinePoint[] = [[-1.0, 0], [-0.9, 0.12], [-0.62, 0.16], [-0.5, 0.26], [-0.3, 0.3], [-0.18, 0.36], [0, 0.42, "sharp"], [0.18, 0.36], [0.3, 0.3], [0.5, 0.26], [0.62, 0.16], [0.9, 0.12], [1.0, 0]];
  b.extrude(crest, { at: [0, 2.07, -0.655], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: TEAL, bone: root });
  glow(deco(ROUNDELS, 0.9, 0.1, [0, 2.215, -0.636]), 1);
  deco(FIL, 0.32, 0.048, [0.64, 2.14, -0.636]);
  deco(FIL, 0.32, 0.048, [-0.64, 2.14, -0.636]);
  sph(0.034, GOLD, [0, 2.5, -0.655]);
  torus(0.034, 0.006, GOLD, [0, 2.5, -0.655], { rotation: [0, 0, 0] });

  // herb drying pole, brackets and bunches
  rod([-0.84, 1.9, -0.28], [0.84, 1.9, -0.28], 0.016, DX, { sides: 6 });
  for (const sx of [1, -1]) {
    rod([sx * 0.84, 1.9, -0.52], [sx * 0.84, 1.9, -0.28], 0.014, GOLD, { sides: 6 });
    sph(0.022, GOLD, [sx * 0.84, 1.9, -0.28]);
  }
  const bunchSpecs: Array<[number, THREE.Texture, number]> = [[-0.77, LAV, 15], [-0.62, LEAF, 12], [0.62, FERN, 12], [0.77, FLOWER, 14]];
  bunchSpecs.forEach(([x, tex, n], i) => {
    const q = rng(40 + i);
    const fr = Array.from({ length: n }, () => frame([x + (q() - 0.5) * 0.02, 1.86, -0.28 + (q() - 0.5) * 0.02], [0, 1, 0]));
    b.cards(fr, tex, {
      size: tex === LAV ? [0.05, 0.28] : [0.07, 0.24], lean: 150, vary: 0.25, rng: q, bone: root,
      flow: (_f, k) => [Math.cos(k * 2.4), 0, Math.sin(k * 2.4)],
    });
    torus(0.014, 0.006, ROPE, [x, 1.87, -0.28]);
    rod([x, 1.885, -0.28], [x, 1.91, -0.28], 0.004, ROPE, { sides: 4 });
  });

  // back panel decoration: poster and pinned notes
  deco(POSTER, 0.3, 0.26, [0.28, 1.15, -0.552]);
  for (const [nx, ny, tilt] of [[-0.18, 1.12, 0.2], [0.55, 1.1, -0.18], [-0.45, 1.16, -0.1]] as Array<[number, number, number]>)
    deco(NOTE, 0.1, 0.1, [nx, ny, -0.55], [0, 0, 1], [tilt, 1, 0]);

  // lanterns hanging from the canopy edges
  function lantern(x: number) {
    const z = -0.33;
    const yc = 1.72;
    rod([x, 2.03, z], [x, yc + 0.13, z], 0.004, IRON, { sides: 4 });
    sph(0.012, GOLD, [x, yc + 0.135, z]);
    cyl(0.005, 0.075, 0.06, 6, GOLD, [x, yc + 0.095, z]);
    glow(b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.13, 6), "#ffcf6a", { bone: root, at: [x, yc, z], flat: true }), 1.3);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      rod([x + 0.062 * Math.cos(a), yc - 0.065, z + 0.062 * Math.sin(a)], [x + 0.062 * Math.cos(a), yc + 0.065, z + 0.062 * Math.sin(a)], 0.004, GOLD, { sides: 4 });
    }
    cyl(0.062, 0.02, 0.05, 6, GOLD, [x, yc - 0.09, z]);
    sph(0.014, GOLD, [x, yc - 0.12, z]);
    tassels([[x, yc - 0.125, z]], [0.05, 0.12]);
  }
  lantern(-0.93);
  lantern(0.93);

  // hanging shop sign on a bracket, swinging on its own joint
  const sign = b.joint("signboard", { parent: root, at: [-1.1, 1.55, -0.52], dir: [0, -1, 0], role: "hinge" });
  rod([-0.875, 1.55, -0.52], [-1.14, 1.55, -0.52], 0.014, GOLD, { sides: 6 });
  rod([-0.875, 1.36, -0.52], [-1.0, 1.55, -0.52], 0.01, GOLD, { sides: 6 });
  sph(0.022, GOLD, [-1.14, 1.55, -0.52]);
  const flaskOutline: Pt[] = [[-0.03, 0.12], [0.03, 0.12], [0.03, 0.07], [0.1, -0.04], [0.1, -0.1], [-0.1, -0.1], [-0.1, -0.04], [-0.03, 0.07]];
  b.extrude(flaskOutline, { at: [-1.1, 1.33, -0.52], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, color: DTEAL, bone: sign });
  b.extrude([[-0.075, -0.075], [0.075, -0.075], [0.085, -0.04], [0.025, 0.045], [-0.025, 0.045], [-0.085, -0.04]] as Pt[], {
    at: [-1.1, 1.33, -0.5], x: [1, 0, 0], thickness: 0.006, color: ELEM[0], bone: sign,
  });
  glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.004), ELEM[0], { bone: sign, at: [-1.1, 1.33, -0.5] }), 1);
  for (const sx of [1, -1]) rod([-1.1 + sx * 0.02, 1.55, -0.52], [-1.1 + sx * 0.02, 1.45, -0.52], 0.004, IRON, { bone: sign, sides: 4 });
  tassels([[-1.1, 1.23, -0.52]], [0.04, 0.1], sign);

  // ------------------------------------------------------------------------------------------------------------
  // Hutch shelf 1: potions, books, sapling
  bottle(KINDS.flask, -0.72, SH1, -0.5, 3, 1.1);
  bottle(KINDS.round, -0.55, SH1, -0.5, 0, 0.85);
  bottle(KINDS.hex, -0.4, SH1, -0.5, 5, 1);
  bottle(KINDS.square, -0.26, SH1, -0.5, 4, 1);
  const standing: Array<[number, number, number, Fill, THREE.Texture]> = [
    [-0.12, 0.24, 0.036, CRIM, SPINE_A],
    [-0.08, 0.2, 0.03, TEAL, SPINE_B],
    [-0.04, 0.26, 0.04, PLUM, SPINE_A],
    [0.0, 0.22, 0.032, FOREST, SPINE_B],
    [0.045, 0.25, 0.04, OCHRE, SPINE_A],
  ];
  for (const [x, len, thick, color, tex] of standing) book(x + 0.0, SH1, -0.49, len, thick, 0.19, color, tex, true);
  bottle(KINDS.drop, 0.28, SH1, -0.5, 6, 1);
  bottle(KINDS.vial, 0.43, SH1, -0.5, 1, 1.25);
  pot(0.6, SH1, -0.5, 1.2, CLAY, [LEAF, LEAF, FLOWER], 14, [0.07, 0.13], 5);
  pot(0.74, SH1, -0.5, 0.9, TEAL, [FERN], 9, [0.08, 0.14], 6);

  // Hutch shelf 2: hourglass, books and candle, jars, toadstools, crystal ball
  hourglass(-0.48, SH2, -0.5);
  let stackY = SH2;
  stackY = book(-0.27, stackY, -0.5, 0.22, 0.045, 0.16, CRIM, SPINE_A, false);
  stackY = book(-0.26, stackY, -0.5, 0.2, 0.04, 0.15, DTEAL, SPINE_B, false);
  candle(-0.27, stackY, -0.5, 0.1, 0.02, true);
  bottle(KINDS.jar, -0.08, SH2, -0.5, 3, 1);
  bottle(KINDS.jar, 0.07, SH2, -0.5, 0, 1);
  mush(0.2, SH2, -0.5, 1.1);
  mush(0.255, SH2, -0.46, 0.8);
  mush(0.235, SH2, -0.53, 0.65);
  lath([[0, 0], [0.05, 0], [0.056, 0.012], [0.04, 0.024], [0.025, 0.04], [0.032, 0.052], [0.045, 0.058], [0, 0.052]], [0.42, SH2, -0.5], GOLD, { segments: 10 });
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.5;
    sph(0.008, GOLD, [0.42 + 0.05 * Math.cos(a), SH2 + 0.006, -0.5 + 0.05 * Math.sin(a)], {}, 5, 3);
  }
  glow(b.part(new THREE.SphereGeometry(0.065, 12, 8), "#ffffff", { bone: root, at: [0.42, SH2 + 0.108, -0.5], texture: ORB, rotation: [0, -90, 0] }), 0.9);

  // ------------------------------------------------------------------------------------------------------------
  // Table: grimoire on a glowing rune cloth, alembic, potion rack, crystals, candle, inkwell, scroll, herbs, mortar
  const bx = -0.08;
  const bz = 0.1;
  const bBase = 0.9055;
  b.part(new THREE.CircleGeometry(0.33, 20), "#ffffff", { bone: root, at: [bx, 0.9035, bz + 0.03], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: CLOTH });
  glow(b.part(new THREE.CircleGeometry(0.33, 20), "#ffffff", { bone: root, at: [bx, 0.9065, bz + 0.03], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: RUNES }), 1);
  box(0.54, 0.012, 0.34, TEAL, [bx, bBase + 0.006, bz]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.014, 0.05, GOLD, [bx + sx * 0.255, bBase + 0.006, bz + sz * 0.155]);
  const pa = (6 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const cxp = bx + s * 0.122;
    const cyp = bBase + 0.0365;
    box(0.24, 0.026, 0.31, PAPER, [cxp, cyp, bz], { rotation: [0, 0, -s * 6] });
    const n: V = [s * Math.sin(pa), Math.cos(pa), 0];
    deco(s > 0 ? PAGE_R : PAGE_L, 0.225, 0.29, [cxp + n[0] * 0.0155, cyp + n[1] * 0.0155, bz], n, [0, 0, -1]);
  }
  rod([bx + 0.01, bBase + 0.058, bz + 0.1], [bx + 0.02, bBase + 0.02, bz + 0.2], 0.005, CRIM, { sides: 4 });
  tassels([[bx + 0.02, bBase + 0.02, bz + 0.2]], [0.03, 0.06]);

  // alembic on a stove
  const sx0 = -0.62;
  const sz0 = -0.14;
  cylB(0.14, 0.15, 0.09, 8, IRON, [sx0, 0.9, sz0]);
  torus(0.145, 0.008, GOLD, [sx0, 0.945, sz0]);
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 8), "#ff7a33", { bone: root, at: [sx0, 0.99, sz0] }), 1.2);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.256;
    glow(b.part(new THREE.ConeGeometry(0.018, 0.05 + (i % 2) * 0.02, 5), "#ffb347", { bone: root, at: [sx0 + 0.1 * Math.cos(a), 1.02 + (i % 2) * 0.01, sz0 + 0.1 * Math.sin(a)] }), 1.3);
  }
  sph(0.13, COPPER, [sx0, 1.13, sz0], {}, 10, 8);
  torus(0.13, 0.006, BRASS, [sx0, 1.13, sz0]);
  torus(0.1, 0.005, BRASS, [sx0, 1.06, sz0]);
  cyl(0.04, 0.09, 0.12, 8, COPPER, [sx0, 1.28, sz0]);
  torus(0.048, 0.006, GOLD, [sx0, 1.335, sz0]);
  sph(0.06, COPPER, [sx0, 1.385, sz0], {}, 10, 8);
  sph(0.016, GOLD, [sx0, 1.45, sz0]);
  const pipePts: V[] = [[sx0 + 0.04, 1.4, sz0], [sx0 + 0.1, 1.46, sz0 - 0.01], [sx0 + 0.17, 1.42, sz0 - 0.035], [sx0 + 0.18, 1.3, sz0 - 0.05], [sx0 + 0.18, 1.15, sz0 - 0.05]];
  b.sweep(catmull(pipePts), 0.017, { color: COPPER, bone: root, sides: 6 });
  sph(0.024, BRASS, [sx0 + 0.045, 1.4, sz0]);
  b.sweep(spiral([sx0 + 0.18, 1.3, sz0 - 0.05], [sx0 + 0.225, 1.3, sz0 - 0.05], [0, -1, 0], { turns: 3, r1: 0.045, pitch: 0.035 }), 0.006, { color: BRASS, bone: root, sides: 4 });
  bottle(KINDS.round, sx0 + 0.18, 0.9, sz0 - 0.05, 1, 1);

  // vial rack
  box(0.34, 0.02, 0.1, DX, [0.06, 0.91, -0.28]);
  box(0.34, 0.014, 0.1, DX, [0.06, 1.012, -0.28]);
  for (const sx of [1, -1]) box(0.016, 0.13, 0.1, DX, [0.06 + sx * 0.165, 0.965, -0.28]);
  box(0.34, 0.01, 0.012, GOLD, [0.06, 1.022, -0.23]);
  [0, 2, 4, 6].forEach((e, i) => bottle(KINDS.vial, 0.06 + (i - 1.5) * 0.07, 0.92, -0.28, e, 1));

  // geo crystals on a rock base
  b.part(new THREE.IcosahedronGeometry(0.1, 0), STONE, { bone: root, at: [0.72, 0.925, -0.2], scale: [1, 0.5, 1], flat: true });
  const cols = ["#ffc83a", "#ffb020", "#ffe27a", "#ffc83a", "#ffb020"];
  const cr: Array<[V, V, number, number]> = [
    [[0.72, 0.93, -0.2], [0.05, 1, 0.02], 0.2, 0.03],
    [[0.67, 0.93, -0.18], [-0.45, 1, 0.1], 0.14, 0.022],
    [[0.77, 0.93, -0.22], [0.5, 1, -0.2], 0.13, 0.022],
    [[0.7, 0.93, -0.25], [-0.2, 1, -0.5], 0.11, 0.018],
    [[0.75, 0.93, -0.15], [0.3, 1, 0.5], 0.1, 0.018],
  ];
  cr.forEach(([base, dir, len, rad], i) => crystal(base, dir, len, rad, cols[i]));

  // candle in a dish and inkwell with quill
  candle(0.2, 0.9, -0.1, 0.12, 0.022, true);
  lath([[0, 0], [0.035, 0], [0.04, 0.02], [0.035, 0.04], [0.02, 0.05], [0.02, 0.055], [0, 0.055]], [0.2, 0.9, 0.28], cel("#2b6fb3", "#1b3f7a"), { segments: 8 });
  cyl(0.022, 0.022, 0.008, 8, GOLD, [0.2, 0.958, 0.28]);
  const qd = new THREE.Vector3(0.25, 1, -0.15).normalize();
  const qa = new THREE.Vector3(0.21, 0.955, 0.28);
  const qm = qa.clone().addScaledVector(qd, 0.06);
  rod([qa.x, qa.y, qa.z], [qm.x, qm.y, qm.z], 0.003, LINEN, { sides: 4 });
  b.cards([frame([qm.x, qm.y, qm.z], [qd.x, qd.y, qd.z])], FEATHER, { size: [0.06, 0.22], bone: root });

  // scroll and lying herb bundle
  cyl(0.026, 0.026, 0.22, 8, PAPER, [-0.47, 0.93, 0.27], { rotation: [0, 0, 90] });
  sph(0.014, GOLD, [-0.575, 0.93, 0.27]);
  sph(0.014, GOLD, [-0.365, 0.93, 0.27]);
  torus(0.029, 0.005, CRIM, [-0.47, 0.93, 0.27], { rotation: [0, 90, 0] });
  tassels([[-0.47, 0.905, 0.3]], [0.03, 0.07]);
  const bundle = rng(77);
  for (let i = 0; i < 3; i++) rod([-0.76, 0.915 + i * 0.006, 0.26 + i * 0.02], [-0.58, 0.92, 0.29 + i * 0.01], 0.004, cel("#5c8a3e", "#2f5a3a"), { sides: 4 });
  const bfr: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 13; i++) bfr.push(frame([-0.76 + i * 0.015, 0.922 + bundle() * 0.01, 0.265 + bundle() * 0.045], [0, 1, 0]));
  b.cards(bfr, [LEAF, LAV], { size: [0.06, 0.1], lean: 72, vary: 0.25, spin: 30, rng: bundle, bone: root, flow: (_f, i) => [1, 0, Math.sin(i * 2.2) * 0.7] });
  torus(0.016, 0.005, ROPE, [-0.66, 0.925, 0.28], { rotation: [0, 90, 0] });
  bottle(KINDS.drop, -0.3, 0.9, 0.3, 0, 1);
  bottle(KINDS.flask, -0.2, 0.9, 0.34, 3, 0.8);

  // mortar and pestle
  lath([[0, 0], [0.045, 0], [0.06, 0.015], [0.075, 0.06], [0.08, 0.075], [0.07, 0.075], [0.062, 0.06], [0.04, 0.03], [0, 0.028]], [0.73, 0.9, 0.24], STONE, { segments: 10 });
  sph(0.05, FOREST, [0.73, 0.94, 0.24], { scale: [1, 0.35, 1] });
  b.capsule([0.725, 0.95, 0.24], [0.8, 1.1, 0.26], [0.014, 0.022], STONE, { bone: root, sides: 6 });
  sph(0.026, GOLD, [0.805, 1.115, 0.262]);
  tuft(0.73, 0.945, 0.24, 0.03, 6, LEAF, [0.05, 0.07], 40, 21);

  // brass balance with joints for beam and pans
  const px = 0.52;
  const py = 1.285;
  const pzz = 0;
  lath([[0, 0], [0.1, 0], [0.1, 0.012], [0.075, 0.025], [0.03, 0.05], [0.02, 0.08], [0.02, 0.33], [0.032, 0.35], [0.032, 0.37], [0.018, 0.385], [0, 0.385]], [px, 0.9, pzz], BRASS, { segments: 10 });
  torus(0.085, 0.007, GOLD, [px, 0.912, pzz]);
  torus(0.07, 0.005, GOLD, [px, py + 0.05, pzz - 0.02], { rotation: [0, 0, 0] });
  const beam = b.joint("scaleBeam", { parent: root, at: [px, py, pzz], dir: [1, 0, 0], role: "hinge" });
  const tilt = (6 * Math.PI) / 180;
  const eL: V = [px - 0.21 * Math.cos(tilt), py + 0.21 * Math.sin(tilt), pzz];
  const eR: V = [px + 0.21 * Math.cos(tilt), py - 0.21 * Math.sin(tilt), pzz];
  rod(eL, eR, 0.011, BRASS, { bone: beam, sides: 6 });
  sph(0.03, GOLD, [px, py, pzz], { bone: beam });
  rod([px, py, pzz], [px + 0.0094, py + 0.0895, pzz], 0.004, GOLD, { bone: beam, sides: 4 });
  sph(0.012, GOLD, eL, { bone: beam });
  sph(0.012, GOLD, eR, { bone: beam });
  const panL = b.joint("panL", { parent: beam, at: [eL[0], eL[1] - 0.22, eL[2]], dir: [0, 1, 0], role: "hinge" });
  const panR = b.joint("panR", { parent: beam, at: [eR[0], eR[1] - 0.22, eR[2]], dir: [0, 1, 0], role: "hinge" });
  const panProfile: Pt[] = [[0, 0], [0.04, 0], [0.07, 0.02], [0.075, 0.03], [0.068, 0.03], [0.04, 0.01], [0, 0.01]];
  for (const [e, pj] of [[eL, panL], [eR, panR]] as Array<[V, Joint]>) {
    const py0 = e[1] - 0.22;
    lath(panProfile, [e[0], py0, e[2]], BRASS, { segments: 10, bone: pj });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094 + 1.57;
      rod([e[0], e[1] - 0.012, e[2]], [e[0] + 0.072 * Math.cos(a), py0 + 0.03, e[2] + 0.072 * Math.sin(a)], 0.0035, GOLD, { bone: pj, sides: 4 });
    }
  }
  const wy = eL[1] - 0.22 + 0.01;
  cyl(0.02, 0.02, 0.016, 8, BRASS, [eL[0] - 0.02, wy + 0.008, eL[2]], { bone: panL });
  cyl(0.016, 0.016, 0.016, 8, GOLD, [eL[0] - 0.02, wy + 0.024, eL[2]], { bone: panL });
  sph(0.008, GOLD, [eL[0] - 0.02, wy + 0.038, eL[2]], { bone: panL }, 5, 4);
  cyl(0.018, 0.018, 0.014, 8, BRASS, [eL[0] + 0.03, wy + 0.007, eL[2] + 0.02], { bone: panL });
  const ry = eR[1] - 0.22 + 0.01;
  crystal([eR[0], ry, eR[2]], [0.1, 1, 0], 0.07, 0.014, "#ffc83a", panR);
  for (let i = 0; i < 4; i++) cyl(0.018, 0.018, 0.004, 10, GOLD, [eR[0] + 0.035, ry + 0.002 + i * 0.004, eR[2] + 0.015], { bone: panR });
  for (let i = 0; i < 3; i++) cylB(0.012 + i * 0.002, 0.012 + i * 0.002, 0.014, 8, BRASS, [0.7 + i * 0.045, 0.9, 0.12 + (i % 2) * 0.03]);

  // ------------------------------------------------------------------------------------------------------------
  // Lower shelf: sack, carboy, crate of vials, wicker basket
  sph(0.13, LINEN, [-0.5, 0.33, 0], { scale: [1, 0.9, 1] }, 8, 6);
  torus(0.07, 0.01, ROPE, [-0.5, 0.425, 0]);
  tuft(-0.5, 0.43, 0, 0.03, 7, [FERN, LAV], [0.06, 0.14], 25, 31);
  bottle(KINDS.carboy, -0.05, 0.215, 0.05, 2, 0.9);
  box(0.36, 0.02, 0.28, DX, [0.4, 0.225, 0]);
  box(0.36, 0.2, 0.014, WZ, [0.4, 0.325, 0.133]);
  box(0.36, 0.2, 0.014, WZ, [0.4, 0.325, -0.133]);
  box(0.014, 0.2, 0.28, WZ, [0.573, 0.325, 0]);
  box(0.014, 0.2, 0.28, WZ, [0.227, 0.325, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.03, 0.22, 0.03, DX, [0.4 + sx * 0.18, 0.325, sz * 0.14]);
  bottle(KINDS.vial, 0.31, 0.235, 0, 1, 1.5);
  bottle(KINDS.vial, 0.4, 0.235, 0.03, 3, 1.5);
  bottle(KINDS.vial, 0.49, 0.235, -0.02, 5, 1.5);
  lath([[0, 0], [0.085, 0], [0.115, 0.1], [0.12, 0.12], [0, 0.115]], [0.66, 0.215, 0], WICKER, { segments: 10 });
  torus(0.118, 0.007, ROPE, [0.66, 0.325, 0]);
  tuft(0.66, 0.33, 0, 0.07, 10, [LEAF, FLOWER], [0.07, 0.12], 30, 33);

  // ------------------------------------------------------------------------------------------------------------
  // Floor right: cauldron on a tripod over a fire
  const cx = 1.28;
  const cz = 0.22;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    b.part(new THREE.IcosahedronGeometry(0.07, 0), STONE, { bone: root, at: [cx + 0.36 * Math.cos(a), 0.05, cz + 0.36 * Math.sin(a)], scale: [1, 0.7, 1], flat: true, rotation: [i * 20, i * 35, 0] });
  }
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    rod([cx + 0.25 * Math.cos(a), 0.06, cz + 0.25 * Math.sin(a)], [cx - 0.25 * Math.cos(a), 0.06, cz - 0.25 * Math.sin(a)], 0.035, DX, { sides: 6 });
  }
  const flames: Array<[number, number, number, string]> = [
    [0.17, 0.0, 0.18, "#ff8a2a"], [0.17, 1.3, 0.14, "#ff8a2a"], [0.17, 2.6, 0.2, "#ff8a2a"], [0.17, 3.9, 0.15, "#ff8a2a"], [0.17, 5.1, 0.18, "#ff8a2a"],
    [0.1, 0.7, 0.14, "#ffd04a"], [0.1, 2.3, 0.12, "#ffd04a"], [0.1, 4.2, 0.13, "#ffd04a"], [0.0, 0, 0.1, "#fff2a0"],
  ];
  for (const [rr, a, h, c] of flames)
    glow(b.part(new THREE.ConeGeometry(0.045, h, 5), c, { bone: root, at: [cx + rr * Math.cos(a), 0.07 + h / 2, cz + rr * Math.sin(a)] }), 1.3);
  lath(
    [[0, 0], [0.1, 0], [0.2, 0.04], [0.28, 0.13], [0.31, 0.24], [0.29, 0.34], [0.3, 0.36], [0.3, 0.38], [0.26, 0.38], [0.262, 0.34], [0, 0.34]],
    [cx, 0.17, cz], SOOT, { segments: 12 },
  );
  torus(0.3, 0.012, GOLD, [cx, 0.55, cz]);
  torus(0.303, 0.007, GOLD, [cx, 0.44, cz]);
  torus(0.28, 0.006, BRASS, [cx, 0.32, cz]);
  glow(b.part(new THREE.CylinderGeometry(0.262, 0.262, 0.014, 12), ELEM[2], { bone: root, at: [cx, 0.516, cz] }), 1);
  const bubbles: Array<[number, number, number, number]> = [[0.09, 0.05, 0.03, 0.53], [-0.1, 0.1, 0.04, 0.53], [0.02, -0.15, 0.025, 0.53], [-0.12, -0.08, 0.02, 0.54], [0.12, -0.12, 0.018, 0.64], [-0.04, 0.02, 0.022, 0.74]];
  for (const [dx, dzz, r, y] of bubbles) glow(sph(r, "#b6f58a", [cx + dx, y, cz + dzz], {}, 6, 4), 1);
  glow(b.sweep(spiral([cx, 0.56, cz], [cx + 0.12, 0.56, cz], [0, 1, 0], { turns: 2.2, r1: 0.03, pitch: 0.15 }), 0.008, { color: "#c5ff9a", bone: root, sides: 4 }), 1);
  b.part(new THREE.TorusGeometry(0.3, 0.011, 4, 12, Math.PI), IRON, { bone: root, at: [cx, 0.55, cz] });
  sph(0.02, IRON, [cx + 0.3, 0.55, cz]);
  sph(0.02, IRON, [cx - 0.3, 0.55, cz]);
  const apex: V = [cx, 1.1, cz];
  for (let i = 0; i < 3; i++) {
    const a = 1.57 + i * 2.094;
    rod([cx + 0.62 * Math.cos(a), 0, cz + 0.62 * Math.sin(a)], apex, 0.022, DY, { sides: 6 });
    torus(0.04, 0.007, GOLD, [cx + 0.62 * 0.5 * Math.cos(a) + 0.0, 0.55, cz + 0.62 * 0.5 * Math.sin(a)], { rotation: [0, 0, 0] });
  }
  sph(0.04, IRON, apex);
  rod(apex, [cx, 0.86, cz], 0.006, IRON, { sides: 4 });
  rod([cx - 0.05, 0.4, cz + 0.05], [cx - 0.26, 0.82, cz + 0.2], 0.012, DX, { sides: 6 });
  sph(0.04, DX, [cx - 0.05, 0.43, cz + 0.05], { scale: [1, 0.6, 1] }, 6, 4);
  sph(0.014, GOLD, [cx - 0.26, 0.83, cz + 0.2]);

  // ------------------------------------------------------------------------------------------------------------
  // Floor left: barrel, crate of bottles, sack, book stack
  const barrel = lath([[0, 0], [0.2, 0], [0.225, 0.1], [0.24, 0.3], [0.225, 0.52], [0.2, 0.62], [0, 0.62]], [-1.22, 0, -0.02], WY, { segments: 10 });
  torus(0.222, 0.009, IRON, [-1.22, 0.08, -0.02]);
  torus(0.222, 0.009, IRON, [-1.22, 0.54, -0.02]);
  torus(0.238, 0.008, BRASS, [-1.22, 0.22, -0.02]);
  torus(0.238, 0.008, BRASS, [-1.22, 0.4, -0.02]);
  cyl(0.19, 0.19, 0.012, 10, DX, [-1.22, 0.626, -0.02]);
  b.decal(barrel, LABELS[6], { at: [-1.22, 0.31, 0.215], dir: [0, 0, 1], size: [0.16, 0.22], segments: 6, bone: root });
  cyl(0.012, 0.012, 0.05, 6, GOLD, [-1.22, 0.2, 0.24], { rotation: [90, 0, 0] });
  bottle(KINDS.jar, -1.12, 0.632, -0.06, 6, 1.2);
  tuft(-1.32, 0.634, 0.04, 0.05, 8, [LEAF, FLOWER, LAV], [0.07, 0.12], 70, 41);

  box(0.42, 0.02, 0.32, DX, [-1.35, 0.01, 0.58]);
  box(0.42, 0.22, 0.016, WZ, [-1.35, 0.11, 0.73]);
  box(0.42, 0.22, 0.016, WZ, [-1.35, 0.11, 0.43]);
  box(0.016, 0.22, 0.32, WZ, [-1.14, 0.11, 0.58]);
  box(0.016, 0.22, 0.32, WZ, [-1.56, 0.11, 0.58]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.035, 0.24, 0.035, DX, [-1.35 + sx * 0.2, 0.12, 0.58 + sz * 0.15]);
  bottle(KINDS.round, -1.46, 0.03, 0.58, 0, 1.2);
  bottle(KINDS.vial, -1.35, 0.03, 0.6, 1, 1.4);
  bottle(KINDS.flask, -1.24, 0.03, 0.58, 5, 1.3);

  sph(0.18, LINEN, [-1.1, 0.16, -0.55], { scale: [1, 0.9, 1] }, 8, 6);
  torus(0.09, 0.012, ROPE, [-1.1, 0.29, -0.55]);
  tuft(-1.1, 0.3, -0.55, 0.04, 9, [LAV, FLOWER, LEAF], [0.07, 0.16], 28, 51);

  let fy = 0.016;
  fy = book(-0.9, fy, 0.78, 0.3, 0.05, 0.22, CRIM, SPINE_A, false);
  fy = book(-0.88, fy, 0.77, 0.27, 0.045, 0.2, FOREST, SPINE_B, false);
  fy = book(-0.91, fy, 0.78, 0.25, 0.04, 0.19, PLUM, SPINE_A, false);
  sph(0.03, GOLD, [-0.9, fy + 0.03, 0.78], {}, 6, 4);

  return b.root;
}
