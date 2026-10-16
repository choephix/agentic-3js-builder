import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, mid, offset, rng } from "../../../../src/math";
import {
  countershade,
  grain,
  mix,
  mottle,
  noise,
  paint,
  scales,
  smoothstep,
} from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "Heroic Blizzard/Warcraft-style dwarf mountaineer rifleman with thick braided ginger beard, fur-hooded ram-horn cloak, rune-engraved pauldrons, powder keg, and oversized brass-flared blunderbuss.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", detail: 1, paintSize: 2048 });
  const rand = rng(42077);

  // ============================================================================
  // PALETTE & HAND-PAINTED WARCRAFT SURFACES
  // ============================================================================
  // Rich saturated Warcraft colors with warm-to-cool shadow gradients and hand-painted wear
  const SKIN_LIT = "#f0a67c";
  const SKIN_MID = "#d67f58";
  const SKIN_SHAD = "#8c4236";
  const NOSE_RUDDY = "#d95b48";

  const BEARD_BRIGHT = "#eb6123";
  const BEARD_MID = "#c44114";
  const BEARD_DARK = "#6e1c0a";
  const BEARD_TIP = "#ff8538";

  const FUR_CREAM = "#e6dcc8";
  const FUR_TAN = "#b89f7d";
  const FUR_DARK = "#594636";
  const PELT_BROWN = "#6e472b";
  const PELT_SHADOW = "#3b2314";

  const CLOAK_GREEN = "#265938";
  const CLOAK_HIGHLIGHT = "#3e7d4e";
  const CLOAK_SHADOW = "#132e20";

  const TUNIC_RED = "#9e2424";
  const TUNIC_LIGHT = "#c7382e";
  const TUNIC_DARK = "#4f0f16";

  const LEATHER_WARM = "#6b3921";
  const LEATHER_LIGHT = "#8f5130";
  const LEATHER_DARK = "#36190d";
  const BOOT_DARK = "#2b160e";

  const IRON_LIGHT = "#8a99ad";
  const IRON_MID = "#586578";
  const IRON_DARK = "#2a313d";
  const GUNMETAL_DARK = "#1f242d";

  const GOLD_BRIGHT = "#ffcb47";
  const GOLD_MID = "#d49222";
  const GOLD_SHADOW = "#6e3e0c";
  const BRASS_WARM = "#e09f3e";

  const WOOD_STOCK = "#7a3b1e";
  const WOOD_DARK = "#3d1a0b";

  const HORN_LIGHT = "#d6c49e";
  const HORN_DARK = "#594933";

  const EMBER_GLOW = "#ff6a14";
  const RUNE_CYAN = "#38e8ff";
  const EYE_GLOW = "#66d9ff";

  // Hand-painted Warcraft style shader helper: directional top-down + key-light gradient with mottled brush strokes
  const KEY_DIR = new THREE.Vector3(0.35, 0.78, 0.51).normalize();

  const skinPaint = paint((p, n) => {
    const l = smoothstep(-0.35, 0.65, n.dot(KEY_DIR));
    const brush = noise(p, 0.045, 11);
    const base = mix(SKIN_SHAD, mix(SKIN_MID, SKIN_LIT, l), 0.35 + 0.65 * l);
    const ruddy = smoothstep(0.06, 0.16, p.z) * smoothstep(0.92, 1.06, p.y) * 0.45;
    const withCheeks = mix(base, NOSE_RUDDY, ruddy);
    return mix(withCheeks, SKIN_LIT, (brush - 0.5) * 0.18);
  });

  const nosePaint = paint((p, n) => {
    const l = smoothstep(-0.3, 0.7, n.dot(KEY_DIR));
    const tip = smoothstep(0.11, 0.19, p.z);
    const c = mix(SKIN_MID, NOSE_RUDDY, 0.55 + 0.35 * tip);
    return mix(SKIN_SHAD, c, 0.3 + 0.7 * l);
  });

  const beardPaint = paint((p, n, s) => {
    const l = smoothstep(-0.4, 0.7, n.dot(KEY_DIR));
    const strand = Math.sin(s[1] * 0.35 + noise(p, 0.03, 23) * 4) * 0.5 + 0.5;
    const bandWave = Math.sin(s[0] * 22) * 0.5 + 0.5;
    const core = mix(BEARD_DARK, BEARD_MID, 0.3 + 0.7 * l);
    const hi = mix(core, BEARD_BRIGHT, strand * (0.4 + 0.5 * l));
    return mix(hi, BEARD_TIP, bandWave * 0.22 * l);
  });

  const cloakPaint = paint((p, n) => {
    const l = smoothstep(-0.45, 0.7, n.dot(KEY_DIR));
    const topGrad = smoothstep(0.35, 1.15, p.y);
    const m = noise(p, 0.09, 31);
    const edgeWear = smoothstep(0.5, 0.28, p.y);
    const base = mix(CLOAK_SHADOW, CLOAK_GREEN, 0.25 + 0.55 * l + 0.2 * topGrad);
    const lit = mix(base, CLOAK_HIGHLIGHT, l * m * 0.65);
    return mix(lit, "#1a2418", edgeWear * 0.35);
  });

  const tunicPaint = paint((p, n) => {
    const l = smoothstep(-0.4, 0.7, n.dot(KEY_DIR));
    const m = noise(p, 0.06, 41);
    const base = mix(TUNIC_DARK, TUNIC_RED, 0.3 + 0.7 * l);
    return mix(base, TUNIC_LIGHT, l * (0.3 + 0.4 * m));
  });

  const chainmailPaint = scales([IRON_MID, IRON_LIGHT, "#6d7b91"], IRON_DARK, {
    size: 0.018,
    width: 0.22,
    seed: 52,
  });

  const steelPaint = paint((p, n) => {
    const l = smoothstep(-0.35, 0.75, n.dot(KEY_DIR));
    const spec = smoothstep(0.55, 0.92, n.dot(KEY_DIR));
    const scratch = noise(p, 0.035, 61);
    const base = mix(IRON_DARK, IRON_MID, 0.25 + 0.75 * l);
    const brushed = mix(base, IRON_LIGHT, (0.35 + 0.45 * scratch) * l);
    return mix(brushed, "#d6e4f5", spec * 0.45);
  });

  const gunmetalPaint = paint((p, n) => {
    const l = smoothstep(-0.4, 0.75, n.dot(KEY_DIR));
    const soot = noise(p, 0.05, 67);
    const base = mix("#12151c", GUNMETAL_DARK, 0.3 + 0.7 * l);
    return mix(base, IRON_MID, l * (0.35 + 0.35 * soot));
  });

  const goldPaint = paint((p, n) => {
    const l = smoothstep(-0.35, 0.7, n.dot(KEY_DIR));
    const spec = smoothstep(0.5, 0.88, n.dot(KEY_DIR));
    const wear = noise(p, 0.04, 73);
    const base = mix(GOLD_SHADOW, GOLD_MID, 0.3 + 0.7 * l);
    const bright = mix(base, GOLD_BRIGHT, l * (0.45 + 0.35 * wear));
    return mix(bright, "#fff1b8", spec * 0.45);
  });

  const leatherPaint = paint((p, n) => {
    const l = smoothstep(-0.4, 0.7, n.dot(KEY_DIR));
    const creasing = noise(p, 0.05, 83);
    const base = mix(LEATHER_DARK, LEATHER_WARM, 0.3 + 0.7 * l);
    return mix(base, LEATHER_LIGHT, l * creasing * 0.55);
  });

  const darkLeatherPaint = countershade(
    mottle(LEATHER_DARK, BOOT_DARK, { size: 0.06, seed: 89 }),
    "#170b06",
    { level: -0.1, soft: 0.4 },
  );

  const woodPaint = grain(
    mix(WOOD_DARK, WOOD_STOCK, 0.4),
    mix(WOOD_STOCK, "#9e532b", 0.55),
    { size: 0.028, axis: [0.3, 0.2, 0.9], seed: 97 },
  );

  const furTrimPaint = paint((p, n) => {
    const l = smoothstep(-0.35, 0.7, n.dot(KEY_DIR));
    const tuft = noise(p, 0.025, 103);
    const base = mix(FUR_DARK, FUR_TAN, 0.35 + 0.65 * l);
    return mix(base, FUR_CREAM, smoothstep(0.35, 0.8, tuft * (0.4 + 0.6 * l)));
  });

  const bearPeltPaint = paint((p, n) => {
    const l = smoothstep(-0.35, 0.7, n.dot(KEY_DIR));
    const tuft = noise(p, 0.032, 109);
    const base = mix(PELT_SHADOW, PELT_BROWN, 0.3 + 0.7 * l);
    return mix(base, "#94643f", tuft * l * 0.6);
  });

  const hornPaint = paint((p, n, s) => {
    const l = smoothstep(-0.35, 0.7, n.dot(KEY_DIR));
    const ridge = Math.sin(s[0] * 38) * 0.5 + 0.5;
    const tipDark = smoothstep(0.55, 0.98, s[0]);
    const base = mix(HORN_DARK, HORN_LIGHT, (0.35 + 0.65 * l) * (0.7 + 0.3 * ridge));
    return mix(base, "#2b2116", tipDark * 0.65);
  });

  // ============================================================================
  // SVG TEXTURES (CARDS, DECALS, ORNAMENTAL PLATES)
  // ============================================================================
  // Chunky Warcraft hand-painted fur/beard tuft card
  const FUR_CARD_TEX = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M8 96 C6 66 12 36 22 10 C25 28 25 46 24 62 C28 36 33 14 36 2 C40 24 41 48 39 66 C44 44 50 24 54 14 C57 42 58 68 54 96 Z" fill="#b39b7b"/>
      <path d="M14 96 C14 70 18 44 24 22 C27 38 27 54 26 70 C30 46 34 24 36 12 C39 32 39 54 38 72 C42 52 47 34 50 24 C52 48 52 72 49 96 Z" fill="#ded2be"/>
      <path d="M22 96 C23 74 28 48 35 24 C38 48 38 72 37 96 Z" fill="#fff6e6"/>
    </svg>`,
    { size: 256 },
  );

  // Braided ginger beard strand card
  const BEARD_CARD_TEX = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M6 96 C4 64 12 34 26 4 C29 24 28 44 26 62 C32 36 36 14 40 2 C44 26 44 50 41 68 C46 46 52 28 56 16 C59 44 58 70 54 96 Z" fill="#8f290d"/>
      <path d="M13 96 C13 68 19 40 28 16 C30 34 30 50 29 66 C34 42 38 22 40 12 C42 32 42 54 40 72 C45 54 49 36 52 26 C54 50 53 74 50 96 Z" fill="#d94e18"/>
      <path d="M22 96 C24 72 30 46 37 22 C40 46 40 70 38 96 Z" fill="#ff7b29"/>
    </svg>`,
    { size: 256 },
  );

  // Fierce Dwarven eye decal (right eye drawn, mirror: true for left)
  const DWARF_EYE_TEX = svg(
    `<svg viewBox="0 0 96 64">
      <path d="M8 36 Q46 10 88 32 Q52 56 12 40 Z" fill="#21110b"/>
      <path d="M16 35 Q47 16 80 32 Q50 49 18 38 Z" fill="#e8dccb"/>
      <ellipse cx="48" cy="33" rx="15" ry="14" fill="#1b4d78"/>
      <ellipse cx="48" cy="33" rx="11" ry="10.5" fill="#3596d4"/>
      <ellipse cx="48" cy="33" rx="5.5" ry="6" fill="#0d1824"/>
      <circle cx="42" cy="28" r="4" fill="#ffffff"/>
      <circle cx="54" cy="37" r="2.2" fill="#b8f2ff"/>
      <path d="M6 34 Q46 8 90 30" stroke="#140905" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  // Dwarven geometric mountain/anvil rune emblem for belt buckle, pauldron & gun stock
  const DWARF_RUNE_TEX = svg(
    `<svg viewBox="0 0 128 128">
      <polygon points="64,6 116,36 116,92 64,122 12,92 12,36" fill="#2a1f16" stroke="#d49222" stroke-width="8"/>
      <polygon points="64,18 104,42 104,86 64,110 24,86 24,42" fill="#473321" stroke="#ffcb47" stroke-width="4"/>
      <path d="M36 44 L92 44 L78 62 L86 62 L64 98 L42 62 L50 62 Z" fill="#ffcb47"/>
      <circle cx="64" cy="54" r="7" fill="#38e8ff"/>
    </svg>`,
    { size: 256 },
  );

  // Glowing arcane/forge rune decal for blunderbuss barrel
  const BARREL_RUNE_TEX = svg(
    `<svg viewBox="0 0 128 64">
      <path d="M10 32 L30 14 L50 32 L30 50 Z M48 32 L118 32 M68 16 L84 32 L68 48 M94 18 L108 32 L94 46" stroke="#38e8ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="30" cy="32" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ============================================================================
  // SKELETON (CHUNKY HEROIC DWARF PROPORTIONS, ~1.28 m TALL)
  // ============================================================================
  // Wide heroic stance, deep barrel chest, massive shoulders & gauntlets, posed holding blunderbuss across body
  const bootSoleH = 0.055;
  const hipY = 0.48;
  const hipX = 0.145;
  const footX = 0.195;
  const footZ = 0.03;

  // Root pelvis joint
  const hips = b.joint("hips", {
    at: [0, hipY, -0.02],
    dir: [0, 1, 0.05],
    role: "spine",
    group: "torso",
  });

  // Spine & Neck chain
  const spine = b.chain(
    "spine",
    catmull([
      [0, hipY, -0.02],
      [0, 0.64, 0.0],
      [0, 0.81, 0.01],
    ]),
    {
      parent: hips,
      names: ["belly", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const belly = spine.joints[0];
  const chest = spine.joints[1];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.88, 0.02],
    dir: [0, 0.95, 0.2],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.94, 0.045],
    dir: [0, 0.06, 1],
    up: [0, 1, 0],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.04, forward: 0.04 }),
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  // Braided Beard Chains (Central heavy braid + Left/Right twin braids)
  const beardMain = b.chain(
    "beardMain",
    catmull([
      [0, 0.87, 0.145],
      [0, 0.72, 0.215],
      [0, 0.56, 0.225],
      [0, 0.42, 0.195],
    ]),
    {
      parent: jaw,
      names: ["beardMain1", "beardMain2", "beardMain3"],
      role: "tail",
      group: "beard",
    },
  );

  const beardSideChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    beardSideChains[side] = b.chain(
      `beard${side}`,
      catmull([
        [s * 0.075, 0.89, 0.125],
        [s * 0.115, 0.75, 0.185],
        [s * 0.125, 0.60, 0.19],
        [s * 0.11, 0.47, 0.165],
      ]),
      {
        parent: jaw,
        names: [`beard${side}1`, `beard${side}2`, `beard${side}3`],
        role: "tail",
        group: "beard",
      },
    );
  }

  // Flowing Mustache Chains
  const mustacheChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    mustacheChains[side] = b.chain(
      `mustache${side}`,
      catmull([
        [s * 0.025, 0.935, 0.175],
        [s * 0.095, 0.91, 0.175],
        [s * 0.155, 0.855, 0.14],
        [s * 0.185, 0.79, 0.105],
      ]),
      {
        parent: head,
        names: [`mustache${side}1`, `mustache${side}2`, `mustache${side}3`],
        role: "tentacle",
        group: "beard",
      },
    );
  }

  // Cloak tail chain on back
  const cloakChain = b.chain(
    "cloak",
    catmull([
      [0, 0.90, -0.12],
      [0, 0.68, -0.22],
      [0, 0.42, -0.27],
      [0, 0.17, -0.29],
    ]),
    {
      parent: chest,
      names: ["cloakUpper", "cloakMid", "cloakLower"],
      role: "tail",
      group: "cloak",
    },
  );

  // Legs (IK solved to planted heavy boots on y = 0)
  const legChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * hipX, hipY, -0.01];
    const anklePt: [number, number, number] = [s * footX, bootSoleH, footZ + (s > 0 ? 0.02 : -0.02)];
    const legPts = limb(hipPt, anklePt, [0.23, 0.22], [s * 0.22, 0.1, 1]);
    legChains[side] = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [anklePt[0], 0, anklePt[2] + 0.05],
      group: `leg${side}`,
    });
  }

  // Arms: Neutral readable rest pose with elbows out and hands ready (T-pose / A-pose hybrid for rigging,
  // with the massive blunderbuss mounted cleanly in the right hand / across forearm and secondary sling/holster)
  // Wait — GUIDE.md says:
  // "Creatures are built skeleton first and stand in a rest pose for rigging and animation: a neutral, readable pose,
  // the non-humanoid equivalent of a T-pose, with limbs, digits, wings, tails and tentacles separated and extended,
  // and the mouth built as a separate upper and lower jaw so it can open."
  // Let's make sure the arms and digits are separated and extended in a heroic A/T-pose so there are zero stiff-part
  // issues across joints and the flex test bends cleanly! And the blunderbuss is held solidly by the right hand (`handR`).
  const armChains: Record<string, ReturnType<typeof b.chain>> = {};
  const fingerJoints: Record<string, ReturnType<typeof b.joint>[]> = { L: [], R: [] };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderPt: [number, number, number] = [s * 0.24, 0.84, 0.0];
    const wristPt: [number, number, number] =
      s > 0
        ? [s * 0.56, 0.62, 0.10] // Left arm extended out & slightly forward
        : [s * 0.54, 0.60, 0.14]; // Right arm extended out & slightly forward holding blunderbuss
    const armPts = limb(shoulderPt, wristPt, [0.21, 0.21], [s * 0.3, -0.15, -1]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    armChains[side] = arm;

    const hand = arm.tip!;
    // Chunky Dwarven Thumb + 3 heavy gauntlet fingers per hand (role: "digit")
    const thumbBase = offset(hand.at, [s * 0.5, 0.2, 0.85], 0.045);
    const thumbTip = offset(thumbBase, [s * 0.65, -0.1, 0.75], 0.055);
    const thumbChain = b.chain(`thumb${side}`, [thumbBase, thumbTip], {
      parent: hand,
      names: [`thumb${side}1`, `thumb${side}2`],
      role: "digit",
      group: `arm${side}`,
    });
    fingerJoints[side].push(thumbChain.joints[0]);

    for (let f = 0; f < 3; f++) {
      const zOff = (1 - f) * 0.032;
      const fBase = offset(hand.at, [s * 0.88, -0.35, zOff * 6], 0.055);
      const fMid = offset(fBase, [s * 0.88, -0.42, zOff * 4], 0.042);
      const fTip = offset(fMid, [s * 0.75, -0.55, zOff * 3], 0.036);
      const fChain = b.chain(`finger${side}${f + 1}`, [fBase, fMid, fTip], {
        parent: hand,
        names: [`finger${side}${f + 1}a`, `finger${side}${f + 1}b`],
        role: "digit",
        group: `arm${side}`,
      });
      fingerJoints[side].push(fChain.joints[0]);
    }
  }

  // Mechanical hinge joints on the Blunderbuss & Powder Keg (attached to handR / hips)
  const handR = armChains.R.tip!;
  const gunDir = new THREE.Vector3(-0.15, 0.22, 0.96).normalize();
  const gunOrigin = offset(handR.at, [0, -0.02, 0.05], 0.02);

  const gunFrame = frame(gunOrigin, gunDir, [0, 1, 0]);
  const flintCockJoint = b.joint("flintCock", {
    parent: handR,
    at: gunFrame.local([0.042, 0.02, 0.055]),
    dir: [0, 1, 0.25],
    role: "hinge",
    group: "blunderbuss",
  });

  // ============================================================================
  // TORSO, TUNIC, CHAINMAIL & HEAVY DWARVEN BELT
  // ============================================================================
  // Barrel-chested dwarven torso loft over spine
  const torsoLoft = b.loft(
    [
      { at: [0, 0.39, -0.02], w: 0.42, h: 0.32 },
      { at: [0, 0.53, 0.0], w: 0.48, h: 0.38 },
      { at: [0, 0.70, 0.01], w: 0.54, h: 0.40 },
      { at: [0, 0.86, 0.0], w: 0.50, h: 0.35 },
      { at: [0, 0.93, 0.01], w: 0.30, h: 0.26 },
    ],
    {
      bone: [hips, spine],
      color: tunicPaint,
      name: "torsoTunic",
      group: "torso",
    },
  );

  // Chainmail hauberk skirt & upper chest reinforced mail
  const mailSkirt = b.loft(
    [
      { at: [0, 0.33, -0.02], w: 0.49, h: 0.37 },
      { at: [0, 0.42, -0.01], w: 0.46, h: 0.35 },
      { at: [0, 0.50, -0.01], w: 0.47, h: 0.36 },
    ],
    {
      bone: hips,
      color: chainmailPaint,
      name: "mailSkirt",
      group: "torso",
    },
  );

  // Quilted leather gambeson tassets (front & side armored flaps hanging from waist)
  const tassetOutline: OutlinePoint[] = [
    [-0.065, 0.0],
    [0.065, 0.0],
    [0.075, -0.14],
    [0.0, -0.19, "sharp"],
    [-0.075, -0.14],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const tasset = b.extrude(tassetOutline, {
      at: [s * 0.16, 0.47, 0.12],
      x: [s * 0.72, 0, -0.69],
      y: [s * 0.12, 0.98, 0.12],
      thickness: 0.026,
      bevel: 0.007,
      smoothing: 1,
      bone: hips,
      color: leatherPaint,
      name: `tasset${side}`,
      group: "torso",
    });
    // Gold trim stud on tasset
    b.stick(new THREE.CylinderGeometry(0.018, 0.022, 0.016, 8), goldPaint, tasset.moved([0, -0.09, 0.014]), {
      bone: hips,
      group: "torso",
    });
  }

  // Heavy leather kidney belt wrapped around torso
  const torsoSurf = b.surface([torsoLoft, mailSkirt]);
  const beltLoop = torsoSurf.loop(frame([0, 0.49, 0], [0, 1, 0]), { lift: 0.016 });
  b.sweep(beltLoop, () => [0.028, 0.048], {
    bone: hips,
    color: darkLeatherPaint,
    name: "waistBelt",
    group: "torso",
  });

  // Upper gold-trimmed belt strap
  const beltRimUpper = torsoSurf.loop(frame([0, 0.53, 0], [0, 1, 0]), { lift: 0.02 });
  b.sweep(beltRimUpper, 0.01, {
    bone: hips,
    color: goldPaint,
    name: "beltRimUpper",
    group: "torso",
  });
  const beltRimLower = torsoSurf.loop(frame([0, 0.45, 0], [0, 1, 0]), { lift: 0.02 });
  b.sweep(beltRimLower, 0.01, {
    bone: hips,
    color: goldPaint,
    name: "beltRimLower",
    group: "torso",
  });

  // Brass studs around the belt
  b.along(beltLoop, 12, (pt) => {
    b.part(new THREE.SphereGeometry(0.014, 6, 5), goldPaint, {
      at: pt,
      bone: hips,
      group: "torso",
    });
  });

  // Heroic Dwarven Ram/Anvil Belt Buckle at front
  const bucklePos: [number, number, number] = [0, 0.49, 0.195];
  const buckleOutline: OutlinePoint[] = [
    [-0.075, -0.055],
    [0.0, -0.075, "sharp"],
    [0.075, -0.055],
    [0.085, 0.0],
    [0.075, 0.055],
    [0.0, 0.075, "sharp"],
    [-0.075, 0.055],
    [-0.085, 0.0],
  ];
  b.extrude(buckleOutline, {
    at: bucklePos,
    x: [1, 0, 0],
    y: [0, 1, 0.08],
    thickness: 0.032,
    bevel: 0.009,
    smoothing: 1,
    bone: hips,
    color: goldPaint,
    name: "beltBuckle",
    group: "torso",
  });
  // Textured Rune plate on the belt buckle
  b.part(new THREE.CircleGeometry(0.058, 6), "#ffffff", {
    at: [0, 0.49, 0.214],
    dir: [0, 0.08, 1],
    axis: "z",
    bone: hips,
    texture: DWARF_RUNE_TEX,
    name: "buckleRune",
    group: "torso",
  });

  // Chest Cross-Bandolier with Brass Rifle Cartridges
  const bandolierRough = catmull(
    [
      [0.21, 0.89, 0.02],
      [0.08, 0.74, 0.205],
      [-0.12, 0.56, 0.195],
      [-0.24, 0.50, -0.01],
      [-0.14, 0.58, -0.195],
      [0.06, 0.76, -0.195],
    ],
    { closed: true },
  );
  const bandolierPath = torsoSurf.drape(bandolierRough, { lift: 0.018 });
  b.sweep(bandolierPath, () => [0.018, 0.032], {
    bone: chest,
    color: leatherPaint,
    name: "bandolierStrap",
    group: "torso",
  });

  // 7 Brass Rifle Shells / Powder Charges along the front of the bandolier
  for (let i = 0; i < 7; i++) {
    const t = 0.05 + i * 0.048;
    const hit = torsoSurf.nearest(bandolierPath.at(t));
    const shellCenter = hit.moved([0, 0.026, 0]);
    const shellAxis = new THREE.Vector3(0.65, 0.55, -0.15).normalize();
    const pA = offset(shellCenter.at, shellAxis, -0.034);
    const pB = offset(shellCenter.at, shellAxis, 0.022);
    const pTip = offset(shellCenter.at, shellAxis, 0.044);
    b.rod(pA, pB, 0.013, {
      bone: chest,
      color: goldPaint,
      sides: 6,
      name: `ammoCasing${i + 1}`,
      group: "torso",
    });
    b.spike(pB, pTip, null, 0.012, {
      bone: chest,
      color: steelPaint,
      sides: 6,
      name: `ammoSlug${i + 1}`,
      group: "torso",
    });
    b.rod(offset(shellCenter.at, shellAxis, -0.01), offset(shellCenter.at, shellAxis, 0.006), 0.0155, {
      bone: chest,
      color: darkLeatherPaint,
      sides: 6,
      group: "torso",
    });
  }

  // ============================================================================
  // CLOAK, BEAR-PELT MANTLE, HOOD & COILED RAM HORNS
  // ============================================================================
  // Heavy fur-trimmed shoulder mantle across upper back and shoulders
  const mantlePath = catmull([
    [-0.30, 0.84, 0.08],
    [-0.24, 0.91, -0.08],
    [0.0, 0.94, -0.15],
    [0.24, 0.91, -0.08],
    [0.30, 0.84, 0.08],
  ]);
  const mantleSweep = b.sweep(mantlePath, [0.065, 0.095, 0.11, 0.095, 0.065], {
    bone: chest,
    color: bearPeltPaint,
    name: "furMantle",
    group: "cloak",
  });

  // Layered Fur Cards on the Bear-Pelt Mantle
  const mantleHits = b.surface(mantleSweep).scatter(75, {
    rng: rand,
    minDist: 0.028,
    filter: (h) => h.n.y > -0.2,
  });
  b.cards(mantleHits, FUR_CARD_TEX, {
    size: [0.055, 0.095],
    lean: 55,
    bend: 25,
    vary: 0.25,
    spin: 18,
    rng: rand,
    color: bearPeltPaint,
    bone: chest,
    name: "mantleFurCards",
    group: "cloak",
  });

  // Heavy Dwarven Mountaineer Cloak flowing down the back over cloakChain
  const cloakStations = [
    { at: [0, 0.90, -0.13], w: 0.44, h: 0.07 },
    { at: [0, 0.70, -0.22], w: 0.56, h: 0.08 },
    { at: [0, 0.44, -0.27], w: 0.64, h: 0.08 },
    { at: [0, 0.18, -0.29], w: 0.70, h: 0.06 },
  ];
  const cloakBody = b.loft(cloakStations, {
    bone: cloakChain,
    color: cloakPaint,
    name: "cloakBody",
    group: "cloak",
  });

  // Thick cream-fur trim around bottom edge of cloak
  const cloakBottomTrim = catmull([
    [-0.33, 0.19, -0.26],
    [-0.18, 0.16, -0.30],
    [0.0, 0.15, -0.31],
    [0.18, 0.16, -0.30],
    [0.33, 0.19, -0.26],
  ]);
  b.sweep(cloakBottomTrim, [0.032, 0.042, 0.045, 0.042, 0.032], {
    bone: cloakChain.joints[2],
    color: furTrimPaint,
    name: "cloakBottomFur",
    group: "cloak",
  });

  // Gold clasps pinning the cloak at the front collar
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const claspAt: [number, number, number] = [s * 0.13, 0.86, 0.135];
    b.lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.038, 0.012],
        [0.026, 0.024],
        [0, 0.028],
      ],
      {
        at: claspAt,
        axis: [s * 0.25, 0.35, 0.9],
        segments: 8,
        bone: chest,
        color: goldPaint,
        name: `cloakClasp${side}`,
        group: "cloak",
      },
    );
  }
  // Heavy gold chain linking the two cloak clasps
  const claspChainPath = bezier(
    [-0.13, 0.86, 0.15],
    [-0.05, 0.81, 0.185],
    [0.05, 0.81, 0.185],
    [0.13, 0.86, 0.15],
  );
  b.sweep(claspChainPath, 0.011, {
    bone: chest,
    color: goldPaint,
    sides: 6,
    name: "cloakChainLink",
    group: "cloak",
  });

  // ============================================================================
  // HEROIC PAULDRONS (ASYMMETRICAL WARCRAFT MOUNTED ARMOR)
  // ============================================================================
  // Left shoulder: Massive layered steel & gold ram-crest pauldron
  // Right shoulder: Reinforced rifleman gunner pad with brass studs & cartridge loops
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shBone = armChains[side].joints[0];
    const pCenter: [number, number, number] = [s * 0.27, 0.88, 0.0];

    // Main curved pauldron dome
    const pauldronArc = catmull([
      [s * 0.18, 0.94, -0.10],
      [s * 0.27, 0.96, 0.0],
      [s * 0.18, 0.94, 0.10],
    ]);
    b.sweep(pauldronArc, () => [0.095, 0.055], {
      bone: shBone,
      color: s > 0 ? steelPaint : leatherPaint,
      name: `pauldronMain${side}`,
      group: `arm${side}`,
    });

    // Raised gold/brass rim along outer edge of pauldron
    const rimArc = catmull([
      [s * 0.21, 0.90, -0.12],
      [s * 0.35, 0.88, 0.0],
      [s * 0.21, 0.90, 0.12],
    ]);
    b.sweep(rimArc, 0.022, {
      bone: shBone,
      color: goldPaint,
      name: `pauldronRim${side}`,
      group: `arm${side}`,
    });

    // Second lower plate tier
    const lowerArc = catmull([
      [s * 0.22, 0.84, -0.10],
      [s * 0.36, 0.82, 0.0],
      [s * 0.22, 0.84, 0.10],
    ]);
    b.sweep(lowerArc, () => [0.065, 0.032], {
      bone: shBone,
      color: s > 0 ? steelPaint : darkLeatherPaint,
      name: `pauldronLower${side}`,
      group: `arm${side}`,
    });

    // Spikes / Rivets on Pauldrons
    for (const zSign of [-1, 0, 1]) {
      const spikeBase: [number, number, number] = [
        s * (zSign === 0 ? 0.34 : 0.28),
        zSign === 0 ? 0.93 : 0.91,
        zSign * 0.075,
      ];
      const spikeDir: [number, number, number] = [s * 0.85, 0.55, zSign * 0.25];
      b.spike(spikeBase, spikeDir, s > 0 ? 0.065 : 0.035, s > 0 ? 0.022 : 0.016, {
        bone: shBone,
        color: goldPaint,
        sides: 6,
        name: `pauldronSpike${side}${zSign + 2}`,
        group: `arm${side}`,
      });
    }

    // Center emblem on Left Pauldron
    if (s > 0) {
      b.part(new THREE.CircleGeometry(0.048, 6), "#ffffff", {
        at: [pCenter[0] + 0.075, pCenter[1] + 0.03, pCenter[2] + 0.02],
        dir: [1, 0.35, 0.2],
        axis: "z",
        bone: shBone,
        texture: DWARF_RUNE_TEX,
        name: "pauldronRuneL",
        group: "armL",
      });
    }
  }

  // ============================================================================
  // HEAD, WEATHERED FACE, HELM/HOOD, EARS & BRAIDED BEARD
  // ============================================================================
  // Broad craggy dwarven skull
  const skull = b.part(new THREE.SphereGeometry(0.135, 14, 12), skinPaint, {
    bone: head,
    at: head.local([0, 0.055, 0.025]),
    scale: [1.08, 0.98, 1.04],
    name: "skull",
    group: "head",
  });

  // Heavy lower jaw & cheekbones
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.058, 10, 8), skinPaint, {
      bone: head,
      at: head.local([s * 0.078, 0.065, 0.01]),
      scale: [1.1, 0.85, 0.9],
      name: `cheek${s > 0 ? "L" : "R"}`,
      group: "head",
    });
  }

  // Bulbous Warcraft Dwarven Nose!
  b.capsule(head.local([0, 0.115, 0.045]), head.local([0, 0.165, 0.015]), [0.032, 0.046], {
    bone: head,
    color: nosePaint,
    name: "noseBridge",
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), nosePaint, {
      bone: head,
      at: head.local([s * 0.032, 0.148, 0.008]),
      name: `nostril${s > 0 ? "L" : "R"}`,
      group: "head",
    });
  }

  // Fierce Dwarven Eyes (Decal + Subtle Ice-Blue Heroic Glow Pupil + Heavy Brow Ridge)
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyePos = head.local([s * 0.055, 0.125, 0.05]);
    b.decal(skullSurf, DWARF_EYE_TEX, {
      at: eyePos,
      dir: [s * 0.18, 0.05, 0.98],
      size: [0.062, 0.042],
      mirror: s > 0,
      bone: head,
      name: `eyeDecal${side}`,
      group: "head",
    });

    // Subtle heroic glint sphere on eye
    glow(
      b.part(new THREE.SphereGeometry(0.007, 6, 4), EYE_GLOW, {
        at: head.local([s * 0.054, 0.129, 0.048]),
        bone: head,
        name: `eyeSpark${side}`,
        group: "head",
      }),
      1.2,
    );

    // Massive bushy ginger eyebrows flaring outward and upward
    const browPath = catmull([
      head.local([s * 0.018, 0.138, 0.065]),
      head.local([s * 0.065, 0.145, 0.082]),
      head.local([s * 0.118, 0.125, 0.095]),
      head.local([s * 0.155, 0.095, 0.115]),
    ]);
    b.sweep(browPath, [0.018, 0.028, 0.024, 0.008], {
      bone: head,
      color: beardPaint,
      caps: { start: "round", end: "point" },
      name: `eyebrow${side}`,
      group: "head",
    });

    // Wide Dwarven Ears with gold earrings
    const earAt = head.local([s * 0.138, 0.035, 0.02]);
    b.capsule(earAt, head.local([s * 0.168, 0.015, 0.045]), [0.024, 0.018], {
      bone: head,
      color: skinPaint,
      name: `ear${side}`,
      group: "head",
    });
    // Gold hoop earring
    b.part(new THREE.TorusGeometry(0.016, 0.0045, 6, 10), goldPaint, {
      at: head.local([s * 0.152, 0.025, -0.005]),
      rotation: [0, 75, 0],
      bone: head,
      name: `earring${side}`,
      group: "head",
    });
  }

  // Lower Jaw & Full Chin Beard Base
  b.capsule(jaw.local([-0.055, 0.04, 0.0]), jaw.local([0.055, 0.04, 0.0]), 0.055, {
    bone: jaw,
    color: beardPaint,
    name: "jawBeardMass",
    group: "beard",
  });

  // Sideburn masses framing cheeks
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const burnPath = catmull([
      head.local([s * 0.12, 0.05, 0.03]),
      head.local([s * 0.11, 0.07, -0.03]),
      head.local([s * 0.08, 0.09, -0.075]),
    ]);
    b.sweep(burnPath, [0.035, 0.046, 0.038], {
      bone: head,
      color: beardPaint,
      name: `sideburn${side}`,
      group: "beard",
    });
  }

  // Sweeping Walrus Mustache (over mustacheChains + gold rings)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mChain = mustacheChains[side];
    b.sweep(mChain, [0.032, 0.038, 0.028, 0.010], {
      color: beardPaint,
      caps: { start: "round", end: "point" },
      name: `mustacheSweep${side}`,
      group: "beard",
    });
    // Gold cuff ring near mustache tip
    const mRingPt = mChain.at(0.68);
    b.rod(offset(mRingPt.at, mRingPt.tangent, -0.012), offset(mRingPt.at, mRingPt.tangent, 0.012), 0.026, {
      bone: mRingPt.bone,
      color: goldPaint,
      sides: 8,
      name: `mustacheClasp${side}`,
      group: "beard",
    });
  }

  // Central Giant Braided Beard (3-lobed braided profile with ornate gold clasps)
  const braidMainSweep = b.sweep(
    beardMain,
    (t) => {
      const pulse = 1 + 0.14 * Math.sin(t * Math.PI * 5);
      const taper = 1 - 0.42 * t;
      return [0.072 * taper * pulse, 0.056 * taper * pulse];
    },
    {
      color: beardPaint,
      caps: { start: "round", end: "point" },
      name: "beardMainBraid",
      group: "beard",
    },
  );

  // Interwoven cross-plait volumes along main beard to make the braid silhouette pop in 3D
  for (let k = 0; k < 5; k++) {
    const t0 = 0.08 + k * 0.15;
    const side = k % 2 === 0 ? 1 : -1;
    const ptA = beardMain.at(t0);
    const ptB = beardMain.at(t0 + 0.14);
    const midPt = offset(mid(ptA.at, ptB.at), [side * 0.65, 0, 0.75], 0.038 * (1 - 0.3 * t0));
    b.sweep(catmull([ptA.at, midPt, ptB.at]), [0.032, 0.042 * (1 - 0.3 * t0), 0.028], {
      bone: ptA.bone,
      color: beardPaint,
      name: `beardPlaitLobe${k + 1}`,
      group: "beard",
    });
  }

  // Two heavy gold & rune rings clasping the central beard braid
  for (const [idx, tClasp] of [0.35, 0.74].entries()) {
    const cPt = beardMain.at(tClasp);
    const r = idx === 0 ? 0.062 : 0.048;
    b.rod(offset(cPt.at, cPt.tangent, -0.022), offset(cPt.at, cPt.tangent, 0.022), r, {
      bone: cPt.bone,
      color: goldPaint,
      sides: 8,
      name: `beardMainRing${idx + 1}`,
      group: "beard",
    });
    // Raised diamond stud on front of beard clasp
    b.stick(
      new THREE.OctahedronGeometry(0.018, 0),
      idx === 0 ? RUNE_CYAN : goldPaint,
      frame(offset(cPt.at, [0, 0, 1], r), [0, 0, 1]),
      {
        bone: cPt.bone,
        name: `beardMainGem${idx + 1}`,
        group: "beard",
      },
    );
  }

  // Twin Side Beard Braids + Gold Rings
  const sideBeardSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sChain = beardSideChains[side];
    const sw = b.sweep(
      sChain,
      (t) => {
        const pulse = 1 + 0.15 * Math.sin(t * Math.PI * 4);
        const taper = 1 - 0.45 * t;
        return [0.046 * taper * pulse, 0.042 * taper * pulse];
      },
      {
        color: beardPaint,
        caps: { start: "round", end: "point" },
        name: `beardSideBraid${side}`,
        group: "beard",
      },
    );
    sideBeardSweeps.push(sw);

    for (const [idx, tClasp] of [0.42, 0.76].entries()) {
      const cPt = sChain.at(tClasp);
      const r = idx === 0 ? 0.042 : 0.033;
      b.rod(offset(cPt.at, cPt.tangent, -0.018), offset(cPt.at, cPt.tangent, 0.018), r, {
        bone: cPt.bone,
        color: goldPaint,
        sides: 8,
        name: `beardSideRing${side}${idx + 1}`,
        group: "beard",
      });
    }
  }

  // Layered Beard Strand Cards across the beard braids for lush hand-painted wisps
  const beardHits = b.surface([braidMainSweep, ...sideBeardSweeps]).scatter(48, {
    rng: rand,
    minDist: 0.026,
    filter: (h) => h.n.z > -0.1,
  });
  b.cards(beardHits, BEARD_CARD_TEX, {
    size: [0.045, 0.08],
    lean: 68,
    bend: 20,
    flow: [0, -1, 0.15],
    vary: 0.25,
    spin: 14,
    rng: rand,
    color: beardPaint,
    name: "beardStrandCards",
    group: "beard",
  });

  // ============================================================================
  // STEEL & BEARSKIN MOUNTAINEER HOODED HELM, GOGGLES & RAM HORNS
  // ============================================================================
  // Steel Half-Helm & Brow Guard under the Fur Hood
  const helmDome = b.lathe(
    [
      [0, 0.0],
      [0.148, 0.0],
      [0.152, 0.055],
      [0.128, 0.115],
      [0.065, 0.148],
      [0, 0.155],
    ],
    {
      at: head.local([0, 0.01, 0.06]),
      axis: [0, 0.98, -0.18],
      segments: 12,
      bone: head,
      color: steelPaint,
      name: "steelHelmDome",
      group: "head",
    },
  );

  // Heavy Gold Nose Guard & Brow Rim on the Helm
  const browRimPath = catmull([
    head.local([-0.145, 0.04, 0.05]),
    head.local([-0.09, 0.135, 0.095]),
    head.local([0, 0.155, 0.105]),
    head.local([0.09, 0.135, 0.095]),
    head.local([0.145, 0.04, 0.05]),
  ]);
  b.sweep(browRimPath, 0.018, {
    bone: head,
    color: goldPaint,
    name: "helmBrowTrim",
    group: "head",
  });

  // Vertical Nose Guard Bar
  b.frustumBox(
    head.local([0, 0.158, 0.115]),
    head.local([0, 0.155, 0.042]),
    [0.034, 0.022],
    [0.026, 0.020],
    {
      bone: head,
      color: goldPaint,
      name: "helmNoseGuard",
      group: "head",
    },
  );

  // Bearskin Hood cowl draped over the back and crown of the helm
  const hoodPath = catmull([
    head.local([-0.165, 0.01, -0.02]),
    head.local([-0.155, 0.05, 0.11]),
    head.local([0, 0.06, 0.175]),
    head.local([0.155, 0.05, 0.11]),
    head.local([0.165, 0.01, -0.02]),
  ]);
  const hoodSweep = b.sweep(hoodPath, [0.045, 0.068, 0.078, 0.068, 0.045], {
    bone: head,
    color: bearPeltPaint,
    name: "bearskinHoodCowl",
    group: "head",
  });

  // Hood back drape connecting head cowl to mantle
  b.loft(
    [
      { at: head.local([0, 0.02, 0.16]), w: 0.28, h: 0.16 },
      { at: head.local([0, -0.04, 0.08]), w: 0.34, h: 0.22 },
      { at: head.local([0, -0.09, -0.04]), w: 0.36, h: 0.20 },
    ],
    {
      bone: head,
      color: cloakPaint,
      name: "hoodBackDrape",
      group: "head",
    },
  );

  // Fur cards on the bearskin hood cowl
  const hoodHits = b.surface(hoodSweep).scatter(36, {
    rng: rand,
    minDist: 0.026,
  });
  b.cards(hoodHits, FUR_CARD_TEX, {
    size: [0.048, 0.08],
    lean: 50,
    bend: 20,
    vary: 0.25,
    rng: rand,
    color: furTrimPaint,
    bone: head,
    name: "hoodFurCards",
    group: "head",
  });

  // Coiled Bighorn Ram Horns sprouting from the sides of the Helm!
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hornCurve = catmull([
      head.local([s * 0.13, 0.03, 0.10]),
      head.local([s * 0.23, 0.01, 0.12]),
      head.local([s * 0.27, -0.05, 0.03]),
      head.local([s * 0.24, -0.02, -0.05]),
      head.local([s * 0.21, 0.08, -0.02]),
      head.local([s * 0.23, 0.15, 0.04]),
    ]);
    b.sweep(hornCurve, [0.052, 0.044, 0.035, 0.026, 0.018, 0.005], {
      bone: head,
      color: hornPaint,
      sides: 8,
      caps: { start: "flat", end: "point" },
      name: `ramHorn${side}`,
      group: "head",
    });
    // Brass base collar around horn root
    b.rod(head.local([s * 0.12, 0.03, 0.10]), head.local([s * 0.155, 0.025, 0.106]), 0.056, {
      bone: head,
      color: goldPaint,
      sides: 8,
      name: `hornCollar${side}`,
      group: "head",
    });
  }

  // Dwarven Sniper Brass Goggles resting on the Forehead of the Helm!
  const goggleStrap = catmull([
    head.local([-0.148, 0.04, 0.11]),
    head.local([-0.085, 0.138, 0.142]),
    head.local([0, 0.155, 0.148]),
    head.local([0.085, 0.138, 0.142]),
    head.local([0.148, 0.04, 0.11]),
  ]);
  b.sweep(goggleStrap, 0.012, {
    bone: head,
    color: darkLeatherPaint,
    name: "goggleStrap",
    group: "head",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const gAt = head.local([s * 0.058, 0.135, 0.145]);
    const gDir: [number, number, number] = [s * 0.28, 0.35, 0.89];
    // Brass lens barrel
    b.lathe(
      [
        [0.024, 0],
        [0.038, 0],
        [0.040, 0.028],
        [0.032, 0.034],
        [0.024, 0.034],
      ],
      {
        at: gAt,
        axis: gDir,
        segments: 10,
        bone: head,
        color: goldPaint,
        name: `goggleBezel${side}`,
        group: "head",
      },
    );
    // Glowing amber-emerald rangefinder glass lens inside goggle
    glow(
      b.part(new THREE.SphereGeometry(0.026, 8, 6), s > 0 ? "#47ffa3" : "#ffb838", {
        at: offset(gAt, gDir, 0.022),
        scale: [1, 1, 0.55],
        bone: head,
        name: `goggleLens${side}`,
        group: "head",
      }),
      1.3,
    );
  }
  // Extra swing-out magnifying loupe on Left Goggle
  b.rod(head.local([0.096, 0.135, 0.152]), head.local([0.072, 0.155, 0.168]), 0.016, {
    bone: head,
    color: goldPaint,
    sides: 8,
    name: "goggleLoupeL",
    group: "head",
  });

  // ============================================================================
  // ARMS, OVERSIZED WARCRAFT GAUNTLETS & FINGERS
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[side];
    const shBone = arm.joints[0];
    const elBone = arm.joints[1];
    const hand = arm.tip!;

    // Muscular upper arm & sleeve
    b.sweep(arm, [0.082, 0.074, 0.088], {
      from: 0,
      to: 0.55,
      color: tunicPaint,
      name: `upperSleeve${side}`,
      group: `arm${side}`,
    });

    // Chainmail elbow gusset
    b.part(new THREE.SphereGeometry(0.068, 8, 6), chainmailPaint, {
      at: elBone.at,
      bone: elBone,
      name: `elbowMail${side}`,
      group: `arm${side}`,
    });

    // Heavy flared steel & leather forearm gauntlet cuff (rigid on elbow bone)
    const forearmEnd = arm.at(0.96).at;
    b.capsule(elBone.at, forearmEnd, [0.072, 0.096], {
      bone: elBone,
      color: leatherPaint,
      name: `gauntletCuff${side}`,
      group: `arm${side}`,
    });

    // Armored steel dorsal plate on forearm
    const plateA = offset(lerp(elBone.at, forearmEnd, 0.18), [s * 0.6, 0.7, -0.3], 0.032);
    const plateB = offset(lerp(elBone.at, forearmEnd, 0.92), [s * 0.6, 0.7, -0.3], 0.042);
    b.frustumBox(plateA, plateB, [0.095, 0.055], [0.125, 0.068], {
      bone: elBone,
      color: steelPaint,
      name: `gauntletPlate${side}`,
      group: `arm${side}`,
    });

    // Gold cuff band at wrist & elbow guard
    b.rod(lerp(elBone.at, forearmEnd, 0.84), forearmEnd, [0.098, 0.104], {
      bone: elBone,
      color: goldPaint,
      sides: 8,
      name: `gauntletWristBand${side}`,
      group: `arm${side}`,
    });

    // Fur trim protruding from gauntlet cuff
    b.rod(lerp(elBone.at, forearmEnd, 0.05), lerp(elBone.at, forearmEnd, 0.22), [0.084, 0.078], {
      bone: elBone,
      color: furTrimPaint,
      sides: 8,
      name: `gauntletFur${side}`,
      group: `arm${side}`,
    });

    // Chunky Heroic Dwarven Hand Palm & Knuckle Guard
    const palmCenter = offset(hand.at, [s * 0.7, -0.4, 0.1], 0.035);
    b.part(new THREE.BoxGeometry(0.088, 0.095, 0.105), darkLeatherPaint, {
      at: palmCenter,
      dir: [s * 0.85, -0.45, 0.1],
      bone: hand,
      name: `handPalm${side}`,
      group: `arm${side}`,
    });
    // Steel knuckle plate with gold studs
    b.part(new THREE.BoxGeometry(0.052, 0.082, 0.112), steelPaint, {
      at: offset(palmCenter, [s * 0.6, 0.75, 0], 0.028),
      dir: [s * 0.85, -0.45, 0.1],
      bone: hand,
      name: `knucklePlate${side}`,
      group: `arm${side}`,
    });

    // Sweep each finger & thumb chain with chunky armored segments
    for (const fRoot of fingerJoints[side]) {
      const fChild = fRoot.object.children.find((c) => c.userData?.joint) as THREE.Object3D | undefined;
      b.capsule(fRoot.at, offset(fRoot.at, fRoot.axis, 0.042), [0.022, 0.019], {
        bone: fRoot,
        color: steelPaint,
        sides: 6,
        group: `arm${side}`,
      });
      if (fChild) {
        const pChild = new THREE.Vector3().setFromMatrixPosition(fChild.matrixWorld);
        b.capsule(fRoot.at, offset(pChild, fRoot.axis, 0.028), [0.021, 0.017], {
          bone: fRoot,
          color: darkLeatherPaint,
          sides: 6,
          group: `arm${side}`,
        });
      }
    }
    void shBone;
  }

  // ============================================================================
  // LEGS, BREECHES, STEEL KNEE-GUARDS & HEAVY IRON-SHOD BOOTS
  // ============================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;

    // Thick woolen breeches on thigh
    b.capsule(hipJ.at, kneeJ.at, [0.115, 0.098], {
      bone: hipJ,
      color: leatherPaint,
      name: `thighBreeches${side}`,
      group: `leg${side}`,
    });

    // Heavy fur-topped calf boot shaft (rigid on kneeJ)
    b.capsule(kneeJ.at, ankleJ.at, [0.102, 0.095], {
      bone: kneeJ,
      color: darkLeatherPaint,
      name: `bootShaft${side}`,
      group: `leg${side}`,
    });

    // Thick cream fur cuff below the knee
    b.rod(lerp(kneeJ.at, ankleJ.at, 0.08), lerp(kneeJ.at, ankleJ.at, 0.28), [0.112, 0.106], {
      bone: kneeJ,
      color: furTrimPaint,
      sides: 10,
      name: `bootFurCuff${side}`,
      group: `leg${side}`,
    });

    // Ornate Steel & Gold Knee Guard (Poleyn) with central spike
    const kneeFront = offset(kneeJ.at, [s * 0.18, 0.12, 0.96], 0.092);
    const kneeOutline: OutlinePoint[] = [
      [-0.062, -0.045],
      [0.0, -0.068, "sharp"],
      [0.062, -0.045],
      [0.072, 0.015],
      [0.0, 0.065, "sharp"],
      [-0.072, 0.015],
    ];
    b.extrude(kneeOutline, {
      at: kneeFront,
      x: [1, 0, -s * 0.18],
      y: [0, 1, -0.12],
      thickness: 0.032,
      bevel: 0.008,
      smoothing: 1,
      bone: kneeJ,
      color: steelPaint,
      name: `kneePlate${side}`,
      group: `leg${side}`,
    });
    b.spike(kneeFront, [s * 0.15, 0.1, 1], 0.042, 0.022, {
      bone: kneeJ,
      color: goldPaint,
      sides: 6,
      name: `kneeSpike${side}`,
      group: `leg${side}`,
    });

    // Leather straps & brass buckles across boot shin
    for (const tStrap of [0.45, 0.72]) {
      const sPt = lerp(kneeJ.at, ankleJ.at, tStrap);
      b.rod(offset(sPt, [0, 1, 0], -0.014), offset(sPt, [0, 1, 0], 0.014), 0.102, {
        bone: kneeJ,
        color: leatherPaint,
        sides: 8,
        name: `bootStrap${side}${Math.round(tStrap * 10)}`,
        group: `leg${side}`,
      });
      b.part(new THREE.BoxGeometry(0.032, 0.034, 0.022), goldPaint, {
        at: offset(sPt, [s * 0.35, 0, 0.92], 0.098),
        bone: kneeJ,
        name: `bootBuckle${side}${Math.round(tStrap * 10)}`,
        group: `leg${side}`,
      });
    }

    // Massive Chunky Iron-Shod Boot Foot (Planted flat on y = 0)
    const fx = ankleJ.at.x;
    const fz = ankleJ.at.z;
    const toeOut = s * 0.018;

    // Flat heavy sole block resting right at y = 0
    b.frustumBox(
      [fx + toeOut * 0.2, 0.0, fz + 0.035],
      [fx + toeOut * 0.2, 0.042, fz + 0.035],
      [0.165, 0.27],
      [0.155, 0.255],
      {
        bone: ankleJ,
        up: [toeOut, 0, 1],
        color: IRON_DARK,
        name: `bootSole${side}`,
        group: `leg${side}`,
      },
    );

    // Armored Boot Vamp & Bulbous Steel Toe Cap
    b.loft(
      [
        { at: [fx, 0.075, fz - 0.065], w: 0.145, h: 0.11 },
        { at: [fx + toeOut * 0.3, 0.072, fz + 0.04], w: 0.158, h: 0.115 },
        { at: [fx + toeOut * 0.6, 0.058, fz + 0.135], w: 0.142, h: 0.095 },
      ],
      {
        bone: ankleJ,
        color: darkLeatherPaint,
        name: `bootUpper${side}`,
        group: `leg${side}`,
      },
    );

    // Steel Toe Cap Plate with Gold Trim & Rivets
    b.capsule(
      [fx + toeOut * 0.5, 0.052, fz + 0.085],
      [fx + toeOut * 0.7, 0.048, fz + 0.148],
      [0.078, 0.068],
      {
        bone: ankleJ,
        color: steelPaint,
        name: `bootSteelToe${side}`,
        group: `leg${side}`,
      },
    );
    b.spike(
      [fx + toeOut * 0.75, 0.052, fz + 0.175],
      [toeOut, 0.2, 1],
      0.034,
      0.018,
      {
        bone: ankleJ,
        color: goldPaint,
        sides: 6,
        name: `bootToeSpike${side}`,
        group: `leg${side}`,
      },
    );
  }

  // ============================================================================
  // BELT GEAR: OAK POWDER KEG, LEATHER AMMO POUCH & TANKARD
  // ============================================================================
  // Left Hip (+X): Oak Black-Powder Keg with Iron Hoops, Brass Spigot & Coiled Match Cord
  const kegCenter: [number, number, number] = [0.245, 0.43, -0.06];
  const kegDir: [number, number, number] = [0.15, 0.22, 0.96];
  b.lathe(
    [
      [0, -0.105],
      [0.068, -0.105],
      [0.086, -0.055],
      [0.092, 0.0],
      [0.086, 0.055],
      [0.068, 0.105],
      [0, 0.105],
    ],
    {
      at: kegCenter,
      axis: kegDir,
      segments: 10,
      bone: hips,
      color: woodPaint,
      name: "powderKegBody",
      group: "gear",
    },
  );
  // Iron barrel hoops on the powder keg
  for (const hOff of [-0.075, -0.028, 0.028, 0.075]) {
    const rHoop = Math.abs(hOff) > 0.05 ? 0.082 : 0.093;
    const pH = offset(kegCenter, kegDir, hOff);
    b.rod(offset(pH, kegDir, -0.008), offset(pH, kegDir, 0.008), rHoop, {
      bone: hips,
      color: steelPaint,
      sides: 10,
      name: `kegHoop${Math.round((hOff + 0.1) * 100)}`,
      group: "gear",
    });
  }
  // Brass spigot tap on front of keg
  const kegFront = offset(kegCenter, kegDir, 0.105);
  b.rod(kegFront, offset(kegFront, kegDir, 0.035), 0.016, {
    bone: hips,
    color: goldPaint,
    sides: 6,
    name: "kegSpigot",
    group: "gear",
  });
  b.rod(
    offset(kegFront, [0, 1, 0], 0.025),
    offset(kegFront, [0, -1, 0], 0.015),
    0.009,
    {
      bone: hips,
      color: goldPaint,
      sides: 6,
      name: "kegValveHandle",
      group: "gear",
    },
  );

  // Right Hip (-X): Heavy Stitched Leather Shot Pouch & Horn Powder Flask
  const pouchPos: [number, number, number] = [-0.235, 0.43, 0.04];
  b.loft(
    [
      { at: [pouchPos[0], pouchPos[1] - 0.065, pouchPos[2]], w: 0.095, h: 0.11 },
      { at: [pouchPos[0], pouchPos[1], pouchPos[2]], w: 0.11, h: 0.13 },
      { at: [pouchPos[0], pouchPos[1] + 0.055, pouchPos[2]], w: 0.085, h: 0.10 },
    ],
    {
      bone: hips,
      color: leatherPaint,
      name: "ammoPouch",
      group: "gear",
    },
  );
  // Flap & brass clasp on ammo pouch
  b.part(new THREE.BoxGeometry(0.098, 0.048, 0.115), darkLeatherPaint, {
    at: [pouchPos[0] - 0.008, pouchPos[1] + 0.04, pouchPos[2]],
    bone: hips,
    name: "ammoPouchFlap",
    group: "gear",
  });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6), goldPaint, {
    at: [pouchPos[0] - 0.052, pouchPos[1] + 0.01, pouchPos[2]],
    rotation: [0, 0, 90],
    bone: hips,
    name: "ammoPouchButton",
    group: "gear",
  });

  // Curved Powder Horn Flask hanging beside the pouch
  const flaskCurve = catmull([
    [-0.22, 0.48, -0.07],
    [-0.26, 0.40, -0.12],
    [-0.23, 0.32, -0.17],
    [-0.18, 0.29, -0.20],
  ]);
  b.sweep(flaskCurve, [0.036, 0.030, 0.018, 0.005], {
    bone: hips,
    color: hornPaint,
    sides: 8,
    caps: { start: "flat", end: "point" },
    name: "powderHornFlask",
    group: "gear",
  });
  b.rod([-0.215, 0.495, -0.06], [-0.225, 0.47, -0.075], 0.038, {
    bone: hips,
    color: goldPaint,
    sides: 8,
    name: "powderHornNozzle",
    group: "gear",
  });

  // ============================================================================
  // HEROIC DWARVEN BLUNDERBUSS ("BOOMSTICK" HELD IN RIGHT HAND)
  // ============================================================================
  // Massive Warcraft-proportioned rifle: heavy carved walnut stock with gold buttplate,
  // ornate receiver with flintlock hammer & glowing forge-coal pan, iron barrel bands,
  // telescope rangefinder sight, under-barrel bayonet/ramrod, and huge octagonal brass bell muzzle!
  const pButt = gunFrame.local([0, -0.28, -0.07]);
  const pGrip = gunFrame.local([0, -0.07, -0.025]);
  const pReceiver = gunFrame.local([0, 0.05, 0.015]);
  const pForend = gunFrame.local([0, 0.28, 0.01]);
  const pMidBarrel = gunFrame.local([0, 0.44, 0.022]);
  const pMuzzleNeck = gunFrame.local([0, 0.56, 0.022]);
  const pMuzzleBell = gunFrame.local([0, 0.72, 0.022]);

  // 1. Heavy Carved Walnut Rifle Stock & Forend
  const stockStations = [
    { at: pButt, w: 0.075, h: 0.165 },
    { at: lerp(pButt, pGrip, 0.55), w: 0.068, h: 0.125 },
    { at: pGrip, w: 0.058, h: 0.085 },
    { at: pReceiver, w: 0.078, h: 0.105 },
    { at: pForend, w: 0.072, h: 0.082 },
    { at: lerp(pForend, pMuzzleNeck, 0.65), w: 0.058, h: 0.062 },
  ];
  b.loft(stockStations, {
    bone: handR,
    up: gunFrame.dir([0, 0, 1]),
    color: woodPaint,
    name: "blunderbussStock",
    group: "blunderbuss",
  });

  // Heavy Gold Armored Buttplate with Ram-Skull Rivets
  b.frustumBox(
    offset(pButt, gunDir, -0.032),
    offset(pButt, gunDir, 0.018),
    [0.082, 0.176],
    [0.078, 0.168],
    {
      bone: handR,
      up: gunFrame.dir([0, 0, 1]),
      color: goldPaint,
      name: "gunButtplate",
      group: "blunderbuss",
    },
  );

  // Dwarven Rune Medallion inset into the side of the wooden stock
  const stockMedallionAt = gunFrame.local([0.041, -0.18, -0.05]);
  b.part(new THREE.CircleGeometry(0.042, 6), "#ffffff", {
    at: stockMedallionAt,
    dir: gunFrame.dir([1, 0, 0]),
    up: gunFrame.dir([0, 0, 1]),
    axis: "z",
    bone: handR,
    texture: DWARF_RUNE_TEX,
    name: "stockRunePlate",
    group: "blunderbuss",
  });

  // 2. Armored Iron Receiver Chamber & Breech Block
  b.frustumBox(
    gunFrame.local([0, -0.03, 0.025]),
    gunFrame.local([0, 0.17, 0.025]),
    [0.088, 0.105],
    [0.084, 0.098],
    {
      bone: handR,
      up: gunFrame.dir([0, 0, 1]),
      color: steelPaint,
      name: "gunReceiver",
      group: "blunderbuss",
    },
  );

  // Brass Trigger Guard & Trigger
  const trigGuardCurve = catmull([
    gunFrame.local([0, -0.07, -0.045]),
    gunFrame.local([0, -0.01, -0.085]),
    gunFrame.local([0, 0.06, -0.042]),
  ]);
  b.sweep(trigGuardCurve, 0.009, {
    bone: handR,
    color: goldPaint,
    sides: 6,
    name: "triggerGuard",
    group: "blunderbuss",
  });
  b.spike(gunFrame.local([0, 0.01, -0.035]), gunFrame.dir([0, -0.4, -1]), 0.035, 0.008, {
    bone: handR,
    color: steelPaint,
    sides: 5,
    name: "gunTrigger",
    group: "blunderbuss",
  });

  // 3. Flintlock Hammer / Ignition Pan with Glowing Forge Ember (on hinge joint flintCockJoint)
  b.rod(
    flintCockJoint.at,
    offset(flintCockJoint.at, gunFrame.dir([1, 0, 0]), 0.024),
    0.022,
    {
      bone: flintCockJoint,
      color: goldPaint,
      sides: 8,
      name: "flintLockPivot",
      group: "blunderbuss",
    },
  );
  const hammerArm = catmull([
    flintCockJoint.at,
    offset(flintCockJoint.at, gunFrame.dir([0.2, 0.25, 0.95]), 0.055),
    offset(flintCockJoint.at, gunFrame.dir([0.0, 0.75, 0.75]), 0.078),
  ]);
  b.sweep(hammerArm, [0.016, 0.014, 0.020], {
    bone: flintCockJoint,
    color: steelPaint,
    sides: 6,
    name: "flintHammerArm",
    group: "blunderbuss",
  });
  // Glowing Ignited Ember / Arcane Flint Crystal in the jaws of the hammer!
  glow(
    b.part(new THREE.OctahedronGeometry(0.022, 0), EMBER_GLOW, {
      at: offset(flintCockJoint.at, gunFrame.dir([0.0, 0.85, 0.65]), 0.084),
      bone: flintCockJoint,
      name: "flintEmberStone",
      group: "blunderbuss",
    }),
    1.8,
  );

  // Flash pan with glowing coal bed on side of receiver
  const panPos = gunFrame.local([0.052, 0.08, 0.045]);
  b.rod(
    offset(panPos, gunFrame.dir([0, 0, 1]), -0.015),
    offset(panPos, gunFrame.dir([0, 0, 1]), 0.005),
    0.024,
    {
      bone: handR,
      color: goldPaint,
      sides: 8,
      name: "flashPanCup",
      group: "blunderbuss",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.016, 6, 5), "#ff9429", {
      at: offset(panPos, gunFrame.dir([0, 0, 1]), 0.006),
      bone: handR,
      name: "flashPanEmber",
      group: "blunderbuss",
    }),
    1.5,
  );

  // 4. Heavy Octagonal Barrel & Flared Brass Dragon-Mouth Bell Muzzle
  b.rod(
    gunFrame.local([0, 0.14, 0.032]),
    pMuzzleNeck,
    [0.048, 0.042],
    {
      bone: handR,
      color: gunmetalPaint,
      section: { ngon: 8 },
      name: "blunderbussBarrel",
      group: "blunderbuss",
    },
  );

  // Glowing Dwarven Rune Decal etched along the Octagonal Barrel
  for (const s of [1, -1]) {
    const runePlaneAt = gunFrame.local([s * 0.044, 0.36, 0.034]);
    glow(
      b.part(new THREE.PlaneGeometry(0.18, 0.048), "#ffffff", {
        at: runePlaneAt,
        dir: gunFrame.dir([s, 0, 0]),
        up: gunFrame.dir([0, 0, 1]),
        axis: "z",
        bone: handR,
        texture: BARREL_RUNE_TEX,
        name: `barrelRuneEtch${s > 0 ? "L" : "R"}`,
        group: "blunderbuss",
      }),
      1.6,
    );
  }

  // Three heavy Brass Barrel Bands clamping barrel to stock
  for (const [idx, yBand] of [0.20, 0.34, 0.48].entries()) {
    const bStart = gunFrame.local([0, yBand - 0.018, 0.02]);
    const bEnd = gunFrame.local([0, yBand + 0.018, 0.02]);
    b.frustumBox(bStart, bEnd, [0.088, 0.104], [0.086, 0.102], {
      bone: handR,
      up: gunFrame.dir([0, 0, 1]),
      color: goldPaint,
      name: `barrelBand${idx + 1}`,
      group: "blunderbuss",
    });
  }

  // Iconic Flared Blunderbuss Bell Muzzle (Lathe shell with recessed dark bore & glowing ember throat)
  const bellStart = gunFrame.local([0, 0.54, 0.032]);
  b.lathe(
    [
      [0.022, 0.0],
      [0.044, 0.0],
      [0.052, 0.06],
      [0.072, 0.12],
      [0.108, 0.175],
      [0.114, 0.195],
      [0.095, 0.202],
      [0.072, 0.185],
      [0.035, 0.08],
      [0.022, 0.02],
    ],
    {
      at: bellStart,
      axis: gunDir,
      segments: 10,
      bone: handR,
      color: goldPaint,
      name: "blunderbussBellMuzzle",
      group: "blunderbuss",
    },
  );

  // Heavy Iron Reinforcing Lip & Front Iron Sight Blade on the Bell Muzzle
  const bellLipAt = offset(bellStart, gunDir, 0.178);
  b.rod(offset(bellLipAt, gunDir, -0.012), offset(bellLipAt, gunDir, 0.012), 0.112, {
    bone: handR,
    color: steelPaint,
    sides: 10,
    name: "muzzleReinforceRing",
    group: "blunderbuss",
  });
  b.spike(
    offset(bellLipAt, gunFrame.dir([0, 0, 1]), 0.105),
    gunFrame.dir([0, 0.3, 1]),
    0.045,
    0.016,
    {
      bone: handR,
      color: goldPaint,
      sides: 6,
      name: "frontSightBlade",
      group: "blunderbuss",
    },
  );

  // Glowing molten-orange combustion heart deep inside the blunderbuss bore
  glow(
    b.part(new THREE.CircleGeometry(0.042, 8), EMBER_GLOW, {
      at: offset(bellStart, gunDir, 0.085),
      dir: gunDir,
      axis: "z",
      bone: handR,
      name: "muzzleBoreGlow",
      group: "blunderbuss",
    }),
    1.8,
  );

  // Under-barrel Iron Ramrod & Broad Cleaver Bayonet Lug
  b.rod(
    gunFrame.local([0, 0.22, -0.025]),
    gunFrame.local([0, 0.62, -0.025]),
    [0.012, 0.015],
    {
      bone: handR,
      color: steelPaint,
      sides: 6,
      name: "underBarrelRamrod",
      group: "blunderbuss",
    },
  );

  // Wicked Dwarven Under-Barrel Axe-Bayonet Blade
  const bayonetOutline: OutlinePoint[] = [
    [0.0, 0.0],
    [0.18, 0.0],
    [0.24, -0.035, "sharp"],
    [0.19, -0.085, "sharp"],
    [0.08, -0.075],
    [0.02, -0.035],
  ];
  b.extrude(bayonetOutline, {
    at: gunFrame.local([0, 0.48, -0.032]),
    x: gunDir,
    y: gunFrame.dir([0, 0, 1]),
    thickness: [0.004, 0.018],
    bevel: 0.003,
    smoothing: 1,
    bone: handR,
    color: steelPaint,
    name: "bayonetBlade",
    group: "blunderbuss",
  });

  // Top-Mounted Brass Telescopic Sniper Sight on Receiver
  const scopeStart = gunFrame.local([0, 0.02, 0.095]);
  const scopeEnd = gunFrame.local([0, 0.26, 0.095]);
  b.rod(scopeStart, scopeEnd, [0.024, 0.030], {
    bone: handR,
    color: goldPaint,
    sides: 8,
    name: "rifleScopeTube",
    group: "blunderbuss",
  });
  // Scope mounting brackets
  for (const yBr of [0.06, 0.21]) {
    b.frustumBox(
      gunFrame.local([0, yBr, 0.055]),
      gunFrame.local([0, yBr, 0.095]),
      [0.026, 0.022],
      [0.034, 0.022],
      {
        bone: handR,
        up: gunFrame.dir([0, 0, 1]),
        color: steelPaint,
        name: `scopeMount${Math.round(yBr * 100)}`,
        group: "blunderbuss",
      },
    );
  }
  // Glowing cyan lenses at both ends of the rifle scope
  glow(
    b.part(new THREE.CircleGeometry(0.025, 8), RUNE_CYAN, {
      at: offset(scopeEnd, gunDir, 0.003),
      dir: gunDir,
      axis: "z",
      bone: handR,
      name: "scopeFrontLens",
      group: "blunderbuss",
    }),
    1.5,
  );
  glow(
    b.part(new THREE.CircleGeometry(0.020, 8), RUNE_CYAN, {
      at: offset(scopeStart, gunDir, -0.003),
      dir: gunFrame.dir([0, -1, 0]),
      axis: "z",
      bone: handR,
      name: "scopeRearLens",
      group: "blunderbuss",
    }),
    1.4,
  );

  // Unused variables check cleanup
  void belly;
  void helmDome;
  void pMidBarrel;
  void pMuzzleBell;
  void BRASS_WARM;

  return b.root;
}
