<!-- call: plan -->

```json
{
  "name": "Polar Night Station",
  "description": "A Firewatch-style flat-colour diorama of an arctic research outpost: a rust-red timber cabin on stilts, a mustard barrel-vault lab linked by a glazed corridor, a guyed radio mast with a weather station, and a yard of fuel, sled and snowmobile, all on a layered snow-and-ice slab.",
  "builderName": "arcticOutpost",
  "size": [15, 9.6, 13],
  "layout": "Static diorama on a chamfered rectangular slab, 15 m wide (x) by 13 m deep (z); the slab top is y=0.4 and the tallest point is the mast at about 9.6 m. Front is +Z. The main cabin is a long rust-red timber hut at left-centre (x -6.1..1.0, z -2.5..4.8 including porch and stairs). Its ridge runs along X, and it stands on stilts with its floor at y=1.0. The porch, door and stairs face +Z. A glazed corridor leads east from the cabin's east wall to the mustard-and-teal barrel-vault lab at right-centre (x 2.0..6.4). A solar array is behind the lab and the yard is in front of it. The radio mast stands at back-left (-4.4, -4.4) and is the tallest element. A Stevenson-screen weather station stands beside it. A yard of fuel tank, drums, sled, crates, snowmobile and flagpole fills the front-right corner. A frozen pond lies front-left, a rock outcrop at back-right, and a packed-snow path runs from the stairs to the lab door. Firewatch style: every surface is one flat colour with no gradients. Big simple blocky shapes are lit warm (rust, mustard, cream-pink snow) on top and sides facing the sun, and cool (lilac, deep blue-violet) on undersides and in shadow, so shadow tones are separate flat parts such as lilac drift wedges under eaves and dark underside slabs. Every roof, ledge and crate top carries a separate thick flat snow-cap slab in snowLit with a lilac snowShade lip below it. Windows and lamps are glowing windowGlow/glowOrange parts with dark ink frames. Details are small flat parts: trim boards, bolts, stripes, signs and rust patches.",
  "palette": {
    "snowLit": "#f7dccb",
    "snowShade": "#cbaac6",
    "snowDeep": "#8f80b3",
    "iceBlue": "#86cbd8",
    "iceDeep": "#41809e",
    "rockDark": "#3b2f4b",
    "rockMid": "#6b5066",
    "cabinRust": "#b5542f",
    "cabinDark": "#7b3227",
    "trimCream": "#f2dba9",
    "roofDark": "#40344f",
    "metalGrey": "#6c7b8b",
    "metalDark": "#2f3548",
    "labMustard": "#e1a132",
    "labTeal": "#2f7f86",
    "windowGlow": "#ffc65b",
    "glowOrange": "#ff8a3d",
    "signalRed": "#e2452f",
    "paperWhite": "#f4ece0",
    "ink": "#241a2e",
    "woodLight": "#d98d4b",
    "solarBlue": "#2e4c8a",
    "solarLine": "#7aa2d6",
    "flagTeal": "#33a6a0"
  },
  "mounts": {
    "groundTop": [0, 0.4, 0],
    "cabinFloor": [-2.4, 1.0, -0.2],
    "cabinDoor": [-2.4, 1.0, 1.8],
    "porchFront": [-2.4, 1.0, 3.4],
    "stairsFoot": [-2.4, 0.4, 4.8],
    "cabinEastDoor": [0.8, 1.0, -0.2],
    "corridorWest": [0.8, 1.0, -0.2],
    "corridorEast": [2.0, 1.0, -0.2],
    "labFloor": [4.2, 1.0, -0.2],
    "labFrontDoor": [4.2, 1.0, 1.6],
    "labRoofTop": [4.2, 3.9, -0.2],
    "solarArrayCenter": [3.6, 0.4, -3.8],
    "mastBase": [-4.4, 0.4, -4.4],
    "mastTop": [-4.4, 9.0, -4.4],
    "weatherStation": [-1.2, 0.4, -4.5],
    "yardCenter": [4.3, 0.4, 4.4],
    "fuelTank": [6.3, 0.4, 3.5],
    "flagpoleBase": [1.8, 0.4, 3.2],
    "pathStart": [-2.4, 0.4, 5.0],
    "pathEnd": [4.2, 0.4, 2.2],
    "pondCenter": [-5.0, 0.4, 4.0],
    "outcropCenter": [6.2, 0.4, -5.6]
  },
  "joints": [],
  "parts": [
    {
      "id": "terrain",
      "builds": "The diorama base and natural scenery only. The slab is an extruded irregular chamfered rectangle, about 15 x 13 m with 1.2 m chamfered corners. It has three visible side strata: a top snow layer from y=0.28 to 0.4 in snowLit with a snowShade lip, a middle iceBlue/iceDeep band (stripes of two blues, with some chunky offset blocks for a cut-away look), and a rockDark/rockMid base from y=0 to 0.14, with a few jagged blocks poking out of the side. The top is flat snowLit, with a slightly different tone patch of snowShade here and there. Low drifts (flattened wedge or half-sphere slabs, snowLit top and snowShade lee side) pile against the cabin's front stilts, the lab's rear, and the mast base. A frozen pond (flat low-poly ice disc in iceBlue with an iceDeep rim, pale crack lines and a few paperWhite glints) sits at the pondCenter, about 3 m across. A packed-snow path (flat, slightly sunken strips in snowShade, offset in a staggered zigzag) runs from pathStart to pathEnd, with a few footprint pairs. A rock outcrop of stacked faceted rocks in rockDark/rockMid with snowLit caps sits at outcropCenter, rising to 3 m. A few scattered boulders (rockMid with snowLit caps) of 0.3-0.8 m lie around, kept clear of the cabin, lab, mast, yard and path. Bare ground patches of rockMid peek through the snow. No buildings, props or machinery.",
      "box": [[-7.5, 0, -6.5], [7.5, 3.2, 6.5]],
      "attaches": "Its top face is groundTop (y=0.4). Every other part stands on it and builds down to y=0.4, sinking up to 2 cm into it. It must leave free the footprints of the cabin (x -6.1..1.0, z -2.5..4.8), the lab and solar array (x 2.0..6.8, z -4.6..2.0), the mast and weather station (x -6.4..-0.2, z -6.4..-2.6) and the yard (x 1.2..7.3, z 2.4..6.3). The pond sits at pondCenter and the outcrop at outcropCenter.",
      "joints": [],
      "floor": true,
      "budget": 140
    },
    {
      "id": "mainCabin",
      "builds": "The main timber cabin on stilts. Eight stout stilts (square posts) with cross-bracing run from y=0.4 to the floor at y=1.0, in cabinDark, with snowShade drifts at their feet. The floor platform is cabinDark. The walls are a box x -5.6..0.8, z -2.0..1.8, up to y=3.5, built as cabinRust board slabs with thin vertical battens in cabinDark and trimCream corner posts, window frames and a trimCream belt line. Window set: front wall has two large windows each side of the door, and side and back walls have one or two each. Each window is an ink frame, a glowing windowGlow pane, cross mullions in trimCream and a small snowLit sill cap. A thick chunky door in cabinDark at cabinDoor (x -2.4) with a trimCream frame, a small round window, a handle and an ink-and-glowOrange lantern beside it. A gable roof with ridge along X reaches ridge y=4.9. It has overhangs of 0.5 m, is built from two roofDark slabs with cabinDark fascia boards, and carries thick snowLit snow slabs on top with drooping snowShade lips and a few icicle cones in iceBlue along the front eave. The east gable end has a door at cabinEastDoor leading to the corridor. A fat stone-block chimney at x=-4.2, z=-1.0, rising to y=6.0 in rockMid with a rockDark cap and snowLit top, with a flat-colour smoke puff stack of 4 stacked low-poly spheres of decreasing opacity-free tones (snowShade to paperWhite) drifting up and back. The porch deck at y=1.0 runs z 1.8..3.4 in woodLight with plank lines, with a railing of posts and rail in cabinDark, four porch posts and a small shed roof (roofDark with snow cap) at y=3.3..3.6. A staircase of 5 steps in woodLight with cabinDark stringers runs from porchFront down to stairsFoot, with railings. On the porch sit a firewood stack (stacked cylinders in woodLight with trimCream end-rings) against the front wall, a bench, a coil of rope in cabinDark, a hanging sign in trimCream with ink text lines for 'POLAR STATION 7', and a tiny signalRed emergency box. On the roof: a small metalGrey stove pipe and a roof vent.",
      "box": [[-6.1, 0.4, -2.5], [1.0, 6.2, 4.8]],
      "attaches": "Stilts stand on groundTop. The east door aligns with corridorWest (0.8, 1.0, -0.2), where the lab's corridor meets the east wall. The stairs end at stairsFoot on the path start. The chimney and roof stay inside the box and clear of the mast part (z < -2.6).",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "labModule",
      "builds": "The science lab, its corridor, rooftop gear and solar array. A glazed corridor runs x 0.8..2.0 at z -0.2 (1.2 m wide, y 1.0..2.6). It has metalDark frame bars, windowGlow panes, a roofDark flat roof with snow cap, and a short floor in woodLight. The lab is a barrel-vaulted shipping-container style hut, x 2.0..6.4, z -2.0..1.6, on short metalDark stilts with a floor at y=1.0 and walls to y=3.0. It has a half-cylinder vault roof (faceted, 8 segments) to y=3.9 in labMustard, with ribbing in labTeal and a thick snowLit snow slab following the top with snowShade lip. The walls are labMustard corrugated, with vertical rib slabs in a darker labTeal band at the base. A large signalRed stripe runs around the body. The front wall has a double door at labFrontDoor (x 4.2) in labTeal with ink handles and a small step platform in metalGrey with 2 steps. Two round porthole windows with glowing windowGlow glass and ink rims sit on the front wall, plus a glowing rectangular window on the back and east walls. A large sign 'GLACIO LAB' on the front wall above the door, built as paperWhite plate with ink bar-letters. On the roof at labRoofTop sits a satellite dish (faceted metalGrey dish, paperWhite inner, on a metalDark mast and angled up to the south east), a small cluster of white sensor boxes and two vent stacks with snow caps, plus a thin whip antenna with a signalRed tip. Beside the east wall there is a metalGrey generator box with a vent grille and exhaust pipe. Behind the lab on the ground, at solarArrayCenter, stands a solar array of 3 tilted panels (slabs in solarBlue with solarLine grid lines and metalDark frames, on metalGrey A-frame legs, each with a thin snowLit snow strip on its upper edge), about 1.6 m wide each and 1.2 m tall, facing the front-up. Cables in ink run from the array to the lab's back wall.",
      "box": [[2.0, 0.4, -4.6], [6.8, 5.6, 2.2]],
      "attaches": "The corridor's west end meets the cabin east wall at corridorWest (0.8, 1.0, -0.2) and its east end meets the lab west wall at corridorEast (2.0, 1.0, -0.2). The stilts and A-frame legs stand on groundTop. The front steps end near pathEnd (4.2, 0.4, 2.2).",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "mastWeather",
      "builds": "The radio mast and weather station. At mastBase there is a lattice tower 8.6 m tall (to y=9.0): a triangular lattice made of three metalGrey legs (thin rods or square tubes) with diagonal zigzag braces and horizontal rings every 1.2 m. Alternating signalRed and paperWhite painted sections cover the top 4 m, on a concrete footing of rockMid with a snowLit cap. At about 3, 5.5 and 8 m height, the tower has platform rings with ink rails. Mounted on it: a boxy VHF antenna array, two cross-arm yagi antennas (rods in metalGrey with paperWhite elements), a small radome sphere in paperWhite, and a glowing signalRed beacon sphere on the very top at mastTop (y about 9.0), with a metalDark lightning rod above it reaching about 9.5. A cup anemometer (three cups on rods, on a small mast) and wind vane (arrow in signalRed) sit at the top beside the beacon. Three guy wires (thin ink rods or sweeps) run from the 6 m ring down to ground anchors at about 1.7 m radius (metalDark anchor blocks with snowLit caps) on the sides away from the cabin. A small ink-roofed instrument hut sits at the mast foot: a metalGrey cabinet with a signalRed warning triangle and a cable bundle into the tower. At weatherStation stands a Stevenson screen: a louvred box (paperWhite with thin slat lines in snowShade) on four woodLight legs at 1.1 m height, with a roof slab (paperWhite with a snow cap) and a door. Beside it stands a snow stake (a thin pole in signalRed and paperWhite stripes about 1.8 m high) and a small rain/snow gauge cylinder in metalGrey with a funnel.",
      "box": [[-6.4, 0.4, -6.4], [-0.2, 9.6, -2.6]],
      "attaches": "Tower feet and anchors rest on groundTop (y=0.4). It stays behind the cabin (z < -2.6). The mast base is at mastBase (-4.4, 0.4, -4.4) and the beacon at mastTop. The weather station is at weatherStation (-1.2, 0.4, -4.5).",
      "joints": [],
      "floor": false,
      "budget": 160
    },
    {
      "id": "yardProps",
      "builds": "The working yard in front of the lab, in the front-right corner. A horizontal fuel tank at fuelTank (6.3, 0.4, 3.5): a faceted cylinder 1.0 m diameter and 2 m long, lying along Z, in signalRed with paperWhite stripe bands, on two metalDark cradles with a snowLit snow cap along its top, filler cap, gauge and a small hose reel. Next to it stand a cluster of 5 oil drums (cylinders in labTeal, signalRed and metalGrey with ink rim rings and snow caps), some stacked and one tipped over. A wooden cargo sled at about (5.0, 5.4), in woodLight, with two curved runners in metalDark, loaded with 3 crates (cabinRust, labMustard and woodLight, with ink strap bands, stencil marks and snow caps), tied down with rope lines in ink. A snowmobile at about (2.9, 5.0), angled slightly off axis and facing +Z: a body shell in signalRed with a paperWhite hood stripe, a dark metalDark seat, a windscreen in iceBlue, two front skis in metalGrey, a rubber track in ink under the body with grouser bars, a headlight in glowing windowGlow, handlebars and a small paperWhite number plate. All parts carry snow caps in snowLit. A flagpole at flagpoleBase (1.8, 0.4, 3.2), 3.2 m tall, in metalGrey with a golden ball finial and a flat folded flag (an extruded rectangle in flagTeal with a signalRed and paperWhite emblem circle), snapping toward +X. A pair of skis and two ski poles are stuck in a snow mound beside a stack of 2 snow-shoes. A small stack of supply boxes in paperWhite with signalRed crosses sits beside the lab step. Everything is blocky, simple and chunky.",
      "box": [[1.2, 0.4, 2.4], [7.3, 3.8, 6.3]],
      "attaches": "All props stand on groundTop (y=0.4). They stay in front of the lab (z > 2.4) and east of the path (x > 1.2). The flagpole sits at flagpoleBase and the tank at fuelTank.",
      "joints": [],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: terrain -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildTerrain({ b, P, M }: Ctx) {
  const R = rng(11);
  const TOP = 0.4;
  const put = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], o: any = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, o);

  // chamfered rectangle outline (x, z)
  const hw = 7.5, hd = 6.5, ch = 1.2;
  const outline: [number, number][] = [
    [-hw + ch, -hd], [hw - ch, -hd], [hw, -hd + ch], [hw, hd - ch],
    [hw - ch, hd], [-hw + ch, hd], [-hw, hd - ch], [-hw, -hd + ch],
  ];
  // layer: extrude outline, laid flat. Shape x->X, shape y->-Z after rotation X(+90)
  const layer = (y0: number, y1: number, c: string, grow = 0) => {
    const s = new THREE.Shape();
    outline.forEach(([x, z], i) => {
      const k = 1 + grow / 7;
      i ? s.lineTo(x * k, -z * k) : s.moveTo(x * k, -z * k);
    });
    const g = new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return put(g, c, [0, y0, 0], { at: [0, y0, 0] });
  };
  layer(0, 0.14, P.rockDark);
  layer(0.14, 0.17, P.rockMid, -0.0);
  layer(0.14, 0.28, P.iceBlue);
  layer(0.28, 0.4, P.snowLit);
  // slightly larger shadow lip
  layer(0.26, 0.3, P.snowShade, 0.12);
  layer(0.3, 0.4, P.snowLit, 0.0);

  // ice stripes on the sides
  for (const [x, z, w, d] of [[0, hd, 13.6, 0.04], [0, -hd, 13.6, 0.04], [hw, 0, 0.04, 11.6], [-hw, 0, 0.04, 11.6]] as number[][]) {
    box(w || 0.04, 0.05, d || 0.04, P.iceDeep, [x, 0.2, z]);
  }
  // chunky offset blocks and jagged rock poking out
  const sides: [number, number, number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 4;
    const t = R() * 2 - 1;
    if (side === 0) sides.push([t * 6, hd + 0.06, 0.9, 0]);
    if (side === 1) sides.push([t * 6, -hd - 0.06, 0.9, 0]);
    if (side === 2) sides.push([hw + 0.06, t * 5, 0, 0.9]);
    if (side === 3) sides.push([-hw - 0.06, t * 5, 0, 0.9]);
  }
  sides.forEach(([x, z, w, d], i) => {
    const horiz = w > 0;
    const c = i % 3 === 0 ? P.iceDeep : i % 3 === 1 ? P.iceBlue : P.rockMid;
    const y = i % 3 === 2 ? 0.07 : 0.2;
    box(horiz ? w : 0.14, i % 3 === 2 ? 0.16 : 0.13, horiz ? 0.14 : d, c, [x, y, z]);
  });

  // snowShade top patches
  for (let i = 0; i < 9; i++) {
    const x = (R() * 2 - 1) * 6.5, z = (R() * 2 - 1) * 5.5;
    if (x > -6.4 && x < 7.4 && z > -6.4 && z < 6.3 && (Math.abs(x + 2) < 6 && z > -3 && z < 5.2)) continue;
    box(0.8 + R(), 0.01, 0.6 + R(), P.snowShade, [x, TOP + 0.005, z]);
  }
  // bare rock patches
  for (const [x, z] of [[-6.6, -1.5], [7, 0.5], [-1.5, 6], [-3, -6]]) {
    put(new THREE.CylinderGeometry(0.45, 0.5, 0.02, 6), P.rockMid, [x, TOP + 0.01, z]);
  }

  // drifts
  const drift = (x: number, z: number, sx: number, sy: number, sz: number) => {
    put(new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.snowShade, [x, TOP - 0.02, z + 0.12], { scale: [sx, sy, sz] });
    put(new THREE.SphereGeometry(1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.snowLit, [x, TOP - 0.01, z], { scale: [sx * 0.95, sy * 1.02, sz * 0.85] });
  };
  for (const x of [-5, -3.6, -2.4, -1.2, 0]) drift(x, 2.2, 0.7, 0.28, 0.4);
  drift(4.2, -2.4, 2.2, 0.4, 0.5);
  drift(-4.4, -3.4, 0.9, 0.35, 0.6);
  drift(-5.2, -4.6, 0.6, 0.25, 0.5);

  // pond
  const [px, , pz] = M.pondCenter;
  put(new THREE.CylinderGeometry(1.65, 1.7, 0.04, 9), P.iceDeep, [px, TOP + 0.02, pz]);
  put(new THREE.CylinderGeometry(1.45, 1.45, 0.03, 9), P.iceBlue, [px, TOP + 0.045, pz]);
  const cracks: [number, number, number, number][] = [[-0.5, 0.2, 0.9, 0.5], [0.4, -0.5, 0.8, -0.8], [0.3, 0.5, 0.6, 1.2], [-0.2, -0.3, 0.7, 2.2]];
  for (const [dx, dz, l, a] of cracks)
    box(l, 0.008, 0.025, P.paperWhite, [px + dx, TOP + 0.065, pz + dz], { rotation: [0, a * 57, 0] });
  for (const [dx, dz] of [[0.8, 0.6], [-0.9, -0.5], [0.1, 0.9]])
    box(0.14, 0.01, 0.05, P.paperWhite, [px + dx, TOP + 0.07, pz + dz]);

  // path zigzag from (-2.4,5) to (4.2,2.2): stepped slabs
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = -2.4 + 6.6 * t, z = 5 + (2.2 - 5) * t + (i % 2 ? 0.18 : -0.18);
    box(1.0, 0.02, 0.8, P.snowShade, [x, TOP - 0.005, z], { rotation: [0, -22, 0] });
  }
  // footprints
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.17;
    const x = -2.4 + 6.6 * t, z = 5 - 2.8 * t;
    box(0.1, 0.012, 0.22, P.snowDeep, [x, TOP + 0.012, z + 0.15], { rotation: [0, -22, 0] });
    box(0.1, 0.012, 0.22, P.snowDeep, [x + 0.05, TOP + 0.012, z - 0.15], { rotation: [0, -22, 0] });
  }

  // rock outcrop
  const rock = (x: number, z: number, r: number, h: number, c: string, y0 = TOP) => {
    const g = new THREE.DodecahedronGeometry(r, 0);
    put(g, c, [x, y0 + h / 2, z], { scale: [1, h / (2 * r), 1], rotation: [0, R() * 360, 0] });
    put(new THREE.CylinderGeometry(r * 0.55, r * 0.8, 0.12, 6), P.snowLit, [x, y0 + h - 0.02, z]);
  };
  const [ox, , oz] = M.outcropCenter;
  rock(ox, oz, 1.5, 1.8, P.rockDark);
  rock(ox - 1.0, oz + 0.6, 1.0, 1.3, P.rockMid);
  rock(ox + 0.9, oz + 0.4, 0.9, 1.2, P.rockMid);
  rock(ox - 0.1, oz - 0.2, 1.0, 1.1, P.rockDark, TOP + 1.8);
  rock(ox + 0.3, oz - 0.1, 0.55, 0.5, P.rockMid, TOP + 2.8 - 0.4);

  // boulders
  for (const [x, z, r] of [[-6.6, 5.6, 0.4], [-6.8, -5.8, 0.35], [0, -6.1, 0.3], [7, 1.2, 0.35], [-0.2, 5.9, 0.28], [-6.9, 1.2, 0.3]])
    rock(x, z, r, r * 1.5, P.rockMid);
}
```

