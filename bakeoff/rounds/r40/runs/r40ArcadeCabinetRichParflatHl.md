<!-- call: plan -->

```json
{
  "name": "Neon Drive '84 Arcade Cabinet",
  "description": "A full-size upright 1980s arcade cabinet with synthwave styling: an indigo-black carcass, magenta and cyan neon trim, sunset-and-grid side art, a glowing CRT showing a retro driving scene, and a backlit marquee.",
  "builderName": "neonDriveArcadeCabinet",
  "size": [0.70, 1.82, 0.95],
  "layout": "Static prop, no joints. Real upright-cabinet proportions: about 0.66 m wide at the carcass, 0.95 m deep (z -0.48 to +0.47) and 1.82 m tall, standing on y = 0 and facing +Z. Seen from the side, the silhouette is one polygon in (z, y) pairs: (-0.48,0) (0.40,0) (0.40,0.84) (0.47,0.86) (0.47,0.96) (0.15,1.08) (0.074,1.58) (0.22,1.58) (0.22,1.82) (-0.40,1.82) (-0.48,1.25), back to the start. From the front (+Z) to the back it reads as follows. A flat coin-door front, 0.40 m forward, fills the lower body from y 0 to 0.84. Above it an overhanging control deck slopes up from its front lip (z 0.47, y 0.96) to the monitor's bottom edge (z 0.15, y 1.08). The CRT bezel leans back about 9 degrees, running from [0,1.08,0.15] to [0,1.58,0.074]. A deeper backlit marquee box sits on top, its front face at z 0.22. A tall, slightly tapered back tower with a rear service door carries the full height. The two side panels (x ±0.30 to ±0.33, 3 cm thick) are extruded from the silhouette polygon and span the whole height. Everything else sits between them at |x| <= 0.30, except the deck lip and T-molding, which may reach |x| 0.33. The side-art layer sits on the outer faces at |x| 0.33 to 0.345, inset 0.02 m from every edge of the polygon. SYNTHWAVE STYLE: the carcass is near-black indigo (cabinetBlack, shellPurple). Magenta and cyan neon tubes and T-molding run every edge. Glowing parts, made with the glow kit, are the screen scene, the marquee lettering and panel, the neon strips, the buttons' lit caps and the coin-door lights. Chunky, bold, blocky shapes; flat colours only; small parts for every detail (screws, vents, grille slots, labels). No ground, no props, no scenery.",
  "palette": {
    "cabinetBlack": "#14102a",
    "shellPurple": "#2a1458",
    "panelNavy": "#1b1b4a",
    "trimMagenta": "#ff2e97",
    "neonCyan": "#2ff3ff",
    "neonPurple": "#9d4dff",
    "sunYellow": "#ffd23f",
    "sunOrange": "#ff8c42",
    "sunPink": "#ff4f8b",
    "gridPink": "#ff2bd6",
    "mountainDark": "#3a1a6e",
    "mountainMid": "#5a2a9a",
    "screenBlack": "#05030f",
    "screenSky1": "#2b0f5e",
    "screenSky2": "#a3269c",
    "chrome": "#c9c9e8",
    "steel": "#7a7a9a",
    "buttonRed": "#ff3355",
    "buttonBlue": "#2f7bff",
    "buttonYellow": "#ffdd33",
    "buttonGreen": "#33ff9c",
    "white": "#f4f0ff",
    "rubber": "#0a0814",
    "palmDark": "#0b2a4a"
  },
  "mounts": {
    "sideProfileNote": [0, 0, 0],
    "sideInnerX": [0.30, 0, 0],
    "sideOuterX": [0.33, 0, 0],
    "sideArtX": [0.345, 0, 0],
    "coinDoorFront": [0, 0.42, 0.40],
    "lowerBodyTop": [0, 0.84, 0.40],
    "deckLipFront": [0, 0.96, 0.47],
    "deckFront": [0, 0.96, 0.46],
    "deckBack": [0, 1.08, 0.15],
    "monitorBottomEdge": [0, 1.08, 0.15],
    "monitorTopEdge": [0, 1.58, 0.074],
    "screenCenter": [0, 1.33, 0.112],
    "screenNormal": [0, 0.15, 0.99],
    "marqueeBottom": [0, 1.58, 0.0],
    "marqueeFront": [0, 1.70, 0.22],
    "cabinetTop": [0, 1.82, -0.09],
    "backDoorCenter": [0, 0.75, -0.48]
  },
  "joints": [],
  "parts": [
    {
      "id": "shell",
      "builds": "The carcass. (1) Both side panels, each a 3 cm extrusion of the side-profile polygon (x ±0.30 to ±0.33) in shellPurple with cabinetBlack edge strips; a thin T-molding (trimMagenta, glowing) runs around the front and top edges, and chrome screw heads sit on the flanks. (2) Solid cores between the sides so no gaps show: a lower block (|x|<=0.30, y 0 to 0.84, z -0.48 to 0.40) and an upper rear block (y 0.84 to 1.58, z -0.48 to 0.06). The cores are panelNavy and cabinetBlack. (3) A recessed kick strip (rubber) at the base, y 0 to 0.10. (4) The coin-door front, z 0.40, y 0.14 to 0.80: a steel bezel and two coin slots with small backlit yellow/red entry lamps, two coin-return flaps, a chrome lock cylinder, and a neonCyan underline. A small speaker-grille slot row sits above the door and a cabinetBlack lower front panel carries a trimMagenta stripe. (5) The back tower: a rear service door with a recessed frame, vent slots, a hinge pair, a latch, a power-cord inlet and a tiny cord loop, all in cabinetBlack, steel and rubber. A cyan strip runs vertically at the rear corners.",
      "box": [[-0.33, 0.0, -0.48], [0.33, 1.82, 0.47]],
      "attaches": "Side panels follow the full silhouette and host the sideArt layer on their outer faces at sideArtX. The lower block's top at lowerBodyTop is flush under the controlDeck. The upper rear block's front face at z 0.06 sits behind the monitor (monitorBottomEdge to monitorTopEdge). The tower top meets the marquee at cabinetTop.",
      "joints": [],
      "floor": true,
      "budget": 170
    },
    {
      "id": "sideArt",
      "builds": "The synthwave decal art on both outer flanks (build for s = +1 and -1; mirror it so the art faces outward on each side). Thin 8 mm layers at |x| 0.33 to 0.345, drawn in (z, y) on the silhouette polygon and kept 0.02 m inside its edges. Contents: a vertical dusk gradient made of stacked bands (shellPurple, mountainDark, screenSky2, sunPink); a big sun disc (sunYellow to sunOrange to sunPink) with horizontal slits cut by cabinetBlack stripes, centred near z -0.02, y 1.05; two layered jagged mountain ridges (mountainDark behind, mountainMid in front) on the horizon at y 0.85; a perspective grid on the lower body below it (gridPink and neonCyan lines converging toward the sun); a column of small white and cyan stars in the upper area; a neonCyan and trimMagenta double outline following the profile 0.02 m in; and a small bold chrome-and-white 'NEON DRIVE' badge strip on the lower flank. Use extrudes, thin boxes and slabs as the shapes. The art may glow lightly.",
      "box": [[-0.345, 0.02, -0.46], [0.345, 1.80, 0.45]],
      "attaches": "Sits on the outer faces of the shell's side panels at sideArtX (x ±0.33 to ±0.345). Must not cross the profile polygon or the monitor and marquee openings.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "controlDeck",
      "builds": "The overhanging control deck in a z-by-y wedge between the lower body top and the monitor bottom, spanning |x| <= 0.30 with a trimMagenta lip up to |x| 0.33 at the front. A sloped top panel (panelNavy with a cabinetBlack inset plate) runs from deckFront [0,0.96,0.46] up to deckBack [0,1.08,0.15] (about a 21 degree tilt). A chrome and rubber front lip (z 0.47, y 0.86 to 0.96) has a neonCyan glowing edge strip. On the panel: one arcade joystick at x -0.14, z 0.33 (steel shaft, a rubber boot, a big round buttonRed ball top, a chrome mounting plate with four screws, a cabinetBlack square gate plate). A cluster of six chunky round buttons in two rows of three at x 0.04 to 0.26, z 0.27 to 0.37, in buttonRed, buttonBlue, buttonYellow, buttonGreen, buttonYellow and buttonRed. Each button has a dark ring base, a glowing cap and a small white highlight. 1P and 2P start buttons (small flat squares glowing neonCyan and trimMagenta) at x ±0.04, z 0.20. Painted panel details built as small parts: a neonPurple swoosh stripe, white 'P1' and 'START' label plates made from tiny bars or svg textures, a sunset-gradient stripe made of small bars, arrow marks around the joystick, and hex screw heads. Speaker slots (a row of dark slits) sit on the deck's left edge.",
      "box": [[-0.33, 0.80, 0.04], [0.33, 1.10, 0.47]],
      "attaches": "The back edge is at monitorBottomEdge / deckBack [0,1.08,0.15], flush with the monitor bezel's bottom. The underside rests on lowerBodyTop at z up to 0.40, the overhang runs to deckLipFront, and the sides lie between the shell side panels (sideInnerX).",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "monitor",
      "builds": "The tilted CRT monitor face between deckBack and marquee, built on the plane from monitorBottomEdge [0,1.08,0.15] to monitorTopEdge [0,1.58,0.074], with width |x| <= 0.30. A cabinetBlack bezel slab, with a darker screenBlack inner mask, a rounded-look bevel built from several thin boxes and a steel inner frame step. A trimMagenta thin line and a neonCyan thin line run along the bezel's bottom edge. The curved glass is a slightly domed, flat-shaded screenBlack slab, 0.50 wide by 0.38 tall along the slope, centred on screenCenter [0,1.33,0.112] and facing screenNormal. The glowing scene on the glass (glow kit, built as thin parts or textured planes seated 3 mm off the glass): a sky of stacked gradient bands (screenSky1, screenSky2, sunPink), a big striped sun (sunYellow, sunOrange, sunPink with black slits), two layered mountain ridges (mountainDark, mountainMid), a perspective grid floor (gridPink and neonCyan lines converging to a horizon vanishing point), a few palmDark palm silhouettes at the road edge, a simple blocky retro sports-car silhouette seen from behind with two red tail-light parts (buttonRed), and HUD text blocks: 'SCORE 001980' at top left, 'HI 099999' at top centre, 'CREDIT 01' at bottom, as white bar or svg-texture pieces. A faint white diagonal glass-reflection streak sits over one corner, and a few tiny 'screw cover' corner caps and a thin glass-edge highlight finish it. Small side vents and a degauss-style label plate on the bezel's lower edge are optional.",
      "box": [[-0.30, 1.08, 0.02], [0.30, 1.58, 0.17]],
      "attaches": "The bottom edge meets the controlDeck's back edge at monitorBottomEdge. The top edge meets the marquee underside at marqueeBottom (y 1.58). Its sides meet the inner faces of the shell side panels at sideInnerX. Its back rests against the shell's upper rear block (z 0.06).",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "marquee",
      "builds": "The topper from y 1.58 to 1.82 and the cabinet's top cap, |x| <= 0.30 inside the side panels (z -0.40 to 0.22). A cabinetBlack header box with a recessed, backlit title panel on its front face at marqueeFront [0,1.70,0.22], 0.56 wide by 0.20 tall: a glowing panel in panelNavy to screenSky2 gradient stripes, with a big blocky 'NEON DRIVE' wordmark (chunky letters built as small bars or a texture, in neonCyan with trimMagenta shadow offset, glowing), an '84' badge in sunYellow, a small striped sun and a mountain strip. A thin chrome frame surrounds the panel. Along the marquee edges run glowing neon tubes (trimMagenta on top, neonCyan on the bottom) as thin round rods with small end caps and clips. A top cap slab with a rear ridge, two small speaker pods or grille bars at the sides, and a row of tiny light dots (the 'chase' bulbs) in white and sunYellow along the top front edge. Also builds the roof: the top surface at cabinetTop [0,1.82,-0.09], with a few cooling vent slits and a trimMagenta stripe, plus two small screw heads.",
      "box": [[-0.33, 1.58, -0.40], [0.33, 1.82, 0.23]],
      "attaches": "The bottom face sits on the monitor's top edge at marqueeBottom (y 1.58) and on the shell's tower top. The side faces sit between the shell side panels (sideInnerX). The front face at marqueeFront protrudes 0.15 beyond the monitor top (z 0.22 vs 0.074).",
      "joints": [],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: shell -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildShell({ b, P }: any) {
  const R = rng(7);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, len: number, c: string, at: number[], axis: "x" | "y" | "z", g = 0, seg = 8) => {
    const rot: Record<string, number[]> = { x: [0, 0, 90], y: [0, 0, 0], z: [90, 0, 0] };
    const p = b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at, rotation: rot[axis] });
    if (g) glow(p, g);
    return p;
  };

  // side silhouette in (z,y)
  const prof: [number, number][] = [
    [-0.48, 0], [0.40, 0], [0.40, 0.84], [0.47, 0.86], [0.47, 0.96], [0.15, 1.08],
    [0.074, 1.58], [0.22, 1.58], [0.22, 1.82], [-0.40, 1.82], [-0.48, 1.25],
  ];
  for (const s of [1, -1]) {
    b.extrude(prof, { at: [s * 0.315, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: P.shellPurple });
    // edge strips + T-molding glowing along the front/top edges
    for (let i = 0; i < prof.length; i++) {
      const [z0, y0] = prof[i];
      const [z1, y1] = prof[(i + 1) % prof.length];
      const len = Math.hypot(z1 - z0, y1 - y0);
      const ang = Math.atan2(z1 - z0, y1 - y0);
      const front = z0 > -0.1 || y0 > 1.7;
      const mx = s * 0.33;
      const col = front ? P.trimMagenta : P.cabinetBlack;
      const p = b.part(new THREE.BoxGeometry(0.016, len, 0.014), col, {
        at: [mx, (y0 + y1) / 2, (z0 + z1) / 2],
        rotation: [(-ang * 180) / Math.PI, 0, 0],
      });
      if (front) glow(p, 1.2);
    }
    // rear corner cyan strip
    box(0.012, 1.2, 0.012, P.neonCyan, s * 0.335, 0.62, -0.475, 1.3);
    // flank screws
    for (const [z, y] of [[-0.3, 0.1], [0.3, 0.1], [-0.3, 1.0], [0.3, 0.7], [-0.2, 1.7], [0.1, 1.7]])
      cyl(0.013, 0.01, P.chrome, [s * 0.335, y, z], "x", 0, 6);
  }

  // cores
  box(0.6, 0.84, 0.88, P.panelNavy, 0, 0.42, -0.04);
  box(0.6, 0.74, 0.54, P.cabinetBlack, 0, 1.21, -0.21);
  box(0.6, 0.24, 0.62, P.cabinetBlack, 0, 1.7, -0.09);
  // kick strip
  box(0.6, 0.1, 0.02, P.rubber, 0, 0.05, 0.385);

  // lower front panel
  box(0.6, 0.12, 0.012, P.cabinetBlack, 0, 0.2, 0.404);
  box(0.6, 0.016, 0.014, P.trimMagenta, 0, 0.12, 0.408, 1.3);

  // coin door
  box(0.34, 0.6, 0.014, P.steel, 0, 0.5, 0.405);
  box(0.3, 0.54, 0.012, P.cabinetBlack, 0, 0.5, 0.412);
  box(0.34, 0.012, 0.016, P.neonCyan, 0, 0.17, 0.41, 1.4);
  for (const x of [-0.07, 0.07]) {
    box(0.05, 0.1, 0.012, P.steel, x, 0.62, 0.42);
    box(0.012, 0.06, 0.012, P.rubber, x, 0.62, 0.427);
    box(0.034, 0.02, 0.01, x < 0 ? P.sunYellow : P.buttonRed, x, 0.7, 0.424, 1.5);
    box(0.05, 0.06, 0.012, P.steel, x, 0.48, 0.42);
    box(0.036, 0.03, 0.01, P.rubber, x, 0.48, 0.427);
    cyl(0.016, 0.01, P.buttonRed, [x, 0.7 - 0.08, 0.424], "z", 1.2, 8);
  }
  cyl(0.025, 0.014, P.chrome, [0, 0.32, 0.425], "z", 0, 10);
  box(0.004, 0.02, 0.01, P.rubber, 0, 0.32, 0.433);
  for (const [x, y] of [[-0.15, 0.78], [0.15, 0.78], [-0.15, 0.22], [0.15, 0.22]])
    cyl(0.007, 0.008, P.chrome, [x, y, 0.42], "z", 0, 6);

  // speaker slots above door
  for (let i = 0; i < 9; i++) box(0.02, 0.012, 0.012, P.rubber, -0.16 + i * 0.04, 0.81, 0.405);

  // back tower & service door
  box(0.5, 0.9, 0.02, P.panelNavy, 0, 0.75, -0.485);
  box(0.44, 0.8, 0.014, P.cabinetBlack, 0, 0.75, -0.495);
  for (let i = 0; i < 7; i++) box(0.3, 0.012, 0.012, P.rubber, 0, 1.0 + i * 0.022, -0.503);
  for (const y of [0.4, 1.05]) cyl(0.012, 0.08, P.steel, [-0.22, y, -0.5], "y", 0, 6);
  box(0.04, 0.07, 0.016, P.steel, 0.18, 0.75, -0.505);
  box(0.016, 0.03, 0.01, P.chrome, 0.18, 0.75, -0.516);
  box(0.07, 0.05, 0.014, P.rubber, 0.12, 0.25, -0.503);
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), P.rubber, { at: [0.12, 0.2, -0.51] });
  for (let i = 0; i < 4; i++) box(0.02, 0.006, 0.006, P.steel, -0.14 + R() * 0.28, 0.4 + R() * 0.02, -0.505);
}
```

