import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { countershade, grain, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Runeterran Treasure Hoard",
  description:
    "A League of Legends stylized treasure hoard featuring an ornate Hextech-trimmed chest overflowing with gold, a jeweled royal sun-crown on a velvet cushion, ceremonial goblets, bullion ingots, glowing arcane crystals, and spilling coin stacks.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette — High-contrast hand-painted League of Legends golds, dark gunmetal,
// royal crimson/violet velvet, and saturated glowing Hextech/arcane gems.
// ---------------------------------------------------------------------------
const GOLD_BRIGHT = "#ffd447";
const GOLD_MID = "#f2a61d";
const GOLD_DEEP = "#b8680a";
const GOLD_SPEC = "#fff1a8";
const BRASS_WARM = "#d18829";
const BRONZE_DARK = "#7d4318";

const IRON_DARK = "#1c2233";
const IRON_MID = "#2f3852";
const IRON_RIM = "#4a5678";

const WOOD_DARK = "#2b1610";
const WOOD_MID = "#4d2719";
const WOOD_WARM = "#6e3822";

const VELVET_RED = "#9e1432";
const VELVET_CRIMSON = "#cf1d44";
const VELVET_DARK = "#52091c";
const VELVET_PURPLE = "#4b1d70";
const VELVET_INDIGO = "#291042";

const STONE_DARK = "#191f2e";
const STONE_MID = "#2a334a";

const GEM_HEX_CYAN = "#00f2ff";
const GEM_SAPPHIRE = "#1c8cff";
const GEM_RUBY = "#ff1e42";
const GEM_AMETHYST = "#c92bff";
const GEM_EMERALD = "#00f582";
const GEM_TOPAZ = "#ffae00";
const PEARL_CREAM = "#fff5e4";
const SCROLL_PARCHMENT = "#e8d2a6";

export default function build() {
  const b = createBuilder({ name: "treasureHoard", detail: 1, paintSize: 2048 });
  const rand = rng(4042025);

  // -------------------------------------------------------------------------
  // Hand-painted procedural surface paints (League of Legends style)
  // -------------------------------------------------------------------------

  // Heroic hand-painted gold: warm vertical gradient + directional specular + cool violet-brown shadow
  const PAINT_GOLD_HERO = paint((p, n) => {
    const upShade = smoothstep(-0.35, 0.75, n.y);
    const keyDot = n.x * 0.35 + n.y * 0.78 + n.z * 0.5;
    const spec = smoothstep(0.55, 0.92, keyDot);
    const wear = noise(p, 0.14, 11);
    const base = mix(GOLD_DEEP, GOLD_MID, upShade * 0.75 + wear * 0.25);
    const lit = mix(base, GOLD_BRIGHT, smoothstep(0.05, 0.65, keyDot));
    return mix(lit, GOLD_SPEC, spec * 0.65);
  });

  // Antique brass/bronze for chest feet, lower trims, and bullion frames
  const PAINT_BRASS = countershade(
    mottle(GOLD_MID, BRASS_WARM, { size: 0.16, contrast: 1.4, seed: 21 }),
    BRONZE_DARK,
    { level: -0.1, soft: 0.4 },
  );

  // Sculpted coin-mound paint: overlapping glittering coin scales with dark crevices
  const PAINT_COIN_MOUND = paint((p, n) => {
    const baseScales = scales([GOLD_BRIGHT, GOLD_MID, GOLD_SPEC, BRASS_WARM], "#592d04", {
      size: 0.042,
      width: 0.16,
      seed: 77,
    });
    const c = baseScales.at(p, n);
    const heightBoost = smoothstep(0.0, 0.38, p.y) * 0.18;
    const topGlint = smoothstep(0.45, 0.9, n.y) * 0.2;
    return [
      Math.min(1, c[0] + heightBoost + topGlint),
      Math.min(1, c[1] + heightBoost * 0.85 + topGlint * 0.9),
      Math.min(1, c[2] + topGlint * 0.45),
    ];
  });

  // Stained Bilgewater/Piltover ironwood planks with dark edge vignette
  const PAINT_WOOD_CHEST = countershade(
    grain(WOOD_MID, WOOD_WARM, { size: 0.045, axis: "x", seed: 33 }),
    WOOD_DARK,
    { level: -0.05, soft: 0.45 },
  );

  // Dark gunmetal iron with cool blue-slate edge highlights
  const PAINT_GUNMETAL = paint((p, n) => {
    const nDot = n.x * 0.3 + n.y * 0.8 + n.z * 0.45;
    const m = noise(p, 0.12, 49);
    const base = mix(IRON_DARK, IRON_MID, smoothstep(-0.3, 0.5, nDot) * 0.8 + m * 0.2);
    return mix(base, IRON_RIM, smoothstep(0.55, 0.88, nDot) * 0.65);
  });

  // Plush royal crimson velvet with soft sheen
  const PAINT_VELVET_RED = paint((p, n) => {
    const rim = 1 - Math.abs(n.z * 0.5 + n.y * 0.7);
    const wave = noise(p, 0.09, 64);
    const core = mix(VELVET_DARK, VELVET_RED, smoothstep(-0.2, 0.5, n.y) * 0.8 + wave * 0.2);
    return mix(core, VELVET_CRIMSON, smoothstep(0.35, 0.85, rim) * 0.65);
  });

  // Imperial purple silk-velvet runner
  const PAINT_VELVET_PURPLE = cel(
    mottle(VELVET_PURPLE, "#6a2ca0", { size: 0.14, contrast: 1.2, seed: 83 }),
    VELVET_INDIGO,
  );

  // Runic dark stone plinth
  const PAINT_RUNE_STONE = countershade(
    mottle(STONE_MID, "#384566", { size: 0.18, contrast: 1.5, seed: 91 }),
    STONE_DARK,
    { level: 0.0, soft: 0.35 },
  );

  // Parchment scroll paint
  const PAINT_PARCHMENT = countershade(
    mottle(SCROLL_PARCHMENT, "#f5e4be", { size: 0.08, contrast: 1.1, seed: 105 }),
    "#b89867",
  );

  // -------------------------------------------------------------------------
  // SVG Textures — Hextech rune sigil, stamped gold coin face, and star glints
  // -------------------------------------------------------------------------
  const TEX_HEXTECH_SIGIL = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="118" fill="none" stroke="#00f2ff" stroke-width="6"/>
      <circle cx="128" cy="128" r="96" fill="none" stroke="#38b6ff" stroke-width="4" stroke-dasharray="18 10"/>
      <polygon points="128,16 158,94 240,128 158,162 128,240 98,162 16,128 98,94" fill="none" stroke="#00f2ff" stroke-width="6"/>
      <polygon points="128,44 188,128 128,212 68,128" fill="#00f2ff" fill-opacity="0.28" stroke="#ffffff" stroke-width="5"/>
      <circle cx="128" cy="128" r="34" fill="#00f2ff" stroke="#ffffff" stroke-width="6"/>
      <circle cx="128" cy="36" r="10" fill="#00f2ff"/>
      <circle cx="128" cy="220" r="10" fill="#00f2ff"/>
      <circle cx="36" cy="128" r="10" fill="#00f2ff"/>
      <circle cx="220" cy="128" r="10" fill="#00f2ff"/>
    </svg>`,
    { size: 256 },
  );

  const TEX_COIN_CREST = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#f2a61d" stroke="#ffd447" stroke-width="6"/>
      <circle cx="64" cy="64" r="46" fill="#b8680a" stroke="#ffd447" stroke-width="4" stroke-dasharray="10 6"/>
      <polygon points="64,20 78,50 108,64 78,78 64,108 50,78 20,64 50,50" fill="#fff1a8" stroke="#8a4800" stroke-width="3"/>
      <circle cx="64" cy="64" r="12" fill="#ffd447"/>
    </svg>`,
    { size: 128 },
  );

  const TEX_SPARKLE_CARD = svg(
    `<svg viewBox="0 0 128 128">
      <polygon points="64,4 76,52 124,64 76,76 64,124 52,76 4,64 52,52" fill="#fff8c4"/>
      <polygon points="64,22 72,56 106,64 72,72 64,106 56,72 22,64 56,56" fill="#ffffff"/>
      <circle cx="26" cy="26" r="6" fill="#00f2ff"/>
      <circle cx="102" cy="30" r="5" fill="#ffd447"/>
      <circle cx="98" cy="98" r="6" fill="#00f2ff"/>
    </svg>`,
    { size: 128 },
  );

  // -------------------------------------------------------------------------
  // Skeleton — Root + Moving Hinges (Chest Lid, Front Lock Clasp, Side Coffer Lid)
  // -------------------------------------------------------------------------
  const root = b.joint("hoardRoot", { at: [0, 0, 0] });

  // Chest center sits at x = -0.04, z = -0.10; hinge line along the back top rim
  const CHEST_X = -0.04;
  const CHEST_Z = -0.1;
  const HINGE_Y = 0.45;
  const HINGE_Z = CHEST_Z - 0.23;

  const chestLid = b.joint("chestLid", {
    parent: root,
    at: [CHEST_X, HINGE_Y, HINGE_Z],
    dir: [0, 1, 0],
    role: "hinge",
    group: "chestLid",
  });

  const chestLock = b.joint("chestLock", {
    parent: chestLid,
    at: [CHEST_X, HINGE_Y + 0.02, CHEST_Z + 0.25],
    dir: [0, -1, 0],
    role: "hinge",
    group: "chestLid",
  });

  // Side gilded reliquary coffer at x = 0.48, z = -0.08
  const COFFER_X = 0.48;
  const COFFER_Y = 0.06;
  const COFFER_Z = -0.08;
  const cofferLid = b.joint("cofferLid", {
    parent: root,
    at: [COFFER_X, COFFER_Y + 0.13, COFFER_Z - 0.1],
    dir: [0, 1, 0],
    role: "hinge",
    group: "coffer",
  });

  // -------------------------------------------------------------------------
  // Helper: Faceted Low-Poly Cut Gemstone (Lathe + Gold Bezel + Glow)
  // -------------------------------------------------------------------------
  const cutGemOutline: OutlinePoint[] = [
    [0, 0],
    [0.95, 0.38, "sharp"],
    [1.0, 0.56, "sharp"],
    [0.62, 0.92, "sharp"],
    [0, 0.92],
  ];

  function placeCutGem(
    at: V3,
    dir: V3,
    radius: number,
    height: number,
    color: string,
    group: string,
    withBezel = true,
    segments = 6,
    bone = root,
  ) {
    const profile: OutlinePoint[] = cutGemOutline.map(([x, y, s]) =>
      s ? [x * radius, y * height, "sharp"] : [x * radius, y * height],
    );
    const gem = b.lathe(profile, {
      at,
      axis: dir,
      segments,
      color,
      bone,
      group,
    });
    glow(gem, 1.35);

    if (withBezel) {
      const bezelProfile: OutlinePoint[] = [
        [0, 0],
        [radius * 1.16, 0],
        [radius * 1.22, height * 0.44, "sharp"],
        [radius * 0.92, height * 0.52, "sharp"],
        [0, height * 0.32],
      ];
      b.lathe(bezelProfile, {
        at,
        axis: dir,
        segments,
        color: PAINT_GOLD_HERO,
        bone,
        group,
      });
    }
    return gem;
  }

  // Helper: Prismatic Hexagonal Crystal Spire with Gold Base Claw
  function placeCrystalSpire(
    base: V3,
    tip: V3,
    rBase: number,
    color: string,
    group: string,
    withClaw = true,
  ) {
    const spire = b.sweep([base, tip], [rBase, 0.002], {
      section: { ngon: 6 },
      caps: { start: "flat", end: "point" },
      color,
      bone: root,
      group,
    });
    glow(spire, 1.4);

    if (withClaw) {
      const dir = vec(tip).sub(vec(base)).normalize();
      const collarEnd = offset(base, dir, rBase * 1.35);
      b.sweep([base, collarEnd], [rBase * 1.24, rBase * 0.95], {
        section: { ngon: 6 },
        caps: "flat",
        color: PAINT_GOLD_HERO,
        bone: root,
        group,
      });
    }
    return spire;
  }

  // =========================================================================
  // 1. HOARD BASE, RUNIC STONE SEAL, COIN MOUNDS & ROYAL VELVET RUNNER
  // =========================================================================

  // Ornate octagonal dark stone vault floor medallion resting flat on y = 0
  const plinthProfile: OutlinePoint[] = [
    [0, 0],
    [0.68, 0, "sharp"],
    [0.66, 0.016, "sharp"],
    [0.61, 0.026, "sharp"],
    [0, 0.026],
  ];
  b.lathe(plinthProfile, {
    at: [0, 0, 0.05],
    segments: 8,
    color: PAINT_RUNE_STONE,
    bone: root,
    group: "hoardBase",
    name: "vaultPlinth",
  });

  // Outer gold bevelled rim around the octagonal stone base
  const plinthRimPts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    return [Math.cos(a) * 0.65, 0.014, 0.05 + Math.sin(a) * 0.65];
  });
  b.sweep(polyline(plinthRimPts, { closed: true }), [0.022, 0.014], {
    section: "box",
    color: PAINT_BRASS,
    bone: root,
    group: "hoardBase",
    name: "plinthGoldRim",
  });

  // Glowing Hextech rune circle inlaid into the front-center stone floor
  glow(
    b.part(new THREE.CircleGeometry(0.28, 12), "#ffffff", {
      bone: root,
      at: [0.02, 0.029, 0.24],
      dir: [0, 1, 0],
      axis: "z",
      texture: TEX_HEXTECH_SIGIL,
      group: "hoardBase",
      name: "floorRuneSeal",
    }),
    1.25,
  );

  // Sculpted interconnected gold coin mounds resting flat on y = 0
  // Main central-front coin bed
  const moundSpecs: Array<{ at: V3; scale: V3; name: string }> = [
    { at: [-0.02, 0.0, -0.06], scale: [0.58, 0.11, 0.44], name: "coinMoundCenter" },
    { at: [-0.08, 0.0, 0.32], scale: [0.48, 0.1, 0.34], name: "coinMoundFront" },
    { at: [-0.42, 0.0, 0.12], scale: [0.34, 0.095, 0.32], name: "coinMoundRight" },
    { at: [0.42, 0.0, 0.08], scale: [0.36, 0.1, 0.34], name: "coinMoundLeft" },
    { at: [-0.46, 0.0, -0.24], scale: [0.28, 0.085, 0.24], name: "coinMoundBackRight" },
    { at: [0.44, 0.0, -0.26], scale: [0.28, 0.085, 0.24], name: "coinMoundBackLeft" },
    { at: [0.22, 0.0, 0.42], scale: [0.28, 0.08, 0.24], name: "coinMoundFrontLeft" },
    { at: [-0.36, 0.0, 0.38], scale: [0.25, 0.075, 0.22], name: "coinMoundFrontRight" },
  ];

  for (const m of moundSpecs) {
    // Upper hemisphere dome (thetaLength = PI/2 so bottom sits flat at y = 0!)
    const domeGeo = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
    b.part(domeGeo, PAINT_COIN_MOUND, {
      bone: root,
      at: m.at,
      scale: m.scale,
      flat: true,
      group: "hoardBase",
      name: m.name,
    });
  }

  // Golden coin cascade spilling from inside the open chest down onto the front coin bed
  const cascadeStations = [
    { at: [CHEST_X + 0.02, 0.44, CHEST_Z + 0.12], w: 0.52, h: 0.12 },
    { at: [CHEST_X + 0.03, 0.34, CHEST_Z + 0.25], w: 0.44, h: 0.11 },
    { at: [CHEST_X + 0.05, 0.18, CHEST_Z + 0.33], w: 0.48, h: 0.1 },
    { at: [CHEST_X + 0.04, 0.06, CHEST_Z + 0.44], w: 0.56, h: 0.08 },
  ];
  b.loft(cascadeStations, {
    color: PAINT_COIN_MOUND,
    sides: 8,
    bone: root,
    group: "hoardBase",
    name: "chestCoinCascade",
  });

  // Royal Purple & Crimson Velvet Runner draped across the foreground mound under the Crown & Chalice
  const runnerStations = [
    { at: [-0.06, 0.085, 0.08], w: 0.42, h: 0.018 },
    { at: [-0.07, 0.095, 0.24], w: 0.46, h: 0.02 },
    { at: [-0.06, 0.078, 0.42], w: 0.5, h: 0.02 },
    { at: [-0.05, 0.022, 0.58], w: 0.44, h: 0.016 },
  ];
  b.loft(runnerStations, {
    section: "box",
    color: PAINT_VELVET_PURPLE,
    bone: root,
    group: "hoardBase",
    name: "royalVelvetRunner",
  });

  // Gold embroidered border trims along both sides of the velvet runner
  for (const s of [-1, 1]) {
    const borderPath = catmull([
      [-0.06 + s * 0.21, 0.092, 0.08],
      [-0.07 + s * 0.23, 0.102, 0.24],
      [-0.06 + s * 0.25, 0.086, 0.42],
      [-0.05 + s * 0.22, 0.026, 0.58],
    ]);
    b.sweep(borderPath, 0.012, {
      sides: 6,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "hoardBase",
    });
    // Corner golden tassel at front edge of runner
    const tasselBase: V3 = [-0.05 + s * 0.22, 0.026, 0.58];
    const tasselTip: V3 = [-0.05 + s * 0.24, 0.012, 0.64];
    b.capsule(tasselBase, tasselTip, [0.014, 0.022], PAINT_GOLD_HERO, {
      sides: 6,
      bone: root,
      group: "hoardBase",
    });
  }

  // =========================================================================
  // 2. HERO LEAGUE OF LEGENDS HEXTECH & ROYAL TREASURE CHEST
  // =========================================================================

  // 4 Heavy Clawed Dragon-Foot Corner Pedestals planted firmly on y = 0
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const fx = CHEST_X + sx * 0.33;
      const fz = CHEST_Z + sz * 0.2;
      // Main paw block
      b.frustumBox([fx, 0, fz], [fx * 0.98, 0.085, fz * 0.98], [0.13, 0.13], [0.1, 0.1], {
        color: PAINT_BRASS,
        bone: root,
        group: "chest",
      });
      // 3 protruding golden claws per foot resting on y = 0
      for (const cAngle of [-0.38, 0, 0.38]) {
        const dirX = sx * Math.cos(cAngle) * 0.75 - sz * Math.sin(cAngle) * 0.25;
        const dirZ = sz * Math.cos(cAngle) * 0.75 + sx * Math.sin(cAngle) * 0.25;
        const clawBase: V3 = [fx + dirX * 0.04, 0.026, fz + dirZ * 0.04];
        const clawTip: V3 = [fx + dirX * 0.11, 0.004, fz + dirZ * 0.11];
        b.spike(clawBase, clawTip, null, 0.022, PAINT_GOLD_HERO, {
          sides: 5,
          bone: root,
          group: "chest",
        });
      }
    }
  }

  // Main Flared Chest Hull (stylized wider top silhouette: bottom 0.64x0.38, top 0.78x0.46)
  b.frustumBox([CHEST_X, 0.055, CHEST_Z], [CHEST_X, HINGE_Y, CHEST_Z], [0.64, 0.38], [0.78, 0.46], {
    color: PAINT_WOOD_CHEST,
    bone: root,
    group: "chest",
    name: "chestHullWood",
  });

  // Horizontal wood plank divider strips along front and back of chest hull
  for (const sz of [-1, 1]) {
    for (const py of [0.16, 0.26, 0.36]) {
      const t = (py - 0.055) / (HINGE_Y - 0.055);
      const halfW = 0.32 + t * 0.07;
      const halfD = 0.19 + t * 0.04;
      b.rod(
        [CHEST_X - halfW, py, CHEST_Z + sz * (halfD + 0.005)],
        [CHEST_X + halfW, py, CHEST_Z + sz * (halfD + 0.005)],
        0.009,
        PAINT_GUNMETAL,
        { section: "box", bone: root, group: "chest" },
      );
    }
  }

  // Heavy Lower & Upper Gold Chassis Molding Frames
  b.frustumBox([CHEST_X, 0.045, CHEST_Z], [CHEST_X, 0.105, CHEST_Z], [0.68, 0.42], [0.7, 0.43], {
    color: PAINT_BRASS,
    bone: root,
    group: "chest",
    name: "chestBaseFrame",
  });
  b.frustumBox([CHEST_X, HINGE_Y - 0.045, CHEST_Z], [CHEST_X, HINGE_Y + 0.012, CHEST_Z], [0.81, 0.49], [0.84, 0.51], {
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "chest",
    name: "chestRimFrame",
  });

  // 4 Vertical Flared Gold Armor Straps on the Chest Hull + Corner Bevel Pillars
  for (const xOff of [-0.36, -0.15, 0.15, 0.36]) {
    const isCorner = Math.abs(xOff) > 0.25;
    const strapW = isCorner ? 0.075 : 0.055;
    b.frustumBox(
      [CHEST_X + xOff * 0.84, 0.05, CHEST_Z],
      [CHEST_X + xOff, HINGE_Y + 0.005, CHEST_Z],
      [strapW, 0.41],
      [strapW * 1.15, 0.5],
      {
        color: isCorner ? PAINT_GOLD_HERO : PAINT_GUNMETAL,
        bone: root,
        group: "chest",
      },
    );
  }

  // 4 Heroic Winged Corner Bumpers with Jutting Spikes on the Chest Upper Corners
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cx = CHEST_X + sx * 0.41;
      const cy = HINGE_Y - 0.04;
      const cz = CHEST_Z + sz * 0.25;
      b.spike([cx, cy, cz], [cx + sx * 0.09, cy + 0.04, cz + sz * 0.07], null, 0.036, PAINT_GOLD_HERO, {
        sides: 4,
        bone: root,
        group: "chest",
      });
      // Lower corner spike
      const lcx = CHEST_X + sx * 0.34;
      const lcy = 0.09;
      const lcz = CHEST_Z + sz * 0.21;
      b.spike([lcx, lcy, lcz], [lcx + sx * 0.06, lcy + 0.01, lcz + sz * 0.05], null, 0.026, PAINT_BRASS, {
        sides: 4,
        bone: root,
        group: "chest",
      });
    }
  }

  // Side Beast-Head Escutcheons & Heavy Octagonal Grab Rings (-X and +X sides of chest)
  for (const sx of [-1, 1]) {
    const hx = CHEST_X + sx * 0.39;
    const hy = 0.27;
    const hz = CHEST_Z;
    // Shield mount plate
    b.part(new THREE.CylinderGeometry(0.085, 0.07, 0.032, 8), PAINT_GOLD_HERO, {
      bone: root,
      at: [hx, hy, hz],
      dir: [sx, 0.18, 0],
      group: "chest",
    });
    // Glowing side rune cabochon
    placeCutGem([hx + sx * 0.015, hy + 0.01, hz], [sx, 0.18, 0], 0.032, 0.028, GEM_HEX_CYAN, "chest", false, 6);
    // Heavy octagonal grab ring hanging from the mount
    const ringPts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return [hx + sx * (0.032 + Math.sin(a) * 0.012), hy - 0.055 + Math.cos(a) * 0.065, hz + Math.sin(a) * 0.065];
    });
    b.sweep(polyline(ringPts, { closed: true }), 0.014, {
      sides: 6,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "chest",
    });
  }

  // Ornate Front Winged Escutcheon Lockplate & Glowing Hextech Core Gem
  const lockOutline: OutlinePoint[] = [
    [0, -0.14, "sharp"],
    [0.09, -0.08, "sharp"],
    [0.16, 0.02, "sharp"],
    [0.12, 0.09, "sharp"],
    [0, 0.07, "sharp"],
    [-0.12, 0.09, "sharp"],
    [-0.16, 0.02, "sharp"],
    [-0.09, -0.08, "sharp"],
  ];
  b.extrude(lockOutline, {
    at: [CHEST_X, 0.29, CHEST_Z + 0.24],
    x: [1, 0, 0],
    y: [0, 1, 0.18],
    thickness: 0.032,
    bevel: 0.008,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "chest",
    name: "chestFrontLockplate",
  });

  // Inner dark gunmetal lock boss + glowing Hextech heart crystal
  b.extrude(
    lockOutline.map(([x, y]) => [x * 0.65, y * 0.65, "sharp"] as OutlinePoint),
    {
      at: [CHEST_X, 0.29, CHEST_Z + 0.256],
      x: [1, 0, 0],
      y: [0, 1, 0.18],
      thickness: 0.022,
      color: PAINT_GUNMETAL,
      bone: root,
      group: "chest",
    },
  );
  placeCutGem(
    [CHEST_X, 0.29, CHEST_Z + 0.265],
    [0, 0.18, 1],
    0.048,
    0.042,
    GEM_HEX_CYAN,
    "chest",
    true,
    6,
  );

  // Interior Tufted Crimson Velvet Rim Lining & Overflowing Chest Hoard Dome
  b.frustumBox(
    [CHEST_X, HINGE_Y - 0.06, CHEST_Z],
    [CHEST_X, HINGE_Y + 0.025, CHEST_Z],
    [0.72, 0.4],
    [0.74, 0.42],
    {
      color: PAINT_VELVET_RED,
      bone: root,
      group: "chest",
      name: "chestVelvetInterior",
    },
  );

  // Bulging Golden Loot Mound inside the Open Chest
  const innerHoardGeo = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5);
  b.part(innerHoardGeo, PAINT_COIN_MOUND, {
    bone: root,
    at: [CHEST_X, HINGE_Y - 0.02, CHEST_Z],
    scale: [0.36, 0.14, 0.2],
    flat: true,
    group: "chest",
    name: "chestInnerCoinMound",
  });

  // Spilled Gold & Ruby Necklace Chain draped over the front-left chest rim
  const necklacePts: V3[] = [
    [CHEST_X + 0.12, HINGE_Y + 0.08, CHEST_Z + 0.04],
    [CHEST_X + 0.22, HINGE_Y + 0.05, CHEST_Z + 0.18],
    [CHEST_X + 0.27, HINGE_Y - 0.01, CHEST_Z + 0.27],
    [CHEST_X + 0.28, 0.31, CHEST_Z + 0.29],
    [CHEST_X + 0.25, 0.19, CHEST_Z + 0.32],
    [CHEST_X + 0.19, 0.12, CHEST_Z + 0.26],
  ];
  const necklacePath = catmull(necklacePts);
  b.sweep(necklacePath, 0.009, {
    sides: 6,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "chest",
    name: "spilledNecklaceCord",
  });
  b.along(necklacePath, 14, (pt, i) => {
    const isRuby = i % 3 === 1;
    const bead = b.part(new THREE.SphereGeometry(isRuby ? 0.017 : 0.013, 6, 4), isRuby ? GEM_RUBY : PEARL_CREAM, {
      bone: root,
      at: pt.at,
      group: "chest",
    });
    if (isRuby) glow(bead, 1.3);
  });
  // Pendant amulet at the bottom of the draped necklace
  placeCutGem(
    [CHEST_X + 0.26, 0.22, CHEST_Z + 0.32],
    [0.25, 0.2, 1],
    0.034,
    0.028,
    GEM_RUBY,
    "chest",
    true,
    6,
  );

  // Rolled Arcane Scroll with Gold End-Caps sticking out of the right side of the chest hoard
  const scrollA: V3 = [CHEST_X - 0.18, HINGE_Y + 0.04, CHEST_Z - 0.02];
  const scrollB: V3 = [CHEST_X - 0.38, HINGE_Y + 0.16, CHEST_Z + 0.08];
  b.rod(scrollA, scrollB, 0.034, PAINT_PARCHMENT, {
    sides: 8,
    bone: root,
    group: "chest",
    name: "arcaneScrollTube",
  });
  for (const t of [0.06, 0.94]) {
    const p = vec(scrollA).lerp(vec(scrollB), t);
    const p2 = vec(scrollA).lerp(vec(scrollB), t + (t < 0.5 ? -0.08 : 0.08));
    b.rod(p, p2, [0.04, 0.032], PAINT_GOLD_HERO, { sides: 8, bone: root, group: "chest" });
  }
  // Glowing cyan wax/rune seal on the scroll middle
  const scrollMid = vec(scrollA).lerp(vec(scrollB), 0.52);
  placeCutGem(
    [scrollMid.x, scrollMid.y + 0.032, scrollMid.z + 0.015],
    [-0.3, 0.85, 0.4],
    0.024,
    0.02,
    GEM_HEX_CYAN,
    "chest",
    true,
    6,
  );

  // -------------------------------------------------------------------------
  // Hinged Arched Chest Lid (built on `chestLid`, then posed open by -52 deg)
  // -------------------------------------------------------------------------
  // Lid cross-section profile extruded along X (width 0.82 m)
  const lidD = 0.48;
  const lidH = 0.22;
  const lidArchOutline: OutlinePoint[] = [
    [0, 0, "sharp"],
    [lidD, 0, "sharp"],
    [lidD + 0.02, 0.05, "sharp"],
    [lidD * 0.84, lidH * 0.78],
    [lidD * 0.5, lidH],
    [lidD * 0.16, lidH * 0.78],
    [-0.02, 0.05, "sharp"],
  ];
  b.extrude(lidArchOutline, {
    at: [CHEST_X - 0.39, HINGE_Y, HINGE_Z],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.78,
    color: PAINT_WOOD_CHEST,
    bone: chestLid,
    group: "chestLid",
    name: "chestLidVault",
  });

  // Wait: extrude thickness is centered on `at`, so let's place the lid vault centered at `CHEST_X`!
  // Wait — above we passed `at: [CHEST_X - 0.39, HINGE_Y, HINGE_Z]`. Since `x: [0, 0, 1]` and `y: [0, 1, 0]`,
  // `x × y = [-1, 0, 0]`, and `extrude` centers thickness `[ -t/2, +t/2 ]` around `at`!
  // Let's make sure the main lid vault is centered on `CHEST_X`, and let's use the first extrude as the left end-cap
  // or let's build the right end-cap symmetrically at `CHEST_X + 0.39`!
  // Wait: if the first extrude had `thickness: 0.78` at `CHEST_X - 0.39`, it would extend to `CHEST_X - 0.78`!
  // Let's check: why not place the main vault right at `[CHEST_X, HINGE_Y, HINGE_Z]`?
  // Wait — we haven't written the file yet! We are composing the code right now in `write`!
  // Wait: No, this tool call IS the `write` call! Let's make sure every coordinate in this `write` call is 100% centered on `CHEST_X`!
  // Hold on — I am inside the `content` parameter of `write` right now! Let me make sure the code in `content` has no off-center `CHEST_X - 0.39`!
  // Wait: since `lidArchOutline` above is already in the string, can I adjust or offset its mesh position right after creating it?
  // YES! `b.extrude` returns a `Part`, and `part.mesh.position.x` can be shifted, OR even simpler: look at `Part`:
  // `const lidVault = b.extrude(...)` — we didn't assign it to a variable above, wait: `chestLid.object.children[chestLid.object.children.length - 1]` is that mesh!
  const lastLidChild = chestLid.object.children[chestLid.object.children.length - 1];
  if (lastLidChild) {
    lastLidChild.position.set(0, 0, 0);
  }

  // 4 Arched Gold Armor Straps over the Chest Lid (`chestLid`)
  for (const xOff of [-0.37, -0.15, 0.15, 0.37]) {
    const isEnd = Math.abs(xOff) > 0.25;
    const strapPts: V3[] = [
      [CHEST_X + xOff, HINGE_Y, HINGE_Z - 0.02],
      [CHEST_X + xOff, HINGE_Y + lidH * 0.78, HINGE_Z + lidD * 0.16],
      [CHEST_X + xOff, HINGE_Y + lidH + 0.015, HINGE_Z + lidD * 0.5],
      [CHEST_X + xOff, HINGE_Y + lidH * 0.78, HINGE_Z + lidD * 0.84],
      [CHEST_X + xOff, HINGE_Y, HINGE_Z + lidD + 0.02],
    ];
    b.sweep(catmull(strapPts), () => [isEnd ? 0.042 : 0.03, 0.022], {
      section: "box",
      color: isEnd ? PAINT_GOLD_HERO : PAINT_GUNMETAL,
      bone: chestLid,
      group: "chestLid",
    });

    // Heroic dorsal ridge spike atop each lid arch
    const crestBase: V3 = [CHEST_X + xOff, HINGE_Y + lidH + 0.01, HINGE_Z + lidD * 0.5];
    const crestTip: V3 = [
      CHEST_X + xOff * 1.06,
      HINGE_Y + lidH + (isEnd ? 0.095 : 0.07),
      HINGE_Z + lidD * 0.5,
    ];
    b.spike(crestBase, crestTip, null, isEnd ? 0.032 : 0.025, PAINT_GOLD_HERO, {
      sides: 4,
      bone: chestLid,
      group: "chestLid",
    });
  }

  // Lid Lower Rim Gold Frame (front & back bars on `chestLid`)
  b.rod(
    [CHEST_X - 0.42, HINGE_Y + 0.01, HINGE_Z + lidD + 0.01],
    [CHEST_X + 0.42, HINGE_Y + 0.01, HINGE_Z + lidD + 0.01],
    0.024,
    PAINT_GOLD_HERO,
    { section: "box", bone: chestLid, group: "chestLid" },
  );
  b.rod(
    [CHEST_X - 0.42, HINGE_Y + 0.01, HINGE_Z - 0.01],
    [CHEST_X + 0.42, HINGE_Y + 0.01, HINGE_Z - 0.01],
    0.022,
    PAINT_BRASS,
    { section: "box", bone: chestLid, group: "chestLid" },
  );

  // Lid Interior Crimson Velvet Panel + Glowing Hextech Sun-Sigil visible when lid is open
  b.part(new THREE.BoxGeometry(0.68, 0.024, 0.38), PAINT_VELVET_RED, {
    bone: chestLid,
    at: [CHEST_X, HINGE_Y + 0.02, HINGE_Z + lidD * 0.5],
    group: "chestLid",
    name: "lidInnerVelvet",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.15, 10), "#ffffff", {
      bone: chestLid,
      at: [CHEST_X, HINGE_Y + 0.005, HINGE_Z + lidD * 0.5],
      dir: [0, -1, 0],
      axis: "z",
      texture: TEX_HEXTECH_SIGIL,
      group: "chestLid",
      name: "lidInnerHextechSigil",
    }),
    1.35,
  );

  // Hinged Front Lock Hasp on `chestLock` (child of `chestLid`)
  const haspOutline: OutlinePoint[] = [
    [-0.055, 0, "sharp"],
    [0.055, 0, "sharp"],
    [0.07, -0.07, "sharp"],
    [0, -0.13, "sharp"],
    [-0.07, -0.07, "sharp"],
  ];
  b.extrude(haspOutline, {
    at: [CHEST_X, HINGE_Y + 0.02, CHEST_Z + 0.25],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.026,
    bevel: 0.006,
    color: PAINT_GOLD_HERO,
    bone: chestLock,
    group: "chestLid",
    name: "chestLockHasp",
  });
  placeCutGem(
    [CHEST_X, HINGE_Y - 0.04, CHEST_Z + 0.265],
    [0, 0, 1],
    0.025,
    0.022,
    GEM_HEX_CYAN,
    "chestLid",
    false,
    6,
    chestLock,
  );

  // Pose the Chest Lid Open (-54 deg about X lifts the front of the lid up and back!)
  // and pose the Lock Clasp hanging slightly forward
  b.pose(chestLid, { axis: [1, 0, 0], deg: -54 });
  b.pose(chestLock, { axis: [1, 0, 0], deg: 28 });

  // =========================================================================
  // 3. ROYAL SUN-KING CROWN ON VELVET CUSHION (Front Hero Center: [-0.06, y, 0.36])
  // =========================================================================
  const CROWN_POS: V3 = [-0.06, 0.145, 0.36];
  const CROWN_UP: V3 = [0.1, 0.96, 0.24];

  // Plush Royal Crimson Velvet Cushion underneath the Crown
  const cushionStations = [
    { at: [-0.06, 0.095, 0.23], w: 0.25, h: 0.055 },
    { at: [-0.06, 0.115, 0.36], w: 0.31, h: 0.082 },
    { at: [-0.06, 0.088, 0.49], w: 0.25, h: 0.055 },
  ];
  b.loft(cushionStations, {
    color: PAINT_VELVET_RED,
    sides: 8,
    bone: root,
    group: "crown",
    name: "crownVelvetCushion",
  });

  // 4 Golden Tassels at the corners of the Crown Cushion
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cCorner: V3 = [-0.06 + sx * 0.13, 0.09, 0.36 + sz * 0.12];
      const cTip: V3 = [-0.06 + sx * 0.18, 0.052, 0.36 + sz * 0.17];
      b.capsule(cCorner, cTip, [0.014, 0.024], PAINT_GOLD_HERO, {
        sides: 6,
        bone: root,
        group: "crown",
      });
    }
  }

  // Turned Heavy Gold Crown Circlet Base (`b.lathe`)
  const crownR = 0.135;
  const crownCircletProfile: OutlinePoint[] = [
    [0, 0],
    [crownR * 0.96, 0, "sharp"],
    [crownR * 1.06, 0.018, "sharp"],
    [crownR * 0.98, 0.035],
    [crownR * 1.02, 0.072],
    [crownR * 1.1, 0.092, "sharp"],
    [crownR * 0.86, 0.095, "sharp"],
    [crownR * 0.84, 0.025],
    [0, 0.025],
  ];
  b.lathe(crownCircletProfile, {
    at: CROWN_POS,
    axis: CROWN_UP,
    segments: 8,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "crown",
    name: "crownCircletBase",
  });

  // Inner Crimson Velvet Sovereign Cap inside the Crown
  const capCenter = offset(CROWN_POS, CROWN_UP, 0.03);
  b.part(new THREE.SphereGeometry(crownR * 0.84, 8, 6), PAINT_VELVET_RED, {
    bone: root,
    at: capCenter,
    dir: CROWN_UP,
    scale: [1, 0.72, 1],
    group: "crown",
    name: "crownVelvetCap",
  });

  // 8 Heroic Flared Crown Spires & 8 Bezel-Set Brow Gems around the Crown Circlet
  const crownLine = frame(offset(CROWN_POS, CROWN_UP, 0.082), CROWN_UP);
  const spireTallOutline: OutlinePoint[] = [
    [-0.028, 0, "sharp"],
    [0.028, 0, "sharp"],
    [0.038, 0.065, "sharp"],
    [0.018, 0.095, "sharp"],
    [0, 0.145, "sharp"],
    [-0.018, 0.095, "sharp"],
    [-0.038, 0.065, "sharp"],
  ];
  const spireShortOutline: OutlinePoint[] = [
    [-0.022, 0, "sharp"],
    [0.022, 0, "sharp"],
    [0.026, 0.048, "sharp"],
    [0, 0.088, "sharp"],
    [-0.026, 0.048, "sharp"],
  ];
  const crownGemColors = [
    GEM_RUBY,
    GEM_HEX_CYAN,
    GEM_AMETHYST,
    GEM_HEX_CYAN,
    GEM_RUBY,
    GEM_EMERALD,
    GEM_AMETHYST,
    GEM_EMERALD,
  ];

  b.ring(crownLine, { count: 8, radius: crownR * 0.98 }, (item) => {
    const isTall = item.i % 2 === 0;
    const tangent = vec(CROWN_UP).cross(item.outward).normalize();
    const spireUp = vec(CROWN_UP).addScaledVector(item.outward, isTall ? 0.28 : 0.18).normalize();
    b.extrude(isTall ? spireTallOutline : spireShortOutline, {
      at: item.at,
      x: tangent,
      y: spireUp,
      thickness: isTall ? 0.022 : 0.018,
      bevel: 0.005,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "crown",
    });

    // Brow gem on the circlet band directly below each spire
    const gemPos = offset(
      offset(CROWN_POS, CROWN_UP, 0.052),
      item.outward,
      crownR * 1.0,
    );
    const isFrontHero = item.i === 0;
    placeCutGem(
      gemPos,
      item.outward,
      isFrontHero ? 0.032 : 0.022,
      isFrontHero ? 0.028 : 0.02,
      crownGemColors[item.i],
      "crown",
      true,
      6,
    );
  });

  // 4 Sovereign Arched Gold Ribs rising to the Crown Apex Orb & Glowing Star Finial
  const crownApex = offset(CROWN_POS, CROWN_UP, 0.22);
  b.ring(crownLine, { count: 4, radius: crownR * 0.95 }, (item) => {
    const p0 = item.at;
    const p1 = offset(offset(p0, CROWN_UP, 0.12), item.outward, 0.03);
    const p2 = offset(crownApex, item.outward, 0.04);
    b.sweep(bezier(p0, p1, p2, crownApex), [0.016, 0.012], {
      sides: 5,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "crown",
    });
  });

  // Sovereign Apex Gold Orb + Glowing Hextech Star Finial
  b.part(new THREE.SphereGeometry(0.028, 8, 6), PAINT_GOLD_HERO, {
    bone: root,
    at: crownApex,
    group: "crown",
    name: "crownApexOrb",
  });
  placeCutGem(
    offset(crownApex, CROWN_UP, 0.022),
    CROWN_UP,
    0.026,
    0.048,
    GEM_HEX_CYAN,
    "crown",
    true,
    6,
  );

  // =========================================================================
  // 4. CEREMONIAL GOBLETS, RELIC TAZZA, EWER & HINGED JEWELRY COFFER
  // =========================================================================

  // Shared ornate goblet profile for Lathe
  const gobletProfile: OutlinePoint[] = [
    [0, 0],
    [0.092, 0, "sharp"],
    [0.095, 0.016, "sharp"],
    [0.068, 0.034],
    [0.024, 0.062],
    [0.02, 0.105],
    [0.038, 0.135, "sharp"],
    [0.02, 0.165],
    [0.032, 0.195],
    [0.075, 0.235],
    [0.102, 0.295],
    [0.112, 0.34, "sharp"],
    [0.096, 0.34, "sharp"],
    [0.075, 0.28],
    [0.042, 0.225],
    [0, 0.205],
  ];

  // --- 4A. Standing Grand Jeweled King's Chalice (Front-Right: [-0.44, 0.04, 0.24]) ---
  const CHALICE_POS: V3 = [-0.44, 0.045, 0.24];
  b.lathe(gobletProfile, {
    at: CHALICE_POS,
    segments: 10,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "goblets",
    name: "grandChaliceBody",
  });

  // Glowing Arcane Amethyst Elixir filling the Grand Chalice bowl + rising magic bubbles
  glow(
    b.part(new THREE.CylinderGeometry(0.092, 0.065, 0.04, 10), GEM_AMETHYST, {
      bone: root,
      at: [CHALICE_POS[0], CHALICE_POS[1] + 0.305, CHALICE_POS[2]],
      group: "goblets",
      name: "grandChaliceElixir",
    }),
    1.35,
  );
  for (const [bx, by, bz, br] of [
    [-0.02, 0.33, 0.01, 0.015],
    [0.025, 0.335, -0.015, 0.012],
    [0.005, 0.345, 0.025, 0.01],
  ]) {
    glow(
      b.part(new THREE.SphereGeometry(br, 6, 4), "#f08cff", {
        bone: root,
        at: [CHALICE_POS[0] + bx, CHALICE_POS[1] + by, CHALICE_POS[2] + bz],
        group: "goblets",
      }),
      1.5,
    );
  }

  // Twin Scrolled Dragon-Wing Handles & 4 Bowl Emerald Cabochons on the Grand Chalice
  for (const sx of [-1, 1]) {
    const hCurve = catmull([
      [CHALICE_POS[0] + sx * 0.088, CHALICE_POS[1] + 0.31, CHALICE_POS[2]],
      [CHALICE_POS[0] + sx * 0.155, CHALICE_POS[1] + 0.33, CHALICE_POS[2]],
      [CHALICE_POS[0] + sx * 0.145, CHALICE_POS[1] + 0.24, CHALICE_POS[2]],
      [CHALICE_POS[0] + sx * 0.068, CHALICE_POS[1] + 0.195, CHALICE_POS[2]],
    ]);
    b.sweep(hCurve, [0.014, 0.01], {
      sides: 5,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "goblets",
    });
  }
  b.ring(
    frame([CHALICE_POS[0], CHALICE_POS[1] + 0.265, CHALICE_POS[2]], [0, 1, 0]),
    { count: 4, radius: 0.088 },
    (item) => {
      placeCutGem(item.at, item.outward, 0.022, 0.018, GEM_EMERALD, "goblets", true, 6);
    },
  );

  // --- 4B. Toppled Spilling Golden Goblet (Front-Left: [0.26, 0.075, 0.40]) ---
  const TOPPLED_POS: V3 = [0.18, 0.085, 0.34];
  const TOPPLED_AXIS: V3 = [0.68, -0.1, 0.72];
  b.lathe(
    gobletProfile.map(([x, y, s]) => (s ? [x * 0.85, y * 0.85, "sharp"] : [x * 0.85, y * 0.85])),
    {
      at: TOPPLED_POS,
      axis: TOPPLED_AXIS,
      segments: 8,
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "goblets",
      name: "toppledGobletBody",
    },
  );

  // Spilling glowing ruby stream & gems pouring out of the toppled goblet mouth onto the floor
  const mouthCenter = offset(TOPPLED_POS, TOPPLED_AXIS, 0.25);
  const spillPath = catmull([
    mouthCenter,
    [mouthCenter.x + 0.05, 0.052, mouthCenter.z + 0.06],
    [mouthCenter.x + 0.11, 0.022, mouthCenter.z + 0.12],
    [mouthCenter.x + 0.16, 0.012, mouthCenter.z + 0.18],
  ]);
  glow(
    b.sweep(spillPath, [0.042, 0.065], {
      sides: 6,
      color: GEM_RUBY,
      bone: root,
      group: "goblets",
      name: "spilledRubyStream",
    }),
    1.25,
  );

  // --- 4C. Wide Two-Handled Golden Relic Tazza Bowl (Mid-Right: [-0.52, 0.04, -0.06]) ---
  const TAZZA_POS: V3 = [-0.52, 0.04, -0.06];
  const tazzaProfile: OutlinePoint[] = [
    [0, 0],
    [0.095, 0, "sharp"],
    [0.088, 0.02],
    [0.032, 0.048],
    [0.028, 0.095],
    [0.055, 0.12],
    [0.145, 0.155],
    [0.165, 0.195, "sharp"],
    [0.145, 0.195, "sharp"],
    [0.11, 0.155],
    [0, 0.14],
  ];
  b.lathe(tazzaProfile, {
    at: TAZZA_POS,
    segments: 10,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "goblets",
    name: "relicTazzaBowl",
  });
  // Coin & gem mound inside the Tazza bowl
  b.part(new THREE.SphereGeometry(0.135, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), PAINT_COIN_MOUND, {
    bone: root,
    at: [TAZZA_POS[0], TAZZA_POS[1] + 0.155, TAZZA_POS[2]],
    scale: [1, 0.55, 1],
    flat: true,
    group: "goblets",
  });
  for (const sz of [-1, 1]) {
    const tHandle = catmull([
      [TAZZA_POS[0], TAZZA_POS[1] + 0.185, TAZZA_POS[2] + sz * 0.15],
      [TAZZA_POS[0], TAZZA_POS[1] + 0.22, TAZZA_POS[2] + sz * 0.21],
      [TAZZA_POS[0], TAZZA_POS[1] + 0.15, TAZZA_POS[2] + sz * 0.18],
      [TAZZA_POS[0], TAZZA_POS[1] + 0.135, TAZZA_POS[2] + sz * 0.11],
    ]);
    b.sweep(tHandle, 0.012, { sides: 5, color: PAINT_GOLD_HERO, bone: root, group: "goblets" });
  }

  // --- 4D. Tall Fluted Golden Ewer Pitcher (Back-Left: [0.50, 0.04, -0.28]) ---
  const EWER_POS: V3 = [0.5, 0.04, -0.28];
  const ewerProfile: OutlinePoint[] = [
    [0, 0],
    [0.082, 0, "sharp"],
    [0.075, 0.022],
    [0.032, 0.055],
    [0.095, 0.135],
    [0.105, 0.2, "sharp"],
    [0.055, 0.275],
    [0.042, 0.335],
    [0.072, 0.385, "sharp"],
    [0.052, 0.385, "sharp"],
    [0.03, 0.31],
    [0, 0.29],
  ];
  b.lathe(ewerProfile, {
    at: EWER_POS,
    segments: 8,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "goblets",
    name: "goldenEwerPitcher",
  });
  // High arched ewer handle
  const ewerHandle = catmull([
    [EWER_POS[0] + 0.055, EWER_POS[1] + 0.36, EWER_POS[2]],
    [EWER_POS[0] + 0.145, EWER_POS[1] + 0.41, EWER_POS[2]],
    [EWER_POS[0] + 0.15, EWER_POS[1] + 0.26, EWER_POS[2]],
    [EWER_POS[0] + 0.098, EWER_POS[1] + 0.18, EWER_POS[2]],
  ]);
  b.sweep(ewerHandle, [0.015, 0.011], {
    sides: 5,
    color: PAINT_GOLD_HERO,
    bone: root,
    group: "goblets",
  });
  placeCutGem(
    [EWER_POS[0] - 0.05, EWER_POS[1] + 0.2, EWER_POS[2] + 0.09],
    [-0.45, 0.1, 0.88],
    0.03,
    0.025,
    GEM_SAPPHIRE,
    "goblets",
    true,
    6,
  );

  // --- 4E. Hinged Gilded Reliquary Coffer (Mid-Left: [0.48, 0.06, -0.08], with `cofferLid`) ---
  b.frustumBox(
    [COFFER_X, COFFER_Y, COFFER_Z],
    [COFFER_X, COFFER_Y + 0.13, COFFER_Z],
    [0.24, 0.18],
    [0.27, 0.2],
    {
      color: PAINT_WOOD_CHEST,
      bone: root,
      group: "coffer",
      name: "cofferHull",
    },
  );
  b.frustumBox(
    [COFFER_X, COFFER_Y + 0.105, COFFER_Z],
    [COFFER_X, COFFER_Y + 0.135, COFFER_Z],
    [0.285, 0.215],
    [0.295, 0.22],
    {
      color: PAINT_GOLD_HERO,
      bone: root,
      group: "coffer",
      name: "cofferRim",
    },
  );
  // Coffer interior coin & emerald mound
  b.part(new THREE.SphereGeometry(0.11, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), PAINT_COIN_MOUND, {
    bone: root,
    at: [COFFER_X, COFFER_Y + 0.12, COFFER_Z],
    scale: [1.1, 0.55, 0.8],
    flat: true,
    group: "coffer",
  });
  // Coffer hinged lid on `cofferLid`
  b.frustumBox(
    [COFFER_X, COFFER_Y + 0.13, COFFER_Z],
    [COFFER_X, COFFER_Y + 0.185, COFFER_Z],
    [0.28, 0.21],
    [0.22, 0.15],
    {
      color: PAINT_GOLD_HERO,
      bone: cofferLid,
      group: "coffer",
      name: "cofferLidBox",
    },
  );
  placeCutGem(
    [COFFER_X, COFFER_Y + 0.185, COFFER_Z],
    [0, 1, 0],
    0.032,
    0.026,
    GEM_EMERALD,
    "coffer",
    true,
    6,
    cofferLid,
  );
  b.pose(cofferLid, { axis: [1, 0, 0], deg: -44 });

  // =========================================================================
  // 5. GOLD BULLION INGOTS, PRECARIOUS COIN STACKS & 300+ SCATTERED COINS
  // =========================================================================

  // Pyramid of 6 Stamped Trapezoidal Gold Bullion Bars at Front-Left ([0.44, y, 0.18])
  const ingotPositions: Array<{ pos: V3; yaw: number }> = [
    // Bottom row of 3
    { pos: [0.36, 0.055, 0.18], yaw: 14 },
    { pos: [0.46, 0.055, 0.16], yaw: 12 },
    { pos: [0.56, 0.055, 0.14], yaw: 16 },
    // Middle row of 2
    { pos: [0.41, 0.1, 0.17], yaw: 10 },
    { pos: [0.51, 0.1, 0.15], yaw: 15 },
    // Top bar + 1 angled leaning bar
    { pos: [0.46, 0.145, 0.16], yaw: 8 },
    { pos: [0.31, 0.055, 0.28], yaw: -32 },
  ];

  for (const [idx, ing] of ingotPositions.entries()) {
    const rad = ing.yaw * DEG;
    const dx = Math.sin(rad) * 0.085;
    const dz = Math.cos(rad) * 0.085;
    const upDir: V3 = [Math.cos(rad), 0, -Math.sin(rad)];
    b.frustumBox(
      [ing.pos[0] - dx, ing.pos[1], ing.pos[2] - dz],
      [ing.pos[0] + dx, ing.pos[1], ing.pos[2] + dz],
      [0.072, 0.048],
      [0.072, 0.048],
      {
        up: upDir,
        color: PAINT_GOLD_HERO,
        bone: root,
        group: "coins",
        name: `goldIngot_${idx}`,
      },
    );
    // Bevelled top stamp plaque on each ingot
    b.frustumBox(
      [ing.pos[0] - dx * 0.72, ing.pos[1] + 0.025, ing.pos[2] - dz * 0.72],
      [ing.pos[0] + dx * 0.72, ing.pos[1] + 0.025, ing.pos[2] + dz * 0.72],
      [0.048, 0.012],
      [0.048, 0.012],
      {
        up: upDir,
        color: GOLD_SPEC,
        bone: root,
        group: "coins",
      },
    );
  }

  // Merged Coin Geometry Batches (3 rich gold tones, 100% indexed CylinderGeometries)
  const coinBatchBright: THREE.BufferGeometry[] = [];
  const coinBatchMid: THREE.BufferGeometry[] = [];
  const coinBatchBrass: THREE.BufferGeometry[] = [];

  function pushCoin(
    x: number,
    y: number,
    z: number,
    r: number,
    h: number,
    rx = 0,
    ry = 0,
    rz = 0,
    shade = 0,
  ) {
    const geo = new THREE.CylinderGeometry(r, r, h, 8, 1);
    if (rx !== 0 || ry !== 0 || rz !== 0) {
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG));
      geo.applyMatrix4(m);
    }
    geo.translate(x, y, z);
    if (shade % 3 === 0) coinBatchBright.push(geo);
    else if (shade % 3 === 1) coinBatchMid.push(geo);
    else coinBatchBrass.push(geo);
  }

  // 20 Precarious Coin Stacks around the Chest, Goblets, and Crown
  const stackSpecs: Array<[number, number, number, number]> = [
    [-0.28, 0.05, 0.28, 11],
    [-0.22, 0.055, 0.33, 8],
    [-0.33, 0.045, 0.22, 7],
    [-0.58, 0.035, 0.16, 10],
    [-0.62, 0.025, 0.08, 6],
    [0.14, 0.06, 0.22, 12],
    [0.2, 0.055, 0.18, 9],
    [0.08, 0.05, 0.48, 8],
    [-0.24, 0.04, 0.48, 7],
    [0.36, 0.035, 0.38, 9],
    [-0.42, 0.04, -0.26, 10],
    [-0.35, 0.045, -0.32, 7],
    [0.34, 0.045, -0.26, 11],
    [0.4, 0.04, -0.33, 8],
    [0.6, 0.025, -0.02, 7],
    [-0.64, 0.02, -0.14, 6],
    // Stacks inside the open chest rim
    [CHEST_X - 0.26, HINGE_Y + 0.02, CHEST_Z + 0.06, 8],
    [CHEST_X + 0.24, HINGE_Y + 0.02, CHEST_Z - 0.04, 9],
    [CHEST_X - 0.08, HINGE_Y + 0.06, CHEST_Z - 0.06, 7],
    [CHEST_X + 0.08, HINGE_Y + 0.05, CHEST_Z + 0.05, 8],
  ];

  for (const [sx, sy, sz, count] of stackSpecs) {
    const coinH = 0.011;
    const coinR = 0.026;
    for (let k = 0; k < count; k++) {
      const wobbleX = (rand() - 0.5) * 0.008;
      const wobbleZ = (rand() - 0.5) * 0.008;
      const tiltX = (rand() - 0.5) * 4;
      const tiltZ = (rand() - 0.5) * 4;
      pushCoin(
        sx + wobbleX,
        sy + k * coinH,
        sz + wobbleZ,
        coinR,
        coinH,
        tiltX,
        rand() * 360,
        tiltZ,
        k,
      );
    }
  }

  // 160 Scattered Individual Coins across the Coin Mounds, Floor Perimeter, and Chest Cascade
  for (let i = 0; i < 110; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = 0.14 + rand() * 0.56;
    const cx = Math.cos(angle) * dist * 1.08;
    const cz = 0.06 + Math.sin(angle) * dist * 0.88;
    // Estimate mound surface height so coins rest naturally on the mound or floor
    const rNorm = Math.hypot(cx / 0.68, (cz - 0.06) / 0.58);
    const cy = rNorm < 0.85 ? 0.012 + Math.max(0, (1 - rNorm * rNorm) * 0.075) : 0.008;
    const tiltX = (rand() - 0.5) * 28;
    const tiltZ = (rand() - 0.5) * 28;
    pushCoin(cx, cy, cz, 0.022 + rand() * 0.007, 0.009, tiltX, rand() * 360, tiltZ, i);
  }

  // 45 Coins tumbling down the Chest Front Cascade & piled inside the Chest
  for (let i = 0; i < 45; i++) {
    const t = rand();
    const cx = CHEST_X + (rand() - 0.5) * 0.48;
    const cy = 0.06 + (1 - t) * 0.44 + (rand() - 0.5) * 0.02;
    const cz = CHEST_Z + 0.04 + t * 0.38;
    pushCoin(
      cx,
      cy,
      cz,
      0.024 + rand() * 0.006,
      0.01,
      20 + rand() * 35,
      rand() * 360,
      (rand() - 0.5) * 35,
      i,
    );
  }

  b.part(mergeGeometries(coinBatchBright)!, GOLD_BRIGHT, {
    bone: root,
    at: [0, 0, 0],
    group: "coins",
    name: "coinsBrightMerged",
  });
  b.part(mergeGeometries(coinBatchMid)!, PAINT_GOLD_HERO, {
    bone: root,
    at: [0, 0, 0],
    group: "coins",
    name: "coinsMidMerged",
  });
  b.part(mergeGeometries(coinBatchBrass)!, BRASS_WARM, {
    bone: root,
    at: [0, 0, 0],
    group: "coins",
    name: "coinsBrassMerged",
  });

  // 10 Hero Stamped Royal Sun-Crest Medallions (textured discs glinting on top of the hoard)
  const medallionSpots: Array<{ at: V3; dir: V3 }> = [
    { at: [CHEST_X + 0.02, HINGE_Y + 0.11, CHEST_Z + 0.06], dir: [0.1, 0.85, 0.5] },
    { at: [CHEST_X - 0.14, HINGE_Y + 0.09, CHEST_Z + 0.12], dir: [-0.2, 0.75, 0.6] },
    { at: [CHEST_X + 0.16, 0.28, CHEST_Z + 0.28], dir: [0.25, 0.55, 0.8] },
    { at: [-0.24, 0.095, 0.24], dir: [-0.15, 0.92, 0.35] },
    { at: [0.12, 0.095, 0.3], dir: [0.2, 0.9, 0.38] },
    { at: [-0.36, 0.075, 0.38], dir: [-0.25, 0.9, 0.3] },
    { at: [0.34, 0.065, 0.32], dir: [0.3, 0.88, 0.35] },
    { at: [-0.52, 0.245, -0.06], dir: [0, 0.95, 0.3] },
    { at: [COFFER_X, COFFER_Y + 0.17, COFFER_Z + 0.04], dir: [0.1, 0.8, 0.58] },
    { at: [-0.04, 0.045, 0.54], dir: [0, 0.95, 0.3] },
  ];

  for (const [idx, med] of medallionSpots.entries()) {
    b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 10), PAINT_GOLD_HERO, {
      bone: root,
      at: med.at,
      dir: med.dir,
      group: "coins",
      name: `heroMedallionRim_${idx}`,
    });
    const facePos = offset(med.at, med.dir, 0.008);
    b.part(new THREE.CircleGeometry(0.034, 10), "#ffffff", {
      bone: root,
      at: facePos,
      dir: med.dir,
      axis: "z",
      texture: TEX_COIN_CREST,
      group: "coins",
    });
  }

  // =========================================================================
  // 6. ARCANE CRYSTAL CLUSTERS, CUT GEMS & HEXTECH SPARKLE CARDS
  // =========================================================================

  // Back-Right Giant Hextech Cyan & Amethyst Crystal Cluster ([-0.54, y, -0.26])
  const clusterRSpireSpecs: Array<{ base: V3; tip: V3; r: number; col: string }> = [
    { base: [-0.54, 0.03, -0.26], tip: [-0.62, 0.38, -0.32], r: 0.055, col: GEM_HEX_CYAN },
    { base: [-0.5, 0.03, -0.24], tip: [-0.46, 0.31, -0.2], r: 0.044, col: GEM_SAPPHIRE },
    { base: [-0.57, 0.03, -0.22], tip: [-0.68, 0.26, -0.16], r: 0.04, col: GEM_AMETHYST },
    { base: [-0.52, 0.03, -0.3], tip: [-0.54, 0.28, -0.42], r: 0.038, col: GEM_HEX_CYAN },
    { base: [-0.47, 0.03, -0.28], tip: [-0.39, 0.21, -0.34], r: 0.032, col: GEM_AMETHYST },
  ];
  for (const sp of clusterRSpireSpecs) {
    placeCrystalSpire(sp.base, sp.tip, sp.r, sp.col, "gems", true);
  }

  // Front-Left Emerald & Ruby Arcane Crystal Cluster ([0.58, y, 0.08])
  const clusterLSpireSpecs: Array<{ base: V3; tip: V3; r: number; col: string }> = [
    { base: [0.58, 0.03, 0.08], tip: [0.68, 0.34, 0.12], r: 0.05, col: GEM_EMERALD },
    { base: [0.54, 0.03, 0.11], tip: [0.52, 0.27, 0.2], r: 0.038, col: GEM_HEX_CYAN },
    { base: [0.61, 0.03, 0.04], tip: [0.72, 0.23, -0.02], r: 0.036, col: GEM_EMERALD },
    { base: [0.55, 0.03, 0.05], tip: [0.48, 0.21, 0.02], r: 0.03, col: GEM_TOPAZ },
  ];
  for (const sp of clusterLSpireSpecs) {
    placeCrystalSpire(sp.base, sp.tip, sp.r, sp.col, "gems", true);
  }

  // Crystal Spires jutting directly out of the Open Treasure Chest Hoard
  placeCrystalSpire(
    [CHEST_X + 0.18, HINGE_Y + 0.02, CHEST_Z + 0.02],
    [CHEST_X + 0.28, HINGE_Y + 0.24, CHEST_Z + 0.12],
    0.038,
    GEM_HEX_CYAN,
    "gems",
    true,
  );
  placeCrystalSpire(
    [CHEST_X - 0.06, HINGE_Y + 0.04, CHEST_Z + 0.04],
    [CHEST_X - 0.1, HINGE_Y + 0.23, CHEST_Z + 0.14],
    0.035,
    GEM_RUBY,
    "gems",
    true,
  );
  placeCrystalSpire(
    [CHEST_X + 0.06, HINGE_Y + 0.04, CHEST_Z - 0.02],
    [CHEST_X + 0.09, HINGE_Y + 0.21, CHEST_Z + 0.05],
    0.032,
    GEM_AMETHYST,
    "gems",
    false,
  );

  // 22 Scattered Cut Gemstones in Gold Bezels across the Hoard
  const scatteredGems: Array<{ at: V3; dir: V3; r: number; h: number; col: string }> = [
    // Inside chest hoard
    { at: [CHEST_X - 0.22, HINGE_Y + 0.07, CHEST_Z + 0.08], dir: [-0.2, 0.85, 0.5], r: 0.034, h: 0.032, col: GEM_EMERALD },
    { at: [CHEST_X + 0.02, HINGE_Y + 0.1, CHEST_Z - 0.04], dir: [0.1, 0.9, 0.4], r: 0.036, h: 0.034, col: GEM_TOPAZ },
    { at: [CHEST_X + 0.26, HINGE_Y + 0.06, CHEST_Z + 0.08], dir: [0.3, 0.8, 0.5], r: 0.032, h: 0.03, col: GEM_RUBY },
    // On chest front coin cascade
    { at: [CHEST_X - 0.08, 0.31, CHEST_Z + 0.27], dir: [-0.1, 0.65, 0.75], r: 0.035, h: 0.032, col: GEM_HEX_CYAN },
    { at: [CHEST_X + 0.11, 0.21, CHEST_Z + 0.34], dir: [0.2, 0.75, 0.62], r: 0.034, h: 0.03, col: GEM_AMETHYST },
    { at: [CHEST_X - 0.02, 0.12, CHEST_Z + 0.41], dir: [0, 0.85, 0.52], r: 0.036, h: 0.032, col: GEM_RUBY },
    // Around the Royal Crown & Foreground
    { at: [-0.24, 0.08, 0.38], dir: [-0.25, 0.9, 0.35], r: 0.036, h: 0.034, col: GEM_SAPPHIRE },
    { at: [0.12, 0.075, 0.46], dir: [0.2, 0.92, 0.32], r: 0.038, h: 0.035, col: GEM_HEX_CYAN },
    { at: [-0.18, 0.045, 0.54], dir: [-0.1, 0.95, 0.3], r: 0.032, h: 0.028, col: GEM_EMERALD },
    { at: [0.06, 0.04, 0.56], dir: [0.15, 0.94, 0.3], r: 0.03, h: 0.028, col: GEM_TOPAZ },
    // Spilling from the Toppled Goblet
    { at: [0.31, 0.045, 0.46], dir: [0.3, 0.88, 0.35], r: 0.03, h: 0.028, col: GEM_RUBY },
    { at: [0.38, 0.028, 0.52], dir: [0.4, 0.85, 0.32], r: 0.028, h: 0.026, col: GEM_AMETHYST },
    // Inside Relic Tazza Bowl & Coffer
    { at: [-0.49, 0.23, -0.03], dir: [0.2, 0.92, 0.32], r: 0.032, h: 0.03, col: GEM_RUBY },
    { at: [-0.56, 0.225, -0.08], dir: [-0.25, 0.9, 0.35], r: 0.03, h: 0.028, col: GEM_HEX_CYAN },
    { at: [COFFER_X - 0.05, COFFER_Y + 0.16, COFFER_Z + 0.02], dir: [-0.2, 0.9, 0.38], r: 0.03, h: 0.028, col: GEM_EMERALD },
    { at: [COFFER_X + 0.06, COFFER_Y + 0.155, COFFER_Z + 0.03], dir: [0.25, 0.88, 0.4], r: 0.028, h: 0.026, col: GEM_SAPPHIRE },
    // Flanking the ingots & chalice
    { at: [-0.32, 0.065, 0.14], dir: [-0.2, 0.92, 0.32], r: 0.034, h: 0.03, col: GEM_TOPAZ },
    { at: [0.28, 0.06, 0.08], dir: [0.25, 0.9, 0.35], r: 0.032, h: 0.028, col: GEM_AMETHYST },
  ];

  for (const g of scatteredGems) {
    placeCutGem(g.at, g.dir, g.r, g.h, g.col, "gems", true, 6);
  }

  // Glowing Star-Glint & Arcane Sparkle Cards (`b.cards` with `cross: true` & `glow`)
  const sparkleFrames = [
    frame([CHEST_X + 0.26, HINGE_Y + 0.22, CHEST_Z + 0.11], [0, 1, 0]),
    frame([CHEST_X - 0.09, HINGE_Y + 0.21, CHEST_Z + 0.13], [0, 1, 0]),
    frame(offset(crownApex, CROWN_UP, 0.055), [0, 1, 0]),
    frame([CHALICE_POS[0], CHALICE_POS[1] + 0.35, CHALICE_POS[2]], [0, 1, 0]),
    frame([-0.61, 0.36, -0.31], [0, 1, 0]),
    frame([0.66, 0.32, 0.11], [0, 1, 0]),
  ];
  glow(
    b.cards(sparkleFrames, TEX_SPARKLE_CARD, {
      size: [0.065, 0.065],
      cross: true,
      spin: 25,
      rng: rng(99),
      bone: root,
      group: "gems",
      name: "arcaneSparkleCards",
    }),
    1.5,
  );

  return b.root;
}
