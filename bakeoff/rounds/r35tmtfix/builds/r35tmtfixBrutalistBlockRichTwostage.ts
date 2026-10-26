import * as THREE from "three";
import {
  type Builder,
  type ColorInput,
  createBuilder,
  mottle,
  paint,
  noise,
  svg,
} from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const CONCRETE = "#8b8880";
export const CONCRETE_LIGHT = "#aaa69c";
export const CONCRETE_DARK = "#696761";
export const CONCRETE_SHADOW = "#514f4a";
export const VOID = "#25282a";
export const GLASS = "#34434a";
export const METAL = "#3b3d3b";
export const RUST = "#684f3e";
export const ROOF = "#77756e";

const FACADE_SEAMS = paint((p, n) => {
  const broad = noise(p, 0.42, 21);
  const fine = noise(p, 0.075, 27);
  const seamX = Math.abs(((p.x + 0.17) % 0.61 + 0.61) % 0.61 - 0.305);
  const seamY = Math.abs(((p.y + 0.11) % 0.92 + 0.92) % 0.92 - 0.46);
  const runoff =
    Math.sin((p.x + noise(p, 0.55, 31) * 0.16) * 10.5) > 0.82 &&
    p.y < 13.9 &&
    p.y > 3.4 &&
    n.z > 0.35;
  if (runoff && p.y < 8.5) return "#686761";
  if (seamX < 0.007 || seamY < 0.006) return "#7a7871";
  if (broad < 0.24) return "#817f78";
  if (fine > 0.82 && n.y < 0.25) return "#77756f";
  return CONCRETE;
});

const PODIUM_WEATHERING = paint((p, n) => {
  const broad = noise(p, 0.85, 41);
  const stains = noise(new THREE.Vector3(p.x * 1.7, p.y * 0.42, p.z), 0.24, 44);
  const tireGrime = p.y < 0.82 && n.z > 0.2;
  const ghostPaint =
    p.y > 1.0 &&
    p.y < 2.2 &&
    Math.abs(Math.sin(p.x * 1.8 + noise(p, 0.7, 46))) > 0.92;
  if (tireGrime) return "#5b5953";
  if (ghostPaint) return "#77756e";
  if (stains > 0.78 && n.y < 0.35) return "#706e68";
  if (broad < 0.22) return "#77756f";
  if (broad > 0.86 && n.y > -0.2) return "#9a978e";
  return CONCRETE;
});

const SIDE_WALL_PATINA = paint((p, n) => {
  const rain = noise(new THREE.Vector3(p.y * 0.22, p.z * 1.5, p.x), 0.28, 57);
  const mineral = noise(p, 0.52, 61);
  const rustBloom =
    Math.abs(Math.sin(p.y * 4.7 + p.z * 2.1)) > 0.94 &&
    mineral > 0.62 &&
    n.x < -0.35;
  const anchor = Math.abs(Math.sin(p.y * 8.5 + p.z * 3.1)) > 0.985;
  if (rustBloom) return "#745b4a";
  if (anchor) return "#5e5b55";
  if (rain < 0.22 && n.x < -0.35) return "#75736c";
  if (mineral > 0.84) return "#9b988e";
  return CONCRETE_DARK;
});

const BALCONY_CONCRETE = paint((p, n) => {
  const aggregate = noise(p, 0.11, 73);
  const damp = noise(new THREE.Vector3(p.x * 1.8, p.y, p.z * 2.2), 0.19, 79);
  if (n.y < -0.35) return "#66645e";
  if (damp > 0.79 && n.y < 0.25) return "#77756e";
  if (aggregate < 0.2) return "#85827a";
  if (aggregate > 0.86 && n.y > 0.2) return "#a09d92";
  return CONCRETE;
});

export const meta = {
  name: "brutalist housing block",
  description:
    "A broad raw-concrete brutalist housing block with a heavy podium, stepped residential wings, deep balconies, projecting fins, a central tower, roof machinery, and recessed dark window bands.",
};

export const REQUESTS = [
  {
    id: "towerWindowRhythm",
    kind: "add",
    part: "towerFront",
    what:
      "Add repeated deep-set residential window bays across the front facade: dark charcoal recesses, thick raw-concrete reveals, narrow operable panes, and occasional mismatched curtains. Keep the rhythm irregular but aligned to the floors.",
    at: [0, 9.1, 3.18],
    normal: [0, 0, 1],
    bone: null,
    room: [7.2, 7.8, 0.35],
  },
  {
    id: "leftBalconyRailings",
    kind: "add",
    part: "leftBalconyDecks",
    what:
      "Build rugged balcony railings along the left-front stacked balconies: square steel posts, thick horizontal rails, mesh infill, and a few projecting planter boxes. Use nearly black galvanized metal with subtle rust accents.",
    at: [3.05, 7.5, 3.35],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 5.4, 0.55],
  },
  {
    id: "rightBalconyRailings",
    kind: "add",
    part: "rightBalconyDecks",
    what:
      "Build rugged balcony railings on the right-front staggered decks: chunky square steel posts, horizontal rails, dark mesh panels, and two small weathered utility planters. Keep all details blocky and utilitarian.",
    at: [-3.05, 6.1, 3.32],
    normal: [0, 0, 1],
    bone: null,
    room: [1.8, 4.3, 0.55],
  },
  {
    id: "roofWaterTanks",
    kind: "add",
    part: "roofPlant",
    what:
      "Add a brutalist rooftop service cluster: two squat cylindrical water tanks, a rectangular pump housing, thick pipe elbows, and a short warning ladder. Raw concrete, oxidized steel, and one faded safety-yellow marking.",
    at: [1.8, 15.45, -0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [3.8, 2.3, 2.8],
  },
  {
    id: "roofAntennaArray",
    kind: "add",
    part: "roofPlant",
    what:
      "Add a sparse antenna array behind the roof parapet: three thin dark masts of different heights, crossbars, small dish antennas, and taut cable runs. Keep it asymmetrical and visibly functional.",
    at: [-2.0, 15.3, -1.5],
    normal: [0, 1, 0],
    bone: null,
    room: [3.0, 3.0, 2.0],
  },
  {
    id: "entryCanopy",
    kind: "add",
    part: "entryBlock",
    what:
      "Add a monumental entrance assembly under the central overhang: a thick projecting concrete canopy, two brutalist light fixtures, a recessed steel double door, intercom plate, and a small raised building number.",
    at: [0, 2.55, 4.05],
    normal: [0, 0, 1],
    bone: null,
    room: [3.5, 2.8, 0.9],
  },
  {
    id: "parkingVentGrilles",
    kind: "add",
    part: "podiumFront",
    what:
      "Add long horizontal ventilation grilles and parking-service doors across the podium facade. Use deep black slats inside heavy concrete frames, with a few amber work lights and painted clearance stripes.",
    at: [0, 1.45, 3.65],
    normal: [0, 0, 1],
    bone: null,
    room: [9.5, 1.5, 0.4],
  },
  {
    id: "courtyardWalkway",
    kind: "add",
    part: "podiumRoof",
    what:
      "Add a sparse rooftop courtyard layer on the low podium: square concrete benches, two raised planter troughs, a few hardy shrubs, and a narrow metal bridge leading toward the tower.",
    at: [0, 3.15, -0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [10.0, 1.5, 4.2],
  },
  {
    id: "serviceCables",
    kind: "add",
    part: "eastServiceWall",
    what:
      "Add exposed service conduits on the right side wall: three vertical pipes, junction boxes, cable loops, and a small emergency shutoff cabinet. Use dark metal with restrained rust and faded red labels.",
    at: [-4.35, 7.2, 0.15],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.45, 6.5, 2.8],
  },
  {
    id: "facadeSeams",
    kind: "texture",
    part: "towerFront",
    what:
      "Paint fine shutter-board seams and subtle water stains into the raw concrete, with darker vertical runoff beneath ledges. Keep it low contrast, mineral, and irregular rather than cleanly tiled.",
  },
  {
    id: "podiumWeathering",
    kind: "texture",
    part: "podiumFront",
    what:
      "Texture the podium as heavily weathered cast concrete: broad tonal patches, chipped corners, tire-height grime, and faint ghosted layers of old gray paint.",
  },
  {
    id: "sideWallPatina",
    kind: "texture",
    part: "eastServiceWall",
    what:
      "Add vertical rain streaks, old anchor holes, sparse rust blooms around service fixtures, and pale mineral deposits to the side concrete. Preserve the large blank brutalist planes.",
  },
  {
    id: "balconyConcreteTexture",
    kind: "texture",
    part: "leftBalconyDecks",
    what:
      "Paint the balcony slabs with rough aggregate variation, darker undersides, chipped projecting noses, and subtle damp marks near the outer corners.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function box(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: ColorInput,
  extra: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    flat: true,
    ...extra,
  });
}

