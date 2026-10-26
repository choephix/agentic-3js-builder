import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "arctic research outpost",
  description:
    "A stylized Firewatch-inspired arctic research outpost diorama with a snow island, warm cabin, antenna tower, satellite dish, wind turbine, solar panels, fuel drums, sled, crates, snow fences, ice shards, and footprints.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#edf5f2";
  const SNOW_LIGHT = "#ffffff";
  const SNOW_BLUE = "#b7d1d9";
  const ICE = "#79aeba";
  const ICE_DARK = "#426f83";
  const DEEP = "#173344";
  const NAVY = "#1e4053";
  const WALL = "#2c5364";
  const WALL_DARK = "#203d4c";
  const ROOF = "#304a58";
  const ROOF_DARK = "#213945";
  const TRIM = "#d26043";
  const ORANGE = "#e78949";
  const RED = "#bd4c40";
  const YELLOW = "#ffd477";
  const WINDOW = "#ffbf62";
  const WINDOW_BRIGHT = "#ffe3a0";
  const GLASS = "#8bc8c9";
  const PANEL = "#183e5a";
  const PANEL_BLUE = "#2b6680";
  const PANEL_LINE = "#87c4c5";
  const METAL = "#607a82";
  const METAL_DARK = "#354e59";
  const DARK = "#12242d";
  const WOOD = "#785444";
  const WOOD_LIGHT = "#aa7950";
  const CRATE = "#b27d4b";
  const CABLE = "#263c45";
  const BLACK = "#101b20";
  const ICE_SHADOW = "#8fbac2";

  type V = [number, number, number];
  type Rot = [number, number, number];

  const box = (
    size: V,
    color: string,
    at: V,
    rotation: Rot = [0, 0, 0],
    name = "box",
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: V,
    rotation: Rot = [0, 0, 0],
    segments = 10,
    name = "cylinder",
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      flat: true,
      name,
    });

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: V,
    rotation: Rot = [0, 0, 0],
    segments = 8,
    name = "cone",
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      rotation,
      flat: true,
      name,
    });

  const icosphere = (
    scale: V,
    color: string,
    at: V,
    name = "snow-rock",
  ) =>
    b.part(new THREE.IcosahedronGeometry(1, 1), color, {
      at,
      scale,
      flat: true,
      name,
    });

  const rod = (
    a: V,
    c: V,
    radius: number,
    color: string,
    name = "rod",
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "flat",
      name,
    });

  const torus = (
    major: number,
    minor: number,
    color: string,
    at: V,
    rotation: Rot = [0, 0, 0],
    name = "rim",
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 14), color, {
      at,
      rotation,
      flat: true,
      name,
    });

  const plate = (
    size: V,
    color: string,
    at: V,
    rotation: Rot = [0, 0, 0],
    name = "plate",
  ) => box(size, color, at, rotation, name);

  function frontWindow(
    x: number,
    y: number,
    width: number,
    height: number,
    z = 1.055,
    name = "front-window",
  ) {
    box([width + 0.12, height + 0.12, 0.075], DARK, [x, y, z], [0, 0, 0], `${name}-frame`);
    box([width, height, 0.028], WINDOW, [x, y, z + 0.047], [0, 0, 0], `${name}-glow`);
    box([0.035, height + 0.015, 0.018], TRIM, [x, y, z + 0.066], [0, 0, 0], `${name}-mullion`);
    box([width + 0.015, 0.035, 0.018], TRIM, [x, y, z + 0.068], [0, 0, 0], `${name}-crossbar`);
    box([width + 0.18, 0.035, 0.045], TRIM, [x, y + height / 2 + 0.085, z + 0.02], [0, 0, 0], `${name}-top-trim`);
  }

  function sideWindow(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    name = "side-window",
  ) {
    box([0.075, height + 0.12, width + 0.12], DARK, [x, y, z], [0, 0, 0], `${name}-frame`);
    box([0.028, height, width], GLASS, [x + (x < 0 ? -0.046 : 0.046), y, z], [0, 0, 0], `${name}-glass`);
    box([0.018, height + 0.015, 0.035], TRIM, [x + (x < 0 ? -0.066 : 0.066), y, z], [0, 0, 0], `${name}-bar`);
    box([0.018, 0.035, width + 0.015], TRIM, [x + (x < 0 ? -0.066 : 0.066), y, z], [0, 0, 0], `${name}-cross`);
  }

  function snowPatch(
    at: V,
    scale: V,
    color = SNOW_LIGHT,
    name = "snow-drift",
  ) {
    return icosphere(scale, color, at, name);
  }

  function crate(at: V, size: V, name = "supply-crate") {
    box(size, CRATE, at, [0, 0, 0], name);
    const [w, h, d] = size;
    box([w + 0.012, 0.025, 0.025], WOOD_LIGHT, [at[0], at[1], at[2] + d / 2 + 0.014], [0, 0, 0], `${name}-front-top`);
    box([0.025, h + 0.015, 0.025], WOOD_LIGHT, [at[0] - w * 0.28, at[1], at[2] + d / 2 + 0.014], [0, 0, 0], `${name}-front-left`);
    box([0.025, h + 0.015, 0.025], WOOD_LIGHT, [at[0] + w * 0.28, at[1], at[2] + d / 2 + 0.014], [0, 0, 0], `${name}-front-right`);
    box([w + 0.015, 0.025, 0.025], WOOD_LIGHT, [at[0], at[1], at[2] - d / 2 - 0.014], [0, 0, 0], `${name}-back-top`);
  }

  function barrel(at: V, color: string, name = "fuel-drum") {
    cylinder(0.18, 0.42, color, at, [0, 0, 90], 10, name);
    torus(0.18, 0.018, METAL_DARK, [at[0], at[1] - 0.13, at[2]], [0, 0, 90], `${name}-lower-band`);
    torus(0.18, 0.018, METAL_DARK, [at[0], at[1] + 0.13, at[2]], [0, 0, 90], `${name}-upper-band`);
    cylinder(0.045, 0.012, METAL_DARK, [at[0] + 0.06, at[1] + 0.21, at[2]], [0, 0, 90], 8, `${name}-cap`);
  }

  function marker(at: V, name = "orange-marker") {
    cylinder(0.035, 0.55, ORANGE, [at[0], at[1] + 0.275, at[2]], [0, 0, 0], 7, `${name}-post`);
    cone(0.07, 0.13, RED, [at[0], at[1] + 0.59, at[2]], [0, 0, 0], 6, `${name}-cap`);
    box([0.14, 0.035, 0.05], SNOW_LIGHT, [at[0], at[1] + 0.38, at[2] + 0.015], [0, 0, 0], `${name}-stripe`);
  }

  function solarPanel(
    center: V,
    rotation: Rot,
    name: string,
  ) {
    box([1.02, 0.055, 0.72], PANEL, center, rotation, `${name}-back`);
    box([0.96, 0.025, 0.025], PANEL_LINE, [center[0], center[1] + 0.038, center[2] - 0.22], rotation, `${name}-row-1`);
    box([0.96, 0.025, 0.025], PANEL_LINE, [center[0], center[1] + 0.038, center[2]], rotation, `${name}-row-2`);
    box([0.96, 0.025, 0.025], PANEL_LINE, [center[0], center[1] + 0.038, center[2] + 0.22], rotation, `${name}-row-3`);
    box([0.025, 0.025, 0.66], PANEL_LINE, [center[0] - 0.32, center[1] + 0.039, center[2]], rotation, `${name}-column-1`);
    box([0.025, 0.025, 0.66], PANEL_LINE, [center[0], center[1] + 0.039, center[2]], rotation, `${name}-column-2`);
    box([0.025, 0.025, 0.66], PANEL_LINE, [center[0] + 0.32, center[1] + 0.039, center[2]], rotation, `${name}-column-3`);
    box([1.12, 0.07, 0.045], METAL_DARK, [center[0], center[1] - 0.03, center[2] - 0.37], rotation, `${name}-lower-rail`);
    box([0.05, 0.48, 0.05], METAL_DARK, [center[0] - 0.38, center[1] - 0.15, center[2] + 0.06], rotation, `${name}-leg-left`);
    box([0.05, 0.48, 0.05], METAL_DARK, [center[0] + 0.38, center[1] - 0.15, center[2] + 0.06], rotation, `${name}-leg-right`);
  }

  // ---------------------------------------------------------------------------
  // Snow island and layered ice shelf
  // ---------------------------------------------------------------------------

  cylinder(1, 0.18, ICE_DARK, [0, 0.09, 0], [0, 0, 0], 14, "dark-ice-island");
  b.part(new THREE.CylinderGeometry(1, 1, 0.085, 14), SNOW, {
    at: [0, 0.205, 0],
    scale: [3.18, 1, 2.42],
    flat: true,
    name: "snow-covered-island",
  });

  b.part(new THREE.CylinderGeometry(1, 1, 0.035, 14), SNOW_BLUE, {
    at: [0, 0.247, 0],
    scale: [3.0, 1, 2.24],
    flat: true,
    name: "snow-island-blue-edge",
  });

  // Low polygon wedges at the island edge make the base feel like broken pack ice.
  const iceChunks: Array<[V, V, number]> = [
    [[-2.75, 0.19, -1.35], [0.55, 0.16, 0.35], -12],
    [[-1.95, 0.2, 1.85], [0.48, 0.14, 0.32], 18],
    [[0.9, 0.2, -2.0], [0.7, 0.13, 0.28], -16],
    [[2.45, 0.2, 0.95], [0.62, 0.15, 0.3], 24],
    [[2.7, 0.2, -0.9], [0.42, 0.14, 0.28], -28],
    [[-2.8, 0.2, 0.55], [0.38, 0.13, 0.3], 26],
  ];

  for (let i = 0; i < iceChunks.length; i++) {
    const [at, scale, angle] = iceChunks[i];
    icosphere(scale, i % 2 === 0 ? SNOW_LIGHT : SNOW_BLUE, at, `edge-ice-${i}`);
    box([scale[0] * 1.5, 0.035, scale[2] * 1.8], ICE, [at[0], 0.235, at[2]], [0, angle, 0], `edge-blue-face-${i}`);
  }

  // ---------------------------------------------------------------------------
  // Main research cabin
  // ---------------------------------------------------------------------------

  box([2.36, 1.36, 1.56], WALL, [0, 0.93, 0.25], [0, 0, 0], "main-cabin-body");
  box([2.39, 0.09, 1.59], WALL_DARK, [0, 0.275, 0.25], [0, 0, 0], "cabin-foundation");
  box([2.42, 0.08, 1.62], TRIM, [0, 0.32, 0.25], [0, 0, 0], "cabin-red-base-rail");

  // Front gable, kept separate so the strong triangular silhouette reads clearly.
  b.extrude(
    [
      [-1.14, 0],
      [1.14, 0],
      [0.04, 0.49],
      [0, 0.51, "sharp"],
      [-0.04, 0.49],
    ],
    {
      at: [0, 1.52, 1.055],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      color: WALL_DARK,
      name: "front-gable",
    },
  );

  // Gable trim and roof halves.
  box([1.56, 0.17, 1.9], ROOF, [-0.39, 1.83, 0.25], [0, 0, 28], "left-roof");
  box([1.56, 0.17, 1.9], ROOF, [0.39, 1.83, 0.25], [0, 0, -28], "right-roof");
  box([1.62, 0.12, 1.94], SNOW, [-0.39, 1.94, 0.25], [0, 0, 28], "left-roof-snow");
  box([1.62, 0.12, 1.94], SNOW, [0.39, 1.94, 0.25], [0, 0, -28], "right-roof-snow");
  box([0.11, 0.18, 1.98], SNOW_LIGHT, [0, 2.08, 0.25], [0, 0, 0], "ridge-snow");
  box([2.5, 0.08, 0.07], TRIM, [0, 1.58, 1.075], [0, 0, 0], "front-eave-trim");

  // Cabin front opening.
  frontWindow(-0.48, 1.05, 0.68, 0.55, 1.062, "big-front-window");

  box([0.52, 1.02, 0.075], TRIM, [0.72, 0.78, 1.062], [0, 0, 0], "front-door");
  box([0.37, 0.36, 0.025], WALL_DARK, [0.72, 0.85, 1.11], [0, 0, 0], "door-upper-panel");
  box([0.37, 0.035, 0.022], ORANGE, [0.72, 0.58, 1.112], [0, 0, 0], "door-lower-panel");
  cylinder(0.035, 0.026, YELLOW, [0.88, 0.8, 1.12], [90, 0, 0], 8, "door-handle");
  box([0.59, 0.07, 0.06], SNOW, [0.72, 1.34, 1.1], [0, 0, 0], "door-snow-lintel");

  // Side windows and wall trim.
  sideWindow(-1.19, 1.05, 0.27, 0.62, 0.52, "left-side-window");
  sideWindow(1.19, 1.06, 0.2, 0.42, 0.42, "right-side-window");
  box([0.08, 1.22, 0.08], TRIM, [-1.19, 0.9, 1.04], [0, 0, 0], "left-front-corner-post");
  box([0.08, 1.22, 0.08], TRIM, [1.19, 0.9, 1.04], [0, 0, 0], "right-front-corner-post");

  // Chimney and roof vent.
  box([0.19, 0.48, 0.19], METAL_DARK, [-0.7, 2.12, -0.04], [0, 0, 0], "chimney");
  box([0.28, 0.075, 0.28], RED, [-0.7, 2.36, -0.04], [0, 0, 0], "chimney-cap");
  box([0.36, 0.05, 0.24], SNOW, [-0.7, 2.43, -0.04], [0, 0, 0], "chimney-snow");

  // Front sign with a simple bold expedition label.
  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 68">
      <rect width="320" height="68" rx="6" fill="#173344"/>
      <rect x="7" y="7" width="306" height="54" rx="3" fill="#d26043" stroke="#ffd477" stroke-width="4"/>
      <text x="160" y="31" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="900" letter-spacing="2" fill="#fff4d8">ARCTIC STATION</text>
      <text x="160" y="51" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="#173344">NORTH 07</text>
    </svg>`,
    { size: 320 },
  );

  b.part(new THREE.PlaneGeometry(0.98, 0.21), "#ffffff", {
    at: [0.0, 1.47, 1.104],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "station-sign",
  });

  // Roof snow clumps break the perfectly geometric roof silhouette.
  snowPatch([-0.72, 2.07, 0.93], [0.43, 0.11, 0.14], SNOW_LIGHT, "roof-snow-front-left");
  snowPatch([0.6, 2.15, -0.48], [0.5, 0.1, 0.13], SNOW_LIGHT, "roof-snow-back-right");
  snowPatch([-0.23, 2.13, 0.36], [0.3, 0.08, 0.12], SNOW_LIGHT, "roof-snow-center");

  // ---------------------------------------------------------------------------
  // Attached laboratory module on the left
  // ---------------------------------------------------------------------------

  box([0.82, 1.1, 1.22], NAVY, [-1.6, 0.79, 0.12], [0, 0, 0], "lab-module");
  box([0.9, 0.1, 1.3], TRIM, [-1.6, 1.38, 0.12], [0, 0, 0], "lab-module-roof-trim");
  box([0.94, 0.13, 1.34], SNOW, [-1.6, 1.46, 0.12], [0, 0, 0], "lab-module-snow-roof");
  box([0.86, 0.08, 1.27], WALL_DARK, [-1.6, 0.27, 0.12], [0, 0, 0], "lab-module-foot");

  sideWindow(-2.025, 0.86, 0.12, 0.56, 0.44, "lab-side-window");
  frontWindow(-1.6, 0.78, 0.42, 0.4, 0.765, "lab-front-window");
  box([0.06, 1.0, 0.06], ORANGE, [-2.03, 0.82, 0.12], [0, 0, 0], "lab-corner-trim");
  box([0.92, 0.055, 0.055], TRIM, [-1.6, 1.32, 0.76], [0, 0, 0], "lab-front-lintel");

  // Small exterior instrument box attached to the lab.
  box([0.34, 0.38, 0.2], METAL_DARK, [-2.12, 0.62, 0.66], [0, 0, 0], "instrument-box");
  box([0.23, 0.21, 0.03], GLASS, [-2.12, 0.67, 0.77], [0, 0, 0], "instrument-display");
  cylinder(0.04, 0.025, RED, [-2.12, 0.47, 0.78], [90, 0, 0], 8, "instrument-button");

  // ---------------------------------------------------------------------------
  // Elevated service deck, generator, barrels, and fuel cache
  // ---------------------------------------------------------------------------

  box([1.0, 0.13, 0.95], WOOD, [1.62, 0.39, -0.12], [0, 0, 0], "service-deck");
  box([1.04, 0.08, 0.1], SNOW, [1.62, 0.49, 0.33], [0, 0, 0], "service-deck-snow-front");
  box([0.08, 0.45, 0.08], METAL_DARK, [1.25, 0.17, -0.42], [0, 0, 0], "deck-leg-front-left");
  box([0.08, 0.45, 0.08], METAL_DARK, [1.99, 0.17, -0.42], [0, 0, 0], "deck-leg-front-right");
  box([0.08, 0.45, 0.08], METAL_DARK, [1.25, 0.17, 0.18], [0, 0, 0], "deck-leg-back-left");
  box([0.08, 0.45, 0.08], METAL_DARK, [1.99, 0.17, 0.18], [0, 0, 0], "deck-leg-back-right");

  box([0.54, 0.3, 0.4], METAL_DARK, [1.63, 0.61, -0.1], [0, 0, 0], "generator");
  box([0.38, 0.1, 0.025], BLACK, [1.63, 0.76, 0.11], [0, 0, 0], "generator-top-vent");
  cylinder(0.09, 0.025, RED, [1.63, 0.72, 0.11], [90, 0, 0], 8, "generator-start-button");
  rod([1.88, 0.72, -0.1], [2.12, 0.72, -0.1], 0.018, CABLE, "generator-cable");

  barrel([2.18, 0.45, -0.1], RED, "red-fuel-drum");
  barrel([2.58, 0.43, -0.08], ORANGE, "orange-fuel-drum");
  box([0.72, 0.08, 0.08], TRIM, [2.38, 0.73, 0.22], [0, 0, 0], "fuel-cache-rail");

  // ---------------------------------------------------------------------------
  // Solar array on the right side
  // ---------------------------------------------------------------------------

  solarPanel([1.62, 0.96, -0.93], [-27, 0, 0], "solar-panel-near");
  solarPanel([2.45, 0.93, -0.83], [-27, 0, 0], "solar-panel-far");
  rod([1.0, 0.38, -0.9], [1.0, 1.02, -0.9], 0.025, METAL_DARK, "solar-array-brace");
  rod([2.85, 0.36, -0.82], [2.85, 1.0, -0.82], 0.025, METAL_DARK, "solar-array-brace-far");
  box([1.88, 0.06, 0.09], SNOW, [2.03, 0.38, -0.89], [0, 0, 0], "solar-array-snow-foot");

  // ---------------------------------------------------------------------------
  // Tall communications mast behind the station
  // ---------------------------------------------------------------------------

  const mastX = 0.92;
  const mastZ = -1.05;
  rod([mastX, 0.27, mastZ], [mastX, 2.72, mastZ], 0.035, METAL_DARK, "mast-center");
  rod([mastX - 0.23, 0.27, mastZ], [mastX, 2.72, mastZ], 0.022, METAL, "mast-left-brace");
  rod([mastX + 0.23, 0.27, mastZ], [mastX, 2.72, mastZ], 0.022, METAL, "mast-right-brace");
  rod([mastX - 0.23, 0.27, mastZ], [mastX + 0.23, 0.27, mastZ], 0.025, METAL_DARK, "mast-foot-crossbar");
  rod([mastX - 0.18, 0.82, mastZ], [mastX + 0.18, 0.82, mastZ], 0.018, METAL, "mast-brace-one");
  rod([mastX - 0.18, 1.52, mastZ], [mastX + 0.18, 1.52, mastZ], 0.018, METAL, "mast-brace-two");
  rod([mastX - 0.18, 2.18, mastZ], [mastX + 0.18, 2.18, mastZ], 0.018, METAL, "mast-brace-three");
  cylinder(0.07, 0.16, RED, [mastX, 2.82, mastZ], [0, 0, 0], 8, "mast-warning-beacon");
  cone(0.1, 0.12, SNOW, [mastX, 2.94, mastZ], [0, 0, 0], 6, "mast-snow-cap");

  // Satellite dish facing the viewer.
  b.part(new THREE.CircleGeometry(0.38, 12), PANEL, {
    at: [mastX, 2.43, mastZ - 0.05],
    dir: [0, 0, 1],
    axis: "z",
    name: "satellite-dish-face",
  });
  torus(0.38, 0.025, METAL, [mastX, 2.43, mastZ - 0.01], [0, 0, 0], "satellite-dish-rim");
  rod([mastX, 2.43, mastZ + 0.02], [mastX, 2.43, mastZ + 0.38], 0.018, METAL_DARK, "satellite-feed-arm");
  cone(0.065, 0.14, YELLOW, [mastX, 2.43, mastZ + 0.44], [90, 0, 0], 8, "satellite-feed");
  box([0.12, 0.1, 0.2], METAL_DARK, [mastX, 2.05, mastZ + 0.02], [0, 0, 0], "dish-motor-box");

  // Small colored expedition flag near the top of the mast.
  rod([mastX - 0.015, 2.69, mastZ], [mastX - 0.015, 3.08, mastZ], 0.012, METAL_DARK, "flagpole");
  b.extrude(
    [
      [0, 0],
      [0.48, -0.02],
      [0.48, 0.24],
      [0.12, 0.2],
      [0, 0.24],
    ],
    {
      at: [mastX, 2.98, mastZ + 0.015],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: TRIM,
      name: "station-flag",
    },
  );
  box([0.2, 0.035, 0.025], SNOW_LIGHT, [mastX + 0.25, 3.1, mastZ + 0.03], [0, 0, 0], "flag-white-stripe");

  // ---------------------------------------------------------------------------
  // Wind turbine to the left rear
  // ---------------------------------------------------------------------------

  const turbineX = -2.12;
  const turbineZ = -0.72;
  cylinder(0.085, 2.28, METAL_DARK, [turbineX, 1.37, turbineZ], [0, 0, 0], 8, "wind-turbine-tower");
  cylinder(0.14, 0.12, SNOW_BLUE, [turbineX, 0.26, turbineZ], [0, 0, 0], 8, "wind-turbine-foot");
  rod([turbineX, 0.3, turbineZ], [turbineX - 0.35, 0.16, turbineZ], 0.025, METAL, "turbine-foot-brace-left");
  rod([turbineX, 0.3, turbineZ], [turbineX + 0.35, 0.16, turbineZ], 0.025, METAL, "turbine-foot-brace-right");

  const rotorY = 2.52;
  const rotorZ = turbineZ + 0.02;
  cylinder(0.13, 0.22, METAL_DARK, [turbineX, rotorY, rotorZ], [90, 0, 0], 10, "turbine-hub");

  for (let i = 0; i < 3; i++) {
    const angle = i * 120 + 12;
    const rad = (angle * Math.PI) / 180;
    const bx = turbineX - Math.sin(rad) * 0.29;
    const by = rotorY + Math.cos(rad) * 0.29;
    box([0.11, 0.68, 0.055], i === 1 ? SNOW_LIGHT : ORANGE, [bx, by, rotorZ + 0.14], [0, 0, angle], `turbine-blade-${i}`);
    box([0.16, 0.08, 0.08], RED, [turbineX, rotorY, rotorZ + 0.17], [0, 0, 0], `turbine-hub-cap-${i}`);
  }

  box([0.45, 0.2, 0.35], METAL_DARK, [turbineX, 0.46, turbineZ], [0, 0, 0], "turbine-control-box");
  box([0.24, 0.08, 0.025], GLASS, [turbineX, 0.53, turbineZ + 0.18], [0, 0, 0], "turbine-control-screen");

  // ---------------------------------------------------------------------------
  // Snow fence and windbreak in the foreground left
  // ---------------------------------------------------------------------------

  const fencePosts: V[] = [
    [-2.45, 0.24, 1.17],
    [-1.95, 0.24, 1.2],
    [-1.46, 0.24, 1.17],
  ];

  for (let i = 0; i < fencePosts.length; i++) {
    const p = fencePosts[i];
    box([0.065, 0.82, 0.065], ORANGE, [p[0], p[1] + 0.41, p[2]], [0, 0, 0], `snow-fence-post-${i}`);
    cone(0.065, 0.11, RED, [p[0], 1.0, p[2]], [0, 0, 0], 6, `snow-fence-cap-${i}`);
  }

  rod([-2.45, 0.77, 1.17], [-1.46, 0.77, 1.17], 0.025, WOOD, "snow-fence-upper-rail");
  rod([-2.45, 0.48, 1.17], [-1.46, 0.48, 1.17], 0.025, WOOD, "snow-fence-lower-rail");
  box([0.92, 0.24, 0.035], SNOW_BLUE, [-1.96, 0.63, 1.16], [0, 0, 0], "snow-fence-slat");
  box([0.92, 0.11, 0.035], ICE, [-1.96, 0.43, 1.16], [0, 0, 0], "snow-fence-bottom-slat");

  // ---------------------------------------------------------------------------
  // Supply sled and expedition crates at the front right
  // ---------------------------------------------------------------------------

  box([1.03, 0.18, 0.58], RED, [1.55, 0.39, 1.35], [0, 0, 0], "supply-sled-bed");
  box([0.92, 0.1, 0.12], ORANGE, [1.55, 0.53, 1.35], [0, 0, 0], "supply-sled-rim");
  box([0.08, 0.27, 0.08], ORANGE, [1.1, 0.59, 1.35], [0, 0, 0], "sled-front-post");
  box([0.08, 0.27, 0.08], ORANGE, [2.0, 0.59, 1.35], [0, 0, 0], "sled-front-post-right");
  rod([1.03, 0.26, 1.58], [2.05, 0.26, 1.58], 0.035, METAL_DARK, "sled-runner-front");
  rod([1.03, 0.26, 1.12], [2.05, 0.26, 1.12], 0.035, METAL_DARK, "sled-runner-back");
  rod([1.03, 0.26, 1.58], [0.92, 0.34, 1.72], 0.027, METAL_DARK, "sled-runner-upturn-front");
  rod([2.05, 0.26, 1.58], [2.16, 0.34, 1.72], 0.027, METAL_DARK, "sled-runner-upturn-right");

  crate([1.38, 0.67, 1.35], [0.42, 0.38, 0.4], "sled-crate-one");
  crate([1.82, 0.66, 1.35], [0.36, 0.36, 0.4], "sled-crate-two");
  box([0.82, 0.055, 0.06], SNOW, [1.6, 0.91, 1.35], [0, 0, 0], "sled-crate-snow");

  // ---------------------------------------------------------------------------
  // Cargo crates beside the main cabin
  // ---------------------------------------------------------------------------

  crate([-0.78, 0.48, -1.0], [0.48, 0.42, 0.48], "rear-crate-low");
  crate([-0.77, 0.88, -1.0], [0.42, 0.34, 0.42], "rear-crate-high");
  box([0.08, 0.09, 0.58], SNOW, [-0.78, 1.07, -1.0], [0, 0, 0], "rear-crate-snow");
  crate([-1.24, 0.44, -1.16], [0.35, 0.34, 0.32], "rear-small-crate");

  // ---------------------------------------------------------------------------
  // Science equipment and meteorological instruments
  // ---------------------------------------------------------------------------

  // Weather mast on the front-right deck.
  rod([2.38, 0.29, 0.52], [2.38, 1.45, 0.52], 0.022, METAL_DARK, "weather-mast");
  rod([2.12, 1.23, 0.52], [2.64, 1.23, 0.52], 0.018, METAL, "weather-crossbar");
  cylinder(0.045, 0.11, RED, [2.38, 1.49, 0.52], [0, 0, 0], 8, "weather-sensor");
  rod([2.38, 1.43, 0.52], [2.38, 1.68, 0.52], 0.012, METAL, "weather-antenna");

  // Three tiny anemometer cups.
  for (let i = 0; i < 3; i++) {
    const angle = i * 120;
    const rad = (angle * Math.PI) / 180;
    const x = 2.38 + Math.cos(rad) * 0.16;
    const z = 0.52 + Math.sin(rad) * 0.16;
    box([0.07, 0.045, 0.1], SNOW_LIGHT, [x, 1.55, z], [0, angle, 0], `anemometer-cup-${i}`);
  }

  // Cylindrical sample canisters.
  cylinder(0.11, 0.42, METAL, [0.75, 0.48, 1.45], [0, 0, 0], 8, "sample-canister-one");
  cylinder(0.11, 0.42, RED, [1.0, 0.48, 1.45], [0, 0, 0], 8, "sample-canister-two");
  cylinder(0.11, 0.42, GLASS, [1.25, 0.48, 1.45], [0, 0, 0], 8, "sample-canister-three");
  box([0.72, 0.05, 0.47], DARK, [1.0, 0.69, 1.45], [0, 0, 0], "sample-canister-rack");

  // Pipe loop from the lab module to the generator.
  rod([-1.98, 0.52, 0.66], [-1.98, 0.36, 0.66], 0.018, CABLE, "lab-cable-drop");
  rod([-1.98, 0.36, 0.66], [1.32, 0.36, 0.2], 0.014, CABLE, "buried-service-cable");
  box([0.13, 0.12, 0.13], RED, [-0.65, 0.35, 0.47], [0, 0, 0], "service-junction-box");

  // ---------------------------------------------------------------------------
  // Snow drifts around structures
  // ---------------------------------------------------------------------------

  snowPatch([-1.2, 0.34, 0.98], [0.7, 0.22, 0.2], SNOW_LIGHT, "front-cabin-drift");
  snowPatch([0.45, 0.32, 1.02], [0.56, 0.18, 0.19], SNOW_LIGHT, "door-drift");
  snowPatch([1.88, 0.32, 0.63], [0.58, 0.18, 0.22], SNOW_BLUE, "equipment-drift");
  snowPatch([-2.32, 0.33, -0.15], [0.5, 0.2, 0.27], SNOW, "turbine-drift");
  snowPatch([2.65, 0.31, 1.3], [0.4, 0.18, 0.24], SNOW_LIGHT, "sled-drift");
  snowPatch([-0.1, 0.31, -1.62], [0.75, 0.2, 0.24], SNOW_BLUE, "back-drift");
  snowPatch([2.4, 0.31, -1.52], [0.42, 0.18, 0.25], SNOW, "panel-drift");

  // Low snow lip over the cabin foundation.
  box([2.5, 0.13, 0.2], SNOW_LIGHT, [0, 0.34, 1.0], [0, 0, 0], "front-snow-lip");
  box([2.45, 0.1, 0.17], SNOW_BLUE, [0, 0.29, 1.02], [0, 0, 0], "front-snow-shadow");

  // ---------------------------------------------------------------------------
  // Footprints and tracked paths
  // ---------------------------------------------------------------------------

  const footprints: Array<[number, number, number]> = [
    [0.88, 1.86, -8],
    [0.75, 1.68, -8],
    [0.82, 1.5, -8],
    [0.68, 1.32, -8],
    [0.7, 1.15, -8],
    [0.71, 0.99, -8],
    [0.56, 0.82, -8],
    [0.4, 0.68, -8],
    [0.26, 0.57, -8],
    [0.12, 0.48, -8],
    [-0.04, 0.39, -8],
  ];

  for (let i = 0; i < footprints.length; i++) {
    const [x, z, angle] = footprints[i];
    b.part(new THREE.CylinderGeometry(1, 1, 0.016, 8), ICE_DARK, {
      at: [x, 0.268, z],
      scale: [0.06, 1, 0.12],
      rotation: [0, 0, angle],
      flat: true,
      name: `boot-print-${i}`,
    });
  }

  const tracks: Array<[number, number]> = [
    [-2.45, -0.8],
    [-2.12, -0.92],
    [-1.8, -1.02],
    [-1.48, -1.08],
    [-1.15, -1.12],
  ];

  for (let i = 0; i < tracks.length; i++) {
    const [x, z] = tracks[i];
    box([0.24, 0.018, 0.09], ICE_SHADOW, [x, 0.269, z], [0, -12, 0], `equipment-track-${i}`);
    box([0.12, 0.02, 0.06], ICE_DARK, [x + 0.09, 0.271, z + 0.02], [0, -12, 0], `equipment-track-notch-${i}`);
  }

  // ---------------------------------------------------------------------------
  // Ice pinnacles and perimeter rocks
  // ---------------------------------------------------------------------------

  const perimeterRocks: Array<[V, V, string]> = [
    [[-2.75, 0.34, -1.65], [0.33, 0.28, 0.28], ICE_DARK],
    [[-1.9, 0.34, -1.94], [0.23, 0.22, 0.32], ICE],
    [[-0.86, 0.34, -2.0], [0.28, 0.25, 0.24], SNOW_BLUE],
    [[0.35, 0.34, -1.97], [0.24, 0.3, 0.25], ICE_DARK],
    [[1.7, 0.34, -1.92], [0.36, 0.24, 0.26], ICE],
    [[2.72, 0.34, -1.56], [0.3, 0.3, 0.24], ICE_DARK],
    [[2.91, 0.34, 0.12], [0.22, 0.24, 0.37], SNOW_BLUE],
    [[2.86, 0.34, 1.37], [0.36, 0.22, 0.25], ICE],
    [[-2.84, 0.34, 1.52], [0.3, 0.23, 0.27], ICE_DARK],
  ];

  for (let i = 0; i < perimeterRocks.length; i++) {
    const [at, scale, color] = perimeterRocks[i];
    icosphere(scale, color, at, `perimeter-rock-${i}`);
    if (i % 2 === 0) {
      cone(scale[0] * 0.46, scale[1] * 1.7, SNOW_LIGHT, [at[0] + 0.04, at[1] + scale[1] * 0.62, at[2]], [0, 0, 0], 5, `rock-snow-cap-${i}`);
    }
  }

  const iceSpikes: Array<[V, number, number]> = [
    [[-2.42, 0.31, -1.48], 0.32, 0.09],
    [[-1.68, 0.3, -1.73], 0.27, 0.075],
    [[0.55, 0.3, -1.7], 0.4, 0.08],
    [[2.55, 0.3, -1.28], 0.3, 0.085],
    [[2.52, 0.3, 1.72], 0.36, 0.09],
    [[-2.45, 0.3, 1.72], 0.28, 0.07],
  ];

  for (let i = 0; i < iceSpikes.length; i++) {
    const [at, h, r] = iceSpikes[i];
    cone(r, h, i % 2 === 0 ? ICE : SNOW_BLUE, [at[0], at[1] + h / 2, at[2]], [0, 0, 0], 5, `ice-spike-${i}`);
    box([r * 1.3, 0.025, r * 0.7], SNOW_LIGHT, [at[0], at[1] + h * 0.62, at[2] + 0.015], [0, 0, 0], `ice-spike-highlight-${i}`);
  }

  // ---------------------------------------------------------------------------
  // Hand-built little details that add scale and character
  // ---------------------------------------------------------------------------

  // Orange hazard stripes on the equipment deck.
  for (let i = 0; i < 5; i++) {
    box([0.09, 0.018, 0.16], YELLOW, [1.2 + i * 0.19, 0.47, 0.33], [0, 0, -35], `deck-hazard-stripe-${i}`);
  }

  // Two red emergency cases beside the cabin.
  box([0.34, 0.28, 0.25], RED, [-1.02, 0.44, 0.48], [0, 0, 0], "emergency-case-one");
  box([0.28, 0.23, 0.22], ORANGE, [-1.03, 0.68, 0.48], [0, 0, 0], "emergency-case-two");
  box([0.22, 0.035, 0.025], YELLOW, [-1.02, 0.59, 0.615], [0, 0, 0], "emergency-case-label");
  box([0.18, 0.035, 0.025], YELLOW, [-1.03, 0.77, 0.6], [0, 0, 0], "emergency-case-label-high");

  // A bright orange warning beacon above the entrance.
  cylinder(0.07, 0.08, METAL_DARK, [0.72, 1.43, 1.16], [0, 0, 0], 8, "entry-beacon-base");
  cylinder(0.06, 0.09, RED, [0.72, 1.52, 1.16], [0, 0, 0], 8, "entry-beacon");
  cone(0.065, 0.07, SNOW_LIGHT, [0.72, 1.61, 1.16], [0, 0, 0], 6, "entry-beacon-cap");

  // Small roof antenna on the cabin.
  rod([-0.1, 2.1, 0.22], [-0.1, 2.48, 0.22], 0.014, METAL_DARK, "cabin-radio-antenna");
  box([0.18, 0.07, 0.12], RED, [-0.1, 2.16, 0.22], [0, 0, 0], "cabin-radio-box");
  box([0.21, 0.06, 0.14], SNOW, [-0.1, 2.42, 0.22], [0, 0, 0], "cabin-radio-snow");

  // A few narrow blue ice seams on the island surface.
  box([1.05, 0.018, 0.035], ICE_DARK, [-2.0, 0.27, 0.15], [0, 0, -14], "ice-seam-one");
  box([0.75, 0.018, 0.035], ICE_DARK, [-2.25, 0.27, -0.16], [0, 0, 19], "ice-seam-two");
  box([0.95, 0.018, 0.035], ICE_DARK, [0.2, 0.27, -1.55], [0, 0, -8], "ice-seam-three");
  box([0.68, 0.018, 0.035], ICE_DARK, [2.12, 0.27, 1.66], [0, 0, 21], "ice-seam-four");

  // Snow-capped cable conduits emerging from the ground.
  rod([0.22, 0.27, -0.82], [0.22, 0.52, -0.82], 0.026, METAL_DARK, "cable-conduit");
  box([0.24, 0.07, 0.17], SNOW, [0.22, 0.56, -0.82], [0, 0, 0], "cable-conduit-snow");
  rod([0.22, 0.32, -0.82], [0.72, 0.36, -0.44], 0.014, CABLE, "cable-to-cabin");

  // Slightly raised orange survey stakes at the two front corners.
  marker([-2.72, 0.25, 0.76], "survey-marker-left");
  marker([2.72, 0.25, 0.78], "survey-marker-right");

  // A second, tiny sign on the service side.
  const smallSignTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50">
      <rect width="180" height="50" fill="#d26043"/>
      <text x="90" y="31" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="900" letter-spacing="2" fill="#173344">LAB / 03</text>
    </svg>`,
    { size: 180 },
  );

  b.part(new THREE.PlaneGeometry(0.52, 0.145), "#ffffff", {
    at: [-2.035, 1.13, 0.78],
    dir: [-1, 0, 0],
    axis: "z",
    texture: smallSignTexture,
    rotation: [0, 90, 0],
    name: "lab-sign",
  });

  // Finish with a few crisp snow tiles on the most visible props.
  box([0.44, 0.05, 0.34], SNOW_LIGHT, [1.38, 0.9, 1.35], [0, 0, 0], "sled-crate-cap-left");
  box([0.38, 0.045, 0.32], SNOW_LIGHT, [1.82, 0.87, 1.35], [0, 0, 0], "sled-crate-cap-right");
  box([0.52, 0.04, 0.15], SNOW_LIGHT, [2.18, 0.73, -0.1], [0, 0, 0], "fuel-drum-snow-left");
  box([0.46, 0.04, 0.15], SNOW_LIGHT, [2.58, 0.7, -0.08], [0, 0, 0], "fuel-drum-snow-right");

  return b.root;
}
