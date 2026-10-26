import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  frame,
  grain,
  mottle,
  polyline,
  rng,
  stripes,
  svg,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A richly decorated low-poly Slavic folk-art diorama of Baba Yaga's colorful log hut, perched on four expressive chicken legs.",
};

const INK = "#2a1824";
const WOOD_DARK = "#4a241f";
const WOOD_MID = "#87502e";
const WOOD_LIGHT = "#cf8845";
const WALL_LIT = "#e1a04d";
const WALL_SHADOW = "#8b422c";
const RED_LIT = "#bd403c";
const RED_SHADOW = "#681f2b";
const BLUE_LIT = "#397295";
const BLUE_SHADOW = "#1d304f";
const TEAL_LIT = "#2f8b84";
const TEAL_SHADOW = "#164952";
const GOLD_LIT = "#f1c552";
const GOLD_SHADOW = "#a55629";
const CREAM_LIT = "#ffe2a0";
const CREAM_SHADOW = "#b8633c";
const LEG_LIT = "#d8ab31";
const LEG_SHADOW = "#783024";
const GRASS_LIT = "#668f3c";
const GRASS_SHADOW = "#263e2a";
const MOSS = "#52783b";
const CLAW = "#35262b";
const ROOF_RED = "#8e3040";
const ROOF_BLUE = "#315574";
const ROOF_GOLD = "#d79b3d";
const CHIMNEY_RED = "#8c4037";

const WOOD = cel(
  grain(WOOD_MID, WOOD_LIGHT, {
    size: 0.045,
    axis: "z",
    seed: 14,
  }),
  WOOD_DARK,
  { threshold: 0.05 },
);

const WALL = cel(
  mottle(WALL_LIT, "#f0bd61", {
    size: 0.14,
    contrast: 1.35,
    seed: 8,
  }),
  WALL_SHADOW,
  { threshold: 0.08 },
);

const LOG = cel(
  grain("#6e3828", WOOD_LIGHT, {
    size: 0.055,
    axis: "x",
    seed: 22,
  }),
  WOOD_DARK,
);

const ROOF = cel(
  stripes(
    ROOF_BLUE,
    [ROOF_RED, ROOF_GOLD, "#6e3b63"],
    {
      size: 0.22,
      axis: "z",
      width: 0.33,
      wobble: 0.18,
      seed: 6,
    },
  ),
  "#1d2a42",
);

const LEG = cel(
  stripes(
    LEG_LIT,
    [RED_LIT, GOLD_LIT, "#7c7d37"],
    {
      size: 0.18,
      axis: "y",
      width: 0.25,
      wobble: 0.12,
      seed: 19,
    },
  ),
  LEG_SHADOW,
  { threshold: 0.02 },
);

const FEATHER = cel(
  mottle(CREAM_LIT, GOLD_LIT, {
    size: 0.075,
    contrast: 1.2,
    seed: 31,
  }),
  CREAM_SHADOW,
);

const BASE_WOOD = cel(
  grain("#573222", WOOD_MID, {
    size: 0.08,
    axis: "y",
    seed: 45,
  }),
  "#2d2025",
);

const GRASS = countershade(
  GRASS_LIT,
  GRASS_SHADOW,
  {
    level: -0.05,
    soft: 0.22,
  },
);

