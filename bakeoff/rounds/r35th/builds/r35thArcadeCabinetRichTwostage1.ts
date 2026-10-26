import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
