import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { arc, bezier, catmull, polyline } from "../../../../src/path";
import { cells, countershade, grain, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bilgewater & Hextech Treasure Hoard",
  description:
    "League of Legends stylized treasure hoard with an ornate arcane-bound chest, radiant jewel-crested crown, ceremonial goblets, glowing Hextech crystals, and overflowing piles of stamped gold coins and gems.",
  style: "League of Legends",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "treasureHoard", detail: 1, paintSize: 2048 });

  // ============================================================================
  // PALETTE & PAINTS (League of Legends stylized hand-painted look)
  // ============================================================================

  // Flat colors (kept well below 64 limit; also used for glowing parts)
  const GOLD_BRIGHT = "#ffd447";
  const GOLD_MID = "#e6a11c";
  const GOLD_DARK = "#9e600c";
  const GOLD_BRONZE = "#75430b";
  const SILVER_BRIGHT = "#d8e6f2";
  const IRON_DARK = "#242834";
  const IRON_TRIM = "#363d4f";
  const VELVET_RED = "#9c1428";
  const VELVET_DARK = "#570815";
  const RUBY_GLOW = "#ff244c";
  const RUBY_DEEP = "#a80b28";
  const HEX_CYAN = "#26f7fd";
  const HEX_BLUE = "#118df0";
  const EMERALD_GLOW = "#1cf287";
  const AMETHYST_GLOW = "#c842ff";
  const AMBER_GLOW = "#ff9d1c";
  const PEARL_CREAM = "#fff6e8";
  const WINE_PURPLE = "#59092b";

  // Stylized Hand-Painted Gold (warm lit top, rich bronze-orange underside, edge highlights)
  const PAINT_GOLD = paint((p, n) => {
    const upFactor = smoothstep(-0.4, 0.85, n.y);
    const frontFactor = smoothstep(-0.5, 0.7, n.z * 0.6 + n.x * 0.3);
    const nVal = noise(p, 0.14, 101);
    const base = mix(GOLD_BRONZE, GOLD_MID, upFactor * 0.75 + frontFactor * 0.25);
    const lit = mix(base, GOLD_BRIGHT, smoothstep(0.45, 0.92, upFactor * 0.8 + nVal * 0.35));
    const ridge = Math.abs(n.x) * Math.abs(n.y) + Math.abs(n.z) * Math.abs(n.y);
    return mix(lit, "#fff29c", smoothstep(0.42, 0.52, ridge) * 0.35);
  });

  // Aged Brass / Ornate Chest Frame Gold
  const PAINT_BRASS = paint((p, n) => {
    const wear = noise(p, 0.12, 202);
    const up = smoothstep(-0.3, 0.8, n.y);
    const col = mix("#59330a", "#d68d18", up * 0.75 + wear * 0.25);
    return mix(col, "#ffdf6b", smoothstep(0.65, 0.95, up + wear * 0.3) * 0.65);
  });

  // Dark Forged Gunmetal / Runeterra Iron Trim
  const PAINT_IRON = paint((p, n) => {
    const up = smoothstep(-0.5, 0.8, n.y);
    const streak = noise(p, 0.18, 303);
    const base = mix("#171a24", "#3b4459", up * 0.7 + streak * 0.3);
    return mix(base, "#657394", smoothstep(0.7, 0.96, n.y * 0.8 + Math.abs(n.z) * 0.3) * 0.5);
  });

  // Rich Crimson/Burgundy Hardwood Planks for the Chest
  const PAINT_WOOD = paint((p, n) => {
    const g = grain("#4a1410", "#7d2618", { size: 0.045, axis: "x", seed: 404 }).at(p, n);
    const plankGap = Math.abs(((p.y * 14) % 1 + 1) % 1 - 0.5);
    const darkened = plankGap > 0.45 ? mix(g, "#1f0705", 0.75) : g;
    const shade = smoothstep(-0.4, 0.8, n.y * 0.6 + n.z * 0.4);
    return mix("#2b0907", darkened, 0.45 + 0.55 * shade);
  });

  // Royal Crimson Velvet Cushion / Cloth Drape
  const PAINT_VELVET = paint((p, n) => {
    const rim = 1 - Math.abs(n.y * 0.5 + n.z * 0.5);
    const fold = noise(p, 0.09, 505);
    const base = mix(VELVET_DARK, VELVET_RED, smoothstep(-0.2, 0.75, n.y) * 0.8 + fold * 0.2);
    return mix(base, "#eb3b5a", smoothstep(0.45, 0.88, rim) * 0.55);
  });

  // Shimmering Coin Pile Surface Paint (packed cellular gold coins with dark crevices & glints)
  const PAINT_COIN_MOUND = paint((p, n) => {
    const c1 = cells(p, 0.055, 606);
    const c2 = cells(p, 0.038, 607);
    const edge1 = smoothstep(0.03, 0.14, c1.d2 - c1.d1);
    const edge2 = smoothstep(0.03, 0.14, c2.d2 - c2.d1);
    const coinTone = mix("#b8740f", "#ffd84d", c1.id * 0.65 + c2.id * 0.35);
    const rimHighlight = smoothstep(0.18, 0.06, Math.abs(c1.d1 - 0.28)) * 0.4;
    const lit = mix(coinTone, "#fff5a8", rimHighlight + smoothstep(0.4, 0.95, n.y) * 0.35);
    const crevice = mix("#3d2004", lit, edge1 * 0.7 + edge2 * 0.3);
    const heightGlow = smoothstep(0.02, 0.32, p.y);
    return mix("#4a2805", crevice, 0.45 + 0.55 * heightGlow);
  });

  // Obsidian / Arcane Carved Temple Stone Plinth
  const PAINT_STONE = countershade(
    mottle("#25293a", "#353c54", { size: 0.22, contrast: 1.4, seed: 707 }),
    "#161822",
    { level: 0.1, soft: 0.4 },
  );

  // Dragon-scale Scroll / Tome Leather Paint
  const PAINT_LEATHER_TEAL = scales(["#134f5c", "#196473", "#0e3d47"], "#09252b", {
    size: 0.035,
    width: 0.16,
    seed: 808,
  });

  // ============================================================================
  // SVG TEXTURES (Runes, Coin Stamping, Sparkle Cards, Arcane Crest)
  // ============================================================================

  // Stamped Ancient Gold Coin Texture
  const TEX_COIN = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="61" fill="#dba828" stroke="#8c5808" stroke-width="5"/>
      <circle cx="64" cy="64" r="52" fill="#ffd954" stroke="#9e640c" stroke-width="4" stroke-dasharray="10 6"/>
      <polygon points="64,22 76,50 106,64 76,78 64,106 52,78 22,64 52,50" fill="#b87611" stroke="#fff099" stroke-width="3"/>
      <polygon points="64,36 71,55 92,64 71,73 64,92 57,73 36,64 57,55" fill="#fff099"/>
      <circle cx="64" cy="64" r="9" fill="#9e640c"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing Arcane Hextech Rune Seal
  const TEX_HEX_RUNE = svg(
    `<svg viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="112" fill="none" stroke="#14b8ff" stroke-width="8" opacity="0.85"/>
      <circle cx="128" cy="128" r="94" fill="none" stroke="#6efbff" stroke-width="4" stroke-dasharray="18 10"/>
      <polygon points="128,24 218,76 218,180 128,232 38,180 38,76" fill="none" stroke="#26f7fd" stroke-width="6"/>
      <polygon points="128,48 196,168 60,168" fill="none" stroke="#a6ffff" stroke-width="5"/>
      <polygon points="128,208 196,88 60,88" fill="none" stroke="#26f7fd" stroke-width="5"/>
      <circle cx="128" cy="128" r="26" fill="#26f7fd" stroke="#ffffff" stroke-width="5"/>
      <circle cx="128" cy="24" r="9" fill="#a6ffff"/>
      <circle cx="218" cy="76" r="9" fill="#a6ffff"/>
      <circle cx="218" cy="180" r="9" fill="#a6ffff"/>
      <circle cx="128" cy="232" r="9" fill="#a6ffff"/>
      <circle cx="38" cy="180" r="9" fill="#a6ffff"/>
      <circle cx="38" cy="76" r="9" fill="#a6ffff"/>
    </svg>`,
    { size: 512 },
  );

  // Four-Pointed Starburst Glint Card Texture
  const TEX_SPARKLE = svg(
    `<svg viewBox="0 0 128 128">
      <polygon points="64,2 75,49 126,64 75,79 64,126 53,79 2,64 53,49" fill="#fff7b8"/>
      <polygon points="22,22 57,52 106,22 76,57 106,106 57,76 22,106 52,57" fill="#ffd447"/>
      <circle cx="64" cy="64" r="16" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // Ornate Banner / Scroll Parchment Texture
  const TEX_SCROLL_MAP = svg(
    `<svg viewBox="0 0 256 128">
      <rect x="4" y="4" width="248" height="120" rx="8" fill="#f2d7a7" stroke="#8c5a2b" stroke-width="8"/>
      <rect x="16" y="16" width="224" height="96" fill="none" stroke="#b57c3e" stroke-width="3" stroke-dasharray="12 6"/>
      <path d="M 36 88 Q 80 35 128 70 T 212 44" fill="none" stroke="#9e2a2b" stroke-width="5" stroke-dasharray="8 6"/>
      <path d="M 200 32 L 224 56 M 224 32 L 200 56" stroke="#c9182b" stroke-width="7" stroke-linecap="round"/>
      <circle cx="76" cy="58" r="18" fill="none" stroke="#4a3219" stroke-width="4"/>
      <polygon points="76,34 81,53 100,58 81,63 76,82 71,63 52,58 71,53" fill="#8c5a2b"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // SKELETON & MOVING JOINTS (Root + Hinge joints for moving lids/handles/scroll)
  // ============================================================================

  const root = b.joint("hoardRoot", { at: [0, 0.05, 0], dir: [0, 1, 0] });

  // Main Hero Chest at slight dramatic angle in center-back
  const chestCenter: V3 = [-0.05, 0.08, -0.14];
  const chestBase = b.joint("chestBase", {
    parent: root,
    at: chestCenter,
    dir: [0, 1, 0],
    up: [0.12, 0, 0.99],
  });

  // Chest Hinge at back upper rim of chest body (role: "hinge" per prop-group spec)
  const chestLidHinge = b.joint("chestLid", {
    parent: chestBase,
    at: chestBase.local([0, 0.36, -0.25]),
    dir: chestBase.dir([0, 1, 0]),
    up: chestBase.dir([0, 0, 1]),
    role: "hinge",
    group: "chestLid",
  });

  // Chest Front Lock Clasp Hinge
  const chestLockHinge = b.joint("chestLock", {
    parent: chestLidHinge,
    at: chestBase.local([0, 0.37, 0.27]),
    dir: chestBase.dir([0, -1, 0]),
    up: chestBase.dir([0, 0, 1]),
    role: "hinge",
    group: "chestLock",
  });

  // Chest Side Carrying Ring Hinges (Left and Right)
  const chestHandleR = b.joint("chestHandleR", {
    parent: chestBase,
    at: chestBase.local([0.46, 0.23, 0]),
    dir: chestBase.dir([0, -1, 0]),
    up: chestBase.dir([-1, 0, 0]),
    role: "hinge",
    group: "chestHandles",
  });
  const chestHandleL = b.joint("chestHandleL", {
    parent: chestBase,
    at: chestBase.local([-0.46, 0.23, 0]),
    dir: chestBase.dir([0, -1, 0]),
    up: chestBase.dir([1, 0, 0]),
    role: "hinge",
    group: "chestHandles",
  });

  // Side Jewelled Coffer (Smaller Relic Box on the right flank with hinged lid)
  const cofferBase = b.joint("cofferBase", {
    parent: root,
    at: [-0.54, 0.09, 0.16],
    dir: [0, 1, 0],
    up: [0.5, 0, 0.866],
    group: "coffer",
  });
  const cofferLid = b.joint("cofferLid", {
    parent: cofferBase,
    at: cofferBase.local([0, 0.17, -0.13]),
    dir: cofferBase.dir([0, 1, 0]),
    up: cofferBase.dir([0, 0, 1]),
    role: "hinge",
    group: "coffer",
  });

  // ============================================================================
  // 1. BASE & OVERFLOWING GOLD COIN MOUNDS (Touches y = 0 cleanly)
  // ============================================================================

  // Carved Octagonal Runeterra Vault Flagstone Base (sits squarely on y = 0)
  const plinthOutline: OutlinePoint[] = [
    [0, 0],
    [0.98, 0, "sharp"],
    [0.96, 0.035, "sharp"],
    [0.89, 0.055, "sharp"],
    [0.86, 0.075, "sharp"],
    [0, 0.075],
  ];
  b.lathe(plinthOutline, {
    bone: root,
    at: [0, 0, 0],
    segments: 8,
    spin: 22.5,
    color: PAINT_STONE,
    group: "plinth",
    name: "vaultPlinth",
  });

  // Gold-inlaid bevel trim ring around the plinth edge
  const plinthTrimPts: V3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + 22.5) * DEG;
    plinthTrimPts.push([Math.cos(a) * 0.91, 0.056, Math.sin(a) * 0.91]);
  }
  b.sweep(polyline(plinthTrimPts, { closed: true }), 0.016, {
    bone: root,
    section: { ngon: 4 },
    color: PAINT_BRASS,
    group: "plinth",
    name: "plinthGoldRim",
  });

  // Corner brass bolsters around the octagonal stone base
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 + 22.5) * DEG;
    const bx = Math.cos(a) * 0.93;
    const bz = Math.sin(a) * 0.93;
    b.frustumBox([bx, 0, bz], [bx * 0.96, 0.082, bz * 0.96], [0.09, 0.09], [0.07, 0.07], {
      bone: root,
      up: [bx, 0, bz],
      color: PAINT_BRASS,
      group: "plinth",
    });
  }

  // Sculpted Gold Coin Mounds (Lush dunes of coins spilling across the stone floor and down onto y = 0)
  const moundDefs: Array<{ at: V3; scale: V3; rot?: V3; name: string }> = [
    { at: [0.0, 0.04, 0.04], scale: [0.78, 0.22, 0.66], rot: [0, 12, 0], name: "coinMoundMain" },
    { at: [0.38, 0.03, 0.24], scale: [0.48, 0.18, 0.42], rot: [0, -25, 0], name: "coinMoundFrontLeft" },
    { at: [-0.36, 0.03, 0.26], scale: [0.46, 0.16, 0.4], rot: [0, 32, 0], name: "coinMoundFrontRight" },
    { at: [0.52, 0.025, -0.14], scale: [0.42, 0.17, 0.38], rot: [0, 18, 0], name: "coinMoundBackLeft" },
    { at: [-0.52, 0.025, -0.12], scale: [0.38, 0.15, 0.36], rot: [0, -18, 0], name: "coinMoundBackRight" },
    { at: [0.05, 0.02, 0.48], scale: [0.52, 0.13, 0.34], rot: [0, 5, 0], name: "coinMoundFore" },
    // Outer spills that touch y = 0 directly at the edge of the plinth
    { at: [0.68, 0.0, 0.48], scale: [0.28, 0.09, 0.24], rot: [0, 40, 0], name: "coinSpillOuterFL" },
    { at: [-0.62, 0.0, 0.54], scale: [0.26, 0.085, 0.22], rot: [0, -30, 0], name: "coinSpillOuterFR" },
    { at: [0.18, 0.0, 0.78], scale: [0.32, 0.08, 0.22], rot: [0, 10, 0], name: "coinSpillOuterFront" },
  ];

  const moundParts = moundDefs.map((m) =>
    b.part(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), PAINT_COIN_MOUND, {
      bone: root,
      at: m.at,
      scale: m.scale,
      rotation: m.rot ?? [0, 0, 0],
      flat: true,
      group: "coinMounds",
      name: m.name,
    }),
  );

  // Royal Velvet Drape / Carpet spilling from under the chest across the front mound
  const velvetDrapePath = catmull([
    [-0.05, 0.14, -0.1],
    [0.08, 0.19, 0.15],
    [0.14, 0.14, 0.38],
    [0.18, 0.078, 0.62],
    [0.21, 0.04, 0.84],
  ]);
  b.sweep(velvetDrapePath, (t) => [0.22 * (1 - 0.25 * t), 0.016], {
    bone: root,
    section: "box",
    caps: "flat",
    color: PAINT_VELVET,
    group: "velvetDrape",
    name: "royalRunnerCloth",
  });
  // Gold embroidery trim along both sides of the velvet runner
  for (const s of [-1, 1]) {
    const trimPts: V3[] = [
      [-0.05 + s * 0.21, 0.145, -0.1],
      [0.08 + s * 0.2, 0.196, 0.15],
      [0.14 + s * 0.18, 0.146, 0.38],
      [0.18 + s * 0.17, 0.084, 0.62],
      [0.21 + s * 0.16, 0.045, 0.84],
    ];
    b.sweep(catmull(trimPts), 0.011, {
      bone: root,
      sides: 5,
      color: PAINT_GOLD,
      group: "velvetDrape",
    });
  }

  // ============================================================================
  // 2. HERO CHEST (League of Legends Chunky Heroic Proportions, Open with Loot)
  // ============================================================================

  // Chest Lower Hull: Tapered heroic silhouette (wider at top rim than bottom)
  b.frustumBox(
    chestBase.local([0, 0.02, 0]),
    chestBase.local([0, 0.36, 0]),
    [0.74, 0.44],
    [0.88, 0.52],
    {
      bone: chestBase,
      up: chestBase.dir([0, 0, 1]),
      color: PAINT_WOOD,
      group: "chestBody",
      name: "chestWoodHull",
    },
  );

  // Heavy Iron Base Plinth & Upper Rim Collar of Chest Body
  b.frustumBox(
    chestBase.local([0, 0.0, 0]),
    chestBase.local([0, 0.07, 0]),
    [0.78, 0.48],
    [0.77, 0.47],
    {
      bone: chestBase,
      up: chestBase.dir([0, 0, 1]),
      color: PAINT_IRON,
      group: "chestBody",
      name: "chestIronSkirt",
    },
  );
  b.frustumBox(
    chestBase.local([0, 0.31, 0]),
    chestBase.local([0, 0.37, 0]),
    [0.88, 0.53],
    [0.92, 0.56],
    {
      bone: chestBase,
      up: chestBase.dir([0, 0, 1]),
      color: PAINT_BRASS,
      group: "chestBody",
      name: "chestUpperRim",
    },
  );

  // 4 Chunky Heroic Corner Struts + Lion-Claw Feet on Chest Base
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const footBot = chestBase.local([sx * 0.39, -0.01, sz * 0.24]);
      const cornerTop = chestBase.local([sx * 0.45, 0.375, sz * 0.275]);
      b.frustumBox(footBot, cornerTop, [0.11, 0.11], [0.13, 0.13], {
        bone: chestBase,
        up: chestBase.dir([0, 0, 1]),
        color: PAINT_BRASS,
        group: "chestBody",
      });
      // Clawed corner foot pads
      b.spike(
        chestBase.local([sx * 0.4, 0.04, sz * 0.25]),
        chestBase.dir([sx * 0.6, -0.4, sz * 0.6]),
        0.09,
        0.055,
        {
          bone: chestBase,
          sides: 4,
          smooth: false,
          color: PAINT_GOLD,
          group: "chestBody",
        },
      );
    }
  }

  // Front & Back Vertical Iron Reinforcing Bands on Chest Body
  for (const sx of [-0.22, 0.22]) {
    for (const sz of [-1, 1]) {
      b.frustumBox(
        chestBase.local([sx, 0.04, sz * 0.24]),
        chestBase.local([sx * 1.08, 0.35, sz * 0.27]),
        [0.065, 0.04],
        [0.075, 0.045],
        {
          bone: chestBase,
          up: chestBase.dir([0, 0, 1]),
          color: PAINT_IRON,
          group: "chestBody",
        },
      );
    }
  }

  // Ornate Front Keyhole Escutcheon Plate on Chest Body + Glowing Arcane Core
  const lockPlateOutline: OutlinePoint[] = [
    [0, -0.14, "sharp"],
    [0.09, -0.06],
    [0.11, 0.06, "sharp"],
    [0.06, 0.12],
    [-0.06, 0.12],
    [-0.11, 0.06, "sharp"],
    [-0.09, -0.06],
  ];
  b.extrude(lockPlateOutline, {
    bone: chestBase,
    at: chestBase.local([0, 0.22, 0.265]),
    x: chestBase.dir([1, 0, 0]),
    y: chestBase.dir([0, 1, 0]),
    thickness: 0.04,
    bevel: 0.01,
    smoothing: 1,
    color: PAINT_GOLD,
    group: "chestBody",
    name: "chestEscutcheon",
  });
  // Glowing Hextech Keyhole Gem in the Lock Plate
  glow(
    b.part(new THREE.OctahedronGeometry(0.045, 0), HEX_CYAN, {
      bone: chestBase,
      at: chestBase.local([0, 0.22, 0.29]),
      scale: [0.85, 1.35, 0.6],
      flat: true,
      group: "chestBody",
      name: "chestKeyholeGem",
    }),
    1.8,
  );

  // Chest Side Carrying Rings (mounted on their hinge joints)
  for (const [sideSign, hJoint] of [
    [1, chestHandleR],
    [-1, chestHandleL],
  ] as const) {
    // Lion-boss mount on chest side wall
    b.part(new THREE.CylinderGeometry(0.06, 0.075, 0.04, 8), PAINT_BRASS, {
      bone: chestBase,
      at: chestBase.local([sideSign * 0.44, 0.23, 0]),
      dir: chestBase.dir([sideSign, 0, 0]),
      flat: true,
      group: "chestHandles",
    });
    // Heavy Ring hanging from the hinge joint
    const ringLoop = arc(
      hJoint.local([0, -0.055, 0]),
      hJoint.local([0, 0, 0]),
      hJoint.dir([0, 0, 1]),
      360,
    );
    b.sweep(ringLoop, 0.018, {
      bone: hJoint,
      sides: 6,
      smooth: false,
      color: PAINT_GOLD,
      group: "chestHandles",
    });
  }

  // Interior Overflowing Gold Cushion & Glowing Hoard Core inside the Open Chest
  b.part(new THREE.SphereGeometry(1, 12, 8), PAINT_COIN_MOUND, {
    bone: chestBase,
    at: chestBase.local([0, 0.34, 0.01]),
    scale: [0.41, 0.14, 0.24],
    flat: true,
    group: "chestInterior",
    name: "chestInnerGoldBed",
  });
  // Radiant Arcane Hoard Glow seeping from inside the chest
  glow(
    b.part(new THREE.DodecahedronGeometry(0.09, 0), HEX_CYAN, {
      bone: chestBase,
      at: chestBase.local([-0.14, 0.42, -0.02]),
      scale: [1.1, 0.7, 0.9],
      flat: true,
      group: "chestInterior",
      name: "chestInnerHexOrb",
    }),
    1.6,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.075, 0), RUBY_GLOW, {
      bone: chestBase,
      at: chestBase.local([0.18, 0.41, 0.04]),
      rotation: [20, 35, 10],
      flat: true,
      group: "chestInterior",
      name: "chestInnerRuby",
    }),
    1.5,
  );

  // Chest Arched Vaulted Lid (built on chestLidHinge, then posed open to -58 degrees!)
  const lidArchOutline: OutlinePoint[] = [
    [-0.27, 0, "sharp"],
    [0.27, 0, "sharp"],
    [0.25, 0.13],
    [0.14, 0.22],
    [0, 0.25],
    [-0.14, 0.22],
    [-0.25, 0.13],
  ];
  b.extrude(lidArchOutline, {
    bone: chestLidHinge,
    at: chestLidHinge.local([0, 0, 0.25]),
    x: chestLidHinge.dir([0, 0, 1]),
    y: chestLidHinge.dir([0, 1, 0]),
    thickness: 0.86,
    bevel: 0.02,
    smoothing: 1,
    color: PAINT_WOOD,
    group: "chestLid",
    name: "chestLidVault",
  });

  // Heavy Brass & Iron Rib Straps over the Arched Chest Lid
  for (const lx of [-0.42, -0.18, 0.18, 0.42]) {
    const isOuter = Math.abs(lx) > 0.3;
    const strapArch = catmull([
      chestLidHinge.local([lx, -0.01, -0.02]),
      chestLidHinge.local([lx, 0.14, 0.04]),
      chestLidHinge.local([lx, 0.265, 0.25]),
      chestLidHinge.local([lx, 0.14, 0.46]),
      chestLidHinge.local([lx, -0.01, 0.52]),
    ]);
    b.sweep(strapArch, () => [isOuter ? 0.045 : 0.032, 0.024], {
      bone: chestLidHinge,
      section: "box",
      caps: "flat",
      color: isOuter ? PAINT_BRASS : PAINT_IRON,
      group: "chestLid",
    });
  }

  // Heroic Spikes / Finials on the Top Crest of the Chest Lid
  for (const lx of [-0.42, 0, 0.42]) {
    b.spike(
      chestLidHinge.local([lx, 0.25, 0.25]),
      chestLidHinge.dir([lx * 0.3, 1, 0]),
      0.11,
      0.038,
      {
        bone: chestLidHinge,
        sides: 4,
        smooth: false,
        color: PAINT_GOLD,
        group: "chestLid",
      },
    );
  }

  // Hinged Lock Clasp hanging from the front lip of the Chest Lid
  b.extrude(
    [
      [-0.055, 0, "sharp"],
      [0.055, 0, "sharp"],
      [0.07, -0.09],
      [0, -0.15, "sharp"],
      [-0.07, -0.09],
    ],
    {
      bone: chestLockHinge,
      at: chestLockHinge.local([0, 0, 0]),
      x: chestLockHinge.dir([1, 0, 0]),
      y: chestLockHinge.dir([0, -1, 0]),
      thickness: 0.03,
      bevel: 0.006,
      color: PAINT_GOLD,
      group: "chestLock",
      name: "chestClaspTongue",
    },
  );

  // Pose the Chest Lid wide open (-56 deg) and let the lock clasp dangle naturally
  b.pose(chestLidHinge, { axis: chestLidHinge.dir([1, 0, 0]), deg: -56 });
  b.pose(chestLockHinge, { axis: chestLockHinge.dir([1, 0, 0]), deg: 34 });
  b.pose(chestHandleR, { axis: chestHandleR.dir([0, 0, 1]), deg: 14 });
  b.pose(chestHandleL, { axis: chestHandleL.dir([0, 0, 1]), deg: -14 });

  // ============================================================================
  // 3. RADIANT ROYAL CROWN (Hero Prop Perched Atop the Open Chest's Gold Pile)
  // ============================================================================

  const crownFrame = frame(
    chestBase.local([0.04, 0.45, 0.05]),
    chestBase.dir([0.14, 0.96, 0.24]),
    chestBase.dir([0, -0.24, 0.97]),
  );

  // Velvet Interior Cushion Cap of the Crown
  b.part(new THREE.SphereGeometry(0.155, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), PAINT_VELVET, {
    bone: chestBase,
    frame: crownFrame,
    scale: [1, 0.85, 1],
    flat: true,
    group: "crown",
    name: "crownVelvetCap",
  });

  // Heavy Beveled Gold Circlet Base Ring (lathed profile)
  const crownBandOutline: OutlinePoint[] = [
    [0.145, 0, "sharp"],
    [0.185, 0, "sharp"],
    [0.198, 0.025, "sharp"],
    [0.182, 0.055, "sharp"],
    [0.205, 0.095, "sharp"],
    [0.165, 0.105, "sharp"],
    [0.145, 0.02, "sharp"],
  ];
  b.lathe(crownBandOutline, {
    bone: chestBase,
    at: crownFrame.at,
    axis: crownFrame.axis,
    segments: 8,
    color: PAINT_GOLD,
    group: "crown",
    name: "crownCirclet",
  });

  // 8 Dramatic Flared League-of-Legends Crown Spires & Alternating Gems around the Crown
  b.ring(
    crownFrame.moved([0, 0.09, 0]),
    { count: 8, radius: 0.175, tilt: 16, group: "crown" },
    (spire, idx) => {
      const isMajor = idx % 2 === 0;
      const spireH = isMajor ? 0.165 : 0.105;
      const spireW = isMajor ? 0.046 : 0.032;
      b.spike(spire, spire.dir([0, 0.35, 0.94]), spireH, spireW, {
        bone: chestBase,
        sides: 4,
        smooth: false,
        color: PAINT_GOLD,
        group: "crown",
      });
      // Bezel-set Jewel on the outer face of each major spire
      const gemColor = idx === 0 ? RUBY_GLOW : idx === 4 ? HEX_CYAN : idx % 2 === 0 ? EMERALD_GLOW : AMETHYST_GLOW;
      glow(
        b.part(new THREE.OctahedronGeometry(isMajor ? 0.032 : 0.022, 0), gemColor, {
          bone: chestBase,
          frame: spire.moved([0, 0.022, -0.02]),
          scale: [0.85, 1.3, 0.65],
          flat: true,
          group: "crown",
        }),
        1.6,
      );
    },
  );

  // Central Sovereign Crest Finial on Front of Crown (Oversized Winged Sunburst + Ruby)
  const frontSpireFrame = frame(
    crownFrame.local([0, 0.13, 0.185]),
    crownFrame.dir([0, 0.2, 1]),
    crownFrame.dir([0, 1, -0.2]),
  );
  b.extrude(
    [
      [0, -0.05, "sharp"],
      [0.065, 0.02, "sharp"],
      [0.04, 0.11, "sharp"],
      [0, 0.17, "sharp"],
      [-0.04, 0.11, "sharp"],
      [-0.065, 0.02, "sharp"],
    ],
    {
      bone: chestBase,
      at: frontSpireFrame.at,
      x: crownFrame.dir([1, 0, 0]),
      y: crownFrame.dir([0, 0.96, 0.28]),
      thickness: 0.028,
      bevel: 0.006,
      color: PAINT_GOLD,
      group: "crown",
      name: "crownSovereignCrest",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.042, 0), RUBY_GLOW, {
      bone: chestBase,
      at: crownFrame.local([0, 0.18, 0.205]),
      scale: [0.8, 1.4, 0.6],
      flat: true,
      group: "crown",
      name: "crownCenterRuby",
    }),
    2.0,
  );

  // ============================================================================
  // 4. CEREMONIAL GOBLETS & CHALICES (4 Distinct Stylized Vessels)
  // ============================================================================

  // Helper to build a rich jewel-studded goblet at a given frame
  const buildGoblet = (
    name: string,
    gobletFrame: ReturnType<typeof frame>,
    scale: number,
    gemColor: string,
    hasHandles: boolean,
    hasLiquid: boolean,
  ) => {
    const s = scale;
    const chaliceProfile: OutlinePoint[] = [
      [0, 0],
      [0.105 * s, 0, "sharp"],
      [0.11 * s, 0.02 * s, "sharp"],
      [0.075 * s, 0.045 * s],
      [0.032 * s, 0.095 * s],
      [0.052 * s, 0.135 * s, "sharp"],
      [0.032 * s, 0.175 * s],
      [0.088 * s, 0.22 * s, "sharp"],
      [0.122 * s, 0.31 * s],
      [0.136 * s, 0.365 * s, "sharp"],
      [0.115 * s, 0.365 * s, "sharp"],
      [0.095 * s, 0.25 * s],
      [0, 0.22 * s],
    ];
    b.lathe(chaliceProfile, {
      bone: root,
      at: gobletFrame.at,
      axis: gobletFrame.axis,
      segments: 8,
      color: PAINT_GOLD,
      group: "goblets",
      name: `${name}Body`,
    });

    // Ring of 6 Glowing Cabochon Gems around the Goblet Cup
    b.ring(
      gobletFrame.moved([0, 0.285 * s, 0]),
      { count: 6, radius: 0.108 * s, group: "goblets" },
      (gemSlot) => {
        glow(
          b.part(new THREE.OctahedronGeometry(0.022 * s, 0), gemColor, {
            bone: root,
            frame: gemSlot,
            scale: [0.85, 0.65, 1.25],
            flat: true,
            group: "goblets",
          }),
          1.5,
        );
      },
    );

    // Optional Twin Scroll Handles on Hero Chalices
    if (hasHandles) {
      for (const side of [-1, 1]) {
        const hPath = bezier(
          gobletFrame.local([side * 0.082 * s, 0.21 * s, 0]),
          gobletFrame.local([side * 0.185 * s, 0.23 * s, 0]),
          gobletFrame.local([side * 0.195 * s, 0.37 * s, 0]),
          gobletFrame.local([side * 0.122 * s, 0.35 * s, 0]),
        );
        b.sweep(hPath, [0.015 * s, 0.018 * s, 0.014 * s], {
          bone: root,
          sides: 5,
          smooth: false,
          color: PAINT_BRASS,
          group: "goblets",
        });
      }
    }

    // Optional Magical Elixir / Wine meniscus inside upright goblets
    if (hasLiquid) {
      glow(
        b.part(new THREE.CylinderGeometry(0.11 * s, 0.095 * s, 0.016 * s, 8), gemColor, {
          bone: root,
          frame: gobletFrame.moved([0, 0.345 * s, 0]),
          flat: true,
          group: "goblets",
          name: `${name}Elixir`,
        }),
        1.2,
      );
    }
  };

  // Goblet 1: Grand Standing Hextech Chalice on Left-Front Mound
  const goblet1Frame = frame([0.42, 0.13, 0.22], [-0.08, 0.99, 0.08], [0, 0, 1]);
  buildGoblet("chaliceGrandL", goblet1Frame, 1.08, HEX_CYAN, true, true);

  // Goblet 2: Tipped-over Ruby Wine Goblet in Center-Front (spilling glowing crimson elixir & coins)
  const goblet2Frame = frame([0.14, 0.145, 0.44], [0.68, 0.16, 0.71], [0, 1, 0]);
  buildGoblet("gobletSpilledFront", goblet2Frame, 0.92, RUBY_GLOW, false, false);
  // Spilled pool of glowing crimson elixir & gems pouring out of Goblet 2's mouth
  const spillPath = catmull([
    goblet2Frame.local([0, 0.32, 0]),
    [0.34, 0.11, 0.61],
    [0.42, 0.08, 0.72],
  ]);
  glow(
    b.sweep(spillPath, [0.042, 0.068, 0.095], {
      bone: root,
       radius: (t) => [0.045 + t * 0.055, 0.014],
      color: WINE_PURPLE,
      group: "goblets",
      name: "spilledElixirStream",
    }),
    0.8,
  );

  // Goblet 3: Upright Emerald Serpent Goblet on Right-Front Flank
  const goblet3Frame = frame([-0.33, 0.12, 0.34], [0.1, 0.99, 0.06], [0, 0, 1]);
  buildGoblet("gobletEmeraldR", goblet3Frame, 0.95, EMERALD_GLOW, true, true);

  // Goblet 4: Tilted Royal Amethyst Goblet tucked beside the Chest on Left-Back
  const goblet4Frame = frame([0.52, 0.14, -0.05], [0.35, 0.92, -0.18], [0, 0, 1]);
  buildGoblet("gobletAmethystBack", goblet4Frame, 0.86, AMETHYST_GLOW, false, true);

  // ============================================================================
  // 5. SIDE RELIC COFFER, GOLD INGOT BARS, ANCIENT SCROLL & POTION AMPHORA
  // ============================================================================

  // Side Jewelled Coffer (on right flank, open with glowing emerald bars inside)
  b.frustumBox(
    cofferBase.local([0, 0, 0]),
    cofferBase.local([0, 0.17, 0]),
    [0.32, 0.22],
    [0.36, 0.25],
    {
      bone: cofferBase,
      up: cofferBase.dir([0, 0, 1]),
      color: PAINT_IRON,
      group: "coffer",
      name: "cofferHull",
    },
  );
  b.frustumBox(
    cofferBase.local([0, 0.14, 0]),
    cofferBase.local([0, 0.18, 0]),
    [0.37, 0.26],
    [0.39, 0.28],
    {
      bone: cofferBase,
      up: cofferBase.dir([0, 0, 1]),
      color: PAINT_GOLD,
      group: "coffer",
      name: "cofferRim",
    },
  );
  // Coffer Lid (built on cofferLid hinge and posed open)
  b.frustumBox(
    cofferLid.local([0, 0, 0.13]),
    cofferLid.local([0, 0.08, 0.13]),
    [0.38, 0.27],
    [0.28, 0.18],
    {
      bone: cofferLid,
      up: cofferLid.dir([0, 0, 1]),
      color: PAINT_BRASS,
      group: "coffer",
      name: "cofferLidBox",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.045, 0), EMERALD_GLOW, {
      bone: cofferLid,
      at: cofferLid.local([0, 0.09, 0.13]),
      scale: [1.4, 0.6, 0.9],
      flat: true,
      group: "coffer",
      name: "cofferTopGem",
    }),
    1.5,
  );
  b.pose(cofferLid, { axis: cofferLid.dir([1, 0, 0]), deg: -42 });

  // Pyramid Stack of Stamped Gold Bullion Ingots (Front-Right & Back-Left)
  const ingotPlacements: Array<{ at: V3; dir: V3 }> = [
    // Bottom layer of 3 ingots on right-front
    { at: [-0.22, 0.09, 0.52], dir: [0.92, 0, -0.38] },
    { at: [-0.15, 0.09, 0.64], dir: [0.92, 0, -0.38] },
    { at: [-0.31, 0.085, 0.42], dir: [0.85, 0.05, -0.52] },
    // Second tier ingot stacked crosswise
    { at: [-0.19, 0.145, 0.57], dir: [0.88, 0.04, -0.46] },
    // Ingots near left chest flank
    { at: [0.56, 0.11, 0.08], dir: [0.35, 0.08, 0.93] },
    { at: [0.65, 0.09, 0.12], dir: [0.42, 0.02, 0.91] },
    { at: [0.60, 0.16, 0.10], dir: [0.38, 0.06, 0.92] },
    // Ingot peeking out of the open chest
    { at: [-0.18, 0.43, -0.10], dir: [0.78, 0.25, 0.58] },
  ];
  for (const [idx, ing] of ingotPlacements.entries()) {
    const f = frame(ing.at, [0, 1, 0], ing.dir);
    b.frustumBox(f.local([0, 0, 0]), f.local([0, 0.055, 0]), [0.095, 0.21], [0.072, 0.18], {
      bone: root,
      up: ing.dir,
      color: PAINT_GOLD,
      group: "ingots",
      name: `goldIngot_${idx + 1}`,
    });
  }

  // Unfurled Map Scroll with Twin Gold Rollers in Front-Right Foreground
  const scrollFrame = frame([-0.46, 0.095, 0.46], [0, 1, 0], [0.75, 0, 0.66]);
  for (const sz of [-0.11, 0.11]) {
    const rA = scrollFrame.local([-0.14, 0.025, sz]);
    const rB = scrollFrame.local([0.14, 0.025, sz]);
    b.rod(rA, rB, 0.026, {
      bone: root,
      sides: 8,
      color: PAINT_LEATHER_TEAL,
      group: "scroll",
    });
    for (const endSign of [-1, 1]) {
      b.spike(
        scrollFrame.local([endSign * 0.14, 0.025, sz]),
        scrollFrame.dir([endSign, 0, 0]),
        0.045,
        0.032,
        {
          bone: root,
          sides: 6,
          smooth: false,
          color: PAINT_GOLD,
          group: "scroll",
        },
      );
    }
  }
  // Parchment map plane between the two scroll rollers
  b.part(new THREE.PlaneGeometry(0.24, 0.19), "#ffffff", {
    bone: root,
    at: scrollFrame.local([0, 0.032, 0]),
    dir: [0, 1, 0],
    up: scrollFrame.dir([0, 0, 1]),
    axis: "z",
    texture: TEX_SCROLL_MAP,
    group: "scroll",
    name: "scrollParchmentMap",
  });

  // Ornate Bilgewater / Shuriman Ewer Pitcher on Back-Right Mound
  const ewerFrame = frame([-0.48, 0.09, -0.22], [-0.08, 0.99, -0.05], [0, 0, 1]);
  const ewerProfile: OutlinePoint[] = [
    [0, 0],
    [0.09, 0, "sharp"],
    [0.06, 0.04],
    [0.135, 0.14],
    [0.12, 0.24],
    [0.055, 0.31, "sharp"],
    [0.085, 0.38, "sharp"],
    [0.065, 0.41, "sharp"],
    [0, 0.36],
  ];
  b.lathe(ewerProfile, {
    bone: root,
    at: ewerFrame.at,
    axis: ewerFrame.axis,
    segments: 10,
    color: PAINT_BRASS,
    group: "ewer",
    name: "ornateEwerPitcher",
  });
  // Ewer Handle
  b.sweep(
    bezier(
      ewerFrame.local([0, 0.15, -0.12]),
      ewerFrame.local([0, 0.18, -0.24]),
      ewerFrame.local([0, 0.39, -0.22]),
      ewerFrame.local([0, 0.37, -0.07]),
    ),
    [0.018, 0.022, 0.015],
    {
      bone: root,
      sides: 6,
      smooth: false,
      color: PAINT_GOLD,
      group: "ewer",
    },
  );

  // ============================================================================
  // 6. GLOWING HEXTECH CRYSTALS & FACETED GEMS (League of Legends Magic Accents)
  // ============================================================================

  // Helper to build a tapered faceted League-style crystal prism (6-sided hexagon prism to sharp point)
  const buildCrystalPrism = (
    base: V3,
    dir: V3,
    len: number,
    r: number,
    color: string,
    strength = 1.6,
    group = "hexCrystals",
  ) => {
    const tip = offset(base, dir, len);
    const midPt = offset(base, dir, len * 0.72);
    const crystal = b.sweep([base, midPt, tip], [r * 0.88, r, 0], {
      bone: root,
      section: { ngon: 6 },
      smooth: false,
      caps: { start: "flat", end: "point" },
      color,
      group,
    });
    glow(crystal, strength);
    // Gold socket/collar at base of major crystals
    if (r >= 0.048) {
      b.rod(base, offset(base, dir, len * 0.22), [r * 1.25, r * 1.08], {
        bone: root,
        section: { ngon: 6 },
        smooth: false,
        color: PAINT_BRASS,
        group,
      });
    }
  };

  // Cluster 1: Back-Left Towering Hextech Cyan Crystal Cluster (Balances silhouette for top-down read)
  buildCrystalPrism([0.46, 0.08, -0.26], [0.22, 0.94, -0.22], 0.48, 0.072, HEX_CYAN, 1.8);
  buildCrystalPrism([0.55, 0.07, -0.18], [0.45, 0.85, -0.12], 0.34, 0.054, HEX_BLUE, 1.5);
  buildCrystalPrism([0.38, 0.09, -0.34], [-0.08, 0.92, -0.36], 0.31, 0.048, HEX_CYAN, 1.7);
  buildCrystalPrism([0.58, 0.06, -0.31], [0.52, 0.78, -0.34], 0.23, 0.038, HEX_CYAN, 1.6);

  // Cluster 2: Front-Right Crimson Ruby Shard Cluster
  buildCrystalPrism([-0.54, 0.06, -0.02], [-0.38, 0.88, 0.22], 0.32, 0.056, RUBY_GLOW, 1.7);
  buildCrystalPrism([-0.62, 0.05, 0.06], [-0.58, 0.78, 0.25], 0.22, 0.042, RUBY_DEEP, 1.3);
  buildCrystalPrism([-0.46, 0.08, -0.06], [-0.18, 0.95, 0.14], 0.24, 0.038, RUBY_GLOW, 1.8);

  // Cluster 3: Front-Center & Chest-Spill Loose Cut Gems (Rubies, Sapphires, Emeralds, Amethysts, Amber)
  const looseGemSpecs: Array<{ at: V3; r: number; color: string; scale: V3; rot: V3 }> = [
    // Inside open chest mouth
    { at: [0.22, 0.42, -0.12], r: 0.055, color: HEX_CYAN, scale: [1, 1.3, 0.9], rot: [15, 25, -20] },
    { at: [-0.25, 0.40, -0.08], r: 0.052, color: RUBY_GLOW, scale: [1.2, 0.8, 1], rot: [35, 10, 15] },
    { at: [0.02, 0.41, 0.12], r: 0.046, color: EMERALD_GLOW, scale: [1, 0.9, 1.3], rot: [-20, 40, 10] },
    { at: [-0.12, 0.43, 0.09], r: 0.044, color: AMETHYST_GLOW, scale: [1.1, 1.2, 0.8], rot: [12, -30, 25] },
    // Spilling down front of chest & across velvet cloth
    { at: [0.08, 0.22, 0.24], r: 0.058, color: RUBY_GLOW, scale: [1.2, 0.75, 1.1], rot: [40, 15, 0] },
    { at: [-0.08, 0.19, 0.28], r: 0.05, color: HEX_CYAN, scale: [0.9, 1.3, 0.9], rot: [-25, 30, 45] },
    { at: [0.24, 0.16, 0.35], r: 0.048, color: AMBER_GLOW, scale: [1.3, 0.8, 1.0], rot: [10, 50, -15] },
    { at: [-0.22, 0.15, 0.36], r: 0.052, color: AMETHYST_GLOW, scale: [1.0, 1.2, 0.85], rot: [30, -20, 20] },
    { at: [0.02, 0.13, 0.56], r: 0.054, color: HEX_CYAN, scale: [1.1, 0.8, 1.2], rot: [18, 42, -12] },
    { at: [0.31, 0.11, 0.48], r: 0.045, color: RUBY_GLOW, scale: [0.9, 1.3, 0.9], rot: [-15, 25, 35] },
    { at: [-0.12, 0.10, 0.62], r: 0.046, color: EMERALD_GLOW, scale: [1.2, 0.85, 1.1], rot: [22, -35, 18] },
    { at: [0.54, 0.09, 0.36], r: 0.048, color: AMETHYST_GLOW, scale: [1.0, 1.2, 0.9], rot: [28, 14, -22] },
    { at: [-0.58, 0.09, 0.32], r: 0.044, color: HEX_CYAN, scale: [1.2, 0.9, 1.0], rot: [-18, 45, 12] },
    { at: [0.26, 0.06, 0.74], r: 0.042, color: RUBY_GLOW, scale: [1.1, 0.8, 1.2], rot: [10, -28, 30] },
  ];

  for (const [idx, g] of looseGemSpecs.entries()) {
    glow(
      b.part(new THREE.OctahedronGeometry(g.r, 0), g.color, {
        bone: root,
        at: g.at,
        scale: g.scale,
        rotation: g.rot,
        flat: true,
        group: "looseGems",
        name: `cutGem_${idx + 1}`,
      }),
      1.6,
    );
  }

  // ============================================================================
  // 7. DRAPED PEARL & GOLD BEAD NECKLACES (Draping Out of the Chest & Coffer)
  // ============================================================================

  // Necklace 1: Luminous Pearl & Gold Chain draping out the right front corner of the Hero Chest
  const necklace1Path = catmull([
    chestBase.local([-0.26, 0.39, 0.14]),
    chestBase.local([-0.33, 0.36, 0.28]),
    [-0.36, 0.27, 0.19],
    [-0.32, 0.17, 0.25],
    [-0.22, 0.13, 0.31],
  ]);
  b.along(necklace1Path, 15, (pt, idx) => {
    const isGoldBead = idx % 3 === 1;
    b.part(
      new THREE.SphereGeometry(isGoldBead ? 0.019 : 0.023, 8, 6),
      isGoldBead ? PAINT_GOLD : PEARL_CREAM,
      {
        bone: root,
        at: pt.at,
        flat: isGoldBead,
        group: "jewelry",
      },
    );
  });
  // Necklace 1 Ruby Pendant Medallion at its lowest loop
  glow(
    b.part(new THREE.OctahedronGeometry(0.036, 0), RUBY_GLOW, {
      bone: root,
      at: [-0.27, 0.145, 0.29],
      scale: [1.1, 1.3, 0.55],
      rotation: [-25, 15, 10],
      flat: true,
      group: "jewelry",
      name: "necklacePendantRuby",
    }),
    1.7,
  );

  // Necklace 2: Heavy Gold Chain draping over the left rim of the Hero Chest
  const necklace2Path = catmull([
    chestBase.local([0.28, 0.40, 0.10]),
    chestBase.local([0.38, 0.36, 0.25]),
    [0.34, 0.24, 0.16],
    [0.27, 0.16, 0.24],
  ]);
  b.sweep(necklace2Path, 0.016, {
    bone: root,
    sides: 5,
    smooth: false,
    color: PAINT_GOLD,
    group: "jewelry",
    name: "goldChainDrapeL",
  });

  // ============================================================================
  // 8. STACKED COIN TOWERS, STAMPED HERO COINS & MERGED SCATTERED COINS
  // ============================================================================

  // Neat Coin Stack Towers around the hoard (readable stepped cylindrical columns of gold coins)
  const coinStacks: Array<{ at: V3; h: number; lean: V3 }> = [
    { at: [0.27, 0.11, 0.16], h: 0.16, lean: [0.04, 1, 0.02] },
    { at: [0.34, 0.10, 0.11], h: 0.11, lean: [-0.05, 1, 0.06] },
    { at: [0.21, 0.12, 0.22], h: 0.09, lean: [0.08, 1, -0.04] },
    { at: [-0.18, 0.11, 0.38], h: 0.14, lean: [-0.06, 1, 0.05] },
    { at: [-0.25, 0.10, 0.43], h: 0.09, lean: [0.05, 1, 0.08] },
    { at: [0.48, 0.08, 0.42], h: 0.12, lean: [0.02, 1, -0.05] },
    { at: [0.55, 0.07, 0.37], h: 0.08, lean: [-0.04, 1, 0.03] },
    { at: [-0.42, 0.08, -0.04], h: 0.13, lean: [0.05, 1, 0.02] },
  ];

  for (const [idx, st] of coinStacks.entries()) {
    const topPt = offset(st.at, st.lean, st.h);
    b.rod(st.at, topPt, 0.036, {
      bone: root,
      sides: 8,
      smooth: false,
      color: PAINT_GOLD,
      group: "coinStacks",
      name: `coinStack_${idx + 1}`,
    });
    // Stamped Top Coin Cap on each stack
    b.part(new THREE.CircleGeometry(0.036, 8), "#ffffff", {
      bone: root,
      at: offset(topPt, st.lean, 0.002),
      dir: st.lean,
      axis: "z",
      texture: TEX_COIN,
      group: "coinStacks",
    });
  }

  // Scattered Individual 3D Gold & Silver Coins across the Mound Surfaces (Merged into 2 fast parts!)
  const coinSurface = b.surface(moundParts);
  const goldHits = coinSurface.scatter(165, {
    rng: rng(901),
    minDist: 0.048,
    filter: (h) => h.n.y > 0.35 && h.at.y > 0.015,
  });
  const randCoin = rng(902);
  const goldCoinGeos: THREE.BufferGeometry[] = [];
  const silverCoinGeos: THREE.BufferGeometry[] = [];

  for (const [idx, hit] of goldHits.entries()) {
    const r = 0.026 + randCoin() * 0.012;
    const h = 0.009 + randCoin() * 0.004;
    const g = new THREE.CylinderGeometry(r, r, h, 8, 1);
    const nDir = hit.n.clone().add(new THREE.Vector3((randCoin() - 0.5) * 0.28, 0, (randCoin() - 0.5) * 0.28)).normalize();
    const q = aim(nDir);
    const m = new THREE.Matrix4().compose(hit.at.clone().addScaledVector(hit.n, h * 0.35), q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    if (idx % 6 === 0) silverCoinGeos.push(g);
    else goldCoinGeos.push(g);
  }

  if (goldCoinGeos.length) {
    b.part(mergeGeometries(goldCoinGeos)!, GOLD_BRIGHT, {
      bone: root,
      at: [0, 0, 0],
      flat: true,
      group: "scatteredCoins",
      name: "mergedGoldCoins",
    });
  }
  if (silverCoinGeos.length) {
    b.part(mergeGeometries(silverCoinGeos)!, SILVER_BRIGHT, {
      bone: root,
      at: [0, 0, 0],
      flat: true,
      group: "scatteredCoins",
      name: "mergedSilverCoins",
    });
  }

  // Merged Decorative Brass Rivets along the Hero Chest's Iron & Brass Straps
  const rivetGeos: THREE.BufferGeometry[] = [];
  const rivetLocalPts: V3[] = [
    // Front & Back body rivets
    [-0.41, 0.10, 0.255], [-0.42, 0.20, 0.262], [-0.43, 0.29, 0.268],
    [0.41, 0.10, 0.255], [0.42, 0.20, 0.262], [0.43, 0.29, 0.268],
    [-0.22, 0.10, 0.255], [-0.22, 0.20, 0.262], [-0.23, 0.29, 0.268],
    [0.22, 0.10, 0.255], [0.22, 0.20, 0.262], [0.23, 0.29, 0.268],
    [-0.41, 0.10, -0.255], [-0.42, 0.22, -0.265],
    [0.41, 0.10, -0.255], [0.42, 0.22, -0.265],
    [-0.22, 0.12, -0.255], [0.22, 0.12, -0.255],
  ];
  for (const rp of rivetLocalPts) {
    const wp = chestBase.local(rp);
    const rg = new THREE.SphereGeometry(0.016, 6, 4);
    rg.translate(wp.x, wp.y, wp.z);
    rivetGeos.push(rg);
  }
  b.part(mergeGeometries(rivetGeos)!, GOLD_BRIGHT, {
    bone: chestBase,
    at: [0, 0, 0],
    flat: true,
    group: "chestBody",
    name: "chestMergedRivets",
  });

  // ============================================================================
  // 9. ARCANE HEXTECH RUNE SEAL & GLOWING SPARKLE CARDS
  // ============================================================================

  // Glowing Arcane Rune Circle projected just above the front floor of the hoard
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
      bone: root,
      at: [0.02, 0.079, 0.52],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: TEX_HEX_RUNE,
      group: "magicEffects",
      name: "arcaneFloorRune",
    }),
    1.5,
  );

  // Floating Golden Glint / Starburst Sparkle Cards hovering over the Crown, Gems, and Chest
  const sparkleLocations: V3[] = [
    [0.02, 0.72, -0.02], // Above Crown center
    [-0.24, 0.56, 0.02], // Right of chest mouth
    [0.28, 0.54, -0.08], // Left of chest mouth
    [0.48, 0.58, -0.24], // Above Hextech crystal cluster
    [0.42, 0.49, 0.22], // Above Left Grand Chalice
    [-0.33, 0.44, 0.34], // Above Right Emerald Goblet
    [-0.54, 0.39, 0.02], // Above Ruby shard cluster
    [0.08, 0.28, 0.34], // Above front gem spill
  ];
  const sparkleFrames = sparkleLocations.map((p) => frame(p, [0, 1, 0], [0, 0, 1]));
  glow(
    b.cards(sparkleFrames, TEX_SPARKLE, {
      bone: root,
      size: [0.068, 0.068],
      cross: true,
      vary: 0.22,
      spin: 35,
      rng: rng(999),
      group: "magicEffects",
      name: "treasureSparkleCards",
    }),
    1.8,
  );

  return b.root;
}
