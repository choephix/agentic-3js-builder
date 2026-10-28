<!-- call: plan -->

```json
{
  "name": "Cardboard Box Robot Kid",
  "description": "A 7-year-old kid in a homemade cardboard-box robot costume with a box head with a face window, a box torso with a hand-drawn control panel, foil-wrapped arm tubes, box shin guards and red gloves, standing in a T-pose.",
  "builderName": "cardboardBoxRobotKid",
  "size": [1.7, 1.56, 0.46],
  "layout": "Everything is a primitive-built paper-craft puppet standing on y=0, facing +Z, centred on x=0, about 1.2 m of kid plus 0.35 m of costume. Bottom to top: red-soled white sneakers on the floor (y 0 to 0.075), jeans legs, cardboard shin boxes (y 0.10 to 0.40, x 0.10 +/- 0.075, z +/- 0.085, wider than the legs inside), blue shirt hem and jeans waist (y 0.36 to 0.46), the torso box (y 0.42 to 0.90, x +/- 0.26, z -0.16 to 0.18), the head box (y 0.90 to 1.36, x +/- 0.22, z -0.18 to 0.20) and two spring antennas (up to y 1.56). The head box has a rectangular face window in front (x +/- 0.13, y 0.97 to 1.20, z 0.20). The kid's round cartoon head sits inside it (centre [0,1.08,0.04], radius 0.12), recessed 4 cm behind the window, so the face reads from the front: big eyes, brows, small nose, a wide grin with a separate lower jaw. The arms go out sideways in a T-pose at y 0.80, passing through torn holes in the torso sides (x +/- 0.26). Visible parts of each arm: blue shirt-sleeve elbow, red glove. Over the upper arm (x 0.27 to 0.43) and forearm (x 0.50 to 0.68) sit foil-wrapped cardboard tubes with tape rings. Between them the blue sleeve shows at the elbow (x 0.43 to 0.50). Red gloves start at the wrist (x 0.68) with separate fingers and thumb, palms down, thumb toward +Z, fingertips at x +/- 0.85. Legs stand shoulder-width apart (x +/- 0.10), straight, toes forward. The style is cardboard craft. Every box is a plain tan cuboid with chunky, visibly thick edges (about 1 cm slabs), cut flaps, torn edges and darker corrugation-rib strips along the cut edges. Silver tape strips cross the corners and seams. Hand-drawn marker details (black outlines, red and blue scribbles) are thin dark and coloured plates seated about 2 mm proud of the cardboard. Bottle caps (yellow, green) are buttons, white glue blobs sit at joins, and foil is crinkled with faceted flat-shaded facets in two greys. Colours are flat per part, warm tan on top faces and darker tan below. The kid parts are soft chunky shapes (round-ish, sphere/capsule based) that contrast with the hard box costume.",
  "palette": {
    "cardTan": "#c99a5b",
    "cardDark": "#a47a42",
    "cardLight": "#e2bd7c",
    "cardInside": "#6e4c2a",
    "tapeSilver": "#bcc2ca",
    "foil": "#d6dbe1",
    "foilShade": "#9aa5b1",
    "marker": "#1e1b22",
    "markerRed": "#d6392e",
    "markerBlue": "#2f66cc",
    "capYellow": "#f2c53d",
    "capGreen": "#47b05a",
    "screenCyan": "#62d6ea",
    "skin": "#f0bf99",
    "cheek": "#ee8f84",
    "hair": "#5b3820",
    "shirt": "#3f80c0",
    "jeans": "#3a5079",
    "sneaker": "#ddd8cc",
    "sole": "#b73b35",
    "glove": "#d9412f",
    "white": "#fbf8ee",
    "iris": "#4b3424",
    "lips": "#c95650"
  },
  "mounts": {
    "hipsRoot": [0, 0.52, 0],
    "beltLine": [0, 0.44, 0],
    "torsoBottom": [0, 0.42, 0],
    "torsoTop": [0, 0.9, 0],
    "chestPanel": [0, 0.66, 0.18],
    "backPanel": [0, 0.66, -0.16],
    "neckBase": [0, 0.88, 0.02],
    "headCenter": [0, 1.08, 0.04],
    "jawHinge": [0, 1.03, 0.03],
    "faceWindow": [0, 1.085, 0.2],
    "headBoxTop": [0, 1.36, 0],
    "antennaBaseL": [0.1, 1.36, 0.0],
    "antennaBaseR": [-0.1, 1.36, 0.0],
    "earTubeL": [0.22, 1.1, 0.0],
    "earTubeR": [-0.22, 1.1, 0.0],
    "shoulderHoleL": [0.26, 0.8, 0],
    "shoulderHoleR": [-0.26, 0.8, 0],
    "upperArmTubeL": [0.35, 0.8, 0],
    "upperArmTubeR": [-0.35, 0.8, 0],
    "elbowL": [0.46, 0.8, 0],
    "elbowR": [-0.46, 0.8, 0],
    "forearmTubeL": [0.59, 0.8, 0],
    "forearmTubeR": [-0.59, 0.8, 0],
    "wristL": [0.7, 0.8, 0],
    "wristR": [-0.7, 0.8, 0],
    "kneeL": [0.1, 0.28, 0.01],
    "kneeR": [-0.1, 0.28, 0.01],
    "shinBoxTopL": [0.1, 0.4, 0],
    "shinBoxTopR": [-0.1, 0.4, 0],
    "shinBoxBottomL": [0.1, 0.1, 0],
    "shinBoxBottomR": [-0.1, 0.1, 0],
    "ankleL": [0.1, 0.075, 0],
    "ankleR": [-0.1, 0.075, 0]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.52, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 0.58, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "chest", "parent": "spine", "at": [0, 0.76, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.88, 0.02], "dir": [0, 1, 0], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.97, 0.03], "dir": [0, 1, 0], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.03, 0.03], "dir": [0, 0, 1], "role": "jaw" },

    { "name": "shoulderL", "parent": "chest", "at": [0.2, 0.8, 0], "dir": [1, 0, 0], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.46, 0.8, 0], "dir": [1, 0, 0], "role": "arm" },
    { "name": "wristL", "parent": "elbowL", "at": [0.7, 0.8, 0], "dir": [1, 0, 0], "role": "arm" },
    { "name": "handL", "parent": "wristL", "at": [0.78, 0.8, 0], "dir": [1, 0, 0], "role": "arm" },
    { "name": "thumbL1", "parent": "handL", "at": [0.73, 0.8, 0.04], "dir": [0.4, 0, 0.9], "role": "digit" },
    { "name": "thumbL2", "parent": "thumbL1", "at": [0.755, 0.8, 0.075], "dir": [0.4, 0, 0.9], "role": "digit" },
    { "name": "indexL1", "parent": "handL", "at": [0.78, 0.8, 0.03], "dir": [1, 0, 0], "role": "digit" },
    { "name": "indexL2", "parent": "indexL1", "at": [0.815, 0.8, 0.03], "dir": [1, 0, 0], "role": "digit" },
    { "name": "middleL1", "parent": "handL", "at": [0.78, 0.8, 0.01], "dir": [1, 0, 0], "role": "digit" },
    { "name": "middleL2", "parent": "middleL1", "at": [0.82, 0.8, 0.01], "dir": [1, 0, 0], "role": "digit" },
    { "name": "ringL1", "parent": "handL", "at": [0.78, 0.8, -0.01], "dir": [1, 0, 0], "role": "digit" },
    { "name": "ringL2", "parent": "ringL1", "at": [0.815, 0.8, -0.01], "dir": [1, 0, 0], "role": "digit" },
    { "name": "pinkyL1", "parent": "handL", "at": [0.78, 0.8, -0.03], "dir": [1, 0, 0], "role": "digit" },
    { "name": "pinkyL2", "parent": "pinkyL1", "at": [0.805, 0.8, -0.03], "dir": [1, 0, 0], "role": "digit" },

    { "name": "shoulderR", "parent": "chest", "at": [-0.2, 0.8, 0], "dir": [-1, 0, 0], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.46, 0.8, 0], "dir": [-1, 0, 0], "role": "arm" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.7, 0.8, 0], "dir": [-1, 0, 0], "role": "arm" },
    { "name": "handR", "parent": "wristR", "at": [-0.78, 0.8, 0], "dir": [-1, 0, 0], "role": "arm" },
    { "name": "thumbR1", "parent": "handR", "at": [-0.73, 0.8, 0.04], "dir": [-0.4, 0, 0.9], "role": "digit" },
    { "name": "thumbR2", "parent": "thumbR1", "at": [-0.755, 0.8, 0.075], "dir": [-0.4, 0, 0.9], "role": "digit" },
    { "name": "indexR1", "parent": "handR", "at": [-0.78, 0.8, 0.03], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "indexR2", "parent": "indexR1", "at": [-0.815, 0.8, 0.03], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "middleR1", "parent": "handR", "at": [-0.78, 0.8, 0.01], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "middleR2", "parent": "middleR1", "at": [-0.82, 0.8, 0.01], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "ringR1", "parent": "handR", "at": [-0.78, 0.8, -0.01], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "ringR2", "parent": "ringR1", "at": [-0.815, 0.8, -0.01], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "pinkyR1", "parent": "handR", "at": [-0.78, 0.8, -0.03], "dir": [-1, 0, 0], "role": "digit" },
    { "name": "pinkyR2", "parent": "pinkyR1", "at": [-0.805, 0.8, -0.03], "dir": [-1, 0, 0], "role": "digit" },

    { "name": "hipL", "parent": "hips", "at": [0.1, 0.5, 0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.1, 0.28, 0.01], "dir": [0, -1, 0], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.1, 0.075, 0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "toeL", "parent": "ankleL", "at": [0.1, 0.04, 0.09], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "hips", "at": [-0.1, 0.5, 0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.1, 0.28, 0.01], "dir": [0, -1, 0], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.1, 0.075, 0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.1, 0.04, 0.09], "dir": [0, 0, 1], "role": "leg" }
  ],
  "parts": [
    {
      "id": "kidHead",
      "builds": "The kid's head and neck, seen through the box's face window. Chunky cartoon head (rounded boxy skull sphere, radius ~0.12, centre [0,1.08,0.04], skin). Neck cylinder from y 0.88 to 0.97 (skin) with a blue shirt collar ring (shirt) around its base. Face: two big eyes (white sclera, brown iris, tiny white highlight, thin dark marker-colour upper lid line) at x +/-0.045, y 1.10, front z about 0.15. Thick eyebrows (hair colour) angled up for a happy look. Small round nose (skin, slightly pinker via cheek) and round cheek blush discs (cheek) at x +/-0.075, y 1.04. Mouth: upper jaw is part of the head (lips-colour upper lip arc, row of white upper teeth); the lower jaw is a separate piece on the `jaw` joint (skin chin block, lips lower lip, white lower teeth, pink-red tongue in lips colour) forming a wide open-ish grin. Ears (skin, with cheek inner disc) at x +/-0.12. Hair (hair colour): a solid cap over the top and back of the head plus a modest number of overlapping broad blades for tousled bangs over the forehead and a cowlick, built big and clear; hair shows through the top of the window. Keep every feature behind z 0.185 so nothing pokes through the window plane at z 0.20.",
      "box": [[-0.13, 0.86, -0.1], [0.13, 1.22, 0.19]],
      "attaches": "Neck base on mount neckBase (the neck rides joint neck, the skull and hair ride head, lower jaw rides jaw, hinge at jawHinge). Sits inside the headBox, whose window is at faceWindow; the neck passes down into the torsoBox top at torsoTop.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "kidBody",
      "builds": "Every visible part of the kid except head and neck. Pelvis and lower torso: blue shirt hem block and a jeans waistband visible below the torso box (y 0.36 to 0.46) and a stub of shirt chest inside the box top (hidden). Legs: chunky jeans (jeans colour) capsules or sweeps on the chains hipL/kneeL/ankleL and hipR/kneeR/ankleR, radius ~0.05 thigh to 0.04 ankle, with small patch pockets, seam stitching strips and rolled cuffs. White sneakers on the toe/ankle joints (x +/-0.10, y 0 to 0.075, z -0.05 to 0.17): sneaker body, rounded toe cap, red sole slab (sole), laces as small crossing strips and a tongue, heel tab. Arms: blue shirt-sleeve tubes (shirt) on shoulder/elbow/wrist chains along y 0.80 from x +/-0.20 to +/-0.70, radius ~0.04, with soft cuffs at the wrists. Hands: red gloves (glove) from x +/-0.68, palm block about 0.10 wide in z and 0.06 along x, palm down, separate finger capsules on every digit joint (thumbL1/2, indexL1/2, middleL1/2, ringL1/2, pinkyL1/2 and the R mirror) so fingers and thumb are separated and extended, with a lighter white cuff band and a small marker-colour star or dot on the back of each glove. Mirror left/right exactly.",
      "box": [[-0.86, 0, -0.12], [0.86, 0.5, 0.19]],
      "attaches": "Rides hips, spine, chest, shoulder/elbow/wrist/hand and digit joints, hip/knee/ankle/toe joints. Arms pass through the torso box side holes at shoulderHoleL/R and are covered by the limbSleeves tubes between upperArmTube and forearmTube mounts. Legs go through the shin boxes at shinBoxTop/Bottom mounts. Shoes sit on y=0.",
      "joints": ["hips", "spine", "chest", "shoulderL", "elbowL", "wristL", "handL", "thumbL1", "thumbL2", "indexL1", "indexL2", "middleL1", "middleL2", "ringL1", "ringL2", "pinkyL1", "pinkyL2", "shoulderR", "elbowR", "wristR", "handR", "thumbR1", "thumbR2", "indexR1", "indexR2", "middleR1", "middleR2", "ringR1", "ringR2", "pinkyR1", "pinkyR2", "hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "torsoBox",
      "builds": "The body of the costume: a large cardboard box (cardTan) x +/-0.26, y 0.42 to 0.90, z -0.16 to 0.18, built as thick wall slabs with visible edge thickness and darker corrugation-rib strips (cardDark) along cut edges. Open bottom hem and top with the head box sitting on the top face. Folded-over top flaps (cardLight inner faces, cardDark outer) around the neck opening. Side walls have rough torn round arm holes at shoulderHoleL/R (cardInside dark ring with jagged torn tabs) that the arms pass through. Front chest control panel at chestPanel: a lighter cardboard rectangle plate glued on (cardLight) with a marker outline (marker), a rectangular drawn screen (screenCyan plate, glowing, with marker zig-zag waveform and a small smiley), three big dial knobs (bottle caps: capYellow, capGreen, markerRed with marker tick lines), a row of 4 push-buttons, a toggle switch row (small rods with caps), two scribbled vent grilles (parallel marker bars), a kid-lettered 'ROBO' (blocky letter plates in markerBlue) and a name tag sticker (white plate with marker scribble). Silver tape strips (tapeSilver) cross all four vertical corners and a diagonal across one chest corner, with glue blobs (white). Back at backPanel: a small cardboard jetpack box with two foil tubes (foil/foilShade, faceted) and a red tape stripe, plus a hand-drawn gear. Belt at beltLine y 0.42 to 0.46: cardTan strip band around the box bottom with a big capYellow bottle-cap buckle and marker stitches. Nothing sticks out past z +0.26 front or z -0.26 back.",
      "box": [[-0.27, 0.42, -0.26], [0.27, 0.9, 0.26]],
      "attaches": "Rides joint chest. Bottom edge at torsoBottom/beltLine, top face at torsoTop where headBox sits and kid neck enters. Arm holes at shoulderHoleL/R (x +/-0.26, y 0.8).",
      "joints": ["chest", "spine"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "headBox",
      "builds": "The robot head: a cardboard box x +/-0.22, y 0.90 to 1.36, z -0.18 to 0.20 (cardTan, thick wall slabs with cardDark corrugation ribs on edges). The front wall is built from four slabs around a rectangular face window (x +/-0.13, y 0.97 to 1.20, z 0.20) so the kid's face is visible, with a cut-edge frame in cardInside lining the opening, a hand-painted marker rim (marker, thin plates) around it and little yellow-marker lightning rivets in the corners. Tape strips (tapeSilver) over the top corners and a torn flap on the window top edge. Top face: folded-open flaps (cardLight inner, cardDark outer) on top and a silver tape cross. Two spring antennas at antennaBaseL/R (thin coil sweeps in foilShade, about 0.12 tall, tilted slightly outward) each ending in a bottle-cap or foil-ball tip (capYellow and markerRed), one at x +0.10 and one at x -0.10, topping out about y 1.56. Ear tubes at earTubeL/R: cardboard rolls (cardDark/cardLight rings) sticking out of each side wall to x +/-0.30, with foil end discs and a marker spiral. Front above the window: drawn eyebrow marker bars (marker) and two small round 'eye lights' (capGreen caps) as decoration, a mouth-grille of marker lines on the chin strip beneath the window (y 0.91 to 0.96). Sides and back have marker-drawn bolts, an arrow decal and a gear doodle. Glue blobs (white) at the seams.",
      "box": [[-0.31, 0.9, -0.19], [0.31, 1.56, 0.22]],
      "attaches": "Rides joint head. Rests on torsoBox top at torsoTop (y 0.90). Face window centre at faceWindow around the kid's face from kidHead; keep the window opening empty.",
      "joints": ["head"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "limbSleeves",
      "builds": "Costume tubes and boxes on the kid's limbs, mirrored left/right. Arms: foil-wrapped cardboard tubes (foil with foilShade faceted creases as strips) as sweeps or rods around the sleeve, upper arm tube from x +/-0.27 to +/-0.43 (radius ~0.065) at upperArmTube and forearm tube from x +/-0.50 to +/-0.68 (radius ~0.06) at forearmTube, each with raised tapeSilver rings at both ends, a markerRed stripe, a few capYellow rivets/caps and glue blobs, torn cardboard edge cuffs (cardTan) at the wrist end and a cardDark inner ring. Between the tubes (x 0.43 to 0.50) only the kid's blue sleeve shows, with a small cardboard elbow guard disc (cardLight) beside it. The pieces ride shoulder/elbow joints appropriately (upper tube on shoulder joint, forearm tube on elbow joint). Legs: cardboard shin boxes (cardTan, thick wall slabs, open top and bottom, x 0.10 +/-0.075, z +/-0.085, y 0.10 to 0.40) on each leg, with cardDark corrugation ribs on the vertical edges, silver tape wraps on top and bottom, a folded flap collar at the top (cardLight inner), a marker-drawn arrow or lightning bolt on the front (markerBlue and marker), a capGreen bottle-cap 'knee light' on the front, and a foil-wrapped kneecap strip with tape ring at kneeL/R. Shin boxes ride kneeL/kneeR joints. Keep box bottoms at y 0.10 so shoes stay visible.",
      "box": [[-0.7, 0.08, -0.1], [0.7, 0.88, 0.12]],
      "attaches": "Arm tubes wrap the arm sleeves at upperArmTubeL/R and forearmTubeL/R and start outside the torso hole at shoulderHoleL/R; they end at the wristL/R mounts where gloves begin. Shin boxes wrap the jeans between shinBoxBottom and shinBoxTop mounts around kneeL/R.",
      "joints": ["shoulderL", "elbowL", "shoulderR", "elbowR", "kneeL", "kneeR"],
      "floor": false,
      "budget": 170
    }
  ]
}
```

