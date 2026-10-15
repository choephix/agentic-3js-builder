import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull, spiral } from "../../../../src/path";
import { grain, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A Genshin-style alchemist's workbench: carved wood table with gold filigree drawers, a teal-lattice hutch with glowing potions, books, a balance scale, distillation rig, mortar, hanging herbs, a crystal shrine, a bubbling cauldron, stool, basket and tassel-trimmed rug.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Fill = string | Paint;

const D = Math.PI / 180;
const fr = (x: number) => x - Math.floor(x);
const hash1 = (k: number) => fr(Math.sin(k * 12.9898) * 43758.5453);
const sc = (r: number, pts: number[][]): OutlinePoint[] => pts.map(([x, y]): OutlinePoint => [x * r, y * r]);

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface is a two-tone cel paint with a hue-shifted shadow.
const GOLD = cel("#f6c850", "#b97d22");
const GOLD_D = cel("#d9a032", "#8f5a1a");
const TEAL = cel("#27b5a8");
const CREAM = cel("#fff0cc", "#e5c394");
const PARCH = cel("#f2e2b3", "#d3b57e");
const IRON = cel("#555a73", "#33344d");
const IRON_D = cel("#3a3c52", "#25263a");
const CORK = cel("#cf9f5e", "#9e6f3a");
const WAX = cel("#fff1d6", "#e0c3a0");
const GLASS = cel("#e2f8f5", "#a9d4de");
const RED = cel("#c9453c", "#8f2438");
const CERAMIC = cel("#ebe5d6", "#bfb4cf");
const LEATHER = cel("#9a5a38", "#6a3430");
const MOSS = cel("#7fb34b", "#3f8052");
const LEAFG = cel("#5fae4e", "#2f7a52");
const SOIL = cel("#6a4430", "#3f2a3a");
const TERRA = cel("#d1744a", "#9a4a43");
const BURLAP = cel("#c9a46a", "#8f6a48");
const STRAW = cel("#e6c36a", "#b88a48");
const SAND = cel("#f0c867", "#c08a3a");
const WICKER = cel("#b5803e", "#7a4a30");
const INKGLASS = cel("#2b2f6b", "#171a45");
const WOOD_A = cel(grain("#b5703c", "#9c5c30", { size: 0.03, axis: "x" }));
const WOOD_AV = cel(grain("#b5703c", "#9c5c30", { size: 0.03, axis: "y" }));
const WOOD_DK = cel(grain("#7c4628", "#683a21", { size: 0.03, axis: "x" }));
const WOOD_DKV = cel(grain("#7c4628", "#683a21", { size: 0.03, axis: "y" }));
const WOOD_LT = cel(grain("#d19a5c", "#be8548", { size: 0.025, axis: "x" }));
const BOOKC = [cel("#6e4fc0"), cel("#b83a4a"), cel("#3f9a58"), cel("#3b72c6"), cel("#e08a3a"), cel("#2b8f93")];

// Elemental glow colours (flat colours, so they can glow).
const E = {
  pyro: "#ff6a3d",
  hydro: "#3aa7ff",
  anemo: "#5de0c0",
  electro: "#b36bff",
  dendro: "#8fd94a",
  cryo: "#a6e8ff",
  geo: "#ffc94a",
};
const WHITE = "#ffffff";

const TOPWOOD = cel(
  paint((p, n) => {
    if (n.y < 0.5) return "#8a5230";
    const u = (p.z + 5) / 0.135;
    const k = Math.floor(u);
    const f = u - k;
    if (f < 0.035 || f > 0.965) return "#4f2a1a";
    const tones = ["#c0803f", "#b87738", "#c98a48", "#b06e34"];
    const base = tones[Math.floor(hash1(k) * tones.length)];
    const q = new THREE.Vector3(p.x * 0.12, p.y, p.z + k * 0.37);
    const g = noise(q, 0.025, 4);
    const stain = smoothstep(0.7, 0.82, noise(p, 0.16, 9));
    const c = mix(base, "#8e532a", smoothstep(0.55, 0.8, g) * 0.6);
    return mix(c, "#365e66", stain * 0.5);
  }),
);

const BACKPANEL = cel(
  paint((p, n) => {
    if (n.z < 0.5) return "#1c6a74";
    const u = (p.x + 5) / 0.155;
    if (fr(u) < 0.03) return "#124b57";
    const d1 = fr((p.x + p.y) / 0.14);
    const d2 = fr((p.x - p.y) / 0.14);
    if (Math.hypot(d1 - 0.5, d2 - 0.5) < 0.1) return "#f6c850";
    if (d1 < 0.05 || d2 < 0.05) return "#3fb7b0";
    return "#22888f";
  }),
);

const PAGES = cel(paint((p, n) => (Math.abs(n.y) > 0.8 ? "#fff3d2" : fr(p.y * 220) < 0.35 ? "#d9bb86" : "#fff0cc")));

const RUG = cel(
  paint((p) => {
    const e = Math.min(1.6 - Math.abs(p.x), 1.0 - Math.abs(p.z - 0.1));
    if (e < 0.04) return "#f2c14e";
    if (e < 0.07) return "#1d3c6e";
    if (e < 0.1) return "#fff0cc";
    if (e < 0.22) return Math.abs(fr(p.x / 0.12) - 0.5) + Math.abs(fr(p.z / 0.12) - 0.5) < 0.32 ? "#f2c14e" : "#2f6f9f";
    if (e < 0.25) return "#1d3c6e";
    const zz = p.z - 0.1;
    const r = Math.hypot(p.x * 0.8, zz * 1.3);
    if (r < 0.12) return "#f2c14e";
    if (r < 0.16) return "#1d3c6e";
    if (r < 0.3) {
      const a = Math.atan2(zz, p.x);
      return Math.abs(fr((a * 8) / (2 * Math.PI)) - 0.5) < 0.22 + (0.3 - r) * 0.5 ? "#fff0cc" : "#8c3d6e";
    }
    if (r < 0.34) return "#f2c14e";
    return Math.abs(fr(p.x / 0.3) - 0.5) + Math.abs(fr(p.z / 0.3) - 0.5) < 0.12 ? "#4a82bf" : "#2f5f9a";
  }),
);

const RUNNER = cel(
  paint((p) => {
    const e = Math.min(0.5 - Math.abs(p.x - 0.1), 0.26 - Math.abs(p.z - 0.08));
    if (e < 0.015) return "#f2c14e";
    if (e < 0.03) return "#14707a";
    return Math.abs(fr(p.x / 0.08) - 0.5) + Math.abs(fr(p.z / 0.08) - 0.5) < 0.3 ? "#2fc1b3" : "#1f9a97";
  }),
);

const CUSHION = cel(paint((p) => (fr(Math.hypot(p.x - 1.28, p.z - 0.5) / 0.05) < 0.2 ? "#f6c850" : "#c9453c")));
const WEAVE = cel(
  paint((p) => {
    const a = Math.atan2(p.x - 1.4, p.z + 0.2) * 6;
    return (Math.floor(p.y / 0.022) + Math.floor(a)) & 1 ? "#c99456" : "#b5803e";
  }),
);
const MORTAR = cel(paint((p) => (p.y > 0.9 + 0.06 && p.y < 0.9 + 0.075 ? "#27b5a8" : "#ebe5d6")));

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const stem = (d: string, c = "#5f8a4a") =>
  `<path d="${d}" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
const leafE = (cx: number, cy: number, rx: number, ry: number, rot: number, fill: string) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rot} ${cx} ${cy})"/>`;
const buds = (pts: number[][], c1: string, c2: string) =>
  pts
    .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="2.7" ry="3.6" fill="${i % 2 ? c1 : c2}"/>`)
    .join("");
const bloom = (cx: number, cy: number, r: number, c1: string, c2: string) => {
  let s = "";
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    s += `<circle cx="${(cx + Math.cos(a) * r * 0.62).toFixed(2)}" cy="${(cy + Math.sin(a) * r * 0.62).toFixed(2)}" r="${(r * 0.52).toFixed(2)}" fill="${c1}"/>`;
  }
  return `${s}<circle cx="${cx}" cy="${cy}" r="${(r * 0.42).toFixed(2)}" fill="${c2}"/>`;
};

const LAV_SVG = `<svg viewBox="0 0 32 64">
  ${stem("M16 64 C15 50 10 36 8 14")}${stem("M16 64 C16 48 16 32 16 6")}${stem("M16 64 C17 50 22 36 24 12")}
  ${leafE(12, 56, 1.8, 7, -25, "#7fa86a")}${leafE(20, 55, 1.8, 7, 25, "#7fa86a")}
  ${buds([[8.2, 12], [8.6, 18], [9.2, 24], [9.9, 30]], "#8e63d6", "#b48cf0")}
  ${buds([[16, 5], [16, 11], [16, 17], [16, 23], [16, 29]], "#9a70e0", "#b48cf0")}
  ${buds([[24, 11], [23.4, 17], [22.8, 23], [22, 29]], "#8e63d6", "#b48cf0")}
</svg>`;
const SAGE_SVG = `<svg viewBox="0 0 32 64">
  ${stem("M16 64 L16 6", "#6a8a5a")}
  ${[14, 26, 38, 50].map((y) => leafE(10, y, 3.4, 7.5, -48, "#8fb48a") + leafE(22, y + 4, 3.4, 7.5, 48, "#a6c79a")).join("")}
  ${leafE(16, 5, 3, 6, 0, "#a6c79a")}
</svg>`;
const FLOWER_SVG = `<svg viewBox="0 0 32 64">
  ${stem("M16 64 C15 50 10 36 7 16")}${stem("M16 64 C16 48 17 32 17 9")}${stem("M16 64 C17 50 22 38 25 18")}
  ${leafE(11, 54, 2.2, 7, -30, "#6a9a52")}${leafE(21, 52, 2.2, 7, 30, "#6a9a52")}
  ${bloom(7, 13, 6, "#ff9a3c", "#ffd45a")}${bloom(17, 7, 6.5, "#ffb84a", "#fff0a0")}${bloom(25, 15, 5.5, "#ff7a50", "#ffd45a")}
</svg>`;
const BLOOM_SVG = `<svg viewBox="0 0 32 64">
  ${stem("M16 64 C15 48 17 30 16 12")}${stem("M16 50 C10 44 8 40 7 34")}${stem("M16 44 C22 38 24 34 25 28")}
  ${leafE(12, 56, 2.4, 7, -30, "#5fae4e")}${leafE(21, 56, 2.4, 7, 30, "#5fae4e")}
  ${bloom(16, 9, 7, "#ff8fb8", "#ffe27a")}${bloom(7, 32, 5, "#ffb0cc", "#ffe27a")}${bloom(25, 26, 5, "#ffb0cc", "#ffe27a")}
</svg>`;
const SPRIG_SVG = `<svg viewBox="0 0 32 64">
  ${stem("M16 64 C16 48 15 30 16 6", "#3f8a4e")}
  ${[52, 40, 28, 16].map((y, i) => leafE(i % 2 ? 9 : 23, y, 3.6, 8, i % 2 ? -50 : 50, i % 2 ? "#5fae4e" : "#74c05a")).join("")}
  ${leafE(16, 6, 3.4, 7, 0, "#74c05a")}
</svg>`;
const LEAF_SVG = `<svg viewBox="0 0 32 40">
  <path d="M16 40 C4 32 2 14 16 1 C30 14 28 32 16 40 Z" fill="#5fae4e" stroke="#2f7a52" stroke-width="1.2"/>
  <path d="M16 40 L16 5" stroke="#2f7a52" stroke-width="1.6" fill="none"/>
  <path d="M16 30 L7 22 M16 30 L25 22 M16 20 L9 13 M16 20 L23 13" stroke="#3f8a4e" stroke-width="1.2" fill="none"/>
  <path d="M16 38 C6 30 5 16 16 4 C13 14 13 28 16 38 Z" fill="#74c05a"/>
</svg>`;
const TASSEL_SVG = `<svg viewBox="0 0 24 64">
  <path d="M12 42 L4 3 M12 42 L8 2 M12 42 L12 1 M12 42 L16 2 M12 42 L20 3" stroke="#f6c850" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M12 42 L6 4 M12 42 L10 3 M12 42 L14 3 M12 42 L18 4" stroke="#c98a2a" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <rect x="6.5" y="37" width="11" height="8" rx="2" fill="#c9453c" stroke="#8f2438" stroke-width="1"/>
  <rect x="6.5" y="40" width="11" height="2" fill="#f6c850"/>
  <circle cx="12" cy="54" r="7" fill="#c9453c" stroke="#8f2438" stroke-width="1.2"/>
  <circle cx="12" cy="54" r="3" fill="#f6c850"/>
  <path d="M12 61 V64" stroke="#c9453c" stroke-width="3"/>
</svg>`;
const WISP_SVG = `<svg viewBox="0 0 32 96">
  <path d="M16 96 C4 80 28 64 16 48 C4 32 24 20 18 4" stroke="#7dffc8" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M16 96 C4 80 28 64 16 48 C4 32 24 20 18 4" stroke="#e9fff4" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
const FILIGREE_SVG = `<svg viewBox="0 0 200 48">
  <rect x="1" y="1" width="198" height="46" rx="5" fill="#1d8f8d" stroke="#f6c850" stroke-width="2"/>
  <rect x="6" y="6" width="188" height="36" rx="3" fill="none" stroke="#f6c850" stroke-width="1.3"/>
  <path d="M100 8 L114 24 L100 40 L86 24 Z" fill="none" stroke="#f6c850" stroke-width="2"/>
  <circle cx="100" cy="24" r="5" fill="#f6c850"/>
  <path d="M82 24 C72 8 52 8 52 22 C52 32 66 32 66 24 C66 18 58 18 58 22" stroke="#f6c850" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M118 24 C128 8 148 8 148 22 C148 32 134 32 134 24 C134 18 142 18 142 22" stroke="#f6c850" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M46 24 H14 M154 24 H186" stroke="#f6c850" stroke-width="2" stroke-linecap="round"/>
  <circle cx="14" cy="24" r="2.6" fill="#f6c850"/><circle cx="186" cy="24" r="2.6" fill="#f6c850"/>
</svg>`;
const EMBLEM_SVG = `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="27" fill="none" stroke="#f6c850" stroke-width="3"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#f6c850" stroke-width="1.6"/>
  <path d="M32 9 L38 26 L55 32 L38 38 L32 55 L26 38 L9 32 L26 26 Z" fill="#f6c850"/>
  <circle cx="32" cy="32" r="6" fill="#27b5a8" stroke="#8f5a1a" stroke-width="1.4"/>
</svg>`;
const CHART_SVG = `<svg viewBox="0 0 100 120">
  <rect x="2" y="2" width="96" height="116" rx="3" fill="#f0dfae" stroke="#8a5a3a" stroke-width="2"/>
  <rect x="7" y="7" width="86" height="106" rx="2" fill="none" stroke="#c9a46a" stroke-width="1.2"/>
  <circle cx="50" cy="48" r="34" fill="none" stroke="#5a2f1f" stroke-width="1.6"/>
  <circle cx="50" cy="48" r="28" fill="none" stroke="#5a2f1f" stroke-width="1.1"/>
  <path d="M50 16 L77.7 64 H22.3 Z" fill="none" stroke="#a8342f" stroke-width="1.6"/>
  <path d="M50 80 L22.3 32 H77.7 Z" fill="none" stroke="#2b7f86" stroke-width="1.6"/>
  <circle cx="50" cy="48" r="6" fill="#f6c850" stroke="#5a2f1f" stroke-width="1"/>
  ${[0, 1, 2, 3, 4, 5]
    .map((k) => {
      const a = (k / 6) * Math.PI * 2;
      return `<circle cx="${(50 + Math.cos(a) * 34).toFixed(1)}" cy="${(48 + Math.sin(a) * 34).toFixed(1)}" r="3.6" fill="${k % 2 ? "#a8342f" : "#2b7f86"}" stroke="#5a2f1f" stroke-width="0.9"/>`;
    })
    .join("")}
  <path d="M14 94 H86 M14 101 H80 M14 108 H62" stroke="#5a2f1f" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="82" cy="104" r="7.5" fill="#b02a30" stroke="#7a1a22" stroke-width="1.2"/>
  <circle cx="82" cy="104" r="3" fill="none" stroke="#e8706a" stroke-width="1"/>
  <circle cx="10" cy="9" r="3" fill="#f6c850"/><circle cx="90" cy="9" r="3" fill="#f6c850"/>
