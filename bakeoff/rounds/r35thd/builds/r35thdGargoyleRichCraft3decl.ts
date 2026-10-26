import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  grain,
  limb,
  mottle,
  paint,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle carved from faceted primitives, perched on a broken cathedral ledge with spread bat wings, horns, claws, fangs, carved runes, and glowing eyes.",
};

const STONE_DARK = "#252832";
const STONE_DEEP = "#171922";
const STONE_MID = "#50545d";
const STONE_LIGHT = "#898b8b";
const STONE_HIGHLIGHT = "#b8b5a7";
const CREVICE = "#11131b";
const EYE_GOLD = "#e6a63d";
const EYE_GLOW = "#ffcf66";
const TOOTH = "#c5c0ae";
const RUNE_INK = "#392f42";
const LEDGE_DARK = "#30323a";

const stoneBase = mottle(STONE_MID, STONE_LIGHT, {
  size: 0.19,
  contrast: 1.25,
  seed: 31,
});

const stoneTexture = countershade(
  scales(stoneBase, STONE_DARK, {
    size: 0.14,
    width: 0.08,
    seed: 43,
  }),
  mottle(STONE_DARK, STONE_MID, {
    size: 0.22,
    contrast: 1.1,
    seed: 47,
  }),
  { level: -0.08, soft: 0.42 },
);

const stoneRough = countershade(
  mottle(STONE_MID, STONE_DARK, {
    size: 0.11,
    contrast: 1.35,
    seed: 57,
  }),
  STONE_DEEP,
  { level: -0.18, soft: 0.28 },
);

const stonePale = countershade(
  mottle(STONE_LIGHT, STONE_HIGHLIGHT, {
    size: 0.16,
    contrast: 1.15,
    seed: 67,
  }),
  STONE_MID,
  { level: 0.05, soft: 0.38 },
);

const stoneGrain = grain(STONE_MID, STONE_LIGHT, {
  size: 0.08,
  axis: [0, 1, 0],
  seed: 73,
});

const ledgePaint = countershade(
  mottle("#4b4d54", "#77756f", {
    size: 0.2,
    contrast: 1.2,
    seed: 81,
  }),
  "#292b32",
  { level: -0.1, soft: 0.36 },
);

const eyeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 112">
    <defs>
      <radialGradient id="iris" cx="48%" cy="42%" r="62%">
        <stop offset="0" stop-color="#fff3a3"/>
        <stop offset=".32" stop-color="#f3b83e"/>
        <stop offset=".72" stop-color="#a94f18"/>
        <stop offset="1" stop-color="#401a19"/>
      </radialGradient>
      <linearGradient id="lid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#211624"/>
        <stop offset=".55" stop-color="#412238"/>
        <stop offset="1" stop-color="#120f18"/>
      </linearGradient>
    </defs>
    <path d="M12 64 Q42 8 82 14 Q125 12 150 58 Q122 102 81 99 Q39 102 12 64Z"
      fill="#17131d" stroke="#08090d" stroke-width="8" stroke-linejoin="round"/>
    <path d="M19 59 Q48 15 82 20 Q119 17 143 57 Q119 86 82 88 Q45 89 19 59Z"
      fill="url(#lid)"/>
    <ellipse cx="82" cy="58" rx="30" ry="34" fill="url(#iris)" stroke="#170d17" stroke-width="5"/>
    <ellipse cx="84" cy="58" rx="7" ry="30" fill="#110b13"/>
    <path d="M52 24 Q85 7 118 28 Q99 40 82 40 Q65 39 52 24Z" fill="#5d2d2e" opacity=".72"/>
    <ellipse cx="68" cy="38" rx="10" ry="13" fill="#fff7d0"/>
    <circle cx="101" cy="77" r="6" fill="#fff7d0"/>
    <path d="M17 47 Q7 35 3 22 M20 57 Q8 53 2 45 M20 68 Q8 73 3 83"
      stroke="#17131d" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M43 11 Q81 -2 119 12" stroke="#0c0b12" stroke-width="8" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 384 },
);

const runeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <defs>
      <radialGradient id="r" cx=".5" cy=".4" r=".65">
        <stop offset="0" stop-color="#fff0b2"/>
        <stop offset=".35" stop-color="#b7894d"/>
        <stop offset="1" stop-color="#3e2b3d"/>
      </radialGradient>
    </defs>
    <circle cx="128" cy="128" r="116" fill="none" stroke="#17121e" stroke-width="17"/>
    <circle cx="128" cy="128" r="99" fill="none" stroke="url(#r)" stroke-width="8"/>
    <path d="M128 30 L142 91 L194 62 L163 112 L225 128 L163 143 L194 194 L143 163 L128 226 L112 163 L61 194 L91 143 L30 128 L91 112 L61 62 L112 91Z"
      fill="none" stroke="url(#r)" stroke-width="10" stroke-linejoin="round"/>
    <path d="M128 76 L128 180 M76 128 L180 128 M91 91 L165 165 M165 91 L91 165"
      stroke="#e8c87e" stroke-width="5" opacity=".9"/>
    <circle cx="128" cy="128" r="19" fill="#24172a" stroke="#f5d789" stroke-width="6"/>
  </svg>`,
  { size: 256 },
);

const crackTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 192">
    <path d="M64 0 L58 35 L72 57 L52 78 L61 102 L37 126 L45 151 L19 192"
      fill="none" stroke="#15151d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M59 37 L31 48 M54 77 L91 69 M60 102 L94 118 M40 127 L7 136"
      fill="none" stroke="#15151d" stroke-width="5" stroke-linecap="round"/>
    <path d="M63 4 L59 32 M57 79 L62 99" fill="none" stroke="#d0c5a0" stroke-width="2" opacity=".45"/>
  </svg>`,
  { size: 192 },
);

const mouthTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100">
    <path d="M8 45 Q55 4 110 17 Q164 4 212 45 Q167 92 111 84 Q53 92 8 45Z"
      fill="#090912" stroke="#302034" stroke-width="8"/>
    <path d="M22 43 Q67 25 109 30 Q154 25 198 43 Q160 61 111 58 Q59 62 22 43Z"
      fill="#501d26"/>
    <path d="M39 29 L49 49 L59 27 L69 47 L79 26 L89 45 L100 25 L111 44 L122 25 L133 46 L144 27 L155 48 L166 30"
      fill="#d8d0ba" stroke="#7b706c" stroke-width="2"/>
    <path d="M67 66 L77 50 L87 68 L98 52 L109 70 L120 52 L131 68 L143 50 L154 64"
      fill="#a9a39a" stroke="#5e5961" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const stoneGlyphTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M63 8 L72 43 L106 27 L82 57 L119 65 L82 72 L104 103 L72 86 L64 120 L54 86 L23 103 L46 72 L9 64 L46 57 L22 27 L55 43Z"
      fill="none" stroke="#d1b57c" stroke-width="7" stroke-linejoin="round"/>
    <path d="M63 28 L63 101 M28 64 L100 64" stroke="#8e6e53" stroke-width="4"/>
    <circle cx="63" cy="64" r="9" fill="#221728" stroke="#f0cf83" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

function addBox(
  b: ReturnType<typeof createBuilder>,
  size: readonly [number, number, number],
  at: THREE.Vector3 | readonly number[],
  color: any,
  bone: any,
  name: string,
  rotation?: readonly [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    rotation,
    flat: true,
    name,
  });
}