<!-- call: kidHead -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildKidHead({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const D = Math.PI / 180;

  // Own colours (hair shades, mouth interior, freckles)
  const HAIR2 = "#7a4e2c";
  const HAIR3 = "#43281a";
  const MOUTH = "#4a1a1f";
  const FRECK = "#d99a77";

  // Head scale constants
  const C = V(0, 1.08, 0.04);
  const R = 0.12;

  type Ell = { c: THREE.Vector3; r: [number, number, number] };
  const SKULL: Ell = { c: C, r: [R, R, R] };
  const JAW: Ell = { c: V(0, 0.985, 0.075), r: [0.075, 0.045, 0.065] };

  // Point on the front of an ellipsoid at (x, y), pushed out along its normal by `lift`.
  function on(e: Ell, x: number, y: number, lift = 0) {
    const dx = (x - e.c.x) / e.r[0];
    const dy = (y - e.c.y) / e.r[1];
    const q = Math.max(0.0001, 1 - dx * dx - dy * dy);
    const z = e.c.z + e.r[2] * Math.sqrt(q);
    const p = V(x, y, z);
    const n = V(dx / e.r[0], dy / e.r[1], (z - e.c.z) / (e.r[2] * e.r[2])).normalize();
    p.addScaledVector(n, lift);
    return { p, n };
  }

  // Place geometry on a surface hit, local +Z along the normal (axis "y" for discs).
  const put = (geo: THREE.BufferGeometry, color: string, h: { p: THREE.Vector3; n: THREE.Vector3 }, o: any = {}) =>
    b.part(geo, color, { at: h.p, dir: h.n, axis: "z", bone: J.head, ...o });

  const ball = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);

  const strand = (pts: THREE.Vector3[], r: number, color: string, bone: any) => {
    for (let i = 0; i < pts.length - 1; i++) b.capsule(pts[i], pts[i + 1], r, color, { bone, sides: 6 });
  };

  // ---------------------------------------------------------------- skull, jaw, neck
  b.part(new THREE.SphereGeometry(R, 20, 14), P.skin, { at: C, bone: J.head });
  b.part(new THREE.SphereGeometry(1, 16, 10), P.skin, {
    at: JAW.c,
    bone: J.jaw,
    scale: JAW.r,
  });

  const nb = M.neckBase;
  b.part(new THREE.CylinderGeometry(0.04, 0.043, 0.1, 10), P.skin, { at: [0, 0.925, nb[2] + 0.005], bone: J.neck });
  b.part(new THREE.TorusGeometry(0.047, 0.011, 6, 14), P.shirt, {
    at: [0, nb[1] + 0.012, nb[2] + 0.005],
    rotation: [90, 0, 0],
    bone: J.neck,
  });
  b.part(new THREE.TorusGeometry(0.052, 0.012, 6, 14), P.shirt, {
    at: [0, nb[1] + 0.001, nb[2] + 0.005],
    rotation: [90, 0, 0],
    bone: J.neck,
  });

  // ---------------------------------------------------------------- ears
  for (const s of [1, -1]) {
    b.part(ball(0.028, 8, 6), P.skin, { at: [s * 0.115, 1.07, 0.04], scale: [0.45, 1, 0.85], bone: J.head });
    b.part(ball(0.018, 8, 6), P.cheek, { at: [s * 0.126, 1.07, 0.04], scale: [0.2, 0.9, 0.7], bone: J.head });
  }

  // ---------------------------------------------------------------- eyes and brows
  for (const s of [1, -1]) {
    const cx = s * 0.045;
    const cy = 1.1;
    put(ball(0.028, 10, 8), P.white, on(SKULL, cx, cy, -0.006), { scale: [1, 1.14, 0.55] });
    put(ball(0.0165, 8, 6), P.iris, on(SKULL, cx, cy - 0.002, 0.004), { scale: [1, 1.1, 0.5] });
    put(ball(0.0085, 6, 5), P.marker, on(SKULL, cx, cy - 0.002, 0.0095), { scale: [1, 1.1, 0.4] });
    put(ball(0.005, 6, 4), P.white, on(SKULL, cx - s * 0.005, cy + 0.006, 0.0115), { scale: [1, 1, 0.4] });

    // thin marker upper lid line
    const lid: THREE.Vector3[] = [];
    for (let k = 0; k < 5; k++) {
      const ph = (20 + k * 35) * D;
      lid.push(on(SKULL, cx + s * 0.031 * Math.cos(ph), cy + 0.037 * Math.sin(ph), 0.003).p);
    }
    strand(lid, 0.0036, P.marker, J.head);
    // little lash flick at the outer corner
    const end = lid[0];
    const flick = on(SKULL, end.x + s * 0.012, end.y + 0.01, 0.003).p;
    b.capsule(end, flick, 0.003, P.marker, { bone: J.head, sides: 6 });

    // thick, happy eyebrows
    const brow = [
      on(SKULL, s * 0.02, 1.143, 0.006).p,
      on(SKULL, s * 0.045, 1.154, 0.006).p,
      on(SKULL, s * 0.073, 1.146, 0.006).p,
    ];
    strand(brow, 0.0075, P.hair, J.head);
  }

  // ---------------------------------------------------------------- nose, cheeks, freckles
  put(ball(0.015, 8, 6), P.skin, on(SKULL, 0, 1.052, 0.006), { scale: [1, 0.9, 0.85] });
  put(ball(0.009, 8, 6), P.cheek, on(SKULL, 0, 1.05, 0.015), { scale: [1, 0.85, 0.8] });
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 10), P.cheek, on(SKULL, s * 0.075, 1.04, 0.002), { axis: "y" });
    put(ball(0.003, 5, 4), FRECK, on(SKULL, s * 0.022, 1.068, 0.001));
    put(ball(0.003, 5, 4), FRECK, on(SKULL, s * 0.034, 1.062, 0.001));
  }

  // ---------------------------------------------------------------- mouth
  const upperY = (x: number) => 1.018 + 0.014 * (x / 0.055) ** 2;
  const lowerY = (x: number) => 0.989 + 0.015 * (x / 0.05) ** 2;

  // dark mouth interior (row of small plates in the gap)
  for (let i = 0; i < 7; i++) {
    const x = -0.045 + i * 0.015;
    const top = upperY(x) - 0.012;
    const bot = lowerY(x) + 0.001;
    const h = Math.max(0.004, top - bot);
    const ym = (top + bot) / 2;
    const a = on(SKULL, x, ym, 0.0005);
    const c = on(JAW, x, ym, 0.0005);
    put(new THREE.BoxGeometry(0.0165, h, 0.004), MOUTH, a.p.z > c.p.z ? a : c);
  }

  // upper lip arc + corners
  const upLip: THREE.Vector3[] = [];
  for (let i = 0; i <= 6; i++) {
    const x = -0.055 + i * (0.11 / 6);
    upLip.push(on(SKULL, x, upperY(x), 0.004).p);
  }
  strand(upLip, 0.0055, P.lips, J.head);

  // upper teeth
  for (let i = 0; i < 7; i++) {
    const x = -0.039 + i * 0.013;
    put(new THREE.BoxGeometry(0.0115, 0.009, 0.005), P.white, on(SKULL, x, upperY(x) - 0.009, 0.002));
  }

  // lower jaw: teeth, lip, tongue
  for (let i = 0; i < 6; i++) {
    const x = -0.032 + i * 0.0128;
    put(new THREE.BoxGeometry(0.011, 0.008, 0.005), P.white, on(JAW, x, lowerY(x) - 0.004, 0.0015), {
      bone: J.jaw,
    });
  }
  const loLip: THREE.Vector3[] = [];
  for (let i = 0; i <= 6; i++) {
    const x = -0.05 + i * (0.1 / 6);
    loLip.push(on(JAW, x, lowerY(x) - 0.0105, 0.003).p);
  }
  strand(loLip, 0.0055, P.lips, J.jaw);
  put(ball(0.012, 8, 6), P.lips, on(JAW, 0, 0.996, -0.009), { bone: J.jaw, scale: [2.3, 0.6, 1] });

  // grin corners (marker creases)
  for (const s of [1, -1]) {
    b.capsule(on(SKULL, s * 0.057, 1.03, 0.003).p, on(SKULL, s * 0.062, 1.042, 0.003).p, 0.0028, P.marker, {
      bone: J.head,
      sides: 6,
    });
  }

  // ---------------------------------------------------------------- hair
  // solid caps: darker back and sides, lighter front crown
  b.part(new THREE.SphereGeometry(0.128, 16, 10, 0.97 * Math.PI, 1.06 * Math.PI, 0, 95 * D), HAIR3, {
    at: [C.x, C.y + 0.004, C.z - 0.004],
    bone: J.head,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.128, 16, 6, 0, Math.PI * 2, 0, 33 * D), P.hair, {
    at: [C.x, C.y + 0.004, C.z - 0.004],
    bone: J.head,
    flat: true,
  });

  // broad overlapping blades grown out of the skull
  const blade = (
    aDeg: number,
    thDeg: number,
    L: number,
    r: number,
    color: string,
    sw = 0,
    outward = 0.45,
  ) => {
    const a = aDeg * D;
    const t = thDeg * D;
    const n = V(Math.sin(t) * Math.sin(a), Math.cos(t), Math.sin(t) * Math.cos(a));
    const base = C.clone().addScaledVector(n, 0.122);
    const down = V(Math.cos(t) * Math.sin(a), -Math.sin(t), Math.cos(t) * Math.cos(a));
    const side = V(Math.cos(a), 0, -Math.sin(a));
    const d = down.clone().add(n.clone().multiplyScalar(outward)).addScaledVector(side, sw).normalize();
    const at = base.clone().addScaledVector(d, L / 2);
    return b.part(new THREE.ConeGeometry(r, L, 5), color, {
      at,
      dir: d,
      up: n,
      bone: J.head,
      flat: true,
      scale: [1, 1, 0.55],
    });
  };

  // tousled bangs over the forehead, swept to one side
  const bangs: [number, number, string][] = [
    [-48, 0.036, P.hair],
    [-34, 0.042, HAIR2],
    [-20, 0.046, P.hair],
    [-6, 0.05, HAIR2],
    [8, 0.048, P.hair],
    [22, 0.044, HAIR2],
    [36, 0.04, P.hair],
    [50, 0.034, HAIR2],
  ];
  bangs.forEach(([a, L, col], i) => blade(a, 31 + (i % 2) * 1.5, L, 0.024, col, 0.35, 0.45));

  // cowlick tufts on the crown
  const cow: [number[], number, number][] = [
    [[0.8, 0.6, 0.1], 0.04, 0.016],
    [[0.2, 1, 0.3], 0.03, 0.014],
    [[-0.7, 0.7, -0.1], 0.034, 0.015],
  ];
  cow.forEach(([dd, L, r], i) => {
    const d = V(dd[0], dd[1], dd[2]).normalize();
    const base = V(0.012 - i * 0.012, 1.192, 0.01 - i * 0.012);
    b.part(new THREE.ConeGeometry(r, L, 5), i === 1 ? HAIR2 : P.hair, {
      at: base.clone().addScaledVector(d, L / 2),
      dir: d,
      bone: J.head,
      flat: true,
      scale: [1, 1, 0.6],
    });
  });

  // back and side tufts
  for (const a of [115, 145, 180, -145, -115]) blade(a, 78, 0.05, 0.028, HAIR3, 0, 0.5);
  // sideburns in front of the ears
  for (const s of [1, -1]) blade(s * 68, 68, 0.04, 0.014, P.hair, 0, 0.2);
}
```

<!-- call: kidBody -->

```ts
import * as THREE from "three";

