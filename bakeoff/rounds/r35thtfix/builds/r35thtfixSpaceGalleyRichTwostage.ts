import * as THREE from "three";
import { type Builder, cells, createBuilder, mix, noise, paint, type ColorInput, type Fill, type Rgb, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const HULL = "#667064";
export const HULL_DARK = "#303733";
export const HULL_SHADOW = "#202522";
export const PANEL = "#8b927f";
export const PANEL_LIGHT = "#b3b39b";
export const HULL_LIGHT = "#9da393";
export const OFF_WHITE = "#d1cbb5";
export const RUBBER = "#171b1a";
export const BLACK = "#0b0d0d";
export const STEEL = "#767d76";
export const STEEL_DARK = "#454c48";
export const RUST = "#8d4b30";
export const RUST_DARK = "#4d2922";
export const OCHRE = "#b48a3e";
export const HAZARD = "#c29a36";
export const RED = "#9b332c";
export const CYAN = "#55c7c1";
export const MAGENTA = "#bb5b8d";
export const AMBER = "#d39b42";
export const GLASS = "#75958d";

export const meta = {
  name: "Nostromo spaceship galley kitchen",
  description:
    "A chunky low-poly industrial spaceship galley in the grimy Alien-era Nostromo style, with a narrow service aisle, counters, upper lockers, appliance housings, bulkheads, ducts, pipes, rails and clear mounting surfaces for a second detailing stage.",
};

export const REQUESTS = [
  {
    id: "sinkBasin",
    kind: "add",
    part: "counterTop",
    what:
      "Build a deep rectangular stainless sink basin inset into the counter, with a thick rim, dark drain, angular faucet and two short hot/cold handles. Use STEEL, STEEL_DARK, BLACK and RUST; keep it heavy, utilitarian and visibly recessed.",
    at: [0.0, 1.15, -0.92],
    normal: [0, 1, 0],
    bone: null,
    room: [0.82, 0.2, 0.52],
  },
  {
    id: "rangeTop",
    kind: "add",
    part: "counterTop",
    what:
      "Add a compact industrial galley range on the clear right side of the back counter: two dark burner plates, raised square pot supports, a small control rail and four red and amber indicator buttons. Use BLACK, STEEL_DARK, STEEL, RED and AMBER.",
    at: [0.86, 1.15, -0.92],
    normal: [0, 1, 0],
    bone: null,
    room: [0.72, 0.2, 0.52],
  },
  {
    id: "roofLightBar",
    kind: "add",
    part: "ceiling",
    what:
      "Build an exposed ceiling light bar across the galley: a slim dark housing, six chunky lamps alternating CYAN and MAGENTA, two metal suspension brackets and a few black cable loops. The lamps should feel like retro-futurist fluorescent emergency hardware.",
    at: [0.0, 2.56, -0.05],
    normal: [0, -1, 0],
    bone: null,
    room: [1.8, 0.18, 0.34],
  },
  {
    id: "wallControlPanel",
    kind: "add",
    part: "hullBack",
    what:
      "Add a compact Nostromo control panel on the rear wall, with a thick bevelled housing, three horizontal dark display windows, vertical toggle banks, red warning lamps and one small amber status display. Use HULL_DARK, BLACK, STEEL, RED and AMBER. Keep it rectangular and tactile, not sleek.",
    at: [1.0, 1.62, -1.18],
    normal: [0, 0, 1],
    bone: null,
    room: [0.48, 0.62, 0.06],
  },
  {
    id: "utensilRail",
    kind: "add",
    part: "lowerCabinetFront",
    what:
      "Add a magnetic utensil rail above the counter with four hanging angular tools: a ladle, a spatula, a long knife and a hook. Use STEEL, STEEL_DARK, RUST and BLACK, with chunky silhouettes and visible mounting collars.",
    at: [-0.82, 1.54, -0.66],
    normal: [0, 0, 1],
    bone: null,
    room: [1.05, 0.28, 0.12],
  },
  {
    id: "rearVentBank",
    kind: "add",
    part: "hullBack",
    what:
      "Build a rear-wall ventilation bank in the reserved left section: a raised rectangular frame, six deep black slots, a central mesh-like grille made from thick bars and two rusted fastener plates. Use HULL_DARK, BLACK, STEEL_DARK and RUST.",
    at: [-1.13, 1.58, -1.18],
    normal: [0, 0, 1],
    bone: null,
    room: [0.62, 0.72, 0.06],
  },
  {
    id: "sideCableBundle",
    kind: "add",
    part: "sideWallR",
    what:
      "Add a bundled cable loom down the right bulkhead, held by four metal clamps. Use three parallel thick cables in BLACK, RUST and STEEL_DARK, with a few angled bends so the bundle feels installed rather than decorative.",
    at: [1.42, 1.86, -0.42],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.18, 0.9, 0.38],
  },
  {
    id: "warningPlacard",
    kind: "add",
    part: "sideWallL",
    what:
      "Add a small bolted warning placard on the left wall with an inset ochre hazard triangle, a red emergency stripe and two rows of tiny raised bars standing in for lettering. Use PANEL_LIGHT, HAZARD, RED, BLACK and STEEL.",
    at: [-1.4, 1.03, 0.68],
    normal: [1, 0, 0],
    bone: null,
    room: [0.08, 0.42, 0.52],
  },
  {
    id: "mugRack",
    kind: "add",
    part: "upperCabinetFront",
    what:
      "Add a small under-cabinet mug rack with a dark horizontal rail, four pale industrial mugs and four short hooks. Use STEEL_DARK, OFF_WHITE, RUST and BLACK. Keep the mugs blocky and visibly suspended.",
    at: [0.72, 1.72, -0.72],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.4, 0.16],
  },
  {
    id: "hullBackTexture",
    kind: "texture",
    part: "hullBack",
    what:
      "Paint the rear bulkhead in a restrained worn olive-grey HULL and HULL_DARK industrial panel pattern. Add subtle soot near the counter, faded maintenance blocks and a small stencilled unit number near the upper right, without making it clean or glossy.",
    at: [0.0, 1.46, -1.18],
    normal: [0, 0, 1],
    bone: null,
    room: null,
  },
  {
    id: "cabinetWear",
    kind: "texture",
    part: "lowerCabinetFront",
    what:
      "Paint the lower cabinet fronts in alternating HULL, HULL_DARK and PANEL sections with chipped edges, grime along the bottom, and faint pale maintenance labels. Preserve the raised frame geometry and keep the overall palette muted.",
    at: [0.0, 0.72, -0.62],
    normal: [0, 0, 1],
    bone: null,
    room: null,
  },
  {
    id: "leftBulkheadTexture",
    kind: "texture",
    part: "sideWallL",
    what:
      "Add a sparse vertical panel pattern to the left bulkhead using HULL, PANEL and HULL_DARK, with faded rectangular service marks and darker grime in the lower corners. The result should look like painted, repeatedly serviced spacecraft metal.",
    at: [-1.4, 1.5, -0.1],
    normal: [1, 0, 0],
    bone: null,
    room: null,
  },
  {
    id: "upperLockerTexture",
    kind: "texture",
    part: "upperCabinetFront",
    what:
      "Paint the overhead locker fronts with uneven HULL and PANEL blocks, black recessed seams, small faded cream labels and a few rust blooms around the hinges. Keep the faces readable and leave all handles visible.",
    at: [0.0, 2.08, -0.72],
    normal: [0, 0, 1],
    bone: null,
    room: null,
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

type P = [number, number, number];

function rect(
  x: number,
  y: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
) {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function stencilUnitNumber(x: number, y: number) {
  const u = (x - 0.62) / 0.1;
  const v = (y - 2.19) / 0.1;
  if (u < 0 || u > 4.25 || v < 0 || v > 0.56) return false;

  const bar = (x0: number, x1: number, y0: number, y1: number) =>
    rect(u, v, x0, x1, y0, y1);

  const n =
    bar(0.02, 0.07, 0.02, 0.54) ||
    bar(0.37, 0.42, 0.02, 0.54) ||
    bar(0.08, 0.17, 0.25, 0.32) ||
    bar(0.16, 0.26, 0.31, 0.39) ||
    bar(0.25, 0.34, 0.4, 0.48);

  const dash = bar(0.52, 0.75, 0.25, 0.32);

  const zero =
    bar(0.88, 0.94, 0.02, 0.54) ||
    bar(1.25, 1.31, 0.02, 0.54) ||
    bar(0.94, 1.25, 0.02, 0.08) ||
    bar(0.94, 1.25, 0.48, 0.54);

  const seven =
    bar(1.52, 1.58, 0.02, 0.54) ||
    bar(1.58, 1.88, 0.48, 0.54) ||
    bar(1.78, 1.88, 0.02, 0.54);

  return n || dash || zero || seven;
}

/**
 * Rear bulkhead paint: broad service-panel blocks, a low soot veil around the work
 * surface, chipped noise at the seams, pale maintenance marks and a tiny N-07 stencil.
 */
const REAR_BULKHEAD_PAINT = paint((p, n) => {
  let c: string | Rgb = HULL;

  if (n.z > 0.55) {
    const px = Math.floor((p.x + 1.5) / 0.42);
    const py = Math.floor((p.y - 0.3) / 0.52);
    const panelIndex = ((px * 7 + py * 11) % 9 + 9) % 9;

    if (panelIndex === 1 || panelIndex === 6) c = PANEL;
    if (panelIndex === 3 || panelIndex === 8) c = HULL_DARK;

    const lowerGrime = p.y < 0.56 ? 0.34 : 0;
    const counterSoot =
      p.y > 0.82 &&
      p.y < 1.25 &&
      Math.abs(p.x) < 1.25
        ? 0.17 * noise(p, 0.16, 41)
        : 0;

    c = mix(c, HULL_SHADOW, lowerGrime + counterSoot);

    const chips = cells(p, 0.075, 19);
    if (chips.d2 - chips.d1 < 0.055 && chips.id > 0.76)
      c = mix(c, STEEL_DARK, 0.34);

    const serviceBlock =
      rect(p.x, p.y, -1.2, -0.72, 2.08, 2.18) ||
      rect(p.x, p.y, -0.28, 0.18, 0.54, 0.59) ||
      rect(p.x, p.y, 0.68, 1.15, 1.35, 1.41);

    if (serviceBlock) c = mix(c, OFF_WHITE, 0.38);

    if (stencilUnitNumber(p.x, p.y)) c = mix(c, OFF_WHITE, 0.78);

    if (
      rect(p.x, p.y, -1.22, -0.68, 2.03, 2.24) &&
      Math.sin(p.y * 160) > 0.18
    )
      c = mix(c, HULL_DARK, 0.25);
  }

  return c;
});

/**
 * Lower cabinet paint: each narrow door gets an uneven muted tone, with dark
 * bottom grime, worn vertical edges, chipped flecks and tiny cream service labels.
 */
const CABINET_WEAR_PAINT = paint((p, n) => {
  let c: string | Rgb = HULL;

  if (n.z > 0.55) {
    const door = Math.floor((p.x + 1.31) / 0.29);
    const phase = ((door % 4) + 4) % 4;

    if (phase === 1) c = HULL_DARK;
    if (phase === 2) c = PANEL;

    const bottom =
      p.y < 0.47 ? 0.36 :
      p.y < 0.54 ? 0.18 :
      0;

    c = mix(c, HULL_SHADOW, bottom);

    const seam = Math.abs(((p.x + 1.31) / 0.29) % 1);
    if (seam < 0.035 || seam > 0.965) c = mix(c, BLACK, 0.5);

    const chipped = cells(p, 0.065, 27);
    if (
      chipped.d2 - chipped.d1 < 0.045 &&
      chipped.id > 0.68 &&
      p.y < 0.92
    )
      c = mix(c, STEEL_DARK, 0.3);

    const labelY = 0.83 + 0.025 * Math.sin(door * 2.1);
    if (
      Math.abs(p.y - labelY) < 0.018 &&
      Math.abs(((p.x + 1.31) % 0.29) - 0.1) < 0.075
    )
      c = mix(c, OFF_WHITE, 0.5);

    if (
      p.y > 0.42 &&
      p.y < 0.49 &&
      Math.sin(p.x * 115 + p.y * 19) > 0.64
    )
      c = mix(c, RUST_DARK, 0.25);
  }

  return c;
});

/**
 * Left bulkhead paint: sparse vertical service panels on the side plane,
 * with darker lower corners, pale faded inspection blocks and irregular wear.
 */
const LEFT_BULKHEAD_PAINT = paint((p, n) => {
  let c: string | Rgb = HULL;

  if (n.x > 0.55) {
    const column = Math.floor((p.z + 0.98) / 0.36);
    const row = Math.floor((p.y - 0.38) / 0.52);
    const tile = ((column * 5 + row * 3) % 7 + 7) % 7;

    if (tile === 1 || tile === 5) c = PANEL;
    if (tile === 3) c = HULL_DARK;

    const lowerCorner =
      p.y < 0.64 &&
      (p.z < -0.44 || p.z > 0.52)
        ? 0.34
        : p.y < 0.78
          ? 0.14
          : 0;

    c = mix(c, HULL_SHADOW, lowerCorner);

    const verticalSeam = Math.abs(((p.z + 0.98) / 0.36) % 1);
    if (verticalSeam < 0.045 || verticalSeam > 0.955)
      c = mix(c, HULL_DARK, 0.38);

    const serviceMark =
      rect(p.y, p.z, 1.58, 1.7, -0.82, -0.46) ||
      rect(p.y, p.z, 1.91, 2.02, 0.12, 0.42) ||
      rect(p.y, p.z, 0.88, 0.96, 0.58, 0.88);

    if (serviceMark) c = mix(c, OFF_WHITE, 0.3);

    const wear = cells(p, 0.09, 53);
    if (wear.d2 - wear.d1 < 0.05 && wear.id > 0.72)
      c = mix(c, STEEL_DARK, 0.3);

    if (
      p.y > 2.2 &&
      Math.sin(p.z * 51 + p.y * 7) > 0.55
    )
      c = mix(c, PANEL_LIGHT, 0.12);
  }

  return c;
});

/**
 * Upper locker paint: alternating overhead door tones, hard recessed seams,
 * faded label strips and restrained rust blooms clustered around hinge height.
 */
const UPPER_LOCKER_PAINT = paint((p, n) => {
  let c: string | Rgb = PANEL;

  if (n.z > 0.55) {
    const door = Math.floor((p.x + 1.34) / 0.5);
    const phase = ((door % 3) + 3) % 3;

    if (phase === 0) c = HULL;
    if (phase === 2) c = PANEL_LIGHT;

    const seam = Math.abs(((p.x + 1.34) / 0.5) % 1);
    if (seam < 0.045 || seam > 0.955) c = mix(c, BLACK, 0.62);

    const upperShade = p.y > 2.27 ? 0.16 : 0;
    c = mix(c, HULL_DARK, upperShade);

    const hingeRust =
      (Math.abs(p.y - 1.88) < 0.035 || Math.abs(p.y - 2.22) < 0.035) &&
      Math.abs(((p.x + 1.34) % 0.5) - 0.08) < 0.1;

    if (hingeRust) {
      const rustNoise = noise(p, 0.075, 71);
      c = mix(c, RUST_DARK, 0.28 + rustNoise * 0.26);
    }

    const label =
      Math.abs(p.y - 2.13) < 0.018 &&
      Math.abs(((p.x + 1.34) % 0.5) - 0.18) < 0.1;

    if (label) c = mix(c, OFF_WHITE, 0.45);

    const scuff = cells(p, 0.06, 83);
    if (scuff.d2 - scuff.d1 < 0.045 && scuff.id > 0.8)
      c = mix(c, STEEL_DARK, 0.2);
  }

  return c;
});

function box(
  b: Builder,
  size: P,
  at: P,
  color: ColorInput,
  name?: string,
  group = "galley",
) {
  const options = name
    ? { at, name, group, flat: true }
    : { at, group, flat: true };
  return b.part(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    color,
    options,
  );
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  at: P,
  color: Fill,
  name?: string,
  segments = 8,
  group = "galley",
) {
  const options = name
    ? { at, name, group, flat: true }
    : { at, group, flat: true };
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, segments),
    color,
    options,
  );
}

