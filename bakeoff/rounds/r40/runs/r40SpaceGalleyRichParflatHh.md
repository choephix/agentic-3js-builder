<!-- call: plan -->

```json
{
  "name": "Nostromo Galley",
  "description": "A cutaway corner of a grimy 1979 commercial-tug galley: steel counters, range with hood, tall fridge and lockers, a bolted mess table with benches, exposed pipes and amber CRT glow.",
  "builderName": "nostromoGalley",
  "size": [3.8, 2.6, 3.8],
  "layout": "A cutaway room module, 3.8 m wide (x) by 3.8 m long (z) by 2.6 m tall, viewed from the open front (+Z). The deck slab is y 0..0.08 and covers x ±1.9, z ±1.9. Two walls stand on it: the BACK bulkhead (inner face z = -1.8, outer face z = -1.9) and the RIGHT bulkhead (inner face x = -1.8, outer face x = -1.9). Both are 2.6 m tall. The LEFT side (+X) is open apart from a short end bulkhead with a round hatch doorway at x = 1.85 (z -0.5..0.8); the front stays open. Along the back wall runs the counter-and-range run (x -1.1..1.75, depth to z -1.1). Along the right wall runs the fridge and locker run (a tall fridge in the back corner, then base units and a dispenser out to z = 1.0, depth to x -1.1). A long bolted mess table with a bench on each side stands in the centre (table x ±0.55, z -0.7..0.9). Overhead sit a hood over the range, a pipe bundle, ceiling beams, lamp panels, a hanging utensil rail and a swing-arm CRT monitor. Style: everything is hard-edged boxes and cylinders in dull, dirty, lived-in industrial plastic and steel. The walls are faded beige-cream panels with dark ribbed seams, and every cabinet has rivet rows, recessed handles and scuffed darker strips at the kick plates. There are yellow/black hazard stripes, stencilled numbers and warning labels built as small thin boxes, orange and copper pipes, and chunky toggle switches. Each lived-in detail is its own thin part (grime streaks, rust patches, drips). Only the small lights and screens glow (amber, green CRT, cyan, red). Everything else stays matte. No curves beyond 8-12 segment cylinders.",
  "palette": {
    "deckGrey": "#3b3d3e",
    "grating": "#2a2b2c",
    "wallBeige": "#a9a38c",
    "wallDark": "#4d5049",
    "panelCream": "#c8c0a4",
    "hullGrey": "#6b6f68",
    "steel": "#8d9298",
    "steelDark": "#555a60",
    "stainless": "#b9bec4",
    "blackRubber": "#1c1d1f",
    "grime": "#2f2c25",
    "rust": "#7a4a2a",
    "hazardYellow": "#d9a521",
    "hazardBlack": "#1a1a18",
    "orangePipe": "#c4601f",
    "copper": "#a8692f",
    "amber": "#ffa21f",
    "greenCRT": "#5cf29a",
    "cyanLed": "#38e6e0",
    "redLed": "#e0301f",
    "mugWhite": "#d8d4c4",
    "foodGreen": "#6f7d3a",
    "foodRed": "#9a3a2a"
  },
  "mounts": {
    "deckTop": [0, 0.08, 0],
    "backWallFace": [0, 1.3, -1.8],
    "rightWallFace": [-1.8, 1.3, 0],
    "leftHatch": [1.85, 0.9, 0.15],
    "ceilingUnder": [0, 2.5, 0],
    "counterTop": [0, 0.95, -1.45],
    "rangeCentre": [0.7, 0.95, -1.45],
    "sinkCentre": [-0.2, 0.95, -1.45],
    "hoodBase": [0.7, 1.65, -1.45],
    "fridgeFront": [-1.15, 1.0, -1.45],
    "rightCounterTop": [-1.45, 0.95, -0.05],
    "tableCentre": [0, 0.78, 0.1],
    "benchSeatL": [0.8, 0.46, 0.1],
    "benchSeatR": [-0.8, 0.46, 0.1],
    "utensilRail": [0, 1.6, -1.72],
    "pipeBundle": [-0.9, 2.4, 0],
    "monitorArm": [-1.7, 1.75, 0.6]
  },
  "joints": [],
  "parts": [
    {
      "id": "shell",
      "builds": "The room enclosure and its dressing. The deck slab (deckGrey) y 0..0.08 over x ±1.9 and z ±1.9, with diamond-plate-style grating strips (grating, thin boxes in a grid) laid on the deck walkway between the table and the counters, and bolted floor plates with rivet heads. A yellow/black hazard stripe border (many alternating thin hazardYellow/hazardBlack slanted boxes) along the front edge of both counter runs and around the hatch. The back bulkhead and right bulkhead are built from tall wallBeige panels (about 0.6 m wide, 0.04 m thick) separated by wallDark vertical ribs and horizontal seam bars at y 0.95, 1.5 and 2.3. They carry rivet rows, hullGrey base skirting with a grime strip, a few rust and grime streak patches, stencilled number plates (small panelCream plates with dark thin bars as digits), warning label rectangles (hazardYellow with hazardBlack bars) and conduit runs (orangePipe and copper small tubes with clamps) running vertically near the corners. The left end bulkhead at x = 1.85 has a round hatch frame (octagonal ring of steelDark, with a wheel lock handle) and wall segments either side. Includes the wall light-switch panels and a few cable bundles (blackRubber) hanging along the walls. It builds NO furniture, counters, ceiling beams or lamps.",
      "box": [[-1.9, 0, -1.9], [1.9, 2.6, 1.9]],
      "attaches": "Inner wall faces are the mounts backWallFace (z = -1.8) and rightWallFace (x = -1.8). The deck top (y = 0.08) is the mount deckTop that every other part stands on. The hatch is at leftHatch. Nothing from other parts should be built inside the wall thickness.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "backRun",
      "builds": "The counter run along the back wall, x -1.1..1.75, depth z -1.78..-1.1, standing on the deck at y 0.08 with its top at y 0.95. Base cabinets of steel (steel/steelDark) with recessed handle bars, rivet rows, door seams and a grime kick plate (blackRubber, 0.1 m high). A countertop slab (stainless) with a raised lip and scuff marks. Left part (x -1.1..-0.6): a prep counter holding a cutting board (panelCream), a knife block and a utensil pot. Sink (x -0.6..0.2, centred at sinkCentre): a double stainless basin with dark recesses, a swan-neck faucet in copper/steel with a handle, a drain grille and a dish rack with plates. Range (x 0.2..1.2, centred at rangeCentre): a stove with four burner rings (blackRubber rings, steelDark grates, small amber glowing indicator dots), a front control panel with five chunky knobs and tiny label strips, an oven door with a window (blackRubber with an amber glow strip) and a handle bar, plus a pot with a lid and a steaming kettle on the burners. Right part (x 1.2..1.75): a coffee machine (hullGrey body with a cyanLed glowing display, a red LED, a drip tray and a carafe), a stack of food trays, and a small microwave unit (panelCream with a dark window and a glowing timer digit panel in greenCRT). Shallow wall shelf blocks above are NOT included. The hood is built by the overhead part.",
      "box": [[-1.1, 0.08, -1.78], [1.75, 1.35, -1.1]],
      "attaches": "Rests on deckTop. Back faces touch backWallFace (z = -1.8). The range centre is the mount rangeCentre, the sink the mount sinkCentre and the counter top the mount counterTop. Its x = -1.1 end meets the fridge's side at the back-right corner (the fridge body occupies x < -1.1).",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "rightRun",
      "builds": "The cold storage and locker run along the right wall (inner face x = -1.8), occupying x -1.78..-1.1. A tall fridge in the back corner (z -1.78..-1.1, height 2.0, centred at fridgeFront): a panelCream and hullGrey body with a two-door split (freezer on top), heavy vertical handle bars, a steel latch with a lever, hinge cylinders, a seal strip (blackRubber), a hazard label plate and a frost-blue recessed vent. A glowing cyanLed temperature display with a tiny digit block and a red LED. Then base units along the wall (z -1.1..1.0, top y 0.95, rightCounterTop): drawer fronts (steel) with recessed handles and rivet corners, a rounded-box trash compactor with a foot pedal and a warning label, a built-in drink and soup dispenser (hullGrey housing, 3 nozzles, a drip grille, a glowing amber display with a greenCRT cursor bar and push buttons), and a countertop set with a toaster, a stack of bowls (mugWhite), a canned goods stack (steel cans with foodRed and foodGreen label bands) and a bread box. A locker bank on the wall above the base units (y 1.25..2.0, z -1.0..0.9): five small steel hatch doors with latches, number stencils and an orangePipe strip. Everything stays at x < -1.1 on the room side and is flush against the wall at x = -1.8.",
      "box": [[-1.78, 0.08, -1.78], [-1.1, 2.1, 1.0]],
      "attaches": "Rests on deckTop. The back face touches rightWallFace (x = -1.8). The fridge corner shares the back-right corner with the back run's end at x = -1.1. The base units' top is the mount rightCounterTop.",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "messTable",
      "builds": "The central mess table set and the two benches. The table (tableCentre, top at y 0.78) has a thick hullGrey top slab (x ±0.55, z -0.7..0.9) with a steel edge rim and rivet heads, a grime-worn scuffed centre strip and a hazard-yellow edge stripe at each end. Two chunky pedestal bases (steelDark, square, each with a bolted foot flange and floor bolts) at z -0.35 and z 0.55. Two bolted benches (x ±0.65..±0.95 around the table, seat height 0.46) with panelCream padded seats, blackRubber seat edge strips, steelDark legs with cross braces and foot plates. Tableware: six steel food trays with compartments (alternating foodGreen and foodRed blobs as flattened spheres and boxes), mugs (mugWhite cylinders with handle loops and a dark coffee disc on top), a water pitcher, salt and pepper shakers, a sauce bottle with a red cap, forks and spoons (thin steel boxes), a folded napkin, a dropped spoon, a half-eaten food tin with a lid, a handheld data-pad with a small greenCRT screen, and a smear of grime and a spilled drop (small flat discs). Items sit on the table top at y 0.78 or on the bench seats.",
      "box": [[-1.0, 0.08, -0.75], [1.0, 1.0, 0.95]],
      "attaches": "Feet rest on deckTop. The table centre is the mount tableCentre, the bench seats are benchSeatL (x +0.8) and benchSeatR (x -0.8). It clears the back run (z < -1.1) and the right run (x < -1.1).",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "overhead",
      "builds": "Everything hanging above y 1.45 plus wall-mounted fittings. The range hood above the range (x 0.2..1.2, z -1.78..-1.05, centred on hoodBase y 1.65..2.1): a tapered steel box with a dark underside grille, a greasy grime band, an amber glowing lamp strip underneath, and a rectangular duct rising to the ceiling at y 2.55 with clamp bands and rivets. Ceiling: five steelDark I-beams across x at y 2.45..2.55 (z -1.6, -0.8, 0, 0.8, 1.6), rib bars along z, and four recessed flat lamp panels (panelCream frames with an amber/cream glowing face) between the beams. A pipe bundle (pipeBundle, x -0.9, y 2.4) of four parallel tubes (orangePipe, copper, steel, hullGrey) along z -1.8..1.0 with flanges, valve wheels (red, small) and drip stains. A hanging utensil rail at utensilRail (y 1.6, z -1.72, x -0.9..1.7): a steel tube with ladles, spatulas, a whisk and a hanging pan with a cast-iron look (blackRubber) and hook rings. Two wall shelves above the sink (y 1.4 and 1.8, x -0.7..0.1) carrying jars and cans (rust, foodGreen, steel) with stencil labels. A swing-arm CRT monitor on the right wall (monitorArm at x -1.7, y 1.75): an articulated steel arm of three segments and a boxy hullGrey CRT housing with a black bezel, a glowing greenCRT screen with scanline bars and a tiny text-line blocks and a red power LED. A ceiling-mounted yellow rotating warning beacon in the front-left (x 1.5, z 0.2, y 2.35) with a cage. An intercom panel on the back wall at x 1.5, y 1.6 with a speaker grille (small parallel bars) and a cyanLed button. A ventilation grille at x -0.2, y 2.3 on the back wall (slatted steelDark). Its parts stay above y 1.45, except the shelves, rail and arm, which are fixed to wall faces.",
      "box": [[-1.8, 1.45, -1.8], [1.8, 2.6, 1.0]],
      "attaches": "Wall fittings seat on backWallFace (z = -1.8) and rightWallFace (x = -1.8). The hood sits above the back run's range at hoodBase, with its underside at y 1.65, 0.7 m above the counter top. Ceiling beams and the duct reach the ceilingUnder level (y 2.5..2.6). It floats above the floor; nothing touches y = 0.",
      "joints": [],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: messTable -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type MessCtx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

interface Maker {
  box(c: string, w: number, h: number, d: number, x: number, y: number, z: number, ry?: number, g?: number, rx?: number, rz?: number): void;
  cyl(c: string, rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, rx?: number, rz?: number, g?: number, ry?: number): void;
  sph(c: string, r: number, x: number, y: number, z: number, sx?: number, sy?: number, sz?: number, g?: number, ry?: number): void;
  tor(c: string, R: number, r: number, arc: number, x: number, y: number, z: number, rx?: number, ry?: number, rz?: number): void;
  sub(x: number, y: number, z: number, ry?: number): Maker;
}

export function buildMessTable({ b, M, P }: MessCtx) {
  // ---------------------------------------------------------------- palette
  const C = {
    hull: P.hullGrey,
    steel: P.steel,
    steelDark: P.steelDark,
    stainless: P.stainless,
    rubber: P.blackRubber,
    grime: P.grime,
    rust: P.rust,
    yellow: P.hazardYellow,
    black: P.hazardBlack,
    cream: P.panelCream,
    mug: P.mugWhite,
    green: P.foodGreen,
    red: P.foodRed,
    crt: P.greenCRT,
    amber: P.amber,
    led: P.redLed,
    // own colours
    coffee: "#2a190f",
    pitcher: "#8ea8ae",
    worn: "#a89f84",
  };
  const T = M.tableCentre[1]; // table top 0.78
  const F = M.deckTop[1]; // deck top 0.08
  const SEAT = M.benchSeatL[1]; // 0.46
  const BX = M.benchSeatL[0]; // 0.8
  const TZ = M.tableCentre[2]; // 0.1
  const r = rng(1979);

  // ---------------------------------------------------------------- merge buckets (one part per colour/glow)
  const buckets = new Map<string, { color: string; g: number; geos: THREE.BufferGeometry[] }>();
  const mk = (base: THREE.Matrix4): Maker => {
    const add = (color: string, geo: THREE.BufferGeometry, x: number, y: number, z: number, rx: number, ry: number, rz: number, g: number) => {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
        new THREE.Vector3(1, 1, 1),
      );
      geo.applyMatrix4(base.clone().multiply(m));
      const key = g ? `${color}|${g}` : color;
      let bk = buckets.get(key);
      if (!bk) {
        bk = { color, g, geos: [] };
        buckets.set(key, bk);
      }
      bk.geos.push(geo);
    };
    return {
      box: (c, w, h, d, x, y, z, ry = 0, g = 0, rx = 0, rz = 0) => add(c, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz, g),
      cyl: (c, rt, rb, h, seg, x, y, z, rx = 0, rz = 0, g = 0, ry = 0) =>
        add(c, new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz, g),
      sph: (c, rad, x, y, z, sx = 1, sy = 1, sz = 1, g = 0, ry = 0) => {
        const geo = new THREE.SphereGeometry(rad, 8, 5);
        geo.scale(sx, sy, sz);
        add(c, geo, x, y, z, 0, ry, 0, g);
      },
      tor: (c, R, rad, arc, x, y, z, rx = 0, ry = 0, rz = 0) => add(c, new THREE.TorusGeometry(R, rad, 5, 8, arc), x, y, z, rx, ry, rz, 0),
      sub: (x, y, z, ry = 0) =>
        mk(
          base.clone().multiply(
            new THREE.Matrix4().compose(
              new THREE.Vector3(x, y, z),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)),
              new THREE.Vector3(1, 1, 1),
            ),
          ),
        ),
    };
  };
  const W = mk(new THREE.Matrix4());

  // ---------------------------------------------------------------- small reusable helpers
  const SEG: Record<string, string> = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc",
    "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  };
  // seven-segment stencil digit facing local +z; height 2s
  const digit = (w: Maker, color: string, d: string, x: number, y: number, z: number, s: number) => {
    const t = s * 0.22;
    const th = 0.0015;
    const on = SEG[d];
    const h = (yy: number) => w.box(color, s, t, th, x, y + yy, z);
    const v = (xx: number, yy: number) => w.box(color, t, s, th, x + xx, y + yy, z);
    if (on.includes("a")) h(s);
    if (on.includes("b")) v(s / 2, s / 2);
    if (on.includes("c")) v(s / 2, -s / 2);
    if (on.includes("d")) h(-s);
    if (on.includes("e")) v(-s / 2, -s / 2);
    if (on.includes("f")) v(-s / 2, s / 2);
    if (on.includes("g")) h(0);
  };
  const plate = (w: Maker, x: number, y: number, z: number, text: string, s: number) => {
    const wd = text.length * s * 1.6 + 0.03;
    w.box(C.cream, wd, 2 * s + 0.03, 0.003, x, y, z);
    for (let i = 0; i < text.length; i++) {
      digit(w, C.grime, text[i], x + (i - (text.length - 1) / 2) * s * 1.6, y, z + 0.002, s);
    }
    // corner rivets
    for (const sx of [-1, 1]) for (const sy of [-1, 1])
      w.cyl(C.steelDark, 0.003, 0.003, 0.003, 6, x + sx * (wd / 2 - 0.008), y + sy * (s + 0.006), z + 0.002, Math.PI / 2);
  };
  const label = (w: Maker, x: number, y: number, z: number, wd: number, ht: number) => {
    w.box(C.yellow, wd, ht, 0.003, x, y, z);
    w.box(C.black, wd, ht * 0.14, 0.0035, x, y + ht * 0.43, z);
    w.box(C.black, wd, ht * 0.14, 0.0035, x, y - ht * 0.43, z);
    w.box(C.black, wd * 0.09, ht * 0.38, 0.0038, x, y + ht * 0.04, z);
    w.box(C.black, wd * 0.09, wd * 0.09, 0.0038, x, y - ht * 0.22, z);
  };
  const bolt = (w: Maker, c: string, x: number, y: number, z: number, rad = 0.012, h = 0.012) =>
    w.cyl(c, rad, rad, h, 6, x, y, z);

  const hazardStrip = (cz: number, depth: number, halfLen: number) => {
    W.box(C.yellow, halfLen * 2, 0.005, depth, 0, T + 0.0025, cz);
    const a = 0.6;
    const bd = (depth - 0.0124) / Math.cos(a);
    for (let x = -halfLen + 0.04; x < halfLen - 0.02; x += 0.06) W.box(C.black, 0.022, 0.0058, bd, x, T + 0.0029, cz, a);
  };

  // ================================================================= TABLE
  // slab, apron, rim
  W.box(C.hull, 1.1, 0.08, 1.6, 0, 0.74, TZ);
  W.box(C.steelDark, 1.0, 0.03, 1.5, 0, 0.685, TZ);
  for (const s of [1, -1]) {
    W.box(C.steel, 0.024, 0.09, 1.608, s * 0.542, 0.74, TZ);
    W.box(C.steel, 1.108, 0.09, 0.024, 0, 0.74, TZ + s * 0.792);
  }
  // rim rivets
  for (let z = -0.6; z <= 0.81; z += 0.1)
    for (const s of [1, -1]) W.cyl(C.stainless, 0.006, 0.006, 0.004, 6, s * 0.542, 0.787, z);
  for (let x = -0.4; x <= 0.41; x += 0.1)
    for (const s of [1, -1]) W.cyl(C.stainless, 0.006, 0.006, 0.004, 6, x, 0.787, TZ + s * 0.792);
  // corner plates
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    W.box(C.steelDark, 0.07, 0.004, 0.07, sx * 0.51, 0.787, TZ + sz * 0.762);
    W.cyl(C.stainless, 0.007, 0.007, 0.004, 6, sx * 0.51, 0.79, TZ + sz * 0.762);
  }
  // hazard stripes at the two ends
  hazardStrip(-0.64, 0.06, 0.5);
  hazardStrip(0.84, 0.06, 0.5);
  // worn centre strip + scuffs
  W.box(C.steel, 0.3, 0.002, 1.36, 0, T + 0.001, TZ);
  W.box(C.steelDark, 0.002, 0.0012, 1.36, -0.15, T + 0.0016, TZ);
  W.box(C.steelDark, 0.002, 0.0012, 1.36, 0.15, T + 0.0016, TZ);
  for (let i = 0; i < 22; i++) {
    const col = i % 3 === 0 ? C.stainless : i % 3 === 1 ? C.grime : C.steelDark;
    W.box(col, 0.003 + r() * 0.005, 0.0012, 0.05 + r() * 0.12, (r() - 0.5) * 0.28, T + 0.0027 + (i % 3) * 0.0002, -0.55 + r() * 1.3, (r() - 0.5) * 0.7);
  }
  // grime smears and spill
  W.sph(C.grime, 0.09, 0.05, T, -0.05, 1, 0.012, 0.55, 0, 0.4);
  W.sph(C.grime, 0.07, -0.3, T, 0.35, 1.2, 0.012, 0.6, 0, -0.3);
  W.sph(C.grime, 0.06, 0.38, T, -0.1, 1, 0.012, 0.8, 0, 1);
  W.sph(C.coffee, 0.022, -0.1, T, -0.2, 1.1, 0.03, 1);
  W.sph(C.coffee, 0.008, -0.075, T, -0.18, 1, 0.1, 1);
  W.sph(C.coffee, 0.005, -0.13, T, -0.225, 1, 0.1, 1);
  W.sph(C.coffee, 0.005, -0.06, T, -0.215, 1, 0.1, 1);
  // ring stain
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    W.box(C.coffee, 0.016, 0.001, 0.004, 0.085 + Math.cos(a) * 0.043, T + 0.0012, -0.28 + Math.sin(a) * 0.043, -a);
  }
  // rim grime streaks and front stencil plate
  for (let i = 0; i < 9; i++) {
    const s = i % 2 ? 1 : -1;
    const hh = 0.02 + r() * 0.05;
    W.box(C.grime, 0.0012, hh, 0.008 + r() * 0.01, s * 0.5546, 0.783 - hh / 2 - 0.0, -0.6 + r() * 1.5);
  }
  W.box(C.rust, 0.0012, 0.03, 0.01, 0.5546, 0.72, 0.5);
  W.box(C.rust, 0.0012, 0.045, 0.007, -0.5546, 0.72, -0.2);
  plate(W.sub(0, 0, TZ + 0.8 + 0.0065), -0.35, 0.74, 0, "72", 0.014);
  label(W.sub(0, 0, TZ + 0.8 + 0.0065), 0.3, 0.74, 0, 0.09, 0.05);

  // pedestals
  const pedestal = (zc: number, num: string, front: boolean) => {
    W.box(C.steelDark, 0.2, 0.57, 0.2, 0, 0.385, zc);
    W.box(C.steel, 0.42, 0.02, 0.42, 0, 0.09, zc);
    W.box(C.steel, 0.34, 0.02, 0.34, 0, 0.66, zc);
    W.box(C.steel, 0.22, 0.03, 0.22, 0, 0.3, zc);
    W.box(C.stainless, 0.222, 0.004, 0.222, 0, 0.317, zc);
    for (const sx of [1, -1]) for (const sz of [1, -1]) {
      bolt(W, C.stainless, sx * 0.17, 0.107, zc + sz * 0.17, 0.016, 0.014);
      bolt(W, C.stainless, sx * 0.14, 0.675, zc + sz * 0.14, 0.012, 0.008);
    }
    for (const s of [1, -1]) {
      W.box(C.steel, 0.02, 0.12, 0.1, s * 0.11, 0.16, zc);
      W.box(C.steel, 0.1, 0.12, 0.02, 0, 0.16, zc + s * 0.11);
    }
    // front plate with handle
    const fw = W.sub(0, 0, zc + 0.1);
    fw.box(C.hull, 0.13, 0.16, 0.006, 0, 0.47, 0.003);
    for (const sx of [-1, 1]) for (const sy of [-1, 1])
      fw.cyl(C.stainless, 0.006, 0.006, 0.004, 6, sx * 0.052, 0.47 + sy * 0.07, 0.008, Math.PI / 2);
    fw.box(C.rubber, 0.07, 0.014, 0.012, 0, 0.47, 0.01);
    fw.box(C.steelDark, 0.07, 0.003, 0.004, 0, 0.463, 0.016);
    plate(fw, 0, 0.2, 0.004, num, 0.016);
    for (let i = 0; i < 3; i++) fw.box(C.grime, 0.005 + r() * 0.004, 0.12 + r() * 0.1, 0.002, (r() - 0.5) * 0.16, 0.42 - r() * 0.05, 0.002);
    fw.box(C.rust, 0.012, 0.05, 0.002, 0.07, 0.26, 0.002);
    // hazard labels on both sides
    label(W.sub(0.1, 0, zc, Math.PI / 2), 0, 0.49, 0.003, 0.1, 0.06);
    label(W.sub(-0.1, 0, zc, -Math.PI / 2), 0, 0.49, 0.003, 0.1, 0.06);
    for (const s of [1, -1]) {
      const sw = W.sub(s * 0.1, 0, zc, s * Math.PI / 2);
      sw.box(C.grime, 0.006, 0.16, 0.002, -0.05, 0.22, 0.002);
      sw.box(C.rust, 0.01, 0.06, 0.002, 0.04, 0.27, 0.002);
      sw.box(C.grime, 0.05, 0.025, 0.002, 0, 0.115, 0.002);
    }
    if (front) W.box(C.grime, 0.2, 0.02, 0.003, 0, 0.12, zc + 0.1);
  };
  pedestal(-0.35, "03", false);
  pedestal(0.55, "04", true);
  // stretcher between pedestals
  W.box(C.steelDark, 0.1, 0.08, 0.5, 0, 0.2, TZ);
  for (const s of [1, -1]) bolt(W, C.stainless, 0, 0.245, TZ + s * 0.2, 0.012, 0.01);
  W.box(C.rust, 0.02, 0.003, 0.2, 0.03, 0.2405, TZ);
  // rust at flange feet
  W.box(C.rust, 0.04, 0.002, 0.03, 0.14, 0.1005, -0.35 + 0.17, 0.4);
  W.box(C.rust, 0.03, 0.002, 0.04, -0.15, 0.1005, 0.55 - 0.15, 0.2);

  // ================================================================= BENCHES
  for (const s of [1, -1]) {
    const cx = s * BX;
    const zL = 1.4;
    // frame
    W.box(C.steelDark, 0.3, 0.03, zL, cx, SEAT - 0.075, TZ);
    for (const zf of [TZ - 0.55, TZ + 0.55]) {
      for (const lx of [-0.11, 0.11]) {
        W.box(C.steelDark, 0.045, 0.28, 0.045, cx + lx, 0.23, zf);
        W.box(C.steel, 0.1, 0.01, 0.1, cx + lx, 0.085, zf);
        for (const bx of [-0.03, 0.03]) for (const bz of [-0.03, 0.03])
          bolt(W, C.stainless, cx + lx + bx, 0.093, zf + bz, 0.007, 0.006);
        W.box(C.grime, 0.047, 0.04, 0.047, cx + lx, 0.115, zf);
      }
      const ang = Math.atan2(0.2, 0.22);
      const len = Math.hypot(0.22, 0.2);
      W.box(C.steelDark, len, 0.016, 0.014, cx, 0.23, zf + 0.0, 0, 0, 0, ang);
      W.box(C.steelDark, len, 0.016, 0.014, cx, 0.23, zf + 0.0, 0, 0, 0, -ang);
      bolt(W, C.stainless, cx, 0.23, zf + 0.012, 0.01, 0.006);
      W.cyl(C.stainless, 0.01, 0.01, 0.006, 6, cx, 0.23, zf + 0.012, Math.PI / 2);
    }
    W.box(C.steelDark, 0.035, 0.035, 1.1, cx, 0.15, TZ);
    // pad
    W.box(C.cream, 0.26, 0.06, 1.36, cx, SEAT - 0.03, TZ);
    W.box(C.worn, 0.14, 0.002, 0.9, cx, SEAT + 0.0005, TZ);
    for (let k = -2; k <= 2; k++) {
      const z = TZ + k * 0.28;
      W.box(C.grime, 0.26, 0.0015, 0.004, cx, SEAT + 0.0008, z);
      for (const bx of [-0.06, 0.06]) W.cyl(C.rubber, 0.01, 0.01, 0.006, 8, cx + bx, SEAT + 0.001, z);
    }
    // edge strips
    for (const e of [-1, 1]) W.box(C.rubber, 0.02, 0.064, 1.4, cx + e * 0.14, SEAT - 0.03, TZ);
    for (const e of [-1, 1]) W.box(C.rubber, 0.26, 0.064, 0.02, cx, SEAT - 0.03, TZ + e * 0.69);
    for (let z = -0.5; z <= 0.71; z += 0.2)
      for (const e of [-1, 1]) W.cyl(C.stainless, 0.006, 0.006, 0.004, 6, cx + e * 0.14, SEAT + 0.003, z);
    // scuffs and stains
    for (let i = 0; i < 6; i++)
      W.box(i % 2 ? C.grime : C.worn, 0.01 + r() * 0.02, 0.0012, 0.03 + r() * 0.06, cx + (r() - 0.5) * 0.18, SEAT + 0.0016, -0.5 + r() * 1.2, (r() - 0.5));
    // stencil plate on bench end plate + hazard label on side
    plate(W.sub(cx, 0, TZ + 0.7 + 0.001), 0, SEAT - 0.075, 0.0, s > 0 ? "5" : "6", 0.01);
    const side = W.sub(cx + s * 0.1505, 0, TZ, s * Math.PI / 2);
    label(side, 0, SEAT - 0.075, 0, 0.1, 0.026);
    W.box(C.grime, 0.3, 0.004, 0.004, cx, SEAT - 0.095, TZ + 0.7);
  }

  // ================================================================= TABLEWARE
  const utensil = (kind: "fork" | "spoon", x: number, z: number, ry: number, y = T) => {
    const u = W.sub(x, y, z, ry);
    u.box(C.stainless, 0.008, 0.003, 0.09, 0, 0.0015, 0);
    if (kind === "fork") {
      u.box(C.stainless, 0.022, 0.003, 0.025, 0, 0.0015, 0.055);
      for (const tx of [-0.009, 0, 0.009]) u.box(C.stainless, 0.004, 0.003, 0.03, tx, 0.0015, 0.082);
    } else {
      u.sph(C.stainless, 0.014, 0, 0.002, 0.065, 1, 0.25, 1.5);
    }
  };

  const tray = (i: number, cx: number, cz: number, f: number) => {
    const t = W.sub(cx, T, cz);
    t.box(C.steel, 0.34, 0.008, 0.26, 0, 0.004, 0);
    t.box(C.stainless, 0.34, 0.024, 0.012, 0, 0.012, 0.124);
    t.box(C.stainless, 0.34, 0.024, 0.012, 0, 0.012, -0.124);
    t.box(C.stainless, 0.012, 0.024, 0.26, 0.164, 0.012, 0);
    t.box(C.stainless, 0.012, 0.024, 0.26, -0.164, 0.012, 0);
    t.box(C.stainless, 0.008, 0.016, 0.236, f * 0.01, 0.016, 0);
    t.box(C.stainless, 0.15, 0.016, 0.008, f * 0.085, 0.016, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      t.cyl(C.steelDark, 0.004, 0.004, 0.004, 6, sx * 0.164, 0.025, sz * 0.124);
    const a = i % 2 === 0;
    const colA = a ? C.green : C.red;
    const colB = a ? C.red : C.green;
    if (i % 3 === 2) {
      // half-eaten tray: scraps only
      t.sph(colA, 0.025, f * -0.09, 0.01, 0.02, 1.2, 0.4, 1);
      t.sph(colB, 0.012, f * -0.06, 0.012, -0.05, 1, 0.5, 1);
      t.box(colB, 0.03, 0.012, 0.025, f * 0.088, 0.012, 0.062, 0.4);
      t.sph(colA, 0.014, f * 0.09, 0.011, -0.06, 1, 0.5, 1);
    } else {
      t.sph(colA, 0.06, f * -0.085, 0.012, 0, 1, 0.45, 1.1);
      t.sph(colB, 0.018, f * -0.07, 0.034, 0.02, 1, 0.6, 1);
      t.sph(colB, 0.012, f * -0.1, 0.036, -0.03, 1, 0.6, 1);
      t.box(colB, 0.07, 0.02, 0.05, f * 0.088, 0.018, 0.062);
      t.sph(colA, 0.035, f * 0.088, 0.012, -0.062, 1.1, 0.6, 1);
    }
    t.sph(C.grime, 0.03, f * 0.0, 0.008, 0.11, 1.6, 0.05, 0.5);
    utensil(i % 2 ? "spoon" : "fork", cx + f * 0.195, cz, 0.05 * f);
  };
  let ti = 0;
  for (const s of [1, -1]) for (const z of [-0.4, 0.1, 0.6]) tray(ti++, s * 0.3, z, s);

  const mug = (x: number, y: number, z: number, ry: number, bandCol = C.led) => {
    const m = W.sub(x, y, z, ry);
    m.cyl(C.mug, 0.04, 0.036, 0.09, 10, 0, 0.045, 0);
    m.cyl(bandCol, 0.0395, 0.0385, 0.014, 10, 0, 0.03, 0);
    m.cyl(C.coffee, 0.034, 0.034, 0.003, 10, 0, 0.0885, 0);
    m.tor(C.mug, 0.022, 0.0055, Math.PI, 0.038, 0.045, 0, 0, 0, -Math.PI / 2);
    m.sph(C.grime, 0.006, -0.03, 0.058, 0.026, 1, 1.3, 0.4);
  };
  mug(0.085, T, -0.12, 0);
  mug(-0.085, T, 0.28, Math.PI);
  mug(0.0, T, 0.74, -0.6);
  mug(-BX, SEAT, -0.35, Math.PI * 0.9, C.yellow);

  // pitcher
  {
    const p = W.sub(0, T, -0.5);
    p.cyl(C.pitcher, 0.05, 0.056, 0.18, 10, 0, 0.09, 0);
    p.cyl(C.steelDark, 0.057, 0.057, 0.014, 10, 0, 0.03, 0);
    p.cyl(C.steel, 0.052, 0.052, 0.008, 10, 0, 0.182, 0);
    p.box(C.pitcher, 0.03, 0.012, 0.03, 0, 0.178, 0.055, 0, 0, 0.3);
    p.tor(C.pitcher, 0.05, 0.007, Math.PI, 0.052, 0.1, 0, 0, 0, -Math.PI / 2);
    p.box(C.mug, 0.04, 0.03, 0.002, 0, 0.1, 0.054);
    p.box(C.grime, 0.006, 0.07, 0.002, -0.03, 0.1, 0.05, -0.5);
  }
  // salt and pepper
  for (const [x, col] of [[0.045, C.mug], [-0.02, C.rubber]] as [number, string][]) {
    const s = W.sub(x, T, 0.0);
    s.cyl(col, 0.016, 0.017, 0.055, 8, 0, 0.0275, 0);
    s.cyl(C.stainless, 0.017, 0.017, 0.012, 8, 0, 0.061, 0);
    s.cyl(C.steelDark, 0.01, 0.015, 0.007, 8, 0, 0.0705, 0);
  }
  // sauce bottle
  {
    const s = W.sub(-0.08, T, -0.25);
    s.cyl(C.rust, 0.025, 0.026, 0.1, 8, 0, 0.05, 0);
    s.cyl(C.rust, 0.012, 0.024, 0.03, 8, 0, 0.115, 0);
    s.cyl(C.rust, 0.011, 0.012, 0.025, 8, 0, 0.1425, 0);
    s.cyl(C.led, 0.016, 0.016, 0.02, 8, 0, 0.165, 0);
    s.cyl(C.mug, 0.0265, 0.0265, 0.04, 8, 0, 0.05, 0);
    s.box(C.led, 0.02, 0.012, 0.002, 0, 0.052, 0.0265);
    s.box(C.led, 0.004, 0.02, 0.002, 0.012, 0.012, 0.025, 0.3);
  }
  // napkin
  {
    const n = W.sub(0.05, T, 0.56, 0.2);
    n.box(C.mug, 0.07, 0.004, 0.09, 0, 0.002, 0);
    n.box(C.mug, 0.07, 0.004, 0.045, 0, 0.006, 0.0225);
    n.box(C.worn, 0.07, 0.001, 0.002, 0, 0.0085, 0);
    n.sph(C.red, 0.008, 0.015, 0.0075, -0.01, 1, 0.1, 1);
  }
  // half-eaten food tin
  {
    const t = W.sub(-0.07, T, 0.55);
    t.cyl(C.steel, 0.04, 0.04, 0.05, 10, 0, 0.025, 0);
    t.cyl(C.red, 0.0405, 0.0405, 0.026, 10, 0, 0.025, 0);
    t.box(C.mug, 0.03, 0.012, 0.002, 0, 0.025, 0.0408);
    t.cyl(C.steelDark, 0.038, 0.038, 0.004, 10, 0, 0.049, 0);
    t.sph(C.green, 0.028, 0, 0.049, 0.004, 1, 0.45, 1);
    t.sph(C.green, 0.01, 0.015, 0.058, -0.012, 1, 0.6, 1);
    const th = 1.1;
    t.cyl(C.stainless, 0.04, 0.04, 0.002, 10, 0, 0.05 + 0.04 * Math.sin(th), -0.04 + 0.04 * Math.cos(th), -th);
    t.box(C.steelDark, 0.01, 0.002, 0.012, 0, 0.067, 0.01 + 0.0, 0, 0, -th);
  }
  // data-pad
  {
    const d = W.sub(0.02, T, 0.28, 0.3);
    d.box(C.steelDark, 0.11, 0.012, 0.16, 0, 0.006, 0);
    d.box(C.rubber, 0.1, 0.0024, 0.15, 0, 0.0122, 0);
    d.box(C.crt, 0.085, 0.0016, 0.11, 0, 0.0138, -0.006, 0, 1.1);
    for (let i = 0; i < 6; i++)
      d.box(C.rubber, 0.03 + ((i * 37) % 5) * 0.01, 0.0008, 0.006, -0.02 + ((i * 13) % 3) * 0.005, 0.0149, -0.045 + i * 0.016);
    d.box(C.rubber, 0.085, 0.0008, 0.002, 0, 0.0149, 0.044);
    d.box(C.amber, 0.01, 0.002, 0.01, -0.03, 0.0135, 0.067, 0, 1.3);
    d.box(C.led, 0.01, 0.002, 0.01, 0.0, 0.0135, 0.067, 0, 1.3);
    d.box(C.steel, 0.01, 0.002, 0.01, 0.03, 0.0135, 0.067);
    d.box(C.grime, 0.02, 0.0008, 0.012, 0.03, 0.0149, 0.03, 0.5);
    d.box(C.steelDark, 0.006, 0.008, 0.03, 0.062, 0.008, -0.04);
  }
  // dropped spoon on floor, crumpled napkin on bench
  utensil("spoon", 0.6, 0.35, 0.7, F);
  {
    const n = W.sub(BX, SEAT, 0.45, 0.5);
    n.box(C.mug, 0.09, 0.012, 0.07, 0, 0.006, 0);
    n.box(C.mug, 0.06, 0.012, 0.05, 0.01, 0.014, 0.005, 0.7, 0, 0.15);
    n.sph(C.grime, 0.01, 0.03, 0.021, 0.0, 1, 0.2, 1);
  }
  // spilled drip trail down tray side onto bench
  W.sph(C.coffee, 0.012, BX - 0.1, SEAT + 0.0015, 0.1, 1, 0.1, 1.4);

  // ---------------------------------------------------------------- emit merged parts
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) continue;
    const part = b.part(merged, bk.color, { at: [0, 0, 0], flat: true, group: "messTable" });
    if (bk.g) glow(part, bk.g);
  }
}
```

