<!-- call: plan -->

```json
{
  "name": "Brutalist Housing Block",
  "description": "A raw board-marked concrete slab block on massive pilotis, with deep eggcrate loggias, rear access galleries, a freestanding lift and stair tower at one end and a roof terrace with plant and a vaulted pavilion.",
  "builderName": "brutalistHousingBlock",
  "size": [64, 31, 22],
  "layout": "Static architectural model, 1 unit = 1 m, built at full real size. +Z is the long front facade, +Y is up, and the model is centred on x = 0. The long slab runs along X from x=-32 (right end seen from the front, the model's right) to x=18. It sits on pilotis: a 6 m open ground storey, then 7 residential storeys of 3 m each (y=6 to 27), then a roof terrace from 27 to about 31. The tower is a separate heavy concrete shaft with a cantilevered crown at the left end (x 18 to 32) and is the tallest element at y=31. Grid: 10 structural bays of 5 m on the slab at x edges -32,-27,...,18 (edge i = -32+5i). Storey floor levels are y=6+3k, k=0..7. The slab core is a solid block x[-32,18], y[6,27], z[-7.5,7.5]. FRONT (+Z) is an eggcrate of deep loggias: concrete party fins at every bay line and floor and ceiling slabs project from the core wall at z=7.5 out to z=11. Each loggia is 4.65 m wide and 2.65 m high and 3.5 m deep. The loggia back walls are painted panels in rotating primaries, with glazed sliding doors, railings and planters. BACK (-Z) is the access side: continuous gallery decks at each storey projecting from z=-7.5 to z=-9.5 with solid 1.1 m parapets, and three full-height stair towers projecting to z=-11. The GROUND storey has massive tapered piloti columns, transfer beams, a recessed glazed lobby, an entrance canopy, steps and a ramp. The ROOF has a parapet, plant rooms, chimney-like ventilation stacks, a water tank and a vaulted concrete pavilion. STYLE: raw concrete brutalism. Heavy, blocky, chunky proportions. Every concrete surface is built from several flat greys, so that the pour lines and wear read as geometry. Board-marking is thin horizontal strips about 3 cm proud in boardMark. Tie-rod holes are small dark discs on a regular grid. Cast joints are thin dark recessed strips. Rain staining is vertical streaks in stain and mossStain, below ledges, parapets and window heads. Rust runs sit under metal fixings. Concrete tones vary between neighbouring panels (concreteLight, concreteMid, concreteWarm, concreteDark) so the pour sequence shows. Colour comes only in small doses: the loggia panels, lit windows, doors and plants. No smooth or glossy surfaces. Chamfers are minimal, edges are crisp, and geometry is boxes, slabs, wedges and half-cylinders. Do not add scenery, ground, trees or props beyond the subject and the listed planters, bike racks and lamps.",
  "palette": {
    "concreteLight": "#b4b0a6",
    "concreteMid": "#97938a",
    "concreteWarm": "#aa9f8e",
    "concreteDark": "#74716b",
    "concreteDeep": "#55534f",
    "boardMark": "#85827a",
    "stain": "#5f5d58",
    "mossStain": "#687058",
    "rust": "#8c5a3a",
    "shadowRecess": "#2f2e2d",
    "glass": "#4a5d68",
    "glassLit": "#f0c878",
    "frameDark": "#232425",
    "metalRail": "#3d4144",
    "panelRed": "#b8432f",
    "panelOchre": "#d39a2c",
    "panelBlue": "#4f7391",
    "panelWhite": "#e6e0d2",
    "panelGreen": "#5c7f4a",
    "timber": "#8a6a45",
    "planterSoil": "#4a3a2c",
    "plantGreen": "#5a7d3e",
    "signWhite": "#efece4"
  },
  "mounts": {
    "slabLeftEnd": [-32, 6, 0],
    "slabRightEnd": [18, 6, 0],
    "pilotisTop": [0, 6, 0],
    "slabRoofTop": [0, 27, 0],
    "frontCoreWall": [0, 6, 7.5],
    "frontLoggiaEdge": [0, 6, 11],
    "backCoreWall": [0, 6, -7.5],
    "backGalleryEdge": [0, 6, -9.5],
    "backStairTowerEdge": [0, 6, -11],
    "towerJoin": [18, 0, 0],
    "towerCrownBase": [25, 27, 0],
    "roofDeck": [-7, 27, 0],
    "stairTowerA": [-22, 6, -9.25],
    "stairTowerB": [-4, 6, -9.25],
    "stairTowerC": [12, 6, -9.25],
    "lobbyDoor": [-5, 0, 11]
  },
  "joints": [],
  "parts": [
    {
      "id": "slabCore",
      "builds": "The solid mass of the residential slab, x[-32,18], y[6,27], z[-7.5,7.5], and its two end gables. Use several adjacent concrete boxes in different grey tones (concreteLight, concreteMid, concreteWarm), one per pour lift, with a thin shadowRecess cast joint between lifts every 3 m of height and board-marking strips on every face. Build the front wall (z=7.5) and back wall (z=-7.5) as plain concrete planes, with sliding-door and gallery-door openings left to the facade parts. Build a thin roof slab edge band at y=26.7-27. Add vertical expansion joints (shadowRecess strips) at x=-7 and x=3. Add tie-rod hole grids on the walls at both ends. Left gable x=-32 and right gable x=18, the latter partly hidden behind the tower: a large blank concrete wall with a tall narrow stair-light slit, a big white painted storey-number emblem built from small boxes, rain streaks (stain, mossStain) and a rust stain under the roof edge. Deep concreteDark soffit strip along the underside at y=6. Do not build loggias, galleries, fins, windows or panels. Those belong to the front and back facade parts.",
      "box": [[-32, 6, -7.5], [18, 27, 7.5]],
      "attaches": "Sits on the pilotis and transfer beams at pilotisTop (y=6). Its front wall at frontCoreWall (z=7.5) and back wall at backCoreWall (z=-7.5) are where the facade parts attach. Its roof top at slabRoofTop (y=27) is where the roof part stands. The right gable abuts the tower at towerJoin (x=18).",
      "joints": [],
      "floor": false,
      "budget": 120
    },
    {
      "id": "frontFacade",
      "builds": "The +Z loggia eggcrate, z[7.5,11], 10 bays by 7 storeys. Build concrete party fins, 0.35 m thick, at each of the 11 bay lines x=-32+5i, running full height y[6,27] and z[7.5,11], with board-marking strips and alternate tone variation. Build floor and ceiling slabs 0.35 m thick at each storey level y=6+3k (k=0..7), spanning the full width and projecting from z=7.5 to z=11, with a darker front-edge band and rain streaks down from slab edges. Inside each loggia, 4.65 m by 2.65 m, add a coloured painted back-wall panel just proud of z=7.5 (panelRed, panelOchre, panelBlue, panelWhite and panelGreen in a pseudo-random but deterministic pattern, about one in three loggias left raw concrete). Add a glazed sliding door in frameDark and glass with a glassLit interior on about one in four, and a solid timber door leaf. Add a metalRail balustrade at the slab front edge in about half the loggias, and a planter box with planterSoil and plantGreen in some. Add an occasional hanging laundry line or a chair block. Every bay at the top storey gets a deeper concreteDark shadow strip under the roof slab. A horizontal pair of thin signWhite house-number plates at the left end. Use boxes, not tubes, for rails (thin posts and a top bar).",
      "box": [[-32, 6, 7.5], [18, 27, 11]],
      "attaches": "Backs onto the core wall at frontCoreWall (z=7.5). The outer frame edge lies at frontLoggiaEdge (z=11). Its bottom slab sits at y=6 on the pilotis, and its top slab reaches y=27, where the roof parapet starts.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "backGalleries",
      "builds": "The -Z access side, z[-11,-7.5]. Build continuous gallery decks 0.4 m thick at each storey y=6+3k (k=0..7) projecting from z=-7.5 to z=-9.5, over x[-32,18]. Add 1.1 m solid concrete parapets on the outer edge with a metalRail top bar, board-marked and rain-stained. On the core wall behind, one entrance per 5 m bay: a timber door in frameDark with a small glassLit window beside it, a doormat or number plate in signWhite, and a thin concrete canopy slab over every other door. Between doors, a long high kitchen window in frameDark and glass. Build 3 full-height stair towers at x centres -22, -4 and 12, each 4.5 m wide, running y[6,27] and projecting to z=-11. They are heavy concrete (concreteDark and concreteMid) with tall narrow vertical slit windows (glass with a glassLit stripe) and a flat cantilevered cap slab at y=27, with board-marking and stains. Add connecting bridge decks at each tower where the gallery meets it, and a cluster of drainpipes (thin metalRail boxes) at the bay lines. Vertical rust streaks below the parapet fixings.",
      "box": [[-32, 6, -11], [18, 27, -7.5]],
      "attaches": "Backs onto the core wall at backCoreWall (z=-7.5). Gallery edge at backGalleryEdge (z=-9.5), stair-tower faces at backStairTowerEdge (z=-11). Bottom at y=6 on the pilotis, top at y=27 under the roof parapet.",
      "joints": [],
      "floor": false,
      "budget": 160
    },
    {
      "id": "groundStorey",
      "builds": "The open pilotis storey, y[0,6], x[-32,18], z[-11,11], resting on the floor. Build massive tapered piloti columns, each a pair of stacked frustums or chunky tapered boxes about 1.6 m by 3.2 m at the base and 2.4 m by 3.6 m at the top, with board-marking and rough concreteDark lower sections where splashed. Place them in two rows at z=-5.5 and z=5.5, at x=-27, -17, -7, 3 and 13, plus a heavier pair at each end. Add transfer beams at y[5,6] along each row and across between the rows (concreteMid), which fill the underside under the slab. A recessed glazed lobby box at x[-10,0], z[-5,5], y[0,4.6] with frameDark mullions, glass, a glassLit interior, a sign above the door and a timber double door. An entrance canopy slab projecting forward to z=11 at x[-10,0] and y=4.6-5, and wide concrete steps and a ramp with metalRail handrails at lobbyDoor. A low plinth strip along the front. Cycle store: a row of bike racks with simple wheel frames. Planter boxes with planterSoil and plantGreen. Two tall post lamps with glassLit heads. A big painted 'blok' lettering, or signWhite house number emblem, on a pier. Concrete splash stains and moss near the bottom of piers, and rain streaks.",
      "box": [[-32, 0, -11], [18, 6, 11]],
      "attaches": "Top face at y=6 (pilotisTop) carries the slab core, front facade and back galleries. The tower stands at towerJoin (x=18) immediately to its right. The lobby door is at lobbyDoor (x=-5, z=11).",
      "joints": [],
      "floor": true,
      "budget": 140
    },
    {
      "id": "serviceTower",
      "builds": "The freestanding concrete lift and stair tower at the left end, x[18,32], z[-7.5,7.5], y[0,31], resting on the floor and abutting the slab end gable at towerJoin (x=18). The shaft is a stacked set of boxes (different concrete tones and pour lifts, each 3 m) with board-marking, tie-rod grids, expansion joint strips and heavy rain and moss staining. The base is wider and darker (concreteDark) up to y=2. Vertical full-height glazed slits, glass with frameDark mullions and a stripe of glassLit, on the +Z face and on the +X end, with deep concreteDeep reveals. A projecting stair-landing bay on the front face: small cantilevered balconies, 1.5 m deep, at y=6,12,18 and 24, with solid parapets. Link bridges to the slab at y=6+3k, as short concrete decks between x=17 and x=19. The CROWN, y[27,31]: a heavy cantilevered concrete box on top overhanging the shaft by 0.8 m on the front and sides (a wide band of shadowRecess underneath), with a strip window ribbon and a flat roof slab, and a small signWhite emblem plus a red panelRed stripe on the +X face. A rooftop crane or lift motor box, 2 chimney stacks, a lightning rod (thin metalRail box, 1.5 m, no taller than y=31) and aviation lights as small glowing panelRed boxes. Rust streaks under the crown overhang.",
      "box": [[18, 0, -7.5], [32, 31, 7.5]],
      "attaches": "Its -X face meets the slab right gable at towerJoin (x=18). Its link decks align with the slab storey levels y=6+3k. Its crown base at towerCrownBase is y=27, flush with the slab roof level.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "roofTerrace",
      "builds": "Everything on the slab roof, y[27,31], x[-32,18], z[-9,9]. A continuous concrete parapet 1.2 m high (y 27 to 28.2) around the slab, set at z=±7.5 and x=-32 and 18, with a thin coping slab in concreteLight, board-marking, rain stains and scuppers (shadowRecess boxes) every 5 m with long vertical stains below. A flat roof deck in concreteMid with expansion joint lines. A vaulted concrete pavilion (a half-cylinder or arch-shaped barrel roof about 12 m long, 5 m wide, 3.5 m high) at x[-20,-8], with glazed end walls (glass and frameDark, glassLit inside) and chunky piers. A rectangular plant room with louvres at x[0,10], z[-4,4], 2.6 m high, and a water tank (a drum of metalRail with stair ladder and rust bands). 5 ventilation stacks of various heights, up to y=31, in concreteDark with cap slabs. A row of skylights, small pyramids or boxes in glass. A running track or sundeck ellipse is not needed. Add low wall benches, a few planters with plantGreen shrubs along the parapet, and a flagpole no taller than y=31. Rust and moss patches on the roof deck.",
      "box": [[-32, 27, -9], [18, 31, 9]],
      "attaches": "Stands on the slab roof at slabRoofTop (y=27). Its parapet follows the outer edge of the front facade top slab (z=11 is not covered, so the parapet stays at z≤7.5, or overhangs to z=11 only as a thin coping slab) and the back gallery top. Roof deck reference at roofDeck.",
      "joints": [],
      "floor": false,
      "budget": 110
    }
  ]
}
```

