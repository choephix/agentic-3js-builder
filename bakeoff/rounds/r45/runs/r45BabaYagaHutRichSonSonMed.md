<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A Slavic folk-art diorama of Baba Yaga's carved log izba standing on two giant scaly chicken legs in a clearing, ringed by a bone-and-skull fence with glowing eyes.",
  "builderName": "babaYagaHut",
  "size": [6.0, 4.9, 6.0],
  "layout": "Diorama on a round earth-and-grass plinth (radius 3.0, top at y=0.15). The hut's log cabin (about 2.3 wide, 2.5 long, 1.4 tall) is lifted on two huge chicken legs to a floor height of y=1.6. It faces +Z. From the front, a plank stair with carved bannisters runs from the door down to the ground between the legs. The door is centred on the front wall under a steep gabled roof. The ridge runs front to back, and the front gable carries a carved pediment with a round window. Konyok (carved horse-head) finials cap both ridge ends. A stone chimney with grey smoke stands at the rear right. Two legs stand left and right (x = ±0.85) with knees forward, hocks back, and three forward toes plus one back toe gripping the ground, each toe ending in a dark claw. Feather pantaloons fluff over each thigh just under the floor beams. A ring of bone fence posts topped with skulls with glowing amber eyes circles the clearing at radius 2.4 and is open in a gap at the front (±35 degrees around +Z) for the path. Mushrooms, stepping stones, a birch tree at back left and a mortar and pestle at front left finish the scene. Folk-art style throughout: bold flat colours (red, blue, yellow, green, cream) painted as small parts on warm wood. Carved platbands around windows and door, saw-tooth and scalloped barge boards, sun and rosette motifs, hearts, and zig-zag borders. Every motif is built from small parts in outline (ink), main colour and highlight layers. Shapes stay chunky and blocky, like a puppet made of primitives.",
  "palette": {
    "grass": "#5f7f3a",
    "grassDark": "#3f5a2b",
    "soil": "#5a3d27",
    "stone": "#7d7d78",
    "logLight": "#b9854a",
    "logDark": "#6b4424",
    "logEnd": "#e0b070",
    "ink": "#1d1410",
    "roofWood": "#7a4a2a",
    "roofRed": "#a8392a",
    "carveRed": "#c62d2d",
    "carveBlue": "#2b6fa8",
    "carveYellow": "#f1c232",
    "carveWhite": "#f4ecd8",
    "carveGreen": "#2f8a5b",
    "legYellow": "#e8b23a",
    "legOrange": "#c9801f",
    "claw": "#3a2a1e",
    "featherCream": "#f2e6c8",
    "glow": "#ffc04d",
    "bone": "#e9e1cc",
    "mushRed": "#d23b2f",
    "birch": "#ece8dc",
    "smoke": "#b8b4ae"
  },
  "mounts": {
    "groundTop": [0, 0.15, 0],
    "hutFloor": [0, 1.6, 0],
    "hipL": [0.85, 1.7, 0.05],
    "hipR": [-0.85, 1.7, 0.05],
    "footL": [0.85, 0.15, 0.4],
    "footR": [-0.85, 0.15, 0.4],
    "wallFrontCentre": [0, 2.45, 1.25],
    "doorBase": [0, 1.85, 1.25],
    "windowL": [1.15, 2.5, 0.1],
    "windowR": [-1.15, 2.5, 0.1],
    "eaveLine": [0, 3.2, 0],
    "gableFace": [0, 3.2, 1.3],
    "ridgeFront": [0, 4.45, 1.7],
    "ridgeBack": [0, 4.45, -1.7],
    "chimneyBase": [-0.75, 3.7, -1.0],
    "stairBottom": [0, 0.15, 2.5],
    "fenceGapCentre": [0, 0.15, 2.4]
  },
  "joints": [
    { "name": "hut", "at": [0, 1.7, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "hipL", "parent": "hut", "at": [0.85, 1.7, 0.05], "dir": [0, -0.9, 0.4], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.85, 1.2, 0.5], "dir": [0, -0.9, -0.6], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.85, 0.6, -0.1], "dir": [0, -0.7, 0.7], "role": "leg" },
    { "name": "footL", "parent": "ankleL", "at": [0.85, 0.15, 0.4], "dir": [0, 0, 1], "role": "leg" },
    { "name": "toeInL", "parent": "footL", "at": [0.85, 0.15, 0.4], "dir": [-0.35, 0, 1], "role": "digit", "group": "toesL" },
    { "name": "toeMidL", "parent": "footL", "at": [0.85, 0.15, 0.4], "dir": [0, 0, 1], "role": "digit", "group": "toesL" },
    { "name": "toeOutL", "parent": "footL", "at": [0.85, 0.15, 0.4], "dir": [0.35, 0, 1], "role": "digit", "group": "toesL" },
    { "name": "toeBackL", "parent": "footL", "at": [0.85, 0.15, 0.4], "dir": [0, 0, -1], "role": "digit", "group": "toesL" },
    { "name": "hipR", "parent": "hut", "at": [-0.85, 1.7, 0.05], "dir": [0, -0.9, 0.4], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.85, 1.2, 0.5], "dir": [0, -0.9, -0.6], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.85, 0.6, -0.1], "dir": [0, -0.7, 0.7], "role": "leg" },
    { "name": "footR", "parent": "ankleR", "at": [-0.85, 0.15, 0.4], "dir": [0, 0, 1], "role": "leg" },
    { "name": "toeInR", "parent": "footR", "at": [-0.85, 0.15, 0.4], "dir": [0.35, 0, 1], "role": "digit", "group": "toesR" },
    { "name": "toeMidR", "parent": "footR", "at": [-0.85, 0.15, 0.4], "dir": [0, 0, 1], "role": "digit", "group": "toesR" },
    { "name": "toeOutR", "parent": "footR", "at": [-0.85, 0.15, 0.4], "dir": [-0.35, 0, 1], "role": "digit", "group": "toesR" },
    { "name": "toeBackR", "parent": "footR", "at": [-0.85, 0.15, 0.4], "dir": [0, 0, -1], "role": "digit", "group": "toesR" },
    { "name": "door", "parent": "hut", "at": [0.42, 1.85, 1.3], "dir": [0, 1, 0], "role": "hinge" }
  ],
  "parts": [
    {
      "id": "chickenLegs",
      "builds": "Both giant chicken legs, mirrored left and right, built skeleton-first on the hipL/kneeL/ankleL/footL chains with sweeps. Each leg has a fat feathered thigh (a pantaloon of overlapping cream feather blades, root featherCream with tips legOrange) tucked under the floor beams at y=1.7. Below the knee the drumstick tapers into a scaly legYellow shin whose forward knee and back-pointing hock are clearly separated. A scale pattern of small legOrange plates and ridge rows runs down the metatarsus, with a spur on the back of the hock. A chunky foot pad leads into three forward toes (fanned apart, the inner one angled toward the centre) and one back toe. They are built as sweeps tapering into dark claw cones (claw) and have knuckle bumps and toe-pad ridges in legOrange. The toes rest flat on the ground top (y=0.15) and sink about 0.02. Leg parts ride hipL..toeBackR. Keep the stair gap between the feet clear: inner toes must not go past x=±0.5.",
      "box": [[-1.5, 0.12, -0.7], [1.5, 1.8, 1.1]],
      "attaches": "Hip tops end at hipL and hipR inside the cabin foundation beams (hutFloor). Feet stand on groundTop at footL and footR.",
      "joints": ["hipL", "kneeL", "ankleL", "footL", "toeInL", "toeMidL", "toeOutL", "toeBackL", "hipR", "kneeR", "ankleR", "footR", "toeInR", "toeMidR", "toeOutR", "toeBackR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "logCabin",
      "builds": "The izba body, riding the hut joint. Underneath is a foundation frame at y=1.6..1.85 with cross beams and floorboard edge (logDark), sized x ±1.45, z ±1.5, so the leg hips vanish into it. Above are 7 courses of horizontal round logs (cylinders, alternating logLight and a slightly different logDark-tinted course) forming four walls. The wall surfaces sit at x=±1.15 and z=±1.25, spanning y=1.85..3.2. Corner log ends overlap and protrude to about 0.15 past the walls, with end-grain discs (logEnd) with ink ring lines. Moss-and-tow caulking is shown as thin grassDark strips between some courses. The front wall is a full-width solid wall (the door and windows are applied by the facade part on its surface, so do not cut any openings). The back wall has a plain small hatch of logDark boards and a carved carveRed strip. Add the hut's top plate (a flat logDark board ring at y=3.15..3.2) that the roof sits on. Add small carved details: carveYellow notch marks on the corner ends and a few knot-eyes (ink) on the logs.",
      "box": [[-1.45, 1.6, -1.55], [1.45, 3.2, 1.55]],
      "attaches": "Sits on the legs at hutFloor and hipL/hipR. Its top plate meets the roof at eaveLine. The facade is applied to the front wall at z=1.25 and the side wall surfaces at x=±1.15.",
      "joints": ["hut"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "facade",
      "builds": "Everything applied to the cabin's outside, front and sides. Door: a plank door in logLight and logDark on the door joint, hinge at x=0.42, filling x ±0.42 and y 1.85..2.9. It has an ink outline, iron-style strap hinges (ink), a ring handle, and a carved carveRed and carveYellow sun rosette in its upper half. It sits in a carved platband frame (carveBlue with carveWhite scallops and carveYellow dots), with a pediment hood above bearing a carved heart. A glowing skull lantern (bone skull, glow eyes) hangs above the door. A hand-towel (rushnyk) panel with a carveRed and carveWhite zig-zag pattern hangs beside it. On both side walls, a window with a dark ink pane that glows glow, carveWhite muntins, a carved platband in carveBlue with a carveRed scalloped crown, and two hinged shutters (carveGreen painted with carveYellow flowers). Each side window sits at windowL and windowR. A plank stair rises from the doorBase threshold (a small porch landing at z 1.25..1.55 with carved front edge) down to stairBottom (z 2.5), with 5 treads. Carved bannister posts and rails run on both sides, topped with small konyok-style carved knobs in carveRed and carveYellow. The stair stays within x ±0.5 between the legs. Colours stay bold and flat, with ink outlines under main colours and highlights.",
      "box": [[-1.5, 0.15, 1.2], [1.5, 3.1, 2.6]],
      "attaches": "Front elements are seated on the front wall at z=1.25 (wallFrontCentre, doorBase). The side windows are seated on the side wall surfaces (windowL and windowR, x=±1.15). The stair foot rests on groundTop at stairBottom. The side-window box overflow to x ±1.3 is allowed. Rides the door joint (door) and hut.",
      "joints": ["door", "hut"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "roof",
      "builds": "A steep two-pitch gabled roof with its ridge along Z, from eave y=3.2 to ridge y=4.45, overhanging to x ±1.65 and z ±1.75. Shingle rows are overlapping flat boards (roofRed and roofWood alternating, with a few carveGreen moss patches on the upper faces), each with rounded or scalloped lower edges. A ridge beam (logDark) runs along the top. Konyok horse-head finials (carved logLight plus carveRed mane notches, ink eye) cap both the front end (ridgeFront) and the back end (ridgeBack). The front gable face is a solid board triangle (logLight vertical planks) at gableFace, with a round attic window (ink ring, glow pane, carveYellow sun rays) and a carved folk fringe (zig-zag barge boards in carveRed, carveBlue and carveWhite) along both front rafter edges, plus a hanging pendant at the apex and rosettes at the eaves. The back gable is plainer boards. A stone chimney (stone with logDark cap and a mortar line pattern) rises at chimneyBase to about y=4.7 with three smoke puffs (smoke, stacked faceted spheres, growing and drifting to +X). It reaches at most y=4.9.",
      "box": [[-1.7, 3.15, -1.8], [1.7, 4.9, 1.8]],
      "attaches": "Sits on the top plate of the cabin at eaveLine (y=3.15..3.2). Everything rides the hut joint.",
      "joints": ["hut"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "clearingGround",
      "builds": "The diorama base: a low faceted disc of radius 3.0 (y=0..0.15) with a soil side wall (soil) and a grass top (grass) with a slightly irregular rim, rotated facets and a few grassDark patches. A path of 6 flat stone slabs (stone) leads from stairBottom to the front edge between the fence gap. Add scattered grass tufts (blade clusters in grass and grassDark), a few folk-art flowers (carveRed, carveYellow, carveWhite petals on green stems) and some roots/soil mounds at the base of the legs where the claws grip. Add flat stone rim pebbles around the edge. Keep the ground simple, with a flat top at y=0.15 so the toes and fence posts sit on it. Static, no smooth bending.",
      "box": [[-3.0, 0.0, -3.0], [3.0, 0.45, 3.0]],
      "attaches": "Its top is the shared groundTop (y=0.15). The legs' toes, the stair foot and the fence posts all sit on it.",
      "joints": ["hut"],
      "floor": true,
      "budget": 90
    },
    {
      "id": "fenceAndProps",
      "builds": "The bone fence and the scene props around the hut. A ring of about 18 posts at radius 2.4 around the clearing, skipping the front gap (within ±35 degrees of +Z, where the path goes). Each post is a long bone (bone cylinder shaft with knobbed ends) set slightly sunk into the ground, alternating heights 0.9..1.3, linked by two horizontal rail bones (bone). Every post is topped by a skull (bone, faceted sphere with jaw box, ink eye sockets with glowing glow pupils, nose notch and teeth row) turned to face inward or toward the viewer, with a few ordinary wood stakes between them. Additional props: a cluster of three fly-agaric mushrooms (mushRed caps with carveWhite dots and carveWhite stems) near the front right fence, a large birch tree (birch trunk with ink bark marks, a few branches, and carveGreen/grassDark leaf clumps) at back left around (-2.0, 0, -1.8), height up to 3.9, a stone mortar and a pestle (stone/logDark) at front left around (-1.7, 0.15, 1.2) with a small broom (logDark handle, carveYellow bristles), and a couple of boulders (stone) at the back right. Props keep to the circle of radius 2.9 and avoid the hut, legs and stair.",
      "box": [[-2.95, 0.1, -2.95], [2.95, 3.9, 2.95]],
      "attaches": "All pieces stand on groundTop (y=0.15, sinking slightly). The fence opens on the fenceGapCentre line (z+). Static scenery, so ride hut for the rest pose.",
      "joints": ["hut"],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: clearingGround -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildClearingGround({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const R = rng(11);
  const TOP = 0.15;
  const SOIL2 = "#4a3220";
  const GRASS2 = "#7a9a48";
  const STEM = "#2f8a5b";

  const put = (g: THREE.BufferGeometry, color: string, at: [number, number, number], extra: any = {}) =>
    b.part(g, color, { bone, at, flat: true, ...extra });

  // Plinth: soil base, soil side wall, grass top with irregular rim
  put(new THREE.CylinderGeometry(2.95, 2.85, 0.1, 18), SOIL2, [0, 0.05, 0]);
  put(new THREE.CylinderGeometry(3.0, 2.95, 0.1, 18).rotateY(0.17), P.soil, [0, 0.1, 0]);
  put(new THREE.CylinderGeometry(2.95, 3.0, 0.07, 18).rotateY(0.09), P.grass, [0, TOP - 0.035, 0]);
  // irregular rim lumps
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + R() * 0.2;
    const r = 2.9 + R() * 0.06;
    put(new THREE.CylinderGeometry(0.2 + R() * 0.1, 0.22, 0.07, 6), i % 2 ? P.grassDark : P.grass,
      [Math.sin(a) * r, TOP - 0.035, Math.cos(a) * r], { rotation: [0, R() * 90, 0] });
  }
  // soil strata stripes on the side wall
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    put(new THREE.BoxGeometry(0.4, 0.025, 0.04), SOIL2, [Math.sin(a) * 2.97, 0.06 + (i % 2) * 0.05, Math.cos(a) * 2.97], { rotation: [0, a * 180 / Math.PI, 0] });
  }
  // grassDark patches
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.8 + R() * 1.9;
    const s = 0.25 + R() * 0.25;
    put(new THREE.CylinderGeometry(s, s, 0.01, 7), i % 2 ? P.grassDark : GRASS2,
      [Math.sin(a) * r, TOP + 0.003, Math.cos(a) * r], { rotation: [0, R() * 90, 0] });
  }

  // Stone path: 6 slabs from stair bottom to front edge
  const z0 = M.stairBottom[2] + 0.1;
  for (let i = 0; i < 6; i++) {
    const z = z0 + i * 0.1;
    const zz = 2.55 + i * 0.07;
    const x = Math.sin(i * 1.3) * 0.12;
    const w = 0.55 - i * 0.02;
    put(new THREE.BoxGeometry(w + 0.04, 0.03, 0.14), P.ink, [x, TOP + 0.005, zz + 0.0 * z], { rotation: [0, (i % 2 ? 6 : -6), 0] });
    put(new THREE.BoxGeometry(w, 0.04, 0.12), i % 2 ? P.stone : "#8d8d86", [x, TOP + 0.015, zz], { rotation: [0, (i % 2 ? 6 : -6), 0] });
  }

  // Grass tufts
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.7 + R() * 2.1;
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (Math.abs(x) < 0.7 && z > 1.2) continue;
    if (Math.hypot(x, z - 0.4) < 0.6 && Math.abs(Math.abs(x) - 0.85) < 0.4) continue;
    for (let k = 0; k < 3; k++) {
      put(new THREE.ConeGeometry(0.025, 0.14 + R() * 0.06, 4), k % 2 ? P.grassDark : GRASS2,
        [x + (k - 1) * 0.03, TOP + 0.06, z + (R() - 0.5) * 0.04], { rotation: [(R() - 0.5) * 30, 0, (k - 1) * 22] });
    }
  }

  // Folk flowers
  const flowerSpots: [number, number, string][] = [
    [1.5, 1.6, P.carveRed], [-1.0, 2.0, P.carveYellow], [2.0, 0.2, P.carveWhite],
    [-2.1, 0.3, P.carveRed], [1.3, -1.8, P.carveYellow], [-0.4, -2.2, P.carveWhite],
  ];
  for (const [x, z, c] of flowerSpots) {
    const h = 0.2 + R() * 0.08;
    put(new THREE.CylinderGeometry(0.008, 0.01, h, 5), STEM, [x, TOP + h / 2, z]);
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 6), P.ink, [x, TOP + h + 0.005, z], { rotation: [80, 0, 0] });
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      put(new THREE.SphereGeometry(0.03, 5, 4), c, [x + Math.sin(a) * 0.04, TOP + h + 0.02 + Math.cos(a) * 0.04, z + 0.012], { scale: [1, 1, 0.5] });
    }
    put(new THREE.SphereGeometry(0.022, 5, 4), c === P.carveYellow ? P.carveRed : P.carveYellow, [x, TOP + h + 0.02, z + 0.03]);
    put(new THREE.BoxGeometry(0.06, 0.012, 0.03), STEM, [x + 0.04, TOP + h * 0.4, z], { rotation: [0, 0, 30] });
  }

  // Roots / soil mounds at the claws
  for (const s of [1, -1]) {
    const fx = s * 0.85, fz = 0.4;
    put(new THREE.SphereGeometry(0.2, 7, 4), P.soil, [fx, TOP, fz - 0.28], { scale: [1.2, 0.35, 1] });
    put(new THREE.SphereGeometry(0.15, 6, 4), SOIL2, [fx + s * 0.2, TOP, fz + 0.05], { scale: [1, 0.3, 1.2] });
    put(new THREE.SphereGeometry(0.15, 6, 4), SOIL2, [fx - s * 0.2, TOP, fz + 0.15], { scale: [1, 0.3, 1.2] });
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.5;
      put(new THREE.CylinderGeometry(0.018, 0.03, 0.4, 5), P.logDark,
        [fx + Math.sin(a) * 0.2 - s * 0.05, TOP + 0.02, fz - 0.4 + Math.cos(a) * 0.1],
        { rotation: [90, 0, a * 90] });
    }
  }

  // Rim pebbles
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + R() * 0.15;
    if (Math.abs(a - 0) < 0.4 || Math.abs(a - Math.PI * 2) < 0.4) continue;
    const r = 2.78 + R() * 0.1;
    const s = 0.07 + R() * 0.06;
    put(new THREE.SphereGeometry(s, 5, 4), i % 3 ? P.stone : "#9a9a92",
      [Math.sin(a) * r, TOP + s * 0.15, Math.cos(a) * r], { scale: [1.3, 0.55, 1], rotation: [0, R() * 180, 0] });
  }
}
```

<!-- call: logCabin -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLogCabin({ b, J, P, M }: Ctx) {
  const hut = J.hut;
  const R = rng(11);
  const cyl = (r: number, len: number, seg = 8) => new THREE.CylinderGeometry(r, r, len, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const put = (g: THREE.BufferGeometry, color: string, at: number[], opt: any = {}) =>
    b.part(g, color, { bone: hut, at, flat: true, ...opt });

  // Foundation frame y 1.6..1.85
  const FY = 1.725;
  for (const s of [1, -1]) {
    put(box(0.2, 0.25, 3.0), P.logDark, [s * 1.35, FY, 0]);
    put(box(2.9, 0.25, 0.2), P.logDark, [0, FY, s * 1.4]);
  }
  for (const z of [-0.8, -0.27, 0.27, 0.8]) put(box(2.6, 0.16, 0.14), P.logDark, [0, FY - 0.03, z]);
  for (const x of [-0.85, 0.85]) put(box(0.18, 0.16, 2.8), P.logDark, [x, FY - 0.04, 0]);
  // floorboard edge
  put(box(2.5, 0.05, 2.7), P.logLight, [0, 1.855, 0]);
  put(box(2.9, 0.04, 0.05), P.ink, [0, 1.71, 1.505]);
  put(box(2.9, 0.04, 0.05), P.ink, [0, 1.71, -1.505]);
  // beam end discs on front
  for (const x of [-1.2, -0.4, 0.4, 1.2]) {
    put(cyl(0.07, 0.04, 8), P.logEnd, [x, FY, 1.51], { dir: [0, 0, 1], axis: "y" });
  }

  // Log courses
  const courses = 7;
  const y0 = 1.85, y1 = 3.15;
  const h = (y1 - y0) / courses;
  const rad = h / 2 + 0.005;
  for (let i = 0; i < courses; i++) {
    const y = y0 + h * (i + 0.5);
    const col = i % 2 ? P.logDark : P.logLight;
    const tint = i % 2 ? "#8a5a30" : P.logLight;
    const colZ = i % 2 ? tint : col;
    const off = i % 2 ? 0.1 : 0;
    // front/back (along X): wall z=±1.25
    for (const s of [1, -1]) {
      put(cyl(rad, 2.75 + 0.3, 8), colZ, [0, y, s * 1.25], { dir: [1, 0, 0] });
      // side walls (along Z) at x=±1.15
      put(cyl(rad, 2.5 + 0.3 - off, 8), colZ === P.logLight ? "#a87642" : "#7a4e2a", [s * 1.15, y, 0], { dir: [0, 0, 1] });
    }
    // caulking
    if (i < courses - 1 && i % 2 === 0) {
      const yc = y + h / 2;
      for (const s of [1, -1]) {
        put(box(2.3, 0.02, 0.03), P.grassDark, [0, yc, s * 1.255]);
        put(box(0.03, 0.02, 2.5), P.grassDark, [s * 1.155, yc, 0]);
      }
    }
    // end grain discs & rings at corners
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        // front/back log end protruding in X
        const ex = sx * (1.4 + 0.07 + 0.0);
        put(cyl(rad * 0.97, 0.02, 8), P.logEnd, [sx * 1.545, y, sz * 1.25], { dir: [1, 0, 0] });
        put(cyl(rad * 0.55, 0.025, 8), P.ink, [sx * 1.548, y, sz * 1.25], { dir: [1, 0, 0] });
        put(cyl(rad * 0.4, 0.03, 8), P.logEnd, [sx * 1.552, y, sz * 1.25], { dir: [1, 0, 0] });
        // side log end protruding in Z
        put(cyl(rad * 0.97, 0.02, 8), P.logEnd, [sx * 1.15, y, sz * 1.435 + sz * 0.06], { dir: [0, 0, 1] });
        put(cyl(rad * 0.55, 0.025, 8), P.ink, [sx * 1.15, y, sz * 1.5], { dir: [0, 0, 1] });
        put(cyl(rad * 0.4, 0.03, 8), P.logEnd, [sx * 1.15, y, sz * 1.505], { dir: [0, 0, 1] });
        if (i % 2 === 0) {
          put(box(0.03, 0.05, 0.05), P.carveYellow, [sx * 1.556, y, sz * 1.25 + 0.0]);
          put(box(0.05, 0.05, 0.03), P.carveYellow, [sx * 1.15, y, sz * 1.512]);
        }
      }
  }

  // Wall fill so there are no gaps behind logs
  put(box(2.3, 1.3, 0.2), "#5a3a1e", [0, 2.5, 1.15]);
  put(box(2.3, 1.3, 0.2), "#5a3a1e", [0, 2.5, -1.15]);
  put(box(0.2, 1.3, 2.4), "#5a3a1e", [1.05, 2.5, 0]);
  put(box(0.2, 1.3, 2.4), "#5a3a1e", [-1.05, 2.5, 0]);

  // Knot eyes
  const knots: number[][] = [
    [0.7, 2.25, 1.3], [-0.8, 2.95, 1.3], [0.9, 2.6, -1.3], [-0.5, 2.1, -1.3],
    [1.2, 2.4, 0.7], [1.2, 2.8, -0.6], [-1.2, 2.3, -0.8], [-1.2, 2.7, 0.6],
  ];
  for (const k of knots) {
    const nx = Math.abs(k[0]) > 1.1 ? Math.sign(k[0]) : 0;
    const nz = nx ? 0 : Math.sign(k[2]);
    const g = new THREE.SphereGeometry(0.035, 6, 4);
    put(g, P.ink, k, { scale: [nx ? 0.4 : 1, 1.2, nz ? 0.4 : 1] });
  }

  // Back wall hatch and carved strip
  const bz = -1.31;
  put(box(0.62, 0.62, 0.05), P.ink, [0, 2.4, bz - 0.0]);
  for (let i = 0; i < 4; i++) put(box(0.13, 0.54, 0.04), i % 2 ? "#4a2e18" : P.logDark, [-0.22 + i * 0.148, 2.4, bz - 0.03]);
  put(box(0.5, 0.04, 0.04), P.ink, [0, 2.4, bz - 0.06]);
  put(box(0.1, 0.06, 0.05), P.ink, [0.2, 2.4, bz - 0.07]);
  put(box(1.6, 0.14, 0.04), P.ink, [0, 2.95, bz - 0.0]);
  put(box(1.55, 0.1, 0.05), P.carveRed, [0, 2.95, bz - 0.02]);
  for (let i = 0; i < 7; i++) put(box(0.07, 0.06, 0.055), P.carveYellow, [-0.66 + i * 0.22, 2.95, bz - 0.05]);
  put(box(1.55, 0.04, 0.05), P.carveWhite, [0, 2.88, bz - 0.03]);

  // Top plate ring y 3.15..3.2
  for (const s of [1, -1]) {
    put(box(2.7, 0.05, 0.25), P.logDark, [0, 3.175, s * 1.25]);
    put(box(0.25, 0.05, 2.6), P.logDark, [s * 1.15, 3.175, 0]);
    put(box(2.7, 0.012, 0.03), P.ink, [0, 3.152, s * 1.38]);
    put(box(0.03, 0.012, 2.6), P.ink, [s * 1.28, 3.152, 0]);
  }
  // plate end studs
  for (let i = 0; i < 6; i++) {
    const x = -1.1 + i * 0.44;
    put(box(0.1, 0.04, 0.03), P.logEnd, [x, 3.178, 1.385]);
    put(box(0.1, 0.04, 0.03), P.logEnd, [x, 3.178, -1.385]);
  }
  void R; void frame; void M;
}
```

