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
  const ORANGE = cel("#bc4e35", "#863c38");
  const LIGHT_ORANGE = cel("#d36c40", "#a74a37");
  const TAIL_CREAM = cel("#e5b77f", "#b78259");
  const TEAR = cel("#99503d", "#713b38");
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
      <path d="M3 58 Q0 13 46 3 Q94 0 98 55 Q100 106 53 118 Q5 113 3 58Z" fill="#fff0cf"/>
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

  const browTexture = svg(
    `<svg viewBox="0 0 120 40">
      <path d="M5 29 Q46 2 94 12 L115 24 Q62 17 12 36Z" fill="#fff0cf"/>
      <path d="M14 26 Q53 9 91 16" fill="none" stroke="#fff9e5" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const furMarkTexture = svg(
    `<svg viewBox="0 0 120 80">
      <g fill="none" stroke="#a14934" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 16L33 32L46 21"/>
        <path d="M52 31L68 49L82 37"/>
        <path d="M32 48L44 61L55 53"/>
      </g>
    </svg>`,
    { size: 256 },
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
  const rockGeometry = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.385, 0),
      new THREE.Vector2(0.475, 0.043),
      new THREE.Vector2(0.455, 0.139),
      new THREE.Vector2(0.420, 0.20),
      new THREE.Vector2(0, 0.20),
    ],
    11,
  );
  const rockVertices = rockGeometry.getAttribute("position");
  for (let i = 0; i < rockVertices.count; i++) {
    const x = rockVertices.getX(i);
    const z = rockVertices.getZ(i);
    const angle = Math.atan2(z, x);
    const irregularity =
      1 + 0.045 * Math.sin(angle * 3 + 0.4) +
      0.025 * Math.cos(angle * 5 - 0.6);
    rockVertices.setXYZ(
      i,
      x * irregularity,
      rockVertices.getY(i),
      z * irregularity,
    );
  }
  rockGeometry.computeVertexNormals();
  const rock = b.part(rockGeometry, stonePaint, {
    at: [0, 0, -0.015],
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

  // Connected moss carpets establish a soft surface before the smaller cushions.
  for (const [cx, cz, rx, rz] of [
    [-0.21, -0.10, 0.17, 0.29],
    [0.21, -0.10, 0.17, 0.29],
    [0, -0.26, 0.26, 0.15],
    [0, 0.13, 0.15, 0.13],
  ]) {
    const outline: number[][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = 0.92 + 0.08 * Math.sin(i * 2.7) + random() * 0.07;
      outline.push([rx * Math.cos(a) * r, rz * Math.sin(a) * r]);
    }
    b.extrude(outline, {
      at: [cx, 0.202, cz],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.009,
      color: mossPaint,
      bone: hips,
      name: "continuous_velvet_moss",
    });
  }

  // Moss follows the rock, leaving the front carving readable.
  const mossHits = rockSurface.scatter(47, {
    rng: random,
    minDist: 0.042,
    filter: (h) => h.n.y > 0.65 || (h.at.z < 0.12 && h.at.y > 0.13),
  });
  for (let i = 0; i < mossHits.length; i++) {
    const r = 0.031 + random() * 0.036;
    b.stick(
      new THREE.SphereGeometry(1, 7, 4),
      i % 4 === 0 ? mossPaint : MOSS[i % MOSS.length],
      mossHits[i],
      {
        scale: [r, 0.009 + random() * 0.006, r * 0.85],
        embed: 0.38,
        bone: hips,
        name: `moss_cushion_${i}`,
      },
    );
  }

  for (const [x, z, size] of [
    [-0.39, 0.23, 0.065],
    [0.40, 0.18, 0.052],
    [-0.32, -0.35, 0.054],
  ]) {
    b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
      at: [x, size * 0.40, z],
      scale: [size, size * 0.45, size * 0.85],
      rotation: [0, x * 97, 0],
      bone: hips,
      flat: true,
      name: "grounded_angular_stone_chip",
    });
  }

  // Creepers grow from the moss and follow the actual boulder surface.
  for (const s of [-1, 1]) {
    const vine = rockSurface.drape(
      catmull([
        [s * 0.29, 0.205, 0.30],
        [s * 0.34, 0.16, 0.32],
        [s * 0.37, 0.105, 0.31],
        [s * 0.36, 0.065, 0.33],
      ]),
      { lift: 0.006 },
    );
    b.sweep(vine, [0.0045, 0.002], {
      color: "#527850",
      bone: hips,
      sides: 5,
      name: "stone_hugging_creeper",
    });
    b.along(vine, 4, (at) => {
      const alternate = Math.floor(at.t * 8) % 2 ? -1 : 1;
      b.extrude(
        [
          [0, 0],
          [-0.015, -0.008],
          [-0.021, -0.025],
          [0, -0.048],
          [0.018, -0.024],
          [0.013, -0.007],
        ],
        {
          at,
          x: [1, 0, 0],
          y: [alternate * 0.55, 1, 0.08],
          thickness: 0.003,
          color: alternate > 0 ? "#87a960" : "#668d52",
          bone: hips,
          name: "trailing_creeper_leaf",
        },
      );
      b.sweep(
        [
          at.at,
          [
            at.at.x - alternate * 0.018,
            at.at.y - 0.035,
            at.at.z + 0.004,
          ],
        ],
        [0.0016, 0.0007],
        {
          color: "#c1cd8c",
          bone: hips,
          sides: 4,
          name: "creeper_leaf_vein",
        },
      );
    });
  }

  // Body and limbs: compact, weight-bearing shapes with dark stockings.
  const body = b.sweep(
    spine,
    (t) => [0.168 - 0.012 * t, 0.182 - 0.018 * t],
    { color: coat, sides: 10, caps: "round", name: "russet_body" },
  );
  b.sweep(neck, [0.13, 0.12], {
    color: ORANGE,
    sides: 8,
    name: "neck_fur",
  });

  for (const leg of legs) {
    const { side, front, chain, foot } = leg;
    b.sweep(chain, [0.057, 0.062, 0.052], {
      color: DARK,
      sides: 8,
      name: front ? "foreleg" : "hindleg",
    });
    ellipsoid(
      [side * 0.112, 0.485, front ? 0.10 : -0.205],
      [front ? 0.076 : 0.096, 0.112, 0.112],
      ORANGE,
      chain.joints[0],
      "blended_upper_leg",
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
    if (!front) {
      tuft(
        [side * 0.171, 0.465, -0.243],
        [side * 0.183, 0.427, -0.291],
        0.028,
        ORANGE,
        chain.joints[0],
        "soft_hock_fur",
      );
    }
  }

  // The tail is intentionally long, uncurled and animation-ready.
  b.sweep(
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
        [0.23, TAIL_CREAM],
        [0.34, ORANGE],
        [0.45, TAIL_CREAM],
        [0.56, ORANGE],
        [0.67, TAIL_CREAM],
        [0.78, ORANGE],
        [0.89, TAIL_CREAM],
        [1, LIGHT_ORANGE],
      ],
      name: "nine_ring_plume",
    },
  );
  // The uninterrupted ringed tail is the main counterbalancing silhouette.

  // Head region: all face elements share one explicit scale and coordinate system.
  const H = 1.0;
  const face = b.region({ at: head.at, scale: H, bone: head });
  const headPoint = (p: number[]) => {
    const v = face.p(p);
    return [v.x, v.y, v.z];
  };

  const faceCoat = paint((p, n) => {
    const localY = p.y - head.at.y;
    const localX = Math.abs(p.x - head.at.x);
    const creamBoundary =
      -0.059 + 0.022 * Math.min(1, localX / 0.16);
    if (localY < creamBoundary && n.z > 0.24) return CREAM;
    return n.y > 0.15 ? LIGHT_ORANGE : ORANGE;
  });
  const skull = ellipsoid(
    headPoint([0, 0, 0]),
    [0.215 * H, 0.168 * H, 0.177 * H],
    faceCoat,
    head,
    "large_panda_head",
    16,
  );

  for (const s of [-1, 1]) {
    // Large rounded triangular ears, cream outer rims and warm inner velvet.
    const ear = b.extrude(
      [
        [-0.057, -0.015],
        [0.051, -0.018],
        [0.095, 0.04],
        [0.083, 0.105],
        [0.047, 0.132],
        [-0.021, 0.093],
        [-0.061, 0.038],
      ],
      {
        at: face.p([s * 0.145, 0.125, -0.025]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.047,
        smoothing: 1,
        bevel: 0.009,
        color: CREAM,
        bone: head,
        name: s > 0 ? "earL" : "earR",
      },
    );
    b.decal(ear, earTexture, {
      at: face.p([s * 0.169, 0.19, 0.005]),
      dir: [0, 0, 1],
      size: [0.12, 0.109],
      lift: 0.002,
      mirror: s < 0,
      bone: head,
      name: "ear_velvet",
    });

    ellipsoid(
      headPoint([s * 0.133, -0.066, 0.108]),
      [0.096, 0.057, 0.034],
      CREAM,
      head,
      "integrated_cream_cheek",
    );

    for (let j = 0; j < 3; j++) {
      tuft(
        headPoint([s * 0.158, -0.045 - j * 0.022, 0.10]),
        headPoint([s * (0.243 - j * 0.008), -0.05 - j * 0.032, 0.083]),
        0.032 - j * 0.002,
        CREAM,
        head,
        "broad_cheek_ruff",
      );
    }

    // The tear marks remain bold beneath the eyes.
    b.extrude(
      [
        [-0.015, 0.012],
        [0.015, 0.006],
        [0.033, -0.048],
        [0.009, -0.036],
      ],
      {
        at: face.p([s * 0.112, -0.031, 0.145]),
        x: [s, 0, -0.25],
        y: [0, 1, 0.35],
        thickness: 0.006,
        color: TEAR,
        bone: head,
        name: "flat_russet_tear_mark",
      },
    );

    b.decal(skull, eyeTexture, {
      at: face.p([s * 0.10, 0.022, 0.18]),
      dir: [s * 0.22, 0.035, 1],
      size: [0.116, 0.137],
      segments: 12,
      lift: 0.002,
      mirror: s > 0,
      bone: head,
      name: "integrated_amber_eye",
    });

    b.decal(skull, browTexture, {
      at: face.p([s * 0.096, 0.105, 0.14]),
      dir: [s * 0.18, 0.20, 1],
      size: [0.102, 0.031],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
      name: "painted_cream_brow",
    });

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

    for (let whisker = 0; whisker < 2; whisker++) {
      b.sweep(
        bezier(
          face.p([s * 0.069, -0.076 - whisker * 0.009, 0.224]),
          face.p([s * 0.125, -0.079 - whisker * 0.014, 0.227]),
          face.p([s * 0.18, -0.065 - whisker * 0.027, 0.203]),
        ),
        [0.0014, 0.0004],
        { color: "#eed7b7", bone: head, sides: 4, name: "fine_whisker" },
      );
    }
  }

  // Separate lower jaw with a dark lip seam, small smiling corners, and a velvet nose.
  ellipsoid(
    headPoint([0, -0.098, 0.183]),
    [0.068, 0.0045, 0.043],
    INK,
    jaw,
    "subtle_mouth_separation",
  );
  ellipsoid(
    headPoint([0, -0.106, 0.175]),
    [0.073, 0.018, 0.049],
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
      [-0.184, 0.565, 0.185],
      [0, 0.545, 0.309],
      [0.184, 0.565, 0.185],
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
      [-0.187, 0.549, 0.19],
      [0, 0.525, 0.313],
      [0.187, 0.549, 0.19],
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
    const ribbon = b.extrude(
      [
        [-0.043, 0],
        [0.043, 0],
        [0.05, -0.112],
        [0.032, -0.172],
        [0, -0.148],
        [-0.035, -0.175],
        [-0.045, -0.085],
      ],
      {
        at: [s * 0.218, 0.557, 0.223],
        x: [s, 0, 0],
        y: [-s * 0.24, 1, 0],
        thickness: 0.012,
        color: TEAL,
        bone: neck.joints[0],
        name: "embroidered_scarf_tail",
      },
    );
    const front = s * 0.007;
    const faceCenter = ribbon.local([0, -0.08, front]);
    b.decal(ribbon, embroideryTexture, {
      at: faceCenter,
      dir: [0, 0, 1],
      size: [0.074, 0.148],
      bone: neck.joints[0],
      lift: 0.002,
      name: "scarf_gold_embroidery",
    });
    for (const edge of [
      [[-0.043, 0], [-0.045, -0.085], [-0.035, -0.175]],
      [[0.043, 0], [0.05, -0.112], [0.032, -0.172]],
    ]) {
      b.sweep(
        edge.map(([u, v]) => ribbon.local([u, v, front])),
        0.003,
        {
          color: GOLD,
          bone: neck.joints[0],
          sides: 5,
          name: "ribbon_gold_selvedge",
        },
      );
    }
    ellipsoid(
      [s * 0.196, 0.562, 0.221],
      [0.04, 0.029, 0.027],
      TEAL,
      neck.joints[0],
      "scarf_knot",
      8,
    );
    for (let j = 0; j < 4; j++) {
      const u = -0.027 + j * 0.018;
      const v = -0.15 - Math.abs(u) * 0.5;
      b.sweep(
        [
          ribbon.local([u, v, front]),
          ribbon.local([u + 0.004, v - 0.023, front]),
        ],
        [0.003, 0.0015],
        {
          color: GOLD,
          bone: neck.joints[0],
          sides: 4,
          name: "attached_silk_fringe",
        },
      );
    }
    b.part(new THREE.OctahedronGeometry(0.012), GOLD_LIGHT, {
      at: [s * 0.196, 0.562, 0.248],
      scale: [0.65, 1, 0.45],
      bone: neck.joints[0],
      name: "scarf_knot_clasp",
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

  // Painted fur gestures preserve the rounded body silhouette.
  const backSurface = b.surface(body);
  for (const s of [-1, 1]) {
    const hit = backSurface.nearest([s * 0.10, 0.69, -0.085]);
    b.decal(body, furMarkTexture, {
      at: hit,
      dir: hit.n,
      up: [0, 0, -1],
      size: [0.105, 0.075],
      lift: 0.0015,
      mirror: s > 0,
      name: "painted_russet_fur_gestures",
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
    [-0.345, 0.222, -0.12],
    [0.325, 0.222, -0.245],
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

  // An inquisitive expression without disturbing the planted, riggable stance.
  b.pose(head, { axis: [0, 0, 1], deg: -4 });

  return b.root;
}
