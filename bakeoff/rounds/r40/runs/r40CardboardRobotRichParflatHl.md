<!-- call: plan -->

```json
{
  "name": "Cardboard Box Robot Kid",
  "description": "A cheerful kid in a homemade corrugated-cardboard robot costume, standing in a T-pose with a face window in the box helmet, foil-wrapped tube sleeves, bottle-cap dials and duct-tape seams.",
  "builderName": "cardboardRobotKid",
  "size": [1.52, 1.46, 0.42],
  "layout": "Kid about 1.2 m tall in the box, 1.46 m with the antennas. Front is +Z, left is +X. From the floor up: red sneakers (y 0 to 0.08); cardboard shin boxes over blue leggings (to 0.30); bare knees and thighs of leggings to the torso box bottom (y 0.52); the big torso box (y 0.52 to 1.02, 0.52 wide, 0.38 deep) with a control panel on the front; a smaller helmet box (y 1.02 to 1.36, 0.42 wide, 0.39 deep) sitting on top. The kid's face shows through a rectangular window cut in the front of the helmet. Arms stick out sideways through round holes in the torso box sides at y 0.92, in a T-pose with palms down, wearing foil-wrapped cardboard-tube sleeves with open fingers. Everything built by the costume is flat-shaded cardboard craft: kraft-brown box faces with a lighter inner-corrugation colour on every cut edge (a thin darker-brown layer strip along the cut rim of every hole and flap, showing the wavy corrugation as small ridge parts), tan masking-tape strips across all seams and corners, dark marker outlines and hand-drawn symbols, bottle-cap and button lights in bright colours, silver foil on tubes, and white hot-glue blobs at joins. Shapes are chunky, slightly imperfect boxes: flaps a few degrees off square, tape strips a bit crooked. The kid is a stylised chunky child with a big head, round cheeks and big eyes. Only the legs touch the floor.",
  "palette": {
    "kraft": "#b98a54",
    "kraftLight": "#d1a76e",
    "kraftDark": "#8a6238",
    "corrugation": "#a6763f",
    "innerBoard": "#c99a5f",
    "tape": "#e4cf9c",
    "tapeDark": "#c8b07a",
    "marker": "#2b2420",
    "markerRed": "#d8443a",
    "markerBlue": "#3a6fc4",
    "foil": "#c9ced6",
    "foilDark": "#8f96a3",
    "foilShine": "#f2f5fa",
    "paper": "#f2ead8",
    "glue": "#f6f1de",
    "lampYellow": "#ffd84a",
    "lampRed": "#e8433a",
    "lampGreen": "#58c46a",
    "lampCyan": "#4fd8f0",
    "skin": "#f1c49b",
    "skinShade": "#e0a47c",
    "cheek": "#f08a7a",
    "hair": "#5a3a22",
    "eyeWhite": "#fbf7ee",
    "iris": "#4a8a6a",
    "lips": "#d9695f",
    "mouthDark": "#8a3a3a",
    "shirt": "#f2c14e",
    "leggings": "#3d5fa8",
    "sneaker": "#d34a3a",
    "sole": "#f4efe2"
  },
  "mounts": {
    "hips": [0, 0.55, 0],
    "torsoBottom": [0, 0.52, 0],
    "torsoFrontPanel": [0, 0.76, 0.19],
    "neckBase": [0, 1.02, 0],
    "headCenter": [0, 1.19, 0.03],
    "faceWindow": [0, 1.19, 0.2],
    "helmetTop": [0, 1.36, 0],
    "jawPivot": [0, 1.13, 0.02],
    "shoulderL": [0.26, 0.92, 0],
    "shoulderR": [-0.26, 0.92, 0],
    "elbowL": [0.44, 0.92, 0],
    "elbowR": [-0.44, 0.92, 0],
    "wristL": [0.62, 0.92, 0],
    "wristR": [-0.62, 0.92, 0],
    "hipL": [0.08, 0.55, 0],
    "hipR": [-0.08, 0.55, 0],
    "kneeL": [0.08, 0.3, 0.01],
    "kneeR": [-0.08, 0.3, 0.01],
    "ankleL": [0.08, 0.09, 0],
    "ankleR": [-0.08, 0.09, 0]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.55, 0], "dir": [0, 1, 0], "role": "spine", "group": "body" },
    { "name": "spine", "parent": "hips", "at": [0, 0.7, 0], "dir": [0, 1, 0], "role": "spine", "group": "body" },
    { "name": "chest", "parent": "spine", "at": [0, 0.86, 0], "dir": [0, 1, 0], "role": "spine", "group": "body" },
    { "name": "neck", "parent": "chest", "at": [0, 1.0, 0], "dir": [0, 1, 0], "role": "neck", "group": "head" },
    { "name": "head", "parent": "neck", "at": [0, 1.06, 0], "dir": [0, 1, 0], "role": "head", "group": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.13, 0.02], "dir": [0, 0, 1], "role": "jaw", "group": "head" },

    { "name": "shoulderL", "parent": "chest", "at": [0.24, 0.92, 0], "dir": [1, 0, 0], "role": "arm", "group": "armL" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.44, 0.92, 0], "dir": [1, 0, 0], "role": "arm", "group": "armL" },
    { "name": "wristL", "parent": "elbowL", "at": [0.62, 0.92, 0], "dir": [1, 0, 0], "role": "arm", "group": "armL" },
    { "name": "thumbL", "parent": "wristL", "at": [0.65, 0.915, 0.04], "dir": [0.7, -0.2, 0.7], "role": "digit", "group": "armL" },
    { "name": "indexL", "parent": "wristL", "at": [0.69, 0.925, 0.03], "dir": [1, 0, 0], "role": "digit", "group": "armL" },
    { "name": "middleL", "parent": "wristL", "at": [0.69, 0.925, 0.01], "dir": [1, 0, 0], "role": "digit", "group": "armL" },
    { "name": "ringL", "parent": "wristL", "at": [0.69, 0.92, -0.012], "dir": [1, 0, 0], "role": "digit", "group": "armL" },
    { "name": "pinkyL", "parent": "wristL", "at": [0.68, 0.915, -0.03], "dir": [1, 0, 0], "role": "digit", "group": "armL" },

    { "name": "shoulderR", "parent": "chest", "at": [-0.24, 0.92, 0], "dir": [-1, 0, 0], "role": "arm", "group": "armR" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.44, 0.92, 0], "dir": [-1, 0, 0], "role": "arm", "group": "armR" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.62, 0.92, 0], "dir": [-1, 0, 0], "role": "arm", "group": "armR" },
    { "name": "thumbR", "parent": "wristR", "at": [-0.65, 0.915, 0.04], "dir": [-0.7, -0.2, 0.7], "role": "digit", "group": "armR" },
    { "name": "indexR", "parent": "wristR", "at": [-0.69, 0.925, 0.03], "dir": [-1, 0, 0], "role": "digit", "group": "armR" },
    { "name": "middleR", "parent": "wristR", "at": [-0.69, 0.925, 0.01], "dir": [-1, 0, 0], "role": "digit", "group": "armR" },
    { "name": "ringR", "parent": "wristR", "at": [-0.69, 0.92, -0.012], "dir": [-1, 0, 0], "role": "digit", "group": "armR" },
    { "name": "pinkyR", "parent": "wristR", "at": [-0.68, 0.915, -0.03], "dir": [-1, 0, 0], "role": "digit", "group": "armR" },

    { "name": "hipL", "parent": "hips", "at": [0.08, 0.55, 0], "dir": [0, -1, 0], "role": "leg", "group": "legL" },
    { "name": "kneeL", "parent": "hipL", "at": [0.08, 0.3, 0.01], "dir": [0, -1, 0], "role": "leg", "group": "legL" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.08, 0.09, 0], "dir": [0, -1, 0], "role": "leg", "group": "legL" },
    { "name": "toeL", "parent": "ankleL", "at": [0.08, 0.05, 0.07], "dir": [0, 0, 1], "role": "leg", "group": "legL" },
    { "name": "hipR", "parent": "hips", "at": [-0.08, 0.55, 0], "dir": [0, -1, 0], "role": "leg", "group": "legR" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.08, 0.3, 0.01], "dir": [0, -1, 0], "role": "leg", "group": "legR" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.08, 0.09, 0], "dir": [0, -1, 0], "role": "leg", "group": "legR" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.08, 0.05, 0.07], "dir": [0, 0, 1], "role": "leg", "group": "legR" }
  ],
  "parts": [
    {
      "id": "kidHead",
      "builds": "The kid's own head and neck, seen through the helmet's face window. Chunky stylised child: a rounded-box skull about 0.19 wide, 0.23 tall and 0.2 deep centred on headCenter, a short neck cylinder from the torso down to the head (skin, with a little skinShade under the chin), and a separate lower jaw/chin piece on the jaw joint so the mouth can open. Face on the front (z about 0.13): two big readable eyes (eyeWhite ellipsoid, iris disc, dark pupil, tiny white highlight, small marker-brown upper lid line), thin brows in hair colour, a small button nose, round cheek blobs in cheek colour with a few freckle dots in skinShade, an upper lip and lower lip (lips colour) with a dark mouth gap and two small white front teeth in a happy open grin. Small ears at the sides (inside the helmet, partly hidden). Messy hair in hair colour: a solid cap on the skull plus 8 to 12 overlapping spiky tufts sticking up and out, a fringe over the brow, and a tuft at the back; the hair stays inside the helmet box (below y 1.35). Keep everything inside x +-0.1, below the helmet top, and nothing in front of z 0.15 so the face reads through the window.",
      "box": [[-0.1, 1.0, -0.1], [0.1, 1.32, 0.15]],
      "attaches": "Neck rides neck and head joints and starts at neckBase (hidden in the torso top); skull is centred on headCenter and rides head; the lower jaw rides jaw at jawPivot. The helmet part surrounds it without touching.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "helmetBox",
      "builds": "The cardboard box helmet around the kid's head: five thin kraft slabs (left, right, back, top, front with a rectangular window about 0.24 wide x 0.22 tall centred on faceWindow, built as frame strips around the opening) forming a box x +-0.21, y 1.02 to 1.36, z -0.19 to 0.2, open at the bottom. Cut edges of the window show a lighter innerBoard rim with small corrugation ridge strips. Details: two tape strips across the top seam and one down the front corner; marker-drawn eyebrow-shaped angry/friendly slits above the window; hand-drawn marker grille mouth lines under the window; round ear dials on each side (a kraftDark disc with a foil bottle-cap, a marker tick mark ring and a pointer) at x +-0.21; two antennas on top (a thin foil-wrapped skewer rod with a coiled spring-like wire, topped with a lampRed and a lampYellow bottle-cap ball), the left one a little taller; a small egg-carton-style lampCyan cup light on the top front; a foil-wrapped disc 'speaker' on the top back; a paper label with marker scribble 'ROBO' lettering built from small marker bars on the helmet forehead strip; white hot-glue blobs at corners; bottom front edge flap folded slightly outward. Everything seated on the box faces.",
      "box": [[-0.23, 1.02, -0.2], [0.23, 1.46, 0.22]],
      "attaches": "Sits on the torso's top rim at neckBase height y 1.02 and rides the head joint; window centred on faceWindow in front of kidHead; helmetTop mount is the top face for the antennas.",
      "joints": ["head"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "torsoBox",
      "builds": "The big cardboard torso box x +-0.26, y 0.52 to 1.02, z -0.19 to 0.19, built from thick kraft slabs with visible corrugated cut edges (thin darker strips plus tiny ridge bars) around the open top and bottom, riding the chest and hips joints. Round arm holes at x +-0.26, y 0.92, radius 0.055, each with a rim of innerBoard and a ring of small corrugation ridges. Front control panel on torsoFrontPanel: a slightly raised kraftLight rectangular plate 0.34 wide x 0.3 tall, outlined with marker, holding a row of 3 bottle-cap lights (lampRed, lampYellow, lampGreen) with marker outline rings, two round dials (foil disc with marker tick marks and a pointer), a grid of 6 square paper-and-marker buttons, a lampCyan display strip with a marker zig-zag waveform, a hand-drawn marker heart and a small marker-red 'ON' lever with a crooked handle, and a sliding paper label. Side faces: marker-drawn gear symbol and rivet dots; back: a tape-attached foil 'battery pack' box with a coiled wire loop and two lamp bulbs. Tape strips across seams and each vertical corner, crooked; hot-glue blobs; cardboard shoulder flaps folded up and out of the top rim at x +-0.24 (not covering the helmet); two shirt-yellow strap loops over the shoulders visible at the top rim front and back; a bottom rim with a few folded flaps and a leggings-coloured shorts waist peeking just below the box between the legs. All details are separate parts in their own colours seated on the faces.",
      "box": [[-0.27, 0.5, -0.2], [0.27, 1.06, 0.23]],
      "attaches": "Top rim at y 1.02 supports the helmetBox at neckBase; arm holes at shoulderL/shoulderR let the arms' sleeves exit; bottom rim at torsoBottom y 0.52 where the legs leave at hipL/hipR.",
      "joints": ["hips", "spine", "chest"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "armsAndHands",
      "builds": "Both arms in an extended T-pose with palms down along x from the torso holes: from each shoulder a shirt-yellow sleeve stub pokes out of the arm hole (x 0.25 to 0.3), then a cardboard-tube upper-arm sleeve wrapped in foil (foil colour with foilShine highlight strips and foilDark crinkle ridge parts, 8-sided tube, radius about 0.05) to the elbow, an elbow gap of shirt-yellow showing at elbowL/elbowR, then a forearm foil tube (radius about 0.047) ending at the wrist with a kraft cardboard cuff ring (tube slice) plus tape band and a bottle-cap lamp (lampRed on the left cuff, lampGreen on the right) on the cuff top. Hands are kid skin: a chunky palm block and four fingers (index, middle, ring, pinky) each a two-segment capsule and a thumb angled forward/down, spread slightly and extended, with tiny knuckle dots and small nails in skinShade, on the finger and thumb joints. Add a few marker dashes and white glue blobs on the foil sleeves and a strip of tape spiralling on each upper arm. Left arm at +X, right arm at -X, mirrored.",
      "box": [[-0.77, 0.84, -0.08], [0.77, 1.0, 0.09]],
      "attaches": "Roots at shoulderL/shoulderR just inside the torso arm holes and runs outward along x through elbowL/R and wristL/R to the fingertips; joints are the shoulder, elbow, wrist and digit joints of each side.",
      "joints": ["shoulderL", "elbowL", "wristL", "thumbL", "indexL", "middleL", "ringL", "pinkyL", "shoulderR", "elbowR", "wristR", "thumbR", "indexR", "middleR", "ringR", "pinkyR"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legsAndShoes",
      "builds": "Both legs standing straight and slightly apart (feet at x +-0.08, toes forward), for floor contact. Blue leggings tubes (leggings colour, radius about 0.055 thigh tapering to 0.045 at the shin) from the hips at y 0.55 down through knees at y 0.3 to the ankles, with small knee patches in a slightly lighter blue. Over each shin a cardboard 'robot boot' box (kraft slabs, 0.14 wide x 0.22 tall x 0.15 deep, y 0.09 to 0.3) with a corrugated cut rim at top and bottom, a tape strip across the front, a marker-drawn bolt cross or arrow, and a small bottle-cap lamp (lampYellow on left, lampCyan on right) on the front, plus white glue blobs. Below, chunky red sneakers (sneaker colour) with white soles (sole colour, flat slab y 0 to 0.025), a rounded toe cap bump extending forward to about z 0.17, a tongue and lace pieces in paper colour, a heel tab, and small marker scuff marks. Mirror left (+X) and right (-X). Feet lowest points rest on y = 0.",
      "box": [[-0.16, 0.0, -0.07], [0.16, 0.56, 0.18]],
      "attaches": "Thighs start inside the torso box at hipL/hipR (y 0.55) and leave its bottom at torsoBottom y 0.52; chains pass through kneeL/R and ankleL/R to toeL/R; the shin boxes are centred on the shin between knee and ankle.",
      "joints": ["hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": true,
      "budget": 170
    }
  ]
}
```

