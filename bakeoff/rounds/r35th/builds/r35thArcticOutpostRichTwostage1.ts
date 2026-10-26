import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
    what: "Add a bright yellow hazard stencil and two dark bands to the pair of fuel drums. Keep the lettering abstract and graphic, not realistic.",
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
  color: string,
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

function cone(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: Point,
  color: string,
  options: any = {},
) {
  return b.part(new THREE.ConeGeometry(radius, height, 7), color, {
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

  // ---------------------------------------------------------------------------
  // Snow shelf and wind-carved perimeter.

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

  // ---------------------------------------------------------------------------
  // Raised cabin foundation, chunky stilts, braces, and platform.

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

  // ---------------------------------------------------------------------------
  // Main orange field cabin and gable roof.

  box(b, "cab", [3.04, 1.22, 1.78], [0, 1.59, 0], HULL);
  box(b, "hullSideL", [0.045, 1.12, 1.7], [1.535, 1.59, 0], HULL_LIGHT);
  box(b, "hullSideR", [0.045, 1.12, 1.7], [-1.535, 1.59, 0], HULL_DARK);
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

  box(b, "roofL", [1.7, 0.13, 2.02], [-0.7, 2.29, 0], ROOF, {
    rotation: [0, 0, -23],
  });
  box(b, "roofR", [1.7, 0.13, 2.02], [0.7, 2.29, 0], ROOF, {
    rotation: [0, 0, 23],
  });
  box(b, "snowRoofL", [1.6, 0.075, 2.0], [-0.7, 2.39, 0], SNOW_LIGHT, {
    rotation: [0, 0, -23],
  });
  box(b, "snowRoofR", [1.6, 0.075, 2.0], [0.7, 2.39, 0], SNOW_BLUE, {
    rotation: [0, 0, 23],
  });
  box(b, "ridgeCap", [0.18, 0.16, 2.05], [0, 2.54, 0], METAL_DARK);

  // Strong orange and dark trim around the cabin edges.
  box(b, "trimFrontTop", [3.06, 0.08, 0.06], [0, 2.11, 0.94], ORANGE);
  box(b, "trimFrontBottom", [3.06, 0.08, 0.06], [0, 1.02, 0.94], HULL_DARK);
  box(b, "trimSideLTop", [0.08, 0.08, 1.8], [1.52, 2.11, 0], ORANGE);
  box(b, "trimSideRTop", [0.08, 0.08, 1.8], [-1.52, 2.11, 0], HULL_LIGHT);
  box(b, "cornerLFront", [0.12, 1.16, 0.12], [1.5, 1.57, 0.9], HULL_DARK);
  box(b, "cornerRFront", [0.12, 1.16, 0.12], [-1.5, 1.57, 0.9], ORANGE);

  // ---------------------------------------------------------------------------
  // Front door, windows, panes, and graphic frames.

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

  // Clear sign board left of the door, reserved for the stage-two emblem.
  box(b, "frontSignPost", [0.08, 0.42, 0.08], [-0.82, 1.08, 1.02], METAL_DARK);
  box(b, "frontSign", [0.82, 0.43, 0.045], [-0.82, 1.43, 1.0], ROOF_LIGHT);
  box(b, "frontSignInset", [0.7, 0.3, 0.012], [-0.82, 1.43, 1.03], HULL_LIGHT);

  // ---------------------------------------------------------------------------
  // Front access ladder.

  rod(b, "ladderRailL", [-1.26, 0.29, 1.25], [-1.26, 0.91, 1.25], 0.035, METAL_DARK);
  rod(b, "ladderRailR", [-0.72, 0.29, 1.25], [-0.72, 0.91, 1.25], 0.035, METAL_DARK);
  for (let i = 0; i < 5; i++) {
    const y = 0.34 + i * 0.135;
    rod(b, `ladderStep${i}`, [-1.27, y, 1.25], [-0.71, y, 1.25], 0.028, METAL_LIGHT);
  }
  box(b, "ladderTopPlate", [0.74, 0.08, 0.3], [-0.99, 0.94, 1.25], METAL);

  // ---------------------------------------------------------------------------
  // Mast tripod, radio hardware, dish, and cable lines.

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

  // Satellite dish with a simple low-poly hemisphere and rim.
  sphere(b, "dish", 0.52, [1.93, 3.02, -1.26], METAL_LIGHT, [1, 0.42, 1]);
  b.part(new THREE.TorusGeometry(0.51, 0.035, 6, 14), METAL_DARK, {
    at: [1.93, 3.02, -1.26],
    name: "dishRim",
  });
  rod(b, "dishSupportL", [1.57, 2.82, -1.26], [1.93, 3.02, -1.26], 0.028, METAL_DARK);
  rod(b, "dishSupportR", [2.29, 2.82, -1.26], [1.93, 3.02, -1.26], 0.028, METAL_DARK);
  box(b, "dishBackBlock", [0.28, 0.3, 0.2], [1.93, 2.78, -1.25], METAL_DARK);

  // Upper mast silhouette.
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

  // ---------------------------------------------------------------------------
  // Solar panel rack behind the cabin.

  rod(b, "solarRackL", [-2.25, 0.32, -1.72], [-2.08, 1.28, -1.72], 0.035, METAL_DARK);
  rod(b, "solarRackR", [-0.92, 0.32, -1.72], [-1.08, 1.28, -1.72], 0.035, METAL_DARK);
  rod(b, "solarRackCross", [-2.08, 1.28, -1.72], [-1.08, 1.28, -1.72], 0.035, METAL);

  box(b, "solarPanelL", [1.22, 0.065, 0.76], [-1.7, 1.48, -1.72], PANEL, {
    rotation: [-27, 0, 0],
  });
  box(b, "solarPanelR", [1.22, 0.065, 0.76], [-0.42, 1.48, -1.72], PANEL_DARK, {
    rotation: [-27, 0, 0],
  });

  for (let side = 0; side < 2; side++) {
    const x0 = side === 0 ? -1.7 : -0.42;
    const panelColor = side === 0 ? PANEL_DARK : PANEL;
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

  // ---------------------------------------------------------------------------
  // Utility gear: fuel, generator, crates, and cargo sled.

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

  // Cargo sled at the front-right, kept deliberately graphic.
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

  // ---------------------------------------------------------------------------
  // Small graphic details and arctic marker.

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

  // A few broad snow ridges are part of the outpost's immediate diorama footprint.
  rod(b, "snowRidgeFront", [-2.7, 0.3, 2.48], [0.25, 0.34, 2.48], 0.06, SNOW_LIGHT);
  rod(b, "snowRidgeBack", [-2.2, 0.3, -2.42], [0.9, 0.34, -2.42], 0.06, SNOW_BLUE);
  rod(b, "snowRidgeRight", [2.25, 0.3, -2.35], [2.85, 0.35, -1.9], 0.065, SNOW_LIGHT);

  for (const add of STAGE2) add(b);
  return b.root;
}
