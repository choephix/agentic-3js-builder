<!-- call: plan -->

```json
{
  "name": "Cardboard Box Robot Kid",
  "description": "A six-year-old in a homemade cardboard-box robot costume: a box torso with a glued-on control panel, a box helmet with a face window and straw antennae, foil-wrapped tube arms with claw mitts, and a paper-cup-and-bottle jetpack.",
  "builderName": "cardboardBoxRobotKid",
  "size": [1.2, 1.38, 0.6],
  "layout": "Humanoid, about 1.38 m tall including antennae, in a neutral A-pose. Arms hang about 35 degrees out from the torso, palms facing the body, claws open. Legs are straight and slightly apart. The model faces +Z, left is +X, and it is centred on x = 0. It reads as a child's craft project, not a polished robot.\n\nFRONT TO BACK, TOP TO BOTTOM:\n1. HELMET: a cardboard box (x +-0.17, y 0.93..1.23, z +-0.17) sits on the torso's neck hole. Its front panel has a square face window (x +-0.10, y 0.975..1.165) cut out. The kid's face sits 0.075 behind the window plane, so it is recessed and clearly readable from the front. Two straw antennae (y 1.23..1.38, x +-0.08) end in a foil ball and a bottle cap. A paper cup is glued on each side as an ear-cup, with a small LED dome on top.\n2. TORSO: a taller box (x +-0.26, y 0.42..0.93, z +-0.18). The bottom is open, so the kid's legs go down out of it. The top panel has a square neck hole under the helmet. Each side has a round arm hole at y 0.84 with a corrugated cut-edge rim. The front carries a glued-on control board (about 0.30 w x 0.26 h, tilted 1.5 degrees) with a glowing screen, dials, bottle-cap buttons, toggles, LEDs and marker lettering.\n3. ARMS: paper-towel-roll upper arms, foil-wrapped dryer-duct elbows, painted forearm tubes, and claw mitts (a palm box plus a thumb block and a finger block that can open). They start at the arm holes (x +-0.27).\n4. BACK: a shoebox jetpack (z -0.18..-0.32) with two painted plastic-bottle thrusters, a vent and tape.\n5. LEGS: blue jeans visible from y 0.42 down, foil-wrapped cardboard shin guards, and a cardboard foot box over each sneaker with the red toe-cap poking out the front. These are the only parts on the floor.\n\nCARDBOARD CRAFT LOOK, which every part follows:\n- Panels are thin slabs about 0.008 m thick, never smooth solids. Every cut edge shows a thin strip in cardboardEdge, and where an edge is big enough (arm holes, flaps, window frame) a second strip in cardboardDark or cardboardLight alternates with it to read as corrugation flutes.\n- Packing tape is thin strips (width about 0.03, thickness 0.0015) in the 'tape' colour. They cross over seams and flap joints, sit a little crooked (+-2 degrees), and overlap with a visible end.\n- Foil is wrapped around tubes in a few faceted rings alternating foil, foilBright and foilDark. Use low-poly rings (6 to 8 sides) so the crinkles read as facets.\n- Painted details (red, blue, yellow) are flat panels, bands and discs laid on the cardboard. Black marker lines and letters are thin bars in 'marker', drawn slightly wobbly.\n- Screens and LEDs are the only glowing parts (screenGlow, ledRed, ledGreen). Use the glow kit on them.\n- Panels are slightly misaligned, with uneven flap angles, so it looks handmade.\n- Everything uses flat colours from the palette. Small parts (buttons, tape, rivets, letters) are separate parts, seated on the surface and not floating.\n\nSCALE CONSTANTS: kid height 1.15 m, head box 0.34 wide, torso box 0.52 x 0.51 x 0.36 (w x h x d), arm tube radius 0.055, thigh radius 0.045. The kid's head is slightly oversized and cute: skull radii about x 0.085, y 0.1, z 0.095, centred (0, 1.07, 0).",
  "palette": {
    "cardboard": "#c49453",
    "cardboardLight": "#d8ab6a",
    "cardboardDark": "#94683a",
    "cardboardEdge": "#6b4723",
    "tape": "#dcbf84",
    "foil": "#c8cdd5",
    "foilDark": "#8b919c",
    "foilBright": "#f0f3f7",
    "marker": "#231c18",
    "paperWhite": "#f3eedf",
    "paintRed": "#d8412f",
    "paintBlue": "#2f6fcf",
    "paintYellow": "#f1c232",
    "screenGlow": "#86f4ff",
    "ledRed": "#ff4a36",
    "ledGreen": "#5dff86",
    "skin": "#f0c29c",
    "skinShade": "#d9a07e",
    "hair": "#6a4426",
    "cheek": "#f0958a",
    "eyeWhite": "#fcfbf6",
    "pupil": "#17120f",
    "iris": "#4b8a5a",
    "jeans": "#3d5c99"
  },
  "mounts": {
    "neckTop": [0, 0.93, 0],
    "headBoxBase": [0, 0.93, 0],
    "faceWindowCenter": [0, 1.07, 0.17],
    "skullCenter": [0, 1.07, 0],
    "antennaBaseL": [0.08, 1.23, 0],
    "antennaBaseR": [-0.08, 1.23, 0],
    "earCupL": [0.17, 1.07, 0],
    "earCupR": [-0.17, 1.07, 0],
    "torsoFront": [0, 0.68, 0.18],
    "torsoBack": [0, 0.68, -0.18],
    "torsoBottom": [0, 0.42, 0],
    "armHoleL": [0.26, 0.84, 0],
    "armHoleR": [-0.26, 0.84, 0],
    "wristL": [0.47, 0.5, 0.03],
    "wristR": [-0.47, 0.5, 0.03],
    "hipL": [0.1, 0.5, 0],
    "hipR": [-0.1, 0.5, 0],
    "kneeL": [0.1, 0.27, 0.01],
    "kneeR": [-0.1, 0.27, 0.01],
    "ankleL": [0.1, 0.07, 0],
    "ankleR": [-0.1, 0.07, 0],
    "footSoleL": [0.1, 0, 0.04],
    "footSoleR": [-0.1, 0, 0.04]
  },
  "joints": [
    { "name": "hips", "at": [0, 0.5, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "spine", "parent": "hips", "at": [0, 0.6, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "chest", "parent": "spine", "at": [0, 0.78, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "neck", "parent": "chest", "at": [0, 0.93, 0], "dir": [0, 1, 0], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.98, 0], "dir": [0, 1, 0], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 1.0, 0.0], "dir": [0, -0.2, 1], "role": "jaw" },
    { "name": "shoulderL", "parent": "chest", "at": [0.27, 0.84, 0], "dir": [0.54, -0.84, 0], "role": "arm", "group": "arms" },
    { "name": "elbowL", "parent": "shoulderL", "at": [0.38, 0.67, 0], "dir": [0.46, -0.87, 0.15], "role": "arm", "group": "arms" },
    { "name": "wristL", "parent": "elbowL", "at": [0.47, 0.5, 0.03], "dir": [0.3, -0.95, 0.1], "role": "arm", "group": "arms" },
    { "name": "thumbL", "parent": "wristL", "at": [0.485, 0.455, 0.05], "dir": [0.3, -0.9, 0.3], "role": "digit", "group": "arms" },
    { "name": "fingersL", "parent": "wristL", "at": [0.485, 0.455, 0.01], "dir": [0.3, -0.95, -0.05], "role": "digit", "group": "arms" },
    { "name": "shoulderR", "parent": "chest", "at": [-0.27, 0.84, 0], "dir": [-0.54, -0.84, 0], "role": "arm", "group": "arms" },
    { "name": "elbowR", "parent": "shoulderR", "at": [-0.38, 0.67, 0], "dir": [-0.46, -0.87, 0.15], "role": "arm", "group": "arms" },
    { "name": "wristR", "parent": "elbowR", "at": [-0.47, 0.5, 0.03], "dir": [-0.3, -0.95, 0.1], "role": "arm", "group": "arms" },
    { "name": "thumbR", "parent": "wristR", "at": [-0.485, 0.455, 0.05], "dir": [-0.3, -0.9, 0.3], "role": "digit", "group": "arms" },
    { "name": "fingersR", "parent": "wristR", "at": [-0.485, 0.455, 0.01], "dir": [-0.3, -0.95, -0.05], "role": "digit", "group": "arms" },
    { "name": "hipL", "parent": "hips", "at": [0.1, 0.5, 0], "dir": [0, -1, 0.04], "role": "leg", "group": "legs" },
    { "name": "kneeL", "parent": "hipL", "at": [0.1, 0.27, 0.01], "dir": [0, -1, -0.04], "role": "leg", "group": "legs" },
    { "name": "ankleL", "parent": "kneeL", "at": [0.1, 0.07, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeL", "parent": "ankleL", "at": [0.1, 0.03, 0.1], "dir": [0, 0, 1], "role": "digit", "group": "legs" },
    { "name": "hipR", "parent": "hips", "at": [-0.1, 0.5, 0], "dir": [0, -1, 0.04], "role": "leg", "group": "legs" },
    { "name": "kneeR", "parent": "hipR", "at": [-0.1, 0.27, 0.01], "dir": [0, -1, -0.04], "role": "leg", "group": "legs" },
    { "name": "ankleR", "parent": "kneeR", "at": [-0.1, 0.07, 0], "dir": [0, -1, 0], "role": "leg", "group": "legs" },
    { "name": "toeR", "parent": "ankleR", "at": [-0.1, 0.03, 0.1], "dir": [0, 0, 1], "role": "digit", "group": "legs" }
  ],
  "parts": [
    {
      "id": "torsoBox",
      "builds": "The cardboard torso box, x +-0.26, y 0.42..0.93, z +-0.18, built from thin 0.008 slabs.\n- Front, back, left and right panels in 'cardboard', with a lighter 'cardboardLight' inner panel inset on the front. The bottom is open.\n- A top panel with a square neck hole (about 0.2 square, centred under the helmet). Two short top flaps (front and back) fold outward at uneven angles, with tape across each hinge.\n- Round arm holes at y 0.84 in both side panels (x +-0.26, radius 0.065). Each is ringed with 3 to 4 stacked rim strips in alternating cardboardEdge, cardboardDark and cardboardLight to show corrugation, plus four tape tabs radiating out from the hole.\n- Cut-edge strips in cardboardEdge along every panel edge.\n- Vertical and horizontal tape seams on all four corners of the box, a tape band around the bottom hem, and a few crooked tape patches.\n- The glued-on control board, about 0.30 w x 0.26 h x 0.01 thick, in 'cardboardLight' with a 'cardboardEdge' border, centred at torsoFront [0, 0.68, 0.18], tilted 1.5 degrees. On it: a screenGlow screen (about 0.17 x 0.09) with a marker frame and a marker heartbeat zig-zag line; three dials (lathe discs in foil with a marker pointer and tick marks); a row of six bottle-cap buttons in paintRed, paintBlue and paintYellow; two toggle switches (a small stick with a ball tip in paperWhite); three small LEDs (ledRed, ledGreen); a ring of 8 marker vent slits; and a hand-lettered marker word made of blocky bars below the screen.\n- A big paintRed button with a foilBright rim.\n- Two paintBlue pipe-cleaner/wire loops (thin sweeps) running from the board to the torso side.\n- A paintYellow warning stripe (diagonal bars) on a strip along the bottom of the front.\n- Two rivets (small foil discs) per corner of the board.\nThe front-facing details must stay within z 0.18..0.25. Do not build the head, arms, legs or the back backpack.",
      "box": [[-0.26, 0.42, -0.19], [0.26, 0.93, 0.25]],
      "attaches": "The top panel's neck hole sits under headBoxBase / neckTop. The arm holes sit at armHoleL and armHoleR, where the arm tubes start at x +-0.27. The open bottom at torsoBottom lets the legs pass through. The back face at torsoBack is where the backpack is glued.",
      "joints": ["hips", "spine", "chest"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "backpackRig",
      "builds": "The cardboard jetpack glued to the back of the torso, z -0.18..-0.32, x +-0.2, y 0.45..0.9.\n- A shoebox-style body (x +-0.17, y 0.5..0.86, z -0.19..-0.28) in 'cardboard', with a lid flap on top lifted a little, taped across the front and sides.\n- Cut-edge strips in cardboardEdge around every edge.\n- Two plastic-bottle thrusters standing side by side along the box's lower sides (x +-0.1, y 0.45..0.8, z about -0.27, radius about 0.05): each is a faceted bottle in foil with a neck taper, a paintBlue cap, a foilDark ring stripe, and a nozzle cone at the bottom whose inside is paintRed. A paintYellow cut-paper flame (extrude) with a paintRed core hangs below each nozzle, down to y 0.42 at the lowest.\n- Two taped straps (wide 'tape' strips) run from the back panel up to the shoulders and over the top of the torso box, so the pack reads as strapped on. Each has a small buckle (foil square).\n- A hand-lettered marker label on a paperWhite sticker, and a radiator vent made of 6 slim marker bars.\n- A coiled tube hose (a foil sweep) running between the bottles, a dial on the box lid, and a ledGreen LED.\n- Crisscross tape across the bottle necks.\nThe pack must not extend forward of z -0.18, and must sit on the back panel at torsoBack.",
      "box": [[-0.2, 0.42, -0.32], [0.2, 0.9, -0.18]],
      "attaches": "Its front face rests on the torso's back face at torsoBack (z -0.18). Straps wrap over the shoulder to the torso's top panel and are tacked down with tape.",
      "joints": ["chest", "spine"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "headBox",
      "builds": "The cardboard box helmet and its attachments, with the kid's head left clear inside.\n- Box shell: x +-0.17, y 0.93..1.23, z +-0.17, from 0.008 slabs in 'cardboard'. Back, left, right and top panels are solid. The bottom is open.\n- Front panel with a square face window cut out (x +-0.10, y 0.975..1.165), built as four bars around the hole. A 3-layer frame around the window alternates cardboardEdge, cardboardDark and cardboardLight to read as corrugated cut edges, with 4 tape corner tabs.\n- Top: two top flaps taped shut with a crooked X of 'tape', and a cardboard hatch circle with a ledRed LED dome (glowing).\n- Two straw antennae (thin paintYellow/paintRed rods, slightly splayed outward, from y 1.23 to 1.35) at antennaBaseL/R. Each ends in a foil crumpled ball (faceted sphere r about 0.025) and a bottle cap, and each rod has a few tape-wrapped bands.\n- Ear-cups: a paper cup (frustum, 8 sides, in paperWhite with a paintBlue band) glued sideways on each side at earCupL/R, protruding to x +-0.23, with a foil disc and a marker ring on the open end, plus a tape tab.\n- Cheek tape seams, corrugation strips, a marker-drawn zig-zag mouth-grille (6 short bars) on the front below the window, and a paintRed sticker/emblem above the window.\n- Corner tape on the box edges, uneven by +-2 degrees.\nThe helmet is built around the face window, and nothing may block the window or sit inside the recess behind it.",
      "box": [[-0.23, 0.93, -0.17], [0.23, 1.38, 0.2]],
      "attaches": "The base sits on the torso's top panel at headBoxBase. The window centre is faceWindowCenter, with the kid's face recessed 0.075 behind it at skullCenter.",
      "joints": ["head"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "kidFace",
      "builds": "The kid's head, neck and face, seen through the helmet window.\n- Neck: a skin cylinder from y 0.93 to 0.98.\n- Skull: a slightly oversized rounded head in 'skin' (sphere-like, radii x 0.085, y 0.1, z 0.095) at skullCenter (0, 1.07, 0).\n- Lower jaw and chin as a separate piece on the 'jaw' joint, with a lip line.\n- Hair: a chunky cap of 'hair' with 8 to 12 overlapping blades and a fringe over the forehead, with a small tuft cowlick on top. Make sure the helmet interior (top at y 1.23) clears it.\n- Big readable eyes at the face front (z about +0.085): eyeWhite ovals with iris discs and pupil discs and a small highlight (eyeWhite). Add brows in 'hair', a small round nose in 'skinShade', and a smile on the lower face with 'cheek'-coloured lips.\n- Cheek blush discs in 'cheek', small ears in 'skin' with 'skinShade' inners at x +-0.085, and freckles.\nBuild the face to be clear from the front (+Z) through the window, and keep everything within the box.",
      "box": [[-0.1, 0.93, -0.1], [0.1, 1.18, 0.11]],
      "attaches": "The neck begins at neckTop (inside the torso's neck hole). The skull sits centred at skullCenter, behind the helmet window faceWindowCenter, and is hidden by the helmet on every side except the front.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "arms",
      "builds": "Both costume arms (build left, +X, and right, -X, as mirror images), from the arm holes at armHoleL/R to the claws.\n- Upper arm: a cardboard paper-towel-roll tube (radius 0.058, 8 sides) from the shoulder joint (0.27, 0.84) to the elbow, 'cardboard' with 'cardboardEdge' end rims, a spiral of 'tape' bands, and a paintYellow stripe ring.\n- Elbow: a dryer-duct accordion of 5 to 6 stacked faceted rings in alternating foil and foilDark, radius about 0.058, bending with the joint.\n- Forearm: a tube (radius 0.05) from the elbow (0.38, 0.67) to just past the wrist (0.47, 0.50, 0.03), in foil with foilBright bands and 2 paintRed or paintBlue painted rings. A cuff disc in cardboardLight with a cardboardEdge rim sits at the wrist.\n- A little skin wrist poking out: a short skin cylinder, radius 0.022.\n- Claw mitt (hand): a palm box (about 0.06 x 0.05 x 0.05) in cardboard with foil wrap; a thumb block on the 'thumb' joint and a finger block on the 'fingers' joint (each a foil-covered, tape-hinged box, about 0.025 x 0.07 x 0.03), splayed open about 25 degrees apart to show a pincer gap. Add a paintRed tip pad on each, and a marker mouth-line on the palm. The claws end at about y 0.37.\n- Small bolts (foilBright discs) on the elbow and cuffs, and a loop of wire (thin sweep, paintBlue) on the forearm.\nThe arms must start flush with the torso side at x +-0.27 and not penetrate the torso beyond the hole rim.",
      "box": [[-0.6, 0.34, -0.08], [0.6, 0.92, 0.1]],
      "attaches": "The upper arm starts at the arm holes (armHoleL/R, shoulder joints at x +-0.27, y 0.84). The wrist cuff is at wristL/R. The claws hang from the wrist joints.",
      "joints": ["shoulderL", "elbowL", "wristL", "thumbL", "fingersL", "shoulderR", "elbowR", "wristR", "thumbR", "fingersR"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "legs",
      "builds": "Both legs (build left, +X, and right, -X, as mirror images), from under the torso box to the floor.\n- Kid's legs in 'jeans': thigh (radius 0.045) from the hip (0.1, 0.5) down to the knee, then shin (radius 0.04) down to the ankle at y 0.07. Add a rolled hem cuff, a fold crease at each knee, a stitched seam line and a pocket patch in a slightly different shade of blue (reuse the jeans colour, with small marker stitches).\n- Shin guards: foil-wrapped cardboard boxes (about 0.08 w x 0.14 h x 0.07 d) on the shins at y 0.10..0.25, with 'tape' strap bands, a paintYellow stripe, and two foil rivets. The knee gets a small cardboard knee-cap box, with edge strips.\n- Feet: each foot is a cardboard foot box (x +-0.065, y 0..0.1, z -0.09..0.12) over the sneaker, taped at the ankle with a band of 'tape', with cut-edge strips and a corrugation lip at the top. In front, a red sneaker toe-cap (paintRed rounded block with a paperWhite toe bumper and laces) pokes out at z 0.12..0.18. Add paperWhite socks showing between the cuff and the foot box, a paintBlue stripe on the side, a marker scribble and 2 foil bolts.\n- Foot soles are flat at y 0 (the lowest points sit on the floor).\nThe legs emerge from the open bottom of the torso at torsoBottom (y 0.42).",
      "box": [[-0.18, 0, -0.1], [0.18, 0.44, 0.19]],
      "attaches": "The tops disappear into the torso box's open bottom at torsoBottom, around hipL/hipR. The ankle joints are at ankleL/R, and the foot soles sit at footSoleL/R on y = 0.",
      "joints": ["hipL", "kneeL", "ankleL", "toeL", "hipR", "kneeR", "ankleR", "toeR"],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: kidFace -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildKidFace({ b, J, P, M }: any) {
  const r = rng(11);
  const C = M.skullCenter as number[];
  const [cx, cy, cz] = C;
  const head = J.head, jaw = J.jaw, neck = J.neck;

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any, opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });
  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);

  // Neck
  put(new THREE.CylinderGeometry(0.036, 0.04, 0.07, 8), P.skin, [0, 0.96, 0], neck);
  put(new THREE.CylinderGeometry(0.037, 0.037, 0.012, 8), P.skinShade, [0, 0.945, 0], neck);

  // Skull
  put(sph(1, 14, 10), P.skin, [cx, cy + 0.005, cz], head, { scale: [0.085, 0.095, 0.095] });
  // Jaw / chin on jaw joint
  put(sph(1, 10, 8), P.skin, [0, cy - 0.065, 0.03], jaw, { scale: [0.068, 0.04, 0.062] });
  put(sph(1, 6, 5), P.skin, [0, cy - 0.095, 0.065], jaw, { scale: [0.03, 0.018, 0.02] });
  // Lip line
  put(new THREE.BoxGeometry(0.044, 0.004, 0.006), P.marker, [0, cy - 0.052, 0.088], jaw, { rotation: [0, 0, 0] });

  // Smile (curved bars) with lips
  const smile = [[-0.022, 0.006], [-0.012, 0.0], [0, -0.002], [0.012, 0.0], [0.022, 0.006]];
  smile.forEach(([x, y], i) => {
    put(new THREE.BoxGeometry(0.013, 0.006, 0.006), P.cheek, [x, cy - 0.045 + y, 0.088], jaw, {
      rotation: [0, 0, (i - 2) * -9],
    });
  });

  // Face features
  for (const s of [1, -1]) {
    const ex = s * 0.034, ey = cy + 0.012, ez = 0.082;
    put(sph(1, 10, 8), P.eyeWhite, [ex, ey, ez], head, { scale: [0.022, 0.028, 0.012] });
    put(new THREE.CylinderGeometry(0.0145, 0.0145, 0.004, 10), P.iris, [ex, ey - 0.002, ez + 0.0105], head, { dir: [0, 0, 1] });
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), P.pupil, [ex, ey - 0.002, ez + 0.0125], head, { dir: [0, 0, 1] });
    put(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 6), P.eyeWhite, [ex + s * 0.005, ey + 0.006, ez + 0.0145], head, { dir: [0, 0, 1] });
    // brow
    put(new THREE.BoxGeometry(0.03, 0.006, 0.008), P.hair, [ex, ey + 0.04, 0.083], head, { rotation: [0, 0, s * 8] });
    // cheek blush
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10), P.cheek, [s * 0.052, cy - 0.025, 0.073], head, { dir: [s * 0.3, 0, 1] });
    // ears
    put(sph(1, 8, 6), P.skin, [s * 0.087, cy, 0], head, { scale: [0.01, 0.022, 0.016] });
    put(sph(1, 6, 5), P.skinShade, [s * 0.096, cy, 0.001], head, { scale: [0.004, 0.014, 0.01] });
    // freckles
    for (let i = 0; i < 3; i++)
      put(sph(0.0028, 5, 4), P.skinShade, [s * (0.04 + r() * 0.02), cy - 0.018 + r() * 0.012, 0.081], head);
  }

  // Nose
  put(sph(0.0125, 8, 6), P.skinShade, [0, cy - 0.012, 0.094], head);

  // Hair cap
  put(sph(1, 12, 8), P.hair, [cx, cy + 0.025, cz - 0.008], head, { scale: [0.09, 0.082, 0.098] });
  // Blades
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 0.08, z = Math.cos(a) * 0.085 - 0.005;
    put(new THREE.ConeGeometry(0.02, 0.05, 4), i % 2 ? P.hair : P.cardboardDark, [x, cy + 0.045, z], head, {
      dir: [Math.sin(a), -0.55, Math.cos(a)],
    });
  }
  // Fringe
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.03;
    put(new THREE.ConeGeometry(0.017, 0.045, 4), P.hair, [x, cy + 0.065, 0.082 - Math.abs(i - 2) * 0.006], head, {
      dir: [(i - 2) * 0.15, -1, 0.35],
    });
  }
  // Cowlick tuft
  put(new THREE.ConeGeometry(0.012, 0.045, 5), P.hair, [0.01, cy + 0.108, 0.01], head, { dir: [0.4, 1, 0.2] });
  put(new THREE.ConeGeometry(0.009, 0.035, 5), P.hair, [-0.008, cy + 0.106, 0.0], head, { dir: [-0.5, 1, 0.1] });
}
```