<!-- call: backRun -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildBackRun({ b, J, P, M }: Ctx) {
  void J;
  const R = rng(1979);
  const rr = (a: number, c: number) => a + (c - a) * R();

  // ---------------------------------------------------------------------------------------------
  // Geometry buckets: every small piece is collected per colour (and glow strength), then merged
  // into one part per bucket at the end, so the part count stays tiny and the detail stays rich.
  const buckets = new Map<string, { color: string; strength: number; geos: THREE.BufferGeometry[] }>();
  const push = (g: THREE.BufferGeometry, color: string, strength = 0) => {
    const key = `${color}|${strength}`;
    let k = buckets.get(key);
    if (!k) buckets.set(key, (k = { color, strength, geos: [] }));
    k.geos.push(g);
  };
  type Opt = { rx?: number; ry?: number; rz?: number; glow?: number };
  const place = (g: THREE.BufferGeometry, x: number, y: number, z: number, o: Opt = {}) => {
    if (o.rx) g.rotateX(o.rx);
    if (o.ry) g.rotateY(o.ry);
    if (o.rz) g.rotateZ(o.rz);
    g.translate(x, y, z);
    return g;
  };
  const box = (color: string, x: number, y: number, z: number, w: number, h: number, d: number, o: Opt = {}) =>
    push(place(new THREE.BoxGeometry(w, h, d), x, y, z, o), color, o.glow);
  const bx = (color: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, o: Opt = {}) =>
    box(color, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, o);
  const cyl = (
    color: string, x: number, y: number, z: number, rt: number, rb: number, len: number,
    axis: "x" | "y" | "z" = "y", seg = 10, o: Opt = {},
  ) => {
    const g = new THREE.CylinderGeometry(rt, rb, len, seg);
    if (axis === "z") g.rotateX(Math.PI / 2);
    else if (axis === "x") g.rotateZ(-Math.PI / 2);
    push(place(g, x, y, z, o), color, o.glow);
  };
  const sph = (color: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, seg = 8, o: Opt = {}) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
    g.scale(sx, sy, sz);
    push(place(g, x, y, z, o), color, o.glow);
  };

  // 7-segment digits facing +Z (used for stencils and glowing readouts)
  const SEG: Record<string, string> = {
    "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
    "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  };
  const digits = (str: string, color: string, x0: number, y: number, z: number, w: number, h: number, t: number, gl = 0, gap = w * 0.45) => {
    const s = w * 0.24;
    const o: Opt = { glow: gl };
    [...str].forEach((ch, i) => {
      const cx = x0 + i * (w + gap) + w / 2;
      const segs = SEG[ch] ?? "";
      if (segs.includes("a")) box(color, cx, y + h / 2 - s / 2, z, w, s, t, o);
      if (segs.includes("d")) box(color, cx, y - h / 2 + s / 2, z, w, s, t, o);
      if (segs.includes("g")) box(color, cx, y, z, w, s, t, o);
      if (segs.includes("f")) box(color, cx - w / 2 + s / 2, y + h / 4, z, s, h / 2, t, o);
      if (segs.includes("b")) box(color, cx + w / 2 - s / 2, y + h / 4, z, s, h / 2, t, o);
      if (segs.includes("e")) box(color, cx - w / 2 + s / 2, y - h / 4, z, s, h / 2, t, o);
      if (segs.includes("c")) box(color, cx + w / 2 - s / 2, y - h / 4, z, s, h / 2, t, o);
    });
  };

  const rivetGeo = (x: number, y: number, z: number, len = 0.004) => {
    const g = new THREE.CylinderGeometry(0.006, 0.007, len, 6);
    g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    return g;
  };
  const rv = (color: string, x: number, y: number, z: number) => push(rivetGeo(x, y, z), color);

  // ---------------------------------------------------------------------------------------------
  // Palette and key dimensions
  const STEEL = P.steel, STEELD = P.steelDark, STAIN = P.stainless, BLACK = P.blackRubber;
  const GRIME = P.grime, RUST = P.rust, CREAM = P.panelCream, HULL = P.hullGrey;
  const AMBER = P.amber, GREEN = P.greenCRT, CYAN = P.cyanLed, RED = P.redLed;
  const COPPER = P.copper, YEL = P.hazardYellow, HBLK = P.hazardBlack, MUG = P.mugWhite;
  const Y0 = 0.08, KICK = 0.18, BODY = 0.87, TOP = 0.95;
  const ZB = -1.78, ZF = -1.1, DZ = -1.108; // DZ = front face of the doors
  const sinkX = M.sinkCentre[0];
  const rangeX = M.rangeCentre[0];

  // ---------------------------------------------------------------------------------------------
  // Carcass: kick plate, bodies, trim
  bx(BLACK, -1.1, 1.75, Y0, KICK, -1.7, -1.14); // kick plate, recessed
  bx(STEELD, -1.1, -0.6, KICK, BODY, ZB, -1.115); // prep cabinet
  bx(STEELD, -0.6, 0.2, KICK, 0.69, ZB, -1.115); // under the sink
  bx(STEELD, -0.6, 0.2, 0.69, BODY, ZB, -1.74); // sink cavity back wall
  bx(STEELD, 0.2, 1.2, KICK, BODY, ZB, -1.115); // range body
  bx(STEELD, 1.2, 1.75, KICK, BODY, ZB, -1.115); // right cabinet
  bx(STEELD, -1.1, 1.75, 0.862, 0.872, -1.122, -1.105); // dark trim bar under the top
  for (let x = -1.05; x < 1.75; x += 0.1) rv(STAIN, x, 0.867, -1.1045);
  bx(STEEL, 1.74, 1.752, KICK, BODY, -1.122, -1.108); // end guard strip
  // kick plate scuffs
  for (let i = 0; i < 14; i++) {
    const x = rr(-1.05, 1.7);
    box(R() < 0.7 ? STEELD : RUST, x, rr(0.1, 0.16), -1.139, rr(0.03, 0.1), rr(0.004, 0.012), 0.003, { rz: rr(-0.1, 0.1) });
  }
  for (let i = 0; i < 6; i++) box(GRIME, rr(-1, 1.7), 0.12, -1.139, rr(0.1, 0.25), 0.03, 0.003);

  // Countertop slabs (stainless) with openings for the basins
  bx(STAIN, -1.1, -0.6, BODY, TOP, ZB, ZF);
  bx(STAIN, -0.6, 0.2, BODY, TOP, -1.2, ZF);
  bx(STAIN, -0.6, 0.2, BODY, TOP, ZB, -1.68);
  bx(STAIN, -0.6, -0.54, BODY, TOP, -1.68, -1.2);
  bx(STAIN, -0.22, -0.18, BODY, TOP, -1.68, -1.2);
  bx(STAIN, 0.14, 0.2, BODY, TOP, -1.68, -1.2);
  bx(STAIN, 1.2, 1.75, BODY, TOP, ZB, ZF);
  bx(STEELD, 0.2, 1.2, BODY, TOP, ZB, ZF); // range top plate
  bx(STAIN, 0.2, 1.2, 0.93, TOP, -1.12, ZF); // range front lip
  bx(STAIN, -1.1, 1.75, TOP, 0.985, ZB, -1.745); // raised back lip
  bx(STEEL, -1.1, 1.75, TOP, 0.975, -1.1, -1.097, {}); // thin front nosing line
  for (let x = -1.05; x < 1.75; x += 0.14) rv(STEELD, x, 0.968, -1.7445 + 0.0); // lip rivets

  // Scuffs and smears on the stainless
  const regions: [number, number, number, number][] = [
    [-1.08, -0.62, -1.7, -1.15],
    [-0.58, 0.18, -1.19, -1.12],
    [1.22, 1.73, -1.7, -1.12],
  ];
  for (let i = 0; i < 22; i++) {
    const [xa, xb, za, zb] = regions[i % 3];
    box(i % 3 === 1 || R() < 0.65 ? STEEL : GRIME, rr(xa, xb), 0.951, rr(za, zb), rr(0.04, 0.13), 0.002, rr(0.004, 0.01), { ry: rr(-0.6, 0.6) });
  }
  box(RUST, -0.4, 0.951, -1.15, 0.05, 0.002, 0.03, { ry: 0.3 });
  box(RUST, 0.02, 0.951, -1.17, 0.035, 0.002, 0.025, { ry: -0.4 });
  cyl(GRIME, 1.33, 0.951, -1.25, 0.05, 0.05, 0.002, "y", 8); // spill
  cyl(RUST, 1.33, 0.9515, -1.25, 0.035, 0.035, 0.002, "y", 8);
  // grease splatter on the range top
  for (let i = 0; i < 12; i++) box(BLACK, rr(0.24, 1.16), 0.9505, rr(-1.7, -1.14), rr(0.015, 0.05), 0.002, rr(0.015, 0.04), { ry: rr(0, 3) });

  // ---------------------------------------------------------------------------------------------
  // Doors and drawers
  const handle = (cx: number, cy: number, horizontal: boolean, len: number) => {
    const sw = horizontal ? len + 0.02 : 0.035;
    const sh = horizontal ? 0.035 : len + 0.02;
    box(BLACK, cx, cy, DZ + 0.00175, sw, sh, 0.0035);
    box(STEELD, cx, cy, DZ + 0.0053, horizontal ? len : 0.018, horizontal ? 0.018 : len, 0.0035);
  };
  const stencil = (cx: number, cy: number, text: string) => {
    box(CREAM, cx, cy, DZ + 0.0015, 0.07, 0.042, 0.003);
    const w = 0.013, gap = 0.006;
    const tw = text.length * w + (text.length - 1) * gap;
    digits(text, BLACK, cx - tw / 2, cy, DZ + 0.0045, w, 0.026, 0.003, 0, gap);
  };
  const door = (x0: number, x1: number, y0: number, y1: number, kind: "drawer" | "door", hx = 0) => {
    const a = x0 + 0.006, c = x1 - 0.006, d = y0 + 0.004, e = y1 - 0.004;
    bx(STEEL, a, c, d, e, -1.12, DZ);
    for (const rx of [a + 0.02, c - 0.02]) for (const ry of [d + 0.02, e - 0.02]) rv(STEELD, rx, ry, DZ + 0.0005);
    if (kind === "drawer") handle((a + c) / 2, (d + e) / 2 + 0.01, true, Math.min(0.24, (c - a) * 0.55));
    else handle(hx, e - 0.12, false, 0.12);
    for (let k = 0; k < 2; k++) {
      const sx = rr(a + 0.03, c - 0.03);
      const len = rr(0.05, 0.16);
      bx(GRIME, sx, sx + rr(0.004, 0.009), e - len, e, DZ - 0.0005, DZ + 0.0025);
    }
    if (R() < 0.45) box(RUST, rr(a + 0.04, c - 0.04), d + 0.025, DZ + 0.001, rr(0.03, 0.07), 0.02, 0.003, { rz: rr(-0.3, 0.3) });
  };
  // prep cabinet
  door(-1.1, -0.6, 0.64, 0.86, "drawer");
  door(-1.1, -0.6, 0.2, 0.62, "door", -0.66);
  stencil(-0.85, 0.46, "07");
  // sink cabinet
  door(-0.6, -0.2, 0.2, 0.67, "door", -0.26);
  door(-0.2, 0.2, 0.2, 0.67, "door", -0.14);
  bx(STEEL, -0.594, 0.194, 0.69, 0.86, -1.12, DZ); // fascia plate
  for (const x of [-0.56, 0.16]) for (const y of [0.705, 0.845]) rv(STEELD, x, y, DZ + 0.0005);
  box(YEL, 0.0, 0.775, DZ + 0.0015, 0.1, 0.05, 0.003);
  box(HBLK, 0.0, 0.79, DZ + 0.0035, 0.08, 0.008, 0.003);
  box(HBLK, -0.015, 0.772, DZ + 0.0035, 0.05, 0.006, 0.003);
  box(HBLK, 0.0, 0.757, DZ + 0.0035, 0.07, 0.006, 0.003);
  stencil(-0.4, 0.775, "12");
  bx(GRIME, -0.35, -0.34, 0.69, 0.86, DZ - 0.0005, DZ + 0.0025);
  // right cabinet drawers
  door(1.2, 1.75, 0.2, 0.4, "drawer");
  door(1.2, 1.75, 0.42, 0.62, "drawer");
  door(1.2, 1.75, 0.64, 0.86, "drawer");
  stencil(1.38, 0.52, "31");

  // ---------------------------------------------------------------------------------------------
  // Range: oven door, control panel, riser, burners, cookware
  bx(STEEL, 0.24, 1.16, 0.2, 0.65, -1.12, DZ); // oven door
  bx(STEELD, 0.34, 1.06, 0.26, 0.58, -1.12, DZ + 0.0015); // window surround
  bx(BLACK, 0.36, 1.04, 0.28, 0.56, DZ, DZ + 0.0035); // window glass
  bx(STEELD, 0.36, 1.04, 0.4, 0.405, DZ + 0.0035, DZ + 0.0055); // oven rack lines
  bx(STEELD, 0.36, 1.04, 0.46, 0.465, DZ + 0.0035, DZ + 0.0055);
  bx(AMBER, 0.38, 1.02, 0.285, 0.3, DZ + 0.0035, DZ + 0.0052, { glow: 1.2 }); // oven glow
  box(STEELD, 0.3, 0.6, DZ + 0.018, 0.02, 0.02, 0.036); // handle posts
  box(STEELD, 1.1, 0.6, DZ + 0.018, 0.02, 0.02, 0.036);
  cyl(STAIN, 0.7, 0.6, DZ + 0.038, 0.014, 0.014, 0.84, "x", 8);
  for (const x of [0.28, 1.12]) rv(STEELD, x, 0.23, DZ + 0.0005), rv(STEELD, x, 0.62, DZ + 0.0005);
  // warning label on oven door
  box(YEL, 1.11, 0.235, DZ + 0.0015, 0.07, 0.04, 0.003);
  box(HBLK, 1.11, 0.25, DZ + 0.0035, 0.06, 0.007, 0.003);
  box(HBLK, 1.1, 0.232, DZ + 0.0035, 0.04, 0.005, 0.003);
  box(HBLK, 1.11, 0.22, DZ + 0.0035, 0.055, 0.005, 0.003);
  box(GRIME, 0.9, 0.19 + 0.01, DZ + 0.001, 0.2, 0.012, 0.003);
  for (let k = 0; k < 3; k++) bx(GRIME, 0.3 + k * 0.3, 0.304 + k * 0.3, 0.45, 0.62, DZ - 0.0005, DZ + 0.0025);

  bx(HULL, 0.22, 1.18, 0.675, 0.86, -1.12, DZ); // control panel
  for (let x = 0.25; x < 1.2; x += 0.1) rv(STEELD, x, 0.852, DZ + 0.0005);
  const knobX = [0.34, 0.52, 0.7, 0.88, 1.06];
  const ptr = [-0.9, 0.5, 1.4, 0.0, -0.4];
  knobX.forEach((kx, i) => {
    const ky = 0.765;
    cyl(STEELD, kx, ky, DZ + 0.006, 0.034, 0.034, 0.012, "z", 10);
    cyl(STEEL, kx, ky, DZ + 0.0215, 0.027, 0.03, 0.03, "z", 10);
    const a = ptr[i];
    box(BLACK, kx - Math.sin(a) * 0.013, ky + Math.cos(a) * 0.013, DZ + 0.0375, 0.006, 0.02, 0.003, { rz: a });
    // label strip with tiny stencil marks
    box(CREAM, kx, 0.703, DZ + 0.0015, 0.062, 0.012, 0.003);
    box(BLACK, kx - 0.012, 0.703, DZ + 0.0035, 0.016, 0.004, 0.002);
    box(BLACK, kx + 0.013, 0.703, DZ + 0.0035, 0.01, 0.004, 0.002);
    // indicator dot
    cyl(i < 4 ? AMBER : RED, kx, 0.835, DZ + 0.002, 0.008, 0.008, 0.004, "z", 8, { glow: i < 4 ? 1.4 : 1.5 });
    cyl(STEELD, kx, 0.835, DZ + 0.0005, 0.012, 0.012, 0.002, "z", 8);
  });

  // riser with a clock
  bx(STEELD, 0.22, 1.18, TOP, 1.12, ZB, -1.72);
  bx(BLACK, 0.58, 0.74, 1.0, 1.07, -1.7205, -1.7185);
  digits("1930", AMBER, 0.6, 1.035, -1.7175, 0.015, 0.032, 0.002, 1.3, 0.007);
  cyl(AMBER, 0.665, 1.045, -1.7175, 0.002, 0.002, 0.002, "z", 6, { glow: 1.3 });
  for (const kx of [0.9, 1.0, 1.1]) {
    cyl(STEEL, kx, 1.035, -1.7, 0.016, 0.016, 0.03, "z", 8);
    box(BLACK, kx, 1.044, -1.684, 0.004, 0.012, 0.003);
  }
  for (let x = 0.26; x < 1.18; x += 0.08) rv(STEEL, x, 1.1, -1.7185);

  // burners + grates
  const burners: [number, number][] = [[0.45, -1.31], [0.95, -1.31], [0.45, -1.57], [0.95, -1.57]];
  for (const [bxx, bzz] of burners) {
    cyl(BLACK, bxx, 0.954, bzz, 0.085, 0.09, 0.008, "y", 12);
    cyl(STEELD, bxx, 0.962, bzz, 0.045, 0.05, 0.016, "y", 10);
    cyl(BLACK, bxx, 0.97, bzz, 0.02, 0.025, 0.006, "y", 8);
    // grate: two crossing bars and four feet
    bx(STEELD, bxx - 0.095, bxx + 0.095, 0.968, 0.98, bzz - 0.005, bzz + 0.005);
    bx(STEELD, bxx - 0.005, bxx + 0.005, 0.968, 0.98, bzz - 0.095, bzz + 0.095);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(STEELD, bxx + sx * 0.09 - 0.007, bxx + sx * 0.09 + 0.007, TOP, 0.98, bzz + sz * 0.09 - 0.007, bzz + sz * 0.09 + 0.007);
  }
  // pot with lid (back left burner)
  const [px, pz] = burners[2];
  cyl(STAIN, px, 1.04, pz, 0.105, 0.098, 0.12, "y", 10);
  cyl(STEEL, px, 1.1, pz, 0.108, 0.108, 0.012, "y", 10);
  cyl(STEELD, px, 1.114, pz, 0.1, 0.108, 0.016, "y", 10);
  cyl(BLACK, px, 1.14, pz, 0.014, 0.018, 0.035, "y", 8);
  box(BLACK, px - 0.122, 1.075, pz, 0.035, 0.014, 0.03);
  box(BLACK, px + 0.122, 1.075, pz, 0.035, 0.014, 0.03);
  cyl(GRIME, px, 1.0, pz, 0.1, 0.1, 0.02, "y", 10);
  // kettle (front right burner)
  const [kxx, kzz] = burners[1];
  cyl(STEEL, kxx, 1.045, kzz, 0.06, 0.088, 0.13, "y", 10);
  cyl(STEELD, kxx, 1.115, kzz, 0.05, 0.062, 0.012, "y", 10);
  cyl(BLACK, kxx, 1.133, kzz, 0.012, 0.012, 0.025, "y", 8);
  box(STEEL, kxx + 0.095, 1.085, kzz, 0.07, 0.022, 0.026, { rz: 0.7 });
  box(STEELD, kxx + 0.125, 1.11, kzz, 0.03, 0.016, 0.022, { rz: 0.7 });
  box(BLACK, kxx - 0.088, 1.03, kzz, 0.012, 0.06, 0.018, { rz: -0.35 });
  box(BLACK, kxx - 0.092, 1.1, kzz, 0.012, 0.05, 0.018, { rz: 0.45 });
  box(BLACK, kxx - 0.06, 1.138, kzz, 0.07, 0.012, 0.018, { rz: 0.05 });
  cyl(RUST, kxx, 0.99, kzz, 0.07, 0.085, 0.02, "y", 10);
  // steam wisps from the spout
  sph(MUG, kxx + 0.15, 1.15, kzz, 0.022, 0.014, 0.022, 6);
  sph(MUG, kxx + 0.165, 1.19, kzz, 0.026, 0.015, 0.026, 6);
  sph(MUG, kxx + 0.158, 1.235, kzz, 0.03, 0.016, 0.03, 6);
  sph(MUG, kxx + 0.17, 1.285, kzz, 0.032, 0.015, 0.032, 6);

  // ---------------------------------------------------------------------------------------------
  // Sink: basins, grilles, swan-neck faucet, dish rack
  const basins: [number, number][] = [[-0.54, -0.22], [-0.18, 0.14]];
  for (const [bx0, bx1] of basins) {
    bx(STEELD, bx0, bx1, 0.73, 0.745, -1.68, -1.2); // floor
    bx(STAIN, bx0, bx0 + 0.008, 0.745, 0.88, -1.68, -1.2);
    bx(STAIN, bx1 - 0.008, bx1, 0.745, 0.88, -1.68, -1.2);
    bx(STAIN, bx0, bx1, 0.745, 0.88, -1.68, -1.672);
    bx(STAIN, bx0, bx1, 0.745, 0.88, -1.208, -1.2);
    const cx = (bx0 + bx1) / 2;
    cyl(BLACK, cx, 0.748, -1.44, 0.032, 0.032, 0.008, "y", 8);
    for (let k = -1; k <= 1; k++) bx(STAIN, cx - 0.022, cx + 0.022, 0.752, 0.756, -1.44 + k * 0.016 - 0.002, -1.44 + k * 0.016 + 0.002);
    bx(BLACK, cx - 0.01, cx + 0.01, 0.78, 0.82, -1.205, -1.2); // overflow slot
    bx(GRIME, bx0 + 0.04, bx0 + 0.05, 0.75, 0.87, -1.676, -1.672);
  }
  box(P.foodGreen, -0.4, 0.76, -1.35, 0.07, 0.025, 0.045, { ry: 0.4 }); // sponge
  box(RUST, -0.3, 0.748, -1.55, 0.05, 0.003, 0.03, { ry: 0.6 });
  // faucet
  bx(STEELD, sinkX - 0.1, sinkX + 0.1, TOP, 0.97, -1.755, -1.7);
  cyl(STEEL, sinkX, 0.965, -1.727, 0.03, 0.034, 0.03, "y", 8);
  cyl(COPPER, sinkX, 1.1, -1.727, 0.015, 0.016, 0.26, "y", 8);
  sph(COPPER, sinkX, 1.23, -1.727, 0.02, 0.02, 0.02, 8);
  cyl(COPPER, sinkX, 1.23, -1.6235, 0.014, 0.014, 0.207, "z", 8);
  sph(COPPER, sinkX, 1.23, -1.52, 0.02, 0.02, 0.02, 8);
  cyl(STEEL, sinkX, 1.195, -1.52, 0.014, 0.016, 0.06, "y", 8);
  cyl(STAIN, sinkX, 1.162, -1.52, 0.02, 0.018, 0.02, "y", 8);
  for (const s of [-1, 1]) {
    const hx = sinkX + s * 0.075;
    cyl(STEEL, hx, 0.99, -1.727, 0.009, 0.01, 0.045, "y", 8);
    box(STEEL, hx + s * 0.02, 1.015, -1.727, 0.055, 0.01, 0.014, { ry: s * 0.25 });
    box(s > 0 ? RED : CYAN, hx + s * 0.042, 1.015, -1.727 - s * 0.006 * 0, 0.014, 0.014, 0.018, { ry: s * 0.25 });
  }
  // dish rack over the right basin
  const rc = -0.02;
  bx(STAIN, -0.2, -0.18, TOP, 0.967, -1.68, -1.24);
  bx(STAIN, 0.14, 0.16, TOP, 0.967, -1.68, -1.24);
  for (let k = 0; k < 6; k++) {
    const z = -1.66 + k * 0.08;
    bx(STEEL, -0.2, 0.16, 0.96, 0.967, z - 0.004, z + 0.004);
  }
  [-1.64, -1.56, -1.48, -1.4, -1.32].forEach((z) => bx(STAIN, rc - 0.09, rc + 0.09, 0.967, 1.005, z - 0.003, z + 0.003));
  [-1.6, -1.52, -1.44, -1.36].forEach((z, i) => {
    cyl(MUG, rc + (i % 2 ? 0.01 : -0.01), 1.052, z, 0.07, 0.07, 0.008, "z", 10, { ry: rr(-0.1, 0.1) });
    cyl(CREAM, rc + (i % 2 ? 0.01 : -0.01), 1.052, z + 0.004, 0.048, 0.048, 0.004, "z", 10, { ry: rr(-0.1, 0.1) });
  });
  bx(STAIN, rc - 0.095, rc - 0.09, 0.967, 1.04, -1.65, -1.644);
  bx(STAIN, rc + 0.09, rc + 0.095, 0.967, 1.04, -1.31, -1.304);

  // ---------------------------------------------------------------------------------------------
  // Prep counter: cutting board, knife block, utensil pot
  box(CREAM, -0.83, 0.958, -1.4, 0.3, 0.016, 0.22, { ry: 0.12 });
  box(GRIME, -0.86, 0.967, -1.42, 0.08, 0.002, 0.05, { ry: 0.3 });
  box(STEELD, -0.78, 0.967, -1.36, 0.1, 0.002, 0.004, { ry: 0.5 });
  box(RUST, -0.9, 0.967, -1.35, 0.03, 0.002, 0.03, { ry: 0.5 });
  box(HULL, -1.0, 1.03, -1.65, 0.1, 0.16, 0.08);
  box(STEELD, -1.0, 1.112, -1.65, 0.104, 0.008, 0.084);
  [-0.03, -0.01, 0.01, 0.03].forEach((dx, i) => {
    box(BLACK, -1.0 + dx, 1.14 + (i % 2) * 0.012, -1.65, 0.013, 0.05, 0.018);
    bx(STEEL, -1.0 + dx - 0.004, -1.0 + dx + 0.004, 1.114, 1.121, -1.658, -1.642);
  });
  bx(GRIME, -1.045, -1.04, TOP, 1.1, -1.611, -1.609);
  cyl(COPPER, -0.7, 1.01, -1.67, 0.046, 0.04, 0.12, "y", 8);
  cyl(STAIN, -0.7, 1.073, -1.67, 0.049, 0.049, 0.008, "y", 8);
  cyl(GRIME, -0.7, 0.96, -1.67, 0.046, 0.046, 0.02, "y", 8);
  const utens: [number, number, string, number, number][] = [
    [-0.015, -0.01, STEEL, 0.18, 0.12], [0.012, 0.0, COPPER, 0.2, -0.1],
    [0.0, 0.018, BLACK, 0.17, 0.05], [-0.022, 0.014, STAIN, 0.16, -0.18], [0.022, -0.016, RUST, 0.15, 0.2],
  ];
  utens.forEach(([dx, dz, c, len, tilt]) => {
    box(c, -0.7 + dx + Math.sin(tilt) * len * 0.5, 1.07 + len * 0.45, -1.67 + dz, 0.008, len, 0.008, { rz: -tilt });
    box(c, -0.7 + dx + Math.sin(tilt) * len * 0.98, 1.07 + len * 0.9, -1.67 + dz, 0.03, 0.04, 0.008, { rz: -tilt });
  });

  // ---------------------------------------------------------------------------------------------
  // Right of the range: coffee machine, microwave, food trays
  // coffee machine
  bx(STEEL, 1.24, 1.46, TOP, 0.975, -1.74, -1.4); // drip tray
  for (let z = -1.7; z < -1.42; z += 0.03) bx(BLACK, 1.255, 1.445, 0.975, 0.98, z, z + 0.014);
  bx(HULL, 1.23, 1.47, 0.975, 1.32, -1.75, -1.6); // back column
  bx(HULL, 1.23, 1.47, 1.2, 1.32, -1.75, -1.46); // head
  bx(STEELD, 1.23, 1.47, 1.195, 1.2, -1.75, -1.46);
  bx(STEELD, 1.33, 1.37, 1.17, 1.195, -1.56, -1.5); // brew nozzle
  bx(BLACK, 1.26, 1.44, 1.225, 1.295, -1.4605, -1.4585); // display plate
  digits("072", CYAN, 1.282, 1.26, -1.4575, 0.02, 0.04, 0.002, 1.3, 0.008);
  cyl(RED, 1.43, 1.282, -1.457, 0.006, 0.006, 0.003, "z", 8, { glow: 1.5 });
  for (let k = 0; k < 3; k++) box(STAIN, 1.27 + k * 0.04, 1.21, -1.4585, 0.025, 0.01, 0.004);
  box(GRIME, 1.3, 1.2, -1.4595, 0.15, 0.006, 0.002);
  for (const x of [1.25, 1.45]) rv(STEELD, x, 1.31, -1.4595);
  box(GRIME, 1.255, 1.1, -1.598, 0.006, 0.12, 0.003);
  // carafe
  cyl(GRIME, 1.35, 1.035, -1.52, 0.044, 0.048, 0.12, "y", 8);
  cyl(STAIN, 1.35, 1.097, -1.52, 0.05, 0.05, 0.008, "y", 8);
  cyl(BLACK, 1.35, 1.108, -1.52, 0.048, 0.044, 0.014, "y", 8);
  box(BLACK, 1.405, 1.05, -1.52, 0.008, 0.07, 0.012);
  box(BLACK, 1.396, 1.082, -1.52, 0.018, 0.008, 0.012);
  box(BLACK, 1.396, 1.02, -1.52, 0.018, 0.008, 0.012);
  cyl(STEEL, 1.35, 1.0, -1.52, 0.047, 0.047, 0.02, "y", 8);

  // microwave
  for (const fx of [1.52, 1.72]) for (const fz of [-1.74, -1.48]) box(BLACK, fx, 0.957, fz, 0.025, 0.014, 0.025);
  bx(CREAM, 1.5, 1.74, 0.964, 1.18, -1.76, -1.46);
  bx(STEELD, 1.5, 1.74, 1.18, 1.185, -1.76, -1.46);
  bx(STEELD, 1.51, 1.64, 0.975, 1.17, -1.4605, -1.4595); // door frame
  bx(BLACK, 1.52, 1.63, 0.995, 1.15, -1.4605, -1.4575); // window
  bx(STEELD, 1.52, 1.63, 1.07, 1.073, -1.4575, -1.456); // glass reflection bars / mesh lines
  bx(STEELD, 1.52, 1.63, 1.03, 1.033, -1.4575, -1.456);
  bx(STEELD, 1.641, 1.649, 1.0, 1.14, -1.4605, -1.45); // handle
  bx(STEELD, 1.641, 1.649, 1.0, 1.005, -1.46, -1.45);
  bx(BLACK, 1.656, 1.724, 1.1, 1.16, -1.4605, -1.4585);
  digits("130", GREEN, 1.664, 1.13, -1.4578, 0.014, 0.034, 0.002, 1.3, 0.006);
  cyl(GREEN, 1.7185, 1.1, -1.4578, 0.002, 0.002, 0.002, "z", 6, { glow: 1.3 });
  for (let k = 0; k < 3; k++) box(STEELD, 1.667 + k * 0.022, 1.065, -1.4575, 0.016, 0.014, 0.004);
  box(RED, 1.69, 1.03, -1.4575, 0.05, 0.016, 0.004);
  box(YEL, 1.69, 0.99, -1.4585, 0.05, 0.03, 0.002);
  box(HBLK, 1.69, 0.998, -1.4575, 0.04, 0.005, 0.002);
  box(HBLK, 1.69, 0.984, -1.4575, 0.03, 0.005, 0.002);
  box(GRIME, 1.52, 0.97, -1.4575, 0.08, 0.008, 0.002);

  // stack of food trays
  for (let i = 0; i < 4; i++) {
    const top = i === 3;
    const y0 = TOP + i * 0.016;
    box(i % 2 ? STAIN : STEEL, 1.62 + (top ? 0 : rr(-0.006, 0.006)), y0 + 0.007, -1.27 + (top ? 0 : rr(-0.006, 0.006)), 0.22, 0.014, 0.26, { ry: top ? 0 : rr(-0.05, 0.05) });
  }
  const ty = TOP + 3 * 0.016 + 0.014;
  bx(STEELD, 1.51, 1.73, ty, ty + 0.01, -1.4, -1.392);
  bx(STEELD, 1.51, 1.73, ty, ty + 0.01, -1.148, -1.14);
  bx(STEELD, 1.51, 1.518, ty, ty + 0.01, -1.4, -1.14);
  bx(STEELD, 1.722, 1.73, ty, ty + 0.01, -1.4, -1.14);
  bx(STEELD, 1.51, 1.73, ty, ty + 0.008, -1.27, -1.264);
  bx(STEELD, 1.62, 1.626, ty, ty + 0.008, -1.4, -1.27);
  box(GRIME, 1.57, ty + 0.001, -1.2, 0.03, 0.002, 0.03, { ry: 0.5 });

  // ---------------------------------------------------------------------------------------------
  // Flush buckets into parts
  let n = 0;
  for (const k of buckets.values()) {
    const merged = mergeGeometries(k.geos, false);
    if (!merged) continue;
    const part = b.part(merged, k.color, { at: [0, 0, 0], flat: true, name: `backRun_${n++}` });
    if (k.strength > 0) glow(part, k.strength);
  }
}
```

<!-- call: rightRun -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRightRun({ b, J, P, M }: Ctx) {
  void J;
  const C = P as unknown as Record<string, string>;
  const MM = M as unknown as Record<string, number[]>;
  const R = rng(7);
  const D = Math.PI / 180;

  // ---- palette shorthands (palette colours plus two of my own) ----
  const SD = C.steelDark, ST = C.steel, SS = C.stainless, BR = C.blackRubber, GR = C.grime, RU = C.rust;
  const HY = C.hazardYellow, HB = C.hazardBlack, PC = C.panelCream, HG = C.hullGrey, MW = C.mugWhite;
  const FG = C.foodGreen, FRD = C.foodRed, AM = C.amber, GC = C.greenCRT, CY = C.cyanLed, RL = C.redLed;
  const OP = C.orangePipe;
  const FROST = "#9fd3e6";
  const BREAD = "#b98a4e";

  const Y0 = MM.deckTop[1] - 0.002; // sink a hair into the deck
  const FX = -1.1; // front plane of base units (faces +x)
  const FZ = -1.1; // front plane of the fridge (faces +z)

  type Face = "x" | "z";
  type Rot = [number, number, number];

  // ---- batched small details: one merged part per colour (and glow strength) ----
  const batches = new Map<string, { color: string; g: number; geos: THREE.BufferGeometry[] }>();
  const put = (geo: THREE.BufferGeometry, x: number, y: number, z: number, color: string, g = 0, rot?: Rot) => {
    if (rot) {
      geo.rotateX(rot[0] * D);
      geo.rotateY(rot[1] * D);
      geo.rotateZ(rot[2] * D);
    }
    geo.translate(x, y, z);
    const key = color + "|" + g;
    let e = batches.get(key);
    if (!e) {
      e = { color, g, geos: [] };
      batches.set(key, e);
    }
    e.geos.push(geo);
  };
  const mbox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, g = 0) =>
    put(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, color, g);
  const mboxr = (cx: number, cy: number, cz: number, w: number, h: number, d: number, rot: Rot, color: string, g = 0) =>
    put(new THREE.BoxGeometry(w, h, d), cx, cy, cz, color, g, rot);
  const mcyl = (
    x: number, y: number, z: number, r: number, len: number, axis: "x" | "y" | "z",
    color: string, seg = 8, g = 0, r2 = r,
  ) => {
    const geo = new THREE.CylinderGeometry(r, r2, len, seg);
    if (axis === "x") geo.rotateZ(Math.PI / 2);
    if (axis === "z") geo.rotateX(Math.PI / 2);
    put(geo, x, y, z, color, g);
  };
  const flush = () => {
    for (const e of batches.values()) {
      const merged = mergeGeometries(e.geos, false);
      if (!merged) continue;
      const p = b.part(merged, e.color, { at: [0, 0, 0], flat: true, name: `rightRun_detail_${e.color.slice(1)}_${e.g}` });
      if (e.g > 0) glow(p, e.g);
    }
  };

  // ---- big individual parts ----
  const bx = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string, name: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      flat: true,
      name: `rightRun_${name}`,
    });

  // ---- face-relative helpers. f = which way the face looks; s = plane coordinate; u = coordinate along the face ----
  const fbox = (
    f: Face, s: number, d0: number, d1: number, u0: number, u1: number, y0: number, y1: number, color: string, g = 0,
  ) => (f === "x" ? mbox(s + d0, s + d1, y0, y1, u0, u1, color, g) : mbox(u0, u1, y0, y1, s + d0, s + d1, color, g));

  const rivet = (f: Face, s: number, u: number, y: number, color = SD) =>
    f === "x" ? mcyl(s + 0.004, y, u, 0.007, 0.008, "x", color, 6) : mcyl(u, y, s + 0.004, 0.007, 0.008, "z", color, 6);
  const corners = (f: Face, s: number, u0: number, u1: number, y0: number, y1: number, ins: number, color = SD) => {
    for (const u of [u0 + ins, u1 - ins]) for (const y of [y0 + ins, y1 - ins]) rivet(f, s, u, y, color);
  };
  const streak = (f: Face, s: number, u: number, yTop: number, len: number, w: number, color = GR) =>
    fbox(f, s, 0, 0.003, u - w / 2, u + w / 2, yTop - len, yTop, color);

  // seven-segment stencil digits (screen-left to screen-right, handled per face)
  const SEG: Record<string, string> = {
    "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg",
    "5": "acdfg", "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g",
  };
  const digit = (
    f: Face, s: number, u: number, y: number, w: number, h: number, t: number,
    d0: number, d1: number, ch: string, color: string, g = 0,
  ) => {
    const hw = w / 2, hh = h / 2;
    const r: Record<string, [number, number, number, number]> = {
      a: [-hw, hw, hh - t, hh], g: [-hw, hw, -t / 2, t / 2], d: [-hw, hw, -hh, -hh + t],
      f: [-hw, -hw + t, 0, hh], b: [hw - t, hw, 0, hh], e: [-hw, -hw + t, -hh, 0], c: [hw - t, hw, -hh, 0],
    };
    for (const k of SEG[ch]) {
      const [a0, a1, v0, v1] = r[k];
      const [p0, p1] = f === "x" ? [u - a1, u - a0] : [u + a0, u + a1];
      fbox(f, s, d0, d1, p0, p1, y + v0, y + v1, color, g);
    }
  };

  const tri = (f: Face, s: number, d: number, u: number, y: number, r: number, color: string) => {
    const geo = new THREE.CylinderGeometry(r, r, 0.006, 3);
    geo.rotateX(-Math.PI / 2);
    if (f === "x") geo.rotateY(Math.PI / 2);
    put(geo, f === "x" ? s + d : u, y, f === "x" ? u : s + d, color);
  };

  // hazard / warning label: yellow plate, black triangle with "!", text bars
  const warn = (f: Face, s: number, u: number, y: number, w: number, h: number) => {
    const span = (a: number, c: number): [number, number] => (f === "x" ? [u - c, u - a] : [u + a, u + c]);
    let [p0, p1] = span(-w / 2, w / 2);
    fbox(f, s, 0, 0.005, p0, p1, y - h / 2, y + h / 2, HY);
    fbox(f, s, 0.005, 0.007, p0, p1, y - h / 2, y - h / 2 + 0.008, HB);
    fbox(f, s, 0.005, 0.007, p0, p1, y + h / 2 - 0.008, y + h / 2, HB);
    const tu = f === "x" ? u + w * 0.25 : u - w * 0.25;
    tri(f, s, 0.0055, tu, y, h * 0.38, HB);
    [p0, p1] = span(-w * 0.25 - 0.004, -w * 0.25 + 0.004);
    fbox(f, s, 0.0085, 0.0095, p0, p1, y - h * 0.04, y + h * 0.2, HY);
    fbox(f, s, 0.0085, 0.0095, p0, p1, y - h * 0.14, y - h * 0.08, HY);
    for (let k = 0; k < 3; k++) {
      [p0, p1] = span(w * 0.0, w * (0.42 - 0.08 * k));
      fbox(f, s, 0.005, 0.007, p0, p1, y + h * 0.2 - k * h * 0.22, y + h * 0.2 - k * h * 0.22 + h * 0.08, HB);
    }
  };

  // =====================================================================================================
  // TALL FRIDGE (back-right corner, front faces +z)
  // =====================================================================================================
  bx(-1.8, -1.11, 0.18, 2.06, -1.8, -1.16, PC, "fridgeBody");
  bx(-1.74, -1.13, Y0, 0.18, -1.74, -1.18, BR, "fridgePlinth");
  bx(-1.8, -1.1, 2.06, 2.1, -1.8, -1.1, HG, "fridgeCap");
  bx(-1.76, -1.13, 0.2, 1.42, -1.16, FZ, PC, "fridgeDoorLow");
  bx(-1.76, -1.13, 1.46, 2.04, -1.16, FZ, HG, "fridgeDoorHigh");
  mbox(-1.8, -1.11, 1.42, 1.46, -1.17, FZ + 0.004, BR); // seal strip between doors
  // vertical seals on the latch edge of each door
  fbox("z", FZ, 0, 0.004, -1.135, -1.13, 0.2, 1.42, BR);
  fbox("z", FZ, 0, 0.004, -1.135, -1.13, 1.46, 2.04, BR);
  // lower door two-tone: hullGrey kick band
  fbox("z", FZ, 0, 0.003, -1.76, -1.13, 0.2, 0.4, HG);
  // hazard band on plinth front
  fbox("z", -1.18, 0, 0.004, -1.73, -1.14, 0.095, 0.17, HY);
  for (let k = 0; k < 12; k++) put(new THREE.BoxGeometry(0.02, 0.075, 0.004), -1.72 + k * 0.05, 0.1325, -1.175, HB, 0, [0, 0, 35]);

  // heavy vertical handles
  const handleV = (xc: number, y0: number, y1: number) => {
    mbox(xc - 0.012, xc + 0.012, y0, y0 + 0.04, FZ, FZ + 0.03, SD);
    mbox(xc - 0.012, xc + 0.012, y1 - 0.04, y1, FZ, FZ + 0.03, SD);
    mbox(xc - 0.02, xc + 0.02, y0, y1, FZ + 0.025, FZ + 0.05, SS);
    mbox(xc - 0.02, xc - 0.0185, y0 + 0.01, y1 - 0.01, FZ + 0.0505, FZ + 0.052, SD); // grip groove
  };
  handleV(-1.2, 0.55, 1.22);
  handleV(-1.2, 1.56, 1.9);

  // latch with lever
  fbox("z", FZ, 0, 0.008, -1.25, -1.15, 1.27, 1.39, SS);
  mcyl(-1.2, 1.33, FZ + 0.012, 0.018, 0.016, "z", SD, 8);
  mboxr(-1.205, 1.335, FZ + 0.024, 0.018, 0.1, 0.014, [0, 0, -30], SS);
  mboxr(-1.19, 1.37, FZ + 0.024, 0.02, 0.02, 0.016, [0, 0, -30], BR);
  corners("z", FZ, -1.25, -1.15, 1.27, 1.39, 0.012, SD);

  // hinge cylinders and leaves
  for (const y of [1.75, 1.0, 0.4]) {
    mcyl(-1.745, y, FZ - 0.004, 0.016, 0.13, "y", SD, 8);
    fbox("z", FZ, 0, 0.004, -1.76, -1.7, y - 0.06, y + 0.06, SD);
  }

  // freezer temperature display: bezel, -18 digits, red LED
  fbox("z", FZ, 0, 0.008, -1.64, -1.4, 1.86, 1.98, BR);
  digit("z", FZ, -1.595, 1.92, 0.036, 0.075, 0.008, 0.008, 0.0125, "-", CY, 1.5);
  digit("z", FZ, -1.545, 1.92, 0.036, 0.075, 0.008, 0.008, 0.0125, "1", CY, 1.5);
  digit("z", FZ, -1.495, 1.92, 0.036, 0.075, 0.008, 0.008, 0.0125, "8", CY, 1.5);
  fbox("z", FZ, 0.008, 0.0125, -1.452, -1.442, 1.955, 1.965, CY, 1.5); // degree dot
  fbox("z", FZ, 0, 0.007, -1.355, -1.335, 1.91, 1.93, RL, 1.6);
  fbox("z", FZ, 0, 0.004, -1.64, -1.52, 1.835, 1.848, MW);
  fbox("z", FZ, 0.004, 0.006, -1.63, -1.56, 1.838, 1.845, BR);
  corners("z", FZ, -1.76, -1.13, 1.46, 2.04, 0.025);
  corners("z", FZ, -1.76, -1.13, 0.2, 1.42, 0.025);
  for (const x of [-1.445]) {
    rivet("z", FZ, x, 0.225);
    rivet("z", FZ, x, 1.395);
    rivet("z", FZ, x, 1.485);
    rivet("z", FZ, x, 2.015);
  }

  // hazard label, stencil plate, frost vent
  warn("z", FZ, -1.52, 0.64, 0.19, 0.11);
  fbox("z", FZ, 0, 0.005, -1.58, -1.46, 0.82, 0.88, SD);
  digit("z", FZ, -1.54, 0.85, 0.03, 0.04, 0.006, 0.005, 0.008, "0", PC);
  digit("z", FZ, -1.5, 0.85, 0.03, 0.04, 0.006, 0.005, 0.008, "7", PC);
  fbox("z", FZ, 0, 0.006, -1.62, -1.28, 0.24, 0.35, SD);
  for (let i = 0; i < 5; i++) fbox("z", FZ, 0.006, 0.01, -1.61, -1.29, 0.252 + i * 0.018, 0.26 + i * 0.018, FROST);

  // wear: scuffs, grime, rust
  fbox("z", FZ, 0, 0.003, -1.76, -1.13, 0.2, 0.225, GR);
  for (const [x, top] of [[-1.7, 1.38], [-1.4, 1.1], [-1.28, 0.95], [-1.62, 0.55]] as const)
    streak("z", FZ, x, top, 0.18 + R() * 0.3, 0.012 + R() * 0.01);
  fbox("z", FZ, 0, 0.003, -1.75, -1.69, 0.42, 0.5, RU);
  fbox("z", FZ, 0, 0.003, -1.35, -1.3, 1.5, 1.56, GR);
  streak("z", FZ, -1.58, 1.84, 0.2, 0.01);
  streak("z", FZ, -1.4, 1.46, 0.07, 0.014, RU);

  // fridge side face (x = -1.11), seen above the back run's counter
  const SX = -1.11;
  fbox("x", SX, 0, 0.006, -1.62, -1.3, 1.55, 1.72, SD);
  digit("x", SX, -1.5, 1.635, 0.04, 0.1, 0.008, 0.006, 0.009, "1", PC);
  digit("x", SX, -1.42, 1.635, 0.04, 0.1, 0.008, 0.006, 0.009, "4", PC);
  fbox("x", SX, 0, 0.006, -1.72, -1.36, 1.86, 2.0, SD);
  for (let i = 0; i < 4; i++) fbox("x", SX, 0.006, 0.01, -1.7, -1.38, 1.875 + i * 0.03, 1.885 + i * 0.03, HG);
  warn("x", SX, -1.45, 1.25, 0.2, 0.1);
  fbox("x", SX, 0, 0.003, -1.74, -1.66, 1.2, 1.4, RU);
  streak("x", SX, -1.55, 1.86, 0.25, 0.014);
  streak("x", SX, -1.7, 1.86, 0.16, 0.01);
  corners("x", SX, -1.78, -1.16, 0.95, 2.06, 0.03);

  // =====================================================================================================
  // BASE UNITS (z -1.1..1.0), counter top at y 0.95
  // =====================================================================================================
  bx(-1.8, -1.14, 0.18, 0.91, -1.1, 1.0, SD, "baseBody");
  bx(-1.8, -1.16, Y0, 0.18, -1.1, 1.0, BR, "kickPlate");
  bx(-1.8, -1.07, 0.91, 0.95, -1.1, 1.0, SS, "counterTop");
  bx(-1.08, -1.07, 0.95, 0.975, -1.1, 1.0, SS, "counterLip");
  bx(-1.8, -1.76, 0.95, 1.05, -1.1, 1.0, ST, "backsplash");
  // kick plate scuffs
  for (let i = 0; i < 7; i++) {
    const z0 = -1.0 + i * 0.3 + R() * 0.1;
    fbox("x", -1.16, 0, 0.003, z0, z0 + 0.08 + R() * 0.12, Y0 + 0.01, Y0 + 0.01 + 0.015 + R() * 0.02, GR);
  }
  fbox("x", -1.16, 0, 0.003, 0.2, 0.7, Y0 + 0.07, Y0 + 0.078, SD);
  // counter top wear
  for (const [z, x, len] of [[-0.9, -1.4, 0.2], [-0.4, -1.25, 0.14], [0.3, -1.5, 0.22], [0.8, -1.2, 0.12]] as const)
    mbox(x, x + 0.12, 0.951, 0.953, z, z + len * 0.15, HG);
  mcyl(-1.3, 0.9515, -0.42, 0.045, 0.002, "y", GR, 10);
  mcyl(-1.55, 0.9515, 0.15, 0.03, 0.002, "y", RU, 10);
  mcyl(-1.33, 0.9515, 0.05, 0.02, 0.002, "y", GR, 8);
  mbox(-1.78, -1.56, 0.953, 0.963, -0.945, -0.935, BR); // toaster cable to wall
  mbox(-1.79, -1.76, 0.948, 0.97, -0.96, -0.92, SD); // plug

  // --- section A: three drawers ---
  const drawers: [number, number][] = [[0.2, 0.42], [0.44, 0.66], [0.68, 0.89]];
  drawers.forEach(([y0, y1], i) => {
    bx(-1.14, FX, y0, y1, -1.06, -0.47, ST, `drawer${i + 1}`);
    const yc = (y0 + y1) / 2;
    fbox("x", FX, 0, 0.004, -0.9, -0.63, yc - 0.022, yc + 0.022, BR);
    fbox("x", FX, 0.004, 0.022, -0.88, -0.65, yc - 0.008, yc + 0.008, SS);
    fbox("x", FX, 0.004, 0.022, -0.885, -0.875, yc - 0.013, yc + 0.013, SD);
    fbox("x", FX, 0.004, 0.022, -0.655, -0.645, yc - 0.013, yc + 0.013, SD);
    corners("x", FX, -1.06, -0.47, y0, y1, 0.022);
    fbox("x", FX, 0, 0.003, -1.06, -0.47, y0, y0 + 0.012, GR);
  });
  fbox("x", FX, 0, 0.004, -1.04, -0.94, 0.82, 0.86, PC);
  digit("x", FX, -0.99, 0.84, 0.018, 0.03, 0.005, 0.004, 0.007, "2", BR);
  digit("x", FX, -0.965, 0.84, 0.018, 0.03, 0.005, 0.004, 0.007, "1", BR);
  streak("x", FX, -0.55, 0.66, 0.2, 0.01);
  fbox("x", FX, 0, 0.003, -1.06, -1.0, 0.44, 0.6, RU);

  // --- section B: trash compactor (rounded corners, flap, foot pedal) ---
  bx(-1.14, -1.08, 0.2, 0.89, -0.41, -0.01, ST, "compactor");
  mcyl(-1.1, 0.545, -0.41, 0.02, 0.69, "y", ST, 8);
  mcyl(-1.1, 0.545, -0.01, 0.02, 0.69, "y", ST, 8);
  fbox("x", -1.08, 0, 0.012, -0.39, -0.03, 0.56, 0.86, SD);
  fbox("x", -1.08, 0.012, 0.016, -0.35, -0.07, 0.72, 0.82, BR);
  for (let i = 0; i < 5; i++) fbox("x", -1.08, 0.016, 0.019, -0.34 + i * 0.056, -0.31 + i * 0.056, 0.725, 0.815, SD);
  mcyl(-1.045, 0.61, -0.2, 0.011, 0.22, "z", SS, 8);
  fbox("x", -1.08, 0.012, 0.034, -0.32, -0.3, 0.6, 0.62, SD);
  fbox("x", -1.08, 0.012, 0.034, -0.1, -0.08, 0.6, 0.62, SD);
  warn("x", -1.08, -0.2, 0.42, 0.28, 0.12);
  corners("x", -1.08, -0.41, -0.01, 0.2, 0.89, 0.025);
  // pedal
  mcyl(-1.1, 0.12, -0.22, 0.015, 0.26, "z", SD, 8);
  fbox("x", FX, 0, 0.05, -0.34, -0.1, 0.1, 0.14, BR);
  fbox("x", FX, 0.046, 0.05, -0.34, -0.1, 0.1, 0.14, HY);
  for (let i = 0; i < 4; i++) fbox("x", FX, 0.005, 0.045, -0.31 + i * 0.06, -0.3 + i * 0.06, 0.14, 0.146, SD);
  streak("x", -1.08, -0.05, 0.56, 0.3, 0.012);

  // --- section C: drink and soup dispenser ---
  const DS = -1.08;
  bx(-1.14, DS, 0.22, 0.89, 0.09, 0.97, HG, "dispenser");
  fbox("x", DS, 0, 0.005, 0.13, 0.93, 0.64, 0.86, SD);
  fbox("x", DS, 0.005, 0.009, 0.17, 0.5, 0.72, 0.83, AM, 1.6); // amber display
  fbox("x", DS, 0.009, 0.012, 0.34, 0.47, 0.795, 0.805, BR);
  fbox("x", DS, 0.009, 0.012, 0.38, 0.47, 0.775, 0.785, BR);
  fbox("x", DS, 0.009, 0.012, 0.42, 0.47, 0.735, 0.752, GC, 1.8); // cursor bar
  fbox("x", DS, 0.009, 0.012, 0.17, 0.32, 0.745, 0.755, BR);
  // push buttons, indicator LEDs and label strips
  const btnCol = [SS, SS, HY, SS];
  const ledCol: [string, number][] = [[CY, 1.5], [GC, 1.5], [AM, 1.5], [RL, 1.6]];
  [0.6, 0.69, 0.78, 0.87].forEach((c, i) => {
    fbox("x", DS, 0.005, 0.022, c - 0.03, c + 0.03, 0.72, 0.77, btnCol[i]);
    fbox("x", DS, 0.005, 0.008, c - 0.012, c + 0.012, 0.675, 0.69, PC);
    fbox("x", DS, 0.005, 0.01, c - 0.008, c + 0.008, 0.80, 0.815, ledCol[i][0], ledCol[i][1]);
  });
  // nozzles, collars, colour tabs
  [[0.3, RU], [0.55, FRD], [0.8, FROST]].forEach(([z, col]) => {
    const zz = z as number;
    mcyl(-1.05, 0.6, zz, 0.024, 0.06, "x", SS, 8);
    mcyl(-1.076, 0.6, zz, 0.032, 0.012, "x", SD, 8);
    mcyl(-1.028, 0.6, zz, 0.013, 0.026, "x", BR, 8);
    fbox("x", DS, 0, 0.004, zz - 0.035, zz + 0.035, 0.626, 0.638, col as string);
  });
  // drip plate, drip tray and grille
  fbox("x", DS, 0, 0.004, 0.13, 0.93, 0.4, 0.57, SD);
  [0.3, 0.55, 0.8].forEach((z, i) => streak("x", DS + 0.004, z + (i - 1) * 0.004, 0.575, 0.1 + R() * 0.08, 0.008));
  mbox(-1.08, -1.015, 0.42, 0.44, 0.14, 0.92, SD);
  mbox(-1.02, -1.015, 0.44, 0.46, 0.14, 0.92, SD);
  for (let i = 0; i < 14; i++) mbox(-1.07, -1.02, 0.44, 0.447, 0.16 + i * 0.054, 0.172 + i * 0.054, SS);
  // lower panel: seams, label, warning, rivets
  fbox("x", DS, 0, 0.003, 0.1, 0.96, 0.385, 0.392, SD);
  fbox("x", DS, 0, 0.004, 0.58, 0.92, 0.28, 0.35, PC);
  for (let k = 0; k < 7; k++) fbox("x", DS, 0.004, 0.006, 0.6 + k * 0.045, 0.62 + k * 0.045, 0.295, 0.335, BR);
  warn("x", DS, 0.26, 0.31, 0.2, 0.09);
  corners("x", DS, 0.09, 0.97, 0.22, 0.89, 0.025, SS);
  for (const z of [0.3, 0.53, 0.76]) rivet("x", DS, z, 0.235, SS);
  fbox("x", DS, 0, 0.003, 0.15, 0.2, 0.22, 0.35, RU);
  fbox("x", DS, 0.004, 0.006, 0.7, 0.72, 0.64, 0.4, GR);

  // =====================================================================================================
  // COUNTERTOP SET
  // =====================================================================================================
  // toaster
  bx(-1.56, -1.34, 0.95, 1.08, -1.04, -0.84, SS, "toaster");
  mbox(-1.57, -1.33, 0.95, 0.972, -1.05, -0.83, BR);
  mbox(-1.52, -1.38, 1.079, 1.083, -1.0, -0.985, BR);
  mbox(-1.52, -1.38, 1.079, 1.083, -0.9, -0.885, BR);
  mbox(-1.51, -1.39, 1.075, 1.125, -0.996, -0.984, BREAD);
  mbox(-1.51, -1.39, 1.075, 1.1, -0.896, -0.884, BREAD);
  fbox("x", -1.34, 0, 0.004, -0.96, -0.94, 0.985, 1.05, BR);
  fbox("x", -1.34, 0.004, 0.02, -0.97, -0.93, 0.995, 1.015, BR);
  mcyl(-1.33, 1.045, -0.88, 0.014, 0.012, "x", SD, 8);
  fbox("x", -1.34, 0, 0.004, -1.02, -1.0, 1.04, 1.05, RL);
  streak("x", -1.34, -0.99, 1.07, 0.06, 0.008);

  // bread box
  bx(-1.64, -1.3, 0.95, 1.12, -0.78, -0.5, PC, "breadBox");
  mbox(-1.645, -1.295, 1.1, 1.13, -0.785, -0.495, HG);
  fbox("x", -1.3, 0, 0.004, -0.72, -0.56, 0.985, 1.035, SD);
  for (let k = 0; k < 5; k++) fbox("x", -1.3, 0.004, 0.006, -0.71 + k * 0.03, -0.7 + k * 0.03, 0.995, 1.025, PC);
  fbox("x", -1.3, 0, 0.012, -0.675, -0.665, 1.055, 1.082, SD);
  fbox("x", -1.3, 0, 0.012, -0.615, -0.605, 1.055, 1.082, SD);
  fbox("x", -1.3, 0.01, 0.022, -0.68, -0.6, 1.063, 1.078, SS);
  for (let k = 0; k < 4; k++) fbox("x", -1.3, 0, 0.003, -0.78, -0.5, 1.045 + k * 0.014, 1.047 + k * 0.014, GR);
  streak("x", -1.3, -0.52, 1.1, 0.12, 0.012);

  // bowl stack
  for (let k = 0; k < 3; k++) {
    const y = 0.975 + k * 0.04;
    put(new THREE.CylinderGeometry(0.085, 0.055, 0.05, 10), -1.46, y, -0.22, MW);
    put(new THREE.CylinderGeometry(0.0835, 0.0825, 0.007, 10), -1.46, y + 0.018, -0.22, FRD);
  }
  mcyl(-1.46, 1.077, -0.22, 0.068, 0.004, "y", FG, 10);
  mcyl(-1.44, 1.08, -0.2, 0.025, 0.004, "y", FRD, 8);

  // canned goods pyramid
  const can = (z: number, y: number, band: string) => {
    mcyl(-1.46, y, z, 0.036, 0.11, "y", ST, 8);
    mcyl(-1.46, y, z, 0.0375, 0.045, "y", band, 8);
    mcyl(-1.46, y + 0.056, z, 0.033, 0.004, "y", SD, 8);
    mcyl(-1.46, y - 0.056, z, 0.037, 0.004, "y", SD, 8);
  };
  can(0.26, 1.005, FRD);
  can(0.34, 1.005, FG);
  can(0.42, 1.005, FRD);
  can(0.3, 1.117, FG);
  can(0.38, 1.117, FRD);

  // ration crate with straps and stencil
  bx(-1.72, -1.42, 0.95, 1.07, 0.62, 0.94, HG, "rationCrate");
  mbox(-1.72, -1.42, 1.07, 1.074, 0.7, 0.72, HY);
  mbox(-1.72, -1.42, 1.07, 1.074, 0.84, 0.86, HY);
  fbox("x", -1.42, 0, 0.004, 0.7, 0.72, 0.95, 1.07, HY);
  fbox("x", -1.42, 0, 0.004, 0.84, 0.86, 0.95, 1.07, HY);
  fbox("x", -1.42, 0, 0.004, 0.73, 0.83, 0.99, 1.05, PC);
  digit("x", -1.42, 0.765, 1.02, 0.025, 0.04, 0.006, 0.004, 0.007, "0", BR);
  digit("x", -1.42, 0.795, 1.02, 0.025, 0.04, 0.006, 0.004, 0.007, "9", BR);
  rivet("x", -1.42, 0.65, 1.04);
  rivet("x", -1.42, 0.91, 1.04);

  // wall switch / indicator panel above backsplash
  fbox("x", -1.8, 0, 0.012, 0.3, 0.62, 1.1, 1.2, HG);
  [0.35, 0.43, 0.51].forEach((z, i) => {
    mcyl(-1.786, 1.145, z, 0.011, 0.012, "x", SD, 8);
    mboxr(-1.77, 1.145 + (i === 1 ? -0.008 : 0.008), z, 0.034, 0.01, 0.01, [0, 0, i === 1 ? -22 : 22], SS);
  });
  fbox("x", -1.8, 0.012, 0.016, 0.565, 0.585, 1.14, 1.16, AM, 1.5);
  fbox("x", -1.8, 0.012, 0.014, 0.33, 0.55, 1.175, 1.185, BR);
  corners("x", -1.8, 0.3, 0.62, 1.1, 1.2, 0.01, SS);

  // =====================================================================================================
  // LOCKER BANK (y 1.25..2.0, z -1.0..0.9)
  // =====================================================================================================
  bx(-1.8, -1.45, 1.25, 2.0, -1.0, 0.9, SD, "lockerBody");
  bx(-1.8, -1.43, 2.0, 2.03, -1.02, 0.92, HG, "lockerCap");
  bx(-1.8, -1.43, 1.23, 1.25, -1.02, 0.92, HG, "lockerSill");
  fbox("x", -1.43, 0, 0.003, -1.02, 0.92, 1.23, 1.25, GR);
  for (let i = 0; i < 5; i++) {
    const zc = -0.81 + 0.38 * i;
    const s = -1.425;
    bx(-1.45, s, 1.32, 1.93, zc - 0.17, zc + 0.17, ST, `hatch${i + 1}`);
    // recessed frame
    fbox("x", s, 0, 0.004, zc - 0.15, zc + 0.15, 1.34, 1.352, SD);
    fbox("x", s, 0, 0.004, zc - 0.15, zc + 0.15, 1.898, 1.91, SD);
    fbox("x", s, 0, 0.004, zc - 0.15, zc - 0.138, 1.34, 1.91, SD);
    fbox("x", s, 0, 0.004, zc + 0.138, zc + 0.15, 1.34, 1.91, SD);
    // latch with lever
    fbox("x", s, 0, 0.006, zc + 0.07, zc + 0.13, 1.52, 1.66, SS);
    fbox("x", s, 0.006, 0.02, zc + 0.095, zc + 0.105, 1.54, 1.64, SD);
    mcyl(s + 0.008, 1.6, zc + 0.1, 0.011, 0.01, "x", SD, 8);
    // status LED
    fbox("x", s, 0, 0.006, zc - 0.12, zc - 0.1, 1.68, 1.7, i % 2 === 0 ? GC : RL, 1.5);
    // number stencil
    fbox("x", s, 0, 0.004, zc - 0.07, zc + 0.07, 1.77, 1.87, PC);
    digit("x", s, zc, 1.82, 0.04, 0.07, 0.009, 0.004, 0.007, String(i + 1), BR);
    // hazard strip
    fbox("x", s, 0, 0.004, zc - 0.11, zc + 0.11, 1.4, 1.44, HY);
    for (let k = 0; k < 5; k++) fbox("x", s, 0.004, 0.006, zc - 0.1 + k * 0.045, zc - 0.086 + k * 0.045, 1.4, 1.44, HB);
    corners("x", s, zc - 0.17, zc + 0.17, 1.32, 1.93, 0.02);
    streak("x", s, zc + (R() - 0.5) * 0.2, 1.52, 0.08 + R() * 0.12, 0.01);
  }
  fbox("x", -1.425, 0, 0.003, -0.28, -0.2, 1.34, 1.4, RU);
  fbox("x", -1.425, 0, 0.003, 0.52, 0.6, 1.6, 1.7, GR);
  // orange pipe strip along the locker top, with couplers and clamps
  mcyl(-1.64, 2.052, -0.05, 0.022, 1.96, "z", OP, 10);
  for (const z of [-0.55, 0.4]) mcyl(-1.64, 2.052, z, 0.03, 0.016, "z", SD, 10);
  for (const z of [-0.9, -0.3, 0.15, 0.7]) mbox(-1.665, -1.615, 2.03, 2.082, z - 0.02, z + 0.02, BR);
  mcyl(-1.64, 2.052, 0.935, 0.027, 0.01, "z", SD, 10);
  mcyl(-1.64, 2.052, -1.035, 0.027, 0.01, "z", SD, 10);

  flush();
}
```

