```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  svg,
  rgb,
  mix,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "A high-fantasy anime elven archer in woodland ranger garb, with long swept-back ears, flowing platinum ponytail, celestial eyes, a carved recurve bow, enchanted quiver, and a mossy runic dais.",
};

// ---------------------------------------------------------------------------------------------------------------
// Shaders & Utilities

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
    : ([litRgb[0] * 0.62, litRgb[1] * 0.58, litRgb[2] * 0.7] as const);
  return paint((_p, n) => (n.dot(L) > 0.12 ? litRgb : shadRgb));
}

function makeGlow<
  T extends
    | { mesh?: THREE.Mesh; meshes?: readonly THREE.Mesh[] }
    | THREE.Mesh
>(target: T, strength = 1.6): T {
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
// Color Palette (High-Fantasy Woodland Elven)

const SKIN = cel("#ffeade", "#f0bea2");
const SKIN_BLUSH = "#ffa8ba";
const HAIR_BASE = cel("#fffbe8", "#d8c79a");
const HAIR_SHADOW = cel("#e2d09e", "#bda974");
const TUNIC_GREEN = cel("#1a7342", "#0d4224");
const PALE_LINEN = cel("#fbf6e8", "#dcd0b8");
const SASH_MINT = cel("#3ae29f", "#1c8c5c");
const LEATHER_BROWN = cel("#764323", "#452412");
const DARK_LEATHER = cel("#382316", "#1c100a");
const TROUSERS_SLATE = cel("#25323a", "#141c22");
const GOLD_TRIM = cel("#f6cb42", "#a67e1a");
const MITHRIL_SILVER = cel("#e5effa", "#95a8bf");
const BOW_WOOD = cel("#4d2616", "#26110a");
const STONE_BASE = cel("#5a6265", "#353c40");
const STONE_TOP = cel("#757e82", "#485256");
const MOSS_GREEN = cel("#3a7536", "#1e461a");
const CYAN_GLOW = "#38f8d4";
const WHITE_GLOW = "#ffffff";
const VINE_GREEN = cel("#2b6b28", "#153d13");

// ---------------------------------------------------------------------------------------------------------------
// Custom SVG Textures

const ELF_EYE = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 65 Q 35 24 85 45 Q 96 38 99 24 Q 93 48 83 58 Q 50 48 18 70 Z" fill="#180e22"/>
    <path d="M 85 45 Q 95 34 99 22" stroke="#180e22" stroke-width="4.8" stroke-linecap="round" fill="none"/>
    <path d="M 82 55 Q 93 52 97 45" stroke="#180e22" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M 18 68 Q 45 34 80 56 Q 75 90 48 95 Q 22 92 18 68 Z" fill="#f8fbff"/>
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
    <ellipse cx="39" cy="53" rx="9" ry="12" fill="#ffffff"/>
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
    <g stroke="#d8b240" stroke-width="2.8" stroke-linecap="round" fill="none">
      <path d="M 256 22 L 256 38 M 250 26 L 262 34 M 250 34 L 262 26"/>
      <path d="M 256 474 L 256 490 M 250 478 L 262 486"/>
      <path d="M 22 256 L 38 256 M 26 250 L 34 262"/>
      <path d="M 474 256 L 490 256 M 478 250 L 486 262"/>
      <path d="M 90 90 L 102 102 M 92 100 L 100 92"/>
      <path d="M 410 90 L 422 102 M 412 100 L 420 92"/>
      <path d="M 90 410 L 102 422 M 92 420 L 100 412"/>
      <path d="M 410 410 L 422 422 M 412 420 L 420 412"/>
    </g>
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
  const b = createBuilder({ name: "elven_ranger_archer", detail: 1.1 });

  // 1. Staged Dais Base & Setting (Resting squarely on y = 0)
  // -------------------------------------------------------------------------------------------------------------
  const baseBottomY = 0.015;
  const baseTopY = 0.045;
  const daisFloorY = 0.06; // Standing ground for archer's boots

  // Dais Tier 1 (Bottom foundation)
  b.part(new THREE.CylinderGeometry(0.64, 0.68, 0.03, 28), STONE_BASE, {
    at: [0, baseBottomY, 0],
    group: "scenery",
  });
  // Dais Tier 2 (Upper runic dais)
  b.part(new THREE.CylinderGeometry(0.57, 0.6, 0.03, 28), STONE_TOP, {
    at: [0, baseTopY, 0],
    group: "scenery",
  });
  // Carved elven runic circle decal on top of dais
  b.part(new THREE.PlaneGeometry(1.08, 1.08), "#ffffff", {
    at: [0, daisFloorY + 0.001, 0],
    dir: [0, 1, 0],
    axis: "z",
    texture: ELF_RUNE_CIRCLE,
    group: "scenery",
  });

  // Ancient elven waypoint stone monolith behind the archer
  const obeliskAt = [-0.34, daisFloorY + 0.22, -0.32];
  b.frustumBox(
    [-0.34, daisFloorY, -0.32],
    [-0.34, daisFloorY + 0.44, -0.32],
    [0.15, 0.12],
    [0.08, 0.06],
    { color: STONE_BASE, group: "scenery" }
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.08, 4),
    STONE_TOP,
    { at: [-0.34, daisFloorY + 0.48, -0.32], rotation: [0, 45, 0], group: "scenery" }
  );
  // Glowing rune glyph on monolith front face
  makeGlow(
    b.part(new THREE.PlaneGeometry(0.08, 0.16), "#ffffff", {
      at: [-0.338, daisFloorY + 0.24, -0.258],
      dir: [0.18, 0, 0.98],
      axis: "z",
      texture: RUNIC_GLYPH,
      group: "scenery",
    }),
    2.0
  );
  // Ivy vines coiling around the stone
  b.sweep(
    catmull([
      [-0.38, daisFloorY + 0.02, -0.27],
      [-0.29, daisFloorY + 0.12, -0.26],
      [-0.38, daisFloorY + 0.22, -0.36],
      [-0.3, daisFloorY + 0.32, -0.33],
      [-0.35, daisFloorY + 0.42, -0.29],
    ]),
    0.006,
    { color: VINE_GREEN, group: "scenery" }
  );

  // Glowing fairy nightcaps (magic mushrooms) beside the obelisk
  const shrooms = [
    { pos: [-0.24, daisFloorY, -0.22], h: 0.09, r: 0.038, col: "#22f5c8" },
    { pos: [-0.28, daisFloorY, -0.16], h: 0.06, r: 0.026, col: "#38e0ff" },
    { pos: [-0.19, daisFloorY, -0.27], h: 0.045, r: 0.02, col: "#6df8ff" },
  ];
  for (const s of shrooms) {
    b.capsule(s.pos, [s.pos[0], s.pos[1] + s.h * 0.7, s.pos[2]], 0.007, {
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
          group: "scenery",
        }
      ),
      1.8
    );
  }

  // Clumps of elven fern fronds & scattered leaves
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180;
    const fx = Math.cos(angle) * 0.48;
    const fz = Math.sin(angle) * 0.48;
    b.extrude(
      [
        [0, 0],
        [0.03, 0.08],
        [0.015, 0.14],
        [0, 0.18],
        [-0.015, 0.14],
        [-0.03, 0.08],
      ],
      {
        at: [fx, daisFloorY, fz],
        x: [Math.cos(angle), 0, Math.sin(angle)],
        y: [0, 1, 0],
        thickness: 0.004,
        color: MOSS_GREEN,
        group: "scenery",
      }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 2. Skeletal Rig Setup
  // -------------------------------------------------------------------------------------------------------------

  // Root joint: Pelvis / Hips
  const hips = b.joint("hips", {
    at: [0, 0.94, 0.0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  // Spine & Torso joints
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
    dir: [0, 1, 0.08],
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
    at: [0, 1.47, 0.05],
    dir: [0, -0.15, 0.4],
    role: "jaw",
    group: "head",
  });

  // Leg IK Setup: Left (+X) and Right (-X) legs standing gracefully on dais floor
  const legChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos = [s * 0.11, 0.93, 0.0];
    const anklePos = [s * 0.14, daisFloorY + 0.07, s * -0.01];
    const toePos = [s * 0.14, daisFloorY + 0.02, 0.11];

    // limb IK solve for knee position
    const pts = limb(hipPos, anklePos, [0.44, 0.4], [0, 0, 1]);
    pts.push(new THREE.Vector3(...toePos));

    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
      role: "leg",
      contact: [s * 0.14, daisFloorY, 0.06],
      group: "legs",
    });
    legChains[side] = leg;
  }

  // Arm Setup: Noble archer A-pose
  // Left arm holds the Great Elven Bow; Right arm is poised near hip/quiver
  const armChains: Record<string, any> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPos = [s * 0.17, 1.34, -0.02];
    const wristPos = s > 0 ? [0.42, 0.96, 0.08] : [-0.38, 0.94, 0.04];
    const handPos = s > 0 ? [0.48, 0.88, 0.1] : [-0.44, 0.86, 0.06];

    const armPts = limb(shoulderPos, wristPos, [0.28, 0.26], [s * 0.15, 0, -1]);
    armPts.push(new THREE.Vector3(...handPos));

    const arm = b.chain(`arm${side}`, armPts, {
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
  // 3. Lower Body: Breeches, High Ranger Boots & Greaves
  // -------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];

    // Thighs (slate charcoal fitted hunter breeches)
    b.capsule(hipJ.at, kneeJ.at, [0.064, 0.05], {
      bone: hipJ,
      color: TROUSERS_SLATE,
      group: "legs",
    });

    // Knee-cop / Leather knee guard
    b.capsule(
      kneeJ.local([0, -0.02, 0.02]),
      kneeJ.local([0, 0.02, 0.02]),
      0.044,
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.SphereGeometry(0.01, 8, 6),
      GOLD_TRIM,
      { bone: kneeJ, at: kneeJ.local([0, 0, 0.055]), group: "legs" }
    );

    // Boot flared top cuff at knee
    b.frustumBox(
      [s * 0.14, daisFloorY + 0.44, 0],
      [s * 0.14, daisFloorY + 0.38, 0],
      [0.105, 0.11],
      [0.085, 0.09],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );
    // Gold filigree piping along boot cuff rim
    b.part(
      new THREE.CylinderGeometry(0.052, 0.052, 0.01, 16),
      GOLD_TRIM,
      { bone: kneeJ, at: [s * 0.14, daisFloorY + 0.435, 0], group: "legs" }
    );

    // Boot Calf
    b.capsule(
      [s * 0.14, daisFloorY + 0.4, 0],
      [s * 0.14, daisFloorY + 0.12, 0],
      [0.046, 0.038],
      { bone: kneeJ, color: DARK_LEATHER, group: "legs" }
    );

    // Reinforced archer shin greave
    b.frustumBox(
      [s * 0.14, daisFloorY + 0.36, 0.028],
      [s * 0.14, daisFloorY + 0.14, 0.024],
      [0.046, 0.015],
      [0.038, 0.012],
      { bone: kneeJ, color: LEATHER_BROWN, group: "legs" }
    );
    b.part(
      new THREE.BoxGeometry(0.016, 0.08, 0.006),
      GOLD_TRIM,
      { bone: kneeJ, at: [s * 0.14, daisFloorY + 0.25, 0.038], group: "legs" }
    );

    // Boot Foot: Heel and Tapered Instep
    b.capsule(
      [s * 0.14, daisFloorY + 0.1, -0.02],
      [s * 0.14, daisFloorY + 0.035, -0.02],
      0.032,
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    b.frustumBox(
      [s * 0.14, daisFloorY + 0.07, -0.01],
      [s * 0.14, daisFloorY + 0.035, 0.1],
      [0.065, 0.055],
      [0.048, 0.032],
      { bone: ankleJ, color: DARK_LEATHER, group: "legs" }
    );
    // Gold archer buckle across the instep
    b.part(
      new THREE.BoxGeometry(0.038, 0.014, 0.012),
      GOLD_TRIM,
      { bone: ankleJ, at: [s * 0.14, daisFloorY + 0.05, 0.04], group: "legs" }
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // 4. Torso, Ranger Tunic, Belt, Tassets & Cloak
  // -------------------------------------------------------------------------------------------------------------

  // Hips & Pelvis core
  b.frustumBox(
    [0, 0.98, 0],
    [0, 0.88, 0],
    [0.26, 0.19],
    [0.22, 0.17],
    { bone: hips, color: TUNIC_GREEN, group: "torso" }
  );

  // Scalloped Elven Tassets (Layered leather skirt flaps over the hips)
  for (const s of [1, -1]) {
    // Front flaps
    b.extrude(
      [
        [0, 0],
        [0.065, -0.14],
        [0.025, -0.18, "sharp"],
        [-0.045, -0.14],
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
    // Gold edge border on front tassets
    b.part(
      new THREE.SphereGeometry(0.007, 6, 4),
      GOLD_TRIM,
      { bone: hips, at: [s * 0.085, 0.74, 0.095], group: "torso" }
    );

    // Flank / side flaps
    b.extrude(
      [
        [0, 0],
        [0.07, -0.15],
        [0.03, -0.19, "sharp"],
        [-0.05, -0.15],
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
  // Back tasset
  b.extrude(
    [
      [0, 0],
      [0.08, -0.16],
      [0.03, -0.21, "sharp"],
      [-0.06, -0.16],
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

  // Center emerald & silk sash hanging between the front tassets
  b.extrude(
    [
      [0, 0],
      [0.045, -0.02],
      [0.035, -0.22],
      [0, -0.26, "sharp"],
      [-0.035, -0.22],
      [-0.045, -0.02],
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
  // Gold embroidery drop on sash
  b.part(
    new THREE.ConeGeometry(0.014, 0.03, 4),
    GOLD_TRIM,
    { bone: hips, at: [0, 0.71, 0.105], rotation: [180, 0, 0], group: "torso" }
  );

  // Double Ranger Belts
  b.sweep(
    catmull([
      [-0.14, 1.01, 0],
      [0, 1.01, 0.11],
      [0.14, 1.01, 0],
      [0, 1.01, -0.1],
      [-0.14, 1.01, 0],
    ]),
    0.016,
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
    0.014,
    { color: LEATHER_BROWN, bone: hips, group: "torso" }
  );
  // Golden leaf belt buckle
  b.part(
    new THREE.BoxGeometry(0.048, 0.036, 0.018),
    GOLD_TRIM,
    { bone: hips, at: [0, 1.01, 0.115], group: "torso" }
  );
  b.part(
    new THREE.ConeGeometry(0.012, 0.022, 5),
    TUNIC_GREEN,
    { bone: hips, at: [0, 1.01, 0.126], rotation: [180, 0, 0], group: "torso" }
  );

  // Leather archer's pouch on right hip
  b.part(
    new THREE.BoxGeometry(0.054, 0.068, 0.04),
    LEATHER_BROWN,
    { bone: hips, at: [-0.15, 0.96, 0.02], group: "torso" }
  );
  b.part(
    new THREE.SphereGeometry(0.007, 8, 6),
    GOLD_TRIM,
    { bone: hips, at: [-0.15, 0.95, 0.042], group: "torso" }
  );

  // Torso / Doublet (Emerald green jerkin)
  b.loft(
    [
      { at: [0, 0.98, 0], w: 0.25, h: 0.18 },
      { at: [0, 1.1, -0.01], w: 0.23, h: 0.17 },
      { at: [0, 1.22, -0.01], w: 0.28, h: 0.2 },
      { at: [0, 1.34, -0.015], w: 0.32, h: 0.22 },
    ],
    { bone: [hips, spineChain.joints[0], chest], color: TUNIC_GREEN, group: "torso" }
  );

  // V-Neck cream linen undershirt and collar
  b.frustumBox(
    [0, 1.33, 0.06],
    [0, 1.39, 0.04],
    [0.12, 0.08],
    [0.16, 0.1],
    { bone: chest, color: PALE_LINEN, group: "torso" }
  );
  b.extrude(
    [
      [0, 0],
      [0.05, 0.06],
      [0.03, 0.06],
      [0, 0.02],
      [-0.03, 0.06],
      [-0.05, 0.06],
    ],
    {
      at: [0, 1.32, 0.1],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.005,
      color: GOLD_TRIM,
      bone: chest,
      group: "torso",
    }
  );

  // Diagonal Leather Baldric Harness (holds quiver)
  b.sweep(
    catmull([
      [-0.15, 1.34, 0.09],
      [-0.02, 1.2, 0.11],
      [0.12, 1.04, 0.09],
    ]),
    0.018,
    { color: LEATHER_BROWN, bone: chest, group: "torso" }
  );
  // Gold brooch clasp at collarbone (Lórien leaf brooch)
  b.part(
    new THREE.ConeGeometry(0.018, 0.038, 5),
    GOLD_TRIM,
    { bone: chest, at: [-0.02, 1.28, 0.115], rotation: [0, 0, 15], group: "torso" }
  );
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.008, 8, 6),
      CYAN_GLOW,
      { bone: chest, at: [-0.02, 1.28, 0.126], group: "torso" }
    ),
    2.0
  );

  // Asymmetrical Pauldrons:
  // Left Shoulder (Bow Arm): Tiered sculpted leaf pauldron
  const shL = armChains.L.joints[0];
  b.frustumBox(
    [0.16, 1.36, -0.02],
    [0.26, 1.32, -0.02],
    [0.09, 0.13],
    [0.07, 0.1],
    { bone: shL, color: TUNIC_GREEN, group: "armor" }
  );
  b.extrude(
    [
      [0, 0],
      [0.08, 0.04],
      [0.11, -0.03, "sharp"],
      [0.06, -0.08],
      [0, -0.05],
    ],
    {
      at: [0.18, 1.36, 0.04],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: GOLD_TRIM,
      bone: shL,
      group: "armor",
    }
  );
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.009, 8, 6),
      CYAN_GLOW,
      { bone: shL, at: [0.24, 1.34, 0.05], group: "armor" }
    ),
    1.8
  );

  // Right Shoulder (Drawing Arm): Sleek leather guard with gold studs
  const shR = armChains.R.joints[0];
  b.capsule(
    [-0.15, 1.36, -0.02],
    [-0.24, 1.32, -0.02],
    0.05,
    { bone: shR, color: LEATHER_BROWN, group: "armor" }
  );
  b.part(
    new THREE.SphereGeometry(0.008, 6, 4),
    GOLD_TRIM,
    { bone: shR, at: [-0.21, 1.36, 0.02], group: "armor" }
  );

  // Flowing Elven Ranger Cloak (Split swallowtail hem behind back)
  for (const s of [1, -1]) {
    b.loft(
      [
        { at: [s * 0.13, 1.32, -0.08], w: 0.16, h: 0.02 },
        { at: [s * 0.16, 1.15, -0.12], w: 0.2, h: 0.02 },
        { at: [s * 0.2, 0.9, -0.15], w: 0.24, h: 0.02 },
        { at: [s * 0.23, 0.65, -0.17], w: 0.26, h: 0.02 },
      ],
      { bone: chest, color: TUNIC_GREEN, group: "cloak" }
    );
    // Gold trim band at cloak hem
    b.part(
      new THREE.BoxGeometry(0.18, 0.014, 0.012),
      GOLD_TRIM,
      { bone: chest, at: [s * 0.23, 0.65, -0.17], group: "cloak" }
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

    // Bicep (Linen poet sleeve with green cuff)
    b.capsule(shJ.at, elJ.at, [0.048, 0.042], {
      bone: shJ,
      color: PALE_LINEN,
      group: "arms",
    });
    b.part(
      new THREE.CylinderGeometry(0.044, 0.044, 0.012, 12),
      GOLD_TRIM,
      { bone: shJ, at: elJ.at, group: "arms" }
    );

    // Elbow pad
    b.part(
      new THREE.SphereGeometry(0.03, 8, 6),
      LEATHER_BROWN,
      { bone: elJ, at: elJ.at, group: "arms" }
    );

    if (s > 0) {
      // Left Forearm (Bow Arm): Reinforced Archer's Vambrace (Inner arm guard)
      b.capsule(elJ.at, wrJ.at, [0.04, 0.032], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      // Gold strike plate (prevents bowstring snap damage)
      b.frustumBox(
        [0.37, 1.04, 0.07],
        [0.42, 0.95, 0.08],
        [0.038, 0.012],
        [0.032, 0.01],
        { bone: elJ, color: GOLD_TRIM, group: "arms" }
      );
      // Embossed leaf glyph on bracer
      b.part(
        new THREE.PlaneGeometry(0.04, 0.08),
        "#ffffff",
        {
          bone: elJ,
          at: [0.395, 0.995, 0.088],
          dir: [0.15, 0.1, 0.98],
          axis: "z",
          texture: LEAF_FILIGREE,
          group: "arms",
        }
      );
    } else {
      // Right Forearm (Drawing Arm): Sleek leather bracer
      b.capsule(elJ.at, wrJ.at, [0.038, 0.03], {
        bone: elJ,
        color: LEATHER_BROWN,
        group: "arms",
      });
      b.part(
        new THREE.CylinderGeometry(0.033, 0.033, 0.02, 10),
        GOLD_TRIM,
        { bone: elJ, at: wrJ.at, group: "arms" }
      );
    }

    // Hands
    b.frustumBox(
      wrJ.at,
      hdJ.at,
      [0.042, 0.024],
      [0.038, 0.02],
      { bone: wrJ, color: SKIN, group: "arms" }
    );

    if (s > 0) {
      // Left hand grip wrapped around bow riser
      b.capsule(
        [0.47, 0.89, 0.09],
        [0.49, 0.85, 0.11],
        0.024,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
      // Thumb folded across grip
      b.capsule(
        [0.45, 0.89, 0.12],
        [0.47, 0.86, 0.13],
        0.011,
        { bone: hdJ, color: SKIN, group: "arms" }
      );
    } else {
      // Right hand: Three-finger archer's shooting tab glove
      b.capsule(
        [-0.43, 0.87, 0.06],
        [-0.45, 0.83, 0.08],
        0.018,
        { bone: hdJ, color: LEATHER_BROWN, group: "arms" }
      );
      // Fingers poised to draw
      for (let f = 0; f < 3; f++) {
        b.capsule(
          [-0.43 + f * 0.01, 0.84, 0.07],
          [-0.44 + f * 0.01, 0.8, 0.09],
          0.007,
          { bone: hdJ, color: SKIN, group: "arms" }
        );
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // 6. The Great Elven Recurve Bow ("Astraea's Whisper")
  // -------------------------------------------------------------------------------------------------------------

  const bowHand = armChains.L.joints[3];
  const bowCenter = [0.48, 0.88, 0.1];

  // Bow Riser / Center Grip (Mounted in Left Hand)
  b.capsule(
    [0.48, 0.96, 0.1],
    [0.48, 0.8, 0.1],
    0.018,
    { bone: bowHand, color: LEATHER_BROWN, group: "weapon" }
  );
  // Gold ferrules framing the grip
  b.part(
    new THREE.CylinderGeometry(0.021, 0.021, 0.014, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.48, 0.95, 0.1], group: "weapon" }
  );
  b.part(
    new THREE.CylinderGeometry(0.021, 0.021, 0.014, 12),
    GOLD_TRIM,
    { bone: bowHand, at: [0.48, 0.81, 0.1], group: "weapon" }
  );
  // Central celestial mana crystal cabochon
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.012, 10, 8),
      CYAN_GLOW,
      { bone: bowHand, at: [0.48, 0.88, 0.122], group: "weapon" }
    ),
    2.2
  );

  // Upper Bow Limb (Sweeps up, outward, then recurves back in a graceful wing)
  const upperLimbPath = catmull([
    [0.48, 0.96, 0.1],
    [0.49, 1.18, 0.11],
    [0.51, 1.42, 0.08],
    [0.48, 1.62, 0.18],
    [0.45, 1.67, 0.24],
  ]);
  b.sweep(
    upperLimbPath,
    (t) => 0.018 * (1 - t * 0.55),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  // Golden filigree back reinforcement & leaf nock
  b.part(
    new THREE.ConeGeometry(0.014, 0.045, 4),
    GOLD_TRIM,
    {
      bone: bowHand,
      at: [0.45, 1.67, 0.24],
      rotation: [45, 0, -20],
      group: "weapon",
    }
  );
  // Gold leaf vane extension on upper limb
  b.extrude(
    [
      [0, 0],
      [0.05, 0.04],
      [0.08, 0.02],
      [0.04, -0.02],
    ],
    {
      at: [0.5, 1.35, 0.09],
      thickness: 0.006,
      color: GOLD_TRIM,
      bone: bowHand,
      group: "weapon",
    }
  );

  // Lower Bow Limb (Sweeps down, outward, then recurves back)
  const lowerLimbPath = catmull([
    [0.48, 0.8, 0.1],
    [0.49, 0.58, 0.09],
    [0.51, 0.34, 0.06],
    [0.48, 0.16, 0.14],
    [0.45, 0.11, 0.2],
  ]);
  b.sweep(
    lowerLimbPath,
    (t) => 0.018 * (1 - t * 0.55),
    { bone: bowHand, color: BOW_WOOD, group: "weapon" }
  );
  // Lower golden leaf nock
  b.part(
    new THREE.ConeGeometry(0.014, 0.045, 4),
    GOLD_TRIM,
    {
      bone: bowHand,
      at: [0.45, 0.11, 0.2],
      rotation: [-135, 0, -20],
      group: "weapon",
    }
  );
  // Gold leaf vane on lower limb
  b.extrude(
    [
      [0, 0],
      [0.05, -0.04],
      [0.08, -0.02],
      [0.04, 0.02],
    ],
    {
      at: [0.5, 0.45, 0.07],
      thickness: 0.006,
      color: GOLD_TRIM,
      bone: bowHand,
      group: "weapon",
    }
  );

  // Ethereal Glowing Bowstring (Taut celestial mana line)
  makeGlow(
    b.rod(
      [0.45, 1.67, 0.24],
      [0.45, 0.11, 0.2],
      0.002,
      CYAN_GLOW,
      { bone: bowHand, group: "weapon" }
    ),
    2.4
  );

  // -------------------------------------------------------------------------------------------------------------
  // 7. Enchanted Quiver & Fletched Arrows
  // -------------------------------------------------------------------------------------------------------------

  // Quiver Body (Slung diagonally across the back)
  const quiverBottom = [0.08, 0.96, -0.15];
  const quiverTop = [-0.1, 1.38, -0.18];
  b.sweep(
    catmull([quiverBottom, [-0.01, 1.17, -0.165], quiverTop]),
    [0.038, 0.054],
    { bone: chest, color: DARK_LEATHER, group: "quiver" }
  );
  // Gold filigree bands on quiver
  b.part(
    new THREE.CylinderGeometry(0.055, 0.055, 0.016, 14),
    GOLD_TRIM,
    { bone: chest, at: [-0.09, 1.36, -0.178], rotation: [0, 0, -20], group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.046, 0.046, 0.014, 14),
    GOLD_TRIM,
    { bone: chest, at: [0.0, 1.17, -0.165], rotation: [0, 0, -20], group: "quiver" }
  );
  b.part(
    new THREE.CylinderGeometry(0.04, 0.04, 0.016, 12),
    GOLD_TRIM,
    { bone: chest, at: [0.07, 0.98, -0.152], rotation: [0, 0, -20], group: "quiver" }
  );
  // Carved leaf crest on quiver center
  b.part(
    new THREE.PlaneGeometry(0.07, 0.12),
    "#ffffff",
    {
      bone: chest,
      at: [-0.01, 1.18, -0.21],
      dir: [0, 0, -1],
      axis: "z",
      texture: LEAF_FILIGREE,
      group: "quiver",
    }
  );

  // 5 Enchanted Arrows protruding from the quiver opening
  const arrows = [
    { from: [-0.1, 1.38, -0.18], to: [-0.13, 1.58, -0.19] },
    { from: [-0.08, 1.38, -0.17], to: [-0.07, 1.63, -0.18] },
    { from: [-0.11, 1.38, -0.16], to: [-0.16, 1.56, -0.15] },
    { from: [-0.09, 1.38, -0.19], to: [-0.09, 1.65, -0.21] },
    { from: [-0.07, 1.38, -0.18], to: [-0.03, 1.6, -0.17] },
  ];
  for (const arr of arrows) {
    // Silver birch arrow shaft
    b.rod(arr.from, arr.to, 0.005, MITHRIL_SILVER, { bone: chest, group: "quiver" });
    // Golden nock
    b.capsule(arr.to, [arr.to[0], arr.to[1] + 0.015, arr.to[2]], 0.006, {
      color: GOLD_TRIM,
      bone: chest,
      group: "quiver",
    });

    // 3 glowing cyan feather fletching vanes at 120-degree intervals
    for (let f = 0; f < 3; f++) {
      const a = (f * 120 * Math.PI) / 180;
      const vx = Math.cos(a) * 0.016;
      const vz = Math.sin(a) * 0.016;
      makeGlow(
        b.extrude(
          [
            [0, 0],
            [0.018, 0.015],
            [0.014, 0.055],
            [0, 0.05],
          ],
          {
            at: [arr.to[0] + vx, arr.to[1] - 0.05, arr.to[2] + vz],
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
  // 8. Neck, Head & The Expressive Anime Face
  // -------------------------------------------------------------------------------------------------------------

  // Slender neck
  b.capsule(neck.at, head.at, 0.046, { bone: neck, color: SKIN, group: "head" });

  // Main Anime Cranium / Upper Skull
  b.part(
    new THREE.SphereGeometry(0.086, 16, 12),
    SKIN,
    {
      bone: head,
      at: [0, 1.56, 0.03],
      scale: [0.95, 1.05, 1.02],
      group: "head",
    }
  );

  // Mid-face & cheek contour tapering to lower jaw
  b.frustumBox(
    [0, 1.56, 0.04],
    [0, 1.48, 0.05],
    [0.145, 0.13],
    [0.11, 0.11],
    { bone: head, color: SKIN, group: "head" }
  );

  // Cute anime nose bridge & tip
  b.extrude(
    [
      [0, 0],
      [0.006, 0.01],
      [0.016, 0],
      [0, -0.015, "sharp"],
      [-0.016, 0],
      [-0.006, 0.01],
    ],
    {
      at: [0, 1.536, 0.108],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: SKIN,
      bone: head,
      group: "head",
    }
  );

  // Chin & Lower Jaw (Mounted on jaw joint for full opening/rigging readiness)
  b.frustumBox(
    [0, 1.48, 0.05],
    [0, 1.435, 0.065],
    [0.105, 0.105],
    [0.042, 0.04],
    { bone: jaw, color: SKIN, group: "head" }
  );
  // Anime lip line
  b.part(
    new THREE.BoxGeometry(0.022, 0.004, 0.004),
    "#b8687a",
    { bone: jaw, at: [0, 1.472, 0.098], group: "head" }
  );

  // Big Expressive Anime Eyes (Decals on left and right face)
  for (const s of [1, -1]) {
    b.decal(head, ELF_EYE, {
      at: [s * 0.044, 1.545, 0.098],
      dir: [s * 0.22, 0.05, 0.98],
      size: [0.048, 0.058],
      mirror: s > 0,
      bone: head,
      group: "head",
    });

    // Delicate golden-blonde arched eyebrows
    b.extrude(
      [
        [0, 0],
        [0.038, 0.008],
        [0.042, 0.004],
        [0.01, -0.004],
      ],
      {
        at: [s * 0.02, 1.58, 0.1],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
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
    // Elegant sweeping elven ear blade (starts at temple, angles back and up at ~28 degrees)
    const earBase = [s * 0.076, 1.54, 0.02];
    const earMid = [s * 0.13, 1.585, -0.04];
    const earTip = [s * 0.21, 1.64, -0.11];

    b.sweep(
      catmull([earBase, earMid, earTip]),
      (t) => [0.032 * (1 - t * 0.75), 0.012 * (1 - t * 0.85)],
      { bone: head, color: SKIN, group: "ears" }
    );
    // Inner ear contour
    b.sweep(
      catmull([
        [s * 0.078, 1.54, 0.02],
        [s * 0.12, 1.575, -0.035],
        [s * 0.17, 1.615, -0.085],
      ]),
      (t) => [0.018 * (1 - t * 0.65), 0.006],
      { bone: head, color: SKIN_BLUSH, group: "ears" }
    );

    // Golden Ear Cuffs clamped around mid-ear
    b.part(
      new THREE.TorusGeometry(0.016, 0.004, 8, 16),
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
      [earMid[0], earMid[1] - 0.012, earMid[2]],
      [earMid[0], earMid[1] - 0.028, earMid[2]],
      0.002,
      GOLD_TRIM,
      { bone: head, group: "ears" }
    );
    makeGlow(
      b.part(
        new THREE.OctahedronGeometry(0.009, 0),
        CYAN_GLOW,
        {
          bone: head,
          at: [earMid[0], earMid[1] - 0.036, earMid[2]],
          scale: [0.8, 1.4, 0.8],
          group: "ears",
        }
      ),
      2.0
    );
  }

  // Golden Elven Tiara / Brow Circlet
  b.sweep(
    catmull([
      [-0.082, 1.59, 0.02],
      [-0.05, 1.6, 0.085],
      [0, 1.6, 0.106],
      [0.05, 1.6, 0.085],
      [0.082, 1.59, 0.02],
    ]),
    0.004,
    { color: GOLD_TRIM, bone: head, group: "head" }
  );
  // Center teardrop celestial moonstone
  makeGlow(
    b.part(
      new THREE.SphereGeometry(0.008, 8, 6),
      CYAN_GLOW,
      { bone: head, at: [0, 1.6, 0.112], group: "head" }
    ),
    2.2
  );

  // -------------------------------------------------------------------------------------------------------------
  // 10. High-Fantasy Platinum Hair & Cascading Ponytail
  // -------------------------------------------------------------------------------------------------------------

  // Base Cranial Hair Volume
  b.part(
    new THREE.SphereGeometry(0.094, 16, 12),
    HAIR_BASE,
    {
      bone: head,
      at: [0, 1.58, 0.01],
      scale: [1, 1.08, 1.05],
      group: "hair",
    }
  );

  // Layered Anime Forehead Bangs
  // Center bang
  b.extrude(
    [
      [0, 0],
      [0.02, -0.06],
      [0, -0.09, "sharp"],
      [-0.018, -0.05],
    ],
    {
      at: [0, 1.64, 0.09],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: HAIR_BASE,
      bone: head,
      group: "hair",
    }
  );
  // Left and Right eye-framing bangs
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [s * 0.035, -0.05],
        [s * 0.015, -0.08, "sharp"],
        [-s * 0.02, -0.04],
      ],
      {
        at: [s * 0.04, 1.63, 0.085],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.01,
        color: HAIR_BASE,
        bone: head,
        group: "hair",
      }
    );

    // Long face-framing side tendrils falling down over shoulders
    const tendril = catmull([
      [s * 0.078, 1.58, 0.04],
      [s * 0.085, 1.48, 0.06],
      [s * 0.08, 1.38, 0.08],
      [s * 0.075, 1.28, 0.08],
    ]);
    b.sweep(
      tendril,
      (t) => 0.012 * (1 - t * 0.5),
      { bone: head, color: HAIR_BASE, group: "hair" }
    );
    // Gold ring beads on side tendrils at jaw height
    b.part(
      new THREE.CylinderGeometry(0.011, 0.011, 0.012, 10),
      GOLD_TRIM,
      { bone: head, at: [s * 0.082, 1.45, 0.068], group: "hair" }
    );
  }

  // High Ponytail Clasp (Ornate Golden Leaf Ring at back of crown)
  const claspAt = [0, 1.64, -0.06];
  b.part(
    new THREE.TorusGeometry(0.032, 0.008, 8, 16),
    GOLD_TRIM,
    { bone: head, at: claspAt, rotation: [60, 0, 0], group: "hair" }
  );

  // Cascading Anime Ponytail Spine (S-curving down between the shoulders)
  const ponyPts = [
    [0, 1.64, -0.06],
    [0, 1.54, -0.14],
    [0.03, 1.4, -0.19],
    [-0.02, 1.24, -0.21],
    [0, 1.08, -0.18],
    [0.01, 0.94, -0.15],
  ];
  b.sweep(
    catmull(ponyPts),
    (t) => 0.042 * (1 - t * 0.78),
    { bone: head, color: HAIR_BASE, group: "hair" }
  );

  // Layered overlapping hair locks around the ponytail for anime volume & silhouette
  for (let p = 0; p < 4; p++) {
    const ang = (p * 90 * Math.PI) / 180;
    const px = Math.cos(ang) * 0.028;
    const pz = Math.sin(ang) * 0.028;
    b.sweep(
      catmull([
        [claspAt[0] + px, claspAt[1], claspAt[2] + pz],
        [claspAt[0] + px * 1.4, claspAt[1] - 0.14, claspAt[2] + pz * 1.4 - 0.06],
        [claspAt[0] + px * 0.8, claspAt[1] - 0.32, claspAt[2] + pz * 0.8 - 0.12],
      ]),
      (t) => 0.02 * (1 - t * 0.8),
      { bone: head, color: p % 2 === 0 ? HAIR_BASE : HAIR_SHADOW, group: "hair" }
    );
  }

  return b.root;
}
```