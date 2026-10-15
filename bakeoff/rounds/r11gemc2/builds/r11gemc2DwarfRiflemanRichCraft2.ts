import * as THREE from "three";
import {
  createBuilder,
  aim,
  catmull,
  paint,
  mix,
  smoothstep,
  noise,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

// ============================================================================
// METADATA
// ============================================================================
export const meta = {
  name: "dwarf_rifleman",
  description:
    "Warcraft-inspired dwarf mountaineer rifleman with braided ginger beard, glowing sniper goggles, heavy quilted coat, and ornate blunderbuss on a snowy Dun Morogh base.",
};

// ============================================================================
// PALETTE & PROCEDURAL PAINTS
// ============================================================================

const C_SKIN_BASE = "#e8a484";
const C_SKIN_SHADOW = "#8f4c36";
const C_SKIN_WARM = "#db5840";

const C_HAIR_BASE = "#d85216";
const C_HAIR_LIGHT = "#fa8632";
const C_HAIR_DARK = "#721e06";

const C_COAT_RED = "#86221c";
const C_COAT_SHADOW = "#4a120e";
const C_COAT_TRIM = "#e4dbcc";

const C_LEATHER_DARK = "#322016";
const C_LEATHER_MED = "#543624";
const C_LEATHER_LIGHT = "#7e5236";

const C_BRASS_LIGHT = "#f8d068";
const C_BRASS_MED = "#c69228";
const C_BRASS_DARK = "#664210";

const C_IRON_LIGHT = "#868e9e";
const C_IRON_MED = "#464e5c";
const C_IRON_DARK = "#22262e";

const C_WOOD_MED = "#5a3820";
const C_WOOD_DARK = "#321c0e";

const C_SNOW_LIGHT = "#f4f8fc";
const C_SNOW_SHADOW = "#b2c6dc";
const C_STONE_MED = "#4c525e";
const C_STONE_DARK = "#282c34";

// Procedural Skin Paint (warm ruddy mountain complexion)
const SKIN_PAINT = paint((p, n) => {
  const noseDist = Math.hypot(p.x, p.y - 1.02, p.z - 0.22);
  const cheekDist = Math.hypot(Math.abs(p.x) - 0.09, p.y - 1.01, p.z - 0.17);
  const ruddy = smoothstep(0.09, 0.0, noseDist) * 0.95 + smoothstep(0.07, 0.0, cheekDist) * 0.5;
  const shadow = smoothstep(0.2, -0.4, n.y);
  const base = mix(C_SKIN_BASE, C_SKIN_WARM, ruddy);
  return mix(base, C_SKIN_SHADOW, shadow * 0.55);
});

// Stylized Hair & Beard Paint with directional grain
const BEARD_PAINT = paint((p, n) => {
  const grainVal = noise(new THREE.Vector3(p.x * 16, p.y * 5, p.z * 16), 0.07, 12);
  const base = mix(C_HAIR_BASE, C_HAIR_LIGHT, grainVal * 0.65);
  const ambient = smoothstep(0.3, -0.5, n.y) * 0.5;
  return mix(base, C_HAIR_DARK, ambient);
});

// Quilted Wool Coat Paint (diamond stitching with shadow seams)
const COAT_PAINT = paint((p, n) => {
  const quiltU = Math.abs(Math.sin((p.x + p.y) * 22));
  const quiltV = Math.abs(Math.sin((p.x - p.y) * 22));
  const seam = smoothstep(0.85, 0.98, Math.max(quiltU, quiltV));
  const base = mix(C_COAT_RED, C_COAT_SHADOW, seam * 0.55);
  const rim = smoothstep(0.2, 0.9, n.y) * 0.18;
  return mix(base, "#a63428", rim);
});

// Weathered Mountaineer Leather
const LEATHER_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.06, 7);
  const base = mix(C_LEATHER_DARK, C_LEATHER_MED, nVal);
  const edgeWear = smoothstep(0.5, 0.9, Math.abs(n.x) + Math.abs(n.z)) * 0.2;
  return mix(base, C_LEATHER_LIGHT, edgeWear);
});

// Polished Dwarven Brass
const BRASS_PAINT = paint((p, n) => {
  const glint = smoothstep(0.35, 0.95, n.y * 0.6 + n.z * 0.8);
  const crevice = smoothstep(0.1, -0.5, n.y);
  const base = mix(C_BRASS_MED, C_BRASS_LIGHT, glint * 0.55);
  return mix(base, C_BRASS_DARK, crevice * 0.45);
});

// Heavy Forged Iron
const IRON_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.05, 33);
  const base = mix(C_IRON_MED, C_IRON_LIGHT, nVal * 0.35);
  const crevice = smoothstep(0.2, -0.6, n.y);
  return mix(base, C_IRON_DARK, crevice * 0.5);
});

// Carved Walnut Wood
const WOOD_PAINT = paint((p, n) => {
  const grainVal = Math.sin(p.z * 40 + noise(p, 0.04, 5) * 5);
  const band = smoothstep(-0.3, 0.3, grainVal);
  return mix(C_WOOD_MED, C_WOOD_DARK, band * 0.45);
});

// Dun Morogh Snow Paint
const SNOW_PAINT = paint((p, n) => {
  const shade = smoothstep(0.3, -0.4, n.y);
  return mix(C_SNOW_LIGHT, C_SNOW_SHADOW, shade * 0.65);
});

// Chiseled Granite Stone
const STONE_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.12, 19);
  const base = mix(C_STONE_MED, C_STONE_DARK, nVal * 0.55);
  return mix(base, "#1a1e24", smoothstep(0.1, -0.7, n.y));
});

// ============================================================================
// TEXTURES (SVG)
// ============================================================================

// Expressive Dwarf Eyes (bright blue iris with sharp glint)
const EYE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <ellipse cx="64" cy="64" rx="60" ry="54" fill="#140e1a"/>
    <ellipse cx="64" cy="64" rx="54" ry="48" fill="#f4f8fc"/>
    <ellipse cx="64" cy="64" rx="38" ry="42" fill="#142c44"/>
    <ellipse cx="64" cy="64" rx="33" ry="37" fill="#2d76b4"/>
    <ellipse cx="64" cy="68" rx="27" ry="29" fill="#52ade8"/>
    <ellipse cx="64" cy="64" rx="17" ry="20" fill="#0a121c"/>
    <circle cx="50" cy="50" r="11" fill="#ffffff"/>
    <circle cx="78" cy="74" r="5" fill="#ffffff"/>
    <path d="M10 24 Q64 6 118 24" stroke="#140e1a" stroke-width="15" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// Dwarven Runic Knotwork for Beard Rings
