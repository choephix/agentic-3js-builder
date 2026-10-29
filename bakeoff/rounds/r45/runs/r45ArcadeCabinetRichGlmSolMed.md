<!-- call: plan -->

```json
{
  "name": "Neon Horizon — 1980s Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet in synthwave style: deep violet cabinet with sunset side stripes, a neon-trimmed control deck, a glowing CRT with a cyan grid and magenta sun, and a backlit marquee crown.",
  "builderName": "arcadeCabinet",
  "size": [0.75, 1.78, 0.9],
  "layout": "An upright arcade cabinet standing on the floor, facing +Z: the player stands at +Z and looks into the screen. It is a single tall slab 0.75 m wide, 1.78 m tall and 0.90 m deep, centred on x = 0, front face at z = +0.45, back at z = -0.45. From bottom to top: (1) a plinth/base body y 0-1.02 with a coin door and kick panel on the front face; (2) a control deck y 1.02-1.22, a slab that slopes down toward the player (high at its rear edge z = 0.18, low at its front lip z = 0.46) carrying two joysticks and button clusters; (3) a screen housing y 1.02-1.62 set back at z -0.45..0.24, with a dark CRT glass tilted back ~8 degrees, a chunky bezel and side cheeks; (4) a marquee lightbox y 1.60-1.80 that caps the top and juts slightly forward, backlit with a neon sun and horizon-grid logo; (5) a flat rear panel at z -0.40..-0.47 closing the back with vents and a power switch. Synthwave shows everywhere: the cabinet is deep indigo-violet, every edge wears thin neon trim (pink/cyan/purple) as separate small parts, the sides carry horizontal sunset bands (orange over red over magenta), the screen glows with a cyan perspective grid and a striped magenta-orange sun on a dark field, and the marquee glows warm cream behind a neon logo. Everything is blocky primitives with facet edges; fine detail is small parts in their own flat colours seated on the surfaces.",
  "palette": {
    "cabBody": "#241a3e",
    "cabSide": "#2f2352",
    "cabEdge": "#4a3a78",
    "ink": "#12081f",
    "neonPink": "#ff4fd8",
    "neonCyan": "#2ff3ff",
    "neonPurple": "#8a5cff",
    "sunOrange": "#ff7a3c",
    "sunYellow": "#ffc93c",
    "sunRed": "#ff3b5c",
    "screenDark": "#0d0a1e",
    "chrome": "#c9d2e8",
    "panelDark": "#1a142c",
    "btnRed": "#ff3b3b",
    "btnYellow": "#ffd23c",
    "btnBlue": "#3c8cff",
    "btnGreen": "#3cff6e",
    "stickBall": "#ff2f6e",
    "steel": "#9aa3b8",
    "marqueeGlow": "#fff4d2"
  },
  "mounts": {
    "bodyTop": "the body's top plane at y = 1.02, spanning z -0.45..0.46; the control deck sits on its front zone (z 0.18..0.46) and the screen housing on its rear zone (z -0.45..0.20)",
    "deckFrontLip": [0, 1.05, 0.46],
    "deckRearEdge": [0, 1.22, 0.18],
    "screenSill": [0, 1.06, 0.22],
    "screenTop": [0, 1.62, 0],
    "rearFace": "the shared back plane at z = -0.45 (rear skin builds to z -0.47 for thickness)"
  },
  "joints": [
    { "name": "cabinet", "at": [0, 0.9, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "joy1", "parent": "cabinet", "at": [0.22, 1.12, 0.34], "dir": [0, 1, 0], "role": "hinge" },
    { "name": "joy2", "parent": "cabinet", "at": [-0.22, 1.12, 0.34], "dir": [0, 1, 0], "role": "hinge" }
  ],
  "parts": [
    {
      "id": "baseBody",
      "builds": "The lower cabinet body y 0-1.02, a slab box 0.72 wide (x -0.36..0.36) and 0.90 deep (z -0.45..0.45) in cabBody, standing on y = 0. Front face (+Z): a kick plinth strip y 0..0.08 in ink, then the coin door — a recessed steel rectangle ~0.28 wide x 0.30 tall centred at [0, 0.38, 0.452], with two coin-entry slots as small chrome plates, a lock cylinder dot, and a thin neonPink trim frame around the door. Above the door a small chrome manufacturer plate at [0, 0.85, 0.452] (~0.2 x 0.08). Sides (x = +/-0.36): the signature synthwave side art as horizontal sunset bands built as thin proud panels, each a separate flat-coloured part on its own colour: from y 0.55 to 0.95 a stack of sunYellow, sunOrange, sunRed, neonPink bands each ~0.08-0.10 tall and ~0.06 wide proud of the side, reading as a setting sun; below them two thin neonCyan pinstripes y 0.30 and 0.34; all bands inset from the front/back edges so the cabEdge corner posts stay visible. Top: a thin cabEdge trim band around the top perimeter. Back edge closed with a simple cabSide skin at z = -0.45 in this y range (the rear panel part overlaps outside it). All trims and stripes are small parts seated exactly on the slab faces.",
      "box": [[-0.36, 0, -0.45], [0.36, 1.02, 0.46]],
      "attaches": "Stands on the floor (floor: true). Its top plane y = 1.02 is the mount bodyTop; the control deck sits on its front zone and the screen housing on its rear zone. Rear skin meets rearFace.",
      "joints": ["cabinet"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "controlDeck",
      "builds": "The player-facing control deck: a sloped slab in cabBody from the front lip (z = 0.46, y = 1.05) up to the rear edge (z = 0.18, y = 1.22), 0.80 wide (x -0.40..0.40), with two short side cheeks in cabEdge closing the wedge at each end. The top surface carries the controls: at [0.22, 1.12, 0.34] and [-0.22, 1.12, 0.34] (exactly the joy1 and joy2 joints) a black joystick well ring in panelDark with a chrome shaft (thin rod ~0.09 tall leaning slightly toward the player) topped by a stickBall sphere ~0.035 radius — build the shaft and ball under joint joy1 / joy2 so they can wiggle. In front of each stick a fan of four round buttons ~0.028 diameter in btnRed, btnYellow, btnBlue, btnGreen, seated in a panelDark button deck plate (~0.22 x 0.14) inset into the slope. Between the player positions, a small control-panel artwork insert: a neonPurple rectangle with a tiny neonCyan grid of thin strips and a neonPink sun disc. Around the whole deck lip runs a thin neonCyan edge trim; the rear edge where the deck meets the screen housing gets a neonPink trim strip. Under-deck skirt in cabBody closes the wedge front face y 1.02..1.05.",
      "box": [[-0.4, 1.0, 0.16], [0.4, 1.24, 0.46]],
      "attaches": "Sits on bodyTop (front zone). Its rear/top edge meets the screen housing front bottom at mount deckRearEdge [0, 1.22, 0.18]; front lip overhangs to deckFrontLip [0, 1.05, 0.46]. Joystick shafts and balls ride joints joy1 and joy2; everything else rides cabinet.",
      "joints": ["cabinet", "joy1", "joy2"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "screenHousing",
      "builds": "The CRT housing y 1.02-1.62, a box 0.72 wide (x -0.36..0.36) spanning z -0.45..0.24 in cabBody, with its own side cheeks in cabSide for this y range carrying a continuation of the sunset band motif: one neonPurple band y 1.15..1.22 and one neonCyan pinstripe y 1.38 on each side. Front face: a chunky bezel frame in cabEdge ~0.09 wide around a screen opening centred at [0, 1.34, 0.22]; inside it the CRT glass, a dark panel in screenDark tilted back ~8 degrees (top edge further back than the bottom), about 0.56 wide x 0.42 tall. On the glass, built as separate glowing parts: a magenta-orange striped setting sun (stacked sunRed / sunOrange / sunYellow horizontal bars of decreasing width, the lowest bar split by two thin screenDark gaps, classic synthwave sun) centred slightly above screen centre, and below it a cyan perspective grid — a horizon line in neonCyan plus 5-6 fan lines converging toward the horizon and 4-5 horizontal lines widening downward, all thin neonCyan strips. glow() the sun bars and grid strips so the screen is self-lit. Add two small chrome screen-corner screws and a thin ink screen shadow line under the bottom bezel. Bottom front of the housing (below the bezel, y 1.02..1.10, z down to 0.22) is a cabBody apron that meets the deck's rear edge.",
      "box": [[-0.36, 1.0, -0.45], [0.36, 1.62, 0.26]],
      "attaches": "Sits on bodyTop (rear zone), sill at screenSill [0, 1.06, 0.22]. Its front lower edge meets the control deck at deckRearEdge; its top plane y = 1.62 is the screenTop mount where the marquee sits. Rear face meets rearFace.",
      "joints": ["cabinet"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "marquee",
      "builds": "The crown: a marquee lightbox y 1.60-1.80, 0.76 wide (x -0.38..0.38, jutting 0.02 past the housing on each side), z -0.45..0.26, jutting 0.02 forward of the screen housing. Main body in cabBody; the backlit front panel (a recessed rectangle ~0.62 wide x 0.14 tall centred at [0, 1.70, 0.245], in marqueeGlow) glows — pass it through glow() — and carries the logo built as flat parts on its face: a synthwave setting sun half-disc of stacked neonPink / sunRed / sunOrange horizontal bars on the left-centre, two thin neonCyan horizon lines running under it, and a simple game title as chunky geometric letterforms (abstract angular blocks, e.g. three strokes forming a stylised 'N' plus a triangle 'A'-like shape) in ink and neonPurple on the right. Around the lit panel a chrome bezel frame, and along the very top edge a full-width neonPink trim strip plus a thin cabEdge cap slab on top. Sides of the lightbox get one diagonal neonCyan stripe each. The back of the lightbox closes in cabBody down to the housing top.",
      "box": [[-0.38, 1.58, -0.45], [0.38, 1.8, 0.26]],
      "attaches": "Sits on the screen housing top at screenTop [0, 1.62, 0] (its inner walls overlap the housing's top 2 cm). Front face and sides are the model's top silhouette; nothing sits above y = 1.80.",
      "joints": ["cabinet"],
      "floor": false,
      "budget": 160
    },
    {
      "id": "rearPanel",
      "builds": "The cabinet's back, seen when walking around the machine: a flat rear skin spanning x -0.36..0.36, y 0.02-1.60 at z -0.40..-0.47 in cabSide, closing behind the body, screen housing and deck. On it: a wide vent grille — a recessed panelDark rectangle ~0.34 x 0.30 centred at [0, 1.30, -0.462] with 6 horizontal chrome louvre slats; a small steel power-switch plate at [0.18, 0.95, -0.462] with a chrome rocker switch and a tiny neonRed indicator dot; a cable exit grommet in ink at [-0.18, 0.35, -0.462]; and one bold synthwave signature: a full-width horizontal neonPurple trim stripe y 1.44 plus a thin neonCyan stripe y 0.55 wrapping the whole back. A small rectangular service hatch in cabBody with a neonPink trim frame sits at [0, 0.62, -0.462]. The skin's top edge at y = 1.60 tucks under the marquee box; its bottom stops 2 cm above the floor.",
      "box": [[-0.36, 0.02, -0.47], [0.36, 1.6, -0.4]],
      "attaches": "Covers the shared rearFace plane; sits behind baseBody (which owns a simple closing skin at z = -0.45 in its y range), the screen housing and the control deck. Top edge meets the marquee's underside; bottom floats 2 cm above the floor.",
      "joints": ["cabinet"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: screenHousing -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildScreenHousing({ b, J, P, M }: Ctx) {
  const body = J.body;
  const B = P.cabBody;
  const SIDE = P.cabSide;
  const EDGE = P.cabEdge;
  const INK = P.ink;
  const PINK = P.neonPink;
  const CYAN = P.neonCyan;
  const PURPLE = P.neonPurple;
  const RED = P.sunRed;
  const ORANGE = P.sunOrange;
  const YELLOW = P.sunYellow;
  const DARK = P.screenDark;
  const CHROME = P.chrome;
  const APRON = P.cabBody;

  const deg = (n: number) => n;
  const screenTilt = -8;
  const screenCenterY = 1.345;
  const screenCenterZ = 0.218;
  const screenWidth = 0.56;
  const screenHeight = 0.42;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: body,
      at,
      rotation,
      name,
      group: "screenHousing",
    });

  const plane = (
    size: [number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation: [number, number, number] = [screenTilt, 0, 0],
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), color, {
      bone: body,
      at,
      rotation,
      name,
      group: "screenHousing",
    });

  const screenZ = (y: number, lift = 0) =>
    screenCenterZ + Math.tan((screenTilt * Math.PI) / 180) * (y - screenCenterY) + lift;

  const screenPart = (
    size: [number, number],
    x: number,
    y: number,
    color: string,
    name: string,
    lift = 0.006,
  ) =>
    plane(size, [x, y, screenZ(y, lift)], color, name);

  const glowPart = (
    size: [number, number],
    x: number,
    y: number,
    color: string,
    name: string,
    lift = 0.009,
  ) => glow(screenPart(size, x, y, color, name, lift), 1.7);

  // Main upright CRT housing, deliberately chunky and slightly deeper than the visible front.
  box([0.72, 0.60, 0.71], [0, 1.32, -0.095], B, undefined, "screenHousingBody");

  // Dark side cheek plates, proud of the cabinet sides.
  for (const s of [-1, 1]) {
    box([0.035, 0.59, 0.64], [s * 0.365, 1.32, -0.095], SIDE, undefined, `sideCheek${s}`);

    // Continuation of the sunset motif on each cheek.
    box([0.012, 0.070, 0.49], [s * 0.386, 1.185, -0.105], PURPLE, undefined, `purpleSideBand${s}`);
    box([0.014, 0.012, 0.51], [s * 0.388, 1.385, -0.105], CYAN, undefined, `cyanSidePinstripe${s}`);

    // Small darker separator and a second highlight edge make the side art read as layered plastic.
    box([0.009, 0.010, 0.50], [s * 0.394, 1.147, -0.105], INK, undefined, `sideBandShadow${s}`);
    box([0.009, 0.009, 0.50], [s * 0.394, 1.223, -0.105], PINK, undefined, `sideBandHighlight${s}`);

    // Tiny vertical neon corner rails.
    box([0.010, 0.55, 0.012], [s * 0.395, 1.32, 0.218], PINK, undefined, `sideFrontRail${s}`);
    box([0.010, 0.55, 0.010], [s * 0.395, 1.32, -0.425], PURPLE, undefined, `sideRearRail${s}`);
  }

  // Lower front apron below the bezel, meeting the sloped deck at the sill.
  box([0.66, 0.085, 0.055], [0, 1.065, 0.232], APRON, undefined, "screenApron");
  box([0.64, 0.010, 0.012], [0, 1.022, 0.264], PINK, undefined, "apronNeonEdge");
  box([0.58, 0.014, 0.010], [0, 1.096, 0.266], EDGE, undefined, "apronTopEdge");

  // CRT glass, inset behind the heavy bezel.
  const glass = screenPart([screenWidth, screenHeight], 0, screenCenterY, DARK, "crtGlass", 0.002);
  glass.mesh.renderOrder = 1;

  // Bezel frame: four thick, flat pieces following the CRT tilt.
  const bezelDepth = 0.052;
  const bezelLift = 0.035;
  const bezelTopY = screenCenterY + screenHeight / 2 + 0.047;
  const bezelBottomY = screenCenterY - screenHeight / 2 - 0.047;
  const bezelSideY = screenCenterY;
  const bezelTopZ = screenZ(bezelTopY, bezelLift);
  const bezelBottomZ = screenZ(bezelBottomY, bezelLift);

  box([0.70, 0.090, bezelDepth], [0, bezelTopY, bezelTopZ], EDGE, [screenTilt, 0, 0], "bezelTop");
  box([0.70, 0.090, bezelDepth], [0, bezelBottomY, bezelBottomZ], EDGE, [screenTilt, 0, 0], "bezelBottom");
  box([0.090, 0.43, bezelDepth], [-0.305, bezelSideY, screenZ(bezelSideY, bezelLift)], EDGE, [screenTilt, 0, 0], "bezelLeft");
  box([0.090, 0.43, bezelDepth], [0.305, bezelSideY, screenZ(bezelSideY, bezelLift)], EDGE, [screenTilt, 0, 0], "bezelRight");

  // Bright inner bezel keylines.
  box([0.575, 0.012, 0.010], [0, screenCenterY + 0.214, screenZ(screenCenterY + 0.214, 0.066)], PINK, [screenTilt, 0, 0], "bezelPinkTop");
  box([0.575, 0.012, 0.010], [0, screenCenterY - 0.214, screenZ(screenCenterY - 0.214, 0.066)], PURPLE, [screenTilt, 0, 0], "bezelPurpleBottom");
  box([0.012, 0.38, 0.010], [-0.286, screenCenterY, screenZ(screenCenterY, 0.066)], CYAN, [screenTilt, 0, 0], "bezelCyanLeft");
  box([0.012, 0.38, 0.010], [0.286, screenCenterY, screenZ(screenCenterY, 0.066)], CYAN, [screenTilt, 0, 0], "bezelCyanRight");

  // Screen corner screws. Cylinders use local +Y, aimed straight toward the player.
  for (const x of [-0.285, 0.285]) {
    const screw = b.part(
      new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8),
      CHROME,
      {
        bone: body,
        at: [x, screenCenterY + 0.184, screenZ(screenCenterY + 0.184, 0.073)],
        dir: [0, 0, 1],
        name: `bezelScrew${x}`,
        group: "screenHousing",
      },
    );
    screw.mesh.rotation.z += x > 0 ? 0.18 : -0.18;
  }

  // Shadow line tucked beneath the lower bezel.
  const shadowY = screenCenterY - screenHeight / 2 - 0.092;
  const shadow = b.rod(
    [-0.285, shadowY, screenZ(shadowY, 0.072)],
    [0.285, shadowY, screenZ(shadowY, 0.072)],
    0.006,
    {
      color: INK,
      bone: body,
      name: "screenShadowLine",
      group: "screenHousing",
    },
  );

  // --- Synthwave screen image ------------------------------------------------

  // Striped setting sun, centered above the horizon.
  const sunY = 1.485;
  const sunBars: Array<[number, number, string]> = [
    [0.240, 0.022, RED],
    [0.215, 0.020, RED],
    [0.190, 0.019, ORANGE],
    [0.162, 0.018, ORANGE],
    [0.132, 0.018, YELLOW],
    [0.100, 0.017, YELLOW],
  ];

  sunBars.forEach(([width, height, color], i) => {
    const y = sunY - i * 0.021;
    glowPart([width, height], 0, y, color, `sunBar${i}`, 0.012);
  });

  // Two dark cuts in the lowest sun stripe produce the classic scanline silhouette.
  const lowestY = sunY - (sunBars.length - 1) * 0.021;
  for (const x of [-0.040, 0.040]) {
    screenPart([0.026, 0.019], x, lowestY, DARK, `sunCut${x}`, 0.018);
  }

  // Horizon line and a second subtle horizon accent.
  glowPart([0.455, 0.006], 0, 1.397, CYAN, "horizonLine", 0.013);
  glowPart([0.405, 0.004], 0, 1.378, PURPLE, "horizonAccent", 0.013);

  // Perspective fan lines converge toward the center of the horizon.
  const vanishX = 0;
  const vanishY = 1.397;
  const vanishZ = screenZ(vanishY, 0.014);
  const fanBottomY = 1.235;
  const fanBottomZ = screenZ(fanBottomY, 0.014);

  for (let i = 0; i < 7; i++) {
    const x = -0.235 + i * 0.078;
    const line = b.rod(
      [x, fanBottomY, fanBottomZ],
      [vanishX, vanishY, vanishZ],
      0.0033,
      {
        color: CYAN,
        bone: body,
        name: `perspectiveFan${i}`,
        group: "screenHousing",
      },
    );
    glow(line, 1.8);
  }

  // Horizontal grid bars widen toward the bottom.
  const gridRows: Array<[number, number]> = [
    [1.355, 0.245],
    [1.319, 0.285],
    [1.281, 0.335],
    [1.244, 0.405],
  ];

  gridRows.forEach(([y, width], i) => {
    const part = glowPart([width, 0.004], 0, y, CYAN, `gridRow${i}`, 0.015);
    part.mesh.scale.x = 1;
  });

  // Thin magenta scanline just below the sun.
  glowPart([0.245, 0.003], 0, 1.425, PINK, "sunScanline", 0.014);

  // A handful of tiny screen pixels make the CRT feel active without becoming noisy.
  const pixels: Array<[number, number, string]> = [
    [-0.225, 1.353, PURPLE],
    [0.208, 1.334, PINK],
    [-0.178, 1.287, CYAN],
    [0.164, 1.257, PURPLE],
    [-0.080, 1.224, CYAN],
    [0.095, 1.219, PINK],
  ];
  pixels.forEach(([x, y, color], i) => glowPart([0.012, 0.006], x, y, color, `screenPixel${i}`, 0.016));

  // A small pair of dark CRT reflection blocks at the upper corners.
  screenPart([0.045, 0.009], -0.205, 1.535, EDGE, "crtReflectionL", 0.017);
  screenPart([0.030, 0.009], 0.208, 1.526, EDGE, "crtReflectionR", 0.017);

  // Lower edge rails visually anchor the CRT to the apron and deck.
  box([0.59, 0.014, 0.014], [0, 1.109, 0.273], PURPLE, [screenTilt, 0, 0], "housingLowerPurpleRail");
  box([0.52, 0.010, 0.012], [0, 1.116, 0.280], CYAN, [screenTilt, 0, 0], "housingLowerCyanRail");

  // Small side-facing bolts add the characteristic molded arcade-machine hardware.
  for (const s of [-1, 1]) {
    const bolt = b.part(
      new THREE.CylinderGeometry(0.010, 0.010, 0.010, 8),
      CHROME,
      {
        bone: body,
        at: [s * 0.397, 1.535, 0.015],
        dir: [s, 0, 0],
        name: `cheekBolt${s}`,
        group: "screenHousing",
      },
    );
    bolt.mesh.rotation.z = s * 0.2;
  }

  // A thin cyan strip across the housing's lower side silhouette, aligned with the deck join.
  box([0.744, 0.012, 0.012], [0, 1.115, 0.240], CYAN, undefined, "housingDeckJoinTrim");
}
```

