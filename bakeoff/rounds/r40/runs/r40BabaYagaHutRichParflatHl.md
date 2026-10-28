<!-- call: plan -->

```json
{
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A Slavic folk-art diorama: a painted log izba with carved bargeboards and a horse-head ridge, standing on two giant scaly chicken legs inside a ring of glowing-eyed skull fence posts.",
  "builderName": "babaYagaHut",
  "size": [6.8, 5.3, 6.8],
  "layout": "STYLE: Slavic folk art (lubok, Khokhloma, painted carved wood). Every motif is a bold flat-colour shape, chunky and slightly exaggerated, with a dark ink (#1b1410) outline or underlay behind the main colour and small cream or yellow highlight dots on top. Colours are red, cobalt blue, sun yellow and orange on warm wood, with green foliage and cream accents. The repeated motifs are (1) the SUN ROSETTE: a yellow disc with 8 orange petals and a red ring, with a cream centre dot; (2) the TOOTH TRIM: a row of alternating red and blue triangles; (3) SCALLOPS: half-round cut-outs on carved boards; (4) the ROOSTER/TULIP: a stylised bird or flower of three flat petals. Reuse all four on the hut, door, gate posts and props.\nSILHOUETTE (+Z is the front): the model is a round diorama base about 6.8 m across. At the centre a log hut about 2.3 m wide (x) by 2.7 m deep (z) stands on two huge chicken legs. The sill underside is at y=2.0, the wall top at y=3.55, the ridge at y=4.64, and a horse-head ornament and chimney reach about y=5.0. The legs are digitigrade: the thigh runs forward-down to a forward knee, the shin runs backward-down to the hock, and the tarsus runs forward-down to a foot with three forward toes and one rear toe. The legs sit at x=+-0.7 and the feet at x=+-0.75, z=0.25. The hut faces +Z with a door in the centre of the front wall, a small porch platform, and a steep ladder-stair going down to the ground at z=2.75. The roof is a steep gable with its ridge along Z, so the gable triangle faces front and back. It has fish-scale shingles and carved bargeboards. A carved horse head (konyok) sits on each end of the ridge, and a brick chimney with smoke is on the model-right roof slope.\nGROUND: the base disc is r=3.4 with its grass top at y=0.15. A fence of skull-topped stakes forms a ring at r=3.0 over azimuth 40 to 320 degrees (azimuth 0 is +Z, 90 is +X), so the front is open and the path runs through. Two taller carved gate posts stand at az=+-40 degrees, which is (+-1.93, z=2.30). Birch trees stand behind the hut, with a mortar, pestle and broom, mushrooms, folk flowers and a black cat as small dressing. The feet stand on the base top. The only things that touch the model floor y=0 are the base disc and the fence stakes. The hut and legs rest on y=0.15.\nCoordinate convention: +X is the model's left; mirrored parts use for s of [1,-1], with s=1 the left (+X). Rest pose: legs standing, door closed.",
  "palette": {
    "logWarm": "#b9793f",
    "logDark": "#7d4a26",
    "logEnd": "#e0ab66",
    "shingleA": "#3f7f78",
    "shingleB": "#2f5f63",
    "folkRed": "#c8281e",
    "folkBlue": "#1f56a8",
    "folkYellow": "#f2b92b",
    "folkOrange": "#e8761f",
    "cream": "#f4e8cc",
    "green": "#2f8a43",
    "grassTop": "#5d8a3a",
    "ink": "#1b1410",
    "scaleYellow": "#e3a72f",
    "scaleDark": "#a8711a",
    "featherA": "#d9b878",
    "featherB": "#9a6a38",
    "bone": "#eadfc0",
    "glowEye": "#9dff4a",
    "windowGlow": "#ffc44d",
    "earth": "#5a4630",
    "stone": "#8a8a82",
    "birchWhite": "#efe9dc"
  },
  "mounts": {
    "groundTop": [0, 0.15, 0],
    "hutSillBottom": [0, 2.0, 0],
    "floorTop": [0, 2.15, 0],
    "wallTop": [0, 3.55, 0],
    "ridgeLine": [0, 4.64, 0],
    "eaveLeft": [1.75, 2.98, 0],
    "eaveRight": [-1.75, 2.98, 0],
    "frontWallFace": [0, 2.15, 1.35],
    "backWallFace": [0, 2.15, -1.35],
    "doorCentre": [0, 2.75, 1.38],
    "doorHinge": [-0.36, 2.75, 1.38],
    "porchFront": [0, 2.15, 1.95],
    "stairTop": [0, 2.0, 1.95],
    "stairBottom": [0, 0.15, 2.75],
    "windowL1": [1.15, 2.85, 0.65],
    "windowL2": [1.15, 2.85, -0.65],
    "windowR1": [-1.15, 2.85, 0.65],
    "windowR2": [-1.15, 2.85, -0.65],
    "gableFront": [0, 3.55, 1.35],
    "gableBack": [0, 3.55, -1.35],
    "gableWindowFront": [0, 3.95, 1.38],
    "konyokFront": [0, 4.64, 1.85],
    "konyokBack": [0, 4.64, -1.85],
    "chimneyBase": [-0.6, 4.05, -0.7],
    "hipL": [0.7, 1.95, 0],
    "hipR": [-0.7, 1.95, 0],
    "footL": [0.75, 0.22, 0.25],
    "footR": [-0.75, 0.22, 0.25],
    "fenceCentre": [0, 0.15, 0],
    "gatePostL": [1.93, 0.15, 2.3],
    "gatePostR": [-1.93, 0.15, 2.3],
    "mortarSpot": [2.0, 0.15, 1.5],
    "birchBackL": [2.4, 0.15, -1.4],
    "birchBackR": [-2.35, 0.15, -1.0],
    "catSpot": [0.42, 2.15, 1.65]
  },
  "joints": [
    { "name": "base", "at": [0, 0, 0], "dir": [0, 1, 0], "role": "spine", "group": "ground" },
    { "name": "hut", "parent": "base", "at": [0, 2.0, 0], "dir": [0, 1, 0], "role": "spine", "group": "hut" },
    { "name": "door", "parent": "hut", "at": [-0.36, 2.75, 1.38], "dir": [0, 1, 0], "role": "hinge", "group": "hut" },
    { "name": "hipL", "parent": "hut", "at": [0.7, 1.95, 0], "dir": [0.1, -0.65, 0.55], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.8, 1.3, 0.55], "dir": [-0.05, -0.45, -0.8], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.75, 0.85, -0.25], "dir": [0, -0.63, 0.5], "role": "leg", "group": "legs" },
    { "name": "footL", "parent": "ankleL", "at": [0.75, 0.22, 0.25], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeL1", "parent": "footL", "at": [0.75, 0.22, 0.25], "dir": [0.4, -0.02, 0.8], "role": "digit", "group": "legs" },
    { "name": "toeL2", "parent": "footL", "at": [0.75, 0.22, 0.25], "dir": [0, -0.02, 0.95], "role": "digit", "group": "legs" },
    { "name": "toeL3", "parent": "footL", "at": [0.75, 0.22, 0.25], "dir": [-0.4, -0.02, 0.8], "role": "digit", "group": "legs" },
    { "name": "toeL4", "parent": "footL", "at": [0.75, 0.22, 0.25], "dir": [0, 0, -0.6], "role": "digit", "group": "legs" },
    { "name": "hipR", "parent": "hut", "at": [-0.7, 1.95, 0], "dir": [-0.1, -0.65, 0.55], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.8, 1.3, 0.55], "dir": [0.05, -0.45, -0.8], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.75, 0.85, -0.25], "dir": [0, -0.63, 0.5], "role": "leg", "group": "legs" },
    { "name": "footR", "parent": "ankleR", "at": [-0.75, 0.22, 0.25], "dir": [0, 0, 1], "role": "leg", "group": "legs" },
    { "name": "toeR1", "parent": "footR", "at": [-0.75, 0.22, 0.25], "dir": [-0.4, -0.02, 0.8], "role": "digit", "group": "legs" },
    { "name": "toeR2", "parent": "footR", "at": [-0.75, 0.22, 0.25], "dir": [0, -0.02, 0.95], "role": "digit", "group": "legs" },
    { "name": "toeR3", "parent": "footR", "at": [-0.75, 0.22, 0.25], "dir": [0.4, -0.02, 0.8], "role": "digit", "group": "legs" },
    { "name": "toeR4", "parent": "footR", "at": [-0.75, 0.22, 0.25], "dir": [0, 0, -0.6], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "chickenLegs",
      "builds": "Both giant chicken legs, mirrored (L at +X, R at -X), built from the rig. Build them as a chain through hip, knee, ankle and foot (a limb/IK solve landing the foot on footL/footR, or sweeps through the joint positions), with smooth skin sweeps. THIGH: a fat feathered 'trouser' of radius about 0.28 at the hip tapering to 0.17 at the knee. It is a base sweep in featherA covered with 14-20 overlapping broad feather blades (flat extruded leaf shapes, or cards/spikes) in a root-to-tip featherA to featherB palette, pointing down and back, with a ruff of longer feather blades round the knee. KNEE and HOCK: chunky knuckle blocks in scaleDark. TARSUS (shin and lower leg): scaly yellow, radius about 0.11 at the hock tapering to 0.09, in scaleYellow. It carries a row of overlapping scale plates (small flat boxes or rounded plates, scaleDark) down the front, with a spur (an ink cone) at the back of the hock. Each hock gets a folk 'bracelet': a red (folkRed) ring sweep with 6-8 tiny cream dots round it. TOES: four per leg, one sweep each (radius 0.08 tapering to 0.05) along the toe joints toeX1..toeX4 (three forward, spread outward, centre and inward, plus one rear toe). Each has 2-3 knuckle bumps in scaleDark, a toe pad underside, and a long curved ink talon (a cone or curved sweep, 0.16-0.2 m) at the tip, which rests on the ground. The rear toe is shorter with a bigger spur-claw. Add a few lumps of earth (earth colour) over the toes and a small yellow-orange dot motif. At the top of each thigh a rounded hip cap in featherA tucks under the hut's sill at hipL/hipR (y up to 2.0). Use the joints hipX, kneeX, ankleX, footX, toeX1..4 and give the leg chain role 'leg' and the toes role 'digit'.",
      "box": [[-1.4, 0.1, -0.6], [1.4, 2.05, 1.5]],
      "attaches": "Hips at mounts hipL/hipR just under hutSillBottom (y 2.0). The feet land on footL/footR with toe undersides sinking slightly into groundTop (y 0.15). Parented to the hut joint.",
      "joints": ["hipL", "kneeL", "ankleL", "footL", "toeL1", "toeL2", "toeL3", "toeL4", "hipR", "kneeR", "ankleR", "footR", "toeR1", "toeR2", "toeR3", "toeR4"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "hutBody",
      "builds": "The log cabin walls, floor beams, front door, windows, porch and stair. WALLS: a core box (x +-1.15, z +-1.35, y 2.15 to 3.55) in logDark so there are no gaps. On the front and back walls, horizontal log cylinders (radius 0.1, 8 sides, logWarm) at y=2.25+0.2i for i 0..6, spanning x +-1.3 so they stick out past the corners. On the side walls, logs at y=2.35+0.2i for i 0..5 spanning z +-1.5. Each log end gets a logEnd disc with a ring/annual-ring detail (a smaller darker logDark disc and a centre dot). Bands of moss (grassTop) lie on the top of the highest logs. SILL: two heavy sill beams (box, logDark) under the floor at y 2.0 to 2.15 spanning the full depth, with carved scallop ends. A wall top plate in logDark at y 3.45 to 3.55. FRONT DOOR at doorCentre: a doorway 0.72 wide by 1.2 tall (y 2.15 to 3.35) with a carved frame (platband: folkRed boards, tooth trim of red/blue triangles up the sides, a folkBlue lintel with a cream sun rosette above). The door itself rides joint 'door' (hinge at doorHinge, x=-0.36, swinging about the vertical axis) and is closed in rest pose: planks in logWarm with logDark seams, iron-look ink hinge straps, a folkYellow tree-of-life or tulip motif (three flat petals on a stalk) in ink/folkRed/folkYellow, and a round ring handle in ink. WINDOWS: at windowL1, L2, R1 and R2 on the side walls, each 0.5 wide by 0.55 tall, with a windowGlow pane (glow) divided by a cream cross, and a carved platband frame in folkRed with a scalloped top board in folkBlue with yellow dots. Painted shutters in folkBlue with a cream tulip motif sit open at each side. PORCH: a platform (x +-0.6, z 1.35 to 1.95, y 2.0 to 2.15) in logWarm with plank lines, and two corner posts with carved onion-top finials at z 1.9, x +-0.55, rising to y 2.95, joined by a folkRed railing. STAIR: a steep ladder-stair from stairTop (0, 2.0, 1.95) down to stairBottom (0, 0.15, 2.75), 0.7 wide, with two logDark stringers and 8-9 logWarm treads, and tooth trim (red/blue) on the stringer outer faces. Add a hanging folk towel (a cream rectangle with red trim and tooth ends) beside the door, and a few yellow dot studs on the sill.",
      "box": [[-1.55, 0.12, -1.55], [1.55, 3.6, 2.8]],
      "attaches": "Sits on the hut joint at hutSillBottom (y 2.0) above the legs' hip caps. The wall top plate at wallTop (y 3.55) is where the roof starts. The stair foot lands on stairBottom at groundTop y 0.15. Door rides joint 'door'.",
      "joints": ["hut", "door"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "roof",
      "builds": "The steep gable roof and everything above wallTop (y 3.55). The roof surface passes through (x=+-1.15, y=3.55) and the ridge (0, 4.64), i.e. a slope of 0.95. It continues to the eave at x=+-1.75, y=2.98. It runs z from -1.85 to +1.85, so the gable ends overhang. Each slope is a layer of boards (0.1 thick) with 8-9 rows of fish-scale shingles (scalloped rounded extruded tiles, about 0.22 wide), alternating shingleA and shingleB per tile, rows overlapping like scales. Every 4th row has a row of tiles tinted folkRed for a folk accent, and the eave row is trimmed with cream dots. RIDGE: a heavy round log along z at the ridge in logDark, with a row of yellow dots on top. GABLE INFILL: triangle of vertical planks (logWarm, thin boxes with logDark seams) at the front (z=1.35) and back (z=-1.35), from y 3.55 to 4.64. BARGEBOARDS (carved gable-edge boards): on both slopes at the front and back, a 0.22-wide carved board in folkRed with a scalloped lower edge, a row of blue circles and a sun-yellow dot in each scallop, plus a cream tooth-trim line along the top. FRONT GABLE: a round window at gableWindowFront (0.4 diameter, windowGlow glow pane, folkBlue ring, a sun rosette of 8 yellow-orange petals around it) and a hanging carved pendant 'prichelina' under the peak (folkBlue shield with a cream sun and a red tooth edge). KONYOK: a carved horse head in profile on each end of the ridge (konyokFront at z=1.85, konyokBack at z=-1.85), both facing outward, about 0.4 m. They are extruded profile outlines in logWarm with a folkRed mane scalloped in blades, a cream eye with an ink pupil, a folkBlue bridle, and yellow dots on the neck. CHIMNEY at chimneyBase (x=-0.6): a brick stack 0.35 square rising to y 4.95 with brick courses (alternating red/orange brick colours using folkRed and folkOrange boxes), a cream cap slab, and 3-4 smoke puffs (low-poly spheres, cream and stone tinted, getting bigger and rising to y 5.3) drifting back.",
      "box": [[-1.9, 2.85, -1.95], [1.9, 5.3, 1.95]],
      "attaches": "The roof underside meets the wall top plate at wallTop (y 3.55). The gable infill rests on the front and back wall faces (z=+-1.35). The horse heads sit on the ridge ends konyokFront/konyokBack. All on the hut joint.",
      "joints": ["hut"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "baseAndFence",
      "builds": "The diorama ground and the skull fence. BASE: a 16-sided disc of radius 3.4 whose top is at y=0.15 (grassTop, with a slightly darker ring of 3-5 irregular lighter/darker flat patches in green), and an earth side wall from y=0 to 0.15 in earth, with 10-12 small stone blocks (stone) round the rim. A packed-earth path (earth, a flat low shape) runs from stairBottom (0, 0.15, 2.75) out through the gate gap to z=3.3, with 4-5 flat stone slabs (stone). A few grass tufts and patches of moss round the legs' feet. SKULL FENCE: about 30 stakes at radius 3.0 from azimuth 40 to 320 degrees (0 is +Z, 90 is +X), evenly spaced (about 0.48 m apart), at heights alternating 1.1 and 1.3, each a sharpened cylindrical post (6-8 sides) in logDark with a logWarm cap ring. Each carries a skull on top: cranium (low-poly sphere, bone), a separate jaw box (bone), a nose (ink triangle), two big eye sockets (ink spheres) with glowEye glow inside (use the glow kit), and a row of small teeth. A few skulls tilt slightly (+-8 degrees). Between the stakes at y 0.55 runs a log rail (logDark). Every 5th stake has a folkRed band with cream dots. GATE POSTS at gatePostL/gatePostR (az=+-40 degrees, i.e. (+-1.93, z=2.3)): taller (1.5 m) carved posts in logWarm, each with a folkRed tooth-trim band, a folkBlue sun-rosette disc panel facing the path, and a bigger skull on top (cranium plus separate jaw, glowEye eyes), and a folkYellow pointed cap between skull and post. Keep this part simpler than the hut.",
      "box": [[-3.4, 0, -3.4], [3.4, 1.6, 3.4]],
      "attaches": "Base top at groundTop (y 0.15). The hut's stair foot at stairBottom and the legs' feet at footL/footR rest on it. The fence centre is fenceCentre. Rides joint 'base'.",
      "joints": ["base"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "propsAndWoods",
      "builds": "Dressing standing on groundTop (y 0.15), keeping out of the hut-legs zone (|x|<1.45, -0.8<z<1.5) and the path (|x|<0.6, z>1.9). BIRCH TREES: two birches at birchBackL (2.4, -1.4) and birchBackR (-2.35, -1.0), about 4.7 m tall. Each has a faceted tapered trunk (birchWhite, 6-7 sides, radius 0.14 to 0.07), ink dash marks (small flat boxes) round the trunk, 4-5 branches (thin sweeps, birchWhite) and a folk-art canopy of 8-12 flat leaf-shaped extruded blobs/chunky low-poly clumps in green, some in folkYellow, with tiny cream dots; there is a red ribbon with tooth ends tied to one branch. MORTAR AND PESTLE at mortarSpot (2.0, 0.15, 1.5): a flared stone mortar (lathe, stone) about 0.8 wide and 0.55 tall with a folkRed painted band with cream dots and a sun rosette on the front; a long pestle (logWarm, red-capped) leaning out of it at about 25 degrees; and a broom (logDark handle, a bundle of twig blades in logWarm/logDark tied with a folkRed band) leaning against the mortar. MUSHROOMS: 6-9 fly agaric (red cap folkRed, cream dots, cream stem) in two clusters at the front left and back right, 0.1-0.25 high. FOLK FLOWERS: 8-10 stylised flowers (3-5 flat petal blades in folkRed, folkBlue and folkYellow, a yellow centre dot, a green stalk and two leaf blades) scattered round the base inside the fence. A few grass tufts, 3-4 stones and a stump. BLACK CAT at catSpot (0.42, 2.15, 1.65) on the porch, sitting facing front: an ink body, head, two ears, a curved tail, and glowEye eyes (glow). A raven perched on the left gate post top? No: put the raven (ink body, wedge beak in folkYellow) on a fence stake at azimuth 270 degrees. Keep each small and in the folk-art flat style with ink outline layers.",
      "box": [[-2.9, 0.1, -2.9], [2.9, 4.9, 2.9]],
      "attaches": "All feet on groundTop (y 0.15) except the cat, which sits on floorTop (y 2.15) of the porch at catSpot. Ground items ride the 'base' joint and the cat rides 'hut'.",
      "joints": ["base", "hut"],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: baseAndFence -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBaseAndFence({ b, J, P, M }: any) {
  const bone = J.base;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });

  // BASE
  part(new THREE.CylinderGeometry(3.4, 3.4, 0.15, 16), P.earth, [0, 0.075, 0]);
  part(new THREE.CylinderGeometry(3.3, 3.4, 0.03, 16), P.grassTop, [0, 0.135, 0]);
  // grass patches
  const greens = ["#4f7a30", "#6c9a44", "#3f6e2e", P.green];
  for (let i = 0; i < 5; i++) {
    const a = R() * 6.28, r = 1.2 + R() * 1.8;
    part(new THREE.CylinderGeometry(0.4 + R() * 0.3, 0.4 + R() * 0.3, 0.01, 7), greens[i % 4],
      [Math.sin(a) * r, 0.155, Math.cos(a) * r]);
  }
  // rim stones
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * 6.28;
    part(new THREE.BoxGeometry(0.4, 0.14, 0.22), P.stone, [Math.sin(a) * 3.38, 0.07, Math.cos(a) * 3.38],
      { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // path
  part(new THREE.BoxGeometry(0.9, 0.012, 0.75), P.earth, [0, 0.16, 3.0]);
  part(new THREE.BoxGeometry(0.7, 0.012, 0.5), P.earth, [0, 0.16, 2.9]);
  for (let i = 0; i < 5; i++)
    part(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 6), P.stone, [(i % 2 ? 0.15 : -0.15), 0.17, 2.85 + i * 0.1]);
  // moss and tufts near feet
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 7), P.green, [s * 0.75, 0.16, 0.0]);
    for (let k = 0; k < 3; k++)
      part(new THREE.ConeGeometry(0.04, 0.2, 4), P.green, [s * (1.05 + k * 0.1), 0.25, 0.5 - k * 0.3]);
  }

  const skull = (x: number, y: number, z: number, sc: number, rotY: number, tilt: number) => {
    const g = new THREE.Group();
    const at = (v: number[]) => [x + v[0] * sc, y + v[1] * sc, z + v[2] * sc];
    const rot = [tilt, rotY, 0];
    const mk = (geo: THREE.BufferGeometry, c: string, v: number[], gl = false) => {
      const p = new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(sc)
        .applyEuler(new THREE.Euler(0, (rotY * Math.PI) / 180, 0));
      const pt = b.part(geo, c, { bone, at: [x + p.x, y + p.y, z + p.z], rotation: rot, scale: sc, flat: true });
      if (gl) glow(pt, 1.5);
    };
    mk(new THREE.SphereGeometry(0.13, 7, 5), P.bone, [0, 0.13, 0]);
    mk(new THREE.BoxGeometry(0.15, 0.07, 0.15), P.bone, [0, 0.0, 0.03]);
    mk(new THREE.ConeGeometry(0.03, 0.06, 3), P.ink, [0, 0.07, 0.125]);
    for (const s of [1, -1]) {
      mk(new THREE.SphereGeometry(0.04, 6, 4), P.ink, [s * 0.05, 0.13, 0.1]);
      mk(new THREE.SphereGeometry(0.02, 5, 4), P.glowEye, [s * 0.05, 0.13, 0.125], true);
    }
    for (let t = -2; t <= 2; t++)
      mk(new THREE.BoxGeometry(0.02, 0.025, 0.01), P.cream, [t * 0.03, -0.02, 0.108]);
  };

  // FENCE
  const N = 30;
  for (let i = 0; i < N; i++) {
    const az = 40 + (i / (N - 1)) * 280;
    const a = (az * Math.PI) / 180;
    const x = Math.sin(a) * 3.0, z = Math.cos(a) * 3.0;
    const h = i % 2 ? 1.3 : 1.1;
    part(new THREE.CylinderGeometry(0.07, 0.09, h, 7), P.logDark, [x, h / 2, z]);
    part(new THREE.ConeGeometry(0.07, 0.15, 7), P.logDark, [x, h + 0.02, z]);
    part(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 7), P.logWarm, [x, h - 0.1, z]);
    if (i % 5 === 0) {
      part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 7), P.folkRed, [x, h * 0.5, z]);
      for (let k = 0; k < 4; k++) {
        const b2 = a + (k - 1.5) * 0.28;
        part(new THREE.SphereGeometry(0.014, 4, 3), P.cream,
          [x + Math.sin(a) * 0.0 + Math.sin(a + 1.57) * 0.02 * 0, h * 0.5 + 0.04, z],
          { scale: 1 });
        void b2;
      }
    }
    skull(x, h + 0.15, z, 1, az + 180, (R() - 0.5) * 0.28);
    // rail segment
    if (i < N - 1) {
      const a2 = ((40 + ((i + 1) / (N - 1)) * 280) * Math.PI) / 180;
      const x2 = Math.sin(a2) * 3.0, z2 = Math.cos(a2) * 3.0;
      b.rod([x, 0.55, z], [x2, 0.55, z2], 0.035, P.logDark, { bone, sides: 6 });
    }
  }

  // GATE POSTS
  for (const s of [1, -1]) {
    const x = s * 1.93, z = 2.3;
    const rotY = s * 40;
    part(new THREE.BoxGeometry(0.22, 1.5, 0.22), P.logWarm, [x, 0.9, z], { rotation: [0, rotY, 0] });
    const out = new THREE.Vector3(-s * Math.sin(0.7), 0, -Math.cos(0.7)).normalize(); // toward path
    out.set(-s * 0.64, 0, 0.77);
    part(new THREE.BoxGeometry(0.24, 0.14, 0.24), P.folkRed, [x, 0.5, z], { rotation: [0, rotY, 0] });
    for (let k = -1; k <= 1; k++)
      part(new THREE.ConeGeometry(0.04, 0.07, 3), P.folkBlue, [x + out.x * 0.13 + 0, 0.4, z + out.z * 0.13],
        { rotation: [180, rotY, 0] });
    const px = x + out.x * 0.13, pz = z + out.z * 0.13;
    part(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 12), P.folkBlue, [px, 1.1, pz],
      { dir: [out.x, 0, out.z] });
    part(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 8), P.folkYellow, [px + out.x * 0.01, 1.1, pz + out.z * 0.01],
      { dir: [out.x, 0, out.z] });
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), P.cream, [px + out.x * 0.02, 1.1, pz + out.z * 0.02],
      { dir: [out.x, 0, out.z] });
    part(new THREE.ConeGeometry(0.15, 0.3, 6), P.folkYellow, [x, 1.8, z]);
    skull(x, 1.93, z, 1.5, 180 + s * 40 * -1 + 0, 0);
  }
}
```