const BEARD_RING_TEX = svg(
  `<svg viewBox="0 0 256 64">
    <rect width="256" height="64" fill="#5a3e12"/>
    <rect y="4" width="256" height="56" fill="#b08226"/>
    <path d="M0 8 L32 32 L0 56 M32 8 L64 32 L32 56 M64 8 L96 32 L64 56 M96 8 L128 32 L96 56 M128 8 L160 32 L128 56 M160 8 L192 32 L160 56 M192 8 L224 32 L192 56 M224 8 L256 32 L224 56" stroke="#f6d468" stroke-width="6" fill="none"/>
    <line x1="0" y1="4" x2="256" y2="4" stroke="#ffe084" stroke-width="3"/>
    <line x1="0" y1="60" x2="256" y2="60" stroke="#ffe084" stroke-width="3"/>
    <circle cx="16" cy="32" r="4" fill="#2a1804"/>
    <circle cx="80" cy="32" r="4" fill="#2a1804"/>
    <circle cx="144" cy="32" r="4" fill="#2a1804"/>
    <circle cx="208" cy="32" r="4" fill="#2a1804"/>
  </svg>`,
  { size: 256 },
);

// Grand Dwarven Belt Buckle (Ram Horns & Iron Anvil)
const BUCKLE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <polygon points="64,6 120,36 120,92 64,122 8,92 8,36" fill="#8c6418" stroke="#fad874" stroke-width="7"/>
    <polygon points="64,16 110,42 110,86 64,112 18,86 18,42" fill="#422806"/>
    <!-- Ram Horns -->
    <path d="M44 56 Q28 36 40 24 Q56 14 64 36" stroke="#fad874" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M84 56 Q100 36 88 24 Q72 14 64 36" stroke="#fad874" stroke-width="10" fill="none" stroke-linecap="round"/>
    <!-- Anvil center -->
    <polygon points="44,62 84,62 78,82 50,82" fill="#d6a234"/>
    <rect x="58" y="82" width="12" height="22" fill="#d6a234"/>
    <polygon points="36,100 92,100 84,106 44,106" fill="#fad874"/>
    <circle cx="64" cy="46" r="5" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// Engraved Flintlock Lockplate
const LOCKPLATE_TEX = svg(
  `<svg viewBox="0 0 256 128">
    <rect width="256" height="128" rx="22" fill="#3a404a" stroke="#727c8e" stroke-width="7"/>
    <path d="M24 64 Q64 22 128 30 Q192 38 232 64 Q180 98 128 90 Q76 82 24 64" fill="none" stroke="#20242a" stroke-width="6"/>
    <path d="M36 64 Q80 36 128 42 Q176 48 216 64" fill="none" stroke="#94a8c2" stroke-width="3"/>
    <circle cx="48" cy="64" r="9" fill="#1c1e24" stroke="#94a8c2" stroke-width="3"/>
    <circle cx="208" cy="64" r="9" fill="#1c1e24" stroke="#94a8c2" stroke-width="3"/>
    <circle cx="128" cy="72" r="11" fill="#1c1e24" stroke="#94a8c2" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

// Sniper Monocular Scope Reticle (Glowing Hero Lens)
const RETICLE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="62" fill="#061820" stroke="#e0a834" stroke-width="6"/>
    <circle cx="64" cy="64" r="54" fill="none" stroke="#38f0f6" stroke-width="3"/>
    <circle cx="64" cy="64" r="32" fill="none" stroke="#38f0f6" stroke-width="2.5" stroke-dasharray="6 4"/>
    <circle cx="64" cy="64" r="9" fill="none" stroke="#ff4834" stroke-width="3"/>
    <line x1="64" y1="4" x2="64" y2="124" stroke="#38f0f6" stroke-width="3"/>
    <line x1="4" y1="64" x2="124" y2="64" stroke="#38f0f6" stroke-width="3"/>
    <line x1="52" y1="42" x2="76" y2="42" stroke="#38f0f6" stroke-width="3"/>
    <line x1="54" y1="52" x2="74" y2="52" stroke="#38f0f6" stroke-width="2.5"/>
    <line x1="52" y1="86" x2="76" y2="86" stroke="#38f0f6" stroke-width="3"/>
    <line x1="54" y1="76" x2="74" y2="76" stroke="#38f0f6" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);

// Dun Morogh Blasting Powder Stencil
const KEG_LABEL_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <rect width="128" height="128" fill="none"/>
    <circle cx="64" cy="64" r="58" fill="#1e140c" stroke="#922416" stroke-width="6"/>
    <path d="M34 28 L94 100 M94 28 L34 100" stroke="#a43020" stroke-width="10" stroke-linecap="round"/>
    <rect x="24" y="20" width="26" height="16" rx="3" fill="#caa030"/>
    <rect x="78" y="20" width="26" height="16" rx="3" fill="#caa030"/>
    <text x="64" y="60" text-anchor="middle" font-family="monospace" font-weight="900" font-size="30" fill="#f44028">XXX</text>
    <text x="64" y="82" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#fad874">DUN MOROGH</text>
    <text x="64" y="98" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff">BLASTING</text>
  </svg>`,
  { size: 256 },
);