<!-- call: baseBody -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildBaseBody({ b, J, P, M }: Ctx) {
  const body = J.body;
  const C = P as Record<string, string>;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: body,
      name,
      group: "baseBody",
    });

  const cyl = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      bone: body,
      dir: [0, 0, 1],
      name,
      group: "baseBody",
    });

  const frontPanel = (
    size: [number, number],
    at: [number, number, number],
    color: string,
    name: string,
    depth = 0.012,
  ) => box([size[0], size[1], depth], at, color, name);

  // Main lower cabinet shell. The slightly faceted box keeps the silhouette crisp.
  box([0.72, 1.02, 0.90], [0, 0.51, 0.005], C.cabBody, "baseBodyShell");

  // Dark lower kick plinth and a recessed shadow line above it.
  frontPanel([0.68, 0.075], [0, 0.039, 0.458], C.ink, "kickPlinth", 0.018);
  frontPanel([0.65, 0.014], [0, 0.087, 0.459], C.cabEdge, "kickHighlight", 0.012);

  // A narrow violet lower front inset gives the otherwise broad slab some depth.
  frontPanel([0.58, 0.23], [0, 0.185, 0.459], C.panelDark, "lowerFrontInset", 0.009);

  // Coin door shadow recess and steel face.
  frontPanel([0.315, 0.335], [0, 0.385, 0.461], C.ink, "coinDoorRecess", 0.018);
  frontPanel([0.274, 0.294], [0, 0.385, 0.472], C.steel, "coinDoorSteel", 0.018);

  // Steel face shading strips.
  frontPanel([0.238, 0.012], [0, 0.526, 0.484], C.chrome, "coinDoorTopHighlight", 0.008);
  frontPanel([0.238, 0.012], [0, 0.244, 0.484], C.panelDark, "coinDoorBottomShadow", 0.008);
  frontPanel([0.012, 0.25], [-0.128, 0.385, 0.484], C.cabEdge, "coinDoorLeftShade", 0.008);
  frontPanel([0.012, 0.25], [0.128, 0.385, 0.484], C.chrome, "coinDoorRightHighlight", 0.008);

  // Neon-pink four-piece door frame, intentionally built as separate glowing-looking bars.
  frontPanel([0.305, 0.012], [0, 0.548, 0.493], C.neonPink, "coinTrimTop", 0.009);
  frontPanel([0.305, 0.012], [0, 0.222, 0.493], C.neonPink, "coinTrimBottom", 0.009);
  frontPanel([0.012, 0.315], [-0.151, 0.385, 0.493], C.neonPink, "coinTrimLeft", 0.009);
  frontPanel([0.012, 0.315], [0.151, 0.385, 0.493], C.neonPink, "coinTrimRight", 0.009);

  // Two coin slots: dark wells with bright chrome lips.
  for (const x of [-0.066, 0.066]) {
    frontPanel([0.058, 0.026], [x, 0.420, 0.487], C.ink, `coinSlotWell${x}`, 0.009);
    frontPanel([0.047, 0.010], [x, 0.424, 0.494], C.chrome, `coinSlotChrome${x}`, 0.008);
    frontPanel([0.030, 0.006], [x, 0.420, 0.499], C.panelDark, `coinSlotGap${x}`, 0.006);
  }

  // Lock cylinder, with a tiny violet key slot.
  cyl(0.019, 0.011, [0, 0.292, 0.494], C.chrome, "coinLock", 12);
  frontPanel([0.005, 0.020], [0, 0.292, 0.502], C.ink, "coinLockSlot", 0.006);

  // Small manufacturer badge above the door.
  frontPanel([0.215, 0.074], [0, 0.842, 0.462], C.ink, "makerBadgeShadow", 0.012);
  frontPanel([0.190, 0.052], [0, 0.845, 0.473], C.chrome, "makerBadge", 0.012);
  frontPanel([0.125, 0.010], [0, 0.854, 0.481], C.neonPurple, "makerBadgeLogo", 0.007);
  frontPanel([0.045, 0.008], [-0.060, 0.835, 0.481], C.ink, "makerBadgeMarkA", 0.007);
  frontPanel([0.030, 0.008], [0.015, 0.835, 0.481], C.ink, "makerBadgeMarkB", 0.007);
  frontPanel([0.035, 0.008], [0.070, 0.835, 0.481], C.ink, "makerBadgeMarkC", 0.007);

  // Side sunset artwork. Proud, chunky panels leave a visible violet corner-post margin.
  const sideBands: Array<[number, number, string, string]> = [
    [0.585, 0.085, C.neonPink, "pink"],
    [0.680, 0.090, C.sunRed, "red"],
    [0.780, 0.090, C.sunOrange, "orange"],
    [0.880, 0.082, C.sunYellow, "yellow"],
  ];

  for (const side of [-1, 1]) {
    for (const [y, h, color, tag] of sideBands) {
      box(
        [0.014, h, 0.70],
        [side * 0.367, y, 0.005],
        color,
        `sideSun${tag}${side}`,
      );
      // A darker lower edge on each band makes the sunset stack read as layered plates.
      box(
        [0.017, 0.009, 0.69],
        [side * 0.375, y - h / 2 + 0.006, 0.005],
        C.sunRed,
        `sideSunShadow${tag}${side}`,
      );
    }

    // Two precise cyan pinstripes beneath the sunset.
    for (const [i, y] of [0.30, 0.345].entries()) {
      box(
        [0.016, 0.012, 0.69],
        [side * 0.369, y, 0.005],
        C.neonCyan,
        `sidePinstripe${i}${side}`,
      );
    }

    // Small purple terminal caps keep the bands from visually running into the posts.
    box([0.020, 0.43, 0.028], [side * 0.377, 0.735, 0.005], C.cabEdge, `sidePostAccent${side}`);
  }

  // A slim violet front corner treatment on each side of the cabinet.
  for (const side of [-1, 1]) {
    box([0.018, 0.96, 0.018], [side * 0.369, 0.505, 0.451], C.cabEdge, `frontCornerPost${side}`);
    box([0.018, 0.96, 0.018], [side * 0.369, 0.505, -0.441], C.cabEdge, `backCornerPost${side}`);
  }

  // Rear closing skin for the lower cabinet, tucked behind the later rear-panel assembly.
  box([0.70, 0.985, 0.018], [0, 0.515, -0.451], C.cabSide, "lowerRearSkin");

  // Small rear edge highlights visible around the future rear panel.
  box([0.70, 0.014, 0.022], [0, 0.030, -0.463], C.cabEdge, "rearLowerEdge");
  box([0.70, 0.014, 0.022], [0, 1.008, -0.463], C.cabEdge, "rearUpperEdge");

  // Top perimeter trim: front, rear, and side rails meet the bodyTop mount cleanly.
  box([0.72, 0.018, 0.025], [0, 1.027, 0.442], C.cabEdge, "topTrimFront");
  box([0.72, 0.018, 0.025], [0, 1.027, -0.437], C.cabEdge, "topTrimBack");
  box([0.025, 0.018, 0.84], [-0.348, 1.027, 0.002], C.cabEdge, "topTrimLeft");
  box([0.025, 0.018, 0.84], [0.348, 1.027, 0.002], C.cabEdge, "topTrimRight");

  // Four tiny top-corner neon accents are visible between the deck and screen modules.
  for (const side of [-1, 1]) {
    box([0.012, 0.020, 0.090], [side * 0.335, 1.035, 0.355], C.neonPurple, `topCornerGlow${side}`);
  }

  // A few small rivet heads sell the cabinet as a real 1980s machine.
  for (const side of [-1, 1]) {
    for (const y of [0.12, 0.94]) {
      cyl(0.008, 0.008, [side * 0.351, y, 0.463], C.chrome, `frontRivet${side}${y}`, 8);
    }
  }
}
```

<!-- call: rearPanel -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRearPanel({ b, J, P }: Ctx) {
  const bone = J.cabinet ?? J.body;
  const rearZ = -0.474;
  const faceZ = rearZ - 0.004;

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    depth = 0,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      group: "rearPanel",
      bone,
      at: [at[0], at[1], at[2] + depth],
    });

  const rearBar = (
    name: string,
    w: number,
    h: number,
    x: number,
    y: number,
    color: string,
    z = faceZ,
  ) => box(name, [w, h, 0.012], [x, y, z], color);

  const trimFrame = (
    prefix: string,
    x: number,
    y: number,
    w: number,
    h: number,
    thickness: number,
    color: string,
  ) => {
    rearBar(`${prefix}Top`, w, thickness, x, y + h / 2 - thickness / 2, color);
    rearBar(`${prefix}Bottom`, w, thickness, x, y - h / 2 + thickness / 2, color);
    rearBar(`${prefix}Left`, thickness, h, x - w / 2 + thickness / 2, y, color);
    rearBar(`${prefix}Right`, thickness, h, x + w / 2 - thickness / 2, y, color);
  };

  // Main rear skin, deliberately slightly proud of the cabinet shells.
  box("rearSkin", [0.72, 1.58, 0.07], [0, 0.81, -0.435], P.cabSide);

  // Darkened perimeter seam makes the rear panel read as a separate service skin.
  rearBar("rearTopSeam", 0.68, 0.012, 0, 1.575, P.ink);
  rearBar("rearBottomSeam", 0.68, 0.012, 0, 0.045, P.ink);
  rearBar("rearLeftSeam", 0.012, 1.52, -0.345, 0.81, P.ink);
  rearBar("rearRightSeam", 0.012, 1.52, 0.345, 0.81, P.ink);

  // Strong synthwave bands across the rear.
  const purpleStripe = rearBar("neonPurpleRearBand", 0.66, 0.052, 0, 1.44, P.neonPurple);
  const cyanStripe = rearBar("neonCyanRearBand", 0.66, 0.018, 0, 0.55, P.neonCyan);
  glow(purpleStripe, 1.25);
  glow(cyanStripe, 1.4);

  // Tiny dark separators sharpen the bright bands.
  rearBar("purpleBandShadow", 0.66, 0.008, 0, 1.404, P.ink);
  rearBar("cyanBandShadow", 0.66, 0.006, 0, 0.534, P.ink);

  // Upper vent recess and its raised frame.
  box("ventRecess", [0.36, 0.30, 0.012], [0, 1.30, faceZ + 0.001], P.panelDark);
  trimFrame("ventFrame", 0, 1.30, 0.39, 0.33, 0.014, P.cabEdge);

  // Six chunky chrome ventilation louvers, each tilted very slightly for a manufactured look.
  for (let i = 0; i < 6; i++) {
    const y = 1.185 + i * 0.046;
    const slat = b.part(
      new THREE.BoxGeometry(0.31, 0.018, 0.018),
      P.chrome,
      {
        name: `ventLouvre${i + 1}`,
        group: "rearPanel",
        bone,
        at: [0, y, faceZ - 0.014],
        rotation: [-5, 0, 0],
      },
    );
    // Dark end caps make each louvre visibly inset into the grille.
    box(`ventLouvre${i + 1}Shadow`, [0.335, 0.006, 0.006], [0, y - 0.014, faceZ - 0.023], P.ink);
    void slat;
  }

  // Four small corner fasteners on the vent frame.
  for (const x of [-0.168, 0.168]) {
    for (const y of [1.155, 1.445]) {
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8), P.steel, {
        name: `ventBolt${x > 0 ? "R" : "L"}${y > 1.3 ? "T" : "B"}`,
        group: "rearPanel",
        bone,
        at: [x, y, faceZ - 0.026],
        dir: [0, 0, -1],
      });
    }
  }

  // Service hatch in the lower centre.
  box("serviceHatch", [0.30, 0.22, 0.014], [0, 0.62, faceZ + 0.003], P.cabBody);
  trimFrame("serviceHatchNeonFrame", 0, 0.62, 0.33, 0.25, 0.012, P.neonPink);

  // Hatch face plate and inset horizontal seam.
  rearBar("serviceHatchInset", 0.255, 0.145, 0, 0.62, P.panelDark, faceZ - 0.012);
  rearBar("serviceHatchSeam", 0.22, 0.006, 0, 0.62, P.cabEdge, faceZ - 0.022);

  for (const x of [-0.135, 0.135]) {
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.009, 8), P.chrome, {
      name: `hatchScrew${x < 0 ? "L" : "R"}`,
      group: "rearPanel",
      bone,
      at: [x, 0.62, faceZ - 0.028],
      dir: [0, 0, -1],
    });
  }

  // Small horizontal service-hatch handle.
  box("serviceHandleMountL", [0.018, 0.026, 0.012], [-0.055, 0.675, faceZ - 0.03], P.steel);
  box("serviceHandleMountR", [0.018, 0.026, 0.012], [0.055, 0.675, faceZ - 0.03], P.steel);
  box("serviceHandle", [0.095, 0.014, 0.018], [0, 0.675, faceZ - 0.038], P.chrome);

  // Power-switch plate on the right lower-middle rear.
  box("powerPlate", [0.16, 0.12, 0.014], [0.18, 0.95, faceZ + 0.003], P.steel);
  trimFrame("powerPlateDarkFrame", 0.18, 0.95, 0.145, 0.10, 0.008, P.ink);

  // Rocker switch, with a slight forward-facing bevel made from layered boxes.
  box("powerRockerBed", [0.070, 0.042, 0.012], [0.18, 0.958, faceZ - 0.022], P.panelDark);
  b.part(new THREE.BoxGeometry(0.056, 0.030, 0.018), P.chrome, {
    name: "powerRocker",
    group: "rearPanel",
    bone,
    at: [0.18, 0.958, faceZ - 0.033],
    rotation: [0, 0, -8],
  });
  box("powerOnMark", [0.008, 0.020, 0.006], [0.205, 0.958, faceZ - 0.045], P.neonCyan);

  // Red indicator lamp beside the rocker.
  const indicator = b.part(new THREE.SphereGeometry(0.014, 8, 5), P.sunRed, {
    name: "powerIndicator",
    group: "rearPanel",
    bone,
    at: [0.285, 0.95, faceZ - 0.026],
  });
  glow(indicator, 2.2);
  b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.008, 10), P.ink, {
    name: "powerIndicatorBezel",
    group: "rearPanel",
    bone,
    at: [0.285, 0.95, faceZ - 0.018],
    dir: [0, 0, -1],
  });

  // Cable exit grommet low on the left: concentric black ring and violet inner hole.
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.012, 12), P.ink, {
    name: "cableGrommet",
    group: "rearPanel",
    bone,
    at: [-0.18, 0.35, faceZ - 0.018],
    dir: [0, 0, -1],
  });
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.014, 10), P.panelDark, {
    name: "cableGrommetInner",
    group: "rearPanel",
    bone,
    at: [-0.18, 0.35, faceZ - 0.026],
    dir: [0, 0, -1],
  });
  b.part(new THREE.TorusGeometry(0.036, 0.006, 5, 12), P.neonPurple, {
    name: "cableGrommetAccent",
    group: "rearPanel",
    bone,
    at: [-0.18, 0.35, faceZ - 0.034],
    rotation: [90, 0, 0],
  });

  // A short dangling cable stub gives the otherwise flat rear a clear arcade-machine silhouette.
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.075, 7), P.ink, {
    name: "cableStub",
    group: "rearPanel",
    bone,
    at: [-0.18, 0.305, faceZ - 0.026],
    rotation: [18, 0, 0],
  });

  // Three tiny labels beneath the vent, represented as geometric bars rather than texture.
  rearBar("rearLabelBar1", 0.095, 0.006, -0.16, 1.015, P.chrome);
  rearBar("rearLabelBar2", 0.060, 0.006, -0.015, 1.015, P.neonPink);
  rearBar("rearLabelBar3", 0.038, 0.006, 0.085, 1.015, P.neonCyan);

  // Edge cap on the rear's top and bottom reinforces the cabinet's block-built construction.
  rearBar("rearTopNeonEdge", 0.68, 0.012, 0, 1.575, P.neonPink, faceZ - 0.018);
  rearBar("rearBottomEdge", 0.66, 0.010, 0, 0.055, P.cabEdge, faceZ - 0.016);
}
```