<!-- call: overhead -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];
type Item = { color: string; gl: number; list: THREE.BufferGeometry[] };
type Grp = { name: string; items: Map<string, Item> };

export function buildOverhead({ b, P, M }: Ctx) {
  const c = P as Record<string, string>;
  const rand = rng(1979);
  const D = Math.PI / 180;
  const UP = new THREE.Vector3(0, 1, 0);

  // a few extra dirty-industrial tones
  const LAMP = "#ffd98a";
  const LAMPDIM = "#c9a45a";
  const SCREEN = "#1f9a5e";
  const SCAN = "#0f5a35";
  const CLOTH = "#7b745e";
  const BEAMLIGHT = "#fff2c0";

  // ---------------------------------------------------------------- collector
  const groups: Grp[] = [];
  let cur: Grp;
  let XF: THREE.Matrix4 | null = null;
  const begin = (name: string) => {
    cur = { name, items: new Map() };
    groups.push(cur);
  };
  const mat = (at: V, rot: V = [0, 0, 0], scl: V = [1, 1, 1]) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ")),
      new THREE.Vector3(scl[0], scl[1], scl[2]),
    );
  const put = (g: THREE.BufferGeometry, color: string, m: THREE.Matrix4, gl = 0) => {
    if (XF) m.premultiply(XF);
    g.applyMatrix4(m);
    const f = g.index ? g.toNonIndexed() : g;
    f.deleteAttribute("uv");
    f.computeVertexNormals();
    const key = `${color}|${gl}`;
    let it = cur.items.get(key);
    if (!it) {
      it = { color, gl, list: [] };
      cur.items.set(key, it);
    }
    it.list.push(f);
  };
  const bx = (w: number, h: number, d: number, color: string, at: V, rot: V = [0, 0, 0], gl = 0) =>
    put(new THREE.BoxGeometry(w, h, d), color, mat(at, rot), gl);
  const cyl = (
    r: number,
    h: number,
    color: string,
    at: V,
    ax: "x" | "y" | "z" = "y",
    seg = 8,
    gl = 0,
    r2 = r,
  ) => {
    const g = new THREE.CylinderGeometry(r, r2, h, seg);
    if (ax === "x") g.rotateZ(Math.PI / 2);
    else if (ax === "z") g.rotateX(Math.PI / 2);
    put(g, color, mat(at), gl);
  };
  const sp = (r: number, color: string, at: V, scl: V = [1, 1, 1], gl = 0, ws = 8, hs = 6) =>
    put(new THREE.SphereGeometry(r, ws, hs), color, mat(at, [0, 0, 0], scl), gl);
  const tr = (R: number, t: number, color: string, at: V, rot: V = [0, 0, 0], scl: V = [1, 1, 1], gl = 0) =>
    put(new THREE.TorusGeometry(R, t, 4, 10), color, mat(at, rot, scl), gl);
  const rd = (a: V, e: V, r: number, color: string, seg = 6, gl = 0) => {
    const va = new THREE.Vector3(a[0], a[1], a[2]);
    const ve = new THREE.Vector3(e[0], e[1], e[2]);
    const dir = ve.clone().sub(va);
    const len = dir.length();
    const m = new THREE.Matrix4().compose(
      va.clone().add(ve).multiplyScalar(0.5),
      new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
      new THREE.Vector3(1, 1, 1),
    );
    put(new THREE.CylinderGeometry(r, r, len, seg), color, m, gl);
  };
  const taper = (wB: number, dB: number, wT: number, dT: number, h: number, zs = 0) => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const top = p.getY(i) > 0;
      p.setXYZ(
        i,
        p.getX(i) * (top ? wT : wB),
        p.getY(i) * h,
        p.getZ(i) * (top ? dT : dB) + (top ? zs : 0),
      );
    }
    return g;
  };
  const rivetZ = (x: number, y: number, z: number, color = c.stainless) => cyl(0.008, 0.008, color, [x, y, z], "z", 6);

  // ================================================================ HOOD
  begin("hood");
  const HX = M.hoodBase[0];
  const hf = (y: number) => {
    const t = (y - 1.65) / 0.45;
    return { z: -1.05 - 0.37 * t, hx: 0.5 - 0.25 * t };
  };
  const SLOPE = -Math.atan2(0.37, 0.45) / D;
  const slope = (x: number, y: number, w: number, h: number, color: string, off = 0.003, spin = 0, gl = 0) => {
    const f = hf(y);
    bx(w, h, 0.006, color, [x, y + 0.634 * off, f.z + 0.773 * off], [SLOPE, 0, spin], gl);
  };
  put(taper(1.0, 0.73, 0.5, 0.36, 0.45, -0.185), c.steel, mat([HX, 1.875, -1.415]));
  // lip frame
  bx(1.04, 0.05, 0.05, c.steelDark, [HX, 1.675, -1.07]);
  bx(1.04, 0.05, 0.04, c.steelDark, [HX, 1.675, -1.76]);
  for (const s of [1, -1]) bx(0.05, 0.05, 0.7, c.steelDark, [HX + s * 0.495, 1.675, -1.415]);
  // dark underside grille
  bx(0.94, 0.012, 0.645, c.blackRubber, [HX, 1.664, -1.4175]);
  for (let i = 0; i < 9; i++) bx(0.012, 0.012, 0.64, c.steelDark, [HX - 0.4 + i * 0.1, 1.652, -1.4175]);
  // amber lamp strips
  bx(0.78, 0.012, 0.05, c.amber, [HX, 1.642, -1.27], [0, 0, 0], 1.6);
  bx(0.78, 0.012, 0.05, c.amber, [HX, 1.642, -1.56], [0, 0, 0], 1.6);
  // lip rivets + grime
  for (let i = 0; i < 11; i++) rivetZ(HX - 0.45 + i * 0.09, 1.678, -1.043);
  bx(0.9, 0.012, 0.004, c.grime, [HX, 1.658, -1.043]);
  // greasy band and drips on the sloped front
  slope(HX, 1.78, 0.8, 0.07, c.grime, 0.004);
  slope(HX, 1.88, 0.7, 0.025, c.grime, 0.004);
  const drips: [number, number, number, number][] = [
    [-0.3, 1.72, 0.02, 0.12],
    [0.1, 1.7, 0.015, 0.09],
    [0.33, 1.74, 0.02, 0.14],
    [-0.12, 1.69, 0.012, 0.06],
    [0.2, 1.82, 0.012, 0.08],
  ];
  for (const [dx, dy, w, h] of drips) slope(HX + dx, dy, w, h * (0.8 + rand() * 0.4), c.grime, 0.005);
  // labels on the front slope
  slope(HX - 0.2, 1.96, 0.2, 0.08, c.panelCream, 0.004);
  for (let i = 0; i < 4; i++) slope(HX - 0.27 + i * 0.045, 1.96, 0.012, 0.05, c.blackRubber, 0.007);
  slope(HX + 0.2, 1.96, 0.14, 0.08, c.hazardYellow, 0.004);
  for (let i = 0; i < 3; i++) slope(HX + 0.15 + i * 0.05, 1.96, 0.014, 0.075, c.hazardBlack, 0.007, 25);
  // collar and duct
  bx(0.54, 0.03, 0.4, c.steelDark, [HX, 2.115, -1.6]);
  bx(0.4, 0.45, 0.3, c.steel, [HX, 2.325, -1.6]);
  for (const y of [2.25, 2.4, 2.52]) {
    bx(0.44, 0.045, 0.34, c.steelDark, [HX, y, -1.6]);
    for (const dx of [-0.16, -0.055, 0.055, 0.16]) rivetZ(HX + dx, y, -1.428);
  }
  bx(0.012, 0.4, 0.004, c.steelDark, [HX + 0.1, 2.33, -1.449]);
  bx(0.03, 0.2, 0.004, c.grime, [HX - 0.1, 2.3, -1.448]);
  bx(0.12, 0.05, 0.004, c.rust, [HX + 0.1, 2.17, -1.448]);
  bx(0.02, 0.16, 0.004, c.grime, [HX + 0.14, 2.42, -1.448]);

  // ================================================================ CEILING
  begin("ceiling");
  const bolts = [-1.6, -1.3, -0.5, -0.15, 0.2, 0.6, 1.1, 1.5];
  for (const z of [-1.6, -0.8, 0, 0.8, 1.6]) {
    bx(3.65, 0.02, 0.14, c.steelDark, [0.025, 2.54, z]);
    bx(3.65, 0.02, 0.14, c.steelDark, [0.025, 2.46, z]);
    bx(3.65, 0.06, 0.035, c.steelDark, [0.025, 2.5, z]);
    for (const x of bolts) bx(0.022, 0.012, 0.022, c.steel, [x, 2.444, z]);
    bx(0.3 + rand() * 0.3, 0.04, 0.003, c.grime, [-0.8 + rand() * 1.6, 2.5, z + 0.019]);
  }
  for (const x of [-1.3, 0.2, 1.4]) bx(0.07, 0.03, 3.6, c.hullGrey, [x, 2.565, 0]);
  // hazard-striped underside of the front beam
  for (let i = 0; i < 20; i++)
    bx(0.06, 0.004, 0.12, i % 2 ? c.hazardBlack : c.hazardYellow, [-1.0 + i * 0.1, 2.448, 1.6], [0, 30, 0]);
  // recessed lamp panels
  const lamps: [number, number][] = [
    [0.4, -0.4],
    [0.4, 0.4],
    [-0.3, -0.4],
    [-0.3, 0.4],
  ];
  lamps.forEach(([x, z], i) => {
    bx(0.64, 0.03, 0.54, c.panelCream, [x, 2.435, z]);
    bx(0.54, 0.012, 0.44, i === 3 ? LAMPDIM : LAMP, [x, 2.416, z], [0, 0, 0], i === 3 ? 0.7 : 1.4);
    for (const dx of [-0.09, 0.09]) bx(0.012, 0.01, 0.44, c.panelCream, [x + dx, 2.411, z]);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) bx(0.025, 0.012, 0.025, c.steelDark, [x + sx * 0.295, 2.414, z + sz * 0.245]);
  });
  // cable runs on the beams
  rd([0.1, 2.5, 0.855], [1.75, 2.5, 0.855], 0.011, c.blackRubber);
  for (const x of [0.2, 0.6, 1.0, 1.4]) bx(0.03, 0.05, 0.025, c.steelDark, [x, 2.5, 0.85]);
  rd([1.62, 2.45, 0.2], [1.62, 2.5, 0.05], 0.011, c.blackRubber);

  // ================================================================ PIPES
  begin("pipes");
  const tubes: [number, number, number, string][] = [
    [-0.96, 2.4, 0.045, c.orangePipe],
    [-0.84, 2.4, 0.04, c.copper],
    [-0.96, 2.3, 0.04, c.steel],
    [-0.84, 2.3, 0.045, c.hullGrey],
  ];
  for (const [x, y, r, col] of tubes) {
    cyl(r, 2.8, col, [x, y, -0.4], "z", 10);
    for (const z of [-1.75, -0.4, 0.4, 0.95]) cyl(r * 1.5, 0.035, c.steelDark, [x, y, z], "z", 8);
    cyl(r * 1.1, 0.02, c.steelDark, [x, y, 1.01], "z", 8);
  }
  // colour bands and stains
  cyl(0.0465, 0.05, c.hazardYellow, [-0.96, 2.4, -1.35], "z", 10);
  cyl(0.0465, 0.14, c.rust, [-0.96, 2.4, -1.0], "z", 10);
  cyl(0.0415, 0.1, c.grime, [-0.84, 2.4, 0.1], "z", 10);
  cyl(0.0415, 0.04, c.hazardYellow, [-0.96, 2.3, 0.7], "z", 10);
  cyl(0.0415, 0.04, c.hazardBlack, [-0.96, 2.3, 0.75], "z", 10);
  cyl(0.0465, 0.08, c.rust, [-0.84, 2.3, -1.0], "z", 10);
  // hanger straps
  for (const z of [-0.8, 0.8]) {
    bx(0.28, 0.016, 0.045, c.steelDark, [-0.9, 2.252, z]);
    for (const x of [-1.03, -0.77]) cyl(0.008, 0.19, c.steelDark, [x, 2.355, z], "y", 6);
  }
  // red valve wheels
  for (const [vx, vz] of [
    [-0.96, -0.6],
    [-0.84, 0.2],
  ] as [number, number][]) {
    bx(0.07, 0.04, 0.07, c.steelDark, [vx, 2.24, vz]);
    cyl(0.012, 0.07, c.steel, [vx, 2.185, vz], "y", 6);
    cyl(0.06, 0.012, c.redLed, [vx, 2.155, vz], "y", 8);
    bx(0.12, 0.02, 0.014, c.steelDark, [vx, 2.155, vz]);
    bx(0.014, 0.02, 0.12, c.steelDark, [vx, 2.155, vz]);
  }
  // side valve on the orange line
  bx(0.05, 0.07, 0.07, c.steelDark, [-1.03, 2.4, -0.2]);
  cyl(0.012, 0.08, c.steel, [-1.095, 2.4, -0.2], "x", 6);
  cyl(0.06, 0.012, c.redLed, [-1.14, 2.4, -0.2], "x", 8);
  bx(0.02, 0.12, 0.014, c.steelDark, [-1.14, 2.4, -0.2]);
  bx(0.02, 0.014, 0.12, c.steelDark, [-1.14, 2.4, -0.2]);
  // gauge
  bx(0.03, 0.03, 0.03, c.steelDark, [-1.02, 2.4, -0.9]);
  cyl(0.035, 0.018, c.steel, [-1.05, 2.4, -0.9], "x", 10);
  cyl(0.029, 0.006, c.mugWhite, [-1.06, 2.4, -0.9], "x", 10);
  bx(0.004, 0.003, 0.024, c.redLed, [-1.064, 2.4, -0.895], [-30, 0, 0]);
  // drips
  bx(0.012, 0.12, 0.012, c.grime, [-0.96, 2.2, 0.3]);
  sp(0.012, c.steel, [-0.96, 2.13, 0.3], [1, 1.3, 1], 0, 6, 4);
  bx(0.012, 0.09, 0.012, c.grime, [-0.84, 2.21, -1.2]);
  sp(0.011, c.steel, [-0.84, 2.155, -1.2], [1, 1.3, 1], 0, 6, 4);
  bx(0.02, 0.07, 0.003, c.rust, [-1.0, 2.35, 0.6]);

  // ================================================================ UTENSIL RAIL
  begin("rail");
  cyl(0.012, 2.6, c.steel, [0.4, 1.6, -1.72], "x", 8);
  for (const x of [-0.85, 0.5, 1.65]) bx(0.025, 0.025, 0.08, c.steelDark, [x, 1.6, -1.76]);
  for (const x of [-0.9, 1.7]) cyl(0.016, 0.02, c.steelDark, [x, 1.6, -1.72], "x", 8);
  const ring = (x: number) => tr(0.02, 0.004, c.steel, [x, 1.6, -1.72], [0, 90, 0]);
  // ladle
  ring(0.3);
  bx(0.014, 0.2, 0.008, c.steel, [0.3, 1.485, -1.72]);
  bx(0.018, 0.07, 0.012, c.blackRubber, [0.3, 1.55, -1.72]);
  sp(0.042, c.steel, [0.3, 1.37, -1.72], [1, 1, 0.55]);
  // spatula
  ring(0.45);
  bx(0.02, 0.08, 0.012, c.blackRubber, [0.45, 1.545, -1.72]);
  bx(0.01, 0.1, 0.006, c.steel, [0.45, 1.46, -1.72]);
  bx(0.07, 0.1, 0.006, c.steel, [0.45, 1.36, -1.72]);
  for (const dx of [-0.017, 0.017]) bx(0.008, 0.06, 0.008, c.steelDark, [0.45 + dx, 1.36, -1.72]);
  // whisk
  ring(0.6);
  bx(0.02, 0.08, 0.012, c.blackRubber, [0.6, 1.545, -1.72]);
  bx(0.008, 0.08, 0.008, c.steel, [0.6, 1.465, -1.72]);
  for (const ry of [0, 60, 120]) tr(0.026, 0.003, c.stainless, [0.6, 1.38, -1.72], [0, ry, 0], [1, 1.9, 1]);
  // tongs
  ring(0.78);
  for (const s of [1, -1]) {
    bx(0.012, 0.26, 0.006, c.steel, [0.78 + s * 0.009, 1.45, -1.72], [0, 0, -s * 3]);
    bx(0.024, 0.04, 0.008, c.blackRubber, [0.78 + s * 0.016, 1.33, -1.72]);
  }
  // long ladle
  ring(0.95);
  bx(0.014, 0.26, 0.008, c.stainless, [0.95, 1.45, -1.72]);
  bx(0.018, 0.07, 0.012, c.blackRubber, [0.95, 1.55, -1.72]);
  sp(0.05, c.stainless, [0.95, 1.3, -1.72], [1, 1, 0.55]);
  // pot lid
  ring(1.15);
  cyl(0.012, 0.035, c.blackRubber, [1.15, 1.56, -1.73], "y", 6);
  cyl(0.09, 0.012, c.stainless, [1.15, 1.45, -1.73], "z", 10);
  cyl(0.02, 0.014, c.steelDark, [1.15, 1.45, -1.722], "z", 6);
  // cast-iron pan
  ring(1.45);
  cyl(0.13, 0.035, c.grating, [1.45, 1.31, -1.74], "z", 12);
  cyl(0.112, 0.006, c.blackRubber, [1.45, 1.31, -1.7215], "z", 12);
  bx(0.035, 0.17, 0.014, c.grating, [1.45, 1.52, -1.74]);
  cyl(0.008, 0.016, c.blackRubber, [1.45, 1.585, -1.74], "z", 6);
  // cloth
  bx(0.14, 0.2, 0.012, CLOTH, [-0.82, 1.5, -1.727]);
  bx(0.14, 0.09, 0.01, CLOTH, [-0.82, 1.55, -1.703]);
  bx(0.14, 0.012, 0.014, c.foodRed, [-0.82, 1.45, -1.727]);
  bx(0.14, 0.012, 0.014, c.foodRed, [-0.82, 1.42, -1.727]);

  // ================================================================ SHELVES
  begin("shelves");
  const shelf = (top: number) => {
    bx(0.8, 0.025, 0.2, c.steel, [-0.3, top - 0.0125, -1.7]);
    bx(0.8, 0.05, 0.012, c.steelDark, [-0.3, top - 0.03, -1.606]);
    bx(0.8, 0.015, 0.01, c.steelDark, [-0.3, top + 0.0075, -1.605]);
    for (const x of [-0.62, 0.02]) {
      bx(0.02, 0.14, 0.012, c.steelDark, [x, top - 0.078, -1.725], [45, 0, 0]);
      bx(0.025, 0.08, 0.008, c.steelDark, [x, top - 0.07, -1.796]);
    }
    for (let i = 0; i < 5; i++) rivetZ(-0.65 + i * 0.17, top - 0.03, -1.6);
    bx(0.1, 0.02, 0.002, c.rust, [-0.2 + rand() * 0.3, top - 0.03, -1.598]);
  };
  const Z = -1.7;
  const can = (x: number, y0: number, r: number, h: number, body: string, band: string | null, lid = false) => {
    cyl(r, h, body, [x, y0 + h / 2, Z], "y", 8);
    if (lid) cyl(r * 1.04, 0.015, c.steelDark, [x, y0 + h + 0.007, Z], "y", 8);
    if (band) {
      cyl(r * 1.04, h * 0.4, band, [x, y0 + h * 0.5, Z], "y", 8);
      bx(r * 0.9, 0.01, 0.004, c.blackRubber, [x, y0 + h * 0.55, Z + r * 1.05]);
      bx(r * 0.5, 0.008, 0.004, c.blackRubber, [x, y0 + h * 0.45, Z + r * 1.05]);
    }
  };
  shelf(1.4);
  can(-0.62, 1.4, 0.04, 0.11, c.foodGreen, c.panelCream, true);
  can(-0.5, 1.4, 0.035, 0.1, c.steel, c.foodRed);
  can(-0.38, 1.4, 0.04, 0.09, c.rust, c.panelCream, true);
  can(-0.25, 1.4, 0.035, 0.1, c.steel, c.foodGreen);
  can(-0.25, 1.5, 0.035, 0.1, c.steel, c.foodRed);
  bx(0.09, 0.06, 0.08, c.stainless, [-0.1, 1.43, Z]);
  bx(0.092, 0.01, 0.082, c.steelDark, [-0.1, 1.455, Z]);
  bx(0.05, 0.03, 0.004, c.hazardYellow, [-0.1, 1.43, Z + 0.042]);
  bx(0.03, 0.008, 0.004, c.blackRubber, [-0.1, 1.43, Z + 0.044]);
  can(0.01, 1.4, 0.03, 0.08, c.foodGreen, null, true);
  shelf(1.8);
  can(-0.62, 1.8, 0.045, 0.15, c.foodGreen, c.panelCream, true);
  bx(0.1, 0.12, 0.1, c.panelCream, [-0.45, 1.86, Z]);
  bx(0.102, 0.02, 0.102, c.foodRed, [-0.45, 1.88, Z]);
  bx(0.06, 0.008, 0.004, c.blackRubber, [-0.45, 1.84, Z + 0.052]);
  can(-0.3, 1.8, 0.035, 0.1, c.rust, c.panelCream);
  can(-0.2, 1.8, 0.035, 0.1, c.steel, c.foodRed);
  can(-0.08, 1.8, 0.04, 0.12, c.steel, c.hazardYellow, true);
  can(0.04, 1.8, 0.03, 0.08, c.rust, null, true);
  // wall streaks under the shelves
  for (const [x, y] of [
    [-0.55, 1.25],
    [-0.1, 1.3],
    [0.05, 1.66],
    [-0.62, 1.68],
  ] as [number, number][])
    bx(0.03 + rand() * 0.03, 0.14 + rand() * 0.1, 0.003, c.grime, [x, y, -1.797]);

  // ================================================================ MONITOR
  begin("monitor");
  const Cm: V = [-0.8, 1.9, 0.65];
  XF = mat(Cm, [0, 65, 0]);
  const W = (p: V): V => {
    const v = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(XF!);
    return [v.x, v.y, v.z];
  };
  bx(0.4, 0.34, 0.14, c.hullGrey, [0, 0, 0.1]);
  put(taper(0.2, 0.17, 0.4, 0.34, 0.24), c.hullGrey, mat([0, 0, -0.09], [90, 0, 0]));
  bx(0.43, 0.37, 0.025, c.blackRubber, [0, 0, 0.1725]);
  bx(0.355, 0.295, 0.004, c.grating, [0, 0.005, 0.1865]);
  bx(0.33, 0.27, 0.006, SCREEN, [0, 0.005, 0.188], [0, 0, 0], 1.2);
  for (let i = 0; i < 10; i++) bx(0.33, 0.007, 0.003, SCAN, [0, -0.115 + i * 0.0266, 0.1925]);
  bx(0.28, 0.02, 0.003, c.greenCRT, [0, 0.1, 0.1945], [0, 0, 0], 1.8);
  const lens = [0.18, 0.12, 0.2, 0.09, 0.15, 0.1];
  lens.forEach((l, k) => bx(l, 0.012, 0.003, c.greenCRT, [-0.15 + l / 2, 0.06 - k * 0.03, 0.1945], [0, 0, 0], 1.8));
  bx(0.016, 0.016, 0.003, c.greenCRT, [-0.15 + 0.1 + 0.014, 0.06 - 5 * 0.03, 0.1945], [0, 0, 0], 2.2);
  for (let i = 0; i < 5; i++) bx(0.012, 0.004, 0.1, c.blackRubber, [-0.12 + i * 0.06, 0.172, 0.1]);
  cyl(0.012, 0.012, c.steelDark, [0.12, -0.16, 0.191], "z", 8);
  cyl(0.012, 0.012, c.steelDark, [0.15, -0.16, 0.191], "z", 8);
  bx(0.012, 0.012, 0.006, c.redLed, [-0.16, -0.16, 0.188], [0, 0, 0], 2);
  bx(0.07, 0.014, 0.004, c.panelCream, [-0.05, -0.16, 0.187]);
  bx(0.02, 0.006, 0.002, c.blackRubber, [-0.065, -0.16, 0.19]);
  bx(0.02, 0.006, 0.002, c.blackRubber, [-0.035, -0.16, 0.19]);
  bx(0.08, 0.004, 0.05, c.hazardYellow, [0.12, 0.172, 0.0]);
  bx(0.09, 0.06, 0.04, c.steelDark, [0, 0.0, -0.215]);
  cyl(0.03, 0.06, c.steelDark, [0, 0.1, -0.2], "y", 8);
  const mount = W([0, 0.085, -0.21]);
  XF = null;
  // arm
  const E: V = [-1.4, 2.2, 0.3];
  const Wr: V = [-1.05, 2.2, 0.55];
  bx(0.02, 0.16, 0.16, c.steelDark, [-1.79, 2.2, 0.3]);
  for (const sy of [1, -1])
    for (const sz of [1, -1]) cyl(0.012, 0.012, c.steel, [-1.776, 2.2 + sy * 0.06, 0.3 + sz * 0.06], "x", 6);
  cyl(0.035, 0.1, c.steelDark, [-1.73, 2.2, 0.3], "y", 8);
  rd([-1.73, 2.2, 0.3], E, 0.022, c.steel, 8);
  cyl(0.035, 0.1, c.steelDark, E, "y", 8);
  rd(E, Wr, 0.02, c.steel, 8);
  cyl(0.03, 0.09, c.steelDark, Wr, "y", 8);
  rd(Wr, mount, 0.018, c.steel, 8);
  rd([-1.73, 2.165, 0.3], [-1.4, 2.165, 0.3], 0.007, c.blackRubber);
  rd([-1.4, 2.165, 0.3], [-1.05, 2.165, 0.55], 0.007, c.blackRubber);
  rd([-1.05, 2.165, 0.55], [mount[0] + 0.02, mount[1] - 0.02, mount[2]], 0.007, c.blackRubber);

  // ================================================================ BEACON
  begin("beacon");
  const bxp = 1.5;
  const bzp = 0.2;
  cyl(0.1, 0.03, c.hazardYellow, [bxp, 2.435, bzp], "y", 10);
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * D;
    bx(0.045, 0.034, 0.022, c.hazardBlack, [bxp + 0.1 * Math.sin(a), 2.435, bzp + 0.1 * Math.cos(a)], [0, i * 60, 0]);
  }
  cyl(0.065, 0.11, c.amber, [bxp, 2.355, bzp], "y", 10, 1.5);
  sp(0.065, c.amber, [bxp, 2.3, bzp], [1, 0.7, 1], 1.5, 10, 5);
  bx(0.1, 0.07, 0.01, BEAMLIGHT, [bxp, 2.355, bzp], [0, 20, 0], 2.2);
  sp(0.02, BEAMLIGHT, [bxp, 2.355, bzp], [1, 1, 1], 2.2, 6, 4);
  for (let i = 0; i < 6; i++) {
    const a = (i * 60 + 30) * D;
    cyl(0.005, 0.17, c.steelDark, [bxp + 0.085 * Math.sin(a), 2.335, bzp + 0.085 * Math.cos(a)], "y", 5);
  }
  tr(0.085, 0.005, c.steelDark, [bxp, 2.255, bzp], [90, 0, 0]);
  tr(0.085, 0.005, c.steelDark, [bxp, 2.41, bzp], [90, 0, 0]);
  cyl(0.02, 0.02, c.steelDark, [bxp, 2.245, bzp], "y", 6);

  // ================================================================ INTERCOM
  begin("intercom");
  const ix = 1.55;
  const iy = 1.95;
  bx(0.24, 0.34, 0.02, c.hullGrey, [ix, iy, -1.79]);
  bx(0.2, 0.3, 0.008, c.steelDark, [ix, iy, -1.776]);
  bx(0.16, 0.13, 0.004, c.blackRubber, [ix, iy + 0.09, -1.771]);
  for (let i = 0; i < 7; i++) bx(0.15, 0.008, 0.006, c.hullGrey, [ix, iy + 0.03 + i * 0.0165 + 0.005, -1.768]);
  cyl(0.026, 0.008, c.steelDark, [ix + 0.04, iy - 0.07, -1.771], "z", 8);
  cyl(0.018, 0.01, c.cyanLed, [ix + 0.04, iy - 0.07, -1.768], "z", 8, 1.8);
  bx(0.012, 0.012, 0.006, c.redLed, [ix - 0.05, iy - 0.07, -1.771], [0, 0, 0], 2);
  bx(0.12, 0.025, 0.004, c.panelCream, [ix, iy - 0.12, -1.771]);
  for (let i = 0; i < 4; i++) bx(0.012, 0.014, 0.002, c.blackRubber, [ix - 0.04 + i * 0.026, iy - 0.12, -1.768]);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) bx(0.014, 0.014, 0.006, c.steel, [ix + sx * 0.108, iy + sy * 0.155, -1.778]);

  // ================================================================ VENT GRILLE
  begin("vent");
  const vx = -0.2;
  const vy = 2.3;
  bx(0.5, 0.03, 0.03, c.steelDark, [vx, vy + 0.135, -1.785]);
  bx(0.5, 0.03, 0.03, c.steelDark, [vx, vy - 0.135, -1.785]);
  for (const s of [1, -1]) bx(0.03, 0.24, 0.03, c.steelDark, [vx + s * 0.235, vy, -1.785]);
  bx(0.44, 0.24, 0.01, c.blackRubber, [vx, vy, -1.795]);
  for (let i = 0; i < 9; i++) bx(0.44, 0.016, 0.012, c.steelDark, [vx, vy - 0.1 + i * 0.025, -1.78], [30, 0, 0]);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) bx(0.02, 0.02, 0.006, c.steel, [vx + sx * 0.235, vy + sy * 0.135, -1.768]);
  bx(0.03, 0.14, 0.003, c.grime, [vx - 0.15, 2.1, -1.797]);
  bx(0.02, 0.1, 0.003, c.rust, [vx + 0.12, 2.12, -1.797]);

  // ================================================================ PLAQUES
  begin("plaques");
  bx(0.28, 0.12, 0.008, c.hazardYellow, [-1.45, 2.3, -1.796]);
  for (let i = 0; i < 4; i++) bx(0.02, 0.1, 0.004, c.hazardBlack, [-1.45 + (i - 1.5) * 0.06, 2.3, -1.79], [0, 0, 25]);
  bx(0.2, 0.012, 0.004, c.blackRubber, [-1.45, 2.22, -1.796]);
  bx(0.008, 0.12, 0.3, c.panelCream, [-1.796, 2.35, -0.4]);
  for (let i = 0; i < 5; i++) bx(0.004, 0.07, 0.02, c.blackRubber, [-1.79, 2.35, -0.5 + i * 0.05]);
  bx(0.004, 0.012, 0.26, c.orangePipe, [-1.79, 2.28, -0.4]);

  // ================================================================ FLUSH
  let n = 0;
  for (const g of groups) {
    for (const it of g.items.values()) {
      const merged = mergeGeometries(it.list, false);
      if (!merged) continue;
      const part = b.part(merged, it.color, { at: [0, 0, 0], name: `overhead.${g.name}.${n++}` });
      if (it.gl > 0) glow(part, it.gl);
    }
  }
}
```

<!-- call: shell -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { aim, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];
type Put = (cu: number, cv: number, sw: number, sh: number, roll: number, color: string, thick: number) => void;

export function buildShell({ b, P, M }: Ctx) {
  const R = rng(1979);
  const DK = M.deckTop[1]; // deck top, y = 0.08

  // Own colours (kept to a handful)
  const PANEL_A = "#a39d86";
  const PANEL_B = "#aea892";
  const PLATE_A = "#444749";
  const PLATE_B = "#404345";
  const SLAT = "#4a4d50";

  // ------------------------------------------------------------------------------------------------------------
  // Geometry bins: every small piece is added to a per-colour bin and merged into one part per colour at the end.
  const bins = new Map<string, THREE.BufferGeometry[]>();
  const push = (g: THREE.BufferGeometry, color: string, gl = 0) => {
    const h = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(h.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") h.deleteAttribute(k);
    h.computeVertexNormals(); // non-indexed: faceted shading
    const key = `${color}|${gl}`;
    const list = bins.get(key);
    if (list) list.push(h);
    else bins.set(key, [h]);
  };
  const _e = new THREE.Euler();
  const _q = new THREE.Quaternion();
  const xf = (g: THREE.BufferGeometry, c: V, rot?: V) => {
    if (rot) g.applyQuaternion(_q.setFromEuler(_e.set(rot[0], rot[1], rot[2])));
    g.translate(c[0], c[1], c[2]);
    return g;
  };
  const box = (color: string, c: V, s: V, rot?: V, gl = 0) =>
    push(xf(new THREE.BoxGeometry(s[0], s[1], s[2]), c, rot), color, gl);
  const cyl = (color: string, c: V, r: number, h: number, seg: number, axis: "x" | "y" | "z", rot?: V, gl = 0) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg, 1);
    if (axis === "x") g.rotateZ(-Math.PI / 2);
    else if (axis === "z") g.rotateX(Math.PI / 2);
    push(xf(g, c, rot), color, gl);
  };
  const rod = (color: string, p: V, q: V, r: number, seg = 6, open = true) => {
    const d = new THREE.Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    const len = d.length();
    if (len < 1e-6) return;
    const g = new THREE.CylinderGeometry(r, r, len, seg, 1, open);
    g.applyQuaternion(aim(d.clone().normalize()));
    g.translate((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2);
    push(g, color);
  };
  // hex-pyramid rivet / bolt head seated on a surface point, pointing along n
  const cone = (color: string, c: V, n: V, r: number, h: number) => {
    const g = new THREE.ConeGeometry(r, h, 6, 1);
    g.translate(0, h / 2, 0);
    g.applyQuaternion(aim(n));
    g.translate(c[0], c[1], c[2]);
    push(g, color);
  };

  // ------------------------------------------------------------------------------------------------------------
  // Wall frames: u runs to the viewer's right when facing the wall, v is height, d is depth into the room.
  interface Wall {
    C: (u: number, v: number, d: number) => V;
    S: (w: number, h: number, t: number) => V;
    roll: (a: number) => V;
    tilt: (a: number) => V;
    n: V;
  }
  const back: Wall = {
    C: (u, v, d) => [u, v, -1.8 + d],
    S: (w, h, t) => [w, h, t],
    roll: (a) => [0, 0, a],
    tilt: (a) => [a, 0, 0],
    n: [0, 0, 1],
  };
  const right: Wall = {
    C: (u, v, d) => [-1.8 + d, v, -u],
    S: (w, h, t) => [t, h, w],
    roll: (a) => [a, 0, 0],
    tilt: (a) => [0, 0, a],
    n: [1, 0, 0],
  };
  const end: Wall = {
    C: (u, v, d) => [1.8 - d, v, u],
    S: (w, h, t) => [t, h, w],
    roll: (a) => [a, 0, 0],
    tilt: (a) => [0, 0, a],
    n: [-1, 0, 0],
  };
  const endOut: Wall = {
    C: (u, v, d) => [1.9 + d, v, -u],
    S: (w, h, t) => [t, h, w],
    roll: (a) => [a, 0, 0],
    tilt: (a) => [0, 0, a],
    n: [1, 0, 0],
  };
  const wb = (w: Wall, color: string, u: number, v: number, wd: number, ht: number, t: number, off = 0, roll = 0, gl = 0) =>
    box(color, w.C(u, v, off + t / 2), w.S(wd, ht, t), roll ? w.roll(roll) : undefined, gl);
  const wrivet = (w: Wall, u: number, v: number, off = 0, color: string = P.steel, r = 0.013) =>
    cone(color, w.C(u, v, off), w.n, r, 0.012);

  // ------------------------------------------------------------------------------------------------------------
  // Hazard stripes: black base with slanted yellow bars, clipped to the strip footprint.
  const hazard = (u0: number, u1: number, v0: number, v1: number, pitch: number, put: Put) => {
    const du = u1 - u0;
    const dv = v1 - v0;
    const cu = (u0 + u1) / 2;
    const cv = (v0 + v1) / 2;
    put(cu, cv, du, dv, 0, P.hazardBlack, 0.008);
    const longU = du >= dv;
    const W = longU ? dv : du;
    const L = longU ? du : dv;
    const bw = pitch * 0.5;
    const bl = W * Math.SQRT2 - bw;
    for (let s = W / 2; s <= L - W / 2 + 1e-6; s += pitch) {
      if (longU) put(u0 + s, cv, bw, bl, Math.PI / 4, P.hazardYellow, 0.0095);
      else put(cu, v0 + s, bl, bw, Math.PI / 4, P.hazardYellow, 0.0095);
    }
  };
  const floorPut =
    (ax: "xz" | "zx"): Put =>
    (cu, cv, sw, sh, roll, color, thick) => {
      const x = ax === "xz" ? cu : cv;
      const z = ax === "xz" ? cv : cu;
      const sx = ax === "xz" ? sw : sh;
      const sz = ax === "xz" ? sh : sw;
      box(color, [x, DK + 0.003 + thick / 2, z], [sx, thick, sz], roll ? [0, roll, 0] : undefined);
    };
  const wallPut =
    (w: Wall): Put =>
    (cu, cv, sw, sh, roll, color, thick) =>
      wb(w, color, cu, cv, sw, sh, thick, 0, roll);

  // ------------------------------------------------------------------------------------------------------------
  // Seven-segment style stencil digits on a cream plate
  const SEG: Record<string, string> = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc",
    "7": "abc", "8": "abcdefg", "9": "abcdfg", A: "abcefg", "-": "g", E: "adefg", H: "bcefg",
    L: "def", P: "abefg", C: "adef",
  };
  const stencil = (w: Wall, u: number, v: number, text: string) => {
    const n = text.length;
    const dw = 0.05;
    const gap = 0.02;
    const tw = n * dw + (n - 1) * gap;
    const pw = tw + 0.07;
    const ph = 0.13;
    wb(w, P.panelCream, u, v, pw, ph, 0.006, 0);
    wb(w, P.hazardBlack, u, v + ph / 2 - 0.009, pw - 0.02, 0.006, 0.0075, 0);
    wb(w, P.hazardBlack, u, v - ph / 2 + 0.009, pw - 0.02, 0.006, 0.0075, 0);
    for (let i = 0; i < n; i++) {
      const cx = u - tw / 2 + dw / 2 + i * (dw + gap);
      const segs = SEG[text[i]] ?? "g";
      const sw = 0.042;
      const st = 0.009;
      const spec: Record<string, [number, number, number, number]> = {
        a: [0, 0.032, sw, st], g: [0, 0, sw, st], d: [0, -0.032, sw, st],
        f: [-0.0205, 0.016, st, 0.032], b: [0.0205, 0.016, st, 0.032],
        e: [-0.0205, -0.016, st, 0.032], c: [0.0205, -0.016, st, 0.032],
      };
      for (const s of segs) {
        const [dx, dy, ww, hh] = spec[s];
        wb(w, P.hazardBlack, cx + dx, v + dy, ww, hh, 0.004, 0.006);
      }
    }
    for (const sx of [-1, 1]) wrivet(w, u + sx * (pw / 2 - 0.012), v, 0.006, P.steelDark, 0.006);
  };

  const warnLabel = (w: Wall, u: number, v: number) => {
    wb(w, P.hazardYellow, u, v, 0.24, 0.17, 0.006, 0);
    wb(w, P.hazardBlack, u, v + 0.062, 0.22, 0.026, 0.004, 0.006);
    wb(w, P.hazardBlack, u, v - 0.08, 0.23, 0.007, 0.004, 0.006);
    wb(w, P.hazardBlack, u - 0.11, v - 0.01, 0.007, 0.15, 0.004, 0.006);
    wb(w, P.hazardBlack, u + 0.11, v - 0.01, 0.007, 0.15, 0.004, 0.006);
    wb(w, P.hazardBlack, u - 0.065, v - 0.002, 0.02, 0.06, 0.004, 0.006); // exclamation
    wb(w, P.hazardBlack, u - 0.065, v - 0.05, 0.02, 0.02, 0.004, 0.006);
    wb(w, P.hazardBlack, u + 0.035, v + 0.012, 0.11, 0.011, 0.004, 0.006);
    wb(w, P.hazardBlack, u + 0.03, v - 0.015, 0.1, 0.011, 0.004, 0.006);
    wb(w, P.hazardBlack, u + 0.04, v - 0.042, 0.12, 0.011, 0.004, 0.006);
  };

  const switchPanel = (w: Wall, u: number, v: number) => {
    wb(w, P.steelDark, u, v, 0.12, 0.18, 0.012, 0);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) wrivet(w, u + sx * 0.048, v + sy * 0.078, 0.012, P.steel, 0.007);
    for (let i = 0; i < 2; i++) {
      const tu = u - 0.027 + i * 0.054;
      wb(w, P.hullGrey, tu, v + 0.035, 0.03, 0.03, 0.012, 0.012);
      const dir = i === 0 ? 1 : -1;
      box(P.stainless, w.C(tu, v + 0.035 + dir * 0.01, 0.024 + 0.02), w.S(0.012, 0.012, 0.04), w.tilt(dir * 0.55));
    }
    wb(w, P.amber, u - 0.03, v - 0.028, 0.014, 0.014, 0.006, 0.012, 0, 1.4);
    wb(w, P.redLed, u + 0.03, v - 0.028, 0.014, 0.014, 0.006, 0.012, 0, 1.4);
    wb(w, P.panelCream, u, v - 0.06, 0.09, 0.011, 0.003, 0.012);
    wb(w, P.hazardBlack, u - 0.02, v - 0.06, 0.04, 0.005, 0.003, 0.015);
    wb(w, P.hazardBlack, u + 0.03, v - 0.06, 0.02, 0.005, 0.003, 0.015);
  };

  // Staining
  let layer = 0;
  const nextOff = () => 0.001 + (layer++ % 8) * 0.0015;
  const rust = (w: Wall, u: number, v: number, s = 1) => {
    wb(w, P.rust, u, v, 0.18 * s, 0.07 * s, 0.002, nextOff());
    wb(w, P.rust, u - 0.06 * s, v - 0.045 * s, 0.09 * s, 0.05 * s, 0.002, nextOff());
    wb(w, P.rust, u + 0.07 * s, v + 0.03 * s, 0.07 * s, 0.04 * s, 0.002, nextOff());
    wb(w, P.rust, u - 0.05 * s, v - 0.14 * s, 0.012 * s, 0.15 * s, 0.002, nextOff());
    wb(w, P.rust, u + 0.025 * s, v - 0.11 * s, 0.01 * s, 0.1 * s, 0.002, nextOff());
  };
  const grimeStreak = (w: Wall, u: number, v: number, len: number) => {
    wb(w, P.grime, u, v - len * 0.18, 0.06, len * 0.36, 0.002, nextOff());
    wb(w, P.grime, u + 0.004, v - len * 0.5, 0.04, len * 0.4, 0.002, nextOff());
    wb(w, P.grime, u - 0.003, v - len * 0.85, 0.02, len * 0.3, 0.002, nextOff());
  };

  // Cables
  const cable = (w: Wall, pts: [number, number][], r = 0.012) => {
    for (let i = 0; i < pts.length - 1; i++)
      rod(P.blackRubber, w.C(pts[i][0], pts[i][1], r + 0.004), w.C(pts[i + 1][0], pts[i + 1][1], r + 0.004), r, 6, true);
  };
  const cableRun = (w: Wall, uA: number, uB: number, v: number, sag: number, count: number) => {
    for (let c = 0; c < count; c++) {
      const pts: [number, number][] = [];
      const N = 8;
      for (let k = 0; k <= N; k++) {
        const s = k / N;
        pts.push([uA + (uB - uA) * s, v + (c - (count - 1) / 2) * 0.028 - sag * (1 + 0.15 * c) * 4 * s * (1 - s)]);
      }
      cable(w, pts);
    }
    for (const u of [uA, uB]) {
      wb(w, P.steelDark, u, v, 0.07, 0.03 * count + 0.03, 0.03, 0);
      wrivet(w, u, v, 0.03, P.steel, 0.009);
    }
  };

  // Conduits
  const conduit = (w: Wall, u: number, v0: number, v1: number, r: number, color: string, coupling: string) => {
    cyl(color, w.C(u, (v0 + v1) / 2, r + 0.004), r, v1 - v0, 8, "y");
    for (let v = v0 + 0.25; v < v1 - 0.05; v += 0.55) {
      wb(w, P.steelDark, u, v, 2 * r + 0.03, 0.035, 2 * r + 0.012, 0.0);
      wb(w, P.steelDark, u, v, 0.05, 0.04, 0.012, 0);
    }
    for (const v of [v0 + (v1 - v0) * 0.33, v0 + (v1 - v0) * 0.72])
      cyl(coupling, w.C(u, v, r + 0.004), r * 1.35, 0.05, 8, "y");
  };

  // ============================================================================================================
  // DECK
  box(P.deckGrey, [0, DK / 2, 0], [3.8, DK, 3.8]);
  const gx = [-1.9, -0.95, 0, 0.95, 1.9];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      box((i + j) & 1 ? PLATE_B : PLATE_A, [(gx[i] + gx[i + 1]) / 2, DK + 0.003, (gx[j] + gx[j + 1]) / 2], [0.94, 0.006, 0.94]);

  // Grating
  const grating = (x0: number, x1: number, z0: number, z1: number, slatsAlong: "x" | "z") => {
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    box(P.grating, [cx, DK + 0.006, cz], [x1 - x0, 0.012, z1 - z0]);
    const fw = 0.025;
    box(P.steelDark, [cx, DK + 0.01, z0 + fw / 2], [x1 - x0, 0.02, fw]);
    box(P.steelDark, [cx, DK + 0.01, z1 - fw / 2], [x1 - x0, 0.02, fw]);
    box(P.steelDark, [x0 + fw / 2, DK + 0.01, cz], [fw, 0.02, z1 - z0]);
    box(P.steelDark, [x1 - fw / 2, DK + 0.01, cz], [fw, 0.02, z1 - z0]);
    if (slatsAlong === "z") {
      for (let x = x0 + 0.05; x < x1 - 0.04; x += 0.06) box(SLAT, [x, DK + 0.015, cz], [0.022, 0.008, z1 - z0 - 0.05]);
    } else {
      for (let z = z0 + 0.05; z < z1 - 0.04; z += 0.06) box(SLAT, [cx, DK + 0.015, z], [x1 - x0 - 0.05, 0.008, 0.022]);
    }
  };
  grating(-1.0, 1.7, -1.0, -0.76, "z"); // back aisle
  grating(-0.95, 0.25, 1.05, 1.6, "x"); // front walkway
  grating(1.05, 1.58, -0.5, 0.8, "z"); // hatch walkway

  // Hazard borders on the deck
  hazard(-1.1, 1.75, -1.1, -1.03, 0.1, floorPut("xz")); // back run front edge
  hazard(-1.03, 1.0, -1.1, -1.03, 0.1, floorPut("zx")); // right run front edge
  hazard(-0.55, 0.85, 1.62, 1.7, 0.1, floorPut("zx")); // hatch sill

  // Bolts on the floor plates (only where they can be seen)
  const inR = (x: number, z: number, x0: number, x1: number, z0: number, z1: number) => x > x0 && x < x1 && z > z0 && z < z1;
  const hidden = (x: number, z: number) =>
    x < -1.12 ||
    (z < -1.12 && x < 1.8) ||
    inR(x, z, -1.06, 1.06, -0.82, 1.02) ||
    inR(x, z, -1.04, 1.74, -1.12, -0.7) ||
    inR(x, z, -0.97, 0.27, 1.03, 1.62) ||
    inR(x, z, 1.03, 1.72, -0.55, 0.85) ||
    inR(x, z, 0.4, 1.0, 1.15, 1.75) ||
    x > 1.74;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const x = (gx[i] + gx[i + 1]) / 2 + sx * 0.4;
          const z = (gx[j] + gx[j + 1]) / 2 + sz * 0.4;
          if (!hidden(x, z)) cone(P.steel, [x, DK + 0.006, z], [0, 1, 0], 0.016, 0.012);
        }

  // Floor access hatch
  {
    const hx = 0.7;
    const hz = 1.45;
    box(P.steelDark, [hx, DK + 0.011, hz - 0.265], [0.56, 0.02, 0.04]);
    box(P.steelDark, [hx, DK + 0.011, hz + 0.265], [0.56, 0.02, 0.04]);
    box(P.steelDark, [hx - 0.26, DK + 0.011, hz], [0.04, 0.02, 0.49]);
    box(P.steelDark, [hx + 0.26, DK + 0.011, hz], [0.04, 0.02, 0.49]);
    box(P.steel, [hx, DK + 0.012, hz], [0.48, 0.008, 0.48]);
    box(P.hullGrey, [hx, DK + 0.022, hz], [0.22, 0.012, 0.034]);
    box(P.steelDark, [hx - 0.11, DK + 0.017, hz], [0.03, 0.014, 0.034]);
    box(P.steelDark, [hx + 0.11, DK + 0.017, hz], [0.03, 0.014, 0.034]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cone(P.steelDark, [hx + sx * 0.2, DK + 0.016, hz + sz * 0.2], [0, 1, 0], 0.018, 0.014);
    box(P.hazardYellow, [hx, DK + 0.0165, hz - 0.18], [0.3, 0.002, 0.03]);
    box(P.hazardBlack, [hx - 0.06, DK + 0.0175, hz - 0.18], [0.02, 0.002, 0.018]);
    box(P.hazardBlack, [hx + 0.02, DK + 0.0175, hz - 0.18], [0.1, 0.002, 0.012]);
  }

  // Floor wear: scuffs, stains, spills
  const scuff = (x: number, z: number, sx: number, sz: number, color: string, y: number) =>
    box(color, [x, DK + 0.006 + y, z], [sx, 0.002, sz]);
  scuff(0.2, -0.88, 2.2, 0.09, P.grime, 0.0006);
  scuff(-0.5, 1.3, 0.12, 1.0, P.grime, 0.0012);
  scuff(0.9, 0.3, 0.8, 0.14, P.grime, 0.0018);
  scuff(1.3, -0.15, 0.1, 0.9, P.grime, 0.0024);
  scuff(0.1, 1.7, 0.7, 0.1, P.grime, 0.003);
  scuff(-0.75, 1.0, 0.24, 0.22, P.rust, 0.0036);
  scuff(-0.7, 1.08, 0.12, 0.08, P.rust, 0.0042);
  scuff(1.45, 1.0, 0.3, 0.2, P.grime, 0.0048);
  scuff(1.55, 1.15, 0.1, 0.1, P.rust, 0.0054);

  // ============================================================================================================
  // BULKHEADS
  const beiges = [P.wallBeige, PANEL_A, PANEL_B, P.wallBeige];
  const rows = [DK, 0.95, 1.5, 2.3, 2.6];
  const buildWall = (w: Wall, endSide: 1 | -1, uHi: number) => {
    const uLo = -1.9;
    wb(w, P.wallDark, (uLo + uHi) / 2, 1.34, uHi - uLo, 2.52, 0.06, -0.1); // backing
    for (let r = 0; r < 4; r++)
      for (let i = 0; i < 6; i++) {
        const u = -1.8 + 0.3 + 0.6 * i;
        const col = r === 3 && i % 3 === 1 ? P.panelCream : beiges[Math.floor(R() * beiges.length)];
        wb(w, col, u, (rows[r] + rows[r + 1]) / 2, 0.58, rows[r + 1] - rows[r], 0.04, -0.04);
      }
    for (let k = 0; k <= 6; k++) wb(w, P.wallDark, -1.8 + 0.6 * k, 1.34, 0.05, 2.52, 0.02, 0); // ribs
    for (const y of [0.95, 1.5, 2.3]) {
      wb(w, P.wallDark, 0, y, 3.6, 0.07, 0.02, 0);
      wb(w, P.steelDark, 0, y + 0.0375, 3.6, 0.005, 0.022, 0); // dark ribbed lip
      wb(w, P.steelDark, 0, y - 0.0375, 3.6, 0.005, 0.022, 0);
    }
    wb(w, P.wallDark, endSide * 1.85, 1.34, 0.1, 2.52, 0.02, 0); // end strip
    wb(w, P.wallDark, 0, 2.575, 3.6, 0.05, 0.03, 0); // top rail
    // skirting
    wb(w, P.hullGrey, 0, 0.16, 3.6, 0.16, 0.02, 0);
    wb(w, P.grime, 0, 0.105, 3.6, 0.05, 0.024, 0);
    wb(w, P.steelDark, 0, 0.245, 3.6, 0.015, 0.026, 0);
    // rivet rows
    for (const y of [0.95, 1.5, 2.3]) for (let u = -1.6; u <= 1.65; u += 0.4) wrivet(w, u, y, 0.02);
    for (let k = 0; k <= 6; k++) for (const y of [1.2, 1.9]) wrivet(w, -1.8 + 0.6 * k, y, 0.02);
    for (let u = -1.6; u <= 1.65; u += 0.4) wrivet(w, u, 0.16, 0.02, P.steelDark, 0.011);
    // scuffed lower panels
    for (const u of [-1.2, 0.3, 1.35]) wb(w, P.grime, u + R() * 0.2, 0.4, 0.3 + R() * 0.2, 0.05, 0.002, nextOff());
  };
  buildWall(back, 1, 1.9);
  buildWall(right, -1, 1.84);

  // Back wall dressing
  stencil(back, 1.45, 2.2, "037");
  stencil(back, -0.95, 2.15, "A-2");
  warnLabel(back, 1.0, 1.25);
  warnLabel(back, 1.62, 2.0);
  switchPanel(back, -0.95, 1.15);
  switchPanel(back, 1.62, 1.12);
  rust(back, 1.3, 1.62, 1);
  rust(back, -0.5, 2.45, 0.9);
  rust(back, 1.7, 1.25, 0.8);
  rust(back, 0.35, 1.2, 0.7);
  grimeStreak(back, 0.1, 2.0, 0.5);
  grimeStreak(back, 1.1, 1.5, 0.4);
  grimeStreak(back, -0.7, 2.2, 0.35);
  grimeStreak(back, 1.55, 2.5, 0.6);
  conduit(back, 1.84, DK, 2.6, 0.03, P.orangePipe, P.steelDark);
  conduit(back, 1.785, DK, 2.6, 0.018, P.copper, P.steelDark);
  conduit(back, -1.72, 2.05, 2.6, 0.02, P.copper, P.steelDark);
  cableRun(back, 1.3, 1.75, 2.5, 0.25, 3);
  cableRun(back, -1.7, -1.0, 2.45, 0.25, 2);

  // Right wall dressing (u = -z)
  stencil(right, 1.2, 2.25, "C-37");
  stencil(right, 0.2, 2.25, "462");
  stencil(right, -1.45, 1.95, "117");
  warnLabel(right, -1.45, 1.4);
  warnLabel(right, -0.2, 1.1);
  switchPanel(right, -1.5, 1.2);
  rust(right, 0.4, 2.1, 1);
  rust(right, -1.2, 2.3, 0.9);
  rust(right, 1.5, 2.4, 0.8);
  grimeStreak(right, -0.6, 2.2, 0.5);
  grimeStreak(right, 0.9, 2.15, 0.4);
  grimeStreak(right, -1.65, 1.7, 0.5);
  grimeStreak(right, 1.65, 2.5, 0.5);
  conduit(right, -1.84, DK, 2.6, 0.03, P.orangePipe, P.steelDark);
  conduit(right, -1.785, DK, 2.6, 0.018, P.copper, P.steelDark);
  conduit(right, 1.72, 2.05, 2.6, 0.02, P.copper, P.steelDark);
  cableRun(right, -1.0, -1.75, 2.45, 0.22, 3);
  {
    // hanging bundle with plug
    for (let c = 0; c < 3; c++) {
      const pts: [number, number][] = [];
      for (let k = 0; k <= 8; k++) pts.push([-1.3 + c * 0.028 + 0.025 * Math.sin(k * 0.9 + c), 2.55 - k * 0.125]);
      cable(right, pts);
    }
    wb(right, P.steelDark, -1.3, 2.55, 0.1, 0.04, 0.03, 0);
    wb(right, P.steelDark, -1.27, 1.5, 0.09, 0.09, 0.05, 0.004);
    wb(right, P.hullGrey, -1.27, 1.5, 0.06, 0.06, 0.012, 0.054);
    wb(right, P.hazardBlack, -1.27, 1.5, 0.05, 0.012, 0.006, 0.066);
  }

  // ============================================================================================================
  // LEFT END BULKHEAD with round hatch (octagonal frame)
  {
    const zc = 0.15;
    const yc = 0.9;
    const h = 0.7;
    const X = 1.85;
    const slab = (color: string, z0: number, z1: number, y0: number, y1: number) =>
      box(color, [X, (y0 + y1) / 2, (z0 + z1) / 2], [0.1, y1 - y0, z1 - z0]);
    slab(P.wallBeige, -0.95, zc - h, DK, 2.6);
    slab(PANEL_A, zc + h, 1.25, DK, 2.6);
    slab(PANEL_B, zc - h, zc + h, DK, yc - h);
    slab(P.wallBeige, zc - h, zc + h, yc + h, 2.6);

    // corner gussets fill the square between the octagon and the cut-out
    const k = h * Math.tan(Math.PI / 8);
    for (const sz of [-1, 1])
      for (const sy of [-1, 1]) {
        const s = new THREE.Shape();
        s.moveTo(h * sz, k * sy);
        s.lineTo(h * sz, h * sy);
        s.lineTo(k * sz, h * sy);
        s.closePath();
        const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
        g.translate(0, 0, -0.05);
        g.rotateY(-Math.PI / 2);
        g.translate(X, yc, zc);
        push(g, P.wallDark);
      }

    // octagonal frame ring, seal ring, bolts
    for (let i = 0; i < 8; i++) {
      const th = (i * Math.PI) / 4;
      const sy = Math.sin(th);
      const cz = Math.cos(th);
      box(P.steelDark, [1.8325, yc + 0.65 * sy, zc + 0.65 * cz], [0.145, 0.62, 0.1], [-th, 0, 0]);
      box(P.blackRubber, [1.84, yc + 0.5875 * sy, zc + 0.5875 * cz], [0.12, 0.52, 0.025], [-th, 0, 0]);
      const t2 = th + Math.PI / 8;
      cone(P.steel, [1.76, yc + 0.66 * Math.sin(t2), zc + 0.66 * Math.cos(t2)], [-1, 0, 0], 0.02, 0.016);
      box(P.steel, [1.76, yc + 0.65 * sy, zc + 0.65 * cz], [0.01, 0.1, 0.012], [-th, 0, 0]);
    }

    // room-face ribs and seams
    for (const u of [-0.925, 1.225]) wb(end, P.wallDark, u, 1.34, 0.05, 2.52, 0.02, 0);
    for (const y of [0.95, 1.5]) {
      wb(end, P.wallDark, -0.75, y, 0.4, 0.07, 0.02, 0);
      wb(end, P.wallDark, 1.05, y, 0.4, 0.07, 0.02, 0);
      for (const u of [-0.8, -0.65, 1.0, 1.15]) wrivet(end, u, y, 0.02);
    }
    wb(end, P.wallDark, 0.15, 2.3, 2.2, 0.07, 0.02, 0);
    for (let u = -0.8; u <= 1.2; u += 0.4) wrivet(end, u, 2.3, 0.02);
    wb(end, P.wallDark, 0.15, 2.575, 2.2, 0.05, 0.03, 0);
    // skirting
    wb(end, P.hullGrey, -0.75, 0.14, 0.4, 0.12, 0.02, 0);
    wb(end, P.hullGrey, 1.05, 0.14, 0.4, 0.12, 0.02, 0);
    wb(end, P.grime, -0.75, 0.095, 0.4, 0.04, 0.024, 0);
    wb(end, P.grime, 1.05, 0.095, 0.4, 0.04, 0.024, 0);

    // outer face ribs
    for (const u of [0.925, -1.225]) wb(endOut, P.wallDark, u, 1.34, 0.05, 2.52, 0.02, 0);
    wb(endOut, P.wallDark, -0.15, 2.3, 2.2, 0.07, 0.02, 0);
    wb(endOut, P.wallDark, -0.15, 1.5, 2.2, 0.07, 0.02, 0);
    stencil(endOut, -1.05, 1.9, "A1");

    // hazard border around the cut-out (room face)
    const ep = wallPut(end);
    hazard(-0.63, -0.55, 0.2, 1.6, 0.11, ep);
    hazard(0.85, 0.93, 0.2, 1.6, 0.11, ep);
    hazard(-0.63, 0.93, 1.6, 1.68, 0.11, ep);

    // wheel lock handle on the right wall segment
    const wz = 1.05;
    const wy = 0.9;
    box(P.steelDark, [1.785, wy, wz], [0.02, 0.22, 0.22]);
    cyl(P.steelDark, [1.745, wy, wz], 0.04, 0.06, 8, "x");
    for (let i = 0; i < 3; i++) box(P.steel, [1.72, wy, wz], [0.022, 0.28, 0.024], [(i * Math.PI) / 3, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      cyl(P.hazardYellow, [1.72, wy + 0.14 * Math.cos(a), wz + 0.14 * Math.sin(a)], 0.02, 0.04, 6, "x");
    }
    box(P.steel, [1.76, wy, (wz + 0.86) / 2], [0.03, 0.04, wz - 0.86]); // lock bar to the frame
    box(P.steelDark, [1.76, wy, 0.86], [0.05, 0.07, 0.03]);
    wb(end, P.hazardYellow, 1.05, 1.2, 0.2, 0.08, 0.006, 0);
    wb(end, P.hazardBlack, 1.05, 1.2, 0.17, 0.012, 0.004, 0.006);
    wb(end, P.hazardBlack, 1.05, 1.18 - 0.02, 0.12, 0.008, 0.004, 0.006);

    // stains and wall furniture on the bulkhead
    switchPanel(end, -0.75, 1.25);
    rust(end, 1.05, 1.9, 0.9);
    grimeStreak(end, -0.7, 2.1, 0.5);
    stencil(end, -0.75, 1.9, "B-4");
  }

  // ============================================================================================================
  // Flush the bins: one merged part per colour (glowing lights stay separate so only they emit).
  let n = 0;
  for (const [key, geos] of bins) {
    const [color, g] = key.split("|");
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], name: `shell_${n++}` });
    if (Number(g) > 0) glow(part, Number(g));
  }
}
```