<!-- call: backGalleries -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBackGalleries({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      bone: undefined,
    });
  const X0 = -32, X1 = 18;
  const towers = [-22, -4, 12];
  const inTower = (x: number) => towers.some((t) => Math.abs(x - t) < 2.6);

  // decks, parapets, rails
  for (let k = 0; k < 8; k++) {
    const y = 6 + 3 * k;
    const tone = [P.concreteMid, P.concreteLight, P.concreteWarm][k % 3];
    box(X0, X1, y, y + 0.4, -9.5, -7.5, P.concreteDark);
    if (k < 7) {
      box(X0, X1, y + 0.4, y + 1.5, -9.5, -9.2, tone);
      box(X0, X1, y + 1.5, y + 1.58, -9.6, -9.1, P.metalRail);
      for (let i = 0; i < 4; i++) box(X0, X1, y + 0.7 + i * 0.25, y + 0.73 + i * 0.25, -9.52, -9.48, P.boardMark);
      // fixings rust streaks
      for (let i = 0; i < 10; i++) {
        const x = X0 + 2.5 + i * 5;
        if (inTower(x)) continue;
        box(x - 0.04, x + 0.04, y + 0.45, y + 1.4, -9.53, -9.5, P.rust);
        box(x + 1.3, x + 1.4, y + 0.4, y + 1.2, -9.53, -9.5, R() > 0.5 ? P.stain : P.mossStain);
      }
    }
  }

  // doors and windows per bay
  for (let k = 0; k < 7; k++) {
    const y = 6 + 3 * k;
    for (let i = 0; i < 10; i++) {
      const cx = X0 + 2.5 + i * 5;
      if (inTower(cx)) continue;
      const dx = cx - 1;
      box(dx - 0.6, dx + 0.6, y + 0.4, y + 2.5, -7.55, -7.4, P.frameDark);
      box(dx - 0.5, dx + 0.5, y + 0.4, y + 2.4, -7.6, -7.45, P.timber);
      box(dx + 0.7, dx + 1.1, y + 1.3, y + 2.2, -7.58, -7.45, P.glassLit);
      box(dx - 0.35, dx + 0.35, y + 0.4, y + 0.45, -8.4, -7.7, P.signWhite);
      box(dx - 0.2, dx + 0.2, y + 1.7, y + 1.9, -7.62, -7.5, P.signWhite);
      // kitchen window
      box(cx + 0.9, cx + 2.3, y + 1.4, y + 2.3, -7.55, -7.45, P.frameDark);
      box(cx + 0.98, cx + 2.22, y + 1.48, y + 2.22, -7.6, -7.5, R() > 0.4 ? P.glass : P.glassLit);
      if (i % 2 === 0) box(dx - 0.9, dx + 0.9, y + 2.55, y + 2.8, -8.6, -7.5, P.concreteLight);
    }
  }

  // drainpipes
  for (let i = 0; i <= 10; i++) {
    const x = X0 + 5 * i + (i === 10 ? -0.3 : 0.3);
    if (inTower(x)) continue;
    box(x - 0.06, x + 0.06, 6.4, 27, -9.45, -9.3, P.metalRail);
  }

  // stair towers
  for (const tx of towers) {
    const a = tx - 2.25, c = tx + 2.25;
    for (let k = 0; k < 7; k++) {
      const y0 = 6 + 3 * k;
      const tone = k % 2 ? P.concreteDark : P.concreteMid;
      box(a, c, y0, y0 + 3, -11, -9.5, tone);
      box(a, c, y0 + 2.95, y0 + 3, -11.03, -9.5, P.shadowRecess);
      for (let i = 0; i < 3; i++) box(a, c, y0 + 0.5 + i * 0.9, y0 + 0.53 + i * 0.9, -11.03, -10.7, P.boardMark);
      for (const s of [-1, 1]) {
        const sx = tx + s * 1.2;
        box(sx - 0.2, sx + 0.2, y0 + 0.4, y0 + 2.6, -11.05, -11, P.frameDark);
        box(sx - 0.14, sx + 0.14, y0 + 0.5, y0 + 2.5, -11.08, -11.04, P.glass);
        box(sx - 0.04, sx + 0.04, y0 + 0.6, y0 + 2.4, -11.1, -11.08, P.glassLit);
      }
      box(tx - 0.05, tx + 0.05, y0 + 0.3, y0 + 2.9, -11.06, -11.03, P.stain);
      // bridge to the core wall
      box(a, c, y0, y0 + 0.4, -9.5, -7.5, P.concreteDeep);
    }
    box(a - 0.3, c + 0.3, 27, 27.4, -11.3, -7.5, P.concreteLight);
    box(a - 0.3, c + 0.3, 26.8, 27, -11.3, -9.5, P.shadowRecess);
    box(a + 0.5, a + 0.7, 20, 26.8, -11.07, -11.03, P.mossStain);
  }
}
```

<!-- call: frontFacade -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildFrontFacade({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];
  const panels = [P.panelRed, P.panelOchre, P.panelBlue, P.panelWhite, P.panelGreen];
  const X0 = -32, Y0 = 6, Z0 = 7.5, Z1 = 11;

  // party fins
  for (let i = 0; i <= 10; i++) {
    const x = X0 + 5 * i;
    box(x - 0.175, Y0, Z0, x + 0.175, 27, Z1, tones[(i + 1) % 3]);
    for (let k = 0; k < 14; k++) {
      const y = Y0 + 0.75 + k * 1.5;
      box(x - 0.2, y, Z0 + 0.1, x + 0.2, y + 0.04, Z1 - 0.1, P.boardMark);
    }
    box(x - 0.05, 6.4, Z1, x + 0.05, 26.6, Z1 + 0.03, P.stain);
  }

  // slabs
  for (let k = 0; k <= 7; k++) {
    const y = Y0 + 3 * k;
    const y0 = k === 0 ? y : y - 0.175;
    const y1 = k === 7 ? y : y + 0.175;
    box(X0, y0, Z0, 18, y1 === y0 ? y0 + 0.2 : y1, Z1, tones[k % 3]);
    box(X0, y0, Z1 - 0.02, 18, y1 === y0 ? y0 + 0.2 : y1, Z1 + 0.03, P.concreteDark);
    box(X0, y0 + 0.08, Z0 + 0.1, 18, y0 + 0.12, Z1 - 0.1, P.boardMark);
    if (k > 0) for (let i = 0; i < 6; i++) {
      const sx = X0 + R() * 50;
      box(sx, y - 1.6 - R() * 0.8, Z1 + 0.02, sx + 0.12, y - 0.18, Z1 + 0.04, R() < 0.5 ? P.stain : P.mossStain);
    }
  }
  // top-storey shadow strip
  box(X0, 26.55, Z0 + 0.05, 18, 26.8, Z1 - 0.1, P.concreteDeep);

  // loggias
  for (let i = 0; i < 10; i++) for (let k = 0; k < 7; k++) {
    const cx = X0 + 5 * i + 2.5;
    const yb = Y0 + 3 * k + 0.175;
    const raw = R() < 0.33;
    const zb = Z0 + 0.03;
    if (!raw) box(cx - 2.3, yb, Z0, cx + 2.3, yb + 2.6, zb + 0.05, panels[Math.floor(R() * 5)]);
    if (R() < 0.27) {
      const dx = cx + (R() < 0.5 ? -1 : 1) * 0.8;
      box(dx - 0.9, yb, zb + 0.05, dx + 0.9, yb + 2.2, zb + 0.12, P.frameDark);
      box(dx - 0.8, yb + 0.1, zb + 0.12, dx + 0.8, yb + 2.1, zb + 0.16, R() < 0.4 ? P.glassLit : P.glass);
      box(dx - 0.02, yb + 0.1, zb + 0.16, dx + 0.02, yb + 2.1, zb + 0.2, P.frameDark);
    } else if (R() < 0.35) {
      box(cx + 1.2, yb, zb + 0.05, cx + 2.0, yb + 2.05, zb + 0.12, P.timber);
    }
    if (R() < 0.5) {
      const zr = Z1 - 0.1;
      box(cx - 2.3, yb + 1.05, zr - 0.02, cx + 2.3, yb + 1.1, zr + 0.03, P.metalRail);
      for (let p = 0; p <= 6; p++) {
        const px = cx - 2.25 + p * 0.75;
        box(px - 0.02, yb, zr - 0.02, px + 0.02, yb + 1.05, zr + 0.02, P.metalRail);
      }
    }
    if (R() < 0.3) {
      const px = cx + (R() < 0.5 ? -1.3 : 1.3);
      box(px - 0.6, yb, 9.4, px + 0.6, yb + 0.4, 10.0, P.planterSoil);
      box(px - 0.5, yb + 0.4, 9.5, px + 0.5, yb + 0.75, 9.9, P.plantGreen);
    } else if (R() < 0.12) {
      box(cx - 1.5, yb + 1.8, 10.5, cx + 1.5, yb + 1.83, 10.52, P.signWhite);
      box(cx - 1.2, yb + 1.3, 10.5, cx - 0.8, yb + 1.8, 10.52, P.panelBlue);
    } else if (R() < 0.12) {
      box(cx, yb, 10, cx + 0.45, yb + 0.45, 10.45, P.timber);
    }
  }
  // house number plates
  box(-31.6, 7.2, Z1 + 0.04, -30.4, 7.5, Z1 + 0.06, P.signWhite);
  box(-30.2, 7.2, Z1 + 0.04, -29.0, 7.5, Z1 + 0.06, P.signWhite);
}
```