<!-- call: chickenLegs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildChickenLegs({ b, J, P }: any) {
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerp3 = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    const hipJ = J["hip" + side], kneeJ = J["knee" + side], ankJ = J["ankle" + side], footJ = J["foot" + side];
    const H = V(0.85 * s, 1.7, 0.05);
    const K = V(0.85 * s, 1.2, 0.5);
    const A = V(0.85 * s, 0.6, -0.1);
    const F = V(0.85 * s, 0.15, 0.4);

    // Thigh and hip
    b.part(new THREE.SphereGeometry(0.22, 8, 6), P.featherCream, { at: H, bone: hipJ });
    b.capsule(H, K, [0.2, 0.13], P.legYellow, { bone: hipJ });

    // Feather pantaloon: two rings of overlapping cream blades with orange tips
    const d = K.clone().sub(H).normalize();
    const u = new THREE.Vector3().crossVectors(d, V(1, 0, 0)).normalize();
    const v = new THREE.Vector3().crossVectors(d, u).normalize();
    [0.12, 0.42].forEach((t, row) => {
      const n = 7;
      const r = 0.2 - 0.06 * t / 0.5;
      for (let i = 0; i < n; i++) {
        const a = ((i + row * 0.5) / n) * Math.PI * 2;
        const radial = u.clone().multiplyScalar(Math.cos(a)).add(v.clone().multiplyScalar(Math.sin(a)));
        const base = lerp3(H, K, t).add(radial.clone().multiplyScalar(r));
        const dir = d.clone().add(radial.clone().multiplyScalar(0.35 + rand() * 0.1)).normalize();
        const len = 0.36 - row * 0.03;
        b.spike(base, dir, len, 0.075, { color: P.featherCream, bone: hipJ });
        b.spike(base.clone().addScaledVector(dir, len * 0.55), dir, len * 0.5, 0.045, { color: P.legOrange, bone: hipJ });
      }
    });

    // Knee and shin
    b.part(new THREE.SphereGeometry(0.14, 8, 6), P.legOrange, { at: K, bone: kneeJ });
    b.rod(K, A, [0.11, 0.07], P.legYellow, { bone: kneeJ });
    // Hock, spur
    b.part(new THREE.SphereGeometry(0.095, 8, 6), P.legOrange, { at: A, bone: ankJ });
    b.spike(A.clone().add(V(0, 0.02, -0.05)), [0, -0.35, -1], 0.2, 0.05, { color: P.claw, bone: ankJ });
    // Metatarsus
    b.rod(A, F, [0.07, 0.065], P.legYellow, { bone: ankJ });

    // Scale rings (shin + metatarsus)
    const sAx = A.clone().sub(K).normalize();
    [0.3, 0.55, 0.8].forEach((t) => {
      b.part(new THREE.CylinderGeometry(0.1 - 0.03 * t, 0.1 - 0.03 * t, 0.025, 8), P.legOrange, {
        at: lerp3(K, A, t), dir: sAx.toArray(), bone: kneeJ,
      });
    });
    const mAx = F.clone().sub(A).normalize();
    [0.15, 0.35, 0.55, 0.75].forEach((t) => {
      b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.03, 8), P.legOrange, {
        at: lerp3(A, F, t), dir: mAx.toArray(), bone: ankJ,
      });
      // front scale plate
      const c = lerp3(A, F, t);
      b.part(new THREE.BoxGeometry(0.07, 0.03, 0.045), P.legOrange, {
        at: c.clone().add(V(0, 0.05, 0.06)), dir: mAx.toArray(), bone: ankJ,
      });
    });

    // Foot pad
    b.part(new THREE.SphereGeometry(0.13, 8, 6), P.legYellow, { at: V(F.x, 0.22, F.z), scale: [1.1, 0.6, 1.2], bone: footJ });

    // Toes
    const toes: [string, THREE.Vector3, number][] = [
      ["toeIn" + side, V(-0.35 * s, 0, 1).normalize(), 0.5],
      ["toeMid" + side, V(0, 0, 1), 0.56],
      ["toeOut" + side, V(0.35 * s, 0, 1).normalize(), 0.5],
      ["toeBack" + side, V(0, 0, -1), 0.34],
    ];
    for (const [name, dir, len] of toes) {
      const bone = J[name];
      const st = V(F.x, 0.2, F.z);
      const en = st.clone().addScaledVector(dir, len);
      en.y = 0.18;
      b.rod(st, en, [0.062, 0.045], P.legYellow, { bone });
      // knuckle bump and toe-pad ridge
      b.part(new THREE.SphereGeometry(0.062, 7, 5), P.legOrange, { at: lerp3(st, en, 0.45).add(V(0, 0.03, 0)), bone });
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 7), P.legOrange, {
        at: lerp3(st, en, 0.78).add(V(0, 0.01, 0)), dir: dir.toArray(), bone,
      });
      // claw
      b.spike(en.clone().addScaledVector(dir, -0.02), dir.clone().add(V(0, -0.15, 0)).normalize().toArray(), 0.17, 0.045, {
        color: P.claw, bone,
      });
    }
  }
}
```

<!-- call: fenceAndProps -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFenceAndProps({ b, J, P }: any) {
  const G = 0.15;
  const R = rng(11);
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const Y = new THREE.Vector3(0, 1, 0);

  // Place a geometry in model space (optionally under a base matrix) and file it by colour.
  const add = (
    col: string,
    geo: THREE.BufferGeometry,
    p: number[],
    rot: number[] = [0, 0, 0],
    s: number[] = [1, 1, 1],
    base?: THREE.Matrix4,
  ) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
    let m = new THREE.Matrix4().compose(new THREE.Vector3(p[0], p[1], p[2]), q, new THREE.Vector3(s[0], s[1], s[2]));
    if (base) m = base.clone().multiply(m);
    const g = geo.clone();
    g.applyMatrix4(m);
    if (!buckets.has(col)) buckets.set(col, []);
    buckets.get(col)!.push(g);
  };
  // A cylinder from point a to point b.
  const rod = (col: string, a: THREE.Vector3, c: THREE.Vector3, r: number, seg = 6, base?: THREE.Matrix4) => {
    const d = c.clone().sub(a);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize());
    const e = new THREE.Euler().setFromQuaternion(q);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    add(col, new THREE.CylinderGeometry(r, r, len, seg), [mid.x, mid.y, mid.z], [e.x, e.y, e.z], [1, 1, 1], base);
  };
  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);

  // ---- Skull ----
  const skull = (top: THREE.Vector3, faceAngle: number) => {
    const base = new THREE.Matrix4().compose(
      top,
      new THREE.Quaternion().setFromAxisAngle(Y, faceAngle),
      new THREE.Vector3(1, 1, 1),
    );
    add(P.bone, sph(0.13, 8, 6), [0, 0.16, 0], [0, 0, 0], [1.0, 0.95, 1.05], base);
    add(P.bone, new THREE.BoxGeometry(0.15, 0.07, 0.13), [0, 0.05, 0.05], [0, 0, 0], [1, 1, 1], base);
    // cheekbones
    for (const s of [1, -1]) add(P.bone, sph(0.04, 5, 4), [s * 0.085, 0.1, 0.09], [0, 0, 0], [1, 1, 1], base);
    // eye sockets and glowing pupils
    for (const s of [1, -1]) {
      add(P.ink, sph(0.045, 6, 4), [s * 0.055, 0.17, 0.105], [0, 0, 0], [1, 1.1, 0.7], base);
      add(P.glow, sph(0.024, 5, 4), [s * 0.055, 0.17, 0.125], [0, 0, 0], [1, 1, 1], base);
    }
    // nose notch
    add(P.ink, new THREE.ConeGeometry(0.02, 0.05, 3), [0, 0.11, 0.13], [Math.PI, 0, 0], [1, 1, 0.6], base);
    // teeth row slits
    for (let i = -2; i <= 2; i++) add(P.ink, new THREE.BoxGeometry(0.008, 0.045, 0.01), [i * 0.028, 0.055, 0.118], [0, 0, 0], [1, 1, 1], base);
    add(P.ink, new THREE.BoxGeometry(0.15, 0.008, 0.01), [0, 0.07, 0.118], [0, 0, 0], [1, 1, 1], base);
  };

  // ---- Fence ----
  const RAD = 2.4;
  const posts: { a: number; p: THREE.Vector3; h: number }[] = [];
  for (let k = 0; k < 18; k++) {
    const deg = k * 20;
    const sd = deg > 180 ? deg - 360 : deg;
    if (Math.abs(sd) < 35) continue;
    const a = (deg * Math.PI) / 180;
    const h = k % 2 ? 0.9 : 1.3;
    posts.push({ a, h, p: new THREE.Vector3(Math.sin(a) * RAD, G, Math.cos(a) * RAD) });
  }
  for (const { a, p, h } of posts) {
    const topY = G + h;
    add(P.bone, new THREE.CylinderGeometry(0.04, 0.05, h + 0.04, 6), [p.x, G + h / 2 - 0.02, p.z]);
    add(P.bone, sph(0.065, 6, 4), [p.x, G + 0.01, p.z]);
    add(P.bone, sph(0.06, 6, 4), [p.x, topY - 0.01, p.z]);
    add(P.bone, sph(0.045, 5, 4), [p.x + 0.04, topY - 0.02, p.z], [0, 0, 0], [1, 1, 1]);
    skull(new THREE.Vector3(p.x, topY, p.z), a + Math.PI);
  }
  // rails between consecutive posts
  for (let i = 0; i < posts.length - 1; i++) {
    const A = posts[i], B = posts[i + 1];
    if (Math.abs(B.a - A.a) > 0.4) continue;
    for (const y of [0.4, 0.78]) {
      rod(P.bone, new THREE.Vector3(A.p.x, G + y, A.p.z), new THREE.Vector3(B.p.x, G + y, B.p.z), 0.028, 5);
    }
  }
  // wood stakes between posts
  for (const deg of [50, 110, 170, 230, 290, 150]) {
    const a = (deg * Math.PI) / 180;
    const x = Math.sin(a) * RAD, z = Math.cos(a) * RAD;
    const h = 0.6 + R() * 0.25;
    add(P.logDark, new THREE.CylinderGeometry(0.035, 0.045, h, 5), [x, G + h / 2 - 0.02, z]);
    add(P.logDark, new THREE.ConeGeometry(0.036, 0.12, 5), [x, G + h + 0.04, z]);
    add(P.logLight, new THREE.BoxGeometry(0.1, 0.012, 0.012), [x, G + h * 0.5, z], [0, a, 0]);
  }

  // ---- Mushrooms (front, near fence) ----
  const mush = (x: number, z: number, h: number, r: number) => {
    add(P.carveWhite, new THREE.CylinderGeometry(r * 0.28, r * 0.38, h, 6), [x, G + h / 2 - 0.01, z]);
    add(P.carveWhite, new THREE.CylinderGeometry(r * 0.42, r * 0.3, h * 0.08, 6), [x, G + h * 0.62, z]);
    add(P.mushRed, new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), [x, G + h - 0.02, z], [0, 0, 0], [1, 0.75, 1]);
    for (let i = 0; i < 6; i++) {
      const th = 0.35 + (i % 3) * 0.35, ph = i * 1.1 + x;
      add(P.carveWhite, sph(r * 0.13, 5, 3), [x + Math.sin(th) * Math.cos(ph) * r * 0.97, G + h - 0.02 + Math.cos(th) * r * 0.75, z + Math.sin(th) * Math.sin(ph) * r * 0.97], [0, 0, 0], [1, 0.6, 1]);
    }
  };
  mush(-1.35, 1.7, 0.2, 0.15);
  mush(-1.6, 1.5, 0.3, 0.2);
  mush(-1.2, 1.45, 0.14, 0.1);

  // ---- Birch tree ----
  const bx = -2.0, bz = -1.8;
  add(P.birch, new THREE.CylinderGeometry(0.09, 0.15, 3.7, 7), [bx, G + 1.85 - 0.02, bz]);
  add(P.birch, new THREE.CylinderGeometry(0.15, 0.2, 0.2, 7), [bx, G + 0.06, bz]);
  for (let i = 0; i < 12; i++) {
    const y = 0.3 + i * 0.28, a = i * 2.4;
    const rr = 0.15 - (y / 3.7) * 0.06;
    add(P.ink, new THREE.BoxGeometry(0.1 + (i % 3) * 0.04, 0.04, 0.03), [bx + Math.sin(a) * rr, G + y, bz + Math.cos(a) * rr], [0, a, 0]);
  }
  const branches: [number, number, number, number][] = [[0.8, 0.7, 2.6, 0.8], [-0.7, 0.4, 2.9, 1.5], [0.3, -0.8, 3.2, 2.2], [-0.4, 0.6, 3.4, 3.1]];
  for (const [dx, dz, y, ph] of branches) {
    const a = new THREE.Vector3(bx, G + y, bz);
    const c = new THREE.Vector3(bx + dx * 0.9, G + y + 0.45, bz + dz * 0.9);
    rod(P.birch, a, c, 0.04, 5);
    add(P.ink, new THREE.BoxGeometry(0.05, 0.02, 0.02), [bx + dx * 0.4, G + y + 0.2, bz + dz * 0.4], [0, ph, 0.5]);
    const col = ph > 1.8 ? P.grassDark : P.carveGreen;
    add(col, new THREE.IcosahedronGeometry(0.4, 0), [c.x, c.y + 0.12, c.z], [ph, ph, 0], [1.1, 0.8, 1.1]);
  }
  add(P.carveGreen, new THREE.IcosahedronGeometry(0.55, 0), [bx, G + 3.5, bz], [0.3, 0.5, 0], [1.1, 0.8, 1.1]);
  add(P.grassDark, new THREE.IcosahedronGeometry(0.42, 0), [bx + 0.35, G + 3.2, bz - 0.2], [1, 0.2, 0]);
  add(P.carveGreen, new THREE.IcosahedronGeometry(0.35, 0), [bx - 0.4, G + 3.3, bz + 0.25], [0.4, 1, 0]);

  // ---- Mortar, pestle, broom ----
  const mx = -1.7, mz = 1.2;
  add(P.stone, new THREE.CylinderGeometry(0.22, 0.15, 0.26, 8), [mx, G + 0.12, mz]);
  add(P.stone, new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8), [mx, G + 0.01, mz]);
  add(P.stone, new THREE.CylinderGeometry(0.255, 0.23, 0.05, 8), [mx, G + 0.27, mz]);
  add(P.ink, new THREE.CylinderGeometry(0.17, 0.17, 0.02, 8), [mx, G + 0.292, mz]);
  add(P.stone, new THREE.BoxGeometry(0.05, 0.05, 0.03), [mx + 0.0, G + 0.16, mz + 0.22], [0.3, 0, 0]);
  rod(P.logDark, new THREE.Vector3(mx - 0.02, G + 0.2, mz), new THREE.Vector3(mx + 0.25, G + 0.78, mz + 0.1), 0.045, 6);
  add(P.logDark, sph(0.07, 6, 4), [mx + 0.25, G + 0.8, mz + 0.1]);
  add(P.carveRed, new THREE.CylinderGeometry(0.052, 0.052, 0.03, 6), [mx + 0.2, G + 0.69, mz + 0.08], [0.2, 0, -0.45]);
  // broom
  const bs = new THREE.Vector3(-1.2, G + 0.05, 0.85), be = new THREE.Vector3(-0.85, G + 0.75, 1.15);
  rod(P.logDark, bs, be, 0.022, 5);
  add(P.carveYellow, new THREE.ConeGeometry(0.1, 0.32, 7), [-1.28, G + 0.1, 0.8], [0.1, 0, 0.3], [1, 1, 1]);
  add(P.carveRed, new THREE.CylinderGeometry(0.06, 0.05, 0.04, 6), [-1.22, G + 0.24, 0.84], [0.1, 0, 0.3]);
  add(P.carveYellow, new THREE.ConeGeometry(0.03, 0.12, 5), [-1.0, G + 0.35, 1.0]);

  // ---- Boulders back right ----
  add(P.stone, new THREE.IcosahedronGeometry(0.42, 0), [1.7, G + 0.17, -1.7], [0.3, 0.8, 0.1], [1.2, 0.8, 1]);
  add(P.stone, new THREE.IcosahedronGeometry(0.28, 0), [2.1, G + 0.1, -1.2], [0.5, 0.2, 0.4], [1, 0.75, 1.1]);
  add(P.grassDark, new THREE.IcosahedronGeometry(0.2, 0), [1.65, G + 0.34, -1.7], [0, 0.3, 0], [1, 0.4, 1]);
  add(P.stone, new THREE.IcosahedronGeometry(0.2, 0), [1.35, G + 0.06, -2.05], [0.2, 0.3, 0.4]);

  // ---- Emit one part per colour ----
  for (const [col, geos] of buckets) {
    const merged = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
    if (!merged) continue;
    const part = b.part(merged, col, { bone: J.hut, at: [0, 0, 0], flat: true, name: "fenceProps" + col });
    if (col === P.glow) glow(part, 1.6);
  }
}
```

