import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Neon Rider Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet rebuilt in synthwave style: dark purple cabinet, glowing neon marquee and side art, a lit CRT screen and a chrome-trimmed control deck."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hullPurple: "#2a1e4a",
  hullDark: "#191030",
  marqueeBlack: "#120a24",
  neonPink: "#ff2e88",
  neonCyan: "#2ff3ff",
  neonPurple: "#a24bff",
  sunsetOrange: "#ff7a1e",
  sunsetYellow: "#ffd23e",
  gridBlue: "#1c3a72",
  chrome: "#cfd6e8",
  chromeDark: "#4a4f66",
  screenBlack: "#0b0f1e",
  screenGlow: "#7df9ff",
  buttonRed: "#ff3b4a",
  buttonWhite: "#f2f2f2",
  coinSteel: "#8a8fa3",
  kickBlack: "#0c0c12",
};
const M = {
  deckShelf: [0, 0.95, 0.12] as [number, number, number],
  deckFrontEdge: [0, 0.88, 0.38] as [number, number, number],
  screenPlane: [0, 1.22, 0.28] as [number, number, number],
  speakerStrip: [0, 1.52, 0.26] as [number, number, number],
  marqueeBase: [0, 1.5, 0.16] as [number, number, number],
  coinPanelTop: [0, 0.85, 0.4] as [number, number, number],
  kickBase: [0, 0.1, 0.42] as [number, number, number],
  sideFaceR: [0.42, 0.8, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // cabinetHull
  (() => {
function buildCabinetHull({ b, J, P, M }: Ctx) {
  const bone = J?.body;
  const purple = P.hullPurple;
  const dark = P.hullDark;
  const chrome = P.chrome;
  const chromeDark = P.chromeDark;
  const kick = P.kickBlack;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      ...(bone ? { bone } : {}),
      ...extra,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
    extra: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      rotation ? { rotation, ...extra } : extra,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    segments = 8,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      { rotation },
    );

  // ---------------------------------------------------------------------------
  // Shadow plinth and the slightly oversized bottom rail. These sink only
  // fractions of a centimetre into the floor and make the cabinet feel heavy.
  // ---------------------------------------------------------------------------

  box([0.88, 0.075, 0.91], kick, [0, 0.0375, 0.005]);
  box([0.82, 0.055, 0.86], dark, [0, 0.095, 0.005]);
  box([0.76, 0.026, 0.865], chromeDark, [0, 0.122, 0.008]);

  // Two discreet levelling feet / castor shadows.
  cylinder(0.075, 0.025, kick, [-0.31, 0.018, -0.25], [0, 0, 0], 8);
  cylinder(0.075, 0.025, kick, [0.31, 0.018, -0.25], [0, 0, 0], 8);

  // ---------------------------------------------------------------------------
  // Main cabinet shell. It is deliberately assembled as thick side cheeks,
  // a sloped back, and header blocks rather than a single featureless box.
  // This leaves the front cavity readable when the screen and deck are added.
  // ---------------------------------------------------------------------------

  // Left and right plywood cheeks, tapering subtly toward the crown.
  box([0.075, 1.72, 0.84], purple, [-0.382, 0.88, -0.005], [0.018, 0, 0]);
  box([0.075, 1.72, 0.84], purple, [0.382, 0.88, -0.005], [-0.018, 0, 0]);

  // Dark inner faces visible around the recessed CRT.
  box([0.68, 0.62, 0.045], dark, [0, 1.25, 0.325], [-0.09, 0, 0]);
  box([0.70, 0.16, 0.05], dark, [0, 0.87, 0.34], [0.08, 0, 0]);

  // Rear panel leans rearward as it rises. The broad panel is split into
  // overlapping sections so the silhouette has crisp, low-poly planes.
  box([0.72, 0.78, 0.07], dark, [0, 0.405, -0.405], [-0.018, 0, 0]);
  box([0.72, 0.55, 0.07], purple, [0, 1.05, -0.385], [-0.105, 0, 0]);
  box([0.72, 0.47, 0.07], purple, [0, 1.53, -0.315], [-0.16, 0, 0]);

  // Lower front sill and upper screen/header ledges.
  box([0.70, 0.08, 0.12], purple, [0, 0.84, 0.355], [0.06, 0, 0]);
  box([0.72, 0.075, 0.12], purple, [0, 1.53, 0.205], [-0.12, 0, 0]);
  box([0.72, 0.07, 0.18], dark, [0, 1.70, 0.155], [-0.18, 0, 0]);

  // Crown cap, projecting just enough to catch a highlight above the marquee.
  box([0.82, 0.065, 0.42], dark, [0, 1.815, -0.055], [-0.16, 0, 0]);
  box([0.76, 0.028, 0.38], chromeDark, [0, 1.843, -0.05], [-0.16, 0, 0]);

  // ---------------------------------------------------------------------------
  // Back ventilation: thin recessed black slots on the upper rear plane.
  // They are deliberately separate geometry so the vents remain legible at
  // thumbnail scale and can catch a little ambient occlusion.
  // ---------------------------------------------------------------------------

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = -0.24 + col * 0.08;
      const y = 1.25 + row * 0.075;
      box(
        [0.048, 0.018, 0.012],
        kick,
        [x, y, -0.424],
        [-0.11, 0, 0],
      );
    }
  }

  // A pair of larger lower service vents.
  box([0.22, 0.022, 0.014], kick, [-0.17, 0.29, -0.445], [-0.02, 0, 0]);
  box([0.22, 0.022, 0.014], kick, [0.17, 0.29, -0.445], [-0.02, 0, 0]);

  // ---------------------------------------------------------------------------
  // Chrome T-molding. Rods use low-sided sections for a convincing extruded
  // plastic/chrome edge instead of smooth decorative tubes.
  // ---------------------------------------------------------------------------

  const trim = (a: [number, number, number], c: [number, number, number], r = 0.012) =>
    b.rod(a, c, r, {
      color: chrome,
      ...(bone ? { bone } : {}),
      section: { ngon: 6 },
      caps: "round",
    });

  // Front vertical edge molding, broken at the control deck so the joint reads.
  trim([-0.424, 0.10, 0.405], [-0.424, 0.83, 0.405], 0.014);
  trim([0.424, 0.10, 0.405], [0.424, 0.83, 0.405], 0.014);
  trim([-0.424, 0.98, 0.335], [-0.424, 1.49, 0.205], 0.012);
  trim([0.424, 0.98, 0.335], [0.424, 1.49, 0.205], 0.012);

  // Lower front and deck shelf edge moldings.
  trim([-0.385, 0.125, 0.405], [0.385, 0.125, 0.405], 0.012);
  trim([-0.405, 0.845, 0.405], [0.405, 0.845, 0.405], 0.013);
  trim([-0.405, 0.965, 0.31], [0.405, 0.965, 0.31], 0.012);

  // Marquee perimeter: a trapezoidal chrome outline, set proud of the dark header.
  trim([-0.37, 1.505, 0.205], [0.37, 1.505, 0.205], 0.011);
  trim([-0.37, 1.505, 0.205], [-0.37, 1.79, 0.13], 0.011);
  trim([0.37, 1.505, 0.205], [0.37, 1.79, 0.13], 0.011);
  trim([-0.37, 1.79, 0.13], [0.37, 1.79, 0.13], 0.011);

  // Small corner caps emphasize the molded construction.
  for (const s of [-1, 1]) {
    cylinder(0.018, 0.025, chromeDark, [s * 0.424, 0.86, 0.405], [0, 0, Math.PI / 2], 6);
    cylinder(0.016, 0.022, chromeDark, [s * 0.375, 1.50, 0.215], [0, Math.PI / 2, 0], 6);
  }

  // A narrow dark cavity lip behind the future CRT, preventing the shell from
  // looking like a painted flat wall around the screen.
  box([0.64, 0.035, 0.035], kick, [0, 1.515, 0.345], [-0.10, 0, 0]);
  box([0.035, 0.47, 0.04], kick, [-0.345, 1.25, 0.335], [-0.09, 0, 0]);
  box([0.035, 0.47, 0.04], kick, [0.345, 1.25, 0.335], [-0.09, 0, 0]);
}
    return buildCabinetHull;
  })(),
  // screenAndMarquee
  (() => {
function buildScreenAndMarquee({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const C = {
    black: P.marqueeBlack,
    screen: P.screenBlack,
    cyan: P.neonCyan,
    pink: P.neonPink,
    purple: P.neonPurple,
    orange: P.sunsetOrange,
    yellow: P.sunsetYellow,
    chrome: P.chrome,
    chromeDark: P.chromeDark,
    steel: P.coinSteel,
    glow: P.screenGlow,
    blue: P.gridBlue,
  };

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone,
      at,
      rotation,
      name,
      group: "screenAndMarquee",
    });

  const cyl = (
    name: string,
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    rotation: [number, number, number] = [Math.PI / 2, 0, 0],
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone,
      at,
      rotation,
      name,
      group: "screenAndMarquee",
    });

  const panel = (
    name: string,
    width: number,
    height: number,
    at: [number, number, number],
    color: string,
    normal: [number, number, number] = [0, 0, 1],
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), color, {
      bone,
      at,
      dir: normal,
      axis: "z",
      name,
      group: "screenAndMarquee",
    });

  // Recessed CRT cavity and stepped bezel.
  box("crtCavity", [0.66, 0.57, 0.12], [0, 1.24, 0.285], C.black);
  box("crtBezelOuter", [0.62, 0.53, 0.055], [0, 1.25, 0.355], C.chromeDark);
  box("crtBezelInner", [0.555, 0.465, 0.062], [0, 1.25, 0.388], C.black);

  const glass = panel("crtGlass", 0.505, 0.415, [0, 1.25, 0.426], C.glow);
  glow(glass, 1.35);

  // CRT glass corners and phosphor glow blocks.
  for (const s of [-1, 1]) {
    box("crtCorner", [0.035, 0.035, 0.012], [s * 0.235, 1.435, 0.438], C.cyan);
    box("crtCorner", [0.035, 0.035, 0.012], [s * 0.235, 1.065, 0.438], C.pink);
  }

  // Scanlines, seated just in front of the glass.
  for (let i = 0; i < 9; i++) {
    const y = 1.08 + i * 0.043;
    const line = box("crtScanline", [0.47, 0.006, 0.008], [0, y, 0.442], i % 3 === 0 ? C.blue : C.screen);
    if (i === 0 || i === 4 || i === 8) glow(line, 0.35);
  }

  // Neon bezel rails.
  box("bezelRailTop", [0.57, 0.014, 0.018], [0, 1.505, 0.445], C.pink);
  box("bezelRailBottom", [0.57, 0.014, 0.018], [0, 0.995, 0.445], C.cyan);
  box("bezelRailLeft", [0.014, 0.47, 0.018], [-0.285, 1.25, 0.445], C.cyan);
  box("bezelRailRight", [0.014, 0.47, 0.018], [0.285, 1.25, 0.445], C.pink);

  // Four chunky corner screws.
  for (const x of [-0.275, 0.275]) {
    for (const y of [1.04, 1.46]) {
      cyl("bezelScrew", 0.014, 0.012, [x, y, 0.46], C.steel, [Math.PI / 2, 0, 0], 8);
    }
  }

  // Tiny arcade status lights under the screen.
  for (const [x, color] of [
    [-0.13, C.pink],
    [0, C.yellow],
    [0.13, C.cyan],
  ] as [number, string][]) {
    const lamp = cyl("statusLamp", 0.012, 0.012, [x, 0.985, 0.455], color, [Math.PI / 2, 0, 0], 10);
    glow(lamp, 1.5);
  }

  // Speaker grille strip.
  box("speakerRecess", [0.61, 0.135, 0.065], [0, 1.58, 0.285], C.black);
  box("speakerFace", [0.565, 0.105, 0.018], [0, 1.58, 0.326], C.chromeDark);

  // Perforation pattern.
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 15; col++) {
      const x = -0.245 + col * 0.035;
      const y = 1.545 + row * 0.035;
      cyl("speakerHole", 0.006, 0.006, [x, y, 0.341], C.black, [Math.PI / 2, 0, 0], 6);
    }
  }
  for (const x of [-0.31, 0.31]) {
    cyl("speakerRingOuter", 0.055, 0.018, [x, 1.58, 0.345], C.chrome, [Math.PI / 2, 0, 0], 16);
    cyl("speakerRingInner", 0.038, 0.021, [x, 1.58, 0.357], C.black, [Math.PI / 2, 0, 0], 16);
    cyl("speakerCone", 0.024, 0.012, [x, 1.58, 0.368], C.chromeDark, [Math.PI / 2, 0, 0], 12);
  }

  // Marquee plane: normal points slightly upward because the panel leans back.
  const marqueeNormal: [number, number, number] = [0, -0.259, 0.966];
  const marqueeCenter: [number, number, number] = [0, 1.69, 0.265];

  box("marqueeShell", [0.68, 0.34, 0.08], [0, 1.69, 0.235], C.black, [Math.PI / 2 - 0.262, 0, 0]);
  const marqueeFace = panel("marqueeWindow", 0.625, 0.285, marqueeCenter, C.black, marqueeNormal);
  glow(marqueeFace, 0.25);

  // Chrome perimeter built as four narrow floating rails.
  const tilt = -0.262;
  for (const x of [-0.326, 0.326]) {
    box("marqueeSideTrim", [0.014, 0.32, 0.018], [x, 1.69, 0.305], C.chrome, [tilt, 0, 0]);
  }
  box("marqueeTopTrim", [0.665, 0.014, 0.018], [0, 1.855, 0.305], C.chrome, [tilt, 0, 0]);
  box("marqueeBottomTrim", [0.665, 0.014, 0.018], [0, 1.525, 0.305], C.chrome, [tilt, 0, 0]);

  // Glowing sunset disk, made from horizontal bands.
  const sunX = 0;
  const sunY = 1.70;
  const sunZ = 0.318;
  const sunBands = [
    [0.18, 0.050, C.pink],
    [0.15, 0.042, C.orange],
    [0.12, 0.034, C.yellow],
    [0.09, 0.027, C.orange],
    [0.06, 0.020, C.pink],
  ] as const;
  for (let i = 0; i < sunBands.length; i++) {
    const [w, h, color] = sunBands[i];
    const y = sunY + 0.055 - i * 0.024;
    const band = panel("marqueeSunBand", w, h, [sunX, y, sunZ], color, marqueeNormal);
    glow(band, 1.8);
  }

  // Horizon glow.
  const horizon = panel("marqueeHorizon", 0.55, 0.012, [0, 1.625, 0.324], C.orange, marqueeNormal);
  glow(horizon, 1.5);

  // Perspective grid: horizontal receding lines and converging cyan rays.
  for (let i = 0; i < 5; i++) {
    const y = 1.56 + i * 0.015;
    const width = 0.18 + i * 0.105;
    const gridLine = panel("marqueeGridH", width, 0.006, [0, y, 0.326], C.cyan, marqueeNormal);
    glow(gridLine, 1.2);
  }
  for (let i = -4; i <= 4; i++) {
    const ray = box(
      "marqueeGridRay",
      [0.006, 0.23, 0.006],
      [i * 0.055, 1.585, 0.327],
      C.cyan,
      [tilt, 0, i * 0.045],
    );
    glow(ray, 0.9);
  }

  // Chrome-edged title bar with a readable neon title abstraction.
  box("titleBarChrome", [0.43, 0.064, 0.018], [0, 1.785, 0.335], C.chrome, [tilt, 0, 0]);
  box("titleBar", [0.405, 0.043, 0.022], [0, 1.785, 0.349], C.purple, [tilt, 0, 0]);
  for (let i = -4; i <= 4; i++) {
    const glyph = box(
      "titleGlyph",
      [0.025, i % 2 === 0 ? 0.028 : 0.018, 0.008],
      [i * 0.043, 1.785, 0.364],
      i % 2 === 0 ? C.cyan : C.pink,
      [tilt, 0, 0],
    );
    glow(glyph, 1.7);
  }

  // Top cap and small neon edge accents.
  box("marqueeTopCap", [0.72, 0.035, 0.11], [0, 1.855, 0.235], C.chromeDark, [tilt, 0, 0]);
  box("marqueeTopGlow", [0.60, 0.012, 0.012], [0, 1.875, 0.315], C.pink, [tilt, 0, 0]);
  box("marqueeLowerGlow", [0.59, 0.010, 0.012], [0, 1.535, 0.34], C.cyan, [tilt, 0, 0]);
}
    return buildScreenAndMarquee;
  })(),
  // controlDeck
  (() => {
function buildControlDeck({ b, J, P, M }: any) {
  const hull = P.hullPurple ?? P.hull ?? "#2a1e4a";
  const dark = P.hullDark ?? "#191030";
  const chrome = P.chrome ?? "#cfd6e8";
  const chromeDark = P.chromeDark ?? "#4a4f66";
  const pink = P.neonPink ?? "#ff2e88";
  const cyan = P.neonCyan ?? "#2ff3ff";
  const orange = P.sunsetOrange ?? "#ff7a1e";
  const yellow = P.sunsetYellow ?? "#ffd23e";
  const red = P.buttonRed ?? "#ff3b4a";
  const white = P.buttonWhite ?? "#f2f2f2";
  const black = P.kickBlack ?? "#0c0c12";

  const bone = J?.body;
  const deckAngle = THREE.MathUtils.degToRad(12);
  const deckCenter = new THREE.Vector3(0, 0.91, 0.215);

  const add = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3 | number[], opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | number[],
    extra: any = {},
  ) => add(new THREE.BoxGeometry(...size), color, at, { rotation: [12, 0, 0], ...extra });

  // Main sloping control shelf, with a dark underside shadow and a slightly smaller inset plate.
  box([0.82, 0.055, 0.40], dark, deckCenter, { name: "controlDeck.underside" });
  box([0.78, 0.035, 0.365], hull, [0, 0.935, 0.215], { name: "controlDeck.plate" });

  // Front fascia and its layered synthwave racing stripes.
  add(new THREE.BoxGeometry(0.82, 0.075, 0.035), chromeDark, [0, 0.858, 0.407], {
    rotation: [0, 0, 0],
    name: "controlDeck.frontFascia",
  });
  add(new THREE.BoxGeometry(0.76, 0.012, 0.012), orange, [0, 0.895, 0.431], {
    rotation: [0, 0, 0],
    name: "controlDeck.frontStripeOrange",
  });
  add(new THREE.BoxGeometry(0.76, 0.009, 0.014), yellow, [0, 0.878, 0.438], {
    rotation: [0, 0, 0],
    name: "controlDeck.frontStripeYellow",
  });
  add(new THREE.BoxGeometry(0.76, 0.008, 0.016), pink, [0, 0.864, 0.441], {
    rotation: [0, 0, 0],
    name: "controlDeck.frontStripePink",
  });

  // Side chrome rails follow the sloping deck edges.
  for (const s of [-1, 1]) {
    const rail = b.rod(
      [s * 0.398, 0.985, 0.035],
      [s * 0.398, 0.875, 0.407],
      0.012,
      { color: chrome, bone, caps: "round", name: `controlDeck.sideRail${s}` },
    );
    const inner = b.rod(
      [s * 0.373, 0.967, 0.055],
      [s * 0.373, 0.865, 0.392],
      0.006,
      { color: cyan, bone, caps: "flat", name: `controlDeck.cyanEdge${s}` },
    );
    void rail;
    void inner;
  }

  // Cyan perimeter inlay: rear strip, front strip and short returns.
  add(new THREE.BoxGeometry(0.67, 0.008, 0.009), cyan, [0, 0.977, 0.035], {
    rotation: [deckAngle, 0, 0],
    name: "controlDeck.rearInlay",
  });
  add(new THREE.BoxGeometry(0.70, 0.008, 0.009), cyan, [0, 0.878, 0.395], {
    rotation: [deckAngle, 0, 0],
    name: "controlDeck.frontInlay",
  });

  // Joystick: recessed octagonal socket, chrome collar, shaft, and glowing pink ball.
  const joyX = -0.205;
  const joyZ = 0.205;
  const joyY = 0.955;
  add(new THREE.CylinderGeometry(0.082, 0.087, 0.018, 8), black, [joyX, joyY, joyZ], {
    rotation: [0, 0, 0],
    name: "controlDeck.joystickSocket",
  });
  add(new THREE.CylinderGeometry(0.064, 0.064, 0.012, 12), chromeDark, [joyX, joyY + 0.012, joyZ], {
    name: "controlDeck.joystickCollar",
  });
  b.rod([joyX, joyY + 0.015, joyZ], [joyX, 1.105, joyZ], 0.014, {
    color: chrome,
    bone,
    caps: "round",
    name: "controlDeck.joystickShaft",
  });
  const ball = add(new THREE.SphereGeometry(0.052, 12, 8), pink, [joyX, 1.145, joyZ], {
    name: "controlDeck.joystickBall",
  });
  glow(ball, 0.8);
  add(new THREE.CylinderGeometry(0.023, 0.023, 0.006, 10), cyan, [joyX, 1.195, joyZ], {
    name: "controlDeck.joystickBallHighlight",
  });

  // Six-button bank on the right, two rows of three.
  const buttonXs = [0.075, 0.165, 0.255];
  const buttonZs = [0.145, 0.255];
  let bi = 0;
  for (const z of buttonZs) {
    for (const x of buttonXs) {
      const y = 0.954 - (z - 0.215) * Math.sin(deckAngle);
      add(new THREE.CylinderGeometry(0.037, 0.040, 0.012, 12), black, [x, y, z], {
        rotation: [0, 0, 0],
        name: `controlDeck.buttonRim${bi}`,
      });
      const button = add(
        new THREE.CylinderGeometry(0.027, 0.030, 0.018, 12),
        bi % 2 === 0 ? red : white,
        [x, y + 0.012, z],
        { name: `controlDeck.button${bi}` },
      );
      if (bi === 0 || bi === 3) glow(button, 0.45);
      add(new THREE.CylinderGeometry(0.010, 0.010, 0.004, 8), bi % 2 === 0 ? yellow : cyan, [x, y + 0.023, z], {
        name: `controlDeck.buttonCap${bi}`,
      });
      bi++;
    }
  }

  // Two small start/service buttons near the front edge.
  for (const [i, x] of [-0.055, 0.045].entries()) {
    const z = 0.345;
    const y = 0.954 - (z - 0.215) * Math.sin(deckAngle);
    add(new THREE.CylinderGeometry(0.026, 0.029, 0.010, 10), black, [x, y, z], {
      name: `controlDeck.startRim${i}`,
    });
    const start = add(new THREE.CylinderGeometry(0.017, 0.019, 0.014, 10), white, [x, y + 0.010, z], {
      name: `controlDeck.startButton${i}`,
    });
    glow(start, 0.35);
  }

  // Tiny label bars beside the service buttons.
  add(new THREE.BoxGeometry(0.055, 0.004, 0.009), cyan, [-0.055, 0.968, 0.375], {
    rotation: [deckAngle, 0, 0],
    name: "controlDeck.startLabel",
  });
  add(new THREE.BoxGeometry(0.055, 0.004, 0.009), pink, [0.045, 0.968, 0.375], {
    rotation: [deckAngle, 0, 0],
    name: "controlDeck.serviceLabel",
  });

  // Small front overhang lip and riveted corner details.
  add(new THREE.BoxGeometry(0.84, 0.025, 0.018), chrome, [0, 0.846, 0.423], {
    name: "controlDeck.overhangTrim",
  });
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.010, 8, 6), yellow, [s * 0.375, 0.851, 0.432], {
      name: `controlDeck.frontRivet${s}`,
    });
    add(new THREE.SphereGeometry(0.008, 8, 6), chrome, [s * 0.375, 0.977, 0.04], {
      name: `controlDeck.rearRivet${s}`,
    });
  }
}
    return buildControlDeck;
  })(),
  // coinDoorAndKick
  (() => {
function buildCoinDoorAndKick({ b, J, P, M }: any) {
  const bone = J?.body;
  const front = 0.455;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      const e = new THREE.EdgesGeometry(g);
      void e;
    }
    return b.part(g, color, {
      at,
      bone,
      name: `coinDoorAndKick${name}`,
      group: "coinDoorAndKick",
    });
  };

  const frontBox = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => box(size, at, color, name);

  const disk = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 12,
  ) => {
    const g = new THREE.CylinderGeometry(radius, radius, depth, segments);
    return b.part(g, color, {
      at,
      bone,
      dir: [0, 0, 1],
      axis: "y",
      name: `coinDoorAndKick${name}`,
      group: "coinDoorAndKick",
    });
  };

  const frontDisk = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 12,
  ) => {
    const g = new THREE.CylinderGeometry(radius, radius, depth, segments);
    return b.part(g, color, {
      at,
      bone,
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 0],
      name: `coinDoorAndKick${name}`,
      group: "coinDoorAndKick",
    });
  };

  // Recessed lower cabinet panel, kept slightly behind the proud coin hardware.
  frontBox([0.70, 0.74, 0.025], [0, 0.475, 0.438], P.hullPurple, "LowerFrontPanel");
  frontBox([0.64, 0.055, 0.018], [0, 0.825, 0.452], P.neonCyan, "UpperCyanTrim");
  frontBox([0.62, 0.012, 0.012], [0, 0.795, 0.464], P.neonPink, "TrimHighlight");

  // Kick plate and its layered chrome/scuff cap.
  frontBox([0.76, 0.105, 0.055], [0, 0.052, 0.431], P.kickBlack, "KickPlate");
  frontBox([0.72, 0.014, 0.065], [0, 0.112, 0.435], P.chromeDark, "KickCapShadow");
  frontBox([0.70, 0.009, 0.068], [0, 0.119, 0.437], P.chrome, "KickChromeCap");
  frontBox([0.56, 0.009, 0.012], [0, 0.032, 0.465], "#4a183d", "KickScuff");
  frontBox([0.25, 0.006, 0.009], [-0.22, 0.024, 0.469], P.neonPink, "KickScuffPink");
  frontBox([0.18, 0.006, 0.009], [0.18, 0.024, 0.469], P.neonPurple, "KickScuffPurple");

  // Grounded plinth and two shadow feet.
  frontBox([0.86, 0.045, 0.78], [0, 0.022, 0.005], P.kickBlack, "GroundPlinth");
  frontBox([0.18, 0.035, 0.55], [-0.30, 0.017, -0.005], P.kickBlack, "LeftCaster");
  frontBox([0.18, 0.035, 0.55], [0.30, 0.017, -0.005], P.kickBlack, "RightCaster");

  // Coin door outer chrome frame, inset dark plate, and bottom sill.
  frontBox([0.39, 0.305, 0.026], [0, 0.405, 0.461], P.coinSteel, "CoinDoorFrame");
  frontBox([0.352, 0.268, 0.032], [0, 0.418, 0.478], P.chromeDark, "CoinDoorPlate");
  frontBox([0.315, 0.015, 0.018], [0, 0.286, 0.501], P.chrome, "DoorBottomRail");
  frontBox([0.33, 0.012, 0.011], [0, 0.558, 0.501], P.hullDark, "DoorTopShadow");

  // Door corner fasteners.
  for (const x of [-0.168, 0.168]) {
    for (const y of [0.302, 0.535]) {
      frontDisk(0.010, 0.009, [x, y, 0.504], P.coinSteel, `FrameScrew${x}${y}`, 10);
      frontDisk(0.004, 0.011, [x, y, 0.511], P.chrome, `FrameScrewGlint${x}${y}`, 8);
    }
  }

  // Coin return slot with a bright lower lip.
  frontBox([0.155, 0.030, 0.018], [0, 0.335, 0.505], P.kickBlack, "ReturnSlot");
  frontBox([0.135, 0.006, 0.009], [0, 0.322, 0.517], P.coinSteel, "ReturnSlotLip");
  frontBox([0.074, 0.004, 0.008], [0, 0.339, 0.519], P.chrome, "ReturnSlotGlint");

  // Two coin mechanisms: dark wells, steel rims, slots and pink price plates.
  for (const x of [-0.105, 0.105]) {
    frontBox([0.105, 0.115, 0.018], [x, 0.455, 0.505], P.kickBlack, `CoinWell${x}`);
    frontBox([0.091, 0.101, 0.012], [x, 0.455, 0.516], P.coinSteel, `CoinRim${x}`);
    frontBox([0.073, 0.076, 0.014], [x, 0.455, 0.524], P.screenBlack, `CoinInset${x}`);
    frontBox([0.050, 0.010, 0.010], [x, 0.455, 0.535], P.chromeDark, `CoinSlot${x}`);
    frontBox([0.076, 0.025, 0.009], [x, 0.538, 0.518], P.neonPink, `PricePlate${x}`);
    frontBox([0.054, 0.006, 0.006], [x, 0.539, 0.525], P.sunsetYellow, `PriceText${x}`);
  }

  // Central lock and tiny status indicator.
  frontDisk(0.021, 0.012, [0, 0.585, 0.512], P.coinSteel, "LockRing", 14);
  frontDisk(0.012, 0.014, [0, 0.585, 0.522], P.kickBlack, "LockCore", 12);
  frontBox([0.006, 0.028, 0.006], [0, 0.585, 0.531], P.chrome, "LockSlot");
  const status = frontBox([0.018, 0.012, 0.008], [0, 0.620, 0.514], P.neonCyan, "ServiceLight");
  glow(status, 1.8);

  // Decorative synthwave side-stripe fragments descending beside the door.
  for (const side of [-1, 1]) {
    frontBox([0.012, 0.19, 0.010], [side * 0.315, 0.685, 0.489], P.neonPink, `SideStripePink${side}`);
    frontBox([0.010, 0.115, 0.011], [side * 0.291, 0.655, 0.490], P.neonOrange ?? P.sunsetOrange, `SideStripeOrange${side}`);
    frontBox([0.008, 0.065, 0.012], [side * 0.273, 0.625, 0.491], P.sunsetYellow, `SideStripeYellow${side}`);
  }

  // Small cyan separator marks make the otherwise broad lower panel read as designed trim.
  for (const x of [-0.27, -0.18, 0.18, 0.27]) {
    const mark = frontBox([0.035, 0.008, 0.009], [x, 0.765, 0.515], P.neonCyan, `TrimMark${x}`);
    glow(mark, 1.2);
  }

  return b.root;
}
    return buildCoinDoorAndKick;
  })(),
  // sideArt
  (() => {
function buildSideArt({ b, J, P, M }: Ctx) {
  const rand = rng(1987);
  const purple = P.hullPurple ?? "#2a1e4a";
  const dark = P.hullDark ?? "#191030";
  const pink = P.neonPink ?? "#ff2e88";
  const cyan = P.neonCyan ?? "#2ff3ff";
  const violet = P.neonPurple ?? "#a24bff";
  const orange = P.sunsetOrange ?? "#ff7a1e";
  const yellow = P.sunsetYellow ?? "#ffd23e";
  const chrome = P.chrome ?? "#cfd6e8";
  const chromeDark = P.chromeDark ?? "#4a4f66";
  const gridBlue = P.gridBlue ?? "#1c3a72";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: J.body,
      name,
      flat: true,
    });

  const sideBox = (
    s: number,
    depth: number,
    widthY: number,
    widthZ: number,
    y: number,
    z: number,
    color: string,
    name: string,
    lift = 0,
  ) =>
    box(
      [depth, widthY, widthZ],
      [s * (0.446 + lift), y, z],
      color,
      name,
    );

  const rod = (
    s: number,
    a: [number, number],
    c: [number, number],
    radius: number,
    color: string,
    name: string,
  ) =>
    b.rod(
      [s * 0.465, a[0], a[1]],
      [s * 0.465, c[0], c[1]],
      radius,
      {
        color,
        bone: J.body,
        name,
        section: { ngon: 4 },
        caps: "flat",
      },
    );

  const dot = (
    s: number,
    y: number,
    z: number,
    radius: number,
    color: string,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 6, 4), color, {
      at: [s * 0.468, y, z],
      bone: J.body,
      name,
      flat: true,
    });

  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";

    // Proud, crisp side plate, deliberately inset from the deck and kick edges.
    sideBox(s, 0.025, 1.37, 0.82, 0.775, 0.005, dark, `sidePanel${tag}`);

    // Thin violet inset field gives the panel a framed, layered arcade-plywood look.
    sideBox(s, 0.012, 1.27, 0.72, 0.79, 0.012, purple, `sideInset${tag}`, 0.018);

    // Outer chrome T-molding around the panel perimeter.
    sideBox(s, 0.018, 0.026, 0.78, 0.775, -0.398, chrome, `trimBottom${tag}`, 0.022);
    sideBox(s, 0.018, 0.026, 0.78, 1.455, -0.398, chrome, `trimTop${tag}`, 0.022);
    sideBox(s, 0.018, 1.36, 0.026, 0.775, -0.398, chrome, `trimRear${tag}`, 0.022);
    sideBox(s, 0.018, 1.36, 0.026, 0.775, 0.398, chrome, `trimFront${tag}`, 0.022);

    // Rear neon accent stripe, with a darker underlay so it reads as a separate inlay.
    sideBox(s, 0.022, 1.31, 0.038, 0.77, -0.373, dark, `stripeUnder${tag}`, 0.027);
    sideBox(s, 0.026, 1.24, 0.018, 0.77, -0.374, pink, `rearNeonStripe${tag}`, 0.034);

    // Sunset disc: a blocky half-sun made from broad horizontal neon bands.
    const sunY = 1.12;
    const sunZ = 0.105;
    const bands = [
      [0.035, 0.285, pink],
      [0.043, 0.255, orange],
      [0.038, 0.225, yellow],
      [0.032, 0.185, orange],
      [0.026, 0.135, pink],
    ] as const;

    bands.forEach(([h, w, color], i) => {
      sideBox(
        s,
        0.019,
        h,
        w,
        sunY + i * 0.041,
        sunZ,
        color,
        `sunBand${tag}${i}`,
        0.03,
      );
    });

    // Dark interruptions between sun bands, producing a graphic outrun-style disc.
    for (let i = 0; i < 4; i++) {
      sideBox(
        s,
        0.023,
        0.012,
        0.24 - i * 0.025,
        sunY + 0.027 + i * 0.041,
        sunZ - 0.002,
        dark,
        `sunCut${tag}${i}`,
        0.034,
      );
    }

    // Horizon glow and a layered skyline.
    sideBox(s, 0.024, 0.018, 0.67, 0.91, 0.09, pink, `horizonGlow${tag}`, 0.034);
    sideBox(s, 0.026, 0.014, 0.67, 0.895, 0.09, orange, `horizonCore${tag}`, 0.037);

    // Three angular chrome-dark mountains behind the grid.
    const mountainSets: [number, number, number][] = [
      [0.915, -0.23, 0.15],
      [0.91, -0.035, 0.2],
      [0.91, 0.16, 0.14],
    ];
    mountainSets.forEach(([y, z, h], i) => {
      const peak = z + 0.11;
      rod(s, [y - h * 0.55, z - 0.16], [y, peak], 0.014, chromeDark, `mountain${tag}${i}a`);
      rod(s, [y, peak], [y + h * 0.55, z - 0.16], 0.014, chromeDark, `mountain${tag}${i}b`);
      rod(s, [y + h * 0.55, z - 0.16], [y - h * 0.55, z - 0.16], 0.009, gridBlue, `mountain${tag}${i}base`);
    });

    // Perspective floor: horizon-to-bottom rays converge toward a central vanishing point.
    const vanish: [number, number] = [0.905, 0.085];
    const bottomZ = [-0.34, -0.26, -0.18, -0.10, -0.02, 0.06, 0.14, 0.22, 0.30];
    bottomZ.forEach((z, i) => {
      rod(s, vanish, [0.19, z], 0.006, cyan, `perspectiveRay${tag}${i}`);
    });

    // Horizontal perspective grid bars, increasingly separated toward the viewer.
    const gridRows: [number, number][] = [
      [0.84, 0.58],
      [0.77, 0.62],
      [0.69, 0.66],
      [0.60, 0.69],
      [0.50, 0.72],
      [0.39, 0.74],
      [0.26, 0.76],
    ];
    gridRows.forEach(([y, half], i) => {
      rod(s, [y, -half], [y, half], 0.006, cyan, `gridRow${tag}${i}`);
    });

    // A few darker blue shadow bars offset behind the cyan grid for depth.
    [0.73, 0.55, 0.34].forEach((y, i) => {
      rod(s, [y, -0.68], [y, 0.68], 0.0035, gridBlue, `gridShadow${tag}${i}`);
    });

    // Small starfield, deterministic and kept above the horizon.
    for (let i = 0; i < 18; i++) {
      const y = 1.22 + rand() * 0.19;
      const z = -0.32 + rand() * 0.64;
      const r = 0.004 + rand() * 0.004;
      dot(s, y, z, r, i % 4 === 0 ? pink : chrome, `star${tag}${i}`);
    }

    // Small chrome corner bolts and a pair of decorative lower rivets.
    const bolts: [number, number][] = [
      [1.405, -0.355],
      [1.405, 0.355],
      [0.145, -0.355],
      [0.145, 0.355],
      [0.33, -0.31],
      [0.33, 0.31],
    ];
    bolts.forEach(([y, z], i) => dot(s, y, z, 0.012, chrome, `panelBolt${tag}${i}`));

    // Tiny violet chevrons on the front lower side, echoing the cabinet's angled silhouette.
    for (let i = 0; i < 3; i++) {
      const y = 0.28 + i * 0.095;
      rod(s, [y, 0.27], [y + 0.045, 0.22], 0.006, violet, `chevronA${tag}${i}`);
      rod(s, [y + 0.045, 0.22], [y + 0.09, 0.27], 0.006, pink, `chevronB${tag}${i}`);
    }

    // A small dark label plate makes the art feel like a manufactured side decal.
    sideBox(s, 0.018, 0.052, 0.23, 0.49, 0.285, chromeDark, `sideLabel${tag}`, 0.033);
    sideBox(s, 0.021, 0.026, 0.17, 0.49, 0.285, cyan, `sideLabelGlow${tag}`, 0.039);
  }
}
    return buildSideArt;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "synthwaveArcade" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
