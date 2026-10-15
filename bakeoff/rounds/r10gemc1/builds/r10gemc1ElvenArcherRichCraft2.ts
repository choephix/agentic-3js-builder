import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  svg,
  rgb,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A high-fantasy anime elven ranger archer in tailored woodland garb, featuring long swept-back ears, flowing platinum ponytail, expressive emerald eyes, recurve bow, enchanted quiver, and a mossy runic dais.",
};

// ---------------------------------------------------------------------------------------------------------------
// Shaders & Helper Functions

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
    : ([litRgb[0] * 0.64, litRgb[1] * 0.58, litRgb[2] * 0.72] as const);
  return paint((_p, n) => (n.dot(L) > 0.1 ? litRgb : shadRgb));
}

function makeGlow<
  T extends
    | { mesh?: THREE.Mesh; meshes?: readonly THREE.Mesh[] }
    | THREE.Mesh
>(target: T, strength = 1.8): T {
  const anyTarget = target as any;
  const list: THREE.Mesh[] = anyTarget.isMesh
    ? [anyTarget]
    : anyTarget.meshes
    ? anyTarget.meshes
    : anyTarget.mesh
    ? [anyTarget.mesh]
    : [];
  for (const m of list) {
    if (m.material instanceof THREE.MeshStandardMaterial) {
      const mat = m.material.clone();
      mat.emissive.copy(mat.color);
      mat.emissiveMap = mat.map;
      mat.emissiveIntensity = strength;
      m.material = mat;
    }
  }
  return target;
}

// ---------------------------------------------------------------------------------------------------------------
// High-Fantasy Palette

const SKIN = cel("#ffeade", "#f2bda2");
const SKIN_BLUSH = "#ffa4b6";
const HAIR_BASE = cel("#fffbe8", "#d8c79a");
const HAIR_SHADOW = cel("#e2d09e", "#baa670");
const TUNIC_GREEN = cel("#1a7342", "#0d4224");
const PALE_LINEN = cel("#fbf6e8", "#dcd0b8");
const SASH_MINT = cel("#3ae29f", "#1c8c5c");
const LEATHER_BROWN = cel("#764323", "#452412");
const DARK_LEATHER = cel("#382316", "#1c100a");
const TROUSERS_SLATE = cel("#25323a", "#141c22");
const GOLD_TRIM = cel("#f6cb42", "#a67e1a");
const MITHRIL_SILVER = cel("#e5effa", "#95a8bf");
const BOW_WOOD = cel("#4d2616", "#26110a");
const STONE_BASE = cel("#555d61", "#32393d");
const STONE_TOP = cel("#727c80", "#454f54");
const MOSS_GREEN = cel("#3a7536", "#1e461a");
const CYAN_GLOW = "#38f8d4";
const VINE_GREEN = cel("#2b6b28", "#153d13");