</svg>`;
const PAGE_L_SVG = `<svg viewBox="0 0 64 90">
  <rect width="64" height="90" fill="#f6e6b8"/>
  <path d="M8 10 H20 V22 H8 Z" fill="#a8342f"/><path d="M11 13 L17 19 M17 13 L11 19" stroke="#f6c850" stroke-width="1.3"/>
  <path d="M24 12 H56 M24 17 H52 M24 22 H56" stroke="#5a2f1f" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M32 74 C32 60 30 52 32 44" stroke="#3f8a4e" stroke-width="1.8" fill="none"/>
  ${leafE(26, 66, 3.6, 7, -40, "#5fae4e")}${leafE(38, 62, 3.6, 7, 40, "#5fae4e")}${leafE(26, 54, 3.4, 6.5, -40, "#74c05a")}${leafE(38, 50, 3.4, 6.5, 40, "#74c05a")}${leafE(32, 42, 3, 6, 0, "#74c05a")}
  <path d="M8 32 H56 M8 37 H20 M44 37 H56" stroke="#5a2f1f" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M8 80 H56 M8 85 H44" stroke="#5a2f1f" stroke-width="1.3" stroke-linecap="round"/>
</svg>`;
const PAGE_R_SVG = `<svg viewBox="0 0 64 90">
  <rect width="64" height="90" fill="#f6e6b8"/>
  <circle cx="32" cy="36" r="24" fill="none" stroke="#5a2f1f" stroke-width="1.5"/>
  <circle cx="32" cy="36" r="18" fill="none" stroke="#5a2f1f" stroke-width="1.2"/>
  <path d="M32 18 L47.6 45 H16.4 Z" fill="none" stroke="#5a2f1f" stroke-width="1.3"/>
  <path d="M8 70 H56 M8 75 H50 M8 80 H56 M8 85 H40" stroke="#5a2f1f" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M8 8 H56" stroke="#5a2f1f" stroke-width="1.3" stroke-linecap="round"/>
</svg>`;
const RUNE_PAGE_SVG = `<svg viewBox="0 0 64 90">
  <circle cx="32" cy="36" r="24" fill="none" stroke="#5de0c0" stroke-width="1.8"/>
  <circle cx="32" cy="36" r="18" fill="none" stroke="#5de0c0" stroke-width="1.5"/>
  <path d="M32 18 L47.6 45 H16.4 Z" fill="none" stroke="#9dffd6" stroke-width="1.6"/>
  <path d="M32 54 L16.4 27 H47.6 Z" fill="none" stroke="#9dffd6" stroke-width="1.6"/>
  <circle cx="32" cy="36" r="3.6" fill="#e9fff4"/>
