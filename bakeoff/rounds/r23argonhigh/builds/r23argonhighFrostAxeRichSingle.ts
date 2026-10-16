import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, lerp, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { arc, bezier, catmull, polyline } from "../../../../src/path";
import { cells, countershade, gradient, grain, mix, mottle, paint, patches, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "Freljordian League of Legends frost-forged great-axe with a glowing True Ice heart core, asymmetrical crescent executioner blade and twin glacier-breaker flukes, runes, winter-wolf fur collar, and shattered runic ice shrine plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette — League of Legends Freljord / True Ice high-contrast materials
// ---------------------------------------------------------------------------
const COL_ABYSS_STEEL = "#141d2e";
const COL_DARK_IRON = "#1f2d44";
const COL_STEEL_MID = "#344968";
const COL_STEEL_EDGE = "#5c7ca3";

const COL_BRONZE_DARK = "#593e1c";
const COL_GOLD_MID = "#b88736";
const COL_GOLD_BRIGHT = "#f2c665";
const COL_GOLD_HIGHLIGHT = "#ffe599";

const COL_ICE_ABYSS = "#0b2b54";
const COL_ICE_DEEP = "#13528a";
const COL_ICE_MID = "#2389c9";
const COL_ICE_BRIGHT = "#52d1f7";
const COL_ICE_FROST = "#b8f4ff";
const COL_ICE_WHITE = "#ebfdff";

const COL_GLOW_CYAN = "#45f3ff";
const COL_GLOW_CORE = "#b8ffff";
const COL_GLOW_DEEP = "#16b8f5";
const COL_GLOW_RUNE = "#73f7ff";

const COL_LEATHER_DARK = "#2d1814";
const COL_LEATHER_WARM = "#542a20";
const COL_LEATHER_EDGE = "#7d4332";

const COL_FUR_SHADOW = "#6d89a8";
const COL_FUR_MID = "#b5cce0";
const COL_FUR_SNOW = "#e8f3fa";

const COL_BASALT_DARK = "#121722";
const COL_BASALT_MID = "#222b3d";
const COL_SNOW_DRIFT = "#cfe8f7";

// ---------------------------------------------------------------------------
// Hand-painted League of Legends style procedural surface paints
// ---------------------------------------------------------------------------

/** True Ice blade & crystal paint: faceted Worley crystal cells, vertical energy gradient, and crisp icy rim frost. */
const PAINT_TRUE_ICE = paint((p, n) => {
  const c1 = cells(p, 0.085, 17);
  const c2 = cells(p, 0.042, 53);
  const facetBorder = smoothstep(0.08, 0.0, c1.d2 - c1.d1);
  const subBorder = smoothstep(0.06, 0.0, c2.d2 - c2.d1);
  const radialX = Math.min(Math.abs(p.x) / 0.52, 1);
  const heightBias = smoothstep(0.75, 1.65, p.y);

  // Inner blade near the housing is deep sapphire; outer cutting edge transitions to bright cyan and white frost
  let base = mix(COL_ICE_ABYSS, COL_ICE_DEEP, smoothstep(0.08, 0.26, radialX));
  base = mix(base, COL_ICE_MID, smoothstep(0.22, 0.52, radialX) * 0.85 + 0.15 * c1.id);
  base = mix(base, COL_ICE_BRIGHT, smoothstep(0.48, 0.78, radialX));
  base = mix(base, COL_ICE_FROST, smoothstep(0.74, 0.94, radialX));

  // Normal-based beveled rim highlight (simulates baked hand-painted edge bevels)
  const rim = Math.max(0, 1 - Math.abs(n.z));
  base = mix(base, COL_ICE_FROST, smoothstep(0.55, 0.92, rim) * 0.65);
  base = mix(base, COL_ICE_WHITE, facetBorder * 0.55 + subBorder * 0.28 + smoothstep(0.88, 0.99, radialX) * 0.6);
  base = mix(base, COL_ICE_DEEP, (1 - heightBias) * 0.18);
  return base;
});

/** Glacier ice paint for the shattered shrine plinth and base crystals. */
const PAINT_GLACIER_BASE = paint((p, n) => {
  const c = cells(p, 0.075, 91);
  const topSnow = smoothstep(0.35, 0.82, n.y);
  const height = smoothstep(0.02, 0.34, p.y);
  const edge = smoothstep(0.07, 0.0, c.d2 - c.d1);
  let col = mix(COL_ICE_ABYSS, COL_ICE_MID, height * 0.75 + c.id * 0.25);
  col = mix(col, COL_ICE_BRIGHT, edge * 0.55 + height * 0.35);
  col = mix(col, COL_ICE_WHITE, topSnow * 0.5 + edge * 0.35);
  return col;
});

/** Hand-painted dark Freljordian forged steel with brushed grain, cold shadow, and top-lit edge sheen. */
const PAINT_DARK_STEEL = cel(
  countershade(
    grain(COL_STEEL_MID, COL_STEEL_EDGE, { size: 0.025, axis: "y", seed: 11 }),
    grain(COL_ABYSS_STEEL, COL_DARK_IRON, { size: 0.025, axis: "y", seed: 19 }),
    { level: 0.05, soft: 0.45 },
  ),
  COL_ABYSS_STEEL,
  { threshold: -0.05 },
);

/** Weathered antique gold & bronze trim with warm shadow and bright upward highlights. */
const PAINT_ROYAL_GOLD = paint((p, n) => {
  const gr = grain(COL_GOLD_MID, COL_GOLD_BRIGHT, { size: 0.018, axis: "x", seed: 31 }).at(p, n);
  const upLit = smoothstep(-0.2, 0.65, n.y * 0.7 + Math.abs(n.z) * 0.3);
  const dark = mix(COL_BRONZE_DARK, gr, upLit);
  const spec = smoothstep(0.58, 0.9, n.y * 0.65 + Math.abs(n.x) * 0.35);
  return mix(dark, COL_GOLD_HIGHLIGHT, spec * 0.7);
});

/** Wrapped crimson-brown winter hide grip with spiral strap bands. */
const PAINT_LEATHER_GRIP = paint((p, n, s) => {
  const bandWave = Math.sin((p.y * 58 + s[1] * 0.035) * Math.PI);
  const seam = smoothstep(0.75, 0.96, Math.abs(bandWave));
  const wear = smoothstep(0.2, 0.85, Math.abs(n.x) * 0.6 + Math.abs(n.z) * 0.4);
  const base = mix(COL_LEATHER_WARM, COL_LEATHER_EDGE, wear * 0.55);
  return mix(base, COL_LEATHER_DARK, seam * 0.75);
});

/** Winter wolf fur pelt with soft snowy tips and cool slate undercoat. */
const PAINT_WOLF_FUR = countershade(
  mottle(COL_FUR_SNOW, COL_FUR_MID, { size: 0.035, contrast: 1.4, seed: 73 }),
  mottle(COL_FUR_MID, COL_FUR_SHADOW, { size: 0.03, contrast: 1.2, seed: 89 }),
  { level: -0.1, soft: 0.4 },
);

/** Basalt runic stone plinth with cracked paving and frost rime on upward faces. */
const PAINT_FROST_BASALT = paint((p, n) => {
  const stone = patches(COL_BASALT_DARK, [COL_BASALT_MID, "#1b2436", "#29364f"], {
    size: 0.09,
    gap: 0.12,
    seed: 41,
  }).at(p, n);
  const frostRim = smoothstep(0.42, 0.85, n.y) * smoothstep(0.02, 0.16, p.y);
  return mix(stone, COL_SNOW_DRIFT, frostRim * 0.65);
});

/** Haft dark ironwood & frost-veined shaft paint. */
const PAINT_HAFT_WOOD = gradient(
  grain(COL_ABYSS_STEEL, COL_DARK_IRON, { size: 0.015, axis: "y", seed: 103 }),
  grain(COL_DARK_IRON, COL_STEEL_MID, { size: 0.015, axis: "y", seed: 107 }),
  [0, 0.2, 0],
  [0, 1.35, 0],
);

// ---------------------------------------------------------------------------
// SVG Textures (Runic sigils, blade frost-lightning veins, fur & aura cards)
// ---------------------------------------------------------------------------

/** Glowing Freljordian angular frost rune seal. */
const TEX_FROST_RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <polygon points="64,6 116,36 116,92 64,122 12,92 12,36" fill="none" stroke="#36e2ff" stroke-width="5"/>
    <polygon points="64,18 104,42 104,86 64,110 24,86 24,42" fill="#0b365c" fill-opacity="0.7" stroke="#9cfbff" stroke-width="3.5"/>
    <path d="M64,14 L64,114 M32,38 L64,64 L96,38 M32,90 L64,64 L96,90 M44,26 L64,46 L84,26 M44,102 L64,82 L84,102"
      stroke="#e6ffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <polygon points="64,46 78,64 64,82 50,64" fill="#bffcff" stroke="#ffffff" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

/** Branching glowing frost-lightning vein inlay for the main crescent blade. */
const TEX_BLADE_VEIN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256">
    <path d="M18,128 L58,112 L94,64 L114,24 M58,112 L88,118 L116,96 M18,128 L62,148 L96,196 L112,232 M62,148 L92,150 L114,174"
      stroke="#19bfff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M18,128 L58,112 L94,64 L114,24 M58,112 L88,118 L116,96 M18,128 L62,148 L96,196 L112,232 M62,148 L92,150 L114,174"
      stroke="#d6ffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <polygon points="22,114 40,128 22,142 8,128" fill="#e8ffff" stroke="#2ee8ff" stroke-width="4"/>
    <circle cx="58" cy="112" r="6" fill="#ffffff"/>
    <circle cx="62" cy="148" r="6" fill="#ffffff"/>
    <circle cx="94" cy="64" r="5" fill="#bffcff"/>
    <circle cx="96" cy="196" r="5" fill="#bffcff"/>
  </svg>`,
  { size: 256 },
);

/** Stylized winter-wolf fur tuft card texture. */
const TEX_FUR_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <path d="M8,94 Q12,52 32,4 Q52,52 56,94 Z" fill="#6d89a8"/>
    <path d="M14,94 Q18,54 32,10 Q46,54 50,94 Z" fill="#b7d0e6"/>
    <path d="M21,92 Q25,56 32,18 Q39,56 43,92 Z" fill="#ecf7ff"/>
  </svg>`,
  { size: 128 },
);

