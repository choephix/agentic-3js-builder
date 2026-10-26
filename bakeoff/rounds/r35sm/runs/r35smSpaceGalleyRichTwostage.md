<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

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
```

<!-- call: texture -->

Painting plan, one line per request:

- **wallGrime**: HULL paint with HULL_DARK streaks, grease staining toward the hob zone, scuffed darker edges, and seam and rivet rows.
- **counterDoorsTex**: warm grey-beige paint with dark chips along the edges, a smudge near the top handle zone, and faded stencil bands.
- **tableTex**: brushed steel grain with ring stains, scuffs and a faded painted grid line.
- **deckTex**: dark GRIME plating with diamond tread, oil blotches and yellow guide lines.

## Edits

<<<<<<< SEARCH
export const STAGE2: ((b: Builder) => void)[] = [];
=======
export const STAGE2: ((b: Builder) => void)[] = [];

const hx = (c: string): [number, number, number] => {
  const v = parseInt(c.slice(1), 16);
  return [(v >> 16) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};
const WALL_PAINT = paint((p, n) => {
  let c = mix(hx(HULL), hx(HULL_DARK), smoothstep(0.45, 0.8, noise(p, 0.25, 3)) * 0.6);
  // vertical drip streaks
  c = mix(c, hx(HULL_DARK), 0.35 * smoothstep(0.6, 0.8, noise(new THREE.Vector3(p.x * 6, p.y * 0.4, p.z), 0.2, 8)));
  // grease above the hob
  const g = Math.exp(-(((p.x - 0.35) / 0.45) ** 2 + ((p.y - 1.6) / 0.5) ** 2));
  c = mix(c, [0.25, 0.2, 0.1], 0.55 * g * smoothstep(0.3, 0.7, noise(p, 0.12, 5)));
  // seam lines & rivets
  const sx = Math.abs(((p.x + 0.57 + 100) % 1.14) - 0.57);
  if (Math.abs(n.z) > 0.5) {
    if (Math.abs(sx - 0.55) < 0.006 || Math.abs(sx) > 0.564) c = mix(c, hx(GRIME), 0.7);
    if (Math.abs(sx) > 0.5 && Math.abs(((p.y * 100) % 8) - 4) < 1.2) c = mix(c, [0.95, 0.92, 0.8], 0.6);
  }
  // scuffed lower edge
  c = mix(c, hx(GRIME), 0.5 * smoothstep(0.35, 0.1, p.y) * noise(p, 0.05, 2));
  return c;
});
const DOOR_PAINT = paint((p, n) => {
  let c = mix([0.72, 0.68, 0.58], [0.6, 0.57, 0.5], noise(p, 0.15, 11));
  const lx = Math.abs(((p.x + 5) % 0.55) - 0.275);
  const e = Math.max(lx / 0.26, Math.abs(p.y - 0.47) / 0.33);
  if (e > 0.93) c = mix(c, hx(GRIME), 0.7 * smoothstep(0.4, 0.7, noise(p, 0.03, 4)));
  // fingerprints near handle
  c = mix(c, [0.45, 0.42, 0.36], 0.4 * smoothstep(0.7, 0.85, noise(p, 0.02, 6)) * smoothstep(0.5, 0.7, p.y));
  // stencil bars
  if (Math.abs(p.y - 0.33) < 0.012 && lx < 0.1 && Math.sin(p.x * 150) > -0.2) c = mix(c, hx(GRIME), 0.55);
  if (n.z < 0) return hx(HULL_DARK);
  return c;
});
const TABLE_PAINT = paint((p, n) => {
  const base = mix(hx(STEEL), hx("#cfd5d8"), noise(new THREE.Vector3(p.x * 12, p.y, p.z), 0.08, 2));
  let c: [number, number, number] = [base[0], base[1], base[2]];
  if (n.y > 0.5) {
    const r = Math.hypot(p.x + 0.45, p.z - 0.6);
    if (Math.abs(r - 0.045) < 0.004) c = mix(c, [0.3, 0.2, 0.12], 0.5) as [number, number, number];
    const r2 = Math.hypot(p.x - 0.2, p.z - 0.85);
    if (Math.abs(r2 - 0.04) < 0.003) c = mix(c, [0.25, 0.15, 0.1], 0.45) as [number, number, number];
    if (Math.abs(((p.x + 5) % 0.4) - 0.2) < 0.004 || Math.abs(((p.z + 5) % 0.4) - 0.2) < 0.004)
      c = mix(c, [0.85, 0.8, 0.45], 0.45) as [number, number, number];
    c = mix(c, hx(STEEL_DARK), 0.4 * smoothstep(0.7, 0.85, noise(p, 0.03, 9))) as [number, number, number];
  }
  return c;
});
const DECK_PAINT = paint((p, n) => {
  let c = mix(hx(GRIME), [0.28, 0.27, 0.23], noise(p, 0.2, 21));
  if (n.y > 0.5) {
    const u = (p.x + p.z) * 30;
    const v = (p.x - p.z) * 30;
    const d = Math.min(Math.abs(Math.sin(u)), Math.abs(Math.sin(v)));
    c = mix(c, [0.38, 0.37, 0.32], 0.5 * smoothstep(0.5, 0.2, d));
    c = mix(c, [0.05, 0.05, 0.06], 0.6 * smoothstep(0.62, 0.78, noise(p, 0.3, 7)));
    if (Math.abs(p.x + 1.3) < 0.025 || Math.abs(p.z - 1.55) < 0.025)
      if (Math.sin(p.x * 25 + p.z * 25) > -0.3) c = mix(c, [0.85, 0.7, 0.15], 0.8);
  }
  return c;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, catmull } from "agentic-3js-builder";
=======
import { createBuilder, catmull, paint, mix, noise, smoothstep } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx("deck", [3.7, 0.05, 2.7], [0, 0.025, 0.4], GRIME);
=======
  bx("deck", [3.7, 0.05, 2.7], [0, 0.025, 0.4], DECK_PAINT as unknown as string);
>>>>>>> REPLACE

<<<<<<< SEARCH
    bx("wallPanel", [1.12, 2.4, 0.08], [i * 1.14, 1.25, -0.95], HULL);
=======
    bx("wallPanel", [1.12, 2.4, 0.08], [i * 1.14, 1.25, -0.95], WALL_PAINT as unknown as string);
>>>>>>> REPLACE

<<<<<<< SEARCH
    bx("cabinetDoor", [0.52, 0.66, 0.025], [dx, 0.47, -0.31], HULL);
=======
    bx("cabinetDoor", [0.52, 0.66, 0.025], [dx, 0.47, -0.31], DOOR_PAINT as unknown as string);
>>>>>>> REPLACE

<<<<<<< SEARCH
  bx("tableTop", [1.7, 0.05, 0.8], [TX, 0.78, TZ], STEEL);
=======
  bx("tableTop", [1.7, 0.05, 0.8], [TX, 0.78, TZ], TABLE_PAINT as unknown as string);
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addBacksplashStencils(b: Builder) {
  const YEL = "#e8c32a";
  const FADE = "#2a2a26";
  const Z = -0.903; // wall panel front face sits near -0.91
  const plate = (name: string, w: number, h: number, x: number, y: number, color: string, t = 0.006) =>
    b.part(new THREE.BoxGeometry(w, h, t), color, { at: [x, y, Z + t / 2], name });

  // painted label backing plates (cream-grey stencil panels)
  const label = svg(
    `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="158" height="38" rx="2" fill="#d8cfae" stroke="#16161a" stroke-width="2"/>
      <text x="8" y="18" font-family="monospace" font-weight="bold" font-size="14" fill="#16161a">WEYLAND-YUTANI</text>
      <text x="8" y="34" font-family="monospace" font-size="11" fill="#16161a">COMMERCIAL TOWING 180924609</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.125), "#ffffff", {
    at: [-0.95, 1.3, Z + 0.004], dir: [0, 0, 1], axis: "z", texture: label, name: "stencilLabel",
  });

  const serial = svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="98" height="38" fill="#16161a"/>
      <text x="8" y="17" font-family="monospace" font-weight="bold" font-size="13" fill="#e8c32a">GALLEY 02</text>
      <text x="8" y="33" font-family="monospace" font-size="12" fill="#d9822b">SN 0471-NST</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.12), "#ffffff", {
    at: [-0.35, 1.28, Z + 0.004], dir: [0, 0, 1], axis: "z", texture: serial, name: "stencilSerial",
  });

  // stencil bars row (black, varied widths)
  const widths = [0.12, 0.05, 0.08, 0.03, 0.1, 0.06, 0.04, 0.09];
  let x = -1.3;
  widths.forEach((w, i) => {
    plate("stencilBar", w, 0.035, x + w / 2, 1.12, BLACK);
    x += w + 0.025 + (i % 3) * 0.01;
  });
  // second row of numeral blocks
  const numerals = svg(
    `<svg viewBox="0 0 200 24" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="19" font-family="monospace" font-weight="bold" font-size="20" letter-spacing="3" fill="#16161a">A-17 / 4 / 0912 / VENT</text>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.7, 0.084), "#ffffff", {
    at: [-0.85, 1.03, Z + 0.004], dir: [0, 0, 1], axis: "z", texture: numerals, name: "stencilNumerals",
  });

  // yellow arrow plate
  const arrow = new THREE.Shape();
  arrow.moveTo(0, 0.03);
  arrow.lineTo(0.14, 0.03);
  arrow.lineTo(0.14, 0.07);
  arrow.lineTo(0.22, 0);
  arrow.lineTo(0.14, -0.07);
  arrow.lineTo(0.14, -0.03);
  arrow.lineTo(0, -0.03);
  const aGeo = new THREE.ExtrudeGeometry(arrow, { depth: 0.006, bevelEnabled: false });
  b.part(aGeo, YEL, { at: [-0.12, 1.12, Z], name: "stencilArrow" });
  b.part(new THREE.BoxGeometry(0.28, 0.01, 0.005), BLACK, { at: [0.0, 1.04, Z + 0.003], name: "arrowUnderline" });

  // warning triangle
  const tri = new THREE.Shape();
  tri.moveTo(0, 0.07);
  tri.lineTo(0.065, -0.045);
  tri.lineTo(-0.065, -0.045);
  const triOut = new THREE.ExtrudeGeometry(tri, { depth: 0.006, bevelEnabled: false });
  b.part(triOut, BLACK, { at: [-1.4, 1.3, Z], scale: [1.15, 1.15, 1], name: "warnTriBack" });
  b.part(triOut, YEL, { at: [-1.4, 1.298, Z + 0.004], name: "warnTri" });
  b.part(new THREE.BoxGeometry(0.012, 0.045, 0.004), BLACK, { at: [-1.4, 1.3, Z + 0.012], name: "warnBang" });
  b.part(new THREE.BoxGeometry(0.014, 0.014, 0.004), BLACK, { at: [-1.4, 1.263, Z + 0.012], name: "warnDot" });

  // hazard chevron stripe at the bottom of the label zone
  for (let i = 0; i < 12; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.005), i % 2 ? BLACK : ORANGE, {
      at: [-1.35 + i * 0.05, 1.42, Z + 0.0025], rotation: [0, 0, 30], name: "hazardStripe",
    });
  }

  // small rivets/screws at label corners
  for (const [rx, ry] of [[-1.21, 1.35], [-0.69, 1.35], [-1.21, 1.25], [-0.69, 1.25]] as [number, number][]) {
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), STEEL_DARK, {
      at: [rx, ry, Z + 0.003], rotation: [90, 0, 0], name: "labelScrew",
    });
  }
  void FADE;
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addWallScreen(b: Builder) {
  const SCR_DARK = "#0a1410";
  const BRASS = "#8c7a45";

  // ---- helpers ----
  const box = (name: string, s: [number, number, number], at: [number, number, number], color: string) =>
    b.part(new THREE.BoxGeometry(...s), color, { at, name });
  const cyl = (
    name: string, r: number, h: number, at: [number, number, number], color: string,
    axis: "x" | "y" | "z" = "y", seg = 8, r2?: number,
  ) => {
    const rot: [number, number, number] = axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at, rotation: rot, name });
  };

  // ================= CRT wall monitor =================
  // wall face of the back panel is z = -0.91; monitor sits on the bracket in front of it
  const MX = 1.15, MY = 2.15;
  const wallZ = -0.905;

  // bracket arm and plate
  box("s2ScreenPlate", [0.22, 0.2, 0.015], [MX, MY, wallZ + 0.008], STEEL_DARK);
  box("s2ScreenArm", [0.08, 0.06, 0.12], [MX, MY - 0.07, wallZ + 0.07], STEEL_DARK);
  for (const sx of [-0.09, 0.09])
    for (const sy of [-0.08, 0.08])
      cyl("s2ScreenBolt", 0.01, 0.012, [MX + sx, MY + sy, wallZ + 0.02], STEEL, "z", 6);

  // chunky tapered CRT housing behind bezel
  b.frustumBox([MX, MY, wallZ + 0.1], [MX, MY, wallZ + 0.22], [0.2, 0.17], [0.4, 0.3], { color: HULL_DARK });
  // bezel: four chunky bars + frame
  const bz = wallZ + 0.24;
  box("s2BezelTop", [0.52, 0.05, 0.06], [MX, MY + 0.16, bz], STEEL_DARK);
  box("s2BezelBot", [0.52, 0.07, 0.06], [MX, MY - 0.165, bz], STEEL_DARK);
  box("s2BezelL", [0.05, 0.3, 0.06], [MX - 0.235, MY, bz], STEEL_DARK);
  box("s2BezelR", [0.05, 0.3, 0.06], [MX + 0.235, MY, bz], STEEL_DARK);
  box("s2BezelLip", [0.46, 0.012, 0.02], [MX, MY + 0.13, bz + 0.035], BLACK);

  // convex glass (dark)
  const glass = b.part(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), SCR_DARK, {
    at: [MX, MY, bz - 0.02], rotation: [90, 0, 0], scale: [0.205, 0.07, 0.125], name: "s2Glass",
  });
  void glass;

  // text drawing on screen
  const lines: string[] = [];
  const texts = ["NOSTROMO 180924609", "LIFE SUPPORT   NOM", "GALLEY PWR   ON", "CRYO   STBY", "> MOTHER ONLINE"];
  texts.forEach((t, i) => {
    lines.push(`<text x="6" y="${22 + i * 20}" font-family="monospace" font-size="11" fill="#5dff9a">${t}</text>`);
  });
  const tex = svg(
    `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="110" fill="#06180e" opacity="0.0"/>
      ${lines.join("")}
      <rect x="6" y="${22 + 5 * 20 - 10}" width="8" height="12" fill="#5dff9a"/>
      <path d="M4 4 H156 V106 H4Z" fill="none" stroke="#5dff9a" stroke-width="1.5" opacity="0.6"/>
    </svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.4, 0.27), "#ffffff", {
      at: [MX, MY, bz + 0.052], dir: [0, 0, 1], axis: "z", texture: tex, name: "s2ScreenText",
    }),
    1.2,
  );
  // faint green screen tint behind text
  glow(box("s2ScreenTint", [0.4, 0.27, 0.004], [MX, MY, bz + 0.046], "#0d3a22"), 0.5);

  // control strip below: knobs, led, vent slots
  box("s2CtrlStrip", [0.5, 0.08, 0.03], [MX, MY - 0.24, bz - 0.02], HULL_DARK);
  [-0.16, -0.06].forEach((kx) => {
    cyl("s2Knob", 0.022, 0.03, [MX + kx, MY - 0.24, bz + 0.005], BLACK, "z", 8);
    box("s2KnobTick", [0.004, 0.02, 0.004], [MX + kx, MY - 0.237, bz + 0.022], WHITE);
  });
  glow(box("s2LedG", [0.02, 0.02, 0.01], [MX + 0.07, MY - 0.24, bz - 0.0], SCREEN_GREEN), 1.5);
  glow(box("s2LedA", [0.02, 0.02, 0.01], [MX + 0.12, MY - 0.24, bz - 0.0], AMBER), 1.5);
  for (let i = 0; i < 3; i++) box("s2Vent", [0.05, 0.006, 0.006], [MX + 0.19, MY - 0.265 + i * 0.016, bz + 0.0], BLACK);
  // cable from monitor to ceiling
  b.sweep(
    [[MX + 0.15, MY + 0.12, wallZ + 0.2], [MX + 0.2, MY + 0.2, wallZ + 0.1], [MX + 0.2, MY + 0.3, wallZ + 0.05]],
    0.01, { color: BLACK },
  );
  // label plate
  box("s2ScreenLabel", [0.14, 0.03, 0.006], [MX - 0.12, MY - 0.3, wallZ + 0.01], ORANGE);

  // ================= Hob details =================
  const HX = 0.35, HY = 0.91;
  // pan grates over the four burners
  for (const hx of [0.2, 0.5])
    for (const hz of [-0.5, -0.74]) {
      for (const d of [-0.04, 0, 0.04]) {
        box("s2GrateX", [0.17, 0.012, 0.012], [hx, HY + 0.035, hz + d], STEEL_DARK);
        box("s2GrateZ", [0.012, 0.012, 0.17], [hx + d, HY + 0.035, hz], STEEL_DARK);
      }
      box("s2GrateRimA", [0.17, 0.012, 0.012], [hx, HY + 0.035, hz + 0.082], STEEL_DARK);
      for (const sx of [-0.08, 0.08])
        for (const sz of [-0.08, 0.08])
          cyl("s2GrateFoot", 0.008, 0.03, [hx + sx, HY + 0.02, hz + sz], STEEL_DARK, "y", 5);
    }

  // knobs on the front lip of the counter (face at z ~ -0.275)
  for (let i = 0; i < 5; i++) {
    const kx = 0.15 + i * 0.1;
    cyl("s2HobKnob", 0.026, 0.04, [kx, 0.8, -0.275], BLACK, "z", 8);
    cyl("s2HobKnobCap", 0.016, 0.012, [kx, 0.8, -0.252], STEEL, "z", 8);
    box("s2HobKnobMark", [0.004, 0.022, 0.004], [kx, 0.806, -0.244], i % 2 ? WHITE : ORANGE);
    box("s2HobDial", [0.05, 0.004, 0.004], [kx, 0.84, -0.286], WHITE);
  }
  box("s2HobKnobPlate", [0.56, 0.1, 0.01], [0.35, 0.8, -0.288], STEEL_DARK);
  // indicator lamp
  cyl("s2LampBezel", 0.022, 0.014, [0.62, 0.8, -0.28], STEEL, "z", 8);
  glow(cyl("s2Lamp", 0.015, 0.016, [0.62, 0.8, -0.27], AMBER, "z", 8), 1.6);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addFridgeHazard(b: Builder) {
  const r = rng(23);
  const FZ = -0.265; // front face of fridge doors (door center -0.285, half thickness 0.015)
  const FX = 1.2;

  const box = (name: string, s: [number, number, number], at: [number, number, number], color: string) =>
    b.part(new THREE.BoxGeometry(...s), color, { at, name });

  // ---------- Fridge hazard ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#d9822b"/>
      ${Array.from({ length: 12 }, (_, i) => `<polygon points="${i * 8 - 8},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8},0" fill="#16161a"/>`).join("")}
      <rect x="0" y="0" width="64" height="16" fill="none" stroke="#16161a" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.62, 0.155), "#ffffff", {
    at: [FX, 1.7, FZ - 0.003], dir: [0, 0, -1], axis: "z", texture: hazard, name: "hazardBand",
  });
  b.part(new THREE.PlaneGeometry(0.62, 0.155), "#ffffff", {
    at: [FX, 0.3, FZ - 0.003], dir: [0, 0, -1], axis: "z", texture: hazard, name: "hazardBandLow",
  });

  // vent grille at top
  box("ventFrame", [0.34, 0.1, 0.012], [FX - 0.08, 1.86, FZ - 0.006], STEEL_DARK);
  for (let i = 0; i < 6; i++) box("ventSlat", [0.3, 0.008, 0.012], [FX - 0.08, 1.826 + i * 0.016, FZ - 0.014], BLACK);

  // rating plate
  const plate = svg(
    `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="40" fill="#d8cfae" stroke="#16161a" stroke-width="2"/>
      <text x="5" y="11" font-family="monospace" font-weight="bold" font-size="8" fill="#16161a">COLD STORE</text>
      <rect x="5" y="15" width="50" height="2" fill="#16161a"/>
      <text x="5" y="26" font-family="monospace" font-size="6" fill="#16161a">-18C  MAX 240V</text>
      <text x="5" y="35" font-family="monospace" font-size="6" fill="#b8362b">NOSTROMO 180924609</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.133), "#ffffff", {
    at: [FX - 0.12, 1.6, FZ - 0.003], dir: [0, 0, -1], axis: "z", texture: plate, name: "ratingPlate",
  });
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6), STEEL, {
      at: [FX - 0.12 + dx * 0.09, 1.6 + dy * 0.06, FZ - 0.006], rotation: [90, 0, 0], name: "plateRivet",
    });

  // latch assembly on upper door, near handle side
  const LX = 1.38, LY = 1.2;
  box("latchBase", [0.12, 0.2, 0.025], [LX, LY, FZ - 0.012], STEEL_DARK);
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), STEEL, {
    at: [LX, LY + 0.03, FZ - 0.035], rotation: [90, 0, 0], name: "latchHub",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6), STEEL_DARK, {
    at: [LX, LY + 0.03, FZ - 0.05], rotation: [90, 0, 0], name: "latchPin",
  });
  b.rod([LX, LY + 0.03, FZ - 0.06], [LX, LY - 0.1, FZ - 0.06], 0.014, { color: RED });
  b.part(new THREE.SphereGeometry(0.026, 7, 5), RED, { at: [LX, LY - 0.11, FZ - 0.06], name: "latchKnob" });
  box("latchKeeper", [0.08, 0.05, 0.03], [LX, LY - 0.17, FZ - 0.015], STEEL);
  for (const dy of [-0.08, 0.08])
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), STEEL, {
      at: [LX, LY + dy + 0.02, FZ - 0.027], rotation: [90, 0, 0], name: "latchBolt",
    });

  // hinges on far side
  for (const hy of [0.45, 1.0, 1.7])
    box("hingeBarrel", [0.03, 0.12, 0.03], [0.87, hy, FZ - 0.005], STEEL_DARK);

  // lower door small label & grime scuff
  box("lowerLabel", [0.12, 0.05, 0.005], [FX - 0.15, 0.85, FZ - 0.0025], CREAM);

  // ---------- Ceiling cables ----------
  const PZ = -0.8;
  const cableCols = [BLACK, RED, ORANGE];
  const spans = [[-1.75, -0.5], [-0.5, 0.5], [0.5, 1.75]];
  spans.forEach(([x0, x1], si) => {
    cableCols.forEach((col, ci) => {
      const zOff = -0.69 - ci * 0.025;
      const y0 = 2.18 - ci * 0.01;
      const pts: [number, number, number][] = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        const sag = Math.sin(t * Math.PI) * (0.07 + 0.02 * ci + 0.01 * si);
        pts.push([x0 + (x1 - x0) * t, y0 - sag, zOff + 0.01 * Math.sin(t * 6 + ci)]);
      }
      b.sweep(pts, 0.012, { color: col, sides: 5 });
    });
  });
  // clamps
  for (const cx of [-1.5, -0.5, 0.5, 1.5]) {
    box("cableClamp", [0.04, 0.09, 0.06], [cx, 2.19, -0.72], STEEL_DARK);
    box("clampBolt", [0.012, 0.012, 0.02], [cx, 2.19, -0.68], STEEL);
  }
  // conduit
  b.rod([-1.75, 2.24, -0.55], [1.75, 2.24, -0.55], 0.018, { color: STEEL, sides: 8 });
  for (const cx of [-1.2, 0, 1.2]) box("conduitClamp", [0.03, 0.05, 0.05], [cx, 2.24, -0.56], STEEL_DARK);

  // valve wheel (red) on pipe
  const VX = -0.3;
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), STEEL_DARK, { at: [VX, 2.2, -0.745], rotation: [90, 0, 0], name: "valveStem" });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), STEEL, { at: [VX, 2.3, -0.72], rotation: [90, 0, 0], name: "valveBody" });
  b.part(new THREE.TorusGeometry(0.075, 0.011, 5, 14), RED, { at: [VX, 2.3, -0.76 + 0.06 - 0.12], name: "valveWheel" });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    b.part(new THREE.BoxGeometry(0.15, 0.01, 0.01), RED, {
      at: [VX, 2.3, -0.82], rotation: [0, 0, (a * 180) / Math.PI], name: "valveSpoke",
    });
  }
  b.part(new THREE.SphereGeometry(0.02, 6, 4), STEEL_DARK, { at: [VX, 2.3, -0.84], name: "valveCap" });

  // pressure gauge
  const gauge = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#e8e4d4" stroke="#16161a" stroke-width="3"/>
      <path d="M50 50 L28 74 M50 50" stroke="#16161a" stroke-width="3"/>
      <path d="M20 70 A38 38 0 0 1 80 70" stroke="#16161a" stroke-width="3" fill="none"/>
      <path d="M68 24 A38 38 0 0 1 80 70" stroke="#b8362b" stroke-width="7" fill="none"/>
      <path d="M50 50 L66 28" stroke="#b8362b" stroke-width="3"/>
      <circle cx="50" cy="50" r="4" fill="#16161a"/>
    </svg>`,
    { size: 128 },
  );
  const GX = 0.7;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), STEEL_DARK, { at: [GX, 2.2, -0.72], name: "gaugeStem" });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 14), STEEL, { at: [GX, 2.17, -0.74], rotation: [90, 0, 0], name: "gaugeCase" });
  b.part(new THREE.CircleGeometry(0.063, 16), "#ffffff", {
    at: [GX, 2.17, -0.718], dir: [0, 0, 1], axis: "z", texture: gauge, name: "gaugeFace",
  });
  void r;
  glow(b.part(new THREE.BoxGeometry(0.02, 0.012, 0.005), AMBER, { at: [GX + 0.11, 2.17, -0.725], name: "gaugeLamp" }), 1.2);
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, rng, catmull, svg } from "agentic-3js-builder";