</svg>`;
const RUNES_SVG = (() => {
  let s = `<circle cx="50" cy="50" r="44" fill="none" stroke="#7dffc8" stroke-width="2.6"/><circle cx="50" cy="50" r="35" fill="none" stroke="#7dffc8" stroke-width="1.6"/>`;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const x1 = 50 + c * 37;
    const y1 = 50 + sn * 37;
    const x2 = 50 + c * 42;
    const y2 = 50 + sn * 42;
    s +=
      k % 3 === 0
        ? `<circle cx="${((x1 + x2) / 2).toFixed(1)}" cy="${((y1 + y2) / 2).toFixed(1)}" r="2.4" fill="#e9fff4"/>`
        : `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#9dffd6" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  s += `<path d="M50 24 L72 62 H28 Z" fill="none" stroke="#9dffd6" stroke-width="2"/><circle cx="50" cy="50" r="5" fill="#e9fff4"/>`;
  return `<svg viewBox="0 0 100 100">${s}</svg>`;
})();

const SYM: Record<string, string> = {
  fire: `<path d="M24 16 L37 40 H11 Z" fill="none" stroke="#3b2418" stroke-width="2.8" stroke-linejoin="round"/>`,
  water: `<path d="M11 18 H37 L24 42 Z" fill="none" stroke="#3b2418" stroke-width="2.8" stroke-linejoin="round"/>`,
  air: `<path d="M24 16 L37 40 H11 Z M17 31 H31" fill="none" stroke="#3b2418" stroke-width="2.8" stroke-linejoin="round"/>`,
  earth: `<path d="M11 18 H37 L24 42 Z M17 27 H31" fill="none" stroke="#3b2418" stroke-width="2.8" stroke-linejoin="round"/>`,
  moon: `<path d="M30 16 A14 14 0 1 0 30 44 A11 11 0 1 1 30 16 Z" fill="#c98a2a" stroke="#3b2418" stroke-width="1.6"/>`,
  star: `<path d="M24 14 L27 25 L38 25 L29 32 L33 43 L24 36 L15 43 L19 32 L10 25 L21 25 Z" fill="#b36bff" stroke="#3b2418" stroke-width="1.6" stroke-linejoin="round"/>`,
  drop: `<path d="M24 14 C24 14 36 28 36 36 A12 12 0 0 1 12 36 C12 28 24 14 24 14 Z" fill="#3a9fe0" stroke="#3b2418" stroke-width="1.6"/>`,
};
const labelSvg = (accent: string, sym: string) =>
  `<svg viewBox="0 0 48 64"><rect x="1.5" y="1.5" width="45" height="61" rx="7" fill="#fff1cf" stroke="#6b3d24" stroke-width="3"/><rect x="6" y="6" width="36" height="52" rx="4" fill="none" stroke="${accent}" stroke-width="2"/>${SYM[sym]}<path d="M12 49 H36 M16 54 H32" stroke="#6b3d24" stroke-width="2.4" stroke-linecap="round"/></svg>`;

