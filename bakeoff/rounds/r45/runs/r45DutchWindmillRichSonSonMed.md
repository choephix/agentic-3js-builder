<!-- call: plan -->

```json
{
  "name": "Dutch Windmill",
  "description": "A chunky, cheerful Animal Crossing-style Dutch tower windmill with a red-brick octagonal tower, a teal cap roof, a wraparound gallery, a tail pole and four cream-cloth lattice sails.",
  "builderName": "dutchWindmill",
  "size": [5.4, 8.5, 6.6],
  "layout": "Toy-like and chunky. Sides are 8-sided (octagonal), edges are beveled, and nothing is thinner than about 0.05 m. Palette is warm and pastel. Everything is centred on x=0 and the front is +Z.\n\nFrom the bottom up: a stone plinth (r 2.1, y 0-0.5), then a tapering octagonal brick tower (r 1.9 at y 0.4 to r 1.3 at y 5.0). The lower tower is brick red. Above the gallery the tower turns cream plaster, with a wavy brick/plaster boundary at about y 3.1. A wooden gallery deck (r 2.6, y 1.0-1.2) rings the tower with a railing (top y 1.9). Three wooden steps lead down the front, from z 2.6 to z 3.2. The arched green door is on the front of the tower at deck level, y 1.2-2.5. Small round-topped windows with white frames and flower boxes sit at y 2.9 and y 4.1 on four faces.\n\nOn top is a teal cap roof. It is a short drum (r 1.5, y 5.0-5.5) with a dome above it up to y 6.9, plus a finial/weather vane to 7.4. The cap's front is slightly bulged and has a shaft opening. A long sloping wooden tail pole runs from the back of the cap (y 5.2, z -1.4) down to a small post and wheel at y 0.45, z -3.3, with a ladder rail and a rope loop.\n\nThe sail shaft exits the cap at [0, 5.7, 1.2]. A round hub/spinner cap (r 0.3) sits at z 1.75. Four sail arms (stocks) of length 3.8 m radiate from the hub, rotated to a rest pose of 45 degrees (an X shape, never straight up/down). Each arm carries a cream cloth lattice panel (0.9 wide, 2.8 long, starting 0.9 from the hub on the trailing edge) framed in wood with cross-bars and a golden trim strip. The sail plane is at z 1.95.\n\nSmall props (flour sacks, barrel, lantern, flower pots and tufts at the base) sit on the gallery and around the plinth. The whole model is made of flat-colour primitives. Style cues: puffy proportions, soft rounded tops on windows and door, warm light-coloured trim details, and small flowers and leaf tufts in clusters.",
  "palette": {
    "brickRed": "#c9674a",
    "brickDark": "#a94f3a",
    "brickLight": "#e08a68",
    "plaster": "#f5e6c8",
    "plasterShade": "#e6d0a8",
    "stone": "#b9b4a6",
    "stoneDark": "#8f8a7e",
    "woodWarm": "#b07a45",
    "woodDark": "#7d5230",
    "woodLight": "#d4a468",
    "roof": "#4f9a94",
    "roofDark": "#3b7a76",
    "roofLight": "#7cc0b4",
    "cloth": "#fff6e4",
    "trim": "#f2b84b",
    "door": "#5fa36b",
    "glass": "#9fd8e8",
    "glow": "#ffd77a",
    "iron": "#4a4550",
    "leaf": "#6ab04c",
    "leafDark": "#3f8a3e",
    "flowerPink": "#f58ab0",
    "flowerYellow": "#ffd84a",
    "sack": "#e8d6a8"
  },
  "mounts": {
    "plinthTop": [0, 0.5, 0],
    "towerBase": [0, 0.4, 0],
    "galleryDeck": [0, 1.2, 0],
    "galleryRadius": [2.6, 1.2, 0],
    "stairTop": [0, 1.2, 2.6],
    "stairBottom": [0, 0, 3.2],
    "doorFront": [0, 1.2, 1.85],
    "windowLow": [0, 2.9, 1.7],
    "windowHigh": [0, 4.1, 1.55],
    "towerTop": [0, 5.0, 0],
    "capBase": [0, 5.0, 0],
    "shaftExit": [0, 5.7, 1.2],
    "hub": [0, 5.7, 1.75],
    "tailPoleRoot": [0, 5.2, -1.4],
    "tailPoleEnd": [0, 0.45, -3.3]
  },
  "joints": [
    { "name": "mill", "at": [0, 0.5, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "cap", "parent": "mill", "at": [0, 5.0, 0], "dir": [0, 1, 0], "role": "hinge", "group": "cap" },
    { "name": "sailShaft", "parent": "cap", "at": [0, 5.7, 1.2], "dir": [0, 0, 1], "role": "hinge", "group": "sails" }
  ],
  "parts": [
    {
      "id": "base",
      "builds": "Stone plinth and wooden gallery. Octagonal lathe plinth (r 2.1 at bottom, r 1.95 at top, y 0-0.5, stone with a darker stoneDark skirt ring and a few stoneDark cobble blocks). Round gallery deck (r 2.6, y 1.0-1.2, woodWarm planks with woodDark plank seams as thin parts). Below the deck, eight corbel brackets/posts in woodDark going down into the tower wall, plus a ring beam. A railing around the deck: posts every 22.5 degrees (woodLight, 0.7 m tall, rounded caps), a top rail and a mid rail as swept loops (woodWarm), with the rail opened at the front for the stairs (width 1.2 around z+). Three chunky steps down the front, from stairTop to stairBottom: tops at y 0.8, 0.4 and 0.0 (woodLight with woodDark risers), with small side rails. A doormat strip in trim colour at the top step. Does NOT include the tower wall, door, props or plants.",
      "box": [[-2.65, 0, -2.65], [2.65, 1.95, 3.25]],
      "attaches": "Plinth top meets the tower at towerBase / plinthTop (r 1.9). The deck ring sits on galleryDeck and its inner edge tucks into the tower wall. Steps end at stairBottom on y=0. The props part sits on the deck.",
      "joints": ["mill"],
      "floor": true,
      "budget": 160
    },
    {
      "id": "tower",
      "builds": "The tapering octagonal tower, r 1.9 at y 0.4 to r 1.3 at y 5.0 (use a lathe with 8 segments, or a loft with {ngon:8} sections). Lower tower up to y ~3.1 is brickRed. Add brick details as small parts: horizontal brickDark mortar bands every 0.35 m, scattered brickLight and brickDark brick blocks seated on the faces, and a stone-coloured base skirt at the bottom. The upper tower, from a wavy boundary at about y 3.1 to y 5.0, is plaster, with plasterShade corner quoins/vertical ribs on the 8 edges and a plasterShade ring band at the top (y 4.85-5.0). A woodDark ring beam at y 3.1 hides the colour boundary. Front door at doorFront: an arch-topped door (door colour) 0.9 wide x 1.3 tall, with a woodDark frame, a stone step, a woodLight plank seam, a trim-coloured round handle, and a small round window above the door in glow. Windows: round-topped windows, glass colour with white-plaster frames and cross mullions, 4 at y 2.9 (on +Z, -Z, +X, -X faces, so the front window faces are offset from the door) and 4 at y 4.1. Small woodWarm shutters on both sides of each. Each window has a tiny window box (woodWarm) with leaf tufts and flowerPink/flowerYellow dots. Also a small trim-coloured plaque with the year/emblem above the door, as a flat disc with a darker cross. All details sit on the tower surface (use surface hits or compute radius at height).",
      "box": [[-1.95, 0.4, -1.95], [1.95, 5.05, 2.15]],
      "attaches": "Bottom is sunk into the plinth at towerBase. The gallery deck wraps around it at y 1.0-1.2. The cap sits on the towerTop (r 1.3, y 5.0). The door stands on galleryDeck at the front.",
      "joints": ["mill"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "cap",
      "builds": "The turning cap roof, riding joint 'cap'. A drum at capBase: octagonal, r 1.5, y 5.0-5.5, in roofDark, with a roofLight rim ring at the bottom. Above it a dome (lathe, 8-12 segments, roof colour) from r 1.5 at y 5.5 to a top at y 6.9, with roofLight shingle rows (thin tapered stripes or overlapping scale bands) and roofDark seam ribs running up the dome. The front of the cap bulges forward with a rounded woodDark bay around the shaft opening at shaftExit (a ring r 0.45, iron inside as a dark hole, plus a woodWarm bearing collar). A small round dormer window with a glow glass and a roofLight hood sits at the back-left and back-right. At the top of the dome is a woodDark post, a trim-coloured ball and a little weathervane (an iron arrow with a leaf-shaped tail in trim). Tail pole: a long woodWarm beam (r 0.09-0.12) from tailPoleRoot (y 5.2, z -1.4) sloping down to tailPoleEnd (y 0.45, z -3.3), with woodDark cross braces, a ladder-like rail of 5 rungs, an iron ring or rope loop of rope-coloured (use sack) swept loop, and at the bottom a woodLight post with a small woodDark wheel (cylinder r 0.25) and a stone anchor block. All of this is on joint 'cap'. Nothing on the cap hangs in front of the sail plane (z > 1.7).",
      "box": [[-1.55, 0.3, -3.4], [1.55, 7.45, 1.55]],
      "attaches": "Sits on top of the tower at capBase / towerTop (r 1.3, y 5.0), with its drum slightly overhanging the tower. The shaft opening is at shaftExit, where the sails part's shaft starts. The tail pole is rooted on the cap's back at tailPoleRoot and ends near the floor at tailPoleEnd.",
      "joints": ["cap"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "sails",
      "builds": "The sail assembly, riding joint 'sailShaft' (bone along +Z). A woodDark shaft (r 0.14) from shaftExit to the hub (z 1.2-1.8). A hub: woodWarm drum r 0.38 (z 1.65-1.95) with a trim ring, an iron bolt-ring, and a rounded roofLight spinner nose cone (r 0.3, tip to z 2.3). Four arms at rest rotation of 45, 135, 225 and 315 degrees about the z axis (an X shape; never straight up/down). Each arm is built in local coordinates: a woodWarm stock 0.14 thick x 3.8 long from the hub (radial distance 0.3 to 3.8) at plane z 1.95, with a rounded woodDark tip cap. Next to it, on the trailing side, is a lattice sail panel from 0.9 to 3.7 of radial length, 0.95 wide: a woodLight outer frame (0.06 bars), 4-5 woodDark cross-bars, plus a cream 'cloth' (cloth colour) filling 2-3 panes in a checker/triangular arrangement. Each frame has a trim-coloured strip along the outer edge and a small trim triangle/pennant at the tip. Add small iron brackets where each stock meets the hub. The sail plane sits between z 1.9 and 2.05 (lattice slightly in front of the stock, at z 2.0). Sail tips reach about 2.7 m from the hub in both x and y at 45 degrees (x within +-2.75, y 3.0-8.4). Keep all sail geometry within z 1.0-2.4.",
      "box": [[-2.8, 2.9, 1.0], [2.8, 8.5, 2.4]],
      "attaches": "The shaft begins inside the cap at shaftExit and the hub centres on hub (0, 5.7, 1.75). Nothing touches the tower or gallery. The cap's front bay surrounds the shaft.",
      "joints": ["sailShaft"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "props",
      "builds": "The cosy details on the gallery and around the base, all small and chunky and riding 'mill'. On the deck at the back-right and left: a stack of three flour sacks (sack colour, rounded boxes, with a woodDark tie and a trim stripe), a woodWarm barrel with woodDark hoops (iron hoops) and a woodLight lid, and a small woodWarm crate. A hanging lantern on an iron bracket by the door at doorFront +0.8 x (iron cage, glow centre, trim cap). Around the plinth: three flower beds as low stoneDark-edged lumps on the ground next to the plinth (not the stairs): each a leaf/leafDark mound with 6-10 tiny flowerPink and flowerYellow bud spheres and little petals, plus bushes (squashed leaf/leafDark spheres clustered) at 45 degrees and 225 degrees around the plinth, radius 2.3-2.6 from the centre. Two terracotta-coloured (brickLight) flower pots on the top step flanking the door, with leaf tufts and flowers. A little woodWarm sign post (signboard in woodLight with a trim-coloured wheat/sail emblem) at the left of the stairs at x 0.9-1.3 (use +X), z ~3.0. All pieces are sized to the gallery and plinth; avoid blocking the door (x -0.6..0.6 at z>1.85) and the stair centre.",
      "box": [[-3.0, 0, -2.7], [3.0, 2.1, 3.4]],
      "attaches": "Props stand on y=0 around the plinth (floor) and on galleryDeck (y 1.2) around the gallery edge, outside the door zone. The lantern bracket is fixed to the tower wall beside the door.",
      "joints": ["mill"],
      "floor": true,
      "budget": 120
    }
  ]
}
```

