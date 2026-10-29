<!-- call: plan -->

```json
{
  "name": "Nostromo Galley",
  "description": "A retro-futuristic spaceship mess and galley corner from the USCSS Nostromo (Alien, 1979): ribbed bone-coloured walls, a cream counter with beverage and warming equipment, a wall bank of glowing CRT monitors, the iconic molded mess table with attached stools, and a bristling ceiling of pipes and conduit over a steel deck.",
  "builderName": "nostromoGalley",
  "size": [4.6, 2.7, 5.0],
  "layout": "A cut-away room section: the viewer looks in through the open +Z face. A steel deck plate floor covers the whole footprint and rests on y = 0 (only floor-touching part). The back wall (z = -2.5) carries the galley: a counter run 0.95 m high with equipment, and above it a wall-mounted CRT monitor bank. The left wall (x = -2.3) carries lockers and stacked storage crates; the right wall (x = +2.3) carries a ribbed panel section and a round pressure hatch. A ceiling slab closes the top with pipes, conduit runs and two cone lamps hanging over the mess table, which stands centre-front with its cluster of attached swivel stools. Style on every part: warm bone and cream molded-plastic surfaces like airliner interiors, dark olive-grey machinery, corrugated ribbing on every flat wall, warning-yellow stripe accents, rust and copper fittings, amber and green glowing CRT screens, everything chunky, functional and 1979-industrial.",
  "palette": {
    "floor": "#3f4038",
    "wall": "#c2bcab",
    "rib": "#8f8a7c",
    "machine": "#aeb2ac",
    "cabinet": "#d6cfc0",
    "tabletop": "#e8e2d2",
    "stool": "#cfc6b2",
    "iron": "#4c5054",
    "pipeCopper": "#6e5a3c",
    "pipeSteel": "#7a8088",
    "warning": "#e7b814",
    "rust": "#8a4a26",
    "orange": "#c46a2c",
    "olive": "#6b6a4c",
    "brass": "#b08d3e",
    "black": "#22221f",
    "rubber": "#2c2c28",
    "screenAmber": "#ffb23e",
    "screenGreen": "#5cff8a",
    "lampGlow": "#fff3c8",
    "chalk": "#efe9db"
  },
  "mounts": {
    "deckTop": [0, 0.06, 0],
    "backWallFace": [0, 1.25, -2.44],
    "leftWallFace": [-2.28, 1.2, 0.5],
    "ceilingLine": [0, 2.66, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "roomShell",
      "builds": "The room section itself. Steel deck floor of rectangular plates with seam grooves, a raised grating strip near the back, all in floor colour with rust stains and a warning-yellow painted stripe across the doorway end. Three walls: back wall, left wall, right wall, built as chunky ribbed panel walls — flat wall-coloured panels with repeated vertical rib slats in rib colour, dark seam lines, corner posts in iron, a black kick skirting at the bottom and a pipe-and-conduit raceway band at mid height with small valve wheels in brass and rust. The right wall holds a round pressure hatch: lathe-built ring, rivet ring, spokes, a warning-yellow and black chevron stripe band around it and a small stencil-style plate. The ceiling slab closes the top with recessed panel frames and two square light-well openings the ceiling-services part drops into. Wall edges frame the open +Z face with a thick girder border so the cut-away reads as a ship section.",
      "box": [[-2.3, 0, -2.5], [2.3, 2.7, 2.5]],
      "attaches": "Owns the whole footprint; its floor top is mount deckTop that galleyCounter, messTable and lockersShelf stand on; its back wall face is mount backWallFace for galleyCounter and monitorBank; its left wall face is mount leftWallFace for lockersShelf; its ceiling underside is mount ceilingLine for ceilingServices.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "ceilingServices",
      "builds": "Everything under the ceiling: a dense overhead services run. Two large parallel copper pipes (pipeCopper) running front-to-back with flanged ring joints every metre and elbow bends, a bundle of steel conduit pipes (pipeSteel) in a cable tray, a smaller olive cable duct, hanging black cable loops with clip rings, and two cone pendant lamps in iron hanging on short stems over the mess table position, each with a glowing warm lampGlow shade disc. Add a small junction box in machine grey with an orange stripe, a hanging hose reel with a coiled rubber hose, and riveted mounting brackets in iron connecting everything to mount ceilingLine. Pipes must not drop below y = 2.05 so the room stays open.",
      "box": [[-2.3, 2.05, -2.5], [2.3, 2.7, 2.5]],
      "attaches": "Hangs from mount ceilingLine on the roomShell ceiling underside; its lamp cones hang above the messTable footprint.",
      "joints": [],
      "floor": false,
      "budget": 110
    },
    {
      "id": "galleyCounter",
      "builds": "The galley counter run along the back wall, standing on mount deckTop and backing onto mount backWallFace. A machine-grey cabinet base with cream cabinet doors (thin seam gaps, small black pulls), a chunky ivory worktop with a raised lip, and equipment across it: a tall beverage dispenser tower in chalk with an orange stripe band, two brass dispensing nozzles and a small drip tray; a countertop warming oven with a dark glass door, rust handle and amber indicator jewel lights; a sink recess with a steel tap and drying rack; a wall shelf above the worktop holding mugs and canisters in olive, rust and chalk. A tiled-ish backsplash strip in machine grey with a warning-yellow stripe, a rubber floor mat in front, and a small wall-mounted extinguisher in rust. Details read as seated parts: indicator lights, valve knobs, seams, stripe bands each their own colour.",
      "box": [[-2.2, 0.06, -2.5], [2.2, 1.3, -1.45]],
      "attaches": "Stands on mount deckTop, backs onto mount backWallFace; its worktop height 1.2 m leaves clear wall above for monitorBank.",
      "joints": [],
      "floor": false,
      "budget": 180
    },
    {
      "id": "monitorBank",
      "builds": "The wall-mounted monitor console above the galley counter, meeting mount backWallFace. An iron mounting frame bolted to the wall carries a bank of four CRT screens in dark casings: two larger green glowing screens with scanline frames and surrounding bezels, one amber glowing screen, one small amber data readout, all with glow (self-lit) treatment on the screen faces only. Below and beside the screens: a chunky control panel in machine grey with rows of chunky switches (black toggles with orange and warning-coloured caps), push buttons in brass and rust, and a stencil-style data placard. Cable ducts in black run from the frame into the wall, and a small reel of coiled cable hangs at one end. Everything sits between y 1.35 and 2.15, clear of the counter below.",
      "box": [[-2.2, 1.3, -2.44], [1.2, 2.2, -2.0]],
      "attaches": "Bolts onto mount backWallFace above the galleyCounter worktop line; nothing below y 1.35 so the counter's shelf clears it.",
      "joints": [],
      "floor": false,
      "budget": 140
    },
    {
      "id": "messTable",
      "builds": "The iconic Nostromo mess table, centre-front, standing on mount deckTop. A chunky ivory molded table top (rounded octagon-ish slab, tabletop colour) on a heavy dark iron pedestal base with a ribbed column and a round foot. Around it, six attached-style swivel stools: each a molded beige stool seat (stool colour) on a slim dark column with a weighted black base, arranged around the table at varied heights and slight rotations so it feels lived-in. On the table: small cream cups, a metal tray with recessed eating compartments, a small brass ashtray, a lidded beaker, and a pack of cards fan in chalk with black pips. A floor mat in rubber under the stool cluster. Keep the silhouette bold and readable from the front view.",
      "box": [[-1.7, 0, -1.0], [1.7, 1.05, 1.7]],
      "attaches": "Stands on mount deckTop in the open centre of the room; its stools stay inside its box, clear of the counter at z < -1.45.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "lockersShelf",
      "builds": "Left-wall storage against mount leftWallFace, standing on mount deckTop. A row of four tall crew lockers in olive with cream door frames, vent slats in black, small number plates and black latches; above them a wall-mounted rack of equipment cases in orange and rust with warning-yellow stripes. Beside the lockers a floor-standing stack: two olive supply crates with stencil-style plates and strap bands, a small drum in machine grey with a rust ring, and a few individually placed props — a black toolbox with a brass clasp, a stack of metal ration tins in chalk and machine grey, a hanging clip lamp in iron with a warm lampGlow bulb. All details (slats, plates, latches, bands) as small parts in their own colours.",
      "box": [[-2.3, 0, -1.3], [-1.15, 2.3, 2.1]],
      "attaches": "Stands on mount deckTop and backs onto mount leftWallFace on the roomShell's left wall; keeps its right face at x = -1.15 clear of the messTable.",
      "joints": [],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: monitorBank -->

```ts
import * as THREE from "three";
import { createBuilder, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMonitorBank({ b, J, P, M }: Ctx) {
  const ZWALL = M.backWallFace[2];
  const FRONT = ZWALL + 0.34;
  const IRON = P.iron;
  const BLACK = P.black;
  const MACHINE = P.machine;
  const OLIVE = P.olive;
  const RUST = P.rust;
  const ORANGE = P.orange;
  const BRASS = P.brass;
  const WARNING = P.warning;
  const GREEN = P.screenGreen;
  const AMBER = P.screenAmber;
  const CHALK = P.chalk;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      name: `monitorBank_${name}`,
      group: "monitorBank",
      ...options,
    });

  const box = (
    name: string,
    at: [number, number, number],
    size: [number, number, number],
    color: string,
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name);

  const cylinder = (
    name: string,
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    segments = 10,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      at,
      name,
      { dir: [0, 0, 1], axis: "y" },
    );

  const frontBox = (
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    d: number,
    color: string,
    z = FRONT,
  ) => box(name, [x, y, z], [w, h, d], color);

  // Heavy mounting rails, deliberately visible around the CRT bank.
  box("mountRailTop", [-0.5, 2.18, ZWALL + 0.08], [3.25, 0.075, 0.14], IRON);
  box("mountRailBottom", [-0.5, 1.34, ZWALL + 0.08], [3.25, 0.075, 0.14], IRON);
  box("mountRailLeft", [-2.14, 1.76, ZWALL + 0.08], [0.075, 0.85, 0.14], IRON);
  box("mountRailRight", [1.10, 1.76, ZWALL + 0.08], [0.075, 0.85, 0.14], IRON);

  for (const x of [-2.04, -0.5, 0.82, 1.02]) {
    cylinder("mountBolt", [x, 2.135, FRONT - 0.12], 0.025, 0.025, BRASS, 8);
    cylinder("mountBolt", [x, 1.385, FRONT - 0.12], 0.025, 0.025, BRASS, 8);
  }

  type ScreenSpec = {
    key: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    rows: number;
  };

  const screens: ScreenSpec[] = [
    { key: "greenLeft", x: -1.63, y: 1.78, w: 0.78, h: 0.49, color: GREEN, rows: 5 },
    { key: "greenCentre", x: -0.78, y: 1.78, w: 0.78, h: 0.49, color: GREEN, rows: 5 },
    { key: "amberMain", x: 0.08, y: 1.78, w: 0.70, h: 0.49, color: AMBER, rows: 5 },
    { key: "amberReadout", x: 0.79, y: 1.91, w: 0.39, h: 0.25, color: AMBER, rows: 3 },
  ];

  for (const s of screens) {
    const casingW = s.w + 0.15;
    const casingH = s.h + 0.16;
    const casingZ = ZWALL + 0.17;
    const faceZ = ZWALL + 0.335;

    // Squared, slightly stepped CRT shell.
    frontBox(`${s.key}_case`, s.x, s.y, casingW, casingH, 0.26, OLIVE, casingZ);
    frontBox(`${s.key}_hood`, s.x, s.y + casingH * 0.48, s.w + 0.05, 0.045, BLACK, faceZ - 0.035);

    // Four separate bezel rails make the molded screen surround readable.
    const rail = 0.045;
    frontBox(`${s.key}_bezelTop`, s.x, s.y + s.h / 2 + rail / 2, s.w + 0.055, rail, BLACK, faceZ - 0.012);
    frontBox(`${s.key}_bezelBottom`, s.x, s.y - s.h / 2 - rail / 2, s.w + 0.055, rail, BLACK, faceZ - 0.012);
    frontBox(`${s.key}_bezelLeft`, s.x - s.w / 2 - rail / 2, s.y, rail, s.h + 0.04, BLACK, faceZ - 0.012);
    frontBox(`${s.key}_bezelRight`, s.x + s.w / 2 + rail / 2, s.y, rail, s.h + 0.04, BLACK, faceZ - 0.012);

    const screen = frontBox(`${s.key}_glowFace`, s.x, s.y, s.w, s.h, 0.026, s.color, faceZ);
    glow(screen, 1.45);

    // Scanline bars and blocky phosphor glyphs are separate geometry seated on the lit face.
    for (let r = 1; r < s.rows; r++) {
      const yy = s.y - s.h / 2 + (r * s.h) / s.rows;
      const scan = frontBox(`${s.key}_scan${r}`, s.x, yy, s.w * 0.92, 0.009, 0.008, s.color, faceZ + 0.02);
      glow(scan, 0.9);
    }

    const glyphY = s.y - s.h * 0.22;
    for (let g = 0; g < (s.key === "amberReadout" ? 3 : 5); g++) {
      const gw = s.w * (0.12 + (g % 2) * 0.07);
      const gx = s.x - s.w * 0.34 + g * s.w * 0.16;
      const glyph = frontBox(`${s.key}_glyph${g}`, gx, glyphY, gw, 0.018, 0.009, s.color, faceZ + 0.022);
      glow(glyph, 1.0);
    }

    if (s.key !== "amberReadout") {
      cylinder(`${s.key}_cornerLamp`, [s.x + s.w / 2 - 0.055, s.y - s.h / 2 - 0.075, faceZ + 0.01], 0.018, 0.018, WARNING, 8);
    }
  }

  // Small status lamps mounted between the larger CRTs.
  for (const [i, x] of [-1.98, -1.28, -0.38, 0.48].entries()) {
    cylinder("statusLamp" + i, [x, 1.43, FRONT + 0.015], 0.018, 0.018, i % 2 ? ORANGE : WARNING, 8);
  }

  // Control console under the screens.
  frontBox("controlPanelBody", [-0.53, 1.405, 0][0], 1.405, 2.72, 0.16, 0.22, MACHINE, ZWALL + 0.23);
  frontBox("controlPanelLip", -0.53, 1.505, 2.82, 0.035, 0.25, IRON, ZWALL + 0.27);
  frontBox("controlPanelShadow", -0.53, 1.32, 2.75, 0.035, 0.22, BLACK, ZWALL + 0.25);

  // Three rows of chunky switches.
  const switchXs = [-1.65, -1.31, -0.97, -0.63, -0.29, 0.05, 0.39, 0.73];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < switchXs.length; i++) {
      const x = switchXs[i];
      const y = 1.375 + row * 0.064;
      box(`switchStem_${row}_${i}`, [x, y, ZWALL + 0.385], [0.055, 0.035, 0.035], BLACK);
      const capColor = i % 5 === 0 ? WARNING : i % 3 === 0 ? ORANGE : BLACK;
      box(`switchCap_${row}_${i}`, [x, y + 0.018, ZWALL + 0.415], [0.032, 0.045, 0.045], capColor);
    }
  }

  // Push-button cluster at the right hand side.
  for (let i = 0; i < 5; i++) {
    const x = 0.72 + (i % 2) * 0.115;
    const y = 1.37 + Math.floor(i / 2) * 0.06;
    cylinder(`pushButton${i}`, [x, y, ZWALL + 0.405], 0.025, 0.026, i === 2 ? WARNING : i % 2 ? BRASS : RUST, 8);
  }

  // A narrow black cable duct drops from the CRT frame into the control panel.
  box("cableDuctLeft", [-2.01, 1.56, ZWALL + 0.20], [0.10, 0.34, 0.12], BLACK);
  box("cableDuctRight", [1.00, 1.56, ZWALL + 0.20], [0.10, 0.34, 0.12], BLACK);
  for (const x of [-2.01, 1.00]) {
    for (let i = 0; i < 3; i++) {
      box(`ductRib_${x}_${i}`, [x, 1.43 + i * 0.105, ZWALL + 0.275], [0.12, 0.018, 0.14], IRON);
    }
  }

  // Stencil-style data placard: dark plate, cream bars, yellow corner marks.
  box("dataPlacard", [0.84, 1.53, ZWALL + 0.39], [0.38, 0.19, 0.018], BLACK);
  box("placardHeader", [0.84, 1.596, ZWALL + 0.402], [0.29, 0.018, 0.008], CHALK);
  for (let i = 0; i < 4; i++) {
    box("placardLine" + i, [0.75 + (i % 2) * 0.16, 1.545 - Math.floor(i / 2) * 0.04, ZWALL + 0.402], [0.11, 0.012, 0.008], i === 3 ? WARNING : CHALK);
  }
  box("placardStripe", [0.84, 1.468, ZWALL + 0.402], [0.30, 0.018, 0.008], WARNING);

  // Reel of coiled black cable at the right end of the console.
  const reelX = 1.06;
  cylinder("cableReelHub", [reelX, 1.69, ZWALL + 0.22], 0.09, 0.045, IRON, 12);
  cylinder("cableReelCap", [reelX, 1.69, ZWALL + 0.255], 0.065, 0.018, BRASS, 12);
  const cablePath = spiral(
    [reelX, 1.69, ZWALL + 0.275],
    [reelX + 0.015, 1.69, ZWALL + 0.275],
    [0, 0, 0.055],
    { turns: 2.4, r1: 0.012, pitch: 0.012 },
  );
  b.sweep(cablePath, 0.008, {
    color: BLACK,
    name: "monitorBank_cableCoil",
    group: "monitorBank",
    caps: "round",
  });

  // Four large wall bolts give the bank a believable industrial attachment.
  for (const [i, [x, y]] of [
    [-2.08, 2.08],
    [1.04, 2.08],
    [-2.08, 1.47],
    [1.04, 1.47],
  ].entries()) {
    cylinder("frameBolt" + i, [x, y, FRONT + 0.018], 0.032, 0.025, BRASS, 8);
    cylinder("frameBoltInner" + i, [x, y, FRONT + 0.034], 0.015, 0.012, BLACK, 8);
  }

  // Short orange warning stripes on the lower control fascia.
  for (let i = 0; i < 5; i++) {
    const x = -1.95 + i * 0.16;
    box("warningStripe" + i, [x, 1.285, ZWALL + 0.37], [0.09, 0.025, 0.012], i % 2 ? BLACK : WARNING);
  }
}
```

<!-- call: lockersShelf -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildLockersShelf({ b, J, P, M }: Ctx) {
  const rand = rng(1979);
  const wallX = -2.28;
  const frontX = -1.66;
  const dark = P.black;
  const olive = P.olive;
  const cream = P.cabinet;
  const orange = P.orange;
  const rust = P.rust;
  const yellow = P.warning;
  const iron = P.iron;
  const brass = P.brass;
  const chalk = P.chalk;
  const machine = P.machine;
  const rubber = P.rubber;
  const glowColor = P.lampGlow;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: J.body,
      name: name ? `lockersShelf_${name}` : undefined,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      bone: J.body,
      name: name ? `lockersShelf_${name}` : undefined,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      bone: J.body,
      name: name ? `lockersShelf_${name}` : undefined,
      section: { ngon: 8 },
    });

  const lockerZ = [-0.94, -0.34, 0.26, 0.86];
  const lockerHeight = 1.86;
  const lockerBottom = 0.07;
  const lockerTop = lockerBottom + lockerHeight;

  // Four deep molded locker carcasses, slightly proud of the left wall.
  lockerZ.forEach((z, i) => {
    box([0.48, lockerHeight, 0.52], [-2.02, lockerBottom + lockerHeight / 2, z], olive, `locker${i + 1}`);

    // Cream raised door frame: two uprights and two rails.
    box([0.035, 1.70, 0.035], [frontX, 0.99, z - 0.225], cream, `locker${i + 1}_frameL`);
    box([0.035, 1.70, 0.035], [frontX, 0.99, z + 0.225], cream, `locker${i + 1}_frameR`);
    box([0.035, 0.035, 0.49], [frontX, 1.835, z], cream, `locker${i + 1}_frameTop`);
    box([0.035, 0.035, 0.49], [frontX, 0.145, z], cream, `locker${i + 1}_frameBottom`);

    // Dark recessed door panel and vertical centre seam.
    box([0.018, 1.62, 0.40], [-1.675, 0.99, z], olive, `locker${i + 1}_door`);
    box([0.012, 1.57, 0.008], [-1.658, 0.99, z], dark, `locker${i + 1}_seam`);

    // Vent bank near the top, each bar a separate hard detail.
    for (let v = 0; v < 5; v++) {
      box(
        [0.018, 0.018, 0.27],
        [-1.648, 1.54 + v * 0.052, z],
        dark,
        `locker${i + 1}_vent${v}`,
      );
    }

    // Number plate and tiny printed-looking horizontal mark.
    box([0.018, 0.105, 0.13], [-1.65, 1.25, z - 0.12], chalk, `locker${i + 1}_plate`);
    box([0.021, 0.012, 0.075], [-1.638, 1.25, z - 0.12], dark, `locker${i + 1}_plateMark`);

    // Black latch with brass pivot.
    box([0.025, 0.12, 0.035], [-1.635, 0.95, z + 0.16], dark, `locker${i + 1}_latch`);
    cyl(0.022, 0.018, [-1.615, 0.95, z + 0.16], brass, 8, `locker${i + 1}_latchPin`);
  });

  // Dark plinth and a continuous olive cap unify the locker row.
  box([0.55, 0.09, 2.45], [-2.02, 0.045, -0.04], dark, "lockerPlinth");
  box([0.56, 0.10, 2.48], [-2.02, 1.965, -0.04], cream, "lockerCap");

  // Small vertical seams between carcasses and feet at the floor.
  for (let i = 0; i < 3; i++) {
    const z = (lockerZ[i] + lockerZ[i + 1]) / 2;
    box([0.50, 1.78, 0.018], [-2.02, 0.99, z], dark, `lockerGap${i}`);
  }

  // Upper wall rack: two iron rails and four heavy brackets.
  box([0.09, 0.09, 2.35], [-2.20, 2.17, 0.0], iron, "rackRailTop");
  box([0.09, 0.09, 2.35], [-2.20, 1.98, 0.0], iron, "rackRailBottom");
  for (let i = 0; i < 4; i++) {
    const z = -0.91 + i * 0.61;
    box([0.16, 0.30, 0.08], [-2.16, 2.07, z], iron, `rackBracket${i}`);
    cyl(0.025, 0.025, [-2.105, 2.07, z], brass, 8, `rackRivet${i}`);
  }

  // Four cases hanging above the lockers, with alternating orange and rust shells.
  const cases = [
    { z: -0.82, c: orange, w: 0.48 },
    { z: -0.25, c: rust, w: 0.52 },
    { z: 0.34, c: orange, w: 0.44 },
    { z: 0.91, c: rust, w: 0.50 },
  ];
  cases.forEach((item, i) => {
    box([0.34, 0.30, item.w], [-1.91, 2.18, item.z], item.c, `equipmentCase${i}`);
    box([0.018, 0.045, item.w * 0.82], [-1.725, 2.18, item.z], yellow, `equipmentCase${i}_stripe`);
    box([0.03, 0.035, item.w * 0.72], [-1.70, 2.31, item.z], dark, `equipmentCase${i}_handle`);
    cyl(0.018, 0.025, [-1.70, 2.08, item.z - item.w * 0.28], brass, 8, `equipmentCase${i}_pin`);
    cyl(0.018, 0.025, [-1.70, 2.08, item.z + item.w * 0.28], brass, 8, `equipmentCase${i}_pin2`);
  });

  // A narrow warning stripe and bolts across the rack's lower beam.
  box([0.02, 0.045, 2.24], [-1.68, 1.985, 0.0], yellow, "rackWarning");
  for (let i = 0; i < 8; i++) {
    cyl(0.018, 0.025, [-1.645, 1.985, -0.98 + i * 0.28], iron, 8, `rackBolt${i}`);
  }

  // Two supply crates stacked beside the lockers, still inside the left-wall bay.
  const crateX = -1.78;
  const crateZ = 1.53;
  [0.31, 0.86].forEach((y, i) => {
    box([0.46, 0.48, 0.60], [crateX, y, crateZ], olive, `supplyCrate${i}`);
    box([0.018, 0.39, 0.035], [frontX - 0.015, y, crateZ - 0.25], rubber, `supplyCrate${i}_strapL`);
    box([0.018, 0.39, 0.035], [frontX - 0.015, y, crateZ + 0.25], rubber, `supplyCrate${i}_strapR`);
    box([0.022, 0.12, 0.24], [frontX - 0.025, y + 0.08, crateZ], chalk, `supplyCrate${i}_stencil`);
    box([0.026, 0.014, 0.16], [frontX - 0.041, y + 0.08, crateZ], dark, `supplyCrate${i}_stencilLine`);
    cyl(0.025, 0.025, [frontX - 0.045, y - 0.16, crateZ - 0.22], brass, 8, `supplyCrate${i}_rivet1`);
    cyl(0.025, 0.025, [frontX - 0.045, y - 0.16, crateZ + 0.22], brass, 8, `supplyCrate${i}_rivet2`);
  });

  // Small machine-grey drum with rust retaining rings.
  const drumX = -1.82;
  const drumZ = 0.98;
  cyl(0.22, 0.46, [drumX, 0.25, drumZ], machine, 12, "supplyDrum");
  cyl(0.232, 0.035, [drumX, 0.08, drumZ], rust, 12, "supplyDrum_bottomRing");
  cyl(0.232, 0.035, [drumX, 0.42, drumZ], rust, 12, "supplyDrum_topRing");
  cyl(0.15, 0.018, [frontX - 0.02, 0.25, drumZ], chalk, 10, "supplyDrum_label");
  box([0.018, 0.045, 0.12], [frontX - 0.035, 0.25, drumZ], dark, "supplyDrum_labelMark");

  // Toolbox tucked in front of the drum.
  box([0.40, 0.22, 0.30], [-1.91, 0.16, 1.25], dark, "toolbox");
  box([0.42, 0.035, 0.32], [-1.91, 0.285, 1.25], rubber, "toolboxLid");
  rod([-2.04, 0.30, 1.25], [-1.78, 0.30, 1.25], 0.018, brass, "toolboxHandle");
  box([0.035, 0.06, 0.075], [-1.91, 0.275, 1.25], brass, "toolboxClasp");

  // A stepped tower of ration tins beside the toolbox.
  const tinZ = 1.64;
  for (let i = 0; i < 5; i++) {
    const y = 0.16 + i * 0.075;
    const r = i % 2 === 0 ? 0.105 : 0.095;
    cyl(r, 0.065, [-1.82, y, tinZ], i % 2 === 0 ? chalk : machine, 10, `rationTin${i}`);
    cyl(r + 0.006, 0.012, [-1.82, y + 0.034, tinZ], iron, 10, `rationTin${i}_rim`);
    box([0.012, 0.028, r * 1.25], [-1.715, y, tinZ], rust, `rationTin${i}_label`);
  }

  // Clip lamp hung from the rack at the forward end.
  rod([-2.16, 1.98, -1.08], [-1.91, 1.68, -1.08], 0.018, iron, "clipLampArm");
  cyl(0.105, 0.05, [-1.91, 1.61, -1.08], iron, 10, "clipLampShade");
  cyl(0.057, 0.052, [-1.91, 1.565, -1.08], glowColor, 12, "clipLampBulb");
  const lamp = b.part(new THREE.SphereGeometry(0.058, 10, 6), glowColor, {
    at: [-1.91, 1.565, -1.08],
    bone: J.body,
    name: "lockersShelf_clipLampGlow",
    flat: true,
  });
  glow(lamp, 1.8);
  cyl(0.024, 0.04, [-1.91, 1.69, -1.08], brass, 8, "clipLampSocket");

  // Three iron wall hooks and small hanging straps below the rack.
  for (let i = 0; i < 3; i++) {
    const z = -0.75 + i * 0.48;
    rod([-1.70, 1.72, z], [-1.55, 1.72, z], 0.015, iron, `wallHook${i}`);
    cyl(0.018, 0.04, [-1.54, 1.67, z], brass, 8, `wallHook${i}_cap`);
    box([0.025, 0.22, 0.06], [-1.50, 1.56, z], rubber, `hangingStrap${i}`);
  }

  // A low black anti-scuff strip ties this storage assembly into the deck.
  box([0.06, 0.13, 2.55], [-1.70, 0.105, -0.03], rubber, "storageKickStrip");

  // Tiny diagonal corner braces make the rack feel bolted into a real ship wall.
  rod([-2.13, 1.99, -1.07], [-1.77, 1.78, -1.07], 0.012, iron, "rackBraceFront");
  rod([-2.13, 1.99, 1.07], [-1.77, 1.78, 1.07], 0.012, iron, "rackBraceRear");

  // Deterministic little wear tabs: subdued, chunky colour variation on crate corners.
  for (let i = 0; i < 3; i++) {
    const z = 1.33 + i * 0.19;
    const c = rand() > 0.5 ? rust : brass;
    box([0.025, 0.025, 0.08], [-1.535, 0.13 + i * 0.04, z], c, `storageWear${i}`);
  }
}
```

