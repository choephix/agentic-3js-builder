import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  paint,
  mottle,
  stripes,
  grain,
  noise,
  mix,
  smoothstep,
  rng,
  svg,
  DEG,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A whimsical low-poly desert oasis diorama featuring a grand dromedary camel, a resting companion, striped Bedouin tents, arched date palms, an azure pool, and a crackling campfire.",
};

export default function build() {
  const b = createBuilder({ name: "desert_oasis_diorama", detail: 1.1 });
  const random = rng(42);

  // ---------------------------------------------------------------------------
  // PALETTE & PAINTS
  // ---------------------------------------------------------------------------
  const SAND_GOLD = "#e8bd78";
  const SAND_WARM = "#d69e54";
  const SAND_LIGHT = "#f5d799";
  const CLIFF_DARK = "#7d5533";
  const CLIFF_MID = "#9e7246";

  const POOL_TEAL = "#20bfb4";
  const POOL_DEEP = "#0d6e7a";
  const POOL_SHALLOW = "#57decb";

  const PALM_BARK_DARK = "#4a2f18";
  const PALM_BARK_LIGHT = "#785130";
  const FROND_GREEN = "#2a8047";
  const FROND_BRIGHT = "#49a85c";
  const FROND_DEEP = "#1d5c34";
  const DATE_ORANGE = "#e67e17";
  const DATE_GOLD = "#f5a623";

  const CAMEL_COAT = "#c98d54";
  const CAMEL_SHADE = "#aa6d37";
  const CAMEL_CREAM = "#f4e0c4";
  const CAMEL_DARK = "#3b261a";
  const CAMEL_FLEECE = "#dba26b";

  const TENT_TERRACOTTA = "#b34226";
  const TENT_IVORY = "#fbf4e2";
  const TENT_INDIGO = "#253457";
  const WOOD_DARK = "#422818";
  const WOOD_POLE = "#634228";
  const BRASS_GOLD = "#e5b43b";
  const BRASS_DARK = "#664917";
  const FIRE_ORANGE = "#ff5500";
  const FIRE_YELLOW = "#ffcc00";
  const CHARCOAL = "#211e1c";
  const PEBBLE_GREY = "#9e8e7a";
  const PEBBLE_LIGHT = "#c4b59f";

  // Stylized paints
  const sandPaint = mottle(SAND_GOLD, SAND_LIGHT, { size: 0.18, contrast: 1.2, seed: 11 });
  const cliffPaint = grain(CLIFF_MID, CLIFF_DARK, { size: 0.08, axis: "y", seed: 7 });
  const camelCoatPaint = mottle(CAMEL_COAT, CAMEL_SHADE, { size: 0.12, contrast: 0.8, seed: 3 });
  const palmTrunkPaint = grain(PALM_BARK_LIGHT, PALM_BARK_DARK, { size: 0.04, axis: "y", seed: 9 });

  const tentStripePaint = stripes(TENT_TERRACOTTA, TENT_IVORY, {
    size: 0.14,
    axis: "x",
    width: 0.45,
    wobble: 0.08,
    seed: 5,
  });

  const waterPaint = paint((p) => {
    const dist = Math.hypot(p.x - -0.22, p.z - 0.48);
    const wave = noise(p, 0.12, 14);
    const deepT = smoothstep(0.1, 0.42, dist);
    const c = mix(POOL_DEEP, POOL_TEAL, 1 - deepT);
    return mix(c, POOL_SHALLOW, wave * 0.3);
  });

  // ---------------------------------------------------------------------------
  // TEXTURES (SVG Drawings)
  // ---------------------------------------------------------------------------
  const camelEyeTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#d49444"/>
          <stop offset="65%" stop-color="#6e4218"/>
          <stop offset="100%" stop-color="#2a1607"/>
        </radialGradient>
      </defs>
      <!-- Eye contour -->
      <ellipse cx="32" cy="32" rx="28" ry="20" fill="#fdf7ec"/>
      <!-- Iris -->
      <ellipse cx="34" cy="32" rx="16" ry="16" fill="url(#iris)"/>
      <!-- Pupil -->
      <ellipse cx="34" cy="32" rx="8" ry="10" fill="#150a04"/>
      <!-- Glossy highlights -->
      <circle cx="28" cy="27" r="4.5" fill="#ffffff"/>
      <circle cx="39" cy="36" r="2.2" fill="#ffffff"/>
      <!-- Soft lid crease -->
      <path d="M6 24 Q32 10 58 24" stroke="#4a2c16" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <!-- Long lashes -->
      <path d="M14 21 Q10 13 4 11" stroke="#2c170b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M26 16 Q24 7 19 3" stroke="#2c170b" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M40 17 Q42 8 47 4" stroke="#2c170b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M52 23 Q58 17 62 14" stroke="#2c170b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const kilimRugTex = svg(
    `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="160" fill="#8f2415"/>
      <!-- Outer border -->
      <rect x="8" y="8" width="224" height="144" fill="none" stroke="#e8c878" stroke-width="5"/>
      <rect x="18" y="18" width="204" height="124" fill="#1b2a47"/>
      <!-- Zigzag wave border -->
      <path d="M22 22 L28 28 L34 22 L40 28 L46 22 L52 28 L58 22 L64 28 L70 22 L76 28 L82 22 L88 28 L94 22 L100 28 L106 22 L112 28 L118 22 L124 28 L130 22 L136 28 L142 22 L148 28 L154 22 L160 28 L166 22 L172 28 L178 22 L184 28 L190 22 L196 28 L202 22 L208 28 L214 22" stroke="#d68b36" stroke-width="2" fill="none"/>
      <!-- Inner field -->
      <rect x="28" y="28" width="184" height="104" fill="#a83120"/>
      <!-- Three stepped diamond medallions -->
      <g transform="translate(56, 80)">
        <polygon points="0,-36 26,0 0,36 -26,0" fill="#e8c878"/>
        <polygon points="0,-24 17,0 0,24 -17,0" fill="#1b2a47"/>
        <polygon points="0,-12 8,0 0,12 -8,0" fill="#d6492a"/>
        <circle cx="0" cy="0" r="3.5" fill="#fdf8e8"/>
      </g>
      <g transform="translate(120, 80)">
        <polygon points="0,-42 32,0 0,42 -32,0" fill="#e8c878"/>
        <polygon points="0,-28 21,0 0,28 -21,0" fill="#1b2a47"/>
        <polygon points="0,-15 11,0 0,15 -11,0" fill="#20948b"/>
        <circle cx="0" cy="0" r="4" fill="#fdf8e8"/>
      </g>
      <g transform="translate(184, 80)">
        <polygon points="0,-36 26,0 0,36 -26,0" fill="#e8c878"/>
        <polygon points="0,-24 17,0 0,24 -17,0" fill="#1b2a47"/>
        <polygon points="0,-12 8,0 0,12 -8,0" fill="#d6492a"/>
        <circle cx="0" cy="0" r="3.5" fill="#fdf8e8"/>
      </g>
      <!-- Fringe tassels on ends -->
      <g stroke="#f4e4c2" stroke-width="2.5" stroke-linecap="round">
        <line x1="2" y1="20" x2="8" y2="20"/><line x1="2" y1="36" x2="8" y2="36"/>
        <line x1="2" y1="52" x2="8" y2="52"/><line x1="2" y1="68" x2="8" y2="68"/>
        <line x1="2" y1="84" x2="8" y2="84"/><line x1="2" y1="100" x2="8" y2="100"/>
        <line x1="2" y1="116" x2="8" y2="116"/><line x1="2" y1="132" x2="8" y2="132"/>
        <line x1="232" y1="20" x2="238" y2="20"/><line x1="232" y1="36" x2="238" y2="36"/>
        <line x1="232" y1="52" x2="238" y2="52"/><line x1="232" y1="68" x2="238" y2="68"/>
        <line x1="232" y1="84" x2="238" y2="84"/><line x1="232" y1="100" x2="238" y2="100"/>
        <line x1="232" y1="116" x2="238" y2="116"/><line x1="232" y1="132" x2="238" y2="132"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const saddleBagTex = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#aa3a1d"/>
      <rect x="6" y="6" width="116" height="84" fill="#203457"/>
      <!-- Striped geometric band -->
      <path d="M10 20 L24 38 L38 20 L52 38 L66 20 L80 38 L94 20 L108 38 L118 25" stroke="#f0c24f" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
      <path d="M10 76 L24 58 L38 76 L52 58 L66 76 L80 58 L94 76 L108 58 L118 71" stroke="#f0c24f" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
      <rect x="22" y="42" width="84" height="12" fill="#d97528"/>
      <circle cx="64" cy="48" r="4.5" fill="#fdf8e8"/>
      <!-- Leather buckle strap -->
      <rect x="58" y="0" width="12" height="96" fill="#4d2a13"/>
      <rect x="56" y="42" width="16" height="12" fill="none" stroke="#f5d061" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  const waterRippleTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="58" fill="none" stroke="#e0ffff" stroke-width="3" opacity="0.45" stroke-dasharray="14 10"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="#ffffff" stroke-width="3.5" opacity="0.75"/>
      <circle cx="64" cy="64" r="28" fill="none" stroke="#d5fbf8" stroke-width="3" opacity="0.85" stroke-dasharray="10 8"/>
      <circle cx="64" cy="64" r="14" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // SKELETON ROOT & DIORAMA GROUND
  // ---------------------------------------------------------------------------
  const dioramaRoot = b.joint("dioramaRoot", { at: [0, 0, 0] });

  // Faceted 14-sided diorama base plinth
  const BASE_R = 1.35;
  const BASE_H = 0.18;
  const plinthOutline: [number, number, "sharp"][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    plinthOutline.push([Math.cos(a) * BASE_R, Math.sin(a) * BASE_R, "sharp"]);
  }

  // Base cliff sides and slab
  b.extrude(plinthOutline, {
    at: [0, BASE_H / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: BASE_H,
    color: cliffPaint,
    bone: dioramaRoot,
    name: "basePlinth",
  });

  // Top sandy surface disc
  b.part(new THREE.CylinderGeometry(BASE_R * 0.98, BASE_R * 0.99, 0.02, 28), sandPaint, {
    bone: dioramaRoot,
    at: [0, BASE_H + 0.01, 0],
    name: "sandFloor",
  });

  // Sculpted dunes curving across the rear edge
  const duneCrestPath = catmull([
    [-1.25, BASE_H, -0.4],
    [-0.95, BASE_H + 0.28, -0.75],
    [-0.35, BASE_H + 0.32, -1.05],
    [0.45, BASE_H + 0.26, -1.0],
    [1.15, BASE_H, -0.5],
  ]);
  b.sweep(duneCrestPath, (t) => [0.22 * Math.sin(t * Math.PI) + 0.06, 0.15 * Math.sin(t * Math.PI) + 0.04], {
    color: sandPaint,
    bone: dioramaRoot,
    section: "circle",
    name: "duneRidgeRear",
  });

  const duneSidePath = catmull([
    [0.65, BASE_H, -0.9],
    [1.05, BASE_H + 0.18, -0.2],
    [1.2, BASE_H, 0.5],
  ]);
  b.sweep(duneSidePath, (t) => [0.16 * Math.sin(t * Math.PI) + 0.05, 0.12 * Math.sin(t * Math.PI) + 0.03], {
    color: sandPaint,
    bone: dioramaRoot,
    name: "duneRidgeRight",
  });

  // ---------------------------------------------------------------------------
  // OASIS WATER POOL & FLORA
  // ---------------------------------------------------------------------------
  const POOL_C = new THREE.Vector3(-0.25, BASE_H + 0.015, 0.48);

  // Inset water surface
  b.part(new THREE.CylinderGeometry(0.48, 0.44, 0.02, 24), waterPaint, {
    bone: dioramaRoot,
    at: POOL_C.toArray(),
    scale: [1, 1, 0.82],
    name: "oasisPoolWater",
  });

  // Translucent water ripple overlay
  b.part(new THREE.PlaneGeometry(0.72, 0.72), "#ffffff", {
    bone: dioramaRoot,
    at: [POOL_C.x, POOL_C.y + 0.012, POOL_C.z],
    dir: [0, 1, 0],
    axis: "z",
    texture: waterRippleTex,
    name: "waterRipple",
  });

  // Stones around pool edge
  const STONE_COUNT = 20;
  for (let i = 0; i < STONE_COUNT; i++) {
    const a = (i / STONE_COUNT) * Math.PI * 2;
    const rVar = 0.46 + random() * 0.08;
    const sx = Math.cos(a) * rVar;
    const sz = Math.sin(a) * rVar * 0.82;
    const sR = 0.035 + random() * 0.04;
    const sY = BASE_H + sR * 0.7;
    const stoneCol = i % 2 === 0 ? PEBBLE_GREY : PEBBLE_LIGHT;
    b.part(new THREE.DodecahedronGeometry(sR, 0), stoneCol, {
      bone: dioramaRoot,
      at: [POOL_C.x + sx, sY, POOL_C.z + sz],
      rotation: [random() * 30, random() * 360, random() * 30],
      name: `poolStone_${i}`,
    });
  }

  // Floating water lily pads
  const padAngles = [0.4, 1.8, 3.2, 4.6];
  for (let i = 0; i < padAngles.length; i++) {
    const a = padAngles[i];
    const px = POOL_C.x + Math.cos(a) * 0.26;
    const pz = POOL_C.z + Math.sin(a) * 0.2;
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.005, 10), "#2b8c4c", {
      bone: dioramaRoot,
      at: [px, POOL_C.y + 0.014, pz],
      name: `lilyPad_${i}`,
    });
    // Lotus flower on two pads
    if (i % 2 === 0) {
      b.part(new THREE.ConeGeometry(0.022, 0.035, 6), "#f78da7", {
        bone: dioramaRoot,
        at: [px, POOL_C.y + 0.032, pz],
        name: `lotusBlossom_${i}`,
      });
      b.part(new THREE.SphereGeometry(0.008, 6, 6), "#ffe600", {
        bone: dioramaRoot,
        at: [px, POOL_C.y + 0.042, pz],
        name: `lotusCenter_${i}`,
      });
    }
  }

  // Reed tufts along the rear pool bank
  const reedClusters = [
    [-0.52, BASE_H, 0.45],
    [-0.42, BASE_H, 0.74],
    [-0.1, BASE_H, 0.78],
  ];
  for (let c = 0; c < reedClusters.length; c++) {
    const [cx, cy, cz] = reedClusters[c];
    for (let r = 0; r < 5; r++) {
      const rx = cx + (random() - 0.5) * 0.1;
      const rz = cz + (random() - 0.5) * 0.08;
      const rH = 0.25 + random() * 0.18;
      b.rod([rx, cy, rz], [rx + (random() - 0.5) * 0.04, cy + rH, rz + (random() - 0.5) * 0.04], 0.006, "#3c7a36", {
        bone: dioramaRoot,
        name: `reedStem_${c}_${r}`,
      });
      b.capsule(
        [rx, cy + rH - 0.05, rz],
        [rx, cy + rH, rz],
        0.012,
        "#4a3016",
        { bone: dioramaRoot, name: `reedHead_${c}_${r}` },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // HERO STANDING CAMEL
  // ---------------------------------------------------------------------------
  // Camel root hips at x = 0 (perfect anatomical rigging with Left +X and Right -X)
  const camelHips = b.joint("hips", {
    parent: dioramaRoot,
    at: [0, 0.86, -0.05],
    role: "spine",
  });

  const spineChain = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.05],
      [0, 0.88, 0.16],
      [0, 0.89, 0.36],
    ]),
    {
      parent: camelHips,
      count: 2,
      names: ["spine1", "chest"],
      role: "spine",
    },
  );
  const chestJoint = spineChain.joints[1];

  // Neck chain rising forward
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.89, 0.36],
      [0, 0.98, 0.46],
      [0, 1.2, 0.52],
      [0, 1.42, 0.58],
    ]),
    {
      parent: chestJoint,
      count: 3,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );
  const neckTip = neckChain.joints[neckChain.joints.length - 1];

  // Head and jaw joints
  const headJoint = b.joint("head", {
    parent: neckTip,
    at: [0, 1.5, 0.65],
    dir: [0, 0.08, 1],
    role: "head",
  });

  const jawJoint = b.joint("jaw", {
    parent: headJoint,
    at: headJoint.local([0, -0.05, 0.06]),
    dir: headJoint.dir([0, -0.15, 0.98]),
    role: "jaw",
  });

  // Tail chain
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.16],
      [0, 0.68, -0.22],
      [0, 0.52, -0.25],
    ]),
    {
      parent: camelHips,
      count: 2,
      names: ["tail1", "tail2"],
      role: "tail",
    },
  );

  // Camel Legs (IK limb placement)
  // Foot contact rests on sand at y = 0.18 + footRadius(0.04) = 0.22m
  const FOOT_Y = 0.22;
  const LEG_LENS = [0.32, 0.3];

  // Front Left Leg (+X)
  const ptsFL = limb([0.14, 0.84, 0.36], [0.14, FOOT_Y, 0.42], LEG_LENS, [[0, 0, 1]]);
  const legFL = b.chain("legFL", ptsFL, {
    parent: chestJoint,
    names: ["shoulderL", "kneeL", "footL"],
    role: "leg",
    contact: [0.14, BASE_H, 0.42],
  });

  // Front Right Leg (-X)
  const ptsFR = limb([-0.14, 0.84, 0.36], [-0.14, FOOT_Y, 0.3], LEG_LENS, [[0, 0, 1]]);
  const legFR = b.chain("legFR", ptsFR, {
    parent: chestJoint,
    names: ["shoulderR", "kneeR", "footR"],
    role: "leg",
    contact: [-0.14, BASE_H, 0.3],
  });

  // Hind Left Leg (+X)
  const ptsHL = limb([0.14, 0.82, -0.06], [0.14, FOOT_Y, -0.12], LEG_LENS, [[0, 0, -1]]);
  const legHL = b.chain("legHL", ptsHL, {
    parent: camelHips,
    names: ["hipHL", "hockHL", "footHL"],
    role: "leg",
    contact: [0.14, BASE_H, -0.12],
  });

  // Hind Right Leg (-X)
  const ptsHR = limb([-0.14, 0.82, -0.06], [-0.14, FOOT_Y, 0.02], LEG_LENS, [[0, 0, -1]]);
  const legHR = b.chain("legHR", ptsHR, {
    parent: camelHips,
    names: ["hipHR", "hockHR", "footHR"],
    role: "leg",
    contact: [-0.14, BASE_H, 0.02],
  });

  // Camel Leg Sweeps & Knobby Knees & Padded Feet
  const legChains = [
    { chain: legFL, side: "L", knee: "kneeL", foot: "footL" },
    { chain: legFR, side: "R", knee: "kneeR", foot: "footR" },
    { chain: legHL, side: "L", knee: "hockHL", foot: "footHL" },
    { chain: legHR, side: "R", knee: "hockHR", foot: "footHR" },
  ];

  for (const { chain, knee, foot } of legChains) {
    b.sweep(chain, [0.062, 0.042], { color: camelCoatPaint });
    // Knobby knee callus pad
    const kneeJoint = chain.joints.find((j) => j.name === knee);
    if (kneeJoint) {
      b.part(new THREE.SphereGeometry(0.052, 8, 6), CAMEL_DARK, {
        bone: kneeJoint,
        at: kneeJoint.at,
        scale: [0.9, 1.1, 0.85],
        name: `${knee}_pad`,
      });
    }
    // Wide padded 2-toed camel foot
    const footJoint = chain.joints.find((j) => j.name === foot);
    if (footJoint) {
      b.part(new THREE.CylinderGeometry(0.065, 0.075, 0.04, 8), CAMEL_DARK, {
        bone: footJoint,
        at: [footJoint.at.x, BASE_H + 0.02, footJoint.at.z],
        name: `${foot}_sole`,
      });
      // Soft cream toe cleft
      b.part(new THREE.BoxGeometry(0.03, 0.035, 0.06), CAMEL_CREAM, {
        bone: footJoint,
        at: [footJoint.at.x, BASE_H + 0.02, footJoint.at.z + 0.02],
        name: `${foot}_toes`,
      });
    }
  }

  // Camel Body Volumes
  // Barrel chest & abdomen
  b.sweep(
    catmull([
      [0, 0.85, -0.16],
      [0, 0.86, 0.08],
      [0, 0.88, 0.28],
      [0, 0.89, 0.42],
    ]),
    (t) => [0.18 + 0.06 * Math.sin(t * Math.PI), 0.2 + 0.06 * Math.sin(t * Math.PI)],
    {
      color: camelCoatPaint,
      bone: [camelHips, chestJoint],
      name: "camelTorso",
    },
  );

  // Sternal pedestal (chest callus pad)
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.16), CAMEL_DARK, {
    bone: chestJoint,
    at: [0, 0.68, 0.32],
    name: "sternalCallus",
  });

  // The Grand Dromedary Hump
  const humpPeak = [0, 1.28, 0.1];
  b.loft(
    [
      { at: [0, 0.98, -0.06], w: 0.32, h: 0.18 },
      { at: [0, 1.16, 0.08], w: 0.36, h: 0.3 },
      { at: humpPeak, w: 0.26, h: 0.24 },
      { at: [0, 1.05, 0.26], w: 0.3, h: 0.2 },
    ],
    {
      bone: camelHips,
      color: camelCoatPaint,
      name: "camelHump",
    },
  );

  // Camel Neck Sweep with fluffy underside bib
  b.sweep(neckChain, [0.13, 0.08], {
    color: camelCoatPaint,
    name: "camelNeckTube",
  });

  // Neck fleece fringe (chest mane)
  b.sweep(
    catmull([
      [0, 0.88, 0.42],
      [0, 1.05, 0.48],
      [0, 1.25, 0.54],
      [0, 1.45, 0.6],
    ]),
    [0.05, 0.025],
    {
      color: CAMEL_FLEECE,
      bone: neckTip,
      name: "neckFleeceFringe",
    },
  );

  // Tail sweep & bushy tuft
  b.sweep(tailChain, [0.032, 0.015], { color: camelCoatPaint, name: "camelTailTube" });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), CAMEL_DARK, {
    bone: tailChain.joints[1],
    at: [0, 0.46, -0.26],
    scale: [0.8, 1.6, 0.8],
    name: "camelTailTuft",
  });

  // Camel Head & Features
  // Skull wedge
  b.frustumBox([0, 0.02, -0.06], [0, -0.01, 0.16], [0.14, 0.12], [0.08, 0.06], {
    bone: headJoint,
    color: camelCoatPaint,
    name: "camelSkull",
  });

  // Muzzle tip (split nose & cheeks)
  b.part(new THREE.CylinderGeometry(0.042, 0.038, 0.08, 8), CAMEL_CREAM, {
    bone: headJoint,
    at: headJoint.local([0, -0.02, 0.18]),
    dir: [0, 0, 1],
    name: "camelMuzzleTip",
  });

  // Lower jaw
  b.frustumBox([0, -0.01, 0.0], [0, 0.0, 0.15], [0.08, 0.04], [0.05, 0.03], {
    bone: jawJoint,
    color: CAMEL_CREAM,
    name: "camelLowerJaw",
  });

  // Woolly topknot fleece on crown
  b.part(new THREE.DodecahedronGeometry(0.055), CAMEL_FLEECE, {
    bone: headJoint,
    at: headJoint.local([0, 0.07, -0.01]),
    scale: [1.1, 0.85, 1.2],
    name: "camelTopknot",
  });

  // Drooping ears
  for (const s of [1, -1]) {
    const earPath = catmull([
      headJoint.local([s * 0.06, 0.05, -0.02]),
      headJoint.local([s * 0.11, 0.04, -0.06]),
      headJoint.local([s * 0.15, -0.01, -0.08]),
    ]);
    b.sweep(earPath, [0.028, 0.008], {
      color: camelCoatPaint,
      bone: headJoint,
      name: `camelEar_${s > 0 ? "L" : "R"}`,
    });
    // Inner ear cream
    b.part(new THREE.SphereGeometry(0.016, 6, 6), CAMEL_CREAM, {
      bone: headJoint,
      at: headJoint.local([s * 0.11, 0.04, -0.05]),
      scale: [0.5, 1, 1],
      name: `camelEarInner_${s > 0 ? "L" : "R"}`,
    });

    // Big expressive anime eyes
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
      bone: headJoint,
      at: headJoint.local([s * 0.076, 0.025, 0.06]),
      dir: [s * 0.9, 0.1, 0.35],
      axis: "z",
      texture: camelEyeTex,
      name: `camelEye_${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // CAMEL REGALIA: SADDLE, BLANKETS, BAGS & HALTER
  // ---------------------------------------------------------------------------
  // Woven saddle blanket draped over the hump
  b.loft(
    [
      { at: [0, 1.02, -0.04], w: 0.38, h: 0.22 },
      { at: [0, 1.22, 0.08], w: 0.4, h: 0.32 },
      { at: [0, 1.3, 0.1], w: 0.3, h: 0.26 },
      { at: [0, 1.08, 0.24], w: 0.34, h: 0.22 },
    ],
    {
      bone: camelHips,
      color: TENT_INDIGO,
      name: "saddleBlanket",
    },
  );

  // Wooden pack saddle arches (Rahla cross-pieces)
  b.part(new THREE.TorusGeometry(0.18, 0.018, 6, 12, Math.PI), WOOD_DARK, {
    bone: camelHips,
    at: [0, 1.15, 0.22],
    rotation: [15 * DEG, 0, 0],
    name: "saddleArchFront",
  });
  b.part(new THREE.TorusGeometry(0.18, 0.018, 6, 12, Math.PI), WOOD_DARK, {
    bone: camelHips,
    at: [0, 1.12, -0.02],
    rotation: [-15 * DEG, 0, 0],
    name: "saddleArchRear",
  });

  // Brass finials on saddle horns
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), BRASS_GOLD, {
      bone: camelHips,
      at: [s * 0.18, 1.32, 0.22],
      name: `saddleFinial_${s > 0 ? "L" : "R"}`,
    });
  }

  // Dual side saddlebags with tribal pattern
  for (const s of [1, -1]) {
    const bagCenter: [number, number, number] = [s * 0.24, 0.86, 0.12];
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.28), "#ffffff", {
      bone: camelHips,
      at: bagCenter,
      texture: saddleBagTex,
      name: `saddleBag_${s > 0 ? "L" : "R"}`,
    });
    // Brass buckles and straps
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.008, 8), BRASS_GOLD, {
      bone: camelHips,
      at: [s * 0.295, 0.88, 0.12],
      dir: [s, 0, 0],
      name: `bagBuckle_${s > 0 ? "L" : "R"}`,
    });
  }

  // Rolled travel bedroll behind hump
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.34, 12), TENT_TERRACOTTA, {
    bone: camelHips,
    at: [0, 1.05, -0.08],
    rotation: [0, 0, 90 * DEG],
    name: "saddleBedroll",
  });

  // Halter harness & dangling chin bell
  b.sweep(
    catmull([
      headJoint.local([0.065, 0.0, 0.14]),
      headJoint.local([0, -0.04, 0.15]),
      headJoint.local([-0.065, 0.0, 0.14]),
      headJoint.local([0, 0.05, 0.12]),
      headJoint.local([0.065, 0.0, 0.14]),
    ]),
    0.01,
    {
      color: TENT_TERRACOTTA,
      bone: headJoint,
      name: "halterMuzzleBand",
    },
  );

  // Throat strap with brass bell
  b.part(new THREE.ConeGeometry(0.024, 0.038, 8), BRASS_GOLD, {
    bone: headJoint,
    at: headJoint.local([0, -0.1, 0.08]),
    rotation: [180 * DEG, 0, 0],
    name: "halterBell",
  });
  b.part(new THREE.SphereGeometry(0.015, 6, 6), "#1ca59a", {
    bone: headJoint,
    at: headJoint.local([0, -0.07, 0.08]),
    name: "turquoiseBead",
  });

  // ---------------------------------------------------------------------------
  // RESTING COMPANION CAMEL (Couched in the Sand)
  // ---------------------------------------------------------------------------
  const REST_POS = new THREE.Vector3(0.68, BASE_H + 0.12, -0.32);

  // Couched camel hips joint parented to dioramaRoot
  const restCamel = b.joint("restCamelHips", {
    parent: dioramaRoot,
    at: REST_POS.toArray(),
    dir: [-0.6, 0, 0.8],
  });

  // Resting body barrel
  b.part(new THREE.SphereGeometry(0.24, 12, 10), camelCoatPaint, {
    bone: restCamel,
    at: [REST_POS.x, REST_POS.y + 0.08, REST_POS.z],
    scale: [0.9, 0.85, 1.35],
    name: "restCamelBody",
  });

  // Resting hump
  b.part(new THREE.SphereGeometry(0.18, 10, 8), camelCoatPaint, {
    bone: restCamel,
    at: [REST_POS.x, REST_POS.y + 0.26, REST_POS.z - 0.04],
    scale: [0.85, 1.25, 0.95],
    name: "restCamelHump",
  });

  // Small striped blanket on resting hump
  b.part(new THREE.CylinderGeometry(0.17, 0.19, 0.14, 10, 1, true), tentStripePaint, {
    bone: restCamel,
    at: [REST_POS.x, REST_POS.y + 0.28, REST_POS.z - 0.04],
    name: "restCamelBlanket",
  });

  // Folded front legs (knees tucked forward under chest)
  for (const s of [1, -1]) {
    b.capsule(
      [REST_POS.x + s * 0.12, BASE_H + 0.04, REST_POS.z + 0.22],
      [REST_POS.x + s * 0.1, BASE_H + 0.04, REST_POS.z + 0.04],
      0.042,
      camelCoatPaint,
      { bone: restCamel, name: `restFrontLeg_${s > 0 ? "L" : "R"}` },
    );
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.03, 8), CAMEL_DARK, {
      bone: restCamel,
      at: [REST_POS.x + s * 0.12, BASE_H + 0.02, REST_POS.z + 0.24],
      name: `restFrontSole_${s > 0 ? "L" : "R"}`,
    });

    // Folded hind legs (tucked alongside flank)
    b.capsule(
      [REST_POS.x + s * 0.18, BASE_H + 0.06, REST_POS.z - 0.15],
      [REST_POS.x + s * 0.16, BASE_H + 0.04, REST_POS.z + 0.05],
      0.048,
      camelCoatPaint,
      { bone: restCamel, name: `restHindLeg_${s > 0 ? "L" : "R"}` },
    );
  }

  // Curved neck rising up
  const restNeckPath = catmull([
    [REST_POS.x, REST_POS.y + 0.14, REST_POS.z + 0.2],
    [REST_POS.x - 0.04, REST_POS.y + 0.35, REST_POS.z + 0.32],
    [REST_POS.x - 0.08, REST_POS.y + 0.54, REST_POS.z + 0.38],
  ]);
  b.sweep(restNeckPath, [0.09, 0.055], { color: camelCoatPaint, bone: restCamel, name: "restCamelNeck" });

  // Resting camel head
  const restHeadPos: [number, number, number] = [REST_POS.x - 0.1, REST_POS.y + 0.58, REST_POS.z + 0.44];
  b.frustumBox(
    restHeadPos,
    [restHeadPos[0] - 0.06, restHeadPos[1] - 0.02, restHeadPos[2] + 0.14],
    [0.1, 0.08],
    [0.06, 0.04],
    { bone: restCamel, color: camelCoatPaint, name: "restCamelHead" },
  );
  // Half-closed contented eye
  b.part(new THREE.TorusGeometry(0.018, 0.005, 4, 8, Math.PI), CAMEL_DARK, {
    bone: restCamel,
    at: [restHeadPos[0] + 0.05, restHeadPos[1] + 0.02, restHeadPos[2] + 0.05],
    rotation: [0, 90 * DEG, 0],
    name: "restCamelEyeL",
  });
  // Topknot & ears
  b.part(new THREE.DodecahedronGeometry(0.038), CAMEL_FLEECE, {
    bone: restCamel,
    at: [restHeadPos[0], restHeadPos[1] + 0.05, restHeadPos[2] - 0.01],
    name: "restCamelTopknot",
  });

  // Unloaded cargo near resting camel: clay jars and date basket
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 10), "#b35634", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.24, BASE_H + 0.09, REST_POS.z + 0.14],
    name: "waterUrn1",
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 10), "#9c482b", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.34, BASE_H + 0.07, REST_POS.z + 0.02],
    name: "waterUrn2",
  });
  // Woven palm basket with dates
  b.part(new THREE.CylinderGeometry(0.09, 0.06, 0.08, 10), "#a8834c", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.22, BASE_H + 0.04, REST_POS.z - 0.18],
    name: "dateBasket",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), DATE_ORANGE, {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.22, BASE_H + 0.07, REST_POS.z - 0.18],
    name: "datePile",
  });

  // ---------------------------------------------------------------------------
  // BEDOUIN TENT & REFRESHMENTS
  // ---------------------------------------------------------------------------
  const TENT_C = new THREE.Vector3(0.72, BASE_H, 0.12);

  // Tent wooden poles
  const P_POLE1: [number, number, number] = [TENT_C.x - 0.1, BASE_H, TENT_C.z - 0.22];
  const P_POLE2: [number, number, number] = [TENT_C.x - 0.1, BASE_H, TENT_C.z + 0.28];
  const POLE_H = 1.05;

  b.rod(P_POLE1, [P_POLE1[0], BASE_H + POLE_H, P_POLE1[1]], 0.022, WOOD_POLE, {
    bone: dioramaRoot,
    name: "tentCenterPole1",
  });
  b.rod(P_POLE2, [P_POLE2[0], BASE_H + POLE_H, P_POLE2[1]], 0.022, WOOD_POLE, {
    bone: dioramaRoot,
    name: "tentCenterPole2",
  });

  // Ridge beam connecting center poles
  b.rod([P_POLE1[0], BASE_H + POLE_H - 0.02, P_POLE1[2]], [P_POLE2[0], BASE_H + POLE_H - 0.02, P_POLE2[2]], 0.018, WOOD_POLE, {
    bone: dioramaRoot,
    name: "tentRidgeBeam",
  });

  // Corner ground pegs and stakes
  const cornerStakes = [
    [TENT_C.x + 0.44, BASE_H, TENT_C.z - 0.38],
    [TENT_C.x + 0.44, BASE_H, TENT_C.z + 0.44],
    [TENT_C.x - 0.48, BASE_H, TENT_C.z + 0.38],
    [TENT_C.x - 0.48, BASE_H, TENT_C.z - 0.32],
  ];

  for (let i = 0; i < cornerStakes.length; i++) {
    const [sx, sy, sz] = cornerStakes[i];
    b.spike([sx, sy, sz], [sx, sy + 0.08, sz], 0.08, 0.015, "#573d26", {
      bone: dioramaRoot,
      name: `tentPeg_${i}`,
    });
  }

  // Tensioned canopy roof panels
  const ridgePt1: [number, number, number] = [P_POLE1[0], BASE_H + POLE_H, P_POLE1[2]];
  const ridgePt2: [number, number, number] = [P_POLE2[0], BASE_H + POLE_H, P_POLE2[2]];

  // Back canopy panel sloping down to sand
  b.loft(
    [
      { at: ridgePt1, w: 0.06, h: 0.04 },
      { at: [(ridgePt1[0] + cornerStakes[0][0]) / 2, BASE_H + 0.52, (ridgePt1[2] + cornerStakes[0][2]) / 2], w: 0.48, h: 0.03 },
      { at: [cornerStakes[0][0], BASE_H + 0.08, cornerStakes[0][2]], w: 0.52, h: 0.02 },
    ],
    { bone: dioramaRoot, color: tentStripePaint, name: "tentRoofRearSlope" },
  );

  b.loft(
    [
      { at: ridgePt2, w: 0.06, h: 0.04 },
      { at: [(ridgePt2[0] + cornerStakes[1][0]) / 2, BASE_H + 0.52, (ridgePt2[2] + cornerStakes[1][2]) / 2], w: 0.48, h: 0.03 },
      { at: [cornerStakes[1][0], BASE_H + 0.08, cornerStakes[1][2]], w: 0.52, h: 0.02 },
    ],
    { bone: dioramaRoot, color: tentStripePaint, name: "tentRoofFrontSlope" },
  );

  // Main high canopy ceiling stretched between the two ridge poles
  b.loft(
    [
      { at: ridgePt1, w: 0.65, h: 0.04 },
      { at: [(ridgePt1[0] + ridgePt2[0]) / 2, BASE_H + POLE_H - 0.06, (ridgePt1[2] + ridgePt2[2]) / 2], w: 0.72, h: 0.03 },
      { at: ridgePt2, w: 0.65, h: 0.04 },
    ],
    { bone: dioramaRoot, color: tentStripePaint, name: "tentRoofCanopy" },
  );

  // Back side windbreak wall
  b.part(new THREE.PlaneGeometry(0.58, 0.85), TENT_INDIGO, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.32, BASE_H + 0.42, TENT_C.z + 0.02],
    dir: [-1, 0, 0],
    axis: "z",
    name: "tentRearWall",
  });

  // Hanging tent interior lantern with glow
  const lanternHook: [number, number, number] = [
    (P_POLE1[0] + P_POLE2[0]) / 2,
    BASE_H + POLE_H - 0.15,
    (P_POLE1[2] + P_POLE2[2]) / 2,
  ];
  b.rod(
    [(P_POLE1[0] + P_POLE2[0]) / 2, BASE_H + POLE_H, (P_POLE1[2] + P_POLE2[2]) / 2],
    lanternHook,
    0.005,
    CHARCOAL,
    { bone: dioramaRoot, name: "tentLanternChain" },
  );
  b.part(new THREE.CylinderGeometry(0.04, 0.03, 0.08, 6), BRASS_GOLD, {
    bone: dioramaRoot,
    at: lanternHook,
    name: "tentLanternCap",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.032, 8, 8), "#ffcc55", {
      bone: dioramaRoot,
      at: [lanternHook[0], lanternHook[1] - 0.04, lanternHook[2]],
      name: "tentLanternGlass",
    }),
    2.2,
  );

  // Tent interior: Kilim rug
  b.part(new THREE.PlaneGeometry(0.68, 0.48), "#ffffff", {
    bone: dioramaRoot,
    at: [TENT_C.x, BASE_H + 0.016, TENT_C.z + 0.04],
    dir: [0, 1, 0],
    axis: "z",
    texture: kilimRugTex,
    name: "interiorKilimRug",
  });

  // Low carved brass table
  const tablePos: [number, number, number] = [TENT_C.x - 0.06, BASE_H + 0.06, TENT_C.z + 0.04];
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 8), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [tablePos[0], tablePos[1] + 0.05, tablePos[2]],
    name: "teaTableTop",
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.07, 0.1, 8), WOOD_DARK, {
    bone: dioramaRoot,
    at: tablePos,
    name: "teaTableBase",
  });

  // Traditional Arabian coffee pot (Dallah) on table
  const dallahPos: [number, number, number] = [tablePos[0] + 0.02, tablePos[1] + 0.06, tablePos[2]];
  b.part(new THREE.CylinderGeometry(0.018, 0.03, 0.06, 8), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [dallahPos[0], dallahPos[1] + 0.03, dallahPos[2]],
    name: "dallahBody",
  });
  b.part(new THREE.ConeGeometry(0.02, 0.035, 8), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [dallahPos[0], dallahPos[1] + 0.075, dallahPos[2]],
    name: "dallahLid",
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 6), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [dallahPos[0], dallahPos[1] + 0.095, dallahPos[2]],
    name: "dallahFinial",
  });
  // Beak spout
  b.rod([dallahPos[0], dallahPos[1] + 0.03, dallahPos[2]], [dallahPos[0] - 0.028, dallahPos[1] + 0.055, dallahPos[2]], 0.005, BRASS_GOLD, {
    bone: dioramaRoot,
    name: "dallahSpout",
  });

  // Tea glasses (finjan)
  b.part(new THREE.CylinderGeometry(0.012, 0.008, 0.022, 6), "#55e0c6", {
    bone: dioramaRoot,
    at: [tablePos[0] - 0.04, tablePos[1] + 0.07, tablePos[2] - 0.03],
    name: "teaGlass1",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.008, 0.022, 6), "#55e0c6", {
    bone: dioramaRoot,
    at: [tablePos[0] - 0.04, tablePos[1] + 0.07, tablePos[2] + 0.03],
    name: "teaGlass2",
  });

  // Floor cushions (round poufs and rectangular bolsters)
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), TENT_TERRACOTTA, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.18, BASE_H + 0.04, TENT_C.z + 0.16],
    name: "pouf1",
  });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.055, 10), TENT_INDIGO, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.18, BASE_H + 0.04, TENT_C.z - 0.08],
    name: "pouf2",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.22, BASE_H + 0.05, TENT_C.z + 0.04],
    rotation: [90 * DEG, 0, 0],
    name: "bolsterPillow",
  });

  // ---------------------------------------------------------------------------
  // CRACKLING CAMPFIRE & HEARTH
  // ---------------------------------------------------------------------------
  const FIRE_C = new THREE.Vector3(0.24, BASE_H, -0.05);

  // Stone ring around fire pit
  const FIRE_STONES = 8;
  for (let i = 0; i < FIRE_STONES; i++) {
    const a = (i / FIRE_STONES) * Math.PI * 2;
    const r = 0.14;
    const fx = FIRE_C.x + Math.cos(a) * r;
    const fz = FIRE_C.z + Math.sin(a) * r;
    b.part(new THREE.DodecahedronGeometry(0.032, 0), PEBBLE_GREY, {
      bone: dioramaRoot,
      at: [fx, BASE_H + 0.024, fz],
      name: `fireStone_${i}`,
    });
  }

  // Dark ash bed
  b.part(new THREE.CylinderGeometry(0.12, 0.13, 0.015, 10), CHARCOAL, {
    bone: dioramaRoot,
    at: [FIRE_C.x, BASE_H + 0.01, FIRE_C.z],
    name: "fireAshBed",
  });

  // Glowing charcoal embers inside
  glow(
    b.part(new THREE.DodecahedronGeometry(0.055, 0), FIRE_ORANGE, {
      bone: dioramaRoot,
      at: [FIRE_C.x, BASE_H + 0.035, FIRE_C.z],
      name: "fireEmbersCore",
    }),
    2.5,
  );

  // Criss-crossing acacia firewood logs
  const logAngles = [25, 70, 120, 165];
  for (let i = 0; i < logAngles.length; i++) {
    const deg = logAngles[i];
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.22, 6), WOOD_DARK, {
      bone: dioramaRoot,
      at: [FIRE_C.x, BASE_H + 0.045 + i * 0.01, FIRE_C.z],
      rotation: [15 * DEG, deg * DEG, 10 * DEG],
      name: `firewoodLog_${i}`,
    });
  }

  // Glowing flame cones
  glow(
    b.part(new THREE.ConeGeometry(0.04, 0.11, 6), FIRE_YELLOW, {
      bone: dioramaRoot,
      at: [FIRE_C.x, BASE_H + 0.09, FIRE_C.z],
      name: "flameMain",
    }),
    2.8,
  );
  glow(
    b.part(new THREE.ConeGeometry(0.025, 0.08, 5), FIRE_ORANGE, {
      bone: dioramaRoot,
      at: [FIRE_C.x + 0.025, BASE_H + 0.075, FIRE_C.z + 0.02],
      name: "flameSide",
    }),
    2.5,
  );

  // Iron cooking tripod over campfire
  const TRIPOD_H = 0.36;
  const TRIPOD_R = 0.16;
  const TRIPOD_TOP: [number, number, number] = [FIRE_C.x, BASE_H + TRIPOD_H, FIRE_C.z];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const footPos: [number, number, number] = [FIRE_C.x + Math.cos(a) * TRIPOD_R, BASE_H, FIRE_C.z + Math.sin(a) * TRIPOD_R];
    b.rod(footPos, TRIPOD_TOP, 0.007, "#1a1816", {
      bone: dioramaRoot,
      name: `tripodLeg_${i}`,
    });
  }

  // Dangling camp kettle over coals
  b.rod(TRIPOD_TOP, [TRIPOD_TOP[0], BASE_H + 0.16, TRIPOD_TOP[2]], 0.004, "#1a1816", {
    bone: dioramaRoot,
    name: "kettleChain",
  });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#3b2b20", {
    bone: dioramaRoot,
    at: [FIRE_C.x, BASE_H + 0.14, FIRE_C.z],
    scale: [1, 0.85, 1],
    name: "campKettle",
  });

  // ---------------------------------------------------------------------------
  // OASIS DATE PALMS (3 Characterful Trees)
  // ---------------------------------------------------------------------------
  // Helper to construct a lush low-poly palm tree
  function createPalmTree(
    name: string,
    trunkCurve: THREE.Vector3[],
    frondCount: number,
    frondLength: number,
    dateClusters: number,
  ) {
    const crownPos = trunkCurve[trunkCurve.length - 1];

    // Segmented ringed trunk for low-poly stylized character
    for (let i = 0; i < trunkCurve.length - 1; i++) {
      const p0 = trunkCurve[i];
      const p1 = trunkCurve[i + 1];
      const t = i / (trunkCurve.length - 1);
      const r0 = 0.11 * (1 - t * 0.35);
      const r1 = 0.11 * (1 - (t + 0.25) * 0.35);

      b.rod(p0.toArray(), p1.toArray(), [r0, r1], palmTrunkPaint, {
        bone: dioramaRoot,
        name: `${name}_trunkSeg_${i}`,
      });

      // Tapered ring notch collar
      b.part(new THREE.TorusGeometry(r0 * 1.15, 0.015, 6, 12), PALM_BARK_DARK, {
        bone: dioramaRoot,
        at: p0.toArray(),
        name: `${name}_trunkCollar_${i}`,
      });
    }

    // Crown core hub
    b.part(new THREE.SphereGeometry(0.12, 8, 6), PALM_BARK_DARK, {
      bone: dioramaRoot,
      at: crownPos.toArray(),
      name: `${name}_crownCore`,
    });

    // Hanging clusters of golden dates
    for (let d = 0; d < dateClusters; d++) {
      const a = (d / dateClusters) * Math.PI * 2 + 0.3;
      const dx = crownPos.x + Math.cos(a) * 0.14;
      const dz = crownPos.z + Math.sin(a) * 0.14;
      b.rod(crownPos.toArray(), [dx, crownPos.y - 0.14, dz], 0.01, "#cfa038", {
        bone: dioramaRoot,
        name: `${name}_dateStalk_${d}`,
      });
      // Bunch of dates
      b.part(new THREE.SphereGeometry(0.065, 8, 6), DATE_GOLD, {
        bone: dioramaRoot,
        at: [dx, crownPos.y - 0.18, dz],
        scale: [1, 1.4, 1],
        name: `${name}_dateBunch_${d}`,
      });
    }

    // Radiating arched palm fronds
    for (let f = 0; f < frondCount; f++) {
      const a = (f / frondCount) * Math.PI * 2;
      const tilt = 0.15 + (f % 2) * 0.18; // alternating droop
      const midOut = frondLength * 0.55;
      const tipOut = frondLength;

      const pMid = new THREE.Vector3(
        crownPos.x + Math.cos(a) * midOut,
        crownPos.y + 0.22 - tilt * 0.3,
        crownPos.z + Math.sin(a) * midOut,
      );
      const pTip = new THREE.Vector3(
        crownPos.x + Math.cos(a) * tipOut,
        crownPos.y - 0.2 - tilt * 0.6,
        crownPos.z + Math.sin(a) * tipOut,
      );

      const frondSpine = bezier(crownPos.toArray(), pMid.toArray(), pTip.toArray());

      // Central frond spine
      b.sweep(frondSpine, [0.024, 0.005], {
        color: FROND_BRIGHT,
        bone: dioramaRoot,
        name: `${name}_frondSpine_${f}`,
      });

      // Serrated feather blade (loft / swept wide flat leaf)
      const leafCol = f % 2 === 0 ? FROND_GREEN : FROND_DEEP;
      b.sweep(
        frondSpine,
        (s) => [0.16 * Math.sin(s * Math.PI), 0.01],
        {
          color: leafCol,
          bone: dioramaRoot,
          section: "circle",
          name: `${name}_frondBlade_${f}`,
        },
      );
    }
  }

  // PALM 1: Grand Hero Leaning Palm arching over the pool
  const palm1Curve = [
    new THREE.Vector3(-0.68, BASE_H, -0.35),
    new THREE.Vector3(-0.62, BASE_H + 0.65, -0.28),
    new THREE.Vector3(-0.52, BASE_H + 1.35, -0.16),
    new THREE.Vector3(-0.36, BASE_H + 1.95, -0.04),
    new THREE.Vector3(-0.18, BASE_H + 2.38, 0.06),
  ];
  createPalmTree("heroPalm", palm1Curve, 10, 0.95, 3);

  // PALM 2: Medium Palm on the left bank
  const palm2Curve = [
    new THREE.Vector3(-0.85, BASE_H, 0.22),
    new THREE.Vector3(-0.95, BASE_H + 0.6, 0.26),
    new THREE.Vector3(-1.05, BASE_H + 1.25, 0.32),
    new THREE.Vector3(-1.12, BASE_H + 1.78, 0.38),
  ];
  createPalmTree("leftPalm", palm2Curve, 8, 0.78, 2);

  // PALM 3: Slender Palm framing the right rear behind the tent
  const palm3Curve = [
    new THREE.Vector3(0.98, BASE_H, -0.62),
    new THREE.Vector3(1.06, BASE_H + 0.55, -0.7),
    new THREE.Vector3(1.14, BASE_H + 1.15, -0.78),
    new THREE.Vector3(1.18, BASE_H + 1.68, -0.84),
  ];
  createPalmTree("rearPalm", palm3Curve, 7, 0.7, 2);

  return b.root;
}
