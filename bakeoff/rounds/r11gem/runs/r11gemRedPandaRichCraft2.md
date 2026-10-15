```ts
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
} from "agentic-3js-builder";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Genshin Red Panda on Mossy Stone",
  description:
    "A stylized red panda in Genshin Impact cel-shaded anime aesthetic, balancing gracefully on an ancient moss-covered boulder adorned with golden ginkgo leaves, fresh bamboo shoots, and an Adeptal elemental amulet.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "genshin_red_panda", paintSize: 2048 });
  const rand = rng(1008);

  // ---------------------------------------------------------------------------
  // Genshin Cel Palette & Paints
  // ---------------------------------------------------------------------------
  const RUSSET = cel("#e85827", "#9e3012");
  const CREAM = cel("#fff9ec", "#e8d0aa");
  const DARK_FUR = cel("#261c19", "#140e0d");
  const BUFF_RING = cel("#f3ca7e", "#be8d3a");
  const NOSE_COL = "#1e181c";
  const CLAW_COL = "#f5efe6";
  const GOLD = cel("#fdb82c", "#a86f0a");
  const CORD_RED = cel("#d63031", "#801212");
  const JADE_GREEN = "#10b981";
  const ROCK_BASE = cel("#6d747d", "#40454d");
  const MOSS_GREEN = cel("#5fa32b", "#325714");
  const GINKGO_GOLD = cel("#fcc419", "#d97706");
  const BAMBOO_CULM = cel("#82c91e", "#4c7a10");
  const BAMBOO_SHEATH = cel("#b5e763", "#749e32");

  // Red panda reverse countershading: rich russet on top, dark chocolate belly
  const BODY_COAT = cel(
    furEdge(RUSSET, DARK_FUR, {
      axis: [0, 1, 0],
      level: -0.15,
      teeth: 0.16,
      period: 0.038,
      along: [0, 0, 1],
    })
  );

  // Alternating 7-ring tail paint with dark chocolate tip
  const TAIL_PAINT = paint((p, _n, s) => {
    const t = s[0];
    if (t > 0.86) return DARK_FUR;
    const wobble = 0.03 * (noise(p, 0.08, 42) - 0.5);
    const ringIdx = Math.floor((t + wobble) * 8.2);
    return ringIdx % 2 === 1 ? BUFF_RING : RUSSET;
  });

  // Weathered rock face with moss gradations in crevices
  const ROCK_PAINT = paint((p, n) => {
    const mossiness = countershade(MOSS_GREEN, ROCK_BASE, { level: 0.25, soft: 0.35 });
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
          <path d="M 10 60 C 18 24, 72 20, 90 54 C 84 88, 30 94, 10 60 Z"/>
        </clipPath>
      </defs>
      <!-- Sclera -->
      <path d="M 10 60 C 18 24, 72 20, 90 54 C 84 88, 30 94, 10 60 Z" fill="#f8f9fa"/>
      <!-- Eye Contents -->
      <g clip-path="url(#eyeClip)">
        <ellipse cx="50" cy="60" rx="28" ry="32" fill="url(#iris)"/>
        <!-- Soft upper eyelid shadow -->
        <rect x="10" y="20" width="80" height="30" fill="#2b152c" opacity="0.35"/>
        <!-- Deep plum pupil -->
        <ellipse cx="50" cy="62" rx="12" ry="17" fill="#1b0e20"/>
        <!-- Genshin Primogem Star highlight -->
        <path d="M 50 49 Q 50 62 42 62 Q 50 62 50 75 Q 50 62 58 62 Q 50 62 50 49 Z" fill="#fff9db"/>
        <circle cx="50" cy="62" r="2.2" fill="#ffffff"/>
        <!-- Luminous lower crescent -->
        <path d="M 32 74 C 40 85, 60 85, 68 74 C 62 81, 38 81, 32 74 Z" fill="#fff9db" opacity="0.85"/>
        <!-- Specular reflections -->
        <ellipse cx="38" cy="45" rx="7.5" ry="10" fill="#ffffff" transform="rotate(-15 38 45)"/>
        <circle cx="63" cy="72" r="3.6" fill="#ffffff"/>
      </g>
      <!-- Eyeliner & Lashes -->
      <path d="M 8 61 C 18 22, 70 16, 94 46 C 88 45, 78 42, 68 40 C 52 36, 26 42, 8 61 Z" fill="#221126"/>
      <path d="M 86 44 C 94 40, 99 35, 100 30 C 96 36, 90 40, 86 44 Z" fill="#221126"/>
      <path d="M 82 48 C 89 51, 95 55, 97 59 C 93 55, 87 51, 82 48 Z" fill="#221126"/>
      <!-- Lower lid -->
      <path d="M 22 74 C 38 88, 68 84, 82 68" fill="none" stroke="#221126" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Anime blush -->
      <ellipse cx="25" cy="98" rx="14" ry="7" fill="#ff8787" opacity="0.55"/>
      <line x1="17" y1="96" x2="23" y2="102" stroke="#e03131" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
      <line x1="24" y1="95" x2="30" y2="101" stroke="#e03131" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
      <!-- Brow stroke -->
      <path d="M 26 17 C 45 9, 68 13, 84 21" fill="none" stroke="#782410" stroke-width="3.6" stroke-linecap="round"/>
    </svg>`,
    { size: 512 }
  );

  // 2. Liyue Ginkgo Leaf
  const GINKGO_TEX = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M 40 76 Q 41 55 40 44 C 36 43, 20 40, 10 32 C 2 24, 6 12, 18 8 C 28 5, 36 12, 40 18 C 44 12, 52 5, 62 8 C 74 12, 78 24, 70 32 C 60 40, 44 43, 40 44" fill="#fcc419" stroke="#e67700" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M 40 44 Q 30 30 18 16 M 40 44 Q 35 25 30 12 M 40 44 Q 40 24 40 18 M 40 44 Q 45 25 50 12 M 40 44 Q 50 30 62 16" fill="none" stroke="#fab005" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 40 44 Q 41 62 43 78" fill="none" stroke="#d9480f" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 3. Adeptal Elemental Amulet Seal
  const AMULET_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#10b981" stroke="#fcc419" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fab005" stroke-width="2.2" stroke-dasharray="4 4"/>
      <!-- Primogem / Adeptal emblem -->
      <path d="M 50 18 L 76 50 L 50 82 L 24 50 Z" fill="#059669" stroke="#fff9db" stroke-width="3"/>
      <path d="M 50 26 L 68 50 L 50 74 L 32 50 Z" fill="#34d399"/>
      <circle cx="50" cy="50" r="7.5" fill="#fde047" stroke="#b45309" stroke-width="1.5"/>
      <path d="M 50 36 L 50 64 M 36 50 L 64 50" stroke="#fff9db" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 }
  );

  // 4. Paw Beans Pad Texture
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

  // 5. Stylized Fluffy Fur Tuft Card
  const FUR_TUFT_TEX = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M 32 92 C 16 70, 8 40, 18 10 C 26 30, 32 45, 36 6 C 42 26, 52 40, 56 18 C 58 44, 48 70, 32 92 Z" fill="#e85827"/>
      <path d="M 32 92 C 22 72, 18 50, 24 25 C 28 40, 32 55, 36 20 C 40 40, 48 55, 50 35 C 50 55, 42 75, 32 92 Z" fill="#f78d58"/>
    </svg>`,
    { size: 192 }
  );

  // ---------------------------------------------------------------------------
  // Skeleton: Root, Spine, Neck, Head, Tail
  // ---------------------------------------------------------------------------
  // Red panda perched on the stone: hips at y=0.54, chest at y=0.57
  const hips = b.joint("hips", { at: [0, 0.54, -0.12] });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.55, -0.02], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.56, 0.08], role: "spine" });
  const chest = b.joint("chest", { parent: spine2, at: [0, 0.57, 0.17], role: "spine" });

  const neck1 = b.joint("neck1", { parent: chest, at: [0, 0.59, 0.24], role: "neck" });
  const neck2 = b.joint("neck2", { parent: neck1, at: [0, 0.62, 0.30], role: "neck" });

  const head = b.joint("head", {
    parent: neck2,
    at: [0, 0.65, 0.35],
    dir: [0, 0.05, 0.95],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.038, 0.035]),
    aim: head.local([0, -0.03, 0.11]),
    role: "jaw",
  });

  // Majestic S-curved bushy tail
  const tailPath = catmull([
    [0, 0.53, -0.14],
    [0, 0.58, -0.27],
    [0, 0.66, -0.42],
    [0, 0.69, -0.56],
    [0, 0.64, -0.68],
    [0, 0.56, -0.77],
    [0, 0.48, -0.83],
  ]);

  const tailChain = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Limbs & Paws (IK Solved to Rest on the Stone Surface)
  // ---------------------------------------------------------------------------
  // Stone surface height under hind paws is y=0.31, fore paws y=0.33
  const pawTargets = {
    hindL: [0.11, 0.31, -0.16] as [number, number, number],
    hindR: [-0.11, 0.31, -0.16] as [number, number, number],
    foreL: [0.095, 0.33, 0.18] as [number, number, number],
    foreR: [-0.095, 0.33, 0.18] as [number, number, number],
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // 1. Hind Leg
    const hipRoot: [number, number, number] = [s * 0.08, 0.52, -0.12];
    const hindTarget = s > 0 ? pawTargets.hindL : pawTargets.hindR;
    const hindPts = limb(hipRoot, hindTarget, [0.13, 0.12], [[0, 0.25, 0.95]]);

    const hindLeg = b.chain(`legH${side}`, hindPts, {
      parent: hips,
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`],
      role: "leg",
    });

    b.sweep(hindLeg, (t) => 0.048 * (1 - 0.28 * t) + 0.016, {
      color: DARK_FUR,
      sides: 8,
    });

    // Hind Paw Assembly
    const ankleBone = hindLeg.joints[hindLeg.joints.length - 1];
    const hindPaw = b.part(new THREE.BoxGeometry(0.052, 0.026, 0.068), DARK_FUR, {
      bone: ankleBone,
      at: [hindTarget[0], hindTarget[1] + 0.013, hindTarget[2] + 0.01],
    });

    // 5 Toes & Claws
    for (let toe = -2; toe <= 2; toe++) {
      const toeX = hindTarget[0] + toe * 0.011;
      const toeZ = hindTarget[2] + 0.042;
      b.part(new THREE.SphereGeometry(0.008, 8, 6), DARK_FUR, {
        bone: ankleBone,
        at: [toeX, hindTarget[1] + 0.008, toeZ],
        scale: [1, 0.8, 1.2],
      });
      // Cute curved ivory claw
      b.part(new THREE.ConeGeometry(0.0028, 0.012, 6), CLAW_COL, {
        bone: ankleBone,
        at: [toeX, hindTarget[1] + 0.005, toeZ + 0.009],
        dir: [0, -0.2, 0.98],
      });
    }

    // Hind Paw Bean Decal
    b.part(new THREE.PlaneGeometry(0.044, 0.048), "#ffffff", {
      bone: ankleBone,
      at: [hindTarget[0], hindTarget[1] + 0.001, hindTarget[2] + 0.01],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: PAW_PAD_TEX,
    });

    // 2. Fore Leg
    const shoulderRoot: [number, number, number] = [s * 0.09, 0.55, 0.16];
    const foreTarget = s > 0 ? pawTargets.foreL : pawTargets.foreR;
    const forePts = limb(shoulderRoot, foreTarget, [0.13, 0.12], [[s * 0.1, -0.15, -0.95]]);

    const foreLeg = b.chain(`legF${side}`, forePts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });

    b.sweep(foreLeg, (t) => 0.044 * (1 - 0.25 * t) + 0.015, {
      color: DARK_FUR,
      sides: 8,
    });

    // Fore Paw Assembly
    const wristBone = foreLeg.joints[foreLeg.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.05, 0.025, 0.065), DARK_FUR, {
      bone: wristBone,
      at: [foreTarget[0], foreTarget[1] + 0.012, foreTarget[2] + 0.01],
    });

    for (let toe = -2; toe <= 2; toe++) {
      const toeX = foreTarget[0] + toe * 0.01;
      const toeZ = foreTarget[2] + 0.04;
      b.part(new THREE.SphereGeometry(0.0075, 8, 6), DARK_FUR, {
        bone: wristBone,
        at: [toeX, foreTarget[1] + 0.007, toeZ],
        scale: [1, 0.8, 1.2],
      });
      b.part(new THREE.ConeGeometry(0.0026, 0.011, 6), CLAW_COL, {
        bone: wristBone,
        at: [toeX, foreTarget[1] + 0.004, toeZ + 0.008],
        dir: [0, -0.2, 0.98],
      });
    }

    // Fore Paw Bean Decal
    b.part(new THREE.PlaneGeometry(0.042, 0.046), "#ffffff", {
      bone: wristBone,
      at: [foreTarget[0], foreTarget[1] + 0.001, foreTarget[2] + 0.01],
      dir: [0, -1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: PAW_PAD_TEX,
    });
  }

  // ---------------------------------------------------------------------------
  // Torso & Bushy Tail Geometry
  // ---------------------------------------------------------------------------
  // Smoothly lofted body with seamless skinning
  const bodyStations = [
    { at: [0, 0.53, -0.16] as [number, number, number], w: 0.19, h: 0.18 },
    { at: [0, 0.54, -0.09] as [number, number, number], w: 0.22, h: 0.21 },
    { at: [0, 0.55, 0.03] as [number, number, number], w: 0.23, h: 0.22 },
    { at: [0, 0.56, 0.15] as [number, number, number], w: 0.21, h: 0.2 },
    { at: [0, 0.58, 0.24] as [number, number, number], w: 0.16, h: 0.16 },
  ];

  b.loft(bodyStations, {
    bone: [hips, spine1, spine2, chest],
    color: BODY_COAT,
  });

  // Neck Sweep
  const neckCurve = catmull([
    [0, 0.58, 0.23],
    [0, 0.61, 0.28],
    [0, 0.64, 0.33],
  ]);
  b.sweep(neckCurve, [0.082, 0.068], {
    bone: [neck1, neck2],
    color: BODY_COAT,
    sides: 8,
  });

  // Fluffy bushy tail
  const tailSweep = b.sweep(
    tailChain,
    (t) => {
      if (t < 0.2) return 0.045 + 0.22 * t;
      if (t < 0.72) return 0.088;
      return 0.088 - 0.1 * (t - 0.72);
    },
    {
      color: TAIL_PAINT,
      sides: 10,
    }
  );

  // Scattered fluffy cards along the tail for lush plush silhouette
  const tailFurFrames: ReturnType<typeof frame>[] = [];
  for (let i = 1; i <= 24; i++) {
    const t = 0.08 + (i / 25) * 0.8;
    const angle = (i * 137.5) % 360;
    const pt = tailSweep.at(t, angle);
    tailFurFrames.push(pt);
  }
  b.cards(tailFurFrames, FUR_TUFT_TEX, {
    size: [0.048, 0.065],
    lean: 50,
    bend: 20,
    flow: [0, 0, -1],
    color: TAIL_PAINT,
    vary: 0.25,
    rng: rng(55),
  });

  // ---------------------------------------------------------------------------
  // Head, Face, Ears & Eyes
  // ---------------------------------------------------------------------------
  // Skull base mesh
  const skullGeo = new THREE.SphereGeometry(0.082, 14, 12);
  const skull = b.part(skullGeo, RUSSET, {
    bone: head,
    at: head.local([0, 0.015, 0.02]),
    scale: [1.08, 0.95, 0.95],
  });

  // Snout (Cream muzzle)
  b.part(new THREE.CylinderGeometry(0.034, 0.05, 0.07, 12), CREAM, {
    bone: head,
    at: head.local([0, -0.012, 0.085]),
    dir: head.dir([0, 0.08, 0.96]),
  });

  // Black button nose tip
  b.part(new THREE.SphereGeometry(0.013, 8, 6), NOSE_COL, {
    bone: head,
    at: head.local([0, -0.003, 0.125]),
    scale: [1.2, 0.85, 0.9],
  });

  // Cute lower jaw with soft chin
  b.part(new THREE.BoxGeometry(0.044, 0.022, 0.054), CREAM, {
    bone: jaw,
    at: jaw.local([0, 0.024, 0.012]),
  });
  // Peeking pink tongue
  b.part(new THREE.BoxGeometry(0.022, 0.007, 0.028), "#ff7aa2", {
    bone: jaw,
    at: jaw.local([0, 0.028, 0.016]),
  });

  // Fluffy Cheek Ruffs (Signature stylized Genshin blades)
  const CHEEK_BLADE: [number, number, "sharp"?][] = [
    [0, 0],
    [0.05, 0.028],
    [0.082, 0.012, "sharp"],
    [0.062, -0.014],
    [0.095, -0.03, "sharp"],
    [0.054, -0.042],
    [0.074, -0.062, "sharp"],
    [0.022, -0.048],
    [0, -0.025],
  ];

  for (const s of [1, -1]) {
    // 1. Stylized beveled cheek fluff
    b.extrude(CHEEK_BLADE, {
      bone: head,
      at: head.local([s * 0.068, -0.018, 0.035]),
      x: head.dir([s * 0.92, 0, 0.28]),
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      color: CREAM,
    });

    // 2. Ears: Wide triangular with inner cream fluff
    const earBase = head.local([s * 0.065, 0.075, 0.015]);
    const earDir = head.dir([s * 0.45, 0.82, -0.15]);

    // Outer ear shell (Dark backing)
    b.part(new THREE.ConeGeometry(0.042, 0.085, 4), RUSSET, {
      bone: head,
      at: earBase,
      dir: earDir,
      scale: [1, 1, 0.45],
      rotation: [0, s * 25, s * -15],
    });

    // Inner ear cream liner
    b.part(new THREE.ConeGeometry(0.034, 0.072, 4), CREAM, {
      bone: head,
      at: offset(earBase, head.dir([s * 0.01, 0.01, 0.012]), 0.008),
      dir: earDir,
      scale: [0.85, 0.9, 0.3],
      rotation: [0, s * 25, s * -15],
    });

    // Inner ear fur tufts bursting forward
    b.part(new THREE.ConeGeometry(0.009, 0.038, 5), CREAM, {
      bone: head,
      at: offset(earBase, head.dir([s * 0.008, -0.005, 0.015]), 0.01),
      dir: head.dir([s * 0.25, 0.4, 0.8]),
    });
    b.part(new THREE.ConeGeometry(0.007, 0.032, 5), CREAM, {
      bone: head,
      at: offset(earBase, head.dir([s * 0.015, 0.005, 0.015]), 0.01),
      dir: head.dir([s * 0.45, 0.5, 0.6]),
    });

    // 3. Cute pale eyebrow spots above eyes
    b.part(new THREE.SphereGeometry(0.011, 8, 6), CREAM, {
      bone: head,
      at: head.local([s * 0.038, 0.052, 0.082]),
      scale: [1.1, 0.7, 0.5],
    });

    // 4. Red-cinnamon tear stripes alongside the snout
    const tearStart = head.local([s * 0.042, 0.02, 0.082]);
    const tearMid = head.local([s * 0.034, -0.005, 0.098]);
    const tearEnd = head.local([s * 0.026, -0.028, 0.108]);
    b.sweep(bezier(tearStart, tearMid, tearEnd), [0.007, 0.0035], {
      bone: head,
      color: RUSSET,
      sides: 6,
    });

    // 5. Anime Eye placement
    const eyeAt = head.local([s * 0.051, 0.018, 0.082]);
    const eyeDir = head.dir([s * 0.22, 0.03, 0.97]);

    b.part(new THREE.PlaneGeometry(0.052, 0.065), "#ffffff", {
      bone: head,
      at: eyeAt,
      dir: eyeDir,
      axis: "z",
      up: [0, 1, 0],
      texture: EYE_TEX,
      scale: [s > 0 ? -1 : 1, 1, 1], // Mirror for left eye
    });
  }

  // ---------------------------------------------------------------------------
  // Genshin Accessory: The Adeptal Collar & Talisman
  // ---------------------------------------------------------------------------
  // Vermilion braided silk cord circling the neck
  const neckRingPts: [number, number, number][] = [];
  const ringRadius = 0.078;
  const neckCenter = [0, 0.605, 0.28];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    neckRingPts.push([
      neckCenter[0] + Math.cos(a) * ringRadius,
      neckCenter[1] + Math.sin(a) * 0.03,
      neckCenter[2] + Math.sin(a) * ringRadius * 0.85,
    ]);
  }
  b.sweep(catmull(neckRingPts, { closed: true }), 0.0085, {
    bone: neck2,
    color: CORD_RED,
    sides: 8,
  });

  // Golden Medallion Brooch on chest
  const broochPos = head.local([0, -0.078, -0.03]);
  const broochDir = head.dir([0, -0.15, 0.98]);

  // Gold filigree backing plate
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 8), GOLD, {
    bone: chest,
    at: broochPos,
    dir: broochDir,
  });

  // Glowing Adeptal Gem (Dendro/Geo Emerald)
  const gemMesh = b.part(new THREE.SphereGeometry(0.018, 12, 8), JADE_GREEN, {
    bone: chest,
    at: offset(broochPos, broochDir, 0.004),
    dir: broochDir,
    scale: [1, 0.45, 1],
  });
  glow(gemMesh, 2.2);

  // Emblazoned Adeptal Crest Decal
  b.part(new THREE.CircleGeometry(0.022, 16), "#ffffff", {
    bone: chest,
    at: offset(broochPos, broochDir, 0.0075),
    dir: broochDir,
    axis: "z",
    up: [0, 1, 0],
    texture: AMULET_TEX,
  });

  // Golden Bell hanging under the medallion
  const bellPos = offset(broochPos, [0, -1, 0], 0.032);
  b.part(new THREE.SphereGeometry(0.014, 10, 8), GOLD, {
    bone: chest,
    at: bellPos,
  });
  b.part(new THREE.TorusGeometry(0.0045, 0.0018, 6, 8), GOLD, {
    bone: chest,
    at: offset(bellPos, [0, -1, 0], 0.012),
  });

  // Dual Silk Tassels (Red & Gold) swaying against chest
  b.sweep([[bellPos[0] + 0.006, bellPos[1], bellPos[2]], [bellPos[0] + 0.01, bellPos[1] - 0.04, bellPos[2] + 0.005], [bellPos[0] + 0.012, bellPos[1] - 0.075, bellPos[2] + 0.008]], [0.0045, 0.0018], {
    bone: chest,
    color: GOLD,
    sides: 6,
  });
  b.sweep([[bellPos[0] - 0.006, bellPos[1], bellPos[2]], [bellPos[0] - 0.01, bellPos[1] - 0.04, bellPos[2] + 0.005], [bellPos[0] - 0.012, bellPos[1] - 0.075, bellPos[2] + 0.008]], [0.0045, 0.0018], {
    bone: chest,
    color: CORD_RED,
    sides: 6,
  });

  // ---------------------------------------------------------------------------
  // Environment: Weathered Ancient Mossy Stone Base
  // ---------------------------------------------------------------------------
  // Multi-tiered weathered mountain river boulder resting on y=0
  // Tier 1: Main base foundation slab (touching floor at y=0)
  b.part(new THREE.CylinderGeometry(0.36, 0.42, 0.12, 9), ROCK_PAINT, {
    at: [0, 0.06, 0.02],
    flat: true,
  });

  // Tier 2: Sculpted mid-boulder with angular crystalline rock shelves
  b.part(new THREE.BoxGeometry(0.54, 0.16, 0.68), ROCK_PAINT, {
    at: [0, 0.18, 0.01],
    rotation: [2, 14, -3],
    flat: true,
  });

  // Tier 3: Upper mossy plateau that the red panda stands on (top y=0.30 - 0.33)
  b.part(new THREE.CylinderGeometry(0.31, 0.35, 0.12, 10), MOSS_GREEN, {
    at: [0, 0.27, 0.01],
    scale: [1.05, 0.85, 1.25],
    flat: true,
  });

  // Supplementary natural boulder rocks nestled around the base
  b.part(new THREE.DodecahedronGeometry(0.14), ROCK_PAINT, {
    at: [0.28, 0.09, -0.22],
    flat: true,
    scale: [1.2, 0.8, 1],
  });
  b.part(new THREE.DodecahedronGeometry(0.12), ROCK_PAINT, {
    at: [-0.26, 0.08, 0.24],
    flat: true,
    scale: [1, 0.75, 1.3],
  });
  b.part(new THREE.DodecahedronGeometry(0.09), ROCK_PAINT, {
    at: [0.25, 0.06, 0.22],
    flat: true,
    scale: [1.1, 0.6, 1.2],
  });

  // Lush velvety moss cushions draping over the boulder edges
  const mossCushions: [number, number, number, number][] = [
    [-0.18, 0.305, -0.12, 0.09],
    [0.19, 0.302, 0.08, 0.085],
    [0.0, 0.32, 0.26, 0.08],
    [-0.22, 0.26, 0.04, 0.075],
    [0.17, 0.27, -0.22, 0.08],
  ];
  for (const [mx, my, mz, mr] of mossCushions) {
    b.part(new THREE.SphereGeometry(mr, 8, 6), MOSS_GREEN, {
      at: [mx, my, mz],
      scale: [1.3, 0.45, 1.1],
    });
  }

  // ---------------------------------------------------------------------------
  // Flora: Bamboo Shoots, Ginkgo Leaves, Glowing Crystal Bloom
  // ---------------------------------------------------------------------------
  // 1. Fresh Young Bamboo Shoots emerging beside the stone
  const bambooStalks = [
    { at: [-0.28, 0, -0.12] as [number, number, number], h: 0.38, r: 0.018 },
    { at: [-0.31, 0, -0.04] as [number, number, number], h: 0.26, r: 0.015 },
  ];

  for (const stalk of bambooStalks) {
    const nodes = 4;
    const segH = stalk.h / nodes;
    for (let i = 0; i < nodes; i++) {
      const segY = (i + 0.5) * segH;
      // Bamboo segment
      b.part(new THREE.CylinderGeometry(stalk.r * 0.94, stalk.r, segH * 0.96, 7), BAMBOO_CULM, {
        at: [stalk.at[0], segY, stalk.at[2]],
      });
      // Node culm ring
      b.part(new THREE.TorusGeometry(stalk.r * 1.02, stalk.r * 0.22, 5, 8), BAMBOO_SHEATH, {
        at: [stalk.at[0], (i + 1) * segH, stalk.at[2]],
        rotation: [90, 0, 0],
      });
    }

    // Slender pointed bamboo leaves radiating from the apex
    for (let l = 0; l < 4; l++) {
      const leafAngle = (l * 85 * Math.PI) / 180;
      const leafDir: [number, number, number] = [
        Math.cos(leafAngle) * 0.85,
        -0.25,
        Math.sin(leafAngle) * 0.85,
      ];
      b.part(new THREE.ConeGeometry(0.012, 0.09, 4), BAMBOO_CULM, {
        at: [stalk.at[0], stalk.h + 0.01, stalk.at[2]],
        dir: leafDir,
        scale: [1, 1, 0.2],
      });
    }
  }

  // 2. Fallen Golden Ginkgo Leaves Scattered on Stone & Floor
  const ginkgoPositions: [number, number, number, number][] = [
    [0.18, 0.318, -0.04, 35],
    [-0.14, 0.315, 0.09, -60],
    [0.02, 0.325, -0.24, 110],
    [-0.19, 0.305, -0.22, 15],
    [0.15, 0.312, 0.22, -130],
    [0.26, 0.145, -0.15, 45],
    [-0.24, 0.13, 0.18, -25],
    [0.22, 0.095, 0.25, 80],
    [-0.34, 0.005, -0.18, 140],
    [0.32, 0.005, -0.08, -75],
    [0.11, 0.005, 0.36, 15],
    [-0.16, 0.005, 0.34, -115],
  ];

  const ginkgoFrames = ginkgoPositions.map(([x, y, z, rot]) => {
    const f = frame([x, y + 0.001, z], [0, 1, 0]);
    return f;
  });

  b.cards(ginkgoFrames, GINKGO_TEX, {
    size: [0.052, 0.052],
    lean: 90,
    flow: [1, 0, 0],
    mirror: true,
    color: GINKGO_GOLD,
    rng: rng(777),
  });

  // 3. Magical Glowing Adeptal Crystal Flower (Teyvat Floral Ambiance)
  const flowerBase = [0.24, 0.17, 0.19] as [number, number, number];
  // Curved slender stem
  b.sweep(
    bezier(
      flowerBase,
      [flowerBase[0] + 0.01, flowerBase[1] + 0.04, flowerBase[2] + 0.01],
      [flowerBase[0] + 0.015, flowerBase[1] + 0.08, flowerBase[2] + 0.015]
    ),
    0.0035,
    { color: BAMBOO_CULM, sides: 6 }
  );

  const bloomCenter: [number, number, number] = [
    flowerBase[0] + 0.015,
    flowerBase[1] + 0.082,
    flowerBase[2] + 0.015,
  ];

  // 5 Glowing Crystal Petals
  for (let p = 0; p < 5; p++) {
    const pAngle = (p / 5) * Math.PI * 2;
    const petalDir: [number, number, number] = [
      Math.cos(pAngle) * 0.75,
      0.65,
      Math.sin(pAngle) * 0.75,
    ];
    const petalMesh = b.part(new THREE.ConeGeometry(0.008, 0.024, 4), "#2dd4bf", {
      at: bloomCenter,
      dir: petalDir,
      scale: [1, 1, 0.35],
    });
    glow(petalMesh, 1.8);
  }

  // Glowing center stamen
  const stamenMesh = b.part(new THREE.SphereGeometry(0.0055, 8, 6), "#fde047", {
    at: bloomCenter,
  });
  glow(stamenMesh, 2.5);

  return b.root;
}
```