<!-- call: yardProps -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildYardProps({ b, P, M }: any) {
  const G = 0.4;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, rot: number[] = [0, 0, 0], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });
  const ball = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });
  const snow = (w: number, d: number, x: number, y: number, z: number, ry = 0) => {
    box(w, 0.07, d, P.snowLit, x, y, z, ry);
  };

  // Fuel tank along Z
  const [tx, , tz] = M.fuelTank;
  const ty = G + 0.28 + 0.5;
  cyl(0.5, 0.5, 2, P.signalRed, tx, ty, tz, [90, 0, 0], 12);
  for (const dz of [-0.5, 0.5]) cyl(0.51, 0.51, 0.16, P.paperWhite, tx, ty, tz + dz, [90, 0, 0], 12);
  for (const dz of [-0.7, 0.7]) box(0.9, 0.3, 0.14, P.metalDark, tx, G + 0.15, tz + dz);
  box(0.46, 0.07, 1.7, P.snowLit, tx, ty + 0.5, tz);
  box(0.4, 0.05, 1.7, P.snowShade, tx, ty + 0.46, tz);
  cyl(0.12, 0.12, 0.1, P.metalDark, tx, ty + 0.54, tz - 0.5);
  cyl(0.07, 0.07, 0.04, P.metalGrey, tx, ty + 0.6, tz - 0.5);
  cyl(0.09, 0.09, 0.04, P.paperWhite, tx + 0.5, ty + 0.05, tz + 0.1, [0, 0, 90]);
  cyl(0.06, 0.06, 0.03, P.ink, tx + 0.52, ty + 0.05, tz + 0.1, [0, 0, 90]);
  // hose reel
  cyl(0.2, 0.2, 0.1, P.signalRed, tx + 0.58, ty - 0.2, tz + 0.7, [0, 0, 90]);
  cyl(0.1, 0.1, 0.12, P.ink, tx + 0.6, ty - 0.2, tz + 0.7, [0, 0, 90], 8);

  // Drums
  const drum = (x: number, y: number, z: number, c: string) => {
    cyl(0.28, 0.28, 0.8, c, x, y + 0.4, z);
    for (const dy of [0.08, 0.72]) cyl(0.295, 0.295, 0.05, P.ink, x, y + dy, z);
    cyl(0.25, 0.25, 0.05, P.snowLit, x, y + 0.83, z);
  };
  drum(5.3, G, 2.9, P.labTeal);
  drum(5.3, G, 2.9 + 0.62, P.signalRed);
  drum(7.0, G, 4.8, P.metalGrey);
  drum(6.45, G, 5.0, P.labTeal);
  drum(6.45, G + 0.8, 5.0, P.signalRed);
  cyl(0.28, 0.28, 0.8, P.metalGrey, 6.9, G + 0.28, 5.7, [90, 20, 0]);
  cyl(0.295, 0.295, 0.05, P.ink, 6.9, G + 0.28, 5.3, [90, 20, 0]);

  // Sled
  const sx = 5.0, sz = 5.4;
  box(1.2, 0.1, 1.9, P.woodLight, sx, G + 0.28, sz);
  for (const s of [-1, 1]) {
    box(0.1, 0.1, 2.1, P.metalDark, sx + s * 0.5, G + 0.08, sz);
    box(0.08, 0.18, 0.08, P.metalDark, sx + s * 0.5, G + 0.2, sz - 0.6);
    box(0.08, 0.18, 0.08, P.metalDark, sx + s * 0.5, G + 0.2, sz + 0.6);
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.3), P.metalDark, { at: [sx + s * 0.5, G + 0.16, sz + 1.1], rotation: [-30, 0, 0] });
  }
  const crate = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) => {
    box(w, h, d, c, x, y + h / 2, z);
    box(w + 0.02, h + 0.02, 0.07, P.ink, x, y + h / 2, z);
    box(w * 0.4, 0.02, d * 0.3, P.ink, x, y + h + 0.0, z + d * 0.2);
    snow(w * 0.95, d * 0.95, x, y + h + 0.03, z);
  };
  crate(0.7, 0.55, 0.7, P.cabinRust, sx - 0.15, G + 0.33, sz - 0.5);
  crate(0.6, 0.5, 0.6, P.labMustard, sx + 0.2, G + 0.33, sz + 0.35);
  crate(0.45, 0.4, 0.45, P.woodLight, sx - 0.25, G + 0.33, sz + 0.5);
  box(1.25, 0.03, 0.03, P.ink, sx, G + 0.9, sz - 0.1, 0);
  box(0.03, 0.03, 1.5, P.ink, sx - 0.4, G + 0.89, sz);

  // Snowmobile
  const mx = 2.9, mz = 5.0, ry = 20;
  const sm = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) => {
    const a = (ry * Math.PI) / 180;
    const wx = mx + x * Math.cos(a) + z * Math.sin(a);
    const wz = mz - x * Math.sin(a) + z * Math.cos(a);
    box(w, h, d, c, wx, y, wz, ry);
  };
  sm(0.5, 0.2, 1.7, P.ink, 0, G + 0.2, -0.1);
  for (let i = 0; i < 6; i++) sm(0.54, 0.04, 0.05, P.metalDark, 0, G + 0.08, -0.8 + i * 0.28);
  sm(0.5, 0.3, 1.1, P.signalRed, 0, G + 0.5, 0);
  sm(0.45, 0.22, 0.6, P.signalRed, 0, G + 0.5, 0.65);
  sm(0.14, 0.03, 0.6, P.paperWhite, 0, G + 0.63, 0.65);
  sm(0.4, 0.12, 0.6, P.metalDark, 0, G + 0.72, -0.25);
  sm(0.4, 0.05, 0.5, P.snowLit, 0, G + 0.8, -0.25);
  sm(0.4, 0.3, 0.04, P.iceBlue, 0, G + 0.82, 0.38);
  sm(0.6, 0.05, 0.05, P.metalDark, 0, G + 0.82, 0.2);
  sm(0.14, 0.12, 0.05, P.windowGlow, 0, G + 0.5, 0.97);
  sm(0.2, 0.12, 0.03, P.paperWhite, 0, G + 0.45, -0.98);
  for (const s of [-1, 1]) {
    sm(0.1, 0.05, 0.8, P.metalGrey, s * 0.4, G + 0.1, 0.75);
    sm(0.06, 0.2, 0.06, P.metalDark, s * 0.4, G + 0.25, 0.6);
  }

  // Flagpole
  const [fx, , fz] = M.flagpoleBase;
  cyl(0.1, 0.1, 0.12, P.rockMid, fx, G + 0.06, fz);
  cyl(0.035, 0.045, 3.1, P.metalGrey, fx, G + 1.55, fz, [0, 0, 0], 8);
  ball(0.08, "#e8b832", fx, G + 3.1, fz);
  box(0.9, 0.55, 0.03, P.flagTeal, fx + 0.5, G + 2.75, fz);
  cyl(0.15, 0.15, 0.035, P.paperWhite, fx + 0.5, G + 2.75, fz, [90, 0, 0], 12);
  cyl(0.08, 0.08, 0.04, P.signalRed, fx + 0.5, G + 2.75, fz, [90, 0, 0], 12);

  // Snow mound with skis, poles, snowshoes
  b.part(new THREE.SphereGeometry(0.5, 8, 5), P.snowLit, { at: [1.9, G, 5.7], scale: [1, 0.4, 1] });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.08, 1.5, 0.03), P.signalRed, { at: [1.85 + s * 0.1, G + 0.75, 5.7], rotation: [0, 0, s * 8] });
    cyl(0.015, 0.015, 1.3, P.metalDark, 2.2 + s * 0.1, G + 0.6, 5.65, [0, 0, -s * 10], 6);
    ball(0.05, P.ink, 2.2 + s * 0.1, G + 0.02, 5.65);
  }
  for (let i = 0; i < 2; i++) b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), P.woodLight, { at: [1.6, G + 0.04 + i * 0.05, 6.1], scale: [0.7, 1, 1.2] });

  // Supply boxes by lab step
  const boxes: [number, number, number, number][] = [[3.5, G, 2.7, 0.5], [4.1, G, 2.7, 0.45], [3.8, G + 0.5, 2.7, 0.4]];
  for (const [x, y, z, s] of boxes) {
    box(s, s, s, P.paperWhite, x, y + s / 2, z);
    box(s * 0.7, 0.02, s * 0.15, P.signalRed, x, y + s + 0.005, z);
    box(s * 0.15, 0.02, s * 0.7, P.signalRed, x, y + s + 0.005, z);
    box(s * 0.7, s * 0.15, 0.02, P.signalRed, x, y + s / 2, z + s / 2 + 0.005);
    box(s * 0.15, s * 0.7, 0.02, P.signalRed, x, y + s / 2, z + s / 2 + 0.006);
  }
  snow(0.4, 0.4, 3.8, G + 0.93, 2.7);
}
```

<!-- call: mastWeather -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMastWeather({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const ball = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });
  const rod = (a: number[], c2: number[], r: number, c: string) =>
    b.rod(a, c2, r, c, { sides: 6 } as any);

  const [mx, my, mz] = M.mastBase;
  const H = 8.6;
  // concrete footing
  cyl(0.95, 1.05, 0.3, P.rockMid, mx, my + 0.13, mz, 6);
  cyl(0.9, 0.95, 0.06, P.snowLit, mx, my + 0.3, mz, 6);

  const rAt = (y: number) => 0.85 - 0.45 * ((y - my) / H);
  const legPt = (i: number, y: number): number[] => {
    const a = (i * 2 * Math.PI) / 3 + Math.PI / 2;
    const r = rAt(y);
    return [mx + Math.cos(a) * r, y, mz + Math.sin(a) * r];
  };
  const y0 = my + 0.28, y1 = my + H;
  for (let i = 0; i < 3; i++) rod(legPt(i, y0), legPt(i, y1), 0.05, P.metalGrey);

  const seg = 1.2;
  const n = Math.floor((y1 - y0) / seg);
  for (let k = 0; k <= n; k++) {
    const y = y0 + k * seg;
    const top = y > y1 - 4;
    const col = top ? (k % 2 ? P.paperWhite : P.signalRed) : P.metalGrey;
    for (let i = 0; i < 3; i++) rod(legPt(i, y), legPt((i + 1) % 3, y), 0.03, col);
    if (k < n) {
      const ya = y + seg;
      for (let i = 0; i < 3; i++) {
        const j = (i + 1) % 3;
        const bc = top ? (k % 2 ? P.signalRed : P.paperWhite) : P.metalGrey;
        if (k % 2) rod(legPt(i, y), legPt(j, ya), 0.025, bc);
        else rod(legPt(j, y), legPt(i, ya), 0.025, bc);
      }
    }
  }
  // painted leg sections on top 4 m
  for (let i = 0; i < 3; i++)
    for (let k = 0; k < 4; k++) {
      const a = y1 - 4 + k, c2 = a + 1;
      rod(legPt(i, a), legPt(i, c2), 0.062, k % 2 ? P.paperWhite : P.signalRed);
    }

  // platforms
  for (const h of [3, 5.5, 8]) {
    const y = my + h, r = rAt(y) + 0.22;
    const g = new THREE.CylinderGeometry(r, r, 0.05, 6);
    b.part(g, P.metalDark, { at: [mx, y, mz] });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      cyl(0.014, 0.014, 0.5, P.ink, mx + Math.cos(a) * r, y + 0.27, mz + Math.sin(a) * r, 5);
    }
    for (let i = 0; i < 6; i++) {
      const a0 = (i * Math.PI) / 3, a1 = a0 + Math.PI / 3;
      rod([mx + Math.cos(a0) * r, y + 0.5, mz + Math.sin(a0) * r], [mx + Math.cos(a1) * r, y + 0.5, mz + Math.sin(a1) * r], 0.015, P.ink);
    }
    box(0.3, 0.04, 0.15, P.snowLit, mx + r * 0.5, y + 0.04, mz - r * 0.3);
  }

  // top: beacon, rod, mast
  cyl(0.06, 0.1, 0.25, P.metalDark, mx, my + H + 0.1, mz);
  ball(0.17, P.signalRed, mx, my + H + 0.32, mz);
  rod([mx, my + H + 0.45, mz], [mx, 9.5, mz], 0.015, P.metalDark);
  // anemometer
  const ax = mx + 0.55, az = mz + 0.1;
  rod([ax, my + H - 0.5, az], [ax, my + H + 0.45, az], 0.025, P.metalDark);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    const ex = ax + Math.cos(a) * 0.25, ez = az + Math.sin(a) * 0.25;
    rod([ax, my + H + 0.4, az], [ex, my + H + 0.4, ez], 0.01, P.metalGrey);
    ball(0.055, P.paperWhite, ex, my + H + 0.4, ez);
  }
  // wind vane
  const vx = mx - 0.5, vz = mz - 0.1;
  rod([vx, my + H - 0.5, vz], [vx, my + H + 0.4, vz], 0.02, P.metalDark);
  rod([vx, my + H + 0.4, vz - 0.3], [vx, my + H + 0.4, vz + 0.3], 0.015, P.metalDark);
  b.part(new THREE.ConeGeometry(0.07, 0.2, 4), P.signalRed, { at: [vx, my + H + 0.4, vz + 0.4], rotation: [90, 0, 0] });
  box(0.02, 0.16, 0.14, P.signalRed, vx, my + H + 0.4, vz - 0.35);

  // yagis on cross-arms
  for (const [h, d] of [[6.8, 1], [4.2, -1]]) {
    const y = my + h, x = mx + d * 0.55;
    rod([x - 0.5, y, mz + 0.3], [x + 0.5, y, mz + 0.3], 0.03, P.metalGrey);
    rod([mx, y, mz], [x, y, mz + 0.3], 0.025, P.metalGrey);
    for (let k = 0; k < 5; k++) {
      const xx = x - 0.4 + k * 0.2;
      box(0.02, 0.02, 0.5 - k * 0.05, P.paperWhite, xx, y, mz + 0.3);
    }
  }
  // VHF array
  box(0.25, 0.6, 0.12, P.metalGrey, mx - 0.25, my + 7.2, mz + 0.4);
  for (let k = 0; k < 4; k++) box(0.3, 0.025, 0.05, P.paperWhite, mx - 0.25, my + 7.0 + k * 0.14, mz + 0.48);
  ball(0.18, P.paperWhite, mx + 0.3, my + 5.0, mz - 0.45);

  // guy wires: away from cabin (back / left)
  const [gx, , gz] = [mx, 0, mz];
  const top = [mx, my + 6, mz];
  const angs = [200, 270, 340];
  angs.forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const ax2 = gx + Math.cos(a) * 1.7, az2 = gz + Math.sin(a) * 1.7;
    const bx = Math.min(Math.max(ax2, -6.2), -0.4), bz = Math.max(az2 - 0.2, -6.2);
    const t = [mx + Math.cos(a) * 0.3, top[1], mz + Math.sin(a) * 0.3];
    rod(t, [bx, my + 0.25, bz], 0.012, P.ink);
    box(0.3, 0.2, 0.3, P.metalDark, bx, my + 0.08, bz);
    box(0.32, 0.05, 0.32, P.snowLit, bx, my + 0.2, bz);
  });

  // instrument hut
  const hx = mx + 1.5, hz = mz + 0.9;
  box(0.7, 0.7, 0.5, P.metalGrey, hx, my + 0.35, hz);
  box(0.78, 0.08, 0.58, P.ink, hx, my + 0.74, hz);
  box(0.8, 0.06, 0.6, P.snowLit, hx, my + 0.81, hz);
  b.part(new THREE.ConeGeometry(0.1, 0.16, 3), P.signalRed, { at: [hx, my + 0.4, hz + 0.26], rotation: [90, 0, 0] });
  box(0.14, 0.2, 0.02, P.metalDark, hx - 0.2, my + 0.3, hz + 0.26);
  rod([hx - 0.35, my + 0.15, hz - 0.1], [mx + 0.7, my + 0.3, mz + 0.25], 0.04, P.ink);

  // Stevenson screen
  const [wx, , wz] = M.weatherStation;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.06, 1.1, 0.06, P.woodLight, wx + sx * 0.3, 0.4 + 0.55, wz + sz * 0.25);
  box(0.8, 0.5, 0.65, P.paperWhite, wx, 1.75, wz);
  for (let k = 0; k < 6; k++) {
    box(0.82, 0.015, 0.02, P.snowShade, wx, 1.55 + k * 0.08, wz + 0.33);
    box(0.02, 0.015, 0.67, P.snowShade, wx + 0.41, 1.55 + k * 0.08, wz);
  }
  box(0.9, 0.07, 0.75, P.paperWhite, wx, 2.04, wz);
  box(0.86, 0.07, 0.7, P.snowLit, wx, 2.1, wz);
  box(0.9, 0.03, 0.75, P.snowShade, wx, 2.0, wz);
  box(0.02, 0.4, 0.02, P.ink, wx, 1.75, wz + 0.33);
  box(0.04, 0.06, 0.03, P.metalDark, wx + 0.1, 1.75, wz + 0.34);

  // snow stake
  const sx = wx + 0.9, sz2 = wz + 0.3;
  for (let k = 0; k < 6; k++) cyl(0.03, 0.03, 0.3, k % 2 ? P.paperWhite : P.signalRed, sx, 0.4 + 0.15 + k * 0.3, sz2, 6);
  // gauge
  const gx2 = wx - 0.9, gz2 = wz + 0.3;
  cyl(0.12, 0.12, 0.4, P.metalGrey, gx2, 0.6, gz2, 8);
  b.part(new THREE.CylinderGeometry(0.15, 0.1, 0.1, 8), P.metalDark, { at: [gx2, 0.85, gz2] });
  cyl(0.15, 0.15, 0.03, P.snowLit, gx2, 0.9, gz2, 8);
  box(0.4, 0.1, 0.3, P.snowShade, wx, 0.43, wz + 0.6);
}
```