<!-- call: slabCore -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildSlabCore({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];
  const X0 = -32, X1 = 18, Z = 7.5;

  // pour lifts, 7 storeys, each split in two tonal halves along x
  for (let k = 0; k < 7; k++) {
    const y0 = 6 + 3 * k + 0.04, y1 = 9 + 3 * k - 0.04;
    const cuts = [X0, -7, 3, X1];
    for (let i = 0; i < 3; i++) {
      box(cuts[i] + 0.03, y0, -Z, cuts[i + 1] - 0.03, y1, Z, tones[(k * 2 + i + (R() < 0.3 ? 1 : 0)) % 3]);
    }
    // cast joint between lifts (front, back, gables)
    if (k > 0) {
      const y = 6 + 3 * k;
      box(X0, y - 0.04, Z - 0.02, X1, y + 0.04, Z + 0.03, P.shadowRecess);
      box(X0, y - 0.04, -Z - 0.03, X1, y + 0.04, -Z + 0.02, P.shadowRecess);
      box(X0 - 0.03, y - 0.04, -Z, X0 + 0.02, y + 0.04, Z, P.shadowRecess);
      box(X1 - 0.02, y - 0.04, -Z, X1 + 0.03, y + 0.04, Z, P.shadowRecess);
    }
    // board marks on front and back walls
    for (let j = 0; j < 5; j++) {
      const y = y0 + 0.3 + j * 0.55;
      box(X0, y, Z, X1, y + 0.03, Z + 0.03, P.boardMark);
      box(X0, y, -Z - 0.03, X1, y + 0.03, -Z, P.boardMark);
    }
  }
  // soffit and roof edge band
  box(X0, 6, -Z, X1, 6.35, Z, P.concreteDeep);
  box(X0 - 0.1, 26.7, -Z - 0.1, X1 + 0.1, 27, Z + 0.1, P.concreteLight);
  box(X0 - 0.1, 26.5, -Z - 0.1, X1 + 0.1, 26.7, Z + 0.1, P.concreteDark);
  // expansion joints
  for (const x of [-7, 3]) {
    box(x - 0.05, 6.35, Z, x + 0.05, 26.7, Z + 0.04, P.shadowRecess);
    box(x - 0.05, 6.35, -Z - 0.04, x + 0.05, 26.7, -Z, P.shadowRecess);
  }

  // tie-rod grids on gables
  const disc = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6);
  for (const gx of [X0, X1]) {
    const s = gx < 0 ? -1 : 1;
    for (let iy = 0; iy < 9; iy++)
      for (let iz = 0; iz < 8; iz++) {
        if (gx === X0 && Math.abs(iz - 3.5) < 0.6 && iy > 0) continue;
        b.part(disc, P.shadowRecess, {
          at: [gx + s * 0.01, 7.2 + iy * 2.1, -6.3 + iz * 1.8],
          dir: [s, 0, 0],
        });
      }
  }
  // gable details
  for (const gx of [X0, X1]) {
    const s = gx < 0 ? -1 : 1;
    const o = gx + s * 0.04;
    // stair-light slit
    box(Math.min(gx, o) - 0.03 * (s > 0 ? 0 : 1), 8, 5.3, Math.max(gx, o) + 0.03, 25, 5.8, P.shadowRecess);
    box(gx + s * 0.02 - 0.02, 8.1, 5.4, gx + s * 0.02 + 0.02, 24.9, 5.7, P.glass);
    box(gx + s * 0.03 - 0.02, 8.1, 5.5, gx + s * 0.03 + 0.02, 24.9, 5.6, P.glassLit);
    // stains
    for (let i = 0; i < 9; i++) {
      const z = -6.8 + R() * 13, h = 3 + R() * 7;
      box(gx + (s > 0 ? 0 : -0.04), 26.4 - h, z, gx + (s > 0 ? 0.04 : 0), 26.4, z + 0.2 + R() * 0.3, R() < 0.5 ? P.stain : P.mossStain);
    }
    box(gx + (s > 0 ? 0 : -0.05), 25.2, -6, gx + (s > 0 ? 0.05 : 0), 26.5, 6, P.rust);
  }
  // storey-number emblem "7" on left gable (white small boxes), z in -4..-1
  const ex = X0 - 0.05;
  const seg = (z0: number, y0: number, z1: number, y1: number) =>
    box(ex, y0, z0, X0 + 0.01, y1, z1, P.signWhite);
  seg(-4.5, 22, -1.5, 22.7);
  seg(-2.2, 16, -1.5, 22.7);
  seg(-3.2, 18.5, -2.6, 19.2);
  // right-gable emblem
  box(X1, 22, -4.5, X1 + 0.05, 22.7, -1.5, P.signWhite);
  box(X1, 16, -2.2, X1 + 0.05, 22.7, -1.5, P.signWhite);

  // staining under roof band on front/back
  for (let i = 0; i < 24; i++) {
    const x = X0 + 1 + R() * 48, h = 2 + R() * 5;
    const sgn = R() < 0.5 ? 1 : -1;
    const zz = sgn * Z;
    box(x, 26.5 - h, Math.min(zz, zz + sgn * 0.02) , x + 0.2, 26.5, Math.max(zz, zz + sgn * 0.02) + 0.02, R() < 0.6 ? P.stain : P.mossStain);
  }
}
```

<!-- call: serviceTower -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildServiceTower({ b, P }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm, P.concreteMid, P.concreteLight];
  // base
  box(18, 0, -7.5, 32, 2, 7.5, P.concreteDark);
  // shaft lifts
  for (let i = 0; i < 9; i++) {
    const y0 = 2 + i * 3 - (i === 0 ? 0 : 0);
    const y1 = i === 8 ? 27 : y0 + 3;
    const c = tones[i % 5];
    box(18.5, y0, -7, 31.5, y1, 7, c);
    if (i > 0) {
      box(18.4, y0 - 0.04, -7.1, 31.6, y0 + 0.04, 7.1, P.shadowRecess);
    }
    // board marks
    for (let k = 0; k < 3; k++) {
      const y = y0 + 0.5 + k;
      if (y > 27) continue;
      box(18.5, y, 7, 31.5, y + 0.08, 7.03, P.boardMark);
      box(31.5, y, -7, 31.53, y + 0.08, 7, P.boardMark);
    }
  }
  // expansion joints
  for (const x of [22, 28]) box(x, 2, 7, x + 0.08, 27, 7.04, P.shadowRecess);
  // tie rod grid on +X face
  for (let z = -5; z <= 5; z += 2.5)
    for (let y = 4; y < 26; y += 3) {
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6), P.shadowRecess, {
        at: [31.52, y, z], dir: [1, 0, 0],
      });
    }
  // glazed slits front and end
  const slit = (x: number, z: number, onFront: boolean) => {
    const sx = onFront ? 0.9 : 0.1, sz = onFront ? 0.1 : 0.9;
    box(x - sx - 0.2, 3, z - sz - 0.2, x + sx + 0.2, 26, z + sz + 0.2, P.concreteDeep);
    box(x - sx, 3, z - sz + (onFront ? 0.15 : 0), x + sx, 26, z + sz + (onFront ? 0.15 : 0), P.glass);
    box(x - 0.1, 3.5, z + (onFront ? 0.28 : 0), x + 0.1, 25.5, z + (onFront ? 0.28 : 0) + (onFront ? 0.05 : 0), P.glassLit);
    for (let y = 6; y < 26; y += 4)
      box(x - sx, y, z + (onFront ? 0.3 : 0.1), x + sx, y + 0.1, z + (onFront ? 0.4 : 0.3), P.frameDark);
  };
  slit(25, 7, true);
  slit(31.5, 0, false);
  // balconies
  for (const y of [6, 12, 18, 24]) {
    box(20, y - 0.2, 7, 24, y + 0.1, 8.5, P.concreteDark);
    box(20, y + 0.1, 8.3, 24, y + 1.1, 8.5, P.concreteMid);
    box(20, y + 0.1, 7, 20.2, y + 1.1, 8.5, P.concreteMid);
    box(23.8, y + 0.1, 7, 24, y + 1.1, 8.5, P.concreteMid);
    box(20.5, y - 0.6, 8.4, 20.7, y - 0.2, 8.45, P.stain);
  }
  // link bridges
  for (let k = 0; k < 8; k++) {
    const y = 6 + 3 * k;
    if (y > 27) break;
    box(17, y, -1.5, 19, y + 0.35, 1.5, P.concreteDark);
  }
  // crown
  box(17.2, 27, -8.3, 32.8, 27.5, 8.3, P.shadowRecess);
  box(17.2, 27.5, -8.3, 32.8, 31, 8.3, P.concreteWarm);
  box(17.2, 30.7, -8.3, 32.8, 31, 8.3, P.concreteLight);
  box(18, 28.6, 8.3, 32, 29.6, 8.36, P.frameDark);
  box(18, 28.7, 8.36, 32, 29.5, 8.4, P.glassLit);
  for (let x = 19; x < 32; x += 2) box(x, 28.6, 8.36, x + 0.12, 29.6, 8.44, P.frameDark);
  box(32.8, 29.2, -2, 32.86, 30.2, 2, P.signWhite);
  box(32.8, 28.2, -8, 32.86, 28.6, 8, P.panelRed);
  // rust under overhang
  for (let i = 0; i < 6; i++) {
    const x = 19 + R() * 12;
    box(x, 24 + R(), 8.31, x + 0.2, 27, 8.34, P.rust);
  }
  // rain stains
  for (let i = 0; i < 8; i++) {
    const x = 19 + R() * 12;
    box(x, 8 + R() * 8, 7.02, x + 0.3, 14 + R() * 8, 7.05, i % 2 ? P.mossStain : P.stain);
  }
  // motor box, stacks, rod
  box(26, 31, -3, 30, 31 + 0.001, 3, P.concreteDark);
  box(22, 31, -4, 24, 31.001, -2, P.concreteDark);
  box(19, 30.9, 3, 21, 31, 5, P.concreteDark);
  box(18.5, 31, 3, 18.7, 31, 3.2, P.metalRail);
  // aviation lights and rod (kept inside y<=31)
  for (const [x, z] of [[18.5, -7.8], [32.4, 7.8]])
    box(x - 0.2, 30.6, z - 0.2, x + 0.2, 31, z + 0.2, P.panelRed);
  box(25, 29.5, -0.05, 25.1, 31, 0.05, P.metalRail);
}
```

