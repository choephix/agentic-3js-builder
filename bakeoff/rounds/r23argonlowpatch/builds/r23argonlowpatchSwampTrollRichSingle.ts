import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, mid, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import {
  cells,
  countershade,
  gradient,
  grain,
  mix,
  mottle,
  noise,
  paint,
  smoothstep,
  spots,
  stripes,
} from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Chunky Blizzard/Warcraft swamp troll berserker-witchdoctor with towering fiery-teal mohawk, huge bound tusks, tribal warpaint, shrunken-skull belt fetishes, totem shoulder racks, and glowing voodoo runes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "swampTroll", detail: 1, paintSize: 2048 });

  // ============================================================================
  // PALETTE & HAND-PAINTED WARCRAFT PAINTS
  // ============================================================================
  // Rich saturated bog-teal & moss-green troll skin, warm purple-indigo shadows,
  // ochre-cream belly, vivid magenta-orange mohawk, aged ivory bones, weathered wood & bronze.
  const SKIN_LIT = "#388c72";
  const SKIN_MID = "#286b58";
  const SKIN_DARK = "#19433d";
  const SKIN_DEEP = "#11292b";
  const SKIN_HIGHLIGHT = "#5cb892";
  const BELLY_PALE = "#829c68";
  const BELLY_WARM = "#9cb078";
  const WARPAINT_CYAN = "#52f7d8";
  const WARPAINT_OCHRE = "#f0b23a";
  const WARPAINT_CRIMSON = "#c92a2a";

  const SCAR_PINK = "#7a4452";
  const WART_GREEN = "#6ca34b";
  const MOSS_BRIGHT = "#5c9e31";
  const MOSS_DARK = "#2d5918";

  const BONE_LIGHT = "#f2e6c9";
  const BONE_MID = "#d4be94";
  const BONE_DARK = "#8c704c";
  const BONE_CHAR = "#3d2f24";

  const TUSK_TIP = "#fff6dc";
  const TUSK_BASE = "#b8965c";
  const TUSK_ROOT = "#594126";

  const HAIR_ROOT = "#3b0d2c";
  const HAIR_BASE = "#9e1938";
  const HAIR_MID = "#db3b25";
  const HAIR_TIP = "#ff9e22";
  const HAIR_TEAL_STREAK = "#2be8b5";

  const WOOD_LIGHT = "#7d4e2d";
  const WOOD_DARK = "#3d2314";
  const LEATHER_DARK = "#382015";
  const LEATHER_MID = "#5e3622";
  const LEATHER_TAN = "#8f5938";
  const ROPE_HEMP = "#b5925b";
  const CLOTH_PURPLE = "#4f214d";
  const CLOTH_CRIMSON = "#7d1d28";
  const CLOTH_TATTER = "#2e152b";

  const BRONZE_LIGHT = "#d99b38";
  const BRONZE_DARK = "#6e4615";
  const IRON_DARK = "#363c42";
  const IRON_RIM = "#5c6770";

  const VOODOO_GREEN = "#39ff7e";
  const VOODOO_CYAN = "#26f7fd";
  const EYE_GLOW = "#ffee38";
  const AMBER_GLOW = "#ff7b1c";

  // Hand-painted Warcraft skin: strong top-down lighting gradient, mottled bog texture,
  // warm fleshy belly countershade, dark mud-stained lower calves, and subtle tribal stripes on back/limbs.
  const skinBase = mottle(SKIN_MID, SKIN_LIT, { size: 0.16, contrast: 1.4, seed: 11 });
  const skinDappled = spots(skinBase, [SKIN_DARK, SKIN_HIGHLIGHT, MOSS_DARK], {
    size: 0.11,
    amount: 0.45,
    rosette: true,
    seed: 23,
  });
  const skinStriped = stripes(skinDappled, SKIN_DARK, {
    size: 0.14,
    axis: [0, 0.35, 1],
    width: 0.32,
    wobble: 0.65,
    seed: 37,
  });

  const trollSkin = paint((p, n) => {
    const base = skinStriped.at(p, n);
    // Top-down heroic lighting + upward normal boost (hand-painted style)
    const upLight = smoothstep(-0.35, 0.75, n.y * 0.75 + 0.25);
    const heightLight = smoothstep(0.15, 2.2, p.y);
    let col = mix(SKIN_DEEP, base, 0.35 + 0.65 * upLight * (0.4 + 0.6 * heightLight));

    // Specular-like painted highlight on upward-facing ridges (shoulders, brow, traps, forearms)
    if (n.y > 0.45 && p.y > 1.1) {
      const ridge = smoothstep(0.45, 0.88, n.y) * noise(p, 0.12, 91);
      col = mix(col, SKIN_HIGHLIGHT, ridge * 0.55);
    }

    // Belly & chest countershade (facing forward/down on torso)
    const inTorso = p.y > 0.85 && p.y < 1.85 && Math.abs(p.x) < 0.36 && p.z > -0.12;
    if (inTorso && n.z > 0.15) {
      const bellyMask =
        smoothstep(0.15, 0.65, n.z) *
        smoothstep(0.36, 0.12, Math.abs(p.x)) *
        smoothstep(0.85, 1.1, p.y) *
        smoothstep(1.85, 1.55, p.y);
      const bellyTex = mottle(BELLY_PALE, BELLY_WARM, { size: 0.12, seed: 51 }).at(p, n);
      col = mix(col, bellyTex, bellyMask * 0.78);
    }

    // Glowing-style pale cyan tribal warpaint chevrons on chest, shoulders, and thighs
    const symX = Math.abs(p.x);
    // Chest V-stripes
    const chestV1 = Math.abs(p.y - (1.42 + symX * 0.55 + 0.02 * Math.sin(symX * 25)));
    const chestV2 = Math.abs(p.y - (1.28 + symX * 0.55 + 0.02 * Math.cos(symX * 25)));
    if (p.z > 0.08 && n.z > 0.2 && symX > 0.04 && symX < 0.32 && (chestV1 < 0.022 || chestV2 < 0.018)) {
      const wMask = smoothstep(0.022, 0.006, Math.min(chestV1, chestV2));
      col = mix(col, WARPAINT_CYAN, wMask * 0.85);
    }

    // Shoulder/deltoid spiral warpaint bands
    if (symX > 0.34 && p.y > 1.35 && p.y < 1.95) {
      const wave = Math.sin(p.y * 22 + symX * 14 + p.z * 10);
      if (wave > 0.62) {
        col = mix(col, WARPAINT_OCHRE, smoothstep(0.62, 0.85, wave) * 0.8);
      }
    }

    // Swamp mud & bog grime on lower shins, feet, and knuckles
    if (p.y < 0.38) {
      const mud = smoothstep(0.38, 0.04, p.y + 0.06 * noise(p, 0.09, 73));
      col = mix(col, "#241b14", mud * 0.82);
    }

    return col;
  });

  // Head & face paint with tribal mask markings around eyes and bridge of nose
  const headSkin = paint((p, n) => {
    let col = trollSkin.at(p, n);
    const symX = Math.abs(p.x);
    // Fierce white/cyan skull-like face paint across brow, cheeks, and nose bridge
    if (p.z > 0.24 && p.y > 1.62 && p.y < 2.02) {
      const cheekDiag = Math.abs(p.y - (1.68 + symX * 0.65));
      const browArc = Math.abs(p.y - (1.88 - (symX - 0.09) * (symX - 0.09) * 3.2));
      if ((symX < 0.18 && cheekDiag < 0.024) || (symX < 0.17 && browArc < 0.02)) {
        const m = smoothstep(0.024, 0.005, Math.min(cheekDiag, browArc));
        col = mix(col, WARPAINT_CYAN, m * 0.88);
      }
      if (symX < 0.035 && p.y > 1.72 && p.y < 1.94 && n.z > 0.3) {
        col = mix(col, WARPAINT_OCHRE, smoothstep(0.035, 0.01, symX) * 0.85);
      }
    }
    return col;
  });

  // Ear paint: transitions from bog green at root to bruised purple-magenta at tips
  const earPaint = paint((p, n, s) => {
    const base = trollSkin.at(p, n);
    const tipT = smoothstep(0.25, 0.92, s[0]);
    const bruised = mix(SKIN_MID, "#63264a", tipT);
    return mix(base, bruised, tipT * 0.85);
  });

  // Tusk & Horn paint: dark stained root, grooved ivory middle, polished cream tip
  const tuskPaint = paint((p, n, s) => {
    const t = s[0];
    const rootMask = smoothstep(0.28, 0.0, t);
    const tipMask = smoothstep(0.55, 0.95, t);
    const streak = grain(BONE_MID, BONE_LIGHT, { size: 0.018, axis: "y", seed: 103 }).at(p, n);
    let col = mix(streak, TUSK_ROOT, rootMask * 0.85);
    col = mix(col, TUSK_TIP, tipMask * 0.9);
    // Subtle dark ring grooves near base
    const ringWave = Math.sin(t * 55);
    if (t < 0.38 && ringWave > 0.5) {
      col = mix(col, BONE_CHAR, (ringWave - 0.5) * (1 - t / 0.38) * 0.7);
    }
    return col;
  });

  // Weathered bone fetish paint: aged yellow-ivory with dark crevices, cracks & charred ends
  const bonePaint = paint((p, n, s) => {
    const g = grain(BONE_LIGHT, BONE_MID, { size: 0.025, axis: "y", seed: 44 }).at(p, n);
    const c = cells(p, 0.06, 61);
    const crack = smoothstep(0.08, 0.01, c.d2 - c.d1);
    const shade = smoothstep(-0.5, 0.7, n.y);
    let col = mix(BONE_DARK, g, 0.35 + 0.65 * shade);
    col = mix(col, BONE_CHAR, crack * 0.55);
    const endDark = smoothstep(0.18, 0.0, Math.min(s[0], 1 - s[0]));
    return mix(col, BONE_DARK, endDark * 0.45);
  });

  // Shrunken skull paint: grey-green desiccated hide & stained bone
  const shrunkenSkullPaint = countershade(
    mottle("#7c8564", "#475239", { size: 0.04, contrast: 1.5, seed: 88 }),
    "#323828",
    { level: -0.1, soft: 0.35 },
  );

  // Mohawk hair paint: deep plum-crimson root -> fiery orange -> bright yellow-gold tips with electric teal streaks
  const mohawkPaint = paint((p, n, s) => {
    const t = s[0];
    const streakNoise = noise(p, 0.045, 19);
    const grainVal = grain(HAIR_BASE, HAIR_MID, { size: 0.014, axis: "y", seed: 29 }).at(p, n);
    let col = mix(HAIR_ROOT, grainVal, smoothstep(0.0, 0.28, t));
    col = mix(col, HAIR_MID, smoothstep(0.22, 0.62, t));
    col = mix(col, HAIR_TIP, smoothstep(0.58, 0.92, t));
    if (streakNoise > 0.68 && t > 0.25) {
      col = mix(col, HAIR_TEAL_STREAK, smoothstep(0.68, 0.85, streakNoise) * smoothstep(0.25, 0.6, t) * 0.75);
    }
    return col;
  });

  // Wood & Totem Timber paint
  const woodPaint = countershade(
    grain(WOOD_LIGHT, WOOD_DARK, { size: 0.028, axis: "y", seed: 17 }),
    WOOD_DARK,
    { level: -0.15, soft: 0.4 },
  );

  // Swamp Moss & Lichen paint
  const mossPaint = countershade(
    mottle(MOSS_BRIGHT, MOSS_DARK, { size: 0.05, contrast: 1.6, seed: 63 }),
    MOSS_DARK,
    { level: 0.0, soft: 0.3 },
  );

  // Leather & Wraps paint
  const leatherPaint = countershade(
    mottle(LEATHER_TAN, LEATHER_MID, { size: 0.06, contrast: 1.3, seed: 71 }),
    LEATHER_DARK,
    { level: -0.1, soft: 0.35 },
  );

  // Tattered Swamp Kilt cloth paint with tribal border pattern
  const clothPaint = paint((p, n) => {
    const base = mottle(CLOTH_PURPLE, CLOTH_CRIMSON, { size: 0.09, contrast: 1.3, seed: 83 }).at(p, n);
    const shade = smoothstep(-0.4, 0.6, n.y * 0.5 + n.z * 0.5);
    let col = mix(CLOTH_TATTER, base, 0.4 + 0.6 * shade);
    // Zigzag gold/ochre tribal trim near bottom of cloth panels
    const zig = Math.abs(((p.x * 18) % 1 + 1) % 1 - 0.5) * 0.05;
    const borderDist = Math.abs(p.y - (0.58 + zig));
    if (borderDist < 0.018) {
      col = mix(col, WARPAINT_OCHRE, smoothstep(0.018, 0.005, borderDist) * 0.9);
    }
    return col;
  });

  // Hand-hammered Bronze / Gold metal paint
  const bronzePaint = paint((p, n) => {
    const cell = cells(p, 0.035, 99);
    const facet = 0.85 + 0.3 * cell.id;
    const up = smoothstep(-0.3, 0.75, n.y * 0.7 + n.z * 0.3);
    const base = mix(BRONZE_DARK, BRONZE_LIGHT, up);
    return [Math.min(1, base[0] * facet), Math.min(1, base[1] * facet), Math.min(1, base[2] * facet)];
  });

  // ============================================================================
  // SVG TEXTURES & CARDS (FEATHERS, MOSS, HAIR LOCKS, VOODOO RUNES, EYES)
  // ============================================================================
  // 1. Glowing Voodoo Rune / Hex Decal SVG
  const voodooRuneTex = svg(
    `<svg viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="52" fill="none" stroke="#26f7fd" stroke-width="5" stroke-dasharray="14 8"/>
      <polygon points="64,14 106,96 22,96" fill="none" stroke="#39ff7e" stroke-width="6"/>
      <polygon points="64,114 106,32 22,32" fill="none" stroke="#39ff7e" stroke-width="4"/>
      <circle cx="64" cy="64" r="18" fill="#11292b" stroke="#ffee38" stroke-width="5"/>
      <circle cx="64" cy="64" r="7" fill="#ffee38"/>
      <path d="M64 4 L64 24 M64 104 L64 124 M4 64 L24 64 M104 64 L124 64" stroke="#26f7fd" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // 2. Swamp Voodoo Feather Card SVG (striped teal/magenta/gold plumage)
  const featherTex = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M32 156 C28 110 10 85 12 38 C14 14 24 4 32 2 C40 4 50 14 52 38 C54 85 36 110 32 156 Z" fill="#1c5248"/>
      <path d="M32 140 C29 102 15 80 16 40 C18 18 25 8 32 5 C39 8 46 18 48 40 C49 80 35 102 32 140 Z" fill="#2be8b5"/>
      <path d="M15 55 L49 55 L47 70 L17 70 Z" fill="#9e1938"/>
      <path d="M18 82 L46 82 L44 94 L20 94 Z" fill="#ff9e22"/>
      <ellipse cx="32" cy="30" rx="11" ry="15" fill="#3b0d2c"/>
      <ellipse cx="32" cy="30" rx="6" ry="9" fill="#ffee38"/>
      <path d="M32 158 L32 6" stroke="#f2e6c9" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // 3. Hanging Swamp Moss & Bog Vine Tatter Card SVG
  const mossCardTex = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M12 4 Q20 55 14 115 Q18 140 22 154 Q28 115 26 65 Q34 105 32 148 Q40 120 42 75 Q48 118 48 156 Q56 115 56 60 Q64 100 66 142 Q74 98 72 52 Q80 88 82 128 Q88 70 84 4 Z" fill="#467d24"/>
      <path d="M18 6 Q24 50 20 98 M36 6 Q38 62 36 122 M52 6 Q52 68 50 132 M68 6 Q70 55 68 108" stroke="#6eb83b" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="26" cy="48" r="4" fill="#9be85a"/>
      <circle cx="52" cy="78" r="3.5" fill="#9be85a"/>
      <circle cx="68" cy="42" r="4" fill="#9be85a"/>
    </svg>`,
    { size: 256 },
  );

  // 4. Mohawk Spiky Hair Tuft Card SVG
  const hairCardTex = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M8 156 Q16 90 6 28 Q24 68 30 108 Q36 52 40 4 Q46 52 50 108 Q58 68 74 28 Q64 90 72 156 Z" fill="#b81d33"/>
      <path d="M16 140 Q22 88 12 36 Q28 74 32 114 Q38 60 40 12 Q44 60 48 114 Q54 74 68 36 Q58 88 64 140 Z" fill="#ff7b1c"/>
      <path d="M34 80 L40 10 L46 80 Z" fill="#ffcf33"/>
    </svg>`,
    { size: 256 },
  );

  // 5. Tribal Scar / Stitch Decal SVG
  const scarTex = svg(
    `<svg viewBox="0 0 128 64">
      <path d="M10 32 Q64 22 118 34" stroke="#4a1525" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M12 32 Q64 22 116 34" stroke="#9e4b5e" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M26 16 L22 48 M46 14 L44 46 M66 13 L66 45 M86 15 L88 47 M104 18 L106 48" stroke="#d4be94" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // 1. SKELETON: FULL CREATURE RIG (HIPS, SPINE, NECK, HEAD, JAW, EARS, ARMS, HANDS, DIGITS, LEGS, FEET, TOES)
  // ============================================================================
  // Warcraft trolls have a signature forward-hunched S-curve posture, long simian arms,
  // wide bow-legged crouch, huge two-toed feet + heel spur, and three-fingered hands.
  // Standing height ~2.35 m (including towering mohawk & totem spikes).

  const hips = b.joint("hips", { at: [0, 0.96, -0.06], dir: [0, 1, 0.12], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.96, -0.06],
      [0, 1.18, -0.08],
      [0, 1.44, -0.02],
      [0, 1.66, 0.10],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];

  // Forward-jutting muscular troll neck & head
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.66, 0.10],
      [0, 1.75, 0.22],
      [0, 1.80, 0.34],
    ]),
    {
      parent: chest,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "head",
    },
  );
  const neck1 = neck.joints[0];

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.80, 0.34],
    dir: [0, -0.06, 1],
    up: [0, 1, 0],
    role: "head",
    group: "head",
  });

  // Separate hinged lower jaw (with massive underbite & tusks)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.73, 0.36],
    dir: [0, -0.18, 1],
    up: [0, 1, 0],
    role: "jaw",
    group: "head",
  });

  // Long swept-back bat/troll ears (hinged)
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.14, 1.82, 0.34],
      dir: [s * 0.82, 0.28, -0.5],
      up: [0, 1, 0],
      role: "hinge",
      group: "head",
    });
  }

  // Hanging loincloth & fetish joints so they flex naturally
  const loinFront = b.joint("loinFront", {
    parent: hips,
    at: [0, 0.90, 0.15],
    dir: [0, -1, 0.08],
    role: "hinge",
    group: "pelvis",
  });
  const loinBack = b.joint("loinBack", {
    parent: hips,
    at: [0, 0.92, -0.23],
    dir: [0, -1, -0.08],
    role: "hinge",
    group: "pelvis",
  });

  // Limbs: Arms (clavicle -> shoulder -> elbow -> wrist + 3 fingers)
  // Legs (hip -> knee -> ankle -> foot + 2 big front toes)
  type ArmRig = {
    clavicle: ReturnType<typeof b.joint>;
    chain: ReturnType<typeof b.chain>;
    shoulder: ReturnType<typeof b.joint>;
    elbow: ReturnType<typeof b.joint>;
    wrist: ReturnType<typeof b.joint>;
    thumb: ReturnType<typeof b.chain>;
    index: ReturnType<typeof b.chain>;
    middle: ReturnType<typeof b.chain>;
  };
  type LegRig = {
    chain: ReturnType<typeof b.chain>;
    hip: ReturnType<typeof b.joint>;
    knee: ReturnType<typeof b.joint>;
    ankle: ReturnType<typeof b.joint>;
    foot: ReturnType<typeof b.joint>;
    toeInner: ReturnType<typeof b.chain>;
    toeOuter: ReturnType<typeof b.chain>;
  };

  const arms: Record<number, ArmRig> = {};
  const legs: Record<number, LegRig> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Clavicle & Arm
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.14, 1.66, 0.08],
      aim: [s * 0.38, 1.64, 0.05],
      role: "arm",
      group: `arm${side}`,
    });

    const shoulderPos: [number, number, number] = [s * 0.38, 1.64, 0.05];
    const wristPos: [number, number, number] = [s * 0.68, 0.86, 0.16];
    const armPts = limb(shoulderPos, wristPos, [0.46, 0.44], [s * 0.35, -0.1, -0.9]);
    const armChain = b.chain(`arm${side}`, armPts, {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    const [shoulder, elbow, wrist] = armChain.joints;

    // 3 Thick Troll Digits per hand (Thumb + 2 Massive Fingers, well-separated in rest pose)
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.64, 0.84, 0.22],
        [s * 0.60, 0.76, 0.30],
        [s * 0.56, 0.69, 0.35],
      ],
      {
        parent: wrist,
        names: [`thumb1${side}`, `thumb2${side}`],
        role: "digit",
        group: `hand${side}`,
      },
    );

    const index = b.chain(
      `index${side}`,
      [
        [s * 0.71, 0.81, 0.21],
        [s * 0.74, 0.70, 0.25],
        [s * 0.72, 0.60, 0.24],
      ],
      {
        parent: wrist,
        names: [`index1${side}`, `index2${side}`],
        role: "digit",
        group: `hand${side}`,
      },
    );

    const middle = b.chain(
      `middle${side}`,
      [
        [s * 0.72, 0.81, 0.11],
        [s * 0.76, 0.70, 0.11],
        [s * 0.74, 0.60, 0.09],
      ],
      {
        parent: wrist,
        names: [`middle1${side}`, `middle2${side}`],
        role: "digit",
        group: `hand${side}`,
      },
    );

    arms[s] = { clavicle, chain: armChain, shoulder, elbow, wrist, thumb, index, middle };

    // Legs: Bow-legged powerful crouch
    const hipPos: [number, number, number] = [s * 0.21, 0.92, -0.05];
    const anklePos: [number, number, number] = [s * 0.29, 0.14, -0.03];
    const legPts = limb(hipPos, anklePos, [0.46, 0.44], [s * 0.32, 0.15, 1.0]);
    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.29, 0.0, 0.06],
      group: `leg${side}`,
    });
    const [hip, knee, ankle] = legChain.joints;

    const foot = b.joint(`foot${side}`, {
      parent: ankle,
      at: [s * 0.29, 0.08, 0.02],
      dir: [s * 0.06, -0.1, 1],
      up: [0, 1, 0],
      role: "leg",
      group: `foot${side}`,
    });

    // Two characteristic massive troll toes splayed on y = 0
    const toeInner = b.chain(
      `toeIn${side}`,
      [
        [s * 0.23, 0.055, 0.14],
        [s * 0.20, 0.042, 0.24],
        [s * 0.18, 0.032, 0.33],
      ],
      {
        parent: foot,
        names: [`toeIn1${side}`, `toeIn2${side}`],
        role: "digit",
        group: `foot${side}`,
      },
    );

    const toeOuter = b.chain(
      `toeOut${side}`,
      [
        [s * 0.35, 0.055, 0.13],
        [s * 0.39, 0.042, 0.23],
        [s * 0.42, 0.032, 0.31],
      ],
      {
        parent: foot,
        names: [`toeOut1${side}`, `toeOut2${side}`],
        role: "digit",
        group: `foot${side}`,
      },
    );

    legs[s] = { chain: legChain, hip, knee, ankle, foot, toeInner, toeOuter };
  }

  // ============================================================================
  // 2. TORSO, HUNCHED BACK, PECTORALS, RIBS & DORSAL RIDGE
  // ============================================================================
  // Main torso loft: athletic V-taper from waist to broad hunched shoulders & traps
  const torsoLoft = b.loft(
    [
      { at: [0, 0.86, -0.05], w: 0.46, h: 0.36 },
      { at: [0, 1.06, -0.07], w: 0.42, h: 0.35 },
      { at: [0, 1.32, -0.04], w: 0.54, h: 0.42 },
      { at: [0, 1.56, 0.05], w: 0.68, h: 0.46 },
      { at: [0, 1.72, 0.14], w: 0.56, h: 0.38 },
      { at: [0, 1.81, 0.28], w: 0.32, h: 0.28 },
    ],
    {
      bone: [hips, spine, neck],
      color: trollSkin,
      name: "torsoLoft",
      group: "torso",
    },
  );

  // Muscular trapezius / upper back hump (classic Warcraft troll silhouette)
  b.sweep(
    catmull([
      [0, 1.36, -0.18],
      [0, 1.58, -0.14],
      [0, 1.76, 0.02],
      [0, 1.82, 0.20],
    ]),
    (t) => [0.26 * Math.sin(Math.PI * (0.15 + 0.75 * t)), 0.16 * Math.sin(Math.PI * (0.1 + 0.8 * t))],
    {
      bone: [spine, neck],
      color: trollSkin,
      name: "trapeziusHump",
      group: "torso",
    },
  );

  // Heavy pectoral slabs & sternal notch
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.04, 1.48, 0.21],
        [s * 0.17, 1.50, 0.22],
        [s * 0.31, 1.55, 0.14],
      ]),
      [0.095, 0.11, 0.075],
      {
        bone: chest,
        color: trollSkin,
        name: `pec${side}`,
        group: "torso",
      },
    );

    // Lat muscles flaring under the armpits
    b.sweep(
      catmull([
        [s * 0.20, 1.16, -0.06],
        [s * 0.29, 1.38, -0.04],
        [s * 0.36, 1.56, 0.02],
      ]),
      [0.07, 0.11, 0.08],
      {
        bone: [spine1, spine2, chest],
        color: trollSkin,
        name: `lat${side}`,
        group: "torso",
      },
    );

    // Subtle sculpted rib ridges on flanks
    for (let r = 0; r < 3; r++) {
      const ry = 1.18 + r * 0.085;
      const rz = -0.02 + r * 0.02;
      b.capsule(
        [s * 0.14, ry, rz + 0.16],
        [s * 0.25, ry + 0.03, rz - 0.02],
        [0.028, 0.022],
        trollSkin,
        { bone: spine2, group: "torso" },
      );
    }

    // Thick sternocleidomastoid neck tendons
    b.capsule(
      [s * 0.08, 1.56, 0.20],
      [s * 0.11, 1.79, 0.31],
      [0.042, 0.035],
      trollSkin,
      { bone: neck1, group: "head" },
    );
  }

  // Prominent hunched spine vertebrae & reptilian swamp-troll dorsal osteoderms
  const dorsalPath = torsoLoft.line(0, -0.01).slice(0.12, 0.88);
  b.along(dorsalPath, 9, (pt) => {
    const scale = 0.65 + 0.55 * Math.sin(pt.t * Math.PI);
    b.spike(
      pt.moved([0, -0.015, 0]),
      pt.dir([0, 0.85, -0.5]),
      0.075 * scale,
      0.032 * scale,
      bonePaint,
      { sides: 6, group: "torso" },
    );
  });

  // ============================================================================
  // 3. HEAD, FIERCE BROW, HOOKED NOSE, GLOWING EYES, JAW, MASSIVE TUSKS & EARS
  // ============================================================================
  // Cranium & upper face
  const cranium = b.loft(
    [
      { at: [0, 1.76, 0.24], w: 0.26, h: 0.24 },
      { at: [0, 1.84, 0.33], w: 0.29, h: 0.27 },
      { at: [0, 1.86, 0.44], w: 0.26, h: 0.23 },
      { at: [0, 1.82, 0.53], w: 0.19, h: 0.16 },
    ],
    {
      bone: head,
      color: headSkin,
      name: "cranium",
      group: "head",
    },
  );

  // Heavy furrowed V-shaped Warcraft brow ridge
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [0, 1.85, 0.54],
        [s * 0.07, 1.88, 0.52],
        [s * 0.14, 1.87, 0.45],
      ]),
      [0.036, 0.042, 0.028],
      {
        bone: head,
        color: headSkin,
        name: `browRidge${side}`,
        group: "head",
      },
    );

    // High sharp cheekbones
    b.sweep(
      catmull([
        [s * 0.06, 1.77, 0.53],
        [s * 0.13, 1.78, 0.47],
        [s * 0.15, 1.81, 0.38],
      ]),
      [0.032, 0.038, 0.026],
      {
        bone: head,
        color: headSkin,
        name: `cheekbone${side}`,
        group: "head",
      },
    );
  }

  // Long, hooked, bulbous Warcraft troll nose
  b.sweep(
    catmull([
      [0, 1.86, 0.51],
      [0, 1.82, 0.61],
      [0, 1.76, 0.66],
      [0, 1.72, 0.62],
    ]),
    [0.032, 0.044, 0.038, 0.018],
    {
      bone: head,
      color: headSkin,
      name: "noseHook",
      group: "head",
    },
  );
  // Flared nostrils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), headSkin, {
      bone: head,
      at: [s * 0.032, 1.76, 0.59],
      scale: [1.1, 0.85, 1.2],
      group: "head",
    });
  }

  // Gold nose septum ring through the hooked nose
  const noseRingPath = catmull(
    [
      [0.018, 1.74, 0.60],
      [0.032, 1.70, 0.62],
      [0, 1.675, 0.63],
      [-0.032, 1.70, 0.62],
      [-0.018, 1.74, 0.60],
    ],
    { closed: true },
  );
  b.sweep(noseRingPath, 0.008, {
    bone: head,
    color: bronzePaint,
    sides: 6,
    name: "noseSeptumRing",
    group: "head",
  });

  // Sunken dark eye sockets + fierce glowing golden-yellow Warcraft troll eyes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.036, 10, 8), SKIN_DEEP, {
      bone: head,
      at: [s * 0.072, 1.825, 0.485],
      scale: [1.1, 0.85, 0.8],
      name: `eyeSocket${side}`,
      group: "head",
    });

    const eyeBall = glow(
      b.part(new THREE.SphereGeometry(0.025, 10, 8), EYE_GLOW, {
        bone: head,
        at: [s * 0.072, 1.825, 0.502],
        scale: [1.05, 0.78, 0.85],
        name: `eye${side}`,
        group: "head",
      }),
      1.8,
    );

    // Fierce vertical slit pupil
    b.part(new THREE.BoxGeometry(0.007, 0.024, 0.01), "#1a0800", {
      bone: head,
      at: eyeBall.at.clone().add(new THREE.Vector3(s * 0.002, 0, 0.018)),
      group: "head",
    });
  }

  // Upper teeth / snarl row under upper lip
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const tx = s * (0.016 + i * 0.024);
      const tz = 0.55 - i * 0.016;
      b.spike(
        [tx, 1.75, tz],
        [0, -1, 0.15],
        0.028,
        0.011,
        bonePaint,
        { bone: head, sides: 5, group: "head" },
      );
    }
  }

  // Battle scar decal across left cheek & brow
  b.decal(cranium, scarTex, {
    at: [0.11, 1.80, 0.47],
    dir: [0.65, 0.1, 0.75],
    size: [0.11, 0.055],
    roll: -22,
    bone: head,
    name: "cheekScar",
    group: "head",
  });

  // Heavy prognathic lower jaw & chin beard/goatee
  b.loft(
    [
      { at: [0, 1.72, 0.35], w: 0.22, h: 0.13 },
      { at: [0, 1.69, 0.46], w: 0.23, h: 0.14 },
      { at: [0, 1.67, 0.56], w: 0.18, h: 0.12 },
      { at: [0, 1.66, 0.61], w: 0.11, h: 0.09 },
    ],
    {
      bone: jaw,
      color: headSkin,
      name: "lowerJaw",
      group: "head",
    },
  );

  // Dark mouth interior cavity
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.14), "#2b0d14", {
    bone: jaw,
    at: [0, 1.72, 0.48],
    group: "head",
  });

  // Lower jaw teeth between the giant tusks
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const tx = s * (0.018 + i * 0.024);
      const tz = 0.575 - i * 0.012;
      b.spike(
        [tx, 1.70, tz],
        [0, 1, 0.15],
        0.032,
        0.012,
        bonePaint,
        { bone: jaw, sides: 5, group: "head" },
      );
    }
  }

  // Braided chin goatee with gold clamp and hanging bone charm
  const beardPath = catmull([
    [0, 1.65, 0.59],
    [0, 1.56, 0.61],
    [0, 1.46, 0.58],
    [0, 1.38, 0.55],
  ]);
  b.sweep(beardPath, [0.042, 0.035, 0.024, 0.006], {
    bone: jaw,
    color: mohawkPaint,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "chinBeard",
    group: "head",
  });
  b.rod([0, 1.52, 0.60], [0, 1.48, 0.59], 0.032, bronzePaint, {
    bone: jaw,
    sides: 8,
    name: "beardRing",
    group: "head",
  });
  b.rod([0, 1.45, 0.575], [0, 1.42, 0.565], 0.022, bonePaint, {
    bone: jaw,
    sides: 7,
    name: "beardBoneBead",
    group: "head",
  });

  // MASSIVE SIGNATURE WARCRAFT TUSKS + SECONDARY CHEEK TUSKS + GOLD BANDS & ROPE FETISHES
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mainTuskPath = catmull([
      [s * 0.075, 1.68, 0.49],
      [s * 0.145, 1.71, 0.61],
      [s * 0.195, 1.82, 0.68],
      [s * 0.175, 1.96, 0.65],
      [s * 0.135, 2.05, 0.58],
    ]);
    const mainTusk = b.sweep(mainTuskPath, [0.046, 0.042, 0.033, 0.019, 0.0], {
      bone: jaw,
      color: tuskPaint,
      sides: 8,
      caps: { start: "round", end: "point" },
      name: `mainTusk${side}`,
      group: "head",
    });

    // Secondary smaller lower-jaw cheek tusk behind the main tusk
    const subTuskPath = catmull([
      [s * 0.095, 1.69, 0.43],
      [s * 0.165, 1.73, 0.50],
      [s * 0.195, 1.80, 0.53],
    ]);
    b.sweep(subTuskPath, [0.026, 0.018, 0.0], {
      bone: jaw,
      color: tuskPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `subTusk${side}`,
      group: "head",
    });

    // Ornate hammered bronze bands & leather cord around the tusks
    for (const ringT of [0.28, 0.52]) {
      const tp = mainTusk.at(ringT);
      const rRing = ringT < 0.4 ? 0.044 : 0.035;
      const pA = mainTuskPath.at(ringT - 0.04);
      const pB = mainTuskPath.at(ringT + 0.04);
      b.rod(pA, pB, rRing, ringT < 0.4 ? leatherPaint : bronzePaint, {
        bone: jaw,
        sides: 8,
        name: `tuskBand${side}_${Math.round(ringT * 100)}`,
        group: "head",
      });

      // Dangling bone charm + glowing voodoo bead hanging from left tusk band
      if (s > 0 && ringT > 0.45) {
        const hangStart = tp.at.clone().add(new THREE.Vector3(0.02, -0.03, 0));
        const hangMid = hangStart.clone().add(new THREE.Vector3(0.01, -0.06, 0.01));
        const hangEnd = hangStart.clone().add(new THREE.Vector3(0.01, -0.13, 0.01));
        b.rod(tp.at, hangMid, 0.006, ROPE_HEMP, { bone: jaw, sides: 5, group: "head" });
        glow(
          b.part(new THREE.SphereGeometry(0.018, 8, 6), VOODOO_GREEN, {
            bone: jaw,
            at: hangMid,
            name: "tuskVoodooBead",
            group: "head",
          }),
          1.6,
        );
        b.spike(hangMid, hangEnd, null, 0.015, bonePaint, {
          bone: jaw,
          sides: 6,
          name: "tuskFangCharm",
          group: "head",
        });
      }
    }
  }

  // LONG SWEPT-BACK TROLL EARS WITH NOTCHES, EARRINGS & BONE PIERCINGS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[s];
    const earUpper = catmull([
      [s * 0.13, 1.84, 0.36],
      [s * 0.28, 1.91, 0.25],
      [s * 0.44, 1.97, 0.11],
      [s * 0.56, 2.02, -0.02],
    ]);
    const earLower = catmull([
      [s * 0.13, 1.77, 0.34],
      [s * 0.26, 1.81, 0.22],
      [s * 0.41, 1.89, 0.09],
      [s * 0.56, 2.02, -0.02],
    ]);

    // Upper ear cartilage ridge
    b.sweep(earUpper, [0.024, 0.020, 0.014, 0.004], {
      bone: earJ,
      color: earPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `earRidgeTop${side}`,
      group: "head",
    });
    // Lower ear lobe ridge
    b.sweep(earLower, [0.022, 0.018, 0.012, 0.004], {
      bone: earJ,
      color: earPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `earRidgeBot${side}`,
      group: "head",
    });
    // Webbed ear pinna membrane between upper and lower cartilage
    b.membrane(earUpper, earLower, {
      bone: earJ,
      color: earPaint,
      thickness: 0.012,
      scallop: 0.08,
      name: `earWeb${side}`,
      group: "head",
    });

    // Gold hoop earrings & bone spikes pierced through the ear lobes
    for (let k = 0; k < 2; k++) {
      const ep = earLower.at(0.32 + k * 0.28);
      b.part(new THREE.TorusGeometry(0.024 - k * 0.004, 0.006, 6, 10), bronzePaint, {
        bone: earJ,
        at: ep.clone().add(new THREE.Vector3(0, -0.018, 0)),
        rotation: [0, s * 35, 0],
        name: `earRing${side}_${k}`,
        group: "head",
      });
    }
    // Bone needle piercing through upper cartilage
    const piercePt = earUpper.at(0.55);
    b.spike(
      piercePt.clone().add(new THREE.Vector3(0, -0.03, 0)),
      [s * 0.2, 1, -0.2],
      0.075,
      0.009,
      bonePaint,
      { bone: earJ, sides: 5, name: `earBonePin${side}`, group: "head" },
    );
  }

  // Slightly open the jaw for a fierce Warcraft battle snarl
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ============================================================================
  // 4. TOWERING WARCRAFT MOHAWK, BONE HAIR-PINS, FEATHERS & BRAIDED DREADLOCKS
  // ============================================================================
  // Central sculpted mohawk crest base along skull & upper neck
  const mohawkBaseCurve = catmull([
    [0, 1.89, 0.49],
    [0, 1.96, 0.39],
    [0, 1.94, 0.26],
    [0, 1.85, 0.15],
    [0, 1.74, 0.06],
  ]);
  b.sweep(mohawkBaseCurve, (t) => [0.045 * Math.sin(Math.PI * (0.1 + 0.8 * t)), 0.06], {
    bone: [head, neck],
    color: HAIR_ROOT,
    name: "mohawkRoot",
    group: "mohawk",
  });

  // 9 Towering, sweeping fan-like mohawk spikes (Blizzard silhouette hero feature)
  const mohawkSpecs: Array<{
    root: [number, number, number];
    mid: [number, number, number];
    tip: [number, number, number];
    r0: [number, number];
    r1: [number, number];
    hasBand?: boolean;
  }> = [
    { root: [0, 1.88, 0.49], mid: [0, 2.04, 0.55], tip: [0, 2.18, 0.59], r0: [0.034, 0.055], r1: [0.022, 0.04] },
    { root: [0, 1.92, 0.44], mid: [0, 2.13, 0.47], tip: [0, 2.31, 0.47], r0: [0.040, 0.065], r1: [0.026, 0.048], hasBand: true },
    { root: [0, 1.95, 0.38], mid: [0, 2.19, 0.36], tip: [0, 2.38, 0.31], r0: [0.044, 0.072], r1: [0.028, 0.052] },
    { root: [0, 1.95, 0.32], mid: [0, 2.18, 0.24], tip: [0, 2.36, 0.14], r0: [0.044, 0.072], r1: [0.028, 0.050], hasBand: true },
    { root: [0, 1.92, 0.26], mid: [0, 2.13, 0.13], tip: [0, 2.29, -0.02], r0: [0.040, 0.065], r1: [0.025, 0.045] },
    { root: [0, 1.88, 0.20], mid: [0, 2.05, 0.04], tip: [0, 2.18, -0.14], r0: [0.036, 0.058], r1: [0.022, 0.038], hasBand: true },
    { root: [0, 1.82, 0.14], mid: [0, 1.95, -0.03], tip: [0, 2.05, -0.22], r0: [0.032, 0.050], r1: [0.018, 0.032] },
    { root: [0, 1.76, 0.09], mid: [0, 1.85, -0.08], tip: [0, 1.91, -0.25], r0: [0.028, 0.044], r1: [0.015, 0.026] },
  ];

  const mohawkCardFrames: ReturnType<typeof frame>[] = [];
  mohawkSpecs.forEach((spec, idx) => {
    const curve = catmull([spec.root, spec.mid, spec.tip]);
    const ownerBone = idx < 6 ? head : neck1;
    b.sweep(
      curve,
      (t) => [
        lerp([spec.r0[0], 0, 0], [spec.r1[0], 0, 0], t).x * (1 - Math.pow(t, 2.2)),
        lerp([spec.r0[1], 0, 0], [spec.r1[1], 0, 0], t).x * (1 - Math.pow(t, 2.2)),
      ],
      {
        bone: ownerBone,
        color: mohawkPaint,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `mohawkSpike_${idx}`,
        group: "mohawk",
      },
    );

    // Side lock flares to give the mohawk thick layered volume from front view
    for (const s of [1, -1]) {
      const sideCurve = catmull([
        [s * 0.022, spec.root[1] - 0.01, spec.root[2]],
        [s * (0.045 + (idx % 2) * 0.012), spec.mid[1] - 0.03, spec.mid[2]],
        [s * 0.025, spec.tip[1] - 0.04, spec.tip[2]],
      ]);
      b.sweep(sideCurve, [spec.r0[0] * 0.65, spec.r1[0] * 0.45, 0], {
        bone: ownerBone,
        color: mohawkPaint,
        sides: 5,
        caps: { start: "round", end: "point" },
        group: "mohawk",
      });
    }

    // Gold/bone hair clamps & long bone needles skewering the mohawk
    if (spec.hasBand) {
      const pBandA = curve.at(0.28);
      const pBandB = curve.at(0.38);
      b.rod(pBandA, pBandB, spec.r0[1] * 0.82, bronzePaint, {
        bone: ownerBone,
        sides: 8,
        name: `mohawkBand_${idx}`,
        group: "mohawk",
      });

      // Skewered bone hairpin through the mohawk lock
      const pinCenter = curve.at(0.33);
      b.sweep(
        catmull([
          [pinCenter.x - 0.14, pinCenter.y - 0.01, pinCenter.z - 0.01],
          [pinCenter.x, pinCenter.y + 0.01, pinCenter.z],
          [pinCenter.x + 0.14, pinCenter.y - 0.01, pinCenter.z - 0.01],
        ]),
        [0.003, 0.014, 0.003],
        {
          bone: ownerBone,
          color: bonePaint,
          sides: 6,
          caps: "point",
          name: `mohawkBonePin_${idx}`,
          group: "mohawk",
        },
      );
    }

    // Collect frames for layered fiery hair tuft cards along the mohawk
    const tang = curve.tangentAt(0.45);
    mohawkCardFrames.push(frame(curve.at(0.35), tang, [0, 0, 1]));
  });

  b.cards(mohawkCardFrames, hairCardTex, {
    size: [0.13, 0.22],
    lean: 15,
    flow: [0, 0.4, -1],
    cross: true,
    vary: 0.2,
    rng: rng(401),
    bone: head,
    name: "mohawkTuftCards",
    group: "mohawk",
  });

  // Braided side-dreadlocks hanging past temples with bone & glowing voodoo beads
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let d = 0; d < 2; d++) {
      const zOff = 0.34 - d * 0.09;
      const dreadPath = catmull([
        [s * 0.11, 1.86, zOff],
        [s * 0.19, 1.74, zOff + 0.02],
        [s * 0.21, 1.56, zOff + 0.05],
        [s * 0.18, 1.41 - d * 0.05, zOff + 0.07],
      ]);
      b.sweep(dreadPath, [0.024, 0.020, 0.016, 0.005], {
        bone: head,
        color: mohawkPaint,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `dreadlock${side}_${d}`,
        group: "mohawk",
      });

      const beadPt = dreadPath.at(0.65);
      b.part(new THREE.CylinderGeometry(0.020, 0.020, 0.028, 7), d === 0 ? bronzePaint : bonePaint, {
        bone: head,
        at: beadPt,
        dir: dreadPath.tangentAt(0.65),
        group: "mohawk",
      });
    }
  }

  // ============================================================================
  // 5. TOTEM SHOULDER RACKS, HORNED ANIMAL SKULL PAULDRONS, BONE CHIMES & VOODOO LANTERN
  // ============================================================================
  // Heavy crossed leather & hemp harness straps across torso holding the shoulder totems
  const chestSkin = b.surface(torsoLoft);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const baldricLoop = catmull(
      [
        [s * 0.32, 1.66, 0.08],
        [0, 1.38, 0.24],
        [-s * 0.24, 1.05, 0.16],
        [-s * 0.24, 1.06, -0.20],
        [0, 1.40, -0.24],
        [s * 0.32, 1.66, -0.10],
      ],
      { closed: true },
    );
    const drapedBaldric = chestSkin.drape(baldricLoop, { lift: 0.012 });
    b.sweep(drapedBaldric, [0.022, 0.011], {
      bone: [hips, spine],
      color: leatherPaint,
      sides: 6,
      name: `baldricStrap${side}`,
      group: "fetishes",
    });
  }

  // Central Voodoo Skull Emblem / Fetish Medallion at the chest strap crossing
  const chestEmblemPos: [number, number, number] = [0, 1.38, 0.245];
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 10), bronzePaint, {
    bone: chest,
    at: chestEmblemPos,
    dir: [0, 0.1, 1],
    name: "chestMedallionRim",
    group: "fetishes",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.068, 12), "#ffffff", {
      bone: chest,
      at: [0, 1.38, 0.26],
      dir: [0, 0.1, 1],
      axis: "z",
      texture: voodooRuneTex,
      name: "chestVoodooRune",
      group: "fetishes",
    }),
    1.5,
  );
  // 4 Bone fangs radiating from the chest medallion
  for (const [fx, fy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    b.spike(
      [fx * 0.045, 1.38 + fy * 0.045, 0.245],
      [fx * 0.7, fy * 0.7, 0.3],
      0.065,
      0.014,
      bonePaint,
      { bone: chest, sides: 5, group: "fetishes" },
    );
  }

  // Necklace of alternating beast fangs, bone vertebrae & glowing voodoo beads around neck
  const neckLoop = catmull([
    [-0.18, 1.66, 0.06],
    [-0.15, 1.56, 0.22],
    [0, 1.51, 0.27],
    [0.15, 1.56, 0.22],
    [0.18, 1.66, 0.06],
  ]);
  b.sweep(neckLoop, 0.010, {
    bone: chest,
    color: ROPE_HEMP,
    sides: 6,
    name: "necklaceCord",
    group: "fetishes",
  });
  b.along(neckLoop, 9, (pt, i) => {
    const fangLen = 0.065 + (4 - Math.abs(i - 4)) * 0.014;
    const outDir: [number, number, number] = [pt.at.x * 1.4, -0.85, 0.65];
    b.spike(pt.at, outDir, fangLen, 0.015, bonePaint, {
      bone: chest,
      sides: 5,
      name: `necklaceFang_${i}`,
      group: "fetishes",
    });
    if (i % 2 === 1) {
      glow(
        b.part(new THREE.SphereGeometry(0.016, 7, 5), VOODOO_CYAN, {
          bone: chest,
          at: pt.at.clone().add(new THREE.Vector3(0, 0.008, 0.012)),
          name: `necklaceBead_${i}`,
          group: "fetishes",
        }),
        1.5,
      );
    }
  });

  // SHOULDER TOTEM RACKS & HORNED SWAMP-BEAST SKULL PAULDRONS
  const featherFrames: ReturnType<typeof frame>[] = [];
  const mossFrames: ReturnType<typeof frame>[] = [];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shBone = arms[s].clavicle;

    // Horned Swamp-Crocodile / Beast Skull Pauldron on each shoulder
    const skullCenter: [number, number, number] = [s * 0.40, 1.69, 0.05];
    b.loft(
      [
        { at: [s * 0.33, 1.72, 0.05], w: 0.20, h: 0.14 },
        { at: [s * 0.42, 1.70, 0.05], w: 0.22, h: 0.15 },
        { at: [s * 0.51, 1.65, 0.06], w: 0.14, h: 0.10 },
      ],
      {
        bone: shBone,
        color: bonePaint,
        name: `pauldronSkull${side}`,
        group: `arm${side}`,
      },
    );

    // Glowing eye sockets inside the shoulder beast skull
    for (const zEye of [-0.045, 0.135]) {
      b.part(new THREE.SphereGeometry(0.025, 8, 6), BONE_CHAR, {
        bone: shBone,
        at: [s * 0.44, 1.71, zEye],
        group: `arm${side}`,
      });
      glow(
        b.part(new THREE.SphereGeometry(0.017, 7, 5), VOODOO_GREEN, {
          bone: shBone,
          at: [s * 0.45, 1.71, zEye + (zEye > 0 ? 0.008 : -0.008)],
          name: `pauldronEyeGlow${side}_${zEye > 0 ? "F" : "B"}`,
          group: `arm${side}`,
        }),
        1.6,
      );
    }

    // Sweeping curved beast horns sprouting from the shoulder skull pauldron
    for (const zDir of [1, -1]) {
      const hornCurve = catmull([
        [s * 0.39, 1.73, 0.05 + zDir * 0.06],
        [s * 0.52, 1.81, 0.05 + zDir * 0.14],
        [s * 0.59, 1.94, 0.05 + zDir * 0.10],
        [s * 0.54, 2.04, 0.05 + zDir * 0.03],
      ]);
      b.sweep(hornCurve, [0.034, 0.026, 0.015, 0.0], {
        bone: shBone,
        color: tuskPaint,
        sides: 7,
        caps: { start: "round", end: "point" },
        name: `pauldronHorn${side}_${zDir > 0 ? "F" : "B"}`,
        group: `arm${side}`,
      });
    }

    // Cushion of swamp moss under the shoulder skull
    b.sweep(
      catmull([
        [s * 0.32, 1.65, 0.15],
        [s * 0.46, 1.63, 0.05],
        [s * 0.32, 1.65, -0.06],
      ]),
      [0.035, 0.048, 0.035],
      {
        bone: shBone,
        color: mossPaint,
        sides: 7,
        name: `pauldronMoss${side}`,
        group: `arm${side}`,
      },
    );

    // Tall Bamboo / Driftwood Fetish Totem Pole rising behind each shoulder blade
    const poleBase: [number, number, number] = [s * 0.25, 1.56, -0.14];
    const poleMid: [number, number, number] = [s * 0.33, 1.88, -0.20];
    const poleTop: [number, number, number] = [s * 0.38, 2.22, -0.24];
    const polePath = catmull([poleBase, poleMid, poleTop]);
    b.sweep(polePath, [0.034, 0.028, 0.020], {
      bone: chest,
      color: woodPaint,
      sides: 7,
      caps: "flat",
      name: `totemPole${side}`,
      group: "fetishes",
    });

    // Horizontal crossbar lashed to the totem pole
    const crossA: [number, number, number] = [s * 0.19, 2.06, -0.22];
    const crossB: [number, number, number] = [s * 0.52, 2.11, -0.23];
    b.rod(crossA, crossB, 0.020, woodPaint, {
      bone: chest,
      sides: 6,
      name: `totemCrossbar${side}`,
      group: "fetishes",
    });

    // Rope lashings at the crossbar intersection
    const crossJoin: [number, number, number] = [s * 0.36, 2.085, -0.225];
    b.part(new THREE.SphereGeometry(0.034, 8, 6), ROPE_HEMP, {
      bone: chest,
      at: crossJoin,
      scale: [1.1, 0.9, 1.1],
      name: `totemLashing${side}`,
      group: "fetishes",
    });

    // Impaled bird/imp fetish skull atop each totem pole + glowing runes
    b.part(new THREE.SphereGeometry(0.048, 9, 7), bonePaint, {
      bone: chest,
      at: poleTop,
      scale: [0.9, 1.1, 1.15],
      name: `totemTopSkull${side}`,
      group: "fetishes",
    });
    b.spike(
      [poleTop[0], poleTop[1] - 0.01, poleTop[2] + 0.03],
      [s * 0.15, -0.25, 1],
      0.075,
      0.024,
      bonePaint,
      { bone: chest, sides: 5, name: `totemTopBeak${side}`, group: "fetishes" },
    );
    for (const es of [1, -1]) {
      glow(
        b.part(new THREE.SphereGeometry(0.012, 6, 5), VOODOO_CYAN, {
          bone: chest,
          at: [poleTop[0] + es * 0.022, poleTop[1] + 0.008, poleTop[2] + 0.038],
          group: "fetishes",
        }),
        1.7,
      );
    }

    // Hanging bone wind-chimes & voodoo charms suspended from the totem crossbars
    for (let c = 0; c < 3; c++) {
      const frac = 0.18 + c * 0.34;
      const hangTop = lerp(crossA, crossB, frac);
      const chimeLen = 0.11 + (c % 2) * 0.045;
      const chimeBot: [number, number, number] = [hangTop.x, hangTop.y - 0.06, hangTop.z];
      const boneEnd: [number, number, number] = [hangTop.x, hangTop.y - 0.06 - chimeLen, hangTop.z];
      b.rod(hangTop, chimeBot, 0.005, ROPE_HEMP, { bone: chest, sides: 5, group: "fetishes" });
      b.capsule(chimeBot, boneEnd, [0.014, 0.011], bonePaint, {
        bone: chest,
        sides: 6,
        name: `totemBoneChime${side}_${c}`,
        group: "fetishes",
      });
    }

    // Plume of vibrant voodoo feathers & hanging swamp moss on the totem poles and pauldrons
    featherFrames.push(
      frame([poleTop[0], poleTop[1] + 0.03, poleTop[2]], [s * 0.35, 1, -0.2], [0, 0, 1]),
      frame([crossB[0], crossB[1] + 0.01, crossB[2]], [s * 0.8, 0.6, -0.2], [0, 0, 1]),
      frame([skullCenter[0], skullCenter[1] + 0.05, skullCenter[2] - 0.04], [s * 0.5, 0.85, -0.4], [0, 0, 1]),
    );
    mossFrames.push(
      frame([crossA[0], crossA[1] - 0.01, crossA[2]], [0, 1, 0]),
      frame([skullCenter[0] + s * 0.05, skullCenter[1] - 0.04, skullCenter[2]], [0, 1, 0]),
    );
  }

  // Render the feather plumes and hanging moss cards
  b.cards(featherFrames, featherTex, {
    size: [0.09, 0.24],
    lean: 12,
    flow: [0, 0.2, -1],
    cross: true,
    vary: 0.18,
    rng: rng(502),
    bone: chest,
    name: "totemFeatherPlumes",
    group: "fetishes",
  });

  b.cards(mossFrames, mossCardTex, {
    size: [0.11, 0.22],
    lean: 180,
    flow: [0, 0, 1],
    cross: true,
    vary: 0.22,
    rng: rng(603),
    bone: chest,
    name: "hangingSwampMoss",
    group: "fetishes",
  });

  // ============================================================================
  // 6. POWERFUL ARMS, FOREARM BRACERS, BONE SPLINTS, HANDS, CLAWS & VOODOO FETISH STAFF/TOTEM CHARMS
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain: armChain, shoulder, elbow, wrist, thumb, index, middle } = arms[s];

    // Upper & lower arm muscular sweep (oversized Warcraft forearms!)
    const armSweep = b.sweep(
      armChain,
      (t) => {
        if (t < 0.45) return 0.095 + 0.022 * Math.sin((t / 0.45) * Math.PI); // Bicep/deltoid
        const u = (t - 0.45) / 0.55;
        return 0.082 + 0.038 * Math.sin(u * Math.PI * 0.85); // Chunky heroic forearm
      },
      {
        color: trollSkin,
        name: `armTube${side}`,
        group: `arm${side}`,
      },
    );

    // Prominent bony elbow spur
    const elbowPt = armSweep.at(0.48, 0);
    b.spike(
      elbowPt.moved([0, -0.01, 0]),
      [s * 0.4, -0.2, -1],
      0.065,
      0.026,
      bonePaint,
      { bone: elbow, sides: 6, name: `elbowSpur${side}`, group: `arm${side}` },
    );

    // Forearm leather wraps & strapped bone splints
    for (let w = 0; w < 4; w++) {
      const wt0 = 0.62 + w * 0.075;
      const wt1 = wt0 + 0.055;
      b.sweep(armChain.path, 0.112 - w * 0.004, {
        from: wt0,
        to: wt1,
        bone: elbow,
        color: w % 2 === 0 ? leatherPaint : ROPE_HEMP,
        sides: 8,
        caps: "flat",
        name: `forearmWrap${side}_${w}`,
        group: `arm${side}`,
      });
    }

    // Two lashed bone plates on outer forearm bracer + glowing voodoo gem
    for (const zOff of [-0.04, 0.04]) {
      const bStart = lerp(elbow.at, wrist.at, 0.35).add(new THREE.Vector3(s * 0.085, 0, zOff));
      const bEnd = lerp(elbow.at, wrist.at, 0.82).add(new THREE.Vector3(s * 0.095, 0, zOff * 0.85));
      b.capsule(bStart, bEnd, [0.022, 0.018], bonePaint, {
        bone: elbow,
        sides: 6,
        name: `bracerBoneSplint${side}_${zOff > 0 ? "F" : "B"}`,
        group: `arm${side}`,
      });
    }
    const bracerGemPos = lerp(elbow.at, wrist.at, 0.58).add(new THREE.Vector3(s * 0.105, 0.01, 0));
    b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.016, 8), bronzePaint, {
      bone: elbow,
      at: bracerGemPos,
      dir: [s, 0.1, 0],
      group: `arm${side}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.020, 8, 6), s > 0 ? VOODOO_GREEN : VOODOO_CYAN, {
        bone: elbow,
        at: bracerGemPos.clone().add(new THREE.Vector3(s * 0.008, 0, 0)),
        name: `bracerVoodooGem${side}`,
        group: `arm${side}`,
      }),
      1.6,
    );

    // Chunky Troll Palm / Metacarpals
    b.frustumBox(
      wrist.at,
      [s * 0.70, 0.79, 0.16],
      [0.11, 0.14],
      [0.09, 0.12],
      {
        bone: wrist,
        color: trollSkin,
        name: `palm${side}`,
        group: `hand${side}`,
      },
    );

    // 3 Thick Three-Fingered Troll Digits + Wicked Dark Claws
    for (const [dName, dChain, rBase] of [
      ["thumb", thumb, 0.034],
      ["index", index, 0.038],
      ["middle", middle, 0.038],
    ] as const) {
      b.sweep(dChain, [rBase, rBase * 0.86, rBase * 0.68], {
        color: trollSkin,
        sides: 7,
        name: `${dName}Tube${side}`,
        group: `hand${side}`,
      });

      // Curved bone/keratin claw at tip of each digit
      const tipPt = dChain.at(1);
      const clawDir = tipPt.tangent.clone().add(new THREE.Vector3(-s * 0.25, -0.35, 0.2)).normalize();
      b.spike(
        tipPt.at,
        clawDir,
        0.055,
        rBase * 0.62,
        tuskPaint,
        {
          bone: dChain.joints[dChain.joints.length - 1],
          sides: 6,
          name: `${dName}Claw${side}`,
          group: `hand${side}`,
        },
      );
    }

    // Knuckle warts/calluses on back of hand
    for (let k = 0; k < 2; k++) {
      b.part(new THREE.SphereGeometry(0.022, 7, 5), WART_GREEN, {
        bone: wrist,
        at: [s * 0.72, 0.82, 0.12 + k * 0.07],
        group: `hand${side}`,
      });
    }
  }

  // ============================================================================
  // 7. WAIST BELT, SHRUNKEN HEAD TROPHIES, BONE RIBCAGE APRON, POTION GOURD & SWAMP KILT
  // ============================================================================
  // Heavy thick braided leather & bone-studded war belt around pelvis
  const waistLoop = chestSkin.loop([0, 0.95, -0.05], { dir: [0, 1, 0.08], lift: 0.018 });
  b.sweep(waistLoop, [0.038, 0.052], {
    bone: hips,
    color: leatherPaint,
    sides: 8,
    name: "waistWarBelt",
    group: "pelvis",
  });

  // Upper & lower hemp cord trim on the belt
  b.sweep(chestSkin.loop([0, 0.99, -0.05], { dir: [0, 1, 0.08], lift: 0.022 }), 0.012, {
    bone: hips,
    color: ROPE_HEMP,
    sides: 6,
    name: "beltRopeTop",
    group: "pelvis",
  });
  b.sweep(chestSkin.loop([0, 0.91, -0.05], { dir: [0, 1, 0.08], lift: 0.022 }), 0.012, {
    bone: hips,
    color: ROPE_HEMP,
    sides: 6,
    name: "beltRopeBot",
    group: "pelvis",
  });

  // Center Belt Buckle: Horned Voodoo Mask Skull with glowing emerald eyes & jaw fangs
  const bucklePos: [number, number, number] = [0, 0.95, 0.175];
  b.loft(
    [
      { at: [0, 1.02, 0.17], w: 0.16, h: 0.13 },
      { at: [0, 0.95, 0.19], w: 0.18, h: 0.15 },
      { at: [0, 0.88, 0.17], w: 0.11, h: 0.10 },
    ],
    {
      bone: hips,
      color: bonePaint,
      name: "beltSkullBuckle",
      group: "pelvis",
    },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.024, 8, 6), BONE_CHAR, {
      bone: hips,
      at: [s * 0.042, 0.97, 0.235],
      group: "pelvis",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.016, 7, 5), VOODOO_GREEN, {
        bone: hips,
        at: [s * 0.042, 0.97, 0.246],
        name: `buckleEyeGlow${side}`,
        group: "pelvis",
      }),
      1.8,
    );
    // Buckle curved horns
    b.sweep(
      catmull([
        [s * 0.06, 0.99, 0.19],
        [s * 0.13, 1.04, 0.21],
        [s * 0.16, 1.11, 0.18],
      ]),
      [0.022, 0.014, 0.0],
      {
        bone: hips,
        color: tuskPaint,
        sides: 6,
        caps: "point",
        name: `buckleHorn${side}`,
        group: "pelvis",
      },
    );
  }

  // Front Loincloth Apron: Tattered Purple/Crimson Cloth + Rib-Bone Armour Ladder
  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.15, -0.24],
      [0.09, -0.44, "sharp"],
      [0, -0.38, "sharp"],
      [-0.09, -0.44, "sharp"],
      [-0.15, -0.24],
    ],
    {
      at: [0, 0.91, 0.17],
      x: [1, 0, 0],
      y: [0, 1, 0.08],
      thickness: [0.014, 0.026],
      bevel: 0.005,
      smoothing: 1,
      bone: loinFront,
      color: clothPaint,
      name: "loinclothFront",
      group: "pelvis",
    },
  );

  // Horizontal curved rib-bones sewn onto the front loincloth apron
  for (let r = 0; r < 4; r++) {
    const ry = 0.84 - r * 0.082;
    const rw = 0.115 - r * 0.01;
    const rz = 0.19 - r * 0.006;
    b.sweep(
      catmull([
        [-rw, ry, rz - 0.01],
        [0, ry - 0.015, rz + 0.02],
        [rw, ry, rz - 0.01],
      ]),
      [0.012, 0.018, 0.012],
      {
        bone: loinFront,
        color: bonePaint,
        sides: 6,
        name: `apronRibBone_${r}`,
        group: "pelvis",
      },
    );
  }

  // Rear Loincloth Flap + Bone Tail-Fetish Spine
  b.extrude(
    [
      [-0.14, 0],
      [0.14, 0],
      [0.17, -0.26],
      [0, -0.44, "sharp"],
      [-0.17, -0.26],
    ],
    {
      at: [0, 0.91, -0.24],
      x: [1, 0, 0],
      y: [0, 1, -0.08],
      thickness: [0.014, 0.024],
      bevel: 0.005,
      smoothing: 1,
      bone: loinBack,
      color: clothPaint,
      name: "loinclothBack",
      group: "pelvis",
    },
  );

  // SHRUNKEN TROLL/HUMAN HEAD FETISHES & GLOWING SWAMP VIALS HANGING FROM HIPS
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipMount: [number, number, number] = [s * 0.23, 0.92, 0.08];
    const skullPos: [number, number, number] = [s * 0.27, 0.77, 0.10];

    // Hanging hemp rope from belt to shrunken head
    b.rod(hipMount, [skullPos[0], skullPos[1] + 0.07, skullPos[2]], 0.010, ROPE_HEMP, {
      bone: hips,
      sides: 6,
      group: "fetishes",
    });

    // Shrunken head cranium & stitched mouth
    b.loft(
      [
        { at: [skullPos[0], skullPos[1] + 0.055, skullPos[2]], w: 0.11, h: 0.11 },
        { at: [skullPos[0], skullPos[1], skullPos[2] + 0.01], w: 0.12, h: 0.12 },
        { at: [skullPos[0], skullPos[1] - 0.055, skullPos[2] + 0.015], w: 0.08, h: 0.09 },
      ],
      {
        bone: hips,
        color: s > 0 ? shrunkenSkullPaint : bonePaint,
        name: `beltShrunkenHead${side}`,
        group: "fetishes",
      },
    );

    // Top-knot of hair tying the shrunken head
    b.spike(
      [skullPos[0], skullPos[1] + 0.05, skullPos[2]],
      [s * 0.2, 1, -0.1],
      0.095,
      0.028,
      mohawkPaint,
      { bone: hips, sides: 6, name: `shrunkenHeadTopknot${side}`, group: "fetishes" },
    );

    // Glowing eye sockets on the belt skulls
    for (const es of [1, -1]) {
      glow(
        b.part(
          new THREE.SphereGeometry(0.015, 7, 5),
          s > 0 ? VOODOO_CYAN : AMBER_GLOW,
          {
            bone: hips,
            at: [
              skullPos[0] + s * 0.035 + es * 0.012,
              skullPos[1] + 0.01,
              skullPos[2] + 0.048 + es * 0.018,
            ],
            name: `beltSkullEye${side}_${es > 0 ? "1" : "2"}`,
            group: "fetishes",
          },
        ),
        1.7,
      );
    }

    // Mini tusks on the left shrunken troll head
    if (s > 0) {
      for (const ts of [1, -1]) {
        b.spike(
          [skullPos[0] + 0.03, skullPos[1] - 0.03, skullPos[2] + 0.04 + ts * 0.022],
          [0.5, 0.7, 0.5],
          0.055,
          0.011,
          tuskPaint,
          { bone: hips, sides: 5, group: "fetishes" },
        );
      }
    }

    // Rear Hip Fetish: Glowing Swamp-Brew Gourd Bottle (Left) & Crossed Femur Bone Bundle (Right)
    const rearHipPos: [number, number, number] = [s * 0.22, 0.84, -0.17];
    if (s > 0) {
      // Lathed Voodoo Potion Gourd with glowing green belly window & wooden cork
      b.lathe(
        [
          [0, 0],
          [0.058, 0.01],
          [0.072, 0.05],
          [0.042, 0.10],
          [0.052, 0.14],
          [0.024, 0.18],
          [0.028, 0.20],
          [0, 0.20],
        ],
        {
          at: [rearHipPos[0], rearHipPos[1] - 0.10, rearHipPos[2]],
          axis: [0.2, 1, -0.15],
          segments: 10,
          smoothing: 1,
          bone: hips,
          color: leatherPaint,
          name: "voodooGourd",
          group: "fetishes",
        },
      );
      glow(
        b.part(new THREE.SphereGeometry(0.052, 8, 6), VOODOO_GREEN, {
          bone: hips,
          at: [rearHipPos[0] + 0.018, rearHipPos[1] - 0.05, rearHipPos[2] - 0.02],
          name: "gourdBrewGlow",
          group: "fetishes",
        }),
        1.5,
      );
    } else {
      // Bundle of 3 lashed femur bones & voodoo doll charm on right rear hip
      for (let bIdx = 0; bIdx < 3; bIdx++) {
        const ang = (bIdx - 1) * 0.28;
        const p1: [number, number, number] = [
          rearHipPos[0] - 0.03 + Math.sin(ang) * 0.04,
          rearHipPos[1] + 0.08,
          rearHipPos[2] + Math.cos(ang) * 0.03,
        ];
        const p2: [number, number, number] = [
          rearHipPos[0] - 0.03 - Math.sin(ang) * 0.04,
          rearHipPos[1] - 0.12,
          rearHipPos[2] - Math.cos(ang) * 0.03,
        ];
        b.capsule(p1, p2, [0.018, 0.016], bonePaint, {
          bone: hips,
          sides: 6,
          name: `hipBoneBundle_${bIdx}`,
          group: "fetishes",
        });
        b.part(new THREE.SphereGeometry(0.024, 6, 5), bonePaint, { bone: hips, at: p1, group: "fetishes" });
        b.part(new THREE.SphereGeometry(0.024, 6, 5), bonePaint, { bone: hips, at: p2, group: "fetishes" });
      }
      b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.035, 8), ROPE_HEMP, {
        bone: hips,
        at: [rearHipPos[0] - 0.03, rearHipPos[1] - 0.02, rearHipPos[2]],
        dir: [0.1, 1, 0],
        group: "fetishes",
      });
    }
  }

  // ============================================================================
  // 8. POWERFUL BOW-LEGGED LEGS, SKULL KNEEGUARDS, ANKLE SHACKLES & MASSIVE TWO-TOED FEET
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain: legChain, knee, ankle, foot, toeInner, toeOuter } = legs[s];

    // Muscular thigh & calf sweep
    b.sweep(
      legChain,
      (t) => {
        if (t < 0.48) {
          const u = t / 0.48;
          return 0.135 - 0.03 * u + 0.025 * Math.sin(u * Math.PI); // Thick thigh
        }
        const u = (t - 0.48) / 0.52;
        return 0.095 + 0.025 * Math.sin(u * Math.PI * 0.8) - 0.02 * u; // Muscular calf to ankle
      },
      {
        color: trollSkin,
        name: `legTube${side}`,
        group: `leg${side}`,
      },
    );

    // Horned Swamp-Snapper Skull Kneeguard strapped to each knee
    const kneePos = knee.at;
    b.loft(
      [
        { at: [kneePos.x, kneePos.y + 0.06, kneePos.z + 0.07], w: 0.14, h: 0.10 },
        { at: [kneePos.x, kneePos.y, kneePos.z + 0.10], w: 0.15, h: 0.11 },
        { at: [kneePos.x, kneePos.y - 0.06, kneePos.z + 0.08], w: 0.09, h: 0.08 },
      ],
      {
        bone: knee,
        color: bonePaint,
        name: `kneeSkull${side}`,
        group: `leg${side}`,
      },
    );
    b.spike(
      [kneePos.x, kneePos.y + 0.01, kneePos.z + 0.13],
      [s * 0.15, 0.35, 1],
      0.09,
      0.028,
      tuskPaint,
      { bone: knee, sides: 6, name: `kneeHorn${side}`, group: `leg${side}` },
    );

    // Leather knee strap
    b.rod(
      [kneePos.x, kneePos.y + 0.01, kneePos.z - 0.09],
      [kneePos.x, kneePos.y + 0.01, kneePos.z + 0.08],
      0.065,
      leatherPaint,
      { bone: knee, sides: 8, name: `kneeStrap${side}`, group: `leg${side}` },
    );

    // Shin wraps & heavy bronze/bone ankle rings above the feet
    for (let a = 0; a < 3; a++) {
      const ay = 0.19 + a * 0.048;
      b.part(new THREE.TorusGeometry(0.082 + a * 0.004, 0.016, 6, 10), a === 1 ? bronzePaint : ROPE_HEMP, {
        bone: ankle,
        at: [s * 0.29, ay, -0.02 + a * 0.01],
        rotation: [85, 0, 0],
        name: `ankleRing${side}_${a}`,
        group: `leg${side}`,
      });
    }

    // Massive Flat-Planted Troll Foot Arch & Heel Spur (resting cleanly on y = 0)
    b.loft(
      [
        { at: [s * 0.29, 0.055, -0.09], w: 0.13, h: 0.09 },
        { at: [s * 0.29, 0.065, 0.02], w: 0.16, h: 0.10 },
        { at: [s * 0.29, 0.055, 0.14], w: 0.19, h: 0.08 },
      ],
      {
        bone: foot,
        color: trollSkin,
        name: `footBody${side}`,
        group: `foot${side}`,
      },
    );

    // Characteristic Warcraft Troll Back Heel Toe / Spur (touching ground at y ~ 0.01)
    b.sweep(
      catmull([
        [s * 0.29, 0.055, -0.07],
        [s * 0.29, 0.038, -0.15],
        [s * 0.29, 0.025, -0.21],
      ]),
      [0.042, 0.032, 0.018],
      {
        bone: foot,
        color: trollSkin,
        sides: 7,
        name: `heelToe${side}`,
        group: `foot${side}`,
      },
    );
    b.spike(
      [s * 0.29, 0.024, -0.20],
      [0, -0.12, -1],
      0.055,
      0.022,
      tuskPaint,
      { bone: foot, sides: 6, name: `heelClaw${side}`, group: `foot${side}` },
    );

    // Two Huge Splayed Front Troll Toes + Heavy Curved Toenails on y = 0
    for (const [tName, tChain, rToe, dirX] of [
      ["toeIn", toeInner, 0.044, -s * 0.18],
      ["toeOut", toeOuter, 0.042, s * 0.22],
    ] as const) {
      b.sweep(tChain, [rToe, rToe * 0.88, rToe * 0.72], {
        color: trollSkin,
        sides: 7,
        name: `${tName}Tube${side}`,
        group: `foot${side}`,
      });

      const toeTip = tChain.at(1);
      b.spike(
        toeTip.at,
        [dirX, -0.18, 1],
        0.068,
        rToe * 0.68,
        tuskPaint,
        {
          bone: tChain.joints[tChain.joints.length - 1],
          sides: 6,
          name: `${tName}Claw${side}`,
          group: `foot${side}`,
        },
      );
    }
  }

  // ============================================================================
  // 9. SWAMP WARTS, BOG TOADSTOOLS & MOSS CLUSTERS ON HUNCHED BACK & SHOULDERS
  // ============================================================================
  const wartHits = chestSkin.scatter(24, {
    rng: rng(909),
    minDist: 0.09,
    filter: (h) => h.n.y > 0.1 && h.at.y > 1.25 && h.at.z < 0.08,
  });
  wartHits.forEach((hit, i) => {
    const r = 0.016 + (i % 3) * 0.007;
    b.stick(
      new THREE.SphereGeometry(r, 7, 5),
      i % 3 === 0 ? mossPaint : WART_GREEN,
      hit,
      { embed: 0.45, name: `backWart_${i}`, group: "torso" },
    );
  });

  // Glowing bioluminescent swamp mushrooms sprouting from the mossy left shoulder hump
  const shroomPositions: Array<[number, number, number]> = [
    [0.24, 1.76, -0.05],
    [0.28, 1.73, -0.09],
    [-0.23, 1.75, -0.06],
  ];
  shroomPositions.forEach((sp, i) => {
    const stemTop: [number, number, number] = [sp[0] + (i === 2 ? -0.015 : 0.015), sp[1] + 0.045, sp[2] - 0.01];
    b.capsule(sp, stemTop, [0.009, 0.007], BONE_LIGHT, {
      bone: chest,
      sides: 6,
      group: "fetishes",
    });
    glow(
      b.part(new THREE.ConeGeometry(0.026 - (i % 2) * 0.005, 0.024, 8), VOODOO_CYAN, {
        bone: chest,
        at: stemTop,
        dir: [0, 1, -0.15],
        name: `biolumShroom_${i}`,
        group: "fetishes",
      }),
      1.6,
    );
  });

  return b.root;
}
