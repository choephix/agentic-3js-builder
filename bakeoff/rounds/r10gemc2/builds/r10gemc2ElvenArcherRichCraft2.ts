import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  svg,
  rgb,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A high-fantasy anime elven ranger archer in tailored woodland garb, featuring long swept-back ears, flowing platinum ponytail, expressive emerald eyes, recurve bow, enchanted quiver, and a mossy runic dais.",
};

// ---------------------------------------------------------------------------------------------------------------
// Cel Shading Helper

function cel(
  lit: string | Rgb,
  shadow?: string | Rgb,
  lightDir: [number, number, number] = [0.35, 0.8, 0.5]
) {
  const L = new THREE.Vector3(...lightDir).normalize();
  const litRgb = typeof lit === "string" ? rgb(lit) : lit;
  const shadRgb = shadow
    ? typeof shadow === "string"
      ? rgb(shadow)
      : shadow
    : ([litRgb[0] * 0.62, litRgb[1] * 0.56, litRgb[2] * 0.7] as const);
  return paint((_p, n) => (n.dot(L) > 0.08 ? litRgb : shadRgb));
}

// ---------------------------------------------------------------------------------------------------------------
// Color Palette

const SKIN = cel("#ffeade", "#f0b89e");
const SKIN_BLUSH = "#ffa6b8";
const HAIR_BASE = cel("#fffbe8", "#d6c596");
const HAIR_SHADOW = cel("#decb94", "#b5a068");
const TUNIC_GREEN = cel("#1b7845", "#0c4423");
const PALE_LINEN = cel("#fcf7ea", "#dcd1ba");
const SASH_MINT = cel("#3ae29f", "#1b8b5a");
const LEATHER_BROWN = cel("#764323", "#432210");
const DARK_LEATHER = cel("#382316", "#1c100a");
const TROUSERS_SLATE = cel("#25323a", "#141c22");
const GOLD_TRIM = cel("#f6cb42", "#a47c18");
const MITHRIL_SILVER = cel("#e5effa", "#95a8bf");
const BOW_WOOD = cel("#4d2616", "#26110a");
const STONE_BASE = cel("#555d61", "#32393d");
const STONE_TOP = cel("#727c80", "#454f54");
const MOSS_GREEN = cel("#3a7536", "#1e461a");
const CYAN_GLOW = "#38f8d4";
const VINE_GREEN = cel("#2b6b28", "#153d13");

// ---------------------------------------------------------------------------------------------------------------
// SVG Textures

const ELF_EYE = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M 8 68 Q 36 22 86 46 Q 96 38 99 24 Q 94 48 84 58 Q 50 48 16 72 Z" fill="#180e22"/>
    <path d="M 86 46 Q 95 34 99 22" stroke="#180e22" stroke-width="4.8" stroke-linecap="round" fill="none"/>
    <path d="M 84 55 Q 94 52 97 44" stroke="#180e22" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M 16 70 Q 46 34 82 56 Q 76 92 48 95 Q 22 92 16 70 Z" fill="#f8fbff"/>
    <defs>
      <linearGradient id="irisGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0a3e26"/>
        <stop offset="42%" stop-color="#14824e"/>
        <stop offset="82%" stop-color="#2de898"/>
        <stop offset="100%" stop-color="#6ef9ff"/>
      </linearGradient>
      <radialGradient id="pupilGlow" cx="0.5" cy="0.65" r="0.48">
        <stop offset="0%" stop-color="#6ef9ff" stop-opacity="0.95"/>
        <stop offset="65%" stop-color="#14824e" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="68" rx="26" ry="32" fill="url(#irisGrad)"/>
    <ellipse cx="50" cy="68" rx="26" ry="32" fill="none" stroke="#0a3e26" stroke-width="2.6"/>
    <ellipse cx="50" cy="74" rx="20" ry="18" fill="url(#pupilGlow)"/>
    <ellipse cx="50" cy="68" rx="11" ry="18" fill="#12081c"/>
    <polygon points="50,56 52,65 61,68 52,71 50,80 48,71 39,68 48,65" fill="#a4ffea" opacity="0.95"/>
    <circle cx="50" cy="68" r="3.2" fill="#ffffff"/>
    <ellipse cx="38" cy="53" rx="9" ry="12" fill="#ffffff"/>
    <circle cx="62" cy="78" r="4.6" fill="#ffffff"/>
    <circle cx="38" cy="78" r="2.6" fill="#a4ffea"/>
    <path d="M 28 88 Q 50 96 72 86" stroke="#4a2638" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    <path d="M 18 102 L 32 96 M 26 105 L 40 99 M 34 107 L 48 101" stroke="#ff7a98" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
  </svg>`,
  { size: 512 }
);

const ELF_RUNE_CIRCLE = svg(
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="246" fill="none" stroke="#251b14" stroke-width="8"/>
    <circle cx="256" cy="256" r="234" fill="none" stroke="#d8b240" stroke-width="4.5"/>
    <circle cx="256" cy="256" r="216" fill="none" stroke="#d8b240" stroke-width="2" stroke-dasharray="8 6"/>
    <circle cx="256" cy="256" r="176" fill="none" stroke="#2ce09a" stroke-width="3" opacity="0.85"/>
    <circle cx="256" cy="256" r="142" fill="none" stroke="#d8b240" stroke-width="3.5"/>
    <polygon points="256,50 286,210 446,180 302,246 462,256 302,266 446,332 286,302 256,462 226,302 66,332 210,266 50,256 210,246 66,180 226,210" fill="none" stroke="#d8b240" stroke-width="3.2"/>
    <polygon points="256,92 278,226 414,200 292,250 422,256 292,262 414,312 278,286 256,422 234,286 98,312 220,262 90,256 220,250 98,200 234,226" fill="none" stroke="#2ce09a" stroke-width="2" opacity="0.8"/>
    <circle cx="256" cy="256" r="70" fill="none" stroke="#d8b240" stroke-width="3.6"/>
    <circle cx="256" cy="256" r="42" fill="#d8b240" fill-opacity="0.18" stroke="#6ef9ff" stroke-width="2.8"/>
  </svg>`,
  { size: 512 }
);

