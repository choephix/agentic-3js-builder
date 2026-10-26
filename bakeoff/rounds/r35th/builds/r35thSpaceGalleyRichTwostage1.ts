import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";

export const HULL = "#667064";
export const HULL_DARK = "#303733";
export const HULL_SHADOW = "#202522";
export const PANEL = "#8b927f";
export const PANEL_LIGHT = "#b3b39b";
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

function box(
  b: Builder,
  size: P,
  at: P,
  color: string,
  name?: string,
  group = "galley",
) {
  const options = name
    ? { at, name, group, flat: true }
    : { at, group, flat: true };
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, options);
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  at: P,
  color: string,
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
  color: string,
  name?: string,
  group = "galley",
) {
  const options = name
    ? { at, name, group, flat: true }
    : { at, group, flat: true };
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, options);
}

function rod(
  b: Builder,
  a: P,
  c: P,
  radius: number,
  color: string,
  name?: string,
  group = "pipes",
) {
  const options = name
    ? {
        color,
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
    box(b, [0.045, 2.16, 1.62], [x, 1.42, -0.1], HULL, side < 0 ? "sideWallL" : "sideWallR", "sidePanels");

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
    HULL,
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
    PANEL,
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
    box(b, [0.42, 0.3, 0.08], [side * 0.77, 1.34, 0.72], STEEL_DARK, undefined, "cornerBrackets");
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
    box(b, [0.34, 0.46, 0.05], [side * 0.78, 2.37, -0.71], STEEL_DARK, undefined, "upperUnderTrim");
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
