```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "arctic-research-outpost",
  description: "A stylized Firewatch-inspired arctic research outpost diorama with a snow-buried cabin, radio tower, solar panels, fuel drums, tracks, antenna, and warm glowing windows.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const rand = rng(17);

  const SNOW = "#edf4f4";
  const SNOW_BLUE = "#c9dce3";
  const SHADOW_SNOW = "#a8c4cf";
  const ICE = "#8db7c8";
  const ICE_DARK = "#5f91a8";
  const ROCK = "#465866";
  const ROCK_LIGHT = "#718593";
  const WOOD = "#704c3c";
  const WOOD_DARK = "#422f31";
  const WOOD_LIGHT = "#a57959";
  const ROOF = "#334552";
  const ROOF_LIGHT = "#536a73";
  const METAL = "#5d6d71";
  const METAL_DARK = "#293b43";
  const ORANGE = "#d36d3e";
  const ORANGE_LIGHT = "#ef9b58";
  const YELLOW = "#ffd56c";
  const GLOW = "#ffb94f";
  const RED = "#b8413b";
  const BLACK = "#18262d";
  const GLASS = "#9ed7e3";
  const SOLAR = "#203b5b";
  const SOLAR_HI = "#6b9eb8";
  const CABLE = "#1d2529";
  const SIGN = "#e7d3a1";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
    });

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 8,
    name?: string,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      name,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      name,
    });

  const beam = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, caps: "flat" });

  const panel = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation: [number, number, number],
    name?: string,
  ) => box(size, color, at, rotation, name);

  // ---------------------------------------------------------------------------
  // Snow island and layered ice shelf
  // ---------------------------------------------------------------------------

  box([4.9, 0.22, 3.9], SNOW_BLUE, [0, 0.11, 0], undefined, "snowIsland");
  box([4.35, 0.16, 3.25], SNOW, [0, 0.29, 0.03], undefined, "snowCap");

  // Angular drifts around the perimeter.
  const drifts: Array<[number, number, number, number, number, number]> = [
    [-2.02, 0.48, -1.34, 0.75, 0.42, 0.38],
    [2.03, 0.42, -1.06, 0.72, 0.34, 0.5],
    [-1.86, 0.39, 1.26, 0.9, 0.28, 0.38],
    [1.83, 0.46, 1.34, 0.62, 0.38, 0.5],
    [-0.7, 0.42, -1.67, 0.9, 0.3, 0.32],
    [0.78, 0.39, -1.62, 0.8, 0.25, 0.4],
  ];
  for (let i = 0; i < drifts.length; i++) {
    const [x, y, z, sx, sy, sz] = drifts[i];
    box([sx, sy, sz], i % 2 ? SNOW : SNOW_BLUE, [x, y, z], [0, (i % 3) * 7, 0], `drift${i}`);
  }

  // Ice chunks and dark exposed rocks.
  const rocks: Array<[number, number, number, number, number, number]> = [
    [-2.05, 0.43, 0.45, 0.25, 0.28, 0.32],
    [-1.69, 0.42, 1.02, 0.28, 0.2, 0.22],
    [2.04, 0.4, 0.55, 0.3, 0.23, 0.22],
    [1.55, 0.42, 1.44, 0.23, 0.3, 0.28],
    [-0.83, 0.39, 1.54, 0.2, 0.18, 0.34],
    [2.12, 0.4, -1.48, 0.22, 0.25, 0.3],
  ];
  for (let i = 0; i < rocks.length; i++) {
    const [x, y, z, sx, sy, sz] = rocks[i];
    box([sx, sy, sz], i % 2 ? ROCK_LIGHT : ROCK, [x, y, z], [0, rand() * 35, rand() * 10], `rock${i}`);
    box([sx * 0.62, sy * 0.18, sz * 0.56], SNOW, [x - 0.02, y + sy * 0.46, z], [0, rand() * 35, 0], `rockSnow${i}`);
  }

  // ---------------------------------------------------------------------------
  // Main research cabin
  // ---------------------------------------------------------------------------

  // Raised foundation and shadow gap.
  box([1.9, 0.14, 1.42], WOOD_DARK, [-0.46, 0.48, 0.05], undefined, "cabinFoundation");
  box([1.78, 0.1, 1.3], SNOW_BLUE, [-0.46, 0.56, 0.05], undefined, "foundationSnow");

  // Cabin body, warm timber lower half and pale upper insulation.
  box([1.66, 0.84, 1.22], WOOD, [-0.46, 0.99, 0.05], undefined, "cabinBody");
  box([1.68, 0.5, 1.24], WOOD_LIGHT, [-0.46, 1.18, 0.05], undefined, "cabinSiding");
  box([1.7, 0.1, 1.26], WOOD_DARK, [-0.46, 0.75, 0.05], undefined, "cabinBelt");

  // Vertical corner posts.
  for (const x of [-1.27, 0.35]) {
    beam([x, 0.61, -0.57], [x, 1.5, -0.57], 0.065, WOOD_DARK, "cabinCorner");
    beam([x, 0.61, 0.67], [x, 1.5, 0.67], 0.065, WOOD_DARK, "cabinCorner");
  }

  // Horizontal log courses on the visible front face.
  for (let i = 0; i < 5; i++) {
    box([1.58, 0.035, 0.045], WOOD_DARK, [-0.46, 0.8 + i * 0.16, -0.62], undefined, "frontLogSeam");
  }

  // Snow-loaded pitched roof: two overlapping sloped slabs.
  box([1.12, 0.12, 1.46], ROOF, [-1.02, 1.58, 0.05], [0, 0, -28], "roofLeft");
  box([1.12, 0.12, 1.46], ROOF, [0.1, 1.58, 0.05], [0, 0, 28], "roofRight");
  box([1.18, 0.1, 1.5], SNOW, [-1.04, 1.68, 0.05], [0, 0, -28], "roofSnowLeft");
  box([1.18, 0.1, 1.5], SNOW, [0.1, 1.68, 0.05], [0, 0, 28], "roofSnowRight");
  box([0.08, 0.22, 1.5], SNOW_BLUE, [-0.46, 1.73, 0.05], undefined, "roofRidge");

  // Front door with inset frame, window, knob, and warning stripe.
  box([0.42, 0.74, 0.055], WOOD_DARK, [-0.86, 1.02, -0.655], undefined, "frontDoor");
  box([0.31, 0.28, 0.018], GLASS, [-0.86, 1.28, -0.688], undefined, "doorWindow");
  box([0.34, 0.04, 0.02], ORANGE, [-0.86, 0.91, -0.691], [0, 0, 0], "doorStripe");
  cyl(0.035, 0.026, YELLOW, [-0.68, 1.03, -0.695], 8, [90, 0, 0], "doorKnob");

  // Large glowing front window.
  const frontWindow = box([0.68, 0.43, 0.035], GLASS, [0.02, 1.17, -0.665], undefined, "frontWindow");
  glow(frontWindow, 1.7);
  box([0.035, 0.47, 0.045], WOOD_DARK, [0.02, 1.17, -0.697], undefined, "windowMullion");
  box([0.7, 0.035, 0.045], WOOD_DARK, [0.02, 1.17, -0.697], undefined, "windowMullion");

  // Side window on the left-facing side.
  const sideWindow = box([0.045, 0.38, 0.6], GLASS, [-1.31, 1.16, 0.2], undefined, "sideWindow");
  glow(sideWindow, 1.4);
  box([0.055, 0.035, 0.62], WOOD_DARK, [-1.34, 1.16, 0.2], undefined, "sideWindowBar");
  box([0.055, 0.4, 0.035], WOOD_DARK, [-1.34, 1.16, 0.2], undefined, "sideWindowBar");

  // Chimney and little cap.
  box([0.18, 0.52, 0.18], METAL_DARK, [-0.03, 1.91, 0.28], undefined, "chimney");
  box([0.27, 0.08, 0.24], METAL, [-0.03, 2.18, 0.28], undefined, "chimneyCap");
  box([0.33, 0.09, 0.28], SNOW, [-0.03, 2.23, 0.28], undefined, "chimneySnow");

  // Porch and steps.
  box([0.78, 0.1, 0.32], WOOD_DARK, [-0.86, 0.53, -0.84], undefined, "porch");
  box([0.62, 0.1, 0.23], WOOD_LIGHT, [-0.86, 0.44, -0.99], undefined, "porchStep");
  for (const x of [-1.18, -0.54]) beam([x, 0.55, -0.98], [x, 0.9, -0.98], 0.035, WOOD_DARK, "porchRail");
  beam([-1.18, 0.9, -0.98], [-0.54, 0.9, -0.98], 0.035, WOOD_DARK, "porchRail");

  // Small orange emergency placard.
  box([0.28, 0.16, 0.018], ORANGE, [-1.05, 1.44, -0.7], undefined, "emergencyPlaque");
  box([0.13, 0.035, 0.02], SIGN, [-1.05, 1.44, -0.715], undefined, "plaqueMark");

  // ---------------------------------------------------------------------------
  // Instrument annex / generator shed
  // ---------------------------------------------------------------------------

  box([0.82, 0.48, 0.75], METAL_DARK, [0.82, 0.77, 0.18], undefined, "annexBody");
  box([0.87, 0.1, 0.8], ROOF, [0.82, 1.07, 0.18], [0, 0, 4], "annexRoof");
  box([0.66, 0.3, 0.04], ORANGE, [0.82, 0.83, -0.215], undefined, "annexDoor");
  box([0.22, 0.15, 0.025], GLASS, [1.04, 0.88, -0.24], undefined, "annexWindow");
  cyl(0.04, 0.1, METAL, [0.48, 0.67, 0.18], 8, [0, 0, 90], "generatorPipe");
  box([0.34, 0.16, 0.32], ORANGE, [0.81, 0.47, 0.18], undefined, "generatorFuelBox");
  box([0.14, 0.14, 0.02], YELLOW, [0.81, 0.56, 0.35], undefined, "generatorLabel");

  // ---------------------------------------------------------------------------
  // Radio tower and antenna
  // ---------------------------------------------------------------------------

  const towerBase: [number, number, number] = [1.24, 0.54, 0.66];
  const towerTop: [number, number, number] = [1.24, 2.35, 0.66];

  // Four splayed legs.
  const towerFeet: Array<[number, number, number]> = [
    [0.9, 0.5, 0.34],
    [1.58, 0.5, 0.34],
    [0.9, 0.5, 0.98],
    [1.58, 0.5, 0.98],
  ];
  const towerCorners: Array<[number, number, number]> = [
    [1.16, 2.25, 0.58],
    [1.32, 2.25, 0.58],
    [1.16, 2.25, 0.74],
    [1.32, 2.25, 0.74],
  ];
  for (let i = 0; i < 4; i++) beam(towerFeet[i], towerCorners[i], 0.025, METAL_DARK, "towerLeg");

  // Cross braces at three elevations.
  for (const y of [0.93, 1.38, 1.83]) {
    const w = 0.34 * (2.25 - y) / 1.75 + 0.04;
    const d = w;
    beam([1.24 - w, y, 0.66 - d], [1.24 + w, y, 0.66 + d], 0.016, METAL, "towerBrace");
    beam([1.24 + w, y, 0.66 - d], [1.24 - w, y, 0.66 + d], 0.016, METAL, "towerBrace");
  }
  box([0.42, 0.08, 0.42], METAL_DARK, [1.24, 2.27, 0.66], undefined, "towerPlatform");
  cyl(0.026, 0.68, METAL, [1.24, 2.64, 0.66], 8, undefined, "antennaMast");
  cone(0.12, 0.24, ORANGE, [1.24, 2.99, 0.66], 8, "antennaBeacon");
  const beacon = sphere(0.055, RED, [1.24, 3.12, 0.66], "beaconLight");
  glow(beacon, 2.2);

  // Radio dish.
  cyl(0.12, 0.035, METAL, [1.0, 2.45, 0.66], 12, [0, 90, 0], "radioDish");
  beam([1.02, 2.45, 0.66], [0.82, 2.45, 0.66], 0.018, METAL_DARK, "dishArm");
  cyl(0.025, 0.12, ORANGE, [0.82, 2.45, 0.66], 8, [0, 90, 0], "dishReceiver");

  // ---------------------------------------------------------------------------
  // Solar array on a low frame
  // ---------------------------------------------------------------------------

  const solarX = 0.08;
  const solarZ = 1.28;
  for (const x of [-0.28, 0.04, 0.36]) {
    panel([0.28, 0.035, 0.62], SOLAR, [x, 1.16, solarZ], [18, 0, 0], "solarPanel");
    box([0.018, 0.045, 0.64], SOLAR_HI, [x - 0.14, 1.165, solarZ], [18, 0, 0], "solarGrid");
    box([0.018, 0.045, 0.64], SOLAR_HI, [x + 0.14, 1.165, solarZ], [18, 0, 0], "solarGrid");
  }
  box([1.02, 0.06, 0.72], METAL_DARK, [0.04, 1.0, solarZ], [18, 0, 0], "solarFrame");
  for (const x of [-0.4, 0.48]) {
    beam([x, 0.45, solarZ], [x, 1.03, solarZ], 0.028, METAL_DARK, "solarLeg");
  }
  box([0.22, 0.16, 0.18], METAL, [0.74, 0.57, 1.18], undefined, "batteryBox");
  box([0.12, 0.035, 0.025], YELLOW, [0.74, 0.64, 1.28], undefined, "batteryIndicator");

  // ---------------------------------------------------------------------------
  // Fuel drums, crate, snowmobile sled, and supply clutter
  // ---------------------------------------------------------------------------

  const drumPositions: Array<[number, number, number]> = [
    [0.55, 0.67, -0.67],
    [0.86, 0.67, -0.68],
    [1.17, 0.67, -0.67],
  ];
  for (let i = 0; i < drumPositions.length; i++) {
    const p = drumPositions[i];
    cyl(0.13, 0.3, i === 1 ? RED : ORANGE, p, 12, undefined, "fuelDrum");
    cyl(0.105, 0.012, METAL_DARK, [p[0], p[1] + 0.155, p[2]], 12, undefined, "drumLid");
    box([0.18, 0.045, 0.02], SIGN, [p[0], p[1], p[2] - 0.14], undefined, "drumStripe");
  }

  box([0.46, 0.38, 0.42], WOOD_LIGHT, [1.62, 0.66, -0.68], undefined, "supplyCrate");
  box([0.48, 0.045, 0.44], WOOD_DARK, [1.62, 0.86, -0.68], undefined, "crateLid");
  box([0.035, 0.4, 0.04], WOOD_DARK, [1.48, 0.67, -0.9], undefined, "crateBand");
  box([0.035, 0.4, 0.04], WOOD_DARK, [1.76, 0.67, -0.9], undefined, "crateBand");

  // A compact orange tracked sled.
  box([0.64, 0.23, 0.3], ORANGE, [-1.62, 0.56, -0.53], undefined, "sledBody");
  box([0.38, 0.22, 0.28], ORANGE_LIGHT, [-1.75, 0.76, -0.53], [0, 0, -8], "sledCab");
  for (const x of [-1.82, -1.48]) {
    box([0.12, 0.12, 0.48], BLACK, [x, 0.43, -0.53], [0, 0, 0], "sledTrack");
    for (const z of [-0.72, -0.58, -0.34]) {
      cyl(0.045, 0.14, METAL, [x, 0.43, z], 8, [90, 0, 0], "trackWheel");
    }
  }
  beam([-1.93, 0.5, -0.53], [-2.14, 0.51, -0.53], 0.025, METAL, "sledSki");
  beam([-1.38, 0.5, -0.53], [-1.17, 0.51, -0.53], 0.025, METAL, "sledSki");

  // ---------------------------------------------------------------------------
  // Flag mast, flags, and weather instruments
  // ---------------------------------------------------------------------------

  cyl(0.025, 1.55, METAL_DARK, [-1.7, 1.22, 0.93], 8, undefined, "flagMast");
  box([0.42, 0.16, 0.025], ORANGE, [-1.88, 1.79, 0.93], undefined, "orangeFlag");
  box([0.2, 0.16, 0.025], SIGN, [-1.57, 1.79, 0.93], undefined, "flagHighlight");
  box([0.025, 0.12, 0.18], RED, [-1.71, 1.52, 0.93], undefined, "windSock");

  cyl(0.018, 0.45, METAL, [0.57, 1.48, 0.93], 8, [0, 0, 90], "weatherArm");
  for (const p of [
    [0.8, 1.48, 0.93],
    [0.46, 1.48, 1.13],
    [0.46, 1.48, 0.73],
  ] as Array<[number, number, number]>) {
    beam([0.57, 1.48, 0.93], p, 0.012, METAL, "anemometerArm");
    sphere(0.045, ORANGE, p, "anemometerCup");
  }

  // ---------------------------------------------------------------------------
  // Footpath, footprints, cable lines, and small observation markers
  // ---------------------------------------------------------------------------

  const pathTiles: Array<[number, number, number]> = [
    [-0.9, 0.39, -1.02],
    [-1.08, 0.39, -1.24],
    [-1.27, 0.39, -1.43],
    [-1.46, 0.39, -1.6],
  ];
  for (let i = 0; i < pathTiles.length; i++) {
    box([0.28, 0.035, 0.17], SHADOW_SNOW, pathTiles[i], [0, i * 7, 0], `pathTile`);
  }

  for (let i = 0; i < 8; i++) {
    const x = -1.45 + i * 0.19;
    const z = -1.48 + (i % 2) * 0.1;
    box([0.105, 0.025, 0.07], ICE, [x, 0.405, z], [0, i * 13, 0], "footprint");
  }

  // Generator cable from annex to cabin.
  b.sweep(
    [
      [0.42, 0.53, 0.2],
      [0.26, 0.54, 0.2],
      [0.16, 0.55, 0.32],
      [0.02, 0.56, 0.36],
    ],
    0.012,
    { color: CABLE, caps: "round", name: "generatorCable" },
  );

  // Tall orange survey stakes.
  for (const [x, z] of [
    [-1.96, -0.86],
    [1.94, 0.97],
    [-0.38, 1.67],
  ] as Array<[number, number]>) {
    cyl(0.018, 0.48, RED, [x, 0.57, z], 6, undefined, "surveyStake");
    box([0.11, 0.08, 0.025], ORANGE_LIGHT, [x, 0.76, z], undefined, "stakeFlag");
  }

  // ---------------------------------------------------------------------------
  // Snow caps, icicles, vents, and graphic details
  // ---------------------------------------------------------------------------

  // Cabin roof icicles.
  for (const x of [-1.18, -0.86, -0.54, -0.2]) {
    cone(0.028, 0.16 + (x + 1.2) * 0.018, ICE, [x, 1.53, -0.72], 6, "icicle");
  }
  for (const z of [-0.4, 0.0, 0.4]) {
    cone(0.026, 0.12, ICE, [-1.37, 1.53, z], 6, "sideIcicle");
  }

  // Ventilation louvres.
  for (let i = 0; i < 4; i++) {
    box([0.035, 0.035, 0.34], METAL, [0.33, 0.86 + i * 0.07, 0.32], [0, 0, 18], "ventLouvre");
  }
  box([0.06, 0.34, 0.4], METAL_DARK, [0.36, 0.98, 0.32], undefined, "ventHousing");

  // Red cross emergency marker, built as two flat pieces.
  box([0.22, 0.055, 0.025], RED, [0.95, 1.12, -0.25], undefined, "emergencyCross");
  box([0.055, 0.22, 0.025], RED, [0.95, 1.12, -0.25], undefined, "emergencyCross");

  // Snow over selected crates and equipment.
  box([0.55, 0.06, 0.28], SNOW, [1.62, 0.88, -0.68], [0, 4, 0], "crateSnow");
  box([0.28, 0.055, 0.2], SNOW, [0.81, 0.62, 0.18], [0, 0, 3], "generatorSnow");

  // A bright warning lamp beside the door.
  cyl(0.045, 0.04, METAL_DARK, [-0.33, 1.5, -0.71], 8, [90, 0, 0], "lampHousing");
  const lamp = sphere(0.032, GLOW, [-0.33, 1.5, -0.745], "porchLamp");
  glow(lamp, 2.4);

  // A tiny polar research emblem on the cabin wall.
  const emblem = b.part(new THREE.CircleGeometry(0.1, 8), ORANGE_LIGHT, {
    at: [-0.11, 1.43, -0.704],
    dir: [0, 0, 1],
    axis: "z",
    name: "researchEmblem",
  });
  box([0.025, 0.13, 0.012], SIGN, [-0.11, 1.43, -0.716], undefined, "emblemNeedle");
  box([0.13, 0.025, 0.012], SIGN, [-0.11, 1.43, -0.716], undefined, "emblemNeedle");

  // A few faceted snow lumps visually merging the building into the island.
  for (const [x, z, sx, sz] of [
    [-1.34, -0.5, 0.42, 0.18],
    [-1.21, 0.7, 0.35, 0.2],
    [0.3, 0.64, 0.35, 0.2],
    [0.43, -0.45, 0.3, 0.16],
  ] as Array<[number, number, number, number]>) {
    box([sx, 0.18, sz], SNOW, [x, 0.5, z], [0, rand() * 20, 0], "buildingSnowDrift");
  }

  // Add a few dark blue panel seams to make the solar array read clearly.
  for (const x of [-0.28, 0.04, 0.36]) {
    box([0.24, 0.012, 0.012], SOLAR_HI, [x, 1.2, solarZ - 0.2], [18, 0, 0], "solarCellLine");
    box([0.24, 0.012, 0.012], SOLAR_HI, [x, 1.2, solarZ + 0.02], [18, 0, 0], "solarCellLine");
    box([0.24, 0.012, 0.012], SOLAR_HI, [x, 1.2, solarZ + 0.22], [18, 0, 0], "solarCellLine");
  }

  // Final small snow mound at the island's front edge.
  box([1.2, 0.14, 0.28], SNOW, [0.2, 0.42, -1.73], [0, -3, 0], "frontSnowBank");

  return b.root;
}
```