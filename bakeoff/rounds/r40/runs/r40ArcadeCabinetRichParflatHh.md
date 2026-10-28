<!-- call: plan -->

```json
{
  "name": "Neon Runner Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet in synthwave style: black body with glowing pink and cyan T-molding, a sunset, grid and mountain side-art, a lit marquee, a CRT screen showing a neon road scene, a joystick and button deck, and a glowing coin door.",
  "builderName": "neonRunnerCabinet",
  "size": [0.72, 1.85, 1.03],
  "layout": "Static prop, no joints. Real size: about 0.7 m wide, 1.85 m tall, 1.03 m deep from the back (z=-0.45) to the control-panel lip (z=+0.58). Facing +Z, from the front down: a lit marquee box on top (y 1.6-1.85), then a CRT bezel and glass leaning back about 8 degrees (y 1.05-1.6), then a control deck sticking out in front at waist height (y 0.86-1.04, z 0.2-0.58). Below the deck is the vertical front board with the coin door (y 0.04-0.92, front face z=0.35). The body narrows toward the top rear. The side profile (z,y) is: [-0.45,0.04] [0.35,0.04] [0.35,0.92] [0.24,1.05] [0.16,1.6] [0.2,1.6] [0.2,1.85] [-0.28,1.85] [-0.28,1.15] [-0.45,0.95]. Panels sit at x=+-0.34 (outer faces), 0.02 thick. Four leveler feet touch y=0 and everything else floats above on the sides' bottom edge y=0.04. The look is synthwave: near-black indigo body, neon pink and cyan glowing T-molding along every side-panel edge, a striped sunset over a magenta perspective grid and layered purple mountains on both side panels, hot-pink glow behind the marquee and screen, chrome and brass fittings, and glowing coloured buttons. Every colour is a flat colour from the palette, and details such as stripes, grid lines, stars and lettering are small separate parts seated on the surface. Parts must not overlap except at shared mount faces. Neon and lit items (T-molding, marquee panel, screen scene, buttons, coin slot lights, start buttons) use the glow kit.",
  "palette": {
    "cabinetBlack": "#14101f",
    "panelPurple": "#2a1450",
    "deepIndigo": "#1b0f3a",
    "neonPink": "#ff2d95",
    "neonCyan": "#2ff3ff",
    "neonViolet": "#9d4dff",
    "sunYellow": "#ffd23f",
    "sunOrange": "#ff8a3d",
    "sunsetRed": "#ff4f6d",
    "gridMagenta": "#d93cff",
    "mountainDark": "#3a1670",
    "mountainMid": "#5a2090",
    "chrome": "#cfd6e6",
    "steel": "#7d8499",
    "rubber": "#0a0810",
    "screenGlass": "#0d1230",
    "screenSky": "#2a0f5a",
    "screenGlow": "#ff6ad5",
    "white": "#fff4ff",
    "buttonRed": "#ff3355",
    "buttonBlue": "#2f7bff",
    "buttonGreen": "#37ff9a",
    "buttonYellow": "#ffe14a",
    "brass": "#d9a441"
  },
  "mounts": {
    "floor": [0, 0, 0],
    "sideFaceX": [0.34, 0.9, 0],
    "sideProfileFront": [0, 1.05, 0.24],
    "frontBoardFace": [0, 0.48, 0.35],
    "deckTop": [0, 1.0, 0.39],
    "deckBackEdge": [0, 1.02, 0.2],
    "deckFrontLip": [0, 0.94, 0.58],
    "bezelBottom": [0, 1.05, 0.24],
    "bezelTop": [0, 1.6, 0.16],
    "screenCenter": [0, 1.33, 0.2],
    "screenNormal": [0, 0.145, 0.99],
    "marqueeFront": [0, 1.73, 0.21],
    "coinDoorCenter": [0, 0.55, 0.35],
    "joystickBase": [-0.17, 1.0, 0.4],
    "buttonRowCenter": [0.14, 0.99, 0.4]
  },
  "joints": [],
  "parts": [
    {
      "id": "cabinetShell",
      "builds": "The structural body, built with extrudes, slabs and boxes. (1) Two side panels as extrudes of the side profile above, drawn along z with y up, thickness 0.02, at x=+-0.34 (centres x=+-0.33), colour cabinetBlack. (2) A back panel closing the rear between the sides, following the back profile from y=0.04 to 1.85, with a darker rubber-coloured access door outline, two small steel screws and a vent slot grille of 6 thin rubber slats near the top. (3) A bottom plate and a top plate (top at y=1.85, from z=-0.28 to 0.2) in cabinetBlack, plus a thin deepIndigo inner shelf under the deck. (4) Glowing T-molding: thin neonPink tubes about 0.012 radius following the whole outline of each side panel's outer edge, offset 0.012 outward past the panel face. Use a neonCyan tube along the front vertical edge of the lower body (z=0.35, y 0.04-0.92) on each side, and short neonCyan corner caps at each turn. Glow them at strength 1.5. (5) Four chrome leveler feet (small cylinders, r=0.025) under the corners at y 0-0.04, each with a rubber pad, resting on y=0. (6) Faint deepIndigo trim ribs where the front board meets the sides. Does not cover the side art, front board, deck or marquee.",
      "box": [[-0.36, 0, -0.45], [0.36, 1.85, 0.35]],
      "attaches": "Side panels carry sideArt on their outer faces (x=+-0.34, art sits at 0.341+). The front board owned by coinFront fits between the sides at frontBoardFace. The deck sits on sideProfileFront and the sides' step at y 0.92. The bezel and marquee of screenMarquee fit between the sides at bezelBottom and bezelTop.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "sideArt",
      "builds": "Synthwave side-art decals, identical on both sides and mirrored with s=+-1, as thin extrudes (thickness about 0.004) seated at x=+-0.343 on the outer side-panel faces, within z from -0.4 to 0.3 and y 0.12 to 1.75, avoiding the T-molding edge by 0.03. Layers from back to front: a deepIndigo backing plate following the panel's inner outline; a big sun disc (radius about 0.24 centred around z=-0.05, y=1.0) as stacked slices, yellow at the top, then orange, then sunsetRed at the bottom, with horizontal cabinetBlack stripe gaps that widen toward the bottom; two layers of mountain silhouettes (mountainMid behind, mountainDark in front, jagged sharp-cornered outlines) along a horizon at y=0.7, with thin neonCyan highlight lines on the peaks; below the horizon a perspective grid in gridMagenta made of thin rods, with converging lines meeting at a vanishing point at the horizon and about 6 horizontal lines spaced closer toward the horizon, sitting on a cabinetBlack ground plate; a small stylised wireframe low-poly palm silhouette on each side, using mountainDark with neonPink trunk stripes; scattered star dots (tiny spheres, white and neonCyan, about 20 each side) in the sky area; a neonPink stripe pair and a neonCyan stripe running diagonally beneath the sun; and a title decal text 'NEON RUNNER' in neonCyan lettering built from thin rods or an svg texture near the top. Sun, grid lines, stripes and stars are glow-ready (strength about 0.6 on the sun and stars).",
      "box": [[-0.36, 0.1, -0.42], [0.36, 1.78, 0.32]],
      "attaches": "Sits flat on the outer faces of cabinetShell's side panels at sideFaceX (x=+-0.341 to +-0.348). It does not cross the front edge of the profile.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "controlDeck",
      "builds": "The control panel that sticks out in front, from z=0.2 to 0.58, y 0.86 to 1.04, spanning x=+-0.35. A slab with a top surface slightly sloped (about 6 degrees, higher at the back, y=1.02 at deckBackEdge down to y=0.96 at the front lip), a panelPurple top with a rounded-looking bevelled front lip in cabinetBlack and a chrome edge strip along the lip. Top-surface overlay: a thin neonPink outline frame around the player 1 area, small neonCyan stripe chevrons and a 'PLAYER 1' label made of small blocks. Left, a joystick at joystickBase: a chrome dish ring, a rubber base boot, a steel shaft, and a red ball top (r about 0.022) with a small white highlight. Right, at buttonRowCenter, a cluster of 6 chunky arcade buttons in two rows of three (each a cylinder rim in rubber, a coloured cap in buttonRed, buttonBlue, buttonGreen, buttonYellow, neonPink and neonCyan, with a small white highlight on each) glowing at strength 1. In the middle two small round Start buttons (1P in buttonGreen and 2P in buttonYellow) with tiny labels. A trackball with a chrome ring and a dark-red sphere on the left of the joystick is optional. Under the lip, a cabinetBlack apron panel with 3 neonCyan thin accent lines running along the full width. Side cheeks of cabinetBlack at x=+-0.35 close the deck's ends, with neonPink T-molding along the lip's front edge.",
      "box": [[-0.36, 0.86, 0.2], [0.36, 1.12, 0.58]],
      "attaches": "Back edge meets the bezel bottom at deckBackEdge/bezelBottom. Underside rests on the front board top (y 0.92) at z 0.2-0.35. Sides are flush with the cabinet sides at x=+-0.35.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "screenMarquee",
      "builds": "Everything from y=1.05 up at the front. (1) The CRT bezel: a cabinetBlack front board leaning back about 8 degrees between bezelBottom (y=1.05, z=0.24) and bezelTop (y=1.6, z=0.16), with a rectangular opening centred at screenCenter around 0.5 wide by 0.4 high. Built from four frame bars, the flared inner bevel in panelPurple, and a thin neonPink glowing inner trim around the glass. Four small steel screws at the corners. (2) The screen glass: a slightly curved-looking slab of screenGlass at screenCenter facing screenNormal, carrying a glowing synthwave game scene as flat parts in layers, lit with the glow kit. A screenSky background with a horizontal gradient made of 5 bands going from screenSky up through neonViolet and screenGlow at the horizon; a sun semicircle in sunYellow and sunOrange with stripe gaps; a dark mountain line; a ground of cabinetBlack with a gridMagenta perspective road converging to the horizon, two neonCyan road edges and a dashed center line; a small retro low-poly car at the bottom seen from behind, with neonPink body, a cabinetBlack window and two red tail lights; and score text 'SCORE 009900' and 'HI 099999' at the top in white, plus a row of 3 tiny car icons for lives. (3) A shaded CRT hood: sloped cabinetBlack top and side blinders between the bezel and the marquee. (4) The marquee box on top: a cabinetBlack frame (x +-0.34, y 1.6-1.85, front face z=0.21) with a glowing lit title panel 0.6 wide by 0.2 high, a deepIndigo backing with a neonPink to neonViolet to neonCyan horizontal banded gradient, the lettering 'NEON RUNNER' in white with neonCyan shadow offset (as svg texture or letter blocks), a small sun-and-grid emblem on each side of the title, and neonPink outline tubes around the marquee front. (5) Two small speaker grille bars in rubber with chrome slots on either side of the marquee panel.",
      "box": [[-0.36, 1.05, -0.28], [0.36, 1.85, 0.22]],
      "attaches": "Bezel bottom meets the controlDeck back edge at bezelBottom. Bezel and marquee sides tuck between cabinetShell's side panels and follow the side profile. The marquee top is flush with the shell top plate at y=1.85.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "coinFront",
      "builds": "The lower front of the cabinet, below the deck, from y=0.04 to 0.92, owning the front board between the side panels at z=0.33-0.35. (1) A cabinetBlack front board with a deepIndigo inset panel. (2) The coin door centred at coinDoorCenter: a chrome-bordered steel door plate (about 0.26 wide by 0.4 high, 0.02 thick, raised to z=0.37) with two coin mechanism modules side by side. Each has a rubber housing, a chrome coin slot plate with a dark slot, a glowing coin button (buttonRed and buttonBlue, glow strength 1.2) with a small '25c' label built from small blocks, and a return cup opening in rubber with a chrome flap. A brass lock cylinder with a keyhole at the door's lower centre. Four tiny steel bolts at the door corners. (3) Below the coin door, a cash-box door plate, rectangular and cabinetBlack, with a chrome handle bar and a brass keyed lock. (4) Neon accents: a neonCyan glowing strip along the door's top border and a neonPink horizontal stripe pair across the full front below the deck (y about 0.88-0.9), with a short row of 5 neonViolet vertical glowing slits at the bottom, each 0.02 wide. (5) A kick-plate toe band at y 0.04-0.14, rubber coloured with a neonPink thin line on top. (6) A small sticker-style sign plate 'INSERT COIN' in white on neonPink above the door, plus a small panel '1 PLAY = 25c'.",
      "box": [[-0.34, 0.04, 0.31], [0.34, 0.92, 0.38]],
      "attaches": "Fits between the shell's side panels at frontBoardFace (z=0.35). Its top meets the underside of controlDeck at y=0.92. Its bottom stops at y=0.04 over the shell's bottom plate.",
      "joints": [],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: cabinetShell -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabinetShell({ b, J, P, M }: Ctx) {
  // ---------------------------------------------------------------- helpers
  const box = (
    w: number,
    h: number,
    d: number,
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });

  const cyl = (
    r: number,
    h: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    seg = 8,
  ) => b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir });

  // Side profile (z, y), counter-clockwise, as given by the spec.
  const PROFILE: [number, number][] = [
    [-0.45, 0.04],
    [0.35, 0.04],
    [0.35, 0.92],
    [0.24, 1.05],
    [0.16, 1.6],
    [0.2, 1.6],
    [0.2, 1.85],
    [-0.28, 1.85],
    [-0.28, 1.15],
    [-0.45, 0.95],
  ];

  // Mitred inward offset of a counter-clockwise polygon.
  const offsetPoly = (pts: [number, number][], d: number): [number, number][] =>
    pts.map((p, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      const c = pts[(i + 1) % pts.length];
      const n = (u: [number, number], v: [number, number]) => {
        const dx = v[0] - u[0];
        const dy = v[1] - u[1];
        const l = Math.hypot(dx, dy);
        return [-dy / l, dx / l] as [number, number];
      };
      const n1 = n(a, p);
      const n2 = n(p, c);
      const k = d / (1 + n1[0] * n2[0] + n1[1] * n2[1]);
      return [p[0] + (n1[0] + n2[0]) * k, p[1] + (n1[1] + n2[1]) * k];
    });

  // ---------------------------------------------------------------- 1. side panels
  for (const s of [1, -1]) {
    b.extrude(PROFILE, {
      at: [s * 0.33, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.002,
      color: P.cabinetBlack,
      name: `cabinetShellSide${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------- 4. T-molding
  const inner = offsetPoly(PROFILE, 0.012);
  const MX = 0.352;
  for (const s of [1, -1]) {
    const pt = (i: number): [number, number, number] => [s * MX, inner[i][1], inner[i][0]];
    for (let i = 0; i < PROFILE.length; i++) {
      const j = (i + 1) % PROFILE.length;
      const front = i === 1; // lower front vertical edge
      const color = front ? P.neonCyan : P.neonPink;
      glow(b.capsule(pt(i), pt(j), 0.012, color, { sides: 8, name: `cabinetShellMold${i}` }), 1.5);
    }
    // cyan corner caps at each turn
    for (let i = 0; i < PROFILE.length; i++) {
      glow(b.part(new THREE.SphereGeometry(0.0175, 8, 6), P.neonCyan, { at: pt(i) }), 1.5);
    }
  }

  // ---------------------------------------------------------------- 2. back panel
  // lower vertical board
  box(0.64, 0.91, 0.02, [0, 0.495, -0.44], P.cabinetBlack, { name: "cabinetShellBackLow" });
  // slanted board
  b.part(new THREE.BoxGeometry(0.64, 0.2725, 0.02), P.cabinetBlack, {
    at: [0, 1.0435, -0.3574],
    dir: [0, 0.2, 0.17],
    name: "cabinetShellBackSlant",
  });
  // upper vertical board
  box(0.64, 0.7, 0.02, [0, 1.5, -0.29], P.cabinetBlack, { name: "cabinetShellBackHigh" });

  // access door on the lower back (outer face z = -0.45)
  const DOOR_Y = 0.5;
  box(0.376, 0.576, 0.004, [0, DOOR_Y, -0.452], P.deepIndigo, { name: "cabinetShellDoorPanel" });
  box(0.4, 0.012, 0.008, [0, DOOR_Y + 0.294, -0.454], P.rubber);
  box(0.4, 0.012, 0.008, [0, DOOR_Y - 0.294, -0.454], P.rubber);
  box(0.012, 0.576, 0.008, [0.194, DOOR_Y, -0.454], P.rubber);
  box(0.012, 0.576, 0.008, [-0.194, DOOR_Y, -0.454], P.rubber);
  // hinges
  for (const y of [0.3, 0.5, 0.7]) box(0.014, 0.05, 0.016, [-0.2, y, -0.458], P.steel);
  // handle
  box(0.012, 0.12, 0.012, [0.15, DOOR_Y, -0.462], P.chrome);
  for (const y of [0.45, 0.55]) box(0.01, 0.01, 0.007, [0.15, y, -0.455], P.chrome);
  // screws on the door (steel with a slot)
  for (const sx of [-0.15, 0.15]) {
    cyl(0.008, 0.006, [sx, 0.76, -0.457], P.steel, [0, 0, -1]);
    box(0.011, 0.002, 0.002, [sx, 0.76, -0.4605], P.rubber, { rotation: [0, 0, sx > 0 ? 35 : -20] });
  }

  // power inlet and warning sticker on the lower back
  box(0.075, 0.055, 0.006, [0.255, 0.12, -0.453], P.steel);
  box(0.042, 0.03, 0.006, [0.24, 0.12, -0.459], P.rubber);
  box(0.012, 0.022, 0.008, [0.285, 0.12, -0.459], P.chrome);
  box(0.075, 0.045, 0.003, [-0.255, 0.12, -0.4515], P.white);
  box(0.075, 0.009, 0.0035, [-0.255, 0.1385, -0.4517], P.neonPink);
  for (let i = 0; i < 3; i++) box(0.05, 0.004, 0.0035, [-0.255, 0.123 - i * 0.01, -0.4518], P.cabinetBlack);

  // vent grille on the upper back (outer face z = -0.28)
  box(0.34, 0.13, 0.004, [0, 1.65, -0.282], P.deepIndigo, { name: "cabinetShellVentPlate" });
  for (let i = 0; i < 6; i++) {
    box(0.31, 0.008, 0.004, [0, 1.65 + (i - 2.5) * 0.019, -0.286], P.rubber, { name: `cabinetShellVentSlat${i}` });
  }
  for (const sx of [-0.16, 0.16])
    for (const sy of [1.6, 1.7]) cyl(0.006, 0.005, [sx, sy, -0.2845], P.steel, [0, 0, -1], 6);

  // ---------------------------------------------------------------- 3. plates and shelf
  box(0.64, 0.02, 0.48, [0, 1.84, -0.04], P.cabinetBlack, { name: "cabinetShellTopPlate" });
  box(0.64, 0.02, 0.76, [0, 0.05, -0.05], P.cabinetBlack, { name: "cabinetShellBottomPlate" });
  box(0.64, 0.012, 0.38, [0, 0.905, 0.14], P.deepIndigo, { name: "cabinetShellShelf" });
  for (const s of [1, -1]) box(0.012, 0.03, 0.38, [s * 0.314, 0.884, 0.14], P.deepIndigo);

  // ---------------------------------------------------------------- 5. leveler feet
  for (const sx of [-0.28, 0.28]) {
    for (const sz of [-0.38, 0.29]) {
      cyl(0.032, 0.012, [sx, 0.006, sz], P.rubber, [0, 1, 0], 10);
      cyl(0.014, 0.022, [sx, 0.023, sz], P.chrome, [0, 1, 0], 8);
      cyl(0.025, 0.008, [sx, 0.036, sz], P.chrome, [0, 1, 0], 8);
    }
  }

  // ---------------------------------------------------------------- 6. trim ribs at the front board
  for (const s of [1, -1]) {
    box(0.014, 0.84, 0.008, [s * 0.31, 0.48, 0.354], P.deepIndigo, { name: "cabinetShellRib" });
  }
  // low horizontal base rib along the rear inner floor
  box(0.64, 0.01, 0.01, [0, 0.065, -0.425], P.deepIndigo);
}
```

<!-- call: coinFront -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildCoinFront({ b, J, P, M }: Ctx) {
  // ---------- local palette (palette names + a few of my own) ----------
  const DARK_SLOT = "#050308";

  // ---------- helpers ----------
  const box = (
    w: number, h: number, d: number, color: string,
    x: number, y: number, z: number, rot?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { at: [x, y, z], rotation: rot } : { at: [x, y, z] });

  // cylinder with its axis along +Z (facing the viewer)
  const disc = (r: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: [x, y, z], dir: [0, 0, 1], flat: true });

  // cylinder with its axis along X
  const barX = (r: number, len: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), color, { at: [x, y, z], dir: [1, 0, 0], flat: true });

  // 3x5 block font
  const FONT: Record<string, string[]> = {
    A: ["010", "101", "111", "101", "101"],
    C: ["011", "100", "100", "100", "011"],
    E: ["111", "100", "110", "100", "111"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    L: ["100", "100", "100", "100", "111"],
    N: ["101", "111", "111", "101", "101"],
    O: ["111", "101", "101", "101", "111"],
    P: ["110", "101", "110", "100", "100"],
    R: ["110", "101", "110", "101", "101"],
    S: ["011", "100", "010", "001", "110"],
    T: ["111", "010", "010", "010", "010"],
    Y: ["101", "101", "010", "010", "010"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["110", "001", "010", "100", "111"],
    "5": ["111", "100", "110", "001", "110"],
    c: ["000", "011", "100", "100", "011"],
    "=": ["000", "111", "000", "111", "000"],
    " ": ["000", "000", "000", "000", "000"],
  };

  // Text of merged blocks facing +Z; reads left to right for a viewer in front (+x to the right).
  const text = (str: string, cx: number, cy: number, z: number, px: number, depth: number, color: string) => {
    const w = str.length * 4 - 1;
    const x0 = cx - (w * px) / 2;
    const yTop = cy + (5 * px) / 2;
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < str.length; i++) {
      const rows = FONT[str[i]];
      if (!rows) continue;
      for (let r = 0; r < 5; r++) {
        let c = 0;
        while (c < 3) {
          if (rows[r][c] === "1") {
            let n = 1;
            while (c + n < 3 && rows[r][c + n] === "1") n++;
            geos.push(
              new THREE.BoxGeometry(n * px, px, depth).translate(
                x0 + (i * 4 + c + n / 2) * px,
                yTop - (r + 0.5) * px,
                z + depth / 2,
              ),
            );
            c += n;
          } else c++;
        }
      }
    }
    if (!geos.length) return null;
    const merged = mergeGeometries(geos);
    if (!merged) return null;
    return b.part(merged, color, { at: [0, 0, 0] });
  };

  // ---------- 1. front board + inset ----------
  const [, , ] = M.frontBoardFace;
  const BOARD_W = 0.64;
  // board z 0.33-0.35, y 0.04-0.92
  box(BOARD_W, 0.88, 0.02, P.cabinetBlack, 0, 0.48, 0.34);
  // deepIndigo inset panel z 0.35-0.354
  box(0.58, 0.7, 0.004, P.deepIndigo, 0, 0.51, 0.352);
  // faint violet edge lines on the inset
  for (const s of [1, -1]) {
    glow(box(0.004, 0.68, 0.003, P.neonViolet, s * 0.285, 0.51, 0.3555), 0.8);
  }

  // ---------- 4. neon accents ----------
  // pink stripe pair under the deck
  glow(box(BOARD_W, 0.007, 0.005, P.neonPink, 0, 0.9, 0.3525), 1.5);
  glow(box(BOARD_W, 0.007, 0.005, P.neonPink, 0, 0.884, 0.3525), 1.5);

  // ---------- 5. kick plate ----------
  box(BOARD_W, 0.1, 0.006, P.rubber, 0, 0.09, 0.353);
  glow(box(BOARD_W, 0.006, 0.007, P.neonPink, 0, 0.143, 0.3535), 1.5);
  // five violet glowing slits (0.02 wide)
  for (let i = 0; i < 5; i++) {
    glow(box(0.02, 0.04, 0.004, P.neonViolet, (i - 2) * 0.05, 0.09, 0.358), 1.2);
  }

  // ---------- 2. coin door ----------
  const DX = M.coinDoorCenter[0];
  const DY = M.coinDoorCenter[1];
  const FW = 0.27, FH = 0.41, BAR = 0.012;
  const PW = FW - 2 * BAR, PH = FH - 2 * BAR;
  // chrome frame
  box(FW, BAR, 0.018, P.chrome, DX, DY + FH / 2 - BAR / 2, 0.363);
  box(FW, BAR, 0.018, P.chrome, DX, DY - FH / 2 + BAR / 2, 0.363);
  for (const s of [1, -1]) box(BAR, PH, 0.018, P.chrome, DX + s * (FW / 2 - BAR / 2), DY, 0.363);
  // steel plate, face at z=0.37
  box(PW, PH, 0.016, P.steel, DX, DY, 0.362);
  // glowing cyan strip on the door's top border
  glow(box(FW, 0.006, 0.008, P.neonCyan, DX, DY + FH / 2 + 0.003, 0.358), 1.5);
  // hinge barrels on the left edge (+x side is the model's left; hinge on the viewer's left = -x)
  for (const y of [DY - 0.13, DY + 0.13]) {
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.045, 8), P.chrome, { at: [DX - 0.143, y, 0.362], flat: true });
  }
  // latch on the right edge
  box(0.008, 0.05, 0.012, P.chrome, DX + 0.139, DY, 0.36);
  // corner bolts
  for (const sx of [1, -1])
    for (const sy of [1, -1]) disc(0.006, 0.003, 6, P.steel, DX + sx * 0.112, DY + sy * 0.18, 0.3715);

  // two coin modules
  const mods = [
    { x: -0.058, color: P.buttonRed },
    { x: 0.058, color: P.buttonBlue },
  ];
  for (const m of mods) {
    // rubber housing
    box(0.1, 0.26, 0.006, P.rubber, m.x, 0.59, 0.373);
    // chrome coin slot plate + dark slot
    box(0.05, 0.07, 0.002, P.chrome, m.x, 0.675, 0.377);
    box(0.006, 0.034, 0.0015, DARK_SLOT, m.x, 0.675, 0.3785);
    // glowing coin slot lights
    for (const s of [1, -1]) glow(box(0.004, 0.04, 0.002, P.buttonYellow, m.x + s * 0.036, 0.675, 0.377), 1);
    // coin button: chrome ring, glowing cap, highlight
    disc(0.018, 0.002, 10, P.chrome, m.x, 0.6, 0.377);
    glow(disc(0.014, 0.003, 10, m.color, m.x, 0.6, 0.3795), 1.2);
    b.part(new THREE.SphereGeometry(0.003, 6, 4), P.white, { at: [m.x - 0.005, 0.605, 0.3812] });
    // 25c label
    text("25c", m.x, 0.555, 0.376, 0.004, 0.002, P.white);
    // return cup opening + chrome flap
    box(0.054, 0.03, 0.0015, DARK_SLOT, m.x, 0.495, 0.3767);
    box(0.05, 0.02, 0.0015, P.chrome, m.x, 0.499, 0.3785, [-15, 0, 0]);
  }

  // brass lock cylinder + keyhole at the door's lower centre
  disc(0.025, 0.002, 12, P.chrome, DX, 0.405, 0.371);
  disc(0.019, 0.004, 12, P.brass, DX, 0.405, 0.374);
  box(0.0035, 0.012, 0.0015, DARK_SLOT, DX, 0.405, 0.3765);
  disc(0.0035, 0.0015, 6, DARK_SLOT, DX, 0.412, 0.3765);

  // ---------- 3. cash-box door ----------
  const CY = 0.24;
  box(0.3, 0.12, 0.006, P.cabinetBlack, 0, CY, 0.357);
  box(0.308, 0.004, 0.006, P.steel, 0, CY + 0.062, 0.357);
  box(0.308, 0.004, 0.006, P.steel, 0, CY - 0.062, 0.357);
  for (const s of [1, -1]) box(0.004, 0.12, 0.006, P.steel, s * 0.152, CY, 0.357);
  // chrome handle bar on two standoffs
  for (const s of [1, -1]) box(0.008, 0.008, 0.01, P.chrome, s * 0.05, CY + 0.02, 0.365);
  barX(0.006, 0.12, P.chrome, 0, CY + 0.02, 0.372);
  // brass keyed lock
  disc(0.016, 0.002, 12, P.chrome, 0.11, CY - 0.025, 0.361);
  disc(0.012, 0.004, 12, P.brass, 0.11, CY - 0.025, 0.364);
  box(0.003, 0.01, 0.0015, DARK_SLOT, 0.11, CY - 0.025, 0.3662);
  // label and bolts
  text("CASH", -0.1, CY - 0.025, 0.36, 0.004, 0.002, P.steel);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) disc(0.005, 0.003, 6, P.steel, sx * 0.136, CY + sy * 0.045, 0.3615);

  // ---------- 6. signs ----------
  // INSERT COIN sticker: black border, pink plate, cyan shadow, white lettering
  box(0.23, 0.05, 0.002, P.cabinetBlack, 0, 0.815, 0.355);
  box(0.22, 0.04, 0.003, P.neonPink, 0, 0.815, 0.3575);
  text("INSERT COIN", 0.0015, 0.8135, 0.359, 0.0044, 0.0015, P.neonCyan);
  text("INSERT COIN", 0, 0.815, 0.3605, 0.0044, 0.002, P.white);

  // 1 PLAY = 25c panel on the right of the door
  box(0.1, 0.05, 0.003, P.panelPurple, 0.215, 0.6, 0.3555);
  box(0.096, 0.002, 0.0015, P.neonPink, 0.215, 0.622, 0.358);
  text("1 PLAY", 0.215, 0.606, 0.357, 0.003, 0.0015, P.white);
  text("= 25c", 0.215, 0.586, 0.357, 0.003, 0.0015, P.sunYellow);

  // cyan chevrons pointing at the door, on the left
  const chev: [number, number][] = [
    [-0.016, 0.022], [-0.004, 0.022], [0.016, 0], [-0.004, -0.022], [-0.016, -0.022], [0.004, 0],
  ];
  for (let i = 0; i < 3; i++) {
    glow(
      b.extrude(chev, {
        at: [-0.25 + i * 0.03, DY, 0.356],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.004,
        color: P.neonCyan,
      }),
      1.2,
    );
  }
}
```