<!-- call: facade -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFacade({ b, J, P }: Ctx) {
  const hut = J.hut;
  const door = J.door;

  type Rot = [number, number, number];
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, bone = hut, rot?: Rot) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, rot ? { bone, at: [x, y, z], rotation: rot } : { bone, at: [x, y, z] });
  // disc facing +Z
  const discZ = (r: number, h: number, color: string, x: number, y: number, z: number, bone = hut, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: [x, y, z], rotation: [90, 0, 0] });
  // disc facing X
  const discX = (r: number, h: number, color: string, x: number, y: number, z: number, bone = hut, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: [x, y, z], rotation: [0, 0, 90] });
  const sph = (r: number, color: string, x: number, y: number, z: number, bone = hut, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { bone, at: [x, y, z] });

  // ---------------- DOOR (rides the door joint) ----------------
  box(0.92, 1.12, 0.02, P.ink, 0, 2.375, 1.265, door);
  const plankX = [-0.315, -0.105, 0.105, 0.315];
  plankX.forEach((x, i) => {
    box(0.2, 1.05, 0.06, i % 2 ? P.logDark : P.logLight, x, 2.375, 1.29, door);
  });
  // plank seams
  for (const x of [-0.21, 0, 0.21]) box(0.012, 1.05, 0.01, P.ink, x, 2.375, 1.322, door);
  // cross battens
  box(0.84, 0.07, 0.02, P.logDark, 0, 1.98, 1.33, door);
  box(0.84, 0.07, 0.02, P.logDark, 0, 2.8, 1.33, door);
  // strap hinges
  for (const y of [2.1, 2.72]) {
    box(0.52, 0.05, 0.015, P.ink, 0.17, y, 1.348, door);
    discZ(0.045, 0.016, P.ink, 0.42 - 0.01, y, 1.348, door, 8);
    sph(0.014, P.carveYellow, 0.4, y, 1.358, door, 5);
    sph(0.014, P.carveYellow, -0.05, y, 1.358, door, 5);
  }
  // ring handle
  discZ(0.055, 0.012, P.carveYellow, -0.3, 2.33, 1.325, door, 10);
  b.part(new THREE.TorusGeometry(0.045, 0.01, 5, 12), P.ink, { bone: door, at: [-0.3, 2.31, 1.345] });
  // sun rosette
  const cx = 0, cy = 2.58, cz = 1.325;
  discZ(0.215, 0.012, P.ink, cx, cy, cz, door, 14);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 360;
    const rad = (a * Math.PI) / 180;
    box(0.045, 0.09, 0.014, i % 2 ? P.carveRed : P.carveYellow, Math.sin(rad) * 0.2, cy + Math.cos(rad) * 0.2, cz + 0.004, door, [0, 0, -a]);
  }
  discZ(0.15, 0.014, P.carveYellow, cx, cy, cz + 0.006, door, 14);
  discZ(0.11, 0.014, P.carveRed, cx, cy, cz + 0.012, door, 12);
  discZ(0.06, 0.014, P.carveYellow, cx, cy, cz + 0.018, door, 10);
  discZ(0.025, 0.014, P.ink, cx, cy, cz + 0.024, door, 8);

  // ---------------- DOOR PLATBAND ----------------
  for (const s of [1, -1]) {
    box(0.12, 1.15, 0.05, P.carveBlue, s * 0.52, 2.43, 1.275);
    for (let i = 0; i < 6; i++) {
      const y = 1.98 + i * 0.16;
      sph(0.036, P.carveWhite, s * 0.52, y, 1.305, hut, 6);
      if (i < 5) sph(0.018, P.carveYellow, s * 0.52, y + 0.08, 1.305, hut, 5);
    }
  }
  box(1.28, 0.1, 0.05, P.carveBlue, 0, 2.93, 1.275);
  for (let i = -5; i <= 5; i++) sph(0.03, i % 2 ? P.carveYellow : P.carveWhite, i * 0.11, 2.93, 1.305, hut, 6);
  // pediment hood
  b.extrude(
    [[-0.72, 0], [0.72, 0], [0, 0.14, "sharp"]],
    { at: [0, 2.98, 1.3], x: [1, 0, 0], thickness: 0.07, color: P.carveBlue, bone: hut },
  );
  b.extrude(
    [[-0.5, 0], [0.5, 0], [0, 0.09, "sharp"]],
    { at: [0, 2.995, 1.3], x: [1, 0, 0], thickness: 0.09, color: P.carveWhite, bone: hut },
  );
  // carved heart
  sph(0.022, P.carveRed, -0.018, 3.045, 1.348, hut, 6);
  sph(0.022, P.carveRed, 0.018, 3.045, 1.348, hut, 6);
  b.part(new THREE.ConeGeometry(0.036, 0.05, 6), P.carveRed, { bone: hut, at: [0, 3.02, 1.348], rotation: [0, 0, 180] });

  // ---------------- SKULL LANTERN ----------------
  b.rod([0, 3.1, 1.3], [0, 3.1, 1.56], 0.015, P.ink, { bone: hut });
  b.rod([0, 3.1, 1.56], [0, 2.98, 1.56], 0.008, P.ink, { bone: hut });
  const skull = b.part(new THREE.SphereGeometry(0.075, 8, 6), P.bone, { bone: hut, at: [0, 2.9, 1.56] });
  void skull;
  box(0.09, 0.04, 0.07, P.bone, 0, 2.835, 1.585);
  for (const s of [1, -1]) {
    glow(sph(0.02, P.glow, s * 0.032, 2.915, 1.625, hut, 6), 1.5);
    sph(0.027, P.ink, s * 0.032, 2.915, 1.62, hut, 6);
  }
  box(0.014, 0.025, 0.01, P.ink, 0, 2.88, 1.632);
  for (let i = -2; i <= 2; i++) box(0.012, 0.016, 0.01, P.carveWhite, i * 0.018, 2.82, 1.622);

  // ---------------- RUSHNYK TOWEL ----------------
  const tx = 0.88;
  discX(0.014, 0.34, P.ink, tx, 2.93, 1.27, hut, 6).rotation.set(0, 0, Math.PI / 2);
  box(0.32, 0.03, 0.03, P.ink, tx, 2.93, 1.275);
  box(0.3, 0.84, 0.025, P.carveWhite, tx, 2.5, 1.263);
  box(0.3, 0.05, 0.03, P.carveRed, tx, 2.88, 1.266);
  box(0.3, 0.05, 0.03, P.carveRed, tx, 2.12, 1.266);
  for (const row of [2.55, 2.32]) {
    for (let i = -1; i <= 1; i++) {
      b.extrude([[-0.05, 0], [0.05, 0], [0, 0.09, "sharp"]], {
        at: [tx + i * 0.1, row, 1.28], x: [1, 0, 0], thickness: 0.012, color: P.carveRed, bone: hut,
      });
    }
  }
  for (let i = 0; i < 6; i++) box(0.03, 0.06, 0.02, P.carveWhite, tx - 0.125 + i * 0.05, 2.05, 1.263);

  // ---------------- SIDE WINDOWS ----------------
  for (const s of [1, -1]) {
    const wy = 2.5, wz = 0.1;
    box(0.02, 0.8, 0.64, P.ink, s * 1.16, wy, wz);
    box(0.02, 0.46, 0.38, P.glow, s * 1.18, wy, wz);
    glow(b.part(new THREE.BoxGeometry(0.012, 0.44, 0.36), P.glow, { bone: hut, at: [s * 1.19, wy, wz] }), 1.2);
    // muntins
    box(0.02, 0.46, 0.03, P.carveWhite, s * 1.2, wy, wz);
    box(0.02, 0.03, 0.38, P.carveWhite, s * 1.2, wy, wz);
    // platband
    for (const dz of [-1, 1]) box(0.04, 0.6, 0.08, P.carveBlue, s * 1.19, wy, wz + dz * 0.255);
    box(0.04, 0.08, 0.5, P.carveBlue, s * 1.19, wy - 0.27, wz);
    box(0.04, 0.08, 0.5, P.carveBlue, s * 1.19, wy + 0.27, wz);
    // scalloped crown
    for (let i = -2; i <= 2; i++) {
      discX(0.05, 0.05, P.carveRed, s * 1.195, wy + 0.34, wz + i * 0.1, hut, 8);
      sph(0.016, P.carveYellow, s * 1.222, wy + 0.34, wz + i * 0.1, hut, 5);
    }
    // sill dots
    for (let i = -2; i <= 2; i++) sph(0.016, P.carveYellow, s * 1.215, wy - 0.27, wz + i * 0.1, hut, 5);
    // shutters
    for (const dz of [-1, 1]) {
      const z = wz + dz * 0.46;
      box(0.03, 0.62, 0.24, P.carveGreen, s * 1.165, wy, z);
      box(0.034, 0.62, 0.02, P.ink, s * 1.165, wy, z + dz * 0.12);
      for (const fy of [wy + 0.14, wy - 0.14]) {
        discX(0.05, 0.012, P.carveYellow, s * 1.19, fy, z, hut, 8);
        discX(0.02, 0.014, P.carveRed, s * 1.196, fy, z, hut, 6);
      }
      box(0.016, 0.06, 0.012, P.carveYellow, s * 1.186, wy, z);
    }
  }

  // ---------------- PORCH LANDING AND STAIR ----------------
  box(1.0, 0.08, 0.32, P.logLight, 0, 1.81, 1.41);
  box(1.0, 0.04, 0.03, P.logDark, 0, 1.76, 1.55);
  for (let i = -3; i <= 3; i++) discZ(0.04, 0.03, i % 2 ? P.carveYellow : P.carveRed, i * 0.15, 1.73, 1.56, hut, 8);
  box(0.9, 0.23, 0.03, P.logDark, 0, 1.655, 1.545);

  const posts: { z: number; top: number }[] = [{ z: 1.5, top: 1.85 }];
  for (let i = 0; i < 5; i++) {
    const topY = 1.85 - 0.31 * (i + 1);
    const zc = 1.68 + 0.2 * i;
    box(0.88, topY - 0.13, 0.2, P.logDark, 0, (topY + 0.13) / 2, zc);
    box(0.9, 0.04, 0.24, P.logLight, 0, topY - 0.02, zc + 0.01);
    box(0.88, 0.04, 0.012, i % 2 ? P.carveRed : P.carveBlue, 0, topY - 0.07, zc + 0.126);
    if (i % 2 === 0) posts.push({ z: zc, top: topY });
  }
  const last = { z: 2.48, top: 0.3 };
  posts[posts.length - 1] = last;
  for (const s of [1, -1]) {
    posts.forEach((p, k) => {
      const x = s * 0.5;
      const topY = p.top + 0.45;
      b.rod([x, p.top, p.z], [x, topY, p.z], 0.025, k === 0 || k === posts.length - 1 ? P.carveBlue : P.logDark, { bone: hut });
      if (k === 0 || k === posts.length - 1) {
        sph(0.05, P.carveRed, x, topY + 0.04, p.z, hut, 7);
        box(0.035, 0.07, 0.035, P.carveYellow, x, topY + 0.1, p.z + 0.015, hut, [-20, 0, 0]);
      } else {
        sph(0.032, P.carveRed, x, topY + 0.025, p.z, hut, 6);
      }
    });
    const a = posts[0], z = last;
    b.rod([s * 0.5, a.top + 0.45, a.z], [s * 0.5, z.top + 0.45, z.z], 0.02, P.carveRed, { bone: hut });
    b.rod([s * 0.5, a.top + 0.22, a.z], [s * 0.5, z.top + 0.22, z.z], 0.014, P.carveYellow, { bone: hut });
  }
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const RIDGE_Y = 4.45;
  const a = Math.atan2(1.3, 1.65);
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const L = Math.hypot(1.65, 1.3);
  const MORTAR = "#5f5c57";
  const r = rng(11);

  // ---- merged-geometry buckets (one part per colour) ----
  const B = new Map<string, THREE.BufferGeometry[]>();
  type V = [number, number, number];
  const put = (c: string, g: THREE.BufferGeometry, p: V, rot: V = [0, 0, 0]) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    if (!B.has(c)) B.set(c, []);
    B.get(c)!.push(g);
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  // slope-aligned placement: u down the slope from ridge, h along the normal, z along ridge
  const sput = (c: string, g: THREE.BufferGeometry, s: number, u: number, h: number, z: number) =>
    put(c, g, [s * (u * ca + h * sa), RIDGE_Y - u * sa + h * ca, z], [0, 0, -s * a]);
  const disc = (c: string, rad: number, p: V, f = 1, thk = 0.012, seg = 10) =>
    put(c, new THREE.CylinderGeometry(rad, rad, thk, seg), p, [(f * Math.PI) / 2, 0, 0]);

  // ---- roof core, shingles, scallops, moss ----
  const rowCol = (k: number) => (k % 2 === 0 ? P.roofRed : P.roofWood);
  const rowH = (k: number) => 0.02 + 0.012 * (5 - k);
  for (const s of [1, -1]) {
    sput(P.roofWood, box(L + 0.1, 0.06, 3.5), s, L / 2, -0.03, 0);
    for (let k = 0; k < 6; k++) {
      const uc = 0.2 + 0.31 * k;
      sput(rowCol(k), box(0.4, 0.04, 3.5), s, uc, rowH(k), 0);
      for (let i = 0; i < 9; i++) {
        const z = -1.56 + 0.39 * i;
        sput(rowCol(k), new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), s, uc + 0.2, rowH(k), z);
      }
      // ink lower-edge line shadow
      sput(P.ink, box(0.012, 0.012, 3.4), s, uc - 0.19, rowH(k) + 0.022, 0);
    }
  }
  const moss: [number, number, number, number, number][] = [
    [1, 1, 0.9, 0.34, 0.42], [1, 3, -0.7, 0.3, 0.5], [1, 2, 0.1, 0.22, 0.3],
    [-1, 2, -0.9, 0.36, 0.45], [-1, 4, 0.7, 0.3, 0.42], [-1, 1, 0.3, 0.24, 0.3],
  ];
  for (const [s, k, z, w, d] of moss) {
    sput(P.carveGreen, box(w, 0.012, d), s, 0.2 + 0.31 * k + (r() - 0.5) * 0.04, rowH(k) + 0.04 + 0.004, z);
    sput(P.grassDark, box(w * 0.5, 0.014, d * 0.5), s, 0.2 + 0.31 * k, rowH(k) + 0.04 + 0.006, z + 0.03);
  }

  // ---- ridge beam & purlins ----
  put(P.logDark, box(0.17, 0.16, 3.7), [0, 4.54, 0]);
  for (let i = 0; i < 9; i++) put(P.carveYellow, box(0.05, 0.03, 0.05), [0, 4.63, -1.6 + i * 0.4]);
  for (const s of [1, -1]) {
    put(P.logDark, box(0.13, 0.12, 3.4), [s * 1.3, 3.3, 0]);
    put(P.logDark, box(0.1, 0.12, 3.4), [s * 1.58, 3.12 + 0.03, 0]);
  }

  // ---- gable faces ----
  const tri: [number, number][] = [[-1.45, 3.2], [1.45, 3.2], [0, 4.33]];
  b.extrude(tri, { at: [0, 0, 1.3], x: [1, 0, 0], thickness: 0.08, color: P.logLight, bone });
  b.extrude(tri, { at: [0, 0, -1.3], x: [1, 0, 0], thickness: 0.08, color: P.roofWood, bone });
  const gh = (x: number) => 3.2 + (1.45 - Math.abs(x)) * (1.13 / 1.45);
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.3;
    const ht = gh(x) - 3.2 - 0.05;
    put(P.logDark, box(0.014, ht, 0.01), [x, 3.2 + ht / 2, 1.343]);
    if (i % 2 === 0) put(P.logLight, box(0.012, ht, 0.01), [x, 3.2 + ht / 2, -1.343]);
    else put(P.logDark, box(0.014, ht, 0.01), [x, 3.2 + ht / 2, -1.343]);
  }
  put(P.logDark, box(2.9, 0.05, 0.1), [0, 3.22, 1.32]);

  // ---- round attic window with sun rays ----
  const WY = 3.6;
  disc(P.ink, 0.29, [0, WY, 1.352], 1, 0.012, 14);
  disc(P.carveYellow, 0.25, [0, WY, 1.358], 1, 0.012, 14);
  disc(P.ink, 0.21, [0, WY, 1.364], 1, 0.012, 14);
  const pane = b.part(new THREE.CylinderGeometry(0.185, 0.185, 0.012, 14), P.glow, {
    bone, at: [0, WY, 1.37], dir: [0, 0, 1], axis: "y",
  });
  glow(pane, 1.4);
  put(P.ink, box(0.02, 0.38, 0.01), [0, WY, 1.38]);
  put(P.ink, box(0.38, 0.02, 0.01), [0, WY, 1.38]);
  for (let i = 0; i < 12; i++) {
    const ph = (i / 12) * Math.PI * 2;
    const g = new THREE.ConeGeometry(0.04, 0.13, 4);
    g.scale(1, 1, 0.35);
    put(P.carveYellow, g, [Math.cos(ph) * 0.36, WY + Math.sin(ph) * 0.36, 1.356], [0, 0, ph - Math.PI / 2]);
  }

  // ---- barge-board fringes ----
  const fringeCols = [P.carveRed, P.carveWhite, P.carveBlue];
  for (const s of [1, -1]) {
    sput(P.carveBlue, box(L, 0.12, 0.05), s, L / 2, -0.03, 1.77);
    sput(P.logDark, box(L, 0.12, 0.05), s, L / 2, -0.03, -1.77);
    for (let i = 0; i < 10; i++) {
      const u = 0.15 + i * 0.2;
      const g = new THREE.ConeGeometry(0.09, 0.2, 4);
      g.rotateX(Math.PI);
      g.scale(1, 1, 0.3);
      put(fringeCols[i % 3], g, [s * u * ca, RIDGE_Y - u * sa - 0.14, 1.77]);
      put(P.carveYellow, new THREE.SphereGeometry(0.018, 5, 4), [s * u * ca, RIDGE_Y - u * sa - 0.02, 1.8]);
    }
  }

  // ---- rosettes ----
  const rosette = (x: number, y: number, z: number) => {
    disc(P.ink, 0.15, [x, y, z], 1, 0.012, 12);
    disc(P.carveRed, 0.13, [x, y, z + 0.006], 1, 0.012, 12);
    for (let i = 0; i < 8; i++) {
      const ph = (i / 8) * Math.PI * 2;
      disc(P.carveWhite, 0.02, [x + Math.cos(ph) * 0.1, y + Math.sin(ph) * 0.1, z + 0.014], 1, 0.01, 6);
    }
    disc(P.carveYellow, 0.06, [x, y, z + 0.012], 1, 0.012, 8);
    disc(P.ink, 0.025, [x, y, z + 0.02], 1, 0.01, 6);
  };
  rosette(1.5, 3.32, 1.8);
  rosette(-1.5, 3.32, 1.8);
  rosette(0, 4.38, 1.8);

  // ---- pendant at apex ----
  put(P.logDark, box(0.025, 0.2, 0.025), [0, 4.3, 1.78]);
  const dia = new THREE.OctahedronGeometry(0.075);
  dia.scale(1, 1.4, 0.5);
  put(P.carveRed, dia, [0, 4.15, 1.78]);
  put(P.carveYellow, new THREE.SphereGeometry(0.035, 6, 4), [0, 4.04, 1.78]);

  // ---- chimney ----
  const CX = -0.75, CZ = -1.0;
  put(P.stone, box(0.4, 0.98, 0.4), [CX, 4.09, CZ]);
  for (let i = 0; i < 5; i++) {
    const y = 3.75 + i * 0.2;
    put(MORTAR, box(0.415, 0.016, 0.415), [CX, y, CZ]);
    for (let j = 0; j < 2; j++) {
      const off = (i % 2) * 0.1 + j * 0.2 - 0.1;
      put(MORTAR, box(0.016, 0.2, 0.416), [CX + off, y + 0.1, CZ]);
      put(MORTAR, box(0.416, 0.2, 0.016), [CX, y + 0.1, CZ + off]);
    }
  }
  put(P.logDark, box(0.5, 0.08, 0.5), [CX, 4.62, CZ]);
  put(P.ink, box(0.2, 0.01, 0.2), [CX, 4.665, CZ]);
  const puffs: [number, number, number][] = [[0.0, 4.74, 0.07], [0.2, 4.76, 0.1], [0.45, 4.78, 0.13]];
  for (const [dx, y, rad] of puffs) {
    put(P.smoke, new THREE.IcosahedronGeometry(rad, 0), [CX + dx, y, CZ], [r(), r(), r()]);
  }

  // ---- flush merged buckets ----
  for (const [c, gs] of B) {
    const m = mergeGeometries(gs);
    if (m) b.part(m, c, { bone, at: [0, 0, 0], flat: true });
  }

  // ---- konyok horse-head finials ----
  const K = 0.75;
  const head: [number, number][] = [
    [-0.2, -0.2], [0.12, -0.2], [0.15, -0.04], [0.38, -0.16], [0.46, -0.08],
    [0.32, 0.1], [0.2, 0.12], [0.16, 0.3], [0.06, 0.14], [-0.2, 0.1],
  ];
  const mane: [number, number][] = [
    [-0.2, -0.12], [-0.2, 0.08], [-0.15, 0.2], [-0.1, 0.1], [-0.05, 0.2], [0.0, 0.12], [0.0, -0.12],
  ];
  const sc = (pts: [number, number][]) => pts.map(([u, v]) => [u * K, v * K] as [number, number]);
  const KY = 4.58;
  for (const f of [1, -1]) {
    const zc = 1.45 * f;
    const at: V = [0, KY, zc];
    b.extrude(sc(head), { at, x: [0, 0, f], thickness: 0.1, color: P.logLight, bone });
    b.extrude(sc(mane), { at, x: [0, 0, f], thickness: 0.13, color: P.carveRed, bone });
    const pos = (u: number, v: number, x: number): V => [x, KY + v * K, zc + f * u * K];
    for (const sx of [1, -1]) {
      const geoms = (c: string, rad: number, u: number, v: number, xo: number) =>
        b.part(new THREE.CylinderGeometry(rad, rad, 0.012, 8), c, {
          bone, at: pos(u, v, sx * xo), dir: [1, 0, 0], axis: "y",
        });
      geoms(P.ink, 0.04, 0.28, 0.0, 0.056);
      geoms(P.carveWhite, 0.014, 0.29, 0.012, 0.062);
      geoms(P.carveYellow, 0.035, 0.1, -0.1, 0.056);
      geoms(P.ink, 0.014, 0.42, -0.09, 0.054);
      geoms(P.carveYellow, 0.022, -0.1, 0.0, 0.068);
      geoms(P.carveBlue, 0.02, 0.0, -0.06, 0.068);
    }
  }
}
```