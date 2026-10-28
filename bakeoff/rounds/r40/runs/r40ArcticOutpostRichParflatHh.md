<!-- call: plan -->

```json
{
  "name": "Polar Ridge Research Outpost",
  "description": "A Firewatch-style flat-colour diorama of a small arctic research station: a burnt-orange stilted cabin with a snowy roof and chimney, a connected lab module with a radome, a guyed radio mast, a wind turbine and a yard of fuel tanks, a snowmobile and a sled, all on a faceted snow drift base with ice crags.",
  "builderName": "arcticOutpost",
  "size": [8.8, 6.6, 8.8],
  "layout": "Static diorama on one faceted snow platform, about 8.8 m square, centred on x=0 and standing on y=0. The snow is a low irregular octagonal slab whose flat top sits at y=0.35. The platform reads from the front (+Z), and everything else sits on y=0.35 (feet may sink 0.05). From front to back: a yard strip (z 1.6 to 4.2) with stepping-stone path, snowmobile and sled; the MAIN CABIN centre-left (x -2.9..1.3, z -1.9..1.9, floor y=0.8 on timber piles) with a covered porch and steps facing +Z; a LAB MODULE centre-right (x 2.0..4.0, z -1.8..1.2) joined to the cabin by a short enclosed corridor at x 1.3..2.0; a fuel-tank cluster on the left flank (x -4.3..-3.0, z -1.0..3.2); at the back, the RADIO MAST (back-left, x -3.4, z -3.0, top y 6.6) and the WIND TURBINE (back-right, x 3.0, z -3.1, hub y 5.0, blade radius 1.3). Jagged ice and rock crags fill the back centre (x -2.2..1.2, z -4.4..-3.4, up to y 2.2). Style: Firewatch flat colour. Bold simple blocky silhouettes, sunset palette with warm burnt orange, ochre and cream on lit faces and dusky purple-pink on shadow sides. Each snow mass uses a warm pale snowLit top and a snowShade or snowDeep sliver on its sides or underside. Every window glows warm yellow with a dark frame. Roofs carry a thick snow cap built as separate slabs. Trim is cream. No gradients; every detail is a small part in its own flat colour, seated on the surface. Faceted, low-segment shapes (6 to 8 sides) only.",
  "palette": {
    "snowLit": "#f6e6dc",
    "snowShade": "#d4aebd",
    "snowDeep": "#8f7fa8",
    "iceBlue": "#8fcad9",
    "iceDeep": "#4e83a3",
    "rock": "#5a495e",
    "rockLight": "#8b7074",
    "cabinWall": "#c9522e",
    "cabinWallShade": "#963a2e",
    "trimCream": "#f2d9a6",
    "roofDark": "#3d3452",
    "wood": "#7b4a35",
    "woodDark": "#4a2d30",
    "windowGlow": "#ffc857",
    "frameDark": "#2f2536",
    "metalGrey": "#707b8e",
    "metalDark": "#353c50",
    "labWhite": "#eadccb",
    "labTeal": "#2f808a",
    "safetyOrange": "#f48a2c",
    "signalRed": "#d9382f",
    "tarpOchre": "#d9a441"
  },
  "mounts": {
    "terrainTop": [0, 0.35, 0],
    "cabinFloor": [-0.8, 0.8, 0],
    "cabinEave": [-0.8, 2.9, 0],
    "cabinRidge": [-0.8, 3.9, 0],
    "porchDeck": [-0.8, 0.8, 2.4],
    "doorFront": [-0.8, 1.8, 1.9],
    "stairFoot": [-0.8, 0.35, 3.5],
    "chimneyTop": [-1.9, 4.4, -0.7],
    "corridorJoin": [1.3, 1.5, -0.3],
    "labFloor": [3.0, 0.8, -0.3],
    "labRoof": [3.0, 2.9, -0.3],
    "labDoor": [3.0, 1.7, 1.2],
    "labBackWall": [3.0, 1.6, -1.8],
    "mastBase": [-3.4, 0.3, -3.0],
    "mastTop": [-3.4, 6.6, -3.0],
    "turbineBase": [3.0, 0.3, -3.1],
    "turbineHub": [3.0, 5.0, -2.75],
    "tankBed": [-3.6, 0.35, 1.0],
    "vehiclePark": [2.8, 0.35, 2.9],
    "sledSpot": [0.9, 0.35, 3.3]
  },
  "joints": [],
  "parts": [
    {
      "id": "terrain",
      "builds": "The platform and everything natural. A faceted octagonal snow slab (radius about 4.3) from y=0 to a flat top at y=0.35: lower rim band in snowDeep, middle band in snowShade, top slabs in snowLit, so the dark underside shows around the edge. Overlapping low drift wedges and humps (snowLit tops, snowShade sides) piled against the building feet, along the back and at the corners, never above y 0.7 near buildings. Back-centre crags at x -2.2..1.2, z -4.4..-3.4: five to seven tall faceted prisms and cones in rock and rockLight, up to y 2.2, with snow caps (snowLit) on top and chunks of iceBlue and iceDeep ice shards leaning among them. Smaller scattered rocks with snow caps at two or three other edge spots, kept out of the building and yard footprints. A packed-snow path of flat stepping stones (snowShade, slightly above the snow top) leading from stairFoot at the porch to the front edge and a second branch toward labDoor. A few small orange survey-flag poles (wood pole, safetyOrange triangle flag) along the path. Slim footprints and sled-track grooves as small dark-snowDeep flat strips are optional. The terrain does not build any building, tank, vehicle, mast or turbine.",
      "box": [[-4.4, 0, -4.4], [4.4, 2.3, 4.4]],
      "attaches": "Its top at terrainTop y=0.35 is the floor for every other part; they sink into it by up to 0.05. Path begins at stairFoot and the labDoor step.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "mainCabin",
      "builds": "The main habitat cabin, the hero building. Eight to ten timber piles (wood, woodDark caps) from y 0.3 to the floor at y 0.8, with a woodDark floor slab. Walls x -2.9..1.3, z -1.9..1.9, from y 0.8 to the eave at y 2.9, in cabinWall with horizontal clapboard lines as thin cabinWallShade strips and cream corner posts and a cream base trim board. Gable roof with its ridge along x at y 3.9 and overhang 0.3: two roofDark slopes plus a thick snowLit snow cap slab on each, a snowShade underside lip, cream fascia boards, and triangular gable ends (cabinWall) with a small glowing round attic window (windowGlow with a frameDark ring) on each end. Front face (+Z): door at x -0.8 (wood, cream frame, small glowing window, brass-like tarpOchre handle), two windows either side at x -2.0 and x 0.4, each with a frameDark frame, windowGlow panes, a cross muntin, a cream sill and snowLit sill snow. The left wall (x -2.9) has two windows. The back wall has one window and a stacked woodDark firewood pile with snow cap beside it. A brick-like chimney (rockLight and rock bricks, snowLit cap) on the roof at x -1.9, z -0.7, top at y 4.4 with three or four stacked smoke puffs of snowShade and snowLit above it (chunky low-poly blobs, a drifting column). A covered porch: deck at y 0.8 from z 1.9 to 2.9, x -1.7..0.1 (wood planks as separate strips), two corner posts, a small shed roof (roofDark with snow cap), a railing with balusters, wide steps (3 treads) down to stairFoot at z 3.5. A hanging lantern by the door (frameDark cage, windowGlow core), a safetyOrange life-ring or a weather sign board beside the door with a simple emblem, an antenna whip and a roof-vent cap on the roof, a cream stripe of icicles (iceBlue small cones) along the front eave. On the cabin's right wall (x 1.3) a doorway at z -0.3 where the corridor joins (just trim the cream frame, no door leaf).",
      "box": [[-2.9, 0.3, -1.9], [1.6, 4.5, 3.5]],
      "attaches": "Stands on terrainTop via piles. Right wall at x 1.3 meets the labModule corridor at corridorJoin. Porch steps end at stairFoot. The chimney top is at chimneyTop. The cabin's roof overhang reaches x 1.6 but stays above y 2.9, so it clears the corridor (top y 2.3).",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "labModule",
      "builds": "The science lab annex. A short enclosed corridor from corridorJoin (cabin right wall, x 1.3) to x 2.0, about 1.1 wide (z -0.85..0.25) and y 0.8..2.3: labWhite walls, labTeal roof strip with a snow cap, a small glowing window, a cream door frame at the cabin end. The lab body: x 2.0..4.0, z -1.8..1.2, floor y 0.8 on 6 piles (metalGrey, woodDark caps), walls to y 2.9 in labWhite with horizontal labTeal band stripes at y 1.4 and y 2.6 and safetyOrange corner posts. A low-pitched shed-style roof (labTeal, thick snowLit snow cap, snowShade lip). Front face (+Z at z 1.2): a door at x 3.0 (metalGrey with a safetyOrange stripe, round porthole of windowGlow with frameDark ring), a small landing and two steps down to y 0.35 (z 1.2..1.6), a painted emblem sign above the door made of small parts (a signalRed disc with labWhite snowflake or atom arms). Two wide windows with frameDark frames and windowGlow panes with a tall glowing slit. Side wall x 4.0: a vent grille (stacked metalDark slats) and a round exhaust duct with a cap. Back wall: a cable inlet box (metalDark) at labBackWall. On the roof: a radome, a half-sphere in labWhite (radius 0.7, centre at x 3.0, z -0.8, y 2.9) on a metalDark ring base, with panel seam lines as thin rings in labTeal and a signalRed beacon on top; a Stevenson-style weather screen (white louvered box on four legs) at x 2.5, z 0.5 on the roof; an anemometer (three small cups on a spinner arm, thin mast) on the roof corner. Snow banks piled against the base are in the terrain part, so only build a small snow cap on each step here.",
      "box": [[1.3, 0.3, -1.9], [4.1, 3.9, 1.6]],
      "attaches": "Corridor meets the mainCabin at corridorJoin. Lab floor mount labFloor, door at labDoor, back wall inlet at labBackWall (the commsPower power cable ends there). Piles stand on terrainTop.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "commsPower",
      "builds": "Two tall landmarks at the back, plus their wiring. (1) The radio mast at mastBase x -3.4, z -3.0, top at mastTop y 6.6: a square lattice tower of four metalGrey legs tapering from 0.6 base width to 0.2 at the top, horizontal rungs and diagonal braces every 0.55 m, a small concrete footing (rockLight) with a snow cap, three tiers of guy wires (thin metalDark rods) running to four ground anchors (small rock blocks with a ring) at about 2 m from the base, avoiding the cabin footprint (x -2.9..1.3, z -1.9..1.9), a signalRed and white striped section near the top, a parabolic dish (a lathe bowl in labWhite, a metalDark feed arm) pointing toward +Z-left at y 5.0, a pair of yagi antennas (a thin boom with cross rods) at y 5.7, and a glowing signalRed beacon sphere on top with a small cage. (2) The wind turbine at turbineBase x 3.0, z -3.1: a tapered 8-sided tubular tower in labWhite from base radius 0.22 to 0.1, up to y 4.9, with a rockLight footing and a small safetyOrange door-panel box at the base, a nacelle box (labWhite with a labTeal stripe) at the top, with the hub at turbineHub (z -2.75, y 5.0): a spinner nose cone (safetyOrange), and three tapered blades in labWhite (radius 1.3, flat plates in the XY plane facing +Z, spaced at 120 degrees, one pointing up and slightly angled, with safetyOrange tips). A small tail vane at the back of the nacelle. (3) Power: a small battery and solar array on the ground at x -1.4..0.4, z -3.6..-2.6, three tilted solar panels (frameDark frame, iceDeep cells with thin metalGrey grid lines, snow lightly dusting the upper edge) on metalGrey legs, and a thin black cable (frameDark) drooping from the turbine base to labBackWall as a chain of small straight segments.",
      "box": [[-3.9, 0.2, -3.7], [4.4, 6.6, -2.4]],
      "attaches": "Mast footing sits at mastBase; turbine tower at turbineBase with its hub at turbineHub; power cable ends at labBackWall on the labModule. Everything stands on terrainTop. The turbine blades must stay at y>3.7 above the lab roof radome (top 3.6).",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "yard",
      "builds": "The working yard props, in two zones that must stay out of the cabin footprint (x -2.9..1.6, z -1.9..3.5), the lab footprint (x 1.3..4.1, z -1.9..1.6) and the path. Zone A, left flank, x -4.3..-3.0, z -1.0..3.2 at tankBed (-3.6, 0.35, 1.0): two horizontal cylindrical fuel tanks (8-sided, length 1.5, radius 0.38, one in safetyOrange, one in tarpOchre, with metalDark saddle cradles, cap bands, a filler hatch and a gauge dial) lying along z at x -3.7, a pipe run with a valve wheel in signalRed, a stack of five fuel drums (alternating safetyOrange, labTeal, signalRed with metalDark rim bands and cream stripes) near z 2.6, and a stack of wooden crates (wood, woodDark straps) covered by an ochre tarp with rope ties. Zone B, front right, x 1.6..4.3, z 1.7..4.2: a parked snowmobile at vehiclePark (2.8, 0.35, 2.9) facing +Z, built from a chunky cabinWall body shell and a safetyOrange cowl, a dark seat, windscreen (iceBlue), handlebars, headlight (windowGlow), two front skis (metalDark, curved up at the tips) and a rear tracked belt (a metalDark box with groove rib strips), a snow dusting on its seat. A sled at sledSpot (0.9, 0.35, 3.3) just right of the path, with two wooden runners curled up at the front, slats, a cargo load of two cream-strapped duffel boxes in labTeal and tarpOchre, a rope loop. Also a small cluster of equipment: a snow shovel stuck in a drift and a pair of skis standing against the lab's front corner at x 4.0, z 1.5, kept small, plus a signal-flag pole with a signalRed banner at x 4.0, z 3.6.",
      "box": [[-4.3, 0.3, -1.0], [4.3, 1.7, 4.2]],
      "attaches": "All objects rest on terrainTop. Tanks at tankBed, snowmobile at vehiclePark, sled at sledSpot. It never overlaps the cabin or lab footprints or the stairFoot path.",
      "joints": [],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: terrain -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

type TerrainCtx = {
  b: any;
  J: any;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

export function buildTerrain({ b, P }: TerrainCtx) {
  const r = rng(41);
  const D = Math.PI / 180;
  const FLOOR = 0.35;
  const BASE = 0.3; // rocks sink 0.05 into the snow top

  // ---------- helpers ----------
  type V = [number, number, number];

  const put = (geo: THREE.BufferGeometry, color: string, at: V, rot?: V, scale?: V) => {
    const o: any = { at, flat: true };
    if (rot) o.rotation = rot;
    if (scale) o.scale = scale;
    return b.part(geo, color, o);
  };

  const cyl = (rt: number, rb: number, h: number, sides: number) =>
    new THREE.CylinderGeometry(rt, rb, h, sides, 1);

  // A point `off` metres up the (tilted) local Y axis of a part rooted at `base`.
  const along = (base: V, rot: V, off: number): V => {
    const v = new THREE.Vector3(0, off, 0).applyEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D, "XYZ"));
    return [base[0] + v.x, base[1] + v.y, base[2] + v.z];
  };

  // Something that stands on `base` along its own (possibly tilted) axis, geometry height h.
  const stand = (geo: THREE.BufferGeometry, h: number, color: string, base: V, rot: V = [0, 0, 0]) =>
    put(geo, color, along(base, rot, h / 2), rot);

  // ---------- platform: three stacked faceted slabs ----------
  const clampR = (v: number) => Math.max(-4.37, Math.min(4.37, v));
  const corners: [number, number][] = [
    [4.3, -2.9],
    [4.3, 2.9],
    [2.9, 4.3],
    [-2.9, 4.3],
    [-4.3, 2.9],
    [-4.3, -2.9],
    [-2.9, -4.3],
    [2.9, -4.3],
  ].map(([x, y]) => [clampR(x + (r() - 0.5) * 0.14), clampR(y + (r() - 0.5) * 0.14)] as [number, number]);

  const slab = (scale: number, y0: number, y1: number, color: string) =>
    b.extrude(
      corners.map(([x, y]) => [x * scale, y * scale]),
      { at: [0, (y0 + y1) / 2, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: y1 - y0, color },
    );
  slab(0.9, 0, 0.14, P.snowDeep);
  slab(0.96, 0.14, 0.27, P.snowShade);
  slab(1.0, 0.27, FLOOR, P.snowLit);

  // icicles hanging from the snow lip
  const icicle = (x: number, z: number, h: number, c: string) =>
    put(new THREE.ConeGeometry(0.04, h, 5), c, [x, 0.28 - h / 2, z], [180, 0, 0]);
  icicle(-2.0, 4.2, 0.2, P.iceBlue);
  icicle(0.4, 4.21, 0.15, P.iceBlue);
  icicle(2.3, 4.2, 0.24, P.iceDeep);
  icicle(-4.21, -1.2, 0.18, P.iceBlue);
  icicle(-4.2, 1.4, 0.23, P.iceDeep);
  icicle(4.21, -1.5, 0.2, P.iceBlue);
  icicle(4.2, 0.6, 0.16, P.iceBlue);

  // ---------- drifts: shade body, lit cap ----------
  const drift = (x: number, z: number, w: number, d: number, h: number, ry = 0) => {
    const hb = h * 0.6;
    put(cyl(0.72, 1, 1, 7), P.snowShade, [x, FLOOR - 0.02 + (hb + 0.02) / 2, z], [0, ry, 0], [w, hb + 0.02, d]);
    const hc = h * 0.6;
    put(cyl(0.5, 0.85, 1, 7), P.snowLit, [x + w * 0.06, FLOOR + h * 0.4 + hc / 2, z + d * 0.06], [0, ry, 0], [
      w * 0.9,
      hc,
      d * 0.9,
    ]);
  };
  drift(-2.7, 3.95, 0.55, 0.35, 0.22, 10);
  drift(1.9, 3.9, 0.9, 0.35, 0.2, 5);
  drift(4.0, 3.0, 0.5, 0.7, 0.25, 20);
  drift(-4.0, -0.55, 0.45, 0.55, 0.22, 0);
  drift(1.7, -2.6, 0.9, 0.55, 0.3, 15);
  drift(1.1, -3.25, 0.6, 0.5, 0.25, 30);
  drift(-0.9, -2.45, 0.8, 0.4, 0.2, 8);
  drift(-3.6, 3.75, 0.6, 0.4, 0.2, 40); // tank-side front corner
  drift(-2.45, -3.45, 0.6, 0.45, 0.35, 12); // crag mounds
  drift(1.55, -3.45, 0.55, 0.45, 0.33, 25);
  drift(-1.45, -3.35, 0.45, 0.3, 0.25, 0);

  // wedges piled against building feet: profile drawn (distance from wall, height)
  const wedge = (ax: number, az: number, dx: number, dz: number, len: number, s: number) => {
    const A = [
      [0, -0.02],
      [0.9, -0.02],
      [0.78, 0.07],
      [0.42, 0.2],
      [0, 0.29],
    ].map(([u, v]) => [u * s, v * s]);
    const B = [
      [0, 0.3],
      [0.42, 0.21],
      [0.79, 0.075],
      [0.72, 0.06],
      [0.4, 0.14],
      [0, 0.2],
    ].map(([u, v]) => [u * s, v * s]);
    b.extrude(A, { at: [ax, FLOOR, az], x: [dx, 0, dz], thickness: len, color: P.snowShade });
    b.extrude(B, { at: [ax, FLOOR, az], x: [dx, 0, dz], thickness: len + 0.03, color: P.snowLit });
  };
  wedge(-0.8, -1.9, 0, -1, 3.6, 1.0); // cabin back
  wedge(-2.9, -1.45, -1, 0, 0.9, 0.8); // cabin left, behind the tanks
  wedge(-2.3, 1.9, 0, 1, 1.2, 0.7); // cabin front, left of the porch
  wedge(1.65, 0.25, 0, 1, 0.7, 0.6); // corridor front
  wedge(1.65, -0.85, 0, -1, 0.7, 0.6); // corridor back
  wedge(3.0, -1.8, 0, -1, 2.0, 0.8); // lab back
  wedge(4.0, -0.3, 1, 0, 2.2, 0.3); // lab right

  // ---------- crags ----------
  type Crag = [number, number, number, number, number, string, [number, number], boolean, boolean];
  const crags: Crag[] = [
    [-1.8, -3.9, 0.5, 1.5, 6, P.rock, [-3, 2], true, false],
    [-1.0, -3.9, 0.45, 2.2, 6, P.rockLight, [2, -3], false, true],
    [-0.2, -3.9, 0.5, 1.7, 7, P.rock, [0, 3], true, false],
    [0.55, -3.9, 0.45, 2.0, 6, P.rockLight, [-2, -2], false, true],
    [1.0, -3.8, 0.4, 1.2, 6, P.rock, [3, 4], true, false],
    [-2.1, -3.7, 0.33, 0.9, 6, P.rockLight, [-4, 3], false, false],
    [-0.6, -3.75, 0.3, 1.0, 6, P.rock, [3, -4], false, false],
  ];
  for (const [x, z, R, top, sides, col, tilt, ledge, pointed] of crags) {
    const H = top - BASE;
    const rT = pointed ? 0 : R * 0.4;
    const rot: V = [tilt[0], (x * 37) % 60, tilt[1]];
    const base: V = [x, BASE, z];
    stand(cyl(rT, R, H, sides), H, col, base, rot);
    const rAt = (d: number) => rT + ((R - rT) * d) / H;
    const c = Math.min(0.45, H * 0.28);
    put(cyl(rT * 1.04, rAt(c) * 1.08, c, sides), P.snowLit, along(base, rot, H - c / 2 + 0.012), rot);
    if (ledge) {
      const d = H * 0.55;
      const rl = rAt(d) * 1.0;
      const low = along(base, rot, H - d);
      put(cyl(rl * 1.12, rl * 1.2, 0.04, sides), P.snowShade, low, rot);
      put(cyl(rl * 1.08, rl * 1.14, 0.05, sides), P.snowLit, along(base, rot, H - d + 0.045), rot);
    }
  }
  // boulders at crag feet (shaded body, snow cap)
  const boulder = (x: number, z: number, R: number, h: number, col: string, ry: number) => {
    stand(cyl(R * 0.55, R, h, 7), h, col, [x, BASE, z], [0, ry, 0]);
    put(cyl(R * 0.6, R * 0.74, 0.1, 7), P.snowLit, [x, BASE + h - 0.03, z], [0, ry, 0]);
  };
  boulder(-2.55, -3.55, 0.3, 0.5, P.rockLight, 10);
  boulder(1.55, -3.65, 0.32, 0.45, P.rock, 25);
  boulder(1.4, -4.05, 0.28, 0.6, P.rockLight, 40);

  // ice shards leaning among the rock
  const shard = (x: number, z: number, h: number, rad: number, rot: V, col: string) =>
    stand(new THREE.ConeGeometry(rad, h, 5), h, col, [x, BASE, z], rot);
  shard(-1.45, -3.7, 1.0, 0.12, [-12, 0, 8], P.iceBlue);
  shard(-0.55, -4.2, 1.6, 0.14, [-10, 0, -8], P.iceDeep);
  shard(0.25, -3.78, 0.8, 0.1, [-15, 0, -10], P.iceBlue);
  shard(0.8, -4.2, 1.4, 0.13, [-8, 0, 12], P.iceBlue);
  shard(-2.35, -3.9, 1.1, 0.12, [-10, 0, 15], P.iceDeep);
  shard(1.3, -3.6, 0.7, 0.1, [-5, 0, -20], P.iceBlue);
  // low ice chunks
  const chunk = (x: number, z: number, s: number, col: string, ry: number) =>
    put(new THREE.OctahedronGeometry(s, 0), col, [x, BASE + s * 0.8, z], [0, ry, 12], [1, 1.3, 0.8]);
  chunk(-0.1, -3.5, 0.13, P.iceBlue, 20);
  chunk(0.95, -3.45, 0.11, P.iceDeep, 50);
  chunk(-1.95, -3.4, 0.12, P.iceDeep, 70);

  // ---------- scattered edge rocks with snow caps ----------
  const rock = (x: number, z: number, R: number, h: number, col: string, ry: number) => {
    boulder(x, z, R, h, col, ry);
    boulder(x + R * 1.1, z + R * 0.5, R * 0.55, h * 0.55, col === P.rock ? P.rockLight : P.rock, ry + 30);
  };
  rock(-4.0, -1.8, 0.32, 0.7, P.rock, 5);
  rock(4.05, -2.6, 0.3, 0.6, P.rockLight, 18);
  rock(-2.45, 3.95, 0.28, 0.5, P.rock, 33);

  // ---------- stepping-stone path ----------
  const stone = (x: number, z: number, s: number) => {
    const ry = r() * 60;
    const sx = (0.95 + r() * 0.3) * s;
    const sz = (0.8 + r() * 0.3) * s;
    put(cyl(0.2, 0.22, 0.05, 6), P.snowShade, [x, FLOOR + 0.025, z], [0, ry, 0], [sx, 1, sz]);
    put(cyl(0.14, 0.16, 0.012, 6), P.snowLit, [x + 0.025, FLOOR + 0.056, z + 0.02], [0, ry, 0], [sx, 1, sz]);
  };
  // main path from stairFoot to the front edge
  stone(-0.8, 3.64, 1.0);
  stone(-0.82, 3.9, 1.0);
  stone(-0.92, 4.13, 0.9);
  // branch to the lab step
  const branch: [number, number][] = [
    [0.1, 3.75],
    [0.33, 3.2],
    [0.55, 2.68],
    [1.0, 2.27],
    [1.55, 2.07],
    [2.15, 2.0],
    [2.7, 1.9],
    [3.0, 1.78],
  ];
  branch.forEach(([x, z], i) => stone(x, z, i === branch.length - 1 ? 1.1 : 0.95));

  // ---------- survey flags ----------
  const flag = (x: number, z: number, dir: number, h: number) => {
    put(cyl(0.075, 0.12, 0.07, 6), P.snowLit, [x, FLOOR + 0.02, z]);
    put(cyl(0.014, 0.018, h, 6), P.wood, [x, FLOOR - 0.03 + h / 2, z]);
    b.extrude(
      [
        [0, 0],
        [0.34, 0.1],
        [0, 0.2],
      ],
      { at: [x + dir * 0.012, FLOOR - 0.03 + h - 0.24, z], x: [dir, 0, 0], thickness: 0.012, color: P.safetyOrange },
    );
  };
  flag(-1.55, 3.75, 1, 0.95);
  flag(1.4, 2.48, -1, 0.9);
  flag(-0.2, 4.1, 1, 0.85);

  // ---------- tracks and footprints (flat dark strips) ----------
  const strip = (x: number, z: number, w: number, len: number, ry = 0) =>
    put(new THREE.BoxGeometry(w, 0.012, len), P.snowDeep, [x, FLOOR + 0.004, z], [0, ry, 0]);
  strip(2.5, 3.95, 0.08, 0.66);
  strip(3.1, 3.95, 0.08, 0.66);
  strip(0.7, 4.1, 0.07, 0.3);
  strip(1.1, 4.1, 0.07, 0.3);
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1.78 : -1.6;
    strip(side, 3.3 + i * 0.15, 0.09, 0.2, (i % 2 ? 8 : -8));
  }
}
```

