<!-- call: plan -->

```json
{
  "name": "Tulip Mill",
  "description": "A chunky Animal Crossing-style Dutch windmill standing on a round grass mound with a stepping-stone path, tulips, a gallery balcony, thatched cap and four lattice-and-canvas sails.",
  "builderName": "windmill",
  "size": [4.0, 5.5, 3.8],
  "layout": "Static architecture, +Y up, front +Z, x = 0 centred, z from -1.65 to +2.15. A stylized toy windmill ~5.5 m tall: fat rounded silhouettes, flat-shaded 10-segment facets on the round bodies, bold flat colours, warm glowing windows, zero grime.\n\nFront to back: a 3-stone stepping path (z 1.25/1.55/1.85) leads to a blue split Dutch door with cream frame on the tower front; a lantern hangs beside the door; one warm-glow window sits on the tower front at y 1.25 and two more on the tower sides. The round brick tower (y 0-2.2, r 0.98 at base with a bulging plinth y 0-0.06, r 0.90 at y 0.25, tapering to r 0.70 at y 2.2; r(y) = 0.90 - 0.205*(y-0.25)/1.95 between) rises through a grass mound (dome r 1.6, h 0.32). A wooden upper storey (y 2.18-3.0, r 0.72 to 0.62) is girdled by a narrow walkway: deck ring r 0.60-1.02 at y 2.52-2.60, 12 picket posts at r 0.94 (y 2.60-2.88), mid-rail y 2.66-2.69, top rail y 2.84-2.90, 8 brackets underneath, two flower boxes on the deck at (±0.566, y, 0.566), one small window on the front at (0, 2.80, 0.665). A squat thatched dome cap (y 3.0-3.82, r 0.70 bulging to 0.74 at y 3.12 then closing to 0.10 at y 3.78) wears 4 dark thatch bands, an eaves ring with a fringe of little cones, and a cream finial ball at (0, 4.0). A square wooden windshaft (0.14 across) runs from inside the dome front to an iron hub at [0, 3.6, 1.1]; four sail units sweep the vertical XY plane at z = 1.1 (canvas centred at z 1.18): whips 1.9 long along ±X and ±Y with crossbars at r 0.5, 1.0, 1.5 and canvas panels r 0.55-0.98 and 1.02-1.48; the bottom sail tip hovers at (0, 1.7, 1.1) just in front of the door lintel, the top tip reaches y 5.5, the side tips x ±1.9. A wooden tail pole runs from the cap rear (0, 3.45, -0.45) down to a short post standing on the mound at (0, ~0.1, -1.5), with 4 ladder rungs and a small wheel (r 0.17) at its lower end, behind the mill.\n\nAnimal Crossing tone on every part: brick tower in warm terracotta with cream mortar bands and quoins, cream trim, glowing amber window glass, golden thatch, bright grass with pink/yellow tulips, daisies and a bush. The mound, path, flowers and bushes are simpler than the windmill itself and sized to its footprint.",
  "palette": {
    "brick": "#b35c4a",
    "brickLight": "#cd8a6c",
    "mortar": "#e9d8b8",
    "wood": "#8a5a33",
    "woodDark": "#5f3d22",
    "trim": "#f7f0dd",
    "thatch": "#e0a83f",
    "thatchDark": "#b57f2b",
    "doorBlue": "#3f7fc0",
    "canvas": "#f4eddb",
    "iron": "#4c4650",
    "window": "#ffd98a",
    "grass": "#7ab55c",
    "grassDark": "#5f9448",
    "stone": "#c3bcab",
    "flowerPink": "#ee7fae",
    "flowerYellow": "#f6c344",
    "flowerWhite": "#fdfcf5",
    "leaf": "#4f9a4d",
    "soil": "#8a6a4a"
  },
  "mounts": {
    "moundSurround": [0, 0.3, 0],
    "moundFront": [0, 0.29, 1.0],
    "tailFoot": [0, 0.1, -1.5],
    "towerTop": [0, 2.2, 0],
    "galleryTop": [0, 3.0, 0],
    "shaftHub": [0, 3.6, 1.1]
  },
  "joints": [],
  "parts": [
    {
      "id": "tower",
      "builds": "The brick tower and its ground-level face. All pieces flat-shaded. MAIN TOWER: one lathe, 10 segments, colour brick, outline [[0,0],[0.98,0],[0.98,0.06],[0.90,0.25],[0.86,0.55],[0.76,1.4],[0.70,2.2],[0,2.2]] (closed top). MORTAR BANDS: 4 thin lathe rings (colour mortar, r = r(y)+0.012, height 0.035) at y 0.5, 0.95, 1.4, 1.85. CORNICE: one brickLight ring at y 2.05-2.12, r 0.745. QUOINS: 8 brickLight boxes 0.10x0.12x0.10 proud of the wall at the front-face edges (azimuth ±36 degrees), y 0.5, 0.95, 1.4, 1.85. DOOR (front, assembly plane z 0.92, proud of the curved wall): 2 jambs (trim, 0.09x1.32x0.09) at x ±0.35 spanning y 0.30-1.62; lintel (trim, 0.79x0.10x0.12) at (0, 1.67, 0.92); 2 split doorBlue panels (0.62x0.60x0.05) at y 0.32-0.92 and 0.96-1.56; a small round porthole in the top panel: glass disc (window, r 0.085) plus iron rim ring (torus r 0.10, tube 0.012) at (0, 1.26, 0.955); an iron latch (0.03x0.10x0.03) at (0.22, 0.85, 0.955) and 2 iron hinge straps (0.05x0.22x0.015) near the bottom panel edges at x ±0.20, y 0.44; stone threshold slab (0.78x0.06x0.30) at (0, 0.29, 0.88); stone step slab (0.92x0.08x0.36) at (0, 0.30, 1.12). WINDOWS: front window at (0, 1.25, 0.83) facing +Z: frame (trim, 0.36x0.44x0.06), glass (window, 0.26x0.34x0.02) in front, sill (trim, 0.44x0.05x0.10) below; two side windows at (±0.78, 1.5, 0) facing ±X: frame (trim, 0.34x0.40x0.06), glass (window, 0.24x0.30x0.02), sill (trim, 0.42x0.05x0.10). FLOWER BOX under the front window: woodDark box (0.44x0.13x0.15) at (0, 1.0, 0.85) with a thin soil top strip, 3 flowers (stem leaf r 0.01 h 0.09 + head flowerPink r 0.045, middle flowerYellow). LANTERN beside the door: iron bracket rod from the jamb outer face (0.40, 1.55, 0.92) to (0.52, 1.50, 0.92); iron body box (0.14x0.18x0.14) at (0.55, 1.40, 0.92) with a glowing glass (window, 0.10x0.14x0.10) inside and an iron pyramid cap (r 0.10, h 0.06) on top.",
      "box": [[-0.95, 0, -0.95], [0.95, 2.2, 1.2]],
      "attaches": "Stands on the floor at y 0 (lathe starts at y 0); its lower 0.25 m is surrounded by the grounds mound at moundSurround [0, 0.3, 0], and its stone threshold and step land on the mound at moundFront [0, 0.29, 1.0]. Its top ring at towerTop [0, 2.2, 0] (r 0.70) carries the gallery body.",
      "joints": [],
      "floor": true,
      "budget": 180
    },
    {
      "id": "gallery",
      "builds": "The wooden upper storey and the walkway balcony that girdles it. All pieces flat-shaded. BODY: one lathe, 10 segments, colour wood, outline [[0,2.18],[0.72,2.18],[0.70,2.45],[0.66,2.7],[0.62,3.0],[0,3.0]]. PLANK STRIPS: 8 thin vertical woodDark boxes (0.035x0.72x0.02) seated on the body surface at radius 0.70, evenly spaced azimuths, running y 2.25-2.97. FRONT WINDOW: at (0, 2.80, 0.66) facing +Z, framed by the top rail (window sits between the railing rings): frame (trim, 0.34x0.36x0.06), glass (window, 0.24x0.26x0.02) in front, sill (trim, 0.38x0.05x0.09) at (0, 2.60, 0.66). DECK: one lathe ring (wood, r 0.60-1.02, y 2.52-2.60). BRACKETS: 8 woodDark rods (r 0.035) from the body at (r 0.66, y 2.42) to the deck underside at (r 0.97, y 2.53), at 8 evenly spaced azimuths. RAILING: 12 woodDark posts (r 0.028, y 2.60-2.88) at radius 0.94; top rail lathe ring (wood, r 0.92-0.96, y 2.84-2.90); mid-rail lathe ring (woodDark, r 0.93-0.95, y 2.66-2.69). FLOWER BOXES: 2 woodDark boxes (0.38x0.14x0.14) sitting on the deck at (±0.566, 2.67, 0.566) with a thin soil top strip, each with 3 flowers (stem leaf r 0.01 h 0.10 + head r 0.05: two flowerPink, one flowerYellow).",
      "box": [[-1.1, 2.18, -1.1], [1.1, 3.0, 1.1]],
      "attaches": "Body sits on the tower top ring towerTop [0, 2.2, 0], its own base starting at y 2.18 to overlap the tower; its top at galleryTop [0, 3.0, 0] (r 0.62) carries the cap dome. Deck, brackets and railing are self-contained on this body.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cap",
      "builds": "The thatched cap dome, the windshaft, and the tail pole with its ground post. All pieces flat-shaded. DOME: one lathe, 10 segments, colour thatch, outline [[0,3.0],[0.70,3.0],[0.74,3.12],[0.68,3.3],[0.58,3.5],[0.42,3.66],[0.20,3.78],[0,3.82]]. EAVES RING: lathe ring (thatchDark, r 0.70-0.75, y 2.99-3.05) hugging the dome base. THATCH BANDS: 4 lathe rings (thatchDark, r = dome r(y)+0.015, height 0.05) at y 3.15, 3.32, 3.5, 3.66. EAVES FRINGE: 8 small thatchDark cones (r 0.05, h 0.12) tucked under the eaves ring pointing down-and-out at 8 evenly spaced azimuths. FINIAL: woodDark rod (r 0.03) from (0, 3.80) up to (0, 4.00) with a trim ball (r 0.065) at (0, 4.00). WINDSHAFT: woodDark box (0.14 x 0.14 cross-section) from (0, 3.62, 0.18) buried inside the dome, through its front face, to (0, 3.6, 1.12) at the hub mount; 2 iron bands (lathe rings around the shaft, r 0.105, height 0.05) at z 0.72 and 0.95. CAP WINDOW: small round window on the dome front at (0, 3.30, 0.64): iron rim ring (r 0.09, tube 0.014) plus glass disc (window, r 0.08) sitting proud of the dome surface. TAIL POLE: woodDark tapered rod (r 0.05 to 0.04) from (0, 3.45, -0.45) down to (0, 2.34, -1.48), resting on the post top; 4 wood rungs (0.26x0.03x0.03, running along X) across the pole at (0, 3.23, -0.66), (0, 2.95, -0.91), (0, 2.67, -1.17), (0, 2.43, -1.39). TAIL POST: wood box (0.13x2.17x0.13) from y 0.15 to 2.32 at (0, y, -1.5), with a stone base block (0.24x0.14x0.24) at (0, 0.12, -1.5). KRUIRAD WHEEL: one lathe (woodDark, r 0.17, thickness 0.05, axis along X) at the pole's lower end (0, 2.38, -1.44) with 4 small woodDark pegs (r 0.015, length 0.08) sticking radially out of the rim at 4 spots.",
      "box": [[-0.85, 3.0, -1.62], [0.85, 4.05, 1.2]],
      "attaches": "Dome base ring (r 0.70 at y 3.0) sits over the gallery top at galleryTop [0, 3.0, 0]. Windshaft juts forward to shaftHub [0, 3.6, 1.1] where the sails hub mounts. Tail post stands on the grounds mound at tailFoot [0, 0.1, -1.5]; the tail pole rests on its own post.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "sails",
      "builds": "The four sail units and the iron hub. All pieces flat-shaded, chunky. HUB: iron cylinder (axis z, r 0.11, h 0.2) at (0, 3.6, 1.1), an iron front disc (r 0.085, h 0.03) at z 1.21, and 4 small iron bolt spheres (r 0.024) at the 45-degree positions on the front disc. Write one sailUnit(d) function and call it for d = [1,0,0], [0,1,0], [-1,0,0], [0,-1,0] (sweeps the vertical XY plane at z = 1.1). Per sail: WHIP: a wood frustumBox from the hub centre (0, 3.6, 1.1) to hub + d*1.9, cross-section 0.09 (in-plane) x 0.12 (z) at the root tapering to 0.05 x 0.07 at the tip, its flat front facing +Z. CROSSBARS: 3 wood boxes centred at hub + d*r, perpendicular to d in the sail plane (for d = [1,0,0] the perp is [0,1,0], and so on), at r 0.5, 1.0, 1.5 with lengths 0.34, 0.56, 0.62 and cross-section 0.05x0.06. KNOBS: 3 woodDark spheres (r 0.03) on the crossbar ends. CANVAS PANELS: 2 thin extrudes (thickness 0.018) in the sail plane at z 1.18, colour canvas: panel A from r 0.55 to 0.98 (half-width 0.23 tapering to 0.29), panel B from r 1.02 to 1.48 (half-width 0.30 tapering to 0.34), each panel's outer edge drawn with 3 gentle scallops. TIES: 2 small iron spheres (r 0.022) at the mid of each panel's outer edge, on the canvas front face at z 1.19.",
      "box": [[-1.98, 1.65, 0.95], [1.98, 5.55, 1.25]],
      "attaches": "Hub mounts on the windshaft front at shaftHub [0, 3.6, 1.1]. The sail sweep plane z = 1.1 passes just outside the gallery balcony (r 1.02); the bottom sail tip hovers at (0, 1.7, 1.1) in front of the tower door, clear of it.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "grounds",
      "builds": "The grass mound and its dressing, kept simple and bright. All pieces flat-shaded. MOUND: one lathe dome, 12 segments, colour grass, outline [[0,0],[1.55,0],[1.58,0.06],[1.5,0.14],[1.3,0.22],[1.0,0.28],[0.6,0.31],[0,0.32]]. RIM: one lathe ring (grassDark, r 1.44-1.60, y 0-0.05) darkening the mound edge. PATH: 3 flattened stone cylinders (stone, r 0.24, 0.26, 0.23, h 0.07) at (0, 0.20, 1.25), (0, 0.08, 1.55), (0, 0.035, 1.85) following the mound down. TULIPS: 4 stems (leaf, r 0.014, h 0.24) at (0.85, 0.25, 0.50), (-0.80, 0.24, 0.70), (1.05, 0.24, 0.10), (-0.95, 0.25, -0.15), each topped with a lathe cup head (r 0.055, h 0.12): flowerPink on tulips 1 and 3, flowerYellow on 2 and 4. DAISIES: 3 at (-0.5, 0.26, 0.95), (0.55, 0.27, -0.55), (-0.9, 0.25, -0.4): each a leaf stem (h 0.16), a flowerWhite flattened head (r 0.045) and a tiny flowerYellow centre disc (r 0.02). BUSH: 3 leaf spheres (r 0.16, 0.12, 0.10) clustered at (-1.1, 0.21, 0.65). GRASS TUFTS: 5 small grassDark cones (r 0.055, h 0.14) scattered on the mound. PEBBLES: 2 small stone flattened spheres (r 0.06) near the path.",
      "box": [[-1.65, 0, -1.65], [1.65, 0.62, 2.15]],
      "attaches": "Mound dome surrounds the tower base at moundSurround [0, 0.3, 0] (the tower passes through its centre); its surface receives the tower's threshold and step at moundFront [0, 0.29, 1.0] and the cap's tail-post foot at tailFoot [0, 0.1, -1.5]. Rests on the floor at y 0.",
      "joints": [],
      "floor": true,
      "budget": 140
    }
  ]
}
```