<!-- call: roof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const R = rng(5);
  const SLOPE = 0.95;
  const ang = Math.atan(SLOPE);
  const slant = Math.hypot(1.15, 1.09);
  const place = (g: THREE.BufferGeometry, c: string, at: number[], rotation?: number[], scale?: number[]) =>
    b.part(g, c, { bone, at, rotation, scale, flat: true } as any);

  // Roof boards: each slope is a thin box tilted by the slope angle
  for (const s of [1, -1]) {
    const mx = s * 1.45, my = 3.265;
    const len = Math.hypot(1.75, 1.66);
    place(new THREE.BoxGeometry(0.1, len + 0.1, 3.7), P.logDark, [mx, my + 0.0, 0], [0, 0, s * -(90 - 0) * 0 + s * (-(Math.atan2(1.66, 1.75) * 180) / Math.PI + 0) * 0]);
  }
  // Correct tilted boards using explicit quaternion-free rotation about Z
  // slope surface goes from (±1.75,2.98) to (0,4.64)
  const sl = Math.atan2(4.64 - 2.98, 1.75);
  const slLen = Math.hypot(1.75, 1.66);
  for (const s of [1, -1]) {
    const cx = s * 0.875, cy = 3.81;
    // box long axis along Y rotated so it lies on slope
    const rz = s * (90 - (sl * 180) / Math.PI) * -1 * -1;
    place(new THREE.BoxGeometry(0.1, slLen, 3.7), P.logWarm, [cx, cy - 0.06, 0], [0, 0, rz]);
  }

  // Fish-scale shingles
  const rows = 9;
  const scaleShape = new THREE.Shape();
  scaleShape.moveTo(-0.11, 0.12);
  scaleShape.lineTo(0.11, 0.12);
  scaleShape.lineTo(0.11, 0.0);
  scaleShape.absarc(0, 0, 0.11, 0, -Math.PI, true);
  scaleShape.lineTo(-0.11, 0.12);
  const tileGeo = new THREE.ExtrudeGeometry(scaleShape, { depth: 0.03, bevelEnabled: false, curveSegments: 4 });
  for (const s of [1, -1]) {
    for (let r = 0; r < rows; r++) {
      const t = (r + 0.5) / rows;
      const x = s * (1.75 - 1.75 * t * 0.97);
      const y = 2.98 + 1.66 * t * 0.97 + 0.04;
      const cols = Math.floor(3.5 / 0.22);
      for (let c = 0; c < cols; c++) {
        const z = -1.75 + c * 0.22 + (r % 2 ? 0.11 : 0.0) + 0.06;
        if (Math.abs(z) > 1.8) continue;
        const red = r % 4 === 3;
        const col = red ? P.folkRed : (c + r) % 2 ? P.shingleA : P.shingleB;
        // tile local: x across (z world), y down-slope, extrude thickness outward
        const m = place(tileGeo.clone().rotateY(Math.PI / 2).rotateZ(0), col, [x, y, z], [0, 0, s * ((sl * 180) / Math.PI) * -1 + (s < 0 ? 0 : 0)]);
        void m;
      }
    }
    // eave cream dots
    for (let i = 0; i < 16; i++) {
      place(new THREE.SphereGeometry(0.03, 5, 4), P.cream, [s * 1.77, 2.96, -1.7 + i * 0.227]);
    }
  }

  // Ridge log
  b.rod([0, 4.66, -1.85], [0, 4.66, 1.85], 0.1, P.logDark, { bone, sides: 8 } as any);
  for (let i = 0; i < 9; i++) place(new THREE.SphereGeometry(0.035, 5, 4), P.folkYellow, [0, 4.77, -1.6 + i * 0.4]);

  // Gable infill + bargeboards + front details
  for (const z of [1.35, -1.35]) {
    const f = z > 0 ? 1 : -1;
    for (let i = -5; i <= 5; i++) {
      const x = i * 0.2;
      const h = (1 - Math.abs(x) / 1.15) * 1.09;
      if (h <= 0.05) continue;
      place(new THREE.BoxGeometry(0.19, h, 0.06), i % 2 ? P.logWarm : P.logEnd, [x, 3.55 + h / 2, z]);
      place(new THREE.BoxGeometry(0.012, h, 0.065), P.logDark, [x + 0.1, 3.55 + h / 2, z]);
    }
    // bargeboards
    for (const s of [1, -1]) {
      const rz = s * (90 - (sl * 180) / Math.PI) * -1 * -1;
      place(new THREE.BoxGeometry(0.06, slLen, 0.12).rotateY(0), P.folkRed, [s * 0.875, 3.81 + 0.03, f * 1.88], [0, 0, rz]);
      place(new THREE.BoxGeometry(0.05, slLen, 0.02), P.cream, [s * 0.875, 3.81 + 0.1, f * 1.95], [0, 0, rz]);
      for (let k = 0; k < 7; k++) {
        const t = (k + 0.5) / 7;
        const px = s * (1.7 - 1.65 * t), py = 3.0 + 1.6 * t - 0.12;
        place(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), P.folkBlue, [px, py, f * 1.95], [90, 0, 0]);
        place(new THREE.SphereGeometry(0.02, 5, 4), P.folkYellow, [px, py, f * 1.97]);
      }
    }
  }

  // Front round window with rosette
  const wc = [0, 3.95, 1.4];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    place(new THREE.SphereGeometry(0.07, 5, 4), i % 2 ? P.folkOrange : P.folkYellow, [Math.cos(a) * 0.3, 3.95 + Math.sin(a) * 0.3, 1.4], undefined, [1, 1, 0.5]);
  }
  place(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 12), P.folkBlue, wc, [90, 0, 0]);
  glow(place(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), P.windowGlow, [0, 3.95, 1.41], [90, 0, 0]), 1.3);
  place(new THREE.BoxGeometry(0.4, 0.03, 0.05), P.cream, [0, 3.95, 1.43]);
  place(new THREE.BoxGeometry(0.03, 0.4, 0.05), P.cream, [0, 3.95, 1.43]);

  // Pendant
  place(new THREE.BoxGeometry(0.3, 0.3, 0.05), P.folkBlue, [0, 4.25, 1.92]);
  place(new THREE.ConeGeometry(0.21, 0.25, 4), P.folkBlue, [0, 4.0, 1.92], [0, 45, 180], [1, 1, 0.25]);
  place(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 8), P.cream, [0, 4.2, 1.95], [90, 0, 0]);
  for (let i = -2; i <= 2; i++) place(new THREE.ConeGeometry(0.03, 0.06, 3), P.folkRed, [i * 0.06, 4.4, 1.93], [0, 0, 180]);

  // Konyok horse heads
  const horse: [number, number, string?][] = [
    [0, 0], [0.1, 0.0], [0.14, 0.2], [0.22, 0.34], [0.3, 0.3], [0.38, 0.24], [0.4, 0.14], [0.3, 0.1], [0.22, 0.0], [0.2, -0.1], [0, -0.1],
  ];
  for (const f of [1, -1]) {
    const x: [number, number, number] = [0, 0, f];
    const at = [0, 4.7, f * 1.75];
    b.extrude(horse as any, { at, x, y: [0, 1, 0], thickness: 0.1, color: P.logWarm, bone } as any);
    b.extrude([[0, 0.2], [-0.1, 0.35], [0.0, 0.5], [0.1, 0.4], [0.16, 0.3]] as any, { at: [0, 4.7, f * 1.75], x, y: [0, 1, 0], thickness: 0.13, color: P.folkRed, bone } as any);
    place(new THREE.SphereGeometry(0.035, 6, 4), P.cream, [0, 4.7 + 0.28, f * (1.75 + 0.27)], undefined, [1.5, 1, 1]);
    place(new THREE.SphereGeometry(0.018, 5, 4), P.ink, [0, 4.98, f * 2.03]);
    place(new THREE.BoxGeometry(0.12, 0.04, 0.05), P.folkBlue, [0, 4.84, f * 2.0]);
    for (let i = 0; i < 3; i++) place(new THREE.SphereGeometry(0.02, 5, 4), P.folkYellow, [0, 4.8 + i * 0.07, f * (1.8 + i * 0.05)], undefined, [3, 1, 1]);
  }

  // Chimney
  const cx = -0.6, cz = -0.7;
  for (let i = 0; i < 6; i++) {
    place(new THREE.BoxGeometry(0.35, 0.15, 0.35), i % 2 ? P.folkOrange : P.folkRed, [cx, 3.95 + i * 0.15, cz]);
  }
  place(new THREE.BoxGeometry(0.46, 0.06, 0.46), P.cream, [cx, 4.98, cz]);
  const puffs = [[0.1, 5.08, -0.1, 0.1, P.cream], [0.0, 5.18, -0.3, 0.14, P.stone], [-0.05, 5.26, -0.5, 0.17, P.cream]];
  for (const [dx, y, dz, r, c] of puffs as any) place(new THREE.IcosahedronGeometry(r, 0), c, [cx + dx, y, cz + dz]);
  void frame; void R; void M; void ang; void slant;
}
```

<!-- call: hutBody -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHutBody({ b, J, P, M }: any) {
  const hut = J.hut, door = J.door;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = hut, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], rot: number[], seg = 8, bone: any = hut) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, rotation: rot });
  const tri = (w: number, h: number, c: string, at: number[], rotZ: number, bone: any = hut) =>
    b.part(new THREE.ConeGeometry(w, h, 3), c, { bone, at, rotation: [0, 0, rotZ] });
  const ball = (r: number, c: string, at: number[], bone: any = hut) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at });
  const disc = (r: number, c: string, at: number[], rot: number[], bone: any = hut, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.012, seg), c, { bone, at, rotation: rot });

  // core, plate, sill
  box(2.3, 1.4, 2.7, P.logDark, [0, 2.85, 0]);
  box(2.4, 0.1, 2.8, P.logDark, [0, 3.5, 0]);
  for (const s of [1, -1]) {
    box(0.3, 0.15, 3.2, P.logDark, [s * 0.7, 2.075, 0]);
    for (const z of [1.6, -1.6]) cyl(0.075, 0.3, P.logDark, [s * 0.7, 2.075, z], [0, 0, 90], 8);
  }
  box(1.6, 0.15, 2.9, P.logDark, [0, 2.075, 0]);

  // logs: front/back walls (along x), side walls (along z)
  for (let i = 0; i < 7; i++) {
    const y = 2.25 + 0.2 * i;
    for (const z of [1.36, -1.36]) {
      cyl(0.1, 2.6, P.logWarm, [0, y, z], [0, 0, 90]);
      for (const s of [1, -1]) {
        disc(0.1, P.logEnd, [s * 1.3, y, z], [0, 0, 90]);
        disc(0.05, P.logDark, [s * 1.307, y, z], [0, 0, 90], hut, 8);
        ball(0.012, P.logEnd, [s * 1.312, y, z]);
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const y = 2.35 + 0.2 * i;
    for (const x of [1.16, -1.16]) {
      cyl(0.1, 3.0, P.logWarm, [x, y, 0], [90, 0, 0]);
      for (const s of [1, -1]) {
        disc(0.1, P.logEnd, [x, y, s * 1.5], [90, 0, 0]);
        disc(0.05, P.logDark, [x, y, s * 1.507], [90, 0, 0], hut, 8);
        ball(0.012, P.logEnd, [x, y, s * 1.512]);
      }
    }
  }
  // moss on top logs
  for (const z of [1.36, -1.36]) box(1.8, 0.03, 0.12, P.grassTop, [0, 3.45, z]);
  for (const x of [1.16, -1.16]) box(0.12, 0.03, 2.0, P.grassTop, [x, 3.45, 0.2]);

  // door frame
  for (const s of [1, -1]) {
    box(0.12, 1.3, 0.08, P.folkRed, [s * 0.5, 2.8, 1.43]);
    for (let k = 0; k < 6; k++)
      tri(0.04, 0.08, k % 2 ? P.folkBlue : P.folkRed, [s * 0.58, 2.28 + k * 0.19, 1.43], 0);
  }
  box(1.2, 0.16, 0.1, P.folkBlue, [0, 3.45, 1.43]);
  box(1.3, 0.06, 0.1, P.folkRed, [0, 3.57, 1.43]);
  // sun rosette
  const rosette = (at: number[], r: number, rot: number[]) => {
    disc(r * 1.3, P.ink, at, rot, hut, 12);
    disc(r, P.folkRed, [at[0], at[1], at[2] + 0.004], rot, hut, 12);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      ball(r * 0.3, P.folkOrange, [at[0] + Math.cos(a) * r * 0.85, at[1] + Math.sin(a) * r * 0.85, at[2] + 0.008]);
    }
    disc(r * 0.7, P.folkYellow, [at[0], at[1], at[2] + 0.01], rot, hut, 12);
    ball(r * 0.25, P.cream, [at[0], at[1], at[2] + 0.02]);
  };
  rosette([0, 3.45, 1.5], 0.07, [90, 0, 0]);

  // door
  const dx = (x: number) => x + 0.36;
  box(0.72, 1.2, 0.06, P.logWarm, [0.36, 0, 0.0], door).position.set(0.36, -0.15, 0.0);
  for (let k = 1; k < 4; k++) box(0.012, 1.2, 0.01, P.logDark, [0.18 * k, -0.15, 0.035], door);
  for (const y of [0.25, -0.5]) box(0.7, 0.07, 0.02, P.ink, [0.36, y, 0.04], door);
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 5), P.folkYellow, { bone: door, at: [0.36, -0.1, 0.05] });
  for (const s of [-1, 0, 1]) {
    const e = b.part(new THREE.SphereGeometry(0.06, 8, 6), P.ink, { bone: door, at: [0.36 + s * 0.11, 0.12 + (s ? 0 : 0.06), 0.05] });
    e.scale.set(0.7, 1.2, 0.3);
    const f = b.part(new THREE.SphereGeometry(0.045, 8, 6), s ? P.folkRed : P.folkYellow, { bone: door, at: [0.36 + s * 0.11, 0.12 + (s ? 0 : 0.06), 0.06] });
    f.scale.set(0.7, 1.2, 0.3);
  }
  b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 10), P.ink, { bone: door, at: [0.6, -0.15, 0.06] });

  // windows
  for (const s of [1, -1])
    for (const z of [0.65, -0.65]) {
      const x = s * 1.27, o = s;
      box(0.06, 0.55, 0.5, P.ink, [x, 2.85, z]);
      glow(box(0.04, 0.5, 0.44, P.windowGlow, [x + o * 0.02, 2.85, z]), 1.2);
      box(0.03, 0.5, 0.03, P.cream, [x + o * 0.045, 2.85, z]);
      box(0.03, 0.03, 0.44, P.cream, [x + o * 0.045, 2.85, z]);
      for (const zz of [-1, 1]) box(0.08, 0.6, 0.07, P.folkRed, [x + o * 0.03, 2.85, z + zz * 0.3]);
      box(0.08, 0.06, 0.5, P.folkRed, [x + o * 0.03, 2.54, z]);
      box(0.09, 0.1, 0.62, P.folkBlue, [x + o * 0.04, 3.2, z]);
      for (let k = -2; k <= 2; k++) {
        ball(0.04, P.folkBlue, [x + o * 0.05, 3.14, z + k * 0.12]);
        ball(0.014, P.folkYellow, [x + o * 0.09, 3.2, z + k * 0.12]);
      }
      for (const zz of [-1, 1]) {
        box(0.04, 0.58, 0.2, P.folkBlue, [x + o * 0.12, 2.85, z + zz * 0.45], hut, [0, 0, 0]);
        ball(0.04, P.cream, [x + o * 0.15, 2.85, z + zz * 0.45]);
        box(0.02, 0.2, 0.02, P.cream, [x + o * 0.15, 2.76, z + zz * 0.45]);
        ball(0.03, P.cream, [x + o * 0.15, 2.93, z + zz * 0.45 + 0.04]);
        ball(0.03, P.cream, [x + o * 0.15, 2.93, z + zz * 0.45 - 0.04]);
      }
    }

  // porch
  box(1.2, 0.15, 0.6, P.logWarm, [0, 2.075, 1.65]);
  for (let k = -2; k <= 2; k++) box(0.012, 0.01, 0.6, P.logDark, [k * 0.2 + 0.1, 2.155, 1.65]);
  for (const s of [1, -1]) {
    box(0.1, 0.8, 0.1, P.logWarm, [s * 0.55, 2.55, 1.9]);
    b.part(new THREE.SphereGeometry(0.09, 8, 6), P.folkYellow, { bone: hut, at: [s * 0.55, 3.0, 1.9] }).scale.set(1, 1.2, 1);
    b.part(new THREE.ConeGeometry(0.04, 0.12, 6), P.folkRed, { bone: hut, at: [s * 0.55, 3.14, 1.9] });
    box(0.05, 0.05, 0.6, P.folkRed, [s * 0.55, 2.8, 1.65]);
  }
  box(1.1, 0.06, 0.05, P.folkRed, [0, 2.8, 1.9]);
  box(1.1, 0.04, 0.05, P.folkBlue, [0, 2.4, 1.9]);

  // stair: top (y2.0,z1.95) to bottom (0.15, 2.75)
  const dy = 1.85, dz = 0.8, len = Math.hypot(dy, dz), ang = Math.atan2(dz, dy) * 180 / Math.PI;
  for (const s of [1, -1]) {
    box(0.07, len, 0.1, P.logDark, [s * 0.35, 1.075, 2.35], hut, [ang, 0, 0]);
    for (let k = 0; k < 9; k++) {
      const t = (k + 0.5) / 9.5;
      tri(0.04, 0.07, k % 2 ? P.folkBlue : P.folkRed, [s * 0.395, 1.9 - t * 1.7, 2.0 + t * 0.7], 0);
    }
  }
  for (let k = 0; k < 9; k++) {
    const t = (k + 1) / 9.5;
    box(0.7, 0.05, 0.18, P.logWarm, [0, 2.0 - t * 1.85, 1.95 + t * 0.8]);
  }

  // towel
  box(0.26, 0.5, 0.02, P.cream, [0.75, 2.85, 1.42]);
  box(0.26, 0.05, 0.022, P.folkRed, [0.75, 2.7, 1.425]);
  box(0.26, 0.05, 0.022, P.folkRed, [0.75, 3.0, 1.425]);
  for (let k = 0; k < 4; k++) tri(0.035, 0.06, P.folkRed, [0.67 + k * 0.053, 2.58, 1.425], 180);
  box(0.3, 0.025, 0.04, P.logDark, [0.75, 3.12, 1.43]);
  // sill studs
  for (let k = -5; k <= 5; k++) ball(0.025, P.folkYellow, [k * 0.27, 2.05, 1.62 + (Math.abs(k) > 2 ? 0 : 0.0)]);
}
```