function sphere(
  b: Builder,
  radius: number,
  at: P,
  color: ColorInput,
  name?: string,
  group = "galley",
) {
  const options = name
    ? { at, name, group, flat: true }
    : { at, group, flat: true };
  return b.part(
    new THREE.SphereGeometry(radius, 8, 5),
    color,
    options,
  );
}

function rod(
  b: Builder,
  a: P,
  c: P,
  radius: number,
  color: ColorInput,
  name?: string,
  group = "pipes",
) {
  const options = name
    ? {
        color: color as Fill,
        name,
        group,
        section: "circle" as const,
        sides: 8,
        smooth: false,
        caps: "round" as const,
      }
    : {
        color,
        group,
        section: "circle" as const,
        sides: 8,
        smooth: false,
        caps: "round" as const,
      };
  return b.rod(a, c, radius, options);
}

function trim(
  b: Builder,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color = STEEL_DARK,
  name?: string,
) {
  return box(b, [sx, sy, sz], [x, y, z], color, name, "trim");
}

function rivet(
  b: Builder,
  at: P,
  color = STEEL,
  name?: string,
) {
  return sphere(b, 0.025, at, color, name, "fasteners");
}

function handle(
  b: Builder,
  a: P,
  c: P,
  color = STEEL,
  name?: string,
) {
  rod(b, a, c, 0.018, color, name, "handles");
  sphere(b, 0.026, a, color, undefined, "handles");
  sphere(b, 0.026, c, color, undefined, "handles");
}

function buildFloor(b: Builder) {
  box(b, [3.16, 0.14, 2.34], [0, 0.07, -0.08], HULL_SHADOW, "floorBase", "structure");
  box(b, [3.02, 0.06, 2.18], [0, 0.17, -0.08], HULL, "floorSurface", "structure");
  box(b, [3.08, 0.08, 0.12], [0, 0.22, 0.99], STEEL_DARK, "frontThreshold", "structure");

  for (let i = -5; i <= 5; i++) {
    const x = i * 0.27;
    box(b, [0.018, 0.012, 2.08], [x, 0.207, -0.08], BLACK, undefined, "floor");
  }

  for (let i = 0; i < 8; i++) {
    const z = 0.75 - i * 0.29;
    box(
      b,
      [2.82, 0.014, 0.018],
      [0, 0.214, z],
      i % 3 === 0 ? RUST_DARK : STEEL_DARK,
      undefined,
      "floor",
    );
  }

  for (const x of [-1.38, 1.38]) {
    box(b, [0.18, 0.11, 2.18], [x, 0.25, -0.08], STEEL_DARK, undefined, "floor");
    for (let i = 0; i < 6; i++) {
      box(
        b,
        [0.04, 0.022, 0.23],
        [x, 0.32, 0.68 - i * 0.31],
        i % 2 ? HAZARD : BLACK,
        undefined,
        "floor",
      );
    }
  }
}

function buildWalls(b: Builder) {
  box(
    b,
    [3.18, 2.48, 0.14],
    [0, 1.42, -1.25],
    HULL,
    "hullBack",
    "bulkhead",
  );

  box(b, [0.18, 2.5, 2.32], [-1.52, 1.43, -0.08], HULL_DARK, "leftBulkhead", "bulkhead");
  box(b, [0.18, 2.5, 2.32], [1.52, 1.43, -0.08], HULL_DARK, "rightBulkhead", "bulkhead");

  box(b, [3.18, 0.14, 2.32], [0, 2.68, -0.08], HULL_SHADOW, "ceiling", "bulkhead");
  box(b, [2.88, 0.055, 1.98], [0, 2.585, -0.12], PANEL, "ceilingInner", "bulkhead");

  for (const x of [-1.34, -0.94, -0.5, 0.5, 0.94, 1.34]) {
    box(b, [0.075, 2.15, 0.06], [x, 1.37, -1.15], STEEL_DARK, undefined, "bulkheadRibs");
    rivet(b, [x, 2.42, -1.105], STEEL, undefined);
    rivet(b, [x, 0.38, -1.105], STEEL_DARK, undefined);
  }

  for (const y of [0.5, 1.34, 2.28]) {
    box(b, [2.88, 0.065, 0.075], [0, y, -1.14], STEEL_DARK, undefined, "bulkheadRibs");
  }

  for (const side of [-1, 1]) {
    const x = side * 1.405;
    box(
      b,
      [0.045, 2.16, 1.62],
      [x, 1.42, -0.1],
      side < 0 ? LEFT_BULKHEAD_PAINT : HULL,
      side < 0 ? "sideWallL" : "sideWallR",
      "sidePanels",
    );

    for (let i = 0; i < 6; i++) {
      const z = 0.65 - i * 0.3;
      box(b, [0.065, 0.055, 0.22], [side * 1.365, 2.16, z], STEEL_DARK, undefined, "sideTrim");
      box(b, [0.065, 0.055, 0.22], [side * 1.365, 0.65, z], STEEL_DARK, undefined, "sideTrim");
    }

    for (const z of [-0.96, -0.44, 0.12, 0.68]) {
      box(b, [0.065, 1.6, 0.045], [side * 1.365, 1.42, z], PANEL, undefined, "sideRibs");
    }

    for (const y of [0.5, 1.18, 1.86, 2.46]) {
      box(b, [0.07, 0.045, 1.52], [side * 1.36, y, -0.05], STEEL_DARK, undefined, "sideRibs");
    }
  }

  box(b, [0.055, 1.78, 1.12], [-1.395, 1.43, 0.53], HULL_DARK, undefined, "leftInset");
  box(b, [0.055, 1.78, 1.12], [1.395, 1.43, 0.53], HULL_DARK, undefined, "rightInset");

  for (const side of [-1, 1]) {
    for (const z of [0.12, 0.42, 0.72, 1.02]) {
      box(
        b,
        [0.07, 0.07, 0.18],
        [side * 1.34, 1.0, z],
        z === 0.42 ? RUST : STEEL,
        undefined,
        "wallFasteners",
      );
    }
  }
}

function buildLowerCabinets(b: Builder) {
  box(b, [2.82, 0.62, 0.56], [0, 0.62, -0.95], HULL_DARK, "lowerCarcass", "cabinetry");
  box(b, [2.76, 0.11, 0.62], [0, 1.0, -0.95], HULL_SHADOW, "counterSupport", "cabinetry");
  box(
    b,
    [2.82, 0.15, 0.62],
    [0, 1.09, -0.95],
    PANEL_LIGHT,
    "counterTop",
    "counter",
  );

  box(
    b,
    [2.62, 0.54, 0.045],
    [0, 0.66, -0.645],
    CABINET_WEAR_PAINT,
    "lowerCabinetFront",
    "cabinetFronts",
  );

  for (let i = -4; i <= 4; i++) {
    const x = i * 0.27;
    box(b, [0.025, 0.5, 0.055], [x, 0.66, -0.61], HULL_DARK, undefined, "cabinetSeams");
  }

  box(b, [2.58, 0.035, 0.06], [0, 0.91, -0.605], STEEL_DARK, undefined, "cabinetRails");
  box(b, [2.58, 0.04, 0.08], [0, 0.39, -0.605], STEEL_DARK, undefined, "cabinetRails");

  for (let i = -4; i <= 4; i++) {
    const x = i * 0.27;
    handle(b, [x - 0.07, 0.77, -0.59], [x + 0.07, 0.77, -0.59], STEEL, undefined);
  }

  for (const x of [-1.2, 1.2]) {
    box(b, [0.55, 0.78, 1.46], [x, 0.62, -0.06], HULL_DARK, undefined, "sideCabinets");
    box(b, [0.5, 0.58, 0.04], [x, 0.66, 0.69], HULL, undefined, "sideCabinetFaces");
    box(b, [0.5, 0.58, 0.04], [x, 0.66, -0.81], HULL, undefined, "sideCabinetFaces");
    box(b, [0.04, 0.74, 1.38], [x - 0.29, 0.62, -0.06], STEEL_DARK, undefined, "sideCabinetRails");
    box(b, [0.04, 0.74, 1.38], [x + 0.29, 0.62, -0.06], STEEL_DARK, undefined, "sideCabinetRails");

    for (const z of [0.42, 0.0, -0.42]) {
      handle(b, [x - 0.09, 0.66, z], [x + 0.09, 0.66, z], STEEL, undefined);
    }
  }

  for (let i = 0; i < 8; i++) {
    const x = -1.05 + i * 0.3;
    box(b, [0.18, 0.018, 0.04], [x, 1.185, -0.67], STEEL_DARK, undefined, "counterEdge");
  }

  for (const x of [-1.32, 1.32]) {
    box(b, [0.08, 0.06, 0.55], [x, 1.16, -0.95], STEEL_DARK, undefined, "counterBrackets");
    rivet(b, [x, 1.17, -0.77], STEEL, undefined);
    rivet(b, [x, 1.17, -1.13], STEEL, undefined);
  }
}