<!-- call: legsAndShoes -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLegsAndShoes({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(g, c, { at, bone, rotation: rot, flat: true });

  for (const s of [1, -1]) {
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const ankle = s > 0 ? J.ankleL : J.ankleR;
    const toe = s > 0 ? J.toeL : J.toeR;
    const x = s * 0.08;

    // leggings: thigh and shin tubes
    b.rod([x, 0.56, 0], [x, 0.3, 0.01], [0.055, 0.05], P.leggings, { bone: hip, sides: 8 });
    b.rod([x, 0.3, 0.01], [x, 0.1, 0], [0.047, 0.045], P.leggings, { bone: knee, sides: 8 });
    put(new THREE.SphereGeometry(0.05, 8, 6), P.leggings, [x, 0.3, 0.012], knee);
    put(box(0.05, 0.045, 0.012), "#5577bb", [x, 0.3, 0.058], knee);

    // cardboard shin boot
    const cy = 0.195;
    put(box(0.14, 0.21, 0.15), P.kraft, [x, cy, 0.005], knee);
    for (const t of [0.3, 0.09]) {
      put(box(0.15, 0.012, 0.16), P.kraftDark, [x, t - (t > 0.2 ? 0.006 : -0.006), 0.005], knee);
      for (let i = 0; i < 6; i++)
        put(box(0.014, 0.01, 0.006), P.corrugation, [x - 0.06 + i * 0.024, t > 0.2 ? 0.297 : 0.093, 0.085], knee);
    }
    put(box(0.15, 0.04, 0.005), P.tape, [x + s * 0.005, 0.22, 0.083], knee, [0, 0, s * 4]);
    put(box(0.16, 0.012, 0.005), P.tapeDark, [x, 0.22, 0.0855], knee);
    // marker bolt cross
    put(box(0.05, 0.007, 0.004), P.marker, [x, 0.15, 0.082], knee);
    put(box(0.007, 0.05, 0.004), P.marker, [x, 0.15, 0.082], knee);
    // bottle cap lamp
    const lamp = s > 0 ? P.lampYellow : P.lampCyan;
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 10), lamp, [x, 0.265, 0.085], knee, [90, 0, 0]);
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.006, 10), P.marker, [x, 0.265, 0.081], knee, [90, 0, 0]);
    // glue blobs
    for (let i = 0; i < 3; i++)
      put(new THREE.SphereGeometry(0.008, 5, 4), P.glue, [x + (R() - 0.5) * 0.12, 0.1 + R() * 0.18, 0.082], knee);

    // sneaker
    put(box(0.115, 0.025, 0.25), P.sole, [x, 0.0125, 0.055], ankle);
    put(box(0.105, 0.05, 0.2), P.sneaker, [x, 0.05, 0.035], ankle);
    put(new THREE.SphereGeometry(0.052, 8, 6), P.sneaker, [x, 0.04, 0.12], toe);
    put(box(0.11, 0.03, 0.03), P.sole, [x, 0.03, 0.16], toe);
    put(box(0.09, 0.04, 0.09), P.sneaker, [x, 0.085, -0.02], ankle);
    put(box(0.05, 0.012, 0.07), P.paper, [x, 0.082, 0.07], ankle, [-12, 0, 0]);
    for (let i = 0; i < 3; i++) put(box(0.07, 0.006, 0.008), P.paper, [x, 0.074, 0.05 + i * 0.03], ankle);
    put(box(0.05, 0.03, 0.01), P.sneakerDark ?? "#a83626", [x, 0.08, -0.075], ankle);
    for (let i = 0; i < 2; i++)
      put(box(0.02, 0.003, 0.004), P.marker, [x + s * 0.054, 0.04 + i * 0.01, 0.06 + i * 0.03], ankle, [0, 0, 25]);
  }
}
```

<!-- call: armsAndHands -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildArmsAndHands({ b, J, P }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (rad: number) => new THREE.SphereGeometry(rad, 6, 4);
  const Y = 0.92;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side], el = J["elbow" + side], wr = J["wrist" + side];
    const X = [s, 0, 0] as [number, number, number];
    // tube along x: cylinder axis y -> aim x
    const tube = (x0: number, x1: number, rad: number, col: string, bone: any, extra = 0) =>
      b.part(cyl(rad, rad, Math.abs(x1 - x0), 8), col, { bone, at: [s * (x0 + x1) / 2, Y, extra], dir: X, axis: "y" });

    // shirt stub
    tube(0.25, 0.31, 0.043, P.shirt, sh);
    // upper arm foil
    tube(0.31, 0.415, 0.05, P.foil, sh);
    // elbow gap
    tube(0.415, 0.465, 0.04, P.shirt, el);
    // forearm
    tube(0.465, 0.585, 0.047, P.foil, el);
    // foil rim rings
    for (const x of [0.31, 0.415, 0.465, 0.585]) {
      b.part(cyl(0.053, 0.053, 0.008, 8), P.foilDark, { bone: x < 0.44 ? sh : el, at: [s * x, Y, 0], dir: X });
    }
    // shine strips and crinkles
    for (const [x0, x1, bone] of [[0.33, 0.4, sh], [0.48, 0.57, el]] as any) {
      b.part(box(x1 - x0, 0.006, 0.008), P.foilShine, { bone, at: [s * (x0 + x1) / 2, Y + 0.047, 0.012] });
      b.part(box(x1 - x0, 0.006, 0.008), P.foilShine, { bone, at: [s * (x0 + x1) / 2, Y + 0.02, 0.046] });
    }
    for (let i = 0; i < 5; i++) {
      const x = 0.34 + i * 0.015 + r() * 0.01;
      b.part(box(0.006, 0.012, 0.09), P.foilDark, { bone: sh, at: [s * x, Y + 0.047, 0], rotation: [0, r() * 20 - 10, 0] });
    }
    for (let i = 0; i < 5; i++) {
      const x = 0.49 + i * 0.02;
      b.part(box(0.006, 0.012, 0.085), P.foilDark, { bone: el, at: [s * x, Y + 0.044, 0], rotation: [0, r() * 20 - 10, 0] });
    }
    // marker dashes
    for (let i = 0; i < 3; i++) {
      b.part(box(0.02, 0.003, 0.006), P.marker, { bone: el, at: [s * (0.5 + i * 0.03), Y + 0.049, 0.01 - i * 0.01] });
    }
    // tape spiral on upper arm
    for (let i = 0; i < 3; i++) {
      b.part(box(0.022, 0.1, 0.006), P.tape, {
        bone: sh, at: [s * (0.34 + i * 0.03), Y, 0], dir: X, axis: "y", rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }).mesh.rotateX(0.5 + i * 0.1);
    }
    // glue blobs
    for (const x of [0.37, 0.55]) {
      b.part(sph(0.01), P.glue, { bone: x < 0.44 ? sh : el, at: [s * x, Y - 0.02, 0.048] });
    }
    // cuff
    b.part(cyl(0.054, 0.054, 0.04, 8), P.kraft, { bone: wr, at: [s * 0.605, Y, 0], dir: X });
    b.part(cyl(0.057, 0.057, 0.012, 8), P.tape, { bone: wr, at: [s * 0.605, Y, 0], dir: X });
    b.part(cyl(0.02, 0.02, 0.01, 10), s > 0 ? P.lampRed : P.lampGreen, { bone: wr, at: [s * 0.605, Y + 0.058, 0] });
    b.part(cyl(0.024, 0.024, 0.005, 10), P.marker, { bone: wr, at: [s * 0.605, Y + 0.053, 0] });

    // palm
    b.part(box(0.07, 0.025, 0.075), P.skin, { bone: wr, at: [s * 0.655, Y, 0] });
    b.part(box(0.02, 0.024, 0.07), P.skinShade, { bone: wr, at: [s * 0.624, Y, 0] });
    // fingers
    const names = ["index", "middle", "ring", "pinky"];
    const zs = [0.03, 0.01, -0.012, -0.03];
    const lens = [0.04, 0.045, 0.04, 0.032];
    names.forEach((n, i) => {
      const j = J[n + side];
      const l = lens[i];
      b.part(cyl(0.0095, 0.0095, l, 6), P.skin, { bone: j, at: [s * (0.69 + l / 2), Y + 0.005, zs[i]], dir: X });
      b.part(sph(0.0095), P.skin, { bone: j, at: [s * (0.69 + l), Y + 0.005, zs[i]] });
      b.part(cyl(0.0085, 0.0085, l * 0.7, 6), P.skin, { bone: j, at: [s * (0.69 + l + l * 0.35), Y + 0.005, zs[i]], dir: X });
      b.part(sph(0.0085), P.skin, { bone: j, at: [s * (0.69 + l + l * 0.7), Y + 0.005, zs[i]] });
      b.part(box(0.008, 0.003, 0.009), P.skinShade, { bone: j, at: [s * (0.69 + l + l * 0.7), Y + 0.014, zs[i]] });
      b.part(sph(0.005), P.skinShade, { bone: wr, at: [s * 0.69, Y + 0.012, zs[i]] });
    });
    // thumb
    const t = J["thumb" + side];
    const td = [s * 0.7, -0.2, 0.7];
    b.part(cyl(0.011, 0.011, 0.05, 6), P.skin, { bone: t, at: [s * 0.675, Y - 0.005, 0.06], dir: td });
    b.part(sph(0.011), P.skin, { bone: t, at: [s * 0.692, Y - 0.012, 0.078] });
    b.part(box(0.008, 0.003, 0.009), P.skinShade, { bone: t, at: [s * 0.694, Y - 0.002, 0.08] });
  }
}
```