function addStoneSphere(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | readonly number[],
  scale: readonly [number, number, number],
  color: any,
  bone: any,
  name: string,
  detail = 1,
) {
  return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function addClaw(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3 | readonly number[],
  tip: THREE.Vector3 | readonly number[],
  radius: number,
  bone: any,
  name: string,
) {
  return b.spike(base, tip, null, radius, {
    color: stonePale,
    bone,
    caps: { start: "round", end: "point" },
    name,
  });
}

function addTooth(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3 | readonly number[],
  direction: THREE.Vector3 | readonly number[],
  length: number,
  radius: number,
  bone: any,
  name: string,
) {
  return b.spike(base, direction, length, radius, {
    color: TOOTH,
    bone,
    caps: { start: "round", end: "point" },
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "cathedral-gargoyle",
    detail: 0.82,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a crouched spine and neck, hind legs, reaching forelegs, wings, tail, jaw, and digits.

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.18],
    dir: [0, 0.1, 1],
    role: "spine",
    group: "body",
  });

  const torso = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.23],
      [0, 0.91, -0.13],
      [0, 1.06, -0.01],
      [0, 1.17, 0.12],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "chestTip"],
      role: "spine",
      group: "body",
    },
  );

  const chest = torso.tip!;

  const neck = b.chain(
    "neck",
    catmull([
      chest.at,
      [0, 1.28, 0.19],
      [0, 1.39, 0.29],
      [0, 1.48, 0.36],
    ]),
    {
      parent: chest,
      names: ["neckBase", "neckMid", "neckTop", "neckTip"],
      role: "neck",
      group: "head",
    },
  );

  const headJoint = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.5, 0.39],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: headJoint,
    at: [0, 1.43, 0.49],
    aim: [0, 1.36, 0.72],
    role: "jaw",
    group: "head",
  });

  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: -11,
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.31],
      [0, 0.71, -0.52],
      [0.02, 0.63, -0.76],
      [0.07, 0.54, -1.01],
      [0.13, 0.43, -1.22],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      group: "body",
      contact: [0.13, 0.28, -1.22],
    },
  );

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const wings: Record<string, ReturnType<typeof b.chain>> = {};

  for (const side of [1, -1]) {
    const key = side === 1 ? "L" : "R";

    const hindPoints = limb(
      [side * 0.24, 0.82, -0.16],
      [side * 0.31, 0.33, 0.29],
      [0.3, 0.29, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    legs[key] = b.chain(`leg${key}`, hindPoints, {
      parent: hips,
      names: [`hip${key}`, `knee${key}`, `hock${key}`, `foot${key}`],
      role: "leg",
      group: "limbs",
      contact: [side * 0.31, 0.28, 0.29],
    });

    const forePoints = limb(
      [side * 0.27, 1.09, 0.1],
      [side * 0.34, 0.34, 0.48],
      [0.34, 0.31, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    arms[key] = b.chain(`arm${key}`, forePoints, {
      parent: chest,
      names: [`shoulder${key}`, `elbow${key}`, `wrist${key}`, `hand${key}`],
      role: "arm",
      group: "limbs",
      contact: [side * 0.34, 0.28, 0.48],
    });

    const wingPath = catmull([
      [side * 0.3, 1.15, 0.02],
      [side * 0.55, 1.41, -0.02],
      [side * 0.78, 1.68, -0.11],
      [side * 1.01, 1.9, -0.19],
    ]);

    wings[key] = b.chain(`wing${key}`, wingPath, {
      parent: chest,
      names: [`wingRoot${key}`, `wingKnuckle${key}`, `wingElbow${key}`, `wingTip${key}`],
      role: "wing",
      group: "wings",
    });

    // Three separated stone digits on each hand.
    const hand = arms[key].tip!;
    for (let finger = 0; finger < 3; finger++) {
      const spread = (finger - 1) * 0.055;
      const start = hand.local([spread, 0.02, 0.03]);
      const tip = [side * (0.34 + spread * 0.35), 0.29, 0.57 + finger * 0.035] as const;
      const digit = b.chain(
        `finger${key}${finger + 1}`,
        [start, [side * (0.34 + spread * 0.18), 0.31, 0.51], tip],
        {
          parent: hand,
          names: [`finger${key}${finger + 1}`, `finger${key}${finger + 1}Tip`],
          role: "digit",
          group: "limbs",
        },
      );
    }

    // Four short splayed toes on each foot.
    const foot = legs[key].tip!;
    for (let toe = 0; toe < 4; toe++) {
      const spread = (toe - 1.5) * 0.045;
      const start = foot.local([spread, 0, 0.04]);
      const tip = [
        side * (0.31 + spread * 1.2),
        0.285,
        0.48 + toe * 0.045,
      ] as const;
      b.chain(
        `toe${key}${toe + 1}`,
        [start, [side * (0.31 + spread * 0.9), 0.295, 0.39 + toe * 0.03], tip],
        {
          parent: foot,
          names: [`toe${key}${toe + 1}`, `toe${key}${toe + 1}Tip`],
          role: "digit",
          group: "limbs",
        },
      );
    }

    // A lower wing finger gives the bat wing its hooked cathedral silhouette.
    const wing = wings[key];
    const fingerStart = wing.at(0.43);
    b.chain(
      `wingFinger${key}`,
      [
        fingerStart.at,
        [side * 0.89, 1.57, -0.17],
        [side * 1.13, 1.48, -0.19],
      ],
      {
        parent: fingerStart.bone,
        names: [`wingFinger${key}`, `wingFinger${key}Tip`],
        role: "digit",
        group: "wings",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ledge and architectural base.

  addBox(b, [1.72, 0.26, 1.08], [0, 0.13, 0], ledgePaint, hips, "ledgeMain");
  addBox(b, [1.9, 0.085, 0.13], [0, 0.305, 0.51], ledgePaint, hips, "ledgeFrontLip");
  addBox(b, [1.52, 0.09, 0.16], [0, 0.285, -0.51], STONE_DARK, hips, "ledgeRearLip");

  addBox(b, [0.38, 0.11, 0.18], [-0.61, 0.31, 0.31], stoneRough, hips, "ledgeBlockL");
  addBox(b, [0.35, 0.11, 0.18], [0.09, 0.31, 0.31], stoneRough, hips, "ledgeBlockC");
  addBox(b, [0.42, 0.11, 0.18], [0.65, 0.31, 0.31], stoneRough, hips, "ledgeBlockR");

  b.rod(
    [-0.82, 0.325, 0.56],
    [-0.26, 0.325, 0.56],
    0.009,
    CREVICE,
    { bone: hips, name: "ledgeCrackL" },
  );
  b.rod(
    [0.13, 0.325, 0.56],
    [0.76, 0.325, 0.56],
    0.008,
    CREVICE,
    { bone: hips, name: "ledgeCrackR" },
  );
  b.rod(
    [-0.06, 0.285, -0.51],
    [0.25, 0.285, -0.51],
    0.009,
    CREVICE,
    { bone: hips, name: "ledgeRearCrack" },
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.CylinderGeometry(0.1, 0.12, 0.16, 6),
      stonePale,
      {
        at: [side * 0.78, 0.38, -0.38],
        bone: hips,
        flat: true,
        name: `ledgeFinial${side === 1 ? "L" : "R"}`,
      },
    );
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.08, 0.055],
        [0.035, 0.18],
        [0, 0.25],
      ],
      {
        at: [side * 0.78, 0.48, -0.38],
        axis: [0, 1, 0],
        segments: 6,
        smoothing: 0,
        color: stoneRough,
        bone: hips,
        name: `finialSpire${side === 1 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main carved body, neck, haunches, and tail.

  const body = b.loft(
    [
      { at: [0, 0.76, -0.23], w: 0.43, h: 0.39 },
      { at: [0, 0.91, -0.12], w: 0.56, h: 0.47 },
      { at: [0, 1.06, -0.01], w: 0.52, h: 0.49 },
      { at: [0, 1.17, 0.12], w: 0.39, h: 0.42 },
    ],
    {
      bone: torso,
      color: stoneTexture,
      section: { ngon: 8 },
      smooth: false,
      caps: "round",
      group: "body",
      name: "carvedTorso",
    },
  );

  const neckTube = b.sweep(neck, [0.17, 0.12], {
    bone: neck,
    color: stoneTexture,
    section: { ngon: 8 },
    smooth: false,
    group: "head",
    name: "carvedNeck",
  });

  const tailTube = b.sweep(tail, (t) => 0.115 * (1 - t) + 0.022, {
    bone: tail,
    color: (t) => (t > 0.78 ? stonePale : stoneRough),
    bands: [[0.72, stonePale]],
    section: { ngon: 7 },
    smooth: false,
    caps: { start: "round", end: "point" },
    group: "body",
    name: "carvedTail",
  });

  addStoneSphere(b, [0.2, 0.82, -0.24], [0.27, 0.28, 0.3], stoneRough, hips, "haunchL", 1);
  addStoneSphere(b, [-0.2, 0.82, -0.24], [0.27, 0.28, 0.3], stoneRough, hips, "haunchR", 1);

  for (const side of [1, -1]) {
    addStoneSphere(
      b,
      [side * 0.28, 1.08, 0.08],
      [0.15, 0.18, 0.17],
      stonePale,
      chest,
      `shoulderMass${side === 1 ? "L" : "R"}`,
      1,
    );
  }

  // A ribbed belly plate makes the crouched silhouette legible from the front.
  for (let i = 0; i < 4; i++) {
    const y = 0.83 + i * 0.09;
    const width = 0.18 - i * 0.018;
    b.rod(
      [-width, y, 0.22 + i * 0.005],
      [width, y, 0.22 + i * 0.005],
      0.012,
      stonePale,
      {
        bone: torso.joints[Math.min(i, torso.joints.length - 1)],
        name: `bellyRib${i + 1}`,
      },
    );
  }

  b.along(tailTube, 6, (at) => {
    b.spike(at, at, 0.075 * (1 - at.t * 0.55), 0.022, {
      color: stonePale,
      name: `tailSpine${Math.round(at.t * 10)}`,
    });
  });

  b.along(body, 5, (at) => {
    b.spike(at, at, 0.055, 0.018, {
      color: stonePale,
      name: `backRidge${Math.round(at.t * 10)}`,
    });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Legs: heavy haunches, angular shins, broad feet, hooked stone claws.

  for (const side of [1, -1]) {
    const key = side === 1 ? "L" : "R";
    const leg = legs[key];

    b.sweep(leg, (t) => (t < 0.35 ? 0.105 : t < 0.72 ? 0.078 : 0.06), {
      bone: leg,
      color: stoneTexture,
      section: "box",
      smooth: false,
      caps: "round",
      group: "limbs",
      name: `legStone${key}`,
    });

    addStoneSphere(
      b,
      leg.at(0.18).at,
      [0.13, 0.13, 0.13],
      stonePale,
      leg.joints[0],
      `kneeCap${key}`,
      1,
    );

    const foot = leg.tip!;
    addBox(
      b,
      [0.18, 0.095, 0.28],
      foot.at,
      stonePale,
      foot,
      `footPad${key}`,
      [0, side * -0.16, 0],
    );

    for (let toe = 0; toe < 4; toe++) {
      const digit = b.chain(
        `toe${key}${toe + 1}`,
        [
          leg.at(1).at,
          [side * (0.31 + (toe - 1.5) * 0.04), 0.3, 0.42 + toe * 0.025],
          [side * (0.31 + (toe - 1.5) * 0.06), 0.285, 0.52 + toe * 0.04],
        ],
        {
          parent: foot,
          names: [`toeBone${key}${toe + 1}`, `toeBone${key}${toe + 1}Tip`],
          role: "digit",
          group: "limbs",
        },
      );
      b.sweep(digit, [0.027, 0.009], {
        bone: digit,
        color: stonePale,
        section: { ngon: 6 },
        smooth: false,
        caps: { start: "round", end: "point" },
        group: "limbs",
        name: `toeStone${key}${toe + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Reaching arms and hand claws.

  for (const side of [1, -1]) {
    const key = side === 1 ? "L" : "R";
    const arm = arms[key];

    b.sweep(arm, (t) => (t < 0.25 ? 0.078 : t < 0.7 ? 0.06 : 0.042), {
      bone: arm,
      color: stoneTexture,
      section: { ngon: 7 },
      smooth: false,
      caps: "round",
      group: "limbs",
      name: `armStone${key}`,
    });

    addStoneSphere(
      b,
      arm.at(0.18).at,
      [0.11, 0.11, 0.11],
      stonePale,
      arm.joints[0],
      `elbowKnuckle${key}`,
      1,
    );

    const hand = arm.tip!;
    addBox(b, [0.15, 0.085, 0.16], hand.at, stonePale, hand, `handPalm${key}`);

    for (let finger = 0; finger < 3; finger++) {
      const spread = (finger - 1) * 0.055;
      const fingerChain = b.chain(
        `finger${key}${finger + 1}`,
        [
          hand.local([spread, 0.01, 0.03]),
          [side * (0.34 + spread * 0.3), 0.31, 0.52 + finger * 0.035],
          [side * (0.34 + spread * 0.42), 0.29, 0.61 + finger * 0.035],
        ],
        {
          parent: hand,
          names: [`fingerBone${key}${finger + 1}`, `fingerTipBone${key}${finger + 1}`],
          role: "digit",
          group: "limbs",
        },
      );

      b.sweep(fingerChain, [0.022, 0.007], {
        bone: fingerChain,
        color: stonePale,
        section: { ngon: 6 },
        smooth: false,
        caps: { start: "round", end: "point" },
        group: "limbs",
        name: `fingerStone${key}${finger + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Bat wings: rigid faceted finger bones, double-edged membranes, ribs, hooked tips.

  const wingMembranes: Record<string, THREE.Mesh[]> = {};

  for (const side of [1, -1]) {
    const key = side === 1 ? "L" : "R";
    const wing = wings[key];

    b.sweep(wing, (t) => (t < 0.25 ? 0.072 : t < 0.62 ? 0.046 : 0.019), {
      bone: wing,
      color: stoneRough,
      section: { ngon: 7 },
      smooth: false,
      caps: { start: "round", end: "point" },
      group: "wings",
      name: `wingFingerBone${key}`,
    });

    const innerEdge = catmull([
      wing.at(0).at,
      [side * 0.39, 1.09, -0.12],
      [side * 0.58, 1.24, -0.19],
      [side * 0.79, 1.53, -0.2],
      wing.at(1).at,
    ]);

    wingMembranes[key] = b.membrane(wing, innerEdge, {
      color: countershade(stoneRough, STONE_DEEP, {
        level: -0.18,
        soft: 0.28,
      }),
      thickness: 0.014,
      rows: 5,
      cols: 7,
      scallop: 0.12,
      skin: "smooth",
      group: "wings",
      name: `wingMembrane${key}`,
    });

    const lowerFingerPath = catmull([
      wing.at(0.42).at,
      [side * 0.87, 1.56, -0.18],
      [side * 1.13, 1.48, -0.2],
    ]);

    const lowerInnerEdge = catmull([
      [side * 0.43, 1.07, -0.14],
      [side * 0.67, 1.2, -0.2],
      [side * 0.9, 1.28, -0.21],
      [side * 1.13, 1.48, -0.2],
    ]);

    b.membrane(lowerFingerPath, lowerInnerEdge, {
      color: stoneRough,
      thickness: 0.012,
      rows: 4,
      cols: 6,
      scallop: 0.18,
      skin: "smooth",
      group: "wings",
      name: `lowerWingMembrane${key}`,
    });

    b.rod(wing.at(0.05), wing.at(0.92), 0.012, stonePale, {
      name: `wingRibUpper${key}`,
      group: "wings",
    });
    b.rod(wing.at(0.28), wing.at(0.84, 0), 0.01, stonePale, {
      name: `wingRibMiddle${key}`,
      group: "wings",
    });
    b.rod(wing.at(0.44), [side * 1.08, 1.48, -0.2], 0.009, stonePale, {
      name: `wingRibLower${key}`,
      group: "wings",
    });

    addClaw(
      b,
      wing.at(1).at,
      [side * 1.1, 2.02, -0.23],
      0.025,
      wing.tip!,
      `wingHookTop${key}`,
    );
    addClaw(
      b,
      [side * 0.97, 1.59, -0.19],
      [side * 1.2, 1.47, -0.22],
      0.022,
      wing.tip!,
      `wingHookLower${key}`,
    );

    const membraneSurface = b.surface(wingMembranes[key]);
    const runeHit = membraneSurface.nearest([side * 0.69, 1.43, -0.18]);
    b.decal(membraneSurface, runeTexture, {
      at: runeHit.at,
      dir: runeHit.n,
      up: [0, 1, 0],
      size: [0.16, 0.16],
      lift: 0.003,
      mirror: side > 0,
      name: `wingRune${key}`,
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head and face: skull first, then eyes, muzzle, open jaw, nose, brows, ears, horns, cheek ruffs.

  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), stoneTexture, {
    bone: headJoint,
    at: headJoint.at,
    scale: [0.285, 0.265, 0.31],
    flat: true,
    group: "head",
    name: "gargoyleSkull",
  });

  const skullSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = skullSurface.around(headJoint.at).at(side * 22, 6);
    if (eyeHit) {
      const eye = b.decal(skullSurface, eyeTexture, {
        at: eyeHit.at,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.125, 0.088],
        segments: [7, 6],
        lift: 0.005,
        mirror: side > 0,
        name: `glowingEye${side === 1 ? "L" : "R"}`,
        group: "face",
      });
      glow(eye, 1.25);
    }

    b.rod(
      [side * 0.19, 1.61, 0.56],
      [side * 0.055, 1.67, 0.59],
      0.019,
      STONE_DEEP,
      {
        bone: headJoint,
        name: `heavyBrow${side === 1 ? "L" : "R"}`,
        group: "face",
      },
    );

    const cheekHit = skullSurface.around(headJoint.at).at(side * 55, -19);
    if (cheekHit) {
      for (let i = 0; i < 3; i++) {
        const ruff = cheekHit.moved([0, 0.004 + i * 0.003, (i - 1) * 0.045]);
        b.spike(ruff, ruff, 0.075 - i * 0.012, 0.026, {
          color: stonePale,
          name: `cheekRuff${side === 1 ? "L" : "R"}${i + 1}`,
          group: "face",
        });
      }
    }
  }

  const foreheadCrackHit = skullSurface.nearest([0, 1.68, 0.58]);
  b.decal(skullSurface, crackTexture, {
    at: foreheadCrackHit.at,
    dir: foreheadCrackHit.n,
    up: [0, 1, 0],
    size: [0.09, 0.14],
    lift: 0.004,
    name: "foreheadCarvedCrack",
    group: "face",
  });

  // Brow ridge blocks give the eyes a severe, predatory stone-carved expression.
  addStoneSphere(
    b,
    [-0.14, 1.62, 0.52],
    [0.13, 0.055, 0.075],
    stoneRough,
    headJoint,
    "browRidgeR",
    1,
  );
  addStoneSphere(
    b,
    [0.14, 1.62, 0.52],
    [0.13, 0.055, 0.075],
    stoneRough,
    headJoint,
    "browRidgeL",
    1,
  );

  // Pointed ears, built as thick carved plaques.
  const earOutline: [number, number, "sharp"][] = [
    [-0.105, 0, "sharp"],
    [-0.055, 0.19, "sharp"],
    [0, 0.3, "sharp"],
    [0.065, 0.15, "sharp"],
    [0.11, 0, "sharp"],
  ];

  for (const side of [1, -1]) {
    b.extrude(earOutline, {
      at: [side * 0.19, 1.62, 0.31],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      smoothing: 0,
      color: stonePale,
      bone: headJoint,
      name: `pointedEar${side === 1 ? "L" : "R"}`,
      group: "head",
    });

    b.extrude(
      [
        [-0.055, 0, "sharp"],
        [-0.018, 0.14, "sharp"],
        [0.01, 0.21, "sharp"],
        [0.04, 0.11, "sharp"],
        [0.057, 0, "sharp"],
      ],
      {
        at: [side * 0.197, 1.625, 0.315],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        color: stoneDeepPaint(),
        bone: headJoint,
        name: `earInset${side === 1 ? "L" : "R"}`,
        group: "head",
      },
    );
  }

  // Curving swept-back horns rooted on the crown.
  for (const side of [1, -1]) {
    const hornBase = skullSurface.around(headJoint.at).at(side * 53, 48);
    if (hornBase) {
      const hornPath = catmull([
        hornBase.at,
        [side * 0.29, 1.76, 0.29],
        [side * 0.35, 1.9, 0.11],
        [side * 0.31, 1.99, -0.08],
        [side * 0.21, 2.02, -0.18],
      ]);

      b.sprout(`horn${side === 1 ? "L" : "R"}`, hornBase, hornPath, [0.065, 0.008], {
        count: 0,
        color: stoneRough,
        caps: { start: "round", end: "point" },
        twist: side * -18,
        group: "head",
        name: `sweptHorn${side === 1 ? "L" : "R"}`,
      });

      b.along(hornPath, 4, (at) => {
        b.rod(
          at.moved([0, -0.004, 0]).at,
          at.moved([0, 0.004, 0]).at,
          0.006,
          STONE_LIGHT,
          {
            bone: headJoint,
            name: `hornCarving${side === 1 ? "L" : "R"}${Math.round(at.t * 10)}`,
            group: "head",
          },
        );
      });
    }
  }

  // Muzzle and nose.
  addStoneSphere(
    b,
    [-0.092, 1.47, 0.59],
    [0.12, 0.105, 0.14],
    stonePale,
    headJoint,
    "muzzleR",
    1,
  );
  addStoneSphere(
    b,
    [0.092, 1.47, 0.59],
    [0.12, 0.105, 0.14],
    stonePale,
    headJoint,
    "muzzleL",
    1,
  );

  const nose = addStoneSphere(
    b,
    [0, 1.48, 0.695],
    [0.085, 0.068, 0.075],
    stoneRough,
    headJoint,
    "carvedNose",
    1,
  );

  const noseSurface = b.surface(nose);
  const nostrilR = noseSurface.nearest([0.045, 1.49, 0.748]);
  const nostrilL = noseSurface.nearest([-0.045, 1.49, 0.748]);

  b.stick(new THREE.SphereGeometry(0.022, 6, 4), CREVICE, nostrilR, {
    embed: 0.45,
    name: "nostrilL",
    group: "face",
  });
  b.stick(new THREE.SphereGeometry(0.022, 6, 4), CREVICE, nostrilL, {
    embed: 0.45,
    name: "nostrilR",
    group: "face",
  });

  // Upper lip and open mouth cavity.
  b.rod(
    [-0.14, 1.445, 0.69],
    [0, 1.425, 0.735],
    0.018,
    stoneRough,
    { bone: headJoint, name: "upperLipR", group: "face" },
  );
  b.rod(
    [0, 1.425, 0.735],
    [0.14, 1.445, 0.69],
    0.018,
    stoneRough,
    { bone: headJoint, name: "upperLipL", group: "face" },
  );

  const mouth = b.part(new THREE.BoxGeometry(0.27, 0.105, 0.025), CREVICE, {
    bone: headJoint,
    at: [0, 1.415, 0.735],
    flat: true,
    name: "deepMouth",
    group: "face",
  });

  b.part(new THREE.PlaneGeometry(0.24, 0.1), "#ffffff", {
    bone: headJoint,
    at: [0, 1.416, 0.751],
    dir: [0, 0, 1],
    axis: "z",
    texture: mouthTexture,
    name: "carvedMouthPattern",
    group: "face",
  });

  const lowerJawCenter = jaw.local({ forward: 0.13, down: 0.02 });
  addStoneSphere(
    b,
    lowerJawCenter,
    [0.19, 0.08, 0.16],
    stoneRough,
    jaw,
    "lowerJaw",
    1,
  );

  b.rod(
    jaw.local({ left: 0.14, forward: 0.14, down: 0.035 }),
    jaw.local({ right: 0.14, forward: 0.14, down: 0.035 }),
    0.014,
    stonePale,
    { bone: jaw, name: "lowerLip", group: "face" },
  );

  for (const side of [1, -1]) {
    addTooth(
      b,
      [side * 0.09, 1.445, 0.75],
      [0, -1, 0],
      0.09,
      0.023,
      headJoint,
      `upperFang${side === 1 ? "L" : "R"}`,
    );
    addTooth(
      b,
      jaw.local({ right: -side * 0.075, forward: 0.16, down: 0 }),
      [0, 1, 0],
      0.06,
      0.018,
      jaw,
      `lowerFang${side === 1 ? "L" : "R"}`,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Gothic carving, chest sigil, shoulder plates, and scattered chips.

  const bodySurface = b.surface(body);
  const chestHit = bodySurface.around([0, 1.05, 0.05]).at(0, 8);
  if (chestHit) {
    b.decal(bodySurface, runeTexture, {
      at: chestHit.at,
      dir: chestHit.n,
      up: [0, 1, 0],
      size: [0.19, 0.19],
      lift: 0.004,
      name: "chestSunRune",
      group: "carving",
    });
  }

  const chestCrack = bodySurface.nearest([0, 1.15, 0.25]);
  b.decal(bodySurface, crackTexture, {
    at: chestCrack.at,
    dir: chestCrack.n,
    up: [0, 1, 0],
    size: [0.065, 0.15],
    lift: 0.004,
    name: "chestCrack",
    group: "carving",
  });

  for (const side of [1, -1]) {
    const shoulder = torso.at(0.72);
    b.ring(
      shoulder,
      {
        count: 7,
        radius: 0.16,
        fromDeg: 25,
        toDeg: 155,
        tilt: -12,
        group: "carving",
        name: `shoulderSpikes${side === 1 ? "L" : "R"}`,
        role: "fan",
      },
      (item) => {
        if (item.i % 2 === 0) {
          b.spike(item, item, 0.055, 0.017, {
            color: stonePale,
            name: `shoulderSpike${side === 1 ? "L" : "R"}${item.i}`,
          });
        }
      },
    );
  }

  const chipHits = bodySurface.scatter(18, {
    rng: rng(2024),
    minDist: 0.09,
    filter: (hit) => hit.n.y > -0.35 && hit.n.z > -0.35,
  });

  for (let i = 0; i < chipHits.length; i++) {
    const hit = chipHits[i];
    b.stick(
      new THREE.ConeGeometry(0.018 + (i % 3) * 0.004, 0.022 + (i % 2) * 0.012, 5),
      i % 3 === 0 ? STONE_LIGHT : STONE_DARK,
      hit,
      {
        embed: 0.42,
        spin: i * 37,
        flat: true,
        name: `weatheredChip${i + 1}`,
        group: "carving",
      },
    );
  }

  // Small carved tablets on the ledge sides echo cathedral masonry.
  for (const side of [1, -1]) {
    b.extrude(
      [
        [-0.1, 0],
        [0.1, 0],
        [0.1, 0.2],
        [0.03, 0.27, "sharp"],
        [-0.1, 0.18],
      ],
      {
        at: [side * 0.79, 0.35, 0.35],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.004,
        smoothing: 0,
        color: stonePale,
        bone: hips,
        name: `ledgeHeraldicTablet${side === 1 ? "L" : "R"}`,
        group: "ledgeCarving",
      },
    );
  }

  // A second, smaller glyph on the throat is a separate texture and reads as hand-carved ornament.
  const throatHit = bodySurface.nearest([0, 1.2, 0.23]);
  b.decal(bodySurface, stoneGlyphTexture, {
    at: throatHit.at,
    dir: throatHit.n,
    up: [0, 1, 0],
    size: [0.1, 0.12],
    lift: 0.004,
    name: "throatGlyph",
    group: "carving",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Final stone accents: claws, wing knuckles, ledge moss-like chips, and dark seams.

  for (const side of [1, -1]) {
    const key = side === 1 ? "L" : "R";
    const hand = arms[key].tip!;
    const foot = legs[key].tip!;

    addClaw(
      b,
      hand.at,
      [side * 0.37, 0.29, 0.67],
      0.019,
      hand,
      `handClawOuter${key}`,
    );
    addClaw(
      b,
      foot.at,
      [side * 0.34, 0.285, 0.62],
      0.022,
      foot,
      `footClawOuter${key}`,
    );

    b.rod(
      [side * 0.28, 0.38, 0.24],
      [side * 0.39, 0.42, 0.28],
      0.012,
      STONE_DARK,
      {
        bone: hips,
        name: `hipCarving${key}`,
        group: "carving",
      },
    );
  }

  // A few broad chips at the ledge edge keep the staging simpler than the creature itself.
  for (let i = 0; i < 8; i++) {
    const x = -0.8 + i * 0.23;
    b.part(
      new THREE.ConeGeometry(0.018 + (i % 3) * 0.006, 0.04 + (i % 2) * 0.018, 5),
      i % 2 ? STONE_DARK : STONE_LIGHT,
      {
        at: [x, 0.35, 0.56],
        bone: hips,
        rotation: [0, (i * 43 * Math.PI) / 180, 0],
        flat: true,
        name: `ledgeEdgeChip${i + 1}`,
        group: "ledgeCarving",
      },
    );
  }

  return b.root;
}

function stoneDeepPaint() {
  return countershade(
    mottle(STONE_DARK, STONE_MID, {
      size: 0.09,
      contrast: 1.2,
      seed: 101,
    }),
    CREVICE,
    { level: -0.18, soft: 0.25 },
  );
}