/** Glowing crystalline frost-shard & arcane mist plume card texture. */
const TEX_FROST_SHARD_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <polygon points="32,4 52,48 42,122 22,122 12,48" fill="#18a8eb"/>
    <polygon points="32,10 45,50 37,118 27,118 19,50" fill="#70f3ff"/>
    <polygon points="32,18 39,52 32,106 25,52" fill="#ecffff"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "frostAxe", detail: 0.75, paintSize: 1024 });
  const rand = rng(404);

  // =========================================================================
  // 1. SKELETON & ARTICULATED JOINTS
  // =========================================================================
  // Root joint at the frozen stone & glacier shrine plinth
  const plinthRoot = b.joint("plinthRoot", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    group: "plinth",
  });

  // Main axe shaft joint (allows the weapon to be posed or lifted from the shrine)
  const axeRoot = b.joint("axeRoot", {
    parent: plinthRoot,
    at: [0, 0.2, 0],
    dir: [0, 1, 0],
    group: "haft",
    role: "hinge",
  });

  // Hanging pommel talisman & winter-wolf tail chain (3 articulated bones)
  const tasselPath = catmull([
    [-0.04, 0.2, 0.03],
    [-0.12, 0.16, 0.06],
    [-0.19, 0.11, 0.08],
    [-0.24, 0.05, 0.1],
  ]);
  const tasselChain = b.chain("tassel", tasselPath, {
    parent: axeRoot,
    names: ["tassel1", "tassel2", "tassel3"],
    group: "tassel",
    role: "tail",
  });

  // Upper axe head housing & True Ice heart core joint
  const axeHead = b.joint("axeHead", {
    parent: axeRoot,
    at: [0, 1.04, 0],
    dir: [0, 1, 0],
    group: "head",
    role: "hinge",
  });

  // Primary crescent executioner blade (+X side)
  const bladeMainL = b.joint("bladeMainL", {
    parent: axeHead,
    at: [0.09, 1.27, 0],
    dir: [1, 0, 0],
    group: "bladeMain",
    role: "hinge",
  });

  // Asymmetric twin-fluke glacier-breaker counter-blade (-X side)
  const bladeBackR = b.joint("bladeBackR", {
    parent: axeHead,
    at: [-0.09, 1.27, 0],
    dir: [-1, 0, 0],
    group: "bladeBack",
    role: "hinge",
  });

  // Articulated upper arcane frost-crest wing shards
  const shardWingL = b.joint("shardWingL", {
    parent: axeHead,
    at: [0.14, 1.48, 0],
    dir: [0.65, 0.76, 0],
    group: "crest",
    role: "hinge",
  });
  const shardWingR = b.joint("shardWingR", {
    parent: axeHead,
    at: [-0.14, 1.48, 0],
    dir: [-0.65, 0.76, 0],
    group: "crest",
    role: "hinge",
  });

  // =========================================================================
  // 2. SHATTERED RUNIC ICE & BASALT SHRINE PLINTH (y = 0.0 to 0.30)
  // =========================================================================
  // Lower octagonal basalt stone pedestal resting cleanly at y = 0
  const baseBottomOutline: OutlinePoint[] = [
    [-0.36, -0.26],
    [0.36, -0.26],
    [0.46, -0.11],
    [0.46, 0.11],
    [0.36, 0.26],
    [-0.36, 0.26],
    [-0.46, 0.11],
    [-0.46, -0.11],
  ];
  b.extrude(baseBottomOutline, {
    bone: plinthRoot,
    at: [0, 0.035, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.012,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_FROST_BASALT,
    group: "plinth",
    name: "plinthBaseTier1",
  });

  // Upper stepped runic stone dais
  const baseUpperOutline: OutlinePoint[] = [
    [-0.29, -0.2],
    [0.29, -0.2],
    [0.37, -0.08],
    [0.37, 0.08],
    [0.29, 0.2],
    [-0.29, 0.2],
    [-0.37, 0.08],
    [-0.37, -0.08],
  ];
  b.extrude(baseUpperOutline, {
    bone: plinthRoot,
    at: [0, 0.095, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    bevel: 0.01,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_FROST_BASALT,
    group: "plinth",
    name: "plinthBaseTier2",
  });

  // Glowing recessed cyan rune channel ring around the plinth steps
  const runeChannelPts: V3[] = [
    [-0.31, 0.072, -0.215],
    [0.31, 0.072, -0.215],
    [0.39, 0.072, -0.09],
    [0.39, 0.072, 0.09],
    [0.31, 0.072, 0.215],
    [-0.31, 0.072, 0.215],
    [-0.39, 0.072, 0.09],
    [-0.39, 0.072, -0.09],
  ];
  glow(
    b.sweep(polyline(runeChannelPts, { closed: true }), 0.009, COL_GLOW_CYAN, {
      bone: plinthRoot,
      sides: 5,
      group: "plinth",
      name: "plinthRuneChannel",
    }),
    1.6,
  );

  // Heavy forged dark-iron & gold buttress clamps around the 6 corners of the plinth
  const buttressAngles = [25, 90, 155, 205, 270, 335];
  buttressAngles.forEach((deg, idx) => {
    const rad = deg * DEG;
    const rx = Math.cos(rad) * 0.37;
    const rz = Math.sin(rad) * 0.27;
    const outDir: V3 = [Math.cos(rad), 0, Math.sin(rad)];
    const inPt: V3 = [rx * 0.76, 0.11, rz * 0.76];
    const outPt: V3 = [rx * 1.06, 0.02, rz * 1.06];

    b.frustumBox(inPt, outPt, [0.065, 0.055], [0.085, 0.04], {
      bone: plinthRoot,
      color: PAINT_DARK_STEEL,
      group: "plinth",
      name: `plinthButtress${idx}`,
    });

    // Gold trim cap & glowing rune stud on each buttress
    const capPt = lerp(inPt, outPt, 0.35);
    b.part(new THREE.BoxGeometry(0.072, 0.026, 0.055), PAINT_ROYAL_GOLD, {
      bone: plinthRoot,
      at: [capPt.x, capPt.y + 0.022, capPt.z],
      dir: outDir,
      axis: "z",
      group: "plinth",
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.016, 0), COL_GLOW_CYAN, {
        bone: plinthRoot,
        at: [capPt.x, capPt.y + 0.038, capPt.z],
        group: "plinth",
      }),
      1.8,
    );
  });

  // Shattered True Ice Anvil blocks split down the center where the axe is planted
  for (const s of [1, -1] as const) {
    const sideTag = s > 0 ? "L" : "R";
    const anvilOutline: OutlinePoint[] = [
      [0.02, 0.08],
      [0.24, 0.08],
      [0.28, 0.16],
      [0.21, 0.27],
      [0.11, 0.31],
      [0.03, 0.24],
    ];
    b.extrude(anvilOutline, {
      bone: plinthRoot,
      at: [0, 0, 0],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.28, 0.16],
      bevel: 0.012,
      smoothing: 0,
      detail: 0.5,
      color: PAINT_GLACIER_BASE,
      group: "plinth",
      name: `glacierAnvil${sideTag}`,
    });

    // Secondary jagged glacier crag behind & in front of the anvil
    for (const fz of [1, -1] as const) {
      const cragBase: V3 = [s * 0.16, 0.09, fz * 0.12];
      const cragTip: V3 = [s * 0.25, 0.29 + (fz > 0 ? 0.03 : 0.06), fz * 0.18];
      b.sweep([cragBase, cragTip], [0.075, 0.012], PAINT_GLACIER_BASE, {
        bone: plinthRoot,
        section: { ngon: 5 },
        caps: { start: "flat", end: "point" },
        group: "plinth",
      });
    }
  }

  // Blazing cyan magma-like frost fissure running down the cleft between the glacier anvil halves
  glow(
    b.frustumBox([0, 0.12, -0.15], [0, 0.23, 0.15], [0.055, 0.09], [0.045, 0.11], {
      bone: plinthRoot,
      color: COL_GLOW_CYAN,
      group: "plinth",
      name: "anvilFissureGlow",
    }),
    2.0,
  );

  // Glowing runic seals on the front and back of the plinth
  for (const fz of [1, -1] as const) {
    glow(
      b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
        bone: plinthRoot,
        at: [0, 0.145, fz * 0.175],
        dir: [0, 0.45, fz * 0.89],
        axis: "z",
        texture: TEX_FROST_RUNE,
        group: "plinth",
      }),
      1.8,
    );
  }

  // Ring of 12 jagged True Ice crystal spires erupting from the plinth around the axe
  const crystalRingSpecs: Array<{ x: number; z: number; tx: number; ty: number; tz: number; r: number; glowTip: boolean }> = [
    { x: 0.26, z: 0.04, tx: 0.38, ty: 0.44, tz: 0.07, r: 0.046, glowTip: true },
    { x: -0.25, z: 0.05, tx: -0.36, ty: 0.41, tz: 0.08, r: 0.044, glowTip: true },
    { x: 0.21, z: -0.11, tx: 0.31, ty: 0.37, tz: -0.17, r: 0.038, glowTip: false },
    { x: -0.22, z: -0.1, tx: -0.33, ty: 0.39, tz: -0.16, r: 0.04, glowTip: false },
    { x: 0.12, z: 0.15, tx: 0.18, ty: 0.33, tz: 0.23, r: 0.034, glowTip: true },
    { x: -0.13, z: 0.14, tx: -0.19, ty: 0.31, tz: 0.22, r: 0.032, glowTip: false },
    { x: 0.11, z: -0.15, tx: 0.16, ty: 0.35, tz: -0.24, r: 0.035, glowTip: true },
    { x: -0.11, z: -0.16, tx: -0.17, ty: 0.34, tz: -0.25, r: 0.034, glowTip: true },
    { x: 0.31, z: 0.14, tx: 0.41, ty: 0.26, tz: 0.2, r: 0.03, glowTip: false },
    { x: -0.3, z: 0.15, tx: -0.39, ty: 0.25, tz: 0.21, r: 0.028, glowTip: false },
    { x: 0.3, z: -0.16, tx: 0.39, ty: 0.24, tz: -0.22, r: 0.028, glowTip: false },
    { x: -0.29, z: -0.16, tx: -0.38, ty: 0.25, tz: -0.22, r: 0.029, glowTip: false },
  ];
  crystalRingSpecs.forEach((cr, idx) => {
    const basePt: V3 = [cr.x, 0.09, cr.z];
    const midPt = lerp(basePt, [cr.tx, cr.ty, cr.tz], 0.65);
    const tipPt: V3 = [cr.tx, cr.ty, cr.tz];
    b.sweep([basePt, midPt], [cr.r, cr.r * 0.58], PAINT_TRUE_ICE, {
      bone: plinthRoot,
      section: { ngon: 6 },
      caps: "flat",
      group: "plinth",
      name: `plinthCrystalBase${idx}`,
    });
    const tipSweep = b.sweep([midPt, tipPt], [cr.r * 0.58, 0], cr.glowTip ? COL_GLOW_CYAN : PAINT_TRUE_ICE, {
      bone: plinthRoot,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      group: "plinth",
      name: `plinthCrystalTip${idx}`,
    });
    if (cr.glowTip) glow(tipSweep, 1.5);
  });

  // Sculpted snowdrifts & shattered runic stone slabs around the base perimeter
  const snowSpots: Array<[number, number, number, number, number]> = [
    [0.24, 0.11, 0.19, 0.09, 0.035],
    [-0.23, 0.11, 0.18, 0.085, 0.032],
    [0.25, 0.11, -0.18, 0.09, 0.034],
    [-0.24, 0.11, -0.19, 0.085, 0.032],
    [0, 0.11, 0.21, 0.11, 0.03],
    [0, 0.11, -0.21, 0.11, 0.03],
  ];
  for (const [sx, sy, sz, rw, rh] of snowSpots) {
    b.part(new THREE.DodecahedronGeometry(1, 0), COL_SNOW_DRIFT, {
      bone: plinthRoot,
      at: [sx, sy, sz],
      scale: [rw, rh, rw * 0.75],
      flat: true,
      group: "plinth",
    });
  }

  // =========================================================================
  // 3. POMMEL, HAFT, LEATHER WRAPS & SWINGING WOLF-TAIL TALISMAN
  // =========================================================================
  // Lower True Ice pommel crusher spike biting down into the glacier fissure
  glow(
    b.spike([0, 0.24, 0], [0, 0.09, 0], null, 0.044, COL_GLOW_CYAN, {
      bone: axeRoot,
      section: { ngon: 6 },
      group: "haft",
      name: "pommelIceSpike",
    }),
    1.7,
  );

  // Heavy horned Freljordian pommel housing (y = 0.20 to 0.31)
  b.lathe(
    [
      [0, 0],
      [0.055, 0.01],
      [0.068, 0.035],
      [0.052, 0.065],
      [0.064, 0.095],
      [0.042, 0.115],
      [0, 0.12],
    ],
    {
      bone: axeRoot,
      at: [0, 0.2, 0],
      segments: 8,
      smoothing: 0,
      color: PAINT_DARK_STEEL,
      group: "haft",
      name: "pommelCap",
    },
  );

  // Twin curved gold pommel horns + glowing frost gems on the pommel
  for (const s of [1, -1] as const) {
    const hornCurve = bezier(
      [s * 0.042, 0.25, 0],
      [s * 0.095, 0.24, 0],
      [s * 0.125, 0.28, 0],
      [s * 0.105, 0.33, 0],
    );
    b.sweep(hornCurve, [0.022, 0.004], PAINT_ROYAL_GOLD, {
      bone: axeRoot,
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      group: "haft",
    });

    // Glowing cyan cabochon gems on front/back of pommel
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), COL_GLOW_CORE, {
        bone: axeRoot,
        at: [0, 0.255, s * 0.058],
        scale: [0.9, 1.3, 0.6],
        group: "haft",
      }),
      2.0,
    );
  }

  // Heavy bronze pommel ring on the -X/+Z side anchoring the swinging talisman
  const pommelRingPath = arc([-0.045, 0.205, 0.025], [-0.045, 0.23, 0.025], [0, 0, 1], 360);
  b.sweep(pommelRingPath, 0.008, PAINT_ROYAL_GOLD, {
    bone: axeRoot,
    sides: 6,
    group: "tassel",
    name: "pommelRing",
  });

  // Swinging braided cord, gold rune-beads, glowing ice charm, and wolf-fur tail along `tasselChain`
  b.sweep(tasselChain, [0.012, 0.008], COL_LEATHER_DARK, {
    sides: 6,
    group: "tassel",
    name: "tasselCord",
  });

  // Gold beads & lush wolf-fur tail tuft on the tassel joints
  b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.024, 6), PAINT_ROYAL_GOLD, {
    bone: tasselChain.joints[0],
    at: tasselChain.joints[0].at,
    dir: tasselChain.joints[0].axis,
    group: "tassel",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 0), COL_GLOW_CYAN, {
      bone: tasselChain.joints[1],
      at: tasselChain.joints[1].at,
      scale: [0.8, 1.4, 0.8],
      group: "tassel",
      name: "tasselIceCharm",
    }),
    1.8,
  );
  // Wolf-fur tail volume on tassel2 -> tassel3
  const furTailEnd = offset(tasselChain.joints[2].at, [-0.5, -0.6, 0.3], 0.055);
  b.capsule(tasselChain.joints[1].at, furTailEnd, [0.026, 0.038], PAINT_WOLF_FUR, {
    bone: tasselChain.joints[2],
    sides: 7,
    group: "tassel",
    name: "tasselWolfTail",
  });
  b.spike(furTailEnd, [-0.45, -0.75, 0.3], 0.045, 0.032, COL_ICE_WHITE, {
    bone: tasselChain.joints[2],
    sides: 6,
    group: "tassel",
  });

  // Main Haft Core (y = 0.28 to 1.06): heroic contoured octagonal shaft
  const haftSpine = catmull([
    [0, 0.28, 0],
    [0, 0.52, 0.008],
    [0, 0.78, -0.006],
    [0, 1.06, 0],
  ]);
  b.sweep(
    haftSpine,
    (t) => {
      const profile = 0.033 + 0.008 * Math.sin(t * Math.PI) + 0.01 * smoothstep(0.75, 1.0, t);
      return [profile * 0.86, profile * 1.12];
    },
    PAINT_HAFT_WOOD,
    {
      bone: axeRoot,
      section: { ngon: 8 },
      caps: "flat",
      group: "haft",
      name: "haftMainShaft",
    },
  );

  // Two leather grip zones along the haft (lower grip: 0.33..0.56, upper grip: 0.65..0.90)
  const gripRanges: Array<[number, number, string]> = [
    [0.33, 0.56, "lowerGrip"],
    [0.65, 0.9, "upperGrip"],
  ];
  for (const [y0, y1, gName] of gripRanges) {
    b.sweep(
      [
        [0, y0, 0],
        [0, (y0 + y1) / 2, 0],
        [0, y1, 0],
      ],
      (t) => {
        const swell = 1 + 0.1 * Math.sin(t * Math.PI);
        return [0.034 * swell, 0.042 * swell];
      },
      PAINT_LEATHER_GRIP,
      {
        bone: axeRoot,
        sides: 8,
        caps: "flat",
        group: "haft",
        name: gName,
      },
    );

    // Sculpted criss-cross leather strap rings along each grip
    const strapCount = 5;
    for (let i = 0; i < strapCount; i++) {
      const sy = y0 + ((y1 - y0) * (i + 0.5)) / strapCount;
      const tilt = (i % 2 === 0 ? 1 : -1) * 0.012;
      const loopPts: V3[] = [
        [0, sy + tilt, 0.045],
        [0.037, sy, 0],
        [0, sy - tilt, -0.045],
        [-0.037, sy, 0],
      ];
      b.sweep(catmull(loopPts, { closed: true }), 0.0055, COL_LEATHER_EDGE, {
        bone: axeRoot,
        sides: 5,
        group: "haft",
      });
    }
  }

  // Heavy forged gold & dark-steel haft ferrules (collar rings at y = 0.32, 0.57, 0.64, 0.91)
  const ferruleHeights = [0.32, 0.57, 0.64, 0.91];
  ferruleHeights.forEach((fy, idx) => {
    b.lathe(
      [
        [0, -0.022],
        [0.048, -0.02],
        [0.056, 0],
        [0.048, 0.02],
        [0, 0.022],
      ],
      {
        bone: axeRoot,
        at: [0, fy, 0],
        segments: 8,
        smoothing: 0,
        color: idx % 2 === 0 ? PAINT_ROYAL_GOLD : PAINT_DARK_STEEL,
        group: "haft",
        name: `haftFerrule${idx}`,
      },
    );

    // 4 rivets around each ferrule
    for (const [rx, rz] of [
      [0.054, 0],
      [-0.054, 0],
      [0, 0.054],
      [0, -0.054],
    ] as const) {
      b.part(new THREE.OctahedronGeometry(0.009, 0), COL_GOLD_HIGHLIGHT, {
        bone: axeRoot,
        at: [rx, fy, rz],
        group: "haft",
      });
    }
  });

  // Middle rune-node sleeve between the two grips (y = 0.57 to 0.64) with glowing True Ice conduits
  b.frustumBox([0, 0.57, 0], [0, 0.64, 0], [0.088, 0.096], [0.088, 0.096], {
    bone: axeRoot,
    color: PAINT_DARK_STEEL,
    group: "haft",
    name: "haftMidSleeve",
  });
  for (const s of [1, -1] as const) {
    // Glowing cyan rune bars on front/back and left/right of mid-sleeve
    glow(
      b.rod([0, 0.575, s * 0.049], [0, 0.635, s * 0.049], 0.009, COL_GLOW_CYAN, {
        bone: axeRoot,
        sides: 5,
        group: "haft",
      }),
      1.9,
    );
    // Side ice-fang guards on the mid-sleeve
    b.spike([s * 0.042, 0.605, 0], [s * 0.095, 0.635, 0], null, 0.018, PAINT_TRUE_ICE, {
      bone: axeRoot,
      section: { ngon: 5 },
      group: "haft",
    });
  }

  // =========================================================================
  // 4. WINTER-WOLF FUR COLLAR MANTLE & GUARD HORNS (y = 0.92 to 1.08)
  // =========================================================================
  // Sculpted chunky winter-wolf fur collar wrapping the neck below the axe head
  const collarStations = [
    { at: [-0.14, 0.94, 0] as V3, w: 0.14, h: 0.11 },
    { at: [-0.07, 0.98, 0] as V3, w: 0.21, h: 0.14 },
    { at: [0, 1.0, 0] as V3, w: 0.24, h: 0.15 },
    { at: [0.07, 0.98, 0] as V3, w: 0.21, h: 0.14 },
    { at: [0.14, 0.94, 0] as V3, w: 0.14, h: 0.11 },
  ];
  b.loft(collarStations, {
    bone: axeHead,
    sides: 8,
    color: PAINT_WOLF_FUR,
    group: "head",
    name: "wolfFurCollar",
  });

  // Sculpted jagged fur-lock spikes ringing the lower edge of the collar
  const furSpikeCount = 10;
  for (let i = 0; i < furSpikeCount; i++) {
    const angle = (i / furSpikeCount) * Math.PI * 2;
    const fx = Math.cos(angle) * 0.115;
    const fz = Math.sin(angle) * 0.095;
    const tipX = Math.cos(angle) * 0.165;
    const tipZ = Math.sin(angle) * 0.135;
    b.spike([fx, 0.97, fz], [tipX, 0.89 + (i % 2) * 0.02, tipZ], null, 0.028, PAINT_WOLF_FUR, {
      bone: axeHead,
      sides: 5,
      group: "head",
    });
  }

  // Layered fur tuft cards around the collar for rich silhouette break-up
  const furCardFrames = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const px = Math.cos(a) * 0.11;
    const pz = Math.sin(a) * 0.09;
    return frame([px, 0.98, pz], [Math.cos(a), -0.35, Math.sin(a)]);
  });
  b.cards(furCardFrames, TEX_FUR_CARD, {
    bone: axeHead,
    size: [0.055, 0.085],
    lean: 35,
    flow: [0, -1, 0],
    vary: 0.18,
    rng: rand,
    color: COL_FUR_SNOW,
    group: "head",
    name: "collarFurCards",
  });

  // Forged antique-gold & dark-iron cross-guard crown sitting atop the fur mantle (y = 1.02 to 1.12)
  const guardOutline: OutlinePoint[] = [
    [-0.17, 1.01],
    [0.17, 1.01],
    [0.21, 1.06],
    [0.14, 1.11],
    [-0.14, 1.11],
    [-0.21, 1.06],
  ];
  b.extrude(guardOutline, {
    bone: axeHead,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.012,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_ROYAL_GOLD,
    group: "head",
    name: "collarGoldGuard",
  });

  // =========================================================================
  // 5. AXE HEAD HOUSING, FROST-DRAKE CREST & GLOWING TRUE ICE HEART CORE
  // =========================================================================
  // Central dark-iron chassis block framing the open True Ice heart chamber (y = 1.10 to 1.46)
  for (const sideY of [
    [1.09, 1.18, 0.24, 0.13],
    [1.37, 1.47, 0.24, 0.13],
  ] as const) {
    const [yA, yB, w, h] = sideY;
    b.frustumBox([0, yA, 0], [0, yB, 0], [w, h], [w * 0.92, h * 0.92], {
      bone: axeHead,
      color: PAINT_DARK_STEEL,
      group: "head",
    });
  }

  // Blazing True Ice Heart Core suspended in the center of the axe head (y = 1.16 to 1.40)
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), COL_GLOW_CORE, {
      bone: axeHead,
      at: [0, 1.275, 0],
      scale: [0.095, 0.135, 0.085],
      group: "head",
      name: "trueIceHeartCore",
    }),
    2.4,
  );

  // Outer faceted cyan energy shell & 4 diagonal energy conduits radiating from the core
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), COL_GLOW_CYAN, {
      bone: axeHead,
      at: [0, 1.275, 0],
      rotation: [0, 45, 0],
      scale: [0.115, 0.11, 0.095],
      group: "head",
      name: "trueIceHeartShell",
    }),
    1.6,
  );

  // Front (+Z) and Back (-Z) Freljordian Frost-Ram / Drake Crest Relief Masks framing the glowing core
  for (const fz of [1, -1] as const) {
    const zFace = fz * 0.064;
    // Vertical gold cheek pillars framing the core window
    for (const sx of [1, -1] as const) {
      b.frustumBox([sx * 0.085, 1.12, zFace], [sx * 0.095, 1.43, zFace], [0.044, 0.036], [0.048, 0.038], {
        bone: axeHead,
        color: PAINT_ROYAL_GOLD,
        group: "head",
      });

      // Swept-outward golden drake brow horns on front & back faces
      const browHorn = bezier(
        [sx * 0.05, 1.38, zFace],
        [sx * 0.12, 1.43, zFace * 1.35],
        [sx * 0.18, 1.49, zFace * 1.15],
        [sx * 0.21, 1.56, zFace * 0.85],
      );
      b.sweep(browHorn, [0.024, 0.005], PAINT_ROYAL_GOLD, {
        bone: axeHead,
        section: { ngon: 6 },
        caps: { start: "flat", end: "point" },
        group: "head",
      });

      // Lower cheek fangs pointing down over the fur collar
      b.spike([sx * 0.075, 1.12, zFace * 1.05], [sx * 0.09, 1.01, zFace * 1.15], null, 0.02, PAINT_ROYAL_GOLD, {
        bone: axeHead,
        section: { ngon: 5 },
        group: "head",
      });

      // Glowing cyan eye-slit gems on the drake brow
      glow(
        b.part(new THREE.OctahedronGeometry(0.016, 0), COL_GLOW_CORE, {
          bone: axeHead,
          at: [sx * 0.058, 1.39, zFace * 1.25],
          scale: [1.4, 0.7, 0.7],
          group: "head",
        }),
        2.2,
      );
    }

    // Central nasal ridge bridge & glowing Freljordian rune seal over the core chamber
    b.frustumBox([0, 1.36, zFace * 1.12], [0, 1.48, zFace * 1.05], [0.065, 0.032], [0.042, 0.026], {
      bone: axeHead,
      color: PAINT_DARK_STEEL,
      group: "head",
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
        bone: axeHead,
        at: [0, 1.275, fz * 0.096],
        dir: [0, 0, fz],
        axis: "z",
        texture: TEX_FROST_RUNE,
        group: "head",
      }),
      2.0,
    );
  }

  // =========================================================================
  // 6. CROWN SPIRE / TOP HALBERD PIKE & ARTICULATED FROST-CREST WINGS
  // =========================================================================
  // Forged dark-steel & gold spear socket at the top of the head (y = 1.44 to 1.53)
  b.lathe(
    [
      [0, 0],
      [0.068, 0.01],
      [0.052, 0.045],
      [0.062, 0.075],
      [0.038, 0.095],
      [0, 0.1],
    ],
    {
      bone: axeHead,
      at: [0, 1.44, 0],
      segments: 8,
      smoothing: 0,
      color: PAINT_ROYAL_GOLD,
      group: "head",
      name: "crownSocket",
    },
  );

  // Towering True Ice Halberd Pike (y = 1.50 to 1.73)
  const pikeOutline: OutlinePoint[] = [
    [0, 1.48],
    [0.062, 1.53],
    [0.038, 1.59],
    [0.052, 1.63],
    [0, 1.73],
    [-0.052, 1.63],
    [-0.038, 1.59],
    [-0.062, 1.53],
  ];
  b.extrude(pikeOutline, {
    bone: axeHead,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.055, 0.01],
    bevel: 0.008,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_TRUE_ICE,
    group: "head",
    name: "crownIcePike",
  });

  // Glowing cyan energy core spine running up the center of the top pike
  glow(
    b.spike([0, 1.5, 0], [0, 1.72, 0], null, 0.025, COL_GLOW_CYAN, {
      bone: axeHead,
      section: { ngon: 4 },
      group: "head",
      name: "crownPikeGlowSpine",
    }),
    2.0,
  );

  // Articulated upper frost-crest wings on `shardWingL` and `shardWingR`
  for (const [s, wingJoint, sideTag] of [
    [1, shardWingL, "L"],
    [-1, shardWingR, "R"],
  ] as const) {
    // Forged gold hinge bracket connecting wing shard to crown socket
    b.rod([s * 0.055, 1.46, 0], [s * 0.15, 1.5, 0], 0.018, PAINT_ROYAL_GOLD, {
      bone: wingJoint,
      sides: 6,
      group: "crest",
    });

    // Swept crystalline frost wing fin
    const wingOutline: OutlinePoint[] = [
      [0.11, 1.45],
      [0.24, 1.52],
      [0.29, 1.64],
      [0.19, 1.69],
      [0.13, 1.59],
      [0.09, 1.51],
    ];
    b.extrude(wingOutline, {
      bone: wingJoint,
      at: [0, 0, 0],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.036, 0.008],
      bevel: 0.006,
      smoothing: 0,
      detail: 0.5,
      color: PAINT_TRUE_ICE,
      group: "crest",
      name: `crestIceWing${sideTag}`,
    });

    // Glowing cyan crystal tip spike on each crest wing
    glow(
      b.spike([s * 0.18, 1.55, 0], [s * 0.28, 1.66, 0], null, 0.018, COL_GLOW_CYAN, {
        bone: wingJoint,
        section: { ngon: 5 },
        group: "crest",
      }),
      1.9,
    );
  }

  // =========================================================================
  // 7. PRIMARY EXECUTIONER CRESCENT BLADE (+X SIDE, `bladeMainL`)
  // =========================================================================
  // Layer 1: Massive sweeping True Ice Crescent Blade (x = 0.08 to 0.58, y = 0.78 to 1.64)
  // Designed with heroic League of Legends bevels, upper horn, deep battle-notch, and hooked lower beard
  const mainBladeIceOutline: OutlinePoint[] = [
    [0.08, 1.12],
    [0.19, 1.07],
    [0.24, 0.95],
    [0.17, 0.84],
    [0.25, 0.78],
    [0.39, 0.85],
    [0.49, 0.98],
    [0.54, 1.13],
    [0.45, 1.19], // deep battle-notch inset
    [0.57, 1.27], // widest belly of the crescent edge
    [0.55, 1.43],
    [0.47, 1.56],
    [0.34, 1.64], // upper horn tip
    [0.24, 1.55],
    [0.27, 1.44],
    [0.18, 1.39],
    [0.08, 1.41],
  ];
  b.extrude(mainBladeIceOutline, {
    bone: bladeMainL,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.056, 0.016],
    bevel: 0.008,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_TRUE_ICE,
    group: "bladeMain",
    name: "mainBladeTrueIce",
  });

  // Layer 2:Glowing Razor-Edge Energy Rim & Serrated Frost Fangs along the outer arc
  const mainEdgeGlowOutline: OutlinePoint[] = [
    [0.25, 0.78],
    [0.4, 0.84],
    [0.51, 0.98],
    [0.56, 1.13],
    [0.47, 1.19],
    [0.59, 1.27],
    [0.57, 1.44],
    [0.48, 1.57],
    [0.34, 1.64],
    [0.31, 1.59],
    [0.43, 1.52],
    [0.5, 1.41],
    [0.51, 1.27],
    [0.42, 1.19],
    [0.48, 1.12],
    [0.44, 0.99],
    [0.34, 0.88],
  ];
  glow(
    b.extrude(mainEdgeGlowOutline, {
      bone: bladeMainL,
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 0,
      detail: 0.5,
      color: COL_GLOW_CYAN,
      group: "bladeMain",
      name: "mainBladeGlowEdge",
    }),
    1.7,
  );

  // Layer 3: Heavy Forged Dark-Steel Armor Cheek Clamps over the inner half of the blade
  const mainBladeArmorOutline: OutlinePoint[] = [
    [0.06, 1.13],
    [0.22, 1.09],
    [0.31, 0.99],
    [0.28, 1.14],
    [0.36, 1.21],
    [0.31, 1.27],
    [0.38, 1.35],
    [0.29, 1.43],
    [0.33, 1.53],
    [0.21, 1.44],
    [0.06, 1.4],
  ];
  b.extrude(mainBladeArmorOutline, {
    bone: bladeMainL,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.078,
    bevel: 0.01,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_DARK_STEEL,
    group: "bladeMain",
    name: "mainBladeSteelClamp",
  });

  // Layer 4: Ornate Antique-Gold Filigree Frame & Wolf-Tooth Trim around the steel clamp
  const mainBladeGoldOutline: OutlinePoint[] = [
    [0.07, 1.16],
    [0.2, 1.13],
    [0.26, 1.2],
    [0.22, 1.27],
    [0.27, 1.34],
    [0.19, 1.4],
    [0.07, 1.38],
  ];
  b.extrude(mainBladeGoldOutline, {
    bone: bladeMainL,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.09,
    bevel: 0.009,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_ROYAL_GOLD,
    group: "bladeMain",
    name: "mainBladeGoldTrim",
  });

  // Lower Beard Structural Brace connecting the hooked axe beard back to the haft collar
  const beardBraceCurve = bezier([0.07, 0.98, 0], [0.16, 0.92, 0], [0.22, 0.88, 0], [0.26, 0.84, 0]);
  b.sweep(beardBraceCurve, [0.024, 0.016], PAINT_DARK_STEEL, {
    bone: bladeMainL,
    section: "box",
    caps: "flat",
    group: "bladeMain",
    name: "mainBladeBeardBrace",
  });

  // 5 Jagged True Ice Frost-Spikes bursting outward from the spine & notch of the main blade
  const mainBladeSpikes: Array<[V3, V3, number]> = [
    [[0.42, 1.19, 0], [0.53, 1.2, 0], 0.022], // battle-notch crystal tooth
    [[0.26, 1.49, 0], [0.31, 1.62, 0], 0.024], // upper dorsal spine 1
    [[0.19, 1.41, 0], [0.22, 1.53, 0], 0.021], // upper dorsal spine 2
    [[0.21, 0.91, 0], [0.14, 0.81, 0], 0.022], // inner beard hook fang
    [[0.33, 1.27, 0], [0.47, 1.27, 0], 0.026], // central fuller ice spear
  ];
  mainBladeSpikes.forEach(([baseP, tipP, rad], idx) => {
    glow(
      b.spike(baseP, tipP, null, rad, COL_GLOW_CYAN, {
        bone: bladeMainL,
        section: { ngon: 5 },
        group: "bladeMain",
        name: `mainBladeFang${idx}`,
      }),
      1.6,
    );
  });

  // Front (+Z) and Back (-Z) Glowing Frost-Lightning Vein Inlays & Gold Rivets on the main blade
  for (const fz of [1, -1] as const) {
    glow(
      b.part(new THREE.PlaneGeometry(0.24, 0.48), "#ffffff", {
        bone: bladeMainL,
        at: [0.35, 1.24, fz * 0.029],
        dir: [0, 0, fz],
        axis: "z",
        texture: TEX_BLADE_VEIN,
        group: "bladeMain",
      }),
      1.9,
    );

    // Recessed glowing rune gem & 5 heavy gold rivets on the armor cheek plate
    glow(
      b.part(new THREE.OctahedronGeometry(0.024, 0), COL_GLOW_CORE, {
        bone: bladeMainL,
        at: [0.17, 1.27, fz * 0.046],
        scale: [1.3, 0.9, 0.5],
        group: "bladeMain",
      }),
      2.2,
    );

    const rivetCoords: Array<[number, number]> = [
      [0.12, 1.18],
      [0.22, 1.14],
      [0.28, 1.27],
      [0.22, 1.39],
      [0.12, 1.36],
    ];
    for (const [rx, ry] of rivetCoords) {
      b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.014, 6), COL_GOLD_HIGHLIGHT, {
        bone: bladeMainL,
        at: [rx, ry, fz * 0.044],
        dir: [0, 0, fz],
        group: "bladeMain",
      });
    }
  }

  // =========================================================================
  // 8. TWIN-FLUKE GLACIER-BREAKER COUNTER-BLADE (-X SIDE, `bladeBackR`)
  // =========================================================================
  // Asymmetric twin-fluke war-pick & ice-scythe on the -X side (x = -0.08 to -0.49, y = 0.92 to 1.58)
  const backBladeIceOutline: OutlinePoint[] = [
    [-0.08, 1.14],
    [-0.19, 1.08],
    [-0.31, 0.98],
    [-0.43, 0.92], // lower war-pick tip
    [-0.41, 1.03],
    [-0.32, 1.13],
    [-0.24, 1.22], // inner crescent void between flukes
    [-0.35, 1.27], // central crystal tooth
    [-0.25, 1.33],
    [-0.36, 1.42],
    [-0.49, 1.5], // upper scythe fluke outer edge
    [-0.44, 1.58], // upper scythe fluke tip
    [-0.29, 1.52],
    [-0.18, 1.43],
    [-0.08, 1.39],
  ];
  b.extrude(backBladeIceOutline, {
    bone: bladeBackR,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.052, 0.016],
    bevel: 0.008,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_TRUE_ICE,
    group: "bladeBack",
    name: "backBladeTrueIce",
  });

  // Forged Dark-Steel & Gold Claw Housing clamping the twin flukes
  const backBladeArmorOutline: OutlinePoint[] = [
    [-0.06, 1.15],
    [-0.21, 1.11],
    [-0.29, 1.05],
    [-0.22, 1.2],
    [-0.18, 1.27],
    [-0.23, 1.35],
    [-0.31, 1.46],
    [-0.19, 1.42],
    [-0.06, 1.38],
  ];
  b.extrude(backBladeArmorOutline, {
    bone: bladeBackR,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.074,
    bevel: 0.009,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_DARK_STEEL,
    group: "bladeBack",
    name: "backBladeSteelClamp",
  });

  // Ornate Gold Trim Collar on the counter-blade
  const backBladeGoldOutline: OutlinePoint[] = [
    [-0.07, 1.18],
    [-0.18, 1.15],
    [-0.15, 1.27],
    [-0.19, 1.38],
    [-0.07, 1.36],
  ];
  b.extrude(backBladeGoldOutline, {
    bone: bladeBackR,
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.088,
    bevel: 0.008,
    smoothing: 0,
    detail: 0.5,
    color: PAINT_ROYAL_GOLD,
    group: "bladeBack",
    name: "backBladeGoldTrim",
  });

  // 3 Blazing True Ice Shatter-Spikes fanning out from the cleft between the twin flukes
  const backFanSpikes: Array<[V3, V3, number]> = [
    [[-0.21, 1.27, 0], [-0.46, 1.27, 0], 0.028],
    [[-0.22, 1.31, 0], [-0.42, 1.38, 0], 0.022],
    [[-0.22, 1.23, 0], [-0.4, 1.15, 0], 0.022],
  ];
  backFanSpikes.forEach(([baseP, tipP, rad], idx) => {
    glow(
      b.spike(baseP, tipP, null, rad, COL_GLOW_CYAN, {
        bone: bladeBackR,
        section: { ngon: 5 },
        group: "bladeBack",
        name: `backBladeClusterSpike${idx}`,
      }),
      1.9,
    );
  });

  // Glowing rune inlays & rivets on both faces of the counter-blade
  for (const fz of [1, -1] as const) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.022, 0), COL_GLOW_CORE, {
        bone: bladeBackR,
        at: [-0.15, 1.27, fz * 0.045],
        scale: [1.2, 0.9, 0.5],
        group: "bladeBack",
      }),
      2.1,
    );
    for (const [rx, ry] of [
      [-0.12, 1.19],
      [-0.21, 1.14],
      [-0.22, 1.39],
      [-0.12, 1.35],
    ] as const) {
      b.part(new THREE.CylinderGeometry(0.01, 0.012, 0.014, 6), COL_GOLD_HIGHLIGHT, {
        bone: bladeBackR,
        at: [rx, ry, fz * 0.042],
        dir: [0, 0, fz],
        group: "bladeBack",
      });
    }
  }

  // =========================================================================
  // 9. HANGING ICICLES & GLOWING ARCANE FROST SHARD CARDS
  // =========================================================================
  // Sculpted True Ice icicles hanging beneath the lower beard of the main blade and the counter-blade
  const icicleSpecs: Array<{ pos: V3; len: number; r: number; owner: typeof bladeMainL }> = [
    { pos: [0.16, 1.07, 0], len: 0.085, r: 0.014, owner: bladeMainL },
    { pos: [0.21, 0.98, 0.012], len: 0.075, r: 0.012, owner: bladeMainL },
    { pos: [0.21, 0.98, -0.012], len: 0.07, r: 0.012, owner: bladeMainL },
    { pos: [-0.18, 1.09, 0], len: 0.09, r: 0.015, owner: bladeBackR },
    { pos: [-0.27, 1.01, 0], len: 0.075, r: 0.013, owner: bladeBackR },
    { pos: [-0.35, 0.96, 0], len: 0.06, r: 0.011, owner: bladeBackR },
  ];
  icicleSpecs.forEach((ic, idx) => {
    const tip: V3 = [ic.pos[0], ic.pos[1] - ic.len, ic.pos[2]];
    glow(
      b.spike(ic.pos, tip, null, ic.r, COL_GLOW_RUNE, {
        bone: ic.owner,
        section: { ngon: 5 },
        group: "icicles",
        name: `hangingIcicle${idx}`,
      }),
      1.4,
    );
  });

  // Glowing frost-shard & cold-mist aura cards rising around the plinth cleft and radiating from the True Ice core
  const plinthMistFrames = [
    frame([0.14, 0.14, 0.12], [0.25, 1, 0.2]),
    frame([-0.14, 0.14, 0.12], [-0.25, 1, 0.2]),
    frame([0.14, 0.14, -0.12], [0.25, 1, -0.2]),
    frame([-0.14, 0.14, -0.12], [-0.25, 1, -0.2]),
    frame([0.28, 0.12, 0], [0.4, 1, 0]),
    frame([-0.28, 0.12, 0], [-0.4, 1, 0]),
  ];
  glow(
    b.cards(plinthMistFrames, TEX_FROST_SHARD_CARD, {
      bone: plinthRoot,
      size: [0.065, 0.16],
      lean: 18,
      flow: [0, 1, 0],
      cross: true,
      vary: 0.2,
      rng: rand,
      color: COL_GLOW_RUNE,
      group: "plinth",
      name: "plinthFrostAuraCards",
    }),
    1.5,
  );

  const coreAuraFrames = [
    frame([0.08, 1.32, 0.05], [0.6, 0.8, 0.2]),
    frame([-0.08, 1.32, 0.05], [-0.6, 0.8, 0.2]),
    frame([0.08, 1.32, -0.05], [0.6, 0.8, -0.2]),
    frame([-0.08, 1.32, -0.05], [-0.6, 0.8, -0.2]),
  ];
  glow(
    b.cards(coreAuraFrames, TEX_FROST_SHARD_CARD, {
      bone: axeHead,
      size: [0.05, 0.13],
      lean: 22,
      flow: [0, 1, 0],
      cross: true,
      vary: 0.15,
      rng: rand,
      color: COL_GLOW_CORE,
      group: "head",
      name: "coreFrostAuraCards",
    }),
    1.8,
  );

  // Subtle dynamic rest pose on the hanging wolf-tail talisman and upper frost-crest wings
  b.pose(tasselChain.joints[0], { axis: [0, 0, 1], deg: -8 });
  b.pose(tasselChain.joints[1], { axis: [1, 0, 0], deg: 10 });
  b.pose(shardWingL, { axis: [0, 0, 1], deg: -6 });
  b.pose(shardWingR, { axis: [0, 0, 1], deg: 6 });

  return b.root;
}