<!-- call: sails -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.sailShaft;
  const R = rng(11);
  const HUB = M.hub; // [0,5.7,1.75]
  const cx = HUB[0], cy = HUB[1];
  const Z = 1.95;

  // Place a box in sail-local coords (u along arm, v across arm), rotated about z by ang.
  const box = (ang: number, u: number, v: number, z: number, w: number, h: number, d: number, color: string) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    // arm direction (c,s) in xy; across direction (-s,c)
    const x = cx + u * c - v * s;
    const y = cy + u * s + v * c;
    const g = new THREE.BoxGeometry(w, h, d);
    return b.part(g, color, { bone, at: [x, y, z], rotation: [0, 0, (ang * 180) / Math.PI - 90] });
  };
  // w = across size, h = along size after the -90 rotation fix: we pass (across, along, thick)
  const bar = (ang: number, u: number, v: number, z: number, across: number, along: number, thick: number, color: string) =>
    box(ang, u, v, z, across, along, thick, color);

  // Shaft
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 10), P.woodDark, {
    bone, at: [cx, cy, 1.45], dir: [0, 0, 1],
  });
  // Hub drum
  b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12), P.woodWarm, { bone, at: [cx, cy, 1.8], dir: [0, 0, 1] });
  b.part(new THREE.TorusGeometry(0.38, 0.045, 6, 16), P.trim, { bone, at: [cx, cy, 1.7] });
  b.part(new THREE.TorusGeometry(0.3, 0.035, 6, 14), P.iron, { bone, at: [cx, cy, 1.96] });
  // Spinner nose
  b.part(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), P.roofLight, {
    bone, at: [cx, cy, 1.95], dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), P.trim, { bone, at: [cx, cy, 2.28] });
  // bolts on hub
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    b.part(new THREE.SphereGeometry(0.035, 5, 4), P.iron, {
      bone, at: [cx + Math.cos(a) * 0.3, cy + Math.sin(a) * 0.3, 1.99],
    });
  }

  for (let k = 0; k < 4; k++) {
    const ang = ((45 + 90 * k) * Math.PI) / 180;
    // Stock
    bar(ang, 2.05, 0, Z - 0.05, 0.14, 3.5, 0.12, P.woodWarm);
    // rounded tip cap
    const c = Math.cos(ang), s = Math.sin(ang);
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.woodDark, {
      bone, at: [cx + 3.82 * c, cy + 3.82 * s, Z - 0.05], scale: [1, 1, 0.8],
    });
    // Brackets at hub
    bar(ang, 0.55, 0, Z - 0.05, 0.26, 0.1, 0.2, P.iron);
    bar(ang, 0.85, 0, Z - 0.05, 0.24, 0.08, 0.18, P.iron);

    // Lattice panel on trailing side
    const vC = 0.62; // centre offset across
    const w = 0.95, u0 = 0.9, u1 = 3.7, len = u1 - u0, uc = (u0 + u1) / 2;
    const zl = 2.0;
    // cloth panes: 5 panes along length x 2 across, checker
    const rows = 5, cols = 2;
    const pl = (len - 0.12) / rows, pw = (w - 0.12) / cols;
    for (let r = 0; r < rows; r++)
      for (let q = 0; q < cols; q++) {
        if ((r + q) % 2 === 0 || r === rows - 1) {
          bar(ang, u0 + 0.06 + pl * (r + 0.5), vC - w / 2 + 0.06 + pw * (q + 0.5), zl - 0.02, pw - 0.02, pl - 0.02, 0.03, P.cloth);
        }
      }
    // outer frame
    bar(ang, uc, vC - w / 2 + 0.03, zl, 0.06, len, 0.08, P.woodLight);
    bar(ang, uc, vC + w / 2 - 0.03, zl, 0.06, len, 0.08, P.woodLight);
    bar(ang, u0 + 0.03, vC, zl, w, 0.06, 0.08, P.woodLight);
    bar(ang, u1 - 0.03, vC, zl, w, 0.06, 0.08, P.woodLight);
    // cross bars
    for (let r = 1; r < rows; r++) bar(ang, u0 + 0.06 + pl * r, vC, zl + 0.015, w - 0.1, 0.05, 0.07, P.woodDark);
    bar(ang, uc, vC, zl + 0.015, 0.05, len - 0.1, 0.07, P.woodDark);
    // trim strip along outer edge
    bar(ang, uc, vC + w / 2 + 0.03, zl + 0.01, 0.05, len, 0.09, P.trim);
    // pennant at tip
    const tipU = u1 + 0.02;
    const pen = new THREE.ConeGeometry(0.1, 0.3, 3);
    b.part(pen, P.trim, {
      bone,
      at: [cx + (tipU + 0.12) * c - vC * s, cy + (tipU + 0.12) * s + vC * c, zl],
      rotation: [0, 0, (ang * 180) / Math.PI - 90],
    });
    // stock-to-sail connectors
    for (const u of [1.3, 2.3, 3.3]) bar(ang, u, 0.3, zl - 0.03, 0.5, 0.07, 0.06, P.woodDark);
  }
  // small flourish: faint variation dots on hub rim
  void R; void frame;
}
```

<!-- call: cap -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCap({ b, J, P, M }: Ctx) {
  const bone = J.cap;
  const R = rng(11);
  const ROPE = P.sack;
  const part = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r0: number, r1: number, h: number, seg: number, color: string, at: number[], o: any = {}) =>
    part(new THREE.CylinderGeometry(r0, r1, h, seg), color, at, o);
  const sph = (r: number, color: string, at: number[], scale?: number[], o: any = {}) =>
    part(new THREE.SphereGeometry(r, 8, 6), color, at, { scale, ...o });
  const rod = (a: number[], c: number[], r: number, color: string) =>
    b.rod(a, c, r, color, { bone, sides: 6 } as any);

  // Drum
  cyl(1.5, 1.5, 0.5, 8, P.roofDark, [0, 5.25, 0], { rotation: [0, 22.5, 0] });
  cyl(1.56, 1.56, 0.1, 8, P.roofLight, [0, 5.05, 0], { rotation: [0, 22.5, 0] });
  cyl(1.54, 1.54, 0.06, 8, P.roofLight, [0, 5.5, 0], { rotation: [0, 22.5, 0] });

  // Dome
  b.lathe(
    [[0, 5.5], [1.5, 5.5], [1.45, 5.9], [1.2, 6.3], [0.8, 6.65], [0.35, 6.87], [0, 6.92]],
    { at: [0, 0, 0], bone, segments: 8, smoothing: 1, color: P.roof } as any,
  );
  // Shingle rows
  const rows = [[5.62, 1.49], [5.95, 1.43], [6.28, 1.2], [6.58, 0.86]];
  rows.forEach(([y, r], i) => {
    cyl(r * 1.03, r * 1.0, 0.07, 8, i % 2 ? P.roofLight : P.roofLight, [0, y, 0], { rotation: [0, 22.5, 0] });
  });
  // Seam ribs
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = (r: number, y: number) => [Math.sin(a) * r, y, Math.cos(a) * r];
    rod(p(1.5, 5.52), p(1.2, 6.32), 0.035, P.roofDark);
    rod(p(1.2, 6.32), p(0.5, 6.82), 0.03, P.roofDark);
  }

  // Front bay
  part(new THREE.SphereGeometry(0.8, 10, 8), P.woodDark, [0, 5.7, 0.85], { scale: [1, 0.95, 0.6] });
  part(new THREE.TorusGeometry(0.46, 0.09, 6, 12), P.woodWarm, [0, 5.7, 1.3]);
  cyl(0.4, 0.4, 0.06, 12, P.iron, [0, 5.7, 1.3], { rotation: [90, 0, 0] });
  cyl(0.5, 0.5, 0.08, 12, P.woodDark, [0, 5.7, 1.24], { rotation: [90, 0, 0] });
  for (const s of [1, -1]) box(0.12, 0.14, 0.12, P.woodWarm, [s * 0.5, 5.7, 1.35]);

  // Dormers
  for (const s of [1, -1]) {
    const a = Math.atan2(s * 0.9, -0.9);
    const dir = [Math.sin(a), 0, Math.cos(a)];
    const at = [dir[0] * 1.5, 5.25, dir[2] * 1.5];
    const rot = [0, (a * 180) / Math.PI, 0];
    cyl(0.22, 0.22, 0.12, 10, P.roofLight, at, { rotation: [90, 0, 0] });
    part(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 10), P.roofLight, [dir[0] * 1.45, 5.25, dir[2] * 1.45], {
      dir, axis: "y",
    });
    part(new THREE.CircleGeometry(0.17, 10), P.glow, [dir[0] * 1.58, 5.25, dir[2] * 1.58], { dir, axis: "z" });
    part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.roofLight, [
      dir[0] * 1.5, 5.4, dir[2] * 1.5,
    ], { scale: [1, 0.7, 1] });
  }

  // Finial
  cyl(0.06, 0.08, 0.5, 6, P.woodDark, [0, 7.1, 0]);
  sph(0.13, P.trim, [0, 7.38, 0]);
  rod([0, 7.2, 0], [0, 7.3, 0], 0.02, P.iron);
  box(0.6, 0.03, 0.03, P.iron, [0, 7.2, 0]);
  part(new THREE.ConeGeometry(0.07, 0.2, 4), P.iron, [0, 7.2, 0.4], { rotation: [90, 0, 0] });
  box(0.02, 0.2, 0.2, P.trim, [0, 7.2, -0.35]);

  // Tail pole
  const a = [0, 5.2, -1.4], e = [0, 0.45, -3.3];
  b.rod(a, e, [0.12, 0.09], P.woodWarm, { bone, sides: 8 } as any);
  const L = new THREE.Vector3(...e).sub(new THREE.Vector3(...a));
  const at = (t: number) => [0, a[1] + L.y * t, a[2] + L.z * t];
  // ladder rungs
  for (let i = 0; i < 5; i++) {
    const c = at(0.3 + i * 0.1);
    rod([-0.2, c[1], c[2]], [0.2, c[1], c[2]], 0.03, P.woodLight);
  }
  for (const s of [-0.2, 0.2]) {
    const p0 = at(0.27), p1 = at(0.73);
    rod([s, p0[1], p0[2]], [s, p1[1], p1[2]], 0.03, P.woodLight);
  }
  // braces
  const bs = [at(0.12), at(0.9)];
  rod([0, 5.0, -1.35], [0, 4.1, -1.9], 0.06, P.woodDark);
  rod([0, 4.1, -1.9], [0, 5.1, -2.3], 0.05, P.woodDark);
  rod([0, 3.2, -2.1], at(0.5), 0.05, P.woodDark);
  // rope loop
  const c = at(0.62);
  part(new THREE.TorusGeometry(0.2, 0.025, 6, 12), ROPE, [0, c[1] - 0.12, c[2]], { rotation: [0, 90, 0] });
  // post, wheel, anchor
  box(0.2, 0.9, 0.2, P.woodLight, [0, 0.45, -3.3]);
  cyl(0.25, 0.25, 0.1, 10, P.woodDark, [0.16, 0.3, -3.3], { rotation: [0, 0, 90] });
  cyl(0.06, 0.06, 0.14, 6, P.iron, [0.16, 0.3, -3.3], { rotation: [0, 0, 90] });
  box(0.5, 0.25, 0.5, P.stone, [0, 0.125, -3.0]);
  box(0.4, 0.06, 0.4, P.stoneDark, [0, 0.27, -3.0]);
}
```