<!-- call: ceilingServices -->

```ts
import * as THREE from "three";
import { rng, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCeilingServices({ b, J, P, M }: Ctx) {
  const COPPER = P.pipeCopper;
  const STEEL = P.pipeSteel;
  const OLIVE = P.olive;
  const IRON = P.iron;
  const MACHINE = P.machine;
  const BLACK = P.black;
  const RUBBER = P.rubber;
  const ORANGE = P.orange;
  const BRASS = P.brass;
  const LAMP = P.lampGlow;
  const WARNING = P.warning;
  const RUST = P.rust;

  const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
      group: "ceilingServices",
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    sides = 10,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      dir,
      name,
      group: "ceilingServices",
    });

  const torus = (
    major: number,
    minor: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 14), color, {
      at,
      dir,
      name,
      group: "ceilingServices",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, group: "ceilingServices", caps: "round" });

  const bolt = (x: number, y: number, z: number, color = BRASS, name?: string) =>
    b.part(new THREE.SphereGeometry(0.026, 7, 5), color, {
      at: [x, y, z],
      name,
      group: "ceilingServices",
    });

  // ---------------------------------------------------------------------------
  // Ceiling mounting spine and heavy transverse brackets.
  // ---------------------------------------------------------------------------

  box([4.25, 0.11, 0.22], [0, 2.645, -1.82], IRON, "ceilingMountRear");
  box([4.25, 0.11, 0.22], [0, 2.645, 0.05], IRON, "ceilingMountMiddle");
  box([4.25, 0.11, 0.22], [0, 2.645, 2.02], IRON, "ceilingMountFront");

  for (const z of [-1.82, 0.05, 2.02]) {
    for (const x of [-1.85, -0.95, 0.95, 1.85]) {
      box([0.11, 0.17, 0.28], [x, 2.54, z], IRON, "mountingFoot");
      bolt(x - 0.035, 2.635, z - 0.08, BRASS, "mountRivet");
      bolt(x + 0.035, 2.635, z + 0.08, BRASS, "mountRivet");
    }
  }

  // A shallow, open cable tray occupies the central ceiling channel.
  box([1.55, 0.08, 4.35], [0, 2.48, -0.05], IRON, "cableTrayBase");
  box([0.08, 0.22, 4.35], [-0.78, 2.57, -0.05], STEEL, "cableTrayLeft");
  box([0.08, 0.22, 4.35], [0.78, 2.57, -0.05], STEEL, "cableTrayRight");
  for (const z of [-1.9, -0.95, 0, 0.95, 1.9]) {
    box([1.62, 0.055, 0.08], [0, 2.59, z], STEEL, "trayCrossbar");
  }

  // ---------------------------------------------------------------------------
  // Two prominent copper service pipes, front-to-back, with flange collars.
  // ---------------------------------------------------------------------------

  for (const x of [-1.22, 1.22]) {
    rod(V(x, 2.51, -2.33), V(x, 2.51, 2.27), 0.068, COPPER, "copperMainPipe");

    for (const z of [-2.08, -1.04, 0, 1.04, 2.08]) {
      torus(0.091, 0.014, V(x, 2.51, z), BRASS, [1, 0, 0], "copperFlange");
      torus(0.076, 0.009, V(x, 2.51, z), RUST, [1, 0, 0], "flangeGasket");
    }

    // Small bolts on the visible lower side of each flange.
    for (const z of [-2.08, -1.04, 0, 1.04, 2.08]) {
      bolt(x - 0.055, 2.454, z, BRASS, "flangeBolt");
      bolt(x + 0.055, 2.454, z, BRASS, "flangeBolt");
    }
  }

  // Copper pipes turn inward at the front into compact elbow assemblies.
  rod(V(-1.22, 2.51, 2.27), V(-1.22, 2.51, 2.38), 0.068, COPPER, "copperFrontElbow");
  rod(V(-1.22, 2.51, 2.38), V(-0.72, 2.51, 2.38), 0.068, COPPER, "copperFrontElbow");
  rod(V(1.22, 2.51, 2.27), V(1.22, 2.51, 2.38), 0.068, COPPER, "copperFrontElbow");
  rod(V(1.22, 2.51, 2.38), V(0.72, 2.51, 2.38), 0.068, COPPER, "copperFrontElbow");
  torus(0.09, 0.014, V(-1.22, 2.51, 2.31), BRASS, [1, 0, 0], "elbowCollar");
  torus(0.09, 0.014, V(1.22, 2.51, 2.31), BRASS, [1, 0, 0], "elbowCollar");

  // ---------------------------------------------------------------------------
  // Steel conduit bundle in the tray.
  // ---------------------------------------------------------------------------

  const conduitX = [-0.58, -0.34, -0.11, 0.13, 0.37, 0.59];
  conduitX.forEach((x, i) => {
    rod(V(x, 2.64, -2.22), V(x, 2.64, 2.20), 0.021 + (i % 2) * 0.004, STEEL, "steelConduit");
    for (const z of [-1.45, 0.15, 1.72]) {
      torus(0.031, 0.006, V(x, 2.64, z), IRON, [1, 0, 0], "conduitClamp");
    }
  });

  // A squat olive duct sits beside the conduit bundle.
  box([0.18, 0.15, 4.26], [0.94, 2.64, -0.03], OLIVE, "oliveCableDuct");
  box([0.2, 0.025, 0.18], [0.94, 2.725, -1.75], BLACK, "ductAccess");
  box([0.2, 0.025, 0.18], [0.94, 2.725, 0.1], BLACK, "ductAccess");
  box([0.2, 0.025, 0.18], [0.94, 2.725, 1.8], BLACK, "ductAccess");

  // Warning-yellow identification tabs on the tray.
  for (const z of [-1.52, -0.45, 0.62, 1.69]) {
    box([0.25, 0.018, 0.08], [0, 2.685, z], WARNING, "conduitWarningTab");
  }

  // ---------------------------------------------------------------------------
  // Hanging black service loops and their clip rings.
  // ---------------------------------------------------------------------------

  const loopStarts = [
    [-1.78, -1.55, 2.50],
    [1.76, -0.9, 2.50],
    [-0.92, 0.88, 2.50],
    [0.98, 1.48, 2.50],
  ] as const;

  loopStarts.forEach(([x, z, y]) => {
    const sag = 0.28 + ((Math.abs(x * 7 + z * 3) % 3) * 0.035);
    const path: [number, number, number][] = [
      [x, y, z],
      [x + 0.06, y - sag * 0.45, z],
      [x + 0.02, y - sag, z + 0.035],
      [x - 0.08, y - sag * 0.46, z + 0.04],
      [x, y, z],
    ];
    b.sweep(path, 0.018, {
      color: BLACK,
      caps: "round",
      name: "hangingCableLoop",
      group: "ceilingServices",
    });
    torus(0.047, 0.012, [x, y + 0.006, z], IRON, [0, 1, 0], "cableClipRing");
    box([0.12, 0.045, 0.07], [x, y + 0.055, z], IRON, "cableClip");
  });

  // ---------------------------------------------------------------------------
  // Two pendant lamps over the central mess-table footprint.
  // ---------------------------------------------------------------------------

  for (const x of [-0.68, 0.68]) {
    rod(V(x, 2.64, 0.42), V(x, 2.37, 0.42), 0.025, IRON, "lampStem");
    torus(0.065, 0.012, V(x, 2.58, 0.42), BRASS, [0, 1, 0], "lampStemCollar");

    const shade = b.part(new THREE.ConeGeometry(0.18, 0.23, 10, 1, false), IRON, {
      at: [x, 2.255, 0.42],
      dir: [0, -1, 0],
      name: "pendantLampCone",
      group: "ceilingServices",
    });
    torus(0.16, 0.018, V(x, 2.145, 0.42), BRASS, [0, 1, 0], "lampRim");

    const disc = b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.018, 12), LAMP, {
      at: [x, 2.132, 0.42],
      name: "glowingLampDisc",
      group: "ceilingServices",
    });
    glow(disc, 1.8);

    // Tiny dark fasteners on each shade.
    bolt(x - 0.09, 2.25, 0.42, BLACK, "lampFastener");
    bolt(x + 0.09, 2.25, 0.42, BLACK, "lampFastener");
  }

  // ---------------------------------------------------------------------------
  // Junction box with orange identification stripe, mounted over the tray.
  // ---------------------------------------------------------------------------

  box([0.38, 0.23, 0.52], [-1.66, 2.43, 0.55], MACHINE, "junctionBox");
  box([0.395, 0.035, 0.11], [-1.66, 2.555, 0.55], ORANGE, "junctionOrangeStripe");
  box([0.12, 0.018, 0.16], [-1.66, 2.575, 0.55], BLACK, "junctionLabel");
  for (const z of [0.37, 0.73]) {
    bolt(-1.82, 2.555, z, BRASS, "junctionRivet");
    bolt(-1.50, 2.555, z, BRASS, "junctionRivet");
  }
  rod(V(-1.52, 2.43, 0.55), V(-1.25, 2.43, 0.55), 0.025, STEEL, "junctionLead");
  rod(V(-1.80, 2.43, 0.55), V(-2.02, 2.43, 0.55), 0.025, STEEL, "junctionLead");

  // ---------------------------------------------------------------------------
  // Hose reel on the right-hand service rail.
  // ---------------------------------------------------------------------------

  box([0.12, 0.34, 0.52], [1.72, 2.42, -0.88], IRON, "hoseReelBracket");
  torus(0.22, 0.045, [1.72, 2.38, -0.88], IRON, [1, 0, 0], "hoseReelWheel");
  cyl(0.06, 0.20, [1.72, 2.38, -0.88], BRASS, [1, 0, 0], 10, "hoseReelHub");

  const hosePath = spiral(
    [1.72, 2.38, -0.88],
    [1.72, 2.38, -0.66],
    [1, 0, 0],
    { turns: 3.2, pitch: 0.018, r1: 0.045 },
  );
  b.sweep(hosePath, 0.016, {
    color: RUBBER,
    caps: "round",
    name: "coiledRubberHose",
    group: "ceilingServices",
  });

  rod(V(1.72, 2.18, -0.88), V(1.72, 2.10, -0.88), 0.016, RUBBER, "hoseDrop");
  box([0.10, 0.055, 0.13], [1.72, 2.07, -0.88], BRASS, "hoseNozzle");
  torus(0.07, 0.012, [1.72, 2.11, -0.88], RUST, [0, 1, 0], "hoseNozzleCollar");

  // A small safety placard and two red-orange inspection marks finish the service bay.
  box([0.34, 0.018, 0.22], [1.42, 2.70, -1.85], BLACK, "servicePlacard");
  box([0.24, 0.012, 0.035], [1.42, 2.714, -1.91], WARNING, "placardStripe");
  box([0.035, 0.014, 0.09], [1.31, 2.714, -1.84], ORANGE, "placardMark");
  box([0.035, 0.014, 0.09], [1.53, 2.714, -1.84], RUST, "placardMark");

  // Short diagonal braces make the overhead mass read as attached to the ceiling.
  rod(V(-2.05, 2.64, -1.82), V(-1.78, 2.49, -1.62), 0.027, IRON, "diagonalCeilingBrace");
  rod(V(2.05, 2.64, -1.82), V(1.78, 2.49, -1.62), 0.027, IRON, "diagonalCeilingBrace");
  rod(V(-2.05, 2.64, 1.98), V(-1.78, 2.49, 1.78), 0.027, IRON, "diagonalCeilingBrace");
  rod(V(2.05, 2.64, 1.98), V(1.78, 2.49, 1.78), 0.027, IRON, "diagonalCeilingBrace");

  for (const p of [
    [-2.05, 2.64, -1.82],
    [2.05, 2.64, -1.82],
    [-2.05, 2.64, 1.98],
    [2.05, 2.64, 1.98],
  ] as [number, number, number][]) {
    bolt(p[0], p[1] + 0.015, p[2], BRASS, "ceilingBraceBolt");
  }
}
```

