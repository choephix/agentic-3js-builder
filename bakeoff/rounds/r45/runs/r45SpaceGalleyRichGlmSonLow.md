<!-- call: plan -->

```json
{
  "name": "Nostromo Galley Kitchen",
  "description": "A worn commercial-crew galley from a 1979 mining freighter: grated deck, a cluttered counter run of retro appliances under upper cabinets, a central mess table with attached chairs, glowing CRTs and warning signage in yellowed industrial plastic.",
  "builderName": "nostromoGalley",
  "size": [4.2, 2.6, 5.0],
  "layout": "Static interior set on a deck of floor grating (the only floor-contact pieces: grating, table base, chairs, oven feet). The back wall runs along z = -2.4 with the galley counter run against it: lower cabinet boxes to y 1.0, worktop at y 1.0-1.06, upper cabinets and a hood from y 1.7 to 2.1. Appliances sit on the worktop and against the wall: a tall oven/range unit on the left, a bulky coffee machine and water boiler centre-right, a wall-mounted CRT monitor with glowing amber screen above the counter. The open galley front (facing +Z) holds a central mess table at z +0.7 with two stools. Every surface is yellowed, flat-panelled retro plastic with recessed inset panels, mustard edge trim, dark charcoal seams, copper conduit runs on the wall, warning stripes at knee height, and one amber CRT plus small red/teal indicator lights as the only glow. Style is blocky 70s industrial: chunky slabs, visible rivets, chunky chunky chunky, no curves beyond cylinders and lathed pots.",
  "palette": {
    "panelBeige": "#a89f88",
    "panelGrey": "#7d7a6e",
    "panelOlive": "#6e6c52",
    "creamInset": "#d8d2bc",
    "mustardTrim": "#c8a03a",
    "darkSeam": "#2e2c28",
    "steelDark": "#4a4a48",
    "steelLight": "#8f8f8a",
    "copperPipe": "#9a6a3c",
    "warningYellow": "#e0b520",
    "blackStripe": "#1c1b18",
    "grate": "#55524a",
    "crtAmber": "#ffb642",
    "crtAmberGlow": "#ff8c1a",
    "redLight": "#c23b2a",
    "tealLight": "#37e0d8",
    "whiteEnamel": "#e8e4d8",
    "coffeeDark": "#2a1a10",
    "tableGrey": "#666e64",
    "seatRust": "#8a4a2c",
    "packetRed": "#a83228",
    "packetBlue": "#3c5a7c",
    "labelCream": "#efe8d0"
  },
  "mounts": {
    "deckTop": [0, 0.12, 0],
    "backWall": [0, 0, -2.4],
    "counterTop": [0, 1.06, -1.85],
    "counterFront": [0, 1.0, -1.35],
    "tableBase": [0, 0.12, 0.7],
    "ceilingLine": [0, 2.5, -1.8]
  },
  "joints": [],
  "parts": [
    {
      "id": "shell",
      "builds": "The room shell: a grated metal deck of repeated grate panels (dark grate with steelLight edge trim, sunk 0.12 m) across the whole floor; a back wall of large flat panelBeige slabs with recessed creamInset panel insets, darkSeam vertical seams and chunky mustardTrim corner strips from deck to ceiling 2.5 m; two side wall strips at x = ±2.0 (panelGrey with creamInset inset panels and a knee-height blackStripe/warningYellow hazard stripe band); a shallow ceiling slab with a recessed long fluorescent light housing (whiteEnamel diffuser panel, steelLight frame) above the counter; a run of copperPipe conduits with darkSeam clips and two valve wheels riding the back wall from deck to ceiling; a small tealLight status panel on the back wall.",
      "box": [[-2.1, 0.0, -2.6], [2.1, 2.6, 2.5]],
      "attaches": "Back wall panels sit on the backWall plane; everything stands on the deck the shell itself builds; the light housing hangs at ceilingLine.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "galleyRun",
      "builds": "The counter run against the back wall: lower cabinet boxes from deckTop to counterTop in panelBeige slabs with creamInset door insets, chunky mustardTrim edge rails, darkSeam gaps between doors and rows of small steelDark round knobs; a steelDark worktop slab 0.06 thick with a raised back splash and an inset stainless sink basin (steelLight, creamInset draining board grooves, a lathed steelDark faucet with two red/teal valve knobs); a drawer stack with mustardTrim pull rails; upper cabinets from y 1.7 to 2.1 in panelGrey with creamInset insets, darkSeam seams and mustardTrim bottom rails, one door ajar showing shelf lines; a range hood slab above the cooking position with a small redLight indicator and copperPipe duct rising to the ceiling.",
      "box": [[-2.1, 0.12, -2.5], [2.1, 2.5, -1.3]],
      "attaches": "Cabinet bases rest on deckTop; back edges flush with the backWall plane; worktop top surface is counterTop; hood and duct reach ceilingLine.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "appliances",
      "builds": "The appliances that make it a kitchen: a tall oven/range unit (steelDark body with panelBeige door panels, chunky darkSeam handle bar, a creamInset dial cluster of five round dials, a small redLight oven lamp, thick steelDark feet standing on the deck) in the left counter bay; a big boxy coffee machine (panelGrey body, mustardTrim top plate, glass lathed coffee pot with dark coffee and a whiteEnamel handle, redLight brew lamp) on the counter right of the sink; a cylindrical copper water boiler with steelDark bands, a gauge dial and two copperPipe hoses hooked to the wall; a metal toaster and a stack of three whiteEnamel mess tins; a wall-mounted CRT monitor on an articulated steelDark arm above the counter with a glowing crtAmber screen inside a creamInset bezel, glow applied so the screen lights up.",
      "box": [[-2.1, 0.0, -2.45], [1.2, 2.1, -1.28]],
      "attaches": "Oven feet land on deckTop and its back meets backWall; counter appliances sit on the counterTop surface; CRT arm bolts to backWall above counterTop.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "messTable",
      "builds": "The mess table and seating in the open floor area: a heavy round-lathe pedestal base in steelDark on the deck, a chunky cross-foot, a thick tableGrey top slab with a mustardTrim edge band; two padded stools (seatRust seats, steelDark lathe legs, chunky footring) facing the counter; on the table a lathed coffee urn with tealLight indicator, two whiteEnamel mugs with coffeeDark rims, a stack of paperCream note sheets with a mustardTrim clip, an ashtray with a cigarette, and a lunched tray with a packetRed food pack and a fork strip; a steelDark towel rail hanging off the table edge.",
      "box": [[-1.3, 0.0, -0.4], [1.3, 1.15, 1.9]],
      "attaches": "Pedestal and stool feet stand on deckTop; nothing else meets this part except the deck plane.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "propsAndSignage",
      "builds": "The clutter and signage that sells the crew ship: a large painted wall sign on the back wall (warningYellow and blackStripe hazard chevrons plus a creamInset rectangular placard reading as a galley notice with redLight and packetBlue text blocks as flat colour strips); a steelDark fire extinguisher on a wall bracket with a mustardTrim band and hose; a whiteEnamel first-aid box with a redLight cross; a stack of two panelGrey supply crates with creamInset stencil strips and mustardTrim banding in the right floor corner; a hanging rack of three copper pots and lathed pans above the counter end; a floor caddy with a mop and whiteEnamel bucket; three spare coffee cups and a packetBlue food pouch on the counter's far right.",
      "box": [[-2.1, 0.0, -2.5], [2.1, 2.3, 2.3]],
      "attaches": "Sign, extinguisher, first-aid box and pot rack bolt to backWall and galleyRun cabinets above counterTop; crates and caddy stand on deckTop; loose cups sit on counterTop and crates.",
      "joints": [],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: shell -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildShell({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z] });

  // Deck: floor grating panels, top at y=0.12 (sunk look: base slab down to 0)
  box(4.2, 0.1, 5.1, P.darkSeam, 0, 0.05, -0.05);
  const nx = 8, nz = 10;
  const pw = 4.2 / nx, pd = 5.0 / nz;
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const x = -2.1 + pw * (i + 0.5);
      const z = -2.55 + pd * (j + 0.5);
      box(pw - 0.03, 0.04, pd - 0.03, i % 2 === j % 2 ? P.grate : P.panelGrey, x, 0.1, z);
      // edge trim on every other panel row
      if (i % 2 === 0 && j % 2 === 0) box(pw - 0.03, 0.02, 0.025, P.steelLight, x, 0.12, z - pd / 2 + 0.02);
    }

  // Back wall slabs
  const slabW = 1.0;
  for (let i = 0; i < 4; i++) {
    const x = -1.5 + i * slabW + 0.0;
    box(slabW - 0.02, 2.4, 0.1, P.panelBeige, x, 1.3, -2.55);
    box(slabW - 0.3, 1.5, 0.03, P.creamInset, x, 1.3, -2.49);
    box(slabW - 0.38, 1.42, 0.02, P.panelBeige, x, 1.3, -2.475);
    box(0.025, 2.4, 0.04, P.darkSeam, x + slabW / 2, 1.3, -2.49);
    for (const s of [1, -1]) for (const yy of [0.7, 1.9]) cyl(0.012, 0.02, P.steelDark, x + s * 0.4, yy, -2.485, 6).rotation.x = Math.PI / 2;
  }
  // mustard corner strips
  for (const s of [1, -1]) {
    box(0.14, 2.5, 0.14, P.mustardTrim, s * 2.03, 1.25, -2.5);
    box(0.14, 0.05, 0.14, P.darkSeam, s * 2.03, 2.47, -2.5);
  }

  // Side walls
  for (const s of [1, -1]) {
    const x = s * 2.05;
    box(0.1, 2.45, 5.0, P.panelGrey, x, 1.3, -0.05);
    for (let k = 0; k < 4; k++) {
      const z = -1.6 + k * 1.15;
      box(0.03, 1.2, 0.9, P.creamInset, x - s * 0.06, 1.45, z);
      box(0.02, 1.1, 0.8, P.panelGrey, x - s * 0.07, 1.45, z);
      box(0.04, 2.3, 0.03, P.darkSeam, x - s * 0.055, 1.3, z + 0.575);
    }
    // hazard band knee height
    for (let k = 0; k < 24; k++) {
      const z = -2.3 + k * 0.2;
      box(0.03, 0.2, 0.1, k % 2 ? P.blackStripe : P.warningYellow, x - s * 0.06, 0.45, z);
    }
    box(0.035, 0.02, 4.9, P.blackStripe, x - s * 0.06, 0.34, -0.05);
    box(0.035, 0.02, 4.9, P.blackStripe, x - s * 0.06, 0.56, -0.05);
  }

  // Ceiling
  box(4.2, 0.1, 5.1, P.panelGrey, 0, 2.55, -0.05);
  for (let k = 0; k < 4; k++) box(4.1, 0.03, 0.04, P.darkSeam, 0, 2.49, -2 + k * 1.3);
  // Light housing
  box(2.2, 0.08, 0.5, P.steelLight, 0, 2.46, -1.8);
  box(2.0, 0.03, 0.34, P.whiteEnamel, 0, 2.4, -1.8);
  for (const s of [1, -1]) box(0.05, 0.1, 0.5, P.steelDark, s * 1.1, 2.44, -1.8);

  // Copper conduits on back wall
  const px = [-1.85, -1.7, 1.75];
  px.forEach((x, i) => {
    cyl(0.03, 2.4, P.copperPipe, x, 1.3, -2.46);
    for (let k = 0; k < 5; k++) {
      const y = 0.4 + k * 0.5 + i * 0.07;
      box(0.09, 0.04, 0.05, P.darkSeam, x, y, -2.455);
    }
  });
  // horizontal run
  const hp = cyl(0.025, 0.4, P.copperPipe, -1.775, 2.25, -2.44);
  hp.rotation.z = Math.PI / 2;
  // valve wheels
  for (const [x, y] of [[-1.7, 1.2], [1.75, 0.9]]) {
    const w = b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10), P.redLight, { at: [x, y, -2.4] });
    cyl(0.015, 0.06, P.steelDark, x, y, -2.43).rotation.x = Math.PI / 2;
    box(0.1, 0.012, 0.012, P.redLight, x, y, -2.395);
    box(0.012, 0.1, 0.012, P.redLight, x, y, -2.395);
  }

  // Teal status panel
  box(0.4, 0.26, 0.04, P.steelDark, 1.2, 2.25, -2.47);
  box(0.34, 0.2, 0.02, P.creamInset, 1.2, 2.25, -2.45);
  for (let k = 0; k < 5; k++) box(0.045, 0.045, 0.02, k === 2 ? P.redLight : P.tealLight, 1.06 + k * 0.07, 2.25, -2.435);
  box(0.3, 0.03, 0.01, P.darkSeam, 1.2, 2.33, -2.44);
}
```

