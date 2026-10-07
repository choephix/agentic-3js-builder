import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { grain, paint } from "../src/paint";
import { arc, catmull, spiral } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel, furEdge, INK } from "../kits/toon";

export const meta = {
  name: "Vespa Delivery Scooter",
  description:
    "A cel-shaded Italian step-through scooter in mint and cream with gold filigree, a glowing wind medallion, tassels, paper lanterns and two stacked delivery crates of oranges, lemons, flowers and bread.",
  style: "Genshin/anime mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel-shaded paints for big surfaces, flat colours for small trims.
// ---------------------------------------------------------------------------------------------------------------
const TEAL = cel("#2fcfbb", "#1d8ba6");
const CREAM = cel("#fff3d8", "#ecc4a2");
const GOLD = cel("#ffc43f", "#d2782a");
const NAVY = cel("#3a4a8f", "#222b5c");
const NAVY2 = cel("#2c3978", "#1b2250");
const CHROME = cel("#e2ebfb", "#7d90c8");
const RUBBER = cel("#3b3f66", "#23264a");
const SEAT = cel("#c9683c", "#8e3b3e");
const SEAT_LINE = cel("#8e3b3e", "#5d2640");
const WOOD_Z = cel(grain("#e8ac63", "#d3924d", { size: 0.03, axis: [0, 0, 1] }), "#a9683a");
const WOOD_X = cel(grain("#e8ac63", "#d3924d", { size: 0.03, axis: [1, 0, 0] }), "#a9683a");
const WOOD_Y = cel(grain("#d9984f", "#c68341", { size: 0.03, axis: [0, 1, 0] }), "#96582f");
const PAINT_Z = cel(grain("#4655a8", "#3e4c9c", { size: 0.03, axis: [0, 0, 1] }), "#252f6c");
const PAINT_X = cel(grain("#4655a8", "#3e4c9c", { size: 0.03, axis: [1, 0, 0] }), "#252f6c");
const PAINT_Y = cel(grain("#f2b84a", "#e6a53a", { size: 0.03, axis: [0, 1, 0] }), "#b8702a");
const BREAD = cel("#e7a64e", "#b9692f");
const BREAD_CUT = cel("#f9dc9a", "#e0a96a");

const GOLDF = "#ffc43f";
const DARK = "#2b2f55";
const ORANGE = "#ff9a1f";
const LEMON = "#ffe34d";
const TOMATO = "#ff5547";
const LEAF = "#3fbf6a";
const GLASS_GREEN = "#2d8a58";
const MIRROR_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6f6ff"/><stop offset="0.55" stop-color="#7fd2ee"/><stop offset="1" stop-color="#3d8fc4"/></linearGradient></defs>
    <circle cx="50" cy="50" r="50" fill="url(#g)"/>
    <path d="M12 62 C30 52 40 70 60 58 C75 50 85 56 92 52 L92 70 C80 90 20 90 12 62Z" fill="#fff3d8" opacity="0.55"/>
    <path d="M18 30 C26 16 40 10 54 12" stroke="#ffffff" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M70 18 C76 22 80 26 82 32" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);
const SLIP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 70">
    <path d="M3 3 H47 V63 L41 67 L35 63 L29 67 L23 63 L17 67 L11 63 L3 67 Z" fill="#fffaf0" stroke="#8a3d1b" stroke-width="2"/>
    <rect x="9" y="10" width="32" height="5" rx="2" fill="#2c3978"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="9" y="${22 + i * 7}" width="${i % 2 ? 24 : 30}" height="3" rx="1.5" fill="#9aa3cf"/>`).join("")}
    <circle cx="33" cy="52" r="8" fill="none" stroke="#ff5547" stroke-width="2.4"/>
    <path d="M29 52 L32 55 L38 48" stroke="#ff5547" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 200 },
);

// ---------------------------------------------------------------------------------------------------------------
// Textures
// ---------------------------------------------------------------------------------------------------------------
const filigreeHalf = `
  <path d="M78 50 C62 50 54 40 58 31 C62 23 73 25 71 33 C70 38 64 38 64 34"/>
  <path d="M62 54 C46 56 34 50 28 40 C24 32 26 23 33 20 C40 17 46 23 43 29"/>
  <path d="M62 62 C50 72 36 76 24 70 C14 65 11 54 17 49"/>
  <path d="M72 72 C64 82 54 88 42 86"/>
  <path d="M70 26 C66 16 58 10 48 12"/>
  <path d="M28 40 C20 38 12 42 10 50"/>
  <circle cx="45" cy="29" r="2.2" fill="currentColor"/>
  <circle cx="17" cy="49" r="2.2" fill="currentColor"/>
  <circle cx="42" cy="86" r="2.2" fill="currentColor"/>
  <circle cx="48" cy="12" r="2.2" fill="currentColor"/>
  <circle cx="10" cy="50" r="2.2" fill="currentColor"/>
  <path d="M36 62 C34 56 38 52 44 54 C42 58 40 61 36 62Z" fill="currentColor"/>
  <path d="M56 78 C56 72 60 68 66 68 C66 74 62 78 56 78Z" fill="currentColor"/>`;
const filigreeLayer = (color: string, width: number) => `
  <g stroke="${color}" fill="none" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" color="${color}">
    <g>${filigreeHalf}</g>
    <g transform="translate(160 0) scale(-1 1)">${filigreeHalf}</g>
    <path d="M80 18 L94 50 L80 82 L66 50 Z"/>
    <path d="M80 30 L88 50 L80 70 L72 50 Z"/>
    <circle cx="80" cy="50" r="3.2" fill="${color}"/>
    <circle cx="80" cy="12" r="2.6" fill="${color}"/>
    <circle cx="80" cy="88" r="2.6" fill="${color}"/>
  </g>`;
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">${filigreeLayer("#8a3d1b", 4.2)}${filigreeLayer("#ffc43f", 2.1)}</svg>`,
  { size: 640 },
);

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#8a3d1b"/>
    <circle cx="50" cy="50" r="44" fill="#ffc43f"/>
    <circle cx="50" cy="50" r="38" fill="#16275a"/>
    <g fill="none" stroke-linecap="round">
      <path d="M26 56 C30 40 48 30 62 36 C72 40 72 52 62 54 C56 55 54 50 58 47" stroke="#59f2e1" stroke-width="6"/>
      <path d="M30 66 C44 74 64 70 72 58" stroke="#9ffbf0" stroke-width="5"/>
      <path d="M36 30 C44 22 58 20 66 26" stroke="#c8fff8" stroke-width="4.5"/>
    </g>
    <circle cx="58" cy="47" r="3.6" fill="#ffffff"/>
    <g fill="#ffc43f"><circle cx="50" cy="9" r="2.6"/><circle cx="50" cy="91" r="2.6"/><circle cx="9" cy="50" r="2.6"/><circle cx="91" cy="50" r="2.6"/></g>
  </svg>`,
  { size: 400 },
);

const RIM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="#2c3978"/>
    <circle cx="50" cy="50" r="47" fill="none" stroke="#ffc43f" stroke-width="3.2"/>
    <circle cx="50" cy="50" r="42" fill="#fff3d8"/>
    ${[0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<path transform="rotate(${a} 50 50)" d="M50 20 C58 20 62 30 59 38 C57 43 53 44 50 44 C47 44 43 43 41 38 C38 30 42 20 50 20Z" fill="#2fcfbb" stroke="#2c3978" stroke-width="2"/>`,
      )
      .join("")}
    <circle cx="50" cy="50" r="12" fill="#ffc43f" stroke="#8a3d1b" stroke-width="2"/>
    ${[0, 72, 144, 216, 288]
      .map((a) => `<circle transform="rotate(${a} 50 50)" cx="50" cy="39" r="2.2" fill="#8a3d1b"/>`)
      .join("")}
    <circle cx="50" cy="50" r="4" fill="#fff3d8"/>
  </svg>`,
  { size: 384 },
);

const VENT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80">
    <rect x="3" y="3" width="54" height="74" rx="14" fill="#2a3a73" stroke="#8a3d1b" stroke-width="5"/>
    <rect x="3" y="3" width="54" height="74" rx="14" fill="none" stroke="#ffc43f" stroke-width="2.4"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="13" y="${13 + i * 9}" width="34" height="4.6" rx="2.3" fill="#ffd36b"/>`).join("")}
  </svg>`,
  { size: 240 },
);

const labelSvg = (word: string, bg: string, ink: string, accent: string, icon: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48">
      <rect x="2" y="2" width="116" height="44" rx="8" fill="${bg}" stroke="${ink}" stroke-width="3"/>
      <rect x="7" y="7" width="106" height="34" rx="5" fill="none" stroke="${accent}" stroke-width="1.8" stroke-dasharray="5 3"/>
      <text x="60" y="31" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="900" font-size="20" textLength="${word.length * 12}" lengthAdjust="spacingAndGlyphs" fill="${ink}">${word}</text>
      ${icon}
    </svg>`,
    { size: 480 },
  );
