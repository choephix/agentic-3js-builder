<!-- call: plan -->

```json
{
  "name": "Brutalist Housing Block",
  "description": "A raw board-marked concrete slab-block of 88 loggia apartments on massive tapered pilotis, with rear access galleries, three stair and lift towers, a glazed lobby, and a sculptural rooftop terrace, in the style of Le Corbusier's Unité d'Habitation.",
  "builderName": "brutalistHousingBlock",
  "size": [46, 34, 21],
  "layout": "Static model, no joints. The long slab runs along X (x from -22.8 to 22.8, about 45.6 m wide) and is 14 m deep (z from -7 to 7). The front facade faces +Z. The slab rests on 5 m tall tapered concrete pilotis (y 0..5) and has 8 residential storeys above (y 5..29), then a roof slab (y 29..29.5) with a low parapet (to y 30.2) and the rooftop terrace on top (to y 34 at the mast).\n\nMASTER GRID, which every builder must use. There are 11 bays of 4 m. Bay i (i = 0..10) spans x from -22+4i to -18+4i, so its centre is x = -20+4i. Bay edges, where the cross walls stand, are at x = -22, -18, -14, -10, -6, -2, 2, 6, 10, 14, 18, 22. Storey k (k = 0..7) has base y = 5+3k. Its floor slab occupies y = 5+3k .. 5+3k+0.35, and the finished floor is 5+3k+0.35. The storey top is 5+3k+3. The front face has loggias: the slab edge is at z = +7 and the recessed loggia back wall is at z = +5 (2 m deep). The rear face has open access galleries: the slab edge is at z = -7 and the rear wall is at z = -5 (2 m deep walkway).\n\nSolid concrete core fill is at x ±21.6, z ±5, y 5..29, so there is no hollow behind the facade planes.\n\nStair towers: left tower centred at x=+10 and right tower at x=-10, each 5 m wide (x centre ±2.5) and z -11.5..-7, rising from y=0 to 31.4. A central lift tower sits at x -1.5..1.5, z -9.5..-7, y 0..31.0. All three abut the rear gallery edge at z=-7.\n\nSTYLE: raw béton brut everywhere. Large chunky masses, deep shadowed recesses, board-marked formwork lines (thin darker horizontal strips on big concrete faces), tie-hole dots, rain-stain streaks running down from slab edges and scuppers, and moss and rust at the base and under drips. Colour is rationed: Corbusier-style polychrome primary panels (red, yellow, blue, green, ochre, white) appear only in the loggia side walls and back panels, the rear doors and the gable mural. Windows glow warm in a scattered handful. Every surface is one flat colour, so build all details as small parts seated 1-3 cm proud of the surface.\n\nPART COUNT RULE FOR ALL BUILDERS: many repeated identical pieces (bays, storeys, doors, ties, streaks) must be merged per colour with mergeGeometries after translating each copy into model space, then added as ONE part per colour with b.part(merged, color, { at: [0,0,0] }). This keeps the part count within each budget. Use SDK extrude, lathe and sweep for the sculptural pieces (pilotis, vaults, stacks, trees). Use rng(seed) for any variation.",
  "palette": {
    "concrete": "#9a9892",
    "concreteDark": "#6f6d69",
    "concreteLight": "#b5b2aa",
    "concreteStain": "#7e7b75",
    "boardLine": "#85837d",
    "tieHole": "#4a4846",
    "shadow": "#4d4b49",
    "glass": "#6f8fa0",
    "glassDark": "#2f4552",
    "glassLit": "#f2d68a",
    "steel": "#2a2c2e",
    "panelRed": "#b8372a",
    "panelYellow": "#e0b020",
    "panelBlue": "#2f5f9a",
    "panelGreen": "#4f7d4a",
    "panelWhite": "#e8e4d8",
    "panelOchre": "#c8782e",
    "planterGreen": "#4c7a38",
    "soil": "#4a3a2c",
    "moss": "#59684a",
    "rust": "#8a5030",
    "gravel": "#8b8880",
    "lamp": "#fff0b8",
    "deckWood": "#7a5a3a"
  },
  "mounts": {
    "podiumTop": [0, 5, 0],
    "frontFace": [0, 5, 7],
    "frontWall": [0, 5, 5],
    "rearWall": [0, 5, -5],
    "rearEdge": [0, 5, -7],
    "roofSlabTop": [0, 29.5, 0],
    "roofParapetTop": [0, 30.2, 0],
    "towerL": [10, 0, -9.25],
    "towerR": [-10, 0, -9.25],
    "liftTower": [0, 0, -8.25],
    "entrance": [0, 0, 3.5],
    "gableL": [22.8, 17, 0],
    "gableR": [-22.8, 17, 0]
  },
  "joints": [],
  "parts": [
    {
      "id": "podium",
      "builds": "Ground level, y 0..5, under the slab, with the front plaza elements.\n\n(1) Twelve tapered pilotis at x = ±22, ±14, ±6 and z = +4.5 and -4.5. Each is a chunky concrete column about 1.2 m wide at the foot flaring to 1.9 m wide at y=5, 1.4 m deep at the foot and 1.8 m deep at the top. Build them with extrude or frustumBox in the concrete colour. Give each a dark concreteDark plinth foot 0.3 m high, a bulky haunch at the top, 3-4 horizontal boardLine strips on each face, tie-hole dots, rain-stain streaks in concreteStain, and a moss patch at the foot. The end pilotis at x=±22 are wider (to x=±23, a 2 m wide pier) and serve as end buttresses.\n\n(2) A raised glazed lobby box at x -4.5..4.5, z -3..3.5, y 0..4.3 on a 0.45 m high concreteLight plinth. It has a steel-framed glass front wall at z=3.5 with a mullion every 0.9 m, a central double door, a deep concrete surround frame, a lit interior (glassLit panes in places and glassDark in others), a roof edge in concreteLight, a bold mail-box wall in panelYellow and steel, and a black steel sign bar over the door.\n\n(3) A projecting entrance canopy: a flat slab at x -6..6, z 3.5..9, y 4.0..4.4 in concrete with a concreteDark underside strip, held by two stout rectangular piers at x=±5.5, z=8.6. Hanging lamp discs (lamp colour) are set under it.\n\n(4) Four wide concrete steps from z 3.5 to 9.5, each 0.12 m high, in concreteLight with shadow risers, plus concrete cheek walls.\n\n(5) Two glazed shop or community units at x ±(8..13), z -3..3, y 0..3.6. Each has steel mullions, a coloured fascia (panelRed on the left unit, panelBlue on the right), and a canopy slab.\n\n(6) Low concrete planters along the front at z 6.5..8, x ±(8..20), with soil tops and planterGreen shrub blobs. Add a few bollards, 2 lamp posts (steel with lamp heads), and a bike rack in steel.\n\nStay clear of the slab and rear zone. Tower bases belong to the back part.",
      "box": [[-23, 0, -6], [23, 5, 9.5]],
      "attaches": "Pilotis tops end at podiumTop (y=5), where the frame's first floor slab begins. The entrance and steps are centred on the entrance mount. Rear pilotis stop at z=-5.4, short of the back part's towers (z < -7).",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "frame",
      "builds": "The structural concrete skeleton of the residential slab from y=5 to y=30.3.\n\n(1) Eight floor slabs, k=0..7, each x ±22.6, z -7..7, y 5+3k .. 5+3k+0.35, in concrete. Add a thin boardLine strip along each front and rear fascia, and a darker shadow groove line under the slab edges.\n\n(2) The roof slab: x ±22.8, z ±7.1, y 29..29.5, in concreteLight, with a shadow underside strip.\n\n(3) Ten interior cross walls at bay edges x = -18, -14, ..., 18 (thickness 0.4, z from -5 to 7, y from the slab top to the next slab bottom). Merge them. The tops, bottoms and inner faces in the loggias get boardLine strips every 0.3 m.\n\n(4) Two gable end walls, 0.8 m thick (x from 21.8 to 22.6 on the left, mirrored on the right), z -7..7, y 5..29.5. Give them vertical ribs 0.2 m proud at z = every 1.4 m, in concreteDark. They also carry boardLine horizontal courses, a grid of tieHole dots, tall dark slit windows (shadow colour, 0.3 x 3 m) at z=±5.5 on a few storeys, and a big abstract relief mural on each outer face at x=±22.65: z -4..4, y 8..26, made of 5-6 thin plates and one disc in panelRed, panelYellow, panelBlue and panelWhite in modulor-like composition.\n\n(5) The solid core fill block: x ±21.6, z ±5, y 5..29, in concreteDark. Merge pieces freely.\n\n(6) The roof parapet: walls 0.4 thick and 0.7 high (y 29.5..30.2) around the perimeter at z=±6.8 and x=±22.4, with a concreteLight cap strip, a moss strip on top, and 6 chunky square scuppers (0.4 x 0.4 x 0.6) projecting from the front and rear parapet faces at x = ±4, ±12, ±20, each with a long rain-stain streak running down the fascia in concreteStain, to about 1.5 m.\n\n(7) Weathering: vertical stain streaks and a few rust drips under scuppers and slab edges, in concreteStain, rust and moss.",
      "box": [[-23, 5, -7], [23, 30.3, 7.1]],
      "attaches": "The bottom sits on podiumTop (y=5). The front facade part fills the loggia recesses between frontWall (z=5) and frontFace (z=7). The back part fills the gallery zone from rearWall (z=-5) to rearEdge (z=-7). The roof part stands on roofSlabTop (y=29.5) inside the parapet.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "frontFacade",
      "builds": "Everything in the 88 front loggias: bays i=0..10 and storeys k=0..7, in z 5..7.05 on the +Z side. Use the master grid. Let b0 = 5+3k+0.35. Merge repeated pieces per colour.\n\n(a) A balcony parapet panel across each bay front: x edge±0.2, z 6.8..7.0, y b0..b0+1.0, in concrete with a concreteLight cap strip, and 2 boardLine lines. A few parapets (rng seed 11, about 1 in 6) carry a planter box, soil plus planterGreen blobs on top.\n\n(b) Polychrome side walls: on the cross wall faces inside each loggia, thin 0.05 panels at z 5..6.8, y b0..b0+2.7. Each bay gets its left or right side wall painted, and alternate bays use the other side, in a rng-picked colour from panelRed, panelYellow, panelBlue, panelGreen, panelWhite and panelOchre. The other side stays bare concrete.\n\n(c) Back wall of each loggia (z=5): a recessed panel 3.3 x 2.6 m (z 5.0..5.06) in concreteLight or a polychrome colour (about 1 in 3 bays, rng).\n\n(d) A window and door set into the back wall: a window 2.0 wide x 1.4 high at x = bay centre - 0.7 with a sill at b0+0.9, in a steel frame 0.06 proud (z up to 5.12) with a glass pane (glass colour; about 1 in 8 panes use glassLit as lit windows, and a few glassDark). A balcony door 0.9 x 2.2 at x = bay centre + 1.2, in a steel frame with glass. Add steel mullions.\n\n(e) Sunscreen details: on storeys 5-7 of every other bay, a deep concrete brise-soleil of 3 horizontal blades (z 6.4..7.0 deep, 0.08 thick, 3.4 wide) under the slab above. Add a vertical concrete fin (0.15 x full height x 0.8 deep) at the centre of every 4th bay.\n\n(f) Fine details: small lamp discs (lamp colour) beside the doors, a few hanging laundry or plant pots as tiny colour boxes, and occasional dark shadow slabs lining the loggia ceilings (shadow colour, 3.6 x 0.02 x 2).\n\nDo NOT rebuild the slabs or cross walls (the frame owns them).",
      "box": [[-22.6, 5.35, 5], [22.6, 29, 7.05]],
      "attaches": "The back wall sits on the frame core face at frontWall z=5. The parapets sit flush with the slab edge at frontFace z=7. It fits between the frame's slabs (storey base y=5+3k+0.35 up to 5+3k+3) and the cross walls.",
      "joints": [],
      "floor": false,
      "budget": 200
    },
    {
      "id": "backGallery",
      "builds": "The whole rear side, z from -5 to -11.5, y 0..31.8.\n\n(1) The rear access galleries on all 8 storeys. The walkway is the frame's slab. This part builds the 0.3 thick parapets at z -6.95..-6.65, y b0..b0+1.1, in concrete with a concreteLight cap and a steel rail on top. The parapets run the length x ±22 but leave gaps at the towers (x within 7.5..12.5 and -12.5..-7.5, and x within ±1.5). Build square piers 0.4 x 0.4 at z=-6.8, full storey height, at x = ±22, ±14, ±6, in concrete.\n\n(2) The rear wall cladding at z=-5.0..-5.05 over the core, in concreteLight, plus per bay and storey a door 0.95 x 2.1 at x = bay centre + 1.0 in a rotating colour (panelRed, panelYellow, panelBlue, panelGreen, panelOchre, panelWhite, rng seed 23) with a steel frame and a small lamp disc above in the lamp colour. Add a kitchen window 1.0 x 1.0 at x = bay centre - 1.0, sill 1.1 above b0 (glass, with an occasional glassLit), and a mail slot or letter plate. Cross walls are NOT drawn here. The frame owns them.\n\n(3) The two stair towers at towerL and towerR: x centre ±10, width 5, z -11.5..-7, y 0..31.4, in concrete with a boardLine pattern every 0.3 m, tie-hole grids, and stain streaks. Each tower has a tall glazed slot 1.0 wide on the rear face (z=-11.5) running y 1..30, in glassDark, with thin steel diagonal stair stringers and landing lines visible every storey. Add concrete fins on either side. Each storey has a doorway opening, a dark shadow rectangle 1.2 x 2.2 in shadow, on the face toward the gallery at z=-7.02. Each tower has a roof cap slab at y 31.4..31.8 with a 0.3 overhang in concreteLight. A big block numeral built from boxes (1 on the right tower, 2 on the left) in panelRed stands at y 25..28 on the rear face. The ground floor has a steel double door and a canopy slab.\n\n(4) The lift tower at liftTower (x -1.5..1.5, z -9.5..-7, y 0..31.0), narrower and taller, in concreteDark. It has a vertical glass slit window in glassDark and one panelYellow band on its upper stretch, a roof overrun slab, and a ground-floor lift door.\n\n(5) Moss and rust at the tower footings, a few rainwater down pipes (steel) running full height at x = ±16 and ±4 along the rear wall, and stain streaks.",
      "box": [[-22.8, 0, -11.5], [22.8, 31.8, -5]],
      "attaches": "The gallery parapets and cladding sit on the frame slabs and core face at rearWall (z=-5) and rearEdge (z=-7). The towers butt onto the gallery edge at z=-7. The towers rise from y=0 and the roof part stays above y=29.5 inside z ±6.5, clear of the towers.",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "roofTerrace",
      "builds": "The rooftop terrace on roofSlabTop (y=29.5), inside the parapet (|x| ≤ 21.8, |z| ≤ 6.5). It tops out at y=34.\n\n(1) A gravel deck surface layer, y 29.5..29.6, x ±21.8, z ±6.4, in gravel, with an inner rim edge strip in concreteLight.\n\n(2) A central gym pavilion at x -7..3, z -2.5..4, wall y 29.6..32.3, in concrete with board lines. It has a band of strip windows (glass and steel, a few glassLit) around it, a deep overhanging barrel-vault roof (sweep or extrude a curved profile, apex y 33.2, in concreteLight with a dark underside) and a front door in panelRed.\n\n(3) Two big sculptural ventilation stacks: lathe-built tapered towers with an outward flaring cap, base radius 1.0 narrowing to 0.7 at the neck, 3.5 m high. One is at x=12, z=-3 and one at x=16.5, z=3. Concrete with a concreteDark ring band, a moss collar and a shadow top.\n\n(4) On the left side (x -21..-9), a running track: a flat oval ring of panelOchre with white lane lines. Alongside it sits a shallow paddling pool: a concrete rim ring with a glass-coloured water disc at z=-3, x=-17. Add a sculptural ramp or stair block, a low wall of boards with a slope, at x=-10, z=4.\n\n(5) A water tank: a cylinder (steel and rust) on 4 steel legs at x=-18, z=3.5, 2.2 high. Add a sun-shade pergola with a lattice of thin concreteDark slats on tall posts at x 6..10, z=-4.\n\n(6) A few benches in deckWood on concrete, and 4-5 lollipop trees (trunk in deckWood, round planterGreen canopy) in square concrete planters. Add a tall steel mast with a small flag in panelRed on the pavilion roof at x=-2, z=1, whose top reaches y=34.\n\n(7) Small lamp posts with lamp heads, and a glow-worthy skylight strip (glassLit) on the pavilion roof.",
      "box": [[-21.8, 29.5, -6.5], [21.8, 34, 6.5]],
      "attaches": "Rests on roofSlabTop (y=29.5). Everything stays inside the parapet (frame, roofParapetTop y=30.2) and clear of the towers at z < -7.",
      "joints": [],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: frontFacade -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildFrontFacade({ b, P }: any) {
  const R = rng(11);
  const R2 = rng(5);
  const bins: Record<string, THREE.BufferGeometry[]> = {};
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (bins[c] ||= []).push(g);
  };
  const cyl = (c: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.CylinderGeometry(r, r, 0.03, 8);
    g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    (bins[c] ||= []).push(g);
  };
  const poly = [P.panelRed, P.panelYellow, P.panelBlue, P.panelGreen, P.panelWhite, P.panelOchre];
  for (let i = 0; i < 11; i++) {
    const cx = -20 + 4 * i;
    const e0 = cx - 2;
    const e1 = cx + 2;
    for (let k = 0; k < 8; k++) {
      const b0 = 5 + 3 * k + 0.35;
      const top = 5 + 3 * k + 3;
      // (a) parapet
      box(P.concrete, e0 + 0.2, e1 - 0.2, b0, b0 + 1, 6.8, 7.0);
      box(P.concreteLight, e0 + 0.2, e1 - 0.2, b0 + 1, b0 + 1.06, 6.78, 7.02);
      box(P.boardLine, e0 + 0.2, e1 - 0.2, b0 + 0.3, b0 + 0.34, 7.0, 7.02);
      box(P.boardLine, e0 + 0.2, e1 - 0.2, b0 + 0.65, b0 + 0.69, 7.0, 7.02);
      if (R() < 0.17) {
        box(P.concreteDark, cx - 1, cx + 1, b0 + 1.06, b0 + 1.3, 6.8, 7.0);
        box(P.soil, cx - 0.95, cx + 0.95, b0 + 1.3, b0 + 1.34, 6.83, 6.97);
        for (let j = -1; j <= 1; j++) box(P.planterGreen, cx + j * 0.6 - 0.2, cx + j * 0.6 + 0.2, b0 + 1.34, b0 + 1.7, 6.82, 6.98);
      }
      // (b) side wall
      const side = (i + k) % 2 ? 1 : -1;
      const sx = side > 0 ? e1 - 0.2 - 0.05 : e0 + 0.2;
      box(poly[Math.floor(R() * 6)], sx, sx + 0.05, b0, b0 + 2.7, 5, 6.8);
      // (c) back panel
      box(R() < 0.33 ? poly[Math.floor(R() * 6)] : P.concreteLight, cx - 1.65, cx + 1.65, b0, b0 + 2.6, 5, 5.06);
      // (d) window and door
      const wx = cx - 0.7;
      box(P.steel, wx - 1.03, wx + 1.03, b0 + 0.87, b0 + 2.33, 5.06, 5.12);
      const r = R2();
      const gl = r < 0.125 ? P.glassLit : r < 0.2 ? P.glassDark : P.glass;
      box(gl, wx - 0.97, wx + 0.97, b0 + 0.93, b0 + 2.27, 5.12, 5.14);
      box(P.steel, wx - 0.02, wx + 0.02, b0 + 0.93, b0 + 2.27, 5.14, 5.16);
      box(P.steel, wx - 0.97, wx + 0.97, b0 + 1.58, b0 + 1.62, 5.14, 5.16);
      const dx = cx + 1.2;
      box(P.steel, dx - 0.48, dx + 0.48, b0, b0 + 2.25, 5.06, 5.12);
      box(R2() < 0.15 ? P.glassLit : P.glass, dx - 0.42, dx + 0.42, b0 + 0.05, b0 + 2.2, 5.12, 5.14);
      box(P.steel, dx - 0.02, dx + 0.02, b0 + 0.05, b0 + 2.2, 5.14, 5.16);
      cyl(P.lamp, dx + 0.7, b0 + 1.9, 5.1, 0.07);
      // (e) sunscreen
      if (k >= 5 && i % 2 === 0)
        for (let j = 0; j < 3; j++) box(P.concrete, cx - 1.7, cx + 1.7, top - 0.1 - j * 0.45 - 0.08, top - 0.1 - j * 0.45, 6.4, 7.0);
      if (i % 4 === 0) box(P.concreteDark, cx - 0.075, cx + 0.075, b0 + 1.06, top, 6.2, 7.0);
      // (f) details
      if (R2() < 0.2) box(P.shadow, cx - 1.8, cx + 1.8, top - 0.03, top - 0.01, 5, 7);
      if (R2() < 0.12) {
        box(poly[Math.floor(R2() * 6)], cx + 0.3, cx + 0.8, b0 + 1.2, b0 + 1.7, 6.7, 6.74);
      }
      if (R2() < 0.15) box(P.rust, cx + 0.9, cx + 1.1, b0 + 1.06, b0 + 1.25, 6.85, 6.95);
    }
  }
  for (const c in bins) {
    const m = mergeGeometries(bins[c]);
    if (m) b.part(m, c, { at: [0, 0, 0] });
  }
}
```