<!-- call: roofTerrace -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildRoofTerrace({ b, P }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      bone: undefined,
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm, P.concreteDark];

  // roof deck
  box(-32, 26.95, -7.5, 18, 27.05, 7.5, P.concreteMid);
  for (let i = 0; i < 9; i++) box(-27 + i * 5 - 0.02, 27.05, -7.4, -27 + i * 5 + 0.02, 27.07, 7.4, P.shadowRecess);
  // rust and moss patches
  for (let i = 0; i < 8; i++) {
    const x = -30 + R() * 46, z = -6 + R() * 12;
    box(x, 27.05, z, x + 1 + R() * 1.5, 27.065, z + 0.8 + R(), i % 2 ? P.mossStain : P.rust);
  }

  // parapet: long sides in segments with varied tones
  for (const z of [7.5, -7.5]) {
    const s = z > 0 ? 1 : -1;
    for (let i = 0; i < 10; i++) {
      const x0 = -32 + i * 5;
      box(x0, 27, z - 0.2, x0 + 5, 28.2, z + 0.2, tones[(i + (s > 0 ? 0 : 1)) % 3]);
      for (let k = 0; k < 4; k++) box(x0, 27.2 + k * 0.28, z + s * 0.2, x0 + 5, 27.23 + k * 0.28, z + s * 0.215, P.boardMark);
      box(x0 + 2.4, 27.0, z + s * 0.2, x0 + 2.7, 28.0, z + s * 0.23, P.shadowRecess); // scupper
      box(x0 + 2.45, 27.0, z + s * 0.2, x0 + 2.6, 28.0, z + s * 0.22, P.stain);
    }
    box(-32.1, 28.2, z - 0.3, 18.1, 28.35, z + 0.3, P.concreteLight);
  }
  for (const x of [-32, 18]) {
    const s = x < 0 ? 1 : -1;
    box(x - (s > 0 ? 0 : 0.4) , 27, -7.7, x + (s > 0 ? 0.4 : 0), 28.2, 7.7, P.concreteMid);
    box(x - 0.1, 28.2, -7.8, x + 0.1 + 0.3, 28.35, 7.8, P.concreteLight);
  }

  // vaulted pavilion x[-20,-8]
  for (const x of [-20, -8.6]) for (const z of [-2.5, 2.2]) box(x, 27, z, x + 0.6, 29.2, z + 0.3, P.concreteDark);
  const vault = new THREE.CylinderGeometry(2.5, 2.5, 12, 14, 1, false, 0, Math.PI);
  b.part(vault, P.concreteWarm, { at: [-14, 29.2, 0], rotation: [0, 0, 90], flat: true } as any);
  // rotation puts half-cylinder arching up: rotate about Z then fix orientation
  for (const x of [-19.9, -8.1]) {
    box(x - 0.05, 27, -2.2, x + 0.05, 29.2, 2.2, P.frameDark);
    box(x - 0.08 * Math.sign(x + 14), 27.4, -1.9, x + 0.02, 28.9, 1.9, P.glassLit);
    box(x - 0.02, 27.2, -2.0, x + 0.04, 29.1, 2.0, P.glass);
  }
  box(-20.3, 29.0, -2.7, -7.7, 29.2, 2.7, P.concreteLight);

  // plant room x[0,10]
  box(0, 27, -4, 10, 29.6, 4, P.concreteMid);
  box(-0.2, 29.6, -4.2, 10.2, 29.8, 4.2, P.concreteLight);
  for (let i = 0; i < 10; i++) box(1 + i * 0.8, 27.6, 4, 1.6 + i * 0.8, 29, 4.06, P.frameDark);
  box(4.2, 27, 3.98, 5.8, 28.7, 4.05, P.timber);

  // water tank
  const tank = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 10);
  b.part(tank, P.metalRail, { at: [14, 28.6, -3], flat: true } as any);
  for (const y of [27.9, 29.3]) b.part(new THREE.CylinderGeometry(1.43, 1.43, 0.12, 10), P.rust, { at: [14, y, -3], flat: true } as any);
  for (const x of [12.9, 15.1]) for (const z of [-4.1, -1.9]) box(x - 0.08, 27, z - 0.08, x + 0.08, 27.5, z + 0.08, P.metalRail);
  box(15.35, 27, -3.1, 15.45, 29.6, -2.9, P.metalRail);
  for (let i = 0; i < 9; i++) box(15.3, 27.3 + i * 0.28, -3.1, 15.5, 27.34 + i * 0.28, -2.9, P.metalRail);

  // ventilation stacks
  const st = [[-29, -5, 3.2], [-25, 4, 2.4], [-3, -6, 3.8], [13, 5, 2.8], [16, -6, 3.0]];
  st.forEach(([x, z, h]) => {
    box(x - 0.45, 27, z - 0.45, x + 0.45, 27 + h, z + 0.45, P.concreteDark);
    box(x - 0.65, 27 + h, z - 0.65, x + 0.65, 27 + h + 0.2, z + 0.65, P.concreteLight);
    box(x - 0.2, 27, z + 0.45, x + 0.2, 27 + h, z + 0.48, P.stain);
  });

  // skylights
  for (let i = 0; i < 6; i++) {
    const x = -5 + i * 0 + 0, z = 0;
    void x; void z;
    const px = -30 + i * 2.2;
    b.part(new THREE.ConeGeometry(0.9, 0.7, 4), P.glass, { at: [px, 27.45, 0], rotation: [0, 45, 0], flat: true } as any);
    box(px - 0.65, 27.05, -0.65, px + 0.65, 27.15, 0.65, P.frameDark);
  }

  // benches and planters
  for (const x of [-4, 12, 16]) {
    box(x, 27, 6, x + 2, 27.45, 6.8, P.concreteWarm);
  }
  for (let i = 0; i < 5; i++) {
    const x = -28 + i * 4.2 + 2;
    box(x, 27, 6.1, x + 1.6, 27.6, 7.2, P.concreteDark);
    box(x + 0.1, 27.6, 6.2, x + 1.5, 27.7, 7.1, P.planterSoil);
    box(x + 0.2, 27.7, 6.3, x + 1.4, 28.4, 7.0, P.plantGreen);
  }

  // flagpole
  box(16.9, 27, 6.4, 17.0, 31, 6.5, P.metalRail);
  box(17.0, 30.2, 6.43, 18, 30.9, 6.47, P.panelRed);
}
```

<!-- call: groundStorey -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildGroundStorey({ b, P, M }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];

  // piloti columns: stacked tapered pieces with board marks, splash base, moss
  const colX = [-31, -27, -17, -7, 3, 13, 17];
  const heavy = (x: number) => x === -31 || x === 17;
  for (const z of [-5.5, 5.5]) {
    colX.forEach((x, i) => {
      const w0 = heavy(x) ? 2.0 : 1.6, w1 = heavy(x) ? 2.8 : 2.4;
      const d0 = heavy(x) ? 3.6 : 3.2, d1 = heavy(x) ? 4.0 : 3.6;
      const tone = tones[(i + (z > 0 ? 1 : 0)) % 3];
      // lower splashed frustum
      const lo = new THREE.CylinderGeometry(1, 1, 1, 4, 1).toNonIndexed();
      b.part(new THREE.BoxGeometry(w0 + 0.1, 1.2, d0 + 0.1), P.concreteDark, { at: [x, 0.6, z] });
      // tapered shaft using frustum from box-like cylinder (4 sides rotated 45deg)
      const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, 1, 4, 1);
      g.rotateY(Math.PI / 4);
      const shaft1 = new THREE.CylinderGeometry(1, 1, 1, 4);
      shaft1.rotateY(Math.PI / 4);
      const tp = (h: number, a0: number, b0: number, a1: number, b1: number, y: number, c: string) => {
        const geo = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, h, 4);
        geo.rotateY(Math.PI / 4);
        const p = geo.getAttribute("position");
        for (let k = 0; k < p.count; k++) {
          const top = p.getY(k) > 0;
          p.setX(k, p.getX(k) * (top ? a1 : a0));
          p.setZ(k, p.getZ(k) * (top ? b1 : b0));
        }
        geo.computeVertexNormals();
        b.part(geo, c, { at: [x, y, z], flat: true });
      };
      tp(2.4, w0 + 0.1, d0 + 0.1, w0 + (w1 - w0) * 0.45, d0 + (d1 - d0) * 0.45, 2.4, tone);
      tp(2.4, w0 + (w1 - w0) * 0.45, d0 + (d1 - d0) * 0.45, w1, d1, 4.8, tones[(i + 1) % 3]);
      // board marks on front face
      for (let k = 0; k < 8; k++) {
        const y = 1.4 + k * 0.5, t = (y - 1.2) / 4.8;
        const w = w0 + (w1 - w0) * t;
        const d = d0 + (d1 - d0) * t;
        box(x - w / 2 * 0.9, y, z + d / 2 - 0.03, x + w / 2 * 0.9, y + 0.04, z + d / 2 + 0.02, P.boardMark);
      }
      // moss splash
      box(x - w0 / 2, 1.2, z + d0 / 2 + 0.01, x - w0 / 2 + 0.4, 1.9, z + d0 / 2 + 0.04, P.mossStain);
      // stain streak
      box(x + 0.2, 2.0, z + d0 / 2 + 0.05, x + 0.3, 4.6, z + d0 / 2 + 0.07, P.stain);
    });
  }

  // transfer beams
  for (const z of [-5.5, 5.5]) box(-32, 5, z - 0.8, 18, 6, z + 0.8, P.concreteMid);
  for (const x of colX) box(x - 0.6, 5, -5.5, x + 0.6, 6, 5.5, P.concreteMid);
  box(-32, 5.6, -11, 18, 6, 11, P.concreteDark);
  // plinth strip
  box(-32, 0, 10.6, 18, 0.3, 11, P.concreteDeep);

  // lobby
  box(-10, 0, -5, 0, 0.1, 5, P.concreteDeep);
  box(-10, 0.1, -5, 0, 4.6, -4.8, P.concreteWarm);
  box(-10, 0.1, -5, -9.8, 4.6, 5, P.concreteWarm);
  box(-0.2, 0.1, -5, 0, 4.6, 5, P.concreteWarm);
  box(-9.9, 0.1, 4.6, -0.1, 4.6, 4.8, P.glass);
  box(-9.9, 0.2, 4.6, -0.1, 4.5, 4.7, P.glass);
  box(-9.8, 0.2, 4.7, -0.2, 4.5, 4.75, P.glassLit);
  for (let i = 0; i <= 8; i++) box(-9.9 + i * 1.2, 0.1, 4.75, -9.8 + i * 1.2, 4.6, 4.9, P.frameDark);
  box(-9.9, 2.3, 4.75, -0.1, 2.4, 4.9, P.frameDark);
  box(-5.9, 0.1, 4.8, -5.1, 2.5, 4.95, P.timber);
  box(-4.9, 0.1, 4.8, -4.1, 2.5, 4.95, P.timber);
  box(-7.5, 3.3, 4.95, -2.5, 4.1, 5.0, P.signWhite);
  box(-7.2, 3.5, 5.0, -2.8, 3.9, 5.05, P.frameDark);
  // canopy
  box(-10, 4.6, 4.6, 0, 5, 11, P.concreteLight);
  box(-10, 4.6, 10.8, 0, 5, 11, P.concreteDark);
  // steps
  for (let i = 0; i < 4; i++) box(-8, i * 0.15, 5 + i * 0.8, -2, (i + 1) * 0.15 , 5.8 + i * 0.8 + 0.8 - 0.8, P.concreteLight);
  for (let i = 0; i < 4; i++) box(-8, 0, 5.8 + i * 0.8, -2, (4 - i) * 0.15, 6.6 + i * 0.8, P.concreteLight);
  // ramp
  b.part(new THREE.BoxGeometry(1.8, 0.2, 7), P.concreteMid, { at: [-0.9 + 1.9, 0.3, 8.6], rotation: [-5, 0, 0] });
  for (const x of [1, 2.9]) {
    box(x - 0.04, 0.4, 5.2, x + 0.04, 1.2, 5.3, P.metalRail);
    box(x - 0.04, 0.4, 11, x + 0.04, 0.8, 11.1, P.metalRail);
    box(x - 0.04, 1.1, 5.2, x + 0.04, 1.2, 11, P.metalRail);
  }
  for (const x of [-8.3, -1.7]) {
    box(x - 0.04, 0.2, 5.5, x + 0.04, 1.2, 5.6, P.metalRail);
    box(x - 0.04, 1.1, 5.5, x + 0.04, 1.2, 8.8, P.metalRail);
    box(x - 0.04, 0.2, 8.7, x + 0.04, 1.2, 8.8, P.metalRail);
  }

  // bike racks
  for (let i = 0; i < 6; i++) {
    const x = -26 + i * 1.2;
    box(x, 0, -9.5, x + 0.05, 0.9, -9.45, P.metalRail);
    box(x + 0.7, 0, -9.5, x + 0.75, 0.9, -9.45, P.metalRail);
    for (const dx of [0.1, 0.6]) {
      const w = new THREE.TorusGeometry(0.33, 0.03, 4, 12);
      b.part(w, P.frameDark, { at: [x + dx, 0.36, -9.6], rotation: [0, 90, 0] });
    }
    box(x - 0.02, 0.9, -9.6, x + 0.78, 0.95, -9.55, P.metalRail);
  }

  // planters
  [[-14, 10], [-12.5, 10], [6, 10], [7.5, 10], [-20, 9.8]].forEach(([x, z]) => {
    box(x - 0.7, 0, z - 0.4, x + 0.7, 0.7, z + 0.4, P.concreteDark);
    box(x - 0.6, 0.7, z - 0.3, x + 0.6, 0.78, z + 0.3, P.planterSoil);
    for (let k = 0; k < 4; k++)
      b.part(new THREE.IcosahedronGeometry(0.28 + R() * 0.1, 0), P.plantGreen, {
        at: [x - 0.45 + k * 0.3, 1.0 + R() * 0.1, z + (R() - 0.5) * 0.3],
      });
  });

  // post lamps
  for (const x of [-12, 2.5]) {
    box(x - 0.06, 0, 9.4, x + 0.06, 3.8, 9.52, P.metalRail);
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.4), P.glassLit, { at: [x, 4.0, 9.46] });
    box(x - 0.25, 4.2, 9.26, x + 0.25, 4.28, 9.66, P.frameDark);
  }

  // emblem on pier: "blok" in small boxes
  const px = -17, pz = 5.5 + 1.8 + 0.05;
  box(px - 1.1, 2.0, pz - 0.03, px + 1.1, 3.6, pz + 0.02, P.concreteDeep);
  const bar = (x: number, y: number, w: number, h: number) =>
    box(px + x, 2.1 + y, pz + 0.02, px + x + w, 2.1 + y + h, pz + 0.06, P.signWhite);
  // b
  bar(-0.95, 0, 0.1, 1.3); bar(-0.95, 0, 0.35, 0.1); bar(-0.95, 0.6, 0.35, 0.1); bar(-0.7, 0, 0.1, 0.7);
  // l
  bar(-0.4, 0, 0.1, 1.3); bar(-0.4, 0, 0.3, 0.1);
  // o
  bar(0.05, 0, 0.35, 0.1); bar(0.05, 0.6, 0.35, 0.1); bar(0.05, 0, 0.1, 0.7); bar(0.3, 0, 0.1, 0.7);
  // k
  bar(0.6, 0, 0.1, 0.7); bar(0.7, 0.3, 0.3, 0.1); bar(0.85, 0.4, 0.1, 0.3); bar(0.85, 0, 0.1, 0.3);

  // rain streaks under the slab edge and mid beams
  for (let i = 0; i < 12; i++) {
    const x = -30 + i * 4.2 + R();
    box(x, 3.5, 10.9, x + 0.12, 5, 10.95, P.stain);
  }
  void M;
}
```