<!-- call: galleyRun -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

export function buildGalleyRun({ b, P }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });

  const zBack = -2.4, depth = 0.9, zc = zBack + depth / 2, zf = zBack + depth;
  const y0 = 0.12, yTop = 1.0;
  const h = yTop - y0;

  // lower carcass
  box(4.1, h, depth, P.panelBeige, 0, y0 + h / 2, zc);
  // kick plate
  box(4.1, 0.1, depth - 0.08, P.darkSeam, 0, y0 + 0.05, zc + 0.02);
  // top and bottom mustard rails
  box(4.14, 0.05, 0.04, P.mustardTrim, 0, yTop - 0.03, zf + 0.01);
  box(4.14, 0.05, 0.04, P.mustardTrim, 0, y0 + 0.14, zf + 0.01);
  // end caps
  for (const s of [-1, 1]) box(0.05, h, 0.04, P.mustardTrim, s * 2.05, y0 + h / 2, zf + 0.01);

  // doors: bays
  const bays = 8, bw = 4.0 / bays;
  for (let i = 0; i < bays; i++) {
    const x = -2.0 + bw * (i + 0.5);
    const drawer = i >= 3 && i <= 4;
    if (drawer) {
      for (let k = 0; k < 3; k++) {
        const yy = 0.36 + k * 0.22;
        box(bw - 0.05, 0.19, 0.03, P.creamInset, x, yy + 0.2, zf + 0.015);
        box(bw * 0.6, 0.03, 0.04, P.mustardTrim, x, yy + 0.25, zf + 0.04);
        box(bw - 0.03, 0.012, 0.035, P.darkSeam, x, yy + 0.09, zf + 0.015);
      }
    } else {
      box(bw - 0.07, h - 0.4, 0.03, P.creamInset, x, y0 + 0.14 + (h - 0.14) / 2 - 0.05, zf + 0.015);
      box(bw - 0.12, h - 0.5, 0.012, P.panelBeige, x, y0 + 0.14 + (h - 0.14) / 2 - 0.05, zf + 0.035);
      cyl(0.022, 0.022, 0.04, P.steelDark, x + (i % 2 ? -1 : 1) * (bw / 2 - 0.1), 0.8, zf + 0.05, 8, [90, 0, 0]);
    }
    box(0.014, h - 0.2, 0.04, P.darkSeam, x - bw / 2, y0 + h / 2 + 0.05, zf + 0.015);
  }

  // worktop
  box(4.1, 0.06, depth + 0.08, P.steelDark, 0, 1.03, zc + 0.04);
  box(4.1, 0.2, 0.05, P.steelDark, 0, 1.16, zBack + 0.03);
  box(4.1, 0.02, 0.03, P.mustardTrim, 0, 1.07, zf + 0.09);

  // sink
  const sx = -0.4, sz = zc + 0.02;
  box(1.0, 0.012, 0.6, P.steelLight, sx, 1.066, sz);
  box(0.5, 0.014, 0.46, P.darkSeam, sx - 0.2, 1.07, sz);
  box(0.46, 0.016, 0.42, P.steelLight, sx - 0.2, 1.072, sz);
  for (let g = 0; g < 6; g++) box(0.3, 0.008, 0.012, P.creamInset, sx + 0.3, 1.075, sz - 0.2 + g * 0.08);
  // faucet
  cyl(0.03, 0.04, 0.3, P.steelDark, sx, 1.2, zBack + 0.2, 10);
  cyl(0.02, 0.02, 0.26, P.steelDark, sx, 1.34, zBack + 0.33, 8, [90, 0, 0]);
  cyl(0.025, 0.015, 0.06, P.steelDark, sx, 1.3, zBack + 0.45);
  cyl(0.035, 0.035, 0.03, P.redLight, sx - 0.14, 1.28, zBack + 0.2, 8);
  cyl(0.035, 0.035, 0.03, P.tealLight, sx + 0.14, 1.28, zBack + 0.2, 8);

  // uppers
  const uy = 1.9, uh = 0.4, ud = 0.5;
  const ub = 6, uw = 4.0 / ub;
  box(4.1, uh, ud, P.panelGrey, 0, uy, zBack + ud / 2);
  box(4.14, 0.05, 0.04, P.mustardTrim, 0, 1.7, zBack + ud + 0.01);
  for (let i = 0; i < ub; i++) {
    const x = -2.0 + uw * (i + 0.5);
    if (i === 4) {
      // ajar door
      box(uw - 0.1, uh - 0.1, 0.02, P.creamInset, x - 0.28, uy, zBack + ud + 0.2);
      box(uw - 0.1, 0.02, 0.4, P.steelLight, x, uy - 0.05, zBack + 0.3);
      box(uw - 0.1, 0.02, 0.4, P.steelLight, x, uy + 0.1, zBack + 0.3);
      continue;
    }
    box(uw - 0.08, uh - 0.1, 0.02, P.creamInset, x, uy, zBack + ud + 0.01);
    box(0.014, uh, 0.03, P.darkSeam, x - uw / 2, uy, zBack + ud + 0.01);
    box(0.03, 0.08, 0.03, P.mustardTrim, x + 0.2, uy - 0.1, zBack + ud + 0.03);
  }

  // hood over oven bay (left)
  const hx = -1.5;
  box(1.0, 0.1, 0.6, P.steelDark, hx, 1.62, zBack + 0.32);
  box(0.6, 0.12, 0.35, P.steelDark, hx, 1.52, zBack + 0.22);
  cyl(0.03, 0.03, 0.02, P.redLight, hx + 0.38, 1.62, zBack + 0.64, 8, [90, 0, 0]);
  // duct
  const duct = cyl(0.12, 0.12, 0.8, P.copperPipe, hx, 2.1, zBack + 0.2, 10);
  for (const dy of [1.85, 2.2, 2.45]) cyl(0.135, 0.135, 0.04, P.darkSeam, hx, dy, zBack + 0.2, 10);

  // rivets on worktop edge
  for (let i = 0; i < 20; i++) cyl(0.012, 0.012, 0.01, P.steelLight, -1.9 + i * 0.2, 1.03, zf + 0.09, 6, [90, 0, 0]);
  void R; void duct;
}
```

<!-- call: messTable -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMessTable({ b, J, P, M }: any) {
  const R = rng(11);
  const DECK = M.deckTop[1]; // 0.12 deck surface; feet sink slightly
  const FLOOR = 0.0;
  const CX = 0, CZ = M.tableBase[2];
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[]) =>
    part(new THREE.BoxGeometry(w, h, d), c, at);
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], seg = 12) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), c, at);

  const topY = 0.78;
  // Pedestal base
  cyl(0.42, 0.46, 0.06, P.steelDark, [CX, FLOOR + 0.03, CZ], 16);
  cyl(0.3, 0.38, 0.08, P.steelDark, [CX, 0.1, CZ], 16);
  // cross foot
  box(1.3, 0.07, 0.2, P.steelDark, [CX, FLOOR + 0.035, CZ]);
  box(0.2, 0.07, 1.3, P.steelDark, [CX, FLOOR + 0.035, CZ]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(0.07, 0.07, 0.04, P.mustardTrim, [sx * 0.6, 0.07, CZ + sz * 0.0], 8);
  }
  // column
  cyl(0.12, 0.15, topY - 0.2, P.steelDark, [CX, 0.14 + (topY - 0.2) / 2, CZ], 10);
  cyl(0.17, 0.17, 0.04, P.mustardTrim, [CX, 0.45, CZ], 10);
  cyl(0.2, 0.14, 0.06, P.steelDark, [CX, topY - 0.07, CZ], 12);
  // top slab (square-ish slab with trim)
  const TW = 1.4, TD = 1.0, TT = 0.07;
  box(TW, TT, TD, P.tableGrey, [CX, topY + TT / 2, CZ]);
  const ty = topY + TT / 2;
  box(TW + 0.04, 0.05, 0.03, P.mustardTrim, [CX, ty, CZ + TD / 2 + 0.01]);
  box(TW + 0.04, 0.05, 0.03, P.mustardTrim, [CX, ty, CZ - TD / 2 - 0.01]);
  for (const s of [-1, 1]) box(0.03, 0.05, TD, P.mustardTrim, [s * (TW / 2 + 0.01), ty, CZ]);
  // rivets on the top
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    cyl(0.015, 0.015, 0.01, P.steelLight, [sx * (TW / 2 - 0.05), topY + TT + 0.004, CZ + sz * (TD / 2 - 0.05)], 6);
  const T = topY + TT; // table surface

  // Stools facing the counter (counter is at -z, stools on +z side, facing -z)
  for (const sx of [-0.4, 0.4]) {
    const sz = CZ + 0.95, sh = 0.5;
    cyl(0.2, 0.2, 0.08, P.seatRust, [sx, sh, sz], 14);
    cyl(0.21, 0.21, 0.025, P.mustardTrim, [sx, sh - 0.045, sz], 14);
    cyl(0.17, 0.2, 0.04, P.seatRust, [sx, sh + 0.05, sz], 14);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const lx = sx + Math.cos(a) * 0.15, lz = sz + Math.sin(a) * 0.15;
      cyl(0.022, 0.022, sh - 0.04, P.steelDark, [lx, (sh - 0.04) / 2 + 0.0, lz], 8);
      cyl(0.03, 0.03, 0.03, P.steelLight, [lx, 0.015, lz], 8);
    }
    // footring
    part(new THREE.TorusGeometry(0.17, 0.014, 6, 16), P.steelDark, [sx, 0.22, sz], { rotation: [90, 0, 0] });
    // backrest-less grab handle on seat edge
    box(0.12, 0.02, 0.02, P.mustardTrim, [sx, sh + 0.075, sz + 0.14]);
  }

  // Coffee urn
  const ux = -0.4, uz = CZ - 0.2;
  const urn = b.lathe([[0, 0], [0.11, 0], [0.12, 0.03], [0.12, 0.28], [0.09, 0.34], [0.05, 0.36], [0, 0.37]], {
    at: [ux, T, uz], color: P.steelLight, segments: 12,
  });
  cyl(0.125, 0.125, 0.03, P.steelDark, [ux, T + 0.015, uz], 12);
  cyl(0.125, 0.125, 0.025, P.mustardTrim, [ux, T + 0.2, uz], 12);
  cyl(0.03, 0.03, 0.03, P.steelDark, [ux, T + 0.385, uz], 8);
  box(0.05, 0.03, 0.05, P.steelDark, [ux, T + 0.08, uz + 0.13]);
  cyl(0.012, 0.012, 0.06, P.steelDark, [ux, T + 0.05, uz + 0.15], 6);
  glow(part(new THREE.SphereGeometry(0.014, 6, 4), P.tealLight, [ux + 0.05, T + 0.26, uz + 0.118]), 1.5);
  box(0.03, 0.14, 0.015, P.coffeeDark, [ux + 0.1, T + 0.25, uz + 0.04]);

  // Mugs
  for (const [mx, mz, ry] of [[0.15, CZ - 0.05, 20], [0.3, CZ + 0.2, -40]] as number[][]) {
    cyl(0.045, 0.04, 0.09, P.whiteEnamel, [mx, T + 0.045, mz], 10);
    cyl(0.038, 0.038, 0.006, P.coffeeDark, [mx, T + 0.088, mz], 10);
    cyl(0.047, 0.047, 0.008, P.coffeeDark, [mx, T + 0.088, mz], 10).mesh.scale.set(1, 0.4, 1);
    const a = (ry * Math.PI) / 180;
    part(new THREE.TorusGeometry(0.025, 0.006, 5, 8), P.whiteEnamel,
      [mx + Math.cos(a) * 0.055, T + 0.045, mz - Math.sin(a) * 0.055], { rotation: [0, ry, 0] });
  }

  // Note sheets stack with clip
  const nx = -0.5, nz = CZ + 0.3;
  for (let i = 0; i < 4; i++)
    box(0.22, 0.004, 0.3, i % 2 ? "#e6dfc4" : "#efe8d0", [nx + (R() - 0.5) * 0.01, T + 0.003 + i * 0.004, nz + (R() - 0.5) * 0.01]);
  box(0.06, 0.02, 0.03, P.mustardTrim, [nx, T + 0.015, nz - 0.14]);
  box(0.12, 0.002, 0.01, P.darkSeam, [nx, T + 0.02, nz + 0.05]);
  box(0.12, 0.002, 0.01, P.darkSeam, [nx, T + 0.02, nz + 0.08]);

  // Ashtray + cigarette
  const ax = 0.52, az = CZ - 0.3;
  cyl(0.06, 0.05, 0.02, P.steelDark, [ax, T + 0.01, az], 10);
  cyl(0.045, 0.045, 0.004, "#1a1a18", [ax, T + 0.02, az], 10);
  cyl(0.004, 0.004, 0.08, P.labelCream, [ax + 0.01, T + 0.026, az], 5).mesh.rotation.z = Math.PI / 2 - 0.2;
  cyl(0.0042, 0.0042, 0.012, P.redLight, [ax + 0.048, T + 0.03, az], 5).mesh.rotation.z = Math.PI / 2 - 0.2;

  // Tray with food pack and fork
  const tx = 0.25, tz = CZ + 0.28;
  box(0.4, 0.015, 0.28, P.steelLight, [tx, T + 0.008, tz]);
  for (const s of [-1, 1]) box(0.4, 0.03, 0.012, P.steelLight, [tx, T + 0.02, tz + s * 0.134]);
  for (const s of [-1, 1]) box(0.012, 0.03, 0.28, P.steelLight, [tx + s * 0.194, T + 0.02, tz]);
  box(0.14, 0.03, 0.1, P.packetRed, [tx - 0.08, T + 0.03, tz - 0.02]);
  box(0.1, 0.006, 0.05, P.labelCream, [tx - 0.08, T + 0.048, tz - 0.02]);
  box(0.1, 0.005, 0.015, P.darkSeam, [tx - 0.08, T + 0.052, tz - 0.02]);
  box(0.012, 0.004, 0.14, P.steelLight, [tx + 0.1, T + 0.017, tz]);
  for (let i = 0; i < 3; i++) box(0.003, 0.004, 0.035, P.steelLight, [tx + 0.094 + i * 0.006, T + 0.017, tz + 0.085]);
  cyl(0.05, 0.05, 0.015, P.packetBlue, [tx + 0.0, T + 0.02, tz + 0.08], 8);

  // Towel rail hanging off the table edge (front, +z)
  const rz = CZ + TD / 2 + 0.07, ry2 = topY - 0.1;
  for (const s of [-1, 1]) {
    box(0.03, 0.06, 0.1, P.steelDark, [s * 0.5, topY - 0.03, rz - 0.04]);
    box(0.03, 0.03, 0.1, P.steelDark, [s * 0.5, ry2, rz - 0.04]);
  }
  cyl(0.014, 0.014, 1.04, P.steelDark, [0, ry2, rz], 8).mesh.rotation.z = Math.PI / 2;
  // towel
  box(0.4, 0.2, 0.02, P.labelCream, [0.1, ry2 - 0.09, rz + 0.012]);
  box(0.4, 0.03, 0.022, P.packetBlue, [0.1, ry2 - 0.15, rz + 0.012]);
}
```