<!-- call: galleyCounter -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildGalleyCounter({ b, J, P, M }: Ctx) {
  const machine = P.machine;
  const cream = P.cabinet;
  const topColor = P.tabletop;
  const iron = P.iron;
  const black = P.black;
  const rubber = P.rubber;
  const warning = P.warning;
  const rust = P.rust;
  const orange = P.orange;
  const olive = P.olive;
  const brass = P.brass;
  const steel = P.pipeSteel;
  const chalk = P.chalk;
  const amber = P.screenAmber;

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    name: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: string,
  ) => {
    return b.part(new THREE.BoxGeometry(sx, sy, sz), color, {
      at: at(x, y, z),
      name: `galleyCounter_${name}`,
    });
  };

  const cyl = (
    name: string,
    x: number,
    y: number,
    z: number,
    radius: number,
    length: number,
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    sides = 10,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      at: at(x, y, z),
      dir,
      name: `galleyCounter_${name}`,
    });
  };

  const sphere = (
    name: string,
    x: number,
    y: number,
    z: number,
    radius: number,
    color: string,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at: at(x, y, z),
      name: `galleyCounter_${name}`,
    });
  };

  const rodX = (
    name: string,
    x: number,
    y: number,
    z: number,
    length: number,
    radius: number,
    color: string,
  ) => cyl(name, x, y, z, radius, length, color, [1, 0, 0], 8);

  const rodZ = (
    name: string,
    x: number,
    y: number,
    z: number,
    length: number,
    radius: number,
    color: string,
  ) => cyl(name, x, y, z, radius, length, color, [0, 0, 1], 8);

  const plate = (
    name: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: string,
  ) => box(name, x, y, z, sx, sy, sz, color);

  // Cabinet carcass, standing directly on the deck.
  box("baseCarcass", 0, 0.57, -1.99, 4.32, 1.02, 0.82, machine);
  box("baseToeKick", 0, 0.12, -1.47, 4.3, 0.14, 0.08, black);
  box("leftEndPanel", -2.13, 0.64, -1.98, 0.10, 1.08, 0.78, iron);
  box("rightEndPanel", 2.13, 0.64, -1.98, 0.10, 1.08, 0.78, iron);

  // Lower cabinet shadow gaps and four molded cream doors.
  const doorXs = [-1.58, -0.53, 0.53, 1.58];
  for (let i = 0; i < doorXs.length; i++) {
    const x = doorXs[i];
    box(`door${i}`, x, 0.62, -1.545, 0.96, 0.82, 0.055, cream);
    box(`doorTopSeam${i}`, x, 1.045, -1.58, 0.91, 0.018, 0.022, black);
    box(`doorBottomSeam${i}`, x, 0.195, -1.58, 0.91, 0.018, 0.022, black);
    box(`doorLeftSeam${i}`, x - 0.475, 0.62, -1.58, 0.018, 0.80, 0.022, black);
    box(`doorRightSeam${i}`, x + 0.475, 0.62, -1.58, 0.018, 0.80, 0.022, black);
    cyl(`doorPull${i}`, x + 0.28, 0.64, -1.60, 0.025, 0.18, black, [0, 1, 0], 8);
    sphere(`doorPullCap${i}`, x + 0.28, 0.745, -1.60, 0.035, brass);
  }

  // Small lower ventilation slots.
  for (let i = 0; i < 9; i++) {
    box(`toeVent${i}`, -1.65 + i * 0.41, 0.13, -1.525, 0.22, 0.026, 0.014, iron);
  }

  // Heavy cream worktop and its raised rear lip.
  box("worktop", 0, 1.17, -1.94, 4.38, 0.16, 0.92, topColor);
  box("worktopFrontEdge", 0, 1.105, -1.46, 4.34, 0.10, 0.06, cream);
  box("worktopRearLip", 0, 1.32, -2.35, 4.28, 0.18, 0.12, cream);
  box("worktopLeftLip", -2.08, 1.27, -1.93, 0.10, 0.14, 0.75, cream);
  box("worktopRightLip", 2.08, 1.27, -1.93, 0.10, 0.14, 0.75, cream);

  // Dark rubber anti-slip mat in front of the counter.
  box("floorMat", 0, 0.075, -1.25, 3.85, 0.025, 0.36, rubber);
  for (let i = 0; i < 13; i++) {
    box(`matRib${i}`, -1.75 + i * 0.29, 0.095, -1.25, 0.035, 0.012, 0.30, black);
  }

  // Backsplash, tile divisions, and warning stripe.
  box("backsplash", 0, 1.55, -2.40, 4.30, 0.43, 0.10, machine);
  for (let i = 0; i < 9; i++) {
    box(`backsplashTileV${i}`, -1.90 + i * 0.475, 1.56, -2.345, 0.018, 0.36, 0.012, iron);
  }
  box("backsplashStripe", 0, 1.69, -2.345, 4.22, 0.105, 0.018, warning);
  for (let i = 0; i < 15; i++) {
    box(`stripeBreak${i}`, -1.95 + i * 0.28, 1.69, -2.358, 0.09, 0.105, 0.010, black);
  }

  // Beverage dispenser tower on the left.
  box("dispenserBody", -1.52, 1.64, -1.91, 0.58, 0.82, 0.52, chalk);
  box("dispenserShoulders", -1.52, 2.055, -1.91, 0.68, 0.10, 0.60, chalk);
  box("dispenserTop", -1.52, 2.14, -1.91, 0.50, 0.08, 0.45, machine);
  box("dispenserOrangeBand", -1.52, 1.78, -1.635, 0.60, 0.13, 0.025, orange);
  box("dispenserDarkBand", -1.52, 1.70, -1.635, 0.60, 0.025, 0.025, black);
  box("dispenserPanel", -1.52, 1.95, -1.645, 0.38, 0.23, 0.025, olive);
  for (let i = 0; i < 3; i++) {
    sphere(`dispenserLamp${i}`, -1.66 + i * 0.14, 1.98, -1.665, 0.027, i === 1 ? amber : warning);
  }
  for (const x of [-1.68, -1.36]) {
    cyl(`dispenserNozzleStem${x}`, x, 1.51, -1.66, 0.025, 0.24, brass, [0, -1, 0], 8);
    cyl(`dispenserNozzleTip${x}`, x, 1.39, -1.64, 0.035, 0.11, brass, [0, 0, 1], 8);
    sphere(`dispenserValve${x}`, x, 1.50, -1.72, 0.055, rust);
  }
  box("dispenserDripTray", -1.52, 1.285, -1.67, 0.76, 0.035, 0.30, steel);
  box("dripTrayDarkInset", -1.52, 1.308, -1.67, 0.58, 0.018, 0.17, black);
  for (let i = 0; i < 5; i++) {
    rodX(`dripRail${i}`, -1.78 + i * 0.13, 1.335, -1.80, 0.09, 0.009, brass);
  }

  // Countertop warming oven in the middle.
  box("ovenBody", -0.48, 1.53, -1.94, 0. ninety ?? 0.92, 0.62, 0.62, machine);
  box("ovenTopCap", -0.48, 1.855, -1.94, 0.98, 0.07, 0.66, iron);
  box("ovenDoorFrame", -0.48, 1.54, -1.615, 0.78, 0.48, 0.07, black);
  box("ovenGlass", -0.48, 1.54, -1.575, 0.65, 0.34, 0.025, rubber);
  box("ovenGlassGlow", -0.48, 1.54, -1.558, 0.56, 0.25, 0.012, olive);
  rodX("ovenHandle", -0.48, 1.78, -1.52, 0.58, 0.035, rust);
  cyl("ovenHandleLeft", -0.77, 1.78, -1.55, 0.025, 0.10, rust, [0, 0, 1], 8);
  cyl("ovenHandleRight", -0.19, 1.78, -1.55, 0.025, 0.10, rust, [0, 0, 1], 8);
  box("ovenControlRail", -0.48, 1.90, -1.62, 0.78, 0.11, 0.045, iron);
  for (let i = 0; i < 3; i++) {
    cyl(`ovenKnob${i}`, -0.72 + i * 0.23, 1.91, -1.66, 0.045, 0.035, brass, [0, 0, 1], 8);
  }
  sphere("ovenAmberIndicator", -0.13, 1.91, -1.675, 0.035, amber);
  sphere("ovenRedIndicator", -0.82, 1.91, -1.675, 0.032, rust);

  // Sink basin on the right.
  box("sinkCounterInsert", 0.87, 1.265, -1.97, 1.10, 0.035, 0.56, black);
  box("sinkBasin", 0.87, 1.205, -1.98, 0.86, 0.13, 0.40, steel);
  box("sinkInnerDark", 0.87, 1.275, -1.98, 0.68, 0.025, 0.27, rubber);
  cyl("sinkDrain", 0.87, 1.292, -1.98, 0.055, 0.018, iron, [0, 1, 0], 10);
  cyl("tapColumn", 0.60, 1.54, -2.12, 0.035, 0.42, steel, [0, 1, 0], 8);
  rodZ("tapSpout", 0.60, 1.73, -2.00, 0.28, 0.035, steel);
  cyl("tapEnd", 0.60, 1.73, -1.85, 0.045, 0.08, steel, [0, 1, 0], 8);
  sphere("tapValveL", 0.48, 1.59, -2.12, 0.045, brass);
  sphere("tapValveR", 0.72, 1.59, -2.12, 0.045, rust);

  // Drying rack beside the basin.
  rodX("rackFront", 1.36, 1.43, -1.74, 0.60, 0.016, steel);
  rodX("rackBack", 1.36, 1.43, -2.12, 0.60, 0.016, steel);
  for (let i = 0; i < 5; i++) {
    rodZ(`rackSlat${i}`, 1.12 + i * 0.12, 1.43, -1.93, 0.34, 0.012, steel);
  }
  for (const x of [1.12, 1.60]) {
    rodX(`rackLeg${x}`, x, 1.34, -1.93, 0.03, 0.015, steel);
  }

  // Wall shelf above the equipment.
  box("shelfBackRail", 0.72, 2.10, -2.34, 2.72, 0.13, 0.10, iron);
  box("shelfBoard", 0.72, 2.00, -2.21, 2.72, 0.10, 0.42, cream);
  box("shelfFrontTrim", 0.72, 2.00, -1.99, 2.72, 0.10, 0.055, machine);
  for (const x of [-0.25, 0.65, 1.60]) {
    rodZ(`shelfBracket${x}`, x, 1.84, -2.18, 0.36, 0.018, iron);
  }

  // Mugs and canisters, deliberately irregular but deterministic.
  const random = rng(1979);
  const mugXs = [-0.02, 0.26, 0.48];
  const mugColors = [olive, rust, chalk];
  mugXs.forEach((x, i) => {
    const wobble = (random() - 0.5) * 0.035;
    cyl(`mug${i}`, x, 2.13 + wobble, -2.10, 0.075, 0.18, mugColors[i], [0, 1, 0], 10);
    cyl(`mugRim${i}`, x, 2.225 + wobble, -2.10, 0.082, 0.018, cream, [0, 1, 0], 10);
    rodZ(`mugHandle${i}`, x + 0.085, 2.13 + wobble, -2.10, 0.12, 0.018, mugColors[i]);
  });
  const cans = [
    [-1.05, 2.13, -2.10, olive],
    [-0.82, 2.14, -2.10, rust],
    [1.18, 2.14, -2.10, chalk],
    [1.43, 2.14, -2.10, olive],
  ] as const;
  cans.forEach((c, i) => {
    cyl(`canister${i}`, c[0], c[1], c[2], 0.09, 0.24, c[3], [0, 1, 0], 10);
    cyl(`canisterLid${i}`, c[0], c[1] + 0.13, c[2], 0.095, 0.025, brass, [0, 1, 0], 10);
    box(`canisterLabel${i}`, c[0], c[1], c[2] + 0.092, 0.11, 0.07, 0.012, warning);
  });

  // Small wall extinguisher at the far right.
  cyl("extinguisherBody", 1.88, 1.72, -2.30, 0.10, 0.42, rust, [0, 1, 0], 10);
  cyl("extinguisherTop", 1.88, 1.95, -2.30, 0.065, 0.08, brass, [0, 1, 0], 8);
  rodX("extinguisherHandle", 1.88, 2.01, -2.29, 0.13, 0.018, black);
  rodZ("extinguisherHose", 1.98, 1.79, -2.30, 0.20, 0.014, rubber);
  box("extinguisherLabel", 1.88, 1.73, -2.405, 0.13, 0.12, 0.012, warning);

  // Narrow side service strips and exposed fasteners.
  box("leftServiceStrip", -2.03, 1.45, -1.94, 0.05, 0.35, 0.70, iron);
  box("rightServiceStrip", 2.03, 1.45, -1.94, 0.05, 0.35, 0.70, iron);
  for (const x of [-2.03, 2.03]) {
    for (let i = 0; i < 3; i++) {
      sphere(`serviceBolt${x}_${i}`, x, 1.28 + i * 0.16, -1.56, 0.025, brass);
    }
  }

  // A few chunky labelled control plates on the counter face.
  box("counterControlPlate", 1.76, 0.76, -1.595, 0.34, 0.28, 0.025, iron);
  box("counterControlStripe", 1.76, 0.85, -1.614, 0.26, 0.035, warning);
  for (let i = 0; i < 3; i++) {
    cyl(`counterButton${i}`, 1.64 + i * 0.12, 0.68, -1.625, 0.028, 0.026, i === 1 ? rust : brass, [0, 0, 1], 8);
  }
  box("counterStencil", 1.76, 0.58, -1.615, 0.24, 0.045, 0.018, chalk);

  // Dark thin shadow line beneath the rear worktop lip.
  box("rearCounterShadow", 0, 1.355, -2.31, 4.12, 0.025, 0.025, black);
}
```

<!-- call: roomShell -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoomShell({ b, J, P, M }: Ctx) {
  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      // Keep the chunky silhouette while taking the harshest corners off.
      const e = new THREE.EdgesGeometry(g);
      e.dispose();
    }
    return b.part(g, color, { at, name, flat: true });
  };

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number],
    name: string,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  const slab = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => box(size, at, color, name);

  const dark = P.black;
  const floor = P.floor;
  const wall = P.wall;
  const rib = P.rib;
  const iron = P.iron;
  const cabinet = P.cabinet;
  const warning = P.warning;
  const rust = P.rust;
  const brass = P.brass;
  const olive = P.olive;
  const rubber = P.rubber;
  const copper = P.pipeCopper;
  const steel = P.pipeSteel;
  const chalk = P.chalk;

  // ---------------------------------------------------------------------------
  // Deck: broad steel plates, hard seams, raised aft grating, and doorway stripe.
  // ---------------------------------------------------------------------------

  const plateW = 0.74;
  const plateD = 0.78;
  let pi = 0;
  for (let ix = 0; ix < 6; ix++) {
    for (let iz = 0; iz < 7; iz++) {
      const x = -1.875 + ix * 0.75;
      const z = -2.20 + iz * 0.73;
      slab([plateW, 0.075, plateD], [x, 0.038, z], floor, `deckPlate_${pi++}`);
      if ((ix + iz) % 3 === 0) {
        box([0.34, 0.012, 0.035], [x - 0.13, 0.082, z + 0.18], rust, `deckRust_${ix}_${iz}`);
      }
    }
  }

  for (let ix = 0; ix < 7; ix++) {
    box([0.018, 0.014, 5.0], [-2.25 + ix * 0.75, 0.082, 0], dark, `deckSeamX_${ix}`);
  }
  for (let iz = 0; iz < 8; iz++) {
    box([4.55, 0.014, 0.018], [0, 0.083, -2.18 + iz * 0.62], dark, `deckSeamZ_${iz}`);
  }

  // Warning stripe across the open doorway end.
  box([4.35, 0.012, 0.18], [0, 0.091, 2.30], warning, "doorWarningStripe");
  for (let i = -7; i <= 7; i++) {
    const x = i * 0.30;
    box([0.13, 0.016, 0.19], [x, 0.101, 2.30], dark, `doorStripeBlack_${i}`);
  }

  // A raised grated service strip at the back of the room.
  box([4.05, 0.09, 0.34], [0, 0.13, -2.20], iron, "backRaisedGrating");
  for (let i = -13; i <= 13; i++) {
    box([0.026, 0.026, 0.31], [i * 0.15, 0.19, -2.20], steel, `grateBar_${i}`);
  }
  box([4.08, 0.025, 0.025], [0, 0.20, -2.36], dark, "grateFrontSeam");

  // ---------------------------------------------------------------------------
  // Three molded walls. Panels are recessed behind ribs and dark vertical seams.
  // ---------------------------------------------------------------------------

  // Back wall.
  box([4.48, 2.48, 0.14], [0, 1.38, -2.43], wall, "backWallPanel");
  for (let i = -10; i <= 10; i++) {
    const x = i * 0.205;
    box([0.055, 2.35, 0.075], [x, 1.40, -2.325], rib, `backRib_${i}`);
    if (i < 10) box([0.018, 2.28, 0.012], [x + 0.102, 1.40, -2.282], dark, `backRibSeam_${i}`);
  }

  // Left wall.
  box([0.14, 2.48, 4.84], [-2.23, 1.38, 0], wall, "leftWallPanel");
  for (let i = -10; i <= 10; i++) {
    const z = i * 0.205;
    box([0.075, 2.36, 0.055], [-2.325, 1.40, z], rib, `leftRib_${i}`);
    if (i < 10) box([0.012, 2.28, 0.018], [-2.282, 1.40, z + 0.102], dark, `leftRibSeam_${i}`);
  }

  // Right wall.
  box([0.14, 2.48, 4.84], [2.23, 1.38, 0], wall, "rightWallPanel");
  for (let i = -10; i <= 10; i++) {
    const z = i * 0.205;
    box([0.075, 2.36, 0.055], [2.325, 1.40, z], rib, `rightRib_${i}`);
    if (i < 10) box([0.012, 2.28, 0.018], [2.282, 1.40, z + 0.102], dark, `rightRibSeam_${i}`);
  }

  // Heavy corner posts and cut-away front girder border.
  for (const x of [-2.25, 2.25]) {
    box([0.22, 2.66, 0.22], [x, 1.35, -2.39], iron, `rearCornerPost_${x}`);
    box([0.22, 2.64, 0.22], [x, 1.34, 2.38], iron, `frontCornerPost_${x}`);
  }
  box([4.55, 0.22, 0.22], [0, 2.57, 2.38], iron, "frontTopGirder");
  box([4.55, 0.18, 0.20], [0, 0.18, 2.38], iron, "frontBottomGirder");
  box([0.18, 2.35, 0.18], [-2.25, 1.35, 2.38], iron, "frontLeftGirder");
  box([0.18, 2.35, 0.18], [2.25, 1.35, 2.38], iron, "frontRightGirder");

  // Black kick skirting around all three walls.
  box([4.34, 0.18, 0.12], [0, 0.18, -2.30], dark, "backKickSkirt");
  box([0.12, 0.18, 4.55], [-2.18, 0.18, 0], dark, "leftKickSkirt");
  box([0.12, 0.18, 4.55], [2.18, 0.18, 0], dark, "rightKickSkirt");

  // Mid-height raceway bands, with layered conduit and frequent access blocks.
  box([4.34, 0.16, 0.16], [0, 1.08, -2.28], iron, "backRaceway");
  box([0.16, 0.16, 4.55], [-2.18, 1.08, 0], iron, "leftRaceway");
  box([0.16, 0.16, 4.55], [2.18, 1.08, 0], iron, "rightRaceway");

  box([4.30, 0.035, 0.035], [0, 1.18, -2.175], copper, "backCopperConduit");
  box([4.30, 0.035, 0.035], [0, 1.13, -2.165], steel, "backSteelConduit");
  box([0.035, 0.035, 4.35], [-2.15, 1.18, 0], copper, "leftCopperConduit");
  box([0.035, 0.035, 4.35], [2.15, 1.18, 0], steel, "rightSteelConduit");

  for (let i = -8; i <= 8; i++) {
    const x = i * 0.25;
    box([0.10, 0.19, 0.20], [x, 1.08, -2.19], rib, `backRacewayAccess_${i}`);
    if (i % 3 === 0) {
      cyl(0.045, 0.025, [x, 1.20, -2.15], i % 2 ? brass : rust, [0, 0, 1], `backValve_${i}`, 8);
      for (let s = 0; s < 4; s++) {
        const a = (s * Math.PI) / 2;
        b.rod(
          [x - Math.cos(a) * 0.065, 1.20 + Math.sin(a) * 0.065, -2.13],
          [x + Math.cos(a) * 0.065, 1.20 - Math.sin(a) * 0.065, -2.13],
          0.009,
          { color: brass, name: `backValveSpoke_${i}_${s}` },
        );
      }
    }
  }

  for (let i = -7; i <= 7; i++) {
    const z = i * 0.29;
    box([0.20, 0.19, 0.10], [-2.19, 1.08, z], rib, `leftRacewayAccess_${i}`);
    box([0.20, 0.035, 0.035], [-2.08, 1.17, z], copper, `leftRacewayPipe_${i}`);
    if (i % 4 === 0) cyl(0.04, 0.025, [-2.08, 1.20, z], brass, [1, 0, 0], `leftValve_${i}`, 8);
  }
  for (let i = -7; i <= 7; i++) {
    const z = i * 0.29;
    box([0.20, 0.19, 0.10], [2.19, 1.08, z], rib, `rightRacewayAccess_${i}`);
    if (i % 4 === 1) cyl(0.04, 0.025, [2.08, 1.20, z], rust, [1, 0, 0], `rightValve_${i}`, 8);
  }

  // ---------------------------------------------------------------------------
  // Right-wall pressure hatch: molded ring, dark door, rivets, spokes, chevrons.
  // ---------------------------------------------------------------------------

  const hatch: [number, number, number] = [2.235, 1.50, 0.55];
  cyl(0.64, 0.07, hatch, dark, [1, 0, 0], "pressureHatchDoor", 16);

  // Lathe-built raised pressure ring, its axis normal to the right wall.
  b.lathe(
    [
      [0.48, -0.08],
      [0.66, -0.08],
      [0.70, -0.035],
      [0.70, 0.035],
      [0.66, 0.08],
      [0.48, 0.08],
    ],
    {
      at: hatch,
      axis: [1, 0, 0],
      segments: 16,
      color: iron,
      name: "pressureHatchLathedRing",
    },
  );

  cyl(0.57, 0.035, [2.295, 1.50, 0.55], rib, [1, 0, 0], "hatchInnerPlate", 16);
  cyl(0.49, 0.045, [2.325, 1.50, 0.55], dark, [1, 0, 0], "hatchBlackSeal", 16);

  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const y = 1.50 + Math.cos(a) * 0.60;
    const z = 0.55 + Math.sin(a) * 0.60;
    cyl(0.036, 0.035, [2.31, y, z], brass, [1, 0, 0], `hatchRivet_${i}`, 8);
  }

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    b.rod(
      [2.34, 1.50 + Math.cos(a) * 0.08, 0.55 + Math.sin(a) * 0.08],
      [2.34, 1.50 + Math.cos(a) * 0.43, 0.55 + Math.sin(a) * 0.43],
      0.025,
      { color: steel, name: `hatchSpoke_${i}` },
    );
  }
  cyl(0.075, 0.055, [2.38, 1.50, 0.55], brass, [1, 0, 0], "hatchHub", 10);

  // Alternating warning blocks around the outer ring suggest painted chevrons.
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const y = 1.50 + Math.cos(a) * 0.675;
    const z = 0.55 + Math.sin(a) * 0.675;
    const c = i % 2 === 0 ? warning : dark;
    box([0.055, 0.12, 0.035], [2.38, y, z], c, `hatchChevron_${i}`);
  }

  box([0.035, 0.20, 0.30], [2.37, 0.68, 1.22], chalk, "hatchStencilPlate");
  box([0.012, 0.12, 0.22], [2.395, 0.68, 1.22], dark, "hatchStencilMark");
  box([0.012, 0.012, 0.07], [2.405, 0.68, 1.30], rust, "hatchStencilLineA");
  box([0.012, 0.012, 0.07], [2.405, 0.68, 1.14], rust, "hatchStencilLineB");

  // ---------------------------------------------------------------------------
  // Ceiling closure: panel slab represented as framed recessed modules, with two
  // square service wells deliberately left as dark openings.
  // ---------------------------------------------------------------------------

  box([4.35, 0.13, 0.72], [0, 2.64, -2.08], wall, "ceilingBackPanel");
  box([4.35, 0.13, 0.72], [0, 2.64, 2.08], wall, "ceilingFrontPanel");
  box([1.74, 0.13, 3.45], [-1.30, 2.64, 0], wall, "ceilingLeftPanel");
  box([1.74, 0.13, 3.45], [1.30, 2.64, 0], wall, "ceilingRightPanel");

  // Panel ribs and dark recessed seams.
  for (const x of [-2.05, -1.62, -0.98, 0.98, 1.62, 2.05]) {
    box([0.055, 0.08, 4.25], [x, 2.555, 0], rib, `ceilingLongRib_${x}`);
  }
  for (const z of [-2.42, -1.74, -0.94, 0.94, 1.74, 2.42]) {
    box([4.18, 0.08, 0.055], [0, 2.555, z], rib, `ceilingCrossRib_${z}`);
  }

  // Square well lips and black interiors. These are intentionally not filled.
  for (const x of [-0.82, 0.82]) {
    box([0.62, 0.10, 0.06], [x, 2.565, -0.33], iron, `wellFrontLip_${x}`);
    box([0.62, 0.10, 0.06], [x, 2.565, 0.33], iron, `wellBackLip_${x}`);
    box([0.06, 0.10, 0.72], [x - 0.31, 2.565, 0], iron, `wellLeftLip_${x}`);
    box([0.06, 0.10, 0.72], [x + 0.31, 2.565, 0], iron, `wellRightLip_${x}`);
    box([0.54, 0.025, 0.62], [x, 2.50, 0], dark, `wellDarkInterior_${x}`);
  }

  // Ceiling fasteners.
  for (const x of [-2.05, -1.25, -0.45, 0.45, 1.25, 2.05]) {
    for (const z of [-2.10, 2.10]) {
      cyl(0.025, 0.018, [x, 2.55, z], brass, [0, 1, 0], `ceilingFastener_${x}_${z}`, 8);
    }
  }
}
```