<!-- call: base -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBase({ b, J, P, M }: any) {
  const bone = J.mill;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });

  // ---------- Plinth ----------
  b.lathe(
    [[0, 0], [2.1, 0], [2.1, 0.12], [2.0, 0.14], [1.95, 0.5], [0, 0.5]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stone },
  );
  b.lathe(
    [[0, 0], [2.16, 0], [2.16, 0.16], [2.08, 0.2], [0, 0.2]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stoneDark },
  );
  // cap ring on top of plinth
  b.lathe(
    [[1.7, 0.48], [2.0, 0.48], [2.0, 0.54], [1.7, 0.54]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stoneDark },
  );
  // cobble blocks
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.1;
    const r = 2.07 - (i % 2) * 0.04;
    const y = 0.28 + (i % 3) * 0.07;
    if (Math.abs(a - Math.PI / 2) < 0.5) continue;
    part(new THREE.BoxGeometry(0.28 + R() * 0.1, 0.12, 0.1), P.stoneDark,
      [Math.sin(a) * r, y, Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // ---------- Deck ----------
  b.lathe(
    [[0, 1.0], [2.6, 1.0], [2.6, 1.2], [0, 1.2]],
    { at: [0, 0, 0], bone, segments: 16, color: P.woodWarm },
  );
  // plank seams
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.42;
    const half = Math.sqrt(Math.max(0.1, 2.55 * 2.55 - x * x));
    part(new THREE.BoxGeometry(0.04, 0.02, half * 2 - 0.1), P.woodDark, [x, 1.2, 0]);
  }
  // deck rim ring
  b.sweep(
    (() => {
      const pts: number[][] = [];
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        pts.push([Math.sin(a) * 2.58, 1.1, Math.cos(a) * 2.58]);
      }
      return pts;
    })().length ? undefined : undefined as any,
    0.1,
  );
}
```

Correction: the last call above is invalid, so here is the complete, working version.

```ts
import * as THREE from "three";
import { rng, polyline } from "agentic-3js-builder";