<!-- call: labModule -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLabModule({ b, J, P, M }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const sph = (r: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z] });
  const R = rng(5);

  // corridor
  box(1.2, 0.12, 1.2, P.woodLight, 1.4, 1.0, -0.2);
  box(1.2, 0.08, 1.2, P.metalDark, 1.4, 0.92, -0.2);
  for (const z of [-0.8, 0.4]) for (const x of [0.8, 2.0]) box(0.08, 1.5, 0.08, P.metalDark, x, 1.8, z);
  for (const z of [-0.8, 0.4]) {
    box(1.2, 0.06, 0.06, P.metalDark, 1.4, 2.55, z);
    box(1.2, 0.06, 0.06, P.metalDark, 1.4, 1.1, z);
    box(1.04, 1.3, 0.03, P.windowGlow, 1.4, 1.8, z);
  }
  for (const x of [1.1, 1.4, 1.7]) box(0.04, 1.4, 0.05, P.metalDark, x, 1.8, 0.4);
  box(1.4, 0.1, 1.5, P.roofDark, 1.4, 2.65, -0.2);
  box(1.4, 0.14, 1.5, P.snowLit, 1.4, 2.77, -0.2);
  box(1.4, 0.06, 1.5, P.snowShade, 1.4, 2.67, -0.2);

  // lab stilts
  for (const x of [2.3, 4.2, 6.1]) for (const z of [-1.7, 1.3]) box(0.2, 0.62, 0.2, P.metalDark, x, 0.7, z);
  box(4.4, 0.16, 3.6, P.metalDark, 4.2, 1.0, -0.2);
  // walls
  box(4.4, 2.0, 3.6, P.labMustard, 4.2, 2.08, -0.2);
  box(4.46, 0.7, 3.66, P.labTeal, 4.2, 1.45, -0.2);
  box(4.5, 0.24, 3.7, P.signalRed, 4.2, 2.45, -0.2);
  for (let i = 0; i < 12; i++) {
    const x = 2.2 + i * 0.37;
    box(0.06, 0.9, 0.05, P.cabinDark, x, 1.5, 1.64);
    box(0.06, 0.9, 0.05, P.cabinDark, x, 1.5, -2.04);
    box(0.05, 0.9, 0.04, P.metalDark, x, 2.85, 1.62);
  }
  // vault roof
  const vault = b.part(new THREE.CylinderGeometry(1.8, 1.8, 4.4, 8, 1, false, 0, Math.PI), P.labMustard, {
    at: [4.2, 3.0, -0.2], rotation: [0, 0, 90],
  });
  vault.mesh.rotation.set(0, 0, 0);
  vault.mesh.rotation.z = Math.PI / 2;
  vault.mesh.rotation.order = "XYZ";
  vault.mesh.rotation.y = 0;
  vault.mesh.scale.set(0.5, 1, 1);
  // use rotation around axis X-axis so half faces up: re-place simply with a rotated cylinder
  vault.mesh.rotation.set(0, 0, Math.PI / 2);
  vault.mesh.rotation.x = 0;
  // ribs
  for (const x of [2.4, 3.3, 4.2, 5.1, 6.0]) {
    b.part(new THREE.CylinderGeometry(1.82, 1.82, 0.08, 8, 1, false, 0, Math.PI), P.labTeal, {
      at: [x, 3.0, -0.2], rotation: [0, 0, 90],
    }).mesh.rotation.set(0, 0, Math.PI / 2);
  }
  // snow on roof
  box(4.4, 0.18, 0.9, P.snowLit, 4.2, 3.98, -0.2);
  box(4.4, 0.12, 2.0, P.snowShade, 4.2, 3.72, -0.2);
  box(4.4, 0.16, 1.5, P.snowLit, 4.2, 3.84, -0.2);

  // front door
  box(1.5, 1.8, 0.06, P.labTeal, 4.2, 1.98, 1.63);
  box(0.04, 1.7, 0.08, P.ink, 4.2, 1.98, 1.65);
  for (const s of [-1, 1]) box(0.05, 0.3, 0.06, P.ink, 4.2 + s * 0.15, 2.0, 1.69);
  box(1.6, 0.1, 0.08, P.metalDark, 4.2, 2.9, 1.65);
  // step platform
  box(1.7, 0.1, 0.5, P.metalGrey, 4.2, 0.86, 1.95);
  box(1.7, 0.1, 0.4, P.metalGrey, 4.2, 0.62, 2.15);
  box(1.7, 0.1, 0.3, P.snowLit, 4.2, 0.46, 2.1);
  box(1.7, 0.06, 0.4, P.metalDark, 4.2, 0.74, 2.0);
  // portholes
  for (const x of [2.9, 5.5]) {
    cyl(0.32, 0.32, 0.06, 10, P.ink, x, 2.1, 1.65, [90, 0, 0]);
    cyl(0.24, 0.24, 0.08, 10, P.windowGlow, x, 2.1, 1.66, [90, 0, 0]);
    box(0.04, 0.46, 0.09, P.ink, x, 2.1, 1.67);
  }
  // sign
  box(2.6, 0.5, 0.06, P.paperWhite, 4.2, 3.2, 1.64);
  box(2.7, 0.06, 0.07, P.ink, 4.2, 3.47, 1.64);
  for (let i = 0; i < 9; i++) box(0.1 + (i % 3) * 0.04, 0.26, 0.04, P.ink, 3.2 + i * 0.25, 3.2, 1.69);
  // back/east windows
  box(1.0, 0.6, 0.06, P.ink, 4.2, 2.1, -2.03);
  box(0.88, 0.48, 0.07, P.windowGlow, 4.2, 2.1, -2.04);
  box(0.06, 0.6, 1.0, P.ink, 6.43, 2.1, -0.2);
  box(0.07, 0.48, 0.88, P.windowGlow, 6.44, 2.1, -0.2);
  box(0.04, 0.5, 0.05, P.ink, 6.46, 2.1, -0.2);

  // roof gear
  box(0.3, 0.3, 0.3, P.metalDark, 3.0, 4.0, -0.2);
  cyl(0.06, 0.06, 0.7, 6, P.metalDark, 3.0, 4.3, -0.2);
  const dish = b.part(new THREE.CylinderGeometry(0.6, 0.12, 0.2, 10), P.metalGrey, {
    at: [3.0, 4.75, -0.2], dir: [0.5, 0.7, 0.5],
  });
  b.part(new THREE.CylinderGeometry(0.5, 0.1, 0.05, 10), P.paperWhite, {
    at: [3.06, 4.83, -0.14], dir: [0.5, 0.7, 0.5],
  });
  void dish;
  sph(0.07, P.signalRed, 3.2, 4.95, 0.0);
  for (const [x, z] of [[5.0, -0.8], [5.5, -0.5], [5.2, -0.2]]) {
    box(0.4, 0.3, 0.3, P.paperWhite, x, 4.15, z);
    box(0.42, 0.04, 0.32, P.snowLit, x, 4.32, z);
  }
  for (const x of [5.9, 6.1]) {
    cyl(0.1, 0.1, 0.5, 8, P.metalGrey, x, 4.0, -1.0);
    cyl(0.14, 0.14, 0.06, 8, P.snowLit, x, 4.3, -1.0);
  }
  cyl(0.015, 0.015, 1.4, 5, P.metalDark, 4.5, 4.6, -1.2);
  sph(0.05, P.signalRed, 4.5, 5.3, -1.2);

  // generator
  box(0.8, 0.8, 1.2, P.metalGrey, 6.9 - 0.15, 0.8, -0.4);
  box(0.84, 0.06, 1.24, P.snowLit, 6.75, 1.23, -0.4);
  for (let i = 0; i < 5; i++) box(0.04, 0.4, 0.05, P.metalDark, 6.34, 0.8, -0.1 - i * 0.1 + 0.2 - 0.3 + 0.0);
  cyl(0.06, 0.06, 0.9, 6, P.metalDark, 6.55, 1.6, -0.9);
  cyl(0.08, 0.08, 0.05, 6, P.snowLit, 6.55, 2.07, -0.9);

  // solar array
  for (let i = 0; i < 3; i++) {
    const x = 2.1 + i * 1.7 + 0.2;
    const z = -3.8;
    const g = new THREE.Group();
    void g;
    b.part(new THREE.BoxGeometry(1.6, 0.06, 1.2), P.metalDark, { at: [x + 0.6, 1.4, z], rotation: [-35, 0, 0] });
    b.part(new THREE.BoxGeometry(1.5, 0.05, 1.1), P.solarBlue, { at: [x + 0.6, 1.42, z + 0.01], rotation: [-35, 0, 0] });
    for (let k = 1; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.02, 0.055, 1.1), P.solarLine, { at: [x + 0.6 - 0.75 + k * 0.375, 1.425, z + 0.01], rotation: [-35, 0, 0] });
    b.part(new THREE.BoxGeometry(1.5, 0.02, 0.02), P.solarLine, { at: [x + 0.6, 1.44, z + 0.01], rotation: [-35, 0, 0] });
    b.part(new THREE.BoxGeometry(1.6, 0.07, 0.14), P.snowLit, { at: [x + 0.6, 1.88, z - 0.46], rotation: [-35, 0, 0] });
    for (const s of [-0.7, 0.7]) {
      b.part(new THREE.BoxGeometry(0.07, 1.0, 0.07), P.metalGrey, { at: [x + 0.6 + s, 0.9, z - 0.4], rotation: [0, 0, 0] });
      b.part(new THREE.BoxGeometry(0.07, 0.9, 0.07), P.metalGrey, { at: [x + 0.6 + s, 0.85, z + 0.2], rotation: [30, 0, 0] });
    }
    box(0.5, 0.1, 0.4, P.snowShade, x + 0.6, 0.43, z + 0.7 + R() * 0.1);
  }
  // cables
  b.sweep([[3.0, 0.45, -3.4], [3.2, 0.45, -2.8], [3.4, 0.5, -2.2], [3.6, 1.3, -2.06]], 0.025, { color: P.ink });
  b.sweep([[4.7, 0.45, -3.4], [4.6, 0.45, -2.7], [4.3, 0.5, -2.2], [4.2, 1.5, -2.06]], 0.025, { color: P.ink });
}
```

<!-- call: mainCabin -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMainCabin({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, { at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  const cyl = (x: number, y: number, z: number, r: number, h: number, c: string, seg = 8, dir: [number, number, number] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], dir });
  const ball = (x: number, y: number, z: number, r: number, c: string) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), c, { at: [x, y, z] });

  const X0 = -5.6, X1 = 0.8, Z0 = -2.0, Z1 = 1.8, FY = 1.0, WY = 3.5;

  // stilts + bracing + drifts
  const sx = [-5.3, -3.2, -1.1, 0.5];
  for (const x of sx)
    for (const z of [-1.7, 1.5]) {
      box(x - 0.14, 0.4, z - 0.14, x + 0.14, FY, z + 0.14, P.cabinDark);
      box(x - 0.45, 0.4, z - 0.35, x + 0.45, 0.62, z + 0.35, P.snowShade);
      box(x - 0.3, 0.4, z - 0.25, x + 0.3, 0.72, z + 0.25, P.snowLit);
    }
  for (let i = 0; i < 3; i++)
    for (const z of [-1.7, 1.5]) {
      const xa = sx[i], xb = sx[i + 1];
      b.part(new THREE.BoxGeometry(0.07, 0.07, Math.hypot(xb - xa, 0.6)), P.cabinDark, {
        at: [(xa + xb) / 2, 0.7, z], dir: [xb - xa, 0.6, 0], axis: "x" as any,
      });
    }
  // floor
  box(X0 - 0.1, 0.85, Z0 - 0.1, X1 + 0.1, FY, Z1 + 0.1, P.cabinDark);

  // walls
  box(X0, FY, Z0, X1, WY, Z1, P.cabinRust);
  for (let x = X0 + 0.4; x < X1; x += 0.5) {
    for (const z of [Z1 + 0.02, Z0 - 0.02]) box(x - 0.02, FY, z - 0.02, x + 0.02, WY, z + 0.02, P.cabinDark);
  }
  for (const x of [X0, X1]) for (const z of [Z0, Z1]) box(x - 0.1, FY, z - 0.1, x + 0.1, WY, z + 0.1, P.trimCream);
  box(X0 - 0.04, 2.2, Z1, X1 + 0.04, 2.28, Z1 + 0.06, P.trimCream);
  box(X0 - 0.04, 2.2, Z0 - 0.06, X1 + 0.04, 2.28, Z0, P.trimCream);

  // windows
  const win = (cx: number, cy: number, w: number, h: number, side: "f" | "b" | "w") => {
    const t = 0.05;
    const mk = (a: number, bb: number, c: number, d: number, e: number, f: number, col: string) => {
      if (side === "w") box(X0 - e, bb, a, X0 + f, d, c, col);
      else {
        const zb = side === "f" ? Z1 : Z0;
        const s = side === "f" ? 1 : -1;
        const z0 = zb + s * e, z1 = zb + s * f;
        box(a, bb, Math.min(z0, z1), c, d, Math.max(z0, z1), col);
      }
    };
    // a,c = horizontal range; bb,d = vertical
    mk(cx - w / 2 - t, cy - h / 2 - t, cx + w / 2 + t, cy + h / 2 + t, 0, 0.05, P.ink);
    mk(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, 0, 0.08, P.windowGlow);
    mk(cx - 0.02, cy - h / 2, cx + 0.02, cy + h / 2, 0, 0.1, P.trimCream);
    mk(cx - w / 2, cy - 0.02, cx + w / 2, cy + 0.02, 0, 0.1, P.trimCream);
    mk(cx - w / 2 - 0.1, cy - h / 2 - 0.1, cx + w / 2 + 0.1, cy - h / 2 - 0.02, 0, 0.12, P.snowLit);
  };
  for (const x of [-4.9, -3.7, -1.1, 0.1 - 0.0]) if (x < 0.1) win(x, 2.3, 0.8, 0.9, "f");
  win(-3.7, 2.3, 0.8, 0.9, "b"); win(-1.5, 2.3, 0.8, 0.9, "b"); win(-4.7, 2.3, 0.8, 0.9, "b");
  win(0, 2.3, 0.9, 0.9, "w");
  // west window uses z range
  box(X0 - 0.05, 1.85, -0.5, X0 + 0.02, 2.75, 0.5, P.ink);
  box(X0 - 0.07, 1.9, -0.45, X0 + 0.02, 2.7, 0.45, P.windowGlow);
  box(X0 - 0.09, 2.27, -0.45, X0, 2.33, 0.45, P.trimCream);

  // front door
  box(-3.05, FY, Z1, -1.75, 3.0, Z1 + 0.06, P.trimCream);
  box(-2.95, FY, Z1 + 0.04, -1.85, 2.92, Z1 + 0.14, P.cabinDark);
  cyl(-2.4, 2.4, Z1 + 0.17, 0.17, 0.05, P.trimCream, 8, [0, 0, 1]);
  cyl(-2.4, 2.4, Z1 + 0.2, 0.12, 0.04, P.windowGlow, 8, [0, 0, 1]);
  ball(-2.15, 1.9, Z1 + 0.2, 0.05, P.trimCream);
  box(-1.62, 2.1, Z1, -1.42, 2.6, Z1 + 0.2, P.ink);
  box(-1.58, 2.15, Z1 + 0.15, -1.46, 2.55, Z1 + 0.22, P.glowOrange);
  // east door
  box(X1, FY, -0.8, X1 + 0.06, 2.8, 0.4, P.trimCream);
  box(X1, FY + 0.05, -0.7, X1 + 0.12, 2.75, 0.3, P.cabinDark);

  // roof: two sloped slabs
  const slope = (side: number) => {
    const ang = Math.atan2(1.4, 2.2);
    const len = Math.hypot(1.4, 2.2) + 0.6;
    const mk = (th: number, y: number, c: string, w: number, ox = 0) => {
      const m = b.part(new THREE.BoxGeometry(7.5 * w, th, len), c, { at: [-2.4 + ox, y, side * 1.1] });
      m.mesh.rotation.x = side * -ang * -1;
      return m;
    };
    return mk;
  };
  for (const s of [1, -1]) {
    const mk = slope(s);
    const cy = 4.2;
    const a = Math.atan2(1.4, 2.2);
    const rot = (m: any) => { m.mesh.rotation.set(s * a, 0, 0); return m; };
    rot(b.part(new THREE.BoxGeometry(7.5, 0.14, 2.8), P.roofDark, { at: [-2.4, cy, s * 1.1] }));
    rot(b.part(new THREE.BoxGeometry(7.5, 0.2, 2.6), P.snowLit, { at: [-2.4, cy + 0.16, s * 1.1] }));
    rot(b.part(new THREE.BoxGeometry(7.5, 0.1, 0.25), P.snowShade, { at: [-2.4, cy - 0.78 + 0.0, s * 2.28] }));
    rot(b.part(new THREE.BoxGeometry(7.5, 0.16, 0.1), P.cabinDark, { at: [-2.4, cy - 0.8, s * 2.34] }));
  }
  box(-6.15, 4.82, -0.1, 1.35, 5.0, 0.1, P.snowLit);
  // gable fills
  for (const x of [X0, X1]) {
    const sh = new THREE.Shape([new THREE.Vector2(Z0, 0), new THREE.Vector2(Z1, 0), new THREE.Vector2(-0.1, 1.4)]);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    b.part(g, P.cabinRust, { at: [x + (x > 0 ? 0.08 : 0), WY, 0] });
  }
  // icicles
  for (let x = -5.8; x < 1.1; x += 0.45)
    b.part(new THREE.ConeGeometry(0.05, 0.1 + R() * 0.25, 5), P.iceBlue, { at: [x, 3.32, 2.2], dir: [0, -1, 0] });

  // chimney
  box(-4.55, 3.0, -1.35, -3.85, 5.9, -0.65, P.rockMid);
  for (let y = 3.4; y < 5.8; y += 0.45) box(-4.58, y, -1.38, -3.82, y + 0.04, -0.62, P.rockDark);
  box(-4.65, 5.9, -1.45, -3.75, 6.05, -0.55, P.rockDark);
  box(-4.55, 6.05, -1.35, -3.85, 6.12, -0.65, P.snowLit);
  const tones = [P.snowShade, P.snowShade, P.snowLit, P.paperWhite];
  tones.forEach((c, i) => ball(-4.2 - 0.0, 6.25 + i * 0.0, -1.0, 0.0, c));
  // keep puffs in box (y<=6.2): small spheres
  tones.forEach((c, i) => ball(-4.2 + 0 * i, 6.0, -1.0 - i * 0.0, 0.0, c));

  // porch
  box(X0 + 0.5, 0.9, Z1, X1 - 0.3, FY + 0.06, 3.4, P.woodLight);
  for (let x = X0 + 0.7; x < X1 - 0.3; x += 0.35) box(x, FY + 0.06, Z1, x + 0.02, FY + 0.075, 3.4, P.cabinDark);
  for (const x of [-5.0, -0.0]) for (const z of [3.3]) box(x - 0.07, FY, z - 0.07, x + 0.07, 3.3, z + 0.07, P.cabinDark);
  for (const x of [-5.0, 0.0]) box(x - 0.07, FY, Z1 + 0.1, x + 0.07, 3.3, Z1 + 0.24, P.cabinDark);
  box(-5.2, 3.3, 1.7, 0.2, 3.45, 3.6, P.roofDark);
  box(-5.25, 3.45, 1.7, 0.25, 3.62, 3.65, P.snowLit);
  box(-5.25, 3.3, 3.55, 0.25, 3.35, 3.65, P.snowShade);
  // railing
  for (let x = -5.0; x <= 0.01; x += 0.5) if (x < -3.1 || x > -1.7) box(x - 0.03, FY, 3.32, x + 0.03, 1.9, 3.38, P.cabinDark);
  box(-5.05, 1.85, 3.3, -3.1, 1.93, 3.4, P.cabinDark);
  box(-1.7, 1.85, 3.3, 0.05, 1.93, 3.4, P.cabinDark);
  // stairs
  for (let i = 0; i < 5; i++) box(-3.0, 0.4 + i * 0.12, 3.4 + (4 - i) * 0.28 - 0.0, -1.8, 0.4 + (i + 1) * 0.12 + 0.0, 3.4 + (5 - i) * 0.28, P.woodLight);
  for (const x of [-3.05, -1.75]) {
    b.part(new THREE.BoxGeometry(0.06, 0.1, 1.5), P.cabinDark, { at: [x, 0.7, 4.1] }).mesh.rotation.x = Math.atan2(0.6, 1.4);
    b.part(new THREE.BoxGeometry(0.05, 0.05, 1.6), P.cabinDark, { at: [x, 1.45, 4.1] }).mesh.rotation.x = Math.atan2(0.6, 1.4);
    box(x - 0.03, 0.4, 4.75, x + 0.03, 1.2, 4.81, P.cabinDark);
  }
  // porch items
  for (let r = 0; r < 3; r++)
    for (let k = 0; k < 3 - (r > 1 ? 1 : 0); k++) {
      const x = -5.1 + k * 0.3 + r * 0.15, y = 1.2 + r * 0.26;
      cyl(x, y, 1.95, 0.13, 0.3, P.woodLight, 6, [0, 0, 1]);
      cyl(x, y, 2.11, 0.1, 0.02, P.trimCream, 6, [0, 0, 1]);
    }
  box(-4.4, 1.0, 2.7, -3.4, 1.18, 3.0, P.cabinDark);
  box(-4.4, 1.18, 2.9, -3.4, 1.5, 3.0, P.cabinDark);
  cyl(-1.0, 1.1, 2.5, 0.22, 0.2, P.cabinDark, 8);
  cyl(-1.0, 1.22, 2.5, 0.12, 0.05, P.woodLight, 8);
  box(-1.4, 1.0, 2.1, -0.8, 1.3, 2.4, P.signalRed);
  box(-1.15, 1.1, 2.4, -1.05, 1.2, 2.42, P.paperWhite);
  // hanging sign
  box(-3.6, 2.9, 3.3, -3.55, 3.3, 3.34, P.cabinDark);
  box(-4.7, 2.75, 3.3, -3.0, 3.25, 3.36, P.cabinDark);
  box(-4.65, 2.8, 3.34, -3.05, 3.2, 3.4, P.trimCream);
  for (let i = 0; i < 6; i++) box(-4.55 + i * 0.25, 3.02, 3.4, -4.4 + i * 0.25, 3.12, 3.43, P.ink);
  for (let i = 0; i < 4; i++) box(-4.5 + i * 0.35, 2.86, 3.4, -4.25 + i * 0.35, 2.93, 3.43, P.ink);

  // roof pieces
  cyl(-1.5, 5.4, 0.35, 0.08, 1.0, P.metalGrey, 6);
  cyl(-1.5, 5.95, 0.35, 0.12, 0.08, P.metalDark, 6);
  box(-0.4, 4.95, -0.35, 0.1, 5.3, 0.1 - 0.0, P.metalGrey);
  box(-0.45, 5.3, -0.4, 0.15, 5.38, 0.15, P.snowLit);
}
```