const RUNIC_GLYPH = svg(
  `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
    <path d="M 64 22 L 64 234 M 64 38 L 104 70 M 64 78 L 24 110 M 64 122 L 108 154 M 64 162 L 20 194 M 40 42 L 88 42 M 44 214 L 84 214" stroke="#2ce09a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="64" cy="122" r="16" fill="none" stroke="#6ef9ff" stroke-width="6"/>
    <circle cx="64" cy="122" r="6" fill="#a4ffea"/>
  </svg>`,
  { size: 256 }
);

const LEAF_FILIGREE = svg(
  `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 32 Q 32 10 64 32 Q 96 54 128 32 Q 160 10 192 32 Q 224 54 256 32" stroke="#d8b240" stroke-width="4.2" fill="none"/>
    <path d="M 32 22 Q 48 8 52 24 Q 44 24 32 22 Z" fill="#eed266"/>
    <path d="M 96 42 Q 112 56 116 40 Q 108 40 96 42 Z" fill="#eed266"/>
    <path d="M 160 22 Q 176 8 180 24 Q 172 24 160 22 Z" fill="#eed266"/>
    <path d="M 224 42 Q 240 56 244 40 Q 236 40 224 42 Z" fill="#eed266"/>
    <line x1="0" y1="5" x2="256" y2="5" stroke="#d8b240" stroke-width="3"/>
    <line x1="0" y1="59" x2="256" y2="59" stroke="#d8b240" stroke-width="3"/>
  </svg>`,
  { size: 256 }
);

// ---------------------------------------------------------------------------------------------------------------
// Main Builder

