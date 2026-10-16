import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, gradient, mix, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, inkLines, shadowOf, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Celestial Qilin",
  description:
    "High-fantasy anime Qilin chimera with cel-shaded jade dragon scales, branching coral-gold antlers, billowing ruyi cloud mane, cloven golden hooves, and floating celestial regalia.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin", detail: 1, paintSize: 2048 });
  const rand = rng(202505);

  // ---------------------------------------------------------------------------
  // Palette & Cel-Shaded Paints (kits/toon + src/paint)
  // ---------------------------------------------------------------------------
  const JADE_LIT = "#1ed6b8";
  const JADE_MID = "#15b8a6";
  const JADE_LIGHT = "#4df5d8";
  const JADE_EDGE = "#0b525b";
  const AZURE_DARK = "#1c3b82";
  const CREAM_HEX = "#fff8ec";
  const CREAM_SHADOW = "#dfc5dc";
  const GOLD_HEX = "#ffd452";
  const GOLD_SHADOW = "#c47418";
  const CORAL_HEX = "#ff6448";
  const VERMILION_HEX = "#ef3b4d";
  const CLOUD_HEX = "#f2fbff";
  const CLOUD_SHADOW = "#9ec8eb";
  const GLOW_CYAN = "#63fff2";
  const GLOW_GOLD = "#ffe985";

  const PEARL_CREAM = cel(CREAM_HEX, CREAM_SHADOW);
  const IMPERIAL_GOLD = inkLines(cel(GOLD_HEX, GOLD_SHADOW), {
    levels: [-0.65, 0.72],
    axis: [0, 1, 0],
    width: 0.045,
    ink: "#592b08",
  });
  const DARK_HOOF = cel("#2e2040", INK);
  const VERMILION = cel(VERMILION_HEX, "#991732");
  const CLOUD_MANE = cel(
    paint((p, n) => {
      const wisp = noise(p, 0.14, 31);
      const rim = smoothstep(0.25, 0.85, n.y * 0.5 + 0.5 + (wisp - 0.5) * 0.35);
      return mix("#d4f4ff", CLOUD_HEX, rim);
    }),
    CLOUD_SHADOW,
  );
  const CLOUD_TURQUOISE = cel(
    paint((p, _n, s) => {
      const t = s[0];
      return mix(CLOUD_HEX, JADE_LIGHT, smoothstep(0.35, 0.92, t));
    }),
    "#5ba8c4",
  );

  // Dragon scale pattern for the upper coat
  const rawScales = scales([JADE_LIT, JADE_MID, JADE_LIGHT], JADE_EDGE, {
    size: 0.048,
    width: 0.15,
    seed: 19,
  });

  // Full body coat: sapphire-indigo dorsal stripe -> jade dragon scales -> gold border -> pearl cream belly
  const QILIN_COAT = cel(
    paint((p, n, s) => {
      const deg = Math.min(s[1], 360 - s[1]); // 0 on dorsal ridge, 180 on belly
      const tooth = zigzag(p.z / 0.045) * 10;
      const dorsalEdge = 28 + tooth * 0.6;
      const bellyEdge = 118 + tooth;

      // Subtle glowing-look gold cloud rosette spots on flanks
      const flankCell = cells(p, 0.16, 77);
      const inFlank = deg > 38 && deg < 102 && p.z > -0.45 && p.z < 0.42;
      if (inFlank && flankCell.id > 0.62 && flankCell.d1 < 0.24 && flankCell.d1 > 0.12) {
        return GOLD_HEX;
      }

      if (deg < dorsalEdge && n.y > 0.15) {
        return Math.abs(deg - dorsalEdge) < 3.2 ? GOLD_HEX : AZURE_DARK;
      }
      if (deg > bellyEdge || n.y < -0.32) {
        // Ventral scute ribs along the belly and throat
        const rib = Math.abs(((p.z * 18) % 1 + 1) % 1 - 0.5);
        return rib < 0.07 ? "#ebd5c8" : CREAM_HEX;
      }
      if (Math.abs(deg - bellyEdge) < 4.5) {
        return GOLD_HEX;
      }
      return rawScales.at(p, n, s);
    }),
  );

  // Leg coat: jade scales at top, toothed gold-inked transition to pearl-white stockings above golden bracers
  const LEG_COAT = cel(
    paint((p, n, s) => {
      const tooth = 0.028 * zigzag(p.x / 0.025 + p.z / 0.025);
      const lineY = 0.56 + tooth;
      if (Math.abs(p.y - lineY) < 0.008) return GOLD_HEX;
      if (p.y < lineY) {
        return p.y < 0.24 ? GOLD_HEX : CREAM_HEX;
      }
      return rawScales.at(p, n, s);
    }),
  );

  // Head coat: jade dragon scales on cranium & bridge, cream lower muzzle & cheeks with gold trim
  const HEAD_COAT = cel(
    furEdge(rawScales, CREAM_HEX, {
      axis: [0, 1, 0.15],
      level: -0.08,
      teeth: 0.22,
      period: 0.028,
      along: [0, 0, 1],
      ink: GOLD_HEX,
      inkWidth: 0.055,
    }),
  );

  // Sacred coral-gold gradient for branching dragon antlers
  const ANTLER_PAINT = cel(
    gradient(
      GOLD_HEX,
      CORAL_HEX,
      [0, 1.82, 0.58],
      [0, 2.22, 0.24],
    ),
    shadowOf(CORAL_HEX),
  );

  // ---------------------------------------------------------------------------
  // SVG Textures (Anime Eyes, Cloud-Flame Locks, Celestial Runes)
  // ---------------------------------------------------------------------------
  const EYE_TEX = animeEye({
    iris: "#ff5e36",
    irisLight: "#ffe36e",
    irisDark: "#6e122e",
    blush: "#ff85a2",
    brow: false, // We sculpt dramatic 3D golden flame-brows
    size: 512,
  });

  // Auspicious cloud-flame hair card texture (double-sided via b.cards)
  const CLOUD_CARD_TEX = svg(
    `<svg viewBox="0 0 96 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 156 C22 140 12 108 18 76 C22 52 38 38 34 18 C48 28 60 44 62 64 C72 52 82 36 78 14 C88 38 86 76 74 108 C66 130 58 146 48 156 Z"
        fill="#eefbff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M36 22 C46 34 54 50 54 68 C66 56 76 40 76 18 C82 40 80 68 70 94 C62 76 48 64 38 78 C30 60 32 40 36 22 Z"
        fill="#66f7e6"/>
      <path d="M46 136 C32 116 28 88 38 68 C48 52 60 62 56 80 C52 94 40 92 42 78"
        fill="none" stroke="#ffd452" stroke-width="4.2" stroke-linecap="round"/>
      <circle cx="58" cy="40" r="4.5" fill="#ffd452"/>
    </svg>`,
    { size: 256 },
  );

  // Sacred golden scale-feather plume card for tail and fetlocks
  const PLUME_CARD_TEX = svg(
    `<svg viewBox="0 0 96 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 156 C20 132 14 88 26 48 C34 22 48 6 48 6 C48 6 62 22 70 48 C82 88 76 132 48 156 Z"
        fill="#fff8ec" stroke="${INK}" stroke-width="4"/>
      <path d="M48 12 C56 32 64 62 58 96 C54 118 48 140 48 140 C48 140 42 118 38 96 C32 62 40 32 48 12 Z"
        fill="#27e8c8"/>
      <path d="M48 14 L48 144 M34 62 Q48 46 62 62 M32 94 Q48 78 64 94"
        fill="none" stroke="#ffd452" stroke-width="3.6" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Forehead sacred third-eye / diamond rune decal
  const FOREHEAD_RUNE_TEX = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L54 48 L32 90 L10 48 Z" fill="#ffd452" stroke="${INK}" stroke-width="4"/>
      <path d="M32 18 L44 48 L32 78 L20 48 Z" fill="#5cffef"/>
      <circle cx="32" cy="48" r="6" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // 1. SKELETON (Root, Spine, Neck, Head, Jaw, Ears, Antlers, Whiskers, Tail, 4 Legs, Ribbons)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 1.12, -0.46],
    dir: [0, 0.04, 1],
    role: "spine",
    group: "torso",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.13, -0.24],
      [0, 1.11, 0.02],
      [0, 1.15, 0.25],
      [0, 1.23, 0.45],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest", "shoulders"],
      role: "spine",
      group: "torso",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.23, 0.45],
      [0, 1.42, 0.56],
      [0, 1.60, 0.61],
      [0, 1.74, 0.67],
    ]),
    {
      parent: spine,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
      group: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.74, 0.67],
    dir: [0, -0.16, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.66, 0.74],
    dir: [0, -0.32, 1],
    role: "jaw",
    group: "head",
  });

  // Tail chain: sweeping S-curve behind the croup
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.14, -0.56],
      [0, 1.20, -0.82],
      [0, 1.38, -1.08],
      [0, 1.60, -1.24],
      [0, 1.78, -1.30],
      [0, 1.88, -1.18],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  // Paired head appendages & 4 legs
  const ears: Record<string, ReturnType<typeof b.joint>> = {};
  const antlers: Record<string, ReturnType<typeof b.chain>> = {};
  const whiskers: Record<string, ReturnType<typeof b.chain>> = {};
  const ribbons: Record<string, ReturnType<typeof b.chain>> = {};
  const frontLegs: Record<string, ReturnType<typeof b.chain>> = {};
  const hindLegs: Record<string, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    ears[side] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.105, 1.80, 0.64],
      dir: [s * 0.75, 0.45, -0.5],
      role: "hinge",
      group: `ear${side}`,
    });

    antlers[side] = b.chain(
      `antler${side}`,
      catmull([
        [s * 0.068, 1.83, 0.66],
        [s * 0.15, 2.01, 0.46],
        [s * 0.21, 2.22, 0.22],
      ]),
      {
        parent: head,
        names: [`antlerBase${side}`, `antlerMid${side}`],
        role: "fan",
        group: `antler${side}`,
      },
    );

    whiskers[side] = b.chain(
      `whisker${side}`,
      catmull([
        [s * 0.072, 1.68, 0.94],
        [s * 0.19, 1.62, 0.90],
        [s * 0.28, 1.50, 0.76],
        [s * 0.34, 1.44, 0.60],
      ]),
      {
        parent: head,
        names: [`whisker1${side}`, `whisker2${side}`, `whisker3${side}`],
        role: "tentacle",
        group: `whisker${side}`,
      },
    );

    ribbons[side] = b.chain(
      `ribbon${side}`,
      catmull([
        [s * 0.22, 1.24, 0.42],
        [s * 0.36, 1.48, 0.16],
        [s * 0.32, 1.62, -0.24],
        [s * 0.25, 1.46, -0.66],
        [s * 0.30, 1.56, -1.04],
      ]),
      {
        parent: spine,
        names: [`ribbon1${side}`, `ribbon2${side}`, `ribbon3${side}`, `ribbon4${side}`],
        role: "tentacle",
        group: `ribbon${side}`,
      },
    );

    // Foreleg IK: shoulder -> elbow -> carpus -> fetlock (at y = 0.072)
    const fFootX = s * 0.205;
    const fFootZ = 0.43;
    const fPts = limb(
      [s * 0.195, 1.13, 0.39],
      [fFootX, 0.072, fFootZ],
      [0.38, 0.41, 0.36],
      [
        [0, -0.15, -1],
        [0, 0.1, 1],
      ],
    );
    frontLegs[side] = b.chain(`legF${side}`, fPts, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `carpus${side}`, `fetlockF${side}`],
      role: "leg",
      contact: [fFootX, 0, fFootZ],
      group: `legF${side}`,
    });

    // Hindleg IK: hip -> stifle -> hock -> fetlock (at y = 0.072)
    const hFootX = s * 0.215;
    const hFootZ = -0.52;
    const hPts = limb(
      [s * 0.205, 1.08, -0.44],
      [hFootX, 0.072, hFootZ],
      [0.40, 0.42, 0.36],
      [
        [0, 0.15, 1],
        [0, 0.1, -1],
      ],
    );
    hindLegs[side] = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`],
      role: "leg",
      contact: [hFootX, 0, hFootZ],
      group: `legH${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. TORSO & NECK (Smooth-skinned continuous loft + ventral chest plates)
  // ---------------------------------------------------------------------------
  const bodyStations = [
    { at: [0, 1.13, -0.60], w: 0.22, h: 0.22 },
    { at: [0, 1.13, -0.44], w: 0.42, h: 0.42 },
    { at: [0, 1.11, -0.20], w: 0.38, h: 0.40 },
    { at: [0, 1.09, 0.04], w: 0.36, h: 0.39 },
    { at: [0, 1.15, 0.28], w: 0.44, h: 0.46 },
    { at: [0, 1.24, 0.46], w: 0.40, h: 0.42 },
    { at: [0, 1.42, 0.56], w: 0.26, h: 0.29 },
    { at: [0, 1.60, 0.61], w: 0.22, h: 0.24 },
    { at: [0, 1.74, 0.67], w: 0.20, h: 0.21 },
  ];

  const bodyLoft = b.loft(bodyStations, {
    bone: [hips, spine, neck],
    color: QILIN_COAT,
    sides: 12,
    group: "torso",
    name: "bodyLoft",
  });

  // Sculpted ventral dragon-scale chest & throat plastron along the underside of the neck & chest
  const plastronPath = bodyLoft.line(180, -0.008).slice(0.45, 0.96);
  b.sweep(
    plastronPath,
    (t) => {
      const u = (t - 0.45) / 0.51;
      const w = 0.115 * (1 - 0.38 * u);
      return [w, 0.032];
    },
    {
      bone: [spine, neck],
      color: PEARL_CREAM,
      sides: 8,
      group: "neck",
      name: "throatPlastron",
    },
  );

  // Golden chevron collar / sacred pectoral around the chest
  const bodySurface = b.surface(bodyLoft);
  const collarPath = catmull(
    [
      [0, 1.38, 0.45],
      [0.21, 1.24, 0.48],
      [0, 1.02, 0.62],
      [-0.21, 1.24, 0.48],
    ],
    { closed: true },
  );
  const drapedCollar = bodySurface.drape(collarPath, { lift: 0.014 });
  b.sweep(drapedCollar, 0.024, {
    bone: spine.joints[2],
    color: IMPERIAL_GOLD,
    sides: 6,
    detail: 0.6,
    group: "regalia",
    name: "pectoralCollar",
  });

  // Crimson sacred rope knotted over the golden collar
  b.sweep(bodySurface.drape(collarPath, { lift: 0.026 }), 0.013, {
    bone: spine.joints[2],
    color: VERMILION,
    sides: 5,
    detail: 0.5,
    group: "regalia",
    name: "sacredRope",
  });

  // Central chest spirit-bell & glowing jade orb on the collar front
  const chestFront: V3 = [0, 1.05, 0.64];
  b.part(new THREE.OctahedronGeometry(0.062, 1), IMPERIAL_GOLD, {
    bone: spine.joints[2],
    at: chestFront,
    scale: [1.1, 1.25, 0.8],
    flat: true,
    group: "regalia",
    name: "chestMedallion",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.042, 1), GLOW_CYAN, {
      bone: spine.joints[2],
      at: [0, 1.05, 0.675],
      flat: true,
      group: "regalia",
      name: "chestSpiritOrb",
    }),
    1.6,
  );
  // Hanging golden tassel under the chest medallion
  b.spike([0, 0.99, 0.64], [0, -1, 0.08], 0.14, 0.028, {
    bone: spine.joints[2],
    color: VERMILION,
    sides: 6,
    detail: 0.5,
    group: "regalia",
    name: "chestTassel",
  });

  // ---------------------------------------------------------------------------
  // 3. DRAGON-STAG HEAD, JAW, ANIME EYES, ANTLERS & CLOUD BEARD
  // ---------------------------------------------------------------------------
  // Cranium & upper snout loft
  const headLoft = b.loft(
    [
      { at: [0, 1.75, 0.63], w: 0.22, h: 0.21 },
      { at: [0, 1.75, 0.75], w: 0.23, h: 0.21 },
      { at: [0, 1.71, 0.88], w: 0.16, h: 0.14 },
      { at: [0, 1.69, 0.99], w: 0.13, h: 0.11 },
      { at: [0, 1.70, 1.05], w: 0.11, h: 0.09 },
    ],
    {
      bone: head,
      color: HEAD_COAT,
      sides: 10,
      group: "head",
      name: "headSkull",
    },
  );

  // Flared dragon nose bridge & golden muzzle rim
  b.sweep(
    catmull([
      [0, 1.81, 0.74],
      [0, 1.76, 0.88],
      [0, 1.74, 1.03],
    ]),
    [0.042, 0.028, 0.036],
    {
      bone: head,
      color: IMPERIAL_GOLD,
      sides: 6,
      detail: 0.6,
      group: "head",
      name: "noseBridgeCrest",
    },
  );

  // Upper dragon lip moustache scroll on both sides
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [0, 1.68, 1.05],
        [s * 0.068, 1.67, 0.98],
        [s * 0.095, 1.68, 0.85],
        [s * 0.125, 1.72, 0.76],
      ]),
      [0.022, 0.026, 0.016],
      {
        bone: head,
        color: IMPERIAL_GOLD,
        sides: 6,
        detail: 0.6,
        group: "head",
        name: `lipScroll${side}`,
      },
    );

    // Sculpted nostril flare
    b.part(new THREE.OctahedronGeometry(0.026, 1), IMPERIAL_GOLD, {
      bone: head,
      at: [s * 0.038, 1.72, 1.02],
      scale: [0.9, 0.75, 1.2],
      flat: true,
      group: "head",
      name: `nostril${side}`,
    });

    // Upper canine fang
    b.spike([s * 0.044, 1.66, 0.96], [0, -1, 0.1], 0.042, 0.013, {
      bone: head,
      color: PEARL_CREAM,
      sides: 5,
      detail: 0.5,
      group: "head",
      name: `fangUpper${side}`,
    });
  }

  // Lower jaw, tongue & cloud chin-beard
  b.loft(
    [
      { at: [0, 1.65, 0.72], w: 0.15, h: 0.08 },
      { at: [0, 1.62, 0.86], w: 0.12, h: 0.065 },
      { at: [0, 1.61, 0.98], w: 0.085, h: 0.05 },
    ],
    {
      bone: jaw,
      color: PEARL_CREAM,
      sides: 8,
      group: "head",
      name: "lowerJaw",
    },
  );

  // Tongue inside mouth
  b.capsule([0, 1.64, 0.80], [0, 1.63, 0.94], [0.036, 0.024], {
    bone: jaw,
    color: VERMILION,
    sides: 6,
    detail: 0.5,
    group: "head",
    name: "tongue",
  });

  // Flowing dragon-sage chin beard curls under the jaw
  for (const [i, dx] of [-0.032, 0, 0.032].entries()) {
    b.sweep(
      bezier(
        [dx, 1.60, 0.95],
        [dx * 1.4, 1.50, 0.96],
        [dx * 1.8, 1.42, 0.86],
        [dx * 1.5, 1.45, 0.78],
      ),
      [0.026, 0.034, 0.008],
      {
        bone: jaw,
        color: CLOUD_TURQUOISE,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.6,
        group: "head",
        name: `chinBeard${i}`,
      },
    );
  }

  // Pose the jaw slightly open in a noble roar/breath rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // Anime eyes & forehead rune decals on the head surface
  const headSurface = b.surface(headLoft);
  const foreheadHit = headSurface.nearest([0, 1.80, 0.82]);
  b.decal(headSurface, FOREHEAD_RUNE_TEX, {
    at: foreheadHit,
    dir: [0, 0.45, 0.9],
    size: [0.055, 0.082],
    segments: 6,
    bone: head,
    group: "head",
    name: "foreheadRune",
  });

  // Central Sacred Qilin Forehead Horn & Floating Jade Spirit Pearl
  const hornBase: V3 = [0, 1.83, 0.77];
  b.part(new THREE.CylinderGeometry(0.028, 0.038, 0.032, 6), IMPERIAL_GOLD, {
    bone: head,
    at: hornBase,
    dir: [0, 0.75, 0.65],
    flat: true,
    group: "head",
    name: "centralHornCoronet",
  });
  b.sweep(
    bezier([0, 1.83, 0.77], [0, 1.93, 0.85], [0, 2.04, 0.82], [0, 2.12, 0.75]),
    [0.030, 0.020, 0.006],
    {
      bone: head,
      color: IMPERIAL_GOLD,
      caps: { start: "flat", end: "point" },
      sides: 6,
      detail: 0.6,
      group: "head",
      name: "centralSacredHorn",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.036, 1), GLOW_CYAN, {
      bone: head,
      at: [0, 2.02, 0.88],
      flat: true,
      group: "head",
      name: "foreheadSpiritPearl",
    }),
    1.8,
  );

  // Paired Eyes, Flame Eyebrows, Cheek Fins, Whiskers, Ears & Branching Antlers
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    const eyeHit = headSurface.around([0, 1.74, 0.78]).at(s * 58, 4);
    if (eyeHit) {
      b.decal(headSurface, EYE_TEX, {
        at: eyeHit,
        dir: [s * 0.82, 0.12, 0.55],
        size: [0.082, 0.108],
        segments: 8,
        mirror: s > 0,
        bone: head,
        group: "head",
        name: `eye${side}`,
      });
    }

    // Sweeping 3D golden anime flame-eyebrow ridge
    b.sweep(
      catmull([
        [s * 0.055, 1.79, 0.86],
        [s * 0.105, 1.82, 0.78],
        [s * 0.145, 1.87, 0.66],
        [s * 0.175, 1.95, 0.54],
      ]),
      [0.016, 0.026, 0.018, 0.004],
      {
        bone: head,
        color: IMPERIAL_GOLD,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.6,
        group: "head",
        name: `flameBrow${side}`,
      },
    );

    // Cheek dragon-cloud frill
    for (let k = 0; k < 2; k++) {
      const dy = k * 0.042;
      b.sweep(
        bezier(
          [s * 0.10, 1.69 + dy, 0.73],
          [s * 0.16, 1.68 + dy, 0.66],
          [s * 0.19, 1.72 + dy, 0.56],
          [s * 0.16, 1.76 + dy, 0.52],
        ),
        [0.022, 0.028, 0.006],
        {
          bone: head,
          color: CLOUD_MANE,
          caps: { start: "round", end: "point" },
          sides: 6,
          detail: 0.5,
          group: "head",
          name: `cheekCloud${side}${k}`,
        },
      );
    }

    // Long flowing dragon whisker/barbel along its chain
    b.sweep(whiskers[side], [0.018, 0.014, 0.020, 0.005], {
      color: IMPERIAL_GOLD,
      caps: { start: "round", end: "point" },
      sides: 6,
      detail: 0.5,
      group: `whisker${side}`,
      name: `whiskerTube${side}`,
    });
    // Cloud tuft at whisker tip
    const wTip = whiskers[side].at(1);
    b.sweep(
      bezier(
        wTip.at,
        offset(wTip.at, [s * 0.4, -0.2, -0.8], 0.06),
        offset(wTip.at, [s * 0.2, 0.4, -1.0], 0.11),
      ),
      [0.022, 0.005],
      {
        bone: wTip.bone,
        color: CLOUD_TURQUOISE,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: `whisker${side}`,
        name: `whiskerPlume${side}`,
      },
    );

    // Stag-Dragon Leaf Ear (extruded outer blade + vermilion inner pinna)
    const earOutline: OutlinePoint[] = [
      [0, -0.025],
      [0.08, -0.04],
      [0.19, -0.015],
      [0.26, 0.035, "sharp"],
      [0.16, 0.055],
      [0.05, 0.035],
    ];
    b.extrude(earOutline, {
      bone: ears[side],
      at: ears[side].at,
      x: [s * 0.72, 0.42, -0.55],
      y: [0, 1, 0.2],
      thickness: [0.024, 0.006],
      bevel: 0.004,
      smoothing: 1,
      detail: 0.6,
      color: QILIN_COAT,
      group: `ear${side}`,
      name: `earOuter${side}`,
    });
    b.extrude(
      [
        [0.02, -0.012],
        [0.14, -0.018],
        [0.20, 0.02, "sharp"],
        [0.10, 0.03],
      ],
      {
        bone: ears[side],
        at: offset(ears[side].at, [0, 0, 1], 0.008),
        x: [s * 0.72, 0.42, -0.55],
        y: [0, 1, 0.2],
        thickness: 0.012,
        smoothing: 1,
        detail: 0.5,
        color: VERMILION,
        group: `ear${side}`,
        name: `earInner${side}`,
      },
    );

    // Branching Sacred Coral-Gold Dragon Antlers
    const ant = antlers[side];
    // Golden base coronet ring
    b.part(new THREE.CylinderGeometry(0.036, 0.044, 0.036, 7), IMPERIAL_GOLD, {
      bone: ant.joints[0],
      at: ant.at(0).at,
      dir: ant.at(0).tangent,
      flat: true,
      group: `antler${side}`,
      name: `antlerCoronet${side}`,
    });
    // Main antler beam
    b.sweep(ant, [0.034, 0.025, 0.012], {
      color: ANTLER_PAINT,
      caps: { start: "flat", end: "round" },
      sides: 7,
      detail: 0.6,
      group: `antler${side}`,
      name: `antlerBeam${side}`,
    });
    // Brow tine sweeping forward and up
    const browStart = ant.at(0.28);
    b.sweep(
      bezier(
        browStart.at,
        offset(browStart.at, [s * 0.18, 0.55, 0.8], 0.09),
        offset(browStart.at, [s * 0.12, 0.95, 0.6], 0.18),
      ),
      [0.022, 0.007],
      {
        bone: browStart.bone,
        color: ANTLER_PAINT,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: `antler${side}`,
        name: `antlerBrowTine${side}`,
      },
    );
    // Royal mid tine sweeping outward and up
    const midStart = ant.at(0.62);
    const midTip = offset(midStart.at, [s * 0.55, 0.82, -0.15], 0.20);
    b.sweep(
      bezier(
        midStart.at,
        offset(midStart.at, [s * 0.65, 0.45, -0.2], 0.10),
        midTip,
      ),
      [0.020, 0.008],
      {
        bone: midStart.bone,
        color: ANTLER_PAINT,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: `antler${side}`,
        name: `antlerMidTine${side}`,
      },
    );
    // Crown fork tine
    const crownStart = ant.at(0.84);
    b.sweep(
      bezier(
        crownStart.at,
        offset(crownStart.at, [-s * 0.25, 0.75, -0.35], 0.08),
        offset(crownStart.at, [-s * 0.15, 0.95, -0.45], 0.16),
      ),
      [0.017, 0.006],
      {
        bone: crownStart.bone,
        color: ANTLER_PAINT,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: `antler${side}`,
        name: `antlerCrownTine${side}`,
      },
    );
    // Glowing celestial pearl at the main antler apex
    glow(
      b.part(new THREE.OctahedronGeometry(0.026, 1), GLOW_GOLD, {
        bone: ant.at(1).bone,
        at: ant.at(1).at,
        flat: true,
        group: `antler${side}`,
        name: `antlerApexGem${side}`,
      }),
      1.5,
    );
  }

  // ---------------------------------------------------------------------------
  // 4. BILLOWING AUSPICIOUS CLOUD MANE, DORSAL DRAGON CREST & SHOULDER/HIP SCROLLS
  // ---------------------------------------------------------------------------
  // Central sculpted cloud-wave crest running down the nape, neck & withers
  const manePositions = [0.95, 0.84, 0.73, 0.62, 0.50, 0.38];
  manePositions.forEach((t, idx) => {
    const sp = bodyLoft.at(t, 0);
    const scale = 1 - idx * 0.08;
    const len = 0.32 * scale;
    const curlTip = offset(sp.at, [0, 0.58, -0.82], len);
    const curlCtrl1 = offset(sp.at, [0, 0.85, -0.35], len * 0.48);
    const curlCtrl2 = offset(sp.at, [0, 0.25, -0.95], len * 0.82);

    // Central billowing cloud lock
    b.sweep(
      bezier(sp.at, curlCtrl1, curlCtrl2, curlTip),
      [0.068 * scale, 0.082 * scale, 0.052 * scale, 0.014],
      {
        bone: sp.bone,
        color: idx % 2 === 0 ? CLOUD_MANE : CLOUD_TURQUOISE,
        caps: { start: "round", end: "point" },
        sides: 7,
        detail: 0.6,
        group: "mane",
        name: `maneCenterLock${idx}`,
      },
    );

    // Paired side cloud-volute curls flanking the neck crest
    for (const s of [1, -1] as const) {
      const side = s > 0 ? "L" : "R";
      const sidePt = bodyLoft.at(t, s * -32);
      const sLen = 0.25 * scale;
      const p1 = offset(sidePt.at, [s * 0.55, 0.45, -0.65], sLen * 0.45);
      const p2 = offset(sidePt.at, [s * 0.68, 0.15, -0.88], sLen * 0.88);
      const p3 = offset(sidePt.at, [s * 0.42, 0.48, -0.78], sLen * 0.96);

      b.sweep(
        bezier(sidePt.at, p1, p2, p3),
        [0.052 * scale, 0.064 * scale, 0.042 * scale, 0.012],
        {
          bone: sidePt.bone,
          color: CLOUD_MANE,
          caps: { start: "round", end: "point" },
          sides: 7,
          detail: 0.6,
          group: "mane",
          name: `maneSideCurl${side}${idx}`,
        },
      );
    }
  });

  // Chest & throat cloud-ruff curls around the base of the neck
  for (let i = 0; i < 7; i++) {
    const angle = -105 + i * 35; // wraps around the front & sides of the chest
    const ruffBase = bodyLoft.at(0.56, angle);
    const outDir: V3 = [
      Math.sin((angle * Math.PI) / 180) * 0.65,
      -0.35,
      0.55 - Math.abs(i - 3) * 0.18,
    ];
    b.sweep(
      bezier(
        ruffBase.at,
        offset(ruffBase.at, outDir, 0.11),
        offset(ruffBase.at, [outDir[0] * 0.8, -0.1, outDir[2] * 0.7], 0.21),
        offset(ruffBase.at, [outDir[0] * 0.5, 0.25, outDir[2] * 0.5], 0.24),
      ),
      [0.058, 0.068, 0.045, 0.012],
      {
        bone: ruffBase.bone,
        color: i % 2 === 0 ? CLOUD_MANE : CLOUD_TURQUOISE,
        caps: { start: "round", end: "point" },
        sides: 7,
        detail: 0.6,
        group: "mane",
        name: `chestRuffCurl${i}`,
      },
    );
  }

  // Dorsal dragon spine plates along the back (between withers and croup)
  const dorsalTs = [0.34, 0.27, 0.20, 0.13, 0.06];
  dorsalTs.forEach((t, idx) => {
    const dp = bodyLoft.at(t, 0);
    const plateH = 0.095 - idx * 0.008;
    b.extrude(
      [
        [-0.045, -0.015],
        [0.045, -0.015],
        [0.015, plateH, "sharp"],
        [-0.038, plateH * 0.65],
      ],
      {
        bone: dp.bone,
        at: dp.at,
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.032, 0.008],
        bevel: 0.004,
        smoothing: 1,
        detail: 0.5,
        color: IMPERIAL_GOLD,
        group: "torso",
        name: `dorsalScalePlate${idx}`,
      },
    );
  });

  // Layered anime cloud-flame cards along the neck mane & dorsal ridge
  const maneCardFrames = [
    ...Array.from({ length: 14 }, (_, i) => {
      const t = 0.42 + (i / 13) * 0.52;
      const sideOff = ((i % 3) - 1) * 24;
      return bodyLoft.at(t, sideOff);
    }),
    ...Array.from({ length: 8 }, (_, i) => {
      const angle = -90 + (i / 7) * 180;
      return bodyLoft.at(0.52, angle);
    }),
  ];
  b.cards(maneCardFrames, CLOUD_CARD_TEX, {
    size: [0.16, 0.26],
    lean: 42,
    bend: 25,
    flow: [0, 0.25, -1],
    vary: 0.2,
    spin: 18,
    rng: rand,
    group: "mane",
    name: "maneCloudCards",
  });

  // Sculpted 3D Ruyi Cloud Scrolls & Golden Armor Plates on Shoulders & Hips
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Shoulder cloud scroll (wrapping over the deltoid)
    const shScrollPath = catmull([
      [s * 0.18, 1.24, 0.52],
      [s * 0.25, 1.20, 0.38],
      [s * 0.26, 1.26, 0.22],
      [s * 0.23, 1.35, 0.20],
      [s * 0.21, 1.32, 0.28],
    ]);
    b.sweep(shScrollPath, [0.038, 0.048, 0.042, 0.028, 0.012], {
      bone: spine.joints[2],
      color: CLOUD_MANE,
      caps: { start: "round", end: "round" },
      sides: 7,
      detail: 0.6,
      group: "regalia",
      name: `shoulderCloudScroll${side}`,
    });
    // Gold filigree rim along shoulder scroll
    b.sweep(
      catmull([
        [s * 0.19, 1.21, 0.50],
        [s * 0.26, 1.16, 0.36],
        [s * 0.27, 1.23, 0.20],
      ]),
      [0.018, 0.022, 0.008],
      {
        bone: spine.joints[2],
        color: IMPERIAL_GOLD,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: "regalia",
        name: `shoulderGoldTrim${side}`,
      },
    );

    // Hip / Haunch ruyi cloud scroll
    const hipScrollPath = catmull([
      [s * 0.19, 1.16, -0.34],
      [s * 0.25, 1.12, -0.48],
      [s * 0.25, 1.20, -0.62],
      [s * 0.22, 1.28, -0.60],
      [s * 0.21, 1.24, -0.52],
    ]);
    b.sweep(hipScrollPath, [0.036, 0.046, 0.040, 0.026, 0.012], {
      bone: hips,
      color: CLOUD_MANE,
      caps: { start: "round", end: "round" },
      sides: 7,
      detail: 0.6,
      group: "regalia",
      name: `hipCloudScroll${side}`,
    });
    b.sweep(
      catmull([
        [s * 0.20, 1.13, -0.36],
        [s * 0.26, 1.09, -0.50],
        [s * 0.26, 1.18, -0.64],
      ]),
      [0.018, 0.020, 0.008],
      {
        bone: hips,
        color: IMPERIAL_GOLD,
        caps: { start: "round", end: "point" },
        sides: 6,
        detail: 0.5,
        group: "regalia",
        name: `hipGoldTrim${side}`,
      },
    );

    // Physical 3D embossed golden dragon scales on shoulder & hip armor
    for (let k = 0; k < 3; k++) {
      const shHit = bodySurface.nearest([
        s * 0.21,
        1.12 + k * 0.055,
        0.34 - k * 0.04,
      ]);
      b.stick(new THREE.CylinderGeometry(0.034, 0.040, 0.016, 6), IMPERIAL_GOLD, shHit, {
        embed: 0.4,
        flat: true,
        group: "regalia",
        name: `shoulderScaleStud${side}${k}`,
      });

      const hpHit = bodySurface.nearest([
        s * 0.21,
        1.08 + k * 0.055,
        -0.42 - k * 0.04,
      ]);
      b.stick(new THREE.CylinderGeometry(0.034, 0.040, 0.016, 6), IMPERIAL_GOLD, hpHit, {
        embed: 0.4,
        flat: true,
        group: "regalia",
        name: `hipScaleStud${side}${k}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. FOUR LEGS, GOLDEN GREAVES, FETLOCK CLOUD FLAMES & CLOVEN HOOVES (y = 0)
  // ---------------------------------------------------------------------------
  const buildLegAssembly = (
    leg: ReturnType<typeof b.chain>,
    s: 1 | -1,
    isFront: boolean,
    label: string,
  ) => {
    const radii = isFront
      ? [0.105, 0.072, 0.050, 0.038]
      : [0.125, 0.082, 0.052, 0.038];

    // Smooth-skinned leg sweep
    const legSweep = b.sweep(leg, radii, {
      color: LEG_COAT,
      sides: 8,
      detail: 0.75,
      group: label,
      name: `${label}Tube`,
    });

    // Ornate Golden Anime Bracer / Greave on the lower cannon bone
    const cannonBone = leg.joints[2];
    const pTop = leg.at(0.68).at;
    const pBot = leg.at(0.92).at;
    b.rod(pTop, pBot, [0.049, 0.044], {
      bone: cannonBone,
      color: IMPERIAL_GOLD,
      sides: 7,
      detail: 0.6,
      group: label,
      name: `${label}GoldBracer`,
    });

    // Upturned golden cloud-wing fin on the back/outer side of the knee/hock joint
    const midJoint = leg.joints[1];
    b.extrude(
      [
        [0, -0.04],
        [0.09, -0.02],
        [0.16, 0.07, "sharp"],
        [0.06, 0.09],
        [0, 0.04],
      ],
      {
        bone: midJoint,
        at: offset(midJoint.at, [s * 0.4, 0, -1], 0.045),
        x: [s * 0.25, 0.35, -0.9],
        y: [0, 1, 0.2],
        thickness: [0.022, 0.005],
        bevel: 0.003,
        smoothing: 1,
        detail: 0.5,
        color: IMPERIAL_GOLD,
        group: label,
        name: `${label}JointWing`,
      },
    );

    // Fetlock Cloud-Flame Tufts bursting backward from the ankle
    const fetlockJoint = leg.joints[3];
    const ankleAt = fetlockJoint.at;
    for (let k = -1; k <= 1; k++) {
      const spreadX = s * 0.025 + k * 0.028;
      const liftY = 0.08 + Math.abs(k) * -0.02;
      b.sweep(
        bezier(
          [ankleAt.x + k * 0.015, ankleAt.y + 0.04, ankleAt.z - 0.02],
          [ankleAt.x + spreadX, ankleAt.y + 0.05, ankleAt.z - 0.12],
          [ankleAt.x + spreadX * 1.4, ankleAt.y + liftY + 0.08, ankleAt.z - 0.20],
          [ankleAt.x + spreadX * 1.1, ankleAt.y + liftY + 0.15, ankleAt.z - 0.16],
        ),
        [0.032, 0.038, 0.024, 0.006],
        {
          bone: fetlockJoint,
          color: k === 0 ? CLOUD_TURQUOISE : CLOUD_MANE,
          caps: { start: "round", end: "point" },
          sides: 6,
          detail: 0.5,
          group: label,
          name: `${label}FetlockFlame${k + 1}`,
        },
      );
    }

    // Fetlock plume card
    b.cards([legSweep.at(0.86, 180)], PLUME_CARD_TEX, {
      size: [0.11, 0.18],
      lean: 35,
      bend: 20,
      flow: [0, 0.3, -1],
      bone: cannonBone,
      group: label,
      name: `${label}FetlockCard`,
    });

    // Cloven Golden Hoof resting squarely on y = 0.000
    const footX = ankleAt.x;
    const footZ = ankleAt.z;

    // Golden coronet band above the hoof
    b.rod([footX, 0.068, footZ], [footX, 0.095, footZ - 0.006], [0.052, 0.044], {
      bone: fetlockJoint,
      color: IMPERIAL_GOLD,
      sides: 7,
      detail: 0.6,
      group: label,
      name: `${label}Coronet`,
    });

    // Dark ink inner hoof core (slightly recessed so the cleft between toes reads dark)
    b.rod([footX, 0.002, footZ + 0.008], [footX, 0.072, footZ - 0.004], [0.046, 0.040], {
      bone: fetlockJoint,
      color: DARK_HOOF,
      sides: 6,
      detail: 0.5,
      group: label,
      name: `${label}HoofCore`,
    });

    // Two distinct cloven golden hoof toes per foot, flat bottom at y = 0.000!
    for (const toeSign of [-1, 1] as const) {
      const toeX = footX + toeSign * 0.023;
      const toeZ = footZ + 0.016;
      b.frustumBox(
        [toeX, 0, toeZ],
        [toeX - toeSign * 0.003, 0.074, toeZ - 0.014],
        [0.038, 0.082],
        [0.032, 0.064],
        {
          bone: fetlockJoint,
          color: IMPERIAL_GOLD,
          up: [0, 0, 1],
          group: label,
          name: `${label}HoofToe${toeSign > 0 ? "L" : "R"}`,
        },
      );
    }

    // Glowing sacred gold dewclaw gem on the back of the fetlock
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), GLOW_GOLD, {
        bone: fetlockJoint,
        at: [footX, 0.095, footZ - 0.048],
        flat: true,
        group: label,
        name: `${label}DewclawGem`,
      }),
      1.3,
    );
  };

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    buildLegAssembly(frontLegs[side], s, true, `legF${side}`);
    buildLegAssembly(hindLegs[side], s, false, `legH${side}`);
  }

  // ---------------------------------------------------------------------------
  // 6. LUXURIANT CLOUD-FLAME TAIL
  // ---------------------------------------------------------------------------
  // Scaled tail stem
  const tailSweep = b.sweep(tail, [0.088, 0.072, 0.058, 0.052, 0.068, 0.035], {
    color: QILIN_COAT,
    sides: 8,
    detail: 0.7,
    group: "tail",
    name: "tailStem",
  });

  // Ornate golden tail rings clasping the tail before it blooms into cloud plumes
  for (const [idx, tRing] of [0.32, 0.56].entries()) {
    const tp = tail.at(tRing);
    b.part(new THREE.TorusGeometry(0.062 - idx * 0.006, 0.015, 6, 8), IMPERIAL_GOLD, {
      bone: tp.bone,
      at: tp.at,
      dir: tp.tangent,
      axis: "z",
      flat: true,
      group: "tail",
      name: `tailGoldRing${idx}`,
    });
  }

  // Dramatic multi-plume 3D cloud-flame tail cluster attached to the upper tail bones
  const tailPlumeSpecs: Array<{
    t: number;
    offsetDir: V3;
    tipDir: V3;
    len: number;
    rMax: number;
    turquoise: boolean;
  }> = [
    { t: 0.65, offsetDir: [0, 0.5, -0.8], tipDir: [0, 0.8, 0.4], len: 0.46, rMax: 0.092, turquoise: true },
    { t: 0.74, offsetDir: [0.55, 0.35, -0.7], tipDir: [0.35, 0.75, 0.2], len: 0.40, rMax: 0.076, turquoise: false },
    { t: 0.74, offsetDir: [-0.55, 0.35, -0.7], tipDir: [-0.35, 0.75, 0.2], len: 0.40, rMax: 0.076, turquoise: false },
    { t: 0.54, offsetDir: [0.45, -0.25, -0.85], tipDir: [0.25, 0.45, -0.6], len: 0.36, rMax: 0.068, turquoise: true },
    { t: 0.54, offsetDir: [-0.45, -0.25, -0.85], tipDir: [-0.25, 0.45, -0.6], len: 0.36, rMax: 0.068, turquoise: true },
    { t: 0.88, offsetDir: [0, 0.85, -0.4], tipDir: [0, 0.35, 0.85], len: 0.34, rMax: 0.078, turquoise: false },
  ];

  tailPlumeSpecs.forEach((spec, idx) => {
    const rootPt = tail.at(spec.t);
    const c1 = offset(rootPt.at, spec.offsetDir, spec.len * 0.45);
    const c2 = offset(rootPt.at, spec.offsetDir, spec.len * 0.85);
    const tip = offset(c2, spec.tipDir, spec.len * 0.38);

    b.sweep(
      bezier(rootPt.at, c1, c2, tip),
      [spec.rMax * 0.65, spec.rMax, spec.rMax * 0.72, 0.014],
      {
        bone: rootPt.bone,
        color: spec.turquoise ? CLOUD_TURQUOISE : CLOUD_MANE,
        caps: { start: "round", end: "point" },
        sides: 7,
        detail: 0.6,
        group: "tail",
        name: `tailCloudPlume${idx}`,
      },
    );
  });

  // Glowing sacred spirit pearl nestled in the curl of the tail tip
  glow(
    b.part(new THREE.OctahedronGeometry(0.044, 1), GLOW_CYAN, {
      bone: tail.at(0.95).bone,
      at: [0, 1.86, -1.26],
      flat: true,
      group: "tail",
      name: "tailSpiritPearl",
    }),
    1.6,
  );

  // Fan of anime cloud-flame cards around the tail brush
  const tailCardFrames = [
    tailSweep.at(0.55, 0),
    tailSweep.at(0.65, 45),
    tailSweep.at(0.65, -45),
    tailSweep.at(0.75, 90),
    tailSweep.at(0.75, -90),
    tailSweep.at(0.85, 0),
    tailSweep.at(0.85, 180),
  ];
  b.cards(tailCardFrames, [CLOUD_CARD_TEX, PLUME_CARD_TEX], {
    size: [0.18, 0.30],
    lean: 38,
    bend: 28,
    flow: [0, 0.4, -0.9],
    vary: 0.2,
    spin: 22,
    rng: rand,
    group: "tail",
    name: "tailPlumeCards",
  });

  // ---------------------------------------------------------------------------
  // 7. CELESTIAL SILK RIBBON STREAMERS & FLOATING SPIRIT ORBS (High-Fantasy Anime Regalia)
  // ---------------------------------------------------------------------------
  // Overhead silk arch bridging the left and right shoulder ribbons above the withers
  const archPath = catmull([
    [0.22, 1.24, 0.42],
    [0.26, 1.56, 0.36],
    [0, 1.74, 0.26],
    [-0.26, 1.56, 0.36],
    [-0.22, 1.24, 0.42],
  ]);
  b.sweep(
    archPath,
    () => [0.032, 0.009],
    {
      bone: spine.joints[2],
      color: VERMILION,
      sides: 6,
      detail: 0.6,
      group: "regalia",
      name: "celestialRibbonArch",
    },
  );

  // Golden auspicious cloud brooch at the apex of the overhead ribbon arch
  b.extrude(
    [
      [-0.075, -0.025],
      [0, -0.045],
      [0.075, -0.025],
      [0.095, 0.015],
      [0.045, 0.045],
      [0, 0.065, "sharp"],
      [-0.045, 0.045],
      [-0.095, 0.015],
    ],
    {
      bone: spine.joints[2],
      at: [0, 1.74, 0.26],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      detail: 0.5,
      color: IMPERIAL_GOLD,
      group: "regalia",
      name: "archCloudBrooch",
    },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.030, 1), GLOW_GOLD, {
      bone: spine.joints[2],
      at: [0, 1.74, 0.28],
      flat: true,
      group: "regalia",
      name: "archApexGem",
    }),
    1.6,
  );

  // Streaming left and right silk ribbon tails along their chains
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const rib = ribbons[side];

    b.sweep(
      rib,
      (t) => [0.036 * (1 - 0.35 * t), 0.009],
      {
        color: VERMILION,
        sides: 6,
        detail: 0.6,
        group: `ribbon${side}`,
        name: `ribbonStreamer${side}`,
      },
    );

    // Golden lotus bead & glowing jade spirit pearl along each ribbon
    const midRib = rib.at(0.45);
    b.part(new THREE.OctahedronGeometry(0.034, 1), IMPERIAL_GOLD, {
      bone: midRib.bone,
      at: midRib.at,
      flat: true,
      group: `ribbon${side}`,
      name: `ribbonGoldBead${side}`,
    });
    const lowRib = rib.at(0.75);
    glow(
      b.part(new THREE.OctahedronGeometry(0.028, 1), GLOW_CYAN, {
        bone: lowRib.bone,
        at: lowRib.at,
        flat: true,
        group: `ribbon${side}`,
        name: `ribbonSpiritOrb${side}`,
      }),
      1.5,
    );

    // Swallowtail golden ornament at the end of each ribbon
    const endRib = rib.at(1);
    b.extrude(
      [
        [0, -0.028],
        [0.09, -0.048, "sharp"],
        [0.055, 0],
        [0.09, 0.048, "sharp"],
        [0, 0.028],
      ],
      {
        bone: endRib.bone,
        at: endRib.at,
        x: endRib.tangent,
        y: [0, 1, 0],
        thickness: 0.012,
        smoothing: 0,
        detail: 0.5,
        color: IMPERIAL_GOLD,
        group: `ribbon${side}`,
        name: `ribbonSwallowtail${side}`,
      },
    );

    // Floating auspicious cloud-flame card at the shoulder crest
    b.cards(
      [frame([s * 0.26, 1.30, 0.26], [s * 0.5, 0.85, -0.2])],
      CLOUD_CARD_TEX,
      {
        size: [0.15, 0.24],
        lean: 35,
        bend: 22,
        flow: [0, 0.3, -1],
        bone: spine.joints[2],
        mirror: s < 0,
        group: "regalia",
        name: `shoulderCloudCard${side}`,
      },
    );
  }

  return b.root;
}
