import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { arc, bezier, catmull, polyline } from "../../../../src/path";
import { countershade, grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Celestial Adeptus Isle",
  description:
    "Genshin Impact style floating sky island diorama with ancient alabaster and gold-filigree ruins, glowing Anemo and Geo monoliths, sacred golden-ginkgo and jade trees, and a cascading waterfall plunging into a cloud-ringed lotus basin.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette & Cel-Shaded Paints (Genshin Impact style)
// ---------------------------------------------------------------------------

// Flat colors for trims, metals, and self-lit glowing elements (glow() requires flat colors or textures)
const GOLD_FLAT = "#f2c14e";
const GOLD_DARK = "#b87e1b";
const ALABASTER_FLAT = "#f3efe4";
const SLATE_FLAT = "#2c3654";
const CRIMSON_FLAT = "#c93b42";
const ANEMO_GLOW = "#5efce0";
const HYDRO_GLOW = "#78f0ff";
const GEO_GLOW = "#ffbe3b";
const CELESTIAL_GOLD_GLOW = "#ffe680";
const WAYPOINT_GLOW = "#68d8ff";
const FOAM_WHITE = "#ebffff";

// Rich cel-shaded surface paints
const ALABASTER_PAINT = cel(mottle("#f7f4eb", "#e5dfd0", { size: 0.26, seed: 11 }), "#b6bed6");
const SLATE_PAINT = cel(mottle("#344061", "#242d47", { size: 0.22, seed: 19 }), "#171d30");
const GOLD_PAINT = cel(grain("#f7c84b", "#d99b26", { size: 0.14, axis: "y", seed: 23 }), "#9e6614");

// Layered Jueyun Karst amber-ochre & slate rock paint
const KARST_PAINT = cel(
  paint((p, n) => {
    const strata = Math.sin(p.y * 16 + noise(p, 0.28, 3) * 2.4);
    const warmRock = strata > 0.25 ? "#d4a46a" : strata > -0.35 ? "#b8834d" : "#8f6038";
    const mossTint = n.y > 0.58 ? mix(warmRock, "#52b862", smoothstep(0.58, 0.82, n.y) * 0.55) : warmRock;
    const coolUnder = n.y < -0.15 ? mix(mossTint, "#4b556e", smoothstep(-0.15, -0.65, n.y) * 0.72) : mossTint;
    return coolUnder;
  }),
  "#52445c",
);

// Lush emerald-jade turf with toon zig-zag overhanging grass edge
const TURF_PAINT = cel(
  furEdge(mottle("#68e370", "#3ec259", { size: 0.24, seed: 31 }), "#29964f", {
    level: 0.1,
    teeth: 0.24,
    period: 0.08,
    ink: "#195c38",
  }),
  "#1f7844",
);

// Gnarled sacred tree bark
const BARK_PAINT = cel(grain("#5e3d3f", "#42272a", { size: 0.09, axis: "y", seed: 41 }), "#2b171c");

// Tree canopies: Golden Ginkgo, Sakura Coral, and Spirit Jade
const GOLD_CANOPY_PAINT = cel(
  countershade(mottle("#ffd04f", "#f79c31", { size: 0.22, seed: 53 }), "#d96d26", { level: -0.1 }),
  "#b8511e",
);
const SAKURA_CANOPY_PAINT = cel(
  countershade(mottle("#ffa8be", "#ff7a9c", { size: 0.18, seed: 61 }), "#d9527a", { level: -0.1 }),
  "#b03b63",
);
const JADE_CANOPY_PAINT = cel(
  countershade(mottle("#49e8b5", "#24b88d", { size: 0.18, seed: 71 }), "#16856a", { level: -0.1 }),
  "#116352",
);

// Waterfall and sacred pool paints
const WATERFALL_PAINT = cel(
  stripes("#33d4f0", "#ebffff", { size: 0.085, axis: "x", width: 0.38, wobble: 0.32, seed: 83 }),
  "#1c96bd",
);

const POOL_WATER_PAINT = paint((p) => {
  const dx = p.x - 0.22;
  const dz = p.z - 0.56;
  const d = Math.hypot(dx, dz);
  const ripple = Math.sin(d * 26 - noise(p, 0.22, 91) * 2.2);
  if (d < 0.28 && ripple > 0.15) return "#ebffff";
  if (ripple > 0.68) return "#bdfaff";
  const t = smoothstep(0.15, 0.92, d);
  return mix("#3be3f5", "#166b9c", t);
});

const CLOUD_PAINT = cel(countershade("#ffffff", "#d9e8ff", { level: -0.05 }), "#a9c2eb");

// ---------------------------------------------------------------------------
// SVG Textures (Celestial Astrolabe, Foliage Cards, Splash, Talisman, Lotus)
// ---------------------------------------------------------------------------

const ASTROLABE_TEX = svg(
  `<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="120" fill="none" stroke="#f2c14e" stroke-width="6"/>
    <circle cx="128" cy="128" r="104" fill="none" stroke="#5efce0" stroke-width="4" stroke-dasharray="18 10"/>
    <circle cx="128" cy="128" r="82" fill="none" stroke="#f2c14e" stroke-width="5"/>
    <polygon points="128,16 156,96 240,128 156,160 128,240 100,160 16,128 100,96" fill="none" stroke="#f2c14e" stroke-width="5"/>
    <polygon points="128,44 176,128 128,212 80,128" fill="none" stroke="#5efce0" stroke-width="4"/>
    <circle cx="128" cy="128" r="36" fill="#2c3654" stroke="#f2c14e" stroke-width="6"/>
    <circle cx="128" cy="128" r="18" fill="#5efce0"/>
    <circle cx="128" cy="32" r="8" fill="#5efce0"/>
    <circle cx="128" cy="224" r="8" fill="#5efce0"/>
    <circle cx="32" cy="128" r="8" fill="#5efce0"/>
    <circle cx="224" cy="128" r="8" fill="#5efce0"/>
  </svg>`,
  { size: 512 },
);

const FOLIAGE_BLOSSOM_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <g stroke="#5c2d16" stroke-width="3" fill="none">
      <path d="M64 122 Q64 70 36 32"/>
      <path d="M64 96 Q88 64 102 36"/>
    </g>
    <path d="M36 30 C16 24 12 48 34 52 C20 68 44 76 50 54 C68 62 72 38 50 34 C54 14 34 14 36 30 Z" fill="#ffd252" stroke="#c97a1c" stroke-width="3"/>
    <path d="M94 38 C78 32 76 52 92 56 C82 70 102 76 106 58 C122 64 122 44 106 40 C108 24 92 24 94 38 Z" fill="#ff9eb5" stroke="#c44768" stroke-width="3"/>
    <path d="M64 68 C48 62 46 82 62 86 C52 100 72 106 76 88 C92 94 92 74 76 70 C78 54 62 54 64 68 Z" fill="#ffe478" stroke="#d48722" stroke-width="3"/>
    <circle cx="42" cy="42" r="5" fill="#fff6cc"/>
    <circle cx="98" cy="48" r="4" fill="#fff6cc"/>
    <circle cx="68" cy="78" r="4" fill="#fff6cc"/>
  </svg>`,
  { size: 256 },
);

const VINE_LEAF_TEX = svg(
  `<svg viewBox="0 0 96 160">
    <path d="M48 4 Q34 52 52 96 Q62 128 44 156" stroke="#1e6b46" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M44 28 Q16 22 14 42 Q28 52 44 38 Z" fill="#5ce07a" stroke="#19593a" stroke-width="3"/>
    <path d="M50 48 Q80 42 82 62 Q66 72 50 58 Z" fill="#46cc6b" stroke="#19593a" stroke-width="3"/>
    <path d="M46 76 Q18 72 16 92 Q32 102 48 86 Z" fill="#5ce07a" stroke="#19593a" stroke-width="3"/>
    <path d="M52 102 Q80 98 80 118 Q64 126 50 112 Z" fill="#3bbd72" stroke="#19593a" stroke-width="3"/>
    <path d="M46 130 Q24 128 24 146 Q38 152 46 138 Z" fill="#6ef08e" stroke="#19593a" stroke-width="3"/>
    <circle cx="44" cy="152" r="6" fill="#5efce0"/>
  </svg>`,
  { size: 256 },
);

const WATER_SPLASH_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <path d="M16 120 Q32 64 20 28 Q44 56 48 92 Q64 42 64 14 Q74 52 80 92 Q92 54 110 30 Q96 68 112 120 Z" fill="#dcffff" stroke="#5adcf5" stroke-width="3"/>
    <circle cx="28" cy="20" r="6" fill="#ffffff"/>
    <circle cx="64" cy="10" r="7" fill="#ffffff"/>
    <circle cx="102" cy="22" r="6" fill="#ffffff"/>
    <circle cx="46" cy="36" r="4" fill="#99f5ff"/>
    <circle cx="84" cy="38" r="4" fill="#99f5ff"/>
  </svg>`,
  { size: 256 },
);

