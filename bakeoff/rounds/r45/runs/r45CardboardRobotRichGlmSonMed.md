<!-- call: plan -->

```json
{
  "name": "Captain Cardboard",
  "description": "A stylized kid in a homemade cardboard-box robot costume: kraft box torso with a marker-drawn control panel, a box helmet with a taped visor window where the kid's face peeks out, an antenna, cardboard tube arms with mitts, cardboard boots, and a paper jetpack with zigzag paper flames on the back.",
  "builderName": "cardboardRobotKid",
  "size": [1.4, 1.88, 0.8],
  "layout": "A kid about 1.3 m tall standing facing +Z, feet flat on y = 0, wearing a robot costume made of kraft cardboard boxes and duct tape. From front to back: the big cardboard torso box (0.74 wide x 0.58 tall x 0.50 deep, y 0.58-1.16) with its blue control panel, gauges, buttons and tape band on the front face; above it a 0.44 m cube cardboard helmet (y 1.14-1.58) with a taped visor window in its front face where the kid's real face peeks out - eyes, blush, fringe of hair, mouth - and a thin antenna with a red ball rising from the helmet top to y 1.86. Arms hang in a rest pose slightly out and forward: cardboard tubes from shoulder pads on the torso box down to round cardboard mitts at y ~0.73. Below the torso box the kid's own legs show: denim shorts, cardboard thigh guards with a bare-knee gap, red painted knee discs, shin guards, and chunky cardboard boots whose soles rest flat on the floor at [+-0.17, 0, ~0.15]. On the back, a smaller cardboard jetpack box with two toilet-roll nozzles and flat zigzag paper flames trailing down to y ~0.6. Every surface is kraft cardboard brown with lighter cut edges, corrugation fluting strips on vertical edges, duct-tape patches and straps, and marker-drawn gauges, buttons and stickers in crayon-bright flat colours.",
  "palette": {
    "cardboard": "#c99a5b",
    "cardboardLight": "#e2bd87",
    "cardboardDark": "#8a6238",
    "fluting": "#b07f47",
    "tape": "#b6b0a4",
    "tapeDark": "#8d877b",
    "robotRed": "#d95d3a",
    "robotBlue": "#3a7bd0",
    "paintYellow": "#f2c230",
    "paintGreen": "#5aa457",
    "panelWhite": "#f4efe2",
    "ink": "#332f2a",
    "bolt": "#a9aeb3",
    "skin": "#f0b489",
    "blush": "#e88a6a",
    "hair": "#7a4a2b",
    "denim": "#4f6fa5",
    "sole": "#6b5136",
    "eyeWhite": "#fdfdf8",
    "iris": "#4a3222",
    "paperOrange": "#ef8f3a",
    "paperYellow": "#f8d458"
  },
  "mounts": {
    "collar": [0, 1.15, 0.02],
    "shoulderL": [0.36, 1.13, 0],
    "shoulderR": [-0.36, 1.13, 0],
    "hipL": [0.16, 0.6, 0],
    "hipR": [-0.16, 0.6, 0],
    "backMount": [0, 0.95, -0.26]
  },
  "joints": [
    { "name": "body", "at": [0, 0.9, 0.02], "dir": [0, 1, 0], "role": "spine" },
    { "name": "head", "parent": "body", "at": [0, 1.34, 0.05], "dir": [0, 0.98, 0.2], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.3, 0.1], "dir": [0, -0.35, 0.94], "role": "jaw" },
    { "name": "shoulderL", "parent": "body", "at": [0.36, 1.13, 0], "dir": [0.62, -0.72, 0.32], "role": "arm" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.52, 0.92, 0.07], "dir": [0.15, -0.82, 0.45], "role": "arm" },
    { "name": "wristL", "parent": "elbowL", "at": [0.55, 0.73, 0.17], "dir": [0.1, -0.6, 0.45], "role": "arm" },
    { "name": "shoulderR", "parent": "body", "at": [-0.36, 1.13, 0], "dir": [-0.62, -0.72, 0.32], "role": "arm" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.52, 0.92, 0.07], "dir": [-0.15, -0.82, 0.45], "role": "arm" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.55, 0.73, 0.17], "dir": [-0.1, -0.6, 0.45], "role": "arm" },
    { "name": "hipL", "parent": "body", "at": [0.16, 0.6, 0], "dir": [0.02, -1, 0.01], "role": "leg" },
    { "name": "kneeL", "parent": "hipL", "at": [0.17, 0.33, 0.01], "dir": [0, -1, 0.05], "role": "leg" },
    { "name": "footL", "parent": "kneeL", "at": [0.17, 0.11, 0.04], "dir": [0, 0, 1], "role": "leg" },
    { "name": "hipR", "parent": "body", "at": [-0.16, 0.6, 0], "dir": [-0.02, -1, 0.01], "role": "leg" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.17, 0.33, 0.01], "dir": [0, -1, 0.05], "role": "leg" },
    { "name": "footR", "parent": "kneeR", "at": [-0.17, 0.11, 0.04], "dir": [0, 0, 1], "role": "leg" }
  ],
  "parts": [
    {
      "id": "torsoBox",
      "builds": "The costume body: a big kraft-cardboard box worn round the kid's chest, 0.74 m wide x 0.58 m tall x 0.50 m deep spanning y 0.58-1.16, rigid on the body joint. Main box in `cardboard` with a `cardboardLight` rim strip along the bottom edge and thin vertical `fluting` strips (~8 half-round strips per edge) down the two front vertical corners to read as corrugated cardboard. Front face, all details seated 0.01 proud: a rounded control panel in `robotBlue` (0.30 x 0.22, centred [0, 0.92, 0.26]) with a `tape` border; on it a big gauge - a `panelWhite` disc 0.09 across with 12 tiny `ink` tick marks and an `ink` needle - plus a smaller `paintYellow` disc gauge beside it; two push-buttons below (a `robotRed` and a `paintGreen` cylinder, 0.025 across, 0.02 proud) and a small `paintGreen` switch lever. Below the panel a marker-drawn smiley: a `paintYellow` round sticker 0.10 across with two `ink` eye dots and an `ink` curve strip. A `tape` band 0.06 tall wrapping the box at y 0.66 with a `tapeDark` edge, a crossed tape 'X' repair patch at the lower front-right corner, and a few crayon squiggles as thin `robotRed` and `paintBlue` wavy strips flat on the lower front. Shoulder pads: quarter-disc cardboard pads (`cardboardLight`, 0.14 radius) on the box top corners at mounts shoulderL and shoulderR, each with a `bolt` stud on top. Collar: a `tape` ring 0.05 tall round the box top at mount collar, where the helmet sits. Side vents: three short `cardboardDark` slats low on each side. Bottom edge open with a short `cardboardDark` inner rim visible below the hips.",
      "box": [[-0.4, 0.56, -0.28], [0.4, 1.18, 0.28]],
      "attaches": "Rides the body joint; its top edge meets the helmet at mount collar [0, 1.15, 0.02]; its shoulder pads sit on mounts shoulderL/shoulderR where the arm tubes root; its open bottom edge is above the legs part's shorts at mounts hipL/hipR; its back face is the surface the jetpack part presses against at mount backMount.",
      "joints": ["body"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "helmet",
      "builds": "The costume head: a kraft-cardboard box helmet, 0.44 m cube centred [0, 1.36, 0.02] (y 1.14-1.58, z -0.20 to 0.24), rigid on the head joint; the kid's real face peeks through a visor window in the front face. Build the helmet as slabs, with the front face as four slabs around a window opening 0.26 wide x 0.17 tall centred [0, 1.385, 0.24]; frame the window with a `tape` border 0.02 wide. The kid's head inside: a rounded head sphere (`skin`, 0.105 radius) centred [0, 1.35, 0.06] riding the head joint, face turned to +Z; in the window show: two big eyes (each an `eyeWhite` disc 0.035 with an `iris` disc 0.02, an `ink` pupil 0.012 and a tiny white highlight dot), a `blush` disc 0.018 under each eye at its outer corner, a small `ink` nose dot, a fringe of `hair` tufts (5-6 small extruded triangular tufts) along the top of the window, and the mouth built as an upper lip strip on the head and a separate lower lip strip on the jaw joint at [0, 1.3, 0.1] so it can open. On the helmet: a thin antenna (0.008 rod, `bolt`) rising from the top at [0.10, 1.58, -0.02] to y 1.84 with a `robotRed` ball 0.035 on top; a crossed tape 'X' patch of two `tape` strips on the right side; a `paintYellow` round gauge sticker (0.06, `ink` needle) on the left side; two `bolt` studs on the sides; `cardboardLight` edge strips along the top edges and `fluting` strips down the front vertical edges; a small `hair` tuft poking out at the back bottom edge.",
      "box": [[-0.24, 1.1, -0.22], [0.24, 1.88, 0.26]],
      "attaches": "Rides the head and jaw joints; its bottom edge meets the torso box top at mount collar [0, 1.15, 0.02]; its face sits inside the window so it reads from the front; nothing in front of the face.",
      "joints": ["head", "jaw"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "arms",
      "builds": "Both costume arms: cardboard tubes in a rest pose hanging slightly out and forward. Upper arm: a tube (0.075 radius) from mount shoulderL [0.36, 1.13, 0] to elbow [0.52, 0.92, 0.07], and mirrored from shoulderR to [-0.52, 0.92, 0.07], riding the shoulder joints; forearm: a tube (0.065 radius) from each elbow to wrist [+-0.55, 0.73, 0.17] on the elbow joints. Each arm wears a `tape` ring 0.03 tall at the elbow seam, a `tape` cuff ring at the wrist, and a `bolt` stud on the shoulder cap at the mount. Mitts: rounded mitts on the wrist joints - a squashed sphere 0.095 in `cardboardLight` with a `cardboard` thumb nub on the inner side, a `cardboardDark` worn fingertip patch, and two short `ink` knuckle line strips. Details: a paper 'power meter' sticker on the left forearm (`paintYellow` rounded rect 0.07 x 0.05 with `ink` needle and tick marks), a `robotRed` painted stripe ring round the right upper arm, a `fluting` corrugation strip down the outer edge of each arm, and a small `tapeDark` repair patch on the right forearm.",
      "box": [[-0.7, 0.55, -0.05], [0.7, 1.16, 0.28]],
      "attaches": "Tubes root at mounts shoulderL/shoulderR on the torso box's top corners, under its shoulder pads; they ride the shoulder, elbow and wrist joints; mitts hang free above the floor.",
      "joints": ["shoulderL", "elbowL", "wristL", "shoulderR", "elbowR", "wristR"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legs",
      "builds": "The kid's own legs in cardboard boots, from under the torso box down to the floor. Shorts: a `denim` band 0.12 tall round each thigh at y 0.50-0.62 under the box bottom edge, riding the hip joints at mounts hipL/hipR. Thigh guards: cardboard panels (0.10 wide, front and outer side) over each thigh from y 0.48 to the knee in `cardboard` with a `cardboardLight` edge strip; the knee shows through as a small bare `skin` patch 0.04 with a `robotRed` painted knee disc 0.055 riding the knee joints. Shin guards: cardboard slabs from knee to ankle with a `fluting` corrugation strip down the front of each. Boots: chunky cardboard boots on the foot joints - a box 0.13 wide x 0.14 tall x 0.22 long with a rounded `cardboardLight` toe cap, a `sole` slab 0.025 thick resting flat on the floor at y = 0 centred [+-0.17, 0, 0.15], a `tape` strap across the boot top with a small `bolt` buckle, and a `tapeDark` scuff patch on the toe. Feet point forward to z ~0.26.",
      "box": [[-0.26, 0, -0.12], [0.26, 0.62, 0.3]],
      "attaches": "Rides the hip, knee and foot joints; the shorts tuck under the torso box's open bottom edge at mounts hipL/hipR; boot soles are the only parts touching the floor.",
      "joints": ["hipL", "kneeL", "footL", "hipR", "kneeR", "footR"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "jetpack",
      "builds": "A homemade cardboard jetpack strapped to the torso box's back, rigid on the body joint at mount backMount [0, 0.95, -0.26]. Pack: a smaller kraft box 0.50 wide x 0.44 tall x 0.17 deep centred [0, 0.95, -0.36] (z -0.27 to -0.44) in `cardboard`, with a `tape` border round its top edge and a `cardboardLight` edge strip down its vertical edges. Back face: a `robotBlue` circle emblem 0.14 across with a `paintYellow` 5-point star on it and a thin `ink` outline ring, seated 0.01 proud. Nozzles: two toilet-roll nozzles (tubes 0.055 radius, 0.14 long) at the pack's bottom corners [+-0.16, 0.78, -0.38], angled down and outward, in `cardboardDark` with a `tape` ring where each meets the pack. Flames: flat paper cutout flames under each nozzle - an extruded zigzag flame 0.20 long in `paperOrange` pointing down-out with a smaller `paperYellow` flame inside it, trailing to y ~0.60, clearly paper, not fire. Two triangular fins (extruded, 0.14 tall, `cardboardLight`) at the pack's top sides, and two short `tape` strap loops on the pack's sides where it meets the torso box.",
      "box": [[-0.34, 0.7, -0.52], [0.34, 1.18, -0.26]],
      "attaches": "Presses against the torso box's back face at mount backMount [0, 0.95, -0.26], fully behind the body box (z < -0.26) and behind the helmet's rear face; rides the body joint.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, n = 10) => new THREE.CylinderGeometry(r1, r2, h, n);

  for (const s of [1, -1]) {
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const foot = s > 0 ? J.footL : J.footR;
    const x = s * 0.17;

    // Bare thigh (skin) from shorts to knee
    b.part(cyl(0.062, 0.055, 0.2, 10), P.skin, { bone: hip, at: [x, 0.47, 0.01] });
    // Shorts: denim band
    b.part(cyl(0.092, 0.095, 0.12, 12), P.denim, { bone: hip, at: [x, 0.56, 0.005] });
    b.part(cyl(0.097, 0.097, 0.012, 12), P.ink, { bone: hip, at: [x, 0.502, 0.005] });
    // hem seam stitching
    b.part(cyl(0.096, 0.096, 0.006, 12), P.cardboardLight, { bone: hip, at: [x, 0.51, 0.005] });

    // Thigh guards: front and outer side
    b.part(box(0.1, 0.17, 0.014), P.cardboard, { bone: hip, at: [x, 0.4, 0.075] });
    b.part(box(0.1, 0.012, 0.018), P.cardboardLight, { bone: hip, at: [x, 0.486, 0.077] });
    b.part(box(0.1, 0.012, 0.018), P.cardboardLight, { bone: hip, at: [x, 0.318, 0.077] });
    b.part(box(0.014, 0.17, 0.09), P.cardboard, { bone: hip, at: [x + s * 0.065, 0.4, 0.01] });
    b.part(box(0.018, 0.012, 0.09), P.cardboardLight, { bone: hip, at: [x + s * 0.066, 0.486, 0.01] });
    b.part(box(0.018, 0.012, 0.09), P.cardboardLight, { bone: hip, at: [x + s * 0.066, 0.318, 0.01] });
    b.part(box(0.012, 0.15, 0.016), P.fluting, { bone: hip, at: [x, 0.4, 0.084] });

    // Knee: bare skin patch + red disc
    b.part(new THREE.SphereGeometry(0.052, 8, 6), P.skin, { bone: knee, at: [x, 0.33, 0.015] });
    b.part(cyl(0.032, 0.032, 0.01, 12), P.skin, { bone: knee, at: [x, 0.33, 0.062], dir: [0, 0, 1] });
    b.part(cyl(0.0275, 0.0275, 0.008, 14), P.robotRed, { bone: knee, at: [x, 0.33, 0.072], dir: [0, 0, 1] });
    b.part(cyl(0.012, 0.012, 0.004, 8), P.cardboardLight, { bone: knee, at: [x, 0.33, 0.077], dir: [0, 0, 1] });

    // Lower leg (skin) and shin guard
    b.part(cyl(0.05, 0.042, 0.2, 10), P.skin, { bone: knee, at: [x, 0.2, 0.02] });
    b.part(box(0.115, 0.2, 0.1), P.cardboard, { bone: knee, at: [x, 0.2, 0.022] });
    b.part(box(0.12, 0.014, 0.106), P.cardboardLight, { bone: knee, at: [x, 0.3, 0.022] });
    b.part(box(0.12, 0.014, 0.106), P.cardboardLight, { bone: knee, at: [x, 0.105, 0.022] });
    for (const k of [-1, 0, 1]) {
      b.part(box(0.014, 0.17, 0.014), P.fluting, { bone: knee, at: [x + k * 0.03, 0.2, 0.077] });
    }
    b.part(box(0.1, 0.015, 0.108), P.tape, { bone: knee, at: [x, 0.22, 0.022] });

    // Boot
    b.part(box(0.13, 0.14, 0.22), P.cardboard, { bone: foot, at: [x, 0.095, 0.15] });
    b.part(box(0.134, 0.05, 0.224), P.cardboardDark, { bone: foot, at: [x, 0.04, 0.15] });
    b.part(box(0.15, 0.025, 0.24), P.sole, { bone: foot, at: [x, 0.0125, 0.15] });
    // ankle collar
    b.part(box(0.136, 0.02, 0.1), P.cardboardLight, { bone: foot, at: [x, 0.165, 0.09] });
    // toe cap rounded
    b.part(new THREE.SphereGeometry(0.068, 10, 8), P.cardboardLight, { bone: foot, at: [x, 0.07, 0.235], scale: [1, 0.85, 0.9] });
    // scuff patch
    b.part(box(0.06, 0.004, 0.05), P.tapeDark, { bone: foot, at: [x, 0.136, 0.2] });
    b.part(box(0.04, 0.05, 0.004), P.tapeDark, { bone: foot, at: [x - s * 0.015, 0.075, 0.301] });
    // strap + buckle
    b.part(box(0.138, 0.016, 0.04), P.tape, { bone: foot, at: [x, 0.168, 0.15] });
    b.part(box(0.138, 0.04, 0.012), P.tape, { bone: foot, at: [x, 0.13, 0.215], scale: [1, 0.4, 1] });
    b.part(box(0.03, 0.02, 0.012), P.bolt, { bone: foot, at: [x, 0.172, 0.17] });
    b.part(box(0.014, 0.008, 0.014), P.ink, { bone: foot, at: [x, 0.172, 0.17] });
    // sole stitches
    for (let i = 0; i < 4; i++) {
      b.part(box(0.006, 0.01, 0.006), P.cardboardLight, {
        bone: foot,
        at: [x + s * 0.067, 0.03 + R() * 0.0, 0.07 + i * 0.05],
      });
    }
    // lace-like crayon marks on boot sides
    for (let i = 0; i < 3; i++) {
      b.part(box(0.004, 0.008, 0.03), P.ink, { bone: foot, at: [x + s * 0.066, 0.1 + i * 0.02, 0.12 + (i % 2) * 0.03] });
    }
  }
}
```

