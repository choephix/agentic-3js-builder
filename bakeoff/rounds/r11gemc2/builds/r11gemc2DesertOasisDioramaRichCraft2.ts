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
    "A whimsical low-poly desert oasis diorama featuring a grand dromedary camel, a resting companion, an authentic Bedouin striped tent, arched date palms, an azure pool, and a crackling campfire.",
};

export default function build() {
  const b = createBuilder({ name: "desert_oasis_diorama", detail: 1.1 });
  const random = rng(42);

  // ---------------------------------------------------------------------------
  // PALETTE & PROCEDURAL PAINTS
  // ---------------------------------------------------------------------------
  const SAND_GOLD = "#e8bd78";
  const SAND_WARM = "#d69e54";
  const SAND_LIGHT = "#f5d799";
  const CLIFF_DARK = "#724c2c";
  const CLIFF_MID = "#996b42";

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
  const FIRE_ORANGE = "#ff5500";
  const FIRE_YELLOW = "#ffcc00";
  const CHARCOAL = "#211e1c";
  const PEBBLE_GREY = "#9e8e7a";
  const PEBBLE_LIGHT = "#c4b59f";

  // Procedural stylized paints
  const sandPaint = mottle(SAND_GOLD, SAND_LIGHT, { size: 0.18, contrast: 1.2, seed: 11 });
  const cliffPaint = grain(CLIFF_MID, CLIFF_DARK, { size: 0.08, axis: "y", seed: 7 });
  const camelCoatPaint = mottle(CAMEL_COAT, CAMEL_SHADE, { size: 0.12, contrast: 0.8, seed: 3 });
  const palmTrunkPaint = grain(PALM_BARK_LIGHT, PALM_BARK_DARK, { size: 0.04, axis: "y", seed: 9 });

  const tentStripePaint = stripes(TENT_TERRACOTTA, TENT_IVORY, {
    size: 0.11,
    axis: "x",
    width: 0.48,
    wobble: 0.04,
    seed: 5,
  });

  const waterPaint = paint((p) => {
    const dist = Math.hypot(p.x - -0.38, p.z - 0.38);
    const wave = noise(p, 0.12, 14);
    const deepT = smoothstep(0.08, 0.45, dist);
    const c = mix(POOL_DEEP, POOL_TEAL, 1 - deepT);
    return mix(c, POOL_SHALLOW, wave * 0.35);
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
      <ellipse cx="32" cy="32" rx="28" ry="20" fill="#fdf7ec"/>
      <ellipse cx="34" cy="32" rx="16" ry="16" fill="url(#iris)"/>
      <ellipse cx="34" cy="32" rx="8" ry="10" fill="#150a04"/>
      <circle cx="28" cy="27" r="4.5" fill="#ffffff"/>
      <circle cx="39" cy="36" r="2.2" fill="#ffffff"/>
      <path d="M6 22 Q32 8 58 22" stroke="#4a2c16" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M14 19 Q10 11 4 9" stroke="#2c170b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M26 14 Q24 5 19 2" stroke="#2c170b" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M40 15 Q42 6 47 3" stroke="#2c170b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M52 21 Q58 15 62 12" stroke="#2c170b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const kilimRugTex = svg(
    `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="160" fill="#8f2415"/>
      <rect x="8" y="8" width="224" height="144" fill="none" stroke="#e8c878" stroke-width="5"/>
      <rect x="18" y="18" width="204" height="124" fill="#1b2a47"/>
      <path d="M22 22 L28 28 L34 22 L40 28 L46 22 L52 28 L58 22 L64 28 L70 22 L76 28 L82 22 L88 28 L94 22 L100 28 L106 22 L112 28 L118 22 L124 28 L130 22 L136 28 L142 22 L148 28 L154 22 L160 28 L166 22 L172 28 L178 22 L184 28 L190 22 L196 28 L202 22 L208 28 L214 22" stroke="#d68b36" stroke-width="2" fill="none"/>
      <rect x="28" y="28" width="184" height="104" fill="#a83120"/>
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
      <path d="M10 20 L24 38 L38 20 L52 38 L66 20 L80 38 L94 20 L108 38 L118 25" stroke="#f0c24f" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
      <path d="M10 76 L24 58 L38 76 L52 58 L66 76 L80 58 L94 76 L108 58 L118 71" stroke="#f0c24f" stroke-width="4.5" fill="none" stroke-linejoin="round"/>
      <rect x="22" y="42" width="84" height="12" fill="#d97528"/>
      <circle cx="64" cy="48" r="4.5" fill="#fdf8e8"/>
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
  // DIORAMA PLINTH & GROUND
  // ---------------------------------------------------------------------------
  const dioramaRoot = b.joint("dioramaRoot", { at: [0, 0, 0] });

  const BASE_R = 1.35;
  const BASE_H = 0.2;
  const plinthOutline: [number, number, "sharp"][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    plinthOutline.push([Math.cos(a) * BASE_R, Math.sin(a) * BASE_R, "sharp"]);
  }

  // Base cliff sides
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
  b.part(new THREE.CylinderGeometry(BASE_R * 0.98, BASE_R * 0.99, 0.02, 32), sandPaint, {
    bone: dioramaRoot,
    at: [0, BASE_H + 0.01, 0],
    name: "sandFloor",
  });

  // Sculpted barchan sand dunes sweeping around rear
  const duneCrestPath = catmull([
    [-1.25, BASE_H, -0.35],
    [-0.85, BASE_H + 0.3, -0.82],
    [-0.22, BASE_H + 0.36, -1.02],
    [0.55, BASE_H + 0.28, -0.96],
    [1.18, BASE_H, -0.42],
  ]);
  b.sweep(duneCrestPath, (t) => [0.26 * Math.sin(t * Math.PI) + 0.08, 0.18 * Math.sin(t * Math.PI) + 0.05], {
    color: sandPaint,
    bone: dioramaRoot,
    name: "duneRidgeRear",
  });

  // ---------------------------------------------------------------------------
  // OASIS WATER LAGOON & REEDS
  // ---------------------------------------------------------------------------
  const POOL_C = new THREE.Vector3(-0.4, BASE_H + 0.015, 0.38);

  // Inset turquoise water surface
  b.part(new THREE.CylinderGeometry(0.48, 0.44, 0.02, 28), waterPaint, {
    bone: dioramaRoot,
    at: POOL_C.toArray(),
    scale: [1.1, 1, 0.88],
    name: "oasisPoolWater",
  });

  // Concentric water ripple decal
  b.part(new THREE.PlaneGeometry(0.76, 0.76), "#ffffff", {
    bone: dioramaRoot,
    at: [POOL_C.x, POOL_C.y + 0.012, POOL_C.z],
    dir: [0, 1, 0],
    axis: "z",
    texture: waterRippleTex,
    name: "waterRipple",
  });

  // Perimeter sandstone boulders
  const STONE_COUNT = 24;
  for (let i = 0; i < STONE_COUNT; i++) {
    const a = (i / STONE_COUNT) * Math.PI * 2;
    const rVar = 0.48 + (i % 3) * 0.035;
    const sx = Math.cos(a) * rVar * 1.1;
    const sz = Math.sin(a) * rVar * 0.88;
    const sR = 0.035 + (i % 4) * 0.014;
    b.part(new THREE.DodecahedronGeometry(sR, 0), i % 2 === 0 ? PEBBLE_GREY : PEBBLE_LIGHT, {
      bone: dioramaRoot,
      at: [POOL_C.x + sx, BASE_H + sR * 0.6, POOL_C.z + sz],
      rotation: [15 * DEG, (i * 45) * DEG, 10 * DEG],
      name: `poolStone_${i}`,
    });
  }

  // Floating water lilies
  const padAngles = [0.4, 1.9, 3.4, 4.8];
  for (let i = 0; i < padAngles.length; i++) {
    const a = padAngles[i];
    const px = POOL_C.x + Math.cos(a) * 0.28;
    const pz = POOL_C.z + Math.sin(a) * 0.22;
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.005, 10), "#2b8c4c", {
      bone: dioramaRoot,
      at: [px, POOL_C.y + 0.014, pz],
      name: `lilyPad_${i}`,
    });
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

  // Clumped papyrus reeds
  const reedClusters = [
    [-0.66, BASE_H, 0.32],
    [-0.56, BASE_H, 0.72],
    [-0.24, BASE_H, 0.78],
  ];
  for (let c = 0; c < reedClusters.length; c++) {
    const [cx, cy, cz] = reedClusters[c];
    for (let r = 0; r < 5; r++) {
      const rx = cx + (r - 2) * 0.028;
      const rz = cz + (r % 2) * 0.03;
      const rH = 0.28 + (r % 3) * 0.08;
      b.rod([rx, cy, rz], [rx, cy + rH, rz], 0.006, "#3c7a36", {
        bone: dioramaRoot,
        name: `reedStem_${c}_${r}`,
      });
      b.capsule([rx, cy + rH - 0.05, rz], [rx, cy + rH, rz], 0.012, "#4a3016", {
        bone: dioramaRoot,
        name: `reedHead_${c}_${r}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // HERO DROMEDARY CAMEL (Posed naturally, anatomically correct head & legs)
  // ---------------------------------------------------------------------------
  // Angled pose: hips slightly back-left, chest forward-right (~20° angle)
  const camelHips = b.joint("hips", {
    parent: dioramaRoot,
    at: [-0.15, 0.84, -0.05],
    dir: [0.35, 0.04, 0.94],
    role: "spine",
  });

  const spineChain = b.chain(
    "spine",
    catmull([
      [-0.15, 0.84, -0.05],
      [-0.09, 0.86, 0.1],
      [-0.03, 0.88, 0.26],
    ]),
    {
      parent: camelHips,
      count: 2,
      names: ["spine1", "chest"],
      role: "spine",
    },
  );
  const chestJoint = spineChain.joints[1];

  // Gracefully arching S-curve neck
  const neckChain = b.chain(
    "neck",
    catmull([
      [-0.03, 0.88, 0.26],
      [-0.01, 1.02, 0.38],
      [0.02, 1.25, 0.48],
      [0.05, 1.48, 0.56],
    ]),
    {
      parent: chestJoint,
      count: 3,
      names: ["neck1", "neck2", "neck3"],
      role: "neck",
    },
  );
  const neckTip = neckChain.joints[neckChain.joints.length - 1];

  // Head and jaw joints: Head bone +Y points FORWARD (+Z), slightly tilted
  const headJoint = b.joint("head", {
    parent: neckTip,
    at: [0.06, 1.52, 0.62],
    dir: [0.22, -0.08, 0.97],
    role: "head",
  });

  const jawJoint = b.joint("jaw", {
    parent: headJoint,
    at: headJoint.local([0, 0.02, -0.05]),
    dir: headJoint.dir([0, 0.99, -0.12]),
    role: "jaw",
  });

  // Tail chain
  const tailChain = b.chain(
    "tail",
    catmull([
      [-0.18, 0.82, -0.15],
      [-0.2, 0.66, -0.22],
      [-0.2, 0.5, -0.25],
    ]),
    {
      parent: camelHips,
      count: 2,
      names: ["tail1", "tail2"],
      role: "tail",
    },
  );

  // IK Legs planted firmly on the sand floor (y = 0.22)
  const FOOT_Y = 0.22;
  const LEG_LENS = [0.35, 0.33];

  // Front Left Leg (+X)
  const ptsFL = limb([0.08, 0.86, 0.28], [0.1, FOOT_Y, 0.36], LEG_LENS, [[0.15, 0, 1]]);
  const legFL = b.chain("legFL", ptsFL, {
    parent: chestJoint,
    names: ["shoulderL", "kneeL", "footL"],
    role: "leg",
    contact: [0.1, BASE_H, 0.36],
  });

  // Front Right Leg (-X)
  const ptsFR = limb([-0.14, 0.86, 0.24], [-0.15, FOOT_Y, 0.2], LEG_LENS, [[0.15, 0, 1]]);
  const legFR = b.chain("legFR", ptsFR, {
    parent: chestJoint,
    names: ["shoulderR", "kneeR", "footR"],
    role: "leg",
    contact: [-0.15, BASE_H, 0.2],
  });

  // Hind Left Leg (+X)
  const ptsHL = limb([-0.04, 0.82, -0.04], [-0.03, FOOT_Y, -0.14], LEG_LENS, [[-0.15, 0, -1]]);
  const legHL = b.chain("legHL", ptsHL, {
    parent: camelHips,
    names: ["hipHL", "hockHL", "footHL"],
    role: "leg",
    contact: [-0.03, BASE_H, -0.14],
  });

  // Hind Right Leg (-X)
  const ptsHR = limb([-0.26, 0.82, -0.08], [-0.26, FOOT_Y, 0.02], LEG_LENS, [[-0.15, 0, -1]]);
  const legHR = b.chain("legHR", ptsHR, {
    parent: camelHips,
    names: ["hipHR", "hockHR", "footHR"],
    role: "leg",
    contact: [-0.26, BASE_H, 0.02],
  });

  // Leg sweeps with knobby joints and padded two-toed feet
  const legChains = [
    { chain: legFL, knee: "kneeL", foot: "footL" },
    { chain: legFR, knee: "kneeR", foot: "footR" },
    { chain: legHL, knee: "hockHL", foot: "footHL" },
    { chain: legHR, knee: "hockHR", foot: "footHR" },
  ];

  for (const { chain, knee, foot } of legChains) {
    b.sweep(chain, [0.058, 0.038], { color: camelCoatPaint });
    const kneeJoint = chain.joints.find((j) => j.name === knee);
    if (kneeJoint) {
      b.part(new THREE.SphereGeometry(0.048, 8, 6), CAMEL_DARK, {
        bone: kneeJoint,
        at: kneeJoint.at,
        scale: [0.9, 1.1, 0.85],
        name: `${knee}_pad`,
      });
    }
    const footJoint = chain.joints.find((j) => j.name === foot);
    if (footJoint) {
      b.part(new THREE.CylinderGeometry(0.065, 0.075, 0.04, 8), CAMEL_DARK, {
        bone: footJoint,
        at: [footJoint.at.x, BASE_H + 0.02, footJoint.at.z],
        name: `${foot}_sole`,
      });
      b.part(new THREE.BoxGeometry(0.028, 0.03, 0.05), CAMEL_CREAM, {
        bone: footJoint,
        at: [footJoint.at.x, BASE_H + 0.02, footJoint.at.z + 0.02],
        name: `${foot}_toes`,
      });
    }
  }

  // Camel Torso & Sternal Callus
  b.sweep(
    catmull([
      [-0.18, 0.82, -0.14],
      [-0.11, 0.84, 0.04],
      [-0.05, 0.86, 0.2],
      [-0.01, 0.86, 0.3],
    ]),
    (t) => [0.18 + 0.06 * Math.sin(t * Math.PI), 0.2 + 0.06 * Math.sin(t * Math.PI)],
    {
      color: camelCoatPaint,
      bone: [camelHips, chestJoint],
      name: "camelTorso",
    },
  );

  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.16), CAMEL_DARK, {
    bone: chestJoint,
    at: [-0.03, 0.7, 0.22],
    name: "sternalCallus",
  });

  // Majestic Dromedary Hump
  b.loft(
    [
      { at: [-0.15, 0.96, -0.06], w: 0.32, h: 0.18 },
      { at: [-0.1, 1.18, 0.05], w: 0.36, h: 0.3 },
      { at: [-0.07, 1.28, 0.09], w: 0.26, h: 0.24 },
      { at: [-0.03, 1.05, 0.2], w: 0.3, h: 0.2 },
    ],
    {
      bone: camelHips,
      color: camelCoatPaint,
      name: "camelHump",
    },
  );

  // Camel Neck & Woolly Mane Fringe
  b.sweep(neckChain, [0.12, 0.075], {
    color: camelCoatPaint,
    name: "camelNeckTube",
  });

  b.sweep(
    catmull([
      [-0.03, 0.88, 0.28],
      [-0.01, 1.05, 0.39],
      [0.02, 1.28, 0.49],
      [0.05, 1.48, 0.57],
    ]),
    [0.045, 0.022],
    {
      color: CAMEL_FLEECE,
      bone: neckTip,
      name: "neckFleeceFringe",
    },
  );

  // Tail and tuft
  b.sweep(tailChain, [0.03, 0.014], { color: camelCoatPaint, name: "camelTailTube" });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), CAMEL_DARK, {
    bone: tailChain.joints[1],
    at: [-0.2, 0.46, -0.25],
    scale: [0.8, 1.6, 0.8],
    name: "camelTailTuft",
  });

  // ---------------------------------------------------------------------------
  // CAMEL HEAD & EXPRESSION (Rigid on headJoint, aimed forward)
  // ---------------------------------------------------------------------------
  // Frame convention with headJoint dir = [0.22, -0.08, 0.97] (forward):
  // +Y is along the bone (forward toward muzzle)
  // +Z is local up (crown, ears, topknot)
  // +X is local right (-X world)

  // Skull wedge: from back of head (y = -0.06) to forehead/snout bridge (y = +0.12)
  b.frustumBox(
    headJoint.local([0, -0.06, 0.02]),
    headJoint.local([0, 0.12, 0.0]),
    [0.14, 0.12],
    [0.08, 0.07],
    { bone: headJoint, color: camelCoatPaint, name: "camelSkull" },
  );

  // Tapered snout bridge: from forehead (y = +0.11) to nostrils (y = +0.20)
  b.frustumBox(
    headJoint.local([0, 0.11, 0.0]),
    headJoint.local([0, 0.2, -0.02]),
    [0.08, 0.07],
    [0.06, 0.045],
    { bone: headJoint, color: CAMEL_CREAM, name: "camelSnout" },
  );

  // Split prehensile upper lips
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), CAMEL_CREAM, {
      bone: headJoint,
      at: headJoint.local([s * 0.02, 0.2, -0.015]),
      scale: [1, 1.2, 0.9],
      name: `camelUpperLip_${s > 0 ? "L" : "R"}`,
    });
  }

  // Lower jaw: hinged slightly below, extending along +Y
  b.frustumBox(
    jawJoint.local([0, 0.01, -0.01]),
    jawJoint.local([0, 0.18, -0.02]),
    [0.07, 0.035],
    [0.045, 0.025],
    { bone: jawJoint, color: CAMEL_CREAM, name: "camelLowerJaw" },
  );

  // Woolly topknot fleece on crown (+Z)
  b.part(new THREE.DodecahedronGeometry(0.06), CAMEL_FLEECE, {
    bone: headJoint,
    at: headJoint.local([0, -0.01, 0.075]),
    scale: [1.1, 1.2, 0.9],
    name: "camelTopknot",
  });

  // Ears & big expressive desert eyes
  for (const s of [1, -1]) {
    // Drooping furry ear pointing back and outward
    const earPath = catmull([
      headJoint.local([s * 0.06, -0.03, 0.055]),
      headJoint.local([s * 0.11, -0.07, 0.035]),
      headJoint.local([s * 0.15, -0.11, 0.01]),
    ]);
    b.sweep(earPath, [0.026, 0.007], {
      color: camelCoatPaint,
      bone: headJoint,
      name: `camelEar_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.015, 6, 6), CAMEL_CREAM, {
      bone: headJoint,
      at: headJoint.local([s * 0.11, -0.07, 0.04]),
      scale: [0.5, 1, 1],
      name: `camelEarInner_${s > 0 ? "L" : "R"}`,
    });

    // Eyes: placed on side of head, looking outward
    b.part(new THREE.PlaneGeometry(0.065, 0.065), "#ffffff", {
      bone: headJoint,
      at: headJoint.local([s * 0.068, 0.04, 0.03]),
      dir: headJoint.dir([s * 0.92, 0.15, 0.35]),
      axis: "z",
      texture: camelEyeTex,
      name: `camelEye_${s > 0 ? "L" : "R"}`,
    });
  }

  // Woven saddle blanket draped over the hump
  b.loft(
    [
      { at: [-0.14, 0.98, -0.04], w: 0.38, h: 0.22 },
      { at: [-0.09, 1.2, 0.06], w: 0.4, h: 0.32 },
      { at: [-0.06, 1.28, 0.1], w: 0.3, h: 0.26 },
      { at: [-0.03, 1.08, 0.2], w: 0.34, h: 0.22 },
    ],
    {
      bone: camelHips,
      color: TENT_INDIGO,
      name: "saddleBlanket",
    },
  );

  // Pack saddle arches (Rahla) & attached brass finials
  b.part(new THREE.TorusGeometry(0.18, 0.018, 6, 12, Math.PI), WOOD_DARK, {
    bone: camelHips,
    at: [-0.05, 1.15, 0.18],
    rotation: [15 * DEG, 20 * DEG, 0],
    name: "saddleArchFront",
  });
  b.part(new THREE.TorusGeometry(0.18, 0.018, 6, 12, Math.PI), WOOD_DARK, {
    bone: camelHips,
    at: [-0.13, 1.12, -0.02],
    rotation: [-15 * DEG, 20 * DEG, 0],
    name: "saddleArchRear",
  });

  // Turned brass finials
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), BRASS_GOLD, {
      bone: camelHips,
      at: [-0.05 + s * 0.16, 1.28, 0.18],
      name: `saddleFinial_${s > 0 ? "L" : "R"}`,
    });
  }

  // Dual side saddlebags with tribal weave
  for (const s of [1, -1]) {
    const bagPos: [number, number, number] = [-0.09 + s * 0.22, 0.86, 0.1];
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.26), "#ffffff", {
      bone: camelHips,
      at: bagPos,
      rotation: [0, 20 * DEG, 0],
      texture: saddleBagTex,
      name: `saddleBag_${s > 0 ? "L" : "R"}`,
    });
  }

  // Rolled tent carpet bedroll
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.34, 12), TENT_TERRACOTTA, {
    bone: camelHips,
    at: [-0.13, 1.05, -0.06],
    rotation: [0, 20 * DEG, 90 * DEG],
    name: "saddleBedroll",
  });

  // Halter harness & brass bell
  b.part(new THREE.ConeGeometry(0.024, 0.038, 8), BRASS_GOLD, {
    bone: headJoint,
    at: headJoint.local([0, 0.08, -0.08]),
    rotation: [180 * DEG, 0, 0],
    name: "halterBell",
  });
  b.part(new THREE.SphereGeometry(0.015, 6, 6), "#1ca59a", {
    bone: headJoint,
    at: headJoint.local([0, 0.08, -0.055]),
    name: "turquoiseBead",
  });

  // ---------------------------------------------------------------------------
  // RESTING COMPANION CAMEL (Barracking recumbently beside the camp)
  // ---------------------------------------------------------------------------
  const REST_POS = new THREE.Vector3(0.55, BASE_H + 0.1, 0.38);

  const restCamel = b.joint("restCamelHips", {
    parent: dioramaRoot,
    at: REST_POS.toArray(),
    dir: [-0.75, 0, -0.66],
  });

  // Resting barrel chest and belly touching the sand
  b.part(new THREE.SphereGeometry(0.24, 12, 10), camelCoatPaint, {
    bone: restCamel,
    at: [REST_POS.x, BASE_H + 0.14, REST_POS.z],
    scale: [0.95, 0.72, 1.35],
    name: "restCamelBody",
  });

  // Proud resting hump
  b.part(new THREE.SphereGeometry(0.17, 10, 8), camelCoatPaint, {
    bone: restCamel,
    at: [REST_POS.x + 0.02, BASE_H + 0.34, REST_POS.z + 0.04],
    scale: [0.85, 1.2, 0.95],
    name: "restCamelHump",
  });

  // Draped saddle blanket over resting hump
  b.part(new THREE.CylinderGeometry(0.16, 0.18, 0.14, 12, 1, false, -Math.PI / 2, Math.PI), tentStripePaint, {
    bone: restCamel,
    at: [REST_POS.x + 0.02, BASE_H + 0.35, REST_POS.z + 0.04],
    rotation: [0, 45 * DEG, 0],
    name: "restCamelBlanket",
  });

  // Neatly folded recumbent legs tucked alongside the body
  for (const s of [1, -1]) {
    // Front folded knee
    b.capsule(
      [REST_POS.x + s * 0.13, BASE_H + 0.05, REST_POS.z - 0.18],
      [REST_POS.x + s * 0.11, BASE_H + 0.05, REST_POS.z],
      0.044,
      camelCoatPaint,
      { bone: restCamel, name: `restFrontLeg_${s > 0 ? "L" : "R"}` },
    );
    // Hind folded hock
    b.capsule(
      [REST_POS.x + s * 0.18, BASE_H + 0.06, REST_POS.z + 0.16],
      [REST_POS.x + s * 0.15, BASE_H + 0.05, REST_POS.z - 0.02],
      0.05,
      camelCoatPaint,
      { bone: restCamel, name: `restHindLeg_${s > 0 ? "L" : "R"}` },
    );
  }

  // Gracefully arched resting neck
  const restNeckPath = catmull([
    [REST_POS.x, BASE_H + 0.18, REST_POS.z - 0.14],
    [REST_POS.x - 0.06, BASE_H + 0.36, REST_POS.z - 0.26],
    [REST_POS.x - 0.14, BASE_H + 0.52, REST_POS.z - 0.36],
  ]);
  b.sweep(restNeckPath, [0.08, 0.052], { color: camelCoatPaint, bone: restCamel, name: "restCamelNeck" });

  // Resting head: sleepy, contented, looking slightly toward water
  const restHeadPos: [number, number, number] = [REST_POS.x - 0.16, BASE_H + 0.54, REST_POS.z - 0.42];
  b.frustumBox(
    restHeadPos,
    [restHeadPos[0] - 0.08, restHeadPos[1] - 0.03, restHeadPos[2] - 0.12],
    [0.1, 0.08],
    [0.06, 0.045],
    { bone: restCamel, color: camelCoatPaint, name: "restCamelHead" },
  );

  // Half-closed contented eyes
  b.part(new THREE.TorusGeometry(0.016, 0.005, 4, 8, Math.PI), CAMEL_DARK, {
    bone: restCamel,
    at: [restHeadPos[0] + 0.04, restHeadPos[1] + 0.02, restHeadPos[2] - 0.05],
    rotation: [0, 45 * DEG, 0],
    name: "restCamelEyeL",
  });
  b.part(new THREE.DodecahedronGeometry(0.038), CAMEL_FLEECE, {
    bone: restCamel,
    at: [restHeadPos[0], restHeadPos[1] + 0.05, restHeadPos[2] + 0.02],
    name: "restCamelTopknot",
  });

  // Hitching peg and tether rope
  b.part(new THREE.CylinderGeometry(0.015, 0.012, 0.12, 6), WOOD_POLE, {
    bone: dioramaRoot,
    at: [REST_POS.x - 0.28, BASE_H + 0.05, REST_POS.z - 0.52],
    rotation: [10 * DEG, 0, 15 * DEG],
    name: "hitchingPeg",
  });
  b.rod(
    [restHeadPos[0] - 0.06, restHeadPos[1] - 0.02, restHeadPos[2] - 0.1],
    [REST_POS.x - 0.28, BASE_H + 0.08, REST_POS.z - 0.52],
    0.005,
    "#8a6238",
    { bone: dioramaRoot, name: "tetherRope" },
  );

  // Clay water urns and date basket near resting camel
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 10), "#b35634", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.26, BASE_H + 0.09, REST_POS.z + 0.12],
    name: "waterUrn1",
  });
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 10), "#9c482b", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.34, BASE_H + 0.07, REST_POS.z + 0.0],
    name: "waterUrn2",
  });
  b.part(new THREE.CylinderGeometry(0.09, 0.06, 0.08, 10), "#a8834c", {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.22, BASE_H + 0.04, REST_POS.z - 0.16],
    name: "dateBasket",
  });
  b.part(new THREE.SphereGeometry(0.075, 8, 6), DATE_ORANGE, {
    bone: dioramaRoot,
    at: [REST_POS.x + 0.22, BASE_H + 0.07, REST_POS.z - 0.16],
    name: "datePile",
  });

  // ---------------------------------------------------------------------------
  // AUTHENTIC BEDOUIN NOMADIC TENT ("Bayt al-Sha'ar")
  // ---------------------------------------------------------------------------
  const TENT_C = new THREE.Vector3(0.65, BASE_H, -0.15);

  // Main wooden ridge poles
  const P_REAR: [number, number, number] = [TENT_C.x + 0.08, BASE_H, TENT_C.z - 0.34];
  const P_FRONT: [number, number, number] = [TENT_C.x - 0.04, BASE_H, TENT_C.z + 0.22];
  const RIDGE_H = 1.02;

  b.rod(P_REAR, [P_REAR[0], BASE_H + RIDGE_H, P_REAR[2]], 0.022, WOOD_POLE, {
    bone: dioramaRoot,
    name: "tentRidgePoleRear",
  });
  b.rod(P_FRONT, [P_FRONT[0], BASE_H + RIDGE_H, P_FRONT[2]], 0.022, WOOD_POLE, {
    bone: dioramaRoot,
    name: "tentRidgePoleFront",
  });

  // Carved wooden ridge finials
  b.part(new THREE.ConeGeometry(0.035, 0.08, 6), WOOD_DARK, {
    bone: dioramaRoot,
    at: [P_REAR[0], BASE_H + RIDGE_H + 0.04, P_REAR[2]],
    name: "finialRear",
  });
  b.part(new THREE.ConeGeometry(0.035, 0.08, 6), WOOD_DARK, {
    bone: dioramaRoot,
    at: [P_FRONT[0], BASE_H + RIDGE_H + 0.04, P_FRONT[2]],
    name: "finialFront",
  });

  // Ridge beam connecting the two center poles
  b.rod(
    [P_REAR[0], BASE_H + RIDGE_H - 0.02, P_REAR[2]],
    [P_FRONT[0], BASE_H + RIDGE_H - 0.02, P_FRONT[2]],
    0.018,
    WOOD_POLE,
    { bone: dioramaRoot, name: "tentRidgeBeam" },
  );

  // Awning eaves poles (holding the breezy front open)
  const AWNING_L1: [number, number, number] = [TENT_C.x - 0.44, BASE_H, TENT_C.z - 0.32];
  const AWNING_L2: [number, number, number] = [TENT_C.x - 0.52, BASE_H, TENT_C.z + 0.2];
  const AWNING_H = 0.74;

  b.rod(AWNING_L1, [AWNING_L1[0], BASE_H + AWNING_H, AWNING_L1[2]], 0.016, WOOD_POLE, {
    bone: dioramaRoot,
    name: "awningPole1",
  });
  b.rod(AWNING_L2, [AWNING_L2[0], BASE_H + AWNING_H, AWNING_L2[2]], 0.016, WOOD_POLE, {
    bone: dioramaRoot,
    name: "awningPole2",
  });

  // Windward eaves poles (lower sloping side toward wind)
  const EAVES_R1: [number, number, number] = [TENT_C.x + 0.44, BASE_H, TENT_C.z - 0.36];
  const EAVES_R2: [number, number, number] = [TENT_C.x + 0.38, BASE_H, TENT_C.z + 0.22];
  const EAVES_H = 0.48;

  b.rod(EAVES_R1, [EAVES_R1[0], BASE_H + EAVES_H, EAVES_R1[2]], 0.016, WOOD_POLE, {
    bone: dioramaRoot,
    name: "eavesPole1",
  });
  b.rod(EAVES_R2, [EAVES_R2[0], BASE_H + EAVES_H, EAVES_R2[2]], 0.016, WOOD_POLE, {
    bone: dioramaRoot,
    name: "eavesPole2",
  });

  // Continuous, sculpted Bedouin tent canopy:
  // Station 0: Front awning edge (open porch overhang)
  // Station 1: Center ridge line
  // Station 2: Rear windward slope
  // Station 3: Rear ground peg line
  const tentStations = [
    { at: [TENT_C.x - 0.48, BASE_H + AWNING_H, TENT_C.z - 0.06], w: 0.04, h: 0.64 },
    { at: [TENT_C.x + 0.02, BASE_H + RIDGE_H, TENT_C.z - 0.06], w: 0.04, h: 0.66 },
    { at: [TENT_C.x + 0.42, BASE_H + EAVES_H, TENT_C.z - 0.06], w: 0.04, h: 0.68 },
    { at: [TENT_C.x + 0.62, BASE_H + 0.05, TENT_C.z - 0.06], w: 0.04, h: 0.72 },
  ];

  b.loft(tentStations, {
    bone: dioramaRoot,
    color: tentStripePaint,
    name: "tentCanopyLoft",
  });

  // Rear protective fabric windbreak wall
  b.part(new THREE.PlaneGeometry(0.68, 0.52), TENT_INDIGO, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.4, BASE_H + 0.26, TENT_C.z - 0.06],
    dir: [-1, 0, 0],
    axis: "z",
    name: "tentRearWindbreak",
  });

  // Decorative scalloped valance & hanging wool tassels along the front porch
  const TASSEL_COUNT = 7;
  for (let i = 0; i < TASSEL_COUNT; i++) {
    const t = i / (TASSEL_COUNT - 1);
    const tz = (TENT_C.z - 0.34) * (1 - t) + (TENT_C.z + 0.22) * t;
    const tx = (AWNING_L1[0]) * (1 - t) + (AWNING_L2[0]) * t;
    b.part(new THREE.SphereGeometry(0.018, 6, 6), i % 2 === 0 ? BRASS_GOLD : TENT_TERRACOTTA, {
      bone: dioramaRoot,
      at: [tx, BASE_H + AWNING_H - 0.03, tz],
      name: `valanceTassel_${i}`,
    });
    b.rod([tx, BASE_H + AWNING_H - 0.03, tz], [tx, BASE_H + AWNING_H - 0.08, tz], 0.004, i % 2 === 0 ? BRASS_GOLD : TENT_TERRACOTTA, {
      bone: dioramaRoot,
      name: `tasselFringe_${i}`,
    });
  }

  // Guy ropes anchoring the tent to wooden sand pegs
  const guyRopes = [
    { from: [AWNING_L1[0], BASE_H + AWNING_H, AWNING_L1[2]], to: [AWNING_L1[0] - 0.22, BASE_H, AWNING_L1[2] - 0.16] },
    { from: [AWNING_L2[0], BASE_H + AWNING_H, AWNING_L2[2]], to: [AWNING_L2[0] - 0.24, BASE_H, AWNING_L2[2] + 0.18] },
    { from: [EAVES_R1[0], BASE_H + EAVES_H, EAVES_R1[2]], to: [EAVES_R1[0] + 0.25, BASE_H, EAVES_R1[2] - 0.14] },
    { from: [EAVES_R2[0], BASE_H + EAVES_H, EAVES_R2[2]], to: [EAVES_R2[0] + 0.25, BASE_H, EAVES_R2[2] + 0.16] },
  ];
  for (let i = 0; i < guyRopes.length; i++) {
    const { from, to } = guyRopes[i];
    b.rod(from as [number, number, number], to as [number, number, number], 0.004, "#a8855a", {
      bone: dioramaRoot,
      name: `tentGuyRope_${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.014, 0.01, 0.1, 6), WOOD_DARK, {
      bone: dioramaRoot,
      at: [to[0], BASE_H + 0.04, to[2]],
      rotation: [15 * DEG, 0, 15 * DEG],
      name: `tentGuyPeg_${i}`,
    });
  }

  // Hanging pierced brass tent lantern with warm glow
  const lanternHook: [number, number, number] = [
    (P_REAR[0] + P_FRONT[0]) / 2,
    BASE_H + RIDGE_H - 0.12,
    (P_REAR[2] + P_FRONT[2]) / 2,
  ];
  b.rod([(P_REAR[0] + P_FRONT[0]) / 2, BASE_H + RIDGE_H, (P_REAR[2] + P_FRONT[2]) / 2], lanternHook, 0.005, CHARCOAL, {
    bone: dioramaRoot,
    name: "tentLanternChain",
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.032, 0.08, 6), BRASS_GOLD, {
    bone: dioramaRoot,
    at: lanternHook,
    name: "tentLanternCap",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.034, 8, 8), "#ffcc55", {
      bone: dioramaRoot,
      at: [lanternHook[0], lanternHook[1] - 0.04, lanternHook[2]],
      name: "tentLanternGlass",
    }),
    2.2,
  );

  // Tent interior: Kilim carpet extending into the open porch
  b.part(new THREE.PlaneGeometry(0.72, 0.52), "#ffffff", {
    bone: dioramaRoot,
    at: [TENT_C.x - 0.1, BASE_H + 0.016, TENT_C.z - 0.04],
    dir: [0, 1, 0],
    axis: "z",
    rotation: [0, 0, -85 * DEG],
    texture: kilimRugTex,
    name: "interiorKilimRug",
  });

  // Low carved brass tea table
  const tablePos: [number, number, number] = [TENT_C.x - 0.12, BASE_H + 0.06, TENT_C.z - 0.05];
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

  // Traditional Dallah coffee pot
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
  b.rod([dallahPos[0], dallahPos[1] + 0.03, dallahPos[2]], [dallahPos[0] - 0.028, dallahPos[1] + 0.055, dallahPos[2]], 0.005, BRASS_GOLD, {
    bone: dioramaRoot,
    name: "dallahSpout",
  });

  // Finjan glasses
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

  // Floor poufs and bolster cushion
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), TENT_TERRACOTTA, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.12, BASE_H + 0.04, TENT_C.z + 0.1],
    name: "pouf1",
  });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.055, 10), TENT_INDIGO, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.14, BASE_H + 0.04, TENT_C.z - 0.16],
    name: "pouf2",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [TENT_C.x + 0.18, BASE_H + 0.05, TENT_C.z - 0.03],
    rotation: [90 * DEG, 0, 0],
    name: "bolsterPillow",
  });

  // ---------------------------------------------------------------------------
  // CRACKLING CAMPFIRE & HEARTH
  // ---------------------------------------------------------------------------
  const FIRE_C = new THREE.Vector3(0.12, BASE_H, -0.05);

  // Stone hearth ring
  const FIRE_STONES = 8;
  for (let i = 0; i < FIRE_STONES; i++) {
    const a = (i / FIRE_STONES) * Math.PI * 2;
    const fx = FIRE_C.x + Math.cos(a) * 0.14;
    const fz = FIRE_C.z + Math.sin(a) * 0.14;
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

  // Glowing charcoal embers
  glow(
    b.part(new THREE.DodecahedronGeometry(0.055, 0), FIRE_ORANGE, {
      bone: dioramaRoot,
      at: [FIRE_C.x, BASE_H + 0.035, FIRE_C.z],
      name: "fireEmbersCore",
    }),
    2.5,
  );

  // Firewood logs
  const logAngles = [25, 70, 120, 165];
  for (let i = 0; i < logAngles.length; i++) {
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.22, 6), WOOD_DARK, {
      bone: dioramaRoot,
      at: [FIRE_C.x, BASE_H + 0.045 + i * 0.01, FIRE_C.z],
      rotation: [15 * DEG, logAngles[i] * DEG, 10 * DEG],
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

  // Cooking tripod & cast iron kettle
  const TRIPOD_H = 0.36;
  const TRIPOD_R = 0.16;
  const TRIPOD_TOP: [number, number, number] = [FIRE_C.x, BASE_H + TRIPOD_H, FIRE_C.z];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.rod([FIRE_C.x + Math.cos(a) * TRIPOD_R, BASE_H, FIRE_C.z + Math.sin(a) * TRIPOD_R], TRIPOD_TOP, 0.007, "#1a1816", {
      bone: dioramaRoot,
      name: `tripodLeg_${i}`,
    });
  }

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
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 6), BRASS_GOLD, {
    bone: dioramaRoot,
    at: [FIRE_C.x, BASE_H + 0.178, FIRE_C.z],
    name: "kettleLid",
  });

  // ---------------------------------------------------------------------------
  // OASIS DATE PALMS (3 Characterful Trees)
  // ---------------------------------------------------------------------------
  function createPalmTree(
    name: string,
    trunkCurve: THREE.Vector3[],
    frondCount: number,
    frondLength: number,
    dateClusters: number,
  ) {
    const crownPos = trunkCurve[trunkCurve.length - 1];

    // Segmented ringed trunk with flared base
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
      b.part(new THREE.TorusGeometry(r0 * 1.15, 0.015, 6, 12), PALM_BARK_DARK, {
        bone: dioramaRoot,
        at: p0.toArray(),
        name: `${name}_trunkCollar_${i}`,
      });
    }

    // Crown core & fibrous brown husks
    b.part(new THREE.SphereGeometry(0.12, 8, 6), PALM_BARK_DARK, {
      bone: dioramaRoot,
      at: crownPos.toArray(),
      name: `${name}_crownCore`,
    });

    // Hanging clusters of ripe golden dates (Tamar)
    for (let d = 0; d < dateClusters; d++) {
      const a = (d / dateClusters) * Math.PI * 2 + 0.3;
      const dx = crownPos.x + Math.cos(a) * 0.14;
      const dz = crownPos.z + Math.sin(a) * 0.14;
      b.rod(crownPos.toArray(), [dx, crownPos.y - 0.14, dz], 0.01, "#cfa038", {
        bone: dioramaRoot,
        name: `${name}_dateStalk_${d}`,
      });
      b.part(new THREE.SphereGeometry(0.065, 8, 6), DATE_GOLD, {
        bone: dioramaRoot,
        at: [dx, crownPos.y - 0.18, dz],
        scale: [1, 1.4, 1],
        name: `${name}_dateBunch_${d}`,
      });
    }

    // Lush arched palm fronds (3 tiers: upper arching, middle spreading, lower weeping)
    for (let f = 0; f < frondCount; f++) {
      const a = (f / frondCount) * Math.PI * 2;
      const tier = f % 3; // 0 = upper, 1 = mid, 2 = weeping
      const midOut = frondLength * 0.55;
      const tipOut = frondLength;

      const yMid = tier === 0 ? 0.35 : tier === 1 ? 0.15 : -0.05;
      const yTip = tier === 0 ? 0.05 : tier === 1 ? -0.25 : -0.55;

      const pMid = new THREE.Vector3(
        crownPos.x + Math.cos(a) * midOut,
        crownPos.y + yMid,
        crownPos.z + Math.sin(a) * midOut,
      );
      const pTip = new THREE.Vector3(
        crownPos.x + Math.cos(a) * tipOut,
        crownPos.y + yTip,
        crownPos.z + Math.sin(a) * tipOut,
      );

      const frondSpine = bezier(crownPos.toArray(), pMid.toArray(), pTip.toArray());

      // Center rachis stem
      b.sweep(frondSpine, [0.024, 0.005], {
        color: FROND_BRIGHT,
        bone: dioramaRoot,
        name: `${name}_frondSpine_${f}`,
      });

      // Tapered drooping leaflet blade
      b.sweep(
        frondSpine,
        (s) => [0.18 * Math.sin(s * Math.PI), 0.01],
        {
          color: tier === 0 ? FROND_BRIGHT : tier === 1 ? FROND_GREEN : FROND_DEEP,
          bone: dioramaRoot,
          section: "circle",
          name: `${name}_frondBlade_${f}`,
        },
      );
    }
  }

  // Palm 1: Leaning gracefully over the pool (Hero Palm)
  const palm1Curve = [
    new THREE.Vector3(-0.72, BASE_H, -0.32),
    new THREE.Vector3(-0.65, BASE_H + 0.65, -0.22),
    new THREE.Vector3(-0.52, BASE_H + 1.35, -0.08),
    new THREE.Vector3(-0.35, BASE_H + 1.95, 0.08),
    new THREE.Vector3(-0.18, BASE_H + 2.38, 0.2),
  ];
  createPalmTree("heroPalm", palm1Curve, 12, 0.95, 3);

  // Palm 2: Poolside flank tree
  const palm2Curve = [
    new THREE.Vector3(-0.92, BASE_H, 0.32),
    new THREE.Vector3(-1.02, BASE_H + 0.6, 0.36),
    new THREE.Vector3(-1.1, BASE_H + 1.25, 0.4),
    new THREE.Vector3(-1.16, BASE_H + 1.78, 0.44),
  ];
  createPalmTree("leftPalm", palm2Curve, 9, 0.78, 2);

  // Palm 3: Rear tree behind the tent framing the diorama
  const palm3Curve = [
    new THREE.Vector3(0.98, BASE_H, -0.62),
    new THREE.Vector3(1.06, BASE_H + 0.55, -0.7),
    new THREE.Vector3(1.14, BASE_H + 1.15, -0.78),
    new THREE.Vector3(1.18, BASE_H + 1.68, -0.84),
  ];
  createPalmTree("rearPalm", palm3Curve, 8, 0.72, 2);

  return b.root;
}
