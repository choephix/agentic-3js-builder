import * as THREE from "three";
import { type Builder, createBuilder, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

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

const HULL_CAMO_L = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#d96b3c"/>
    <path d="M0 0h72l34 46-25 40H0z M128 0h128v53l-42 31-49-27z M0 133l55-20 43 38-19 53H0z
             M145 113l57-24 54 37v55l-70-9-31-31z" fill="#8f3d32"/>
    <path d="M0 222h256v34H0z" fill="#dcecf0" opacity=".72"/>
    <path d="M0 213l42-8 34 11 43-13 42 10 44-9 51 8v14H0z" fill="#a9c9d4" opacity=".72"/>
    <path d="M184 176h48v30h-48z" fill="#dcecf0" opacity=".48"/>
    <text x="190" y="198" font-family="sans-serif" font-weight="bold" font-size="18" fill="#f4efe2">PW-07</text>
  </svg>`,
  { size: 512 },
);

const HULL_CAMO_R = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#d96b3c"/>
    <path d="M0 0h54l41 34-22 54H0z M98 0h73l27 42-38 40-54-22z M210 0h46v96l-39-18-18-43z
             M0 125l36-20 48 29-24 67H0z M104 116l61-28 43 42-25 48-67 4z M225 136l31-22v83l-48-23z"
          fill="#8f3d32"/>
    <path d="M0 226h256v30H0z" fill="#dcecf0" opacity=".62"/>
    <path d="M0 216l48-10 44 12 39-10 46 8 42-11 37 10v17H0z" fill="#a9c9d4" opacity=".66"/>
  </svg>`,
  { size: 512 },
);

