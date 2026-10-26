import * as THREE from "three";
import { createBuilder, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-flat-color arctic research station diorama with a warm modular cabin, snowy plinth, wind turbine, solar panel, satellite dish, radio mast, supplies, and graphic signage.",
};

const COLORS = {
  snow: "#eaf5f2",
  snowLight: "#fff5d6",
  snowShadow: "#b6d7e2",
  ice: "#83c9d6",
  iceDark: "#397d9b",
  navy: "#182c4c",
  navy2: "#253f60",
  ink: "#172035",
  cabin: "#d95d42",
  cabinLight: "#ee8060",
  cabinDark: "#8f3540",
  trim: "#f3b36a",
  yellow: "#f6c45f",
  orange: "#ef8e4c",
  red: "#bd3d43",
  copper: "#b86b45",
  steel: "#66798a",
  steelDark: "#35475c",
  glass: "#69b9c8",
  glassDark: "#2e6885",
  teal: "#3b9b9a",
  crate: "#b4774e",
  crateDark: "#704b3c",
  canvas: "#d8c69d",
  black: "#111827",
};

const snowPaint = paint((p, n) => {
  const ridge = 0.5 + 0.16 * Math.sin(p.x * 3.2 + p.z * 1.7);
  if (n.y < -0.15) return COLORS.snowShadow;
  if (n.y > ridge) return COLORS.snowLight;
  return COLORS.snow;
});

const icePaint = paint((p, n) => {
  const blue = 0.5 + 0.5 * Math.sin(p.x * 4.5 + p.z * 2.2);
  return n.y > 0.2 && blue > 0.5 ? COLORS.ice : COLORS.iceDark;
});

const WINDOW_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <rect width="128" height="96" fill="#326e88"/>
    <rect x="5" y="5" width="118" height="86" rx="3" fill="#5bb7c0" stroke="#162c4a" stroke-width="7"/>
    <path d="M64 7v82M7 49h114" stroke="#dce9d9" stroke-width="5"/>
    <path d="M13 22h41M75 22h40" stroke="#9ee0d6" stroke-width="3" opacity=".7"/>
    <path d="M14 76h39M76 76h38" stroke="#d8f1db" stroke-width="4" opacity=".45"/>
    <circle cx="104" cy="19" r="5" fill="#ffd47b"/>
  </svg>`,
  { size: 256 },
);

const SIGN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 70">
    <rect width="320" height="70" rx="8" fill="#182c4c"/>
    <path d="M14 14h292v42H14z" fill="none" stroke="#f3b36a" stroke-width="4"/>
    <path d="M27 22h24v26H27z" fill="#d95d42"/>
    <path d="M33 27h12v16H33z" fill="#f6c45f"/>
    <text x="64" y="34" font-family="sans-serif" font-weight="900" font-size="21" letter-spacing="2" fill="#fff5d6">ICE STATION</text>
    <text x="66" y="51" font-family="monospace" font-weight="bold" font-size="10" letter-spacing="3" fill="#69b9c8">FIELD NODE 07 // NORTH</text>
  </svg>`,
  { size: 512 },
);

