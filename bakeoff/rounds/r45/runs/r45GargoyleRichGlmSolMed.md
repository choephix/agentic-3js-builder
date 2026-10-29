<!-- call: plan -->

```json
{
  "name": "Cathedral Gargoyle",
  "description": "A weathered limestone gargoyle crouched on a mossy cathedral ledge, wings folded high like a bat's, ember eyes glowing under horned brows, carved as a gothic low-poly stone sentinel.",
  "builderName": "gargoyleCathedral",
  "size": [2.4, 2.1, 2.8],
  "layout": "Front (+Z) view: a heavy projecting stone ledge (cornice slab with carved corbel brackets underneath, drip groove along its front edge, patches of moss on top and in crevices) spans the full width and is the only floor contact. Behind its centre a crouched gargoyle faces +Z: broad hunched shoulders over a deep barrel chest that leans forward, arms braced on the ledge front with long clawed fingers hooked over the lip, digitigrade legs folded beneath the haunches with clawed toes gripping the ledge edge, and a thick short tail that sweeps back and to the model's left (+X), curling over the ledge. Above the chest a short thick neck holds a broad blunt-snouted head: heavy brow ridges, wide upright ears, two swept-back ridged horns, a slightly parted jaw with carved fangs, and glowing ember eyes set deep in shadowed sockets. From each shoulder a folded wing rises up and back like a tent above the shoulders, stone-vaned with scalloped trailing edges and a small claw at each wrist joint, giving a tall triangular silhouette to y 2.05. Style: everything reads as aged carved limestone, blocky faceted primitives, surface detail built as seated pieces — carved rib ridges on chest and haunches, chisel-faceted horns, moss caps on upward faces, darker shadowed undersides, verdigris streaks under the drip line, ink-dark carved seam lines around eyes, knuckles and wing joints. Warm pale tones on top faces, cool dark tones below.",
  "palette": {
    "stoneLight": "#aaa394",
    "stoneMid": "#8b8577",
    "stoneDark": "#6b675b",
    "stoneShadow": "#4a473e",
    "mossGreen": "#5f7d3a",
    "mossDark": "#3c5426",
    "hornBone": "#d9d3bd",
    "hornDark": "#96907a",
    "clawStone": "#c8c1a8",
    "wingStone": "#5c594e",
    "verdigris": "#4e7d6c",
    "inkCarve": "#2a2620",
    "emberGlow": "#ff9a3c",
    "emberCore": "#ffd98a"
  },
  "mounts": {
    "ledgeTop": [0, 0.5, -0.15],
    "ledgeFrontLip": [0, 0.5, 0.75],
    "haunchSeat": [0, 0.55, -0.3],
    "neckBase": [0, 1.3, 0.32],
    "shoulderL": [0.45, 1.15, -0.05],
    "shoulderR": [-0.45, 1.15, -0.05],
    "hipSocketL": [0.34, 0.6, -0.3],
    "hipSocketR": [-0.34, 0.6, -0.3],
    "tailRoot": [0, 0.55, -0.6]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.62, -0.3], "dir": [0, 0.3, 1], "role": "spine" },
    { "name": "chest", "parent": "hips", "at": [0, 1.02, 0.05], "dir": [0, 0.4, 0.9], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 1.28, 0.28], "dir": [0, 0.55, 0.85], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 1.45, 0.5], "dir": [0, 0.15, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.34, 0.72], "dir": [0, -0.2, 1], "role": "jaw" },
    { "name": "wingRootL", "parent": "chest", "at": [0.42, 1.2, -0.05], "dir": [0.7, 0.7, -0.2], "role": "wing" },
    { "name": "wingMidL", "parent": "wingRootL", "at": [0.78, 1.62, -0.28], "dir": [0.4, 0.85, -0.35], "role": "wing" },
    { "name": "wingTipL", "parent": "wingMidL", "at": [1.0, 1.92, -0.55], "dir": [0.25, 0.6, -0.75], "role": "wing" },
    { "name": "wingRootR", "parent": "chest", "at": [-0.42, 1.2, -0.05], "dir": [-0.7, 0.7, -0.2], "role": "wing" },
    { "name": "wingMidR", "parent": "wingRootR", "at": [-0.78, 1.62, -0.28], "dir": [-0.4, 0.85, -0.35], "role": "wing" },
    { "name": "wingTipR", "parent": "wingMidR", "at": [-1.0, 1.92, -0.55], "dir": [-0.25, 0.6, -0.75], "role": "wing" },
    { "name": "shoulderL", "parent": "chest", "at": [0.5, 1.0, 0.2], "dir": [0.4, -0.7, 0.6], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.62, 0.72, 0.45], "dir": [-0.2, -0.5, 0.85], "role": "arm" },
    { "name": "handL", "parent": "elbowL", "at": [0.5, 0.58, 0.66], "dir": [0, -0.5, 0.85], "role": "arm" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.5, 1.0, 0.2], "dir": [-0.4, -0.7, 0.6], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.62, 0.72, 0.45], "dir": [0.2, -0.5, 0.85], "role": "arm" },
    { "name": "handR", "parent": "elbowR", "at": [-0.5, 0.58, 0.66], "dir": [0, -0.5, 0.85], "role": "arm" },
    { "name": "hipL", "parent": "hips", "at": [0.34, 0.6, -0.3], "dir": [0.5, 1, 0.3], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.5, 0.95, -0.05], "dir": [0.2, -0.6, 0.8], "role": "leg" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.42, 0.62, 0.35], "dir": [0, -0.4, 0.9], "role": "leg" },
    { "name": "toeL", "parent": "ankleL", "at": [0.42, 0.53, 0.62], "dir": [0, -0.7, 0.7], "role": "leg" },
    { "name": "hipR", "parent": "hips", "at": [-0.34, 0.6, -0.3], "dir": [-0.5, 1, 0.3], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.5, 0.95, -0.05], "dir": [-0.2, -0.6, 0.8], "role": "leg" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.42, 0.62, 0.35], "dir": [0, -0.4, 0.9], "role": "leg" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.42, 0.53, 0.62], "dir": [0, -0.7, 0.7], "role": "leg" },
    { "name": "tail1", "parent": "hips", "at": [0, 0.55, -0.6], "dir": [0.2, -0.2, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0.4, 0.5, -0.85], "dir": [1, 0.1, 0.3], "role": "tail" },
    { "name": "tail3", "parent": "tail2", "at": [0.78, 0.56, -0.55], "dir": [0.6, 0.2, 0.8], "role": "tail" }
  ],
  "parts": [
    {
      "id": "ledge",
      "builds": "The cathedral cornice the gargoyle perches on: a long rectangular limestone slab across the full width (its top at y 0.5, front edge near z 0.85, back around z -1.05), with three carved corbel brackets (stepped frustum-box stack) under its front edge, a thin drip groove strip along the front lip in inkCarve, chipped corner blocks, and moss patches: small mossGreen/mossDark caps seated on the top face, in the drip groove and under the front lip, plus a verdigris stain streak under one drip corner. Also a gothic carved running pattern: a row of small trefoil-arch blocks seated along the slab's front face in stoneDark with inkCarve recess lines. Colours: stoneMid slab top and sides, stoneLight bevel caps, stoneDark undersides and corbels, mossGreen/mossDark accents.",
      "box": [[-1.2, 0, -1.05], [1.2, 0.5, 0.85]],
      "attaches": "Stands alone on the floor (floor: true); its top face IS mount ledgeTop (y 0.5) and its front lip mount ledgeFrontLip at [0, 0.5, 0.75]; torso, legsAndTail and their claws all rest on or grip these mounts.",
      "joints": [],
      "floor": true,
      "budget": 130
    },
    {
      "id": "torso",
      "builds": "The hunched stone body from haunches to shoulders: a forward-leaning loft/sweep torso (deep barrel chest bulging toward +Z, narrow at the waist) in stoneMid with countershade to stoneLight on the upper chest and stoneShadow beneath; carved anatomical detail as seated pieces: three chest rib ridges (thin arched extrudes in stoneLight with inkCarve recess lines), a central carved sternum keel, pectoral plates, spine ridge bumps from haunches to neck base, and a haunch mass rounding over mount haunchSeat. Both arms grow from mounts shoulderL/shoulderR: thick upper arm, angular elbow, forearm braced down-forward to the ledge lip, ending in a big stone fist with four long carved fingers and claws (clawStone) hooked over the ledge front lip at mount ledgeFrontLip, knuckle ridges and inkCarve tendon lines. Verdigris streak in one armpit shadow, moss fleck on one shoulder.",
      "box": [[-0.6, 0.5, -0.7], [0.6, 1.35, 0.75]],
      "attaches": "Rises from mount haunchSeat on the ledge top, arms reach down to mount ledgeFrontLip; chest and shoulders carry mounts neckBase, shoulderL, shoulderR, hipSocketL, hipSocketR, tailRoot.",
      "joints": ["hips", "chest", "shoulderL", "elbowL", "handL", "shoulderR", "elbowR", "handR"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "legsAndTail",
      "builds": "The crouched legs and tail. Digitigrade legs from mounts hipSocketL/hipSocketR: massive haunch thighs swept up and forward (knees high, nearly level with the chest), thin shins angling down-forward to hocks, then long flat feet reaching to the ledge front, toes splayed over the lip at mount ledgeFrontLip with three carved claws each (clawStone) gripping down over the edge; heel spurs, inkCarve crease lines at knee and ankle folds, moss tuft in the crotch shadow. The tail roots at mount tailRoot, sweeps back along the ledge (tail1, tail2, tail3), thick at the root tapering to a spiked tip with 4–5 dorsal spike fins and a spade-shaped tip, curling around the model's left (+X) side and up over the ledge top; carved ring segments in alternating stoneMid/stoneDark with a moss cap where it touches the ledge.",
      "box": [[-0.72, 0.5, -0.95], [0.72, 1.05, 0.85]],
      "attaches": "Hips socket into mounts hipSocketL/hipSocketR on the torso haunches; feet and claws press onto mount ledgeFrontLip and ledgeTop; tail lies along the ledge top surface near mount ledgeTop.",
      "joints": ["hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR", "tail1", "tail2", "tail3"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "head",
      "builds": "The carved head on mount neckBase: broad skull (stoneMid, countershaded stoneLight on brow and cheek tops), short blunt down-curved snout with a wide dark nose and inkCarve nostril cuts, a heavy paired brow ridge overhanging deep eye sockets (stoneShadow sockets, inkCarve rim lines), and glowing ember eyes: dark ember recess parts with a bright emberCore pupil and emberGlow iris, self-lit (glow kit), one per socket, reading from the front. A slightly open lower jaw on the jaw joint: upper jaw with two pairs of long fang teeth (hornBone) and a dark mouth gap, lower jaw with matching fangs and a small chin spike. Wide pointed upright ears with scalloped inner carving (stoneDark inner, hornBone rim). Two thick ridged horns swept back and outward from the brow (segmented hornBone ridges over hornDark base, chisel-faceted, tips to y ~2.0), plus a small mid-crown stud. Neck: a short thick column of stacked carved stone rolls (stoneLight/stoneMid alternating) joining mount neckBase to the skull. Carved cheek fur tufts (stepped stoneLight blocks) and a verdigris drip under the chin.",
      "box": [[-0.5, 1.1, 0.25], [0.5, 2.05, 1.05]],
      "attaches": "Skull and neck ride mount neckBase on the torso's chest top; nothing sits in front of the face except its own snout; jaw joint at the head's front underside.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "wings",
      "builds": "Both folded wings, raised like a bat's tent above the shoulders, mirrored about x = 0. Each wing: a thick stone arm bone from mount shoulderL/shoulderR through the wrist joints (wingRoot, wingMid, wingTip) in stoneMid with knobbed elbow and inkCarve joint seam rings; a leading-edge ridge in stoneLight; and a scalloped stone membrane (thin membrane slab, wingStone) stretched between the arm bones, its trailing edge cut into three deep scallops with rolled stoneDark rims; a small hornBone claw at the wingtip wrist hooking forward; short strut finger bones fanning inside the membrane as seated stoneDark ribs. Moss tufts root-side on the shoulders, verdigris streak low on one membrane. The wings' upper tips form the tall triangle of the silhouette reaching y ~2.05, spread to about x ±1.15.",
      "box": [[-1.15, 1.0, -0.75], [1.15, 2.05, 0.3]],
      "attaches": "Roots at mounts shoulderL and shoulderR on the torso's upper back, rising behind and above the head without covering it.",
      "joints": ["wingRootL", "wingMidL", "wingTipL", "wingRootR", "wingMidR", "wingTipR"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: ledge -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildLedge({ b, J, P, M }: Ctx) {
  const stoneLight = P.stoneLight;
  const stoneMid = P.stoneMid;
  const stoneDark = P.stoneDark;
  const stoneShadow = P.stoneShadow;
  const mossGreen = P.mossGreen;
  const mossDark = P.mossDark;
  const verdigris = P.verdigris;
  const inkCarve = P.inkCarve;

  const random = rng(7319);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    radial = 8,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      rotation,
    });
  };

  const mossPatch = (
    points: [number, number, number][],
    color: string,
    thickness = 0.018,
  ) => {
    b.slab(points, { color, thickness });
  };

  // Main cornice block: its top is exactly the shared ledgeTop mount.
  box([2.4, 0.5, 1.9], [0, 0.25, -0.1], stoneMid);

  // Heavy lower shadow plane and a pale, worn front cap.
  box([2.34, 0.055, 1.82], [0, 0.035, -0.1], stoneShadow);
  box([2.38, 0.055, 0.075], [0, 0.475, 0.815], stoneLight);
  box([2.34, 0.035, 0.055], [0, 0.505, 0.02], stoneLight);

  // Broad corner quoins and chipped-looking cap blocks.
  for (const s of [-1, 1]) {
    box([0.16, 0.11, 0.22], [s * 1.12, 0.505, 0.68], stoneLight, [
      0,
      s * 3,
      s * 2,
    ]);
    box([0.12, 0.085, 0.17], [s * 1.17, 0.535, -0.83], stoneLight, [
      s * 2,
      0,
      s * 4,
    ]);
    box([0.18, 0.08, 0.13], [s * 1.02, 0.515, -0.98], stoneDark, [
      0,
      s * 4,
      0,
    ]);
  }

  // Three stepped corbel brackets projecting from the front face.
  for (const x of [-0.82, 0, 0.82]) {
    box([0.30, 0.10, 0.24], [x, 0.075, 0.91], stoneDark, [0, 0, 0]);
    box([0.24, 0.13, 0.18], [x, 0.18, 0.92], stoneMid, [0, 0, 0]);
    box([0.18, 0.16, 0.13], [x, 0.315, 0.925], stoneDark, [0, 0, 0]);
    box([0.23, 0.035, 0.19], [x, 0.405, 0.925], stoneLight, [0, 0, 0]);

    // Angular carved shadow cuts make each bracket read as a gothic support.
    box([0.026, 0.19, 0.018], [x - 0.075, 0.20, 1.015], inkCarve, [
      0,
      0,
      -18,
    ]);
    box([0.026, 0.19, 0.018], [x + 0.075, 0.20, 1.015], inkCarve, [
      0,
      0,
      18,
    ]);
    box([0.12, 0.018, 0.026], [x, 0.285, 1.018], inkCarve);
  }

  // Front drip groove: a continuous dark recessed line, interrupted by hanging cuts.
  box([2.23, 0.026, 0.032], [0, 0.385, 0.862], inkCarve);
  box([2.18, 0.024, 0.026], [0, 0.425, 0.869], stoneLight);

  for (const x of [-1.02, -0.68, -0.34, 0, 0.34, 0.68, 1.02]) {
    box([0.018, 0.12, 0.022], [x, 0.33, 0.875], inkCarve, [
      0,
      0,
      (x % 0.68) * 10,
    ]);
    box([0.035, 0.025, 0.038], [x, 0.275, 0.883], stoneDark);
  }

  // A green mineral streak hanging below the right-hand drip.
  box([0.055, 0.22, 0.012], [0.91, 0.265, 0.887], verdigris, [
    0,
    0,
    -9,
  ]);
  box([0.026, 0.12, 0.014], [0.97, 0.185, 0.889], mossDark, [
    0,
    0,
    8,
  ]);
  box([0.022, 0.08, 0.014], [0.86, 0.155, 0.889], verdigris, [
    0,
    0,
    12,
  ]);

  // Repeating trefoil-arch carving along the face.
  const arch = [
    [-0.13, 0],
    [0.13, 0],
    [0.13, 0.105],
    [0.105, 0.155],
    [0.065, 0.18],
    [0.025, 0.145],
    [0, 0.205],
    [-0.025, 0.145],
    [-0.065, 0.18],
    [-0.105, 0.155],
    [-0.13, 0.105],
  ] as [number, number][];

  const archInset = [
    [-0.075, 0.025],
    [0.075, 0.025],
    [0.075, 0.095],
    [0.045, 0.13],
    [0.012, 0.108],
    [0, 0.155],
    [-0.012, 0.108],
    [-0.045, 0.13],
    [-0.075, 0.095],
  ] as [number, number][];

  for (const x of [-0.98, -0.66, -0.33, 0, 0.33, 0.66, 0.98]) {
    b.extrude(arch, {
      at: [x, 0.095, 0.872],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.004,
      color: stoneDark,
    });
    b.extrude(archInset, {
      at: [x, 0.098, 0.891],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      color: inkCarve,
    });
    box([0.018, 0.20, 0.018], [x - 0.145, 0.20, 0.889], stoneLight);
  }

  // Small quatrefoil bosses between the arches.
  for (const x of [-0.825, -0.495, -0.165, 0.165, 0.495, 0.825]) {
    cylinder(0.038, 0.018, [x, 0.265, 0.895], stoneLight, [90, 0, 0], 8);
    cylinder(0.019, 0.021, [x, 0.265, 0.908], inkCarve, [90, 0, 0], 6);
  }

  // Moss on the upper ledge: irregular low-poly caps, concentrated near cracks.
  mossPatch(
    [
      [-1.05, 0.512, -0.78],
      [-0.72, 0.512, -0.82],
      [-0.62, 0.512, -0.64],
      [-0.85, 0.512, -0.56],
      [-1.12, 0.512, -0.61],
    ],
    mossGreen,
    0.024,
  );
  mossPatch(
    [
      [-0.34, 0.512, -0.93],
      [0.02, 0.512, -0.95],
      [0.13, 0.512, -0.77],
      [-0.18, 0.512, -0.68],
      [-0.42, 0.512, -0.76],
    ],
    mossDark,
    0.021,
  );
  mossPatch(
    [
      [0.56, 0.512, -0.88],
      [0.91, 0.512, -0.92],
      [1.10, 0.512, -0.72],
      [0.79, 0.512, -0.61],
      [0.49, 0.512, -0.69],
    ],
    mossGreen,
    0.026,
  );
  mossPatch(
    [
      [0.18, 0.512, 0.12],
      [0.43, 0.512, 0.18],
      [0.51, 0.512, 0.34],
      [0.28, 0.512, 0.39],
      [0.11, 0.512, 0.27],
    ],
    mossDark,
    0.018,
  );

  // Scattered square moss cushions in seams and around the creature's future feet.
  const cushions: [number, number, number, number, string][] = [
    [-1.02, 0.514, -0.28, 0.08, mossDark],
    [-0.76, 0.514, 0.42, 0.07, mossGreen],
    [-0.26, 0.514, 0.58, 0.06, mossDark],
    [0.18, 0.514, -0.51, 0.085, mossGreen],
    [0.62, 0.514, 0.52, 0.07, mossDark],
    [1.00, 0.514, -0.35, 0.06, mossGreen],
  ];
  for (const [x, y, z, r, color] of cushions) {
    box([r * 2.2, 0.028, r * 1.35], [x, y, z], color, [
      0,
      (random() - 0.5) * 18,
      (random() - 0.5) * 12,
    ]);
  }

  // Moss and dark mineral growth tucked beneath the front lip.
  for (const [x, y, z, w, h, color] of [
    [-1.08, 0.455, 0.88, 0.18, 0.07, mossDark],
    [-0.72, 0.452, 0.89, 0.13, 0.05, mossGreen],
    [0.43, 0.454, 0.89, 0.16, 0.06, mossDark],
    [0.78, 0.455, 0.89, 0.21, 0.075, mossGreen],
    [1.07, 0.45, 0.89, 0.11, 0.05, mossDark],
  ] as [number, number, number, number, number, string][]) {
    box([w, h, 0.035], [x, y, z], color, [0, 0, (random() - 0.5) * 20]);
  }

  // Chisel marks on the top and front edge: short, deliberately faceted cuts.
  for (const x of [-1.14, -0.91, -0.48, 0.28, 0.73, 1.13]) {
    box([0.025, 0.012, 0.22], [x, 0.512, 0.20 + (random() - 0.5) * 0.12], stoneLight, [
      0,
      (random() - 0.5) * 12,
      (random() - 0.5) * 20,
    ]);
  }
  for (const x of [-1.08, -0.55, 0.12, 0.56, 1.08]) {
    box([0.022, 0.13, 0.015], [x, 0.17, 0.872], stoneShadow, [
      0,
      0,
      (random() - 0.5) * 22,
    ]);
  }

  // A few pale worn chips break the otherwise regular gothic rhythm.
  box([0.10, 0.035, 0.07], [-0.42, 0.515, 0.80], stoneLight, [0, 8, -12]);
  box([0.065, 0.028, 0.09], [0.37, 0.517, 0.82], stoneLight, [0, -7, 15]);
  box([0.08, 0.025, 0.05], [1.11, 0.515, 0.12], stoneLight, [0, 12, 4]);
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { catmull, createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const neck = J.neck;
  const jaw = J.jaw;
  const R = rng(41);

  const stoneMid = P.stoneMid;
  const stoneLight = P.stoneLight;
  const stoneDark = P.stoneDark;
  const stoneShadow = P.stoneShadow;
  const hornBone = P.hornBone;
  const hornDark = P.hornDark;
  const ink = P.inkCarve;
  const ember = P.emberGlow;
  const core = P.emberCore;
  const verdigris = P.verdigris;

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    options: any = {},
  ) =>
    b.part(geo, color, {
      at,
      bone,
      flat: true,
      ...options,
    });

  const sphere = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone: any = head,
    seg = 10,
  ) =>
    part(
      new THREE.SphereGeometry(1, seg, Math.max(6, Math.floor(seg * 0.75))),
      color,
      at,
      bone,
      { scale },
    );

  const box = (
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    bone: any = head,
  ) =>
    part(
      new THREE.BoxGeometry(1, 1, 1),
      color,
      at,
      bone,
      { scale },
    );

  const cyl = (
    color: string,
    at: [number, number, number],
    radius: number,
    height: number,
    bone: any = head,
    rotation: [number, number, number] = [0, 0, 0],
    radial = 8,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius * 1.06, height, radial, 1),
      color,
      at,
      bone,
      { rotation },
    );

  const cone = (
    color: string,
    at: [number, number, number],
    radius: number,
    height: number,
    dir: [number, number, number],
    bone: any = head,
  ) =>
    part(
      new THREE.ConeGeometry(radius, height, 7, 1),
      color,
      at,
      bone,
      { dir, axis: "y" },
    );

  // Neck: stacked, irregular carved stone rolls joining the chest to the skull.
  const neckRings = [
    [0, 1.285, 0.29, 0.19, 0.11, stoneDark],
    [0, 1.325, 0.30, 0.22, 0.12, stoneLight],
    [0, 1.365, 0.315, 0.20, 0.115, stoneMid],
    [0, 1.405, 0.335, 0.225, 0.12, stoneLight],
    [0, 1.445, 0.36, 0.215, 0.12, stoneMid],
  ] as const;

  for (const [x, y, z, r, h, color] of neckRings) {
    cyl(color, [x, y, z], r, h, neck, [0, 0, 0], 8);
    cyl(ink, [x, y + h * 0.48, z + 0.002], r * 0.82, 0.012, neck, [0, 0, 0], 8);
  }

  // Small angular throat wedges and a dark underside.
  box(stoneShadow, [0, 1.40, 0.43], [0.30, 0.16, 0.20], neck);
  box(stoneDark, [0, 1.475, 0.43], [0.36, 0.09, 0.18], head);

  // Broad skull, cheek masses, and a slightly flattened crown.
  sphere(stoneMid, [0, 1.61, 0.57], [0.47, 0. thirty ?? 0.31, 0.36], head, 12);
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { catmull, frame, rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: Ctx) {
  const stoneMid = P.stoneMid;
  const stoneLight = P.stoneLight;
  const stoneDark = P.stoneDark;
  const wingStone = P.wingStone;
  const hornBone = P.hornBone;
  const mossGreen = P.mossGreen;
  const mossDark = P.mossDark;
  const verdigris = P.verdigris;
  const ink = P.inkCarve;

  const sides = [1, -1] as const;

  const v = (s: number, x: number, y: number, z: number): [number, number, number] => [
    s * x,
    y,
    z,
  ];

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.sweep([a, c], radius, {
      bone,
      color,
      sides: 6,
      caps: "round",
      name,
      group: "wings",
    });

  const knob = (
    at: [number, number, number],
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.IcosahedronGeometry(radius, 1), color, {
      at,
      bone,
      flat: true,
      name,
      group: "wings",
    });

  const seam = (joint: any, radius: number, color: string, name: string) => {
    b.part(
      new THREE.TorusGeometry(radius, 0.012, 5, 8),
      color,
      {
        at: joint.at,
        bone: joint,
        dir: joint.axis,
        name,
        group: "wings",
      },
    );
  };

  for (const s of sides) {
    const root = J[`wingRoot${s > 0 ? "L" : "R"}`];
    const mid = J[`wingMid${s > 0 ? "L" : "R"}`];
    const tip = J[`wingTip${s > 0 ? "L" : "R"}`];

    const rootP = v(s, 0.40, 1.20, -0.08);
    const midP = v(s, 0.78, 1.62, -0.30);
    const tipP = v(s, 1.00, 1.93, -0.57);

    // Heavy carved wing arm / leading edge.
    b.sweep(
      catmull([rootP, midP, tipP]),
      (t) => 0.105 - t * 0.045,
      {
        bone: [root, mid, tip],
        color: stoneMid,
        sides: 7,
        caps: "round",
        name: `wingsArm${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // Pale raised ridge riding along the upper leading edge.
    const ridgeA = v(s, 0.43, 1.25, -0.075);
    const ridgeB = v(s, 0.80, 1.69, -0.275);
    const ridgeC = v(s, 1.015, 1.985, -0.535);
    b.sweep(
      catmull([ridgeA, ridgeB, ridgeC]),
      [0.032, 0.012],
      {
        bone: [root, mid, tip],
        color: stoneLight,
        sides: 6,
        caps: { start: "round", end: "point" },
        name: `wingsLeadingRidge${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // Broad folded bat membrane with three unmistakable gothic scallops.
    const membrane = [
      v(s, 0.39, 1.20, -0.12),
      v(s, 0.68, 1.52, -0.43),
      v(s, 0.96, 1.90, -0.59),
      v(s, 1.08, 1.98, -0.62),
      v(s, 1.02, 1.64, -0.56),
      v(s, 0.90, 1.43, -0.49),
      v(s, 0.78, 1.25, -0.39),
      v(s, 0.62, 1.10, -0.28),
      v(s, 0.47, 1.08, -0.19),
    ];

    b.slab(membrane, {
      bone: root,
      color: wingStone,
      thickness: 0.022,
      name: `wingsMembrane${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Rolled dark stone around the scalloped trailing edge.
    const trailing = [
      v(s, 1.08, 1.98, -0.62),
      v(s, 1.02, 1.64, -0.56),
      v(s, 0.90, 1.43, -0.49),
      v(s, 0.78, 1.25, -0.39),
      v(s, 0.62, 1.10, -0.28),
      v(s, 0.47, 1.08, -0.19),
    ];
    for (let i = 0; i < trailing.length - 1; i++) {
      rod(
        trailing[i],
        trailing[i + 1],
        0.025,
        stoneDark,
        root,
        `wingsScallopRim${s > 0 ? "L" : "R"}_${i}`,
      );
    }

    // Lower root fold, giving the wing a thick carved socket.
    rod(
      v(s, 0.39, 1.20, -0.12),
      v(s, 0.47, 1.08, -0.19),
      0.065,
      stoneDark,
      root,
      `wingsRootFold${s > 0 ? "L" : "R"}`,
    );

    // Interior finger struts fan from the shoulder toward each scallop.
    const strutTargets = [
      v(s, 0.64, 1.48, -0.39),
      v(s, 0.78, 1.38, -0.43),
      v(s, 0.90, 1.28, -0.47),
      v(s, 0.99, 1.20, -0.50),
    ];
    for (let i = 0; i < strutTargets.length; i++) {
      const start = v(s, 0.46 + i * 0.025, 1.25 - i * 0.018, -0.16 - i * 0.025);
      rod(
        start,
        strutTargets[i],
        0.014,
        stoneDark,
        root,
        `wingsFinger${s > 0 ? "L" : "R"}_${i}`,
      );
      knob(
        strutTargets[i],
        0.025,
        stoneMid,
        root,
        `wingsFingerKnuckle${s > 0 ? "L" : "R"}_${i}`,
      );
    }

    // Raised carved ribs crossing the upper membrane.
    const ribStarts = [
      v(s, 0.54, 1.30, -0.22),
      v(s, 0.64, 1.42, -0.31),
      v(s, 0.74, 1.54, -0.39),
    ];
    const ribEnds = [
      v(s, 0.84, 1.78, -0.53),
      v(s, 0.94, 1.86, -0.57),
      v(s, 1.00, 1.91, -0.60),
    ];
    for (let i = 0; i < ribStarts.length; i++) {
      rod(
        ribStarts[i],
        ribEnds[i],
        0.010,
        stoneLight,
        root,
        `wingsCarvedRib${s > 0 ? "L" : "R"}_${i}`,
      );
    }

    // Joint collars and faceted elbow stones.
    seam(root, 0.115, ink, `wingsRootSeam${s > 0 ? "L" : "R"}`);
    seam(mid, 0.087, ink, `wingsMidSeam${s > 0 ? "L" : "R"}`);
    seam(tip, 0.058, ink, `wingsTipSeam${s > 0 ? "L" : "R"}`);

    knob(midP, 0.105, stoneMid, mid, `wingsElbowKnob${s > 0 ? "L" : "R"}`);
    knob(tipP, 0.065, stoneLight, tip, `wingsWristKnob${s > 0 ? "L" : "R"}`);

    // Small hooked claw at each wing wrist, curling toward the face.
    b.spike(
      tipP,
      [0, -0.22, 0.98],
      0.16,
      0.026,
      {
        bone: tip,
        color: hornBone,
        sides: 6,
        caps: "point",
        name: `wingsWristClaw${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // A second, shorter hooked talon tucked behind the wrist.
    b.spike(
      v(s, 0.99, 1.91, -0.59),
      [0, -0.38, 0.92],
      0.105,
      0.018,
      {
        bone: tip,
        color: hornBone,
        sides: 6,
        caps: "point",
        name: `wingsWristHook${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    // Root shoulder moss: chunky low-poly tufts seated on the upper wing root.
    const mossRoot = v(s, 0.48, 1.28, -0.055);
    for (let i = 0; i < 4; i++) {
      const p = v(
        s,
        0.43 + i * 0.035,
        1.275 + (i % 2) * 0.018,
        -0.065 - (i % 3) * 0.018,
      );
      b.spike(
        p,
        [0, 1, -0.12 - i * 0.04],
        0.075 + (i % 2) * 0.018,
        0.022,
        {
          bone: root,
          color: i % 2 ? mossDark : mossGreen,
          sides: 5,
          caps: "point",
          name: `wingsMoss${s > 0 ? "L" : "R"}_${i}`,
          group: "wings",
        },
      );
    }

    // A thin verdigris weather streak low on the membrane.
    const stain = [
      v(s, 0.57, 1.20, -0.285),
      v(s, 0.66, 1.27, -0.305),
      v(s, 0.74, 1.34, -0.34),
    ];
    b.sweep(stain, 0.009, {
      bone: root,
      color: verdigris,
      sides: 5,
      caps: "flat",
      name: `wingsVerdigris${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    // Tiny dark chips at the membrane root read as carved recesses.
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.BoxGeometry(0.035, 0.012, 0.008),
        ink,
        {
          at: v(s, 0.52 + i * 0.045, 1.25 + i * 0.035, -0.265 - i * 0.025),
          bone: root,
          rotation: [0, s * (18 + i * 7), s * 12],
          name: `wingsCarveChip${s > 0 ? "L" : "R"}_${i}`,
          group: "wings",
        },
      );
    }
  }
}
```

<!-- call: torso -->

```ts
import * as THREE from "three";
import {
  bezier,
  b,
  catmull,
  createBuilder,
  frame,
  rng,
} from "agentic-3js-builder";

export function buildTorso({ b, J, P, M }: Ctx) {
  const STONE_LIGHT = P.stoneLight;
  const STONE_MID = P.stoneMid;
  const STONE_DARK = P.stoneDark;
  const STONE_SHADOW = P.stoneShadow;
  const CLAW = P.clawStone;
  const INK = P.inkCarve;
  const MOSS = P.mossGreen;
  const MOSS_DARK = P.mossDark;
  const VERDIGRIS = P.verdigris;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const sphere = (
    at: readonly number[],
    scale: [number, number, number],
    color: string,
    bone: any,
    name: string,
    segments = 8,
  ) => {
    return b.part(
      new THREE.SphereGeometry(1, segments, Math.max(5, segments - 2)),
      color,
      {
        at,
        bone,
        scale,
        flat: true,
        name,
        group: "torso",
      },
    );
  };

  const box = (
    at: readonly number[],
    size: [number, number, number],
    color: string,
    bone: any,
    name: string,
    rotation?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
      group: "torso",
    });
  };

  const rod = (
    a: readonly number[],
    z: readonly number[],
    radius: number,
    color: string,
    bone: any,
    name: string,
    caps: "round" | "flat" | "point" = "round",
  ) => {
    return b.sweep([a, z], radius, {
      bone,
      color,
      caps,
      sides: 7,
      name,
      group: "torso",
    });
  };

  const carvedRod = (
    a: readonly number[],
    z: readonly number[],
    radius: number,
    bone: any,
    name: string,
  ) => {
    rod(a, z, radius, INK, bone, `${name}Carve`, "flat");
  };

  const addClawedFinger = (
    side: number,
    index: number,
    root: readonly number[],
    forward: number,
    spread: number,
  ) => {
    const x = root[0] + side * spread;
    const y = root[1] + 0.012 * index;
    const z = root[2] + forward;
    const knuckle: [number, number, number] = [
      x,
      y + 0.012,
      z + 0.1,
    ];
    const hook: [number, number, number] = [
      x + side * 0.006,
      0.535 - index * 0.006,
      0.79 + forward * 0.18,
    ];

    rod(
      [x, y, z],
      knuckle,
      0.027 - index * 0.002,
      STONE_MID,
      side > 0 ? J.handL : J.handR,
      `finger${side > 0 ? "L" : "R"}${index}`,
    );
    rod(
      knuckle,
      hook,
      0.018,
      CLAW,
      side > 0 ? J.handL : J.handR,
      `finger${side > 0 ? "L" : "R"}${index}Hook`,
      "flat",
    );
    b.spike(
      hook,
      [0, -0.28, 0.96],
      0.09,
      0.014,
      {
        color: CLAW,
        bone: side > 0 ? J.handL : J.handR,
        caps: { end: "point" },
        name: `finger${side > 0 ? "L" : "R"}${index}Claw`,
        group: "torso",
      },
    );
    carvedRod(
      [x - side * 0.018, y + 0.023, z + 0.02],
      [x + side * 0.018, y + 0.035, z + 0.085],
      0.0045,
      side > 0 ? J.handL : J.handR,
      `finger${side > 0 ? "L" : "R"}${index}Chisel`,
    );
  };

  // Main hunched torso: narrow at the waist, broad and deep at the shoulders.
  b.loft(
    [
      { at: [0, 0.66, -0.28], w: 0.62, h: 0.34 },
      { at: [0, 0.82, -0.12], w: 0.82, h: 0.48 },
      { at: [0, 1.04, 0.02], w: 1.03, h: 0.58 },
      { at: [0, 1.24, 0.18], w: 0.92, h: 0.52 },
      { at: [0, 1.34, 0.28], w: 0.62, h: 0.34 },
    ],
    {
      bone: [J.hips, J.chest],
      color: STONE_MID,
      section: "box",
      sides: 8,
      name: "barrelTorso",
      group: "torso",
    },
  );

  // Dark lower belly and warm upper chest facets, layered as carved stone plates.
  sphere([0, 0.79, 0.27], [0.43, 0.27, 0.095], STONE_SHADOW, J.hips, "bellyShadow");
  sphere([0, 1.08, 0.43], [0.47, 0.26, 0.075], STONE_LIGHT, J.chest, "upperChestLight");
  sphere([0, 1.2, 0.37], [0.29, 0.19, 0.065], STONE_LIGHT, J.chest, "sternumPlate");

  // Heavy haunch mass rounding into the crouch.
  sphere([0.31, 0.66, -0.28], [0.37, 0.30, 0.42], STONE_MID, J.hips, "haunchL");
  sphere([-0.31, 0.66, -0.28], [0.37, 0.30, 0.42], STONE_MID, J.hips, "haunchR");
  sphere([0, 0.61, -0.42], [0.43, 0.20, 0.25], STONE_DARK, J.hips, "haunchSeatShadow");

  // Shoulder masses, deliberately angular and oversized.
  sphere([0.44, 1.13, 0.04], [0.31, 0.27, 0.30], STONE_MID, J.chest, "shoulderMassL");
  sphere([-0.44, 1.13, 0.04], [0.31, 0.27, 0.30], STONE_MID, J.chest, "shoulderMassR");
  box([0.42, 1.29, 0.14], [0.28, 0.12, 0.25], STONE_LIGHT, J.chest, "shoulderCapL", [0.12, 0, -0.18]);
  box([-0.42, 1.29, 0.14], [0.28, 0.12, 0.25], STONE_LIGHT, J.chest, "shoulderCapR", [-0.12, 0, 0.18]);

  // Three broad raised rib arches on the front of the chest.
  const ribData = [
    { y: 0.86, half: 0.29, z: 0.46 },
    { y: 1.00, half: 0.38, z: 0.49 },
    { y: 1.14, half: 0.35, z: 0.45 },
  ];
  ribData.forEach((r, i) => {
    const arch = bezier(
      [-r.half, r.y, r.z],
      [-r.half * 0.45, r.y + 0.075, r.z + 0.018],
      [r.half * 0.45, r.y + 0.075, r.z + 0.018],
      [r.half, r.y, r.z],
    );
    b.sweep(arch, 0.021, {
      bone: J.chest,
      color: STONE_LIGHT,
      sides: 6,
      caps: "round",
      name: `ribArch${i + 1}`,
      group: "torso",
    });
    const recess = bezier(
      [-r.half * 0.92, r.y - 0.028, r.z + 0.018],
      [-r.half * 0.42, r.y + 0.038, r.z + 0.042],
      [r.half * 0.42, r.y + 0.038, r.z + 0.042],
      [r.half * 0.92, r.y - 0.028, r.z + 0.018],
    );
    b.sweep(recess, 0.006, {
      bone: J.chest,
      color: INK,
      sides: 5,
      caps: "flat",
      name: `ribRecess${i + 1}`,
      group: "torso",
    });
  });

  // Central sternum keel and two pectoral plates.
  rod([0, 0.76, 0.505], [0, 1.28, 0.51], 0.024, STONE_LIGHT, J.chest, "sternumKeel");
  rod([0, 0.76, 0.531], [0, 1.28, 0.531], 0.006, INK, J.chest, "sternumCarve", "flat");
  sphere([0.22, 1.08, 0.465], [0.25, 0.14, 0.045], STONE_LIGHT, J.chest, "pectoralL");
  sphere([-0.22, 1.08, 0.465], [0.25, 0.14, 0.045], STONE_LIGHT, J.chest, "pectoralR");
  carvedRod([0.04, 1.06, 0.52], [0.31, 1.13, 0.505], 0.006, J.chest, "pectoralSeamL");
  carvedRod([-0.04, 1.06, 0.52], [-0.31, 1.13, 0.505], 0.006, J.chest, "pectoralSeamR");

  // Small spine stones visible above the hunched back.
  [
    [0, 0.78, -0.52],
    [0, 0.9, -0.46],
    [0, 1.02, -0.36],
    [0, 1.14, -0.22],
    [0, 1.24, -0.08],
  ].forEach((p, i) =>
    sphere(p, [0.065, 0.075, 0.09], STONE_LIGHT, J.chest, `spineRidge${i}`, 7),
  );

  // Left and right braced arms, following the authored arm joints.
  const armPaths = [
    {
      side: 1,
      bone: [J.shoulderL, J.elbowL, J.handL],
      pts: [
        [0.45, 1.13, 0.1],
        [0.62, 0.76, 0.4],
        [0.5, 0.59, 0.66],
      ],
    },
    {
      side: -1,
      bone: [J.shoulderR, J.elbowR, J.handR],
      pts: [
        [-0.45, 1.13, 0.1],
        [-0.62, 0.76, 0.4],
        [-0.5, 0.59, 0.66],
      ],
    },
  ];

  for (const arm of armPaths) {
    const s = arm.side;
    b.sweep(catmull(arm.pts), (t: number) => (t < 0.48 ? 0.115 : 0.09), {
      bone: arm.bone,
      color: STONE_MID,
      section: { ngon: 7 },
      caps: "round",
      name: `arm${s > 0 ? "L" : "R"}Mass`,
      group: "torso",
    });

    sphere(
      [s * 0.62, 0.75, 0.41],
      [0.13, 0.13, 0.13],
      STONE_DARK,
      s > 0 ? J.elbowL : J.elbowR,
      `elbow${s > 0 ? "L" : "R"}Knot`,
    );
    rod(
      [s * 0.51, 0.9, 0.29],
      [s * 0.7, 0.72, 0.45],
      0.009,
      INK,
      s > 0 ? J.elbowL : J.elbowR,
      `elbow${s > 0 ? "L" : "R"}Crease`,
      "flat",
    );

    sphere(
      [s * 0.5, 0.585, 0.67],
      [0.13, 0.095, 0.14],
      STONE_LIGHT,
      s > 0 ? J.handL : J.handR,
      `fist${s > 0 ? "L" : "R"}`,
    );

    // Four hooked fingers reach over the ledge lip.
    for (let i = 0; i < 4; i++) {
      const root: [number, number, number] = [
        s * (0.405 + i * 0.062),
        0.59,
        0.71 + (i % 2) * 0.018,
      ];
      addClawedFinger(s, i, root, 0.035 + i * 0.008, 0);
    }

    // Knuckle blocks and tendon cuts.
    for (let i = 0; i < 3; i++) {
      sphere(
        [s * (0.43 + i * 0.065), 0.642, 0.73],
        [0.032, 0.022, 0.035],
        STONE_LIGHT,
        s > 0 ? J.handL : J.handR,
        `knuckle${s > 0 ? "L" : "R"}${i}`,
        6,
      );
      carvedRod(
        [s * (0.42 + i * 0.065), 0.615, 0.77],
        [s * (0.42 + i * 0.065), 0.57, 0.80],
        0.004,
        s > 0 ? J.handL : J.handR,
        `tendon${s > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // Carved shadow seam beneath the chest and a small armpit verdigris run.
  b.sweep(
    bezier([-0.37, 0.88, 0.48], [-0.2, 0.82, 0.53], [0.2, 0.82, 0.53], [0.37, 0.88, 0.48]),
    0.009,
    {
      bone: J.chest,
      color: INK,
      caps: "flat",
      sides: 5,
      name: "lowerChestSeam",
      group: "torso",
    },
  );
  b.sweep(
    bezier([0.42, 1.02, 0.31], [0.48, 0.96, 0.38], [0.51, 0.9, 0.4], [0.54, 0.84, 0.43]),
    [0.018, 0.004],
    {
      bone: J.chest,
      color: VERDIGRIS,
      caps: "point",
      sides: 6,
      name: "armpitVerdigris",
      group: "torso",
    },
  );

  // Moss flecks tucked into the shoulder and haunch crevices.
  sphere([0.51, 1.31, -0.015], [0.07, 0.018, 0.045], MOSS, J.chest, "shoulderMoss", 6);
  sphere([0.46, 1.29, -0.025], [0.035, 0.012, 0.028], MOSS_DARK, J.chest, "shoulderMossDark", 6);
  sphere([-0.1, 0.61, -0.5], [0.09, 0.025, 0.045], MOSS_DARK, J.hips, "haunchMoss", 6);

  // A few square chisel chips on the lower torso make the silhouette feel carved.
  box([0.51, 0.81, 0.02], [0.07, 0.12, 0.055], STONE_DARK, J.chest, "sideChiselL", [0, 0.15, 0.1]);
  box([-0.51, 0.81, 0.02], [0.07, 0.12, 0.055], STONE_DARK, J.chest, "sideChiselR", [0, -0.15, -0.1]);
}
```

<!-- call: legsAndTail -->

```ts
import * as THREE from "three";
import { catmull, frame, rng } from "agentic-3js-builder";

export function buildLegsAndTail({ b, J, P, M }: Ctx) {
  const stoneLight = P.stoneLight;
  const stoneMid = P.stoneMid;
  const stoneDark = P.stoneDark;
  const stoneShadow = P.stoneShadow;
  const mossGreen = P.mossGreen;
  const mossDark = P.mossDark;
  const clawStone = P.clawStone;
  const ink = P.inkCarve;

  const random = rng(7319);

  const sphere = (
    at: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone: any,
    name: string,
    scale?: [number, number, number],
  ) => {
    return b.part(new THREE.IcosahedronGeometry(radius, 1), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
      group: "legsAndTail",
    });
  };

  const box = (
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    color: string,
    bone: any,
    name: string,
    dir?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      dir,
      flat: true,
      name,
      group: "legsAndTail",
    });
  };

  const ridge = (
    a: any,
    c: any,
    radius: number,
    color: string,
    bone: any,
    name: string,
  ) => {
    return b.sweep([a, c], radius, {
      bone,
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "legsAndTail",
    });
  };

  const claw = (
    base: any,
    tip: [number, number, number],
    bone: any,
    name: string,
    radius = 0.026,
  ) => {
    return b.sweep([base, tip], [radius, 0.004], {
      bone,
      color: clawStone,
      section: { ngon: 6 },
      caps: "point",
      name,
      group: "legsAndTail",
    });
  };

  const darkCrease = (
    a: [number, number, number],
    c: [number, number, number],
    bone: any,
    name: string,
    radius = 0.012,
  ) => {
    return b.sweep([a, c], radius, {
      bone,
      color: ink,
      section: { ngon: 5 },
      caps: "flat",
      name,
      group: "legsAndTail",
    });
  };

  // ------------------------------------------------------------------------------------------------
  // Crouched left haunch: a heavy faceted thigh folded high, with a compact knee and lower hock.

  ridge(J.hipL, J.kneeL, [0.18, 0.145] as any, stoneMid, [J.hipL, J.kneeL], "haunchThighL");
  sphere(J.hipL.at, 0.19, stoneMid, J.hipL, "haunchMassL", [1.05, 0.92, 1.12]);
  sphere(J.kneeL.at, 0.145, stoneLight, J.kneeL, "kneeKnuckleL", [1.05, 0.88, 1.12]);

  ridge(J.kneeL, J.ankleL, [0.095, 0.068] as any, stoneDark, [J.kneeL, J.ankleL], "shinL");
  ridge(J.ankleL, J.toeL, [0.11, 0.075] as any, stoneMid, [J.ankleL, J.toeL], "flatFootL");
  sphere(J.ankleL.at, 0.085, stoneDark, J.ankleL, "hockL", [1.1, 0.75, 1.2]);
  sphere(J.toeL.at, 0.105, stoneLight, J.toeL, "toePadL", [1.25, 0.58, 1.35]);

  // Left knee and ankle carving.
  darkCrease(
    [0.405, 0.91, 0.02],
    [0.56, 0.9, 0.09],
    J.kneeL,
    "kneeFoldL",
    0.014,
  );
  darkCrease(
    [0.395, 0.64, 0.31],
    [0.47, 0.62, 0.38],
    J.ankleL,
    "ankleFoldL",
    0.011,
  );
  ridge(
    [0.41, 0.96, -0.11],
    [0.52, 0.98, -0.01],
    0.018,
    stoneLight,
    J.kneeL,
    "kneeCarveL",
  );

  // Left heel spur and three hooked toes.
  b.spike(J.ankleL, [-0.12, 0.14, -0.28], 0.13, 0.035, {
    bone: J.ankleL,
    color: clawStone,
    name: "heelSpurL",
    group: "legsAndTail",
  });

  claw(J.toeL, [0.29, 0.48, 0.84], J.toeL, "toeClawL0", 0.028);
  claw(J.toeL, [0.42, 0.47, 0.91], J.toeL, "toeClawL1", 0.029);
  claw(J.toeL, [0.55, 0.48, 0.84], J.toeL, "toeClawL2", 0.027);
  ridge(
    [0.35, 0.535, 0.67],
    [0.35, 0.55, 0.77],
    0.014,
    stoneDark,
    J.toeL,
    "toeKnuckleL0",
  );
  ridge(
    [0.44, 0.535, 0.68],
    [0.44, 0.55, 0.79],
    0.014,
    stoneDark,
    J.toeL,
    "toeKnuckleL1",
  );
  ridge(
    [0.51, 0.535, 0.67],
    [0.51, 0.55, 0.76],
    0.013,
    stoneDark,
    J.toeL,
    "toeKnuckleL2",
  );

  // ------------------------------------------------------------------------------------------------
  // Mirrored right haunch.

  ridge(J.hipR, J.kneeR, [0.18, 0.145] as any, stoneMid, [J.hipR, J.kneeR], "haunchThighR");
  sphere(J.hipR.at, 0.19, stoneMid, J.hipR, "haunchMassR", [1.05, 0.92, 1.12]);
  sphere(J.kneeR.at, 0.145, stoneLight, J.kneeR, "kneeKnuckleR", [1.05, 0.88, 1.12]);

  ridge(J.kneeR, J.ankleR, [0.095, 0.068] as any, stoneDark, [J.kneeR, J.ankleR], "shinR");
  ridge(J.ankleR, J.toeR, [0.11, 0.075] as any, stoneMid, [J.ankleR, J.toeR], "flatFootR");
  sphere(J.ankleR.at, 0.085, stoneDark, J.ankleR, "hockR", [1.1, 0.75, 1.2]);
  sphere(J.toeR.at, 0.105, stoneLight, J.toeR, "toePadR", [1.25, 0.58, 1.35]);

  darkCrease(
    [-0.405, 0.91, 0.02],
    [-0.56, 0.9, 0.09],
    J.kneeR,
    "kneeFoldR",
    0.014,
  );
  darkCrease(
    [-0.395, 0.64, 0.31],
    [-0.47, 0.62, 0.38],
    J.ankleR,
    "ankleFoldR",
    0.011,
  );
  ridge(
    [-0.41, 0.96, -0.11],
    [-0.52, 0.98, -0.01],
    0.018,
    stoneLight,
    J.kneeR,
    "kneeCarveR",
  );

  b.spike(J.ankleR, [0.12, 0.14, -0.28], 0.13, 0.035, {
    bone: J.ankleR,
    color: clawStone,
    name: "heelSpurR",
    group: "legsAndTail",
  });

  claw(J.toeR, [-0.29, 0.48, 0.84], J.toeR, "toeClawR0", 0.028);
  claw(J.toeR, [-0.42, 0.47, 0.91], J.toeR, "toeClawR1", 0.029);
  claw(J.toeR, [-0.55, 0.48, 0.84], J.toeR, "toeClawR2", 0.027);
  ridge(
    [-0.35, 0.535, 0.67],
    [-0.35, 0.55, 0.77],
    0.014,
    stoneDark,
    J.toeR,
    "toeKnuckleR0",
  );
  ridge(
    [-0.44, 0.535, 0.68],
    [-0.44, 0.55, 0.79],
    0.014,
    stoneDark,
    J.toeR,
    "toeKnuckleR1",
  );
  ridge(
    [-0.51, 0.535, 0.67],
    [-0.51, 0.55, 0.76],
    0.013,
    stoneDark,
    J.toeR,
    "toeKnuckleR2",
  );

  // A few small carved plates make the folded haunches read as stone musculature.
  for (const s of [1, -1]) {
    const bone = s > 0 ? J.hipL : J.hipR;
    for (let i = 0; i < 3; i++) {
      const z = -0.16 + i * 0.12;
      ridge(
        [s * (0.29 + i * 0.018), 0.72 + i * 0.035, z],
        [s * (0.48 + i * 0.018), 0.79 + i * 0.035, z + 0.045],
        0.014,
        i === 1 ? stoneLight : stoneDark,
        bone,
        `haunchPlate${s > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Moss in the crotch and under the folded haunches. The individual spikes form a chipped, organic tuft.

  const mossPoints: [number, number, number][] = [
    [-0.16, 0.73, -0.18],
    [-0.08, 0.76, -0.21],
    [0.01, 0.75, -0.19],
    [0.11, 0.77, -0.2],
    [0.19, 0.74, -0.16],
  ];
  mossPoints.forEach((p, i) => {
    const h = 0.055 + random() * 0.035;
    b.spike(p, [0, 1, 0], h, 0.025, {
      bone: J.hips,
      color: i % 2 ? mossDark : mossGreen,
      name: `crotchMoss${i}`,
      group: "legsAndTail",
    });
  });

  // Moss clings to the top of the feet where they press onto the ledge.
  for (const [s, bone] of [
    [1, J.toeL],
    [-1, J.toeR],
  ] as const) {
    for (let i = 0; i < 3; i++) {
      const p: [number, number, number] = [
        s * (0.34 + i * 0.055),
        0.59 + (i % 2) * 0.012,
        0.57 + i * 0.055,
      ];
      b.spike(p, [0, 1, 0], 0.035 + i * 0.009, 0.018, {
        bone,
        color: i === 1 ? mossDark : mossGreen,
        name: `footMoss${s > 0 ? "L" : "R"}${i}`,
        group: "legsAndTail",
      });
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Tail. It begins as a massive carved root, lies on the ledge, curls to the model's left,
  // and rises slightly at the end in a blunt spade.

  const tailPath = catmull(
    [
      J.tail1.at,
      J.tail2.at,
      J.tail3.at,
      [0.96, 0.61, -0.33],
      [1.08, 0.66, -0.04],
      [1.02, 0.73, 0.22],
    ],
    { tension: 0.25 },
  );

  const tail = b.sweep(tailPath, (t: number) => 0.145 * (1 - t) + 0.035, {
    bone: [J.tail1, J.tail2, J.tail3],
    color: stoneMid,
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    name: "heavyCurlingTail",
    group: "legsAndTail",
  });

  // Dark underside and alternating carved ring bands.
  b.sweep(tailPath, (t: number) => 0.149 * (1 - t) + 0.038, {
    bone: [J.tail1, J.tail2, J.tail3],
    color: stoneDark,
    sectors: [[115, 245, stoneShadow]],
    bands: [
      [0.2, stoneMid],
      [0.38, stoneDark],
      [0.56, stoneMid],
      [0.72, stoneDark],
      [0.86, stoneMid],
    ],
    section: { ngon: 8 },
    caps: "none",
    name: "tailShadowBands",
    group: "legsAndTail",
  });

  const tailRingT = [0.12, 0.29, 0.45, 0.61, 0.76, 0.88];
  tailRingT.forEach((t, i) => {
    const at = tail.at(t);
    const tangent = tailPath.tangentAt(t);
    const radius = 0.145 * (1 - t) + 0.035;
    b.part(new THREE.TorusGeometry(radius * 1.01, 0.012, 5, 9), i % 2 ? stoneDark : stoneLight, {
      at: at.at,
      bone: at.bone ?? J.tail2,
      dir: tangent,
      flat: true,
      name: `tailCarvedRing${i}`,
      group: "legsAndTail",
    });
    if (i < 4) {
      b.spike(at, [0, 1, 0], 0.045 - i * 0.004, 0.019, {
        bone: at.bone ?? J.tail2,
        color: stoneLight,
        name: `tailDorsalSpike${i}`,
        group: "legsAndTail",
      });
    }
  });

  // Tail dorsal ridge stones follow the curve and become smaller toward the tip.
  for (let i = 0; i < 7; i++) {
    const t = 0.1 + i * 0.115;
    const at = tail.at(t, 0, 0.008);
    const r = 0.045 - i * 0.0045;
    sphere(at.at, r, i % 2 ? stoneLight : stoneDark, at.bone ?? J.tail2, `tailRidge${i}`, [
      0.7,
      1.3,
      0.75,
    ]);
  }

  // Broad carved spade at the curling tail's raised tip.
  const tip = tail.at(1);
  const spade = b.extrude(
    [
      [-0.08, 0],
      [0.08, 0],
      [0.13, 0.06],
      [0.1, 0.16],
      [0.035, 0.24],
      [0, 0.29, "sharp"],
      [-0.035, 0.24],
      [-0.1, 0.16],
      [-0.13, 0.06],
    ],
    {
      at: tip.at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.045, 0.018],
      bevel: 0.008,
      smoothing: 0,
      bone: tip.bone ?? J.tail3,
      color: stoneLight,
      name: "tailSpadeTip",
      group: "legsAndTail",
    },
  );
  darkCrease([1.02, 0.77, 0.23], [1.02, 0.88, 0.27], tip.bone ?? J.tail3, "tailTipCarve", 0.012);

  // Moss where the tail kisses the ledge.
  const tailMoss = [
    [0.68, 0.595, -0.55],
    [0.78, 0.604, -0.47],
    [0.87, 0.62, -0.37],
    [0.94, 0.65, -0.28],
  ] as [number, number, number][];
  tailMoss.forEach((p, i) => {
    b.spike(p, [0, 1, 0], 0.035 + random() * 0.025, 0.018, {
      bone: J.tail2,
      color: i % 2 ? mossDark : mossGreen,
      name: `tailMoss${i}`,
      group: "legsAndTail",
    });
  });

  // Small downward chips and shadow seams beneath the tail give it weight against the stone ledge.
  darkCrease([0.12, 0.57, -0.69], [0.31, 0.55, -0.82], J.tail1, "tailRootCrease", 0.014);
  darkCrease([0.39, 0.54, -0.84], [0.55, 0.53, -0.77], J.tail2, "tailUnderCrease", 0.012);
  b.spike([0.54, 0.55, -0.77], [0, -1, 0], 0.045, 0.018, {
    bone: J.tail2,
    color: stoneShadow,
    name: "tailContactChip",
    group: "legsAndTail",
  });
}
```