<!-- call: appliances -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildAppliances({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 12, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, dir ? { at: [x, y, z], dir } : { at: [x, y, z] });
  const ball = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });
  const F: number[] = [0, 0, 1];

  // ===== OVEN (left bay) =====
  const ox = -1.55, oz = -2.0, ow = 0.9, od = 0.8;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.05, 0.12, P.steelDark, ox + sx * 0.38, 0.12 + 0.06, oz + sz * 0.3, 8);
  box(ow, 1.0, od, P.steelDark, ox, 0.18 + 0.5, oz);
  box(ow + 0.04, 0.05, od + 0.04, P.mustardTrim, ox, 1.2, oz);
  // backsplash control panel
  box(ow, 0.3, 0.12, P.steelDark, ox, 1.35, oz - 0.34);
  box(ow - 0.1, 0.22, 0.02, P.creamInset, ox, 1.35, oz - 0.27);
  // door panels
  box(0.76, 0.5, 0.04, P.panelBeige, ox, 0.55, oz + 0.41);
  box(0.62, 0.34, 0.02, P.darkSeam, ox, 0.55, oz + 0.44);
  box(0.5, 0.24, 0.02, P.steelLight, ox, 0.55, oz + 0.455);
  box(0.76, 0.2, 0.04, P.panelBeige, ox, 0.98, oz + 0.41);
  box(0.76, 0.01, 0.045, P.darkSeam, ox, 0.855, oz + 0.41);
  box(0.76, 0.2, 0.04, P.panelBeige, ox, 0.28, oz + 0.41);
  // handle bar
  cyl(0.022, 0.7, P.darkSeam, ox, 0.86, oz + 0.5, 8, [1, 0, 0]);
  for (const sx of [-1, 1]) cyl(0.015, 0.1, P.darkSeam, ox + sx * 0.33, 0.86, oz + 0.45, 6, F);
  // dials
  for (let i = 0; i < 5; i++) {
    const dx = ox - 0.32 + i * 0.16;
    cyl(0.04, 0.03, P.creamInset, dx, 0.98, oz + 0.43, 12, F);
    box(0.006, 0.04, 0.012, P.darkSeam, dx, 0.99, oz + 0.45);
  }
  cyl(0.025, 0.02, P.redLight, ox + 0.36, 1.1, oz + 0.43, 8, F);
  glow(cyl(0.02, 0.025, P.redLight, ox + 0.35, 1.37, oz - 0.25, 8, F), 1.4);
  // burners
  for (const [bx, bz] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.18], [0.2, 0.18]])
    cyl(0.1, 0.02, P.darkSeam, ox + bx, 1.235, oz + bz, 12);

  // ===== COFFEE MACHINE =====
  const cx = 0.25, cz = -2.0;
  box(0.5, 0.5, 0.45, P.panelGrey, cx, 1.06 + 0.25, cz);
  box(0.54, 0.05, 0.49, P.mustardTrim, cx, 1.59, cz);
  box(0.4, 0.2, 0.02, P.creamInset, cx, 1.35, cz + 0.23);
  box(0.46, 0.04, 0.3, P.steelDark, cx, 1.1, cz + 0.2); // warming plate
  glow(cyl(0.025, 0.02, P.redLight, cx + 0.15, 1.42, cz + 0.24, 8, F), 1.5);
  cyl(0.02, 0.02, P.steelLight, cx - 0.1, 1.42, cz + 0.24, 8, F);
  box(0.12, 0.05, 0.02, P.darkSeam, cx - 0.1, 1.3, cz + 0.24);
  // pot
  b.lathe([[0, 0], [0.09, 0], [0.1, 0.02], [0.11, 0.1], [0.095, 0.2], [0.1, 0.22], [0.0, 0.22]], { at: [cx, 1.14, cz + 0.2], color: "#8fb0a8", segments: 12 });
  b.lathe([[0, 0], [0.088, 0], [0.098, 0.08], [0.0, 0.08]], { at: [cx, 1.15, cz + 0.2], color: P.coffeeDark, segments: 12 });
  box(0.025, 0.14, 0.04, P.whiteEnamel, cx + 0.14, 1.26, cz + 0.2);
  box(0.12, 0.025, 0.04, P.whiteEnamel, cx + 0.1, 1.33, cz + 0.2);
  cyl(0.115, 0.03, P.steelDark, cx, 1.375, cz + 0.2, 12);

  // ===== BOILER =====
  const bx = 0.95, bz = -2.15;
  cyl(0.2, 0.7, P.copperPipe, bx, 1.06 + 0.35, bz, 14);
  cyl(0.21, 0.06, P.steelDark, bx, 1.2, bz, 14);
  cyl(0.21, 0.06, P.steelDark, bx, 1.55, bz, 14);
  cyl(0.19, 0.06, P.copperPipe, bx, 1.8, bz, 14);
  cyl(0.06, 0.04, P.steelDark, bx, 1.84, bz, 8);
  cyl(0.055, 0.025, P.whiteEnamel, bx, 1.4, bz + 0.2, 14, F);
  box(0.004, 0.045, 0.006, P.redLight, bx + 0.01, 1.4, bz + 0.215);
  cyl(0.065, 0.02, P.steelLight, bx, 1.4, bz + 0.19, 14, F);
  cyl(0.02, 0.08, P.steelDark, bx, 1.12, bz + 0.22, 8, F); // tap
  cyl(0.03, 0.025, P.tealLight, bx, 1.12, bz + 0.27, 8, F);
  for (const s of [-1, 1]) {
    b.sweep([[bx + s * 0.12, 1.65, bz - 0.15], [bx + s * 0.28, 1.5, bz - 0.2], [bx + s * 0.32, 1.9, bz - 0.3]], 0.02, { color: P.copperPipe });
    cyl(0.03, 0.03, P.steelDark, bx + s * 0.32, 1.92, bz - 0.33, 8);
  }

  // ===== TOASTER =====
  const tx = -0.35, tz = -1.9;
  box(0.3, 0.18, 0.2, P.steelLight, tx, 1.06 + 0.09, tz);
  box(0.26, 0.02, 0.04, P.darkSeam, tx, 1.25, tz - 0.04);
  box(0.26, 0.02, 0.04, P.darkSeam, tx, 1.25, tz + 0.05);
  box(0.03, 0.05, 0.03, P.blackStripe, tx + 0.18, 1.2, tz + 0.04);
  box(0.3, 0.02, 0.2, P.steelDark, tx, 1.07, tz);

  // ===== MESS TINS =====
  for (let i = 0; i < 3; i++) {
    cyl(0.11 - i * 0.005, 0.045, P.whiteEnamel, 0.6, 1.085 + i * 0.05, -1.65, 14);
    cyl(0.112 - i * 0.005, 0.01, P.steelLight, 0.6, 1.1 + i * 0.05, -1.65, 14);
  }

  // ===== CRT on arm =====
  const wx = -0.5, wy = 1.62;
  box(0.2, 0.2, 0.04, P.steelDark, wx, wy, -2.43);
  for (const [dx, dy] of [[-0.08, -0.08], [0.08, 0.08], [-0.08, 0.08], [0.08, -0.08]]) cyl(0.012, 0.02, P.steelLight, wx + dx, wy + dy, -2.4, 6, F);
  b.sweep([[wx, wy, -2.4], [wx, wy, -2.15], [wx + 0.15, wy + 0.02, -1.95]], 0.035, { color: P.steelDark });
  ball(0.05, P.steelLight, wx, wy, -2.15);
  ball(0.045, P.steelLight, wx + 0.15, wy + 0.02, -1.95);
  const mx = wx + 0.15, mz = -1.85, my = 1.75;
  box(0.52, 0.42, 0.3, P.panelBeige, mx, my, mz - 0.05);
  b.part(new THREE.CylinderGeometry(0.11, 0.2, 0.22, 4, 1), P.panelGrey, { at: [mx, my, mz - 0.26], dir: [0, 0, -1], rotation: [0, 0, 0] });
  box(0.56, 0.46, 0.04, P.creamInset, mx, my, mz + 0.12);
  box(0.46, 0.36, 0.03, P.darkSeam, mx, my, mz + 0.145);
  glow(box(0.4, 0.3, 0.02, P.crtAmber, mx, my, mz + 0.16), 1.6);
  for (let i = 0; i < 6; i++) glow(box(0.3, 0.012, 0.004, P.crtAmberGlow, mx - 0.03, my + 0.1 - i * 0.04, mz + 0.172), 1.2);
  box(0.5, 0.05, 0.03, P.mustardTrim, mx, my - 0.25, mz + 0.12);
  glow(cyl(0.012, 0.01, P.tealLight, mx + 0.2, my - 0.25, mz + 0.14, 6, F), 1.5);
  cyl(0.012, 0.01, P.redLight, mx + 0.16, my - 0.25, mz + 0.14, 6, F);
  void R; void M; void J; void frame;
}
```

<!-- call: propsAndSignage -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPropsAndSignage({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const R = rng(5);
  const WZ = -2.39;

  // ---- Wall hazard sign (right-center of back wall, above counter gap)
  const sx = 1.0, sy = 1.35;
  box(1.2, 0.5, 0.03, P.blackStripe, sx, sy, WZ + 0.015);
  box(1.14, 0.44, 0.01, P.warningYellow, sx, sy, WZ + 0.032);
  for (let i = 0; i < 6; i++) {
    const g = new THREE.BoxGeometry(0.09, 0.5, 0.012);
    b.part(g, P.blackStripe, { at: [sx - 0.5 + i * 0.2, sy, WZ + 0.042], rotation: [0, 0, 35] });
  }
  box(1.2, 0.04, 0.012, P.blackStripe, sx, sy + 0.22, WZ + 0.05);
  box(1.2, 0.04, 0.012, P.blackStripe, sx, sy - 0.22, WZ + 0.05);
  // placard
  box(0.7, 0.36, 0.015, P.blackStripe, sx, sy, WZ + 0.06);
  box(0.66, 0.32, 0.012, P.creamInset, sx, sy, WZ + 0.07);
  box(0.4, 0.04, 0.008, P.redLight, sx - 0.1, sy + 0.1, WZ + 0.08);
  box(0.5, 0.025, 0.008, P.packetBlue, sx - 0.05, sy + 0.03, WZ + 0.08);
  box(0.46, 0.025, 0.008, P.packetBlue, sx - 0.07, sy - 0.03, WZ + 0.08);
  box(0.3, 0.025, 0.008, P.packetBlue, sx - 0.15, sy - 0.09, WZ + 0.08);
  box(0.06, 0.06, 0.008, P.redLight, sx + 0.25, sy - 0.07, WZ + 0.08);
  for (const ox of [-0.3, 0.3]) for (const oy of [-0.15, 0.15]) cyl(0.012, 0.012, 0.01, P.steelDark, sx + ox, sy + oy, WZ + 0.08, 6, [90, 0, 0]);

  // ---- Fire extinguisher on bracket (left of sign, wall)
  const ex = 1.85, ez = WZ + 0.12;
  box(0.1, 0.5, 0.02, P.steelDark, ex, 0.9, WZ + 0.01);
  cyl(0.075, 0.075, 0.5, "#a8302a", ex, 0.9, ez, 12);
  cyl(0.075, 0.06, 0.06, "#a8302a", ex, 1.17, ez, 12);
  cyl(0.03, 0.03, 0.06, P.steelDark, ex, 1.23, ez, 8);
  box(0.12, 0.03, 0.04, P.steelDark, ex, 1.28, ez, );
  cyl(0.078, 0.078, 0.05, P.mustardTrim, ex, 0.78, ez, 12);
  cyl(0.078, 0.078, 0.05, P.mustardTrim, ex, 1.02, ez, 12);
  box(0.09, 0.08, 0.005, P.labelCream, ex, 0.9, ez + 0.077);
  b.sweep([[ex + 0.03, 1.22, ez], [ex + 0.14, 1.18, ez + 0.05], [ex + 0.16, 1.0, ez + 0.06], [ex + 0.12, 0.9, ez + 0.06]], 0.011, { color: P.blackStripe });
  for (const y of [0.82, 1.0]) box(0.12, 0.03, 0.03, P.steelDark, ex, y, ez - 0.05);

  // ---- First-aid box
  const fx = 1.5, fy = 1.95;
  box(0.34, 0.26, 0.09, P.whiteEnamel, fx, fy, WZ + 0.045);
  box(0.36, 0.02, 0.1, P.steelLight, fx, fy + 0.13, WZ + 0.05);
  box(0.1, 0.03, 0.01, P.redLight, fx, fy, WZ + 0.095);
  box(0.03, 0.1, 0.012, P.redLight, fx, fy, WZ + 0.096);
  box(0.03, 0.03, 0.02, P.steelDark, fx + 0.12, fy - 0.02, WZ + 0.1);

  // ---- Supply crates, right corner
  const cx = 1.65, cz = 1.85;
  const crate = (y: number, w: number, d: number, x: number, z: number, rot: number) => {
    const g = b.part(new THREE.BoxGeometry(w, 0.4, d), P.panelGrey, { at: [x, y, z], rotation: [0, rot, 0] });
    for (const dy of [-0.15, 0.15]) b.part(new THREE.BoxGeometry(w + 0.03, 0.04, d + 0.03), P.mustardTrim, { at: [x, y + dy, z], rotation: [0, rot, 0] });
    for (const sx2 of [-1, 1]) for (const sz of [-1, 1]) b.part(new THREE.BoxGeometry(0.05, 0.4, 0.05), P.steelDark, { at: [x + Math.cos(rot * Math.PI / 180) * sx2 * w / 2 + Math.sin(rot * Math.PI / 180) * sz * d / 2, y, z - Math.sin(rot * Math.PI / 180) * sx2 * w / 2 + Math.cos(rot * Math.PI / 180) * sz * d / 2], rotation: [0, rot, 0] });
    return g;
  };
  crate(0.2, 0.7, 0.55, cx, cz, 0);
  crate(0.6, 0.6, 0.5, cx - 0.05, cz - 0.02, 6);
  box(0.4, 0.07, 0.01, P.creamInset, cx, 0.2, cz + 0.285);
  box(0.25, 0.03, 0.01, P.redLight, cx - 0.05, 0.2, cz + 0.292);
  box(0.35, 0.06, 0.01, P.creamInset, cx - 0.05, 0.6, cz + 0.25);
  box(0.2, 0.025, 0.01, P.blackStripe, cx - 0.05, 0.6, cz + 0.257);
  // cup + cups on crate
  cyl(0.04, 0.03, 0.08, P.whiteEnamel, cx + 0.1, 0.84, cz);
  cyl(0.036, 0.036, 0.01, P.coffeeDark, cx + 0.1, 0.875, cz);

  // ---- Pot rack above counter end
  const rx = -0.2, rz = -2.1, ry = 1.95;
  box(1.0, 0.03, 0.03, P.steelDark, rx, ry + 0.25, rz);
  for (const s of [-1, 1]) box(0.03, 0.03, 0.3, P.steelDark, rx + s * 0.48, ry + 0.25, rz + 0.1);
  for (const s of [-1, 1]) b.part(new THREE.BoxGeometry(0.02, 0.2, 0.02), P.steelDark, { at: [rx + s * 0.48, ry + 0.15, rz + 0.25] });
  const pot = (x: number, h: number, r: number, c: string) => {
    b.lathe([[0, 0], [r * 0.8, 0], [r, 0.02], [r, h], [r - 0.012, h], [r - 0.012, 0.02], [0, 0.015]], { at: [x, ry - h + 0.02, rz + 0.1 - 0.1], color: c, segments: 12 });
    box(0.02, 0.1, 0.02, P.steelDark, x, ry + 0.17, rz);
  };
  const potAt = (x: number, h: number, r: number) => {
    b.lathe([[0, 0], [r * 0.85, 0], [r, 0.02], [r, h], [r - 0.012, h], [r - 0.012, 0.025], [0, 0.015]], { at: [x, ry - 0.12 - h, rz], color: P.copperPipe, segments: 12 });
    cyl(0.01, 0.01, 0.12, P.steelDark, x, ry + 0.0 - 0.0 + 0.13 - 0.12 + 0.12 - 0.12 + 0.06, rz, 6);
    b.part(new THREE.BoxGeometry(r * 1.6, 0.025, 0.03), P.steelDark, { at: [x, ry - 0.12 - 0.0, rz + r + 0.1] });
  };
  potAt(-0.55, 0.14, 0.11);
  potAt(-0.2, 0.18, 0.13);
  potAt(0.15, 0.05, 0.14);
  box(0.04, 0.04, 0.04, P.mustardTrim, rx, ry + 0.25, rz);

  // ---- Floor caddy, mop and bucket (left front corner of the part, near left wall)
  const mx = -1.8, mz = 1.7;
  box(0.5, 0.05, 0.4, P.steelDark, mx, 0.05, mz);
  box(0.5, 0.02, 0.02, P.mustardTrim, mx, 0.09, mz + 0.2);
  box(0.02, 0.9, 0.02, P.steelDark, mx - 0.22, 0.5, mz - 0.18);
  box(0.02, 0.9, 0.02, P.steelDark, mx + 0.22, 0.5, mz - 0.18);
  box(0.46, 0.02, 0.02, P.steelDark, mx, 0.9, mz - 0.18);
  // bucket
  b.lathe([[0, 0], [0.15, 0], [0.19, 0.3], [0.175, 0.3], [0.14, 0.02], [0, 0.015]], { at: [mx + 0.0, 0.075, mz + 0.05], color: P.whiteEnamel, segments: 12 });
  cyl(0.195, 0.195, 0.025, P.mustardTrim, mx, 0.35, mz + 0.05, 12);
  cyl(0.19, 0.19, 0.012, P.coffeeDark, mx, 0.372, mz + 0.05, 12);
  // mop
  b.rod([mx - 0.1, 0.1, mz + 0.0], [mx - 0.22, 1.5, mz - 0.17], 0.015, P.steelLight);
  cyl(0.06, 0.1, 0.18, "#cfc6a8", mx - 0.1, 0.18, mz, 8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([mx - 0.1 + Math.cos(a) * 0.07, 0.15, mz + Math.sin(a) * 0.07], [0, -1, 0], 0.1, 0.018, { color: "#b9af90" });
  }

  // ---- Counter far right: cups and pouch
  const cy = 1.06, cX = 1.6, cZ = -1.9;
  for (let i = 0; i < 3; i++) {
    const x = cX - 0.3 + i * 0.13;
    b.lathe([[0, 0], [0.03, 0], [0.038, 0.09], [0.033, 0.09], [0.026, 0.01], [0, 0.008]], { at: [x, cy, cZ - 0.1 + R() * 0.05], color: P.whiteEnamel, segments: 10 });
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 8), P.whiteEnamel, { at: [x + 0.04, cy + 0.05, cZ - 0.1], rotation: [0, 0, 0] });
    cyl(0.03, 0.03, 0.004, P.coffeeDark, x, cy + 0.086, cZ - 0.1, 8);
  }
  box(0.14, 0.2, 0.05, P.packetBlue, cX + 0.12, cy + 0.1, cZ + 0.1).rotation.z = 0.15;
  box(0.1, 0.07, 0.006, P.labelCream, cX + 0.12, cy + 0.1, cZ + 0.127);
  box(0.14, 0.02, 0.055, P.steelLight, cX + 0.12, cy + 0.2, cZ + 0.1);
  box(0.05, 0.015, 0.005, P.redLight, cX + 0.12, cy + 0.1, cZ + 0.131);
}
```