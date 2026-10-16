import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { cells, countershade, gradient, grain, mix, mottle, noise, paint, scales, smoothstep, spots } from "../../../../src/paint";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "Warcraft-styled ancient tree guardian with gnarly hand-painted bark, glowing emerald heartwood and eyes, oversized root-claw gauntlets, runic stone wards, shelf fungi, lantern, and canopy boughs.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette — Rich, saturated hand-painted Warcraft forest guardian colours
// ---------------------------------------------------------------------------
const BARK_DEEP = "#1f120b";
const BARK_DARK = "#362015";
const BARK_MID = "#573522";
const BARK_WARM = "#75482e";
const BARK_LIGHT = "#96613e";
const BARK_HIGHLIGHT = "#b87e54";
const BARK_ASH = "#4a3c34";

const HEARTWOOD_DARK = "#2c160c";
const HEARTWOOD_RING = "#804d2b";
const HEARTWOOD_PALE = "#ad7145";

const MOSS_DEEP = "#14381c";
const MOSS_MID = "#28662b";
const MOSS_BRIGHT = "#4ca135";
const MOSS_LIME = "#85d143";

const LEAF_SHADOW = "#123824";
const LEAF_MID = "#236937";
const LEAF_BRIGHT = "#429e3d";
const LEAF_GOLD = "#78c940";
const AUTUMN_TEAL = "#1f6e58";

const MAGIC_EMERALD = "#32ff7e";
const MAGIC_LIME = "#9eff47";
const MAGIC_CORE = "#dcff9e";
const MAGIC_AMBER = "#ffaa2b";
const MAGIC_GOLD = "#ffe270";

const STONE_DARK = "#313640";
const STONE_MID = "#515a69";
const STONE_LIGHT = "#7d8899";
const STONE_EDGE = "#a3b0c2";

const ROPE_DARK = "#452c1a";
const ROPE_LIGHT = "#7d5434";

const FUNGUS_TOP = "#b84a24";
const FUNGUS_RIM = "#f09b38";
const FUNGUS_GILL = "#e8cb96";
const SHROOM_CAP = "#28d4b8";
const SHROOM_SPOTS = "#b8fff0";

const METAL_BRONZE = "#6e4e2a";
const METAL_GOLD = "#c79338";

// ---------------------------------------------------------------------------
// Hand-painted Warcraft procedural paints
// ---------------------------------------------------------------------------

// Deep furrowed bark with vertical grain, cellular plate crevices, warm bevel highlights, and top-down sun gradient
const ANCIENT_BARK = paint((p, n) => {
  const streak = grain(BARK_DARK, BARK_WARM, { size: 0.09, axis: "y", seed: 11 }).at(p, n);
  const plate = scales([BARK_MID, BARK_WARM, BARK_DARK], BARK_DEEP, { size: 0.24, width: 0.16, seed: 23 }).at(p, n);
  const base = mix(streak, plate, 0.45);

  // Hand-painted zenith lighting & upward normal bevel highlight
  const upCatch = smoothstep(0.15, 0.78, n.y);
  const frontCatch = smoothstep(-0.2, 0.75, n.z) * 0.35;
  const heightGrad = smoothstep(0.15, 3.2, p.y);
  const rootShadow = smoothstep(0.65, 0.05, p.y);

  let col = mix(base, BARK_LIGHT, upCatch * 0.55 + frontCatch * 0.25);
  col = mix(col, BARK_HIGHLIGHT, smoothstep(0.6, 0.92, n.y) * 0.4);
  col = mix(col, BARK_DEEP, rootShadow * 0.55 + (1 - heightGrad) * 0.2);

  // Mossy crevices on upward-facing bark higher up
  const mossNoise = noise(p, 0.28, 77);
  const mossMask = smoothstep(0.32, 0.75, n.y) * smoothstep(0.42, 0.68, mossNoise) * smoothstep(0.5, 1.4, p.y);
  const mossCol = mix(MOSS_MID, MOSS_BRIGHT, smoothstep(0.5, 0.85, n.y));
  return mix(col, mossCol, mossMask * 0.78);
});

// Heavy gnarled dark root/claw bark with mud-darkened tips and warm knuckles
const KNUCKLE_BARK = paint((p, n) => {
  const g = grain(BARK_DEEP, BARK_MID, { size: 0.07, axis: "y", seed: 31 }).at(p, n);
  const c = cells(p, 0.16, 41);
  const ridge = smoothstep(0.04, 0.22, c.d2 - c.d1);
  const base = mix(BARK_DEEP, g, ridge);
  const rim = smoothstep(0.2, 0.8, n.y) * 0.45 + smoothstep(0.2, 0.85, n.z) * 0.25;
  const col = mix(base, BARK_LIGHT, rim);
  return mix(BARK_DEEP, col, smoothstep(0.02, 0.45, p.y));
});

// Lush plush moss carpet for shoulders, beard-moss, and crown beds
const LUSH_MOSS = countershade(
  mottle(MOSS_MID, MOSS_BRIGHT, { size: 0.16, contrast: 1.4, seed: 53 }),
  MOSS_DEEP,
  { level: 0.05, soft: 0.4 },
);

const CROWN_FOLIAGE_PAINT = countershade(
  spots(
    mottle(LEAF_MID, LEAF_BRIGHT, { size: 0.22, contrast: 1.3, seed: 61 }),
    [LEAF_GOLD, MOSS_LIME, AUTUMN_TEAL],
    { size: 0.18, amount: 0.55, seed: 67 },
  ),
  LEAF_SHADOW,
  { level: -0.05, soft: 0.45 },
);

// Hand-painted carved runic stone with edge highlights and mossy top
const RUNIC_STONE = paint((p, n) => {
  const m = mottle(STONE_DARK, STONE_MID, { size: 0.14, contrast: 1.2, seed: 89 }).at(p, n);
  const c = cells(p, 0.18, 97);
  const bevel = smoothstep(0.03, 0.12, c.d2 - c.d1);
  let col = mix(STONE_EDGE, m, bevel);
  col = mix(col, STONE_LIGHT, smoothstep(0.25, 0.8, n.y) * 0.5);
  const moss = smoothstep(0.55, 0.88, n.y) * smoothstep(0.45, 0.7, noise(p, 0.15, 103));
  return mix(col, MOSS_MID, moss * 0.65);
});

// Cut wood cross-section with concentric growth rings
const HEARTWOOD_CUT = paint((p, n, s) => {
  const r = Math.hypot(s[0], s[1]);
  const ringWave = 0.5 + 0.5 * Math.sin(r * 95 + noise(p, 0.08, 13) * 4);
  const base = mix(HEARTWOOD_DARK, HEARTWOOD_PALE, smoothstep(0.2, 0.8, ringWave));
  return mix( base, HEARTWOOD_RING, smoothstep(0.1, 0.7, n.y) * 0.3);
});

// Shelf fungus bracket paint with concentric warm orange/ochre bands
const FUNGUS_PAINT = paint((p, n) => {
  if (n.y < -0.15) return FUNGUS_GILL;
  const d = Math.hypot(p.x, p.z);
  const band = 0.5 + 0.5 * Math.sin(d * 75 + noise(p, 0.06, 19) * 3);
  return mix(FUNGUS_TOP, FUNGUS_RIM, smoothstep(0.3, 0.85, band));
});

// ---------------------------------------------------------------------------
// SVG Textures — Stylized Warcraft foliage cards, glowing runes, bark face
// ---------------------------------------------------------------------------