<!-- call: frame -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildFrame({ b, P }: any) {
  const R = rng(5);
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (groups[c] ||= []).push(g);
  };
  // merged flush at the end per colour
  const flush = () => {
    for (const c of Object.keys(groups)) {
      const gs = groups[c];
      let pos: number[] = [];
      let idx: number[] = [];
      let off = 0;
      const out = new THREE.BufferGeometry();
      const nrm: number[] = [];
      for (const g of gs) {
        const p = g.getAttribute("position");
        const n = g.getAttribute("normal");
        for (let i = 0; i < p.count; i++) {
          pos.push(p.getX(i), p.getY(i), p.getZ(i));
          nrm.push(n.getX(i), n.getY(i), n.getZ(i));
        }
        const ix = g.getIndex()!;
        for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
        off += p.count;
      }
      out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      out.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
      out.setIndex(idx);
      b.part(out, c, { at: [0, 0, 0] });
    }
  };
  const C = P.concrete, CL = P.concreteLight, CD = P.concreteDark, BL = P.boardLine;
  // core
  box(CD, -21.6, 21.6, 5, 29, -5, 5);
  // slabs
  for (let k = 0; k < 8; k++) {
    const y = 5 + 3 * k;
    box(C, -22.6, 22.6, y, y + 0.35, -7, 7);
    for (const z of [7.01, -7.01]) {
      box(BL, -22.6, 22.6, y + 0.14, y + 0.2, z - 0.01, z + 0.01);
      box(P.shadow, -22.6, 22.6, y - 0.03, y + 0.03, z > 0 ? 6.9 : -7.0, z > 0 ? 7.02 : -6.9);
    }
    // cross walls
    for (let i = 0; i < 10; i++) {
      const x = -18 + 4 * i;
      box(C, x - 0.2, x + 0.2, y + 0.35, y + 3, 5, 7);
      for (let s = 0; s < 8; s++) {
        const yy = y + 0.5 + s * 0.3;
        box(BL, x - 0.21, x + 0.21, yy, yy + 0.05, 5.1, 6.9);
      }
    }
  }
  // roof slab
  box(CL, -22.8, 22.8, 29, 29.5, -7.1, 7.1);
  box(P.shadow, -22.8, 22.8, 28.96, 29.02, -7.1, 7.1);
  // gables
  for (const s of [1, -1]) {
    const x0 = s > 0 ? 21.8 : -22.6, x1 = x0 + 0.8;
    const xo = s * 22.6;
    box(C, x0, x1, 5, 29.5, -7, 7);
    for (let z = -7 + 0.7; z < 7; z += 1.4) box(CD, s > 0 ? 22.6 : -22.8, s > 0 ? 22.8 : -22.6, 5, 29.5, z - 0.1, z + 0.1);
    const fx0 = s * 22.6, fx1 = s * 22.62;
    for (let y = 6; y < 29; y += 1.5) box(BL, Math.min(fx0, fx1), Math.max(fx0, fx1) + 0.01 * s, y, y + 0.06, -7, 7);
    for (let y = 6; y < 29; y += 3) for (let z = -6.5; z <= 6.5; z += 1.3)
      box(P.tieHole, s * 22.6 - 0.02, s * 22.6 + 0.02, y, y + 0.1, z, z + 0.1);
    for (const k of [1, 3, 4, 6]) for (const z of [-5.5, 5.5])
      box(P.shadow, s * 22.8 - 0.03, s * 22.8 + 0.03, 5 + 3 * k - 0.1, 5 + 3 * k + 2.9, z - 0.15, z + 0.15);
    // mural
    const m = (c: string, z0: number, z1: number, y0: number, y1: number, d = 0) => {
      const xa = s * (22.82 + d);
      box(c, Math.min(xa, xa + s * 0.06), Math.max(xa, xa + s * 0.06), y0, y1, z0, z1);
    };
    m(P.panelWhite, -4, 4, 8, 26);
    m(P.panelRed, -3.5, 0.5, 9, 17, 0.06);
    m(P.panelBlue, 0.5, 3.5, 12, 24, 0.06);
    m(P.panelYellow, -3.5, -0.5, 18, 25, 0.06);
    m(P.panelRed, 1, 3, 9, 11, 0.12);
    m(P.panelBlue, -2.5, -1, 20, 21.5, 0.12);
    const d = new THREE.CylinderGeometry(1.1, 1.1, 0.06, 14);
    d.rotateZ(Math.PI / 2);
    d.translate(s * 23.0, 14, 1.8);
    (groups[P.panelYellow] ||= []).push(d);
  }
  // parapet
  const py0 = 29.5, py1 = 30.2;
  box(C, -22.6, 22.6, py0, py1, 6.6, 7.0);
  box(C, -22.6, 22.6, py0, py1, -7.0, -6.6);
  box(C, 22.2, 22.6, py0, py1, -7, 7);
  box(C, -22.6, -22.2, py0, py1, -7, 7);
  box(CL, -22.7, 22.7, py1, py1 + 0.08, 6.5, 7.1);
  box(CL, -22.7, 22.7, py1, py1 + 0.08, -7.1, -6.5);
  box(CL, -22.7, -22.1, py1, py1 + 0.08, -7, 7);
  box(CL, 22.1, 22.7, py1, py1 + 0.08, -7, 7);
  box(P.moss, -22.5, 22.5, py1 + 0.08, py1 + 0.12, 6.7, 6.9);
  box(P.moss, -22.5, 22.5, py1 + 0.08, py1 + 0.12, -6.9, -6.7);
  for (const sx of [4, 12, 20, -4, -12, -20]) for (const sz of [1, -1]) {
    box(CD, sx - 0.2, sx + 0.2, 29.55, 30.15, sz > 0 ? 7.0 : -7.4, sz > 0 ? 7.4 : -7.0);
    box(P.concreteStain, sx - 0.15, sx + 0.15, 27.9, 29.5, sz > 0 ? 7.0 : -7.03, sz > 0 ? 7.03 : -7.0);
    box(P.rust, sx - 0.05, sx + 0.05, 28.0, 29.0, sz > 0 ? 7.03 : -7.06, sz > 0 ? 7.06 : -7.03);
  }
  // weathering streaks
  for (let i = 0; i < 24; i++) {
    const x = (R() - 0.5) * 42, y = 6 + R() * 20, h = 1 + R() * 2.5;
    const c = R() < 0.2 ? P.rust : R() < 0.3 ? P.moss : P.concreteStain;
    box(c, x - 0.07, x + 0.07, y, y + h, 7.02, 7.04);
  }
  flush();
}
```

<!-- call: backGallery -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildBackGallery({ b, P }: any) {
  const R = rng(23);
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  // box in model space by min/max corners, merged per colour
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (groups[c] ||= []).push(g);
  };
  const cyl = (c: string, x: number, z: number, r: number, y0: number, y1: number) => {
    const g = new THREE.CylinderGeometry(r, r, y1 - y0, 8);
    g.translate(x, (y0 + y1) / 2, z);
    (groups[c] ||= []).push(g);
  };
  const C = P.concrete, CL = P.concreteLight, CD = P.concreteDark, ST = P.steel;
  const doorCols = [P.panelRed, P.panelYellow, P.panelBlue, P.panelGreen, P.panelOchre, P.panelWhite];

  // rear wall cladding
  box(CL, -21.6, 21.6, 5, 29, -5.05, -5.0);

  const gap = (x: number) => Math.abs(x) < 1.5 || (Math.abs(x) > 7.5 && Math.abs(x) < 12.5);
  for (let k = 0; k < 8; k++) {
    const b0 = 5 + 3 * k + 0.35;
    // parapet segments between gaps
    const segs: [number, number][] = [[-22, -12.5], [-7.5, -1.5], [1.5, 7.5], [12.5, 22]];
    for (const [a, c] of segs) {
      box(C, a, c, b0, b0 + 1.1, -6.95, -6.65);
      box(CL, a, c, b0 + 1.1, b0 + 1.18, -7.0, -6.6);
      box(ST, a, c, b0 + 1.18, b0 + 1.22, -6.85, -6.8);
      box(ST, a, c, b0 + 1.3, b0 + 1.34, -6.85, -6.8);
    }
    for (let i = 0; i < 11; i++) {
      const cx = -20 + 4 * i;
      const dx = cx + 1.0;
      const col = doorCols[Math.floor(R() * 6)];
      if (!gap(dx)) {
        box(ST, dx - 0.52, dx + 0.52, b0, b0 + 2.16, -5.1, -5.05);
        box(col, dx - 0.47, dx + 0.47, b0, b0 + 2.1, -5.13, -5.1);
        box(P.lamp, dx - 0.12, dx + 0.12, b0 + 2.3, b0 + 2.4, -5.12, -5.05);
        box(ST, dx - 0.25, dx - 0.1, b0 + 1.1, b0 + 1.14, -5.15, -5.13);
      }
      const wx = cx - 1.0;
      if (!gap(wx)) {
        box(ST, wx - 0.55, wx + 0.55, b0 + 1.1, b0 + 2.2, -5.1, -5.05);
        box(R() < 0.15 ? P.glassLit : P.glass, wx - 0.48, wx + 0.48, b0 + 1.17, b0 + 2.13, -5.13, -5.1);
        box(ST, wx - 0.02, wx + 0.02, b0 + 1.17, b0 + 2.13, -5.15, -5.13);
      }
    }
    // piers, board lines
    for (const x of [-22, -14, -6, 6, 14, 22]) box(C, x - 0.2, x + 0.2, 5 + 3 * k, 5 + 3 * k + 3, -7.0, -6.6);
  }

  // towers
  const tower = (cx: number, num: number) => {
    const x0 = cx - 2.5, x1 = cx + 2.5;
    box(C, x0, x1, 0, 31.4, -11.5, -7);
    for (let y = 0.3; y < 31.4; y += 0.6) box(P.boardLine, x0, x1, y, y + 0.05, -11.53, -11.5);
    for (let y = 1; y < 31; y += 3) for (let x = x0 + 0.5; x < x1; x += 1) if (Math.abs(x - cx) > 0.7) box(P.tieHole, x - 0.05, x + 0.05, y, y + 0.1, -11.53, -11.5);
    box(P.glassDark, cx - 0.5, cx + 0.5, 1, 30, -11.54, -11.5);
    for (const s of [-1, 1]) box(CD, cx + s * 0.75 - 0.15, cx + s * 0.75 + 0.15, 0, 31.4, -11.8, -11.5);
    for (let k = 0; k < 8; k++) {
      const y = 5 + 3 * k;
      box(ST, cx - 0.5, cx + 0.5, y + 0.3, y + 0.38, -11.56, -11.54);
      const g = new THREE.BoxGeometry(1.1, 0.05, 0.03);
      g.rotateZ(0.5); g.translate(cx, y + 1.8, -11.56);
      (groups[ST] ||= []).push(g);
      box(P.shadow, cx - 0.6, cx + 0.6, y + 0.35, y + 2.55, -7.04, -7.0);
    }
    box(P.shadow, cx - 1.2, cx + 1.2, 0, 2.2, -7.04, -7.0);
    box(ST, cx - 1, cx + 1, 0, 2.2, -11.56, -11.5);
    box(P.glassDark, cx - 0.9, cx - 0.05, 0.1, 2.1, -11.6, -11.56);
    box(P.glassDark, cx + 0.05, cx + 0.9, 0.1, 2.1, -11.6, -11.56);
    box(CL, x0 - 1, x1 + 1, 2.4, 2.6, -12.3, -11.5);
    box(CL, x0 - 0.3, x1 + 0.3, 31.4, 31.8, -11.8, -6.7);
    // numeral
    const nx = cx + 1.4 * 0 ;
    if (num === 1) box(P.panelRed, nx - 0.3, nx + 0.3, 25, 28, -11.6, -11.5);
    else {
      box(P.panelRed, nx - 0.8, nx + 0.8, 27.4, 28, -11.6, -11.5);
      box(P.panelRed, nx + 0.2, nx + 0.8, 26.4, 28, -11.6, -11.5);
      box(P.panelRed, nx - 0.8, nx + 0.8, 26.4, 26.9, -11.6, -11.5);
      box(P.panelRed, nx - 0.8, nx - 0.2, 25, 26.9, -11.6, -11.5);
      box(P.panelRed, nx - 0.8, nx + 0.8, 25, 25.6, -11.6, -11.5);
    }
    // stains, moss, rust
    for (let i = 0; i < 6; i++) {
      const x = x0 + 0.4 + R() * 4.2;
      box(P.concreteStain, x, x + 0.12, 20 + R() * 8 - 8, 29, -11.52, -11.5);
    }
    box(P.moss, x0, x1, 0, 0.5, -11.55, -11.5);
    box(P.rust, cx + 1.2, cx + 1.5, 0.5, 2, -11.54, -11.5);
  };
  tower(10, 2);
  tower(-10, 1);

  // lift tower
  box(CD, -1.5, 1.5, 0, 31, -9.5, -7);
  box(P.glassDark, -0.2, 0.2, 3, 29, -9.54, -9.5);
  box(P.panelYellow, -1.52, 1.52, 24, 25.2, -9.55, -9.45);
  box(CL, -1.8, 1.8, 31, 31.4, -9.8, -6.9);
  box(ST, -0.8, 0.8, 0, 2.2, -9.56, -9.5);
  box(P.shadow, -0.02, 0.02, 0, 2.2, -9.58, -9.56);
  box(P.moss, -1.5, 1.5, 0, 0.4, -9.54, -9.5);

  // downpipes
  for (const x of [-16, -4, 4, 16]) {
    cyl(ST, x, -5.2, 0.07, 0, 29);
    box(ST, x - 0.1, x + 0.1, 0.8, 0.9, -5.35, -5.05);
    box(P.rust, x - 0.03, x + 0.03, 0, 0.6, -5.29, -5.27);
  }
  for (let i = 0; i < 14; i++) {
    const x = -21 + R() * 42;
    if (gap(x)) continue;
    box(P.concreteStain, x, x + 0.15, 5 + R() * 20, 29, -7.03, -7.0);
  }
  box(P.moss, -22, 22, 0, 0.3, -5.6, -5.0);

  for (const c in groups) {
    const m = mergeGeometries(groups[c].map((g) => (g.index ? g : g)));
    if (m) b.part(m, c, { at: [0, 0, 0] });
  }
}
```

