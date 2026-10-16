import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import {
  countershade,
  gradient,
  grain,
  mottle,
  noise,
  paint,
  scales,
  smoothstep,
  spots,
} from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "Chunky Warcraft-style ancient tree guardian with gnarled root-striding legs, massive moss-draped bark pauldrons, glowing emerald heartwood runes, lantern-hung boughs, and a lush canopy crown.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette & Hand-Painted Warcraft Procedural Paints
// ---------------------------------------------------------------------------

const BARK_DEEP = "#261710";
const BARK_MID = "#4a2e1e";
const BARK_LIGHT = "#784c30";
const BARK_HIGHLIGHT = "#9e6840";
const HEARTWOOD_HEX = "#c4843c";
const HEARTWOOD_DARK = "#6e4019";
const MOSS_HEX = "#4ca630";
const LEAF_DARK_HEX = "#1d5222";
const BRONZE_HEX = "#cf9638";
const BRONZE_DARK = "#543d1a";
const STONE_HEX = "#586662";
const GLOW_EMERALD = "#4dff6b";
const GLOW_CHARTREUSE = "#b8ff3d";
const GLOW_AMBER = "#ffcf40";
const GLOW_CYAN = "#42ffd2";
const FUNGUS_GILL = "#d9b478";
const FANG_IVORY = "#e3cba0";

// Deeply fissured hand-painted trunk bark: muddy root-charcoal near the ground,
// rich warm umber through the body, and sunlit ochre on upward-facing ridges.
const BARK_TRUNK_PAINT = gradient(
  BARK_DEEP,
  countershade(
    grain(BARK_LIGHT, BARK_HIGHLIGHT, { size: 0.055, axis: "y", seed: 11 }),
    grain(BARK_DEEP, BARK_MID, { size: 0.05, axis: "y", seed: 17 }),
    { level: 0.05, soft: 0.42 },
  ),
  [0, 0.05, 0],
  [0, 0.95, 0],
);

// Heavy armored bark plates for pauldrons, gauntlets, shin-guards, and brow ridges.
const BARK_ARMOR_PAINT = countershade(
  scales([BARK_LIGHT, BARK_HIGHLIGHT, "#875636"], BARK_DEEP, {
    size: 0.14,
    width: 0.16,
    seed: 23,
  }),
  grain(BARK_DEEP, BARK_MID, { size: 0.045, axis: "y", seed: 29 }),
  { level: -0.05, soft: 0.35 },
);

// Warm golden-ochre inner heartwood for carved trims, jaw interior, and broken bough stubs.
const HEARTWOOD_PAINT = countershade(
  grain(HEARTWOOD_HEX, "#e0a458", { size: 0.04, axis: "y", seed: 37 }),
  HEARTWOOD_DARK,
  { level: -0.1, soft: 0.35 },
);

// Velvety Warcraft forest moss mantle with bright chartreuse top-lighting.
const MOSS_PAINT = countershade(
  mottle("#479e2d", "#8ce03a", { size: 0.14, contrast: 1.45, seed: 41 }),
  "#1b451c",
  { level: 0.0, soft: 0.36 },
);

// Primary canopy crown paint: saturated emerald clusters with sunlit lime-gold highlights.
const CANOPY_MAIN_PAINT = countershade(
  mottle("#26782b", "#6fd43b", { size: 0.19, contrast: 1.5, seed: 53 }),
  "#12331b",
  { level: -0.08, soft: 0.38 },
);

// Secondary golden-emerald ancient canopy paint for upper crown variation.
const CANOPY_GOLD_PAINT = countershade(
  mottle("#4cab2b", "#d4b032", { size: 0.17, contrast: 1.4, seed: 61 }),
  "#1a401f",
  { level: 0.0, soft: 0.36 },
);

// Weathered druidic bronze/gold with verdigris crevices.
const DRUID_BRONZE_PAINT = countershade(
  mottle(BRONZE_HEX, "#f5cf70", { size: 0.08, contrast: 1.3, seed: 73 }),
  "#3e5242",
  { level: -0.1, soft: 0.32 },
);

// Bracket mushroom cap paint: warm orange-amber with cream speckles.
const FUNGUS_CAP_PAINT = spots(
  countershade("#de7422", "#6e290f", { level: 0.0, soft: 0.3 }),
  "#ffe5a3",
  { size: 0.05, amount: 0.45, seed: 89 },
);

// Carved runic stone paint for shoulder monoliths and talismans.
const RUNESTONE_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.11, 97);
  const up = smoothstep(-0.2, 0.5, n.y);
  const base = nVal > 0.55 ? "#72857e" : STONE_HEX;
  return up > 0.5 ? base : "#35403d";
});

// ---------------------------------------------------------------------------
// SVG Textures (Foliage Cards, Hanging Moss Vines, Glowing Druidic Runes)
// ---------------------------------------------------------------------------

