<!-- call: plan -->

```json
{
  "name": "Brutalist Housing Block",
  "description": "A raw board-marked concrete housing slab in the Unité d'Habitation tradition: seven storeys of deep loggias on chunky pilotis, a separate stair and lift tower, and a sculpted roof terrace with chimneys, a gym vault and a paddling pool.",
  "builderName": "brutalistHousingBlock",
  "size": [48, 34, 20],
  "layout": "Static architecture, 48 m wide (x), 34 m tall (y) and 20 m long (z, from -11 at the back to +9 at the front). The long main facade faces +Z. From the ground up: a thin plaza slab (y 0 to 0.25); a forest of massive tapered concrete pilotis (y 0 to 5) with a glazed lobby between them in the middle; the slab block itself (x -24..24, z -7..7, y 5..27, seven storeys of 22/7 m each, floor lines at y = 5 + 22/7 * k for k = 0..7); on the front a 2 m deep egg-crate of loggias (z 7..9) made of full-height fins and projecting floor slabs, each cell holding a recessed window and a coloured infill panel; a free-standing stair and lift tower against the back (x 14..22, z -11..-7, y 0 to 34) that rises 7 m above the roof; and a sculpted roof terrace (y 27 to 31) with chunky ventilation chimneys, a curved gym vault, a pool and a parapet. The style is raw concrete everywhere: heavy chamfer-free blocky masses, board-marked formwork lines (thin darker or lighter strips as small parts), staining under every ledge, and a few saturated primary-colour panels (red, yellow, blue, green) as the only accents. The silhouette is a long horizontal slab on legs with one tall vertical tower, and the whole thing reads as heavy and monolithic. No glossy surfaces. Windows are dark glass, and about one in five glows warm yellow.",
  "palette": {
    "concreteLight": "#a9a69c",
    "concreteMid": "#8d8b83",
    "concreteDark": "#6f6d67",
    "concreteWarm": "#b4aa99",
    "concreteStain": "#5e5c57",
    "boardMark": "#7a786f",
    "boardMarkLight": "#bdb9ad",
    "shadowSlot": "#33322f",
    "glass": "#4a5e66",
    "glassLit": "#f2c768",
    "steel": "#3c4146",
    "rust": "#8a4b2e",
    "panelRed": "#c4402a",
    "panelYellow": "#e1ae2a",
    "panelBlue": "#2f5f9e",
    "panelGreen": "#3f7d5a",
    "panelWhite": "#e6e2d6",
    "moss": "#5d6b45",
    "pool": "#4f8fa0",
    "lampWarm": "#ffd48a",
    "asphalt": "#3a3a3d"
  },
  "mounts": {
    "plazaTop": [0, 0.25, 0],
    "pilotisTop": [0, 5, 0],
    "slabUnderside": [0, 5, 0],
    "floorLine0": [0, 5, 7],
    "floorStep": [0, 3.142857, 0],
    "slabFrontFace": [0, 16, 7],
    "slabBackFace": [0, 16, -7],
    "slabLeftEnd": [-24, 16, 0],
    "slabRightEnd": [24, 16, 0],
    "frontBalconyEdge": [0, 16, 9],
    "finLine0": [-24, 5, 8],
    "finSpacing": [4, 0, 0],
    "roofDeck": [0, 27, 0],
    "parapetTop": [0, 28, 0],
    "towerFootprintCentre": [18, 0, -9],
    "towerJointToSlab": [18, 16, -7],
    "towerRoofLevel": [18, 27, -9],
    "towerTop": [18, 34, -9],
    "lobbyCentre": [0, 0.25, 1],
    "frontPlazaEdge": [0, 0, 9]
  },
  "joints": [],
  "parts": [
    {
      "id": "pilotis",
      "builds": "Everything at ground level under the slab. A thin plaza slab (x -24..24, z -7..9, y 0 to 0.25) in concreteDark with paving joints as thin boardMark strips. Two rows of massive pilotis at z = -4.5 and z = +4.5, at x = -22, -14, -7, 7, 14, 22, each tapering from 2.6 m wide at the base to 1.6 m wide at y 3, then a chunky tapered 'foot-to-capital' shape up to y 5, with a pronounced squat blocky look. They are board-marked: thin horizontal darker and lighter strips every 0.4 m on the faces, plus stain streaks (concreteStain) in a tall thin box below the caps and mud at the feet. Extra heavy twin piers at x = ±24 on the end walls. Between x = -4 and 4 sits a recessed glazed lobby (z -3 to 5, height to y 4.4) with a dark glass front, steel mullions, a lit warm interior band (glassLit), a deep cantilevered concrete entrance canopy (z 5 to 8, y 4.2 to 4.7, concreteLight with a rust edge strip), a wide stepped approach (3 steps) and a side ramp with steel handrails, plus a letter-number emblem plaque 'B1' built from small parts in panelYellow next to the door. Add three rows of ribbed soffit beams (long thin boxes in concreteMid) hanging under the slab (y 4.6 to 5), two bike racks and two bench slabs, and two bollard lamps with lampWarm tops. Everything is made from primitives: boxes, tapered frustums, cylinders.",
      "box": [[-24, 0, -7], [24, 5, 9]],
      "attaches": "Pilotis tops end exactly at pilotisTop / slabUnderside (y 5) where slabBody starts. The plaza top is plazaTop (y 0.25). The lobby sits at lobbyCentre. The tower stands separately at z < -7 and its foot is the tower part's.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "slabBody",
      "builds": "The main concrete mass of the slab and its flanks: a core box x -24..24, z -7..7, y 5..27 in concreteMid (the front loggia part builds on its face at z = 7). It has two blank gable end walls at x = ±24 (each 14 m deep by 22 m high) with a deep board-marked relief of long thin horizontal strips alternating boardMark and boardMarkLight, a big graphic emblem built from panelRed / panelYellow / panelBlue slabs on the left end (a large stacked-rectangles mural, 6 by 12 m, seated 0.1 m proud), narrow slit windows in a staggered column near each back corner, and rain staining (concreteStain tall thin streaks from every ledge). The rear facade (z = -7) has a horizontal strip-window band on every storey (dark glass, thin steel mullions every 2 m, a few windows in glassLit) with projecting 0.3 m concrete sills and lintels in concreteLight, and a recessed shopping-street level on storey 4 (y 14.4 to 17.5) where the facade steps back 0.8 m behind a continuous glazed band with panelWhite shopfront boards. A slightly proud horizontal floor-edge band (0.3 m high, 0.1 m proud, concreteLight) at each floor line on the rear and ends. Top edge: a heavy 0.5 m concrete cornice ledge all round at y 26.5 to 27 (concreteLight). The inner joint with the tower on the rear face between x 14 and 22 is left plain: a recessed vertical slot (shadowSlot) 0.2 m wide at x = 14 and x = 22 on z = -7.",
      "box": [[-24, 5, -7], [24, 27, 7]],
      "attaches": "Sits on pilotisTop (y 5). Its front face (z = 7, slabFrontFace) carries the frontFacade part, so keep the front face a plain concreteMid plane. Its back face (z = -7, slabBackFace) meets the tower part at towerJointToSlab. Its top (y 27, roofDeck) carries the roof part.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "frontFacade",
      "builds": "The egg-crate loggia facade covering the entire front (z 7 to 9, y 5 to 27, x -24..24): 13 full-height vertical fins at x = -24 + 4*k for k = 0..12 (0.5 m wide, 2 m deep, concreteLight, board-marked with thin strips, with the fin edges slightly darker at the soffit); 8 projecting floor slabs (z 7 to 9, 0.35 m thick) at the floor lines y = 5 + 22/7*k for k = 0..7 in concreteMid with a lighter front-edge strip; each slab has a thin steel railing (a top rail and a few posts) along its front edge z = 8.9, merged where possible. Each of the 12 x 7 cells is recessed: a window set in the back wall (dark glass `glass`, about every fifth lit with `glassLit`, steel frame, a mullion), a lower solid balcony-wall infill panel (1 m high) and in about 40% of cells a coloured wall panel behind the loggia (panelRed, panelYellow, panelBlue, panelGreen, panelWhite in a deliberate Mondrian-like pattern, same pattern per column on each storey so vertical stripes read, with a few random exceptions) seated at z = 7.1. Add: under-slab shadow strips (shadowSlot) and drip stains (concreteStain) under each slab, a tiny coloured laundry line or potted plant in a few cells (moss/panelRed small parts), the building number '12' as chunky blocks in panelYellow on the left of the second floor slab face, and a thick vertical concrete numbering band on the middle fin. Use merged geometry per colour and bone for the repeated infills to stay in budget.",
      "box": [[-24, 5, 7], [24, 27, 9]],
      "attaches": "Back plane at slabFrontFace (z = 7), flush with slabBody. Bottom at floorLine0 (y 5) over the pilotis part's canopy region; top ends at y 27 under the roof parapet. The fins' outer edge is frontBalconyEdge (z = 9).",
      "joints": [],
      "floor": false,
      "budget": 280
    },
    {
      "id": "coreTower",
      "builds": "The free-standing stair and lift tower behind the slab, x 14..22, z -11..-7, y 0 to 34 (height 34 m is the model's tallest point). A massive board-marked shaft in concreteMid with thin horizontal formwork strips (boardMark / boardMarkLight) every 0.4 m, a heavier base plinth (y 0 to 1.2, concreteDark), a deep cantilevered cornice at the roof and a smaller lift-motor room on top (x 15..21, z -10.5..-7.5, y 31 to 34) with a cantilevered concrete lid (0.6 m overhang, concreteLight) and louvre slots (shadowSlot). The back face (z = -11) has a full-height vertical glazed stair slit 1.2 m wide (dark glass with steel mullions every storey and diagonal stair-landing silhouettes behind as small parts, a few landings lit with glassLit), flanked by narrow slit windows. Seven small cantilevered landings or access gallery stubs project from the slab-facing side of the tower at each floor line y = 5 + 22/7*k, built as short concrete bridges (x 16..20, z -7 to -7.001 stubs, 1.2 m deep platforms on z -7 to -8) with steel railings, and the entrance on the ground floor with a canopy, double doors in panelBlue, a big panelRed number '12' on the left side face, and a lamp. Left and right faces carry staggered square window punches (dark glass, concreteLight reveal frames). Rain stains below each ledge. A thin steel lightning mast with a red tip on the lid top.",
      "box": [[14, 0, -11], [22, 34, -7]],
      "attaches": "Its front face (z = -7) touches the slabBody rear face at towerJointToSlab; the landings stub into the slab at each floor line. Its foot is on the plaza level y 0 (a small paved step apron in concreteDark). Its shaft passes the roof deck at towerRoofLevel (y 27) and tops out at towerTop (y 34); the roof part stays at x < 14 or z > -7 and never overlaps the tower's box.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "roofTerrace",
      "builds": "The sculpted roof landscape on top of the slab, y 27 to 31, x -24..24, z -7..7 (not inside the tower box). A continuous parapet of 1.0 m height (y 27 to 28) in concreteLight with a thin lighter coping strip on top and board-marked strips on the faces, with drainage scuppers (shadowSlot) and rain streaks. Terrace floor in concreteDark. Features: (1) a big curved gym or nursery vault (a half-cylinder shell lathe/sweep 10 m long, 5 m wide, peaking at y 31.0) near x -14, z 0, in concreteWarm with ribbed beams (thin boxes) every 1.5 m and a glazed end wall in dark glass and a door in panelYellow; (2) three chunky sculptural ventilation chimneys at x = -3, 3, 8 (tapered boxes with deep slots and a cantilevered cap, concreteMid, height to y 31, one with a panelRed band); (3) a rectangular paddling pool (x 10 to 13.5, z -4 to -1, recessed look with a rim of concreteLight and `pool` water slab, a few steps) and a shallow bench ring around it; (4) a sun-terrace with a running track made of thin curved boardMarkLight stripes on asphalt-colored paving (a flat rounded rectangle path) around x 0..8; (5) a staircase block up to the gym vault (stepped boxes); (6) a few planters with moss, three flagpole stubs or lamp posts (steel with lampWarm tips), skylight pyramids with glassLit panes near x = -20; (7) a rooftop water tank (a cylinder with steel bands) at x = -20, z = 2, height to y 30.6. All details must be seated on the deck; keep the lowest roof piece at y >= 27 and the tallest at 31.",
      "box": [[-24, 27, -7], [24, 31, 7]],
      "attaches": "Sits on roofDeck (y 27) over slabBody, inside its x/z footprint, with parapet outer faces flush with the slab faces. It leaves the tower region x 14..22, z < -7 alone, and the tower rises past it at the back.",
      "joints": [],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: frontFacade -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildFrontFacade({ b, J, P, M }: Ctx) {
  const R = rng(12);
  const X0 = -24, Y0 = 5, H = 22 / 7;
  const bone = undefined as any;
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const box = (col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (groups[col] ||= []).push(g);
  };
  const flush = () => {
    for (const col of Object.keys(groups)) {
      const m = mergeGeometries(groups[col]);
      if (m) b.part(m, col, { at: [0, 0, 0], ...(J && (J as any).root ? { bone: (J as any).root } : {}) });
    }
  };

  // Fins
  for (let k = 0; k <= 12; k++) {
    const x = X0 + 4 * k;
    const x0 = Math.max(x - 0.25, -24), x1 = Math.min(x + 0.25, 24);
    box(P.concreteLight, x0, x1, Y0, 27, 7, 9);
    // board marks on fin front edge and sides
    for (let y = Y0 + 0.4; y < 27; y += 0.8) {
      box(P.boardMark, x0 - 0.01, x1 + 0.01, y, y + 0.06, 7.2, 9.01);
    }
    // darker edges at soffits
    for (let s = 0; s < 7; s++) box(P.concreteDark, x0 - 0.02, x1 + 0.02, Y0 + H * (s + 1) - 0.5, Y0 + H * (s + 1) - 0.35, 7.2, 9.02);
  }
  // numbering band on middle fin
  box(P.concreteDark, -0.35, 0.35, Y0, 27, 9.0, 9.12);
  box(P.boardMarkLight, -0.1, 0.1, Y0, 27, 9.12, 9.16);

  // Floor slabs
  for (let k = 0; k <= 7; k++) {
    const y = Y0 + H * k;
    const y0 = k === 7 ? y - 0.35 : y, y1 = k === 7 ? y : y + 0.35;
    box(P.concreteMid, -24, 24, y0, y1, 7, 9);
    box(P.boardMarkLight, -24, 24, y0 + 0.05, y1 - 0.05, 9.0, 9.04);
    if (k > 0) {
      box(P.shadowSlot, -23.7, 23.7, y0 - 0.12, y0, 7.05, 7.5);
      for (let i = 0; i < 12; i++) {
        if (R() < 0.6) {
          const cx = X0 + 4 * i + 2 + (R() - 0.5) * 2.4;
          box(P.concreteStain, cx - 0.08, cx + 0.08, y0 - 0.9 - R() * 0.5, y0, 7.1, 7.14);
        }
      }
    }
    if (k > 0 && k < 7) {
      // railing
      const yb = y1;
      box(P.steel, -23.75, 23.75, yb + 0.95, yb + 1.0, 8.88, 8.94);
      box(P.steel, -23.75, 23.75, yb + 0.45, yb + 0.48, 8.9, 8.93);
    }
  }
  // railing posts (per cell)
  for (let k = 1; k < 7; k++) {
    const yb = Y0 + H * k + 0.35;
    for (let i = 0; i < 48; i++) {
      const x = -23.6 + i * 1;
      if (Math.abs(((x - X0) % 4)) < 0.4 || Math.abs(((x - X0) % 4) - 4) < 0.4) continue;
      box(P.steel, x - 0.025, x + 0.025, yb, yb + 1.0, 8.88, 8.94);
    }
  }

  // Cells
  const colPattern = [null, P.panelRed, null, P.panelYellow, P.panelBlue, null, P.panelWhite, P.panelGreen, null, P.panelRed, P.panelBlue, null];
  for (let i = 0; i < 12; i++) {
    const xc = X0 + 4 * i + 2;
    const xa = xc - 1.75, xb = xc + 1.75;
    for (let s = 0; s < 7; s++) {
      const yb = Y0 + H * s + 0.35;
      const yt = Y0 + H * (s + 1);
      let pc = colPattern[i];
      if (R() < 0.08) pc = pc ? null : [P.panelYellow, P.panelRed, P.panelBlue][Math.floor(R() * 3)];
      if (pc) box(pc, xa, xb, yb + 1.0, yt - 0.5, 7.05, 7.12);
      // balcony wall infill
      box(P.concreteMid, xa, xb, yb, yb + 1.0, 7.0, 7.3);
      box(P.boardMark, xa, xb, yb + 0.95, yb + 1.0, 7.3, 7.34);
      // window
      const wy0 = yb + 1.05, wy1 = yt - 0.55;
      box(P.steel, xa + 0.2, xb - 0.2, wy0, wy1, 7.0, 7.18);
      const lit = R() < 0.2;
      const gl = lit ? P.glassLit : P.glass;
      box(gl, xa + 0.3, xc - 0.04, wy0 + 0.1, wy1 - 0.1, 7.18, 7.22);
      box(gl, xc + 0.04, xb - 0.3, wy0 + 0.1, wy1 - 0.1, 7.18, 7.22);
      box(P.steel, xc - 0.04, xc + 0.04, wy0, wy1, 7.18, 7.25);
      // small decor
      const d = R();
      if (d < 0.1) {
        box(P.moss, xa + 0.3, xa + 0.6, yb, yb + 0.35, 8.2, 8.5);
        box(P.rust, xa + 0.28, xa + 0.62, yb, yb + 0.12, 8.18, 8.52);
      } else if (d < 0.18) {
        box(P.panelRed, xa + 0.3, xb - 0.3, yb + 1.9, yb + 2.1, 8.4, 8.42);
        box(P.panelWhite, xa + 0.6, xa + 0.9, yb + 1.45, yb + 1.9, 8.4, 8.42);
      }
    }
  }

  // Building number '12' on second floor slab face (left)
  const ny = Y0 + H + 0.06, nz = 9.04;
  box(P.panelYellow, -22.9, -22.7, ny, ny + 0.24, nz, nz + 0.08);
  box(P.panelYellow, -22.4, -22.2, ny, ny + 0.24, nz, nz + 0.08);
  box(P.panelYellow, -22.2, -21.9, ny + 0.2, ny + 0.24, nz, nz + 0.08);
  box(P.panelYellow, -22.2, -21.9, ny + 0.1, ny + 0.14, nz, nz + 0.08);
  box(P.panelYellow, -22.2, -21.9, ny, ny + 0.04, nz, nz + 0.08);
  box(P.panelYellow, -22.0, -21.9, ny + 0.1, ny + 0.24, nz, nz + 0.08);
  box(P.panelYellow, -22.2, -22.1, ny, ny + 0.14, nz, nz + 0.08);

  flush();
}
```

