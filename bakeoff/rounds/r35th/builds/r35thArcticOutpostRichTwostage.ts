import * as THREE from "three";
import { type Builder, createBuilder, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

const SNOW = "#f3f0df";
const SNOW_LIGHT = "#fffaf0";
const SNOW_BLUE = "#b7d5df";
const ICE = "#79afc0";
const ICE_DARK = "#477f98";
const HULL = "#d76542";
const HULL_LIGHT = "#ed8550";
const HULL_DARK = "#963b3d";
const ROOF = "#263e4d";
const ROOF_LIGHT = "#3e6470";
const WINDOW = "#183444";
const WINDOW_GLOW = "#f4c36b";
const METAL = "#526775";
const METAL_DARK = "#293c49";
const METAL_LIGHT = "#78919a";
const PANEL = "#24546c";
const PANEL_DARK = "#17394d";
const CABLE = "#172933";
const CRATE = "#a66a43";
const CRATE_LIGHT = "#c68a55";
const ORANGE = "#e47b43";
const RED = "#c84a43";
const YELLOW = "#efb44f";
const CYAN = "#45d6d1";
const MAGENTA = "#d44eaa";
const PINE = "#244852";
const PINE_DARK = "#17333d";
const INK = "#18252e";

const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

// Paint hullSideL with broad diagonal HULL_LIGHT/HULL_DARK blocks and sparse SNOW_BLUE frost streaks.
const HULL_LEFT_CAMO = paint((p, n) => {
  if (n.x < 0.45) return HULL;
  const diagonal = Math.floor((p.y + p.z * 0.72 + 8) / 0.34);
  const frostWave = Math.sin(p.z * 19 + p.y * 7.5);
  const frost = mod(p.z + p.y * 0.18 + 0.13, 0.52) < 0.035 && frostWave > -0.2;
  if (frost) return SNOW_BLUE;
  if (diagonal % 3 === 0) return HULL_LIGHT;
  if (diagonal % 3 === 1) return HULL_DARK;
  return HULL;
});

// Paint hullSideR with offset field patches and a faded cream block-painted rear unit number.
const HULL_RIGHT_CAMO = paint((p, n) => {
  if (n.x > -0.45) return HULL_DARK;

  const digitRow = Math.floor((p.y - 1.34) / 0.072);
  const digitColumn = Math.floor(mod(p.z + 0.82, 0.24) / 0.08);
  const digit = Math.floor((p.z + 0.82) / 0.24);
  const zero = ["111", "101", "101", "101", "111"];
  const seven = ["111", "001", "001", "010", "010"];
  const glyph = digit === 0 ? zero : seven;
  if (
    digit >= 0 &&
    digit < 2 &&
    digitRow >= 0 &&
    digitRow < glyph.length &&
    digitColumn >= 0 &&
    digitColumn < 3 &&
    glyph[digitRow][digitColumn] === "1"
  ) {
    return "#e7d5b0";
  }

  const patch = Math.floor((p.y - p.z * 0.58 + 8) / 0.31);
  if (patch % 4 === 0) return HULL;
  if (patch % 4 === 1) return HULL_DARK;
  if (patch % 4 === 2) return HULL_LIGHT;
  return HULL_DARK;
});

// Paint both roof planes with graphic snow streaks, wind-scoured ROOF_LIGHT bands, and a plain ridge mounting strip.
const ROOF_WEATHERING = paint((p, n) => {
  if (n.y < 0.34) return ROOF;
  if (Math.abs(p.z - 0.15) < 0.11) return ROOF_LIGHT;

  const streak = mod(p.z + p.x * 0.42 + 1.7, 0.46);
  if (streak < 0.045) return SNOW_BLUE;
  if (streak < 0.13) return SNOW_LIGHT;
  if (streak > 0.34 && streak < 0.39) return ROOF_LIGHT;
  return SNOW_LIGHT;
});

// Paint both solar panels with hard alternating cells, ICE grid lines, and a diagonal reflection.
const SOLAR_CELL_PAINT = paint((_p, n, s) => {
  if (n.y < 0.28) return PANEL_DARK;

  const u = s[0];
  const v = s[1];
  const cellU = Math.floor(u * 6);
  const cellV = Math.floor(v * 4);
  const edgeU = mod(u * 6, 1);
  const edgeV = mod(v * 4, 1);
  const diagonal = mod(u - v * 0.82 + 0.18, 0.9);

  if (edgeU < 0.035 || edgeV < 0.045) return ICE;
  if (diagonal < 0.028) return SNOW_BLUE;
  return (cellU + cellV) % 2 === 0 ? PANEL : PANEL_DARK;
});

export const meta = {
  name: "arctic-research-outpost",
  description:
    "A stylized Firewatch-inspired arctic research outpost: an elevated orange field cabin on a snowy ice shelf, with solar panels, radio mast, satellite dish, cargo sled, fuel drums, crates, and wind-carved snow.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cab",
    what: "Neon weather light bar across the cab roof: a slim dark housing, six chunky lamps alternating CYAN and MAGENTA, and two metal brackets. Keep it graphic and high-contrast.",
    at: [0, 2.56, 0.15],
    normal: [0, 1, 0],
    bone: null,
    room: [1.75, 0.28, 0.34],
  },
  {
    id: "frontResearchSign",
    kind: "add",
    part: "frontSign",
    what: "Paint the clear sign board with a bold cream arctic research emblem and the words POLAR STATION in block lettering, using SNOW_LIGHT, YELLOW, and INK.",
    at: [-0.82, 1.45, 1.045],
    normal: [0, 0, 1],
    bone: null,
    room: [0.78, 0.46, 0.08],
  },
  {
    id: "dishFeed",
    kind: "add",
    part: "dish",
    what: "Add a satellite dish feed assembly: a slim arm, a small receiver pod, and two little braces in METAL_LIGHT, with one CYAN indicator.",
    at: [1.9, 3.04, -1.2],
    normal: [0, 0, 1],
    bone: null,
    room: [0.95, 0.85, 0.42],
  },
  {
    id: "mastAntennaArray",
    kind: "add",
    part: "mast",
    what: "Build a crisp antenna crown on the mast: three different-length whip antennas, a crossbar, small insulators, and a red warning pennant. Use METAL, METAL_DARK, RED, and YELLOW.",
    at: [1.9, 3.48, -1.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 0.35, 0.8],
  },
  {
    id: "hullCableRun",
    kind: "add",
    part: "hullSideR",
    what: "Add a bundled exterior communications cable running from the rear side of the cabin toward the mast, with three square cable clips and a small junction box.",
    at: [-1.52, 1.32, -0.42],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.32, 0.42, 1.45],
  },
  {
    id: "fuelStencil",
    kind: "add",
    part: "fuelDrumL",
    what: "Add a bright yellow hazard stencil and two dark bands to the pair of fuel drums. Keep the lettering abstract and graphic.",
    at: [2.23, 0.5, 1.28],
    normal: [1, 0, 0],
    bone: null,
    room: [0.72, 0.58, 0.7],
  },
  {
    id: "solarCellGrid",
    kind: "add",
    part: "solarPanelL",
    what: "Lay a clean six-by-four grid of pale blue solar cells into the two angled panels, with a dark perimeter frame and two bright corner glints.",
    at: [-1.85, 1.55, -1.7],
    normal: [0, 1, 0],
    bone: null,
    room: [2.7, 0.24, 1.05],
  },
  {
    id: "sledLoad",
    kind: "add",
    part: "cargoSled",
    what: "Fill the orange cargo sled with three strapped expedition cases, a rolled orange tarp, and two pale snow hooks. Use CRATE, CRATE_LIGHT, ORANGE, and METAL.",
    at: [1.82, 0.68, 1.5],
    normal: [0, 1, 0],
    bone: null,
    room: [1.35, 0.8, 0.9],
  },
  {
    id: "snowMarker",
    kind: "add",
    part: "snowMarker",
    what: "Place a short striped snow marker pole at the front corner, with alternating RED and SNOW_LIGHT bands and a tiny triangular flag.",
    at: [2.65, 0.22, 2.0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.25, 1.15, 0.25],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Paint a restrained Firewatch-style geometric weathering pattern on the left hull side: broad HULL_LIGHT and HULL_DARK diagonal blocks, with a few SNOW_BLUE frost streaks. Keep the windows and trim clear.",
  },
  {
    id: "hullCamoRight",
    kind: "texture",
    part: "hullSideR",
    what: "Paint the right hull side with offset HULL and HULL_DARK field patches and a faded cream unit number near the rear, leaving the cable route readable.",
  },
  {
    id: "roofWeathering",
    kind: "texture",
    part: "roofL",
    what: "Add graphic snow streaks and wind-scoured bands to both roof planes using SNOW_LIGHT, SNOW_BLUE, and ROOF_LIGHT. Keep the roof light bar mounting strip plain.",
  },
  {
    id: "solarPanelTexture",
    kind: "texture",
    part: "solarPanelR",
    what: "Give the solar panels a crisp alternating PANEL and PANEL_DARK cell pattern with thin ICE highlights and a subtle diagonal reflection.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

type Point = [number, number, number];

function box(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: Point,
  color: string | ReturnType<typeof paint>,
  options: any = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    ...options,
    at,
    name,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: Point,
  color: string,
  scale: [number, number, number] = [1, 1, 1],
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
    at,
    scale,
    name,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: Point,
  color: string,
  options: any = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
    ...options,
    at,
    name,
    flat: true,
  });
}