const FRUTTA = labelSvg(
  "FRUTTA",
  "#fff3d8",
  "#2c3978",
  "#ffc43f",
  `<circle cx="14" cy="24" r="4.4" fill="#ff9a1f"/><path d="M14 19 q3 -4 6 -2" stroke="#3fbf6a" stroke-width="2" fill="none"/>
   <circle cx="106" cy="24" r="4.4" fill="#ffe34d"/><path d="M106 19 q-3 -4 -6 -2" stroke="#3fbf6a" stroke-width="2" fill="none"/>`,
);
const FIORI = labelSvg(
  "FIORI",
  "#ffd6e2",
  "#5a2a62",
  "#ffffff",
  `<circle cx="14" cy="24" r="3" fill="#ffe34d"/><g fill="#ffffff" stroke="#5a2a62" stroke-width="0.8"><circle cx="14" cy="18" r="2.4"/><circle cx="14" cy="30" r="2.4"/><circle cx="8" cy="24" r="2.4"/><circle cx="20" cy="24" r="2.4"/></g>
   <circle cx="106" cy="24" r="3" fill="#ffe34d"/><g fill="#ffffff" stroke="#5a2a62" stroke-width="0.8"><circle cx="106" cy="18" r="2.4"/><circle cx="106" cy="30" r="2.4"/><circle cx="100" cy="24" r="2.4"/><circle cx="112" cy="24" r="2.4"/></g>`,
);
const STAR_TAG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="21" fill="#2c3978" stroke="#ffc43f" stroke-width="3.4"/>
    <path d="M24 9 L28 20 L40 20 L30 27 L34 39 L24 32 L14 39 L18 27 L8 20 L20 20 Z" fill="#ffc43f"/>
  </svg>`,
  { size: 192 },
);

const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
    <rect x="2" y="2" width="96" height="46" rx="7" fill="#fffaf0" stroke="#2c3978" stroke-width="3"/>
    <rect x="5" y="5" width="18" height="40" rx="4" fill="#2c3978"/>
    <g fill="#ffc43f">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${14 + 5.4 * Math.cos((i * Math.PI) / 4)}" cy="${16 + 5.4 * Math.sin((i * Math.PI) / 4)}" r="1.2"/>`).join("")}</g>
    <text x="14" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="11" fill="#fffaf0">I</text>
    <text x="62" y="33" text-anchor="middle" font-family="Georgia, 'Courier New', serif" font-weight="900" font-size="19" textLength="66" lengthAdjust="spacingAndGlyphs" fill="#2c3978">VENTO 88</text>
  </svg>`,
  { size: 400 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64">
    <circle cx="12" cy="5" r="4.2" fill="#ffc43f" stroke="#8a3d1b" stroke-width="1"/>
    <rect x="9" y="8" width="6" height="5" rx="1" fill="#2fcfbb" stroke="#126a78" stroke-width="0.8"/>
    <path d="M8 13 H16 L19 26 H5 Z" fill="#2fcfbb" stroke="#126a78" stroke-width="0.8"/>
    <rect x="5" y="25" width="14" height="4" rx="1" fill="#ffc43f" stroke="#8a3d1b" stroke-width="0.6"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${6.2 + i * 1.9} 29 L${5.6 + i * 2.1} 62" stroke="${i % 2 ? "#ffc43f" : "#2fcfbb"}" stroke-width="1.7" stroke-linecap="round"/>`).join("")}
  </svg>`,
  { size: 192 },
);

const flowerSvg = (bloom: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 90">
      <path d="M20 90 C20 70 21 50 20 32" stroke="#2f9f56" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M20 66 C30 62 33 54 31 48 C24 50 20 57 20 66Z" fill="#3fbf6a" stroke="#2a8a4a" stroke-width="0.8"/>
      <path d="M20 74 C11 72 8 66 9 60 C16 62 20 67 20 74Z" fill="#3fbf6a" stroke="#2a8a4a" stroke-width="0.8"/>
      ${bloom}
    </svg>`,
    { size: 160 },
  );
const petals = (n: number, rx: number, ry: number, off: number, fill: string, stroke: string) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 360) / n;
    return `<ellipse cx="20" cy="${22 - off}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="0.9" transform="rotate(${a} 20 22)"/>`;
  }).join("");
const DAISY = flowerSvg(`${petals(9, 3.6, 8.2, 8, "#ffffff", "#c8b6dc")}<circle cx="20" cy="22" r="5.6" fill="#ffc43f" stroke="#c8782a" stroke-width="1"/>`);
const SUNFLOWER = flowerSvg(
  `${petals(13, 3.4, 8.8, 8.6, "#ffd23a", "#d98a1e")}<circle cx="20" cy="22" r="7.4" fill="#7a4224" stroke="#4d2814" stroke-width="1"/><circle cx="20" cy="22" r="3.4" fill="#a9622f"/>`,
);
const TULIP = flowerSvg(
  `<path d="M10 14 C9 26 13 34 20 34 C27 34 31 26 30 14 L25 20 L20 11 L15 20 Z" fill="#ff6f9c" stroke="#b02a62" stroke-width="1.1"/>
   <path d="M20 11 L25 20 C24 28 22 32 20 34 C18 32 16 28 15 20 Z" fill="#ff9dbd" stroke="#b02a62" stroke-width="0.8"/>`,
);