<!-- call: jetpack -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildJetpack({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const CZ = -0.355; // pack centre z
  const W = 0.5, H = 0.44, D = 0.17;
  const CY = 0.95;
  const BACK = CZ - D / 2; // -0.44

  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  // main pack
  box(W, H, D, P.cardboard, [0, CY, CZ]);
  // top tape border
  box(W + 0.012, 0.045, D + 0.012, P.tape, [0, CY + H / 2 - 0.03, CZ]);
  box(W + 0.016, 0.008, D + 0.016, P.tapeDark, [0, CY + H / 2 - 0.054, CZ]);
  // bottom rim
  box(W + 0.01, 0.025, D + 0.01, P.cardboardDark, [0, CY - H / 2 + 0.012, CZ]);

  // vertical edge strips with fluting
  for (const s of [1, -1]) for (const z of [1, -1]) {
    box(0.03, H - 0.02, 0.03, P.cardboardLight, [s * (W / 2 - 0.004), CY, CZ + z * (D / 2 - 0.004)]);
    for (let i = 0; i < 4; i++)
      box(0.008, H - 0.1, 0.012, P.fluting, [s * (W / 2 - 0.028 - i * 0.012), CY - 0.01, CZ + z * (D / 2 + 0.001)]);
  }

  // back emblem
  const ez = BACK - 0.005;
  const disc = (r: number, color: string, dz: number, seg = 24) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.01, seg), color, { bone, at: [0, CY + 0.04, ez - dz], dir: [0, 0, -1] });
  disc(0.076, P.ink, 0);
  disc(0.07, P.robotBlue, 0.004);
  // star
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const r = i % 2 ? 0.0225 : 0.05;
    star.push([r * Math.sin(a), r * Math.cos(a)]);
  }
  b.extrude(star, {
    at: [0, CY + 0.04, ez - 0.012], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: P.paintYellow, bone,
  });
  // back rivets / marker lines
  for (const s of [1, -1]) {
    box(0.1, 0.012, 0.006, P.robotRed, [s * 0.14, CY - 0.1, BACK - 0.003], { rotation: [0, 0, s * 8] });
    box(0.06, 0.01, 0.006, P.paintGreen, [s * 0.15, CY + 0.17, BACK - 0.003]);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.bolt, { bone, at: [s * 0.2, CY + 0.15, BACK - 0.004] });
  }

  // nozzles
  for (const s of [1, -1]) {
    const top = new THREE.Vector3(s * 0.16, 0.8, -0.38);
    const dir = new THREE.Vector3(s * 0.22, -1, -0.08).normalize();
    const mid = top.clone().addScaledVector(dir, 0.07);
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 12, 1, true), P.cardboardDark, { bone, at: mid, dir });
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.14, 10), P.ink, { bone, at: mid.clone().addScaledVector(dir, 0.004), dir });
    b.part(new THREE.CylinderGeometry(0.059, 0.059, 0.03, 12), P.tape, { bone, at: top.clone().addScaledVector(dir, 0.015), dir });
    b.part(new THREE.TorusGeometry(0.055, 0.007, 5, 12), P.cardboardLight, {
      bone, at: top.clone().addScaledVector(dir, 0.14), dir, axis: "z",
    });

    // flames
    const end = top.clone().addScaledVector(dir, 0.14);
    const side = new THREE.Vector3(0, 0, 1);
    const flame = (len: number, w: number, color: string, off: number) => {
      const pts: [number, number][] = [
        [-w, 0], [-w * 0.8, -len * 0.45], [-w * 0.5, -len * 0.3], [-w * 0.3, -len * 0.75],
        [0, -len * 0.5], [w * 0.3, -len], [w * 0.5, -len * 0.35], [w * 0.8, -len * 0.5], [w, 0],
      ];
      // shape drawn along local x = world z, y = down-out
      b.extrude(pts, {
        at: end.clone().addScaledVector(dir, 0.0).add(new THREE.Vector3(0, 0, 0)).addScaledVector(side, 0).add(new THREE.Vector3(0, 0, 0)),
        x: [0, 0, 1], y: [s * 0.2, 1, 0], thickness: 0.006 + off, color, bone,
      });
    };
    flame(0.2, 0.05, P.paperOrange, 0.002);
    flame(0.12, 0.028, P.paperYellow, 0.008);
  }

  // fins
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.06, 0], [0, 0.14]], {
      at: [s * (W / 2 + 0.002), CY + H / 2 - 0.02, CZ + 0.03], x: [0, 0, -1], y: [0, 1, 0],
      thickness: 0.012, color: P.cardboardLight, bone,
    });
    box(0.016, 0.1, 0.012, P.fluting, [s * (W / 2 + 0.002), CY + H / 2 + 0.03, CZ + 0.035]);
  }

  // strap loops on sides
  for (const s of [1, -1]) for (const dy of [0.1, -0.1]) {
    box(0.03, 0.05, D + 0.02, P.tape, [s * (W / 2 + 0.004), CY + dy, CZ]);
    box(0.032, 0.008, D + 0.022, P.tapeDark, [s * (W / 2 + 0.005), CY + dy + 0.027, CZ]);
    box(0.03, 0.05, 0.04, P.tape, [s * (W / 2 - 0.02), CY + dy, CZ + D / 2 + 0.005 + 0.0]);
  }

  // tiny crayon stickers
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), P.paintGreen, { bone, at: [-0.15, CY - 0.02, BACK - 0.002], dir: [0, 0, -1] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 8), P.robotRed, { bone, at: [-0.15, CY - 0.02, BACK - 0.005], dir: [0, 0, -1] });
  for (let i = 0; i < 3; i++)
    box(0.04 + R() * 0.02, 0.006, 0.004, P.cardboardDark, [0.16, CY - 0.17 + i * 0.015, BACK - 0.002]);
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const jointOf = (s: number) => (s > 0 ? { sh: J.shoulderL, el: J.elbowL, wr: J.wristL } : { sh: J.shoulderR, el: J.elbowR, wr: J.wristR });
  const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  for (const s of [1, -1]) {
    const { sh, el, wr } = jointOf(s);
    const S = [s * 0.36, 1.13, 0];
    const E = [s * 0.52, 0.92, 0.07];
    const W = [s * 0.55, 0.73, 0.17];

    // upper arm and forearm tubes
    b.rod(S, E, 0.075, P.cardboard, { bone: sh, sides: 10 });
    b.rod(E, W, 0.065, P.cardboard, { bone: el, sides: 10 });
    // joints caps
    b.part(new THREE.SphereGeometry(0.078, 10, 8), P.cardboardDark, { bone: sh, at: S });
    b.part(new THREE.SphereGeometry(0.07, 10, 8), P.cardboardDark, { bone: el, at: E });
    // shoulder stud
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 8), P.bolt, {
      bone: sh, at: [s * 0.4, 1.2, 0], dir: [s * 0.4, 1, 0.1],
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), P.tapeDark, {
      bone: sh, at: [s * 0.4, 1.205, 0], dir: [s * 0.4, 1, 0.1],
    });

    // tape rings
    const ring = (a: number[], b2: number[], t: number, r: number, bone: any, col: string, h: number) => {
      const p = v(a).lerp(v(b2), t);
      const d = v(b2).sub(v(a)).normalize();
      b.part(new THREE.CylinderGeometry(r, r, h, 12), col, { bone, at: p, dir: d });
    };
    ring(E, W, 0.0, 0.069, el, P.tape, 0.03);
    ring(E, W, 0.0, 0.0705, el, P.tapeDark, 0.006);
    ring(E, W, 0.93, 0.07, el, P.tape, 0.035);
    ring(E, W, 0.93, 0.0715, el, P.tapeDark, 0.006);

    // corrugation strip outer edge
    for (const [A, B, bone, r] of [[S, E, sh, 0.075], [E, W, el, 0.065]] as const) {
      const a = v(A), c = v(B);
      const o = new THREE.Vector3(s, 0, 0);
      b.rod(a.clone().addScaledVector(o, r * 0.97).add(new THREE.Vector3(0, 0, 0)).lerp(c, 0.1).addScaledVector(o, 0.0),
        c.clone().addScaledVector(o, r * 0.97).lerp(a, 0.1), 0.009, P.fluting, { bone, sides: 6 });
    }
    // fluting ribs: tiny rings on the strip
    for (let i = 0; i < 4; i++) {
      const p = v(S).lerp(v(E), 0.18 + i * 0.2);
      b.part(new THREE.BoxGeometry(0.014, 0.02, 0.014), P.cardboardDark, { bone: sh, at: [p.x + s * 0.074, p.y, p.z] });
    }

    // mitt
    const mp = [s * 0.556, 0.675, 0.19];
    b.part(new THREE.SphereGeometry(0.095, 10, 8), P.cardboardLight, { bone: wr, at: mp, scale: [0.9, 1.0, 0.85] });
    // thumb nub on inner side
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.cardboard, { bone: wr, at: [s * 0.49, 0.69, 0.21], scale: [1, 1.4, 0.9] });
    // worn fingertip patch
    b.part(new THREE.SphereGeometry(0.04, 8, 6), P.cardboardDark, { bone: wr, at: [s * 0.565, 0.6, 0.215], scale: [1, 0.5, 0.9] });
    // knuckle lines
    for (const dx of [-0.02, 0.02]) {
      b.part(new THREE.BoxGeometry(0.004, 0.035, 0.004), P.ink, { bone: wr, at: [s * 0.556 + dx, 0.615, 0.262], rotation: [-20, 0, 0] });
    }
    // small mitt seam
    b.part(new THREE.BoxGeometry(0.1, 0.006, 0.006), P.cardboardDark, { bone: wr, at: [s * 0.556, 0.7, 0.268] });
  }

  // left forearm power meter sticker (outer-front side)
  {
    const wr = J.elbowL;
    const p = v([0.535, 0.83, 0.12]);
    const d: [number, number, number] = [0.15, 0.1, 1];
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.006), P.paintYellow, { bone: wr, at: [p.x, p.y, p.z + 0.066], rotation: [-15, 0, 0] });
    b.part(new THREE.BoxGeometry(0.074, 0.054, 0.004), P.ink, { bone: wr, at: [p.x, p.y, p.z + 0.064], rotation: [-15, 0, 0] });
    const f = frame([p.x, p.y, p.z + 0.07], [0, 0.26, 1]);
    for (let i = 0; i < 5; i++) {
      const a = (-60 + i * 30) * Math.PI / 180;
      b.part(new THREE.BoxGeometry(0.003, 0.012, 0.003), P.ink, {
        bone: wr, at: [p.x + Math.sin(a) * 0.026, p.y + 0.004 + Math.cos(a) * 0.014 - 0.01, p.z + 0.073 - 0.01 * 0.2],
        rotation: [-15, 0, -a * 180 / Math.PI],
      });
    }
    b.part(new THREE.BoxGeometry(0.004, 0.028, 0.003), P.robotRed, { bone: wr, at: [p.x + 0.004, p.y - 0.006, p.z + 0.076], rotation: [-15, 0, -25] });
    void f; void d;
  }

  // right upper arm red stripe ring
  {
    const A = v([-0.36, 1.13, 0]), B = v([-0.52, 0.92, 0.07]);
    const p = A.clone().lerp(B, 0.5);
    const dir = B.clone().sub(A).normalize();
    b.part(new THREE.CylinderGeometry(0.0775, 0.0775, 0.035, 12), P.robotRed, { bone: J.shoulderR, at: p, dir });
  }
  // right forearm repair patch
  {
    const p = [-0.545, 0.82, 0.21];
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.005), P.tapeDark, { bone: J.elbowR, at: p, rotation: [-12, 10, 8] });
    b.part(new THREE.BoxGeometry(0.052, 0.006, 0.006), P.tape, { bone: J.elbowR, at: [p[0], p[1], p[2] + 0.002], rotation: [-12, 10, 45] });
    b.part(new THREE.BoxGeometry(0.052, 0.006, 0.006), P.tape, { bone: J.elbowR, at: [p[0], p[1], p[2] + 0.002], rotation: [-12, 10, -45] });
  }
}
```

<!-- call: torsoBox -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTorsoBox({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir });

  const CY = 0.87, Z = 0.25;
  // main box
  box(0.74, 0.58, 0.5, P.cardboard, [0, CY, 0]);
  // bottom light rim and dark inner rim
  box(0.76, 0.03, 0.52, P.cardboardLight, [0, 0.595, 0]);
  box(0.68, 0.03, 0.44, P.cardboardDark, [0, 0.575, 0]);
  // top edge strips
  for (const s of [1, -1]) {
    box(0.02, 0.02, 0.52, P.cardboardLight, [s * 0.37, 1.16, 0]);
    box(0.76, 0.02, 0.02, P.cardboardLight, [0, 1.16, s * 0.25]);
  }
  // fluting on front vertical corners
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const y = 0.6 + i * 0.07 - 0.0 + 0.0;
      void y;
    }
    for (let i = 0; i < 3; i++) {
      // vertical flutes: one tall half-round per slot across front edge and side edge
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 + 0.003), CY, 0.25 - i * 0.022], [0, 1, 0]);
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 - i * 0.022), CY, 0.253], [0, 1, 0]);
    }
    for (let i = 0; i < 2; i++) {
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 + 0.003), CY, 0.25 - (i + 3) * 0.022], [0, 1, 0]);
      cyl(0.008, 0.008, 0.56, 5, P.fluting, [s * (0.37 - (i + 3) * 0.022), CY, 0.253], [0, 1, 0]);
    }
  }
  // control panel
  box(0.33, 0.25, 0.01, P.tape, [0, 0.92, Z + 0.005]);
  box(0.30, 0.22, 0.01, P.robotBlue, [0, 0.92, Z + 0.012]);
  box(0.26, 0.02, 0.006, "#4f8fe0", [0, 1.005, Z + 0.019]);
  // big gauge
  const gz = Z + 0.02, gx = -0.06, gy = 0.945;
  cyl(0.045, 0.045, 0.008, 20, P.panelWhite, [gx, gy, gz]).mesh.rotation.x = 0;
  const g = frame([gx, gy, gz + 0.006], [0, 0, 1]);
  void g;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.003, 0.009, 0.003), P.ink, {
      bone,
      at: [gx + Math.sin(a) * 0.036, gy + Math.cos(a) * 0.036, gz + 0.006],
      rotation: [0, 0, -(a * 180) / Math.PI],
    });
  }
  b.part(new THREE.BoxGeometry(0.004, 0.036, 0.003), P.ink, {
    bone, at: [gx + 0.01, gy + 0.013, gz + 0.007], rotation: [0, 0, -35],
  });
  cyl(0.006, 0.006, 0.006, 8, P.ink, [gx, gy, gz + 0.007]);
  // small yellow gauge
  cyl(0.03, 0.03, 0.008, 16, P.paintYellow, [0.085, 0.955, gz]);
  b.part(new THREE.BoxGeometry(0.003, 0.024, 0.003), P.ink, { bone, at: [0.088, 0.962, gz + 0.006], rotation: [0, 0, 30] });
  for (let i = 0; i < 5; i++) {
    const a = (-60 + i * 30) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.002, 0.006, 0.002), P.ink, {
      bone, at: [0.085 + Math.sin(a) * 0.024, 0.955 + Math.cos(a) * 0.024, gz + 0.006], rotation: [0, 0, -a * 180 / Math.PI],
    });
  }
  // buttons and switch
  cyl(0.0125, 0.0125, 0.02, 12, P.robotRed, [-0.07, 0.862, Z + 0.02]);
  cyl(0.0125, 0.0125, 0.02, 12, P.paintGreen, [-0.035, 0.862, Z + 0.02]);
  box(0.05, 0.012, 0.006, P.ink, [0.07, 0.862, Z + 0.018]);
  box(0.008, 0.03, 0.01, P.paintGreen, [0.075, 0.872, Z + 0.024], { rotation: [0, 0, -25] });
  // smiley
  const sy = 0.76;
  cyl(0.05, 0.05, 0.008, 20, P.paintYellow, [0, sy, Z + 0.004]);
  for (const s of [1, -1]) cyl(0.007, 0.007, 0.006, 8, P.ink, [s * 0.017, sy + 0.015, Z + 0.01]);
  for (let i = 0; i < 7; i++) {
    const a = (-60 + i * 20) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.014, 0.005, 0.004), P.ink, {
      bone, at: [Math.sin(a) * 0.03, sy - 0.003 - Math.cos(a) * 0.03 + 0.012, Z + 0.01], rotation: [0, 0, a * 180 / Math.PI],
    });
  }
  // tape band wrapping
  box(0.75, 0.06, 0.51, P.tape, [0, 0.66, 0]);
  box(0.755, 0.008, 0.515, P.tapeDark, [0, 0.632, 0]);
  box(0.755, 0.008, 0.515, P.tapeDark, [0, 0.688, 0]);
  // X repair patch lower front right (model right = -x)
  for (const r of [45, -45]) box(0.13, 0.03, 0.008, P.tape, [-0.25, 0.755, Z + 0.004], { rotation: [0, 0, r] });
  box(0.04, 0.01, 0.01, P.tapeDark, [-0.25, 0.755, Z + 0.009]);
  // crayon squiggles
  const wob = (x0: number, y0: number, col: string) => {
    for (let i = 0; i < 6; i++)
      b.part(new THREE.BoxGeometry(0.02, 0.005, 0.004), col, {
        bone, at: [x0 + i * 0.017, y0 + (i % 2 ? 0.008 : -0.008), Z + 0.003], rotation: [0, 0, i % 2 ? 35 : -35],
      });
  };
  wob(0.1, 0.78, P.robotRed);
  wob(0.1, 0.725, "#3a8fe0");
  wob(-0.19, 0.69 + 0.0, P.paintGreen);
  // shoulder pads
  for (const s of [1, -1]) {
    const m = s > 0 ? M.shoulderL : M.shoulderR;
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12, 1, false, 0, Math.PI / 2), P.cardboardLight, {
      bone, at: [m[0] + s * 0.0, 1.175, m[2]], rotation: [0, s > 0 ? 0 : 90, 0],
    });
    cyl(0.015, 0.015, 0.02, 8, P.bolt, [m[0] + s * 0.07, 1.2, m[2] + 0.07], [0, 1, 0]);
  }
  // collar
  box(0.46, 0.05, 0.46, P.tape, [M.collar[0], 1.185, M.collar[2]]);
  box(0.47, 0.01, 0.47, P.tapeDark, [M.collar[0], 1.21, M.collar[2]]);
  // side vents
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) box(0.01, 0.025, 0.14, P.cardboardDark, [s * 0.372, 0.63 + i * 0.0 + 0.0 + 0.05 + i * 0.045 - 0.0, -0.02]);
}
```