// Ammo Pouch Badge
const POUCH_BADGE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#422816"/>
    <rect x="8" y="8" width="112" height="112" rx="16" fill="#301c0e" stroke="#1e1006" stroke-width="6"/>
    <path d="M16 16 L112 16 L112 80 L64 112 L16 80 Z" fill="#5c3822" stroke="#a47040" stroke-width="4"/>
    <circle cx="64" cy="68" r="14" fill="#c8942c" stroke="#f8d066" stroke-width="4"/>
    <circle cx="64" cy="68" r="5" fill="#281606"/>
  </svg>`,
  { size: 256 },
);

// ============================================================================
// MAIN BUILD FUNCTION
// ============================================================================
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "dwarf_rifleman" });

  // --------------------------------------------------------------------------
  // SKELETON (Hierarchy & Rig Roles)
  // --------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.54, -0.02], role: "spine" });

  const spinePath = catmull([
    [0, 0.54, -0.02],
    [0, 0.70, 0.0],
    [0, 0.88, 0.03],
  ]);
  const spineChain = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineLower", "chest"],
    role: "spine",
  });
  const chest = spineChain.tip ?? spineChain.joints[1];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.94, 0.05],
    dir: [0, 1, 0.2],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.05, 0.08],
    dir: [0, 0.15, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.96, 0.12],
    aim: [0, 0.93, 0.22],
    role: "jaw",
  });

  // --------------------------------------------------------------------------
  // LOWER BODY: STURDY DWARF LEGS & HERO BOOTS
  // --------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos: [number, number, number] = [s * 0.17, 0.52, -0.02];
    const kneePos: [number, number, number] = [s * 0.19, 0.31, 0.03];
    const anklePos: [number, number, number] = [s * 0.20, 0.13, 0.0];
    const footPos: [number, number, number] = [s * 0.20, 0.04, 0.08];

    const legChain = b.chain(`leg${side}`, catmull([hipPos, kneePos, anklePos, footPos]), {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.20, 0.04, 0.08],
    });

    // Bulky Quilted Trousers
    b.sweep(catmull([hipPos, kneePos]), [0.115, 0.10], {
      bone: legChain.joints[0],
      color: LEATHER_PAINT,
      sides: 8,
    });

    // Calf
    b.sweep(catmull([kneePos, anklePos]), [0.105, 0.095], {
      bone: legChain.joints[1],
      color: LEATHER_PAINT,
      sides: 8,
    });

    // Heavy Forged Knee Guard with Rivets
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.045, 8), BRASS_PAINT, {
      bone: legChain.joints[1],
      at: kneePos,
      dir: [0, 0.2, 1],
    });
    b.part(new THREE.SphereGeometry(0.024, 6, 6), IRON_PAINT, {
      bone: legChain.joints[1],
      at: [kneePos[0], kneePos[1], kneePos[2] + 0.028],
    });

    // Massive Mountain Stomper Boots
    const bootBone = legChain.joints[2] ?? legChain.joints[1];

    // Boot Shaft
    b.frustumBox([s * 0.20, 0.23, 0.01], [s * 0.20, 0.08, 0.01], [0.17, 0.16], [0.18, 0.18], {
      bone: bootBone,
      color: C_LEATHER_DARK,
    });

    // Boot Top Fur Trim (Cylinder ring)
    b.part(new THREE.CylinderGeometry(0.11, 0.10, 0.045, 12), C_COAT_TRIM, {
      bone: bootBone,
      at: [s * 0.20, 0.23, 0.01],
      dir: [0, 1, 0],
    });

    // Boot Foot Box
    b.frustumBox([s * 0.20, 0.08, 0.01], [s * 0.20, 0.08, 0.14], [0.17, 0.085], [0.16, 0.075], {
      bone: bootBone,
      color: C_LEATHER_DARK,
    });

    // Heavy Iron Toe Cap
    b.part(new THREE.CylinderGeometry(0.076, 0.084, 0.072, 10, 1, false, -Math.PI / 2, Math.PI), IRON_PAINT, {
      bone: bootBone,
      at: [s * 0.20, 0.075, 0.14],
      dir: [0, 1, 0],
      axis: "y",
    });

    // Heavy Cleated Iron Sole resting flush on stone base at y = 0.04
    b.part(new THREE.BoxGeometry(0.18, 0.035, 0.24), IRON_PAINT, {
      bone: bootBone,
      at: [s * 0.20, 0.055, 0.07],
    });

    // Instep Strap with Brass Buckle
    b.part(new THREE.BoxGeometry(0.16, 0.024, 0.04), C_LEATHER_MED, {
      bone: bootBone,
      at: [s * 0.20, 0.10, 0.07],
      dir: [0, 0.4, 1],
    });
    b.part(new THREE.BoxGeometry(0.045, 0.035, 0.018), BRASS_PAINT, {
      bone: bootBone,
      at: [s * 0.20, 0.105, 0.088],
      dir: [0, 0.4, 1],
    });
  }

  // --------------------------------------------------------------------------
  // UPPER BODY: ARMS, SPAULDERS & ARTICULATED GAUNTLETS
  // --------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPos: [number, number, number] = [s * 0.29, 0.88, 0.02];
    const elbowPos: [number, number, number] = [s * 0.45, 0.70, 0.0];
    const wristPos: [number, number, number] = [s * 0.54, 0.50, 0.07];
    const handPos: [number, number, number] = [s * 0.60, 0.38, 0.12];

    const armChain = b.chain(`arm${side}`, catmull([shoulderPos, elbowPos, wristPos, handPos]), {
      parent: chest,
      names: [`shoulder${side}`, `forearm${side}`, `hand${side}`],
      role: "arm",
    });

    // Upper Arm Quilted Sleeve
    b.sweep(catmull([shoulderPos, elbowPos]), [0.10, 0.086], {
      bone: armChain.joints[0],
      color: COAT_PAINT,
      sides: 8,
    });

    // Colossal Dwarven Spaulder (Shoulder Armor)
    b.part(new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), IRON_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.30, 0.90, 0.02],
      dir: [s * 0.6, 0.8, 0],
    });
    b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.035, 12, 1, true), BRASS_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.30, 0.89, 0.02],
      dir: [s * 0.6, 0.8, 0],
    });
    b.part(new THREE.SphereGeometry(0.032, 6, 6), BRASS_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.39, 0.96, 0.02],
    });

    // Forearm Gauntlet with Flared Brass Cuff
    const foreBone = armChain.joints[1];
    b.sweep(catmull([elbowPos, wristPos]), [0.086, 0.072], {
      bone: foreBone,
      color: LEATHER_PAINT,
      sides: 8,
    });
    // Flared Elbow Cuff Ring
    b.part(new THREE.CylinderGeometry(0.098, 0.082, 0.05, 10), BRASS_PAINT, {
      bone: foreBone,
      at: [s * 0.44, 0.70, 0.01],
      dir: [s * 0.5, -0.8, 0.2],
    });
    // Dual Leather Wrist Straps
    b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.018, 10, 1, true), C_LEATHER_DARK, {
      bone: foreBone,
      at: [s * 0.51, 0.56, 0.05],
      dir: [s * 0.5, -0.8, 0.2],
    });

    // Chunky Dwarven Gauntlet & Articulated Hand
    const handBone = armChain.joints[2] ?? foreBone;
    b.frustumBox(wristPos, handPos, [0.084, 0.064], [0.076, 0.056], {
      bone: handBone,
      color: LEATHER_PAINT,
    });
    // Brass Knuckle Guard
    b.part(new THREE.BoxGeometry(0.072, 0.026, 0.044), BRASS_PAINT, {
      bone: handBone,
      at: [s * 0.58, 0.41, 0.11],
      dir: [s * 0.5, -0.6, 0.6],
    });
    // Thick Thumb
    b.capsule([s * 0.56, 0.44, 0.09], [s * 0.54, 0.37, 0.15], 0.02, {
      bone: handBone,
      color: LEATHER_PAINT,
    });
    // 3 Sculpted Gloved Fingers
    for (let f = -1; f <= 1; f++) {
      const fX = s * 0.60 + f * s * 0.022;
      const fY = 0.38 - Math.abs(f) * 0.006;
      const fZ = 0.12 + f * 0.016;
      b.capsule([fX, fY, fZ], [fX + s * 0.02, fY - 0.055, fZ + 0.02], 0.018, {
        bone: handBone,
        color: LEATHER_PAINT,
      });
    }
  }

  // --------------------------------------------------------------------------
  // TORSO, SHEARLING MANTLE & ACCESSORIES
  // --------------------------------------------------------------------------
  // Broad Dwarven Torso (Quilted Red Gambeson)
  b.loft(
    [
      { at: [0, 0.54, -0.02], w: 0.50, h: 0.38 }, // Pelvis
      { at: [0, 0.66, 0.0], w: 0.56, h: 0.42 }, // Belly
      { at: [0, 0.78, 0.03], w: 0.60, h: 0.44 }, // Broad Barrel Chest
      { at: [0, 0.90, 0.04], w: 0.54, h: 0.38 }, // Upper Chest
    ],
    { bone: [hips, chest], color: COAT_PAINT },
  );

  // Heavy Shearling Fur Collar
  b.sweep(
    catmull([
      [-0.24, 0.90, 0.06],
      [-0.18, 0.93, 0.16],
      [0, 0.92, 0.18],
      [0.18, 0.93, 0.16],
      [0.24, 0.90, 0.06],
      [0.18, 0.91, -0.10],
      [0, 0.93, -0.12],
      [-0.18, 0.91, -0.10],
    ], { closed: true }),
    0.065,
    { bone: chest, color: C_COAT_TRIM, sides: 8 },
  );

  // Colossal Dwarven Leather Belt
  b.sweep(
    catmull([
      [-0.27, 0.56, -0.01],
      [-0.19, 0.56, 0.19],
      [0, 0.56, 0.21],
      [0.19, 0.56, 0.19],
      [0.27, 0.56, -0.01],
      [0.19, 0.56, -0.21],
      [0, 0.56, -0.23],
      [-0.19, 0.56, -0.21],
    ], { closed: true }),
    0.052,
    { bone: hips, color: C_LEATHER_DARK, sides: 8 },
  );

  // Grand Dwarven Belt Buckle (Ram & Anvil)
  b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.026, 8), BRASS_PAINT, {
    bone: hips,
    at: [0, 0.56, 0.23],
    dir: [0, 0, 1],
  });
  b.part(new THREE.CircleGeometry(0.082, 8), "#ffffff", {
    bone: hips,
    at: [0, 0.56, 0.245],
    dir: [0, 0, 1],
    axis: "z",
    texture: BUCKLE_TEX,
  });

  // Cross-Body Ammo Bandolier
  const bandolierPath = catmull([
    [-0.21, 0.94, 0.06],
    [-0.13, 0.82, 0.16],
    [0.0, 0.68, 0.20],
    [0.15, 0.57, 0.18],
    [0.21, 0.54, 0.04],
    [0.15, 0.56, -0.19],
    [0.0, 0.72, -0.20],
    [-0.15, 0.86, -0.13],
  ], { closed: true });
  b.sweep(bandolierPath, [0.034, 0.014], {
    bone: chest,
    color: LEATHER_PAINT,
    sides: 6,
  });

  // Heavy Brass Rifle Cartridges on Bandolier
  for (let c = 0; c < 5; c++) {
    const t = 0.10 + c * 0.065;
    const pt = bandolierPath.at(t);
    const tan = bandolierPath.tangentAt(t);
    const cartDir = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
    const pos = new THREE.Vector3(pt.x, pt.y, pt.z).addScaledVector(cartDir, 0.022);

    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.046, 8), BRASS_PAINT, {
      bone: chest,
      at: [pos.x, pos.y, pos.z],
      dir: [tan.x, tan.y, tan.z],
    });
    b.part(new THREE.ConeGeometry(0.012, 0.02, 8), "#c85a2c", {
      bone: chest,
      at: [pos.x + tan.x * 0.03, pos.y + tan.y * 0.03, pos.z + tan.z * 0.03],
      dir: [tan.x, tan.y, tan.z],
    });
  }

  // Right Hip: Ammo Pouch with Ironforge Crest
  b.part(new THREE.BoxGeometry(0.13, 0.11, 0.085), LEATHER_PAINT, {
    bone: hips,
    at: [-0.23, 0.54, 0.13],
    dir: [-0.8, 0, 0.6],
  });
  b.part(new THREE.PlaneGeometry(0.1, 0.09), "#ffffff", {
    bone: hips,
    at: [-0.25, 0.54, 0.178],
    dir: [-0.8, 0, 0.6],
    axis: "z",
    texture: POUCH_BADGE_TEX,
  });

  // Left Hip: Dwarven Powder Horn
  const hornPath = catmull([
    [0.22, 0.56, 0.15],
    [0.27, 0.52, 0.11],
    [0.30, 0.45, 0.0],
    [0.27, 0.43, -0.09],
  ]);
  b.sweep(hornPath, (t) => 0.048 * Math.sin(t * Math.PI * 0.85 + 0.15) + 0.018, {
    bone: hips,
    color: "#e8deca",
    sides: 8,
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.022, 0.032, 8), BRASS_PAINT, {
    bone: hips,
    at: [0.22, 0.56, 0.15],
    dir: [-0.4, 0.6, 0.7],
  });
  b.part(new THREE.SphereGeometry(0.038, 8, 6), BRASS_PAINT, {
    bone: hips,
    at: [0.27, 0.43, -0.09],
  });

  // --------------------------------------------------------------------------
  // HEAD, FACE & CLEAR READABLE EYES (SETTLED FIRST!)
  // --------------------------------------------------------------------------
  // Cranium base
  b.part(new THREE.SphereGeometry(0.142, 12, 10), SKIN_PAINT, {
    bone: head,
    at: [0, 1.05, 0.08],
    scale: [1.14, 0.98, 1.06],
  });

  // Rosy Mountain Cheeks (Placed low to frame the eyes)
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.054, 8, 8), SKIN_PAINT, {
      bone: head,
      at: [s * 0.095, 1.01, 0.17],
    });
  }

  // Giant Iconic Bulbous Dwarf Nose (Positioned slightly lower so eye sockets breathe!)
  b.part(new THREE.SphereGeometry(0.044, 10, 8), SKIN_PAINT, {
    bone: head,
    at: [0, 1.03, 0.22],
    scale: [1.16, 1.0, 1.12],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 6, 6), SKIN_PAINT, {
      bone: head,
      at: [s * 0.034, 1.015, 0.205],
    });
  }

  // Fierce Expressive Dwarf Eyes (PROMINENT, UNBLOCKED, FULLY VISIBLE FROM FRONT!)
  for (const s of [1, -1]) {
    const eyePos: [number, number, number] = [s * 0.075, 1.085, 0.19];
    const eyeDir: [number, number, number] = [s * 0.18, 0.05, 0.98];
    b.part(new THREE.CircleGeometry(0.034, 16), "#ffffff", {
      bone: head,
      at: eyePos,
      dir: eyeDir,
      axis: "z",
      texture: EYE_TEX,
    });
    // Eyelid Rim
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 12, 1, true), C_SKIN_SHADOW, {
      bone: head,
      at: eyePos,
      dir: eyeDir,
    });
  }

  // Bushy Fierce Eyebrows (Arched cleanly OVER the eyes, never blocking them!)
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.025, 1.135, 0.20],
        [s * 0.08, 1.155, 0.19],
        [s * 0.135, 1.12, 0.165],
      ]),
      [0.018, 0.024, 0.012],
      { bone: head, color: BEARD_PAINT, sides: 6 },
    );
  }

  // Ears & Golden Hoop Earring
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.036, 8, 6), SKIN_PAINT, {
      bone: head,
      at: [s * 0.155, 1.05, 0.07],
      scale: [0.5, 1.1, 0.8],
      dir: [s * 0.8, 0.3, -0.4],
    });
    if (s > 0) {
      b.part(new THREE.TorusGeometry(0.018, 0.004, 6, 12), BRASS_PAINT, {
        bone: head,
        at: [s * 0.165, 1.025, 0.07],
        dir: [0, 0, 1],
        axis: "z",
      });
    }
  }

  // Lower Jaw Bone Mesh
  b.part(new THREE.BoxGeometry(0.13, 0.07, 0.11), SKIN_PAINT, {
    bone: jaw,
    at: [0, 0.96, 0.15],
  });

  // --------------------------------------------------------------------------
  // BEARD & MOUSTACHE (Iconic Sculpted Braided Plaits!)
  // --------------------------------------------------------------------------
  // Wide Upturned Handlebar Moustache (Majestic, framing cheeks & nose)
  for (const s of [1, -1]) {
    const stachePath = catmull([
      [0, 1.01, 0.235],
      [s * 0.08, 1.015, 0.245],
      [s * 0.16, 0.98, 0.22],
      [s * 0.23, 0.94, 0.17],
      [s * 0.27, 0.88, 0.13],
    ]);
    b.sweep(stachePath, (t) => (1 - t) * 0.042 + 0.01, {
      bone: head,
      color: BEARD_PAINT,
      sides: 8,
    });
  }

  // Upper Chin Beard Solid Mass
  b.loft(
    [
      { at: [0, 0.97, 0.15], w: 0.26, h: 0.16 },
      { at: [0, 0.86, 0.19], w: 0.30, h: 0.18 },
      { at: [0, 0.74, 0.21], w: 0.28, h: 0.16 },
      { at: [0, 0.60, 0.19], w: 0.22, h: 0.12 },
    ],
    { bone: head, color: BEARD_PAINT },
  );

  // Twin Sculpted Braided Plaits with Interlocking Faceted Beads
  for (const s of [1, -1]) {
    const braidPoints: [number, number, number][] = [
      [s * 0.08, 0.94, 0.19],
      [s * 0.10, 0.82, 0.24],
      [s * 0.11, 0.70, 0.25],
      [s * 0.095, 0.58, 0.22],
      [s * 0.075, 0.46, 0.18],
    ];

    const braidPath = catmull(braidPoints);

    // Deep rhythmic braid bulges
    b.sweep(
      braidPath,
      (t) => {
        const seg = Math.sin(t * Math.PI * 4.5);
        return 0.048 + seg * 0.016;
      },
      { bone: head, color: BEARD_PAINT, sides: 8 },
    );

    // Sculpted Plait Bulges for faceted low-poly stylized volume
    for (let segIdx = 0; segIdx < 4; segIdx++) {
      const bT = 0.12 + segIdx * 0.24;
      const bPt = braidPath.at(bT);
      b.part(new THREE.SphereGeometry(0.042, 6, 6), BEARD_PAINT, {
        bone: head,
        at: [bPt.x, bPt.y, bPt.z],
        scale: [1.1, 0.7, 1.0],
      });
    }

    // Heavy Brass Beard Rings with Runic Texture
    for (const rT of [0.30, 0.68]) {
      const rPt = braidPath.at(rT);
      const rTan = braidPath.tangentAt(rT);
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.038, 12), "#ffffff", {
        bone: head,
        at: [rPt.x, rPt.y, rPt.z],
        dir: [rTan.x, rTan.y, rTan.z],
        texture: BEARD_RING_TEX,
      });
      // Raised Brass Flanges on Rings
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.008, 12), BRASS_PAINT, {
        bone: head,
        at: [rPt.x + rTan.x * 0.018, rPt.y + rTan.y * 0.018, rPt.z + rTan.z * 0.018],
        dir: [rTan.x, rTan.y, rTan.z],
      });
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.008, 12), BRASS_PAINT, {
        bone: head,
        at: [rPt.x - rTan.x * 0.018, rPt.y - rTan.y * 0.018, rPt.z - rTan.z * 0.018],
        dir: [rTan.x, rTan.y, rTan.z],
      });
    }

    // Terminal Brass Bell Clasp at Braid End
    const endPt = braidPath.at(1.0);
    const endTan = braidPath.tangentAt(1.0);
    b.part(new THREE.ConeGeometry(0.038, 0.055, 10), BRASS_PAINT, {
      bone: head,
      at: [endPt.x, endPt.y, endPt.z],
      dir: [endTan.x, endTan.y, endTan.z],
    });

    // Fanned Hair Tuft at Braid Tip
    b.part(new THREE.ConeGeometry(0.032, 0.065, 8), BEARD_PAINT, {
      bone: head,
      at: [endPt.x + endTan.x * 0.045, endPt.y + endTan.y * 0.045, endPt.z + endTan.z * 0.045],
      dir: [endTan.x, endTan.y, endTan.z],
    });
  }

  // --------------------------------------------------------------------------
  // MOUNTAINEER HELMET & FORWARD-FACING SNIPER GOGGLES (GLOWING HERO DETAIL!)
  // --------------------------------------------------------------------------
  // Leather Trapper Helmet Dome
  b.part(new THREE.SphereGeometry(0.15, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), LEATHER_PAINT, {
    bone: head,
    at: [0, 1.08, 0.06],
    scale: [1.14, 1.06, 1.12],
  });
  // Center Stitched Leather Ridge
  b.sweep(
    catmull([
      [0, 1.15, 0.18],
      [0, 1.23, 0.08],
      [0, 1.21, -0.06],
      [0, 1.11, -0.10],
    ]),
    0.02,
    { bone: head, color: C_LEATHER_LIGHT, sides: 6 },
  );

  // Folded Sheepskin Fur Brim
  b.sweep(
    catmull([
      [-0.15, 1.15, 0.14],
      [-0.08, 1.18, 0.17],
      [0, 1.19, 0.18],
      [0.08, 1.18, 0.17],
      [0.15, 1.15, 0.14],
    ]),
    0.026,
    { bone: head, color: C_COAT_TRIM, sides: 8 },
  );

  // Helmet Side Ear Flaps
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.15, 1.11, 0.08], [s * 0.15, 0.99, 0.04], [0.085, 0.03], [0.065, 0.025], {
      bone: head,
      color: LEATHER_PAINT,
    });
    b.part(new THREE.BoxGeometry(0.016, 0.095, 0.065), C_COAT_TRIM, {
      bone: head,
      at: [s * 0.14, 1.04, 0.06],
    });
  }

  // Goggle Leather Strap
  b.sweep(
    catmull([
      [-0.16, 1.17, 0.06],
      [-0.13, 1.18, 0.14],
      [0, 1.18, 0.17],
      [0.13, 1.18, 0.14],
      [0.16, 1.17, 0.06],
      [0.13, 1.17, -0.06],
      [0, 1.17, -0.09],
      [-0.13, 1.17, -0.06],
    ], { closed: true }),
    [0.024, 0.008],
    { bone: head, color: C_LEATHER_DARK, sides: 6 },
  );

  // Goggle Direction: Tilted flat/slightly forward so lenses face viewer clearly!
  const goggleDir: [number, number, number] = [0, -0.02, 1.0];

  // Left Goggle: Standard Brass Ocular Lens
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.028, 12), BRASS_PAINT, {
    bone: head,
    at: [0.068, 1.18, 0.18],
    dir: [0.12, goggleDir[1], goggleDir[2]],
  });
  b.part(new THREE.CircleGeometry(0.031, 12), "#163c46", {
    bone: head,
    at: [0.070, 1.18, 0.195],
    dir: [0.12, goggleDir[1], goggleDir[2]],
    axis: "z",
  });

  // Right Goggle: Hero Advanced Sniper Monocular with Glowing Cyan Reticle!
  const scopePos: [number, number, number] = [-0.068, 1.18, 0.18];
  const scopeDir: [number, number, number] = [-0.12, goggleDir[1], goggleDir[2]];

  b.part(new THREE.CylinderGeometry(0.038, 0.035, 0.046, 12), BRASS_PAINT, {
    bone: head,
    at: scopePos,
    dir: scopeDir,
  });
  b.part(new THREE.CylinderGeometry(0.040, 0.040, 0.012, 12), IRON_PAINT, {
    bone: head,
    at: [-0.066, 1.18, 0.168],
    dir: scopeDir,
  });
  // Knurled Brass Elevation Turret
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), BRASS_PAINT, {
    bone: head,
    at: [-0.108, 1.18, 0.18],
    dir: [-1, 0, 0],
  });

  // Glowing Cyan Reticle Lens (Bright & Unmistakable!)
  const reticlePart = b.part(new THREE.CircleGeometry(0.034, 16), "#ffffff", {
    bone: head,
    at: [-0.071, 1.18, 0.205],
    dir: scopeDir,
    axis: "z",
    texture: RETICLE_TEX,
  });
  glow(reticlePart, 2.0);

  // Central Goggle Bridge
  b.part(new THREE.BoxGeometry(0.044, 0.018, 0.015), BRASS_PAINT, {
    bone: head,
    at: [0, 1.18, 0.188],
  });

  // --------------------------------------------------------------------------
  // MOUNTAINEER BACKPACK & BEDROLL
  // --------------------------------------------------------------------------
  b.frustumBox([0, 0.64, -0.12], [0, 0.88, -0.16], [0.38, 0.24], [0.34, 0.22], {
    bone: chest,
    color: LEATHER_PAINT,
  });
  b.part(new THREE.BoxGeometry(0.36, 0.09, 0.24), C_LEATHER_DARK, {
    bone: chest,
    at: [0, 0.88, -0.16],
    dir: [0, -0.3, 1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.18, 0.016), C_LEATHER_LIGHT, {
      bone: chest,
      at: [s * 0.11, 0.80, -0.28],
    });
    b.part(new THREE.BoxGeometry(0.032, 0.026, 0.022), BRASS_PAINT, {
      bone: chest,
      at: [s * 0.11, 0.76, -0.285],
    });
  }

  // Rolled Bedroll
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.46, 12), "#485868", {
    bone: chest,
    at: [0, 0.98, -0.17],
    dir: [1, 0, 0],
    axis: "y",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.018, 12, 1, true), C_LEATHER_DARK, {
      bone: chest,
      at: [s * 0.15, 0.98, -0.17],
      dir: [1, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.026, 0.026, 0.016), BRASS_PAINT, {
      bone: chest,
      at: [s * 0.15, 1.05, -0.17],
    });
  }

  // --------------------------------------------------------------------------
  // THE BLUNDERBUSS (Hero Weapon - Boldly Angled & Prominently Visible!)
  // --------------------------------------------------------------------------
  // Diagonally slung across his back:
  // Stock base projects out past his right flank (x = +0.38, y = 0.50), clearly
  // visible beside his belt and arm from the front!
  // Flared trumpet bell soars high and wide past his left shoulder (x = -0.46, y = 1.48),
  // creating a glorious hero silhouette in all renders!
  const stockBase: [number, number, number] = [0.38, 0.50, -0.22];
  const stockWrist: [number, number, number] = [0.22, 0.72, -0.24];
  const breechPt: [number, number, number] = [0.04, 0.94, -0.25];
  const forearmEnd: [number, number, number] = [-0.14, 1.14, -0.21];

  const gunAxis = new THREE.Vector3(
    forearmEnd[0] - stockBase[0],
    forearmEnd[1] - stockBase[1],
    forearmEnd[2] - stockBase[2],
  ).normalize();
  const gunQuat = aim(gunAxis, new THREE.Vector3(0, 1, 0));

  // Carved Walnut Stock (Fully visible below right arm!)
  b.loft(
    [
      { at: stockBase, w: 0.07, h: 0.19 }, // Wide buttplate
      { at: [0.30, 0.61, -0.23], w: 0.06, h: 0.13 }, // Comb
      { at: stockWrist, w: 0.048, h: 0.075 }, // Wrist grip
      { at: breechPt, w: 0.065, h: 0.09 }, // Breech bed
      { at: forearmEnd, w: 0.054, h: 0.07 }, // Forearm tip
    ],
    { bone: chest, color: WOOD_PAINT },
  );

  // Brass Buttplate
  b.part(new THREE.BoxGeometry(0.075, 0.195, 0.024), BRASS_PAINT, {
    bone: chest,
    at: [stockBase[0] + 0.01, stockBase[1] - 0.01, stockBase[2] - 0.005],
    quat: gunQuat,
  });

  // Barrel Positions
  const barrelStart: [number, number, number] = [0.04, 0.94, -0.24];
  const barrelMid: [number, number, number] = [-0.18, 1.18, -0.19];
  const bellBase: [number, number, number] = [-0.34, 1.36, -0.13];
  const bellLip: [number, number, number] = [-0.46, 1.48, -0.07];

  const barrelDir = new THREE.Vector3(
    bellLip[0] - barrelStart[0],
    bellLip[1] - barrelStart[1],
    bellLip[2] - barrelStart[2],
  ).normalize();

  // Octagonal Breech
  b.sweep(catmull([barrelStart, barrelMid]), 0.044, {
    bone: chest,
    color: IRON_PAINT,
    sides: 8,
  });

  // Round Mid-Barrel
  b.sweep(catmull([barrelMid, bellBase]), 0.041, {
    bone: chest,
    color: IRON_PAINT,
    sides: 10,
  });

  // Ornate Brass Barrel Reinforcement Bands
  for (const tBand of [0.35, 0.82]) {
    const bPt = new THREE.Vector3().lerpVectors(new THREE.Vector3(...barrelStart), new THREE.Vector3(...bellBase), tBand);
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 12), BRASS_PAINT, {
      bone: chest,
      at: [bPt.x, bPt.y, bPt.z],
      dir: [barrelDir.x, barrelDir.y, barrelDir.z],
    });
  }

  // Giant Flared Trumpet Bell Muzzle (Seamless Lathe with Interior Bore!)
  const bellOutline: [number, number][] = [
    [0.0, 0.0],
    [0.041, 0.0],
    [0.050, 0.04],
    [0.072, 0.09],
    [0.108, 0.15],
    [0.128, 0.18], // Outer flared rim lip
    [0.114, 0.18], // Beveled lip thickness
    [0.092, 0.15],
    [0.058, 0.09],
    [0.035, 0.04],
    [0.0, 0.04], // Inner hollow bore floor
  ];

  b.lathe(bellOutline, {
    bone: chest,
    at: bellBase,
    axis: [barrelDir.x, barrelDir.y, barrelDir.z],
    segments: 16,
    color: BRASS_PAINT,
  });

  // Dark Bore Interior Disc
  b.part(new THREE.CircleGeometry(0.034, 12), "#080a0e", {
    bone: chest,
    at: [bellBase[0] + barrelDir.x * 0.04, bellBase[1] + barrelDir.y * 0.04, bellBase[2] + barrelDir.z * 0.04],
    dir: [barrelDir.x, barrelDir.y, barrelDir.z],
    axis: "z",
  });

  // Flintlock Lockplate with Scrollwork
  b.part(new THREE.BoxGeometry(0.088, 0.044, 0.014), "#ffffff", {
    bone: chest,
    at: [0.03, 0.95, -0.22],
    quat: gunQuat,
    texture: LOCKPLATE_TEX,
  });
  // Cocking Hammer & Flint
  b.part(new THREE.CylinderGeometry(0.01, 0.014, 0.05, 6), IRON_PAINT, {
    bone: chest,
    at: [0.035, 0.98, -0.21],
    dir: [0.3, 0.8, -0.5],
  });
  b.part(new THREE.BoxGeometry(0.022, 0.016, 0.015), IRON_PAINT, {
    bone: chest,
    at: [0.04, 1.01, -0.20],
    quat: gunQuat,
  });
  // Frizzen & Brass Flash Pan
  b.part(new THREE.BoxGeometry(0.02, 0.036, 0.008), IRON_PAINT, {
    bone: chest,
    at: [0.012, 0.98, -0.205],
    dir: [-0.4, 0.8, 0.4],
  });
  b.part(new THREE.BoxGeometry(0.018, 0.014, 0.015), BRASS_PAINT, {
    bone: chest,
    at: [0.012, 0.96, -0.21],
    quat: gunQuat,
  });

  // Trigger Guard & Trigger
  b.sweep(
    catmull([
      [0.20, 0.74, -0.23],
      [0.17, 0.72, -0.20],
      [0.13, 0.79, -0.19],
      [0.16, 0.81, -0.22],
    ]),
    0.007,
    { bone: chest, color: BRASS_PAINT, sides: 6 },
  );
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.024, 6), IRON_PAINT, {
    bone: chest,
    at: [0.165, 0.76, -0.21],
    dir: [-0.3, 0.9, -0.3],
  });

  // Steel Ramrod Under Barrel
  const ramrodStart: [number, number, number] = [0.06, 0.90, -0.28];
  const ramrodEnd: [number, number, number] = [-0.28, 1.28, -0.18];
  b.sweep(catmull([ramrodStart, ramrodEnd]), 0.008, {
    bone: chest,
    color: IRON_PAINT,
    sides: 6,
  });
  for (const tThimble of [0.38, 0.82]) {
    const tPt = new THREE.Vector3().lerpVectors(new THREE.Vector3(...ramrodStart), new THREE.Vector3(...ramrodEnd), tThimble);
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.022, 8), BRASS_PAINT, {
      bone: chest,
      at: [tPt.x, tPt.y, tPt.z],
      dir: [barrelDir.x, barrelDir.y, barrelDir.z],
    });
  }

  // Gun Sling Strapping Gun Across Shoulder
  b.sweep(
    catmull([
      [0.34, 0.54, -0.21],
      [0.18, 0.62, -0.26],
      [-0.04, 0.82, -0.26],
      [-0.14, 1.04, -0.22],
    ]),
    [0.022, 0.008],
    { bone: chest, color: LEATHER_PAINT, sides: 6 },
  );

  // --------------------------------------------------------------------------
  // STAGED BASE (Dun Morogh Mountain Outcrop, Snow & Gunpowder Keg)
  // --------------------------------------------------------------------------
  // Solid Granite Outcrop Base (y = 0.0 to 0.04)
  b.part(new THREE.CylinderGeometry(0.56, 0.60, 0.04, 10), STONE_PAINT, {
    at: [0, 0.02, 0.04],
  });
  b.part(new THREE.CylinderGeometry(0.48, 0.52, 0.02, 8), STONE_PAINT, {
    at: [0.04, 0.04, 0.02],
    rotation: [0, 22, 0],
  });

  // Natural Banked Snow Drifts (Mounded smoothly across the base)
  const snowDriftPoints = [
    [-0.42, 0.04, -0.24],
    [-0.28, 0.055, -0.32],
    [0.0, 0.05, -0.36],
    [0.32, 0.06, -0.26],
    [0.46, 0.045, -0.08],
    [0.48, 0.05, 0.16],
    [0.34, 0.04, 0.36],
    [0.06, 0.05, 0.42],
    [-0.24, 0.045, 0.38],
    [-0.46, 0.04, 0.18],
  ];
  for (let i = 0; i < snowDriftPoints.length; i++) {
    const pt = snowDriftPoints[i];
    b.part(new THREE.SphereGeometry(0.14, 7, 5), SNOW_PAINT, {
      at: pt,
      scale: [1.3, 0.34, 1.2],
    });
  }

  // Dun Morogh Blasting Powder Keg (Shifted forward/left for dramatic framing!)
  const kegPos: [number, number, number] = [-0.36, 0.04, 0.22];
  const kegOutline: [number, number][] = [
    [0.0, 0.0],
    [0.11, 0.0],
    [0.125, 0.05],
    [0.138, 0.12],
    [0.125, 0.19],
    [0.11, 0.24],
    [0.0, 0.24],
    [0.0, 0.0],
  ];

  // Wooden Staves
  b.lathe(kegOutline, {
    at: [kegPos[0], kegPos[1], kegPos[2]],
    axis: [0, 1, 0],
    segments: 14,
    color: WOOD_PAINT,
  });

  // 4 Horizontal Forged Iron Barrel Hoops
  for (const hY of [0.02, 0.07, 0.17, 0.22]) {
    const rHoop = hY === 0.07 || hY === 0.17 ? 0.139 : 0.122;
    b.part(new THREE.CylinderGeometry(rHoop, rHoop, 0.016, 14, 1, true), IRON_PAINT, {
      at: [kegPos[0], kegPos[1] + hY, kegPos[2]],
      dir: [0, 1, 0],
    });
  }

  // Gunpowder Explosive Stencil
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [kegPos[0], kegPos[1] + 0.12, kegPos[2] + 0.142],
    dir: [0, 0, 1],
    axis: "z",
    texture: KEG_LABEL_TEX,
  });

  // Brass Bunghole Plug & Lit Fuse with Glowing Ember!
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.018, 8), BRASS_PAINT, {
    at: [kegPos[0] + 0.03, kegPos[1] + 0.245, kegPos[2] - 0.02],
    dir: [0, 1, 0],
  });
  b.sweep(
    catmull([
      [kegPos[0] + 0.03, kegPos[1] + 0.25, kegPos[2] - 0.02],
      [kegPos[0] + 0.04, kegPos[1] + 0.28, kegPos[2] - 0.01],
      [kegPos[0] + 0.06, kegPos[1] + 0.29, kegPos[2] + 0.02],
      [kegPos[0] + 0.05, kegPos[1] + 0.27, kegPos[2] + 0.04],
    ]),
    0.005,
    { color: "#3a2c1e", sides: 6 },
  );

  // Burning Hot Fuse Ember (Glowing Red/Orange Spark!)
  const emberPart = b.part(new THREE.SphereGeometry(0.009, 6, 6), "#ff3a1a", {
    at: [kegPos[0] + 0.05, kegPos[1] + 0.27, kegPos[2] + 0.04],
  });
  glow(emberPart, 2.5);

  // Spent Brass Shell Casings in the Snow
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.044, 8), BRASS_PAINT, {
    at: [-0.20, 0.055, 0.28],
    dir: [0.7, 0.2, 0.6],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.044, 8), BRASS_PAINT, {
    at: [-0.38, 0.052, 0.38],
    dir: [-0.4, 0.1, 0.9],
  });

  // Alpine Pine Seedling / Mountain Lichen
  for (let l = 0; l < 4; l++) {
    const lAngle = (l * Math.PI) / 2 + 0.3;
    b.part(new THREE.ConeGeometry(0.03, 0.07, 5), "#364c40", {
      at: [0.38 + Math.cos(lAngle) * 0.035, 0.055, 0.26 + Math.sin(lAngle) * 0.035],
      dir: [Math.cos(lAngle) * 0.4, 0.9, Math.sin(lAngle) * 0.4],
    });
  }

  return b.root;
}
