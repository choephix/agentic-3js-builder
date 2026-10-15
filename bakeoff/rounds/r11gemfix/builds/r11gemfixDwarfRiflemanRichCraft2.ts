import * as THREE from "three";
import {
  createBuilder,
  aim,
  vec,
  DEG,
  catmull,
  paint,
  mix,
  smoothstep,
  noise,
  rgb,
  svg,
} from "../../../../src/index";

// ============================================================================
// METADATA
// ============================================================================
export const meta = {
  name: "dwarf_rifleman",
  description:
    "Warcraft-inspired dwarf mountaineer rifleman with braided ginger beard, brass sniper goggles, heavy quilted coat, and ornate blunderbuss on a snowy Dun Morogh base.",
};

// ============================================================================
// PALETTE & PAINTS
// ============================================================================

// Base color constants
const C_SKIN_BASE = "#d89674";
const C_SKIN_SHADOW = "#8f503c";
const C_SKIN_WARM = "#c85848";

const C_HAIR_BASE = "#d65018";
const C_HAIR_LIGHT = "#fa7e32";
const C_HAIR_DARK = "#782208";

const C_COAT_RED = "#7a221c";
const C_COAT_SHADOW = "#4a1210";
const C_COAT_TRIM = "#d8cbb8";

const C_LEATHER_DARK = "#322016";
const C_LEATHER_MED = "#523624";
const C_LEATHER_LIGHT = "#744d32";

const C_BRASS_LIGHT = "#f4c65a";
const C_BRASS_MED = "#c6922a";
const C_BRASS_DARK = "#6c4812";

const C_IRON_LIGHT = "#788090";
const C_IRON_MED = "#424854";
const C_IRON_DARK = "#22262e";

const C_WOOD_MED = "#54341c";
const C_WOOD_DARK = "#321d0e";

const C_SNOW_LIGHT = "#f2f7fc";
const C_SNOW_SHADOW = "#adc2d8";
const C_STONE_MED = "#4a505a";
const C_STONE_DARK = "#282c34";

// Procedural paints
const SKIN_PAINT = paint((p, n) => {
  const heightWarmth = smoothstep(0.95, 1.15, p.y);
  const noseWarmth = smoothstep(0.12, 0.22, p.z) * smoothstep(1.0, 1.12, p.y) * (1 - Math.abs(p.x) * 8);
  const shadow = smoothstep(0.2, -0.4, n.y);
  let col = mix(C_SKIN_BASE, C_SKIN_WARM, Math.max(0, noseWarmth * 0.85 + heightWarmth * 0.2));
  return mix(col, C_SKIN_SHADOW, shadow * 0.55);
});

const BEARD_PAINT = paint((p, n) => {
  const grainVal = noise(new THREE.Vector3(p.x * 14, p.y * 3.5, p.z * 14), 0.08, 12);
  const base = mix(C_HAIR_BASE, C_HAIR_LIGHT, grainVal * 0.7);
  const ambient = smoothstep(0.4, -0.6, n.y) * 0.45;
  return mix(base, C_HAIR_DARK, ambient);
});

const COAT_PAINT = paint((p, n) => {
  const quiltU = Math.abs(Math.sin((p.x + p.y) * 26));
  const quiltV = Math.abs(Math.sin((p.x - p.y) * 26));
  const seam = smoothstep(0.85, 0.98, Math.max(quiltU, quiltV));
  const base = mix(C_COAT_RED, C_COAT_SHADOW, seam * 0.5);
  const rim = smoothstep(0.3, 0.9, n.y) * 0.15;
  return mix(base, "#9e322a", rim);
});

const LEATHER_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.06, 7);
  const base = mix(C_LEATHER_DARK, C_LEATHER_MED, nVal);
  const wear = smoothstep(0.5, 0.9, Math.abs(n.x) + Math.abs(n.z)) * 0.15;
  return mix(base, C_LEATHER_LIGHT, wear);
});

const BRASS_PAINT = paint((p, n) => {
  const glint = smoothstep(0.4, 0.95, n.y * 0.7 + n.z * 0.7);
  const crevice = smoothstep(0.1, -0.5, n.y);
  const base = mix(C_BRASS_MED, C_BRASS_LIGHT, glint * 0.6);
  return mix(base, C_BRASS_DARK, crevice * 0.4);
});

const IRON_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.05, 33);
  const base = mix(C_IRON_MED, C_IRON_LIGHT, nVal * 0.4);
  const crevice = smoothstep(0.2, -0.6, n.y);
  return mix(base, C_IRON_DARK, crevice * 0.5);
});

const WOOD_PAINT = paint((p, n) => {
  const grainVal = Math.sin(p.z * 48 + noise(p, 0.04, 5) * 6);
  const band = smoothstep(-0.3, 0.3, grainVal);
  return mix(C_WOOD_MED, C_WOOD_DARK, band * 0.5);
});

const SNOW_PAINT = paint((p, n) => {
  const shade = smoothstep(0.3, -0.4, n.y);
  return mix(C_SNOW_LIGHT, C_SNOW_SHADOW, shade * 0.7);
});

const STONE_PAINT = paint((p, n) => {
  const nVal = noise(p, 0.1, 19);
  const base = mix(C_STONE_MED, C_STONE_DARK, nVal * 0.6);
  return mix(base, "#1c2026", smoothstep(0.0, -0.7, n.y));
});

// ============================================================================
// TEXTURES (SVG)
// ============================================================================

// Stylized dwarf eye with fierce iris and gleam
const EYE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <ellipse cx="64" cy="64" rx="60" ry="54" fill="#120c18"/>
    <ellipse cx="64" cy="64" rx="54" ry="48" fill="#eef3f8"/>
    <ellipse cx="64" cy="64" rx="36" ry="42" fill="#162b44"/>
    <ellipse cx="64" cy="64" rx="32" ry="38" fill="#2d6ea4"/>
    <ellipse cx="64" cy="68" rx="26" ry="30" fill="#4ea4e0"/>
    <ellipse cx="64" cy="64" rx="16" ry="20" fill="#08101a"/>
    <circle cx="52" cy="52" r="9" fill="#ffffff"/>
    <circle cx="76" cy="74" r="4.5" fill="#ffffff"/>
    <path d="M12 28 Q64 12 116 28" stroke="#120c18" stroke-width="12" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// Dwarven knotwork and runes for beard rings