function buildSideWorktops(b: Builder) {
  for (const side of [-1, 1]) {
    const x = side * 1.12;
    box(b, [0.62, 0.14, 1.68], [x, 1.08, -0.08], PANEL_LIGHT, undefined, "sideCounter");
    box(b, [0.56, 0.06, 1.58], [x, 1.16, -0.08], HULL, undefined, "sideCounterSurface");
    box(b, [0.06, 0.34, 1.58], [side * 0.81, 0.91, -0.08], HULL_DARK, undefined, "sideBase");
    box(b, [0.06, 0.34, 1.58], [side * 1.43, 0.91, -0.08], HULL_DARK, undefined, "sideBase");

    for (let i = 0; i < 5; i++) {
      const z = 0.52 - i * 0.3;
      box(b, [0.5, 0.022, 0.028], [x, 1.2, z], STEEL_DARK, undefined, "sideCounterSeams");
    }

    for (let i = 0; i < 4; i++) {
      const z = 0.42 - i * 0.32;
      box(b, [0.48, 0.23, 0.035], [x, 0.67, z], HULL, undefined, "sideDrawers");
      handle(b, [x - 0.08, 0.69, z], [x + 0.08, 0.69, z], STEEL, undefined);
    }

    box(b, [0.06, 0.76, 0.055], [side * 0.82, 0.61, -0.08], STEEL_DARK, undefined, "sideFrame");
    box(b, [0.06, 0.76, 0.055], [side * 1.42, 0.61, -0.08], STEEL_DARK, undefined, "sideFrame");
  }
}

function buildUpperCabinets(b: Builder) {
  box(b, [2.84, 0.56, 0.44], [0, 2.05, -1.0], HULL_DARK, "upperCabinetBody", "upperCabinetry");
  box(
    b,
    [2.68, 0.46, 0.045],
    [0, 2.05, -0.755],
    UPPER_LOCKER_PAINT,
    "upperCabinetFront",
    "upperCabinetry",
  );
  box(b, [2.72, 0.06, 0.05], [0, 1.75, -0.73], STEEL_DARK, undefined, "upperRails");
  box(b, [2.72, 0.06, 0.05], [0, 2.34, -0.73], STEEL_DARK, undefined, "upperRails");

  for (const x of [-1.0, -0.5, 0, 0.5, 1.0]) {
    box(b, [0.035, 0.43, 0.055], [x, 2.05, -0.715], HULL_DARK, undefined, "upperDoorSeams");
    handle(b, [x - 0.07, 1.91, -0.68], [x + 0.07, 1.91, -0.68], STEEL, undefined);
  }

  for (const x of [-1.28, -0.86, 0.86, 1.28]) {
    box(b, [0.055, 0.32, 0.12], [x, 2.49, -0.98], STEEL_DARK, undefined, "upperBrackets");
    rod(b, [x, 2.32, -0.82], [x, 2.51, -0.82], 0.018, STEEL, undefined, "upperBrackets");
  }

  for (const side of [-1, 1]) {
    box(b, [0.58, 0.5, 0.42], [side * 1.08, 1.98, -0.99], HULL, undefined, "upperSideLocker");
    box(b, [0.04, 0.42, 0.34], [side * 0.77, 1.98, -0.75], HULL_DARK, undefined, "upperSideLocker");
    handle(b, [side * 1.02, 2.02, -0.71], [side * 1.15, 2.02, -0.71], STEEL, undefined);
  }
}

function buildTallAppliance(b: Builder) {
  box(b, [0.54, 1.78, 0.58], [1.12, 1.18, -0.05], HULL_DARK, "tallAppliance", "appliances");
  box(b, [0.48, 0.78, 0.045], [1.12, 1.68, 0.255], PANEL, "freezerDoor", "appliances");
  box(b, [0.48, 0.74, 0.045], [1.12, 0.74, 0.255], HULL, "applianceDoor", "appliances");
  box(b, [0.04, 1.58, 0.04], [0.82, 1.18, 0.27], STEEL_DARK, undefined, "applianceTrim");
  box(b, [0.04, 1.58, 0.04], [1.42, 1.18, 0.27], STEEL_DARK, undefined, "applianceTrim");
  box(b, [0.42, 0.035, 0.04], [1.12, 1.29, 0.28], STEEL_DARK, undefined, "applianceSeam");

  handle(b, [1.0, 1.7, 0.29], [1.24, 1.7, 0.29], STEEL, undefined);
  handle(b, [1.0, 0.78, 0.29], [1.24, 0.78, 0.29], STEEL, undefined);

  for (let i = 0; i < 5; i++) {
    box(b, [0.24, 0.018, 0.025], [1.12, 1.38 + i * 0.055, 0.29], BLACK, undefined, "applianceVent");
  }

  for (const y of [0.34, 0.46, 1.94, 2.06]) {
    box(b, [0.07, 0.055, 0.42], [0.78, y, -0.04], STEEL_DARK, undefined, "applianceHinge");
    rivet(b, [0.75, y, 0.19], STEEL, undefined);
    rivet(b, [0.75, y, -0.27], STEEL, undefined);
  }

  box(b, [0.46, 0.1, 0.06], [1.12, 2.1, -0.34], STEEL_DARK, undefined, "applianceTop");
  sphere(b, 0.035, [1.0, 2.1, -0.31], RED, undefined, "applianceLights");
  sphere(b, 0.035, [1.12, 2.1, -0.31], AMBER, undefined, "applianceLights");
}

function buildRearServiceModules(b: Builder) {
  box(b, [0.7, 0.72, 0.11], [-0.63, 1.52, -1.09], HULL_DARK, "rearServiceBoxL", "service");
  box(b, [0.7, 0.72, 0.11], [0.27, 1.52, -1.09], HULL_DARK, "rearServiceBoxC", "service");

  for (const x of [-0.87, -0.63, -0.39, 0.03, 0.27, 0.51]) {
    box(b, [0.11, 0.48, 0.045], [x, 1.5, -1.02], PANEL, undefined, "servicePlates");
    box(b, [0.045, 0.34, 0.04], [x, 1.5, -0.985], BLACK, undefined, "serviceSlots");
    rivet(b, [x - 0.035, 1.72, -0.96], STEEL, undefined);
    rivet(b, [x + 0.035, 1.28, -0.96], STEEL_DARK, undefined);
  }

  box(b, [0.62, 0.08, 0.09], [-0.63, 1.97, -1.02], STEEL_DARK, undefined, "serviceTop");
  box(b, [0.62, 0.08, 0.09], [0.27, 1.97, -1.02], STEEL_DARK, undefined, "serviceTop");

  for (const x of [-0.87, -0.63, -0.39, 0.03, 0.27, 0.51]) {
    sphere(b, 0.028, [x, 1.91, -0.95], x < 0 ? AMBER : RED, undefined, "statusLights");
  }
}

function buildPipework(b: Builder) {
  rod(b, [-1.29, 2.48, -1.06], [-1.29, 2.48, 0.78], 0.042, STEEL_DARK, "leftCeilingPipe");
  rod(b, [-1.18, 2.48, -1.06], [-1.18, 2.48, 0.78], 0.025, RUST, "leftCopperPipe");
  rod(b, [-1.07, 2.48, -1.06], [-1.07, 2.48, 0.78], 0.03, STEEL, "leftSteelPipe");

  for (const z of [-0.86, -0.42, 0.02, 0.46]) {
    rod(b, [-1.33, 2.48, z], [-1.03, 2.48, z], 0.05, STEEL_DARK, undefined);
    cylinder(b, 0.065, 0.04, [-1.29, 2.48, z], STEEL, undefined, 8, "pipeCollars");
    cylinder(b, 0.05, 0.04, [-1.11, 2.48, z], RUST, undefined, 8, "pipeCollars");
  }

  rod(b, [1.25, 2.45, -1.02], [1.25, 2.45, 0.78], 0.045, STEEL_DARK, "rightMainDuct");
  rod(b, [1.34, 2.44, -0.9], [1.34, 2.44, 0.72], 0.025, RUST, "rightCopperPipe");

  for (const y of [0.42, 0.86, 1.3, 1.74, 2.18]) {
    cylinder(b, 0.065, 0.05, [1.25, y, -0.9], STEEL, undefined, 8, "pipeCollars");
    rod(b, [1.25, y, -0.9], [1.25, y, -0.68], 0.035, STEEL_DARK, undefined);
  }

  rod(b, [1.31, 2.38, -0.8], [1.31, 2.38, -0.28], 0.032, BLACK, "rightCableVertical");
  rod(b, [1.31, 2.38, -0.28], [1.2, 2.38, -0.18], 0.032, BLACK, "rightCableBend");
  rod(b, [1.2, 2.38, -0.18], [1.2, 2.38, 0.42], 0.032, BLACK, "rightCableFront");

  for (const z of [-0.68, -0.35, -0.02, 0.31]) {
    box(b, [0.12, 0.045, 0.09], [1.2, 2.38, z], STEEL_DARK, undefined, "cableClamps");
    rivet(b, [1.13, 2.38, z], STEEL, undefined);
  }

  rod(b, [-1.31, 0.41, -1.02], [-1.31, 0.41, 0.72], 0.038, STEEL_DARK, "leftLowPipe");
  rod(b, [-1.31, 0.41, 0.72], [-1.02, 0.41, 0.72], 0.038, STEEL_DARK, "leftLowPipe");
  for (const z of [-0.78, -0.36, 0.06, 0.48]) {
    cylinder(b, 0.055, 0.05, [-1.31, 0.41, z], RUST, undefined, 8, "pipeCollars");
  }

  rod(b, [-1.15, 1.18, -1.08], [-1.15, 1.18, -0.72], 0.028, RUST, "counterFeedPipe");
  rod(b, [-1.15, 1.18, -0.72], [-0.72, 1.18, -0.72], 0.028, RUST, "counterFeedPipe");
  cylinder(b, 0.05, 0.04, [-1.15, 1.18, -0.9], STEEL, undefined, 8, "pipeCollars");
  cylinder(b, 0.05, 0.04, [-0.9, 1.18, -0.72], STEEL, undefined, 8, "pipeCollars");
}

function buildCeilingStructure(b: Builder) {
  for (const x of [-1.26, -0.84, -0.42, 0.42, 0.84, 1.26]) {
    box(b, [0.055, 0.06, 2.0], [x, 2.53, -0.08], STEEL_DARK, undefined, "ceilingRibs");
  }

  for (const z of [-0.92, -0.46, 0.0, 0.46, 0.82]) {
    box(b, [2.74, 0.055, 0.06], [0, 2.53, z], STEEL_DARK, undefined, "ceilingRibs");
  }

  box(b, [2.2, 0.06, 0.08], [0, 2.49, -0.68], HULL_DARK, undefined, "ceilingRail");
  box(b, [2.2, 0.06, 0.08], [0, 2.49, 0.56], HULL_DARK, undefined, "ceilingRail");

  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) {
    cylinder(b, 0.035, 0.12, [x, 2.48, -0.68], STEEL, undefined, 8, "ceilingFasteners");
    cylinder(b, 0.035, 0.12, [x, 2.48, 0.56], STEEL, undefined, 8, "ceilingFasteners");
  }

  box(b, [0.5, 0.08, 0.26], [-1.08, 2.48, 0.32], STEEL_DARK, undefined, "ceilingJunction");
  box(b, [0.26, 0.12, 0.12], [-1.08, 2.42, 0.32], RUST, undefined, "ceilingJunction");
  rod(b, [-1.08, 2.4, 0.32], [-0.74, 2.4, 0.32], 0.018, BLACK, undefined, "ceilingCable");
  rod(b, [-1.08, 2.4, 0.32], [-1.28, 2.4, 0.12], 0.018, BLACK, undefined, "ceilingCable");
}

function buildDoorwayAndFrontFrame(b: Builder) {
  for (const side of [-1, 1]) {
    const x = side * 1.48;
    box(b, [0.16, 2.52, 0.16], [x, 1.43, 1.0], STEEL_DARK, undefined, "frontFrame");
    box(b, [0.06, 2.28, 0.08], [side * 1.37, 1.43, 0.91], HULL, undefined, "frontFrame");
    for (let i = 0; i < 7; i++) {
      const y = 0.4 + i * 0.31;
      box(b, [0.22, 0.045, 0.05], [side * 1.36, y, 0.89], i % 2 ? HAZARD : BLACK, undefined, "frontFrameStripes");
    }
    rivet(b, [side * 1.38, 2.42, 0.88], STEEL, undefined);
    rivet(b, [side * 1.38, 0.35, 0.88], STEEL, undefined);
  }

  box(b, [2.86, 0.13, 0.13], [0, 2.61, 0.98], STEEL_DARK, undefined, "frontLintel");
  box(b, [2.56, 0.06, 0.09], [0, 2.52, 0.91], RUST_DARK, undefined, "frontLintel");
  for (const x of [-1.2, -0.6, 0, 0.6, 1.2]) {
    rivet(b, [x, 2.51, 0.89], STEEL, undefined);
  }

  rod(b, [-1.28, 0.32, 0.92], [-1.28, 2.4, 0.92], 0.024, STEEL, "doorSealL", "frame");
  rod(b, [1.28, 0.32, 0.92], [1.28, 2.4, 0.92], 0.024, STEEL, "doorSealR", "frame");
  rod(b, [-1.28, 2.4, 0.92], [1.28, 2.4, 0.92], 0.024, STEEL, "doorSealTop", "frame");
}

