import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  svg,
  paint,
  noise,
  mix,
  mottle,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Amberleaf — Red Panda on a Mossy Stone",
  description:
    "A jewel-eyed red panda balances on an ancient moss-covered stone, with a magnificent ringed tail, cream cheek ruffs, and a little teal-and-gold adventurer's scarf. Faceted shapes and hand-drawn fantasy details evoke an anime adventure.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Amberleaf", paintSize: 2048 });
  const random = rng(9183);

  const INK = "#302333";
  const GOLD = "#e7bc65";
  const GOLD_LIGHT = "#ffe6a0";
  const CREAM = cel("#fff0cf", "#d5b697");
  const ORANGE = cel("#d86b35", "#9b3f37");
  const LIGHT_ORANGE = cel("#ed9550", "#bd5c38");
  const DARK = cel("#51333d", "#302b38");
  const TEAL = cel("#287d77", "#22505e");
  const MOSS = ["#507853", "#638a54", "#83a45d", "#a1b96c"];
  const stonePaint = paint((p, n) => {
    const v = noise(p, 0.13, 12);
    const c = mix("#53606c", "#919497", v);
    return mix(c, "#667d67", Math.max(0, n.y) * 0.22);
  });
  const mossPaint = mottle("#476b49", "#8aa75d", {
    size: 0.075,
    seed: 31,
  });
  const coat = paint((p, n) => {
    if (p.y < 0.405) return DARK;
    return n.y > 0.35 ? LIGHT_ORANGE : ORANGE;
  });

  // Drawings: eyes, ear velvet, embroidery, ancient carving, and botanical details.
  const eyeTexture = svg(
    `<svg viewBox="0 0 100 120">
      <defs>
        <linearGradient id="iris" x2="0" y2="1">
          <stop stop-color="#96522c"/>
          <stop offset=".45" stop-color="#d49732"/>
          <stop offset="1" stop-color="#fff09c"/>
        </linearGradient>
      </defs>
      <path d="M10 53 Q13 18 48 19 Q88 18 93 53 Q88 96 52 103 Q15 99 10 53Z" fill="#302333"/>
      <path d="M17 54 Q20 30 49 29 Q79 27 85 54 Q80 90 52 94 Q23 90 17 54Z" fill="#fff1d4"/>
      <ellipse cx="52" cy="61" rx="27" ry="34" fill="url(#iris)" stroke="#683c34" stroke-width="4"/>
      <ellipse cx="53" cy="57" rx="13" ry="24" fill="#342538"/>
      <path d="M31 75 Q51 95 73 74" fill="none" stroke="#fff1a6" stroke-width="5"/>
      <ellipse cx="39" cy="43" rx="11" ry="13" fill="#ffffff"/>
      <circle cx="68" cy="76" r="5.5" fill="#ffffff"/>
      <path d="M10 48 Q20 17 51 20 Q74 18 90 40" fill="none" stroke="#302333" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M15 105 Q3 61 48 9 Q85 40 89 104 Q51 89 15 105Z" fill="#ad665b"/>
      <path d="M25 97 Q24 55 48 27 Q68 53 76 96 L60 84 L53 101 L44 81 L34 99Z" fill="#e3a087"/>
      <path d="M35 82 Q41 51 49 42" fill="none" stroke="#f8c5a2" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const embroideryTexture = svg(
    `<svg viewBox="0 0 128 192">
      <path d="M11 0V192 M117 0V192" stroke="#e6bd72" stroke-width="5"/>
      <path d="M22 0V192 M106 0V192" stroke="#8fb9a0" stroke-width="3" stroke-dasharray="6 7"/>
      <g fill="none" stroke="#efcf87" stroke-width="4">
        <path d="M64 20L87 48L64 77L41 48Z M64 104L87 132L64 162L41 132Z"/>
        <path d="M64 29V69 M50 49H78 M64 113V153 M50 133H78"/>
      </g>
      <g fill="#a8dbbb"><circle cx="64" cy="89" r="5"/><circle cx="64" cy="176" r="5"/></g>
    </svg>`,
    { size: 384 },
  );

  const leafEmblem = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M50 5L89 28V68L50 94L11 68V28Z" fill="#163e4a" stroke="#f1cb79" stroke-width="6"/>
      <path d="M29 69 Q18 33 68 23 Q84 61 38 76Z" fill="#79dfbe" stroke="#c5ffe4" stroke-width="3"/>
      <path d="M31 80L65 31 M45 60L39 43 M50 53L66 51" fill="none" stroke="#235d63" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="12" r="3" fill="#fff0bd"/>
    </svg>`,
    { size: 256 },
  );

  const stoneRune = svg(
    `<svg viewBox="0 0 160 100">
      <g fill="none" stroke="#344955" stroke-width="8" stroke-linecap="square">
        <path d="M22 72V28L42 15L61 28V72 M22 48H61"/>
        <path d="M82 19V75 M70 32L94 55L109 32"/>
        <path d="M124 22L144 38L124 57L144 75"/>
      </g>
      <g fill="none" stroke="#a9beb1" stroke-width="3">
        <path d="M25 72V30L42 20L58 30 M85 19V73 M127 23L147 38L128 57"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 80 128">
      <path d="M39 125 Q-12 87 15 37 Q30 13 65 3 Q87 64 39 125Z" fill="#87b86d" stroke="#365c51" stroke-width="4"/>
      <path d="M39 120Q35 63 62 12 M39 89L16 65 M42 69L67 47 M48 48L31 34" fill="none" stroke="#d3dda0" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. Four separated contacts, a freely extended tail, and an independent jaw.
  const hips = b.joint("hips", {
    at: [0, 0.51, -0.22],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.51, -0.22],
      [0, 0.53, -0.04],
      [0, 0.55, 0.13],
    ],
    { parent: hips, names: ["spine1", "chest", "withers"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.55, 0.13],
      [0, 0.64, 0.24],
      [0, 0.70, 0.30],
    ],
    { parent: spine.tip!, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.71, 0.31],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.623, 0.392],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.52, -0.26],
      [0.025, 0.54, -0.43],
      [0.11, 0.57, -0.64],
      [0.24, 0.62, -0.85],
      [0.36, 0.69, -1.015],
      [0.405, 0.76, -1.09],
    ]),
    { parent: hips, count: 7, role: "tail" },
  );

  const legs: {
    side: number;
    front: boolean;
    chain: ReturnType<typeof b.chain>;
    foot: number[];
  }[] = [];

  for (const side of [-1, 1]) {
    const suffix = side === 1 ? "L" : "R";
    for (const front of [true, false]) {
      const key = `${front ? "F" : "H"}${suffix}`;
      const foot = [side * 0.19, 0.245, front ? 0.265 : -0.255];
      const chain = b.chain(
        `leg${key}`,
        [
          [side * 0.135, 0.505, front ? 0.13 : -0.21],
          [side * 0.172, 0.36, front ? 0.185 : -0.28],
          [side * 0.19, 0.255, front ? 0.235 : -0.29],
        ],
        {
          parent: front ? spine.joints[1] : hips,
          names: [
            `${front ? "shoulder" : "hip"}${key}`,
            `${front ? "elbow" : "knee"}${key}`,
            `ankle${key}`,
          ],
          role: "leg",
          contact: [foot[0], 0.20, foot[2]],
        },
      );
      legs.push({ side, front, chain, foot });
    }
  }

  // Simple geometry helpers keep the puppet-like volumes consistent.
  function ellipsoid(
    at: number[],
    scale: number[],
    color: any,
    bone: any,
    name: string,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });
  }

  function tuft(
    root: number[],
    tip: number[],
    width: number,
    color: any,
    bone: any,
    name: string,
  ) {
    return b.sweep(
      bezier(root, [
        root[0] * 0.45 + tip[0] * 0.55,
        root[1] * 0.7 + tip[1] * 0.3,
        root[2] * 0.6 + tip[2] * 0.4,
      ], tip),
      (t) => [width * (1 - t), width * 0.48 * (1 - t)],
      { color, bone, sides: 5, caps: "flat", name },
    );
  }

  // The stone is one restrained pedestal, not a separate landscape.
  const rockGeometry = new THREE.CylinderGeometry(0.43, 0.49, 0.20, 9, 1);
  const rock = b.part(rockGeometry, stonePaint, {
    at: [0, 0.10, -0.015],
    scale: [1, 1, 1.10],
    name: "ancient_balancing_stone",
    bone: hips,
    flat: true,
  });
  const rockSurface = b.surface(rock);
  b.decal(rock, stoneRune, {
    at: [0, 0.112, 0.47],
    dir: [0, 0, 1],
    size: [0.22, 0.09],
    lift: 0.001,
    bone: hips,
    name: "weathered_carving",
  });

  // Moss follows the rock, leaving the front carving readable.
  const mossHits = rockSurface.scatter(47, {
    rng: random,
    minDist: 0.042,
    filter: (h) => h.n.y > 0.65 || (h.at.z < 0.12 && h.at.y > 0.13),
  });
  for (let i = 0; i < mossHits.length; i++) {
    const r = 0.027 + random() * 0.033;
    b.stick(
      new THREE.SphereGeometry(1, 7, 4),
      i % 4 === 0 ? mossPaint : MOSS[i % MOSS.length],
      mossHits[i],
      {
        scale: [r, 0.013 + random() * 0.009, r * 0.85],
        embed: 0.38,
        bone: hips,
        name: `moss_cushion_${i}`,
      },
    );
  }

  for (const [x, z, size] of [
    [-0.36, 0.26, 0.075],
    [0.39, 0.19, 0.055],
    [-0.34, -0.31, 0.06],
    [0.29, -0.38, 0.065],
  ]) {
    ellipsoid([x, 0.07, z], [size, 0.065, size * 0.8], stonePaint, hips, "stone_chip", 7);
  }

  // Body and limbs: compact, weight-bearing shapes with dark stockings.
  const body = b.sweep(
    spine,
    (t) => [0.155 - 0.012 * t, 0.169 - 0.018 * t],
    { color: coat, sides: 10, caps: "round", name: "russet_body" },
  );
  b.sweep(neck, [0.13, 0.12], {
    color: ORANGE,
    sides: 8,
    name: "neck_fur",
  });

  for (const leg of legs) {
    const { side, front, chain, foot } = leg;
    b.sweep(chain, [front ? 0.076 : 0.09, 0.059, 0.048], {
      color: DARK,
      sides: 7,
      name: front ? "foreleg" : "hindleg",
    });
    ellipsoid(
      [side * 0.139, 0.475, front ? 0.12 : -0.22],
      [front ? 0.084 : 0.102, 0.115, 0.106],
      front ? ORANGE : LIGHT_ORANGE,
      chain.joints[0],
      "rounded_upper_leg",
    );
    ellipsoid(
      foot,
      [0.071, 0.045, 0.087],
      DARK,
      chain.tip!,
      "soft_planted_paw",
      10,
    );
    for (let digit = -1; digit <= 1; digit++) {
      const x = foot[0] + digit * 0.037;
      ellipsoid(
        [x, 0.237, foot[2] + 0.052],
        [0.025, 0.031, 0.037],
        DARK,
        chain.tip!,
        "toe",
        8,
      );
      b.sweep(
        [
          [x, 0.238, foot[2] + 0.078],
          [x, 0.226, foot[2] + 0.093],
        ],
        [0.009, 0.002],
        { bone: chain.tip!, color: "#c5ad97", sides: 5, name: "tiny_claw" },
      );
    }
    for (let j = 0; j < 3; j++) {
      tuft(
        [side * 0.19, 0.48 - j * 0.035, front ? 0.10 : -0.20],
        [side * (0.24 - j * 0.006), 0.44 - j * 0.04, front ? 0.045 : -0.29],
        0.027,
        j === 0 ? LIGHT_ORANGE : ORANGE,
        chain.joints[0],
        "leg_fur_point",
      );
    }
  }

  // The tail is intentionally long, uncurled and animation-ready.
  const tailTube = b.sweep(
    tail,
    (t) => {
      const r = 0.09 + 0.027 * Math.sin(t * Math.PI) - 0.055 * Math.pow(t, 5);
      return [r, r * 0.92];
    },
    {
      sides: 10,
      caps: "round",
      color: ORANGE,
      bands: [
        [0.12, ORANGE],
        [0.23, CREAM],
        [0.34, ORANGE],
        [0.45, CREAM],
        [0.56, ORANGE],
        [0.67, CREAM],
        [0.78, ORANGE],
        [0.89, CREAM],
        [1, LIGHT_ORANGE],
      ],
      name: "nine_ring_plume",
    },
  );
  b.along(
    tailTube,
    10,
    (at) => {
      b.stick(
        new THREE.ConeGeometry(0.018, 0.049, 5),
        at.t > 0.89 ? LIGHT_ORANGE : ORANGE,
        at,
        { embed: 0.76, name: "tail_fur_tip" },
      );
    },
    { from: 0.05, to: 0.95 },
  );

  // Head region: all face elements share one explicit scale and coordinate system.
  const H = 1.0;
  const face = b.region({ at: head.at, scale: H, bone: head });
  const headPoint = (p: number[]) => {
    const v = face.p(p);
    return [v.x, v.y, v.z];
  };

  const skull = ellipsoid(
    headPoint([0, 0, 0]),
    [0.215 * H, 0.185 * H, 0.177 * H],
    LIGHT_ORANGE,
    head,
    "large_panda_head",
    16,
  );

  for (const s of [-1, 1]) {
    // Large rounded triangular ears, cream outer rims and warm inner velvet.
    const ear = b.extrude(
      [
        [-0.052, -0.015],
        [0.046, -0.018],
        [0.092, 0.048],
        [0.08, 0.146],
        [0.046, 0.175],
        [-0.017, 0.116],
        [-0.058, 0.044],
      ],
      {
        at: face.p([s * 0.145, 0.125, -0.025]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.068,
        smoothing: 1,
        bevel: 0.009,
        color: CREAM,
        bone: head,
        name: s > 0 ? "earL" : "earR",
      },
    );
    b.decal(ear, earTexture, {
      at: face.p([s * 0.169, 0.209, 0.015]),
      dir: [0, 0, 1],
      size: [0.115, 0.143],
      lift: 0.002,
      mirror: s < 0,
      bone: head,
      name: "ear_velvet",
    });

    ellipsoid(
      headPoint([s * 0.148, -0.062, 0.111]),
      [0.084, 0.067, 0.063],
      CREAM,
      head,
      "cream_cheek",
    );

    for (let j = 0; j < 4; j++) {
      tuft(
        headPoint([s * (0.15 + j * 0.005), -0.033 - j * 0.025, 0.09]),
        headPoint([s * (0.254 - j * 0.012), -0.05 - j * 0.032, 0.075]),
        0.038 - j * 0.003,
        CREAM,
        head,
        "cheek_ruff",
      );
    }

    const patch = ellipsoid(
      headPoint([s * 0.103, 0.013, 0.143]),
      [0.073, 0.086, 0.035],
      DARK,
      head,
      "dark_tear_mask",
      14,
    );

    // The tear marks remain bold beneath the eyes.
    tuft(
      headPoint([s * 0.105, -0.025, 0.16]),
      headPoint([s * 0.139, -0.091, 0.148]),
      0.034,
      DARK,
      head,
      "panda_tear",
    );

    b.decal(patch, eyeTexture, {
      at: face.p([s * 0.103, 0.021, 0.18]),
      dir: [s * 0.12, 0, 1],
      size: [0.108, 0.13],
      lift: 0.0025,
      mirror: s > 0,
      bone: head,
      name: "amber_anime_eye",
    });

    const brow = ellipsoid(
      headPoint([s * 0.096, 0.106, 0.124]),
      [0.059, 0.026, 0.031],
      CREAM,
      head,
      "expressive_cream_brow",
    );
    brow.mesh.userData.feature = "brow";

    ellipsoid(
      headPoint([s * 0.041, -0.071, 0.194]),
      [0.055, 0.037, 0.047],
      CREAM,
      head,
      "upper_muzzle_lobe",
    );

    for (let i = 0; i < 3; i++) {
      ellipsoid(
        headPoint([s * (0.055 + (i % 2) * 0.018), -0.064 - Math.floor(i / 2) * 0.015, 0.235 - (i % 2) * 0.008]),
        [0.0038, 0.0038, 0.002],
        "#73504b",
        head,
        "whisker_freckle",
        6,
      );
    }

    b.sweep(
      bezier(
        face.p([s * 0.07, -0.078, 0.226]),
        face.p([s * 0.16, -0.065, 0.233]),
        face.p([s * 0.225, -0.039, 0.208]),
      ),
      [0.0025, 0.0007],
      { color: "#eed7b7", bone: head, sides: 4, name: "fine_whisker" },
    );
  }

  // Separate lower jaw with a dark lip seam, small smiling corners, and a velvet nose.
  ellipsoid(
    headPoint([0, -0.104, 0.185]),
    [0.083, 0.018, 0.052],
    INK,
    jaw,
    "mouth_separation",
  );
  ellipsoid(
    headPoint([0, -0.117, 0.172]),
    [0.082, 0.025, 0.057],
    CREAM,
    jaw,
    "lower_jaw",
  );
  b.extrude(
    [
      [-0.034, 0.009],
      [-0.023, 0.022],
      [0.023, 0.022],
      [0.034, 0.009],
      [0, -0.018],
    ],
    {
      at: face.p([0, -0.052, 0.242]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.005,
      smoothing: 1,
      color: INK,
      bone: head,
      name: "velvet_triangle_nose",
    },
  );
  ellipsoid(
    headPoint([-0.009, -0.04, 0.257]),
    [0.012, 0.005, 0.0025],
    "#9c7980",
    head,
    "nose_glint",
    8,
  );
  b.rod(
    face.p([0, -0.063, 0.245]),
    face.p([0, -0.09, 0.239]),
    0.003,
    { bone: head, color: INK, name: "philtrum" },
  );

  // A clean forehead flame, plus two broad crown tufts.
  b.extrude(
    [
      [-0.023, 0],
      [-0.014, 0.044],
      [0, 0.068],
      [0.015, 0.043],
      [0.023, 0],
      [0, 0.016],
    ],
    {
      at: face.p([0, 0.072, 0.149]),
      x: [1, 0, 0],
      y: [0, 1, -0.35],
      thickness: 0.009,
      color: ORANGE,
      bone: head,
      name: "forehead_flame",
    },
  );
  for (const s of [-1, 1]) {
    tuft(
      headPoint([s * 0.035, 0.155, -0.015]),
      headPoint([s * 0.067, 0.208, -0.046]),
      0.037,
      LIGHT_ORANGE,
      head,
      "crown_tuft",
    );
  }

  // Small fantasy adventurer's scarf; kept below the entire face.
  const neckLoop = catmull(
    [
      [-0.115, 0.577, 0.185],
      [0, 0.558, 0.299],
      [0.115, 0.577, 0.185],
      [0, 0.607, 0.095],
    ],
    { closed: true },
  );
  b.sweep(neckLoop, 0.029, {
    color: TEAL,
    bone: neck.joints[0],
    sides: 6,
    name: "teal_scarf_loop",
  });
  const trimLoop = catmull(
    [
      [-0.118, 0.565, 0.19],
      [0, 0.543, 0.303],
      [0.118, 0.565, 0.19],
      [0, 0.593, 0.09],
    ],
    { closed: true },
  );
  b.sweep(trimLoop, 0.0045, {
    color: GOLD,
    bone: neck.joints[0],
    sides: 5,
    name: "collar_gold_piping",
  });

  for (const s of [-1, 1]) {
    const end = s > 0 ? 0.31 : 0.285;
    const ribbon = b.extrude(
      [
        [-0.045, 0],
        [0.042, 0],
        [0.05, -0.122],
        [0.028, -0.177],
        [0, -0.154],
        [-0.036, -0.18],
        [-0.046, -0.091],
      ],
      {
        at: [s * 0.142, 0.57, 0.15],
        x: [s * 0.92, 0.22, 0.12],
        y: [-s * 0.25, 0.94, 0.08],
        thickness: 0.014,
        color: TEAL,
        bone: neck.joints[0],
        name: "embroidered_scarf_tail",
      },
    );
    b.decal(ribbon, embroideryTexture, {
      at: [s * 0.165, 0.485, 0.17],
      dir: [0, 0, 1],
      size: [0.077, 0.15],
      bone: neck.joints[0],
      lift: 0.002,
      name: "scarf_gold_embroidery",
    });
    ellipsoid(
      [s * 0.141, 0.57, 0.17],
      [0.037, 0.035, 0.025],
      TEAL,
      neck.joints[0],
      "scarf_knot",
      8,
    );
    for (let j = 0; j < 4; j++) {
      b.sweep(
        [
          [s * (0.17 + j * 0.012), 0.408, 0.15],
          [s * (0.176 + j * 0.012), 0.38 - j * 0.003, 0.15],
        ],
        [0.0035, 0.002],
        { color: GOLD, bone: neck.joints[0], sides: 4, name: "silk_fringe" },
      );
    }
    // Tiny leaf-shaped collar studs.
    b.part(new THREE.OctahedronGeometry(0.011), GOLD_LIGHT, {
      at: [s * 0.065, 0.548, end],
      scale: [0.65, 1, 0.45],
      bone: neck.joints[0],
      name: "collar_stud",
    });
  }

  b.rod([0, 0.553, 0.305], [0, 0.499, 0.322], 0.005, {
    color: GOLD,
    bone: neck.joints[0],
    name: "charm_link",
  });
  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 6), GOLD, {
    at: [0, 0.479, 0.326],
    dir: [0, 0, 1],
    bone: neck.joints[0],
    name: "leaf_charm_setting",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
      at: [0, 0.479, 0.334],
      dir: [0, 0, 1],
      axis: "z",
      texture: leafEmblem,
      bone: neck.joints[0],
      name: "gentle_leaf_vision",
    }),
    0.35,
  );

  // Subtle shoulder fur lies on the body rather than hovering around it.
  const backSurface = b.surface(body);
  const furHits = backSurface.scatter(12, {
    rng: random,
    minDist: 0.055,
    filter: (hit) => hit.n.y > 0.45 && hit.at.z < 0.06,
  });
  for (const hit of furHits) {
    b.stick(new THREE.ConeGeometry(0.025, 0.055, 5), LIGHT_ORANGE, hit, {
      embed: 0.78,
      name: "back_fur_accent",
    });
  }

  // A few botanical accents frame the stone without crowding the paws.
  for (const [x, z, height] of [
    [-0.34, -0.16, 0.14],
    [0.33, -0.20, 0.12],
    [-0.29, 0.28, 0.09],
  ]) {
    const y = 0.195;
    b.sweep(
      [[x, y, z], [x + 0.008, y + height, z - 0.013]],
      [0.004, 0.002],
      { color: "#587c53", bone: hips, sides: 5, name: "fern_stem" },
    );
    for (let j = 0; j < 3; j++) {
      for (const s of [-1, 1]) {
        b.cards(
          [frame([x, y + height * (0.25 + j * 0.23), z], [s * 0.8, 0.5, 0.12])],
          leafTexture,
          {
            size: [0.026 - j * 0.004, 0.054 - j * 0.007],
            flow: [0, 0, 1],
            lean: 12,
            bone: hips,
            name: "fern_leaf",
          },
        );
      }
    }
  }

  // Tiny amber mushrooms at the back corner.
  for (const [x, z, h] of [
    [-0.27, -0.34, 0.055],
    [-0.32, -0.30, 0.038],
    [-0.24, -0.38, 0.035],
  ]) {
    b.rod([x, 0.192, z], [x, 0.192 + h, z], 0.007, {
      color: "#e3d4af",
      bone: hips,
      name: "mushroom_stem",
    });
    b.lathe(
      [
        [0, 0],
        [0.028, 0],
        [0.027, 0.009],
        [0.018, 0.022],
        [0, 0.026],
      ],
      {
        at: [x, 0.192 + h, z],
        segments: 8,
        color: "#d99a52",
        bone: hips,
        name: "amber_mushroom_cap",
      },
    );
    ellipsoid(
      [x - 0.007, 0.212 + h, z + 0.007],
      [0.005, 0.0025, 0.004],
      "#fff0c3",
      hips,
      "mushroom_speckle",
      6,
    );
  }

  // A pair of restrained mint glints caught in the moss.
  for (const p of [
    [-0.365, 0.235, -0.12],
    [0.345, 0.239, -0.245],
  ]) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.012), "#b7f8cf", {
        at: p,
        scale: [0.6, 1.5, 0.6],
        bone: hips,
        name: "moss_dewdrop",
      }),
      0.7,
    );
  }

  return b.root;
}