const BEARD_RING_TEX = svg(
  `<svg viewBox="0 0 256 64">
    <rect width="256" height="64" fill="#583c10"/>
    <rect y="4" width="256" height="56" fill="#aa7c22"/>
    <path d="M0 8 L32 32 L0 56 M32 8 L64 32 L32 56 M64 8 L96 32 L64 56 M96 8 L128 32 L96 56 M128 8 L160 32 L128 56 M160 8 L192 32 L160 56 M192 8 L224 32 L192 56 M224 8 L256 32 L224 56" stroke="#f4ce62" stroke-width="5" fill="none"/>
    <line x1="0" y1="4" x2="256" y2="4" stroke="#ffd978" stroke-width="3"/>
    <line x1="0" y1="60" x2="256" y2="60" stroke="#ffd978" stroke-width="3"/>
    <circle cx="16" cy="32" r="3.5" fill="#2c1a06"/>
    <circle cx="80" cy="32" r="3.5" fill="#2c1a06"/>
    <circle cx="144" cy="32" r="3.5" fill="#2c1a06"/>
    <circle cx="208" cy="32" r="3.5" fill="#2c1a06"/>
  </svg>`,
  { size: 256 },
);

// Dwarven Ram / Anvil belt buckle crest
const BUCKLE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <polygon points="64,8 116,36 116,92 64,120 12,92 12,36" fill="#886016" stroke="#f8d46e" stroke-width="6"/>
    <polygon points="64,18 106,42 106,86 64,110 22,86 22,42" fill="#442a08"/>
    <!-- Ram Horns -->
    <path d="M46 56 Q30 38 42 26 Q56 16 64 36" stroke="#f6cd60" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M82 56 Q98 38 86 26 Q72 16 64 36" stroke="#f6cd60" stroke-width="9" fill="none" stroke-linecap="round"/>
    <!-- Anvil / Hammer center -->
    <polygon points="46,62 82,62 76,82 52,82" fill="#d29e30"/>
    <rect x="58" y="82" width="12" height="22" fill="#d29e30"/>
    <polygon points="38,100 90,100 82,106 46,106" fill="#f6cd60"/>
    <circle cx="64" cy="46" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// Engraved flintlock lockplate with scrollwork
const LOCKPLATE_TEX = svg(
  `<svg viewBox="0 0 256 128">
    <rect width="256" height="128" rx="20" fill="#383d46" stroke="#687080" stroke-width="6"/>
    <path d="M24 64 Q64 24 128 32 Q192 40 232 64 Q180 96 128 88 Q76 80 24 64" fill="none" stroke="#22252a" stroke-width="6"/>
    <path d="M36 64 Q80 38 128 44 Q176 50 216 64" fill="none" stroke="#8fa0b8" stroke-width="3"/>
    <circle cx="48" cy="64" r="8" fill="#1e2026" stroke="#8fa0b8" stroke-width="3"/>
    <circle cx="208" cy="64" r="8" fill="#1e2026" stroke="#8fa0b8" stroke-width="3"/>
    <circle cx="128" cy="72" r="10" fill="#1e2026" stroke="#8fa0b8" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

// Dwarven sniper scope reticle
const RETICLE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="62" fill="#0e2832" stroke="#d6a030" stroke-width="4"/>
    <circle cx="64" cy="64" r="54" fill="none" stroke="#2cd4d9" stroke-width="2"/>
    <circle cx="64" cy="64" r="32" fill="none" stroke="#2cd4d9" stroke-width="1.5" stroke-dasharray="4 3"/>
    <circle cx="64" cy="64" r="8" fill="none" stroke="#ff4a36" stroke-width="2"/>
    <line x1="64" y1="8" x2="64" y2="120" stroke="#2cd4d9" stroke-width="2"/>
    <line x1="8" y1="64" x2="120" y2="64" stroke="#2cd4d9" stroke-width="2"/>
    <!-- Range ticks -->
    <line x1="56" y1="44" x2="72" y2="44" stroke="#2cd4d9" stroke-width="2"/>
    <line x1="58" y1="54" x2="70" y2="54" stroke="#2cd4d9" stroke-width="1.5"/>
    <line x1="56" y1="84" x2="72" y2="84" stroke="#2cd4d9" stroke-width="2"/>
    <line x1="58" y1="74" x2="70" y2="74" stroke="#2cd4d9" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);

// Powder Keg stencil label
const KEG_LABEL_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <rect width="128" height="128" fill="none"/>
    <circle cx="64" cy="64" r="58" fill="#241a10" stroke="#8a2014" stroke-width="5"/>
    <!-- Crossed hammers -->
    <path d="M38 32 L90 96 M90 32 L38 96" stroke="#9a3020" stroke-width="8" stroke-linecap="round"/>
    <rect x="28" y="24" width="22" height="14" rx="3" fill="#c6922a"/>
    <rect x="78" y="24" width="22" height="14" rx="3" fill="#c6922a"/>
    <!-- Big XXX -->
    <text x="64" y="60" text-anchor="middle" font-family="monospace" font-weight="900" font-size="28" fill="#e63c24">XXX</text>
    <text x="64" y="82" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#f4cf70">DUN MOROGH</text>
    <text x="64" y="98" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff">BLASTING</text>
  </svg>`,
  { size: 256 },
);