<!-- call: slabBody -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSlabBody({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const geoCache = new Map<string, THREE.BoxGeometry>();
  // box by min/max corners
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    return b.part(g, color, { at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  };
  const X0 = -24, X1 = 24, Y0 = 5, Y1 = 27, Z0 = -7, Z1 = 7;
  const F = 22 / 7;
  const fy = (k: number) => Y0 + F * k;

  // core mass
  box(X0, Y0, Z0, X1, Y1, Z1, P.concreteMid);

  // cornice all round
  box(X0 - 0.1, 26.5, Z0 - 0.1, X1 + 0.1, 27, Z1 + 0.1, P.concreteLight);

  // floor-edge bands on rear and ends
  for (let k = 0; k <= 7; k++) {
    const y = Math.min(fy(k), 26.4) + (k === 0 ? 0.15 : 0);
    box(X0 - 0.1, y - 0.15, Z0 - 0.1, X1 + 0.1, y + 0.15, Z0, P.concreteLight);
    for (const s of [-1, 1]) {
      box(s > 0 ? X1 : X0 - 0.1, y - 0.15, Z0, s > 0 ? X1 + 0.1 : X0, y + 0.15, Z1, P.concreteLight);
    }
  }

  // board-marked relief on gable ends
  for (const s of [-1, 1]) {
    const xi = s > 0 ? X1 : X0;
    const xo = s > 0 ? X1 + 0.06 : X0 - 0.06;
    for (let i = 0; i < 52; i++) {
      const y = 5.3 + i * 0.4;
      if (y > 26.3) break;
      const c = i % 2 ? P.boardMarkLight : P.boardMark;
      box(Math.min(xi, xo), y, Z0 + 0.3, Math.max(xi, xo), y + 0.18, Z1 - 0.3, c);
    }
    // rain stains
    for (let i = 0; i < 9; i++) {
      const z = Z0 + 1 + R() * 12;
      const h = 2 + R() * 5;
      box(Math.min(xi, xo) - (s > 0 ? 0 : 0.03), 26.4 - h, z, Math.max(xi, xo) + (s > 0 ? 0.03 : 0), 26.4, z + 0.12, P.concreteStain);
    }
    // staggered slit windows near back corner
    for (let k = 0; k < 7; k++) {
      const z = Z0 + 1.2 + (k % 2) * 0.7;
      const y = fy(k) + 1.0;
      const out = s > 0 ? X1 + 0.08 : X0 - 0.08;
      box(Math.min(out, out + s * 0.0) - 0.04, y, z, out + 0.04, y + 1.6, z + 0.35, P.shadowSlot);
      box(out - 0.03, y + 0.1, z + 0.05, out + 0.03, y + 1.5, z + 0.3, k % 4 === 2 ? P.glassLit : P.glass);
    }
  }

  // emblem mural on left end (x = -24, outward -x)
  {
    const xo = X0 - 0.06;
    const xe = X0 - 0.1 - 0.06;
    const blocks: [number, number, number, number, string][] = [
      // z0, z1, y0, y1, color
      [-3, 3, 9, 21, P.panelWhite],
      [-3, 0, 9, 15, P.panelRed],
      [0, 3, 12, 21, P.panelBlue],
      [-3, 0, 15, 21, P.panelYellow],
      [-1, 1, 11, 13, P.panelWhite],
      [1, 3, 9, 12, P.panelYellow],
      [-3, -1.5, 18, 21, P.panelBlue],
      [0.5, 2.5, 17, 19, P.panelRed],
    ];
    blocks.forEach(([za, zb, ya, yb, c], i) => {
      box(xe - i * 0.004, ya, za, xo, yb, zb, c);
    });
    // frame outline
    box(xe - 0.05, 8.8, -3.2, xo, 9, 3.2, P.shadowSlot);
    box(xe - 0.05, 21, -3.2, xo, 21.2, 3.2, P.shadowSlot);
    box(xe - 0.05, 8.8, -3.2, xo, 21.2, -3, P.shadowSlot);
    box(xe - 0.05, 8.8, 3, xo, 21.2, 3.2, P.shadowSlot);
  }

  // rear facade
  const zb = Z0;
  for (let k = 0; k < 7; k++) {
    const y0 = fy(k), y1 = fy(k + 1);
    const street = k === 3;
    const wy0 = y0 + 0.9, wy1 = y1 - 0.8;
    if (street) {
      // recessed shopping level: step back 0.8 behind
      box(X0 + 0.5, y0 + 0.4, zb - 0.1, X1 - 0.5, y1 - 0.3, zb + 0.8, P.shadowSlot);
      box(X0 + 0.5, y0 + 0.4, zb + 0.8, X1 - 0.5, y1 - 0.3, zb + 0.9, P.concreteStain);
      box(X0 + 0.5, y0 + 0.4, zb + 0.55, X1 - 0.5, y0 + 1.5, zb + 0.7, P.panelWhite);
      const gx0 = X0 + 0.5, gx1 = X1 - 0.5;
      for (let i = 0; i < 22; i++) {
        const x = gx0 + (i + 0.5) * ((gx1 - gx0) / 22);
        const w = (gx1 - gx0) / 22 - 0.12;
        box(x - w / 2, y0 + 1.6, zb + 0.5, x + w / 2, y1 - 0.5, zb + 0.6, i % 6 === 3 ? P.glassLit : P.glass);
      }
      for (let i = 0; i <= 22; i++) {
        const x = gx0 + i * ((gx1 - gx0) / 22);
        box(x - 0.04, y0 + 1.5, zb + 0.45, x + 0.04, y1 - 0.4, zb + 0.65, P.steel);
      }
      // shopfront boards
      for (let i = 0; i < 5; i++) box(gx0 + 2 + i * 9, y1 - 0.9, zb + 0.4, gx0 + 6 + i * 9, y1 - 0.45, zb + 0.55, [P.panelWhite, P.panelRed, P.panelWhite, P.panelYellow, P.panelBlue][i]);
      // lintel/sill
      box(X0, y1 - 0.3, zb - 0.3, X1, y1 - 0.0, zb, P.concreteLight);
      continue;
    }
    // dark strip glass band in segments between tower slots
    box(X0 + 0.5, wy0, zb - 0.02, X1 - 0.5, wy1, zb + 0.02, P.shadowSlot);
    const n = 23;
    const w = (X1 - X0 - 1) / n;
    for (let i = 0; i < n; i++) {
      const x = X0 + 0.5 + (i + 0.5) * w;
      const lit = R() < 0.18;
      box(x - w / 2 + 0.06, wy0 + 0.05, zb - 0.07, x + w / 2 - 0.06, wy1 - 0.05, zb - 0.02, lit ? P.glassLit : P.glass);
    }
    for (let i = 0; i <= n; i++) {
      const x = X0 + 0.5 + i * w;
      box(x - 0.04, wy0, zb - 0.12, x + 0.04, wy1, zb - 0.02, P.steel);
    }
    box(X0 + 0.5, wy0 - 0.3, zb - 0.3, X1 - 0.5, wy0, zb - 0.0, P.concreteLight); // sill
    box(X0 + 0.5, wy1, zb - 0.3, X1 - 0.5, wy1 + 0.3, zb - 0.0, P.concreteLight); // lintel
    // stains below sill
    for (let i = 0; i < 6; i++) {
      const x = X0 + 1 + R() * 46;
      box(x, wy0 - 1.4, zb - 0.02, x + 0.15, wy0 - 0.3, zb + 0.01, P.concreteStain);
    }
  }

  // board marks on rear above/below, thin strips
  for (let i = 0; i < 52; i++) {
    const y = 5.2 + i * 0.42;
    if (y > 26.2) break;
    box(X0, y, zb - 0.015, X1, y + 0.05, zb, i % 2 ? P.boardMarkLight : P.boardMark);
  }

  // tower joint slots
  for (const x of [14, 22]) box(x - 0.1, Y0, zb - 0.06, x + 0.1, Y1, zb + 0.02, P.shadowSlot);
  // plain plane between tower slots
  box(14.1, Y0 + 0.2, zb - 0.03, 21.9, 26.4, zb, P.concreteMid);

  // cornice underside shadow and stain streaks from cornice on rear
  box(X0, 26.3, zb - 0.1, X1, 26.5, zb, P.shadowSlot);
  for (let i = 0; i < 10; i++) {
    const x = X0 + 2 + R() * 44;
    box(x, 21 + R() * 3, zb - 0.1, x + 0.18, 26.3, zb - 0.05, P.concreteStain);
  }
}
```

<!-- call: pilotis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPilotis({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, color: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z] });
  const frus = (w0: number, d0: number, w1: number, d1: number, h: number, color: string, x: number, y: number, z: number) => {
    // square-ish tapered frustum: bottom (w0,d0), top (w1,d1)
    const g = new THREE.CylinderGeometry(1, 1, h, 4, 1);
    g.rotateY(Math.PI / 4);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const top = pos.getY(i) > 0;
      const w = top ? w1 : w0;
      const d = top ? d1 : d0;
      pos.setX(i, pos.getX(i) * w / Math.SQRT2);
      pos.setZ(i, pos.getZ(i) * d / Math.SQRT2);
    }
    g.computeVertexNormals();
    return b.part(g, color, { at: [x, y, z], flat: true });
  };

  // plaza slab
  box(48, 0.25, 16, P.concreteDark, 0, 0.125, 1);
  for (let x = -20; x <= 20; x += 4) box(0.06, 0.02, 16, P.boardMark, x, 0.26, 1);
  for (let z = -5; z <= 9; z += 4) box(48, 0.02, 0.06, P.boardMark, 0, 0.26, z);

  // pilotis
  const xs = [-22, -14, -7, 7, 14, 22];
  const pil = (x: number, z: number) => {
    frus(2.6, 2.6, 1.6, 1.6, 3, P.concreteMid, x, 0.25 + 1.5 - 0.25, z);
    frus(1.6, 1.6, 2.4, 2.2, 2, P.concreteLight, x, 4, z);
    box(2.5, 0.2, 2.3, P.concreteDark, x, 4.9, z);
    // board marks on front faces
    for (let i = 0; i < 6; i++) {
      const y = 0.5 + i * 0.4;
      const t = 1 - (y / 3) * 0.38;
      const w = 2.6 * t * 0.5 * 2 / 2.6 * 1.3 * 0.78;
      box(w, 0.04, 0.03, i % 2 ? P.boardMarkLight : P.boardMark, x, y + 0.2, z + 1.3 * t * 0.96 - 0.12);
    }
    for (let i = 0; i < 4; i++) box(1.5, 0.04, 0.03, i % 2 ? P.boardMarkLight : P.boardMark, x, 3.2 + i * 0.4, z + 1.05 + i * 0.04 - 0.02 + 0.0);
    // stain streaks
    for (const dx of [-0.5, 0.2, 0.6]) box(0.12, 1.2 + R() * 0.5, 0.04, P.concreteStain, x + dx, 3.9, z + 1.2);
    // mud at feet
    box(2.5, 0.25, 2.5, P.concreteStain, x, 0.37, z).mesh.scale.set(1, 1, 1);
  };
  for (const x of xs) for (const z of [-4.5, 4.5]) pil(x, z);

  // end twin piers
  for (const s of [-1, 1])
    for (const z of [-4.5, 4.5]) {
      frus(2.6, 2.4, 1.9, 2.0, 4.75, P.concreteMid, s * 23.2, 2.62, z);
      box(2.1, 0.25, 2.2, P.concreteDark, s * 23.2, 4.88, z);
      for (let i = 0; i < 9; i++) box(1.8, 0.04, 0.03, i % 2 ? P.boardMarkLight : P.boardMark, s * 23.2, 0.7 + i * 0.5, z + 1.1);
      box(0.15, 1.5, 0.04, P.concreteStain, s * 23.2, 3.9, z + 1.1);
    }

  // lobby
  box(8, 0.12, 8, P.concreteDark, 0, 0.31, 1);
  box(8, 4.15, 0.2, P.glass, 0, 2.4, 4.9);
  box(7.8, 0.35, 0.1, P.glassLit, 0, 3.7, 4.78);
  box(7.8, 0.35, 0.1, P.glassLit, 0, 0.9, 4.78);
  for (let i = -4; i <= 4; i++) box(0.1, 4.1, 0.14, P.steel, i * 1, 2.4, 5.05);
  box(8.2, 0.12, 0.14, P.steel, 0, 4.4, 5.05);
  box(8.2, 0.12, 0.14, P.steel, 0, 0.4, 5.05);
  box(1.8, 3.2, 0.12, P.steel, 0, 1.9, 5.1);
  box(1.5, 3.0, 0.1, P.glass, 0, 1.9, 5.17);
  box(0.05, 3.0, 0.12, P.steel, 0, 1.9, 5.2);
  box(8, 4.15, 0.2, P.concreteMid, -6, 2.4, -2.9).mesh.visible = false;
  // lobby side and back walls
  box(0.3, 4.1, 8, P.concreteMid, -4.15, 2.35, 1);
  box(0.3, 4.1, 8, P.concreteMid, 4.15, 2.35, 1);
  box(8, 4.1, 0.3, P.concreteMid, 0, 2.35, -3);

  // canopy
  box(9, 0.5, 3, P.concreteLight, 0, 4.45, 6.5);
  box(9.05, 0.14, 0.1, P.rust, 0, 4.4, 8.02);
  box(9.05, 0.04, 0.1, P.boardMark, 0, 4.72, 8.02);
  box(9, 0.3, 0.05, P.shadowSlot, 0, 4.18, 7.9);

  // steps
  for (let i = 0; i < 3; i++) box(6 - i * 0.3, 0.14, 1.2 - i * 0.2 + 0.4, P.concreteLight, 0, 0.32 + i * 0.14, 8.0 - i * 0.55 - 0.1);
  box(6, 0.08, 0.08, P.boardMarkLight, 0, 0.5, 8.5);

  // ramp
  const ramp = b.part(new THREE.BoxGeometry(1.6, 0.14, 4.5), P.concreteLight, { at: [5.6, 0.4, 6.7] });
  ramp.mesh.rotation.x = -0.1;
  for (const dx of [-0.8, 0.8]) {
    box(0.05, 0.05, 4.5, P.steel, 5.6 + dx, 1.05, 6.7);
    for (const z of [4.6, 6.7, 8.8]) box(0.05, 0.75, 0.05, P.steel, 5.6 + dx, 0.7, z);
  }

  // B1 plaque
  box(1.6, 1.0, 0.06, P.concreteDark, -2.4, 2.1, 5.25);
  box(0.12, 0.7, 0.04, P.panelYellow, -2.8, 2.1, 5.3);
  box(0.35, 0.12, 0.04, P.panelYellow, -2.65, 2.4, 5.3);
  box(0.35, 0.12, 0.04, P.panelYellow, -2.65, 2.1, 5.3);
  box(0.35, 0.12, 0.04, P.panelYellow, -2.65, 1.8, 5.3);
  box(0.12, 0.3, 0.04, P.panelYellow, -2.5, 2.25, 5.3);
  box(0.12, 0.3, 0.04, P.panelYellow, -2.5, 1.95, 5.3);
  box(0.12, 0.7, 0.04, P.panelYellow, -2.0, 2.1, 5.3);
  box(0.2, 0.12, 0.04, P.panelYellow, -2.1, 2.4, 5.3);

  // soffit beams
  for (const z of [-5.5, 0, 5.5]) {
    box(47.5, 0.4, 0.5, P.concreteMid, 0, 4.8, z);
    for (let x = -22; x <= 22; x += 4) box(0.08, 0.4, 0.52, P.boardMark, x, 4.8, z);
  }

  // bike racks
  for (const x of [-11, 11]) {
    box(2, 0.05, 0.5, P.steel, x, 0.28, 7.5);
    for (let i = 0; i < 5; i++) box(0.04, 0.5, 0.04, P.steel, x - 0.8 + i * 0.4, 0.55, 7.5);
    box(2, 0.04, 0.04, P.steel, x, 0.8, 7.5);
  }
  // benches
  for (const x of [-17, 17]) {
    box(2.2, 0.15, 0.6, P.concreteLight, x, 0.55, 7.8);
    box(0.2, 0.3, 0.5, P.concreteMid, x - 0.9, 0.4, 7.8);
    box(0.2, 0.3, 0.5, P.concreteMid, x + 0.9, 0.4, 7.8);
  }
  // bollard lamps
  for (const x of [-5, 5]) {
    cyl(0.12, 0.14, 0.9, P.steel, x, 0.7, 8.6, 8);
    cyl(0.16, 0.16, 0.2, P.lampWarm, x, 1.25, 8.6, 8);
    box(0.4, 0.05, 0.4, P.steel, x, 1.37, 8.6);
  }
}
```

<!-- call: coreTower -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCoreTower({ b, J, P, M }: Ctx) {
  const R = rng(12);
  const X0 = 14, X1 = 22, Z0 = -11, Z1 = -7;
  const CX = 18, CZ = -9;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  // box from min/max corners
  const bx = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string) =>
    box(x1 - x0, y1 - y0, z1 - z0, color, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

  // apron + plinth
  bx(13.2, 22.8, 0, 0.1, -11.8, -5.8, P.concreteDark);
  bx(13.6, 22.4, 0.1, 0.3, -11.4, -6.4, P.concreteMid);
  bx(13.8, 22.2, 0, 1.2, -11.2, -7, P.concreteDark);

  // main shaft
  bx(14, 22, 1.2, 31, -11, -7, P.concreteMid);

  // formwork strips on 3 free faces (back, left, right) every 0.4 m
  for (let y = 1.6, i = 0; y < 30.8; y += 0.4, i++) {
    const c = i % 2 ? P.boardMarkLight : P.boardMark;
    bx(14, 22, y, y + 0.05, -11.03, -11, c);
    bx(13.97, 14, y, y + 0.05, -11, -7, c);
    bx(22, 22.03, y, y + 0.05, -11, -7, c);
  }

  // cornice
  bx(13.4, 22.6, 30.2, 31, -11.6, -6.8, P.concreteLight);
  bx(13.4, 22.6, 29.9, 30.2, -11.6, -6.8, P.concreteStain);
  bx(13.6, 22.4, 29.7, 29.9, -11.4, -7, P.shadowSlot);

  // motor room + lid
  bx(15, 21, 31, 33.5, -10.5, -7.5, P.concreteMid);
  for (let y = 31.5; y < 33.3; y += 0.4) {
    bx(15.6, 20.4, y, y + 0.15, -10.55, -10.5, P.shadowSlot);
    bx(14.95, 15, y, y + 0.15, -10, -8, P.shadowSlot);
    bx(21, 21.05, y, y + 0.15, -10, -8, P.shadowSlot);
  }
  bx(14.4, 21.6, 33.5, 34, -11.1, -6.9, P.concreteLight);
  // mast
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 6), P.steel, { at: [CX, 35.2, CZ - 0.5] });
  b.part(new THREE.ConeGeometry(0.1, 0.3, 6), P.panelRed, { at: [CX, 36.5, CZ - 0.5] });

  // glazed stair slit on back face
  bx(17.4, 18.6, 1.4, 29.6, -11.06, -11, P.shadowSlot);
  bx(17.5, 18.5, 1.5, 29.5, -11.1, -11.06, P.glass);
  for (let k = 0; k <= 7; k++) {
    const y = 5 + (22 / 7) * k;
    bx(17.4, 18.6, y - 0.06, y + 0.06, -11.15, -11.08, P.steel);
    if (k < 7) {
      const lit = k % 3 === 1;
      const s = 0.55;
      // diagonal stair silhouette
      b.part(new THREE.BoxGeometry(1.0, 0.07, 0.04), lit ? P.glassLit : P.steel, {
        at: [CX, y + 1.2, -11.12], rotation: [0, 0, 28],
      });
      bx(17.5, 17.5 + s, y + 1.6, y + 1.7, -11.12, -11.08, lit ? P.glassLit : P.steel);
    }
  }
  for (const x of [17.45, 18.55]) bx(x - 0.04, x + 0.04, 1.4, 29.6, -11.14, -11.08, P.steel);
  // flanking slits
  for (const sx of [15.4, 16.4, 19.6, 20.6]) {
    for (let k = 0; k < 7; k++) {
      const y = 5 + (22 / 7) * k + 1.4;
      bx(sx - 0.12, sx + 0.12, y, y + 1.2, -11.05, -11, R() < 0.2 ? P.glassLit : P.glass);
    }
  }

  // landings on slab side
  for (let k = 0; k <= 6; k++) {
    const y = 5 + (22 / 7) * k;
    bx(16, 20, y - 0.2, y, -8, -7, P.concreteLight);
    bx(16, 20, y - 0.35, y - 0.2, -7.9, -7.05, P.concreteStain);
    bx(16, 20, y - 0.05, y + 0.0, -7.001, -7, P.concreteMid);
    bx(16, 20, y + 0.95, y + 1.0, -8.02, -7.96, P.steel);
    for (const x of [16.05, 18, 19.95]) bx(x - 0.03, x + 0.03, y, y + 1, -8, -7.95, P.steel);
    for (const x of [16, 20]) bx(x - 0.03, x + 0.03, y + 0.95, y + 1.0, -8, -7, P.steel);
  }

  // entrance on side face toward... front (z=-7) ground level, doors
  bx(16.6, 19.4, 0, 3.0, -7.05, -7, P.concreteDark);
  bx(16.8, 19.2, 0.1, 2.7, -7.12, -7.05, P.steel);
  bx(16.9, 17.95, 0.1, 2.6, -7.2, -7.12, P.panelBlue);
  bx(18.05, 19.1, 0.1, 2.6, -7.2, -7.12, P.panelBlue);
  bx(17.95, 18.05, 0.1, 2.6, -7.22, -7.12, P.steel);
  bx(16.3, 19.7, 3.0, 3.35, -8.4, -6.9, P.concreteLight);
  bx(16.3, 19.7, 2.9, 3.0, -8.4, -6.9, P.concreteStain);
  for (const x of [16.4, 19.6]) bx(x - 0.05, x + 0.05, 0.1, 3.0, -8.35, -8.25, P.steel);
  b.part(new THREE.SphereGeometry(0.15, 6, 4), P.lampWarm, { at: [CX, 2.8, -8.0] });
  bx(17.8, 18.2, 0.1, 0.25, -8.6, -7.2, P.concreteMid);
  bx(17.5, 18.5, 0.1, 0.15, -9.0, -8.6, P.concreteDark);

  // big red "12" on left side face (x = 22)
  const digit = (cx: number, one: boolean) => {
    const zc = cx, y0 = 9;
    if (one) { bx(22.03, 22.2, y0, y0 + 3.2, zc - 0.2, zc + 0.2, P.panelRed); return; }
    bx(22.03, 22.2, y0 + 2.8, y0 + 3.2, zc - 0.6, zc + 0.6, P.panelRed);
    bx(22.03, 22.2, y0 + 1.4, y0 + 1.8, zc - 0.6, zc + 0.6, P.panelRed);
    bx(22.03, 22.2, y0, y0 + 0.4, zc - 0.6, zc + 0.6, P.panelRed);
    bx(22.03, 22.2, y0 + 1.8, y0 + 2.8, zc - 0.6, zc - 0.2, P.panelRed);
    bx(22.03, 22.2, y0 + 0.4, y0 + 1.4, zc + 0.2, zc + 0.6, P.panelRed);
  };
  digit(-8.6, true);
  digit(-9.9, false);

  // staggered square window punches on both side faces
  for (let k = 0; k < 8; k++) {
    for (const sd of [1, -1]) {
      const zc = k % 2 ? -8.2 : -9.8;
      const y = 3 + k * 3.4 + (sd > 0 ? 0 : 1);
      if (y > 29) continue;
      if (sd > 0 && y > 8.5 && y < 12.5 && zc < -8.2 && zc > -10.3) continue;
      const x = sd > 0 ? 22 : 14;
      const lit = R() < 0.2;
      bx(x - 0.1 * sd - (sd > 0 ? 0 : -0.0), x + 0.04 * sd + (sd > 0 ? 0 : 0), y - 0.05, y + 1.05, zc - 0.55, zc + 0.55, P.concreteLight);
      bx(Math.min(x, x + 0.08 * sd), Math.max(x, x + 0.08 * sd), y + 0.05, y + 0.95, zc - 0.45, zc + 0.45, lit ? P.glassLit : P.glass);
      bx(Math.min(x, x + 0.1 * sd), Math.max(x, x + 0.1 * sd), y - 0.1, y - 0.05, zc - 0.55, zc + 0.55, P.concreteStain);
    }
  }

  // rain stains
  for (let i = 0; i < 12; i++) {
    const x = 14.5 + R() * 7, y0 = 6 + R() * 20;
    bx(x, x + 0.12, y0, y0 + 2 + R() * 3, -11.03, -11, P.concreteStain);
  }
  for (let i = 0; i < 6; i++) {
    const z = -10.6 + R() * 3.2;
    bx(21.98, 22.03, 8 + R() * 18, 11 + R() * 18 > 30 ? 30 : 12 + R() * 16, z, z + 0.12, P.concreteStain);
  }
  bx(13.8, 22.2, 1.2, 1.5, -11.22, -6.98, P.concreteStain);
}
```

<!-- call: roofTerrace -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRoofTerrace({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const Y0 = 27;
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y + h / 2, z] });
  const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, c: string, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y + h / 2, z] });

  // deck
  box(47.6, 0.1, 13.6, 0, Y0, 0, P.concreteDark);

  // parapet with coping, board marks, scuppers, rain streaks (tower region at x14..22 only for z<-7, so full ring ok)
  const T = 0.4;
  const walls: [number, number, number, number, number][] = [
    [48, T, 0, 7 - T / 2, 0], [48, T, 0, -7 + T / 2, 0],
    [T, 14, -24 + T / 2, 0, 1], [T, 14, 24 - T / 2, 0, 1],
  ];
  for (const [w, t, x, z, side] of walls) {
    const sx = side ? t : w, sz = side ? 14 : t;
    box(sx, 1, sz, x, Y0, z, P.concreteLight);
    box(side ? t + 0.1 : w + 0.1, 0.12, side ? 14.1 : t + 0.1, x, Y0 + 1, z, P.boardMarkLight);
    for (let k = 0; k < 3; k++) {
      const y = Y0 + 0.2 + k * 0.3;
      if (side) {
        const o = x > 0 ? 1 : -1;
        box(0.04, 0.04, 13.8, x + o * (t / 2 + 0.01), y, z, P.boardMark);
      } else {
        const o = z > 0 ? 1 : -1;
        box(47.8, 0.04, 0.04, x, y, z + o * (t / 2 + 0.01), P.boardMark);
      }
    }
  }
  for (const x of [-16, -6, 4, 12, 20]) {
    box(0.6, 0.25, 0.1, x, Y0 + 0.1, 6.82, P.shadowSlot);
    box(0.12, 0.7, 0.05, x - 0.9, Y0 + 0.25, 6.82 + 0.0, P.concreteStain);
    box(0.1, 0.5, 0.05, x + 1.3, Y0 + 0.4, 6.82, P.concreteStain);
  }
  for (const z of [-4, 3]) {
    box(0.1, 0.25, 0.6, 23.82, Y0 + 0.1, z, P.shadowSlot);
    box(0.1, 0.25, 0.6, -23.82, Y0 + 0.1, z, P.shadowSlot);
  }

  // (1) gym vault: half cylinder along x, 10 long, 5 wide, peak 31 -> radius 2.5 centre y 28.5? use scaled
  const vx = -14;
  const vg = new THREE.CylinderGeometry(2.5, 2.5, 10, 14, 1, true, 0, Math.PI);
  const vault = b.part(vg, P.concreteWarm, {
    at: [vx, Y0 + 0.9, 0], rotation: [0, 0, 90], scale: [1.4, 1, 1], flat: true,
  });
  // after rotation about z by 90deg: cylinder axis along x; half arc faces up? rotate to ensure arch up
  vault.mesh.rotation.set(0, 0, Math.PI / 2);
  vault.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0);
  box(10, 0.9, 5, vx, Y0, 0, P.concreteWarm);
  // ribs
  for (let i = 0; i <= 6; i++) {
    const x = vx - 4.5 + i * 1.5;
    const rib = new THREE.TorusGeometry(2.6, 0.1, 4, 14, Math.PI);
    b.part(rib, P.concreteMid, { at: [x, Y0 + 0.9, 0], rotation: [0, 90, 0] });
  }
  // end walls glazed
  const gl = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 14, 1, false, 0, Math.PI);
  b.part(gl, P.glass, { at: [vx + 5.02, Y0 + 0.9, 0], rotation: [0, 0, 90] });
  b.part(gl, P.glass, { at: [vx - 5.02, Y0 + 0.9, 0], rotation: [0, 0, 90] });
  box(0.1, 1.8, 1.0, vx + 5.1, Y0 + 0.9, 1.4, P.panelYellow);
  box(0.1, 0.1, 4.6, vx + 5.08, Y0 + 1.8, 0, P.steel);
  // stair block to vault
  for (let i = 0; i < 4; i++) box(1.2, 0.3 * (i + 1), 3, vx + 6.6 + (3 - i) * 0 + i * 0.6 - 0.0, Y0, -2.6 + 0 , P.concreteLight);
  for (let i = 0; i < 4; i++) box(0.5, 0.2 * (4 - i), 2, vx + 7.2 + i * 0.5, Y0, 2.6, P.concreteLight);

  // (2) chimneys
  [-3, 3, 8].forEach((x, i) => {
    const g = new THREE.CylinderGeometry(0.9, 1.1, 3.2, 4, 1);
    b.part(g, P.concreteMid, { at: [x, Y0 + 1.6, -3.5], rotation: [0, 45, 0], flat: true });
    box(2.2, 0.4, 2.2, x, Y0 + 3.2, -3.5, P.concreteLight);
    box(0.5, 1.2, 1.6, x, Y0 + 2.0, -2.45, P.shadowSlot);
    box(0.5, 1.2, 0.1, x, Y0 + 2.0, -4.6, P.shadowSlot);
    if (i === 1) box(1.9, 0.4, 1.9, x, Y0 + 1.2, -3.5, P.panelRed);
  });

  // (3) pool
  box(4.3, 0.3, 3.8, 11.75, Y0, -2.5, P.concreteLight);
  box(3.5, 0.32, 3.0, 11.75, Y0, -2.5, P.pool);
  for (let i = 0; i < 3; i++) box(0.6, 0.12 * (i + 1) + 0.3, 1.2, 9.5 - i * 0.0 + 0, Y0, -2.5, P.concreteLight).mesh.visible = i === 0;
  for (const s of [-1, 1]) box(4.8, 0.45, 0.4, 11.75, Y0, -2.5 + s * 2.3, P.concreteMid);
  box(0.4, 0.45, 4.2, 14.4, Y0, -2.5, P.concreteMid);

  // (4) running track
  box(8.6, 0.04, 6.0, 4, Y0 + 0.1, 3.2, P.asphalt);
  for (let k = 0; k < 3; k++) {
    const w = 8 - k * 1.2, d = 5.2 - k * 1.2;
    box(w, 0.03, 0.06, 4, Y0 + 0.14, 3.2 - d / 2, P.boardMarkLight);
    box(w, 0.03, 0.06, 4, Y0 + 0.14, 3.2 + d / 2, P.boardMarkLight);
    box(0.06, 0.03, d, 4 - w / 2, Y0 + 0.14, 3.2, P.boardMarkLight);
    box(0.06, 0.03, d, 4 + w / 2, Y0 + 0.14, 3.2, P.boardMarkLight);
  }

  // (6) planters, lamp posts, skylights
  [[-8, 5.6], [-20, -5.5], [0, -5.6], [20, 5.6]].forEach(([x, z]) => {
    box(1.6, 0.6, 0.8, x, Y0, z, P.concreteMid);
    box(1.4, 0.12, 0.6, x, Y0 + 0.6, z, P.moss);
    for (let k = 0; k < 3; k++) b.part(new THREE.SphereGeometry(0.22 + R() * 0.1, 6, 4), P.moss, { at: [x - 0.4 + k * 0.4, Y0 + 0.8, z] });
  });
  [[-23, 6], [23, 6], [-6, 6]].forEach(([x, z]) => {
    cyl(0.05, 0.07, 3, x, Y0, z, P.steel, 6);
    b.part(new THREE.SphereGeometry(0.15, 6, 4), P.lampWarm, { at: [x, Y0 + 3.1, z] });
  });
  [-21, -18].forEach((x) => {
    box(2, 0.3, 2, x, Y0, -4, P.concreteLight);
    b.part(new THREE.ConeGeometry(1.2, 0.9, 4), P.glassLit, { at: [x, Y0 + 0.75, -4], rotation: [0, 45, 0] });
  });

  // (7) water tank
  cyl(1.4, 1.4, 3.6, -20, Y0, 2, P.concreteMid, 14);
  [0.5, 1.8, 3].forEach((h) => cyl(1.45, 1.45, 0.12, -20, Y0 + h, 2, P.steel, 14));
  cyl(1.0, 1.4, 0.4, -20, Y0 + 3.6, 2, P.steel, 14).mesh.scale.y = 1;
  box(2.6, 0.3, 0.3, -20, Y0, 0.4, P.steel);
}
```