const ROOF_SNOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256">
    <rect width="512" height="256" fill="#394d5c"/>
    <path d="M0 0h160l-20 40-52 26-88-13z M215 0h155l-18 48-58 25-78-28z M420 0h92v68l-48 18-35-33z"
          fill="#dcecf0"/>
    <path d="M0 55l88 12 52-26-12 42-70 25L0 97z M198 47l96 26 58-25-18 45-67 25-69-27z
             M392 54l58 32 62-18v39l-74 25-48-32z" fill="#a9c9d4"/>
    <path d="M0 226h512v30H0z" fill="#dcecf0"/>
    <path d="M0 214l80 8 72-13 90 16 83-18 91 11 96-13v25H0z" fill="#a9c9d4"/>
  </svg>`,
  { size: 1024 },
);

const WINDOW_REFLECTION = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 192">
    <rect width="256" height="192" fill="#173e57"/>
    <rect y="143" width="256" height="49" fill="#e9b45b"/>
    <path d="M-20 118L84 0h29L9 118z M74 151L205 0h25L99 151z M178 151L256 61v43l-42 47z"
          fill="#b9e5e8" opacity=".72"/>
    <path d="M0 132L64 58" stroke="#e8ffff" stroke-width="7" opacity=".45"/>
    <path d="M153 192h103v-29l-37 9-66-4z" fill="#ffd782" opacity=".55"/>
  </svg>`,
  { size: 512 },
);

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
  addBox(b, "hullSideL", [0.78, 1.08, 1.34], [0.41, 0.82, 0], HULL, { texture: HULL_CAMO_L });
  addBox(b, "hullSideR", [0.78, 1.08, 1.34], [-0.41, 0.82, 0], HULL, { texture: HULL_CAMO_R });
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
  addBox(b, "frontWindow", [0.62, 0.48, 0.035], [-0.43, 1.0, 0.748], WINDOW, {
    texture: WINDOW_REFLECTION,
  });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLightBar(b: Builder) {
  const CYAN = "#35e6e3";
  const MAGENTA = "#ed4fa5";
  const LAMP_WHITE = "#fff2d0";

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

  const cyl = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name,
      flat: true,
    });

  // A low, chunky housing keeps the silhouette graphic and visible against the snow.
  box("s21LightBarHousing", [1.28, 0.075, 0.17], [0, 1.965, 0.05], DARK_METAL);
  box("s21LightBarTopRail", [1.18, 0.025, 0.12], [0, 2.012, 0.05], METAL);
  box("s21LightBarFrontRail", [1.2, 0.035, 0.035], [0, 1.956, 0.145], TRIM);
  box("s21LightBarBackRail", [1.2, 0.035, 0.035], [0, 1.956, -0.045], TRIM);

  // Two broad feet and four small gussets make the bar feel bolted to the roof.
  for (const s of [-1, 1]) {
    box(`s21MountFoot${s}`, [0.28, 0.025, 0.19], [s * 0.45, 1.928, 0.05], METAL);
    box(`s21MountPost${s}`, [0.045, 0.11, 0.09], [s * 0.45, 1.968, 0.05], DARK_METAL);
    box(`s21MountGussetFront${s}`, [0.11, 0.065, 0.025], [s * 0.45, 1.955, 0.115], METAL);
    box(`s21MountGussetBack${s}`, [0.11, 0.065, 0.025], [s * 0.45, 1.955, -0.015], METAL);

    for (const z of [0.0, 0.1]) {
      cyl(`s21MountBolt${s}${z}`, 0.014, 0.018, [s * 0.45, 1.946, z], WARNING, 6);
    }
  }

  // Six alternating emergency lenses. Each gets a dark gasket and a slightly raised glowing cap.
  const lampXs = [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5];
  lampXs.forEach((x, i) => {
    const color = i % 2 === 0 ? CYAN : MAGENTA;
    box(`s21LampGasket${i}`, [0.155, 0.025, 0.125], [x, 2.022, 0.05], TRIM);
    const lens = box(`s21Lamp${i}`, [0.13, 0.035, 0.095], [x, 2.048, 0.05], color);
    glow(lens, 2.2);

    // A narrow pale highlight makes each coloured block read as glass rather than painted metal.
    const highlight = box(
      `s21LampHighlight${i}`,
      [0.028, 0.008, 0.065],
      [x - 0.035, 2.071, 0.051],
      LAMP_WHITE,
    );
    glow(highlight, 1.4);

    // Small end-to-end dark separators emphasize the six-lamp rhythm.
    if (i < lampXs.length - 1) {
      box(`s21LampDivider${i}`, [0.018, 0.047, 0.13], [x + 0.1, 2.024, 0.05], DARK_METAL);
    }
  });

  // End caps and a central service block give the bar a constructed, field-repairable feel.
  for (const s of [-1, 1]) {
    box(`s21LightBarEnd${s}`, [0.045, 0.11, 0.2], [s * 0.66, 1.99, 0.05], TRIM);
    cyl(`s21EndBeacon${s}`, 0.026, 0.012, [s * 0.66, 2.052, 0.05], WARNING, 8);
  }

  box("s21ServiceBlock", [0.13, 0.07, 0.14], [0, 1.985, -0.08], METAL);
  box("s21ServicePanel", [0.075, 0.045, 0.012], [0, 1.988, -0.153], CYAN);
  const serviceLamp = cyl("s21ServiceLamp", 0.018, 0.012, [0.038, 2.03, -0.081], WARNING, 8);
  glow(serviceLamp, 1.5);

  // Thin graphic cable loops emerge from the service block and disappear into the roof housing.
  b.rod(
    [0, 1.98, -0.155],
    [0.18, 1.94, -0.155],
    0.009,
    CABLE,
    { name: "s21ServiceCableL" },
  );
  b.rod(
    [0, 1.98, -0.155],
    [-0.18, 1.94, -0.155],
    0.009,
    CABLE,
    { name: "s21ServiceCableR" },
  );
}
    return addRoofLightBar;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addAntennaArray(b: Builder) {
  const PANEL = "#102b42";
  const PANEL_DARK = "#081b2b";
  const PANEL_LINE = "#b8c8c6";
  const SIGNAL_ORANGE = "#e37535";
  const SIGNAL_LIGHT = "#f3c85c";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      color,
      rotation,
      name,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, name, caps: "flat" });

  // -----------------------------------------------------------------------------------------------
  // Communications antenna array.
  // The central mast is already present in stage 1; this assembly adds a graphic three-rod receiver
  // cluster above it, with stepped crossbars and a warm signal electronics box.

  const mastTop: [number, number, number] = [0, 2.34, -0.42];

  // Three separated aerial rods, splayed only slightly for a readable silhouette.
  const antennaRoots: [number, number, number][] = [
    [-0.17, 2.30, -0.42],
    [0.0, 2.34, -0.42],
    [0.17, 2.30, -0.42],
  ];
  const antennaTips: [number, number, number][] = [
    [-0.22, 2.78, -0.42],
    [0.0, 2.86, -0.42],
    [0.22, 2.78, -0.42],
  ];

  antennaRoots.forEach((root, i) => {
    rod(`s22AntennaRod${i}`, root, antennaTips[i], i === 1 ? 0.014 : 0.011, DARK_METAL);

    // Tiny ceramic-looking collar at the foot and a warning band near each tip.
    b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.035, 8), METAL, {
      at: [root[0], root[1] + 0.018, root[2]],
      name: `s22AntennaCollar${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.045, 8), WARNING, {
      at: [antennaTips[i][0], antennaTips[i][1] - 0.075, antennaTips[i][2]],
      name: `s22AntennaWarningBand${i}`,
    });
  });

  // Crossbars attach to the side rods and make the array read as communications equipment.
  rod("s22CrossbarLow", [-0.29, 2.48, -0.42], [0.29, 2.48, -0.42], 0.009, METAL);
  rod("s22CrossbarHigh", [-0.23, 2.65, -0.42], [0.23, 2.65, -0.42], 0.007, METAL);
  rod("s22CrossbarCenter", [-0.12, 2.55, -0.42], [0.12, 2.55, -0.42], 0.006, WARNING);

  // Short forward-facing receiver prongs.
  rod("s22ReceiverLeft", [-0.17, 2.57, -0.42], [-0.17, 2.57, -0.28], 0.006, DARK_METAL);
  rod("s22ReceiverRight", [0.17, 2.57, -0.42], [0.17, 2.57, -0.28], 0.006, DARK_METAL);
  b.part(new THREE.SphereGeometry(0.018, 8, 5), SIGNAL_LIGHT, {
    at: [-0.17, 2.57, -0.27],
    name: "s22ReceiverLampL",
  });
  b.part(new THREE.SphereGeometry(0.018, 8, 5), SIGNAL_LIGHT, {
    at: [0.17, 2.57, -0.27],
    name: "s22ReceiverLampR",
  });

  // Orange signal/control box below the aerials.
  box("s22SignalBox", [0.30, 0.20, 0.23], [0, 2.23, -0.42], SIGNAL_ORANGE);
  box("s22SignalBoxFace", [0.19, 0.105, 0.018], [0, 2.23, -0.545], DARK_METAL);
  box("s22SignalScreen", [0.115, 0.045, 0.012], [0, 2.25, -0.558], SIGNAL_LIGHT);
  box("s22SignalButtonL", [0.025, 0.025, 0.014], [-0.068, 2.19, -0.558], RED);
  box("s22SignalButtonR", [0.025, 0.025, 0.014], [0.068, 2.19, -0.558], WARNING);
  rod("s22SignalCable", [0, 2.23, -0.54], [0, 2.34, -0.46], 0.009, CABLE);

  // -----------------------------------------------------------------------------------------------
  // Two tilted rear-roof solar panels.
  // Each panel is a crisp blue-black slab with a pale perimeter and repeated graphic cell dividers.
  // All small pieces share the same local tilt so the construction reads as a single mounted object.

  const tilt = -13;
  const tiltRad = (tilt * Math.PI) / 180;
  const panelQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltRad, 0, 0));

  const panelPoint = (center: THREE.Vector3, localX: number, localY: number, localZ: number) =>
    center.clone().add(new THREE.Vector3(localX, localY, localZ).applyQuaternion(panelQ));

  const panelCenters = [
    new THREE.Vector3(0.31, 1.925, -0.42),
    new THREE.Vector3(0.72, 1.925, -0.42),
  ];

  panelCenters.forEach((center, pi) => {
    const rotation: [number, number, number] = [tilt, 0, 0];

    box(
      `s22SolarPanel${pi}`,
      [0.34, 0.026, 0.57],
      [center.x, center.y, center.z],
      PANEL_DARK,
      rotation,
    );

    // Raised pale frame, with the edge bars slightly above the blue face.
    const frameY = 0.019;
    const frameParts: [string, [number, number, number], [number, number, number]][] = [
      [`s22SolarFrameLeft${pi}`, [0.018, 0.018, 0.60], [-0.171, frameY, 0]],
      [`s22SolarFrameRight${pi}`, [0.018, 0.018, 0.60], [0.171, frameY, 0]],
      [`s22SolarFrameFront${pi}`, [0.36, 0.018, 0.018], [0, frameY, 0.291]],
      [`s22SolarFrameBack${pi}`, [0.36, 0.018, 0.018], [0, frameY, -0.291]],
    ];
    for (const [name, size, local] of frameParts) {
      const p = panelPoint(center, local[0], local[1], local[2]);
      box(name, size, [p.x, p.y, p.z], PANEL_LINE, rotation);
    }

    // Six broad cell columns and four cross-lines create a readable solar-cell rhythm.
    for (let col = 1; col <= 5; col++) {
      const x = -0.142 + col * 0.0473;
      const p = panelPoint(center, x, 0.0205, 0);
      box(`s22SolarColumn${pi}_${col}`, [0.006, 0.009, 0.55], [p.x, p.y, p.z], PANEL_LINE, rotation);
    }
    for (let row = 1; row <= 4; row++) {
      const z = -0.232 + row * 0.093;
      const p = panelPoint(center, 0, 0.021, z);
      box(`s22SolarRow${pi}_${row}`, [0.32, 0.009, 0.006], [p.x, p.y, p.z], PANEL_LINE, rotation);
    }

    // Dark alternating cell blocks add depth without making the panels noisy.
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const x = -0.118 + col * 0.094;
        const z = -0.185 + row * 0.093;
        const p = panelPoint(center, x, 0.023, z);
        box(
          `s22SolarCell${pi}_${row}_${col}`,
          [0.078, 0.004, 0.076],
          [p.x, p.y, p.z],
          row % 2 === col % 2 ? PANEL : "#153952",
          rotation,
        );
      }
    }

    // Four compact angled support feet underneath each panel.
    for (const x of [-0.125, 0.125]) {
      const rear = panelPoint(center, x, -0.045, -0.2);
      const front = panelPoint(center, x, -0.045, 0.2);
      rod(
        `s22SolarSupportRear${pi}_${x}`,
        [rear.x, rear.y - 0.02, rear.z],
        [rear.x, rear.y - 0.13, rear.z + 0.035],
        0.012,
        METAL,
      );
      rod(
        `s22SolarSupportFront${pi}_${x}`,
        [front.x, front.y - 0.02, front.z],
        [front.x, front.y - 0.13, front.z - 0.035],
        0.012,
        METAL,
      );
    }

    // A small amber maintenance diode at the near corner.
    const diode = panelPoint(center, 0.135, 0.03, 0.235);
    b.part(new THREE.SphereGeometry(0.018, 8, 5), WARNING, {
      at: [diode.x, diode.y, diode.z],
      name: `s22SolarDiode${pi}`,
    });
  });
}
    return addAntennaArray;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addFrontSign(b: Builder) {
  const CREAM = "#f4dfad";
  const CYAN = "#43d6d2";
  const RED = "#d8463d";

  const signArt = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 92">
      <rect width="380" height="92" rx="7" fill="#26394a"/>
      <rect x="4" y="4" width="372" height="84" rx="5" fill="none" stroke="#e7b64a" stroke-width="5"/>
      <path d="M18 65 L30 26 L42 65 M23 53 H37" fill="none" stroke="#f4dfad" stroke-width="5" stroke-linecap="square"/>
      <text x="61" y="56" fill="#f4dfad" font-family="sans-serif" font-size=" thirty" font-size="30" font-weight="900" letter-spacing="2">POLAR WATCH</text>
      <g transform="translate(347 46)">
        <circle r="18" fill="#d96b3c" stroke="#f4dfad" stroke-width="3"/>
        <path d="M0 -13 L4 0 L0 13 L-4 0 Z" fill="#f4dfad"/>
        <path d="M-13 0 L0 4 L13 0 L0 -4 Z" fill="#26394a"/>
        <circle r="3" fill="#e7b64a"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const screwGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8);

  // Deep plaque, raised trim, and the actual graphic lettering.
  b.part(new THREE.BoxGeometry(0.94, 0.205, 0.045), TRIM, {
    at: [0, 1.35, 0.727],
    name: "s23FrontSignPlaque",
  });
  b.part(new THREE.BoxGeometry(0.905, 0.17, 0.018), HULL_DARK, {
    at: [0, 1.35, 0.755],
    name: "s23FrontSignInset",
  });
  b.part(new THREE.PlaneGeometry(0.86, 0.164), "#ffffff", {
    at: [0, 1.35, 0.767],
    dir: [0, 0, 1],
    axis: "z",
    texture: signArt,
    name: "s23FrontSignLettering",
  });

  // Four chunky corner rivets make the sign read as mounted hardware.
  for (const x of [-0.425, 0.425]) {
    for (const y of [1.275, 1.425]) {
      b.part(new THREE.SphereGeometry(0.014, 8, 5), WARNING, {
        at: [x, y, 0.779],
        name: "s23SignRivet",
      });
    }
  }

  // Door push bar: dark mounts, golden bar, and bright end caps.
  b.part(new THREE.BoxGeometry(0.31, 0.038, 0.026), WARNING, {
    at: [0.285, 0.72, 0.792],
    name: "s23DoorPushBar",
  });
  for (const x of [0.135, 0.435]) {
    b.part(new THREE.BoxGeometry(0.035, 0.09, 0.035), DARK_METAL, {
      at: [x, 0.72, 0.775],
      name: "s23PushBarMount",
    });
    b.part(new THREE.SphereGeometry(0.024, 8, 5), WARNING, {
      at: [x, 0.72, 0.792],
      name: "s23PushBarEnd",
    });
  }

  // Three exposed hinges down the door's right jamb.
  for (const y of [0.43, 0.72, 1.01]) {
    b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.08, 8), DARK_METAL, {
      at: [0.548, y, 0.79],
      dir: [0, 0, 1],
      name: "s23DoorHinge",
    });
    b.part(new THREE.SphereGeometry(0.025, 8, 5), METAL, {
      at: [0.548, y, 0.833],
      name: "s23HingePin",
    });
  }

  // Cyan access reader with a dark backing and two tiny status lights.
  b.part(new THREE.BoxGeometry(0.105, 0.145, 0.025), DARK_METAL, {
    at: [0.135, 1.01, 0.792],
    name: "s23AccessBacking",
  });
  b.part(new THREE.BoxGeometry(0.075, 0.092, 0.012), CYAN, {
    at: [0.135, 1.0, 0.81],
    name: "s23AccessPanel",
  });
  for (const y of [0.972, 1.038]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), y < 1 ? RED : WARNING, {
      at: [0.135, y, 0.821],
      name: "s23AccessStatus",
    });
  }

  // Red emergency pull tab, mounted below the reader with a small dark bracket.
  b.part(new THREE.BoxGeometry(0.095, 0.13, 0.025), DARK_METAL, {
    at: [0.47, 0.98, 0.79],
    name: "s23EmergencyBracket",
  });
  b.part(new THREE.BoxGeometry(0.065, 0.095, 0.035), RED, {
    at: [0.47, 0.98, 0.817],
    name: "s23EmergencyPull",
  });
  b.part(new THREE.BoxGeometry(0.043, 0.014, 0.042), WARNING, {
    at: [0.47, 1.038, 0.838],
    name: "s23EmergencyLabel",
  });

  // Small threshold plate and four bright fasteners enrich the lower door edge.
  b.part(new THREE.BoxGeometry(0.43, 0.035, 0.035), METAL, {
    at: [0.31, 0.345, 0.795],
    name: "s23DoorThreshold",
  });
  for (const x of [0.13, 0.49]) {
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 6), WARNING, {
      at: [x, 0.36, 0.82],
      dir: [0, 0, 1],
      name: "s23ThresholdBolt",
    });
  }
}
    return addFrontSign;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addWindowFrost(b: Builder) {
  const cx = -0.38;
  const cy = 1.0;
  const z = 0.795;
  const SNOW_FROST = SNOW;
  const BLUE_FROST = ICE;

  let piece = 0;

  const plate = (
    outline: [number, number][],
    color: string,
    name = "frostPlate",
    depth = 0.012,
  ) => {
    b.extrude(outline, {
      at: [cx, cy, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: depth,
      bevel: 0.002,
      smoothing: 0,
      color,
      name: `s24${name}${piece++}`,
    });
  };

  const bar = (
    x: number,
    y: number,
    length: number,
    width: number,
    angle: number,
    color: string,
    name = "frostBranch",
  ) => {
    const r = (angle * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(length, width, 0.014), color, {
      at: [cx + x, cy + y, z + 0.002],
      rotation: [0, 0, angle],
      name: `s24${name}${piece++}`,
    });
  };

  const crystal = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    name = "frostShard",
  ) => {
    plate(
      [
        [x - w * 0.48, y - h * 0.5],
        [x + w * 0.2, y - h * 0.5],
        [x + w * 0.5, y - h * 0.08],
        [x + w * 0.18, y + h * 0.5],
        [x - w * 0.24, y + h * 0.28],
        [x - w * 0.5, y + h * 0.06],
      ],
      color,
      name,
      0.014,
    );
  };

  // Broad, angular frost banks around the glazing. The middle remains open
  // so the amber interior light still reads immediately.
  plate(
    [
      [-0.305, 0.215],
      [0.305, 0.215],
      [0.305, 0.165],
      [0.22, 0.145],
      [0.12, 0.16],
      [0.0, 0.14],
      [-0.12, 0.16],
      [-0.22, 0.145],
      [-0.305, 0.16],
    ],
    SNOW_FROST,
    "frostTopBank",
  );

  plate(
    [
      [-0.305, -0.215],
      [-0.18, -0.215],
      [-0.11, -0.19],
      [-0.02, -0.205],
      [0.08, -0.175],
      [0.18, -0.195],
      [0.305, -0.17],
      [0.305, -0.215],
    ],
    BLUE_FROST,
    "frostBottomBank",
  );

  plate(
    [
      [-0.305, -0.21],
      [-0.255, -0.21],
      [-0.22, -0.12],
      [-0.24, -0.01],
      [-0.21, 0.08],
      [-0.24, 0.16],
      [-0.305, 0.17],
    ],
    SNOW_FROST,
    "frostLeftBank",
  );

  plate(
    [
      [0.305, -0.18],
      [0.255, -0.18],
      [0.22, -0.08],
      [0.24, 0.03],
      [0.205, 0.12],
      [0.24, 0.2],
      [0.305, 0.2],
    ],
    BLUE_FROST,
    "frostRightBank",
  );

  // Left upper branching crystal network.
  bar(-0.27, 0.17, 0.3, 0.035, -18, SNOW_FROST, "upperLeftTrunk");
  bar(-0.19, 0.115, 0.18, 0.026, -58, SNOW_FROST, "upperLeftTwigA");
  bar(-0.11, 0.105, 0.16, 0.025, 34, SNOW_FROST, "upperLeftTwigB");
  bar(-0.22, 0.17, 0.14, 0.022, 48, BLUE_FROST, "upperLeftTwigC");
  bar(-0.305, 0.105, 0.14, 0.025, 72, BLUE_FROST, "upperLeftTwigD");

  // Right upper network, slightly darker to give the frozen edge depth.
  bar(0.27, 0.17, 0.29, 0.035, 20, BLUE_FROST, "upperRightTrunk");
  bar(0.2, 0.12, 0.17, 0.026, 66, BLUE_FROST, "upperRightTwigA");
  bar(0.12, 0.105, 0.16, 0.024, -38, BLUE_FROST, "upperRightTwigB");
  bar(0.235, 0.17, 0.14, 0.022, -52, SNOW_FROST, "upperRightTwigC");
  bar(0.305, 0.08, 0.13, 0.025, -72, SNOW_FROST, "upperRightTwigD");

  // Lower left branching growth.
  bar(-0.25, -0.17, 0.3, 0.034, 17, BLUE_FROST, "lowerLeftTrunk");
  bar(-0.18, -0.115, 0.18, 0.024, 59, BLUE_FROST, "lowerLeftTwigA");
  bar(-0.1, -0.12, 0.15, 0.023, -35, BLUE_FROST, "lowerLeftTwigB");
  bar(-0.27, -0.16, 0.13, 0.022, -48, SNOW_FROST, "lowerLeftTwigC");

  // Lower right branch cluster.
  bar(0.255, -0.15, 0.3, 0.034, -20, SNOW_FROST, "lowerRightTrunk");
  bar(0.19, -0.1, 0.17, 0.025, -62, SNOW_FROST, "lowerRightTwigA");
  bar(0.115, -0.105, 0.16, 0.023, 39, SNOW_FROST, "lowerRightTwigB");
  bar(0.28, -0.16, 0.14, 0.022, 53, BLUE_FROST, "lowerRightTwigC");

  // A few isolated ice needles reach inward, but stop well before the
  // centre glow. Their alternating colours create the Firewatch graphic read.
  bar(-0.255, 0.055, 0.19, 0.021, 28, SNOW_FROST, "leftFingerA");
  bar(-0.235, -0.045, 0.16, 0.019, -32, BLUE_FROST, "leftFingerB");
  bar(0.255, 0.035, 0.18, 0.021, -28, BLUE_FROST, "rightFingerA");
  bar(0.235, -0.045, 0.15, 0.019, 35, SNOW_FROST, "rightFingerB");
  bar(-0.055, 0.185, 0.16, 0.02, 78, BLUE_FROST, "topFingerA");
  bar(0.06, 0.18, 0.13, 0.019, -74, SNOW_FROST, "topFingerB");
  bar(-0.04, -0.18, 0.13, 0.019, -78, SNOW_FROST, "bottomFingerA");
  bar(0.07, -0.17, 0.15, 0.02, 73, BLUE_FROST, "bottomFingerB");

  // Chunky hexagonal ice facets at the four corners make the frost feel
  // grown rather than painted on.
  crystal(-0.265, 0.185, 0.12, 0.12, SNOW_FROST, "cornerIceTL");
  crystal(0.265, 0.18, 0.11, 0.13, BLUE_FROST, "cornerIceTR");
  crystal(-0.265, -0.17, 0.12, 0.12, BLUE_FROST, "cornerIceBL");
  crystal(0.265, -0.16, 0.13, 0.11, SNOW_FROST, "cornerIceBR");

  // Small star-like ice catches at branch junctions.
  crystal(-0.17, 0.14, 0.055, 0.07, BLUE_FROST, "iceKnotLTop");
  crystal(0.17, 0.13, 0.05, 0.065, SNOW_FROST, "iceKnotRTop");
  crystal(-0.16, -0.13, 0.05, 0.06, SNOW_FROST, "iceKnotLBottom");
  crystal(0.17, -0.12, 0.055, 0.065, BLUE_FROST, "iceKnotRBottom");

  // Two tiny vertical icicles hang from the lower edge, kept clear of the
  // mullion and amber centre.
  plate(
    [
      [-0.3, -0.18],
      [-0.255, -0.18],
      [-0.27, -0.255],
      [-0.29, -0.285],
      [-0.31, -0.245],
    ],
    SNOW_FROST,
    "icicleLeft",
  );
  plate(
    [
      [0.22, -0.17],
      [0.27, -0.17],
      [0.26, -0.235],
      [0.24, -0.27],
      [0.22, -0.225],
    ],
    BLUE_FROST,
    "icicleRight",
  );
}
    return addWindowFrost;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addSideGrille(b: Builder) {
  // The annex's +X face is the natural service side. Details project a few
  // millimetres beyond the existing generator shell.
  const grilleX = 1.235;
  const outerX = 1.27;

  // Five deep, slightly separated ventilation blades.
  for (let i = 0; i < 5; i++) {
    b.part(
      new THREE.BoxGeometry(0.035, 0.035, 0.42),
      DARK_METAL,
      {
        at: [grilleX, 0.44 + i * 0.075, -0.08],
        name: `s25GrilleSlat${i}`,
      },
    );
  }

  // A recessed grille surround makes the slats read as a designed panel.
  b.part(
    new THREE.BoxGeometry(0.025, 0.43, 0.49),
    METAL,
    {
      at: [grilleX - 0.012, 0.59, -0.08],
      name: "s25GrilleSurround",
    },
  );

  // Four dark corner bolts on the surround.
  for (const y of [0.385, 0.795]) {
    for (const z of [-0.285, 0.125]) {
      b.part(
        new THREE.CylinderGeometry(0.018, 0.018, 0.025, 8),
        WARNING,
        {
          at: [outerX, y, z],
          dir: [1, 0, 0],
          name: "s25GrilleBolt",
        },
      );
    }
  }

  // Warning triangle, facing outward along +X.
  const warningTriangle = b.extrude(
    [
      [0, 0, "sharp"],
      [0.18, 0, "sharp"],
      [0.09, 0.16, "sharp"],
    ],
    {
      at: [outerX + 0.008, 0.675, 0.145],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: RED,
      name: "s25WarningTriangle",
    },
  );

  // Small yellow warning core, inset visually into the triangle.
  b.part(
    new THREE.BoxGeometry(0.012, 0.075, 0.026),
    WARNING,
    {
      at: [outerX + 0.024, 0.708, 0.235],
      name: "s25WarningMark",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.014, 0.014, 0.014, 8),
    WARNING,
    {
      at: [outerX + 0.025, 0.625, 0.235],
      dir: [1, 0, 0],
      name: "s25WarningDot",
    },
  );

  // Three squat red fuel canisters in the rack, staggered slightly so all
  // silhouettes remain legible from the diorama camera.
  const canZ = [-0.63, -0.42, -0.21];
  canZ.forEach((z, i) => {
    const x = 1.28 + (i === 1 ? 0.015 : 0);
    const y = 0.49;

    b.part(
      new THREE.CylinderGeometry(0.092, 0.105, 0.30, 8),
      RED,
      {
        at: [x, y, z],
        name: `s25FuelCanister${i}`,
        flat: true,
      },
    );

    // Shoulder and cap.
    b.part(
      new THREE.CylinderGeometry(0.072, 0.085, 0.035, 8),
      RED,
      {
        at: [x, y + 0.168, z],
        name: "s25FuelShoulder",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.033, 0.033, 0.045, 8),
      DARK_METAL,
      {
        at: [x, y + 0.204, z],
        name: "s25FuelCap",
      },
    );

    // Pale rectangular identification label on the outward-facing side.
    b.part(
      new THREE.BoxGeometry(0.018, 0.095, 0.105),
      SNOW,
      {
        at: [x + 0.096, y + 0.005, z],
        name: "s25FuelLabel",
      },
    );

    // A narrow dark diagonal-like graphic made from two blocks, suggesting
    // the universal fuel-can hazard mark without adding a texture atlas.
    b.part(
      new THREE.BoxGeometry(0.021, 0.012, 0.065),
      DARK_METAL,
      {
        at: [x + 0.108, y + 0.015, z],
        rotation: [0, 0, -28],
        name: "s25FuelLabelMark",
      },
    );

    // Small lower foot keeps every canister visually seated in the rack.
    b.part(
      new THREE.BoxGeometry(0.19, 0.035, 0.14),
      DARK_METAL,
      {
        at: [x, 0.315, z],
        name: "s25FuelFoot",
      },
    );
  });

  // The rack's upper and lower rails.
  for (const y of [0.30, 0.69]) {
    b.part(
      new THREE.BoxGeometry(0.09, 0.055, 0.66),
      METAL,
      {
        at: [1.19, y, -0.42],
        name: "s25FuelRackRail",
      },
    );
  }

  // Broad retaining strap across all three cans, with two bright fasteners.
  b.part(
    new THREE.BoxGeometry(0.035, 0.045, 0.66),
    DARK_METAL,
    {
      at: [1.385, 0.47, -0.42],
      name: "s25FuelRetainingStrap",
    },
  );

  for (const z of [-0.63, -0.21]) {
    b.part(
      new THREE.CylinderGeometry(0.022, 0.022, 0.026, 8),
      WARNING,
      {
        at: [1.408, 0.47, z],
        dir: [1, 0, 0],
        name: "s25FuelStrapBolt",
      },
    );
  }

  // A tiny drip tray beneath the rack ties it into the generator annex.
  b.part(
    new THREE.BoxGeometry(0.28, 0.025, 0.7),
    METAL,
    {
      at: [1.27, 0.285, -0.42],
      name: "s25FuelDripTray",
    },
  );
}
    return addSideGrille;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCableRun(b: Builder) {
  const CABLE = "#17232d";
  const WARNING = "#e7b64a";
  const ORANGE = "#e36d35";
  const BLACK = "#202b32";
  const REFLECTIVE = "#ffe58a";
  const SNOW = "#dcecf0";
  const ICE = "#8db9c5";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...options,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 8,
    dir?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name,
      ...(dir ? { dir } : {}),
    });

  // ---------------------------------------------------------------------------
  // Cable run: three insulated lines leave the generator, dip once in a tidy
  // service loop, then climb slightly to the cabin's side port.
  // ---------------------------------------------------------------------------

  const cableRoutes: [number, number][][] = [
    [
      [1.25, -0.43],
      [1.18, -0.43],
      [1.08, -0.40],
      [0.98, -0.31],
      [0.88, -0.27],
    ],
    [
      [1.25, -0.30],
      [1.17, -0.30],
      [1.06, -0.28],
      [0.97, -0.18],
      [0.88, -0.14],
    ],
    [
      [1.25, -0.17],
      [1.18, -0.17],
      [1.08, -0.16],
      [0.98, -0.08],
      [0.88, -0.02],
    ],
  ];

  cableRoutes.forEach((route, i) => {
    const path = catmull(
      route.map(([x, z], j) => [x, 0.49 - (j === 2 ? 0.075 : j === 3 ? 0.045 : 0) + i * 0.012, z]),
      { tension: 0.35 },
    );
    b.sweep(path, 0.014, {
      color: CABLE,
      caps: "round",
      sides: 6,
      name: `s26_powerCable${i}`,
    });

    // Bright little strain collars at the generator end.
    cylinder(
      `s26_generatorCableCollar${i}`,
      0.026,
      0.055,
      [1.255, 0.49 + i * 0.012, route[0][1]],
      WARNING,
      8,
      [1, 0, 0],
    );
  });

  // A compact junction block hides the three cable origins and gives the run a
  // deliberately designed industrial silhouette.
  box("s26_cableJunction", [0.16, 0.19, 0.48], [1.285, 0.49, -0.30], DARK_METAL);
  box("s26_cableJunctionFace", [0.018, 0.12, 0.34], [1.375, 0.49, -0.30], WARNING);
  for (let i = 0; i < 3; i++) {
    cylinder(
      `s26_junctionBolt${i}`,
      0.014,
      0.022,
      [1.39, 0.43 + i * 0.06, -0.30],
      REFLECTIVE,
      6,
      [1, 0, 0],
    );
  }

  // Three chunky yellow cable clips are seated directly over the route.
  const clips: [number, number, number][] = [
    [1.11, 0.445, -0.385],
    [0.99, 0.405, -0.20],
    [0.89, 0.452, -0.10],
  ];
  clips.forEach(([x, y, z], i) => {
    box(`s26_cableClip${i}`, [0.045, 0.07, 0.075], [x, y, z], WARNING);
    box(`s26_cableClipShadow${i}`, [0.052, 0.018, 0.082], [x, y - 0.038, z], BLACK);
    cylinder(`s26_cableClipRivet${i}`, 0.009, 0.018, [x, y + 0.042, z], REFLECTIVE, 6);
  });

  // Small square port plate on the cabin wall, where the three lines terminate.
  box("s26_cablePortPlate", [0.025, 0.22, 0.30], [0.849, 0.455, -0.17], DARK_METAL);
  box("s26_cablePortStripe", [0.034, 0.035, 0.24], [0.833, 0.455, -0.17], WARNING);
  for (let i = 0; i < 2; i++) {
    cylinder(
      `s26_portBolt${i}`,
      0.012,
      0.018,
      [0.828, 0.39 + i * 0.13, -0.17],
      METAL,
      6,
      [1, 0, 0],
    );
  }

  // ---------------------------------------------------------------------------
  // Four perimeter snow markers. Each is a low-poly segmented survey stake,
  // with alternating safety paint, a cap, and a reflective pennant.
  // ---------------------------------------------------------------------------

  const markerLocations: [number, number, number][] = [
    [-1.38, 0.22, 1.10],
    [1.40, 0.22, 1.08],
    [-1.30, 0.22, -1.08],
    [1.38, 0.22, -1.12],
  ];

  markerLocations.forEach(([x, y, z], i) => {
    const h = 0.58;
    const bottom = y;
    const segment = 0.105;

    // Slightly buried dark foot and a snow collar make contact unambiguous.
    cylinder(`s26_markerFoot${i}`, 0.065, 0.045, [x, bottom + 0.02, z], BLACK, 8);
    cylinder(`s26_markerSnowCollar${i}`, 0.092, 0.045, [x, bottom + 0.055, z], SNOW, 8);

    for (let s = 0; s < 5; s++) {
      const cy = bottom + 0.10 + s * segment;
      cylinder(
        `s26_marker${i}_segment${s}`,
        0.027,
        segment + 0.008,
        [x, cy, z],
        s % 2 === 0 ? ORANGE : BLACK,
        6,
      );
    }

    cylinder(`s26_markerCap${i}`, 0.038, 0.035, [x, bottom + 0.62, z], METAL, 8);

    // Reflective flag points outward from each marker, keeping the four flags
    // readable from the hero view.
    const outward = x > 0 ? 1 : -1;
    box(
      `s26_markerFlag${i}`,
      [0.16, 0.085, 0.018],
      [x + outward * 0.075, bottom + 0.55, z],
      REFLECTIVE,
    );
    box(
      `s26_markerFlagStripe${i}`,
      [0.035, 0.095, 0.024],
      [x + outward * 0.11, bottom + 0.55, z],
      RED,
    );

    // Tiny metal retaining pin through the flag.
    cylinder(
      `s26_markerPin${i}`,
      0.008,
      0.13,
      [x + outward * 0.035, bottom + 0.55, z],
      METAL,
      6,
      [1, 0, 0],
    );
  });

  // Two low snow wedges around the nearest pair of markers enrich the
  // otherwise open ground without competing with the outpost.
  box("s26_markerSnowWedgeL", [0.28, 0.055, 0.18], [-1.30, 0.235, 1.08], ICE);
  box("s26_markerSnowWedgeR", [0.28, 0.055, 0.18], [1.32, 0.235, 1.06], SNOW);
}
    return addCableRun;
  })(),
);