<!-- call: marquee -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMarquee({ b, P }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  const rod = (a: number[], c: number[], r: number, col: string, g = 1) =>
    glow(b.rod(a, c, r, col, { sides: 8 }), g);

  // header box and cap
  box(0.6, 0.24, 0.62, P.cabinetBlack, 0, 1.70, -0.09);
  box(0.6, 0.02, 0.5, P.cabinetBlack, 0, 1.81, -0.14);
  box(0.6, 0.04, 0.05, P.shellPurple, 0, 1.80, -0.38); // rear ridge
  box(0.6, 0.012, 0.016, P.trimMagenta, 0, 1.821, -0.0, 1); // roof stripe
  // vents
  for (let i = 0; i < 5; i++) box(0.3, 0.004, 0.012, P.rubber, 0, 1.8215, -0.2 - i * 0.03);
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 6), P.chrome, { at: [s * 0.26, 1.822, -0.3] });
  }
  // title panel on front face
  const fz = 0.222;
  box(0.58, 0.22, 0.01, P.chrome, 0, 1.70, 0.216);
  const bands = [P.panelNavy, P.screenSky1, P.mountainDark, P.screenSky2, P.sunPink];
  bands.forEach((c, i) => glow(box(0.56, 0.04, 0.006, c, 0, 1.62 + 0.02 + i * 0.04 + 0.0 + 0.0, fz), 0.8));
  // mountain strip
  const mt = [[-0.28, 0], [-0.2, 0.04], [-0.14, 0.015], [-0.06, 0.05], [0.02, 0], [-0.28, 0]];
  b.extrude(mt.slice(0, 5).map((p) => [p[0] + 0.0, p[1]]), {
    at: [0, 1.605, fz + 0.003], x: [1, 0, 0], thickness: 0.004, color: P.mountainMid,
  });
  // sun with slits
  const sun = new THREE.CircleGeometry(0.045, 14);
  glow(b.part(sun, P.sunOrange, { at: [-0.19, 1.66, fz + 0.006], dir: [0, 0, 1], axis: "z" }), 1);
  for (let i = 0; i < 3; i++) box(0.09, 0.004, 0.002, P.cabinetBlack, -0.19, 1.645 + i * 0.012, fz + 0.0075);
  // letters: 5x5 blocky bitmap
  const F: Record<string, string[]> = {
    N: ["X...X", "XX..X", "X.X.X", "X..XX", "X...X"],
    E: ["XXXXX", "X....", "XXXX.", "X....", "XXXXX"],
    O: [".XXX.", "X...X", "X...X", "X...X", ".XXX."],
    D: ["XXXX.", "X...X", "X...X", "X...X", "XXXX."],
    R: ["XXXX.", "X...X", "XXXX.", "X..X.", "X...X"],
    I: ["XXX", ".X.", ".X.", ".X.", "XXX"],
    V: ["X...X", "X...X", "X...X", ".X.X.", "..X.."],
    "8": [".XX.", "X..X", ".XX.", "X..X", ".XX."],
    "4": ["X..X", "X..X", "XXXX", "...X", "...X"],
  };
  const cell = 0.0085;
  const word = (t: string, x0: number, y0: number, col: string, z: number) => {
    let x = x0;
    for (const ch of t) {
      if (ch === " ") { x += cell * 3; continue; }
      const g = F[ch];
      g.forEach((row, r) => [...row].forEach((v, k) => {
        if (v === "X") glow(box(cell, cell, 0.004, col, x + k * cell, y0 - r * cell, z), 1.2);
      }));
      x += (g[0].length + 1) * cell;
    }
  };
  word("NEON DRIVE", -0.21, 1.735, P.trimMagenta, fz + 0.004);
  word("NEON DRIVE", -0.2115, 1.7365, P.neonCyan, fz + 0.0075);
  // 84 badge
  glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 12), P.sunYellow, { at: [0.235, 1.65, fz + 0.005], dir: [0, 0, 1] }), 1);
  word("84", 0.2185, 1.665, P.cabinetBlack, fz + 0.0085);
  // neon tubes
  rod([-0.29, 1.825, 0.2], [0.29, 1.825, 0.2], 0.007, P.trimMagenta);
  rod([-0.29, 1.592, 0.23], [0.29, 1.592, 0.23], 0.007, P.neonCyan);
  for (const s of [-1, 1]) {
    for (const [y, c] of [[1.825, P.trimMagenta], [1.592, P.neonCyan]] as [number, string][]) {
      glow(b.part(new THREE.SphereGeometry(0.01, 6, 4), c, { at: [s * 0.29, y, y > 1.7 ? 0.2 : 0.23] }), 1);
    }
    for (const x of [-0.15, 0.15]) {
      box(0.012, 0.012, 0.014, P.steel, x, 1.825, 0.2);
      box(0.012, 0.012, 0.014, P.steel, x, 1.592, 0.23);
    }
    // speaker pods
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), P.rubber, { at: [s * 0.24, 1.7, 0.0], dir: [s, 0, 0] });
    for (let i = 0; i < 4; i++) box(0.004, 0.01 + 0.0, 0.05, P.steel, s * 0.3015, 1.67 + i * 0.02, -0.1);
  }
  // chase bulbs
  for (let i = 0; i < 15; i++) {
    glow(b.part(new THREE.SphereGeometry(0.006, 6, 4), i % 2 ? P.white : P.sunYellow, { at: [-0.28 + i * 0.04, 1.812, 0.215] }), 1.3);
  }
  // screws
  for (const s of [-1, 1]) b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 6), P.chrome, { at: [s * 0.27, 1.823, -0.35] });
}
```

<!-- call: controlDeck -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildControlDeck({ b, J, P, M }: Ctx) {
  const SLOPE = Math.atan2(1.08 - 0.96, 0.46 - 0.15); // rise toward the back
  const dz = 0.15 - 0.46;
  const dy = 1.08 - 0.96;
  const len = Math.hypot(dz, dy);
  const ang = Math.atan2(dy, -dz); // tilt about X: surface rises toward -z

  // point on the deck surface: u in x, v = fraction from front (0) to back (1), h above surface
  const sp = (x: number, v: number, h = 0): [number, number, number] => {
    const z = 0.46 + dz * v;
    const y = 0.96 + dy * v;
    const nz = Math.sin(SLOPE) * 0 + dy / len; // normal components
    const ny = -dz / len;
    return [x, y + ny * h, z + nz * h];
  };
  const vOf = (z: number) => (0.46 - z) / 0.31;
  const rotX = -ang; // rotates a flat box (normal +Y) to the slope normal
  const addBox = (sx: number, sy: number, sz: number, color: string, x: number, z: number, h: number, g = false) => {
    const p = b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: sp(x, vOf(z), h), rotation: [(rotX * 180) / Math.PI, 0, 0] });
    if (g) glow(p, 1.2);
    return p;
  };
  const cyl = (r: number, r2: number, hgt: number, seg: number, color: string, x: number, z: number, h: number, g = false) => {
    const p = b.part(new THREE.CylinderGeometry(r, r2, hgt, seg), color, { at: sp(x, vOf(z), h), rotation: [(rotX * 180) / Math.PI, 0, 0] });
    if (g) glow(p, 1.3);
    return p;
  };

  // Underside / wedge body
  b.extrude(
    [[0.4, 0.84], [0.47, 0.86], [0.47, 0.96], [0.15, 1.08], [0.06, 1.08], [0.06, 0.84]].map(([z, y]) => [z, y] as [number, number]),
    { at: [-0.3, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.6, color: P.cabinetBlack },
  );
  // fix thickness centring: extrude is centred on x=0 via at offset
  b.part(new THREE.BoxGeometry(0.6, 0.002, 0.002), P.cabinetBlack, { at: [0, 0.8, 0.1] });

  // Sloped top panel
  b.part(new THREE.BoxGeometry(0.6, 0.02, len), P.panelNavy, {
    at: sp(0, 0.5, -0.01),
    rotation: [(rotX * 180) / Math.PI, 0, 0],
  });
  // inset plate
  addBox(0.5, 0.004, 0.24, P.cabinetBlack, 0, 0.27, 0.001);

  // Front lip: rubber + chrome
  b.part(new THREE.BoxGeometry(0.66, 0.1, 0.03), P.rubber, { at: [0, 0.91, 0.455] });
  b.part(new THREE.BoxGeometry(0.66, 0.025, 0.034), P.chrome, { at: [0, 0.945, 0.455] });
  b.part(new THREE.BoxGeometry(0.67, 0.012, 0.012), P.trimMagenta, { at: [0, 0.96, 0.472] });
  glow(b.part(new THREE.BoxGeometry(0.6, 0.012, 0.01), P.neonCyan, { at: [0, 0.875, 0.472] }), 1.5);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.03, 0.1, 0.034), P.trimMagenta, { at: [s * 0.315, 0.91, 0.455] }), 1.2);
  }

  // Joystick
  const jx = -0.14, jz = 0.33;
  addBox(0.09, 0.006, 0.09, P.cabinetBlack, jx, jz, 0.003);
  addBox(0.075, 0.004, 0.075, P.chrome, jx, jz, 0.008);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.005, 0.005, 0.005, 6, P.steel, jx + sx * 0.032, jz + sz * 0.032 * 0.95, 0.011);
  cyl(0.03, 0.012, 0.03, 8, P.rubber, jx, jz, 0.025);
  cyl(0.006, 0.006, 0.09, 8, P.steel, jx, jz, 0.06);
  const ball = b.part(new THREE.SphereGeometry(0.026, 10, 8), P.buttonRed, { at: sp(jx, vOf(jz), 0.12) });
  glow(ball, 0.8);
  b.part(new THREE.SphereGeometry(0.007, 6, 4), P.white, { at: sp(jx - 0.01, vOf(jz + 0.012), 0.142) });
  // arrows
  for (const [ax, az, r] of [[0, 0.07, 0], [0, -0.07, 180], [0.075, 0, 90], [-0.075, 0, -90]] as number[][]) {
    const t = b.part(new THREE.ConeGeometry(0.01, 0.018, 3), P.white, {
      at: sp(jx + ax, vOf(jz - az * 0.7), 0.004),
      rotation: [((rotX * 180) / Math.PI) + 90, 0, r],
    });
    t.mesh.rotation.set(rotX + Math.PI / 2, 0, 0);
    t.mesh.rotateY(0);
  }

  // Buttons
  const cols = [P.buttonRed, P.buttonBlue, P.buttonYellow, P.buttonGreen, P.buttonYellow, P.buttonRed];
  let k = 0;
  for (let row = 0; row < 2; row++)
    for (let c = 0; c < 3; c++) {
      const x = 0.07 + c * 0.09;
      const z = row === 0 ? 0.37 : 0.28;
      cyl(0.03, 0.032, 0.012, 10, P.rubber, x, z, 0.006);
      glow(cyl(0.024, 0.025, 0.016, 10, cols[k], x, z, 0.018), 1.2);
      b.part(new THREE.SphereGeometry(0.005, 5, 4), P.white, { at: sp(x - 0.008, vOf(z + 0.006), 0.028) });
      k++;
    }

  // Start buttons
  for (const [x, col] of [[-0.04, P.neonCyan], [0.04, P.trimMagenta]] as [number, string][]) {
    addBox(0.045, 0.006, 0.045, P.rubber, x, 0.2, 0.003);
    glow(addBox(0.034, 0.01, 0.034, col, x, 0.2, 0.009), 1.3);
  }
  // labels
  const bars = (x0: number, z: number, n: number, w: number) => {
    for (let i = 0; i < n; i++) addBox(w, 0.002, 0.008, P.white, x0 + i * (w + 0.004), z, 0.002);
  };
  addBox(0.06, 0.002, 0.016, P.cabinetBlack, -0.14, 0.43, 0.002);
  bars(-0.162, 0.43, 4, 0.01); // P1
  addBox(0.12, 0.002, 0.016, P.cabinetBlack, 0, 0.15, 0.002);
  bars(-0.048, 0.15, 6, 0.012); // START

  // neonPurple swoosh
  for (let i = 0; i < 9; i++) {
    const x = -0.28 + i * 0.035;
    const z = 0.2 + Math.sin(i / 8 * Math.PI) * 0.06;
    glow(addBox(0.038, 0.003, 0.01, P.neonPurple, x, z, 0.002), 1);
  }
  // sunset stripe
  const sun = [P.sunYellow, P.sunOrange, P.sunPink, P.gridPink];
  for (let i = 0; i < 16; i++) {
    glow(addBox(0.03, 0.003, 0.012, sun[Math.floor(i / 4)], 0.045 + i * 0.016 + 0.0, 0.46 - 0.02, 0.002), 0.8);
  }

  // hex screws
  for (const [x, z] of [[-0.27, 0.42], [0.27, 0.42], [-0.27, 0.18], [0.27, 0.18]]) cyl(0.007, 0.007, 0.005, 6, P.chrome, x, z, 0.003);

  // speaker slots, left edge
  for (let i = 0; i < 7; i++) addBox(0.012, 0.003, 0.07, P.rubber, -0.275 + (i % 2 ? 0 : 0) + i * 0.0 - 0.0, 0.26 + 0, 0.002).mesh.position.x += i * 0.0;
  for (let i = 0; i < 6; i++) addBox(0.006, 0.003, 0.08, P.rubber, -0.29 + i * 0.012, 0.3, 0.003);
}
```

