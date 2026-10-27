import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "arctic research outpost",
  description: "A stylized Firewatch-flat-colour arctic research station with snow base, elevated cabin, antenna mast, solar arrays, satellite dish, fuel drums, crates, flags, and equipment.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#edf4f2";
  const SNOW_SHADOW = "#c8d8dc";
  const SNOW_BLUE = "#a7c2cc";
  const ICE = "#8fc5d2";
  const SKY_BLUE = "#6f9eae";
  const WOOD = "#8b5a3b";
  const WOOD_DARK = "#543b35";
  const WOOD_LIGHT = "#b77b4d";
  const RED = "#c94c3d";
  const RED_DARK = "#7e3030";
  const ORANGE = "#d6813d";
  const YELLOW = "#e5bd55";
  const BLACK = "#202b31";
  const GLASS = "#213e4d";
  const GLASS_LIGHT = "#6dabb8";
  const METAL = "#5c6b70";
  const METAL_LIGHT = "#95a8aa";
  const STEEL_DARK = "#36454b";
  const SOLAR = "#244b67";
  const SOLAR_LIGHT = "#5f91a8";
  const SIGNAL = "#e05c47";
  const WHITE = "#ffffff";

  const rand = rng(17);

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
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
    dir?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    name?: string,
  ) => b.part(new THREE.SphereGeometry(radius, 8, 5), color, { at, name });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, z, radius, { color, name });

  const panel = (
    at: [number, number, number],
    size: [number, number],
    color: string,
    name: string,
  ) => {
    box([size[0], size[1], 0.018], BLACK, at, undefined, `${name}-back`);
    box([size[0] - 0.035, size[1] - 0.035, 0.012], color, [
      at[0],
      at[1],
      at[2] + 0.014,
    ], undefined, `${name}-face`);

    const cols = Math.max(2, Math.floor(size[0] / 0.22));
    const rows = Math.max(2, Math.floor(size[1] / 0.2));
    for (let i = 1; i < cols; i++) {
      box([0.009, size[1] - 0.04, 0.006], SOLAR_LIGHT, [
        at[0] - size[0] / 2 + (size[0] * i) / cols,
        at[1],
        at[2] + 0.022,
      ], undefined, `${name}-v${i}`);
    }
    for (let j = 1; j < rows; j++) {
      box([size[0] - 0.04, 0.009, 0.006], SOLAR_LIGHT, [
        at[0],
        at[1] - size[1] / 2 + (size[1] * j) / rows,
        at[2] + 0.023,
      ], undefined, `${name}-h${j}`);
    }
  };

  // Snow island and layered wind-carved drifts.
  box([8.8, 0.18, 6.5], SNOW_SHADOW, [0, 0.09, 0], undefined, "snow-island");
  box([8.1, 0.12, 5.8], SNOW, [0, 0.22, 0.08], undefined, "snow-top");
  box([3.5, 0.2, 1.8], SNOW_SHADOW, [-2.35, 0.31, -1.55], [0, 0.12, -0.04], "drift-west");
  box([2.6, 0.16, 1.25], SNOW, [-2.5, 0.48, -1.67], [0, -0.08, 0.08], "drift-west-cap");
  box([2.8, 0.2, 1.5], SNOW_SHADOW, [3.05, 0.32, 1.85], [0, -0.15, 0.08], "drift-east");
  box([2.25, 0.14, 1.15], SNOW, [3.1, 0.49, 1.89], [0, 0.1, -0.06], "drift-east-cap");
  box([1.7, 0.18, 1.0], SNOW_BLUE, [-3.35, 0.3, 1.8], [0, 0.2, 0], "blue-ice-bank");
  box([1.25, 0.08, 0.68], ICE, [-3.45, 0.44, 1.82], [0, 0.18, 0], "blue-ice-top");

  // Raised wooden service platform.
  box([4.9, 0.18, 3.2], WOOD_DARK, [0, 0.62, 0], undefined, "platform-shadow");
  box([4.72, 0.13, 3.04], WOOD, [0, 0.78, 0], undefined, "platform-deck");
  for (let x = -2; x <= 2; x += 0.4) {
    box([0.025, 0.025, 3.0], WOOD_LIGHT, [x, 0.86, 0], undefined, "deck-board");
  }
  for (const x of [-2.15, 2.15]) {
    for (const z of [-1.22, 1.22]) {
      box([0.25, 0.58, 0.25], WOOD_DARK, [x, 0.38, z], undefined, "platform-leg");
      box([0.42, 0.08, 0.42], WOOD, [x, 0.08, z], undefined, "leg-foot");
      box([0.38, 0.12, 0.3], SNOW_SHADOW, [x, 0.17, z], undefined, "snow-packed-foot");
    }
  }
  for (const x of [-1.1, 0, 1.1]) {
    box([0.12, 0.52, 0.14], WOOD_LIGHT, [x, 0.42, -1.43], undefined, "front-brace");
  }
  rod([-2.15, 0.32, -1.22], [2.15, 0.72, -1.22], 0.045, WOOD_DARK, "front-crossbeam");
  rod([-2.15, 0.32, 1.22], [2.15, 0.72, 1.22], 0.045, WOOD_DARK, "rear-crossbeam");

  // Main research cabin.
  box([3.55, 2.02, 2.25], WOOD, [0, 1.82, 0.05], undefined, "main-cabin");
  box([3.62, 0.16, 2.32], WOOD_DARK, [0, 2.84, 0.05], [0.02, 0, 0], "cabin-eave");
  box([3.0, 0.32, 2.05], RED_DARK, [0, 3.12, 0.05], [0, 0, 0], "cabin-roof");
  box([2.55, 0.12, 1.85], RED, [0, 3.33, 0.05], [0, 0, 0], "roof-snow-shadow");
  box([2.35, 0.09, 1.7], SNOW, [0, 3.43, 0.05], [0.02, 0, 0], "roof-snow");
  box([1.1, 0.12, 2.38], WOOD_LIGHT, [-1.24, 2.02, 0.05], undefined, "cabin-left-plank");
  box([0.11, 1.72, 2.3], WOOD_DARK, [0, 1.91, -1.09], undefined, "rear-siding");
  for (let y = 1.12; y <= 2.65; y += 0.27) {
    box([3.25, 0.025, 0.025], WOOD_LIGHT, [0, y, 1.185], undefined, "front-siding-line");
  }
  for (let x = -1.55; x <= 1.55; x += 0.38) {
    box([0.026, 1.84, 0.026], WOOD_LIGHT, [x, 1.88, 1.185], undefined, "front-siding-vertical");
  }

  // Front windows, frames and warm interior glow.
  for (const x of [-0.96, 0.96]) {
    box([0.9, 0.72, 0.045], WOOD_DARK, [x, 2.12, 1.19], undefined, "window-frame");
    box([0.73, 0.55, 0.018], GLASS, [x, 2.12, 1.218], undefined, "window-glass");
    box([0.025, 0.56, 0.025], WOOD_LIGHT, [x, 2.12, 1.24], undefined, "window-mullion");
    box([0.74, 0.025, 0.025], WOOD_LIGHT, [x, 2.12, 1.24], undefined, "window-crossbar");
    box([0.12, 0.48, 0.008], GLASS_LIGHT, [x - 0.2, 2.15, 1.246], undefined, "window-reflection");
  }
  box([0.72, 1.18, 0.05], WOOD_DARK, [0, 1.55, 1.2], undefined, "front-door-frame");
  box([0.56, 1.02, 0.026], RED_DARK, [0, 1.55, 1.24], undefined, "front-door");
  box([0.08, 0.1, 0.04], YELLOW, [0.2, 1.58, 1.29], undefined, "door-handle");
  box([0.9, 0.11, 0.14], SNOW, [0, 0.92, 1.28], undefined, "door-step-snow");

  // Side windows and snow shutters.
  for (const z of [-0.55, 0.55]) {
    box([0.05, 0.56, 0.68], WOOD_DARK, [1.8, 2.1, z], undefined, "side-window-frame");
    box([0.018, 0.42, 0.53], GLASS, [1.832, 2.1, z], undefined, "side-window");
    box([0.02, 0.035, 0.51], GLASS_LIGHT, [1.846, 2.27, z], undefined, "side-window-glint");
  }
  box([0.12, 0.88, 0.12], SNOW, [1.84, 2.65, -0.55], undefined, "side-snow-lip");
  box([0.12, 0.88, 0.12], SNOW, [1.84, 2.65, 0.55], undefined, "side-snow-lip");

  // Chimney and weather hood.
  box([0.26, 0.75, 0.26], STEEL_DARK, [0.92, 3.7, -0.45], undefined, "chimney");
  box([0.39, 0.12, 0.39], METAL, [0.92, 4.08, -0.45], undefined, "chimney-cap");
  box([0.48, 0.08, 0.48], SNOW, [0.92, 4.15, -0.45], undefined, "chimney-snow");

  // Rear annex / generator hut.
  box([1.65, 1.28, 1.45], WOOD_DARK, [-2.55, 1.48, -0.15], undefined, "annex");
  box([1.8, 0.14, 1.58], RED_DARK, [-2.55, 2.18, -0.15], undefined, "annex-roof");
  box([1.46, 0.13, 1.27], SNOW, [-2.55, 2.31, -0.15], undefined, "annex-snow");
  box([0.52, 0.8, 0.04], BLACK, [-2.55, 1.48, 0.59], undefined, "annex-door");
  box([0.33, 0.3, 0.03], GLASS, [-2.55, 1.8, 0.62], undefined, "annex-window");
  box([0.11, 0.08, 0.08], YELLOW, [-2.28, 1.48, 0.64], undefined, "annex-handle");
  rod([-2.55, 2.38, -0.15], [-2.55, 2.72, -0.15], 0.04, STEEL_DARK, "annex-vent");
  box([0.46, 0.1, 0.46], SNOW_SHADOW, [-2.55, 2.75, -0.15], undefined, "annex-vent-snow");

  // Exterior emergency light and wall placard.
  box([0.18, 0.18, 0.08], BLACK, [1.65, 2.58, 1.22], undefined, "lamp-back");
  box([0.12, 0.12, 0.05], YELLOW, [1.65, 2.58, 1.28], undefined, "lamp-glow");
  box([0.5, 0.22, 0.03], BLACK, [-1.45, 2.62, 1.23], undefined, "station-sign");
  box([0.39, 0.11, 0.012], YELLOW, [-1.45, 2.62, 1.25], undefined, "station-sign-face");

  // Walkway off the platform into the snow.
  for (let i = 0; i < 7; i++) {
    const z = 1.75 + i * 0.38;
    box([1.0 - i * 0.07, 0.09, 0.28], WOOD, [0, 0.72 - i * 0.055, z], [0.02, 0, 0], "snow-walkway");
    box([0.74 - i * 0.05, 0.025, 0.05], SNOW, [0, 0.79 - i * 0.055, z + 0.12], undefined, "walkway-snow");
  }

  // Tall radio mast behind the cabin.
  const mastX = 1.95;
  const mastZ = -0.85;
  rod([mastX, 0.86, mastZ], [mastX, 5.0, mastZ], 0.045, STEEL_DARK, "radio-mast");
  rod([mastX - 0.35, 0.9, mastZ], [mastX, 4.8, mastZ], 0.025, METAL, "mast-brace-a");
  rod([mastX + 0.35, 0.9, mastZ], [mastX, 4.8, mastZ], 0.025, METAL, "mast-brace-b");
  rod([mastX - 0.35, 0.9, mastZ], [mastX + 0.35, 0.9, mastZ], 0.025, METAL, "mast-foot-bar");
  for (let y = 1.35; y < 4.75; y += 0.55) {
    rod([mastX - 0.2, y, mastZ], [mastX + 0.2, y, mastZ], 0.018, METAL_LIGHT, "mast-rung");
  }
  box([0.32, 0.12, 0.32], SNOW, [mastX, 5.08, mastZ], undefined, "mast-snow-cap");
  rod([mastX, 5.05, mastZ], [mastX, 5.55, mastZ], 0.018, METAL, "antenna-tip");
  sphere(0.07, RED, [mastX, 5.56, mastZ], "aviation-beacon");
  box([0.75, 0.07, 0.06], BLACK, [mastX, 3.76, mastZ + 0.02], undefined, "radio-crossarm");
  for (const x of [mastX - 0.27, mastX + 0.27]) {
    sphere(0.055, RED, [x, 3.76, mastZ + 0.02], "radio-insulator");
  }
  rod([mastX, 3.76, mastZ], [mastX, 2.95, mastZ + 0.5], 0.012, BLACK, "radio-cable");

  // Solar array on the left, tilted toward the sky.
  const solarY = 2.18;
  const solarZ = -1.92;
  for (const x of [-1.75, -0.88]) {
    rod([x, 0.93, -1.55], [x, solarY, solarZ], 0.035, METAL, "solar-leg");
    rod([x - 0.38, 0.93, -1.55], [x + 0.38, 0.93, -1.55], 0.025, METAL_DARK, "solar-foot");
    panel([x, solarY, solarZ], [0.72, 1.18], SOLAR, "solar-panel");
  }
  rod([-2.2, solarY, solarZ], [-0.45, solarY, solarZ], 0.035, METAL, "solar-rail");
  box([0.42, 0.12, 0.3], BLACK, [-1.28, 1.02, -1.48], undefined, "solar-controller");
  box([0.24, 0.06, 0.18], YELLOW, [-1.28, 1.1, -1.65], undefined, "controller-light");

  // Satellite dish assembly on the right rear.
  const dishX = 2.35;
  const dishZ = 1.2;
  rod([dishX, 0.88, dishZ], [dishX, 2.05, dishZ], 0.06, STEEL_DARK, "dish-pole");
  box([0.48, 0.12, 0.48], SNOW_SHADOW, [dishX, 0.84, dishZ], undefined, "dish-foot");
  cyl(0.62, 0.12, METAL, [dishX, 2.15, dishZ], 12, [0, 1, 0], "dish-rim");
  // A broad shallow cone reads as a graphic satellite dish.
  b.part(new THREE.ConeGeometry(0.7, 0.25, 12, 1, true), METAL_LIGHT, {
    at: [dishX, 2.3, dishZ],
    dir: [0.15, 0.8, 0.55],
    name: "satellite-dish",
  });
  rod([dishX, 2.3, dishZ], [dishX + 0.12, 2.9, dishZ + 0.38], 0.025, BLACK, "dish-feed-arm");
  sphere(0.075, RED, [dishX + 0.12, 2.9, dishZ + 0.38], "dish-feed");
  box([0.16, 0.1, 0.16], SNOW, [dishX, 2.5, dishZ], undefined, "dish-snow");

  // Fuel drums and orange emergency sled beside the annex.
  for (let i = 0; i < 3; i++) {
    const x = -3.48 + i * 0.38;
    cyl(0.19, 0.52, ORANGE, [x, 0.76, -0.45], 10, [1, 0, 0], "fuel-drum");
    cyl(0.13, 0.012, YELLOW, [x, 1.03, -0.45], 10, [1, 0, 0], "fuel-cap");
    box([0.025, 0.38, 0.025], RED_DARK, [x, 0.76, -0.66], undefined, "drum-stripe");
  }
  box([1.3, 0.12, 0.68], RED, [-3.2, 0.55, -1.03], undefined, "equipment-sled");
  box([1.12, 0.16, 0.48], RED_DARK, [-3.2, 0.68, -1.03], undefined, "sled-load");
  for (const x of [-3.68, -2.72]) {
    rod([x, 0.45, -1.34], [x, 0.45, -0.82], 0.035, METAL, "sled-runner");
  }
  rod([-3.7, 0.58, -1.34], [-2.7, 0.58, -1.34], 0.035, METAL, "sled-runner-front");

  // Stacked shipping crates.
  box([0.72, 0.6, 0.65], WOOD_LIGHT, [3.25, 0.73, -0.55], undefined, "crate-low");
  box([0.72, 0.025, 0.04], WOOD_DARK, [3.25, 0.75, -0.89], undefined, "crate-line");
  box([0.72, 0.025, 0.04], WOOD_DARK, [3.25, 0.75, -0.22], undefined, "crate-line");
  box([0.55, 0.52, 0.5], WOOD, [3.32, 1.27, -0.56], [0, -0.08, 0], "crate-high");
  for (const y of [1.03, 1.52]) {
    box([0.58, 0.025, 0.025], WOOD_DARK, [3.32, y, -0.81], undefined, "crate-band");
  }
  box([0.28, 0.2, 0.02], YELLOW, [3.32, 1.3, -0.82], undefined, "crate-label");

  // Weather instruments and small field beacon.
  rod([3.35, 0.9, 0.25], [3.35, 2.2, 0.25], 0.025, METAL, "weather-pole");
  box([0.42, 0.12, 0.12], METAL_LIGHT, [3.35, 2.23, 0.25], undefined, "wind-vane");
  rod([3.12, 2.23, 0.25], [3.58, 2.23, 0.25], 0.014, METAL, "wind-vane-arm");
  sphere(0.055, RED, [3.58, 2.23, 0.25], "wind-vane-tail");
  for (const s of [-1, 1]) {
    rod([3.35, 1.7, 0.25], [3.35 + s * 0.25, 1.92, 0.25], 0.018, METAL, "anemometer-arm");
    sphere(0.075, RED, [3.35 + s * 0.25, 1.92, 0.25], "anemometer-cup");
  }
  box([0.22, 0.72, 0.22], RED_DARK, [3.72, 0.58, 1.78], undefined, "field-beacon");
  box([0.13, 0.18, 0.03], YELLOW, [3.72, 0.78, 1.9], undefined, "beacon-light");
  box([0.34, 0.08, 0.34], SNOW, [3.72, 0.98, 1.78], undefined, "beacon-snow");

  // Two tall orange-and-white marker poles.
  for (const x of [-3.95, 3.95]) {
    rod([x, 0.25, 0.1], [x, 2.25, 0.1], 0.035, ORANGE, "marker-pole");
    box([0.13, 0.42, 0.13], WHITE, [x, 1.15, 0.1], undefined, "marker-white-band");
    box([0.3, 0.14, 0.3], SNOW, [x, 2.32, 0.1], undefined, "marker-snow");
    box([0.26, 0.06, 0.26], RED, [x, 2.4, 0.1], undefined, "marker-cap");
  }

  // Wind sock on a short boom.
  rod([-3.15, 0.95, 1.95], [-3.15, 2.0, 1.95], 0.027, METAL, "windsock-pole");
  rod([-3.15, 1.98, 1.95], [-2.6, 1.98, 1.95], 0.022, METAL, "windsock-boom");
  b.part(new THREE.ConeGeometry(0.2, 0.75, 8, 1, true), RED, {
    at: [-2.27, 1.98, 1.95],
    dir: [1, 0, 0],
    name: "windsock",
  });
  box([0.08, 0.08, 0.08], WHITE, [-2.62, 1.98, 1.95], undefined, "windsock-ring");

  // Graphic snow strips on roof and ledges.
  box([3.0, 0.07, 0.18], SNOW, [0, 2.98, 1.16], undefined, "front-eave-snow");
  box([3.0, 0.08, 0.18], SNOW_SHADOW, [0, 2.93, -1.08], undefined, "rear-eave-snow");
  box([0.24, 0.12, 2.2], SNOW, [-1.79, 2.82, 0.05], undefined, "left-eave-snow");
  box([0.24, 0.12, 2.2], SNOW, [1.79, 2.82, 0.05], undefined, "right-eave-snow");

  // Cable reels, tool case, and a small radio box on the deck.
  cyl(0.25, 0.18, WOOD_DARK, [1.15, 0.99, 1.05], 10, [0, 1, 0], "cable-reel");
  cyl(0.19, 0.2, BLACK, [1.15, 0.99, 1.16], 10, [0, 1, 0], "cable-reel-core");
  rod([0.92, 0.99, 1.05], [1.38, 0.99, 1.05], 0.025, WOOD_LIGHT, "reel-axle");
  box([0.58, 0.3, 0.38], STEEL_DARK, [1.62, 1.02, 1.05], undefined, "tool-case");
  box([0.35, 0.05, 0.24], YELLOW, [1.62, 1.19, 1.05], undefined, "tool-case-latch");
  box([0.46, 0.32, 0.32], BLACK, [-1.35, 0.99, 0.98], undefined, "radio-case");
  box([0.26, 0.08, 0.02], RED, [-1.35, 1.18, 1.15], undefined, "radio-display");
  rod([-1.35, 1.18, 1.15], [-1.12, 1.6, 1.15], 0.012, BLACK, "radio-antenna");

  // Flags: one station pennant and one wind warning flag.
  rod([-0.2, 0.86, -1.5], [-0.2, 2.3, -1.5], 0.018, METAL, "flagpole");
  box([0.62, 0.27, 0.015], RED, [0.08, 2.14, -1.5], [0, 0.03, -0.02], "station-flag");
  box([0.27, 0.1, 0.018], WHITE, [-0.02, 2.14, -1.515], undefined, "station-flag-mark");
  rod([2.95, 0.86, -1.45], [2.95, 2.15, -1.45], 0.018, METAL, "warning-flagpole");
  box([0.72, 0.3, 0.015], ORANGE, [3.3, 1.98, -1.45], [0, -0.08, 0], "warning-flag");
  box([0.16, 0.28, 0.018], WHITE, [3.16, 1.98, -1.465], undefined, "warning-mark");

  // A few angular snow rocks to break the foreground silhouette.
  const rocks: Array<[number, number, number, number, number, number]> = [
    [-3.75, 0.42, -2.15, 0.42, 0.28, 0.32],
    [-3.25, 0.38, 2.35, 0.5, 0.24, 0.3],
    [3.68, 0.45, -2.18, 0.52, 0.3, 0.38],
    [3.65, 0.39, 2.45, 0.38, 0.24, 0.32],
    [-1.25, 0.36, 2.45, 0.3, 0.18, 0.28],
    [1.2, 0.35, 2.35, 0.34, 0.2, 0.25],
  ];
  for (const [x, y, z, sx, sy, sz] of rocks) {
    box([sx, sy, sz], SNOW_BLUE, [x, y, z], [0.08, rand() * 0.4, -0.08], "snow-rock");
    box([sx * 0.7, sy * 0.28, sz * 0.72], SNOW, [
      x - sx * 0.05,
      y + sy * 0.55,
      z + sz * 0.05,
    ], [0.08, 0.1, 0], "snow-rock-cap");
  }

  // Dark blue ice seams in the foreground.
  box([1.8, 0.025, 0.06], ICE, [-1.9, 0.31, 2.52], [0, 0.18, 0], "ice-seam");
  box([1.2, 0.025, 0.05], ICE, [0.1, 0.32, 2.67], [0, -0.1, 0], "ice-seam");
  box([1.45, 0.025, 0.05], ICE, [2.15, 0.31, 2.48], [0, 0.24, 0], "ice-seam");

  return b.root;
}