function buildSmallIndustrialDetails(b: Builder) {
  box(b, [0.52, 0.42, 0.12], [-1.12, 1.58, 0.93], HULL_DARK, "leftFrontJunction", "service");
  box(b, [0.4, 0.04, 0.25], [-1.12, 1.58, 1.0], PANEL, undefined, "service");
  for (const x of [-1.27, -1.12, -0.97]) {
    sphere(b, 0.026, [x, 1.58, 1.04], x < -1.1 ? RED : AMBER, undefined, "service");
  }

  box(b, [0.52, 0.5, 0.12], [1.12, 2.08, 0.78], HULL_DARK, "rightUpperJunction", "service");
  box(b, [0.38, 0.05, 0.3], [1.12, 2.08, 0.85], PANEL, undefined, "service");
  for (const y of [1.95, 2.08, 2.21]) {
    box(b, [0.23, 0.03, 0.035], [1.12, y, 0.92], BLACK, undefined, "service");
  }

  for (const side of [-1, 1]) {
    box(b, [0.34, 0.3, 0.08], [side * 0.77, 1.34, 0.72], STEEL_DARK, undefined, "cornerBrackets");
    for (const x of [-0.88, -0.76, -0.64]) {
      sphere(b, 0.022, [side * Math.abs(x), 1.35, 0.77], STEEL, undefined, "cornerBrackets");
    }
  }

  box(b, [0.48, 0.05, 0.38], [-0.62, 1.21, -0.7], BLACK, undefined, "counterAccess");
  box(b, [0.42, 0.025, 0.32], [-0.62, 1.24, -0.67], STEEL_DARK, undefined, "counterAccess");
  for (const y of [1.15, 1.21, 1.27]) {
    box(b, [0.33, 0.018, 0.025], [-0.62, y, -0.64], RUST, undefined, "counterAccess");
  }

  box(b, [0.52, 0.18, 0.05], [0.82, 1.23, -0.71], HULL_DARK, undefined, "counterControlRail");
  for (let i = 0; i < 5; i++) {
    cylinder(b, 0.025, 0.04, [0.62 + i * 0.1, 1.35, -0.71], i % 2 ? AMBER : RED, undefined, 8, "counterButtons");
  }

  for (const side of [-1, 1]) {
    box(b, [0.42, 0.46, 0.05], [side * 0.78, 2.37, -0.71], STEEL_DARK, undefined, "upperUnderTrim");
    for (const y of [2.22, 2.36, 2.5]) {
      box(b, [0.24, 0.022, 0.02], [side * 0.78, y, -0.675], BLACK, undefined, "upperUnderTrim");
    }
  }

  box(b, [0.08, 0.5, 0.9], [0, 1.52, -1.08], RUST_DARK, undefined, "centralRearSpine");
  box(b, [0.04, 0.38, 0.72], [0, 1.52, -1.025], STEEL_DARK, undefined, "centralRearSpine");
  for (const y of [1.28, 1.42, 1.56, 1.7, 1.84]) {
    rivet(b, [0, y, -0.96], STEEL, undefined);
  }
}

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  buildFloor(b);
  buildWalls(b);
  buildLowerCabinets(b);
  buildSideWorktops(b);
  buildUpperCabinets(b);
  buildTallAppliance(b);
  buildRearServiceModules(b);
  buildPipework(b);
  buildCeilingStructure(b);
  buildDoorwayAndFrontFrame(b);
  buildSmallIndustrialDetails(b);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addSinkBasin(b: Builder) {
  const [cx, cy, cz] = [0, 1.15, -0.92] as const;
  const group = "stage2-sink";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      at,
      name,
      group,
      flat: true,
      ...(rotation ? { rotation } : {}),
    });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      name,
    );

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 8,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      name,
    );

  const ball = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    part(
      new THREE.SphereGeometry(radius, 8, 5),
      color,
      at,
      name,
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, z, radius, {
      color,
      name,
      group,
      sides: 8,
      smooth: false,
      caps: "round",
    });

  const top = cy + 0.015;
  const innerFloor = top + 0.018;
  const rimY = cy + 0.073;

  // A dark inset cavity sits just above the existing counter surface. The
  // raised stainless rim and deep shadow make the solid stage-one counter read
  // as a cut-out rather than as a floating appliance.
  box(
    [0.73, 0.075, 0.405],
    [cx, top + 0.026, cz],
    STEEL_DARK,
    "sink.outerShell",
  );

  box(
    [0.635, 0.022, 0.305],
    [cx, innerFloor, cz],
    BLACK,
    "sink.deepInterior",
  );

  // Heavy dark inner walls, visible below the bright rim.
  box(
    [0.045, 0.085, 0.33],
    [cx - 0.335, top + 0.043, cz],
    HULL_SHADOW,
    "sink.innerWallL",
  );
  box(
    [0.045, 0.085, 0.33],
    [cx + 0.335, top + 0.043, cz],
    HULL_SHADOW,
    "sink.innerWallR",
  );
  box(
    [0.65, 0.085, 0.045],
    [cx, top + 0.043, cz - 0.177],
    HULL_SHADOW,
    "sink.innerWallBack",
  );
  box(
    [0.65, 0.085, 0.045],
    [cx, top + 0.043, cz + 0.177],
    HULL_SHADOW,
    "sink.innerWallFront",
  );

  // Four broad, low-poly stainless rim pieces.
  box(
    [0.765, 0.052, 0.052],
    [cx, rimY, cz - 0.205],
    STEEL,
    "sink.rim.back",
  );
  box(
    [0.765, 0.052, 0.052],
    [cx, rimY, cz + 0.205],
    STEEL,
    "sink.rim.front",
  );
  box(
    [0.052, 0.052, 0.36],
    [cx - 0.357, rimY, cz],
    STEEL,
    "sink.rim.left",
  );
  box(
    [0.052, 0.052, 0.36],
    [cx + 0.357, rimY, cz],
    STEEL,
    "sink.rim.right",
  );

  // Dark seam lines immediately inside the rim.
  box(
    [0.64, 0.012, 0.014],
    [cx, rimY - 0.026, cz - 0.175],
    BLACK,
    "sink.seam.back",
  );
  box(
    [0.64, 0.012, 0.014],
    [cx, rimY - 0.026, cz + 0.175],
    BLACK,
    "sink.seam.front",
  );
  box(
    [0.014, 0.012, 0.31],
    [cx - 0.325, rimY - 0.026, cz],
    BLACK,
    "sink.seam.left",
  );
  box(
    [0.014, 0.012, 0.31],
    [cx + 0.325, rimY - 0.026, cz],
    BLACK,
    "sink.seam.right",
  );

  // Corner fasteners make the basin feel bolted into the counter.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = cx + sx * 0.322;
      const z = cz + sz * 0.17;
      cylinder(
        0.018,
        0.014,
        [x, rimY + 0.032, z],
        STEEL_DARK,
        `sink.rivet.${sx}.${sz}`,
        8,
      );
      ball(
        0.012,
        [x, rimY + 0.043, z],
        PANEL_LIGHT,
        `sink.rivetHead.${sx}.${sz}`,
      );
    }
  }

  // Drain plate, black centre and a chunky cross grate.
  cylinder(
    0.073,
    0.012,
    [cx, innerFloor + 0.017, cz],
    STEEL_DARK,
    "sink.drainPlate",
    12,
  );
  cylinder(
    0.052,
    0.014,
    [cx, innerFloor + 0.026, cz],
    BLACK,
    "sink.drainDark",
    12,
  );
  box(
    [0.092, 0.009, 0.012],
    [cx, innerFloor + 0.037, cz],
    STEEL,
    "sink.drainCrossX",
  );
  box(
    [0.012, 0.009, 0.092],
    [cx, innerFloor + 0.038, cz],
    STEEL,
    "sink.drainCrossZ",
  );

  // Subtle drain radial bars, kept broad enough to read as primitive hardware.
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4;
    const dx = Math.sin(angle) * 0.06;
    const dz = Math.cos(angle) * 0.06;
    rod(
      [cx, innerFloor + 0.036, cz],
      [cx + dx, innerFloor + 0.036, cz + dz],
      0.006,
      STEEL_DARK,
      `sink.drainSpoke${i}`,
    );
  }

  // Angular faucet mounted on the rear rim.
  const faucetX = cx + 0.02;
  const faucetBack: [number, number, number] = [faucetX, rimY + 0.015, cz - 0.185];
  cylinder(
    0.062,
    0.018,
    faucetBack,
    STEEL_DARK,
    "sink.faucetBase",
    10,
  );
  cylinder(
    0.043,
    0.012,
    [faucetX, rimY + 0.029, cz - 0.185],
    RUST,
    "sink.faucetCollar",
    10,
  );

  rod(
    [faucetX, rimY + 0.025, cz - 0.185],
    [faucetX, rimY + 0.13, cz - 0.185],
    0.026,
    STEEL,
    "sink.faucetUpright",
  );
  rod(
    [faucetX, rimY + 0.13, cz - 0.185],
    [faucetX, rimY + 0.13, cz - 0.055],
    0.026,
    STEEL,
    "sink.faucetArm",
  );
  rod(
    [faucetX, rimY + 0.13, cz - 0.055],
    [faucetX, rimY + 0.075, cz - 0.055],
    0.024,
    STEEL_DARK,
    "sink.faucetNozzle",
  );
  cylinder(
    0.031,
    0.012,
    [faucetX, rimY + 0.069, cz - 0.055],
    BLACK,
    "sink.faucetNozzleTip",
    8,
  );
  ball(
    0.034,
    [faucetX, rimY + 0.132, cz - 0.185],
    STEEL_DARK,
    "sink.faucetElbow",
  );

  // Two chunky mixer controls, one oxidised hot and one cold steel.
  const controls = [
    { x: cx - 0.235, color: RUST, tag: "hot" },
    { x: cx + 0.235, color: STEEL, tag: "cold" },
  ];

  for (const control of controls) {
    cylinder(
      0.045,
      0.022,
      [control.x, rimY + 0.015, cz - 0.145],
      STEEL_DARK,
      `sink.${control.tag}.base`,
      8,
    );
    cylinder(
      0.031,
      0.038,
      [control.x, rimY + 0.042, cz - 0.145],
      control.color,
      `sink.${control.tag}.knob`,
      8,
    );
    ball(
      0.034,
      [control.x, rimY + 0.066, cz - 0.145],
      control.color,
      `sink.${control.tag}.cap`,
    );
    rod(
      [control.x, rimY + 0.082, cz - 0.145],
      [control.x + (control.tag === "hot" ? 0.048 : -0.048), rimY + 0.087, cz - 0.145],
      0.009,
      BLACK,
      `sink.${control.tag}.lever`,
    );
  }

  // Small copper feed collars and two short visible service pipes at the back.
  for (const x of [cx - 0.235, cx + 0.235]) {
    cylinder(
      0.022,
      0.018,
      [x, rimY - 0.008, cz - 0.205],
      RUST,
      `sink.feedCollar.${x < cx ? "L" : "R"}`,
      8,
    );
    rod(
      [x, top + 0.005, cz - 0.205],
      [x, top - 0.035, cz - 0.205],
      0.012,
      STEEL_DARK,
      `sink.feedPipe.${x < cx ? "L" : "R"}`,
    );
  }
}
    return addSinkBasin;
  })(),
);
// add2
STAGE2.push(
  (() => {
type P = [number, number, number];

function rBox(
  b: Builder,
  size: P,
  at: P,
  color: string,
  name: string,
  group: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    group,
    flat: true,
  });
}

function rCylinder(
  b: Builder,
  radius: number,
  height: number,
  at: P,
  color: string,
  name: string,
  group: string,
  segments = 8,
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, segments),
    color,
    { at, name, group, flat: true },
  );
}

