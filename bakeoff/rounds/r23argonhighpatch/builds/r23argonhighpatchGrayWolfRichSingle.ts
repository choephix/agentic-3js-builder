import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, grain, mix, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Gray Wolf",
  description:
    "Blizzard/Warcraft-styled gray wolf standing alert with heroic broad shoulders, layered sculpted neck and cheek ruffs, hand-painted timber-and-frost coat, battle-scarred brow, glowing amber eyes, and a studded leather-and-iron pack collar.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// Palette — saturated hand-painted Warcraft timber wolf tones
// ---------------------------------------------------------------------------
const DARK_DORSAL = "#252b35";
const SLATE_GUARD = "#37404e";
const STORM_GRAY = "#586374";
const TIMBER_AGOUTI = "#787066";
const FROST_CREAM = "#ded8c9";
const BRIGHT_RUFF = "#ece6d8";
const CHARCOAL_SOCK = "#232730";

const NOSE_BLACK = "#1a1c22";
const GUM_DARK = "#59252d";
const TONGUE_RED = "#9e4450";
const SCAR_PINK = "#b8847e";
const EAR_INNER = "#b5928b";
const FANG_IVORY = "#efe8d5";
const CLAW_HORN = "#1f1d24";

const EYE_GOLD = "#ffaa14";
const EYE_BRIGHT = "#ffe26a";

const LEATHER_DARK = "#3b2418";
const LEATHER_WARM = "#5c3824";
const IRON_DARK = "#4b5461";
const IRON_LIGHT = "#7d8896";
const BRONZE_STUD = "#bd8c3c";
const BONE_CHARM = "#e2dac4";
const RUNE_CYAN = "#4ae8ff";

// ---------------------------------------------------------------------------
// Hand-painted coat & leather paints
// ---------------------------------------------------------------------------
const dorsalBlend = grain(DARK_DORSAL, SLATE_GUARD, { size: 0.035, axis: "z", seed: 11 });
const flankBlend = grain(STORM_GRAY, TIMBER_AGOUTI, { size: 0.042, axis: [0, 0.35, 1], seed: 23 });
const creamBlend = grain(FROST_CREAM, BRIGHT_RUFF, { size: 0.038, axis: [0, 0.5, 1], seed: 37 });

const wolfCoatPaint = paint((p, n) => {
  const furNoise = noise(p, 0.09, 41) - 0.5;
  const tooth = 0.08 * (zigzag((p.z + p.y * 0.35) / 0.055) - 0.5);

  // Dorsal saddle along back, neck crest, and top of tail
  const dorsalMask = smoothstep(0.22, 0.62, n.y + furNoise * 0.28 + tooth + (p.y > 0.78 ? 0.14 : 0));
  // Ventral cream bib on throat, chest, belly, inner thighs, and lower cheeks
  const chestBibBoost = p.z > 0.24 && p.y > 0.52 && p.y < 0.92 ? 0.28 * smoothstep(0.24, 0.46, p.z) : 0;
  const muzzleCheekBoost =
    p.z > 0.52 && p.y < 0.94 && Math.abs(p.x) > 0.035 ? 0.42 * smoothstep(0.95, 0.87, p.y) : 0;
  const ventralMeasure = -n.y + chestBibBoost + muzzleCheekBoost + furNoise * 0.22 + tooth;
  const ventralMask = smoothstep(0.08, 0.42, ventralMeasure);

  const midTone = flankBlend.at(p, n);
  const topTone = dorsalBlend.at(p, n);
  const bellyTone = creamBlend.at(p, n);

  let col = mix(midTone, topTone, dorsalMask);
  col = mix(col, bellyTone, ventralMask);

  // Darkened lower leg socks above the paws
  if (p.y < 0.34 && p.z > -0.48) {
    const sockFactor = smoothstep(0.32, 0.11, p.y + tooth * 0.25);
    const pawTipCream = smoothstep(0.075, 0.025, p.y);
    col = mix(col, CHARCOAL_SOCK, sockFactor * 0.72);
    col = mix(col, FROST_CREAM, pawTipCream * 0.45);
  }

  // Black-tipped tail brush with frost-white extreme tip
  if (p.z < -0.78) {
    const darkTail = smoothstep(-0.76, -0.94, p.z);
    const whiteTip = smoothstep(-0.98, -1.07, p.z);
    col = mix(col, DARK_DORSAL, darkTail * 0.82);
    col = mix(col, BRIGHT_RUFF, whiteTip * 0.75);
  }

  // Hand-painted top light & warm under-shadow gradient
  const topLight = smoothstep(0.35, 0.88, n.y) * 0.1;
  const underShade = smoothstep(-0.2, -0.85, n.y) * 0.14;
  col = mix(col, BRIGHT_RUFF, topLight);
  col = mix(col, DARK_DORSAL, underShade);
  return col;
});

const darkHacklePaint = countershade(dorsalBlend, flankBlend, { level: -0.1, soft: 0.35 });
const chestRuffPaint = countershade(flankBlend, creamBlend, { level: 0.25, soft: 0.35 });
const leatherPaint = grain(LEATHER_DARK, LEATHER_WARM, { size: 0.028, axis: "x", seed: 73 });
const ironPaint = countershade(IRON_LIGHT, IRON_DARK, { level: 0.05, soft: 0.4 });