<!-- call: grounds -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildGrounds({ b, P }: any) {
  const R = rng(11);
  const flat = { flat: true };

  // Mound dome (lathe, 12 segments)
  b.lathe(
    [[0, 0], [1.55, 0], [1.58, 0.06], [1.5, 0.14], [1.3, 0.22], [1.0, 0.28], [0.6, 0.31], [0, 0.32]],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 12, color: P.grass, name: "mound" },
  );
  // Darker rim ring
  b.lathe(
    [[1.44, 0], [1.6, 0], [1.6, 0.05], [1.44, 0.05]],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 12, color: P.grassDark, name: "moundRim" },
  );

  // Stepping stones
  const stones: [number, number, number, number][] = [
    [0, 0.2, 1.25, 0.24],
    [0, 0.08, 1.55, 0.26],
    [0, 0.035, 1.85, 0.23],
  ];
  for (const [x, y, z, r] of stones) {
    b.part(new THREE.CylinderGeometry(r, r * 1.06, 0.07, 10), P.stone, { at: [x, y, z], ...flat });
  }

  // Tulips
  const tulips: [number, number, number, string][] = [
    [0.85, 0.25, 0.5, P.flowerPink],
    [-0.8, 0.24, 0.7, P.flowerYellow],
    [1.05, 0.24, 0.1, P.flowerPink],
    [-0.95, 0.25, -0.15, P.flowerYellow],
  ];
  for (const [x, y, z, c] of tulips) {
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 6), P.leaf, { at: [x, y + 0.12, z], ...flat });
    // small leaf blade
    b.part(new THREE.ConeGeometry(0.03, 0.12, 4), P.leaf, {
      at: [x + 0.03, y + 0.06, z],
      rotation: [0, 0, -30],
      ...flat,
    });
    b.lathe(
      [[0, 0], [0.04, 0.01], [0.055, 0.05], [0.05, 0.1], [0.025, 0.12], [0, 0.1]],
      { at: [x, y + 0.23, z], axis: [0, 1, 0], segments: 7, color: c, name: "tulipHead" },
    );
  }

  // Daisies
  const daisies: [number, number, number][] = [
    [-0.5, 0.26, 0.95],
    [0.55, 0.27, -0.55],
    [-0.9, 0.25, -0.4],
  ];
  for (const [x, y, z] of daisies) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 6), P.leaf, { at: [x, y + 0.08, z], ...flat });
    b.part(new THREE.SphereGeometry(0.045, 8, 5), P.flowerWhite, {
      at: [x, y + 0.17, z],
      scale: [1, 0.4, 1],
      ...flat,
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8), P.flowerYellow, {
      at: [x, y + 0.19, z],
      ...flat,
    });
  }

  // Bush
  const bush: [number, number, number, number][] = [
    [-1.1, 0.32, 0.65, 0.16],
    [-0.97, 0.28, 0.75, 0.12],
    [-1.2, 0.27, 0.78, 0.1],
  ];
  for (const [x, y, z, r] of bush) {
    b.part(new THREE.SphereGeometry(r, 8, 6), P.leaf, { at: [x, y, z], ...flat });
  }

  // Grass tufts
  const tufts: [number, number][] = [
    [1.1, 0.5],
    [0.7, -0.9],
    [-0.6, -1.0],
    [-1.2, -0.1],
    [0.3, 1.1],
  ];
  for (const [x, z] of tufts) {
    const y = 0.26 + R() * 0.01;
    b.part(new THREE.ConeGeometry(0.055, 0.14, 5), P.grassDark, { at: [x, y + 0.06, z], ...flat });
  }

  // Pebbles
  for (const [x, y, z] of [[0.38, 0.1, 1.5], [-0.4, 0.05, 1.8]] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.06, 7, 5), P.stone, { at: [x, y, z], scale: [1.2, 0.55, 1], ...flat });
  }
}
```

<!-- call: cap -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCap({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const dome = [
    [0, 3.0], [0.70, 3.0], [0.74, 3.12], [0.68, 3.3], [0.58, 3.5], [0.42, 3.66], [0.20, 3.78], [0, 3.82],
  ] as [number, number][];
  const domeR = (y: number) => {
    for (let i = 0; i < dome.length - 1; i++) {
      const [r0, y0] = [dome[i][0], dome[i][1]];
      const [r1, y1] = [dome[i + 1][0], dome[i + 1][1]];
      if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
    }
    return 0.1;
  };
  const ringOutline = (r0: number, r1: number, y0: number, y1: number): [number, number][] => [
    [r0, y0], [r1, y0], [r1, y1], [r0, y1],
  ];

  // dome
  b.lathe(dome, { at: [0, 0, 0], segments: 10, color: P.thatch, name: "capDome" });
  // eaves ring
  b.lathe(ringOutline(0.70, 0.75, 2.99, 3.05), { at: [0, 0, 0], segments: 10, color: P.thatchDark, name: "capEaves" });
  // thatch bands
  for (const y of [3.15, 3.32, 3.5, 3.66]) {
    const r = domeR(y) + 0.015;
    b.lathe(ringOutline(Math.max(0.01, r - 0.03), r, y - 0.025, y + 0.025), {
      at: [0, 0, 0], segments: 10, color: P.thatchDark, name: "capBand",
    });
  }
  // eaves fringe
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * 0.72;
    const z = Math.cos(a) * 0.72;
    b.part(new THREE.ConeGeometry(0.05, 0.12, 6), P.thatchDark, {
      at: [x, 2.96, z],
      dir: [Math.sin(a) * 0.5, -1, Math.cos(a) * 0.5],
      flat: true,
    });
  }
  // finial
  b.rod([0, 3.8, 0], [0, 4.0, 0], 0.03, P.woodDark);
  b.part(new THREE.SphereGeometry(0.065, 8, 6), P.trim, { at: [0, 4.0, 0], flat: true });

  // windshaft
  b.part(new THREE.BoxGeometry(0.14, 0.14, 0.94), P.woodDark, { at: [0, 3.61, 0.65], flat: true });
  for (const z of [0.72, 0.95]) {
    b.lathe(ringOutline(0.07, 0.105, -0.025, 0.025), {
      at: [0, 3.6, z], axis: [0, 0, 1], segments: 8, color: P.iron, name: "capBand",
    });
  }

  // cap window
  const wz = 0.64;
  b.part(new THREE.TorusGeometry(0.09, 0.014, 5, 12), P.iron, { at: [0, 3.3, wz], dir: [0, 0, 1], axis: "z", flat: true });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), P.window, {
    at: [0, 3.3, wz - 0.005], dir: [0, 0, 1], flat: true,
  });

  // tail pole
  b.rod([0, 3.45, -0.45], [0, 2.34, -1.48], [0.05, 0.04], P.woodDark, { sides: 6 });
  const rungs = [[3.23, -0.66], [2.95, -0.91], [2.67, -1.17], [2.43, -1.39]];
  for (const [y, z] of rungs) {
    b.part(new THREE.BoxGeometry(0.26, 0.03, 0.03), P.wood, { at: [0, y + 0.015, z], flat: true });
  }

  // tail post
  b.part(new THREE.BoxGeometry(0.13, 2.17, 0.13), P.wood, { at: [0, 1.235, -1.5], flat: true });
  b.part(new THREE.BoxGeometry(0.24, 0.14, 0.24), P.stone, { at: [0, 0.12, -1.5], flat: true });

  // kruirad wheel (axis along X)
  b.lathe(
    [[0, -0.025], [0.17, -0.025], [0.17, 0.025], [0, 0.025]],
    { at: [0, 2.38, -1.44], axis: [1, 0, 0], segments: 10, color: P.woodDark, name: "capWheel" },
  );
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8), P.wood, { at: [0, 2.38, -1.44], dir: [1, 0, 0], flat: true });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const dy = Math.sin(a);
    const dz = Math.cos(a);
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 5), P.woodDark, {
      at: [0, 2.38 + dy * 0.2, -1.44 + dz * 0.2],
      dir: [0, dy, dz],
      flat: true,
    });
  }
}
```