const TALISMAN_TEX = svg(
  `<svg viewBox="0 0 64 160">
    <rect x="12" y="4" width="40" height="108" rx="4" fill="#c93b42" stroke="#f2c14e" stroke-width="5"/>
    <polygon points="12,112 32,142 52,112" fill="#c93b42" stroke="#f2c14e" stroke-width="5"/>
    <circle cx="32" cy="34" r="11" fill="none" stroke="#ffe680" stroke-width="4"/>
    <path d="M32 18 L32 96 M20 58 L44 58 M22 78 L42 78" stroke="#5efce0" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 140 L22 158 M32 142 L32 158 M38 140 L42 158" stroke="#f2c14e" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const LOTUS_PAD_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <path d="M64 64 L108 42 A54 54 0 1 1 98 22 Z" fill="#3bc476" stroke="#1c7344" stroke-width="5"/>
    <path d="M64 64 L26 42 M64 64 L22 78 M64 64 L54 112 M64 64 L94 98 M64 64 L60 16" stroke="#68e898" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="64" r="16" fill="#ff9eb5" stroke="#ffffff" stroke-width="3"/>
    <circle cx="60" cy="64" r="7" fill="#ffe066"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------
// Diorama Builder
// ---------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "floatingIslandDiorama", detail: 0.85, paintSize: 2048 });
  const rand = rng(202505);

  // Single root joint at floor origin; articulated hinge joints only for moving/floating elements
  const root = b.joint("islandBase", { at: [0, 0, 0] });

  // -------------------------------------------------------------------------
  // 1. SACRED CLOUD & LOTUS CATCHING BASIN (Floor Plinth: y = 0.00 .. 0.30)
  // -------------------------------------------------------------------------

  // Outer stepped octagonal alabaster plinth resting flat on y = 0
  b.lathe(
    [
      [0, 0],
      [1.14, 0],
      [1.14, 0.06, "sharp"],
      [1.06, 0.08, "sharp"],
      [1.06, 0.16, "sharp"],
      [0.98, 0.18, "sharp"],
      [0.92, 0.18, "sharp"],
      [0.92, 0.11, "sharp"],
      [0, 0.11],
    ],
    {
      at: [0, 0, 0],
      segments: 8,
      spin: 22.5,
      color: ALABASTER_PAINT,
      bone: root,
      group: "plinth",
      name: "plinthBasin",
    },
  );

  // Golden filigree rim ring around the basin lip
  const basinRimPath = arc([0, 0.185, 0], [1.02, 0.185, 0], [0, 1, 0], 360);
  b.sweep(basinRimPath, 0.024, {
    sides: 6,
    color: GOLD_PAINT,
    bone: root,
    group: "plinth",
    name: "basinGoldRim",
  });

  // 8 ornate corner boundary bollards with golden caps around the octagonal pool
  for (let i = 0; i < 8; i++) {
    const ang = ((i + 0.5) * Math.PI) / 4;
    const px = Math.cos(ang) * 1.03;
    const pz = Math.sin(ang) * 1.03;
    b.rod([px, 0.06, pz], [px, 0.25, pz], [0.055, 0.045], {
      sides: 6,
      color: ALABASTER_PAINT,
      bone: root,
      group: "plinth",
    });
    b.spike([px, 0.25, pz], [0, 1, 0], 0.065, 0.055, {
      sides: 6,
      color: GOLD_PAINT,
      bone: root,
      group: "plinth",
    });
  }

  // Sacred water surface disc inside the basin
  b.lathe(
    [
      [0, 0],
      [0.93, 0],
      [0.93, 0.035, "sharp"],
      [0, 0.035],
    ],
    {
      at: [0, 0.11, 0],
      segments: 16,
      color: POOL_WATER_PAINT,
      bone: root,
      group: "pool",
      name: "poolWater",
    },
  );

  // Lotus pads floating on the sacred pool
  const lotusSpots: Array<[number, number, number]> = [
    [-0.48, 0.148, 0.36],
    [-0.62, 0.148, -0.18],
    [0.58, 0.148, 0.22],
    [0.46, 0.148, -0.44],
    [-0.22, 0.148, -0.58],
    [-0.18, 0.148, 0.62],
  ];
  b.cards(
    lotusSpots.map(([lx, ly, lz]) => frame([lx, ly, lz], [0, 1, 0])),
    LOTUS_PAD_TEX,
    {
      size: 0.22,
      lean: 90,
      flow: [1, 0, 0.4],
      spin: 180,
      vary: 0.2,
      rng: rng(101),
      mirror: true,
      bone: root,
      group: "pool",
      name: "lotusPads",
    },
  );

  // Billowing stylized cel-shaded clouds ringing the basin & cradling the island vortex
  const cloudClusters: Array<{ at: V3; r: [number, number, number] }> = [
    { at: [-0.74, 0.22, -0.46], r: [0.24, 0.14, 0.2] },
    { at: [-0.56, 0.26, -0.62], r: [0.2, 0.16, 0.18] },
    { at: [0.68, 0.22, -0.52], r: [0.25, 0.15, 0.2] },
    { at: [0.5, 0.27, -0.68], r: [0.19, 0.15, 0.18] },
    { at: [-0.82, 0.2, 0.12], r: [0.21, 0.13, 0.18] },
    { at: [0.78, 0.21, -0.08], r: [0.22, 0.14, 0.19] },
    { at: [-0.08, 0.34, -0.35], r: [0.22, 0.14, 0.2] },
    { at: [0.22, 0.38, -0.25], r: [0.19, 0.13, 0.18] },
    { at: [-0.28, 0.4, 0.08], r: [0.18, 0.12, 0.17] },
  ];
  for (const c of cloudClusters) {
    b.part(new THREE.SphereGeometry(1, 10, 8), CLOUD_PAINT, {
      at: c.at,
      scale: c.r,
      bone: root,
      group: "clouds",
    });
  }

  // Golden cloud-scroll curls & glowing Anemo vortex rings rising from the pool to the floating island tip
  const vortexSpiral1 = arc([0, 0.32, -0.04], [0.36, 0.32, -0.04], [0, 1, 0.12], 300);
  glow(
    b.sweep(vortexSpiral1, [0.022, 0.008], {
      sides: 5,
      caps: "point",
      color: ANEMO_GLOW,
      bone: root,
      group: "vortex",
      name: "vortexStreamLower",
    }),
    1.5,
  );
  const vortexSpiral2 = arc([0, 0.52, -0.04], [-0.28, 0.52, -0.04], [0, 1, -0.1], 280);
  glow(
    b.sweep(vortexSpiral2, [0.02, 0.008], {
      sides: 5,
      caps: "point",
      color: HYDRO_GLOW,
      bone: root,
      group: "vortex",
      name: "vortexStreamUpper",
    }),
    1.4,
  );

  // -------------------------------------------------------------------------
  // 2. MAIN FLOATING SKY ISLAND & SECONDARY TERRACE (y = 0.46 .. 1.48)
  // -------------------------------------------------------------------------

  // Central inverted karst island core (stalactite tip at y = 0.46 flaring to plateau at y = 1.42)
  b.loft(
    [
      { at: [0, 0.46, -0.06], w: 0.06, h: 0.06 },
      { at: [0, 0.68, -0.05], w: 0.46, h: 0.44 },
      { at: [0, 0.94, -0.03], w: 0.96, h: 0.9 },
      { at: [0, 1.2, -0.01], w: 1.42, h: 1.32 },
      { at: [0, 1.38, 0], w: 1.58, h: 1.48 },
      { at: [0, 1.43, 0], w: 1.5, h: 1.4 },
    ],
    {
      sides: 10,
      caps: "flat",
      color: KARST_PAINT,
      bone: root,
      group: "islandRock",
      name: "mainIslandCore",
    },
  );

  // Ring of 10 faceted Jueyun Karst cliff buttresses and hanging stalactites around the island perimeter
  const buttressSpecs: Array<{ ang: number; rad: number; w: number; d: number; yBot: number; yTop: number }> = [
    { ang: 0, rad: 0.62, w: 0.38, d: 0.36, yBot: 0.72, yTop: 1.41 },
    { ang: 36, rad: 0.66, w: 0.42, d: 0.38, yBot: 0.64, yTop: 1.42 },
    { ang: 72, rad: 0.68, w: 0.44, d: 0.4, yBot: 0.58, yTop: 1.43 },
    { ang: 108, rad: 0.65, w: 0.4, d: 0.38, yBot: 0.66, yTop: 1.42 },
    { ang: 144, rad: 0.64, w: 0.42, d: 0.36, yBot: 0.6, yTop: 1.43 },
    { ang: 180, rad: 0.62, w: 0.44, d: 0.38, yBot: 0.56, yTop: 1.43 },
    { ang: 216, rad: 0.66, w: 0.4, d: 0.38, yBot: 0.62, yTop: 1.42 },
    { ang: 252, rad: 0.64, w: 0.38, d: 0.36, yBot: 0.68, yTop: 1.41 },
    { ang: 288, rad: 0.6, w: 0.36, d: 0.34, yBot: 0.7, yTop: 1.4 },
    { ang: 324, rad: 0.62, w: 0.38, d: 0.35, yBot: 0.65, yTop: 1.41 },
  ];

  for (const [idx, crag] of buttressSpecs.entries()) {
    const rad = (crag.ang * Math.PI) / 180;
    const cx = Math.sin(rad) * crag.rad;
    const cz = Math.cos(rad) * crag.rad;
    b.loft(
      [
        { at: [cx * 0.72, crag.yBot, cz * 0.72], w: 0.05, h: 0.05 },
        { at: [cx * 0.92, (crag.yBot + crag.yTop) * 0.52, cz * 0.92], w: crag.w * 0.88, h: crag.d * 0.88 },
        { at: [cx, crag.yTop - 0.05, cz], w: crag.w, h: crag.d },
        { at: [cx * 0.95, crag.yTop, cz * 0.95], w: crag.w * 0.92, h: crag.d * 0.92 },
      ],
      {
        section: { ngon: 6 },
        caps: "flat",
        color: KARST_PAINT,
        bone: root,
        group: "islandRock",
        name: `karstButtress${idx + 1}`,
      },
    );
  }

  // Lush overhanging jade grass mantle capping the main island plateau
  b.loft(
    [
      { at: [0, 1.37, 0], w: 1.66, h: 1.56 },
      { at: [0, 1.43, 0], w: 1.7, h: 1.6 },
      { at: [0, 1.47, 0], w: 1.54, h: 1.44 },
    ],
    {
      sides: 12,
      caps: "flat",
      color: TURF_PAINT,
      bone: root,
      group: "islandTurf",
      name: "mainTurfCap",
    },
  );

  // Secondary lower floating terrace on the front-right (-X, +Z) connected by the celestial bridge
  const secCenter: V3 = [-0.74, 1.08, 0.38];
  b.loft(
    [
      { at: [secCenter[0], 0.58, secCenter[2]], w: 0.05, h: 0.05 },
      { at: [secCenter[0], 0.84, secCenter[2]], w: 0.42, h: 0.4 },
      { at: [secCenter[0], 1.08, secCenter[2]], w: 0.68, h: 0.64 },
      { at: [secCenter[0], 1.15, secCenter[2]], w: 0.64, h: 0.6 },
    ],
    {
      section: { ngon: 7 },
      caps: "flat",
      color: KARST_PAINT,
      bone: root,
      group: "secondaryIsle",
      name: "secondaryRockCore",
    },
  );

  b.loft(
    [
      { at: [secCenter[0], 1.12, secCenter[2]], w: 0.72, h: 0.68 },
      { at: [secCenter[0], 1.16, secCenter[2]], w: 0.74, h: 0.7 },
      { at: [secCenter[0], 1.19, secCenter[2]], w: 0.64, h: 0.6 },
    ],
    {
      sides: 8,
      caps: "flat",
      color: TURF_PAINT,
      bone: root,
      group: "secondaryIsle",
      name: "secondaryTurfCap",
    },
  );

  // 5 Satellite Floating Rocklets & Ascent Stepping Crags around the diorama
  const floatingCrags: Array<{ at: V3; h: number; w: number; hasTurf: boolean }> = [
    { at: [-0.36, 0.52, 0.58], h: 0.26, w: 0.26, hasTurf: true },
    { at: [-0.58, 0.76, 0.62], h: 0.28, w: 0.28, hasTurf: true },
    { at: [0.92, 1.18, 0.28], h: 0.36, w: 0.3, hasTurf: true },
    { at: [0.86, 1.68, -0.48], h: 0.34, w: 0.26, hasTurf: false },
    { at: [-0.88, 1.62, -0.36], h: 0.32, w: 0.25, hasTurf: false },
  ];

  for (const [idx, fc] of floatingCrags.entries()) {
    const [fx, fy, fz] = fc.at;
    b.loft(
      [
        { at: [fx, fy - fc.h * 0.65, fz], w: 0.04, h: 0.04 },
        { at: [fx, fy, fz], w: fc.w, h: fc.w * 0.92 },
        { at: [fx, fy + fc.h * 0.35, fz], w: fc.w * 0.88, h: fc.w * 0.82 },
      ],
      {
        section: { ngon: 6 },
        caps: "flat",
        color: KARST_PAINT,
        bone: root,
        group: "floatingCrags",
        name: `floatingCrag${idx + 1}`,
      },
    );
    if (fc.hasTurf) {
      b.rod([fx, fy + fc.h * 0.28, fz], [fx, fy + fc.h * 0.42, fz], [fc.w * 0.48, fc.w * 0.42], {
        sides: 6,
        color: TURF_PAINT,
        bone: root,
        group: "floatingCrags",
      });
    }
  }

  // Golden adeptus rope-chains tethering the high satellite rocks to the main island
  b.sweep(
    catmull([
      [0.66, 1.32, -0.32],
      [0.76, 1.44, -0.4],
      [0.85, 1.62, -0.46],
    ]),
    0.016,
    { sides: 5, caps: "flat", color: GOLD_PAINT, bone: root, group: "floatingCrags" },
  );
  b.sweep(
    catmull([
      [-0.64, 1.32, -0.24],
      [-0.76, 1.42, -0.3],
      [-0.86, 1.58, -0.35],
    ]),
    0.016,
    { sides: 5, caps: "flat", color: GOLD_PAINT, bone: root, group: "floatingCrags" },
  );

  // Glowing Geo Amber Crystal Clusters erupting from the karst cliffs and floating crags
  const crystalClusters: Array<{ base: V3; dir: V3; len: number; r: number }> = [
    { base: [0.86, 1.76, -0.48], dir: [0.25, 1, -0.15], len: 0.24, r: 0.055 },
    { base: [0.82, 1.74, -0.44], dir: [-0.2, 0.9, 0.25], len: 0.16, r: 0.04 },
    { base: [-0.88, 1.7, -0.36], dir: [-0.3, 1, 0.1], len: 0.22, r: 0.052 },
    { base: [-0.84, 1.68, -0.32], dir: [0.15, 0.95, 0.3], len: 0.15, r: 0.038 },
    { base: [0.64, 1.02, 0.42], dir: [0.65, 0.45, 0.4], len: 0.22, r: 0.05 },
    { base: [0.6, 0.98, 0.48], dir: [0.45, 0.7, 0.5], len: 0.15, r: 0.038 },
    { base: [-0.52, 0.88, -0.48], dir: [-0.6, -0.3, -0.5], len: 0.2, r: 0.048 },
    { base: [0.16, 0.64, -0.38], dir: [0.3, -0.8, -0.4], len: 0.21, r: 0.048 },
  ];
  for (const [idx, cc] of crystalClusters.entries()) {
    glow(
      b.spike(cc.base, cc.dir, cc.len, cc.r, {
        section: { ngon: 6 },
        color: idx % 2 === 0 ? GEO_GLOW : CELESTIAL_GOLD_GLOW,
        bone: root,
        group: "geoCrystals",
      }),
      1.6,
    );
  }

  // -------------------------------------------------------------------------
  // 3. ARCHED CELESTIAL BRIDGE & SANCTUARY RUINS (y = 1.18 .. 2.55)
  // -------------------------------------------------------------------------

  // Arched Alabaster & Gold Bridge connecting Secondary Terrace [-0.54, 1.18, 0.28] to Main Plaza [-0.34, 1.46, 0.14]
  const bridgeArch = bezier([-0.58, 1.18, 0.3], [-0.48, 1.38, 0.24], [-0.4, 1.46, 0.18], [-0.32, 1.47, 0.14]);
  b.sweep(bridgeArch, () => [0.16, 0.032], {
    section: "box",
    caps: "flat",
    up: [0, 1, 0],
    color: ALABASTER_PAINT,
    bone: root,
    group: "bridge",
    name: "bridgeDeck",
  });

  // Bridge balustrades & golden handrails on both sides
  for (const side of [-1, 1]) {
    const offX = side * 0.08;
    const offZ = -side * 0.11;
    const railCurve = bezier(
      [-0.58 + offX, 1.29, 0.3 + offZ],
      [-0.48 + offX, 1.49, 0.24 + offZ],
      [-0.4 + offX, 1.57, 0.18 + offZ],
      [-0.32 + offX, 1.58, 0.14 + offZ],
    );
    b.sweep(railCurve, 0.018, {
      sides: 5,
      caps: "flat",
      color: GOLD_PAINT,
      bone: root,
      group: "bridge",
    });
    for (const t of [0.05, 0.5, 0.95]) {
      const pt = railCurve.at(t);
      b.rod([pt.x, pt.y - 0.12, pt.z], [pt.x, pt.y + 0.03, pt.z], 0.022, {
        sides: 6,
        color: ALABASTER_PAINT,
        bone: root,
        group: "bridge",
      });
      b.spike([pt.x, pt.y + 0.03, pt.z], [0, 1, 0], 0.045, 0.026, {
        sides: 6,
        color: GOLD_PAINT,
        bone: root,
        group: "bridge",
      });
    }
  }

  // Circular Sanctuary Plaza Dais on the main plateau
  const plazaCenter: V3 = [-0.04, 1.46, -0.06];
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.04, "sharp"],
      [0.56, 0.055, "sharp"],
      [0.56, 0.09, "sharp"],
      [0, 0.09],
    ],
    {
      at: plazaCenter,
      segments: 12,
      color: ALABASTER_PAINT,
      bone: root,
      group: "ruins",
      name: "sanctuaryDais",
    },
  );

  // Golden border ring around the sanctuary dais
  b.sweep(arc([plazaCenter[0], 1.55, plazaCenter[2]], [plazaCenter[0] + 0.55, 1.55, plazaCenter[2]], [0, 1, 0], 360), 0.018, {
    sides: 6,
    color: GOLD_PAINT,
    bone: root,
    group: "ruins",
    name: "daisGoldRing",
  });

  // Glowing Astrolabe Floor Mandala (textured disc slightly proud of the dais top)
  glow(
    b.part(new THREE.CircleGeometry(0.46, 16), "#ffffff", {
      at: [plazaCenter[0], 1.554, plazaCenter[2]],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: ASTROLABE_TEX,
      bone: root,
      group: "ruins",
      name: "astrolabeFloorSeal",
    }),
    1.25,
  );

  // Central Altar Pedestal & Articulated Floating Astrolabe + Anemo Crystal Core
  const altarPos: V3 = [plazaCenter[0], 1.55, plazaCenter[2] - 0.04];
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.14, 0.06, "sharp"],
      [0.09, 0.16, "sharp"],
      [0.13, 0.21, "sharp"],
      [0, 0.21],
    ],
    {
      at: altarPos,
      segments: 6,
      color: SLATE_PAINT,
      bone: root,
      group: "ruins",
      name: "altarPedestal",
    },
  );

  // Articulated hinge joint for the rotating golden celestial astrolabe ring
  const astrolabeJoint = b.joint("astrolabeRing", {
    parent: root,
    at: [altarPos[0], 1.98, altarPos[2]],
    dir: [0, 1, 0],
    role: "hinge",
  });
  b.sweep(
    arc([altarPos[0], 1.98, altarPos[2]], [altarPos[0] + 0.17, 1.98, altarPos[2]], [0.25, 0.2, 1], 360),
    0.015,
    {
      sides: 6,
      color: GOLD_PAINT,
      bone: astrolabeJoint,
      group: "ruins",
      name: "outerAstrolabe",
    },
  );
  b.sweep(
    arc([altarPos[0], 1.98, altarPos[2]], [altarPos[0], 1.98 + 0.13, altarPos[2]], [1, 0.2, -0.25], 360),
    0.012,
    {
      sides: 6,
      color: GOLD_FLAT,
      bone: astrolabeJoint,
      group: "ruins",
      name: "innerAstrolabe",
    },
  );

  // Articulated hinge joint for the floating Anemo elemental prism core inside the astrolabe
  const crystalJoint = b.joint("crystalCore", {
    parent: astrolabeJoint,
    at: [altarPos[0], 1.98, altarPos[2]],
    dir: [0, 1, 0],
    role: "hinge",
  });
  glow(
    b.lathe(
      [
        [0, -0.09],
        [0.055, 0, "sharp"],
        [0, 0.09],
      ],
      {
        at: [altarPos[0], 1.98, altarPos[2]],
        segments: 6,
        color: ANEMO_GLOW,
        bone: crystalJoint,
        group: "ruins",
        name: "anemoCoreCrystal",
      },
    ),
    1.85,
  );

  // Grand Celestial Portal Archway at the back of the plaza (z = -0.38)
  const archZ = -0.38;
  const pillarSpanX = 0.38;
  for (const s of [-1, 1]) {
    const px = plazaCenter[0] + s * pillarSpanX;
    // Stepped square pillar base
    b.frustumBox([px, 1.54, archZ], [px, 1.66, archZ], [0.2, 0.2], [0.16, 0.16], {
      color: SLATE_PAINT,
      bone: root,
      group: "archway",
    });
    // Fluted alabaster column shaft
    b.rod([px, 1.66, archZ], [px, 2.26, archZ], [0.072, 0.064], {
      sides: 8,
      color: ALABASTER_PAINT,
      bone: root,
      group: "archway",
    });
    // Golden filigree bands along column shaft
    for (const by of [1.7, 1.96, 2.22]) {
      b.rod([px, by - 0.02, archZ], [px, by + 0.02, archZ], 0.08, {
        sides: 8,
        color: GOLD_PAINT,
        bone: root,
        group: "archway",
      });
    }
    // Ornate corbel capital
    b.frustumBox([px, 2.24, archZ], [px, 2.34, archZ], [0.15, 0.15], [0.22, 0.2], {
      color: GOLD_PAINT,
      bone: root,
      group: "archway",
    });
  }

  // Sweeping upturned celestial lower lintel & upper gable beam
  const lintelCurve = bezier(
    [plazaCenter[0] - 0.56, 2.37, archZ],
    [plazaCenter[0] - 0.2, 2.31, archZ],
    [plazaCenter[0] + 0.2, 2.31, archZ],
    [plazaCenter[0] + 0.56, 2.37, archZ],
  );
  b.sweep(lintelCurve, () => [0.06, 0.085], {
    section: "box",
    caps: "flat",
    up: [0, 1, 0],
    color: ALABASTER_PAINT,
    bone: root,
    group: "archway",
    name: "archLowerLintel",
  });

  const roofCurve = bezier(
    [plazaCenter[0] - 0.66, 2.5, archZ],
    [plazaCenter[0] - 0.22, 2.41, archZ],
    [plazaCenter[0] + 0.22, 2.41, archZ],
    [plazaCenter[0] + 0.66, 2.5, archZ],
  );
  b.sweep(roofCurve, (t) => [0.045 + Math.abs(t - 0.5) * 0.03, 0.095], {
    section: "box",
    caps: "point",
    up: [0, 1, 0],
    color: SLATE_PAINT,
    bone: root,
    group: "archway",
    name: "archUpperCrest",
  });

  // Golden crest trim & central celestial sun finial atop the archway
  const goldCrestCurve = bezier(
    [plazaCenter[0] - 0.64, 2.55, archZ],
    [plazaCenter[0] - 0.2, 2.46, archZ],
    [plazaCenter[0] + 0.2, 2.46, archZ],
    [plazaCenter[0] + 0.64, 2.55, archZ],
  );
  b.sweep(goldCrestCurve, 0.022, {
    sides: 5,
    caps: "point",
    color: GOLD_PAINT,
    bone: root,
    group: "archway",
    name: "archGoldTrim",
  });

  // Central sun-ring and glowing diamond finial atop archway
  b.sweep(arc([plazaCenter[0], 2.58, archZ], [plazaCenter[0] + 0.09, 2.58, archZ], [0, 0, 1], 360), 0.016, {
    sides: 6,
    color: GOLD_PAINT,
    bone: root,
    group: "archway",
  });
  glow(
    b.spike([plazaCenter[0], 2.53, archZ], [0, 1, 0], 0.14, 0.042, {
      section: { ngon: 4 },
      color: CELESTIAL_GOLD_GLOW,
      bone: root,
      group: "archway",
      name: "archSunFinial",
    }),
    1.6,
  );

  // Two articulated hanging adeptus lanterns + talisman banners under the archway eaves
  for (const [idx, s] of ([-1, 1] as const).entries()) {
    const lx = plazaCenter[0] + s * 0.52;
    const ly = 2.34;
    const lanternJoint = b.joint(idx === 0 ? "shrineLanternR" : "shrineLanternL", {
      parent: root,
      at: [lx, ly, archZ],
      dir: [0, -1, 0],
      role: "hinge",
    });
    // Cord
    b.rod([lx, ly, archZ], [lx, ly - 0.1, archZ], 0.01, {
      sides: 4,
      color: GOLD_DARK,
      bone: lanternJoint,
      group: "archway",
    });
    // Lantern roof cap
    b.spike([lx, ly - 0.14, archZ], [0, 1, 0], 0.055, 0.065, {
      sides: 6,
      color: SLATE_FLAT,
      bone: lanternJoint,
      group: "archway",
    });
    // Glowing amber core
    glow(
      b.rod([lx, ly - 0.23, archZ], [lx, ly - 0.14, archZ], 0.044, {
        sides: 6,
        color: CELESTIAL_GOLD_GLOW,
        bone: lanternJoint,
        group: "archway",
      }),
      1.8,
    );
    // Lantern bottom base + hanging paper talisman card
    b.rod([lx, ly - 0.26, archZ], [lx, ly - 0.23, archZ], [0.03, 0.05], {
      sides: 6,
      color: GOLD_FLAT,
      bone: lanternJoint,
      group: "archway",
    });
    b.cards([frame([lx, ly - 0.26, archZ], [0, 1, 0])], TALISMAN_TEX, {
      size: [0.065, 0.16],
      lean: 180,
      flow: [0, 0, 1],
      bone: lanternJoint,
      group: "archway",
    });
  }

  // Weathered Broken Column & Fallen Drum on the left side of the plaza (+X)
  const brokenColX = 0.44;
  const brokenColZ = 0.02;
  b.frustumBox([brokenColX, 1.46, brokenColZ], [brokenColX, 1.56, brokenColZ], [0.18, 0.18], [0.15, 0.15], {
    color: SLATE_PAINT,
    bone: root,
    group: "ruins",
  });
  b.rod([brokenColX, 1.56, brokenColZ], [brokenColX, 1.94, brokenColZ], [0.068, 0.064], {
    sides: 8,
    color: ALABASTER_PAINT,
    bone: root,
    group: "ruins",
    name: "brokenColumnStump",
  });
  // Fallen column drum resting in the grass nearby
  b.rod([0.58, 1.5, 0.18], [0.74, 1.48, 0.28], 0.062, {
    sides: 8,
    color: ALABASTER_PAINT,
    bone: root,
    group: "ruins",
    name: "fallenColumnDrum",
  });

  // Intact Celestial Obelisk on the right side of the plaza (-X)
  const obeliskX = -0.48;
  const obeliskZ = -0.1;
  b.frustumBox([obeliskX, 1.46, obeliskZ], [obeliskX, 1.98, obeliskZ], [0.15, 0.15], [0.09, 0.09], {
    color: ALABASTER_PAINT,
    bone: root,
    group: "ruins",
    name: "celestialObelisk",
  });
  b.spike([obeliskX, 1.98, obeliskZ], [0, 1, 0], 0.14, 0.07, {
    section: { ngon: 4 },
    color: GOLD_PAINT,
    bone: root,
    group: "ruins",
  });
  glow(
    b.spike([obeliskX, 2.16, obeliskZ], [0, 1, 0], 0.09, 0.032, {
      section: { ngon: 4 },
      color: ANEMO_GLOW,
      bone: root,
      group: "ruins",
    }),
    1.5,
  );

  // -------------------------------------------------------------------------
  // 4. AQUEDUCT CHANNEL & CASCADING WATERFALL (y = 1.46 down to y = 0.13)
  // -------------------------------------------------------------------------

  // Carved stone aqueduct spillway running from the plaza edge to the front-left cliff lip
  const aqueductStart: V3 = [0.12, 1.46, 0.14];
  const aqueductLip: V3 = [0.22, 1.42, 0.58];
  b.frustumBox(aqueductStart, aqueductLip, [0.28, 0.08], [0.3, 0.08], {
    up: [0, 1, 0],
    color: ALABASTER_PAINT,
    bone: root,
    group: "waterfall",
    name: "aqueductTrough",
  });
  // Raised stone & gold aqueduct side curbs
  for (const s of [-1, 1]) {
    b.frustumBox(
      [aqueductStart[0] + s * 0.13, 1.48, aqueductStart[2]],
      [aqueductLip[0] + s * 0.14, 1.44, aqueductLip[2]],
      [0.045, 0.07],
      [0.05, 0.07],
      { up: [0, 1, 0], color: GOLD_PAINT, bone: root, group: "waterfall" },
    );
  }
  // Flowing water stream inside the aqueduct
  b.frustumBox([0.12, 1.47, 0.12], [0.22, 1.43, 0.59], [0.21, 0.065], [0.22, 0.065], {
    up: [0, 1, 0],
    color: WATERFALL_PAINT,
    bone: root,
    group: "waterfall",
    name: "aqueductWater",
  });

  // Mid-level projecting rock splash shelf at y = 0.78
  const ledgePos: V3 = [0.24, 0.78, 0.62];
  b.loft(
    [
      { at: [0.22, 0.58, 0.46], w: 0.12, h: 0.12 },
      { at: [0.24, 0.76, 0.58], w: 0.36, h: 0.28 },
      { at: [0.24, 0.82, 0.62], w: 0.32, h: 0.24 },
    ],
    {
      section: { ngon: 6 },
      caps: "flat",
      color: KARST_PAINT,
      bone: root,
      group: "waterfall",
      name: "waterfallSplashLedge",
    },
  );

  // Upper Waterfall Cascade (from aqueduct lip y = 1.43 to mid ledge y = 0.78)
  b.loft(
    [
      { at: [0.22, 1.43, 0.57], w: 0.22, h: 0.06 },
      { at: [0.23, 1.28, 0.63], w: 0.25, h: 0.07 },
      { at: [0.24, 1.04, 0.65], w: 0.28, h: 0.08 },
      { at: [0.24, 0.79, 0.63], w: 0.31, h: 0.09 },
    ],
    {
      sides: 8,
      caps: "round",
      color: WATERFALL_PAINT,
      bone: root,
      group: "waterfall",
      name: "upperWaterfallSheet",
    },
  );

  // Lower Waterfall Plunge (from mid ledge y = 0.78 down into the sacred pool at y = 0.13)
  b.loft(
    [
      { at: [0.24, 0.79, 0.64], w: 0.28, h: 0.08 },
      { at: [0.24, 0.56, 0.67], w: 0.31, h: 0.09 },
      { at: [0.24, 0.34, 0.68], w: 0.34, h: 0.1 },
      { at: [0.24, 0.13, 0.68], w: 0.38, h: 0.12 },
    ],
    {
      sides: 8,
      caps: "round",
      color: WATERFALL_PAINT,
      bone: root,
      group: "waterfall",
      name: "lowerWaterfallSheet",
    },
  );

  // Secondary thinner cascade off the left side of the mid ledge
  b.sweep(
    catmull([
      [0.36, 0.8, 0.58],
      [0.42, 0.62, 0.62],
      [0.45, 0.38, 0.63],
      [0.46, 0.13, 0.64],
    ]),
    [0.045, 0.065],
    {
      sides: 6,
      caps: "flat",
      color: WATERFALL_PAINT,
      bone: root,
      group: "waterfall",
      name: "sideWaterfallStream",
    },
  );

  // Glowing Hydro foam & energy ribbons running down the waterfall edges
  for (const s of [-1, 1]) {
    const foamCurve = catmull([
      [0.22 + s * 0.1, 1.43, 0.59],
      [0.24 + s * 0.12, 1.1, 0.66],
      [0.24 + s * 0.13, 0.8, 0.66],
      [0.24 + s * 0.14, 0.45, 0.7],
      [0.24 + s * 0.16, 0.14, 0.71],
    ]);
    glow(
      b.sweep(foamCurve, [0.018, 0.026], {
        sides: 5,
        caps: "flat",
        color: s > 0 ? FOAM_WHITE : HYDRO_GLOW,
        bone: root,
        group: "waterfall",
      }),
      1.35,
    );
  }

  // Frothy mist & splash crowns at the mid ledge and pool impact zone
  const mistPuffs: Array<{ at: V3; r: [number, number, number] }> = [
    { at: [0.24, 0.81, 0.68], r: [0.16, 0.07, 0.1] },
    { at: [0.14, 0.16, 0.68], r: [0.14, 0.07, 0.12] },
    { at: [0.26, 0.17, 0.73], r: [0.18, 0.08, 0.13] },
    { at: [0.38, 0.16, 0.67], r: [0.15, 0.07, 0.12] },
    { at: [0.24, 0.15, 0.6], r: [0.16, 0.06, 0.12] },
  ];
  for (const mp of mistPuffs) {
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 6), FOAM_WHITE, {
        at: mp.at,
        scale: mp.r,
        bone: root,
        group: "waterfall",
      }),
      1.2,
    );
  }

  // Stylized anime water splash crest cards at the waterfall plunge & mid-ledge
  const splashFrames = [
    frame([0.24, 0.14, 0.72], [0, 1, 0.25]),
    frame([0.12, 0.14, 0.69], [-0.2, 1, 0.2]),
    frame([0.38, 0.14, 0.68], [0.2, 1, 0.2]),
    frame([0.24, 0.8, 0.67], [0, 1, 0.3]),
  ];
  glow(
    b.cards(splashFrames, WATER_SPLASH_TEX, {
      size: [0.26, 0.22],
      lean: 18,
      flow: [0, 0, 1],
      cross: true,
      vary: 0.15,
      rng: rng(202),
      bone: root,
      group: "waterfall",
      name: "waterfallSplashCards",
    }),
    1.3,
  );

  // -------------------------------------------------------------------------
  // 5. SACRED TREES, CLIFF VINES & STORY PROPS (y = 1.15 .. 2.72)
  // -------------------------------------------------------------------------

  // A. Grand Sacred Golden-Ginkgo & Sakura Tree on the upper left cliff (+X, -Z)
  const treeBase: V3 = [0.48, 1.45, -0.22];
  // 4 Gnarled surface roots gripping the cliff edge
  const rootPaths: V3[][] = [
    [
      [0.48, 1.5, -0.22],
      [0.62, 1.45, -0.14],
      [0.74, 1.32, -0.06],
    ],
    [
      [0.48, 1.5, -0.22],
      [0.58, 1.44, -0.36],
      [0.68, 1.28, -0.46],
    ],
    [
      [0.48, 1.5, -0.22],
      [0.34, 1.46, -0.12],
      [0.24, 1.45, -0.04],
    ],
    [
      [0.48, 1.5, -0.22],
      [0.4, 1.45, -0.36],
      [0.32, 1.38, -0.48],
    ],
  ];
  for (const rp of rootPaths) {
    b.sweep(catmull(rp), [0.065, 0.02], {
      sides: 6,
      caps: "point",
      color: BARK_PAINT,
      bone: root,
      group: "sacredTree",
    });
  }

  // Sweeping gnarled main trunk
  const mainTrunkPath = catmull([
    treeBase,
    [0.54, 1.72, -0.24],
    [0.48, 2.02, -0.2],
    [0.36, 2.28, -0.14],
  ]);
  b.sweep(mainTrunkPath, [0.12, 0.085, 0.065, 0.045], {
    sides: 7,
    caps: "flat",
    color: BARK_PAINT,
    bone: root,
    group: "sacredTree",
    name: "sacredTreeTrunk",
  });

  // 4 Major boughs fanning out over the sanctuary ruins
  const boughPaths: V3[][] = [
    [
      [0.5, 1.92, -0.21],
      [0.68, 2.1, -0.12],
      [0.82, 2.24, -0.02],
    ],
    [
      [0.46, 2.04, -0.2],
      [0.58, 2.26, -0.34],
      [0.68, 2.42, -0.44],
    ],
    [
      [0.4, 2.18, -0.16],
      [0.22, 2.38, -0.1],
      [0.06, 2.48, -0.06],
    ],
    [
      [0.38, 2.24, -0.15],
      [0.44, 2.46, -0.18],
      [0.46, 2.6, -0.16],
    ],
  ];
  for (const bp of boughPaths) {
    b.sweep(catmull(bp), [0.055, 0.022], {
      sides: 6,
      caps: "flat",
      color: BARK_PAINT,
      bone: root,
      group: "sacredTree",
    });
  }

  // Rich cel-shaded canopy puffs (blending golden ginkgo and sakura coral tones)
  const mainCanopyPuffs: Array<{ at: V3; scale: [number, number, number]; sakura?: boolean }> = [
    { at: [0.82, 2.28, 0.0], scale: [0.28, 0.19, 0.26] },
    { at: [0.66, 2.44, -0.42], scale: [0.3, 0.2, 0.28], sakura: true },
    { at: [0.08, 2.5, -0.06], scale: [0.28, 0.19, 0.25] },
    { at: [0.44, 2.62, -0.16], scale: [0.34, 0.22, 0.3] },
    { at: [0.28, 2.56, -0.28], scale: [0.27, 0.18, 0.25], sakura: true },
    { at: [0.64, 2.42, -0.1], scale: [0.29, 0.19, 0.26] },
    { at: [0.48, 2.34, 0.06], scale: [0.24, 0.16, 0.22], sakura: true },
    { at: [0.26, 2.38, 0.04], scale: [0.22, 0.16, 0.2] },
  ];
  const canopyMeshes: THREE.Mesh[] = [];
  for (const cp of mainCanopyPuffs) {
    const part = b.part(new THREE.SphereGeometry(1, 10, 8), cp.sakura ? SAKURA_CANOPY_PAINT : GOLD_CANOPY_PAINT, {
      at: cp.at,
      scale: cp.scale,
      bone: root,
      group: "sacredTree",
    });
    canopyMeshes.push(part.mesh);
  }

  // Blossom & ginkgo leaf cards scattered across the sacred tree canopy
  const canopyHits = b.surface(canopyMeshes).scatter(42, {
    rng: rng(303),
    minDist: 0.11,
    filter: (h) => h.n.y > -0.25,
  });
  b.cards(canopyHits, FOLIAGE_BLOSSOM_TEX, {
    size: [0.18, 0.18],
    lean: 35,
    vary: 0.25,
    spin: 180,
    rng: rng(304),
    bone: root,
    group: "sacredTree",
    name: "sacredTreeBlossomCards",
  });

  // B. Secondary Windswept Spirit-Jade Pine on the lower terrace (-X, +Z)
  const pineBase: V3 = [-0.82, 1.17, 0.44];
  const pineTrunk = catmull([
    pineBase,
    [-0.9, 1.38, 0.48],
    [-0.84, 1.62, 0.42],
    [-0.74, 1.82, 0.36],
  ]);
  b.sweep(pineTrunk, [0.08, 0.055, 0.038, 0.024], {
    sides: 6,
    caps: "flat",
    color: BARK_PAINT,
    bone: root,
    group: "jadePine",
    name: "jadePineTrunk",
  });
  b.sweep(
    catmull([
      [-0.86, 1.5, 0.45],
      [-1.02, 1.62, 0.52],
      [-1.12, 1.68, 0.56],
    ]),
    [0.04, 0.018],
    { sides: 5, caps: "flat", color: BARK_PAINT, bone: root, group: "jadePine" },
  );

  const jadePads: Array<{ at: V3; scale: [number, number, number] }> = [
    { at: [-1.1, 1.71, 0.56], scale: [0.24, 0.12, 0.22] },
    { at: [-0.86, 1.76, 0.44], scale: [0.26, 0.13, 0.24] },
    { at: [-0.72, 1.86, 0.34], scale: [0.28, 0.14, 0.25] },
    { at: [-0.62, 1.74, 0.26], scale: [0.2, 0.11, 0.19] },
  ];
  for (const jp of jadePads) {
    b.part(new THREE.SphereGeometry(1, 10, 7), JADE_CANOPY_PAINT, {
      at: jp.at,
      scale: jp.scale,
      bone: root,
      group: "jadePine",
    });
  }

  // C. Hanging Cliff Vines & Foliage Cards trailing off the island rim
  const vineSpots: Array<[number, number, number]> = [
    [-0.58, 1.38, -0.36],
    [-0.22, 1.39, -0.68],
    [0.34, 1.38, -0.62],
    [0.72, 1.38, -0.18],
    [0.64, 1.38, 0.36],
    [-0.14, 1.39, 0.66],
    [-0.92, 1.13, 0.18],
    [-0.64, 1.13, 0.68],
  ];
  b.cards(
    vineSpots.map(([vx, vy, vz]) => frame([vx, vy, vz], [0, 1, 0])),
    VINE_LEAF_TEX,
    {
      size: [0.18, 0.34],
      lean: 175,
      flow: (f) => [f.at.x, 0, f.at.z],
      vary: 0.22,
      rng: rng(404),
      bone: root,
      group: "foliage",
      name: "hangingCliffVines",
    },
  );

  // D. Genshin Impact Story Props: Exquisite Treasure Chest, Teleport Waypoint & Seelie Court
  // 1) Exquisite Treasure Chest near the broken column (x = 0.46, y = 1.46, z = 0.24)
  const chestPos: V3 = [0.46, 1.46, 0.24];
  b.frustumBox(chestPos, [chestPos[0], chestPos[1] + 0.11, chestPos[2]], [0.22, 0.14], [0.23, 0.15], {
    up: [0, 0, 1],
    color: CRIMSON_FLAT,
    bone: root,
    group: "props",
    name: "treasureChestBox",
  });
  b.frustumBox(
    [chestPos[0], chestPos[1] + 0.11, chestPos[2]],
    [chestPos[0], chestPos[1] + 0.16, chestPos[2]],
    [0.24, 0.16],
    [0.19, 0.12],
    {
      up: [0, 0, 1],
      color: GOLD_PAINT,
      bone: root,
      group: "props",
      name: "treasureChestLid",
    },
  );
  glow(
    b.part(new THREE.BoxGeometry(0.045, 0.045, 0.025), ANEMO_GLOW, {
      at: [chestPos[0], chestPos[1] + 0.1, chestPos[2] + 0.075],
      bone: root,
      group: "props",
      name: "chestLockSigil",
    }),
    1.5,
  );

  // 2) Sacred Teleport Waypoint Pedestal on the secondary terrace (-0.64, 1.18, 0.22)
  const wpPos: V3 = [-0.64, 1.18, 0.22];
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.07, 0.05, "sharp"],
      [0.045, 0.18, "sharp"],
      [0.075, 0.23, "sharp"],
      [0, 0.23],
    ],
    {
      at: wpPos,
      segments: 6,
      color: ALABASTER_PAINT,
      bone: root,
      group: "props",
      name: "waypointPedestal",
    },
  );
  glow(
    b.spike([wpPos[0], wpPos[1] + 0.26, wpPos[2]], [0, 1, 0], 0.12, 0.045, {
      section: { ngon: 4 },
      color: WAYPOINT_GLOW,
      bone: root,
      group: "props",
      name: "waypointCrown",
    }),
    1.7,
  );

  // 3) Seelie Court Pillar with glowing wisp orb by the bridge entrance (-0.24, 1.46, 0.42)
  const seeliePos: V3 = [-0.24, 1.46, 0.42];
  b.rod(seeliePos, [seeliePos[0], seeliePos[1] + 0.2, seeliePos[2]], [0.055, 0.04], {
    sides: 6,
    color: SLATE_PAINT,
    bone: root,
    group: "props",
    name: "seelieStand",
  });
  b.sweep(
    arc([seeliePos[0], seeliePos[1] + 0.25, seeliePos[2]], [seeliePos[0] + 0.055, seeliePos[1] + 0.25, seeliePos[2]], [0, 0, 1], 290),
    0.015,
    {
      sides: 5,
      caps: "point",
      color: GOLD_PAINT,
      bone: root,
      group: "props",
      name: "seelieCradle",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.036, 8, 6), ANEMO_GLOW, {
      at: [seeliePos[0], seeliePos[1] + 0.25, seeliePos[2]],
      bone: root,
      group: "props",
      name: "seelieOrb",
    }),
    1.8,
  );

  // Scattered mossy garden boulders & golden blossom tufts on the island terraces
  const boulderSpots: Array<{ at: V3; r: [number, number, number] }> = [
    { at: [-0.52, 1.48, -0.26], r: [0.1, 0.07, 0.09] },
    { at: [0.62, 1.48, -0.02], r: [0.09, 0.06, 0.08] },
    { at: [0.04, 1.47, 0.52], r: [0.09, 0.07, 0.08] },
    { at: [-0.88, 1.19, 0.24], r: [0.08, 0.06, 0.07] },
  ];
  for (const bs of boulderSpots) {
    b.part(new THREE.SphereGeometry(1, 7, 5), KARST_PAINT, {
      at: bs.at,
      scale: bs.r,
      bone: root,
      group: "props",
    });
  }

  // Ground blossom & windwheel flower tufts on the turf
  const groundFlowerFrames = [
    frame([-0.42, 1.47, 0.28], [0, 1, 0]),
    frame([0.34, 1.47, 0.42], [0, 1, 0]),
    frame([-0.18, 1.47, -0.52], [0, 1, 0]),
    frame([0.56, 1.47, -0.38], [0, 1, 0]),
    frame([-0.72, 1.19, 0.52], [0, 1, 0]),
    frame(offset([0.38, 1.47, 0.1], [0, 1, 0], 0.01), [0, 1, 0]),
  ];
  b.cards(groundFlowerFrames, FOLIAGE_BLOSSOM_TEX, {
    size: [0.14, 0.14],
    lean: 25,
    cross: true,
    vary: 0.2,
    spin: 180,
    rng: rand,
    bone: root,
    group: "foliage",
    name: "meadowFlowerTufts",
  });

  return b.root;
}