const PENNANT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100">
    <path d="M2 99 L58 99 L58 14 L30 28 L2 14 Z" fill="#2fcfbb" stroke="#8a3d1b" stroke-width="4"/>
    <path d="M2 99 L58 99 L58 14 L30 28 L2 14 Z" fill="none" stroke="#ffc43f" stroke-width="2.2"/>
    <g fill="none" stroke-linecap="round"><path d="M16 84 C14 66 30 54 42 60 C50 64 48 74 40 74 C35 74 34 69 38 67" stroke="#fff3d8" stroke-width="3.6"/>
    <path d="M18 46 C26 36 40 36 46 44" stroke="#ffc43f" stroke-width="3.2"/></g>
    <circle cx="30" cy="22" r="2.4" fill="#ffc43f"/>
  </svg>`,
  { size: 300 },
);

const DIAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#fff3d8" stroke="#2c3978" stroke-width="5"/>
    ${Array.from({ length: 11 }, (_, i) => {
      const a = (-120 + i * 24) * (Math.PI / 180);
      return `<line x1="${50 + 36 * Math.sin(a)}" y1="${50 - 36 * Math.cos(a)}" x2="${50 + 43 * Math.sin(a)}" y2="${50 - 43 * Math.cos(a)}" stroke="${i > 8 ? "#ff5547" : "#2c3978"}" stroke-width="3.6" stroke-linecap="round"/>`;
    }).join("")}
    <path d="M50 50 L66 26" stroke="#ff5547" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="7" fill="#ffc43f" stroke="#2c3978" stroke-width="3"/>
    <path d="M32 68 C40 76 60 76 68 68" stroke="#2fcfbb" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const TOTE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 72">
    <rect x="0" y="0" width="60" height="72" fill="#fff3d8"/>
    <rect x="0" y="0" width="60" height="9" fill="#2fcfbb"/>
    <rect x="0" y="63" width="60" height="9" fill="#2fcfbb"/>
    <path d="M0 9 L5 12 L10 9 L15 12 L20 9 L25 12 L30 9 L35 12 L40 9 L45 12 L50 9 L55 12 L60 9 Z" fill="#ffc43f"/>
    <text x="30" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="900" font-size="15" letter-spacing="1" fill="#2c3978">PANE</text>
    <g stroke="#e8a63a" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M30 60 L30 47"/><path d="M30 55 L25 51"/><path d="M30 55 L35 51"/><path d="M30 51 L26 47"/><path d="M30 51 L34 47"/></g>
  </svg>`,
  { size: 240 },
);

// ---------------------------------------------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "vespaScooter", paintSize: 2048 });
  const rand = rng(88);

  // Skeleton ---------------------------------------------------------------------------------------------------
  const FRONT_AXLE: [number, number, number] = [0, 0.204, 0.66];
  const REAR_AXLE: [number, number, number] = [0, 0.204, -0.6];
  const chassis = b.joint("chassis", { at: [0, 0.35, 0], dir: [0, 1, 0], role: "spine" });
  const steer = b.joint("steer", { parent: chassis, at: [0, 0.92, 0.5], aim: FRONT_AXLE, up: [0, 0, 1], role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: FRONT_AXLE, dir: [0, 1, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: chassis, at: REAR_AXLE, dir: [0, 1, 0], role: "hinge" });
  const seatJ = b.joint("seat", { parent: chassis, at: [0, 0.66, 0.09], dir: [0, 1, 0], role: "hinge" });
  const kick = b.joint("kickstand", { parent: chassis, at: [0.13, 0.2, -0.06], dir: [0, 1, 0], role: "hinge" });
  const lidJ = b.joint("crateLid", { parent: chassis, at: [0, 1.224, -0.94], dir: [0, 1, 0], role: "hinge" });
  const lever: Record<number, Joint> = {};
  const mirrorJ: Record<number, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    lever[s] = b.joint(`lever${side}`, { parent: steer, at: [s * 0.285, 1.032, 0.44], dir: [0, 1, 0], role: "hinge" });
    mirrorJ[s] = b.joint(`mirror${side}`, { parent: steer, at: [s * 0.265, 1.025, 0.44], dir: [0, 1, 0], role: "hinge" });
  }

  const box = (w: number, h: number, d: number, color: Fill, at: [number, number, number], bone = chassis, o = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const ball = (r: number, color: Fill, at: [number, number, number], bone = chassis, seg = 6) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), color, { bone, at });

  // Wheels -----------------------------------------------------------------------------------------------------
  const TIRE_PROFILE: [number, number][] = [
    [0.118, -0.05],
    [0.175, -0.054],
    [0.198, -0.038],
    [0.207, -0.012],
    [0.207, 0.012],
    [0.198, 0.038],
    [0.175, 0.054],
    [0.118, 0.05],
  ];
  const RIM_PROFILE: [number, number][] = [
    [0, -0.042],
    [0.11, -0.046],
    [0.124, -0.03],
    [0.124, 0.03],
    [0.11, 0.046],
    [0, 0.042],
  ];
  const TREAD_A = cel("#343a64", "#1f2347");
  const TREAD_B = cel("#2a2f55", "#181b3a");
  function wheel(bone: typeof wheelF, c: [number, number, number]) {
    const tirePaint = paint((p, n, s) => {
      const r = Math.hypot(p.y - c[1], p.z - c[2]);
      if (Math.abs(n.x) > 0.6) return r > 0.138 && r < 0.158 ? CREAM : TREAD_A;
      return Math.floor(s[1] / 18) % 2 === 0 ? TREAD_A : TREAD_B;
    });
    b.lathe(TIRE_PROFILE, { at: c, axis: [1, 0, 0], segments: 20, color: tirePaint, bone, name: "tire" });
    b.lathe(RIM_PROFILE, { at: c, axis: [1, 0, 0], segments: 16, color: NAVY, bone, name: "rim" });
    for (const s of [1, -1]) {
      b.part(new THREE.CircleGeometry(0.118, 20), "#ffffff", {
        bone,
        at: [s * 0.0478, c[1], c[2]],
        dir: [s, 0, 0],
        axis: "z",
        texture: RIM,
        name: "rimFace",
      });
      b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.016, 8), GOLDF, {
        bone,
        at: [s * 0.056, c[1], c[2]],
        dir: [s, 0, 0],
      });
    }
  }
  wheel(wheelF, FRONT_AXLE);
  wheel(wheelR, REAR_AXLE);

  // Legshield ----------------------------------------------------------------------------------------------------
  const legPts: Array<{ at: [number, number, number]; w: number }> = [
    { at: [0, 0.26, 0.355], w: 0.43 },
    { at: [0, 0.5, 0.405], w: 0.43 },
    { at: [0, 0.74, 0.465], w: 0.37 },
    { at: [0, 0.9, 0.5], w: 0.29 },
  ];
  const skirtLeg = furEdge(TEAL, CREAM, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.46,
    teeth: 0.03,
    period: 0.06,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.005,
  });
  const legshield = b.loft(
    legPts.map((l) => ({ at: l.at, w: l.w, h: 0.075 })),
    { bone: chassis, color: skirtLeg, sides: 14, name: "legshield" },
  );
  // gold trim down both edges of the legshield
  for (const s of [1, -1]) {
    const edge = catmull(legPts.map((l) => [s * (l.w / 2 - 0.004), l.at[1], l.at[2] + 0.004]));
    b.sweep(edge, 0.0065, { bone: chassis, color: GOLDF, sides: 5, name: "legTrim" });
  }
  // gold emblem medallion on the front of the legshield
  const legSkin = b.surface(legshield);
  const emblemHit = legSkin.ray([0, 0.66, 1.1], [0, 0, -1]);
  if (emblemHit) {
    glow(
      b.decal(legSkin, EMBLEM, { at: emblemHit, dir: [0, 0, 1], size: [0.14, 0.14], lift: 0.004, name: "emblem" }),
      1,
    );
  }
  const crestHit = legSkin.ray([0, 0.31, 1.1], [0, 0, -1]);
  if (crestHit) b.decal(legSkin, FILIGREE, { at: crestHit, dir: [0, 0, 1], size: [0.26, 0.16], name: "legFiligree" });
  const backHit = legSkin.ray([0, 0.6, -0.4], [0, 0, 1]);
  if (backHit) {
    b.decal(legSkin, FILIGREE, { at: backHit, dir: [0, 0, -1], size: [0.24, 0.15], mirror: true, name: "legBackFiligree" });
    glow(b.decal(legSkin, EMBLEM, { at: backHit, dir: [0, 0, -1], size: [0.06, 0.06], lift: 0.0045, name: "legBackGem" }), 1);
  }
  // horn grille under the headset
  for (let i = 0; i < 4; i++) {
    const hit = legSkin.ray([0, 0.78 + i * 0.026, 1.1], [0, 0, -1]);
    if (hit) b.rod(hit.moved([-0.045, 0.003, 0]), hit.moved([0.045, 0.003, 0]), 0.006, { bone: chassis, color: CHROME, sides: 5 });
  }

  // Floorboard ---------------------------------------------------------------------------------------------------
  box(0.43, 0.04, 0.58, TEAL, [0, 0.2, 0.1], chassis, { name: "floor" });
  const matPaint = paint((p) => (Math.floor(p.z / 0.018) % 2 === 0 ? RUBBER : NAVY2));
  box(0.33, 0.012, 0.46, matPaint, [0, 0.226, 0.13], chassis, { name: "floorMat" });
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 0.222, 0.38], [s * 0.22, 0.222, -0.12], 0.016, { bone: chassis, color: CHROME, sides: 6, name: "runningRail" });
    ball(0.02, GOLDF, [s * 0.22, 0.222, 0.385], chassis, 6);
    ball(0.02, GOLDF, [s * 0.22, 0.222, -0.125], chassis, 6);
    // cream under-skirt lip
    box(0.02, 0.03, 0.56, CREAM, [s * 0.215, 0.178, 0.1], chassis, { name: "skirtLip" });
    glow(b.rod([s * 0.205, 0.152, 0.36], [s * 0.205, 0.152, -0.12], 0.006, { bone: chassis, color: "#6ff5e4", sides: 5, name: "underglow" }), 1.2);
  }

  // Rear cowl ----------------------------------------------------------------------------------------------------
  const cowlSkirt = furEdge(TEAL, CREAM, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.335,
    teeth: 0.025,
    period: 0.055,
    along: [0, 0, 1],
    ink: INK,
    inkWidth: 0.005,
  });
  const cowl = b.loft(
    [
      { at: [0, 0.42, 0.05], w: 0.34, h: 0.4 },
      { at: [0, 0.45, -0.18], w: 0.44, h: 0.44 },
      { at: [0, 0.52, -0.42], w: 0.44, h: 0.36 },
      { at: [0, 0.56, -0.66], w: 0.38, h: 0.26 },
      { at: [0, 0.58, -0.84], w: 0.24, h: 0.18 },
    ],
    { bone: chassis, color: cowlSkirt, sides: 14, name: "cowl" },
  );
  const cowlSkin = b.surface(cowl);
  for (const s of [1, -1]) {
    const hit = cowlSkin.around([0, 0.45, -0.3]).at(s * 90, 0);
    if (hit) {
      b.decal(cowlSkin, FILIGREE, { at: hit, dir: [s, 0, 0], size: [0.36, 0.23], mirror: s < 0, name: "cowlFiligree" });
      glow(
        b.decal(cowlSkin, EMBLEM, { at: hit, dir: [s, 0, 0], size: [0.115, 0.115], lift: 0.0045, mirror: s < 0, name: "cowlGem" }),
        1,
      );
    }
    const vh = cowlSkin.around([0, 0.46, -0.04]).at(s * 90, 0);
    if (vh) b.decal(cowlSkin, VENT, { at: vh, dir: [s, 0, 0], size: [0.1, 0.13], mirror: s < 0, name: "vent" });
    for (const deg of [42, 138]) {
      const line = cowl.line(s * deg, 0.004).slice(0.04, 0.92);
      b.sweep(line, 0.0052, { bone: chassis, color: GOLDF, sides: 5, name: "cowlPinstripe" });
    }
  }
  // tail lamp (glowing)
  const tailHit = cowlSkin.ray([0, 0.58, -1.5], [0, 0, 1]);
  if (tailHit) {
    const lamp = b.stick(new THREE.SphereGeometry(0.036, 8, 5), "#ff4a3d", tailHit, { embed: 0.45, scale: [1.5, 0.8, 1] });
    glow(lamp, 1.3);
    b.stick(new THREE.TorusGeometry(0.046, 0.007, 4, 12), GOLDF, tailHit, { embed: 0.2, scale: [1.5, 1, 0.9] });
  }

  // Seat ---------------------------------------------------------------------------------------------------------
  const seatPaint = paint((p, n) => {
    if (n.y > 0.25) {
      const u = (p.x + p.z) / 0.075;
      const v = (p.x - p.z) / 0.075;
      if (Math.min(Math.abs(u - Math.round(u)), Math.abs(v - Math.round(v))) < 0.07) return SEAT_LINE;
    }
    return SEAT;
  });
  const seat = b.loft(
    [
      { at: [0, 0.695, 0.1], w: 0.22, h: 0.09 },
      { at: [0, 0.72, -0.08], w: 0.3, h: 0.11 },
      { at: [0, 0.73, -0.3], w: 0.32, h: 0.11 },
      { at: [0, 0.715, -0.48], w: 0.24, h: 0.09 },
    ],
    { bone: seatJ, color: seatPaint, sides: 12, name: "seat" },
  );
  for (const s of [1, -1]) b.sweep(seat.line(s * 72, 0.003).slice(0.05, 0.95), 0.0062, { bone: seatJ, color: GOLDF, sides: 5, name: "seatPiping" });
  // delivery cap resting on the seat
  b.lathe(
    [
      [0, 0],
      [0.112, 0],
      [0.112, 0.012],
      [0.092, 0.02],
      [0.072, 0.05],
      [0.034, 0.066],
      [0, 0.067],
    ],
    {
      at: [0.02, 0.772, -0.14],
      axis: [0.04, 1, 0.08],
      segments: 12,
      spin: 20,
      color: paint((_p, _n, st) => (st[0] < 0.016 ? GOLD : NAVY)),
      bone: seatJ,
      name: "cap",
    },
  );
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 5), GOLDF, { bone: seatJ, at: [0.02, 0.834, -0.133], dir: [0.04, 1, 0.08], name: "capButton" });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 5), GOLDF, { bone: seatJ, at: [0.022, 0.797, -0.052], dir: [0, 0.35, 1], name: "capBadge" });

  // Rear fender over the rear wheel, exhaust, kickstand -----------------------------------------------------------
  const rf = arc(
    REAR_AXLE,
    [REAR_AXLE[0], REAR_AXLE[1] + 0.255 * Math.sin((-12 * Math.PI) / 180), REAR_AXLE[2] + 0.255 * Math.cos((-12 * Math.PI) / 180)],
    [-1, 0, 0],
    150,
  );
  b.sweep(rf, (t) => [0.07 + 0.02 * Math.sin(Math.PI * t), 0.012], {
    bone: chassis,
    color: paint((p) => (Math.abs(p.x) < 0.014 ? GOLDF : Math.abs(p.x) > 0.075 ? CREAM : TEAL)),
    sides: 10,
    name: "rearFender",
  });
  const exhaust = b.sweep(
    catmull([
      [-0.15, 0.335, -0.36],
      [-0.15, 0.315, -0.6],
      [-0.153, 0.315, -0.9],
    ]),
    [0.028, 0.04],
    { bone: chassis, color: CHROME, sides: 10, caps: { start: "round", end: "flat" }, name: "muffler" },
  );
  b.along(exhaust, 3, (at) => b.part(new THREE.TorusGeometry(0.045, 0.006, 4, 10), GOLDF, { frame: at, bone: chassis }), {
    from: 0.2,
    to: 0.85,
  });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8), DARK, { bone: chassis, at: [-0.153, 0.315, -0.915], dir: [0, 0, 1] });
  b.rod([0.13, 0.2, -0.06], [0.14, 0.15, -0.34], 0.012, { bone: kick, color: CHROME, sides: 6, name: "kickstandLeg" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), RUBBER, { bone: kick, at: [0.14, 0.15, -0.345], rotation: [90, 0, 0] });

  // Front fork, fender and spring ------------------------------------------------------------------------------
  const ff = arc(
    FRONT_AXLE,
    [FRONT_AXLE[0], FRONT_AXLE[1] + 0.255 * Math.sin((-18 * Math.PI) / 180), FRONT_AXLE[2] + 0.255 * Math.cos((-18 * Math.PI) / 180)],
    [-1, 0, 0],
    168,
  );
  b.sweep(ff, (t) => [0.072 + 0.022 * Math.sin(Math.PI * t), 0.013], {
    bone: steer,
    color: paint((p) => (Math.abs(p.x) < 0.015 ? GOLDF : Math.abs(p.x) > 0.082 ? CREAM : TEAL)),
    sides: 10,
    name: "frontFender",
  });
  const forkTop: [number, number, number] = [0.09, 0.86, 0.515];
  b.capsule(forkTop, [0.09, FRONT_AXLE[1], FRONT_AXLE[2]], 0.026, { bone: steer, color: CREAM, sides: 8, name: "forkLeg" });
  const forkDir = new THREE.Vector3(0, FRONT_AXLE[1] - forkTop[1], FRONT_AXLE[2] - forkTop[2]).normalize();
  const springStart = new THREE.Vector3(...forkTop).addScaledVector(forkDir, 0.06);
  const spring = spiral(springStart, [springStart.x + 0.037, springStart.y, springStart.z], forkDir, {
    turns: 7,
    r1: 0.037,
    pitch: 0.055,
  });
  b.sweep(spring, 0.0065, { bone: steer, color: CHROME, sides: 4, detail: 0.6, name: "forkSpring" });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), GOLDF, {
    bone: steer,
    at: new THREE.Vector3(...forkTop).addScaledVector(forkDir, 0.045),
    dir: forkDir,
  });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), GOLDF, {
    bone: steer,
    at: new THREE.Vector3(...forkTop).addScaledVector(forkDir, 0.5),
    dir: forkDir,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), GOLDF, { bone: wheelF, at: [0.075, FRONT_AXLE[1], FRONT_AXLE[2]], dir: [1, 0, 0] });

  // Headset, lamp, dial -------------------------------------------------------------------------------------------
  const headPaint = furEdge(TEAL, CREAM, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.955,
    teeth: 0.016,
    period: 0.042,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.003,
  });
  const headset = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, {
    bone: steer,
    at: [0, 0.985, 0.52],
    scale: [0.16, 0.098, 0.128],
    name: "headset",
  });
  const headSkin = b.surface(headset);
  for (const s of [1, -1]) {
    const swoosh = headSkin.drape(
      catmull([
        [s * 0.09, 1.045, 0.72],
        [s * 0.13, 1.06, 0.68],
        [s * 0.155, 1.03, 0.6],
        [s * 0.158, 0.985, 0.55],
      ]),
      { lift: 0.006 },
    );
    b.sweep(swoosh, [0.0075, 0.0025], { bone: steer, color: GOLDF, sides: 5, caps: { end: "point" }, name: "headSwoosh" });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffb347", { bone: steer, at: [s * 0.152, 0.94, 0.56], scale: [1, 0.8, 1.2], name: "indicator" }), 1.2);
  }
  b.lathe(
    [
      [0, 0],
      [0.074, 0],
      [0.079, 0.012],
      [0.071, 0.03],
      [0.052, 0.036],
      [0, 0.036],
    ],
    { at: [0, 0.985, 0.612], axis: [0, 0, 1], segments: 14, color: CHROME, bone: steer, name: "lampBezel" },
  );
  b.part(new THREE.TorusGeometry(0.083, 0.0085, 4, 16), GOLD, { bone: steer, at: [0, 0.985, 0.624], name: "lampRing" });
  glow(
    b.part(new THREE.SphereGeometry(0.055, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), "#fff2a8", {
      bone: steer,
      at: [0, 0.985, 0.64],
      dir: [0, 0, 1],
      scale: [1, 0.65, 1],
      name: "headlampGlass",
    }),
    1.4,
  );
  for (const [x, y, r] of [
    [-0.026, 1.012, 0.012],
    [-0.008, 1.026, 0.006],
  ])
    glow(b.part(new THREE.SphereGeometry(r, 5, 4), "#ffffff", { bone: steer, at: [x, y, 0.675 - r * 0.2], scale: [1, 1, 0.5] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.022, 12), CHROME, {
    bone: steer,
    at: [0, 1.07, 0.5],
    dir: [0, 0.85, -0.52],
    name: "dialHousing",
  });
  b.part(new THREE.CircleGeometry(0.045, 14), "#ffffff", {
    bone: steer,
    at: new THREE.Vector3(0, 1.07, 0.5).addScaledVector(new THREE.Vector3(0, 0.85, -0.52).normalize(), 0.0125),
    dir: [0, 0.85, -0.52],
    axis: "z",
    up: [0, 0.5, 0.85],
    texture: DIAL,
    name: "dial",
  });
  for (const [i, col] of ["#ff5a4a", "#6dffb0", "#ffd24a"].entries())
    glow(b.part(new THREE.SphereGeometry(0.0085, 5, 4), col, { bone: steer, at: [(i - 1) * 0.034, 1.05, 0.43] }), 1.2);
  // brass bell on the left handlebar
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.034, 0.004],
      [0.03, 0.02],
      [0.018, 0.032],
      [0, 0.035],
    ],
    { at: [0.2, 1.016, 0.468], segments: 10, color: GOLD, bone: steer, name: "bell" },
  );
  ball(0.007, GOLDF, [0.2, 1.054, 0.468], steer, 5);

  // Handlebars, grips, levers, mirrors ------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.12, 0.995, 0.49],
        [s * 0.22, 1.005, 0.465],
        [s * 0.28, 1.022, 0.43],
      ]),
      0.0135,
      { bone: steer, color: CHROME, sides: 8, name: "handlebar" },
    );
    b.rod([s * 0.275, 1.022, 0.432], [s * 0.352, 1.032, 0.385], 0.0215, { bone: steer, color: NAVY, sides: 8, name: "grip" });
    b.part(new THREE.SphereGeometry(0.024, 7, 5), GOLDF, { bone: steer, at: [s * 0.356, 1.033, 0.383] });
    b.part(new THREE.TorusGeometry(0.0225, 0.004, 4, 8), GOLDF, {
      bone: steer,
      at: [s * 0.282, 1.023, 0.428],
      dir: [s * 0.8, 0.1, -0.6],
      axis: "z",
    });
    // brake / clutch lever
    b.rod([s * 0.285, 1.034, 0.45], [s * 0.315, 1.0, 0.575], [0.01, 0.0065], { bone: lever[s], color: CHROME, sides: 5, name: "lever" });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLDF, { bone: lever[s], at: [s * 0.315, 1.0, 0.578] });
    // cable
    b.sweep(
      catmull([
        [s * 0.285, 1.04, 0.46],
        [s * 0.22, 1.06, 0.5],
        [s * 0.12, 1.06, 0.53],
      ]),
      0.0045,
      { bone: steer, color: DARK, sides: 4, name: "cable" },
    );
    // mirror
    b.rod([s * 0.265, 1.025, 0.44], [s * 0.305, 1.17, 0.405], 0.009, { bone: mirrorJ[s], color: CHROME, sides: 5, name: "mirrorStalk" });
    const mdir: [number, number, number] = [-s * 0.1, 0.25, -1];
    const mdn = new THREE.Vector3(...mdir).normalize();
    const mc = new THREE.Vector3(s * 0.31, 1.215, 0.395);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.016, 12), CHROME, { bone: mirrorJ[s], at: mc, dir: mdir, name: "mirrorBack" });
    b.part(new THREE.CircleGeometry(0.042, 14), "#ffffff", {
      bone: mirrorJ[s],
      at: mc.clone().addScaledVector(mdn, 0.0088),
      dir: mdir,
      axis: "z",
      texture: MIRROR_TEX,
      name: "mirrorGlass",
    });
    b.part(new THREE.TorusGeometry(0.051, 0.0055, 4, 14), GOLDF, {
      bone: mirrorJ[s],
      at: mc.clone().addScaledVector(mdn, 0.004),
      dir: mdir,
      axis: "z",
    });
    // tassels at the bar ends
    b.cards([frame([s * 0.356, 1.01, 0.383], [0, 1, 0])], TASSEL, { size: [0.045, 0.13], lean: 180, flow: [0, 0, 1], bone: steer, name: "tassel" });
  }

  // Charm gem hanging under the headlamp
  b.sweep(
    catmull([
      [0.07, 0.915, 0.63],
      [0.085, 0.89, 0.645],
      [0.08, 0.86, 0.65],
    ]),
    0.0035,
    { bone: steer, color: GOLDF, sides: 4, name: "charmCord" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.026), "#62f2e3", { bone: steer, at: [0.08, 0.835, 0.65], scale: [0.8, 1.3, 0.8], name: "charmGem" }),
    1.3,
  );
  b.part(new THREE.ConeGeometry(0.014, 0.014, 6), GOLDF, { bone: steer, at: [0.08, 0.861, 0.65] });
  b.cards([frame([0.08, 0.815, 0.65], [0, 1, 0])], TASSEL, { size: [0.032, 0.095], lean: 180, flow: [0, 0, 1], bone: steer, name: "charmTassel" });

  // Tote bag with baguettes hung from the right handlebar ---------------------------------------------------------------
  const TX = -0.285;
  b.part(new THREE.BoxGeometry(0.165, 0.2, 0.07), "#ffffff", { bone: steer, at: [TX, 0.76, 0.5], texture: TOTE, name: "tote" });
  for (const sx of [1, -1]) {
    b.rod([TX + sx * 0.06, 0.855, 0.5], [-0.255, 0.995, 0.462], 0.0035, { bone: steer, color: "#c98a4a", sides: 4, name: "toteStrap" });
    ball(0.009, GOLDF, [TX + sx * 0.06, 0.858, 0.5], steer, 5);
  }
  ball(0.013, GOLDF, [-0.255, 0.998, 0.462], steer, 6);
  for (const [i, x] of [-0.03, 0.03].entries()) {
    b.sweep(
      catmull([
        [TX + x, 0.78, 0.5],
        [TX + x + (i ? 0.01 : -0.01), 0.86, 0.505],
        [TX + x + (i ? 0.03 : -0.03), 0.925, 0.52],
      ]),
      0.016,
      {
        bone: steer,
        color: paint((_p, _n, st) => (Math.abs(st[1] > 180 ? st[1] - 360 : st[1]) < 55 && (st[0] * 4 + st[1] / 100) % 1 < 0.2 ? BREAD_CUT : BREAD)),
        sides: 7,
        name: "toteBaguette",
      },
    );
  }

  // Rack ---------------------------------------------------------------------------------------------------------------
  const RACK_Y = 0.745;
  for (const s of [1, -1]) {
    b.rod([s * 0.235, RACK_Y, -0.5], [s * 0.235, RACK_Y, -1.0], 0.0115, { bone: chassis, color: CHROME, sides: 6, name: "rackRail" });
    b.rod([s * 0.235, RACK_Y, -0.5], [s * 0.15, 0.62, -0.57], 0.009, { bone: chassis, color: CHROME, sides: 5, name: "rackStrut" });
    b.rod([s * 0.235, RACK_Y, -0.98], [s * 0.1, 0.6, -0.86], 0.0125, { bone: chassis, color: CHROME, sides: 6, name: "rackStrut" });
    ball(0.014, GOLDF, [s * 0.1, 0.6, -0.86], chassis, 6);
    for (const z of [-0.5, -1.0]) ball(0.0165, GOLDF, [s * 0.235, RACK_Y, z], chassis, 6);
  }
  for (const z of [-0.5, -0.625, -0.75, -0.875, -1.0])
    b.rod([-0.235, RACK_Y, z], [0.235, RACK_Y, z], z === -0.5 || z === -1.0 ? 0.0115 : 0.008, { bone: chassis, color: CHROME, sides: 6, name: "rackBar" });
  // number plate + bracket
  box(0.018, 0.08, 0.012, DARK, [0, 0.705, -0.995], chassis, { name: "plateBracket" });
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { bone: chassis, at: [0, 0.665, -1.006], dir: [0, 0, -1], axis: "z", texture: PLATE, name: "plate" });

  // Crates ---------------------------------------------------------------------------------------------------------------
  function crate(o: {
    c: [number, number, number];
    w: number;
    d: number;
    h: number;
    pz: Fill;
    px: Fill;
    py: Fill;
    planks: number;
    gap: number;
  }) {
    const [cx, y0, cz] = o.c;
    const { w, d, h } = o;
    const t = 0.014;
    const post = 0.038;
    box(w - 0.01, 0.024, d - 0.01, o.pz, [cx, y0 + 0.012, cz], chassis, { name: "crateBase" });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        box(post, h, post, o.py, [cx + sx * (w / 2 - post / 2), y0 + h / 2, cz + sz * (d / 2 - post / 2)], chassis, { name: "cratePost" });
    const avail = h - 0.024 - 0.022;
    const ph = (avail - (o.planks - 1) * o.gap) / o.planks;
    const nails: THREE.BufferGeometry[] = [];
    for (let k = 0; k < o.planks; k++) {
      const y = y0 + 0.024 + ph / 2 + k * (ph + o.gap);
      for (const s of [1, -1]) {
        box(t, ph, d - post * 1.2, o.pz, [cx + s * (w / 2 - t / 2), y, cz], chassis, { name: "cratePlankSide" });
        box(w - post * 1.2, ph, t, o.px, [cx, y, cz + s * (d / 2 - t / 2)], chassis, { name: "cratePlankEnd" });
        for (const e of [1, -1]) {
          nails.push(
            new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 5).rotateZ(Math.PI / 2).translate(cx + s * (w / 2 + 0.001), y, cz + e * (d / 2 - 0.055)),
          );
          nails.push(
            new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 5).rotateX(Math.PI / 2).translate(cx + e * (w / 2 - 0.055), y, cz + s * (d / 2 + 0.001)),
          );
        }
      }
    }
    b.part(mergeGeometries(nails), GOLDF, { bone: chassis, at: [0, 0, 0], name: "crateNails" });
    // rim + corner caps
    for (const s of [1, -1]) {
      box(w, 0.02, 0.03, o.px, [cx, y0 + h - 0.01, cz + s * (d / 2 - 0.015)], chassis, { name: "crateRim" });
      box(0.03, 0.02, d - 0.06, o.pz, [cx + s * (w / 2 - 0.015), y0 + h - 0.01, cz], chassis, { name: "crateRim" });
      for (const e of [1, -1]) {
        box(0.05, 0.03, 0.05, GOLDF, [cx + s * (w / 2 - 0.024), y0 + h - 0.012, cz + e * (d / 2 - 0.024)], chassis, { name: "crateCap" });
        box(0.05, 0.03, 0.05, GOLDF, [cx + s * (w / 2 - 0.024), y0 + 0.015, cz + e * (d / 2 - 0.024)], chassis, { name: "crateFoot" });
      }
    }
    // hand-slot on the side planks
    const mid = Math.floor(o.planks / 2);
    const ym = y0 + 0.024 + ph / 2 + mid * (ph + o.gap);
    for (const s of [1, -1]) box(0.006, ph * 0.5, 0.1, DARK, [cx + s * (w / 2 + 0.001), ym, cz], chassis, { name: "handSlot" });
  }

  const LOW = { c: [0, 0.757, -0.75] as [number, number, number], w: 0.46, d: 0.44, h: 0.26 };
  const UP = { c: [0, 1.02, -0.75] as [number, number, number], w: 0.4, d: 0.38, h: 0.2 };
  crate({ ...LOW, pz: WOOD_Z, px: WOOD_X, py: WOOD_Y, planks: 3, gap: 0.024 });
  crate({ ...UP, pz: PAINT_Z, px: PAINT_X, py: PAINT_Y, planks: 3, gap: 0.018 });

  // labels: rear and side tags
  b.part(new THREE.PlaneGeometry(0.25, 0.1), "#ffffff", { bone: chassis, at: [0, LOW.c[1] + 0.13, LOW.c[2] - LOW.d / 2 - 0.003], dir: [0, 0, -1], axis: "z", texture: FRUTTA, name: "labelFrutta" });
  b.part(new THREE.PlaneGeometry(0.24, 0.096), "#ffffff", { bone: chassis, at: [0, UP.c[1] + 0.1, UP.c[2] - UP.d / 2 - 0.003], dir: [0, 0, -1], axis: "z", texture: FIORI, name: "labelFiori" });
  b.part(new THREE.PlaneGeometry(0.07, 0.098), "#ffffff", { bone: chassis, at: [-(LOW.w / 2 + 0.004), LOW.c[1] + 0.13, LOW.c[2] - 0.1], dir: [-1, 0, 0], axis: "z", texture: SLIP, name: "slip" });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", { bone: chassis, at: [s * (LOW.w / 2 + 0.004), LOW.c[1] + 0.135, LOW.c[2] + 0.115], dir: [s, 0, 0], axis: "z", texture: STAR_TAG, name: "starTag" });
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", { bone: chassis, at: [s * (UP.w / 2 + 0.004), UP.c[1] + 0.1, UP.c[2] + 0.1], dir: [s, 0, 0], axis: "z", texture: STAR_TAG, name: "starTag" });
  }

  // oranges / lemons / tomatoes in the lower crate
  const fruitGeo: Record<string, THREE.BufferGeometry[]> = { [ORANGE]: [], [LEMON]: [], [TOMATO]: [] };
  const stems: THREE.BufferGeometry[] = [];
  const kinds = [ORANGE, LEMON, ORANGE, TOMATO];
  for (let layer = 0; layer < 3; layer++) {
    for (let ix = 0; ix < 5; ix++) {
      for (let iz = 0; iz < 4; iz++) {
        const off = layer % 2 ? 0.04 : 0;
        const x = -0.16 + ix * 0.08 + off * 0.5;
        const z = LOW.c[2] - 0.12 + iz * 0.08 + off * 0.5;
        const y = LOW.c[1] + 0.024 + 0.043 + layer * 0.07;
        const kind = kinds[Math.floor(rand() * kinds.length)];
        const g = new THREE.SphereGeometry(0.042, 7, 5);
        if (kind === LEMON) g.scale(1.1, 0.9, 0.9);
        g.translate(x, y, z);
        fruitGeo[kind].push(g);
        if (layer === 2) stems.push(new THREE.ConeGeometry(0.009, 0.014, 4).translate(x, y + 0.04, z));
      }
    }
  }
  for (const [color, geos] of Object.entries(fruitGeo))
    if (geos.length) b.part(mergeGeometries(geos), color, { bone: chassis, at: [0, 0, 0], name: "fruit" });
  b.part(mergeGeometries(stems), LEAF, { bone: chassis, at: [0, 0, 0], name: "fruitLeaves" });

  // upper crate: cloth filler, flowers, bread, bottle
  box(UP.w - 0.05, 0.1, UP.d - 0.05, CREAM, [0, UP.c[1] + 0.07, UP.c[2]], chassis, { name: "clothFiller" });
  const flowerFrames = [];
  for (let i = 0; i < 16; i++) {
    const x = -0.15 + rand() * 0.3;
    const z = -0.78 + rand() * 0.2;
    flowerFrames.push(frame([x, UP.c[1] + 0.1, z], [x * 0.5 + (rand() - 0.5) * 0.3, 1, (z + 0.68) * 0.6 + (rand() - 0.5) * 0.2]));
  }
  b.cards(flowerFrames, [DAISY, SUNFLOWER, TULIP, DAISY], {
    size: [0.1, 0.22],
    cross: true,
    vary: 0.25,
    rng: rand,
    spin: 35,
    bone: chassis,
    name: "flowers",
  });
  for (const [i, x] of [0.11, 0.045, -0.025].entries()) {
    b.sweep(
      catmull([
        [x, UP.c[1] + 0.09, -0.62],
        [x + 0.008 * (i - 1), UP.c[1] + 0.22, -0.605],
        [x + 0.02 * (i - 1), UP.c[1] + 0.36, -0.57],
      ]),
      0.021,
      {
        bone: chassis,
        color: paint((_p, _n, st) => (Math.abs(st[1] > 180 ? st[1] - 360 : st[1]) < 55 && (st[0] * 5 + st[1] / 100) % 1 < 0.2 ? BREAD_CUT : BREAD)),
        sides: 7,
        name: "baguette",
      },
    );
  }
  // wine bottle
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.036, 0.012],
      [0.036, 0.11],
      [0.027, 0.15],
      [0.013, 0.17],
      [0.013, 0.215],
      [0.0, 0.215],
    ],
    { at: [-0.125, UP.c[1] + 0.05, -0.64], axis: [0, 1, 0], segments: 8, color: GLASS_GREEN, bone: chassis, name: "bottle" },
  );
  b.lathe(
    [
      [0, 0],
      [0.0375, 0],
      [0.0375, 0.05],
      [0, 0.05],
    ],
    { at: [-0.125, UP.c[1] + 0.07, -0.64], segments: 8, color: "#fff3d8", bone: chassis, name: "bottleLabel" },
  );
  b.lathe(
    [
      [0, 0],
      [0.0145, 0],
      [0.0145, 0.03],
      [0, 0.03],
    ],
    { at: [-0.125, UP.c[1] + 0.2, -0.64], segments: 8, color: GOLDF, bone: chassis, name: "bottleFoil" },
  );

  // crate lid (hinged at the back edge, opened)
  const lidY = UP.c[1] + UP.h + 0.012;
  const lidC: [number, number, number] = [0, lidY, UP.c[2]];
  box(UP.w, 0.022, UP.d, PAINT_X, lidC, lidJ, { name: "lidBoard" });
  for (const s of [1, -1]) {
    box(0.045, 0.014, UP.d, PAINT_Z, [s * 0.14, lidY + 0.017, UP.c[2]], lidJ, { name: "lidBatten" });
    box(0.04, 0.024, 0.04, GOLDF, [s * (UP.w / 2 - 0.02), lidY + 0.012, UP.c[2] - UP.d / 2 + 0.02], lidJ, { name: "lidCap" });
    box(0.04, 0.024, 0.04, GOLDF, [s * (UP.w / 2 - 0.02), lidY + 0.012, UP.c[2] + UP.d / 2 - 0.02], lidJ, { name: "lidCap" });
  }
  b.part(new THREE.CylinderGeometry(0.011, 0.011, UP.w + 0.03, 8), GOLDF, { bone: lidJ, at: [0, 1.224, -0.94], dir: [1, 0, 0], name: "lidHinge" });
  box(0.05, 0.02, 0.03, GOLDF, [0, lidY + 0.005, UP.c[2] + UP.d / 2 - 0.005], lidJ, { name: "lidHasp" });
  b.part(new THREE.PlaneGeometry(0.22, 0.088), "#ffffff", {
    bone: lidJ,
    at: [0, lidY + 0.0255, UP.c[2] - 0.01],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: FIORI,
    name: "lidLabel",
  });
  box(UP.w - 0.05, 0.004, UP.d - 0.05, CREAM, [0, lidY - 0.0125, UP.c[2]], lidJ, { name: "lidLining" });
  b.part(new THREE.PlaneGeometry(0.28, 0.175), "#ffffff", {
    bone: lidJ,
    at: [0, lidY - 0.0152, UP.c[2]],
    dir: [0, -1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: FILIGREE,
    name: "lidFiligree",
  });
  b.pose(lidJ, { axis: [1, 0, 0], deg: -48 });

  // rope strap around the lower crate
  const rw = LOW.w / 2 + 0.014;
  const rd = LOW.d / 2 + 0.014;
  const ry = LOW.c[1] + 0.063;
  const ropePath = catmull(
    [
      [rw - 0.02, ry, rd],
      [rw, ry, rd - 0.02],
      [rw, ry, -rd + 0.02],
      [rw - 0.02, ry, -rd],
      [-rw + 0.02, ry, -rd],
      [-rw, ry, -rd + 0.02],
      [-rw, ry, rd - 0.02],
      [-rw + 0.02, ry, rd],
    ].map(([x, y, z]) => [x, y, z + LOW.c[2]]),
    { closed: true },
  );
  b.sweep(ropePath, 0.0085, { bone: chassis, color: CREAM, sides: 6, name: "rope" });
  b.part(new THREE.BoxGeometry(0.012, 0.05, 0.06), GOLDF, { bone: chassis, at: [rw + 0.004, ry, LOW.c[2] + 0.08], name: "buckle" });
  b.part(new THREE.BoxGeometry(0.014, 0.036, 0.044), DARK, { bone: chassis, at: [rw + 0.006, ry, LOW.c[2] + 0.08], name: "buckleHole" });
  b.cards([frame([rw + 0.012, ry - 0.015, LOW.c[2] + 0.08], [0, 1, 0])], TASSEL, { size: [0.035, 0.105], lean: 180, flow: [1, 0, 0], bone: chassis, name: "ropeTassel" });

  // pennant pole
  b.rod([0.245, RACK_Y, -0.985], [0.245, 1.5, -0.985], 0.0065, { bone: chassis, color: GOLDF, sides: 5, name: "pole" });
  ball(0.014, GOLDF, [0.245, 1.515, -0.985], chassis, 6);
  b.cards([frame([0.245, 1.36, -0.985], [0, 0, -1])], PENNANT, { size: [0.11, 0.22], flow: [1, 0, 0], bone: chassis, name: "pennant" });

  // paper lanterns hanging from the rack corners
  for (const s of [1, -1]) {
    const lx = s * 0.235;
    b.rod([lx, RACK_Y, -1.0], [lx, 0.665, -1.03], 0.003, { bone: chassis, color: GOLDF, sides: 4, name: "lanternCord" });
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.016, 8), GOLDF, { bone: chassis, at: [lx, 0.66, -1.03], name: "lanternCap" });
    glow(
      b.part(new THREE.SphereGeometry(0.048, 8, 6), "#ff8a35", { bone: chassis, at: [lx, 0.615, -1.03], scale: [1, 1.1, 1], name: "lanternBody" }),
      1.1,
    );
    b.part(new THREE.TorusGeometry(0.044, 0.004, 4, 12), GOLDF, { bone: chassis, at: [lx, 0.615, -1.03], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), GOLDF, { bone: chassis, at: [lx, 0.56, -1.03] });
    b.cards([frame([lx, 0.553, -1.03], [0, 1, 0])], TASSEL, { size: [0.035, 0.1], lean: 180, flow: [0, 0, -1], bone: chassis, name: "lanternTassel" });
  }

  return b.root;
}