// ---------------------------------------------------------------------------------------------------------------
// SVG Drawings & Textures

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
  // 1. Skeleton Setup
  // -------------------------------------------------------------------------------------------------------------

  // Hips & Pelvis
  const hips = b.joint("hips", {
    at: [0, 0.94, 0.0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  // Spine & Chest
  const spinePts = [
    [0, 0.94, 0.0],
    [0, 1.1, -0.01],
    [0, 1.28, -0.015],
  ];
  const spineChain = b.chain("spine", spinePts, {
    parent: hips,
    names: ["spine", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spineChain.joints[1];

  // Neck, Head, Jaw
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.4, 0.0],
    dir: [0, 1, 0.06],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.5, 0.02],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.46, 0.045],
    dir: [0, -0.2, 0.5],
    role: "jaw",
    group: "head",
  });

  // Legs: Stable, grounded, natural posture
  const legChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt = [s * 0.11, 0.92, 0.0];
    const kneePt = [s * 0.12, 0.51, 0.02];
    const anklePt = [s * 0.13, daisFloorY + 0.07, -0.01];
    const toePt = [s * 0.13, daisFloorY + 0.025, 0.1];

    const leg = b.chain(`leg${side}`, [hipPt, kneePt, anklePt, toePt], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.13, daisFloorY, 0.05],
      group: "legs",
    });
    legChains[side] = leg;
  }

  // Arms: Left hand holds bow, Right hand rests poised near quiver
  const armChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shPt = [s * 0.17, 1.34, -0.01];
    const elPt = s > 0 ? [0.31, 1.12, 0.04] : [-0.28, 1.1, -0.02];
    const wrPt = s > 0 ? [0.43, 0.94, 0.08] : [-0.34, 0.92, 0.05];
    const hdPt = s > 0 ? [0.47, 0.88, 0.1] : [-0.36, 0.84, 0.08];

    const arm = b.chain(`arm${side}`, [shPt, elPt, wrPt, hdPt], {
      parent: chest,
      names: [
        `shoulder${side}`,
        `elbow${side}`,
        `wrist${side}`,
        `hand${side}`,
      ],
      role: "arm",
      group: "arms",
    });
    armChains[side] = arm;
  }

  // -------------------------------------------------------------------------------------------------------------
  // 2. Staged Dais Base & Monolith (Rooted at y = 0)
  // -------------------------------------------------------------------------------------------------------------

  // Tier 1 Base Foundation
  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.03, 30), STONE_BASE, {
    at: [0, 0.015, 0],
    bone: hips,
    group: "scenery",
  });
  // Tier 2 Upper Platform
  b.part(new THREE.CylinderGeometry(0.57, 0.61, 0.03, 30), STONE_TOP, {
    at: [0, 0.045, 0],
    bone: hips,
    group: "scenery",
  });
  // Inlaid Runic Circle
  b.part(new THREE.PlaneGeometry(1.08, 1.08), "#ffffff", {
    at: [0, daisFloorY + 0.001, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: ELF_RUNE_CIRCLE,
    bone: hips,
    group: "scenery",
  });

  // Ancient Elven Waystone Monolith
  b.frustumBox(
    [-0.34, daisFloorY, -0.32],
    [-0.34, daisFloorY + 0.46, -0.32],
    [0.14, 0.11],
    [0.08, 0.06],
    { bone: hips, color: STONE_BASE, group: "scenery" }
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.08, 4),
    STONE_TOP,
    { at: [-0.34, daisFloorY + 0.5, -0.32], rotation: [0, 45, 0], bone: hips, group: "scenery" }
  );
  // Glowing Rune Inscription
  makeGlow(
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
  // Ivy Tendrils
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

  // Bioluminescent Woodland Mushrooms
  const shrooms = [
    { pos: [-0.24, daisFloorY, -0.22], h: 0.08, r: 0.034, col: "#22f5c8" },
    { pos: [-0.28, daisFloorY, -0.16], h: 0.055, r: 0.024, col: "#38e0ff" },
    { pos: [-0.19, daisFloorY, -0.27], h: 0.042, r: 0.018, col: "#6df8ff" },
  ];
  for (const s of shrooms) {
    b.capsule(s.pos, [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]], 0.006, {
      bone: hips,
      color: PALE_LINEN,
      group: "scenery",
    });
    makeGlow(
      b.part(
        new THREE.SphereGeometry(s.r, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
        s.col,
        {
          at: [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]],
          scale: [1, 1.25, 1],
          bone: hips,
          group: "scenery",
        }
      ),
      1.8
    );
  }

  // Perimeter Fern Blades
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
  // 3. Fully Connected Legs, Greaves & High Ranger Boots
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    const toeJ = leg.joints[3];

    // Thighs (Midnight slate breeches)
    b.capsule(hipJ.at, kneeJ.at, [0.062, 0.048], {
      bone: hipJ,
      color: TROUSERS_SLATE,
      group: "legs",
    });

    // Leather Knee-Cop Guard (bridges thigh directly into shin)
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y + 0.025, kneeJ.at.z + 0.01],
      [kneeJ.at.x, kneeJ.at.y - 0.025, kneeJ.at.z + 0.01],
      0.048,
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.SphereGeometry(0.01, 8, 6),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y, kneeJ.at.z + 0.055], group: "legs" }
    );

    // Flared Boot Cuff (wraps over the knee transition)
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y + 0.01, kneeJ.at.z],
      [kneeJ.at.x, kneeJ.at.y - 0.06, kneeJ.at.z],
      [0.056, 0.048],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );
    // Gold trim band on boot cuff
    b.part(
      new THREE.CylinderGeometry(0.054, 0.054, 0.008, 16),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y + 0.005, kneeJ.at.z], group: "legs" }
    );

    // Calf & Lower Shin (running solidly from below knee to ankle)
    b.capsule(
      [kneeJ.at.x, kneeJ.at.y - 0.04, kneeJ.at.z],
      ankleJ.at,
      [0.048, 0.038],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );

    // Reinforced Archer Shin Plate
    b.frustumBox(
      [kneeJ.at.x, kneeJ.at.y - 0.08, kneeJ.at.z + 0.028],
      [ankleJ.at.x, ankleJ.at.y + 0.05, ankleJ.at.z + 0.025],
      [0.044, 0.014],
      [0.036, 0.012],
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.BoxGeometry(0.014, 0.07, 0.006),
      GOLD_TRIM,
      { bone: kneeJ, at: [kneeJ.at.x, kneeJ.at.y - 0.18, kneeJ.at.z + 0.038], group: "legs" }
    );

    // Boot Heel
    b.capsule(
      ankleJ.at,
      [ankleJ.at.x, daisFloorY + 0.035, ankleJ.at.z],
      0.032,
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    // Boot Instep & Tapered Toe
    b.frustumBox(
      [ankleJ.at.x, daisFloorY + 0.065, ankleJ.at.z - 0.01],
      toeJ.at,
      [0.062, 0.05],
      [0.045, 0.03],
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    // Gold buckle over instep
    b.part(
      new THREE.BoxGeometry(0.036, 0.012, 0.012),
      GOLD_TRIM,
      { bone: ankleJ, at: [ankleJ.at.x, daisFloorY + 0.045, ankleJ.at.z + 0.045], group: "legs" }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. Torso, Ranger Tunics, Belts, Tassets & Billowing Cloak
  // -------------------------------------------------------------------------------------------------------------

  // Pelvis Core
  b.frustumBox(
    [0, 0.98, 0],
    [0, 0.88, 0],
    [0.26, 0.19],
    [0.22, 0.17],
    { bone: hips, color: TUNIC_GREEN, group: "torso" }
  );

  // Scalloped Leather Tassets (Hip Armor Flaps)
  for (const s of [1, -1]) {
    // Front Flaps
    b.extrude(
      [
        [0, 0],
        [0.06, -0.13],
        [0.02, -0.17, "sharp"],
        [-0.04, -0.13],
      ],
      {
        at: [s * 0.06, 0.92, 0.09],
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
      { bone: hips, at: [s * 0.08, 0.75, 0.095], group: "torso" }
    );

    // Flank / Side Flaps
    b.extrude(
      [
        [0, 0],
        [0.065, -0.14],
        [0.025, -0.18, "sharp"],
        [-0.045, -0.14],
      ],
      {
        at: [s * 0.13, 0.92, 0],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.008,
        color: LEATHER_BROWN,
        bone: hips,
        group: "torso",
      }
    );
  }
  // Back Flap
  b.extrude(
    [
      [0, 0],
      [0.08, -0.15],
      [0.03, -0.19, "sharp"],
      [-0.05, -0.15],
    ],
    {
      at: [0, 0.92, -0.09],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: LEATHER_BROWN,
      bone: hips,
      group: "torso",
    }
  );

  // Emerald Silk Center Sash
  b.extrude(
    [
      [0, 0],
      [0.04, -0.02],
      [0.03, -0.22],
      [0, -0.26, "sharp"],
      [-0.03, -0.22],
      [-0.04, -0.02],
    ],
    {
      at: [0, 0.95, 0.1],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: SASH_MINT,
      bone: hips,
      group: "torso",
    }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.025, 4),
    GOLD_TRIM,
    { bone: hips, at: [0, 0.71, 0.105], rotation: [180, 0, 0], group: "torso" }
  );

  // Twin Ranger Belts
  b.sweep(
    catmull([
      [-0.14, 1.01, 0],
      [0, 1.01, 0.11],
      [0.14, 1.01, 0],
      [0, 1.01, -0.1],
      [-0.14, 1.01, 0],
    ]),
    0.014,
    { color: DARK_LEATHER, bone: hips, group: "torso" }
  );
  b.sweep(
    catmull([
      [-0.14, 0.95, 0],
      [0, 0.95, 0.11],
      [0.14, 0.95, 0],
      [0, 0.95, -0.1],
      [-0.14, 0.95, 0],
    ]),
    0.012,
    { color: LEATHER_BROWN, bone: hips, group: "torso" }
  );
  // Gold Leaf Belt Buckle
  b.part(
    new THREE.BoxGeometry(0.042, 0.03, 0.016),
    GOLD_TRIM,
    { bone: hips, at: [0, 1.01, 0.115], group: "torso" }
  );
  b.part(
    new THREE.ConeGeometry(0.01, 0.02, 5),
    TUNIC_GREEN,
    { bone: hips, at: [0, 1.01, 0.125], rotation: [180, 0, 0], group: "torso" }
  );

  // Right Hip Pouch
  b.part(
    new THREE.BoxGeometry(0.05, 0.065, 0.038),
    LEATHER_BROWN,
    { bone: hips, at: [-0.15, 0.96, 0.02], group: "torso" }
  );
  b.part(
    new THREE.SphereGeometry(0.006, 6, 4),
    GOLD_TRIM,
    { bone: hips, at: [-0.15, 0.95, 0.04], group: "torso" }
  );

  // Torso / Doublet (Emerald forest jerkin)
  b.loft(
    [
      { at: [0, 0.98, 0], w: 0.25, h: 0.18 },
      { at: [0, 1.1, -0.01], w: 0.23, h: 0.17 },
      { at: [0, 1.22, -0.01], w: 0.28, h: 0.2 },
      { at: [0, 1.34, -0.015], w: 0.32, h: 0.22 },
    ],
    { bone: [hips, spineChain.joints[0], chest], color: TUNIC_GREEN, group: "torso" }
  );

  // V-Neck Cream Linen Lapel Collar
  b.frustumBox(
    [0, 1.33, 0.06],
    [0, 1.39, 0.04],
    [0.12, 0.07],
    [0.16, 0.09],
    { bone: chest, color: PALE_LINEN, group: "torso" }
  );
  b.extrude(
    [
      [0, 0],
      [0.045, 0.05],
      [0.028, 0.05],
      [0, 0.018],
      [-0.028, 0.05],
      [-0.045, 0.05],
    ],
    {
      at: [0, 1.32, 0.098],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.005,
      color: GOLD_TRIM,
      bone: chest,
      group: "torso",
    }
  );

  // Tailored Leather Baldric Strap (holds quiver)
  b.sweep(
    catmull([
      [-0.14, 1.35, 0.08],
      [-0.02, 1.2, 0.105],
      [0.11, 1.04, 0.085],
    ]),
    () => [0.022, 0.005],
    { color: LEATHER_BROWN, bone: chest, group: "torso" }
  );
  // Gold Leaf Brooch Clasp with Glowing Gem
  b.part(
    new THREE.ConeGeometry(0.016, 0.034, 5),
    GOLD_TRIM,
    { bone: chest, at: [-0.02, 1.26, 0.112], rotation: [0, 0, 15], group: "torso" }
  );
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.007, 8, 6),
      CYAN_GLOW,
      { bone: chest, at: [-0.02, 1.26, 0.122], group: "torso" }
    ),
    2.2
  );

  // Asymmetrical Pauldrons:
  // Left Shoulder (Bow Arm): Tiered Leaf Pauldron
  const shL = armChains.L.joints[0];
  b.capsule(
    [0.16, 1.36, -0.01],
    [0.25, 1.33, -0.01],
    [0.05, 0.042],
    { bone: shL, color: TUNIC_GREEN, group: "armor" }
  );
  b.extrude(
    [
      [0, 0],
      [0.07, 0.03],
      [0.09, -0.03, "sharp"],
      [0.05, -0.07],
      [0, -0.04],
    ],
    {
      at: [0.18, 1.36, 0.03],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: GOLD_TRIM,
      bone: shL,
      group: "armor",
    }
  );
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.008, 8, 6),
      CYAN_GLOW,
      { bone: shL, at: [0.24, 1.34, 0.042], group: "armor" }
    ),
    1.8
  );

  // Right Shoulder (Drawing Arm): Sleek Contoured Leather Guard
  const shR = armChains.R.joints[0];
  b.capsule(
    [-0.15, 1.36, -0.01],
    [-0.24, 1.33, -0.01],
    [0.048, 0.04],
    { bone: shR, color: LEATHER_BROWN, group: "armor" }
  );
  b.part(
    new THREE.SphereGeometry(0.007, 6, 4),
    GOLD_TRIM,
    { bone: shR, at: [-0.21, 1.36, 0.025], group: "armor" }
  );

  // Flowing Elven Ranger Cloak
  for (const s of [1, -1]) {
    b.loft(
      [
        { at: [s * 0.13, 1.32, -0.08], w: 0.16, h: 0.02 },
        { at: [s * 0.16, 1.15, -0.12], w: 0.19, h: 0.02 },
        { at: [s * 0.19, 0.9, -0.15], w: 0.22, h: 0.02 },
        { at: [s * 0.22, 0.65, -0.17], w: 0.24, h: 0.02 },
      ],
      { bone: chest, color: TUNIC_GREEN, group: "cloak" }
    );
    b.part(
      new THREE.BoxGeometry(0.16, 0.012, 0.01),
      GOLD_TRIM,
      { bone: chest, at: [s * 0.22, 0.65, -0.17], group: "cloak" }
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

    // Upper Arm (Linen poet sleeve)
    b.capsule(shJ.at, elJ.at, [0.046, 0.04], {
      bone: shJ,
      color: PALE_LINEN,
      group: "arms",
    });
    b.part(
      new THREE.CylinderGeometry(0.042, 0.042, 0.012, 12),
      GOLD_TRIM,
      { bone: shJ, at: elJ.at, group: "arms" }
    );

    // Forearm & Bracer
    if (s > 0) {
      // Left Forearm: Reinforced Archer's Vambrace
      b.capsule(elJ.at, wrJ.at, [0.04, 0.032], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      // Gold bowstring strike guard plate
      b.frustumBox(
        [0.37, 1.04, 0.07],
        [0.42, 0.95, 0.08],
        [0.036, 0.012],
        [0.03, 0.01],
        { bone: elJ, color: GOLD_TRIM, group: "arms" }
      );
      b.part(
        new THREE.PlaneGeometry(0.038, 0.075),
        "#ffffff",
        {
          bone: elJ,
          at: [0.395, 0.995, 0.087],
          dir: [0.15, 0.1, 0.98],
          axis: "z",
          texture: LEAF_FILIGREE,
          group: "arms",
        }
      );
    } else {
      // Right Forearm: Contoured Leather Shooting Sleeve
      b.capsule(elJ.at, wrJ.at, [0.038, 0.03], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      b.part(
        new THREE.CylinderGeometry(0.032, 0.032, 0.018, 10),
        GOLD_TRIM,
        { bone: elJ, at: wrJ.at, group: "arms" }
      );
    }

    // Hands
    b.frustumBox(
      wrJ.at,
      hdJ.at,
      [0.038, 0.022],
      [0.034, 0.018],
      { bone: wrJ, color: SKIN, group: "arms" }
    );

    if (s > 0) {
      // Left hand grasping bow handle
      b.capsule(
        [0.46, 0.89, 0.09],
        [0.48, 0.85, 0.11],
        0.022,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
      b.capsule(
        [0.44, 0.89, 0.12],
        [0.46, 0.86, 0.13],
        0.01,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
    } else {
      // Right hand: Archer tab glove
      b.capsule(
        [-0.35, 0.85, 0.07],
        [-0.37, 0.81, 0.09],
        0.018,
        { bone: hdJ, color: LEATHER_BROWN, group: "arms" }
      );
      for (let f = 0; f < 3; f++) {
        b.capsule(
          [-0.35 + f * 0.01, 0.83, 0.08],
          [-0.36 + f * 0.01, 0.79, 0.1],
          0.007,
          { bone: hdJ, color: SKIN, group: "arms" }
        );
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. The Great Elven Recurve Bow
  // -------------------------------------------------------------------------------------------------------------

  const bowHand = armChains.L.joints[3];

  // Bow Center Grip
  b.capsule(
    [0.47, 0.95, 0.1],
    [0.47, 0.81, 0.1],
    0.017,
    { bone: bowHand, color: LEATHER_BROWN, group: "weapon" }
  );
  b.part(
    new THREE.CylinderGeometry(0.019, 0.019, 0.012, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.47, 0.94, 0.1], group: "weapon" }
  );
  b.part(
    new THREE.CylinderGeometry(0.019, 0.019, 0.012, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.47, 0.82, 0.1], group: "weapon" }
  );
  // Center Celestial Mana Crystal
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.011, 10, 8),
      CYAN_GLOW,
      { bone: bowHand, at: [0.47, 0.88, 0.12], group: "weapon" }
    ),
    2.2
  );

  // Upper Bow Limb
  const upperLimbPath = catmull([
    [0.47, 0.95, 0.1],
    [0.48, 1.16, 0.11],
    [0.5, 1.4, 0.08],
    [0.47, 1.6, 0.18],
    [0.44, 1.66, 0.24],
  ]);
  b.sweep(
    upperLimbPath,
    (t) => 0.016 * (1 - t * 0.52),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.04, 4),
    GOLD_TRIM,
    {
      bone: bowHand,
      at: [0.44, 1.66, 0.24],
      rotation: [45, 0, -20],
      group: "weapon",
    }
  );

  // Lower Bow Limb
  const lowerLimbPath = catmull([
    [0.47, 0.81, 0.1],
    [0.48, 0.6, 0.09],
    [0.5, 0.36, 0.06],
    [0.47, 0.18, 0.14],
    [0.44, 0.12, 0.2],
  ]);
  b.sweep(
    lowerLimbPath,
    (t) => 0.016 * (1 - t * 0.52),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.04, 4),
    GOLD_TRIM,
    {
      bone: bowHand,
      at: [0.44, 0.12, 0.2],
      rotation: [-135, 0, -20],
      group: "weapon",
    }
  );

  // Glowing Celestial Bowstring
  makeGlow(
    b.rod(
      [0.44, 1.66, 0.24],
      [0.44, 0.12, 0.2],
      0.002,
      CYAN_GLOW,
      { bone: bowHand, group: "weapon" }
    ),
    2.5
  );

  // -------------------------------------------------------------------------------------------------------------
  // 7. Enchanted Quiver & Fletched Arrows
  // -------------------------------------------------------------------------------------------------------------

  const quiverBottom = [0.08, 0.98, -0.14];
  const quiverTop = [-0.1, 1.38, -0.17];
  b.sweep(
    catmull([quiverBottom, [-0.01, 1.18, -0.155], quiverTop]),
    [0.036, 0.052],
    { bone: chest, color: DARK_LEATHER, group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.053, 0.053, 0.015, 14),
    GOLD_TRIM,
    { bone: chest, at: [-0.09, 1.36, -0.168], rotation: [0, 0, -20], group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.045, 0.045, 0.014, 14),
    GOLD_TRIM,
    { bone: chest, at: [0.0, 1.18, -0.155], rotation: [0, 0, -20], group: "quiver" }
  );

  // 5 Enchanted Arrows (Shafts rooted deep inside the quiver)
  const arrows = [
    { from: [-0.09, 1.25, -0.17], to: [-0.12, 1.54, -0.18] },
    { from: [-0.07, 1.25, -0.16], to: [-0.07, 1.58, -0.17] },
    { from: [-0.1, 1.25, -0.15], to: [-0.15, 1.52, -0.14] },
    { from: [-0.08, 1.25, -0.18], to: [-0.08, 1.6, -0.2] },
    { from: [-0.06, 1.25, -0.17], to: [-0.03, 1.56, -0.16] },
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
      makeGlow(
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
  // 8. Head & Expressive Anime Face
  // -------------------------------------------------------------------------------------------------------------

  b.capsule(neck.at, head.at, 0.044, { bone: neck, color: SKIN, group: "head" });

  // Anime Face Profile Loft (Wide temples tapering to delicate chin)
  const faceLoft = b.loft(
    [
      { at: [0, 1.62, 0.01], w: 0.16, h: 0.16 },
      { at: [0, 1.54, 0.03], w: 0.15, h: 0.15 },
      { at: [0, 1.48, 0.04], w: 0.11, h: 0.11 },
      { at: [0, 1.43, 0.05], w: 0.045, h: 0.045 },
    ],
    { bone: head, color: SKIN, group: "head" }
  );

  // Cranium Dome
  b.part(
    new THREE.SphereGeometry(0.082, 16, 12),
    SKIN,
    { bone: head, at: [0, 1.57, 0.01], scale: [0.96, 1.05, 1.0], group: "head" }
  );

  // Subtle Anime Nose Tip & Lip
  b.part(
    new THREE.ConeGeometry(0.006, 0.014, 4),
    SKIN,
    { bone: head, at: [0, 1.518, 0.108], rotation: [90, 0, 0], group: "head" }
  );
  b.part(
    new THREE.BoxGeometry(0.018, 0.003, 0.004),
    "#b8687a",
    { bone: jaw, at: [0, 1.47, 0.096], group: "head" }
  );

  // Expressive Anime Eyes
  for (const s of [1, -1]) {
    b.decal(faceLoft, ELF_EYE, {
      at: [s * 0.038, 1.542, 0.096],
      dir: [s * 0.2, 0.05, 0.98],
      size: [0.052, 0.062],
      mirror: s > 0,
      bone: head,
      group: "head",
    });

    // Delicate Blonde Eyebrows
    b.extrude(
      [
        [0, 0],
        [0.035, 0.006],
        [0.038, 0.003],
        [0.01, -0.004],
      ],
      {
        at: [s * 0.018, 1.58, 0.098],
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
  // 9. Signature Long Swept-Back Elven Ears & Celestial Earrings
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const earBase = [s * 0.07, 1.53, 0.01];
    const earMid = [s * 0.13, 1.57, -0.06];
    const earTip = [s * 0.2, 1.62, -0.14];

    // Elegant Tapered Ear Sweep
    b.sweep(
      catmull([earBase, earMid, earTip]),
      (t) => [0.028 * (1 - t * 0.78), 0.01 * (1 - t * 0.85)],
      { bone: head, color: SKIN, group: "ears" }
    );
    // Inner Ear Rosy Glow
    b.sweep(
      catmull([
        [s * 0.072, 1.53, 0.01],
        [s * 0.12, 1.565, -0.055],
        [s * 0.165, 1.6, -0.1],
      ]),
      (t) => [0.016 * (1 - t * 0.65), 0.005],
      { bone: head, color: SKIN_BLUSH, group: "ears" }
    );

    // Gold Ear Cuff
    b.part(
      new THREE.TorusGeometry(0.014, 0.0035, 8, 16),
      GOLD_TRIM,
      {
        bone: head,
        at: earMid,
        rotation: [30, s * -45, 0],
        group: "ears",
      }
    );
    // Dangling Celestial Drop Earring
    b.rod(
      [earMid[0], earMid[1] - 0.01, earMid[2]],
      [earMid[0], earMid[1] - 0.024, earMid[2]],
      0.002,
      GOLD_TRIM,
      { bone: head, group: "ears" }
    );
    makeGlow(
      b.part(
        new THREE.OctahedronGeometry(0.008, 0),
        CYAN_GLOW,
        {
          bone: head,
          at: [earMid[0], earMid[1] - 0.032, earMid[2]],
          scale: [0.8, 1.35, 0.8],
          group: "ears",
        }
      ),
      2.0
    );
  }

  // Golden Tiara Circlet
  b.sweep(
    catmull([
      [-0.078, 1.59, 0.01],
      [-0.048, 1.6, 0.082],
      [0, 1.6, 0.102],
      [0.048, 1.6, 0.082],
      [0.078, 1.59, 0.01],
    ]),
    0.004,
    { color: GOLD_TRIM, bone: head, group: "head" }
  );
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.007, 8, 6),
      CYAN_GLOW,
      { bone: head, at: [0, 1.6, 0.108], group: "head" }
    ),
    2.2
  );

  // -------------------------------------------------------------------------------------------------------------
  // 10. Platinum Hair, Layered Bangs & Flowing Ponytail
  // -------------------------------------------------------------------------------------------------------------

  // Base Cranial Hair Volume
  b.part(
    new THREE.SphereGeometry(0.09, 16, 12),
    HAIR_BASE,
    { bone: head, at: [0, 1.58, 0.0], scale: [0.98, 1.06, 1.04], group: "hair" }
  );

  // Layered Anime Forehead Bangs
  b.extrude(
    [
      [0, 0],
      [0.018, -0.05],
      [0, -0.075, "sharp"],
      [-0.016, -0.045],
    ],
    {
      at: [0, 1.63, 0.086],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      color: HAIR_BASE,
      bone: head,
      group: "hair",
    }
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [s * 0.03, -0.045],
        [s * 0.012, -0.07, "sharp"],
        [-s * 0.018, -0.035],
      ],
      {
        at: [s * 0.035, 1.62, 0.08],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: HAIR_BASE,
        bone: head,
        group: "hair",
      }
    );

    // Long Face-Framing Tendrils with Gold Ring Beads
    const tendril = catmull([
      [s * 0.072, 1.58, 0.03],
      [s * 0.078, 1.48, 0.055],
      [s * 0.074, 1.38, 0.07],
      [s * 0.07, 1.28, 0.07],
    ]);
    b.sweep(
      tendril,
      (t) => 0.011 * (1 - t * 0.5),
      { bone: head, color: HAIR_BASE, group: "hair" }
    );
    b.part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.01, 10),
      GOLD_TRIM,
      { bone: head, at: [s * 0.076, 1.45, 0.06], group: "hair" }
    );
  }

  // High Ponytail Clasp Ring
  const claspPos = [0, 1.63, -0.07];
  b.part(
    new THREE.TorusGeometry(0.028, 0.007, 8, 16),
    GOLD_TRIM,
    { bone: head, at: claspPos, rotation: [60, 0, 0], group: "hair" }
  );

  // Cascading Ponytail S-Curve
  const ponyPts = [
    [0, 1.63, -0.07],
    [0, 1.52, -0.15],
    [0.025, 1.38, -0.19],
    [-0.02, 1.22, -0.21],
    [0, 1.06, -0.18],
    [0.01, 0.92, -0.15],
  ];
  b.sweep(
    catmull(ponyPts),
    (t) => 0.038 * (1 - t * 0.75),
    { bone: head, color: HAIR_BASE, group: "hair" }
  );

  // Outer Layered Hair Flakes for Rich Anime Volume
  for (let p = 0; p < 4; p++) {
    const ang = (p * 90 * Math.PI) / 180;
    const px = Math.cos(ang) * 0.024;
    const pz = Math.sin(ang) * 0.024;
    b.sweep(
      catmull([
        [claspPos[0] + px, claspPos[1], claspPos[2] + pz],
        [claspPos[0] + px * 1.3, claspPos[1] - 0.14, claspPos[2] + pz * 1.3 - 0.05],
        [claspPos[0] + px * 0.8, claspPos[1] - 0.3, claspPos[2] + pz * 0.8 - 0.11],
      ]),
      (t) => 0.018 * (1 - t * 0.78),
      { bone: head, color: p % 2 === 0 ? HAIR_BASE : HAIR_SHADOW, group: "hair" }
    );
  }

  return b.root;
}