function rod(b: Builder, name: string, a: Point, c: Point, radius: number, color: string) {
  return b.rod(a, c, radius, color, { name });
}

function slab(
  b: Builder,
  name: string,
  outline: [number, number][],
  at: Point,
  x: Point,
  thickness: number,
  color: string,
) {
  return b.extrude(outline, {
    at,
    x,
    thickness,
    color,
    name,
    bevel: 0.005,
  });
}

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  box(b, "snowBase", [6.4, 0.22, 5.2], [0, 0.11, 0], SNOW_BLUE);
  box(b, "snowTop", [6.12, 0.08, 4.94], [0, 0.26, 0], SNOW_LIGHT);

  const drifts: [Point, [number, number, number], string][] = [
    [[-2.7, 0.38, -1.95], [1.35, 0.34, 0.9], SNOW],
    [[-2.35, 0.42, 1.98], [1.45, 0.3, 0.72], SNOW_LIGHT],
    [[2.45, 0.36, -2.0], [1.25, 0.3, 0.76], SNOW],
    [[2.85, 0.42, 2.05], [1.05, 0.32, 0.7], SNOW_BLUE],
    [[-0.65, 0.34, -2.32], [1.5, 0.2, 0.5], SNOW_BLUE],
    [[0.78, 0.34, 2.28], [1.6, 0.23, 0.46], SNOW],
    [[-2.9, 0.31, 0.05], [0.6, 0.2, 1.0], SNOW_LIGHT],
    [[2.92, 0.32, -0.15], [0.58, 0.22, 1.05], SNOW],
  ];

  for (let i = 0; i < drifts.length; i++) {
    sphere(b, `windDrift${i}`, 0.55, drifts[i][0], drifts[i][2], drifts[i][1]);
  }

  const iceRocks: [Point, [number, number, number], string][] = [
    [[-2.85, 0.47, -0.95], [0.55, 0.85, 0.42], ICE],
    [[-2.45, 0.43, -1.28], [0.38, 0.62, 0.3], ICE_DARK],
    [[-2.82, 0.42, 0.95], [0.52, 0.65, 0.35], SNOW_BLUE],
    [[2.65, 0.45, -0.65], [0.48, 0.8, 0.36], ICE],
    [[2.84, 0.4, 0.72], [0.42, 0.58, 0.32], ICE_DARK],
    [[-1.8, 0.38, 2.05], [0.7, 0.35, 0.3], SNOW_BLUE],
    [[1.4, 0.36, 2.18], [0.58, 0.28, 0.32], SNOW],
    [[-0.35, 0.37, -2.2], [0.46, 0.28, 0.28], ICE],
  ];

  for (let i = 0; i < iceRocks.length; i++) {
    sphere(b, `iceRock${i}`, 0.45, iceRocks[i][0], iceRocks[i][2], iceRocks[i][1]);
  }

  const stiltPositions: Point[] = [
    [-1.22, 0.58, -0.68],
    [1.22, 0.58, -0.68],
    [-1.22, 0.58, 0.68],
    [1.22, 0.58, 0.68],
  ];

  for (let i = 0; i < stiltPositions.length; i++) {
    box(b, `stilt${i}`, [0.22, 0.68, 0.22], stiltPositions[i], METAL_DARK);
    box(
      b,
      `stiltFoot${i}`,
      [0.42, 0.1, 0.38],
      [stiltPositions[i][0], 0.34, stiltPositions[i][2]],
      SNOW_BLUE,
    );
    box(
      b,
      `stiltCap${i}`,
      [0.34, 0.1, 0.34],
      [stiltPositions[i][0], 0.93, stiltPositions[i][2]],
      METAL_LIGHT,
    );
  }

  box(b, "foundationBeamFront", [3.05, 0.22, 0.22], [0, 0.88, 0.78], METAL);
  box(b, "foundationBeamBack", [3.05, 0.22, 0.22], [0, 0.88, -0.78], METAL);
  box(b, "foundationBeamLeft", [0.22, 0.22, 1.42], [-1.42, 0.88, 0], METAL_DARK);
  box(b, "foundationBeamRight", [0.22, 0.22, 1.42], [1.42, 0.88, 0], METAL_DARK);
  box(b, "cabinPlatform", [3.3, 0.16, 1.88], [0, 0.98, 0], ROOF);

  rod(b, "braceFrontL", [-1.25, 0.48, 0.78], [-0.82, 0.94, 0.78], 0.035, METAL_LIGHT);
  rod(b, "braceFrontR", [1.25, 0.48, 0.78], [0.82, 0.94, 0.78], 0.035, METAL_LIGHT);
  rod(b, "braceBackL", [-1.25, 0.48, -0.78], [-0.82, 0.94, -0.78], 0.035, METAL_DARK);
  rod(b, "braceBackR", [1.25, 0.48, -0.78], [0.82, 0.94, -0.78], 0.035, METAL_DARK);

  box(b, "cab", [3.04, 1.22, 1.78], [0, 1.59, 0], HULL);
  box(b, "hullSideL", [0.045, 1.12, 1.7], [1.535, 1.59, 0], HULL_LEFT_CAMO);
  box(b, "hullSideR", [0.045, 1.12, 1.7], [-1.535, 1.59, 0], HULL_RIGHT_CAMO);
  box(b, "frontFascia", [3.08, 0.13, 0.08], [0, 2.12, 0.91], HULL_LIGHT);
  box(b, "rearFascia", [3.08, 0.13, 0.08], [0, 2.12, -0.91], HULL_DARK);

  slab(
    b,
    "frontGable",
    [
      [-1.5, 0],
      [1.5, 0],
      [1.08, 0.25],
      [0.0, 0.52],
      [-1.08, 0.25],
    ],
    [0, 2.08, 0.94],
    [1, 0, 0],
    0.075,
    HULL_LIGHT,
  );

  slab(
    b,
    "rearGable",
    [
      [-1.5, 0],
      [1.5, 0],
      [1.08, 0.25],
      [0.0, 0.52],
      [-1.08, 0.25],
    ],
    [0, 2.08, -0.94],
    [1, 0, 0],
    0.075,
    HULL_DARK,
  );

  box(b, "roofL", [1.7, 0.13, 2.02], [-0.7, 2.29, 0], ROOF_WEATHERING, {
    rotation: [0, 0, -23],
  });
  box(b, "roofR", [1.7, 0.13, 2.02], [0.7, 2.29, 0], ROOF_WEATHERING, {
    rotation: [0, 0, 23],
  });
  box(b, "snowRoofL", [1.6, 0.075, 2.0], [-0.7, 2.39, 0], SNOW_LIGHT, {
    rotation: [0, 0, -23],
  });
  box(b, "snowRoofR", [1.6, 0.075, 2.0], [0.7, 2.39, 0], SNOW_BLUE, {
    rotation: [0, 0, 23],
  });
  box(b, "ridgeCap", [0.18, 0.16, 2.05], [0, 2.54, 0], METAL_DARK);

  box(b, "trimFrontTop", [3.06, 0.08, 0.06], [0, 2.11, 0.94], ORANGE);
  box(b, "trimFrontBottom", [3.06, 0.08, 0.06], [0, 1.02, 0.94], HULL_DARK);
  box(b, "trimSideLTop", [0.08, 0.08, 1.8], [1.52, 2.11, 0], ORANGE);
  box(b, "trimSideRTop", [0.08, 0.08, 1.8], [-1.52, 2.11, 0], HULL_LIGHT);
  box(b, "cornerLFront", [0.12, 1.16, 0.12], [1.5, 1.57, 0.9], HULL_DARK);
  box(b, "cornerRFront", [0.12, 1.16, 0.12], [-1.5, 1.57, 0.9], ORANGE);

  box(b, "frontDoor", [0.54, 0.94, 0.045], [-0.88, 1.53, 0.926], WINDOW);
  box(b, "doorTop", [0.68, 0.08, 0.06], [-0.88, 2.02, 0.95], HULL_LIGHT);
  box(b, "doorLeft", [0.08, 0.98, 0.06], [-1.2, 1.53, 0.95], HULL_LIGHT);
  box(b, "doorRight", [0.08, 0.98, 0.06], [-0.56, 1.53, 0.95], HULL_DARK);
  box(b, "doorStep", [0.72, 0.1, 0.34], [-0.88, 1.02, 1.06], METAL_DARK);
  cylinder(b, "doorHandle", 0.035, 0.06, [-0.65, 1.55, 0.98], YELLOW, {
    dir: [0, 0, 1],
  });

  const frontWindows: [number, number][] = [
    [0.05, 1.62],
    [0.86, 1.62],
  ];

  for (let i = 0; i < frontWindows.length; i++) {
    const x = frontWindows[i][0];
    const y = frontWindows[i][1];
    box(b, `frontWindow${i}`, [0.62, 0.52, 0.045], [x, y, 0.93], WINDOW);
    box(b, `frontWindowGlow${i}`, [0.5, 0.4, 0.014], [x, y, 0.958], WINDOW_GLOW);
    box(b, `frontWindowTop${i}`, [0.7, 0.06, 0.07], [x, y + 0.3, 0.97], HULL_LIGHT);
    box(b, `frontWindowBottom${i}`, [0.7, 0.06, 0.07], [x, y - 0.3, 0.97], HULL_DARK);
    box(b, `frontWindowLeft${i}`, [0.06, 0.62, 0.07], [x - 0.35, y, 0.97], HULL_LIGHT);
    box(b, `frontWindowRight${i}`, [0.06, 0.62, 0.07], [x + 0.35, y, 0.97], HULL_DARK);
    box(b, `frontWindowMullion${i}`, [0.035, 0.48, 0.08], [x, y, 0.98], ROOF);
  }

  const sideWindows: [number, number, number][] = [
    [1, 1.59, 0.1],
    [-1, 1.59, 0.1],
  ];

  for (let i = 0; i < sideWindows.length; i++) {
    const side = sideWindows[i][0];
    const x = side * 1.56;
    const z = sideWindows[i][2];
    box(b, `sideWindow${i}`, [0.045, 0.54, 0.68], [x, sideWindows[i][1], z], WINDOW);
    box(
      b,
      `sideWindowGlow${i}`,
      [0.014, 0.4, 0.54],
      [x + side * 0.03, sideWindows[i][1], z],
      WINDOW_GLOW,
    );
    box(b, `sideWindowTop${i}`, [0.07, 0.06, 0.76], [x + side * 0.02, 1.91, z], HULL_LIGHT);
    box(b, `sideWindowBottom${i}`, [0.07, 0.06, 0.76], [x + side * 0.02, 1.27, z], HULL_DARK);
    box(b, `sideWindowFront${i}`, [0.07, 0.66, 0.06], [x + side * 0.02, 1.59, z + 0.38], HULL_LIGHT);
    box(b, `sideWindowBack${i}`, [0.07, 0.66, 0.06], [x + side * 0.02, 1.59, z - 0.38], HULL_DARK);
    box(b, `sideWindowMullion${i}`, [0.08, 0.5, 0.035], [x + side * 0.04, 1.59, z], ROOF);
  }

  box(b, "frontSignPost", [0.08, 0.42, 0.08], [-0.82, 1.08, 1.02], METAL_DARK);
  box(b, "frontSign", [0.82, 0.43, 0.045], [-0.82, 1.43, 1.0], ROOF_LIGHT);
  box(b, "frontSignInset", [0.7, 0.3, 0.012], [-0.82, 1.43, 1.03], HULL_LIGHT);

  rod(b, "ladderRailL", [-1.26, 0.29, 1.25], [-1.26, 0.91, 1.25], 0.035, METAL_DARK);
  rod(b, "ladderRailR", [-0.72, 0.29, 1.25], [-0.72, 0.91, 1.25], 0.035, METAL_DARK);
  for (let i = 0; i < 5; i++) {
    const y = 0.34 + i * 0.135;
    rod(b, `ladderStep${i}`, [-1.27, y, 1.25], [-0.71, y, 1.25], 0.028, METAL_LIGHT);
  }
  box(b, "ladderTopPlate", [0.74, 0.08, 0.3], [-0.99, 0.94, 1.25], METAL);

  const mastBase: Point = [1.93, 0.35, -1.28];
  const mastTop: Point = [1.93, 3.38, -1.28];

  rod(b, "mast", mastBase, mastTop, 0.055, METAL_DARK);
  rod(b, "mastLegL", [1.93, 0.35, -1.28], [1.45, 0.28, -1.62], 0.04, METAL);
  rod(b, "mastLegR", [1.93, 0.35, -1.28], [2.38, 0.28, -1.62], 0.04, METAL);
  rod(b, "mastLegBack", [1.93, 0.35, -1.28], [1.93, 0.28, -0.72], 0.04, METAL);
  cylinder(b, "mastFoot", 0.2, 0.12, [1.93, 0.28, -1.28], METAL_DARK);

  for (let i = 0; i < 3; i++) {
    const y = 1.5 + i * 0.58;
    rod(b, `mastCrossbar${i}`, [1.57, y, -1.28], [2.29, y, -1.28], 0.026, METAL_LIGHT);
    cylinder(b, `mastInsulatorL${i}`, 0.045, 0.09, [1.56, y + 0.06, -1.28], ICE_DARK);
    cylinder(b, `mastInsulatorR${i}`, 0.045, 0.09, [2.3, y + 0.06, -1.28], ICE_DARK);
  }

  rod(b, "guyCableFront", [1.93, 2.62, -1.28], [1.26, 0.32, 0.02], 0.012, CABLE);
  rod(b, "guyCableSide", [1.93, 2.84, -1.28], [2.78, 0.32, -0.2], 0.012, CABLE);
  rod(b, "guyCableBack", [1.93, 2.9, -1.28], [1.82, 0.3, -2.25], 0.012, CABLE);

  sphere(b, "dish", 0.52, [1.93, 3.02, -1.26], METAL_LIGHT, [1, 0.42, 1]);
  b.part(new THREE.TorusGeometry(0.51, 0.035, 6, 14), METAL_DARK, {
    at: [1.93, 3.02, -1.26],
    name: "dishRim",
  });
  rod(b, "dishSupportL", [1.57, 2.82, -1.26], [1.93, 3.02, -1.26], 0.028, METAL_DARK);
  rod(b, "dishSupportR", [2.29, 2.82, -1.26], [1.93, 3.02, -1.26], 0.028, METAL_DARK);
  box(b, "dishBackBlock", [0.28, 0.3, 0.2], [1.93, 2.78, -1.25], METAL_DARK);

  rod(b, "whipA", [1.93, 3.3, -1.28], [1.93, 3.72, -1.28], 0.018, METAL_LIGHT);
  rod(b, "whipB", [1.7, 3.3, -1.28], [1.58, 3.65, -1.28], 0.016, METAL);
  rod(b, "whipC", [2.16, 3.3, -1.28], [2.28, 3.58, -1.28], 0.016, METAL);
  box(b, "mastTopBar", [0.62, 0.05, 0.05], [1.93, 3.34, -1.28], METAL_LIGHT);
  slab(
    b,
    "mastFlag",
    [
      [0, 0],
      [0.5, 0],
      [0.34, 0.18],
      [0.5, 0.36],
      [0, 0.36],
    ],
    [2.0, 2.8, -1.29],
    [0, 1, 0],
    0.025,
    RED,
  );

  rod(b, "solarRackL", [-2.25, 0.32, -1.72], [-2.08, 1.28, -1.72], 0.035, METAL_DARK);
  rod(b, "solarRackR", [-0.92, 0.32, -1.72], [-1.08, 1.28, -1.72], 0.035, METAL_DARK);
  rod(b, "solarRackCross", [-2.08, 1.28, -1.72], [-1.08, 1.28, -1.72], 0.035, METAL);

  box(b, "solarPanelL", [1.22, 0.065, 0.76], [-1.7, 1.48, -1.72], SOLAR_CELL_PAINT, {
    rotation: [-27, 0, 0],
  });
  box(b, "solarPanelR", [1.22, 0.065, 0.76], [-0.42, 1.48, -1.72], SOLAR_CELL_PAINT, {
    rotation: [-27, 0, 0],
  });

  for (let side = 0; side < 2; side++) {
    const x0 = side === 0 ? -1.7 : -0.42;
    box(b, `solarFrameTop${side}`, [1.3, 0.035, 0.045], [x0, 1.67, -1.72], METAL_DARK, {
      rotation: [-27, 0, 0],
    });
    box(b, `solarFrameBottom${side}`, [1.3, 0.035, 0.045], [x0, 1.29, -1.72], METAL_DARK, {
      rotation: [-27, 0, 0],
    });
    box(b, `solarFrameLeft${side}`, [0.045, 0.035, 0.82], [x0 - 0.63, 1.48, -1.72], METAL_DARK, {
      rotation: [-27, 0, 0],
    });
    box(b, `solarFrameRight${side}`, [0.045, 0.035, 0.82], [x0 + 0.63, 1.48, -1.72], METAL_DARK, {
      rotation: [-27, 0, 0],
    });
    for (let j = 0; j < 3; j++) {
      box(b, `solarCellBand${side}_${j}`, [1.08, 0.012, 0.018], [x0, 1.36 + j * 0.12, -1.76], ICE, {
        rotation: [-27, 0, 0],
      });
    }
    box(b, `solarGlint${side}`, [0.1, 0.018, 0.1], [x0 - 0.4, 1.6, -1.78], SNOW_LIGHT, {
      rotation: [-27, 0, 0],
    });
  }

  box(b, "generatorBody", [0.92, 0.62, 0.62], [-2.18, 0.58, 0.92], METAL_DARK);
  box(b, "generatorPanel", [0.58, 0.3, 0.035], [-2.18, 0.66, 1.25], METAL_LIGHT);
  box(b, "generatorWindow", [0.18, 0.13, 0.02], [-2.18, 0.7, 1.28], WINDOW);
  cylinder(b, "generatorExhaust", 0.07, 0.48, [-2.38, 1.12, 0.92], METAL, {
    dir: [0, 1, 0],
  });
  cylinder(b, "generatorCap", 0.095, 0.06, [-2.38, 1.37, 0.92], METAL_DARK);

  const drumXs = [2.05, 2.48];
  for (let i = 0; i < drumXs.length; i++) {
    cylinder(b, `fuelDrum${i === 0 ? "L" : "R"}`, 0.25, 0.62, [drumXs[i], 0.52, 1.25], RED, {
      dir: [1, 0, 0],
    });
    cylinder(b, `fuelDrumCap${i}`, 0.17, 0.025, [drumXs[i] + 0.33, 0.52, 1.25], YELLOW, {
      dir: [1, 0, 0],
    });
    box(b, `fuelDrumBandA${i}`, [0.05, 0.54, 0.54], [drumXs[i] - 0.12, 0.52, 1.25], HULL_DARK);
    box(b, `fuelDrumBandB${i}`, [0.05, 0.54, 0.54], [drumXs[i] + 0.12, 0.52, 1.25], HULL_DARK);
  }

  const crateData: [Point, [number, number, number], string][] = [
    [[2.18, 0.42, 1.85], [0.62, 0.48, 0.55], CRATE],
    [[2.65, 0.35, 1.64], [0.45, 0.34, 0.46], CRATE_LIGHT],
    [[-2.18, 0.33, 1.75], [0.48, 0.26, 0.46], CRATE_LIGHT],
    [[-2.55, 0.48, 1.56], [0.4, 0.5, 0.4], CRATE],
  ];

  for (let i = 0; i < crateData.length; i++) {
    box(b, `supplyCrate${i}`, crateData[i][1], crateData[i][0], crateData[i][2]);
    box(
      b,
      `crateBandX${i}`,
      [0.045, crateData[i][1][1] + 0.025, crateData[i][2] === CRATE ? 0.05 : 0.04],
      [crateData[i][0][0], crateData[i][0][1], crateData[i][0][2] + crateData[i][1][2] / 2 + 0.012],
      CRATE_LIGHT,
    );
    box(
      b,
      `crateBandZ${i}`,
      [crateData[i][1][0] + 0.025, crateData[i][1][1] + 0.025, 0.045],
      [crateData[i][0][0], crateData[i][0][1], crateData[i][0][2]],
      CRATE_LIGHT,
    );
  }

  box(b, "cargoSled", [1.2, 0.28, 0.68], [1.82, 0.48, 1.65], ORANGE);
  box(b, "cargoSledInner", [1.0, 0.16, 0.5], [1.82, 0.67, 1.65], HULL_DARK);
  rod(b, "sledRunnerL", [1.38, 0.17, 1.35], [1.38, 0.17, 1.98], 0.035, METAL_LIGHT);
  rod(b, "sledRunnerR", [2.26, 0.17, 1.35], [2.26, 0.17, 1.98], 0.035, METAL_LIGHT);
  rod(b, "sledRunnerTipL", [1.38, 0.17, 1.98], [1.53, 0.28, 2.08], 0.035, METAL_LIGHT);
  rod(b, "sledRunnerTipR", [2.26, 0.17, 1.98], [2.11, 0.28, 2.08], 0.035, METAL_LIGHT);
  rod(b, "sledHandleL", [1.48, 0.75, 1.98], [1.48, 1.08, 2.2], 0.032, METAL_DARK);
  rod(b, "sledHandleR", [2.16, 0.75, 1.98], [2.16, 1.08, 2.2], 0.032, METAL_DARK);
  rod(b, "sledHandleBar", [1.48, 1.08, 2.2], [2.16, 1.08, 2.2], 0.032, METAL_DARK);

  box(b, "sledCaseA", [0.38, 0.33, 0.42], [1.53, 0.86, 1.62], CRATE_LIGHT);
  box(b, "sledCaseB", [0.38, 0.43, 0.42], [1.98, 0.92, 1.62], CRATE);
  box(b, "sledCaseC", [0.26, 0.23, 0.36], [2.28, 0.8, 1.63], YELLOW);
  rod(b, "sledStrap", [1.3, 1.08, 1.62], [2.35, 1.08, 1.62], 0.018, CABLE);

  box(b, "junctionBox", [0.24, 0.26, 0.18], [-1.62, 1.42, -0.52], METAL_LIGHT);
  box(b, "junctionFace", [0.16, 0.12, 0.02], [-1.62, 1.42, -0.62], CYAN);

  rod(b, "cableMain", [-1.58, 1.47, -0.52], [-1.58, 1.47, -1.2], 0.018, CABLE);
  rod(b, "cableToMast", [-1.58, 1.47, -1.2], [1.82, 1.95, -1.27], 0.014, CABLE);
  for (let i = 0; i < 3; i++) {
    box(b, `cableClip${i}`, [0.1, 0.12, 0.08], [-1.58, 1.47, -0.75 - i * 0.22], YELLOW);
  }

  box(b, "snowMarkerPole", [0.07, 0.92, 0.07], [2.65, 0.7, 2.0], RED);
  for (let i = 0; i < 4; i++) {
    box(b, `snowMarkerBand${i}`, [0.085, 0.1, 0.085], [2.65, 0.36 + i * 0.22, 2.0], SNOW_LIGHT);
  }
  slab(
    b,
    "snowMarkerFlag",
    [
      [0, 0],
      [0.38, 0],
      [0.12, 0.2],
      [0.38, 0.38],
      [0, 0.38],
    ],
    [2.7, 1.38, 2.0],
    [1, 0, 0],
    0.025,
    RED,
  );

  rod(b, "snowRidgeFront", [-2.7, 0.3, 2.48], [0.25, 0.34, 2.48], 0.06, SNOW_LIGHT);
  rod(b, "snowRidgeBack", [-2.2, 0.3, -2.42], [0.9, 0.34, -2.42], 0.06, SNOW_BLUE);
  rod(b, "snowRidgeRight", [2.25, 0.3, -2.35], [2.85, 0.35, -1.9], 0.065, SNOW_LIGHT);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const at = [0, 2.56, 0.15] as const;
  const frontZ = 0.27;

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    position: readonly [number, number, number],
  ) =>
    b.part(geometry, color, {
      at: position,
      name,
      flat: true,
    });

  const box = (
    name: string,
    size: readonly [number, number, number],
    position: readonly [number, number, number],
    color: string,
  ) =>
    part(name, new THREE.BoxGeometry(size[0], size[1], size[2]), color, position);

  const rod = (
    name: string,
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, color, { name });

  // Slim, heavy dark housing: its lower edge sits directly on the snowy roof ridge.
  box("s21LightBarHousing", [1.62, 0.09, 0.22], [0, 2.59, 0.15], METAL_DARK);
  box("s21LightBarTopRail", [1.43, 0.025, 0.17], [0, 2.648, 0.15], METAL_LIGHT);
  box("s21LightBarFrontRail", [1.5, 0.032, 0.035], [0, 2.585, frontZ], INK);
  box("s21LightBarEndL", [0.075, 0.14, 0.25], [-0.84, 2.59, 0.15], METAL);
  box("s21LightBarEndR", [0.075, 0.14, 0.25], [0.84, 2.59, 0.15], METAL);

  // Two compact brackets visibly pin the bar into the roof.
  for (const s of [-1, 1]) {
    const x = s * 0.67;
    box(`s21BracketFoot${s}`, [0.2, 0.025, 0.13], [x, 2.525, 0.15], METAL_DARK);
    rod(
      `s21BracketPost${s}`,
      [x, 2.535, 0.15],
      [x, 2.56, 0.15],
      0.026,
      METAL_LIGHT,
    );
    box(`s21BracketCollar${s}`, [0.24, 0.035, 0.16], [x, 2.56, 0.15], METAL);
    box(`s21BracketRivet${s}`, [0.035, 0.045, 0.035], [x, 2.585, frontZ + 0.012], YELLOW);
  }

  // Six chunky separated lamp modules. The bezels are deliberately oversized so
  // the alternating neon lenses remain readable at a distance.
  const lampXs = [-0.63, -0.378, -0.126, 0.126, 0.378, 0.63];
  for (let i = 0; i < lampXs.length; i++) {
    const x = lampXs[i];
    const color = i % 2 === 0 ? CYAN : MAGENTA;

    box(`s21LampBezel${i}`, [0.19, 0.115, 0.19], [x, 2.6, 0.15], METAL_DARK);
    box(`s21LampTopCap${i}`, [0.15, 0.018, 0.15], [x, 2.668, 0.15], METAL_LIGHT);
    box(`s21LampLens${i}`, [0.135, 0.073, 0.022], [x, 2.6, frontZ + 0.012], color);
    box(`s21LampLowerLip${i}`, [0.15, 0.018, 0.035], [x, 2.555, frontZ + 0.023], INK);

    const lens = b.part(new THREE.BoxGeometry(0.12, 0.058, 0.012), color, {
      at: [x, 2.6, frontZ + 0.027],
      name: `s21GlowLens${i}`,
      flat: true,
    });
    glow(lens, 2.2);
  }

  // A small roof junction and two short graphic cable runs enrich the otherwise
  // clean silhouette without leaving the reserved roof area.
  box("s21RoofJunction", [0.16, 0.045, 0.13], [0, 2.535, -0.005], METAL_DARK);
  box("s21RoofJunctionFace", [0.09, 0.025, 0.075], [0, 2.55, 0.067], CYAN);
  rod("s21CableRunL", [-0.08, 2.555, 0.01], [-0.42, 2.555, 0.01], 0.012, CABLE);
  rod("s21CableRunR", [0.08, 2.555, 0.01], [0.42, 2.555, 0.01], 0.012, CABLE);

  // Small bright fasteners at the housing ends give the bar a finished,
  // manufactured read while staying inside the requested 1.75 m width.
  for (const s of [-1, 1]) {
    const x = s * 0.79;
    const rivet = b.part(new THREE.SphereGeometry(0.025, 6, 4), YELLOW, {
      at: [x, 2.59, frontZ + 0.018],
      name: `s21EndRivet${s}`,
      flat: true,
    });
    glow(rivet, 0.8);
  }
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addFrontResearchSign(b: Builder) {
  // ---------------------------------------------------------------------------
  // Front research sign: a printed expedition placard, raised border, and
  // chunky corner fasteners. The sign graphic is deliberately broad and
  // high-contrast so it reads in the Firewatch silhouette.

  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60">
      <rect x="1.5" y="1.5" width="137" height="57" rx="3"
        fill="${SNOW_LIGHT}" stroke="${INK}" stroke-width="3"/>
      <path d="M9 30 L18 11 L27 30 L18 49 Z"
        fill="${YELLOW}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M18 16 L18 44 M11.5 30 L24.5 30"
        stroke="${INK}" stroke-width="2"/>
      <circle cx="18" cy="30" r="3.2" fill="${SNOW_LIGHT}" stroke="${INK}" stroke-width="1.5"/>
      <path d="M31 13 H134 M31 47 H134" stroke="${YELLOW}" stroke-width="2"/>
      <text x="34" y="28" fill="${INK}" font-family="Arial, sans-serif"
        font-size="14" font-weight="900" letter-spacing="1.1">POLAR</text>
      <text x="34" y="42" fill="${HULL_DARK}" font-family="Arial, sans-serif"
        font-size="10.5" font-weight="900" letter-spacing="0.9">STATION</text>
      <path d="M119 13 L126 20 L133 13 M119 47 L126 40 L133 47"
        fill="none" stroke="${HULL_DARK}" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(0.7, 0.3), SNOW_LIGHT, {
    at: [-0.82, 1.43, 1.043],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "s22FrontResearchSignGraphic",
    group: "frontResearchSign",
  });

  const signFrameColor = HULL_DARK;
  const signZ = 1.055;

  b.part(new THREE.BoxGeometry(0.76, 0.025, 0.025), signFrameColor, {
    at: [-0.82, 1.595, signZ],
    name: "s22SignFrameTop",
    group: "frontResearchSign",
  });
  b.part(new THREE.BoxGeometry(0.76, 0.025, 0.025), signFrameColor, {
    at: [-0.82, 1.265, signZ],
    name: "s22SignFrameBottom",
    group: "frontResearchSign",
  });
  b.part(new THREE.BoxGeometry(0.025, 0.35, 0.025), signFrameColor, {
    at: [-1.195, 1.43, signZ],
    name: "s22SignFrameLeft",
    group: "frontResearchSign",
  });
  b.part(new THREE.BoxGeometry(0.025, 0.35, 0.025), signFrameColor, {
    at: [-0.445, 1.43, signZ],
    name: "s22SignFrameRight",
    group: "frontResearchSign",
  });

  for (const [i, p] of (
    [
      [-1.17, 1.57, 1.076],
      [-0.47, 1.57, 1.076],
      [-1.17, 1.29, 1.076],
      [-0.47, 1.29, 1.076],
    ] as [number, number, number][]
  ).entries()) {
    b.part(new THREE.SphereGeometry(0.026, 8, 5), YELLOW, {
      at: p,
      name: `s22SignRivet${i}`,
      group: "frontResearchSign",
      flat: true,
    });
  }

  // A tiny raised compass badge gives the sign a physical, layered silhouette.
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.018, 8), YELLOW, {
    at: [-1.08, 1.43, 1.075],
    dir: [0, 0, 1],
    name: "s22SignCompassBadge",
    group: "frontResearchSign",
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.018, 0.07, 4), INK, {
    at: [-1.08, 1.43, 1.091],
    dir: [0, 0, 1],
    name: "s22SignCompassNeedle",
    group: "frontResearchSign",
    flat: true,
  });

  // ---------------------------------------------------------------------------
  // Satellite dish feed assembly. It projects from the dish along the provided
  // +Z normal: collar, slim boom, triangular braces, receiver can, and a live
  // cyan status lamp.

  const feedRoot: [number, number, number] = [1.9, 3.04, -1.2];
  const feedTip: [number, number, number] = [1.9, 3.04, -1.055];

  b.part(new THREE.TorusGeometry(0.078, 0.018, 6, 12), METAL_DARK, {
    at: feedRoot,
    dir: [0, 0, 1],
    name: "s22DishFeedCollar",
    group: "dishFeed",
    flat: true,
  });

  b.rod(feedRoot, feedTip, 0.024, METAL_LIGHT, {
    name: "s22DishFeedArm",
    group: "dishFeed",
  });

  const receiver: [number, number, number] = [1.9, 3.04, -1.04];

  b.part(new THREE.CylinderGeometry(0.075, 0.062, 0.13, 8), METAL_LIGHT, {
    at: receiver,
    dir: [0, 0, 1],
    name: "s22DishReceiverPod",
    group: "dishFeed",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.018, 8), METAL_DARK, {
    at: [1.9, 3.04, -0.972],
    dir: [0, 0, 1],
    name: "s22DishReceiverCap",
    group: "dishFeed",
    flat: true,
  });

  const braceLeft: [number, number, number] = [1.735, 3.0, -1.175];
  const braceRight: [number, number, number] = [2.065, 3.0, -1.175];

  b.rod(braceLeft, receiver, 0.018, METAL_LIGHT, {
    name: "s22DishFeedBraceL",
    group: "dishFeed",
  });
  b.rod(braceRight, receiver, 0.018, METAL_LIGHT, {
    name: "s22DishFeedBraceR",
    group: "dishFeed",
  });

  b.part(new THREE.BoxGeometry(0.42, 0.025, 0.025), METAL_DARK, {
    at: [1.9, 3.0, -1.176],
    name: "s22DishFeedBraceBar",
    group: "dishFeed",
  });

  const indicator = b.part(new THREE.SphereGeometry(0.025, 8, 5), CYAN, {
    at: [1.9, 3.04, -0.957],
    name: "s22DishFeedIndicator",
    group: "dishFeed",
    flat: true,
  });
  glow(indicator, 1.7);

  // Two small receiver fins make the feed direction immediately readable.
  b.part(new THREE.BoxGeometry(0.17, 0.012, 0.055), METAL_LIGHT, {
    at: [1.9, 3.115, -1.04],
    name: "s22DishFeedFinTop",
    group: "dishFeed",
  });
  b.part(new THREE.BoxGeometry(0.17, 0.012, 0.055), METAL_LIGHT, {
    at: [1.9, 2.965, -1.04],
    name: "s22DishFeedFinBottom",
    group: "dishFeed",
  });

  // A short dark signal lead disappears into the dish, adding a useful
  // mechanical connection rather than leaving the receiver floating.
  b.rod([1.9, 3.04, -1.055], [1.9, 3.04, -1.19], 0.009, METAL_DARK, {
    name: "s22DishFeedSignalLead",
    group: "dishFeed",
  });
}
    return addFrontResearchSign;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addMastAntennaArray(b: Builder) {
  const base: [number, number, number] = [1.9, 3.39, -1.2];
  const hub: [number, number, number] = [1.9, 3.45, -1.2];

  // Reinforced crown socket and layered mounting plates.
  box(b, "s23AntennaSocket", [0.18, 0.13, 0.18], base, METAL_DARK);
  cylinder(b, "s23SocketCollar", 0.12, 0.045, [1.9, 3.53, -1.2], METAL_LIGHT);
  box(b, "s23CrownPlate", [0.68, 0.045, 0.18], [1.9, 3.445, -1.2], METAL);
  box(b, "s23CrownPlateTop", [0.56, 0.025, 0.12], [1.9, 3.48, -1.2], METAL_DARK);

  // A crisp crossbar with end blocks, braces, and visible fasteners.
  box(b, "s23Crossbar", [0.72, 0.045, 0.055], [1.9, 3.505, -1.2], METAL);
  box(b, "s23CrossbarEndL", [0.08, 0.09, 0.09], [1.55, 3.505, -1.2], METAL_DARK);
  box(b, "s23CrossbarEndR", [0.08, 0.09, 0.09], [2.25, 3.505, -1.2], METAL_DARK);
  box(b, "s23CrossbarStripeL", [0.026, 0.095, 0.096], [1.57, 3.505, -1.2], YELLOW);
  box(b, "s23CrossbarStripeR", [0.026, 0.095, 0.096], [2.23, 3.505, -1.2], YELLOW);

  sphere(b, "s23BoltL", 0.025, [1.62, 3.535, -1.2], YELLOW, [1, 0.45, 1]);
  sphere(b, "s23BoltR", 0.025, [2.18, 3.535, -1.2], YELLOW, [1, 0.45, 1]);
  sphere(b, "s23BoltCentre", 0.027, [1.9, 3.535, -1.2], RED, [1, 0.45, 1]);

  // Three intentionally different whip antennas.
  const antennaBases: [number, number, number][] = [
    [1.68, 3.54, -1.2],
    [1.9, 3.54, -1.2],
    [2.12, 3.54, -1.2],
  ];
  const antennaTips: [number, number, number][] = [
    [1.58, 3.64, -1.2],
    [1.9, 3.665, -1.2],
    [2.23, 3.615, -1.2],
  ];

  for (let i = 0; i < 3; i++) {
    const p = antennaBases[i];
    const q = antennaTips[i];

    cylinder(b, `s23Insulator${i}`, 0.04, 0.065, [p[0], 3.555, p[2]], i === 1 ? RED : YELLOW);
    box(b, `s23InsulatorBand${i}`, [0.09, 0.018, 0.09], [p[0], 3.59, p[2]], METAL_DARK);
    rod(b, `s23Whip${i}`, [p[0], 3.595, p[2]], q, i === 1 ? 0.014 : 0.011, METAL_LIGHT);
    sphere(b, `s23WhipTip${i}`, 0.022, q, i === 1 ? RED : YELLOW, [1, 1.35, 1]);

    // Small diagonal stay from each whip into the crown plate.
    rod(
      b,
      `s23WhipStay${i}`,
      [p[0], 3.555, p[2]],
      [1.9 + (p[0] - 1.9) * 0.45, 3.495, -1.2],
      0.009,
      METAL_DARK,
    );
  }

  // A short upper stabilizer bar makes the antenna silhouette more legible.
  box(b, "s23UpperStabilizer", [0.48, 0.035, 0.045], [1.9, 3.585, -1.2], METAL_DARK);
  box(b, "s23UpperStabilizerMark", [0.12, 0.045, 0.055], [1.9, 3.585, -1.2], YELLOW);
  rod(b, "s23StabilizerPostL", [1.68, 3.555, -1.2], [1.68, 3.585, -1.2], 0.012, METAL);
  rod(b, "s23StabilizerPostR", [2.12, 3.555, -1.2], [2.12, 3.585, -1.2], 0.012, METAL);

  // Compact red warning pennant on the right-hand whip.
  rod(b, "s23PennantPole", [2.15, 3.5, -1.2], [2.15, 3.645, -1.2], 0.012, METAL_DARK);
  box(b, "s23PennantStripe", [0.032, 0.038, 0.038], [2.15, 3.555, -1.2], YELLOW);
  slab(
    b,
    "s23WarningPennant",
    [
      [0, 0],
      [0.14, 0],
      [0.1, 0.045],
      [0.14, 0.09],
      [0, 0.09],
    ],
    [2.16, 3.575, -1.2],
    [1, 0, 0],
    0.018,
    RED,
  );

  // Two small directional feed tabs and a graphic yellow warning plate.
  box(b, "s23FeedTabL", [0.12, 0.035, 0.07], [1.62, 3.47, -1.24], METAL_LIGHT);
  box(b, "s23FeedTabR", [0.12, 0.035, 0.07], [2.18, 3.47, -1.24], METAL_LIGHT);
  box(b, "s23WarningPlate", [0.16, 0.025, 0.11], [1.9, 3.425, -1.295], YELLOW);
  box(b, "s23WarningPlateMark", [0.018, 0.031, 0.075], [1.9, 3.425, -1.315], RED);

  // Short terminal cables, kept within the reserved crown area.
  rod(b, "s23TerminalCableL", [1.58, 3.52, -1.2], [1.49, 3.48, -1.2], 0.008, CABLE);
  rod(b, "s23TerminalCableR", [2.22, 3.52, -1.2], [2.31, 3.48, -1.2], 0.008, CABLE);
  sphere(b, "s23TerminalL", 0.018, [1.49, 3.48, -1.2], RED, [1, 1, 0.7]);
  sphere(b, "s23TerminalR", 0.018, [2.31, 3.48, -1.2], RED, [1, 1, 0.7]);
}
    return addMastAntennaArray;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addHullCableRun(b: Builder) {
  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, color, { name });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // s24 hull communications cable run.
  //
  // The three conductors sit just proud of the -X cabin wall. The run follows
  // the rear-side service route and ends in a short angled lead toward the
  // existing mast cable.

  const cableY = [1.285, 1.345, 1.405];
  const cableZ0 = -1.08;
  const cableZ1 = 0.17;

  for (let i = 0; i < cableY.length; i++) {
    const x = -1.592 - i * 0.008;
    rod(
      `s24_cableCore${i}`,
      [x, cableY[i], cableZ0],
      [x, cableY[i], cableZ1],
      0.014,
      i === 1 ? METAL_DARK : CABLE,
    );

    // A short continuation around the rear corner suggests that the bundle
    // is actually routed to the mast rather than ending on the wall.
    rod(
      `s24_cableTail${i}`,
      [x, cableY[i], cableZ0],
      [-1.47, cableY[i], -1.22],
      0.013,
      i === 1 ? METAL_DARK : CABLE,
    );
  }

  // Four chunky square cable saddles. Each has a lighter cap and a tiny
  // yellow service screw so they read clearly at diorama scale.
  const clipZ = [-0.87, -0.47, -0.07, 0.16];
  for (let i = 0; i < clipZ.length; i++) {
    const z = clipZ[i];
    box(`s24_cableClip${i}`, [0.095, 0.145, 0.17], [-1.604, 1.345, z], METAL_DARK);
    box(`s24_cableClipFace${i}`, [0.018, 0.09, 0.115], [-1.66, 1.345, z], METAL_LIGHT);
    cylinder(`s24_cableClipBolt${i}`, 0.018, 0.025, [-1.676, 1.405, z], YELLOW, [1, 0, 0]);
  }

  // Small junction enclosure where the three conductors gather.
  box("s24_cableJunction", [0.15, 0.28, 0.34], [-1.61, 1.36, -1.01], METAL_LIGHT);
  box("s24_cableJunctionShadow", [0.025, 0.22, 0.27], [-1.695, 1.36, -1.01], METAL_DARK);
  box("s24_cableJunctionPanel", [0.014, 0.115, 0.14], [-1.714, 1.36, -1.01], PANEL);
  box("s24_cableJunctionLamp", [0.018, 0.045, 0.045], [-1.728, 1.43, -1.01], CYAN);
  box("s24_cableJunctionWarning", [0.018, 0.06, 0.045], [-1.728, 1.29, -1.01], YELLOW);

  // Small ring-like cable ties around the bundle make the three lines read as
  // one field-service harness.
  for (let i = 0; i < 3; i++) {
    const z = -0.72 + i * 0.36;
    b.part(new THREE.TorusGeometry(0.064, 0.009, 5, 10), YELLOW, {
      at: [-1.604, 1.345, z],
      dir: [0, 0, 1],
      name: `s24_cableTie${i}`,
      flat: true,
    });
  }

  // A pair of tiny strain-relief blocks at the rear bend.
  box("s24_strainReliefL", [0.13, 0.09, 0.12], [-1.55, 1.285, -1.17], METAL_DARK);
  box("s24_strainReliefR", [0.13, 0.09, 0.12], [-1.55, 1.405, -1.17], METAL_DARK);

  // ---------------------------------------------------------------------------
  // s24 fuel-drum hazard graphics.
  //
  // The same bold stencil is used on the visible +Z faces and on the +X caps:
  // the front marks read in the diorama view, while the cap marks honor the
  // supplied outward attachment normal.

  const hazardStencil = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#efb44f" stroke="#18252e" stroke-width="7"/>
      <path d="M64 17 L110 101 L18 101 Z" fill="#18252e"/>
      <path d="M64 36 L69 69 L59 69 Z" fill="#efb44f"/>
      <circle cx="64" cy="84" r="6" fill="#efb44f"/>
      <path d="M25 113 H103" stroke="#fffaf0" stroke-width="5"/>
      <text x="64" y="122" text-anchor="middle"
        font-family="Arial Black, sans-serif" font-size="17" font-weight="900"
        fill="#18252e">FUEL</text>
    </svg>`,
    { size: 192 },
  );

  const drums = [2.05, 2.48];

  for (let i = 0; i < drums.length; i++) {
    const x = drums[i];

    // Two crisp structural bands around each drum, with a small warm edge
    // highlight that keeps the bands separate from the red shell.
    for (let band = 0; band < 2; band++) {
      const bx = x + (band === 0 ? -0.14 : 0.14);
      b.part(new THREE.TorusGeometry(0.255, 0.021, 6, 14), METAL_DARK, {
        at: [bx, 0.52, 1.25],
        dir: [1, 0, 0],
        name: `s24_fuelBand${i}_${band}`,
        flat: true,
      });
      b.part(new THREE.TorusGeometry(0.258, 0.006, 5, 14), METAL_LIGHT, {
        at: [bx + 0.025, 0.52, 1.25],
        dir: [1, 0, 0],
        name: `s24_fuelBandEdge${i}_${band}`,
        flat: true,
      });
    }

    // Front-facing stencil badge, slightly off the curved drum surface.
    b.part(new THREE.PlaneGeometry(0.22, 0.22), SNOW_LIGHT, {
      at: [x, 0.52, 1.512],
      dir: [0, 0, 1],
      axis: "z",
      up: [0, 1, 0],
      texture: hazardStencil,
      name: `s24_fuelFrontStencil${i}`,
    });

    // Matching +X cap stencil, seated over the yellow cap already on stage 1.
    b.part(new THREE.CircleGeometry(0.135, 12), SNOW_LIGHT, {
      at: [x + 0.348, 0.52, 1.25],
      dir: [1, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: hazardStencil,
      name: `s24_fuelCapStencil${i}`,
      flat: true,
    });

    // Dark cap rim and a graphic valve/plug above the stencil.
    b.part(new THREE.TorusGeometry(0.155, 0.012, 5, 12), METAL_DARK, {
      at: [x + 0.354, 0.52, 1.25],
      dir: [1, 0, 0],
      name: `s24_fuelCapRim${i}`,
      flat: true,
    });
    cylinder(`s24_fuelValve${i}`, 0.045, 0.075, [x + 0.365, 0.52, 1.25], METAL_DARK, [1, 0, 0]);
    cylinder(`s24_fuelValveTop${i}`, 0.06, 0.025, [x + 0.41, 0.52, 1.25], YELLOW, [1, 0, 0]);

    // A tiny side warning stripe reinforces the yellow hazard language on the
    // curved, front-visible part of the drum.
    box(`s24_fuelSideStripe${i}`, [0.25, 0.045, 0.018], [x, 0.72, 1.512], YELLOW);
  }
}
    return addHullCableRun;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addSolarCellGrid(b: Builder) {
  const CELL_A = "#bfe9ee";
  const CELL_B = "#78b9ca";
  const CELL_HI = "#d9fbfa";
  const FRAME = "#1b3441";
  const GLINT = "#fff0b2";

  const pitch = -27 * Math.PI / 180;
  const rot = [ -27, 0, 0 ] as [number, number, number];
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);

  const panelCenters = [
    [-1.7, 1.48, -1.72],
    [-0.42, 1.48, -1.72],
  ] as const;

  const localPoint = (center: readonly [number, number, number], x: number, y: number, z: number) =>
    new THREE.Vector3(
      center[0] + x,
      center[1] + c * y - s * z,
      center[2] + s * y + c * z,
    );

  const panelBox = (
    name: string,
    center: readonly [number, number, number],
    size: [number, number, number],
    local: [number, number, number],
    color: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: localPoint(center, local[0], local[1], local[2]),
      rotation: rot,
      name,
      flat: true,
    });
  };

  const panelWidth = 1.22;
  const panelDepth = 0.76;
  const innerWidth = 1.07;
  const innerDepth = 0.61;
  const columns = 6;
  const rows = 4;
  const gap = 0.014;
  const cellWidth = (innerWidth - gap * (columns - 1)) / columns;
  const cellDepth = (innerDepth - gap * (rows - 1)) / rows;

  for (let p = 0; p < panelCenters.length; p++) {
    const center = panelCenters[p];
    const tag = p === 0 ? "L" : "R";

    // A raised, dark perimeter gives the panels a clean graphic silhouette.
    panelBox(
      `s25SolarFrameTop${tag}`,
      center,
      [panelWidth + 0.06, 0.045, 0.045],
      [0, 0.062, panelDepth / 2 + 0.008],
      FRAME,
    );
    panelBox(
      `s25SolarFrameBottom${tag}`,
      center,
      [panelWidth + 0.06, 0.045, 0.045],
      [0, 0.062, -panelDepth / 2 - 0.008],
      FRAME,
    );
    panelBox(
      `s25SolarFrameLeft${tag}`,
      center,
      [0.045, 0.045, panelDepth + 0.06],
      [-panelWidth / 2 - 0.008, 0.062, 0],
      FRAME,
    );
    panelBox(
      `s25SolarFrameRight${tag}`,
      center,
      [0.045, 0.045, panelDepth + 0.06],
      [panelWidth / 2 + 0.008, 0.062, 0],
      FRAME,
    );

    // Six-by-four inset cell field. Small gaps expose the dark panel beneath.
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x =
          -innerWidth / 2 +
          cellWidth / 2 +
          col * (cellWidth + gap);
        const z =
          -innerDepth / 2 +
          cellDepth / 2 +
          row * (cellDepth + gap);

        const color = (row + col + p) % 3 === 0 ? CELL_HI : (row + col) % 2 === 0 ? CELL_A : CELL_B;

        panelBox(
          `s25SolarCell${tag}_${row}_${col}`,
          center,
          [cellWidth, 0.019, cellDepth],
          [x, 0.052, z],
          color,
        );
      }
    }

    // Fine dark bus bars make the grid read clearly at a distance.
    for (let col = 1; col < columns; col++) {
      const x = -innerWidth / 2 + col * cellWidth + (col - 0.5) * gap;
      panelBox(
        `s25SolarBusV${tag}_${col}`,
        center,
        [0.012, 0.022, innerDepth + 0.01],
        [x, 0.066, 0],
        FRAME,
      );
    }

    for (let row = 1; row < rows; row++) {
      const z = -innerDepth / 2 + row * cellDepth + (row - 0.5) * gap;
      panelBox(
        `s25SolarBusH${tag}_${row}`,
        center,
        [innerWidth + 0.01, 0.022, 0.012],
        [0, 0.067, z],
        FRAME,
      );
    }

    // Two pale reflected corner glints, kept chunky to suit the flat-colour style.
    panelBox(
      `s25SolarGlintA${tag}`,
      center,
      [0.11, 0.014, 0.075],
      [-innerWidth / 2 + 0.12, 0.081, innerDepth / 2 - 0.12],
      GLINT,
    );
    panelBox(
      `s25SolarGlintB${tag}`,
      center,
      [0.075, 0.014, 0.11],
      [-innerWidth / 2 + 0.18, 0.082, innerDepth / 2 - 0.17],
      GLINT,
    );
  }
}
    return addSolarCellGrid;
  })(),
);
// add6
STAGE2.push(
  (() => {
type P = [number, number, number];

function cube(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: P,
  color: string,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    ...options,
    at,
    name: `s26_${name}`,
    flat: true,
  });
}

function cyl(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: P,
  color: string,
  dir: P = [0, 1, 0],
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
    at,
    dir,
    name: `s26_${name}`,
    flat: true,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: P,
  color: string,
  scale: P = [1, 1, 1],
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
    at,
    scale,
    name: `s26_${name}`,
    flat: true,
  });
}

function rod(b: Builder, name: string, a: P, z: P, radius: number, color: string) {
  return b.rod(a, z, radius, color, { name: `s26_${name}` });
}

function plate(
  b: Builder,
  name: string,
  outline: [number, number][],
  at: P,
  x: P,
  thickness: number,
  color: string,
) {
  return b.extrude(outline, {
    at,
    x,
    thickness,
    bevel: 0.004,
    color,
    name: `s26_${name}`,
  });
}

function addSledLoad(b: Builder) {
  // ---------------------------------------------------------------------------
  // Expedition-case labels. One reusable graphic gives the sled a readable
  // field-equipment identity without adding a forest of tiny painted meshes.

  const caseLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 40">
      <rect x="1.5" y="1.5" width="93" height="37" rx="3" fill="#f3f0df" stroke="#18252e" stroke-width="3"/>
      <path d="M8 29 L18 10 L28 29 Z" fill="#d76542" stroke="#18252e" stroke-width="2"/>
      <path d="M18 15 L18 25 M13 22 L23 22" stroke="#f3f0df" stroke-width="2"/>
      <text x="34" y="18" font-family="sans-serif" font-weight="bold" font-size="11" fill="#18252e">POLAR</text>
      <text x="34" y="31" font-family="sans-serif" font-weight="bold" font-size="10" fill="#963b3d">FIELD KIT</text>
    </svg>`,
    { size: 192 },
  );

  const caseInfo = [
    {
      id: "A",
      at: [1.53, 0.86, 1.62] as P,
      size: [0.38, 0.33, 0.42] as P,
      label: [0.27, 0.12] as P,
      labelY: 0.86,
    },
    {
      id: "B",
      at: [1.98, 0.92, 1.62] as P,
      size: [0.38, 0.43, 0.42] as P,
      label: [0.27, 0.14] as P,
      labelY: 0.94,
    },
    {
      id: "C",
      at: [2.28, 0.8, 1.63] as P,
      size: [0.26, 0.23, 0.36] as P,
      label: [0.18, 0.09] as P,
      labelY: 0.8,
    },
  ];

  for (const item of caseInfo) {
    const [x, y, z] = item.at;
    const [w, h, d] = item.size;
    const front = z + d / 2 + 0.012;
    const top = y + h / 2;

    // Raised lids and a pale lid seam make the three already-present cases
    // read as distinct hard expedition containers.
    cube(b, `case${item.id}Lid`, [w + 0.035, 0.045, d + 0.035], [x, top + 0.018, z], CRATE_LIGHT);
    cube(b, `case${item.id}LidSeam`, [w + 0.045, 0.018, 0.035], [x, top - 0.002, z + d / 2 + 0.02], METAL);

    // Two straps wrap over each lid and continue down the visible front.
    for (const dx of [-w * 0.27, w * 0.27]) {
      cube(b, `case${item.id}TopStrap${dx}`, [0.035, 0.027, d + 0.045], [x + dx, top + 0.047, z], CABLE);
      cube(
        b,
        `case${item.id}FrontStrap${dx}`,
        [0.035, h + 0.055, 0.027],
        [x + dx, y, front + 0.008],
        CABLE,
      );
      cube(
        b,
        `case${item.id}Buckle${dx}`,
        [0.075, 0.06, 0.018],
        [x + dx, y + 0.035, front + 0.027],
        METAL_LIGHT,
      );
    }

    // Small metal corner guards and one dark handle per case.
    for (const sx of [-1, 1]) {
      cube(
        b,
        `case${item.id}Corner${sx}`,
        [0.035, h * 0.78, 0.035],
        [x + sx * (w / 2 - 0.025), y, front + 0.02],
        METAL,
      );
    }

    rod(
      b,
      `case${item.id}HandleL`,
      [x - 0.075, top + 0.06, z - 0.05],
      [x - 0.075, top + 0.14, z - 0.05],
      0.014,
      METAL_DARK,
    );
    rod(
      b,
      `case${item.id}HandleR`,
      [x + 0.075, top + 0.06, z - 0.05],
      [x + 0.075, top + 0.14, z - 0.05],
      0.014,
      METAL_DARK,
    );
    rod(
      b,
      `case${item.id}HandleGrip`,
      [x - 0.075, top + 0.14, z - 0.05],
      [x + 0.075, top + 0.14, z - 0.05],
      0.016,
      METAL,
    );

    // Graphic inventory labels on the front-facing faces.
    b.part(new THREE.PlaneGeometry(item.label[0], item.label[1]), SNOW_LIGHT, {
      at: [x, item.labelY, front + 0.018],
      dir: [0, 0, 1],
      axis: "z",
      texture: caseLabel,
      name: `s26_case${item.id}Label`,
    });
  }

  // ---------------------------------------------------------------------------
  // Rolled orange weather tarp tucked into the front of the sled.

  cyl(b, "tarpRoll", 0.105, 0.72, [1.78, 1.035, 1.31], ORANGE, [1, 0, 0]);
  cyl(b, "tarpEndL", 0.088, 0.025, [1.415, 1.035, 1.31], CRATE_LIGHT, [1, 0, 0]);
  cyl(b, "tarpEndR", 0.088, 0.025, [2.145, 1.035, 1.31], CRATE_LIGHT, [1, 0, 0]);

  for (const x of [1.55, 1.99]) {
    cyl(b, `tarpTie${x}`, 0.111, 0.035, [x, 1.035, 1.31], CABLE, [1, 0, 0]);
    cube(b, `tarpTieTab${x}`, [0.045, 0.07, 0.028], [x, 1.11, 1.31], METAL);
  }

  // A loose end flap, folded over the front lip.
  plate(
    b,
    "tarpFlap",
    [
      [0, 0],
      [0.32, 0],
      [0.27, 0.09],
      [0.08, 0.13],
      [0, 0.08],
    ],
    [1.58, 0.96, 1.205],
    [1, 0, 0],
    0.018,
    ORANGE,
  );

  // ---------------------------------------------------------------------------
  // Two pale snow anchors/hooks resting diagonally inside the cargo sled.

  const hooks = [
    { id: "L", x: 1.31, z: 1.21, side: 1 },
    { id: "R", x: 2.33, z: 1.21, side: -1 },
  ];

  for (const h of hooks) {
    const x = h.x;
    const z = h.z;
    const s = h.side;

    rod(b, `snowHook${h.id}Shaft`, [x, 0.72, z], [x + s * 0.035, 1.02, z], 0.027, SNOW_LIGHT);
    rod(
      b,
      `snowHook${h.id}Shoulder`,
      [x + s * 0.035, 1.02, z],
      [x + s * 0.13, 0.96, z],
      0.027,
      SNOW_LIGHT,
    );
    rod(
      b,
      `snowHook${h.id}Tip`,
      [x + s * 0.13, 0.96, z],
      [x + s * 0.16, 0.87, z],
      0.027,
      SNOW_LIGHT,
    );
    cyl(b, `snowHook${h.id}Collar`, 0.038, 0.075, [x, 0.84, z], METAL, [0, 1, 0]);
    sphere(b, `snowHook${h.id}Grip`, 0.038, [x, 0.7, z], CRATE_LIGHT, [1.2, 0.7, 1.2]);
  }

  // Sled lashing eyelets at the four corners.
  for (const [i, x] of [1.28, 2.36].entries()) {
    for (const [j, z] of [1.31, 1.99].entries()) {
      cyl(b, `sledEyelet${i}${j}`, 0.035, 0.045, [x, 0.67, z], METAL_LIGHT, [0, 1, 0]);
    }
  }

  // ---------------------------------------------------------------------------
  // Snow marker: reinforce the existing marker as a readable, weatherproof
  // expedition stake with base collar, reflective bands, cap, flag, and guying.

  cube(b, "markerSnowBoot", [0.32, 0.12, 0.3], [2.65, 0.31, 2.0], SNOW_BLUE);
  b.part(new THREE.TorusGeometry(0.145, 0.027, 6, 12), SNOW_LIGHT, {
    at: [2.65, 0.39, 2.0],
    name: "s26_markerSnowRing",
  });

  // Fresh, slightly proud bands sit over the existing pole and make the
  // alternating red-and-pale signal unmistakable from the front.
  for (let i = 0; i < 4; i++) {
    const y = 0.47 + i * 0.2;
    cube(
      b,
      `markerBand${i}`,
      [0.095, 0.085, 0.095],
      [2.65, y, 2.0],
      i % 2 === 0 ? SNOW_LIGHT : RED,
    );
  }

  cube(b, "markerCollar", [0.12, 0.07, 0.12], [2.65, 1.15, 2.0], METAL_DARK);
  sphere(b, "markerCap", 0.075, [2.65, 1.24, 2.0], RED, [1, 0.65, 1]);

  // Small two-tone triangular flag, mounted just under the cap.
  plate(
    b,
    "markerFlagRed",
    [
      [0, 0],
      [0.3, 0.02],
      [0.08, 0.16],
      [0.3, 0.3],
      [0, 0.3],
    ],
    [2.7, 1.0, 2.0],
    [1, 0, 0],
    0.022,
    RED,
  );
  plate(
    b,
    "markerFlagSnowInset",
    [
      [0.025, 0.055],
      [0.16, 0.06],
      [0.08, 0.15],
      [0.025, 0.18],
    ],
    [2.705, 1.0, 2.014],
    [1, 0, 0],
    0.008,
    SNOW_LIGHT,
  );

  // Guy lines pull the stake into the snow and create a small, useful
  // triangular silhouette around the otherwise narrow pole.
  rod(b, "markerGuyL", [2.65, 0.78, 2.0], [2.39, 0.35, 1.82], 0.009, METAL);
  rod(b, "markerGuyR", [2.65, 0.78, 2.0], [2.91, 0.35, 1.84], 0.009, METAL);
  cyl(b, "markerAnchorL", 0.045, 0.08, [2.39, 0.34, 1.82], METAL_DARK, [0, 1, 0]);
  cyl(b, "markerAnchorR", 0.045, 0.08, [2.91, 0.34, 1.84], METAL_DARK, [0, 1, 0]);

  // A tiny pale snow fin at the back of the boot visually seats the marker
  // into the drift rather than leaving it as a floating signpost.
  plate(
    b,
    "markerSnowFin",
    [
      [-0.18, 0],
      [0.18, 0],
      [0.08, 0.12],
      [-0.08, 0.12],
    ],
    [2.65, 0.34, 2.13],
    [1, 0, 0],
    0.018,
    SNOW_LIGHT,
  );
}
    return addSledLoad;
  })(),
);