<!-- call: controlDeck -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildControlDeck({ b, P, M }: Ctx) {
  // ---------------------------------------------------------------------------------------------
  // Deck surface maths: top plane falls from y=1.02 at z=0.2 to y=0.96 at z=0.58
  // ---------------------------------------------------------------------------------------------
  const SLOPE = 0.06 / 0.38;
  const topY = (z: number) => 1.02 - (z - 0.2) * SLOPE;
  const TILT = Math.atan(SLOPE);
  const N = new THREE.Vector3(0, Math.cos(TILT), Math.sin(TILT)); // surface normal (leans forward)
  const AX_X = new THREE.Vector3(1, 0, 0);
  const AX_Y = new THREE.Vector3(0, 1, 0);
  const ONE = new THREE.Vector3(1, 1, 1);
  const qTilt = new THREE.Quaternion().setFromAxisAngle(AX_X, TILT);
  const mat = new THREE.Matrix4();
  const surf = (x: number, z: number) => new THREE.Vector3(x, topY(z), z);

  const DARK_RED = "#6b0f24";
  const CH = 0.348; // cheek centre x
  const CORE_HALF = 0.338;

  // A box lying on the deck top: x/z are deck-plane coordinates, lift is the height of its underside.
  const flat = (w: number, h: number, d: number, x: number, z: number, lift: number, yawDeg = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const q = qTilt.clone().multiply(new THREE.Quaternion().setFromAxisAngle(AX_Y, (yawDeg * Math.PI) / 180));
    const pos = surf(x, z).addScaledVector(N, lift + h / 2);
    g.applyMatrix4(mat.compose(pos, q, ONE));
    return g;
  };
  const emit = (list: THREE.BufferGeometry[], color: string, strength = 0) => {
    if (!list.length) return;
    const merged = mergeGeometries(list);
    if (!merged) throw new Error("controlDeck: merge failed");
    const part = b.part(merged, color, { at: [0, 0, 0] });
    if (strength) glow(part, strength);
    return part;
  };
  // A turned/cylindrical piece standing on the deck along the surface normal.
  const stand = (geo: THREE.BufferGeometry, color: string, x: number, z: number, lift: number, strength = 0) => {
    const part = b.part(geo, color, { at: surf(x, z).addScaledVector(N, lift), dir: N });
    if (strength) glow(part, strength);
    return part;
  };

  // 3x5 pixel font for labels
  const FONT: Record<string, string[]> = {
    P: ["111", "101", "111", "100", "100"],
    L: ["100", "100", "100", "100", "111"],
    A: ["010", "101", "111", "101", "101"],
    Y: ["101", "101", "010", "010", "010"],
    E: ["111", "100", "110", "100", "111"],
    R: ["110", "101", "110", "101", "101"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["110", "001", "010", "100", "111"],
    " ": ["000", "000", "000", "000", "000"],
  };
  // Text reads upright and left-to-right for the player standing in front (+x is the player's right).
  const text = (str: string, x0: number, z0: number, cell: number, lift: number, thick: number) => {
    const out: THREE.BufferGeometry[] = [];
    [...str].forEach((ch, ci) => {
      const rows = FONT[ch];
      rows.forEach((row, r) =>
        [...row].forEach((bit, c) => {
          if (bit === "1")
            out.push(
              flat(cell * 0.9, thick, cell * 0.9, x0 + (ci * 4 + c) * cell + cell / 2, z0 + r * cell + cell / 2, lift),
            );
        }),
      );
    });
    return out;
  };

  // ---------------------------------------------------------------------------------------------
  // Deck body: core, top plate, lip, apron, cheeks
  // ---------------------------------------------------------------------------------------------
  const X_Z: [number, number, number] = [0, 0, 1];
  // rear core, tucked between the cabinet sides
  b.extrude(
    [
      [0.2, 0.92],
      [0.35, 0.92],
      [0.35, topY(0.35) - 0.012],
      [0.2, topY(0.2) - 0.012],
    ],
    { at: [0, 0, 0], x: X_Z, thickness: 0.64, color: P.cabinetBlack },
  );
  // front core
  b.extrude(
    [
      [0.35, 0.92],
      [0.56, 0.92],
      [0.56, topY(0.56) - 0.012],
      [0.35, topY(0.35) - 0.012],
    ],
    { at: [0, 0, 0], x: X_Z, thickness: CORE_HALF * 2, color: P.cabinetBlack },
  );
  // purple top plate (sloped)
  b.extrude(
    [
      [0.2, topY(0.2) - 0.012],
      [0.568, topY(0.568) - 0.012],
      [0.568, topY(0.568)],
      [0.2, topY(0.2)],
    ],
    { at: [0, 0, 0], x: X_Z, thickness: CORE_HALF * 2, color: P.panelPurple },
  );
  // bevelled front lip
  b.extrude(
    [
      [0.56, 0.92],
      [0.566, 0.92],
      [0.572, 0.926],
      [0.572, 0.9515],
      [0.566, 0.957],
      [0.56, 0.9632],
    ],
    { at: [0, 0, 0], x: X_Z, thickness: CORE_HALF * 2, color: P.cabinetBlack },
  );
  // chrome strip along the lip's top edge
  b.rod([-CORE_HALF, 0.9595, 0.5685], [CORE_HALF, 0.9595, 0.5685], 0.004, P.chrome, { sides: 8 });
  // neonPink T-molding along the lip's front edge
  glow(b.capsule([-0.352, 0.938, 0.5745], [0.352, 0.938, 0.5745], 0.005, P.neonPink, { sides: 8 }), 1.5);

  // apron under the lip
  b.part(new THREE.BoxGeometry(CORE_HALF * 2, 0.06, 0.03), P.cabinetBlack, { at: [0, 0.89, 0.545] });
  const apronLines: THREE.BufferGeometry[] = [];
  for (const y of [0.872, 0.89, 0.908]) {
    apronLines.push(new THREE.BoxGeometry(0.66, 0.003, 0.0025).translate(0, y, 0.5612));
  }
  emit(apronLines, P.neonCyan, 1.3);

  // side cheeks closing the deck ends
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.34, 0.86],
        [0.56, 0.86],
        [0.56, 0.92],
        [0.572, 0.926],
        [0.572, topY(0.572) + 0.004],
        [0.34, topY(0.34) + 0.004],
      ],
      { at: [s * CH, 0, 0], x: X_Z, thickness: 0.02, color: P.cabinetBlack },
    );
    // two steel screws on each cheek, outer face
    for (const z of [0.4, 0.52]) {
      b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), P.steel, {
        at: [s * 0.358, 0.905, z],
        dir: [s, 0, 0],
      });
    }
    // short neonPink cap where the lip molding wraps the cheek corner
    glow(b.part(new THREE.SphereGeometry(0.0058, 8, 6), P.neonPink, { at: [s * 0.352, 0.938, 0.5745] }), 1.5);
  }

  // corner screws on the top plate
  for (const s of [1, -1])
    for (const z of [0.213, 0.536])
      stand(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 8), P.steel, s * 0.328, z, 0.002);

  // ---------------------------------------------------------------------------------------------
  // Top overlay: neonPink frame, chevrons, label
  // ---------------------------------------------------------------------------------------------
  const FX = 0.315;
  const FZ0 = 0.225;
  const FZ1 = 0.545;
  const frameBars = [
    flat(FX * 2 + 0.006, 0.003, 0.006, 0, FZ0, 0),
    flat(FX * 2 + 0.006, 0.003, 0.006, 0, FZ1, 0),
    flat(0.006, 0.003, FZ1 - FZ0 - 0.006, FX, (FZ0 + FZ1) / 2, 0),
    flat(0.006, 0.003, FZ1 - FZ0 - 0.006, -FX, (FZ0 + FZ1) / 2, 0),
  ];
  emit(frameBars, P.neonPink, 1.2);

  // chevrons pointing at the screen
  const chevrons: THREE.BufferGeometry[] = [];
  const chev = (x: number, z: number) => {
    chevrons.push(flat(0.02, 0.0015, 0.0045, x + 0.0075, z + 0.0068, 0, -42));
    chevrons.push(flat(0.02, 0.0015, 0.0045, x - 0.0075, z + 0.0068, 0, 42));
  };
  for (let i = 0; i < 5; i++) chev(0.15 + i * 0.035, 0.262);
  for (let i = 0; i < 3; i++) {
    chev(-0.26 + i * 0.03, 0.505);
    chev(0.21 + i * 0.03, 0.505);
  }
  emit(chevrons, P.neonCyan, 1);

  // 'PLAYER 1' label with a cyan shadow
  const lx = -0.295;
  const lz = 0.245;
  emit(text("PLAYER 1", lx + 0.002, lz + 0.002, 0.0045, 0.0005, 0.0008), P.neonCyan, 1);
  emit(text("PLAYER 1", lx, lz, 0.0045, 0.0014, 0.0012), P.white);

  // ---------------------------------------------------------------------------------------------
  // Joystick (left) and trackball
  // ---------------------------------------------------------------------------------------------
  const jx = M.joystickBase[0];
  const jz = M.joystickBase[2];
  b.lathe(
    [
      [0.03, 0],
      [0.058, 0],
      [0.06, 0.004],
      [0.056, 0.009],
      [0.034, 0.015],
      [0.03, 0.012],
    ],
    { at: surf(jx, jz).addScaledVector(N, -0.001), axis: N, segments: 16, color: P.chrome },
  );
  stand(new THREE.CylinderGeometry(0.012, 0.029, 0.04, 12), P.rubber, jx, jz, 0.021);
  stand(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), P.steel, jx, jz, 0.042);
  stand(new THREE.CylinderGeometry(0.006, 0.006, 0.056, 8), P.steel, jx, jz, 0.0575);
  stand(new THREE.SphereGeometry(0.022, 12, 8), P.buttonRed, jx, jz, 0.097);
  const ballC = surf(jx, jz).addScaledVector(N, 0.097);
  const hd = new THREE.Vector3(0.3, 0.6, 0.7).normalize();
  b.part(new THREE.SphereGeometry(0.0045, 6, 4), P.white, { at: ballC.clone().addScaledVector(hd, 0.0205) });

  // trackball
  const tx = -0.275;
  const tz = 0.4;
  b.lathe(
    [
      [0.022, 0],
      [0.036, 0],
      [0.037, 0.004],
      [0.034, 0.01],
      [0.024, 0.012],
    ],
    { at: surf(tx, tz).addScaledVector(N, -0.001), axis: N, segments: 14, color: P.chrome },
  );
  stand(new THREE.SphereGeometry(0.027, 12, 8), DARK_RED, tx, tz, 0.014);
  b.part(new THREE.SphereGeometry(0.004, 6, 4), P.white, {
    at: surf(tx, tz).addScaledVector(N, 0.014).addScaledVector(hd, 0.0255),
  });

  // ---------------------------------------------------------------------------------------------
  // Button cluster (right): backing plate, outline, 6 chunky buttons
  // ---------------------------------------------------------------------------------------------
  const bx = M.buttonRowCenter[0];
  const bz = M.buttonRowCenter[2];
  b.part(flat(0.185, 0.0035, 0.14, bx, bz, 0), P.deepIndigo, { at: [0, 0, 0] });
  const plateOutline = [
    flat(0.178, 0.0015, 0.003, bx, bz - 0.066, 0.0035),
    flat(0.178, 0.0015, 0.003, bx, bz + 0.066, 0.0035),
    flat(0.003, 0.0015, 0.13, bx - 0.0875, bz, 0.0035),
    flat(0.003, 0.0015, 0.13, bx + 0.0875, bz, 0.0035),
  ];
  emit(plateOutline, P.neonViolet, 1);

  const buttons: [number, number, string][] = [
    [-0.055, -0.03, P.buttonRed],
    [0, -0.03, P.buttonBlue],
    [0.055, -0.03, P.buttonGreen],
    [-0.055, 0.03, P.buttonYellow],
    [0, 0.03, P.neonPink],
    [0.055, 0.03, P.neonCyan],
  ];
  const hi: THREE.BufferGeometry[] = [];
  for (const [dx, dz, col] of buttons) {
    const x = bx + dx;
    const z = bz + dz;
    stand(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 14), P.rubber, x, z, 0.0095);
    stand(new THREE.CylinderGeometry(0.0155, 0.0175, 0.014, 14), col, x, z, 0.0205, 1);
    stand(new THREE.SphereGeometry(0.0035, 6, 4), P.white, x - 0.006, z - 0.005, 0.0278);
  }
  void hi;

  // ---------------------------------------------------------------------------------------------
  // Start buttons with labels
  // ---------------------------------------------------------------------------------------------
  const sx = -0.024;
  b.part(flat(0.09, 0.003, 0.08, sx, 0.38, 0), P.deepIndigo, { at: [0, 0, 0] });
  const starts: [number, string, string][] = [
    [-0.048, P.buttonGreen, "1P"],
    [0.0, P.buttonYellow, "2P"],
  ];
  const labels: THREE.BufferGeometry[] = [];
  for (const [x, col, label] of starts) {
    stand(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 12), P.rubber, x, 0.362, 0.008);
    stand(new THREE.CylinderGeometry(0.0105, 0.0118, 0.012, 12), col, x, 0.362, 0.0145 + 0.003, 1);
    stand(new THREE.SphereGeometry(0.0025, 6, 4), P.white, x - 0.004, 0.358, 0.0235);
    labels.push(...text(label, x - 0.01225, 0.385, 0.0035, 0.003, 0.0012));
  }
  emit(labels, P.white);
}
```

<!-- call: sideArt -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: Record<string, string>; M: any };

export function buildSideArt({ b, P }: Ctx) {
  // ---------- helpers ----------
  const T = 0.001; // decal layer thickness
  const lx = (L: number) => 0.3415 + 0.001 * L; // x centre of layer L (outer face of panel is 0.34)

  // flat outline in (z, y) laid on the side panel, on layer L, mirrored by s
  const ex = (pts: any[], s: number, L: number, color: string) =>
    b.extrude(pts, { at: [s * lx(L), 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: T, color });

  // thin 4-sided rod in the panel plane, as raw geometry in model space (for merging)
  const rodGeo = (az: number, ay: number, bz: number, by: number, x: number, r0: number, r1: number) => {
    const dz = bz - az;
    const dy = by - ay;
    const len = Math.hypot(dz, dy);
    const g = new THREE.CylinderGeometry(r1, r0, len, 4, 1);
    g.rotateX(Math.atan2(dz, dy));
    g.translate(x, (ay + by) / 2, (az + bz) / 2);
    return g;
  };
  // flat bar (letter stroke) in the panel plane
  const barGeo = (az: number, ay: number, bz: number, by: number, x: number, w: number, d: number) => {
    const dz = bz - az;
    const dy = by - ay;
    const len = Math.hypot(dz, dy);
    const g = new THREE.BoxGeometry(d, len + w, w);
    g.rotateX(Math.atan2(dz, dy));
    g.translate(x, (ay + by) / 2, (az + bz) / 2);
    return g;
  };
  const merged = (list: THREE.BufferGeometry[], color: string, glowK: number) => {
    const g = mergeGeometries(list);
    if (!g) return null;
    const part = b.part(g, color, { at: [0, 0, 0], flat: true });
    if (glowK > 0) glow(part, glowK);
    return part;
  };

  // ---------- layout constants ----------
  const BACKING: [number, number][] = [
    [-0.4, 0.12], [0.3, 0.12], [0.3, 0.9], [0.21, 1.02], [0.125, 1.57],
    [0.17, 1.57], [0.17, 1.78], [-0.25, 1.78], [-0.25, 1.14], [-0.4, 0.962],
  ];
  const SUN = { cz: -0.05, cy: 1.0, R: 0.24 };
  const HORIZON = 0.7;
  const ZMIN = -0.399;
  const ZMAX = 0.299;

  const MID: any[] = [
    [ZMIN, 0.695], [ZMIN, 0.78], [-0.36, 0.83, "sharp"], [-0.31, 0.8], [-0.25, 0.9, "sharp"],
    [-0.19, 0.82], [-0.14, 0.86, "sharp"], [-0.08, 0.78], [-0.02, 0.84, "sharp"], [0.05, 0.77],
    [0.12, 0.88, "sharp"], [0.18, 0.79], [0.24, 0.85, "sharp"], [ZMAX, 0.77], [ZMAX, 0.695],
  ];
  const DARK: any[] = [
    [ZMIN, 0.695], [ZMIN, 0.75], [-0.34, 0.79, "sharp"], [-0.29, 0.73], [-0.22, 0.81, "sharp"],
    [-0.16, 0.74], [-0.1, 0.77, "sharp"], [-0.05, 0.715], [0.03, 0.725], [0.1, 0.76, "sharp"],
    [0.16, 0.72], [0.22, 0.79, "sharp"], [0.27, 0.74], [ZMAX, 0.76], [ZMAX, 0.695],
  ];

  // sun slice outline between two heights
  const hw = (y: number) => Math.sqrt(Math.max(0, SUN.R * SUN.R - (y - SUN.cy) ** 2));
  const sunBand = (y0: number, y1: number) => {
    const a = Math.max(y0, SUN.cy - SUN.R + 0.001);
    const c = Math.min(y1, SUN.cy + SUN.R - 0.001);
    const n = 4;
    const pts: [number, number][] = [];
    for (let k = 0; k <= n; k++) {
      const y = a + ((c - a) * k) / n;
      pts.push([SUN.cz - hw(y), y]);
    }
    for (let k = n; k >= 0; k--) {
      const y = a + ((c - a) * k) / n;
      pts.push([SUN.cz + hw(y), y]);
    }
    return pts;
  };

  // frond outline: curved leaf from the crown
  const frond = (zc: number, yc: number, aDeg: number, len: number, wmax: number, droop: number) => {
    const a = (aDeg * Math.PI) / 180;
    const N = 6;
    const C: number[][] = [];
    const Nn: number[][] = [];
    const Wd: number[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const z = zc + Math.cos(a) * len * t;
      const y = yc + Math.sin(a) * len * t - droop * len * t * t;
      const dz = Math.cos(a) * len;
      const dy = Math.sin(a) * len - 2 * droop * len * t;
      const m = Math.hypot(dz, dy);
      C.push([z, y]);
      Nn.push([-dy / m, dz / m]);
      Wd.push(wmax * Math.sin(Math.PI * Math.pow(t, 0.8)));
    }
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) pts.push([C[i][0] + Nn[i][0] * Wd[i], C[i][1] + Nn[i][1] * Wd[i]]);
    for (let i = N - 1; i >= 1; i--) pts.push([C[i][0] - Nn[i][0] * Wd[i], C[i][1] - Nn[i][1] * Wd[i]]);
    return { pts, C };
  };

  // stroke font: segments in a unit box (u0, v0, u1, v1)
  const FONT: Record<string, number[][]> = {
    N: [[0, 0, 0, 1], [0, 1, 1, 0], [1, 0, 1, 1]],
    E: [[0, 0, 0, 1], [0, 1, 1, 1], [0, 0.5, 0.8, 0.5], [0, 0, 1, 0]],
    O: [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0], [1, 0, 0, 0]],
    R: [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0.5], [1, 0.5, 0, 0.5], [0.4, 0.5, 1, 0]],
    U: [[0, 1, 0, 0], [0, 0, 1, 0], [1, 0, 1, 1]],
  };

  // ---------- stars (shared layout, same both sides) ----------
  const rand = rng(21);
  const sparkles: [number, number][] = [[-0.13, 1.46], [0.04, 1.33], [-0.2, 1.38], [0.06, 1.52]];
  const stripeLine = (z: number) => 1.27 + (z + 0.22) * 0.4776;
  const stars: { z: number; y: number; r: number }[] = [];
  let guard = 0;
  while (stars.length < 24 && guard++ < 4000) {
    const low = stars.length >= 18;
    const z = low ? -0.39 + rand() * 0.07 : -0.22 + rand() * 0.32;
    const y = low ? 0.86 + rand() * 0.08 : 1.27 + rand() * 0.31;
    if (!low && y > stripeLine(z) - 0.014 && y < stripeLine(z) + 0.062) continue;
    if (stars.some((p) => Math.hypot(p.z - z, p.y - y) < 0.028)) continue;
    if (sparkles.some((p) => Math.hypot(p[0] - z, p[1] - y) < 0.03)) continue;
    stars.push({ z, y, r: 0.003 + rand() * 0.0017 });
  }

  // ---------- one side ----------
  for (const s of [1, -1]) {
    // 1. backing + black discs / ground
    ex(BACKING, s, 0, P.deepIndigo);
    const disc: [number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      disc.push([SUN.cz + Math.sin(a) * SUN.R, SUN.cy - Math.cos(a) * SUN.R * 0.999]);
    }
    ex(disc, s, 1, P.cabinetBlack);
    ex([[-0.4, 0.12], [0.3, 0.12], [0.3, HORIZON], [-0.4, HORIZON]], s, 1, P.cabinetBlack);

    // 2. sun slices, gaps widen toward the bottom
    const hs = [0.12, 0.075, 0.065, 0.058, 0.05, 0.045];
    const gs = [0.006, 0.009, 0.013, 0.017, 0.021, 0];
    const cols = [P.sunYellow, P.sunYellow, P.sunOrange, P.sunOrange, P.sunsetRed, P.sunsetRed];
    let yt = SUN.cy + SUN.R;
    hs.forEach((h, i) => {
      glow(ex(sunBand(yt - h, yt), s, 2, cols[i]), 0.6);
      yt -= h + gs[i];
    });

    // sun halo ring (only the arc above the mountains)
    {
      const ring: THREE.BufferGeometry[] = [];
      const Rr = SUN.R + 0.008;
      const M = 36;
      let prev: [number, number] | null = null;
      for (let i = 0; i <= M; i++) {
        const a = (i / M) * Math.PI * 2;
        const z = SUN.cz + Math.sin(a) * Rr;
        const y = SUN.cy + Math.cos(a) * Rr;
        const ok = y >= 0.93 && z > -0.255;
        if (ok && prev) ring.push(rodGeo(prev[0], prev[1], z, y, s * lx(2), 0.0015, 0.0015));
        prev = ok ? [z, y] : null;
      }
      merged(ring, P.neonPink, 0.6);
    }

    // 3. mountains
    ex(MID, s, 3, P.mountainMid);
    ex(DARK, s, 4, P.mountainDark);
    const ridge = (pts: any[], x: number) => {
      const out: THREE.BufferGeometry[] = [];
      for (let i = 1; i < pts.length - 1; i++) {
        const [z, y] = pts[i];
        if (y > pts[i - 1][1] && y > pts[i + 1][1] && z < 0.28 && z > -0.39) {
          const pz = pts[i - 1][0];
          const py = pts[i - 1][1];
          out.push(rodGeo(z, y, z + (pz - z) * 0.55, y + (py - y) * 0.55, x, 0.0005, 0.0013));
        }
      }
      return out;
    };
    merged(ridge(MID, s * (lx(3) + 0.001)), P.neonViolet, 0.8);
    merged(ridge(DARK, s * (lx(5) + 0.0004)), P.neonCyan, 1);

    // 4. perspective grid + horizon glow
    {
      const gx = s * lx(2);
      const lines: THREE.BufferGeometry[] = [];
      for (let k = -4; k <= 4; k++) {
        const zb = SUN.cz + k * 0.0875;
        lines.push(rodGeo(SUN.cz, HORIZON - 0.001, zb, 0.125, gx, 0.0003, 0.0018));
      }
      merged(lines, P.gridMagenta, 0.7);
      const hz: THREE.BufferGeometry[] = [];
      for (let k = 1; k <= 6; k++) {
        const f = (k / 6.4) ** 2;
        const y = HORIZON - 0.57 * f;
        hz.push(rodGeo(ZMIN, y, ZMAX, y, gx, 0.0006 + 0.0012 * f, 0.0006 + 0.0012 * f));
      }
      merged(hz, P.gridMagenta, 0.7);
      merged([rodGeo(ZMIN, HORIZON, ZMAX, HORIZON, s * (lx(2) + 0.0003), 0.0028, 0.0028)], P.neonPink, 1.2);
    }

    // 5. palms
    const palm = (zb: number, y0: number, y1: number, lean: number, flen: number) => {
      const zcAt = (t: number) => zb + lean * t * t;
      const wAt = (t: number) => (0.014 - 0.006 * t) * (flen / 0.1);
      const ts = [0, 0.25, 0.5, 0.75, 1];
      const left = ts.map((t) => [zcAt(t) - wAt(t), y0 + (y1 - y0) * t] as [number, number]);
      const right = ts.map((t) => [zcAt(t) + wAt(t), y0 + (y1 - y0) * t] as [number, number]).reverse();
      ex([...left, ...right], s, 4, P.mountainDark);
      const stripes: THREE.BufferGeometry[] = [];
      for (const t of [0.12, 0.32, 0.52, 0.72, 0.9]) {
        const y = y0 + (y1 - y0) * t;
        stripes.push(barGeo(zcAt(t) - wAt(t) + 0.002, y, zcAt(t) + wAt(t) - 0.002, y, s * lx(5), 0.004, 0.0012));
      }
      merged(stripes, P.neonPink, 0.8);
      const zc = zcAt(1);
      const ribs: THREE.BufferGeometry[] = [];
      const angs = [15, 50, 90, 130, 165];
      const lens = [1, 0.95, 0.8, 0.95, 1];
      angs.forEach((a, i) => {
        const f = frond(zc, y1, a, flen * lens[i], 0.014 * (flen / 0.1), 0.55);
        ex(f.pts, s, 4, P.mountainDark);
        for (let k = 0; k < f.C.length - 1; k++)
          ribs.push(rodGeo(f.C[k][0], f.C[k][1], f.C[k + 1][0], f.C[k + 1][1], s * (lx(5) - 0.0002), 0.0008, 0.0008));
      });
      merged(ribs, P.neonViolet, 0.7);
    };
    palm(0.2, 0.14, 0.5, -0.07, 0.1);
    palm(-0.29, 0.15, 0.39, 0.04, 0.07);

    // 6. sparkles and stars
    sparkles.forEach(([z, y], i) => {
      const R1 = 0.014;
      const r1 = 0.0035;
      const pts: [number, number][] = [];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const r = k % 2 === 0 ? R1 : r1;
        pts.push([z + Math.sin(a) * r, y + Math.cos(a) * r]);
      }
      glow(ex(pts, s, 3, i % 2 ? P.neonCyan : P.white), 0.8);
    });
    {
      const white: THREE.BufferGeometry[] = [];
      const cyan: THREE.BufferGeometry[] = [];
      stars.forEach((st, i) => {
        const g = new THREE.SphereGeometry(st.r, 5, 4);
        g.translate(s * (lx(2) + 0.0005), st.y, st.z);
        (i % 2 ? cyan : white).push(g);
      });
      merged(white, P.white, 0.6);
      merged(cyan, P.neonCyan, 0.6);
    }

    // 7. diagonal stripes: neon pink pair + cyan
    {
      const zs = -0.22;
      const ze = 0.1;
      const ys = 1.27;
      const ye = 1.27 + (ze - zs) * 0.4776;
      const stripe = (o: number, w: number): [number, number][] => [
        [zs, ys + o], [ze, ye + o], [ze - 0.012, ye + o + w], [zs - 0.012, ys + o + w],
      ];
      glow(ex(stripe(0, 0.009), s, 2, P.neonPink), 1);
      glow(ex(stripe(0.016, 0.009), s, 2, P.neonPink), 1);
      glow(ex(stripe(0.034, 0.007), s, 2, P.neonCyan), 1);
    }

    // 8. title text: NEON / RUNNER (reads left-to-right as seen from outside)
    {
      const LW = 0.036;
      const GAP = 0.01;
      const LH = 0.05;
      const zc = -0.04;
      const text = (word: string, yBase: number, offU: number, offY: number, x: number, d: number, out: THREE.BufferGeometry[]) => {
        const width = word.length * LW + (word.length - 1) * GAP;
        [...word].forEach((ch, i) => {
          const u0 = i * (LW + GAP);
          for (const [a, bb, c, dd] of FONT[ch]) {
            const z0 = zc - s * (u0 + a * LW - width / 2 + offU);
            const z1 = zc - s * (u0 + c * LW - width / 2 + offU);
            out.push(barGeo(z0, yBase + bb * LH + offY, z1, yBase + dd * LH + offY, x, 0.0055, d));
          }
        });
        return width;
      };
      const front: THREE.BufferGeometry[] = [];
      const shadow: THREE.BufferGeometry[] = [];
      text("NEON", 1.705, 0, 0, s * (lx(5) + 0.0005), 0.003, front);
      const w2 = text("RUNNER", 1.635, 0, 0, s * (lx(5) + 0.0005), 0.003, front);
      text("NEON", 1.705, 0.004, -0.004, s * lx(4), 0.003, shadow);
      text("RUNNER", 1.635, 0.004, -0.004, s * lx(4), 0.003, shadow);
      shadow.push(barGeo(zc + 0.5 * w2, 1.617, zc - 0.5 * w2, 1.617, s * lx(4), 0.004, 0.003));
      merged(shadow, P.neonPink, 1);
      merged(front, P.neonCyan, 1.2);
    }

    // 9. thin violet frame following the backing outline
    {
      const fr: THREE.BufferGeometry[] = [];
      for (let i = 0; i < BACKING.length; i++) {
        const a = BACKING[i];
        const c = BACKING[(i + 1) % BACKING.length];
        fr.push(rodGeo(a[0], a[1], c[0], c[1], s * lx(1), 0.0013, 0.0013));
      }
      merged(fr, P.neonViolet, 0.5);
    }
  }
}
```

