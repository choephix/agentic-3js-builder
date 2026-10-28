<!-- call: plan -->

```json
{
  "name": "Brutalist Housing Block",
  "description": "A slab-style raw concrete housing block with a stepped, cantilevered facade of deep balconies, a pilotis podium, a stair and lift core tower, and a roof terrace with plant.",
  "builderName": "brutalistHousingBlock",
  "size": [30, 22, 12],
  "layout": "A long east-west slab, about 30 m wide (x) and 12 m deep (z), 22 m high, standing on y = 0. The ground level is an open pilotis podium of chunky board-marked concrete columns with a recessed glazed lobby. Above it, five residential storeys of 3 m each, with deep egg-crate balcony boxes on the front (+Z) facade, staggered so the silhouette reads as stepped. A taller windowless stair and lift core tower rises at the left end (+X) to 22 m with slit windows. The roof carries a plant room box, a parapet and chimney-like vents. Every surface is flat grey concrete in a few tones, with darker recessed window and balcony voids, thin board-marked seams as small dark strips, rusty steel rails, and a few warm lit windows. No ground, trees or props beyond the block.",
  "palette": {
    "concreteLight": "#a9a69d",
    "concreteMid": "#8c8a83",
    "concreteDark": "#6b6a65",
    "concreteStain": "#575650",
    "seam": "#4a4944",
    "void": "#2b2c2f",
    "glass": "#5f7a86",
    "glassLit": "#f2c36b",
    "rust": "#8a4a2a",
    "steel": "#55585c",
    "door": "#c0452b",
    "moss": "#6b7352",
    "slab": "#b8b5ab"
  },
  "mounts": {
    "podiumTop": [0, 4.5, 0],
    "slabFrontFace": [0, 11, 4],
    "slabBackFace": [0, 11, -4],
    "coreBase": [11.5, 0, 0],
    "coreFrontFace": [11.5, 11, 5],
    "roofDeck": [0, 19.5, 0],
    "coreRoof": [11.5, 22, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "podium",
      "builds": "Ground level pilotis: 14 chunky square concrete columns in two rows with board-marked seam strips, a thick transfer slab on top (podiumTop), a recessed glazed lobby with a red door, a concrete canopy, entrance steps and a ramp in lighter slab colour, and stained dark bands at column feet.",
      "box": [[-15, 0, -6], [15, 4.5, 6]],
      "attaches": "Top face at podiumTop supports the residential slab; the core base at coreBase stands beside the podium and shares its x edge.",
      "joints": [],
      "floor": true,
      "budget": 200
    },
    {
      "id": "slabBody",
      "builds": "The main residential volume from y 4.5 to 19.5: a concrete box 24 m wide, 8 m deep, five storeys with dark void window bands, glass panes, scattered warm lit windows, horizontal floor-edge seams, vertical board-marked seam strips, a back facade with small windows and access-deck walkways with rust railings, and end walls with weathering stains.",
      "box": [[-14, 4.5, -4], [10, 19.5, 4]],
      "attaches": "Sits on podiumTop. Its front face slabFrontFace receives the balconies. Its right end meets the core tower. Roof at roofDeck.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "balconies",
      "builds": "The egg-crate front facade: staggered deep concrete balcony boxes projecting from z 4 to 6 on the slab front, each with a dark inner void, a thick concrete frame, a rust steel rail, a slab floor, and occasional potted moss plants, plus fins between bays and a deeper cantilevered block at the top two storeys giving a stepped profile.",
      "box": [[-14, 4.5, 4], [10, 19.5, 6]],
      "attaches": "Back sits flush on slabFrontFace; the lowest row starts at podiumTop.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "coreTower",
      "builds": "The stair and lift tower: a tall 8 by 10 m windowless concrete shaft from the floor to 22 m at coreBase, with narrow vertical slit windows glowing warmly, board-marked seams, a heavy overhanging cap slab at coreRoof, a projecting vertical stair fin, bridge walkways linking to the slab, a rust steel door at ground, and dark stain streaks.",
      "box": [[10, 0, -5], [15, 22, 5]],
      "attaches": "Stands at coreBase beside the podium and slab; the walkway bridges touch the slab end at x 10.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "roof",
      "builds": "Roof terrace at roofDeck: thick parapet ring, a plant room box with louvres and a steel door, three chunky ventilation chimneys, water tank cylinder on legs, skylight boxes, rust ladders, moss patches, and drainage spouts jutting from the parapet.",
      "box": [[-14, 19.5, -4.5], [10, 22, 4.5]],
      "attaches": "Rests on top of slabBody at roofDeck; adjacent to the core cap at coreRoof.",
      "joints": [],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: balconies -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBalconies({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  const y0 = M.podiumTop[1]; // 4.5
  const storeys = 5;
  const sh = 3;
  const bayW = 3;
  const bays = 8; // 24 m: x from -14 to 10
  const x0 = -14;
  const tones = [P.concreteLight, P.concreteMid, P.concreteDark];

  // Stepped profile: top two storeys project the full 2 m, lower storeys vary in depth
  for (let s = 0; s < storeys; s++) {
    for (let i = 0; i < bays; i++) {
      // staggered: skip some bays on alternating rows to create open facade
      const stagger = (i + s) % 2;
      const top = s >= 3;
      const depth = top ? 2 : stagger ? 2 : 1.4;
      const cx = x0 + bayW * (i + 0.5);
      const cy = y0 + sh * s + sh / 2;
      const zc = 4 + depth / 2;
      const t = 0.25;
      const frameC = tones[(i * 3 + s * 2) % 3];
      const w = bayW - 0.1;
      const h = sh - 0.1;
      // egg-crate frame: top, bottom, left, right
      box(w, t, depth, frameC, cx, cy + h / 2 - t / 2, zc);
      box(w, t * 1.2, depth, P.slab, cx, cy - h / 2 + t * 0.6, zc);
      box(t, h, depth, frameC, cx - w / 2 + t / 2, cy, zc);
      box(t, h, depth, frameC, cx + w / 2 - t / 2, cy, zc);
      // dark inner void on slab face
      box(w - 2 * t, h - 2 * t - 0.1, 0.05, P.void, cx, cy + 0.05, 4.03);
      // glass door/pane set back
      box(w - 1.2, h - 1.3, 0.05, R() < 0.25 ? P.glassLit : P.glass, cx, cy + 0.2, 4.1);
      // seam strip on frame
      box(w, 0.04, 0.03, P.seam, cx, cy + h / 2 - t - 0.02, 4 + depth + 0.005);
      // rust rail
      const rz = 4 + depth - 0.08;
      box(w - 2 * t, 0.05, 0.05, P.rust, cx, cy - h / 2 + 1.15, rz);
      for (let k = 0; k < 5; k++)
        box(0.04, 0.9, 0.04, P.rust, cx - (w - 2 * t) / 2 + 0.1 + k * ((w - 2 * t - 0.2) / 4), cy - h / 2 + 0.75, rz);
      // potted moss plant
      if (R() < 0.25) {
        box(0.35, 0.3, 0.35, P.concreteDark, cx + 0.6, cy - h / 2 + 0.4, 4 + depth - 0.5);
        const m = b.part(new THREE.IcosahedronGeometry(0.28, 0), P.moss, {
          at: [cx + 0.6, cy - h / 2 + 0.75, 4 + depth - 0.5],
        });
      }
    }
  }

  // vertical fins between bays
  for (let i = 0; i <= bays; i++) {
    const x = x0 + bayW * i;
    if (i === 0 || i === bays) continue;
    if (i % 2 === 0) box(0.18, storeys * sh - 0.2, 0.6, P.concreteStain, x, y0 + (storeys * sh) / 2, 6 - 0.3);
  }

  // deeper cantilevered cap block over top two storeys at the right (stepped silhouette)
  box(6.5, 0.35, 2, P.concreteLight, -2, y0 + 3 * sh + 0.02, 5);
  box(8.5, 0.3, 2, P.concreteLight, 5.5, y0 + 5 * sh - 0.15, 5);
  box(0.4, 3, 0.4, P.concreteDark, -5.2, y0 + 3 * sh - 1.5, 5.8);
  box(0.4, 3, 0.4, P.concreteDark, 9.6, y0 + 3 * sh - 1.5, 5.8);

  // stain streaks under slabs
  for (let s = 1; s < storeys; s++)
    for (let k = 0; k < 4; k++)
      box(0.1, 0.6 + R() * 0.5, 0.03, P.concreteStain, x0 + R() * 23 + 0.5, y0 + s * sh - 0.5, 6.01);
}
```

