import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  rng,
  catmull,
  bezier,
  polyline,
  limb,
  paint,
  mottle,
  stripes,
  countershade,
  gradient,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A stylized ukiyo-e woodblock baku: a sturdy indigo tapir spirit with a cream trunk, inked ears, a ridged mane, gold dream charms, and luminous dream wisps curling from its mouth.",
};

const INK = "#20182d";
const INK_SOFT = "#302443";
const INDIGO = "#283656";
const INDIGO_DARK = "#17233f";
const BLUE = "#415b82";
const PLUM = "#5b3b61";
const PLUM_DARK = "#352541";
const CREAM = "#e8d8ad";
const CREAM_LIGHT = "#f5e8bf";
const OCHRE = "#bd8347";
const GOLD = "#e4af5c";
const GOLD_DARK = "#805333";
const VERMILION = "#a64e4b";
const TEAL = "#4f9b96";
const TEAL_DARK = "#245d68";
const HOOF = "#252236";
const NOSE = "#171725";
const DREAM_WHITE = "#fff0bf";

const COAT_BASE = mottle(INDIGO, INDIGO_DARK, {
  size: 0.18,
  contrast: 1.35,
  seed: 18,
});

const COAT = countershade(
  stripes(COAT_BASE, [BLUE, PLUM_DARK], {
    size: 0.27,
    width: 0.16,
    wobble: 0.16,
    seed: 22,
  }),
  INDIGO_DARK,
  { level: -0.3, soft: 0.28 },
);

const BELLY = paint((p, n) => {
  if (p.y < 0.69 && n.y < 0.55) return CREAM;
  if (p.y < 0.78 && n.y < -0.15) return CREAM_LIGHT;
  return COAT;
});

const MUZZLE = countershade(
  mottle(CREAM_LIGHT, CREAM, {
    size: 0.09,
    contrast: 1.25,
    seed: 31,
  }),
  "#b99d79",
  { level: -0.25, soft: 0.25 },
);

const EAR_OUTER = countershade(PLUM, PLUM_DARK, {
  level: -0.1,
  soft: 0.25,
});

const MANE_PAINT = stripes(PLUM, [PLUM_DARK, "#69476b"], {
  size: 0.12,
  width: 0.24,
  wobble: 0.08,
  seed: 44,
});

const DREAM_RIBBON = paint((p, n) => {
  const warm = Math.sin(p.y * 28 + p.z * 10) > 0.1;
  if (n.y > 0.45) return warm ? GOLD : DREAM_WHITE;
  return warm ? TEAL : TEAL_DARK;
});

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 128">
    <defs>
      <linearGradient id="iris" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#e6b85b"/>
        <stop offset="0.48" stop-color="#ba7548"/>
        <stop offset="1" stop-color="#57364e"/>
      </linearGradient>
    </defs>
    <path d="M8 65 Q26 18 57 16 Q86 18 96 59 Q74 95 43 101 Q18 94 8 65Z"
      fill="#171526" stroke="#1d1527" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="53" cy="58" rx="25" ry="36" fill="url(#iris)" stroke="#24172c" stroke-width="4"/>
    <ellipse cx="55" cy="63" rx="8" ry="25" fill="#191626"/>
    <path d="M29 69 Q50 82 75 69" fill="none" stroke="#f4d985" stroke-width="5" opacity=".78"/>
    <ellipse cx="43" cy="39" rx="9" ry="13" fill="#fff9dc"/>
    <circle cx="67" cy="77" r="4.5" fill="#fff9dc"/>
    <path d="M10 34 Q36 4 73 14 Q87 18 96 34" fill="none" stroke="#20162b" stroke-width="7"/>
    <path d="M11 39 L0 28 M14 31 L6 16 M21 23 L16 8" stroke="#20162b" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 111 Q50 103 80 110" fill="none" stroke="#a64e6d" stroke-width="5" opacity=".68"/>
  </svg>`,
  { size: 384 },
);

const FOREHEAD_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 8 C58 23 74 27 86 28 C72 39 65 49 66 67 C55 59 45 59 34 67 C35 49 28 39 14 28 C27 27 42 23 50 8Z"
      fill="#e4af5c" stroke="#20182d" stroke-width="7" stroke-linejoin="round"/>
    <path d="M50 23 L50 51 M32 35 Q50 45 68 35" fill="none" stroke="#7a4935" stroke-width="4"/>
    <circle cx="50" cy="66" r="7" fill="#4f9b96" stroke="#20182d" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const DREAM_GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
    <path d="M50 7 C74 26 85 48 75 67 C67 82 43 79 40 62 C37 48 53 37 65 44 C79 52 79 75 62 91 C48 105 26 109 16 126"
      fill="none" stroke="#f6dfa0" stroke-width="7" stroke-linecap="round"/>
    <path d="M18 126 l-4 13 M18 126 l14 5" fill="none" stroke="#4f9b96" stroke-width="6" stroke-linecap="round"/>
    <circle cx="27" cy="20" r="7" fill="#e4af5c"/>
    <path d="M76 107 l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#fff0bf"/>
  </svg>`,
  { size: 256 },
);

