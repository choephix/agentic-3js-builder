import * as THREE from "three";
import {
  createBuilder,
  frame,
  aim,
  lerp,
  mid,
  offset,
  rng,
  bezier,
  catmull,
  limb,
  paint,
  countershade,
  noise,
  svg,
} from "../../../../src/index";
import { cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Genshin Red Panda on Mossy Stone",
  description:
    "A stylized red panda in Genshin Impact cel-shaded anime aesthetic, gracefully balancing on an ancient moss-covered mountain boulder adorned with golden ginkgo leaves, fresh bamboo culms, and an Adeptal elemental amulet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_red_panda", paintSize: 2048 });

  // ---------------------------------------------------------------------------
  // Genshin Cel Palette & Specialized Paints
  // ---------------------------------------------------------------------------
  const RUSSET = cel("#e65a28", "#9a2e10");
  const CREAM = cel("#fff8ea", "#e8cfab");
  const DARK_FUR = cel("#221815", "#120c0a");
  const BUFF_RING = cel("#f5cc82", "#be8c38");
  const NOSE_COL = "#1c1418";
  const CLAW_COL = "#f8f3ea";
  const GOLD = cel("#fdb82c", "#a86f0a");
  const CORD_RED = cel("#d63031", "#801212");
  const JADE_GREEN = "#10b981";
  const ROCK_DARK = cel("#484f56", "#2f343a");
  const ROCK_MID = cel("#68717a", "#4a5158");
  const MOSS_DEEP = cel("#3a691c", "#234210");
  const MOSS_BRIGHT = cel("#5fa827", "#396b13");
  const GINKGO_GOLD = cel("#fcc419", "#d97706");
  const BAMBOO_CULM = cel("#7ec924", "#4a7e12");
  const BAMBOO_SHEATH = cel("#b8e968", "#78a230");

  // Red panda reverse countershading: rich rusty red on top, dark chocolate below
  const BODY_COAT = cel(
    furEdge(RUSSET, DARK_FUR, {
      axis: [0, 1, 0],
      level: -0.16,
      teeth: 0.14,
      period: 0.035,
      along: [0, 0, 1],
    })
  );

  // Alternating 7-ring tail paint with dark chocolate tip
  const TAIL_PAINT = paint((p, _n, s) => {
    const t = s[0];
    if (t > 0.84) return DARK_FUR;
    const ringT = (t - 0.06) / (0.84 - 0.06);
    if (ringT < 0) return RUSSET;
    const ringIdx = Math.floor(ringT * 7.0);
    return ringIdx % 2 === 1 ? BUFF_RING : RUSSET;
  });

  // Weathered rock face with moss gradations
  const ROCK_PAINT = paint((p, n) => {
    const mossiness = countershade(MOSS_DEEP, ROCK_MID, { level: 0.35, soft: 0.3 });
    return mossiness.at(p, n);
  });

  // ---------------------------------------------------------------------------
  // Custom SVG Textures
  // ---------------------------------------------------------------------------

  // 1. Signature Genshin Anime Eye: Amber iris, Primogem star pupil, blush
  const EYE_TEX = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="50%" cy="65%" r="65%">
          <stop offset="0%" stop-color="#fff3bf"/>
          <stop offset="25%" stop-color="#ffd43b"/>
          <stop offset="60%" stop-color="#f76707"/>
          <stop offset="100%" stop-color="#5c1d06"/>
        </radialGradient>
        <clipPath id="eyeClip">
          <ellipse cx="50" cy="62" rx="36" ry="42"/>
        </clipPath>
      </defs>
      <!-- Sclera -->
      <ellipse cx="50" cy="62" rx="36" ry="42" fill="#f8f9fa"/>
      <!-- Eye Contents -->
      <g clip-path="url(#eyeClip)">
        <ellipse cx="50" cy="64" rx="30" ry="34" fill="url(#iris)"/>
        <!-- Soft upper eyelid shadow -->
        <rect x="10" y="20" width="80" height="28" fill="#2b152c" opacity="0.38"/>
        <!-- Deep plum pupil -->
        <ellipse cx="50" cy="65" rx="13" ry="18" fill="#1b0e20"/>
        <!-- Genshin Primogem Star highlight -->
        <path d="M 50 51 Q 50 65 42 65 Q 50 65 50 79 Q 50 65 58 65 Q 50 65 50 51 Z" fill="#fff9db"/>
        <circle cx="50" cy="65" r="2.5" fill="#ffffff"/>
        <!-- Luminous lower crescent -->
        <path d="M 32 78 C 40 88, 60 88, 68 78 C 62 84, 38 84, 32 78 Z" fill="#fff9db" opacity="0.88"/>
        <!-- Specular reflections -->
        <ellipse cx="38" cy="48" rx="8" ry="11" fill="#ffffff" transform="rotate(-15 38 48)"/>
        <circle cx="64" cy="75" r="4" fill="#ffffff"/>
      </g>
      <!-- Eyeliner & Lashes -->
      <path d="M 12 55 C 22 24, 78 24, 88 55 C 80 32, 20 32, 12 55 Z" fill="#221126"/>
      <path d="M 82 42 C 92 38, 98 32, 100 25 C 95 32, 88 38, 82 42 Z" fill="#221126"/>
      <path d="M 18 42 C 8 38, 2 32, 0 25 C 5 32, 12 38, 18 42 Z" fill="#221126"/>
      <!-- Lower lid -->
      <path d="M 24 82 C 40 94, 60 94, 76 82" fill="none" stroke="#221126" stroke-width="2.8" stroke-linecap="round"/>
      <!-- Anime blush -->
      <ellipse cx="50" cy="106" rx="22" ry="8" fill="#ff8787" opacity="0.55"/>
      <line x1="38" y1="104" x2="44" y2="109" stroke="#e03131" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
      <line x1="47" y1="103" x2="53" y2="108" stroke="#e03131" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
      <line x1="56" y1="104" x2="62" y2="109" stroke="#e03131" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
      <!-- Brow stroke -->
      <path d="M 24 16 C 44 8, 56 8, 76 16" fill="none" stroke="#782410" stroke-width="4.2" stroke-linecap="round"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Liyue Golden Ginkgo Leaf
  const GINKGO_TEX = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 76 Q 41 55 40 44 C 36 43, 20 40, 10 32 C 2 24, 6 12, 18 8 C 28 5, 36 12, 40 18 C 44 12, 52 5, 62 8 C 74 12, 78 24, 70 32 C 60 40, 44 43, 40 44" fill="#fcc419" stroke="#e67700" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M 40 44 Q 30 30 18 16 M 40 44 Q 35 25 30 12 M 40 44 Q 40 24 40 18 M 40 44 Q 45 25 50 12 M 40 44 Q 50 30 62 16" fill="none" stroke="#fab005" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M 40 44 Q 41 62 43 78" fill="none" stroke="#d9480f" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Adeptal Elemental Amulet Seal
  const AMULET_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#10b981" stroke="#fcc419" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fab005" stroke-width="2.2" stroke-dasharray="4 4"/>
      <path d="M 50 18 L 76 50 L 50 82 L 24 50 Z" fill="#059669" stroke="#fff9db" stroke-width="3"/>
      <path d="M 50 26 L 68 50 L 50 74 L 32 50 Z" fill="#34d399"/>
      <circle cx="50" cy="50" r="8" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <path d="M 50 36 L 50 64 M 36 50 L 64 50" stroke="#fff9db" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Paw Pad Beans Texture
  const PAW_PAD_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 82 C 32 82, 22 68, 28 54 C 32 46, 42 48, 50 54 C 58 48, 68 46, 72 54 C 78 68, 68 82, 50 82 Z" fill="#e599b2"/>
      <ellipse cx="25" cy="38" rx="7.5" ry="10" fill="#e599b2" transform="rotate(-25 25 38)"/>
      <ellipse cx="42" cy="30" rx="8" ry="11" fill="#e599b2" transform="rotate(-8 42 30)"/>
      <ellipse cx="58" cy="30" rx="8" ry="11" fill="#e599b2" transform="rotate(8 58 30)"/>
      <ellipse cx="75" cy="38" rx="7.5" ry="10" fill="#e599b2" transform="rotate(25 75 38)"/>
    </svg>`,
    { size: 256 }
  );

  // ---------------------------------------------------------------------------
  // Skeleton: Root, Spine, Neck, Head, Tail
  // ---------------------------------------------------------------------------
  // Natural perched pose on the stone: hips at y=0.45, chest at y=0.48
  const hips = b.joint("hips", { at: [0, 0.45, -0.14] });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.46, -0.04], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.47, 0.06], role: "spine" });
  const chest = b.joint("chest", { parent: spine2, at: [0, 0.48, 0.15], role: "spine" });

  const neck1 = b.joint("neck1", { parent: chest, at: [0, 0.50, 0.22], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 0.52, 0.27], role: "neck" });

  const head = b.joint("head", {
    parent: neck2,
    at: [0, 0.54, 0.32],
    dir: [0, 0.05, 0.99],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.51, 0.35],
    dir: [0, -0.08, 0.99],
    role: "jaw",
  });

  // Dramatic S-curved balancing tail: acts as counterweight
  const tailPath = catmull([
    [0, 0.44, -0.16],
    [-0.02, 0.50, -0.28],
    [-0.05, 0.58, -0.42],
    [-0.03, 0.64, -0.55],
    [0.03, 0.60, -0.66],
    [0.08, 0.50, -0.74],
    [0.10, 0.39, -0.78],
  ]);

  const tailChain = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Limbs & Paws: Dynamic Balancing Pose
  // ---------------------------------------------------------------------------
  // Stone top surfaces: Left forepaw firmly planted, right forepaw delicately
  // raised in active balance. Hindpaws planted firmly on rock shelves.
  const pawContacts = {
    hindL: [0.09, 0.26, -0.15] as [number, number, number],
    hindR: [-0.09, 0.26, -0.15] as [number, number, number],
    foreL: [0.085, 0.29, 0.16] as [number, number, number],
    foreR: [-0.075, 0.35, 0.20] as [number, number, number], // Raised balancing paw
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // 1. Hind Leg
    const hipRoot: [number, number, number] = [s * 0.075, 0.43, -0.13];
    const hindTarget = s > 0 ? pawContacts.hindL : pawContacts.hindR;
    const hindPts = limb(hipRoot, hindTarget, [0.11, 0.105], [[0, 0.2, 0.95]]);

    const hindLeg = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`],
      role: "leg",
    });

    b.sweep(hindLeg, (t) => 0.042 * (1 - 0.28 * t) + 0.015, {
      color: DARK_FUR,
      sides: 8,
    });

    const ankleBone = hindLeg.joints[hindLeg.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.046, 0.022, 0.058), DARK_FUR, {
      bone: ankleBone,
      at: [hindTarget[0], hindTarget[1] + 0.011, hindTarget[2] + 0.008],
    });

    // 5 Toes & Claws
    for (let toe = -2; toe <= 2; toe++) {
      const toeX = hindTarget[0] + toe * 0.009;
      const toeZ = hindTarget[2] + 0.036;
      b.part(new THREE.SphereGeometry(0.007, 7, 5), DARK_FUR, {
        bone: ankleBone,
        at: [toeX, hindTarget[1] + 0.007, toeZ],
        scale: [1, 0.8, 1.2],
      });
      b.part(new THREE.ConeGeometry(0.0024, 0.01, 5), CLAW_COL, {
        bone: ankleBone,
        at: [toeX, hindTarget[1] + 0.004, toeZ + 0.008],
        dir: [0, -0.2, 0.98],
      });
    }

    // Hind Paw Bean Decal
    b.part(new THREE.PlaneGeometry(0.038, 0.042), "#ffffff", {
      bone: ankleBone,
      at: [hindTarget[0], hindTarget[1] + 0.001, hindTarget[2] + 0.008],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: PAW_PAD_TEX,
    });

    // 2. Fore Leg
    const shoulderRoot: [number, number, number] = [s * 0.08, 0.46, 0.14];
    const foreTarget = s > 0 ? pawContacts.foreL : pawContacts.foreR;
    const forePts = limb(
      shoulderRoot,
      foreTarget,
      [0.11, 0.105],
      [[s * 0.05, -0.15, -0.95]]
    );

    const foreLeg = b.chain(`legF${side}`, forePts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });

    b.sweep(foreLeg, (t) => 0.038 * (1 - 0.25 * t) + 0.014, {
      color: DARK_FUR,
      sides: 8,
    });

    const wristBone = foreLeg.joints[foreLeg.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.044, 0.022, 0.054), DARK_FUR, {
      bone: wristBone,
      at: [foreTarget[0], foreTarget[1] + 0.011, foreTarget[2] + 0.008],
    });

    for (let toe = -2; toe <= 2; toe++) {
      const toeX = foreTarget[0] + toe * 0.0085;
      const toeZ = foreTarget[2] + 0.034;
      b.part(new THREE.SphereGeometry(0.0065, 7, 5), DARK_FUR, {
        bone: wristBone,
        at: [toeX, foreTarget[1] + 0.006, toeZ],
        scale: [1, 0.8, 1.2],
      });
      b.part(new THREE.ConeGeometry(0.0022, 0.009, 5), CLAW_COL, {
        bone: wristBone,
        at: [toeX, foreTarget[1] + 0.003, toeZ + 0.007],
        dir: [0, -0.2, 0.98],
      });
    }

    // Fore Paw Bean Decal
    b.part(new THREE.PlaneGeometry(0.036, 0.04), "#ffffff", {
      bone: wristBone,
      at: [foreTarget[0], foreTarget[1] + 0.001, foreTarget[2] + 0.008],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: PAW_PAD_TEX,
    });
  }

  // ---------------------------------------------------------------------------
  // Plump Torso & Luxurious Tail
  // ---------------------------------------------------------------------------
  const bodyStations = [
    { at: [0, 0.44, -0.16] as [number, number, number], w: 0.17, h: 0.16 },
    { at: [0, 0.45, -0.08] as [number, number, number], w: 0.20, h: 0.19 },
    { at: [0, 0.46, 0.03] as [number, number, number], w: 0.21, h: 0.20 },
    { at: [0, 0.47, 0.13] as [number, number, number], w: 0.19, h: 0.18 },
    { at: [0, 0.49, 0.21] as [number, number, number], w: 0.15, h: 0.15 },
  ];

  b.loft(bodyStations, {
    bone: [hips, spine1, spine2, chest],
    color: BODY_COAT,
  });

  // Neck Sweep
  b.sweep(
    catmull([
      [0, 0.49, 0.20],
      [0, 0.51, 0.25],
      [0, 0.53, 0.30],
    ]),
    [0.075, 0.062],
    {
      bone: [neck1, neck2],
      color: BODY_COAT,
      sides: 8,
    }
  );

  // Voluminous Bushy Tail (Smooth silhouette, clean alternating rings)
  b.sweep(
    tailChain,
    (t) => {
      if (t < 0.22) return 0.042 + 0.26 * t;
      if (t < 0.75) return 0.098;
      return 0.098 - 0.11 * (t - 0.75);
    },
    {
      color: TAIL_PAINT,
      sides: 10,
    }
  );

  // Soft stylized tail tip tuft
  b.part(new THREE.ConeGeometry(0.045, 0.075, 7), DARK_FUR, {
    bone: tailChain.tip ?? hips,
    at: [0.10, 0.35, -0.80],
    dir: [0.05, -0.5, -0.86],
  });

  // ---------------------------------------------------------------------------
  // Head, Face, Ears & Accessories
  // ---------------------------------------------------------------------------
  // 1. Skull Base
  b.part(new THREE.SphereGeometry(0.078, 14, 12), RUSSET, {
    bone: head,
    at: [0, 0.54, 0.32],
    scale: [1.14, 0.94, 1.0],
  });

  // 2. Snout (Short, cute, rounded cream muzzle)
  b.part(new THREE.CylinderGeometry(0.034, 0.048, 0.068, 12), CREAM, {
    bone: head,
    at: [0, 0.522, 0.372],
    dir: [0, -0.06, 0.998],
  });

  // 3. Black Button Nose
  b.part(new THREE.SphereGeometry(0.011, 8, 6), NOSE_COL, {
    bone: head,
    at: [0, 0.528, 0.408],
    scale: [1.2, 0.85, 0.9],
  });

  // 4. Lower Jaw & Tongue
  b.part(new THREE.BoxGeometry(0.044, 0.016, 0.048), CREAM, {
    bone: jaw,
    at: [0, 0.505, 0.37],
  });
  b.part(new THREE.BoxGeometry(0.02, 0.006, 0.024), "#ff7aa2", {
    bone: jaw,
    at: [0, 0.511, 0.382],
  });

  // 5. Playful Little Bamboo Sprig in Corner of Mouth
  const sprigRoot: [number, number, number] = [0.024, 0.518, 0.385];
  b.sweep(
    [
      sprigRoot,
      [sprigRoot[0] + 0.025, sprigRoot[1] + 0.008, sprigRoot[2] + 0.02],
      [sprigRoot[0] + 0.055, sprigRoot[1] + 0.022, sprigRoot[2] + 0.03],
    ],
    0.0028,
    { bone: head, color: BAMBOO_CULM, sides: 6 }
  );
  // Two delicate pointed leaves fanning from the twig
  b.part(new THREE.ConeGeometry(0.007, 0.042, 4), BAMBOO_CULM, {
    bone: head,
    at: [sprigRoot[0] + 0.055, sprigRoot[1] + 0.024, sprigRoot[2] + 0.03],
    dir: [0.65, 0.45, 0.6],
    scale: [1, 1, 0.2],
  });
  b.part(new THREE.ConeGeometry(0.006, 0.034, 4), BAMBOO_SHEATH, {
    bone: head,
    at: [sprigRoot[0] + 0.042, sprigRoot[1] + 0.018, sprigRoot[2] + 0.026],
    dir: [0.35, 0.75, 0.55],
    scale: [1, 1, 0.2],
  });

  // 6. Facial Features, Ears & Cheek Ruffs (Bilateral)
  const EAR_OUTLINE: [number, number, "sharp"?][] = [
    [-0.038, 0],
    [-0.034, 0.038],
    [0, 0.076, "sharp"],
    [0.034, 0.038],
    [0.038, 0],
  ];

  const CHEEK_RUFF: [number, number, "sharp"?][] = [
    [0, 0.032],
    [0.054, 0.022, "sharp"],
    [0.034, 0.002],
    [0.068, -0.018, "sharp"],
    [0.035, -0.034],
    [0.056, -0.056, "sharp"],
    [0.018, -0.05],
    [0, -0.028],
  ];

  for (const s of [1, -1]) {
    // A. Big Genshin Anime Eye Plane (Upright, facing forward)
    b.part(new THREE.PlaneGeometry(0.052, 0.062), "#ffffff", {
      bone: head,
      at: [s * 0.048, 0.548, 0.354],
      dir: [s * 0.26, 0.05, 0.96],
      axis: "z",
      up: [0, 1, 0],
      texture: EYE_TEX,
    });

    // B. White Eyebrow Spot
    b.part(new THREE.SphereGeometry(0.01, 8, 6), CREAM, {
      bone: head,
      at: [s * 0.035, 0.582, 0.35],
      scale: [1.1, 0.7, 0.5],
    });

    // C. Russet Tear Stripe running down side of cream muzzle
    b.sweep(
      [
        [s * 0.036, 0.542, 0.362],
        [s * 0.028, 0.525, 0.384],
        [s * 0.020, 0.512, 0.398],
      ],
      [0.006, 0.003],
      { bone: head, color: RUSSET, sides: 6 }
    );

    // D. Iconic Fluffy White Cheek Ruffs (Beveled extrude blades)
    b.extrude(CHEEK_RUFF, {
      bone: head,
      at: [s * 0.07, 0.528, 0.31],
      x: [s * 0.92, -0.12, 0.36],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: CREAM,
    });

    // E. Ears (Wide triangular shells, cream inner liner, inner fur tufts)
    const earBase: [number, number, number] = [s * 0.06, 0.59, 0.28];
    // Outer Shell
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: earBase,
      x: [s * 0.85, 0.35, -0.38],
      y: [-s * 0.28, 0.92, 0.26],
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 1,
      color: DARK_FUR,
    });
    // Inner Cream Liner
    b.extrude(EAR_OUTLINE, {
      bone: head,
      at: [earBase[0] + s * 0.004, earBase[1] + 0.002, earBase[2] + 0.008],
      x: [s * 0.85, 0.35, -0.38],
      y: [-s * 0.28, 0.92, 0.26],
      thickness: 0.008,
      scale: [0.75, 0.75, 1],
      bevel: 0.002,
      smoothing: 1,
      color: CREAM,
    });
    // Sprouting Inner Fur Tuft
    b.part(new THREE.ConeGeometry(0.008, 0.032, 5), CREAM, {
      bone: head,
      at: [earBase[0] + s * 0.006, earBase[1] + 0.012, earBase[2] + 0.015],
      dir: [s * 0.45, 0.55, 0.7],
    });
  }

  // ---------------------------------------------------------------------------
  // Genshin Accessory: Adeptal Silk Collar & Glowing Medallion
  // ---------------------------------------------------------------------------
  // Vermilion silk collar around the neck
  const collarRingPts: [number, number, number][] = [];
  const ringR = 0.076;
  const collarCenter: [number, number, number] = [0, 0.515, 0.26];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    collarRingPts.push([
      collarCenter[0] + Math.cos(a) * ringR,
      collarCenter[1] + Math.sin(a) * 0.025,
      collarCenter[2] + Math.sin(a) * ringR * 0.85,
    ]);
  }
  b.sweep(catmull(collarRingPts, { closed: true }), 0.0075, {
    bone: neck2,
    color: CORD_RED,
    sides: 8,
  });

  // Adeptal Medallion positioned proudly on chest
  const broochPos: [number, number, number] = [0, 0.468, 0.245];
  const broochDir: [number, number, number] = [0, -0.1, 0.995];

  // Gold filigree backing plate
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 8), GOLD, {
    bone: chest,
    at: broochPos,
    dir: broochDir,
  });

  // Glowing Adeptal Jade Gem
  const gemMesh = b.part(new THREE.SphereGeometry(0.016, 12, 8), JADE_GREEN, {
    bone: chest,
    at: offset(broochPos, broochDir, 0.004),
    dir: broochDir,
    scale: [1, 0.45, 1],
  });
  glow(gemMesh, 2.2);

  // Adeptal Emblem Seal Decal
  b.part(new THREE.CircleGeometry(0.02, 16), "#ffffff", {
    bone: chest,
    at: offset(broochPos, broochDir, 0.0075),
    dir: broochDir,
    axis: "z",
    up: [0, 1, 0],
    texture: AMULET_TEX,
  });

  // Golden bell and twin hanging silk tassels
  const bellPos: [number, number, number] = [
    broochPos[0],
    broochPos[1] - 0.03,
    broochPos[2],
  ];
  b.part(new THREE.SphereGeometry(0.012, 10, 8), GOLD, {
    bone: chest,
    at: bellPos,
  });
  b.sweep(
    [
      [bellPos[0] + 0.005, bellPos[1], bellPos[2]],
      [bellPos[0] + 0.008, bellPos[1] - 0.035, bellPos[2] + 0.005],
      [bellPos[0] + 0.01, bellPos[1] - 0.065, bellPos[2] + 0.008],
    ],
    [0.004, 0.0016],
    { bone: chest, color: GOLD, sides: 6 }
  );
  b.sweep(
    [
      [bellPos[0] - 0.005, bellPos[1], bellPos[2]],
      [bellPos[0] - 0.008, bellPos[1] - 0.035, bellPos[2] + 0.005],
      [bellPos[0] - 0.01, bellPos[1] - 0.065, bellPos[2] + 0.008],
    ],
    [0.004, 0.0016],
    { bone: chest, color: CORD_RED, sides: 6 }
  );

  // ---------------------------------------------------------------------------
  // Environment: Weathered Ancient Mountain Boulder & Mossy Ledges
  // ---------------------------------------------------------------------------
  // Natural river stone perched at y=0, with varied rock facets and lush moss

  // Foundation Base Stone (Touches ground at y=0)
  b.part(new THREE.CylinderGeometry(0.38, 0.44, 0.08, 10), ROCK_DARK, {
    at: [0, 0.04, 0.01],
    flat: true,
  });

  // Mid Crag Fractures (Stratified slate & granite)
  b.part(new THREE.BoxGeometry(0.58, 0.14, 0.62), ROCK_MID, {
    at: [0, 0.14, 0.0],
    rotation: [2, 12, -2],
    flat: true,
  });
  b.part(new THREE.DodecahedronGeometry(0.16), ROCK_DARK, {
    at: [0.26, 0.12, -0.18],
    scale: [1.2, 0.7, 1.1],
    flat: true,
  });
  b.part(new THREE.DodecahedronGeometry(0.14), ROCK_MID, {
    at: [-0.25, 0.11, 0.19],
    scale: [1.1, 0.8, 1.2],
    flat: true,
  });

  // Upper Boulder Perch (Height y=0.22 - 0.28)
  b.part(new THREE.CylinderGeometry(0.32, 0.36, 0.10, 10), ROCK_PAINT, {
    at: [0, 0.23, 0.01],
    scale: [1.05, 0.9, 1.2],
    flat: true,
  });

  // Velvety Moss Cushions & Stepped Perches
  const mossShelves: [number, number, number, number, number, number][] = [
    // [x, y, z, rx, ry, rz]
    [0.085, 0.285, 0.16, 0.09, 0.03, 0.09], // Left forepaw shelf
    [-0.08, 0.265, -0.15, 0.085, 0.025, 0.085], // Right hindpaw shelf
    [0.09, 0.255, -0.14, 0.085, 0.025, 0.085], // Left hindpaw shelf
    [-0.18, 0.25, 0.02, 0.095, 0.035, 0.085], // Flank moss cushion
    [0.16, 0.25, -0.06, 0.085, 0.03, 0.08], // Side moss drape
    [0.0, 0.27, 0.24, 0.09, 0.03, 0.08], // Front slope moss
    [-0.14, 0.17, 0.22, 0.08, 0.025, 0.08], // Lower moss shelf
  ];

  for (const [mx, my, mz, sx, sy, sz] of mossShelves) {
    b.part(new THREE.SphereGeometry(1, 8, 6), MOSS_BRIGHT, {
      at: [mx, my, mz],
      scale: [sx, sy, sz],
    });
  }

  // ---------------------------------------------------------------------------
  // Flora: Bamboo Culms, Glowing Adeptal Crystals, Golden Ginkgo Leaves
  // ---------------------------------------------------------------------------

  // 1. Cluster of 3 Fresh Young Bamboo Shoots growing beside the rock
  const bambooCluster = [
    { at: [-0.28, 0, -0.12] as [number, number, number], h: 0.38, r: 0.016 },
    { at: [-0.31, 0, -0.04] as [number, number, number], h: 0.28, r: 0.014 },
    { at: [-0.25, 0, -0.01] as [number, number, number], h: 0.19, r: 0.012 },
  ];

  for (const stalk of bambooCluster) {
    const nodes = 4;
    const segH = stalk.h / nodes;
    for (let i = 0; i < nodes; i++) {
      const segY = (i + 0.5) * segH;
      b.part(new THREE.CylinderGeometry(stalk.r * 0.94, stalk.r, segH * 0.96, 7), BAMBOO_CULM, {
        at: [stalk.at[0], segY, stalk.at[2]],
      });
      b.part(new THREE.TorusGeometry(stalk.r * 1.02, stalk.r * 0.2, 5, 8), BAMBOO_SHEATH, {
        at: [stalk.at[0], (i + 1) * segH, stalk.at[2]],
        rotation: [90, 0, 0],
      });
    }

    // Elegant radiating lanceolate bamboo leaves
    for (let l = 0; l < 3; l++) {
      const leafAngle = (l * 115 * Math.PI) / 180;
      const leafDir: [number, number, number] = [
        Math.cos(leafAngle) * 0.85,
        -0.22,
        Math.sin(leafAngle) * 0.85,
      ];
      b.part(new THREE.ConeGeometry(0.011, 0.082, 4), BAMBOO_CULM, {
        at: [stalk.at[0], stalk.h + 0.008, stalk.at[2]],
        dir: leafDir,
        scale: [1, 1, 0.18],
      });
    }
  }

  // 2. Glowing Adeptal Crystal Cluster (Teyvat Elemental Wonder)
  const crystalBase: [number, number, number] = [0.24, 0.16, 0.14];
  const crystals = [
    { dir: [0.35, 0.9, 0.25] as [number, number, number], h: 0.065, r: 0.012 },
    { dir: [-0.2, 0.95, 0.2] as [number, number, number], h: 0.052, r: 0.010 },
    { dir: [0.4, 0.85, -0.35] as [number, number, number], h: 0.045, r: 0.009 },
  ];

  for (const c of crystals) {
    const cMesh = b.part(new THREE.ConeGeometry(c.r, c.h, 6), "#2dd4bf", {
      at: crystalBase,
      dir: c.dir,
    });
    glow(cMesh, 2.0);
  }

  // 3. Fallen Golden Ginkgo Leaves Scattered on Stone & Moss
  const ginkgoSpots: [number, number, number][] = [
    [0.17, 0.285, -0.04],
    [-0.12, 0.282, 0.09],
    [0.02, 0.292, -0.21],
    [-0.17, 0.275, -0.19],
    [0.14, 0.278, 0.21],
    [0.24, 0.14, -0.13],
    [-0.22, 0.13, 0.17],
    [0.21, 0.09, 0.23],
    [-0.32, 0.005, -0.16],
    [0.30, 0.005, -0.07],
    [0.10, 0.005, 0.34],
    [-0.14, 0.005, 0.32],
  ];

  const ginkgoCards = ginkgoSpots.map(([x, y, z]) => frame([x, y + 0.001, z], [0, 1, 0]));

  b.cards(ginkgoCards, GINKGO_TEX, {
    size: [0.048, 0.048],
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    color: GINKGO_GOLD,
    rng: rng(404),
  });

  return b.root;
}