// ---------------------------------------------------------------------------------------------------------------
type Shape = "round" | "tall" | "tri" | "vial" | "jar";
type ShapeSpec = { body: number[][]; neck: number[][]; top: number; hl: V; ly: number; lsz: [number, number] };
const SHAPES: Record<Shape, ShapeSpec> = {
  round: {
    body: [[0, 0], [0.5, 0], [0.85, 0.12], [1, 0.6], [0.95, 1.1], [0.7, 1.55], [0.33, 1.8], [0, 1.8]],
    neck: [[0, 1.7], [0.36, 1.7], [0.3, 2.5], [0.42, 2.62], [0.42, 2.8], [0, 2.8]],
    top: 2.8,
    hl: [-0.55, 0.75, 0.78],
    ly: 0.75,
    lsz: [1.2, 1.3],
  },
  tall: {
    body: [[0, 0], [0.8, 0], [0.92, 0.15], [0.92, 2.3], [0.65, 2.8], [0.3, 3.0], [0, 3.0]],
    neck: [[0, 2.9], [0.34, 2.9], [0.3, 3.6], [0.42, 3.7], [0.42, 3.85], [0, 3.85]],
    top: 3.85,
    hl: [-0.5, 1.4, 0.76],
    ly: 1.35,
    lsz: [1.3, 1.8],
  },
  tri: {
    body: [[0, 0], [1.05, 0], [1.05, 0.08], [0.32, 2.0], [0, 2.0]],
    neck: [[0, 1.9], [0.34, 1.9], [0.3, 2.8], [0.42, 2.9], [0.42, 3.05], [0, 3.05]],
    top: 3.05,
    hl: [-0.4, 0.7, 0.7],
    ly: 0.75,
    lsz: [0.9, 1.0],
  },
  vial: {
    body: [[0, 0], [0.9, 0], [1, 0.15], [1, 3.0], [0.5, 3.6], [0, 3.6]],
    neck: [[0, 3.4], [0.5, 3.4], [0.45, 4.2], [0.6, 4.3], [0.6, 4.5], [0, 4.5]],
    top: 4.5,
    hl: [-0.4, 1.7, 0.9],
    ly: 1.7,
    lsz: [1, 1],
  },
  jar: {
    body: [[0, 0], [0.9, 0], [1, 0.1], [1, 1.3], [0.9, 1.4], [0, 1.4]],
    neck: [[0, 1.3], [0.92, 1.3], [0.95, 1.5], [0, 1.5]],
    top: 1.5,
    hl: [-0.55, 0.75, 0.82],
    ly: 0.7,
    lsz: [1.5, 1.0],
  },
};

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);
  const TOP = 0.9;
  const TR = 0.908;

  // ---- helpers ----------------------------------------------------------------------------------------------
  const put = (g: THREE.BufferGeometry, color: Fill, at: V | THREE.Vector3, o: PartOptions = {}) =>
    b.part(g, color, { at, ...o });
  const box = (w: number, h: number, d: number, color: Fill, at: V, o?: PartOptions) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, o?: PartOptions) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const sph = (r: number, color: Fill, at: V, scale?: V, seg = 8, o?: PartOptions) =>
    put(new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg * 0.7))), color, at, { scale, ...o });
  const torus = (r: number, t: number, color: Fill, at: V, rotation: V = [90, 0, 0], seg = 12) =>
    put(new THREE.TorusGeometry(r, t, 5, seg), color, at, { rotation });
  const lathe = (pts: OutlinePoint[], color: Fill, at: V, seg = 12) => b.lathe(pts, { at, color, segments: seg });
  const rod = (a: V | THREE.Vector3, c: V | THREE.Vector3, r: number, color: Fill, sides = 6) =>
    b.rod(a, c, r, color, { sides });
  const merged = (geos: THREE.BufferGeometry[], color: Fill) =>
    put(mergeGeometries(geos)!, color, [0, 0, 0], { bone: base });
  const tassels = (pts: V[], size: [number, number]) =>
    b.cards(
      pts.map((p) => frame(p, [0, 1, 0])),
      T.tassel,
      { size, lean: 180, flow: [0, 0, 1], cross: true, sink: 0 },
    );

  const loc = (origin: V, rot: V = [0, 0, 0]) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
    const o = new THREE.Vector3(origin[0], origin[1], origin[2]);
    const pt = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(o);
    const add = (g: THREE.BufferGeometry, color: Fill, p: V, sub?: V, opts: PartOptions = {}) => {
      const qq = sub
        ? q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(sub[0] * D, sub[1] * D, sub[2] * D)))
        : q;
      return b.part(g, color, { at: pt(p[0], p[1], p[2]), quat: qq, ...opts });
    };
    return { q, pt, add };
  };
  type Loc = ReturnType<typeof loc>;

  // ---- textures ---------------------------------------------------------------------------------------------
  const T = {
    lav: svg(LAV_SVG, { size: 128 }),
    sage: svg(SAGE_SVG, { size: 128 }),
    flower: svg(FLOWER_SVG, { size: 128 }),
    bloom: svg(BLOOM_SVG, { size: 128 }),
    sprig: svg(SPRIG_SVG, { size: 128 }),
    leaf: svg(LEAF_SVG, { size: 128 }),
    tassel: svg(TASSEL_SVG, { size: 128 }),
    wisp: svg(WISP_SVG, { size: 192 }),
    filigree: svg(FILIGREE_SVG, { size: 512 }),
    emblem: svg(EMBLEM_SVG, { size: 128 }),
    chart: svg(CHART_SVG, { size: 512 }),
    pageL: svg(PAGE_L_SVG, { size: 256 }),
    pageR: svg(PAGE_R_SVG, { size: 256 }),
    runePage: svg(RUNE_PAGE_SVG, { size: 256 }),
    runes: svg(RUNES_SVG, { size: 256 }),
  };
  const LB = {
    fire: svg(labelSvg("#c9453c", "fire"), { size: 128 }),
    water: svg(labelSvg("#3a7fc0", "water"), { size: 128 }),
    air: svg(labelSvg("#27b5a8", "air"), { size: 128 }),
    earth: svg(labelSvg("#5f9a3a", "earth"), { size: 128 }),
    moon: svg(labelSvg("#c98a2a", "moon"), { size: 128 }),
    star: svg(labelSvg("#8e63d6", "star"), { size: 128 }),
    drop: svg(labelSvg("#3a9fe0", "drop"), { size: 128 }),
  };

  // ---- potions ----------------------------------------------------------------------------------------------
  const potion = (
    x: number,
    y: number,
    z: number,
    shape: Shape,
    r: number,
    liquid: Fill,
    o: { g?: number; label?: THREE.Texture; cork?: Fill } = {},
  ) => {
    const s = SHAPES[shape];
    const body = lathe(sc(r, s.body), liquid, [x, y, z], 10);
    if (o.g && typeof liquid === "string") glow(body, o.g);
    lathe(sc(r, s.neck), GLASS, [x, y, z], 10);
    if (shape === "jar") {
      cyl(0.98 * r, 0.98 * r, 0.3 * r, 10, GOLD, [x, y + 1.62 * r, z]);
      sph(0.22 * r, GOLD, [x, y + 1.82 * r, z], undefined, 6);
    } else {
      cyl(0.42 * r, 0.34 * r, 0.55 * r, 8, o.cork ?? CORK, [x, y + (s.top + 0.12) * r, z]);
      cyl(0.36 * r, 0.36 * r, 0.14 * r, 10, GOLD, [x, y + (s.top - 0.5) * r, z]);
    }
    sph(0.16 * r, WHITE, [x + s.hl[0] * r, y + s.hl[1] * r, z + s.hl[2] * r], [0.45, 2.2, 0.3], 6);
    if (o.label)
      b.decal(body, o.label, {
        at: [x, y + s.ly * r, z + r],
        dir: [0, 0, 1],
        size: [r * s.lsz[0], r * s.lsz[1]],
      });
    return body;
  };

  // ---- books ------------------------------------------------------------------------------------------------
  // Upright orientation: thickness along local x, height along y, spine on +z. Lying books add 90 degrees about z.
  const book = (L: Loc, t: number, H: number, Dp: number, cover: Fill, emblem = false) => {
    const bt = 0.008;
    L.add(new THREE.BoxGeometry(bt, H, Dp), cover, [t / 2 - bt / 2, 0, 0]);
    L.add(new THREE.BoxGeometry(bt, H, Dp), cover, [-t / 2 + bt / 2, 0, 0]);
    L.add(new THREE.BoxGeometry(t, H, 0.012), cover, [0, 0, Dp / 2 - 0.006]);
    L.add(new THREE.BoxGeometry(t - 2 * bt - 0.001, H - 0.014, Dp - 0.016), PAGES, [0, 0, -0.005]);
    for (const y of [H / 2 - 0.02, H / 2 - 0.034, -(H / 2 - 0.02), -(H / 2 - 0.034)])
      L.add(new THREE.BoxGeometry(t + 0.004, 0.006, 0.016), GOLD, [0, y, Dp / 2 - 0.002]);
    L.add(new THREE.BoxGeometry(t * 0.74, H * 0.26, 0.013), CREAM, [0, 0, Dp / 2 - 0.0005]);
    L.add(new THREE.BoxGeometry(t * 0.5, 0.005, 0.004), GOLD, [0, 0, Dp / 2 + 0.0055]);
    if (emblem) {
      const s = Math.min(H, Dp) * 0.6;
      L.add(new THREE.PlaneGeometry(s, s), WHITE, [t / 2 + 0.0015, 0, 0], [0, 90, 0], { texture: T.emblem });
      for (const [yy, zz] of [
        [H / 2 - 0.012, Dp / 2 - 0.02],
        [-H / 2 + 0.012, Dp / 2 - 0.02],
        [H / 2 - 0.012, -Dp / 2 + 0.012],
        [-H / 2 + 0.012, -Dp / 2 + 0.012],
      ])
        L.add(new THREE.BoxGeometry(bt + 0.004, 0.02, 0.02), GOLD, [t / 2 - bt / 2, yy, zz]);
    }
  };
  const bookUp = (x: number, shelfTop: number, z: number, t: number, H: number, Dp: number, cover: Fill, lean = 0) => {
    const lift = lean ? (H / 2) * (1 - Math.cos(lean * D)) + (t / 2) * Math.abs(Math.sin(lean * D)) : 0;
    book(loc([x, shelfTop + H / 2 + lift, z], [0, 0, lean]), t, H, Dp, cover);
  };

  // =============================================================================================================
  // RUG
  box(3.2, 0.016, 2.0, RUG, [0, 0.008, 0.1]);
  const fringe: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 40; i++)
    for (const s of [1, -1]) {
      const g = new THREE.CylinderGeometry(0.004, 0.004, 0.07, 4);
      g.rotateZ(Math.PI / 2);
      g.translate(s * (1.6 + 0.032), 0.005, 0.1 - 0.96 + i * (1.92 / 39));
      fringe.push(g);
    }
  merged(fringe, CREAM);

  // =============================================================================================================
  // TABLE
  box(2.04, 0.06, 0.84, TOPWOOD, [0, 0.87, 0]);
  box(2.06, 0.02, 0.008, GOLD, [0, 0.872, 0.422]);
  for (const s of [1, -1]) box(0.008, 0.02, 0.84, GOLD, [s * 1.022, 0.872, 0]);
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 21; i++) {
    const g = new THREE.SphereGeometry(0.0075, 6, 4);
    g.translate(-0.95 + i * 0.095, 0.872, 0.427);
    studs.push(g);
  }
  merged(studs, GOLD);
  box(1.9, 0.13, 0.78, WOOD_DK, [0, 0.775, 0]);
  const legProfile = [
    [0, 0], [0.06, 0], [0.062, 0.03], [0.045, 0.06], [0.045, 0.32], [0.06, 0.38], [0.056, 0.46],
    [0.04, 0.54], [0.05, 0.62], [0.07, 0.68], [0.075, 0.72], [0.075, 0.84], [0, 0.84],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const lx = sx * 0.9;
      const lz = sz * 0.33;
      lathe(sc(1, legProfile), WOOD_DKV, [lx, 0, lz], 8);
      cyl(0.067, 0.067, 0.02, 8, GOLD, [lx, 0.38, lz]);
      cyl(0.08, 0.08, 0.02, 8, GOLD, [lx, 0.7, lz]);
      cyl(0.065, 0.065, 0.014, 8, GOLD, [lx, 0.075, lz]);
    }
  box(1.8, 0.03, 0.66, WOOD_A, [0, 0.22, 0]);
  for (const sz of [1, -1]) box(1.8, 0.045, 0.04, WOOD_DK, [0, 0.19, sz * 0.3]);
  for (const sx of [1, -1]) box(0.04, 0.045, 0.6, WOOD_DK, [sx * 0.9, 0.19, 0]);

  // drawers
  for (const s of [-1, 1]) {
    const cx = s * 0.46;
    box(0.84, 0.1, 0.02, WOOD_A, [cx, 0.775, 0.395]);
    box(0.84, 0.008, 0.004, GOLD, [cx, 0.822, 0.407]);
    box(0.84, 0.008, 0.004, GOLD, [cx, 0.728, 0.407]);
    for (const e of [-1, 1]) box(0.008, 0.1, 0.004, GOLD, [cx + e * 0.416, 0.775, 0.407]);
    for (const e of [-1, 1])
      put(new THREE.PlaneGeometry(0.3, 0.072), WHITE, [cx + e * 0.2, 0.775, 0.4082], { texture: T.filigree });
    cyl(0.032, 0.032, 0.008, 10, GOLD, [cx, 0.775, 0.408], { rotation: [90, 0, 0] });
    sph(0.02, GOLD, [cx, 0.775, 0.418], undefined, 8);
    glow(sph(0.008, E.anemo, [cx, 0.775, 0.436], undefined, 6), 1);
  }
  box(0.06, 0.13, 0.025, WOOD_DK, [0, 0.775, 0.392]);
  box(0.03, 0.03, 0.006, GOLD, [0, 0.775, 0.406], { rotation: [0, 0, 45] });
  for (const s of [1, -1]) box(0.05, 0.13, 0.025, WOOD_DK, [s * 0.935, 0.775, 0.392]);

  // =============================================================================================================
  // HUTCH
  for (const s of [1, -1]) {
    box(0.07, 1.05, 0.07, WOOD_DKV, [s * 0.96, 1.425, -0.36]);
    box(0.086, 0.03, 0.086, GOLD, [s * 0.96, 0.935, -0.36]);
    box(0.086, 0.03, 0.086, GOLD, [s * 0.96, 1.925, -0.36]);
    box(0.08, 0.025, 0.08, GOLD_D, [s * 0.96, 1.25, -0.36]);
    box(0.08, 0.025, 0.08, GOLD_D, [s * 0.96, 1.65, -0.36]);
    cyl(0.03, 0.04, 0.03, 8, GOLD, [s * 0.98, 2.0, -0.33]);
    sph(0.04, GOLD, [s * 0.98, 2.045, -0.33], undefined, 8);
  }
  box(1.86, 0.995, 0.02, BACKPANEL, [0, 1.4275, -0.385]);
  box(1.86, 0.04, 0.03, WOOD_DK, [0, 0.945, -0.37]);
  box(1.24, 0.025, 0.22, WOOD_A, [-0.34, 1.2525, -0.27]);
  box(1.24, 0.014, 0.01, GOLD, [-0.34, 1.2525, -0.162]);
  box(1.9, 0.025, 0.22, WOOD_A, [0, 1.6525, -0.27]);
  box(1.9, 0.014, 0.01, GOLD, [0, 1.6525, -0.162]);
  const bracket = (x: number, yTop: number) => {
    b.extrude(
      [
        [0, 0],
        [0.16, 0],
        [0.16, -0.015],
        [0.03, -0.1],
        [0, -0.16],
      ],
      { at: [x, yTop, -0.375], x: [0, 0, 1], thickness: 0.022, bevel: 0.003, color: WOOD_DK },
    );
    sph(0.014, GOLD, [x, yTop - 0.02, -0.215], undefined, 6);
  };
  for (const x of [-0.88, -0.3, 0.2]) bracket(x, 1.24);
  for (const x of [-0.88, -0.3, 0.3, 0.88]) bracket(x, 1.64);
  box(2.0, 0.07, 0.2, WOOD_DK, [0, 1.96, -0.33]);
  box(2.0, 0.014, 0.014, GOLD, [0, 1.935, -0.23]);
  box(2.0, 0.014, 0.014, GOLD, [0, 1.99, -0.23]);
  b.extrude(
    [
      [-0.6, 0],
      [0.6, 0],
      [0.55, 0.05],
      [0.36, 0.1],
      [0.2, 0.14],
      [0.1, 0.24],
      [0, 0.3, "sharp"],
      [-0.1, 0.24],
      [-0.2, 0.14],
      [-0.36, 0.1],
      [-0.55, 0.05],
    ],
    { at: [0, 1.995, -0.34], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, smoothing: 1, color: GOLD },
  );
  glow(sph(0.03, E.anemo, [0, 2.1, -0.318], [1, 1.3, 0.6], 8), 1.2);
  torus(0.045, 0.006, GOLD_D, [0, 2.1, -0.322], [0, 0, 0], 14);
  put(new THREE.PlaneGeometry(0.42, 0.504), WHITE, [0.62, 1.37, -0.3735], { texture: T.chart });
  for (const sx of [-1, 1]) sph(0.011, GOLD, [0.62 + sx * 0.185, 1.6, -0.368], undefined, 6);
  tassels(
    [-0.85, -0.51, -0.17, 0.17, 0.51, 0.85].map((x): V => [x, 1.636, -0.165]),
    [0.04, 0.1],
  );
  for (const x of [-0.85, -0.51, -0.17, 0.17, 0.51, 0.85]) sph(0.012, GOLD, [x, 1.636, -0.165], undefined, 6);

  // hanging herb rail under shelf 1
  rod([-0.95, 1.2, -0.17], [0.27, 1.2, -0.17], 0.007, IRON, 6);
  for (const x of [-0.92, -0.3, 0.25]) rod([x, 1.24, -0.17], [x, 1.2, -0.17], 0.005, IRON, 5);
  const herbTex = [T.lav, T.sage, T.flower, T.lav, T.sage, T.flower];
  [-0.82, -0.62, -0.42, -0.22, -0.02, 0.18].forEach((x, i) => {
    cyl(0.009, 0.009, 0.03, 6, LEATHER, [x, 1.196, -0.17]);
    b.cards(
      [-0.018, 0, 0.018].map((dx, k) => frame([x + dx, 1.18, -0.17 + (k - 1) * 0.01], [0, 1, 0])),
      herbTex[i],
      { size: [0.1, 0.26], lean: 180, flow: [0, 0, 1], cross: true, vary: 0.15, spin: 30, rng: R, sink: 0 },
    );
  });

  // lantern on a bracket off the right post
  rod([0.995, 1.8, -0.36], [1.24, 1.8, -0.36], 0.012, IRON_D, 6);
  rod([0.995, 1.52, -0.36], [1.19, 1.78, -0.36], 0.01, IRON_D, 6);
  sph(0.022, GOLD, [1.24, 1.8, -0.36], undefined, 6);
  rod([1.2, 1.8, -0.36], [1.2, 1.735, -0.36], 0.004, GOLD, 5);
  torus(0.014, 0.004, GOLD, [1.2, 1.725, -0.36], [0, 0, 0], 8);
  lathe(sc(1, [[0, 0], [0.07, 0], [0.075, 0.01], [0.05, 0.03], [0.02, 0.045], [0, 0.045]]), GOLD, [1.2, 1.68, -0.36], 10);
  glow(lathe(sc(1, [[0, 0], [0.05, 0], [0.082, 0.03], [0.095, 0.08], [0.082, 0.13], [0.05, 0.16], [0, 0.16]]), "#ff8a3d", [1.2, 1.52, -0.36], 10), 0.9);
  lathe(sc(1, [[0, 0], [0.03, 0], [0.05, 0.01], [0.06, 0.03], [0, 0.03]]), GOLD, [1.2, 1.49, -0.36], 10);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const pt = (rr: number, y: number): V => [1.2 + rr * c, y, -0.36 + rr * sn];
    b.sweep(catmull([pt(0.06, 1.676), pt(0.102, 1.6), pt(0.06, 1.524)]), 0.004, GOLD, { sides: 4 });
  }
  tassels([[1.2, 1.49, -0.36]], [0.06, 0.2]);

  // =============================================================================================================
  // TABLETOP: runner
  box(1.0, 0.008, 0.52, RUNNER, [0.1, 0.904, 0.08]);

  // ---- distillation rig ----
  const dx = -0.78;
  const dz = 0.1;
  lathe(sc(1, [[0, 0], [0.06, 0], [0.075, 0.012], [0.082, 0.03], [0.07, 0.055], [0.03, 0.07], [0.026, 0.085], [0, 0.085]]), GOLD_D, [dx, TOP, dz], 12);
  cyl(0.01, 0.01, 0.025, 6, GOLD, [dx, TOP + 0.095, dz]);
  glow(cyl(0, 0.02, 0.07, 6, "#ff8a2a", [dx, TOP + 0.135, dz]), 1);
  glow(cyl(0, 0.011, 0.04, 6, "#ffe27a", [dx, TOP + 0.122, dz]), 1);
  torus(0.075, 0.006, IRON, [dx, 1.05, dz], [90, 0, 0], 14);
  for (const deg of [30, 150, 270]) {
    const c = Math.cos(deg * D);
    const sn = Math.sin(deg * D);
    rod([dx + 0.075 * c, 1.05, dz + 0.075 * sn], [dx + 0.12 * c, TOP, dz + 0.12 * sn], 0.005, IRON, 5);
  }
  potion(dx, 1.045, dz, "round", 0.1, "#e56bd8", { g: 0.6 });
  b.sweep(
    catmull([
      [dx, 1.36, dz],
      [dx, 1.44, dz],
      [-0.73, 1.49, dz],
      [-0.65, 1.49, dz],
      [-0.58, 1.45, dz],
      [-0.55, 1.39, dz],
    ]),
    0.011,
    GLASS,
    { sides: 6 },
  );
  cyl(0.02, 0.02, 0.016, 8, GOLD, [dx, 1.4, dz]);
  // condenser
  cyl(0.05, 0.05, 0.025, 10, GOLD, [-0.55, 1.1, dz]);
  cyl(0.05, 0.05, 0.025, 10, GOLD, [-0.55, 1.38, dz]);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const c = Math.cos(a) * 0.042;
    const sn = Math.sin(a) * 0.042;
    rod([-0.55 + c, 1.1, dz + sn], [-0.55 + c, 1.38, dz + sn], 0.006, GLASS, 5);
  }
  glow(
    b.sweep(spiral([-0.55, 1.12, dz], [-0.52, 1.12, dz], [0, 1, 0], { turns: 3.5, pitch: 0.075 }), 0.007, E.cryo, {
      sides: 5,
    }),
    0.7,
  );
  box(0.16, 0.02, 0.14, IRON, [-0.55, 0.91, 0.03]);
  cyl(0.008, 0.008, 0.55, 6, IRON_D, [-0.55, 1.175, 0.02]);
  sph(0.014, GOLD, [-0.55, 1.455, 0.02], undefined, 6);
  rod([-0.55, 1.22, 0.02], [-0.55, 1.22, 0.07], 0.006, IRON_D, 5);
  cyl(0.052, 0.052, 0.022, 10, IRON_D, [-0.55, 1.22, dz]);
  b.sweep(
    catmull([
      [-0.55, 1.09, dz],
      [-0.5, 1.085, dz],
      [-0.45, 1.08, dz],
      [-0.43, 1.07, dz],
    ]),
    0.008,
    GLASS,
    { sides: 5 },
  );
  potion(-0.43, TOP, dz, "tri", 0.05, E.hydro, { g: 0.6 });

  // ---- vial tray ----
  box(0.5, 0.02, 0.12, WOOD_DK, [-0.68, TOP + 0.01, 0.31]);
  box(0.5, 0.014, 0.008, GOLD, [-0.68, TOP + 0.027, 0.37]);
  box(0.5, 0.014, 0.008, GOLD, [-0.68, TOP + 0.027, 0.25]);
  [E.pyro, E.hydro, E.anemo, E.electro, E.dendro].forEach((c, i) =>
    potion(-0.88 + i * 0.1, TOP + 0.02, 0.31, "vial", 0.021, c, { g: 0.7 }),
  );

  // ---- grimoire on lectern ----
  const lx = -0.12;
  const lz = 0.12;
  for (const s of [-1, 1])
    b.extrude(
      [
        [0.14, 0],
        [-0.14, 0],
        [-0.14, 0.205],
        [0.14, 0.03],
      ],
      { at: [lx + s * 0.15, TR + 0.025, lz], x: [0, 0, 1], thickness: 0.018, bevel: 0.003, color: WOOD_DK },
    );
  box(0.36, 0.025, 0.3, WOOD_A, [lx, TR + 0.0125, lz]);
  const LB1 = loc([lx, 1.0607, lz + 0.0064], [32, 0, 0]);
  LB1.add(new THREE.BoxGeometry(0.36, 0.012, 0.3), WOOD_LT, [0, -0.006, 0]);
  LB1.add(new THREE.BoxGeometry(0.36, 0.022, 0.016), WOOD_DK, [0, 0.005, 0.142]);
  LB1.add(new THREE.BoxGeometry(0.16, 0.008, 0.222), BOOKC[0], [-0.08, 0.004, 0]);
  LB1.add(new THREE.BoxGeometry(0.16, 0.008, 0.222), BOOKC[0], [0.08, 0.004, 0]);
  for (const s of [-1, 1]) LB1.add(new THREE.BoxGeometry(0.006, 0.01, 0.222), GOLD, [s * 0.16, 0.005, 0]);
  for (const s of [-1, 1]) LB1.add(new THREE.BoxGeometry(0.146, 0.022, 0.206), PAGES, [s * 0.077, 0.019, 0]);
  LB1.add(new THREE.BoxGeometry(0.006, 0.018, 0.2), WOOD_DK, [0, 0.02, 0]);
  LB1.add(new THREE.PlaneGeometry(0.135, 0.19), WHITE, [-0.0765, 0.032, 0], [-90, 0, 0], { texture: T.pageL });
  LB1.add(new THREE.PlaneGeometry(0.135, 0.19), WHITE, [0.0765, 0.032, 0], [-90, 0, 0], { texture: T.pageR });
  glow(
    LB1.add(new THREE.PlaneGeometry(0.135, 0.19), WHITE, [0.0765, 0.0342, 0], [-90, 0, 0], { texture: T.runePage }),
    1.2,
  );
  rod(LB1.pt(0.01, 0.034, -0.09), LB1.pt(0.01, 0.034, 0.1), 0.004, RED, 5);
  rod(LB1.pt(0.01, 0.034, 0.1), LB1.pt(0.01, -0.03, 0.165), 0.004, RED, 5);
  sph(0.008, GOLD, LB1.pt(0.01, -0.03, 0.165).toArray() as V, undefined, 6);
  tassels([LB1.pt(0.01, -0.034, 0.165).toArray() as V], [0.03, 0.09]);

  // ink and quill
  const ix = -0.33;
  const iz = 0.27;
  lathe(sc(1, [[0, 0], [0.04, 0], [0.045, 0.01], [0.045, 0.04], [0.03, 0.055], [0.02, 0.06], [0.02, 0.07], [0.026, 0.075], [0.026, 0.085], [0, 0.085]]), INKGLASS, [ix, TOP, iz], 10);
  cyl(0.03, 0.03, 0.012, 10, GOLD, [ix, TOP + 0.07, iz]);
  rod([ix, TOP + 0.06, iz], [ix + 0.07, TOP + 0.28, iz - 0.02], 0.003, CREAM, 5);
  b.extrude(
    [
      [0, 0],
      [0.022, 0.04],
      [0.026, 0.1],
      [0.016, 0.16],
      [0, 0.21],
      [-0.016, 0.16],
      [-0.026, 0.1],
      [-0.022, 0.04],
    ],
    {
      at: [ix + 0.0245, TOP + 0.137, iz - 0.0077],
      x: [0.95, -0.3, 0],
      y: [0.3, 0.95, -0.09],
      thickness: 0.003,
      smoothing: 1,
      color: TEAL,
    },
  );

  // ---- balance scale ----
  const cx = 0.4;
  const cz = 0.08;
  lathe(sc(1, [[0, 0], [0.075, 0], [0.085, 0.012], [0.07, 0.025], [0.04, 0.04], [0.022, 0.07], [0.02, 0.3], [0.03, 0.32], [0.03, 0.345], [0, 0.345]]), GOLD, [cx, TR, cz], 12);
  sph(0.024, GOLD, [cx, 1.265, cz], undefined, 8);
  const bl: V = [cx - 0.2, 1.247, cz];
  const br: V = [cx + 0.2, 1.283, cz];
  rod(bl, br, 0.007, GOLD, 6);
  sph(0.013, GOLD, bl, undefined, 6);
  sph(0.013, GOLD, br, undefined, 6);
  box(0.08, 0.03, 0.012, GOLD_D, [cx, 1.265, cz + 0.015]);
  b.spike([cx, 1.285, cz], [0, 1, 0], 0.045, 0.012, GOLD);
  rod([cx, 1.265, cz + 0.024], [cx, 1.205, cz + 0.024], 0.003, IRON_D, 5);
  glow(sph(0.008, E.anemo, [cx, 1.2, cz + 0.024], undefined, 6), 1);
  const pan = (end: V, nuggets: boolean) => {
    const py = end[1] - 0.2;
    lathe(sc(1, [[0, 0], [0.055, 0], [0.085, 0.028], [0.085, 0.034], [0.05, 0.012], [0, 0.012]]), GOLD, [end[0], py, cz], 14);
    for (const deg of [90, 210, 330]) {
      const c = Math.cos(deg * D);
      const sn = Math.sin(deg * D);
      rod(end, [end[0] + 0.082 * c, py + 0.034, cz + 0.082 * sn], 0.003, GOLD, 4);
    }
    if (nuggets) {
      glow(sph(0.022, E.geo, [end[0] - 0.01, py + 0.03, cz + 0.005], undefined, 6), 0.6);
      glow(sph(0.017, E.geo, [end[0] + 0.03, py + 0.026, cz - 0.01], undefined, 6), 0.6);
      glow(sph(0.014, E.geo, [end[0] + 0.005, py + 0.045, cz - 0.015], undefined, 6), 0.6);
    } else {
      cyl(0.03, 0.03, 0.012, 10, GOLD_D, [end[0], py + 0.018, cz]);
      cyl(0.02, 0.02, 0.012, 10, GOLD, [end[0], py + 0.03, cz]);
    }
  };
  pan(bl, true);
  pan(br, false);
  [1, 0.8, 0.65].forEach((k, i) => {
    cyl(0.02 * k, 0.026 * k, 0.03 * k, 10, GOLD_D, [0.26 + i * 0.08, TR + 0.015 * k, 0.25]);
    sph(0.009 * k, GOLD, [0.26 + i * 0.08, TR + 0.034 * k, 0.25], undefined, 6);
  });

  // ---- mortar and pestle with herbs ----
  const mx = 0.84;
  const mz = 0.12;
  lathe(sc(1, [[0, 0], [0.05, 0], [0.06, 0.01], [0.095, 0.07], [0.1, 0.1], [0.085, 0.1], [0.07, 0.05], [0, 0.04]]), MORTAR, [mx, TOP, mz], 14);
  cyl(0.074, 0.074, 0.016, 12, MOSS, [mx, TOP + 0.052, mz]);
  sph(0.03, LEAFG, [mx + 0.02, TOP + 0.066, mz - 0.01], [1, 0.5, 1], 6);
  b.capsule([mx + 0.01, TOP + 0.06, mz], [mx + 0.07, TOP + 0.19, mz + 0.04], [0.02, 0.012], { color: CERAMIC, sides: 8 });
  cyl(0.015, 0.015, 0.012, 8, GOLD, [mx + 0.055, TOP + 0.165, mz + 0.033], { dir: [0.06, 0.13, 0.04] });
  b.cards(
    [
      [0.7, 0.28],
      [0.96, 0.02],
      [0.62, 0.2],
      [0.72, -0.02],
      [0.5, 0.22],
      [0.97, 0.3],
      [0.62, 0.34],
    ].map(([x, z]) => frame([x, TOP + 0.002, z], [0, 1, 0])),
    T.leaf,
    { size: 0.07, lean: 90, flow: (_f, i) => [Math.cos(i * 0.9), 0, Math.sin(i * 0.9)], rng: R, vary: 0.2, mirror: true },
  );

  // ---- bottles, front right ----
  potion(0.56, TOP, 0.3, "tall", 0.05, E.electro, { g: 0.55, label: LB.star });
  potion(0.67, TOP, 0.31, "tri", 0.055, E.dendro, { g: 0.55, label: LB.earth });
  potion(0.93, TOP, 0.3, "round", 0.055, E.geo, { g: 0.55, label: LB.moon });

  // ---- pouch and coins ----
  sph(0.05, LEATHER, [0.12, TOP + 0.04, 0.29], [1, 0.8, 1], 10);
  cyl(0.02, 0.03, 0.03, 8, LEATHER, [0.12, TOP + 0.09, 0.29]);
  torus(0.027, 0.005, GOLD, [0.12, TOP + 0.08, 0.29], [90, 0, 0], 10);
  tassels([[0.15, TOP + 0.075, 0.31]], [0.03, 0.08]);
  const coins: THREE.BufferGeometry[] = [];
  [[0.04, 0.3], [0.06, 0.33], [0.02, 0.34], [0.065, 0.285]].forEach(([x, z], i) => {
    const g = new THREE.CylinderGeometry(0.014, 0.014, 0.004, 8);
    g.translate(x, TR + 0.002 + (i === 3 ? 0.004 : 0), z);
    coins.push(g);
  });
  merged(coins, GOLD);

  // ---- potted plant ----
  const px = 0.45;
  const pz = -0.27;
  lathe(sc(1, [[0, 0], [0.045, 0], [0.065, 0.01], [0.075, 0.11], [0.085, 0.12], [0.085, 0.135], [0.07, 0.135], [0.065, 0.115], [0, 0.115]]), TERRA, [px, TOP, pz], 10);
  cyl(0.062, 0.062, 0.01, 10, SOIL, [px, TOP + 0.115, pz]);
  cyl(0.087, 0.087, 0.015, 10, GOLD, [px, TOP + 0.128, pz]);
  const leafFrames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
    const a = i * 2.4;
    return frame([px + 0.02 * Math.cos(a), TOP + 0.12, pz + 0.02 * Math.sin(a)], [0, 1, 0]);
  });
  b.cards(leafFrames, T.leaf, {
    size: [0.1, 0.2],
    lean: 42,
    bend: 30,
    flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    vary: 0.25,
    spin: 10,
    rng: R,
  });
  b.cards(
    [0, 1, 2].map((i) => frame([px + 0.015 * Math.cos(i * 2.1), TOP + 0.12, pz + 0.015 * Math.sin(i * 2.1)], [0, 1, 0])),
    T.bloom,
    { size: [0.08, 0.3], lean: 12, flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], cross: true, rng: R, vary: 0.15 },
  );

  // ---- crock behind the lectern ----
  const crock = lathe(sc(1, [[0, 0], [0.05, 0], [0.07, 0.02], [0.075, 0.1], [0.06, 0.13], [0.04, 0.14], [0.04, 0.15], [0.05, 0.155], [0.05, 0.165], [0, 0.165]]), CERAMIC, [0, TOP, -0.28], 12);
  torus(0.043, 0.004, LEATHER, [0, TOP + 0.147, -0.28], [90, 0, 0], 10);
  sph(0.012, RED, [0.0, TOP + 0.17, -0.28], [1, 0.6, 1], 6);
  b.decal(crock, LB.water, { at: [0, TOP + 0.075, -0.2], dir: [0, 0, 1], size: [0.06, 0.08] });

  // ---- book stack with candle ----
  let cur = TOP;
  [
    { t: 0.05, H: 0.27, Dp: 0.2, ry: 4, dx: 0, cover: BOOKC[1] },
    { t: 0.06, H: 0.25, Dp: 0.19, ry: -5, dx: 0.01, cover: BOOKC[3] },
    { t: 0.045, H: 0.22, Dp: 0.17, ry: 8, dx: -0.01, cover: BOOKC[2] },
    { t: 0.04, H: 0.2, Dp: 0.16, ry: -3, dx: 0.005, cover: BOOKC[4] },
  ].forEach((k, i) => {
    book(loc([0.78 + k.dx, cur + k.t / 2, -0.12], [0, k.ry, 90]), k.t, k.H, k.Dp, k.cover, i === 3);
    cur += k.t;
  });
  const cy0 = cur;
  lathe(sc(1, [[0, 0], [0.04, 0], [0.05, 0.01], [0.07, 0.025], [0.07, 0.03], [0.06, 0.03], [0.04, 0.015], [0, 0.015]]), GOLD, [0.78, cy0, -0.12], 12);
  cyl(0.02, 0.02, 0.12, 8, WAX, [0.78, cy0 + 0.075, -0.12]);
  sph(0.012, WAX, [0.795, cy0 + 0.04, -0.105], [1, 1.6, 1], 6);
  glow(cyl(0, 0.011, 0.045, 6, "#ff8a2a", [0.78, cy0 + 0.16, -0.12]), 1.2);
  glow(cyl(0, 0.006, 0.026, 6, "#ffe27a", [0.78, cy0 + 0.152, -0.12]), 1);

  // =============================================================================================================
  // SHELF 1
  const Y1 = 1.265;
  potion(-0.86, Y1, -0.28, "jar", 0.06, E.dendro, { g: 0.5, label: LB.earth });
  potion(-0.72, Y1, -0.29, "round", 0.05, E.hydro, { g: 0.55, label: LB.drop });
  potion(-0.6, Y1, -0.28, "tall", 0.04, E.pyro, { g: 0.55, label: LB.fire });
  potion(-0.5, Y1, -0.29, "tri", 0.045, E.anemo, { g: 0.55, label: LB.air });
  potion(-0.41, Y1, -0.25, "vial", 0.022, E.geo, { g: 0.6 });
  potion(-0.37, Y1, -0.3, "vial", 0.022, E.electro, { g: 0.6 });
  bookUp(-0.28, Y1, -0.3, 0.05, 0.22, 0.17, BOOKC[0]);
  bookUp(-0.22, Y1, -0.3, 0.04, 0.26, 0.17, BOOKC[2]);
  bookUp(-0.165, Y1, -0.3, 0.06, 0.2, 0.16, BOOKC[4]);
  bookUp(-0.1, Y1, -0.3, 0.045, 0.25, 0.17, BOOKC[1]);
  bookUp(-0.03, Y1, -0.3, 0.045, 0.24, 0.16, BOOKC[5], -12);
  potion(0.14, Y1, -0.28, "jar", 0.055, RED, { label: LB.moon });
  potion(0.22, Y1, -0.24, "vial", 0.022, E.cryo, { g: 0.6 });

  // SHELF 2
  const Y2 = 1.665;
  const mpx = -0.75;
  lathe(sc(1, [[0, 0], [0.04, 0], [0.06, 0.02], [0.065, 0.07], [0.07, 0.09], [0.055, 0.09], [0.05, 0.075], [0, 0.075]]), TEAL, [mpx, Y2, -0.27], 10);
  cyl(0.052, 0.052, 0.01, 10, MOSS, [mpx, Y2 + 0.075, -0.27]);
  cyl(0.072, 0.072, 0.012, 10, GOLD, [mpx, Y2 + 0.082, -0.27]);
  [
    { dx: -0.02, dz: 0.0, h: 0.1, r: 0.05 },
    { dx: 0.03, dz: 0.015, h: 0.07, r: 0.035 },
    { dx: 0.005, dz: -0.025, h: 0.05, r: 0.027 },
  ].forEach((m) => {
    const sx = mpx + m.dx;
    const sz = -0.27 + m.dz;
    cyl(m.r * 0.28, m.r * 0.32, m.h, 6, CREAM, [sx, Y2 + 0.08 + m.h / 2, sz]);
    glow(
      put(new THREE.SphereGeometry(m.r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), E.anemo, [sx, Y2 + 0.08 + m.h, sz]),
      0.9,
    );
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.6;
      sph(m.r * 0.13, WHITE, [sx + Math.cos(a) * m.r * 0.6, Y2 + 0.08 + m.h + m.r * 0.62, sz + Math.sin(a) * m.r * 0.6], undefined, 5);
    }
  });
  potion(-0.55, Y2, -0.27, "jar", 0.045, LEAFG, { label: LB.earth });
  potion(-0.45, Y2, -0.27, "jar", 0.045, cel("#e08a3a"), { label: LB.fire });
  potion(-0.35, Y2, -0.27, "tall", 0.035, E.electro, { g: 0.55 });

  // crystal shrine
  lathe(sc(1, [[0, 0], [0.07, 0], [0.075, 0.012], [0.05, 0.03], [0.025, 0.06], [0.02, 0.12], [0.04, 0.13], [0.05, 0.17], [0.04, 0.17], [0.02, 0.14], [0, 0.14]]), GOLD, [0, Y2, -0.27], 10);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    rod([0.03 * Math.cos(a), Y2 + 0.15, -0.27 + 0.03 * Math.sin(a)], [0.055 * Math.cos(a), Y2 + 0.24, -0.27 + 0.055 * Math.sin(a)], 0.005, GOLD, 5);
  }
  glow(put(new THREE.OctahedronGeometry(0.06), E.anemo, [0, Y2 + 0.28, -0.27], { scale: [1, 1.8, 1], flat: true }), 1.3);
  glow(put(new THREE.OctahedronGeometry(0.03), "#c9fff0", [0, Y2 + 0.28, -0.27], { scale: [1, 1.8, 1], flat: true }), 1.5);
  torus(0.11, 0.004, GOLD, [0, Y2 + 0.28, -0.27], [0, 0, 0], 24);
  torus(0.11, 0.004, GOLD, [0, Y2 + 0.28, -0.27], [0, 60, 0], 24);
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1;
    glow(sph(0.01, E.anemo, [0.11 * Math.cos(a), Y2 + 0.28 + 0.11 * Math.sin(a), -0.27], undefined, 6), 1.2);
  }
  [[0.1, 0.36, -0.2], [-0.09, 0.33, -0.34], [0.07, 0.42, -0.32], [-0.13, 0.4, -0.26]].forEach(([x, y, z]) =>
    glow(sph(0.006, E.anemo, [x, Y2 + y, z], undefined, 5), 1.2),
  );

  // scrolls
  [
    [-0.32, 0.025],
    [-0.27, 0.025],
    [-0.295, 0.07],
  ].forEach(([z, y]) => {
    cyl(0.025, 0.025, 0.2, 8, PARCH, [0.4, Y2 + y, z], { rotation: [0, 0, 90] });
    for (const x of [0.35, 0.45]) cyl(0.027, 0.027, 0.01, 8, RED, [x, Y2 + y, z], { rotation: [0, 0, 90] });
  });
  sph(0.012, RED, [0.4, Y2 + 0.07, -0.27], [1, 0.5, 1], 6);

  // hourglass
  const hx = 0.62;
  cyl(0.04, 0.04, 0.01, 10, GOLD, [hx, Y2 + 0.005, -0.27]);
  cyl(0.04, 0.04, 0.01, 10, GOLD, [hx, Y2 + 0.205, -0.27]);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    rod([hx + 0.035 * Math.cos(a), Y2 + 0.01, -0.27 + 0.035 * Math.sin(a)], [hx + 0.035 * Math.cos(a), Y2 + 0.2, -0.27 + 0.035 * Math.sin(a)], 0.004, GOLD, 5);
  }
  lathe(sc(1, [[0, 0], [0.025, 0], [0.034, 0.025], [0.03, 0.05], [0.016, 0.08], [0.004, 0.095], [0, 0.095]]), SAND, [hx, Y2 + 0.01, -0.27], 10);
  lathe(sc(1, [[0, 0], [0.004, 0], [0.016, 0.015], [0.03, 0.045], [0.034, 0.07], [0.025, 0.095], [0, 0.095]]), GLASS, [hx, Y2 + 0.105, -0.27], 10);
  rod([hx, Y2 + 0.1, -0.27], [hx, Y2 + 0.14, -0.27], 0.002, SAND, 4);
  potion(0.8, Y2, -0.27, "round", 0.045, E.cryo, { g: 0.55, label: LB.water });

  // =============================================================================================================
  // UNDER THE TABLE
  const Ls = 0.235;
  // crate of bottles
  box(0.36, 0.02, 0.3, WOOD_A, [-0.55, Ls + 0.01, 0]);
  for (const sz of [1, -1]) box(0.36, 0.18, 0.02, WOOD_A, [-0.55, Ls + 0.11, sz * 0.14]);
  for (const sx of [1, -1]) box(0.02, 0.18, 0.3, WOOD_A, [-0.55 + sx * 0.17, Ls + 0.11, 0]);
  box(0.32, 0.12, 0.26, STRAW, [-0.55, Ls + 0.08, 0]);
  for (const c of [-0.12, 0.12]) box(0.012, 0.19, 0.31, WOOD_DK, [-0.55 + c, Ls + 0.105, 0]);
  [[-0.1, E.pyro], [0, E.hydro], [0.1, E.dendro]].forEach(([dxx, c]) =>
    potion(-0.55 + (dxx as number), Ls + 0.14, 0.02, "tall", 0.036, c as string, { g: 0.5 }),
  );
  // chest
  box(0.36, 0.14, 0.24, WOOD_DK, [0.05, Ls + 0.07, 0]);
  box(0.38, 0.04, 0.26, WOOD_A, [0.05, Ls + 0.16, 0]);
  box(0.34, 0.03, 0.22, WOOD_A, [0.05, Ls + 0.195, 0]);
  for (const s of [-1, 1]) {
    box(0.034, 0.146, 0.246, GOLD, [0.05 + s * 0.12, Ls + 0.07, 0]);
    box(0.034, 0.05, 0.266, GOLD, [0.05 + s * 0.12, Ls + 0.165, 0]);
  }
  box(0.05, 0.06, 0.012, GOLD, [0.05, Ls + 0.14, 0.126]);
  glow(box(0.012, 0.025, 0.006, E.anemo, [0.05, Ls + 0.14, 0.134]), 1);
  // books
  book(loc([-0.2, Ls + 0.025, 0.02], [0, -8, 90]), 0.05, 0.3, 0.22, BOOKC[3]);
  book(loc([-0.19, Ls + 0.07, 0.0], [0, 6, 90]), 0.04, 0.26, 0.19, BOOKC[1]);
  // bucket
  const bx = 0.55;
  lathe(sc(1, [[0, 0], [0.075, 0], [0.11, 0.2], [0.115, 0.2], [0.115, 0.205], [0.105, 0.205], [0.075, 0.04], [0, 0.04]]), IRON, [bx, Ls, 0], 12);
  glow(cyl(0.098, 0.098, 0.012, 12, E.hydro, [bx, Ls + 0.185, 0]), 0.8);
  b.sweep(
    catmull([
      [bx - 0.112, Ls + 0.2, 0],
      [bx - 0.08, Ls + 0.29, 0],
      [bx, Ls + 0.33, 0],
      [bx + 0.08, Ls + 0.29, 0],
      [bx + 0.112, Ls + 0.2, 0],
    ]),
    0.005,
    IRON_D,
    { sides: 5 },
  );
  cyl(0.118, 0.118, 0.014, 12, GOLD_D, [bx, Ls + 0.19, 0]);

  // =============================================================================================================
  // CAULDRON
  const ccx = -1.28;
  const ccz = 0.55;
  const y0 = 0.14;
  const cBody = lathe(
    sc(1, [[0, 0.06], [0.13, 0.06], [0.23, 0.12], [0.29, 0.24], [0.3, 0.34], [0.27, 0.4], [0.335, 0.42], [0.335, 0.445], [0.255, 0.445], [0.24, 0.34], [0.22, 0.28], [0, 0.28]]),
    IRON,
    [ccx, y0, ccz],
    14,
  );
  cyl(0.31, 0.31, 0.025, 14, GOLD_D, [ccx, y0 + 0.31, ccz]);
  cyl(0.343, 0.343, 0.014, 14, GOLD, [ccx, y0 + 0.433, ccz]);
  glow(cyl(0.23, 0.23, 0.02, 14, E.dendro, [ccx, y0 + 0.34, ccz]), 1);
  [[0.08, 0.35, 0.03], [-0.1, 0.345, -0.05], [0.0, 0.352, -0.12], [-0.12, 0.35, 0.09], [0.13, 0.348, -0.06]].forEach(([x, y, z], i) =>
    glow(sph(0.02 + (i % 3) * 0.008, "#d6ff9a", [ccx + x, y0 + y + 0.015, ccz + z], undefined, 6), 1.1),
  );
  for (const deg of [60, 180, 300]) {
    const c = Math.cos(deg * D);
    const sn = Math.sin(deg * D);
    b.rod([ccx + 0.17 * c, y0 + 0.1, ccz + 0.17 * sn], [ccx + 0.27 * c, 0, ccz + 0.27 * sn], [0.035, 0.022], IRON_D, { sides: 6 });
  }
  for (const s of [-1, 1]) torus(0.03, 0.007, IRON_D, [ccx + s * 0.318, y0 + 0.4, ccz], [0, 0, 0], 10);
  b.sweep(bezier([ccx - 0.32, y0 + 0.4, ccz], [ccx, y0 + 0.95, ccz], [ccx + 0.32, y0 + 0.4, ccz]), 0.012, IRON_D, { sides: 6 });
  for (const [ox, oz, dd] of [
    [0, 0.27, [0, 0, 1]],
    [0.19, 0.19, [0.7, 0, 0.7]],
    [-0.19, 0.19, [-0.7, 0, 0.7]],
  ] as Array<[number, number, V]>)
    glow(b.decal(cBody, T.runes, { at: [ccx + ox, y0 + 0.2, ccz + oz], dir: dd, size: [0.2, 0.2] }), 1);
  // fire
  for (const [ang, len] of [[20, 0.34], [100, 0.3], [-40, 0.32]])
    cyl(0.025, 0.025, len, 6, WOOD_DK, [ccx, 0.03, ccz], { rotation: [90, 0, ang] });
  for (const [ox, oz, h, r] of [[0.0, 0.0, 0.2, 0.07], [0.07, 0.03, 0.14, 0.05], [-0.07, 0.02, 0.15, 0.05], [0.02, -0.07, 0.13, 0.045]])
    glow(cyl(0, r, h, 6, "#ff8a2a", [ccx + ox, 0.04 + h / 2, ccz + oz]), 1);
  glow(cyl(0, 0.035, 0.12, 6, "#ffe27a", [ccx, 0.04 + 0.06, ccz]), 1);
  // ladle
  rod([ccx + 0.02, y0 + 0.3, ccz + 0.02], [ccx + 0.3, y0 + 0.82, ccz - 0.12], 0.012, WOOD_LT, 6);
  sph(0.03, WOOD_LT, [ccx + 0.02, y0 + 0.3, ccz + 0.02], [1, 0.5, 1], 8);
  cyl(0.016, 0.016, 0.02, 8, GOLD, [ccx + 0.26, y0 + 0.75, ccz - 0.1], { dir: [0.28, 0.52, -0.14] });
  // wisps
  glow(
    b.cards(
      [0, 1, 2, 3, 4].map((i) => frame([ccx + 0.1 * Math.cos(i * 1.3), y0 + 0.36, ccz + 0.1 * Math.sin(i * 1.3)], [0, 1, 0])),
      T.wisp,
      { size: [0.1, 0.42], lean: 12, bend: 35, flow: (_f, i) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)], cross: true, rng: R, vary: 0.2 },
    ),
    1,
  );

  // =============================================================================================================
  // STOOL
  const stx = 1.28;
  const stz = 0.5;
  cyl(0.17, 0.17, 0.05, 12, WOOD_A, [stx, 0.43, stz]);
  cyl(0.175, 0.175, 0.012, 12, GOLD, [stx, 0.405, stz]);
  for (const deg of [45, 135, 225, 315]) {
    const c = Math.cos(deg * D);
    const sn = Math.sin(deg * D);
    b.rod([stx + 0.11 * c, 0.41, stz + 0.11 * sn], [stx + 0.16 * c, 0, stz + 0.16 * sn], [0.022, 0.018], WOOD_DKV, { sides: 6 });
  }
  torus(0.14, 0.012, WOOD_DK, [stx, 0.2, stz], [90, 0, 0], 12);
  sph(0.17, CUSHION, [stx, 0.47, stz], [1, 0.28, 1], 12);
  sph(0.014, GOLD, [stx, 0.52, stz], undefined, 6);
  tassels(
    [45, 135, 225, 315].map((deg): V => [stx + 0.165 * Math.cos(deg * D), 0.455, stz + 0.165 * Math.sin(deg * D)]),
    [0.04, 0.1],
  );

  // BASKET of herbs
  const bkx = 1.4;
  const bkz = -0.2;
  lathe(sc(1, [[0, 0], [0.14, 0], [0.17, 0.02], [0.22, 0.2], [0.23, 0.28], [0.205, 0.28], [0.19, 0.2], [0, 0.12]]), WEAVE, [bkx, 0, bkz], 14);
  torus(0.218, 0.011, WICKER, [bkx, 0.28, bkz], [90, 0, 0], 14);
  b.sweep(
    catmull([
      [bkx - 0.215, 0.27, bkz],
      [bkx - 0.17, 0.42, bkz],
      [bkx, 0.5, bkz],
      [bkx + 0.17, 0.42, bkz],
      [bkx + 0.215, 0.27, bkz],
    ]),
    0.012,
    WICKER,
    { sides: 6 },
  );
  b.cards(
    [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const a = i * 2.4;
      const rr = 0.04 + (i % 3) * 0.035;
      return frame([bkx + rr * Math.cos(a), 0.17, bkz + rr * Math.sin(a)], [0, 1, 0]);
    }),
    [T.sprig, T.lav, T.bloom, T.flower],
    {
      size: [0.09, 0.28],
      lean: 20,
      bend: 25,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      cross: true,
      rng: R,
      vary: 0.2,
      spin: 15,
    },
  );

  // SACK
  const skx = 1.2;
  const skz = -0.6;
  sph(1, BURLAP, [skx, 0.24, skz], [0.2, 0.26, 0.18], 10);
  cyl(0.07, 0.1, 0.08, 8, BURLAP, [skx, 0.45, skz]);
  torus(0.075, 0.01, LEATHER, [skx, 0.44, skz], [90, 0, 0], 8);
  cyl(0.1, 0.065, 0.07, 8, BURLAP, [skx, 0.51, skz]);

  // floor leaves
  b.cards(
    [[-0.6, 0.85], [0.2, 0.8], [0.9, 0.75], [-0.2, 1.0], [1.0, 0.6], [-1.0, -0.4]].map(([x, z]) =>
      frame([x, 0.0165, z], [0, 1, 0]),
    ),
    T.leaf,
    { size: 0.09, lean: 90, flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)], rng: R, vary: 0.2, mirror: true },
  );

  return b.root;
}