export function buildBase({ b, J, P, M }: any) {
  const bone = J.mill;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, ...o });
  const circle = (r: number, y: number, n = 32, skip?: (a: number) => boolean) => {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.sin(a) * r, y, Math.cos(a) * r]);
    }
    return pts;
  };
  const DEG = 180 / Math.PI;

  // ---------- Plinth ----------
  b.lathe([[0, 0], [2.1, 0], [2.1, 0.12], [2.0, 0.14], [1.95, 0.5], [0, 0.5]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stone });
  b.lathe([[0, 0], [2.17, 0], [2.17, 0.16], [2.08, 0.2], [0, 0.2]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stoneDark });
  b.lathe([[1.7, 0.48], [2.0, 0.48], [2.0, 0.54], [1.7, 0.54]],
    { at: [0, 0, 0], bone, segments: 8, spin: 22.5, color: P.stoneDark });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.1;
    if (Math.abs(a - Math.PI / 2 * 0) < 0.35 || Math.abs(a - Math.PI * 2) < 0.35) continue; // keep stair front clear
    const r = 2.07;
    part(new THREE.BoxGeometry(0.3 + R() * 0.1, 0.12, 0.1), P.stoneDark,
      [Math.sin(a) * r, 0.28 + (i % 3) * 0.07, Math.cos(a) * r],
      { rotation: [0, a * DEG, 0] });
  }

  // ---------- Deck ----------
  b.lathe([[0, 1.0], [2.6, 1.0], [2.6, 1.2], [0, 1.2]],
    { at: [0, 0, 0], bone, segments: 16, color: P.woodWarm });
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.42;
    const half = Math.sqrt(Math.max(0.1, 2.55 * 2.55 - x * x));
    part(new THREE.BoxGeometry(0.04, 0.02, half * 2 - 0.15), P.woodDark, [x, 1.2, 0]);
  }
  b.sweep(polyline(circle(2.6, 1.1, 16), { closed: true }), 0.1,
    { bone, color: P.woodDark, sides: 6 });

  // ring beam below deck + corbels
  b.sweep(polyline(circle(1.95, 0.92, 16), { closed: true }), 0.08,
    { bone, color: P.woodDark, sides: 6 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const s = Math.sin(a), c = Math.cos(a);
    b.rod([s * 1.75, 0.65, c * 1.75], [s * 2.3, 1.0, c * 2.3], 0.09, P.woodDark, { bone, sides: 6 });
    part(new THREE.BoxGeometry(0.2, 0.14, 0.2), P.woodDark, [s * 2.25, 0.98, c * 2.25], { rotation: [0, a * DEG, 0] });
  }

  // ---------- Railing ----------
  const gap = 0.6; // half-width of opening at front
  const rr = 2.45;
  const arcPts = (y: number) => {
    const pts: number[][] = [];
    const n = 24;
    const start = Math.asin(gap / rr);
    const span = Math.PI * 2 - 2 * start;
    for (let i = 0; i <= n; i++) {
      const a = start + (i / n) * span;
      pts.push([Math.sin(a) * rr, y, Math.cos(a) * rr]);
    }
    return pts;
  };
  b.sweep(polyline(arcPts(1.9)), 0.055, { bone, color: P.woodWarm, sides: 6, caps: "round" });
  b.sweep(polyline(arcPts(1.55)), 0.04, { bone, color: P.woodWarm, sides: 6, caps: "round" });
  const startA = Math.asin(gap / rr);
  const postCount = 16;
  for (let i = 0; i < 16; i++) {
    const a = i * (Math.PI / 8);
    if (a < startA - 0.01 || a > Math.PI * 2 - startA + 0.01) continue;
    const x = Math.sin(a) * rr, z = Math.cos(a) * rr;
    b.rod([x, 1.2, z], [x, 1.85, z], 0.055, P.woodLight, { bone, sides: 6 });
    part(new THREE.SphereGeometry(0.085, 8, 6), P.woodLight, [x, 1.9, z]);
  }
  // end posts beside opening
  for (const s of [1, -1]) {
    const x = s * gap, z = Math.sqrt(rr * rr - gap * gap);
    b.rod([x, 1.2, z], [x, 1.88, z], 0.07, P.woodLight, { bone, sides: 6 });
    part(new THREE.SphereGeometry(0.1, 8, 6), P.woodLight, [x, 1.93, z]);
  }

  // ---------- Steps ----------
  const steps = [[0.8, 2.75, 0.5], [0.4, 3.0, 0.5], [0.0, 3.25, 0.5]];
  steps.forEach(([top, zc], i) => {
    const h = top === 0 ? 0.4 : top;
    const bottom = i === 2 ? 0 : 0;
    const height = i === 2 ? 0.4 : top + 0.0;
    const w = 1.5 + i * 0.1;
    const topY = i === 0 ? 0.8 : i === 1 ? 0.4 : 0.0;
    // chunky block: top at topY(+0.4 tread thickness offset so last step is flat at floor)
    const tread = 0.1;
    const yTop = topY + (i === 2 ? 0.1 : 0.0);
    part(new THREE.BoxGeometry(w, tread, 0.55), P.woodLight, [0, yTop - tread / 2 + (i === 2 ? 0 : 0), zc]);
    const riserH = Math.max(0.05, yTop - tread);
    part(new THREE.BoxGeometry(w - 0.05, riserH, 0.5), P.woodDark, [0, riserH / 2, zc - 0.02]);
  });
  // doormat
  part(new THREE.BoxGeometry(0.9, 0.03, 0.3), P.trim, [0, 1.215, 2.2]);
  part(new THREE.BoxGeometry(0.9, 0.032, 0.04), P.woodDark, [0, 1.216, 2.2]);
  // side rails on steps
  for (const s of [1, -1]) {
    const x = s * 0.82;
    b.rod([x, 1.65, 2.55], [x, 0.65, 3.4], 0.045, P.woodWarm, { bone, sides: 6 });
    for (const [y, z] of [[1.2, 2.6], [0.55, 3.25]] as number[][])
      b.rod([x, y, z], [x, y + (y > 1 ? 0.5 : 0.3) + 0.1, z], 0.05, P.woodLight, { bone, sides: 6 });
    part(new THREE.SphereGeometry(0.07, 8, 6), P.woodLight, [x, 1.72, 2.6]);
  }
}
```

<!-- call: props -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildProps({ b, J, P, M }: any) {
  const bone = J.mill;
  const R = rng(11);
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const box = (w: number, h: number, d: number, color: string, at: number[], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const ball = (r: number, color: string, at: number[], sc: number[] = [1, 1, 1]) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, { scale: sc });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], o: any = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);

  const DECK = M.galleryDeck[1];

  // ---------- flour sacks (back-right) ----------
  const sack = (x: number, y: number, z: number, rot: number) => {
    const r = { rotation: [0, rot, 0] };
    put(new THREE.SphereGeometry(0.3, 8, 6), P.sack, [x, y + 0.2, z], { scale: [1, 0.7, 0.75], ...r });
    cyl(0.1, 0.16, 0.12, 8, P.sack, [x, y + 0.4, z], r);
    cyl(0.115, 0.115, 0.04, 8, P.woodDark, [x, y + 0.36, z], r);
    box(0.5, 0.06, 0.02, P.trim, [x, y + 0.2, z], r).mesh.position.set(x, y + 0.2, z);
  };
  // trim stripe placed via rotation: put stripe on front of sack
  const sackStack = (cx: number, cz: number) => {
    sack(cx - 0.2, DECK, cz, 0.2);
    sack(cx + 0.3, DECK, cz + 0.05, -0.15);
    sack(cx + 0.05, DECK + 0.3, cz - 0.02, 0.4);
  };
  sackStack(-1.75, -1.35);

  // ---------- barrel (back-left, +x) ----------
  const bx = 1.7, bz = -1.5;
  cyl(0.34, 0.34, 0.7, 10, P.woodWarm, [bx, DECK + 0.35, bz]);
  ball(0.0, P.woodWarm, [bx, DECK, bz]);
  for (const hy of [0.15, 0.55]) cyl(0.355, 0.355, 0.06, 10, P.iron, [bx, DECK + hy, bz]);
  cyl(0.3, 0.3, 0.05, 10, P.woodLight, [bx, DECK + 0.72, bz]);
  box(0.14, 0.04, 0.04, P.woodDark, [bx, DECK + 0.76, bz]);

  // ---------- crate ----------
  const cx = 1.9, cz = -0.5;
  box(0.5, 0.45, 0.5, P.woodWarm, [cx, DECK + 0.225, cz], { rotation: [0, 0.3, 0] });
  for (const dx of [-0.23, 0.23])
    for (const dz of [-0.23, 0.23])
      box(0.06, 0.47, 0.06, P.woodDark, [cx + dx * Math.cos(0.3) + dz * Math.sin(0.3), DECK + 0.235, cz - dx * Math.sin(0.3) + dz * Math.cos(0.3)], { rotation: [0, 0.3, 0] });
  box(0.52, 0.04, 0.52, P.woodLight, [cx, DECK + 0.46, cz], { rotation: [0, 0.3, 0] });

  // ---------- lantern ----------
  const lx = M.doorFront[0] + 0.8, lz = 1.8;
  box(0.06, 0.06, 0.4, P.iron, [lx, DECK + 1.5, lz + 0.2]);
  box(0.06, 0.4, 0.06, P.iron, [lx, DECK + 1.35, lz + 0.05]);
  cyl(0.02, 0.02, 0.1, 6, P.iron, [lx, DECK + 1.3, lz + 0.4]);
  cyl(0.1, 0.12, 0.3, 6, P.glow, [lx, DECK + 1.1, lz + 0.4]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    box(0.025, 0.32, 0.025, P.iron, [lx + Math.sin(a) * 0.115, DECK + 1.1, lz + 0.4 + Math.cos(a) * 0.115]);
  }
  cyl(0.02, 0.15, 0.1, 6, P.trim, [lx, DECK + 1.3, lz + 0.4]).mesh.position.y += 0.1;
  cyl(0.12, 0.1, 0.04, 6, P.iron, [lx, DECK + 0.93, lz + 0.4]);

  // ---------- flowers / plants ----------
  const flower = (x: number, y: number, z: number, col: string) => {
    ball(0.045, P.flowerYellow, [x, y, z]);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ball(0.035, col, [x + Math.cos(a) * 0.06, y, z + Math.sin(a) * 0.06], [1, 0.6, 1]);
    }
  };
  const tuft = (x: number, y: number, z: number, s = 1) => {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.4;
      put(new THREE.ConeGeometry(0.05 * s, 0.22 * s, 4), i % 2 ? P.leafDark : P.leaf, [x + Math.cos(a) * 0.05 * s, y + 0.1 * s, z + Math.sin(a) * 0.05 * s], { rotation: [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5] });
    }
  };

  // pots flanking door on top step (y 0.8 top step area near z 2.6 -> deck 1.2)
  for (const s of [-1, 1]) {
    const px = s * 0.85, pz = 2.1;
    cyl(0.2, 0.14, 0.28, 8, P.brickLight, [px, DECK + 0.14, pz]);
    cyl(0.22, 0.22, 0.06, 8, P.brickLight, [px, DECK + 0.3, pz]);
    cyl(0.17, 0.17, 0.03, 8, P.woodDark, [px, DECK + 0.31, pz]);
    ball(0.17, P.leaf, [px, DECK + 0.4, pz], [1, 0.7, 1]);
    tuft(px, DECK + 0.4, pz, 1.2);
    flower(px - 0.08, DECK + 0.58, pz + 0.05, P.flowerPink);
    flower(px + 0.1, DECK + 0.52, pz - 0.05, s > 0 ? P.flowerPink : P.flowerYellow);
  }

  // flower beds
  const bed = (ang: number, rad: number, sx: number) => {
    const x = Math.sin(ang) * rad, z = Math.cos(ang) * rad;
    const rot = { rotation: [0, ang, 0] };
    box(0.9 * sx, 0.14, 0.4, P.stoneDark, [x, 0.07, z], rot);
    put(new THREE.SphereGeometry(0.4, 8, 6), P.leafDark, [x, 0.12, z], { scale: [1.1 * sx, 0.45, 0.5], ...rot });
    for (let i = 0; i < 8; i++) {
      const u = (i / 7 - 0.5) * 0.7 * sx;
      const ox = Math.cos(ang) * u + Math.sin(ang) * (R() - 0.5) * 0.2;
      const oz = -Math.sin(ang) * u + Math.cos(ang) * (R() - 0.5) * 0.2;
      ball(0.06, i % 2 ? P.flowerPink : P.flowerYellow, [x + ox, 0.3 + R() * 0.08, z + oz]);
      if (i % 2) tuft(x + ox * 0.9, 0.2, z + oz * 0.9, 0.7);
    }
  };
  bed((-35 * Math.PI) / 180, 2.45, 1);
  bed((50 * Math.PI) / 180, 2.5, 0.9);
  bed((Math.PI * 1.0), 2.45, 1.3);

  // bushes
  const bush = (deg: number, rad: number) => {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * rad, z = Math.cos(a) * rad;
    ball(0.42, P.leaf, [x, 0.3, z], [1, 0.8, 1]);
    ball(0.32, P.leafDark, [x + 0.3, 0.24, z - 0.15], [1, 0.8, 1]);
    ball(0.3, P.leaf, [x - 0.28, 0.22, z + 0.2], [1, 0.8, 1]);
    ball(0.25, P.leafDark, [x, 0.55, z], [1, 0.8, 1]);
    flower(x + 0.1, 0.72, z + 0.15, P.flowerPink);
    ball(0.05, P.flowerYellow, [x - 0.3, 0.45, z + 0.3]);
  };
  bush(135, 2.45); // front/back sign: angle from +Z toward +X
  bush(225, 2.5);
  bush(-60, 2.4);
  // keep within spec: 45deg & 225deg around plinth
  bush(100, 2.5);

  // ---------- sign post ----------
  const sx = 1.1, sz = 3.0;
  box(0.1, 1.3, 0.1, P.woodWarm, [sx, 0.65, sz]);
  box(0.8, 0.45, 0.07, P.woodDark, [sx, 1.1, sz]);
  box(0.72, 0.37, 0.05, P.woodLight, [sx, 1.1, sz + 0.03]);
  ball(0.0, P.trim, [sx, 1.1, sz]);
  // wheat emblem
  box(0.03, 0.26, 0.02, P.trim, [sx, 1.08, sz + 0.065]);
  for (let i = 0; i < 3; i++) {
    for (const s of [-1, 1]) {
      put(new THREE.SphereGeometry(0.035, 6, 4), P.trim, [sx + s * 0.05, 1.04 + i * 0.07, sz + 0.065], { scale: [0.7, 1.3, 0.5], rotation: [0, 0, -s * 0.5] });
    }
  }
  ball(0.04, P.trim, [sx, 1.24, sz + 0.065], [0.7, 1.3, 0.5]);
  cyl(0.07, 0.07, 0.06, 6, P.woodDark, [sx, 1.33, sz]);
  tuft(sx - 0.2, 0, sz + 0.1, 0.9);
  flower(sx + 0.22, 0.12, sz + 0.1, P.flowerPink);
  ball(0.12, P.stoneDark, [sx, 0.04, sz], [1.5, 0.4, 1.5]);
}
```