function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: [number, number, number],
  color: ColorInput,
  radial = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
    at,
    name,
    flat: true,
  });
}

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  // Heavy ground-level podium.
  box(b, "podiumFront", [11.8, 2.7, 6.6], [0, 1.35, 0], PODIUM_WEATHERING);
  box(b, "podiumLowerShadow", [11.95, 0.42, 6.72], [0, 0.24, 0], CONCRETE_DARK);
  box(b, "podiumTopBand", [12.2, 0.32, 6.9], [0, 2.86, 0], CONCRETE_LIGHT);

  // Deeply recessed central entry block and roof overhang.
  box(b, "entryBlock", [3.25, 2.35, 0.75], [0, 1.55, 3.48], CONCRETE_SHADOW);
  box(b, "entryFrameLeft", [0.38, 2.4, 0.9], [-1.55, 1.58, 3.72], CONCRETE_LIGHT);
  box(b, "entryFrameRight", [0.38, 2.4, 0.9], [1.55, 1.58, 3.72], CONCRETE_LIGHT);
  box(b, "entryLintel", [3.45, 0.38, 0.96], [0, 2.72, 3.72], CONCRETE_LIGHT);
  box(b, "entryRecess", [2.55, 1.7, 0.09], [0, 1.48, 3.91], VOID);
  box(b, "entryStep", [3.1, 0.18, 1.05], [0, 0.1, 3.72], CONCRETE_DARK);

  // Podium facade piers and horizontal service openings.
  for (const x of [-5.35, -4.2, -2.55, 2.55, 4.2, 5.35]) {
    box(b, `podiumPier_${x}`, [0.42, 2.35, 0.42], [x, 1.42, 3.38], CONCRETE_LIGHT);
  }
  for (const x of [-4.75, -3.35, 2.0, 3.4, 4.75]) {
    box(b, `podiumVent_${x}`, [0.95, 0.72, 0.10], [x, 1.28, 3.73], VOID);
  }
  box(b, "podiumVentLintel", [10.3, 0.18, 0.16], [0, 1.78, 3.76], CONCRETE_DARK);
  box(b, "podiumBasePlinth", [12.0, 0.3, 6.82], [0, 0.42, 0], CONCRETE_SHADOW);

  // Raised rear/side podium masses form a broken courtyard edge.
  box(b, "westPodiumWing", [2.2, 1.3, 5.7], [-4.75, 3.48, -0.25], CONCRETE);
  box(b, "eastPodiumWing", [2.2, 1.3, 5.7], [4.75, 3.48, -0.25], CONCRETE_DARK);
  box(b, "podiumCourtyardWall", [7.6, 1.45, 0.58], [0, 3.55, -2.55], CONCRETE_LIGHT);
  box(b, "podiumRoof", [11.0, 0.22, 6.2], [0, 4.18, -0.1], CONCRETE_DARK);

  // Central residential tower: a blunt, over-scaled concrete slab.
  box(b, "towerFront", [7.45, 10.55, 1.02], [0, 9.52, 2.68], FACADE_SEAMS);
  box(b, "towerCore", [7.45, 10.55, 3.9], [0, 9.52, 0.72], CONCRETE);
  box(b, "towerRearMass", [7.45, 10.55, 1.15], [0, 9.52, -1.82], CONCRETE_DARK);
  box(b, "towerRoofCap", [8.05, 0.48, 4.8], [0, 14.92, 0.45], CONCRETE_LIGHT);
  box(b, "towerRoofShadow", [8.35, 0.3, 5.1], [0, 14.52, 0.45], CONCRETE_SHADOW);

  // Tall vertical side walls make the tower read as one cast monolith.
  box(b, "towerLeftEndWall", [0.52, 10.8, 4.8], [3.72, 9.45, 0.45], CONCRETE_DARK);
  box(b, "towerRightEndWall", [0.52, 10.8, 4.8], [-3.72, 9.45, 0.45], SIDE_WALL_PATINA, {
    name: "eastServiceWall",
  });

  // Deep projecting floor plates on the front, deliberately uneven.
  const frontDecks: Array<[number, number, number, number]> = [
    [-2.25, 5.05, 2.35, 0.24],
    [0.35, 5.05, 2.05, 0.24],
    [2.25, 6.35, 2.0, 0.24],
    [-2.0, 7.55, 2.55, 0.24],
    [0.75, 8.7, 2.25, 0.24],
    [-2.35, 10.25, 2.2, 0.24],
    [2.15, 11.35, 2.3, 0.24],
    [-0.3, 12.65, 2.8, 0.24],
  ];
  for (let i = 0; i < frontDecks.length; i++) {
    const [x, y, w, h] = frontDecks[i];
    const name = i % 2 === 0 ? "leftBalconyDecks" : "rightBalconyDecks";
    box(b, `${name}_${i}`, [w, h, 1.45], [x, y, 3.43], BALCONY_CONCRETE, {
      name,
    });
    box(b, `balconyShadow_${i}`, [w + 0.12, 0.18, 1.42], [x, y - 0.16, 3.37], CONCRETE_SHADOW);
  }

  // Recessed dark window placeholders between the concrete plates.
  const windowRows = [
    [4.35, 2.15],
    [6.0, 2.0],
    [7.45, 2.2],
    [9.15, 2.15],
    [10.85, 2.0],
    [12.3, 2.15],
    [13.7, 2.0],
  ];
  for (let r = 0; r < windowRows.length; r++) {
    const y = windowRows[r][0];
    const width = windowRows[r][1];
    for (const x of [-2.45, 0, 2.45]) {
      box(b, `windowVoid_${r}_${x}`, [width, 0.82, 0.08], [x, y, 3.225], VOID);
      box(b, `windowRevealTop_${r}_${x}`, [width + 0.12, 0.12, 0.18], [x, y + 0.48, 3.29], CONCRETE_DARK);
    }
  }

  // Side residential wings, stepped downward toward the street.
  box(b, "westHousingWing", [2.9, 7.6, 4.15], [-5.0, 6.9, -0.25], CONCRETE);
  box(b, "eastHousingWing", [2.9, 6.25, 4.15], [5.0, 6.25, -0.25], CONCRETE_DARK);
  box(b, "westWingCrown", [3.2, 0.36, 4.45], [-5.0, 10.78, -0.25], CONCRETE_LIGHT);
  box(b, "eastWingCrown", [3.2, 0.36, 4.45], [5.0, 9.42, -0.25], CONCRETE_LIGHT);

  // Side wings have narrow, stacked slit windows facing front.
  for (let row = 0; row < 5; row++) {
    const yw = 4.65 + row * 1.35;
    box(b, `westSlit_${row}`, [2.0, 0.52, 0.1], [-5.0, yw, 1.87], VOID);
  }
  for (let row = 0; row < 4; row++) {
    const ye = 4.65 + row * 1.25;
    box(b, `eastSlit_${row}`, [2.0, 0.48, 0.1], [5.0, ye, 1.87], VOID);
  }

  // Vertical circulation towers, offset like poured concrete buttresses.
  box(b, "westStairTower", [1.28, 8.9, 1.55], [-3.55, 7.95, -1.88], CONCRETE_LIGHT);
  box(b, "eastStairTower", [1.28, 8.0, 1.55], [3.55, 7.5, -1.88], CONCRETE_DARK);
  for (let row = 0; row < 6; row++) {
    box(b, `westStairSlot_${row}`, [0.55, 0.52, 0.08], [-3.55, 4.75 + row * 1.25, -1.06], VOID);
  }
  for (let row = 0; row < 5; row++) {
    box(b, `eastStairSlot_${row}`, [0.55, 0.5, 0.08], [3.55, 4.7 + row * 1.25, -1.06], VOID);
  }

  // Projecting side fins and buttresses.
  for (let i = 0; i < 4; i++) {
    const y = 5.0 + i * 2.15;
    box(b, `westButtress_${i}`, [0.42, 1.82, 4.85], [-4.05, y, 0.55], CONCRETE_DARK);
    box(b, `eastButtress_${i}`, [0.42, 1.72, 4.85], [4.05, y + 0.4, 0.55], CONCRETE_LIGHT);
  }

  // Rear block visible through the gaps, keeping the silhouette dense.
  box(b, "rearLowBlock", [9.6, 2.25, 2.6], [0, 5.0, -2.35], CONCRETE_SHADOW);
  box(b, "rearParapet", [10.0, 0.7, 2.9], [0, 6.35, -2.35], CONCRETE);
  for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) {
    box(b, `rearOpening_${x}`, [1.0, 0.72, 0.08], [x, 5.0, -1.0], VOID);
  }

  // Roof service plant, kept simple enough for the requested additions.
  box(b, "roofPlant", [3.15, 0.65, 2.4], [0.9, 15.35, -0.25], ROOF);
  box(b, "roofPlantShadow", [3.5, 0.24, 2.65], [0.9, 15.02, -0.25], CONCRETE_SHADOW);
  box(b, "roofPlantScreen", [0.2, 1.3, 2.75], [-0.8, 15.65, -0.25], CONCRETE_LIGHT);
  box(b, "roofPlantScreen2", [0.2, 1.3, 2.75], [2.6, 15.65, -0.25], CONCRETE_LIGHT);

  // Small raw-concrete roof blocks and vents establish a busy skyline.
  box(b, "roofLiftOverrun", [1.5, 1.0, 1.45], [-2.4, 15.45, 0.7], CONCRETE_DARK);
  box(b, "roofLiftCap", [1.7, 0.2, 1.65], [-2.4, 15.98, 0.7], CONCRETE_LIGHT);
  cylinder(b, "roofVentA", 0.34, 0.62, [2.65, 15.42, 1.05], CONCRETE_DARK, 8);
  cylinder(b, "roofVentB", 0.25, 0.48, [3.35, 15.32, 0.65], CONCRETE_LIGHT, 8);
  cylinder(b, "roofVentCapA", 0.42, 0.1, [2.65, 15.76, 1.05], CONCRETE_LIGHT, 8);
  cylinder(b, "roofVentCapB", 0.31, 0.1, [3.35, 15.6, 0.65], CONCRETE_LIGHT, 8);

  // Scattered structural collars and underside shadows make the concrete masses legible.
  box(b, "upperCrownFront", [8.25, 0.36, 1.2], [0, 14.35, 2.62], CONCRETE_LIGHT);
  box(b, "upperCrownShadow", [8.35, 0.25, 1.3], [0, 14.05, 2.58], CONCRETE_SHADOW);
  box(b, "midLevelTieBeam", [8.3, 0.38, 0.72], [0, 8.02, 3.14], CONCRETE_DARK);
  box(b, "lowerLevelTieBeam", [8.25, 0.35, 0.68], [0, 5.02, 3.12], CONCRETE_LIGHT);

  // Chunky ground-side returns anchor the high tower visually.
  box(b, "westGroundReturn", [1.7, 1.8, 4.8], [-5.0, 3.55, 1.35], CONCRETE_DARK);
  box(b, "eastGroundReturn", [1.7, 1.8, 4.8], [5.0, 3.55, 1.35], CONCRETE_LIGHT);
  box(b, "frontGroundBeam", [11.6, 0.42, 0.65], [0, 3.52, 3.25], CONCRETE_SHADOW);

  // Stage 2 can append detailed geometry and paintings to the live builder.
  for (const add of STAGE2) add(b);

  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addTowerWindowRhythm(b: Builder) {
  const FRAME = "#aaa69c";
  const RECESS = "#202426";
  const PANE = "#40545a";
  const CURTAIN_RUST = "#9a6047";
  const CURTAIN_OCHRE = "#b28b55";

  const clearGlass = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 64">
      <rect width="100" height="64" fill="#40545a"/>
      <rect x="3" y="3" width="44" height="58" fill="#536c70" stroke="#1e2526" stroke-width="3"/>
      <rect x="53" y="3" width="44" height="58" fill="#344a50" stroke="#1e2526" stroke-width="3"/>
      <path d="M8 12H92 M8 53H92" stroke="#839295" stroke-width="1.5" opacity=".42"/>
      <path d="M48 4V60 M52 4V60" stroke="#151a1b" stroke-width="2"/>
      <path d="M10 8L42 8 M58 8L90 8" stroke="#b4c1bf" stroke-width="1" opacity=".45"/>
    </svg>`,
    { size: 128 },
  );

  const rustCurtain = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 64">
      <rect width="100" height="64" fill="#40545a"/>
      <rect x="3" y="3" width="44" height="58" fill="#536c70" stroke="#1e2526" stroke-width="3"/>
      <rect x="53" y="3" width="44" height="58" fill="#344a50" stroke="#1e2526" stroke-width="3"/>
      <path d="M9 3 Q18 12 27 3 V61 H9Z" fill="#9a6047"/>
      <path d="M9 3 Q18 13 27 3 M13 6V59 M20 7V59" stroke="#d28a61" stroke-width="1.5" fill="none"/>
      <path d="M48 4V60 M52 4V60" stroke="#151a1b" stroke-width="2"/>
      <path d="M58 12H91 M58 53H91" stroke="#849496" stroke-width="1.3" opacity=".4"/>
    </svg>`,
    { size: 128 },
  );

  const ochreCurtain = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 64">
      <rect width="100" height="64" fill="#40545a"/>
      <rect x="3" y="3" width="44" height="58" fill="#536c70" stroke="#1e2526" stroke-width="3"/>
      <rect x="53" y="3" width="44" height="58" fill="#344a50" stroke="#1e2526" stroke-width="3"/>
      <path d="M53 3 Q64 13 75 3 V61 H53Z" fill="#b28b55"/>
      <path d="M53 3 Q64 13 75 3 M58 7V59 M67 7V59" stroke="#e0c07b" stroke-width="1.5" fill="none"/>
      <path d="M48 4V60 M52 4V60" stroke="#151a1b" stroke-width="2"/>
      <path d="M9 12H42 M9 53H42" stroke="#849496" stroke-width="1.3" opacity=".4"/>
    </svg>`,
    { size: 128 },
  );

  const xs = [-2.7, -0.9, 0.9, 2.7];
  const ys = [5.35, 6.85, 8.35, 10.0, 11.65];

  for (let row = 0; row < ys.length; row++) {
    for (let col = 0; col < xs.length; col++) {
      const x = xs[col];
      const y = ys[row];
      const id = `${row}_${col}`;

      // A single thick concrete reveal creates the deep, monolithic window pocket.
      b.part(new THREE.BoxGeometry(1.48, 1.0, 0.16), FRAME, {
        at: [x, y, 3.255],
        name: `towerWindowFrame_${id}`,
        flat: true,
      });

      // The dark cavity is proud of the facade only by a few millimetres, giving it a
      // heavy shadow line without making the glass float.
      b.part(new THREE.BoxGeometry(1.17, 0.73, 0.035), RECESS, {
        at: [x, y, 3.355],
        name: `towerWindowRecess_${id}`,
        flat: true,
      });

      const texture =
        row === 1 && col === 0
          ? rustCurtain
          : row === 3 && col === 3
            ? ochreCurtain
            : row === 4 && col === 1
              ? rustCurtain
              : clearGlass;

      b.part(new THREE.PlaneGeometry(1.03, 0.62), PANE, {
        at: [x, y, 3.382],
        dir: [0, 0, 1],
        axis: "z",
        texture,
        name: `towerOperablePane_${id}`,
        flat: true,
      });
    }
  }

  // A few projecting sills break the perfect grid and catch rain and light.
  for (const [i, [x, y]] of [
    [-2.7, 5.35],
    [0.9, 8.35],
    [2.7, 10.0],
    [-0.9, 11.65],
  ].entries()) {
    b.part(new THREE.BoxGeometry(1.62, 0.12, 0.34), CONCRETE_LIGHT, {
      at: [x, y - 0.55, 3.39],
      name: `towerWindowSill_${i}`,
      flat: true,
    });
  }

  // Small functional wall units sit beneath selected bays, adding the lived-in,
  // improvised-service character of a real housing block.
  for (const [i, [x, y]] of [
    [2.7, 6.85],
    [-2.7, 10.0],
    [0.9, 11.65],
  ].entries()) {
    b.part(new THREE.BoxGeometry(0.62, 0.28, 0.34), "#4b4d4a", {
      at: [x, y - 0.72, 3.39],
      name: `towerFacadeServiceBox_${i}`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.42, 0.12, 0.025), "#171a1a", {
      at: [x, y - 0.72, 3.575],
      name: `towerFacadeServiceGrille_${i}`,
      flat: true,
    });
  }

  // Four tiny warning placards, deliberately sparse rather than decorative.
  const warning = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 18">
      <rect width="32" height="18" fill="#b28b55"/>
      <path d="M3 15L16 3L29 15Z" fill="#222522"/>
      <path d="M16 7V11M16 13V14" stroke="#d7c28a" stroke-width="2"/>
    </svg>`,
    { size: 64 },
  );
  for (const [i, x] of [-2.7, 2.7].entries()) {
    b.part(new THREE.PlaneGeometry(0.22, 0.13), "#ffffff", {
      at: [x, ys[2] + 0.33, 3.405],
      dir: [0, 0, 1],
      axis: "z",
      texture: warning,
      name: `towerWindowWarning_${i}`,
      flat: true,
    });
  }
}
    return addTowerWindowRhythm;
  })(),
);
// add2
STAGE2.push(
  (() => {
const STEEL = "#292d2c";
const STEEL_HIGHLIGHT = "#484b47";
const MESH = "#171b1b";
const RUST = "#76503d";
const PLANTER = "#4f514b";

function addLeftBalconyRailings(b: Builder) {
  const part = (
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

  const railing = (
    label: string,
    x: number,
    deckY: number,
    width: number,
    options: { planter?: boolean; rustBracket?: boolean } = {},
  ) => {
    const deckTop = deckY + 0.12;
    const z = 4.02;
    const postHeight = 0.72;
    const railY = deckTop + postHeight;
    const inset = Math.min(0.16, width * 0.12);
    const left = x - width / 2 + inset;
    const right = x + width / 2 - inset;
    const middle = (left + right) / 2;

    // Three stout square posts, sunk into the slab.
    for (const [i, px] of [
      [0, left],
      [1, middle],
      [2, right],
    ] as Array<[number, number]>) {
      part(
        `${label}_post_${i}`,
        [0.105, postHeight + 0.08, 0.105],
        [px, deckTop + (postHeight + 0.08) / 2 - 0.04, z],
        STEEL,
      );
      // Small bright cap catches the light on each upright.
      part(
        `${label}_postCap_${i}`,
        [0.125, 0.045, 0.125],
        [px, railY + 0.025, z],
        STEEL_HIGHLIGHT,
      );
    }

    // Thick top and low rails.
    part(
      `${label}_topRail`,
      [width - inset * 1.25, 0.115, 0.12],
      [x, railY, z],
      STEEL_HIGHLIGHT,
    );
    part(
      `${label}_lowRail`,
      [width - inset * 1.25, 0.085, 0.09],
      [x, deckTop + 0.22, z - 0.01],
      STEEL,
    );

    // Coarse vertical mesh: intentionally chunky, like welded galvanized infill.
    const bars = width > 2.25 ? 5 : 4;
    for (let i = 0; i < bars; i++) {
      const t = (i + 1) / (bars + 1);
      const px = left + (right - left) * t;
      part(
        `${label}_mesh_${i}`,
        [0.032, postHeight - 0.12, 0.035],
        [px, deckTop + (postHeight - 0.12) / 2 + 0.04, z - 0.012],
        MESH,
      );
    }

    // Two small welded gussets under each end make the railings feel structural.
    if (options.rustBracket) {
      for (const px of [left + 0.12, right - 0.12]) {
        part(
          `${label}_rustGusset_${px.toFixed(2)}`,
          [0.18, 0.08, 0.16],
          [px, deckTop + 0.08, z + 0.055],
          RUST,
        );
      }
    }

    if (options.planter) {
      const planterY = deckTop + 0.18;
      const planterZ = z + 0.16;
      for (const side of [-1, 1]) {
        const px = x + side * width * 0.27;
        part(
          `${label}_planter_${side < 0 ? "L" : "R"}`,
          [0.42, 0.22, 0.30],
          [px, planterY, planterZ],
          PLANTER,
        );
        part(
          `${label}_planterLip_${side < 0 ? "L" : "R"}`,
          [0.48, 0.045, 0.34],
          [px, planterY + 0.125, planterZ],
          RUST,
        );
        // A pair of low, square-ended stems per planter.
        for (const dx of [-0.07, 0.07]) {
          part(
            `${label}_plant_${side < 0 ? "L" : "R"}_${dx}`,
            [0.035, 0.18, 0.035],
            [px + dx, planterY + 0.20, planterZ],
            STEEL_HIGHLIGHT,
          );
        }
      }
    }
  };

  // Positive-X balconies: the taller, more prominent left-front stack.
  railing("leftBalcony_0", 2.25, 6.35, 2.0, { rustBracket: true });
  railing("leftBalcony_1", 0.75, 8.70, 2.25, { planter: true });
  railing("leftBalcony_2", 2.15, 11.35, 2.30, { rustBracket: true });
  railing("leftBalcony_3", -2.25, 5.05, 2.35, { rustBracket: true });

  // Negative-X balconies: offset against the first stack to avoid a neat facade grid.
  railing("rightBalcony_0", 0.35, 5.05, 2.05, { planter: true });
  railing("rightBalcony_1", -2.0, 7.55, 2.55, { rustBracket: true });
  railing("rightBalcony_2", -0.3, 12.65, 2.80, { rustBracket: true });
  railing("rightBalcony_3", -2.95, 9.15, 2.15, { rustBracket: true });
}
    return addLeftBalconyRailings;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addRoofWaterTanks(b: Builder) {
  const STEEL = metal("iron", { tarnish: 0.55, verdigris: 0.08, size: 0.12 });
  const OXIDIZED = metal("copper", { tarnish: 0.72, verdigris: 0.18, size: 0.09 });
  const WARNING = "#b59a38";
  const PIPE = "#50575a";
  const GRILLE = "#282b2b";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string | ReturnType<typeof metal>,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name: `s23_${name}`,
      flat: true,
      ...options,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string | ReturnType<typeof metal>,
    radial = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name: `s23_${name}`,
      flat: true,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string | ReturnType<typeof metal>,
  ) => b.rod(a, c, radius, { color, name: `s23_${name}` });

  // The cleared roof zone is centred near [1.8, 15.45, -0.2].
  // Keep the plant compact, with its feet visually seated on the existing roof slab.
  const tankA: [number, number, number] = [1.05, 16.18, -0.72];
  const tankB: [number, number, number] = [2.43, 16.18, -0.48];
  const tankRadius = 0.47;
  const tankHeight = 0.92;
  const tankBottom = 15.72;
  const tankTop = tankBottom + tankHeight;

  function tank(
    id: string,
    center: [number, number, number],
    rimColor: string | ReturnType<typeof metal>,
  ) {
    const [x, , z] = center;

    // Four squat concrete/steel feet and a dark shadowed underside.
    box(`${id}_sump`, [0.82, 0.11, 0.82], [x, 15.77, z], CONCRETE_DARK);
    for (const dx of [-0.28, 0.28]) {
      for (const dz of [-0.25, 0.25]) {
        box(`${id}_foot_${dx}_${dz}`, [0.12, 0.24, 0.12], [x + dx, 15.91, z + dz], STEEL);
      }
    }

    // Main faceted tank shell, shoulder, and shallow conical crown.
    cylinder(`${id}_body`, tankRadius, tankHeight, [x, tankBottom + tankHeight / 2, z], CONCRETE_LIGHT, 12);
    cylinder(`${id}_lowerBand`, tankRadius + 0.025, 0.075, [x, tankBottom + 0.12, z], rimColor, 12);
    cylinder(`${id}_upperBand`, tankRadius + 0.028, 0.075, [x, tankTop - 0.12, z], rimColor, 12);
    cylinder(`${id}_neck`, 0.17, 0.18, [x, tankTop + 0.08, z], CONCRETE_DARK, 10);
    b.part(new THREE.ConeGeometry(0.39, 0.28, 12), CONCRETE_LIGHT, {
      at: [x, tankTop + 0.27, z],
      name: `s23_${id}_dome`,
      flat: true,
    });
    cylinder(`${id}_hatch`, 0.115, 0.045, [x, tankTop + 0.43, z], STEEL, 10);

    // Vertical reinforcing straps, intentionally proud of the tank skin.
    for (const angle of [0, 90, 180, 270]) {
      const a = (angle * Math.PI) / 180;
      const sx = x + Math.sin(a) * (tankRadius + 0.035);
      const sz = z + Math.cos(a) * (tankRadius + 0.035);
      box(
        `${id}_strap_${angle}`,
        [0.045, tankHeight + 0.06, 0.08],
        [sx, tankBottom + tankHeight / 2, sz],
        rimColor,
        { rotation: [0, angle, 0] },
      );
    }

    // Small inspection window and stencilled warning plate on the front.
    box(`${id}_inspection`, [0.18, 0.28, 0.025], [x, tankBottom + 0.45, z + tankRadius + 0.035], VOID);
    box(`${id}_warningPlate`, [0.26, 0.17, 0.025], [x, tankBottom + 0.72, z + tankRadius + 0.04], WARNING);
    box(`${id}_warningMark`, [0.16, 0.028, 0.03], [x, tankBottom + 0.72, z + tankRadius + 0.058], GRILLE);
  }

  tank("tankA", tankA, STEEL);
  tank("tankB", tankB, OXIDIZED);

  // Low pump housing behind the tanks, with a heavy cap and a dark service face.
  box("pumpHousing", [0.95, 0.72, 0.72], [1.82, 16.03, -1.18], CONCRETE);
  box("pumpHousingCap", [1.08, 0.12, 0.82], [1.82, 16.45, -1.18], CONCRETE_LIGHT);
  box("pumpServiceFace", [0.56, 0.38, 0.035], [1.82, 16.02, -1.565], VOID);
  for (let i = 0; i < 5; i++) {
    box(
      `pumpVent_${i}`,
      [0.42, 0.025, 0.035],
      [1.82, 15.89 + i * 0.065, -1.59],
      STEEL,
    );
  }
  box("pumpWarningStripe", [0.65, 0.06, 0.045], [1.82, 16.31, -1.59], WARNING);

  // A compact manifold linking both tanks to the pump.
  rod("manifoldA", [1.05, 16.02, -0.72], [1.05, 16.02, -1.18], 0.055, PIPE);
  rod("manifoldB", [2.43, 16.02, -0.48], [2.43, 16.02, -1.18], 0.055, PIPE);
  rod("manifoldCross", [1.05, 16.02, -1.18], [2.43, 16.02, -1.18], 0.065, OXIDIZED);
  rod("manifoldDown", [1.82, 16.02, -1.18], [1.82, 15.72, -1.18], 0.07, PIPE);
  cylinder("manifoldValve", 0.12, 0.075, [1.82, 16.02, -1.18], WARNING, 8);
  box("valveHandle", [0.32, 0.035, 0.035], [1.82, 16.14, -1.18], STEEL);

  // Short pipe elbows rising from the tank crowns.
  rod("tankA_riser", [1.05, 16.47, -0.72], [1.05, 16.72, -0.72], 0.045, PIPE);
  rod("tankA_elbow", [1.05, 16.72, -0.72], [1.25, 16.72, -0.72], 0.045, PIPE);
  rod("tankB_riser", [2.43, 16.47, -0.48], [2.43, 16.70, -0.48], 0.045, PIPE);
  rod("tankB_elbow", [2.43, 16.70, -0.48], [2.63, 16.70, -0.48], 0.045, PIPE);
  cylinder("riserCapA", 0.07, 0.045, [1.25, 16.72, -0.72], STEEL, 8);
  cylinder("riserCapB", 0.07, 0.045, [2.63, 16.70, -0.48], OXIDIZED, 8);

  // A functional access ladder on the front of tank A.
  const ladderX = 0.42;
  const ladderZ = -0.72 + tankRadius + 0.06;
  rod("ladderLeft", [ladderX, 15.82, ladderZ], [ladderX, 16.63, ladderZ], 0.032, STEEL);
  rod("ladderRight", [ladderX + 0.28, 15.82, ladderZ], [ladderX + 0.28, 16.63, ladderZ], 0.032, STEEL);
  for (let i = 0; i < 6; i++) {
    const y = 15.91 + i * 0.135;
    rod(`ladderRung_${i}`, [ladderX, y, ladderZ], [ladderX + 0.28, y, ladderZ], 0.025, STEEL);
  }
  box("ladderTopHook", [0.38, 0.05, 0.08], [ladderX + 0.14, 16.66, ladderZ - 0.01], STEEL);

  // Two chunky cable clips and a small rusted junction box make the pipework feel maintained.
  box("junctionBox", [0.28, 0.32, 0.18], [2.92, 16.05, -1.08], OXIDIZED);
  box("junctionFace", [0.18, 0.18, 0.025], [2.92, 16.05, -1.185], GRILLE);
  rod("cableToPump", [2.92, 15.9, -1.08], [2.55, 15.85, -1.18], 0.018, STEEL);
  rod("cableUp", [2.92, 16.2, -1.08], [2.92, 16.58, -0.92], 0.018, STEEL);

  // A few anchor bolts around the machinery plinth.
  for (const [x, z] of [
    [0.2, -1.45],
    [3.45, -1.45],
    [0.2, 0.95],
    [3.45, 0.95],
  ] as [number, number][]) {
    cylinder("plinthBolt", 0.045, 0.035, [x, 15.83, z], STEEL, 8);
  }
}
    return addRoofWaterTanks;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addRoofAntennaArray(b: Builder) {
  const ANTENNA = "#252827";
  const DOOR = "#171b1b";
  const LIGHT = "#d5b26a";
  const CABLE = "#141817";
  const NUMBER = "#d0c5a4";

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: ColorInput,
  ) => b.rod(a, c, radius, { color, name, caps: "flat" });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // Roof antenna array: three uneven galvanized masts behind the roof screen.
  // The bases remain below the parapet so the hardware feels bolted into the
  // service plant rather than floating above it.
  // ---------------------------------------------------------------------------

  const mastBases: [number, number, number][] = [
    [-2.82, 15.52, -1.72],
    [-2.04, 15.47, -1.48],
    [-1.17, 15.54, -1.72],
  ];
  const mastTops: [number, number, number][] = [
    [-2.82, 16.78, -1.72],
    [-2.04, 16.43, -1.48],
    [-1.17, 16.12, -1.72],
  ];

  mastBases.forEach((p, i) => {
    cylinder(`s24_mastFoot_${i}`, 0.105, 0.14, [p[0], p[1] - 0.05, p[2]], CONCRETE_DARK, 8);
    cylinder(`s24_mastCollar_${i}`, 0.075, 0.12, [p[0], p[1] + 0.05, p[2]], ANTENNA, 8);
    rod(`s24_mast_${i}`, p, mastTops[i], 0.026, ANTENNA);
    cylinder(
      `s24_mastCap_${i}`,
      0.045,
      0.055,
      [mastTops[i][0], mastTops[i][1] + 0.025, mastTops[i][2]],
      ANTENNA,
      8,
    );
  });

  // Crossbars, each deliberately at a different elevation.
  rod("s24_crossbar_low", [-2.37, 15.93, -1.6], [-0.88, 15.93, -1.6], 0.018, ANTENNA);
  rod("s24_crossbar_mid", [-2.48, 16.25, -1.55], [-1.55, 16.25, -1.55], 0.018, ANTENNA);
  rod("s24_crossbar_high", [-2.82, 16.58, -1.72], [-2.22, 16.58, -1.72], 0.015, ANTENNA);

  // Short antenna elements on the crossbars.
  for (const [i, x] of [-2.27, -1.94, -1.61, -1.28].entries()) {
    rod(
      `s24_element_${i}`,
      [x, 15.93, -1.6],
      [x, 16.18 + (i % 2) * 0.1, -1.6],
      0.009,
      ANTENNA,
    );
  }
  for (const [i, x] of [-2.4, -2.16, -1.92, -1.68].entries()) {
    rod(
      `s24_upperElement_${i}`,
      [x, 16.25, -1.55],
      [x, 16.46 - (i % 2) * 0.06, -1.55],
      0.008,
      ANTENNA,
    );
  }

  // Small dish antennas: a low-poly cone facing different directions on
  // short angled stems, with a central receiver pin.
  const dishes: Array<{
    at: [number, number, number];
    dir: [number, number, number];
    stem: [number, number, number];
  }> = [
    {
      at: [-2.8, 16.38, -1.72],
      dir: [0.7, 0.35, 0.65],
      stem: [-2.8, 16.2, -1.72],
    },
    {
      at: [-1.16, 15.93, -1.72],
      dir: [-0.65, 0.42, 0.7],
      stem: [-1.16, 15.78, -1.72],
    },
  ];

  dishes.forEach((d, i) => {
    rod(`s24_dishStem_${i}`, d.stem, d.at, 0.018, ANTENNA);
    b.part(new THREE.ConeGeometry(0.19, 0.085, 10), ANTENNA, {
      at: d.at,
      dir: d.dir,
      name: `s24_dish_${i}`,
      flat: true,
    });
    const receiver = new THREE.Vector3(...d.at).add(
      new THREE.Vector3(...d.dir).normalize().multiplyScalar(0.085),
    );
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 6), LIGHT, {
      at: [receiver.x, receiver.y, receiver.z],
      name: `s24_dishReceiver_${i}`,
      flat: true,
    });
  });

  // Taut diagonal cable runs triangulate the array and make the rooftop
  // equipment read as maintained infrastructure.
  rod("s24_cableA", [-2.82, 16.72, -1.72], [-2.03, 15.6, -1.48], 0.006, CABLE);
  rod("s24_cableB", [-2.03, 16.38, -1.48], [-1.17, 15.63, -1.72], 0.006, CABLE);
  rod("s24_cableC", [-2.82, 16.08, -1.72], [-1.17, 16.08, -1.72], 0.005, CABLE);
  rod("s24_cableD", [-2.82, 15.66, -1.72], [-2.04, 15.6, -1.48], 0.005, CABLE);

  // Small cable anchor blocks and warning tabs.
  for (const [i, p] of [
    [-2.82, 15.62, -1.72],
    [-2.04, 15.59, -1.48],
    [-1.17, 15.64, -1.72],
  ] as [number, number, number][]) {
    box(b, `s24_anchor_${i}`, [0.09, 0.08, 0.09], p, ANTENNA);
  }
  box(b, "s24_warningTab", [0.18, 0.035, 0.035], [-2.05, 16.48, -1.51], LIGHT);

  // ---------------------------------------------------------------------------
  // Monumental entrance assembly. It projects beyond the existing entry lintel,
  // with a dark double door set behind thick concrete reveals.
  // ---------------------------------------------------------------------------

  box(b, "s24_entryCanopy", [3.65, 0.32, 1.18], [0, 2.88, 4.22], CONCRETE_LIGHT);
  box(b, "s24_entryCanopyShadow", [3.45, 0.12, 1.08], [0, 2.69, 4.2], CONCRETE_SHADOW);
  box(b, "s24_entryCanopyNose", [3.8, 0.18, 0.18], [0, 2.77, 4.75], CONCRETE_DARK);

  // Side cheek walls turn the entrance into a carved void.
  box(b, "s24_entryCheekL", [0.34, 2.55, 0.92], [1.62, 1.52, 4.22], CONCRETE_LIGHT);
  box(b, "s24_entryCheekR", [0.34, 2.55, 0.92], [-1.62, 1.52, 4.22], CONCRETE_LIGHT);
  box(b, "s24_entryHeader", [3.48, 0.3, 0.95], [0, 2.67, 4.22], CONCRETE_LIGHT);
  box(b, "s24_entryReveal", [2.92, 2.08, 0.12], [0, 1.52, 4.0], VOID);

  // Recessed split steel door, with a central mullion and lower kick plates.
  box(b, "s24_doorLeft", [1.39, 1.94, 0.075], [-0.715, 1.52, 4.075], DOOR);
  box(b, "s24_doorRight", [1.39, 1.94, 0.075], [0.715, 1.52, 4.075], DOOR);
  box(b, "s24_doorMullion", [0.075, 2.0, 0.13], [0, 1.52, 4.1], METAL);
  box(b, "s24_doorThreshold", [2.9, 0.13, 0.62], [0, 0.43, 4.22], METAL);
  box(b, "s24_doorKickL", [1.16, 0.29, 0.09], [-0.715, 0.73, 4.13], METAL);
  box(b, "s24_doorKickR", [1.16, 0.29, 0.09], [0.715, 0.73, 4.13], METAL);

  // Narrow vertical glazing slots keep the door legible without making it
  // feel residential or decorative.
  box(b, "s24_glassL", [0.34, 1.17, 0.018], [-0.83, 1.72, 4.14], GLASS);
  box(b, "s24_glassR", [0.34, 1.17, 0.018], [0.83, 1.72, 4.14], GLASS);
  box(b, "s24_glassBarL", [0.4, 0.045, 0.03], [-0.83, 1.72, 4.16], METAL);
  box(b, "s24_glassBarR", [0.4, 0.045, 0.03], [0.83, 1.72, 4.16], METAL);

  // Pull handles and a small intercom column.
  rod("s24_handleL", [-0.55, 1.38, 4.18], [-0.55, 1.68, 4.18], 0.022, METAL);
  rod("s24_handleR", [0.55, 1.38, 4.18], [0.55, 1.68, 4.18], 0.022, METAL);
  box(b, "s24_intercomPlate", [0.22, 0.48, 0.045], [-1.28, 1.63, 4.17], METAL);
  box(b, "s24_intercomScreen", [0.13, 0.12, 0.018], [-1.28, 1.78, 4.2], GLASS);
  cylinder(b, "s24_intercomButton", 0.032, 0.025, [-1.28, 1.59, 4.21], LIGHT, 8);

  // Brutalist light fixtures mounted under the canopy: projecting blocks,
  // amber lenses, and small dark mounting plates.
  for (const s of [-1, 1]) {
    box(b, `s24_lightMount_${s}`, [0.42, 0.32, 0.08], [s * 1.23, 2.56, 4.28], METAL);
    box(b, `s24_lightHousing_${s}`, [0.31, 0.25, 0.25], [s * 1.23, 2.42, 4.38], METAL);
    box(b, `s24_lightLens_${s}`, [0.19, 0.1, 0.035], [s * 1.23, 2.39, 4.52], LIGHT);
    cylinder(b, `s24_lightRim_${s}`, 0.12, 0.025, [s * 1.23, 2.34, 4.51], ANTENNA, 8);
  }

  // Raised building number, backed by a thin dark plaque.
  const numberTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
      <rect width="160" height="80" fill="#252827"/>
      <text x="80" y="61" text-anchor="middle"
        font-family="Arial Black,Arial,sans-serif" font-size="59"
        letter-spacing="3" fill="#d0c5a4">24</text>
    </svg>`,
    { size: 192 },
  );
  box(b, "s24_numberBacking", [0.64, 0.34, 0.035], [1.18, 2.31, 4.32], ANTENNA);
  b.part(new THREE.PlaneGeometry(0.54, 0.27), NUMBER, {
    at: [1.18, 2.31, 4.35],
    dir: [0, 0, 1],
    axis: "z",
    texture: numberTexture,
    name: "s24_buildingNumber",
  });

  // Two shallow concrete stair slabs and a pair of battered side bollards.
  box(b, "s24_entryStepUpper", [3.05, 0.16, 0.62], [0, 0.33, 4.24], CONCRETE_LIGHT);
  box(b, "s24_entryStepLower", [3.45, 0.16, 0.82], [0, 0.16, 4.2], CONCRETE_SHADOW);
  cylinder(b, "s24_bollardL", 0.11, 0.52, [-1.75, 0.29, 4.0], METAL, 8);
  cylinder(b, "s24_bollardR", 0.11, 0.52, [1.75, 0.29, 4.0], METAL, 8);
  cylinder(b, "s24_bollardCapL", 0.14, 0.06, [-1.75, 0.57, 4.0], CONCRETE_LIGHT, 8);
  cylinder(b, "s24_bollardCapR", 0.14, 0.06, [1.75, 0.57, 4.0], CONCRETE_LIGHT, 8);
}

function box(
  b: Builder,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    flat: true,
  });
}
    return addRoofAntennaArray;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addParkingVentGrilles(b: Builder) {
  const SLAT = "#171918";
  const AMBER = "#e2a52e";
  const SAFETY = "#c18b25";
  const RUST = "#76513c";

  const part = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      flat: true,
      ...options,
    });

  const bolt = (name: string, x: number, y: number, z: number, color = METAL) =>
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 8), color, {
      name,
      at: [x, y, z],
      dir: [0, 0, 1],
      flat: true,
    });

  const frontZ = 3.78;
  const recessZ = 3.705;
  const frameZ = 3.83;

  // Three long recessed ventilation chambers.
  const vents = [
    { x: -4.0, width: 2.25, y: 1.42 },
    { x: -1.35, width: 2.25, y: 1.42 },
    { x: 1.35, width: 2.25, y: 1.42 },
    { x: 4.0, width: 2.25, y: 1.42 },
  ];

  vents.forEach((v, i) => {
    const half = v.width / 2;

    // Deep black cavity and thick cast-concrete surround.
    part(`parkingVentVoid_${i}`, [v.width, 0.78, 0.10], [v.x, v.y, recessZ], VOID);
    part(`parkingVentTop_${i}`, [v.width + 0.18, 0.16, 0.24], [v.x, v.y + 0.47, frameZ], CONCRETE_LIGHT);
    part(`parkingVentBottom_${i}`, [v.width + 0.18, 0.16, 0.24], [v.x, v.y - 0.47, frameZ], CONCRETE_DARK);
    part(`parkingVentLeft_${i}`, [0.16, 1.06, 0.24], [v.x - half - 0.08, v.y, frameZ], CONCRETE_LIGHT);
    part(`parkingVentRight_${i}`, [0.16, 1.06, 0.24], [v.x + half + 0.08, v.y, frameZ], CONCRETE_DARK);

    // Horizontal galvanized slats, recessed just inside the heavy frame.
    for (let row = 0; row < 6; row++) {
      const y = v.y - 0.31 + row * 0.124;
      part(`parkingSlat_${i}_${row}`, [v.width - 0.16, 0.045, 0.07], [v.x, y, frontZ], SLAT);
    }

    // Four chunky fasteners per grille.
    bolt(`parkingBolt_${i}_a`, v.x - half - 0.025, v.y - 0.39, 3.96);
    bolt(`parkingBolt_${i}_b`, v.x + half + 0.025, v.y - 0.39, 3.96);
    bolt(`parkingBolt_${i}_c`, v.x - half - 0.025, v.y + 0.39, 3.96);
    bolt(`parkingBolt_${i}_d`, v.x + half + 0.025, v.y + 0.39, 3.96);

    // Amber maintenance lamps tucked beneath alternating lintels.
    if (i === 0 || i === 2) {
      const lamp = part(
        `parkingAmberLamp_${i}`,
        [0.18, 0.09, 0.055],
        [v.x + half - 0.23, v.y + 0.36, 3.975],
        AMBER,
      );
      glow(lamp, 1.6);
      part(`parkingLampGuard_${i}`, [0.27, 0.035, 0.08], [v.x + half - 0.23, v.y + 0.43, 3.95], METAL);
    }
  });

  // Two service doors occupy the spaces between the grille modules.
  const doors = [
    { x: -2.68, width: 1.05, y: 1.18, h: 1.32 },
    { x: 2.68, width: 1.05, y: 1.18, h: 1.32 },
  ];

  doors.forEach((d, i) => {
    const left = d.x - d.width / 2;
    const right = d.x + d.width / 2;
    const top = d.y + d.h / 2;
    const bottom = d.y - d.h / 2;

    part(`serviceDoor_${i}`, [d.width, d.h, 0.10], [d.x, d.y, recessZ], CONCRETE_SHADOW);
    part(`serviceDoorFrameTop_${i}`, [d.width + 0.18, 0.15, 0.25], [d.x, top + 0.075, frameZ], CONCRETE_LIGHT);
    part(`serviceDoorFrameLeft_${i}`, [0.14, d.h + 0.18, 0.25], [left - 0.07, d.y, frameZ], CONCRETE_LIGHT);
    part(`serviceDoorFrameRight_${i}`, [0.14, d.h + 0.18, 0.25], [right + 0.07, d.y, frameZ], CONCRETE_DARK);

    // Door leaf made from broad, uneven horizontal steel panels.
    for (let p = 0; p < 5; p++) {
      const py = bottom + 0.16 + p * 0.25;
      part(`serviceDoorPanel_${i}_${p}`, [d.width - 0.18, 0.19, 0.045], [d.x, py, 3.79], METAL);
      part(`serviceDoorSeam_${i}_${p}`, [d.width - 0.22, 0.018, 0.055], [d.x, py + 0.105, 3.825], CONCRETE_DARK);
    }

    // Recessed handle and warning plate.
    part(`serviceDoorHandle_${i}`, [0.12, 0.045, 0.05], [d.x + 0.25, d.y, 3.86], SLAT);
    part(`serviceDoorLabel_${i}`, [0.25, 0.17, 0.035], [d.x - 0.27, d.y + 0.34, 3.865], SAFETY);
    bolt(`serviceDoorBoltTop_${i}`, d.x - 0.38, top - 0.16, 3.9);
    bolt(`serviceDoorBoltBottom_${i}`, d.x - 0.38, bottom + 0.16, 3.9);
  });

  // Continuous lintel and sill visually tie the separate openings into one parking level.
  part("parkingContinuousLintel", [10.65, 0.14, 0.28], [0, 2.08, 3.84], CONCRETE_LIGHT);
  part("parkingContinuousSill", [10.65, 0.18, 0.28], [0, 0.72, 3.84], CONCRETE_DARK);

  // Short concrete divider piers make the service elevation feel monolithic.
  for (const [i, x] of [-5.2, -3.52, -1.93, -0.77, 0.77, 1.93, 3.52, 5.2].entries()) {
    part(`parkingDividerPier_${i}`, [0.18, 1.52, 0.27], [x, 1.4, 3.84], CONCRETE);
  }

  // Faded clearance markings across the lower edge: broken, deliberately imperfect bars.
  const stripeXs = [-4.95, -4.45, -3.95, 3.95, 4.45, 4.95];
  stripeXs.forEach((x, i) => {
    part(
      `clearanceStripe_${i}`,
      [0.20, 0.62, 0.035],
      [x, 0.86, 3.985],
      SAFETY,
      { rotation: [0, 0, i % 2 === 0 ? -24 : 24] },
    );
  });

  // A few rust blooms and drain marks break the clean stage-one flatness without adding clutter.
  part("rustBloomLeft", [0.18, 0.32, 0.025], [-3.49, 0.92, 3.96], RUST);
  part("rustBloomRight", [0.14, 0.24, 0.025], [3.56, 1.86, 3.96], RUST);
  part("parkingDrainSlot", [0.52, 0.055, 0.04], [0, 0.66, 3.96], SLAT);
  part("parkingDrainSlotLeft", [0.24, 0.055, 0.04], [-5.0, 0.66, 3.96], SLAT);
  part("parkingDrainSlotRight", [0.24, 0.055, 0.04], [5.0, 0.66, 3.96], SLAT);
}
    return addParkingVentGrilles;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addCourtyardWalkway(b: Builder) {
  const PLANT = "#465b38";
  const PLANT_LIGHT = "#71824d";
  const SOIL = "#44372a";
  const STEEL = "#303332";
  const RUST = "#80513b";
  const SAFETY = "#b28a36";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
  ) =>
    b.part(geometry, color, {
      at,
      name,
      flat: true,
    });

  const block = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => part(new THREE.BoxGeometry(...size), color, at, name);

  const pipe = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, 8, 1, false),
      color,
      at,
      name,
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name });

  // ---------------------------------------------------------------------------
  // Courtyard roof garden / walkway.
  // The podium roof is around y=4.18. Everything is kept low and architectural,
  // leaving the central tower's concrete mass dominant.
  // ---------------------------------------------------------------------------

  // Two long raised planters, made from thick cast-concrete troughs.
  const planter = (
    x: number,
    z: number,
    width: number,
    depth: number,
    name: string,
  ) => {
    block(
      [width, 0.48, depth],
      [x, 4.48, z],
      CONCRETE_LIGHT,
      `${name}_body`,
    );
    block(
      [width - 0.16, 0.12, depth - 0.16],
      [x, 4.76, z],
      SOIL,
      `${name}_soil`,
    );
    block(
      [width + 0.06, 0.08, depth + 0.06],
      [x, 4.78, z],
      CONCRETE_DARK,
      `${name}_rim`,
    );
  };

  planter(-3.35, -0.72, 2.45, 0.72, "courtyardPlanterA");
  planter(3.15, -0.72, 2.25, 0.72, "courtyardPlanterB");

  // Low-poly shrubs: clustered cones and small square stems make the planting
  // read at the same blocky scale as the building.
  const shrub = (
    x: number,
    z: number,
    scale: number,
    name: string,
  ) => {
    pipe(0.035 * scale, 0.28 * scale, [x, 4.98, z], RUST, `${name}_stem`);
    part(
      new THREE.ConeGeometry(0.22 * scale, 0.48 * scale, 6),
      PLANT,
      [x, 5.25, z],
      `${name}_low`,
    );
    part(
      new THREE.ConeGeometry(0.16 * scale, 0.38 * scale, 6),
      PLANT_LIGHT,
      [x + 0.08 * scale, 5.53, z - 0.03 * scale],
      `${name}_high`,
    );
  };

  shrub(-3.92, -0.84, 1.0, "shrubA");
  shrub(-3.2, -0.56, 0.78, "shrubB");
  shrub(-2.78, -0.83, 0.62, "shrubC");
  shrub(2.72, -0.83, 0.95, "shrubD");
  shrub(3.4, -0.57, 0.72, "shrubE");
  shrub(3.78, -0.85, 0.58, "shrubF");

  // Two severe square benches, aligned to the courtyard wall.
  const bench = (
    x: number,
    z: number,
    length: number,
    name: string,
  ) => {
    block(
      [length, 0.18, 0.48],
      [x, 4.62, z],
      CONCRETE_LIGHT,
      `${name}_seat`,
    );
    block(
      [0.28, 0.42, 0.48],
      [x - length * 0.34, 4.35, z],
      CONCRETE_DARK,
      `${name}_legL`,
    );
    block(
      [0.28, 0.42, 0.48],
      [x + length * 0.34, 4.35, z],
      CONCRETE_DARK,
      `${name}_legR`,
    );
    block(
      [length + 0.08, 0.06, 0.56],
      [x, 4.73, z],
      CONCRETE_SHADOW,
      `${name}_shadow`,
    );
  };

  bench(-0.95, -1.55, 2.25, "courtyardBenchA");
  bench(1.1, 0.36, 1.8, "courtyardBenchB");

  // Narrow bridge toward the central tower. The deck is slightly raised above
  // the podium roof and terminates against the tower's lower concrete return.
  block(
    [1.0, 0.16, 3.25],
    [0, 4.38, 1.52],
    STEEL,
    "courtyardBridgeDeck",
  );
  block(
    [0.78, 0.05, 3.05],
    [0, 4.49, 1.52],
    SAFETY,
    "courtyardBridgeStripe",
  );

  for (const z of [0.05, 1.1, 2.15, 2.92]) {
    pipe(0.035, 0.78, [-0.48, 4.78, z], STEEL, `bridgeRailLeft_${z}`);
    pipe(0.035, 0.78, [0.48, 4.78, z], STEEL, `bridgeRailRight_${z}`);
  }
  rod(
    [-0.48, 5.14, 0.05],
    [-0.48, 5.14, 2.92],
    0.035,
    STEEL,
    "bridgeHandrailLeft",
  );
  rod(
    [0.48, 5.14, 0.05],
    [0.48, 5.14, 2.92],
    0.035,
    STEEL,
    "bridgeHandrailRight",
  );

  // Small square service lights at the bridge entrance.
  for (const x of [-0.43, 0.43]) {
    block(
      [0.12, 0.16, 0.12],
      [x, 4.61, 0.08],
      SAFETY,
      `bridgeMarker_${x}`,
    );
  }

  // Courtyard drainage grates and expansion joints add scale without clutter.
  for (const z of [-2.12, -1.28, -0.42, 0.42, 1.25]) {
    block(
      [0.12, 0.025, 0.46],
      [-4.35, 4.3, z],
      STEEL,
      `courtyardDrain_${z}`,
    );
  }
  for (const x of [-2.0, 0, 2.0]) {
    block(
      [0.025, 0.03, 4.2],
      [x, 4.305, -0.1],
      CONCRETE_SHADOW,
      `courtyardJoint_${x}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Exposed service conduits on the model's negative-X side wall.
  // The requested attachment room is narrow in X, so the assembly hugs the
  // wall plane and grows vertically through the otherwise blank side facade.
  // ---------------------------------------------------------------------------

  const wallX = -4.39;

  // Three unequal vertical conduits, each with a chunky collar at floor and roof.
  const conduits = [
    { z: -0.68, y: 7.25, h: 5.0, r: 0.052 },
    { z: 0.05, y: 7.45, h: 5.7, r: 0.045 },
    { z: 0.78, y: 7.05, h: 4.55, r: 0.06 },
  ];

  conduits.forEach((c, i) => {
    pipe(
      c.r,
      c.h,
      [wallX - 0.075, c.y, c.z],
      STEEL,
      `serviceConduit_${i}`,
    );
    block(
      [0.2, 0.12, 0.18],
      [wallX - 0.075, c.y - c.h / 2 + 0.08, c.z],
      RUST,
      `serviceFoot_${i}`,
    );
    block(
      [0.2, 0.12, 0.18],
      [wallX - 0.075, c.y + c.h / 2 - 0.08, c.z],
      STEEL,
      `serviceCap_${i}`,
    );
    // Narrow red identification bands.
    block(
      [0.018, 0.22, c.r * 3.2],
      [wallX - 0.14, c.y + 0.72, c.z],
      RUST,
      `serviceLabel_${i}`,
    );
  });

  // Horizontal collector manifold joins the pipes at two different heights.
  rod(
    [wallX - 0.08, 6.2, -0.76],
    [wallX - 0.08, 6.2, 0.86],
    0.055,
    STEEL,
    "serviceLowerManifold",
  );
  rod(
    [wallX - 0.08, 8.82, -0.7],
    [wallX - 0.08, 8.82, 0.7],
    0.045,
    STEEL,
    "serviceUpperManifold",
  );

  // Blocky junction boxes, with smaller raised lids and diagonal warning marks.
  const junction = (
    y: number,
    z: number,
    w: number,
    h: number,
    name: string,
  ) => {
    block(
      [0.22, h, w],
      [wallX - 0.13, y, z],
      STEEL,
      `${name}_box`,
    );
    block(
      [0.045, h * 0.72, w * 0.72],
      [wallX - 0.265, y, z],
      RUST,
      `${name}_face`,
    );
    block(
      [0.018, 0.035, w * 0.55],
      [wallX - 0.29, y + h * 0.18, z],
      SAFETY,
      `${name}_label`,
    );
  };

  junction(5.65, -0.66, 0.42, 0.62, "junctionLower");
  junction(8.05, 0.76, 0.52, 0.74, "junctionUpper");
  junction(10.1, -0.05, 0.46, 0.68, "junctionTop");

  // Emergency shutoff cabinet, projecting more heavily than the pipe boxes.
  block(
    [0.3, 1.05, 0.9],
    [wallX - 0.18, 7.0, 1.02],
    CONCRETE_DARK,
    "emergencyCabinet",
  );
  block(
    [0.05, 0.76, 0.67],
    [wallX - 0.37, 7.0, 1.02],
    RUST,
    "emergencyCabinetDoor",
  );
  block(
    [0.065, 0.18, 0.42],
    [wallX - 0.41, 7.26, 1.02],
    SAFETY,
    "emergencyCabinetSign",
  );
  block(
    [0.055, 0.12, 0.12],
    [wallX - 0.42, 6.78, 0.78],
    STEEL,
    "emergencyHandle",
  );

  // Small cable loops droop between the collector and the cabinet.
  rod(
    [wallX - 0.28, 8.42, 0.74],
    [wallX - 0.34, 7.92, 0.92],
    0.018,
    RUST,
    "cableLoopA",
  );
  rod(
    [wallX - 0.34, 7.92, 0.92],
    [wallX - 0.34, 7.38, 0.92],
    0.018,
    RUST,
    "cableLoopB",
  );
  rod(
    [wallX - 0.34, 7.38, 0.92],
    [wallX - 0.3, 7.18, 1.02],
    0.018,
    RUST,
    "cableLoopC",
  );

  // A pair of tiny anchor plates and bolts make the installation visibly
  // fixed to the cast wall rather than floating beside it.
  for (const z of [-0.92, 0.94]) {
    block(
      [0.06, 0.28, 0.36],
      [wallX - 0.02, 6.1, z],
      CONCRETE_LIGHT,
      `serviceAnchor_${z}`,
    );
    pipe(
      0.035,
      0.06,
      [wallX - 0.3, 6.1, z],
      STEEL,
      `serviceBolt_${z}`,
    );
  }
}
    return addCourtyardWalkway;
  })(),
);