<!-- call: backpackRig -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBackpackRig({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const bone = J.chest;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bn = bone) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: bn, at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, sides: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), c, { bone, at: at as any, rotation: rot as any });

  // body shell
  const cx = 0, cy = 0.68, cz = -0.235;
  box(0.34, 0.36, 0.09, P.cardboard, [cx, cy, cz]);
  // cut-edge strips
  for (const s of [1, -1]) {
    box(0.006, 0.364, 0.094, P.cardboardEdge, [s * 0.171, cy, cz]);
    box(0.344, 0.006, 0.094, P.cardboardEdge, [0, cy + s * 0.181, cz]);
  }
  // face panel (back) lighter inset
  box(0.3, 0.3, 0.004, P.cardboardLight, [0, cy, -0.282]);
  // lid flap lifted
  box(0.35, 0.008, 0.1, P.cardboardDark, [0, 0.872, -0.238], [-6, 0, 0]);
  box(0.35, 0.004, 0.006, P.cardboardEdge, [0, 0.878, -0.29], [-6, 0, 0]);
  // lid dial and led
  cyl(0.025, 0.025, 0.008, 8, P.foil, [-0.07, 0.882, -0.238]);
  box(0.004, 0.003, 0.02, P.marker, [-0.07, 0.888, -0.238], [0, 30, 0]);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), P.ledGreen, { bone, at: [0.08, 0.882, -0.238] }), 1.5);

  // tape on sides/front
  for (const [x, y, r] of [[-0.1, 0.84, 2], [0.09, 0.84, -2]] as number[][])
    box(0.03, 0.04, 0.1, P.tape, [x, y, cz], [0, 0, r]);
  for (const s of [1, -1]) box(0.0015 + 0.002, 0.2, 0.03, P.tape, [s * 0.172, 0.7, cz], [0, 0, 2 * s]);

  // label sticker
  box(0.14, 0.07, 0.003, P.paperWhite, [0, 0.77, -0.2845], [0, 0, 1.5]);
  for (let i = 0; i < 5; i++)
    box(0.012, 0.03 + R() * 0.012, 0.002, P.marker, [-0.05 + i * 0.025, 0.77, -0.2865], [0, 0, (R() - 0.5) * 12]);
  // vent
  box(0.12, 0.07, 0.003, P.cardboardDark, [0, 0.6, -0.2845]);
  for (let i = 0; i < 6; i++) box(0.1, 0.006, 0.002, P.marker, [0, 0.575 + i * 0.012, -0.2865]);

  // thrusters
  for (const s of [1, -1]) {
    const x = s * 0.1, z = -0.27;
    cyl(0.05, 0.05, 0.22, 8, P.foil, [x, 0.6, z]);
    cyl(0.05, 0.05, 0.03, 8, P.foilDark, [x, 0.56, z]);
    cyl(0.05, 0.05, 0.015, 8, P.foilBright, [x, 0.65, z]);
    cyl(0.02, 0.05, 0.05, 8, P.foil, [x, 0.725, z]);
    cyl(0.022, 0.022, 0.03, 8, P.paintBlue, [x, 0.765, z]);
    // nozzle
    cyl(0.05, 0.035, 0.06, 8, P.foilDark, [x, 0.46, z]);
    cyl(0.03, 0.02, 0.01, 8, P.paintRed, [x, 0.428, z]);
    // crisscross tape on neck
    box(0.07, 0.012, 0.01, P.tape, [x, 0.73, z + 0.0], [0, 0, 35 * s]);
    box(0.07, 0.012, 0.01, P.tape, [x, 0.73, z + 0.002], [0, 0, -35 * s]);
    // flame
    const flame = (w: number, h: number, c: string, zo: number) =>
      b.extrude([[-w, 0], [w, 0], [w * 0.5, -h * 0.6], [0, -h, "sharp"], [-w * 0.5, -h * 0.6]] as any, {
        at: [x, 0.43, z + zo] as any, x: [1, 0, 0], thickness: 0.004, color: c, bone,
      });
    flame(0.04, 0.1, P.paintYellow, 0);
    flame(0.022, 0.06, P.paintRed, 0.003);
  }
  // hose between bottles
  b.sweep(
    [[-0.1, 0.55, -0.32], [-0.05, 0.5, -0.33], [0, 0.56, -0.33], [0.05, 0.5, -0.33], [0.1, 0.55, -0.32]] as any,
    0.012, { color: P.foil, bone, sides: 6 } as any,
  );

  // straps
  for (const s of [1, -1]) {
    const x = s * 0.12;
    box(0.045, 0.012, 0.16, P.tape, [x, 0.89, -0.2], [2 * s, 0, 0]);
    box(0.045, 0.34, 0.006, P.tape, [x, 0.7, -0.286], [0, 0, 1.5 * s]);
    box(0.045, 0.012, 0.1, P.tape, [x, 0.92, -0.15], [0, 0, 0]);
    box(0.03, 0.03, 0.006, P.foilBright, [x, 0.86, -0.29]);
    box(0.016, 0.016, 0.008, P.foilDark, [x, 0.86, -0.291]);
  }
}
```

<!-- call: arms -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildArms({ b, J, P, M }: any) {
  const R = rng(11);
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const wr = J["wrist" + side];
    const th = J["thumb" + side];
    const fi = J["fingers" + side];
    const shP = V([s * 0.27, 0.84, 0]);
    const elP = V([s * 0.38, 0.67, 0]);
    const wrP = V([s * 0.47, 0.5, 0.03]);

    // Upper arm: towel-roll tube
    const upStart = shP.clone().lerp(elP, 0.0);
    const upEnd = shP.clone().lerp(elP, 0.78);
    b.rod(upStart, upEnd, 0.058, P.cardboard, { bone: sh, section: { ngon: 8 } });
    for (const t of [0, 0.78]) {
      const p = shP.clone().lerp(elP, t);
      b.rod(p.clone().lerp(elP, t === 0 ? 0 : -0.01), p.clone().lerp(elP, t === 0 ? 0.03 : -0.0), 0.06, P.cardboardEdge, { bone: sh, section: { ngon: 8 } });
    }
    // tape spiral bands and yellow stripe
    for (let i = 0; i < 3; i++) {
      const t = 0.14 + i * 0.2;
      const a = shP.clone().lerp(elP, t - 0.03 + (R() - 0.5) * 0.01);
      const c = shP.clone().lerp(elP, t + 0.03);
      b.rod(a, c, 0.0605, P.tape, { bone: sh, section: { ngon: 8 } });
    }
    b.rod(shP.clone().lerp(elP, 0.5), shP.clone().lerp(elP, 0.58), 0.0605, P.paintYellow, { bone: sh, section: { ngon: 8 } });

    // Elbow accordion
    const eA = shP.clone().lerp(elP, 0.78);
    const eB = elP.clone().lerp(wrP, 0.12);
    for (let i = 0; i < 6; i++) {
      const t0 = i / 6, t1 = (i + 0.85) / 6;
      b.rod(eA.clone().lerp(eB, t0), eA.clone().lerp(eB, t1), 0.059, i % 2 ? P.foilDark : P.foil, {
        bone: i < 3 ? sh : el,
        section: { ngon: 7 },
      });
    }
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), P.foilBright, { bone: el, at: elP.clone().add(new THREE.Vector3(s * 0.058, 0, 0)), dir: [s, 0, 0] });

    // Forearm
    const fS = elP.clone().lerp(wrP, 0.1);
    const fE = elP.clone().lerp(wrP, 0.93);
    b.rod(fS, fE, 0.05, P.foil, { bone: el, section: { ngon: 8 } });
    const bands: [number, string, number][] = [
      [0.15, P.foilBright, 0.0505],
      [0.35, P.paintRed, 0.0508],
      [0.55, P.foilBright, 0.0505],
      [0.75, P.paintBlue, 0.0508],
    ];
    for (const [t, c, r] of bands) {
      b.rod(fS.clone().lerp(fE, t), fS.clone().lerp(fE, t + 0.08), r, c, { bone: el, section: { ngon: 8 } });
    }
    // wire loop
    b.sweep(
      [fS.clone().lerp(fE, 0.2).add(new THREE.Vector3(0, 0, 0.052)), fS.clone().lerp(fE, 0.4).add(new THREE.Vector3(s * 0.01, 0, 0.066)), fS.clone().lerp(fE, 0.6).add(new THREE.Vector3(0, 0, 0.052))],
      0.004, P.paintBlue, { bone: el },
    );

    // Cuff
    const cuffDir = wrP.clone().sub(elP).normalize();
    const cuffAt = wrP.clone().addScaledVector(cuffDir, -0.005);
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.016, 8), P.cardboardEdge, { bone: wr, at: cuffAt, dir: cuffDir.toArray() });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), P.cardboardLight, { bone: wr, at: cuffAt.clone().addScaledVector(cuffDir, -0.002), dir: cuffDir.toArray() });
    for (const a of [0.5, 2.6, 4.4]) {
      const off = new THREE.Vector3(Math.cos(a) * 0.058, 0, Math.sin(a) * 0.058);
      b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 6), P.foilBright, { bone: wr, at: cuffAt.clone().add(off) });
    }
    // skin wrist
    b.rod(wrP.clone().addScaledVector(cuffDir, 0.0), wrP.clone().addScaledVector(cuffDir, 0.04), 0.022, P.skin, { bone: wr, section: { ngon: 8 } });

    // Palm
    const palmAt = wrP.clone().addScaledVector(cuffDir, 0.05);
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.05), P.cardboard, { bone: wr, at: palmAt, dir: cuffDir.toArray() });
    b.part(new THREE.BoxGeometry(0.062, 0.012, 0.052), P.foil, { bone: wr, at: palmAt.clone().add(new THREE.Vector3(0, 0.012, 0)) });
    b.part(new THREE.BoxGeometry(0.03, 0.003, 0.004), P.marker, { bone: wr, at: palmAt.clone().add(new THREE.Vector3(-s * 0.03, -0.005, 0.0)), rotation: [0, 0, s * 10] });
    // Claws
    const clawLen = 0.075;
    const mk = (jt: any, zOff: number, name: string, ang: number) => {
      const base = V([s * 0.485, 0.455, zOff]);
      const tip = base.clone().add(new THREE.Vector3(s * 0.012, -clawLen, zOff > 0.03 ? 0.03 : -0.02));
      const mid = base.clone().lerp(tip, 0.5);
      const dir = tip.clone().sub(base).normalize();
      b.part(new THREE.BoxGeometry(0.025, clawLen, 0.03), P.foil, { bone: jt, at: mid, dir: dir.toArray() });
      b.part(new THREE.BoxGeometry(0.027, 0.012, 0.032), P.tape, { bone: jt, at: base.clone().lerp(tip, 0.1), dir: dir.toArray() });
      b.part(new THREE.BoxGeometry(0.027, 0.014, 0.032), P.paintRed, { bone: jt, at: base.clone().lerp(tip, 0.95), dir: dir.toArray() });
    };
    mk(th, 0.05, "thumb", 12);
    mk(fi, 0.01, "fingers", -12);
  }
}
```