const MAP_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
    <rect width="180" height="120" fill="#d8c69d"/>
    <path d="M7 87 Q35 57 56 81T104 65T171 34" fill="none" stroke="#397d9b" stroke-width="5"/>
    <path d="M18 24l21 14-13 15 26 12-6 24M83 9l-9 32 25 13-11 28M139 10l-25 27 17 22 28 4" fill="none" stroke="#9d5c48" stroke-width="3"/>
    <path d="M14 101h148" stroke="#704b3c" stroke-width="2"/>
    <circle cx="56" cy="81" r="5" fill="#bd3d43"/>
    <circle cx="104" cy="65" r="5" fill="#bd3d43"/>
    <circle cx="155" cy="41" r="5" fill="#bd3d43"/>
    <text x="13" y="17" font-family="sans-serif" font-weight="bold" font-size="11" fill="#182c4c">GLACIER TRANSECT / 07</text>
  </svg>`,
  { size: 384 },
);

const RADIO_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72">
    <rect width="128" height="72" rx="6" fill="#111827"/>
    <rect x="10" y="10" width="108" height="34" rx="3" fill="#397d9b"/>
    <path d="M17 35h12l5-15 8 20 8-13 8 6 9-10 9 9 10-5 9 7" fill="none" stroke="#f6c45f" stroke-width="3"/>
    <circle cx="21" cy="57" r="6" fill="#bd3d43"/>
    <circle cx="41" cy="57" r="6" fill="#3b9b9a"/>
    <circle cx="61" cy="57" r="6" fill="#f6c45f"/>
    <path d="M81 57h29" stroke="#d8c69d" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const SOLAR_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110">
    <rect width="160" height="110" fill="#182c4c"/>
    <path d="M0 27h160M0 55h160M0 83h160M40 0v110M80 0v110M120 0v110" stroke="#69b9c8" stroke-width="2"/>
    <path d="M6 7h148v96H6z" fill="none" stroke="#f3b36a" stroke-width="5"/>
    <path d="M13 13h134v84H13z" fill="#234b70" opacity=".7"/>
    <path d="M13 13h134M13 41h134M13 69h134M13 97h134M13 13v84M53 13v84M93 13v84M133 13v84" stroke="#69b9c8" stroke-width="1.5"/>
  </svg>`,
  { size: 384 },
);

const FLAG_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64">
    <path d="M3 3h90v58H3z" fill="#bd3d43"/>
    <path d="M3 3h90L3 34z" fill="#f6c45f"/>
    <path d="M3 34L93 61H3z" fill="#d95d42"/>
    <circle cx="49" cy="32" r="9" fill="#182c4c"/>
    <path d="M49 18v28M35 32h28" stroke="#fff5d6" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  options: Record<string, any> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    flat: true,
    ...options,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  options: Record<string, any> = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 8), color, {
    at,
    flat: true,
    ...options,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: [number, number, number],
  color: any,
  scale: [number, number, number] = [1, 1, 1],
  options: Record<string, any> = {},
) {
  return b.part(new THREE.SphereGeometry(radius, options.segments ?? 8, options.rows ?? 5), color, {
    at,
    scale,
    flat: true,
    ...options,
  });
}

function rod(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any,
  options: Record<string, any> = {},
) {
  return b.rod(a, c, radius, {
    color,
    section: { ngon: options.ngon ?? 6 },
    ...options,
  });
}

function frontPlane(
  b: ReturnType<typeof createBuilder>,
  width: number,
  height: number,
  at: [number, number, number],
  texture: THREE.Texture,
  color = "#ffffff",
  options: Record<string, any> = {},
) {
  return b.part(new THREE.PlaneGeometry(width, height), color, {
    at,
    dir: [0, 0, 1],
    axis: "z",
    texture,
    ...options,
  });
}

function sidePlane(
  b: ReturnType<typeof createBuilder>,
  width: number,
  height: number,
  at: [number, number, number],
  texture: THREE.Texture,
  color = "#ffffff",
  options: Record<string, any> = {},
) {
  return b.part(new THREE.PlaneGeometry(width, height), color, {
    at,
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture,
    ...options,
  });
}

