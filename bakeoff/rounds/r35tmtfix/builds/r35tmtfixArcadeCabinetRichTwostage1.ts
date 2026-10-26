import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "synthwave-arcade-cabinet",
  description:
    "A stylized 1980s upright arcade cabinet with a chunky angled silhouette, dark violet housing, cyan and magenta neon trim, marquee, control deck, screen, coin door, and synthwave proportions.",
};

export const PALETTE = {
  CABINET: "#21153f",
  CABINET_DARK: "#120d28",
  CABINET_SIDE: "#34205c",
  EDGE_PURPLE: "#6e35b7",
  MAGENTA: "#ff237f",
  MAGENTA_DARK: "#9b155d",
  CYAN: "#20e7ed",
  CYAN_DARK: "#138fa7",
  SCREEN: "#090b24",
  SCREEN_BLUE: "#152a68",
  BLACK: "#070712",
  METAL: "#8d91ad",
  METAL_DARK: "#39364f",
  COIN: "#f7bb52",
  WHITE: "#f4efff",
  ORANGE: "#ff6b38",
  FLOOR: "#24152e",
} as const;

export const REQUESTS = [
  {
    id: "marqueeLogo",
    kind: "add",
    part: "marqueeFace",
    what: "Large glowing SYNTHWAVE arcade logo across the marquee: angular 1980s lettering in CYAN, MAGENTA, and WHITE, with a dark outline and tiny starbursts.",
    at: [0, 1.78, 0.39],
    normal: [0, 0, 1],
    bone: null,
    room: [0.62, 0.2, 0.025],
  },
  {
    id: "screenScanlines",
    kind: "texture",
    part: "screenSurface",
    what: "Paint the screen as a deep indigo CRT display with horizontal CYAN scanlines, subtle MAGENTA bloom, a bright pixel horizon, and a tiny retro game HUD.",
  },
  {
    id: "controlButtons",
    kind: "add",
    part: "controlDeck",
    what: "On the control deck, add a black joystick pedestal with a glowing MAGENTA ball, six chunky arcade buttons alternating CYAN and MAGENTA, and two small START buttons.",
    at: [0, 0.96, 0.38],
    normal: [0, 1, 0],
    bone: null,
    room: [0.58, 0.12, 0.3],
  },
  {
    id: "coinDoor",
    kind: "add",
    part: "coinPanel",
    what: "Decorate the coin panel with two brass coin slots, a bright CYAN return button, small MAGENTA indicator lamps, and engraved 1980s arcade lettering.",
    at: [0, 0.53, 0.405],
    normal: [0, 0, 1],
    bone: null,
    room: [0.34, 0.3, 0.025],
  },
  {
    id: "sideLightningL",
    kind: "add",
    part: "leftSidePanel",
    what: "A long angular MAGENTA lightning-bolt neon graphic running up the cabinet side, with a thin CYAN offset glow and small geometric star decals.",
    at: [0.405, 1.02, 0.02],
    normal: [1, 0, 0],
    bone: null,
    room: [0.018, 1.4, 0.58],
  },
  {
    id: "sideLightningR",
    kind: "add",
    part: "rightSidePanel",
    what: "Mirror the long angular MAGENTA lightning-bolt neon graphic on the opposite cabinet side, with a thin CYAN offset glow and small geometric star decals.",
    at: [-0.405, 1.02, 0.02],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.018, 1.4, 0.58],
  },
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabinetTop",
    what: "A narrow synthwave light bar across the cabinet roof: a dark housing, six alternating CYAN and MAGENTA lamps, and two small chrome brackets.",
    at: [0, 1.94, 0.02],
    normal: [0, 1, 0],
    bone: null,
    room: [0.62, 0.11, 0.12],
  },
  {
    id: "ventGrille",
    kind: "add",
    part: "rearTop",
    what: "A compact rear ventilation grille made from seven evenly spaced dark METAL slats with CYAN end caps, inset into the upper rear housing.",
    at: [0, 1.48, -0.39],
    normal: [0, 0, -1],
    bone: null,
    room: [0.45, 0.18, 0.025],
  },
  {
    id: "powerCable",
    kind: "add",
    part: "cabinetRear",
    what: "A thick coiled BLACK power cable dropping from the rear, with a MAGENTA plug head and a small CYAN strain-relief ring.",
    at: [0.27, 0.24, -0.4],
    normal: [0, 0, -1],
    bone: null,
    room: [0.22, 0.48, 0.12],
  },
  {
    id: "floorGlow",
    kind: "add",
    part: "basePlinth",
    what: "A thin glowing floor halo beneath the cabinet, a rounded rectangular strip alternating CYAN and MAGENTA like reflected neon on a dark arcade floor.",
    at: [0, 0.035, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.95, 0.02, 0.95],
  },
  {
    id: "sidePanelTexture",
    kind: "texture",
    part: "leftSidePanel",
    what: "Paint the side panel with a deep violet-to-purple synthwave gradient, hard-edged CYAN and MAGENTA geometric bands, tiny stars, and a subtle black grid. Keep the large central area readable for the lightning graphic.",
  },
  {
    id: "cabinetFrontTexture",
    kind: "texture",
    part: "frontLower",
    what: "Add a restrained dark purple synthwave panel pattern to the lower front: thin MAGENTA corner lines, CYAN pinstripes, and a small centered retro badge, leaving the coin panel clear.",
  },
  {
    id: "controlDeckTexture",
    kind: "texture",
    part: "controlDeck",
    what: "Paint the control deck BLACK with a glossy violet edge, fine CYAN pinstripes, and a subtle diagonal MAGENTA circuit pattern around the button area.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "synthwave-arcade-cabinet", detail: 1 });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      name,
    });

  // Broad side silhouette: the characteristic upright cabinet profile has a heavy lower body,
  // a sloping control section, and a projecting marquee crown.
  const sideProfile: ([number, number] | [number, number, "sharp"])[] = [
    [-0.43, 0.06],
    [0.43, 0.06],
    [0.43, 1.24],
    [0.34, 1.39],
    [0.34, 1.77],
    [-0.28, 1.77],
    [-0.39, 1.63],
    [-0.43, 1.45],
  ];

  for (const side of [-1, 1]) {
    b.extrude(sideProfile, {
      at: [side * 0.39, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      smoothing: 0,
      color: PALETTE.CABINET_SIDE,
      name: side > 0 ? "leftSidePanel" : "rightSidePanel",
    });

    // Thick luminous edge pieces leave the broad purple side surface uncluttered.
    box(
      [0.018, 1.23, 0.026],
      [side * 0.418, 0.78, 0.05],
      PALETTE.EDGE_PURPLE,
      side > 0 ? "leftEdgeRail" : "rightEdgeRail",
    );
    box(
      [0.02, 0.035, 0.67],
      [side * 0.421, 1.76, 0.04],
      PALETTE.MAGENTA,
      side > 0 ? "leftMarqueeEdge" : "rightMarqueeEdge",
    );
  }

  // Main inner shell, kept behind the side cheeks.
  box([0.73, 0.78, 0.72], [0, 0.47, -0.02], PALETTE.CABINET_DARK, "cabinetLowerShell");
  box([0.72, 0.53, 0.53], [0, 1.22, -0.015], PALETTE.CABINET, "cabinetUpperShell");
  box([0.72, 0.13, 0.62], [0, 1.73, -0.015], PALETTE.CABINET_DARK, "cabinetTop");

  // Lower front apron and its inset decorative panel.
  box([0.66, 0.56, 0.055], [0, 0.49, 0.365], PALETTE.CABINET, "frontLower");
  box([0.48, 0.31, 0.018], [0, 0.54, 0.399], PALETTE.CABINET_DARK, "coinPanel");
  box([0.53, 0.035, 0.026], [0, 0.83, 0.405], PALETTE.MAGENTA_DARK, "lowerFrontTrim");
  box([0.53, 0.025, 0.022], [0, 0.205, 0.405], PALETTE.CYAN_DARK, "lowerFrontBaseTrim");

  // Coin door frame and simple flat coin door, intentionally clear for Stage 2.
  box([0.38, 0.27, 0.025], [0, 0.53, 0.418], PALETTE.METAL_DARK, "coinDoorFrame");
  box([0.31, 0.195, 0.018], [0, 0.53, 0.435], PALETTE.BLACK, "coinDoorFace");
  box([0.13, 0.012, 0.018], [0, 0.615, 0.447], PALETTE.METAL, "coinDoorTopRail");
  box([0.13, 0.012, 0.018], [0, 0.445, 0.447], PALETTE.METAL_DARK, "coinDoorBottomRail");

  // Sloped control deck: its front lip is slightly higher than the rear.
  box([0.69, 0.12, 0.34], [0, 0.91, 0.31], PALETTE.CABINET_DARK, "controlDeck", [8, 0, 0]);
  box([0.68, 0.07, 0.025], [0, 0.865, 0.48], PALETTE.EDGE_PURPLE, "controlFrontLip", [8, 0, 0]);
  box([0.57, 0.018, 0.025], [0, 0.984, 0.315], PALETTE.CYAN_DARK, "controlRearTrim", [8, 0, 0]);

  // Placeholder joystick and button islands. These are deliberately simple, with room around them.
  box([0.12, 0.025, 0.11], [-0.205, 0.985, 0.33], PALETTE.BLACK, "joystickBase", [8, 0, 0]);
  cyl(0.025, 0.13, [-0.205, 1.065, 0.34], PALETTE.METAL_DARK, "joystickStem", 8);
  cyl(0.052, 0.052, [-0.205, 1.14, 0.34], PALETTE.MAGENTA, "joystickBall", 10);

  const buttonXs = [-0.055, 0.025, 0.105, 0.185];
  buttonXs.forEach((x, i) => {
    cyl(
      0.026,
      0.018,
      [x, 1.0, 0.36],
      i % 2 === 0 ? PALETTE.CYAN : PALETTE.MAGENTA,
      `controlButton${i + 1}`,
      10,
      [8, 0, 0],
    );
  });
  cyl(0.018, 0.016, [0.22, 0.996, 0.27], PALETTE.ORANGE, "startButtonA", 10, [8, 0, 0]);
  cyl(0.018, 0.016, [0.27, 0.996, 0.27], PALETTE.CYAN, "startButtonB", 10, [8, 0, 0]);

  // Screen hood and thick CRT bezel.
  box([0.64, 0.47, 0.11], [0, 1.37, 0.275], PALETTE.BLACK, "screenHousing", [-8, 0, 0]);
  box([0.56, 0.38, 0.075], [0, 1.36, 0.345], PALETTE.METAL_DARK, [-8, 0, 0]);
  box([0.51, 0.325, 0.038], [0, 1.36, 0.39], PALETTE.BLACK, "screenBezel", [-8, 0, 0]);

  // The named flat screen surface is intentionally plain for scanline artwork.
  b.part(new THREE.PlaneGeometry(0.46, 0.285), PALETTE.SCREEN, {
    at: [0, 1.36, 0.414],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-8, 0, 0],
    name: "screenSurface",
  });

  // Small bezel corner bolts and a lower CRT highlight.
  for (const x of [-0.27, 0.27]) {
    for (const y of [1.18, 1.54]) {
      cyl(0.012, 0.012, [x, y, 0.421], PALETTE.CYAN, `screenBolt${x}${y}`, 8, [90, 0, 0]);
    }
  }
  box([0.42, 0.018, 0.018], [0, 1.155, 0.43], PALETTE.MAGENTA_DARK, "screenLowerGlow");

  // Projecting marquee crown.
  box([0.69, 0.22, 0.09], [0, 1.76, 0.335], PALETTE.CABINET_DARK, "marqueeHousing", [-3, 0, 0]);
  box([0.61, 0.15, 0.025], [0, 1.78, 0.392], PALETTE.MAGENTA_DARK, "marqueeFrame", [-3, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.56, 0.105), PALETTE.SCREEN_BLUE, {
    at: [0, 1.785, 0.412],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [-3, 0, 0],
    name: "marqueeFace",
  });
  box([0.62, 0.018, 0.02], [0, 1.865, 0.41], PALETTE.CYAN, "marqueeTopGlow");
  box([0.62, 0.018, 0.02], [0, 1.705, 0.41], PALETTE.MAGENTA, "marqueeBottomGlow");

  // Rear footed plinth and four low-profile feet. The lowest geometry remains above y=0.
  box([0.78, 0.09, 0.76], [0, 0.09, -0.015], PALETTE.BLACK, "basePlinth");
  box([0.72, 0.025, 0.7], [0, 0.145, 0.015], PALETTE.CYAN_DARK, "baseNeonBand");
  for (const x of [-0.29, 0.29]) {
    for (const z of [-0.27, 0.27]) {
      cyl(0.055, 0.045, [x, 0.035, z], PALETTE.BLACK, `foot${x}${z}`, 8);
    }
  }

  // Side-facing geometric trim, kept narrow so the future lightning artwork has a clear field.
  for (const side of [-1, 1]) {
    box([0.012, 0.82, 0.025], [side * 0.426, 0.89, 0.36], PALETTE.CYAN, side > 0 ? "leftSideCyan" : "rightSideCyan");
    box([0.012, 0.025, 0.48], [side * 0.426, 1.34, 0.055], PALETTE.MAGENTA, side > 0 ? "leftSideMagenta" : "rightSideMagenta");
  }

  // A dark rear cap completes the readable cabinet silhouette.
  box([0.72, 1.18, 0.035], [0, 0.84, -0.405], PALETTE.CABINET_DARK, "cabinetRear");
  box([0.55, 0.022, 0.025], [0, 1.55, -0.43], PALETTE.EDGE_PURPLE, "rearTopTrim");
  box([0.62, 0.022, 0.025], [0, 0.2, -0.43], PALETTE.MAGENTA_DARK, "rearBottomTrim");

  for (const add of STAGE2) add(b);
  return b.root;
}