<!-- call: screenMarquee -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildScreenMarquee({ b, J, P, M }: Ctx) {
  void J; // static prop, no joints

  // ---------------------------------------------------------------- own colours (3 of 6)
  const ORCHID = "#c24fe0"; // between pink and violet
  const DUSK = "#5a2aa8"; // between violet and sky
  const PERIWINKLE = "#5f8cff"; // between violet and cyan

  // ---------------------------------------------------------------- batching: one merged part per colour + glow
  type Pt = [number, number];
  type Bucket = { color: string; g: number; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const add = (geo: THREE.BufferGeometry, color: string, g = 0) => {
    const key = `${color}|${g}`;
    let bk = buckets.get(key);
    if (!bk) {
      bk = { color, g, geos: [] };
      buckets.set(key, bk);
    }
    bk.geos.push(geo);
  };

  // ---------------------------------------------------------------- frames
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const mkFrame = (o: THREE.Vector3, X: THREE.Vector3, Y: THREE.Vector3, Z: THREE.Vector3) =>
    new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(o);

  const lean = Math.atan2(0.08, 0.55); // bezel leans back ~8 degrees
  const C = V(M.screenCenter[0], M.screenCenter[1], M.screenCenter[2]);
  const vUp = V(0, Math.cos(lean), -Math.sin(lean));
  const nrm = V(0, Math.sin(lean), Math.cos(lean));
  const S = mkFrame(C, V(1, 0, 0), vUp, nrm); // screen frame: u = right, v = up the bezel, d = out of the glass
  const G = new THREE.Matrix4(); // model frame
  const MQ = new THREE.Matrix4().makeTranslation(0, 1.73, 0); // marquee frame, local v = y - 1.73, d = z

  const putF = (F: THREE.Matrix4, geo: THREE.BufferGeometry, u: number, v: number, d: number, rz = 0) => {
    if (rz) geo.rotateZ(rz);
    geo.translate(u, v, d);
    geo.applyMatrix4(F);
    return geo;
  };
  const box = (F: THREE.Matrix4, color: string, u: number, v: number, d: number, w: number, h: number, t: number, g = 0, rz = 0) =>
    add(putF(F, new THREE.BoxGeometry(w, h, t), u, v, d, rz), color, g);
  const quad = (F: THREE.Matrix4, color: string, u: number, v: number, d: number, w: number, h: number, g = 0, rz = 0) =>
    add(putF(F, new THREE.PlaneGeometry(w, h), u, v, d, rz), color, g);
  const rod = (F: THREE.Matrix4, color: string, u0: number, v0: number, u1: number, v1: number, th: number, d: number, g = 0) => {
    const len = Math.hypot(u1 - u0, v1 - v0);
    quad(F, color, (u0 + u1) / 2, (v0 + v1) / 2, d, th, len, g, -Math.atan2(u1 - u0, v1 - v0));
  };
  const poly = (F: THREE.Matrix4, color: string, pts: Pt[], d: number, g = 0) => {
    let area = 0;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      area += p[0] * q[1] - q[0] * p[1];
    });
    const pp = area < 0 ? [...pts].reverse() : pts;
    const pos: number[] = [];
    const nor: number[] = [];
    const uv: number[] = [];
    pp.forEach((p) => {
      pos.push(p[0], p[1], d);
      nor.push(0, 0, 1);
      uv.push(0, 0);
    });
    const idx: number[] = [];
    for (let i = 1; i < pp.length - 1; i++) idx.push(0, i, i + 1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.applyMatrix4(F);
    add(geo, color, g);
  };
  const cyl = (color: string, x: number, y: number, z: number, r: number, len: number, axis: "x" | "y" | "z", g = 0, seg = 6) => {
    const geo = new THREE.CylinderGeometry(r, r, len, seg);
    if (axis === "x") geo.rotateZ(Math.PI / 2);
    else if (axis === "z") geo.rotateX(Math.PI / 2);
    geo.translate(x, y, z);
    add(geo, color, g);
  };
  const cylF = (F: THREE.Matrix4, color: string, u: number, v: number, d: number, r: number, len: number, seg = 8, g = 0) => {
    const geo = new THREE.CylinderGeometry(r, r, len, seg);
    geo.rotateX(Math.PI / 2);
    add(putF(F, geo, u, v, d), color, g);
  };
  const ball = (color: string, x: number, y: number, z: number, r: number, g = 0) => {
    const geo = new THREE.SphereGeometry(r, 6, 4);
    geo.translate(x, y, z);
    add(geo, color, g);
  };
  const star4 = (F: THREE.Matrix4, color: string, u: number, v: number, d: number, s: number, g = 0) => {
    quad(F, color, u, v, d, s, s * 0.22, g);
    quad(F, color, u, v, d + 0.0003, s * 0.22, s, g);
  };

  // ---------------------------------------------------------------- 5x7 block font
  const FONT: Record<string, string[]> = {
    N: ["10001", "11001", "10101", "10101", "10101", "10011", "10001"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  };
  // v0 = bottom of the text; d = front face; solid text gets thickness t
  const text = (F: THREE.Matrix4, color: string, str: string, u0: number, v0: number, cell: number, d: number, g = 0, solid = false, t = 0.004) => {
    [...str].forEach((ch, ci) => {
      const gl = FONT[ch];
      if (!gl) return;
      gl.forEach((row, r) => {
        let x = 0;
        while (x < 5) {
          if (row[x] === "1") {
            let n = 1;
            while (x + n < 5 && row[x + n] === "1") n++;
            const uc = u0 + (ci * 6 + x + n / 2) * cell;
            const vc = v0 + (6 - r + 0.5) * cell;
            if (solid) box(F, color, uc, vc, d - t / 2, n * cell, cell, t, g);
            else quad(F, color, uc, vc, d, n * cell, cell, g);
            x += n;
          } else x++;
        }
      });
    });
  };

  // ---------------------------------------------------------------- shared motifs
  const sun = (F: THREE.Matrix4, uc: number, vh: number, r: number, d: number, g: number) => {
    const k = r / 0.105;
    let y = 0;
    let i = 0;
    while (y < r - 0.0005) {
      const sh = (0.009 + i * 0.0018) * k;
      const y1 = Math.min(y + sh, r);
      const w0 = Math.sqrt(Math.max(r * r - y * y, 0));
      const w1 = Math.sqrt(Math.max(r * r - y1 * y1, 0));
      const fr = (y + y1) / 2 / r;
      const col = fr > 0.72 ? P.sunYellow : fr > 0.38 ? P.sunOrange : P.sunsetRed;
      poly(F, col, [[uc - w0, vh + y], [uc + w0, vh + y], [uc + w1, vh + y1], [uc - w1, vh + y1]], d, g);
      y = y1 + Math.max(0.0015 * k, (0.01 - 0.0013 * i) * k);
      i++;
    }
  };
  const gridLines = (F: THREE.Matrix4, uc: number, vh: number, D: number, hw: number, d: number, th: number, fracs: number[], ubs: number[], g = 1) => {
    fracs.forEach((f) => quad(F, P.gridMagenta, uc, vh - D * f, d, 2 * hw, th, g));
    ubs.forEach((ub) => {
      const t = ub === 0 ? 1 : Math.min(1, hw / Math.abs(ub));
      rod(F, P.gridMagenta, uc, vh, uc + ub * t, vh - D * t, th, d, g);
    });
  };

  // =================================================================== (1) CRT BEZEL
  const K = P.cabinetBlack;
  // frame bars (bezel plane: v -0.2828 .. 0.2728, 0.03 thick)
  box(S, K, 0, -0.2484, 0, 0.64, 0.0688, 0.03); // bottom bar
  box(S, K, 0, 0.2434, 0, 0.64, 0.0588, 0.03); // top bar
  for (const s of [1, -1]) box(S, K, s * 0.292, 0, 0, 0.056, 0.428, 0.03); // side bars

  // flared inner bevel, panelPurple
  const th = Math.atan2(0.014, 0.027);
  const bevL = Math.hypot(0.014, 0.027);
  {
    const top = new THREE.BoxGeometry(0.53, 0.004, bevL);
    top.rotateX(-th);
    add(putF(S, top, 0, 0.207, 0.0015), P.panelPurple);
    const bot = new THREE.BoxGeometry(0.53, 0.004, bevL);
    bot.rotateX(th);
    add(putF(S, bot, 0, -0.207, 0.0015), P.panelPurple);
    for (const s of [1, -1]) {
      const sd = new THREE.BoxGeometry(0.004, 0.41, bevL);
      sd.rotateY(s * th);
      add(putF(S, sd, s * 0.257, 0, 0.0015), P.panelPurple);
    }
  }
  // glowing inner pink trim around the glass
  box(S, P.neonPink, 0, 0.198, -0.005, 0.508, 0.004, 0.014, 1.5);
  box(S, P.neonPink, 0, -0.198, -0.005, 0.508, 0.004, 0.014, 1.5);
  for (const s of [1, -1]) box(S, P.neonPink, s * 0.248, 0, -0.005, 0.004, 0.4, 0.014, 1.5);

  // corner screws
  for (const s of [1, -1])
    for (const v of [0.2434, -0.2484]) {
      cylF(S, P.steel, s * 0.292, v, 0.017, 0.0075, 0.004);
      box(S, P.rubber, s * 0.292, v, 0.0192, 0.011, 0.002, 0.001, 0, 0.6 * s);
    }
  // bezel dressing: glowing outer pinstripes, cyan nameplate on the lower bar, violet strip on the top bar
  for (const s of [1, -1]) box(S, P.neonPink, s * 0.311, 0, 0.0155, 0.004, 0.54, 0.002, 1.5);
  text(S, P.neonCyan, "NEON RUNNER", -0.065, -0.2554, 0.002, 0.0153, 1);
  for (const s of [1, -1]) rod(S, P.neonPink, s * 0.08, -0.2484, s * 0.2, -0.2484, 0.0025, 0.0152, 1.2);
  box(S, P.neonViolet, 0, 0.2434, 0.0155, 0.3, 0.003, 0.002, 1.2);

  // =================================================================== (2) GLASS + SCENE
  box(S, P.screenGlass, 0, 0, -0.012, 0.51, 0.41, 0.008);
  const Lz = (k: number) => -0.0075 + 0.0012 * k;
  const SW = 0.492;
  const SH = 0.392;
  const vh = -0.02; // horizon
  const vb = -0.196; // bottom of scene
  const D = vh - vb;
  const GS = 1; // screen glow strength

  quad(S, P.screenSky, 0, 0, Lz(0), SW, SH, GS);
  // sky bands (bottom -> top): glow, orchid, violet, dusk, sky
  const bandCols = [P.screenGlow, ORCHID, P.neonViolet, DUSK, P.screenSky];
  const bandH = (0.196 - vh) / 5;
  bandCols.forEach((c, i) => quad(S, c, 0, vh + bandH * (i + 0.5), Lz(1), SW, bandH, GS));

  // stars
  {
    const r = rng(7);
    for (let i = 0; i < 16; i++) {
      const u = (r() - 0.5) * 0.46;
      const v = 0.02 + r() * 0.13;
      if (Math.abs(u) < 0.12 && v < 0.098) continue;
      if (u < -0.17 && v > 0.12) continue;
      quad(S, i % 2 ? P.neonCyan : P.white, u, v, Lz(2), 0.003, 0.003, GS);
    }
  }

  // sun
  sun(S, 0, vh, 0.105, Lz(2), GS);

  // mountains: mid layer behind, dark layer in front, cyan ridge highlights
  const mid: [number, number, number][] = [[-0.17, 0.07, 0.07], [-0.07, 0.095, 0.06], [0.11, 0.082, 0.075], [0.2, 0.06, 0.045]];
  mid.forEach(([u, h, hw]) => poly(S, P.mountainMid, [[u - hw, vh], [u + hw, vh], [u, vh + h]], Lz(3), GS));
  const dark: [number, number, number][] = [[-0.21, 0.045, 0.035], [-0.12, 0.06, 0.05], [0.03, 0.035, 0.04], [0.15, 0.055, 0.05], [0.22, 0.04, 0.025]];
  dark.forEach(([u, h, hw]) => {
    poly(S, P.mountainDark, [[u - hw, vh], [u + hw, vh], [u, vh + h]], Lz(4), GS);
    rod(S, P.neonCyan, u, vh + h, u - hw * 0.45, vh + h * 0.55, 0.002, Lz(5), GS);
  });

  // ground + perspective grid
  quad(S, K, 0, (vh + vb) / 2, Lz(5), SW, D, GS);
  gridLines(S, 0, vh, D, 0.246, Lz(6), 0.0018, [0.05, 0.11, 0.19, 0.3, 0.46, 0.67, 0.92], [0, 0.08, -0.08, 0.16, -0.16, 0.26, -0.26, 0.4, -0.4, 0.6, -0.6, 0.9, -0.9]);
  // road
  const hwB = 0.15;
  const hwT = 0.008;
  poly(S, P.deepIndigo, [[-hwB, vb], [hwB, vb], [hwT, vh], [-hwT, vh]], Lz(7), GS);
  for (const s of [1, -1]) rod(S, P.neonCyan, s * hwB, vb, s * hwT, vh, 0.004, Lz(8), GS);
  const da = [0.04, 0.14, 0.28, 0.5, 0.8];
  const db = [0.09, 0.2, 0.37, 0.62, 0.97];
  da.forEach((a, i) => {
    const bb = db[i];
    const wa = 0.0015 + 0.011 * a;
    const wb = 0.0015 + 0.011 * bb;
    poly(S, P.white, [[-wa, vh - D * a], [wa, vh - D * a], [wb, vh - D * bb], [-wb, vh - D * bb]], Lz(8), GS);
  });

  // retro car seen from behind
  quad(S, P.neonCyan, 0, -0.194, Lz(9), 0.07, 0.003, GS);
  quad(S, P.neonPink, 0, -0.1785, Lz(9), 0.066, 0.02, GS);
  poly(S, P.neonPink, [[-0.022, -0.1685], [0.022, -0.1685], [0.016, -0.15], [-0.016, -0.15]], Lz(9), GS);
  poly(S, K, [[-0.0185, -0.1665], [0.0185, -0.1665], [0.0138, -0.1525], [-0.0138, -0.1525]], Lz(10), GS);
  quad(S, P.neonPink, 0, -0.1455, Lz(10), 0.07, 0.004, GS);
  for (const s of [1, -1]) {
    quad(S, P.rubber, s * 0.032, -0.188, Lz(10), 0.01, 0.014);
    quad(S, P.buttonRed, s * 0.026, -0.1765, Lz(10), 0.014, 0.006, GS);
  }
  quad(S, P.white, 0, -0.1825, Lz(10), 0.012, 0.005, GS);
  quad(S, P.rubber, 0, -0.1895, Lz(10), 0.066, 0.003);

  // score / hi-score text
  text(S, P.white, "SCORE 009900", -0.238, 0.165, 0.003, Lz(2), GS);
  text(S, P.white, "HI 099999", 0.079, 0.165, 0.003, Lz(2), GS);
  // lives: three tiny cars
  for (let i = 0; i < 3; i++) {
    const uc = -0.228 + i * 0.026;
    quad(S, P.neonPink, uc, 0.135, Lz(4), 0.02, 0.006, GS);
    poly(S, P.neonPink, [[uc - 0.006, 0.138], [uc + 0.006, 0.138], [uc + 0.0045, 0.1445], [uc - 0.0045, 0.1445]], Lz(4), GS);
    for (const s of [1, -1]) quad(S, P.buttonRed, uc + s * 0.0075, 0.1355, Lz(5), 0.004, 0.003, GS);
  }

  // =================================================================== (3) CRT HOOD (behind the glass)
  {
    const hood = new THREE.BoxGeometry(0.6, 0.012, 0.234);
    hood.rotateX(-0.349);
    hood.translate(0, 1.56, 0.05);
    add(hood, K);
  }
  for (const s of [1, -1]) box(G, K, s * 0.255, 1.3, 0.05, 0.012, 0.36, 0.2);

  // =================================================================== (4) MARQUEE
  // frame (tucks between the side panels, front face at z = 0.21)
  box(MQ, K, 0, -0.115, 0.1975, 0.64, 0.03, 0.025); // bottom bar y 1.6-1.63
  box(MQ, K, 0, 0.11, 0.1975, 0.64, 0.02, 0.025); // top bar y 1.83-1.85
  for (const s of [1, -1]) box(MQ, K, s * 0.31, 0, 0.1975, 0.02, 0.2, 0.025);
  // lit title panel
  box(MQ, P.deepIndigo, 0, 0, 0.192, 0.6, 0.2, 0.004);
  const pbands = [P.neonPink, ORCHID, P.neonViolet, PERIWINKLE, P.neonCyan];
  pbands.forEach((c, i) => quad(MQ, c, 0, 0.094 - 0.0376 * (i + 0.5), 0.1955, 0.588, 0.0376, 1.2));
  // lettering: indigo outline, cyan shadow, white face
  const cell = 0.006;
  const tu0 = -(65 * cell) / 2;
  const tv0 = -0.021;
  text(MQ, P.deepIndigo, "NEON RUNNER", tu0 - 0.0045, tv0 - 0.0045, cell, 0.1975);
  text(MQ, P.neonCyan, "NEON RUNNER", tu0 - 0.003, tv0 - 0.003, cell, 0.2005, 1.2);
  text(MQ, P.white, "NEON RUNNER", tu0, tv0, cell, 0.2055, 1.2, true, 0.004);
  star4(MQ, P.white, 0.17, 0.045, 0.2008, 0.014, 1.2);
  star4(MQ, P.white, -0.13, -0.05, 0.2008, 0.011, 1.2);
  // sun-and-grid emblems either side of the title
  for (const s of [1, -1]) {
    const uc = s * 0.246;
    box(MQ, K, uc, 0, 0.1975, 0.075, 0.15, 0.002);
    sun(MQ, uc, 0.0, 0.03, 0.1995, 1.2);
    gridLines(MQ, uc, 0.0, 0.06, 0.035, 0.2, 0.0013, [0.12, 0.3, 0.55, 0.8, 1], [0, 0.02, -0.02, 0.045, -0.045, 0.09, -0.09]);
    star4(MQ, P.neonCyan, uc, 0.06, 0.2, 0.012, 1.2);
  }
  // glowing pink outline tubes around the panel window
  for (const y of [1.83, 1.63]) cyl(P.neonPink, 0, y, 0.2075, 0.003, 0.606, "x", 1.5);
  for (const s of [1, -1]) cyl(P.neonPink, s * 0.3, 1.73, 0.2075, 0.003, 0.2, "y", 1.5);
  for (const s of [1, -1])
    for (const y of [1.83, 1.63]) ball(P.neonPink, s * 0.3, y, 0.2075, 0.0045, 1.5);

  // =================================================================== (5) SPEAKER GRILLE BARS
  for (const s of [1, -1]) {
    box(MQ, P.rubber, s * 0.312, 0, 0.2125, 0.016, 0.15, 0.005);
    for (let i = 0; i < 6; i++) box(MQ, P.chrome, s * 0.312, -0.05 + i * 0.02, 0.2155, 0.01, 0.004, 0.002);
  }

  // =================================================================== emit
  for (const bk of buckets.values()) {
    const geo = mergeGeometries(bk.geos, false);
    if (!geo) continue;
    const part = b.part(geo, bk.color, { at: [0, 0, 0], flat: true });
    if (bk.g > 0) glow(part, bk.g);
  }
}
```