export function addCounterClutter(b: Builder) {
  const r = rng(24);
  const TOP = 0.9; // counter top surface (counterTop y 0.875 + 0.025)
  const DARKWOOD = "#6b4a2e";
  const TIN = "#c9cdd0";
  const PLATE = "#e9e6da";
  const RAG = "#9c4a38";
  const BLADE = "#d5dadd";

  const box = (name: string, s: [number, number, number], at: [number, number, number], c: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...s), c, { at, name, rotation: rot });
  const cyl = (name: string, rt: number, rb: number, h: number, at: [number, number, number], c: string, seg = 10, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, name, rotation: rot });

  // ---- Stacked canisters (graduated sizes) with lids and label bands
  const label = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8e4d4"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#16161a" stroke-width="2"/><rect x="8" y="8" width="30" height="4" fill="#16161a"/><rect x="8" y="16" width="18" height="3" fill="#16161a"/><rect x="44" y="8" width="12" height="16" fill="#d9822b"/></svg>`,
    { size: 128 },
  );
  const canX = -0.98, canZ = -0.78;
  const cans: [number, number][] = [[0.07, 0.16], [0.058, 0.13], [0.046, 0.1]];
  let cy0 = TOP;
  cans.forEach(([rad, h], i) => {
    cyl("canister", rad, rad, h, [canX, cy0 + h / 2, canZ], TIN, 10);
    cyl("canisterRib", rad + 0.003, rad + 0.003, 0.012, [canX, cy0 + 0.02, canZ], STEEL_DARK, 10);
    b.part(new THREE.PlaneGeometry(rad * 1.5, rad * 0.75), "#ffffff", {
      at: [canX, cy0 + h * 0.58, canZ + rad + 0.002], dir: [0, 0, 1], axis: "z", texture: label, name: "canisterLabel",
    });
    cy0 += h;
    cyl("canisterLid", rad * 0.92, rad * 0.92, 0.012, [canX, cy0 + 0.006, canZ], STEEL_DARK, 10);
    cy0 += 0.012;
  });
  cyl("canisterKnob", 0.012, 0.012, 0.02, [canX, cy0 + 0.01, canZ], BLACK, 6);
  // second short canister
  cyl("canisterB", 0.06, 0.06, 0.12, [-0.84, TOP + 0.06, -0.8], TIN, 10);
  cyl("canisterBLid", 0.054, 0.054, 0.012, [-0.84, TOP + 0.126, -0.8], STEEL_DARK, 10);
  box("canisterBLabel", [0.06, 0.04, 0.004], [-0.84, TOP + 0.06, -0.738], ORANGE);

  // ---- Kettle: body, lid, spout, handle
  const kx = -0.2, kz = -0.7;
  cyl("kettleBody", 0.07, 0.09, 0.14, [kx, TOP + 0.07, kz], STEEL, 10);
  cyl("kettleShoulder", 0.04, 0.07, 0.04, [kx, TOP + 0.16, kz], STEEL, 10);
  cyl("kettleKnob", 0.014, 0.014, 0.025, [kx, TOP + 0.195, kz], BLACK, 6);
  cyl("kettleSpout", 0.012, 0.025, 0.1, [kx + 0.11, TOP + 0.14, kz], STEEL_DARK, 6, [0, 0, -55]);
  b.sweep(catmull([[kx - 0.07, TOP + 0.15, kz], [kx - 0.14, TOP + 0.17, kz], [kx - 0.15, TOP + 0.08, kz], [kx - 0.085, TOP + 0.03, kz]]), 0.011, { color: BLACK, sides: 6 });
  cyl("kettleBand", 0.082, 0.082, 0.012, [kx, TOP + 0.05, kz], STEEL_DARK, 10);

  // ---- Cutting board with knife
  const bx0 = -0.55, bz0 = -0.52;
  box("cuttingBoard", [0.36, 0.022, 0.2], [bx0, TOP + 0.011, bz0], DARKWOOD, [0, 8, 0]);
  box("boardGroove", [0.3, 0.003, 0.012], [bx0, TOP + 0.0235, bz0 - 0.07], "#4a3220", [0, 8, 0]);
  box("boardHole", [0.03, 0.004, 0.03], [bx0 - 0.14, TOP + 0.023, bz0 + 0.04], BLACK);
  // veg slices on board
  for (let i = 0; i < 4; i++)
    cyl("slice", 0.02, 0.02, 0.008, [bx0 + 0.04 + i * 0.03, TOP + 0.026, bz0 + 0.02 + r() * 0.03], i % 2 ? ORANGE : CREAM, 8);
  box("knifeBlade", [0.17, 0.004, 0.034], [bx0 + 0.02, TOP + 0.03, bz0 + 0.06], BLADE, [0, -14, 0]);
  box("knifeHandle", [0.09, 0.02, 0.02], [bx0 - 0.12, TOP + 0.035, bz0 + 0.075], BLACK, [0, -14, 0]);
  for (const k of [-0.145, -0.11]) box("knifeRivet", [0.008, 0.005, 0.008], [bx0 + k, TOP + 0.047, bz0 + 0.075 - (k + 0.145) * -0.1], STEEL);

  // ---- Dish rack with upright plates
  const dx = -1.3, dz = -0.45;
  box("rackBase", [0.3, 0.012, 0.18], [dx, TOP + 0.006, dz], STEEL_DARK);
  for (const sx of [-0.14, 0.14]) for (const sz of [-0.08, 0.08]) cyl("rackFoot", 0.01, 0.01, 0.01, [dx + sx, TOP + 0.005, dz + sz], BLACK, 5);
  for (const sz of [-0.085, 0.085]) {
    box("rackRail", [0.3, 0.012, 0.01], [dx, TOP + 0.06, dz + sz], STEEL_DARK);
    box("rackRailLow", [0.3, 0.008, 0.008], [dx, TOP + 0.02, dz + sz], STEEL_DARK);
  }
  for (const sx of [-0.145, 0.145]) for (const sz of [-0.085, 0.085]) box("rackPost", [0.01, 0.06, 0.01], [dx + sx, TOP + 0.04, dz + sz], STEEL_DARK);
  for (let i = 0; i < 5; i++) {
    const px = dx - 0.1 + i * 0.05;
    cyl("plate", 0.085, 0.085, 0.008, [px, TOP + 0.1, dz], PLATE, 12, [0, 0, 90]);
    cyl("plateRim", 0.06, 0.06, 0.01, [px, TOP + 0.1, dz], "#cfcbbb", 12, [0, 0, 90]);
  }
  // grid slats
  for (let i = 0; i < 5; i++) box("rackSlat", [0.008, 0.008, 0.17], [dx - 0.1 + i * 0.05, TOP + 0.014, dz], STEEL_DARK);

  // ---- Rag hanging over counter front edge
  box("ragTop", [0.22, 0.01, 0.12], [-0.12, TOP + 0.006, -0.36], RAG, [0, 6, 0]);
  box("ragFlap", [0.22, 0.2, 0.008], [-0.12, TOP - 0.1, -0.292], RAG);
  box("ragStripe", [0.22, 0.018, 0.01], [-0.12, TOP - 0.06, -0.287], WHITE);
  box("ragStripe", [0.22, 0.018, 0.01], [-0.12, TOP - 0.15, -0.287], WHITE);
  for (let i = 0; i < 4; i++) box("ragFringe", [0.03, 0.03, 0.006], [-0.21 + i * 0.06, TOP - 0.215, -0.292], RAG);

  // ---- Extras: spice jars, tin tray, salt shaker near hob
  for (let i = 0; i < 3; i++) {
    const jx = -0.4 + i * 0.065;
    cyl("jar", 0.026, 0.026, 0.07, [jx, TOP + 0.035, -0.84], i === 1 ? "#7a1d18" : "#8a8c78", 8);
    cyl("jarCap", 0.027, 0.027, 0.015, [jx, TOP + 0.077, -0.84], BLACK, 8);
  }
  box("sauceTin", [0.09, 0.05, 0.07], [0.0, TOP + 0.025, -0.45], ORANGE, [0, 20, 0]);
  box("sauceTinLabel", [0.07, 0.02, 0.003], [0.0, TOP + 0.03, -0.416], BLACK, [0, 20, 0]);
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addTableMeal(b: Builder) {
  const R = rng(25);
  const TX = -0.2, TZ = 0.7, TOP = 0.805;
  const KETCH = "#a82a1f", FOOD2 = "#7a5a2e", TIN = "#c9a23a", MUSTARD = "#d8b12c";

  const box = (name: string, s: [number, number, number], at: [number, number, number], c: string) =>
    b.part(new THREE.BoxGeometry(...s), c, { at, name });
  const cyl = (name: string, r: number, h: number, at: [number, number, number], c: string, seg = 8, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, { at, name });
  const blob = (name: string, r: number, at: [number, number, number], c: string, sy = 0.45) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), c, { at, name, scale: [1, sy, 1] });

  // Label textures
  const tinTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#d8b040"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#16161a" stroke-width="2"/><rect x="8" y="8" width="20" height="16" fill="#b8362b"/><path d="M34 10h22M34 16h18M34 22h22" stroke="#16161a" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const bottleTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e8e4d4"/><rect y="6" width="32" height="4" fill="#16161a"/><path d="M4 16h24M4 21h18M4 26h22" stroke="#b8362b" stroke-width="3"/></svg>`,
    { size: 96 },
  );

  // Extra compartment trays with food blobs (front row nearer the bench, z + 0.28)
  const trayXs = [-0.62, 0.02, 0.5];
  trayXs.forEach((tx, i) => {
    const z = TZ - 0.02;
    box("tray2", [0.3, 0.015, 0.2], [tx, TOP + 0.008, z - 0.15], STEEL_DARK);
    box("trayRimF", [0.3, 0.03, 0.01], [tx, TOP + 0.02, z - 0.245], STEEL);
    box("trayRimB", [0.3, 0.03, 0.01], [tx, TOP + 0.02, z - 0.055], STEEL);
    box("trayDivX", [0.01, 0.025, 0.19], [tx, TOP + 0.02, z - 0.15], STEEL);
    box("trayDivZ", [0.29, 0.025, 0.01], [tx, TOP + 0.02, z - 0.15], STEEL);
    const foods = [CREAM, ORANGE, FOOD2, "#8aa05a"];
    for (let k = 0; k < 4; k++) {
      const fx = tx + (k % 2 ? 0.07 : -0.07) + (R() - 0.5) * 0.02;
      const fz = z - 0.15 + (k < 2 ? -0.045 : 0.045);
      blob("food", 0.03 + R() * 0.012, [fx, TOP + 0.03, fz], foods[(k + i) % 4], 0.55);
    }
  });
  // cutlery
  for (const tx of trayXs) box("spoon", [0.012, 0.006, 0.12], [tx + 0.19, TOP + 0.004, TZ - 0.17], STEEL);

  // Mugs with extras
  [[-0.38, 0.1], [0.28, 0.14]].forEach(([mx, mz]) => {
    cyl("mug2", 0.036, 0.085, [mx, TOP + 0.043, TZ + mz], WHITE);
    cyl("mug2Coffee", 0.03, 0.004, [mx, TOP + 0.085, TZ + mz], "#2b1a12");
    box("mug2Handle", [0.02, 0.05, 0.012], [mx + 0.045, TOP + 0.045, TZ + mz], WHITE);
    cyl("mug2Stripe", 0.0375, 0.012, [mx, TOP + 0.03, TZ + mz], RED);
  });

  // Ketchup and sauce bottles
  const bottle = (x: number, z: number, body: string, h: number) => {
    cyl("sauceBody", 0.028, h, [x, TOP + h / 2, z], body, 8);
    cyl("sauceShoulder", 0.012, 0.04, [x, TOP + h + 0.018, z], body, 8, 0.028);
    cyl("sauceCap", 0.014, 0.025, [x, TOP + h + 0.05, z], WHITE, 6);
    b.part(new THREE.CylinderGeometry(0.0285, 0.0285, h * 0.5, 8, 1, true, -Math.PI / 2, Math.PI), "#ffffff", {
      at: [x, TOP + h * 0.5, z], texture: bottleTex, name: "sauceLabel",
    });
  };
  bottle(0.62, TZ + 0.12, KETCH, 0.14);
  bottle(0.7, TZ + 0.17, MUSTARD, 0.12);
  bottle(0.55, TZ + 0.2, "#6b3a1a", 0.11);

  // Cigarette tin
  box("tin", [0.1, 0.02, 0.06], [-0.05, TOP + 0.011, TZ + 0.2], TIN);
  b.part(new THREE.PlaneGeometry(0.095, 0.055), "#ffffff", {
    at: [-0.05, TOP + 0.0225, TZ + 0.2], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: tinTex, name: "tinLabel",
  });
  box("tinLid", [0.1, 0.004, 0.012], [-0.05, TOP + 0.022, TZ + 0.168], STEEL_DARK);

  // Coffee thermos (second, with strap and cup lid)
  cyl("thermos2", 0.045, 0.2, [0.15, TOP + 0.1, TZ + 0.24], STEEL, 10);
  cyl("thermos2Band", 0.0465, 0.03, [0.15, TOP + 0.06, TZ + 0.24], ORANGE, 10);
  cyl("thermos2Cup", 0.04, 0.04, [0.15, TOP + 0.22, TZ + 0.24], BLACK, 10);
  box("thermos2Handle", [0.012, 0.1, 0.012], [0.2, TOP + 0.12, TZ + 0.24], STEEL_DARK);
  // crumbs / spill
  blob("spill", 0.05, [-0.6, TOP + 0.002, TZ + 0.22], "#2b1a12", 0.06);

  // Bench fixings
  const BX = -0.2;
  [[0.05, 1], [1.35, -1]].forEach(([bz, k]) => {
    // rubberised pads
    for (const px of [-0.58, 0.18]) box("seatPad", [0.7, 0.014, 0.25], [BX + px + 0.2 - 0.2, 0.531, bz], GRIME);
    // bolt heads at pad corners and bench ends
    for (const bxx of [-0.9, -0.55, -0.2, 0.15, 0.5]) {
      for (const dz of [-0.11, 0.11]) cyl("seatBolt", 0.01, 0.008, [bxx, 0.542, bz + dz], STEEL, 6);
    }
    // gussets under seat at legs
    for (const lx of [-0.95, 0.55]) {
      for (const s of [-1, 1]) {
        b.part(new THREE.CylinderGeometry(0.0, 0.07, 0.03, 3), STEEL_DARK, {
          at: [lx + s * 0.05, 0.38, bz], rotation: [0, 0, 0], name: "gusset",
        });
        box("gussetPlate", [0.012, 0.12, 0.2], [lx + s * 0.035, 0.36, bz], STEEL_DARK);
      }
      cyl("legBolt", 0.012, 0.01, [lx, 0.4, bz + k * 0.145], STEEL, 6);
    }
    // edge trim
    box("benchEdgeTrim", [1.7, 0.012, 0.012], [BX, 0.495, bz - k * 0.16], STEEL);
  });
  glow(box("benchMarker", [0.04, 0.01, 0.01], [-1.0, 0.495, 0.21], AMBER), 1.2);
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addOverheadDoorsDetail(b: Builder) {
  const r = rng(26);
  const BOX = (n: string, s: [number, number, number], at: [number, number, number], c: string) =>
    b.part(new THREE.BoxGeometry(...s), c, { at, name: n });
  const CYL = (n: string, rad: number, h: number, at: [number, number, number], c: string, axis: "x" | "y" | "z", seg = 8) => {
    const rot: [number, number, number] = axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(rad, rad, h, seg), c, { at, rotation: rot, name: n });
  };

  // ---------- Overhead cupboard doors ----------
  const label = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8e4d4"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#16161a" stroke-width="2"/>
     <rect x="6" y="7" width="30" height="4" fill="#16161a"/><rect x="6" y="14" width="46" height="3" fill="#16161a"/>
     <rect x="6" y="21" width="20" height="3" fill="#16161a"/><path d="M50 6 L58 6 L54 12Z" fill="#d9822b" stroke="#16161a" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const OX = -0.8;
  for (let i = 0; i < 3; i++) {
    const dx = OX - 0.46 + i * 0.46;
    // label plate
    b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", { at: [dx - 0.1, 1.9, -0.5155], dir: [0, 0, 1], axis: "z", texture: label, name: "doorLabel" });
    // hinge barrels on outer edge
    for (const hy of [1.58, 1.92]) {
      CYL("hingeBarrel", 0.012, 0.07, [dx - 0.22 * (i === 1 ? 1 : 1), hy, -0.515], STEEL_DARK, "y", 6);
      BOX("hingeLeaf", [0.05, 0.05, 0.006], [dx - 0.2, hy, -0.516], STEEL_DARK);
    }
    // latch hook + catch
    BOX("latchPlate", [0.04, 0.07, 0.008], [dx + 0.17, 1.75, -0.516], STEEL);
    b.part(new THREE.TorusGeometry(0.014, 0.004, 4, 8, Math.PI * 1.5), STEEL_DARK, { at: [dx + 0.17, 1.75, -0.505], name: "latchHook" });
    CYL("latchPin", 0.005, 0.02, [dx + 0.17, 1.72, -0.507], BLACK, "z", 5);
    // bolts
    for (const [bx_, by_] of [[-0.19, 0.2], [0.19, 0.2], [-0.19, -0.2], [0.19, -0.2]])
      CYL("doorBolt", 0.007, 0.006, [dx + bx_, 1.75 + by_, -0.5145], STEEL_DARK, "z", 6);
  }
  // recessed emergency pull handle on the middle door
  const mx = OX;
  BOX("pullRecess", [0.16, 0.07, 0.01], [mx, 1.66, -0.515], BLACK);
  BOX("pullBar", [0.12, 0.016, 0.02], [mx, 1.66, -0.51], RED);
  glow(BOX("pullLamp", [0.02, 0.012, 0.006], [mx + 0.09, 1.7, -0.516], RED), 1.2);

  // ---------- Deck: diamond-plate strips ----------
  const diamond = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#8a8a8a"/>
     <path d="M8 4 L12 8 L8 12 L4 8Z M24 20 L28 24 L24 28 L20 24Z M24 4 L28 8 L24 12 L20 8Z M8 20 L12 24 L8 28 L4 24Z" fill="#cfd2d3" stroke="#3a3932" stroke-width="1"/></svg>`,
    { size: 128 },
  );
  const strip = (n: string, w: number, d: number, at: [number, number, number]) => {
    b.part(new THREE.PlaneGeometry(w, d), "#9a9fa2", { at, dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: diamond, name: n });
  };
  strip("treadStrip", 1.9, 0.5, [-0.2, 0.0635, 0.7]);
  strip("treadStrip", 1.4, 0.35, [-0.2, 0.0635, -0.4]);
  strip("treadStrip", 0.5, 1.0, [1.3, 0.0635, 0.7]);
  for (const sx of [-1.2, 0.8]) BOX("stripEdge", [0.02, 0.006, 0.5], [sx - 0.0, 0.062, 0.7], STEEL_DARK);
  for (const [n, w, d, at] of [
    ["frameEdge", 1.92, 0.02, [-0.2, 0.062, 0.45]],
    ["frameEdge", 1.92, 0.02, [-0.2, 0.062, 0.95]],
  ] as [string, number, number, [number, number, number]][])
    BOX(n, [w, 0.006, d], at, STEEL_DARK);

  // yellow guide line
  BOX("guideLine", [3.3, 0.003, 0.03], [0, 0.0605, 1.7], "#c9a227");

  // drain grate
  BOX("drainFrame", [0.36, 0.01, 0.36], [1.1, 0.062, 0.1], STEEL_DARK);
  BOX("drainHole", [0.3, 0.012, 0.3], [1.1, 0.0625, 0.1], BLACK);
  for (let k = 0; k < 7; k++) BOX("drainBar", [0.014, 0.014, 0.3], [1.1 - 0.12 + k * 0.04, 0.066, 0.1], STEEL);
  for (const [cx, cz] of [[1.1 - 0.15, 0.1 - 0.15], [1.1 + 0.15, 0.1 - 0.15], [1.1 - 0.15, 0.1 + 0.15], [1.1 + 0.15, 0.1 + 0.15]])
    CYL("drainBolt", 0.008, 0.01, [cx, 0.066, cz], STEEL, "y", 6);

  // bolt heads around table pedestals
  for (const px of [-0.75, 0.35])
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      CYL("pedBolt", 0.012, 0.012, [px + Math.cos(a) * 0.16, 0.096, 0.7 + Math.sin(a) * 0.16], STEEL_DARK, "y", 6);
    }
  // oil stain decal
  void r;
}
```