// Lush stylized Warcraft oak/elder leaf cluster card with painted veins and highlights
const LEAF_CLUSTER_SVG = svg(
  `<svg viewBox="0 0 128 160">
    <!-- Deep shadow backing leaves -->
    <path d="M64 152 C28 130 10 92 18 54 C24 28 44 12 64 6 C84 12 104 28 110 54 C118 92 100 130 64 152 Z" fill="#123824"/>
    <!-- Left lobe leaf -->
    <path d="M60 144 C24 126 8 92 14 60 C18 42 34 32 48 40 C36 22 48 10 64 8 C78 10 90 22 80 40 C94 32 110 42 114 60 C120 92 104 126 68 144 Z" fill="#236937"/>
    <!-- Mid bright painted body -->
    <path d="M64 138 C34 120 20 90 26 62 C30 48 44 42 54 48 C46 30 52 16 64 14 C76 16 82 30 74 48 C84 42 98 48 102 62 C108 90 94 120 64 138 Z" fill="#429e3d"/>
    <!-- Sun-kissed crown tips -->
    <path d="M64 18 C56 20 52 32 58 46 L64 84 L70 46 C76 32 72 20 64 18 Z" fill="#78c940"/>
    <path d="M30 62 C34 52 46 50 54 58 L62 92 L40 78 C30 72 28 66 30 62 Z" fill="#68ba3c"/>
    <path d="M98 62 C94 52 82 50 74 58 L66 92 L88 78 C98 72 100 66 98 62 Z" fill="#68ba3c"/>
    <!-- Central stem and veins -->
    <path d="M64 156 L64 22" stroke="#9be048" stroke-width="5" stroke-linecap="round"/>
    <path d="M64 112 L34 86 M64 112 L94 86 M64 84 L36 60 M64 84 L92 60 M64 56 L48 36 M64 56 L80 36" stroke="#9be048" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Rim highlights -->
    <circle cx="64" cy="24" r="4" fill="#c8ff6e"/>
    <circle cx="34" cy="64" r="3.5" fill="#b4f55b"/>
    <circle cx="94" cy="64" r="3.5" fill="#b4f55b"/>
  </svg>`,
  { size: 256 },
);

// Autumn-gold & emerald accent leaf card for variety
const GOLD_LEAF_SVG = svg(
  `<svg viewBox="0 0 128 160">
    <path d="M64 152 C26 128 10 88 20 50 C28 24 46 10 64 6 C82 10 100 24 108 50 C118 88 102 128 64 152 Z" fill="#1b4222"/>
    <path d="M64 142 C32 120 18 86 26 54 C32 32 48 18 64 12 C80 18 96 32 102 54 C110 86 96 120 64 142 Z" fill="#3a8c38"/>
    <path d="M64 126 C40 108 30 80 36 54 C42 36 52 24 64 18 C76 24 86 36 92 54 C98 80 88 108 64 126 Z" fill="#82cf3e"/>
    <path d="M64 90 C48 76 44 54 50 36 C54 26 60 22 64 20 C68 22 74 26 78 36 C84 54 80 76 64 90 Z" fill="#c8f04d"/>
    <path d="M64 156 L64 24 M64 104 L38 78 M64 104 L90 78 M64 74 L44 50 M64 74 L84 50" stroke="#e5ff78" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// Hanging beard-moss / ancient vine tresses
const HANGING_MOSS_SVG = svg(
  `<svg viewBox="0 0 96 192">
    <path d="M48 4 C34 42 22 96 28 168 L38 142 C42 164 46 182 48 188 C52 178 56 158 58 138 L68 164 C74 96 62 42 48 4 Z" fill="#184722"/>
    <path d="M48 8 C38 44 28 92 32 152 L42 126 L48 176 L54 124 L64 148 C68 92 58 44 48 8 Z" fill="#348032"/>
    <path d="M48 14 C42 46 36 88 38 130 L48 156 L58 126 C60 88 54 46 48 14 Z" fill="#63b83b"/>
    <circle cx="48" cy="96" r="5" fill="#a8ff61"/>
    <circle cx="39" cy="64" r="4" fill="#a8ff61"/>
    <circle cx="57" cy="122" r="4" fill="#a8ff61"/>
  </svg>`,
  { size: 256 },
);

// Glowing Druidic Spiral Rune decal for ward stones and bark carvings
const DRUID_RUNE_SVG = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="54" fill="none" stroke="#186b35" stroke-width="10"/>
    <circle cx="64" cy="64" r="54" fill="none" stroke="#3dff8b" stroke-width="5"/>
    <path d="M64 16 L80 44 L112 64 L80 84 L64 112 L48 84 L16 64 L48 44 Z" fill="none" stroke="#6bff52" stroke-width="6" stroke-linejoin="round"/>
    <path d="M64 34 C82 34 94 48 94 64 C94 80 80 92 64 92 C50 92 40 82 40 68 C40 56 50 48 62 48 C72 48 78 56 76 64 C74 72 64 74 60 66" fill="none" stroke="#d4ff8a" stroke-width="7" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="9" fill="#ebffbd"/>
    <circle cx="64" cy="22" r="5" fill="#9eff47"/>
    <circle cx="64" cy="106" r="5" fill="#9eff47"/>
    <circle cx="22" cy="64" r="5" fill="#9eff47"/>
    <circle cx="106" cy="64" r="5" fill="#9eff47"/>
  </svg>`,
  { size: 256 },
);

