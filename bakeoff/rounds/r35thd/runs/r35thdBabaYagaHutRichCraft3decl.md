```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  line,
  offset,
  paint,
  mottle,
  stripes,
  grain,
  countershade,
} from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of Baba Yaga's crooked wooden hut, raised on four expressive chicken legs with painted trim, glowing windows, thatched roof, broom, sign, and a carved forest-floor plinth.",
};

const INK = "#24141b";
const WOOD_DARK = "#43251d";
const WOOD_RED = "#8f392c";
const WOOD_LIGHT = "#bd7040";
const ROOF_GOLD = "#d19b3e";
const ROOF_DARK = "#704329";
const CREAM = "#f3d89a";
const RED = "#c93635";
const BLUE = "#245d79";
const TEAL = "#338f83";
const OCHRE = "#e0a83f";
const GOLD = "#f2c75b";
const LEG_YELLOW = "#d59b36";
const LEG_SHADOW = "#854a25";
const FEATHER_RED = "#a82d2b";
const MOSS_GREEN = "#526c32";
const MOSS_LIGHT = "#91a34e";
const STONE = "#554b50";
const GLASS = "#ffcb61";

const WOOD = countershade(
  grain(WOOD_DARK, WOOD_LIGHT, {
    size: 0.14,
    axis: "z",
    seed: 12,
  }),
  "#28191a",
  { level: -0.2, soft: 0.3 },
);

const WALL_PAINT = mottle(WOOD, WOOD_RED, {
  size: 0.26,
  contrast: 1.5,
  seed: 22,
});

const BEAM_PAINT = grain("#4b241d", "#a24e31", {
  size: 0.08,
  axis: "y",
  seed: 8,
});

const THATCH = countershade(
  stripes(
    mottle("#8f592d", "#c7903d", {
      size: 0.18,
      contrast: 1.2,
      seed: 31,
    }),
    ["#6d4027", "#e0ad4b"],
    {
      size: 0.14,
      width: 0.28,
      wobble: 0.3,
      axis: "z",
      seed: 6,
    },
  ),
  "#523022",
  { level: -0.15, soft: 0.22 },
);

const LEG_PAINT = countershade(
  mottle(LEG_YELLOW, "#bd6829", {
    size: 0.11,
    contrast: 1.25,
    seed: 44,
  }),
  LEG_SHADOW,
  { level: -0.18, soft: 0.28 },
);

const MOSS_PAINT = mottle(MOSS_GREEN, MOSS_LIGHT, {
  size: 0.2,
  contrast: 1.15,
  seed: 71,
});

const WINDOW_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="8" fill="#17333a"/>
    <rect x="8" y="8" width="112" height="112" rx="5" fill="#e0a83f" stroke="#28191a" stroke-width="7"/>
    <rect x="18" y="18" width="92" height="92" fill="#efc766" stroke="#245d79" stroke-width="7"/>
    <path d="M64 18V110M18 64H110" stroke="#8f392c" stroke-width="7"/>
    <path d="M64 29l7 20 20 7-20 7-7 20-7-20-20-7 20-7z" fill="#c93635" stroke="#f3d89a" stroke-width="3"/>
    <circle cx="64" cy="64" r="7" fill="#f3d89a"/>
    <path d="M27 27l12 10M101 27L89 38M27 101l12-11M101 101L90 90" stroke="#338f83" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const DOOR_TEXTURE = svg(
  `<svg viewBox="0 0 160 260" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="260" fill="#4b241d"/>
    <path d="M14 14h132v232H14z" fill="#6e3826" stroke="#e0a83f" stroke-width="8"/>
    <path d="M28 30h104v72H28zM28 116h104v116H28z" fill="#43251d" stroke="#bd7040" stroke-width="5"/>
    <circle cx="80" cy="65" r="25" fill="#c93635" stroke="#f3d89a" stroke-width="5"/>
    <path d="M80 31v68M46 65h68M56 41l48 48M104 41L56 89" stroke="#f2c75b" stroke-width="4"/>
    <circle cx="113" cy="170" r="8" fill="#e0a83f" stroke="#24141b" stroke-width="3"/>
    <path d="M44 134h72M44 151h72M44 215h72" stroke="#8f392c" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const MOTIF_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" fill="none"/>
    <path d="M64 5l18 35 36 24-36 24-18 35-18-35L10 64l36-24z" fill="#c93635" stroke="#f3d89a" stroke-width="6"/>
    <circle cx="64" cy="64" r="17" fill="#338f83" stroke="#24141b" stroke-width="5"/>
    <path d="M64 43v42M43 64h42" stroke="#f2c75b" stroke-width="6"/>
    <circle cx="64" cy="64" r="5" fill="#24141b"/>
  </svg>`,
  { size: 192 },
);

const SIGN_TEXTURE = svg(
  `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14Q110 1 212 14v72Q110 99 8 86z" fill="#f3d89a" stroke="#24141b" stroke-width="8"/>
    <path d="M20 25Q110 14 200 25v50Q110 86 20 75z" fill="#8f392c" stroke="#e0a83f" stroke-width="5"/>
    <text x="110" y="61" text-anchor="middle" font-family="serif" font-weight="bold" font-size="32" fill="#f3d89a">БАБА</text>
  </svg>`,
  { size: 256 },
);

const THATCH_CARD = svg(
  `<svg viewBox="0 0 32 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0L29 35 24 128H8L3 35z" fill="#d5a14b"/>
    <path d="M16 2L12 128M16 2L20 128M7 34L25 38" stroke="#704329" stroke-width="3" fill="none"/>
    <path d="M4 38L28 42" stroke="#f2c75b" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const FEATHER_CARD = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0Q57 22 54 72Q50 108 32 128Q14 108 10 72Q7 22 32 0z" fill="#c93635" stroke="#24141b" stroke-width="5"/>
    <path d="M32 7V119M32 35L14 52M32 52L50 67M32 72L15 91M32 91L45 105" stroke="#f3d89a" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