<!-- call: kidHead -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildKidHead({ b, J, P, M }: any) {
  const R = rng(11);
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const hc = M.headCenter as number[];
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, opt: any = {}) =>
    b.part(geo, color, { bone, at, ...opt });
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const H = (dx: number, dy: number, dz: number) => [hc[0] + dx, hc[1] + dy, hc[2] + dz];

  // neck
  put(new THREE.CylinderGeometry(0.052, 0.058, 0.16, 10), P.skin, [0, 1.0, 0], neck);
  put(new THREE.CylinderGeometry(0.054, 0.054, 0.04, 10), P.skinShade, [0, 1.06, 0.005], neck);

  // skull: rounded box via scaled sphere + box
  put(new THREE.BoxGeometry(0.19, 0.2, 0.2), P.skin, H(0, 0.0, 0), head);
  put(sph(0.1, 12, 8), P.skin, H(0, 0.02, 0), head, { scale: [0.95, 1.05, 1] });
  put(sph(0.095, 10, 8), P.skin, H(0, -0.03, 0.01), head, { scale: [1, 0.8, 1] });

  // ears
  for (const s of [1, -1]) {
    put(sph(0.028, 8, 6), P.skin, H(s * 0.096, -0.01, 0), head, { scale: [0.5, 1, 0.9] });
    put(sph(0.015, 6, 5), P.skinShade, H(s * 0.1, -0.01, 0.003), head, { scale: [0.4, 1, 0.8] });
  }

  // eyes
  for (const s of [1, -1]) {
    const x = s * 0.045, y = 0.025, z = 0.098;
    put(sph(0.028, 10, 8), P.eyeWhite, H(x, y, z), head, { scale: [1, 1.15, 0.5] });
    put(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 10), P.iris, H(x, y - 0.002, z + 0.013), head, { dir: [0, 0, 1], axis: "y" });
    put(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 8), P.marker, H(x, y - 0.002, z + 0.016), head, { dir: [0, 0, 1] });
    put(sph(0.004, 5, 4), "#ffffff", H(x + s * 0.006, y + 0.007, z + 0.021), head);
    put(new THREE.BoxGeometry(0.052, 0.006, 0.008), P.marker, H(x, y + 0.03, z + 0.008), head, { rotation: [0, 0, s * -6] });
    put(new THREE.BoxGeometry(0.046, 0.008, 0.008), P.hair, H(x, y + 0.05, z + 0.005), head, { rotation: [0, 0, s * -10] });
    // cheeks + freckles
    put(sph(0.026, 8, 6), P.cheek, H(s * 0.068, -0.03, 0.088), head, { scale: [1, 0.85, 0.5] });
    for (let i = 0; i < 3; i++)
      put(sph(0.004, 4, 3), P.skinShade, H(s * (0.05 + i * 0.012), -0.012 - (i % 2) * 0.01, 0.108), head);
  }

  // nose
  put(sph(0.017, 8, 6), P.skinShade, H(0, -0.012, 0.108), head);
  put(sph(0.014, 8, 6), P.skin, H(0, -0.008, 0.112), head);

  // mouth
  put(new THREE.BoxGeometry(0.06, 0.02, 0.01), P.mouthDark, H(0, -0.06, 0.1), head);
  put(new THREE.BoxGeometry(0.066, 0.009, 0.012), P.lips, H(0, -0.048, 0.103), head);
  for (const s of [1, -1]) put(new THREE.BoxGeometry(0.012, 0.011, 0.006), P.eyeWhite, H(s * 0.008, -0.056, 0.108), head);
  put(new THREE.BoxGeometry(0.01, 0.01, 0.01), P.lips, H(-0.036, -0.052, 0.1), head, { rotation: [0, 0, 20] });
  put(new THREE.BoxGeometry(0.01, 0.01, 0.01), P.lips, H(0.036, -0.052, 0.1), head, { rotation: [0, 0, -20] });

  // jaw (on jaw joint)
  put(new THREE.BoxGeometry(0.15, 0.04, 0.15), P.skin, [0, 1.095, 0.045], jaw);
  put(sph(0.045, 8, 6), P.skin, [0, 1.09, 0.1], jaw, { scale: [1.3, 0.7, 0.8] });
  put(new THREE.BoxGeometry(0.06, 0.009, 0.012), P.lips, [0, 1.1, 0.12], jaw);
  put(new THREE.BoxGeometry(0.02, 0.012, 0.006), P.eyeWhite, [0, 1.108, 0.117], jaw);
  put(new THREE.BoxGeometry(0.1, 0.014, 0.08), P.skinShade, [0, 1.07, 0.06], jaw);

  // hair cap
  put(new THREE.BoxGeometry(0.2, 0.06, 0.21), P.hair, H(0, 0.105, -0.005), head);
  put(sph(0.105, 10, 8), P.hair, H(0, 0.09, -0.01), head, { scale: [0.97, 0.7, 1.02] });
  put(new THREE.BoxGeometry(0.19, 0.12, 0.05), P.hair, H(0, 0.04, -0.09), head);
  put(new THREE.BoxGeometry(0.19, 0.035, 0.03), P.hair, H(0, 0.082, 0.1), head);
  // fringe
  for (let i = 0; i < 5; i++) {
    const x = -0.075 + i * 0.0375;
    put(new THREE.ConeGeometry(0.02, 0.045, 5), P.hair, H(x, 0.065, 0.108), head, { rotation: [180, 0, (i - 2) * 8] });
  }
  // tufts
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const x = Math.cos(a) * 0.065 * (0.6 + R() * 0.5), z = Math.sin(a) * 0.07 * (0.6 + R() * 0.5);
    const len = 0.045 + R() * 0.03;
    put(new THREE.ConeGeometry(0.02, len, 5), P.hair, H(x, 0.125 + len / 2 - 0.01, z * 0.8 - 0.01), head, {
      rotation: [(z * 300) | 0, 0, (-x * 350) | 0],
    });
  }
  put(new THREE.ConeGeometry(0.03, 0.07, 5), P.hair, H(0.02, 0.03, -0.12), head, { rotation: [-110, 0, 10] });
  put(new THREE.ConeGeometry(0.025, 0.06, 5), P.hair, H(-0.03, 0.0, -0.12), head, { rotation: [-100, 0, -10] });
}
```

<!-- call: helmetBox -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildHelmetBox({ b, J, P, M }: Ctx) {
  const bone = J.head;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, at: [number, number, number], dir: [number, number, number], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir });
  const ball = (r: number, c: string, at: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at });

  const x0 = 0.21, y0 = 1.02, y1 = 1.36, zb = -0.19, zf = 0.2, t = 0.012;
  const cy = 1.19, ww = 0.12, wh = 0.11;

  // side, back, top slabs
  for (const s of [1, -1]) box(t, y1 - y0, zf - zb, P.kraft, s * x0, (y0 + y1) / 2, (zf + zb) / 2);
  box(2 * x0, y1 - y0, t, P.kraft, 0, (y0 + y1) / 2, zb);
  box(2 * x0, t, zf - zb, P.kraftLight, 0, y1, (zf + zb) / 2);

  // front frame strips around window
  const fz = zf;
  box(2 * x0, y1 - (cy + wh), t, P.kraft, 0, (y1 + cy + wh) / 2, fz);
  box(2 * x0, cy - wh - y0, t, P.kraft, 0, (y0 + cy - wh) / 2, fz);
  for (const s of [1, -1]) box(x0 - ww, 2 * wh, t, P.kraft, s * (x0 + ww) / 2, cy, fz);

  // inner rim of window with corrugation ridges
  box(2 * ww + 0.01, 0.008, 0.02, P.innerBoard, 0, cy + wh, fz - 0.006);
  box(2 * ww + 0.01, 0.008, 0.02, P.innerBoard, 0, cy - wh, fz - 0.006);
  for (const s of [1, -1]) box(0.008, 2 * wh, 0.02, P.innerBoard, s * ww, cy, fz - 0.006);
  for (let i = 0; i < 9; i++) {
    const x = -ww + 0.01 + i * (2 * ww - 0.02) / 8;
    box(0.008, 0.004, 0.006, P.corrugation, x, cy + wh - 0.005, fz + 0.007);
    box(0.008, 0.004, 0.006, P.corrugation, x, cy - wh + 0.005, fz + 0.007);
  }
  for (let i = 0; i < 7; i++) {
    const y = cy - wh + 0.015 + i * (2 * wh - 0.03) / 6;
    for (const s of [1, -1]) box(0.004, 0.008, 0.006, P.corrugation, s * (ww - 0.005), y, fz + 0.007);
  }

  // eyebrow slits
  for (const s of [1, -1]) {
    box(0.07, 0.012, 0.004, P.marker, s * 0.07, 1.325, fz + 0.008, [0, 0, s * 0.25]);
    box(0.06, 0.006, 0.004, P.markerRed, s * 0.07, 1.31, fz + 0.008, [0, 0, s * 0.25]);
  }
  // grille mouth lines
  for (let i = 0; i < 5; i++) box(0.12, 0.007, 0.004, P.marker, 0, 1.055 - i * 0.0 + 0.0 + (i - 2) * 0.0 + (-0.0) + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0 + (0), fz + 0.008);
  for (let i = 0; i < 5; i++) { /* spacing handled below */ }
  for (let i = 0; i < 4; i++) box(0.12, 0.006, 0.004, P.marker, 0, 1.075 - i * 0.012, fz + 0.012);

  // forehead label with ROBO bars
  box(0.15, 0.036, 0.004, P.paper, 0, 1.285, fz + 0.007, [0, 0, 0.03]);
  for (let i = 0; i < 4; i++) {
    const x = -0.054 + i * 0.036;
    box(0.004, 0.022, 0.003, P.marker, x - 0.008, 1.285, fz + 0.011);
    box(0.016, 0.004, 0.003, P.marker, x, 1.294, fz + 0.011);
    box(0.016, 0.004, 0.003, P.marker, x, 1.277, fz + 0.011);
    box(0.004, 0.012, 0.003, P.marker, x + 0.008, 1.29, fz + 0.011);
  }

  // tape strips
  box(0.05, 0.004, 0.4, P.tape, -0.06, y1 + 0.003, 0, [0, 0.05, 0]);
  box(0.05, 0.004, 0.4, P.tapeDark, 0.09, y1 + 0.003, 0, [0, -0.04, 0]);
  box(0.04, 0.34, 0.004, P.tape, x0 - 0.02, (y0 + y1) / 2, fz + 0.005, [0, 0, 0.03]);

  // ear dials
  for (const s of [1, -1]) {
    const px = s * (x0 + 0.008);
    cyl(0.045, 0.045, 0.008, P.kraftDark, [px, cy, -0.0], [s, 0, 0], 12);
    cyl(0.026, 0.026, 0.008, P.foil, [s * (x0 + 0.014), cy, 0], [s, 0, 0], 10);
    cyl(0.012, 0.012, 0.004, P.foilShine, [s * (x0 + 0.02), cy, 0], [s, 0, 0], 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(0.004, 0.004, 0.008, P.marker, s * (x0 + 0.014), cy + Math.cos(a) * 0.04, Math.sin(a) * 0.04);
    }
    box(0.004, 0.026, 0.004, P.markerRed, s * (x0 + 0.022), cy + 0.012, 0.0, [0, 0, 0]);
  }

  // antennas
  const ant = (x: number, h: number, c: string) => {
    cyl(0.004, 0.004, h, P.foil, [x, y1 + h / 2, -0.04], [0, 1, 0], 6);
    for (let i = 0; i < 6; i++) b.part(new THREE.TorusGeometry(0.01, 0.0025, 4, 8), P.foilDark, { bone, at: [x, y1 + 0.02 + i * 0.012, -0.04], rotation: [90, 0, 0] });
    ball(0.02, c, [x, y1 + h + 0.012, -0.04]);
    cyl(0.022, 0.018, 0.008, P.foil, [x, y1 + h - 0.002, -0.04], [0, 1, 0], 8);
  };
  ant(0.1, 0.1, P.lampRed);
  ant(-0.1, 0.08, P.lampYellow);

  // cyan egg-carton light
  cyl(0.026, 0.02, 0.025, P.lampCyan, [0, y1 + 0.013, 0.1], [0, 1, 0], 6);
  cyl(0.032, 0.032, 0.006, P.kraftDark, [0, y1 + 0.004, 0.1], [0, 1, 0], 6);

  // speaker disc
  cyl(0.055, 0.055, 0.012, P.foil, [0, y1 + 0.008, -0.1], [0, 1, 0], 14);
  for (let i = 1; i <= 2; i++) b.part(new THREE.TorusGeometry(i * 0.017, 0.0025, 4, 12), P.foilDark, { bone, at: [0, y1 + 0.015, -0.1], rotation: [90, 0, 0] });

  // bottom front flap
  box(0.3, 0.006, 0.05, P.kraftLight, 0, y0 + 0.006, zf + 0.02, [-18, 0, 1]);
  box(0.3, 0.006, 0.01, P.corrugation, 0, y0 - 0.004, zf + 0.042, [-18, 0, 1]);

  // glue blobs
  const corners: [number, number, number][] = [[x0, y1, zf], [-x0, y1, zf], [x0, y1, zb], [-x0, y1, zb], [x0, y0 + 0.01, zf], [-x0, y0 + 0.01, zf]];
  for (const c of corners) ball(0.009 + R() * 0.004, P.glue, [c[0], c[1], c[2]]);
}
```