<!-- call: labModule -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildLabModule({ b, P, M }: Ctx) {
  type V = [number, number, number];
  type Face = { ax: "x" | "z"; c: number; s: 1 | -1 };

  const DEG = Math.PI / 180;
  const GROUND = M.terrainTop[1]; // 0.35
  const FLOOR = M.labFloor[1]; // 0.8
  const CX = M.labFloor[0]; // 3.0 (lab centre line)
  const FRONT = M.labDoor[2]; // 1.2
  const BACK = M.labBackWall[2]; // -1.8
  const JOIN = M.corridorJoin[0]; // 1.3 cabin right wall
  const X0 = 2.0; // lab left wall
  const X1 = 4.0; // lab right wall
  const TOP = 2.9; // lab eave height

  // Own colours (a few extra tones on the same sunset palette)
  const SHADE = "#c7aaae"; // dusky pink-purple shadow side of lab white
  const LOUVER = "#b9a69a"; // louver gaps on the weather screen
  const SLIT = "#fff0b8"; // hot highlight slit inside the windows

  // ---------------------------------------------------------------- batching
  // Every small piece is collected per colour (and glow strength), then built as one part each.
  type Bucket = { color: string; strength: number; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const put = (geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4, strength = 0) => {
    geo.applyMatrix4(m);
    const key = `${color}@${strength}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { color, strength, geos: [] }));
    bk.geos.push(geo);
  };
  const mat = (pos: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      new THREE.Vector3(scale[0], scale[1], scale[2]),
    );

  const box = (color: string, size: V, pos: V, rot: V = [0, 0, 0], g = 0) =>
    put(new THREE.BoxGeometry(size[0], size[1], size[2]), color, mat(pos, rot), g);
  const blk = (color: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, g = 0) =>
    box(color, [x1 - x0, y1 - y0, z1 - z0], [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [0, 0, 0], g);
  const cyl = (color: string, rTop: number, rBot: number, h: number, sides: number, pos: V, rot: V = [0, 0, 0], g = 0) =>
    put(new THREE.CylinderGeometry(rTop, rBot, h, sides), color, mat(pos, rot), g);
  const ball = (color: string, r: number, pos: V, g = 0, scale: V = [1, 1, 1]) =>
    put(new THREE.SphereGeometry(r, 6, 4), color, mat(pos, [0, 0, 0], scale), g);
  const rod = (color: string, a: V, c: V, r: number, sides = 6) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...c);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    const m = new THREE.Matrix4().compose(va.clone().add(vb).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    put(new THREE.CylinderGeometry(r, r, len, sides), color, m);
  };

  // A flat plate seated on a wall face. a = position along the wall (x on z-faces, z on x-faces).
  const wall = (f: Face, color: string, a: number, y: number, w: number, h: number, t: number, off: number, g = 0) => {
    const n0 = f.c + f.s * off;
    const n1 = f.c + f.s * (off + t);
    const lo = Math.min(n0, n1);
    const hi = Math.max(n0, n1);
    if (f.ax === "z") blk(color, a - w / 2, a + w / 2, y - h / 2, y + h / 2, lo, hi, g);
    else blk(color, lo, hi, y - h / 2, y + h / 2, a - w / 2, a + w / 2, g);
  };

  // Window: dark frame, glowing pane, bright slit, cross muntin, cream sill with a snow dusting.
  const windowOn = (f: Face, a: number, y: number, w: number, h: number, snowSill = true) => {
    wall(f, P.frameDark, a, y, w + 0.1, h + 0.1, 0.05, 0);
    wall(f, P.windowGlow, a, y, w, h, 0.02, 0.05, 1);
    wall(f, SLIT, a - w * 0.28, y, w * 0.1, h * 0.8, 0.012, 0.07, 1.3);
    wall(f, P.frameDark, a, y, 0.03, h, 0.022, 0.07);
    wall(f, P.frameDark, a, y, w, 0.03, 0.022, 0.07);
    wall(f, P.trimCream, a, y - h / 2 - 0.07, w + 0.18, 0.05, 0.11, 0);
    if (snowSill) wall(f, P.snowLit, a, y - h / 2 - 0.028, w + 0.12, 0.035, 0.09, 0);
  };

  const fFront: Face = { ax: "z", c: FRONT, s: 1 };
  const fBack: Face = { ax: "z", c: BACK, s: -1 };
  const fRight: Face = { ax: "x", c: X1, s: 1 };
  const fLeft: Face = { ax: "x", c: X0, s: -1 };
  const cFront: Face = { ax: "z", c: 0.25, s: 1 };
  const cBack: Face = { ax: "z", c: -0.85, s: -1 };

  // ================================================================ CORRIDOR
  {
    blk(P.labWhite, JOIN, X0, FLOOR, 2.3, -0.85, 0.25);
    blk(SHADE, JOIN, X0, FLOOR, 2.3, -0.858, -0.85); // shadow side
    blk(P.woodDark, JOIN, X0, 0.7, FLOOR, -0.9, 0.3); // floor slab
    for (const z of [-0.7, 0.15]) {
      cyl(P.metalGrey, 0.07, 0.07, 0.36, 6, [1.65, 0.48, z]);
      blk(P.woodDark, 1.54, 1.76, 0.66, 0.7, z - 0.11, z + 0.11);
    }
    // cream trim: corner posts, base board, top board
    for (const x of [JOIN + 0.035, X0 - 0.035])
      for (const z of [0.25, -0.85]) blk(P.trimCream, x - 0.035, x + 0.035, FLOOR, 2.3, z - 0.04, z + 0.04);
    for (const [z0, z1] of [
      [0.25, 0.28],
      [-0.88, -0.85],
    ] as [number, number][]) {
      blk(P.trimCream, JOIN, X0, FLOOR, 0.9, z0, z1);
      blk(P.trimCream, JOIN, X0, 2.2, 2.3, z0, z1);
    }
    // cream door-frame rim where the corridor meets the cabin wall
    blk(P.trimCream, JOIN, JOIN + 0.07, FLOOR, 2.4, -0.97, -0.88);
    blk(P.trimCream, JOIN, JOIN + 0.07, FLOOR, 2.4, 0.28, 0.37);
    blk(P.trimCream, JOIN, JOIN + 0.07, 2.3, 2.4, -0.97, 0.37);
    blk(P.trimCream, JOIN, JOIN + 0.07, FLOOR, 0.9, -0.97, 0.37);
    // windows
    windowOn(cFront, 1.65, 1.6, 0.32, 0.46, false);
    windowOn(cBack, 1.65, 1.6, 0.32, 0.46, false);
    // teal roof strip, snow lip and thick snow cap
    blk(P.labTeal, JOIN, X0 + 0.02, 2.3, 2.4, -0.93, 0.33);
    blk(P.snowShade, JOIN, X0 + 0.02, 2.4, 2.44, -0.97, 0.37);
    blk(P.snowLit, JOIN, X0, 2.44, 2.6, -0.93, 0.33);
    blk(P.snowLit, 1.42, 1.9, 2.6, 2.68, -0.7, 0.05);
  }

  // ================================================================ LAB BODY
  {
    blk(P.labWhite, X0, X1, FLOOR, TOP, BACK, FRONT);
    // dusky shadow overlays on the back and left walls
    blk(SHADE, X0, X1, FLOOR, TOP, BACK - 0.008, BACK);
    blk(SHADE, X0 - 0.008, X0, FLOOR, TOP, BACK, -0.85);
    blk(SHADE, X0 - 0.008, X0, FLOOR, TOP, 0.25, FRONT);
    // floor slab and piles
    blk(P.woodDark, X0 - 0.05, X1 + 0.05, 0.7, FLOOR, BACK - 0.05, FRONT + 0.05);
    for (const x of [2.35, 3.65])
      for (const z of [-1.5, -0.3, 0.9]) {
        cyl(P.metalGrey, 0.09, 0.09, 0.4, 6, [x, GROUND - 0.05 + 0.23, z]);
        blk(P.woodDark, x - 0.14, x + 0.14, 0.66, 0.7, z - 0.14, z + 0.14);
      }
    // base trim and teal band stripes wrapping the body
    blk(P.trimCream, X0 - 0.03, X1 + 0.03, FLOOR, 0.92, BACK - 0.03, FRONT + 0.03);
    blk(P.labTeal, X0 - 0.02, X1 + 0.02, 1.35, 1.45, BACK - 0.02, FRONT + 0.02);
    blk(P.labTeal, X0 - 0.02, X1 + 0.02, 2.55, 2.65, BACK - 0.02, FRONT + 0.02);
    // safety orange corner posts
    for (const x of [X0, X1])
      for (const z of [BACK, FRONT]) blk(P.safetyOrange, x - 0.06, x + 0.06, FLOOR, TOP, z - 0.06, z + 0.06);
  }

  // ================================================================ SHED ROOF
  const RC = new THREE.Vector3(CX, 2.92, -0.3);
  const TILT = -3; // front edge higher: snow slides off the back
  const roofPt = (l: V): V => {
    const v = new THREE.Vector3(l[0], l[1], l[2]).applyEuler(new THREE.Euler(TILT * DEG, 0, 0)).add(RC);
    return [v.x, v.y, v.z];
  };
  const roofBox = (color: string, size: V, l: V) => box(color, size, roofPt(l), [TILT, 0, 0]);
  const snowTop = (z: number) => RC.y + 0.21 + (z - RC.z) * Math.tan(-TILT * DEG);
  {
    roofBox(P.labTeal, [2.2, 0.1, 3.3], [0, 0, 0]);
    roofBox(P.snowShade, [2.24, 0.03, 3.34], [0, 0.065, 0]);
    roofBox(P.snowLit, [2.1, 0.13, 3.2], [0, 0.145, 0]);
    // cream fascia boards
    roofBox(P.trimCream, [2.24, 0.14, 0.04], [0, -0.01, 1.67]);
    roofBox(P.trimCream, [2.24, 0.14, 0.04], [0, -0.01, -1.67]);
    for (const s of [1, -1]) roofBox(P.trimCream, [0.04, 0.14, 3.34], [s * 1.11, -0.01, 0]);
    // thick snow overhang on the front edge and lumpy drifts
    roofBox(P.snowShade, [2.0, 0.05, 0.22], [0, 0.07, 1.66]);
    roofBox(P.snowLit, [2.0, 0.15, 0.2], [0, 0.17, 1.64]);
    roofBox(P.snowLit, [0.7, 0.1, 0.8], [-0.62, 0.26, 0.9]);
    roofBox(P.snowLit, [0.5, 0.08, 0.6], [0.65, 0.25, 0.45]);
    roofBox(P.snowLit, [0.9, 0.09, 0.5], [0.1, 0.25, -1.35]);
  }

  // ================================================================ FRONT FACE
  {
    // door
    const dy = 1.65;
    wall(fFront, P.frameDark, CX, dy + 0.02, 0.94, 1.7, 0.04, 0);
    wall(fFront, P.metalGrey, CX, dy, 0.8, 1.6, 0.03, 0.04);
    wall(fFront, P.safetyOrange, CX - 0.27, dy, 0.1, 1.6, 0.01, 0.07);
    wall(fFront, P.metalDark, CX, 1.0, 0.8, 0.22, 0.012, 0.07); // kick plate
    wall(fFront, P.metalDark, CX + 0.12, 1.5, 0.3, 0.04, 0.03, 0.07); // push bar
    wall(fFront, P.metalDark, CX + 0.3, 1.5, 0.05, 0.16, 0.05, 0.07); // handle
    for (const hy of [1.1, 2.1]) wall(fFront, P.metalDark, CX - 0.38, hy, 0.04, 0.12, 0.05, 0.07);
    // porthole
    cyl(P.frameDark, 0.17, 0.17, 0.03, 8, [CX + 0.07, 2.0, FRONT + 0.085], [90, 0, 0]);
    cyl(P.windowGlow, 0.125, 0.125, 0.02, 8, [CX + 0.07, 2.0, FRONT + 0.1], [90, 0, 0], 1);
    // emblem sign above the door: signalRed disc with labWhite snowflake / atom arms
    wall(fFront, P.frameDark, CX, 2.75, 0.52, 0.28, 0.05, 0);
    wall(fFront, P.trimCream, CX, 2.75, 0.47, 0.23, 0.02, 0.05);
    cyl(P.signalRed, 0.105, 0.105, 0.02, 8, [CX, 2.75, FRONT + 0.08], [90, 0, 0]);
    for (const a of [0, 60, 120]) box(P.labWhite, [0.19, 0.022, 0.012], [CX, 2.75, FRONT + 0.092], [0, 0, a]);
    box(P.labWhite, [0.04, 0.04, 0.014], [CX, 2.75, FRONT + 0.092], [0, 0, 45]);
    // two wide windows
    windowOn(fFront, 2.3, 1.9, 0.4, 0.75);
    windowOn(fFront, 3.7, 1.9, 0.4, 0.75);

    // landing and two steps down to the ground, small snow cap on each step
    blk(P.wood, 2.45, 3.55, 0.72, FLOOR, FRONT, 1.4);
    blk(P.woodDark, 2.47, 3.53, GROUND, 0.72, FRONT, 1.38);
    blk(P.woodDark, 2.47, 3.53, GROUND, 0.6, 1.4, 1.48);
    blk(P.wood, 2.45, 3.55, 0.6, 0.65, 1.4, 1.5);
    blk(P.woodDark, 2.47, 3.53, GROUND, 0.45, 1.5, 1.58);
    blk(P.wood, 2.45, 3.55, 0.45, 0.5, 1.5, 1.6);
    blk(P.snowLit, 2.55, 3.45, 0.65, 0.69, 1.43, 1.49);
    blk(P.snowLit, 2.55, 3.45, 0.5, 0.54, 1.53, 1.59);
    // side handrail
    rod(P.metalGrey, [3.52, FLOOR, 1.27], [3.52, 1.38, 1.27], 0.025);
    rod(P.metalGrey, [3.52, 0.5, 1.56], [3.52, 1.08, 1.56], 0.025);
    rod(P.metalGrey, [3.52, 1.38, 1.27], [3.52, 1.08, 1.56], 0.025);
    rod(P.metalGrey, [3.52, 1.2, 1.27], [3.52, 0.95, 1.56], 0.018);
  }

  // ================================================================ RIGHT WALL (x 4.0)
  {
    // vent grille: border, dark backing, stacked slats
    wall(fRight, P.metalGrey, 0.55, 1.85, 0.6, 0.54, 0.04, 0);
    wall(fRight, P.frameDark, 0.55, 1.85, 0.5, 0.44, 0.02, 0.04);
    for (let i = 0; i < 6; i++) wall(fRight, P.metalDark, 0.55, 1.85 - 0.175 + i * 0.07, 0.5, 0.04, 0.03, 0.045);
    // round exhaust duct with a cap
    const dz = -0.45;
    const dy = 2.0;
    cyl(P.metalGrey, 0.15, 0.15, 0.03, 8, [X1 + 0.015, dy, dz], [0, 0, 90]);
    cyl(P.metalDark, 0.1, 0.1, 0.09, 8, [X1 + 0.055, dy, dz], [0, 0, 90]);
    cyl(P.metalGrey, 0.15, 0.15, 0.02, 8, [X1 + 0.095, dy, dz], [0, 0, 90]);
    for (const a of [0, 120, 240]) {
      const r = (a * DEG);
      ball(P.safetyOrange, 0.0, [0, 0, 0]);
      void r;
    }
    // a small window and a warning stripe near the back
    windowOn(fRight, -1.2, 1.9, 0.4, 0.6);
    wall(fRight, P.safetyOrange, -0.45, 1.5 - 0.35, 0.34, 0.06, 0.012, 0);
  }

  // ================================================================ LEFT WALL (x 2.0, shadow side)
  windowOn(fLeft, 0.75, 1.9, 0.3, 0.5, false);

  // ================================================================ BACK WALL
  {
    const by = M.labBackWall[1];
    wall(fBack, P.metalDark, CX, by, 0.42, 0.52, 0.14, 0); // cable inlet box
    wall(fBack, P.metalGrey, CX, by, 0.46, 0.56, 0.03, 0.14); // lid
    for (const dx of [-0.17, 0.17])
      for (const dy of [-0.2, 0.2]) wall(fBack, P.frameDark, CX + dx, by + dy, 0.04, 0.04, 0.02, 0.17);
    cyl(P.metalGrey, 0.05, 0.05, 0.12, 6, [CX, by - 0.32, BACK - 0.07]); // cable gland
    wall(fBack, P.frameDark, CX, by + 0.0, 0.14, 0.14, 0.02, 0.17, 0);
    // hazard plate
    wall(fBack, P.safetyOrange, 2.4, 1.9, 0.3, 0.3, 0.02, 0);
    wall(fBack, P.frameDark, 2.4, 1.93, 0.04, 0.14, 0.012, 0.02);
    wall(fBack, P.frameDark, 2.4, 1.77, 0.04, 0.04, 0.012, 0.02);
  }

  // ================================================================ RADOME
  {
    const rx = CX;
    const rz = -0.8;
    const base = snowTop(rz) - 0.07;
    const R = 0.66;
    const SY = 0.7;
    const cy = base + 0.02; // dome centre height
    cyl(P.metalDark, 0.72, 0.72, 0.14, 8, [rx, base, rz]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      box(P.metalGrey, [0.07, 0.05, 0.07], [rx + Math.cos(a) * 0.72, base + 0.08, rz + Math.sin(a) * 0.72], [0, -a / DEG, 0]);
    }
    put(new THREE.SphereGeometry(R, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.labWhite, mat([rx, cy + 0.04, rz], [0, 0, 0], [1, SY, 1]));
    // panel seams: latitude rings and meridian arcs
    for (const th of [45, 67.5]) {
      const rr = R * Math.sin(th * DEG) * 1.02;
      const yy = cy + 0.04 + R * SY * Math.cos(th * DEG);
      put(new THREE.TorusGeometry(rr, 0.014, 4, 8), P.labTeal, mat([rx, yy, rz], [90, 0, 0]));
    }
    for (const a of [0, 45, 90, 135])
      put(new THREE.TorusGeometry(R * 1.02, 0.014, 4, 8, Math.PI), P.labTeal, mat([rx, cy + 0.04, rz], [0, a, 0], [1, SY, 1]));
    // beacon
    const topY = cy + 0.04 + R * SY;
    cyl(P.metalDark, 0.05, 0.07, 0.06, 6, [rx, topY, rz]);
    ball(P.signalRed, 0.05, [rx, topY + 0.06, rz], 1.4);
  }

  // ================================================================ WEATHER SCREEN
  {
    const cx = 2.5;
    const cz = 0.5;
    const base = snowTop(cz) - 0.03;
    for (const dx of [-0.14, 0.14])
      for (const dz of [-0.11, 0.11]) rod(P.metalGrey, [cx + dx, base, cz + dz], [cx + dx, base + 0.2, cz + dz], 0.02);
    const y0 = base + 0.2;
    blk(P.labWhite, cx - 0.18, cx + 0.18, y0, y0 + 0.28, cz - 0.15, cz + 0.15);
    for (let i = 0; i < 5; i++) {
      const y = y0 + 0.03 + i * 0.05;
      blk(LOUVER, cx - 0.16, cx + 0.16, y, y + 0.025, cz + 0.15, cz + 0.17);
      blk(LOUVER, cx - 0.16, cx + 0.16, y, y + 0.025, cz - 0.17, cz - 0.15);
    }
    for (const s of [1, -1])
      for (let i = 0; i < 3; i++) {
        const y = y0 + 0.05 + i * 0.07;
        if (s > 0) blk(LOUVER, cx + 0.18, cx + 0.2, y, y + 0.03, cz - 0.12, cz + 0.12);
        else blk(LOUVER, cx - 0.2, cx - 0.18, y, y + 0.03, cz - 0.12, cz + 0.12);
      }
    blk(P.labWhite, cx - 0.22, cx + 0.22, y0 + 0.28, y0 + 0.32, cz - 0.19, cz + 0.19);
    blk(P.snowLit, cx - 0.2, cx + 0.2, y0 + 0.32, y0 + 0.37, cz - 0.17, cz + 0.17);
  }

  // ================================================================ ANEMOMETER
  {
    const ax = 3.75;
    const az = 0.8;
    const base = snowTop(az) - 0.03;
    cyl(P.metalDark, 0.08, 0.1, 0.06, 6, [ax, base + 0.02, az]);
    rod(P.metalGrey, [ax, base, az], [ax, base + 0.58, az], 0.018);
    const hy = base + 0.58;
    cyl(P.metalDark, 0.04, 0.04, 0.06, 6, [ax, hy, az]);
    for (const a of [0, 120, 240]) {
      const dx = Math.cos(a * DEG) * 0.26;
      const dz = Math.sin(a * DEG) * 0.26;
      rod(P.metalDark, [ax, hy + 0.01, az], [ax + dx, hy + 0.01, az + dz], 0.012);
      ball(P.signalRed, 0.05, [ax + dx, hy + 0.01, az + dz], 0, [1, 0.8, 1]);
    }
    // roof vent pipe near the back
    const vx = 3.7;
    const vz = -1.3;
    const vb = snowTop(vz) - 0.04;
    cyl(P.metalGrey, 0.055, 0.055, 0.28, 6, [vx, vb + 0.14, vz]);
    put(new THREE.ConeGeometry(0.1, 0.08, 6), P.metalDark, mat([vx, vb + 0.32, vz]));
  }

  // ---------------------------------------------------------------- build parts
  for (const { color, strength, geos } of buckets.values()) {
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], flat: true });
    if (strength > 0) glow(part, strength);
  }
}
```

<!-- call: commsPower -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type V = [number, number, number];

export function buildCommsPower({ b, P, M }: Ctx) {
  const R = rng(11);
  const FLOOR = M.terrainTop[1];
  const groups = new Map<string, THREE.BufferGeometry[]>();
  let counter = 0;

  // ---------- helpers ----------
  const v3 = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
  const mat = (pos: V, rot: V = [0, 0, 0]) =>
    new THREE.Matrix4().compose(
      v3(pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(1, 1, 1),
    );
  const bake = (geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m);
    return g;
  };
  // merged: many small pieces of one colour become one part
  const put = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const list = groups.get(color) ?? [];
    list.push(bake(geo, m));
    groups.set(color, list);
  };
  // solo: a hero piece that stays its own part
  const solo = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4, name: string) =>
    b.part(bake(geo, m), color, { at: [0, 0, 0], flat: true, name: `comms.${name}.${counter++}` });
  const add = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4, name?: string) => {
    if (name) solo(color, geo, m, name);
    else put(color, geo, m);
  };
  const box = (color: string, size: V, pos: V, rot?: V, name?: string) =>
    add(color, new THREE.BoxGeometry(size[0], size[1], size[2]), mat(pos, rot), name);
  const cyl = (color: string, rTop: number, rBot: number, h: number, sides: number, pos: V, rot?: V, name?: string) =>
    add(color, new THREE.CylinderGeometry(rTop, rBot, h, sides), mat(pos, rot), name);
  const rod = (
    color: string,
    a: V,
    c: V,
    r0: number,
    o: { r1?: number; sides?: number; name?: string; open?: boolean } = {},
  ) => {
    const A = v3(a);
    const C = v3(c);
    const d = C.clone().sub(A);
    const len = d.length();
    if (len < 1e-5) return;
    const g = new THREE.CylinderGeometry(o.r1 ?? r0, r0, len, o.sides ?? 4, 1, o.open ?? false);
    const m = new THREE.Matrix4().compose(
      A.clone().add(C).multiplyScalar(0.5),
      aim(d.normalize()),
      new THREE.Vector3(1, 1, 1),
    );
    add(color, g, m, o.name);
  };
  const droop = (a: V, c: V, sag: number, segs: number, r: number, color: string) => {
    const pts: V[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      pts.push([
        a[0] + (c[0] - a[0]) * t,
        a[1] + (c[1] - a[1]) * t - 4 * sag * t * (1 - t),
        a[2] + (c[2] - a[2]) * t,
      ]);
    }
    for (let i = 0; i < segs; i++) rod(color, pts[i], pts[i + 1], r, { sides: 5 });
  };

  // =====================================================================
  // (1) RADIO MAST
  // =====================================================================
  const MX = M.mastBase[0];
  const MZ = M.mastBase[2];
  const yb = 0.66;
  const yt = 6.3;
  const N = 10;
  const hw = (y: number) => 0.3 - (0.2 * (y - yb)) / (yt - yb);
  const ys = Array.from({ length: N + 1 }, (_, i) => yb + ((yt - yb) * i) / N);
  const SG: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const corner = (k: number, y: number): V => [MX + SG[k][0] * hw(y), y, MZ + SG[k][1] * hw(y)];

  // concrete footing with a thick snow cap (shade lip + lit top)
  box(P.rockLight, [1.0, 0.26, 1.0], [MX, 0.43, MZ], undefined, "mastFooting");
  box(P.snowShade, [1.06, 0.05, 1.06], [MX, 0.585, MZ], undefined, "mastSnowLip");
  box(P.snowLit, [0.96, 0.05, 0.96], [MX, 0.635, MZ], undefined, "mastSnowCap");
  for (let k = 0; k < 4; k++) {
    const c = corner(k, yb);
    box(P.metalDark, [0.12, 0.03, 0.12], [c[0], yb + 0.01, c[2]]);
  }

  // legs
  for (let k = 0; k < 4; k++) rod(P.metalGrey, corner(k, yb), corner(k, yt), 0.032, { r1: 0.026, sides: 6 });
  // rungs, diagonals
  for (let i = 0; i <= N; i++)
    for (let k = 0; k < 4; k++) rod(P.metalGrey, corner(k, ys[i]), corner((k + 1) % 4, ys[i]), 0.015, { open: true });
  for (let i = 0; i < N; i++)
    for (let f = 0; f < 4; f++) {
      const k0 = f;
      const k1 = (f + 1) % 4;
      if ((i + f) % 2 === 0) rod(P.metalDark, corner(k0, ys[i]), corner(k1, ys[i + 1]), 0.013, { open: true });
      else rod(P.metalDark, corner(k1, ys[i]), corner(k0, ys[i + 1]), 0.013, { open: true });
    }
  // red / white striped section near the top
  for (let i = 7; i <= 9; i++) {
    const col = i % 2 === 1 ? P.signalRed : P.labWhite;
    for (let k = 0; k < 4; k++) {
      const a = corner(k, ys[i] + 0.012);
      const c = corner(k, ys[i + 1] - 0.012);
      rod(col, a, c, 0.05, { sides: 6 });
    }
  }
  // feeder cable running down one leg, with clips and a junction box
  const off: V = [0, 0, 0.045];
  const fa = corner(0, 5.0);
  const fb = corner(0, 0.95);
  rod(P.frameDark, [fa[0] + off[0], fa[1], fa[2] + off[2]], [fb[0], fb[1], fb[2] + 0.045], 0.011, { sides: 5 });
  for (let y = 1.4; y < 5.0; y += 0.56) {
    const c = corner(0, y);
    box(P.metalDark, [0.045, 0.04, 0.05], [c[0], y, c[2] + 0.04]);
  }
  rod(P.frameDark, [fb[0], fb[1], fb[2] + 0.045], [MX + 0.3, 0.8, MZ + 0.4], 0.011, { sides: 5 });
  box(P.metalDark, [0.2, 0.16, 0.12], [MX + 0.3, 0.74, MZ + 0.42], undefined, "mastJunction");
  box(P.signalRed, [0.04, 0.04, 0.012], [MX + 0.3, 0.76, MZ + 0.486]);

  // top platform, pedestal, beacon and cage
  box(P.metalDark, [0.36, 0.04, 0.36], [MX, yt + 0.02, MZ], undefined, "mastPlatform");
  box(P.snowLit, [0.26, 0.02, 0.1], [MX - 0.03, yt + 0.05, MZ - 0.12]);
  cyl(P.metalDark, 0.06, 0.07, 0.1, 6, [MX, yt + 0.09, MZ]);
  glow(
    solo(P.signalRed, new THREE.SphereGeometry(0.09, 8, 6), mat([MX, 6.5, MZ]), "beacon"),
    1.6,
  );
  for (const [sx, sz] of SG) {
    rod(P.metalDark, [MX + sx * 0.14, yt + 0.04, MZ + sz * 0.14], [MX + sx * 0.14, 6.6, MZ + sz * 0.14], 0.012, {
      sides: 4,
    });
  }
  for (let k = 0; k < 4; k++) {
    const a = SG[k];
    const c = SG[(k + 1) % 4];
    rod(P.metalDark, [MX + a[0] * 0.14, 6.59, MZ + a[1] * 0.14], [MX + c[0] * 0.14, 6.59, MZ + c[1] * 0.14], 0.01);
  }

  // parabolic dish, aimed to +Z and toward the model's left (+X)
  {
    const dir = new THREE.Vector3(0.42, 0.1, 1).normalize();
    const dxz = new THREE.Vector3(0.42, 0, 1).normalize();
    const T = new THREE.Vector3(MX, 5.0, MZ);
    const D0 = T.clone().addScaledVector(dxz, 0.52);
    box(P.metalDark, [0.34, 0.1, 0.34], [MX, 5.0, MZ]);
    const armA = T.clone().addScaledVector(dxz, 0.1);
    rod(P.metalDark, armA.toArray() as V, D0.clone().addScaledVector(dir, -0.02).toArray() as V, 0.03, { sides: 6 });
    for (const sy of [1, -1]) {
      rod(
        P.metalDark,
        [armA.x, 5.0 + sy * 0.22, armA.z],
        [D0.x, D0.y + sy * 0.06, D0.z],
        0.018,
        { sides: 5 },
      );
    }
    const bowl: [number, number][] = [
      [0, 0],
      [0.09, 0.012],
      [0.18, 0.048],
      [0.27, 0.108],
      [0.36, 0.19],
      [0.36, 0.206],
      [0.27, 0.124],
      [0.18, 0.064],
      [0.09, 0.028],
      [0, 0.018],
    ];
    b.lathe(bowl, { at: D0, axis: dir, segments: 8, color: P.labWhite, name: "comms.dish" });
    const F = D0.clone().addScaledVector(dir, 0.19);
    rod(P.metalDark, D0.clone().addScaledVector(dir, 0.02).toArray() as V, F.toArray() as V, 0.012, { sides: 6 });
    add(
      P.metalDark,
      new THREE.CylinderGeometry(0.018, 0.05, 0.1, 6),
      new THREE.Matrix4().compose(F, aim(dir.clone()), new THREE.Vector3(1, 1, 1)),
      "dishFeed",
    );
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
    const side = new THREE.Vector3().crossVectors(dir, up).normalize();
    for (const dv of [up, up.clone().negate(), side, side.clone().negate()]) {
      const rim = D0.clone().addScaledVector(dir, 0.2).addScaledVector(dv, 0.35);
      rod(P.metalGrey, rim.toArray() as V, F.toArray() as V, 0.007, { sides: 4 });
    }
    // snow on the lower inside of the bowl
    box(P.snowLit, [0.2, 0.03, 0.08], [D0.x + dir.x * 0.1, D0.y - 0.2, D0.z + dir.z * 0.1], [0, 0.4, 0]);
  }

  // pair of yagi antennas
  const yagi = (sd: number, yaw: number) => {
    const c: V = [MX + sd * 0.34, 5.72, MZ + 0.05];
    const Mr = mat(c, [0, yaw, 0]);
    const W = (p: V): V => v3(p).applyMatrix4(Mr).toArray() as V;
    rod(P.labWhite, W([0, 0, -0.45]), W([0, 0, 0.45]), 0.017, { sides: 6 });
    const els: [number, number][] = [
      [-0.38, 0.17],
      [-0.24, 0.15],
      [-0.06, 0.13],
      [0.12, 0.115],
      [0.3, 0.1],
      [0.44, 0.085],
    ];
    for (const [z, h] of els) rod(P.metalGrey, W([-h, 0, z]), W([h, 0, z]), 0.01, { sides: 4 });
    const hv = hw(5.72);
    rod(P.metalDark, [MX + sd * hv, 5.72, MZ], W([0, 0, 0]), 0.016, { sides: 5 });
    rod(P.metalDark, [MX + sd * hv, 5.72, MZ - hv], W([0, 0, -0.3]), 0.014, { sides: 5 });
    add(P.metalDark, new THREE.BoxGeometry(0.06, 0.06, 0.06), mat(c, [0, yaw, 0]));
    // driven element marker
    rod(P.signalRed, W([-0.03, 0, -0.24]), W([0.03, 0, -0.24]), 0.014, { sides: 4 });
  };
  yagi(1, -0.2);
  yagi(-1, 0.2);

  // guy wires: three tiers to four rock anchors
  const anchors: [number, number][] = [
    [-1.75, -3.1],
    [-2.55, -2.3],
    [-4.0, -2.2],
    [-3.35, -4.2],
  ];
  const tiers = [2.1, 3.9, 5.5];
  anchors.forEach(([ax, az], ai) => {
    const yaw = 0.3 + ai * 0.5;
    solo(P.rock, new THREE.BoxGeometry(0.3, 0.2, 0.3), mat([ax, 0.4, az], [0, yaw, 0]), "anchor");
    box(P.snowShade, [0.32, 0.04, 0.32], [ax, 0.52, az], [0, yaw, 0]);
    box(P.snowLit, [0.28, 0.04, 0.28], [ax, 0.56, az], [0, yaw, 0]);
    box(P.rockLight, [0.1, 0.1, 0.1], [ax + 0.14, 0.4, az + 0.14], [0.3, yaw, 0.2]);
    add(P.metalDark, new THREE.TorusGeometry(0.06, 0.014, 5, 8), mat([ax, 0.64, az], [Math.PI / 2, 0, 0]));
    const dx = ax - MX;
    const dz = az - MZ;
    const L = Math.hypot(dx, dz);
    const end: V = [ax - (dx / L) * 0.05, 0.64, az - (dz / L) * 0.05];
    for (const ty of tiers) {
      const sx = dx > 0 ? 1 : -1;
      const sz = dz > 0 ? 1 : -1;
      const a: V = [MX + sx * (hw(ty) + 0.02), ty, MZ + sz * (hw(ty) + 0.02)];
      box(P.metalDark, [0.07, 0.05, 0.07], a);
      rod(P.metalDark, a, end, 0.008, { sides: 4, open: true });
      const p: V = [a[0] + (end[0] - a[0]) * 0.22, a[1] + (end[1] - a[1]) * 0.22, a[2] + (end[2] - a[2]) * 0.22];
      put(P.trimCream, new THREE.SphereGeometry(0.024, 6, 4), mat(p));
    }
  });

  // =====================================================================
  // (2) WIND TURBINE
  // =====================================================================
  const TX = M.turbineBase[0];
  const TZ = M.turbineBase[2];
  const HUB = M.turbineHub;
  const TR = (y: number) => 0.22 - (0.12 * (y - 0.6)) / 4.3;
  const rotFlat: V = [0, Math.PI / 8, 0];

  solo(P.rockLight, new THREE.CylinderGeometry(0.4, 0.43, 0.26, 8), mat([TX, 0.43, TZ], rotFlat), "turbineFooting");
  solo(P.snowShade, new THREE.CylinderGeometry(0.43, 0.43, 0.05, 8), mat([TX, 0.585, TZ], rotFlat), "turbineSnowLip");
  solo(P.snowLit, new THREE.CylinderGeometry(0.39, 0.4, 0.05, 8), mat([TX, 0.635, TZ], rotFlat), "turbineSnowCap");
  solo(
    P.labWhite,
    new THREE.CylinderGeometry(0.1, 0.22, 4.3, 8),
    mat([TX, 2.75, TZ], rotFlat),
    "turbineTower",
  );
  for (const by of [3.8, 4.15]) {
    const h = 0.14;
    cyl(P.safetyOrange, TR(by + h / 2) + 0.008, TR(by - h / 2) + 0.008, h, 8, [TX, by, TZ], rotFlat);
  }
  // shaded sliver of tower on the dusk side
  box(P.snowShade, [0.04, 0.5, 0.04], [TX + 0.17, 0.9, TZ + 0.1], undefined);
  // door panel at the base
  box(P.frameDark, [0.2, 0.36, 0.03], [TX, 0.8, TZ + 0.205]);
  box(P.safetyOrange, [0.16, 0.31, 0.03], [TX, 0.8, TZ + 0.222], undefined, "turbineDoor");
  box(P.frameDark, [0.025, 0.07, 0.02], [TX + 0.05, 0.8, TZ + 0.245]);
  box(P.trimCream, [0.16, 0.025, 0.012], [TX, 0.9, TZ + 0.24]);

  // nacelle
  cyl(P.metalDark, 0.13, 0.13, 0.08, 8, [TX, 4.84, TZ]);
  box(P.labWhite, [0.36, 0.4, 0.72], [TX, 5.0, -3.16], undefined, "nacelle");
  box(P.labTeal, [0.376, 0.07, 0.74], [TX, 5.0, -3.16], undefined, "nacelleStripe");
  box(P.metalGrey, [0.12, 0.05, 0.2], [TX, 5.225, -3.2]);
  box(P.metalDark, [0.2, 0.012, 0.012], [TX, 5.252, -3.2]);
  box(P.snowLit, [0.22, 0.03, 0.34], [TX - 0.02, 5.215, -3.34]);
  glow(solo(P.signalRed, new THREE.SphereGeometry(0.03, 6, 4), mat([TX, 5.25, -3.5]), "nacelleLight"), 1.4);
  // hub and spinner
  solo(
    P.metalGrey,
    new THREE.CylinderGeometry(0.18, 0.18, 0.14, 8),
    mat([HUB[0], HUB[1], -2.74], [Math.PI / 2, 0, 0]),
    "hub",
  );
  solo(
    P.safetyOrange,
    new THREE.ConeGeometry(0.18, 0.28, 8),
    mat([HUB[0], HUB[1], -2.67 + 0.14], [Math.PI / 2, 0, 0]),
    "spinner",
  );
  // blades
  const BLADE: [number, number][] = [
    [0.16, 0.07],
    [0.5, 0.1],
    [1.0, 0.06],
    [1.3, 0.03],
    [1.3, -0.03],
    [1.0, -0.07],
    [0.55, -0.2],
    [0.3, -0.18],
    [0.16, -0.09],
  ];
  const TIP: [number, number][] = [
    [1.02, 0.058],
    [1.3, 0.03],
    [1.3, -0.03],
    [1.02, -0.0673],
  ];
  for (const deg of [98, 218, 338]) {
    const a = (deg * Math.PI) / 180;
    const xd: V = [Math.cos(a), Math.sin(a), 0];
    const yd: V = [-Math.sin(a), Math.cos(a), 0];
    b.extrude(BLADE, { at: HUB, x: xd, y: yd, thickness: 0.035, bevel: 0.006, color: P.labWhite, name: "comms.blade" });
    b.extrude(TIP, { at: HUB, x: xd, y: yd, thickness: 0.042, color: P.safetyOrange, name: "comms.bladeTip" });
    // root cuff
    b.extrude(
      [
        [0.14, 0.09],
        [0.34, 0.1],
        [0.34, -0.1],
        [0.14, -0.1],
      ],
      { at: HUB, x: xd, y: yd, thickness: 0.05, color: P.metalGrey, name: "comms.bladeRoot" },
    );
  }
  // tail vane
  b.extrude(
    [
      [0, -0.08],
      [0.17, 0.02],
      [0.14, 0.32],
      [0.0, 0.14],
    ],
    { at: [TX, 5.1, -3.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.025, color: P.labWhite, name: "comms.vane" },
  );
  b.extrude(
    [
      [0.1, 0.05],
      [0.165, 0.05],
      [0.145, 0.3],
      [0.1, 0.22],
    ],
    { at: [TX, 5.1, -3.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.032, color: P.safetyOrange, name: "comms.vaneTip" },
  );

  // =====================================================================
  // (3) POWER: solar array, battery, cables
  // =====================================================================
  const th = (32 * Math.PI) / 180;
  const PZ = -3.05;
  const PY = 0.83;
  const PXS = [-1.07, -0.52, 0.03];
  const Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(th, 0, 0));
  const panelM = (x: number) => new THREE.Matrix4().compose(new THREE.Vector3(x, PY, PZ), Q, new THREE.Vector3(1, 1, 1));
  const lm = (pm: THREE.Matrix4, p: V) => pm.clone().multiply(mat(p));
  const pw = (pm: THREE.Matrix4, p: V): V => v3(p).applyMatrix4(pm).toArray() as V;

  const rearRail: V[] = [];
  const frontRail: V[] = [];
  PXS.forEach((px, pi) => {
    const pm = panelM(px);
    solo(P.frameDark, new THREE.BoxGeometry(0.54, 0.04, 0.64), pm, "panelFrame");
    solo(P.iceDeep, new THREE.BoxGeometry(0.46, 0.016, 0.56), lm(pm, [0, 0.026, 0]), "panelCells");
    for (const gx of [-0.115, 0, 0.115])
      put(P.metalGrey, new THREE.BoxGeometry(0.007, 0.004, 0.56), lm(pm, [gx, 0.036, 0]));
    for (const gz of [-0.14, 0, 0.14])
      put(P.metalGrey, new THREE.BoxGeometry(0.46, 0.004, 0.007), lm(pm, [0, 0.036, gz]));
    // snow dusting the upper edge
    const w = 0.34 + R() * 0.16;
    const xo = (R() - 0.5) * 0.06;
    put(P.snowShade, new THREE.BoxGeometry(w + 0.03, 0.016, 0.1), lm(pm, [xo, 0.044, -0.27]));
    put(P.snowLit, new THREE.BoxGeometry(w, 0.026, 0.07 + R() * 0.03), lm(pm, [xo, 0.05, -0.28]));
    // legs
    for (const sx of [-0.2, 0.2]) {
      for (const sz of [-0.26, 0.26]) {
        const top = pw(pm, [sx, -0.02, sz]);
        const g: V = [top[0], FLOOR - 0.02, top[2]];
        rod(P.metalGrey, g, top, 0.021, { sides: 6 });
        box(P.metalDark, [0.09, 0.03, 0.09], [g[0], FLOOR + 0.005, g[2]]);
        if (sz < 0 && ((pi === 0 && sx < 0) || (pi === 2 && sx > 0))) rearRail.push(top);
        if (sz > 0 && ((pi === 0 && sx < 0) || (pi === 2 && sx > 0))) frontRail.push(top);
      }
    }
  });
  rod(P.metalGrey, rearRail[0], rearRail[1], 0.016, { sides: 5 });
  rod(P.metalGrey, frontRail[0], frontRail[1], 0.016, { sides: 5 });

  // battery bank
  const BX = 0.12;
  const BZ = -3.5;
  solo(P.metalDark, new THREE.BoxGeometry(0.34, 0.3, 0.2), mat([BX, 0.48, BZ]), "battery");
  solo(P.safetyOrange, new THREE.BoxGeometry(0.37, 0.04, 0.23), mat([BX, 0.65, BZ]), "batteryLid");
  box(P.labTeal, [0.28, 0.11, 0.012], [BX, 0.5, BZ + 0.106]);
  box(P.windowGlow, [0.035, 0.035, 0.012], [BX - 0.08, 0.5, BZ + 0.114]);
  box(P.windowGlow, [0.035, 0.035, 0.012], [BX - 0.03, 0.5, BZ + 0.114]);
  box(P.signalRed, [0.035, 0.035, 0.012], [BX + 0.02, 0.5, BZ + 0.114]);
  box(P.metalGrey, [0.06, 0.012, 0.012], [BX + 0.09, 0.5, BZ + 0.114]);
  cyl(P.signalRed, 0.025, 0.025, 0.05, 6, [BX + 0.09, 0.695, BZ]);
  cyl(P.metalGrey, 0.025, 0.025, 0.05, 6, [BX - 0.09, 0.695, BZ]);
  box(P.snowShade, [0.2, 0.018, 0.16], [BX - 0.05, 0.685, BZ + 0.01]);
  box(P.snowLit, [0.17, 0.026, 0.12], [BX - 0.05, 0.704, BZ + 0.01]);
  // cables: panels -> battery, battery -> ground
  droop(rearRail[1], [BX + 0.09, 0.72, BZ], 0.06, 4, 0.011, P.frameDark);
  droop(frontRail[1], [BX - 0.09, 0.72, BZ + 0.03], 0.07, 5, 0.011, P.frameDark);

  // turbine power cable: tower base -> lab back wall
  {
    const wall = M.labBackWall;
    const start: V = [TX, 0.98, TZ + 0.2];
    const end: V = [wall[0], wall[1], wall[2] - 0.015];
    box(P.metalDark, [0.07, 0.07, 0.05], [start[0], start[1], start[2] - 0.0]);
    box(P.metalDark, [0.08, 0.08, 0.04], [end[0], end[1], end[2] - 0.0]);
    droop(start, end, 0.24, 10, 0.013, P.frameDark);
  }

  // ---------- flush merged geometry ----------
  let gi = 0;
  groups.forEach((list, color) => {
    const merged = mergeGeometries(list);
    if (merged) b.part(merged, color, { at: [0, 0, 0], flat: true, name: `comms.merged.${gi++}` });
  });
}
```

<!-- call: yard -->

```ts
import * as THREE from "three";
import { aim } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildYard({ b, P, M }: Ctx) {
  const F = M.terrainTop[1]; // snow top, y = 0.35
  const ROPE = "#c9b48a";
  type V = [number, number, number];
  const D = Math.PI / 180;
  const ONE = new THREE.Vector3(1, 1, 1);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  // ---------------------------------------------------------------------------------------------
  // Collector: every piece is built in model space, then merged per colour into one part each.
  // ---------------------------------------------------------------------------------------------
  const bag = new Map<string, THREE.BufferGeometry[]>();
  let base = new THREE.Matrix4();

  function put(g: THREE.BufferGeometry, color: string, pos: V, rot?: V | THREE.Quaternion) {
    const geo = g.index ? g.toNonIndexed() : g;
    geo.deleteAttribute("uv");
    const q = rot instanceof THREE.Quaternion
      ? rot
      : new THREE.Quaternion().setFromEuler(
          new THREE.Euler((rot?.[0] ?? 0) * D, (rot?.[1] ?? 0) * D, (rot?.[2] ?? 0) * D, "YXZ"),
        );
    const m = base.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, ONE));
    geo.applyMatrix4(m);
    geo.computeVertexNormals();
    if (!bag.has(color)) bag.set(color, []);
    bag.get(color)!.push(geo);
  }

  function place(origin: V, yaw: number, fn: () => void) {
    const prev = base;
    base = prev.clone().multiply(
      new THREE.Matrix4().compose(
        new THREE.Vector3(...origin),
        new THREE.Quaternion().setFromAxisAngle(Y_AXIS, yaw * D),
        ONE,
      ),
    );
    fn();
    base = prev;
  }

  const box = (c: string, s: V, pos: V, rot?: V | THREE.Quaternion) =>
    put(new THREE.BoxGeometry(s[0], s[1], s[2]), c, pos, rot);
  const cyl = (c: string, rTop: number, rBot: number, h: number, seg: number, pos: V, rot?: V, theta = 0) =>
    put(new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, false, theta), c, pos, rot);
  const drumCyl = (c: string, r: number, h: number, seg: number, pos: V, rot?: V, theta = 0) =>
    cyl(c, r, r, h, seg, pos, rot, theta);
  const cone = (c: string, r: number, h: number, seg: number, pos: V, rot?: V) =>
    put(new THREE.ConeGeometry(r, h, seg), c, pos, rot);
  const ball = (c: string, r: number, pos: V) => put(new THREE.SphereGeometry(r, 6, 4), c, pos);
  const ring = (c: string, r: number, tube: number, pos: V, rot?: V) =>
    put(new THREE.TorusGeometry(r, tube, 5, 10), c, pos, rot);
  const prism = (c: string, pts: [number, number][], thick: number, pos: V, rot?: V) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -thick / 2);
    put(g, c, pos, rot);
  };
  // a rod between two points (cylinder aimed with the SDK's aim)
  const rod = (c: string, a: V, bp: V, r: number, seg = 6) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...bp);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const mid = A.clone().add(B).multiplyScalar(0.5);
    put(new THREE.CylinderGeometry(r, r, len, seg), c, [mid.x, mid.y, mid.z], aim(dir));
  };
  // a chain of boxes that curls upward (sled runners, ski tips)
  const curl = (c: string, start: V, w: number, h: number, seg: number, angles: number[]) => {
    const p = new THREE.Vector3(...start);
    for (const a of angles) {
      const dir = new THREE.Vector3(0, -Math.sin(a * D), Math.cos(a * D));
      const ctr = p.clone().addScaledVector(dir, seg / 2);
      box(c, [w, h, seg], [ctr.x, ctr.y, ctr.z], [a, 0, 0]);
      p.addScaledVector(dir, seg);
    }
  };

  // ---------------------------------------------------------------------------------------------
  // ZONE A: fuel tanks along z at x -3.72
  // ---------------------------------------------------------------------------------------------
  const R8 = 1 / Math.cos(Math.PI / 8);
  const TH = Math.PI / 8;

  function tank(z: number, color: string, band: string, gauge: "front" | "side") {
    place([-3.72, F, z], 0, () => {
      const a = 0.38;
      const yc = 0.1 + a;
      const tc = (c: string, ap: number, len: number, zp: number) =>
        drumCyl(c, ap * R8, len, 8, [0, yc, zp], [90, 0, 0], TH);
      tc(color, a, 1.5, 0);
      tc(band, a + 0.012, 0.12, 0); // centre stripe
      for (const s of [1, -1]) {
        tc(P.metalDark, a + 0.02, 0.05, s * 0.45); // strap over the saddle
        tc(P.metalDark, a + 0.018, 0.07, s * 0.7); // cap band
        // saddle cradle
        box(P.metalDark, [0.74, 0.1, 0.18], [0, 0.05, s * 0.45]);
        for (const x of [1, -1]) box(P.metalDark, [0.22, 0.07, 0.18], [x * 0.3, 0.15, s * 0.45], [0, 0, x * 35]);
        // end bolts
        for (let k = 0; k < 4; k++) {
          const ang = (k * Math.PI) / 2 + Math.PI / 4;
          box(P.metalDark, [0.04, 0.04, 0.02], [Math.sin(ang) * 0.27, yc + Math.cos(ang) * 0.27, s * 0.76]);
        }
      }
      // filler hatch
      drumCyl(color, 0.12, 0.06, 8, [0, yc + a + 0.02, -0.15]);
      drumCyl(P.metalDark, 0.095, 0.04, 8, [0, yc + a + 0.065, -0.15]);
      box(P.frameDark, [0.12, 0.025, 0.025], [0, yc + a + 0.095, -0.15]);
      // vent pipe
      drumCyl(P.metalGrey, 0.03, 0.16, 6, [0.1, yc + a + 0.07, 0.3]);
      cone(P.metalDark, 0.06, 0.05, 6, [0.1, yc + a + 0.175, 0.3]);
      if (gauge === "side") {
        // dial on the +x flank
        drumCyl(P.metalDark, 0.1, 0.045, 8, [0.4, yc + 0.05, 0.1], [0, 0, 90]);
        drumCyl(P.trimCream, 0.078, 0.02, 8, [0.418, yc + 0.05, 0.1], [0, 0, 90]);
        box(P.signalRed, [0.012, 0.03, 0.012], [0.43, yc + 0.05, 0.145]);
        box(P.frameDark, [0.012, 0.012, 0.07], [0.43, yc + 0.05, 0.1], [35, 0, 0]);
        ball(P.frameDark, 0.012, [0.43, yc + 0.05, 0.1]);
      } else {
        // dial on the front head
        drumCyl(P.metalDark, 0.1, 0.045, 8, [0.15, yc + 0.12, 0.76], [90, 0, 0]);
        drumCyl(P.trimCream, 0.078, 0.02, 8, [0.15, yc + 0.12, 0.778], [90, 0, 0]);
        box(P.signalRed, [0.03, 0.012, 0.012], [0.19, yc + 0.17, 0.79]);
        box(P.frameDark, [0.012, 0.07, 0.012], [0.15, yc + 0.12, 0.79], [0, 0, 40]);
        ball(P.frameDark, 0.012, [0.15, yc + 0.12, 0.79]);
        // drain valve
        drumCyl(P.metalDark, 0.04, 0.12, 6, [-0.12, 0.28, 0.8], [90, 0, 0]);
        drumCyl(P.signalRed, 0.045, 0.015, 6, [-0.12, 0.28, 0.87], [90, 0, 0]);
      }
    });
  }
  tank(0.25, P.safetyOrange, P.trimCream, "side");
  tank(1.81, P.tarpOchre, P.labTeal, "front");

  // pipe run: header beside the tanks, stubs into each tank, valve wheel in signalRed
  {
    const px = -3.12;
    const py = F + 0.25;
    rod(P.metalGrey, [px, py, 0.25], [px, py, 2.25], 0.045, 8);
    for (const z of [0.25, 1.81]) {
      rod(P.metalGrey, [-3.45, py, z], [px, py, z], 0.04, 8);
      ball(P.metalGrey, 0.055, [px, py, z]);
    }
    for (const z of [0.6, 1.45, 2.0]) {
      drumCyl(P.metalDark, 0.07, 0.03, 8, [px, py, z], [90, 0, 0]);
      box(P.woodDark, [0.06, 0.25, 0.06], [px, F + 0.125 - 0.02, z + 0.12]);
    }
    // valve between the tanks
    box(P.metalDark, [0.11, 0.11, 0.15], [px, py, 1.03]);
    drumCyl(P.metalGrey, 0.016, 0.16, 6, [px, py + 0.13, 1.03]);
    ring(P.signalRed, 0.085, 0.014, [px, py + 0.22, 1.03], [90, 0, 0]);
    box(P.signalRed, [0.17, 0.014, 0.014], [px, py + 0.22, 1.03]);
    box(P.signalRed, [0.014, 0.014, 0.17], [px, py + 0.22, 1.03]);
    drumCyl(P.metalDark, 0.025, 0.03, 6, [px, py + 0.22, 1.03]);
    // riser with a second small valve
    rod(P.metalGrey, [px, py, 2.25], [px, py + 0.5, 2.25], 0.04, 8);
    ball(P.metalGrey, 0.055, [px, py + 0.5, 2.25]);
    rod(P.metalGrey, [px, py + 0.5, 2.25], [px - 0.14, py + 0.5, 2.25], 0.035, 8);
    drumCyl(P.metalDark, 0.05, 0.05, 8, [px - 0.17, py + 0.5, 2.25], [0, 0, 90]);
    ring(P.signalRed, 0.05, 0.01, [px - 0.17, py + 0.57, 2.25], [90, 0, 0]);
  }

  // fuel drums: 3 + 2 pyramid at z 2.9
  {
    const cols = [P.safetyOrange, P.labTeal, P.signalRed, P.safetyOrange, P.labTeal];
    const spots: [number, number][] = [
      [-3.8, 0],
      [-3.45, 0],
      [-3.1, 0],
      [-3.625, 0.5],
      [-3.275, 0.5],
    ];
    spots.forEach(([x, yo], i) => {
      const z = 2.9;
      const y0 = F + yo;
      drumCyl(cols[i], 0.17, 0.5, 8, [x, y0 + 0.25, z]);
      drumCyl(P.metalDark, 0.178, 0.04, 8, [x, y0 + 0.03, z]);
      drumCyl(P.metalDark, 0.178, 0.04, 8, [x, y0 + 0.47, z]);
      drumCyl(P.metalDark, 0.174, 0.025, 8, [x, y0 + 0.14, z]);
      drumCyl(P.metalDark, 0.174, 0.025, 8, [x, y0 + 0.36, z]);
      drumCyl(P.trimCream, 0.176, 0.07, 8, [x, y0 + 0.25, z]);
      drumCyl(P.metalDark, 0.14, 0.015, 8, [x, y0 + 0.5, z]);
      drumCyl(P.trimCream, 0.028, 0.02, 6, [x + 0.07, y0 + 0.51, z + 0.03]);
      drumCyl(P.metalGrey, 0.02, 0.02, 6, [x - 0.06, y0 + 0.51, z - 0.05]);
    });
    drumCyl(P.snowLit, 0.12, 0.025, 8, [-3.625, F + 1.015, 2.9]);
    drumCyl(P.snowLit, 0.07, 0.02, 8, [-3.275, F + 1.02, 2.92]);
  }

  // crates with an ochre tarp
  {
    const cz = -0.78;
    const crate = (x: number, y0: number) => {
      box(P.wood, [0.4, 0.4, 0.4], [x, y0 + 0.2, cz]);
      for (const s of [1, -1]) {
        box(P.woodDark, [0.05, 0.41, 0.41], [x + s * 0.13, y0 + 0.2, cz]);
      }
      box(P.woodDark, [0.4, 0.04, 0.012], [x, y0 + 0.2, cz + 0.205], [0, 0, 38]);
    };
    crate(-3.93, F);
    crate(-3.51, F);
    crate(-3.72, F + 0.4);
    box(P.trimCream, [0.11, 0.05, 0.01], [-3.93, F + 0.18, cz + 0.203]);
    box(P.trimCream, [0.05, 0.11, 0.01], [-3.51, F + 0.2, cz + 0.203]);
    // tarp
    box(P.tarpOchre, [0.5, 0.04, 0.48], [-3.72, F + 0.82, cz]);
    box(P.tarpOchre, [0.03, 0.52, 0.48], [-4.06, F + 0.565, cz], [0, 0, 25]);
    box(P.tarpOchre, [0.03, 0.52, 0.48], [-3.38, F + 0.565, cz], [0, 0, -25]);
    box(P.tarpOchre, [0.5, 0.3, 0.03], [-3.72, F + 0.66, cz + 0.255], [-10, 0, 0]);
    box(P.snowLit, [0.38, 0.025, 0.3], [-3.74, F + 0.85, cz - 0.03]);
    for (const x of [-3.86, -3.58]) box(ROPE, [0.025, 0.03, 0.5], [x, F + 0.845, cz]);
    // rope ring around the bottom crates
    const ry = F + 0.22;
    box(ROPE, [0.9, 0.02, 0.02], [-3.72, ry, cz + 0.21]);
    box(ROPE, [0.9, 0.02, 0.02], [-3.72, ry, cz - 0.21]);
    for (const x of [-4.17, -3.27]) box(ROPE, [0.02, 0.02, 0.43], [x, ry, cz]);
    ball(ROPE, 0.03, [-3.72, ry, cz + 0.225]);
    rod(ROPE, [-3.72, ry, cz + 0.225], [-3.7, ry - 0.14, cz + 0.25], 0.012);
    rod(ROPE, [-3.72, ry, cz + 0.225], [-3.76, ry - 0.11, cz + 0.26], 0.012);
  }

  // ---------------------------------------------------------------------------------------------
  // ZONE B: snowmobile at vehiclePark, facing +Z
  // ---------------------------------------------------------------------------------------------
  place([2.8, F, 2.95], -10, () => {
    // tracked belt
    box(P.metalDark, [0.32, 0.34, 0.8], [0, 0.17, -0.5]);
    for (const z of [-0.9, -0.1]) {
      drumCyl(P.metalDark, 0.17, 0.32, 8, [0, 0.17, z], [0, 0, 90]);
      for (const s of [1, -1]) drumCyl(P.metalGrey, 0.08, 0.02, 8, [s * 0.165, 0.17, z], [0, 0, 90]);
    }
    for (let i = 0; i < 7; i++) {
      const z = -0.9 + i * 0.133;
      box(P.metalGrey, [0.34, 0.03, 0.04], [0, 0.017, z]);
      box(P.metalGrey, [0.34, 0.03, 0.04], [0, 0.335, z]);
    }
    // body
    box(P.cabinWall, [0.5, 0.2, 0.85], [0, 0.44, -0.5]);
    for (const s of [1, -1]) {
      box(P.cabinWallShade, [0.04, 0.16, 0.8], [s * 0.26, 0.42, -0.5]);
      box(P.metalGrey, [0.18, 0.03, 0.6], [s * 0.36, 0.32, -0.45]);
      box(P.trimCream, [0.012, 0.04, 0.7], [s * 0.303, 0.5, 0.3]);
    }
    box(P.cabinWall, [0.6, 0.3, 0.8], [0, 0.46, 0.3]);
    box(P.cabinWallShade, [0.5, 0.05, 0.82], [0, 0.31, 0.3]);
    // cowl in side profile
    prism(
      P.safetyOrange,
      [[0, 0], [0.82, 0], [0.86, 0.08], [0.7, 0.2], [0.3, 0.24], [0.05, 0.2]],
      0.54,
      [0, 0.61, -0.05],
      [0, -90, 0],
    );
    // snow dusting on the cowl and seat
    box(P.snowLit, [0.3, 0.03, 0.2], [-0.03, 0.865, 0.5]);
    box(P.snowLit, [0.12, 0.025, 0.1], [0.12, 0.865, 0.3]);
    // front bumper and grille
    box(P.metalDark, [0.52, 0.07, 0.06], [0, 0.4, 0.72]);
    box(P.frameDark, [0.3, 0.1, 0.02], [0, 0.48, 0.705]);
    // headlights on the cowl slope
    for (const s of [1, -1]) {
      box(P.frameDark, [0.15, 0.13, 0.025], [s * 0.14, 0.755, 0.735], [-53, 0, 0]);
      box(P.windowGlow, [0.11, 0.1, 0.03], [s * 0.14, 0.768, 0.742], [-53, 0, 0]);
    }
    // seat
    box(P.frameDark, [0.34, 0.1, 0.72], [0, 0.6, -0.5]);
    box(P.frameDark, [0.34, 0.14, 0.08], [0, 0.66, -0.9]);
    box(P.snowLit, [0.3, 0.025, 0.5], [0, 0.663, -0.45]);
    box(P.snowLit, [0.2, 0.02, 0.18], [0.02, 0.675, -0.15]);
    // tail light and rack
    box(P.signalRed, [0.14, 0.05, 0.03], [0, 0.5, -0.935]);
    box(P.metalDark, [0.4, 0.03, 0.03], [0, 0.56, -1.0]);
    for (const s of [1, -1]) box(P.metalDark, [0.03, 0.03, 0.12], [s * 0.19, 0.56, -0.96]);
    // windscreen
    box(P.metalDark, [0.43, 0.29, 0.015], [0, 0.95, 0.19], [-28, 0, 0]);
    box(P.iceBlue, [0.38, 0.24, 0.02], [0, 0.953, 0.2], [-28, 0, 0]);
    // steering
    rod(P.metalDark, [0, 0.8, 0.1], [0, 0.99, -0.05], 0.025);
    drumCyl(P.metalDark, 0.018, 0.56, 6, [0, 0.99, -0.05], [0, 0, 90]);
    for (const s of [1, -1]) {
      drumCyl(P.frameDark, 0.027, 0.11, 6, [s * 0.25, 0.99, -0.05], [0, 0, 90]);
      box(P.signalRed, [0.04, 0.05, 0.05], [s * 0.22, 1.04, -0.07]);
    }
    // front skis, curled up
    for (const s of [1, -1]) {
      box(P.metalDark, [0.12, 0.035, 0.9], [s * 0.3, 0.0175, 0.5]);
      box(P.metalGrey, [0.03, 0.02, 0.7], [s * 0.3, 0.045, 0.5]);
      curl(P.metalDark, [s * 0.3, 0.0175, 0.95], 0.12, 0.035, 0.1, [-18, -42, -66]);
      rod(P.metalGrey, [s * 0.3, 0.04, 0.3], [s * 0.26, 0.34, 0.3], 0.02);
      rod(P.metalGrey, [s * 0.3, 0.04, 0.7], [s * 0.26, 0.4, 0.5], 0.02);
    }
  });

  // ---------------------------------------------------------------------------------------------
  // Sled at sledSpot
  // ---------------------------------------------------------------------------------------------
  place([M.sledSpot[0], F, M.sledSpot[2]], -5, () => {
    for (const s of [1, -1]) {
      box(P.woodDark, [0.07, 0.07, 1.15], [s * 0.24, 0.035, -0.125]);
      curl(P.woodDark, [s * 0.24, 0.035, 0.45], 0.07, 0.07, 0.14, [-25, -50, -75]);
      box(P.wood, [0.04, 0.4, 0.04], [s * 0.27, 0.27, -0.67], [-15, 0, 0]);
      box(P.metalDark, [0.075, 0.02, 0.05], [s * 0.24, 0.005, 0.2]); // runner shoe
    }
    for (let i = 0; i < 7; i++) box(P.wood, [0.62, 0.03, 0.12], [0, 0.085, -0.65 + i * 0.17]);
    drumCyl(P.wood, 0.022, 0.58, 6, [0, 0.46, -0.72], [0, 0, 90]);
    box(P.woodDark, [0.5, 0.04, 0.05], [0, 0.05, -0.6]);
    drumCyl(P.woodDark, 0.025, 0.56, 6, [0, 0.1, 0.5], [0, 0, 90]);
    // tow rope and loop
    rod(ROPE, [0.06, 0.1, 0.52], [0.07, 0.03, 0.7], 0.012);
    rod(ROPE, [-0.06, 0.1, 0.52], [-0.07, 0.03, 0.7], 0.012);
    ring(ROPE, 0.08, 0.013, [0, 0.025, 0.78], [90, 0, 0]);
    // cargo: teal duffel
    box(P.labTeal, [0.5, 0.26, 0.36], [0, 0.23, -0.35]);
    drumCyl(P.labTeal, 0.13, 0.5, 6, [0, 0.24, -0.35], [0, 0, 90]);
    for (const x of [-0.13, 0.13]) box(P.trimCream, [0.06, 0.28, 0.38], [x, 0.23, -0.35]);
    box(P.trimCream, [0.14, 0.03, 0.03], [0, 0.375, -0.35]);
    box(P.snowLit, [0.4, 0.02, 0.26], [0.02, 0.385, -0.34]);
    // ochre duffel
    box(P.tarpOchre, [0.44, 0.22, 0.3], [0, 0.21, 0.08]);
    for (const x of [-0.12, 0.12]) box(P.trimCream, [0.05, 0.23, 0.32], [x, 0.21, 0.08]);
    box(P.frameDark, [0.1, 0.03, 0.03], [0, 0.33, 0.08]);
    // lashing over the load
    box(ROPE, [0.66, 0.015, 0.015], [0, 0.385, -0.12], [0, 14, 0]);
    box(ROPE, [0.66, 0.015, 0.015], [0, 0.345, 0.2], [0, -12, 0]);
    for (const s of [1, -1]) {
      ball(ROPE, 0.02, [s * 0.31, 0.2, -0.12]);
    }
  });

  // ---------------------------------------------------------------------------------------------
  // Small equipment cluster
  // ---------------------------------------------------------------------------------------------
  // snow shovel in a drift
  {
    const x = 1.95;
    const z = 2.3;
    cone(P.snowShade, 0.34, 0.14, 8, [x, F + 0.05, z]);
    cone(P.snowLit, 0.26, 0.24, 8, [x, F + 0.1, z]);
    const dir = new THREE.Vector3(-0.12, 0.9, 0.1).normalize();
    const p0 = new THREE.Vector3(x, F + 0.1, z);
    const at = (t: number): V => {
      const p = p0.clone().addScaledVector(dir, t);
      return [p.x, p.y, p.z];
    };
    box(P.safetyOrange, [0.2, 0.3, 0.025], at(0.08), aim(dir));
    box(P.metalGrey, [0.2, 0.05, 0.03], at(0.28), aim(dir));
    rod(P.wood, at(0.3), at(1.0), 0.02);
    box(P.woodDark, [0.16, 0.03, 0.03], at(1.02));
    ball(P.woodDark, 0.025, at(1.02));
  }

  // skis leaning on the lab's front corner
  {
    const cols = [P.safetyOrange, P.labTeal];
    [3.86, 3.99].forEach((x, i) => {
      const tilt = -9.4;
      const len = 1.1;
      const cy = F + (len / 2) * Math.cos(tilt * D);
      const cz = 1.29;
      box(cols[i], [0.09, len, 0.02], [x, cy, cz], [tilt, 0, 0]);
      box(P.trimCream, [0.09, 0.05, 0.022], [x, cy + 0.1, cz - 0.015], [tilt, 0, 0]);
      box(P.frameDark, [0.07, 0.13, 0.04], [x, cy - 0.1, cz + 0.02], [tilt, 0, 0]);
      // tip curls away from the wall
      box(cols[i], [0.09, 0.14, 0.02], [x, F + len * Math.cos(tilt * D) + 0.04, cz - 0.1 + 0.2], [tilt + 38, 0, 0]);
    });
    for (const [px, tx] of [[3.76, 3.8], [4.1, 4.06]] as [number, number][]) {
      rod(P.metalGrey, [px, F, 1.42], [tx, F + 1.02, 1.24], 0.012);
      drumCyl(P.metalDark, 0.04, 0.012, 6, [px + 0.003, F + 0.08, 1.4]);
      box(P.frameDark, [0.035, 0.1, 0.035], [tx, F + 0.95, 1.25], [-10, 0, 0]);
    }
  }

  // signal-flag pole with a signalRed banner at x 4.0, z 3.6
  {
    const x = 4.0;
    const z = 3.6;
    cone(P.snowLit, 0.34, 0.2, 8, [x, F + 0.06, z]);
    cone(P.snowShade, 0.24, 0.22, 8, [x + 0.04, F + 0.05, z - 0.02]);
    box(P.rockLight, [0.16, 0.12, 0.14], [x + 0.1, F + 0.05, z + 0.12], [0, 25, 10]);
    box(P.rock, [0.12, 0.09, 0.12], [x - 0.14, F + 0.04, z + 0.08], [0, -20, -8]);
    drumCyl(P.metalGrey, 0.03, 1.32, 6, [x, F + 0.64, z]);
    for (const h of [0.35, 0.6]) drumCyl(P.trimCream, 0.034, 0.08, 6, [x, F + h, z]);
    ball(P.safetyOrange, 0.05, [x, F + 1.32, z]);
    // banner in two flutter segments
    prism(P.signalRed, [[0, 0], [0.32, 0], [0.32, 0.3], [0, 0.3]], 0.02, [x - 0.03, F + 0.95, z], [0, 180, 0]);
    prism(
      P.signalRed,
      [[0, 0], [0.34, 0], [0.24, 0.15], [0.34, 0.3], [0, 0.3]],
      0.02,
      [x - 0.35, F + 0.95, z],
      [0, 194, 0],
    );
    drumCyl(P.trimCream, 0.07, 0.03, 8, [x - 0.2, F + 1.1, z], [90, 0, 0]);
    box(P.frameDark, [0.1, 0.025, 0.035], [x - 0.2, F + 1.1, z]);
    box(P.frameDark, [0.025, 0.1, 0.035], [x - 0.2, F + 1.1, z]);
    // halyard
    rod(ROPE, [x + 0.04, F + 1.25, z], [x + 0.05, F + 0.55, z], 0.008, 4);
  }

  // ---------------------------------------------------------------------------------------------
  // Flush: one merged part per colour
  // ---------------------------------------------------------------------------------------------
  for (const [color, geos] of bag) {
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], flat: true, name: `yard.${color.replace("#", "")}` });
    if (color === P.windowGlow) glow(part, 1.4);
  }
}
```

<!-- call: mainCabin -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMainCabin({ b, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  // three own colours (shade-side variants and cut log ends)
  const SHADE_STRIP = "#7a2f2c";
  const SHADE_CREAM = "#c49a7e";
  const CUT = "#a8704a";

  const FLOOR = M.cabinFloor[1];
  const CHX = M.chimneyTop[0];
  const CHZ = M.chimneyTop[2];
  const CHT = M.chimneyTop[1];
  const STAIR_Z = M.stairFoot[2];

  // ---------------------------------------------------------------------------------------------
  // Batching: every small piece is transformed into model space and merged per colour, so the whole
  // cabin is a couple of dozen parts. Non-indexed + recomputed normals gives the faceted look.
  type V3 = [number, number, number];
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    p: V3,
    rot: V3 = [0, 0, 0],
    sc: V3 = [1, 1, 1],
  ) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...p),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "XYZ")),
      new THREE.Vector3(...sc),
    );
    g.applyMatrix4(m);
    g.computeVertexNormals();
    const list = buckets.get(color) ?? [];
    list.push(g);
    buckets.set(color, list);
  };
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, rot?: V3) =>
    put(new THREE.BoxGeometry(w, h, d), color, [x, y, z], rot);
  const cyl = (
    x: number,
    y: number,
    z: number,
    rt: number,
    rb: number,
    h: number,
    sides: number,
    color: string,
    rot?: V3,
  ) => put(new THREE.CylinderGeometry(rt, rb, h, sides, 1), color, [x, y, z], rot);
  const cone = (x: number, y: number, z: number, r: number, h: number, sides: number, color: string, rot?: V3) =>
    put(new THREE.ConeGeometry(r, h, sides, 1), color, [x, y, z], rot);
  const blob = (x: number, y: number, z: number, r: number, color: string, sy = 0.85) =>
    put(new THREE.IcosahedronGeometry(r, 0), color, [x, y, z], [0, 20, 0], [1, sy, 1]);

  // ---------------------------------------------------------------------------------------------
  // Wall-face placement. u runs along the wall (x on F/B, z on L/R); off = distance out of the wall.
  type Face = "F" | "B" | "L" | "R";
  const FACE = {
    F: { ax: "z", s: 1, wall: 1.9 },
    B: { ax: "z", s: -1, wall: -1.9 },
    L: { ax: "x", s: -1, wall: -2.9 },
    R: { ax: "x", s: 1, wall: 1.3 },
  } as const;
  const fb = (f: Face, u: number, y: number, off: number, w: number, h: number, t: number, color: string) => {
    const F = FACE[f];
    const c = F.wall + F.s * (off + t / 2);
    if (F.ax === "z") box(u, y, c, w, h, t, color);
    else box(c, y, u, t, h, w, color);
  };
  const lit = (f: Face) => f === "F" || f === "R";
  const cream = (f: Face) => (lit(f) ? P.trimCream : SHADE_CREAM);
  const snow = (f: Face) => (lit(f) ? P.snowLit : P.snowShade);

  // ---------------------------------------------------------------------------------------------
  // Piles and floor
  const piles: [number, number][] = [];
  for (const x of [-2.6, -1.3, 0, 1.0]) {
    piles.push([x, 1.65], [x, -1.65]);
  }
  piles.push([-1.3, 0], [0, 0]);
  for (const [x, z] of piles) {
    cyl(x, 0.47, z, 0.1, 0.13, 0.34, 6, P.wood);
    box(x, 0.65, z, 0.32, 0.05, 0.32, P.woodDark);
    // little diagonal brace on the front row
    if (z > 1) box(x, 0.5, z + 0.12, 0.05, 0.3, 0.05, P.woodDark, [-25, 0, 0]);
  }
  box(-0.8, FLOOR - 0.07, 0, 4.3, 0.14, 3.9, P.woodDark);

  // ---------------------------------------------------------------------------------------------
  // Walls: shaded core, lit front and right skins
  box(-0.82, 1.85, -0.02, 4.16, 2.1, 3.76, P.cabinWallShade);
  box(-0.8, 1.85, 1.88, 4.2, 2.1, 0.04, P.cabinWall);
  box(1.28, 1.85, -0.02, 0.04, 2.1, 3.76, P.cabinWall);

  // porch shadow patch and eave shadow bands
  fb("F", -0.8, 1.79, 0, 1.9, 1.98, 0.012, P.cabinWallShade);
  fb("F", -0.8, 2.83, 0, 4.2, 0.14, 0.015, P.cabinWallShade);
  fb("R", 0, 2.83, 0, 3.8, 0.14, 0.015, P.cabinWallShade);

  // clapboard lines
  for (const y of [1.05, 1.31, 1.57, 1.83, 2.09, 2.35, 2.61]) {
    fb("F", -2.325, y, 0, 1.15, 0.035, 0.025, P.cabinWallShade);
    fb("F", -0.8, y, 0, 1.9, 0.035, 0.025, SHADE_STRIP);
    fb("F", 0.725, y, 0, 1.15, 0.035, 0.025, P.cabinWallShade);
    fb("B", -0.8, y, 0, 4.2, 0.035, 0.025, SHADE_STRIP);
    fb("L", 0, y, 0, 3.8, 0.035, 0.025, SHADE_STRIP);
    fb("R", 0, y, 0, 3.8, 0.035, 0.025, P.cabinWallShade);
  }

  // corner posts and base trim
  const corners: [number, number, string][] = [
    [-2.9, 1.9, P.trimCream],
    [1.3, 1.9, P.trimCream],
    [-2.9, -1.9, SHADE_CREAM],
    [1.3, -1.9, SHADE_CREAM],
  ];
  for (const [x, z, c] of corners) box(x, 1.85, z, 0.15, 2.1, 0.15, c);
  fb("F", -0.8, 0.9, 0, 4.3, 0.18, 0.05, P.trimCream);
  fb("B", -0.8, 0.9, 0, 4.3, 0.18, 0.05, SHADE_CREAM);
  fb("L", 0, 0.9, 0, 3.9, 0.18, 0.05, SHADE_CREAM);
  fb("R", 0, 0.9, 0, 3.9, 0.18, 0.05, P.trimCream);

  // ---------------------------------------------------------------------------------------------
  // Windows
  const win = (f: Face, u: number, y: number, w: number, h: number) => {
    fb(f, u, y, 0, w + 0.16, h + 0.16, 0.06, P.frameDark);
    fb(f, u, y, 0.06, w, h, 0.025, P.windowGlow);
    fb(f, u, y, 0.08, 0.04, h, 0.02, P.frameDark);
    fb(f, u, y, 0.08, w, 0.04, 0.02, P.frameDark);
    fb(f, u, y + h / 2 + 0.13, 0, w + 0.28, 0.08, 0.09, cream(f)); // head board
    fb(f, u, y - h / 2 - 0.115, 0, w + 0.3, 0.07, 0.17, cream(f)); // sill
    fb(f, u, y - h / 2 - 0.05, 0.06, w + 0.2, 0.05, 0.11, snow(f)); // sill snow
  };
  win("F", -2.0, 1.85, 0.7, 1.0);
  win("F", 0.4, 1.85, 0.7, 1.0);
  win("L", -0.9, 1.85, 0.7, 1.0);
  win("L", 0.9, 1.85, 0.7, 1.0);
  win("B", 0.0, 1.85, 0.7, 1.0);

  // ---------------------------------------------------------------------------------------------
  // Front door
  const DX = -0.8;
  fb("F", DX - 0.475, 1.71, 0, 0.1, 1.82, 0.09, P.trimCream);
  fb("F", DX + 0.475, 1.71, 0, 0.1, 1.82, 0.09, P.trimCream);
  fb("F", DX, 2.61, 0, 1.12, 0.13, 0.1, P.trimCream);
  fb("F", DX, 0.83, 0, 1.0, 0.05, 0.12, P.trimCream); // threshold
  fb("F", DX, 1.675, 0, 0.85, 1.75, 0.07, P.wood);
  fb("F", DX, 1.12, 0.07, 0.58, 0.5, 0.02, P.woodDark);
  fb("F", DX, 1.5, 0.07, 0.58, 0.02, 0.02, P.woodDark);
  fb("F", DX, 0.9, 0.07, 0.8, 0.1, 0.02, P.woodDark); // kick plate
  fb("F", DX, 1.98, 0.07, 0.46, 0.6, 0.02, P.frameDark);
  fb("F", DX, 1.98, 0.09, 0.34, 0.48, 0.02, P.windowGlow);
  fb("F", DX, 1.98, 0.11, 0.03, 0.48, 0.015, P.frameDark);
  fb("F", DX, 1.98, 0.11, 0.34, 0.03, 0.015, P.frameDark);
  fb("F", DX + 0.28, 1.58, 0.07, 0.06, 0.15, 0.05, P.tarpOchre); // handle
  fb("F", DX + 0.28, 1.5, 0.07, 0.09, 0.09, 0.03, P.tarpOchre); // knob
  fb("F", DX + 0.28, 1.66, 0.07, 0.07, 0.12, 0.02, P.frameDark); // lock plate

  // life ring beside the door (left)
  const RX = -1.4675;
  put(new THREE.TorusGeometry(0.085, 0.035, 6, 10), P.safetyOrange, [RX, 1.55, 1.945]);
  for (let i = 0; i < 4; i++) {
    const a = (45 + i * 90) * DEG;
    box(RX + Math.cos(a) * 0.085, 1.55 + Math.sin(a) * 0.085, 1.948, 0.05, 0.045, 0.05, P.trimCream, [0, 0, 45 + i * 90]);
  }
  box(RX, 1.7, 1.915, 0.03, 0.06, 0.03, P.woodDark); // hook

  // weather sign beside the door (right)
  const SX = -0.135;
  fb("F", SX, 1.75, 0, 0.24, 0.32, 0.03, P.trimCream);
  fb("F", SX, 1.75, 0.03, 0.2, 0.28, 0.025, P.woodDark);
  cyl(SX, 1.8, 1.9 + 0.065, 0.065, 0.065, 0.012, 8, P.trimCream, [90, 0, 0]);
  cone(SX, 1.8, 1.9 + 0.078, 0.045, 0.075, 3, P.safetyOrange);
  fb("F", SX, 1.6, 0.055, 0.14, 0.03, 0.012, P.signalRed);
  fb("F", SX, 1.545, 0.055, 0.1, 0.02, 0.012, P.windowGlow);

  // ---------------------------------------------------------------------------------------------
  // Doorway on the right wall (corridor joint): cream trim only
  fb("R", -0.3, 1.55, 0, 0.9, 1.5, 0.012, P.frameDark);
  fb("R", -0.8, 1.55, 0, 0.1, 1.55, 0.07, P.trimCream);
  fb("R", 0.2, 1.55, 0, 0.1, 1.55, 0.07, P.trimCream);
  fb("R", -0.3, 2.36, 0, 1.1, 0.13, 0.08, P.trimCream);
  fb("R", -0.3, 0.83, 0, 0.95, 0.05, 0.09, P.trimCream);

  // ---------------------------------------------------------------------------------------------
  // Gable roof
  const TH = Math.atan2(1.0, 1.9);
  const COS = Math.cos(TH);
  const SIN = Math.sin(TH);
  const LEN = 2.2 / COS;
  const rp = (sg: number, s: number, n: number): [number, number] => [3.9 - s * SIN + n * COS, sg * (s * COS + n * SIN)];
  for (const sg of [1, -1]) {
    const rot: V3 = [sg * TH / DEG, 0, 0];
    let [y, z] = rp(sg, LEN / 2, 0.05);
    box(-0.8, y, z, 4.8, 0.1, LEN, P.roofDark, rot);
    [y, z] = rp(sg, 1.2, 0.175);
    box(-0.8, y, z, 4.9, 0.15, 2.3, P.snowLit, rot);
    [y, z] = rp(sg, 2.4, 0.14);
    box(-0.8, y, z, 4.92, 0.1, 0.12, P.snowShade, rot);
    // barge boards on the gable ends
    [y, z] = rp(sg, LEN / 2, 0.02);
    box(-3.22, y, z, 0.04, 0.2, LEN, SHADE_CREAM, rot);
    box(1.62, y, z, 0.04, 0.2, LEN, P.trimCream, rot);
    // fascia
    box(-0.8, 2.76, sg * 2.215, 4.8, 0.16, 0.04, sg > 0 ? P.trimCream : SHADE_CREAM);
  }
  box(-0.8, 4.07, 0, 4.9, 0.12, 0.5, P.snowLit); // ridge snow
  box(-0.8, 4.0, 0, 4.8, 0.08, 0.2, P.roofDark); // ridge beam

  // gable triangles
  const GABLE = (x: number, color: string) =>
    b.extrude(
      [
        [-1.9, 0],
        [1.9, 0],
        [0, 1.0],
      ],
      { at: [x, 2.9, 0], x: [0, 0, 1], thickness: 0.1, color, name: "mainCabin.gable" },
    );
  GABLE(-2.85, P.cabinWallShade);
  GABLE(1.25, P.cabinWall);

  // attic windows
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -2.9 : 1.3;
    cyl(x0 + s * 0.03, 3.3, 0, 0.26, 0.26, 0.06, 8, P.frameDark, [0, 0, 90]);
    cyl(x0 + s * 0.06, 3.3, 0, 0.19, 0.19, 0.04, 8, P.windowGlow, [0, 0, 90]);
    box(x0 + s * 0.085, 3.3, 0, 0.02, 0.4, 0.04, P.frameDark);
    box(x0 + s * 0.085, 3.3, 0, 0.02, 0.04, 0.4, P.frameDark);
    cyl(x0 + s * 0.005, 3.3, 0, 0.31, 0.31, 0.03, 8, s < 0 ? SHADE_CREAM : P.trimCream, [0, 0, 90]);
  }

  // rafter tails
  for (let x = -3.0; x <= 1.45; x += 0.45) {
    if (x > -1.85 && x < 0.3) continue;
    box(x, 2.74, 2.05, 0.07, 0.09, 0.32, P.woodDark);
    box(x, 2.74, -2.05, 0.07, 0.09, 0.32, P.woodDark);
  }

  // icicles along the eave
  const r = rng(11);
  for (let x = -3.1; x <= 1.5; x += 0.32) {
    if (x > -1.95 && x < 0.3) continue;
    const len = 0.12 + r() * 0.2;
    cone(x, 2.69 - len / 2, 2.2, 0.04, len, 5, P.iceBlue, [180, 0, 0]);
  }
  for (let x = -3.0; x <= 1.5; x += 0.5) {
    const len = 0.1 + r() * 0.16;
    cone(x, 2.69 - len / 2, -2.2, 0.04, len, 5, P.iceDeep, [180, 0, 0]);
  }

  // ---------------------------------------------------------------------------------------------
  // Chimney
  const bodyTop = CHT - 0.14;
  const bodyBot = 3.3;
  box(CHX, (bodyTop + bodyBot) / 2, CHZ, 0.5, bodyTop - bodyBot, 0.5, P.rock);
  let course = 0;
  for (let y = 3.75; y <= 4.2; y += 0.13) {
    const even = course++ % 2 === 0;
    const us = even ? [-0.12, 0.12] : [-0.225, 0, 0.225];
    const ws = even ? [0.21, 0.21] : [0.08, 0.2, 0.08];
    us.forEach((u, i) => {
      box(CHX + u, y, CHZ + 0.255, ws[i], 0.1, 0.03, P.rockLight);
      box(CHX + u, y, CHZ - 0.255, ws[i], 0.1, 0.03, P.rockLight);
      box(CHX + 0.255, y, CHZ + u, 0.03, 0.1, ws[i], P.rockLight);
      box(CHX - 0.255, y, CHZ + u, 0.03, 0.1, ws[i], P.rockLight);
    });
  }
  box(CHX, CHT - 0.105, CHZ, 0.62, 0.07, 0.62, P.rockLight);
  box(CHX, CHT - 0.035, CHZ, 0.56, 0.07, 0.56, P.snowLit);
  box(CHX, CHT + 0.003, CHZ, 0.28, 0.01, 0.28, P.frameDark);
  // sooty top bricks
  box(CHX, CHT - 0.145, CHZ + 0.3, 0.62, 0.03, 0.02, P.rock);

  // smoke column
  const puffs: [number, number, number, number][] = [
    [CHX + 0.02, CHT + 0.3, CHZ, 0.2],
    [CHX + 0.2, CHT + 0.65, CHZ + 0.02, 0.26],
    [CHX + 0.48, CHT + 1.05, CHZ + 0.04, 0.31],
    [CHX + 0.85, CHT + 1.5, CHZ, 0.37],
  ];
  puffs.forEach(([x, y, z, rad], i) => {
    blob(x, y, z, rad, i % 2 === 0 ? P.snowShade : P.snowLit);
    blob(x + rad * 0.35, y - rad * 0.45, z + rad * 0.25, rad * 0.55, i % 2 === 0 ? P.snowDeep : P.snowShade, 0.8);
  });

  // roof vent, antennas
  cyl(0.6, 3.68, -0.9, 0.07, 0.07, 0.55, 6, P.metalGrey);
  cone(0.6, 4.0, -0.9, 0.14, 0.1, 6, P.metalDark);
  blob(0.6, 4.08, -0.9, 0.06, P.snowLit);
  box(0.9, 4.15, 0, 0.12, 0.06, 0.12, P.metalDark);
  cyl(0.9, 4.33, 0, 0.012, 0.014, 0.36, 5, P.metalGrey);
  blob(0.9, 4.51, 0, 0.025, P.signalRed, 1);
  box(0.62, 4.15, 0.05, 0.1, 0.06, 0.1, P.metalDark);
  cyl(0.62, 4.28, 0.05, 0.01, 0.012, 0.22, 5, P.metalGrey);

  // ---------------------------------------------------------------------------------------------
  // Back wall firewood pile
  const logRows: [number, number, number][] = [
    [5, -2.5, 0.45],
    [4, -2.4, 0.62],
    [3, -2.3, 0.79],
  ];
  logRows.forEach(([n, x0, y], j) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + i * 0.2;
      cyl(x, y, -2.22, 0.095, 0.095, 0.45, 6, (i + j) % 2 ? P.wood : P.woodDark, [90, 0, 0]);
      cyl(x, y, -2.449, 0.07, 0.07, 0.01, 6, CUT, [90, 0, 0]);
    }
  });
  box(-2.62, 0.7, -2.22, 0.05, 0.8, 0.05, P.woodDark);
  box(-1.58, 0.7, -2.22, 0.05, 0.8, 0.05, P.woodDark);
  box(-2.1, 0.94, -2.22, 0.86, 0.07, 0.5, P.snowLit);
  box(-2.1, 0.9, -2.22, 0.9, 0.03, 0.52, P.snowShade);

  // ---------------------------------------------------------------------------------------------
  // Porch: deck, planks, posts, shed roof, rails, steps
  box(-0.8, 0.71, 2.4, 1.8, 0.1, 1.0, P.woodDark);
  for (let i = 0; i < 9; i++) box(-1.7 + 0.1 + i * 0.2, 0.78, 2.4, 0.185, 0.04, 1.0, P.wood);
  box(-0.8, 0.81, 2.35, 0.7, 0.02, 0.4, P.tarpOchre); // doormat
  box(-0.8, 0.82, 2.35, 0.5, 0.01, 0.22, P.woodDark);
  for (const x of [-1.6, -0.0]) cyl(x, 0.47, 2.8, 0.09, 0.11, 0.36, 6, P.wood);
  for (const x of [-1.65, 0.05]) {
    box(x, 1.625, 2.88, 0.12, 1.65, 0.12, P.trimCream);
    box(x, 0.86, 2.88, 0.17, 0.12, 0.17, P.woodDark);
  }
  box(-0.8, 2.36, 2.88, 1.8, 0.1, 0.1, P.woodDark);

  // shed roof
  const PH = Math.atan2(0.33, 1.13);
  const PRot: V3 = [PH / DEG, 0, 0];
  box(-0.8, 2.577, 2.474, 2.1, 0.08, 1.18, P.roofDark, PRot);
  box(-0.8, 2.682, 2.505, 2.2, 0.12, 1.1, P.snowLit, PRot);
  box(-0.8, 2.5, 3.0, 2.2, 0.1, 0.12, P.snowShade, PRot);
  box(-0.8, 2.4, 3.06, 2.1, 0.14, 0.04, P.trimCream);

  // railings
  for (const x of [-1.65, 0.05]) {
    box(x, 1.37, 2.4, 0.07, 0.06, 0.95, P.wood);
    box(x, 0.98, 2.4, 0.06, 0.05, 0.95, P.wood);
    for (const z of [2.1, 2.3, 2.5, 2.7]) box(x, 1.17, z, 0.04, 0.4, 0.04, P.wood);
  }
  for (const [cx, bx] of [
    [-1.485, -1.5],
    [-0.115, -0.1],
  ] as const) {
    box(cx, 1.37, 2.88, 0.22, 0.06, 0.07, P.wood);
    box(cx, 0.98, 2.88, 0.22, 0.05, 0.06, P.wood);
    box(bx, 1.17, 2.88, 0.04, 0.4, 0.04, P.wood);
  }
  for (const x of [-1.65, 0.05]) box(x, 2.48, 2.88, 0.16, 0.04, 0.16, P.woodDark);

  // steps (three treads down to the stair foot)
  const treads: [number, number][] = [
    [0.66, STAIR_Z - 0.5],
    [0.52, STAIR_Z - 0.3],
    [0.38, STAIR_Z - 0.1],
  ];
  for (const [top, z] of treads) {
    box(-0.8, top - 0.025, z, 1.12, 0.05, 0.22, P.wood);
    if (top - 0.4 > 0.02) box(-0.8, (top - 0.05 + 0.35) / 2, z - 0.01, 1.04, top - 0.4, 0.18, P.woodDark);
  }
  for (const x of [-1.38, -0.22]) {
    box(x, 0.54, STAIR_Z - 0.3, 0.05, 0.12, 0.7, P.woodDark, [28, 0, 0]);
  }
  box(-0.95, 0.545, STAIR_Z - 0.3, 0.6, 0.03, 0.14, P.snowLit);
  box(-0.6, 0.405, STAIR_Z - 0.1, 0.4, 0.03, 0.12, P.snowLit);

  // hanging lantern under the porch roof
  const LX = -1.15;
  const LZ = 2.45;
  cyl(LX, 2.5, LZ, 0.01, 0.01, 0.14, 5, P.frameDark);
  cone(LX, 2.43, LZ, 0.1, 0.07, 4, P.frameDark, [0, 45, 0]);
  box(LX, 2.18, LZ, 0.13, 0.02, 0.13, P.frameDark);
  box(LX, 2.31, LZ, 0.085, 0.15, 0.085, P.windowGlow);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(LX + sx * 0.055, 2.3, LZ + sz * 0.055, 0.015, 0.2, 0.015, P.frameDark);
  box(LX, 2.405, LZ, 0.13, 0.02, 0.13, P.frameDark);
  blob(LX, 2.14, LZ, 0.025, P.frameDark, 1);

  // ---------------------------------------------------------------------------------------------
  // Flush: one part per colour
  let i = 0;
  for (const [color, list] of buckets) {
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], name: `mainCabin.batch${i++}` });
    if (color === P.windowGlow) glow(part, 1.2);
  }
}
```