<!-- call: sails -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSails({ b, J, P, M }: Ctx) {
  const HUB: [number, number, number] = [0, 3.6, 1.1];
  const flat = { flat: true } as const;
  const rand = rng(11);

  // Hub
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10), P.iron, {
    at: HUB, dir: [0, 0, 1], ...flat,
  });
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 10), P.iron, {
    at: [0, 3.6, 1.215], dir: [0, 0, 1], ...flat,
  });
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    b.part(new THREE.SphereGeometry(0.024, 6, 4), P.iron, {
      at: [Math.cos(a) * 0.055, 3.6 + Math.sin(a) * 0.055, 1.235], ...flat,
    });
  }

  const sailUnit = (d: [number, number, number]) => {
    const perp: [number, number, number] = [-d[1], d[0], 0];
    const pt = (r: number, w = 0, z = 0): [number, number, number] => [
      HUB[0] + d[0] * r + perp[0] * w,
      HUB[1] + d[1] * r + perp[1] * w,
      HUB[2] + z,
    ];
    const horizontal = d[0] !== 0;
    // Whip: box sections are [x-extent, z-extent] mapped via frustumBox; use a box that is wide in-plane
    b.frustumBox(pt(0), pt(1.9), horizontal ? [0.09, 0.12] : [0.09, 0.12], horizontal ? [0.05, 0.07] : [0.05, 0.07], {
      color: P.wood,
    });

    // Crossbars
    const bars: [number, number][] = [[0.5, 0.34], [1.0, 0.56], [1.5, 0.62]];
    for (const [r, len] of bars) {
      const sx = horizontal ? 0.05 : len;
      const sy = horizontal ? len : 0.05;
      b.part(new THREE.BoxGeometry(sx, sy, 0.06), P.wood, { at: pt(r, 0, 0.0), ...flat });
      for (const s of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.03, 6, 4), P.woodDark, {
          at: pt(r, s * len / 2, 0.0), ...flat,
        });
      }
    }

    // Canvas panels
    const panels: [number, number, number, number][] = [
      [0.55, 0.98, 0.23, 0.29],
      [1.02, 1.48, 0.30, 0.34],
    ];
    for (const [r0, r1, w0, w1] of panels) {
      const len = r1 - r0;
      const outline: [number, number][] = [[0, -w0], [len, -w1]];
      // scalloped outer edge (3 scallops), from -w1 to +w1
      const n = 3;
      for (let k = 0; k <= n * 4; k++) {
        const t = k / (n * 4);
        const wv = -w1 + 2 * w1 * t;
        const bulge = 0.025 * Math.abs(Math.sin(t * n * Math.PI));
        if (k === 0) outline[1] = [len - bulge, wv];
        else outline.push([len - bulge, wv]);
      }
      outline.push([0, w0]);
      // dedupe check: ensure outline has no repeated points
      const cleaned = outline.filter((p, i) => i === 0 || p[0] !== outline[i - 1][0] || p[1] !== outline[i - 1][1]);
      b.extrude(cleaned as any, {
        at: pt(r0, 0, 0.08),
        x: d,
        y: perp,
        thickness: 0.018,
        color: P.canvas,
      });
      // ties at the mid of the outer edge
      for (const s of [-1, 1]) {
        b.part(new THREE.SphereGeometry(0.022, 6, 4), P.iron, {
          at: pt(r1 - 0.02, s * w1 * 0.35, 0.09 + 0.02), ...flat,
        });
      }
      // small canvas seam stripe along the panel centre
      b.part(
        new THREE.BoxGeometry(horizontal ? len * 0.9 : 0.012, horizontal ? 0.012 : len * 0.9, 0.006),
        P.trim,
        { at: pt((r0 + r1) / 2, 0, 0.0 + 0.1), ...flat },
      );
    }
  };

  sailUnit([1, 0, 0]);
  sailUnit([0, 1, 0]);
  sailUnit([-1, 0, 0]);
  sailUnit([0, -1, 0]);
  void rand;
  void frame;
}
```

<!-- call: gallery -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildGallery({ b, J, P, M }: Ctx) {
  const N = 10;
  const flat = { flat: true };

  // BODY
  b.lathe(
    [[0, 2.18], [0.72, 2.18], [0.70, 2.45], [0.66, 2.7], [0.62, 3.0], [0, 3.0]],
    { at: [0, 0, 0], segments: N, color: P.wood, name: "galleryBody" },
  );

  // Body radius helper
  const bodyR = (y: number) => {
    if (y < 2.45) return 0.72 - 0.02 * ((y - 2.18) / 0.27);
    if (y < 2.7) return 0.70 - 0.04 * ((y - 2.45) / 0.25);
    return 0.66 - 0.04 * ((y - 2.7) / 0.3);
  };

  // PLANK STRIPS: 8 vertical dark strips, avoiding the front window (azimuth 0) via offset
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    const r = 0.68;
    b.part(new THREE.BoxGeometry(0.035, 0.72, 0.02), P.woodDark, {
      at: [Math.sin(a) * r, 2.61, Math.cos(a) * r],
      rotation: [0, (a * 180) / Math.PI, 0],
      flat: true,
      name: "galleryPlank",
    });
  }

  // FRONT WINDOW
  b.part(new THREE.BoxGeometry(0.34, 0.36, 0.06), P.trim, { at: [0, 2.8, 0.66], flat: true, name: "galleryWinFrame" });
  b.part(new THREE.BoxGeometry(0.24, 0.26, 0.02), P.window, { at: [0, 2.8, 0.7], flat: true, name: "galleryWinGlass" });
  b.part(new THREE.BoxGeometry(0.02, 0.26, 0.022), P.trim, { at: [0, 2.8, 0.705], flat: true, name: "galleryWinBarV" });
  b.part(new THREE.BoxGeometry(0.24, 0.02, 0.022), P.trim, { at: [0, 2.8, 0.705], flat: true, name: "galleryWinBarH" });
  b.part(new THREE.BoxGeometry(0.38, 0.05, 0.09), P.trim, { at: [0, 2.6, 0.68], flat: true, name: "galleryWinSill" });

  // DECK
  b.lathe(
    [[0.6, 2.52], [1.02, 2.52], [1.02, 2.6], [0.6, 2.6]],
    { at: [0, 0, 0], segments: 12, color: P.wood, name: "galleryDeck" },
  );

  // BRACKETS
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const s = Math.sin(a), c = Math.cos(a);
    b.rod([s * 0.66, 2.42, c * 0.66], [s * 0.97, 2.53, c * 0.97], 0.035, P.woodDark, {
      caps: "flat",
      sides: 6,
      name: "galleryBracket",
    });
  }

  // RAILING POSTS
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.28, 6), P.woodDark, {
      at: [Math.sin(a) * 0.94, 2.74, Math.cos(a) * 0.94],
      flat: true,
      name: "galleryPost",
    });
  }
  // Top rail and mid-rail
  b.lathe([[0.92, 2.84], [0.96, 2.84], [0.96, 2.9], [0.92, 2.9]], {
    at: [0, 0, 0], segments: 24, color: P.wood, name: "galleryTopRail",
  });
  b.lathe([[0.93, 2.66], [0.95, 2.66], [0.95, 2.69], [0.93, 2.69]], {
    at: [0, 0, 0], segments: 24, color: P.woodDark, name: "galleryMidRail",
  });

  // FLOWER BOXES
  for (const s of [1, -1]) {
    const x = s * 0.566, z = 0.566;
    const rotY = s * 45;
    b.part(new THREE.BoxGeometry(0.38, 0.14, 0.14), P.woodDark, {
      at: [x, 2.67, z], rotation: [0, rotY, 0], flat: true, name: "galleryBox",
    });
    b.part(new THREE.BoxGeometry(0.34, 0.015, 0.1), P.soil, {
      at: [x, 2.745, z], rotation: [0, rotY, 0], flat: true, name: "gallerySoil",
    });
    // local offsets along box length
    const dirX = Math.cos((rotY * Math.PI) / 180);
    const dirZ = -Math.sin((rotY * Math.PI) / 180);
    const cols = [P.flowerPink, P.flowerYellow, P.flowerPink];
    for (let k = 0; k < 3; k++) {
      const o = (k - 1) * 0.11;
      const fx = x + dirX * o, fz = z + dirZ * o;
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 5), P.leaf, {
        at: [fx, 2.8, fz], flat: true, name: "galleryStem",
      });
      b.part(new THREE.SphereGeometry(0.05, 6, 5), cols[k], {
        at: [fx, 2.88, fz], flat: true, name: "galleryBloom",
      });
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.flowerWhite, {
        at: [fx, 2.915, fz], flat: true, name: "galleryBloomCore",
      });
    }
  }
}
```

