```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Arctic Research Outpost",
  description: "A stylized Firewatch flat-colour diorama of a compact arctic science station, with snow, a warm cabin, solar panels, radar mast, fuel drums, supply crates, antennae and expedition details.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#eef4f2";
  const SNOW_BLUE = "#c8e1e7";
  const ICE = "#8fc4d1";
  const ICE_DARK = "#477d91";
  const SKY_BLUE = "#204d69";
  const NIGHT = "#102b3d";
  const RED = "#c84f3d";
  const RED_DARK = "#783a38";
  const ORANGE = "#e48643";
  const YELLOW = "#f2c75c";
  const WOOD = "#8b6046";
  const WOOD_DARK = "#4b3940";
  const METAL = "#647b82";
  const METAL_DARK = "#344b55";
  const BLACK = "#202d34";
  const WHITE = "#ffffff";
  const SIGNAL = "#e05d4c";
  const GREEN = "#52766b";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: {
      rotation?: [number, number, number];
      scale?: [number, number, number];
      group?: string;
    } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation: options.rotation,
      scale: options.scale,
      name,
      group: options.group ?? "outpost",
    });

  const cyl = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
      group: "outpost",
    });

  const sphere = (
    name: string,
    radius: number,
    at: [number, number, number],
    color: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      scale,
      name,
      group: "outpost",
    });

  const rod = (
    name: string,
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { color, name, group: "outpost" });

  const spike = (
    name: string,
    at: [number, number, number],
    dir: [number, number, number],
    length: number,
    radius: number,
    color: string,
  ) => b.spike(at, dir, length, radius, { color, name, group: "outpost" });

  // ---------------------------------------------------------------------------
  // Snow island, blue ice shelf, wind-carved banks and expedition tracks.
  // ---------------------------------------------------------------------------

  box("iceIsland", [7.2, 0.18, 5.8], [0, 0.09, 0], ICE, { group: "terrain" });
  box("snowTop", [6.9, 0.12, 5.5], [0, 0.21, 0.05], SNOW, { group: "terrain" });
  box("iceFrontFace", [7.15, 0.32, 0.11], [0, 0.02, 2.88], ICE_DARK, { group: "terrain" });

  const banks: Array<[string, [number, number, number], [number, number, number]]> = [
    ["bankL1", [-2.75, 0.42, -1.8], [1.2, 0.45, 1.05]],
    ["bankL2", [-2.65, 0.34, 1.75], [1.5, 0.35, 0.9]],
    ["bankR1", [2.9, 0.45, -1.65], [1.1, 0.52, 1.15]],
    ["bankR2", [2.7, 0.31, 1.65], [1.45, 0.3, 0.8]],
    ["bankBack", [0.7, 0.35, -2.45], [2.6, 0.35, 0.65]],
  ];
  for (const [name, at, scale] of banks) sphere(name, 0.72, at, SNOW, scale);

  for (let i = 0; i < 7; i++) {
    box(
      `trackL${i}`,
      [0.28, 0.018, 0.42],
      [-0.72 + i * 0.28, 0.225, 2.18 - i * 0.26],
      ICE_DARK,
      { rotation: [0, -18, 0], group: "tracks" },
    );
    box(
      `trackR${i}`,
      [0.28, 0.018, 0.42],
      [0.05 + i * 0.28, 0.225, 2.18 - i * 0.26],
      ICE_DARK,
      { rotation: [0, -18, 0], group: "tracks" },
    );
  }

  // Small angular exposed ice chunks.
  for (const [i, p] of [
    [-2.65, 0.35, 0.6],
    [2.8, 0.32, 0.55],
    [-2.95, 0.3, -0.5],
    [2.45, 0.3, 2.3],
  ] as Array<[number, number, number]>) {
    b.part(new THREE.DodecahedronGeometry(0.22, 0), ICE_BLUE(), {
      at: p,
      name: `iceChunk${p[0]}${p[2]}`,
      group: "terrain",
    });
  }

  function ICE_BLUE() {
    return "#9bcbd5";
  }

  // ---------------------------------------------------------------------------
  // Main raised research cabin.
  // ---------------------------------------------------------------------------

  // Foundation skids and short stilts.
  box("foundationBeamFront", [3.25, 0.16, 0.18], [0, 0.44, 0.88], WOOD_DARK);
  box("foundationBeamBack", [3.25, 0.16, 0.18], [0, 0.44, -0.82], WOOD_DARK);
  for (const x of [-1.2, 0, 1.2]) {
    box(`stiltL${x}`, [0.18, 0.48, 0.18], [x, 0.43, 0.72], WOOD);
    box(`stiltR${x}`, [0.18, 0.48, 0.18], [x, 0.43, -0.68], WOOD);
  }

  box("cabinBody", [3.05, 1.65, 1.9], [0, 1.37, -0.05], RED, { group: "cabin" });
  box("cabinLowerBand", [3.12, 0.15, 1.96], [0, 0.59, -0.05], RED_DARK, { group: "cabin" });
  box("cabinTopBand", [3.16, 0.12, 1.98], [0, 2.17, -0.05], ORANGE, { group: "cabin" });

  // Corner posts and front framing.
  for (const x of [-1.5, 1.5]) {
    box(`cornerPost${x}`, [0.16, 1.75, 0.16], [x, 1.4, 0.9], RED_DARK, { group: "cabin" });
    box(`backCorner${x}`, [0.16, 1.75, 0.16], [x, 1.4, -1.0], RED_DARK, { group: "cabin" });
  }
  box("frontLintel", [2.95, 0.14, 0.15], [0, 2.02, 0.94], RED_DARK, { group: "cabin" });
  box("frontSill", [2.95, 0.12, 0.15], [0, 0.78, 0.94], RED_DARK, { group: "cabin" });

  // Sloped, thick snow-covered roof.
  box("roofLeft", [1.9, 0.22, 2.18], [-0.78, 2.27, -0.05], RED_DARK, {
    rotation: [0, 0, -31],
    group: "roof",
  });
  box("roofRight", [1.9, 0.22, 2.18], [0.78, 2.27, -0.05], RED_DARK, {
    rotation: [0, 0, 31],
    group: "roof",
  });
  box("snowRoofLeft", [1.78, 0.14, 2.2], [-0.78, 2.42, -0.05], SNOW, {
    rotation: [0, 0, -31],
    group: "roof",
  });
  box("snowRoofRight", [1.78, 0.14, 2.2], [0.78, 2.42, -0.05], SNOW, {
    rotation: [0, 0, 31],
    group: "roof",
  });
  box("ridgeSnow", [0.18, 0.2, 2.2], [0, 2.69, -0.05], SNOW, { group: "roof" });

  // Front windows: deep blue glass, orange mullions, snow ledges.
  for (const x of [-0.88, 0.88]) {
    box(`windowGlass${x}`, [0.72, 0.62, 0.035], [x, 1.54, 0.925], SKY_BLUE, { group: "windows" });
    box(`windowVert${x}`, [0.055, 0.66, 0.055], [x, 1.54, 0.955], ORANGE, { group: "windows" });
    box(`windowHorz${x}`, [0.78, 0.055, 0.055], [x, 1.54, 0.955], ORANGE, { group: "windows" });
    box(`windowSnow${x}`, [0.88, 0.12, 0.16], [x, 1.92, 0.92], SNOW, { group: "windows" });
  }

  // Side windows and a warm rear window.
  for (const z of [-0.55, 0.35]) {
    box(`sideWindow${z}`, [0.035, 0.56, 0.58], [-1.535, 1.5, z], SKY_BLUE, { group: "windows" });
    box(`sideCrossA${z}`, [0.055, 0.6, 0.055], [-1.565, 1.5, z], ORANGE, { group: "windows" });
    box(`sideCrossB${z}`, [0.055, 0.055, 0.64], [-1.565, 1.5, z], ORANGE, { group: "windows" });
  }

  // Front door and handle.
  box("door", [0.62, 1.22, 0.06], [0, 1.23, 0.982], WOOD_DARK, { group: "door" });
  box("doorInset", [0.48, 0.96, 0.025], [0, 1.26, 1.02], RED, { group: "door" });
  box("doorWindow", [0.3, 0.28, 0.03], [0, 1.66, 1.035], SKY_BLUE, { group: "door" });
  cyl("doorHandle", 0.035, 0.11, [0.2, 1.2, 1.055], YELLOW, 8, [90, 0, 0]);
  box("doorStep", [0.9, 0.12, 0.55], [0, 0.55, 1.24], WOOD_DARK, { group: "door" });
  box("doorStepSnow", [0.85, 0.06, 0.5], [0, 0.64, 1.24], SNOW, { group: "door" });

  // Cabin wall vents and warning stripes.
  for (let i = 0; i < 4; i++) {
    box(`vent${i}`, [0.1, 0.045, 0.38], [-1.24 + i * 0.22, 1.02, -1.04], BLACK, {
      rotation: [0, 0, -18],
      group: "cabinDetails",
    });
  }
  for (let i = 0; i < 3; i++) {
    box(`warningStripe${i}`, [0.13, 0.06, 0.18], [-1.33 + i * 0.15, 0.76, 0.98], YELLOW, {
      rotation: [0, 0, -35],
      group: "cabinDetails",
    });
  }

  // ---------------------------------------------------------------------------
  // Chimney, glowing exhaust cap, and little snow-covered utility box.
  // ---------------------------------------------------------------------------

  box("chimney", [0.22, 0.62, 0.22], [0.85, 2.86, -0.48], METAL_DARK, { group: "utilities" });
  box("chimneyCap", [0.34, 0.08, 0.34], [0.85, 3.18, -0.48], METAL, { group: "utilities" });
  box("chimneySnow", [0.42, 0.08, 0.38], [0.85, 3.24, -0.48], SNOW, { group: "utilities" });
  sphere("warmVentGlow", 0.09, [0.85, 3.2, -0.48], ORANGE, [1, 0.35, 1]);

  box("utilityBox", [0.7, 0.52, 0.5], [1.95, 0.65, -0.55], METAL_DARK, { group: "utilities" });
  box("utilityBoxFace", [0.48, 0.27, 0.025], [1.95, 0.72, -0.82], YELLOW, { group: "utilities" });
  for (const x of [1.73, 1.95, 2.17]) {
    cyl("utilityBolt", 0.025, 0.035, [x, 0.88, -0.82], BLACK, 6, [90, 0, 0]);
  }

  // ---------------------------------------------------------------------------
  // Solar-panel array on the left, angled toward the arctic sun.
  // ---------------------------------------------------------------------------

  for (const x of [-2.0, -1.25]) {
    rod(`solarLeg${x}`, [x, 0.25, -0.25], [x, 1.25, -0.45], 0.035, METAL_DARK);
    rod(`solarBrace${x}`, [x, 0.58, -0.38], [x + 0.52, 0.95, -0.38], 0.025, METAL);
  }

  box("solarBoard", [1.62, 0.08, 1.24], [-1.62, 1.42, -0.5], BLACK, {
    rotation: [-18, 0, 0],
    group: "solar",
  });
  box("solarBlueFace", [1.45, 0.025, 1.08], [-1.62, 1.48, -0.54], "#2d6381", {
    rotation: [-18, 0, 0],
    group: "solar",
  });
  for (const x of [-2.02, -1.62, -1.22]) {
    box(`solarCellV${x}`, [0.025, 0.035, 1.08], [x, 1.49, -0.54], ICE, {
      rotation: [-18, 0, 0],
      group: "solar",
    });
  }
  for (const z of [-0.88, -0.5, -0.12]) {
    box(`solarCellH${z}`, [1.45, 0.035, 0.025], [-1.62, 1.49, z], ICE, {
      rotation: [-18, 0, 0],
      group: "solar",
    });
  }

  // ---------------------------------------------------------------------------
  // Tall radio/radar mast behind the station.
  // ---------------------------------------------------------------------------

  rod("mast", [1.75, 0.28, -1.72], [1.75, 3.66, -1.72], 0.055, METAL_DARK);
  rod("mastBraceA", [1.75, 0.7, -1.72], [1.25, 1.95, -1.72], 0.025, METAL);
  rod("mastBraceB", [1.75, 0.7, -1.72], [2.25, 1.95, -1.72], 0.025, METAL);
  rod("mastBraceC", [1.75, 1.3, -1.72], [1.75, 2.45, -1.72], 0.025, METAL);
  box("mastPlatform", [0.85, 0.08, 0.85], [1.75, 2.88, -1.72], METAL_DARK);
  for (const x of [1.42, 2.08]) {
    rod("platformRail", [x, 2.9, -2.02], [x, 3.16, -2.02], 0.025, METAL);
    rod("platformRailTop", [x, 3.16, -2.02], [x, 3.16, -1.42], 0.025, METAL);
  }

  // Radar dish: bowl, axle, bright receiver arm.
  cyl("radarDishBack", 0.43, 0.12, [1.75, 3.16, -1.72], METAL, 12, [90, 0, 0]);
  sphere("radarDishBowl", 0.38, [1.75, 3.23, -1.72], METAL, [1, 0.28, 1]);
  rod("radarArm", [1.75, 3.28, -1.72], [1.75, 3.28, -1.18], 0.025, METAL_DARK);
  sphere("radarReceiver", 0.075, [1.75, 3.28, -1.1], YELLOW);
  cyl("radarHub", 0.1, 0.2, [1.75, 3.16, -1.64], BLACK, 8, [90, 0, 0]);

  // Radio aerial, beacon, and windsock.
  rod("aerial", [1.75, 3.62, -1.72], [1.75, 4.22, -1.72], 0.018, METAL);
  sphere("beacon", 0.08, [1.75, 4.25, -1.72], SIGNAL, [1, 0.5, 1]);
  rod("windsockPole", [2.18, 3.25, -1.7], [2.18, 4.0, -1.7], 0.018, METAL);
  b.extrude(
    [
      [0, 0],
      [0.55, -0.12],
      [0.86, 0.02],
      [0.55, 0.2],
      [0, 0.16],
    ],
    {
      at: [2.18, 3.9, -1.7],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      color: SIGNAL,
      name: "windsock",
      group: "mast",
    },
  );
  for (const z of [-1.82, -1.62]) {
    box("windsockBand", [0.17, 0.17, 0.035], [2.38, 3.91, z], WHITE, {
      rotation: [0, 90, 0],
      group: "mast",
    });
  }

  // ---------------------------------------------------------------------------
  // Crates, oxygen/fuel cylinders, sled and stacked field equipment.
  // ---------------------------------------------------------------------------

  box("crateLarge", [0.72, 0.55, 0.65], [-2.02, 0.54, 0.95], WOOD, { group: "supplies" });
  box("crateLargeLid", [0.78, 0.08, 0.71], [-2.02, 0.84, 0.95], WOOD_DARK, { group: "supplies" });
  for (const x of [-2.28, -2.02, -1.76]) {
    box("crateBand", [0.055, 0.58, 0.69], [x, 0.55, 0.95], ORANGE, { group: "supplies" });
  }

  box("crateSmall", [0.58, 0.42, 0.48], [-2.05, 0.42, 1.72], WOOD_DARK, { group: "supplies" });
  box("crateLabel", [0.3, 0.17, 0.025], [-2.05, 0.48, 1.97], YELLOW, { group: "supplies" });
  box("crateLabelStripe", [0.2, 0.035, 0.035], [-2.05, 0.48, 1.99], BLACK, { group: "supplies" });

  // Fuel/oxygen drums in two colours.
  for (const [i, x] of [-1.15, -0.75, 2.35] as Array<[number, number]>) {
    cyl(`fuelDrum${i}`, 0.19, 0.54, [x, 0.51, 1.7], i === 2 ? YELLOW : ORANGE, 10);
    cyl(`fuelCap${i}`, 0.1, 0.025, [x, 0.8, 1.7], BLACK, 8);
    box(`fuelBand${i}`, [0.4, 0.055, 0.045], [x, 0.58, 1.7], BLACK, { group: "supplies" });
  }

  // Sled runners and cargo lashings.
  for (const x of [-2.55, -1.7]) {
    rod("sledRunner", [x, 0.27, 1.15], [x, 0.27, 2.15], 0.045, WOOD_DARK);
    rod("sledUpright", [x, 0.28, 1.3], [x, 0.78, 1.3], 0.035, WOOD);
    rod("sledUpright", [x, 0.28, 1.95], [x, 0.78, 1.95], 0.035, WOOD);
  }
  box("sledDeck", [1.2, 0.1, 1.0], [-2.12, 0.7, 1.65], WOOD, { group: "supplies" });
  box("sledSnow", [1.22, 0.06, 0.98], [-2.12, 0.78, 1.65], SNOW, { group: "supplies" });
  rod("sledRope", [-2.72, 0.95, 1.65], [-3.0, 1.1, 1.65], 0.018, RED_DARK);

  // ---------------------------------------------------------------------------
  // Flag, directional sign, ice sample rack and weather instruments.
  // ---------------------------------------------------------------------------

  rod("flagPole", [-2.72, 0.24, -0.35], [-2.72, 2.32, -0.35], 0.025, WOOD_DARK);
  b.extrude(
    [
      [0, 0],
      [0.62, -0.05],
      [0.48, 0.26],
      [0, 0.34],
    ],
    {
      at: [-2.7, 2.25, -0.35],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: SIGNAL,
      name: "stationFlag",
      group: "signage",
    },
  );
  box("flagSnowCap", [0.1, 0.1, 0.1], [-2.72, 2.38, -0.35], SNOW, { group: "signage" });

  rod("signPost", [2.72, 0.23, 0.7], [2.72, 1.0, 0.7], 0.035, WOOD_DARK);
  box("signBoard", [0.95, 0.22, 0.08], [2.72, 1.0, 0.7], YELLOW, { group: "signage" });
  box("signArrow", [0.25, 0.06, 0.025], [2.99, 1.0, 0.75], BLACK, { rotation: [0, 0, -10], group: "signage" });
  box("signMark1", [0.08, 0.045, 0.025], [2.55, 1.02, 0.75], BLACK, { group: "signage" });
  box("signMark2", [0.16, 0.045, 0.025], [2.69, 1.02, 0.75], BLACK, { group: "signage" });

  // Ice core rack.
  box("coreRackTop", [0.85, 0.08, 0.4], [2.32, 0.96, 1.65], WOOD_DARK, { group: "science" });
  box("coreRackBottom", [0.85, 0.08, 0.4], [2.32, 0.3, 1.65], WOOD_DARK, { group: "science" });
  for (const x of [2.0, 2.22, 2.44, 2.66]) {
    rod("coreTube", [x, 0.36, 1.65], [x, 0.9, 1.65], 0.055, ICE, );
    box("coreLabel", [0.08, 0.05, 0.08], [x, 0.95, 1.65], WHITE, { group: "science" });
  }

  // Wind gauge and thermometer.
  rod("weatherPole", [0.95, 0.25, 1.95], [0.95, 1.95, 1.95], 0.025, METAL_DARK);
  cyl("weatherCupHub", 0.07, 0.12, [0.95, 1.9, 1.95], METAL, 8);
  for (const [dx, dz] of [
    [0.28, 0],
    [-0.28, 0],
    [0, 0.28],
    [0, -0.28],
  ]) {
    rod("anemometerArm", [0.95, 1.9, 1.95], [0.95 + dx, 1.9, 1.95 + dz], 0.018, METAL);
    cyl("anemometerCup", 0.075, 0.07, [0.95 + dx * 1.15, 1.9, 1.95 + dz * 1.15], RED, 7, [90, 0, 0]);
  }
  box("thermometer", [0.1, 0.6, 0.08], [1.22, 1.15, 1.95], WHITE, { group: "science" });
  box("thermometerMercury", [0.035, 0.35, 0.03], [1.22, 1.0, 2.0], SIGNAL, { group: "science" });

  // A few snow caps make the objects feel embedded in the storm.
  box("crateSnow", [0.68, 0.08, 0.61], [-2.02, 0.86, 0.95], SNOW, { group: "snowDetails" });
  box("utilitySnow", [0.72, 0.08, 0.52], [1.95, 0.94, -0.55], SNOW, { group: "snowDetails" });
  sphere("drumSnow", 0.14, [2.35, 0.81, 1.7], SNOW, [1.2, 0.3, 1.2]);

  // Warm lamp over the entrance.
  box("lampMount", [0.26, 0.12, 0.08], [0, 2.06, 1.1], WOOD_DARK);
  cyl("lampHousing", 0.13, 0.16, [0, 1.96, 1.13], BLACK, 8, [90, 0, 0]);
  sphere("lampGlow", 0.08, [0, 1.95, 1.22], YELLOW, [1, 0.55, 0.55]);

  return b.root;
}
```