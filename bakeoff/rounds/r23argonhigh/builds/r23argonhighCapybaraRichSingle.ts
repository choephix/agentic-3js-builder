import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { countershade, grain, mix, mottle, paint, smoothstep, spots } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Barnaby & Pip",
  description:
    "Whimsical storybook capybara with a polka-dot neckerchief, brass bell, pond-lily corsage, crown lotus pad, golden yuzu citrus, and a cheerful songbird perched on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------
// SVG Textures (eyes, blush, fur tufts, whiskers, bird feathers)
// ---------------------------------------------------------------------------

const CAPY_EYE_TEX = svg(
  `<svg viewBox="0 0 96 72">
    <defs>
      <clipPath id="eyeClip">
        <path d="M8 38 Q48 10 88 36 Q52 64 8 38 Z"/>
      </clipPath>
    </defs>
    <!-- Soft warm shadow around socket -->
    <ellipse cx="48" cy="37" rx="43" ry="24" fill="#3a1f12" opacity="0.55"/>
    <!-- Dark espresso lash outline -->
    <path d="M5 38 Q48 6 91 35 Q52 67 5 38 Z" fill="#211109"/>
    <g clip-path="url(#eyeClip)">
      <!-- Warm cream sclera corners -->
      <rect x="0" y="0" width="96" height="72" fill="#f7ead7"/>
      <!-- Rich chestnut-amber iris -->
      <ellipse cx="50" cy="36" rx="26" ry="23" fill="#5e3117"/>
      <ellipse cx="50" cy="40" rx="22" ry="18" fill="#8f4d22"/>
      <ellipse cx="50" cy="45" rx="16" ry="11" fill="#c77b36"/>
      <!-- Deep dark pupil -->
      <ellipse cx="50" cy="36" rx="12" ry="14" fill="#170b06"/>
      <!-- Sleepy upper eyelid shadow band -->
      <rect x="0" y="0" width="96" height="27" fill="#381d10"/>
      <path d="M4 27 Q48 31 92 25" stroke="#1c0d06" stroke-width="4" fill="none"/>
    </g>
    <!-- Glossy catchlights -->
    <ellipse cx="39" cy="30" rx="6.5" ry="5" transform="rotate(-15 39 30)" fill="#ffffff"/>
    <circle cx="60" cy="43" r="3.2" fill="#fff6e5"/>
    <!-- Friendly outer corner lash flicks -->
    <path d="M12 36 Q4 31 2 24" stroke="#211109" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M16 42 Q8 42 4 38" stroke="#211109" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 256 },
);

const CHEEK_BLUSH_TEX = svg(
  `<svg viewBox="0 0 80 56">
    <ellipse cx="40" cy="28" rx="34" ry="20" fill="#e8746b" opacity="0.82"/>
    <ellipse cx="40" cy="28" rx="24" ry="13" fill="#f5958c" opacity="0.9"/>
    <path d="M24 34 L31 21 M38 35 L45 21 M52 34 L59 21" stroke="#c95249" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

// Grayscale fur tuft so `b.cards` tints each card with the capybara's coatPaint at its root
const FUR_TUFT_TEX = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M16 94 Q10 56 6 16 Q22 44 27 72 Q29 36 33 4 Q42 38 41 70 Q49 42 58 20 Q53 58 48 94 Z" fill="#d8d8d8"/>
    <path d="M22 94 Q19 60 15 28 Q27 52 30 76 Q32 46 34 16 Q40 48 39 76 Q46 52 51 32 Q47 64 43 94 Z" fill="#ffffff"/>
    <path d="M18 95 Q32 82 46 95" stroke="#9e9e9e" stroke-width="5" fill="none"/>
  </svg>`,
  { size: 192 },
);

// Whisker fan card texture in warm ivory
const WHISKER_TEX = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M28 94 Q20 52 6 8" stroke="#f7ebd4" stroke-width="4.2" stroke-linecap="round" fill="none"/>
    <path d="M32 94 Q32 48 31 4" stroke="#fff6e6" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M36 94 Q45 52 58 10" stroke="#f7ebd4" stroke-width="4.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

// Grayscale scalloped feather texture for the perched songbird's plumage cards
const FEATHER_TEX = svg(
  `<svg viewBox="0 0 64 96">
    <path d="M14 92 Q8 48 32 6 Q56 48 50 92 Z" fill="#dcdcdc"/>
    <path d="M20 90 Q16 52 32 14 Q48 52 44 90 Z" fill="#ffffff"/>
    <path d="M32 92 L32 12" stroke="#b0b0b0" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara", paintSize: 1024 });

  // -------------------------------------------------------------------------
  // Palette & Procedural Paints
  // -------------------------------------------------------------------------
  const DARK_UMBER = "#361d10";
  const ESPRESSO = "#4a2917";
  const NOSE_VELVET = "#2b160c";
  const NOSTRIL_DARK = "#170b05";
  const INNER_EAR_ROSE = "#d9897c";
  const CREAM_FUR = "#f2dec0";
  const TOOTH_IVORY = "#fbf2dc";
  const TONGUE_PINK = "#e57a77";
  const HOOF_HORN = "#28170e";
  const PAW_PAD_DARK = "#331c11";
  const WEBBING_TAN = "#7a492b";

  const SAGE_DARK = "#2d6e57";
  const BERRY_RED = "#cf423c";
  const BERRY_DARK = "#962823";
  const BRASS_GOLD = "#f2b838";
  const BRASS_SHADOW = "#b87f19";

  const LOTUS_GREEN = "#489952";
  const LOTUS_LIGHT = "#76bf6b";
  const LOTUS_STEM = "#33733d";
  const LILY_PINK = "#f58ca8";
  const LILY_CREAM = "#fff0f4";
  const YUZU_LEAF = "#3b8c42";

  const BIRD_BLUE = "#3993e6";
  const BIRD_NAVY = "#1f4a7c";
  const BIRD_GOLD = "#ffd147";
  const BIRD_CREAM = "#fff3c4";
  const BIRD_CORAL = "#f06d30";
  const BIRD_INK = "#1c1624";

  // Capybara coat paint: warm cinnamon-amber dorsal coat with longitudinal coarse hair grain,
  // countershaded into a honey-biscuit belly, with dark espresso stockings and dark cocoa muzzle
  const dorsalFur = grain(
    mottle("#b86832", "#cf8147", { size: 0.13, contrast: 1.1, seed: 11 }),
    "#87441b",
    { size: 0.016, axis: "z", seed: 12 },
  );
  const bellyFur = grain(
    mottle("#e6c08e", "#f3d5ab", { size: 0.12, seed: 13 }),
    "#c99b66",
    { size: 0.018, axis: "z", seed: 14 },
  );
  const bodyShade = countershade(dorsalFur, bellyFur, { level: -0.15, soft: 0.36 });
  const darkPointFur = grain(
    mottle("#472715", "#613720", { size: 0.08, seed: 15 }),
    "#2e180c",
    { size: 0.014, axis: "y", seed: 16 },
  );

  const coatPaint = paint((p, n) => {
    const base = bodyShade.at(p, n);
    const sockT = smoothstep(0.17, 0.035, p.y);
    const muzzleT = smoothstep(0.5, 0.61, p.z) * smoothstep(0.41, 0.56, p.y);
    const earRimT = smoothstep(0.55, 0.6, p.y) * smoothstep(0.44, 0.36, p.z);
    const darkT = Math.max(sockT * 0.9, muzzleT * 0.82, earRimT * 0.65);
    return mix(base, darkPointFur.at(p, n), darkT);
  });

  // Woven sage-and-cream polka-dot neckerchief paint with berry-red trim
  const bandanaBase = spots(
    mottle("#367d64", "#48967b", { size: 0.05, seed: 21 }),
    "#fbf0d4",
    { size: 0.028, amount: 0.45, seed: 22 },
  );

  // Dimpled golden yuzu citrus rind paint
  const yuzuPaint = spots(
    mottle("#ffa81e", "#ffc83b", { size: 0.025, seed: 31 }),
    "#d97808",
    { size: 0.011, amount: 0.48, seed: 32 },
  );

  // Songbird paint: sky-blue back/cap countershaded into sunny buttercup breast and cream belly
  const birdBack = mottle(BIRD_BLUE, "#5eb2ff", { size: 0.035, seed: 41 });
  const birdBreast = mottle(BIRD_GOLD, BIRD_CREAM, { size: 0.035, seed: 42 });
  const birdCoatPaint = countershade(birdBack, birdBreast, { level: -0.05, soft: 0.3 });

  // -------------------------------------------------------------------------
  // 1. Skeleton — Root, Spine, Tail, Neck, Head, Jaw, Ears, Limbs, Digits & Bird
  // -------------------------------------------------------------------------
  const bodyCurve = catmull([
    [0, 0.36, -0.45],
    [0, 0.36, -0.26],
    [0, 0.35, -0.08],
    [0, 0.37, 0.12],
    [0, 0.4, 0.3],
  ]);

  const core = b.joint("core", {
    at: [0, 0.35, -0.08],
    dir: [0, 0.05, 1],
    role: "spine",
    group: "torso",
  });

  const rootT = bodyCurve.closestT(core.at);
  const frontSpine = b.chain("front", bodyCurve.slice(rootT, 1), {
    parent: core,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "torso",
  });
  const backSpine = b.chain("back", bodyCurve.slice(rootT, 0), {
    parent: core,
    count: 2,
    names: ["pelvis", "rump"],
    role: "spine",
    group: "torso",
  });

  // Cute stubby vestigial capybara tail nub at the rump
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.355, -0.45],
      [0, 0.34, -0.51],
      [0, 0.315, -0.555],
    ]),
    {
      parent: backSpine.joints[1],
      count: 2,
      names: ["tail1", "tail2"],
      role: "tail",
      group: "tail",
    },
  );

  // Thick, sturdy neck rising to the blocky head
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.4, 0.3],
      [0, 0.45, 0.355],
      [0, 0.495, 0.405],
    ]),
    {
      parent: frontSpine.joints[2],
      count: 2,
      names: ["neck1", "neck2"],
      role: "neck",
      group: "neck",
    },
  );

  // Hinged brass bell joint hanging at the front of the neckerchief
  const bellJoint = b.joint("bellJoint", {
    parent: neckChain.joints[0],
    at: [0, 0.255, 0.415],
    dir: [0, -1, 0.08],
    role: "hinge",
    group: "collar",
  });

  // Head, upper snout, and articulated lower jaw
  const head = b.joint("head", {
    parent: neckChain.joints[1],
    at: [0, 0.495, 0.405],
    dir: [0, -0.03, 1],
    role: "head",
    group: "head",
  });

  const snout = b.joint("snout", {
    parent: head,
    at: [0, 0.5, 0.505],
    dir: [0, -0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.445, 0.445],
    dir: [0, -0.14, 1],
    role: "jaw",
    group: "head",
  });

  // Cupped ears set far back on the crown
  const earJoints: Record<"L" | "R", ReturnType<typeof b.joint>> = {
    L: b.joint("earL", {
      parent: head,
      at: [0.092, 0.572, 0.392],
      dir: [0.68, 0.64, -0.35],
      role: "hinge",
      group: "head",
    }),
    R: b.joint("earR", {
      parent: head,
      at: [-0.092, 0.572, 0.392],
      dir: [-0.68, 0.64, -0.35],
      role: "hinge",
      group: "head",
    }),
  };

  // Songbird skeleton perched on top of the capybara's flat crown
  const birdBody = b.joint("birdBody", {
    parent: head,
    at: [0.012, 0.642, 0.425],
    dir: [-0.08, 0.22, 0.97],
    role: "spine",
    group: "bird",
  });

  const birdHead = b.joint("birdHead", {
    parent: birdBody,
    at: [0.008, 0.694, 0.462],
    dir: [-0.1, 0.08, 0.99],
    role: "head",
    group: "bird",
  });

  const birdJaw = b.joint("birdJaw", {
    parent: birdHead,
    at: [0.005, 0.684, 0.498],
    dir: [-0.1, -0.22, 0.97],
    role: "jaw",
    group: "bird",
  });

  const birdWingL = b.joint("birdWingL", {
    parent: birdBody,
    at: [0.052, 0.662, 0.432],
    dir: [0.32, -0.18, -0.93],
    role: "wing",
    group: "bird",
  });

  const birdWingR = b.joint("birdWingR", {
    parent: birdBody,
    at: [-0.028, 0.662, 0.432],
    dir: [-0.32, -0.18, -0.93],
    role: "wing",
    group: "bird",
  });

  const birdTail = b.joint("birdTail", {
    parent: birdBody,
    at: [0.016, 0.652, 0.376],
    dir: [0.06, 0.48, -0.87],
    role: "tail",
    group: "bird",
  });

  const birdLegL = b.joint("birdLegL", {
    parent: birdBody,
    at: [0.032, 0.625, 0.432],
    dir: [0.06, -0.98, 0.16],
    role: "leg",
    group: "bird",
  });

  const birdLegR = b.joint("birdLegR", {
    parent: birdBody,
    at: [-0.008, 0.625, 0.432],
    dir: [-0.06, -0.98, 0.16],
    role: "leg",
    group: "bird",
  });

  // -------------------------------------------------------------------------
  // 2. Torso, Chest, Haunches & Vestigial Tail Geometry
  // -------------------------------------------------------------------------
  const torsoLoft = b.loft(
    [
      { at: [0, 0.355, -0.47], w: 0.25, h: 0.25 },
      { at: [0, 0.365, -0.34], w: 0.39, h: 0.35 },
      { at: [0, 0.355, -0.16], w: 0.43, h: 0.38 },
      { at: [0, 0.35, 0.02], w: 0.42, h: 0.38 },
      { at: [0, 0.37, 0.18], w: 0.37, h: 0.35 },
      { at: [0, 0.405, 0.3], w: 0.32, h: 0.31 },
      { at: [0, 0.455, 0.365], w: 0.27, h: 0.28 },
      { at: [0, 0.495, 0.42], w: 0.24, h: 0.25 },
    ],
    {
      bone: [backSpine, core, frontSpine, neckChain],
      color: coatPaint,
      group: "torso",
      name: "torsoLoft",
    },
  );

  // Cozy plump brisket / chest dewlap swell under the front chest
  b.sweep(
    catmull([
      [0, 0.23, 0.08],
      [0, 0.24, 0.22],
      [0, 0.3, 0.35],
      [0, 0.39, 0.42],
    ]),
    [0.095, 0.115, 0.095, 0.065],
    {
      bone: [frontSpine, neckChain],
      color: bellyFur,
      group: "torso",
      name: "chestDewlap",
    },
  );

  // Stubby capybara tail nub + surrounding rump rosette tufts
  b.sweep(tailChain, [0.044, 0.032, 0.018], {
    color: coatPaint,
    group: "tail",
    name: "tailNub",
  });
  b.ring(
    frame([0, 0.35, -0.465], [0, -0.2, -1]),
    { count: 6, radius: 0.032, tilt: 28, group: "tail" },
    (it) => {
      b.capsule(it.at, offset(it.at, it.outward, 0.038), [0.018, 0.011], {
        bone: tailChain.joints[0],
        color: coatPaint,
        sides: 6,
        group: "tail",
      });
    },
  );

  // -------------------------------------------------------------------------
  // 3. Four Limbs & Webbed Digits (4 Front Toes, 3 Hind Toes)
  // -------------------------------------------------------------------------
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;

    // --- FRONT LEG (4 toes) ---
    const fSocket: V3 = [sx * 0.135, 0.33, 0.24];
    const fAnkle: V3 = [sx * 0.135, 0.042, 0.265];
    const fPts = limb(
      fSocket,
      fAnkle,
      [0.135, 0.115, 0.075],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const legF = b.chain(`legF${side}`, fPts, {
      parent: frontSpine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [sx * 0.135, 0, 0.295],
      group: `legF${side}`,
    });

    // Upper shoulder muscle mass blending into torso
    b.sweep(
      catmull([
        [sx * 0.11, 0.385, 0.21],
        [sx * 0.145, 0.32, 0.235],
        fPts[1],
      ]),
      [0.088, 0.078, 0.056],
      {
        bone: legF.joints[0],
        color: coatPaint,
        group: `legF${side}`,
        name: `shoulderMass${side}`,
      },
    );

    // Main foreleg tube
    b.sweep(legF, [0.074, 0.056, 0.045, 0.049], {
      color: coatPaint,
      group: `legF${side}`,
      name: `forelegTube${side}`,
    });

    // Cushioned palmar paw pad resting squarely on y = 0 (height 0.016, center y = 0.008)
    const pawF = legF.tip!;
    b.part(new THREE.CylinderGeometry(0.044, 0.048, 0.016, 8), PAW_PAD_DARK, {
      bone: pawF,
      at: [sx * 0.135, 0.008, 0.275],
      scale: [1.05, 1, 1.15],
      group: `legF${side}`,
      name: `pawPadF${side}`,
    });

    // 4 Front Toes (anatomically true to capybaras: 4 webbed digits on front feet)
    const fToeConfigs = [
      { idx: 1, dx: -0.032, dz: 0.052, len: 0.048 },
      { idx: 2, dx: -0.01, dz: 0.062, len: 0.056 },
      { idx: 3, dx: 0.014, dz: 0.06, len: 0.054 },
      { idx: 4, dx: 0.035, dz: 0.048, len: 0.045 },
    ];
    const fToeStarts: V3[] = [];
    const fToeTips: V3[] = [];

    for (const tc of fToeConfigs) {
      const tStart: V3 = [sx * (0.135 + tc.dx * 0.45), 0.014, 0.272];
      const tTip: V3 = [sx * (0.135 + tc.dx), 0.013, 0.272 + tc.dz];
      fToeStarts.push(tStart);
      fToeTips.push(tTip);

      const toeJoint = b.joint(`toeF${tc.idx}${side}`, {
        parent: pawF,
        at: tStart,
        aim: tTip,
        role: "digit",
        group: `legF${side}`,
      });

      // Toe cylinder with sides: 6 so bottom flat face sits at y = 0.014 - 0.014 = 0.000
      b.capsule(tStart, tTip, [0.014, 0.012], {
        bone: toeJoint,
        color: ESPRESSO,
        sides: 6,
        group: `legF${side}`,
        name: `toeF${tc.idx}Tube${side}`,
      });

      // Blunt hoof-like capybara nail at toe tip (stays above y = 0.002)
      const clawDir: V3 = [sx * tc.dx * 0.25, -0.18, 1];
      b.spike([tTip[0], 0.011, tTip[2] - 0.004], clawDir, 0.02, 0.009, {
        bone: toeJoint,
        color: HOOF_HORN,
        sides: 4,
        group: `legF${side}`,
        name: `clawF${tc.idx}${side}`,
      });
    }

    // Partial swimming webbing slabs between adjacent front toes
    for (let k = 0; k < fToeTips.length - 1; k++) {
      b.slab(
        [
          [fToeStarts[k][0], 0.012, fToeStarts[k][2] + 0.008],
          [fToeTips[k][0], 0.011, fToeTips[k][2] - 0.008],
          [fToeTips[k + 1][0], 0.011, fToeTips[k + 1][2] - 0.008],
          [fToeStarts[k + 1][0], 0.012, fToeStarts[k + 1][2] + 0.008],
        ],
        {
          bone: pawF,
          color: WEBBING_TAN,
          thickness: 0.006,
          group: `legF${side}`,
          name: `webF${k + 1}${side}`,
        },
      );
    }

    // --- HIND LEG (3 toes) ---
    const hSocket: V3 = [sx * 0.15, 0.34, -0.3];
    const hAnkle: V3 = [sx * 0.15, 0.045, -0.305];
    const hPts = limb(
      hSocket,
      hAnkle,
      [0.145, 0.125, 0.08],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legH = b.chain(`legH${side}`, hPts, {
      parent: backSpine.joints[0],
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [sx * 0.15, 0, -0.27],
      group: `legH${side}`,
    });

    // Plump pear-shaped haunch / thigh muscle sweep
    b.sweep(
      catmull([
        [sx * 0.12, 0.39, -0.33],
        [sx * 0.165, 0.31, -0.28],
        hPts[1],
      ]),
      [0.105, 0.095, 0.064],
      {
        bone: legH.joints[0],
        color: coatPaint,
        group: `legH${side}`,
        name: `haunchMass${side}`,
      },
    );

    // Main hindleg tube
    b.sweep(legH, [0.088, 0.065, 0.048, 0.052], {
      color: coatPaint,
      group: `legH${side}`,
      name: `hindlegTube${side}`,
    });

    // Rounded hock / heel fluff nodule
    b.capsule(
      hPts[2],
      [hPts[2].x, hPts[2].y + 0.012, hPts[2].z - 0.028],
      [0.036, 0.024],
      {
        bone: legH.joints[2],
        color: ESPRESSO,
        sides: 6,
        group: `legH${side}`,
        name: `hockTuft${side}`,
      },
    );

    // Plantar hind paw pad resting on y = 0 (height 0.018, center y = 0.009)
    const pawH = legH.tip!;
    b.part(new THREE.CylinderGeometry(0.048, 0.052, 0.018, 8), PAW_PAD_DARK, {
      bone: pawH,
      at: [sx * 0.15, 0.009, -0.29],
      scale: [1.05, 1, 1.25],
      group: `legH${side}`,
      name: `pawPadH${side}`,
    });

    // 3 Hind Toes (anatomically true to capybaras: 3 webbed digits on hind feet)
    const hToeConfigs = [
      { idx: 1, dx: -0.028, dz: 0.058 },
      { idx: 2, dx: 0.0, dz: 0.068 },
      { idx: 3, dx: 0.028, dz: 0.058 },
    ];
    const hToeStarts: V3[] = [];
    const hToeTips: V3[] = [];

    for (const tc of hToeConfigs) {
      const tStart: V3 = [sx * (0.15 + tc.dx * 0.45), 0.015, -0.29];
      const tTip: V3 = [sx * (0.15 + tc.dx), 0.014, -0.29 + tc.dz];
      hToeStarts.push(tStart);
      hToeTips.push(tTip);

      const toeJoint = b.joint(`toeH${tc.idx}${side}`, {
        parent: pawH,
        at: tStart,
        aim: tTip,
        role: "digit",
        group: `legH${side}`,
      });

      b.capsule(tStart, tTip, [0.015, 0.013], {
        bone: toeJoint,
        color: ESPRESSO,
        sides: 6,
        group: `legH${side}`,
        name: `toeH${tc.idx}Tube${side}`,
      });

      const clawDir: V3 = [sx * tc.dx * 0.25, -0.18, 1];
      b.spike([tTip[0], 0.012, tTip[2] - 0.004], clawDir, 0.022, 0.01, {
        bone: toeJoint,
        color: HOOF_HORN,
        sides: 4,
        group: `legH${side}`,
        name: `clawH${tc.idx}${side}`,
      });
    }

    // Partial swimming webbing slabs between adjacent hind toes
    for (let k = 0; k < hToeTips.length - 1; k++) {
      b.slab(
        [
          [hToeStarts[k][0], 0.013, hToeStarts[k][2] + 0.008],
          [hToeTips[k][0], 0.012, hToeTips[k][2] - 0.008],
          [hToeTips[k + 1][0], 0.012, hToeTips[k + 1][2] - 0.008],
          [hToeStarts[k + 1][0], 0.013, hToeStarts[k + 1][2] + 0.008],
        ],
        {
          bone: pawH,
          color: WEBBING_TAN,
          thickness: 0.006,
          group: `legH${side}`,
          name: `webH${k + 1}${side}`,
        },
      );
    }
  }

  // -------------------------------------------------------------------------
  // 4. Head, Blocky Muzzle, Jaw, Incisors, Nose, Eyes & Cupped Ears
  // -------------------------------------------------------------------------
  // Main blocky capybara skull & broad blunt snout loft
  const headLoft = b.loft(
    [
      { at: [0, 0.5, 0.365], w: 0.22, h: 0.21 },
      { at: [0, 0.515, 0.435], w: 0.23, h: 0.215 },
      { at: [0, 0.515, 0.515], w: 0.21, h: 0.205 },
      { at: [0, 0.505, 0.585], w: 0.185, h: 0.185 },
      { at: [0, 0.495, 0.625], w: 0.14, h: 0.145 },
    ],
    {
      bone: [head, snout],
      color: coatPaint,
      group: "head",
      name: "headLoft",
    },
  );

  // Flat crown bridge pad from brow to nose top (signature flat-topped capybara profile)
  b.sweep(
    catmull([
      [0, 0.575, 0.385],
      [0, 0.585, 0.465],
      [0, 0.575, 0.545],
      [0, 0.555, 0.605],
    ]),
    (t) => [0.088 * (1 - 0.28 * t), 0.036],
    {
      bone: [head, snout],
      color: coatPaint,
      group: "head",
      name: "crownBridge",
    },
  );

  // Plump whisker pads / upper muzzle cushions (left & right)
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;

    b.capsule(
      [sx * 0.056, 0.49, 0.52],
      [sx * 0.048, 0.478, 0.605],
      [0.062, 0.054],
      {
        bone: snout,
        color: coatPaint,
        group: "head",
        name: `muzzlePad${side}`,
      },
    );

    // Chubby lower cheek jowl swell
    b.capsule(
      [sx * 0.085, 0.468, 0.425],
      [sx * 0.075, 0.462, 0.505],
      [0.058, 0.048],
      {
        bone: head,
        color: coatPaint,
        group: "head",
        name: `cheekJowl${side}`,
      },
    );
  }

  // Broad dark-velvet upper nose shield
  b.capsule([0, 0.55, 0.608], [0, 0.515, 0.628], [0.056, 0.042], {
    bone: snout,
    color: NOSE_VELVET,
    sides: 8,
    group: "head",
    name: "noseShield",
  });

  // Philtrum cleft line running down the center of the blunt muzzle
  b.rod([0, 0.512, 0.63], [0, 0.448, 0.618], 0.012, DARK_UMBER, {
    bone: snout,
    sides: 5,
    group: "head",
    name: "philtrumCleft",
  });

  // Soft cream upper lip puffs flanking the philtrum
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    b.capsule(
      [sx * 0.026, 0.452, 0.605],
      [sx * 0.052, 0.456, 0.565],
      [0.022, 0.018],
      {
        bone: snout,
        color: CREAM_FUR,
        sides: 6,
        group: "head",
        name: `upperLip${side}`,
      },
    );

    // Wide-set sculpted nostrils at upper corners of the snout
    b.capsule(
      [sx * 0.052, 0.548, 0.605],
      [sx * 0.036, 0.535, 0.622],
      [0.022, 0.018],
      {
        bone: snout,
        color: NOSE_VELVET,
        sides: 6,
        group: "head",
        name: `nostrilRim${side}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NOSTRIL_DARK, {
      bone: snout,
      at: [sx * 0.046, 0.542, 0.618],
      scale: [0.85, 1.1, 0.7],
      group: "head",
      name: `nostrilCav${side}`,
    });
  }

  // Two cute blocky rodent upper incisors peeking beneath the philtrum
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    b.frustumBox(
      [sx * 0.011, 0.456, 0.596],
      [sx * 0.01, 0.428, 0.594],
      [0.018, 0.012],
      [0.016, 0.009],
      {
        bone: snout,
        color: TOOTH_IVORY,
        group: "head",
        name: `upperIncisor${side}`,
      },
    );
  }

  // Separate Lower Jaw, Chin Tuft, Lower Incisors & Pink Tongue (rides `jaw` bone)
  b.sweep(
    catmull([
      [0, 0.44, 0.44],
      [0, 0.425, 0.515],
      [0, 0.428, 0.578],
    ]),
    (t) => [0.068 * (1 - 0.35 * t), 0.038 * (1 - 0.25 * t)],
    {
      bone: jaw,
      color: bellyFur,
      group: "head",
      name: "lowerJawSweep",
    },
  );

  // Dark lower lip rim
  b.sweep(
    catmull([
      [-0.045, 0.442, 0.525],
      [0, 0.436, 0.585],
      [0.045, 0.442, 0.525],
    ]),
    0.014,
    {
      bone: jaw,
      color: DARK_UMBER,
      sides: 6,
      group: "head",
      name: "lowerLipRim",
    },
  );

  // Pink tongue resting on the lower jaw
  b.capsule([0, 0.442, 0.495], [0, 0.44, 0.562], [0.028, 0.022], {
    bone: jaw,
    color: TONGUE_PINK,
    sides: 6,
    group: "head",
    name: "tongue",
  });

  // Two lower chisel incisors on the jaw
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    b.frustumBox(
      [sx * 0.009, 0.432, 0.576],
      [sx * 0.009, 0.45, 0.58],
      [0.015, 0.01],
      [0.014, 0.008],
      {
        bone: jaw,
        color: TOOTH_IVORY,
        group: "head",
        name: `lowerIncisor${side}`,
      },
    );
  }

  // Expressive Eyes, Sleepy Lids, Brows & Rosy Cheek Blushes
  const headSurf = b.surface(headLoft);
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;

    // Eye decal projected onto the upper side of the head
    b.decal(headSurf, CAPY_EYE_TEX, {
      at: [sx * 0.104, 0.54, 0.472],
      dir: [sx * 0.88, 0.18, 0.42],
      size: [0.072, 0.054],
      mirror: side === "L",
      bone: head,
      group: "head",
      name: `eyeDecal${side}`,
    });

    // Cheek blush decal below the eye
    b.decal(headSurf, CHEEK_BLUSH_TEX, {
      at: [sx * 0.108, 0.49, 0.5],
      dir: [sx * 0.9, -0.05, 0.42],
      size: [0.068, 0.046],
      mirror: side === "L",
      bone: head,
      group: "head",
      name: `blushDecal${side}`,
    });

    // 3D sculpted sleepy upper eyelid ridge (gives the calm, half-lidded capybara look from every angle)
    b.sweep(
      catmull([
        [sx * 0.095, 0.548, 0.442],
        [sx * 0.108, 0.556, 0.472],
        [sx * 0.096, 0.546, 0.502],
      ]),
      [0.013, 0.016, 0.013],
      {
        bone: head,
        color: DARK_UMBER,
        sides: 6,
        group: "head",
        name: `upperLid${side}`,
      },
    );

    // Lower lid soft fold
    b.sweep(
      catmull([
        [sx * 0.096, 0.532, 0.446],
        [sx * 0.108, 0.526, 0.472],
        [sx * 0.096, 0.532, 0.498],
      ]),
      0.01,
      {
        bone: head,
        color: ESPRESSO,
        sides: 5,
        group: "head",
        name: `lowerLid${side}`,
      },
    );

    // Expressive thick storybook eyebrow arc
    b.sweep(
      catmull([
        [sx * 0.082, 0.568, 0.442],
        [sx * 0.1, 0.578, 0.474],
        [sx * 0.084, 0.568, 0.504],
      ]),
      [0.012, 0.016, 0.011],
      {
        bone: head,
        color: DARK_UMBER,
        sides: 5,
        group: "head",
        name: `eyebrow${side}`,
      },
    );
  }

  // Cupped Capybara Ears (rides `earL` and `earR`)
  const earOuterOutline: OutlinePoint[] = [
    [-0.022, 0],
    [-0.036, 0.026],
    [-0.032, 0.062],
    [0, 0.078],
    [0.032, 0.062],
    [0.036, 0.026],
    [0.022, 0],
  ];
  const earInnerOutline: OutlinePoint[] = [
    [-0.014, 0.008],
    [-0.023, 0.028],
    [-0.02, 0.054],
    [0, 0.066],
    [0.02, 0.054],
    [0.023, 0.028],
    [0.014, 0.008],
  ];

  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const earJ = earJoints[side];

    // Outer dark cocoa ear cup
    b.extrude(earOuterOutline, {
      bone: earJ,
      at: [sx * 0.086, 0.566, 0.395],
      x: [sx * 0.45, -0.25, 0.85],
      y: [sx * 0.62, 0.72, -0.3],
      thickness: [0.024, 0.012],
      bevel: 0.004,
      smoothing: 1,
      color: ESPRESSO,
      group: "head",
      name: `earOuter${side}`,
    });

    // Warm dusty-rose inner ear pinna
    b.extrude(earInnerOutline, {
      bone: earJ,
      at: [sx * 0.091, 0.569, 0.4],
      x: [sx * 0.45, -0.25, 0.85],
      y: [sx * 0.62, 0.72, -0.3],
      thickness: [0.016, 0.008],
      bevel: 0.002,
      smoothing: 1,
      color: INNER_EAR_ROSE,
      group: "head",
      name: `earInner${side}`,
    });

    // Ear base tragus bump
    b.capsule(
      [sx * 0.088, 0.568, 0.402],
      [sx * 0.104, 0.582, 0.398],
      [0.018, 0.013],
      {
        bone: earJ,
        color: DARK_UMBER,
        sides: 5,
        group: "head",
        name: `earTragus${side}`,
      },
    );
  }

  // -------------------------------------------------------------------------
  // 5. Storybook Polka-Dot Neckerchief, Brass Bell & Pond-Lily Corsage
  // -------------------------------------------------------------------------
  // Rolled bandana collar loop around the neck/shoulder junction
  const collarLoop = catmull(
    [
      [0, 0.305, 0.405],
      [0.145, 0.385, 0.355],
      [0.14, 0.485, 0.285],
      [0, 0.535, 0.245],
      [-0.14, 0.485, 0.285],
      [-0.145, 0.385, 0.355],
    ],
    { closed: true },
  );

  b.sweep(collarLoop, 0.032, {
    bone: [frontSpine, neckChain],
    color: bandanaBase,
    group: "collar",
    name: "bandanaRoll",
  });

  // Berry-red braided cord piping along the lower edge of the bandana roll
  const cordLoop = catmull(
    [
      [0, 0.278, 0.412],
      [0.152, 0.365, 0.365],
      [0.148, 0.468, 0.292],
      [0, 0.518, 0.252],
      [-0.148, 0.468, 0.292],
      [-0.152, 0.365, 0.365],
    ],
    { closed: true },
  );

  b.sweep(cordLoop, 0.013, {
    bone: [frontSpine, neckChain],
    color: BERRY_RED,
    sides: 6,
    group: "collar",
    name: "bandanaCord",
  });

  // Triangular kerchief bib draped over the front chest
  const bibOutline: OutlinePoint[] = [
    [-0.11, 0.045],
    [0.11, 0.045],
    [0.075, -0.045],
    [0, -0.125, "sharp"],
    [-0.075, -0.045],
  ];

  b.extrude(bibOutline, {
    bone: neckChain.joints[0],
    at: [0, 0.295, 0.402],
    x: [1, 0, 0],
    y: [0, 0.86, 0.5],
    thickness: [0.028, 0.018],
    bevel: 0.005,
    smoothing: 1,
    color: bandanaBase,
    group: "collar",
    name: "bandanaBib",
  });

  // Knotted bandana tails at the back of the nape
  b.part(new THREE.SphereGeometry(0.034, 8, 6), SAGE_DARK, {
    bone: frontSpine.joints[2],
    at: [0, 0.54, 0.238],
    scale: [1.15, 0.9, 1.0],
    group: "collar",
    name: "bandanaKnot",
  });

  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    b.sweep(
      bezier(
        [sx * 0.015, 0.54, 0.232],
        [sx * 0.065, 0.555, 0.185],
        [sx * 0.095, 0.515, 0.145],
      ),
      [0.026, 0.018, 0.008],
      {
        bone: frontSpine.joints[2],
        color: bandanaBase,
        group: "collar",
        name: `bandanaTail${side}`,
      },
    );
  }

  // Golden Brass Bell hanging from `bellJoint` in front
  b.capsule([0, 0.272, 0.412], [0, 0.242, 0.418], 0.012, BERRY_DARK, {
    bone: bellJoint,
    sides: 6,
    group: "collar",
    name: "bellStrap",
  });

  const bellProfile: OutlinePoint[] = [
    [0, 0],
    [0.032, 0.003],
    [0.036, 0.016],
    [0.033, 0.038],
    [0.022, 0.054],
    [0, 0.06],
  ];
  b.lathe(bellProfile, {
    bone: bellJoint,
    at: [0, 0.195, 0.42],
    axis: [0, 1, 0.08],
    segments: 10,
    smoothing: 1,
    color: BRASS_GOLD,
    group: "collar",
    name: "brassBellBody",
  });

  // Bell equatorial ridge & bottom clapper ball
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 10), BRASS_SHADOW, {
    bone: bellJoint,
    at: [0, 0.212, 0.421],
    dir: [0, 1, 0.08],
    group: "collar",
    name: "brassBellRim",
  });
  b.part(new THREE.SphereGeometry(0.016, 6, 5), DARK_UMBER, {
    bone: bellJoint,
    at: [0, 0.192, 0.422],
    group: "collar",
    name: "bellClapper",
  });

  // Pink Pond-Lily Blossom & Reed Leaves tucked into the left shoulder collar
  const lilyCenter: V3 = [0.148, 0.425, 0.345];
  const lilyNormal: V3 = [0.78, 0.46, 0.42];
  const lilyFrame = frame(lilyCenter, lilyNormal);

  // Two curved green pond-reed leaves behind the blossom
  for (const [idx, ang] of [
    [1, -0.45],
    [2, 0.55],
  ] as const) {
    const leafTip: V3 = [
      lilyCenter[0] + 0.035,
      lilyCenter[1] + 0.055 * Math.cos(ang),
      lilyCenter[2] - 0.065 + 0.03 * Math.sin(ang),
    ];
    b.sweep(
      bezier(
        lilyCenter,
        [lilyCenter[0] + 0.03, lilyCenter[1] + 0.03, lilyCenter[2] - 0.03],
        leafTip,
      ),
      [0.018, 0.022, 0.006],
      {
        bone: neckChain.joints[0],
        color: LOTUS_GREEN,
        sides: 6,
        group: "collar",
        name: `collarLeaf${idx}`,
      },
    );
  }

  // Ring of 8 outer pink water-lily petals + golden stamen heart
  const lilyPetalOutline: OutlinePoint[] = [
    [-0.011, 0],
    [-0.016, 0.018],
    [0, 0.042, "sharp"],
    [0.016, 0.018],
    [0.011, 0],
  ];

  b.ring(
    lilyFrame,
    { count: 8, radius: 0.012, tilt: 58, group: "collar" },
    (it) => {
      b.extrude(lilyPetalOutline, {
        bone: neckChain.joints[0],
        at: it.at,
        x: it.dir([1, 0, 0]),
        y: it.outward,
        thickness: [0.01, 0.005],
        bevel: 0.002,
        smoothing: 1,
        color: it.i % 2 === 0 ? LILY_PINK : LILY_CREAM,
        group: "collar",
      });
    },
  );

  b.part(new THREE.SphereGeometry(0.018, 7, 5), BRASS_GOLD, {
    bone: neckChain.joints[0],
    at: offset(lilyCenter, lilyNormal, 0.008),
    group: "collar",
    name: "lilyStamenCenter",
  });

  // -------------------------------------------------------------------------
  // 6. Crown Lotus-Leaf Pad & Golden Yuzu Citrus on the Capybara's Head
  // -------------------------------------------------------------------------
  const padCenter: V3 = [0, 0.592, 0.435];

  // Central cushioned lotus pad disc seated into the capybara's flat crown
  b.part(new THREE.CylinderGeometry(0.095, 0.105, 0.024, 12), LOTUS_GREEN, {
    bone: head,
    at: padCenter,
    dir: [0, 1, 0.06],
    scale: [1.08, 1, 1.15],
    group: "head",
    name: "lotusPadBase",
  });

  // Scalloped lotus leaf rim lobes & radiating lighter-green veins around the crown
  b.ring(
    frame([0, 0.596, 0.435], [0, 1, 0.06]),
    { count: 10, radius: 0.062, tilt: 78, group: "head" },
    (it) => {
      const tip = offset(it.at, it.outward, 0.052);
      b.capsule(it.at, tip, [0.028, 0.022], {
        bone: head,
        color: it.i % 2 === 0 ? LOTUS_GREEN : LOTUS_LIGHT,
        sides: 6,
        group: "head",
      });
    },
  );

  // Curled lotus stem at the back edge of the crown pad
  b.sweep(
    bezier(
      [0, 0.594, 0.365],
      [0.018, 0.612, 0.332],
      [0.028, 0.585, 0.312],
    ),
    [0.013, 0.009],
    {
      bone: head,
      color: LOTUS_STEM,
      sides: 5,
      group: "head",
      name: "lotusStem",
    },
  );

  // Golden Yuzu Citrus Fruit nestled on the right-front side of the lotus pad
  const yuzuPos: V3 = [-0.062, 0.596, 0.468];
  const yuzuProfile: OutlinePoint[] = [
    [0, 0],
    [0.024, 0.003],
    [0.036, 0.015],
    [0.037, 0.032],
    [0.026, 0.047],
    [0, 0.053],
  ];

  b.lathe(yuzuProfile, {
    bone: head,
    at: yuzuPos,
    axis: [-0.14, 0.98, 0.12],
    segments: 10,
    smoothing: 1,
    color: yuzuPaint,
    group: "head",
    name: "yuzuFruit",
  });

  // Yuzu stem & bright green citrus leaf
  const yuzuTop: V3 = [-0.069, 0.646, 0.474];
  b.capsule(yuzuTop, [-0.073, 0.664, 0.478], [0.008, 0.006], {
    bone: head,
    color: DARK_UMBER,
    sides: 5,
    group: "head",
    name: "yuzuStem",
  });

  b.sweep(
    bezier(
      yuzuTop,
      [-0.098, 0.662, 0.465],
      [-0.118, 0.648, 0.448],
    ),
    [0.012, 0.018, 0.005],
    {
      bone: head,
      color: YUZU_LEAF,
      sides: 6,
      group: "head",
      name: "yuzuLeaf",
    },
  );

  // -------------------------------------------------------------------------
  // 7. Perched Whimsical Songbird ("Pip") on the Capybara's Head
  // -------------------------------------------------------------------------
  // Plump round songbird body lofted along `birdBody` -> `birdHead`
  b.loft(
    [
      { at: [0.016, 0.642, 0.378], w: 0.052, h: 0.048 },
      { at: [0.013, 0.642, 0.412], w: 0.088, h: 0.078 },
      { at: [0.011, 0.654, 0.445], w: 0.086, h: 0.082 },
      { at: [0.009, 0.684, 0.462], w: 0.072, h: 0.072 },
      { at: [0.007, 0.708, 0.472], w: 0.058, h: 0.056 },
    ],
    {
      bone: [birdBody, birdHead],
      color: birdCoatPaint,
      group: "bird",
      name: "birdTorsoLoft",
    },
  );

  // Fluffy buttercup-gold bird breast puff
  b.capsule([0.01, 0.635, 0.435], [0.008, 0.675, 0.468], [0.04, 0.036], {
    bone: birdBody,
    color: BIRD_GOLD,
    sides: 8,
    group: "bird",
    name: "birdBreastPuff",
  });

  // Round songbird head cap
  b.part(new THREE.SphereGeometry(0.039, 10, 8), birdCoatPaint, {
    bone: birdHead,
    at: [0.008, 0.698, 0.464],
    scale: [1.02, 0.98, 1.06],
    group: "bird",
    name: "birdSkull",
  });

  // Whimsical 3-plume crown crest on top of the bird's head
  const crestConfigs = [
    { dx: 0, h: 0.055, back: -0.042, col: BIRD_BLUE },
    { dx: 0.014, h: 0.044, back: -0.035, col: BIRD_GOLD },
    { dx: -0.014, h: 0.044, back: -0.035, col: BIRD_GOLD },
  ];
  for (const [idx, cc] of crestConfigs.entries()) {
    b.sweep(
      bezier(
        [0.008 + cc.dx * 0.4, 0.726, 0.462],
        [0.008 + cc.dx, 0.726 + cc.h * 0.85, 0.455 + cc.back * 0.4],
        [0.008 + cc.dx * 1.2, 0.726 + cc.h, 0.455 + cc.back],
      ),
      [0.011, 0.013, 0.004],
      {
        bone: birdHead,
        color: cc.col,
        sides: 5,
        group: "bird",
        name: `birdCrest${idx + 1}`,
      },
    );
  }

  // Bird upper beak (`birdHead`) and articulated lower beak (`birdJaw`)
  b.spike([0.006, 0.696, 0.494], [-0.08, -0.06, 1], 0.038, 0.016, {
    bone: birdHead,
    color: BIRD_CORAL,
    sides: 5,
    group: "bird",
    name: "birdBeakUpper",
  });
  b.spike([0.006, 0.686, 0.494], [-0.08, -0.2, 1], 0.03, 0.013, {
    bone: birdJaw,
    color: BIRD_CORAL,
    sides: 5,
    group: "bird",
    name: "birdBeakLower",
  });

  // Bird eyes, cream eye-rings, white catchlights & rosy cheek puffs
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const eyeX = 0.008 + sx * 0.033;

    b.part(new THREE.SphereGeometry(0.013, 6, 5), BIRD_CREAM, {
      bone: birdHead,
      at: [eyeX, 0.702, 0.478],
      scale: [0.65, 1, 1],
      group: "bird",
      name: `birdEyeRing${side}`,
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 5), BIRD_INK, {
      bone: birdHead,
      at: [eyeX + sx * 0.003, 0.702, 0.48],
      group: "bird",
      name: `birdEye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), BERRY_RED, {
      bone: birdHead,
      at: [eyeX + sx * 0.002, 0.688, 0.482],
      scale: [0.7, 0.8, 1.1],
      group: "bird",
      name: `birdCheek${side}`,
    });
  }

  // Folded Layered Bird Wings (`birdWingL`, `birdWingR`)
  const wingCovertOutline: OutlinePoint[] = [
    [0, -0.018],
    [0.055, -0.022],
    [0.082, -0.006, "sharp"],
    [0.048, 0.022],
    [0, 0.02],
  ];

  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const wingJ = side === "L" ? birdWingL : birdWingR;
    const wx = 0.012 + sx * 0.042;

    b.extrude(wingCovertOutline, {
      bone: wingJ,
      at: [wx, 0.658, 0.435],
      x: [sx * 0.15, -0.15, -0.97],
      y: [sx * 0.25, 0.95, -0.12],
      thickness: [0.022, 0.01],
      bevel: 0.003,
      smoothing: 1,
      color: BIRD_BLUE,
      group: "bird",
      name: `birdWingCovert${side}`,
    });

    // Golden-cream wing bar stripe
    b.capsule(
      [wx + sx * 0.008, 0.664, 0.422],
      [wx + sx * 0.006, 0.642, 0.398],
      0.009,
      {
        bone: wingJ,
        color: BIRD_GOLD,
        sides: 5,
        group: "bird",
        name: `birdWingBar${side}`,
      },
    );

    // 3 Overlapping royal-navy primary flight feathers extending toward the tail
    for (let f = 0; f < 3; f++) {
      const fy = 0.658 - f * 0.009;
      const fz = 0.365 + f * 0.012;
      b.capsule(
        [wx + sx * 0.004, fy + 0.006, 0.415],
        [wx - sx * 0.004, fy, fz],
        [0.011, 0.007],
        {
          bone: wingJ,
          color: BIRD_NAVY,
          sides: 5,
          group: "bird",
          name: `birdPrimary${f + 1}${side}`,
        },
      );
    }
  }

  // Jaunty Fanned Bird Tail Feathers (`birdTail`)
  for (let i = -2; i <= 2; i++) {
    const spreadX = i * 0.014;
    const liftY = (2 - Math.abs(i)) * 0.006;
    b.sweep(
      bezier(
        [0.016 + spreadX * 0.3, 0.648, 0.382],
        [0.018 + spreadX * 0.7, 0.668 + liftY, 0.35],
        [0.02 + spreadX, 0.686 + liftY, 0.318],
      ),
      [0.012, 0.014, 0.007],
      {
        bone: birdTail,
        color: Math.abs(i) === 2 ? BIRD_GOLD : i === 0 ? BIRD_NAVY : BIRD_BLUE,
        sides: 5,
        group: "bird",
        name: `birdTailFeather${i + 3}`,
      },
    );
  }

  // Bird Legs & Perching Toes gripping the lotus pad on the capybara's crown
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const legJ = side === "L" ? birdLegL : birdLegR;
    const lx = 0.012 + sx * 0.022;

    // Tarsus leg shaft seated into bird body above and lotus pad below
    b.rod([lx, 0.635, 0.43], [lx, 0.598, 0.436], 0.009, BIRD_CORAL, {
      bone: legJ,
      sides: 5,
      group: "bird",
      name: `birdTarsus${side}`,
    });

    // Two forward perching toes + one rear hallux toe seated on the lotus pad
    for (const [tIdx, dx, dz] of [
      [1, -0.01, 0.024],
      [2, 0.01, 0.024],
      [3, 0, -0.02],
    ] as const) {
      b.capsule(
        [lx, 0.602, 0.436],
        [lx + dx, 0.6, 0.436 + dz],
        [0.008, 0.006],
        {
          bone: legJ,
          color: BIRD_CORAL,
          sides: 4,
          group: "bird",
          name: `birdToe${tIdx}${side}`,
        },
      );
    }
  }

  // -------------------------------------------------------------------------
  // 8. Fur Cards, Whisker Cards & Feather Cards (Fine Surface Detail)
  // -------------------------------------------------------------------------
  // Scatter soft layered fur tufts over the capybara's torso, haunches, shoulders & neck
  const torsoSurf = b.surface(torsoLoft);
  const bodyFurHits = torsoSurf.scatter(140, {
    rng: rng(101),
    minDist: 0.042,
    filter: (h) => h.n.y > -0.25 && !(h.at.z > 0.24 && h.at.z < 0.43 && h.at.y > 0.34),
  });
  if (bodyFurHits.length) {
    b.cards(bodyFurHits, FUR_TUFT_TEX, {
      size: [0.042, 0.068],
      lean: 64,
      bend: 24,
      flow: [0, -0.25, -1],
      vary: 0.28,
      spin: 16,
      rng: rng(102),
      color: coatPaint,
      group: "torso",
      name: "bodyFurCards",
    });
  }

  // Fluffy cheek & jowl fur tufts on the head
  const cheekFurHits = headSurf.scatter(42, {
    rng: rng(103),
    minDist: 0.032,
    filter: (h) => h.n.y < 0.45 && h.n.y > -0.4 && h.at.z < 0.56 && Math.abs(h.at.x) > 0.06,
  });
  if (cheekFurHits.length) {
    b.cards(cheekFurHits, FUR_TUFT_TEX, {
      size: [0.034, 0.052],
      lean: 58,
      bend: 20,
      flow: [0, -0.35, -0.9],
      vary: 0.22,
      spin: 14,
      rng: rng(104),
      color: coatPaint,
      bone: head,
      group: "head",
      name: "cheekFurCards",
    });
  }

  // Whisker fan cards sprouting from both muzzle pads
  const whiskerFrames = [];
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    for (const [wy, wz, pitch] of [
      [0.492, 0.565, 0.12],
      [0.478, 0.585, -0.04],
      [0.466, 0.552, -0.18],
    ] as const) {
      whiskerFrames.push(
        snout.moved([sx * 0.078, wz - 0.505, wy - 0.5]).moved([0, 0, 0]),
      );
      whiskerFrames[whiskerFrames.length - 1] = frame(
        [sx * 0.078, wy, wz],
        [sx * 0.92, pitch, -0.25],
      );
    }
  }
  b.cards(whiskerFrames, WHISKER_TEX, {
    size: [0.048, 0.082],
    lean: 18,
    bend: 22,
    flow: [0, -0.4, -0.9],
    vary: 0.15,
    rng: rng(105),
    bone: snout,
    group: "head",
    name: "muzzleWhiskers",
  });

  // Ear inner fluff cards on both ears
  for (const side of ["L", "R"] as const) {
    const sx = side === "L" ? 1 : -1;
    const earFluffFrames = [
      frame([sx * 0.095, 0.585, 0.402], [sx * 0.55, 0.35, 0.75]),
      frame([sx * 0.104, 0.598, 0.398], [sx * 0.65, 0.45, 0.6]),
    ];
    b.cards(earFluffFrames, FUR_TUFT_TEX, {
      size: [0.026, 0.038],
      lean: 25,
      bend: 15,
      color: CREAM_FUR,
      bone: earJoints[side],
      group: "head",
      name: `earFluffCards${side}`,
    });
  }

  // Plump feather cards on the perched songbird's breast and flanks
  const birdFeatherFrames = [
    frame([0.038, 0.652, 0.432], [0.85, -0.1, -0.5]),
    frame([-0.014, 0.652, 0.432], [-0.85, -0.1, -0.5]),
    frame([0.028, 0.645, 0.452], [0.55, -0.2, 0.8]),
    frame([-0.006, 0.645, 0.452], [-0.55, -0.2, 0.8]),
  ];
  b.cards(birdFeatherFrames, FEATHER_TEX, {
    size: [0.026, 0.04],
    lean: 55,
    bend: 20,
    flow: [0, -0.2, -1],
    color: BIRD_GOLD,
    bone: birdBody,
    group: "bird",
    name: "birdPlumageCards",
  });

  return b.root;
}