<!-- call: torsoBox -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorsoBox({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const chest = J.chest, hips = J.hips;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], bone: any, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, dir });
  const Y0 = 0.52, Y1 = 1.02, W = 0.26, D = 0.19, T = 0.02;

  // walls
  box(0.52, 0.5, T, P.kraft, [0, 0.77, -D + T / 2], chest);
  box(T, 0.5, 0.38, P.kraft, [0, 0.77, 0], chest).visible = false;
  // front wall
  box(0.52, 0.5, T, P.kraft, [0, 0.77, D - T / 2], chest);
  // side walls with arm holes: split around hole (y 0.92, r 0.055)
  for (const s of [1, -1]) {
    const x = s * (W - T / 2);
    box(T, 0.36, 0.38, P.kraft, [x, 0.7, 0], chest);
    box(T, 0.04, 0.38, P.kraft, [x, 1.0, 0], chest);
    box(T, 0.1, 0.135, P.kraft, [x, 0.92, 0.1225], chest);
    box(T, 0.1, 0.135, P.kraft, [x, 0.92, -0.1225], chest);
    // hole rim
    b.part(new THREE.TorusGeometry(0.058, 0.007, 5, 12), P.innerBoard, { bone: chest, at: [s * W, 0.92, 0], dir: [1, 0, 0], axis: "z" });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(0.012, 0.012, 0.008, P.corrugation, [s * (W + 0.004), 0.92 + Math.sin(a) * 0.066, Math.cos(a) * 0.066], chest);
    }
    // gear symbol
    const gy = 0.68, gz = 0;
    cyl(0.05, 0.004, P.marker, [s * (W + 0.002), gy, gz], [s, 0, 0], chest, 12);
    cyl(0.04, 0.005, P.kraft, [s * (W + 0.003), gy, gz], [s, 0, 0], chest, 12);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(0.012, 0.03, 0.012, P.marker, [s * (W + 0.004), gy + Math.sin(a) * 0.055, gz + Math.cos(a) * 0.055], chest, [a * 57, 0, 0]);
    }
    cyl(0.012, 0.006, P.marker, [s * (W + 0.005), gy, gz], [s, 0, 0], chest, 8);
    for (const [yy, zz] of [[0.57, 0.14], [0.57, -0.14], [0.8, 0.14], [0.8, -0.14]])
      cyl(0.008, 0.006, P.marker, [s * (W + 0.002), yy, zz], [s, 0, 0], chest, 6);
    // shoulder flaps
    box(0.1, 0.012, 0.3, P.kraftLight, [s * 0.23, 1.04, 0], chest, [0, 0, -s * 14]);
    box(0.1, 0.006, 0.3, P.innerBoard, [s * 0.225, 1.032, 0], chest, [0, 0, -s * 14]);
    // vertical corner tapes
    for (const z of [D, -D]) box(0.05, 0.4, 0.008, P.tape, [s * W, 0.76 + R() * 0.03, z], chest, [0, 0, s * 3]);
  }

  // cut-edge rims top and bottom
  for (const y of [Y1, Y0]) {
    const j = y === Y1 ? chest : hips;
    box(0.52, 0.01, 0.01, P.corrugation, [0, y, D - 0.01], j);
    box(0.52, 0.01, 0.01, P.corrugation, [0, y, -D + 0.01], j);
    box(0.01, 0.01, 0.38, P.corrugation, [W - 0.01, y, 0], j);
    box(0.01, 0.01, 0.38, P.corrugation, [-W + 0.01, y, 0], j);
    for (let i = 0; i < 16; i++) {
      const x = -0.24 + i * 0.032;
      box(0.012, 0.012, 0.006, P.kraftDark, [x, y + (y === Y1 ? 0.004 : -0.004), D + 0.001], j);
      box(0.012, 0.012, 0.006, P.kraftDark, [x, y + (y === Y1 ? 0.004 : -0.004), -D - 0.001], j);
    }
  }
  // bottom flaps
  box(0.2, 0.01, 0.07, P.kraftLight, [0.1, 0.515, D + 0.025], hips, [-25, 0, 3]);
  box(0.2, 0.01, 0.07, P.kraftLight, [-0.1, 0.515, D + 0.025], hips, [-18, 0, -4]);
  box(0.3, 0.01, 0.06, P.kraftDark, [0, 0.515, -D - 0.025], hips, [20, 0, 2]);
  // shorts waist
  box(0.3, 0.05, 0.22, P.leggings, [0, 0.5, 0], hips);

  // shoulder straps
  for (const z of [0.12, -0.12]) for (const s of [1, -1])
    box(0.035, 0.012, 0.03, P.shirt, [s * 0.1, 1.03, z], chest);
  for (const s of [1, -1]) {
    box(0.035, 0.01, 0.27, P.shirt, [s * 0.1, 1.027, 0], chest);
  }

  // front panel
  const fz = D;
  box(0.34, 0.3, 0.012, P.kraftLight, [0, 0.76, fz + 0.006], chest);
  const ol = (w: number, h: number, x: number, y: number, z: number) => {
    box(w, 0.004, 0.003, P.marker, [x, y + h / 2, z], chest);
    box(w, 0.004, 0.003, P.marker, [x, y - h / 2, z], chest);
    box(0.004, h, 0.003, P.marker, [x - w / 2, y, z], chest);
    box(0.004, h, 0.003, P.marker, [x + w / 2, y, z], chest);
  };
  const pz = fz + 0.013;
  ol(0.34, 0.3, 0, 0.76, pz);
  // lamps
  [P.lampRed, P.lampYellow, P.lampGreen].forEach((c, i) => {
    const x = (i - 1) * 0.07, y = 0.87;
    cyl(0.022, 0.004, P.marker, [x, y, pz + 0.002], [0, 0, 1], chest, 12);
    cyl(0.017, 0.012, c, [x, y, pz + 0.007], [0, 0, 1], chest, 10);
  });
  // dials
  for (const s of [1, -1]) {
    const x = s * 0.09, y = 0.79;
    cyl(0.04, 0.008, P.foil, [x, y, pz + 0.004], [0, 0, 1], chest, 14);
    for (let i = 0; i < 9; i++) {
      const a = -2.2 + i * 0.55;
      box(0.004, 0.009, 0.003, P.marker, [x + Math.sin(a) * 0.033, y + Math.cos(a) * 0.033, pz + 0.01], chest, [0, 0, -a * 57]);
    }
    box(0.006, 0.03, 0.004, P.markerRed, [x + s * 0.007, y + 0.012, pz + 0.012], chest, [0, 0, -s * 35]);
    cyl(0.006, 0.006, P.marker, [x, y, pz + 0.013], [0, 0, 1], chest, 6);
  }
  // buttons 3x2
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const x = -0.1 + i * 0.05, y = 0.715 - j * 0.05;
    box(0.036, 0.036, 0.006, P.paper, [x, y, pz + 0.003], chest, [0, 0, R() * 4 - 2]);
    box(0.02, 0.004, 0.003, [P.markerRed, P.markerBlue, P.marker][(i + j) % 3], [x, y, pz + 0.008], chest);
  }
  // display strip
  box(0.12, 0.05, 0.006, P.lampCyan, [0.08, 0.7, pz + 0.003], chest);
  ol(0.12, 0.05, 0.08, 0.7, pz + 0.007);
  const zz = [0, 1, -1, 1, -1, 0];
  for (let i = 0; i < 5; i++)
    box(0.026, 0.004, 0.003, P.marker, [0.032 + i * 0.024 + 0.012, 0.7 + (zz[i] + zz[i + 1]) * 0.009, pz + 0.008], chest, [0, 0, (zz[i + 1] - zz[i]) * 40]);
  // heart
  const hx = -0.1, hy = 0.625;
  box(0.018, 0.018, 0.003, P.markerRed, [hx, hy, pz + 0.003], chest, [0, 0, 45]);
  cyl(0.0095, 0.003, P.markerRed, [hx - 0.0065, hy + 0.0065, pz + 0.003], [0, 0, 1], chest, 8);
  cyl(0.0095, 0.003, P.markerRed, [hx + 0.0065, hy + 0.0065, pz + 0.003], [0, 0, 1], chest, 8);
  // ON lever
  box(0.03, 0.02, 0.006, P.marker, [0.0, 0.625, pz + 0.003], chest);
  box(0.008, 0.035, 0.008, P.markerRed, [0.003, 0.64, pz + 0.01], chest, [0, 0, -20]);
  cyl(0.01, 0.008, P.markerRed, [0.012, 0.656, pz + 0.012], [0, 0, 1], chest, 8);
  box(0.006, 0.003, 0.003, P.marker, [-0.02, 0.608, pz + 0.008], chest);
  // sliding label
  box(0.1, 0.03, 0.004, P.paper, [0.08, 0.63, pz + 0.002], chest, [0, 0, 3]);
  for (let i = 0; i < 4; i++) box(0.012, 0.004, 0.003, P.marker, [0.045 + i * 0.02, 0.632, pz + 0.005], chest);
  box(0.03, 0.012, 0.003, P.tape, [0.12, 0.62, pz + 0.006], chest);

  // tapes across front seams
  box(0.09, 0.03, 0.006, P.tape, [-0.15, 1.0, D + 0.003], chest, [0, 0, 8]);
  box(0.09, 0.03, 0.006, P.tape, [0.14, 1.0, D + 0.003], chest, [0, 0, -5]);
  box(0.1, 0.03, 0.006, P.tapeDark, [0, 0.54, D + 0.003], hips, [0, 0, 3]);
  box(0.4, 0.04, 0.006, P.tape, [0, 0.56, -D - 0.003], hips, [0, 0, 2]);

  // back battery pack
  const bz = -D - 0.03;
  box(0.2, 0.15, 0.05, P.foil, [0, 0.78, bz], chest);
  box(0.2, 0.02, 0.052, P.foilDark, [0, 0.725, bz], chest);
  box(0.16, 0.012, 0.01, P.foilShine, [0, 0.83, bz - 0.026], chest);
  box(0.22, 0.03, 0.058, P.tape, [0, 0.78, bz], chest, [0, 0, 6]);
  b.part(new THREE.TorusGeometry(0.03, 0.004, 5, 14), P.marker, { bone: chest, at: [0.05, 0.66, -D - 0.01], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 12), P.marker, { bone: chest, at: [0.02, 0.665, -D - 0.01], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), P.lampYellow, { bone: chest, at: [-0.06, 0.88, -D - 0.015] });
  b.part(new THREE.SphereGeometry(0.018, 8, 6), P.lampRed, { bone: chest, at: [0.06, 0.88, -D - 0.015] });

  // glue blobs
  for (const [x, y, z] of [[-0.25, 1.0, 0.19], [0.25, 0.55, 0.19], [-0.25, 0.56, -0.19], [0.25, 1.0, -0.19], [0.16, 0.9, 0.2], [-0.16, 0.62, 0.2]])
    b.part(new THREE.SphereGeometry(0.01, 6, 4), P.glue, { bone: chest, at: [x, y, z], scale: [1, 1, 0.6] });
}
```