const EAR_PATTERN = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150">
    <path d="M50 8 C69 35 80 72 66 132 Q51 146 35 132 C21 72 31 35 50 8Z"
      fill="#a64e4b" stroke="#20182d" stroke-width="7"/>
    <path d="M50 25 Q62 67 53 119 M36 45 Q47 57 63 58 M33 77 Q48 86 65 81"
      fill="none" stroke="#e4af5c" stroke-width="5" opacity=".82"/>
  </svg>`,
  { size: 256 },
);

const CHARM_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="51" fill="#e4af5c" stroke="#20182d" stroke-width="8"/>
    <path d="M60 23 C73 39 83 44 96 46 C82 56 76 65 76 83 C65 75 55 75 44 83 C45 65 38 56 24 46 C38 44 48 39 60 23Z"
      fill="#4f9b96" stroke="#20182d" stroke-width="5"/>
    <circle cx="60" cy="60" r="9" fill="#fff0bf" stroke="#20182d" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  center: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  color: any,
  bone: any,
  name: string,
  segments = 12,
) {
  return b.part(new THREE.SphereGeometry(1, segments, Math.max(8, segments - 3)), color, {
    at: center,
    bone,
    scale,
    name,
  });
}

function inkRod(
  b: ReturnType<typeof createBuilder>,
  a: any,
  c: any,
  radius: number,
  name: string,
  color: any = INK,
) {
  return b.rod(a, c, radius, { color, name, caps: "round" });
}

function addFurSpike(
  b: ReturnType<typeof createBuilder>,
  on: any,
  length: number,
  radius: number,
  color: any,
  name: string,
) {
  return b.spike(on, on, length, radius, {
    color,
    name,
    caps: { start: "round", end: "point" },
    section: { ngon: 6 },
  });
}

export default function build() {
  const b = createBuilder({
    name: "baku",
    detail: 1,
    paintSize: 2048,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: a neutral, readable quadruped rest pose with a separate jaw and extended dream appendages.

  const hips = b.joint("hips", {
    at: [0, 0.84, -0.25],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    hips.at,
    [0, 0.88, 0.02],
    [0, 0.94, 0.32],
    [0, 1.01, 0.56],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "spine3", "shoulders"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    spine.joints[spine.joints.length - 1].at,
    [0, 1.10, 0.67],
    [0, 1.22, 0.76],
    [0, 1.30, 0.82],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[spine.joints.length - 1],
    count: 3,
    names: ["neck1", "neck2", "neckTip"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: neck.joints[neck.joints.length - 1].at,
    dir: [0, -0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.13, down: 0.055 }),
    aim: head.local({ forward: 0.55, down: 0.14 }),
    role: "jaw",
    group: "head",
  });

  // Four sturdy, slightly splayed legs.
  const legData: Array<{
    side: number;
    label: string;
    root: [number, number, number];
    target: [number, number, number];
    lengths: number[];
    bends: [number, number, number][];
  }> = [
    {
      side: 1,
      label: "frontL",
      root: [0.27, 0.94, 0.43],
      target: [0.30, 0.105, 0.59],
      lengths: [0.34, 0.31, 0.25],
      bends: [
        [0, 0, 1],
        [0, 0, -1],
      ],
    },
    {
      side: -1,
      label: "frontR",
      root: [-0.27, 0.94, 0.43],
      target: [-0.30, 0.105, 0.59],
      lengths: [0.34, 0.31, 0.25],
      bends: [
        [0, 0, 1],
        [0, 0, -1],
      ],
    },
    {
      side: 1,
      label: "hindL",
      root: [0.27, 0.83, -0.40],
      target: [0.30, 0.105, -0.55],
      lengths: [0.31, 0.28, 0.20],
      bends: [
        [0, 0, 1],
        [0, 0, -1],
      ],
    },
    {
      side: -1,
      label: "hindR",
      root: [-0.27, 0.83, -0.40],
      target: [-0.30, 0.105, -0.55],
      lengths: [0.31, 0.28, 0.20],
      bends: [
        [0, 0, 1],
        [0, 0, -1],
      ],
    },
  ];

  const legs: Array<{
    label: string;
    chain: any;
    toes: any[];
    target: [number, number, number];
  }> = [];

  for (const leg of legData) {
    const points = limb(leg.root, leg.target, leg.lengths, leg.bends, {
      sole: [0, 1, 0],
    });

    const chain = b.chain(`leg${leg.label}`, points, {
      parent: hips,
      names: [`hip${leg.label}`, `knee${leg.label}`, `ankle${leg.label}`, `foot${leg.label}`],
      role: "leg",
      contact: leg.target,
      group: "legs",
    });

    const foot = points[points.length - 1];
    const toes: any[] = [];

    for (let toe = 0; toe < 2; toe++) {
      const spread = toe === 0 ? -0.045 : 0.045;
      const toeStart: [number, number, number] = [
        foot.x + spread * 0.35,
        foot.y + 0.01,
        foot.z + 0.03,
      ];
      const toeEnd: [number, number, number] = [
        foot.x + spread,
        0.09,
        foot.z + 0.14 + toe * 0.025,
      ];
      const toePath = polyline([toeStart, toeEnd]);
      const toeChain = b.chain(`digit${leg.label}${toe + 1}`, toePath, {
        parent: chain.joints[chain.joints.length - 1],
        names: [`toe${leg.label}${toe + 1}`],
        role: "digit",
        group: "digits",
      });
      toes.push(toeChain);
    }

    legs.push({ label: leg.label, chain, toes, target: leg.target });
  }

  const tailPath = catmull([
    [0, 0.87, -0.55],
    [0, 0.84, -0.70],
    [0, 0.80, -0.84],
    [0, 0.78, -0.97],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 4,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "body",
  });

  // Dream wisps are tentacle-like spirit appendages, kept apart and extended in the rest pose.
  const wispLPath = catmull([
    jaw.at,
    [0.08, 1.26, 1.43],
    [0.18, 1.39, 1.58],
    [0.10, 1.57, 1.75],
    [0.28, 1.68, 1.90],
  ]);

  const wispRPath = catmull([
    jaw.at,
    [-0.08, 1.26, 1.43],
    [-0.20, 1.38, 1.57],
    [-0.14, 1.56, 1.77],
    [-0.31, 1.70, 1.92],
  ]);

  const wispL = b.chain("dreamWispL", wispLPath, {
    parent: jaw,
    count: 4,
    names: ["wispL1", "wispL2", "wispL3", "wispL4"],
    role: "tentacle",
    group: "dream",
  });

  const wispR = b.chain("dreamWispR", wispRPath, {
    parent: jaw,
    count: 4,
    names: ["wispR1", "wispR2", "wispR3", "wispR4"],
    role: "tentacle",
    group: "dream",
  });

  // A tiny rest-pose jaw opening makes the separate jaw readable for riggers and in silhouette.
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  // -------------------------------------------------------------------------------------------------------------
  // Main body: a broad, low-poly torso with a pale underside painted into the same surface.

  const torsoStations = [
    { at: [0, 0.87, -0.56], w: 0.52, h: 0.56 },
    { at: [0, 0.89, -0.25], w: 0.66, h: 0.66 },
    { at: [0, 0.94, 0.08], w: 0.72, h: 0.70 },
    { at: [0, 0.99, 0.37], w: 0.63, h: 0.64 },
    { at: [0, 1.02, 0.57], w: 0.49, h: 0.56 },
  ];

  const torso = b.loft(torsoStations, {
    bone: spine,
    color: BELLY,
    name: "broad_inked_torso",
    group: "body",
    section: { ngon: 8 },
  });

  const neckTube = b.sweep(neck, (t) => 0.255 - t * 0.055, {
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "indigo_neck",
    group: "body",
  });

  const tailTube = b.sweep(tail, (t) => 0.105 - t * 0.072, {
    color: gradient(COAT, PLUM_DARK, tail.at(0).at, tail.at(1).at),
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "short_spirit_tail",
    group: "body",
  });

  // Cream bib under the neck, kept as a soft overlapping low-poly volume.
  sphere(
    b,
    [0, 1.12, 0.61],
    [0.225, 0.31, 0.18],
    MUZZLE,
    neck.joints[1],
    "cream_throat_bib",
    12,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Head and face, built before the ears and mane so the expression remains unobstructed.

  const skull = sphere(
    b,
    head.at,
    [0.315, 0.315, 0.34],
    COAT,
    head,
    "faceted_baku_skull",
    16,
  );

  const upperSnoutStart = head.local({ forward: 0.06, down: 0.005 });
  const upperSnoutEnd = head.local({ forward: 0.56, down: 0.13 });

  const upperSnout = b.sweep(
    bezier(
      upperSnoutStart,
      head.local({ forward: 0.22, down: 0.03 }),
      head.local({ forward: 0.42, down: 0.09 }),
      upperSnoutEnd,
    ),
    [0.18, 0.105],
    {
      bone: head,
      color: MUZZLE,
      section: { ngon: 8 },
      caps: { start: "round", end: "flat" },
      name: "long_cream_trunk",
      group: "face",
    },
  );

  const lowerSnout = b.sweep(
    bezier(
      jaw.at,
      jaw.local({ forward: 0.17, down: 0.015 }),
      jaw.local({ forward: 0.39, down: 0.04 }),
      jaw.local({ forward: 0.53, down: 0.10 }),
    ),
    [0.125, 0.065],
    {
      bone: jaw,
      color: MUZZLE,
      section: { ngon: 8 },
      caps: { start: "round", end: "flat" },
      name: "separate_lower_jaw",
      group: "face",
    },
  );

  const nosePoint = upperSnoutEnd.clone();
  sphere(
    b,
    nosePoint,
    [0.125, 0.10, 0.095],
    NOSE,
    head,
    "soft_black_nose",
    12,
  );

  // Nose bridge and nostrils make the tapir silhouette legible from three-quarter view.
  inkRod(
    b,
    head.local({ forward: 0.38, down: 0.085 }),
    nosePoint,
    0.012,
    "nose_bridge_ink",
    INK_SOFT,
  );

  for (const s of [1, -1]) {
    sphere(
      b,
      [s * 0.052, 1.156, 1.385],
      [0.022, 0.016, 0.012],
      INK,
      head,
      `nostril${s > 0 ? "L" : "R"}`,
      8,
    );
  }

  // A graphic ink line between upper and lower jaws.
  inkRod(
    b,
    [-0.088, 1.155, 1.423],
    [0.088, 1.155, 1.423],
    0.009,
    "mouth_block_line",
    INK,
  );

  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(s * 41, 6);
    if (eyeHit) {
      b.decal(headSurface, EYE_TEXTURE, {
        at: eyeHit,
        size: [0.115, 0.145],
        lift: 0.004,
        mirror: s > 0,
        name: `large_woodblock_eye_${s > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  const browHit = headSurface.around(head.at).at(0, 34);
  if (browHit) {
    b.decal(headSurface, FOREHEAD_TEXTURE, {
      at: browHit,
      size: [0.13, 0.13],
      lift: 0.006,
      name: "forehead_dream_seal",
      group: "face",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tall rounded tapir ears with red woodblock interiors and gold linework.

  const earOutline: [number, number, "sharp"][] = [
    [-0.13, 0, "sharp"],
    [0.12, 0, "sharp"],
    [0.135, 0.11, "sharp"],
    [0.095, 0.24, "sharp"],
    [0.015, 0.33, "sharp"],
    [-0.075, 0.25, "sharp"],
    [-0.13, 0.11, "sharp"],
  ];

  const innerEarOutline: [number, number, "sharp"][] = [
    [-0.075, 0.025, "sharp"],
    [0.07, 0.025, "sharp"],
    [0.08, 0.12, "sharp"],
    [0.025, 0.255, "sharp"],
    [-0.06, 0.14, "sharp"],
  ];

  for (const s of [1, -1]) {
    const earAt = head.local({
      left: s * 0.22,
      up: 0.11,
      back: -0.045,
    });

    b.extrude(earOutline, {
      at: earAt,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.052,
      bevel: 0.008,
      color: EAR_OUTER,
      bone: head,
      name: `rounded_ear_${s > 0 ? "L" : "R"}`,
      group: "head",
    });

    const innerAt = earAt.clone().add(new THREE.Vector3(0, 0.005, 0.028));
    b.extrude(innerEarOutline, {
      at: innerAt,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: VERMILION,
      bone: head,
      name: `vermilion_inner_ear_${s > 0 ? "L" : "R"}`,
      group: "head",
    });

    const earHit = b.surface(b.root).nearest(innerAt.clone().add(new THREE.Vector3(0, 0, 0.02)));
    if (earHit) {
      b.decal(b.root, EAR_PATTERN, {
        at: earHit,
        size: [0.105, 0.16],
        lift: 0.003,
        mirror: s > 0,
        name: `gold_ear_pattern_${s > 0 ? "L" : "R"}`,
        group: "head",
      });
    }
  }

  // Inked whisker rods, deliberately sparse like carved print marks.
  for (const s of [1, -1]) {
    inkRod(
      b,
      [s * 0.095, 1.245, 1.39],
      [s * 0.24, 1.27, 1.47],
      0.006,
      `whisker_upper_${s > 0 ? "L" : "R"}`,
      INK,
    );
    inkRod(
      b,
      [s * 0.10, 1.20, 1.42],
      [s * 0.26, 1.18, 1.49],
      0.005,
      `whisker_lower_${s > 0 ? "L" : "R"}`,
      INK_SOFT,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Neck ruff and dorsal mane: broad triangular cuts, not smooth hair.

  const ruffLine = line(head.at, head.local({ forward: 0.02 }));
  const ruff = b.ring(
    ruffLine,
    {
      count: 14,
      radius: 0.265,
      fromDeg: 12,
      toDeg: 348,
      tilt: -8,
      name: "head_ruff",
      role: "fan",
      group: "mane",
    },
    (item: any) => {
      const length = item.i % 3 === 0 ? 0.13 : 0.095;
      addFurSpike(b, item, length, 0.028, MANE_PAINT, `ruff_tuft_${item.i}`);
    },
  );

  const torsoSurface = b.surface(torso);
  const maneTs = [0.04, 0.15, 0.27, 0.39, 0.51, 0.63, 0.74, 0.84, 0.92];

  for (let i = 0; i < maneTs.length; i++) {
    const t = maneTs[i];
    const center = spine.at(t).at;
    const hit = torsoSurface.around(center).at(0, 76);
    if (!hit) continue;

    const width = i < 2 ? 0.12 : i > 6 ? 0.085 : 0.15;
    const height = i < 2 ? 0.10 : i > 6 ? 0.15 : 0.18;

    b.extrude(
      [
        [-width * 0.5, 0, "sharp"],
        [width * 0.5, 0, "sharp"],
        [width * 0.28, height * 0.58, "sharp"],
        [0, height, "sharp"],
        [-width * 0.30, height * 0.55, "sharp"],
      ],
      {
        at: hit,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: [0.025, 0.012],
        bevel: 0.004,
        color: MANE_PAINT,
        name: `dorsal_mane_blade_${i}`,
        group: "mane",
      },
    );
  }

  // Small ink bristles along the shoulder transition.
  for (let i = 0; i < 5; i++) {
    const t = 0.50 + i * 0.055;
    const hit = torsoSurface.around(spine.at(t).at).at(0, 67);
    if (hit) addFurSpike(b, hit, 0.075 + i * 0.008, 0.018, PLUM_DARK, `shoulder_bristle_${i}`);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs: segmented low-poly tubes, cream socks, heavy dark hooves, and separated toes.

  for (const entry of legs) {
    const leg = entry.chain;

    b.sweep(leg, (t) => 0.105 - 0.038 * t, {
      color: COAT,
      bands: [[0.63, CREAM]],
      section: { ngon: 6 },
      caps: "round",
      name: `${entry.label}_coat_and_sock`,
      group: "legs",
    });

    const foot = leg.tip.at;
    b.part(new THREE.BoxGeometry(0.135, 0.09, 0.18), HOOF, {
      at: foot,
      bone: leg.tip,
      name: `${entry.label}_flat_hoof`,
      group: "legs",
      flat: true,
    });

    // A vermilion carved sole mark.
    b.part(new THREE.BoxGeometry(0.075, 0.008, 0.11), VERMILION, {
      at: [foot.x, 0.098, foot.z + 0.018],
      bone: leg.tip,
      name: `${entry.label}_sole_mark`,
      group: "legs",
      flat: true,
    });

    for (let i = 0; i < entry.toes.length; i++) {
      const toe = entry.toes[i];
      b.sweep(toe, [0.033, 0.012], {
        bone: toe,
        color: HOOF,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `${entry.label}_toe_${i + 1}`,
        group: "digits",
      });
    }
  }

  // Decorative ink cuffs where the cream socks meet the indigo legs.
  for (const entry of legs) {
    const leg = entry.chain;
    const cuffAt = leg.at(0.62);
    inkRod(
      b,
      cuffAt.moved([0.0, 0.0, -0.102]),
      cuffAt.moved([0.0, 0.0, 0.102]),
      0.009,
      `${entry.label}_sock_ink_cuff`,
      INK,
    );
  }

  // Tail tip: a little fan-shaped seal rather than a realistic tuft.
  const tailTip = tail.joints[tail.joints.length - 1].at;
  const tailFan = b.ring(
    frame(tailTip, tail.joints[tail.joints.length - 1].dir([0, 0, -1])),
    {
      count: 7,
      radius: 0.045,
      fromDeg: 35,
      toDeg: 325,
      tilt: -18,
      name: "tail_tip_fan",
      role: "fan",
      group: "tail",
    },
    (item: any) => addFurSpike(b, item, 0.075, 0.015, PLUM, `tail_fan_${item.i}`),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Ukiyo-e marks: scattered carved dots and a few gold charms on the torso.

  const markHits = torsoSurface.scatter(24, {
    rng: rng(76),
    minDist: 0.085,
    filter: (hit: any) => hit.n.y > 0.1 && hit.n.z < 0.8,
  });

  for (let i = 0; i < markHits.length; i++) {
    const hit = markHits[i];
    const radius = i % 4 === 0 ? 0.025 : 0.017;
    b.stick(
      new THREE.CylinderGeometry(radius, radius * 0.82, 0.009, 7),
      i % 3 === 0 ? PLUM : BLUE,
      hit,
      {
        embed: 0.4,
        name: `carved_coat_mark_${i}`,
        group: "body_marks",
      },
    );
  }

  const charmHit = torsoSurface.around([0, 0.95, 0.38]).at(0, 18);
  if (charmHit) {
    b.stick(new THREE.CylinderGeometry(0.10, 0.10, 0.018, 12), GOLD_DARK, charmHit, {
      embed: 0.25,
      name: "chest_charm_mount",
      group: "charms",
    });
    b.decal(torsoSurface, CHARM_TEXTURE, {
      at: charmHit.moved([0, 0.012, 0]),
      size: [0.16, 0.16],
      lift: 0.003,
      name: "chest_dream_charm",
      group: "charms",
    });
  }

  // A second smaller charm hangs under the jaw on an ink cord.
  const charmAnchor = jaw.local({ forward: 0.12, down: -0.02 });
  inkRod(b, head.local({ forward: 0.10, down: -0.02 }), charmAnchor, 0.006, "charm_cord", INK);
  b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 10), GOLD, {
    at: charmAnchor,
    bone: jaw,
    dir: [0, 0, 1],
    name: "hanging_gold_charm",
    group: "charms",
  });
  b.part(new THREE.CircleGeometry(0.038, 16), DREAM_WHITE, {
    at: charmAnchor.clone().add(new THREE.Vector3(0, 0, 0.012)),
    bone: jaw,
    dir: [0, 0, 1],
    axis: "z",
    texture: CHARM_TEXTURE,
    name: "hanging_charm_face",
    group: "charms",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Dream wisps emerging from the open mouth. These are the fantastical signature silhouette.

  const dreamSweepL = b.sweep(wispL, (t) => 0.020 - t * 0.014, {
    color: DREAM_RIBBON,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "luminous_dream_wisp_L",
    group: "dream",
  });

  const dreamSweepR = b.sweep(wispR, (t) => 0.020 - t * 0.014, {
    color: DREAM_RIBBON,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "luminous_dream_wisp_R",
    group: "dream",
  });

  glow(dreamSweepL, 1.15);
  glow(dreamSweepR, 1.15);

  const wispFramesL: any[] = [];
  const wispFramesR: any[] = [];

  b.along(wispL, 5, (at: any) => {
    wispFramesL.push(at);
  });

  b.along(wispR, 5, (at: any) => {
    wispFramesR.push(at);
  });

  const dreamCardsL = b.cards(wispFramesL, DREAM_GLYPH, {
    size: [0.065, 0.11],
    lean: 52,
    bend: 28,
    vary: 0.22,
    spin: 24,
    rng: rng(91),
    color: DREAM_WHITE,
    group: "dream_cards",
  });

  const dreamCardsR = b.cards(wispFramesR, DREAM_GLYPH, {
    size: [0.065, 0.11],
    lean: 52,
    bend: 28,
    vary: 0.22,
    spin: -24,
    rng: rng(92),
    color: GOLD,
    mirror: true,
    group: "dream_cards",
  });

  glow(dreamCardsL, 1.3);
  glow(dreamCardsR, 1.2);

  // Tiny floating dream motes near the rising curls.
  const motePositions: Array<[number, number, number]> = [
    [0.35, 1.50, 1.70],
    [-0.42, 1.55, 1.76],
    [0.45, 1.76, 1.94],
    [-0.48, 1.80, 1.98],
    [0.22, 1.88, 2.04],
  ];

  for (let i = 0; i < motePositions.length; i++) {
    const p = motePositions[i];
    const mote = b.part(new THREE.OctahedronGeometry(0.025, 0), i % 2 ? GOLD : DREAM_WHITE, {
      at: p,
      bone: jaw,
      name: `floating_dream_mote_${i}`,
      group: "dream",
      flat: true,
    });
    glow(mote, 1.5);
  }

  // -------------------------------------------------------------------------------------------------------------
  // A handful of graphic contour lines give the large forms the look of carved woodblock layers.

  const bellyLine = torsoSurface.loop(spine.at(0.42), {
    lift: 0.006,
  });

  b.sweep(bellyLine, 0.008, {
    color: INK,
    section: { ngon: 5 },
    caps: "none",
    name: "belly_contour_ink",
    group: "ink_lines",
  });

  const neckLine = b.surface(neckTube).loop(neck.at(0.45), {
    lift: 0.006,
  });

  b.sweep(neckLine, 0.007, {
    color: INK,
    section: { ngon: 5 },
    caps: "none",
    name: "neck_contour_ink",
    group: "ink_lines",
  });

  // Shoulder and haunch crescent cuts.
  for (const s of [1, -1]) {
    const shoulderA: [number, number, number] = [s * 0.33, 0.91, 0.38];
    const shoulderB: [number, number, number] = [s * 0.35, 0.78, 0.20];
    inkRod(b, shoulderA, shoulderB, 0.009, `shoulder_crescent_${s > 0 ? "L" : "R"}`, INK_SOFT);

    const haunchA: [number, number, number] = [s * 0.34, 0.78, -0.24];
    const haunchB: [number, number, number] = [s * 0.35, 0.63, -0.42];
    inkRod(b, haunchA, haunchB, 0.009, `haunch_crescent_${s > 0 ? "L" : "R"}`, INK_SOFT);
  }

  // A few flat gold studs around the collar, placed from live tube hits.
  const collarHits = b.surface(neckTube).scatter(8, {
    rng: rng(111),
    minDist: 0.10,
    filter: (hit: any) => hit.n.y > 0.0,
  });

  for (let i = 0; i < collarHits.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.018, 7, 5),
      GOLD,
      collarHits[i],
      {
        embed: 0.45,
        name: `collar_gold_stud_${i}`,
        group: "charms",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Small graphic cards along the mane act like painted paper streamers in the spirit's aura.

  const maneFrames: any[] = [];
  b.along(spine, 6, (at: any) => {
    maneFrames.push(
      frame(
        at.at.clone().add(new THREE.Vector3(0, 0.09, 0)),
        [0, 1, 0],
      ),
    );
  });

  const maneCards = b.cards(maneFrames, DREAM_GLYPH, {
    size: [0.035, 0.075],
    lean: 78,
    bend: 14,
    vary: 0.18,
    color: "#b88a68",
    mirror: false,
    rng: rng(121),
    group: "mane_streamers",
  });

  // Final ink outline at the nose tip.
  b.part(new THREE.TorusGeometry(0.106, 0.008, 5, 12), INK, {
    at: nosePoint,
    bone: head,
    dir: [0, 0, 1],
    name: "nose_carved_rim",
    group: "face",
  });

  return b.root;
}
