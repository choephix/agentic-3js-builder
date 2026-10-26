import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const SNOW = "#dcecf0";
export const SNOW_SHADOW = "#a9c9d4";
export const ICE = "#7ea8b8";
export const HULL = "#d96b3c";
export const HULL_DARK = "#8f3d32";
export const TRIM = "#26394a";
export const ROOF = "#394d5c";
export const WINDOW = "#173e57";
export const WINDOW_GLOW = "#e9b45b";
export const WOOD = "#765044";
export const METAL = "#667783";
export const DARK_METAL = "#26313b";
export const WARNING = "#e7b64a";
export const RED = "#b93632";
export const TEAL = "#5fa7a5";
export const CABLE = "#17232d";
export const GLASS = "#83c6cf";

export const meta = {
  name: "arctic research outpost",
  description:
    "A stylized Firewatch-colour arctic research station on a faceted snow island, with a warm cabin, raised porch, generator annex, roof equipment and clear surfaces reserved for stage-two detail.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "roof",
    what: "Neon emergency light bar across the cabin roof: a slim dark housing, six alternating CYAN and MAGENTA lamps, and two metal mounting brackets. Keep it graphic and highly visible.",
    at: [0, 1.94, 0.05],
    normal: [0, 1, 0],
    bone: null,
    room: [1.45, 0.24, 0.3],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "mast",
    what: "Arctic communications antenna array: three thin antenna rods with small crossbars and a compact orange signal box, in DARK_METAL, METAL and WARNING.",
    at: [0, 2.28, -0.42],
    normal: [0, 1, 0],
    bone: null,
    room: [0.55, 0.8, 0.55],
  },
  {
    id: "solarPanels",
    kind: "add",
    part: "roof",
    what: "Two tilted rectangular solar panels on low brackets, deep blue-black cells divided by pale METAL lines. Place them on the rear roof plane without hiding the light bar.",
    at: [0.52, 1.91, -0.26],
    normal: [0, 1, -0.3],
    bone: null,
    room: [0.75, 0.12, 0.72],
  },
  {
    id: "frontSign",
    kind: "add",
    part: "frontSign",
    what: "Raised station sign reading POLAR WATCH in chunky cream letters on a dark plaque, with a tiny orange compass emblem. Mount centered above the front door.",
    at: [0, 1.35, 0.692],
    normal: [0, 0, 1],
    bone: null,
    room: [0.95, 0.22, 0.045],
  },
  {
    id: "doorHardware",
    kind: "add",
    part: "frontDoor",
    what: "Door hardware: a bright WARNING push bar, three dark hinges, a small cyan access panel and a red emergency pull tab.",
    at: [0.28, 0.72, 0.73],
    normal: [0, 0, 1],
    bone: null,
    room: [0.25, 0.5, 0.05],
  },
  {
    id: "windowFrost",
    kind: "add",
    part: "frontWindow",
    what: "Frost patterns around the front window: chunky branching ice decals in SNOW and ICE, leaving the glowing amber interior visible in the centre.",
    at: [-0.38, 1.0, 0.716],
    normal: [0, 0, 1],
    bone: null,
    room: [0.58, 0.48, 0.025],
  },
  {
    id: "sideGrille",
    kind: "add",
    part: "generator",
    what: "Generator ventilation grille on the annex side: five horizontal DARK_METAL slats, a red warning triangle and two yellow bolts.",
    at: [0.93, 0.58, -0.08],
    normal: [1, 0, 0],
    bone: null,
    room: [0.05, 0.46, 0.5],
  },
  {
    id: "fuelCanisters",
    kind: "add",
    part: "fuelRack",
    what: "A rack of three squat red fuel canisters beside the generator annex, with black caps, pale labels and a retaining metal strap.",
    at: [1.02, 0.43, -0.42],
    normal: [1, 0, 0],
    bone: null,
    room: [0.38, 0.55, 0.62],
  },
  {
    id: "cableRun",
    kind: "add",
    part: "cablePorts",
    what: "Black insulated power cables running from the generator toward the cabin wall, with three yellow fastening clips. Use a clean, readable draped route.",
    at: [0.78, 0.48, -0.18],
    normal: [1, 0, 0],
    bone: null,
    room: [0.12, 0.22, 0.8],
  },
  {
    id: "snowMarkers",
    kind: "add",
    part: "snowfield",
    what: "Four tall orange-and-black snow stakes around the station perimeter, each with a tiny reflective yellow flag.",
    at: [0, 0.24, 0.95],
    normal: [0, 1, 0],
    bone: null,
    room: [2.45, 0.65, 2.2],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "hullSideL",
    what: "Flat Firewatch-style geometric weathering on the left hull: large HULL and HULL_DARK angular blocks, subtle SNOW grime along the lower edge, and a faded white unit number near the rear.",
  },
  {
    id: "hullCamoRight",
    kind: "texture",
    part: "hullSideR",
    what: "A mirrored but slightly different blocky HULL/HULL_DARK paint pattern on the right hull, with broad clean shapes rather than noisy realism.",
  },
  {
    id: "roofSnow",
    kind: "texture",
    part: "roof",
    what: "Broad graphic snow caps on the roof ridges and eaves in SNOW and SNOW_SHADOW, leaving the orange roof colour visible as a bold border.",
  },
  {
    id: "windowReflection",
    kind: "texture",
    part: "frontWindow",
    what: "Simple pale-blue diagonal ice reflections across the front window, plus a warm amber lower glow. Keep the window readable as glass.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function addBox(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  extra: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    ...extra,
  });
}

function addCylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: [number, number, number],
  color: string,
  radial = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
    at,
    name,
  });
}

function addRock(
  b: Builder,
  name: string,
  at: [number, number, number],
  scale: [number, number, number],
  color: string,
) {
  return b.part(new THREE.IcosahedronGeometry(1, 1), color, {
    at,
    scale,
    name,
    flat: true,
  });
}

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  // Faceted floating-looking snow island, sunk just enough to meet the floor.
  addCylinder(b, "snowfield", 1.78, 0.18, [0, 0.09, 0], SNOW, 12);
  addCylinder(b, "snowfieldShadow", 1.5, 0.045, [0, 0.205, 0], SNOW_SHADOW, 12);
  addRock(b, "iceRockA", [-1.25, 0.22, 0.42], [0.48, 0.27, 0.38], ICE);
  addRock(b, "iceRockB", [1.34, 0.2, 0.55], [0.38, 0.23, 0.3], SNOW_SHADOW);
  addRock(b, "iceRockC", [-1.28, 0.19, -0.7], [0.55, 0.19, 0.3], ICE);
  addRock(b, "iceRockD", [1.25, 0.2, -0.82], [0.44, 0.24, 0.42], SNOW_SHADOW);

  // Cabin body: warm orange against the cold blue-white environment.
  addBox(b, "hullSideL", [0.78, 1.08, 1.34], [0.41, 0.82, 0], HULL);
  addBox(b, "hullSideR", [0.78, 1.08, 1.34], [-0.41, 0.82, 0], HULL);
  addBox(b, "hullBand", [1.72, 0.13, 1.39], [0, 1.13, 0], HULL_DARK);
  addBox(b, "lowerHullTrim", [1.78, 0.14, 1.42], [0, 0.31, 0], TRIM);
  addBox(b, "upperHullTrim", [1.78, 0.09, 1.42], [0, 1.38, 0], WOOD);

  // Front wall overlays and a centered door.
  addBox(b, "frontWall", [1.72, 1.08, 0.08], [0, 0.82, 0.69], HULL);
  addBox(b, "frontDoor", [0.42, 0.78, 0.055], [0.31, 0.74, 0.748], WOOD);
  addBox(b, "doorFrameL", [0.06, 0.88, 0.07], [0.055, 0.78, 0.78], TRIM);
  addBox(b, "doorFrameR", [0.06, 0.88, 0.07], [0.565, 0.78, 0.78], TRIM);
  addBox(b, "doorLintel", [0.57, 0.08, 0.07], [0.31, 1.19, 0.78], TRIM);

  // Large clean windows intentionally left available for frost and reflections.
  addBox(b, "frontWindow", [0.62, 0.48, 0.035], [-0.43, 1.0, 0.748], WINDOW);
  addBox(b, "frontWindowGlow", [0.48, 0.33, 0.012], [-0.43, 1.0, 0.77], WINDOW_GLOW);
  addBox(b, "sideWindowL", [0.035, 0.5, 0.68], [0.818, 1.0, 0.12], WINDOW);
  addBox(b, "sideWindowLGlow", [0.012, 0.34, 0.49], [0.842, 1.0, 0.12], WINDOW_GLOW);
  addBox(b, "sideWindowR", [0.035, 0.5, 0.68], [-0.818, 1.0, -0.18], WINDOW);
  addBox(b, "sideWindowRGlow", [0.012, 0.34, 0.49], [-0.842, 1.0, -0.18], WINDOW_GLOW);

  // Window mullions.
  for (const x of [-0.43]) {
    addBox(b, "frontMullionV", [0.035, 0.5, 0.045], [x, 1.0, 0.775], TRIM);
    addBox(b, "frontMullionH", [0.62, 0.035, 0.045], [x, 1.0, 0.775], TRIM);
  }
  addBox(b, "sideMullionL", [0.045, 0.5, 0.035], [0.847, 1.0, 0.12], TRIM);
  addBox(b, "sideMullionR", [0.045, 0.5, 0.035], [-0.847, 1.0, -0.18], TRIM);

  // Pentagonal roof slab with broad overhang.
  b.extrude(
    [
      [-1.04, 0],
      [1.04, 0],
      [0.86, 0.18],
      [0, 0.46],
      [-0.86, 0.18],
    ],
    {
      at: [0, 1.4, -0.78],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 1.56,
      bevel: 0.015,
      color: ROOF,
      name: "roof",
    },
  );
  addBox(b, "roofEaveFront", [2.16, 0.1, 0.1], [0, 1.45, 0.83], HULL_DARK);
  addBox(b, "roofEaveBack", [2.16, 0.1, 0.1], [0, 1.45, -0.83], HULL_DARK);

  // Raised porch / entrance deck.
  addBox(b, "porchDeck", [1.12, 0.13, 0.62], [0.05, 0.27, 0.98], WOOD);
  addBox(b, "porchSnow", [1.04, 0.06, 0.55], [0.05, 0.36, 0.99], SNOW);
  for (const x of [-0.43, 0.5]) {
    addCylinder(b, "porchPost", 0.045, 0.64, [x, 0.55, 1.18], WOOD, 6);
    addBox(b, "porchRail", [0.09, 0.08, 0.5], [x, 0.83, 1.18], WOOD);
  }
  addBox(b, "porchHandrail", [0.98, 0.07, 0.07], [0.04, 0.86, 1.18], WOOD);
  addBox(b, "porchStep", [0.92, 0.1, 0.23], [0.05, 0.14, 1.32], WOOD);

  // Small rear generator annex, deliberately separate and boxy.
  addBox(b, "generator", [0.58, 0.62, 0.68], [0.93, 0.58, -0.23], HULL_DARK);
  addBox(b, "generatorTop", [0.67, 0.11, 0.76], [0.93, 0.93, -0.23], ROOF);
  addBox(b, "generatorFront", [0.48, 0.42, 0.035], [0.93, 0.6, 0.12], METAL);
  addBox(b, "generatorPanel", [0.28, 0.2, 0.045], [0.93, 0.63, 0.15], DARK_METAL);
  addBox(b, "generatorBase", [0.72, 0.09, 0.78], [0.93, 0.27, -0.23], TRIM);
  addBox(b, "fuelRack", [0.08, 0.48, 0.58], [1.28, 0.52, -0.42], DARK_METAL);

  // Roof mast, kept simple so stage two has room for the richer antenna array.
  addCylinder(b, "mast", 0.035, 0.92, [0, 1.93, -0.43], DARK_METAL, 8);
  addCylinder(b, "mastFoot", 0.12, 0.08, [0, 1.52, -0.43], METAL, 8);
  addBox(b, "mastBraceL", [0.035, 0.4, 0.035], [0.18, 1.75, -0.43], METAL);
  addBox(b, "mastBraceR", [0.035, 0.4, 0.035], [-0.18, 1.75, -0.43], METAL);

  // Chimney and a square exhaust cap.
  addCylinder(b, "chimney", 0.09, 0.48, [0.62, 1.73, 0.25], DARK_METAL, 8);
  addBox(b, "chimneyCap", [0.24, 0.07, 0.24], [0.62, 1.98, 0.25], DARK_METAL);
  addBox(b, "chimneySnow", [0.28, 0.045, 0.28], [0.62, 2.02, 0.25], SNOW);

  // Snow lip shapes on the building footprint.
  addBox(b, "snowDriftFront", [1.55, 0.18, 0.24], [0, 0.34, 0.73], SNOW);
  addBox(b, "snowDriftRear", [1.48, 0.2, 0.25], [-0.1, 0.35, -0.72], SNOW_SHADOW);
  addBox(b, "snowDriftGenerator", [0.7, 0.16, 0.25], [0.94, 0.34, -0.54], SNOW);

  // Graphic corner posts and a few structural seams.
  for (const x of [-0.84, 0.84]) {
    addBox(b, "cornerPost", [0.1, 1.2, 0.1], [x, 0.83, 0.69], TRIM);
    addBox(b, "cornerPostRear", [0.1, 1.2, 0.1], [x, 0.83, -0.69], TRIM);
  }
  for (const z of [-0.38, 0.02, 0.42]) {
    addBox(b, "hullSeam", [1.72, 0.025, 0.018], [0, 0.48 + z * 0.02, z], HULL_DARK);
  }

  // A compact orange crate and a dark equipment case anchor the foreground.
  addBox(b, "supplyCrate", [0.36, 0.32, 0.36], [-0.94, 0.39, 0.76], HULL_DARK);
  addBox(b, "supplyCrateLid", [0.4, 0.05, 0.4], [-0.94, 0.58, 0.76], WARNING);
  addBox(b, "equipmentCase", [0.38, 0.25, 0.28], [1.02, 0.37, 0.79], DARK_METAL);
  addBox(b, "equipmentCaseBand", [0.4, 0.05, 0.04], [1.02, 0.48, 0.94], WARNING);

  // Simple perimeter stakes give the diorama a clear scale and arctic field language.
  const stakes: [number, number, number][] = [
    [-1.38, 0.38, 1.1],
    [1.4, 0.38, 1.08],
    [-1.3, 0.38, -1.08],
    [1.38, 0.38, -1.12],
  ];
  stakes.forEach((p, i) => {
    addCylinder(b, `snowStake${i}`, 0.025, 0.42, p, i % 2 ? WARNING : RED, 6);
    addBox(b, `snowStakeFlag${i}`, [0.15, 0.08, 0.025], [p[0] + 0.07, p[1] + 0.17, p[2]], WARNING);
  });

  // A few faceted blue shadows make the white island read as sculpted snow.
  addRock(b, "snowShadowA", [-0.55, 0.205, 1.3], [0.65, 0.035, 0.18], SNOW_SHADOW);
  addRock(b, "snowShadowB", [0.75, 0.205, -1.25], [0.48, 0.035, 0.16], SNOW_SHADOW);
  addRock(b, "snowShadowC", [-1.55, 0.205, -0.12], [0.28, 0.035, 0.38], ICE);

  for (const add of STAGE2) add(b);
  return b.root;
}
