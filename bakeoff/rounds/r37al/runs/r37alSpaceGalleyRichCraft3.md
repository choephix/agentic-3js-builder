```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A dense retro-futurist spaceship galley kitchen inspired by 1979 industrial spacecraft interiors: olive cabinets, ribbed metal, oven, sink, pipes, gauges, warning labels and overhead storage.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const OLIVE = panelled(metal("iron", { tarnish: 0.52, verdigris: 0.08, size: 0.18 }), {
    size: 0.18,
    aspect: 0.7,
    rivets: 0.055,
  });
  const OLIVE_DARK = metal("iron", { tarnish: 0.8, verdigris: 0.15, size: 0.12 });
  const STEEL = metal("steel", { tarnish: 0.28, polish: 0.32, size: 0.1 });
  const BRASS = metal("brass", { tarnish: 0.44, verdigris: 0.12, size: 0.09 });
  const COPPER = metal("copper", { tarnish: 0.35, verdigris: 0.4, size: 0.07 });

  const BLACK = "#141719";
  const RUBBER = "#252728";
  const CREAM = "#b9b394";
  const RED = "#8d3026";
  const AMBER = "#d68d32";
  const GREEN = "#66794b";
  const GLASS = "#52605b";
  const WHITE = "#d4d1bd";

  const warning = svg(
    `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="96" fill="#171817"/>
      <rect x="4" y="4" width="248" height="88" fill="#b7aa76" stroke="#161817" stroke-width="8"/>
      <path d="M18 76 L48 20 L78 76Z" fill="#25221b"/>
      <path d="M48 36 L48 57 M48 66 L48 70" stroke="#d4c990" stroke-width="8"/>
      <text x="91" y="42" font-family="monospace" font-size="25" font-weight="bold" fill="#1a1a17">CAUTION</text>
      <text x="91" y="69" font-family="monospace" font-size="16" fill="#1a1a17">HOT SURFACE</text>
    </svg>`,
    { size: 256 },
  );

  const galleyLabel = svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#252726"/>
      <path d="M8 8H248V56H8Z" fill="none" stroke="#a99f78" stroke-width="4"/>
      <text x="128" y="42" text-anchor="middle" font-family="monospace" font-size="25" letter-spacing="5" fill="#c1b98d">GALLEY 02</text>
    </svg>`,
    { size: 256 },
  );

  const panelLabel = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#262a29"/>
      <circle cx="64" cy="64" r="47" fill="#aaa27d" stroke="#101212" stroke-width="7"/>
      <path d="M64 64 L91 39" stroke="#8e3026" stroke-width="6"/>
      <circle cx="64" cy="64" r="7" fill="#161817"/>
      <path d="M64 20V27 M108 64H101 M64 108V101 M20 64H27" stroke="#1e211f" stroke-width="4"/>
      <text x="64" y="91" text-anchor="middle" font-family="monospace" font-size="13" fill="#171817">PRESS</text>
    </svg>`,
    { size: 192 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name?: string,
    opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    name?: string,
  ) => b.rod(a, z, radius, { color, name, sides: 8 });

  const button = (
    at: [number, number, number],
    color: any,
    r = 0.018,
    name = "button",
  ) => cyl(r, 0.018, at, color, [0, 0, 1], 8, name);

  // Floor plinth and rear wall.
  box([3.2, 0.12, 0.82], [0, 0.06, 0], BLACK, "floorPlinth");
  box([3.1, 1.92, 0.09], [0, 1.02, -0.39], OLIVE_DARK, "rearBulkhead");
  box([3.12, 0.09, 0.82], [0, 1.86, 0], OLIVE_DARK, "topCap");
  box([3.18, 0.08, 0.82], [0, 0.18, 0], STEEL, "toeKick");

  // Lower cabinet carcasses.
  box([0.78, 0.78, 0.72], [-1.12, 0.58, 0], OLIVE, "lowerLeft");
  box([0.78, 0.78, 0.72], [-0.28, 0.58, 0], OLIVE, "lowerOven");
  box([0.78, 0.78, 0.72], [0.56, 0.58, 0], OLIVE, "lowerSink");
  box([0.78, 0.78, 0.72], [1.40, 0.58, 0], OLIVE, "lowerRight");

  // Countertop, edge rails, and backsplash.
  box([3.06, 0.13, 0.78], [0, 1.03, 0.01], STEEL, "countertop");
  box([3.12, 0.07, 0.08], [0, 1.08, 0.40], BRASS, "counterFrontRail");
  box([3.0, 0.38, 0.08], [0, 1.26, -0.38], OLIVE_DARK, "backsplash");
  rod([-1.48, 1.18, -0.31], [1.48, 1.18, -0.31], 0.018, BRASS, "backsplashPipe");

  // Cabinet face plates, seams, and handles.
  for (const x of [-1.12, -0.28, 0.56, 1.40]) {
    box([0.68, 0.60, 0.035], [x, 0.60, 0.382], OLIVE_DARK, "lowerDoor");
    rod([x - 0.19, 0.68, 0.415], [x + 0.19, 0.68, 0.415], 0.014, BRASS, "lowerHandle");
    cyl(0.025, 0.018, [x - 0.29, 0.84, 0.417], BRASS, [0, 0, 1], 8, "doorRivet");
    cyl(0.025, 0.018, [x + 0.29, 0.84, 0.417], BRASS, [0, 0, 1], 8, "doorRivet");
    rod([x - 0.31, 0.31, 0.415], [x + 0.31, 0.31, 0.415], 0.008, STEEL, "doorSeam");
  }

  // Oven assembly in the second bay.
  box([0.64, 0.47, 0.045], [-0.28, 0.65, 0.425], BLACK, "ovenDoor");
  box([0.56, 0.38, 0.018], [-0.28, 0.65, 0.451], GLASS, "ovenWindow");
  box([0.68, 0.055, 0.055], [-0.28, 0.91, 0.43], STEEL, "ovenControlBar");
  rod([-0.48, 0.91, 0.47], [-0.08, 0.91, 0.47], 0.012, BRASS, "ovenHandle");
  for (const x of [-0.48, -0.34, -0.20, -0.06]) {
    button([x, 0.99, 0.45], x === -0.34 ? RED : AMBER, 0.022, "ovenButton");
  }
  box([0.56, 0.025, 0.18], [-0.28, 0.47, 0.46], BLACK, "ovenVent");

  // Sink basin with thick industrial rim.
  box([0.53, 0.08, 0.39], [0.56, 1.115, 0.02], BLACK, "sinkOpening");
  box([0.43, 0.07, 0.29], [0.56, 1.13, 0.02], STEEL, "sinkBasin");
  rod([0.27, 1.18, -0.19], [0.85, 1.18, -0.19], 0.018, BRASS, "sinkRimFront");
  rod([0.27, 1.18, 0.23], [0.85, 1.18, 0.23], 0.018, BRASS, "sinkRimBack");
  rod([0.27, 1.18, -0.19], [0.27, 1.18, 0.23], 0.018, BRASS, "sinkRimSide");
  rod([0.85, 1.18, -0.19], [0.85, 1.18, 0.23], 0.018, BRASS, "sinkRimSide");
  cyl(0.035, 0.018, [0.56, 1.18, 0.02], RUBBER, [0, 1, 0], 10, "drain");

  // Faucet: angular neck and dual handles.
  rod([0.56, 1.17, -0.28], [0.56, 1.43, -0.28], 0.025, COPPER, "faucetStem");
  rod([0.56, 1.43, -0.28], [0.56, 1.43, -0.04], 0.025, COPPER, "faucetArm");
  rod([0.56, 1.43, -0.04], [0.56, 1.36, 0.01], 0.022, COPPER, "faucetSpout");
  for (const x of [0.40, 0.72]) {
    cyl(0.035, 0.08, [x, 1.18, -0.25], BRASS);
    sphere(0.045, [x, 1.24, -0.25], RED, "faucetKnob");
  }

  // Right-side prep appliance and stacked drawers.
  box([0.64, 0.33, 0.49], [1.40, 1.25, 0.02], OLIVE_DARK, "prepMachine");
  box([0.48, 0.22, 0.04], [1.40, 1.27, 0.28], BLACK, "prepMachineScreen");
  button([1.24, 1.29, 0.31], GREEN, 0.025, "prepLamp");
  button([1.54, 1.29, 0.31], RED, 0.025, "prepLamp");
  rod([1.20, 1.14, 0.34], [1.60, 1.14, 0.34], 0.012, BRASS, "prepHandle");
  box([1.03, 0.07, 0.54], [1.40, 1.47, 0.03], STEEL, "prepTop");

  // Upper cupboards.
  box([0.78, 0.46, 0.24], [-1.12, 1.55, -0.25], OLIVE, "upperLeft");
  box([0.78, 0.46, 0.24], [-0.28, 1.55, -0.25], OLIVE, "upperCenter");
  box([0.78, 0.46, 0.24], [0.56, 1.55, -0.25], OLIVE, "upperRight");
  for (const x of [-1.12, -0.28, 0.56]) {
    box([0.67, 0.34, 0.025], [x, 1.55, -0.11], OLIVE_DARK, "upperDoor");
    rod([x - 0.16, 1.41, -0.08], [x + 0.16, 1.41, -0.08], 0.012, BRASS, "upperHandle");
    sphere(0.022, [x - 0.29, 1.70, -0.08], BRASS, "upperRivet");
    sphere(0.022, [x + 0.29, 1.70, -0.08], BRASS, "upperRivet");
  }

  // Open shelf under the upper cupboards.
  rod([-1.50, 1.30, -0.28], [1.48, 1.30, -0.28], 0.025, STEEL, "shelfFront");
  rod([-1.43, 1.30, -0.35], [1.43, 1.30, -0.35], 0.018, BRASS, "shelfBack");
  box([2.83, 0.045, 0.38], [0, 1.34, -0.30], BLACK, "shelfBoard");

  // Cans and ration tins on shelf.
  const tins = [
    [-1.16, RED],
    [-0.96, CREAM],
    [-0.72, GREEN],
    [-0.46, BRASS],
    [0.88, RED],
    [1.08, CREAM],
    [1.28, GREEN],
  ] as const;
  for (const [x, c] of tins) {
    cyl(0.065, 0.21, [x, 1.47, -0.29], c, [0, 1, 0], 8, "rationTin");
    cyl(0.068, 0.008, [x, 1.58, -0.29], STEEL, [0, 1, 0], 8, "tinLid");
    rod([x - 0.035, 1.43, -0.355], [x + 0.035, 1.43, -0.355], 0.006, BLACK, "tinBand");
  }

  // Tall left-side pressure panel.
  box([0.38, 0.48, 0.045], [-1.29, 1.42, 0.405], BLACK, "pressurePanel");
  b.part(new THREE.PlaneGeometry(0.27, 0.27), WHITE, {
    at: [-1.29, 1.52, 0.433],
    dir: [0, 0, 1],
    axis: "z",
    texture: panelLabel,
    name: "pressureGauge",
  });
  for (const [x, y, c] of [
    [-1.43, 1.22, RED],
    [-1.29, 1.22, AMBER],
    [-1.15, 1.22, GREEN],
  ] as const) {
    button([x, y, 0.435], c, 0.027, "statusLamp");
  }
  rod([-1.43, 1.11, 0.43], [-1.15, 1.11, 0.43], 0.008, BRASS, "panelSlot");

  // Right bulkhead labels.
  b.part(new THREE.PlaneGeometry(0.63, 0.23), WHITE, {
    at: [1.03, 1.79, -0.335],
    dir: [0, 0, 1],
    axis: "z",
    texture: galleyLabel,
    name: "galleyLabel",
  });
  b.part(new THREE.PlaneGeometry(0.70, 0.26), WHITE, {
    at: [1.08, 1.07, 0.424],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
    name: "hotWarning",
  });

  // Overhead pipe manifold: the signature Nostromo industrial clutter.
  rod([-1.43, 1.84, -0.30], [1.43, 1.84, -0.30], 0.035, STEEL, "overheadPipe");
  rod([-1.37, 1.68, -0.34], [-1.37, 1.84, -0.34], 0.025, COPPER, "pipeDrop");
  rod([-0.80, 1.68, -0.34], [-0.80, 1.84, -0.34], 0.020, BRASS, "pipeDrop");
  rod([0.76, 1.68, -0.34], [0.76, 1.84, -0.34], 0.022, COPPER, "pipeDrop");
  rod([1.33, 1.68, -0.34], [1.33, 1.84, -0.34], 0.018, BRASS, "pipeDrop");
  for (const x of [-1.37, -0.80, 0.76, 1.33]) {
    cyl(0.052, 0.045, [x, 1.70, -0.34], STEEL);
    sphere(0.025, [x, 1.69, -0.39], RED, "pipeValve");
  }

  // Curved-looking pipe elbows made from overlapping angular rods.
  rod([-1.47, 1.72, -0.30], [-1.47, 1.72, -0.05], 0.027, COPPER, "elbow");
  rod([-1.47, 1.72, -0.05], [-1.25, 1.72, -0.05], 0.027, COPPER, "elbow");
  rod([1.10, 1.69, -0.30], [1.10, 1.69, -0.04], 0.027, BRASS, "elbow");
  rod([1.10, 1.69, -0.04], [1.37, 1.69, -0.04], 0.027, BRASS, "elbow");

  // Hanging utensil rail and chunky alien utensils.
  rod([-0.68, 1.70, 0.25], [0.66, 1.70, 0.25], 0.018, BRASS, "utensilRail");
  for (const x of [-0.48, -0.16, 0.16, 0.48]) {
    rod([x, 1.69, 0.25], [x, 1.48, 0.25], 0.009, STEEL, "utensilHandle");
    cyl(0.035, 0.055, [x, 1.45, 0.25], STEEL, [0, 1, 0], 7, "utensilGrip");
  }
  box([0.22, 0.06, 0.12], [-0.48, 1.40, 0.25], STEEL, "utensilScoop");
  box([0.18, 0.045, 0.10], [0.16, 1.40, 0.25], STEEL, "utensilBlade");

  // Small magnetic recipe slate and its fasteners.
  box([0.42, 0.28, 0.025], [0.98, 1.53, 0.405], BLACK, "recipeSlate");
  for (const y of [1.60, 1.53, 1.46]) {
    rod([0.84, y, 0.425], [1.12, y, 0.425], 0.006, CREAM, "recipeLine");
  }
  for (const x of [0.80, 1.16]) {
    sphere(0.018, [x, 1.68, 0.43], BRASS, "slateFastener");
    sphere(0.018, [x, 1.39, 0.43], BRASS, "slateFastener");
  }

  // Exposed lower pipework and feet.
  rod([-1.48, 0.25, -0.26], [-0.60, 0.25, -0.26], 0.025, COPPER, "lowerPipe");
  rod([-0.60, 0.25, -0.26], [-0.60, 0.45, -0.26], 0.025, COPPER, "lowerPipe");
  rod([0.86, 0.27, -0.26], [1.48, 0.27, -0.26], 0.022, STEEL, "lowerPipe");
  for (const x of [-1.38, -0.86, -0.46, 0.84, 1.34]) {
    cyl(0.045, 0.13, [x, 0.22, 0.17], BLACK, [0, 1, 0], 8, "adjustableFoot");
    cyl(0.065, 0.025, [x, 0.15, 0.17], STEEL, [0, 1, 0], 8, "footPad");
  }

  // Riveted corner armor and vertical structural rails.
  for (const x of [-1.54, 1.54]) {
    box([0.07, 1.65, 0.09], [x, 0.98, 0.36], STEEL, "cornerRail");
    for (const y of [0.30, 0.72, 1.14, 1.56]) {
      sphere(0.027, [x * 0.995, y, 0.415], BRASS, "cornerRivet");
    }
  }

  // A few recognizable chunky controls across the galley.
  for (const [x, y, c] of [
    [-1.00, 1.10, RED],
    [-0.82, 1.10, GREEN],
    [-0.64, 1.10, AMBER],
    [0.98, 1.10, RED],
    [1.16, 1.10, GREEN],
    [1.34, 1.10, AMBER],
  ] as const) {
    button([x, y, 0.43], c, 0.016, "counterIndicator");
  }

  return b.root;
}
```