export default function build() {
  const b = createBuilder({ name: "elven_ranger_archer", detail: 1.15 });

  const daisFloorY = 0.06;

  // -------------------------------------------------------------------------------------------------------------
  // 1. Skeleton Setup: Heroic, Athletic Archer Ready Stance
  // -------------------------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.90, 0.0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  const spinePts = [
    [0, 0.90, 0.0],
    [0, 1.05, -0.01],
    [0, 1.22, 0.0],
  ];
  const spineChain = b.chain("spine", spinePts, {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spineChain.joints[1];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.34, 0.01],
    dir: [0, 1, 0.06],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.46, 0.02],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.41, 0.045],
    dir: [0, -0.1, 0.5],
    role: "jaw",
    group: "head",
  });

  // Athletic Stance: Left leg forward & angled out; Right leg braced back
  const legChains: Record<string, any> = {};

  // Left Leg (Stepped forward)
  const legL = b.chain(
    "legL",
    [
      [0.10, 0.88, 0.01],
      [0.13, 0.49, 0.07],
      [0.14, daisFloorY + 0.065, 0.07],
      [0.15, daisFloorY + 0.025, 0.16],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "toeL"],
      role: "leg",
      contact: [0.15, daisFloorY, 0.12],
      group: "legs",
    }
  );
  legChains.L = legL;

  // Right Leg (Braced slightly back)
  const legR = b.chain(
    "legR",
    [
      [-0.10, 0.88, -0.01],
      [-0.14, 0.49, -0.04],
      [-0.15, daisFloorY + 0.065, -0.04],
      [-0.16, daisFloorY + 0.025, 0.05],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "toeR"],
      role: "leg",
      contact: [-0.16, daisFloorY, 0.01],
      group: "legs",
    }
  );
  legChains.R = legR;

  // Arms: Left holds bow outward, Right arm poised near chest/quiver
  const armChains: Record<string, any> = {};

  // Left Arm (Bow Arm)
  const armL = b.chain(
    "armL",
    [
      [0.17, 1.28, 0.01],
      [0.31, 1.15, 0.13],
      [0.40, 1.05, 0.22],
      [0.43, 1.00, 0.25],
    ],
    {
      parent: chest,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      group: "arms",
    }
  );
  armChains.L = armL;

  // Right Arm (Drawing / Ready Arm)
  const armR = b.chain(
    "armR",
    [
      [-0.17, 1.28, -0.01],
      [-0.27, 1.14, -0.06],
      [-0.21, 1.10, 0.08],
      [-0.15, 1.10, 0.14],
    ],
    {
      parent: chest,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      group: "arms",
    }
  );
  armChains.R = armR;

  // -------------------------------------------------------------------------------------------------------------
  // 2. Staged Base: Ancient Elven Dais & Monolith
  // -------------------------------------------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.03, 32), STONE_BASE, {
    at: [0, 0.015, 0],
    bone: hips,
    group: "scenery",
  });
  b.part(new THREE.CylinderGeometry(0.57, 0.61, 0.03, 32), STONE_TOP, {
    at: [0, 0.045, 0],
    bone: hips,
    group: "scenery",
  });
  b.part(new THREE.PlaneGeometry(1.08, 1.08), "#ffffff", {
    at: [0, daisFloorY + 0.001, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: ELF_RUNE_CIRCLE,
    bone: hips,
    group: "scenery",
  });

  // Ancient Waystone Monolith
  b.frustumBox(
    [-0.34, daisFloorY, -0.32],
    [-0.34, daisFloorY + 0.46, -0.32],
    [0.13, 0.10],
    [0.08, 0.06],
    { bone: hips, color: STONE_BASE, group: "scenery" }
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.08, 4),
    STONE_TOP,
    { at: [-0.34, daisFloorY + 0.5, -0.32], rotation: [0, 45, 0], bone: hips, group: "scenery" }
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.08, 0.16), "#ffffff", {
      at: [-0.338, daisFloorY + 0.25, -0.259],
      dir: [0.18, 0, 0.98],
      axis: "z",
      texture: RUNIC_GLYPH,
      bone: hips,
      group: "scenery",
    }),
    2.2
  );
  b.sweep(
    catmull([
      [-0.38, daisFloorY + 0.02, -0.27],
      [-0.29, daisFloorY + 0.14, -0.26],
      [-0.37, daisFloorY + 0.26, -0.35],
      [-0.3, daisFloorY + 0.36, -0.32],
      [-0.34, daisFloorY + 0.45, -0.29],
    ]),
    0.006,
    { bone: hips, color: VINE_GREEN, group: "scenery" }
  );

  // Bioluminescent Mushrooms (Rooted firmly on base)
  const shrooms = [
    { pos: [-0.24, daisFloorY, -0.22], h: 0.08, r: 0.032, col: "#22f5c8" },
    { pos: [-0.28, daisFloorY, -0.16], h: 0.055, r: 0.024, col: "#38e0ff" },
    { pos: [-0.19, daisFloorY, -0.27], h: 0.042, r: 0.018, col: "#6df8ff" },
  ];
  for (const s of shrooms) {
    b.rod(s.pos, [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]], 0.006, {
      bone: hips,
      color: PALE_LINEN,
      group: "scenery",
    });
    glow(
      b.part(
        new THREE.SphereGeometry(s.r, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
        s.col,
        {
          at: [s.pos[0], s.pos[1] + s.h * 0.68, s.pos[2]],
          scale: [1, 1.25, 1],
          bone: hips,
          group: "scenery",
        }
      ),
      1.8
    );
  }

  // Fern Fronds around Dais Rim
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180;
    const fx = Math.cos(angle) * 0.48;
    const fz = Math.sin(angle) * 0.48;
    b.extrude(
      [
        [0, 0],
        [0.026, 0.07],
        [0.012, 0.13],
        [0, 0.17],
        [-0.012, 0.13],
        [-0.026, 0.07],
      ],
      {
        at: [fx, daisFloorY, fz],
        x: [Math.cos(angle), 0, Math.sin(angle)],
        y: [0, 1, 0],
        thickness: 0.004,
        bone: hips,
        color: MOSS_GREEN,
        group: "scenery",
      }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 3. Legs, Greaves & Boots
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const toeJ = leg.joints[3];

    // Thighs
    b.capsule(hipJ.at, kneeJ.at, [0.058, 0.046], {
      bone: hipJ,
      color: TROUSERS_SLATE,
      group: "legs",
    });

    // Knee-cop Guard
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y + 0.02, kneeJ.at.z + 0.01],
      [kneeJ.at.x, kneeJ.at.y - 0.02, kneeJ.at.z + 0.01],
      0.046,
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.SphereGeometry(0.01, 8, 6),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y, kneeJ.at.z + 0.052], group: "legs" }
    );

    // Flared Boot Cuff
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y + 0.01, kneeJ.at.z],
      [kneeJ.at.x, kneeJ.at.y - 0.06, kneeJ.at.z],
      [0.054, 0.046],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );
    b.part(
      new THREE.CylinderGeometry(0.052, 0.052, 0.008, 16),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y + 0.005, kneeJ.at.z], group: "legs" }
    );

    // Shin & Calf
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y - 0.04, kneeJ.at.z],
      ankleJ.at,
      [0.046, 0.036],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );

    // Archer Shin Plate
    b.frustumBox(
      [kneeJ.at.x, kneeJ.at.y - 0.07, kneeJ.at.z + 0.026],
      [ankleJ.at.x, ankleJ.at.y + 0.04, ankleJ.at.z + 0.023],
      [0.042, 0.014],
      [0.034, 0.012],
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.BoxGeometry(0.012, 0.07, 0.006),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y - 0.17, kneeJ.at.z + 0.036], group: "legs" }
    );

    // Boot Foot & Heel
    b.capsule(
      ankleJ.at,
      [ankleJ.at.x, daisFloorY + 0.032, ankleJ.at.z],
      0.032,
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    b.frustumBox(
      [ankleJ.at.x, daisFloorY + 0.06, ankleJ.at.z - 0.01],
      toeJ.at,
      [0.058, 0.048],
      [0.042, 0.028],
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    b.part(
      new THREE.BoxGeometry(0.034, 0.012, 0.012),
      GOLD_TRIM,
      { bone: ankleJ, at: [ankleJ.at.x, daisFloorY + 0.042, ankleJ.at.z + 0.042], group: "legs" }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. Torso, Tunic, Belts, Tassets & Billowing Cloak
  // -------------------------------------------------------------------------------------------------------------

  b.frustumBox(
    [0, 0.94, 0],
    [0, 0.85, 0],
    [0.25, 0.18],
    [0.21, 0.16],
    { bone: hips, color: TUNIC_GREEN, group: "torso" }
  );

  // Scalloped Leather Tassets (Hip Flaps)
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.055, -0.12],
        [0.02, -0.16, "sharp"],
        [-0.035, -0.12],
      ],
      {
        at: [s * 0.06, 0.88, 0.09],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: LEATHER_BROWN,
        bone: hips,
        group: "torso",
      }
    );
    b.part(
      new THREE.SphereGeometry(0.007, 6, 4),
      GOLD_TRIM,
      { bone: hips, at: [s * 0.08, 0.73, 0.095], group: "torso" }
    );

    b.extrude(
      [
        [0, 0],
        [0.06, -0.13],
        [0.02, -0.17, "sharp"],
        [-0.04, -0.13],
      ],
      {
        at: [s * 0.12, 0.88, 0],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.008,
        color: LEATHER_BROWN,
        bone: hips,
        group: "torso",
      }
    );
  }

  // Emerald Silk Center Sash
  b.extrude(
    [
      [0, 0],
      [0.038, -0.02],
      [0.028, -0.21],
      [0, -0.25, "sharp"],
      [-0.028, -0.21],
      [-0.038, -0.02],
    ],
    {
      at: [0, 0.91, 0.1],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: SASH_MINT,
      bone: hips,
      group: "torso",
    }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.024, 4),
    GOLD_TRIM,
    { bone: hips, at: [0, 0.68, 0.105], rotation: [180, 0, 0], group: "torso" }
  );

  // Twin Ranger Belts
  b.sweep(
    catmull([
      [-0.13, 0.96, 0],
      [0, 0.96, 0.1],
      [0.13, 0.96, 0],
      [0, 0.96, -0.09],
      [-0.13, 0.96, 0],
    ]),
    0.014,
    { color: DARK_LEATHER, bone: hips, group: "torso" }
  );
  b.sweep(
    catmull([
      [-0.13, 0.91, 0],
      [0, 0.91, 0.1],
      [0.13, 0.91, 0],
      [0, 0.91, -0.09],
      [-0.13, 0.91, 0],
    ]),
    0.012,
    { color: LEATHER_BROWN, bone: hips, group: "torso" }
  );
  b.part(
    new THREE.BoxGeometry(0.04, 0.028, 0.015),
    GOLD_TRIM,
    { bone: hips, at: [0, 0.96, 0.105], group: "torso" }
  );

  // Hip Pouch on Left Side
  b.part(
    new THREE.BoxGeometry(0.048, 0.06, 0.036),
    LEATHER_BROWN,
    { bone: hips, at: [0.14, 0.92, 0.02], group: "torso" }
  );
  b.part(
    new THREE.SphereGeometry(0.006, 6, 4),
    GOLD_TRIM,
    { bone: hips, at: [0.14, 0.91, 0.04], group: "torso" }
  );

  // Torso / Jerkin Loft
  b.loft(
    [
      { at: [0, 0.94, 0], w: 0.24, h: 0.17 },
      { at: [0, 1.05, -0.01], w: 0.22, h: 0.16 },
      { at: [0, 1.16, -0.01], w: 0.26, h: 0.19 },
      { at: [0, 1.28, -0.01], w: 0.30, h: 0.21 },
    ],
    { bone: [hips, spineChain.joints[0], chest], color: TUNIC_GREEN, group: "torso" }
  );

  // Fitted Linen Collar
  b.frustumBox(
    [0, 1.27, 0.05],
    [0, 1.33, 0.03],
    [0.11, 0.06],
    [0.14, 0.08],
    { bone: chest, color: PALE_LINEN, group: "torso" }
  );
  b.extrude(
    [
      [0, 0],
      [0.042, 0.045],
      [0.026, 0.045],
      [0, 0.016],
      [-0.026, 0.045],
      [-0.042, 0.045],
    ],
    {
      at: [0, 1.26, 0.092],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.005,
      color: GOLD_TRIM,
      bone: chest,
      group: "torso",
    }
  );

  // Leather Baldric Across Chest
  b.sweep(
    catmull([
      [-0.13, 1.29, 0.07],
      [-0.01, 1.15, 0.095],
      [0.10, 0.99, 0.08],
    ]),
    () => [0.022, 0.005],
    { color: LEATHER_BROWN, bone: chest, group: "torso" }
  );
  b.part(
    new THREE.ConeGeometry(0.015, 0.032, 5),
    GOLD_TRIM,
    { bone: chest, at: [-0.01, 1.20, 0.102], rotation: [0, 0, 15], group: "torso" }
  );
  glow(
    b.part(
      new THREE.SphereGeometry(0.007, 8, 6),
      CYAN_GLOW,
      { bone: chest, at: [-0.01, 1.20, 0.112], group: "torso" }
    ),
    2.2
  );

  // Pauldrons
  const shL = armChains.L.joints[0];
  b.capsule(
    [0.16, 1.30, 0.01],
    [0.25, 1.27, 0.01],
    [0.048, 0.04],
    { bone: shL, color: TUNIC_GREEN, group: "armor" }
  );
  b.extrude(
    [
      [0, 0],
      [0.065, 0.03],
      [0.085, -0.03, "sharp"],
      [0.045, -0.065],
      [0, -0.035],
    ],
    {
      at: [0.18, 1.30, 0.04],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: GOLD_TRIM,
      bone: shL,
      group: "armor",
    }
  );
  glow(
    b.part(
      new THREE.SphereGeometry(0.008, 8, 6),
      CYAN_GLOW,
      { bone: shL, at: [0.24, 1.28, 0.05], group: "armor" }
    ),
    1.8
  );

  const shR = armChains.R.joints[0];
  b.capsule(
    [-0.15, 1.30, -0.01],
    [-0.24, 1.27, -0.01],
    [0.046, 0.038],
    { bone: shR, color: LEATHER_BROWN, group: "armor" }
  );
  b.part(
    new THREE.SphereGeometry(0.007, 6, 4),
    GOLD_TRIM,
    { bone: shR, at: [-0.21, 1.30, 0.025], group: "armor" }
  );

  // Billowing Cloak Behind
  for (const s of [1, -1]) {
    b.loft(
      [
        { at: [s * 0.12, 1.26, -0.07], w: 0.16, h: 0.02 },
        { at: [s * 0.16, 1.08, -0.11], w: 0.20, h: 0.02 },
        { at: [s * 0.20, 0.85, -0.14], w: 0.23, h: 0.02 },
        { at: [s * 0.23, 0.60, -0.16], w: 0.25, h: 0.02 },
      ],
      { bone: chest, color: TUNIC_GREEN, group: "cloak" }
    );
    b.part(
      new THREE.BoxGeometry(0.18, 0.012, 0.01),
      GOLD_TRIM,
      { bone: chest, at: [s * 0.23, 0.60, -0.16], group: "cloak" }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 5. Arms, Archer Forearm Bracers & Hands
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[side];
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.joints[2];
    const hdJ = arm.joints[3];

    // Upper Arm
    b.capsule(shJ.at, elJ.at, [0.044, 0.038], {
      bone: shJ,
      color: PALE_LINEN,
      group: "arms",
    });
    b.part(
      new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12),
      GOLD_TRIM,
      { bone: shJ, at: elJ.at, group: "arms" }
    );

    // Forearm & Bracer
    if (s > 0) {
      b.capsule(elJ.at, wrJ.at, [0.038, 0.03], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      // Gold Bowstring Strike Guard
      b.frustumBox(
        [0.35, 1.10, 0.18],
        [0.39, 1.05, 0.22],
        [0.034, 0.012],
        [0.028, 0.01],
        { bone: elJ, color: GOLD_TRIM, group: "arms" }
      );
    } else {
      b.capsule(elJ.at, wrJ.at, [0.036, 0.028], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      b.part(
        new THREE.CylinderGeometry(0.03, 0.03, 0.016, 10),
        GOLD_TRIM,
        { bone: elJ, at: wrJ.at, group: "arms" }
      );
    }

    // Hands
    b.frustumBox(
      wrJ.at,
      hdJ.at,
      [0.036, 0.02],
      [0.032, 0.016],
      { bone: wrJ, color: SKIN, group: "arms" }
    );

    if (s > 0) {
      // Left hand grasping bow
      b.capsule(
        [0.42, 1.01, 0.24],
        [0.44, 0.98, 0.26],
        0.02,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
      b.capsule(
        [0.41, 1.01, 0.27],
        [0.43, 0.99, 0.28],
        0.01,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
    } else {
      // Right hand drawing posture
      b.capsule(
        [-0.16, 1.11, 0.13],
        [-0.14, 1.08, 0.16],
        0.018,
        { bone: hdJ, color: LEATHER_BROWN, group: "arms" }
      );
      for (let f = 0; f < 3; f++) {
        b.capsule(
          [-0.15 + f * 0.009, 1.09, 0.14],
          [-0.13 + f * 0.009, 1.06, 0.17],
          0.007,
          { bone: hdJ, color: SKIN, group: "arms" }
        );
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. Elven Recurve Longbow (Held in Left Hand)
  // -------------------------------------------------------------------------------------------------------------

  const bowHand = armChains.L.joints[3];
  const gripCenter = [0.43, 1.00, 0.25];

  // Bow Grip
  b.capsule(
    [0.43, 1.07, 0.25],
    [0.43, 0.93, 0.25],
    0.016,
    { bone: bowHand, color: LEATHER_BROWN, group: "weapon" }
  );
  b.part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.43, 1.06, 0.25], group: "weapon" }
  );
  b.part(
    new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.43, 0.94, 0.25], group: "weapon" }
  );
  glow(
    b.part(
      new THREE.SphereGeometry(0.011, 10, 8),
      CYAN_GLOW,
      { bone: bowHand, at: [0.43, 1.00, 0.27], group: "weapon" }
    ),
    2.2
  );

  // Upper Bow Limb (Reaching up and forward)
  const upperTip = [0.38, 1.70, 0.28];
  const upperLimbPath = catmull([
    [0.43, 1.07, 0.25],
    [0.43, 1.28, 0.28],
    [0.42, 1.50, 0.32],
    [0.40, 1.66, 0.32],
    upperTip,
  ]);
  b.sweep(
    upperLimbPath,
    (t) => 0.016 * (1 - t * 0.52),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.04, 4),
    GOLD_TRIM,
    { bone: bowHand, at: upperTip, rotation: [35, 0, -15], group: "weapon" }
  );

  // Lower Bow Limb (Reaching down and forward)
  const lowerTip = [0.42, 0.30, 0.23];
  const lowerLimbPath = catmull([
    [0.43, 0.93, 0.25],
    [0.44, 0.72, 0.27],
    [0.45, 0.52, 0.28],
    [0.44, 0.38, 0.26],
    lowerTip,
  ]);
  b.sweep(
    lowerLimbPath,
    (t) => 0.016 * (1 - t * 0.52),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.04, 4),
    GOLD_TRIM,
    { bone: bowHand, at: lowerTip, rotation: [-145, 0, -15], group: "weapon" }
  );

  // Glowing Celestial Bowstring
  glow(
    b.rod(upperTip, lowerTip, 0.002, CYAN_GLOW, { bone: bowHand, group: "weapon" }),
    2.5
  );

  // -------------------------------------------------------------------------------------------------------------
  // 7. Enchanted Quiver & Fletched Arrows
  // -------------------------------------------------------------------------------------------------------------

  const quiverBottom = [0.08, 0.94, -0.13];
  const quiverTop = [-0.10, 1.32, -0.16];
  b.sweep(
    catmull([quiverBottom, [-0.01, 1.13, -0.145], quiverTop]),
    [0.036, 0.052],
    { bone: chest, color: DARK_LEATHER, group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.053, 0.053, 0.015, 14),
    GOLD_TRIM,
    { bone: chest, at: [-0.09, 1.30, -0.158], rotation: [0, 0, -20], group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.014, 14),
    GOLD_TRIM,
    { bone: chest, at: [0.0, 1.13, -0.145], rotation: [0, 0, -20], group: "quiver" }
  );

  // 5 Fletched Arrows
  const arrows = [
    { from: [-0.09, 1.22, -0.16], to: [-0.12, 1.48, -0.17] },
    { from: [-0.07, 1.22, -0.15], to: [-0.07, 1.52, -0.16] },
    { from: [-0.10, 1.22, -0.14], to: [-0.15, 1.46, -0.13] },
    { from: [-0.08, 1.22, -0.17], to: [-0.08, 1.54, -0.19] },
    { from: [-0.06, 1.22, -0.16], to: [-0.03, 1.50, -0.15] },
  ];
  for (const arr of arrows) {
    b.rod(arr.from, arr.to, 0.005, MITHRIL_SILVER, { bone: chest, group: "quiver" });
    b.capsule(arr.to, [arr.to[0], arr.to[1] + 0.012, arr.to[2]], 0.006, {
      color: GOLD_TRIM,
      bone: chest,
      group: "quiver",
    });

    for (let f = 0; f < 3; f++) {
      const a = (f * 120 * Math.PI) / 180;
      const vx = Math.cos(a) * 0.015;
      const vz = Math.sin(a) * 0.015;
      glow(
        b.extrude(
          [
            [0, 0],
            [0.016, 0.012],
            [0.012, 0.048],
            [0, 0.042],
          ],
          {
            at: [arr.to[0] + vx, arr.to[1] - 0.042, arr.to[2] + vz],
            x: [Math.cos(a), 0, Math.sin(a)],
            y: [0, 1, 0],
            thickness: 0.003,
            color: CYAN_GLOW,
            bone: chest,
            group: "quiver",
          }
        ),
        1.8
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 8. Head, Expressive Face & Full Anime Hair Construction
  // -------------------------------------------------------------------------------------------------------------

  b.capsule(neck.at, head.at, 0.042, { bone: neck, color: SKIN, group: "head" });

  // Cranium base sphere (compact, properly scaled)
  b.part(
    new THREE.SphereGeometry(0.068, 16, 12),
    SKIN,
    { bone: head, at: [0, 1.47, 0.005], scale: [0.96, 1.04, 1.0], group: "head" }
  );

  // Graceful Anime Face & Jaw Loft
  const faceLoft = b.loft(
    [
      { at: [0, 1.51, 0.02], w: 0.13, h: 0.13 },
      { at: [0, 1.46, 0.04], w: 0.12, h: 0.12 },
      { at: [0, 1.42, 0.045], w: 0.08, h: 0.08 },
      { at: [0, 1.385, 0.048], w: 0.038, h: 0.038 },
    ],
    { bone: head, color: SKIN, group: "head" }
  );

  // Delicate Nose & Mouth
  b.part(
    new THREE.ConeGeometry(0.005, 0.012, 4),
    SKIN,
    { bone: head, at: [0, 1.442, 0.088], rotation: [90, 0, 0], group: "head" }
  );
  b.part(
    new THREE.BoxGeometry(0.016, 0.003, 0.004),
    "#b8687a",
    { bone: jaw, at: [0, 1.412, 0.078], group: "head" }
  );

  // Expressive Anime Eyes (Properly placed on face surface)
  for (const s of [1, -1]) {
    b.decal(faceLoft, ELF_EYE, {
      at: [s * 0.032, 1.462, 0.078],
      dir: [s * 0.18, 0.04, 0.98],
      size: [0.046, 0.056],
      mirror: s > 0,
      bone: head,
      group: "head",
    });

    // Blonde Eyebrows
    b.extrude(
      [
        [0, 0],
        [0.032, 0.006],
        [0.035, 0.003],
        [0.01, -0.004],
      ],
      {
        at: [s * 0.016, 1.498, 0.080],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.003,
        color: HAIR_SHADOW,
        bone: head,
        group: "head",
      }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Full, Lush Anime Hair & Forehead Bangs (Zero Baldness)
  // -------------------------------------------------------------------------------------------------------------

  // Full Cranial Hair Cap covering top, sides, and back
  b.part(
    new THREE.SphereGeometry(0.076, 18, 14),
    HAIR_BASE,
    { bone: head, at: [0, 1.485, -0.005], scale: [1.02, 1.08, 1.05], group: "hair" }
  );

  // Upper Forehead Hair Dome (ensures hairline extends naturally down toward brow)
  b.part(
    new THREE.SphereGeometry(0.076, 16, 12, 0, Math.PI, 0, Math.PI * 0.52),
    HAIR_BASE,
    {
      bone: head,
      at: [0, 1.482, 0.008],
      rotation: [-22, 0, 0],
      scale: [1.02, 1.05, 1.04],
      group: "hair",
    }
  );

  // Center Sweeping Forehead Bangs
  b.extrude(
    [
      [0, 0],
      [0.02, -0.045],
      [0.005, -0.072, "sharp"],
      [-0.015, -0.042],
    ],
    {
      at: [0, 1.54, 0.062],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: HAIR_BASE,
      bone: head,
      group: "hair",
    }
  );

  // Angled Side Bang Sweeps
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [s * 0.028, -0.042],
        [s * 0.012, -0.068, "sharp"],
        [-s * 0.016, -0.032],
      ],
      {
        at: [s * 0.026, 1.535, 0.058],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.01,
        color: HAIR_BASE,
        bone: head,
        group: "hair",
      }
    );

    // Cheek-Framing Front Tendrils with Golden Rings
    const tendril = catmull([
      [s * 0.065, 1.50, 0.03],
      [s * 0.07, 1.42, 0.048],
      [s * 0.066, 1.34, 0.055],
      [s * 0.06, 1.25, 0.05],
    ]);
    b.sweep(
      tendril,
      (t) => 0.012 * (1 - t * 0.5),
      { bone: head, color: HAIR_BASE, group: "hair" }
    );
    b.part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.01, 10),
      GOLD_TRIM,
      { bone: head, at: [s * 0.068, 1.39, 0.05], group: "hair" }
    );
  }

  // High Ponytail Clasp Ring
  const claspPos = [0, 1.54, -0.065];
  b.part(
    new THREE.TorusGeometry(0.026, 0.007, 8, 16),
    GOLD_TRIM,
    { bone: head, at: claspPos, rotation: [60, 0, 0], group: "hair" }
  );

  // Cascading Dynamic Anime Ponytail
  const ponyPts = [
    [0, 1.54, -0.065],
    [-0.02, 1.44, -0.15],
    [-0.04, 1.31, -0.20],
    [-0.03, 1.15, -0.19],
    [-0.01, 0.98, -0.15],
    [0.0, 0.85, -0.12],
  ];
  b.sweep(
    catmull(ponyPts),
    (t) => 0.038 * (1 - t * 0.72),
    { bone: head, color: HAIR_BASE, group: "hair" }
  );

  // Secondary billow hair strands for rich layered ponytail volume
  for (let p = 0; p < 4; p++) {
    const ang = (p * 90 * Math.PI) / 180;
    const px = Math.cos(ang) * 0.022;
    const pz = Math.sin(ang) * 0.022;
    b.sweep(
      catmull([
        [claspPos[0] + px, claspPos[1], claspPos[2] + pz],
        [claspPos[0] + px * 1.3 - 0.02, claspPos[1] - 0.14, claspPos[2] + pz * 1.3 - 0.06],
        [claspPos[0] + px * 0.8 - 0.03, claspPos[1] - 0.30, claspPos[2] + pz * 0.8 - 0.12],
      ]),
      (t) => 0.018 * (1 - t * 0.75),
      { bone: head, color: p % 2 === 0 ? HAIR_BASE : HAIR_SHADOW, group: "hair" }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 9. Swept-Back Elven Ears & Celestial Jewelry
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const earBase = [s * 0.058, 1.465, 0.01];
    const earMid = [s * 0.12, 1.50, -0.06];
    const earTip = [s * 0.19, 1.54, -0.14];

    b.sweep(
      catmull([earBase, earMid, earTip]),
      (t) => [0.026 * (1 - t * 0.76), 0.01 * (1 - t * 0.85)],
      { bone: head, color: SKIN, group: "ears" }
    );
    b.sweep(
      catmull([
        [s * 0.06, 1.465, 0.01],
        [s * 0.11, 1.495, -0.055],
        [s * 0.155, 1.525, -0.10],
      ]),
      (t) => [0.015 * (1 - t * 0.65), 0.005],
      { bone: head, color: SKIN_BLUSH, group: "ears" }
    );

    // Gold Ear Cuff
    b.part(
      new THREE.TorusGeometry(0.013, 0.0032, 8, 16),
      GOLD_TRIM,
      {
        bone: head,
        at: earMid,
        rotation: [30, s * -45, 0],
        group: "ears",
      }
    );
    // Dangling Crystal Drop
    b.rod(
      [earMid[0], earMid[1] - 0.008, earMid[2]],
      [earMid[0], earMid[1] - 0.022, earMid[2]],
      0.002,
      GOLD_TRIM,
      { bone: head, group: "ears" }
    );
    glow(
      b.part(
        new THREE.OctahedronGeometry(0.007, 0),
        CYAN_GLOW,
        {
          bone: head,
          at: [earMid[0], earMid[1] - 0.029, earMid[2]],
          scale: [0.8, 1.35, 0.8],
          group: "ears",
        }
      ),
      2.0
    );
  }

  // Golden Circlet Tiara
  b.sweep(
    catmull([
      [-0.068, 1.50, 0.01],
      [-0.042, 1.51, 0.068],
      [0, 1.51, 0.082],
      [0.042, 1.51, 0.068],
      [0.068, 1.50, 0.01],
    ]),
    0.004,
    { color: GOLD_TRIM, bone: head, group: "head" }
  );
  glow(
    b.part(
      new THREE.SphereGeometry(0.006, 8, 6),
      CYAN_GLOW,
      { bone: head, at: [0, 1.51, 0.088], group: "head" }
    ),
    2.2
  );

  return b.root;
}