// ---------------------------------------------------------------------------
// SVG Textures (layered fur cards & carved pack talisman)
// ---------------------------------------------------------------------------
const FUR_CARD_TEX = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 96 L14 34 L24 62 L32 6 L42 58 L50 28 L58 96 Z" fill="#6e6e6e"/>
    <path d="M12 96 L18 42 L26 66 L32 14 L40 62 L47 36 L53 96 Z" fill="#adadad"/>
    <path d="M20 96 L25 52 L32 22 L39 54 L44 96 Z" fill="#e6e6e6"/>
    <path d="M29 90 L32 28 L35 90 Z" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const RUNE_MEDALLION_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#3a424d" stroke="#7d8896" stroke-width="4"/>
    <polygon points="32,8 40,22 54,18 44,34 48,50 32,42 16,50 20,34 10,18 24,22" fill="#232830" stroke="#bd8c3c" stroke-width="2.5"/>
    <path d="M32 14 L32 46 M22 24 L32 32 L42 24 M25 38 L32 32 L39 38" stroke="#4ae8ff" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "grayWolf", detail: 0.9, paintSize: 1024 });

  // =========================================================================
  // 1. SKELETON — Full quadruped hierarchy in alert standing pose
  // =========================================================================
  const hips = b.joint("hips", { at: [0, 0.72, -0.34], dir: [0, 0, 1], role: "spine", group: "torso" });

  const spine = b.chain(
    "spine",
    [
      [0, 0.72, -0.34],
      [0, 0.71, -0.14],
      [0, 0.74, 0.08],
      [0, 0.78, 0.28],
    ],
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const chestJoint = spine.joints[2];

  const neck = b.chain(
    "neck",
    [
      [0, 0.78, 0.28],
      [0, 0.87, 0.38],
      [0, 0.95, 0.47],
    ],
    {
      parent: chestJoint,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "neck",
    },
  );
  const neckBase = neck.joints[0];
  const neckTop = neck.joints[1];

  const head = b.joint("head", {
    parent: neckTop,
    at: [0, 0.95, 0.47],
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.895, 0.525],
    dir: [0, -0.26, 1],
    role: "jaw",
    group: "head",
  });

  const ears: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ears[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.084, 1.035, 0.465],
      dir: [s * 0.28, 1, 0.14],
      role: "hinge",
      group: "head",
    });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.72, -0.35],
      [0, 0.69, -0.54],
      [0, 0.59, -0.74],
      [0, 0.51, -0.92],
      [0, 0.49, -1.08],
    ]),
    {
      parent: hips,
      count: 4,
      names: ["tail1", "tail2", "tail3", "tail4"],
      role: "tail",
      group: "tail",
    },
  );

  // Forelegs & Hindlegs (s = 1 is Left (+X), s = -1 is Right (-X))
  const foreLegs: Record<number, ReturnType<typeof b.chain>> = {};
  const hindLegs: Record<number, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Foreleg IK: shoulder -> elbow (back) -> wrist (slightly forward) -> pawF
    const shoulderPt = [s * 0.148, 0.7, 0.25];
    const foreFootTarget = [s * 0.155, 0.052, 0.28];
    const forePts = limb(shoulderPt, foreFootTarget, [0.27, 0.27, 0.145], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    foreLegs[s] = b.chain(`legF${side}`, forePts, {
      parent: chestJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.155, 0, 0.32],
      group: `legF${side}`,
    });

    // Hindleg IK: hip -> knee/stifle (forward) -> hock (back) -> pawH
    const hipPt = [s * 0.135, 0.69, -0.32];
    const hindFootTarget = [s * 0.146, 0.052, -0.35];
    const hindPts = limb(hipPt, hindFootTarget, [0.28, 0.26, 0.175], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    hindLegs[s] = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.146, 0, -0.31],
      group: `legH${side}`,
    });
  }

  // =========================================================================
  // 2. TORSO, CHEST & MUSCULAR ANATOMY
  // =========================================================================
  const bodyLoft = b.loft(
    [
      { at: [0, 0.71, -0.41], w: 0.22, h: 0.23 },
      { at: [0, 0.71, -0.32], w: 0.28, h: 0.29 },
      { at: [0, 0.69, -0.14], w: 0.25, h: 0.27 },
      { at: [0, 0.68, 0.06], w: 0.34, h: 0.38 },
      { at: [0, 0.69, 0.25], w: 0.39, h: 0.43 },
      { at: [0, 0.79, 0.35], w: 0.32, h: 0.35 },
      { at: [0, 0.88, 0.42], w: 0.26, h: 0.28 },
      { at: [0, 0.95, 0.48], w: 0.22, h: 0.23 },
    ],
    {
      bone: [spine, neck],
      color: wolfCoatPaint,
      sides: 10,
      group: "torso",
      name: "bodyLoft",
    },
  );

  // Deep heroic sternum / chest prow
  b.sweep(
    catmull([
      [0, 0.56, 0.08],
      [0, 0.54, 0.24],
      [0, 0.64, 0.38],
      [0, 0.78, 0.43],
    ]),
    (t) => [0.11 * (1 - 0.35 * t), 0.095 * (1 - 0.3 * t)],
    {
      bone: [spine, neck],
      color: chestRuffPaint,
      sides: 8,
      group: "torso",
      name: "sternumKeel",
    },
  );

  // Dorsal spine hackle ridge (Warcraft raised shoulder/back crest)
  const dorsalRidgePath = catmull([
    [0, 1.03, 0.43],
    [0, 0.95, 0.31],
    [0, 0.91, 0.14],
    [0, 0.86, -0.08],
    [0, 0.83, -0.3],
  ]);
  b.sweep(
    dorsalRidgePath,
    (t) => [0.065 * (1 - 0.45 * t), 0.055 * (1 - 0.35 * t)],
    {
      bone: [spine, neck],
      color: darkHacklePaint,
      sides: 6,
      smooth: false,
      group: "torso",
      name: "dorsalCrest",
    },
  );

  // Sculpted dorsal hackle spikes along neck and withers
  b.along(
    dorsalRidgePath,
    9,
    (pt) => {
      const k = 1 - 0.45 * pt.t;
      const tip = offset(
        pt.at,
        [0, 0.65 - 0.25 * pt.t, -0.75],
        0.13 * k,
      );
      b.sweep([pt.at, tip], [0.044 * k, 0], {
        bone: pt.bone ?? chestJoint,
        color: darkHacklePaint,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
        extend: [0.03, 0],
        group: "torso",
      });
    },
    { from: 0.04, to: 0.92 },
  );

  // Layered Warcraft Neck & Shoulder Mane Ruff (3 tiers of chunky faceted fur locks)
  const maneRings = [
    { center: [0, 0.91, 0.42], dir: [0, 0.55, 0.83], r: 0.135, len: 0.15, rad: 0.046, count: 10, bone: neckTop },
    { center: [0, 0.83, 0.34], dir: [0, 0.45, 0.89], r: 0.165, len: 0.18, rad: 0.054, count: 12, bone: neckBase },
    { center: [0, 0.74, 0.24], dir: [0, 0.25, 0.96], r: 0.195, len: 0.2, rad: 0.06, count: 12, bone: chestJoint },
  ];

  for (const [tierIdx, tier] of maneRings.entries()) {
    b.ring(
      frame(tier.center, tier.dir),
      {
        count: tier.count,
        radius: tier.r,
        fromDeg: -145,
        toDeg: 145,
        tilt: -48,
        parent: tier.bone,
        group: "mane",
      },
      (item) => {
        const isVentral = Math.abs(item.t - 0.5) > 0.32;
        const lockLen = tier.len * (isVentral ? 0.88 : 1.05);
        const midPt = offset(item.at, item.outward, lockLen * 0.52);
        const tipPt = offset(
          midPt,
          [item.outward.x * 0.45, item.outward.y * 0.2 - 0.25, -0.88],
          lockLen * 0.58,
        );
        b.sweep(bezier(item.at, midPt, tipPt), [tier.rad, 0], {
          bone: tier.bone,
          color: isVentral ? chestRuffPaint : wolfCoatPaint,
          sides: 5,
          smooth: false,
          caps: { start: "flat", end: "point" },
          extend: [0.04, 0],
          group: "mane",
          name: `maneLock_${tierIdx}_${item.i}`,
        });
      },
    );
  }

  // Heroic Chest Apron (plastron of thick white/cream fur tufts hanging on front of chest)
  const apronTufts: Array<{ pos: [number, number, number]; dir: [number, number, number]; len: number; r: number }> = [
    { pos: [0, 0.76, 0.41], dir: [0, -0.58, 0.82], len: 0.15, r: 0.048 },
    { pos: [0.065, 0.75, 0.39], dir: [0.22, -0.62, 0.75], len: 0.14, r: 0.044 },
    { pos: [-0.065, 0.75, 0.39], dir: [-0.22, -0.62, 0.75], len: 0.14, r: 0.044 },
    { pos: [0, 0.66, 0.39], dir: [0, -0.72, 0.68], len: 0.16, r: 0.052 },
    { pos: [0.078, 0.65, 0.36], dir: [0.28, -0.7, 0.66], len: 0.145, r: 0.045 },
    { pos: [-0.078, 0.65, 0.36], dir: [-0.28, -0.7, 0.66], len: 0.145, r: 0.045 },
    { pos: [0, 0.56, 0.34], dir: [0, -0.82, 0.55], len: 0.14, r: 0.046 },
    { pos: [0.06, 0.56, 0.32], dir: [0.2, -0.82, 0.52], len: 0.125, r: 0.04 },
    { pos: [-0.06, 0.56, 0.32], dir: [-0.2, -0.82, 0.52], len: 0.125, r: 0.04 },
  ];
  for (const [idx, tuft] of apronTufts.entries()) {
    const tip = offset(tuft.pos, tuft.dir, tuft.len);
    const midCtrl = offset(tuft.pos, [tuft.dir[0], tuft.dir[1] * 0.5, tuft.dir[2] + 0.3], tuft.len * 0.55);
    b.sweep(bezier(tuft.pos, midCtrl, tip), [tuft.r, 0], {
      bone: idx < 3 ? neckBase : chestJoint,
      color: chestRuffPaint,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      extend: [0.035, 0],
      group: "mane",
    });
  }

  // Broad shoulder scapula plates & flank rib fur tufts (left and right)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulderJoint = foreLegs[s].joints[0];
    const hipJoint = hindLegs[s].joints[0];

    // Muscular shoulder bulge
    b.sweep(
      catmull([
        [s * 0.13, 0.84, 0.22],
        [s * 0.185, 0.72, 0.25],
        [s * 0.175, 0.57, 0.23],
      ]),
      [0.065, 0.098, 0.062],
      {
        bone: shoulderJoint,
        color: wolfCoatPaint,
        sides: 8,
        group: `legF${side}`,
        name: `shoulderMuscle${side}`,
      },
    );

    // Shoulder fur flares (3 swept-back spikes over the deltoid)
    for (let k = 0; k < 3; k++) {
      const y0 = 0.76 - k * 0.065;
      const z0 = 0.24 - k * 0.02;
      const start: [number, number, number] = [s * 0.18, y0, z0];
      const tip: [number, number, number] = [s * 0.235, y0 - 0.04, z0 - 0.13];
      b.spike(start, tip, null, 0.038, {
        bone: shoulderJoint,
        color: wolfCoatPaint,
        sides: 5,
        smooth: false,
        extend: [0.03, 0],
        group: `legF${side}`,
      });
    }

    // Muscular thigh / haunch mass
    b.sweep(
      catmull([
        [s * 0.115, 0.78, -0.28],
        [s * 0.165, 0.66, -0.32],
        [s * 0.155, 0.5, -0.27],
      ]),
      [0.068, 0.102, 0.062],
      {
        bone: hipJoint,
        color: wolfCoatPaint,
        sides: 8,
        group: `legH${side}`,
        name: `haunchMuscle${side}`,
      },
    );

    // Haunch breeching fur tufts (projecting backward off the rear thigh)
    for (let k = 0; k < 4; k++) {
      const y0 = 0.7 - k * 0.058;
      const z0 = -0.36 - k * 0.012;
      const start: [number, number, number] = [s * 0.145, y0, z0];
      const tip: [number, number, number] = [s * 0.18, y0 - 0.045, z0 - 0.12];
      b.spike(start, tip, null, 0.036, {
        bone: hipJoint,
        color: k < 2 ? wolfCoatPaint : chestRuffPaint,
        sides: 5,
        smooth: false,
        extend: [0.03, 0],
        group: `legH${side}`,
      });
    }
  }

  // =========================================================================
  // 3. WARCRAFT PACK COLLAR, IRON STUDS & FROSTWOLF TALISMAN
  // =========================================================================
  const collarLoop = catmull(
    [
      [0, 0.95, 0.34],
      [0.165, 0.84, 0.37],
      [0.17, 0.69, 0.41],
      [0, 0.63, 0.44],
      [-0.17, 0.69, 0.41],
      [-0.165, 0.84, 0.37],
    ],
    { closed: true },
  );

  // Thick weathered leather collar band
  b.sweep(
    collarLoop,
    () => [0.028, 0.018],
    {
      bone: neckBase,
      color: leatherPaint,
      section: "box",
      group: "accessories",
      name: "collarStrap",
    },
  );

  // Forged iron upper & lower trim rims on the collar
  for (const dz of [-0.016, 0.016]) {
    const rimLoop = catmull(
      [
        [0, 0.95 + dz * 0.4, 0.34 + dz],
        [0.168, 0.84 + dz * 0.3, 0.37 + dz],
        [0.174, 0.69 + dz * 0.3, 0.41 + dz],
        [0, 0.63 + dz * 0.4, 0.44 + dz],
        [-0.174, 0.69 + dz * 0.3, 0.41 + dz],
        [-0.168, 0.84 + dz * 0.3, 0.37 + dz],
      ],
      { closed: true },
    );
    b.sweep(rimLoop, 0.008, {
      bone: neckBase,
      color: ironPaint,
      sides: 6,
      smooth: false,
      group: "accessories",
    });
  }

  // Heavy bronze & iron pyramid studs along the collar
  b.along(collarLoop, 10, (pt) => {
    const outDir = [pt.at.x * 1.4, (pt.at.y - 0.78) * 0.8, 0.55];
    b.spike(pt.at, outDir, 0.034, 0.016, {
      bone: neckBase,
      color: BRONZE_STUD,
      sides: 4,
      smooth: false,
      extend: [0.012, 0],
      group: "accessories",
    });
  });

  // Forged iron chest ring, rune medallion & curved monster-fang talisman at throat
  const chestRingCenter: [number, number, number] = [0, 0.615, 0.455];
  b.part(new THREE.TorusGeometry(0.028, 0.007, 6, 10), IRON_LIGHT, {
    bone: chestJoint,
    at: chestRingCenter,
    rotation: [18, 0, 0],
    flat: true,
    group: "accessories",
    name: "collarRing",
  });

  // Rune-etched pack medallion hanging from the ring
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 10), "#ffffff", {
    bone: chestJoint,
    at: [0, 0.568, 0.462],
    rotation: [78, 0, 0],
    texture: RUNE_MEDALLION_TEX,
    group: "accessories",
    name: "packMedallion",
  });

  // Glowing cyan rune crystal set in the medallion center
  glow(
    b.part(new THREE.OctahedronGeometry(0.013, 0), RUNE_CYAN, {
      bone: chestJoint,
      at: [0, 0.568, 0.47],
      flat: true,
      group: "accessories",
      name: "medallionGem",
    }),
    1.6,
  );

  // Two curved bone wolf-fang charms flanking the medallion
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.rod([s * 0.022, 0.61, 0.455], [s * 0.036, 0.585, 0.458], 0.007, IRON_DARK, {
      bone: chestJoint,
      sides: 5,
      smooth: false,
      group: "accessories",
    });
    b.sweep(
      bezier(
        [s * 0.036, 0.588, 0.458],
        [s * 0.052, 0.545, 0.472],
        [s * 0.032, 0.505, 0.485],
      ),
      [0.014, 0],
      {
        bone: chestJoint,
        color: BONE_CHARM,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        group: "accessories",
        name: `fangTalisman${side}`,
      },
    );
  }

  // =========================================================================
  // 4. HEAD, MUZZLE, JAW, FANGS, GLOWING EYES, SCAR & EARS
  // =========================================================================
  // Cranium / skull loft
  const skullLoft = b.loft(
    [
      { at: [0, 0.955, 0.43], w: 0.21, h: 0.195 },
      { at: [0, 0.968, 0.495], w: 0.225, h: 0.205 },
      { at: [0, 0.962, 0.555], w: 0.185, h: 0.175 },
      { at: [0, 0.945, 0.605], w: 0.135, h: 0.125 },
    ],
    {
      bone: head,
      color: wolfCoatPaint,
      sides: 10,
      group: "head",
      name: "skullLoft",
    },
  );

  // Upper muzzle / snout bridge & overhanging upper flews (lips)
  b.loft(
    [
      { at: [0, 0.942, 0.56], w: 0.148, h: 0.118 },
      { at: [0, 0.938, 0.635], w: 0.112, h: 0.096 },
      { at: [0, 0.932, 0.705], w: 0.086, h: 0.078 },
      { at: [0, 0.93, 0.735], w: 0.064, h: 0.062 },
    ],
    {
      bone: head,
      color: wolfCoatPaint,
      sides: 8,
      group: "head",
      name: "upperMuzzle",
    },
  );

  // Dark nasal bridge ridge with subtle snarl wrinkles
  b.sweep(
    catmull([
      [0, 0.995, 0.545],
      [0, 0.978, 0.625],
      [0, 0.962, 0.715],
    ]),
    (t) => [0.036 * (1 - 0.3 * t), 0.018],
    {
      bone: head,
      color: darkHacklePaint,
      sides: 6,
      smooth: false,
      group: "head",
      name: "nasalBridge",
    },
  );

  for (let wIdx = 0; wIdx < 3; wIdx++) {
    const zW = 0.6 + wIdx * 0.032;
    const yW = 0.982 - wIdx * 0.006;
    b.sweep(
      catmull([
        [-0.038, yW - 0.014, zW - 0.008],
        [0, yW + 0.004, zW],
        [0.038, yW - 0.014, zW - 0.008],
      ]),
      0.0065,
      {
        bone: head,
        color: DARK_DORSAL,
        sides: 5,
        smooth: false,
        group: "head",
      },
    );
  }

  // Sculpted Rhinarium (Wet black nose pad + nostrils + philtrum)
  b.part(new THREE.BoxGeometry(0.056, 0.042, 0.038), NOSE_BLACK, {
    bone: head,
    at: [0, 0.942, 0.738],
    rotation: [12, 0, 0],
    flat: true,
    group: "head",
    name: "nosePad",
  });
  b.rod([0, 0.948, 0.754], [0, 0.912, 0.742], 0.0045, GUM_DARK, {
    bone: head,
    sides: 4,
    smooth: false,
    group: "head",
    name: "philtrum",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Flared nostril wing
    b.part(new THREE.SphereGeometry(0.014, 5, 4), NOSE_BLACK, {
      bone: head,
      at: [s * 0.02, 0.946, 0.746],
      scale: [0.9, 0.85, 1.1],
      flat: true,
      group: "head",
      name: `nostrilWing${side}`,
    });
    // Dark nostril cavity
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), "#0b0c0e", {
      bone: head,
      at: [s * 0.016, 0.944, 0.754],
      scale: [0.8, 1.1, 0.6],
      flat: true,
      group: "head",
    });

    // Upper lip flews (dark gum-lined jowls overhanging the mouth line)
    b.sweep(
      catmull([
        [s * 0.024, 0.912, 0.732],
        [s * 0.044, 0.905, 0.665],
        [s * 0.058, 0.9, 0.585],
      ]),
      [0.014, 0.019, 0.015],
      {
        bone: head,
        color: NOSE_BLACK,
        sides: 6,
        group: "head",
        name: `upperFlew${side}`,
      },
    );

    // Zygomatic cheek bone arch & Warcraft jagged cheek ruff (5 swept-back spikes per side)
    b.sweep(
      catmull([
        [s * 0.072, 0.935, 0.59],
        [s * 0.112, 0.93, 0.525],
        [s * 0.118, 0.925, 0.465],
      ]),
      [0.028, 0.038, 0.03],
      {
        bone: head,
        color: wolfCoatPaint,
        sides: 6,
        smooth: false,
        group: "head",
        name: `cheekArch${side}`,
      },
    );

    const cheekSpikes: Array<{ start: [number, number, number]; tip: [number, number, number]; r: number }> = [
      { start: [s * 0.095, 0.955, 0.505], tip: [s * 0.175, 0.95, 0.415], r: 0.028 },
      { start: [s * 0.105, 0.925, 0.515], tip: [s * 0.195, 0.905, 0.41], r: 0.034 },
      { start: [s * 0.102, 0.895, 0.52], tip: [s * 0.185, 0.86, 0.42], r: 0.032 },
      { start: [s * 0.088, 0.87, 0.515], tip: [s * 0.155, 0.825, 0.435], r: 0.027 },
      { start: [s * 0.068, 0.855, 0.5], tip: [s * 0.118, 0.8, 0.44], r: 0.023 },
    ];
    for (const [spIdx, sp] of cheekSpikes.entries()) {
      b.spike(sp.start, sp.tip, null, sp.r, {
        bone: head,
        color: spIdx < 2 ? wolfCoatPaint : chestRuffPaint,
        sides: 5,
        smooth: false,
        extend: [0.025, 0],
        group: "head",
        name: `cheekRuff${side}_${spIdx}`,
      });
    }

    // Heavy furrowed Warcraft brow ridge
    b.sweep(
      catmull([
        [s * 0.022, 0.992, 0.605],
        [s * 0.062, 1.008, 0.585],
        [s * 0.094, 0.994, 0.548],
      ]),
      [0.022, 0.028, 0.02],
      {
        bone: head,
        color: darkHacklePaint,
        sides: 6,
        smooth: false,
        group: "head",
        name: `browRidge${side}`,
      },
    );

    // Recessed dark eye socket & lower eyelid rim
    const eyeCenter: [number, number, number] = [s * 0.064, 0.974, 0.578];
    b.part(new THREE.SphereGeometry(0.023, 6, 5), NOSE_BLACK, {
      bone: head,
      at: eyeCenter,
      scale: [0.95, 0.82, 0.95],
      flat: true,
      group: "head",
      name: `eyeSocket${side}`,
    });

    // Piercing glowing amber eyeball
    glow(
      b.part(new THREE.SphereGeometry(0.0185, 6, 5), EYE_GOLD, {
        bone: head,
        at: [s * 0.066, 0.974, 0.583],
        scale: [0.92, 0.84, 0.92],
        flat: true,
        group: "head",
        name: `eyeGlow${side}`,
      }),
      1.45,
    );

    // Bright fiery inner iris & dark vertical lupine pupil + catchlight
    glow(
      b.part(new THREE.SphereGeometry(0.011, 5, 4), EYE_BRIGHT, {
        bone: head,
        at: [s * 0.071, 0.974, 0.594],
        scale: [0.85, 0.9, 0.65],
        flat: true,
        group: "head",
      }),
      1.7,
    );
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), NOSE_BLACK, {
      bone: head,
      at: [s * 0.073, 0.975, 0.598],
      scale: [0.65, 1.15, 0.5],
      flat: true,
      group: "head",
      name: `pupil${side}`,
    });
  }

  // Battle scars across the left brow and upper snout (s = 1, Left side)
  b.capsule([0.052, 1.018, 0.562], [0.074, 0.942, 0.605], 0.0055, SCAR_PINK, {
    bone: head,
    sides: 5,
    smooth: false,
    group: "head",
    name: "browScarL",
  });
  b.capsule([-0.018, 0.978, 0.648], [0.036, 0.955, 0.672], 0.0048, SCAR_PINK, {
    bone: head,
    sides: 5,
    smooth: false,
    group: "head",
    name: "muzzleScar",
  });

  // Upper gums & dentition (canine fangs + incisors + carnassials on `head`)
  b.part(new THREE.BoxGeometry(0.058, 0.016, 0.115), GUM_DARK, {
    bone: head,
    at: [0, 0.912, 0.655],
    flat: true,
    group: "head",
    name: "upperPalate",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Large curved upper canine fang
    b.sweep(
      bezier(
        [s * 0.031, 0.916, 0.704],
        [s * 0.034, 0.892, 0.708],
        [s * 0.029, 0.872, 0.701],
      ),
      [0.0095, 0],
      {
        bone: head,
        color: FANG_IVORY,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `upperCanine${side}`,
      },
    );

    // 3 upper premolars along each side
    for (let m = 0; m < 3; m++) {
      const zM = 0.675 - m * 0.024;
      b.spike([s * 0.032, 0.912, zM], [0, -1, 0], 0.018, 0.0065, {
        bone: head,
        color: FANG_IVORY,
        sides: 4,
        smooth: false,
        group: "head",
      });
    }
  }
  // Upper incisor row
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.0085, 0.915, 0.722], [0, -1, 0.15], 0.013, 0.0042, {
      bone: head,
      color: FANG_IVORY,
      sides: 4,
      smooth: false,
      group: "head",
    });
  }

  // Articulated Lower Jaw (`jaw` bone) — slightly parted alert stance
  b.loft(
    [
      { at: [0, 0.888, 0.535], w: 0.122, h: 0.068 },
      { at: [0, 0.875, 0.615], w: 0.088, h: 0.056 },
      { at: [0, 0.868, 0.685], w: 0.062, h: 0.046 },
      { at: [0, 0.866, 0.718], w: 0.046, h: 0.038 },
    ],
    {
      bone: jaw,
      color: chestRuffPaint,
      sides: 8,
      group: "head",
      name: "lowerJaw",
    },
  );

  // Chin beard tuft under lower jaw
  for (const [idx, dx] of [0, 0.024, -0.024].entries()) {
    b.spike(
      [dx, 0.862, 0.64 - idx * 0.015],
      [dx * 0.4, -0.55, -0.82],
      0.068,
      0.019,
      {
        bone: jaw,
        color: BRIGHT_RUFF,
        sides: 5,
        smooth: false,
        extend: [0.015, 0],
        group: "head",
      },
    );
  }

  // Lower gums, sculpted tongue, lower canine fangs & molars
  b.part(new THREE.BoxGeometry(0.048, 0.014, 0.105), GUM_DARK, {
    bone: jaw,
    at: [0, 0.884, 0.645],
    rotation: [8, 0, 0],
    flat: true,
    group: "head",
    name: "lowerGum",
  });

  b.sweep(
    catmull([
      [0, 0.888, 0.59],
      [0, 0.892, 0.65],
      [0, 0.886, 0.702],
    ]),
    (t) => [0.021 * (1 - 0.25 * t), 0.008],
    {
      bone: jaw,
      color: TONGUE_RED,
      sides: 6,
      group: "head",
      name: "tongue",
    },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Lower lip flew
    b.sweep(
      catmull([
        [s * 0.02, 0.882, 0.71],
        [s * 0.034, 0.885, 0.65],
        [s * 0.045, 0.89, 0.585],
      ]),
      0.0095,
      {
        bone: jaw,
        color: NOSE_BLACK,
        sides: 5,
        smooth: false,
        group: "head",
      },
    );

    // Lower canine fang curving upward
    b.sweep(
      bezier(
        [s * 0.024, 0.882, 0.692],
        [s * 0.027, 0.902, 0.698],
        [s * 0.023, 0.918, 0.694],
      ),
      [0.008, 0],
      {
        bone: jaw,
        color: FANG_IVORY,
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
        group: "head",
        name: `lowerCanine${side}`,
      },
    );

    // Lower premolars
    for (let m = 0; m < 3; m++) {
      const zM = 0.665 - m * 0.022;
      b.spike([s * 0.025, 0.885, zM], [0, 1, 0], 0.015, 0.0055, {
        bone: jaw,
        color: FANG_IVORY,
        sides: 4,
        smooth: false,
        group: "head",
      });
    }
  }

  // Alert Pointed Ears (`earL`, `earR`) — Left ear has a battle notch
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = ears[s];

    const earOutline: Array<[number, number] | [number, number, "sharp"]> =
      s > 0
        ? [
            // Left ear with battle-scar V-notch on outer edge
            [-0.042, 0],
            [-0.048, 0.055],
            [-0.022, 0.072, "sharp"],
            [-0.038, 0.092, "sharp"],
            [0.004, 0.155, "sharp"],
            [0.044, 0.068],
            [0.038, 0],
          ]
        : [
            // Intact right ear
            [-0.042, 0],
            [-0.048, 0.065],
            [0.004, 0.155, "sharp"],
            [0.044, 0.068],
            [0.038, 0],
          ];

    // Outer furred ear shell
    b.extrude(earOutline, {
      bone: earJoint,
      at: [s * 0.084, 1.02, 0.462],
      x: [s * 0.92, -0.22, -0.32],
      y: [s * 0.24, 0.95, 0.12],
      thickness: [0.034, 0.008],
      bevel: 0.004,
      smoothing: 1,
      color: darkHacklePaint,
      group: "head",
      name: `earOuter${side}`,
    });

    // Pinkish-cream inner ear hollow plate
    b.extrude(
      [
        [-0.024, 0.012],
        [-0.028, 0.055],
        [0.002, 0.122, "sharp"],
        [0.025, 0.055],
        [0.02, 0.012],
      ],
      {
        bone: earJoint,
        at: [s * 0.084, 1.022, 0.476],
        x: [s * 0.92, -0.22, -0.32],
        y: [s * 0.24, 0.95, 0.12],
        thickness: [0.014, 0.004],
        smoothing: 1,
        color: EAR_INNER,
        group: "head",
        name: `earInner${side}`,
      },
    );

    // Fluffy cream ear-furnishing tufts at the inner base of each ear
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const yT = 1.035 + tIdx * 0.022;
      b.spike(
        [s * 0.068, yT, 0.482],
        [s * 0.65, 0.45, 0.55],
        0.048 - tIdx * 0.006,
        0.014,
        {
          bone: earJoint,
          color: BRIGHT_RUFF,
          sides: 4,
          smooth: false,
          group: "head",
        },
      );
    }
  }

  // =========================================================================
  // 5. FORELEG & HINDLEG LIMBS, FEATHERING, BRACER & HEROIC PAWS
  // =========================================================================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // ----- FORELEG -----
    const fChain = foreLegs[s];
    const shoulderJ = fChain.joints[0];
    const elbowJ = fChain.joints[1];
    const wristJ = fChain.joints[2];
    const pawFJ = fChain.joints[3];

    // Smooth-skinned foreleg tube from shoulder through elbow and wrist to paw
    b.sweep(
      fChain,
      (t) => {
        const r = t < 0.45 ? 0.082 - 0.048 * t : 0.06 - 0.032 * (t - 0.45);
        return [r * 0.88, r * 1.08];
      },
      {
        color: wolfCoatPaint,
        sides: 8,
        group: `legF${side}`,
        name: `forelegTube${side}`,
      },
    );

    // Elbow olecranon spur & 3 feathered fur locks behind the elbow
    for (let fIdx = 0; fIdx < 3; fIdx++) {
      const basePt = offset(elbowJ.at, [0, -0.045 * fIdx, -0.02], 1);
      const tipPt = offset(basePt, [s * 0.12, -0.35, -0.92], 0.088 - fIdx * 0.012);
      b.spike(basePt, tipPt, null, 0.024 - fIdx * 0.003, {
        bone: fIdx === 0 ? shoulderJ : elbowJ,
        color: chestRuffPaint,
        sides: 5,
        smooth: false,
        extend: [0.02, 0],
        group: `legF${side}`,
      });
    }

    // Carpal pad & dewclaw on inner/back wrist
    b.part(new THREE.SphereGeometry(0.015, 5, 4), NOSE_BLACK, {
      bone: wristJ,
      at: [s * 0.145, 0.165, 0.228],
      flat: true,
      group: `legF${side}`,
      name: `carpalPad${side}`,
    });
    b.spike([s * 0.125, 0.145, 0.255], [-s * 0.3, -0.7, 0.5], 0.025, 0.007, {
      bone: wristJ,
      color: CLAW_HORN,
      sides: 4,
      smooth: false,
      group: `legF${side}`,
      name: `dewclaw${side}`,
    });

    // Right Forearm Battle-Scarred Leather Bracer & Iron Buckles (s = -1)
    if (s < 0) {
      const bracerTop = offset(elbowJ.at, [0, -0.075, 0.008], 1);
      const bracerBot = offset(wristJ.at, [0, 0.045, -0.004], 1);
      b.rod(bracerTop, bracerBot, [0.056, 0.046], leatherPaint, {
        bone: elbowJ,
        sides: 8,
        smooth: false,
        group: "accessories",
        name: "forearmBracerR",
      });
      for (const frac of [0.22, 0.78]) {
        const ringPt = [
          bracerTop.x + (bracerBot.x - bracerTop.x) * frac,
          bracerTop.y + (bracerBot.y - bracerTop.y) * frac,
          bracerTop.z + (bracerBot.z - bracerTop.z) * frac,
        ];
        b.part(new THREE.TorusGeometry(0.052, 0.0065, 5, 8), IRON_LIGHT, {
          bone: elbowJ,
          at: ringPt,
          rotation: [85, 0, 0],
          flat: true,
          group: "accessories",
        });
        b.spike(
          [ringPt[0] - 0.048, ringPt[1], ringPt[2] + 0.01],
          [-1, 0, 0.25],
          0.026,
          0.012,
          {
            bone: elbowJ,
            color: BRONZE_STUD,
            sides: 4,
            smooth: false,
            group: "accessories",
          },
        );
      }
    }

    // ----- HINDLEG -----
    const hChain = hindLegs[s];
    const kneeJ = hChain.joints[1];
    const hockJ = hChain.joints[2];
    const pawHJ = hChain.joints[3];

    // Smooth-skinned hindleg tube from hip through stifle and hock to hind paw
    b.sweep(
      hChain,
      (t) => {
        const rx = t < 0.42 ? 0.086 - 0.052 * t : 0.058 - 0.028 * (t - 0.42);
        const ry = t < 0.42 ? 0.108 - 0.065 * t : 0.068 - 0.032 * (t - 0.42);
        return [rx, ry];
      },
      {
        color: wolfCoatPaint,
        sides: 8,
        group: `legH${side}`,
        name: `hindlegTube${side}`,
      },
    );

    // Prominent calcaneus (hock heel point) & rear hock fur tuft
    b.capsule(
      hockJ.at,
      offset(hockJ.at, [0, 0.028, -0.042], 1),
      [0.036, 0.024],
      wolfCoatPaint,
      {
        bone: hockJ,
        sides: 6,
        smooth: false,
        group: `legH${side}`,
        name: `calcaneus${side}`,
      },
    );
    for (let hIdx = 0; hIdx < 2; hIdx++) {
      const startPt = offset(kneeJ.at, [0, -0.09 - hIdx * 0.055, -0.035], 1);
      const tipPt = offset(startPt, [s * 0.1, -0.35, -0.92], 0.082);
      b.spike(startPt, tipPt, null, 0.023, {
        bone: kneeJ,
        color: chestRuffPaint,
        sides: 5,
        smooth: false,
        extend: [0.02, 0],
        group: `legH${side}`,
      });
    }

    // ----- FOUR SCULPTED PAWS (resting cleanly on y = 0) -----
    const pawsToBuild = [
      { joint: pawFJ, cx: s * 0.155, cz: 0.28, scaleW: 1.06, group: `legF${side}`, tag: `F${side}` },
      { joint: pawHJ, cx: s * 0.146, cz: -0.35, scaleW: 0.96, group: `legH${side}`, tag: `H${side}` },
    ];

    for (const paw of pawsToBuild) {
      // Main metacarpal/metatarsal heel pad: cylinder height 0.024 centered at y = 0.012 -> bottom at y = 0.000
      b.part(new THREE.CylinderGeometry(0.044 * paw.scaleW, 0.048 * paw.scaleW, 0.024, 7), NOSE_BLACK, {
        bone: paw.joint,
        at: [paw.cx, 0.012, paw.cz + 0.012],
        scale: [1, 1, 1.15],
        flat: true,
        group: paw.group,
        name: `mainPad${paw.tag}`,
      });

      // Upper paw dorsum bridge
      b.sweep(
        [
          [paw.cx, 0.062, paw.cz - 0.005],
          [paw.cx, 0.036, paw.cz + 0.042],
        ],
        [0.048 * paw.scaleW, 0.042 * paw.scaleW],
        {
          bone: paw.joint,
          color: wolfCoatPaint,
          sides: 6,
          smooth: false,
          group: paw.group,
          name: `pawBridge${paw.tag}`,
        },
      );

      // 4 sculpted digitigrade toes + digital pads on y = 0 + knuckle tufts + curved claws
      const toeOffsets = [
        { dx: -0.034 * paw.scaleW, dz: 0.046, len: 0.052, spread: -0.22 },
        { dx: -0.012 * paw.scaleW, dz: 0.06, len: 0.058, spread: -0.06 },
        { dx: 0.012 * paw.scaleW, dz: 0.06, len: 0.058, spread: 0.06 },
        { dx: 0.034 * paw.scaleW, dz: 0.046, len: 0.052, spread: 0.22 },
      ];

      for (const [tIdx, toe] of toeOffsets.entries()) {
        const tx = paw.cx + toe.dx;
        const tz = paw.cz + toe.dz;

        // Digital toe pad resting flat on y = 0 (height 0.02 centered at y = 0.010 -> bottom at y = 0.000)
        b.part(new THREE.CylinderGeometry(0.015, 0.017, 0.02, 6), NOSE_BLACK, {
          bone: paw.joint,
          at: [tx, 0.01, tz + 0.012],
          scale: [0.92, 1, 1.25],
          flat: true,
          group: paw.group,
        });

        // Arched toe phalanx sweep
        b.sweep(
          bezier(
            [paw.cx + toe.dx * 0.72, 0.044, paw.cz + 0.015],
            [tx, 0.048, tz + 0.005],
            [tx + toe.spread * 0.012, 0.022, tz + 0.026],
          ),
          [0.0185, 0.015],
          {
            bone: paw.joint,
            color: FROST_CREAM,
            sides: 6,
            smooth: false,
            group: paw.group,
            name: `toe${paw.tag}_${tIdx}`,
          },
        );

        // Heavy curved Warcraft claw (stays above y = 0.002 so it never sinks below floor)
        const clawBase: [number, number, number] = [tx + toe.spread * 0.012, 0.024, tz + 0.028];
        const clawCtrl: [number, number, number] = [tx + toe.spread * 0.018, 0.021, tz + 0.048];
        const clawTip: [number, number, number] = [tx + toe.spread * 0.022, 0.004, tz + 0.062];
        b.sweep(bezier(clawBase, clawCtrl, clawTip), [0.0085, 0], {
          bone: paw.joint,
          color: CLAW_HORN,
          sides: 4,
          smooth: false,
          caps: { start: "flat", end: "point" },
          group: paw.group,
          name: `claw${paw.tag}_${tIdx}`,
        });
      }
    }
  }

  // =========================================================================
  // 6. BUSHY PLUME TAIL & SCULPTED TAIL FUR TUFTS
  // =========================================================================
  const tailSweep = b.sweep(
    tail,
    (t) => {
      const swell = Math.sin(Math.min(t * 1.15, 1) * Math.PI);
      const rx = 0.052 * (1 - 0.7 * t) + 0.056 * swell;
      const ry = 0.058 * (1 - 0.7 * t) + 0.068 * swell;
      return [rx, ry];
    },
    {
      color: wolfCoatPaint,
      sides: 8,
      caps: { start: "round", end: "point" },
      group: "tail",
      name: "tailPlume",
    },
  );

  // Layered jagged fur spikes along the bushy tail
  const tailRingTs = [0.22, 0.44, 0.66, 0.84];
  for (const [rIdx, tVal] of tailRingTs.entries()) {
    const cPt = tail.at(tVal);
    const scale = 1 - Math.abs(tVal - 0.5) * 0.65;
    b.ring(
      frame(cPt.at, cPt.tangent),
      {
        count: 6,
        radius: 0.052 * scale,
        tilt: 24,
        parent: cPt.bone,
        group: "tail",
      },
      (item) => {
        const tipPt = offset(
          item.at,
          [
            item.outward.x * 0.45 + cPt.tangent.x * 0.85,
            item.outward.y * 0.45 + cPt.tangent.y * 0.85 - 0.12,
            item.outward.z * 0.45 + cPt.tangent.z * 0.85,
          ],
          0.135 * scale,
        );
        b.spike(item.at, tipPt, null, 0.032 * scale, {
          bone: cPt.bone,
          color: wolfCoatPaint,
          sides: 5,
          smooth: false,
          extend: [0.025, 0],
          group: "tail",
          name: `tailTuft_${rIdx}_${item.i}`,
        });
      },
    );
  }

  // =========================================================================
  // 7. LAYERED FUR CARDS OVER NECK, SHOULDERS, BACK, FLANKS & TAIL
  // =========================================================================
  const bodySurface = b.surface([bodyLoft, skullLoft, tailSweep]);
  const coatHits = bodySurface.scatter(190, {
    rng: rng(101),
    minDist: 0.042,
    filter: (h) => h.n.y > -0.35 && h.at.z < 0.54,
  });

  b.cards(coatHits, FUR_CARD_TEX, {
    size: [0.058, 0.095],
    lean: 62,
    bend: 22,
    detail: 0.6,
    vary: 0.25,
    spin: 14,
    rng: rng(202),
    flow: (f) => [f.at.x * 0.25, -0.28, -1],
    color: wolfCoatPaint,
    group: "furCards",
    name: "coatFurCards",
  });

  // Extra dense ruff cards around the neck and upper chest
  const ruffSurface = b.surface(bodyLoft);
  const ruffHits = ruffSurface.scatter(75, {
    rng: rng(303),
    minDist: 0.032,
    filter: (h) => h.at.z > 0.18 && h.at.y > 0.58,
  });

  b.cards(ruffHits, FUR_CARD_TEX, {
    size: [0.072, 0.125],
    lean: 48,
    bend: 26,
    detail: 0.6,
    vary: 0.22,
    spin: 18,
    rng: rng(404),
    flow: (f) => [f.at.x * 0.35, -0.35, -0.9],
    color: wolfCoatPaint,
    group: "furCards",
    name: "ruffFurCards",
  });

  return b.root;
}