<!-- call: tower -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTower({ b, J, P }: Ctx) {
  const bone = J.mill;
  const DEG = Math.PI / 180;
  const SL = 0.6 / 4.6;
  const PHI = Math.atan(SL);
  const COS = Math.cos(22.5 * DEG);
  const rr = (y: number) => 1.9 - (y - 0.4) * SL; // circumradius of the octagon at height y
  const apo = (y: number) => rr(y) * COS;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- wall frame helpers (az: 0 = +Z, 90 = +X) ----
  const normal = (az: number) => V(Math.sin(az * DEG) * Math.cos(PHI), Math.sin(PHI), Math.cos(az * DEG) * Math.cos(PHI));
  const upv = (az: number) => V(-Math.sin(az * DEG) * Math.sin(PHI), Math.cos(PHI), -Math.cos(az * DEG) * Math.sin(PHI));
  const tang = (az: number) => V(Math.cos(az * DEG), 0, -Math.sin(az * DEG));
  const wallPt = (az: number, y: number, d: number, u = 0) => {
    const a = az * DEG;
    const R = apo(y) + d * Math.cos(PHI);
    return V(Math.sin(a) * R + Math.cos(a) * u, y + d * Math.sin(PHI), Math.cos(a) * R - Math.sin(a) * u);
  };

  const flat = (w: number, h: number, t: number, color: string, az: number, y: number, d: number, u = 0) =>
    b.part(new THREE.BoxGeometry(w, h, t), color, { bone, at: wallPt(az, y, d, u), dir: normal(az), up: upv(az), axis: "z" });
  const disc = (r: number, t: number, color: string, az: number, y: number, d: number, u = 0, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, t, seg), color, { bone, at: wallPt(az, y, d, u), dir: normal(az) });
  const blob = (r: number, color: string, at: THREE.Vector3, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at, scale: sc });
  const arch = (w: number, h: number): [number, number][] => {
    const r = w / 2;
    const pts: [number, number][] = [[-r, 0], [r, 0], [r, h - r]];
    for (let t = 30; t <= 150; t += 30) pts.push([r * Math.cos(t * DEG), h - r + r * Math.sin(t * DEG)]);
    pts.push([-r, h - r]);
    return pts;
  };
  const ext = (outline: [number, number][], color: string, az: number, y: number, d: number, th: number, u = 0) =>
    b.extrude(outline, { at: wallPt(az, y, d, u), x: tang(az), y: upv(az), thickness: th, color, bone });
  const ring = (y0: number, y1: number, d: number, color: string) =>
    b.part(new THREE.CylinderGeometry((apo(y1) + d) / COS, (apo(y0) + d) / COS, y1 - y0, 8), color, {
      bone,
      at: [0, (y0 + y1) / 2, 0],
      rotation: [0, 22.5, 0],
    });

  // ---- main body ----
  ring(0.4, 3.12, 0, P.brickRed);
  ring(3.1, 5.0, 0, P.plaster);
  // stone skirt
  ring(0.4, 0.78, 0.09, P.stone);
  ring(0.76, 0.86, 0.12, P.stoneDark);
  // mortar bands
  for (let y = 1.0; y < 3.0; y += 0.35) ring(y, y + 0.03, 0.012, P.brickDark);
  // wood ring beam hiding the colour boundary
  ring(3.0, 3.2, 0.07, P.woodDark);
  ring(3.2, 3.26, 0.04, P.woodWarm);
  // top plaster band and lip
  ring(4.85, 5.0, 0.07, P.plasterShade);
  ring(4.78, 4.85, 0.04, P.plaster);

  // corner ribs: dark brick below, plaster quoins above
  for (let k = 0; k < 8; k++) {
    const az = (22.5 + 45 * k) * DEG;
    const at = (y: number, e: number) => V(Math.sin(az) * (rr(y) + e), y, Math.cos(az) * (rr(y) + e));
    b.rod(at(0.9, 0.0), at(3.0, 0.0), 0.06, P.brickDark, { bone, sides: 6, caps: "flat" });
    b.rod(at(3.25, 0.0), at(4.8, 0.0), 0.055, P.plasterShade, { bone, sides: 6, caps: "flat" });
  }

  // scattered bricks on the lower faces
  const R = rng(11);
  for (let i = 0; i < 28; i++) {
    const k = Math.floor(R() * 8);
    const az = 45 * k;
    const y = 0.95 + R() * 2.0;
    const u = (R() - 0.5) * 0.85;
    if (k === 0 && y < 2.7 && Math.abs(u) < 0.75) continue;
    if (k % 2 === 1 && y > 2.4) continue;
    const col = i % 2 ? P.brickLight : P.brickDark;
    flat(0.22, 0.09, 0.03, col, az, y, 0.012, u);
  }

  // ---- door ----
  ext(arch(1.12, 1.42), P.woodDark, 0, 1.2, 0.02, 0.05);
  ext(arch(0.9, 1.3), P.door, 0, 1.2, 0.05, 0.04);
  for (const u of [-0.15, 0.15]) flat(0.02, 0.95, 0.015, P.woodLight, 0, 1.75, 0.075, u);
  flat(0.02, 0.3, 0.015, P.woodLight, 0, 2.35, 0.075, 0);
  for (const y of [1.5, 2.1]) flat(0.2, 0.06, 0.03, P.iron, 0, y, 0.08, -0.34);
  disc(0.045, 0.04, P.trim, 0, 1.85, 0.09, 0.3, 8);
  // step
  b.part(new THREE.BoxGeometry(1.3, 0.1, 0.38), P.stone, { bone, at: [0, 1.25, 1.84] });
  // round window above door
  disc(0.2, 0.05, P.woodDark, 0, 2.86, 0.02);
  glow(disc(0.14, 0.04, P.glow, 0, 2.86, 0.05), 1.4);
  flat(0.28, 0.025, 0.02, P.woodDark, 0, 2.86, 0.075);
  flat(0.025, 0.28, 0.02, P.woodDark, 0, 2.86, 0.075);
  // plaque
  disc(0.17, 0.04, P.trim, 0, 3.42, 0.03);
  flat(0.24, 0.035, 0.02, "#c48a2a", 0, 3.42, 0.055);
  flat(0.035, 0.24, 0.02, "#c48a2a", 0, 3.42, 0.055);

  // ---- windows ----
  const win = (az: number, yc: number) => {
    const y0 = yc - 0.42;
    ext(arch(0.64, 0.84), P.plaster, az, y0, 0.02, 0.06);
    ext(arch(0.48, 0.68), P.glass, az, y0 + 0.08, 0.045, 0.03);
    flat(0.025, 0.68, 0.02, P.plaster, az, y0 + 0.42, 0.07);
    flat(0.48, 0.025, 0.02, P.plaster, az, y0 + 0.38, 0.07);
    for (const s of [-1, 1]) {
      flat(0.16, 0.7, 0.04, P.woodWarm, az, y0 + 0.4, 0.03, s * 0.41);
    }
    // flower box
    flat(0.62, 0.14, 0.16, P.woodWarm, az, y0 - 0.06, 0.1);
    flat(0.64, 0.03, 0.17, P.woodDark, az, y0 + 0.02, 0.1);
    const lp = (u: number, dy: number, dd: number) => wallPt(az, y0 + dy, dd, u);
    blob(0.07, P.leaf, lp(-0.18, 0.05, 0.1), [1.2, 0.8, 1]);
    blob(0.07, P.leafDark, lp(0.17, 0.05, 0.1), [1.2, 0.8, 1]);
    blob(0.035, P.flowerPink, lp(-0.08, 0.1, 0.12));
    blob(0.035, P.flowerYellow, lp(0.02, 0.11, 0.14));
    blob(0.035, P.flowerPink, lp(0.1, 0.1, 0.12));
  };
  for (const az of [45, 135, 225, 315]) win(az, 2.9);
  for (const az of [0, 90, 180, 270]) win(az, 4.1);
}
```