<!-- call: tower -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTower({ b, J, P, M }: Ctx) {
  const rr = (y: number) => {
    const pts: [number, number][] = [[0.25, 0.9], [0.55, 0.86], [1.4, 0.76], [2.2, 0.7]];
    if (y <= 0.25) return 0.9;
    for (let i = 0; i < pts.length - 1; i++) {
      const [y0, r0] = pts[i], [y1, r1] = pts[i + 1];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.7;
  };
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], flat: true });
  const ball = (r: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z], flat: true });

  // main tower
  b.lathe(
    [[0, 0], [0.98, 0], [0.98, 0.06], [0.9, 0.25], [0.86, 0.55], [0.76, 1.4], [0.7, 2.2], [0, 2.2]],
    { at: [0, 0, 0], segments: 10, color: P.brick },
  );
  // mortar bands
  for (const y of [0.5, 0.95, 1.4, 1.85]) {
    const r = rr(y) + 0.012;
    b.lathe([[r - 0.02, y - 0.0175], [r, y - 0.0175], [r, y + 0.0175], [r - 0.02, y + 0.0175]], {
      at: [0, 0, 0], segments: 10, color: P.mortar,
    });
  }
  // cornice
  b.lathe([[0.6, 2.05], [0.745, 2.05], [0.745, 2.12], [0.6, 2.12]], { at: [0, 0, 0], segments: 10, color: P.brickLight });
  // quoins
  for (const s of [1, -1])
    for (const y of [0.5, 0.95, 1.4, 1.85]) {
      const a = (s * 36 * Math.PI) / 180;
      const r = rr(y) + 0.01;
      b.part(new THREE.BoxGeometry(0.1, 0.12, 0.1), P.brickLight, {
        at: [Math.sin(a) * r, y, Math.cos(a) * r],
        rotation: [0, (s * 36), 0],
        flat: true,
      });
    }

  // door
  for (const s of [1, -1]) box(0.09, 1.32, 0.09, P.trim, s * 0.35, 0.96, 0.92);
  box(0.79, 0.1, 0.12, P.trim, 0, 1.67, 0.92);
  box(0.62, 0.6, 0.05, P.doorBlue, 0, 0.62, 0.92);
  box(0.62, 0.6, 0.05, P.doorBlue, 0, 1.26, 0.92);
  box(0.62, 0.02, 0.055, P.trim, 0, 0.94, 0.925);
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 12), P.window, {
    at: [0, 1.26, 0.955], dir: [0, 0, 1], flat: true,
  });
  b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 12), P.iron, { at: [0, 1.26, 0.955], flat: true });
  box(0.03, 0.1, 0.03, P.iron, 0.22, 0.85, 0.955);
  for (const s of [1, -1]) box(0.05, 0.22, 0.015, P.iron, s * 0.2, 0.44, 0.95);
  box(0.78, 0.06, 0.3, P.stone, 0, 0.29, 0.88);
  box(0.92, 0.08, 0.36, P.stone, 0, 0.3, 1.12);

  // windows
  box(0.36, 0.44, 0.06, P.trim, 0, 1.25, 0.83);
  box(0.26, 0.34, 0.02, P.window, 0, 1.25, 0.865);
  box(0.44, 0.05, 0.1, P.trim, 0, 1.0, 0.85);
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.34, P.trim, s * 0.78, 1.5, 0);
    box(0.02, 0.3, 0.24, P.window, s * 0.81, 1.5, 0);
    box(0.1, 0.05, 0.42, P.trim, s * 0.78, 1.27, 0);
  }
  // flower box
  box(0.44, 0.13, 0.15, P.woodDark, 0, 0.9, 0.87);
  box(0.4, 0.02, 0.11, P.soil, 0, 0.97, 0.87);
  for (const x of [-0.14, 0, 0.14]) {
    cyl(0.01, 0.01, 0.09, 5, P.leaf, x, 1.02, 0.87);
    ball(0.045, P.flowerPink, x, 1.1, 0.87);
    ball(0.02, P.flowerYellow, x, 1.1, 0.9);
  }
  // lantern
  b.rod([0.4, 1.55, 0.92], [0.52, 1.5, 0.92], 0.012, P.iron);
  box(0.14, 0.18, 0.14, P.iron, 0.55, 1.4, 0.92);
  box(0.1, 0.14, 0.15, P.window, 0.55, 1.4, 0.92);
  box(0.15, 0.1, 0.1, P.window, 0.55, 1.4, 0.92);
  b.part(new THREE.ConeGeometry(0.1, 0.06, 4), P.iron, { at: [0.55, 1.52, 0.92], rotation: [0, 45, 0], flat: true });
}
```