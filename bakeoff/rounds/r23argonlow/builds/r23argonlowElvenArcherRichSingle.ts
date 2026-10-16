import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { gradient, grain, mottle, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "High-fantasy anime elven ranger archer in forest-green and champagne-gold regalia, with cel-shaded layered cloak, silver-blonde braided hair, ornate leaf-motif armor, back quiver with glowing fletched arrows, and enchanted spirit longbow.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "elvenArcher", detail: 1, paintSize: 2048 });

  // ============================================================================
  // PALETTE & PAINTS (High-Fantasy Anime Cel-Shaded)
  // ============================================================================
  const SKIN_HEX = "#ffe8d6";
  const SKIN_SHAD = "#e4b298";
  const SKIN = cel(SKIN_HEX, SKIN_SHAD);
  const SKIN_BLUSH = cel(
    paint((p) => {
      const cheeks =
        smoothstep(0.05, 0.015, Math.hypot(Math.abs(p.x) - 0.044, p.y - 1.545, p.z - 0.088)) +
        smoothstep(0.035, 0.01, Math.hypot(p.x, p.y - 1.548, p.z - 0.105)) * 0.5;
      return cheeks > 0.25 ? "#ffb5a8" : SKIN_HEX;
    }),
    SKIN_SHAD,
  );

  const HAIR_LIT = "#fff5cc";
  const HAIR_MID = "#ebd28e";
  const HAIR_SHAD = "#b89558";
  const HAIR_PAINT = cel(
    grain(HAIR_LIT, HAIR_MID, { size: 0.018, axis: "y", seed: 11 }),
    HAIR_SHAD,
  );
  const HAIR_TIP_PAINT = cel(
    gradient(
      grain(HAIR_LIT, HAIR_MID, { size: 0.018, axis: "y", seed: 11 }),
      "#a8e6cf",
      [0, 1.35, 0],
      [0, 0.9, 0],
    ),
    "#6da892",
  );

  // Forest emerald & viridian greens
  const EMERALD_BASE = mottle("#1c5c42", "#144532", { size: 0.09, seed: 21 });
  const EMERALD = cel(EMERALD_BASE, "#0c2b21");
  const SAGE = cel(mottle("#5fa87c", "#4c8f67", { size: 0.07, seed: 22 }), "#2d6044");
  const MINT_SILK = cel("#bfe8d0", "#7fb598");

  // Cream & parchment inner tunic with gold trim
  const CREAM_SILK = cel(
    grain("#faf3e3", "#efe2c6", { size: 0.025, axis: "y", seed: 31 }),
    "#c7b292",
  );

  // Rich chestnut & dark bark leather
  const LEATHER_DARK = cel(
    mottle("#3d251b", "#2e1a12", { size: 0.06, seed: 41 }),
    "#1c0e0b",
  );
  const LEATHER_WARM = cel(
    mottle("#6e4029", "#59311e", { size: 0.06, seed: 42 }),
    "#381c11",
  );
  const LEATHER_CUFF = inkLines(LEATHER_WARM, {
    levels: [-0.45, 0.45],
    axis: [0, 1, 0],
    width: 0.07,
  });

  // Champagne & antique elven gold filigree
  const GOLD_HEX = "#f6cb5c";
  const GOLD_SHAD = "#b57c24";
  const GOLD = cel(GOLD_HEX, GOLD_SHAD, { threshold: 0.0 });
  const GOLD_BRIGHT = cel("#ffe48a", "#c98e2b", { threshold: -0.05 });
  const SILVER = cel("#e8f0f8", "#92a5bd", { threshold: 0.0 });

  // Heartwood & pale ash bow wood
  const BOW_WOOD = cel(
    grain("#7a462b", "#5c311b", { size: 0.02, axis: "y", seed: 51 }),
    "#33190d",
  );
  const ASH_WOOD = cel(
    grain("#e3cfa8", "#c9b086", { size: 0.015, axis: "y", seed: 52 }),
    "#8f7753",
  );

  // Custom patterned paints for cloak & tabard with gold leaf borders & ink lines
  const CLOAK_PAINT = cel(
    paint((p, n) => {
      const wave = 0.018 * zigzag(p.x / 0.045);
      const distBottom = p.y - (0.48 + wave);
      if (Math.abs(distBottom) < 0.005) return INK;
      if (distBottom < 0.032) return GOLD_HEX;
      if (Math.abs(distBottom - 0.032) < 0.004) return INK;
      if (distBottom < 0.058) return "#5fa87c";
      return EMERALD_BASE.at(p, n);
    }),
    "#0c2b21",
  );

  const TABARD_PAINT = cel(
    paint((p, n, s) => {
      const edgeX = Math.abs(s[0]);
      const y = s[1];
      // Gold border near bottom & side edges of extrude or slab
      const chevron = 0.022 * zigzag(p.x / 0.038);
      if (p.y < 0.48 + chevron) return GOLD_HEX;
      if (Math.abs(p.y - (0.48 + chevron)) < 0.005) return INK;
      if (Math.abs(p.x) > 0.075 && p.y < 0.92) return GOLD_HEX;
      if (Math.abs(p.x) < 0.012 && p.y > 0.54 && p.y < 0.88) {
        return Math.abs(Math.sin(p.y * 42)) > 0.55 ? GOLD_HEX : "#5fa87c";
      }
      if (edgeX > 0.09) return GOLD_HEX;
      if (y < -1) return GOLD_HEX;
      return "#faf3e3";
    }),
    "#bfa984",
  );

  const TUNIC_SKIRT_PAINT = cel(
    furEdge(EMERALD_BASE, GOLD_HEX, {
      by: "position",
      axis: [0, 1, 0],
      level: 0.67,
      teeth: 0.025,
      period: 0.042,
      along: [1, 0, 0],
      ink: INK,
      inkWidth: 0.005,
    }),
    "#0e3024",
  );

  const BOOT_PAINT = cel(
    paint((p, n) => {
      const cuffLine = 0.44 + 0.024 * Math.cos(p.z * 22);
      if (Math.abs(p.y - cuffLine) < 0.005) return INK;
      if (p.y > cuffLine - 0.028 && p.y < cuffLine) return GOLD_HEX;
      if (p.y < 0.042) return "#24130c";
      return LEATHER_DARK.at(p, n);
    }),
    "#1a0d09",
  );

  // Glowing magical accents (flat colors or textures required by glow())
  const SPIRIT_CYAN = "#52ffe8";
  const SPIRIT_TEAL = "#1ce0c8";
  const SPIRIT_GOLD = "#ffe97d";
  const LIPS_COLOR = cel("#e87a7a", "#b85258");

  // ============================================================================
  // SVG TEXTURES & CARDS
  // ============================================================================
  const EYE_TEX = animeEye({
    iris: "#18d49c",
    irisLight: "#8effdb",
    irisDark: "#0b5948",
    blush: "#ff94a8",
    brow: true,
    size: 512,
  });

  // Ornate Elven Sun-Leaf Emblem for tabard, pauldrons, quiver
  const CREST_TEX = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M64 8 C86 38 106 72 104 114 C102 150 82 174 64 186 C46 174 26 150 24 114 C22 72 42 38 64 8 Z"
            fill="#154c37" stroke="#22112f" stroke-width="5"/>
      <path d="M64 16 C82 42 96 72 95 112 C93 144 77 165 64 176 C51 165 35 144 33 112 C32 72 46 42 64 16 Z"
            fill="none" stroke="#f6cb5c" stroke-width="5"/>
      <path d="M64 24 L64 168 M64 56 C48 48 38 56 36 72 M64 56 C80 48 90 56 92 72
               M64 92 C44 82 36 92 38 110 M64 92 C84 82 92 92 90 110
               M64 128 C48 120 42 128 44 142 M64 128 C80 120 86 128 84 142"
            fill="none" stroke="#ffe48a" stroke-width="4.5" stroke-linecap="round"/>
      <polygon points="64,34 74,52 64,70 54,52" fill="#52ffe8" stroke="#22112f" stroke-width="3"/>
      <circle cx="64" cy="110" r="8" fill="#ffe48a" stroke="#22112f" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  // Leaf-feather card for fletching, cloak foliage trim, and hair plumes
  const FEATHER_CARD_TEX = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 6 C50 34 58 76 52 122 C48 142 39 152 32 156 C25 152 16 142 12 122 C6 76 14 34 32 6 Z"
            fill="#28805a" stroke="#22112f" stroke-width="4"/>
      <path d="M32 12 C46 36 52 72 47 114 C44 132 37 144 32 148 C27 144 20 132 17 114 C12 72 18 36 32 12 Z"
            fill="#56c492"/>
      <path d="M32 6 C45 28 50 56 46 82 C40 66 24 66 18 82 C14 56 19 28 32 6 Z"
            fill="#8effdb"/>
      <path d="M32 10 L32 152 M32 42 L48 28 M32 42 L16 28 M32 72 L50 56 M32 72 L14 56 M32 102 L47 88 M32 102 L17 88"
            stroke="#f6cb5c" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Golden filigree leaf card for crown/collar/skirt accents
  const GOLD_LEAF_TEX = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 6 C52 30 58 66 48 102 C43 114 36 121 32 124 C28 121 21 114 16 102 C6 66 12 30 32 6 Z"
            fill="#f6cb5c" stroke="#22112f" stroke-width="4"/>
      <path d="M32 14 C46 34 50 64 42 96 C38 106 34 112 32 115 C30 112 26 106 22 96 C14 64 18 34 32 14 Z"
            fill="#ffe896"/>
      <path d="M32 12 L32 118 M32 40 L45 28 M32 40 L19 28 M32 68 L46 54 M32 68 L18 54 M32 94 L42 82 M32 94 L22 82"
            stroke="#b57c24" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing spirit rune card for bow & quiver magic
  const RUNE_TEX = svg(
    `<svg viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="40" fill="none" stroke="#52ffe8" stroke-width="4" stroke-dasharray="10 6"/>
      <circle cx="48" cy="48" r="30" fill="none" stroke="#9effef" stroke-width="3"/>
      <polygon points="48,10 60,36 86,48 60,60 48,86 36,60 10,48 36,36" fill="none" stroke="#52ffe8" stroke-width="3.5"/>
      <polygon points="48,24 55,41 72,48 55,55 48,72 41,55 24,48 41,41" fill="#9effef"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // 1. SKELETON (Full Humanoid Rest Pose + Ears, Jaw, Hair, Cloak, Quiver, Bow)
  // ============================================================================
  // Standing height ~1.74m (crown of head ~1.67m, ear tips & tiara ~1.74m, feet at y = 0)
  const hips = b.joint("hips", { at: [0, 0.94, 0], dir: [0, 1, 0], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, 0.0],
      [0, 1.09, -0.008],
      [0, 1.24, 0.008],
      [0, 1.39, 0.0],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "collar"],
      role: "spine",
      group: "torso",
    },
  );
  const waist = spine.joints[0];
  const chest = spine.joints[1];
  const collar = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 1.39, 0.0],
      [0, 1.48, 0.008],
    ],
    {
      parent: collar,
      names: ["neck"],
      role: "neck",
      group: "head",
    },
  );
  const neckJoint = neck.joints[0];

  const head = b.joint("head", {
    parent: neckJoint,
    at: [0, 1.48, 0.008],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.495, 0.045],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  // Long high-fantasy elven ears (jointed for secondary motion)
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.072, 1.555, 0.002],
      dir: [s * 0.86, 0.34, -0.36],
      role: "hinge",
      group: "head",
    });
  }

  // Flowing rear hair braids / tails (jointed chains)
  const hairBackC = b.chain(
    "hairBackC",
    catmull([
      [0, 1.54, -0.065],
      [0, 1.38, -0.135],
      [0, 1.18, -0.165],
      [0, 0.96, -0.155],
    ]),
    {
      parent: head,
      names: ["hairBack1", "hairBack2", "hairBack3"],
      role: "tail",
      group: "hair",
    },
  );

  const hairBraidChains: Record<number, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    hairBraidChains[s] = b.chain(
      `hairBraid${side}`,
      catmull([
        [s * 0.068, 1.52, 0.032],
        [s * 0.095, 1.38, 0.068],
        [s * 0.102, 1.21, 0.078],
        [s * 0.092, 1.05, 0.062],
      ]),
      {
        parent: head,
        names: [`braid${side}1`, `braid${side}2`, `braid${side}3`],
        role: "tentacle",
        group: "hair",
      },
    );
  }

  // Legs (IK plant onto floor, foot contact y = 0)
  const legChains: Record<number, ReturnType<typeof b.chain>> = {};
  const toeJoints: Record<number, ReturnType<typeof b.joint>[]> = { 1: [], [-1]: [] };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.095, 0.92, 0.0];
    const anklePt: [number, number, number] = [s * 0.115, 0.075, -0.01];
    const legPts = limb(hipPt, anklePt, [0.435, 0.425], [0, 0, 1]);
    const footTipPt: [number, number, number] = [s * 0.12, 0.024, 0.135];
    const fullLegPts = [...legPts, footTipPt];

    const legChain = b.chain(`leg${side}`, fullLegPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.118, 0, 0.05],
      group: `leg${side}`,
    });
    legChains[s] = legChain;

    // 2 articulated toe digit groups per foot (inner/outer) for rig completeness
    const footBone = legChain.joints[2]; // ankle->foot span
    for (const [ti, tx] of [
      [1, -0.016],
      [2, 0.016],
    ] as const) {
      const tj = b.joint(`toe${side}${ti}`, {
        parent: footBone,
        at: [s * 0.12 + s * tx, 0.022, 0.125],
        dir: [0, -0.05, 1],
        role: "digit",
        group: `leg${side}`,
      });
      toeJoints[s].push(tj);
    }
  }

  // Arms & Hands (extended readable A/T rest pose, separated from body, fingers extended)
  const clavicleJoints: Record<number, ReturnType<typeof b.joint>> = {};
  const armChains: Record<number, ReturnType<typeof b.chain>> = {};
  const fingerChains: Record<number, ReturnType<typeof b.chain>[]> = { 1: [], [-1]: [] };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, {
      parent: collar,
      at: [s * 0.045, 1.375, 0.005],
      dir: [s * 0.98, 0.12, -0.04],
      role: "arm",
      group: `arm${side}`,
    });
    clavicleJoints[s] = clav;

    const shoulderPt: [number, number, number] = [s * 0.145, 1.375, 0.0];
    const wristPt: [number, number, number] = [s * 0.565, 1.155, 0.045];
    const armPts = limb(shoulderPt, wristPt, [0.245, 0.235], [0, -0.25, -1]);
    const handTipPt: [number, number, number] = [s * 0.635, 1.115, 0.068];

    const armChain = b.chain(`arm${side}`, [...armPts, handTipPt], {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    armChains[s] = armChain;

    const wristJoint = armChain.joints[2];
    // Thumb + 4 fingers, extended & separated
    const thumbChain = b.chain(
      `thumb${side}`,
      [
        [s * 0.588, 1.138, 0.068],
        [s * 0.612, 1.118, 0.098],
        [s * 0.628, 1.102, 0.118],
      ],
      {
        parent: wristJoint,
        names: [`thumb${side}1`, `thumb${side}2`],
        role: "digit",
        group: `hand${side}`,
      },
    );
    fingerChains[s].push(thumbChain);

    const fingerSpecs = [
      { name: "index", dz: 0.024, len: 0.066, dy: -0.032 },
      { name: "middle", dz: 0.008, len: 0.072, dy: -0.035 },
      { name: "ring", dz: -0.008, len: 0.067, dy: -0.033 },
      { name: "pinky", dz: -0.023, len: 0.056, dy: -0.028 },
    ];
    for (const f of fingerSpecs) {
      const rootF: [number, number, number] = [s * 0.625, 1.12, 0.062 + f.dz];
      const midF: [number, number, number] = [
        s * (0.625 + f.len * 0.52),
        1.12 + f.dy * 0.52,
        0.062 + f.dz * 1.12,
      ];
      const tipF: [number, number, number] = [
        s * (0.625 + f.len),
        1.12 + f.dy,
        0.062 + f.dz * 1.22,
      ];
      const fc = b.chain(`${f.name}${side}`, [rootF, midF, tipF], {
        parent: wristJoint,
        names: [`${f.name}${side}1`, `${f.name}${side}2`],
        role: "digit",
        group: `hand${side}`,
      });
      fingerChains[s].push(fc);
    }
  }

  // Flowing Cloak & Tabard Chains (for dynamic flex tests)
  const cloakC = b.chain(
    "cloakC",
    catmull([
      [0, 1.38, -0.075],
      [0, 1.12, -0.145],
      [0, 0.82, -0.185],
      [0, 0.48, -0.215],
    ]),
    {
      parent: collar,
      names: ["cloakC1", "cloakC2", "cloakC3"],
      role: "tail",
      group: "cloak",
    },
  );
  const cloakSideChains: Record<number, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    cloakSideChains[s] = b.chain(
      `cloak${side}`,
      catmull([
        [s * 0.13, 1.37, -0.055],
        [s * 0.19, 1.11, -0.125],
        [s * 0.23, 0.81, -0.165],
        [s * 0.26, 0.49, -0.185],
      ]),
      {
        parent: collar,
        names: [`cloak${side}1`, `cloak${side}2`, `cloak${side}3`],
        role: "tail",
        group: "cloak",
      },
    );
  }

  const tabardFront = b.chain(
    "tabardF",
    catmull([
      [0, 0.93, 0.092],
      [0, 0.72, 0.106],
      [0, 0.47, 0.112],
    ]),
    {
      parent: hips,
      names: ["tabardF1", "tabardF2"],
      role: "hinge",
      group: "torso",
    },
  );

  // Quiver on back (hinge joint on chest)
  const quiverJoint = b.joint("quiver", {
    parent: chest,
    at: [-0.075, 1.24, -0.115],
    dir: [-0.36, 0.88, -0.28],
    role: "hinge",
    group: "quiver",
  });

  // Longbow held in left hand (+X side, s = 1) with upper & lower limbs and bowstring joint
  const handL = armChains[1].joints[2]; // wristL -> handL span
  const bowGrip = b.joint("bowGrip", {
    parent: handL,
    at: [0.635, 1.11, 0.095],
    dir: [0.12, 0.22, 0.97],
    role: "hinge",
    group: "bow",
  });
  const bowUpper = b.chain(
    "bowLimbU",
    catmull([
      [0.635, 1.11, 0.095],
      [0.665, 1.38, 0.185],
      [0.645, 1.63, 0.135],
      [0.615, 1.72, 0.045],
    ]),
    {
      parent: bowGrip,
      names: ["bowLimbU1", "bowLimbU2", "bowLimbU3"],
      role: "hinge",
      group: "bow",
    },
  );
  const bowLower = b.chain(
    "bowLimbD",
    catmull([
      [0.635, 1.11, 0.095],
      [0.665, 0.84, 0.145],
      [0.645, 0.58, 0.065],
      [0.615, 0.46, -0.035],
    ]),
    {
      parent: bowGrip,
      names: ["bowLimbD1", "bowLimbD2", "bowLimbD3"],
      role: "hinge",
      group: "bow",
    },
  );

  // ============================================================================
  // 2. TORSO, NECK & LAYERED TUNIC / CORSET / FAULDS
  // ============================================================================
  // Inner torso loft (skin & cream silk undertunic)
  const torsoLoft = b.loft(
    [
      { at: [0, 0.89, -0.005], w: 0.23, h: 0.165 },
      { at: [0, 0.98, 0.0], w: 0.195, h: 0.145 },
      { at: [0, 1.09, -0.005], w: 0.175, h: 0.135 },
      { at: [0, 1.24, 0.012], w: 0.235, h: 0.175 },
      { at: [0, 1.37, 0.0], w: 0.25, h: 0.14 },
      { at: [0, 1.41, 0.0], w: 0.12, h: 0.105 },
    ],
    {
      bone: [hips, spine],
      bands: [
        [0.18, EMERALD],
        [0.52, LEATHER_DARK],
        [0.82, EMERALD],
        [1.0, CREAM_SILK],
      ],
      sectors: [
        [-42, 42, CREAM_SILK, 0.5, 0.95],
        [145, 215, GOLD, 0.18, 0.55],
      ],
      group: "torso",
      name: "torsoBody",
    },
  );

  // Graceful neck & upper collarbone
  b.sweep(
    catmull([
      [0, 1.38, 0.0],
      [0, 1.45, 0.005],
      [0, 1.52, 0.01],
    ]),
    [0.048, 0.041, 0.044],
    {
      bone: [collar, neck],
      color: SKIN,
      group: "head",
      name: "neckColumn",
    },
  );

  // Sculpted anime bust cups & gold-trimmed emerald bodice
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.068, 12, 10), EMERALD, {
      bone: chest,
      at: [s * 0.052, 1.235, 0.062],
      scale: [0.95, 1.02, 0.88],
      group: "torso",
      name: `bodiceCup${side}`,
    });
    // Golden filigree under-bust & neckline trim arcs
    b.sweep(
      catmull([
        [0, 1.225, 0.108],
        [s * 0.055, 1.195, 0.105],
        [s * 0.102, 1.24, 0.065],
      ]),
      0.0075,
      {
        bone: chest,
        color: GOLD_BRIGHT,
        group: "torso",
        name: `bodiceTrim${side}`,
      },
    );
    b.sweep(
      catmull([
        [0, 1.255, 0.105],
        [s * 0.048, 1.292, 0.095],
        [s * 0.092, 1.345, 0.055],
      ]),
      0.007,
      {
        bone: chest,
        color: GOLD,
        group: "torso",
        name: `necklineTrim${side}`,
      },
    );
  }

  // Leather ranger corset ribs & golden chest clasp
  const torsoSurf = b.surface(torsoLoft);
  const waistLoop = torsoSurf.loop([0, 1.05, 0], { dir: [0, 1, 0], lift: 0.006 });
  b.sweep(waistLoop, [0.011, 0.008], { bone: waist, color: GOLD, group: "torso", name: "corsetTopRim" });

  const hipBeltLoop = torsoSurf.loop([0, 0.94, 0], { dir: [0, 1, 0], lift: 0.01 });
  b.sweep(hipBeltLoop, (t) => [0.016 + 0.004 * Math.cos(t * Math.PI * 2), 0.022], {
    bone: hips,
    color: LEATHER_WARM,
    group: "torso",
    name: "rangerBelt",
  });

  // Diagonal ranger chest baldric strap (for quiver)
  const baldricLoop = catmull(
    [
      [-0.125, 1.385, 0.02],
      [0.0, 1.23, 0.115],
      [0.115, 1.04, 0.03],
      [0.01, 1.16, -0.105],
      [-0.105, 1.34, -0.075],
    ],
    { closed: true },
  );
  b.sweep(torsoSurf.drape(baldricLoop, { lift: 0.012 }), [0.018, 0.007], {
    bone: chest,
    color: LEATHER_WARM,
    group: "torso",
    name: "chestBaldric",
  });
  // Gold studs along the chest baldric
  b.along(torsoSurf.drape(baldricLoop, { lift: 0.017 }), 12, (pt) => {
    b.part(new THREE.SphereGeometry(0.007, 6, 4), GOLD_BRIGHT, {
      at: pt,
      bone: chest,
      group: "torso",
    });
  });

  // Heart-leaf brooch with glowing spirit emerald on chest
  const broochOutline: OutlinePoint[] = [
    [0, -0.038, "sharp"],
    [0.028, -0.01],
    [0.034, 0.022],
    [0, 0.042, "sharp"],
    [-0.034, 0.022],
    [-0.028, -0.01],
  ];
  b.extrude(broochOutline, {
    at: [0, 1.325, 0.088],
    x: [1, 0, 0],
    y: [0, 0.96, -0.28],
    thickness: 0.012,
    bevel: 0.004,
    smoothing: 1,
    bone: collar,
    color: GOLD_BRIGHT,
    group: "torso",
    name: "collarBrooch",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.016, 1), SPIRIT_CYAN, {
      bone: collar,
      at: [0, 1.325, 0.096],
      scale: [0.85, 1.3, 0.55],
      group: "torso",
      name: "collarGem",
    }),
    1.6,
  );

  // Ornate belt buckle + side hip tassets (leaf-shaped split skirt plates)
  b.extrude(broochOutline, {
    at: [0, 0.94, 0.102],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 1,
    bone: hips,
    color: GOLD_BRIGHT,
    group: "torso",
    name: "beltBuckle",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.014, 1), SPIRIT_CYAN, {
      bone: hips,
      at: [0, 0.94, 0.111],
      scale: [0.9, 1.25, 0.55],
      group: "torso",
      name: "beltGem",
    }),
    1.4,
  );

  // Flared petal-cut ranger skirt / peplum over hips
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Outer green & gold leaf-shaped hip skirt panels
    for (const [idx, ang, drop, flare] of [
      [1, 35, 0.28, 0.055],
      [2, 82, 0.32, 0.068],
      [3, 132, 0.3, 0.058],
    ] as const) {
      const rad = (ang * Math.PI) / 180;
      const sx = s * Math.sin(rad) * 0.105;
      const sz = Math.cos(rad) * 0.088;
      const nx = s * Math.sin(rad);
      const nz = Math.cos(rad);
      const panelPath = bezier(
        [sx, 0.95, sz],
        [sx + nx * 0.032, 0.84, sz + nz * 0.028],
        [sx + nx * flare, 0.95 - drop * 0.7, sz + nz * flare],
        [sx + nx * (flare + 0.015), 0.95 - drop, sz + nz * (flare + 0.012)],
      );
      b.sweep(
        panelPath,
        (t) => [0.052 * (1 - 0.55 * t * t) + 0.008, 0.008 * (1 - 0.4 * t)],
        {
          bone: [hips, legChains[s].joints[0]],
          color: TUNIC_SKIRT_PAINT,
          caps: { start: "round", end: "point" },
          up: [nx, 0.15, nz],
          group: "torso",
          name: `hipPeplum${side}${idx}`,
        },
      );
    }

    // Layered champagne-gold leaf fauld armor plates on upper hips
    const fauldOutline: OutlinePoint[] = [
      [0, 0.04, "sharp"],
      [0.052, 0.01],
      [0.062, -0.075],
      [0.032, -0.145],
      [0, -0.185, "sharp"],
      [-0.032, -0.145],
      [-0.062, -0.075],
      [-0.052, 0.01],
    ];
    b.extrude(fauldOutline, {
      at: [s * 0.118, 0.92, 0.025],
      x: [0.25, 0, s * -0.96],
      y: [s * 0.22, 0.97, 0.04],
      thickness: [0.005, 0.012],
      bevel: 0.004,
      smoothing: 2,
      bone: hips,
      color: GOLD,
      group: "torso",
      name: `hipFauld${side}`,
    });
  }

  // Front embroidered Elven tabard hanging down between legs (skinned to tabardFront chain)
  const tabardEdgeL = catmull([
    [0.042, 0.93, 0.095],
    [0.058, 0.72, 0.11],
    [0.046, 0.53, 0.115],
    [0.0, 0.44, 0.118],
  ]);
  const tabardEdgeR = catmull([
    [-0.042, 0.93, 0.095],
    [-0.058, 0.72, 0.11],
    [-0.046, 0.53, 0.115],
    [0.0, 0.44, 0.118],
  ]);
  const tabardMesh = b.membrane(tabardEdgeL, tabardEdgeR, {
    bone: tabardFront,
    thickness: 0.007,
    rows: 8,
    cols: 4,
    color: TABARD_PAINT,
    group: "torso",
    name: "frontTabard",
  });
  b.decal(tabardMesh, CREST_TEX, {
    at: [0, 0.68, 0.114],
    dir: [0, 0, 1],
    size: [0.085, 0.135],
    bone: tabardFront.joints[0],
    group: "torso",
    name: "tabardCrestDecal",
  });

  // Back sash tails hanging from waist
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.045, 0.93, -0.088],
        [s * 0.068, 0.74, -0.115],
        [s * 0.082, 0.54, -0.132],
      ]),
      (t) => [0.032 * (1 - 0.5 * t), 0.005],
      {
        bone: [hips, cloakC],
        color: GOLD,
        caps: { start: "flat", end: "point" },
        up: [0, 0, -1],
        group: "torso",
        name: `backSash${side}`,
      },
    );
  }

  // Hanging belt accessories: Elven leaf pouch (right hip) & curved hunting dagger in scabbard (left hip)
  // Right hip pouch (s = -1)
  b.lathe(
    [
      [0, 0],
      [0.032, 0.006],
      [0.042, 0.038],
      [0.034, 0.072],
      [0.018, 0.086],
      [0.026, 0.098],
      [0, 0.1],
    ],
    {
      at: [-0.135, 0.81, 0.035],
      axis: [-0.22, 0.97, 0.08],
      segments: 10,
      smoothing: 1,
      bone: hips,
      color: LEATHER_WARM,
      group: "torso",
      name: "beltPouch",
    },
  );
  b.part(new THREE.SphereGeometry(0.011, 6, 6), GOLD_BRIGHT, {
    bone: hips,
    at: [-0.152, 0.855, 0.058],
    group: "torso",
    name: "pouchClasp",
  });
  // Glowing mana potion vial next to pouch
  b.lathe(
    [
      [0, 0],
      [0.016, 0.005],
      [0.022, 0.028],
      [0.01, 0.052],
      [0.013, 0.065],
      [0, 0.068],
    ],
    {
      at: [-0.132, 0.835, -0.035],
      axis: [-0.25, 0.95, -0.12],
      segments: 8,
      bone: hips,
      color: GOLD,
      group: "torso",
      name: "potionCage",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.017, 8, 6), SPIRIT_CYAN, {
      bone: hips,
      at: [-0.138, 0.858, -0.038],
      scale: [1, 1.25, 1],
      group: "torso",
      name: "manaPotionGlow",
    }),
    1.5,
  );

  // Left hip curved Elven hunting knife in scabbard (s = 1)
  const scabbardPath = bezier(
    [0.135, 0.91, -0.015],
    [0.158, 0.82, -0.065],
    [0.168, 0.72, -0.125],
    [0.155, 0.65, -0.175],
  );
  b.sweep(scabbardPath, (t) => [0.022 * (1 - 0.65 * t), 0.009 * (1 - 0.5 * t)], {
    bone: hips,
    bands: [
      [0.18, GOLD],
      [0.72, EMERALD],
      [1.0, GOLD],
    ],
    caps: { start: "flat", end: "point" },
    up: [1, 0, 0],
    group: "torso",
    name: "daggerScabbard",
  });
  const hiltPath = bezier([0.135, 0.91, -0.015], [0.128, 0.96, 0.018], [0.138, 1.005, 0.048]);
  b.sweep(hiltPath, [0.012, 0.009, 0.015], {
    bone: hips,
    color: GOLD_BRIGHT,
    group: "torso",
    name: "daggerHilt",
  });
  b.sweep(
    catmull([
      [0.135, 0.885, 0.018],
      [0.135, 0.91, -0.015],
      [0.135, 0.935, -0.048],
    ]),
    [0.006, 0.012, 0.006],
    {
      bone: hips,
      color: GOLD_BRIGHT,
      caps: "point",
      group: "torso",
      name: "daggerGuard",
    },
  );

  // ============================================================================
  // 3. FLOWING LAYERED CAPE, SHOULDER MANTLE & PAULDRONS
  // ============================================================================
  // High Elven Winged Collar & Shoulder Mantle
  const mantleEdgeTop = catmull([
    [0.175, 1.385, 0.035],
    [0.135, 1.445, -0.035],
    [0.0, 1.475, -0.075],
    [-0.135, 1.445, -0.035],
    [-0.175, 1.385, 0.035],
  ]);
  const mantleEdgeBot = catmull([
    [0.215, 1.315, 0.055],
    [0.175, 1.285, -0.085],
    [0.0, 1.265, -0.125],
    [-0.175, 1.285, -0.085],
    [-0.215, 1.315, 0.055],
  ]);
  b.membrane(mantleEdgeTop, mantleEdgeBot, {
    bone: collar,
    thickness: 0.009,
    rows: 8,
    cols: 6,
    color: SAGE,
    group: "cloak",
    name: "shoulderMantle",
  });
  b.sweep(mantleEdgeTop, 0.0085, {
    bone: collar,
    color: GOLD_BRIGHT,
    group: "cloak",
    name: "mantleTopGoldRim",
  });
  b.sweep(mantleEdgeBot, 0.0075, {
    bone: collar,
    color: GOLD,
    group: "cloak",
    name: "mantleBotGoldRim",
  });

  // Main flowing two-panel split ranger cape (skinned across cloakL, cloakC, cloakR)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const innerEdge = catmull([
      [s * 0.012, 1.37, -0.078],
      [s * 0.022, 1.12, -0.148],
      [s * 0.038, 0.82, -0.188],
      [s * 0.055, 0.47, -0.218],
    ]);
    const outerEdge = catmull([
      [s * 0.155, 1.365, -0.048],
      [s * 0.225, 1.11, -0.118],
      [s * 0.275, 0.81, -0.158],
      [s * 0.305, 0.49, -0.178],
    ]);
    b.membrane(innerEdge, outerEdge, {
      bone: cloakSideChains[s],
      thickness: 0.009,
      rows: 10,
      cols: 5,
      scallop: 0.08,
      color: CLOAK_PAINT,
      group: "cloak",
      name: `cloakWing${side}`,
    });

    // Gold trim border sweeps down the cloak edges
    b.sweep(outerEdge, [0.008, 0.005], {
      bone: cloakSideChains[s],
      color: GOLD,
      group: "cloak",
      name: `cloakOuterGold${side}`,
    });
    b.sweep(innerEdge, [0.007, 0.004], {
      bone: cloakC,
      color: GOLD,
      group: "cloak",
      name: `cloakInnerGold${side}`,
    });

    // Ornate layered Elven leaf pauldrons on shoulders
    const pauldronOutline: OutlinePoint[] = [
      [-0.055, 0.015],
      [0.0, 0.042, "sharp"],
      [0.068, 0.022],
      [0.115, -0.015],
      [0.138, -0.058, "sharp"],
      [0.088, -0.068],
      [0.018, -0.052],
      [-0.042, -0.025],
    ];
    for (const [layerIdx, liftY, rotZ, col] of [
      [1, 0.022, 12, GOLD_BRIGHT],
      [2, 0.0, 2, EMERALD],
      [3, -0.018, -8, GOLD],
    ] as const) {
      b.extrude(pauldronOutline, {
        at: [s * 0.135, 1.395 + liftY, 0.005],
        x: [s * 0.92, -0.22 - rotZ * 0.01, 0.15],
        y: [0.1, 0.88, 0.45],
        thickness: [0.006, 0.012],
        bevel: 0.004,
        smoothing: 2,
        bone: clavicleJoints[s],
        color: col,
        group: `arm${side}`,
        name: `pauldron${side}${layerIdx}`,
      });
    }

    // Shoulder brooch gem & hanging golden leaf tassel
    b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.012, 10), GOLD_BRIGHT, {
      bone: clavicleJoints[s],
      at: [s * 0.142, 1.395, 0.048],
      dir: [s * 0.35, 0.3, 0.88],
      group: `arm${side}`,
      name: `shoulderMedallion${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.012, 8, 6), SPIRIT_CYAN, {
        bone: clavicleJoints[s],
        at: [s * 0.145, 1.398, 0.055],
        group: `arm${side}`,
        name: `shoulderGem${side}`,
      }),
      1.4,
    );

    // Decorative feather/leaf cards fanning behind each shoulder
    const shoulderLeafFrames = [
      frame([s * 0.165, 1.405, -0.035], [s * 0.55, 0.55, -0.62]),
      frame([s * 0.195, 1.385, -0.042], [s * 0.72, 0.32, -0.61]),
      frame([s * 0.145, 1.355, -0.075], [s * 0.35, -0.25, -0.9]),
    ];
    b.cards(shoulderLeafFrames, [FEATHER_CARD_TEX, GOLD_LEAF_TEX], {
      size: [0.055, 0.13],
      lean: 28,
      bend: 20,
      flow: [s * 0.4, -0.4, -0.85],
      bone: clavicleJoints[s],
      rng: rng(100 + s * 10),
      group: `arm${side}`,
      name: `shoulderPlumes${side}`,
    });
  }

  // Leaf-feather trim cards along the bottom edge of the cloak
  const cloakBottomFrames = [];
  for (let i = 0; i < 9; i++) {
    const u = (i / 8) * 2 - 1; // -1..1
    cloakBottomFrames.push(
      frame([u * 0.27, 0.51 + Math.abs(u) * 0.02, -0.205 + Math.abs(u) * 0.025], [0, 1, 0]),
    );
  }
  b.cards(cloakBottomFrames, [FEATHER_CARD_TEX, GOLD_LEAF_TEX, FEATHER_CARD_TEX], {
    size: [0.052, 0.125],
    lean: 168,
    bend: 18,
    flow: [0, -0.2, -1],
    bone: cloakC.joints[2],
    rng: rng(77),
    group: "cloak",
    name: "cloakHemPlumes",
  });

  // ============================================================================
  // 4. LEGS, THIGH-HIGH RANGER BOOTS, KNEE GUARDS & SOLES
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[s];
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];

    // Sculpted thigh -> calf -> ankle sweep with thigh-high boots & stocking zettai-ryouiki band
    const legTube = b.sweep(
      leg,
      (t) => {
        if (t < 0.12) return [0.078, 0.082];
        if (t < 0.36) return [0.068 - (t - 0.12) * 0.06, 0.072 - (t - 0.12) * 0.06];
        if (t < 0.48) return [0.052, 0.055]; // knee
        if (t < 0.65) return [0.058, 0.062]; // calf muscle flare
        if (t < 0.85) return [0.041, 0.044]; // ankle
        return [0.043, 0.028]; // foot bridge
      },
      {
        from: 0,
        to: 0.88,
        bands: [
          [0.24, MINT_SILK],
          [0.33, SKIN],
          [0.36, GOLD_BRIGHT],
          [1.0, BOOT_PAINT],
        ],
        group: `leg${side}`,
        name: `legSweep${side}`,
      },
    );

    // Flared leaf-cuff collar at top of thigh-high boot
    const cuffPt = leg.at(0.37);
    const cuffRing = b.ring(cuffPt, { count: 8, radius: 0.058 });
    b.sweep(catmull(cuffRing.items, { closed: true }), [0.011, 0.018], {
      bone: hipJ,
      color: GOLD_BRIGHT,
      group: `leg${side}`,
      name: `bootThighCuff${side}`,
    });

    // Ornate winged golden knee guard (poleyn)
    const kneeOutline: OutlinePoint[] = [
      [0, 0.058, "sharp"],
      [0.036, 0.024],
      [0.042, -0.018],
      [0.024, -0.046],
      [0, -0.065, "sharp"],
      [-0.024, -0.046],
      [-0.042, -0.018],
      [-0.036, 0.024],
    ];
    b.extrude(kneeOutline, {
      at: legTube.at(0.45, 0, 0.008),
      x: [1, 0, 0],
      y: [0, 0.98, 0.18],
      thickness: [0.008, 0.016],
      bevel: 0.005,
      smoothing: 1,
      bone: kneeJ,
      color: GOLD_BRIGHT,
      group: `leg${side}`,
      name: `kneeGuard${side}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.01, 0), SPIRIT_CYAN, {
        bone: kneeJ,
        at: legTube.at(0.45, 0, 0.018),
        scale: [0.8, 1.4, 0.6],
        group: `leg${side}`,
        name: `kneeGem${side}`,
      }),
      1.3,
    );

    // Criss-cross golden boot lacing straps on shin
    for (let k = 0; k < 4; k++) {
      const tk = 0.54 + k * 0.072;
      const ringPts = b.ring(leg.at(tk), { count: 8, radius: 0.054 - k * 0.003 }).items;
      b.sweep(catmull(ringPts, { closed: true }), 0.0055, {
        bone: kneeJ,
        color: GOLD,
        group: `leg${side}`,
        name: `bootStrap${side}${k}`,
      });
    }

    // Boot foot & heel resting flat on y = 0
    const heelPos: [number, number, number] = [s * 0.115, 0.024, -0.022];
    const archPos: [number, number, number] = [s * 0.117, 0.026, 0.045];
    const ballPos: [number, number, number] = [s * 0.119, 0.022, 0.105];
    const toeTipPos: [number, number, number] = [s * 0.12, 0.024, 0.162];

    b.loft(
      [
        { at: heelPos, w: 0.068, h: 0.048 },
        { at: archPos, w: 0.066, h: 0.052 },
        { at: ballPos, w: 0.074, h: 0.044 },
        { at: toeTipPos, w: 0.026, h: 0.024 },
      ],
      {
        bone: ankleJ,
        bands: [
          [0.72, BOOT_PAINT],
          [0.82, GOLD_BRIGHT],
          [1.0, EMERALD],
        ],
        caps: { start: "round", end: "point" },
        group: `leg${side}`,
        name: `bootFoot${side}`,
      },
    );

    // Boot heel block & sole touching y = 0 exactly
    b.frustumBox(
      [s * 0.115, 0.0, -0.042],
      [s * 0.115, 0.0, 0.008],
      [0.058, 0.036],
      [0.054, 0.032],
      {
        bone: ankleJ,
        color: LEATHER_DARK,
        shift: [0, 0.018],
        group: `leg${side}`,
        name: `bootHeel${side}`,
      },
    );
    b.frustumBox(
      [s * 0.119, 0.0, 0.045],
      [s * 0.12, 0.0, 0.145],
      [0.068, 0.018],
      [0.038, 0.014],
      {
        bone: ankleJ,
        color: LEATHER_DARK,
        shift: [0, 0.009],
        group: `leg${side}`,
        name: `bootSole${side}`,
      },
    );

    // Subtle articulated toe cap ridges on toe joints
    for (const [ti, tj] of toeJoints[s].entries()) {
      b.capsule(
        tj.at,
        offset(tj.at, [0, -0.05, 1], 0.028),
        [0.014, 0.009],
        {
          bone: tj,
          color: GOLD,
          group: `leg${side}`,
          name: `bootToeCap${side}${ti + 1}`,
        },
      );
    }

    // Small golden winglet on outer ankle
    const wingletOutline: OutlinePoint[] = [
      [0, 0],
      [0.048, 0.028],
      [0.075, 0.055, "sharp"],
      [0.038, 0.045],
      [0, 0.025],
    ];
    b.extrude(wingletOutline, {
      at: [s * 0.145, 0.105, -0.01],
      x: [0, 0.35, -0.94],
      y: [s * 0.25, 0.94, 0.2],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      bone: ankleJ,
      color: GOLD_BRIGHT,
      group: `leg${side}`,
      name: `ankleWing${side}`,
    });
  }

  // ============================================================================
  // 5. ARMS, ARCHER BRACERS, HANDS & EXTENDED FINGERS
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[s];
    const shoulderJ = arm.joints[0];
    const elbowJ = arm.joints[1];
    const wristJ = arm.joints[2];

    // Arm sweep: puffed silk upper sleeve -> bare upper forearm -> ornate leather & gold archer bracer
    const armTube = b.sweep(
      arm,
      (t) => {
        if (t < 0.28) return 0.046 - t * 0.025; // upper arm puff
        if (t < 0.48) return 0.036; // elbow
        if (t < 0.82) return 0.039 - (t - 0.48) * 0.028; // forearm bracer
        return 0.026; // wrist
      },
      {
        from: 0,
        to: 0.86,
        bands: [
          [0.32, CREAM_SILK],
          [0.36, GOLD_BRIGHT],
          [0.52, SKIN],
          [0.56, GOLD],
          [0.84, LEATHER_CUFF],
          [1.0, GOLD_BRIGHT],
        ],
        group: `arm${side}`,
        name: `armSweep${side}`,
      },
    );

    // Ornate Elven leaf-plate archer bracer on outer forearm
    const bracerPlateOutline: OutlinePoint[] = [
      [-0.065, 0],
      [-0.045, 0.026],
      [0.035, 0.028],
      [0.078, 0, "sharp"],
      [0.035, -0.028],
      [-0.045, -0.026],
    ];
    const forearmSurf = armTube.at(0.68, 0, 0.005);
    b.extrude(bracerPlateOutline, {
      at: forearmSurf,
      x: forearmSurf.tangent,
      y: [0, 0, 1],
      thickness: 0.008,
      bevel: 0.003,
      smoothing: 1,
      bone: elbowJ,
      color: s > 0 ? GOLD_BRIGHT : EMERALD, // Left bow-arm gets full golden guard plate
      group: `arm${side}`,
      name: `bracerGuard${side}`,
    });

    // Gold cuff rings at upper arm & wrist
    for (const [tag, tPos, jBone, rRing] of [
      ["upperArmRing", 0.34, shoulderJ, 0.039],
      ["bracerTopRing", 0.55, elbowJ, 0.041],
      ["wristCuffRing", 0.84, wristJ, 0.031],
    ] as const) {
      const ringItems = b.ring(arm.at(tPos), { count: 8, radius: rRing }).items;
      b.sweep(catmull(ringItems, { closed: true }), 0.006, {
        bone: jBone,
        color: GOLD_BRIGHT,
        group: `arm${side}`,
        name: `${tag}${side}`,
      });
    }

    // Sculpted palm (half-gloved ranger archer hand)
    b.frustumBox(
      [s * 0.565, 1.155, 0.045],
      [s * 0.625, 1.12, 0.062],
      [0.056, 0.024],
      [0.064, 0.022],
      {
        bone: wristJ,
        bands: [
          [0.65, LEATHER_DARK],
          [0.78, GOLD],
          [1.0, SKIN],
        ],
        up: [0, 1, 0],
        group: `hand${side}`,
        name: `palm${side}`,
      },
    );

    // Articulated fingers (thumb + 4 fingers)
    for (const [fi, fc] of fingerChains[s].entries()) {
      const r0 = fi === 0 ? 0.0085 : 0.0072;
      const r1 = fi === 0 ? 0.006 : 0.0048;
      // Right hand (drawing hand, s = -1) has leather archer shooting-glove tips on index/middle/ring
      const isArcherGloveFinger = s < 0 && fi >= 1 && fi <= 3;
      b.sweep(fc, [r0, (r0 + r1) * 0.52, r1], {
        bands: isArcherGloveFinger
          ? [
              [0.45, SKIN],
              [1.0, LEATHER_WARM],
            ]
          : undefined,
        color: SKIN,
        caps: "round",
        group: `hand${side}`,
        name: `finger${side}${fi}`,
      });
    }
  }

  // ============================================================================
  // 6. HEAD, ANIME FACE, EARS, TIARA CROWN & LAYERED SILVER-BLONDE HAIR
  // ============================================================================
  const HEAD_C: [number, number, number] = [0, 1.568, 0.015];

  // Anime head cranium + sculpted cheek/chin contour
  const cranium = b.part(new THREE.SphereGeometry(1, 20, 16), SKIN_BLUSH, {
    bone: head,
    at: HEAD_C,
    scale: [0.078, 0.088, 0.082],
    group: "head",
    name: "cranium",
  });

  // Tapered anime chin & lower face on jaw bone
  const chin = b.loft(
    [
      { at: [0, 1.548, 0.032], w: 0.132, h: 0.088 },
      { at: [0, 1.508, 0.048], w: 0.096, h: 0.072 },
      { at: [0, 1.478, 0.068], w: 0.036, h: 0.032 },
    ],
    {
      bone: [head, jaw],
      color: SKIN_BLUSH,
      caps: "round",
      group: "head",
      name: "faceChin",
    },
  );

  // Delicate anime nose bridge & tip
  b.spike([0, 1.545, 0.086], [0, 1.535, 0.106], null, 0.011, {
    bone: head,
    color: SKIN,
    group: "head",
    name: "nose",
  });

  // Soft anime lips & upper lip line on jaw/head
  b.capsule([-0.013, 1.506, 0.084], [0.013, 1.506, 0.084], 0.0042, {
    bone: head,
    color: LIPS_COLOR,
    group: "head",
    name: "upperLip",
  });
  b.capsule([-0.011, 1.499, 0.082], [0.011, 1.499, 0.082], 0.0045, {
    bone: jaw,
    color: LIPS_COLOR,
    group: "head",
    name: "lowerLip",
  });

  // Big expressive emerald-green anime eyes conformed onto face via decal
  const faceSurf = b.surface([cranium, chin]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = faceSurf.around(HEAD_C).at(s * 27, -6);
    if (eyeHit) {
      b.decal(faceSurf, EYE_TEX, {
        at: eyeHit,
        dir: [s * 0.18, -0.04, 0.98],
        size: [0.044, 0.058],
        mirror: s > 0,
        bone: head,
        group: "head",
        name: `animeEye${side}`,
      });
    }
  }

  // Long, aristocratic high-fantasy Elven ears with gold ear-cuffs & dangling emerald drops
  const earOutline: OutlinePoint[] = [
    [0, -0.016],
    [0.055, -0.022],
    [0.135, -0.004],
    [0.205, 0.032, "sharp"],
    [0.125, 0.038],
    [0.048, 0.024],
    [0, 0.014],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[s];
    b.extrude(earOutline, {
      at: earJ.at,
      x: [s * 0.85, 0.34, -0.4],
      y: [-s * 0.25, 0.92, 0.28],
      thickness: [0.014, 0.004],
      bevel: 0.004,
      smoothing: 2,
      bone: earJ,
      color: SKIN_BLUSH,
      group: "head",
      name: `elfEar${side}`,
    });

    // Golden elven ear cuff mid-ear
    const cuffCenter = offset(earJ.at, [s * 0.85, 0.34, -0.4], 0.095);
    const earCuffPts = b.ring(
      frame(cuffCenter, [s * 0.85, 0.34, -0.4]),
      { count: 8, radius: 0.016 },
    ).items;
    b.sweep(catmull(earCuffPts, { closed: true }), 0.0045, {
      bone: earJ,
      color: GOLD_BRIGHT,
      group: "head",
      name: `earCuff${side}`,
    });

    // Dangling glowing emerald earring at earlobe
    const lobePt: [number, number, number] = [s * 0.088, 1.532, 0.005];
    b.part(new THREE.SphereGeometry(0.006, 6, 4), GOLD_BRIGHT, {
      bone: earJ,
      at: lobePt,
      group: "head",
      name: `earringStud${side}`,
    });
    glow(
      b.spike([s * 0.09, 1.524, 0.005], [s * 0.092, 1.496, 0.005], null, 0.0075, {
        bone: earJ,
        color: SPIRIT_CYAN,
        group: "head",
        name: `earringGem${side}`,
      }),
      1.5,
    );
  }

  // Sculpted Volume Hair Cap + Flowing Anime Bangs, Side-Locks, Braids & Ponytail
  b.part(new THREE.SphereGeometry(1, 16, 14), HAIR_PAINT, {
    bone: head,
    at: [0, 1.582, -0.002],
    scale: [0.086, 0.092, 0.09],
    group: "hair",
    name: "hairCap",
  });

  // Sweeping front anime bangs framing the eyes without hiding them
  const bangSpecs: Array<{ pts: [number, number, number][]; r: number[] }> = [
    // Center parted thin locks
    {
      pts: [
        [0.0, 1.655, 0.048],
        [0.012, 1.622, 0.096],
        [0.006, 1.568, 0.105],
      ],
      r: [0.016, 0.014, 0.002],
    },
    {
      pts: [
        [-0.005, 1.655, 0.048],
        [-0.018, 1.62, 0.094],
        [-0.012, 1.575, 0.102],
      ],
      r: [0.014, 0.012, 0.002],
    },
  ];
  for (const s of [1, -1]) {
    // Inner brow-framing lock
    bangSpecs.push({
      pts: [
        [s * 0.015, 1.655, 0.045],
        [s * 0.045, 1.625, 0.088],
        [s * 0.066, 1.575, 0.082],
        [s * 0.072, 1.535, 0.062],
      ],
      r: [0.022, 0.02, 0.013, 0.002],
    });
    // Outer temple lock sweeping over ear base
    bangSpecs.push({
      pts: [
        [s * 0.038, 1.648, 0.025],
        [s * 0.078, 1.608, 0.055],
        [s * 0.092, 1.545, 0.035],
        [s * 0.088, 1.485, 0.022],
      ],
      r: [0.026, 0.022, 0.015, 0.003],
    });
  }
  bangSpecs.forEach((spec, idx) => {
    b.sweep(catmull(spec.pts), spec.r, {
      bone: head,
      color: HAIR_PAINT,
      caps: { start: "round", end: "point" },
      group: "hair",
      name: `hairBang${idx}`,
    });
  });

  // Expressive anime ahoge (top hair crest)
  b.sweep(
    bezier([0, 1.662, 0.02], [0.025, 1.725, 0.045], [-0.018, 1.748, 0.01], [-0.035, 1.725, -0.02]),
    [0.012, 0.01, 0.002],
    {
      bone: head,
      color: HAIR_PAINT,
      caps: { start: "round", end: "point" },
      group: "hair",
      name: "hairAhoge",
    },
  );

  // Long front-draped Elven side braids (skinned to hairBraidChains) with gold hair rings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const braidChain = hairBraidChains[s];
    b.sweep(braidChain, [0.024, 0.022, 0.018, 0.005], {
      color: HAIR_TIP_PAINT,
      caps: { start: "round", end: "point" },
      group: "hair",
      name: `sideBraid${side}`,
    });
    for (const tRing of [0.32, 0.64, 0.84]) {
      const rPts = b.ring(braidChain.at(tRing), { count: 8, radius: 0.02 * (1 - tRing * 0.35) }).items;
      b.sweep(catmull(rPts, { closed: true }), 0.0045, {
        bone: braidChain.jointAt(tRing),
        color: GOLD_BRIGHT,
        group: "hair",
        name: `braidRing${side}_${Math.round(tRing * 100)}`,
      });
    }
  }

  // Voluminous cascading rear hair ponytail & side locks (skinned to hairBackC)
  b.sweep(hairBackC, (t) => [0.068 * (1 - 0.65 * t) + 0.008, 0.042 * (1 - 0.55 * t) + 0.006], {
    color: HAIR_TIP_PAINT,
    caps: { start: "round", end: "point" },
    group: "hair",
    name: "hairMainTail",
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const subTailPath = catmull([
      [s * 0.048, 1.545, -0.058],
      [s * 0.082, 1.38, -0.125],
      [s * 0.105, 1.18, -0.155],
      [s * 0.085, 0.99, -0.145],
    ]);
    b.sweep(subTailPath, [0.038, 0.032, 0.022, 0.004], {
      bone: hairBackC,
      color: HAIR_TIP_PAINT,
      caps: { start: "round", end: "point" },
      group: "hair",
      name: `hairSubTail${side}`,
    });
  }

  // Ornate Golden Elven Circlet / Tiara with Winged Leaf Crest & Glowing Star-Emerald
  const circletPath = catmull([
    [0.082, 1.595, -0.015],
    [0.068, 1.622, 0.055],
    [0.0, 1.635, 0.088],
    [-0.068, 1.622, 0.055],
    [-0.082, 1.595, -0.015],
  ]);
  b.sweep(circletPath, [0.005, 0.008, 0.005], {
    bone: head,
    color: GOLD_BRIGHT,
    group: "head",
    name: "tiaraBand",
  });

  const tiaraWingOutline: OutlinePoint[] = [
    [0, -0.012],
    [0.032, 0.008],
    [0.072, 0.048, "sharp"],
    [0.042, 0.052],
    [0.015, 0.032],
    [0, 0.045, "sharp"],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(tiaraWingOutline, {
      at: [s * 0.008, 1.638, 0.088],
      x: [s * 0.88, 0.25, -0.4],
      y: [0, 0.96, 0.28],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      bone: head,
      color: GOLD_BRIGHT,
      group: "head",
      name: `tiaraWing${side}`,
    });
  }
  glow(
    b.part(new THREE.OctahedronGeometry(0.014, 1), SPIRIT_CYAN, {
      bone: head,
      at: [0, 1.648, 0.094],
      scale: [0.75, 1.45, 0.55],
      group: "head",
      name: "tiaraCenterGem",
    }),
    1.8,
  );

  // ============================================================================
  // 7. ORNATE BACK QUIVER & FLETCHED SPIRIT ARROWS
  // ============================================================================
  const qBase = quiverJoint.at;
  const qDir = quiverJoint.axis; // [-0.36, 0.88, -0.28] normalized
  const qTop = offset(qBase, qDir, 0.44);
  const qBottom = offset(qBase, qDir, -0.12);

  // Sculpted cylindrical-oval quiver body with gold throat, emerald middle, and pointed golden finial
  const quiverTube = b.sweep(
    catmull([
      offset(qBase, qDir, -0.16),
      qBottom,
      lerp(qBottom, qTop, 0.5),
      qTop,
    ]),
    (t) => {
      if (t < 0.12) return [0.006 + t * 0.28, 0.006 + t * 0.22];
      return [0.042 + 0.012 * t, 0.032 + 0.008 * t];
    },
    {
      bone: quiverJoint,
      bands: [
        [0.18, GOLD_BRIGHT],
        [0.32, LEATHER_DARK],
        [0.36, GOLD],
        [0.78, EMERALD],
        [0.84, GOLD],
        [0.94, LEATHER_WARM],
        [1.0, GOLD_BRIGHT],
      ],
      caps: { start: "point", end: "flat" },
      group: "quiver",
      name: "quiverBody",
    },
  );

  // Decal emblem on the quiver body
  b.decal(quiverTube, CREST_TEX, {
    at: quiverTube.at(0.58, 180, 0.002),
    dir: [0, 0.2, -1],
    size: [0.065, 0.11],
    bone: quiverJoint,
    group: "quiver",
    name: "quiverCrestDecal",
  });

  // 5 Fletched Elven Arrows emerging from the quiver mouth
  const arrowOffsets: Array<[number, number, number]> = [
    [0.0, 0.0, 0.0],
    [0.018, 0.006, 0.012],
    [-0.018, -0.004, 0.01],
    [0.012, -0.01, -0.012],
    [-0.014, 0.01, -0.01],
  ];
  arrowOffsets.forEach(([ox, oy, oz], idx) => {
    const aStart = offset(qTop, qDir, -0.06);
    aStart.x += ox;
    aStart.y += oy;
    aStart.z += oz;
    const aEnd = offset(aStart, qDir, 0.24 + (idx % 2) * 0.025);

    // Arrow shaft
    b.rod(aStart, aEnd, 0.004, {
      bone: quiverJoint,
      color: ASH_WOOD,
      group: "quiver",
      name: `quiverArrowShaft${idx}`,
    });
    // Golden nock cap
    b.part(new THREE.CylinderGeometry(0.0055, 0.0045, 0.018, 6), GOLD_BRIGHT, {
      bone: quiverJoint,
      at: aEnd,
      dir: qDir,
      group: "quiver",
      name: `quiverArrowNock${idx}`,
    });
    // Feather fletching cards around arrow tail
    const fletchRing = b.ring(
      frame(offset(aEnd, qDir, -0.055), qDir),
      { count: 3, radius: 0.004 },
    ).items;
    b.cards(fletchRing, FEATHER_CARD_TEX, {
      size: [0.022, 0.075],
      lean: 78,
      flow: qDir,
      bone: quiverJoint,
      group: "quiver",
      name: `quiverFletch${idx}`,
    });
  });

  // ============================================================================
  // 8. ENCHANTED ELVEN SPIRIT LONGBOW (Held in Left Hand)
  // ============================================================================
  // Central sculpted golden & heartwood riser around bowGrip
  const riserPath = catmull([
    [0.648, 0.95, 0.125],
    [0.635, 1.11, 0.095],
    [0.648, 1.27, 0.145],
  ]);
  b.sweep(
    riserPath,
    (t) => {
      const m = 1 - Math.abs(t - 0.5) * 2;
      return [0.016 + 0.012 * m, 0.022 + 0.016 * m];
    },
    {
      bone: bowGrip,
      bands: [
        [0.25, GOLD_BRIGHT],
        [0.75, LEATHER_WARM],
        [1.0, GOLD_BRIGHT],
      ],
      group: "bow",
      name: "bowRiser",
    },
  );

  // Sweeping recurve upper & lower bow limbs (wood core + golden filigree backing)
  for (const [tag, limbChain] of [
    ["Upper", bowUpper],
    ["Lower", bowLower],
  ] as const) {
    b.sweep(
      limbChain,
      (t) => [0.014 * (1 - 0.68 * t) + 0.003, 0.024 * (1 - 0.65 * t) + 0.004],
      {
        bands: [
          [0.22, GOLD_BRIGHT],
          [0.68, BOW_WOOD],
          [0.85, ASH_WOOD],
          [1.0, GOLD_BRIGHT],
        ],
        caps: { start: "round", end: "point" },
        group: "bow",
        name: `bowLimb${tag}`,
      },
    );

    // Ornate golden leaf-blade wing accents near the riser-to-limb transitions
    const bladeOutline: OutlinePoint[] = [
      [0, -0.02],
      [0.038, 0.025],
      [0.055, 0.095],
      [0.022, 0.165, "sharp"],
      [-0.008, 0.115],
      [-0.012, 0.035],
    ];
    const signY = tag === "Upper" ? 1 : -1;
    b.extrude(bladeOutline, {
      at: limbChain.at(0.18),
      x: [0.15, 0.1 * signY, 0.98],
      y: [0.05, 0.98 * signY, -0.15],
      thickness: [0.008, 0.003],
      bevel: 0.003,
      smoothing: 1,
      bone: limbChain.joints[0],
      color: GOLD_BRIGHT,
      group: "bow",
      name: `bowWingBlade${tag}`,
    });

    // Glowing spirit crystal embedded at each limb recurve tip & mid-limb node
    const midPt = limbChain.at(0.45);
    glow(
      b.part(new THREE.OctahedronGeometry(0.015, 1), SPIRIT_CYAN, {
        bone: limbChain.joints[1],
        at: offset(midPt.at, [0, 0, 1], 0.018),
        scale: [0.65, 1.6, 0.85],
        group: "bow",
        name: `bowCrystalMid${tag}`,
      }),
      1.7,
    );

    const tipPt = limbChain.at(1).at;
    glow(
      b.spike(
        limbChain.at(0.92).at,
        offset(tipPt, [0, signY * 0.6, -0.8], 0.045),
        null,
        0.011,
        {
          bone: limbChain.joints[2],
          color: SPIRIT_CYAN,
          group: "bow",
          name: `bowTipFinial${tag}`,
        },
      ),
      1.8,
    );
  }

  // Central winged golden bow-guard & glowing spirit core + rune halo on bowGrip
  const bowCenterGuardOutline: OutlinePoint[] = [
    [0, -0.095, "sharp"],
    [0.042, -0.035],
    [0.058, 0.0],
    [0.042, 0.035],
    [0, 0.095, "sharp"],
    [-0.025, 0.035],
    [-0.032, 0.0],
    [-0.025, -0.035],
  ];
  b.extrude(bowCenterGuardOutline, {
    at: [0.642, 1.11, 0.128],
    x: [0.1, 0, 0.99],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.005,
    smoothing: 1,
    bone: bowGrip,
    color: GOLD_BRIGHT,
    group: "bow",
    name: "bowCenterGuard",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 1), SPIRIT_CYAN, {
      bone: bowGrip,
      at: [0.648, 1.11, 0.165],
      scale: [0.7, 1.5, 0.9],
      group: "bow",
      name: "bowHeartGem",
    }),
    2.0,
  );
  // Glowing magical rune circle card in front of the bow heart gem
  glow(
    b.cards([frame([0.652, 1.11, 0.172], [0, 1, 0])], RUNE_TEX, {
      size: [0.11, 0.11],
      lean: 0,
      flow: [0.12, 0, 0.99],
      bone: bowGrip,
      group: "bow",
      name: "bowRuneHalo",
    }),
    1.8,
  );

  // Glowing taut spirit-energy bowstring between upper & lower limb tips
  const stringTop = bowUpper.at(0.96).at;
  const stringMid: [number, number, number] = [0.608, 1.09, 0.012];
  const stringBot = bowLower.at(0.96).at;
  glow(
    b.sweep(polyline([stringTop, stringMid, stringBot]), 0.0032, {
      bone: [bowUpper, bowGrip, bowLower],
      color: SPIRIT_CYAN,
      group: "bow",
      name: "bowString",
    }),
    2.0,
  );

  // Enchanted Spirit Arrow mounted alongside the bow riser ready to draw
  const arrowTail: [number, number, number] = [0.612, 1.092, 0.018];
  const arrowHeadBase: [number, number, number] = [0.685, 1.145, 0.56];
  const arrowTip: [number, number, number] = [0.698, 1.155, 0.655];
  b.rod(arrowTail, arrowHeadBase, 0.0042, {
    bone: bowGrip,
    bands: [
      [0.18, GOLD_BRIGHT],
      [0.85, ASH_WOOD],
      [1.0, SILVER],
    ],
    group: "bow",
    name: "bowArrowShaft",
  });
  // Glowing crystal broadhead arrowhead
  const arrowHeadOutline: OutlinePoint[] = [
    [0, -0.015],
    [0.022, -0.028, "sharp"],
    [0.016, 0.022],
    [0, 0.095, "sharp"],
    [-0.016, 0.022],
    [-0.022, -0.028, "sharp"],
  ];
  glow(
    b.extrude(arrowHeadOutline, {
      at: arrowHeadBase,
      x: [1, 0.2, -0.1],
      y: [0.12, 0.1, 0.98],
      thickness: [0.008, 0.001],
      bevel: 0.002,
      smoothing: 1,
      bone: bowGrip,
      color: SPIRIT_CYAN,
      group: "bow",
      name: "bowArrowHead",
    }),
    2.0,
  );
  // Glowing spirit energy spiral ribbon curling around the arrow tip
  const spiritRibbon = catmull([
    arrowHeadBase,
    [0.665, 1.168, 0.44],
    [0.692, 1.105, 0.32],
    [0.642, 1.132, 0.21],
  ]);
  glow(
    b.sweep(spiritRibbon, [0.005, 0.003, 0.001], {
      bone: bowGrip,
      color: SPIRIT_GOLD,
      caps: "point",
      group: "bow",
      name: "arrowSpiritTrail",
    }),
    1.8,
  );
  // Fletching on the bow arrow
  const bowArrowDir: [number, number, number] = [0.13, 0.095, 0.985];
  const bowFletchFrames = b.ring(
    frame([0.622, 1.099, 0.088], bowArrowDir),
    { count: 3, radius: 0.0045 },
  ).items;
  b.cards(bowFletchFrames, FEATHER_CARD_TEX, {
    size: [0.024, 0.082],
    lean: 80,
    flow: [-0.13, -0.095, -0.985],
    bone: bowGrip,
    group: "bow",
    name: "bowArrowFletch",
  });

  // Glowing golden tassel ribbons hanging from bow grip
  const bowTasselFrames = [
    frame([0.635, 0.955, 0.125], [0, 1, 0]),
    frame([0.618, 0.465, -0.032], [0, 1, 0]),
  ];
  b.cards(bowTasselFrames, GOLD_LEAF_TEX, {
    size: [0.036, 0.115],
    lean: 175,
    bend: 22,
    flow: [0, -0.2, -1],
    bone: bowGrip,
    group: "bow",
    name: "bowTassels",
  });

  return b.root;
}