type KidCtx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

export function buildKidBody({ b, J, P }: KidCtx) {
  // Own colours (6): shirt/jeans/glove shades and stitching thread.
  const SHIRT_D = "#32679c";
  const SHIRT_L = "#5b9ad4";
  const JEANS_D = "#2b3c5e";
  const JEANS_L = "#4f6a98";
  const GLOVE_D = "#a82e22";
  const THREAD = "#e8c76a";

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, ...o });
  const ell = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), color, { at, bone, scale: [rx, ry, rz], ...o });
  const cyl = (rx: number, h: number, rz: number, color: string, at: number[], bone: any, seg = 14, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(1, 1, 1, seg), color, { at, bone, scale: [rx, h, rz], ...o });
  // short cylinder whose axis runs along x
  const cylX = (r: number, len: number, color: string, at: number[], bone: any, seg = 12) =>
    b.part(new THREE.CylinderGeometry(1, 1, 1, seg), color, { at, bone, dir: [1, 0, 0], scale: [r, len, r] });
  // thin ring around the x axis / the y axis
  const ringX = (R: number, t: number, color: string, at: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(R, t, 6, 16), color, { at, bone, dir: [1, 0, 0], axis: "z" });
  const ringY = (R: number, t: number, color: string, at: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(R, t, 6, 18), color, { at, bone, dir: [0, 1, 0], axis: "z" });
  const cap = (a: number[], c: number[], r: number | number[], color: string, bone: any, sides = 10) =>
    b.capsule(a, c, r, { color, bone, sides });

  const side = (s: number) => (s > 0 ? "L" : "R");

  // =====================================================================
  // PELVIS + SHIRT (hips / spine / chest)
  // =====================================================================
  // jeans pelvis, soft rounded block
  ell(0.172, 0.09, 0.1, P.jeans, [0, 0.4, 0], J.hips);
  // waistband, belt loops, button
  cyl(0.173, 0.036, 0.103, JEANS_D, [0, 0.368, 0], J.hips, 16);
  const loopAngles = [0.55, -0.55, 1.75, -1.75, Math.PI];
  for (const a of loopAngles) {
    const rx = 0.176;
    const rz = 0.106;
    const x = rx * Math.sin(a);
    const z = rz * Math.cos(a);
    const th = (Math.atan2(x / (rx * rx), z / (rz * rz)) * 180) / Math.PI;
    box(0.013, 0.042, 0.007, JEANS_L, [x, 0.368, z], J.hips, { rotation: [0, th, 0] });
  }
  cyl(0.011, 0.006, 0.011, P.tapeSilver, [0, 0.37, 0.109], J.hips, 10, { dir: [0, 0, 1] });
  // fly seam
  box(0.003, 0.05, 0.004, THREAD, [0, 0.335, 0.083], J.hips);
  // back patch pockets with stitching
  for (const s of [1, -1]) {
    const px = s * 0.07;
    box(0.07, 0.07, 0.008, JEANS_L, [px, 0.378, -0.093], J.hips);
    box(0.07, 0.003, 0.003, THREAD, [px, 0.408, -0.0985], J.hips);
    box(0.003, 0.064, 0.003, THREAD, [px - 0.032, 0.378, -0.0985], J.hips);
    box(0.003, 0.064, 0.003, THREAD, [px + 0.032, 0.378, -0.0985], J.hips);
    ell(0.007, 0.007, 0.003, P.tapeSilver, [px - 0.032, 0.408, -0.1], J.hips);
    ell(0.007, 0.007, 0.003, P.tapeSilver, [px + 0.032, 0.408, -0.1], J.hips);
  }

  // blue shirt hem + stub of the chest hidden in the box
  cyl(0.178, 0.245, 0.109, P.shirt, [0, 0.5025, 0], J.spine, 16);
  cyl(0.181, 0.024, 0.112, SHIRT_D, [0, 0.392, 0], J.spine, 16); // hem band
  for (const s of [1, -1]) {
    box(0.005, 0.03, 0.004, SHIRT_L, [s * 0.178, 0.43, 0], J.spine); // side-vent seam
  }
  cyl(0.2, 0.285, 0.115, P.shirt, [0, 0.745, 0], J.chest, 16);
  ell(0.2, 0.04, 0.11, P.shirt, [0, 0.875, 0], J.chest);

  // =====================================================================
  // LEGS + SNEAKERS
  // =====================================================================
  for (const s of [1, -1]) {
    const n = side(s);
    const x0 = s * 0.1;
    const hip = [x0, 0.5, 0];
    const knee = [x0, 0.28, 0.01];
    const ankle = [x0, 0.075, 0];
    const hipJ = J["hip" + n];
    const kneeJ = J["knee" + n];
    const ankJ = J["ankle" + n];
    const toeJ = J["toe" + n];

    // jeans
    cap(hip, knee, [0.056, 0.048], P.jeans, hipJ, 10);
    cap(knee, ankle, [0.048, 0.04], P.jeans, kneeJ, 10);
    ell(0.05, 0.05, 0.05, P.jeans, knee, kneeJ);
    // seams and patch pocket on the thigh
    box(0.004, 0.09, 0.004, THREAD, [x0 + s * 0.0545, 0.45, 0.004], hipJ);
    box(0.004, 0.09, 0.004, THREAD, [x0 - s * 0.0545, 0.45, 0.004], hipJ);
    box(0.05, 0.055, 0.006, JEANS_L, [x0 + s * 0.01, 0.455, 0.055], hipJ);
    box(0.05, 0.003, 0.003, THREAD, [x0 + s * 0.01, 0.481, 0.059], hipJ);
    box(0.003, 0.05, 0.003, THREAD, [x0 + s * 0.01 - 0.023, 0.455, 0.059], hipJ);
    box(0.003, 0.05, 0.003, THREAD, [x0 + s * 0.01 + 0.023, 0.455, 0.059], hipJ);
    // shin outer seam
    box(0.004, 0.17, 0.004, THREAD, [x0 + s * 0.047, 0.19, 0.004], kneeJ);

    // rolled cuff at the ankle
    ringY(0.047, 0.014, JEANS_L, [x0, 0.093, 0], ankJ);
    ringY(0.0405, 0.008, JEANS_D, [x0, 0.1, 0], ankJ);
    ringY(0.059, 0.0017, THREAD, [x0, 0.086, 0], ankJ);
    ringY(0.059, 0.0017, THREAD, [x0, 0.1, 0], ankJ);

    // ---- sneaker ----
    // soles (red)
    box(0.1, 0.02, 0.095, P.sole, [x0, 0.01, 0.0425], ankJ);
    cyl(0.05, 0.02, 0.05, P.sole, [x0, 0.01, -0.005], ankJ, 14);
    cyl(0.05, 0.02, 0.0575, P.sole, [x0, 0.01, 0.115], toeJ, 14);
    // white midsole
    box(0.098, 0.009, 0.095, P.white, [x0, 0.0245, 0.0425], ankJ);
    cyl(0.049, 0.009, 0.049, P.white, [x0, 0.0245, -0.005], ankJ, 14);
    cyl(0.049, 0.009, 0.0565, P.white, [x0, 0.0245, 0.115], toeJ, 14);
    // upper
    box(0.088, 0.044, 0.094, P.sneaker, [x0, 0.047, 0.043], ankJ);
    cyl(0.044, 0.044, 0.044, P.sneaker, [x0, 0.047, -0.004], ankJ, 12);
    ell(0.044, 0.031, 0.072, P.sneaker, [x0, 0.047, 0.098], toeJ);
    // white toe-cap bumper
    ell(0.0455, 0.02, 0.05, P.white, [x0, 0.037, 0.126], toeJ);
    // padded ankle collar
    ringY(0.043, 0.011, P.sneaker, [x0, 0.072, 0], ankJ);
    // tongue, crossed laces, eyelets
    box(0.04, 0.004, 0.055, P.sneaker, [x0, 0.0745, 0.048], ankJ, { rotation: [-8, 0, 0] });
    for (const z of [0.03, 0.05, 0.07]) {
      for (const a of [32, -32]) {
        box(0.058, 0.004, 0.007, P.white, [x0, 0.079 - (z - 0.03) * 0.1, z], ankJ, { rotation: [0, a, 0] });
      }
      for (const e of [1, -1]) {
        cyl(0.004, 0.003, 0.004, P.marker, [x0 + e * 0.03, 0.0715, z], ankJ, 6);
      }
    }
    // side flash and heel tab
    box(0.003, 0.014, 0.07, P.sole, [x0 + s * 0.0445, 0.05, 0.04], ankJ, { rotation: [-10, 0, 0] });
    box(0.003, 0.014, 0.07, P.sole, [x0 - s * 0.0445, 0.05, 0.04], ankJ, { rotation: [-10, 0, 0] });
    box(0.032, 0.024, 0.004, P.sole, [x0, 0.05, -0.0485], ankJ);
    // stitch row on the toe cap
    box(0.05, 0.002, 0.002, THREAD, [x0, 0.0715, 0.098], toeJ);
  }

  // =====================================================================
  // ARMS + GLOVES
  // =====================================================================
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.018 : 0.0082;
    const a = (i * Math.PI) / 5;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }

  const fingers = [
    { k: "index", z: 0.03, x2: 0.815, tip: 0.845, r: 0.0105 },
    { k: "middle", z: 0.01, x2: 0.82, tip: 0.85, r: 0.0105 },
    { k: "ring", z: -0.01, x2: 0.815, tip: 0.84, r: 0.0102 },
    { k: "pinky", z: -0.03, x2: 0.805, tip: 0.83, r: 0.0095 },
  ];

  for (const s of [1, -1]) {
    const n = side(s);
    const shJ = J["shoulder" + n];
    const elJ = J["elbow" + n];
    const wrJ = J["wrist" + n];
    const haJ = J["hand" + n];

    // shirt sleeves
    ell(0.048, 0.048, 0.048, P.shirt, [s * 0.2, 0.8, 0], shJ);
    cap([s * 0.2, 0.8, 0], [s * 0.46, 0.8, 0], 0.043, P.shirt, shJ, 10);
    cap([s * 0.46, 0.8, 0], [s * 0.67, 0.8, 0], 0.041, P.shirt, elJ, 10);
    // elbow wrinkles and shirt stripes (visible between the foil tubes)
    for (const x of [0.437, 0.46, 0.485]) ringX(0.0435, 0.0035, SHIRT_D, [s * x, 0.8, 0], elJ);
    for (const x of [0.449, 0.472]) cylX(0.0432, 0.005, P.white, [s * x, 0.8, 0], elJ, 12);
    // soft wrist cuff
    cylX(0.0475, 0.034, SHIRT_D, [s * 0.683, 0.8, 0], wrJ, 12);
    ringX(0.0478, 0.0025, SHIRT_L, [s * 0.672, 0.8, 0], wrJ);
    ringX(0.0478, 0.0025, SHIRT_L, [s * 0.694, 0.8, 0], wrJ);

    // glove cuff (white) with red edge rings
    cylX(0.051, 0.04, P.white, [s * 0.717, 0.8, 0], wrJ, 12);
    ringX(0.0512, 0.0028, GLOVE_D, [s * 0.699, 0.8, 0], wrJ);
    ringX(0.0512, 0.0028, P.glove, [s * 0.735, 0.8, 0], wrJ);

    // palm block, palm down
    box(0.062, 0.03, 0.1, P.glove, [s * 0.755, 0.8, 0], haJ);
    ell(0.03, 0.011, 0.046, P.glove, [s * 0.752, 0.808, 0], haJ);
    // thumb muscle bulge
    ell(0.02, 0.016, 0.022, P.glove, [s * 0.735, 0.797, 0.04], J["thumb" + n + "1"]);
    // knuckle seams on the back of the hand
    for (const z of [0.02, 0, -0.02]) {
      box(0.022, 0.003, 0.0025, GLOVE_D, [s * 0.774, 0.8165, z], haJ);
    }
    // marker star on the back of the glove
    b.extrude(star, {
      at: [s * 0.745, 0.8185, 0.0],
      x: [s, 0, 0],
      y: [0, 0, -1],
      thickness: 0.003,
      color: P.marker,
      bone: haJ,
    });

    // fingers
    for (const f of fingers) {
      const j1 = J[`${f.k}${n}1`];
      const j2 = J[`${f.k}${n}2`];
      const y = 0.8;
      cap([s * 0.78, y, f.z], [s * f.x2, y, f.z], f.r, P.glove, j1, 8);
      cap([s * f.x2, y, f.z], [s * (f.tip - f.r * 0.9), y, f.z], f.r * 0.92, P.glove, j2, 8);
      // tiny seam strip on top of each finger
      box(0.016, 0.0022, 0.002, GLOVE_D, [s * (f.x2 + 0.004), y + f.r * 0.98, f.z], j2);
    }

    // thumb toward +Z
    const tdir = new THREE.Vector3(0.4, 0, 0.9).normalize();
    const t1: number[] = [s * 0.73, 0.8, 0.04];
    const t2: number[] = [s * 0.755, 0.8, 0.075];
    const t3: number[] = [s * (0.755 + tdir.x * 0.03), 0.8, 0.075 + tdir.z * 0.03];
    cap(t1, t2, 0.0135, P.glove, J["thumb" + n + "1"], 8);
    cap(t2, t3, 0.0125, P.glove, J["thumb" + n + "2"], 8);
    box(0.014, 0.0022, 0.002, GLOVE_D, [s * 0.762, 0.8135, 0.087], J["thumb" + n + "2"], {
      rotation: [0, s * 24, 0],
    });
  }
}
```

<!-- call: headBox -->

```ts
import * as THREE from "three";
import { rng, spiral, polyline } from "agentic-3js-builder";
import { coil } from "agentic-3js-builder/kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildHeadBox({ b, J, P }: Ctx) {
  const bone = J.head;
  const R = rng(31);
  type N3 = [number, number, number];
  type O = [number, number][];
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const Y = V(0, 1, 0);
  const LGREEN = "#8ad99a";
  const LYELLOW = "#f9dc7e";

  // ---------- basic placement helpers ----------
  const part = (geo: THREE.BufferGeometry, color: string, at: N3, extra: Record<string, any> = {}) =>
    b.part(geo, color, { bone, at, ...extra });
  const box = (w: number, h: number, d: number, at: N3, color: string, rot?: N3) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, rot ? { rotation: rot } : {});
  const disc = (r: number, h: number, at: N3, dir: number[], color: string, seg = 12) =>
    part(new THREE.CylinderGeometry(r, r, h, seg), color, at, { dir });
  const ball = (r: number, at: N3, color: string, scale?: N3) =>
    part(new THREE.SphereGeometry(r, 6, 4), color, at, scale ? { scale } : {});
  const blob = (x: number, y: number, z: number, r = 0.008) =>
    ball(r, [x, y, z], P.white, [1 + R() * 0.3, 0.75 + R() * 0.25, 0.9 + R() * 0.3]);
  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, rotZ = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rotZ) g.rotateZ(rotZ);
    return g.translate(x, y, z);
  };
  const merge = (color: string, geos: THREE.BufferGeometry[]) => {
    const g = mergeGeometries(geos);
    if (g) b.part(g, color, { bone, at: [0, 0, 0] });
  };

  // ---------- wall faces for marker drawings ----------
  type Face = { p: (u: number, v: number) => THREE.Vector3; x: THREE.Vector3; n: THREE.Vector3 };
  const faces: Record<string, Face> = {
    front: { p: (u, v) => V(u, v, 0.2), x: V(1, 0, 0), n: V(0, 0, 1) },
    back: { p: (u, v) => V(-u, v, -0.18), x: V(-1, 0, 0), n: V(0, 0, -1) },
    left: { p: (u, v) => V(0.22, v, u), x: V(0, 0, 1), n: V(1, 0, 0) },
    right: { p: (u, v) => V(-0.22, v, u), x: V(0, 0, 1), n: V(-1, 0, 0) },
  };
  const mark = (f: string, u: number, v: number, outline: O, color: string, thick = 0.003, layer = 0, ang = 0) => {
    const fc = faces[f];
    const x = fc.x.clone().applyAxisAngle(fc.n, ang);
    const y = Y.clone().applyAxisAngle(fc.n, ang);
    const at = fc.p(u, v).addScaledVector(fc.n, thick / 2 - 0.0005 + layer * 0.0004);
    return b.extrude(outline, { at, x, y, thickness: thick, color, bone });
  };
  const markDisc = (f: string, u: number, v: number, r: number, color: string, thick = 0.003, layer = 0, seg = 12) => {
    const fc = faces[f];
    const at = fc.p(u, v).addScaledVector(fc.n, thick / 2 - 0.0005 + layer * 0.0004);
    return disc(r, thick, at.toArray() as N3, fc.n.toArray(), color, seg);
  };
  const sc = (o: O, k: number): O => o.map(([x, y]) => [x * k, y * k] as [number, number]);
  const rect = (w: number, h: number): O => [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const gearOutline = (ro: number, ri: number, n: number, rot = 0): O => {
    const pts: O = [];
    const st = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a = i * st + rot;
      const add = (da: number, r: number) => pts.push([Math.cos(a + da * st) * r, Math.sin(a + da * st) * r]);
      add(-0.3, ri);
      add(-0.16, ro);
      add(0.16, ro);
      add(0.3, ri);
    }
    return pts;
  };
  const BOLT: O = [
    [-0.004, 0.015],
    [0.007, 0.015],
    [0.0015, 0.003],
    [0.008, 0.003],
    [-0.007, -0.015],
    [-0.002, -0.001],
    [-0.008, -0.001],
  ];
  const lightning = (f: string, u: number, v: number, k = 1) => {
    mark(f, u, v, sc(BOLT, 1.45 * k), P.marker, 0.003, 0);
    mark(f, u, v, sc(BOLT, 1.1 * k), P.capYellow, 0.003, 1);
  };
  const screwBolt = (f: string, u: number, v: number, ang: number) => {
    markDisc(f, u, v, 0.011, P.marker, 0.003, 0, 6);
    markDisc(f, u, v, 0.0075, P.cardLight, 0.003, 1, 6);
    mark(f, u, v, rect(0.012, 0.002), P.marker, 0.003, 2, ang);
  };
  const gear = (f: string, u: number, v: number, ro: number, teeth: number, fill: string, ink: string) => {
    mark(f, u, v, gearOutline(ro, ro * 0.8, teeth), ink, 0.003, 0);
    mark(f, u, v, gearOutline(ro - 0.005, ro * 0.8 - 0.005, teeth), fill, 0.003, 1);
    markDisc(f, u, v, ro * 0.34, ink, 0.003, 2, 10);
    markDisc(f, u, v, ro * 0.2, fill, 0.003, 3, 8);
  };

  // ---------- the box walls (thick slabs) ----------
  const T = 0.012;
  for (const s of [1, -1]) {
    box(0.09, 0.46, T, [s * 0.175, 1.13, 0.194], P.cardTan); // front left/right of window
    box(T, 0.46, 0.356, [s * 0.214, 1.13, 0.01], P.cardTan); // side walls
    // cut-edge lining of the window
    box(0.006, 0.23, 0.032, [s * 0.127, 1.085, 0.186], P.cardInside);
    // inner liners
    box(0.002, 0.448, 0.354, [s * 0.207, 1.124, 0.011], P.cardInside);
  }
  box(0.26, 0.16, T, [0, 1.28, 0.194], P.cardTan); // above window
  box(0.26, 0.07, T, [0, 0.935, 0.194], P.cardTan); // chin strip
  box(0.26, 0.006, 0.032, [0, 1.197, 0.186], P.cardInside);
  box(0.26, 0.006, 0.032, [0, 0.973, 0.186], P.cardInside);
  box(0.44, 0.46, T, [0, 1.13, -0.174], P.cardTan); // back
  box(0.416, 0.002, 0.354, [0, 1.347, 0.011], P.cardInside);
  box(0.416, 0.448, 0.002, [0, 1.124, -0.167], P.cardInside);
  box(0.416, T, 0.356, [0, 1.354, 0.01], P.cardTan); // top wall

  // corrugation ribs on vertical edges
  for (const s of [1, -1]) {
    box(0.012, 0.4, 0.012, [s * 0.2175, 1.1, 0.198], P.cardDark);
    box(0.012, 0.4, 0.012, [s * 0.2175, 1.1, -0.176], P.cardDark);
  }
  // corrugated hem ticks (merged)
  {
    const g: THREE.BufferGeometry[] = [];
    for (let x = -0.195; x <= 0.196; x += 0.03) {
      g.push(bx(0.012, 0.012, 0.003, x, 0.906, 0.2015));
      g.push(bx(0.012, 0.012, 0.003, x, 0.906, -0.1815));
    }
    for (let z = -0.15; z <= 0.171; z += 0.03) {
      g.push(bx(0.003, 0.012, 0.012, 0.2215, 0.906, z));
      g.push(bx(0.003, 0.012, 0.012, -0.2215, 0.906, z));
    }
    merge(P.cardDark, g);
  }

  // ---------- face window rim and decorations ----------
  box(0.284, 0.008, 0.003, [0, 1.21, 0.2015], P.marker);
  box(0.284, 0.008, 0.003, [0, 0.962, 0.2015], P.marker);
  for (const s of [1, -1]) box(0.008, 0.256, 0.003, [s * 0.138, 1.086, 0.2015], P.marker);
  for (const s of [1, -1]) {
    lightning("front", s * 0.182, 1.19);
    lightning("front", s * 0.182, 0.985);
    // eyebrow marker bars, arched
    box(0.075, 0.012, 0.003, [s * 0.075, 1.268, 0.2015], P.marker, [0, 0, -s * 12]);
    box(0.03, 0.006, 0.003, [s * 0.12, 1.244, 0.2015], P.marker, [0, 0, -s * 12]);
    // eye lights (green bottle caps)
    markDisc("front", s * 0.165, 1.3, 0.029, P.marker, 0.003, 0, 12);
    disc(0.0245, 0.01, [s * 0.165, 1.3, 0.204], [0, 0, 1], P.capGreen, 14);
    disc(0.016, 0.003, [s * 0.165, 1.3, 0.2095], [0, 0, 1], LGREEN, 10);
    ball(0.004, [s * 0.158, 1.307, 0.212], P.white);
    // chin side lights
    markDisc("front", s * 0.165, 0.935, 0.016, P.marker, 0.003, 0, 10);
    markDisc("front", s * 0.165, 0.935, 0.011, s > 0 ? P.markerRed : P.markerBlue, 0.003, 1, 10);
    // top-front corner glue
    blob(s * 0.133, 1.203, 0.202);
    blob(s * 0.133, 0.967, 0.202, 0.007);
  }
  // mouth grille on chin strip
  box(0.21, 0.004, 0.003, [0, 0.95, 0.2015], P.marker);
  box(0.21, 0.004, 0.003, [0, 0.92, 0.2015], P.marker);
  for (const s of [1, -1]) box(0.004, 0.034, 0.003, [s * 0.105, 0.935, 0.2015], P.marker);
  {
    const g: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) g.push(bx(0.005, 0.026, 0.003, -0.09 + i * 0.0225, 0.935, 0.2015));
    merge(P.marker, g);
  }

  // torn brim flap over the window
  const jag = (w: number, len: number, inset: number): O => {
    const n = Math.max(3, Math.round(w / 0.05));
    const pts: O = [
      [-w / 2 + inset, 0],
      [w / 2 - inset, 0],
    ];
    for (let i = 0; i <= n; i++) {
      const x = w / 2 - inset - ((w - 2 * inset) * i) / n;
      pts.push([x, len * (0.76 + 0.24 * R()) - inset]);
    }
    return pts;
  };
  const flap = (hinge: THREE.Vector3, horiz: THREE.Vector3, theta: number, len: number, w: number) => {
    const dir = horiz.clone().multiplyScalar(Math.cos(theta)).addScaledVector(Y, Math.sin(theta));
    const nrm = Y.clone().multiplyScalar(Math.cos(theta)).addScaledVector(horiz, -Math.sin(theta));
    const across = Y.clone().cross(horiz);
    b.extrude(jag(w, len, 0), { at: hinge, x: across, y: dir, thickness: 0.008, color: P.cardDark, bone });
    b.extrude(jag(w, len, 0.006), {
      at: hinge.clone().addScaledVector(nrm, 0.0055),
      x: across,
      y: dir,
      thickness: 0.003,
      color: P.cardLight,
      bone,
    });
  };
  flap(V(0, 1.222, 0.2), V(0, 0, 1), (55 * Math.PI) / 180, 0.032, 0.25);

  // ---------- top: open flaps and tape cross ----------
  const D = Math.PI / 180;
  flap(V(0, 1.36, 0.2), V(0, 0, 1), 70 * D, 0.07, 0.42);
  flap(V(0, 1.36, -0.18), V(0, 0, -1), 70 * D, 0.07, 0.42);
  flap(V(0.22, 1.36, 0.01), V(1, 0, 0), 50 * D, 0.08, 0.35);
  flap(V(-0.22, 1.36, 0.01), V(-1, 0, 0), 50 * D, 0.08, 0.35);
  box(0.04, 0.003, 0.356, [0, 1.3615, 0.01], P.tapeSilver);
  box(0.416, 0.0034, 0.04, [0, 1.3617, 0.0], P.tapeSilver);
  // corner tape
  for (const sx of [1, -1]) {
    box(0.07, 0.003, 0.025, [sx * 0.185, 1.3615, 0.16], P.tapeSilver, [0, sx * 45, 0]);
    box(0.07, 0.003, 0.025, [sx * 0.185, 1.3615, -0.14], P.tapeSilver, [0, -sx * 45, 0]);
    box(0.036, 0.07, 0.003, [sx * 0.2, 1.325, 0.2015], P.tapeSilver);
    box(0.036, 0.07, 0.003, [sx * 0.2, 1.325, -0.1815], P.tapeSilver);
    box(0.003, 0.07, 0.036, [sx * 0.2215, 1.325, 0.17], P.tapeSilver);
    box(0.003, 0.07, 0.036, [sx * 0.2215, 1.325, -0.15], P.tapeSilver);
  }

  // ---------- antennas ----------
  for (const s of [1, -1]) {
    const bx0 = s * 0.1;
    disc(0.018, 0.016, [bx0, 1.368, 0], [0, 1, 0], P.foilShade, 8);
    disc(0.0205, 0.005, [bx0, 1.366, 0], [0, 1, 0], P.tapeSilver, 8);
    blob(bx0 + 0.02, 1.364, 0.012, 0.007);
    const a: N3 = [bx0, 1.376, 0];
    const t: N3 = [s * 0.122, 1.47, 0];
    b.sweep(coil(a, t, 0.014, 7), 0.0035, { color: P.foilShade, bone, sides: 5 });
    const d = V(t[0] - a[0], t[1] - a[1], 0).normalize();
    const tipEnd = V(...t).addScaledVector(d, 0.022);
    b.rod(t, tipEnd.toArray() as N3, 0.004, P.foilShade, { bone });
    const c = V(...t).addScaledVector(d, 0.047);
    if (s > 0) {
      disc(0.03, 0.012, c.toArray() as N3, d.toArray(), P.capYellow, 12);
      const c2 = c.clone().addScaledVector(d, 0.0065);
      disc(0.02, 0.003, c2.toArray() as N3, d.toArray(), LYELLOW, 10);
    } else {
      part(new THREE.SphereGeometry(0.028, 8, 6), P.markerRed, c.toArray() as N3, { flat: true });
      ball(0.006, [c.x + 0.01, c.y + 0.012, c.z + 0.014], P.white);
    }
  }

  // ---------- ear tubes ----------
  for (const s of [1, -1]) {
    const y = 1.1;
    disc(0.045, 0.085, [s * 0.2575, y, 0], [s, 0, 0], P.cardDark, 10);
    disc(0.049, 0.008, [s * 0.236, y, 0], [s, 0, 0], P.cardLight, 10);
    disc(0.049, 0.008, [s * 0.276, y, 0], [s, 0, 0], P.cardLight, 10);
    disc(0.0475, 0.006, [s * 0.256, y, 0], [s, 0, 0], P.cardTan, 10);
    disc(0.044, 0.003, [s * 0.2995, y, 0], [s, 0, 0], P.cardInside, 10);
    disc(0.036, 0.003, [s * 0.301, y, 0], [s, 0, 0], P.foil, 10);
    const sp = spiral([s * 0.3035, y, 0], [s * 0.3035, y + 0.03, 0], [s, 0, 0], { turns: 1.8, r1: 0.006 });
    b.sweep(sp, 0.0016, { color: P.marker, bone, sides: 4 });
    for (let k = 0; k < 3; k++) {
      const an = (k * 2.1 + 0.6) * 1.0;
      blob(s * 0.223, y + Math.cos(an) * 0.05, Math.sin(an) * 0.05, 0.006);
    }
  }

  // ---------- doodles on sides and back ----------
  const ARROW: O = [
    [-0.07, -0.012],
    [0.02, -0.012],
    [0.02, -0.032],
    [0.075, 0],
    [0.02, 0.032],
    [0.02, 0.012],
    [-0.07, 0.012],
  ];
  const ARROW_IN: O = [
    [-0.062, -0.006],
    [0.012, -0.006],
    [0.012, -0.022],
    [0.056, 0],
    [0.012, 0.022],
    [0.012, 0.006],
    [-0.062, 0.006],
  ];
  mark("left", 0, 1.25, ARROW, P.marker, 0.003, 0);
  mark("left", 0, 1.25, ARROW_IN, P.markerBlue, 0.003, 1);
  gear("right", 0, 1.25, 0.05, 9, P.cardTan, P.marker);
  for (const sd of ["left", "right"]) {
    screwBolt(sd, -0.14, 0.95, 0.5);
    screwBolt(sd, 0.14, 0.95, -0.4);
    screwBolt(sd, -0.14, 1.32, 1.2);
    screwBolt(sd, 0.14, 1.32, 0.1);
  }
  mark("right", 0, 1.0, rect(0.12, 0.006), P.markerRed, 0.003, 0, 0.0);
  mark("left", 0, 1.0, rect(0.12, 0.006), P.markerRed, 0.003, 0, 0.0);
  // back
  gear("back", -0.05, 1.14, 0.075, 10, P.cardTan, P.marker);
  gear("back", 0.075, 1.06, 0.04, 7, P.cardTan, P.markerBlue);
  screwBolt("back", -0.18, 0.95, 0.3);
  screwBolt("back", 0.18, 0.95, -0.7);
  screwBolt("back", -0.18, 1.31, 1.0);
  screwBolt("back", 0.18, 1.31, 0.2);
  {
    const fc = faces.back;
    const pts: N3[] = [];
    for (let i = 0; i <= 8; i++) {
      const p = fc.p(-0.1 + i * 0.025, 0.965 + (i % 2 ? 0.02 : 0)).addScaledVector(fc.n, 0.002);
      pts.push(p.toArray() as N3);
    }
    b.sweep(polyline(pts), 0.0025, { color: P.markerRed, bone, sides: 5 });
  }
  // glue blobs at seams
  for (const s of [1, -1]) {
    blob(s * 0.215, 1.356, 0.19, 0.008);
    blob(s * 0.215, 1.356, -0.17, 0.008);
    blob(s * 0.223, 0.93, 0.0, 0.007);
    blob(s * 0.2, 0.905, 0.2, 0.007);
    blob(s * 0.12, 1.358, 0.19, 0.007);
  }
  blob(0, 1.358, -0.176, 0.008);
}
```

<!-- call: limbSleeves -->

```ts
import * as THREE from "three";
import { aim, rng } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildLimbSleeves({ b, J, P, M }: Ctx) {
  const D = Math.PI / 180;
  const R = rng(23);
  const GREEN_DARK = "#2e8a42";
  const Y = M.shoulderHoleL[1]; // arm height (0.80)

  // ---------- merge bins: one part per (bone, colour) ----------
  type Opt = { at: number[]; rot?: number[]; dir?: number[]; axis?: "x" | "y" | "z"; scale?: number[] };
  const bins = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const put = (bone: any, color: string, geo: THREE.BufferGeometry, o: Opt) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const q = o.dir
      ? aim(o.dir as any, undefined, o.axis ?? "y")
      : new THREE.Quaternion().setFromEuler(
          new THREE.Euler((o.rot?.[0] ?? 0) * D, (o.rot?.[1] ?? 0) * D, (o.rot?.[2] ?? 0) * D, "XYZ"),
        );
    const sc = o.scale ?? [1, 1, 1];
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(o.at[0], o.at[1], o.at[2]),
      q,
      new THREE.Vector3(sc[0], sc[1], sc[2]),
    );
    g.applyMatrix4(m);
    const key = bone.name + "|" + color;
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { bone, color, geos: [] }));
    bin.geos.push(g);
  };
  const flush = () => {
    for (const bin of bins.values()) {
      const merged = mergeGeometries(bin.geos);
      if (merged) b.part(merged, bin.color, { bone: bin.bone, at: [0, 0, 0], flat: true });
    }
  };

  // ---------- geometry shorthands ----------
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, sides: number, open = false) =>
    new THREE.CylinderGeometry(r, r, h, sides, 1, open);
  const ball = (r: number) => new THREE.SphereGeometry(r, 5, 4);
  const ico = () => new THREE.IcosahedronGeometry(1, 0);
  const ringG = (ri: number, ro: number, n: number) => new THREE.RingGeometry(ri, ro, n);

  // ---------- arm tubes ----------
  type Cfg = {
    tapes: number[];
    red: number;
    blue: number;
    zig: number;
    caps: number[][];
    blobs: number[][];
    cuff?: boolean;
  };

  const armTube = (s: number, bone: any, x0: number, x1: number, r: number, cfg: Cfg) => {
    const len = x1 - x0;
    const cxm = (x0 + x1) / 2;
    const rp = (x: number, a: number, rr: number) => [s * x, Y + rr * Math.cos(a * D), rr * Math.sin(a * D)];
    const rc = 0.95 * r + 0.001;

    // foil tube (faceted)
    put(bone, P.foil, cyl(r, len, 8), { at: [s * cxm, Y, 0], dir: [1, 0, 0] });

    // crinkle creases
    for (let i = 0; i < 10; i++) {
      const a = R() * 360;
      const x = x0 + 0.03 + R() * (len - 0.06);
      const l = 0.025 + R() * 0.04;
      const tilt = (R() - 0.5) * 70;
      put(bone, P.foilShade, box(l, 0.007, 0.007), { at: rp(x, a, rc), rot: [a, tilt, 0] });
    }
    for (let i = 0; i < 5; i++) {
      const a = R() * 360;
      const x = x0 + 0.03 + R() * (len - 0.06);
      put(bone, P.foilShade, ico(), {
        at: rp(x, a, 0.95 * r + 0.001),
        rot: [a, R() * 90, 0],
        scale: [0.014, 0.006, 0.009],
      });
    }

    // end annuli (cut cardboard tube ends)
    put(bone, P.cardInside, ringG(0.043, r - 0.004, 8), { at: [s * (x1 + 0.002), Y, 0], dir: [s, 0, 0], axis: "z" });
    put(bone, P.cardInside, ringG(0.043, r - 0.004, 8), { at: [s * (x0 - 0.002), Y, 0], dir: [-s, 0, 0], axis: "z" });

    // silver tape rings
    for (const tx of cfg.tapes) {
      put(bone, P.tapeSilver, cyl(r + 0.006, 0.02, 12, true), { at: [s * tx, Y, 0], dir: [1, 0, 0] });
      // little tape tail
      put(bone, P.tapeSilver, box(0.018, 0.003, 0.026), {
        at: rp(tx, 105, r + 0.007),
        rot: [105, 0, 0],
      });
    }

    // marker red ring + lengthwise stripe
    put(bone, P.markerRed, cyl(r + 0.0085, 0.012, 12, true), { at: [s * cfg.red, Y, 0], dir: [1, 0, 0] });
    put(bone, P.markerRed, box(len - 0.09, 0.008, 0.012), {
      at: rp(cxm, 20, 0.95 * r + 0.001),
      rot: [20, 0, 0],
    });
    // blue scribble ring and zigzag
    put(bone, P.markerBlue, cyl(r + 0.007, 0.006, 12, true), { at: [s * cfg.blue, Y, 0], dir: [1, 0, 0] });
    for (let i = 0; i < 5; i++) {
      put(bone, P.markerBlue, box(0.016, 0.007, 0.004), {
        at: rp(cfg.zig + i * 0.0085, 55, rc),
        rot: [55, i % 2 ? 40 : -40, 0],
      });
    }

    // bottle-cap rivets
    for (const [x, a] of cfg.caps) {
      put(bone, P.capYellow, cyl(0.0105, 0.008, 10), { at: rp(x, a, rc + 0.001), rot: [a, 0, 0] });
      put(bone, P.marker, cyl(0.004, 0.009, 6), { at: rp(x, a, rc + 0.001), rot: [a, 0, 0] });
    }
    // glue blobs
    for (const [x, a] of cfg.blobs) {
      put(bone, P.white, ball(0.006), { at: rp(x, a, r + 0.002), scale: [1, 0.7, 1.1] });
    }

    // torn cardboard cuff at wrist end
    if (cfg.cuff) {
      put(bone, P.cardTan, cyl(r + 0.011, 0.03, 10, true), { at: [s * 0.67, Y, 0], dir: [1, 0, 0] });
      put(bone, P.cardDark, cyl(r + 0.0125, 0.006, 10, true), { at: [s * 0.662, Y, 0], dir: [1, 0, 0] });
      put(bone, P.cardDark, cyl(r + 0.0125, 0.004, 10, true), { at: [s * 0.676, Y, 0], dir: [1, 0, 0] });
      put(bone, P.cardDark, ringG(0.047, r + 0.01, 10), { at: [s * 0.6855, Y, 0], dir: [s, 0, 0], axis: "z" });
      for (let i = 0; i < 12; i++) {
        const a = i * 30 + 8;
        const l = 0.008 + R() * 0.014;
        put(bone, i % 3 === 0 ? P.cardDark : P.cardTan, box(l, 0.006, 0.02), {
          at: rp(0.685 + l / 2 - 0.003, a, r + 0.0085),
          rot: [a, 0, 0],
        });
      }
    }
  };

  const elbowGuard = (s: number, bone: any) => {
    const x = s * 0.465;
    put(bone, P.tapeSilver, cyl(0.046, 0.016, 12, true), { at: [x, Y, 0], dir: [1, 0, 0] });
    put(bone, P.cardDark, cyl(0.037, 0.006, 10), { at: [x, 0.849, 0] });
    put(bone, P.cardLight, cyl(0.031, 0.006, 10), { at: [x, 0.855, 0] });
    put(bone, P.marker, ringG(0.027, 0.0305, 12), { at: [x, 0.8585, 0], rot: [-90, 0, 0] });
    put(bone, P.capYellow, cyl(0.011, 0.006, 10), { at: [x, 0.8615, 0] });
    put(bone, P.markerRed, box(0.014, 0.002, 0.003), { at: [x, 0.8645, 0], rot: [0, 45, 0] });
    put(bone, P.markerRed, box(0.014, 0.002, 0.003), { at: [x, 0.8645, 0], rot: [0, -45, 0] });
    put(bone, P.white, ball(0.006), { at: [x + s * 0.03, 0.848, 0.03], scale: [1, 0.7, 1] });
    put(bone, P.white, ball(0.006), { at: [x - s * 0.03, 0.848, -0.03], scale: [1, 0.7, 1] });
  };

  // ---------- shin boxes ----------
  const BOLT: [number, number][] = [
    [-0.005, 0.05],
    [0.025, 0.05],
    [0.008, 0.012],
    [0.028, 0.012],
    [-0.02, -0.05],
    [-0.005, -0.002],
    [-0.026, -0.002],
  ];
  const ARROW: [number, number][] = [
    [0, 0.055],
    [0.03, 0.01],
    [0.012, 0.01],
    [0.012, -0.05],
    [-0.012, -0.05],
    [-0.012, 0.01],
    [-0.03, 0.01],
  ];
  const scaled = (pts: [number, number][], k: number) => pts.map(([x, y]) => [x * k, y * k] as [number, number]);

  const shin = (s: number, bone: any) => {
    const cx = s * 0.1;
    const hx = 0.075;
    const hz = 0.085;
    const y0 = 0.1;
    const y1 = 0.4;
    const h = y1 - y0;
    const cy = (y0 + y1) / 2;

    const wrap = (color: string, ya: number, yb: number, off: number, t: number) => {
      const hh = yb - ya;
      const ym = (ya + yb) / 2;
      put(bone, color, box(2 * (hx + off + t), hh, t), { at: [cx, ym, hz + off + t / 2] });
      put(bone, color, box(2 * (hx + off + t), hh, t), { at: [cx, ym, -(hz + off + t / 2)] });
      put(bone, color, box(t, hh, 2 * (hz + off)), { at: [cx + hx + off + t / 2, ym, 0] });
      put(bone, color, box(t, hh, 2 * (hz + off)), { at: [cx - hx - off - t / 2, ym, 0] });
    };

    // thick wall slabs
    put(bone, P.cardTan, box(0.15, h, 0.01), { at: [cx, cy, hz - 0.005] });
    put(bone, P.cardTan, box(0.15, h, 0.01), { at: [cx, cy, -(hz - 0.005)] });
    put(bone, P.cardTan, box(0.01, h, 0.15), { at: [cx + hx - 0.005, cy, 0] });
    put(bone, P.cardTan, box(0.01, h, 0.15), { at: [cx - hx + 0.005, cy, 0] });
    // dark inner lining
    put(bone, P.cardInside, box(0.138, h - 0.01, 0.002), { at: [cx, cy, 0.0735] });
    put(bone, P.cardInside, box(0.138, h - 0.01, 0.002), { at: [cx, cy, -0.0735] });
    put(bone, P.cardInside, box(0.002, h - 0.01, 0.136), { at: [cx + 0.0635, cy, 0] });
    put(bone, P.cardInside, box(0.002, h - 0.01, 0.136), { at: [cx - 0.0635, cy, 0] });
    // top rim (cut edge)
    put(bone, P.cardDark, box(0.15, 0.002, 0.01), { at: [cx, y1 + 0.001, hz - 0.005] });
    put(bone, P.cardDark, box(0.15, 0.002, 0.01), { at: [cx, y1 + 0.001, -(hz - 0.005)] });
    put(bone, P.cardDark, box(0.01, 0.002, 0.15), { at: [cx + hx - 0.005, y1 + 0.001, 0] });
    put(bone, P.cardDark, box(0.01, 0.002, 0.15), { at: [cx - hx + 0.005, y1 + 0.001, 0] });

    // corrugation ribs on vertical edges
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        put(bone, P.cardDark, box(0.014, h, 0.014), { at: [cx + sx * 0.0725, cy, sz * 0.0825] });
        for (let k = 0; k < 6; k++)
          put(bone, P.cardTan, box(0.0155, 0.01, 0.0155), {
            at: [cx + sx * 0.0725, y0 + 0.05 + k * 0.04, sz * 0.0825],
          });
      }

    // bottom cut edge: dark band with rib dashes
    wrap(P.cardDark, y0, y0 + 0.01, 0, 0.002);
    for (let i = -3; i <= 3; i++) {
      for (const sz of [1, -1])
        put(bone, P.cardInside, box(0.008, 0.008, 0.003), { at: [cx + i * 0.02, y0 + 0.005, sz * (hz + 0.0025)] });
      for (const sx of [1, -1])
        put(bone, P.cardInside, box(0.003, 0.008, 0.008), { at: [cx + sx * (hx + 0.0025), y0 + 0.005, i * 0.02] });
    }

    // silver tape wraps
    wrap(P.tapeSilver, 0.372, 0.392, 0, 0.006);
    wrap(P.tapeSilver, 0.112, 0.132, 0, 0.006);
    put(bone, P.tapeSilver, box(0.025, 0.032, 0.003), {
      at: [cx + 0.045, 0.358, hz + 0.0075],
      rot: [0, 0, 8],
    });
    put(bone, P.tapeSilver, box(0.025, 0.028, 0.003), {
      at: [cx - 0.04, 0.146, hz + 0.0075],
      rot: [0, 0, -10],
    });

    // folded flap collar
    for (const k of [1, -1]) {
      const th = k * 62;
      const eul = new THREE.Euler(th * D, 0, 0);
      const d = new THREE.Vector3(0, 1, 0).applyEuler(eul);
      const hinge = new THREE.Vector3(cx, y1, k * 0.08);
      const c = hinge.clone().addScaledVector(d, 0.0225);
      put(bone, P.cardDark, box(0.15, 0.045, 0.006), { at: [c.x, c.y, c.z], rot: [th, 0, 0] });
      const n = new THREE.Vector3(0, 0, 1).applyEuler(eul);
      const sg = n.y > 0 ? 1 : -1;
      const ci = c.clone().addScaledVector(n, sg * 0.0042);
      put(bone, P.cardLight, box(0.146, 0.041, 0.002), { at: [ci.x, ci.y, ci.z], rot: [th, 0, 0] });
      const tip = hinge.clone().addScaledVector(d, 0.045);
      put(bone, P.cardDark, box(0.15, 0.007, 0.008), { at: [tip.x, tip.y, tip.z], rot: [th, 0, 0] });
      put(bone, P.white, ball(0.006), { at: [cx + 0.05 * k, y1 + 0.002, k * 0.09], scale: [1, 0.7, 1] });
    }
    for (const k of [1, -1]) {
      const th = -k * 62;
      const eul = new THREE.Euler(0, 0, th * D);
      const d = new THREE.Vector3(0, 1, 0).applyEuler(eul);
      const hinge = new THREE.Vector3(cx + k * 0.07, y1, 0);
      const c = hinge.clone().addScaledVector(d, 0.0225);
      put(bone, P.cardDark, box(0.006, 0.045, 0.15), { at: [c.x, c.y, c.z], rot: [0, 0, th] });
      const n = new THREE.Vector3(1, 0, 0).applyEuler(eul);
      const sg = n.y > 0 ? 1 : -1;
      const ci = c.clone().addScaledVector(n, sg * 0.0042);
      put(bone, P.cardLight, box(0.002, 0.041, 0.146), { at: [ci.x, ci.y, ci.z], rot: [0, 0, th] });
      const tip = hinge.clone().addScaledVector(d, 0.045);
      put(bone, P.cardDark, box(0.008, 0.007, 0.15), { at: [tip.x, tip.y, tip.z], rot: [0, 0, th] });
    }

    // foil kneecap strip with tape ring
    wrap(P.foil, 0.2625, 0.3075, 0, 0.007);
    wrap(P.tapeSilver, 0.279, 0.291, 0.007, 0.0025);
    for (let i = 0; i < 6; i++) {
      const up = i % 2 === 0;
      put(bone, P.foilShade, box(0.026, 0.005, 0.004), {
        at: [cx - 0.06 + i * 0.024, up ? 0.298 : 0.272, hz + 0.0075 + 0.0005],
        rot: [0, 0, up ? 28 : -28],
      });
      put(bone, P.foilShade, box(0.026, 0.005, 0.004), {
        at: [cx - 0.06 + i * 0.024, up ? 0.272 : 0.298, -(hz + 0.0075 + 0.0005)],
        rot: [0, 0, up ? 28 : -28],
      });
    }
    for (const sx of [1, -1])
      for (let i = 0; i < 2; i++)
        put(bone, P.foilShade, box(0.004, 0.005, 0.026), {
          at: [cx + sx * (hx + 0.0075 + 0.0005), i ? 0.298 : 0.272, i ? -0.03 : 0.03],
          rot: [i ? 28 : -28, 0, 0],
        });
    put(bone, P.foil, ico(), { at: [cx, 0.285, 0.0965], scale: [0.04, 0.023, 0.012] });
    put(bone, P.foilShade, ico(), { at: [cx + 0.013, 0.29, 0.1055], scale: [0.02, 0.011, 0.006], rot: [10, 20, 15] });
    put(bone, P.foilShade, ico(), { at: [cx - 0.016, 0.28, 0.1035], scale: [0.015, 0.009, 0.006], rot: [-15, -25, 40] });

    // green bottle-cap knee light and rays
    put(bone, P.capGreen, cyl(0.02, 0.008, 14), { at: [cx, 0.335, hz + 0.004], dir: [0, 0, 1] });
    put(bone, GREEN_DARK, cyl(0.0125, 0.003, 12), { at: [cx, 0.335, hz + 0.0085], dir: [0, 0, 1] });
    put(bone, P.white, cyl(0.004, 0.003, 6), { at: [cx - 0.004, 0.339, hz + 0.0105], dir: [0, 0, 1] });
    for (const a of [-55, 0, 55]) {
      put(bone, P.marker, box(0.003, 0.007, 0.002), {
        at: [cx + 0.027 * Math.sin(a * D), 0.335 + 0.027 * Math.cos(a * D), hz + 0.001],
        rot: [0, 0, -a],
      });
    }
    // marker screw dots
    for (const sx of [-1, 1])
      put(bone, P.marker, cyl(0.005, 0.002, 8), { at: [cx + sx * 0.05, 0.345, hz + 0.001], dir: [0, 0, 1] });
    // marker ladder on outer side
    for (let i = 0; i < 5; i++)
      put(bone, P.marker, box(0.002, 0.008, 0.008), { at: [cx + s * (hx + 0.001), 0.15 + i * 0.02, 0.02] });

    // glue blobs at tape edges
    put(bone, P.white, ball(0.006), { at: [cx + 0.06, 0.37, hz + 0.007], scale: [1, 0.8, 0.8] });
    put(bone, P.white, ball(0.006), { at: [cx - 0.062, 0.134, hz + 0.007], scale: [1, 0.8, 0.8] });
    put(bone, P.white, ball(0.006), { at: [cx + s * (hx + 0.007), 0.253, -0.05], scale: [0.8, 0.8, 1] });

    // marker-drawn lightning bolt (left) / arrow (right)
    const shape = s > 0 ? BOLT : ARROW;
    b.extrude(scaled(shape, 1.1), {
      at: [cx, 0.19, hz + 0.0015],
      x: [1, 0, 0],
      thickness: 0.003,
      color: P.marker,
      bone,
    });
    b.extrude(scaled(shape, 0.85), {
      at: [cx, 0.19, hz + 0.0045],
      x: [1, 0, 0],
      thickness: 0.003,
      color: P.markerBlue,
      bone,
    });
  };

  // ---------- build both sides ----------
  const upperCfg: Cfg = {
    tapes: [0.285, 0.415],
    red: 0.35,
    blue: 0.372,
    zig: 0.302,
    caps: [
      [0.31, 118],
      [0.39, 118],
      [0.335, 20],
    ],
    blobs: [
      [0.297, -25],
      [0.405, 80],
      [0.36, 150],
    ],
  };
  const foreCfg: Cfg = {
    tapes: [0.515, 0.64],
    red: 0.58,
    blue: 0.6,
    zig: 0.53,
    caps: [
      [0.535, 118],
      [0.62, 118],
      [0.56, 20],
    ],
    blobs: [
      [0.527, -25],
      [0.628, 80],
      [0.59, 150],
    ],
    cuff: true,
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh = J["shoulder" + L];
    const el = J["elbow" + L];
    const kn = J["knee" + L];
    armTube(s, sh, 0.27, 0.43, 0.065, upperCfg);
    armTube(s, el, 0.5, 0.68, 0.06, foreCfg);
    elbowGuard(s, el);
    shin(s, kn);
  }

  flush();
}
```

<!-- call: torsoBox -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorsoBox({ b, J, P }: Ctx) {
  const R = rng(23);
  const bone = J.chest;
  type V = [number, number, number];
  const jit = (a: number) => (R() - 0.5) * a;

  // palette (spec colours + a few own shades)
  const TAN = P.cardTan, DARK = P.cardDark, LIGHT = P.cardLight, INSIDE = P.cardInside;
  const SILVER = P.tapeSilver, FOIL = P.foil, SHADE = P.foilShade;
  const INK = P.marker, RED = P.markerRed, BLUE = P.markerBlue;
  const YEL = P.capYellow, GRN = P.capGreen, CYAN = P.screenCyan, WHITE = P.white;
  const YEL_D = "#c79a22", GRN_D = "#2f8a42", RED_D = "#a5271f", CYAN_L = "#b5f0f8";

  const T = 0.012; // wall thickness

  // ---------- batching helper (many small same-colour pieces = one part) ----------
  const UNIT = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4();
  const q4 = new THREE.Quaternion();
  const e4 = new THREE.Euler();
  const mk = () => {
    const list: THREE.BufferGeometry[] = [];
    return {
      add(g: THREE.BufferGeometry, p: V, r: V = [0, 0, 0], s: V = [1, 1, 1]) {
        const c = g.clone();
        m4.compose(new THREE.Vector3(p[0], p[1], p[2]), q4.setFromEuler(e4.set(r[0], r[1], r[2])), new THREE.Vector3(s[0], s[1], s[2]));
        c.applyMatrix4(m4);
        list.push(c);
      },
      flush(color: string) {
        if (!list.length) return;
        const g = mergeGeometries(list);
        if (g) b.part(g, color, { bone, at: [0, 0, 0], flat: true });
      },
    };
  };
  type Batch = ReturnType<typeof mk>;
  const RIBS = mk(), MKB = mk(), REDB = mk(), BLUB = mk(), WHB = mk(), TAPE = mk();
  const LIGHTB = mk(), CYB = mk(), TABL = mk(), TABD = mk(), YELB = mk();

  const pl = (bt: Batch, cx: number, cy: number, w: number, h: number, z: number, rz = 0, th = 0.002) =>
    bt.add(UNIT, [cx, cy, z], [0, 0, rz], [w, h, th]);
  const seg = (bt: Batch, ax: number, ay: number, bx: number, by: number, wd: number, z: number, th = 0.002) => {
    const dx = bx - ax, dy = by - ay;
    bt.add(UNIT, [(ax + bx) / 2, (ay + by) / 2, z], [0, 0, Math.atan2(dy, dx)], [Math.hypot(dx, dy) + wd * 0.5, wd, th]);
  };
  // segment on a side wall (plane z,y) at x
  const segS = (bt: Batch, az: number, ay: number, bz: number, by: number, wd: number, x: number, th = 0.002) => {
    const dz = bz - az, dy = by - ay;
    bt.add(UNIT, [x, (ay + by) / 2, (az + bz) / 2], [Math.atan2(-dy, dz), 0, 0], [th, wd, Math.hypot(dz, dy) + wd * 0.5]);
  };
  const loopC = (bt: Batch, cx: number, cy: number, r: number, n: number, wd: number, z: number, wob = 0) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + jit(wob));
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n];
      seg(bt, p0[0], p0[1], p1[0], p1[1], wd, z);
    }
  };
  const solid = (w: number, h: number, d: number, color: string, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cap = (p: V, n: V, r: number, col: string, rim: string) => {
    const at = (o: number): V => [p[0] + n[0] * o, p[1] + n[1] * o, p[2] + n[2] * o];
    b.part(new THREE.CylinderGeometry(r, r * 0.96, 0.007, 12), rim, { bone, at: at(0.0035), dir: n });
    b.part(new THREE.CylinderGeometry(r * 0.78, r * 0.78, 0.003, 12), col, { bone, at: at(0.0075), dir: n });
  };
  const DEG = Math.PI / 180;

  // ======================= WALLS =======================
  // front and back slabs (butt against the side walls)
  solid(0.496, 0.48, T, TAN, [0, 0.66, 0.174]);
  solid(0.496, 0.48, T, TAN, [0, 0.66, -0.154]);

  // side walls with a torn polygonal arm hole (extruded shape with a hole)
  const zc = 0.01, yc = 0.8;
  const holeR: number[] = Array.from({ length: 12 }, (_, i) => (i % 2 ? 0.055 : 0.066) + jit(0.006));
  const mkWall = () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.18, 0.42);
    shape.lineTo(0.16, 0.42);
    shape.lineTo(0.16, 0.9);
    shape.lineTo(-0.18, 0.9);
    shape.closePath();
    const hp = holeR.map((r, i) => {
      const a = (i / 12) * Math.PI * 2;
      return new THREE.Vector2(-zc + r * Math.cos(a), yc + r * Math.sin(a));
    });
    shape.holes.push(new THREE.Path(hp));
    const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    g.translate(0, 0, -T / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  const mkRing = () => {
    const shape = new THREE.Shape();
    const n = 14;
    const op: THREE.Vector2[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = i % 2 ? 0.077 : 0.092 - jit(0.008);
      op.push(new THREE.Vector2(-zc + r * Math.cos(a), yc + r * Math.sin(a)));
    }
    shape.setFromPoints(op);
    const ip = holeR.map((r, i) => {
      const a = (i / 12) * Math.PI * 2;
      return new THREE.Vector2(-zc + r * 0.8 * Math.cos(a), yc + r * 0.8 * Math.sin(a));
    });
    shape.holes.push(new THREE.Path(ip));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.016, bevelEnabled: false });
    g.translate(0, 0, -0.008);
    g.rotateY(Math.PI / 2);
    return g;
  };
  const wallGeo = mkWall();
  const ringGeo = mkRing();
  for (const s of [1, -1]) {
    b.part(wallGeo.clone(), TAN, { bone, at: [s * 0.254, 0, 0], flat: true });
    b.part(ringGeo.clone(), INSIDE, { bone, at: [s * 0.254, 0, 0], flat: true });
    // torn cardboard tabs bent around the hole
    const CONE = new THREE.ConeGeometry(0.01, 0.028, 3, 1);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.2;
      const rr = 0.058 + jit(0.004);
      const th = Math.atan2(-Math.cos(a), -Math.sin(a));
      (i % 2 ? TABL : TABD).add(
        CONE,
        [s * 0.258, yc + rr * Math.sin(a), zc + rr * Math.cos(a)],
        [th, 0, s * (0.3 + jit(0.2))],
        [1, 0.8 + R() * 0.5, 1],
      );
    }
  }

  // ======================= TOP FLAPS (folded in around the neck opening) =======================
  const phi = 18 * DEG, phiD = 18;
  const flapY = 0.897;
  // front
  {
    const L = 0.105;
    const c: V = [0, flapY - Math.sin(phi) * L / 2, 0.178 - Math.cos(phi) * L / 2];
    solid(0.49, 0.006, L, DARK, c, [-phiD, 0, 0]);
    LIGHTB.add(UNIT, [c[0], c[1] + 0.0045, c[2]], [-phi, 0, 0], [0.49, 0.003, L]);
  }
  // back
  {
    const L = 0.1;
    const c: V = [0, flapY - Math.sin(phi) * L / 2, -0.158 + Math.cos(phi) * L / 2];
    solid(0.49, 0.006, L, DARK, c, [phiD, 0, 0]);
    LIGHTB.add(UNIT, [c[0], c[1] + 0.0045, c[2]], [phi, 0, 0], [0.49, 0.003, L]);
  }
  // sides
  for (const s of [1, -1]) {
    const L = 0.11;
    const c: V = [s * (0.252 - Math.cos(phi) * L / 2), flapY - Math.sin(phi) * L / 2 + 0.001, 0.01];
    solid(L, 0.006, 0.12, DARK, c, [0, 0, s * phiD]);
    LIGHTB.add(UNIT, [c[0], c[1] + 0.0045, c[2]], [0, 0, s * phi], [L, 0.003, 0.12]);
  }

  // ======================= CORRUGATION RIBS ON CUT EDGES =======================
  for (let x = -0.245; x <= 0.245; x += 0.0135) {
    if (R() < 0.1) continue;
    const w = 0.0045 + R() * 0.002;
    RIBS.add(UNIT, [x, 0.9005, 0.174], [0, 0, 0], [w, 0.004, T]);
    RIBS.add(UNIT, [x, 0.9005, -0.154], [0, 0, 0], [w, 0.004, T]);
    RIBS.add(UNIT, [x, 0.4205, 0.174], [0, 0, 0], [w, 0.004, T]);
    RIBS.add(UNIT, [x, 0.4205, -0.154], [0, 0, 0], [w, 0.004, T]);
  }
  for (let z = -0.15; z <= 0.17; z += 0.0135) {
    if (R() < 0.1) continue;
    const w = 0.0045 + R() * 0.002;
    for (const s of [1, -1]) {
      RIBS.add(UNIT, [s * 0.254, 0.9005, z], [0, 0, 0], [T, 0.004, w]);
      RIBS.add(UNIT, [s * 0.254, 0.4205, z], [0, 0, 0], [T, 0.004, w]);
    }
  }

  // ======================= BELT =======================
  solid(0.532, 0.04, 0.006, TAN, [0, 0.44, 0.183]);
  solid(0.532, 0.04, 0.006, TAN, [0, 0.44, -0.163]);
  for (const s of [1, -1]) solid(0.006, 0.04, 0.34, TAN, [s * 0.263, 0.44, 0.01]);
  for (const y of [0.4215, 0.4585]) {
    RIBS.add(UNIT, [0, y, 0.183], [0, 0, 0], [0.532, 0.003, 0.0066]);
    RIBS.add(UNIT, [0, y, -0.163], [0, 0, 0], [0.532, 0.003, 0.0066]);
    for (const s of [1, -1]) RIBS.add(UNIT, [s * 0.263, y, 0.01], [0, 0, 0], [0.0066, 0.003, 0.34]);
  }
  for (let x = -0.25; x <= 0.25; x += 0.024) {
    if (Math.abs(x) > 0.03) pl(MKB, x, 0.44, 0.012, 0.003, 0.187, jit(0.1));
    pl(MKB, x, 0.44, 0.012, 0.003, -0.167, jit(0.1));
  }
  for (let z = -0.15; z <= 0.17; z += 0.024)
    for (const s of [1, -1]) MKB.add(UNIT, [s * 0.267, 0.44, z], [0, 0, 0], [0.002, 0.003, 0.012]);
  // yellow bottle-cap buckle
  cap([0, 0.44, 0.186], [0, 0, 1], 0.0195, YEL, YEL_D);
  seg(MKB, -0.008, 0.434, 0.008, 0.446, 0.0025, 0.1952, 0.0012);
  seg(MKB, -0.008, 0.446, 0.008, 0.434, 0.0025, 0.1952, 0.0012);
  seg(MKB, 0, 0.432, 0, 0.448, 0.0025, 0.1952, 0.0012);

  // ======================= CORNER TAPE =======================
  for (const sx of [1, -1])
    for (const c of [{ z: 0.18, d: 1 }, { z: -0.16, d: -1 }]) {
      TAPE.add(UNIT, [sx * 0.2495, 0.68, c.z + c.d * 0.0015], [0, 0, 0], [0.027, 0.42, 0.003]);
      TAPE.add(UNIT, [sx * 0.2615, 0.68, c.z - c.d * 0.0105], [0, 0, 0], [0.003, 0.42, 0.027]);
      // cut-end diamonds
      TAPE.add(UNIT, [sx * 0.2495, 0.468, c.z + c.d * 0.0025], [0, 0, 45 * DEG], [0.012, 0.012, 0.0032]);
      WHB.add(new THREE.SphereGeometry(0.006, 6, 4), [sx * 0.25, 0.892, c.z + c.d * 0.003], [0, 0, 0], [1, 1, 0.6]);
    }
  // diagonal tape across the upper-left (+X) chest corner
  pl(TAPE, 0.21, 0.828, 0.146, 0.028, 0.1885, Math.atan2(0.115, -0.09), 0.003);
  WHB.add(new THREE.SphereGeometry(0.007, 6, 4), [0.255, 0.768, 0.19], [0, 0, 0], [1, 1, 0.55]);
  WHB.add(new THREE.SphereGeometry(0.007, 6, 4), [0.167, 0.884, 0.19], [0, 0, 0], [1, 1, 0.55]);

  // ======================= CHEST CONTROL PANEL =======================
  solid(0.4, 0.36, 0.006, LIGHT, [0, 0.66, 0.183]);
  RIBS.add(UNIT, [0, 0.4815, 0.183], [0, 0, 0], [0.4, 0.003, 0.0066]);
  RIBS.add(UNIT, [0, 0.8385, 0.183], [0, 0, 0], [0.4, 0.003, 0.0066]);
  // wobbly marker outline
  {
    const x0 = -0.191, x1 = 0.191, y0 = 0.489, y1 = 0.83;
    seg(MKB, x0, y0, x1, y0 + jit(0.002), 0.004, 0.187);
    seg(MKB, x0, y1, x1, y1 + jit(0.002), 0.004, 0.187);
    seg(MKB, x0, y0, x0 + jit(0.002), y1, 0.004, 0.187);
    seg(MKB, x1, y0, x1 + jit(0.002), y1, 0.004, 0.187);
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]] as [number, number][])
      WHB.add(new THREE.SphereGeometry(0.007, 6, 4), [x * 0.985, y + (y > 0.6 ? -0.002 : 0.002), 0.188], [0, 0, 0], [1, 1, 0.55]);
  }

  // --- screen ---
  glow(b.part(new THREE.BoxGeometry(0.24, 0.12, 0.003), CYAN, { bone, at: [-0.05, 0.76, 0.1875] }), 1);
  pl(MKB, -0.05, 0.824, 0.256, 0.008, 0.1875, 0, 0.003);
  pl(MKB, -0.05, 0.696, 0.256, 0.008, 0.1875, 0, 0.003);
  pl(MKB, -0.174, 0.76, 0.008, 0.128, 0.1875, 0, 0.003);
  pl(MKB, 0.074, 0.76, 0.008, 0.128, 0.1875, 0, 0.003);
  // glints and scanlines
  pl(CYB, -0.145, 0.785, 0.04, 0.005, 0.1893, 0.7, 0.0008);
  pl(CYB, -0.125, 0.795, 0.025, 0.005, 0.1893, 0.7, 0.0008);
  for (const y of [0.72, 0.74, 0.78, 0.8]) pl(CYB, -0.05, y, 0.22, 0.0014, 0.1893, 0, 0.0008);
  // waveform
  {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i++)
      pts.push([-0.155 + i * 0.0145, 0.76 + (i === 0 || i === 10 ? 0 : (i % 2 ? 0.024 : -0.024) * (0.6 + R() * 0.5))]);
    for (let i = 0; i < pts.length - 1; i++) seg(MKB, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.0035, 0.19);
    for (let x = -0.16; x <= 0.001; x += 0.02) seg(MKB, x, 0.708, x, 0.716, 0.0025, 0.19);
  }
  // smiley
  {
    const cx = 0.037, cy = 0.762;
    loopC(MKB, cx, cy, 0.021, 12, 0.0032, 0.19, 0.04);
    pl(MKB, cx - 0.008, cy + 0.008, 0.004, 0.007, 0.19);
    pl(MKB, cx + 0.008, cy + 0.008, 0.004, 0.007, 0.19);
    for (let i = 0; i < 5; i++) {
      const a0 = (210 + i * 30) * DEG, a1 = (240 + i * 30) * DEG;
      seg(MKB, cx + Math.cos(a0) * 0.012, cy - 0.002 + Math.sin(a0) * 0.012, cx + Math.cos(a1) * 0.012, cy - 0.002 + Math.sin(a1) * 0.012, 0.003, 0.19);
    }
  }

  // --- name tag ---
  {
    const tilt = 0.06, cx = 0.14, cy = 0.75;
    const tx = (u: number, v: number) => cx + u * Math.cos(tilt) - v * Math.sin(tilt);
    const ty = (u: number, v: number) => cy + u * Math.sin(tilt) + v * Math.cos(tilt);
    pl(WHB, cx, cy, 0.09, 0.08, 0.1875, tilt, 0.003);
    for (const v of [0.014, 0.001]) {
      for (let u = -0.034; u < 0.032; u += 0.01) {
        const va = v + (Math.round((u + 0.034) / 0.01) % 2 ? 0.004 : -0.004);
        const vb = v + (Math.round((u + 0.034) / 0.01) % 2 ? -0.004 : 0.004);
        seg(MKB, tx(u, va), ty(u, va), tx(u + 0.01, vb), ty(u + 0.01, vb), 0.0028, 0.19);
      }
    }
    pl(REDB, tx(0, -0.03), ty(0, -0.03), 0.078, 0.01, 0.19, tilt, 0.002);
    pl(TAPE, tx(0.012, 0.038), ty(0.012, 0.038), 0.036, 0.014, 0.19, tilt - 0.3, 0.002);
  }

  // --- dials (bottle caps) with tick marks ---
  const dials: [number, string, string, number][] = [
    [-0.12, YEL, YEL_D, 40],
    [-0.045, GRN, GRN_D, -60],
    [0.03, RED, RED_D, 100],
  ];
  for (const [x, col, rim, ang] of dials) {
    const y = 0.635, r = 0.028;
    cap([x, y, 0.186], [0, 0, 1], r, col, rim);
    const a = ang * DEG;
    seg(MKB, x, y, x + Math.sin(a) * r * 0.72, y + Math.cos(a) * r * 0.72, 0.0028, 0.1955, 0.0012);
    for (let k = 0; k < 7; k++) {
      const t = (-120 + k * 40) * DEG;
      seg(MKB, x + Math.sin(t) * (r + 0.007), y + Math.cos(t) * (r + 0.007), x + Math.sin(t) * (r + 0.016), y + Math.cos(t) * (r + 0.016), 0.0026, 0.187);
    }
  }

  // --- push buttons ---
  const BASE = new THREE.CylinderGeometry(0.0185, 0.0185, 0.002, 10);
  [RED, YEL, GRN, BLUE].forEach((col, i) => {
    const x = -0.16 + i * 0.045, y = 0.57;
    MKB.add(BASE, [x, y, 0.1875], [Math.PI / 2, 0, 0]);
    b.part(new THREE.CylinderGeometry(0.013, 0.0135, 0.009, 10), col, { bone, at: [x, y, 0.186 + 0.0045 + 0.002], dir: [0, 0, 1] });
  });

  // --- toggle switches ---
  [[0.07, YEL, -0.5], [0.115, RED, 0.1], [0.16, GRN, 0.55]].forEach(([x, col, tl]) => {
    const y = 0.57;
    pl(MKB, x as number, y, 0.022, 0.022, 0.1875, 0, 0.002);
    const d = new THREE.Vector3((tl as number) * 0.5, 0.25, 1).normalize();
    const base = new THREE.Vector3(x as number, y, 0.1885);
    const c = base.clone().addScaledVector(d, 0.015);
    b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 6), SILVER, { bone, at: [c.x, c.y, c.z], dir: [d.x, d.y, d.z] });
    const tip = base.clone().addScaledVector(d, 0.032);
    b.part(new THREE.SphereGeometry(0.0068, 6, 4), col as string, { bone, at: [tip.x, tip.y, tip.z] });
  });

  // --- vent grilles ---
  {
    // grille 1
    const fx0 = 0.095, fx1 = 0.185, fy0 = 0.6, fy1 = 0.67;
    seg(MKB, fx0, fy0, fx1, fy0, 0.0035, 0.187);
    seg(MKB, fx0, fy1, fx1, fy1, 0.0035, 0.187);
    seg(MKB, fx0, fy0, fx0, fy1, 0.0035, 0.187);
    seg(MKB, fx1, fy0, fx1, fy1, 0.0035, 0.187);
    for (let k = 0; k < 5; k++) {
      const y = 0.609 + k * 0.0135;
      seg(MKB, 0.103, y + jit(0.004), 0.177 - R() * 0.01, y + jit(0.004), 0.004, 0.187);
    }
    // grille 2 with red hatch
    const gx0 = 0.03, gx1 = 0.185, gy0 = 0.49, gy1 = 0.535;
    seg(MKB, gx0, gy0, gx1, gy0, 0.0035, 0.187);
    seg(MKB, gx0, gy1, gx1, gy1, 0.0035, 0.187);
    seg(MKB, gx0, gy0, gx0, gy1, 0.0035, 0.187);
    seg(MKB, gx1, gy0, gx1, gy1, 0.0035, 0.187);
    for (let x = 0.045; x < 0.172; x += 0.02) seg(REDB, x, 0.497, x + 0.014 + jit(0.004), 0.528, 0.0035, 0.187);
  }

  // --- kid-lettered ROBO ---
  {
    const GL: Record<string, string[]> = {
      R: ["111", "101", "111", "110", "101"],
      O: ["111", "101", "101", "101", "111"],
      B: ["110", "101", "110", "101", "110"],
    };
    "ROBO".split("").forEach((ch, li) => {
      const x0 = -0.185 + li * 0.043;
      GL[ch].forEach((row, ri) => {
        [...row].forEach((c, ci) => {
          if (c !== "1") return;
          const x = x0 + ci * 0.011 + 0.0055 + jit(0.0008);
          const y = 0.531 - ri * 0.0075 - 0.00375 + jit(0.0006);
          const rz = jit(0.06);
          pl(MKB, x, y, 0.0125, 0.0095, 0.187, rz, 0.002);
          pl(BLUB, x, y, 0.0105, 0.0075, 0.1885, rz, 0.002);
        });
      });
    });
  }

  // ======================= SIDE DOODLES & CUT FLAPS =======================
  for (const s of [1, -1]) {
    const x = s * 0.261;
    const bt = MKB;
    const z0 = -0.095;
    segS(bt, z0, 0.5, z0, 0.66, 0.0045, x);
    segS(bt, z0, 0.69, z0 - 0.026, 0.65, 0.0045, x);
    segS(bt, z0, 0.69, z0 + 0.026, 0.65, 0.0045, x);
    // zig-zag scribble
    const zb = s > 0 ? REDB : BLUB;
    for (let i = 0; i < 5; i++) {
      const za = -0.05 + i * 0.012;
      segS(zb, za, i % 2 ? 0.675 : 0.51, za + 0.012, i % 2 ? 0.51 : 0.675, 0.004, x);
    }
    // cut flap hinged at top edge of a little cut-out
    const L = 0.065, W = 0.06, ph = 40 * DEG;
    const hz = 0.1, hy = 0.6;
    solidSide(s, hz, hy, L, W, ph);
    // glue blob
    WHB.add(new THREE.SphereGeometry(0.007, 6, 4), [s * 0.262, 0.52, 0.15], [0, 0, 0], [0.55, 1, 1]);
  }
  function solidSide(s: number, hz: number, hy: number, L: number, W: number, ph: number) {
    // dark cut-out opening on the wall
    solid(0.003, L, W, INSIDE, [s * 0.2615, hy - L / 2, hz]);
    // flap swings outward from the top edge
    const cx = s * (0.26 + Math.sin(ph) * L / 2);
    const cy = hy - Math.cos(ph) * L / 2;
    solid(0.006, L, W, TAN, [cx, cy, hz], [0, 0, -s * 40]);
    LIGHTB.add(UNIT, [cx - s * 0.0045 * Math.cos(ph) * 0.0, cy, hz], [0, 0, -s * ph], [0.0025, L * 0.9, W * 0.9]);
  }

  // ======================= BACK: JETPACK =======================
  solid(0.24, 0.28, 0.07, TAN, [0, 0.66, -0.195]);
  solid(0.25, 0.01, 0.075, DARK, [0, 0.518, -0.195]);
  solid(0.264, 0.012, 0.084, LIGHT, [0, 0.806, -0.195]);
  for (const sx of [1, -1]) RIBS.add(UNIT, [sx * 0.12, 0.66, -0.229], [0, 0, 0], [0.008, 0.28, 0.008]);
  // red tape stripe wrapping the box
  pl(REDB, 0, 0.63, 0.246, 0.03, -0.2315, 0, 0.003);
  for (const sx of [1, -1]) REDB.add(UNIT, [sx * 0.1215, 0.63, -0.195], [0, 0, 0], [0.003, 0.03, 0.07]);
  // hand-drawn gear
  {
    const gx = 0, gy = 0.715, z = -0.231;
    loopC(MKB, gx, gy, 0.031, 16, 0.003, z, 0.03);
    loopC(MKB, gx, gy, 0.012, 10, 0.003, z);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pl(MKB, gx + Math.cos(a) * 0.039, gy + Math.sin(a) * 0.039, 0.011, 0.011, z, a, 0.002);
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      seg(MKB, gx + Math.cos(a) * 0.012, gy + Math.sin(a) * 0.012, gx + Math.cos(a) * 0.031, gy + Math.sin(a) * 0.031, 0.003, z);
    }
  }
  // start button cap + ticks
  cap([0, 0.572, -0.23], [0, 0, -1], 0.02, GRN, GRN_D);
  for (let k = 0; k < 5; k++) {
    const t = (-80 + k * 40) * DEG;
    seg(MKB, Math.sin(t) * 0.027, 0.572 + Math.cos(t) * 0.027, Math.sin(t) * 0.035, 0.572 + Math.cos(t) * 0.035, 0.0025, -0.231);
  }
  // brackets, rivets and glue
  for (const sx of [1, -1]) {
    for (const y of [0.58, 0.76]) {
      solid(0.05, 0.03, 0.04, DARK, [sx * 0.145, y, -0.195]);
      YELB.add(new THREE.SphereGeometry(0.0055, 6, 4), [sx * 0.145, y, -0.2175], [0, 0, 0], [1, 1, 0.6]);
    }
    WHB.add(new THREE.SphereGeometry(0.007, 6, 4), [sx * 0.112, 0.804, -0.236], [0, 0, 0], [1, 1, 0.6]);
  }
  // foil exhaust tubes (two interleaved hex prisms give crinkled facets)
  for (const sx of [1, -1]) {
    const x = sx * 0.17, z = -0.196;
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.34, 6), FOIL, { bone, at: [x, 0.67, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.32, 6), SHADE, { bone, at: [x, 0.665, z], rotation: [0, 30, 0], flat: true });
    b.part(new THREE.SphereGeometry(0.036, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), FOIL, { bone, at: [x, 0.84, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.038, 0.05, 0.04, 8), SHADE, { bone, at: [x, 0.48, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.002, 8), INSIDE, { bone, at: [x, 0.4595, z] });
    for (const y of [0.52, 0.8]) b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.012, 8), SILVER, { bone, at: [x, y, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.0385, 0.0385, 0.014, 8), RED, { bone, at: [x, 0.66, z], flat: true });
  }

  // ======================= flush batches =======================
  RIBS.flush(DARK);
  MKB.flush(INK);
  REDB.flush(RED);
  BLUB.flush(BLUE);
  WHB.flush(WHITE);
  TAPE.flush(SILVER);
  LIGHTB.flush(LIGHT);
  CYB.flush(CYAN_L);
  TABL.flush(LIGHT);
  TABD.flush(DARK);
  YELB.flush(YEL);
}
```