<!-- call: messTable -->

```ts
import * as THREE from "three";

export function buildMessTable({ b, J, P, M }: Ctx) {
  const G = "messTable";
  const at = (geometry: THREE.BufferGeometry, color: string, p: [number, number, number], name: string, rotation?: [number, number, number]) =>
    b.part(geometry, color, {
      at: p,
      rotation,
      group: G,
      name,
    });

  const box = (size: [number, number, number], color: string, p: [number, number, number], name: string, rotation?: [number, number, number]) =>
    at(new THREE.BoxGeometry(size[0], size[1], size[2]), color, p, name, rotation);

  const cyl = (r: number, h: number, color: string, p: [number, number, number], name: string, segments = 12) =>
    at(new THREE.CylinderGeometry(r, r, h, segments), color, p, name);

  const cone = (r0: number, r1: number, h: number, color: string, p: [number, number, number], name: string, segments = 10) =>
    at(new THREE.CylinderGeometry(r0, r1, h, segments), color, p, name);

  const torus = (major: number, minor: number, color: string, p: [number, number, number], name: string, segments = 12) =>
    at(new THREE.TorusGeometry(major, minor, 5, segments), color, p, name, [90, 0, 0]);

  const deckY = M.deckTop[1];
  const tableCenter: [number, number, number] = [0, 0, 0.28];

  // Low-profile rubber mat under the entire stool cluster.
  box([2.85, 0.025, 2.05], P.rubber, [0, deckY + 0.0125, 0.3], "messTableFloorMat");
  box([2.55, 0.012, 1.76], P.black, [0, deckY + 0.032, 0.3], "messTableMatInset");
  for (const x of [-1.18, 1.18]) {
    box([0.035, 0.018, 1.78], P.iron, [x, deckY + 0.052, 0.3], `matRailX${x}`);
  }
  for (const z of [-0.48, 1.08]) {
    box([2.5, 0.018, 0.035], P.iron, [0, deckY + 0.052, z], `matRailZ${z}`);
  }

  // Heavy molded pedestal and its broad circular foot.
  cyl(0.56, 0.12, P.iron, [0, deckY + 0.06, tableCenter[2]], "pedestalFoot", 16);
  cyl(0.47, 0.035, P.black, [0, deckY + 0.137, tableCenter[2]], "pedestalFootRubber", 16);
  cyl(0.33, 0.17, P.iron, [0, deckY + 0.23, tableCenter[2]], "pedestalLowerBoss", 12);
  cyl(0.205, 0.52, P.iron, [0, deckY + 0.55, tableCenter[2]], "pedestalColumn", 10);
  cyl(0.24, 0.07, P.black, [0, deckY + 0.76, tableCenter[2]], "pedestalUpperCollar", 12);
  cyl(0.34, 0.10, P.iron, [0, deckY + 0.83, tableCenter[2]], "pedestalTopBoss", 12);

  // Vertical ribs around the central pedestal.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.cos(a) * 0.218;
    const z = tableCenter[2] + Math.sin(a) * 0.218;
    box([0.026, 0.46, 0.026], P.rib, [x, deckY + 0.54, z], `pedestalRib${i}`, [0, -a, 0]);
  }
  for (const y of [deckY + 0.32, deckY + 0.47, deckY + 0.63, deckY + 0.75]) {
    torus(0.222, 0.018, P.rib, [0, y, tableCenter[2]], `pedestalRibBand${y}`, 12);
  }

  // Chunky octagonal molded tabletop, underside shadow, rim and inset top.
  cyl(0.9, 0.17, P.iron, [0, deckY + 0.895, tableCenter[2]], "tabletopUnderside", 8);
  cyl(0.88, 0.16, P.tabletop, [0, deckY + 0.985, tableCenter[2]], "moldedOctagonalTabletop", 8);
  torus(0.82, 0.035, P.rib, [0, deckY + 1.068, tableCenter[2]], "tabletopRaisedEdge", 8);
  cyl(0.73, 0.018, P.cabinet, [0, deckY + 1.076, tableCenter[2]], "tabletopInset", 8);

  // Molded edge blocks and dark seam marks around the table.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * 0.79;
    const z = tableCenter[2] + Math.sin(a) * 0.79;
    box([0.09, 0.11, 0.025], P.rib, [x, deckY + 0.99, z], `tableEdgeBumper${i}`, [0, -a, 0]);
  }
  for (const x of [-0.52, 0, 0.52]) {
    box([0.018, 0.012, 1.18], P.black, [x, deckY + 1.091, tableCenter[2]], `tabletopSeamX${x}`);
  }
  for (const z of [-0.02, 0.52]) {
    box([1.38, 0.012, 0.018], P.black, [0, deckY + 1.092, tableCenter[2] + z], `tabletopSeamZ${z}`);
  }

  // Six attached swivel stools, deliberately slightly varied in height.
  const stools = [
    { x: 0, z: 1.38, y: 0.70, r: 0.31, rot: 0 },
    { x: 1.02, z: 0.92, y: 0.66, r: 0.30, rot: -18 },
    { x: 1.13, z: -0.12, y: 0.72, r: 0.30, rot: 15 },
    { x: 0, z: -0.70, y: 0.64, r: 0.32, rot: 0 },
    { x: -1.08, z: -0.12, y: 0.69, r: 0.30, rot: -14 },
    { x: -1.00, z: 0.92, y: 0.75, r: 0.31, rot: 20 },
  ];

  stools.forEach((s, i) => {
    const x = s.x;
    const z = s.z;
    const baseY = deckY + 0.05;
    const seatBottom = deckY + s.y - 0.06;

    cyl(0.27, 0.10, P.black, [x, baseY, z], `stool${i}WeightedBase`, 12);
    cyl(0.22, 0.028, P.rubber, [x, deckY + 0.105, z], `stool${i}RubberPad`, 12);
    cyl(0.075, Math.max(0.32, seatBottom - (deckY + 0.13)), P.iron, [x, (deckY + 0.13 + seatBottom) / 2, z], `stool${i}Stem`, 8);
    cyl(0.11, 0.055, P.iron, [x, seatBottom - 0.025, z], `stool${i}StemCollar`, 10);
    cyl(s.r, 0.115, P.stool, [x, deckY + s.y, z], `stool${i}MoldedSeat`, 10);
    torus(s.r * 0.82, 0.025, P.rib, [x, deckY + s.y + 0.056, z], `stool${i}SeatRim`, 10);
    cyl(s.r * 0.62, 0.018, P.cabinet, [x, deckY + s.y + 0.067, z], `stool${i}SeatInset`, 10);

    // A pair of dark seat seam bars gives each seat the molded industrial language.
    box([s.r * 1.28, 0.012, 0.018], P.black, [x, deckY + s.y + 0.078, z], `stool${i}SeatSeamA`, [0, s.rot, 0]);
    box([0.018, 0.012, s.r * 1.28], P.black, [x, deckY + s.y + 0.079, z], `stool${i}SeatSeamB`, [0, s.rot, 0]);
  });

  // Metal serving tray with a raised rim and three recessed dark compartments.
  box([0.66, 0.035, 0.36], P.iron, [-0.22, deckY + 1.106, 0.12], "servingTrayBase", [0, -8, 0]);
  box([0.69, 0.028, 0.025], P.rib, [-0.22, deckY + 1.145, -0.07], "trayFrontRim", [0, -8, 0]);
  box([0.69, 0.028, 0.025], P.rib, [-0.22, deckY + 1.145, 0.31], "trayBackRim", [0, -8, 0]);
  box([0.025, 0.028, 0.34], P.rib, [-0.565, deckY + 1.145, 0.12], "trayLeftRim", [0, -8, 0]);
  box([0.025, 0.028, 0.34], P.rib, [0.125, deckY + 1.145, 0.12], "trayRightRim", [0, -8, 0]);
  for (const x of [-0.43, -0.22, -0.01]) {
    box([0.17, 0.018, 0.27], P.black, [x, deckY + 1.13, 0.12], `trayRecess${x}`, [0, -8, 0]);
  }
  box([0.018, 0.025, 0.29], P.rib, [-0.325, deckY + 1.15, 0.12], "trayDividerA", [0, -8, 0]);
  box([0.018, 0.025, 0.29], P.rib, [-0.115, deckY + 1.15, 0.12], "trayDividerB", [0, -8, 0]);

  // Four small cream cups with dark interiors and tiny handles.
  const cups: [number, number, number][] = [
    [0.38, 0.08, 0.38],
    [0.64, 0.08, 0.36],
    [0.39, 0.08, 0.67],
    [0.64, 0.08, 0.65],
  ];
  cups.forEach((p, i) => {
    cone(0.075, 0.062, 0.105, P.chalk, [p[0], deckY + 1.145, p[2]], `cup${i}`, 10);
    cyl(0.052, 0.008, P.black, [p[0], deckY + 1.202, p[2]], `cup${i}Coffee`, 10);
    torus(0.042, 0.012, P.stool, [p[0] + 0.067, deckY + 1.17, p[2]], `cup${i}Handle`, 8);
  });

  // Brass ashtray with a raised lip and dark center.
  cyl(0.105, 0.035, P.brass, [-0.56, deckY + 1.145, 0.58], "ashtrayBody", 12);
  torus(0.082, 0.018, P.brass, [-0.56, deckY + 1.167, 0.58], "ashtrayLip", 12);
  cyl(0.061, 0.012, P.black, [-0.56, deckY + 1.171, 0.58], "ashtrayBowl", 12);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI * 0.5;
    box([0.012, 0.014, 0.05], P.black, [-0.56 + Math.cos(a) * 0.06, deckY + 1.18, 0.58 + Math.sin(a) * 0.06], `ashtrayNotch${i}`, [0, -a, 0]);
  }

  // Lidded beaker / thermos at the front edge.
  cone(0.085, 0.105, 0.19, P.olive, [0.35, deckY + 1.22, -0.28], "liddedBeakerBody", 10);
  cyl(0.078, 0.018, P.brass, [0.35, deckY + 1.325, -0.28], "beakerLid", 10);
  cyl(0.038, 0.045, P.brass, [0.35, deckY + 1.355, -0.28], "beakerLidButton", 8);
  box([0.018, 0.12, 0.22], P.rust, [0.454, deckY + 1.22, -0.28], "beakerStripe");

  // Fan of cards in a chalk sleeve, with individual dark pips.
  box([0.36, 0.025, 0.25], P.chalk, [-0.52, deckY + 1.145, -0.30], "cardPack", [0, -18, 0]);
  box([0.34, 0.012, 0.025], P.black, [-0.52, deckY + 1.166, -0.18], "cardPackTopStripe", [0, -18, 0]);
  for (let i = 0; i < 6; i++) {
    const a = -0.48 + i * 0.12;
    box([0.16, 0.012, 0.22], P.chalk, [a, deckY + 1.18, -0.48 + i * 0.025], `fanCard${i}`, [0, -18 + i * 7, 0]);
    cyl(0.012, 0.008, P.black, [a - 0.035, deckY + 1.19, -0.48 + i * 0.025], `card${i}PipA`, 6);
    cyl(0.012, 0.008, P.black, [a + 0.035, deckY + 1.19, -0.48 + i * 0.025], `card${i}PipB`, 6);
  }

  // Small table-edge fasteners and warning tabs, reinforcing the 1979 molded hardware feel.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * 0.72;
    const z = tableCenter[2] + Math.sin(a) * 0.72;
    cyl(0.018, 0.012, i % 2 ? P.brass : P.rust, [x, deckY + 1.095, z], `tableFastener${i}`, 8);
  }
  box([0.24, 0.014, 0.045], P.warning, [0, deckY + 1.098, -0.37], "tableWarningStripeA");
  box([0.045, 0.014, 0.24], P.black, [0, deckY + 1.099, -0.37], "tableWarningStripeB");
  box([0.018, 0.04, 0.18], P.rust, [-0.78, deckY + 0.93, 0.28], "tableSideRustPlate", [0, 0, 90]);
}
```