export default function build() {
  const b = createBuilder({
    name: "arctic-research-outpost",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------
  // Snow island and ice shelves

  cylinder(b, 3.7, 0.18, [0, 0.09, 0], snowPaint, {
    segments: 12,
    name: "snowIsland",
  });

  cylinder(b, 3.15, 0.08, [0, 0.19, -0.05], icePaint, {
    segments: 12,
    name: "iceShelf",
  });

  const drifts: Array<[number, number, number, number, number, number]> = [
    [-2.75, 0.26, 1.35, 0.85, 0.22, 0.6],
    [-1.55, 0.24, 2.0, 0.9, 0.18, 0.45],
    [1.65, 0.22, 1.55, 1.05, 0.2, 0.45],
    [2.7, 0.25, 0.45, 0.85, 0.18, 0.4],
    [1.8, 0.23, -1.65, 1.1, 0.22, 0.48],
    [-1.85, 0.22, -1.65, 1.1, 0.18, 0.48],
    [0.15, 0.24, -2.55, 1.6, 0.16, 0.4],
  ];
  drifts.forEach(([x, y, z, sx, sy, sz], i) =>
    sphere(b, 1, [x, y, z], snowPaint, [sx, sy, sz], {
      segments: 9,
      rows: 4,
      name: `snowDrift${i}`,
    }),
  );

  const iceChunks: Array<[number, number, number, number]> = [
    [-3.0, 0.33, -0.55, 0.38],
    [-2.65, 0.3, -1.15, 0.28],
    [2.7, 0.35, -0.9, 0.42],
    [2.85, 0.31, 1.35, 0.3],
    [-0.5, 0.28, 2.4, 0.32],
    [0.65, 0.3, -2.55, 0.35],
  ];
  iceChunks.forEach(([x, y, z, r], i) =>
    sphere(b, 1, [x, y, z], icePaint, [r * 1.35, r, r * 0.8], {
      segments: 6,
      rows: 4,
      name: `iceChunk${i}`,
    }),
  );

  // Orange survey stakes around the footprint
  const stakes: Array<[number, number, number]> = [
    [-3.1, 0.34, 0.7],
    [-2.55, 0.35, -2.0],
    [2.95, 0.35, -1.85],
    [3.1, 0.34, 1.65],
  ];
  stakes.forEach(([x, y, z], i) => {
    cylinder(b, 0.025, 0.75, [x, y + 0.37, z], COLORS.orange, {
      segments: 6,
      name: `surveyStake${i}`,
    });
    box(b, [0.11, 0.11, 0.11], [x, y + 0.72, z], COLORS.yellow, {
      name: `surveyMarker${i}`,
    });
  });

  // ---------------------------------------------------------------------------
  // Cabin foundation, stilts, walls, and corner trim

  const stiltPositions: Array<[number, number]> = [
    [-1.18, -0.65],
    [1.18, -0.65],
    [-1.18, 0.65],
    [1.18, 0.65],
  ];
  stiltPositions.forEach(([x, z], i) => {
    box(b, [0.18, 0.82, 0.18], [x, 0.58, z], COLORS.steelDark, {
      name: `foundationStilt${i}`,
    });
    box(b, [0.3, 0.09, 0.3], [x, 0.19, z], COLORS.iceDark, {
      name: `stiltFoot${i}`,
    });
    box(b, [0.28, 0.08, 0.28], [x, 0.99, z], COLORS.steel, {
      name: `stiltCap${i}`,
    });
  });

  box(b, [3.08, 0.13, 2.12], [0, 1.0, 0], COLORS.steelDark, {
    name: "cabinUnderframe",
  });

  box(b, [3.0, 1.72, 2.0], [0, 1.86, 0], COLORS.cabin, {
    name: "mainCabin",
  });

  // Dark lower snowline and warm upper trim
  box(b, [3.04, 0.18, 2.04], [0, 1.1, 0], COLORS.cabinDark, {
    name: "cabinSnowline",
  });
  box(b, [3.08, 0.12, 2.08], [0, 2.69, 0], COLORS.trim, {
    name: "cabinTopTrim",
  });

  [-1.43, 1.43].forEach((x, i) =>
    box(b, [0.12, 1.68, 0.12], [x, 1.87, 0.96], COLORS.cabinDark, {
      name: `frontCornerPost${i}`,
    }),
  );
  [-1.43, 1.43].forEach((x, i) =>
    box(b, [0.12, 1.68, 0.12], [x, 1.87, -0.96], COLORS.cabinDark, {
      name: `backCornerPost${i}`,
    }),
  );

  // Side wall paneling
  for (let i = 0; i < 5; i++) {
    box(b, [0.025, 1.58, 0.018], [1.515, 1.18 + i * 0.34, 0], COLORS.cabinLight, {
      name: `sidePanelLine${i}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Roof, snow cap, ridge and eaves

  box(b, [1.78, 0.16, 2.28], [-0.72, 3.0, 0], COLORS.navy, {
    rotation: [0, 0, 30],
    name: "leftRoofPlane",
  });
  box(b, [1.78, 0.16, 2.28], [0.72, 3.0, 0], COLORS.navy2, {
    rotation: [0, 0, -30],
    name: "rightRoofPlane",
  });

  box(b, [1.2, 0.075, 2.18], [-0.55, 3.22, 0], snowPaint, {
    rotation: [0, 0, 30],
    name: "leftRoofSnow",
  });
  box(b, [1.2, 0.075, 2.18], [0.55, 3.22, 0], snowPaint, {
    rotation: [0, 0, -30],
    name: "rightRoofSnow",
  });

  rod(b, [-0.04, 3.42, -1.12], [-0.04, 3.42, 1.12], 0.075, COLORS.cabinDark, {
    name: "roofRidge",
  });
  rod(b, [-1.45, 2.55, -1.12], [-1.45, 2.55, 1.12], 0.055, COLORS.trim, {
    name: "leftEave",
  });
  rod(b, [1.45, 2.55, -1.12], [1.45, 2.55, 1.12], 0.055, COLORS.trim, {
    name: "rightEave",
  });

  // ---------------------------------------------------------------------------
  // Front facade: windows, door, sign, lamps, control hatch

  const frontWindowA = box(b, [1.02, 0.82, 0.1], [-0.78, 1.95, 1.04], COLORS.ink, {
    name: "frontWindowFrame",
  });
  const frontWindowGlass = frontPlane(b, 0.88, 0.68, [-0.78, 1.95, 1.105], WINDOW_TEX, "#ffffff", {
    name: "frontWindowGlass",
  });
  glow(frontWindowGlass, 0.65);

  [-1.23, -0.33].forEach((x, i) =>
    box(b, [0.035, 0.78, 0.04], [x, 1.95, 1.14], COLORS.ink, {
      name: `frontWindowSideBar${i}`,
    }),
  );
  box(b, [0.94, 0.035, 0.04], [-0.78, 1.95, 1.14], COLORS.ink, {
    name: "frontWindowCrossbar",
  });

  box(b, [0.68, 1.28, 0.12], [0.9, 1.7, 1.045], COLORS.cabinDark, {
    name: "frontDoor",
  });
  box(b, [0.52, 1.06, 0.035], [0.9, 1.71, 1.115], COLORS.red, {
    name: "frontDoorInset",
  });
  box(b, [0.42, 0.045, 0.06], [0.9, 2.0, 1.145], COLORS.trim, {
    name: "doorWindowSlit",
  });
  sphere(b, 0.045, [1.13, 1.62, 1.16], COLORS.yellow, [1, 1, 0.5], {
    segments: 8,
    rows: 4,
    name: "doorHandle",
  });

  const doorLamp = cylinder(b, 0.085, 0.06, [1.36, 2.25, 1.12], COLORS.steelDark, {
    dir: [0, 0, 1],
    segments: 8,
    name: "doorLampHousing",
  });
  const doorGlow = frontPlane(b, 0.1, 0.1, [1.36, 2.25, 1.17], RADIO_TEX, "#f6c45f", {
    name: "doorLampGlow",
  });
  glow(doorGlow, 1.5);

  const sign = frontPlane(b, 1.7, 0.37, [-0.42, 2.48, 1.12], SIGN_TEX, "#ffffff", {
    name: "stationSign",
  });
  glow(sign, 0.1);

  // Small external data panel
  box(b, [0.48, 0.58, 0.07], [-1.18, 1.28, 1.09], COLORS.navy, {
    name: "externalDataPanel",
  });
  const panelScreen = frontPlane(b, 0.36, 0.2, [-1.18, 1.38, 1.14], RADIO_TEX, "#ffffff", {
    name: "externalDataScreen",
  });
  glow(panelScreen, 0.55);
  box(b, [0.035, 0.1, 0.035], [-1.38, 1.15, 1.15], COLORS.yellow, {
    name: "panelSwitchA",
  });
  box(b, [0.035, 0.1, 0.035], [-1.27, 1.15, 1.15], COLORS.teal, {
    name: "panelSwitchB",
  });

  // ---------------------------------------------------------------------------
  // Side windows and wall-mounted map

  const sideWindow = box(b, [0.1, 0.72, 1.04], [1.54, 2.0, -0.42], COLORS.ink, {
    name: "sideWindowFrame",
  });
  const sideGlass = sidePlane(b, 0.86, 0.58, [1.605, 2.0, -0.42], WINDOW_TEX, "#ffffff", {
    name: "sideWindowGlass",
  });
  glow(sideGlass, 0.5);
  box(b, [0.04, 0.72, 0.04], [1.64, 2.0, -0.42], COLORS.ink, {
    name: "sideWindowDivider",
  });

  box(b, [0.055, 0.78, 0.98], [-1.54, 1.76, 0.25], COLORS.canvas, {
    name: "mapBoardBacking",
  });
  const mapBoard = sidePlane(b, 0.78, 0.58, [-1.58, 1.76, 0.25], MAP_TEX, "#ffffff", {
    name: "glacierMap",
  });

  // A red emergency beacon on the cabin corner
  cylinder(b, 0.11, 0.12, [1.38, 2.68, 0.9], COLORS.steelDark, {
    segments: 8,
    name: "beaconBase",
  });
  const beacon = cylinder(b, 0.08, 0.11, [1.38, 2.79, 0.9], COLORS.red, {
    segments: 8,
    name: "beacon",
  });
  glow(beacon, 1.4);

  // ---------------------------------------------------------------------------
  // Porch, railings, steps and entry clutter

  box(b, [1.95, 0.14, 0.78], [0.72, 1.0, 1.48], COLORS.crateDark, {
    name: "frontPorchDeck",
  });
  box(b, [1.88, 0.07, 0.7], [0.72, 1.1, 1.48], COLORS.trim, {
    name: "frontPorchTop",
  });

  [-0.15, 1.58].forEach((x, i) =>
    box(b, [0.08, 0.65, 0.08], [x, 1.38, 1.78], COLORS.navy, {
      name: `porchPost${i}`,
    }),
  );
  rod(b, [-0.15, 1.66, 1.78], [1.58, 1.66, 1.78], 0.045, COLORS.navy, {
    name: "porchRailTop",
  });
  rod(b, [-0.15, 1.43, 1.78], [1.58, 1.43, 1.78], 0.025, COLORS.navy2, {
    name: "porchRailMid",
  });

  for (let i = 0; i < 3; i++) {
    box(b, [1.18 - i * 0.16, 0.12, 0.28], [0.72, 0.88 - i * 0.17, 1.92 + i * 0.23], COLORS.cabinDark, {
      name: `frontStep${i}`,
    });
  }

  box(b, [0.42, 0.38, 0.35], [-0.5, 1.26, 1.68], COLORS.crate, {
    name: "porchSupplyCrate",
  });
  box(b, [0.31, 0.035, 0.27], [-0.5, 1.46, 1.68], COLORS.trim, {
    name: "porchCrateLid",
  });
  rod(b, [-0.35, 1.27, 1.5], [-0.65, 1.27, 1.86], 0.025, COLORS.ink, {
    name: "coiledRope",
  });

  // ---------------------------------------------------------------------------
  // Solar array on the east side

  box(b, [0.12, 1.12, 1.52], [1.9, 2.0, -0.25], COLORS.steelDark, {
    name: "solarPanelFrame",
  });
  const solarPanel = sidePlane(b, 1.38, 0.95, [1.975, 2.0, -0.25], SOLAR_TEX, "#ffffff", {
    name: "solarPanelSurface",
  });
  glow(solarPanel, 0.12);

  box(b, [0.08, 0.08, 1.64], [1.91, 1.39, -0.25], COLORS.trim, {
    name: "solarBottomRail",
  });
  box(b, [0.08, 0.08, 1.64], [1.91, 2.61, -0.25], COLORS.trim, {
    name: "solarTopRail",
  });
  box(b, [0.08, 1.2, 0.08], [1.91, 2.0, -1.02], COLORS.trim, {
    name: "solarRailNear",
  });
  box(b, [0.08, 1.2, 0.08], [1.91, 2.0, 0.52], COLORS.trim, {
    name: "solarRailFar",
  });
  rod(b, [1.9, 1.35, -0.9], [1.9, 0.48, -0.9], 0.04, COLORS.steelDark, {
    name: "solarLegNear",
  });
  rod(b, [1.9, 1.35, 0.4], [1.9, 0.48, 0.4], 0.04, COLORS.steelDark, {
    name: "solarLegFar",
  });

  // ---------------------------------------------------------------------------
  // Rear radio mast, guy wires and satellite dish

  rod(b, [0, 2.95, -0.82], [0, 5.0, -0.82], 0.035, COLORS.steelDark, {
    name: "radioMast",
  });
  rod(b, [-0.5, 4.45, -0.82], [0.5, 4.45, -0.82], 0.025, COLORS.steel, {
    name: "mastCrossbar",
  });
  rod(b, [-0.35, 4.7, -0.82], [0.35, 4.7, -0.82], 0.018, COLORS.steel, {
    name: "mastUpperBar",
  });
  cylinder(b, 0.07, 0.15, [0, 5.08, -0.82], COLORS.red, {
    segments: 8,
    name: "mastBeacon",
  });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 4), COLORS.red, {
    at: [0, 5.18, -0.82],
    name: "mastBeaconGlow",
  }), 1.5);

  rod(b, [0, 4.1, -0.82], [-1.85, 1.2, 0.7], 0.012, COLORS.steel, {
    name: "guyWireLeft",
  });
  rod(b, [0, 4.1, -0.82], [1.85, 1.2, 0.7], 0.012, COLORS.steel, {
    name: "guyWireRight",
  });
  rod(b, [0, 3.8, -0.82], [0, 1.22, -2.0], 0.012, COLORS.steel, {
    name: "guyWireRear",
  });

  const dish = b.lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.46, 0.045],
      [0.38, 0.1],
      [0.23, 0.17],
      [0, 0.2],
    ],
    {
      at: [0, 4.18, -0.82],
      axis: [0, 0.62, 0.78],
      segments: 12,
      color: COLORS.orange,
      name: "satelliteDish",
    },
  );
  rod(b, [0, 4.31, -0.66], [0, 4.48, -0.45], 0.018, COLORS.steelDark, {
    name: "dishFeedArm",
  });
  sphere(b, 0.045, [0, 4.51, -0.42], COLORS.yellow, [1, 1, 1], {
    segments: 8,
    rows: 4,
    name: "dishFeed",
  });

  // Radio equipment box at the mast base
  box(b, [0.55, 0.48, 0.44], [-0.42, 1.34, -0.87], COLORS.navy, {
    name: "radioEquipmentBox",
  });
  const radioFace = frontPlane(b, 0.36, 0.2, [-0.42, 1.4, -0.65], RADIO_TEX, "#ffffff", {
    name: "radioEquipmentFace",
  });
  glow(radioFace, 0.55);
  cylinder(b, 0.06, 0.08, [-0.22, 1.65, -0.87], COLORS.red, {
    dir: [0, 1, 0],
    segments: 8,
    name: "radioWarningLight",
  });

  // ---------------------------------------------------------------------------
  // Wind turbine to the west

  rod(b, [-2.18, 0.3, -0.42], [-2.18, 3.28, -0.42], 0.055, COLORS.steelDark, {
    name: "windTurbineTower",
  });
  box(b, [0.28, 0.18, 0.28], [-2.18, 0.36, -0.42], COLORS.steel, {
    name: "windTowerFoot",
  });
  box(b, [0.48, 0.18, 0.2], [-2.18, 3.22, -0.42], COLORS.steelDark, {
    name: "windNacelle",
  });

  const hub = cylinder(b, 0.16, 0.18, [-2.18, 3.32, -0.42], COLORS.trim, {
    dir: [0, 0, 1],
    segments: 10,
    name: "windHub",
  });

  const bladeOutline: [number, number][] = [
    [0.05, -0.07],
    [0.16, -0.02],
    [0.57, 0.02],
    [0.93, 0.1],
    [0.64, 0.2],
    [0.2, 0.13],
    [0.06, 0.08],
  ];
  for (let i = 0; i < 3; i++) {
    const angle = i * 120 * Math.PI / 180;
    const xAxis: [number, number, number] = [Math.cos(angle), Math.sin(angle), 0];
    const yAxis: [number, number, number] = [-Math.sin(angle), Math.cos(angle), 0];
    b.extrude(bladeOutline, {
      at: [-2.18, 3.32, -0.32],
      x: xAxis,
      y: yAxis,
      thickness: 0.045,
      bevel: 0.008,
      color: COLORS.snowLight,
      name: `windBlade${i}`,
    });
  }
  box(b, [0.18, 0.08, 0.48], [-2.18, 3.56, -0.42], COLORS.red, {
    name: "windTailVane",
  });
  box(b, [0.06, 0.26, 0.06], [-2.18, 3.66, -0.42], COLORS.trim, {
    name: "windTailStem",
  });

  // ---------------------------------------------------------------------------
  // Crates, fuel, oxygen and field gear around the station

  const crateData: Array<[number, number, number, number, number, number]> = [
    [-2.0, 0.48, 0.62, 0.48, 0.43, 0.42],
    [-2.5, 0.44, 0.85, 0.38, 0.36, 0.34],
    [2.25, 0.46, 0.85, 0.54, 0.42, 0.48],
    [2.45, 0.42, 1.35, 0.4, 0.34, 0.35],
    [-0.9, 0.45, -1.4, 0.52, 0.4, 0.4],
  ];
  crateData.forEach(([x, y, z, sx, sy, sz], i) => {
    box(b, [sx, sy, sz], [x, y, z], COLORS.crate, {
      name: `fieldCrate${i}`,
    });
    box(b, [sx * 0.92, 0.035, 0.035], [x, y + sy * 0.26, z + sz * 0.51], COLORS.crateDark, {
      name: `crateBandA${i}`,
    });
    box(b, [0.035, sy * 0.9, 0.035], [x, y, z + sz * 0.51], COLORS.crateDark, {
      name: `crateBandB${i}`,
    });
  });

  for (let i = 0; i < 3; i++) {
    cylinder(b, 0.12, 0.62, [1.7 + i * 0.27, 0.55, 1.9], i === 1 ? COLORS.red : COLORS.teal, {
      segments: 8,
      name: `fuelCanister${i}`,
    });
    cylinder(b, 0.13, 0.035, [1.7 + i * 0.27, 0.87, 1.9], COLORS.ink, {
      segments: 8,
      name: `fuelCanisterCap${i}`,
    });
  }

  // Two bright oxygen cylinders
  for (let i = 0; i < 2; i++) {
    cylinder(b, 0.105, 0.72, [-1.5 + i * 0.25, 0.6, 1.95], COLORS.orange, {
      segments: 8,
      name: `oxygenBottle${i}`,
    });
    cylinder(b, 0.075, 0.11, [-1.5 + i * 0.25, 1.015, 1.95], COLORS.steelDark, {
      segments: 8,
      name: `oxygenValve${i}`,
    });
    box(b, [0.22, 0.06, 0.04], [-1.5 + i * 0.25, 0.64, 2.06], COLORS.ink, {
      name: `oxygenLabel${i}`,
    });
  }

  // A folded orange sled
  box(b, [0.95, 0.08, 0.32], [2.05, 0.35, -1.72], COLORS.red, {
    rotation: [0, 0, -8],
    name: "sledDeck",
  });
  rod(b, [1.6, 0.29, -1.9], [2.5, 0.29, -1.9], 0.025, COLORS.trim, {
    name: "sledRunnerNear",
  });
  rod(b, [1.6, 0.29, -1.55], [2.5, 0.29, -1.55], 0.025, COLORS.trim, {
    name: "sledRunnerFar",
  });
  rod(b, [1.62, 0.34, -1.9], [1.42, 0.65, -1.72], 0.018, COLORS.trim, {
    name: "sledHandle",
  });

  // ---------------------------------------------------------------------------
  // Flag mast and graphic expedition flag

  rod(b, [2.6, 0.25, 1.95], [2.6, 2.38, 1.95], 0.024, COLORS.steelDark, {
    name: "flagPole",
  });
  const flag = b.part(new THREE.PlaneGeometry(0.8, 0.52), "#ffffff", {
    at: [2.98, 2.15, 1.95],
    dir: [0, 0, 1],
    axis: "z",
    texture: FLAG_TEX,
    name: "expeditionFlag",
  });
  glow(flag, 0.08);
  sphere(b, 0.045, [2.6, 2.42, 1.95], COLORS.yellow, [1, 1, 1], {
    segments: 8,
    rows: 4,
    name: "flagPoleFinial",
  });

  // ---------------------------------------------------------------------------
  // Snow-covered vents, cable reels and small graphic details

  for (let i = 0; i < 2; i++) {
    const x = -0.68 + i * 1.28;
    cylinder(b, 0.17, 0.16, [x, 3.48, -0.42 + i * 0.4], COLORS.steelDark, {
      segments: 8,
      name: `roofVent${i}`,
    });
    cylinder(b, 0.2, 0.04, [x, 3.58, -0.42 + i * 0.4], snowPaint, {
      segments: 8,
      name: `roofVentSnow${i}`,
    });
  }

  for (let i = 0; i < 2; i++) {
    cylinder(b, 0.25, 0.12, [2.25, 0.52, -0.2 + i * 0.5], COLORS.crateDark, {
      dir: [1, 0, 0],
      segments: 10,
      name: `cableReel${i}`,
    });
    cylinder(b, 0.07, 0.14, [2.25, 0.52, -0.2 + i * 0.5], COLORS.steelDark, {
      dir: [1, 0, 0],
      segments: 8,
      name: `cableReelAxle${i}`,
    });
    rod(b, [2.25, 0.73, -0.2 + i * 0.5], [2.25, 0.73, -0.2 + i * 0.5], 0.02, COLORS.yellow, {
      name: `cableReelHandle${i}`,
    });
  }

  // Snow lip along the front edge, broken into chunky graphic pieces
  for (let i = 0; i < 7; i++) {
    const x = -1.42 + i * 0.47;
    sphere(b, 1, [x, 2.68 + (i % 2) * 0.025, 1.03], snowPaint, [0.28, 0.12, 0.1], {
      segments: 7,
      rows: 4,
      name: `frontSnowLip${i}`,
    });
  }

  // A dark door mat and warning stripes
  box(b, [0.76, 0.025, 0.32], [0.9, 1.14, 1.73], COLORS.ink, {
    name: "doorMat",
  });
  for (let i = 0; i < 5; i++) {
    box(b, [0.1, 0.012, 0.25], [0.58 + i * 0.16, 1.16, 1.73], COLORS.yellow, {
      rotation: [0, 0, 18],
      name: `matStripe${i}`,
    });
  }

  // Small roof access ladder on rear side
  for (let i = 0; i < 5; i++) {
    box(b, [0.58, 0.045, 0.06], [-1.92, 0.72 + i * 0.38, -1.05], COLORS.steelDark, {
      name: `ladderRung${i}`,
    });
  }
  rod(b, [-2.2, 0.45, -1.05], [-2.2, 2.35, -1.05], 0.025, COLORS.steel, {
    name: "ladderRailA",
  });
  rod(b, [-1.64, 0.45, -1.05], [-1.64, 2.35, -1.05], 0.025, COLORS.steel, {
    name: "ladderRailB",
  });

  return b.root;
}