<!-- call: propsAndWoods -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPropsAndWoods({ b, J, P, M }: any) {
  const R = rng(11);
  const G = 0.15;
  const base = J.base;
  const hut = J.hut;
  const part = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: base, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 7) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const leaf = (w: number, h: number, t = 0.03) =>
    new THREE.ExtrudeGeometry(
      new THREE.Shape()
        .moveTo(0, 0)
        .quadraticCurveTo(w, h * 0.4, 0, h)
        .quadraticCurveTo(-w, h * 0.4, 0, 0),
      { depth: t, bevelEnabled: false, curveSegments: 3 },
    );

  // BIRCHES
  const birch = (x: number, z: number, seed: number) => {
    const r = rng(seed);
    const H = 4.6;
    part(cyl(0.07, 0.14, H, 7), P.birchWhite, [x, G + H / 2, z]);
    for (let i = 0; i < 14; i++) {
      const y = G + 0.3 + i * 0.3;
      const a = r() * 6.28;
      const rad = 0.14 - (0.07 * (y - G)) / H;
      part(new THREE.BoxGeometry(0.14, 0.035, 0.02), P.ink, [x + Math.sin(a) * rad, y, z + Math.cos(a) * rad], {
        rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    const tops: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 6.28 + seed;
      const y0 = G + 2.4 + i * 0.4;
      const tip = [x + Math.sin(a) * 0.9, y0 + 0.8, z + Math.cos(a) * 0.9];
      b.rod([x, y0, z], tip, [0.04, 0.02], { color: P.birchWhite, bone: base });
      tops.push(tip);
      if (i === 1) {
        const m = [(x + tip[0]) / 2, (y0 + tip[1]) / 2 - 0.0, (z + tip[2]) / 2];
        part(new THREE.BoxGeometry(0.08, 0.3, 0.02), P.folkRed, [m[0], m[1] - 0.15, m[2]]);
        for (let k = 0; k < 3; k++)
          part(new THREE.ConeGeometry(0.04, 0.06, 3), k % 2 ? P.folkBlue : P.folkRed, [m[0], m[1] - 0.33 + 0.0, m[2]], {
            rotation: [180, 0, 0],
          });
      }
    }
    tops.push([x, G + H - 0.2, z]);
    for (let i = 0; i < 11; i++) {
      const t = tops[i % tops.length];
      const c = i % 4 === 0 ? P.folkYellow : P.green;
      const p = [t[0] + (r() - 0.5) * 0.6, t[1] + 0.1 + r() * 0.5, t[2] + (r() - 0.5) * 0.6];
      part(sph(0.4 + r() * 0.2, 6, 4), c, p, { scale: [1, 0.6, 1] });
      part(sph(0.03, 4, 3), P.cream, [p[0] + 0.15, p[1] + 0.3, p[2] + 0.25]);
      part(sph(0.03, 4, 3), P.cream, [p[0] - 0.2, p[1] + 0.28, p[2] - 0.1]);
    }
    for (let i = 0; i < 4; i++)
      part(leaf(0.15, 0.4), P.green, [x + (r() - 0.5) * 1.2, G + 3.6 + r() * 0.8, z + (r() - 0.5) * 1.2], {
        rotation: [r() * 60 - 30, r() * 360, 0],
      });
  };
  birch(M.birchBackL[0], M.birchBackL[2], 3);
  birch(M.birchBackR[0], M.birchBackR[2], 8);

  // MORTAR
  const [mx, , mz] = M.mortarSpot;
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.22, 0.2],
      [0.4, 0.55],
      [0.32, 0.55],
      [0.16, 0.25],
      [0, 0.25],
    ],
    { at: [mx, G, mz], color: P.stone, bone: base, segments: 8 },
  );
  part(cyl(0.3, 0.27, 0.07, 8), P.folkRed, [mx, G + 0.28, mz]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28;
    part(sph(0.025, 4, 3), P.cream, [mx + Math.sin(a) * 0.31, G + 0.28, mz + Math.cos(a) * 0.31]);
  }
  part(cyl(0.12, 0.12, 0.02, 8), P.folkYellow, [mx, G + 0.28, mz + 0.3], { dir: [0, 0, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28;
    part(sph(0.03, 4, 3), P.folkOrange, [mx + Math.sin(a) * 0.1, G + 0.28 + Math.cos(a) * 0.1, mz + 0.32]);
  }
  part(sph(0.04, 4, 3), P.cream, [mx, G + 0.28, mz + 0.33]);
  b.rod([mx, G + 0.3, mz], [mx + 0.45, G + 1.2, mz + 0.1], 0.06, { color: P.logWarm, bone: base });
  part(sph(0.08, 6, 4), P.folkRed, [mx + 0.45, G + 1.2, mz + 0.1]);
  b.rod([mx + 0.5, G, mz - 0.3], [mx + 0.6, G + 1.0, mz - 0.1], 0.025, { color: P.logDark, bone: base });
  for (let i = 0; i < 6; i++)
    b.spike([mx + 0.6, G + 0.6, mz - 0.1], [(i - 2.5) * 0.04, -1, (i % 2) * 0.1 - 0.1], 0.6, 0.03, {
      color: i % 2 ? P.logWarm : P.logDark,
      bone: base,
    });
  part(cyl(0.05, 0.05, 0.06, 6), P.folkRed, [mx + 0.58, G + 0.6, mz - 0.1]);

  // MUSHROOMS
  const mush = (x: number, z: number, s: number) => {
    part(cyl(0.025 * s, 0.035 * s, 0.12 * s, 6), P.cream, [x, G + 0.06 * s, z]);
    part(new THREE.SphereGeometry(0.08 * s, 7, 4, 0, 6.28, 0, 1.57), P.folkRed, [x, G + 0.1 * s, z]);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      part(sph(0.012 * s, 4, 3), P.cream, [x + Math.sin(a) * 0.04 * s, G + 0.17 * s, z + Math.cos(a) * 0.04 * s]);
    }
  };
  [[-2, 1.6, 1.5], [-1.8, 1.8, 1], [-2.2, 1.9, 0.8], [-1.7, 1.4, 1.2], [1.8, -2.1, 1.3], [2.1, -1.9, 0.9], [1.6, -2.2, 1]].forEach(
    (m) => mush(m[0], m[1], m[2]),
  );

  // FLOWERS
  const cols = [P.folkRed, P.folkBlue, P.folkYellow];
  const spots = [[-1, 2.4], [1.3, 2.3], [-2.4, 0.5], [2.5, 0.2], [-2.5, -1.6], [0.5, -2.5], [-1, -2.4], [2.3, 1.6], [-2.2, 2.0]];
  spots.forEach((s, i) => {
    const h = 0.4 + (i % 3) * 0.1;
    b.rod([s[0], G, s[1]], [s[0], G + h, s[1]], 0.012, { color: P.green, bone: base });
    part(leaf(0.05, 0.15, 0.01), P.green, [s[0], G + 0.08, s[1]], { rotation: [0, 0, 40] });
    part(leaf(0.05, 0.15, 0.01), P.green, [s[0], G + 0.12, s[1]], { rotation: [0, 0, -40] });
    for (let k = 0; k < 4; k++)
      part(leaf(0.05, 0.13, 0.01), cols[i % 3], [s[0], G + h, s[1]], { rotation: [90, k * 90, 0], dir: [Math.sin(k * 1.57), 0.3, Math.cos(k * 1.57)] });
    part(sph(0.03, 5, 3), i % 3 === 2 ? P.folkOrange : P.folkYellow, [s[0], G + h, s[1] + 0.02]);
  });

  // STONES, STUMP, TUFTS
  [[2.6, 0.6, 0.2], [-2.6, 0.2, 0.25], [1.8, 2.4, 0.15], [-0.4, -2.6, 0.2]].forEach((s) =>
    part(sph(s[2], 5, 4), P.stone, [s[0], G + s[2] * 0.4, s[1]], { scale: [1, 0.7, 1] }),
  );
  part(cyl(0.22, 0.26, 0.3, 7), P.logDark, [-1.8, G + 0.15, -2]);
  part(cyl(0.2, 0.2, 0.02, 7), P.logEnd, [-1.8, G + 0.3, -2]);
  part(cyl(0.1, 0.1, 0.02, 7), P.logWarm, [-1.8, G + 0.31, -2]);
  for (let i = 0; i < 8; i++) {
    const x = -2.2 + R() * 4.4, z = -2.2 + R() * 2;
    for (let k = 0; k < 3; k++)
      b.spike([x + k * 0.03, G, z], [(k - 1) * 0.3, 1, 0], 0.18, 0.015, { color: P.green, bone: base });
  }

  // RAVEN at az 270 stake (x=-3, z=0), height ~1.3
  const rx = -3, ry = G + 1.45;
  part(sph(0.12, 6, 4), P.ink, [rx, ry + 0.1, 0], { scale: [1, 0.9, 1.4] });
  part(sph(0.07, 6, 4), P.ink, [rx, ry + 0.22, 0.12]);
  part(new THREE.ConeGeometry(0.03, 0.12, 4), P.folkYellow, [rx, ry + 0.21, 0.24], { dir: [0, 0, 1] });
  part(new THREE.ConeGeometry(0.05, 0.22, 4), P.ink, [rx, ry + 0.05, -0.22], { dir: [0, 0, -1] });
  part(sph(0.015, 4, 3), P.cream, [rx + 0.04, ry + 0.24, 0.17]);
  part(sph(0.015, 4, 3), P.cream, [rx - 0.04, ry + 0.24, 0.17]);

  // CAT on porch (rides hut)
  const [cx, cy, cz] = M.catSpot;
  const hp = (geo: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(geo, c, { bone: hut, at, flat: true, ...o });
  hp(sph(0.13, 6, 5), P.ink, [cx, cy + 0.14, cz], { scale: [1, 1.2, 1] });
  hp(sph(0.1, 6, 5), P.ink, [cx, cy + 0.36, cz + 0.02]);
  for (const s of [1, -1]) {
    hp(new THREE.ConeGeometry(0.04, 0.09, 4), P.ink, [cx + s * 0.06, cy + 0.46, cz + 0.02]);
    glow(hp(sph(0.022, 4, 3), P.glowEye, [cx + s * 0.04, cy + 0.38, cz + 0.1]));
  }
  hp(new THREE.ConeGeometry(0.015, 0.03, 3), P.folkRed, [cx, cy + 0.34, cz + 0.12], { dir: [0, 0, 1] });
  b.sweep([[cx - 0.1, cy + 0.04, cz - 0.05], [cx - 0.2, cy + 0.05, cz + 0.1], [cx - 0.22, cy + 0.2, cz + 0.2], [cx - 0.15, cy + 0.32, cz + 0.15]], [0.035, 0.02], {
    color: P.ink,
    bone: hut,
  });
}
```

<!-- call: chickenLegs -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildChickenLegs({ b, J, P }: any) {
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipJ = J["hip" + side], kneeJ = J["knee" + side], ankJ = J["ankle" + side], footJ = J["foot" + side];
    const hip = V(0.7 * s, 1.95, 0), knee = V(0.8 * s, 1.3, 0.55), ank = V(0.75 * s, 0.85, -0.25), foot = V(0.75 * s, 0.22, 0.25);

    // thigh
    const thighTop = hip.clone().add(V(0.02 * s, -0.15, 0.05));
    b.sweep([thighTop, knee], [0.28, 0.17], { color: P.featherA, bone: hipJ, caps: "round" });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.featherA, { at: [hip.x, 1.78, 0.02], scale: [1, 0.65, 1], bone: hipJ });
    const ax = knee.clone().sub(thighTop).normalize();
    const u = V(1, 0, 0).cross(ax).normalize(), v = ax.clone().cross(u).normalize();
    for (let i = 0; i < 18; i++) {
      const t = 0.08 + 0.85 * ((i * 0.37) % 1);
      const ang = (i / 18) * Math.PI * 2 + R() * 0.3;
      const c = thighTop.clone().lerp(knee, t);
      const rad = 0.28 + (0.17 - 0.28) * t;
      const dir = u.clone().multiplyScalar(Math.cos(ang)).add(v.clone().multiplyScalar(Math.sin(ang)));
      const base = c.clone().addScaledVector(dir, rad * 0.9);
      const d = dir.clone().multiplyScalar(0.45).addScaledVector(ax, 0.8).add(V(0, 0, -0.15)).normalize();
      b.spike(base, d, 0.26 + 0.06 * R(), 0.075, { color: t < 0.5 ? P.featherA : P.featherB, bone: hipJ, sides: 5 } as any);
    }
    // knee ruff
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const dir = u.clone().multiplyScalar(Math.cos(ang)).add(v.clone().multiplyScalar(Math.sin(ang)));
      b.spike(knee.clone().addScaledVector(dir, 0.14), dir.clone().multiplyScalar(0.4).addScaledVector(ax, 0.9), 0.3, 0.06, { color: P.featherB, bone: kneeJ, sides: 5 } as any);
    }
    b.part(new THREE.BoxGeometry(0.26, 0.24, 0.26), P.scaleDark, { at: knee.toArray(), bone: kneeJ });

    // shin + tarsus
    b.sweep([knee, ank], [0.11, 0.1], { color: P.scaleYellow, bone: kneeJ, caps: "round" });
    b.sweep([ank, foot], [0.1, 0.09], { color: P.scaleYellow, bone: ankJ, caps: "round" });
    b.part(new THREE.BoxGeometry(0.22, 0.2, 0.22), P.scaleDark, { at: ank.toArray(), bone: ankJ });
    b.spike(ank.clone().add(V(0, 0, -0.08)), V(0, -0.3, -1), 0.2, 0.05, { color: P.ink, bone: ankJ, sides: 6 } as any);

    const segs: [THREE.Vector3, THREE.Vector3, any, number][] = [[knee, ank, kneeJ, 0.105], [ank, foot, ankJ, 0.095]];
    for (const [a0, a1, bone, r] of segs) {
      const a = a1.clone().sub(a0), len = a.length(); a.normalize();
      const n = a.clone().cross(V(1, 0, 0)); if (n.z < 0) n.negate(); n.normalize();
      for (let i = 0; i < 5; i++) {
        const c = a0.clone().addScaledVector(a, len * (0.15 + i * 0.17)).addScaledVector(n, r * 0.95);
        b.part(new THREE.BoxGeometry(0.15, 0.1, 0.035), i % 2 ? P.scaleDark : P.scaleYellow, { at: c.toArray(), dir: a.toArray(), bone, flat: true, up: n.toArray() });
      }
    }
    // bracelet
    {
      const a = foot.clone().sub(ank).normalize();
      const c = ank.clone().addScaledVector(a, 0.2);
      b.part(new THREE.TorusGeometry(0.105, 0.025, 5, 12), P.folkRed, { at: c.toArray(), dir: a.toArray(), axis: "z", bone: ankJ });
      const p1 = V(1, 0, 0).cross(a).normalize(), p2 = a.clone().cross(p1);
      for (let i = 0; i < 7; i++) {
        const g = (i / 7) * Math.PI * 2;
        const q = c.clone().addScaledVector(p1, Math.cos(g) * 0.125).addScaledVector(p2, Math.sin(g) * 0.125);
        b.part(new THREE.SphereGeometry(0.014, 4, 3), P.cream, { at: q.toArray(), bone: ankJ });
      }
    }

    // toes
    const toes = [[0.4 * s, 0.8, 0.52], [0, 0.95, 0.55], [-0.4 * s, 0.8, 0.52], [0, -0.6, 0.32]];
    toes.forEach((t, k) => {
      const d = V(t[0], -0.02, t[1]).normalize();
      const L = t[2];
      const tj = J["toe" + side + (k + 1)];
      const tip = foot.clone().addScaledVector(d, L);
      b.sweep([foot, tip], [0.08, 0.05], { color: P.scaleYellow, bone: tj, caps: "round", sides: 6 } as any);
      for (let i = 1; i <= (k === 3 ? 2 : 3); i++) {
        b.part(new THREE.SphereGeometry(0.065 - i * 0.008, 6, 4), P.scaleDark, { at: foot.clone().addScaledVector(d, L * i * 0.27).add(V(0, 0.04, 0)).toArray(), bone: tj });
      }
      b.part(new THREE.BoxGeometry(0.09, 0.03, L * 0.5), P.scaleDark, { at: foot.clone().addScaledVector(d, L * 0.5).add(V(0, -0.075, 0)).toArray(), dir: d.toArray(), axis: "z", bone: tj });
      const big = k === 3;
      const tdir = d.clone().multiplyScalar(0.8).add(V(0, big ? -0.7 : -0.6, 0)).normalize();
      b.spike(tip.clone().addScaledVector(d, 0.0).add(V(0, 0.01, 0)), tdir, big ? 0.22 : 0.19, big ? 0.06 : 0.045, { color: P.ink, bone: tj, sides: 6 } as any);
    });
    // earth lumps and dots
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.05 + 0.03 * R(), 5, 4), P.earth, { at: [foot.x + (R() - 0.5) * 0.4, 0.2, foot.z + 0.1 + R() * 0.35], bone: footJ });
    }
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), i % 2 ? P.folkOrange : P.folkYellow, { at: [foot.x, 0.3 + 0, foot.z + 0.1 + i * 0.1], bone: footJ });
    }
  }
}
```