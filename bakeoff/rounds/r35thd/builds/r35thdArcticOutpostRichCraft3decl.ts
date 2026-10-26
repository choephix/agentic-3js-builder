import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  mottle,
  countershade,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "arctic-research-outpost",
  description:
    "A stylized Firewatch-inspired arctic research outpost diorama with a warm cabin, solar array, antenna mast, snow drifts, supply sled, rocks, warning markers, and glowing windows.",
};

type P = readonly [number, number, number];

const SNOW = "#edf5f2";
const SNOW_LIGHT = "#f9fcf7";
const SNOW_BLUE = "#b8d3dc";
const SNOW_SHADOW = "#7898aa";
const ICE = "#79adbd";
const SKY_BLUE = "#456d88";
const NAVY = "#172f42";
const DEEP = "#101f2d";
const WALL = "#c9583f";
const WALL_LIGHT = "#ed8152";
const WALL_DARK = "#713744";
const ROOF = "#24475b";
const ROOF_LIGHT = "#3d7180";
const WOOD = "#8e563c";
const WOOD_DARK = "#493747";
const ORANGE = "#f0a143";
const YELLOW = "#f5d676";
const BLACK = "#18202b";
const STEEL = "#718b98";
const STEEL_DARK = "#394e5d";
const GLASS = "#9dd9cf";
const WARM = "#ffd36f";
const WARM_WHITE = "#fff1b0";
const RED = "#b63f3e";
const TEAL = "#4b9a9a";
const PALE_TEAL = "#8ed0c7";
const COLD_PURPLE = "#64728e";

const SNOW_PAINT = countershade(SNOW_LIGHT, SNOW_BLUE, { level: -0.15, soft: 0.3 });
const ROCK_PAINT = mottle("#526b7b", "#263d52", { size: 0.3, contrast: 1.35, seed: 11 });
const WALL_PAINT = mottle(WALL_LIGHT, WALL, { size: 0.22, contrast: 1.4, seed: 7 });

const windowTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110">
    <rect width="160" height="110" rx="6" fill="#172d43"/>
    <rect x="8" y="8" width="144" height="94" rx="3" fill="#f6c86a"/>
    <rect x="14" y="14" width="132" height="82" fill="#b7eee0"/>
    <path d="M18 74 Q46 42 72 62 T144 34 V96 H18Z" fill="#6aabb2"/>
    <path d="M22 68 Q50 36 74 58 T142 29" fill="none" stroke="#e9faf0" stroke-width="5" opacity=".8"/>
    <path d="M80 14V96M14 55H146" stroke="#172d43" stroke-width="8"/>
    <path d="M80 17V93M17 55H143" stroke="#edc76d" stroke-width="2"/>
    <circle cx="121" cy="28" r="10" fill="#fff3b0"/>
  </svg>`,
  { size: 256 },
);

const sideWindowTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 100">
    <rect width="130" height="100" rx="5" fill="#1b3448"/>
    <rect x="8" y="8" width="114" height="84" fill="#9fd7cf"/>
    <path d="M8 69 Q30 42 52 57 T122 35V92H8Z" fill="#6293a8"/>
    <path d="M16 62 Q44 37 64 53 T116 33" fill="none" stroke="#e9f9ef" stroke-width="4"/>
    <path d="M65 8V92" stroke="#1b3448" stroke-width="8"/>
    <path d="M65 11V89" stroke="#f1ca71" stroke-width="2"/>
    <circle cx="99" cy="23" r="8" fill="#fff0aa"/>
  </svg>`,
  { size: 256 },
);

const solarTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150">
    <rect width="240" height="150" fill="#152d47"/>
    <g fill="#356b8b" stroke="#79c7c2" stroke-width="2">
      <rect x="6" y="6" width="52" height="42"/><rect x="64" y="6" width="52" height="42"/><rect x="122" y="6" width="52" height="42"/><rect x="180" y="6" width="54" height="42"/>
      <rect x="6" y="54" width="52" height="42"/><rect x="64" y="54" width="52" height="42"/><rect x="122" y="54" width="52" height="42"/><rect x="180" y="54" width="54" height="42"/>
      <rect x="6" y="102" width="52" height="42"/><rect x="64" y="102" width="52" height="42"/><rect x="122" y="102" width="52" height="42"/><rect x="180" y="102" width="54" height="42"/>
    </g>
    <path d="M9 38L48 9M67 38L106 9M125 38L164 9M183 38L224 9M9 86L48 57M67 86L106 57M125 86L164 57M183 86L224 57M9 134L48 105M67 134L106 105M125 134L164 105M183 134L224 105" stroke="#88d8d0" stroke-width="2" opacity=".5"/>
  </svg>`,
  { size: 256 },
);

const logoTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120">
    <rect width="220" height="120" rx="12" fill="#243747"/>
    <path d="M18 91 L45 22 L70 91" fill="none" stroke="#f4cf72" stroke-width="8"/>
    <path d="M34 69 H57" stroke="#f4cf72" stroke-width="7"/>
    <circle cx="45" cy="61" r="7" fill="#e96c48"/>
    <text x="88" y="54" fill="#f7d57c" font-family="sans-serif" font-size="25" font-weight="bold">NORTH</text>
    <text x="90" y="82" fill="#9dd9cf" font-family="sans-serif" font-size="18" letter-spacing="4">FIELD 07</text>
  </svg>`,
  { size: 256 },
);

const warningTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
    <rect width="160" height="120" rx="8" fill="#192a35"/>
    <path d="M80 12 L146 105 H14 Z" fill="#f5c64f" stroke="#172431" stroke-width="8" stroke-linejoin="round"/>
    <path d="M80 37V72" stroke="#172431" stroke-width="12" stroke-linecap="round"/>
    <circle cx="80" cy="89" r="7" fill="#172431"/>
  </svg>`,
  { size: 192 },
);

const mapTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
    <rect width="180" height="120" fill="#dfcb9b"/>
    <path d="M-10 80 Q25 28 62 74 T135 38 T205 72" fill="none" stroke="#9a7654" stroke-width="4"/>
    <path d="M-10 96 Q28 48 66 91 T137 55 T205 89" fill="none" stroke="#b08a60" stroke-width="3"/>
    <path d="M-12 57 Q24 8 55 53 T125 22 T198 55" fill="none" stroke="#bd9667" stroke-width="2"/>
    <path d="M103 22 L115 74 L149 88 L139 42 Z" fill="#82aeba" opacity=".7"/>
    <path d="M112 24 L112 85M90 63H147" stroke="#344f57" stroke-width="2"/>
    <circle cx="112" cy="63" r="7" fill="#d84e44"/>
    <text x="15" y="20" font-family="sans-serif" font-size="12" font-weight="bold" fill="#4c3b35">POLAR SECTOR</text>
  </svg>`,
  { size: 256 },
);

const instrumentTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100">
    <rect width="150" height="100" rx="6" fill="#1c303d"/>
    <rect x="12" y="12" width="126" height="62" rx="3" fill="#6ca49b"/>
    <path d="M20 59 L47 45 L67 52 L87 28 L112 42 L130 26" fill="none" stroke="#f7d56e" stroke-width="4"/>
    <path d="M20 62H130" stroke="#d1eee0" stroke-width="2"/>
    <circle cx="33" cy="86" r="6" fill="#dc6651"/><circle cx="58" cy="86" r="6" fill="#e7c568"/><circle cx="83" cy="86" r="6" fill="#80c8bc"/>
    <text x="101" y="90" fill="#f4e7bc" font-size="11" font-family="sans-serif">WX-07</text>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: P,
  at: P,
  color: any,
  extra: any = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    flat: true,
    ...extra,
  });
}

function cyl(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  at: P,
  color: any,
  dir: P = [0, 1, 0],
  segments = 8,
  extra: any = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false),
    color,
    { at, dir, flat: true, ...extra },
  );
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: P,
  color: any,
  scale: P = [1, 1, 1],
  segments = 8,
  rings = 5,
  extra: any = {},
) {
  return b.part(
    new THREE.SphereGeometry(radius, segments, rings),
    color,
    { at, scale, flat: true, ...extra },
  );
}

function rod(
  b: ReturnType<typeof createBuilder>,
  a: P,
  c: P,
  radius: number,
  color: any,
  extra: any = {},
) {
  return b.rod(a, c, radius, color, { sides: 6, section: { ngon: 6 }, ...extra });
}