const BROOM_CARD = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0L38 73 59 128H5L26 73z" fill="#c7903d" stroke="#43251d" stroke-width="4"/>
    <path d="M32 8V122M18 78l-7 43M46 78l7 43M25 78l-2 45M39 78l2 45" stroke="#704329" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const BASE_MARK_TEXTURE = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="118" fill="#6c7d3e" stroke="#24141b" stroke-width="8"/>
    <circle cx="128" cy="128" r="86" fill="none" stroke="#d19b3e" stroke-width="8"/>
    <path d="M128 44l19 55 57 29-57 29-19 55-19-55-57-29 57-29z" fill="#c93635" stroke="#f3d89a" stroke-width="7"/>
    <circle cx="128" cy="128" r="19" fill="#338f83" stroke="#24141b" stroke-width="6"/>
  </svg>`,
  { size: 256 },
);

function build() {
  const b = createBuilder({
    name: "baba-yaga-hut",
    detail: 1,
    paintSize: 2048,
  });

  // The single root and four articulated chicken-leg chains are established first.
  const root = b.joint("hutRoot", {
    at: [0, 1.22, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  type LegRecord = {
    side: number;
    z: number;
    front: boolean;
    chain: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
  };

  const legRecords: LegRecord[] = [];

  const makeLeg = (
    label: string,
    side: number,
    z: number,
    front: boolean,
  ) => {
    const hip: [number, number, number] = [side * 0.61, 1.30, z];
    const knee: [number, number, number] = [
      side * 0.69,
      0.86,
      z + (front ? 0.11 : -0.1),
    ];
    const ankle: [number, number, number] = [
      side * 0.52,
      0.39,
      z + (front ? 0.01 : -0.06),
    ];
    const foot: [number, number, number] = [
      side * 0.48,
      0.17,
      z + (front ? 0.11 : 0.03),
    ];

    const chain = b.chain(
      label,
      catmull([hip, knee, ankle, foot], { tension: 0.35 }),
      {
        parent: root,
        names: [
          `${label}Hip`,
          `${label}Knee`,
          `${label}Ankle`,
          `${label}Foot`,
        ],
        role: "leg",
        contact: [foot[0], 0.1, foot[2] + 0.12],
        group: "chicken-legs",
      },
    );

    b.sweep(chain, (t) => 0.105 - t * 0.032, {
      color: LEG_PAINT,
      section: { ngon: 6 },
      caps: "round",
      name: `${label}_leg`,
      group: "chicken-legs",
    });

    // A warm red feather cuff makes each leg read as a chicken limb rather than a wooden post.
    b.ring(
      chain.at(0.17),
      {
        count: 7,
        radius: 0.108,
        fromDeg: -72,
        toDeg: 72,
        tilt: -35,
        name: `${label}FeatherFan`,
        role: "fan",
        group: "chicken-legs",
      },
      (item) =>
        b.spike(item, item, 0.085, 0.024, {
          color: FEATHER_RED,
          caps: "point",
          name: `${label}_feather`,
          group: "chicken-legs",
        }),
    );

    const footPoint = chain.at(1).at;
    const forward = front ? 1 : 0.78;
    const toeSpecs = [
      [side * 0.075, forward * 0.18],
      [side * 0.015, forward * 0.23],
      [-side * 0.075, forward * 0.16],
    ];

    toeSpecs.forEach(([dx, dz], i) => {
      const toeEnd: [number, number, number] = [
        footPoint.x + dx,
        0.14,
        footPoint.z + dz,
      ];
      b.rod(footPoint, toeEnd, [0.031, 0.014], {
        color: LEG_PAINT,
        caps: "round",
        name: `${label}_toe${i}`,
        group: "chicken-legs",
      });

      const clawEnd: [number, number, number] = [
        toeEnd[0] + dx * 0.35,
        0.115,
        toeEnd[2] + 0.045,
      ];
      b.spike(toeEnd, clawEnd, null, 0.012, {
        color: INK,
        caps: "point",
        name: `${label}_claw${i}`,
        group: "chicken-legs",
      });
    });

    legRecords.push({
      side,
      z,
      front,
      chain,
      foot: footPoint,
    });
  };

  makeLeg("legFL", 1, 0.43, true);
  makeLeg("legFR", -1, 0.43, true);
  makeLeg("legBL", 1, -0.43, false);
  makeLeg("legBR", -1, -0.43, false);

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number] | THREE.Vector3,
    color: string | ReturnType<typeof paint>,
    options: {
      rotation?: [number, number, number];
      texture?: THREE.Texture;
      scale?: [number, number, number] | number;
      bone?: typeof root;
      group?: string;
    } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: options.bone ?? root,
      rotation: options.rotation,
      texture: options.texture,
      scale: options.scale,
      flat: true,
      name,
      group: options.group ?? "hut",
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number] | THREE.Vector3,
    color: string | ReturnType<typeof paint>,
    radialSegments = 10,
    options: {
      rotation?: [number, number, number];
      scale?: [number, number, number] | number;
      texture?: THREE.Texture;
      group?: string;
    } = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(
        radius,
        radius * 1.03,
        height,
        radialSegments,
        1,
      ),
      color,
      {
        at,
        bone: root,
        rotation: options.rotation,
        scale: options.scale,
        texture: options.texture,
        flat: true,
        name,
        group: options.group ?? "hut",
      },
    );

  const sphere = (
    name: string,
    radius: number,
    at: [number, number, number] | THREE.Vector3,
    color: string | ReturnType<typeof paint>,
    options: {
      scale?: [number, number, number] | number;
      group?: string;
    } = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      bone: root,
      scale: options.scale,
      flat: true,
      name,
      group: options.group ?? "hut",
    });

  const rod = (
    name: string,
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number | readonly [number, number],
    color: string | ReturnType<typeof paint>,
    group = "hut",
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "round",
      section: { ngon: 6 },
      name,
      group,
    });

  // Low-poly folk-art plinth.
  cylinder("plinthBase", 1.43, 0.1, [0, 0.05, 0], MOSS_PAINT, 14, {
    group: "diorama-base",
  });
  cylinder("plinthWoodRim", 1.31, 0.055, [0, 0.125, 0], WOOD_DARK, 14, {
    group: "diorama-base",
  });

  const baseMark = b.part(new THREE.CircleGeometry(1.16, 14), "#ffffff", {
    at: [0, 0.157, 0],
    bone: root,
    dir: [0, 1, 0],
    axis: "z",
    texture: BASE_MARK_TEXTURE,
    name: "painted_base_mandala",
    group: "diorama-base",
  });

  const baseRim = b.part(
    new THREE.TorusGeometry(1.29, 0.022, 5, 28),
    GOLD,
    {
      at: [0, 0.17, 0],
      bone: root,
      rotation: [0, 0, 0],
      name: "golden_base_rim",
      group: "diorama-base",
    },
  );

  // A few deliberately simple stones make the platform read as a small staged diorama.
  const stones = [
    [-1.03, 0.17, 0.45, 1.15],
    [1.02, 0.17, 0.43, 0.92],
    [-0.98, 0.17, -0.47, 0.82],
    [0.98, 0.17, -0.48, 1.08],
    [0, 0.17, -1.08, 0.95],
  ] as const;

  stones.forEach(([x, y, z, s], i) => {
    sphere(`base_stone_${i}`, 0.15, [x, y, z], STONE, {
      scale: [s, 0.55, 0.78],
      group: "diorama-base",
    });
    sphere(`stone_moss_${i}`, 0.155, [x, y + 0.045, z], MOSS_PAINT, {
      scale: [s * 0.95, 0.22, 0.7],
      group: "diorama-base",
    });
  });

  // A small stylized mushroom cluster.
  const mushroomData = [
    [-1.08, 0.28, -0.1, 0.8],
    [1.08, 0.24, -0.12, 0.62],
    [0.86, 0.25, -0.83, 0.52],
  ] as const;

  mushroomData.forEach(([x, y, z, s], i) => {
    rod(
      `mushroom_stem_${i}`,
      [x, y - 0.08, z],
      [x, y + 0.12 * s, z],
      0.027 * s,
      CREAM,
      "diorama-base",
    );
    sphere(`mushroom_cap_${i}`, 0.09 * s, [x, y + 0.14 * s, z], RED, {
      scale: [1.4, 0.5, 1.15],
      group: "diorama-base",
    });
    sphere(`mushroom_spot_${i}`, 0.018 * s, [x + 0.028, y + 0.165 * s, z], CREAM, {
      scale: [1, 0.35, 1],
      group: "diorama-base",
    });
  });

  // Foundation and crooked timber wall.
  box("foundation_block", [1.73, 0.16, 1.37], [0, 1.235, 0], WOOD_DARK, {
    group: "hut-foundation",
  });

  box("main_wall_body", [1.6, 1.02, 1.22], [0, 1.73, 0], WALL_PAINT, {
    group: "hut-walls",
  });

  // Corner posts.
  [-1, 1].forEach((s) => {
    [-1, 1].forEach((zSide) => {
      box(
        `corner_post_${s}_${zSide}`,
        [0.14, 1.16, 0.14],
        [s * 0.77, 1.75, zSide * 0.59],
        BEAM_PAINT,
        { group: "hut-beams" },
      );
      sphere(
        `corner_post_cap_${s}_${zSide}`,
        0.075,
        [s * 0.77, 2.34, zSide * 0.59],
        GOLD,
        { scale: [1, 0.45, 1], group: "hut-beams" },
      );
    });
  });

  // Horizontal log courses and a low folk-painted foundation stripe.
  [1.3, 1.61, 1.92, 2.22].forEach((y, i) => {
    rod(`front_log_${i}`, [-0.76, y, 0.63], [0.76, y, 0.63], 0.037, BEAM_PAINT);
    rod(`back_log_${i}`, [-0.76, y, -0.63], [0.76, y, -0.63], 0.037, BEAM_PAINT);
  });

  [-1, 1].forEach((s) => {
    [1.38, 1.82, 2.18].forEach((y, i) => {
      rod(
        `side_log_${s}_${i}`,
        [s * 0.82, y, -0.57],
        [s * 0.82, y, 0.57],
        0.032,
        BEAM_PAINT,
      );
    });
  });

  // Vertical plank accents on the side walls.
  [-0.38, 0, 0.38].forEach((z, i) => {
    box(`left_side_plank_${i}`, [0.025, 0.83, 0.045], [-0.825, 1.72, z], WOOD_RED);
    box(`right_side_plank_${i}`, [0.025, 0.83, 0.045], [0.825, 1.72, z], WOOD_RED);
  });

  // Triangular gables.
  const frontGable = b.extrude(
    [
      [-0.82, 0],
      [0.82, 0],
      [0, 0.68],
    ],
    {
      at: [0, 2.2, 0.64],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.012,
      smoothing: 1,
      color: WALL_PAINT,
      bone: root,
      name: "front_gable",
      group: "hut-gables",
    },
  );

  b.extrude(
    [
      [-0.82, 0],
      [0.82, 0],
      [0, 0.68],
    ],
    {
      at: [0, 2.2, -0.64],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.012,
      smoothing: 1,
      color: WALL_PAINT,
      bone: root,
      name: "rear_gable",
      group: "hut-gables",
    },
  );

  // Bright triangular face edging.
  rod("gable_left_trim", [-0.81, 2.22, 0.72], [0, 2.88, 0.72], 0.025, RED);
  rod("gable_right_trim", [0, 2.88, 0.72], [0.81, 2.22, 0.72], 0.025, RED);
  rod("gable_base_trim", [-0.8, 2.22, 0.72], [0.8, 2.22, 0.72], 0.026, OCHRE);

  // Roof planes, with chunky battens and a rounded ridge.
  const roofAngle = 32;
  const rightRoof = box(
    "right_thatch_roof",
    [1.28, 0.14, 1.54],
    [0.44, 2.62, 0],
    THATCH,
    {
      rotation: [0, 0, -roofAngle],
      group: "thatch-roof",
    },
  );
  const leftRoof = box(
    "left_thatch_roof",
    [1.28, 0.14, 1.54],
    [-0.44, 2.62, 0],
    THATCH,
    {
      rotation: [0, 0, roofAngle],
      group: "thatch-roof",
    },
  );

  const cosA = Math.cos((roofAngle * Math.PI) / 180);
  const sinA = Math.sin((roofAngle * Math.PI) / 180);

  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const u = -0.49 + i * 0.19;
      const x = side * 0.44 + side * u * cosA;
      const y = 2.62 - side * u * sinA;
      box(
        `roof_batten_${side}_${i}`,
        [0.045, 0.12, 1.58],
        [x, y, 0],
        ROOF_DARK,
        {
          rotation: [0, 0, -side * roofAngle],
          group: "thatch-roof",
        },
      );
    }

    const ridgeX = side * 0.04;
    const eaveX = side * 0.93;
    const eaveY = 2.31;
    rod(
      `roof_front_edge_${side}`,
      [ridgeX, 2.94, 0.81],
      [eaveX, eaveY, 0.81],
      0.035,
      RED,
      "thatch-roof",
    );
    rod(
      `roof_back_edge_${side}`,
      [ridgeX, 2.94, -0.81],
      [eaveX, eaveY, -0.81],
      0.032,
      ROOF_DARK,
      "thatch-roof",
    );
  }

  rod("roof_ridge", [0, 2.95, -0.86], [0, 2.95, 0.86], 0.065, ROOF_DARK, "thatch-roof");
  sphere("ridge_front_finial", 0.09, [0, 2.96, 0.87], GOLD, {
    scale: [0.7, 1.3, 0.7],
    group: "thatch-roof",
  });
  sphere("ridge_back_finial", 0.075, [0, 2.96, -0.87], RED, {
    scale: [0.7, 1.3, 0.7],
    group: "thatch-roof",
  });

  // Ragged hanging thatch along both eaves.
  const fringeFront: ReturnType<typeof frame>[] = [];
  const fringeBack: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 13; i++) {
    const z = -0.73 + i * 0.122;
    fringeFront.push(frame([0.96, 2.31, z], [0, 1, 0]));
    fringeFront.push(frame([-0.96, 2.31, z], [0, 1, 0]));
    fringeBack.push(frame([0.96, 2.31, z], [0, 1, 0]));
    fringeBack.push(frame([-0.96, 2.31, z], [0, 1, 0]));
  }
  b.cards(fringeFront, THATCH_CARD, {
    size: [0.06, 0.2],
    lean: 180,
    flow: [0, 0, 1],
    bend: 8,
    vary: 0.22,
    rng: rng(101),
    color: ROOF_GOLD,
    name: "front_thatch_fringe",
    group: "thatch-roof",
  });
  b.cards(fringeBack, THATCH_CARD, {
    size: [0.05, 0.17],
    lean: 180,
    flow: [0, 0, 1],
    bend: 8,
    vary: 0.25,
    rng: rng(102),
    color: ROOF_GOLD,
    name: "back_thatch_fringe",
    group: "thatch-roof",
  });

  // Main front door and its heavy folk-painted surround.
  box("door_left_post", [0.11, 0.84, 0.12], [-0.29, 1.72, 0.69], WOOD_RED);
  box("door_right_post", [0.11, 0.84, 0.12], [0.29, 1.72, 0.69], WOOD_RED);
  box("door_lintel", [0.69, 0.12, 0.12], [0, 2.15, 0.69], WOOD_RED);

  const door = b.part(new THREE.PlaneGeometry(0.46, 0.78), "#ffffff", {
    at: [0, 1.72, 0.758],
    bone: root,
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR_TEXTURE,
    name: "painted_front_door",
    group: "front-facade",
  });

  sphere("door_knob", 0.038, [0.13, 1.69, 0.79], GOLD, {
    group: "front-facade",
  });
  rod("door_threshold", [-0.29, 1.31, 0.73], [0.29, 1.31, 0.73], 0.025, OCHRE);

  // Two front windows, each a layered miniature folk painting.
  const frontWindowXs = [-0.57, 0.57];
  frontWindowXs.forEach((x, i) => {
    box(`window_frame_left_${i}`, [0.07, 0.43, 0.11], [x - 0.21, 1.9, 0.69], WOOD_RED);
    box(`window_frame_right_${i}`, [0.07, 0.43, 0.11], [x + 0.21, 1.9, 0.69], WOOD_RED);
    box(`window_frame_top_${i}`, [0.49, 0.07, 0.11], [x, 2.12, 0.69], WOOD_RED);
    box(`window_frame_bottom_${i}`, [0.49, 0.07, 0.11], [x, 1.68, 0.69], WOOD_RED);

    const pane = b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      at: [x, 1.9, 0.757],
      bone: root,
      dir: [0, 0, 1],
      axis: "z",
      texture: WINDOW_TEXTURE,
      name: `painted_front_window_${i}`,
      group: "front-facade",
    });
    glow(pane, 1.25);

    rod(`window_cross_v_${i}`, [x, 1.72, 0.77], [x, 2.08, 0.77], 0.018, OCHRE);
    rod(`window_cross_h_${i}`, [x - 0.17, 1.9, 0.77], [x + 0.17, 1.9, 0.77], 0.018, OCHRE);
  });

  // A small side window gives the hut a readable three-quarter silhouette.
  box("side_window_top", [0.1, 0.07, 0.49], [0.84, 2.12, 0.02], WOOD_RED);
  box("side_window_bottom", [0.1, 0.07, 0.49], [0.84, 1.68, 0.02], WOOD_RED);
  box("side_window_back", [0.1, 0.43, 0.07], [0.84, 1.9, -0.22], WOOD_RED);
  box("side_window_front", [0.1, 0.43, 0.07], [0.84, 1.9, 0.22], WOOD_RED);
  const sidePane = b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    at: [0.897, 1.9, 0.0],
    bone: root,
    dir: [1, 0, 0],
    axis: "z",
    texture: WINDOW_TEXTURE,
    name: "painted_side_window",
    group: "side-facade",
  });
  glow(sidePane, 1.1);
  rod("side_window_cross_z", [0.9, 1.9, -0.17], [0.9, 1.9, 0.17], 0.018, OCHRE);
  rod("side_window_cross_y", [0.9, 1.73, 0], [0.9, 2.07, 0], 0.018, OCHRE);

  // Central diamond motif on the gable and three smaller enamel diamonds.
  const motif = b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
    at: [0, 2.57, 0.761],
    bone: root,
    dir: [0, 0, 1],
    axis: "z",
    texture: MOTIF_TEXTURE,
    name: "gable_sun_motif",
    group: "folk-ornament",
  });

  [-0.46, 0, 0.46].forEach((x, i) => {
    b.extrude(
      [
        [0, 0.075],
        [0.075, 0],
        [0, -0.075],
        [-0.075, 0],
      ],
      {
        at: [x, 2.34, 0.766],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.005,
        color: i === 1 ? TEAL : RED,
        bone: root,
        name: `gable_diamond_${i}`,
        group: "folk-ornament",
      },
    );
    sphere(`gable_diamond_dot_${i}`, 0.016, [x, 2.34, 0.79], GOLD, {
      group: "folk-ornament",
    });
  });

  // Surface-seated brass boss on the gable, using the actual built triangle surface.
  const gableSurface = b.surface(frontGable);
  const gableBossHit = gableSurface.nearest([0, 2.67, 0.82]);
  b.stick(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), GOLD, gableBossHit, {
    embed: 0.18,
    name: "gable_surface_boss",
    group: "folk-ornament",
  });

  // Folk-painted corner rosettes and beam studs.
  [-1, 1].forEach((s) => {
    [1.42, 1.94].forEach((y, j) => {
      sphere(`front_corner_rosette_${s}_${j}`, 0.045, [s * 0.77, y, 0.72], GOLD, {
        scale: [1, 1, 0.35],
        group: "folk-ornament",
      });
    });
  });

  // Bells and a little charm hanging under the front eave.
  [0.38, -0.38].forEach((x, i) => {
    rod(`bell_string_${i}`, [x, 2.28, 0.75], [x, 2.08, 0.77], 0.012, INK, "folk-ornament");
    const bell = b.part(
      new THREE.ConeGeometry(0.07, 0.1, 8),
      GOLD,
      {
        at: [x, 2.02, 0.78],
        bone: root,
        name: `brass_bell_${i}`,
        group: "folk-ornament",
      },
    );
    sphere(`bell_clapper_${i}`, 0.018, [x, 1.96, 0.79], INK, {
      group: "folk-ornament",
    });
  });

  // A little raven-like weather vane silhouette on the ridge.
  rod("weather_vane_post", [0, 2.97, 0], [0, 3.22, 0], 0.018, INK, "roof-ornament");
  rod("weather_vane_arm", [-0.16, 3.17, 0], [0.18, 3.17, 0], 0.014, GOLD, "roof-ornament");
  b.extrude(
    [
      [-0.1, 0],
      [0.02, 0.07],
      [0.12, 0.04],
      [0.18, 0.11],
      [0.14, 0.21],
      [0.03, 0.15],
      [-0.08, 0.2],
      [-0.14, 0.1],
    ],
    {
      at: [0.02, 3.16, 0.015],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: INK,
      bone: root,
      name: "raven_weather_vane",
      group: "roof-ornament",
    },
  );

  // A carved hanging sign on the visible right side.
  rod("sign_bracket_top", [0.8, 2.23, 0.27], [1.04, 2.23, 0.27], 0.018, BEAM_PAINT, "sign");
  rod("sign_bracket_bottom", [0.8, 2.02, 0.27], [1.04, 2.02, 0.27], 0.018, BEAM_PAINT, "sign");
  box("sign_board", [0.04, 0.27, 0.5], [1.06, 2.12, 0.27], WOOD_DARK, {
    rotation: [0, 0, 0],
    group: "sign",
  });
  const signFace = b.part(new THREE.PlaneGeometry(0.42, 0.21), "#ffffff", {
    at: [1.088, 2.12, 0.27],
    bone: root,
    dir: [1, 0, 0],
    axis: "z",
    texture: SIGN_TEXTURE,
    name: "baba_sign_face",
    group: "sign",
  });

  // Baba Yaga's broom leaning against the side.
  rod("broom_handle", [0.92, 0.23, 0.48], [1.05, 1.95, 0.54], 0.027, WOOD_LIGHT, "broom");
  sphere("broom_handle_cap", 0.035, [1.05, 1.96, 0.54], RED, {
    group: "broom",
  });

  const broomFrames = [
    frame([0.92, 0.29, 0.48], [0, 1, 0]),
    frame([0.94, 0.29, 0.48], [0, 1, 0]),
    frame([0.96, 0.29, 0.48], [0, 1, 0]),
  ];
  b.cards(broomFrames, BROOM_CARD, {
    size: [0.13, 0.3],
    lean: 180,
    flow: [1, 0, 0],
    bend: 18,
    vary: 0.15,
    rng: rng(55),
    color: ROOF_GOLD,
    name: "broom_bristles",
    group: "broom",
  });
  rod("broom_binding", [0.87, 0.4, 0.48], [0.99, 0.4, 0.48], 0.022, RED, "broom");

  // A few bright feathers tucked into the roof and leg cuffs.
  const crestFrames = [
    frame([-0.22, 2.91, 0.74], [0, 1, 0]),
    frame([-0.12, 2.96, 0.74], [0, 1, 0]),
    frame([0.22, 2.91, 0.74], [0, 1, 0]),
  ];
  b.cards(crestFrames, FEATHER_CARD, {
    size: [0.08, 0.24],
    lean: 12,
    flow: [0, 0, -1],
    bend: 18,
    vary: 0.12,
    rng: rng(73),
    color: RED,
    name: "roof_feather_tuft",
    group: "roof-ornament",
  });

  // Mossy lichen tufts along the foundation, made from a few broad cards instead of smooth filler.
  const mossFrames = [
    frame([-0.78, 1.31, 0.56], [0, 1, 0]),
    frame([-0.5, 1.28, 0.59], [0, 1, 0]),
    frame([0.5, 1.28, 0.59], [0, 1, 0]),
    frame([0.78, 1.31, 0.56], [0, 1, 0]),
    frame([0.82, 1.3, -0.52], [0, 1, 0]),
  ];
  b.cards(mossFrames, THATCH_CARD, {
    size: [0.045, 0.12],
    lean: 28,
    flow: [0, 0, 1],
    bend: 30,
    vary: 0.3,
    rng: rng(91),
    color: MOSS_LIGHT,
    name: "foundation_moss_tufts",
    group: "diorama-base",
  });

  // Small painted nails on the front wall.
  const nailPoints = [
    [-0.39, 2.18],
    [0.39, 2.18],
    [-0.76, 2.03],
    [0.76, 2.03],
    [-0.76, 1.46],
    [0.76, 1.46],
  ] as const;
  nailPoints.forEach(([x, y], i) => {
    b.stick(
      new THREE.CylinderGeometry(0.022, 0.022, 0.012, 7),
      GOLD,
      frame([x, y, 0.72], [0, 0, 1]),
      {
        embed: 0.15,
        name: `painted_nail_${i}`,
        group: "folk-ornament",
      },
    );
  });

  // A final irregular garland wraps around the front beam, giving the hut a hand-painted festival feel.
  const garlandPath = polyline([
    [-0.69, 2.27, 0.76],
    [-0.45, 2.31, 0.77],
    [-0.2, 2.26, 0.77],
    [0, 2.31, 0.77],
    [0.23, 2.26, 0.77],
    [0.48, 2.31, 0.77],
    [0.69, 2.27, 0.76],
  ]);
  b.sweep(garlandPath, 0.012, {
    color: TEAL,
    caps: "round",
    name: "front_garland",
    group: "folk-ornament",
  });

  // Tiny beads along the garland.
  const beadPositions = [
    [-0.58, 2.29, 0.78],
    [-0.31, 2.28, 0.78],
    [0, 2.3, 0.78],
    [0.31, 2.28, 0.78],
    [0.58, 2.29, 0.78],
  ] as const;
  beadPositions.forEach(([x, y, z], i) => {
    sphere(`garland_bead_${i}`, 0.026, [x, y, z], i % 2 ? GOLD : RED, {
      group: "folk-ornament",
    });
  });

  // A few angular roof chips emphasize the low-poly puppet construction.
  for (let i = 0; i < 4; i++) {
    const z = -0.62 + i * 0.42;
    rod(
      `right_roof_chip_${i}`,
      [0.52, 2.62, z],
      [0.78, 2.46, z],
      0.012,
      OCHRE,
      "thatch-roof",
    );
    rod(
      `left_roof_chip_${i}`,
      [-0.52, 2.62, z],
      [-0.78, 2.46, z],
      0.012,
      OCHRE,
      "thatch-roof",
    );
  }

  // Ensure the hero windows remain luminous after all shared materials are created.
  glow(baseMark, 0.15);

  return b.root;
}

export default build;
```