<!-- call: podium -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildPodium({ b, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  // transfer slab on top
  box(30, 1.0, 12, P.concreteMid, 0, 4.0, 0);
  box(30.1, 0.12, 12.1, P.seam, 0, 3.45, 0);
  box(30.1, 0.1, 12.1, P.concreteLight, 0, 4.52, 0);
  // slab edge board seams
  for (let i = -14; i <= 14; i += 2) {
    box(0.05, 0.9, 0.04, P.seam, i, 4.0, 6.03);
    box(0.05, 0.9, 0.04, P.seam, i, 4.0, -6.03);
  }

  // columns: 2 rows of 7
  const xs = [-13.5, -9, -4.5, 0, 4.5, 9, 13.5];
  for (const z of [-4.8, 4.8]) {
    for (const x of xs) {
      const w = 1.0;
      box(w, 3.5, w, P.concreteDark, x, 1.75, z);
      box(w + 0.1, 0.45, w + 0.1, P.concreteStain, x, 0.22, z);
      box(w + 0.12, 0.2, w + 0.12, P.concreteLight, x, 3.4, z);
      for (let k = 0; k < 6; k++) {
        const y = 0.7 + k * 0.5;
        box(w + 0.02, 0.03, 0.02, P.seam, x, y, z + w / 2 + 0.01);
        box(w + 0.02, 0.03, 0.02, P.seam, x, y, z - w / 2 - 0.01);
        box(0.02, 0.03, w + 0.02, P.seam, x + w / 2 + 0.01, y, z);
        box(0.02, 0.03, w + 0.02, P.seam, x - w / 2 - 0.01, y, z);
      }
    }
  }

  // recessed lobby
  box(9, 3.4, 0.3, P.void, 0, 1.7, 2.0);
  box(8.6, 0.1, 3.0, P.concreteDark, 0, 0.05, 3.5);
  for (let i = 0; i < 4; i++) {
    const x = -3.3 + i * 2.2;
    const lit = R() > 0.6;
    box(2.0, 2.4, 0.08, lit ? P.glassLit : P.glass, x, 1.7, 2.2);
    box(0.08, 2.5, 0.12, P.steel, x - 1.1, 1.7, 2.22);
  }
  box(8.8, 0.08, 0.12, P.steel, 0, 2.95, 2.22);
  box(8.8, 0.08, 0.12, P.steel, 0, 0.45, 2.22);
  // red door
  box(1.3, 2.3, 0.1, P.door, 0, 1.2, 2.3);
  box(0.08, 0.5, 0.06, P.steel, 0.45, 1.2, 2.38);
  // side walls of lobby
  box(0.3, 3.4, 3, P.concreteMid, -4.6, 1.7, 3.5);
  box(0.3, 3.4, 3, P.concreteMid, 4.6, 1.7, 3.5);

  // canopy
  box(10.5, 0.35, 3.6, P.concreteLight, 0, 3.4, 4.2);
  box(10.5, 0.1, 0.1, P.seam, 0, 3.2, 6.0);
  box(0.25, 3.0, 0.25, P.concreteDark, -5, 1.5, 5.8);
  box(0.25, 3.0, 0.25, P.concreteDark, 5, 1.5, 5.8);

  // steps
  for (let i = 0; i < 4; i++) box(7, 0.14, 0.45, P.slab, 0, 0.07 + i * 0.0, 5.9 - i * 0.0 + i * 0.0 + 0.45 * 0 + 0);
  for (let i = 0; i < 3; i++) {
    box(7, 0.15 * (i + 1) * 1, 0.5, P.slab, 0, 0.075 * (i + 1), 6.0 - 0.5 * i - 0.25 + 0.0);
  }
  // ramp
  b.part(new THREE.BoxGeometry(2.2, 0.12, 4.5), P.slab, { at: [-6.8, 0.2, 3.9], rotation: [8, 0, 0] });
  box(0.1, 0.8, 4.5, P.rust, -7.9, 0.75, 3.9);
  box(0.1, 0.8, 4.5, P.rust, -5.7, 0.75, 3.9);

  // stain streaks under slab
  for (let i = 0; i < 8; i++) box(0.4 + R() * 0.5, 0.5, 0.03, P.concreteStain, -14 + i * 4 + R(), 3.7, 6.03);
  void M;
}
```

<!-- call: slabBody -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildSlabBody({ b, P }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  const X0 = -14, X1 = 10, Y0 = 4.5, Y1 = 19.5, ZF = 4, ZB = -4;
  const W = X1 - X0, CX = (X0 + X1) / 2;

  // main volume
  box(W, 15, 8, CX, (Y0 + Y1) / 2, 0, P.concreteMid);
  // floor-edge seams / slab edges on front, back, and ends
  for (let f = 0; f <= 5; f++) {
    const y = Y0 + f * 3;
    const yy = Math.min(y, Y1 - 0.12);
    box(W + 0.2, 0.24, 8.2, CX, yy + (f === 0 ? 0.12 : 0), 0, P.slab);
    box(W + 0.3, 0.05, 0.05, CX, yy + 0.2, ZF + 0.12, P.seam);
    box(W + 0.3, 0.05, 0.05, CX, yy + 0.2, ZB - 0.12, P.seam);
  }
  // vertical board-marked seams on front/back
  for (let i = 0; i <= 24; i++) {
    const x = X0 + i;
    box(0.05, 14.6, 0.04, x, 12, ZF + 0.02, P.seam);
    if (i % 2 === 0) box(0.05, 14.6, 0.04, x, 12, ZB - 0.02, P.seam);
  }
  // front window bands (behind balconies): void with glass and lit windows
  for (let f = 0; f < 5; f++) {
    const y = Y0 + f * 3 + 1.6;
    for (let i = 0; i < 12; i++) {
      const x = X0 + 1 + i * 2;
      box(1.5, 1.7, 0.1, x, y, ZF + 0.03, P.void);
      const lit = R() < 0.22;
      box(1.3, 1.5, 0.06, x, y, ZF + 0.09, lit ? P.glassLit : P.glass);
      box(0.05, 1.5, 0.04, x, y, ZF + 0.13, P.steel);
    }
  }
  // back facade: small windows, decks, rust rails
  for (let f = 0; f < 5; f++) {
    const y0 = Y0 + f * 3;
    box(W, 0.2, 1.2, CX, y0 + 0.9, ZB - 0.6, P.slab);
    box(W, 0.06, 0.06, CX, y0 + 1.95, ZB - 1.15, P.rust);
    box(W, 0.06, 0.06, CX, y0 + 1.5, ZB - 1.15, P.rust);
    for (let i = 0; i <= 24; i += 2) box(0.06, 1.05, 0.06, X0 + i, y0 + 1.4, ZB - 1.15, P.rust);
    for (let i = 0; i < 8; i++) {
      const x = X0 + 1.5 + i * 3;
      const lit = R() < 0.2;
      box(0.9, 0.8, 0.08, x, y0 + 2.1, ZB - 0.03, P.void);
      box(0.7, 0.6, 0.05, x, y0 + 2.1, ZB - 0.07, lit ? P.glassLit : P.glass);
      box(0.9, 1.0, 0.05, x + 1.4, y0 + 1.5, ZB - 0.04, P.concreteDark);
    }
  }
  // stair landings / back wall slits
  for (let i = 0; i < 4; i++) box(0.5, 14, 0.1, X0 + 3 + i * 6, 12, ZB - 1.25, P.concreteDark);

  // end walls (-X end visible, +X meets core)
  box(0.1, 14.6, 7.6, X0 - 0.03, 12, 0, P.concreteLight);
  for (let i = 0; i < 6; i++) box(0.04, 0.05, 7.6, X0 - 0.07, Y0 + 1 + i * 2.5, 0, P.seam);
  for (let i = 0; i < 5; i++) {
    const z = -3 + i * 1.5;
    box(0.05, 6 + R() * 6, 0.35, X0 - 0.08, Y1 - 3.5 - R() * 2, z, P.concreteStain);
  }
  for (let f = 0; f < 5; f++) box(0.05, 0.7, 0.6, X0 - 0.09, Y0 + f * 3 + 2, 1.5 - (f % 2) * 3, P.glass);
  // stains at top and base
  box(W, 0.5, 0.05, CX, Y0 + 0.4, ZF + 0.05, P.concreteStain);
  box(W, 0.4, 0.05, CX, Y0 + 0.3, ZB - 0.03, P.concreteStain);
  for (let i = 0; i < 10; i++) {
    const x = X0 + 1 + R() * 22;
    box(0.25, 2 + R() * 3, 0.03, x, Y1 - 1.5 - R() * 1.5, ZB - 0.02, P.concreteStain);
  }
  // top cornice
  box(W + 0.4, 0.3, 8.4, CX, Y1 - 0.15, 0, P.concreteLight);
}
```

<!-- call: coreTower -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildCoreTower({ b, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cx = 12.5; // shaft centre, spans x 10..15
  const shaftW = 5, shaftD = 10;

  // main shaft
  box(shaftW, 21, shaftD, P.concreteMid, cx, 10.5, 0);
  // plinth
  box(shaftW + 0.2, 0.5, shaftD + 0.2, P.concreteDark, cx, 0.25, 0);
  // stained base band
  box(shaftW + 0.05, 1.2, shaftD + 0.05, P.concreteStain, cx, 0.6, 0);

  // heavy cap slab
  box(shaftW + 1, 1.0, shaftD + 1, P.concreteLight, cx, 21.5, 0);
  box(shaftW + 1.1, 0.25, shaftD + 1.1, P.concreteDark, cx, 20.9, 0);
  box(shaftW + 1.1, 0.3, shaftD + 1.1, P.slab, cx, 22 - 0.15, 0);
  // parapet lip
  for (const s of [1, -1]) {
    box(shaftW + 1, 0.3, 0.3, P.concreteMid, cx, 22.1 - 0.05, s * (shaftD / 2 + 0.35));
  }

  // board-marked seams on front, back, and east faces
  for (let y = 1.5; y < 21; y += 1.5) {
    for (const s of [1, -1]) box(shaftW + 0.04, 0.05, 0.04, P.seam, cx, y, s * (shaftD / 2 + 0.01));
    box(0.04, 0.05, shaftD + 0.04, P.seam, 15.01, y, 0);
  }
  // vertical seams
  for (let i = -4; i <= 4; i += 2) {
    for (const s of [1, -1]) box(0.05, 19, 0.04, P.seam, 12.5 + i * 0.5, 10.5, s * (shaftD / 2 + 0.015));
  }

  // slit windows with warm glow on east face and front/back
  for (let k = 0; k < 6; k++) {
    const y = 3.5 + k * 3;
    for (const z of [-3, 0, 3]) {
      box(0.1, 1.6, 0.35, P.void, 15.02, y + 0.8, z);
      if (r() > 0.35) box(0.06, 1.4, 0.22, P.glassLit, 15.06, y + 0.8, z);
    }
    for (const s of [1, -1]) {
      box(0.35, 1.6, 0.1, P.void, 11.5, y + 0.8, s * 5.02);
      box(0.22, 1.4, 0.06, r() > 0.4 ? P.glassLit : P.glass, 11.5, y + 0.8, s * 5.06);
    }
  }

  // projecting stair fin on east face
  box(1.2, 19, 2.2, P.concreteLight, 15.6, 10, 0);
  box(1.3, 0.3, 2.3, P.concreteDark, 15.6, 19.6, 0);
  for (let k = 0; k < 8; k++) box(0.05, 1.3, 1.2, P.glassLit, 16.23, 3 + k * 2.2, 0);
  box(1.3, 0.4, 2.3, P.concreteDark, 15.6, 0.2, 0);

  // bridge walkways to slab at x 10
  for (const y of [7.5, 13.5]) {
    for (const z of [-2.5, 2.5]) {
      box(1.0, 0.25, 1.4, P.slab, 9.6, y, z);
      box(1.0, 0.08, 0.08, P.rust, 9.6, y + 0.9, z + 0.65);
      box(1.0, 0.08, 0.08, P.rust, 9.6, y + 0.9, z - 0.65);
      box(1.0, 0.08, 0.08, P.rust, 9.6, y + 0.5, z + 0.65);
      box(1.0, 0.08, 0.08, P.rust, 9.6, y + 0.5, z - 0.65);
      box(0.08, 0.9, 0.08, P.rust, 9.2, y + 0.45, z + 0.65);
      box(0.08, 0.9, 0.08, P.rust, 9.2, y + 0.45, z - 0.65);
    }
  }

  // rust steel door at ground, front
  box(1.5, 2.4, 0.15, P.rust, 12.5, 1.2, 5.05);
  box(1.7, 0.2, 0.3, P.concreteDark, 12.5, 2.5, 5.1);
  box(0.06, 0.2, 0.06, P.steel, 13.0, 1.2, 5.15);
  box(2.2, 0.15, 1.2, P.slab, 12.5, 0.07, 5.6);

  // stain streaks
  for (let i = 0; i < 12; i++) {
    const x = 10.4 + r() * 4.2;
    const h = 2 + r() * 5;
    const s = r() > 0.5 ? 1 : -1;
    box(0.12 + r() * 0.1, h, 0.03, P.concreteStain, x, 21 - h / 2 - r() * 3, s * (shaftD / 2 + 0.02));
  }
  for (let i = 0; i < 6; i++) {
    const h = 2 + r() * 4;
    box(0.03, h, 0.15, P.concreteStain, 15.03, 20 - h / 2 - r() * 4, -4.5 + r() * 9);
  }
  // cap underside stain drips
  for (let i = 0; i < 5; i++) box(0.1, 0.8, 0.03, P.concreteStain, 10.5 + i, 20.4, shaftD / 2 + 0.55);
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoof({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const Y0 = M.roofDeck[1]; // 19.5
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, c: string, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // roof slab / deck
  box(24.2, 0.2, 9.2, -2, Y0 + 0.1, 0, P.slab);
  // parapet ring
  const py = Y0 + 0.2 + 0.45;
  box(24.4, 0.9, 0.4, -2, py, 4.4, P.concreteMid);
  box(24.4, 0.9, 0.4, -2, py, -4.4, P.concreteMid);
  box(0.4, 0.9, 9.2, -14.0 + 0.2, py, 0, P.concreteMid);
  box(0.4, 0.9, 9.2, 10 - 0.2, py, 0, P.concreteMid);
  // parapet cap
  box(24.7, 0.12, 0.6, -2, Y0 + 1.16, 4.4, P.concreteLight);
  box(24.7, 0.12, 0.6, -2, Y0 + 1.16, -4.4, P.concreteLight);
  box(0.6, 0.12, 9.5, -13.8, Y0 + 1.16, 0, P.concreteLight);
  box(0.6, 0.12, 9.5, 9.8, Y0 + 1.16, 0, P.concreteLight);
  // board seams on parapet front/back
  for (let i = 0; i < 24; i++) {
    const x = -13.5 + i * 1.04;
    box(0.04, 0.8, 0.04, x, py, 4.63, P.seam);
    box(0.04, 0.8, 0.04, x, py, -4.63, P.seam);
  }
  box(24.3, 0.04, 0.04, -2, py + 0.1, 4.63, P.seam);
  box(24.3, 0.04, 0.04, -2, py - 0.2, -4.63, P.seam);
  // stain streaks below
  for (let i = 0; i < 6; i++) box(0.12, 0.6, 0.03, -12 + i * 4 + R() * 2, py - 0.1, 4.63, P.concreteStain);

  // drainage spouts
  for (const x of [-11, -5, 1, 7]) {
    b.part(new THREE.BoxGeometry(0.3, 0.25, 0.7), P.concreteDark, { at: [x, Y0 + 0.5, 4.75] });
    box(0.2, 0.12, 0.04, x, Y0 + 0.5, 5.12, P.void);
  }
  box(0.25, 0.2, 0.6, -2, Y0 + 0.5, -4.75, P.concreteDark);

  // plant room (left of centre)
  const px = -9, pz = -0.8;
  box(5, 2.2, 3.4, px, Y0 + 0.2 + 1.1, pz, P.concreteLight);
  box(5.3, 0.25, 3.7, px, Y0 + 2.5, pz, P.concreteDark);
  // louvres on front
  for (let i = 0; i < 7; i++) box(1.7, 0.07, 0.1, px - 1.3, Y0 + 0.9 + i * 0.2, pz + 1.72, P.steel);
  box(1.8, 1.5, 0.05, px - 1.3, Y0 + 1.25, pz + 1.69, P.void);
  // door
  box(0.9, 1.7, 0.08, px + 1.4, Y0 + 1.05, pz + 1.72, P.steel);
  box(1.1, 1.9, 0.05, px + 1.4, Y0 + 1.15, pz + 1.69, P.void);
  box(0.08, 0.08, 0.1, px + 1.7, Y0 + 1.05, pz + 1.8, P.rust);
  // lintel & seams
  box(5.1, 0.06, 0.04, px, Y0 + 1.6, pz + 1.71, P.seam);
  box(0.04, 2.1, 3.42, px - 1.2, Y0 + 1.3, pz, P.seam);
  // side louvres
  for (let i = 0; i < 6; i++) box(0.1, 0.07, 1.8, px - 2.52, Y0 + 0.9 + i * 0.2, pz, P.steel);

  // chimneys
  [[-4.5, -2.5, 2.6], [-1, -2.8, 3.1], [3, -2.4, 2.4]].forEach(([x, z, h], i) => {
    box(1, h, 1, x, Y0 + 0.2 + h / 2, z, i % 2 ? P.concreteMid : P.concreteLight);
    box(1.3, 0.2, 1.3, x, Y0 + 0.2 + h + 0.1, z, P.concreteDark);
    box(0.7, 0.05, 0.7, x, Y0 + 0.2 + h + 0.22, z, P.void);
    box(1.04, 0.05, 1.04, x, Y0 + 0.2 + h * 0.5, z, P.seam);
    box(0.5, 0.3, 0.04, x, Y0 + 0.5, z + 0.52, P.concreteStain);
  });

  // water tank on legs
  const tx = 5.5, tz = -1.5;
  for (const sx of [-0.9, 0.9]) for (const sz of [-0.9, 0.9])
    box(0.15, 1.2, 0.15, tx + sx, Y0 + 0.8, tz + sz, P.steel);
  box(2.1, 0.08, 0.1, tx, Y0 + 1.0, tz + 0.9, P.steel);
  box(2.1, 0.08, 0.1, tx, Y0 + 1.0, tz - 0.9, P.steel);
  cyl(1.2, 1.2, 1.6, tx, Y0 + 2.0, tz, P.rust, 12);
  cyl(1.2, 0.2, 0.3, tx, Y0 + 2.95, tz, P.concreteStain, 12);
  for (const y of [1.5, 2.0, 2.5]) cyl(1.23, 1.23, 0.06, tx, Y0 + y, tz, P.steel, 12);
  cyl(0.08, 0.08, 0.4, tx, Y0 + 3.2, tz, P.steel, 6);

  // skylights
  for (const x of [-6, -1.5, 3]) {
    box(1.6, 0.3, 1.2, x, Y0 + 0.35, 2.4, P.concreteMid);
    box(1.35, 0.12, 0.95, x, Y0 + 0.55, 2.4, P.glass);
    box(0.05, 0.14, 0.95, x, Y0 + 0.57, 2.4, P.steel);
  }
  box(1.0, 0.3, 1.6, 8.3, Y0 + 0.35, 2.2, P.concreteMid);
  box(0.8, 0.12, 1.35, 8.3, Y0 + 0.55, 2.2, P.glassLit);

  // ladders
  const ladder = (x: number, y: number, z: number, h: number) => {
    box(0.06, h, 0.06, x - 0.2, y, z, P.rust);
    box(0.06, h, 0.06, x + 0.2, y, z, P.rust);
    for (let i = 0; i < Math.floor(h / 0.3); i++) box(0.4, 0.04, 0.04, x, y - h / 2 + 0.15 + i * 0.3, z, P.rust);
  };
  ladder(px + 2.1 - 4.0, Y0 + 1.3, pz + 1.85, 2.2);
  ladder(tx + 1.2 + 0.1, Y0 + 1.9, tz + 1.0, 3.0);

  // moss patches
  for (let i = 0; i < 9; i++) {
    const x = -13 + R() * 22, z = -3.6 + R() * 7.2;
    const m = new THREE.CylinderGeometry(0.3 + R() * 0.35, 0.35 + R() * 0.3, 0.06, 6);
    b.part(m, P.moss, { at: [x, Y0 + 0.23, z] });
  }
  // roof-edge stain & pavers
  for (let i = 0; i < 8; i++) box(1.0, 0.03, 0.9, -12 + i * 1.5, Y0 + 0.22, -3.2, P.concreteLight);
}
```