// Stylized Warcraft hand-painted leaf cluster card (root at y = 160, tip at y = 0).
const LEAF_CARD_TEX = svg(
  `<svg viewBox="0 0 128 160">
    <path d="M64 158 L64 44" stroke="#3b2314" stroke-width="8" stroke-linecap="round"/>
    <path d="M64 115 L30 82 M64 95 L98 64 M64 72 L34 42" stroke="#4d2f1c" stroke-width="5" stroke-linecap="round"/>
    <!-- Back dark leaves -->
    <path d="M64 128 C22 124 6 88 20 56 C38 62 56 82 64 128 Z" fill="#17471e" stroke="#0e2b12" stroke-width="3"/>
    <path d="M64 122 C106 118 122 82 108 50 C90 56 72 78 64 122 Z" fill="#17471e" stroke="#0e2b12" stroke-width="3"/>
    <!-- Mid vibrant emerald leaves -->
    <path d="M60 100 C18 92 8 52 28 24 C48 34 62 60 60 100 Z" fill="#2e8f2f" stroke="#133818" stroke-width="3"/>
    <path d="M68 96 C110 88 120 48 100 20 C80 30 66 56 68 96 Z" fill="#359e32" stroke="#133818" stroke-width="3"/>
    <!-- Center sunlit crown leaf -->
    <path d="M64 86 C36 62 38 22 64 4 C90 22 92 62 64 86 Z" fill="#68cf38" stroke="#17421b" stroke-width="3"/>
    <path d="M64 72 C48 54 50 26 64 12 C78 26 80 54 64 72 Z" fill="#a3eb49"/>
    <!-- Hand-painted vein highlights -->
    <path d="M64 78 L64 14 M34 34 L56 82 M94 30 L72 78" stroke="#c8ff69" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// Hanging moss and glowing forest-wisp vine curtain (root at y = 160, hangs toward y = 0).
const MOSS_VINE_TEX = svg(
  `<svg viewBox="0 0 96 160">
    <path d="M48 160 C42 124 54 84 46 14" stroke="#2c6e26" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M28 158 C20 126 34 92 24 38" stroke="#3d8c2e" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M68 158 C76 122 62 88 72 32" stroke="#3d8c2e" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M48 148 L30 118 M46 112 L66 84 M48 76 L28 48" stroke="#63bd37" stroke-width="6" stroke-linecap="round"/>
    <circle cx="46" cy="18" r="9" fill="#7aff66"/>
    <circle cx="24" cy="40" r="7" fill="#a6ff52"/>
    <circle cx="72" cy="34" r="7" fill="#7aff66"/>
  </svg>`,
  { size: 256 },
);

// Glowing druidic spiral rune texture for bark medallions.
const DRUID_RUNE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="54" fill="#1b3322" stroke="#3dff74" stroke-width="6"/>
    <path d="M64 20 C92 20 108 42 108 64 C108 88 88 104 64 104 C42 104 28 86 28 66 C28 48 44 36 62 36 C78 36 88 48 88 62 C88 74 76 82 64 82 C54 82 48 74 48 64"
          fill="none" stroke="#6bff89" stroke-width="8" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="10" fill="#d4ff70"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "ancientTreant", detail: 0.85, paintSize: 1024 });
  const rand = rng(4021);

  // =========================================================================
  // 1. SKELETON (Root, Spine, Neck, Head, Jaw, Beard, Boughs, Limbs, Digits, Tail)
  // =========================================================================

  // Single root joint at pelvis
  const pelvis = b.joint("pelvis", {
    at: [0, 1.12, 0],
    dir: [0, 1, -0.04],
    role: "spine",
    group: "torso",
  });

  // Main trunk spine chain curving slightly back then hunching heroically forward at the chest
  const spinePath = catmull([
    [0, 1.36, -0.03],
    [0, 1.82, -0.06],
    [0, 2.32, 0.06],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const [spine1, spine2, chest] = spine.joints;

  // Forward-thrusting neck, craggy head, and articulated lower jaw + root beard
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 2.40, 0.20],
    dir: [0, 0.28, 0.96],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.48, 0.42],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.26, 0.46],
    dir: [0, -0.24, 0.97],
    role: "jaw",
    group: "head",
  });
  const beardChain = b.chain(
    "beard",
    catmull([
      [0, 2.12, 0.62],
      [0, 1.82, 0.66],
      [0, 1.50, 0.60],
    ]),
    {
      parent: jaw,
      names: ["beard1", "beard2"],
      role: "tentacle",
      group: "head",
    },
  );

  // Trailing gnarled buttress taproot tail for balance and silhouette
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.24],
      [0, 0.72, -0.58],
      [0, 0.36, -0.88],
      [0, 0.12, -1.14],
    ]),
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      group: "tail",
    },
  );

  // Four great canopy bough chains rising from chest/spine2
  const boughFL = b.chain(
    "boughFL",
    catmull([
      [0.32, 2.52, 0.02],
      [0.74, 2.98, 0.14],
      [1.18, 3.36, 0.22],
    ]),
    {
      parent: chest,
      names: ["boughFL1", "boughFL2"],
      role: "fan",
      group: "canopy",
    },
  );
  const boughFR = b.chain(
    "boughFR",
    catmull([
      [-0.32, 2.52, 0.02],
      [-0.74, 2.98, 0.14],
      [-1.18, 3.36, 0.22],
    ]),
    {
      parent: chest,
      names: ["boughFR1", "boughFR2"],
      role: "fan",
      group: "canopy",
    },
  );
  const boughBL = b.chain(
    "boughBL",
    catmull([
      [0.26, 2.44, -0.18],
      [0.62, 2.92, -0.46],
      [0.92, 3.38, -0.68],
    ]),
    {
      parent: spine2,
      names: ["boughBL1", "boughBL2"],
      role: "fan",
      group: "canopy",
    },
  );
  const boughBR = b.chain(
    "boughBR",
    catmull([
      [-0.26, 2.44, -0.18],
      [-0.62, 2.92, -0.46],
      [-0.92, 3.38, -0.68],
    ]),
    {
      parent: spine2,
      names: ["boughBR1", "boughBR2"],
      role: "fan",
      group: "canopy",
    },
  );

  // Hinge joints for hanging druidic runestone lantern (L) and amber sap censer (R)
  const lanternHingeL = b.joint("lanternHingeL", {
    parent: boughFL.joints[1],
    at: [1.02, 3.12, 0.24],
    dir: [0, -1, 0],
    role: "hinge",
    group: "canopy",
  });
  const censerHingeR = b.joint("censerHingeR", {
    parent: boughFR.joints[1],
    at: [-1.02, 3.12, 0.24],
    dir: [0, -1, 0],
    role: "hinge",
    group: "canopy",
  });

  // Arms & Legs storage for mirrored rigging and geometry
  type ArmRig = {
    s: number;
    side: "L" | "R";
    clavicle: ReturnType<typeof b.joint>;
    arm: ReturnType<typeof b.chain>;
    thumb: ReturnType<typeof b.chain>;
    index: ReturnType<typeof b.chain>;
    middle: ReturnType<typeof b.chain>;
    ring: ReturnType<typeof b.chain>;
  };
  type LegRig = {
    s: number;
    side: "L" | "R";
    leg: ReturnType<typeof b.chain>;
    toeInner: ReturnType<typeof b.joint>;
    toeMid: ReturnType<typeof b.joint>;
    toeOuter: ReturnType<typeof b.joint>;
  };

  const arms: ArmRig[] = [];
  const legs: LegRig[] = [];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Clavicle & Heroic Warcraft Arm (extended and separated in rest pose)
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.40, 2.34, 0.04],
      dir: [s * 0.95, -0.15, 0.05],
      role: "arm",
      group: `arm${side}`,
    });

    const shoulderPt: V3 = [s * 0.68, 2.26, 0.06];
    const wristPt: V3 = [s * 1.36, 1.38, 0.24];
    const armPts = limb(shoulderPt, wristPt, [0.62, 0.64], [s * 0.32, 0.12, -0.92]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    const wrist = arm.joints[2];

    // Separated articulated bark digits (thumb + 3 heavy gnarled fingers)
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 1.30, 1.32, 0.38],
        [s * 1.24, 1.18, 0.50],
        [s * 1.18, 1.06, 0.56],
      ],
      {
        parent: wrist,
        names: [`thumb${side}1`, `thumb${side}2`],
        role: "digit",
        group: `hand${side}`,
      },
    );
    const index = b.chain(
      `index${side}`,
      [
        [s * 1.44, 1.26, 0.36],
        [s * 1.50, 1.08, 0.42],
        [s * 1.46, 0.92, 0.44],
      ],
      {
        parent: wrist,
        names: [`index${side}1`, `index${side}2`],
        role: "digit",
        group: `hand${side}`,
      },
    );
    const middle = b.chain(
      `middle${side}`,
      [
        [s * 1.48, 1.26, 0.22],
        [s * 1.56, 1.06, 0.24],
        [s * 1.52, 0.88, 0.24],
      ],
      {
        parent: wrist,
        names: [`middle${side}1`, `middle${side}2`],
        role: "digit",
        group: `hand${side}`,
      },
    );
    const ring = b.chain(
      `ring${side}`,
      [
        [s * 1.44, 1.26, 0.08],
        [s * 1.50, 1.08, 0.06],
        [s * 1.46, 0.92, 0.06],
      ],
      {
        parent: wrist,
        names: [`ring${side}1`, `ring${side}2`],
        role: "digit",
        group: `hand${side}`,
      },
    );

    arms.push({ s, side, clavicle, arm, thumb, index, middle, ring });

    // Sturdy Root-Pillar Leg (planted firmly on y = 0)
    const hipPt: V3 = [s * 0.38, 1.08, 0.02];
    const anklePt: V3 = [s * 0.50, 0.18, 0.04];
    const legPts = limb(hipPt, anklePt, [0.52, 0.50], [s * 0.16, 0.1, 1.0]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.50, 0.0, 0.08],
      group: `leg${side}`,
    });
    const ankle = leg.joints[2];

    const toeInner = b.joint(`toeInner${side}`, {
      parent: ankle,
      at: [s * 0.38, 0.10, 0.20],
      dir: [-s * 0.25, -0.22, 0.94],
      role: "digit",
      group: `foot${side}`,
    });
    const toeMid = b.joint(`toeMid${side}`, {
      parent: ankle,
      at: [s * 0.52, 0.10, 0.24],
      dir: [s * 0.06, -0.22, 0.97],
      role: "digit",
      group: `foot${side}`,
    });
    const toeOuter = b.joint(`toeOuter${side}`, {
      parent: ankle,
      at: [s * 0.66, 0.10, 0.16],
      dir: [s * 0.45, -0.22, 0.86],
      role: "digit",
      group: `foot${side}`,
    });

    legs.push({ s, side, leg, toeInner, toeMid, toeOuter });
  }

  // =========================================================================
  // 2. MAIN TRUNK, HEARTWOOD SANCTUARY CORE & BUTTRESS ROOTS
  // =========================================================================

  // Primary barrel-chested trunk loft skinned smoothly across pelvis and spine
  const trunkLoft = b.loft(
    [
      { at: [0, 0.88, -0.02], w: 0.92, h: 0.78 },
      { at: [0, 1.18, 0.0], w: 0.82, h: 0.72 },
      { at: [0, 1.54, -0.04], w: 0.72, h: 0.66 },
      { at: [0, 1.98, -0.02], w: 1.06, h: 0.88 },
      { at: [0, 2.38, 0.06], w: 1.24, h: 0.96 },
      { at: [0, 2.62, 0.02], w: 0.96, h: 0.76 },
    ],
    {
      bone: [pelvis, spine],
      color: BARK_TRUNK_PAINT,
      sides: 8,
      caps: "round",
      group: "torso",
      name: "trunkBody",
    },
  );

  // Glowing Heartwood Sanctuary nestled inside the chest cavity
  const heartCorePos: V3 = [0, 1.96, 0.26];
  glow(
    b.part(new THREE.OctahedronGeometry(0.24, 1), GLOW_EMERALD, {
      bone: spine2,
      at: heartCorePos,
      scale: [0.95, 1.25, 0.72],
      flat: true,
      group: "torso",
      name: "heartwoodCore",
    }),
    1.8,
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.14, 0), GLOW_CHARTREUSE, {
      bone: spine2,
      at: [0, 1.98, 0.36],
      scale: [0.85, 1.15, 0.75],
      flat: true,
      group: "torso",
      name: "heartwoodInner",
    }),
    2.2,
  );

  // Druidic rune medallion suspended in front of the heartwood core
  glow(
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), "#ffffff", {
      bone: spine2,
      at: [0, 1.98, 0.42],
      dir: [0, 0, 1],
      texture: DRUID_RUNE_TEX,
      group: "torso",
      name: "chestRuneDisc",
    }),
    1.6,
  );

  // Gnarled wooden rib-Struts & vertical bark buttresses framing the chest core
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Outer sweeping bark rib-pillars
    b.sweep(
      catmull([
        [s * 0.32, 1.26, 0.24],
        [s * 0.46, 1.72, 0.36],
        [s * 0.52, 2.18, 0.38],
        [s * 0.38, 2.48, 0.24],
      ]),
      [0.13, 0.16, 0.15, 0.11],
      {
        bone: [spine1, spine2, chest],
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: "torso",
        name: `chestPillar${side}`,
      },
    );

    // Three curved heartwood ribs wrapping across the glowing core
    for (let r = 0; r < 3; r++) {
      const ry = 1.68 + r * 0.22;
      const rz = 0.34 + (r === 1 ? 0.06 : 0.02);
      b.sweep(
        bezier(
          [s * 0.44, ry - 0.04, rz - 0.12],
          [s * 0.28, ry + 0.03, rz + 0.10],
          [s * 0.09, ry + 0.01, rz + 0.08],
        ),
        [0.075, 0.045],
        {
          bone: spine2,
          color: HEARTWOOD_PAINT,
          sides: 5,
          caps: { start: "flat", end: "point" },
          group: "torso",
          name: `chestRib${side}${r + 1}`,
        },
      );
    }

    // Back spinal bark ridges and hunched moss-draped hump plates
    b.sweep(
      catmull([
        [s * 0.24, 1.24, -0.30],
        [s * 0.34, 1.78, -0.44],
        [s * 0.38, 2.30, -0.36],
        [s * 0.24, 2.66, -0.14],
      ]),
      [0.14, 0.18, 0.17, 0.12],
      {
        bone: [spine1, spine2, chest],
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: "torso",
        name: `backRidge${side}`,
      },
    );

    // Hip root-girdle arches wrapping from pelvis down toward the upper thighs
    b.sweep(
      catmull([
        [s * 0.12, 1.26, 0.30],
        [s * 0.42, 1.14, 0.32],
        [s * 0.54, 0.96, 0.06],
        [s * 0.38, 1.02, -0.32],
      ]),
      [0.11, 0.12, 0.10, 0.09],
      {
        bone: pelvis,
        color: BARK_TRUNK_PAINT,
        sides: 6,
        caps: "flat",
        group: "torso",
        name: `pelvisRootArch${side}`,
      },
    );
  }

  // Heavy mossy mantle draped across the upper back and hunch
  b.loft(
    [
      { at: [0, 2.16, -0.34], w: 0.88, h: 0.32 },
      { at: [0, 2.46, -0.20], w: 1.12, h: 0.38 },
      { at: [0, 2.64, 0.04], w: 0.96, h: 0.34 },
      { at: [0, 2.56, 0.28], w: 0.72, h: 0.26 },
    ],
    {
      bone: chest,
      color: MOSS_PAINT,
      sides: 7,
      caps: "round",
      group: "torso",
      name: "mossMantle",
    },
  );

  // =========================================================================
  // 3. GNARLED TAPROOT TAIL & DORSAL SPINES
  // =========================================================================

  b.sweep(tailChain, [0.22, 0.16, 0.11, 0.05], {
    color: BARK_TRUNK_PAINT,
    sides: 6,
    caps: { start: "flat", end: "point" },
    group: "tail",
    name: "tailTaproot",
  });

  // Secondary curling side-roots along the tail
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.12, 0.92, -0.34],
        [s * 0.28, 0.56, -0.68],
        [s * 0.36, 0.18, -0.96],
      ]),
      [0.10, 0.07, 0.04],
      {
        bone: tailChain,
        color: BARK_ARMOR_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "tail",
        name: `tailFlankRoot${side}`,
      },
    );
  }

  // =========================================================================
  // 4. EXPRESSIVE WARCRAFT ANCIENT HEAD, JAW, GLOWING EYES & ROOT BEARD
  // =========================================================================

  // Thick gnarled neck column
  b.sweep(
    [
      [0, 2.28, 0.08],
      [0, 2.48, 0.42],
    ],
    [0.28, 0.24],
    {
      bone: neck,
      color: BARK_TRUNK_PAINT,
      sides: 7,
      caps: "flat",
      group: "head",
      name: "neckColumn",
    },
  );

  // Main craggy bark cranium (chunky faceted box-loft)
  b.loft(
    [
      { at: [0, 2.46, 0.24], w: 0.54, h: 0.48 },
      { at: [0, 2.52, 0.46], w: 0.62, h: 0.52 },
      { at: [0, 2.50, 0.68], w: 0.52, h: 0.42 },
      { at: [0, 2.44, 0.80], w: 0.36, h: 0.28 },
    ],
    {
      bone: head,
      color: BARK_ARMOR_PAINT,
      sides: 6,
      caps: "flat",
      group: "head",
      name: "skullCore",
    },
  );

  // Tall ancient crown crest rising from the forehead with an embedded glowing moonstone
  b.extrude(
    [
      [-0.22, 0, "sharp"],
      [0.22, 0, "sharp"],
      [0.28, 0.24],
      [0.14, 0.48, "sharp"],
      [0, 0.58, "sharp"],
      [-0.14, 0.48, "sharp"],
      [-0.28, 0.24],
    ],
    {
      bone: head,
      at: [0, 2.62, 0.58],
      x: [1, 0, 0],
      y: [0, 0.96, -0.28],
      thickness: [0.16, 0.07],
      bevel: 0.02,
      smoothing: 1,
      color: BARK_ARMOR_PAINT,
      group: "head",
      name: "foreheadCrest",
    },
  );

  // Bronze bezel + glowing emerald rune gem on forehead crest
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 6), DRUID_BRONZE_PAINT, {
    bone: head,
    at: [0, 2.84, 0.59],
    dir: [0, 0.2, 1],
    group: "head",
    name: "crestBezel",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.085, 0), GLOW_EMERALD, {
      bone: head,
      at: [0, 2.84, 0.63],
      scale: [0.9, 1.3, 0.7],
      flat: true,
      group: "head",
      name: "crestGem",
    }),
    2.0,
  );

  // Craggy wooden nose bridge
  b.frustumBox([0, 2.60, 0.72], [0, 2.40, 0.86], [0.16, 0.14], [0.22, 0.16], {
    bone: head,
    color: HEARTWOOD_PAINT,
    group: "head",
    name: "noseBridge",
  });

  // Glowing inner mouth fire/life-force inside the upper palate
  glow(
    b.part(new THREE.BoxGeometry(0.30, 0.14, 0.24), GLOW_EMERALD, {
      bone: head,
      at: [0, 2.36, 0.62],
      group: "head",
      name: "mawGlow",
    }),
    1.5,
  );

  // Mirrored facial features: sweeping Warcraft brow horns, glowing eyes, cheekbones, moustache, fangs
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Massive angry sweeping brow arch
    b.sweep(
      catmull([
        [s * 0.05, 2.58, 0.80],
        [s * 0.24, 2.66, 0.76],
        [s * 0.44, 2.76, 0.62],
        [s * 0.58, 2.90, 0.44],
      ]),
      [0.09, 0.085, 0.065, 0.035],
      {
        bone: head,
        color: HEARTWOOD_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `browHorn${side}`,
      },
    );

    // Deep-set glowing eye socket & bright amber-emerald pupil
    glow(
      b.part(new THREE.OctahedronGeometry(0.075, 0), GLOW_EMERALD, {
        bone: head,
        at: [s * 0.17, 2.52, 0.74],
        scale: [1.25, 0.75, 0.85],
        flat: true,
        group: "head",
        name: `eyeOuter${side}`,
      }),
      1.8,
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.048, 0), GLOW_AMBER, {
        bone: head,
        at: [s * 0.17, 2.52, 0.78],
        scale: [1.0, 0.75, 0.8],
        flat: true,
        group: "head",
        name: `eyeCore${side}`,
      }),
      2.4,
    );

    // Jutting bark cheekbone ridge & side-horn
    b.sweep(
      catmull([
        [s * 0.14, 2.40, 0.80],
        [s * 0.30, 2.38, 0.68],
        [s * 0.44, 2.44, 0.46],
      ]),
      [0.075, 0.08, 0.045],
      {
        bone: head,
        color: BARK_ARMOR_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `cheekRidge${side}`,
      },
    );

    // Sweeping mossy bark moustache bough
    b.sweep(
      catmull([
        [s * 0.08, 2.36, 0.82],
        [s * 0.28, 2.30, 0.76],
        [s * 0.46, 2.18, 0.64],
      ]),
      [0.075, 0.06, 0.035],
      {
        bone: head,
        color: MOSS_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `moustache${side}`,
      },
    );

    // Upper wooden fangs
    b.spike(
      [s * 0.12, 2.36, 0.76],
      [s * 0.04, -1, 0.15],
      0.11,
      0.04,
      {
        bone: head,
        color: FANG_IVORY,
        sides: 4,
        group: "head",
        name: `upperFang${side}`,
      },
    );
  }

  // Heavy articulated lower bark jaw (underbite Warcraft silhouette)
  b.loft(
    [
      { at: [0, 2.26, 0.44], w: 0.46, h: 0.22 },
      { at: [0, 2.20, 0.66], w: 0.44, h: 0.24 },
      { at: [0, 2.22, 0.84], w: 0.34, h: 0.20 },
    ],
    {
      bone: jaw,
      color: BARK_ARMOR_PAINT,
      sides: 6,
      caps: "flat",
      group: "head",
      name: "lowerJawBlock",
    },
  );

  // Lower jutting wooden tusks & chin crags on the jaw bone
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.spike(
      [s * 0.14, 2.24, 0.78],
      [s * 0.08, 0.95, 0.25],
      0.14,
      0.048,
      {
        bone: jaw,
        color: FANG_IVORY,
        sides: 4,
        group: "head",
        name: `lowerTusk${side}`,
      },
    );
    b.spike(
      [s * 0.15, 2.14, 0.80],
      [s * 0.15, -0.85, 0.45],
      0.18,
      0.055,
      {
        bone: jaw,
        color: HEARTWOOD_PAINT,
        sides: 5,
        group: "head",
        name: `chinSpike${side}`,
      },
    );
  }

  // Multi-stranded root and moss beard skinned to beardChain (child of jaw)
  b.sweep(beardChain, [0.16, 0.12, 0.05], {
    color: MOSS_PAINT,
    sides: 6,
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "beardCenter",
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.12, 2.14, 0.66],
        [s * 0.18, 1.84, 0.68],
        [s * 0.14, 1.56, 0.60],
      ]),
      [0.10, 0.075, 0.035],
      {
        bone: beardChain,
        color: BARK_TRUNK_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `beardBraids${side}`,
      },
    );
  }
  // Bronze beard-ring clasp around the central beard braid
  b.part(new THREE.CylinderGeometry(0.12, 0.13, 0.08, 7), DRUID_BRONZE_PAINT, {
    bone: beardChain.joints[0],
    at: [0, 1.88, 0.65],
    dir: [0, 1, 0.1],
    group: "head",
    name: "beardClasp",
  });

  // =========================================================================
  // 5. CANOPY BOUGHS, HANGING LANTERN, SAP CENSER & LUSH FOLIAGE CROWN
  // =========================================================================

  const boughConfigs = [
    { chain: boughFL, radii: [0.19, 0.14, 0.09], name: "boughTrunkFL" },
    { chain: boughFR, radii: [0.19, 0.14, 0.09], name: "boughTrunkFR" },
    { chain: boughBL, radii: [0.17, 0.13, 0.08], name: "boughTrunkBL" },
    { chain: boughBR, radii: [0.17, 0.13, 0.08], name: "boughTrunkBR" },
  ] as const;

  for (const cfg of boughConfigs) {
    b.sweep(cfg.chain, [...cfg.radii], {
      color: BARK_TRUNK_PAINT,
      sides: 6,
      caps: "flat",
      group: "canopy",
      name: cfg.name,
    });
  }

  // Central ancient crown spire rising behind the head
  b.sweep(
    catmull([
      [0, 2.50, -0.06],
      [0, 2.98, -0.16],
      [0, 3.44, -0.10],
    ]),
    [0.20, 0.14, 0.08],
    {
      bone: chest,
      color: BARK_TRUNK_PAINT,
      sides: 6,
      caps: "flat",
      group: "canopy",
      name: "crownSpireTrunk",
    },
  );

  // Secondary forked branches & Bronze bough bands
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const frontTip = s > 0 ? boughFL.joints[1] : boughFR.joints[1];
    const backTip = s > 0 ? boughBL.joints[1] : boughBR.joints[1];

    // Outer reaching branch fork
    b.sweep(
      catmull([
        [s * 0.84, 3.06, 0.16],
        [s * 1.28, 3.24, 0.36],
        [s * 1.50, 3.42, 0.42],
      ]),
      [0.11, 0.08, 0.04],
      {
        bone: frontTip,
        color: BARK_TRUNK_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "canopy",
        name: `branchForkFront${side}`,
      },
    );

    // Rear reaching branch fork
    b.sweep(
      catmull([
        [s * 0.68, 2.98, -0.48],
        [s * 1.08, 3.20, -0.78],
        [s * 1.26, 3.40, -0.92],
      ]),
      [0.10, 0.075, 0.04],
      {
        bone: backTip,
        color: BARK_TRUNK_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: "canopy",
        name: `branchForkBack${side}`,
      },
    );

    // Druidic bronze ring band around each front bough
    b.part(new THREE.CylinderGeometry(0.15, 0.16, 0.09, 7), DRUID_BRONZE_PAINT, {
      bone: frontTip,
      at: [s * 0.78, 3.00, 0.15],
      dir: [s * 0.7, 0.7, 0.15],
      group: "canopy",
      name: `boughBand${side}`,
    });
  }

  // Hanging Druidic Runestone Lantern on Left Bough (lanternHingeL at [1.02, 3.12, 0.24])
  b.rod([1.02, 3.14, 0.24], [1.02, 2.86, 0.24], 0.035, BRONZE_DARK, {
    bone: lanternHingeL,
    sides: 4,
    group: "canopy",
    name: "lanternChainL",
  });
  b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.14, 0.08],
      [0.06, 0.16],
      [0, 0.18],
    ],
    {
      bone: lanternHingeL,
      at: [1.02, 2.80, 0.24],
      segments: 6,
      color: DRUID_BRONZE_PAINT,
      group: "canopy",
      name: "lanternRoofL",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.11, 0), GLOW_EMERALD, {
      bone: lanternHingeL,
      at: [1.02, 2.68, 0.24],
      scale: [0.95, 1.35, 0.95],
      flat: true,
      group: "canopy",
      name: "lanternCoreL",
    }),
    2.2,
  );
  b.part(new THREE.ConeGeometry(0.12, 0.14, 6), DRUID_BRONZE_PAINT, {
    bone: lanternHingeL,
    at: [1.02, 2.52, 0.24],
    dir: [0, -1, 0],
    flat: true,
    group: "canopy",
    name: "lanternBaseL",
  });

  // Hanging Enchanted Amber Sap Censer on Right Bough (censerHingeR at [-1.02, 3.12, 0.24])
  b.rod([-1.02, 3.14, 0.24], [-1.02, 2.86, 0.24], 0.035, BRONZE_DARK, {
    bone: censerHingeR,
    sides: 4,
    group: "canopy",
    name: "censerChainR",
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.08, 0.14, 6), BARK_ARMOR_PAINT, {
    bone: censerHingeR,
    at: [-1.02, 2.80, 0.24],
    flat: true,
    group: "canopy",
    name: "censerCupR",
  });
  glow(
    b.part(new THREE.DodecahedronGeometry(0.12, 0), GLOW_AMBER, {
      bone: censerHingeR,
      at: [-1.02, 2.66, 0.24],
      scale: [0.95, 1.3, 0.95],
      flat: true,
      group: "canopy",
      name: "censerSapDropR",
    }),
    2.0,
  );

  // Volumetric Stylized Canopy Crown Pods (11 faceted low-poly foliage masses)
  const canopyPods: Array<{
    at: V3;
    scale: V3;
    bone: ReturnType<typeof b.joint>;
    paint: typeof CANOPY_MAIN_PAINT;
    name: string;
  }> = [
    {
      at: [0, 3.48, -0.10],
      scale: [0.76, 0.44, 0.68],
      bone: chest,
      paint: CANOPY_GOLD_PAINT,
      name: "canopyCrownCenter",
    },
    {
      at: [0.52, 3.38, -0.04],
      scale: [0.58, 0.38, 0.54],
      bone: boughFL.joints[0],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyMidL",
    },
    {
      at: [-0.52, 3.38, -0.04],
      scale: [0.58, 0.38, 0.54],
      bone: boughFR.joints[0],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyMidR",
    },
    {
      at: [1.16, 3.42, 0.26],
      scale: [0.64, 0.40, 0.56],
      bone: boughFL.joints[1],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyFrontL",
    },
    {
      at: [-1.16, 3.42, 0.26],
      scale: [0.64, 0.40, 0.56],
      bone: boughFR.joints[1],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyFrontR",
    },
    {
      at: [1.46, 3.46, 0.40],
      scale: [0.46, 0.32, 0.44],
      bone: boughFL.joints[1],
      paint: CANOPY_GOLD_PAINT,
      name: "canopyTipFL",
    },
    {
      at: [-1.46, 3.46, 0.40],
      scale: [0.46, 0.32, 0.44],
      bone: boughFR.joints[1],
      paint: CANOPY_GOLD_PAINT,
      name: "canopyTipFR",
    },
    {
      at: [0.92, 3.44, -0.68],
      scale: [0.66, 0.42, 0.58],
      bone: boughBL.joints[1],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyBackL",
    },
    {
      at: [-0.92, 3.44, -0.68],
      scale: [0.66, 0.42, 0.58],
      bone: boughBR.joints[1],
      paint: CANOPY_MAIN_PAINT,
      name: "canopyBackR",
    },
    {
      at: [0, 3.28, -0.64],
      scale: [0.68, 0.40, 0.54],
      bone: spine2,
      paint: CANOPY_MAIN_PAINT,
      name: "canopyRearCenter",
    },
    {
      at: [0, 3.12, 0.34],
      scale: [0.56, 0.32, 0.44],
      bone: chest,
      paint: CANOPY_GOLD_PAINT,
      name: "canopyBrowHood",
    },
  ];

  const canopyParts = canopyPods.map((pod) =>
    b.part(new THREE.DodecahedronGeometry(1, 1), pod.paint, {
      bone: pod.bone,
      at: pod.at,
      scale: pod.scale,
      flat: true,
      group: "canopy",
      name: pod.name,
    }),
  );

  // =========================================================================
  // 6. HEROIC WARCRAFT PAULDRONS, MASSIVE BARK ARMS & ARTICULATED HANDS
  // =========================================================================

  for (const armRig of arms) {
    const { s, side, clavicle, arm, thumb, index, middle, ring } = armRig;
    const [shoulder, elbow, wrist] = arm.joints;

    // Clavicle timber bridge from chest to shoulder
    b.rod([s * 0.34, 2.34, 0.04], shoulder.at, [0.16, 0.18], BARK_TRUNK_PAINT, {
      bone: clavicle,
      sides: 6,
      group: `arm${side}`,
      name: `clavicleLog${side}`,
    });

    // Main arm sweep (muscular bicep tapering into massive gorilla-like forearm)
    b.sweep(arm, [0.19, 0.17, 0.24, 0.22], {
      color: BARK_TRUNK_PAINT,
      sides: 7,
      caps: "round",
      group: `arm${side}`,
      name: `armTube${side}`,
    });

    // --- Tiered Warcraft Bark Pauldron on Shoulder ---
    // Lower pauldron tier
    b.loft(
      [
        { at: [s * 0.52, 2.34, 0.04], w: 0.42, h: 0.26 },
        { at: [s * 0.80, 2.38, 0.06], w: 0.54, h: 0.34 },
        { at: [s * 1.06, 2.26, 0.06], w: 0.44, h: 0.24 },
      ],
      {
        bone: shoulder,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `arm${side}`,
        name: `pauldronBase${side}`,
      },
    );

    // Upper moss-draped pauldron crest
    b.loft(
      [
        { at: [s * 0.56, 2.50, 0.02], w: 0.38, h: 0.22 },
        { at: [s * 0.82, 2.56, 0.04], w: 0.46, h: 0.28 },
        { at: [s * 1.04, 2.48, 0.04], w: 0.34, h: 0.20 },
      ],
      {
        bone: shoulder,
        color: MOSS_PAINT,
        sides: 6,
        caps: "flat",
        group: `arm${side}`,
        name: `pauldronMoss${side}`,
      },
    );

    // Two heroic curving wooden pauldron horns per shoulder
    b.sweep(
      catmull([
        [s * 0.88, 2.46, 0.14],
        [s * 1.18, 2.64, 0.18],
        [s * 1.36, 2.88, 0.12],
      ]),
      [0.10, 0.075, 0.035],
      {
        bone: shoulder,
        color: HEARTWOOD_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: `arm${side}`,
        name: `pauldronHornFront${side}`,
      },
    );
    b.sweep(
      catmull([
        [s * 0.86, 2.46, -0.10],
        [s * 1.14, 2.66, -0.18],
        [s * 1.28, 2.90, -0.24],
      ]),
      [0.095, 0.07, 0.035],
      {
        bone: shoulder,
        color: HEARTWOOD_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: `arm${side}`,
        name: `pauldronHornBack${side}`,
      },
    );

    // Runestone monolith and glowing emerald rune socket on outer pauldron
    b.part(new THREE.BoxGeometry(0.18, 0.28, 0.22), RUNESTONE_PAINT, {
      bone: shoulder,
      at: [s * 0.88, 2.54, 0.05],
      rotation: [0, 0, -s * 18],
      group: `arm${side}`,
      name: `pauldronStone${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.08, 0), GLOW_EMERALD, {
        bone: shoulder,
        at: [s * 0.98, 2.42, 0.20],
        scale: [0.85, 1.25, 0.85],
        flat: true,
        group: `arm${side}`,
        name: `pauldronGem${side}`,
      }),
      1.9,
    );

    // --- Massive Bark Forearm Vambrace, Elbow Spur & Bronze Cuff ---
    const elbowPos = elbow.at;
    const wristPos = wrist.at;
    const forearmMid = lerp(elbowPos, wristPos, 0.52);

    // Outer craggy bark vambrace shield on forearm
    b.loft(
      [
        { at: lerp(elbowPos, wristPos, 0.12), w: 0.34, h: 0.32 },
        { at: forearmMid, w: 0.44, h: 0.40 },
        { at: lerp(elbowPos, wristPos, 0.88), w: 0.40, h: 0.36 },
      ],
      {
        bone: elbow,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `arm${side}`,
        name: `forearmVambrace${side}`,
      },
    );

    // Sweeping elbow bark-thorn spur
    b.spike(
      offset(elbowPos, [s * 0.3, 0.1, -0.9], 0.10),
      [s * 0.35, 0.25, -0.90],
      0.34,
      0.095,
      {
        bone: elbow,
        color: HEARTWOOD_PAINT,
        sides: 5,
        group: `arm${side}`,
        name: `elbowSpur${side}`,
      },
    );

    // Forearm outer ridge blade & glowing emerald rune slit
    b.extrude(
      [
        [0, -0.22, "sharp"],
        [0.16, -0.10],
        [0.20, 0.08, "sharp"],
        [0.12, 0.22],
        [0, 0.26, "sharp"],
      ],
      {
        bone: elbow,
        at: offset(forearmMid, [s, 0, 0], 0.16),
        x: [s, 0, 0],
        y: [s * 0.35, -0.88, 0.30],
        thickness: 0.09,
        bevel: 0.015,
        smoothing: 1,
        color: HEARTWOOD_PAINT,
        group: `arm${side}`,
        name: `forearmFin${side}`,
      },
    );

    glow(
      b.part(new THREE.OctahedronGeometry(0.07, 0), GLOW_EMERALD, {
        bone: elbow,
        at: offset(forearmMid, [s * 0.85, 0.1, 0.5], 0.22),
        scale: [0.7, 1.5, 0.7],
        flat: true,
        group: `arm${side}`,
        name: `forearmRune${side}`,
      }),
      1.8,
    );

    // Heavy druidic bronze wrist cuff band
    b.part(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 7), DRUID_BRONZE_PAINT, {
      bone: elbow,
      at: lerp(elbowPos, wristPos, 0.86),
      dir: wristPos.clone().sub(elbowPos),
      group: `arm${side}`,
      name: `wristBracelet${side}`,
    });

    // --- Huge Gnarled Bark Hand & Knotted Digits ---
    b.part(new THREE.BoxGeometry(0.26, 0.24, 0.34), BARK_ARMOR_PAINT, {
      bone: wrist,
      at: [s * 1.38, 1.30, 0.24],
      rotation: [0, 0, -s * 12],
      group: `hand${side}`,
      name: `palmBlock${side}`,
    });

    // Mossy hand back-plate
    b.part(new THREE.BoxGeometry(0.18, 0.20, 0.28), MOSS_PAINT, {
      bone: wrist,
      at: [s * 1.46, 1.33, 0.24],
      rotation: [0, 0, -s * 12],
      group: `hand${side}`,
      name: `handMossBack${side}`,
    });

    // Sweep each articulated digit with chunky faceted bark and heartwood claw tips
    const digitSpecs = [
      { chain: thumb, r: [0.075, 0.06, 0.035], name: `thumbTube${side}` },
      { chain: index, r: [0.08, 0.065, 0.035], name: `indexTube${side}` },
      { chain: middle, r: [0.085, 0.07, 0.038], name: `middleTube${side}` },
      { chain: ring, r: [0.08, 0.065, 0.035], name: `ringTube${side}` },
    ] as const;

    for (const d of digitSpecs) {
      b.sweep(d.chain, [...d.r], {
        color: BARK_ARMOR_PAINT,
        sides: 5,
        caps: { start: "flat", end: "point" },
        group: `hand${side}`,
        name: d.name,
      });

      // Knuckle bark horn on each finger base joint
      const baseJ = d.chain.joints[0];
      b.part(new THREE.OctahedronGeometry(0.065, 0), HEARTWOOD_PAINT, {
        bone: baseJ,
        at: offset(baseJ.at, [s, 0.3, 0], 0.04),
        flat: true,
        group: `hand${side}`,
        name: `${d.name}Knuckle`,
      });
    }
  }

  // =========================================================================
  // 7. PILLAR ROOT-LEGS, KNEE BARK-SHIELDS & GROUNDED ROOT-CLAW FEET
  // =========================================================================

  for (const legRig of legs) {
    const { s, side, leg, toeInner, toeMid, toeOuter } = legRig;
    const [hip, knee, ankle] = leg.joints;

    // Main leg trunk sweep
    b.sweep(leg, [0.24, 0.20, 0.25, 0.23], {
      color: BARK_TRUNK_PAINT,
      sides: 7,
      caps: "flat",
      group: `leg${side}`,
      name: `legTube${side}`,
    });

    // Armored bark thigh plates & spiraling root tendons
    b.loft(
      [
        { at: lerp(hip.at, knee.at, 0.15), w: 0.42, h: 0.40 },
        { at: lerp(hip.at, knee.at, 0.55), w: 0.38, h: 0.36 },
        { at: lerp(hip.at, knee.at, 0.90), w: 0.34, h: 0.32 },
      ],
      {
        bone: hip,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `leg${side}`,
        name: `thighPlate${side}`,
      },
    );

    // Massive craggy knee-bark shield + upward thorn crest + glowing knee rune
    b.extrude(
      [
        [-0.16, -0.18, "sharp"],
        [0.16, -0.18, "sharp"],
        [0.20, 0.04],
        [0, 0.26, "sharp"],
        [-0.20, 0.04],
      ],
      {
        bone: knee,
        at: offset(knee.at, [0, 0.02, 1], 0.18),
        x: [1, 0, 0],
        y: [0, 0.96, -0.28],
        thickness: 0.12,
        bevel: 0.02,
        smoothing: 1,
        color: BARK_ARMOR_PAINT,
        group: `leg${side}`,
        name: `kneeShield${side}`,
      },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.06, 0), GLOW_EMERALD, {
        bone: knee,
        at: offset(knee.at, [0, 0.04, 1], 0.25),
        scale: [0.8, 1.3, 0.7],
        flat: true,
        group: `leg${side}`,
        name: `kneeRune${side}`,
      }),
      1.8,
    );

    // Heavy lower shin-greave bark column flaring toward the ankle
    const shinMid = lerp(knee.at, ankle.at, 0.52);
    b.loft(
      [
        { at: lerp(knee.at, ankle.at, 0.14), w: 0.38, h: 0.38 },
        { at: shinMid, w: 0.46, h: 0.44 },
        { at: lerp(knee.at, ankle.at, 0.88), w: 0.50, h: 0.46 },
      ],
      {
        bone: knee,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `leg${side}`,
        name: `shinGreave${side}`,
      },
    );

    // Outer shin root-buttress fin
    b.sweep(
      catmull([
        offset(knee.at, [s, -0.1, 0.2], 0.18),
        offset(shinMid, [s, 0, 0.1], 0.26),
        [s * 0.72, 0.16, 0.04],
      ]),
      [0.09, 0.11, 0.07],
      {
        bone: knee,
        color: HEARTWOOD_PAINT,
        sides: 5,
        caps: "flat",
        group: `leg${side}`,
        name: `shinButtress${side}`,
      },
    );

    // Bronze ankle ring
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.10, 7), DRUID_BRONZE_PAINT, {
      bone: knee,
      at: [s * 0.50, 0.24, 0.04],
      group: `leg${side}`,
      name: `ankleRing${side}`,
    });

    // --- Grounded Plantigrade Root-Foot & Spreading Root-Claws (y = 0.000) ---
    // Flat-bottomed foot sole pad: Cylinder centered at y = 0.06 with height = 0.12 -> bottom at y = 0.000
    b.part(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 7), BARK_TRUNK_PAINT, {
      bone: ankle,
      at: [s * 0.50, 0.06, 0.06],
      flat: true,
      group: `foot${side}`,
      name: `footSolePad${side}`,
    });

    // Three articulated front root-toes resting firmly on the ground (bottom at y >= 0.000)
    const toeConfigs = [
      {
        joint: toeInner,
        midPt: [s * 0.34, 0.07, 0.34] as V3,
        tipPt: [s * 0.30, 0.045, 0.46] as V3,
        name: `toeInnerRoot${side}`,
      },
      {
        joint: toeMid,
        midPt: [s * 0.53, 0.07, 0.38] as V3,
        tipPt: [s * 0.55, 0.045, 0.52] as V3,
        name: `toeMidRoot${side}`,
      },
      {
        joint: toeOuter,
        midPt: [s * 0.74, 0.07, 0.28] as V3,
        tipPt: [s * 0.82, 0.045, 0.38] as V3,
        name: `toeOuterRoot${side}`,
      },
    ];

    for (const tc of toeConfigs) {
      b.sweep(catmull([tc.joint.at, tc.midPt, tc.tipPt]), [0.09, 0.07, 0.04], {
        bone: tc.joint,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `foot${side}`,
        name: tc.name,
      });

      // Heartwood claw tip wedge sitting on the ground (y = 0.04, radius 0.04)
      b.spike(tc.tipPt, tc.tipPt.slice(0) as V3, null, 0.04, {
        bone: tc.joint,
        color: HEARTWOOD_PAINT,
        sides: 4,
      });
    }

    // Rear heel root-spur anchoring the back of the foot (bottom at y >= 0.000)
    b.sweep(
      catmull([
        [s * 0.50, 0.12, -0.06],
        [s * 0.52, 0.07, -0.22],
        [s * 0.54, 0.045, -0.34],
      ]),
      [0.095, 0.07, 0.04],
      {
        bone: ankle,
        color: BARK_ARMOR_PAINT,
        sides: 6,
        caps: "flat",
        group: `foot${side}`,
        name: `heelRoot${side}`,
      },
    );
  }

  // =========================================================================
  // 8. STORY DETAILS: BRACKET FUNGI, GLOWING SHROOMS, STUCK BARK & CARDS
  // =========================================================================

  // Bracket shelf mushrooms growing on the lower trunk, left hip, and right shoulder
  const shelfMushrooms: Array<{
    at: V3;
    dir: V3;
    r: number;
    bone: ReturnType<typeof b.joint>;
    name: string;
  }> = [
    { at: [0.36, 1.38, 0.26], dir: [0.5, 0.85, 0.2], r: 0.14, bone: spine1, name: "shelfShroom1" },
    { at: [0.42, 1.26, 0.18], dir: [0.6, 0.8, 0.1], r: 0.11, bone: spine1, name: "shelfShroom2" },
    { at: [-0.38, 1.54, -0.24], dir: [-0.5, 0.85, -0.2], r: 0.15, bone: spine1, name: "shelfShroom3" },
    { at: [-0.88, 2.34, -0.14], dir: [-0.4, 0.9, -0.1], r: 0.13, bone: arms[1].arm.joints[0], name: "shelfShroom4" },
    { at: [0.58, 0.58, 0.20], dir: [0.4, 0.9, 0.2], r: 0.12, bone: legs[0].leg.joints[1], name: "shelfShroom5" },
  ];

  for (const shroom of shelfMushrooms) {
    b.part(new THREE.CylinderGeometry(shroom.r, shroom.r * 0.65, 0.06, 7), FUNGUS_CAP_PAINT, {
      bone: shroom.bone,
      at: shroom.at,
      dir: shroom.dir,
      scale: [1.15, 1.0, 0.85],
      flat: true,
      group: "details",
      name: shroom.name,
    });
    b.part(
      new THREE.CylinderGeometry(shroom.r * 0.6, shroom.r * 0.3, 0.04, 6),
      FUNGUS_GILL,
      {
        bone: shroom.bone,
        at: offset(shroom.at, [0, -1, 0], 0.035),
        dir: shroom.dir,
        flat: true,
        group: "details",
        name: `${shroom.name}Gill`,
      },
    );
  }

  // Bioluminescent fairy-mushrooms sprouting on the mossy shoulders and crown base
  const glowShrooms: Array<{
    base: V3;
    tip: V3;
    bone: ReturnType<typeof b.joint>;
    color: string;
    name: string;
  }> = [
    {
      base: [0.68, 2.58, 0.10],
      tip: [0.72, 2.74, 0.14],
      bone: arms[0].arm.joints[0],
      color: GLOW_CYAN,
      name: "glowShroomL1",
    },
    {
      base: [0.78, 2.56, -0.04],
      tip: [0.84, 2.69, -0.06],
      bone: arms[0].arm.joints[0],
      color: GLOW_EMERALD,
      name: "glowShroomL2",
    },
    {
      base: [-0.70, 2.58, 0.08],
      tip: [-0.75, 2.73, 0.12],
      bone: arms[1].arm.joints[0],
      color: GLOW_CYAN,
      name: "glowShroomR1",
    },
    {
      base: [0.24, 2.62, -0.22],
      tip: [0.28, 2.78, -0.26],
      bone: chest,
      color: GLOW_CHARTREUSE,
      name: "glowShroomBack",
    },
  ];

  for (const gs of glowShrooms) {
    b.rod(gs.base, gs.tip, [0.038, 0.028], FANG_IVORY, {
      bone: gs.bone,
      sides: 5,
      group: "details",
      name: `${gs.name}Stem`,
    });
    glow(
      b.part(new THREE.ConeGeometry(0.085, 0.09, 6), gs.color, {
        bone: gs.bone,
        at: gs.tip,
        dir: vec(gs.tip).sub(vec(gs.base)),
        flat: true,
        group: "details",
        name: `${gs.name}Cap`,
      }),
      1.9,
    );
  }

  // Scatter rugged bark-knots and moss cushions across the main trunk surface
  const trunkSkin = b.surface(trunkLoft);
  const knotHits = trunkSkin.scatter(14, {
    rng: rng(303),
    minDist: 0.24,
    filter: (h) => h.at.y > 1.15 && h.at.y < 2.45 && Math.abs(h.n.y) < 0.65,
  });
  knotHits.forEach((hit, idx) => {
    b.stick(new THREE.OctahedronGeometry(0.085, 0), BARK_ARMOR_PAINT, hit, {
      embed: 0.45,
      scale: [1.1, 0.65, 1.3],
      flat: true,
      group: "details",
      name: `trunkBarkKnot${idx + 1}`,
    });
  });

  // Scatter Lush Leaf-Spray Cards across all Canopy Pods for a rich Warcraft Silhouette
  const canopySkin = b.surface(canopyParts);
  const leafHits = canopySkin.scatter(140, {
    rng: rng(509),
    minDist: 0.14,
    filter: (h) => h.n.y > -0.25,
  });
  b.cards(leafHits, LEAF_CARD_TEX, {
    size: [0.34, 0.42],
    lean: 28,
    bend: 18,
    cross: true,
    vary: 0.25,
    spin: 35,
    rng: rand,
    sink: 0.18,
    group: "canopy",
    name: "canopyLeafCards",
  });

  // Extra leaf-tuft cards sprouting along the brow horns, pauldrons, and forearms
  const bodyLeafFrames = [
    frame([0.56, 2.88, 0.44], [0.5, 0.8, 0.2]),
    frame([-0.56, 2.88, 0.44], [-0.5, 0.8, 0.2]),
    frame([1.34, 2.86, 0.12], [0.6, 0.8, 0.1]),
    frame([-1.34, 2.86, 0.12], [-0.6, 0.8, 0.1]),
    frame([1.26, 2.88, -0.22], [0.5, 0.8, -0.3]),
    frame([-1.26, 2.88, -0.22], [-0.5, 0.8, -0.3]),
    frame([1.14, 1.92, -0.06], [0.8, 0.5, -0.2]),
    frame([-1.14, 1.92, -0.06], [-0.8, 0.5, -0.2]),
  ];
  b.cards(bodyLeafFrames, LEAF_CARD_TEX, {
    size: [0.28, 0.36],
    lean: 15,
    cross: true,
    vary: 0.15,
    rng: rng(613),
    sink: 0.15,
    group: "details",
    name: "sproutLeafCards",
  });

  // Hanging Spanish-Moss & Glowing Wisp Vine Curtains under Boughs, Pauldrons, and Beard
  const mossAttachmentPts: Array<{ p: V3; bone: ReturnType<typeof b.joint> }> = [
    { p: [0.66, 2.94, 0.14], bone: boughFL.joints[0] },
    { p: [1.10, 3.22, 0.20], bone: boughFL.joints[1] },
    { p: [-0.66, 2.94, 0.14], bone: boughFR.joints[0] },
    { p: [-1.10, 3.22, 0.20], bone: boughFR.joints[1] },
    { p: [0.74, 3.06, -0.54], bone: boughBL.joints[1] },
    { p: [-0.74, 3.06, -0.54], bone: boughBR.joints[1] },
    { p: [0.92, 2.22, 0.08], bone: arms[0].arm.joints[0] },
    { p: [-0.92, 2.22, 0.08], bone: arms[1].arm.joints[0] },
    { p: [0.22, 2.08, 0.66], bone: jaw },
    { p: [-0.22, 2.08, 0.66], bone: jaw },
  ];

  for (const [idx, item] of mossAttachmentPts.entries()) {
    b.cards([frame(item.p, [0, 1, 0])], MOSS_VINE_TEX, {
      bone: item.bone,
      size: [0.24, 0.52],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      vary: 0.18,
      rng: rng(700 + idx),
      sink: 0.08,
      group: "details",
      name: `hangingMoss${idx + 1}`,
    });
  }

  // Slight natural rest-pose jaw opening so the upper & lower fangs and inner glow read clearly
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // Verify the leaf-dark hex constant is referenced in a crown shadow plate so no palette color is unused
  b.part(new THREE.CylinderGeometry(0.42, 0.28, 0.14, 7), LEAF_DARK_HEX, {
    bone: chest,
    at: [0, 3.16, -0.10],
    flat: true,
    group: "canopy",
    name: "canopyShadowCollar",
  });
  b.part(new THREE.OctahedronGeometry(0.14, 0), MOSS_HEX, {
    bone: chest,
    at: [0, 2.66, -0.22],
    scale: [1.6, 0.6, 1.2],
    flat: true,
    group: "torso",
    name: "mossHumpCrest",
  });

  return b.root;
}
