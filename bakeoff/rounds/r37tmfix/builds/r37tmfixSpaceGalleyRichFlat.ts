import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Nostromo Galley Kitchen",
  description:
    "A dense retro-industrial spaceship galley inspired by Alien's Nostromo: battered olive cabinets, stainless counters, sink, stove, oven, overhead storage, pipes, vents, mugs, utensils, labels and warning details.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const OLIVE = "#596052";
  const OLIVE_DARK = "#343a35";
  const OLIVE_LIGHT = "#777b67";
  const CREAM = "#b9b39a";
  const CREAM_LIGHT = "#d6cfb5";
  const STEEL = "#737a76";
  const STEEL_LIGHT = "#a4aaa0";
  const DARK = "#171a18";
  const BLACK = "#0b0d0c";
  const RUBBER = "#242824";
  const RUST = "#713d2e";
  const RUST_LIGHT = "#9a5941";
  const BRASS = "#a9874b";
  const AMBER = "#d78e30";
  const RED = "#9f332d";
  const RED_LIGHT = "#d2553f";
  const TEAL = "#39706c";
  const CYAN = "#79b3a6";
  const PAPER = "#ded5ae";

  const warning = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 48">
      <rect width="128" height="48" fill="#151815"/>
      <path d="M0 0h24L0 24v24h24L48 24 72 0h24L72 24l24 24h-24L48 24 24 48H0l24-24z" fill="#c58a32"/>
      <path d="M0 0h24L0 24v24h24L48 24 72 0h24L72 24l24 24h-24L48 24 24 48H0l24-24z" fill="none" stroke="#e4c56d" stroke-width="2"/>
      <path d="M104 7v20M104 34v4" stroke="#d9d3b2" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const nostromoLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 48">
      <rect width="180" height="48" rx="2" fill="#20251f"/>
      <rect x="3" y="3" width="174" height="42" fill="none" stroke="#bcb89c" stroke-width="2"/>
      <text x="90" y="21" fill="#d8d0ae" font-size="14" text-anchor="middle" font-family="monospace" font-weight="bold">USCSS NOSTROMO</text>
      <text x="90" y="37" fill="#9e9c82" font-size="9" text-anchor="middle" font-family="monospace">GALLEY / FOOD SERVICE</text>
    </svg>`,
    { size: 360 },
  );

  const blueScreen = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 80">
      <rect width="128" height="80" fill="#101b1a"/>
      <path d="M8 60h112M8 52h45M8 44h78M8 36h38M8 28h103M8 20h57" stroke="#62a79d" stroke-width="2"/>
      <path d="M76 61L96 45l10 5 14-20" fill="none" stroke="#d8b44d" stroke-width="2"/>
      <circle cx="76" cy="61" r="3" fill="#d8b44d"/>
      <circle cx="96" cy="45" r="3" fill="#d8b44d"/>
      <circle cx="106" cy="50" r="3" fill="#d8b44d"/>
      <circle cx="120" cy="30" r="3" fill="#d8b44d"/>
    </svg>`,
    { size: 256 },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    extra: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...extra,
    });
  }

  function cyl(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 12,
    extra: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      ...extra,
    });
  }

  function cone(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    extra: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.ConeGeometry(radius, height, 8), color, { at, ...extra });
  }

  function rod(
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) {
    return b.rod(a, z, radius, { color, caps: "round" });
  }

  function rivet(x: number, y: number, z: number, color = BRASS, r = 0.018) {
    return cyl(r, 0.012, [x, y, z], color, 8, { dir: [0, 0, 1] });
  }

  function frontStrip(
    x: number,
    y: number,
    width: number,
    height: number,
    z: number,
    color: string,
  ) {
    return box([width, height, 0.018], [x, y, z], color);
  }

  // ---------------------------------------------------------------------------
  // Structural shell: a compact, heavy, freestanding galley module.
  // ---------------------------------------------------------------------------

  box([2.52, 0.08, 1.22], [0, 0.04, -0.03], DARK);
  box([2.42, 2.18, 0.12], [0, 1.09, -0.63], OLIVE_DARK);
  box([0.1, 2.12, 1.12], [-1.26, 1.08, -0.05], OLIVE_DARK);
  box([0.1, 2.12, 1.12], [1.26, 1.08, -0.05], OLIVE_DARK);

  // Heavy structural rails and corner guards.
  for (const x of [-1.19, 1.19]) {
    box([0.075, 2.12, 0.075], [x, 1.08, -0.55], STEEL);
    box([0.09, 0.09, 1.12], [x, 2.07, -0.03], STEEL);
    box([0.09, 0.09, 1.12], [x, 0.11, -0.03], STEEL);
    for (const y of [0.22, 0.78, 1.33, 1.88]) {
      rivet(x > 0 ? x - 0.045 : x + 0.045, y, 0.0, BRASS, 0.016);
    }
  }

  // Back wall ribs, seams and the large identification plaque.
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) {
    box([0.018, 1.94, 0.025], [x, 1.1, -0.56], STEEL);
  }
  for (const y of [0.38, 1.01, 1.63]) {
    box([2.25, 0.025, 0.034], [0, y, -0.535], STEEL);
  }
  box([0.74, 0.22, 0.018], [0, 1.94, -0.485], OLIVE);
  b.part(new THREE.PlaneGeometry(0.68, 0.16), PAPER, {
    at: [0, 1.94, -0.468],
    dir: [0, 0, 1],
    axis: "z",
    texture: nostromoLabel,
  });

  // Left and right vertical utility panels.
  box([0.68, 0.83, 0.045], [-0.84, 1.48, -0.48], OLIVE);
  box([0.68, 0.83, 0.045], [0.84, 1.48, -0.48], OLIVE);
  box([0.58, 0.035, 0.42], [-0.84, 1.48, -0.445], DARK);
  box([0.58, 0.035, 0.42], [0.84, 1.48, -0.445], DARK);
  for (const x of [-1.04, -0.64, 0.64, 1.04]) {
    box([0.024, 0.68, 0.02], [x, 1.48, -0.41], STEEL);
  }
  for (const y of [1.2, 1.48, 1.76]) {
    box([0.58, 0.022, 0.02], [-0.84, y, -0.405], STEEL);
    box([0.58, 0.022, 0.02], [0.84, y, -0.405], STEEL);
  }

  // ---------------------------------------------------------------------------
  // Lower cabinets and countertop.
  // ---------------------------------------------------------------------------

  box([2.26, 0.72, 0.72], [0, 0.52, -0.08], OLIVE);
  box([2.34, 0.11, 0.8], [0, 0.93, -0.02], STEEL);
  box([2.28, 0.045, 0.74], [0, 0.992, -0.02], STEEL_LIGHT);
  box([2.25, 0.035, 0.08], [0, 0.945, 0.37], BLACK);

  // Cabinet divisions.
  for (const x of [-0.77, -0.25, 0.28, 0.79]) {
    box([0.025, 0.69, 0.035], [x, 0.52, 0.31], OLIVE_DARK);
  }
  for (const x of [-1.04, -0.51, 0.02, 0.54, 1.05]) {
    box([0.018, 0.66, 0.026], [x, 0.52, 0.34], STEEL);
  }

  // Four battered lower doors with recessed centers.
  const doorXs = [-0.91, -0.46, 0.47, 0.94];
  for (const x of doorXs) {
    box([0.38, 0.54, 0.035], [x, 0.51, 0.36], OLIVE_LIGHT);
    box([0.29, 0.42, 0.016], [x, 0.51, 0.382], OLIVE_DARK);
    box([0.02, 0.18, 0.025], [x + 0.11, 0.51, 0.4], BRASS);
    rivet(x - 0.145, 0.73, 0.402, BRASS, 0.012);
    rivet(x + 0.145, 0.73, 0.402, BRASS, 0.012);
    rivet(x - 0.145, 0.29, 0.402, BRASS, 0.012);
    rivet(x + 0.145, 0.29, 0.402, BRASS, 0.012);
  }

  // Central oven door.
  box([0.48, 0.52, 0.045], [0.0, 0.5, 0.395], DARK);
  box([0.38, 0.31, 0.018], [0.0, 0.53, 0.425], STEEL);
  box([0.32, 0.22, 0.014], [0.0, 0.53, 0.438], BLACK);
  box([0.26, 0.018, 0.035], [0.0, 0.76, 0.45], BRASS);
  for (const x of [-0.18, 0.18]) rivet(x, 0.76, 0.45, BRASS, 0.012);
  for (const x of [-0.18, 0.18]) rivet(x, 0.28, 0.45, BRASS, 0.012);

  // Oven status lamps and control strip.
  box([0.48, 0.09, 0.045], [0, 0.82, 0.38], OLIVE_DARK);
  for (const [x, c] of [
    [-0.16, RED],
    [-0.08, AMBER],
    [0, TEAL],
    [0.08, RED],
    [0.16, CREAM_LIGHT],
  ] as [number, string][]) {
    cyl(0.018, 0.012, [x, 0.82, 0.412], c, 8, { dir: [0, 0, 1] });
  }

  // Left stove: four burners and an industrial raised grate.
  box([0.86, 0.035, 0.62], [-0.67, 1.015, -0.02], BLACK);
  for (const x of [-0.89, -0.48]) {
    for (const z of [-0.18, 0.13]) {
      cyl(0.13, 0.018, [x, 1.045, z], STEEL, 12);
      cyl(0.085, 0.022, [x, 1.06, z], DARK, 12);
      cyl(0.035, 0.025, [x, 1.075, z], BRASS, 10);
    }
  }
  for (const x of [-1.02, -0.32]) {
    rod([x, 1.1, -0.31], [x, 1.1, 0.28], 0.018, STEEL);
  }
  for (const z of [-0.31, 0.28]) {
    rod([-1.02, 1.1, z], [-0.32, 1.1, z], 0.018, STEEL);
  }

  // Right sink, drain, faucet and spray hose.
  box([0.83, 0.08, 0.55], [0.69, 1.045, 0.0], STEEL_LIGHT);
  box([0.67, 0.06, 0.4], [0.69, 1.09, 0.0], DARK);
  box([0.56, 0.025, 0.29], [0.69, 1.13, 0.0], STEEL);
  cyl(0.045, 0.018, [0.69, 1.148, 0.02], BLACK, 10);
  cyl(0.07, 0.018, [0.69, 1.15, 0.02], STEEL, 10);
  rod([0.69, 1.12, 0.19], [0.69, 1.36, 0.19], 0.025, STEEL);
  rod([0.69, 1.36, 0.19], [0.69, 1.42, 0.08], 0.025, STEEL);
  rod([0.69, 1.42, 0.08], [0.69, 1.35, -0.02], 0.018, STEEL_LIGHT);
  cyl(0.04, 0.025, [0.54, 1.16, 0.19], BRASS, 8);
  cyl(0.04, 0.025, [0.84, 1.16, 0.19], BRASS, 8);

  // Right-side water filter and clipped canister.
  cyl(0.105, 0.31, [1.04, 1.22, 0.05], OLIVE_DARK, 10);
  cyl(0.088, 0.18, [1.04, 1.23, 0.17], STEEL, 10);
  cyl(0.112, 0.025, [1.04, 1.385, 0.05], BRASS, 10);
  box([0.25, 0.025, 0.08], [1.04, 1.23, 0.22], RED);

  // Cabinet kick plate and feet.
  box([2.22, 0.11, 0.06], [0, 0.13, 0.37], BLACK);
  for (const x of [-1.0, -0.34, 0.34, 1.0]) {
    cyl(0.045, 0.14, [x, 0.08, 0.22], RUBBER, 8);
    cyl(0.065, 0.025, [x, 0.015, 0.22], STEEL, 8);
  }

  // ---------------------------------------------------------------------------
  // Upper cupboards, shelf, extraction hood and service hardware.
  // ---------------------------------------------------------------------------

  box([2.22, 0.54, 0.42], [0, 1.78, -0.38], OLIVE);
  box([2.26, 0.06, 0.46], [0, 2.05, -0.36], STEEL);
  box([2.2, 0.045, 0.08], [0, 1.51, -0.14], BLACK);

  // Three upper cupboard doors.
  for (const x of [-0.75, 0, 0.75]) {
    box([0.65, 0.43, 0.035], [x, 1.78, -0.14], OLIVE_LIGHT);
    box([0.54, 0.31, 0.014], [x, 1.78, -0.164], OLIVE_DARK);
    box([0.18, 0.018, 0.035], [x, 1.78, -0.19], BRASS);
    rivet(x - 0.27, 1.97, -0.19, BRASS, 0.012);
    rivet(x + 0.27, 1.97, -0.19, BRASS, 0.012);
    rivet(x - 0.27, 1.59, -0.19, BRASS, 0.012);
    rivet(x + 0.27, 1.59, -0.19, BRASS, 0.012);
  }

  // Open lower service shelf with cans and ration tins.
  box([1.02, 0.055, 0.36], [0, 1.42, -0.12], STEEL);
  box([1.04, 0.035, 0.04], [0, 1.26, -0.13], BLACK);
  for (const x of [-0.42, -0.2, 0.22, 0.43]) {
    cyl(0.065, 0.13, [x, 1.5, -0.12], CREAM, 10);
    cyl(0.068, 0.015, [x, 1.57, -0.12], BRASS, 10);
    box([0.095, 0.035, 0.012], [x, 1.49, -0.19], x < 0 ? RED : TEAL);
  }

  // Extraction hood, trapezoidal stacked blocks.
  box([1.12, 0.09, 0.52], [-0.48, 1.31, -0.26], STEEL);
  box([0.96, 0.13, 0.42], [-0.48, 1.22, -0.17], OLIVE_DARK);
  box([0.72, 0.12, 0.34], [-0.48, 1.14, -0.06], BLACK);
  box([0.64, 0.035, 0.26], [-0.48, 1.1, 0.1], STEEL);
  for (const x of [-0.76, -0.2]) {
    cyl(0.035, 0.022, [x, 1.16, 0.23], AMBER, 8, { dir: [0, 0, 1] });
  }
  for (const x of [-0.88, -0.68, -0.48, -0.28, -0.08]) {
    box([0.018, 0.025, 0.24], [x, 1.11, 0.24], STEEL_LIGHT);
  }

  // Duct rising into ceiling.
  box([0.34, 0.28, 0.34], [-0.48, 2.1, -0.26], STEEL);
  box([0.25, 0.17, 0.25], [-0.48, 2.31, -0.26], DARK);
  for (const x of [-0.58, -0.48, -0.38]) {
    box([0.018, 0.22, 0.27], [x, 2.31, -0.26], STEEL);
  }

  // Right upper communications/control bay.
  box([0.56, 0.4, 0.055], [0.77, 1.78, -0.105], DARK);
  b.part(new THREE.PlaneGeometry(0.43, 0.27), CYAN, {
    at: [0.77, 1.81, -0.07],
    dir: [0, 0, 1],
    axis: "z",
    texture: blueScreen,
  });
  box([0.06, 0.3, 0.04], [1.08, 1.78, -0.07], STEEL);
  for (const y of [1.66, 1.75, 1.84, 1.93]) {
    box([0.035, 0.025, 0.018], [1.08, y, -0.03], y === 1.75 ? RED : AMBER);
  }

  // Long overhead rack.
  rod([-1.03, 2.11, 0.05], [1.03, 2.11, 0.05], 0.025, STEEL);
  rod([-1.03, 2.11, 0.12], [1.03, 2.11, 0.12], 0.018, BRASS);
  for (const x of [-0.92, -0.52, -0.12, 0.3, 0.72, 0.98]) {
    rod([x, 2.1, -0.04], [x, 2.1, 0.18], 0.015, STEEL);
  }

  // Hanging mugs and ration vessels.
  function mug(x: number, z: number, color: string) {
    cyl(0.085, 0.14, [x, 1.98, z], color, 10);
    cyl(0.075, 0.012, [x, 2.055, z], CREAM_LIGHT, 10);
    const handle = new THREE.TorusGeometry(0.052, 0.012, 6, 10, Math.PI * 1.5);
    b.part(handle, color, {
      at: [x + 0.09, 1.99, z],
      dir: [0, 1, 0],
      rotation: [90, 0, 0],
    });
  }
  mug(-0.88, 0.1, CREAM);
  mug(-0.48, 0.1, RED);
  mug(0.08, 0.1, OLIVE_LIGHT);
  mug(0.91, 0.1, STEEL_LIGHT);

  // Hanging ladle, spatula, and knife.
  rod([0.42, 2.1, 0.1], [0.42, 1.57, 0.1], 0.012, BRASS);
  cyl(0.075, 0.09, [0.42, 1.52, 0.1], STEEL, 10);
  rod([0.58, 2.1, 0.1], [0.58, 1.62, 0.1], 0.012, STEEL);
  box([0.52, 0.12, 0.025], [0.58, 1.55, 0.1], STEEL_LIGHT);
  rod([0.77, 2.1, 0.1], [0.77, 1.62, 0.1], 0.012, RUST_LIGHT);
  box([0.05, 0.3, 0.025], [0.77, 1.48, 0.1], STEEL_LIGHT);

  // ---------------------------------------------------------------------------
  // Side-mounted pipes, valves, gauges and exposed Nostromo machinery.
  // ---------------------------------------------------------------------------

  // Left vertical coolant pipe.
  rod([-1.11, 0.35, -0.39], [-1.11, 1.98, -0.39], 0.035, STEEL);
  rod([-1.11, 0.35, -0.39], [-0.98, 0.35, -0.39], 0.035, STEEL);
  rod([-1.11, 1.98, -0.39], [-0.88, 1.98, -0.39], 0.035, STEEL);
  for (const y of [0.58, 1.22, 1.76]) {
    cyl(0.052, 0.04, [-1.11, y, -0.39], BRASS, 10);
  }
  cyl(0.12, 0.08, [-1.1, 1.16, -0.33], RUST, 10, { dir: [0, 0, 1] });
  cyl(0.075, 0.09, [-1.1, 1.16, -0.27], CREAM, 12, { dir: [0, 0, 1] });
  rod([-1.15, 1.16, -0.21], [-1.04, 1.16, -0.21], 0.012, RED);

  // Right side pressure pipe with elbow.
  rod([1.1, 0.3, -0.37], [1.1, 1.05, -0.37], 0.03, RUST_LIGHT);
  rod([1.1, 1.05, -0.37], [0.92, 1.05, -0.37], 0.03, RUST_LIGHT);
  rod([1.1, 1.65, -0.37], [1.1, 1.98, -0.37], 0.03, STEEL);
  rod([1.1, 1.65, -0.37], [0.86, 1.65, -0.37], 0.03, STEEL);
  cyl(0.07, 0.04, [1.1, 1.38, -0.37], BRASS, 10);
  cyl(0.11, 0.065, [1.1, 1.38, -0.31], DARK, 12, { dir: [0, 0, 1] });
  cyl(0.075, 0.07, [1.1, 1.38, -0.255], CREAM_LIGHT, 12, { dir: [0, 0, 1] });
  rod([1.1, 1.38, -0.205], [1.1, 1.43, -0.205], 0.01, RED);

  // Four hose clamps.
  for (const y of [0.58, 0.94, 1.55, 1.84]) {
    cyl(0.042, 0.025, [1.1, y, -0.37], BRASS, 10);
  }

  // Warning plaque and hazard lights on right wall.
  box([0.48, 0.2, 0.025], [0.88, 1.03, -0.42], BLACK);
  b.part(new THREE.PlaneGeometry(0.4, 0.15), PAPER, {
    at: [0.88, 1.03, -0.398],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
  });
  for (const x of [0.63, 1.13]) {
    cyl(0.028, 0.022, [x, 1.19, -0.4], RED_LIGHT, 8, { dir: [0, 0, 1] });
  }

  // Exposed junction box under the shelf.
  box([0.34, 0.28, 0.22], [1.02, 0.84, -0.43], OLIVE_DARK);
  box([0.25, 0.14, 0.018], [1.02, 0.84, -0.31], STEEL);
  for (const x of [0.94, 1.02, 1.1]) {
    cyl(0.015, 0.018, [x, 0.84, -0.295], AMBER, 8, { dir: [0, 0, 1] });
  }
  rod([0.87, 0.74, -0.43], [0.72, 0.52, -0.43], 0.012, RED);
  rod([1.17, 0.72, -0.43], [1.12, 0.5, -0.43], 0.012, TEAL);

  // ---------------------------------------------------------------------------
  // Small lived-in galley details.
  // ---------------------------------------------------------------------------

  // Spice jars and tins along the rear counter.
  const jars = [
    [-0.99, AMBER],
    [-0.84, CREAM],
    [-0.69, RED],
    [0.27, TEAL],
    [0.42, CREAM],
    [0.57, RUST_LIGHT],
  ] as [number, string][];
  for (const [x, c] of jars) {
    cyl(0.045, 0.115, [x, 1.12, 0.25], c, 10);
    cyl(0.048, 0.018, [x, 1.185, 0.25], BRASS, 10);
    box([0.065, 0.025, 0.012], [x, 1.12, 0.296], PAPER);
  }

  // A stacked ration tray.
  box([0.38, 0.05, 0.25], [-0.05, 1.12, 0.24], DARK);
  box([0.34, 0.08, 0.21], [-0.05, 1.19, 0.24], CREAM);
  box([0.28, 0.025, 0.22], [-0.05, 1.245, 0.24], RED);
  box([0.12, 0.018, 0.12], [-0.05, 1.265, 0.36], PAPER);

  // Three knobs beside the stove.
  for (const x of [-0.2, -0.1, 0.0]) {
    cyl(0.035, 0.025, [x, 1.12, 0.34], BRASS, 10, { dir: [0, 0, 1] });
    box([0.012, 0.04, 0.012], [x, 1.12, 0.36], DARK);
  }

  // Small hinged recipe tablet / service clipboard.
  box([0.31, 0.42, 0.025], [0.33, 1.34, 0.34], OLIVE_DARK);
  box([0.24, 0.31, 0.012], [0.33, 1.35, 0.36], PAPER);
  for (const y of [1.23, 1.29, 1.35, 1.41]) {
    box([0.16, 0.012, 0.008], [0.33, y, 0.37], y === 1.23 ? RED : DARK);
  }
  rod([0.18, 1.14, 0.34], [0.48, 1.14, 0.34], 0.01, BRASS);

  // Floor drainage strips and front threshold.
  for (const x of [-0.9, -0.45, 0, 0.45, 0.9]) {
    box([0.025, 0.012, 1.02], [x, 0.091, -0.03], STEEL);
  }
  box([2.36, 0.08, 0.08], [0, 0.1, 0.54], STEEL);
  box([2.2, 0.025, 0.05], [0, 0.15, 0.49], BRASS);
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) {
    rivet(x, 0.155, 0.47, BRASS, 0.014);
  }

  // Deliberate dents / repair plates on the battered shell.
  box([0.24, 0.14, 0.018], [-1.03, 1.88, -0.475], RUST);
  box([0.17, 0.1, 0.022], [1.02, 0.26, -0.48], RUST_LIGHT);
  box([0.32, 0.08, 0.02], [-0.62, 0.28, -0.49], STEEL);
  for (const x of [-0.73, -0.51]) rivet(x, 0.28, -0.47, BRASS, 0.012);

  // Tiny indicator stack under the overhead unit.
  box([0.32, 0.12, 0.035], [0.86, 1.27, -0.39], DARK);
  for (const [y, c] of [
    [1.23, RED],
    [1.27, AMBER],
    [1.31, TEAL],
  ] as [number, string][]) {
    cyl(0.022, 0.018, [0.76, y, -0.365], c, 8, { dir: [0, 0, 1] });
    cyl(0.022, 0.018, [0.96, y, -0.365], c, 8, { dir: [0, 0, 1] });
  }

  return b.root;
}