const SUN_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sun" cx=".42" cy=".34" r=".75">
        <stop offset="0" stop-color="#fff0a4"/>
        <stop offset=".72" stop-color="#edaa3b"/>
        <stop offset="1" stop-color="#bb403a"/>
      </radialGradient>
    </defs>
    <circle cx="64" cy="64" r="58" fill="#4b2730" stroke="#f7d276" stroke-width="5"/>
    <g fill="#d84b3e" stroke="#7b2932" stroke-width="2">
      <path d="M64 4l8 24-8 11-8-11z"/>
      <path d="M124 64l-24 8-11-8 11-8z"/>
      <path d="M64 124l-8-24 8-11 8 11z"/>
      <path d="M4 64l24-8 11 8-11 8z"/>
      <path d="M106 22l-8 24-12 2 2-12z"/>
      <path d="M106 106l-24-8-2-12 12 2z"/>
      <path d="M22 106l8-24 12-2-2 12z"/>
      <path d="M22 22l24 8 2 12-12-2z"/>
    </g>
    <circle cx="64" cy="64" r="38" fill="url(#sun)" stroke="#622b2e" stroke-width="4"/>
    <path d="M45 61q19-20 38 0M48 78q16 11 32 0" fill="none" stroke="#71302e" stroke-width="5" stroke-linecap="round"/>
    <circle cx="52" cy="55" r="4" fill="#4a2530"/>
    <circle cx="76" cy="55" r="4" fill="#4a2530"/>
    <path d="M56 85q8 6 16 0" fill="none" stroke="#4a2530" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const DOOR_TEXTURE = svg(
  `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="120" fill="#2b7073"/>
    <path d="M10 0v120M25 0v120M42 0v120M61 0v120M74 0v120" stroke="#15494f" stroke-width="4" opacity=".8"/>
    <path d="M8 18h64M8 53h64M8 88h64" stroke="#e0a04b" stroke-width="3"/>
    <path d="M40 10l12 20-12 20-12-20zM40 65l12 20-12 20-12-20z" fill="none" stroke="#f7d276" stroke-width="4"/>
    <circle cx="40" cy="30" r="4" fill="#bb403c"/>
    <circle cx="40" cy="85" r="4" fill="#bb403c"/>
    <path d="M13 112h54" stroke="#bd403c" stroke-width="7"/>
  </svg>`,
  { size: 256 },
);

const WINDOW_TEXTURE = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#183b54"/>
    <rect x="7" y="7" width="82" height="82" rx="3" fill="#3c8c9c" stroke="#e5bd63" stroke-width="5"/>
    <path d="M48 9v78M9 48h78" stroke="#f3d27a" stroke-width="6"/>
    <path d="M48 20l6 20 20 8-20 8-6 20-6-20-20-8 20-8z" fill="#f5e7a1" stroke="#bc463f" stroke-width="3"/>
    <circle cx="48" cy="48" r="7" fill="#bf403e"/>
    <path d="M16 16l15 15M80 16L65 31M16 80l15-15M80 80L65 65" stroke="#d95a43" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const TRIM_TEXTURE = svg(
  `<svg viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="24" fill="#702c37"/>
    <path d="M0 4h160M0 20h160" stroke="#f0c45e" stroke-width="3"/>
    <path d="M8 12l8-7 8 7-8 7zM40 12l8-7 8 7-8 7zM72 12l8-7 8 7-8 7zM104 12l8-7 8 7-8 7zM136 12l8-7 8 7-8 7z" fill="#3b8190" stroke="#f0c45e" stroke-width="2"/>
  </svg>`,
  { size: 320 },
);

