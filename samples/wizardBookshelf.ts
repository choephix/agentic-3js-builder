import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { svg } from "../src/texture";
import { cel, inkLines, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import type { Fill } from "../src/context";

const WOOD = cel("#4a265f", "#24153d");
const WOOD_EDGE = cel("#7d3f82", "#3a1e58");
const TEAL = cel("#1f9d9d", "#135768");
const TEAL_LIGHT = cel("#52d5c9", "#237e91");
const GOLD = cel("#f2bf55", "#a45b2f");
const GOLD_BRIGHT = cel("#ffe69a", "#c57a38");
const PARCHMENT = cel("#f6dfad", "#b97862");
const PAGE_SHADOW = cel("#d2ac76", "#7d4d5b");
const CRIMSON = cel("#d94f6d", "#7b294f");
const SAPPHIRE = cel("#4a77de", "#273d91");
const VIOLET = cel("#a66cff", "#56388f");
const JADE = cel("#56c995", "#26745f");
const INK_PAINT = inkLines(WOOD_EDGE, { levels: [0.05], axis: [0, 0, 1], width: 0.035, ink: INK });

const RUNE = svg(
  `<svg viewBox="0 0 128 192">
    <g fill="none" stroke="#ffe69a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="64" cy="96" r="39"/><circle cx="64" cy="96" r="18"/>
      <path d="M64 14v35M64 143v35M-3 96h38M93 96h38"/>
      <path d="M31 63l19 19M97 63L78 82M31 129l19-19M97 129l-19-19"/>
      <path d="M64 48l9 21 22 2-17 14 6 22-20-12-20 12 6-22-17-14 22-2z"/>
    </g>
    <g fill="#7de9ff"><circle cx="64" cy="11" r="4"/><circle cx="64" cy="181" r="4"/><circle cx="3" cy="96" r="4"/><circle cx="125" cy="96" r="4"/></g>
  </svg>`,
  { size: 256 },
);

export const meta = {
  name: "Wizard's Astral Bookshelf",
  description: "An ornate high-fantasy anime bookshelf packed with enchanted tomes, scrolls, a glowing astral orb and candlelight.",
  style: "high-fantasy anime",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", detail: 1 });
  const root = b.joint("shelfRoot", { at: [0, 0, 0], role: "fan" });

  const addBox = (name: string, size: [number, number, number], at: [number, number, number], color: Fill, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: root, name, at, rotation, flat: true });
  const addCylinder = (name: string, radius: number, height: number, at: [number, number, number], color: Fill, rotation?: [number, number, number], segments = 10) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, { bone: root, name, at, rotation, flat: true });
  const addSphere = (name: string, radius: number, at: [number, number, number], color: Fill, segments = 12) =>
    b.part(new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.75))), color, { bone: root, name, at, flat: true });
  const addCone = (name: string, radius: number, height: number, at: [number, number, number], color: Fill, segments = 8) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, { bone: root, name, at, flat: true });
  const addTorus = (name: string, radius: number, tube: number, at: [number, number, number], color: Fill, rotation: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.TorusGeometry(radius, tube, 6, 16), color, { bone: root, name, at, rotation, flat: true });

  // Deep violet cabinet, broad enough to read as a real 1.8 m standing bookshelf.
  addBox("backPanel", [1.10, 1.62, 0.10], [0, 0.91, -0.17], WOOD);
  addBox("backPanelInset", [0.88, 1.38, 0.025], [0, 0.93, -0.112], INK_PAINT);
  addBox("plinth", [1.34, 0.16, 0.48], [0, 0.08, 0], WOOD_EDGE);
  addBox("plinthTop", [1.20, 0.08, 0.42], [0, 0.23, 0], GOLD);
  addBox("crown", [1.38, 0.18, 0.48], [0, 1.80, 0], WOOD_EDGE);
  addBox("crownCap", [1.48, 0.08, 0.53], [0, 1.92, 0], GOLD);
  addBox("crownShadow", [1.30, 0.06, 0.44], [0, 1.72, 0.03], TEAL);

  for (const s of [-1, 1]) {
    addBox(`sidePost${s}`, [0.14, 1.62, 0.36], [s * 0.57, 0.93, 0], WOOD_EDGE);
    addBox(`sidePostFace${s}`, [0.045, 1.48, 0.40], [s * 0.485, 0.94, 0.015], TEAL);
    addBox(`sideGoldTrim${s}`, [0.035, 1.45, 0.035], [s * 0.43, 0.95, 0.205], GOLD_BRIGHT);
    addSphere(`postFinial${s}`, 0.065, [s * 0.57, 1.98, 0.02], GOLD_BRIGHT, 10);
    addCone(`postFinialTip${s}`, 0.055, 0.15, [s * 0.57, 2.075, 0.02], GOLD, 6);
    addSphere(`footGem${s}`, 0.04, [s * 0.48, 0.13, 0.235], CRIMSON, 8);
  }

  // Three shelves have contrasting front rails and tiny jewel-headed fasteners.
  const shelfYs = [0.48, 0.94, 1.40];
  shelfYs.forEach((y, i) => {
    addBox(`shelf${i}`, [1.04, 0.085, 0.40], [0, y, 0], WOOD);
    addBox(`shelfRail${i}`, [1.08, 0.055, 0.055], [0, y + 0.055, 0.205], GOLD);
    for (const s of [-1, 1]) addSphere(`railStud${i}${s}`, 0.018, [s * 0.47, y + 0.055, 0.238], GOLD_BRIGHT, 8);
  });

  // A glowing sigil is inset into the rear board, visible through the gaps in the books.
  const rune = b.part(new THREE.PlaneGeometry(0.30, 0.46), "#ffffff", {
    bone: root,
    name: "astralRune",
    at: [0, 1.03, -0.096],
    texture: RUNE,
  });
  glow(rune, 1.2);
  addTorus("runeFrame", 0.20, 0.012, [0, 1.03, -0.078], GOLD, [0, 0, 0]);

  // Crown ornament: a faceted amethyst in a gold ring, with two curling side jewels.
  addTorus("crownHalo", 0.22, 0.025, [0, 1.98, 0.12], GOLD_BRIGHT, [0, 0, 0]);
  const crownGem = addSphere("crownAmethyst", 0.10, [0, 1.98, 0.135], "#a66cff", 10);
  glow(crownGem, 0.45);
  for (const s of [-1, 1]) {
    addTorus(`crownCurl${s}`, 0.11, 0.018, [s * 0.23, 1.91, 0.11], GOLD, [0, 0, 0]);
    addSphere(`crownCurlGem${s}`, 0.035, [s * 0.23, 1.91, 0.14], TEAL_LIGHT, 8);
  }

  // Books: each has a page block, two covers, a raised spine, bands and a tiny clasp jewel.
  const bookRows: Array<{ bottom: number; widths: number[]; heights: number[]; colors: Fill[]; tilts: number[] }> = [
    { bottom: 0.535, widths: [0.13, 0.115, 0.16, 0.105, 0.14, 0.12], heights: [0.32, 0.36, 0.29, 0.34, 0.31, 0.37], colors: [CRIMSON, SAPPHIRE, VIOLET, JADE, CRIMSON, SAPPHIRE], tilts: [-3, 2, 0, -2, 3, 0] },
    { bottom: 0.995, widths: [0.12, 0.16, 0.13, 0.115, 0.15, 0.10], heights: [0.30, 0.35, 0.34, 0.31, 0.36, 0.29], colors: [SAPPHIRE, CRIMSON, JADE, VIOLET, SAPPHIRE, CRIMSON], tilts: [2, -2, 1, 0, -3, 2] },
    { bottom: 1.455, widths: [0.15, 0.11, 0.13, 0.15, 0.10], heights: [0.27, 0.30, 0.25, 0.29, 0.26], colors: [VIOLET, JADE, CRIMSON, SAPPHIRE, VIOLET], tilts: [-2, 0, 2, -2, 1] },
  ];
  const rowStarts = [-0.43, -0.42, -0.39];
  bookRows.forEach((row, r) => {
    let x = rowStarts[r];
    row.widths.forEach((w, i) => {
      const h = row.heights[i];
      const tilt = row.tilts[i];
      const y = row.bottom + h / 2;
      const cover = row.colors[i];
      addBox(`book${r}_${i}_pages`, [w * 0.88, h * 0.91, 0.27], [x + w / 2, y, 0.018], (r + i) % 2 === 0 ? PARCHMENT : PAGE_SHADOW, [0, 0, tilt]);
      addBox(`book${r}_${i}_coverTop`, [w + 0.018, 0.022, 0.30], [x + w / 2, row.bottom + h - 0.012, 0.018], cover, [0, 0, tilt]);
      addBox(`book${r}_${i}_coverBottom`, [w + 0.018, 0.022, 0.30], [x + w / 2, row.bottom + 0.012, 0.018], cover, [0, 0, tilt]);
      addBox(`book${r}_${i}_spine`, [0.025, h * 0.94, 0.31], [x + 0.012, y, 0.018], cover, [0, 0, tilt]);
      addBox(`book${r}_${i}_band`, [0.025, h * 0.22, 0.016], [x + w * 0.70, y, 0.173], GOLD_BRIGHT, [0, 0, tilt]);
      const clasp = addSphere(`book${r}_${i}_clasp`, 0.018, [x + w * 0.70, y, 0.19], "#ffe69a", 8);
      if ((r + i) % 3 === 0) glow(clasp, 0.5);
      // a page marker peeks below every other volume
      if ((r + i) % 2 === 0) addBox(`book${r}_${i}_marker`, [0.012, 0.065, 0.012], [x + w * 0.45, row.bottom - 0.018, 0.16], TEAL_LIGHT, [0, 0, tilt]);
      x += w + 0.012;
    });
  });

  // Two horizontal scrolls rest on the plinth, clearly visible below the lowest shelf.
  for (const s of [-1, 1]) {
    const x = s * 0.385;
    addCylinder(`scroll${s}`, 0.060, 0.30, [x, 0.34, 0.245], PARCHMENT, [0, 0, 90], 10);
    addTorus(`scrollRingA${s}`, 0.062, 0.010, [x - s * 0.095, 0.34, 0.245], GOLD, [0, 90, 0]);
    addTorus(`scrollRingB${s}`, 0.062, 0.010, [x + s * 0.095, 0.34, 0.245], GOLD, [0, 90, 0]);
    addSphere(`scrollCap${s}`, 0.067, [x + s * 0.155, 0.34, 0.245], GOLD_BRIGHT, 8);
    addBox(`scrollRibbon${s}`, [0.028, 0.095, 0.018], [x, 0.34, 0.308], CRIMSON, [0, 0, 18 * s]);
  }

  // A half-open grimoire leans against the scrolls, with a gold page gutter and corner clasps.
  addBox("openGrimoireLeft", [0.25, 0.025, 0.30], [-0.14, 0.315, 0.19], VIOLET, [0, -8, -5]);
  addBox("openGrimoireRight", [0.25, 0.025, 0.30], [0.14, 0.315, 0.19], CRIMSON, [0, 8, 5]);
  addBox("openGrimoirePagesL", [0.21, 0.018, 0.25], [-0.14, 0.345, 0.22], PARCHMENT, [0, -8, -5]);
  addBox("openGrimoirePagesR", [0.21, 0.018, 0.25], [0.14, 0.345, 0.22], PARCHMENT, [0, 8, 5]);
  addSphere("grimoireClasp", 0.025, [0, 0.37, 0.345], GOLD_BRIGHT, 8);

  // The middle shelf's enchanted orb sits in a three-legged brass cradle.
  addCylinder("orbStand", 0.13, 0.045, [0, 1.02, 0.235], GOLD, undefined, 10);
  addTorus("orbCradle", 0.145, 0.018, [0, 1.14, 0.235], GOLD_BRIGHT, [90, 0, 0]);
  addTorus("orbCradleCross", 0.145, 0.014, [0, 1.14, 0.235], GOLD, [0, 90, 0]);
  const orb = addSphere("astralOrb", 0.105, [0, 1.145, 0.235], "#59d9ff", 16);
  glow(orb, 1.8);
  for (const s of [-1, 1]) addCone(`orbProng${s}`, 0.018, 0.13, [s * 0.105, 1.08, 0.235], GOLD_BRIGHT, 6);


  // Candles burn above the top shelf; the flame meshes are the only self-lit fire.
  const addCandle = (s: number) => {
    const x = s * 0.425;
    addCylinder(`candleCup${s}`, 0.068, 0.025, [x, 1.455, 0.24], GOLD, undefined, 10);
    addCylinder(`candleWax${s}`, 0.042, 0.18, [x, 1.56, 0.24], PARCHMENT, undefined, 10);
    addTorus(`candleBand${s}`, 0.043, 0.008, [x, 1.52, 0.24], CRIMSON, [0, 0, 0]);
    addCylinder(`wick${s}`, 0.008, 0.035, [x, 1.67, 0.24], INK, undefined, 6);
    const flame = addCone(`flame${s}`, 0.045, 0.12, [x, 1.745, 0.24], "#ff9f3f", 7);
    glow(flame, 1.6);
  };
  addCandle(-1);
  addCandle(1);

  // Side sconces and small floating crystals add a magical silhouette without obscuring the books.
  for (const s of [-1, 1]) {
    addBox(`sconceArm${s}`, [0.12, 0.025, 0.025], [s * 0.49, 1.55, 0.24], GOLD, [0, 0, 0]);
    addTorus(`sconceRing${s}`, 0.055, 0.012, [s * 0.49, 1.60, 0.24], GOLD_BRIGHT, [90, 0, 0]);
    const crystal = addCone(`sconceCrystal${s}`, 0.035, 0.13, [s * 0.49, 1.67, 0.24], "#52d5c9", 6);
    glow(crystal, 1.1);
  }

  // Gold corner studs and a little inlaid diamond pattern complete the hand-built prop language.
  for (const y of [0.29, 0.76, 1.22, 1.68]) {
    for (const s of [-1, 1]) addSphere(`cornerStud${s}_${y}`, 0.015, [s * 0.49, y, 0.215], GOLD_BRIGHT, 7);
  }
  for (const s of [-1, 1]) {
    addCone(`inlayDiamond${s}`, 0.034, 0.07, [s * 0.32, 1.84, 0.255], VIOLET, 4);
    addCone(`inlayDiamondTip${s}`, 0.034, 0.07, [s * 0.32, 1.91, 0.255], VIOLET, 4);
  }

  return b.root;
}