// Glowing chest heartwood hollow texture
const HEARTWOOD_MAW_SVG = svg(
  `<svg viewBox="0 0 128 160">
    <path d="M64 8 L98 36 L112 84 L92 132 L64 152 L36 132 L16 84 L30 36 Z" fill="#170b06"/>
    <path d="M64 18 L90 42 L100 84 L84 124 L64 140 L44 124 L28 84 L38 42 Z" fill="#134d24"/>
    <path d="M64 28 L82 48 L90 84 L78 114 L64 128 L50 114 L38 84 L46 48 Z" fill="#32ff7e"/>
    <path d="M64 42 L76 58 L80 84 L72 104 L64 114 L56 104 L48 84 L52 58 Z" fill="#b4ff5c"/>
    <ellipse cx="64" cy="82" rx="12" ry="22" fill="#ebffbd"/>
    <!-- Craggy bark ribs -->
    <path d="M22 60 L52 72 M106 60 L76 72 M24 102 L52 94 M104 102 L76 94" stroke="#24130b" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------
// Geometry Helpers
// ---------------------------------------------------------------------------

// Craggy stylized leaf/bark plate outline for extrusions
const BARK_SHIELD_OUTLINE: OutlinePoint[] = [
  [-0.14, 0, "sharp"],
  [-0.22, 0.14],
  [-0.18, 0.34],
  [-0.08, 0.46, "sharp"],
  [0, 0.54, "sharp"],
  [0.08, 0.46, "sharp"],
  [0.18, 0.34],
  [0.22, 0.14],
  [0.14, 0, "sharp"],
];

const RUNE_TABLET_OUTLINE: OutlinePoint[] = [
  [-0.11, 0, "sharp"],
  [-0.16, 0.12, "sharp"],
  [-0.13, 0.32, "sharp"],
  [0, 0.42, "sharp"],
  [0.13, 0.32, "sharp"],
  [0.16, 0.12, "sharp"],
  [0.11, 0, "sharp"],
];

const BEARD_SLAB_OUTLINE: OutlinePoint[] = [
  [-0.09, 0.32],
  [-0.12, 0.16],
  [-0.06, 0.04, "sharp"],
  [0, 0, "sharp"],
  [0.06, 0.04, "sharp"],
  [0.12, 0.16],
  [0.09, 0.32],
];

export default function build() {
  // Ancient Treant stands ~3.65m tall: massive, wide-shouldered Warcraft Ancient silhouette
  const b = createBuilder({ name: "ancientTreant", detail: 1, paintSize: 2048 });
  const rand = rng(4207);

  // =========================================================================
  // 1. SKELETON — Heroic Warcraft Treant proportions
  //    Massive hunched upper torso, deep split-trunk pelvis, stocky pillar legs,
  //    huge gorilla-like long arms with giant 3-clawed root hands, deeply set
  //    gnarled face with hinged lower jaw, and 5 articulated canopy boughs.
  // =========================================================================

  // Root joint at heavy split-trunk pelvis
  const hips = b.joint("hips", {
    at: [0, 1.18, -0.04],
    dir: [0, 1, 0.08],
    role: "spine",
    group: "torso",
  });

  // Gnarled S-curved trunk spine leaning forward with ancient weight
  const spinePath = catmull([
    [0, 1.18, -0.04],
    [0, 1.52, -0.10],
    [0, 1.92, -0.02],
    [0, 2.28, 0.12],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];

  // Thick forward-thrusting neck and sunken elder head
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 2.26, 0.22],
    dir: [0, 0.45, 0.89],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.34, 0.42],
    dir: [0, 0.12, 0.99],
    role: "head",
    group: "head",
  });

  // Articulated craggy lower bark jaw (hinged to open/roar)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.18, 0.46],
    dir: [0, -0.22, 0.97],
    role: "jaw",
    group: "head",
  });

  // Back tail-root counterbalancing spur
  const backRoot = b.chain(
    "backRoot",
    catmull([
      [0, 1.14, -0.22],
      [0, 0.86, -0.52],
      [0, 0.56, -0.78],
    ]),
    {
      parent: hips,
      names: ["tailRoot1", "tailRoot2"],
      role: "tail",
      group: "torso",
    },
  );

  // -------------------------------------------------------------------------
  // LEGS — Massive tree-trunk pillars with splayed root-talons planted on y=0
  // -------------------------------------------------------------------------
  const legs: {
    side: string;
    s: number;
    chain: ReturnType<typeof b.chain>;
    toeChains: ReturnType<typeof b.chain>[];
    anklePos: V3;
  }[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipRoot: V3 = [s * 0.44, 1.14, -0.02];
    const ankleTarget: V3 = [s * 0.54, 0.16, 0.04];

    const legPts = limb(hipRoot, ankleTarget, [0.56, 0.52], [s * 0.22, 0.1, 0.97]);
    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.54, 0, 0.12],
      group: `leg${side}`,
    });

    const ankleJoint = legChain.tip!;
    const toeChains: ReturnType<typeof b.chain>[] = [];

    // 3 front/side root-toes + 1 heavy heel root spur, all resting cleanly on y = 0
    const toeSpecs: { name: string; mid: V3; tip: V3 }[] = [
      {
        name: `toeInner${side}`,
        mid: [s * 0.38, 0.09, 0.28],
        tip: [s * 0.30, 0.04, 0.48],
      },
      {
        name: `toeMid${side}`,
        mid: [s * 0.56, 0.09, 0.34],
        tip: [s * 0.58, 0.04, 0.56],
      },
      {
        name: `toeOuter${side}`,
        mid: [s * 0.74, 0.09, 0.24],
        tip: [s * 0.88, 0.04, 0.40],
      },
      {
        name: `toeBack${side}`,
        mid: [s * 0.52, 0.09, -0.20],
        tip: [s * 0.50, 0.04, -0.42],
      },
    ];

    for (const ts of toeSpecs) {
      const tc = b.chain(
        ts.name,
        catmull([ankleTarget, ts.mid, ts.tip]),
        {
          parent: ankleJoint,
          count: 2,
          names: [`${ts.name}1`, `${ts.name}2`],
          role: "digit",
          group: `leg${side}`,
        },
      );
      toeChains.push(tc);
    }

    legs.push({ side, s, chain: legChain, toeChains, anklePos: ankleTarget });
  }

  // -------------------------------------------------------------------------
  // ARMS — Huge, chunky Warcraft pauldrons, muscular twisted wood forearms,
  //        and colossal 3-finger + thumb root-claw gauntlets in T/A rest pose
  // -------------------------------------------------------------------------
  const arms: {
    side: string;
    s: number;
    clavicle: ReturnType<typeof b.joint>;
    chain: ReturnType<typeof b.chain>;
    digits: ReturnType<typeof b.chain>[];
  }[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clavPos: V3 = [s * 0.42, 2.22, 0.04];
    const shoulderPos: V3 = [s * 0.78, 2.20, 0.02];
    const wristPos: V3 = [s * 1.48, 1.24, 0.22];

    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: clavPos,
      aim: shoulderPos,
      role: "arm",
      group: `arm${side}`,
    });

    const armPts = limb(shoulderPos, wristPos, [0.64, 0.68], [s * 0.35, -0.1, -0.93]);
    const armChain = b.chain(`arm${side}`, armPts, {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
      group: `arm${side}`,
    });

    const handJoint = armChain.tip!;
    const digits: ReturnType<typeof b.chain>[] = [];

    // Thumb + 3 massive bark-claw fingers, separated and extended for rigging
    const fingerSpecs: { name: string; base: V3; mid: V3; tip: V3 }[] = [
      {
        name: `thumb${side}`,
        base: [s * 1.44, 1.18, 0.36],
        mid: [s * 1.38, 1.04, 0.50],
        tip: [s * 1.30, 0.92, 0.58],
      },
      {
        name: `index${side}`,
        base: [s * 1.56, 1.16, 0.32],
        mid: [s * 1.66, 0.96, 0.40],
        tip: [s * 1.58, 0.78, 0.44],
      },
      {
        name: `middle${side}`,
        base: [s * 1.58, 1.15, 0.20],
        mid: [s * 1.70, 0.94, 0.22],
        tip: [s * 1.62, 0.74, 0.24],
      },
      {
        name: `ring${side}`,
        base: [s * 1.54, 1.16, 0.08],
        mid: [s * 1.64, 0.96, 0.04],
        tip: [s * 1.56, 0.78, 0.02],
      },
    ];

    for (const fs of fingerSpecs) {
      const fc = b.chain(
        fs.name,
        catmull([fs.base, fs.mid, fs.tip]),
        {
          parent: handJoint,
          count: 2,
          names: [`${fs.name}1`, `${fs.name}2`],
          role: "digit",
          group: `arm${side}`,
        },
      );
      digits.push(fc);
    }

    arms.push({ side, s, clavicle, chain: armChain, digits });
  }

  // -------------------------------------------------------------------------
  // CANOPY BOUGHS — 5 articulated crown branches + swinging Druid Lantern
  // -------------------------------------------------------------------------
  const boughSpecs: {
    name: string;
    pts: V3[];
    radii: number[];
    names: string[];
  }[] = [
    {
      name: "boughMainL",
      pts: [
        [0.28, 2.38, -0.02],
        [0.68, 2.86, -0.14],
        [1.12, 3.28, -0.22],
      ],
      radii: [0.19, 0.13, 0.07],
      names: ["boughL1", "boughL2"],
    },
    {
      name: "boughMainR",
      pts: [
        [-0.28, 2.38, -0.02],
        [-0.68, 2.86, -0.14],
        [-1.12, 3.28, -0.22],
      ],
      radii: [0.19, 0.13, 0.07],
      names: ["boughR1", "boughR2"],
    },
    {
      name: "boughBackL",
      pts: [
        [0.22, 2.26, -0.18],
        [0.54, 2.66, -0.58],
        [0.78, 3.04, -0.92],
      ],
      radii: [0.16, 0.11, 0.06],
      names: ["boughBL1", "boughBL2"],
    },
    {
      name: "boughBackR",
      pts: [
        [-0.22, 2.26, -0.18],
        [-0.54, 2.66, -0.58],
        [-0.78, 3.04, -0.92],
      ],
      radii: [0.16, 0.11, 0.06],
      names: ["boughBR1", "boughBR2"],
    },
    {
      name: "boughCrownC",
      pts: [
        [0, 2.42, -0.08],
        [0, 2.98, -0.24],
        [0, 3.46, -0.12],
      ],
      radii: [0.22, 0.15, 0.08],
      names: ["boughC1", "boughC2"],
    },
  ];

  const boughChains: {
    spec: (typeof boughSpecs)[number];
    chain: ReturnType<typeof b.chain>;
  }[] = [];

  for (const bs of boughSpecs) {
    const bc = b.chain(bs.name, catmull(bs.pts), {
      parent: chest,
      names: bs.names,
      role: "tentacle",
      group: "canopy",
    });
    boughChains.push({ spec: bs, chain: bc });
  }

  // Hanging lantern hinge joint on left front bough spur
  const lanternMountPos: V3 = [0.98, 2.92, 0.26];
  const lanternHinge = b.joint("lanternHinge", {
    parent: boughChains[0].chain.joints[1],
    at: lanternMountPos,
    dir: [0, -1, 0],
    role: "hinge",
    group: "lantern",
  });

  // =========================================================================
  // 2. PRIMARY VOLUMES — Trunk, Twist Ribs, Pauldrons, Limbs, Roots
  // =========================================================================

  // Main gnarled trunk loft over hips -> spine1 -> spine2 -> chest
  const trunkLoft = b.loft(
    [
      { at: [0, 1.02, -0.06], w: 0.96, h: 0.78 },
      { at: [0, 1.38, -0.09], w: 0.82, h: 0.72 },
      { at: [0, 1.78, -0.04], w: 1.04, h: 0.88 },
      { at: [0, 2.18, 0.08], w: 1.34, h: 0.98 },
      { at: [0, 2.48, 0.02], w: 1.08, h: 0.82 },
    ],
    {
      bone: [hips, spine],
      section: { ngon: 8 },
      color: ANCIENT_BARK,
      group: "torso",
      name: "trunkCore",
    },
  );

  // Heavy twisted outer bark ribs wrapping up the trunk from pelvis to shoulders
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front-flank muscular bark rib framing the hollow chest
    const frontRibPath = catmull([
      [s * 0.38, 1.06, 0.14],
      [s * 0.34, 1.46, 0.24],
      [s * 0.44, 1.88, 0.34],
      [s * 0.56, 2.26, 0.28],
    ]);
    b.sweep(frontRibPath, [0.16, 0.14, 0.19, 0.15], {
      bone: [hips, spine],
      section: { ngon: 6 },
      color: ANCIENT_BARK,
      group: "torso",
      name: `trunkRibFront${side}`,
    });

    // Lateral/back gnarled buttress ridge
    const backRibPath = catmull([
      [s * 0.42, 1.08, -0.22],
      [s * 0.48, 1.54, -0.34],
      [s * 0.58, 1.98, -0.28],
      [s * 0.52, 2.34, -0.14],
    ]);
    b.sweep(backRibPath, [0.18, 0.16, 0.20, 0.14], {
      bone: [hips, spine],
      section: { ngon: 6 },
      color: ANCIENT_BARK,
      group: "torso",
      name: `trunkRibBack${side}`,
    });

    // Pelvic root arch connecting trunk to upper thigh
    const archPath = catmull([
      [s * 0.16, 1.12, 0.22],
      [s * 0.36, 1.18, 0.16],
      [s * 0.48, 1.12, -0.08],
    ]);
    b.sweep(archPath, [0.13, 0.15, 0.12], {
      bone: hips,
      section: { ngon: 6 },
      color: KNUCKLE_BARK,
      group: "torso",
      name: `pelvicArch${side}`,
    });
  }

  // Central dorsal spine bark crest + back root tail sweep
  const dorsalPath = catmull([
    [0, 1.12, -0.34],
    [0, 1.56, -0.44],
    [0, 2.02, -0.38],
    [0, 2.42, -0.22],
  ]);
  b.sweep(dorsalPath, [0.22, 0.19, 0.23, 0.16], {
    bone: [hips, spine],
    section: { ngon: 6 },
    color: ANCIENT_BARK,
    group: "torso",
    name: "dorsalBarkCrest",
  });

  b.sweep(backRoot, [0.24, 0.15, 0.06], {
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    color: KNUCKLE_BARK,
    group: "torso",
    name: "backRootSpur",
  });

  // -------------------------------------------------------------------------
  // CHEST HEARTWOOD CORE — Glowing emerald life-crystal embedded inside ribcage
  // -------------------------------------------------------------------------
  const heartFrontPos: V3 = [0, 1.82, 0.39];
  b.decal(trunkLoft, HEARTWOOD_MAW_SVG, {
    at: heartFrontPos,
    dir: [0, 0.05, 1],
    size: [0.56, 0.68],
    bone: spine2,
    group: "torso",
    name: "heartwoodDecal",
  });

  // Glowing multifaceted emerald heartwood crystal core inside the chest cavity
  const heartCore = b.part(new THREE.OctahedronGeometry(0.16, 1), MAGIC_EMERALD, {
    bone: spine2,
    at: [0, 1.82, 0.33],
    scale: [0.95, 1.35, 0.65],
    flat: true,
    group: "torso",
    name: "heartwoodCrystal",
  });
  glow(heartCore, 1.8);

  const heartInner = b.part(new THREE.OctahedronGeometry(0.09, 0), MAGIC_CORE, {
    bone: spine2,
    at: [0, 1.82, 0.37],
    scale: [0.8, 1.2, 0.6],
    flat: true,
    group: "torso",
    name: "heartwoodInnerCore",
  });
  glow(heartInner, 2.2);

  // Craggy overarching rib-fangs caging the glowing heartwood
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [idx, yOff] of [0.14, -0.02, -0.16].entries()) {
      const ribCagePath = bezier(
        [s * 0.34, 1.82 + yOff, 0.24],
        [s * 0.22, 1.84 + yOff * 0.8, 0.44],
        [s * 0.07, 1.80 + yOff * 0.7, 0.41],
      );
      b.sweep(ribCagePath, [0.065, 0.018], {
        bone: spine2,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        color: KNUCKLE_BARK,
        group: "torso",
        name: `heartCageRib${side}${idx}`,
      });
    }
  }

  // =========================================================================
  // 3. HEAD & ANCIENT FACE — Deeply carved brow, glowing eyes, nose horn,
  //    articulated bark jaw, mossy wooden beard & stag-like elder antlers
  // =========================================================================

  // Thick gnarled neck column
  b.capsule([0, 2.18, 0.14], [0, 2.36, 0.42], [0.28, 0.24], {
    bone: neck,
    section: { ngon: 7 },
    color: ANCIENT_BARK,
    group: "head",
    name: "neckColumn",
  });

  // Cranium bark block — tall rugged oak face mask
  b.frustumBox(
    head.local([0, -0.06, -0.14]),
    head.local([0, 0.38, 0.18]),
    [0.52, 0.42],
    [0.44, 0.36],
    {
      bone: head,
      color: ANCIENT_BARK,
      group: "head",
      name: "craniumBlock",
    },
  );

  // Swept vertical cranium crown ridges (like a broken hollow crown atop the head)
  for (const [idx, xOff] of [-0.18, -0.06, 0.06, 0.18].entries()) {
    const spireH = idx === 1 || idx === 2 ? 0.34 : 0.26;
    const crownSpire = bezier(
      head.local([xOff, 0.18, 0.12]),
      head.local([xOff * 1.15, 0.28, 0.26]),
      head.local([xOff * 1.25, 0.24 + spireH * 0.3, 0.22 + spireH]),
    );
    b.sweep(crownSpire, [0.08, 0.02], {
      bone: head,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      color: ANCIENT_BARK,
      group: "head",
      name: `headCrownSpire${idx}`,
    });
  }

  // Massive overhanging V-shaped angry/wise Warcraft brow ridge
  const browPath = catmull([
    head.local([-0.34, 0.18, 0.14]),
    head.local([-0.18, 0.24, 0.11]),
    head.local([0, 0.22, 0.04]),
    head.local([0.18, 0.24, 0.11]),
    head.local([0.34, 0.18, 0.14]),
  ]);
  b.sweep(browPath, [0.05, 0.09, 0.11, 0.09, 0.05], {
    bone: head,
    section: { ngon: 6 },
    caps: "point",
    color: KNUCKLE_BARK,
    group: "head",
    name: "elderBrowRidge",
  });

  // Prominent craggy wooden nose bridge & upturned bark horn
  const noseBridge = catmull([
    head.local([0, 0.20, 0.06]),
    head.local([0, 0.28, -0.02]),
    head.local([0, 0.33, -0.08]),
  ]);
  b.sweep(noseBridge, [0.075, 0.055, 0.025], {
    bone: head,
    section: { ngon: 5 },
    caps: { start: "round", end: "point" },
    color: BARK_LIGHT,
    group: "head",
    name: "noseBridge",
  });

  // Cheekbone sweeps & sideburn bark flares + glowing emerald eyes in deep sockets
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Dark recessed eye socket
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BARK_DEEP, {
      bone: head,
      at: head.local([s * 0.13, 0.19, 0.03]),
      scale: [1.2, 0.75, 0.7],
      flat: true,
      group: "head",
      name: `eyeSocket${side}`,
    });

    // Fierce glowing faceted emerald eye
    const eyeOrb = b.part(new THREE.OctahedronGeometry(0.058, 1), MAGIC_LIME, {
      bone: head,
      at: head.local([s * 0.13, 0.22, 0.03]),
      scale: [1.25, 0.72, 0.85],
      rotation: [0, 0, s * -16],
      flat: true,
      group: "head",
      name: `eyeGlow${side}`,
    });
    glow(eyeOrb, 2.0);

    // Bright glowing pupil slit
    const pupil = b.part(new THREE.OctahedronGeometry(0.028, 0), MAGIC_CORE, {
      bone: head,
      at: head.local([s * 0.13, 0.255, 0.03]),
      scale: [0.55, 0.9, 0.6],
      flat: true,
      group: "head",
      name: `eyePupil${side}`,
    });
    glow(pupil, 2.5);

    // Swept craggy cheekbone armor
    const cheekPath = catmull([
      head.local([s * 0.06, 0.24, -0.06]),
      head.local([s * 0.20, 0.18, -0.05]),
      head.local([s * 0.34, 0.08, -0.02]),
    ]);
    b.sweep(cheekPath, [0.055, 0.075, 0.035], {
      bone: head,
      section: { ngon: 5 },
      caps: "point",
      color: ANCIENT_BARK,
      group: "head",
      name: `cheekRidge${side}`,
    });

    // Swept moustache bark tendril framing the mouth
    const mustachePath = catmull([
      head.local([s * 0.04, 0.25, -0.09]),
      head.local([s * 0.19, 0.20, -0.14]),
      head.local([s * 0.28, 0.10, -0.26]),
    ]);
    b.sweep(mustachePath, [0.048, 0.038, 0.012], {
      bone: head,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      color: LUSH_MOSS,
      group: "head",
      name: `mossMustache${side}`,
    });

    // Stag-like branching wooden head-antlers (classic Warcraft Ancient of Lore silhouette)
    const antlerPath = catmull([
      head.local([s * 0.22, 0.08, 0.22]),
      head.local([s * 0.46, 0.02, 0.42]),
      head.local([s * 0.64, -0.08, 0.68]),
      head.local([s * 0.56, 0.04, 0.92]),
    ]);
    const antlerSweep = b.sweep(antlerPath, [0.085, 0.065, 0.045, 0.016], {
      bone: head,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      color: KNUCKLE_BARK,
      group: "head",
      name: `headAntler${side}`,
    });

    // Antler tines
    const tine1 = antlerSweep.at(0.42, -30);
    b.spike(tine1, head.dir([s * 0.4, 0.55, 0.7]), 0.24, 0.038, KNUCKLE_BARK, {
      bone: head,
      section: { ngon: 5 },
      group: "head",
      name: `antlerTineA${side}`,
    });
    const tine2 = antlerSweep.at(0.72, 25);
    b.spike(tine2, head.dir([s * -0.2, 0.25, 0.9]), 0.20, 0.028, KNUCKLE_BARK, {
      bone: head,
      section: { ngon: 5 },
      group: "head",
      name: `antlerTineB${side}`,
    });
  }

  //Glowing mouth interior inside head/jaw cleft
  const mouthGlow = b.part(new THREE.SphereGeometry(0.11, 8, 6), MAGIC_EMERALD, {
    bone: head,
    at: head.local([0, 0.14, -0.10]),
    scale: [1.3, 0.8, 0.65],
    flat: true,
    group: "head",
    name: "mouthSapGlow",
  });
  glow(mouthGlow, 1.4);

  // -------------------------------------------------------------------------
  // ARTICULATED LOWER JAW — Heavy U-shaped bark mandible, wooden fang-tusks,
  //                         and layered beard of bark plates & hanging moss
  // -------------------------------------------------------------------------
  const jawRimPath = catmull([
    jaw.local([-0.22, 0.02, 0.04]),
    jaw.local([-0.18, 0.18, 0.01]),
    jaw.local([0, 0.25, -0.02]),
    jaw.local([0.18, 0.18, 0.01]),
    jaw.local([0.22, 0.02, 0.04]),
  ]);
  b.sweep(jawRimPath, [0.065, 0.085, 0.105, 0.085, 0.065], {
    bone: jaw,
    section: { ngon: 6 },
    caps: "round",
    color: ANCIENT_BARK,
    group: "head",
    name: "jawMandible",
  });

  // Lower jaw craggy wooden tusks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      jaw.local([s * 0.12, 0.20, 0.03]),
      jaw.dir([s * 0.08, 0.35, 0.92]),
      0.11,
      0.034,
      HEARTWOOD_PALE,
      {
        bone: jaw,
        section: { ngon: 5 },
        group: "head",
        name: `jawTusk${side}`,
      },
    );
  }

  // Layered elder bark & moss beard hanging from the jaw
  for (const [idx, xOff] of [-0.13, 0, 0.13].entries()) {
    const len = idx === 1 ? 0.44 : 0.34;
    const zFwd = idx === 1 ? 0.25 : 0.20;
    const beardPath = catmull([
      jaw.local([xOff, zFwd, -0.02]),
      jaw.local([xOff * 1.15, zFwd + 0.06, -0.18]),
      jaw.local([xOff * 0.9, zFwd + 0.02, -len]),
    ]);
    b.sweep(beardPath, [0.075, 0.055, 0.016], {
      bone: jaw,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      color: idx === 1 ? LUSH_MOSS : ANCIENT_BARK,
      group: "head",
      name: `jawBeardRoot${idx}`,
    });
  }

  // Extruded wooden beard-plate center medallion under the chin
  b.extrude(BEARD_SLAB_OUTLINE, {
    bone: jaw,
    at: jaw.local([0, 0.24, -0.34]),
    x: [1, 0, 0],
    y: [0, 0.96, 0.28],
    thickness: [0.03, 0.07],
    bevel: 0.012,
    smoothing: 1,
    color: ANCIENT_BARK,
    group: "head",
    name: "chinBeardPlate",
  });

  // Slightly open the jaw in a deep ancient rumble
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // =========================================================================
  // 4. MASSIVE WARCRAFT SHOULDER PAULDRONS & MOSS MANTLE
  // =========================================================================
  for (const { side, s, clavicle, chain: armChain } of arms) {
    const shoulderJoint = armChain.joints[0];

    // Thick collarbone branch
    b.sweep([clavicle.at, shoulderJoint.at], [0.18, 0.22], {
      bone: clavicle,
      section: { ngon: 6 },
      color: ANCIENT_BARK,
      group: `arm${side}`,
      name: `clavicleBranch${side}`,
    });

    // Oversized layered bark pauldron dome on shoulder
    const pauldronBase = shoulderJoint.at.clone().add(new THREE.Vector3(s * 0.04, 0.06, 0));
    const pauldronLoft = b.loft(
      [
        { at: offset(pauldronBase, [-s * 0.18, 0.06, 0], 1), w: 0.42, h: 0.28 },
        { at: offset(pauldronBase, [s * 0.06, 0.14, 0], 1), w: 0.56, h: 0.38 },
        { at: offset(pauldronBase, [s * 0.28, 0.02, 0], 1), w: 0.48, h: 0.30 },
        { at: offset(pauldronBase, [s * 0.42, -0.14, 0], 1), w: 0.26, h: 0.18 },
      ],
      {
        bone: shoulderJoint,
        section: { ngon: 7 },
        color: LUSH_MOSS,
        group: `arm${side}`,
        name: `pauldronMossDome${side}`,
      },
    );

    // 3 heavy upturned Warcraft bark spikes jutting from the pauldron
    for (const [k, zAng] of [-0.18, 0, 0.18].entries()) {
      const spikeBase: V3 = [
        pauldronBase.x + s * (0.08 + k * 0.06),
        pauldronBase.y + 0.12,
        pauldronBase.z + zAng,
      ];
      const spikeTip: V3 = [
        spikeBase[0] + s * (0.28 + (k === 1 ? 0.10 : 0)),
        spikeBase[1] + (k === 1 ? 0.34 : 0.24),
        spikeBase[2] + zAng * 0.6,
      ];
      const hornPath = bezier(
        spikeBase,
        [lerp(spikeBase, spikeTip, 0.5).x, spikeBase[1] + 0.06, spikeBase[2]],
        spikeTip,
      );
      b.sweep(hornPath, [0.095, 0.018], {
        bone: shoulderJoint,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        color: KNUCKLE_BARK,
        group: `arm${side}`,
        name: `pauldronHorn${side}${k}`,
      });
    }

    // Small shelf-fungi growing on the side of the pauldron
    const pSurf = b.surface(pauldronLoft);
    const fHit1 = pSurf.around(pauldronBase).at(s * 75, 10);
    if (fHit1) {
      b.stick(
        new THREE.CylinderGeometry(0.11, 0.07, 0.032, 8),
        FUNGUS_PAINT,
        fHit1,
        { bone: shoulderJoint, embed: 0.35, flat: true, group: `arm${side}`, name: `pauldronFungusA${side}` },
      );
    }
  }

  // =========================================================================
  // 5. ARMS, FOREARM ARMOR & COLOSSAL ROOT-CLAW GAUNTLETS
  // =========================================================================
  for (const { side, s, chain: armChain, digits } of arms) {
    const shoulderJ = armChain.joints[0];
    const elbowJ = armChain.joints[1];
    const handJ = armChain.joints[2];

    // Upper arm sweep + muscular forearm sweep
    b.sweep(
      armChain,
      (t) => (t < 0.45 ? 0.17 - t * 0.08 : 0.15 + Math.sin(((t - 0.45) / 0.55) * Math.PI) * 0.09),
      {
        section: { ngon: 7 },
        color: ANCIENT_BARK,
        group: `arm${side}`,
        name: `armSweep${side}`,
      },
    );

    // Gnarled elbow spur jutting backward
    const elbowSpurStart = elbowJ.at.clone();
    b.spike(
      elbowSpurStart,
      [s * 0.35, 0.15, -0.92],
      0.28,
      0.085,
      KNUCKLE_BARK,
      {
        bone: elbowJ,
        section: { ngon: 5 },
        group: `arm${side}`,
        name: `elbowSpur${side}`,
      },
    );

    // Heavy Warcraft forearm bark bracer plates (2 overlapping twisted wood slabs + vine bindings)
    const forearmMid = lerp(elbowJ.at, handJ.at, 0.52);
    const forearmDir = handJ.at.clone().sub(elbowJ.at).normalize();
    b.extrude(BARK_SHIELD_OUTLINE, {
      bone: elbowJ,
      at: elbowJ.at.clone().add(new THREE.Vector3(s * 0.08, -0.06, 0.06)),
      x: [0, 0, 1],
      y: forearmDir,
      thickness: [0.08, 0.04],
      bevel: 0.015,
      smoothing: 1,
      color: ANCIENT_BARK,
      group: `arm${side}`,
      name: `forearmShieldOuter${side}`,
    });

    // Coiled vine/rope wrap around forearm bracer
    const vineWrap = spiral(
      lerp(elbowJ.at, handJ.at, 0.32),
      lerp(elbowJ.at, handJ.at, 0.32).add(new THREE.Vector3(0, 0, 0.21)),
      forearmDir,
      { turns: s * 2.2, r1: 0.19, pitch: 0.11 },
    );
    b.sweep(vineWrap, 0.024, {
      bone: elbowJ,
      sides: 6,
      color: ROPE_LIGHT,
      group: `arm${side}`,
      name: `forearmVineWrap${side}`,
    });

    // Cut log end-cap burl on outer forearm with heartwood rings
    b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 8), HEARTWOOD_CUT, {
      bone: elbowJ,
      at: forearmMid.clone().add(new THREE.Vector3(s * 0.16, 0.02, -0.04)),
      dir: [s * 0.95, 0.2, -0.2],
      flat: true,
      group: `arm${side}`,
      name: `forearmBurlStub${side}`,
    });

    // Huge blocky Warcraft hand palm block
    b.frustumBox(
      handJ.at.clone().add(new THREE.Vector3(-s * 0.04, 0.06, 0)),
      handJ.at.clone().add(new THREE.Vector3(s * 0.10, -0.12, 0.04)),
      [0.34, 0.22],
      [0.38, 0.26],
      {
        bone: handJ,
        color: KNUCKLE_BARK,
        group: `arm${side}`,
        name: `handPalm${side}`,
      },
    );

    // Knuckle ridge spikes across the back of the hand
    for (const [dIdx, dc] of digits.entries()) {
      const knucklePos = dc.joints[0].at;
      b.part(new THREE.DodecahedronGeometry(0.068, 0), BARK_LIGHT, {
        bone: handJ,
        at: knucklePos.clone().add(new THREE.Vector3(s * 0.03, 0.03, 0)),
        flat: true,
        group: `arm${side}`,
        name: `knuckleNode${side}${dIdx}`,
      });

      // Swept root-claw finger tapering to a wicked curved wooden talon
      const isThumb = dIdx === 0;
      b.sweep(dc, isThumb ? [0.078, 0.055, 0.014] : [0.086, 0.062, 0.014], {
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        color: KNUCKLE_BARK,
        group: `arm${side}`,
        name: `fingerSweep${side}${dIdx}`,
      });
    }
  }

  // =========================================================================
  // 6. LEGS, KNEE BURLS & SPLAYED ROOT-TALON FEET
  // =========================================================================
  for (const { side, s, chain: legChain, toeChains } of legs) {
    const hipJ = legChain.joints[0];
    const kneeJ = legChain.joints[1];
    const ankleJ = legChain.joints[2];

    // Massive flared tree-trunk leg sweep (thick ankle flare like an oak trunk base)
    b.sweep(legChain, [0.27, 0.23, 0.29], {
      section: { ngon: 8 },
      color: ANCIENT_BARK,
      group: `leg${side}`,
      name: `legTrunk${side}`,
    });

    // Outer thigh buttress root rib
    const thighRib = catmull([
      hipJ.at.clone().add(new THREE.Vector3(s * 0.14, 0.08, 0)),
      lerp(hipJ.at, kneeJ.at, 0.5).add(new THREE.Vector3(s * 0.22, 0, 0.04)),
      kneeJ.at.clone().add(new THREE.Vector3(s * 0.18, -0.06, 0.06)),
    ]);
    b.sweep(thighRib, [0.11, 0.13, 0.09], {
      bone: hipJ,
      section: { ngon: 5 },
      color: ANCIENT_BARK,
      group: `leg${side}`,
      name: `thighButtress${side}`,
    });

    // Heavy craggy knee-guard bark plate + horn
    b.spike(
      kneeJ.at.clone().add(new THREE.Vector3(0, -0.04, 0.16)),
      [s * 0.15, 0.45, 0.88],
      0.26,
      0.12,
      KNUCKLE_BARK,
      {
        bone: kneeJ,
        section: { ngon: 5 },
        group: `leg${side}`,
        name: `kneeHorn${side}`,
      },
    );

    // Lower shin gnarled vertical root flutes flaring down to the ground
    for (const [rIdx, ang] of [-55, 0, 55, 135, -135].entries()) {
      const rad = (ang * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dz = Math.cos(rad);
      const shinFlute = catmull([
        lerp(kneeJ.at, ankleJ.at, 0.25).add(new THREE.Vector3(dx * 0.18, 0, dz * 0.18)),
        ankleJ.at.clone().add(new THREE.Vector3(dx * 0.25, 0.06, dz * 0.25)),
        [ankleJ.at.x + dx * 0.34, 0.05, ankleJ.at.z + dz * 0.34],
      ]);
      b.sweep(shinFlute, [0.065, 0.095, 0.045], {
        bone: kneeJ,
        section: { ngon: 5 },
        caps: "round",
        color: KNUCKLE_BARK,
        group: `leg${side}`,
        name: `shinRootFlute${side}${rIdx}`,
      });
    }

    // Swept articulated root-toes gripping the ground at y = 0
    for (const [tIdx, tc] of toeChains.entries()) {
      b.sweep(tc, [0.11, 0.075, 0.025], {
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        color: KNUCKLE_BARK,
        group: `leg${side}`,
        name: `toeRootSweep${side}${tIdx}`,
      });
    }
  }

  // =========================================================================
  // 7. CANOPY BOUGHS, SUB-TWIGS & LUSH FOLIAGE VOLUMES + LEAF CARDS
  // =========================================================================
  const canopyFoliageVolumes: ReturnType<typeof b.part>[] = [];

  for (const { spec, chain: bc } of boughChains) {
    // Primary gnarled bough sweep
    const bSweep = b.sweep(bc, spec.radii, {
      section: { ngon: 7 },
      caps: { start: "round", end: "point" },
      color: ANCIENT_BARK,
      group: "canopy",
      name: `${spec.name}Sweep`,
    });

    const tipJoint = bc.joints[bc.joints.length - 1];
    const tipPos = bc.at(1).at;

    // 3 forked secondary branches per main bough
    const forkDirs: V3[] = [
      [0.55, 0.65, 0.45],
      [-0.50, 0.70, 0.35],
      [0.10, 0.60, -0.75],
    ];
    for (const [fIdx, fd] of forkDirs.entries()) {
      const startPt = bSweep.at(0.55 + fIdx * 0.16, fIdx * 110 - 90);
      const forkTip = offset(startPt.at, fd, 0.48);
      const forkMid = lerp(startPt.at, forkTip, 0.5).add(new THREE.Vector3(0, 0.08, 0));
      b.sweep(bezier(startPt.at, forkMid, forkTip), [0.068, 0.016], {
        bone: tipJoint,
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        color: ANCIENT_BARK,
        group: "canopy",
        name: `${spec.name}Fork${fIdx}`,
      });

      // Sub-foliage puff on each fork tip
      const subCrown = b.part(new THREE.IcosahedronGeometry(0.36, 1), CROWN_FOLIAGE_PAINT, {
        bone: tipJoint,
        at: forkTip.clone().add(new THREE.Vector3(0, 0.06, 0)),
        scale: [1.25, 0.72, 1.15],
        flat: true,
        group: "canopy",
        name: `${spec.name}SubCrown${fIdx}`,
      });
      canopyFoliageVolumes.push(subCrown);
    }

    // Main bushy stylized tree-crown mass at the bough tip
    const mainCrown = b.part(new THREE.IcosahedronGeometry(0.54, 1), CROWN_FOLIAGE_PAINT, {
      bone: tipJoint,
      at: tipPos.clone().add(new THREE.Vector3(0, 0.10, 0)),
      scale: [1.32, 0.76, 1.22],
      flat: true,
      group: "canopy",
      name: `${spec.name}MainCrown`,
    });
    canopyFoliageVolumes.push(mainCrown);
  }

  // Dense layered Warcraft leaf cards scattered over all canopy volumes
  const canopySurface = b.surface(canopyFoliageVolumes);
  const leafHits = canopySurface.scatter(220, {
    rng: rng(1001),
    minDist: 0.14,
    filter: (h) => h.n.y > -0.35,
  });
  b.cards(leafHits, [LEAF_CLUSTER_SVG, LEAF_CLUSTER_SVG, GOLD_LEAF_SVG], {
    size: [0.34, 0.40],
    lean: 38,
    bend: 24,
    vary: 0.28,
    spin: 35,
    rng: rng(1002),
    group: "canopy",
    name: "canopyLeafCards",
  });

  // Hanging beard-moss and ancient creeper cards beneath the boughs, shoulders & jaw
  const hangingFrames = [
    frame([0.82, 2.84, -0.18], [0, 1, 0]),
    frame([-0.82, 2.84, -0.18], [0, 1, 0]),
    frame([0.52, 2.58, -0.56], [0, 1, 0]),
    frame([-0.52, 2.58, -0.56], [0, 1, 0]),
    frame([0.92, 2.08, 0.08], [0, 1, 0]),
    frame([-0.92, 2.08, 0.08], [0, 1, 0]),
    frame([0.34, 2.18, 0.26], [0, 1, 0]),
    frame([-0.34, 2.18, 0.26], [0, 1, 0]),
    frame([0, 2.78, -0.28], [0, 1, 0]),
  ];
  b.cards(hangingFrames, HANGING_MOSS_SVG, {
    size: [0.24, 0.56],
    lean: 180,
    flow: [0, 0, 1],
    cross: true,
    vary: 0.22,
    rng: rng(1009),
    bone: chest,
    group: "canopy",
    name: "hangingMossTresses",
  });

  // =========================================================================
  // 8. STORY DETAILS & WARCRAFT DRESSING:
  //    - Swinging Druidic Moon-Lantern on left bough
  //    - Rope-bound Runic Ward Stones on belt/hip and shoulder
  //    - Bioluminescent mushrooms & shelf fungi clusters
  //    - Perched woodland owl-spirit / bird nest in upper bough
  //    - Floating/spirited emerald wisp motes & runes
  // =========================================================================

  // -------------------------------------------------------------------------
  // A. Swinging Druidic Lantern on `lanternHinge`
  // -------------------------------------------------------------------------
  // Gnarled branch hook reaching forward to lanternHinge
  b.sweep(
    catmull([
      boughChains[0].chain.joints[1].at,
      [0.86, 3.02, 0.06],
      lanternMountPos,
    ]),
    [0.08, 0.055, 0.032],
    {
      bone: boughChains[0].chain.joints[1],
      section: { ngon: 6 },
      caps: { start: "round", end: "round" },
      color: ANCIENT_BARK,
      group: "lantern",
      name: "lanternHookBranch",
    },
  );

  // Braided vine cord + bronze cap + glowing amber/emerald lantern cage
  const cordEnd: V3 = [lanternMountPos[0], lanternMountPos[1] - 0.22, lanternMountPos[2]];
  b.rod(lanternMountPos, cordEnd, 0.016, ROPE_LIGHT, {
    bone: lanternHinge,
    sides: 6,
    group: "lantern",
    name: "lanternVineCord",
  });

  // Turned bronze/wood pagoda cap of the lantern
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.16, 0.02, "sharp"],
      [0.09, 0.07],
      [0.04, 0.12],
      [0, 0.14],
    ],
    {
      bone: lanternHinge,
      at: [cordEnd[0], cordEnd[1] - 0.08, cordEnd[2]],
      segments: 6,
      color: METAL_BRONZE,
      group: "lantern",
      name: "lanternRoofCap",
    },
  );

  // Glowing inner wisp flame inside the lantern
  const lanternCorePos: V3 = [cordEnd[0], cordEnd[1] - 0.19, cordEnd[2]];
  const lanternFlame = b.part(new THREE.OctahedronGeometry(0.085, 1), MAGIC_GOLD, {
    bone: lanternHinge,
    at: lanternCorePos,
    scale: [0.9, 1.35, 0.9],
    flat: true,
    group: "lantern",
    name: "lanternFlameCore",
  });
  glow(lanternFlame, 2.2);

  // 4 curved bronze ribs caging the lantern crystal
  b.ring(
    line([cordEnd[0], cordEnd[1] - 0.08, cordEnd[2]], [cordEnd[0], cordEnd[1] - 0.30, cordEnd[2]]),
    { count: 4, radius: 0.09, group: "lantern" },
    (rib) => {
      const topP = rib.at;
      const midP = rib.local([0, 0.11, 0.035]);
      const botP = [cordEnd[0], cordEnd[1] - 0.32, cordEnd[2]] as V3;
      b.sweep(bezier(topP, midP, botP), 0.014, {
        bone: lanternHinge,
        sides: 5,
        color: METAL_GOLD,
        group: "lantern",
      });
    },
  );

  // Bottom finial spike of the lantern
  b.spike([cordEnd[0], cordEnd[1] - 0.30, cordEnd[2]], [0, -1, 0], 0.09, 0.045, METAL_BRONZE, {
    bone: lanternHinge,
    section: { ngon: 6 },
    group: "lantern",
    name: "lanternBottomFinial",
  });

  // -------------------------------------------------------------------------
  // B. Rope-Bound Runic Ward Stones (Warcraft Druid Menhirs bound to waist & chest)
  // -------------------------------------------------------------------------
  // Heavy braided root-vine belt looping around the waist
  const trunkSurf = b.surface(trunkLoft);
  const waistLoop = trunkSurf.loop(frame([0, 1.34, -0.06], [0, 1, 0.05]), { lift: 0.018 });
  b.sweep(waistLoop, 0.032, {
    bone: hips,
    sides: 6,
    color: ROPE_LIGHT,
    group: "wards",
    name: "waistVineBelt",
  });

  const secondLoop = trunkSurf.loop(frame([0, 1.26, -0.06], [0, 1, -0.05]), { lift: 0.018 });
  b.sweep(secondLoop, 0.026, {
    bone: hips,
    sides: 6,
    color: ROPE_DARK,
    group: "wards",
    name: "waistVineBeltLower",
  });

  // Left & Right carved Runic Stone Tablets hanging at the hips + glowing rune decals
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stonePos: V3 = [s * 0.44, 1.06, 0.22];
    const stoneDir: V3 = [s * 0.72, 0.10, 0.68];
    const stoneX: V3 = [-s * 0.68, 0, 0.72];

    const tablet = b.extrude(RUNE_TABLET_OUTLINE, {
      bone: hips,
      at: stonePos,
      x: stoneX,
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.018,
      color: RUNIC_STONE,
      group: "wards",
      name: `hipRuneTablet${side}`,
    });

    // Glowing druidic spiral rune decal projected onto the stone tablet
    const runeDecal = b.decal(tablet, DRUID_RUNE_SVG, {
      at: [stonePos[0] + stoneDir[0] * 0.04, stonePos[1] + 0.21, stonePos[2] + stoneDir[2] * 0.04],
      dir: stoneDir,
      size: [0.24, 0.24],
      bone: hips,
      group: "wards",
      name: `hipRuneGlow${side}`,
    });
    glow(runeDecal, 1.7);
  }

  // Center back carved Menhir Waystone bound between the shoulder blades
  const backTablet = b.extrude(RUNE_TABLET_OUTLINE, {
    bone: chest,
    at: [0, 1.88, -0.46],
    x: [-1, 0, 0],
    y: [0, 0.98, -0.18],
    thickness: 0.11,
    bevel: 0.02,
    color: RUNIC_STONE,
    group: "wards",
    name: "backWaystoneTablet",
  });
  const backRune = b.decal(backTablet, DRUID_RUNE_SVG, {
    at: [0, 2.09, -0.52],
    dir: [0, -0.18, -0.98],
    size: [0.28, 0.28],
    bone: chest,
    group: "wards",
    name: "backRuneGlow",
  });
  glow(backRune, 1.7);

  // -------------------------------------------------------------------------
  // C. Bioluminescent Forest Mushrooms & Polypore Shelf Fungi Clusters
  // -------------------------------------------------------------------------
  const shroomClusters: {
    bone: ReturnType<typeof b.joint>;
    base: V3;
    dir: V3;
    scale: number;
  }[] = [
    { bone: chest, base: [0.54, 2.34, 0.18], dir: [0.35, 0.9, 0.2], scale: 1.0 },
    { bone: chest, base: [-0.58, 2.30, 0.14], dir: [-0.4, 0.88, 0.2], scale: 0.9 },
    { bone: hips, base: [0.36, 1.38, -0.28], dir: [0.5, 0.7, -0.5], scale: 0.85 },
    { bone: legs[0].chain.joints[1], base: [0.66, 0.56, 0.18], dir: [0.6, 0.75, 0.3], scale: 0.8 },
    { bone: legs[1].chain.joints[1], base: [-0.66, 0.48, -0.14], dir: [-0.6, 0.75, -0.3], scale: 0.85 },
  ];

  for (const [cIdx, sc] of shroomClusters.entries()) {
    for (let m = 0; m < 3; m++) {
      const mScale = sc.scale * (1 - m * 0.22);
      const off: V3 = [
        (m - 1) * 0.055 * sc.scale,
        m * 0.02,
        ((m % 2) - 0.5) * 0.05 * sc.scale,
      ];
      const stemBase = vec(sc.base).add(vec(off));
      const stemTip = offset(stemBase, sc.dir, 0.11 * mScale);

      b.capsule(stemBase, stemTip, [0.022 * mScale, 0.015 * mScale], FUNGUS_GILL, {
        bone: sc.bone,
        sides: 6,
        group: "fungi",
        name: `shroomStem_${cIdx}_${m}`,
      });

      // Glowing cyan-emerald toadstool cap
      const cap = b.lathe(
        [
          [0, -0.01 * mScale],
          [0.068 * mScale, 0],
          [0.052 * mScale, 0.038 * mScale],
          [0, 0.062 * mScale],
        ],
        {
          bone: sc.bone,
          at: stemTip,
          axis: sc.dir,
          segments: 7,
          smoothing: 1,
          color: m === 0 ? SHROOM_SPOTS : SHROOM_CAP,
          group: "fungi",
          name: `shroomCap_${cIdx}_${m}`,
        },
      );
      glow(cap, 1.35);
    }
  }

  // Tiered shelf-fungi brackets climbing the lower trunk and knees
  const shelfBrackets: { bone: ReturnType<typeof b.joint>; at: V3; rotY: number; r: number }[] = [
    { bone: spine1, at: [-0.42, 1.56, 0.16], rotY: -35, r: 0.14 },
    { bone: spine1, at: [-0.45, 1.63, 0.12], rotY: -45, r: 0.10 },
    { bone: spine2, at: [0.46, 1.94, -0.18], rotY: 120, r: 0.15 },
    { bone: spine2, at: [0.48, 2.02, -0.14], rotY: 110, r: 0.11 },
    { bone: legs[0].chain.joints[0], at: [0.64, 0.88, 0.12], rotY: 45, r: 0.12 },
    { bone: legs[1].chain.joints[0], at: [-0.64, 0.82, 0.14], rotY: -50, r: 0.13 },
  ];

  for (const [bIdx, sb] of shelfBrackets.entries()) {
    b.part(new THREE.CylinderGeometry(sb.r, sb.r * 0.65, 0.034, 8), FUNGUS_PAINT, {
      bone: sb.bone,
      at: sb.at,
      rotation: [8, sb.rotY, 0],
      scale: [1.25, 1, 0.78],
      flat: true,
      group: "fungi",
      name: `shelfFungus${bIdx}`,
    });
  }

  // -------------------------------------------------------------------------
  // D. Woodland Nest & Glowing Emerald Spirit Eggs tucked on Right Shoulder Bough
  // -------------------------------------------------------------------------
  const nestCenter: V3 = [-0.62, 2.66, -0.08];
  const nestRing = b.ring(
    frame(nestCenter, [0, 1, 0]),
    { count: 8, radius: 0.14, group: "nest" },
  );
  b.sweep(catmull(nestRing.items, { closed: true }), 0.042, {
    bone: boughChains[1].chain.joints[0],
    section: { ngon: 6 },
    color: ROPE_DARK,
    group: "nest",
    name: "boughBirdNestRim",
  });
  b.part(new THREE.CylinderGeometry(0.13, 0.09, 0.06, 8), BARK_MID, {
    bone: boughChains[1].chain.joints[0],
    at: [nestCenter[0], nestCenter[1] - 0.02, nestCenter[2]],
    flat: true,
    group: "nest",
    name: "boughBirdNestBowl",
  });

  // 3 glowing jade/gold forest spirit eggs nestled inside the twig bowl
  for (const [eIdx, eOff] of [
    [-0.04, 0.03, 0.02],
    [0.04, 0.03, 0.03],
    [0, 0.04, -0.04],
  ].entries()) {
    const egg = b.part(new THREE.SphereGeometry(0.042, 7, 6), eIdx === 2 ? MAGIC_GOLD : MAGIC_LIME, {
      bone: boughChains[1].chain.joints[0],
      at: [nestCenter[0] + eOff[0], nestCenter[1] + eOff[1], nestCenter[2] + eOff[2]],
      scale: [0.82, 1.28, 0.82],
      flat: true,
      group: "nest",
      name: `spiritEgg${eIdx}`,
    });
    glow(egg, 1.5);
  }

  // -------------------------------------------------------------------------
  // E. Scattered Bark Knots, Moss Tufts & Glowing Emerald Sap Crystal Veins
  // -------------------------------------------------------------------------
  const bodyAllSurface = b.surface([trunkLoft]);
  const barkBurls = bodyAllSurface.scatter(24, {
    rng: rand,
    minDist: 0.24,
    filter: (h) => h.n.y > -0.2 && Math.abs(h.at.x) > 0.16,
  });

  for (const [i, hit] of barkBurls.entries()) {
    if (i % 3 === 0) {
      // Glowing emerald sap crystal sprouting from ancient bark fissure
      const sap = b.stick(
        new THREE.OctahedronGeometry(0.048, 0),
        MAGIC_EMERALD,
        hit,
        { embed: 0.35, scale: [0.7, 1.6, 0.7], flat: true, group: "torso", name: `sapCrystal${i}` },
      );
      glow(sap, 1.6);
    } else {
      // Gnarled wooden burl/thorn knob
      b.stick(
        new THREE.ConeGeometry(0.055, 0.13, 5),
        KNUCKLE_BARK,
        hit,
        { embed: 0.25, flat: true, group: "torso", name: `barkThornKnob${i}` },
      );
    }
  }

  return b.root;
}
