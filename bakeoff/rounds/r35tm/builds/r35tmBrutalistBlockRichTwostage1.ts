import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const CONCRETE = "#8b8880";
export const CONCRETE_LIGHT = "#aaa69c";
export const CONCRETE_DARK = "#696761";
export const CONCRETE_SHADOW = "#514f4a";
export const VOID = "#25282a";
export const GLASS = "#34434a";
export const METAL = "#3b3d3b";
export const RUST = "#684f3e";
export const ROOF = "#77756e";

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
  color: string,
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
  color: string,
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
  box(b, "podiumFront", [11.8, 2.7, 6.6], [0, 1.35, 0], CONCRETE);
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
  box(b, "towerFront", [7.45, 10.55, 1.02], [0, 9.52, 2.68], CONCRETE);
  box(b, "towerCore", [7.45, 10.55, 3.9], [0, 9.52, 0.72], CONCRETE);
  box(b, "towerRearMass", [7.45, 10.55, 1.15], [0, 9.52, -1.82], CONCRETE_DARK);
  box(b, "towerRoofCap", [8.05, 0.48, 4.8], [0, 14.92, 0.45], CONCRETE_LIGHT);
  box(b, "towerRoofShadow", [8.35, 0.3, 5.1], [0, 14.52, 0.45], CONCRETE_SHADOW);

  // Tall vertical side walls make the tower read as one cast monolith.
  box(b, "towerLeftEndWall", [0.52, 10.8, 4.8], [3.72, 9.45, 0.45], CONCRETE_DARK);
  box(b, "towerRightEndWall", [0.52, 10.8, 4.8], [-3.72, 9.45, 0.45], CONCRETE_LIGHT);

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
    box(b, `${name}_${i}`, [w, h, 1.45], [x, y, 3.43], i % 3 === 0 ? CONCRETE_LIGHT : CONCRETE, {
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
