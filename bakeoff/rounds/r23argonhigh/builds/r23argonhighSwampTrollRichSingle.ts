import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { aim, lerp, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import {
  countershade,
  gradient,
  grain,
  mix,
  mottle,
  noise,
  paint,
  scales,
  smoothstep,
  spots,
  stripes,
} from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hulking Warcraft-style swamp troll berserker with massive curved tusks, blazing mohawk, warpaint, moss-crusted hide, and rattling bone fetishes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------------
// Palette & Hand-Painted Warcraft Surface Treatments
// ---------------------------------------------------------------------------------------------------------------------

const SKIN_LIT = "#2f7a5e";
const SKIN_MID = "#215a46";
const SKIN_DEEP = "#13382d";
const SKIN_BELLY = "#6fa372";
const SKIN_BELLY_SHADE = "#487552";
const MOSS_BRIGHT = "#5c9e31";
const MOSS_DARK = "#2d5718";
const WARPAINT_CYAN = "#8cf0e8";
const WARPAINT_SHADE = "#47a8a6";

const BONE_LIT = "#e8dcc0";
const BONE_MID = "#c4b08a";
const BONE_DARK = "#6e5a3e";
const TUSK_TIP = "#fff4d6";
const HORN_DARK = "#362b22";

const HAIR_ROOT = "#4a0e2e";
const HAIR_MID = "#b81d48";
const HAIR_FLAME = "#eb5e28";
const HAIR_TIP = "#b5e61d";

const LEATHER_LIT = "#5c3824";
const LEATHER_DARK = "#2e1a10";
const WOOD_LIT = "#63442b";
const WOOD_DARK = "#332114";

const GOLD_LIT = "#e6a82e";
const GOLD_DARK = "#8c5811";
const IRON_DARK = "#2b3036";
const CLAW_DARK = "#1c1815";
const GUM_RED = "#6e222a";

const VOODOO_GREEN = "#39ff7a";
const VOODOO_AMBER = "#ffaa1d";
const VOODOO_PURPLE = "#a844ff";
const BLOOD_RED = "#9e1b24";

// Hand-painted Warcraft troll hide: mottled swamp-teal skin with crusty moss back, pale sage belly, and warpaint
const baseSkinMottle = mottle(SKIN_LIT, SKIN_MID, { size: 0.14, contrast: 1.4, seed: 11 });
const wartyBack = spots(
  mottle(SKIN_MID, MOSS_DARK, { size: 0.11, seed: 19 }),
  [MOSS_BRIGHT, "#3e7024", "#1b422a"],
  { size: 0.065, amount: 0.65, seed: 23 },
);
const bellyPaint = cel(mottle(SKIN_BELLY, "#5c8f62", { size: 0.12, seed: 31 }), SKIN_BELLY_SHADE);

const TROLL_SKIN = paint((p, n) => {
  // Dorsal moss crust on upper hunched back & shoulders
  const mossMask = smoothstep(0.25, 0.68, n.y) * smoothstep(1.32, 1.65, p.y);
  // Symmetric tribal warpaint bands across chest, shoulders and limbs
  const symP = new THREE.Vector3(Math.abs(p.x), p.y, p.z);
  const wNoise = noise(symP, 0.09, 41) - 0.5;
  const chestChevron = Math.abs(p.y - 1.42 - Math.abs(p.x) * 0.55 + wNoise * 0.05);
  const armBand = Math.abs(((p.y * 5.5 + Math.abs(p.x) * 3.2 + wNoise * 0.4) % 1 + 1) % 1 - 0.5);
  const isChestPaint = p.z > 0.06 && p.y > 1.18 && p.y < 1.62 && Math.abs(p.x) < 0.34 && chestChevron < 0.026;
  const isArmPaint = Math.abs(p.x) > 0.38 && p.y > 0.98 && p.y < 1.66 && armBand < 0.085;
  if (isChestPaint || isArmPaint) {
    return n.y > -0.15 ? WARPAINT_CYAN : WARPAINT_SHADE;
  }
  if (mossMask > 0.45) {
    return wartyBack.at(p, n);
  }
  // Belly countershading on front torso
  const isBelly = p.z > 0.04 && p.y > 1.05 && p.y < 1.56 && Math.abs(p.x) < 0.22 && n.z > 0.35;
  if (isBelly) {
    return bellyPaint.at(p, n);
  }
  const lit = baseSkinMottle.at(p, n);
  const shade = smoothstep(-0.35, 0.45, n.y * 0.65 + n.z * 0.35);
  return mix(SKIN_DEEP, lit, shade);
});

const TROLL_HEAD_SKIN = paint((p, n) => {
  // Fierce facial warpaint: diagonal stripes across cheeks and brow
  const ax = Math.abs(p.x);
  const stripeVal = Math.abs(p.y - 1.74 - ax * 0.75 + (noise(p, 0.05, 53) - 0.5) * 0.02);
  if (p.z > 0.24 && ax > 0.035 && stripeVal < 0.018) {
    return n.y > -0.2 ? WARPAINT_CYAN : WARPAINT_SHADE;
  }
  const noseBridge = p.z > 0.32 && ax < 0.022 && p.y > 1.72 && p.y < 1.86;
  if (noseBridge) {
    return WARPAINT_CYAN;
  }
  const lit = mottle(SKIN_LIT, "#3b8c6a", { size: 0.07, seed: 61 }).at(p, n);
  return mix(SKIN_DEEP, lit, smoothstep(-0.3, 0.5, n.y * 0.6 + n.z * 0.4));
});

const BONE_PAINT = cel(
  mottle(
    grain(BONE_LIT, BONE_MID, { size: 0.04, axis: "y", seed: 71 }),
    BONE_DARK,
    { size: 0.09, contrast: 1.6, seed: 73 },
  ),
  BONE_DARK,
);

const TUSK_PAINT = paint((p, n, s) => {
  const t = s[0];
  const base = t < 0.18 ? HORN_DARK : t > 0.68 ? TUSK_TIP : BONE_LIT;
  const grained = grain(base, BONE_MID, { size: 0.025, axis: "y", seed: 83 }).at(p, n);
  return n.y > -0.15 ? grained : mix(grained, BONE_DARK, 0.42);
});

const MOHAWK_PAINT = paint((p, n, s) => {
  const h = s[0];
  const streak = grain(
    h < 0.22 ? HAIR_ROOT : h < 0.72 ? HAIR_MID : h < 0.88 ? HAIR_FLAME : HAIR_TIP,
    h < 0.5 ? HAIR_FLAME : HAIR_TIP,
    { size: 0.02, axis: "y", seed: 97 },
  );
  return cel(streak, HAIR_ROOT).at(p, n);
});

const LEATHER_PAINT = cel(
  mottle(LEATHER_LIT, "#472918", { size: 0.08, seed: 101 }),
  LEATHER_DARK,
);

const WOOD_PAINT = cel(
  grain(WOOD_LIT, WOOD_DARK, { size: 0.03, axis: "y", seed: 107 }),
  WOOD_DARK,
);

const SHELL_PAINT = scales([MOSS_DARK, "#1f4229", "#3c5e24"], "#112416", {
  size: 0.055,
  width: 0.16,
  seed: 113,
});

const LOINCLOTH_PAINT = furEdge(
  stripes("#7a1f28", "#d99b26", { size: 0.075, axis: "y", width: 0.28, wobble: 0.25, seed: 127 }),
  "#381217",
  { by: "position", axis: [0, 1, 0], along: [1, 0, 0], level: 0.56, teeth: 0.06, period: 0.045, ink: "#1c080b" },
);

const GOLD_PAINT = cel(GOLD_LIT, GOLD_DARK);

const HAND_FOOT_PAINT = countershade(
  TROLL_SKIN,
  gradient(TROLL_SKIN, "#162e24", [0, 0.35, 0], [0, 0.02, 0]),
  { level: -0.1, soft: 0.3 },
);

// ---------------------------------------------------------------------------------------------------------------------
// SVG Textures (Cards & Decals)
// ---------------------------------------------------------------------------------------------------------------------

const MOSS_STRAND_TEX = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M28 0 C24 34 16 68 20 124 C26 98 30 62 34 22 C37 58 42 92 38 126 C46 88 48 44 40 0 Z" fill="#4b8728"/>
    <path d="M16 4 C10 38 8 74 14 114 C18 82 22 48 24 8 Z" fill="#336119"/>
    <path d="M44 6 C52 40 54 78 48 118 C44 82 42 46 38 10 Z" fill="#68ad36"/>
    <circle cx="22" cy="72" r="4" fill="#8fd14f"/>
    <circle cx="39" cy="54" r="3.5" fill="#8fd14f"/>
    <circle cx="34" cy="94" r="3.5" fill="#a5e85b"/>
  </svg>`,
  { size: 256 },
);

const FEATHER_CARD_TEX = svg(
  `<svg viewBox="0 0 64 160">
    <path d="M32 6 C14 36 8 88 18 152 L32 142 L46 152 C56 88 50 36 32 6 Z" fill="#1e3d33"/>
    <path d="M32 10 C18 38 14 78 20 124 L32 114 L44 124 C50 78 46 38 32 10 Z" fill="#b81d48"/>
    <path d="M32 12 C23 32 20 56 23 82 L32 74 L41 82 C44 56 41 32 32 12 Z" fill="#e6a82e"/>
    <path d="M32 16 C27 28 26 42 28 54 L32 48 L36 54 C38 42 37 28 32 16 Z" fill="#52ff91"/>
    <line x1="32" y1="4" x2="32" y2="158" stroke="#e8dcc0" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const HAIR_FLAME_TEX = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M12 0 L52 0 C58 38 48 82 32 126 C18 86 8 42 12 0 Z" fill="#b81d48"/>
    <path d="M20 18 L44 18 C48 52 40 88 32 124 C24 88 16 52 20 18 Z" fill="#eb5e28"/>
    <path d="M25 56 L39 56 C41 82 36 106 32 126 C28 106 23 82 25 56 Z" fill="#b5e61d"/>
  </svg>`,
  { size: 256 },
);

const VOODOO_MASK_DECAL = svg(
  `<svg viewBox="0 0 128 128">
    <path d="M64 10 L84 34 L72 38 L92 68 L74 68 L82 114 L64 88 L46 114 L54 68 L36 68 L56 38 L44 34 Z" fill="#8cf0e8"/>
    <circle cx="64" cy="48" r="10" fill="#13382d"/>
    <circle cx="64" cy="48" r="5" fill="#ffaa1d"/>
    <path d="M22 46 Q40 24 64 26 Q88 24 106 46" stroke="#8cf0e8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M30 82 Q48 98 64 98 Q80 98 98 82" stroke="#8cf0e8" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const RUNE_GLOW_TEX = svg(
  `<svg viewBox="0 0 64 64">
    <polygon points="32,4 54,18 46,44 32,60 18,44 10,18" fill="none" stroke="#39ff7a" stroke-width="5"/>
    <line x1="32" y1="8" x2="32" y2="56" stroke="#a8ffca" stroke-width="4"/>
    <line x1="16" y1="26" x2="48" y2="38" stroke="#39ff7a" stroke-width="4"/>
    <line x1="48" y1="26" x2="16" y2="38" stroke="#39ff7a" stroke-width="4"/>
    <circle cx="32" cy="32" r="6" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------------
// Helper builders for Fetish Skulls, Bones & Totems
// ---------------------------------------------------------------------------------------------------------------------

function buildMiniSkull(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | readonly number[],
  dir: THREE.Vector3 | readonly number[],
  scale: number,
  bone: string,
  group: string,
  eyeColor = VOODOO_GREEN,
) {
  const center = new THREE.Vector3(...(Array.isArray(at) ? at : [at.x, at.y, at.z]));
  const forward = new THREE.Vector3(...(Array.isArray(dir) ? dir : [dir.x, dir.y, dir.z])).normalize();
  const f = frame(center, forward);

  // Cranium dome
  b.part(new THREE.DodecahedronGeometry(0.068 * scale, 0), BONE_PAINT, {
    bone,
    at: f.local({ up: 0.018 * scale }),
    quat: aim(forward, [0, 1, 0], "z"),
    scale: [0.95, 1.05, 1.12],
    group,
  });

  // Zygomatic cheekbones & snout
  b.frustumBox(
    f.local({ up: -0.005 * scale, back: 0.01 * scale }),
    f.local({ up: -0.055 * scale, forward: 0.035 * scale }),
    [0.095 * scale, 0.065 * scale],
    [0.058 * scale, 0.045 * scale],
    { bone, color: BONE_PAINT, group },
  );

  // Glowing eye sockets
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.019 * scale, 0), eyeColor, {
        bone,
        at: f.local({ left: s * 0.026 * scale, up: 0.006 * scale, forward: 0.052 * scale }),
        group,
      }),
      1.6,
    );
    // Mini skull side fangs
    b.spike(
      f.local({ left: s * 0.022 * scale, up: -0.045 * scale, forward: 0.032 * scale }),
      [s * 0.15, -1, 0.25],
      0.042 * scale,
      0.011 * scale,
      { bone, color: TUSK_TIP, sides: 4, group },
    );
  }
}

function buildBoneClubSegment(
  b: ReturnType<typeof createBuilder>,
  p0: THREE.Vector3 | readonly number[],
  p1: THREE.Vector3 | readonly number[],
  r: number,
  bone: string,
  group: string,
) {
  b.rod(p0, p1, [r, r * 0.92], BONE_PAINT, { bone, sides: 5, group });
  for (const endPt of [p0, p1]) {
    for (const s of [1, -1]) {
      const ep = new THREE.Vector3(...(Array.isArray(endPt) ? endPt : [endPt.x, endPt.y, endPt.z]));
      b.part(new THREE.OctahedronGeometry(r * 1.25, 0), BONE_PAINT, {
        bone,
        at: [ep.x + s * r * 0.45, ep.y, ep.z],
        group,
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Main Swamp Troll Builder
// ---------------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "swampTroll", detail: 1, paintSize: 1024 });

  // ===================================================================================================================
  // 1. SKELETON (Full Monster Rig: Spine, Hunched Neck, Head, Jaw, Ears, Mohawk Fan, Arms, Hands/Digits, Legs, Toes)
  // ===================================================================================================================

  const hips = b.joint("hips", {
    at: [0, 1.06, -0.06],
    dir: [0, 1, 0.12],
    role: "spine",
    group: "torso",
  });

  // Hunched Warcraft Troll Spine & Neck
  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 1.06, -0.06],
      [0, 1.32, -0.02],
      [0, 1.58, 0.05],
      [0, 1.78, 0.14],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const chest = spineChain.joints[2];

  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 1.76, 0.14],
      [0, 1.79, 0.23],
      [0, 1.77, 0.31],
    ]),
    {
      parent: chest,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "head",
    },
  );

  const head = b.joint("head", {
    parent: neckChain.joints[1],
    at: [0, 1.77, 0.31],
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.67, 0.31],
    dir: [0, -0.28, 0.96],
    role: "jaw",
    group: "head",
  });

  const noseJoint = b.joint("nose", {
    parent: head,
    at: [0, 1.79, 0.45],
    dir: [0, -0.35, 0.94],
    role: "hinge",
    group: "head",
  });

  // Long pointed Troll Ears
  const earJoints: Record<"L" | "R", ReturnType<typeof b.joint>> = {
    L: b.joint("earL", {
      parent: head,
      at: [0.14, 1.78, 0.30],
      dir: [0.82, 0.28, -0.50],
      role: "hinge",
      group: "head",
    }),
    R: b.joint("earR", {
      parent: head,
      at: [-0.14, 1.78, 0.30],
      dir: [-0.82, 0.28, -0.50],
      role: "hinge",
      group: "head",
    }),
  };

  // Mohawk Crest Fan Joints (6 locks from brow to nape)
  const mohawkJoints = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    const angle = (0.38 - t * 1.15) * Math.PI;
    const my = 1.91 + Math.sin(t * Math.PI) * 0.06 - t * 0.08;
    const mz = 0.38 - t * 0.26;
    return b.joint(`mohawk${i + 1}`, {
      parent: head,
      at: [0, my, mz],
      dir: [0, Math.cos(angle * 0.55), Math.sin(angle * 0.55)],
      role: "fan",
      group: "mohawk",
    });
  });

  // Back Fetish Totem Hanging Lanterns / Skull Fetishes
  const totemJarL = b.joint("totemJarL", {
    parent: chest,
    at: [0.46, 2.12, -0.14],
    dir: [0, -1, 0],
    role: "hinge",
    group: "totemRack",
  });
  const totemJarR = b.joint("totemJarR", {
    parent: chest,
    at: [-0.46, 2.12, -0.14],
    dir: [0, -1, 0],
    role: "hinge",
    group: "totemRack",
  });
  const chestFetishJoint = b.joint("chestFetish", {
    parent: chest,
    at: [0, 1.48, 0.27],
    dir: [0, -1, 0.15],
    role: "hinge",
    group: "fetishes",
  });

  // Loincloth & Hip Trophy Joints
  const loinFront = b.chain(
    "loinFront",
    polyline([
      [0, 1.02, 0.16],
      [0, 0.78, 0.19],
      [0, 0.52, 0.18],
    ]),
    {
      parent: hips,
      names: ["loinFront1", "loinFront2"],
      role: "hinge",
      group: "belt",
    },
  );
  const loinBack = b.chain(
    "loinBack",
    polyline([
      [0, 1.02, -0.24],
      [0, 0.76, -0.27],
      [0, 0.50, -0.26],
    ]),
    {
      parent: hips,
      names: ["loinBack1", "loinBack2"],
      role: "hinge",
      group: "belt",
    },
  );
  const hipFetishL = b.joint("hipFetishL", {
    parent: hips,
    at: [0.27, 1.01, 0.06],
    dir: [0.18, -1, 0.08],
    role: "hinge",
    group: "fetishes",
  });
  const hipFetishR = b.joint("hipFetishR", {
    parent: hips,
    at: [-0.27, 1.01, 0.06],
    dir: [-0.18, -1, 0.08],
    role: "hinge",
    group: "fetishes",
  });

  // Bilateral Legs, Feet & Toes, and Arms, Hands & Digits
  type SideRig = {
    legChain: ReturnType<typeof b.chain>;
    toeIn: ReturnType<typeof b.chain>;
    toeOut: ReturnType<typeof b.chain>;
    toeHeel: ReturnType<typeof b.joint>;
    clavicle: ReturnType<typeof b.joint>;
    armChain: ReturnType<typeof b.chain>;
    pauldronJoint: ReturnType<typeof b.joint>;
    fingers: ReturnType<typeof b.chain>[];
    thumb: ReturnType<typeof b.chain>;
  };
  const sides: Record<"L" | "R", SideRig> = {} as Record<"L" | "R", SideRig>;

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const legGroup = `leg${side}`;
    const armGroup = `arm${side}`;

    // Leg IK from pelvis socket to ankle
    const hipPt: [number, number, number] = [s * 0.23, 1.04, -0.04];
    const anklePt: [number, number, number] = [s * 0.36, 0.15, -0.02];
    const legPts = limb(hipPt, anklePt, [0.50, 0.48], [s * 0.26, 0.22, 1]);
    const footBallPt: [number, number, number] = [s * 0.36, 0.055, 0.13];

    const legChain = b.chain(`leg${side}`, [...legPts, footBallPt], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.36, 0, 0.12],
      group: legGroup,
    });
    const footJoint = legChain.joints[3];

    // Two large splayed front toes + one rear heel spur toe
    const toeIn = b.chain(
      `toeIn${side}`,
      polyline([
        [s * 0.31, 0.044, 0.13],
        [s * 0.29, 0.038, 0.24],
        [s * 0.28, 0.026, 0.34],
      ]),
      {
        parent: footJoint,
        names: [`toeIn1${side}`, `toeIn2${side}`],
        role: "digit",
        group: legGroup,
      },
    );

    const toeOut = b.chain(
      `toeOut${side}`,
      polyline([
        [s * 0.41, 0.040, 0.12],
        [s * 0.45, 0.034, 0.22],
        [s * 0.47, 0.024, 0.31],
      ]),
      {
        parent: footJoint,
        names: [`toeOut1${side}`, `toeOut2${side}`],
        role: "digit",
        group: legGroup,
      },
    );

    const toeHeel = b.joint(`toeHeel${side}`, {
      parent: legChain.joints[2],
      at: [s * 0.36, 0.038, -0.06],
      aim: [s * 0.36, 0.024, -0.19],
      role: "digit",
      group: legGroup,
    });

    // Clavicle & Arm IK
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.14, 1.68, 0.06],
      aim: [s * 0.38, 1.70, 0.04],
      role: "arm",
      group: armGroup,
    });

    const pauldronJoint = b.joint(`pauldron${side}`, {
      parent: clavicle,
      at: [s * 0.40, 1.76, 0.04],
      dir: [s * 0.85, 0.45, 0.15],
      role: "hinge",
      group: armGroup,
    });

    const shoulderPt: [number, number, number] = [s * 0.38, 1.68, 0.04];
    const wristPt: [number, number, number] = [s * 0.84, 1.12, 0.20];
    const armPts = limb(shoulderPt, wristPt, [0.44, 0.42], [s * 0.35, -0.15, -0.88]);
    const handTipPt: [number, number, number] = [s * 0.91, 1.00, 0.25];

    const armChain = b.chain(`arm${side}`, [...armPts, handTipPt], {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: armGroup,
    });
    const handJoint = armChain.joints[3];

    // 3 Chunky Warcraft Troll Fingers + 1 Heavy Thumb (separated and extended)
    const fingerSpecs = [
      {
        tag: "Index",
        p0: [s * 0.91, 1.01, 0.31],
        p1: [s * 0.98, 0.92, 0.36],
        p2: [s * 1.01, 0.83, 0.38],
      },
      {
        tag: "Mid",
        p0: [s * 0.93, 0.99, 0.25],
        p1: [s * 1.01, 0.89, 0.27],
        p2: [s * 1.04, 0.79, 0.28],
      },
      {
        tag: "Pinky",
        p0: [s * 0.91, 1.00, 0.18],
        p1: [s * 0.98, 0.91, 0.17],
        p2: [s * 1.00, 0.82, 0.16],
      },
    ];
    const fingers = fingerSpecs.map((spec) =>
      b.chain(`finger${spec.tag}${side}`, polyline([spec.p0, spec.p1, spec.p2]), {
        parent: handJoint,
        names: [`finger${spec.tag}1${side}`, `finger${spec.tag}2${side}`],
        role: "digit",
        group: armGroup,
      }),
    );

    const thumb = b.chain(
      `thumb${side}`,
      polyline([
        [s * 0.82, 1.05, 0.28],
        [s * 0.79, 0.97, 0.37],
        [s * 0.78, 0.90, 0.43],
      ]),
      {
        parent: handJoint,
        names: [`thumb1${side}`, `thumb2${side}`],
        role: "digit",
        group: armGroup,
      },
    );

    sides[side] = {
      legChain,
      toeIn,
      toeOut,
      toeHeel,
      clavicle,
      armChain,
      pauldronJoint,
      fingers,
      thumb,
    };
  }

  // ===================================================================================================================
  // 2. BODY MASSES: TORSO, HUNCHED BACK, PECS, SPINE VERTEBRAE & NECK
  // ===================================================================================================================

  // Main V-tapered hunched torso loft skinned smoothly over hips, spine, and neck
  const torsoLoft = b.loft(
    [
      { at: [0, 0.98, -0.07], w: 0.44, h: 0.34 },
      { at: [0, 1.18, -0.04], w: 0.38, h: 0.31 },
      { at: [0, 1.42, 0.02], w: 0.56, h: 0.42 },
      { at: [0, 1.66, 0.08], w: 0.70, h: 0.48 },
      { at: [0, 1.82, 0.16], w: 0.52, h: 0.42 },
      { at: [0, 1.78, 0.30], w: 0.30, h: 0.28 },
    ],
    {
      bone: [hips, spineChain, neckChain],
      color: TROLL_SKIN,
      group: "torso",
      name: "torsoBody",
    },
  );

  // Massive hunched trapezius / upper back mound
  const backHump = b.sweep(
    catmull([
      [0, 1.40, -0.16],
      [0, 1.68, -0.15],
      [0, 1.90, 0.02],
      [0, 1.85, 0.22],
    ]),
    (t) => [0.16 + Math.sin(t * Math.PI) * 0.16, 0.11 + Math.sin(t * Math.PI) * 0.12],
    {
      bone: [spineChain, neckChain],
      color: wartyBack,
      group: "torso",
      name: "backHump",
    },
  );

  // Sculpted pectoral slabs, rib ridges & latissimus muscles
  for (const s of [1, -1] as const) {
    // Pectoral muscle
    b.capsule([s * 0.06, 1.54, 0.19], [s * 0.28, 1.58, 0.12], [0.11, 0.095], TROLL_SKIN, {
      bone: chest,
      group: "torso",
    });
    // Prominent troll rib ridges (3 per side)
    for (let r = 0; r < 3; r++) {
      const ry = 1.24 + r * 0.075;
      const rz = 0.14 + r * 0.02;
      b.capsule(
        [s * 0.07, ry - 0.01, rz + 0.03],
        [s * 0.23, ry + 0.02, rz - 0.06],
        [0.028, 0.022],
        TROLL_SKIN,
        { bone: spineChain.joints[1], sides: 6, group: "torso" },
      );
    }
    // Thick neck sternocleidomastoid tendons
    b.capsule([s * 0.14, 1.62, 0.14], [s * 0.08, 1.76, 0.28], [0.055, 0.045], TROLL_SKIN, {
      bone: neckChain.joints[0],
      sides: 6,
      group: "head",
    });
  }

  // Dorsal spine osteoderms / bony swamp spikes along the hunched spine
  b.along(
    catmull([
      [0, 1.15, -0.22],
      [0, 1.42, -0.22],
      [0, 1.72, -0.18],
      [0, 1.93, 0.02],
      [0, 1.89, 0.19],
    ]),
    7,
    (pt) => {
      const f = pt.t;
      const len = 0.07 + Math.sin(f * Math.PI) * 0.08;
      const rad = 0.026 + Math.sin(f * Math.PI) * 0.016;
      b.spike(pt.at, [0, 0.72, -0.68], len, rad, BONE_PAINT, {
        bone: f < 0.35 ? spineChain.joints[0] : f < 0.75 ? chest : neckChain.joints[0],
        sides: 5,
        group: "torso",
      });
    },
  );

  // Swamp warts & crusty barnacle nodules scattered over the upper back
  const humpSurface = b.surface(backHump);
  for (const hit of humpSurface.scatter(16, {
    rng: rng(201),
    minDist: 0.08,
    filter: (h) => h.n.y > 0.15,
  })) {
    b.stick(new THREE.DodecahedronGeometry(0.032, 0), MOSS_DARK, hit, {
      embed: 0.45,
      flat: true,
      group: "torso",
    });
  }

  // Voodoo warpaint emblem decal on the chest
  b.decal(torsoLoft, VOODOO_MASK_DECAL, {
    at: [0, 1.46, 0.24],
    dir: [0, 0.1, 1],
    size: [0.34, 0.34],
    bone: chest,
    group: "torso",
  });

  // ===================================================================================================================
  // 3. HEAD, FIERCE BROW, HOOKED NOSE, EARS, LOWER JAW, COLOSSAL TUSKS & BLAZING MOHAWK
  // ===================================================================================================================

  // Angular troll cranium & upper maxilla
  b.loft(
    [
      { at: [0, 1.78, 0.24], w: 0.24, h: 0.23 },
      { at: [0, 1.80, 0.34], w: 0.27, h: 0.24 },
      { at: [0, 1.77, 0.43], w: 0.21, h: 0.18 },
      { at: [0, 1.73, 0.48], w: 0.16, h: 0.11 },
    ],
    {
      bone: head,
      color: TROLL_HEAD_SKIN,
      group: "head",
      name: "cranium",
    },
  );

  // Heavy furrowed Warcraft brow ridge & cheekbones
  for (const s of [1, -1] as const) {
    // Sweeping supraorbital brow ridge
    b.sweep(
      catmull([
        [0, 1.82, 0.46],
        [s * 0.06, 1.85, 0.44],
        [s * 0.13, 1.83, 0.38],
      ]),
      [0.034, 0.038, 0.026],
      TROLL_HEAD_SKIN,
      { bone: head, sides: 6, group: "head" },
    );

    // Flared zygomatic cheekbone
    b.capsule([s * 0.07, 1.73, 0.45], [s * 0.13, 1.75, 0.34], [0.032, 0.038], TROLL_HEAD_SKIN, {
      bone: head,
      sides: 6,
      group: "head",
    });

    // Piercing brow bone stud
    b.part(new THREE.OctahedronGeometry(0.018, 0), GOLD_PAINT, {
      bone: head,
      at: [s * 0.10, 1.85, 0.43],
      group: "head",
    });

    // Glowing Voodoo Eyes (amber outer glow + blazing yellow-white core)
    glow(
      b.part(new THREE.SphereGeometry(0.028, 8, 6), VOODOO_AMBER, {
        bone: head,
        at: [s * 0.068, 1.795, 0.432],
        scale: [1.15, 0.82, 0.9],
        group: "head",
      }),
      1.8,
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.015, 0), "#fff9b0", {
        bone: head,
        at: [s * 0.068, 1.795, 0.454],
        scale: [0.55, 1.1, 0.6],
        group: "head",
      }),
      2.2,
    );
  }

  // Prominent hooked Warcraft Troll Nose with septum ring and wart
  b.sweep(
    catmull([
      [0, 1.82, 0.45],
      [0, 1.78, 0.55],
      [0, 1.72, 0.60],
      [0, 1.69, 0.56],
    ]),
    [0.038, 0.044, 0.032, 0.016],
    TROLL_HEAD_SKIN,
    { bone: noseJoint, sides: 6, group: "head", name: "trollNose" },
  );
  // Nose wart
  b.part(new THREE.DodecahedronGeometry(0.018, 0), MOSS_BRIGHT, {
    bone: noseJoint,
    at: [0.022, 1.76, 0.55],
    flat: true,
    group: "head",
  });
  // Heavy gold nose septum ring
  b.sweep(
    catmull(
      [
        [0.026, 1.70, 0.53],
        [0.036, 1.66, 0.54],
        [0, 1.64, 0.55],
        [-0.036, 1.66, 0.54],
        [-0.026, 1.70, 0.53],
      ],
      { closed: true },
    ),
    0.010,
    GOLD_PAINT,
    { bone: noseJoint, sides: 5, group: "head" },
  );

  // Upper gum & upper fangs
  b.capsule([-0.055, 1.71, 0.45], [0.055, 1.71, 0.45], 0.024, GUM_RED, {
    bone: head,
    sides: 6,
    group: "head",
  });
  for (const s of [1, -1] as const) {
    b.spike([s * 0.042, 1.71, 0.46], [s * 0.08, -1, 0.15], 0.045, 0.014, TUSK_TIP, {
      bone: head,
      sides: 5,
      group: "head",
    });
  }

  // Long Swept-Back Pointed Troll Ears + Bone Piercings & Feathers
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[side];
    const earPath = catmull([
      [s * 0.13, 1.78, 0.31],
      [s * 0.27, 1.83, 0.22],
      [s * 0.42, 1.88, 0.11],
      [s * 0.53, 1.92, 0.02],
    ]);
    b.sweep(
      earPath,
      (t) => [0.024 * (1 - t * 0.75) + 0.004, 0.058 * Math.sin(t * Math.PI * 0.85 + 0.2) * (1 - t * 0.55) + 0.006],
      TROLL_HEAD_SKIN,
      {
        bone: earJ,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: "head",
        name: `earSweep${side}`,
      },
    );
    // Ear inner cartilage ridge
    b.sweep(
      catmull([
        [s * 0.15, 1.77, 0.33],
        [s * 0.30, 1.81, 0.24],
        [s * 0.44, 1.86, 0.14],
      ]),
      [0.016, 0.006],
      SKIN_BELLY,
      { bone: earJ, sides: 5, group: "head" },
    );
    // Gold ear hoops & bone needle piercing
    b.sweep(
      catmull(
        [
          [s * 0.26, 1.80, 0.23],
          [s * 0.29, 1.75, 0.24],
          [s * 0.26, 1.72, 0.21],
          [s * 0.23, 1.76, 0.20],
        ],
        { closed: true },
      ),
      0.009,
      GOLD_PAINT,
      { bone: earJ, sides: 5, group: "head" },
    );
    b.spike([s * 0.36, 1.89, 0.15], [s * 0.2, -0.9, -0.3], 0.11, 0.011, BONE_PAINT, {
      bone: earJ,
      sides: 4,
      group: "head",
    });
    // Hanging feather card on ear hoop
    b.cards([frame([s * 0.26, 1.73, 0.22], [0, 1, 0])], FEATHER_CARD_TEX, {
      size: [0.055, 0.15],
      lean: 180,
      flow: [s * 0.4, 0, -1],
      bone: earJ,
      group: "head",
    });
  }

  // Heavy Hinged Lower Jaw, Chin Beard, Teeth & Colossal Curved Tusks
  b.loft(
    [
      { at: [0, 1.67, 0.29], w: 0.20, h: 0.11 },
      { at: [0, 1.64, 0.39], w: 0.22, h: 0.12 },
      { at: [0, 1.62, 0.49], w: 0.17, h: 0.11 },
      { at: [0, 1.59, 0.53], w: 0.11, h: 0.09 },
    ],
    {
      bone: jaw,
      color: TROLL_HEAD_SKIN,
      group: "head",
      name: "lowerJaw",
    },
  );

  // Lower gum, tongue & jagged lower teeth
  b.capsule([0, 1.65, 0.36], [0, 1.64, 0.47], [0.042, 0.032], GUM_RED, {
    bone: jaw,
    sides: 6,
    group: "head",
  });
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.018, 1.65, 0.49 - Math.abs(i) * 0.01], [0, 1, 0.18], 0.036, 0.010, TUSK_TIP, {
      bone: jaw,
      sides: 4,
      group: "head",
    });
  }

  // Braided Chin Goatee with Bone Clasp
  b.sweep(
    catmull([
      [0, 1.59, 0.51],
      [0, 1.49, 0.54],
      [0, 1.38, 0.52],
    ]),
    [0.042, 0.032, 0.010],
    MOHAWK_PAINT,
    { bone: jaw, caps: { start: "round", end: "point" }, sides: 6, group: "head" },
  );
  b.rod([0, 1.47, 0.535], [0, 1.43, 0.528], 0.036, GOLD_PAINT, {
    bone: jaw,
    sides: 6,
    group: "head",
  });

  // COLOSSAL WARCRAFT TUSKS (Primary giant upward-sweeping tusks + secondary cheek tusks + fetish bands)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const tuskCurve = catmull([
      [s * 0.075, 1.63, 0.44],
      [s * 0.15, 1.66, 0.55],
      [s * 0.21, 1.79, 0.63],
      [s * 0.23, 1.96, 0.59],
      [s * 0.19, 2.09, 0.49],
    ]);
    b.sweep(tuskCurve, [0.048, 0.044, 0.035, 0.022, 0.005], TUSK_PAINT, {
      bone: jaw,
      caps: { start: "round", end: "point" },
      sides: 7,
      group: "head",
      name: `tuskMain${side}`,
    });

    // Gold & leather tusk fetish bands on left and right tusks
    for (const bandT of [0.26, 0.52]) {
      const bp = tuskCurve.at(bandT);
      const bt = tuskCurve.tangentAt(bandT);
      const pA = offset(bp, bt, -0.018);
      const pB = offset(bp, bt, 0.018);
      b.rod(pA, pB, 0.046 * (1 - bandT * 0.35), bandT < 0.4 ? LEATHER_PAINT : GOLD_PAINT, {
        bone: jaw,
        sides: 6,
        group: "head",
      });
    }

    // Secondary lower cheek tusk
    b.sweep(
      bezier(
        [s * 0.095, 1.63, 0.38],
        [s * 0.18, 1.65, 0.43],
        [s * 0.22, 1.75, 0.45],
      ),
      [0.028, 0.018, 0.004],
      TUSK_PAINT,
      { bone: jaw, caps: { start: "round", end: "point" }, sides: 6, group: "head" },
    );
  }

  // BLAZING SWAMP-TROLL MOHAWK (Chunky sculpted flame locks + bone hair-clasps + hair-card crest)
  const mohawkProfiles = [
    { tip: [0, 2.38, 0.54], ctrl: [0, 2.16, 0.48], w: 0.055, d: 0.09 },
    { tip: [0, 2.58, 0.38], ctrl: [0, 2.26, 0.38], w: 0.065, d: 0.11 },
    { tip: [0, 2.64, 0.16], ctrl: [0, 2.30, 0.25], w: 0.070, d: 0.12 },
    { tip: [0, 2.54, -0.06], ctrl: [0, 2.24, 0.12], w: 0.065, d: 0.11 },
    { tip: [0, 2.36, -0.22], ctrl: [0, 2.12, 0.01], w: 0.058, d: 0.10 },
    { tip: [0, 2.12, -0.30], ctrl: [0, 1.98, -0.08], w: 0.050, d: 0.085 },
  ];

  mohawkJoints.forEach((mj, idx) => {
    const spec = mohawkProfiles[idx];
    const lockPath = bezier(mj.at, spec.ctrl, spec.tip);
    b.sweep(
      lockPath,
      (t) => [
        spec.w * (1 - t * 0.82) + 0.005,
        spec.d * Math.sin(t * Math.PI * 0.75 + 0.25) * (1 - t * 0.65) + 0.008,
      ],
      MOHAWK_PAINT,
      {
        bone: mj,
        caps: { start: "round", end: "point" },
        sides: 6,
        group: "mohawk",
        name: `mohawkLock${idx + 1}`,
      },
    );
    // Bone & gold ring clasp at base of each mohawk lock
    const ringStart = lockPath.at(0.10);
    const ringEnd = lockPath.at(0.18);
    b.rod(ringStart, ringEnd, [spec.w * 1.05, spec.w * 0.98], idx % 2 === 0 ? BONE_PAINT : GOLD_PAINT, {
      bone: mj,
      sides: 6,
      group: "mohawk",
    });
  });

  // Layered flame-hair cards flanking the mohawk locks for extra volume & silhouette
  const mohawkCardFrames = mohawkJoints.map((mj, idx) =>
    frame(lerp(mj.at, mohawkProfiles[idx].ctrl, 0.35), [0, 1, -0.2]),
  );
  b.cards(mohawkCardFrames, HAIR_FLAME_TEX, {
    size: [0.18, 0.42],
    lean: 12,
    flow: [0, 0.2, -1],
    cross: true,
    bone: head,
    group: "mohawk",
  });

  // ===================================================================================================================
  // 4. WITCH-DOCTOR BACK TOTEM RACK & HANGING BONE FETISHES
  // ===================================================================================================================

  // Crossed leather & bone harness straps over torso
  for (const s of [1, -1] as const) {
    const strapLoop = catmull(
      [
        [s * 0.30, 1.78, 0.08],
        [0, 1.48, 0.26],
        [-s * 0.24, 1.16, 0.14],
        [-s * 0.24, 1.18, -0.18],
        [0, 1.54, -0.24],
        [s * 0.30, 1.78, -0.12],
      ],
      { closed: true },
    );
    b.sweep(strapLoop, (t) => [0.028 + 0.004 * Math.sin(t * 6), 0.014], LEATHER_PAINT, {
      bone: chest,
      sides: 5,
      group: "totemRack",
    });

    // Tall curved bone totem poles rising behind the shoulders
    const polePath = catmull([
      [s * 0.18, 1.44, -0.22],
      [s * 0.26, 1.82, -0.18],
      [s * 0.38, 2.18, -0.15],
      [s * 0.48, 2.46, -0.12],
    ]);
    b.sweep(polePath, [0.036, 0.032, 0.028, 0.012], WOOD_PAINT, {
      bone: chest,
      caps: { start: "flat", end: "point" },
      sides: 6,
      group: "totemRack",
    });

    // Rib-bone crescents lashed along the totem poles
    for (let k = 0; k < 3; k++) {
      const pt = polePath.at(0.28 + k * 0.22);
      b.sweep(
        bezier(
          [pt.x - s * 0.04, pt.y - 0.02, pt.z],
          [pt.x + s * 0.10, pt.y + 0.03, pt.z - 0.04],
          [pt.x + s * 0.18, pt.y + 0.11, pt.z - 0.02],
        ),
        [0.020, 0.014, 0.003],
        BONE_PAINT,
        { bone: chest, caps: { start: "round", end: "point" }, sides: 5, group: "totemRack" },
      );
    }

    // Feathers fanning from top of totem poles
    b.cards(
      [
        frame([s * 0.44, 2.36, -0.13], [s * 0.85, 0.45, -0.2]),
        frame([s * 0.47, 2.42, -0.12], [s * 0.65, 0.72, -0.2]),
      ],
      FEATHER_CARD_TEX,
      {
        size: [0.11, 0.32],
        lean: 10,
        flow: [s * 0.5, 0.5, -0.7],
        bone: chest,
        group: "totemRack",
      },
    );
  }

  // Horizontal bone crossbar uniting the two totem poles
  buildBoneClubSegment(b, [-0.48, 2.15, -0.14], [0.48, 2.15, -0.14], 0.028, "chest", "totemRack");

  // Central Horned Beast Skull Altar at top center of the Totem Rack
  buildMiniSkull(b, [0, 2.24, -0.16], [0, 0.15, -1], 1.55, "chest", "totemRack", VOODOO_GREEN);
  for (const s of [1, -1] as const) {
    b.sweep(
      catmull([
        [s * 0.08, 2.28, -0.16],
        [s * 0.24, 2.38, -0.22],
        [s * 0.32, 2.54, -0.14],
      ]),
      [0.032, 0.022, 0.005],
      BONE_PAINT,
      { bone: chest, caps: { start: "round", end: "point" }, sides: 5, group: "totemRack" },
    );
  }

  // Glowing Voodoo Rune Sigil floating between the totem horns
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: chest,
      at: [0, 2.44, -0.16],
      dir: [0, 0, -1],
      axis: "z",
      texture: RUNE_GLOW_TEX,
      group: "totemRack",
    }),
    2.0,
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: chest,
      at: [0, 2.44, -0.155],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE_GLOW_TEX,
      group: "totemRack",
    }),
    2.0,
  );

  // Hanging Shrunken Skulls & Voodoo Soul-Lanterns on left and right of crossbar
  for (const [s, jarJoint] of [
    [1, totemJarL],
    [-1, totemJarR],
  ] as const) {
    const jx = s * 0.46;
    // Leather cord
    b.rod([jx, 2.15, -0.14], [jx, 1.96, -0.14], 0.011, LEATHER_PAINT, {
      bone: jarJoint,
      sides: 4,
      group: "totemRack",
    });
    // Shrunken fetish skull above lantern
    buildMiniSkull(b, [jx, 1.95, -0.14], [s * 0.3, -0.1, 0.9], 0.92, jarJoint.name, "totemRack", VOODOO_AMBER);
    // Glowing voodoo soul crystal caged in bone ribs below skull
    glow(
      b.part(new THREE.OctahedronGeometry(0.052, 0), s > 0 ? VOODOO_GREEN : VOODOO_PURPLE, {
        bone: jarJoint,
        at: [jx, 1.79, -0.14],
        scale: [0.85, 1.35, 0.85],
        group: "totemRack",
      }),
      2.0,
    );
    // Bone cap and bottom spike on crystal lantern
    b.rod([jx, 1.86, -0.14], [jx, 1.83, -0.14], [0.032, 0.044], GOLD_PAINT, {
      bone: jarJoint,
      sides: 5,
      group: "totemRack",
    });
    b.spike([jx, 1.73, -0.14], [0, -1, 0], 0.07, 0.022, BONE_PAINT, {
      bone: jarJoint,
      sides: 4,
      group: "totemRack",
    });
  }

  // ===================================================================================================================
  // 5. CHEST SKULL NECKLACE & VOODOO TALISMANS
  // ===================================================================================================================

  const necklacePath = catmull([
    [0.24, 1.74, 0.14],
    [0.20, 1.56, 0.25],
    [0, 1.47, 0.28],
    [-0.20, 1.56, 0.25],
    [-0.24, 1.74, 0.14],
  ]);
  b.sweep(necklacePath, 0.014, LEATHER_PAINT, {
    bone: chest,
    sides: 5,
    group: "fetishes",
  });

  // Bone teeth & gold beads along the necklace
  b.along(necklacePath, 9, (pt) => {
    const isCenter = Math.abs(pt.t - 0.5) < 0.08;
    if (isCenter) return;
    b.part(new THREE.OctahedronGeometry(0.022, 0), GOLD_PAINT, {
      bone: chest,
      at: pt.at,
      group: "fetishes",
    });
    b.spike(
      pt.at,
      [pt.at.x * 0.6, -0.85, 0.5],
      0.065 + (1 - Math.abs(pt.t - 0.5)) * 0.03,
      0.015,
      BONE_PAINT,
      { bone: chest, sides: 4, group: "fetishes" },
    );
  });

  // Central Sternum Shrunken Skull Fetish + Glowing Eye Gem & Rib Talisman
  buildMiniSkull(b, [0, 1.46, 0.29], [0, -0.1, 1], 1.15, chestFetishJoint.name, "fetishes", VOODOO_GREEN);
  for (const s of [1, -1] as const) {
    b.spike([s * 0.05, 1.38, 0.29], [s * 0.45, -1, 0.25], 0.09, 0.016, BONE_PAINT, {
      bone: chestFetishJoint,
      sides: 4,
      group: "fetishes",
    });
  }

  // ===================================================================================================================
  // 6. ARMS, ASYMMETRIC BONE PAULDRONS, BOG-WOOD BRACERS & CLAWED HANDS
  // ===================================================================================================================

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const rig = sides[side];
    const armGroup = `arm${side}`;

    // Muscular Warcraft arm sweep (huge deltoid, thick bicep, chunky forearm tapering to wrist)
    b.sweep(
      rig.armChain,
      (t) => {
        if (t < 0.25) return 0.135 - t * 0.08;
        if (t < 0.55) return 0.105 + Math.sin((t - 0.25) * Math.PI * 3.3) * 0.028;
        return 0.125 * (1 - (t - 0.55) * 0.55);
      },
      TROLL_SKIN,
      {
        group: armGroup,
        name: `armSweep${side}`,
      },
    );

    // Extra deltoid cap muscle
    b.part(new THREE.DodecahedronGeometry(0.135, 1), TROLL_SKIN, {
      bone: rig.armChain.joints[0],
      at: [s * 0.39, 1.68, 0.04],
      scale: [1.05, 0.95, 0.92],
      group: armGroup,
    });

    // Bicep leather & bone arm-band
    const upperArmMid = rig.armChain.at(0.26);
    b.rod(
      offset(upperArmMid.at, upperArmMid.tangent, -0.025),
      offset(upperArmMid.at, upperArmMid.tangent, 0.025),
      0.118,
      LEATHER_PAINT,
      { bone: rig.armChain.joints[0], sides: 7, group: armGroup },
    );
    b.spike(
      [upperArmMid.at.x + s * 0.09, upperArmMid.at.y, upperArmMid.at.z - 0.04],
      [s * 0.85, 0.25, -0.4],
      0.11,
      0.024,
      BONE_PAINT,
      { bone: rig.armChain.joints[0], sides: 5, group: armGroup },
    );

    // ASYMMETRIC BONE FETISH PAULDRONS
    if (s > 0) {
      // Left Shoulder: Giant Swamp-Beast Skull Pauldron with Twin Curved Horns & Glowing Eye Sockets
      b.part(new THREE.DodecahedronGeometry(0.16, 0), BONE_PAINT, {
        bone: rig.pauldronJoint,
        at: [0.43, 1.79, 0.04],
        scale: [1.2, 0.85, 1.15],
        flat: true,
        group: armGroup,
      });
      for (const fz of [1, -1] as const) {
        glow(
          b.part(new THREE.OctahedronGeometry(0.030, 0), VOODOO_GREEN, {
            bone: rig.pauldronJoint,
            at: [0.54, 1.80, 0.04 + fz * 0.065],
            group: armGroup,
          }),
          1.8,
        );
        // Giant sweeping skull horns
        b.sweep(
          catmull([
            [0.44, 1.83, 0.04 + fz * 0.09],
            [0.58, 1.94, 0.04 + fz * 0.16],
            [0.68, 2.12, 0.04 + fz * 0.12],
          ]),
          [0.044, 0.028, 0.005],
          TUSK_PAINT,
          {
            bone: rig.pauldronJoint,
            caps: { start: "round", end: "point" },
            sides: 6,
            group: armGroup,
          },
        );
      }
      // Bone teeth trim along outer rim of skull pauldron
      for (let k = -2; k <= 2; k++) {
        b.spike(
          [0.55, 1.72, 0.04 + k * 0.045],
          [0.85, -0.5, k * 0.15],
          0.075,
          0.018,
          TUSK_TIP,
          { bone: rig.pauldronJoint, sides: 4, group: armGroup },
        );
      }
    } else {
      // Right Shoulder: Layered Bog-Turtle Carapace & Lashed Bone Spikes
      b.part(new THREE.DodecahedronGeometry(0.165, 0), SHELL_PAINT, {
        bone: rig.pauldronJoint,
        at: [-0.43, 1.78, 0.04],
        scale: [1.25, 0.72, 1.18],
        flat: true,
        group: armGroup,
      });
      b.part(new THREE.DodecahedronGeometry(0.125, 0), SHELL_PAINT, {
        bone: rig.pauldronJoint,
        at: [-0.40, 1.86, 0.04],
        scale: [1.1, 0.65, 1.05],
        flat: true,
        group: armGroup,
      });
      for (let k = -1; k <= 1; k++) {
        b.spike(
          [-0.48, 1.84, 0.04 + k * 0.08],
          [-0.82, 0.55, k * 0.25],
          0.16,
          0.028,
          BONE_PAINT,
          { bone: rig.pauldronJoint, sides: 5, group: armGroup },
        );
      }
    }

    // Forearm Bog-Wood & Bone Bracers
    const fStart = rig.armChain.at(0.54).at;
    const fEnd = rig.armChain.at(0.78).at;
    b.rod(fStart, fEnd, [0.118, 0.102], LEATHER_PAINT, {
      bone: rig.armChain.joints[1],
      sides: 7,
      group: armGroup,
    });
    // Lashed bone splints & gold rivets around the forearm bracer
    const fMid = lerp(fStart, fEnd, 0.5);
    const fDir = fEnd.clone().sub(fStart).normalize();
    b.ring(
      frame(fMid, fDir),
      { count: 5, radius: 0.108, bone: rig.armChain.joints[1], group: armGroup },
      (item) => {
        b.rod(
          offset(item.at, fDir, -0.09),
          offset(item.at, fDir, 0.09),
          0.018,
          WOOD_PAINT,
          { bone: rig.armChain.joints[1], sides: 5, group: armGroup },
        );
        b.part(new THREE.OctahedronGeometry(0.020, 0), GOLD_PAINT, {
          bone: rig.armChain.joints[1],
          at: offset(item.at, item.outward, 0.012),
          group: armGroup,
        });
      },
    );
    // Forearm bone blade spur
    b.spike(
      [fMid.x + s * 0.09, fMid.y + 0.02, fMid.z - 0.06],
      [s * 0.6, 0.5, -0.6],
      0.16,
      0.028,
      BONE_PAINT,
      { bone: rig.armChain.joints[1], sides: 5, group: armGroup },
    );

    // Oversized Warcraft Hand Palm & Knuckles
    const handJ = rig.armChain.joints[3];
    b.frustumBox(
      [s * 0.84, 1.11, 0.20],
      [s * 0.92, 0.99, 0.25],
      [0.12, 0.17],
      [0.14, 0.19],
      {
        bone: handJ,
        color: HAND_FOOT_PAINT,
        up: [0, 0, 1],
        group: armGroup,
      },
    );

    // Three Articulated Troll Fingers + Claws
    for (const fChain of rig.fingers) {
      b.sweep(fChain, [0.032, 0.026, 0.018], HAND_FOOT_PAINT, {
        sides: 6,
        group: armGroup,
      });
      const tipPt = fChain.at(1).at;
      const tipTan = fChain.at(1).tangent;
      b.spike(tipPt, tipTan, 0.055, 0.018, CLAW_DARK, {
        bone: fChain.joints[1],
        sides: 5,
        group: armGroup,
      });
    }

    // Heavy Troll Thumb + Claw
    b.sweep(rig.thumb, [0.036, 0.028, 0.020], HAND_FOOT_PAINT, {
      sides: 6,
      group: armGroup,
    });
    b.spike(rig.thumb.at(1).at, rig.thumb.at(1).tangent, 0.052, 0.019, CLAW_DARK, {
      bone: rig.thumb.joints[1],
      sides: 5,
      group: armGroup,
    });
  }

  // ===================================================================================================================
  // 7. WAIST BELT, HORNS-SKULL BUCKLE, TRIBAL LOINCLOTHS & HIP BONE FETISHES
  // ===================================================================================================================

  // Chunky swamp-leather war-belt around the waist
  const beltLoop = catmull(
    [
      [0, 1.06, 0.16],
      [0.25, 1.06, 0.06],
      [0.24, 1.07, -0.16],
      [0, 1.08, -0.24],
      [-0.24, 1.07, -0.16],
      [-0.25, 1.06, 0.06],
    ],
    { closed: true },
  );
  b.sweep(beltLoop, (t) => [0.048 + 0.005 * Math.cos(t * 4), 0.032], LEATHER_PAINT, {
    bone: hips,
    sides: 6,
    group: "belt",
    name: "waistBelt",
  });

  // Gold & bone studs around the belt
  b.along(beltLoop, 10, (pt) => {
    if (pt.at.z > 0.12) return;
    b.part(new THREE.OctahedronGeometry(0.024, 0), GOLD_PAINT, {
      bone: hips,
      at: [pt.at.x * 1.08, pt.at.y, pt.at.z * 1.08],
      group: "belt",
    });
  });

  // Heroic Skull Belt Buckle with Curved Side Tusks
  buildMiniSkull(b, [0, 1.06, 0.20], [0, 0, 1], 1.35, "hips", "belt", VOODOO_AMBER);
  for (const s of [1, -1] as const) {
    b.sweep(
      bezier(
        [s * 0.06, 1.04, 0.21],
        [s * 0.15, 1.06, 0.25],
        [s * 0.18, 1.15, 0.22],
      ),
      [0.024, 0.016, 0.004],
      TUSK_PAINT,
      { bone: hips, caps: { start: "round", end: "point" }, sides: 5, group: "belt" },
    );
  }

  // Front & Back Tribal Loincloth Banners (skinned to hinge chains)
  b.sweep(
    loinFront,
    (t) => [0.14 + t * 0.03, 0.020 * (1 - t * 0.35)],
    LOINCLOTH_PAINT,
    { section: "box", group: "belt", name: "loinFrontBanner" },
  );
  b.sweep(
    loinBack,
    (t) => [0.16 + t * 0.03, 0.020 * (1 - t * 0.35)],
    LOINCLOTH_PAINT,
    { section: "box", group: "belt", name: "loinBackBanner" },
  );

  // Bone weights on bottom corners of front loincloth
  for (const s of [1, -1] as const) {
    b.spike([s * 0.12, 0.54, 0.19], [s * 0.15, -1, 0.1], 0.07, 0.016, BONE_PAINT, {
      bone: loinFront.joints[1],
      sides: 4,
      group: "belt",
    });
  }

  // Left Hip Fetish: Shrunken Trophy Skull + Rattling Bone Chimes
  buildMiniSkull(b, [0.31, 0.90, 0.08], [0.85, -0.1, 0.5], 1.05, hipFetishL.name, "fetishes", VOODOO_GREEN);
  for (let c = -1; c <= 1; c++) {
    const bx = 0.30 + c * 0.025;
    const bz = 0.08 + c * 0.04;
    buildBoneClubSegment(
      b,
      [bx, 0.82, bz],
      [bx + 0.02, 0.67 - Math.abs(c) * 0.02, bz],
      0.015,
      hipFetishL.name,
      "fetishes",
    );
  }

  // Right Hip Fetish: Voodoo Swamp Potion Gourd & Crossed Femur Bones
  b.lathe(
    [
      [0, 0],
      [0.065, 0.01],
      [0.082, 0.055],
      [0.042, 0.105],
      [0.058, 0.145],
      [0.026, 0.185],
      [0.032, 0.215],
      [0, 0.215],
    ],
    {
      at: [-0.31, 0.74, 0.06],
      axis: [-0.18, 0.98, 0.05],
      segments: 8,
      smoothing: 1,
      color: cel("#b86f28", "#633510"),
      bone: hipFetishR,
      group: "fetishes",
      name: "voodooGourd",
    },
  );
  // Glowing cork stopper & bone cross-tie on the gourd
  glow(
    b.part(new THREE.OctahedronGeometry(0.026, 0), VOODOO_GREEN, {
      bone: hipFetishR,
      at: [-0.35, 0.96, 0.07],
      group: "fetishes",
    }),
    1.8,
  );
  buildBoneClubSegment(b, [-0.28, 0.94, 0.15], [-0.34, 0.75, -0.02], 0.016, hipFetishR.name, "fetishes");

  // ===================================================================================================================
  // 8. LEGS, KNEE BONE GUARDS, ANKLE WRAPS & TWO-TOED CLAWED TROLL FEET (Planted on y = 0)
  // ===================================================================================================================

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const rig = sides[side];
    const legGroup = `leg${side}`;

    // Powerful thigh & calf sweep
    b.sweep(
      rig.legChain,
      (t) => {
        if (t < 0.45) return 0.155 - t * 0.09;
        if (t < 0.82) return 0.115 - (t - 0.45) * 0.08;
        return 0.075;
      },
      TROLL_SKIN,
      {
        to: 0.85,
        group: legGroup,
        name: `legSweep${side}`,
      },
    );

    // Horned Knee Skull Cap & Calf Leather Straps
    const kneeJ = rig.legChain.joints[1];
    const kneePos = kneeJ.at;
    b.part(new THREE.DodecahedronGeometry(0.095, 0), BONE_PAINT, {
      bone: kneeJ,
      at: [kneePos.x + s * 0.02, kneePos.y + 0.02, kneePos.z + 0.07],
      scale: [0.95, 1.1, 0.8],
      flat: true,
      group: legGroup,
    });
    b.spike(
      [kneePos.x + s * 0.04, kneePos.y + 0.03, kneePos.z + 0.11],
      [s * 0.35, 0.45, 0.82],
      0.13,
      0.032,
      TUSK_PAINT,
      { bone: kneeJ, sides: 5, group: legGroup },
    );

    // Calf & Ankle Leather Wraps with Sticking-Out Bone Fetishes
    const shinMid = lerp(kneePos, rig.legChain.joints[2].at, 0.45);
    const anklePos = rig.legChain.joints[2].at;
    b.rod(
      [shinMid.x, shinMid.y + 0.05, shinMid.z],
      [shinMid.x, shinMid.y - 0.07, shinMid.z - 0.02],
      [0.108, 0.095],
      LEATHER_PAINT,
      { bone: kneeJ, sides: 7, group: legGroup },
    );
    b.rod(
      [anklePos.x, anklePos.y + 0.09, anklePos.z],
      [anklePos.x, anklePos.y + 0.01, anklePos.z],
      [0.090, 0.084],
      GOLD_PAINT,
      { bone: kneeJ, sides: 7, group: legGroup },
    );
    for (const fb of [1, -1] as const) {
      b.spike(
        [anklePos.x + s * 0.07, anklePos.y + 0.06, anklePos.z + fb * 0.04],
        [s * 0.85, 0.35, fb * 0.4],
        0.095,
        0.020,
        BONE_PAINT,
        { bone: kneeJ, sides: 4, group: legGroup },
      );
    }

    // Heavy Troll Foot Arch (resting flat on y = 0)
    const footJ = rig.legChain.joints[3];
    b.capsule(
      [s * 0.36, 0.065, -0.06],
      [s * 0.36, 0.055, 0.14],
      [0.065, 0.055],
      HAND_FOOT_PAINT,
      { bone: footJ, sides: 8, group: legGroup, name: `footArch${side}` },
    );

    // Calloused Sole Pads touching y = 0.000 exactly
    b.part(new THREE.CylinderGeometry(0.062, 0.066, 0.024, 7), SKIN_DEEP, {
      bone: footJ,
      at: [s * 0.36, 0.012, -0.05],
      group: legGroup,
    });
    b.part(new THREE.CylinderGeometry(0.068, 0.072, 0.024, 7), SKIN_DEEP, {
      bone: footJ,
      at: [s * 0.36, 0.012, 0.13],
      group: legGroup,
    });

    // Inner & Outer Big Front Toes (bottom at y = 0.000..0.002) + Heavy Curved Claws
    b.sweep(rig.toeIn, [0.044, 0.038, 0.026], HAND_FOOT_PAINT, {
      sides: 6,
      group: legGroup,
      name: `toeInSweep${side}`,
    });
    b.spike(
      [s * 0.28, 0.026, 0.33],
      [s * 0.26, 0.006, 0.42],
      null,
      0.025,
      CLAW_DARK,
      { bone: rig.toeIn.joints[1], sides: 5, group: legGroup },
    );

    b.sweep(rig.toeOut, [0.040, 0.034, 0.024], HAND_FOOT_PAINT, {
      sides: 6,
      group: legGroup,
      name: `toeOutSweep${side}`,
    });
    b.spike(
      [s * 0.47, 0.024, 0.30],
      [s * 0.50, 0.006, 0.39],
      null,
      0.023,
      CLAW_DARK,
      { bone: rig.toeOut.joints[1], sides: 5, group: legGroup },
    );

    // Rear Heel-Spur Toe + Claw
    b.capsule(
      [s * 0.36, 0.038, -0.06],
      [s * 0.36, 0.025, -0.19],
      [0.038, 0.025],
      HAND_FOOT_PAINT,
      { bone: rig.toeHeel, sides: 6, group: legGroup, name: `toeHeelSweep${side}` },
    );
    b.spike(
      [s * 0.36, 0.025, -0.18],
      [s * 0.36, 0.006, -0.26],
      null,
      0.022,
      CLAW_DARK,
      { bone: rig.toeHeel, sides: 5, group: legGroup },
    );
  }

  // ===================================================================================================================
  // 9. SWAMP MOSS TENDRILS & TRIBAL FEATHER CARDS
  // ===================================================================================================================

  // Hanging swamp moss cards draped from shoulders, back hump, totem crossbar, and bracers
  const mossFrames = [
    frame([0.22, 1.84, -0.08], [0, 1, 0]),
    frame([-0.22, 1.84, -0.08], [0, 1, 0]),
    frame([0, 1.88, -0.16], [0, 1, 0]),
    frame([0.34, 2.13, -0.14], [0, 1, 0]),
    frame([-0.34, 2.13, -0.14], [0, 1, 0]),
    frame([0.16, 2.14, -0.14], [0, 1, 0]),
    frame([-0.16, 2.14, -0.14], [0, 1, 0]),
    frame([0.46, 1.72, 0.04], [0, 1, 0]),
    frame([-0.46, 1.72, 0.04], [0, 1, 0]),
    frame([0.24, 1.03, -0.12], [0, 1, 0]),
    frame([-0.24, 1.03, -0.12], [0, 1, 0]),
  ];
  b.cards(mossFrames, MOSS_STRAND_TEX, {
    size: [0.12, 0.28],
    lean: 180,
    flow: [0, 0, 1],
    cross: true,
    vary: 0.22,
    rng: rng(307),
    bone: chest,
    group: "mossCards",
  });

  // Ragged tribal feather fan behind the neck/totem base
  const collarFeatherFrames = [-0.28, -0.14, 0, 0.14, 0.28].map((x) =>
    frame([x, 1.94, -0.08], [x * 1.4, 0.85, -0.55]),
  );
  b.cards(collarFeatherFrames, FEATHER_CARD_TEX, {
    size: [0.10, 0.28],
    lean: 18,
    flow: [0, 0.4, -1],
    vary: 0.15,
    rng: rng(409),
    bone: chest,
    group: "totemRack",
  });

  // ===================================================================================================================
  // 10. REST POSE REFINEMENT (Slight fierce snarl on jaw, natural flare on ears)
  // ===================================================================================================================

  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });
  b.pose(earJoints.L, { axis: [0, 1, 0], deg: -8 });
  b.pose(earJoints.R, { axis: [0, 1, 0], deg: 8 });

  return b.root;
}