// Leather pouch badge
const POUCH_BADGE_TEX = svg(
  `<svg viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#442a18"/>
    <rect x="8" y="8" width="112" height="112" rx="16" fill="#321e10" stroke="#221208" stroke-width="6"/>
    <path d="M16 16 L112 16 L112 80 L64 112 L16 80 Z" fill="#583620" stroke="#9e6a3c" stroke-width="4"/>
    <circle cx="64" cy="68" r="14" fill="#c6922a" stroke="#f4ce62" stroke-width="4"/>
    <circle cx="64" cy="68" r="5" fill="#2c1a08"/>
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
  // Dwarf ground: feet touch y = 0. Hips are at y = 0.52.
  const hips = b.joint("hips", { at: [0, 0.52, -0.02], role: "spine" });

  const spinePath = catmull([
    [0, 0.52, -0.02],
    [0, 0.68, 0.0],
    [0, 0.86, 0.03],
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
    at: [0, 1.04, 0.08],
    dir: [0, 0.2, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.98, 0.12],
    aim: [0, 0.95, 0.22],
    role: "jaw",
  });

  // Limbs: Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos: [number, number, number] = [s * 0.16, 0.5, -0.02];
    const kneePos: [number, number, number] = [s * 0.19, 0.28, 0.03];
    const anklePos: [number, number, number] = [s * 0.2, 0.1, -0.01];
    const footPos: [number, number, number] = [s * 0.2, 0.03, 0.08];

    const legChain = b.chain(`leg${side}`, catmull([hipPos, kneePos, anklePos, footPos]), {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.2, 0.0, 0.08],
    });

    // Thighs
    b.sweep(catmull([hipPos, kneePos]), [0.09, 0.08], {
      bone: legChain.joints[0],
      color: LEATHER_PAINT,
      sides: 8,
    });

    // Shin & Kneepad
    b.sweep(catmull([kneePos, anklePos]), [0.085, 0.075], {
      bone: legChain.joints[1],
      color: LEATHER_PAINT,
      sides: 8,
    });
    // Knee armor plate
    b.part(new THREE.BoxGeometry(0.1, 0.09, 0.04), BRASS_PAINT, {
      bone: legChain.joints[1],
      at: kneePos,
      dir: [0, 0.2, 1],
    });

    // Heavy Stompy Dwarven Boots
    const bootBone = legChain.joints[2] ?? legChain.joints[1];
    // Boot shaft
    b.frustumBox([s * 0.2, 0.18, 0.01], [s * 0.2, 0.06, 0.01], [0.15, 0.14], [0.16, 0.16], {
      bone: bootBone,
      color: C_LEATHER_DARK,
    });
    // Boot fur rim
    b.sweep(
      catmull([
        [s * 0.2 + s * 0.08, 0.18, 0.01],
        [s * 0.2, 0.18, 0.09],
        [s * 0.2 - s * 0.08, 0.18, 0.01],
        [s * 0.2, 0.18, -0.07],
      ], { closed: true }),
      0.024,
      { bone: bootBone, color: C_COAT_TRIM, sides: 8 },
    );
    // Foot sole & toe block
    b.frustumBox([s * 0.2, 0.05, 0.01], [s * 0.2, 0.05, 0.13], [0.15, 0.08], [0.14, 0.07], {
      bone: bootBone,
      color: C_LEATHER_DARK,
    });
    // Heavy iron toe cap
    b.part(new THREE.CylinderGeometry(0.065, 0.075, 0.06, 8, 1, false, -Math.PI / 2, Math.PI), IRON_PAINT, {
      bone: bootBone,
      at: [s * 0.2, 0.035, 0.13],
      dir: [0, 1, 0],
      axis: "y",
    });
    // Bottom sole tread resting on ground
    b.part(new THREE.BoxGeometry(0.16, 0.025, 0.22), IRON_PAINT, {
      bone: bootBone,
      at: [s * 0.2, 0.012, 0.06],
    });
    // Instep strap & brass buckle
    b.part(new THREE.BoxGeometry(0.15, 0.02, 0.04), C_LEATHER_MED, {
      bone: bootBone,
      at: [s * 0.2, 0.07, 0.06],
      dir: [0, 0.4, 1],
    });
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.015), BRASS_PAINT, {
      bone: bootBone,
      at: [s * 0.2, 0.075, 0.075],
      dir: [0, 0.4, 1],
    });
  }

  // Limbs: Arms (A-pose for rigging readability)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPos: [number, number, number] = [s * 0.28, 0.88, 0.02];
    const elbowPos: [number, number, number] = [s * 0.44, 0.7, -0.01];
    const wristPos: [number, number, number] = [s * 0.54, 0.5, 0.06];
    const handPos: [number, number, number] = [s * 0.6, 0.38, 0.12];

    const armChain = b.chain(`arm${side}`, catmull([shoulderPos, elbowPos, wristPos, handPos]), {
      parent: chest,
      names: [`shoulder${side}`, `forearm${side}`, `hand${side}`],
      role: "arm",
    });

    // Upper arm sleeve (quilted russet wool)
    b.sweep(catmull([shoulderPos, elbowPos]), [0.09, 0.08], {
      bone: armChain.joints[0],
      color: COAT_PAINT,
      sides: 8,
    });

    // Massive Dwarven Spaulder (Shoulder armor plate)
    b.part(new THREE.SphereGeometry(0.11, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), IRON_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.29, 0.9, 0.02],
      dir: [s * 0.6, 0.8, 0],
    });
    // Spaulder brass rim
    b.part(new THREE.TorusGeometry(0.11, 0.022, 6, 12), BRASS_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.29, 0.89, 0.02],
      dir: [s * 0.6, 0.8, 0],
    });
    // Center boss rivet
    b.part(new THREE.SphereGeometry(0.028, 6, 6), BRASS_PAINT, {
      bone: armChain.joints[0],
      at: [s * 0.38, 0.96, 0.02],
    });

    // Forearm Gauntlet with flared cuff
    const foreBone = armChain.joints[1];
    b.sweep(catmull([elbowPos, wristPos]), [0.085, 0.07], {
      bone: foreBone,
      color: LEATHER_PAINT,
      sides: 8,
    });
    // Flared gauntlet cuff at elbow
    b.part(new THREE.CylinderGeometry(0.095, 0.075, 0.06, 8), BRASS_PAINT, {
      bone: foreBone,
      at: [s * 0.42, 0.71, 0.0],
      dir: [s * 0.5, -0.8, 0.2],
    });
    // Twin wrist straps
    b.part(new THREE.TorusGeometry(0.072, 0.012, 6, 10), C_LEATHER_DARK, {
      bone: foreBone,
      at: [s * 0.5, 0.56, 0.04],
      dir: [s * 0.5, -0.8, 0.2],
    });
    b.part(new THREE.TorusGeometry(0.068, 0.012, 6, 10), C_LEATHER_DARK, {
      bone: foreBone,
      at: [s * 0.52, 0.52, 0.05],
      dir: [s * 0.5, -0.8, 0.2],
    });

    // Hand & Fingers (Chunky dwarf glove)
    const handBone = armChain.joints[2] ?? foreBone;
    // Palm / Glove back
    b.frustumBox(wristPos, handPos, [0.08, 0.06], [0.075, 0.055], {
      bone: handBone,
      color: LEATHER_PAINT,
    });
    // Padded brass knuckle plate
    b.part(new THREE.BoxGeometry(0.065, 0.025, 0.04), BRASS_PAINT, {
      bone: handBone,
      at: [s * 0.58, 0.41, 0.11],
      dir: [s * 0.5, -0.6, 0.6],
    });
    // Thumb
    b.capsule([s * 0.56, 0.44, 0.1], [s * 0.54, 0.37, 0.15], 0.018, {
      bone: handBone,
      color: LEATHER_PAINT,
    });
    // 3 Chunky dwarf fingers splayed in rest pose
    for (let f = -1; f <= 1; f++) {
      const fX = s * 0.6 + f * s * 0.02;
      const fY = 0.38 - Math.abs(f) * 0.005;
      const fZ = 0.12 + f * 0.015;
      b.capsule([fX, fY, fZ], [fX + s * 0.02, fY - 0.05, fZ + 0.02], 0.016, {
        bone: handBone,
        color: LEATHER_PAINT,
      });
    }
  }

  // --------------------------------------------------------------------------
  // TORSO & CLOTHING
  // --------------------------------------------------------------------------
  // Broad heavy dwarven chest & abdomen
  b.loft(
    [
      { at: [0, 0.52, -0.02], w: 0.48, h: 0.36 }, // Hips / Pelvis
      { at: [0, 0.64, 0.0], w: 0.54, h: 0.4 }, // Abdomen
      { at: [0, 0.78, 0.03], w: 0.58, h: 0.42 }, // Broad chest
      { at: [0, 0.9, 0.04], w: 0.52, h: 0.36 }, // Upper chest
    ],
    { bone: [hips, chest], color: COAT_PAINT },
  );

  // Massive Shearling Fur Mantle / Collar around neck
  b.sweep(
    catmull([
      [-0.24, 0.9, 0.06],
      [-0.18, 0.93, 0.16],
      [0, 0.92, 0.18],
      [0.18, 0.93, 0.16],
      [0.24, 0.9, 0.06],
      [0.18, 0.91, -0.1],
      [0, 0.93, -0.12],
      [-0.18, 0.91, -0.1],
    ], { closed: true }),
    0.06,
    { bone: chest, color: C_COAT_TRIM, sides: 8 },
  );

  // Colossal Dwarven Belt
  b.sweep(
    catmull([
      [-0.26, 0.54, -0.01],
      [-0.18, 0.54, 0.18],
      [0, 0.54, 0.2],
      [0.18, 0.54, 0.18],
      [0.26, 0.54, -0.01],
      [0.18, 0.54, -0.2],
      [0, 0.54, -0.22],
      [-0.18, 0.54, -0.2],
    ], { closed: true }),
    0.05,
    { bone: hips, color: C_LEATHER_DARK, sides: 8 },
  );

  // Grand Dwarven Belt Buckle (Octagonal brass plate + Anvil/Ram badge)
  b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.024, 8), BRASS_PAINT, {
    bone: hips,
    at: [0, 0.54, 0.22],
    dir: [0, 0, 1],
  });
  b.part(new THREE.CircleGeometry(0.076, 8), "#ffffff", {
    bone: hips,
    at: [0, 0.54, 0.234],
    dir: [0, 0, 1],
    axis: "z",
    texture: BUCKLE_TEX,
  });

  // Cross-body Ammo Bandolier (Right shoulder to left hip)
  const bandolierPath = catmull([
    [-0.2, 0.94, 0.06],
    [-0.12, 0.82, 0.15],
    [0.0, 0.68, 0.19],
    [0.14, 0.56, 0.17],
    [0.2, 0.52, 0.04],
    [0.14, 0.54, -0.18],
    [0.0, 0.72, -0.19],
    [-0.14, 0.86, -0.12],
  ], { closed: true });
  b.sweep(bandolierPath, [0.032, 0.012], {
    bone: chest,
    color: LEATHER_PAINT,
    sides: 6,
  });

  // 6 Heavy Brass Rifle Cartridges on the Bandolier
  for (let c = 0; c < 6; c++) {
    const t = 0.08 + c * 0.055;
    const pt = bandolierPath.at(t);
    const tan = bandolierPath.tangentAt(t);
    const cartDir = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
    const pos = new THREE.Vector3(pt.x, pt.y, pt.z).addScaledVector(cartDir, 0.018);

    // Brass case
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.046, 8), BRASS_PAINT, {
      bone: chest,
      at: [pos.x, pos.y, pos.z],
      dir: [tan.x, tan.y, tan.z],
    });
    // Copper bullet tip
    b.part(new THREE.ConeGeometry(0.011, 0.02, 8), "#c85a2c", {
      bone: chest,
      at: [pos.x + tan.x * 0.03, pos.y + tan.y * 0.03, pos.z + tan.z * 0.03],
      dir: [tan.x, tan.y, tan.z],
    });
  }

  // Right Hip: Leather Ammo Box Pouch
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.08), LEATHER_PAINT, {
    bone: hips,
    at: [-0.22, 0.52, 0.12],
    dir: [-0.8, 0, 0.6],
  });
  b.part(new THREE.PlaneGeometry(0.09, 0.08), "#ffffff", {
    bone: hips,
    at: [-0.24, 0.52, 0.165],
    dir: [-0.8, 0, 0.6],
    axis: "z",
    texture: POUCH_BADGE_TEX,
  });

  // Left Hip: Dwarven Powder Horn
  const hornPath = catmull([
    [0.2, 0.54, 0.14],
    [0.25, 0.5, 0.1],
    [0.28, 0.44, 0.0],
    [0.25, 0.42, -0.08],
  ]);
  b.sweep(hornPath, (t) => 0.045 * Math.sin(t * Math.PI * 0.85 + 0.15) + 0.016, {
    bone: hips,
    color: "#e6dcc8",
    sides: 8,
  });
  // Powder horn brass spout & endcap
  b.part(new THREE.CylinderGeometry(0.014, 0.02, 0.03, 8), BRASS_PAINT, {
    bone: hips,
    at: [0.2, 0.54, 0.14],
    dir: [-0.4, 0.6, 0.7],
  });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), BRASS_PAINT, {
    bone: hips,
    at: [0.25, 0.42, -0.08],
  });

  // --------------------------------------------------------------------------
  // HEAD, FACE & EXPRESSIVE FEATURES
  // --------------------------------------------------------------------------
  // Head cranium
  b.part(new THREE.SphereGeometry(0.14, 12, 10), SKIN_PAINT, {
    bone: head,
    at: [0, 1.05, 0.08],
    scale: [1.1, 0.95, 1.05],
  });

  // Plump rosy cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.052, 8, 8), SKIN_PAINT, {
      bone: head,
      at: [s * 0.085, 1.02, 0.16],
    });
  }

  // Giant iconic bulbous dwarf nose
  b.part(new THREE.SphereGeometry(0.042, 10, 8), SKIN_PAINT, {
    bone: head,
    at: [0, 1.05, 0.21],
    scale: [1.15, 1.0, 1.1],
  });
  // Nostril wings
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 6, 6), SKIN_PAINT, {
      bone: head,
      at: [s * 0.034, 1.035, 0.195],
    });
  }

  // Eyes (textured discs with fierce gaze)
  for (const s of [1, -1]) {
    const eyePos: [number, number, number] = [s * 0.068, 1.09, 0.175];
    const eyeDir: [number, number, number] = [s * 0.25, 0.08, 0.95];
    b.part(new THREE.CircleGeometry(0.026, 12), "#ffffff", {
      bone: head,
      at: eyePos,
      dir: eyeDir,
      axis: "z",
      texture: EYE_TEX,
    });
    // Eyelid / socket ring
    b.part(new THREE.TorusGeometry(0.027, 0.007, 6, 12), C_SKIN_SHADOW, {
      bone: head,
      at: eyePos,
      dir: eyeDir,
    });
  }

  // Bushy fierce ginger eyebrows
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.02, 1.12, 0.19],
        [s * 0.065, 1.14, 0.185],
        [s * 0.11, 1.11, 0.16],
      ]),
      [0.018, 0.024, 0.008],
      { bone: head, color: BEARD_PAINT, sides: 6 },
    );
  }

  // Dwarven ears with gold hoop in left ear
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 8, 6), SKIN_PAINT, {
      bone: head,
      at: [s * 0.145, 1.05, 0.07],
      scale: [0.5, 1.1, 0.8],
      dir: [s * 0.8, 0.3, -0.4],
    });
    if (s > 0) {
      // Golden hoop earring in left ear
      b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), BRASS_PAINT, {
        bone: head,
        at: [s * 0.155, 1.025, 0.07],
        dir: [0, 0, 1],
      });
    }
  }

  // Lower jaw (riggable jaw bone)
  b.part(new THREE.BoxGeometry(0.12, 0.06, 0.1), SKIN_PAINT, {
    bone: jaw,
    at: [0, 0.96, 0.14],
  });

  // --------------------------------------------------------------------------
  // BEARD & MOUSTACHE (The Masterpiece Dwarf Feature!)
  // --------------------------------------------------------------------------
  // Grand Sweeping Handlebar Moustache (attached to head)
  for (const s of [1, -1]) {
    const stachePath = catmull([
      [0, 1.02, 0.22],
      [s * 0.06, 1.01, 0.23],
      [s * 0.13, 0.98, 0.21],
      [s * 0.19, 0.92, 0.17],
      [s * 0.22, 0.84, 0.13],
    ]);
    b.sweep(stachePath, (t) => (1 - t) * 0.038 + 0.006, {
      bone: head,
      color: BEARD_PAINT,
      sides: 8,
    });
  }

  // Main throat and chin beard backing mass
  b.loft(
    [
      { at: [0, 0.97, 0.14], w: 0.24, h: 0.16 },
      { at: [0, 0.85, 0.18], w: 0.28, h: 0.18 },
      { at: [0, 0.72, 0.2], w: 0.26, h: 0.16 },
      { at: [0, 0.58, 0.18], w: 0.2, h: 0.12 },
    ],
    { bone: head, color: BEARD_PAINT },
  );

  // Twin Braided Plaits (The signature Blizzard twin beard braids!)
  for (const s of [1, -1]) {
    const braidPoints = [
      [s * 0.07, 0.94, 0.18],
      [s * 0.085, 0.82, 0.23],
      [s * 0.095, 0.7, 0.24],
      [s * 0.08, 0.58, 0.21],
      [s * 0.06, 0.46, 0.17],
    ] as [number, number, number][];

    const braidPath = catmull(braidPoints);

    // Multi-bulge plait sweeps
    b.sweep(
      braidPath,
      (t) => {
        const seg = Math.sin(t * Math.PI * 4);
        return 0.042 + seg * 0.012;
      },
      { bone: head, color: BEARD_PAINT, sides: 8 },
    );

    // Brass Beard Rings / Clasps with runic engravings
    const ringTValues = [0.28, 0.65];
    for (const rT of ringTValues) {
      const rPt = braidPath.at(rT);
      const rTan = braidPath.tangentAt(rT);
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.036, 12), "#ffffff", {
        bone: head,
        at: [rPt.x, rPt.y, rPt.z],
        dir: [rTan.x, rTan.y, rTan.z],
        texture: BEARD_RING_TEX,
      });
      // Outer rim ridges on rings
      b.part(new THREE.TorusGeometry(0.046, 0.007, 6, 12), BRASS_PAINT, {
        bone: head,
        at: [rPt.x + rTan.x * 0.018, rPt.y + rTan.y * 0.018, rPt.z + rTan.z * 0.018],
        dir: [rTan.x, rTan.y, rTan.z],
      });
      b.part(new THREE.TorusGeometry(0.046, 0.007, 6, 12), BRASS_PAINT, {
        bone: head,
        at: [rPt.x - rTan.x * 0.018, rPt.y - rTan.y * 0.018, rPt.z - rTan.z * 0.018],
        dir: [rTan.x, rTan.y, rTan.z],
      });
    }

    // Terminal brass bell clasp at bottom of braid
    const endPt = braidPath.at(1.0);
    const endTan = braidPath.tangentAt(1.0);
    b.part(new THREE.ConeGeometry(0.035, 0.05, 10), BRASS_PAINT, {
      bone: head,
      at: [endPt.x, endPt.y, endPt.z],
      dir: [endTan.x, endTan.y, endTan.z],
    });

    // Fanned hair tuft at the braid tip
    b.part(new THREE.ConeGeometry(0.03, 0.06, 8), BEARD_PAINT, {
      bone: head,
      at: [endPt.x + endTan.x * 0.04, endPt.y + endTan.y * 0.04, endPt.z + endTan.z * 0.04],
      dir: [endTan.x, endTan.y, endTan.z],
    });
  }

  // --------------------------------------------------------------------------
  // MOUNTAINEER HELMET & SNIPER GOGGLES
  // --------------------------------------------------------------------------
  // Leather Trapper / Aviator Helmet cap
  b.part(new THREE.SphereGeometry(0.145, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), LEATHER_PAINT, {
    bone: head,
    at: [0, 1.07, 0.06],
    scale: [1.12, 1.05, 1.1],
  });
  // Center stitched leather ridge along helmet
  b.sweep(
    catmull([
      [0, 1.14, 0.18],
      [0, 1.22, 0.08],
      [0, 1.2, -0.06],
      [0, 1.1, -0.1],
    ]),
    0.018,
    { bone: head, color: C_LEATHER_LIGHT, sides: 6 },
  );

  // Folded sheepskin fur brim over forehead
  b.sweep(
    catmull([
      [-0.14, 1.14, 0.14],
      [-0.08, 1.17, 0.17],
      [0, 1.18, 0.18],
      [0.08, 1.17, 0.17],
      [0.14, 1.14, 0.14],
    ]),
    0.026,
    { bone: head, color: C_COAT_TRIM, sides: 8 },
  );

  // Helmet side ear flaps
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.14, 1.1, 0.08], [s * 0.14, 0.98, 0.04], [0.08, 0.03], [0.06, 0.025], {
      bone: head,
      color: LEATHER_PAINT,
    });
    // Flap fleece lining
    b.part(new THREE.BoxGeometry(0.015, 0.09, 0.06), C_COAT_TRIM, {
      bone: head,
      at: [s * 0.13, 1.03, 0.06],
    });
  }

  // Goggle leather strap wrapping helmet
  b.sweep(
    catmull([
      [-0.15, 1.15, 0.06],
      [-0.12, 1.16, 0.14],
      [0, 1.16, 0.17],
      [0.12, 1.16, 0.14],
      [0.15, 1.15, 0.06],
      [0.12, 1.15, -0.06],
      [0, 1.15, -0.09],
      [-0.12, 1.15, -0.06],
    ], { closed: true }),
    [0.022, 0.008],
    { bone: head, color: C_LEATHER_DARK, sides: 6 },
  );

  // Sniper Goggles perched on the brow
  // Left goggle: standard brass ocular lens
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.025, 12), BRASS_PAINT, {
    bone: head,
    at: [0.065, 1.16, 0.165],
    dir: [0.15, 0.2, 0.95],
  });
  b.part(new THREE.CircleGeometry(0.028, 12), "#16343c", {
    bone: head,
    at: [0.068, 1.165, 0.178],
    dir: [0.15, 0.2, 0.95],
    axis: "z",
  });

  // Right goggle: Hero Advanced Sniper Monocular with dials and glowing reticle!
  const scopePos: [number, number, number] = [-0.065, 1.16, 0.165];
  const scopeDir: [number, number, number] = [-0.15, 0.2, 0.95];
  // Outer brass housing
  b.part(new THREE.CylinderGeometry(0.035, 0.032, 0.04, 12), BRASS_PAINT, {
    bone: head,
    at: scopePos,
    dir: scopeDir,
  });
  // Knurled zoom ring
  b.part(new THREE.TorusGeometry(0.036, 0.008, 6, 12), IRON_PAINT, {
    bone: head,
    at: [-0.063, 1.155, 0.155],
    dir: scopeDir,
  });
  // Side elevation adjustment knob
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 8), BRASS_PAINT, {
    bone: head,
    at: [-0.102, 1.17, 0.165],
    dir: [-1, 0, 0],
  });
  // Glowing cyan reticle lens face
  b.part(new THREE.CircleGeometry(0.031, 16), "#ffffff", {
    bone: head,
    at: [-0.069, 1.168, 0.186],
    dir: scopeDir,
    axis: "z",
    texture: RETICLE_TEX,
  });

  // Central brass bridge between oculars
  b.part(new THREE.BoxGeometry(0.04, 0.016, 0.014), BRASS_PAINT, {
    bone: head,
    at: [0, 1.16, 0.175],
  });

  // --------------------------------------------------------------------------
  // MOUNTAINEER BACKPACK & GEAR
  // --------------------------------------------------------------------------
  // Heavy Canvas/Leather Expedition Pack
  b.frustumBox([0, 0.64, -0.12], [0, 0.88, -0.16], [0.36, 0.22], [0.32, 0.2], {
    bone: chest,
    color: LEATHER_PAINT,
  });
  // Pack top flap with buckle straps
  b.part(new THREE.BoxGeometry(0.34, 0.08, 0.22), C_LEATHER_DARK, {
    bone: chest,
    at: [0, 0.88, -0.16],
    dir: [0, -0.3, 1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.16, 0.015), C_LEATHER_LIGHT, {
      bone: chest,
      at: [s * 0.1, 0.8, -0.27],
    });
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.02), BRASS_PAINT, {
      bone: chest,
      at: [s * 0.1, 0.76, -0.275],
    });
  }

  // Rolled Mountaineer Bedroll strapped atop pack
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.44, 12), "#445566", {
    bone: chest,
    at: [0, 0.98, -0.17],
    dir: [1, 0, 0],
    axis: "y",
  });
  // Twin leather cinch straps on bedroll
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.068, 0.01, 6, 12), C_LEATHER_DARK, {
      bone: chest,
      at: [s * 0.14, 0.98, -0.17],
      dir: [1, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.025, 0.025, 0.015), BRASS_PAINT, {
      bone: chest,
      at: [s * 0.14, 1.045, -0.17],
    });
  }

  // --------------------------------------------------------------------------
  // THE BLUNDERBUSS (Signature Hero Weapon!)
  // --------------------------------------------------------------------------
  // Slung diagonally across the back: stock at left hip, grand trumpet bell
  // rising high above his right shoulder (-X) framing the character's silhouette!
  const gunDir = new THREE.Vector3(-0.35, 0.85, 0.1).normalize();
  const gunQuat = aim(gunDir, new THREE.Vector3(0, 0, 1));

  // Gun Stock (Carved walnut with pistol grip & comb)
  const stockBase: [number, number, number] = [0.18, 0.44, -0.24];
  const stockWrist: [number, number, number] = [0.08, 0.62, -0.22];
  const breechPt: [number, number, number] = [-0.02, 0.82, -0.19];
  const forearmEnd: [number, number, number] = [-0.11, 0.98, -0.17];

  // Carved wooden buttstock
  b.loft(
    [
      { at: stockBase, w: 0.06, h: 0.16 }, // Wide buttplate
      { at: [0.13, 0.53, -0.23], w: 0.05, h: 0.11 }, // Comb
      { at: stockWrist, w: 0.042, h: 0.065 }, // Wrist grip
      { at: breechPt, w: 0.055, h: 0.075 }, // Breech bed
      { at: forearmEnd, w: 0.046, h: 0.055 }, // Forearm tip
    ],
    { bone: chest, color: WOOD_PAINT },
  );

  // Brass Buttplate with corner spurs
  b.part(new THREE.BoxGeometry(0.064, 0.165, 0.02), BRASS_PAINT, {
    bone: chest,
    at: [0.19, 0.43, -0.245],
    quat: gunQuat,
  });

  // Barrel Assembly
  const barrelStart: [number, number, number] = [-0.02, 0.82, -0.18];
  const barrelMid: [number, number, number] = [-0.14, 1.05, -0.15];
  const bellBase: [number, number, number] = [-0.22, 1.22, -0.13];
  const bellLip: [number, number, number] = [-0.27, 1.33, -0.11];

  // Octagonal Steel Breech
  b.sweep(catmull([barrelStart, barrelMid]), 0.036, {
    bone: chest,
    color: IRON_PAINT,
    sides: 8,
  });

  // Round Steel Mid-Barrel
  b.sweep(catmull([barrelMid, bellBase]), 0.034, {
    bone: chest,
    color: IRON_PAINT,
    sides: 10,
  });

  // Ornate Brass Barrel Reinforcement Bands
  for (const tBand of [0.3, 0.75]) {
    const bPt = new THREE.Vector3().lerpVectors(new THREE.Vector3(...barrelStart), new THREE.Vector3(...bellBase), tBand);
    b.part(new THREE.TorusGeometry(0.038, 0.009, 6, 12), BRASS_PAINT, {
      bone: chest,
      at: [bPt.x, bPt.y, bPt.z],
      dir: [gunDir.x, gunDir.y, gunDir.z],
    });
  }

  // The Grand Trumpet Bell Muzzle (lathed brass with dramatic flare and hollow bore)
  const bellOutline: [number, number][] = [
    [0.0, 0.0],
    [0.035, 0.0],
    [0.042, 0.03],
    [0.056, 0.06],
    [0.082, 0.1],
    [0.098, 0.12], // Outer lip
    [0.088, 0.12],
    [0.076, 0.1], // Inner hollow bore
    [0.046, 0.06],
    [0.03, 0.03],
    [0.022, 0.0],
    [0.0, 0.0],
  ];

  b.lathe(bellOutline, {
    bone: chest,
    at: bellBase,
    axis: [gunDir.x, gunDir.y, gunDir.z],
    segments: 16,
    color: BRASS_PAINT,
  });

  // Deep black bore interior hole
  b.part(new THREE.CircleGeometry(0.074, 16), "#090a0d", {
    bone: chest,
    at: [bellLip[0], bellLip[1], bellLip[2]],
    dir: [gunDir.x, gunDir.y, gunDir.z],
    axis: "z",
  });

  // Flintlock Action Mechanism
  // Engraved Lockplate
  b.part(new THREE.BoxGeometry(0.075, 0.038, 0.01), "#ffffff", {
    bone: chest,
    at: [-0.035, 0.84, -0.165],
    quat: gunQuat,
    texture: LOCKPLATE_TEX,
  });
  // Cocking hammer
  b.part(new THREE.CylinderGeometry(0.008, 0.012, 0.045, 6), IRON_PAINT, {
    bone: chest,
    at: [-0.03, 0.86, -0.155],
    dir: [0.3, 0.8, -0.5],
  });
  // Flint clamp jaws & flint
  b.part(new THREE.BoxGeometry(0.018, 0.014, 0.012), IRON_PAINT, {
    bone: chest,
    at: [-0.024, 0.885, -0.145],
    quat: gunQuat,
  });
  b.part(new THREE.BoxGeometry(0.012, 0.008, 0.008), "#22252a", {
    bone: chest,
    at: [-0.022, 0.89, -0.14],
    quat: gunQuat,
  });
  // Striking frizzen & flash pan
  b.part(new THREE.BoxGeometry(0.018, 0.032, 0.006), IRON_PAINT, {
    bone: chest,
    at: [-0.045, 0.87, -0.15],
    dir: [-0.4, 0.8, 0.4],
  });
  b.part(new THREE.BoxGeometry(0.014, 0.01, 0.012), BRASS_PAINT, {
    bone: chest,
    at: [-0.045, 0.85, -0.155],
    quat: gunQuat,
  });

  // Trigger Guard & Trigger
  b.sweep(
    catmull([
      [0.06, 0.65, -0.21],
      [0.04, 0.63, -0.18],
      [0.01, 0.69, -0.17],
      [0.03, 0.71, -0.2],
    ]),
    0.006,
    { bone: chest, color: BRASS_PAINT, sides: 6 },
  );
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 6), IRON_PAINT, {
    bone: chest,
    at: [0.035, 0.67, -0.19],
    dir: [-0.3, 0.9, -0.3],
  });

  // Steel Ramrod mounted in brass pipes under barrel
  const ramrodStart: [number, number, number] = [0.0, 0.78, -0.21];
  const ramrodEnd: [number, number, number] = [-0.18, 1.14, -0.15];
  b.sweep(catmull([ramrodStart, ramrodEnd]), 0.006, {
    bone: chest,
    color: IRON_PAINT,
    sides: 6,
  });
  // Ramrod brass thimbles
  for (const tThimble of [0.35, 0.8]) {
    const tPt = new THREE.Vector3().lerpVectors(new THREE.Vector3(...ramrodStart), new THREE.Vector3(...ramrodEnd), tThimble);
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.018, 8), BRASS_PAINT, {
      bone: chest,
      at: [tPt.x, tPt.y, tPt.z],
      dir: [gunDir.x, gunDir.y, gunDir.z],
    });
  }

  // Gun Sling connecting blunderbuss to shoulder harness
  b.sweep(
    catmull([
      [0.16, 0.48, -0.23],
      [0.04, 0.54, -0.26],
      [-0.1, 0.72, -0.25],
      [-0.14, 0.96, -0.19],
    ]),
    [0.018, 0.006],
    { bone: chest, color: LEATHER_PAINT, sides: 6 },
  );

  // --------------------------------------------------------------------------
  // STAGED BASE (Dun Morogh Mountain Outcrop & Powder Keg)
  // --------------------------------------------------------------------------
  // The base sits squarely at y = 0, providing a scenic pedestal without
  // obstructing the character.
  // Main chiseled granite slab
  b.part(new THREE.CylinderGeometry(0.55, 0.6, 0.038, 9), STONE_PAINT, {
    at: [0, 0.019, 0.04],
  });

  // Secondary stepped rock facets
  b.part(new THREE.CylinderGeometry(0.48, 0.52, 0.024, 7), STONE_PAINT, {
    at: [0.04, 0.038, 0.02],
    rotation: [0, 25, 0],
  });

  // Sculpted snow drifts banked across the stone
  const snowDriftPoints = [
    [-0.42, 0.035, -0.24],
    [-0.28, 0.055, -0.32],
    [0.0, 0.045, -0.36],
    [0.32, 0.06, -0.26],
    [0.46, 0.04, -0.08],
    [0.48, 0.05, 0.16],
    [0.34, 0.035, 0.36],
    [0.05, 0.045, 0.42],
    [-0.26, 0.04, 0.38],
    [-0.48, 0.035, 0.18],
  ];
  for (let i = 0; i < snowDriftPoints.length; i++) {
    const pt = snowDriftPoints[i];
    b.part(new THREE.SphereGeometry(0.14, 7, 5), SNOW_PAINT, {
      at: pt,
      scale: [1.4, 0.32, 1.2],
    });
  }

  // Authentic Dwarven Gunpowder Keg (Standing beside dwarf's right boot at -X)
  const kegPos: [number, number, number] = [-0.38, 0.0, 0.14];
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

  // Wooden bulging barrel staves
  b.lathe(kegOutline, {
    at: [kegPos[0], kegPos[1], kegPos[2]],
    axis: [0, 1, 0],
    segments: 12,
    color: WOOD_PAINT,
  });

  // 4 Forged Iron Barrel Hoops
  for (const hY of [0.02, 0.07, 0.17, 0.22]) {
    const rHoop = hY === 0.07 || hY === 0.17 ? 0.132 : 0.115;
    b.part(new THREE.TorusGeometry(rHoop, 0.009, 6, 14), IRON_PAINT, {
      at: [kegPos[0], kegPos[1] + hY, kegPos[2]],
      dir: [0, 1, 0],
    });
  }

  // Keg Explosive Warning Stencil
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    at: [kegPos[0], kegPos[1] + 0.12, kegPos[2] + 0.142],
    dir: [0, 0, 1],
    axis: "z",
    texture: KEG_LABEL_TEX,
  });

  // Brass bunghole plug & braided fuse cord atop keg
  b.part(new THREE.CylinderGeometry(0.016, 0.02, 0.015, 8), BRASS_PAINT, {
    at: [kegPos[0] + 0.03, kegPos[1] + 0.242, kegPos[2] - 0.02],
    dir: [0, 1, 0],
  });
  b.sweep(
    catmull([
      [kegPos[0] + 0.03, kegPos[1] + 0.25, kegPos[2] - 0.02],
      [kegPos[0] + 0.04, kegPos[1] + 0.28, kegPos[2] - 0.01],
      [kegPos[0] + 0.06, kegPos[1] + 0.29, kegPos[2] + 0.02],
      [kegPos[0] + 0.05, kegPos[1] + 0.27, kegPos[2] + 0.04],
    ]),
    0.004,
    { color: "#3a2c1e", sides: 6 },
  );

  // Spent Brass Shell Casings in the snow
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.042, 8), BRASS_PAINT, {
    at: [-0.25, 0.035, 0.24],
    dir: [0.7, 0.2, 0.6],
  });
  b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.042, 8), BRASS_PAINT, {
    at: [-0.42, 0.032, 0.32],
    dir: [-0.4, 0.1, 0.9],
  });

  // Frosty Dun Morogh Mountain Lichen Tuft
  for (let l = 0; l < 4; l++) {
    const lAngle = (l * Math.PI) / 2 + 0.3;
    b.part(new THREE.ConeGeometry(0.028, 0.065, 5), "#3a5044", {
      at: [0.38 + Math.cos(lAngle) * 0.03, 0.035, 0.26 + Math.sin(lAngle) * 0.03],
      dir: [Math.cos(lAngle) * 0.4, 0.9, Math.sin(lAngle) * 0.4],
    });
  }

  return b.root;
}