<!-- call: roofTerrace -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildRoofTerrace({ b, P }: any) {
  const R = rng(5);
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const add = (g: THREE.BufferGeometry, c: string) => {
    (groups[c] ||= []).push(g);
  };
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    add(g, c);
  };
  const cyl = (c: string, x: number, y: number, z: number, rt: number, rb: number, h: number, s = 10) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, s);
    g.translate(x, y + h / 2, z);
    add(g, c);
  };
  const ball = (c: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.translate(x, y, z);
    add(g, c);
  };

  // gravel deck + rim
  box(P.gravel, -21.8, 21.8, 29.5, 29.6, -6.4, 6.4);
  box(P.concreteLight, -21.8, 21.8, 29.6, 29.7, 6.2, 6.4);
  box(P.concreteLight, -21.8, 21.8, 29.6, 29.7, -6.4, -6.2);
  box(P.concreteLight, -21.8, -21.6, 29.6, 29.7, -6.4, 6.4);
  box(P.concreteLight, 21.6, 21.8, 29.6, 29.7, -6.4, 6.4);

  // pavilion
  box(P.concrete, -7, 3, 29.6, 32.3, -2.5, 4);
  for (let i = 0; i < 8; i++) {
    const y = 29.9 + i * 0.33;
    box(P.boardLine, -7.02, 3.02, y, y + 0.05, -2.52, 4.02);
  }
  box(P.steel, -7.03, 3.03, 31.0, 31.9, -2.53, 4.03);
  for (let i = 0; i < 9; i++) {
    const lit = R() < 0.25;
    const x = -6.5 + i * 1.1;
    box(lit ? P.glassLit : P.glass, x, x + 0.9, 31.1, 31.8, 4.03, 4.06);
    box(lit ? P.glassLit : P.glass, x, x + 0.9, 31.1, 31.8, -2.56, -2.53);
  }
  for (let i = 0; i < 5; i++) {
    box(P.glass, 3.03, 3.06, 31.1, 31.8, -2 + i * 1.2, -1.1 + i * 1.2);
    box(P.glass, -7.06, -7.03, 31.1, 31.8, -2 + i * 1.2, -1.1 + i * 1.2);
  }
  box(P.panelRed, -2.6, -1.4, 29.6, 31.0, 4.0, 4.08);
  // barrel vault
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    prof.push(new THREE.Vector2(-6.4 + 0 + Math.cos(Math.PI - a) * 0, 0));
  }
  const sh = new THREE.Shape();
  sh.moveTo(-5.5, 0);
  sh.absarc(0, 0, 5.5, Math.PI, 0, true);
  sh.lineTo(5.5 - 0.3, 0);
  sh.absarc(0, 0, 5.2, 0, Math.PI, false);
  const vg = new THREE.ExtrudeGeometry(sh, { depth: 7.4, bevelEnabled: false, curveSegments: 10 });
  vg.scale(1, 0.18, 1);
  vg.translate(-2, 32.3, -3.2);
  add(vg, P.concreteLight);
  box(P.shadow, -7.4, 3.4, 32.28, 32.36, -3.2, 4.4);
  box(P.glassLit, -5, 1, 33.12, 33.2, -0.5, 1.5);

  // mast + flag
  cyl(P.steel, -2, 33.1, 1, 0.04, 0.05, 0.9, 6);
  box(P.panelRed, -1.95, -1.3, 33.45, 33.9, 0.98, 1.02);

  // stacks
  for (const [x, z] of [[12, -3], [16.5, 3]]) {
    cyl(P.concrete, x, 29.6, z, 0.7, 1.0, 3.5, 12);
    cyl(P.concreteDark, x, 30.6, z, 1.0, 1.0, 0.35, 12);
    cyl(P.moss, x, 29.6, z, 1.08, 1.08, 0.15, 12);
    cyl(P.concreteLight, x, 33.1, z, 1.0, 0.7, 0.5, 12);
    cyl(P.shadow, x, 33.6, z, 0.85, 0.85, 0.04, 12);
  }

  // track
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const a2 = ((i + 1) / 24) * Math.PI * 2;
    for (const [rr, col, w] of [[4.2, P.panelOchre, 1.2], [4.2, P.panelWhite, 0.06]] as any) {
      const am = (a + a2) / 2;
      const len = 2 * rr * Math.sin(Math.PI / 24) * 1.0;
      const g = new THREE.BoxGeometry(w, col === P.panelWhite ? 0.05 : 0.04, len + 0.05);
      g.rotateY(am + Math.PI);
      g.translate(-15 + Math.sin(am) * rr * 1.6 * (col === P.panelWhite ? 1 : 1), col === P.panelWhite ? 29.64 : 29.62, 1 + Math.cos(am) * rr * 0.55 * (col === P.panelWhite ? 1 : 1));
      add(g, col);
    }
  }
  // pool
  const rim = new THREE.CylinderGeometry(2.2, 2.2, 0.35, 16);
  rim.translate(-17, 29.78, -3);
  add(rim, P.concrete);
  const wat = new THREE.CylinderGeometry(1.9, 1.9, 0.05, 16);
  wat.translate(-17, 29.97, -3);
  add(wat, P.glass);
  // ramp block
  const rs = new THREE.Shape();
  rs.moveTo(0, 0); rs.lineTo(3, 0); rs.lineTo(3, 1.2); rs.lineTo(0, 0.3);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: 1.2, bevelEnabled: false });
  rg.translate(-11.5, 29.6, 3.4);
  add(rg, P.concrete);

  // water tank
  cyl(P.steel, -18, 31.0, 3.5, 0.9, 0.9, 0.8, 12);
  cyl(P.rust, -18, 31.0, 3.5, 0.93, 0.93, 0.12, 12);
  for (const sx of [-0.6, 0.6]) for (const sz of [-0.6, 0.6]) box(P.steel, -18 + sx - 0.05, -18 + sx + 0.05, 29.6, 31, 3.5 + sz - 0.05, 3.5 + sz + 0.05);

  // pergola
  for (const x of [6, 10]) for (const z of [-5, -3]) box(P.concreteDark, x - 0.1, x + 0.1, 29.6, 32, z - 0.1, z + 0.1);
  for (let i = 0; i < 9; i++) box(P.concreteDark, 6 + i * 0.5, 6.1 + i * 0.5, 32, 32.1, -5.2, -2.8);
  box(P.concreteDark, 5.9, 10.1, 32.1, 32.2, -5.2, -2.8);

  // benches, trees, lamps
  for (const x of [-12, 4]) {
    box(P.concrete, x - 1, x + 1, 29.6, 29.9, -5.6, -5.2);
    box(P.deckWood, x - 1, x + 1, 29.9, 30.0, -5.65, -5.15);
  }
  [[-20, -5], [-14, -5.2], [14, 5], [19, -5], [-5, 5.4]].forEach(([x, z]) => {
    box(P.concrete, x - 0.5, x + 0.5, 29.6, 30.2, z - 0.5, z + 0.5);
    box(P.soil, x - 0.45, x + 0.45, 30.2, 30.25, z - 0.45, z + 0.45);
    cyl(P.deckWood, x, 30.2, z, 0.07, 0.1, 1.5, 6);
    ball(P.planterGreen, x, 32.0, z, 0.75);
  });
  for (const [x, z] of [[-20, 5.6], [20, -5.6], [20, 5.6], [-8, -5.6]]) {
    cyl(P.steel, x, 29.6, z, 0.04, 0.05, 2.2, 6);
    ball(P.lamp, x, 31.9, z, 0.15);
  }

  for (const c in groups) {
    const m = mergeGeometries(groups[c].map((g) => (g.index ? g : g)));
    if (m) b.part(m, c, { at: [0, 0, 0] });
  }
}
```

<!-- call: podium -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildPodium({ b, P }: any) {
  const R = rng(5);
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (groups[c] ||= []).push(g);
  };
  const cyl = (c: string, x: number, y: number, z: number, r: number, h: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.translate(x, y, z);
    (groups[c] ||= []).push(g);
  };
  const sph = (c: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.SphereGeometry(r, 7, 5);
    g.translate(x, y, z);
    (groups[c] ||= []).push(g);
  };

  // pilotis
  for (const x of [-22, -14, -6, 6, 14, 22]) {
    for (const z of [4.5, -4.5]) {
      const end = Math.abs(x) === 22;
      const w0 = end ? 1.6 : 1.2, w1 = end ? 2.0 : 1.9;
      const cx = end ? x * (22.5 / 22) : x;
      const g = new THREE.CylinderGeometry(1, 1, 1, 4, 1);
      // tapered box via frustum
      const geo = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
      const pos = geo.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const t = pos.getY(i) + 0.5;
        const w = w0 + (w1 - w0) * t, d = 1.4 + 0.4 * t;
        pos.setXYZ(i, pos.getX(i) * w, t * 4.7 + 0.3, pos.getZ(i) * d);
      }
      geo.translate(cx, 0, z);
      (groups[P.concrete] ||= []).push(geo);
      g.dispose();
      box(P.concreteDark, cx - w0 / 2 - 0.08, cx + w0 / 2 + 0.08, 0, 0.3, z - 0.78, z + 0.78);
      box(P.concrete, cx - w1 / 2 - 0.1, cx + w1 / 2 + 0.1, 4.4, 5, z - 0.95, z + 0.95);
      const fz = z > 0 ? z + 1 : z - 1;
      for (let k = 0; k < 4; k++) {
        const y = 1 + k * 1;
        const w = w0 + (w1 - w0) * (y / 5);
        box(P.boardLine, cx - w / 2, cx + w / 2, y, y + 0.05, z > 0 ? z + 0.76 + 0.2 * (y / 5) : z - 0.76 - 0.2 * (y / 5) - 0.02, z > 0 ? z + 0.78 + 0.2 * (y / 5) + 0.02 : z - 0.76 - 0.2 * (y / 5));
        sph(P.tieHole, cx + (R() - 0.5) * 0.6, y + 0.5, fz > z ? z + 0.85 + 0.1 * y / 5 : z - 0.85 - 0.1 * y / 5, 0.04);
      }
      box(P.concreteStain, cx - 0.4, cx - 0.3, 1.5, 4.2, z > 0 ? z + 0.9 : z - 0.93, z > 0 ? z + 0.93 : z - 0.9);
      box(P.moss, cx - 0.5, cx + 0.3, 0.3, 0.55, z > 0 ? z + 0.74 : z - 0.78, z > 0 ? z + 0.78 : z - 0.74);
    }
  }

  // lobby
  box(P.concreteLight, -5, 5, 0, 0.45, -3.2, 3.8);
  box(P.glassDark, -4.2, 4.2, 0.5, 4.0, -2.9, 3.3);
  for (let i = 0; i < 9; i++) {
    const x = -4 + i * 0.9;
    box(P.glassLit, x + 0.1, x + 0.8, 1.2, 2.8, 3.38, 3.4);
    if (R() > 0.5) box(P.glassLit, x + 0.1, x + 0.8, 3, 3.8, 3.38, 3.4);
    box(P.steel, x - 0.04, x + 0.04, 0.45, 4.0, 3.4, 3.5);
  }
  box(P.steel, -4.3, 4.3, 0.45, 0.6, 3.4, 3.55);
  box(P.steel, -4.3, 4.3, 3.9, 4.0, 3.4, 3.55);
  box(P.shadow, -0.8, 0.8, 0.45, 2.3, 3.52, 3.56);
  box(P.concrete, -4.5, -4.3, 0, 4.3, 3.2, 3.7);
  box(P.concrete, 4.3, 4.5, 0, 4.3, 3.2, 3.7);
  box(P.concreteLight, -4.7, 4.7, 4.1, 4.5, -3.2, 3.9);
  box(P.steel, -1.5, 1.5, 3.55, 3.8, 3.6, 3.7);
  box(P.panelYellow, -4.2, -2.4, 0.8, 2.4, -2.8, -2.7);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(P.steel, -4 + i * 0.4, -3.7 + i * 0.4, 1 + j * 0.4, 1.3 + j * 0.4, -2.7, -2.65);

  // canopy
  box(P.concrete, -6, 6, 4.0, 4.4, 3.5, 9);
  box(P.concreteDark, -6, 6, 3.9, 4.0, 3.5, 9);
  for (const s of [-1, 1]) {
    box(P.concrete, s * 5.5 - 0.35, s * 5.5 + 0.35, 0.5, 4.0, 8.25, 8.95);
    cyl(P.lamp, s * 3, 3.88, 7, 0.2);
    cyl(P.lamp, s * 1.2, 3.88, 5, 0.2);
  }
  // steps
  for (let i = 0; i < 4; i++) {
    const z1 = 3.5 + (i + 1) * 1.5;
    box(P.concreteLight, -3.5, 3.5, 0, 0.12 * (4 - i) * 0 + 0.12 * (i + 1) , z1 - 1.5, z1);
  }
  box(P.concreteLight, -3.5, 3.5, 0, 0.1, 3.5, 9.5);
  for (const s of [-1, 1]) box(P.concrete, s * 3.5 - (s > 0 ? -0.1 : 0.5), s * 3.5 + (s > 0 ? 0.5 : 0.1), 0, 0.7, 3.5, 9.5);
  for (let i = 1; i < 4; i++) box(P.shadow, -3.5, 3.5, 0.02, 0.11 * i, 3.5 + i * 1.5 - 0.02, 3.5 + i * 1.5);

  // shops
  for (const s of [-1, 1]) {
    const x0 = s > 0 ? 8 : -13, x1 = x0 + 5;
    box(P.glassDark, x0, x1, 0.2, 3.3, -3, 3);
    box(P.glassLit, x0 + 0.4, x1 - 0.4, 0.8, 2.6, 3.02, 3.05);
    for (let i = 0; i <= 5; i++) box(P.steel, x0 + i - 0.04, x0 + i + 0.04, 0.2, 3.3, 3.02, 3.12);
    box(P.steel, x0, x1, 0.2, 0.35, 3.02, 3.12);
    box(s > 0 ? P.panelBlue : P.panelRed, x0 - 0.1, x1 + 0.1, 3.3, 3.9, 2.9, 3.4);
    box(P.concrete, x0 - 0.3, x1 + 0.3, 3.9, 4.1, 2.9, 4.8);
  }

  // planters
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x0 = s * (8 + i * 4.2), xa = Math.min(x0, x0 + s * 3.6), xb = Math.max(x0, x0 + s * 3.6);
      box(P.concrete, xa, xb, 0, 0.7, 6.5, 8);
      box(P.soil, xa + 0.1, xb - 0.1, 0.7, 0.78, 6.6, 7.9);
      for (let k = 0; k < 3; k++) sph(P.planterGreen, xa + 0.6 + k * 1.2, 1.0, 7.25 + (R() - 0.5) * 0.4, 0.45);
    }
    for (let k = 0; k < 3; k++) box(P.concreteDark, s * (7 + k * 2) - 0.12, s * (7 + k * 2) + 0.12, 0, 0.8, 9, 9.24);
    // lamp posts
    const lx = s * 15;
    box(P.steel, lx - 0.06, lx + 0.06, 0, 4, 9.4, 9.52);
    sph(P.lamp, lx, 4.2, 9.46, 0.22);
    // bike rack
    for (let k = 0; k < 5; k++) box(P.steel, s * 17 + k * 0.3 * s, s * 17 + k * 0.3 * s + 0.04, 0, 0.7, 9, 9.04);
  }

  for (const c of Object.keys(groups)) b.part(mergeGeometries(groups[c], false)!, c, { at: [0, 0, 0] });
}
```