<!-- call: helmet -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHelmet({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const R = rng(11);

  // box helper: center, size, color, bone
  const box = (c: number[], s: number[], color: string, bone: any = head) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at: c });
  const cyl = (c: number[], r: number, h: number, color: string, dir: number[], bone: any = head, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: c, dir });

  const CX = 0, CY = 1.36, CZ = 0.02, S = 0.44, T = 0.02;
  const top = CY + S / 2, bot = CY - S / 2, front = CZ + S / 2, back = CZ - S / 2;
  const wy = 1.385, ww = 0.26, wh = 0.17;

  // walls
  box([0, top - T / 2, CZ], [S, T, S], P.cardboard);
  box([0, bot + T / 2, CZ], [S, T, S], P.cardboardDark);
  box([0, CY, back + T / 2], [S, S, T], P.cardboard);
  box([S / 2 - T / 2, CY, CZ], [T, S, S], P.cardboard);
  box([-S / 2 + T / 2, CY, CZ], [T, S, S], P.cardboard);

  // front face: four slabs around window
  const fz = front - T / 2;
  const wTop = wy + wh / 2, wBot = wy - wh / 2;
  box([0, (top + wTop) / 2, fz], [S, top - wTop, T], P.cardboard);
  box([0, (bot + wBot) / 2, fz], [S, wBot - bot, T], P.cardboard);
  const sideW = (S - ww) / 2;
  for (const s of [1, -1]) box([s * (ww / 2 + sideW / 2), wy, fz], [sideW, wh, T], P.cardboard);

  // tape border around window
  const tz = front + 0.002;
  box([0, wTop + 0.01, tz], [ww + 0.04, 0.02, 0.006], P.tape);
  box([0, wBot - 0.01, tz], [ww + 0.04, 0.02, 0.006], P.tape);
  for (const s of [1, -1]) box([s * (ww / 2 + 0.01), wy, tz], [0.02, wh, 0.006], P.tape);

  // edge strips (light) along top edges
  box([0, top + 0.005, front - 0.005], [S, 0.012, 0.03], P.cardboardLight);
  box([0, top + 0.005, back + 0.005], [S, 0.012, 0.03], P.cardboardLight);
  for (const s of [1, -1]) {
    box([s * (S / 2 - 0.005), top + 0.005, CZ], [0.03, 0.012, S], P.cardboardLight);
    // fluting on front vertical edges
    for (let i = 0; i < 8; i++) {
      const y = bot + 0.03 + i * ((S - 0.06) / 7);
      cyl([s * (S / 2 - 0.004), y, front + 0.003], 0.012, 0.03, P.fluting, [1, 0, 0], head, 6);
    }
    // bolt studs on sides
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.bolt, { bone: head, at: [s * (S / 2 + 0.004), CY - 0.1, CZ - 0.05] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.bolt, { bone: head, at: [s * (S / 2 + 0.004), CY + 0.1, CZ - 0.05] });
  }
  // bottom edge light strip
  box([0, bot + 0.008, front + 0.002], [S, 0.016, 0.006], P.cardboardLight);

  // kid's head
  b.part(new THREE.SphereGeometry(0.105, 14, 10), P.skin, { bone: head, at: [0, 1.35, 0.06] });
  const hz = 0.06 + 0.105; // face front approx
  // eyes
  for (const s of [1, -1]) {
    const ex = s * 0.045, ey = 1.385, ez = 0.158;
    const faceDir = [0, 0, 1];
    b.part(new THREE.CircleGeometry(0.035, 14), P.eyeWhite, { bone: head, at: [ex, ey, ez], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.02, 12), P.iris, { bone: head, at: [ex, ey, ez + 0.002], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.012, 10), P.ink, { bone: head, at: [ex, ey, ez + 0.004], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.006, 6), "#ffffff", { bone: head, at: [ex + 0.008, ey + 0.008, ez + 0.006], dir: faceDir, axis: "z" });
    b.part(new THREE.CircleGeometry(0.018, 10), P.blush, { bone: head, at: [s * 0.08, 1.345, 0.146], dir: [s * 0.4, 0, 1], axis: "z" });
    // eyebrow
    box([ex, ey + 0.045, 0.157], [0.04, 0.008, 0.006], P.hair);
  }
  // nose
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.ink, { bone: head, at: [0, 1.348, 0.163] });
  // mouth: upper lip on head, lower lip on jaw
  box([0, 1.322, 0.16], [0.045, 0.008, 0.01], P.blush, head);
  box([0, 1.31, 0.158], [0.04, 0.008, 0.01], P.blush, jaw);

  // fringe of hair tufts along window top
  const tuft = [[0, 0], [0.05, 0], [0.025, -0.04]] as any;
  for (let i = 0; i < 6; i++) {
    const x = -0.11 + i * 0.044;
    const h = 0.035 + R() * 0.02;
    const shape = [[-0.022, 0], [0.022, 0], [0, -h]] as any;
    b.extrude(shape, { at: [x, 1.455, 0.158 + (i % 2) * 0.004], x: [1, 0, 0], thickness: 0.012, color: P.hair, bone: head });
  }
  box([0, 1.463, 0.14], [0.25, 0.02, 0.05], P.hair);
  // back tuft
  for (let i = 0; i < 3; i++) {
    b.extrude([[-0.02, 0], [0.02, 0], [0, -0.05]] as any, {
      at: [-0.04 + i * 0.04, bot + 0.01, back - 0.004], x: [1, 0, 0], thickness: 0.015, color: P.hair, bone: head,
    });
  }

  // antenna
  b.rod([0.1, top, -0.02], [0.1, 1.84 - 0.035, -0.02], 0.008, P.bolt, { bone: head });
  b.part(new THREE.SphereGeometry(0.035, 10, 8), P.robotRed, { bone: head, at: [0.1, 1.84 - 0.025, -0.02] });
  cyl([0.1, top + 0.008, -0.02], 0.02, 0.016, P.tapeDark, [0, 1, 0]);

  // crossed tape X on right side (x negative)
  const rx = -S / 2 - 0.003;
  for (const a of [40, -40]) {
    b.part(new THREE.BoxGeometry(0.005, 0.2, 0.035), P.tape, {
      bone: head, at: [rx, CY + 0.02, CZ + 0.02], rotation: [a, 0, 0],
    });
  }
  // yellow gauge sticker on left side
  const lx = S / 2 + 0.003;
  cyl([lx, CY + 0.02, CZ + 0.02], 0.06, 0.004, P.paintYellow, [1, 0, 0], head, 16);
  cyl([lx + 0.003, CY + 0.02, CZ + 0.02], 0.045, 0.002, P.panelWhite, [1, 0, 0], head, 16);
  b.part(new THREE.BoxGeometry(0.003, 0.04, 0.005), P.ink, {
    bone: head, at: [lx + 0.005, CY + 0.035, CZ + 0.03], rotation: [-30, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), P.ink, { bone: head, at: [lx + 0.005, CY + 0.02, CZ + 0.02] });
  for (let i = 0; i < 7; i++) {
    const a = (-120 + i * 40) * Math.PI / 180;
    b.part(new THREE.BoxGeometry(0.003, 0.008, 0.003), P.ink, {
      bone: head, at: [lx + 0.005, CY + 0.02 + Math.cos(a) * 0.04, CZ + 0.02 + Math.sin(a) * 0.04],
    });
  }
}
```