import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";
import type { Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Cramped 1979 industrial spaceship galley: steel counter run, hob and hood, hanging pots, fridge locker, bolted mess table and benches, pipes overhead.",
};

// Palette (top level so stage 2 can use the names)
export const HULL = "#b8b39b";
export const HULL_DARK = "#8a8774";
export const GRIME = "#3a3932";
export const STEEL = "#a9afb2";
export const STEEL_DARK = "#5d6468";
export const PIPE = "#7d8178";
export const ORANGE = "#d9822b";
export const AMBER = "#ffb347";
export const SCREEN_GREEN = "#5dff9a";
export const RED = "#b8362b";
export const WHITE = "#e8e4d4";
export const BLACK = "#16161a";
export const CREAM = "#d8cfae";

export const REQUESTS = [
  {
    id: "backsplashStencils",
    kind: "add",
    part: "wallPanel",
    what: "Stencilled Weyland-Yutani style labels on the backsplash wall: small black stencil bars, serial number blocks, a yellow arrow and a tiny warning triangle in ORANGE and BLACK, as thin raised plates.",
    at: [-0.6, 1.2, -0.9],
    normal: [0, 0, 1],
    bone: null,
    room: [1.6, 0.4, 0.05],
  },
  {
    id: "wallScreen",
    kind: "add",
    part: "wallPanel",
    what: "Retro CRT status monitor on a bracket on the back wall: chunky bezel in STEEL_DARK, convex dark glass, glowing SCREEN_GREEN text lines and a blinking-style cursor, small knobs below.",
    at: [1.15, 2.15, -0.88],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.4, 0.2],
  },
  {
    id: "hobDetails",
    kind: "add",
    part: "hobPlate",
    what: "Hob fittings: pan grates over the four burners, a row of five knobs on the counter front lip, and a small AMBER indicator lamp.",
    at: [0.35, 0.92, -0.62],
    normal: [0, 1, 0],
    bone: null,
    room: [0.65, 0.12, 0.5],
  },
  {
    id: "fridgeHazard",
    kind: "add",
    part: "fridgeDoorUpper",
    what: "Hazard decoration on the fridge locker: ORANGE and BLACK diagonal hazard stripe band, a heavy latch assembly with a lever, a rating plate and a vent grille at the top.",
    at: [1.15, 1.45, -0.3],
    normal: [0, 0, 1],
    bone: null,
    room: [0.66, 0.9, 0.08],
  },
  {
    id: "ceilingCables",
    kind: "add",
    part: "ceilingPipe",
    what: "Bundled cables and conduits sagging along the ceiling pipes with clamps, plus a valve wheel in RED and a pressure gauge on the main pipe.",
    at: [0, 2.3, -0.75],
    normal: [0, -1, 0],
    bone: null,
    room: [3.0, 0.3, 0.3],
  },
  {
    id: "counterClutter",
    kind: "add",
    part: "counterTop",
    what: "Cluttered galley items on the counter: stacked steel canisters, a kettle, a cutting board with a knife, a dish rack with plates, a rag hanging off the edge.",
    at: [-0.5, 0.9, -0.62],
    normal: [0, 1, 0],
    bone: null,
    room: [1.0, 0.3, 0.4],
  },
  {
    id: "tableMeal",
    kind: "add",
    part: "tableTop",
    what: "Crew breakfast on the mess table: extra compartment trays with food blobs, a few mugs, ketchup and sauce bottles, a cigarette tin, and a coffee thermos.",
    at: [-0.2, 0.81, 0.7],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.25, 0.7],
  },
  {
    id: "benchFixings",
    kind: "add",
    part: "bench",
    what: "Bolt heads, rubberised seat pads in GRIME and bracket gussets on both benches.",
    at: [-0.2, 0.5, 1.35],
    normal: [0, 1, 0],
    bone: null,
    room: [1.7, 0.2, 0.35],
  },
  {
    id: "overheadDoorsDetail",
    kind: "add",
    part: "overheadDoor",
    what: "Latch hooks, hinge barrels and small label plates on the overhead cupboard doors, plus a recessed red emergency pull handle.",
    at: [-0.8, 1.75, -0.55],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.5, 0.06],
  },
  {
    id: "deckGrating",
    kind: "add",
    part: "deck",
    what: "Raised diamond-plate strips and a floor drain grate on the deck, with bolt heads at the corners of the table pedestals.",
    at: [-0.2, 0.05, 0.7],
    normal: [0, 1, 0],
    bone: null,
    room: [3.0, 0.04, 2.0],
  },
  {
    id: "wallGrime",
    kind: "texture",
    part: "wallPanel",
    what: "Aged 1979 industrial wall paint in HULL with darker HULL_DARK streaks, grease staining above the hob, scuffed edges, rivet rows and panel seam lines.",
  },
  {
    id: "counterDoorsTex",
    kind: "texture",
    part: "cabinetDoor",
    what: "Worn beige-grey painted cabinet doors with chipped edges, fingerprints around the handles and faded stencil numbers.",
  },
  {
    id: "tableTex",
    kind: "texture",
    part: "tableTop",
    what: "Scratched brushed STEEL tabletop with ring stains, scuffs and fine grain, with a faded painted grid line.",
  },
  {
    id: "deckTex",
    kind: "texture",
    part: "deck",
    what: "Dark GRIME deck plating with scuffed diamond tread, oil stains and yellow guide lines.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "galley" });

  const bx = (name: string, size: [number, number, number], at: [number, number, number], color: string, g = false) => {
    const p = b.part(new THREE.BoxGeometry(...size), color, { at, name });
    return g ? glow(p) : p;
  };
  // cylinder: axis "x" | "y" | "z"
  const cy = (
    name: string, r: number, h: number, at: [number, number, number], color: string,
    axis: "x" | "y" | "z" = "y", seg = 10, r2?: number,
  ) => {
    const rot: [number, number, number] = axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at, rotation: rot, name });
  };

  // ---------- Deck and walls ----------
  bx("deck", [3.7, 0.05, 2.7], [0, 0.025, 0.4], GRIME);
  bx("deckPlate", [3.5, 0.01, 2.5], [0, 0.055, 0.4], STEEL_DARK);
  bx("wallBacking", [3.6, 2.45, 0.04], [0, 1.25, -0.99], GRIME);
  for (const i of [-1, 0, 1]) {
    bx("wallPanel", [1.12, 2.4, 0.08], [i * 1.14, 1.25, -0.95], HULL);
    // rivet/seam strips
    bx("wallSeam", [1.12, 0.03, 0.01], [i * 1.14, 0.95, -0.905], HULL_DARK);
    bx("wallSeam", [1.12, 0.03, 0.01], [i * 1.14, 1.5, -0.905], HULL_DARK);
    bx("wallSeam", [1.12, 0.03, 0.01], [i * 1.14, 2.3, -0.905], HULL_DARK);
  }
  bx("sideWall", [0.08, 2.4, 1.3], [-1.76, 1.25, -0.3], HULL_DARK);
  bx("sideWallRib", [0.02, 0.1, 1.3], [-1.7, 2.0, -0.3], STEEL_DARK);
  bx("sideWallRib", [0.02, 0.1, 1.3], [-1.7, 0.3, -0.3], STEEL_DARK);
  bx("baseboard", [3.6, 0.12, 0.03], [0, 0.11, -0.9], STEEL_DARK);

  // ---------- Counter run ----------
  const CX = -0.4;
  bx("counterBase", [2.2, 0.82, 0.6], [CX, 0.46, -0.62], HULL_DARK);
  bx("toeKick", [2.2, 0.1, 0.52], [CX, 0.1, -0.62], BLACK);
  bx("counterTop", [2.26, 0.05, 0.66], [CX, 0.875, -0.6], STEEL);
  bx("counterLip", [2.26, 0.03, 0.02], [CX, 0.89, -0.275], STEEL_DARK);
  for (let i = 0; i < 4; i++) {
    const x = -1.4 + i * 0.55 + 0.275 - 0.0;
    const dx = CX - 1.1 + 0.275 + i * 0.55;
    bx("cabinetDoor", [0.52, 0.66, 0.025], [dx, 0.47, -0.31], HULL);
    bx("doorHandle", [0.2, 0.025, 0.03], [dx, 0.74, -0.285], STEEL_DARK);
    // vent slots
    for (let k = 0; k < 3; k++) bx("doorSlot", [0.3, 0.012, 0.005], [dx, 0.22 + k * 0.03, -0.295], GRIME);
    void x;
  }

  // sink
  bx("sinkRim", [0.56, 0.02, 0.44], [-0.9, 0.9, -0.6], STEEL_DARK);
  bx("sinkBasin", [0.48, 0.03, 0.36], [-0.9, 0.903, -0.6], BLACK);
  bx("sinkDrain", [0.06, 0.035, 0.06], [-0.9, 0.912, -0.6], STEEL);
  b.sweep(catmull([[-0.9, 0.9, -0.86], [-0.9, 1.15, -0.86], [-0.9, 1.22, -0.8], [-0.9, 1.12, -0.7]]), 0.016, { color: STEEL });
  cy("faucetBase", 0.04, 0.05, [-0.9, 0.925, -0.86], STEEL_DARK);
  bx("tapHandleL", [0.07, 0.02, 0.02], [-0.97, 0.95, -0.86], RED);
  bx("tapHandleR", [0.07, 0.02, 0.02], [-0.83, 0.95, -0.86], STEEL_DARK);

  // coffee machine
  bx("coffeeBody", [0.26, 0.38, 0.26], [-1.32, 1.09, -0.72], CREAM);
  bx("coffeeHead", [0.28, 0.1, 0.28], [-1.32, 1.3, -0.7], HULL_DARK);
  cy("coffeeJug", 0.07, 0.16, [-1.32, 0.99, -0.62], "#3a2a22", "y", 8);
  bx("coffeeDisplay", [0.1, 0.04, 0.01], [-1.32, 1.2, -0.575], AMBER, true);
  bx("coffeeBtn", [0.03, 0.03, 0.015], [-1.4, 1.14, -0.585], RED);
  bx("coffeeBtn", [0.03, 0.03, 0.015], [-1.25, 1.14, -0.585], BLACK);

  // hob
  bx("hobPlate", [0.62, 0.02, 0.5], [0.35, 0.9, -0.62], BLACK);
  for (const hx of [0.2, 0.5])
    for (const hz of [-0.5, -0.74]) {
      b.part(new THREE.TorusGeometry(0.065, 0.014, 5, 14), STEEL_DARK, { at: [hx, 0.918, hz], rotation: [90, 0, 0], name: "burnerRing" });
      glow(b.part(new THREE.TorusGeometry(0.035, 0.008, 4, 10), ORANGE, { at: [hx, 0.92, hz], rotation: [90, 0, 0], name: "burnerGlow" }), 1.4);
    }
  // hood and duct
  b.frustumBox([0.35, 1.3, -0.7], [0.35, 1.72, -0.72], [0.8, 0.55], [0.3, 0.3], { color: STEEL_DARK });
  bx("hoodRim", [0.84, 0.04, 0.58], [0.35, 1.29, -0.7], STEEL);
  bx("duct", [0.28, 0.75, 0.28], [0.35, 2.08, -0.76], STEEL_DARK);
  bx("hoodLamp", [0.4, 0.015, 0.2], [0.35, 1.275, -0.62], AMBER, true);

  // overhead cupboards
  const OX = -0.8;
  bx("overheadBox", [1.4, 0.5, 0.36], [OX, 1.75, -0.72], HULL_DARK);
  for (let i = 0; i < 3; i++) {
    const dx = OX - 0.46 + i * 0.46;
    bx("overheadDoor", [0.44, 0.46, 0.025], [dx, 1.75, -0.53], HULL);
    bx("overheadHandle", [0.1, 0.04, 0.025], [dx, 1.56, -0.51], STEEL_DARK);
  }
  // pot rail
  cy("potRail", 0.014, 1.3, [-0.8, 1.38, -0.75], STEEL, "x", 6);
  for (const rx of [-1.45, -0.15]) bx("railBracket", [0.03, 0.2, 0.03], [rx, 1.44, -0.76], STEEL_DARK);
  const pots: [number, number, number, number][] = [[-1.3, 0.1, 0.1, 0.08], [-1.05, 0.09, 0.12, 0.07], [-0.75, 0.12, 0.14, 0.09], [-0.45, 0.08, 0.09, 0.06]];
  pots.forEach(([px, r, h]) => {
    cy("potHook", 0.005, 0.1, [px, 1.34, -0.75], STEEL_DARK, "y", 4);
    cy("pot", r, h, [px, 1.22, -0.75], STEEL, "y", 10);
    cy("potInside", r * 0.85, 0.01, [px, 1.22 + h / 2, -0.75], BLACK, "y", 10);
    bx("potHandle", [0.12, 0.015, 0.02], [px + r + 0.05, 1.24, -0.75], STEEL_DARK);
  });

  // ---------- Fridge locker ----------
  bx("fridgeBody", [0.72, 1.9, 0.62], [1.2, 1.0, -0.6], HULL_DARK);
  bx("fridgeDoorUpper", [0.66, 0.92, 0.03], [1.2, 1.45, -0.285], HULL);
  bx("fridgeDoorLower", [0.66, 0.84, 0.03], [1.2, 0.55, -0.285], HULL);
  bx("fridgeGap", [0.7, 0.02, 0.03], [1.2, 0.99, -0.29], BLACK);
  bx("fridgeHandleU", [0.04, 0.4, 0.05], [1.45, 1.4, -0.26], STEEL_DARK);
  bx("fridgeHandleL", [0.04, 0.4, 0.05], [1.45, 0.65, -0.26], STEEL_DARK);
  bx("fridgeLightBox", [0.1, 0.06, 0.015], [1.0, 1.85, -0.265], BLACK);
  bx("fridgeLamp", [0.04, 0.03, 0.01], [1.0, 1.85, -0.255], RED, true);
  bx("fridgePlinth", [0.74, 0.08, 0.64], [1.2, 0.09, -0.6], STEEL_DARK);
  bx("fridgeTop", [0.74, 0.03, 0.64], [1.2, 1.965, -0.6], STEEL_DARK);

  // ---------- Mess table and benches ----------
  const TX = -0.2, TZ = 0.7;
  bx("tableTop", [1.7, 0.05, 0.8], [TX, 0.78, TZ], STEEL);
  bx("tableEdge", [1.74, 0.03, 0.84], [TX, 0.75, TZ], STEEL_DARK);
  for (const px of [-0.75, 0.35]) {
    cy("tablePost", 0.06, 0.7, [px, 0.4, TZ], STEEL_DARK, "y", 8);
    cy("tableBase", 0.2, 0.04, [px, 0.07, TZ], STEEL, "y", 10);
    cy("tableFlange", 0.1, 0.03, [px, 0.74, TZ], STEEL, "y", 8);
  }
  for (const [bz, k] of [[0.05, 1], [1.35, -1]] as [number, number][]) {
    bx("bench", [1.7, 0.06, 0.32], [TX, 0.46, bz], HULL_DARK);
    bx("benchPad", [1.64, 0.03, 0.26], [TX, 0.505, bz], GRIME);
    for (const lx of [-0.95, 0.55]) {
      bx("benchLeg", [0.05, 0.4, 0.28], [lx, 0.23, bz], STEEL_DARK);
      bx("benchFoot", [0.08, 0.03, 0.34], [lx, 0.065, bz], STEEL);
    }
    bx("benchBrace", [1.5, 0.04, 0.03], [TX, 0.2, bz + k * 0.12], STEEL_DARK);
  }
  // table items
  for (const tx of [-0.75, -0.2, 0.35]) {
    bx("tray", [0.38, 0.02, 0.26], [tx, 0.815, TZ + 0.1], STEEL_DARK);
    bx("trayFood", [0.12, 0.02, 0.1], [tx - 0.08, 0.83, TZ + 0.1], CREAM);
    bx("trayFood", [0.1, 0.025, 0.08], [tx + 0.08, 0.83, TZ + 0.12], ORANGE);
  }
  for (const mx of [-0.55, 0.1]) {
    cy("mug", 0.04, 0.09, [mx, 0.848, TZ - 0.18], WHITE, "y", 8);
    cy("mugCoffee", 0.032, 0.005, [mx, 0.894, TZ - 0.18], "#2b1a12", "y", 8);
    bx("mugHandle", [0.02, 0.05, 0.015], [mx + 0.05, 0.85, TZ - 0.18], WHITE);
  }
  cy("thermos", 0.05, 0.22, [-0.95, 0.915, TZ - 0.2], RED, "y", 8);
  cy("thermosCap", 0.045, 0.04, [-0.95, 1.04, TZ - 0.2], STEEL_DARK, "y", 8);
  cy("bottle", 0.03, 0.16, [0.6, 0.885, TZ - 0.2], "#7a1d18", "y", 8);
  cy("bottleNeck", 0.014, 0.06, [0.6, 0.99, TZ - 0.2], "#7a1d18", "y", 6);

  // ---------- Overhead: pipes and light ----------
  cy("ceilingPipe", 0.055, 3.5, [0, 2.3, -0.8], PIPE, "x", 10);
  cy("ceilingPipe", 0.035, 3.5, [0, 2.2, -0.66], STEEL_DARK, "x", 8);
  cy("ceilingPipe", 0.03, 3.5, [0, 2.32, -0.62], ORANGE, "x", 8);
  for (const px of [-1.5, -0.5, 0.5, 1.5]) {
    bx("pipeClamp", [0.05, 0.06, 0.04], [px, 2.3, -0.8], STEEL_DARK);
    bx("pipeHanger", [0.03, 0.1, 0.03], [px, 2.38, -0.8], STEEL_DARK);
  }
  for (const jx of [-1.0, 1.0]) cy("pipeJoint", 0.07, 0.08, [jx, 2.3, -0.8], STEEL, "x", 10);
  bx("lightFixture", [1.3, 0.08, 0.28], [TX, 2.3, TZ], STEEL_DARK);
  bx("lightPanel", [1.2, 0.02, 0.2], [TX, 2.255, TZ], WHITE, true);
  for (const lx of [-0.75, 0.35]) cy("lightRod", 0.012, 0.15, [lx, 2.37, TZ], STEEL_DARK, "y", 5);

  // wall extras: panel indicators near fridge
  bx("wallLightBox", [0.16, 0.1, 0.03], [0.1, 2.05, -0.885], STEEL_DARK);
  bx("wallLightLens", [0.12, 0.06, 0.01], [0.1, 2.05, -0.865], AMBER, true);

  for (const add of STAGE2) add(b);
  return b.root;
}