<!-- call: headBox -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHeadBox({ b, J, P, M }: Ctx) {
  const head = J.head;
  const R = rng(11);
  const T = 0.008;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: head, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, s: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, s), c, { bone: head, at, rotation: rot });

  const y0 = 0.93, y1 = 1.23, yc = 1.08, S = 0.17;
  // shell
  box(0.34, 0.3, T, P.cardboard, [0, yc, -S]);
  box(T, 0.3, 0.34, P.cardboard, [S, yc, 0]);
  box(T, 0.3, 0.34, P.cardboard, [-S, yc, 0]);
  // top flaps
  box(0.34, T, 0.172, P.cardboardLight, [0, y1, 0.086], [-1.5, 0, 0.8]);
  box(0.34, T, 0.172, P.cardboard, [0, y1 + 0.002, -0.086], [2, 0, -0.6]);
  box(0.34, 0.002, 0.004, P.cardboardEdge, [0, y1 + 0.006, 0]);
  // front bars around window (x ±0.10, y 0.975..1.165)
  box(0.34, 0.045, T, P.cardboard, [0, 0.9525, S]);
  box(0.34, 0.065, T, P.cardboard, [0, 1.1975 , S]);
  box(0.07, 0.19, T, P.cardboard, [0.135, 1.07, S]);
  box(0.07, 0.19, T, P.cardboard, [-0.135, 1.07, S]);
  // 3-layer window frame
  const fl = [P.cardboardEdge, P.cardboardDark, P.cardboardLight];
  fl.forEach((c, i) => {
    const o = 0.004 + i * 0.006, z = S + 0.004 + i * 0.002;
    const w = 0.2 + 2 * o, h = 0.19 + 2 * o;
    box(w, 0.006, 0.004, c, [0, 1.07 + h / 2 - 0.003, z]);
    box(w, 0.006, 0.004, c, [0, 1.07 - h / 2 + 0.003, z]);
    box(0.006, h, 0.004, c, [w / 2 - 0.003, 1.07, z]);
    box(0.006, h, 0.004, c, [-w / 2 + 0.003, 1.07, z]);
  });
  // tape corner tabs
  for (const sx of [1, -1]) for (const sy of [1, -1])
    box(0.04, 0.012, 0.0015, P.tape, [sx * 0.112, 1.07 + sy * 0.1, S + 0.02], [0, 0, sx * sy * 45 + R() * 3]);
  // edge strips on box verticals
  for (const sx of [1, -1]) {
    box(0.01, 0.3, 0.004, P.cardboardEdge, [sx * S, yc, S + 0.001]);
    box(0.012, 0.3, 0.0015, P.tape, [sx * (S - 0.002), yc, S + 0.006], [0, 0, sx * 1.5]);
    box(0.012, 0.3, 0.0015, P.tape, [sx * (S - 0.002), yc, -S - 0.006], [0, 0, -sx * 1.5]);
  }
  box(0.34, 0.006, 0.004, P.cardboardEdge, [0, y0 + 0.003, S + 0.001]);
  // corrugation strips on sides
  for (const sx of [1, -1]) for (let i = 0; i < 3; i++)
    box(0.002, 0.008, 0.3, i % 2 ? P.cardboardDark : P.cardboardLight, [sx * (S + 0.005), 0.96 + i * 0.01, 0]);
  // top tape X
  box(0.4, 0.0015, 0.03, P.tape, [0, y1 + 0.012, 0], [0, 38, 0]);
  box(0.4, 0.0015, 0.03, P.tape, [0, y1 + 0.0135, 0], [0, -42, 0]);
  // LED hatch
  cyl(0.045, 0.045, 0.006, 12, P.cardboardDark, [0.07, y1 + 0.018, -0.07]);
  cyl(0.05, 0.05, 0.003, 12, P.cardboardEdge, [0.07, y1 + 0.015, -0.07]);
  glow(b.part(new THREE.SphereGeometry(0.025, 8, 4, 0, 6.3, 0, 1.6), P.ledRed, { bone: head, at: [0.07, y1 + 0.02, -0.07] }), 1.4);
  // antennae
  for (const s of [1, -1]) {
    const x = s * 0.08, a = s * 12;
    const dx = Math.sin((a * Math.PI) / 180) * 0.06;
    b.rod([x, y1, 0], [x + s * 0.025, 1.34, 0], 0.005, s > 0 ? P.paintYellow : P.paintRed, { bone: head, sides: 6 });
    for (let i = 0; i < 3; i++) {
      const t = 0.2 + i * 0.28;
      b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.008, 6), P.tape, { bone: head, at: [x + s * 0.025 * t, y1 + 0.11 * t, 0], rotation: [0, 0, -s * 12] });
    }
    b.part(new THREE.CylinderGeometry(0.012, 0.015, 0.012, 8), s > 0 ? P.paintBlue : P.paintRed, { bone: head, at: [x + s * 0.025, 1.343, 0] });
    b.part(new THREE.IcosahedronGeometry(0.025, 0), P.foil, { bone: head, at: [x + s * 0.025, 1.368, 0], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.012, 0), P.foilBright, { bone: head, at: [x + s * 0.025 + 0.012, 1.375, 0.012], flat: true });
    void dx;
  }
  // ear cups
  for (const s of [1, -1]) {
    cyl(0.04, 0.03, 0.06, 8, P.paperWhite, [s * 0.2, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.0415, 0.0395, 0.014, 8, P.paintBlue, [s * 0.198, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.036, 0.036, 0.003, 8, P.foil, [s * 0.231, 1.07, 0], [0, 0, -s * 90]);
    cyl(0.039, 0.039, 0.002, 8, P.marker, [s * 0.2295, 1.07, 0], [0, 0, -s * 90]);
    box(0.002, 0.012, 0.05, P.tape, [s * 0.19, 1.1, 0.0], [0, 0, 20]);
    box(0.03, 0.01, 0.0015, P.tape, [s * 0.172, 1.12, 0.02], [0, 90, 0]);
  }
  // mouth grille
  for (let i = 0; i < 6; i++)
    box(0.012, 0.016 + (i % 2) * 0.006, 0.002, P.marker, [-0.055 + i * 0.022, 0.952 + (i % 2) * -0.003, S + 0.005], [0, 0, R() * 6 - 3]);
  // red emblem above window
  cyl(0.026, 0.026, 0.003, 10, P.paintRed, [0, 1.2, S + 0.005], [90, 0, 0]);
  box(0.03, 0.006, 0.002, P.paperWhite, [0, 1.2, S + 0.008]);
  box(0.006, 0.03, 0.002, P.paperWhite, [0, 1.2, S + 0.008]);
  // cheek tape seams
  for (const s of [1, -1]) box(0.012, 0.09, 0.0015, P.tape, [s * 0.145, 1.07, S + 0.006], [0, 0, s * 8]);
}
```

<!-- call: legs -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  for (const s of [1, -1]) {
    const hip = s > 0 ? J.hipL : J.hipR;
    const knee = s > 0 ? J.kneeL : J.kneeR;
    const ankle = s > 0 ? J.ankleL : J.ankleR;
    const toe = s > 0 ? J.toeL : J.toeR;
    const x = s * 0.1;

    // Jeans: thigh and shin
    b.rod([x, 0.5, 0], [x, 0.27, 0.01], [0.045, 0.043], P.jeans, { bone: hip, sides: 8 });
    b.rod([x, 0.27, 0.01], [x, 0.09, 0], [0.04, 0.038], P.jeans, { bone: knee, sides: 8 });
    // knee crease
    for (const dz of [0, 0.012]) {
      b.part(box(0.07, 0.003, 0.004), P.marker, { bone: knee, at: [x, 0.272 - dz, 0.05], rotation: [0, 0, s * (2 + R() * 2)] });
    }
    // seam stitching on outer side
    for (let i = 0; i < 6; i++) {
      b.part(box(0.003, 0.014, 0.002), P.marker, { bone: hip, at: [x + s * 0.0455, 0.47 - i * 0.032, 0.0], rotation: [0, 0, 0] });
    }
    // pocket patch
    b.part(box(0.004, 0.05, 0.04), "#4a6bab", { bone: hip, at: [x + s * 0.045, 0.44, 0.01] });
    for (let i = 0; i < 3; i++)
      b.part(box(0.002, 0.003, 0.012), P.marker, { bone: hip, at: [x + s * 0.048, 0.46 - i * 0.015, 0.01] });

    // rolled hem cuff
    b.part(cyl(0.046, 0.046, 0.025, 8), "#4a6bab", { bone: ankle, at: [x, 0.115, 0] });
    b.part(cyl(0.048, 0.048, 0.004, 8), P.cardboardEdge === undefined ? P.marker : "#2f4a80", { bone: ankle, at: [x, 0.127, 0] });
    // sock
    b.part(cyl(0.032, 0.034, 0.03, 8), P.paperWhite, { bone: ankle, at: [x, 0.085, 0] });

    // Shin guard (foil-wrapped cardboard box)
    const gz = 0.048;
    b.part(box(0.08, 0.14, 0.07), P.foil, { bone: knee, at: [x, 0.175, gz - 0.01] });
    for (let i = 0; i < 4; i++) {
      b.part(box(0.082, 0.01, 0.072), i % 2 ? P.foilDark : P.foilBright, { bone: knee, at: [x, 0.115 + i * 0.04, gz - 0.01 + 0.0005] });
    }
    // edge strips
    for (const sx of [-1, 1])
      b.part(box(0.004, 0.142, 0.072), P.cardboardEdge, { bone: knee, at: [x + sx * 0.041, 0.175, gz - 0.01] });
    // tape straps
    for (const y of [0.13, 0.225]) {
      b.part(box(0.086, 0.028, 0.0015), P.tape, { bone: knee, at: [x, y, gz + 0.027], rotation: [0, 0, (R() - 0.5) * 4] });
      b.part(box(0.0015, 0.028, 0.076), P.tape, { bone: knee, at: [x + 0.041, y, gz - 0.01] });
      b.part(box(0.0015, 0.028, 0.076), P.tape, { bone: knee, at: [x - 0.041, y, gz - 0.01] });
    }
    // yellow stripe
    b.part(box(0.07, 0.012, 0.002), P.paintYellow, { bone: knee, at: [x, 0.178, gz + 0.026], rotation: [0, 0, s * 3] });
    // rivets
    for (const sx of [-1, 1])
      b.part(cyl(0.007, 0.007, 0.003, 8), P.foilBright, { bone: knee, at: [x + sx * 0.03, 0.2, gz + 0.027], rotation: [90, 0, 0] });

    // Knee-cap box
    b.part(box(0.075, 0.055, 0.03), P.cardboard, { bone: knee, at: [x, 0.285, 0.05], rotation: [0, 0, s * 2] });
    b.part(box(0.077, 0.005, 0.032), P.cardboardEdge, { bone: knee, at: [x, 0.313, 0.05] });
    b.part(box(0.077, 0.005, 0.032), P.cardboardEdge, { bone: knee, at: [x, 0.257, 0.05] });
    b.part(box(0.077, 0.004, 0.0015), P.cardboardDark, { bone: knee, at: [x, 0.285, 0.0662] });

    // Foot box (z -0.09..0.12, y 0..0.1, half width 0.065)
    b.part(box(0.13, 0.092, 0.21), P.cardboard, { bone: ankle, at: [x, 0.052, 0.015] });
    // sole base strip
    b.part(box(0.134, 0.008, 0.214), P.cardboardEdge, { bone: ankle, at: [x, 0.004, 0.015] });
    // corrugation lip at the top
    b.part(box(0.134, 0.006, 0.214), P.cardboardLight, { bone: ankle, at: [x, 0.099, 0.015] });
    b.part(box(0.134, 0.003, 0.214), P.cardboardEdge, { bone: ankle, at: [x, 0.103, 0.015] });
    // ankle tape band
    b.part(box(0.138, 0.03, 0.0015), P.tape, { bone: ankle, at: [x, 0.07, -0.0915], rotation: [0, 0, 1.5] });
    b.part(box(0.0015, 0.03, 0.216), P.tape, { bone: ankle, at: [x + s * 0.066, 0.07, 0.015] });
    b.part(box(0.138, 0.03, 0.0015), P.tape, { bone: ankle, at: [x, 0.07, 0.1215], rotation: [0, 0, -1.5] });
    // blue stripe on side
    b.part(box(0.0015, 0.014, 0.15), P.paintBlue, { bone: ankle, at: [x + s * 0.066, 0.04, 0.02] });
    // marker scribble
    for (let i = 0; i < 4; i++)
      b.part(box(0.0015, 0.004, 0.02), P.marker, { bone: ankle, at: [x - s * 0.066, 0.055 + (i % 2) * 0.01, -0.05 + i * 0.012], rotation: [0, 0, (i % 2 ? 25 : -25)] });
    // foil bolts
    for (const z of [-0.05, 0.07])
      b.part(cyl(0.008, 0.008, 0.003, 8), P.foilBright, { bone: ankle, at: [x + s * 0.066, 0.075, z], rotation: [0, 0, 90] });

    // Sneaker toe-cap poking out
    b.part(box(0.1, 0.07, 0.065), P.paintRed, { bone: toe, at: [x, 0.037, 0.153] });
    b.part(box(0.1, 0.045, 0.02), P.paintRed, { bone: toe, at: [x, 0.062, 0.115] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.paintRed, { bone: toe, at: [x, 0.07, 0.15], scale: [1, 0.35, 0.6] });
    // white bumper
    b.part(box(0.104, 0.02, 0.012), P.paperWhite, { bone: toe, at: [x, 0.012, 0.183] });
    b.part(box(0.104, 0.035, 0.004), P.paperWhite, { bone: toe, at: [x, 0.04, 0.186] });
    // laces
    for (let i = 0; i < 3; i++)
      b.part(box(0.06, 0.004, 0.004), P.paperWhite, { bone: toe, at: [x, 0.083, 0.135 + i * 0.016], rotation: [0, (i - 1) * 8, 0] });
    // sole under toe cap
    b.part(box(0.104, 0.008, 0.07), P.paperWhite, { bone: toe, at: [x, 0.004, 0.15] });
  }
}
```

<!-- call: torsoBox -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorsoBox({ b, J, P, M }: any) {
  const T = 0.008;
  const bone = J.chest;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot: number[] = [0, 0, 0], bn = bone) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: bn, at, rotation: rot });
  const cyl = (rt: number, h: number, c: string, at: number[], dir: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rt, h, seg), c, { bone, at, dir });
  const Y0 = 0.42, Y1 = 0.93, X = 0.26, Z = 0.18, H = Y1 - Y0, YC = (Y0 + Y1) / 2;

  // back, front
  box(2 * X, H, T, P.cardboard, [0, YC, -Z]);
  box(2 * X, H, T, P.cardboard, [0, YC, Z]);
  box(0.44, 0.42, 0.006, P.cardboardLight, [0, YC, Z + 0.006]);

  // side panels with arm holes (built as bars around hole)
  const hy = 0.84, hr = 0.065;
  for (const s of [1, -1]) {
    const x = s * X;
    box(T, hy - hr - Y0, 2 * Z, P.cardboard, [x, (Y0 + hy - hr) / 2, 0]);
    box(T, Y1 - hy - hr, 2 * Z, P.cardboard, [x, (Y1 + hy + hr) / 2, 0]);
    box(T, 2 * hr, Z - hr, P.cardboard, [x, hy, (Z + hr) / 2]);
    box(T, 2 * hr, Z - hr, P.cardboard, [x, hy, -(Z + hr) / 2]);
    // rim strips
    const cols = [P.cardboardEdge, P.cardboardDark, P.cardboardLight, P.cardboardEdge];
    cols.forEach((c, i) => {
      const r = hr + 0.004 + i * 0.005;
      b.part(new THREE.TorusGeometry(r, 0.0035, 5, 14), c, { bone, at: [x + s * (0.004 + i * 0.001), hy, 0], dir: [1, 0, 0], axis: "z" });
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.4 + s * 0.1;
      box(0.0015, 0.03, 0.05, P.tape, [x + s * 0.006, hy + Math.sin(a) * 0.1, Math.cos(a) * 0.1], [(a * 180) / Math.PI - 90 + 0, 0, 0]);
    }
    // edge strips on side
    box(0.012, 0.006, 2 * Z, P.cardboardEdge, [x, Y0, 0]);
    box(0.012, 0.006, 2 * Z, P.cardboardEdge, [x, Y1, 0]);
  }
  // top panel with neck hole (0.2 square)
  const tw = (2 * X - 0.2) / 2, td = (2 * Z - 0.2) / 2;
  for (const s of [1, -1]) {
    box(tw, T, 2 * Z, P.cardboard, [s * (0.1 + tw / 2), Y1, 0]);
    box(0.2, T, td, P.cardboard, [0, Y1, s * (0.1 + td / 2)]);
  }
  // flaps
  box(0.4, T, 0.1, P.cardboardLight, [0, Y1 + 0.03, Z + 0.04], [-35, 0, 2]);
  box(0.4, T, 0.1, P.cardboardLight, [0, Y1 + 0.015, -Z - 0.05], [20, 0, -3]);
  box(0.1, 0.0015, 0.03, P.tape, [0.08, Y1 + 0.006, Z - 0.005], [0, 4, 0]);
  box(0.1, 0.0015, 0.03, P.tape, [-0.1, Y1 + 0.006, -Z + 0.01], [0, -3, 0]);

  // edge strips on front/back top & bottom
  for (const z of [Z, -Z]) {
    box(2 * X, 0.006, 0.012, P.cardboardEdge, [0, Y0, z]);
    box(2 * X, 0.006, 0.012, P.cardboardEdge, [0, Y1 + 0.002, z]);
  }
  // corner tape seams
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.03, H, 0.03, P.tape, [sx * (X + 0.001), YC, sz * (Z + 0.001)], [0, 0, sx * 1.5]);
  }
  // hem band
  box(2 * X + 0.012, 0.04, 2 * Z + 0.012, P.tape, [0, Y0 + 0.03, 0]);
  box(0.06, 0.0015, 0.05, P.tape, [-0.15, 0.55, Z + 0.008], [0, 0, 20]);
  box(0.06, 0.0015, 0.05, P.tape, [0.2, 0.9, Z + 0.003], [0, 0, -15]);

  // control board
  const bz = 0.192;
  const bd = (w: number, h: number, c: string, x: number, y: number, t = 0.002, dz = 0.006) =>
    box(w, h, t, c, [x, 0.68 + y, bz + dz], [0, 0, 1.5]);
  bd(0.31, 0.27, P.cardboardEdge, 0, 0, 0.01, 0);
  bd(0.30, 0.26, P.cardboardLight, 0, 0, 0.004, 0.005);
  // screen
  bd(0.18, 0.1, P.marker, 0, 0.07, 0.003, 0.008);
  glow(bd(0.17, 0.09, P.screenGlow, 0, 0.07, 0.003, 0.0105), 1.2);
  const zz = [[-0.07, 0], [-0.04, 0.03], [-0.02, -0.025], [0.01, 0.03], [0.04, -0.02], [0.07, 0]];
  for (let i = 0; i < zz.length - 1; i++) {
    const [x0, y0] = zz[i], [x1, y1] = zz[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    box(len, 0.004, 0.002, P.marker, [(x0 + x1) / 2, 0.75 + (y0 + y1) / 2, bz + 0.0135], [0, 0, (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI]);
  }
  // dials
  [-0.09, 0, 0.09].forEach((x, i) => {
    cyl(0.03, 0.006, P.foil, [x, 0.6, bz + 0.01], [0, 0, 1]);
    cyl(0.012, 0.007, P.foilDark, [x, 0.6, bz + 0.0125], [0, 0, 1], 8);
    box(0.004, 0.022, 0.002, P.marker, [x + 0.006 * (i - 1), 0.612, bz + 0.0145], [0, 0, 20 * (i - 1)]);
    for (let k = 0; k < 5; k++) {
      const a = -0.9 + k * 0.45;
      box(0.003, 0.006, 0.002, P.marker, [x + Math.sin(a) * 0.036, 0.6 + Math.cos(a) * 0.036, bz + 0.011]);
    }
  });
  // buttons
  const bc = [P.paintRed, P.paintBlue, P.paintYellow, P.paintRed, P.paintBlue, P.paintYellow];
  bc.forEach((c, i) => cyl(0.014, 0.008, c, [-0.11 + i * 0.044, 0.545, bz + 0.011], [0, 0, 1], 8));
  // toggles
  [-0.12, -0.08].forEach((x) => {
    cyl(0.003, 0.03, P.foilDark, [x, 0.5, bz + 0.016], [0, 0.4, 1], 5);
    b.part(new THREE.SphereGeometry(0.007, 6, 4), P.paperWhite, { bone, at: [x, 0.512, bz + 0.03] });
  });
  // LEDs
  [P.ledRed, P.ledGreen, P.ledGreen].forEach((c, i) =>
    glow(b.part(new THREE.SphereGeometry(0.007, 6, 4), c, { bone, at: [0.06 + i * 0.03, 0.51, bz + 0.012] }), 1.5));
  // vent slits ring
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    box(0.003, 0.014, 0.002, P.marker, [0.115 + Math.cos(a) * 0.022, 0.5 + Math.sin(a) * 0.022, bz + 0.0115], [0, 0, (a * 180) / Math.PI - 90]);
  }
  // lettering "BOT"-like blocky bars
  const bars: number[][] = [[-0.06, 0], [-0.05, 0], [-0.02, 0], [0.0, 0.0], [0.03, 0], [0.05, 0]];
  bars.forEach(([x], i) => box(0.006, 0.02, 0.002, P.marker, [x + 0.005, 0.605 - 0.07 + 0.0 * i + 0.07 - 0.0, bz + 0.0125]).position.y += 0);
  box(0.03, 0.005, 0.002, P.marker, [-0.03, 0.634 - 0.0, bz + 0.0125]);
  // big red button
  cyl(0.026, 0.01, P.foilBright, [-0.075, 0.45, bz + 0.011], [0, 0, 1]);
  cyl(0.02, 0.014, P.paintRed, [-0.075, 0.45, bz + 0.014], [0, 0, 1]);
  // rivets
  for (const sx of [1, -1]) for (const sy of [1, -1]) for (const o of [0.012, 0.03])
    cyl(0.005, 0.003, P.foil, [sx * (0.14 - (o > 0.02 ? 0.02 : 0)), 0.68 + sy * (0.12 - (o > 0.02 ? 0.02 : 0)), bz + 0.0095], [0, 0, 1], 6);
  // wire loops
  for (const s of [1, -1]) {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.15, 0.58, bz + 0.01),
      new THREE.Vector3(s * 0.2, 0.62, Z + 0.035),
      new THREE.Vector3(s * 0.25, 0.6, 0.12),
      new THREE.Vector3(s * 0.262, 0.56, 0.06),
    ]);
    b.part(new THREE.TubeGeometry(c, 12, 0.003, 5), P.paintBlue, { bone, at: [0, 0, 0] });
  }
  // warning stripe
  box(0.46, 0.05, 0.003, P.marker, [0, 0.46, Z + 0.011]);
  for (let i = 0; i < 12; i++)
    box(0.02, 0.058, 0.003, P.paintYellow, [-0.22 + i * 0.04, 0.46, Z + 0.0135], [0, 0, 30]);
}
```