<!-- call: marquee -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildMarquee({ b, J, P, M }: Ctx) {
  const bone = J.body ?? J.cabinet;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      rotation,
      name,
      group: "marquee",
    });

  const frontBar = (
    size: [number, number],
    at: [number, number],
    color: string,
    name: string,
    rotation = [0, 0, 0] as [number, number, number],
  ) =>
    box([size[0], size[1], 0.008], [at[0], at[1], 0.264], color, name, rotation);

  // The heavy violet lightbox, overlapping the housing by two centimetres at its base.
  box([0.76, 0.22, 0.71], [0, 1.69, -0.095], P.cabBody, "marqueeBody");

  // Slightly lighter side cheeks make the crown readable in three-quarter view.
  box([0.018, 0.19, 0.67], [0.371, 1.69, -0.095], P.cabSide, "marqueeCheekL");
  box([0.018, 0.19, 0.67], [-0.371, 1.69, -0.095], P.cabSide, "marqueeCheekR");

  // Recessed warm light panel.
  const lightPanel = box(
    [0.64, 0.14, 0.008],
    [0, 1.70, 0.263],
    P.marqueeGlow,
    "marqueeBacklight",
  );
  glow(lightPanel, 1.35);

  // Chunky chrome bezel around the lightbox window.
  box([0.675, 0.018, 0.014], [0, 1.779, 0.266], P.chrome, "bezelTop");
  box([0.675, 0.018, 0.014], [0, 1.621, 0.266], P.chrome, "bezelBottom");
  box([0.018, 0.14, 0.014], [-0.338, 1.70, 0.266], P.chrome, "bezelLeft");
  box([0.018, 0.14, 0.014], [0.338, 1.70, 0.266], P.chrome, "bezelRight");

  // Deep inset shadow behind the lit artwork.
  box([0.606, 0.126, 0.004], [0, 1.70, 0.269], P.ink, "marqueeInkInset");

  // Full-width neon crown and a hard-edged top cap. Both stop exactly below y=1.8.
  box([0.735, 0.012, 0.018], [0, 1.787, 0.245], P.neonPink, "topNeonTrim");
  box([0.735, 0.009, 0.026], [0, 1.796, -0.08], P.cabEdge, "topCap");

  // Lower cyan accent tucked into the bezel.
  box([0.58, 0.006, 0.009], [0, 1.628, 0.274], P.neonCyan, "lowerCyanHairline");

  // --- Left-side synthwave sun: stacked rectangular bars form a half-disc. ---
  const sunBars: Array<[[number, number], string]> = [
    [[0.142, 0.016], P.neonPink],
    [[0.158, 0.017], P.sunRed],
    [[0.174, 0.018], P.sunOrange],
    [[0.188, 0.019], P.sunYellow],
  ];
  const sunY = [1.735, 1.716, 1.697, 1.678];
  for (let i = 0; i < sunBars.length; i++) {
    const [dims, color] = sunBars[i];
    const bar = frontBar(dims, [-0.195, sunY[i]], color, `sunBar${i}`);
    glow(bar, 1.2);
  }

  // Dark horizon cuts make the sun read as a retro striped disc.
  frontBar([0.185, 0.006], [-0.195, 1.687], P.ink, "sunCutLower");
  frontBar([0.165, 0.005], [-0.195, 1.706], P.ink, "sunCutUpper");

  // Two crisp cyan horizon lines under the sun.
  const horizonA = frontBar([0.205, 0.005], [-0.195, 1.663], P.neonCyan, "sunHorizonA");
  const horizonB = frontBar([0.205, 0.004], [-0.195, 1.654], P.neonCyan, "sunHorizonB");
  glow(horizonA, 1.3);
  glow(horizonB, 1.3);

  // --- Abstract "NEON" logo on the right: angular, block-built letterforms. ---
  // N, with a dark offset underlay for a printed arcade-marquee shadow.
  frontBar([0.018, 0.084], [0.010, 1.704], P.ink, "titleNShadowL", [0, 0, 0]);
  frontBar([0.018, 0.084], [0.092, 1.704], P.ink, "titleNShadowR", [0, 0, 0]);
  frontBar([0.115, 0.014], [0.051, 1.704], P.ink, "titleNShadowDiag", [0, 0, -34]);

  frontBar([0.016, 0.084], [0.004, 1.710], P.neonPurple, "titleNL");
  frontBar([0.016, 0.084], [0.086, 1.710], P.neonPurple, "titleNR");
  frontBar([0.112, 0.012], [0.045, 1.710], P.neonPink, "titleNDiag", [0, 0, -34]);

  // A triangular A-like glyph.
  frontBar([0.016, 0.092], [0.145, 1.705], P.ink, "titleALeftShadow", [0, 0, -22]);
  frontBar([0.016, 0.092], [0.205, 1.705], P.ink, "titleARightShadow", [0, 0, 22]);
  frontBar([0.072, 0.013], [0.175, 1.696], P.ink, "titleABarShadow");

  frontBar([0.014, 0.09], [0.139, 1.711], P.neonPurple, "titleALeft", [0, 0, -22]);
  frontBar([0.014, 0.09], [0.199, 1.711], P.neonPurple, "titleARight", [0, 0, 22]);
  frontBar([0.070, 0.011], [0.169, 1.701], P.neonCyan, "titleABar");

  // Tiny cyan separator pixels and a pink terminal dash give the title a lit-sign finish.
  const dot1 = frontBar([0.018, 0.008], [0.252, 1.744], P.neonCyan, "titleDotTop");
  const dot2 = frontBar([0.026, 0.007], [0.255, 1.660], P.neonPink, "titleDotBottom");
  glow(dot1, 1.3);
  glow(dot2, 1.25);

  // Diagonal cyan side stripes, mirrored on both cheeks. They remain inside the marquee silhouette.
  box([0.010, 0.017, 0.19], [0.382, 1.70, -0.085], P.neonCyan, "sideStripeL", [25, 0, 0]);
  box([0.010, 0.017, 0.19], [-0.382, 1.70, -0.085], P.neonCyan, "sideStripeR", [25, 0, 0]);

  // Small violet end-cap blocks visually anchor the side stripes to the bezel.
  box([0.012, 0.035, 0.025], [0.382, 1.775, 0.245], P.neonPurple, "sideCapTopL");
  box([0.012, 0.035, 0.025], [-0.382, 1.775, 0.245], P.neonPurple, "sideCapTopR");

  // Rear closing skin, hidden from the front but important around the top silhouette.
  box([0.74, 0.19, 0.018], [0, 1.69, -0.442], P.cabBody, "marqueeRearClose");
}
```

<!-- call: controlDeck -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildControlDeck({ b, J, P, M }: Ctx) {
  const body = J.body;
  const joyL = J.joy1;
  const joyR = J.joy2;

  const angle = 31.25;
  const slopeNormal: [number, number, number] = [0, 0.854, 0.519];
  const slopeDir: [number, number, number] = [0, -0.519, 0.854];

  const CAB = P.cabBody;
  const EDGE = P.cabEdge;
  const INK = P.ink;
  const DARK = P.panelDark;
  const CYAN = P.neonCyan;
  const PINK = P.neonPink;
  const PURPLE = P.neonPurple;
  const CHROME = P.chrome;
  const RED = P.btnRed;
  const YELLOW = P.btnYellow;
  const BLUE = P.btnBlue;
  const GREEN = P.btnGreen;
  const BALL = P.stickBall;

  const topY = (z: number) => 1.22 - ((z - 0.18) / 0.28) * 0.17;
  const deckPoint = (x: number, z: number, lift = 0) =>
    new THREE.Vector3(x, topY(z) + lift, z);

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: body,
      at,
      ...options,
    });

  const slopeBox = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    extra: Record<string, unknown> = {},
  ) =>
    box(size, color, at, {
      rotation: [angle, 0, 0],
      ...extra,
    });

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    extra: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, { color, bone: body, ...extra });

  const normalAt = (x: number, z: number, lift = 0.012) =>
    deckPoint(x, z, lift);

  // Main sloped control deck, with a slightly heavier underside so its front edge
  // meets the cabinet cleanly.
  slopeBox([0.8, 0.055, 0.34], CAB, [0, 1.135, 0.32], {
    name: "controlDeck.surface",
  });

  slopeBox([0.82, 0.045, 0.31], INK, [0, 1.078, 0.395], {
    name: "controlDeck.underside",
  });

  // Chunky end cheeks close the wedge and make the deck silhouette read from the side.
  for (const s of [-1, 1]) {
    slopeBox([0.038, 0.19, 0.34], EDGE, [s * 0.392, 1.135, 0.32], {
      name: `controlDeck.cheek${s > 0 ? "L" : "R"}`,
    });
    slopeBox([0.018, 0.16, 0.28], PURPLE, [s * 0.414, 1.135, 0.32], {
      name: `controlDeck.cheekInset${s > 0 ? "L" : "R"}`,
    });
  }

  // Front skirt below the overhanging lip.
  box([0.78, 0.035, 0.035], CAB, [0, 1.035, 0.452], {
    name: "controlDeck.frontSkirt",
  });
  box([0.74, 0.012, 0.012], INK, [0, 1.015, 0.46], {
    name: "controlDeck.skirtShadow",
  });

  // Cyan front lip and side edge trims.
  rod([-0.39, 1.052, 0.482], [0.39, 1.052, 0.482], 0.006, CYAN, {
    name: "controlDeck.cyanFrontTrim",
  });
  rod([-0.395, 1.223, 0.17], [-0.395, 1.052, 0.482], 0.005, CYAN, {
    name: "controlDeck.cyanSideTrimR",
  });
  rod([0.395, 1.223, 0.17], [0.395, 1.052, 0.482], 0.005, CYAN, {
    name: "controlDeck.cyanSideTrimL",
  });

  // Pink seam at the rear edge where the deck meets the CRT housing.
  rod([-0.382, 1.224, 0.174], [0.382, 1.224, 0.174], 0.006, PINK, {
    name: "controlDeck.pinkRearTrim",
  });
  rod([-0.36, 1.229, 0.18], [0.36, 1.229, 0.18], 0.003, EDGE, {
    name: "controlDeck.rearHighlight",
  });

  // Small violet control-panel artwork insert between the two player stations.
  const artAt = deckPoint(0, 0.275, 0.014);
  slopeBox([0.145, 0.014, 0.09], PURPLE, artAt, {
    name: "controlDeck.artwork",
  });

  // Artwork border.
  const artLift = 0.026;
  const artY = (z: number) => topY(z) + artLift;
  for (const x of [-0.072, 0.072]) {
    rod(
      [x, artY(0.23), 0.23],
      [x, artY(0.32), 0.32],
      0.0022,
      CYAN,
      { name: "controlDeck.artGridSide" },
    );
  }
  for (const z of [0.238, 0.26, 0.282, 0.304, 0.322]) {
    rod([-0.067, artY(z), z], [0.067, artY(z), z], 0.002, CYAN, {
      name: "controlDeck.artGridLine",
    });
  }
  rod([-0.068, artY(0.286), 0.286], [0.068, artY(0.286), 0.286], 0.003, PINK, {
    name: "controlDeck.artHorizon",
  });

  const artSun = b.part(
    new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12),
    PINK,
    {
      bone: body,
      at: [0, artY(0.302), 0.302],
      dir: slopeNormal,
      name: "controlDeck.artSun",
    },
  );
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.007, 10), YELLOW, {
    bone: body,
    at: [0, artY(0.303) + 0.002, 0.303],
    dir: slopeNormal,
    name: "controlDeck.artSunCore",
  });

  // Two recessed button plates. They are raised just enough to be readable but
  // remain seated on the sloping deck.
  const stations = [
    { x: 0.22, side: "L" },
    { x: -0.22, side: "R" },
  ];

  for (const station of stations) {
    const x = station.x;
    const plateZ = 0.392;
    const plate = slopeBox([0.22, 0.014, 0.145], DARK, deckPoint(x, plateZ, 0.014), {
      name: `controlDeck.buttonPlate${station.side}`,
    });

    // A narrow chrome rim around each plate.
    rod(
      [x - 0.105, topY(0.325) + 0.027, 0.325],
      [x + 0.105, topY(0.325) + 0.027, 0.325],
      0.0025,
      CHROME,
      { name: `controlDeck.plateRimFront${station.side}` },
    );
    rod(
      [x - 0.105, topY(0.455) + 0.027, 0.455],
      [x + 0.105, topY(0.455) + 0.027, 0.455],
      0.0025,
      CHROME,
      { name: `controlDeck.plateRimBack${station.side}` },
    );

    // Four colored buttons in a fan, all normal to the deck.
    const buttonPositions = [
      [-0.062, 0.405, RED],
      [-0.02, 0.432, YELLOW],
      [0.024, 0.432, BLUE],
      [0.066, 0.405, GREEN],
    ] as const;

    for (let i = 0; i < buttonPositions.length; i++) {
      const [dx, z, color] = buttonPositions[i];
      const p = deckPoint(x + dx, z, 0.031);
      b.part(new THREE.CylinderGeometry(0.017, 0.019, 0.014, 10), color, {
        bone: body,
        at: p,
        dir: slopeNormal,
        name: `controlDeck.button${station.side}${i + 1}`,
      });
      b.part(new THREE.CylinderGeometry(0.009, 0.011, 0.003, 10), CHROME, {
        bone: body,
        at: p.clone().add(new THREE.Vector3(0, 0.006, 0)),
        dir: slopeNormal,
        name: `controlDeck.buttonHighlight${station.side}${i + 1}`,
      });
    }
  }

  // Joystick wells and articulated sticks. The two supplied joints are used as
  // the rigid owners of all shaft and ball geometry.
  const joys = [
    { joint: joyL, x: 0.22, label: "L" },
    { joint: joyR, x: -0.22, label: "R" },
  ];

  for (const item of joys) {
    const x = item.x;
    const root = new THREE.Vector3(x, 1.12, 0.34);
    const well = b.part(
      new THREE.TorusGeometry(0.043, 0.007, 6, 12),
      DARK,
      {
        bone: body,
        at: root,
        dir: slopeNormal,
        name: `controlDeck.joystickWell${item.label}`,
      },
    );

    const shaftTop = root.clone().add(new THREE.Vector3(0, 0.088, 0.018));
    b.rod(root, shaftTop, 0.010, {
      color: CHROME,
      bone: item.joint,
      name: `controlDeck.joystickShaft${item.label}`,
    });

    b.part(new THREE.SphereGeometry(0.035, 10, 7), BALL, {
      bone: item.joint,
      at: shaftTop,
      name: `controlDeck.joystickBall${item.label}`,
    });

    b.part(new THREE.SphereGeometry(0.012, 8, 5), PINK, {
      bone: item.joint,
      at: shaftTop.clone().add(new THREE.Vector3(0, 0.027, 0.008)),
      name: `controlDeck.joystickCap${item.label}`,
    });
  }

  // Tiny START/SELECT-style indicator bars in the central rear strip.
  slopeBox([0.045, 0.008, 0.018], CYAN, deckPoint(-0.075, 0.205, 0.022), {
    name: "controlDeck.startLabel",
  });
  slopeBox([0.045, 0.008, 0.018], PINK, deckPoint(0.075, 0.205, 0.022), {
    name: "controlDeck.selectLabel",
  });
  slopeBox([0.018, 0.009, 0.028], YELLOW, deckPoint(-0.075, 0.205, 0.028), {
    name: "controlDeck.startLamp",
  });
  slopeBox([0.018, 0.009, 0.028], CYAN, deckPoint(0.075, 0.205, 0.028), {
    name: "controlDeck.selectLamp",
  });

  // Corner fasteners on the cheek faces.
  for (const s of [-1, 1]) {
    for (const z of [0.22, 0.43]) {
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), CHROME, {
        bone: body,
        at: [s * 0.414, topY(z) + 0.01, z],
        dir: [s, 0, 0],
        name: "controlDeck.cheekFastener",
      });
    }
  }

  return body;
}
```