function rRod(
  b: Builder,
  a: P,
  c: P,
  radius: number,
  color: string,
  name: string,
  group: string,
) {
  return b.rod(a, c, radius, {
    color,
    name,
    group,
    section: "circle",
    sides: 8,
    smooth: false,
    caps: "round",
  });
}

function addRangeTop(b: Builder) {
  // -----------------------------------------------------------------------------------------------
  // Compact two-burner range, fitted into the clear right-hand section of the rear counter.

  const rangeX = 0.86;
  const rangeY = 1.185;
  const rangeZ = -0.92;

  rBox(
    b,
    [0.68, 0.035, 0.43],
    [rangeX, rangeY, rangeZ],
    BLACK,
    "s22RangeTray",
    "s22Range",
  );

  // A pale metal lip catches the light around the otherwise very dark appliance.
  rBox(
    b,
    [0.70, 0.035, 0.026],
    [rangeX, 1.205, rangeZ - 0.205],
    STEEL_DARK,
    "s22RangeFrontLip",
    "s22Range",
  );
  rBox(
    b,
    [0.70, 0.035, 0.026],
    [rangeX, 1.205, rangeZ + 0.205],
    STEEL_DARK,
    "s22RangeRearLip",
    "s22Range",
  );
  rBox(
    b,
    [0.026, 0.035, 0.40],
    [rangeX - 0.337, 1.205, rangeZ],
    STEEL_DARK,
    "s22RangeLeftLip",
    "s22Range",
  );
  rBox(
    b,
    [0.026, 0.035, 0.40],
    [rangeX + 0.337, 1.205, rangeZ],
    STEEL_DARK,
    "s22RangeRightLip",
    "s22Range",
  );

  const burnerXs = [0.69, 1.03];
  for (let i = 0; i < burnerXs.length; i++) {
    const x = burnerXs[i];
    const prefix = `s22Burner${i}`;

    rCylinder(
      b,
      0.112,
      0.018,
      [x, 1.208, rangeZ],
      STEEL_DARK,
      `${prefix}OuterPlate`,
      "s22Range",
      12,
    );
    rCylinder(
      b,
      0.082,
      0.021,
      [x, 1.219, rangeZ],
      BLACK,
      `${prefix}DarkPlate`,
      "s22Range",
      12,
    );
    rCylinder(
      b,
      0.027,
      0.024,
      [x, 1.235, rangeZ],
      STEEL,
      `${prefix}CentreCap`,
      "s22Range",
      8,
    );

    // Four square pot-support bars, deliberately a little overbuilt.
    rBox(
      b,
      [0.025, 0.042, 0.19],
      [x - 0.078, 1.238, rangeZ],
      STEEL,
      `${prefix}SupportL`,
      "s22RangeSupports",
    );
    rBox(
      b,
      [0.025, 0.042, 0.19],
      [x + 0.078, 1.238, rangeZ],
      STEEL,
      `${prefix}SupportR`,
      "s22RangeSupports",
    );
    rBox(
      b,
      [0.19, 0.042, 0.025],
      [x, 1.238, rangeZ - 0.078],
      STEEL,
      `${prefix}SupportFront`,
      "s22RangeSupports",
    );
    rBox(
      b,
      [0.19, 0.042, 0.025],
      [x, 1.238, rangeZ + 0.078],
      STEEL,
      `${prefix}SupportBack`,
      "s22RangeSupports",
    );

    // Small black feet make the supports read as separate cast-metal pieces.
    for (const dx of [-0.078, 0.078]) {
      for (const dz of [-0.078, 0.078]) {
        rCylinder(
          b,
          0.014,
          0.012,
          [x + dx, 1.214, rangeZ + dz],
          BLACK,
          `${prefix}SupportFoot${dx}${dz}`,
          "s22RangeSupports",
          6,
        );
      }
    }
  }

  // Front control rail: four tactile indicator buttons, two red and two amber.
  rBox(
    b,
    [0.58, 0.035, 0.052],
    [rangeX, 1.212, -0.695],
    STEEL_DARK,
    "s22RangeControlRail",
    "s22RangeControls",
  );
  rBox(
    b,
    [0.54, 0.018, 0.016],
    [rangeX, 1.238, -0.665],
    STEEL,
    "s22RangeControlHighlight",
    "s22RangeControls",
  );

  const buttonXs = [0.635, 0.785, 0.935, 1.085];
  const buttonColors = [RED, AMBER, RED, AMBER];
  for (let i = 0; i < buttonXs.length; i++) {
    rCylinder(
      b,
      0.022,
      0.026,
      [buttonXs[i], 1.238, -0.695],
      BLACK,
      `s22RangeButtonSocket${i}`,
      "s22RangeControls",
      8,
    );
    rCylinder(
      b,
      0.014,
      0.030,
      [buttonXs[i], 1.254, -0.695],
      buttonColors[i],
      `s22RangeButton${i}`,
      "s22RangeControls",
      8,
    );
  }

  // Two squat adjustment knobs at the rear, giving the appliance a convincing mechanical interface.
  for (let i = 0; i < 2; i++) {
    const x = 0.755 + i * 0.21;
    rCylinder(
      b,
      0.028,
      0.025,
      [x, 1.226, -1.145],
      STEEL_DARK,
      `s22RangeRearKnobSocket${i}`,
      "s22RangeControls",
      8,
    );
    rCylinder(
      b,
      0.018,
      0.038,
      [x, 1.247, -1.145],
      i === 0 ? AMBER : RED,
      `s22RangeRearKnob${i}`,
      "s22RangeControls",
      8,
    );
  }

  // Corner fasteners and a pair of short warning bars on the range fascia.
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? 0.545 : 1.175;
    const z = i % 2 === 0 ? -1.105 : -0.735;
    rCylinder(
      b,
      0.014,
      0.018,
      [x, 1.226, z],
      STEEL,
      `s22RangeFastener${i}`,
      "s22RangeFasteners",
      8,
    );
  }
  rBox(
    b,
    [0.12, 0.012, 0.018],
    [0.615, 1.229, -0.72],
    HAZARD,
    "s22RangeWarningBarA",
    "s22RangeControls",
  );
  rBox(
    b,
    [0.07, 0.012, 0.018],
    [1.115, 1.229, -0.72],
    RED,
    "s22RangeWarningBarB",
    "s22RangeControls",
  );

  // -----------------------------------------------------------------------------------------------
  // Exposed retro-futurist ceiling light bar.

  const lightY = 2.505;
  const lightZ = -0.05;

  rBox(
    b,
    [1.78, 0.062, 0.18],
    [0, 2.555, lightZ],
    HULL_DARK,
    "s22LightBarHousing",
    "s22CeilingLight",
  );
  rBox(
    b,
    [1.68, 0.025, 0.145],
    [0, 2.515, lightZ],
    BLACK,
    "s22LightBarRecess",
    "s22CeilingLight",
  );

  // Heavy end plates make the bar look bolted into the ceiling rather than floating.
  for (const side of [-1, 1]) {
    rBox(
      b,
      [0.055, 0.095, 0.20],
      [side * 0.875, 2.54, lightZ],
      STEEL_DARK,
      `s22LightBarEndPlate${side}`,
      "s22CeilingLight",
    );
    rCylinder(
      b,
      0.018,
      0.022,
      [side * 0.875, 2.50, -0.115],
      STEEL,
      `s22LightBarEndRivetLow${side}`,
      "s22CeilingLight",
      8,
    );
    rCylinder(
      b,
      0.018,
      0.022,
      [side * 0.875, 2.50, 0.015],
      STEEL,
      `s22LightBarEndRivetHigh${side}`,
      "s22CeilingLight",
      8,
    );
  }

  // Two short suspension shoes disappear into the existing ceiling skin.
  for (const x of [-0.66, 0.66]) {
    rBox(
      b,
      [0.055, 0.10, 0.09],
      [x, 2.585, lightZ],
      STEEL_DARK,
      `s22LightSuspension${x}`,
      "s22CeilingLight",
    );
    rCylinder(
      b,
      0.018,
      0.028,
      [x, 2.535, lightZ - 0.055],
      STEEL,
      `s22LightSuspensionBolt${x}`,
      "s22CeilingLight",
      8,
    );
  }

  // Six alternating chunky fluorescent modules.
  const lampXs = [-0.70, -0.42, -0.14, 0.14, 0.42, 0.70];
  const lampColors = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];
  for (let i = 0; i < lampXs.length; i++) {
    const x = lampXs[i];
    const lamp = rBox(
      b,
      [0.225, 0.052, 0.115],
      [x, lightY, lightZ],
      lampColors[i],
      `s22Lamp${i}`,
      "s22CeilingLight",
    );
    glow(lamp, 1.8);

    // Black collars at each end preserve the individual-module silhouette.
    rBox(
      b,
      [0.018, 0.068, 0.125],
      [x - 0.106, lightY, lightZ],
      BLACK,
      `s22Lamp${i}LeftCollar`,
      "s22CeilingLight",
    );
    rBox(
      b,
      [0.018, 0.068, 0.125],
      [x + 0.106, lightY, lightZ],
      BLACK,
      `s22Lamp${i}RightCollar`,
      "s22CeilingLight",
    );
  }

  // Small dark cable loops rise behind the housing and fold back into it.
  const cableLoops: Array<[P, P, P, P]> = [
    [
      [-0.82, 2.575, 0.045],
      [-0.82, 2.625, 0.045],
      [-0.70, 2.625, 0.045],
      [-0.64, 2.575, 0.045],
    ],
    [
      [-0.52, 2.575, 0.065],
      [-0.52, 2.615, 0.065],
      [-0.42, 2.615, 0.065],
      [-0.37, 2.575, 0.065],
    ],
    [
      [0.82, 2.575, 0.045],
      [0.82, 2.625, 0.045],
      [0.70, 2.625, 0.045],
      [0.64, 2.575, 0.045],
    ],
    [
      [0.52, 2.575, 0.065],
      [0.52, 2.615, 0.065],
      [0.42, 2.615, 0.065],
      [0.37, 2.575, 0.065],
    ],
  ];

  for (let i = 0; i < cableLoops.length; i++) {
    const [a, b0, c, d] = cableLoops[i];
    rRod(b, a, b0, 0.012, BLACK, `s22LightCable${i}A`, "s22LightCables");
    rRod(b, b0, c, 0.012, BLACK, `s22LightCable${i}B`, "s22LightCables");
    rRod(b, c, d, 0.012, BLACK, `s22LightCable${i}C`, "s22LightCables");

    rCylinder(
      b,
      0.018,
      0.022,
      [d[0], d[1], d[2]],
      STEEL_DARK,
      `s22LightCableClamp${i}`,
      "s22LightCables",
      8,
    );
  }

  // Two tiny amber service LEDs on the housing distinguish the light unit from a simple ceiling panel.
  for (const x of [-0.82, 0.82]) {
    const led = rCylinder(
      b,
      0.012,
      0.018,
      [x, 2.575, -0.145],
      AMBER,
      `s22LightServiceLed${x}`,
      "s22CeilingLight",
      8,
    );
    glow(led, 1.2);
  }
}
    return addRangeTop;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWallControlPanel(b: Builder) {
  const cx = 1.0;
  const cz = -1.18;

  const panelBox = (
    size: [number, number, number],
    x: number,
    y: number,
    z: number,
    color: string,
    name: string,
  ) => box(b, size, [x, y, z], color, `s23_${name}`, "s23_controlPanel");

  const panelRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => rod(b, a, c, radius, color, `s23_${name}`, "s23_controlPanel");

  const panelLamp = (
    x: number,
    y: number,
    color: string,
    name: string,
  ) => {
    b.part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8),
      STEEL,
      {
        at: [x, y, -1.151],
        dir: [0, 0, 1],
        flat: true,
        name: `s23_${name}_collar`,
        group: "s23_controlPanel",
      },
    );
    sphere(
      b,
      0.021,
      [x, y, -1.139],
      color,
      `s23_${name}_lamp`,
      "s23_controlPanel",
    );
  };

  // Deep mounting plate and the raised, heavy industrial housing.
  panelBox([0.52, 0.62, 0.032], cx, 1.62, -1.184, HULL_DARK, "housing");
  panelBox([0.45, 0.55, 0.018], cx, 1.62, -1.166, STEEL_DARK, "innerBacking");

  panelBox([0.47, 0.045, 0.018], cx, 1.902, -1.151, HULL_DARK, "frameTop");
  panelBox([0.47, 0.045, 0.018], cx, 1.338, -1.151, HULL_DARK, "frameBottom");
  panelBox([0.045, 0.52, 0.018], 0.774, 1.62, -1.151, HULL_DARK, "frameLeft");
  panelBox([0.045, 0.52, 0.018], 1.226, 1.62, -1.151, HULL_DARK, "frameRight");

  panelBox([0.39, 0.018, 0.012], cx, 1.878, -1.139, STEEL, "topBevel");
  panelBox([0.39, 0.018, 0.012], cx, 1.362, -1.139, STEEL_DARK, "bottomBevel");
  panelBox([0.018, 0.48, 0.012], 0.796, 1.62, -1.139, STEEL_DARK, "leftBevel");
  panelBox([0.018, 0.48, 0.012], 1.204, 1.62, -1.139, STEEL, "rightBevel");

  for (const [x, y, n] of [
    [0.792, 1.884, "mountTL"],
    [1.208, 1.884, "mountTR"],
    [0.792, 1.356, "mountBL"],
    [1.208, 1.356, "mountBR"],
  ] as const) {
    rivet(b, [x, y, -1.128], STEEL, `s23_${n}`);
  }

  // Three separate recessed display windows, each with a bevel and scan bars.
  const displayRows = [1.81, 1.72, 1.63];
  displayRows.forEach((y, i) => {
    panelBox([0.305, 0.073, 0.018], 1.015, y, -1.143, STEEL_DARK, `displayBezel${i}`);
    panelBox([0.274, 0.041, 0.012], 1.015, y, -1.132, BLACK, `displayGlass${i}`);

    panelBox(
      [0.145, 0.006, 0.006],
      0.965,
      y + 0.010,
      -1.123,
      i === 1 ? AMBER : CYAN,
      `displayScan${i}A`,
    );
    panelBox(
      [0.082 + i * 0.018, 0.006, 0.006],
      1.055,
      y - 0.010,
      -1.123,
      STEEL,
      `displayScan${i}B`,
    );

    for (let k = 0; k < 3; k++) {
      panelBox(
        [0.012, 0.004, 0.006],
        0.90 + k * 0.045,
        y - 0.018,
        -1.123,
        i === 2 && k === 1 ? RED : HULL,
        `displayPixel${i}_${k}`,
      );
    }
  });

  // Tiny raised label bars above the displays read like worn stencilled markings.
  panelBox([0.09, 0.008, 0.006], 0.855, 1.884, -1.124, OFF_WHITE, "labelA");
  panelBox([0.044, 0.008, 0.006], 0.955, 1.884, -1.124, OFF_WHITE, "labelB");
  panelBox([0.064, 0.008, 0.006], 1.105, 1.884, -1.124, OFF_WHITE, "labelC");
  panelBox([0.028, 0.008, 0.006], 1.16, 1.884, -1.124, RUST, "labelRust");

  // A vertical indicator strip on the left edge, with warning lamps in metal collars.
  panelBox([0.055, 0.27, 0.016], 0.835, 1.735, -1.141, BLACK, "warningStrip");
  panelLamp(0.835, 1.815, RED, "warningTop");
  panelLamp(0.835, 1.735, RED, "warningMid");
  panelLamp(0.835, 1.655, RED, "warningBottom");

  // Two tactile toggle banks under the displays.
  for (const [x, bank] of [
    [0.855, "left"],
    [1.175, "right"],
  ] as const) {
    panelBox([0.105, 0.145, 0.018], x, 1.475, -1.142, BLACK, `toggleBank_${bank}`);
    panelBox([0.085, 0.012, 0.008], x, 1.542, -1.128, STEEL_DARK, `toggleHeader_${bank}`);
    panelBox([0.085, 0.012, 0.008], x, 1.408, -1.128, STEEL_DARK, `toggleFooter_${bank}`);

    for (let i = 0; i < 2; i++) {
      const y = 1.455 + i * 0.052;
      panelBox([0.018, 0.034, 0.009], x, y, -1.126, STEEL_DARK, `toggleSlot_${bank}_${i}`);

      panelRod(
        [x - 0.012, y - 0.010, -1.119],
        [x + 0.012, y + 0.011, -1.097],
        0.009,
        STEEL,
        `toggle_${bank}_${i}`,
      );
      sphere(
        b,
        0.014,
        [x + 0.012, y + 0.011, -1.096],
        i === 0 ? AMBER : HULL_LIGHT,
        `toggleCap_${bank}_${i}`,
        "s23_controlPanel",
      );
    }
  }

  // Small amber status readout between the toggle banks and the lower rail.
  panelBox([0.105, 0.058, 0.018], 1.015, 1.405, -1.142, STEEL_DARK, "statusBezel");
  panelBox([0.078, 0.031, 0.010], 1.015, 1.405, -1.130, BLACK, "statusGlass");
  panelBox([0.049, 0.012, 0.006], 1.015, 1.405, -1.121, AMBER, "statusAmber");
  panelBox([0.010, 0.012, 0.006], 0.966, 1.405, -1.121, RED, "statusFault");
  panelBox([0.010, 0.012, 0.006], 1.064, 1.405, -1.121, HULL, "statusReady");

  // Raised emergency stripe and a row of physical service fasteners.
  panelBox([0.32, 0.018, 0.008], 1.015, 1.365, -1.124, RED, "emergencyStripe");
  panelBox([0.10, 0.008, 0.006], 0.835, 1.365, -1.124, OFF_WHITE, "lowerLabel");
  panelBox([0.07, 0.008, 0.006], 1.185, 1.365, -1.124, OFF_WHITE, "lowerLabelRight");

  for (let i = 0; i < 5; i++) {
    const x = 0.865 + i * 0.075;
    cylinder(
      b,
      0.010,
      0.009,
      [x, 1.372, -1.119],
      i === 2 ? RUST : STEEL_DARK,
      `s23_lowerFastener${i}`,
      6,
      "s23_controlPanel",
    );
  }

  // Two short conduit entries make the panel feel wired into the rear bulkhead.
  panelRod([0.785, 1.425, -1.128], [0.785, 1.425, -1.092], 0.012, RUST, "leftConduit");
  panelRod([1.215, 1.455, -1.128], [1.215, 1.455, -1.092], 0.012, STEEL_DARK, "rightConduit");
  cylinder(b, 0.022, 0.014, [0.785, 1.425, -1.126], STEEL, "leftConduitCollar", 8, "s23_controlPanel");
  cylinder(b, 0.022, 0.014, [1.215, 1.455, -1.126], STEEL, "rightConduitCollar", 8, "s23_controlPanel");

  // A few asymmetrical chips/plates keep it from looking like a clean laboratory panel.
  panelBox([0.025, 0.075, 0.009], 1.193, 1.835, -1.128, RUST, "rustChipTop");
  panelBox([0.014, 0.045, 0.009], 0.807, 1.555, -1.128, RUST_DARK, "rustChipSide");
  panelBox([0.042, 0.018, 0.009], 1.145, 1.505, -1.128, PANEL_LIGHT, "maintenancePlate");
  panelBox([0.022, 0.006, 0.006], 1.145, 1.505, -1.116, BLACK, "maintenancePlateMark");
}
    return addWallControlPanel;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addUtensilRail(b: Builder) {
  const group = "s24_galley_details";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      name,
      group,
      flat: true,
      ...options,
    });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      name,
      options,
    );

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, 8, 1),
      color,
      at,
      name,
      options,
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.SphereGeometry(radius, 8, 5),
      color,
      at,
      name,
      options,
    );

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      name,
      group,
      section: "circle",
      sides: 8,
      smooth: false,
      caps: "round",
    });

  const screw = (
    at: [number, number, number],
    name: string,
    color = STEEL,
    radius = 0.018,
  ) => {
    cylinder(radius, 0.018, at, color, name, {
      dir: [0, 0, 1],
      axis: "y",
    });
    box(
      [radius * 1.25, 0.006, 0.006],
      [at[0], at[1], at[2] + 0.012],
      BLACK,
      `${name}_slot`,
    );
  };

  const railZ = -0.574;
  const plateZ = -0.603;

  // -----------------------------------------------------------------------------------------------
  // Magnetic utensil rail: a heavy back plate, three proud mounts, a steel bar and locking collars.

  box(
    [1.02, 0.105, 0.032],
    [-0.82, 1.598, plateZ],
    HULL_DARK,
    "s24_utensil_backplate",
  );
  box(
    [0.94, 0.018, 0.018],
    [-0.82, 1.598, -0.579],
    STEEL_DARK,
    "s24_utensil_backplate_bevel",
  );

  for (const [i, x] of [-1.26, -0.82, -0.38].entries()) {
    rod([x, 1.598, -0.595], [x, 1.598, railZ], 0.014, STEEL_DARK, `s24_rail_standoff_${i}`);
    cylinder(
      0.032,
      0.026,
      [x, 1.598, -0.595],
      STEEL,
      `s24_rail_mount_${i}`,
      { dir: [0, 0, 1], axis: "y" },
    );
    screw([x, 1.598, -0.574], `s24_rail_mount_screw_${i}`, STEEL, 0.015);
  }

  rod(
    [-1.285, 1.598, railZ],
    [-0.355, 1.598, railZ],
    0.025,
    STEEL,
    "s24_magnetic_utensil_bar",
  );

  for (const [i, x] of [-1.285, -0.355].entries()) {
    cylinder(
      0.042,
      0.035,
      [x, 1.598, railZ],
      STEEL_DARK,
      `s24_rail_end_collar_${i}`,
      { dir: [1, 0, 0], axis: "y" },
    );
    cylinder(
      0.028,
      0.044,
      [x, 1.598, railZ],
      STEEL,
      `s24_rail_end_cap_${i}`,
      { dir: [1, 0, 0], axis: "y" },
    );
  }

  for (const x of [-1.08, -0.82, -0.56, -0.35]) {
    cylinder(
      0.035,
      0.053,
      [x, 1.598, railZ],
      STEEL_DARK,
      `s24_tool_magnetic_collar_${x.toFixed(2)}`,
      { dir: [1, 0, 0], axis: "y" },
    );
    cylinder(
      0.026,
      0.058,
      [x, 1.598, railZ],
      STEEL,
      `s24_tool_collar_face_${x.toFixed(2)}`,
      { dir: [1, 0, 0], axis: "y" },
    );
  }

  // A tiny old stencil on the rail's backing plate.
  const utensilStencil = svg(
    `<svg viewBox="0 0 160 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="32" fill="#1b211e"/>
      <path d="M5 5h150v22H5z" fill="none" stroke="#c8c1a8" stroke-width="2"/>
      <text x="80" y="21" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="2" fill="#c8c1a8">UTL-04</text>
    </svg>`,
    { size: 128 },
  );

  part(
    new THREE.PlaneGeometry(0.23, 0.046),
    OFF_WHITE,
    [-0.82, 1.645, -0.579],
    "s24_utensil_stencil",
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: utensilStencil,
    },
  );

  // -----------------------------------------------------------------------------------------------
  // Hanging ladle. The bowl is deliberately faceted and slightly flattened against the wall.

  const ladleX = -1.08;
  rod(
    [ladleX, 1.574, -0.548],
    [ladleX, 1.472, -0.548],
    0.013,
    STEEL,
    "s24_ladle_stem",
  );
  cylinder(
    0.024,
    0.032,
    [ladleX, 1.568, -0.548],
    STEEL_DARK,
    "s24_ladle_handle_collar",
    { dir: [0, 1, 0], axis: "y" },
  );
  sphere(
    0.048,
    [ladleX, 1.428, -0.548],
    STEEL,
    "s24_ladle_bowl",
    { scale: [1.0, 0.48, 0.72] },
  );
  sphere(
    0.018,
    [ladleX, 1.451, -0.585],
    BLACK,
    "s24_ladle_bowl_shadow",
    { scale: [1.2, 0.4, 0.45] },
  );
  rod(
    [ladleX - 0.026, 1.574, -0.548],
    [ladleX + 0.026, 1.574, -0.548],
    0.011,
    STEEL_DARK,
    "s24_ladle_hanging_loop",
  );

  // -----------------------------------------------------------------------------------------------
  // Slotted spatula: broad blade, three punched slots and a dark polymer grip.

  const spatulaX = -0.82;
  rod(
    [spatulaX, 1.574, -0.548],
    [spatulaX, 1.484, -0.548],
    0.014,
    STEEL_DARK,
    "s24_spatula_stem",
  );
  box(
    [0.045, 0.06, 0.035],
    [spatulaX, 1.525, -0.548],
    BLACK,
    "s24_spatula_grip",
  );
  box(
    [0.078, 0.018, 0.034],
    [spatulaX, 1.485, -0.548],
    STEEL,
    "s24_spatula_neck",
  );

  b.extrude(
    [
      [-0.039, 0],
      [0.039, 0],
      [0.031, 0.074],
      [0.018, 0.092],
      [-0.018, 0.092],
      [-0.031, 0.074],
    ],
    {
      at: [spatulaX, 1.397, -0.548],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: STEEL,
      name: "s24_spatula_blade",
      group,
    },
  );

  for (const [i, dx] of [-0.022, 0, 0.022].entries()) {
    box(
      [0.008, 0.045, 0.006],
      [spatulaX + dx, 1.445, -0.536],
      BLACK,
      `s24_spatula_slot_${i}`,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Long knife: black handle, steel bolster, broad angular blade and a rust-coloured tang cap.

  const knifeX = -0.56;
  rod(
    [knifeX, 1.574, -0.548],
    [knifeX, 1.526, -0.548],
    0.013,
    STEEL_DARK,
    "s24_knife_hanger",
  );
  box(
    [0.046, 0.074, 0.035],
    [knifeX, 1.492, -0.548],
    BLACK,
    "s24_knife_handle",
  );
  box(
    [0.058, 0.018, 0.04],
    [knifeX, 1.529, -0.548],
    STEEL,
    "s24_knife_bolster",
  );
  box(
    [0.046, 0.014, 0.042],
    [knifeX, 1.452, -0.548],
    RUST,
    "s24_knife_handle_cap",
  );

  b.extrude(
    [
      [-0.027, 0],
      [0.027, 0],
      [0.034, 0.048],
      [0.016, 0.1],
      [-0.026, 0.078],
      [-0.034, 0.03],
    ],
    {
      at: [knifeX, 1.397, -0.548],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.015,
      bevel: 0.002,
      color: STEEL,
      name: "s24_knife_blade",
      group,
    },
  );
  box(
    [0.012, 0.004, 0.006],
    [knifeX - 0.011, 1.442, -0.537],
    OFF_WHITE,
    "s24_knife_blade_highlight",
  );

  // -----------------------------------------------------------------------------------------------
  // J-shaped hook with a wide mounting eye and a rusted lower tip.

  const hookX = -0.35;
  rod(
    [hookX, 1.574, -0.548],
    [hookX, 1.447, -0.548],
    0.012,
    STEEL_DARK,
    "s24_hook_stem",
  );
  rod(
    [hookX, 1.447, -0.548],
    [hookX + 0.045, 1.415, -0.548],
    0.012,
    STEEL_DARK,
    "s24_hook_curve",
  );
  rod(
    [hookX + 0.045, 1.415, -0.548],
    [hookX + 0.075, 1.449, -0.548],
    0.012,
    STEEL_DARK,
    "s24_hook_tip",
  );
  sphere(
    0.022,
    [hookX, 1.572, -0.548],
    STEEL,
    "s24_hook_eye",
    { scale: [1.15, 0.7, 0.75] },
  );
  cylinder(
    0.016,
    0.026,
    [hookX + 0.058, 1.433, -0.548],
    RUST,
    "s24_hook_rust_tip",
    { dir: [0, 0, 1], axis: "y" },
  );

  // Small retaining clips at the lower edge of the back plate.
  for (const [i, x] of [-1.255, -0.385].entries()) {
    box(
      [0.06, 0.04, 0.035],
      [x, 1.535, -0.581],
      HULL_DARK,
      `s24_rail_lower_clip_${i}`,
    );
    screw([x, 1.535, -0.558], `s24_rail_lower_screw_${i}`, STEEL, 0.012);
  }

  // -----------------------------------------------------------------------------------------------
  // Rear-wall ventilation bank, mounted in the reserved left-hand section.

  const ventX = -1.13;
  const ventZ = -1.153;

  box(
    [0.58, 0.64, 0.038],
    [ventX, 1.58, ventZ],
    HULL_DARK,
    "s24_vent_backing",
  );

  box(
    [0.575, 0.045, 0.045],
    [ventX, 1.895, -1.126],
    STEEL_DARK,
    "s24_vent_frame_top",
  );
  box(
    [0.575, 0.045, 0.045],
    [ventX, 1.265, -1.126],
    STEEL_DARK,
    "s24_vent_frame_bottom",
  );
  box(
    [0.045, 0.585, 0.045],
    [-1.405, 1.58, -1.126],
    STEEL_DARK,
    "s24_vent_frame_left",
  );
  box(
    [0.045, 0.585, 0.045],
    [-0.855, 1.58, -1.126],
    STEEL_DARK,
    "s24_vent_frame_right",
  );

  // A raised inner lip gives the black slot bank real depth.
  box(
    [0.31, 0.5, 0.027],
    [-1.255, 1.58, -1.125],
    BLACK,
    "s24_vent_slot_well",
  );
  box(
    [0.32, 0.025, 0.035],
    [-1.255, 1.83, -1.106],
    PANEL,
    "s24_vent_slot_lip_top",
  );
  box(
    [0.32, 0.025, 0.035],
    [-1.255, 1.33, -1.106],
    PANEL,
    "s24_vent_slot_lip_bottom",
  );

  for (let i = 0; i < 6; i++) {
    const y = 1.385 + i * 0.078;
    box(
      [0.265, 0.043, 0.018],
      [-1.255, y, -1.099],
      BLACK,
      `s24_vent_deep_slot_${i}`,
    );
    box(
      [0.265, 0.009, 0.012],
      [-1.255, y + 0.026, -1.087],
      STEEL_DARK,
      `s24_vent_slot_upper_edge_${i}`,
    );
  }

  // Central coarse mesh grille.
  box(
    [0.19, 0.4, 0.031],
    [-0.95, 1.58, -1.119],
    HULL_SHADOW,
    "s24_vent_mesh_well",
  );

  for (let i = 0; i < 4; i++) {
    const x = -1.02 + i * 0.047;
    box(
      [0.014, 0.37, 0.032],
      [x, 1.58, -1.092],
      STEEL_DARK,
      `s24_vent_mesh_vertical_${i}`,
    );
  }

  for (let i = 0; i < 6; i++) {
    const y = 1.405 + i * 0.07;
    box(
      [0.19, 0.014, 0.034],
      [-0.95, y, -1.092],
      STEEL_DARK,
      `s24_vent_mesh_horizontal_${i}`,
    );
  }

  // Small lower and upper shadow strips make the grille look like an installed module.
  box(
    [0.2, 0.026, 0.045],
    [-0.95, 1.78, -1.08],
    HULL_DARK,
    "s24_vent_mesh_top_cap",
  );
  box(
    [0.2, 0.026, 0.045],
    [-0.95, 1.38, -1.08],
    HULL_DARK,
    "s24_vent_mesh_bottom_cap",
  );

  // Rusted fastener plates on either side, each with a visible slotted screw.
  for (const [i, x] of [-1.405, -0.855].entries()) {
    box(
      [0.055, 0.16, 0.042],
      [x, 1.58, -1.097],
      RUST,
      `s24_vent_rust_plate_${i}`,
    );
    box(
      [0.025, 0.08, 0.008],
      [x, 1.58, -1.069],
      RUST_DARK,
      `s24_vent_rust_plate_shadow_${i}`,
    );
    screw([x, 1.58, -1.061], `s24_vent_fastener_${i}`, STEEL, 0.017);
  }

  for (const [i, x] of [-1.37, -0.89].entries()) {
    screw([x, 1.84, -1.082], `s24_vent_top_screw_${i}`, STEEL_DARK, 0.013);
    screw([x, 1.32, -1.082], `s24_vent_bottom_screw_${i}`, STEEL_DARK, 0.013);
  }

  // Faded service stencil, kept small so it reads as maintenance marking rather than a new logo.
  const ventStencil = svg(
    `<svg viewBox="0 0 140 30" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="30" fill="#222724"/>
      <text x="70" y="20" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="1.5" fill="#b8b29c">AIR 06</text>
    </svg>`,
    { size: 96 },
  );

  part(
    new THREE.PlaneGeometry(0.16, 0.035),
    OFF_WHITE,
    [-1.13, 1.925, -1.087],
    "s24_vent_stencil",
    {
      dir: [0, 0, 1],
      axis: "z",
      texture: ventStencil,
    },
  );

  // Two short external drain ribs beneath the bank add the characteristic exposed service hardware.
  rod(
    [-1.35, 1.235, -1.09],
    [-1.08, 1.235, -1.09],
    0.012,
    RUST_DARK,
    "s24_vent_lower_drain",
  );
  rod(
    [-1.03, 1.235, -1.09],
    [-0.9, 1.235, -1.09],
    0.012,
    STEEL_DARK,
    "s24_vent_lower_drain_2",
  );
}
    return addUtensilRail;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addSideCableBundle(b: Builder) {
  const group = "stage2-sideCableBundle";

  const cable = (
    points: [number, number, number][],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.sweep(points, radius, {
      color,
      name,
      group,
      caps: "round",
      section: "circle",
      sides: 8,
      smooth: false,
    });
  };

  const localBox = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group,
      flat: true,
    });
  };

  const localCylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      name,
      group,
      flat: true,
    });
  };

  const localRivet = (
    at: [number, number, number],
    color: string,
    name: string,
  ) => {
    b.part(new THREE.SphereGeometry(0.022, 8, 5), color, {
      at,
      name,
      group,
      flat: true,
    });
  };

  // A shadowed mounting channel sits against the inner face of the right
  // bulkhead. Its front edge remains visible between the cables and clamps.
  localBox(
    [0.035, 0.86, 0.38],
    [1.368, 1.86, -0.42],
    HULL_SHADOW,
    "s25CableBackChannel",
  );
  localBox(
    [0.028, 0.78, 0.055],
    [1.345, 1.86, -0.42],
    STEEL_DARK,
    "s25CableChannelRib",
  );

  // Three separate, slightly irregular looms. They stay nearly parallel but
  // bend into the top and lower service glands like installed ship wiring.
  cable(
    [
      [1.348, 2.275, -0.555],
      [1.338, 2.16, -0.555],
      [1.338, 1.76, -0.55],
      [1.347, 1.56, -0.535],
      [1.358, 1.455, -0.505],
    ],
    0.021,
    BLACK,
    "s25CableBlack",
  );

  cable(
    [
      [1.358, 2.275, -0.425],
      [1.343, 2.145, -0.425],
      [1.341, 1.78, -0.425],
      [1.347, 1.61, -0.415],
      [1.361, 1.455, -0.39],
    ],
    0.022,
    RUST,
    "s25CableRust",
  );

  cable(
    [
      [1.368, 2.265, -0.295],
      [1.351, 2.09, -0.295],
      [1.35, 1.76, -0.30],
      [1.357, 1.58, -0.315],
      [1.369, 1.455, -0.345],
    ],
    0.02,
    STEEL_DARK,
    "s25CableSteel",
  );

  // Heavy top and bottom gland housings make the loose ends read as a
  // serviceable cable installation rather than three floating tubes.
  localBox(
    [0.105, 0.12, 0.36],
    [1.342, 2.285, -0.425],
    HULL_DARK,
    "s25CableTopGland",
  );
  localBox(
    [0.09, 0.10, 0.32],
    [1.348, 1.425, -0.425],
    HULL_DARK,
    "s25CableBottomGland",
  );

  localBox(
    [0.05, 0.035, 0.30],
    [1.285, 2.285, -0.425],
    STEEL_DARK,
    "s25CableTopFace",
  );
  localBox(
    [0.045, 0.03, 0.26],
    [1.292, 1.425, -0.425],
    STEEL,
    "s25CableBottomFace",
  );

  // Four broad retaining straps cross the complete bundle. Each strap has
  // three raised saddles, one over each cable, plus an exposed fastener plate.
  const clampYs = [1.53, 1.77, 2.01, 2.245];
  const cableZs = [-0.55, -0.425, -0.30];

  clampYs.forEach((y, i) => {
    b.rod(
      [1.315, y, -0.60],
      [1.315, y, -0.25],
      0.018,
      {
        color: STEEL_DARK,
        name: `s25ClampBar${i}`,
        group,
        section: "circle",
        sides: 8,
        smooth: false,
        caps: "round",
      },
    );

    localBox(
      [0.038, 0.075, 0.38],
      [1.365, y, -0.425],
      STEEL_DARK,
      `s25ClampPlate${i}`,
    );

    cableZs.forEach((z, j) => {
      localBox(
        [0.065, 0.052, 0.055],
        [1.292, y, z],
        j === 1 ? STEEL : STEEL_DARK,
        `s25ClampSaddle${i}_${j}`,
      );
      localRivet(
        [1.278, y, z],
        j === 1 ? PANEL_LIGHT : STEEL,
        `s25ClampRivet${i}_${j}`,
      );
    });

    localRivet(
      [1.343, y + 0.035, -0.61],
      STEEL,
      `s25ClampTopBolt${i}`,
    );
    localRivet(
      [1.343, y - 0.035, -0.24],
      STEEL,
      `s25ClampBottomBolt${i}`,
    );
  });

  // Small identification sleeves and inspection blocks break up the long
  // vertical run while remaining within the reserved cable room.
  for (const [i, z] of cableZs.entries()) {
    localBox(
      [0.052, 0.055, 0.06],
      [1.305, 1.915, z],
      i === 0 ? PANEL_LIGHT : i === 1 ? RUST : STEEL,
      `s25CableTag${i}`,
    );
    localBox(
      [0.025, 0.025, 0.034],
      [1.276, 1.915, z],
      BLACK,
      `s25CableTagInset${i}`,
    );
  }

  // Two short service leads leave the top gland toward the overhead duct,
  // giving the bundle a convincing termination and adding the requested
  // angled bends without expanding beyond the reserved area.
  b.sweep(
    [
      [1.31, 2.31, -0.52],
      [1.29, 2.37, -0.52],
      [1.25, 2.42, -0.52],
    ],
    0.014,
    {
      color: BLACK,
      name: "s25CableTopLeadBlack",
      group,
      caps: "round",
      sides: 8,
      smooth: false,
    },
  );

  b.sweep(
    [
      [1.325, 2.31, -0.34],
      [1.30, 2.37, -0.34],
      [1.25, 2.42, -0.34],
    ],
    0.014,
    {
      color: RUST,
      name: "s25CableTopLeadRust",
      group,
      caps: "round",
      sides: 8,
      smooth: false,
    },
  );

  localCylinder(
    0.034,
    0.032,
    [1.25, 2.42, -0.52],
    STEEL,
    "s25CableLeadCollarBlack",
  );
  localCylinder(
    0.034,
    0.032,
    [1.25, 2.42, -0.34],
    STEEL,
    "s25CableLeadCollarRust",
  );
}
    return addSideCableBundle;
  })(),
);
// add6
STAGE2.push(
  (() => {
type P = [number, number, number];

function addWarningPlacard(b: Builder) {
  const placardBox = (
    size: P,
    at: P,
    color: string,
    name: string,
    group = "stage2-warning",
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group,
      flat: true,
    });

  const placardRod = (
    a: P,
    c: P,
    radius: number,
    color: string,
    name: string,
    group = "stage2-warning",
  ) =>
    b.rod(a, c, radius, {
      color,
      name,
      group,
      sides: 8,
      smooth: false,
      caps: "round",
    });

  const placardSphere = (
    radius: number,
    at: P,
    color: string,
    name: string,
    group = "stage2-warning",
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      name,
      group,
      flat: true,
    });

  const mugBox = (
    size: P,
    at: P,
    color: string,
    name: string,
    group = "stage2-mug-rack",
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group,
      flat: true,
    });

  const mugCylinder = (
    radius: number,
    height: number,
    at: P,
    color: string,
    name: string,
    segments = 8,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius * 0.94, height, segments),
      color,
      {
        at,
        name,
        group: "stage2-mug-rack",
        flat: true,
      },
    );

  const mugRod = (
    a: P,
    c: P,
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      name,
      group: "stage2-mug-rack",
      sides: 8,
      smooth: false,
      caps: "round",
    });

  // -----------------------------------------------------------------------------------------------
  // LEFT BULKHEAD: bolted warning placard
  //
  // The left wall's usable face points +X.  The placard is therefore built as a thin stack along X,
  // with every subsequent detail pushed slightly farther into the galley.

  const px = -1.405;
  const face = -1.345;
  const detailFace = -1.323;

  // Heavy painted mounting plate and a darker recessed centre.
  placardBox(
    [0.052, 0.38, 0.5],
    [px, 1.03, 0.68],
    PANEL_LIGHT,
    "s26_warningPlacard",
  );
  placardBox(
    [0.012, 0.315, 0.435],
    [face, 1.03, 0.68],
    HULL_DARK,
    "s26_warningRecess",
  );

  // Raised perimeter rails, intentionally uneven in colour like serviced ship hardware.
  placardBox([0.018, 0.028, 0.46], [detailFace, 1.205, 0.68], STEEL, "s26_warningTopRail");
  placardBox([0.018, 0.028, 0.46], [detailFace, 0.855, 0.68], STEEL_DARK, "s26_warningBottomRail");
  placardBox([0.018, 0.35, 0.026], [detailFace, 1.03, 0.895], STEEL_DARK, "s26_warningFrontRail");
  placardBox([0.018, 0.35, 0.026], [detailFace, 1.03, 0.465], STEEL, "s26_warningBackRail");

  // Four proud fasteners with darker under-washers.
  for (const [i, y] of [0.875, 1.185].entries()) {
    for (const [j, z] of [0.49, 0.87].entries()) {
      placardSphere(0.035, [detailFace + 0.014, y, z], STEEL_DARK, `s26_warningWasher${i}${j}`);
      placardSphere(0.021, [detailFace + 0.032, y, z], STEEL, `s26_warningRivet${i}${j}`);
    }
  }

  // The red emergency stripe is a raised, chipped-looking two-layer band.
  placardBox(
    [0.018, 0.045, 0.38],
    [detailFace + 0.006, 0.885, 0.68],
    RED,
    "s26_warningEmergencyStripe",
  );
  placardBox(
    [0.022, 0.012, 0.38],
    [detailFace + 0.02, 0.914, 0.68],
    BLACK,
    "s26_warningStripeEdge",
  );

  // Ochre warning triangle, extruded in the wall plane.  Local +x is -Z so +x cross +y
  // gives the requested +X-facing front.
  b.extrude(
    [
      [-0.112, -0.068],
      [0.0, 0.112],
      [0.112, -0.068],
    ],
    {
      at: [detailFace + 0.012, 1.095, 0.68],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color: HAZARD,
      name: "s26_warningHazardTriangle",
      group: "stage2-warning",
    },
  );

  // A black inset triangle and a raised exclamation mark give the sign a readable industrial symbol.
  b.extrude(
    [
      [-0.078, -0.042],
      [0.0, 0.073],
      [0.078, -0.042],
    ],
    {
      at: [detailFace + 0.028, 1.095, 0.68],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      color: BLACK,
      name: "s26_warningHazardInset",
      group: "stage2-warning",
    },
  );
  placardRod(
    [detailFace + 0.043, 1.075, 0.68],
    [detailFace + 0.043, 1.135, 0.68],
    0.012,
    PANEL_LIGHT,
    "s26_warningExclamation",
  );
  placardSphere(
    0.014,
    [detailFace + 0.043, 1.045, 0.68],
    PANEL_LIGHT,
    "s26_warningExclamationDot",
  );

  // Two rows of chunky raised stencil bars.  Their varying lengths suggest old block lettering
  // without needing a fragile tiny texture.
  const rows: readonly { y: number; bars: readonly [number, number][] }[] = [
    {
      y: 0.985,
      bars: [
        [-0.105, 0.045],
        [-0.048, 0.027],
        [-0.008, 0.052],
        [0.055, 0.032],
      ],
    },
    {
      y: 0.945,
      bars: [
        [-0.105, 0.03],
        [-0.064, 0.06],
        [0.009, 0.037],
        [0.059, 0.055],
      ],
    },
  ];
  for (let r = 0; r < rows.length; r++) {
    for (let i = 0; i < rows[r].bars.length; i++) {
      const [z, length] = rows[r].bars[i];
      placardBox(
        [0.018, 0.014, length],
        [detailFace + 0.026, rows[r].y, 0.68 + z],
        i === 2 && r === 0 ? HAZARD : PANEL_LIGHT,
        `s26_warningStencil${r}_${i}`,
      );
    }
  }

  // Small black corner marks and a red maintenance dot make the sign feel repeatedly serviced.
  for (const z of [0.53, 0.83]) {
    placardBox([0.02, 0.022, 0.052], [detailFace + 0.025, 1.145, z], BLACK, `s26_warningCorner${z}`);
  }
  placardSphere(0.018, [detailFace + 0.034, 0.795, 0.84], RED, "s26_warningServiceLamp");

  // -----------------------------------------------------------------------------------------------
  // UNDER-CABINET MUG RACK
  //
  // Four mugs occupy the reserved x span 0.32..1.12.  They hang below a rail rather than sitting
  // on the counter, leaving the industrial under-cabinet void visually useful.

  const mugXs = [0.37, 0.585, 0.80, 1.015];

  // Two dark mounting shoes and a thick horizontal magnetic rail.
  mugBox([0.095, 0.12, 0.075], [0.32, 1.79, -0.735], STEEL_DARK, "s26_mugMountL");
  mugBox([0.095, 0.12, 0.075], [1.07, 1.79, -0.735], STEEL_DARK, "s26_mugMountR");
  mugRod([0.315, 1.79, -0.705], [1.075, 1.79, -0.705], 0.022, STEEL_DARK, "s26_mugRail");
  mugRod([0.315, 1.805, -0.705], [1.075, 1.805, -0.705], 0.009, STEEL, "s26_mugRailHighlight");

  // Riveted rail end collars.
  for (const x of [0.315, 1.075]) {
    mugCylinder(0.038, 0.035, [x, 1.79, -0.705], RUST, `s26_mugRailCollar${x}`);
    mugCylinder(0.021, 0.046, [x, 1.79, -0.705], STEEL, `s26_mugRailCap${x}`);
  }

  for (let i = 0; i < mugXs.length; i++) {
    const x = mugXs[i];
    const cupY = 1.635;
    const hookY = 1.705;
    const bodyColor = i === 2 ? PANEL_LIGHT : OFF_WHITE;

    // Short black hanging hook, with a visible steel mounting collar.
    mugCylinder(0.031, 0.025, [x, 1.79, -0.705], STEEL, `s26_mugHookCollar${i}`);
    mugRod([x, hookY, -0.705], [x, 1.665, -0.705], 0.012, BLACK, `s26_mugHookStem${i}`);
    mugRod([x, 1.665, -0.705], [x + 0.035, 1.645, -0.705], 0.012, BLACK, `s26_mugHookCurl${i}`);

    // Faceted cup body and a dark inset rim/contents.
    mugCylinder(0.067, 0.125, [x, cupY, -0.705], bodyColor, `s26_mugBody${i}`);
    mugCylinder(0.071, 0.018, [x, cupY + 0.064, -0.705], STEEL_DARK, `s26_mugRim${i}`);
    mugCylinder(0.053, 0.006, [x, cupY + 0.075, -0.705], BLACK, `s26_mugContents${i}`, 10);

    // Lower reinforcement band and a tiny front stencil block.
    mugCylinder(0.069, 0.018, [x, cupY - 0.057, -0.705], i % 2 ? RUST : STEEL_DARK, `s26_mugFootBand${i}`);
    mugBox([0.045, 0.014, 0.009], [x, cupY + 0.005, -0.775], BLACK, `s26_mugStencil${i}`);

    // Squared C-shaped handles, deliberately made from three straight primitive rods.
    const handleX = x + 0.058;
    mugRod(
      [handleX, cupY + 0.043, -0.705],
      [handleX + 0.047, cupY + 0.043, -0.705],
      0.012,
      STEEL_DARK,
      `s26_mugHandleTop${i}`,
    );
    mugRod(
      [handleX + 0.047, cupY + 0.043, -0.705],
      [handleX + 0.047, cupY - 0.043, -0.705],
      0.012,
      STEEL_DARK,
      `s26_mugHandleSide${i}`,
    );
    mugRod(
      [handleX + 0.047, cupY - 0.043, -0.705],
      [handleX, cupY - 0.043, -0.705],
      0.012,
      STEEL_DARK,
      `s26_mugHandleBottom${i}`,
    );

    // Small pale or rust-coloured end plugs make each handle read as fitted hardware.
    const plugColor = i === 1 ? RUST : STEEL;
    mugCylinder(0.016, 0.016, [handleX + 0.047, cupY + 0.043, -0.705], plugColor, `s26_mugPlugTop${i}`);
    mugCylinder(0.016, 0.016, [handleX + 0.047, cupY - 0.043, -0.705], plugColor, `s26_mugPlugBottom${i}`);
  }

  // A thin underside shadow rail ties the rack visually to the cabinet and gives the suspended cups
  // a strong dark silhouette against the pale locker front.
  mugBox([0.92, 0.028, 0.035], [0.70, 1.735, -0.765], BLACK, "s26_mugShadowRail");
  mugBox([0.76, 0.018, 0.025], [0.70, 1.755, -0.785], RUST_DARK, "s26_mugRustRail");
}
    return addWarningPlacard;
  })(),
);