function plane(
  b: ReturnType<typeof createBuilder>,
  width: number,
  height: number,
  at: P,
  dir: P,
  texture: THREE.Texture,
  color = "#ffffff",
  extra: any = {},
) {
  return b.part(new THREE.PlaneGeometry(width, height), color, {
    at,
    dir,
    axis: "z",
    up: [0, 1, 0],
    texture,
    ...extra,
  });
}

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 0.82, paintSize: 1024 });

  // ---------------------------------------------------------------------------------------------------------------
  // Snow island and layered ice shelf

  b.extrude(
    [
      [-3.8, -2.55],
      [-2.1, -2.85],
      [-0.5, -2.6],
      [1.8, -2.8],
      [3.75, -2.05],
      [3.95, -0.55],
      [3.55, 1.35],
      [2.2, 2.55],
      [0.2, 2.7],
      [-1.65, 2.45],
      [-3.5, 1.7],
      [-4.1, 0.2],
    ],
    {
      at: [0, 0.16, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.28,
      bevel: 0.08,
      smoothing: 1,
      color: SNOW_SHADOW,
      name: "iceShelf",
      group: "ground",
    },
  );

  b.extrude(
    [
      [-3.55, -2.3],
      [-1.9, -2.52],
      [-0.45, -2.32],
      [1.8, -2.48],
      [3.45, -1.82],
      [3.62, -0.45],
      [3.25, 1.2],
      [2.03, 2.3],
      [0.1, 2.44],
      [-1.5, 2.18],
      [-3.2, 1.52],
      [-3.82, 0.15],
    ],
    {
      at: [0, 0.34, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.11,
      bevel: 0.05,
      smoothing: 1,
      color: SNOW_PAINT,
      name: "snowTop",
      group: "ground",
    },
  );

  // Blue ice slabs along the near edge.
  const iceSlabs: Array<[P, P]> = [
    [[-3.35, 0.38, -2.38], [0.72, 0.11, 0.16]],
    [[-2.35, 0.37, -2.58], [0.48, 0.1, 0.2]],
    [[-1.45, 0.36, -2.52], [0.92, 0.12, 0.14]],
    [[0.12, 0.37, -2.55], [0.58, 0.1, 0.18]],
    [[1.2, 0.37, -2.55], [0.8, 0.1, 0.16]],
    [[2.42, 0.37, -2.24], [0.55, 0.11, 0.2]],
    [[3.34, 0.36, -1.25], [0.2, 0.12, 0.74]],
    [[-3.6, 0.36, 1.75], [0.24, 0.1, 0.62]],
  ];
  iceSlabs.forEach(([at, size], i) =>
    box(b, size, at, ICE, { rotation: [0, i * 7 - 15, i % 2 ? 5 : -4], group: "ground" }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Low-poly rocks and snow-covered boulders

  const rocks: Array<{ p: P; s: P; r: number; c: any }> = [
    { p: [-3.25, 0.62, 1.45], s: [1.1, 0.8, 0.9], r: 0.55, c: ROCK_PAINT },
    { p: [-2.78, 0.46, 1.95], s: [0.65, 0.55, 0.8], r: 0.42, c: "#405b70" },
    { p: [3.0, 0.58, 1.85], s: [1.0, 0.85, 0.72], r: 0.52, c: ROCK_PAINT },
    { p: [3.48, 0.45, 1.2], s: [0.55, 0.6, 0.6], r: 0.4, c: "#3c566b" },
    { p: [-3.25, 0.52, -1.55], s: [0.8, 0.72, 0.75], r: 0.5, c: ROCK_PAINT },
    { p: [3.0, 0.48, -1.75], s: [0.72, 0.64, 0.9], r: 0.46, c: "#3b5669" },
    { p: [-1.5, 0.4, -2.18], s: [0.75, 0.48, 0.48], r: 0.34, c: "#526e7f" },
    { p: [2.25, 0.42, 2.25], s: [0.62, 0.58, 0.52], r: 0.36, c: ROCK_PAINT },
    { p: [-0.95, 0.42, 2.28], s: [0.52, 0.5, 0.62], r: 0.34, c: "#466478" },
    { p: [1.18, 0.42, -2.12], s: [0.62, 0.48, 0.55], r: 0.34, c: "#405c70" },
  ];

  rocks.forEach((rock, i) => {
    sphere(b, rock.r, rock.p, rock.c, rock.s, 7, 4, {
      rotation: [i * 11, i * 19, i * 7],
      group: "rocks",
    });
    const capY = rock.p[1] + rock.r * rock.s[1] * 0.55;
    sphere(
      b,
      rock.r * 0.5,
      [rock.p[0] - rock.r * 0.12, capY, rock.p[2] + rock.r * 0.05],
      SNOW_LIGHT,
      [rock.s[0] * 0.72, 0.35, rock.s[2] * 0.72],
      7,
      3,
      { group: "snowCaps" },
    );
  });

  const drifts: Array<[P, P]> = [
    [[-2.75, 0.53, 0.3], [1.0, 0.35, 0.6]],
    [[2.78, 0.53, 0.55], [1.2, 0.38, 0.7]],
    [[-1.9, 0.48, -1.92], [0.9, 0.28, 0.55]],
    [[1.9, 0.49, 1.9], [0.95, 0.3, 0.6]],
    [[-3.35, 0.48, -0.35], [0.55, 0.3, 1.0]],
    [[3.2, 0.5, -0.5], [0.62, 0.3, 0.9]],
    [[-0.3, 0.46, 2.3], [1.1, 0.25, 0.4]],
    [[1.0, 0.46, -2.22], [0.95, 0.27, 0.4]],
  ];
  drifts.forEach(([at, scale], i) =>
    sphere(b, 0.55, at, SNOW_LIGHT, scale, 8, 4, {
      rotation: [0, i * 18, 0],
      group: "drifts",
    }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Orange boundary poles and colored snow markers

  const markerPositions: P[] = [
    [-3.48, 0.36, -1.95],
    [-3.78, 0.36, 0.55],
    [-2.15, 0.36, 2.28],
    [0.8, 0.36, 2.48],
    [3.45, 0.36, 1.0],
    [3.48, 0.36, -1.32],
  ];

  markerPositions.forEach((p, i) => {
    rod(b, [p[0], p[1], p[2]], [p[0], 1.0, p[2]], 0.025, ORANGE, { group: "markers" });
    cyl(b, 0.055, 0.13, [p[0], 0.73, p[2]], i % 2 ? YELLOW : RED, [0, 1, 0], 6, {
      group: "markers",
    });
    cyl(b, 0.055, 0.13, [p[0], 0.92, p[2]], i % 2 ? RED : YELLOW, [0, 1, 0], 6, {
      group: "markers",
    });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Cabin foundation, stilts, deck and structural braces

  box(b, [3.12, 0.16, 1.92], [0, 0.94, 0.18], WOOD_DARK, { name: "deck", group: "cabin" });

  const stilts: P[] = [
    [-1.18, 0.64, -0.43],
    [1.18, 0.64, -0.43],
    [-1.18, 0.64, 0.8],
    [1.18, 0.64, 0.8],
  ];
  stilts.forEach((p, i) => {
    box(b, [0.2, 0.62, 0.2], p, WOOD_DARK, { group: "stilts" });
    box(b, [0.28, 0.11, 0.28], [p[0], 0.91, p[2]], WOOD, { group: "stilts" });
    box(b, [0.3, 0.1, 0.3], [p[0], 0.36, p[2]], SNOW_SHADOW, { group: "stilts" });
  });

  rod(b, [-1.18, 0.52, -0.4], [0.98, 0.88, 0.74], 0.035, WOOD_DARK, { group: "braces" });
  rod(b, [1.18, 0.52, -0.4], [-0.98, 0.88, 0.74], 0.035, WOOD_DARK, { group: "braces" });
  rod(b, [-1.18, 0.52, 0.8], [0.98, 0.88, -0.28], 0.035, WOOD_DARK, { group: "braces" });
  rod(b, [1.18, 0.52, 0.8], [-0.98, 0.88, -0.28], 0.035, WOOD_DARK, { group: "braces" });

  // Cabin main body and bold siding bands
  box(b, [2.78, 1.35, 1.55], [0, 1.62, 0.18], WALL_PAINT, {
    name: "cabinBody",
    group: "cabin",
  });

  for (let i = 0; i < 6; i++) {
    const y = 1.04 + i * 0.22;
    box(b, [2.84, 0.035, 0.055], [0, y, 0.97], WALL_DARK, { group: "siding" });
    box(b, [0.055, 0.035, 1.58], [-1.38, y, 0.18], WALL_DARK, { group: "siding" });
    box(b, [0.055, 0.035, 1.58], [1.38, y, 0.18], WALL_DARK, { group: "siding" });
  }

  // Corner posts and fascia
  box(b, [0.16, 1.46, 0.16], [-1.38, 1.64, 0.18], WALL_DARK, { group: "trim" });
  box(b, [0.16, 1.46, 0.16], [1.38, 1.64, 0.18], WALL_DARK, { group: "trim" });
  box(b, [2.92, 0.12, 0.12], [0, 2.27, 0.18], WOOD_DARK, { group: "trim" });
  box(b, [2.94, 0.1, 0.1], [0, 0.98, 0.18], WOOD_DARK, { group: "trim" });

  // Steep roof planes
  box(b, [1.68, 0.13, 1.78], [-0.67, 2.48, 0.18], ROOF, {
    rotation: [0, 0, -33],
    name: "roofL",
    group: "roof",
  });
  box(b, [1.68, 0.13, 1.78], [0.67, 2.48, 0.18], ROOF_LIGHT, {
    rotation: [0, 0, 33],
    name: "roofR",
    group: "roof",
  });
  box(b, [0.15, 0.19, 1.88], [0, 2.89, 0.18], WOOD_DARK, { group: "roof" });
  rod(b, [-1.33, 2.1, 1.02], [-1.33, 2.1, -0.66], 0.045, WOOD_DARK, { group: "roofTrim" });
  rod(b, [1.33, 2.1, 1.02], [1.33, 2.1, -0.66], 0.045, WOOD_DARK, { group: "roofTrim" });

  // ---------------------------------------------------------------------------------------------------------------
  // Front facade: warm picture window, door, sign, steps and hardware

  const frontWindow = plane(
    b,
    1.02,
    0.72,
    [-0.52, 1.72, 0.969],
    [0, 0, 1],
    windowTexture,
    "#ffffff",
    { name: "frontWindow", group: "windows" },
  );
  glow(frontWindow, 1.15);

  box(b, [1.12, 0.07, 0.08], [-0.52, 2.11, 0.991], WOOD_DARK, { group: "windowTrim" });
  box(b, [1.12, 0.07, 0.08], [-0.52, 1.33, 0.991], WOOD_DARK, { group: "windowTrim" });
  box(b, [0.08, 0.84, 0.08], [-1.08, 1.72, 0.991], WOOD_DARK, { group: "windowTrim" });
  box(b, [0.08, 0.84, 0.08], [0.04, 1.72, 0.991], WOOD_DARK, { group: "windowTrim" });

  box(b, [0.62, 1.1, 0.075], [0.83, 1.55, 0.982], WOOD_DARK, {
    name: "frontDoor",
    group: "door",
  });
  box(b, [0.5, 0.92, 0.04], [0.83, 1.56, 1.028], WALL_DARK, { group: "door" });
  box(b, [0.42, 0.055, 0.055], [0.83, 2.09, 1.034], WOOD, { group: "door" });
  box(b, [0.42, 0.055, 0.055], [0.83, 1.05, 1.034], WOOD, { group: "door" });
  cyl(b, 0.035, 0.08, [0.62, 1.55, 1.06], YELLOW, [0, 0, 1], 8, { group: "door" });
  cyl(b, 0.018, 0.04, [0.62, 1.55, 1.11], BLACK, [0, 0, 1], 6, { group: "door" });

  const logo = plane(
    b,
    0.58,
    0.32,
    [0.83, 1.86, 1.045],
    [0, 0, 1],
    logoTexture,
    "#ffffff",
    { group: "doorSign" },
  );
  glow(logo, 0.18);

  for (let i = 0; i < 4; i++) {
    box(
      b,
      [0.78, 0.11, 0.42],
      [0.83, 1.03 + i * 0.18, 1.28 + i * 0.15],
      WOOD_DARK,
      { group: "stairs" },
    );
  }
  box(b, [0.88, 0.1, 0.08], [0.83, 0.96, 1.42], WOOD, { group: "stairs" });
  rod(b, [0.48, 1.02, 1.22], [0.48, 1.67, 1.22], 0.025, WOOD_DARK, { group: "handrail" });
  rod(b, [1.18, 1.02, 1.22], [1.18, 1.67, 1.22], 0.025, WOOD_DARK, { group: "handrail" });
  rod(b, [0.48, 1.67, 1.22], [1.18, 1.67, 1.22], 0.025, WOOD_DARK, { group: "handrail" });

  const frontSign = plane(
    b,
    0.36,
    0.27,
    [-1.18, 1.17, 1.04],
    [0, 0, 1],
    warningTexture,
    "#ffffff",
    { group: "warningSigns" },
  );
  box(b, [0.43, 0.035, 0.04], [-1.18, 1.34, 1.05], BLACK, { group: "warningSigns" });
  box(b, [0.43, 0.035, 0.04], [-1.18, 1.0, 1.05], BLACK, { group: "warningSigns" });

  // Side window and exterior instrument cabinet
  const sideWindow = plane(
    b,
    0.82,
    0.61,
    [1.391, 1.72, 0.22],
    [1, 0, 0],
    sideWindowTexture,
    "#ffffff",
    { group: "windows" },
  );
  glow(sideWindow, 1.05);
  box(b, [0.08, 0.71, 0.94], [1.414, 1.72, 0.22], WOOD_DARK, { group: "windowTrim" });
  box(b, [0.1, 0.78, 0.08], [1.43, 2.13, 0.22], WOOD_DARK, { group: "windowTrim" });
  box(b, [0.1, 0.78, 0.08], [1.43, 1.31, 0.22], WOOD_DARK, { group: "windowTrim" });

  box(b, [0.62, 0.45, 0.12], [1.45, 1.2, -0.35], STEEL_DARK, { group: "instrumentBox" });
  const instrumentPanel = plane(
    b,
    0.49,
    0.28,
    [1.52, 1.2, -0.35],
    [1, 0, 0],
    instrumentTexture,
    "#ffffff",
    { group: "instrumentBox" },
  );
  glow(instrumentPanel, 0.28);
  for (let i = 0; i < 3; i++) {
    cyl(b, 0.02, 0.06, [1.54, 1.08 + i * 0.12, -0.35], YELLOW, [1, 0, 0], 6, {
      group: "instrumentBox",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Chimney and stylized smoke

  box(b, [0.24, 0.5, 0.24], [0.83, 2.98, -0.2], STEEL_DARK, { group: "chimney" });
  box(b, [0.34, 0.08, 0.34], [0.83, 3.24, -0.2], BLACK, { group: "chimney" });
  cyl(b, 0.15, 0.07, [0.83, 3.29, -0.2], STEEL, [0, 1, 0], 8, { group: "chimney" });

  sphere(b, 0.18, [0.84, 3.52, -0.22], COLD_PURPLE, [1.1, 0.8, 1.0], 7, 4, { group: "smoke" });
  sphere(b, 0.25, [0.76, 3.82, -0.18], COLD_PURPLE, [0.9, 1.1, 1.0], 7, 4, { group: "smoke" });
  sphere(b, 0.17, [0.88, 4.1, -0.13], SNOW_BLUE, [1.2, 0.85, 1.0], 7, 4, { group: "smoke" });

  // ---------------------------------------------------------------------------------------------------------------
  // Rear antenna mast, crossbars, beacon, satellite dish and anemometer

  const mastBase: P = [-1.9, 0.38, -0.82];
  rod(b, mastBase, [-1.9, 4.18, -0.82], 0.045, STEEL_DARK, { name: "antennaMast", group: "mast" });
  rod(b, [-1.9, 0.5, -0.82], [-1.43, 3.95, -0.56], 0.027, STEEL, { group: "mast" });
  rod(b, [-1.9, 0.5, -0.82], [-2.37, 3.95, -0.56], 0.027, STEEL, { group: "mast" });

  [1.55, 2.28, 3.02, 3.66].forEach((y, i) => {
    rod(b, [-2.22, y, -0.82], [-1.58, y, -0.82], 0.024, STEEL, { group: "mast" });
    cyl(b, 0.07, 0.08, [-1.9, y, -0.82], i % 2 ? ORANGE : PALE_TEAL, [0, 1, 0], 7, {
      group: "mast",
    });
  });

  cyl(b, 0.1, 0.18, [-1.9, 4.28, -0.82], RED, [0, 1, 0], 8, { group: "beacon" });
  sphere(b, 0.07, [-1.9, 4.42, -0.82], WARM, [1, 1, 0.65], 8, 4, { group: "beacon" });
  glow(
    b.part(new THREE.SphereGeometry(0.07, 8, 4), WARM, {
      at: [-1.9, 4.42, -0.82],
      scale: [1, 1, 0.65],
      flat: true,
      group: "beacon",
    }),
    1.5,
  );

  rod(b, [-1.9, 3.55, -0.82], [-1.9, 3.55, -0.2], 0.018, STEEL, { group: "weatherSensor" });
  rod(b, [-1.9, 3.55, -0.82], [-2.42, 3.55, -0.82], 0.018, STEEL, { group: "weatherSensor" });
  rod(b, [-1.9, 3.55, -0.82], [-1.64, 3.55, -1.27], 0.018, STEEL, { group: "weatherSensor" });
  sphere(b, 0.07, [-1.9, 3.55, -0.2], ORANGE, [1, 0.7, 1], 7, 4, { group: "weatherSensor" });
  sphere(b, 0.07, [-2.42, 3.55, -0.82], ORANGE, [1, 0.7, 1], 7, 4, { group: "weatherSensor" });
  sphere(b, 0.07, [-1.64, 3.55, -1.27], ORANGE, [1, 0.7, 1], 7, 4, { group: "weatherSensor" });

  // Satellite dish as a low-poly turned bowl.
  b.lathe(
    [
      [0, 0],
      [0.17, 0.02],
      [0.31, 0.07],
      [0.42, 0.15],
      [0.42, 0.21],
      [0.08, 0.21],
      [0, 0.21],
    ],
    {
      at: [-1.9, 3.94, -0.82],
      axis: [0, 0.7, 0.72],
      segments: 10,
      smoothing: 0,
      color: ROOF_LIGHT,
      group: "dish",
      name: "satelliteDish",
    },
  );
  rod(b, [-1.9, 3.93, -0.82], [-1.9, 3.72, -0.61], 0.026, STEEL_DARK, { group: "dish" });
  sphere(b, 0.055, [-1.9, 3.69, -0.58], WARM, [1, 1, 0.75], 7, 4, { group: "dish" });

  // ---------------------------------------------------------------------------------------------------------------
  // Freestanding solar panel sled

  const solarNormal: P = [0, -0.62, 0.78];
  const solarUp: P = [0, 0.78, 0.62];
  const solarOrigin: P = [2.02, 0.98, -0.92];

  box(b, [1.48, 0.08, 0.92], [2.02, 0.62, -1.02], STEEL_DARK, {
    rotation: [-35, 0, 0],
    group: "solarFrame",
  });
  rod(b, [1.48, 0.38, -1.19], [1.48, 1.17, -0.57], 0.035, STEEL_DARK, { group: "solarFrame" });
  rod(b, [2.56, 0.38, -1.19], [2.56, 1.17, -0.57], 0.035, STEEL_DARK, { group: "solarFrame" });
  rod(b, [1.48, 1.17, -0.57], [2.56, 1.17, -0.57], 0.035, STEEL_DARK, { group: "solarFrame" });
  rod(b, [1.48, 0.38, -1.19], [2.56, 0.38, -1.19], 0.035, STEEL_DARK, { group: "solarFrame" });
  rod(b, [1.48, 0.38, -1.19], [2.56, 1.17, -0.57], 0.022, STEEL, { group: "solarFrame" });
  rod(b, [2.56, 0.38, -1.19], [1.48, 1.17, -0.57], 0.022, STEEL, { group: "solarFrame" });

  const solarPanel = b.extrude(
    [
      [0, 0],
      [1.1, 0],
      [1.1, 0.68],
      [0, 0.68],
    ],
    {
      at: [1.47, 0.42, -1.18],
      x: [1, 0, 0],
      y: solarUp,
      thickness: 0.055,
      bevel: 0.018,
      color: NAVY,
      group: "solarPanel",
      name: "solarPanelBody",
    },
  );
  const solarFace = plane(
    b,
    1.04,
    0.62,
    [2.02, 0.89, -0.86],
    solarNormal,
    solarTexture,
    "#ffffff",
    { up: solarUp, group: "solarPanel" },
  );
  glow(solarFace, 0.12);
  void solarPanel;

  for (let i = 0; i < 4; i++) {
    const x = 1.58 + i * 0.29;
    rod(b, [x, 0.45, -1.16], [x, 0.98, -0.74], 0.012, PALE_TEAL, { group: "solarGrid" });
  }
  for (let i = 0; i < 3; i++) {
    const t = 0.18 + i * 0.21;
    rod(
      b,
      [1.52, 0.42 + t * 0.78, -1.16 + t * 0.38],
      [2.52, 0.42 + t * 0.78, -1.16 + t * 0.38],
      0.012,
      PALE_TEAL,
      { group: "solarGrid" },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Supply crates, fuel drums, map case and radio cable

  const crates: Array<{ p: P; s: P; rot: number; c: any }> = [
    { p: [1.95, 0.65, 0.98], s: [0.58, 0.52, 0.55], rot: -9, c: ORANGE },
    { p: [2.42, 0.62, 0.98], s: [0.46, 0.43, 0.5], rot: 8, c: WALL },
    { p: [2.05, 0.55, 1.55], s: [0.7, 0.35, 0.44], rot: 3, c: WOOD },
  ];
  crates.forEach((item, i) => {
    box(b, item.s, item.p, item.c, { rotation: [0, item.rot, 0], group: "supplies" });
    box(b, [item.s[0] + 0.02, 0.035, 0.035], [item.p[0], item.p[1] + item.s[1] * 0.12, item.p[2] + item.s[2] / 2 + 0.02], WOOD_DARK, { rotation: [0, item.rot, 0], group: "crateBands" });
    box(b, [0.035, item.s[1] + 0.02, 0.035], [item.p[0] - item.s[0] * 0.22, item.p[1], item.p[2] + item.s[2] / 2 + 0.025], WOOD_DARK, { rotation: [0, item.rot, 0], group: "crateBands" });
    if (i === 0) {
      plane(b, 0.25, 0.18, [item.p[0], item.p[1], item.p[2] + item.s[2] / 2 + 0.032], [0, 0, 1], mapTexture, "#ffffff", {
        group: "crateLabels",
      });
    }
  });

  const drumPositions: P[] = [
    [2.84, 0.62, 0.96],
    [3.2, 0.62, 0.96],
    [2.95, 0.62, 1.44],
  ];
  drumPositions.forEach((p, i) => {
    cyl(b, 0.19, 0.5, p, i === 1 ? ORANGE : TEAL, [0, 0, 1], 10, { group: "fuelDrums" });
    cyl(b, 0.205, 0.045, [p[0], p[1], p[2] - 0.23], BLACK, [0, 0, 1], 10, { group: "fuelDrums" });
    cyl(b, 0.205, 0.045, [p[0], p[1], p[2] + 0.23], BLACK, [0, 0, 1], 10, { group: "fuelDrums" });
    cyl(b, 0.045, 0.04, [p[0], p[1], p[2] + 0.27], YELLOW, [0, 0, 1], 8, { group: "fuelDrums" });
  });

  box(b, [0.7, 0.42, 0.14], [2.35, 0.88, 1.92], WOOD_DARK, { group: "mapCase" });
  plane(b, 0.59, 0.32, [2.35, 0.89, 1.998], [0, 0, 1], mapTexture, "#ffffff", {
    group: "mapCase",
  });
  rod(b, [1.98, 0.68, 1.99], [2.72, 0.68, 1.99], 0.018, STEEL, { group: "mapCase" });
  rod(b, [1.98, 1.08, 1.99], [2.72, 1.08, 1.99], 0.018, STEEL, { group: "mapCase" });

  rod(b, [1.46, 1.28, -0.38], [2.1, 1.0, 0.82], 0.012, BLACK, { group: "cable" });
  cyl(b, 0.05, 0.12, [2.08, 1.01, 0.82], YELLOW, [0, 1, 0], 7, { group: "cable" });

  // ---------------------------------------------------------------------------------------------------------------
  // Compact arctic utility sled / snowmobile

  const sledX = 1.55;
  const sledZ = 0.1;

  rod(b, [sledX - 0.5, 0.45, sledZ - 0.5], [sledX + 0.5, 0.45, sledZ - 0.5], 0.035, STEEL_DARK, { group: "sled" });
  rod(b, [sledX - 0.5, 0.45, sledZ + 0.5], [sledX + 0.5, 0.45, sledZ + 0.5], 0.035, STEEL_DARK, { group: "sled" });
  box(b, [1.18, 0.16, 0.86], [sledX, 0.71, sledZ], TEAL, { rotation: [0, -4, 0], group: "sled" });
  box(b, [0.7, 0.22, 0.5], [sledX - 0.1, 0.88, sledZ], ORANGE, { rotation: [0, -4, 0], group: "sled" });
  box(b, [0.64, 0.32, 0.08], [sledX - 0.24, 1.06, sledZ + 0.02], NAVY, { rotation: [-12, -4, 0], group: "sled" });
  rod(b, [sledX - 0.46, 0.7, sledZ + 0.52], [sledX - 0.46, 1.16, sledZ + 0.52], 0.025, STEEL_DARK, { group: "sled" });
  rod(b, [sledX - 0.46, 1.16, sledZ + 0.52], [sledX + 0.05, 1.18, sledZ + 0.52], 0.025, STEEL_DARK, { group: "sled" });
  box(b, [0.18, 0.14, 0.1], [sledX + 0.33, 0.9, sledZ + 0.05], YELLOW, { group: "sled" });
  box(b, [0.11, 0.12, 0.1], [sledX - 0.44, 0.78, sledZ + 0.46], WARM, { group: "sled" });
  glow(
    b.part(new THREE.BoxGeometry(0.11, 0.12, 0.1), WARM, {
      at: [sledX - 0.44, 0.78, sledZ + 0.46],
      flat: true,
      group: "sled",
    }),
    0.65,
  );

  // Sled runners with raised tips.
  rod(b, [sledX - 0.52, 0.43, sledZ - 0.42], [sledX + 0.5, 0.43, sledZ - 0.42], 0.035, WOOD_DARK, { group: "runners" });
  rod(b, [sledX - 0.52, 0.43, sledZ + 0.42], [sledX + 0.5, 0.43, sledZ + 0.42], 0.035, WOOD_DARK, { group: "runners" });
  rod(b, [sledX - 0.52, 0.43, sledZ - 0.42], [sledX - 0.68, 0.55, sledZ - 0.42], 0.03, WOOD_DARK, { group: "runners" });
  rod(b, [sledX - 0.52, 0.43, sledZ + 0.42], [sledX - 0.68, 0.55, sledZ + 0.42], 0.03, WOOD_DARK, { group: "runners" });

  // ---------------------------------------------------------------------------------------------------------------
  // Research antenna box, flag and marked field equipment

  box(b, [0.48, 0.48, 0.38], [-2.5, 0.65, -0.3], STEEL_DARK, { group: "fieldGear" });
  plane(b, 0.34, 0.22, [-2.5, 0.66, -0.497], [0, 0, -1], instrumentTexture, "#ffffff", {
    group: "fieldGear",
  });
  cyl(b, 0.03, 0.42, [-2.5, 0.97, -0.3], ORANGE, [0, 1, 0], 6, { group: "fieldGear" });
  rod(b, [-2.5, 1.18, -0.3], [-2.16, 1.35, -0.3], 0.014, STEEL, { group: "fieldGear" });
  sphere(b, 0.045, [-2.16, 1.35, -0.3], ORANGE, [1, 1, 0.7], 7, 4, { group: "fieldGear" });

  rod(b, [-2.85, 0.38, 1.15], [-2.85, 1.55, 1.15], 0.024, STEEL_DARK, { group: "flag" });
  b.extrude(
    [
      [0, 0],
      [0.55, 0.13],
      [0.33, 0.3],
      [0, 0.24],
    ],
    {
      at: [-2.84, 1.42, 1.15],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.005,
      color: ORANGE,
      group: "flag",
      name: "fieldFlag",
    },
  );
  cyl(b, 0.04, 0.1, [-2.85, 1.52, 1.15], YELLOW, [0, 1, 0], 7, { group: "flag" });

  // Two little snow sampling stakes.
  const sampleStakes: P[] = [
    [-0.78, 0.36, -1.72],
    [0.0, 0.36, -1.86],
  ];
  sampleStakes.forEach((p, i) => {
    rod(b, [p[0], p[1], p[2]], [p[0], 1.05, p[2]], 0.018, STEEL_DARK, { group: "sampleStakes" });
    cyl(b, 0.045, 0.1, [p[0], 0.74, p[2]], i ? TEAL : ORANGE, [0, 1, 0], 6, { group: "sampleStakes" });
    box(b, [0.18, 0.12, 0.12], [p[0], 1.1, p[2]], NAVY, { group: "sampleStakes" });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Snow ridges hugging the structure and a few graphic shadow facets

  const cabinSnow: Array<{ p: P; s: P; rot: number }> = [
    { p: [-1.28, 0.5, 1.02], s: [0.42, 0.24, 0.3], rot: -12 },
    { p: [-0.84, 0.47, 1.05], s: [0.3, 0.18, 0.25], rot: 12 },
    { p: [1.34, 0.51, 1.0], s: [0.45, 0.25, 0.3], rot: 8 },
    { p: [1.2, 0.45, -0.7], s: [0.65, 0.2, 0.3], rot: -5 },
    { p: [-1.3, 0.45, -0.72], s: [0.62, 0.22, 0.3], rot: 5 },
  ];
  cabinSnow.forEach((d, i) =>
    sphere(b, 0.42, d.p, SNOW_LIGHT, d.s, 7, 4, {
      rotation: [0, d.rot, i * 4],
      group: "cabinSnow",
    }),
  );

  const shadowFacets: Array<{ p: P; s: P; r: number }> = [
    { p: [-2.8, 0.37, -0.8], s: [1.1, 0.04, 0.2], r: -12 },
    { p: [2.55, 0.37, -0.2], s: [0.9, 0.04, 0.17], r: 18 },
    { p: [-1.0, 0.37, 1.85], s: [0.8, 0.04, 0.16], r: 6 },
    { p: [0.4, 0.37, -2.12], s: [0.9, 0.04, 0.15], r: -8 },
    { p: [2.95, 0.37, 1.18], s: [0.4, 0.04, 0.18], r: 25 },
  ];
  shadowFacets.forEach((d) =>
    box(b, d.s, d.p, SNOW_SHADOW, { rotation: [0, d.r, 0], group: "snowShadows" }),
  );

  // A small warm emergency lantern on the front deck.
  cyl(b, 0.1, 0.2, [-1.18, 1.08, 1.3], STEEL_DARK, [0, 1, 0], 8, { group: "lantern" });
  sphere(b, 0.07, [-1.18, 1.1, 1.3], WARM, [1, 1.2, 1], 8, 5, { group: "lantern" });
  cyl(b, 0.12, 0.035, [-1.18, 1.21, 1.3], BLACK, [0, 1, 0], 8, { group: "lantern" });
  glow(
    b.part(new THREE.SphereGeometry(0.07, 8, 5), WARM, {
      at: [-1.18, 1.1, 1.3],
      scale: [1, 1.2, 1],
      flat: true,
      group: "lantern",
    }),
    1.25,
  );

  // A few graphic tracks across the snow, made from deliberately chunky dark-blue slabs.
  const tracks: Array<{ p: P; s: P; r: number }> = [
    { p: [1.58, 0.39, 1.72], s: [0.62, 0.025, 0.09], r: -10 },
    { p: [1.95, 0.39, 1.62], s: [0.62, 0.025, 0.09], r: -10 },
    { p: [2.32, 0.39, 1.53], s: [0.62, 0.025, 0.09], r: -10 },
    { p: [1.56, 0.4, 1.37], s: [0.62, 0.025, 0.09], r: -10 },
    { p: [1.93, 0.4, 1.28], s: [0.62, 0.025, 0.09], r: -10 },
    { p: [2.3, 0.4, 1.19], s: [0.62, 0.025, 0.09], r: -10 },
  ];
  tracks.forEach((d) =>
    box(b, d.s, d.p, SNOW_SHADOW, { rotation: [0, d.r, 0], group: "tracks" }),
  );

  return b.root;
}
