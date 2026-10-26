<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const BLACK = "#090817";
export const INK = "#160d2d";
export const NAVY = "#121441";
export const PURPLE = "#30205f";
export const VIOLET = "#6930a8";
export const MAGENTA = "#ff237f";
export const PINK = "#ff62b5";
export const CYAN = "#16e6ff";
export const BLUE = "#2679ff";
export const LILAC = "#a987ff";
export const SILVER = "#9da8cf";
export const CREAM = "#f6e7ce";
export const GOLD = "#ffbd42";
export const RED = "#ff315c";

export const meta = {
  name: "1980s Synthwave Arcade Cabinet",
  description:
    "A stylized low-poly 1980s upright arcade cabinet with a bold wedge silhouette, glowing synthwave trim, marquee, CRT screen, control deck, coin door, vents, feet, and a carefully staged surface for neon detail work.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabinetTop",
    what: "Add a slim synthwave light bar across the cabinet roof: a dark violet housing, six chunky lamps alternating CYAN and MAGENTA, and two small angled brackets. Keep it blocky and toy-like.",
    at: [0, 1.96, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.72, 0.16, 0.22],
  },
  {
    id: "marqueeLogo",
    kind: "add",
    part: "marqueeFace",
    what: "Build a raised 1980s arcade title emblem on the marquee: layered hot-pink and cyan beveled lettering or a bold angular starburst badge, with a thin dark outline and two tiny corner bolts.",
    at: [0, 1.78, 0.425],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.14, 0.035],
  },
  {
    id: "joystickAssembly",
    kind: "add",
    part: "controlPanel",
    what: "Add the control hardware on the deck: one tall black joystick with a MAGENTA ball, a cyan collar, a square mounting plate, and six large alternating CYAN and MAGENTA arcade buttons. Leave a readable gap around every control.",
    at: [0.02, 0.88, 0.56],
    normal: [0, 0.98, 0.18],
    bone: null,
    room: [0.66, 0.18, 0.3],
  },
  {
    id: "speakerGrille",
    kind: "add",
    part: "speakerPanel",
    what: "Add a centered speaker grille beneath the marquee: a dark inset rectangle, two rows of evenly spaced short slits, cyan end caps, and four small silver screws.",
    at: [0, 1.635, 0.418],
    normal: [0, 0, 1],
    bone: null,
    room: [0.58, 0.12, 0.035],
  },
  {
    id: "coinDoorBadge",
    kind: "add",
    part: "coinDoor",
    what: "Add a coin-door badge and fittings: a small gold octagonal token emblem, two cyan coin return slots, a magenta service light, and four silver corner rivets.",
    at: [0, 0.36, 0.442],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.28, 0.035],
  },
  {
    id: "screenScanlines",
    kind: "add",
    part: "screenFace",
    what: "Add a recessed CRT screen treatment: a thin violet inner rim, three subtle cyan scanline strips, and a small magenta reflection diamond in the upper corner. Keep the center of the screen mostly clear.",
    at: [0, 1.31, 0.39],
    normal: [0, 0.18, 0.98],
    bone: null,
    room: [0.56, 0.37, 0.025],
  },
  {
    id: "sideNeonRails",
    kind: "add",
    part: "sidePanelL",
    what: "Add a synthwave side-panel rail on the visible left side: stepped MAGENTA and CYAN neon strips following the cabinet's front edge, with three dark mounting blocks. Keep the large center of the side panel open.",
    at: [0.47, 1.02, 0.32],
    normal: [1, 0, 0],
    bone: null,
    room: [0.035, 1.35, 0.16],
  },
  {
    id: "lowerVent",
    kind: "add",
    part: "lowerVentPanel",
    what: "Add a low front ventilation grille: a black inset, seven short cyan slats, two magenta end brackets, and a tiny gold power indicator.",
    at: [0, 0.68, 0.421],
    normal: [0, 0, 1],
    bone: null,
    room: [0.55, 0.16, 0.035],
  },
  {
    id: "rearCable",
    kind: "add",
    part: "rearPanel",
    what: "Add a short coiled power cable emerging from the rear lower panel, using BLACK, VIOLET, and CYAN bands, plus a small rectangular strain-relief block. Keep it close to the cabinet footprint.",
    at: [0, 0.28, -0.455],
    normal: [0, 0, -1],
    bone: null,
    room: [0.22, 0.3, 0.18],
  },
  {
    id: "marqueeTexture",
    kind: "texture",
    part: "marqueeFace",
    what: "Paint the marquee face as a saturated synthwave gradient from deep PURPLE at the bottom to MAGENTA and CYAN at the top, with a subtle angular grid and starburst highlights. Preserve a clean central area for the raised title emblem.",
  },
  {
    id: "screenTexture",
    kind: "texture",
    part: "screenFace",
    what: "Paint the CRT screen with a dark NAVY-to-PURPLE glass field, a soft CYAN horizon glow, sparse MAGENTA pixel sparks, and restrained horizontal scanlines. Keep it readable as a blank screen behind the added reflection.",
  },
  {
    id: "sidePanelTextureL",
    kind: "texture",
    part: "sidePanelL",
    what: "Paint the left side panel with a bold 1980s synthwave composition: BLACK and NAVY base, a large hot-pink sunset disk low toward the rear, cyan perspective grid lines, and a few angular violet speed streaks. Keep the outer neon rail unobscured.",
  },
  {
    id: "sidePanelTextureR",
    kind: "texture",
    part: "sidePanelR",
    what: "Paint the right side panel to match the left: BLACK and NAVY base, MAGENTA sunset disk, CYAN horizon grid, and VIOLET geometric streaks, mirrored in spirit but not mechanically copied.",
  },
  {
    id: "controlPanelTexture",
    kind: "texture",
    part: "controlPanel",
    what: "Paint the control deck with a dark PURPLE surface, a cyan perimeter pinstripe, small magenta directional arrows, and a sparse checker motif around the controls. Do not cover the joystick and button clearances.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

type V3 = readonly [number, number, number];
type Rot = readonly [number, number, number];

function box(
  b: Builder,
  name: string,
  size: V3,
  at: V3,
  color: string,
  rotation?: Rot,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    rotation,
    name,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: V3,
  color: string,
  dir?: V3,
  segments = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    dir,
    name,
    flat: true,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: V3,
  color: string,
  segments = 8,
  rings = 5,
) {
  return b.part(new THREE.SphereGeometry(radius, segments, rings), color, {
    at,
    name,
    flat: true,
  });
}

function rod(
  b: Builder,
  name: string,
  a: V3,
  c: V3,
  radius: number,
  color: string,
) {
  return b.rod(a, c, radius, {
    color,
    name,
    sides: 6,
    caps: "round",
  });
}

function buildCabinet(b: Builder) {
  const sideProfile: [number, number][] = [
    [-0.48, 0.025],
    [0.34, 0.025],
    [0.385, 0.63],
    [0.535, 0.735],
    [0.515, 0.875],
    [0.31, 1.005],
    [0.275, 1.57],
    [0.425, 1.705],
    [0.405, 1.885],
    [-0.405, 1.885],
    [-0.495, 1.765],
  ];

  b.extrude(sideProfile, {
    at: [0.435, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    smoothing: 0,
    color: PURPLE,
    name: "sidePanelL",
  });

  b.extrude(sideProfile, {
    at: [-0.435, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    smoothing: 0,
    color: PURPLE,
    name: "sidePanelR",
  });

  box(b, "cabinetCore", [0.82, 1.76, 0.78], [0, 0.905, -0.03], INK);
  box(b, "cabinetLowerCore", [0.84, 0.68, 0.8], [0, 0.37, -0.02], BLACK);
  box(b, "cabinetUpperCore", [0.82, 0.68, 0.76], [0, 1.47, -0.015], NAVY);

  box(b, "rearPanel", [0.82, 1.68, 0.035], [0, 0.88, -0.435], BLACK);
  box(b, "rearPanelInset", [0.64, 1.38, 0.018], [0, 0.86, -0.458], NAVY);

  box(b, "rearTopCap", [0.84, 0.08, 0.79], [0, 1.82, -0.025], PURPLE);
  box(b, "rearBottomCap", [0.84, 0.075, 0.8], [0, 0.075, -0.02], BLACK);

  box(b, "cabinetTop", [0.84, 0.065, 0.76], [0, 1.89, -0.005], VIOLET);
  box(b, "cabinetTopFrontLip", [0.86, 0.07, 0.08], [0, 1.88, 0.335], MAGENTA);

  box(b, "frontLowerFace", [0.8, 0.68, 0.045], [0, 0.39, 0.386], INK);
  box(b, "frontLowerShadow", [0.72, 0.05, 0.025], [0, 0.705, 0.418], PURPLE);

  box(b, "screenHousing", [0.77, 0.66, 0.09], [0, 1.31, 0.275], BLACK, [-10, 0, 0]);
  box(b, "screenBezel", [0.7, 0.59, 0.065], [0, 1.31, 0.335], VIOLET, [-10, 0, 0]);
  box(b, "screenFace", [0.59, 0.42, 0.018], [0, 1.31, 0.38], NAVY, [-10, 0, 0]);

  box(b, "screenLowerBezel", [0.66, 0.07, 0.045], [0, 1.005, 0.37], INK, [-10, 0, 0]);
  box(b, "screenUpperBezel", [0.67, 0.07, 0.045], [0, 1.615, 0.37], BLACK, [-10, 0, 0]);

  box(b, "screenTrimL", [0.045, 0.5, 0.045], [-0.335, 1.31, 0.365], CYAN, [-10, 0, 0]);
  box(b, "screenTrimR", [0.045, 0.5, 0.045], [0.335, 1.31, 0.365], MAGENTA, [-10, 0, 0]);

  cylinder(b, "screenBoltLTop", 0.014, 0.014, [-0.31, 1.58, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltRTop", 0.014, 0.014, [0.31, 1.58, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltLLow", 0.014, 0.014, [-0.31, 1.055, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltRLow", 0.014, 0.014, [0.31, 1.055, 0.406], SILVER, [0, 0.18, 0.98], 8);

  box(b, "marqueeHousing", [0.85, 0.25, 0.19], [0, 1.75, 0.29], BLACK, [-4, 0, 0]);
  box(b, "marqueeBackGlow", [0.74, 0.19, 0.028], [0, 1.765, 0.392], VIOLET, [-4, 0, 0]);
  box(b, "marqueeFace", [0.67, 0.145, 0.018], [0, 1.77, 0.414], PURPLE, [-4, 0, 0]);
  box(b, "marqueeLowerTrim", [0.76, 0.035, 0.03], [0, 1.645, 0.405], CYAN, [-4, 0, 0]);
  box(b, "marqueeUpperTrim", [0.76, 0.032, 0.03], [0, 1.875, 0.4], MAGENTA, [-4, 0, 0]);

  cylinder(b, "marqueeBoltL", 0.012, 0.014, [-0.345, 1.765, 0.433], GOLD, [0, 0, 1], 8);
  cylinder(b, "marqueeBoltR", 0.012, 0.014, [0.345, 1.765, 0.433], CYAN, [0, 0, 1], 8);

  box(b, "controlDeckSupport", [0.82, 0.2, 0.32], [0, 0.78, 0.28], BLACK, [10, 0, 0]);
  box(b, "controlPanel", [0.84, 0.105, 0.42], [0, 0.84, 0.405], PURPLE, [10, 0, 0]);
  box(b, "controlPanelTop", [0.74, 0.025, 0.37], [0, 0.895, 0.44], NAVY, [10, 0, 0]);
  box(b, "controlFrontLip", [0.86, 0.07, 0.06], [0, 0.78, 0.59], MAGENTA, [10, 0, 0]);
  box(b, "controlRearLip", [0.82, 0.06, 0.06], [0, 0.91, 0.235], CYAN, [10, 0, 0]);
  box(b, "controlSideL", [0.045, 0.09, 0.38], [0.405, 0.84, 0.41], VIOLET, [10, 0, 0]);
  box(b, "controlSideR", [0.045, 0.09, 0.38], [-0.405, 0.84, 0.41], VIOLET, [10, 0, 0]);

  cylinder(b, "joystickMount", 0.095, 0.035, [-0.17, 0.93, 0.47], BLACK);
  cylinder(b, "joystickCollar", 0.062, 0.025, [-0.17, 0.96, 0.47], CYAN);
  rod(b, "joystickShaft", [-0.17, 0.95, 0.47], [-0.17, 1.105, 0.47], 0.018, BLACK);
  sphere(b, "joystickBall", 0.052, [-0.17, 1.125, 0.47], MAGENTA, 10, 6);
  sphere(b, "joystickBallHighlight", 0.012, [-0.185, 1.155, 0.493], PINK, 7, 4);

  const buttons: Array<[number, string]> = [
    [-0.015, CYAN],
    [0.09, MAGENTA],
    [0.195, CYAN],
    [0.30, MAGENTA],
    [0.405, CYAN],
  ];
  buttons.forEach(([x, color], i) => {
    cylinder(b, `buttonCollar${i}`, 0.046, 0.022, [x, 0.946, 0.55], BLACK);
    cylinder(b, `button${i}`, 0.034, 0.026, [x, 0.962, 0.55], color);
    sphere(b, `buttonCap${i}`, 0.033, [x, 0.977, 0.55], color, 8, 4);
  });

  cylinder(b, "serviceButtonCollar", 0.04, 0.02, [0.29, 0.946, 0.32], BLACK);
  cylinder(b, "serviceButton", 0.027, 0.022, [0.29, 0.958, 0.32], GOLD);
  cylinder(b, "startButtonCollar", 0.04, 0.02, [0.39, 0.946, 0.32], BLACK);
  cylinder(b, "startButton", 0.027, 0.022, [0.39, 0.958, 0.32], RED);

  box(b, "coinDoor", [0.43, 0.33, 0.026], [0, 0.36, 0.425], NAVY);
  box(b, "coinDoorInset", [0.35, 0.25, 0.012], [0, 0.36, 0.443], BLACK);
  box(b, "coinDoorTopTrim", [0.38, 0.024, 0.02], [0, 0.505, 0.449], MAGENTA);
  box(b, "coinDoorBottomTrim", [0.38, 0.024, 0.02], [0, 0.215, 0.449], CYAN);
  box(b, "coinDoorLTrim", [0.024, 0.29, 0.02], [-0.19, 0.36, 0.449], VIOLET);
  box(b, "coinDoorRTrim", [0.024, 0.29, 0.02], [0.19, 0.36, 0.449], VIOLET);

  box(b, "coinSlotL", [0.09, 0.018, 0.012], [-0.115, 0.405, 0.458], CYAN);
  box(b, "coinSlotR", [0.09, 0.018, 0.012], [0.115, 0.405, 0.458], CYAN);
  box(b, "coinReturnL", [0.09, 0.032, 0.014], [-0.115, 0.295, 0.456], PURPLE);
  box(b, "coinReturnR", [0.09, 0.032, 0.014], [0.115, 0.295, 0.456], PURPLE);
  cylinder(b, "coinLight", 0.018, 0.012, [0, 0.31, 0.46], MAGENTA, [0, 0, 1], 8);

  cylinder(b, "coinRivetTL", 0.012, 0.012, [-0.165, 0.485, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetTR", 0.012, 0.012, [0.165, 0.485, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetBL", 0.012, 0.012, [-0.165, 0.235, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetBR", 0.012, 0.012, [0.165, 0.235, 0.458], SILVER, [0, 0, 1], 8);

  box(b, "speakerPanel", [0.64, 0.15, 0.022], [0, 1.645, 0.425], BLACK);
  box(b, "speakerPanelTop", [0.66, 0.018, 0.025], [0, 1.73, 0.435], CYAN);
  box(b, "speakerPanelBottom", [0.66, 0.018, 0.025], [0, 1.56, 0.435], MAGENTA);

  for (let i = 0; i < 9; i++) {
    const x = -0.27 + i * 0.0675;
    box(b, `speakerSlotA${i}`, [0.035, 0.018, 0.018], [x, 1.682, 0.447], VIOLET);
    box(b, `speakerSlotB${i}`, [0.035, 0.018, 0.018], [x, 1.628, 0.447], VIOLET);
  }

  cylinder(b, "speakerBoltTL", 0.011, 0.014, [-0.29, 1.705, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltTR", 0.011, 0.014, [0.29, 1.705, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltBL", 0.011, 0.014, [-0.29, 1.59, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltBR", 0.011, 0.014, [0.29, 1.59, 0.45], SILVER, [0, 0, 1], 8);

  box(b, "lowerVentPanel", [0.6, 0.17, 0.022], [0, 0.68, 0.425], BLACK);
  box(b, "lowerVentTop", [0.62, 0.018, 0.024], [0, 0.78, 0.438], MAGENTA);
  box(b, "lowerVentBottom", [0.62, 0.018, 0.024], [0, 0.58, 0.438], CYAN);

  for (let i = 0; i < 7; i++) {
    const x = -0.24 + i * 0.08;
    box(b, `ventSlat${i}`, [0.045, 0.095, 0.018], [x, 0.68, 0.448], NAVY, [0, 0, -12]);
  }

  box(b, "lowerVentBracketL", [0.035, 0.16, 0.028], [-0.315, 0.68, 0.45], MAGENTA);
  box(b, "lowerVentBracketR", [0.035, 0.16, 0.028], [0.315, 0.68, 0.45], MAGENTA);
  cylinder(b, "powerIndicator", 0.018, 0.012, [0.36, 0.63, 0.46], GOLD, [0, 0, 1], 8);

  box(b, "frontCornerL", [0.045, 0.67, 0.055], [-0.405, 0.39, 0.4], VIOLET);
  box(b, "frontCornerR", [0.045, 0.67, 0.055], [0.405, 0.39, 0.4], VIOLET);
  box(b, "frontCornerGlowL", [0.018, 0.56, 0.026], [-0.438, 0.72, 0.43], CYAN);
  box(b, "frontCornerGlowR", [0.018, 0.56, 0.026], [0.438, 0.72, 0.43], MAGENTA);

  box(b, "sideFrontRailL", [0.025, 1.32, 0.035], [0.478, 1.13, 0.3], CYAN);
  box(b, "sideFrontRailR", [0.025, 1.32, 0.035], [-0.478, 1.13, 0.3], MAGENTA);
  box(b, "sideRearRailL", [0.025, 1.45, 0.028], [0.478, 1.03, -0.39], VIOLET);
  box(b, "sideRearRailR", [0.025, 1.45, 0.028], [-0.478, 1.03, -0.39], VIOLET);

  box(b, "sideRailFootL", [0.06, 0.06, 0.12], [0.468, 0.47, 0.28], MAGENTA);
  box(b, "sideRailFootR", [0.06, 0.06, 0.12], [-0.468, 0.47, 0.28], CYAN);
  box(b, "sideRailTopL", [0.06, 0.06, 0.13], [0.468, 1.72, 0.28], CYAN);
  box(b, "sideRailTopR", [0.06, 0.06, 0.13], [-0.468, 1.72, 0.28], MAGENTA);

  box(b, "sidePanelBadgeL", [0.018, 0.09, 0.18], [0.478, 1.1, -0.03], MAGENTA);
  box(b, "sidePanelBadgeR", [0.018, 0.09, 0.18], [-0.478, 1.1, -0.03], CYAN);

  box(b, "sidePanelLowerGlowL", [0.018, 0.035, 0.48], [0.479, 0.16, -0.09], CYAN);
  box(b, "sidePanelLowerGlowR", [0.018, 0.035, 0.48], [-0.479, 0.16, -0.09], MAGENTA);

  box(b, "rearVentHousing", [0.54, 0.3, 0.022], [0, 0.92, -0.47], INK);
  for (let i = 0; i < 6; i++) {
    box(
      b,
      `rearVent${i}`,
      [0.045, 0.2, 0.018],
      [-0.19 + i * 0.076, 0.92, -0.49],
      i % 2 === 0 ? VIOLET : BLUE,
      [0, 0, 12],
    );
  }

  box(b, "rearServicePlate", [0.25, 0.17, 0.02], [0, 0.42, -0.482], PURPLE);
  cylinder(b, "rearServiceBoltL", 0.012, 0.012, [-0.095, 0.42, -0.495], SILVER, [0, 0, 1], 8);
  cylinder(b, "rearServiceBoltR", 0.012, 0.012, [0.095, 0.42, -0.495], SILVER, [0, 0, 1], 8);

  box(b, "basePlinth", [0.9, 0.08, 0.68], [0, 0.065, -0.01], BLACK);
  box(b, "basePlinthFront", [0.86, 0.075, 0.08], [0, 0.09, 0.34], VIOLET);
  box(b, "basePlinthGlow", [0.76, 0.018, 0.035], [0, 0.125, 0.385], CYAN);
  box(b, "basePlinthRearGlow", [0.7, 0.018, 0.035], [0, 0.125, -0.37], MAGENTA);

  const feet: Array<[number, number]> = [
    [-0.34, 0.23],
    [0.34, 0.23],
    [-0.34, -0.28],
    [0.34, -0.28],
  ];
  feet.forEach(([x, z], i) => {
    box(b, `footBlock${i}`, [0.17, 0.075, 0.17], [x, 0.025, z], BLACK);
    box(b, `footGlow${i}`, [0.11, 0.018, 0.035], [x, 0.066, z + 0.075], i % 2 ? MAGENTA : CYAN);
  });

  box(b, "topSideCapL", [0.075, 0.11, 0.71], [0.44, 1.875, -0.02], MAGENTA);
  box(b, "topSideCapR", [0.075, 0.11, 0.71], [-0.44, 1.875, -0.02], CYAN);
  box(b, "topSideCapRearL", [0.075, 0.1, 0.1], [0.44, 1.87, -0.39], VIOLET);
  box(b, "topSideCapRearR", [0.075, 0.1, 0.1], [-0.44, 1.87, -0.39], VIOLET);

  box(b, "cabinetSeamFrontL", [0.012, 0.56, 0.016], [0.43, 1.29, 0.42], PINK, [-10, 0, 0]);
  box(b, "cabinetSeamFrontR", [0.012, 0.56, 0.016], [-0.43, 1.29, 0.42], BLUE, [-10, 0, 0]);

  rod(b, "leftSideDiagonalAccent", [0.484, 0.73, 0.37], [0.484, 0.88, 0.5], 0.009, MAGENTA);
  rod(b, "rightSideDiagonalAccent", [-0.484, 0.73, 0.37], [-0.484, 0.88, 0.5], 0.009, CYAN);
  rod(b, "leftRearDiagonalAccent", [0.484, 1.66, -0.31], [0.484, 1.77, -0.18], 0.009, CYAN);
  rod(b, "rightRearDiagonalAccent", [-0.484, 1.66, -0.31], [-0.484, 1.77, -0.18], 0.009, MAGENTA);

  box(b, "leftLowerCornerBlock", [0.07, 0.08, 0.12], [0.44, 0.16, 0.36], CYAN);
  box(b, "rightLowerCornerBlock", [0.07, 0.08, 0.12], [-0.44, 0.16, 0.36], MAGENTA);
  box(b, "leftUpperCornerBlock", [0.07, 0.08, 0.12], [0.44, 1.7, 0.36], MAGENTA);
  box(b, "rightUpperCornerBlock", [0.07, 0.08, 0.12], [-0.44, 1.7, 0.36], CYAN);

  cylinder(b, "deckRivetL", 0.012, 0.014, [-0.37, 0.945, 0.62], SILVER, [0, 0.98, 0.18], 8);
  cylinder(b, "deckRivetR", 0.012, 0.014, [0.37, 0.945, 0.62], SILVER, [0, 0.98, 0.18], 8);

  box(b, "powerSwitchHousing", [0.13, 0.04, 0.08], [-0.31, 0.96, 0.32], BLACK, [10, 0, 0]);
  box(b, "powerSwitch", [0.04, 0.035, 0.052], [-0.31, 0.985, 0.32], GOLD, [10, 0, 0]);

  box(b, "smallFrontBadge", [0.17, 0.055, 0.018], [0, 0.565, 0.44], PURPLE);
  cylinder(b, "smallFrontBadgeDotL", 0.012, 0.012, [-0.055, 0.565, 0.453], CYAN, [0, 0, 1], 8);
  cylinder(b, "smallFrontBadgeDotR", 0.012, 0.012, [0.055, 0.565, 0.453], MAGENTA, [0, 0, 1], 8);
}

export default function build() {
  const b = createBuilder({ name: "synthwaveArcadeCabinet", detail: 1 });
  buildCabinet(b);

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

```ts
import * as THREE from "three";
import { createBuilder, mix, noise, paint, smoothstep } from "agentic-3js-builder";
import type { Builder, ColorInput } from "agentic-3js-builder";

export const BLACK = "#090817";
export const INK = "#160d2d";
export const NAVY = "#121441";
export const PURPLE = "#30205f";
export const VIOLET = "#6930a8";
export const MAGENTA = "#ff237f";
export const PINK = "#ff62b5";
export const CYAN = "#16e6ff";
export const BLUE = "#2679ff";
export const LILAC = "#a987ff";
export const SILVER = "#9da8cf";
export const CREAM = "#f6e7ce";
export const GOLD = "#ffbd42";
export const RED = "#ff315c";

export const meta = {
  name: "1980s Synthwave Arcade Cabinet",
  description:
    "A stylized low-poly 1980s upright arcade cabinet with a bold wedge silhouette, glowing synthwave trim, marquee, CRT screen, control deck, coin door, vents, feet, and painted neon side-panel artwork.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabinetTop",
    what: "Add a slim synthwave light bar across the cabinet roof: a dark violet housing, six chunky lamps alternating CYAN and MAGENTA, and two small angled brackets. Keep it blocky and toy-like.",
    at: [0, 1.96, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.72, 0.16, 0.22],
  },
  {
    id: "marqueeLogo",
    kind: "add",
    part: "marqueeFace",
    what: "Build a raised 1980s arcade title emblem on the marquee: layered hot-pink and cyan beveled lettering or a bold angular starburst badge, with a thin dark outline and two tiny corner bolts.",
    at: [0, 1.78, 0.425],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.14, 0.035],
  },
  {
    id: "joystickAssembly",
    kind: "add",
    part: "controlPanel",
    what: "Add the control hardware on the deck: one tall black joystick with a MAGENTA ball, a cyan collar, a square mounting plate, and six large alternating CYAN and MAGENTA arcade buttons. Leave a readable gap around every control.",
    at: [0.02, 0.88, 0.56],
    normal: [0, 0.98, 0.18],
    bone: null,
    room: [0.66, 0.18, 0.3],
  },
  {
    id: "speakerGrille",
    kind: "add",
    part: "speakerPanel",
    what: "Add a centered speaker grille beneath the marquee: a dark inset rectangle, two rows of evenly spaced short slits, cyan end caps, and four small silver screws.",
    at: [0, 1.635, 0.418],
    normal: [0, 0, 1],
    bone: null,
    room: [0.58, 0.12, 0.035],
  },
  {
    id: "coinDoorBadge",
    kind: "add",
    part: "coinDoor",
    what: "Add a coin-door badge and fittings: a small gold octagonal token emblem, two cyan coin return slots, a magenta service light, and four silver corner rivets.",
    at: [0, 0.36, 0.442],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.28, 0.035],
  },
  {
    id: "screenScanlines",
    kind: "add",
    part: "screenFace",
    what: "Add a recessed CRT screen treatment: a thin violet inner rim, three subtle cyan scanline strips, and a small magenta reflection diamond in the upper corner. Keep the center of the screen mostly clear.",
    at: [0, 1.31, 0.39],
    normal: [0, 0.18, 0.98],
    bone: null,
    room: [0.56, 0.37, 0.025],
  },
  {
    id: "sideNeonRails",
    kind: "add",
    part: "sidePanelL",
    what: "Add a synthwave side-panel rail on the visible left side: stepped MAGENTA and CYAN neon strips following the cabinet's front edge, with three dark mounting blocks. Keep the large center of the side panel open.",
    at: [0.47, 1.02, 0.32],
    normal: [1, 0, 0],
    bone: null,
    room: [0.035, 1.35, 0.16],
  },
  {
    id: "lowerVent",
    kind: "add",
    part: "lowerVentPanel",
    what: "Add a low front ventilation grille: a black inset, seven short cyan slats, two magenta end brackets, and a tiny gold power indicator.",
    at: [0, 0.68, 0.421],
    normal: [0, 0, 1],
    bone: null,
    room: [0.55, 0.16, 0.035],
  },
  {
    id: "rearCable",
    kind: "add",
    part: "rearPanel",
    what: "Add a short coiled power cable emerging from the rear lower panel, using BLACK, VIOLET, and CYAN bands, plus a small rectangular strain-relief block. Keep it close to the cabinet footprint.",
    at: [0, 0.28, -0.455],
    normal: [0, 0, -1],
    bone: null,
    room: [0.22, 0.3, 0.18],
  },
  {
    id: "marqueeTexture",
    kind: "texture",
    part: "marqueeFace",
    what: "Paint the marquee face as a saturated synthwave gradient from deep PURPLE at the bottom to MAGENTA and CYAN at the top, with a subtle angular grid and starburst highlights. Preserve a clean central area for the raised title emblem.",
  },
  {
    id: "screenTexture",
    kind: "texture",
    part: "screenFace",
    what: "Paint the CRT screen with a dark NAVY-to-PURPLE glass field, a soft CYAN horizon glow, sparse MAGENTA pixel sparks, and restrained horizontal scanlines. Keep it readable as a blank screen behind the added reflection.",
  },
  {
    id: "sidePanelTextureL",
    kind: "texture",
    part: "sidePanelL",
    what: "Paint the left side panel with a bold 1980s synthwave composition: BLACK and NAVY base, a large hot-pink sunset disk low toward the rear, cyan perspective grid lines, and a few angular violet speed streaks. Keep the outer neon rail unobscured.",
  },
  {
    id: "sidePanelTextureR",
    kind: "texture",
    part: "sidePanelR",
    what: "Paint the right side panel to match the left: BLACK and NAVY base, MAGENTA sunset disk, CYAN horizon grid, and VIOLET geometric streaks, mirrored in spirit but not mechanically copied.",
  },
  {
    id: "controlPanelTexture",
    kind: "texture",
    part: "controlPanel",
    what: "Paint the control deck with a dark PURPLE surface, a cyan perimeter pinstripe, small magenta directional arrows, and a sparse checker motif around the controls. Do not cover the joystick and button clearances.",
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

const fract = (x: number) => x - Math.floor(x);
const tri = (x: number) => Math.abs(fract(x) * 2 - 1);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const MARQUEE_PAINT = paint((p, n) => {
  const t = clamp01((p.y - 1.68) / 0.21);
  const lower = mix(PURPLE, MAGENTA, smoothstep(0.05, 0.56, t));
  const base = mix(lower, CYAN, smoothstep(0.58, 1, t));
  let color = base;

  if (n.z > 0.2) {
    const cleanCenter = Math.abs(p.x) < 0.19 && p.y > 1.71 && p.y < 1.84;
    const verticalGrid = tri((p.x + 0.5) / 0.095) < 0.055;
    const diagonalGrid = tri((p.x + p.y * 0.72 + 0.4) / 0.13) < 0.045;
    const topSpark = Math.hypot(p.x * 1.4, (p.y - 1.845) * 3.2) < 0.07;
    const sideSpark = Math.hypot(p.x + 0.27, (p.y - 1.74) * 2.2) < 0.055;

    if (!cleanCenter && verticalGrid) color = mix(color, CYAN, 0.75);
    if (!cleanCenter && diagonalGrid) color = mix(color, PINK, 0.75);
    if (topSpark || sideSpark) color = CREAM;
  }

  return color;
});

const SCREEN_PAINT = paint((p, n) => {
  const vertical = clamp01((p.y - 1.08) / 0.46);
  let color = mix(NAVY, PURPLE, vertical * 0.72);

  if (n.z > 0.35) {
    const horizon = Math.exp(-Math.pow((p.y - 1.22) / 0.055, 2));
    color = mix(color, CYAN, horizon * 0.42);

    const scan = fract((p.y - 1.04) / 0.027);
    if (scan < 0.075) color = mix(color, BLUE, 0.3);

    const sparkleField = noise(
      new THREE.Vector3(Math.floor((p.x + 0.4) / 0.055) * 0.055, Math.floor((p.y - 1.05) / 0.055) * 0.055, p.z),
      0.08,
      71,
    );
    const sparseSpark = sparkleField > 0.79 && p.y > 1.27 && Math.abs(p.x) > 0.13;
    if (sparseSpark) color = mix(color, MAGENTA, smoothstep(0.79, 0.98, sparkleField));
  }

  return color;
});

function synthSidePaint(variant: number) {
  return paint((p, n) => {
    const y = p.y;
    const z = p.z;
    let color = mix(BLACK, NAVY, smoothstep(0.18, 1.45, y));

    const diskY = variant ? 0.49 : 0.55;
    const diskZ = variant ? -0.25 : -0.18;
    const diskRadius = variant ? 0.255 : 0.275;
    const diskDistance = Math.hypot((y - diskY) / 1.08, (z - diskZ) / 0.82);
    if (diskDistance < diskRadius) {
      const diskT = clamp01(diskDistance / diskRadius);
      color = mix(PINK, MAGENTA, smoothstep(0.1, 0.92, diskT));
      if (diskT > 0.86) color = mix(color, VIOLET, smoothstep(0.86, 1, diskT));
    }

    const horizon = Math.abs(y - (variant ? 0.5 : 0.54));
    const horizonLine = horizon < 0.012;
    const horizontalGrid =
      y < (variant ? 0.53 : 0.57) && y > 0.13 && tri((y + variant * 0.013) / (variant ? 0.082 : 0.095)) < 0.07;

    const perspective = (z + 0.28) / Math.max(0.12, y - 0.12);
    const perspectiveGrid =
      y < (variant ? 0.58 : 0.61) &&
      Math.abs(tri(perspective * (variant ? 0.18 : 0.16) + variant * 0.17) - 0.5) < 0.028;

    if (horizonLine) color = CYAN;
    if (horizontalGrid || perspectiveGrid) color = mix(color, CYAN, 0.82);

    const streakA =
      Math.abs((y - (variant ? 1.08 : 1.18)) - (z + 0.03) * (variant ? 0.42 : 0.34)) < 0.018 &&
      z > -0.34 &&
      z < 0.3;
    const streakB =
      Math.abs((y - (variant ? 0.88 : 0.94)) + (z + 0.2) * (variant ? 0.3 : 0.24)) < 0.014 &&
      z > -0.42 &&
      z < 0.18;

    if (streakA) color = MAGENTA;
    if (streakB) color = VIOLET;

    const tinyGlow = noise(new THREE.Vector3(p.x, y * 1.3, z * 1.7), 0.12, 90 + variant);
    if (tinyGlow > 0.86 && y > 1.18 && z < 0.26) color = LILAC;

    if (Math.abs(n.x) < 0.35) {
      color = mix(color, INK, 0.34);
    }

    return color;
  });
}

const SIDE_PANEL_L_PAINT = synthSidePaint(0);
const SIDE_PANEL_R_PAINT = synthSidePaint(1);

const CONTROL_PANEL_PAINT = paint((p, n) => {
  let color = mix(PURPLE, NAVY, smoothstep(0.2, 0.95, p.z));

  if (n.y > 0.35) {
    const edge =
      Math.abs(Math.abs(p.x) - 0.36) < 0.014 ||
      Math.abs(p.z - 0.59) < 0.018 ||
      Math.abs(p.z - 0.25) < 0.014;
    if (edge) return CYAN;

    const checkerX = Math.floor((p.x + 0.42) / 0.095);
    const checkerZ = Math.floor((p.z - 0.23) / 0.085);
    if ((checkerX + checkerZ) % 2 === 0 && p.z > 0.27 && p.z < 0.38) {
      color = mix(color, VIOLET, 0.72);
    }

    const arrowLeft =
      Math.abs(p.x + 0.27) < 0.055 &&
      p.z > 0.47 &&
      p.z < 0.57 &&
      Math.abs(p.z - 0.52) > Math.abs(p.x + 0.27) * 0.42;
    const arrowRight =
      Math.abs(p.x - 0.27) < 0.055 &&
      p.z > 0.47 &&
      p.z < 0.57 &&
      Math.abs(p.z - 0.52) > Math.abs(p.x - 0.27) * 0.42;

    if (arrowLeft || arrowRight) color = MAGENTA;

    const pinstripe = tri((p.x + 0.43) / 0.035) < 0.09;
    if (pinstripe && p.z > 0.29 && p.z < 0.58) color = mix(color, CYAN, 0.68);
  }

  return color;
});

type V3 = readonly [number, number, number];
type Rot = readonly [number, number, number];

function box(
  b: Builder,
  name: string,
  size: V3,
  at: V3,
  color: ColorInput,
  rotation?: Rot,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    rotation,
    name,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  name: string,
  radius: number,
  height: number,
  at: V3,
  color: ColorInput,
  dir?: V3,
  segments = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    dir,
    name,
    flat: true,
  });
}

function sphere(
  b: Builder,
  name: string,
  radius: number,
  at: V3,
  color: ColorInput,
  segments = 8,
  rings = 5,
) {
  return b.part(new THREE.SphereGeometry(radius, segments, rings), color, {
    at,
    name,
    flat: true,
  });
}

function rod(
  b: Builder,
  name: string,
  a: V3,
  c: V3,
  radius: number,
  color: ColorInput,
) {
  return b.rod(a, c, radius, {
    color,
    name,
    sides: 6,
    caps: "round",
  });
}

function buildCabinet(b: Builder) {
  const sideProfile: [number, number][] = [
    [-0.48, 0.025],
    [0.34, 0.025],
    [0.385, 0.63],
    [0.535, 0.735],
    [0.515, 0.875],
    [0.31, 1.005],
    [0.275, 1.57],
    [0.425, 1.705],
    [0.405, 1.885],
    [-0.405, 1.885],
    [-0.495, 1.765],
  ];

  b.extrude(sideProfile, {
    at: [0.435, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    smoothing: 0,
    color: SIDE_PANEL_L_PAINT,
    name: "sidePanelL",
  });

  b.extrude(sideProfile, {
    at: [-0.435, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    smoothing: 0,
    color: SIDE_PANEL_R_PAINT,
    name: "sidePanelR",
  });

  box(b, "cabinetCore", [0.82, 1.76, 0.78], [0, 0.905, -0.03], INK);
  box(b, "cabinetLowerCore", [0.84, 0.68, 0.8], [0, 0.37, -0.02], BLACK);
  box(b, "cabinetUpperCore", [0.82, 0.68, 0.76], [0, 1.47, -0.015], NAVY);

  box(b, "rearPanel", [0.82, 1.68, 0.035], [0, 0.88, -0.435], BLACK);
  box(b, "rearPanelInset", [0.64, 1.38, 0.018], [0, 0.86, -0.458], NAVY);

  box(b, "rearTopCap", [0.84, 0.08, 0.79], [0, 1.82, -0.025], PURPLE);
  box(b, "rearBottomCap", [0.84, 0.075, 0.8], [0, 0.075, -0.02], BLACK);

  box(b, "cabinetTop", [0.84, 0.065, 0.76], [0, 1.89, -0.005], VIOLET);
  box(b, "cabinetTopFrontLip", [0.86, 0.07, 0.08], [0, 1.88, 0.335], MAGENTA);

  box(b, "frontLowerFace", [0.8, 0.68, 0.045], [0, 0.39, 0.386], INK);
  box(b, "frontLowerShadow", [0.72, 0.05, 0.025], [0, 0.705, 0.418], PURPLE);

  box(b, "screenHousing", [0.77, 0.66, 0.09], [0, 1.31, 0.275], BLACK, [-10, 0, 0]);
  box(b, "screenBezel", [0.7, 0.59, 0.065], [0, 1.31, 0.335], VIOLET, [-10, 0, 0]);
  box(b, "screenFace", [0.59, 0.42, 0.018], [0, 1.31, 0.38], SCREEN_PAINT, [-10, 0, 0]);

  box(b, "screenLowerBezel", [0.66, 0.07, 0.045], [0, 1.005, 0.37], INK, [-10, 0, 0]);
  box(b, "screenUpperBezel", [0.67, 0.07, 0.045], [0, 1.615, 0.37], BLACK, [-10, 0, 0]);

  box(b, "screenTrimL", [0.045, 0.5, 0.045], [-0.335, 1.31, 0.365], CYAN, [-10, 0, 0]);
  box(b, "screenTrimR", [0.045, 0.5, 0.045], [0.335, 1.31, 0.365], MAGENTA, [-10, 0, 0]);

  cylinder(b, "screenBoltLTop", 0.014, 0.014, [-0.31, 1.58, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltRTop", 0.014, 0.014, [0.31, 1.58, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltLLow", 0.014, 0.014, [-0.31, 1.055, 0.406], SILVER, [0, 0.18, 0.98], 8);
  cylinder(b, "screenBoltRLow", 0.014, 0.014, [0.31, 1.055, 0.406], SILVER, [0, 0.18, 0.98], 8);

  box(b, "marqueeHousing", [0.85, 0.25, 0.19], [0, 1.75, 0.29], BLACK, [-4, 0, 0]);
  box(b, "marqueeBackGlow", [0.74, 0.19, 0.028], [0, 1.765, 0.392], VIOLET, [-4, 0, 0]);
  box(b, "marqueeFace", [0.67, 0.145, 0.018], [0, 1.77, 0.414], MARQUEE_PAINT, [-4, 0, 0]);
  box(b, "marqueeLowerTrim", [0.76, 0.035, 0.03], [0, 1.645, 0.405], CYAN, [-4, 0, 0]);
  box(b, "marqueeUpperTrim", [0.76, 0.032, 0.03], [0, 1.875, 0.4], MAGENTA, [-4, 0, 0]);

  cylinder(b, "marqueeBoltL", 0.012, 0.014, [-0.345, 1.765, 0.433], GOLD, [0, 0, 1], 8);
  cylinder(b, "marqueeBoltR", 0.012, 0.014, [0.345, 1.765, 0.433], CYAN, [0, 0, 1], 8);

  box(b, "controlDeckSupport", [0.82, 0.2, 0.32], [0, 0.78, 0.28], BLACK, [10, 0, 0]);
  box(b, "controlPanel", [0.84, 0.105, 0.42], [0, 0.84, 0.405], CONTROL_PANEL_PAINT, [10, 0, 0]);
  box(b, "controlPanelTop", [0.74, 0.025, 0.37], [0, 0.895, 0.44], NAVY, [10, 0, 0]);
  box(b, "controlFrontLip", [0.86, 0.07, 0.06], [0, 0.78, 0.59], MAGENTA, [10, 0, 0]);
  box(b, "controlRearLip", [0.82, 0.06, 0.06], [0, 0.91, 0.235], CYAN, [10, 0, 0]);
  box(b, "controlSideL", [0.045, 0.09, 0.38], [0.405, 0.84, 0.41], VIOLET, [10, 0, 0]);
  box(b, "controlSideR", [0.045, 0.09, 0.38], [-0.405, 0.84, 0.41], VIOLET, [10, 0, 0]);

  cylinder(b, "joystickMount", 0.095, 0.035, [-0.17, 0.93, 0.47], BLACK);
  cylinder(b, "joystickCollar", 0.062, 0.025, [-0.17, 0.96, 0.47], CYAN);
  rod(b, "joystickShaft", [-0.17, 0.95, 0.47], [-0.17, 1.105, 0.47], 0.018, BLACK);
  sphere(b, "joystickBall", 0.052, [-0.17, 1.125, 0.47], MAGENTA, 10, 6);
  sphere(b, "joystickBallHighlight", 0.012, [-0.185, 1.155, 0.493], PINK, 7, 4);

  const buttons: Array<[number, string]> = [
    [-0.015, CYAN],
    [0.09, MAGENTA],
    [0.195, CYAN],
    [0.30, MAGENTA],
    [0.405, CYAN],
  ];
  buttons.forEach(([x, color], i) => {
    cylinder(b, `buttonCollar${i}`, 0.046, 0.022, [x, 0.946, 0.55], BLACK);
    cylinder(b, `button${i}`, 0.034, 0.026, [x, 0.962, 0.55], color);
    sphere(b, `buttonCap${i}`, 0.033, [x, 0.977, 0.55], color, 8, 4);
  });

  cylinder(b, "serviceButtonCollar", 0.04, 0.02, [0.29, 0.946, 0.32], BLACK);
  cylinder(b, "serviceButton", 0.027, 0.022, [0.29, 0.958, 0.32], GOLD);
  cylinder(b, "startButtonCollar", 0.04, 0.02, [0.39, 0.946, 0.32], BLACK);
  cylinder(b, "startButton", 0.027, 0.022, [0.39, 0.958, 0.32], RED);

  box(b, "coinDoor", [0.43, 0.33, 0.026], [0, 0.36, 0.425], NAVY);
  box(b, "coinDoorInset", [0.35, 0.25, 0.012], [0, 0.36, 0.443], BLACK);
  box(b, "coinDoorTopTrim", [0.38, 0.024, 0.02], [0, 0.505, 0.449], MAGENTA);
  box(b, "coinDoorBottomTrim", [0.38, 0.024, 0.02], [0, 0.215, 0.449], CYAN);
  box(b, "coinDoorLTrim", [0.024, 0.29, 0.02], [-0.19, 0.36, 0.449], VIOLET);
  box(b, "coinDoorRTrim", [0.024, 0.29, 0.02], [0.19, 0.36, 0.449], VIOLET);

  box(b, "coinSlotL", [0.09, 0.018, 0.012], [-0.115, 0.405, 0.458], CYAN);
  box(b, "coinSlotR", [0.09, 0.018, 0.012], [0.115, 0.405, 0.458], CYAN);
  box(b, "coinReturnL", [0.09, 0.032, 0.014], [-0.115, 0.295, 0.456], PURPLE);
  box(b, "coinReturnR", [0.09, 0.032, 0.014], [0.115, 0.295, 0.456], PURPLE);
  cylinder(b, "coinLight", 0.018, 0.012, [0, 0.31, 0.46], MAGENTA, [0, 0, 1], 8);

  cylinder(b, "coinRivetTL", 0.012, 0.012, [-0.165, 0.485, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetTR", 0.012, 0.012, [0.165, 0.485, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetBL", 0.012, 0.012, [-0.165, 0.235, 0.458], SILVER, [0, 0, 1], 8);
  cylinder(b, "coinRivetBR", 0.012, 0.012, [0.165, 0.235, 0.458], SILVER, [0, 0, 1], 8);

  box(b, "speakerPanel", [0.64, 0.15, 0.022], [0, 1.645, 0.425], BLACK);
  box(b, "speakerPanelTop", [0.66, 0.018, 0.025], [0, 1.73, 0.435], CYAN);
  box(b, "speakerPanelBottom", [0.66, 0.018, 0.025], [0, 1.56, 0.435], MAGENTA);

  for (let i = 0; i < 9; i++) {
    const x = -0.27 + i * 0.0675;
    box(b, `speakerSlotA${i}`, [0.035, 0.018, 0.018], [x, 1.682, 0.447], VIOLET);
    box(b, `speakerSlotB${i}`, [0.035, 0.018, 0.018], [x, 1.628, 0.447], VIOLET);
  }

  cylinder(b, "speakerBoltTL", 0.011, 0.014, [-0.29, 1.705, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltTR", 0.011, 0.014, [0.29, 1.705, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltBL", 0.011, 0.014, [-0.29, 1.59, 0.45], SILVER, [0, 0, 1], 8);
  cylinder(b, "speakerBoltBR", 0.011, 0.014, [0.29, 1.59, 0.45], SILVER, [0, 0, 1], 8);

  box(b, "lowerVentPanel", [0.6, 0.17, 0.022], [0, 0.68, 0.425], BLACK);
  box(b, "lowerVentTop", [0.62, 0.018, 0.024], [0, 0.78, 0.438], MAGENTA);
  box(b, "lowerVentBottom", [0.62, 0.018, 0.024], [0, 0.58, 0.438], CYAN);

  for (let i = 0; i < 7; i++) {
    const x = -0.24 + i * 0.08;
    box(b, `ventSlat${i}`, [0.045, 0.095, 0.018], [x, 0.68, 0.448], NAVY, [0, 0, -12]);
  }

  box(b, "lowerVentBracketL", [0.035, 0.16, 0.028], [-0.315, 0.68, 0.45], MAGENTA);
  box(b, "lowerVentBracketR", [0.035, 0.16, 0.028], [0.315, 0.68, 0.45], MAGENTA);
  cylinder(b, "powerIndicator", 0.018, 0.012, [0.36, 0.63, 0.46], GOLD, [0, 0, 1], 8);

  box(b, "frontCornerL", [0.045, 0.67, 0.055], [-0.405, 0.39, 0.4], VIOLET);
  box(b, "frontCornerR", [0.045, 0.67, 0.055], [0.405, 0.39, 0.4], VIOLET);
  box(b, "frontCornerGlowL", [0.018, 0.56, 0.026], [-0.438, 0.72, 0.43], CYAN);
  box(b, "frontCornerGlowR", [0.018, 0.56, 0.026], [0.438, 0.72, 0.43], MAGENTA);

  box(b, "sideFrontRailL", [0.025, 1.32, 0.035], [0.478, 1.13, 0.3], CYAN);
  box(b, "sideFrontRailR", [0.025, 1.32, 0.035], [-0.478, 1.13, 0.3], MAGENTA);
  box(b, "sideRearRailL", [0.025, 1.45, 0.028], [0.478, 1.03, -0.39], VIOLET);
  box(b, "sideRearRailR", [0.025, 1.45, 0.028], [-0.478, 1.03, -0.39], VIOLET);

  box(b, "sideRailFootL", [0.06, 0.06, 0.12], [0.468, 0.47, 0.28], MAGENTA);
  box(b, "sideRailFootR", [0.06, 0.06, 0.12], [-0.468, 0.47, 0.28], CYAN);
  box(b, "sideRailTopL", [0.06, 0.06, 0.13], [0.468, 1.72, 0.28], CYAN);
  box(b, "sideRailTopR", [0.06, 0.06, 0.13], [-0.468, 1.72, 0.28], MAGENTA);

  box(b, "sidePanelBadgeL", [0.018, 0.09, 0.18], [0.478, 1.1, -0.03], MAGENTA);
  box(b, "sidePanelBadgeR", [0.018, 0.09, 0.18], [-0.478, 1.1, -0.03], CYAN);

  box(b, "sidePanelLowerGlowL", [0.018, 0.035, 0.48], [0.479, 0.16, -0.09], CYAN);
  box(b, "sidePanelLowerGlowR", [0.018, 0.035, 0.48], [-0.479, 0.16, -0.09], MAGENTA);

  box(b, "rearVentHousing", [0.54, 0.3, 0.022], [0, 0.92, -0.47], INK);
  for (let i = 0; i < 6; i++) {
    box(
      b,
      `rearVent${i}`,
      [0.045, 0.2, 0.018],
      [-0.19 + i * 0.076, 0.92, -0.49],
      i % 2 === 0 ? VIOLET : BLUE,
      [0, 0, 12],
    );
  }

  box(b, "rearServicePlate", [0.25, 0.17, 0.02], [0, 0.42, -0.482], PURPLE);
  cylinder(b, "rearServiceBoltL", 0.012, 0.012, [-0.095, 0.42, -0.495], SILVER, [0, 0, 1], 8);
  cylinder(b, "rearServiceBoltR", 0.012, 0.012, [0.095, 0.42, -0.495], SILVER, [0, 0, 1], 8);

  box(b, "basePlinth", [0.9, 0.08, 0.68], [0, 0.065, -0.01], BLACK);
  box(b, "basePlinthFront", [0.86, 0.075, 0.08], [0, 0.09, 0.34], VIOLET);
  box(b, "basePlinthGlow", [0.76, 0.018, 0.035], [0, 0.125, 0.385], CYAN);
  box(b, "basePlinthRearGlow", [0.7, 0.018, 0.035], [0, 0.125, -0.37], MAGENTA);

  const feet: Array<[number, number]> = [
    [-0.34, 0.23],
    [0.34, 0.23],
    [-0.34, -0.28],
    [0.34, -0.28],
  ];
  feet.forEach(([x, z], i) => {
    box(b, `footBlock${i}`, [0.17, 0.075, 0.17], [x, 0.025, z], BLACK);
    box(b, `footGlow${i}`, [0.11, 0.018, 0.035], [x, 0.066, z + 0.075], i % 2 ? MAGENTA : CYAN);
  });

  box(b, "topSideCapL", [0.075, 0.11, 0.71], [0.44, 1.875, -0.02], MAGENTA);
  box(b, "topSideCapR", [0.075, 0.11, 0.71], [-0.44, 1.875, -0.02], CYAN);
  box(b, "topSideCapRearL", [0.075, 0.1, 0.1], [0.44, 1.87, -0.39], VIOLET);
  box(b, "topSideCapRearR", [0.075, 0.1, 0.1], [-0.44, 1.87, -0.39], VIOLET);

  box(b, "cabinetSeamFrontL", [0.012, 0.56, 0.016], [0.43, 1.29, 0.42], PINK, [-10, 0, 0]);
  box(b, "cabinetSeamFrontR", [0.012, 0.56, 0.016], [-0.43, 1.29, 0.42], BLUE, [-10, 0, 0]);

  rod(b, "leftSideDiagonalAccent", [0.484, 0.73, 0.37], [0.484, 0.88, 0.5], 0.009, MAGENTA);
  rod(b, "rightSideDiagonalAccent", [-0.484, 0.73, 0.37], [-0.484, 0.88, 0.5], 0.009, CYAN);
  rod(b, "leftRearDiagonalAccent", [0.484, 1.66, -0.31], [0.484, 1.77, -0.18], 0.009, CYAN);
  rod(b, "rightRearDiagonalAccent", [-0.484, 1.66, -0.31], [-0.484, 1.77, -0.18], 0.009, MAGENTA);

  box(b, "leftLowerCornerBlock", [0.07, 0.08, 0.12], [0.44, 0.16, 0.36], CYAN);
  box(b, "rightLowerCornerBlock", [0.07, 0.08, 0.12], [-0.44, 0.16, 0.36], MAGENTA);
  box(b, "leftUpperCornerBlock", [0.07, 0.08, 0.12], [0.44, 1.7, 0.36], MAGENTA);
  box(b, "rightUpperCornerBlock", [0.07, 0.08, 0.12], [-0.44, 1.7, 0.36], CYAN);

  cylinder(b, "deckRivetL", 0.012, 0.014, [-0.37, 0.945, 0.62], SILVER, [0, 0.98, 0.18], 8);
  cylinder(b, "deckRivetR", 0.012, 0.014, [0.37, 0.945, 0.62], SILVER, [0, 0.98, 0.18], 8);

  box(b, "powerSwitchHousing", [0.13, 0.04, 0.08], [-0.31, 0.96, 0.32], BLACK, [10, 0, 0]);
  box(b, "powerSwitch", [0.04, 0.035, 0.052], [-0.31, 0.985, 0.32], GOLD, [10, 0, 0]);

  box(b, "smallFrontBadge", [0.17, 0.055, 0.018], [0, 0.565, 0.44], PURPLE);
  cylinder(b, "smallFrontBadgeDotL", 0.012, 0.012, [-0.055, 0.565, 0.453], CYAN, [0, 0, 1], 8);
  cylinder(b, "smallFrontBadgeDotR", 0.012, 0.012, [0.055, 0.565, 0.453], MAGENTA, [0, 0, 1], 8);
}

export default function build() {
  const b = createBuilder({ name: "synthwaveArcadeCabinet", detail: 1 });
  buildCabinet(b);

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const at: [number, number, number] = [0, 1.96, 0.2];

  const box = (
    name: string,
    size: [number, number, number],
    position: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: position,
      rotation,
      name,
      flat: true,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    position: [number, number, number],
    color: string,
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at: position,
      name,
      flat: true,
    });

  const sphere = (
    name: string,
    radius: number,
    position: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at: position,
      name,
      flat: true,
    });

  // A chunky, recessed housing sits directly on the cabinet roof.
  box("s21LightBarHousing", [0.72, 0.052, 0.14], [0, 1.938, 0.2], INK);
  box("s21LightBarLowerSkirt", [0.68, 0.018, 0.125], [0, 1.908, 0.2], VIOLET);
  box("s21LightBarTopPlate", [0.66, 0.016, 0.112], [0, 1.969, 0.2], PURPLE);

  // Neon face bands make the bar readable from the front and side.
  box("s21LightBarFrontCyan", [0.59, 0.018, 0.018], [0, 1.947, 0.276], CYAN);
  box("s21LightBarFrontMagenta", [0.37, 0.012, 0.014], [0, 1.925, 0.285], MAGENTA);
  box("s21LightBarRearRidge", [0.54, 0.014, 0.022], [0, 1.972, 0.135], BLUE);

  // Coloured end blocks give the housing a toy-like, arcade-machine silhouette.
  box("s21LightBarEndL", [0.052, 0.065, 0.15], [0.337, 1.942, 0.2], MAGENTA);
  box("s21LightBarEndR", [0.052, 0.065, 0.15], [-0.337, 1.942, 0.2], CYAN);
  box("s21LightBarEndCapL", [0.018, 0.043, 0.105], [0.371, 1.943, 0.2], VIOLET);
  box("s21LightBarEndCapR", [0.018, 0.043, 0.105], [-0.371, 1.943, 0.2], VIOLET);

  // Angled mounting brackets penetrate the roof and tuck under the housing.
  for (const side of [-1, 1] as const) {
    b.frustumBox(
      [side * 0.285, 1.914, 0.2],
      [side * 0.315, 1.943, 0.2],
      [0.058, 0.044],
      [0.044, 0.038],
      {
        color: VIOLET,
        name: `s21LightBarBracket${side > 0 ? "L" : "R"}`,
        section: "box",
      },
    );

    cylinder(
      `s21LightBarBracketBolt${side > 0 ? "L" : "R"}`,
      0.014,
      0.012,
      [side * 0.292, 1.918, 0.235],
      GOLD,
      8,
    );
  }

  // Six faceted signal lamps alternate across the top of the bar.
  const lampColors = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];
  const lampX = [-0.265, -0.159, -0.053, 0.053, 0.159, 0.265];

  lampX.forEach((x, i) => {
    const color = lampColors[i];

    cylinder(`s21LampBase${i}`, 0.039, 0.012, [x, 1.978, 0.2], BLACK, 8);

    const lamp = cylinder(
      `s21LampBody${i}`,
      0.031,
      0.026,
      [x, 1.994, 0.2],
      color,
      8,
    );
    glow(lamp, 1.8);

    const cap = sphere(`s21LampCap${i}`, 0.031, [x, 2.012, 0.2], color);
    glow(cap, 2.1);

    // Small cream glints sit toward the front of each lens.
    const glint = sphere(
      `s21LampGlint${i}`,
      0.008,
      [x - 0.009, 2.021, 0.225],
      CREAM,
    );
    glow(glint, 1.4);
  });

  // Dark separators and two tiny roof-facing status studs finish the assembly.
  for (const x of [-0.212, -0.106, 0, 0.106, 0.212]) {
    box(
      `s21LampSeparator${x.toFixed(3).replace("-", "m")}`,
      [0.012, 0.014, 0.102],
      [x, 1.976, 0.2],
      INK,
    );
  }

  cylinder("s21StatusStudL", 0.009, 0.01, [-0.31, 1.976, 0.145], GOLD, 8);
  cylinder("s21StatusStudR", 0.009, 0.01, [0.31, 1.976, 0.145], GOLD, 8);

  // A narrow central spine visually locks the light modules to the housing.
  box("s21LightBarCenterSpine", [0.035, 0.018, 0.13], [0, 1.978, 0.2], BLUE);
  box("s21LightBarCenterSpineFront", [0.022, 0.012, 0.014], [0, 1.978, 0.271], PINK);
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addMarqueeLogo(b: Builder) {
  const marqueeNormal = new THREE.Vector3(0, 0.07, 0.9975).normalize();
  const marqueeY = new THREE.Vector3(0, 0.9975, -0.07).normalize();
  const deckNormal = new THREE.Vector3(0, 0.985, 0.174).normalize();

  const shifted = (p: readonly [number, number, number], distance: number) =>
    new THREE.Vector3(p[0], p[1], p[2]).addScaledVector(marqueeNormal, distance);

  const deckShifted = (p: readonly [number, number, number], distance: number) =>
    new THREE.Vector3(p[0], p[1], p[2]).addScaledVector(deckNormal, distance);

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 105">
      <defs>
        <linearGradient id="bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#160d2d"/>
          <stop offset="0.48" stop-color="#6930a8"/>
          <stop offset="1" stop-color="#ff237f"/>
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#16e6ff"/>
          <stop offset="1" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="496" height="101" rx="10" fill="#090817" stroke="#16e6ff" stroke-width="5"/>
      <rect x="10" y="10" width="480" height="85" rx="7" fill="url(#bg)" stroke="#ff237f" stroke-width="3"/>
      <path d="M15 80 L95 18 M55 94 L140 12 M350 94 L440 15 M402 94 L485 35"
        stroke="#a987ff" stroke-width="3" opacity=".55"/>
      <path d="M22 76 H478 M42 61 H458 M72 46 H430" stroke="#16e6ff" stroke-width="2" opacity=".42"/>
      <text x="250" y="69" text-anchor="middle"
        font-family="Arial Black, Impact, sans-serif" font-size="48" font-style="italic"
        font-weight="900" letter-spacing="4" fill="#090817" stroke="#090817" stroke-width="9"
        paint-order="stroke">NEON//84</text>
      <text x="250" y="64" text-anchor="middle"
        font-family="Arial Black, Impact, sans-serif" font-size="48" font-style="italic"
        font-weight="900" letter-spacing="4" fill="url(#shine)">NEON//84</text>
      <path d="M26 22 H108 M392 22 H474" stroke="#ffbd42" stroke-width="4"/>
      <circle cx="27" cy="84" r="4" fill="#ffbd42"/>
      <circle cx="473" cy="84" r="4" fill="#ffbd42"/>
    </svg>`,
    { size: 512 },
  );

  const marqueePanel = b.part(new THREE.PlaneGeometry(0.57, 0.112), CREAM, {
    at: shifted([0, 1.78, 0.425], 0.010),
    dir: marqueeNormal,
    axis: "z",
    up: [0, 1, 0],
    texture: marqueeTexture,
    name: "marqueeLogoTexture",
  });
  glow(marqueePanel, 0.85);

  const burstOutline: [number, number][] = [
    [0, 0.067],
    [0.045, 0.028],
    [0.22, 0.044],
    [0.158, 0],
    [0.22, -0.044],
    [0.045, -0.028],
    [0, -0.067],
    [-0.045, -0.028],
    [-0.22, -0.044],
    [-0.158, 0],
    [-0.22, 0.044],
    [-0.045, 0.028],
  ];

  const burstInner: [number, number][] = burstOutline.map(([x, y]) => [x * 0.91, y * 0.82]);

  const darkBurst = b.extrude(burstOutline, {
    at: shifted([0, 1.78, 0.425], 0.017),
    x: [1, 0, 0],
    y: marqueeY,
    thickness: 0.012,
    bevel: 0.004,
    color: BLACK,
    name: "marqueeBadgeOutline",
  });

  const cyanBurst = b.extrude(burstInner, {
    at: shifted([0, 1.78, 0.425], 0.025),
    x: [1, 0, 0],
    y: marqueeY,
    thickness: 0.009,
    bevel: 0.003,
    color: CYAN,
    name: "marqueeBadgeCyan",
  });
  glow(cyanBurst, 1.4);

  const magentaCore = b.extrude(
    [
      [0, 0.046],
      [0.051, 0],
      [0, -0.046],
      [-0.051, 0],
    ],
    {
      at: shifted([0, 1.78, 0.425], 0.034),
      x: [1, 0, 0],
      y: marqueeY,
      thickness: 0.012,
      bevel: 0.003,
      color: MAGENTA,
      name: "marqueeBadgeMagentaCore",
    },
  );
  glow(magentaCore, 1.5);

  const centerDiamond = b.extrude(
    [
      [-0.031, 0.022],
      [0.031, 0.022],
      [0.042, 0],
      [0.031, -0.022],
      [-0.031, -0.022],
      [-0.042, 0],
    ],
    {
      at: shifted([0, 1.78, 0.425], 0.043),
      x: [1, 0, 0],
      y: marqueeY,
      thickness: 0.009,
      bevel: 0.002,
      color: VIOLET,
      name: "marqueeBadgeCenter",
    },
  );

  const lightning = b.extrude(
    [
      [-0.012, 0.041],
      [0.031, 0.006],
      [0.008, 0.006],
      [0.026, -0.042],
      [-0.032, -0.005],
      [-0.006, -0.006],
    ],
    {
      at: shifted([0, 1.78, 0.425], 0.051),
      x: [1, 0, 0],
      y: marqueeY,
      thickness: 0.008,
      bevel: 0.002,
      color: GOLD,
      name: "marqueeLightning",
    },
  );
  glow(lightning, 1.35);

  const boltLeft = b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), GOLD, {
    at: shifted([-0.286, 1.78, 0.425], 0.030),
    dir: marqueeNormal,
    name: "marqueeCornerBoltL",
  });
  const boltRight = b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), CYAN, {
    at: shifted([0.286, 1.78, 0.425], 0.030),
    dir: marqueeNormal,
    name: "marqueeCornerBoltR",
  });
  glow(boltLeft, 1.1);
  glow(boltRight, 1.1);

  const plate = b.part(new THREE.BoxGeometry(0.22, 0.026, 0.19), BLACK, {
    at: [-0.17, 0.947, 0.47],
    rotation: [10, 0, 0],
    name: "joystickMountingPlate",
    flat: true,
  });

  const plateInset = b.part(new THREE.BoxGeometry(0.174, 0.012, 0.144), NAVY, {
    at: [-0.17, 0.967, 0.474],
    rotation: [10, 0, 0],
    name: "joystickMountingInset",
    flat: true,
  });

  const plateFront = b.part(new THREE.BoxGeometry(0.185, 0.009, 0.014), MAGENTA, {
    at: [-0.17, 0.975, 0.539],
    rotation: [10, 0, 0],
    name: "joystickPlateFrontTrim",
    flat: true,
  });
  const plateBack = b.part(new THREE.BoxGeometry(0.185, 0.009, 0.014), CYAN, {
    at: [-0.17, 0.953, 0.402],
    rotation: [10, 0, 0],
    name: "joystickPlateBackTrim",
    flat: true,
  });
  glow(plateFront, 1.1);
  glow(plateBack, 1.1);

  const plateCorners: Array<[number, number, number]> = [
    [-0.255, 0.976, 0.532],
    [-0.085, 0.976, 0.532],
    [-0.255, 0.954, 0.408],
    [-0.085, 0.954, 0.408],
  ];
  plateCorners.forEach((p, i) => {
    const screw = b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.010, 8), i % 2 ? CYAN : MAGENTA, {
      at: deckShifted(p, 0.010),
      dir: deckNormal,
      name: `joystickPlateBolt${i}`,
    });
    glow(screw, 1.15);
  });

  const collar = b.part(new THREE.CylinderGeometry(0.069, 0.069, 0.025, 12), CYAN, {
    at: deckShifted([-0.17, 0.958, 0.47], 0.015),
    dir: deckNormal,
    name: "joystickCyanCollar",
  });
  glow(collar, 1.35);

  const shaft = b.part(new THREE.CylinderGeometry(0.020, 0.020, 0.16, 8), BLACK, {
    at: deckShifted([-0.17, 1.045, 0.47], 0.005),
    dir: deckNormal,
    name: "joystickBlackShaft",
  });

  const ball = b.part(new THREE.SphereGeometry(0.058, 12, 7), MAGENTA, {
    at: deckShifted([-0.17, 1.13, 0.47], 0.005),
    name: "joystickMagentaBall",
    flat: true,
  });
  glow(ball, 1.45);

  const ballHighlight = b.part(new THREE.SphereGeometry(0.013, 7, 5), PINK, {
    at: [-0.187, 1.157, 0.498],
    name: "joystickBallHighlight",
    flat: true,
  });
  glow(ballHighlight, 1.5);

  const buttonPositions: Array<readonly [number, number, number]> = [
    [-0.015, 0.979, 0.55],
    [0.09, 0.979, 0.55],
    [0.195, 0.979, 0.55],
    [0.30, 0.979, 0.55],
    [0.405, 0.979, 0.55],
    [0.315, 0.995, 0.425],
  ];
  const buttonColors = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];

  buttonPositions.forEach((p, i) => {
    const collar = b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.020, 10), BLACK, {
      at: deckShifted(p, 0.005),
      dir: deckNormal,
      name: `arcadeButtonCollar${i}`,
    });

    const cap = b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.022, 10), buttonColors[i], {
      at: deckShifted(p, 0.019),
      dir: deckNormal,
      name: `arcadeButtonCap${i}`,
    });
    glow(cap, 1.45);

    const insetColor = buttonColors[i] === CYAN ? PINK : CYAN;
    const inset = b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.005, 8), insetColor, {
      at: deckShifted(p, 0.034),
      dir: deckNormal,
      name: `arcadeButtonInset${i}`,
    });
    glow(inset, 1.3);
    void collar;
  });

  const leftArrow = b.extrude(
    [
      [0, 0.022],
      [0.034, 0],
      [0, -0.022],
      [0.009, 0],
    ],
    {
      at: [-0.025, 0.983, 0.438],
      x: [1, 0, 0],
      y: [0, 0.985, 0.174],
      thickness: 0.006,
      bevel: 0.001,
      color: CYAN,
      name: "deckArrowLeft",
    },
  );
  glow(leftArrow, 1.1);

  const rightArrow = b.extrude(
    [
      [0, 0.022],
      [-0.034, 0],
      [0, -0.022],
      [-0.009, 0],
    ],
    {
      at: [0.065, 0.983, 0.438],
      x: [1, 0, 0],
      y: [0, 0.985, 0.174],
      thickness: 0.006,
      bevel: 0.001,
      color: MAGENTA,
      name: "deckArrowRight",
    },
  );
  glow(rightArrow, 1.1);

  const buttonLabel = b.part(new THREE.BoxGeometry(0.07, 0.008, 0.018), LILAC, {
    at: [0.155, 0.986, 0.355],
    rotation: [10, 0, 0],
    name: "deckInstructionLabel",
    flat: true,
  });
  glow(buttonLabel, 0.75);
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addSpeakerGrille(b: Builder) {
  const origin = new THREE.Vector3(0, 1.635, 0.418);
  const normal = new THREE.Vector3(0, 0, 1);

  const point = (x: number, y: number, depth: number) =>
    origin
      .clone()
      .add(new THREE.Vector3(x, y, 0))
      .addScaledVector(normal, depth);

  const panelBox = (
    name: string,
    size: [number, number, number],
    x: number,
    y: number,
    depth: number,
    color: string,
    rotation: [number, number, number] = [0, 0, 0],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at: point(x, y, depth),
      rotation,
      flat: true,
      name,
      group: "s23-speaker-grille",
    });

  const frontButton = (
    name: string,
    radius: number,
    height: number,
    x: number,
    y: number,
    depth: number,
    color: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at: point(x, y, depth),
      dir: [0, 0, 1],
      flat: true,
      name,
      group: "s23-speaker-grille",
    });

  // Layered inset: the grille reads as a separate, slightly proud module rather
  // than a flat collection of marks on the original speaker panel.
  panelBox("s23SpeakerBackplate", [0.57, 0.112, 0.014], 0, 0, 0.030, BLACK);
  panelBox("s23SpeakerBackplateShadow", [0.535, 0.094, 0.008], 0, 0, 0.040, INK);
  panelBox("s23SpeakerInnerField", [0.486, 0.077, 0.008], 0, 0, 0.046, NAVY);

  // Violet frame with a two-colour end treatment.
  panelBox("s23SpeakerFrameTop", [0.525, 0.012, 0.014], 0, 0.050, 0.048, VIOLET);
  panelBox("s23SpeakerFrameBottom", [0.525, 0.012, 0.014], 0, -0.050, 0.048, VIOLET);
  panelBox("s23SpeakerFrameLeft", [0.012, 0.088, 0.014], -0.257, 0, 0.048, VIOLET);
  panelBox("s23SpeakerFrameRight", [0.012, 0.088, 0.014], 0.257, 0, 0.048, VIOLET);

  panelBox("s23SpeakerEndCapL", [0.031, 0.078, 0.018], -0.269, 0, 0.050, CYAN);
  panelBox("s23SpeakerEndCapR", [0.031, 0.078, 0.018], 0.269, 0, 0.050, CYAN);
  panelBox("s23SpeakerEndCapInsetL", [0.008, 0.044, 0.020], -0.269, 0, 0.061, BLUE);
  panelBox("s23SpeakerEndCapInsetR", [0.008, 0.044, 0.020], 0.269, 0, 0.061, MAGENTA);

  // Two clean rows of short, low-poly speaker slots. The tiny violet edge
  // catches the neon palette while the slot bodies remain almost black.
  const slitXs = [-0.198, -0.154, -0.110, -0.066, -0.022, 0.022, 0.066, 0.110, 0.154, 0.198];
  const rows = [-0.022, 0.022];

  rows.forEach((y, row) => {
    slitXs.forEach((x, i) => {
      const tilt = ((i + row) % 2 === 0 ? 1 : -1) * 4;
      panelBox(
        `s23SpeakerSlit${row}${i}`,
        [0.028, 0.012, 0.008],
        x,
        y,
        0.058,
        BLACK,
        [0, 0, tilt],
      );

      panelBox(
        `s23SpeakerSlitEdge${row}${i}`,
        [0.004, 0.008, 0.004],
        x - 0.010,
        y + (row === 0 ? 0.001 : -0.001),
        0.064,
        i % 2 === 0 ? VIOLET : BLUE,
        [0, 0, tilt],
      );
    });
  });

  // A small central sound-mark breaks up the strict rows without obscuring
  // their rhythm.
  panelBox("s23SpeakerCenterMarkA", [0.006, 0.023, 0.006], -0.010, 0, 0.068, MAGENTA);
  panelBox("s23SpeakerCenterMarkB", [0.006, 0.034, 0.006], 0, 0, 0.068, CYAN);
  panelBox("s23SpeakerCenterMarkC", [0.006, 0.018, 0.006], 0.010, 0, 0.068, MAGENTA);

  // Four faceted silver screws on violet washers.
  const screwPositions: Array<[number, number]> = [
    [-0.245, -0.042],
    [0.245, -0.042],
    [-0.245, 0.042],
    [0.245, 0.042],
  ];

  screwPositions.forEach(([x, y], i) => {
    frontButton(`s23SpeakerWasher${i}`, 0.017, 0.006, x, y, 0.059, VIOLET);
    frontButton(`s23SpeakerScrew${i}`, 0.009, 0.010, x, y, 0.066, SILVER);
    frontButton(`s23SpeakerScrewHighlight${i}`, 0.003, 0.012, x - 0.002, y + 0.002, 0.073, CREAM);
  });

  // Two little cyan locator lamps tucked into the lower corners.
  frontButton("s23SpeakerLocatorL", 0.006, 0.006, -0.225, -0.047, 0.069, CYAN);
  frontButton("s23SpeakerLocatorR", 0.006, 0.006, 0.225, -0.047, 0.069, CYAN);
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCoinDoorBadge(b: Builder) {
  const front = [0, 0, 1] as const;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | readonly [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      name,
      flat: true,
      ...options,
    });

  const coinCylinder = (
    radius: number,
    depth: number,
    at: readonly [number, number, number],
    color: string,
    name: string,
    segments = 8,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, depth, segments),
      color,
      at,
      name,
      { dir: front },
    );

  const coinCenter: readonly [number, number, number] = [0, 0.375, 0.466];

  // A chunky octagonal token, with a dark inset and an illustrated synthwave token face.
  const tokenOuter = coinCylinder(
    0.061,
    0.014,
    coinCenter,
    GOLD,
    "coinTokenOuter",
    8,
  );

  const tokenRim = part(
    new THREE.TorusGeometry(0.052, 0.005, 6, 8),
    GOLD,
    [coinCenter[0], coinCenter[1], 0.475],
    "coinTokenRim",
    { dir: front },
  );

  const tokenFaceTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#160d2d"/>
      <circle cx="64" cy="64" r="57" fill="#30205f" stroke="#ff62b5" stroke-width="5"/>
      <circle cx="64" cy="64" r="46" fill="none" stroke="#16e6ff" stroke-width="3"/>
      <path d="M64 18 L73 48 L105 48 L79 66 L88 98 L64 80 L40 98 L49 66 L23 48 L55 48 Z"
        fill="#ffbd42" stroke="#f6e7ce" stroke-width="3" stroke-linejoin="round"/>
      <path d="M64 34 L68 52 L86 52 L72 62 L77 80 L64 70 L51 80 L56 62 L42 52 L60 52 Z"
        fill="#ff237f"/>
      <path d="M18 106 L42 106 M86 106 L110 106" stroke="#16e6ff" stroke-width="4"/>
      <circle cx="64" cy="64" r="5" fill="#f6e7ce"/>
    </svg>`,
    { size: 128 },
  );

  const tokenFace = part(
    new THREE.CircleGeometry(0.047, 8),
    "#ffffff",
    [0, 0.375, 0.477],
    "coinTokenFace",
    {
      dir: front,
      axis: "z",
      texture: tokenFaceTexture,
    },
  );

  // Tiny raised edge marks give the badge a molded-plastic, cabinet-machined feel.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.052;
    const y = 0.375 + Math.cos(a) * 0.052;
    coinCylinder(
      0.004,
      0.004,
      [x, y, 0.48],
      i % 2 === 0 ? CYAN : MAGENTA,
      `coinTokenMark${i}`,
      6,
    );
  }

  // Brighter return-slot inserts sit on top of the existing purple housings.
  for (const [side, x] of [
    ["L", -0.115],
    ["R", 0.115],
  ] as const) {
    part(
      new THREE.BoxGeometry(0.108, 0.042, 0.012),
      BLACK,
      [x, 0.295, 0.466],
      `coinReturnInset${side}`,
    );
    const slot = part(
      new THREE.BoxGeometry(0.068, 0.012, 0.008),
      CYAN,
      [x, 0.295, 0.475],
      `coinReturnGlow${side}`,
    );
    glow(slot, 1.35);
    part(
      new THREE.BoxGeometry(0.05, 0.004, 0.004),
      CREAM,
      [x, 0.295, 0.48],
      `coinReturnHighlight${side}`,
    );
  }

  // Service lamp: a dark retaining washer, a faceted magenta cap, and a small pale glint.
  part(
    new THREE.TorusGeometry(0.026, 0.004, 6, 10),
    BLACK,
    [0, 0.31, 0.469],
    "serviceLightWasher",
    { dir: front },
  );

  const serviceCap = coinCylinder(
    0.019,
    0.009,
    [0, 0.31, 0.477],
    MAGENTA,
    "serviceLightCap",
    8,
  );
  glow(serviceCap, 1.5);

  part(
    new THREE.SphereGeometry(0.0055, 6, 4),
    PINK,
    [-0.006, 0.318, 0.484],
    "serviceLightGlint",
  );

  // Raised washers around the four existing silver door rivets.
  const rivets: readonly (readonly [number, number])[] = [
    [-0.165, 0.485],
    [0.165, 0.485],
    [-0.165, 0.235],
    [0.165, 0.235],
  ];

  rivets.forEach(([x, y], i) => {
    part(
      new THREE.TorusGeometry(0.014, 0.0028, 5, 8),
      SILVER,
      [x, y, 0.469],
      `coinRivetWasher${i}`,
      { dir: front },
    );
    part(
      new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6),
      CREAM,
      [x, y, 0.474],
      `coinRivetFace${i}`,
      { dir: front },
    );
  });

  // The CRT face is pitched back ten degrees, matching stage 1's screen housing.
  const N = new THREE.Vector3(0, 0.18, 0.98).normalize();
  const U = new THREE.Vector3(0, 0.98, -0.18).normalize();
  const X = new THREE.Vector3(1, 0, 0);
  const screenCenter = new THREE.Vector3(0, 1.31, 0.38);

  const screenPoint = (x: number, y: number, lift: number) =>
    screenCenter
      .clone()
      .addScaledVector(X, x)
      .addScaledVector(U, y)
      .addScaledVector(N, lift);

  const screenBox = (
    name: string,
    size: readonly [number, number, number],
    x: number,
    y: number,
    color: string,
    lift = 0.0018,
  ) => {
    const p = screenPoint(x, y, 0.009 + size[2] * 0.5 + lift);
    return part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, p, name, {
      rotation: [-10, 0, 0],
    });
  };

  // Four separate bars keep the inner violet CRT rim crisp and visibly recessed from the outer bezel.
  screenBox("crtInnerRimTop", [0.535, 0.012, 0.012], 0, 0.185, VIOLET);
  screenBox("crtInnerRimBottom", [0.535, 0.012, 0.012], 0, -0.185, VIOLET);
  screenBox("crtInnerRimLeft", [0.012, 0.35, 0.012], -0.275, 0, VIOLET);
  screenBox("crtInnerRimRight", [0.012, 0.35, 0.012], 0.275, 0, VIOLET);

  // Sparse scanlines, intentionally broken into thin luminous strips so the screen remains readable.
  const scanlineYs = [-0.125, 0, 0.125];
  scanlineYs.forEach((y, i) => {
    const scanline = screenBox(
      `crtScanline${i}`,
      [0.445, 0.006, 0.006],
      0,
      y,
      i === 1 ? BLUE : CYAN,
      0.0024,
    );
    glow(scanline, i === 1 ? 0.9 : 1.2);
  });

  // Small cyan corner ticks echo the cabinet's external neon trim without crowding the CRT.
  const cornerTicks = [
    [-0.245, 0.145, "L"],
    [0.245, 0.145, "R"],
    [-0.245, -0.145, "LL"],
    [0.245, -0.145, "RR"],
  ] as const;

  cornerTicks.forEach(([x, y, label], i) => {
    const tick = screenBox(
      `crtCornerTick${label}`,
      [0.022, 0.022, 0.006],
      x,
      y,
      i < 2 ? CYAN : MAGENTA,
      0.003,
    );
    glow(tick, 1.1);
  });

  // A floating magenta reflection diamond occupies only the upper-right corner of the glass.
  const reflectionBase = screenPoint(0.205, 0.125, 0.019);
  const reflection = b.extrude(
    [
      [0, 0.043],
      [0.043, 0],
      [0, -0.043],
      [-0.043, 0],
    ],
    {
      at: reflectionBase,
      x: [1, 0, 0],
      y: [0, 0.98, -0.18],
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 0,
      color: MAGENTA,
      name: "crtReflectionDiamond",
    },
  );
  glow(reflection, 1.15);

  const reflectionSpark = b.extrude(
    [
      [0, 0.017],
      [0.017, 0],
      [0, -0.017],
      [-0.017, 0],
    ],
    {
      at: screenPoint(0.205, 0.125, 0.024),
      x: [1, 0, 0],
      y: [0, 0.98, -0.18],
      thickness: 0.004,
      bevel: 0.001,
      smoothing: 0,
      color: CREAM,
      name: "crtReflectionSpark",
    },
  );
  glow(reflectionSpark, 1.3);

  // Two tiny dark mounting screws complete the otherwise clean CRT rim.
  for (const [x, y, i] of [
    [-0.285, 0.18, 0],
    [0.285, -0.18, 1],
  ] as const) {
    part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6),
      BLACK,
      screenPoint(x, y, 0.021),
      `crtMountScrew${i}`,
      {
        dir: N,
      },
    );
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, polyline } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addSideNeonRails(b: Builder) {
  type V3 = readonly [number, number, number];

  const railX = 0.498;
  const mountX = 0.487;
  const faceDir: V3 = [1, 0, 0];

  const mount = (name: string, at: V3, accent: string) => {
    b.part(new THREE.BoxGeometry(0.034, 0.075, 0.058), BLACK, {
      at,
      name,
      flat: true,
    });

    b.part(new THREE.BoxGeometry(0.041, 0.012, 0.014), accent, {
      at: [at[0] + 0.022, at[1] + 0.031, at[2] + 0.019],
      name: `${name}TopGlow`,
      flat: true,
    });

    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.009, 8), SILVER, {
      at: [at[0] + 0.026, at[1] - 0.023, at[2] - 0.018],
      dir: faceDir,
      name: `${name}Rivet`,
      flat: true,
    });
  };

  const neonSegment = (
    name: string,
    a: V3,
    c: V3,
    color: string,
  ) => {
    const tube = b.sweep(polyline([a, c]), 0.009, {
      color,
      section: "box",
      caps: "flat",
      name,
      group: "sideNeonRails",
    });
    glow(tube, 1.8);
  };

  const outerRail: V3[] = [
    [railX, 0.37, 0.362],
    [railX, 0.53, 0.362],
    [railX, 0.65, 0.378],
    [railX, 0.76, 0.395],
    [railX, 0.87, 0.395],
    [railX, 0.99, 0.351],
    [railX, 1.34, 0.351],
    [railX, 1.51, 0.354],
    [railX, 1.64, 0.387],
  ];

  const innerRail: V3[] = [
    [railX + 0.002, 0.37, 0.322],
    [railX + 0.002, 0.53, 0.322],
    [railX + 0.002, 0.65, 0.338],
    [railX + 0.002, 0.76, 0.355],
    [railX + 0.002, 0.87, 0.355],
    [railX + 0.002, 0.99, 0.311],
    [railX + 0.002, 1.34, 0.311],
    [railX + 0.002, 1.51, 0.314],
    [railX + 0.002, 1.64, 0.347],
  ];

  const outerColors = [MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA, CYAN];
  const innerColors = [CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA, CYAN, MAGENTA];

  for (let i = 0; i < outerRail.length - 1; i++) {
    neonSegment(
      `s25OuterRail${i}`,
      outerRail[i],
      outerRail[i + 1],
      outerColors[i],
    );
    neonSegment(
      `s25InnerRail${i}`,
      innerRail[i],
      innerRail[i + 1],
      innerColors[i],
    );
  }

  mount("s25MountLower", [mountX, 0.53, 0.342], CYAN);
  mount("s25MountMiddle", [mountX, 0.99, 0.331], MAGENTA);
  mount("s25MountUpper", [mountX, 1.51, 0.337], CYAN);

  const nodeColors = [PINK, LILAC, PINK, LILAC, PINK, LILAC, PINK];

  for (let i = 1; i < outerRail.length - 1; i++) {
    const p = outerRail[i];
    const cap = b.part(
      new THREE.SphereGeometry(0.014, 8, 5),
      nodeColors[i - 1],
      {
        at: [p[0] + 0.008, p[1], p[2]],
        name: `s25OuterNode${i}`,
        flat: true,
      },
    );
    glow(cap, 1.5);
  }

  const capPoints: Array<[V3, string, string]> = [
    [[railX + 0.009, 0.37, 0.362], CYAN, "Bottom"],
    [[railX + 0.009, 1.64, 0.387], MAGENTA, "Top"],
    [[railX + 0.011, 0.37, 0.322], MAGENTA, "InnerBottom"],
    [[railX + 0.011, 1.64, 0.347], CYAN, "InnerTop"],
  ];

  for (const [at, color, label] of capPoints) {
    const cap = b.part(
      new THREE.BoxGeometry(0.026, 0.035, 0.026),
      color,
      {
        at,
        name: `s25RailCap${label}`,
        flat: true,
      },
    );
    glow(cap, 1.7);
  }

  const chevron = (name: string, y: number, z: number, color: string) => {
    const accent = b.sweep(
      polyline([
        [railX + 0.012, y - 0.026, z + 0.015],
        [railX + 0.012, y, z - 0.012],
        [railX + 0.012, y + 0.026, z + 0.015],
      ]),
      0.006,
      {
        color,
        section: "box",
        caps: "flat",
        name,
        group: "sideNeonRails",
      },
    );
    glow(accent, 1.5);
  };

  chevron("s25ChevronLower", 0.78, 0.275, VIOLET);
  chevron("s25ChevronUpper", 1.28, 0.275, BLUE);

  b.part(new THREE.BoxGeometry(0.018, 0.17, 0.012), BLACK, {
    at: [railX - 0.004, 1.15, 0.266],
    rotation: [0, 0, 18],
    name: "s25DarkCableGuide",
    flat: true,
  });

  const guide = b.part(
    new THREE.BoxGeometry(0.025, 0.055, 0.014),
    GOLD,
    {
      at: [railX + 0.009, 1.145, 0.267],
      name: "s25CableGuideBadge",
      flat: true,
    },
  );
  glow(guide, 1.1);
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { coil } from "agentic-3js-builder/kits/clockwork";

export function addLowerVent(b: Builder) {
  // -------------------------------------------------------------------------------------------------------------
  // Lower ventilation grille: the stage-one grille is already present; these layers give it a stronger,
  // readable synthwave service-panel silhouette.

  box(b, "s2VentInset", [0.56, 0.13, 0.012], [0, 0.68, 0.454], BLACK);

  box(b, "s2VentFrameTop", [0.64, 0.018, 0.026], [0, 0.775, 0.46], MAGENTA);
  box(b, "s2VentFrameBottom", [0.64, 0.018, 0.026], [0, 0.585, 0.46], CYAN);
  box(b, "s2VentFrameLeft", [0.018, 0.19, 0.026], [-0.31, 0.68, 0.46], VIOLET);
  box(b, "s2VentFrameRight", [0.018, 0.19, 0.026], [0.31, 0.68, 0.46], VIOLET);

  // Seven actual cyan grille bars, lifted slightly above the darker stage-one bars.
  for (let i = 0; i < 7; i++) {
    const x = -0.235 + i * 0.078;
    box(b, `s2VentCyanSlat${i}`, [0.026, 0.092, 0.014], [x, 0.68, 0.468], CYAN);
    box(b, `s2VentSlatHighlight${i}`, [0.009, 0.072, 0.006], [x - 0.006, 0.68, 0.477], PINK);
  }

  // Angular airflow chevrons at the lower edge of the grille.
  const arrow: [number, number][] = [
    [0, 0],
    [0.032, 0.018],
    [0.058, 0.018],
    [0.027, -0.012],
    [0.027, -0.032],
    [0, -0.014],
  ];

  b.extrude(arrow, {
    at: [-0.23, 0.61, 0.47],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    color: MAGENTA,
    name: "s2AirChevronL",
  });

  b.extrude(arrow, {
    at: [0.105, 0.61, 0.47],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.006,
    bevel: 0.002,
    color: MAGENTA,
    name: "s2AirChevronR",
  });

  // Four faceted fasteners make the grille read as a removable arcade service panel.
  cylinder(b, "s2VentBoltTL", 0.012, 0.012, [-0.285, 0.752, 0.48], SILVER, [0, 0, 1], 8);
  cylinder(b, "s2VentBoltTR", 0.012, 0.012, [0.285, 0.752, 0.48], SILVER, [0, 0, 1], 8);
  cylinder(b, "s2VentBoltBL", 0.012, 0.012, [-0.285, 0.608, 0.48], SILVER, [0, 0, 1], 8);
  cylinder(b, "s2VentBoltBR", 0.012, 0.012, [0.285, 0.608, 0.48], SILVER, [0, 0, 1], 8);

  // A tiny printed service label adds a texture without stealing attention from the grille.
  const airflowLabel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32">
      <rect width="160" height="32" rx="4" fill="#090817"/>
      <path d="M8 23 L18 9 L28 23 M13 17 H23" fill="none" stroke="#16e6ff" stroke-width="4"/>
      <text x="38" y="22" font-family="monospace" font-weight="bold" font-size="15"
        letter-spacing="2" fill="#ff62b5">AIR//FLOW</text>
    </svg>`,
    { size: 128 },
  );

  b.part(new THREE.PlaneGeometry(0.19, 0.038), "#ffffff", {
    at: [0.105, 0.607, 0.481],
    dir: [0, 0, 1],
    axis: "z",
    texture: airflowLabel,
    name: "s2AirflowLabel",
  });

  // Layered power lamp on the right side of the vent panel.
  cylinder(b, "s2PowerLampSocket", 0.029, 0.012, [0.36, 0.63, 0.47], BLACK, [0, 0, 1], 8);
  cylinder(b, "s2PowerLampRing", 0.023, 0.009, [0.36, 0.63, 0.48], GOLD, [0, 0, 1], 8);
  sphere(b, "s2PowerLamp", 0.014, [0.36, 0.63, 0.488], GOLD, 8, 4);

  // -------------------------------------------------------------------------------------------------------------
  // Rear power cable: a short spring-like cable hangs close to the rear lower panel and ends in a chunky plug.

  box(b, "s2CableStrainRelief", [0.13, 0.075, 0.05], [0, 0.285, -0.477], BLACK);
  box(b, "s2CableStrainReliefTop", [0.095, 0.014, 0.058], [0, 0.326, -0.507], VIOLET);
  box(b, "s2CableStrainReliefBand", [0.105, 0.022, 0.062], [0, 0.285, -0.511], CYAN);

  // Short straight section visibly emerging from the strain relief.
  rod(b, "s2CableExit", [0, 0.285, -0.51], [0, 0.282, -0.526], 0.018, BLACK);

  // A compact two-and-a-half-turn coil. Bands are deliberately broad enough to read at cabinet scale.
  const powerCoil = coil(
    [0, 0.282, -0.526],
    [0.06, 0.125, -0.535],
    0.027,
    2.45,
  );

  b.sweep(powerCoil, 0.011, {
    color: BLACK,
    bands: [
      [0.22, VIOLET],
      [0.52, CYAN],
      [0.77, VIOLET],
    ],
    sides: 6,
    caps: "round",
    name: "s2PowerCable",
  });

  // Small terminal bridge to the plug, keeping the last coil turn visually connected.
  rod(b, "s2CableTerminal", [0.06, 0.125, -0.535], [0.078, 0.115, -0.548], 0.012, CYAN);

  box(b, "s2PowerPlugBody", [0.09, 0.064, 0.052], [0.092, 0.108, -0.554], BLACK, [0, -18, 0]);
  box(b, "s2PowerPlugCollar", [0.105, 0.022, 0.058], [0.075, 0.122, -0.544], VIOLET, [0, -18, 0]);
  box(b, "s2PowerPlugFace", [0.065, 0.045, 0.014], [0.111, 0.098, -0.585], NAVY, [0, -18, 0]);
  box(b, "s2PowerPlugStripe", [0.072, 0.012, 0.018], [0.108, 0.122, -0.582], CYAN, [0, -18, 0]);

  // Two small contacts on the plug face.
  cylinder(b, "s2PlugContactA", 0.009, 0.012, [0.092, 0.098, -0.596], GOLD, [0, 0, -1], 8);
  cylinder(b, "s2PlugContactB", 0.009, 0.012, [0.126, 0.098, -0.596], GOLD, [0, 0, -1], 8);

  // A tiny cable-identification tab beside the plug.
  box(b, "s2CableTag", [0.055, 0.026, 0.012], [0.025, 0.083, -0.559], MAGENTA, [0, -12, 0]);
  cylinder(b, "s2CableTagPin", 0.006, 0.014, [0.01, 0.083, -0.569], SILVER, [0, 0, -1], 6);
}
```