<!-- call: monitor -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMonitor({ b, J, P, M }: Ctx) {
  const R = rng(84);
  // Slope plane: from bottom (z .15,y 1.08) to top (z .074,y 1.58)
  const bot = new THREE.Vector3(0, 1.08, 0.15);
  const top = new THREE.Vector3(0, 1.58, 0.074);
  const up = top.clone().sub(bot).normalize(); // along slope
  const n = new THREE.Vector3(0, 0.15, 0.99).normalize(); // screen normal
  const len = top.distanceTo(bot);
  const rot = new THREE.Euler(Math.atan2(-(top.z - bot.z), top.y - bot.y), 0, 0);
  // local plane coords: u = x, v = along slope (0..len), w = outward normal
  const L = (u: number, v: number, w: number) =>
    bot.clone().addScaledVector(up, v).addScaledVector(n, w).add(new THREE.Vector3(u, 0, 0));
  const box = (u: number, v: number, w: number, sx: number, sy: number, sz: number, c: string, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(sx, sy, sz), c, { at: L(u, v, w), rotation: [(rot.x * 180) / Math.PI, 0, 0] });
    if (g) glow(p, g);
    return p;
  };
  // bezel
  box(0, len / 2, -0.012, 0.6, len, 0.03, P.cabinetBlack);
  // bevel frame pieces
  const cy = 0.5 * len;
  box(0, cy, 0.006, 0.56, 0.44 + 0.0, 0.006, P.screenBlack);
  box(0, len - 0.035, 0.006, 0.6, 0.07, 0.012, P.cabinetBlack);
  box(0, 0.035, 0.006, 0.6, 0.07, 0.012, P.cabinetBlack);
  for (const s of [1, -1]) box(s * 0.285, len / 2, 0.006, 0.03, len, 0.012, P.cabinetBlack);
  // steel inner frame step
  const sw = 0.27, sh = 0.215;
  box(0, cy + sh, 0.011, sw * 2 + 0.01, 0.008, 0.006, P.steel);
  box(0, cy - sh, 0.011, sw * 2 + 0.01, 0.008, 0.006, P.steel);
  for (const s of [1, -1]) box(s * (sw + 0.002), cy, 0.011, 0.008, sh * 2, 0.006, P.steel);
  // bottom edge lines
  glow(box(0, 0.008, 0.013, 0.58, 0.006, 0.006, P.trimMagenta), 1.4);
  glow(box(0, 0.02, 0.013, 0.58, 0.004, 0.006, P.neonCyan), 1.4);
  // corner screw caps
  for (const sx of [1, -1]) for (const v of [0.03, len - 0.03])
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 8), P.chrome, { at: L(sx * 0.275, v, 0.016), dir: [n.x, n.y, n.z] });
  // label plate
  box(0.2, 0.035, 0.013, 0.07, 0.025, 0.004, P.steel);
  for (let i = 0; i < 4; i++) box(-0.26, 0.02 + i * 0.012, 0.013, 0.02, 0.005, 0.004, P.panelNavy);
  // glass dome
  const glass = b.part(new THREE.BoxGeometry(0.5, 0.38, 0.012), P.screenBlack, {
    at: L(0, cy, 0.012), rotation: [(rot.x * 180) / Math.PI, 0, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.3, 8, 5, 0, 6.3, 0, 0.5), P.screenBlack, { at: L(0, cy, -0.27), rotation: [(rot.x * 180) / Math.PI + 90, 0, 0], scale: [1, 0.25, 1], flat: true });
  void glass;
  // scene: v measured from screen center; sv in [-.19,.19], su in [-.25,.25]
  const S = (u: number, v: number, sx: number, sy: number, c: string, g = 1, z = 0.021) =>
    box(u, cy + v, z, sx, sy, 0.003, c, g);
  const skyC = [P.screenSky1, P.screenSky1, P.screenSky2, P.screenSky2, P.sunPink];
  for (let i = 0; i < 5; i++) S(0, 0.19 - 0.04 - i * 0.034 + 0.0, 0.5, 0.034, skyC[i], 0.9);
  // sun
  for (let i = 0; i < 6; i++) {
    const y = 0.0 + 0.02 + i * 0.026;
    const half = Math.sqrt(Math.max(0.0001, 0.085 * 0.085 - Math.pow(y - 0.08 + 0.0, 2) * 0)) ;
    const w = 2 * Math.sqrt(Math.max(0.0004, 0.09 * 0.09 - Math.pow(y - 0.07, 2)));
    void half;
    S(0, y - 0.0, w, i % 2 ? 0.014 : 0.022, i < 2 ? P.sunPink : i < 4 ? P.sunOrange : P.sunYellow, 1.2, 0.024);
  }
  // mountains
  const ridge = (c: string, base: number, hs: number[], z: number) =>
    hs.forEach((h, i) => {
      const x = -0.25 + (i + 0.5) * (0.5 / hs.length);
      S(x, base + h / 2, 0.5 / hs.length + 0.01, h, c, 0.8, z);
    });
  ridge(P.mountainDark, -0.02, [0.05, 0.09, 0.06, 0.04, 0.07, 0.1, 0.05, 0.03], 0.0225);
  ridge(P.mountainMid, -0.02, [0.02, 0.035, 0.05, 0.03, 0.02, 0.03, 0.045, 0.02], 0.0235);
  // ground
  S(0, -0.1, 0.5, 0.18, P.screenBlack, 0.8, 0.0255);
  // grid
  for (let i = 0; i < 5; i++) S(0, -0.025 - i * i * 0.0065 - i * 0.012, 0.5, 0.003, i % 2 ? P.neonCyan : P.gridPink, 1.3, 0.027);
  for (let i = -6; i <= 6; i++) {
    const x = i * 0.04;
    const p = box(x * 0.7, cy - 0.1, 0.027, 0.003, 0.17, 0.003, P.gridPink, 1.3);
    p.mesh.rotation.z += 0; // keep upright lines; perspective via spread
    p.mesh.rotateZ(-i * 0.09);
  }
  // road
  S(0, -0.12, 0.1, 0.14, P.panelNavy, 1, 0.0285);
  // palms
  for (const s of [1, -1]) {
    S(s * 0.2, -0.07, 0.008, 0.11, P.palmDark, 0.7, 0.03);
    for (let k = 0; k < 3; k++) {
      const f = S(s * 0.2 + (k - 1) * 0.02, -0.01 + (k === 1 ? 0.01 : 0), 0.04, 0.008, P.palmDark, 0.7, 0.031);
      f.mesh.rotateZ((k - 1) * 0.5);
    }
  }
  // car
  S(0, -0.125, 0.09, 0.03, P.cabinetBlack, 1, 0.031);
  S(0, -0.103, 0.06, 0.02, P.cabinetBlack, 1, 0.031);
  S(0, -0.1, 0.045, 0.012, P.neonPurple, 1, 0.032);
  for (const s of [1, -1]) {
    S(s * 0.035, -0.125, 0.018, 0.01, P.buttonRed, 2, 0.033);
    S(s * 0.034, -0.145, 0.016, 0.014, P.rubber, 1, 0.032);
  }
  // HUD text blocks
  const text = (u0: number, v: number, n2: number, c = P.white) => {
    for (let i = 0; i < n2; i++) S(u0 + i * 0.011, cy * 0 + v, 0.007, 0.012, R() > 0.2 ? c : P.neonCyan, 1.3, 0.034);
  };
  text(-0.235, 0.165, 11);
  text(-0.04, 0.165, 8);
  text(-0.05, -0.172, 9);
  // reflection streak
  const st = S(0.17, 0.12, 0.012, 0.16, P.white, 0.3, 0.036);
  st.mesh.rotateZ(0.6);
  // glass edge highlight
  S(0, 0.19, 0.5, 0.003, P.chrome, 0.6, 0.037);
  S(-0.25, 0, 0.003, 0.38, P.chrome, 0.5, 0.037);
}
```

<!-- call: sideArt -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildSideArt({ b, P }: Ctx) {
  // Art polygon: the silhouette inset about 0.02 m, as right and left boundaries (y, z).
  const R: number[][] = [[0.02, 0.38], [0.83, 0.38], [0.88, 0.44], [0.94, 0.44], [1.055, 0.14], [1.56, 0.05], [1.565, 0.2], [1.8, 0.2]];
  const Lf: number[][] = [[0.02, -0.46], [1.25, -0.46], [1.8, -0.38]];
  const interp = (arr: number[][], y: number) => {
    for (let i = 0; i < arr.length - 1; i++) {
      const [y0, z0] = arr[i], [y1, z1] = arr[i + 1];
      if (y >= y0 && y <= y1) return z0 + ((z1 - z0) * (y - y0)) / (y1 - y0);
    }
    return arr[arr.length - 1][1];
  };
  const xc = (k: number) => 0.3325 + 0.0015 * k;

  // A horizontal band of the art polygon between y0 and y1.
  const bandOutline = (y0: number, y1: number) => {
    const ys = [y0, y1];
    for (const arr of [R, Lf]) for (const [y] of arr) if (y > y0 + 0.004 && y < y1 - 0.004) ys.push(y);
    ys.sort((a, c) => a - c);
    const out: number[][] = [];
    for (const y of ys) out.push([interp(R, y), y]);
    for (const y of [...ys].reverse()) out.push([interp(Lf, y), y]);
    return out;
  };

  const layer = (outline: number[][], color: string, k: number, s: number, g = 0) => {
    const p = b.extrude(outline as any, {
      at: [s * xc(k), 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.002, color,
    });
    if (g) glow(p, g);
    return p;
  };

  // Merged small boxes, one part per colour and glow strength.
  const bank = new Map<string, { color: string; g: number; geos: THREE.BufferGeometry[] }>();
  const box = (z: number, y: number, w: number, h: number, k: number, s: number, color: string, g = 0) => {
    const key = color + "|" + g;
    if (!bank.has(key)) bank.set(key, { color, g, geos: [] });
    bank.get(key)!.geos.push(new THREE.BoxGeometry(0.002, h, w).translate(s * xc(k), y, z));
  };

  // Sun polygons by height.
  const zc = -0.02, yc = 1.05, rs = 0.2;
  const chord = (y: number) => Math.max(0.004, Math.sqrt(Math.max(0, rs * rs - (y - yc) ** 2)));

  for (const s of [1, -1]) {
    // Dusk bands
    layer(bandOutline(0.02, 0.85), P.cabinetBlack, 1, s);
    layer(bandOutline(0.85, 0.95), P.sunPink, 1, s, 0.3);
    layer(bandOutline(0.95, 1.15), P.screenSky2, 1, s, 0.2);
    layer(bandOutline(1.15, 1.45), P.mountainDark, 1, s);
    layer(bandOutline(1.45, 1.8), P.shellPurple, 1, s);

    // Striped sun
    let y = 0.85, i = 0;
    while (y < 1.248) {
      const y0 = y + Math.max(0.004, 0.016 - i * 0.002);
      const y1 = Math.min(1.25, y0 + 0.03);
      if (y1 - y0 < 0.006) break;
      const t = ((y0 + y1) / 2 - 0.85) / 0.4;
      const col = t < 0.33 ? P.sunPink : t < 0.66 ? P.sunOrange : P.sunYellow;
      const w0 = chord(y0), w1 = chord(y1);
      layer([[zc - w0, y0], [zc + w0, y0], [zc + w1, y1], [zc - w1, y1]], col, 3, s, 0.5);
      y = y1; i++;
    }

    // Mountain ridges
    const back = [[-0.46, 0.85], [-0.46, 0.93], [-0.38, 1.0], [-0.3, 0.95], [-0.22, 1.06], [-0.12, 0.97], [-0.05, 1.02], [0.05, 0.96], [0.15, 1.0], [0.22, 0.92], [0.3, 0.95], [0.38, 0.9], [0.38, 0.85]];
    layer(back, P.mountainDark, 4, s);
    const front = [[-0.46, 0.85], [-0.46, 0.88], [-0.4, 0.92], [-0.33, 0.89], [-0.25, 0.95], [-0.15, 0.9], [-0.08, 0.94], [0, 0.9], [0.1, 0.93], [0.2, 0.89], [0.28, 0.92], [0.38, 0.87], [0.38, 0.85]];
    layer(front, P.mountainMid, 5, s);

    // Perspective grid
    box(-0.04, 0.85, 0.84, 0.006, 6, s, P.neonCyan, 0.9);
    for (let n = 1; n <= 9; n++) {
      const gy = 0.85 - 0.8 * Math.pow(n / 9.5, 2);
      box(-0.04, gy, 0.84, 0.003 + n * 0.0004, 6, s, P.gridPink, 0.8);
    }
    for (let j = -3; j <= 3; j++) {
      const zb = -0.02 + j * 0.12;
      const zt = -0.02 + j * 0.006;
      layer([[zt - 0.001, 0.845], [zb - 0.003, 0.03], [zb + 0.003, 0.03], [zt + 0.001, 0.845]], j % 2 === 0 ? P.gridPink : P.neonCyan, 6, s, 0.8);
    }

    // Badge strip
    const bz = -0.2, by = 0.1;
    box(bz, by, 0.27, 0.055, 6, s, P.chrome);
    box(bz, by, 0.255, 0.043, 7, s, P.panelNavy);
    box(bz, by - 0.0225, 0.27, 0.003, 7, s, P.trimMagenta, 0.8);
    const font: Record<string, string[]> = {
      N: ["101", "111", "111", "101", "101"], E: ["111", "100", "110", "100", "111"],
      O: ["111", "101", "101", "101", "111"], D: ["110", "101", "101", "101", "110"],
      R: ["110", "101", "110", "101", "101"], I: ["111", "010", "010", "010", "111"],
      V: ["101", "101", "101", "101", "010"],
    };
    const cell = 0.0055;
    let cx = 0;
    for (const ch of "NEON DRIVE") {
      const rows = font[ch];
      if (rows) {
        rows.forEach((row, ri) => {
          let c = 0;
          while (c < 3) {
            if (row[c] === "1") {
              let e = c;
              while (e < 3 && row[e] === "1") e++;
              const mid = cx + ((c + e) / 2) * cell;
              box(bz + s * (0.11 - mid), by + 0.01375 - (ri + 0.5) * cell, (e - c) * cell, cell, 8, s, P.white, 0.4);
              c = e;
            } else c++;
          }
        });
      }
      cx += 4 * cell;
    }
  }

  // Stars (same layout on both flanks)
  const r = rng(84);
  for (let i = 0; i < 18; i++) {
    const z = -0.35 + r() * 0.34;
    const y = 1.28 + r() * 0.47;
    const sz = 0.007 + r() * 0.006;
    const col = i % 2 ? P.neonCyan : P.white;
    for (const s of [1, -1]) {
      box(z, y, sz, sz, 7, s, col, 0.7);
      if (i % 4 === 0) {
        box(z, y, sz * 3, sz * 0.4, 7, s, col, 0.7);
        box(z, y, sz * 0.4, sz * 3, 7, s, col, 0.7);
      }
    }
  }

  // Double neon outline following the profile
  const loop = (inset: number, x: number, color: string) => {
    const pts: number[][] = [];
    const ys: number[] = [];
    for (const [yy] of R) ys.push(Math.min(Math.max(yy, 0.02 + inset), 1.8 - inset));
    for (const [yy, z] of R) pts.push([x, Math.min(Math.max(yy, 0.02 + inset), 1.8 - inset), z - inset]);
    for (const [yy, z] of [...Lf].reverse()) pts.push([x, Math.min(Math.max(yy, 0.02 + inset), 1.8 - inset), z + inset]);
    // drop consecutive duplicates
    const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) > 0.002);
    const sw = b.sweep(clean as any, 0.0025, { color, section: { ngon: 4 }, caps: "flat" } as any);
    glow(sw as any, 1);
  };
  for (const s of [1, -1]) {
    loop(0.0, s * 0.3425, P.neonCyan);
    loop(0.011, s * 0.3425, P.trimMagenta);
  }

  // Flush merged boxes
  for (const { color, g, geos } of bank.values()) {
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const p = b.part(merged, color, { at: [0, 0, 0] });
    if (g) glow(p, g);
  }
}
```