const BASE_TEXTURE = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="126" fill="#384e37"/>
    <circle cx="128" cy="128" r="103" fill="#6c793c" stroke="#e4b554" stroke-width="6"/>
    <circle cx="128" cy="128" r="77" fill="#3d6570" stroke="#8e3040" stroke-width="8"/>
    <g fill="none" stroke="#f2c45c" stroke-width="6">
      <path d="M128 55l13 48 43 25-43 25-13 48-13-48-43-25 43-25z"/>
      <circle cx="128" cy="128" r="35"/>
    </g>
    <g fill="#d14b3e">
      <circle cx="128" cy="27" r="7"/><circle cx="128" cy="229" r="7"/>
      <circle cx="27" cy="128" r="7"/><circle cx="229" cy="128" r="7"/>
      <circle cx="57" cy="57" r="7"/><circle cx="199" cy="57" r="7"/>
      <circle cx="57" cy="199" r="7"/><circle cx="199" cy="199" r="7"/>
    </g>
  </svg>`,
  { size: 384 },
);

const FEATHER_TEXTURE = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 94C19 69 3 54 8 29 12 11 27 4 39 2 39 29 34 49 24 94Z" fill="#f4d47e" stroke="#542d32" stroke-width="4"/>
    <path d="M24 88C22 57 19 31 34 8M23 68L10 52M25 57l12-17M22 45L12 30M28 34l10-14" fill="none" stroke="#bd403c" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const BUILDING_TEXTURE = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="64" fill="#8a432d"/>
    <path d="M0 9h128M0 22h128M0 37h128M0 52h128" stroke="#d18a44" stroke-width="4"/>
    <path d="M8 0l12 12L8 24 20 36 8 48 20 64M52 0l12 12-12 12 12 12-12 12 12 16M98 0l12 12-12 12 12 12-12 12 12 16" fill="none" stroke="#5c2930" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "baba-yaga-hut",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root for the diorama, then four named chicken leg chains and their digit chains.

  const root = b.joint("hutRoot", {
    at: [0, 0, 0],
    role: "spine",
    group: "hut",
  });

  const legSpecs = [
    {
      id: "frontL",
      side: "L",
      x: 0.57,
      z: 0.33,
      points: [
        [0.57, 1.12, 0.33],
        [0.67, 0.76, 0.43],
        [0.57, 0.28, 0.27],
        [0.58, 0.13, 0.34],
      ],
      names: ["hipL", "kneeL", "ankleL", "footL"],
    },
    {
      id: "frontR",
      side: "R",
      x: -0.57,
      z: 0.33,
      points: [
        [-0.57, 1.12, 0.33],
        [-0.67, 0.76, 0.43],
        [-0.57, 0.28, 0.27],
        [-0.58, 0.13, 0.34],
      ],
      names: ["hipR", "kneeR", "ankleR", "footR"],
    },
    {
      id: "rearL",
      side: "L",
      x: 0.57,
      z: -0.31,
      points: [
        [0.57, 1.12, -0.31],
        [0.68, 0.75, -0.18],
        [0.56, 0.27, -0.38],
        [0.57, 0.13, -0.30],
      ],
      names: ["hipBackL", "kneeBackL", "ankleBackL", "footBackL"],
    },
    {
      id: "rearR",
      side: "R",
      x: -0.57,
      z: -0.31,
      points: [
        [-0.57, 1.12, -0.31],
        [-0.68, 0.75, -0.18],
        [-0.56, 0.27, -0.38],
        [-0.57, 0.13, -0.30],
      ],
      names: ["hipBackR", "kneeBackR", "ankleBackR", "footBackR"],
    },
  ] as const;

  const legs = legSpecs.map((spec) => {
    const chain = b.chain(spec.id, polyline(spec.points), {
      parent: root,
      names: spec.names,
      role: "leg",
      group: "chicken-legs",
      contact: [spec.x, 0, spec.z],
    });

    return {
      ...spec,
      chain,
      foot: spec.points[3],
    };
  });

  const toeOffsets = [
    [0, 0.23],
    [0.14, 0.045],
    [-0.13, -0.015],
  ] as const;

  const toes = legs.flatMap((leg) =>
    toeOffsets.map((offset, i) => {
      const target = [
        leg.foot[0] + offset[0] * (leg.side === "L" ? 1 : -1),
        0.095,
        leg.foot[2] + offset[1],
      ] as [number, number, number];

      const parent = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
      const chain = b.chain(
        `${leg.id}Toe${i}`,
        polyline([leg.foot, target]),
        {
          parent,
          names: [`${leg.id}Toe${i}`, `${leg.id}Toe${i}Tip`],
          role: "digit",
          group: "chicken-toes",
        },
      );

      return {
        leg,
        chain,
        target,
        index: i,
      };
    }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small placement helpers. Every static piece is explicitly attached to the root bone.

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number] | THREE.Vector3,
    extra: Record<string, any> = {},
  ) =>
    b.part(geometry, color, {
      bone: root,
      at,
      ...extra,
    });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: Record<string, any> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      extra,
    );

  const bead = (
    at: [number, number, number],
    radius: number,
    color: any,
    extra: Record<string, any> = {},
  ) =>
    part(
      new THREE.SphereGeometry(radius, 8, 6),
      color,
      at,
      extra,
    );

  const rod = (
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: any,
    extra: Record<string, any> = {},
  ) =>
    b.rod(a, c, radius, {
      bone: root,
      color,
      section: { ngon: 8 },
      ...extra,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    extra: Record<string, any> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, 12),
      color,
      at,
      extra,
    );

  const frontPlane = (
    width: number,
    height: number,
    at: [number, number, number],
    texture: THREE.Texture,
    name: string,
  ) =>
    part(
      new THREE.PlaneGeometry(width, height),
      "#ffffff",
      at,
      {
        dir: [0, 0, 1],
        axis: "z",
        texture,
        name,
      },
    );

  const frontDiamond = (
    x: number,
    y: number,
    radius: number,
    color: any,
    name: string,
  ) =>
    b.extrude(
      [
        [0, radius],
        [radius, 0],
        [0, -radius],
        [-radius, 0],
      ],
      {
        at: [x, y, 0.61],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.002,
        color,
        bone: root,
        name,
      },
    );

  const sideDiamond = (
    z: number,
    y: number,
    radius: number,
    color: any,
    name: string,
  ) =>
    b.extrude(
      [
        [0, radius],
        [radius, 0],
        [0, -radius],
        [-radius, 0],
      ],
      {
        at: [0.815, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.002,
        color,
        bone: root,
        name,
      },
    );

  // ---------------------------------------------------------------------------------------------------------------
  // Diorama plinth: a compact painted folk-art platform, with a little moss around its rim.

  cylinder(1.11, 0.07, [0, 0.035, 0], BASE_WOOD, {
    name: "wooden-diorama-plinth",
  });

  cylinder(1.025, 0.014, [0, 0.078, 0], "#ffffff", {
    texture: BASE_TEXTURE,
    name: "painted-mandala-top",
  });

  const plinthLoop = Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return [Math.cos(a) * 1.04, 0.091, Math.sin(a) * 1.04] as [
      number,
      number,
      number,
    ];
  });

  b.sweep(polyline(plinthLoop, { closed: true }), 0.018, {
    bone: root,
    color: RED_LIT,
    section: { ngon: 6 },
    name: "red-plinth-border",
  });

  const plinthInnerLoop = Array.from({ length: 17 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return [Math.cos(a) * 0.96, 0.092, Math.sin(a) * 0.96] as [
      number,
      number,
      number,
    ];
  });

  b.sweep(polyline(plinthInnerLoop, { closed: true }), 0.009, {
    bone: root,
    color: GOLD_LIT,
    section: { ngon: 6 },
    name: "gold-plinth-border",
  });

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13;
    const x = Math.cos(a) * 0.98;
    const z = Math.sin(a) * 0.98;
    b.spike([x, 0.09, z], [0, 1, 0], 0.065, 0.018, {
      bone: root,
      color: MOSS,
      name: `moss-tuft-${i}`,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hut body: a warm square log cabin with a separate under-floor and pronounced corner logs.

  box([1.48, 0.11, 1.01], [0, 1.095, 0], LOG, {
    name: "heavy-underfloor",
  });

  const wall = box([1.43, 0.73, 0.98], [0, 1.50, 0], WALL, {
    texture: BUILDING_TEXTURE,
    name: "painted-log-wall",
  });

  const logRows = [1.17, 1.33, 1.49, 1.65, 1.81];

  for (let i = 0; i < logRows.length; i++) {
    const y = logRows[i];

    rod([-0.78, y, 0.525], [0.78, y, 0.525], 0.064, LOG, {
      name: `front-horizontal-log-${i}`,
    });

    rod([-0.78, y, -0.525], [0.78, y, -0.525], 0.064, LOG, {
      name: `rear-horizontal-log-${i}`,
    });

    rod([0.755, y, -0.54], [0.755, y, 0.54], 0.064, LOG, {
      name: `left-side-log-${i}`,
    });

    rod([-0.755, y, -0.54], [-0.755, y, 0.54], 0.064, LOG, {
      name: `right-side-log-${i}`,
    });

    cylinder(0.054, 0.018, [0.755, y, 0.578], WOOD_DARK, {
      dir: [0, 0, 1],
      axis: "y",
      name: `front-left-log-end-${i}`,
    });

    cylinder(0.054, 0.018, [-0.755, y, 0.578], WOOD_DARK, {
      dir: [0, 0, 1],
      axis: "y",
      name: `front-right-log-end-${i}`,
    });

    cylinder(0.054, 0.018, [0.755, y, -0.578], WOOD_DARK, {
      dir: [0, 0, -1],
      axis: "y",
      name: `back-left-log-end-${i}`,
    });

    cylinder(0.054, 0.018, [-0.755, y, -0.578], WOOD_DARK, {
      dir: [0, 0, -1],
      axis: "y",
      name: `back-right-log-end-${i}`,
    });
  }

  for (const x of [-0.755, 0.755]) {
    for (const z of [-0.5, 0.5]) {
      rod([x, 1.08, z], [x, 1.91, z], 0.082, LOG, {
        name: `upright-corner-${x}-${z}`,
      });
    }
  }

  // A dark band under the gable, plus colorful repeated diamonds on the front.
  frontPlane(1.29, 0.095, [0, 1.875, 0.607], TRIM_TEXTURE, "front-folk-trim");

  [-0.61, -0.43, 0.43, 0.61].forEach((x, i) => {
    frontDiamond(
      x,
      1.92,
      0.042,
      i % 2 === 0 ? GOLD_LIT : TEAL_LIT,
      `front-diamond-${i}`,
    );
  });

  // Side folk diamonds make the hut read from three-quarter views.
  [-0.35, -0.08, 0.19, 0.46].forEach((z, i) => {
    sideDiamond(
      z,
      1.87,
      0.04,
      i % 2 === 0 ? RED_LIT : GOLD_LIT,
      `side-diamond-${i}`,
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Gables and roof: two sharp folk-art triangles under broad overhanging roof leaves.

  const frontGable = b.extrude(
    [
      [-0.72, 0],
      [0.72, 0],
      [0, 0.43, "sharp"],
    ],
    {
      at: [0, 1.84, 0.545],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.004,
      color: CREAM_LIT,
      bone: root,
      name: "front-triangular-gable",
    },
  );

  const rearGable = b.extrude(
    [
      [-0.72, 0],
      [0.72, 0],
      [0, 0.43, "sharp"],
    ],
    {
      at: [0, 1.84, -0.545],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.004,
      color: CREAM_SHADOW,
      bone: root,
      name: "rear-triangular-gable",
    },
  );

  rod([-0.7, 1.86, 0.59], [0, 2.26, 0.59], 0.025, RED_LIT, {
    name: "left-gable-diagonal",
  });

  rod([0.7, 1.86, 0.59], [0, 2.26, 0.59], 0.025, RED_LIT, {
    name: "right-gable-diagonal",
  });

  rod([-0.7, 1.86, -0.59], [0, 2.26, -0.59], 0.025, WOOD_DARK, {
    name: "rear-left-gable-diagonal",
  });

  rod([0.7, 1.86, -0.59], [0, 2.26, -0.59], 0.025, WOOD_DARK, {
    name: "rear-right-gable-diagonal",
  });

  b.decal(frontGable, SUN_TEXTURE, {
    at: [0, 2.085, 0.59],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.29, 0.29],
    segments: 5,
    lift: 0.004,
    name: "painted-sun-gable-emblem",
  });

  const roofAngle = 25;
  const roofRows = [0.13, 0.35, 0.57, 0.78];
  const roofShingleColors = [ROOF_RED, ROOF_BLUE, ROOF_GOLD, "#6e3b63"];

  box([1.04, 0.075, 1.30], [0.425, 2.10, 0], ROOF, {
    rotation: [0, 0, -roofAngle],
    name: "right-roof-leaf",
  });

  box([1.04, 0.075, 1.30], [-0.425, 2.10, 0], ROOF, {
    rotation: [0, 0, roofAngle],
    name: "left-roof-leaf",
  });

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const side = sideIndex === 0 ? 1 : -1;

    for (let row = 0; row < roofRows.length; row++) {
      const distance = roofRows[row];
      const x = side * distance;
      const y = 2.295 - distance * 0.466;

      for (let col = 0; col < 5; col++) {
        const z = -0.52 + col * 0.26;
        const tileColor = roofShingleColors[(row + col + sideIndex) % roofShingleColors.length];

        box([0.245, 0.029, 0.235], [x, y + 0.01, z], tileColor, {
          rotation: [0, 0, side === 1 ? -roofAngle : roofAngle],
          name: `roof-shingle-${sideIndex}-${row}-${col}`,
        });
      }
    }
  }

  rod([0, 2.30, -0.68], [0, 2.30, 0.68], 0.035, WOOD_DARK, {
    name: "roof-ridge-log",
  });

  rod([0.87, 1.88, -0.68], [0.87, 1.88, 0.68], 0.027, RED_LIT, {
    name: "right-roof-eave-trim",
  });

  rod([-0.87, 1.88, -0.68], [-0.87, 1.88, 0.68], 0.027, RED_LIT, {
    name: "left-roof-eave-trim",
  });

  // Ornamental turned finials at both roof ends.
  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.044, 0.018],
      [0.026, 0.045],
      [0.052, 0.072],
      [0.018, 0.10],
      [0, 0.12],
    ],
    {
      at: [0, 2.28, 0.68],
      axis: [0, 1, 0],
      segments: 8,
      color: GOLD_LIT,
      bone: root,
      name: "front-turned-finial",
    },
  );

  b.lathe(
    [
      [0, 0],
      [0.026, 0],
      [0.044, 0.018],
      [0.026, 0.045],
      [0.052, 0.072],
      [0.018, 0.10],
      [0, 0.12],
    ],
    {
      at: [0, 2.28, -0.68],
      axis: [0, 1, 0],
      segments: 8,
      color: RED_LIT,
      bone: root,
      name: "rear-turned-finial",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Front door: chunky turquoise boards, gold hardware and a carved geometric skin.

  box([0.36, 0.57, 0.075], [-0.30, 1.43, 0.56], TEAL, {
    name: "turquoise-door",
  });

  frontPlane(0.31, 0.51, [-0.30, 1.43, 0.604], DOOR_TEXTURE, "painted-front-door");

  rod([-0.515, 1.14, 0.625], [-0.515, 1.72, 0.625], 0.034, RED_LIT, {
    name: "door-frame-left",
  });

  rod([-0.085, 1.14, 0.625], [-0.085, 1.72, 0.625], 0.034, RED_LIT, {
    name: "door-frame-right",
  });

  rod([-0.53, 1.73, 0.625], [-0.07, 1.73, 0.625], 0.037, GOLD_LIT, {
    name: "door-frame-top",
  });

  rod([-0.54, 1.13, 0.625], [-0.06, 1.13, 0.625], 0.027, GOLD_LIT, {
    name: "door-sill",
  });

  bead([-0.17, 1.43, 0.66], 0.034, GOLD_LIT, {
    name: "door-knob",
  });

  bead([-0.17, 1.43, 0.695], 0.014, GOLD_SHADOW, {
    name: "door-knob-cap",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Front and side windows, each with deep wooden framing and glowing blue patterned panes.

  box([0.43, 0.40, 0.065], [0.38, 1.53, 0.555], WOOD_DARK, {
    name: "front-window-recess",
  });

  const frontWindow = frontPlane(
    0.33,
    0.30,
    [0.38, 1.53, 0.598],
    WINDOW_TEXTURE,
    "front-flower-window",
  );
  glow(frontWindow, 0.32);

  rod([0.20, 1.53, 0.63], [0.56, 1.53, 0.63], 0.019, GOLD_LIT, {
    name: "front-window-cross-horizontal",
  });

  rod([0.38, 1.38, 0.63], [0.38, 1.68, 0.63], 0.019, GOLD_LIT, {
    name: "front-window-cross-vertical",
  });

  rod([0.17, 1.35, 0.63], [0.59, 1.35, 0.63], 0.026, RED_LIT, {
    name: "front-window-bottom-frame",
  });

  rod([0.17, 1.71, 0.63], [0.59, 1.71, 0.63], 0.026, RED_LIT, {
    name: "front-window-top-frame",
  });

  rod([0.17, 1.35, 0.63], [0.17, 1.71, 0.63], 0.026, RED_LIT, {
    name: "front-window-left-frame",
  });

  rod([0.59, 1.35, 0.63], [0.59, 1.71, 0.63], 0.026, RED_LIT, {
    name: "front-window-right-frame",
  });

  box([0.065, 0.40, 0.43], [0.775, 1.52, -0.05], WOOD_DARK, {
    name: "side-window-recess",
  });

  const sideWindow = part(
    new THREE.PlaneGeometry(0.31, 0.30),
    "#ffffff",
    [0.817, 1.52, -0.05],
    {
      dir: [1, 0, 0],
      axis: "z",
      texture: WINDOW_TEXTURE,
      name: "side-flower-window",
    },
  );
  glow(sideWindow, 0.24);

  rod([0.84, 1.52, -0.20], [0.84, 1.52, 0.10], 0.019, GOLD_LIT, {
    name: "side-window-cross-horizontal",
  });

  rod([0.84, 1.37, -0.05], [0.84, 1.67, -0.05], 0.019, GOLD_LIT, {
    name: "side-window-cross-vertical",
  });

  rod([0.84, 1.34, -0.23], [0.84, 1.34, 0.13], 0.026, RED_LIT, {
    name: "side-window-bottom-frame",
  });

  rod([0.84, 1.70, -0.23], [0.84, 1.70, 0.13], 0.026, RED_LIT, {
    name: "side-window-top-frame",
  });

  rod([0.84, 1.34, -0.23], [0.84, 1.70, -0.23], 0.026, RED_LIT, {
    name: "side-window-front-frame",
  });

  rod([0.84, 1.34, 0.13], [0.84, 1.70, 0.13], 0.026, RED_LIT, {
    name: "side-window-back-frame",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Chimney at the rear roof slope, with brick bands and a broad cap.

  box([0.22, 0.39, 0.22], [0.34, 2.29, -0.23], CHIMNEY_RED, {
    name: "brick-chimney-stack",
  });

  box([0.28, 0.055, 0.28], [0.34, 2.505, -0.23], WOOD_DARK, {
    name: "chimney-cap",
  });

  [2.18, 2.29, 2.40].forEach((y, i) => {
    rod([0.215, y, -0.35], [0.465, y, -0.35], 0.010, GOLD_LIT, {
      name: `chimney-front-mortar-${i}`,
    });
  });

  // A tiny carved star beneath the chimney cap.
  b.extrude(
    [
      [0, 0.055],
      [0.018, 0.018],
      [0.055, 0],
      [0.018, -0.018],
      [0, -0.055],
      [-0.018, -0.018],
      [-0.055, 0],
      [-0.018, 0.018],
    ],
    {
      at: [0.34, 2.535, -0.23],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      color: GOLD_LIT,
      bone: root,
      name: "chimney-star",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Hanging folk ribbons beneath the front eaves.

  const hangingRibbon = (
    x: number,
    z: number,
    color: any,
    index: number,
  ) => {
    rod([x, 1.90, z], [x, 1.75, z], 0.010, color, {
      name: `ribbon-string-${index}`,
    });

    bead([x, 1.72, z], 0.026, GOLD_LIT, {
      name: `ribbon-bead-${index}`,
    });

    b.cards(
      [frame([x, 1.76, z], [0, 1, 0])],
      FEATHER_TEXTURE,
      {
        size: [0.055, 0.16],
        lean: 180,
        flow: [0, 0, 1],
        sink: 0.04,
        color: "#ffffff",
        rng: rng(900 + index),
        name: `ribbon-feather-${index}`,
      },
    );
  };

  hangingRibbon(-0.83, 0.64, RED_LIT, 0);
  hangingRibbon(0.83, 0.64, TEAL_LIT, 1);
  hangingRibbon(-0.83, -0.64, GOLD_LIT, 2);
  hangingRibbon(0.83, -0.64, RED_LIT, 3);

  // A low curved folk garland across the front wall.
  const garlandPath = catmull([
    [-0.67, 1.94, 0.62],
    [-0.42, 1.88, 0.64],
    [-0.16, 1.91, 0.64],
    [0.12, 1.88, 0.64],
    [0.40, 1.92, 0.64],
    [0.67, 1.94, 0.62],
  ]);

  b.sweep(garlandPath, 0.012, {
    bone: root,
    color: GOLD_LIT,
    section: { ngon: 6 },
    name: "front-curved-garland",
  });

  [-0.48, -0.24, 0, 0.24, 0.48].forEach((x, i) => {
    bead([x, 1.90 + (i % 2) * 0.025, 0.65], 0.023, i % 2 ? RED_LIT : TEAL_LIT, {
      name: `garland-bead-${i}`,
    });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Chicken legs: chunky upper limbs, articulated knees, ankle jewelry, three toes and hooked claws.

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => {
      if (t < 0.32) return 0.092;
      if (t < 0.60) return 0.071;
      if (t < 0.82) return 0.045;
      return 0.034;
    }, {
      color: LEG,
      bands: [
        [0.30, RED_LIT],
        [0.36, LEG],
        [0.71, BLUE_LIT],
        [0.77, LEG],
      ],
      section: { ngon: 7 },
      caps: "round",
      name: `${leg.id}-continuous-leg`,
    });

    const kneeJoint = leg.chain.joints[1];
    const ankleJoint = leg.chain.joints[2];

    b.part(
      new THREE.SphereGeometry(0.105, 9, 6),
      RED_LIT,
      {
        bone: kneeJoint,
        at: kneeJoint.at,
        name: `${leg.id}-red-knee`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.062, 8, 5),
      GOLD_LIT,
      {
        bone: ankleJoint,
        at: ankleJoint.at,
        name: `${leg.id}-ankle-knuckle`,
      },
    );

    b.ring(
      ankleJoint,
      {
        count: 7,
        radius: 0.052,
        fromDeg: 0,
        toDeg: 300,
        group: "ankle-bells",
        name: `${leg.id}-ankle-ring`,
      },
      (item) =>
        b.part(
          new THREE.SphereGeometry(0.014, 7, 5),
          item.i % 2 ? GOLD_LIT : RED_LIT,
          {
            frame: item,
            name: `${leg.id}-ankle-bell-${item.i}`,
          },
        ),
    );

    b.ring(
      leg.chain.joints[0],
      {
        count: 8,
        radius: 0.102,
        fromDeg: 0,
        toDeg: 315,
        tilt: -15,
        group: "thigh-feathers",
        name: `${leg.id}-thigh-feather-ring`,
      },
      (item) =>
        b.spike(item, item, 0.13, 0.024, {
          color: FEATHER,
          name: `${leg.id}-thigh-feather-${item.i}`,
        }),
    );
  }

  for (const toe of toes) {
    b.sweep(toe.chain, [0.026, 0.012], {
      color: LEG,
      section: { ngon: 6 },
      caps: "round",
      name: `${toe.leg.id}-toe-${toe.index}`,
    });

    const tip = toe.chain.tip ?? toe.chain.joints[toe.chain.joints.length - 1];

    b.spike(
      tip,
      [0, -0.78, 0.82],
      0.066,
      0.010,
      {
        color: CLAW,
        name: `${toe.leg.id}-claw-${toe.index}`,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.018, 7, 5),
      RED_LIT,
      {
        bone: tip,
        at: tip.at,
        name: `${toe.leg.id}-toe-bead-${toe.index}`,
      },
    );
  }

  // Small decorative leg cuffs make the four supports read as folk-painted chicken limbs.
  for (const leg of legs) {
    const y = leg.id.startsWith("front") ? 0.48 : 0.45;
    rod(
      [leg.x - 0.058, y, leg.z],
      [leg.x + 0.058, y, leg.z],
      0.017,
      RED_LIT,
      {
        name: `${leg.id}-painted-cuff`,
      },
    );

    rod(
      [leg.x - 0.055, y + 0.045, leg.z],
      [leg.x + 0.055, y + 0.045, leg.z],
      0.011,
      GOLD_LIT,
      {
        name: `${leg.id}-cuff-gold-edge`,
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A few final hand-carved details: studs, corner flowers and painted base supports.

  for (const x of [-0.755, 0.755]) {
    for (const z of [-0.51, 0.51]) {
      bead([x, 1.87, z > 0 ? 0.59 : -0.59], 0.024, GOLD_LIT, {
        name: `corner-carved-stud-${x}-${z}`,
      });
    }
  }

  for (let i = 0; i < 6; i++) {
    const x = -0.62 + i * 0.248;
    bead([x, 1.115, 0.585], 0.018, i % 2 ? TEAL_LIT : RED_LIT, {
      name: `underfloor-front-stud-${i}`,
    });
  }

  // Three little painted wedges under the floor echo the angular chicken silhouette.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.13, 0],
        [0.08, 0.13],
        [0.025, 0.19],
      ],
      {
        at: [side * 0.34, 1.03, 0.56],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        color: RED_LIT,
        bone: root,
        name: `front-underfloor-carved-wedge-${side}`,
      },
    );
  }

  return b.root;
}
