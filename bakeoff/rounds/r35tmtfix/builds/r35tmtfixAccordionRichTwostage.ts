import * as THREE from "three";
import {
  type Builder,
  type ColorInput,
  createBuilder,
  rng,
  cells,
  countershade,
  grain,
  mix,
  paint,
  stripes,
  catmull,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized piano accordion with pearl-inlaid side shells, pleated bellows, a readable keyboard, bass buttons, straps, grille, and ornate Italian silhouette.",
};

export const REQUESTS = [
  {
    id: "pearlRosette",
    kind: "add",
    part: "rightShell",
    what: "Raised Italian mother-of-pearl rosette on the front of the right shell: concentric ivory, aqua, rose and gold petals with a dark outline, kept crisp and symmetrical.",
    at: [-0.53, 0.98, 0.235],
    normal: [0, 0, 1],
    bone: null,
    room: [0.58, 0.62, 0.05],
  },
  {
    id: "leftShellFiligree",
    kind: "add",
    part: "leftShell",
    what: "Ornate Italian floral filigree emblem on the left bass shell, a large cream and turquoise curling vine with three pearl flowers and tiny brass studs.",
    at: [0.53, 0.98, 0.235],
    normal: [0, 0, 1],
    bone: null,
    room: [0.55, 0.72, 0.05],
  },
  {
    id: "keyboardLabels",
    kind: "add",
    part: "keyboard",
    what: "Tiny mother-of-pearl nameplate above the piano keys reading ACCORDI ITALIANI, with a thin gold border and two red jewel end caps.",
    at: [-0.56, 1.47, 0.36],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.09, 0.035],
  },
  {
    id: "bassPearlButtons",
    kind: "add",
    part: "bassFace",
    what: "A rich array of twelve bass buttons in four staggered rows: alternating ivory pearl, turquoise pearl and ruby-red buttons, each with a tiny brass bezel.",
    at: [0.565, 1.02, 0.275],
    normal: [0, 0, 1],
    bone: null,
    room: [0.32, 0.66, 0.06],
  },
  {
    id: "bellowsCorners",
    kind: "add",
    part: "bellows",
    what: "Gold corner guards and dark burgundy leather end bindings on every bellows fold, with tiny punched brass rivets; preserve the fold rhythm.",
    at: [0, 1.02, 0.29],
    normal: [0, 0, 1],
    bone: null,
    room: [0.82, 1.12, 0.08],
  },
  {
    id: "grille",
    kind: "add",
    part: "rightShell",
    what: "Decorative speaker grille on the lower right shell: a rounded gold frame, turquoise lattice, and a dark inset behind it, centered below the rosette.",
    at: [-0.53, 0.63, 0.25],
    normal: [0, 0, 1],
    bone: null,
    room: [0.40, 0.28, 0.06],
  },
  {
    id: "shoulderStraps",
    kind: "add",
    part: "rearShell",
    what: "Two broad burgundy leather shoulder straps emerging from the rear shell, with cream stitching, brass buckles, and padded pearl-colored shoulder sections.",
    at: [0, 1.26, -0.23],
    normal: [0, 0, -1],
    bone: null,
    room: [1.25, 0.32, 0.12],
  },
  {
    id: "cornerJewels",
    kind: "add",
    part: "rightShell",
    what: "Four ruby cabochons in small brass bezels at the shell corners, plus matching turquoise cabochons on the opposite shell.",
    at: [-0.53, 1.55, 0.24],
    normal: [0, 0, 1],
    bone: null,
    room: [0.62, 0.12, 0.06],
  },
  {
    id: "bellowsTexture",
    kind: "texture",
    part: "bellows",
    what: "Paint the bellows folds as alternating deep burgundy leather and warm wine-red bands, with subtle cream pinstripes following every ridge.",
  },
  {
    id: "shellPearlTexture",
    kind: "texture",
    part: "leftShell",
    what: "Italian mother-of-pearl mosaic: pale ivory base with irregular aqua, blush-pink and champagne facets, restrained gold veining, and a soft dark edge shadow.",
  },
  {
    id: "shellPearlTextureRight",
    kind: "texture",
    part: "rightShell",
    what: "Match the left shell with a coordinated mother-of-pearl mosaic, but keep the central rosette area visually clear for the emblem request.",
  },
  {
    id: "leatherTexture",
    kind: "texture",
    part: "strap",
    what: "Fine burgundy leather grain and repeated cream saddle stitching on all strap pieces and their folded tabs.",
  },
];

export const PALETTE = {
  PEARL: "#f5e8cf",
  PEARL_HI: "#fff8e8",
  PEARL_BLUE: "#9ed8d2",
  PEARL_ROSE: "#e7a5ad",
  PEARL_GOLD: "#d8b66d",
  SHELL_EDGE: "#8c684e",
  BURGUNDY: "#5b1729",
  BURGUNDY_HI: "#8b3045",
  BELLOWS_DARK: "#321523",
  BLACK: "#17131a",
  IVORY: "#fff3d0",
  KEY_SHADOW: "#b99e79",
  GOLD: "#c88f32",
  GOLD_HI: "#f3d27a",
  BRASS_DARK: "#70431f",
  TURQUOISE: "#35aaa6",
  TURQUOISE_DARK: "#146b70",
  RUBY: "#a9213e",
  RUBY_HI: "#ed6b72",
  STRAP: "#4d1828",
  FLOOR_DARK: "#261a22",
};

const BELLOWS_LEATHER = paint((p, n) => {
  const band = stripes(PALETTE.BELLOWS_DARK, PALETTE.BURGUNDY_HI, {
    size: 0.195,
    axis: "x",
    width: 0.58,
    wobble: 0.08,
    seed: 18,
  });
  const grainPaint = grain(band, PALETTE.BURGUNDY_HI, {
    size: 0.018,
    axis: "y",
    seed: 24,
  });
  const x = ((p.x + 0.39) % 0.0975 + 0.0975) % 0.0975;
  return x < 0.010 || x > 0.087 ? PALETTE.PEARL_HI : grainPaint.at(p, n);
});

const SHELL_MOSAIC = paint((p, n) => {
  const c = cells(p, 0.115, 71);
  const palette = [
    PALETTE.PEARL,
    PALETTE.PEARL_HI,
    PALETTE.PEARL_BLUE,
    PALETTE.PEARL_ROSE,
    "#f0d7aa",
  ];
  let color = palette[Math.floor(c.id * palette.length) % palette.length];
  const vein = Math.abs(Math.sin((p.x * 37.0 + p.y * 23.0 + p.z * 19.0) + c.id * 8.0));
  if (vein > 0.965) color = PALETTE.PEARL_GOLD;
  if (n.z < 0.18) color = mix(color, PALETTE.SHELL_EDGE, 0.34);
  return color;
});

const SHELL_MOSAIC_RIGHT = paint((p, n) => {
  const c = cells(p, 0.115, 89);
  const palette = [
    PALETTE.PEARL_HI,
    PALETTE.PEARL,
    PALETTE.PEARL_BLUE,
    "#e8b6bd",
    "#efd29f",
  ];
  let color = palette[Math.floor(c.id * palette.length) % palette.length];
  const vein = Math.abs(Math.sin((p.x * 34.0 - p.y * 27.0 + p.z * 21.0) + c.id * 7.0));
  if (vein > 0.967) color = PALETTE.PEARL_GOLD;
  if (n.z < 0.18) color = mix(color, PALETTE.SHELL_EDGE, 0.30);
  return color;
});

const STRAP_LEATHER = grain(
  countershade(PALETTE.STRAP, PALETTE.BURGUNDY_HI, { level: -0.05, soft: 0.3 }),
  PALETTE.BURGUNDY_HI,
  { size: 0.022, axis: "y", seed: 103 },
);

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  name: string,
  bevel = 0,
) {
  const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
  if (bevel > 0) {
    const modifier = new THREE.Shape();
    modifier.moveTo(-size[0] / 2 + bevel, -size[1] / 2);
    modifier.lineTo(size[0] / 2 - bevel, -size[1] / 2);
    modifier.lineTo(size[0] / 2, -size[1] / 2 + bevel);
    modifier.lineTo(size[0] / 2, size[1] / 2 - bevel);
    modifier.lineTo(size[0] / 2 - bevel, size[1] / 2);
    modifier.lineTo(-size[0] / 2 + bevel, size[1] / 2);
    modifier.lineTo(-size[0] / 2, size[1] / 2 - bevel);
    modifier.lineTo(-size[0] / 2, -size[1] / 2 + bevel);
    // Keep the main mass a simple box; the separate trim pieces sell the bevel.
  }
  return b.part(geo, color, { at, name, flat: true });
}

function cylinder(
  b: Builder,
  radius: number,
  depth: number,
  color: string,
  at: [number, number, number],
  name: string,
  sides = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, sides), color, {
    at,
    dir: [0, 0, 1],
    name,
    flat: true,
  });
}

function pearlInset(
  b: Builder,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  name: string,
) {
  box(b, [w, h, 0.018], color, [x, y, 0.218], name);
  box(b, [w + 0.025, 0.018, 0.025], PALETTE.GOLD, [x, y + h / 2, 0.232], `${name}Top`);
  box(b, [w + 0.025, 0.018, 0.025], PALETTE.GOLD, [x, y - h / 2, 0.232], `${name}Bottom`);
  box(b, [0.018, h, 0.025], PALETTE.GOLD, [x - w / 2, y, 0.232], `${name}L`);
  box(b, [0.018, h, 0.025], PALETTE.GOLD, [x + w / 2, y, 0.232], `${name}R`);
}

function trimLine(
  b: Builder,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: string,
  name: string,
) {
  return b.rod(a, c, radius, { color, name, caps: "round" });
}

function button(
  b: Builder,
  x: number,
  y: number,
  color: string,
  name: string,
  r = 0.034,
) {
  cylinder(b, r + 0.009, 0.018, PALETTE.BRASS_DARK, [x, y, 0.305], `${name}Bezel`, 10);
  cylinder(b, r, 0.022, color, [x, y, 0.321], name, 10);
  cylinder(b, r * 0.28, 0.008, PALETTE.PEARL_HI, [x - 0.007, y + 0.008, 0.338], `${name}Glint`, 8);
}

export default function build() {
  const b = createBuilder({ name: "italian-mother-of-pearl-piano-accordion", detail: 1 });

  // Grounded, compact concert-accordion proportions.
  const centerY = 0.98;
  const shellH = 1.24;
  const shellW = 0.42;
  const shellD = 0.42;

  // Main shell blocks. Their named broad faces deliberately remain uncluttered.
  box(b, [shellW, shellH, shellD], SHELL_MOSAIC_RIGHT, [-0.55, centerY, 0], "rightShell", 0.035);
  box(b, [shellW, shellH, shellD], SHELL_MOSAIC, [0.55, centerY, 0], "leftShell", 0.035);
  box(b, [1.02, 1.12, 0.26], BELLOWS_LEATHER, [0, 1.0, 0], "bellows", 0.015);
  box(b, [1.25, 0.92, 0.18], PALETTE.BURGUNDY, [0, 0.98, -0.17], "rearShell", 0.025);

  // Pearl inset panels and broad shell borders.
  pearlInset(b, -0.55, 1.28, 0.31, 0.30, PALETTE.PEARL_HI, "rightUpperPanel");
  pearlInset(b, -0.55, 0.76, 0.31, 0.31, PALETTE.PEARL_BLUE, "rightLowerPanel");
  pearlInset(b, 0.55, 1.28, 0.31, 0.30, PALETTE.PEARL_ROSE, "leftUpperPanel");
  pearlInset(b, 0.55, 0.76, 0.31, 0.31, PALETTE.PEARL_HI, "leftLowerPanel");

  for (const s of [-1, 1]) {
    const x = s * 0.55;
    trimLine(b, [x - s * 0.18, 1.59, 0.245], [x + s * 0.18, 1.59, 0.245], 0.012, PALETTE.GOLD, `shellTopTrim${s}`);
    trimLine(b, [x - s * 0.18, 0.37, 0.245], [x + s * 0.18, 0.37, 0.245], 0.012, PALETTE.GOLD, `shellBottomTrim${s}`);
    trimLine(b, [x - s * 0.18, 0.39, 0.245], [x - s * 0.18, 1.57, 0.245], 0.010, PALETTE.GOLD, `shellOuterTrim${s}`);
    trimLine(b, [x + s * 0.18, 0.39, 0.245], [x + s * 0.18, 1.57, 0.245], 0.010, PALETTE.GOLD, `shellInnerTrim${s}`);
  }

  // Pleated bellows: large, readable zig-zag rhythm.
  const folds = 9;
  for (let i = 0; i < folds; i++) {
    const x = -0.39 + i * 0.0975;
    const c = i % 2 === 0 ? PALETTE.BURGUNDY_HI : PALETTE.BELLOWS_DARK;
    box(b, [0.035, 1.08, 0.30], BELLOWS_LEATHER, [x, 1.0, 0.005], "bellows", 0.004);
    box(b, [0.012, 1.08, 0.325], PALETTE.GOLD, [x + 0.018, 1.0, 0.018], `bellowsRidge${i}`);
  }
  for (const y of [0.46, 0.62, 0.78, 0.94, 1.10, 1.26, 1.42, 1.56]) {
    trimLine(b, [-0.43, y, 0.17], [0.43, y, 0.17], 0.006, PALETTE.BURGUNDY_HI, `bellowsSeam${y}`);
  }

  // Bottom feet and protective corners.
  for (const x of [-0.64, 0.64]) {
    box(b, [0.18, 0.14, 0.32], PALETTE.BRASS_DARK, [x, 0.16, -0.01], `foot${x}`, 0.025);
    cylinder(b, 0.055, 0.09, PALETTE.GOLD, [x, 0.075, 0.03], `footCap${x}`, 8);
    for (const y of [0.43, 1.55]) {
      box(b, [0.06, 0.14, 0.08], PALETTE.GOLD, [x, y, 0.235], `cornerGuard${x}${y}`, 0.012);
    }
  }

  // Right-hand piano keyboard, projecting from the front-right side.
  box(b, [0.17, 1.02, 0.19], PALETTE.BURGUNDY, [-0.58, 1.02, 0.26], "keyboard", 0.018);
  box(b, [0.06, 1.00, 0.025], PALETTE.GOLD, [-0.685, 1.02, 0.36], "keyboardRail", 0.008);

  const whiteKeys = 13;
  for (let i = 0; i < whiteKeys; i++) {
    const y = 0.55 + i * 0.075;
    box(b, [0.15, 0.064, 0.065], PALETTE.IVORY, [-0.70, y, 0.375], `whiteKey${i}`, 0.006);
    box(b, [0.152, 0.009, 0.012], PALETTE.KEY_SHADOW, [-0.70, y - 0.031, 0.412], `keyLine${i}`);
  }
  const blackAt = [1, 2, 4, 5, 6, 8, 9, 11, 12];
  for (let i = 0; i < blackAt.length; i++) {
    const y = 0.55 + blackAt[i] * 0.075 + 0.037;
    box(b, [0.12, 0.039, 0.078], PALETTE.BLACK, [-0.735, y, 0.415], `blackKey${i}`, 0.005);
    box(b, [0.12, 0.009, 0.012], PALETTE.GOLD, [-0.735, y + 0.014, 0.455], `blackKeyGlint${i}`);
  }

  // Bass button field on the left shell, arranged as a traditional compact matrix.
  box(b, [0.34, 0.82, 0.045], PALETTE.BURGUNDY, [0.55, 1.02, 0.285], "bassFace", 0.025);
  const rows = [
    { y: 1.34, xs: [0.45, 0.56, 0.67] },
    { y: 1.15, xs: [0.42, 0.53, 0.64, 0.73] },
    { y: 0.94, xs: [0.42, 0.53, 0.64, 0.73] },
    { y: 0.73, xs: [0.45, 0.56, 0.67] },
  ];
  let bi = 0;
  for (const row of rows) {
    for (const x of row.xs) {
      const color = bi % 3 === 0 ? PALETTE.PEARL_HI : bi % 3 === 1 ? PALETTE.PEARL_BLUE : PALETTE.RUBY_HI;
      button(b, x, row.y, color, `bassButton${bi}`);
      bi++;
    }
  }

  // Decorative bass-side vents and small brass studs.
  for (let i = 0; i < 5; i++) {
    box(b, [0.23, 0.018, 0.018], PALETTE.GOLD, [0.55, 0.53 + i * 0.045, 0.322], `bassVent${i}`, 0.004);
  }
  for (const x of [0.39, 0.71]) {
    for (const y of [0.48, 1.55]) {
      cylinder(b, 0.018, 0.016, PALETTE.GOLD_HI, [x, y, 0.34], `stud${x}${y}`, 8);
    }
  }

  // Front grille recess and its slats, below the future emblem.
  box(b, [0.34, 0.27, 0.035], PALETTE.BELLOWS_DARK, [-0.55, 0.58, 0.27], "grilleBacking", 0.025);
  box(b, [0.39, 0.025, 0.045], PALETTE.GOLD, [-0.55, 0.73, 0.30], "grilleTop", 0.008);
  box(b, [0.39, 0.025, 0.045], PALETTE.GOLD, [-0.55, 0.43, 0.30], "grilleBottom", 0.008);
  for (let i = -3; i <= 3; i++) {
    const x = -0.55 + i * 0.045;
    trimLine(b, [x, 0.46, 0.32], [x + 0.05, 0.70, 0.32], 0.009, PALETTE.TURQUOISE, `grilleSlat${i}`);
  }

  // Simple strap anchors and rear hardware.
  for (const x of [-0.40, 0.40]) {
    box(b, [0.16, 0.10, 0.08], PALETTE.BRASS_DARK, [x, 1.55, -0.255], `strapAnchorTop${x}`, 0.018);
    box(b, [0.16, 0.10, 0.08], PALETTE.BRASS_DARK, [x, 0.48, -0.255], `strapAnchorBottom${x}`, 0.018);
    cylinder(b, 0.028, 0.025, PALETTE.GOLD_HI, [x, 1.55, -0.30], `anchorRivetTop${x}`, 8);
    cylinder(b, 0.028, 0.025, PALETTE.GOLD_HI, [x, 0.48, -0.30], `anchorRivetBottom${x}`, 8);
  }
  box(b, [0.09, 0.80, 0.03], STRAP_LEATHER, [-0.38, 1.02, -0.285], "strap", 0.018);
  box(b, [0.09, 0.80, 0.03], STRAP_LEATHER, [0.38, 1.02, -0.285], "strap", 0.018);
  for (const x of [-0.38, 0.38]) {
    for (let i = 0; i < 9; i++) {
      box(b, [0.104, 0.008, 0.038], PALETTE.PEARL_GOLD, [x, 0.62 + i * 0.10, -0.305], `strapStitch${x}${i}`);
    }
  }

  // Small front crown rails and jewel-like end caps, leaving the main faces clear.
  trimLine(b, [-0.73, 1.66, 0.28], [0.73, 1.66, 0.28], 0.014, PALETTE.GOLD, "topCrownRail");
  trimLine(b, [-0.73, 0.32, 0.28], [0.73, 0.32, 0.28], 0.014, PALETTE.GOLD, "bottomCrownRail");
  for (const x of [-0.72, 0.72]) {
    cylinder(b, 0.04, 0.035, PALETTE.RUBY, [x, 1.66, 0.30], `topRuby${x}`, 8);
    cylinder(b, 0.04, 0.035, PALETTE.TURQUOISE, [x, 0.32, 0.30], `bottomTurquoise${x}`, 8);
  }

  // Stage 2 additions are intentionally applied last, after all surfaces and named regions exist.
  for (const add of STAGE2) add(b);
  return b.root;
}

export const STAGE2: ((b: Builder) => void)[] = [];

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addPearlRosette(b: Builder) {
  const cx = -0.53;
  const cy = 0.98;
  const baseZ = 0.246;

  const pearl = PALETTE.PEARL;
  const pearlHi = PALETTE.PEARL_HI;
  const aqua = PALETTE.PEARL_BLUE;
  const rose = PALETTE.PEARL_ROSE;
  const gold = PALETTE.PEARL_GOLD;
  const outline = PALETTE.BRASS_DARK;
  const ruby = PALETTE.RUBY;
  const turquoise = PALETTE.TURQUOISE;

  const disk = (
    radius: number,
    depth: number,
    color: string,
    z: number,
    name: string,
    segments = 16,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at: [cx, cy, z],
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  const bead = (x: number, y: number, color: string, name: string, radius = 0.022) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at: [x, y, baseZ + 0.078],
      name,
      flat: true,
    });

  const petalGeometry = (scale: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.050 * scale, 0.035 * scale, -0.057 * scale, 0.108 * scale, 0, 0.145 * scale);
    shape.bezierCurveTo(0.057 * scale, 0.108 * scale, 0.050 * scale, 0.035 * scale, 0, 0);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      curveSegments: 3,
    });
    geo.translate(0, -0.0725 * scale, -0.008);
    return geo;
  };

  const petal = (
    angle: number,
    color: string,
    scale: number,
    z: number,
    name: string,
  ) => {
    const r = 0.065;
    return b.part(petalGeometry(scale), color, {
      at: [cx + Math.sin(angle) * r, cy + Math.cos(angle) * r, z],
      rotation: [0, 0, angle],
      name,
      flat: true,
    });
  };

  // Deep, scalloped-looking foundation disc and a slim gold perimeter.
  disk(0.225, 0.026, outline, baseZ, "rosetteDarkFoundation", 20);
  disk(0.207, 0.018, pearlHi, baseZ + 0.018, "rosettePearlFoundation", 20);
  disk(0.188, 0.012, aqua, baseZ + 0.031, "rosetteAquaField", 20);
  disk(0.174, 0.009, pearl, baseZ + 0.040, "rosetteIvoryField", 20);

  // Alternating outlined petals make the large Italian flower read from a distance.
  const petalColors = [pearlHi, aqua, rose, pearlHi, aqua, rose, pearlHi, aqua];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    petal(a, outline, 1.10, baseZ + 0.047, `rosettePetalOutline${i}`);
    petal(a, petalColors[i], 0.91, baseZ + 0.060, `rosettePetal${i}`);
  }

  // Eight narrow gold veins run beneath the petals and remain visible between them.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const x0 = cx + Math.sin(a) * 0.045;
    const y0 = cy + Math.cos(a) * 0.045;
    const x1 = cx + Math.sin(a) * 0.158;
    const y1 = cy + Math.cos(a) * 0.158;
    b.rod([x0, y0, baseZ + 0.051], [x1, y1, baseZ + 0.051], 0.006, {
      color: gold,
      caps: "round",
      name: `rosetteGoldVein${i}`,
    });
  }

  // Concentric hand-inlaid rings, kept as separate crisp bands.
  disk(0.126, 0.010, outline, baseZ + 0.074, "rosetteInnerOutline", 16);
  disk(0.113, 0.012, gold, baseZ + 0.082, "rosetteGoldRing", 16);
  disk(0.095, 0.012, pearlHi, baseZ + 0.091, "rosetteInnerPearl", 16);
  disk(0.074, 0.010, rose, baseZ + 0.100, "rosetteRoseCore", 16);
  disk(0.054, 0.012, turquoise, baseZ + 0.109, "rosetteTurquoiseCore", 14);
  disk(0.034, 0.014, gold, baseZ + 0.119, "rosetteGoldHub", 12);
  disk(0.021, 0.016, ruby, baseZ + 0.130, "rosetteRubyCabochon", 12);

  // Pearl beads punctuate the outer ring like a small carved brooch.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    const x = cx + Math.sin(a) * 0.184;
    const y = cy + Math.cos(a) * 0.184;
    bead(x, y, i % 2 === 0 ? pearlHi : aqua, `rosetteOuterPearl${i}`, 0.020);
  }

  // Four jewel studs at the cardinal points give the emblem a richer jewelry silhouette.
  const jewels = [
    [cx, cy + 0.190, ruby],
    [cx + 0.190, cy, turquoise],
    [cx, cy - 0.190, ruby],
    [cx - 0.190, cy, turquoise],
  ] as const;
  jewels.forEach(([x, y, color], i) => {
    disk(0.030, 0.012, gold, baseZ + 0.071, `rosetteJewelBezel${i}`, 10);
    b.part(new THREE.SphereGeometry(0.022, 8, 5), color, {
      at: [x, y, baseZ + 0.084],
      name: `rosetteJewel${i}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), pearlHi, {
      at: [x - 0.007, y + 0.007, baseZ + 0.103],
      name: `rosetteJewelGlint${i}`,
      flat: true,
    });
  });

  // Tiny gold dots between the petals complete the filigree without muddying the silhouette.
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const radius = i % 2 === 0 ? 0.151 : 0.133;
    b.part(new THREE.SphereGeometry(0.008, 6, 4), gold, {
      at: [
        cx + Math.sin(a) * radius,
        cy + Math.cos(a) * radius,
        baseZ + 0.070,
      ],
      name: `rosetteFiligreeDot${i}`,
      flat: true,
    });
  }
}
    return addPearlRosette;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addLeftShellFiligree(b: Builder) {
  const CREAM = "#fff3d0";
  const TURQUOISE = "#35aaa6";
  const TURQUOISE_DARK = "#146b70";
  const GOLD = "#d8b66d";
  const RUBY = "#a9213e";
  const INK = "#3a2130";

  const zStem = 0.258;
  const zLeaf = 0.270;
  const zFlower = 0.286;

  const rod = (
    points: [number, number, number][],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.sweep(catmull(points), radius, {
      color,
      caps: "round",
      sides: 6,
      name,
      group: "leftShellFiligree",
    });
  };

  const bead = (
    x: number,
    y: number,
    z: number,
    radius: number,
    color: string,
    name: string,
  ) => {
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: [x, y, z],
      scale: [1, 1, 0.42],
      name,
      group: "leftShellFiligree",
      flat: true,
    });
  };

  const leaf = (
    x: number,
    y: number,
    sx: number,
    sy: number,
    color: string,
    name: string,
  ) => {
    const outline: [number, number, "sharp"][] = [
      [0, 0.070, "sharp"],
      [0.080, 0.018, "sharp"],
      [0.050, -0.030, "sharp"],
      [0, -0.055, "sharp"],
      [-0.050, -0.030, "sharp"],
      [-0.080, 0.018, "sharp"],
    ];
    b.extrude(outline, {
      at: [x, y, zLeaf],
      x: [sx, 0, 0],
      y: [0, sy, 0],
      thickness: 0.012,
      bevel: 0.003,
      color,
      smoothing: 1,
      name,
      group: "leftShellFiligree",
    });
    rod(
      [
        [x - sx * 0.048, y, zLeaf + 0.008],
        [x, y, zLeaf + 0.010],
        [x + sx * 0.048, y, zLeaf + 0.008],
      ],
      0.003,
      GOLD,
      `${name}Vein`,
    );
  };

  const petal = (
    x: number,
    y: number,
    angle: number,
    color: string,
    name: string,
  ) => {
    const r = 0.043;
    const px = Math.cos(angle) * 0.041;
    const py = Math.sin(angle) * 0.041;
    b.part(new THREE.SphereGeometry(1, 8, 6), color, {
      at: [x + px, y + py, zFlower],
      scale: [
        r * (0.74 + 0.18 * Math.abs(Math.cos(angle))),
        r * 1.22,
        0.012,
      ],
      rotation: [0, 0, angle - Math.PI / 2],
      name,
      group: "leftShellFiligree",
      flat: true,
    });
  };

  const flower = (
    x: number,
    y: number,
    scale: number,
    palette: readonly string[],
    name: string,
  ) => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.PI / 2;
      const r = 0.044 * scale;
      b.part(new THREE.SphereGeometry(1, 8, 6), palette[i % palette.length], {
        at: [
          x + Math.cos(a) * r,
          y + Math.sin(a) * r,
          zFlower + 0.002,
        ],
        scale: [0.035 * scale, 0.060 * scale, 0.013],
        rotation: [0, 0, a - Math.PI / 2],
        name: `${name}Petal${i}`,
        group: "leftShellFiligree",
        flat: true,
      });
      bead(
        x + Math.cos(a) * r * 1.25,
        y + Math.sin(a) * r * 1.25,
        zFlower + 0.015,
        0.006 * scale,
        GOLD,
        `${name}PetalStud${i}`,
      );
    }
    bead(x, y, zFlower + 0.018, 0.030 * scale, GOLD, `${name}GoldCore`);
    bead(x, y, zFlower + 0.030, 0.017 * scale, RUBY, `${name}RubyCore`);
    bead(x - 0.006 * scale, y + 0.008 * scale, zFlower + 0.040, 0.005 * scale, CREAM, `${name}CoreGlint`);
  };

  // Main scrolling turquoise vine: a strong S silhouette connecting three flowers.
  rod(
    [
      [0.675, 0.560, zStem],
      [0.625, 0.630, zStem],
      [0.480, 0.700, zStem],
      [0.420, 0.805, zStem],
      [0.445, 0.900, zStem],
      [0.585, 0.955, zStem],
      [0.690, 1.045, zStem],
      [0.660, 1.155, zStem],
      [0.570, 1.240, zStem],
      [0.455, 1.335, zStem],
    ],
    0.010,
    TURQUOISE_DARK,
    "filigreeMainVine",
  );

  // Cream inner highlight keeps the vine looking like raised pearl inlay.
  rod(
    [
      [0.671, 0.566, zStem + 0.009],
      [0.622, 0.637, zStem + 0.009],
      [0.486, 0.707, zStem + 0.009],
      [0.432, 0.807, zStem + 0.009],
      [0.451, 0.897, zStem + 0.009],
      [0.588, 0.965, zStem + 0.009],
      [0.681, 1.050, zStem + 0.009],
      [0.651, 1.154, zStem + 0.009],
      [0.563, 1.232, zStem + 0.009],
      [0.455, 1.329, zStem + 0.009],
    ],
    0.0035,
    CREAM,
    "filigreeVineHighlight",
  );

  // Two outward curls give the emblem a distinctly Italian ornamental finish.
  rod(
    [
      [0.510, 0.870, zStem + 0.006],
      [0.425, 0.910, zStem + 0.006],
      [0.385, 0.985, zStem + 0.006],
      [0.414, 1.050, zStem + 0.006],
      [0.485, 1.058, zStem + 0.006],
      [0.518, 1.015, zStem + 0.006],
      [0.490, 0.985, zStem + 0.006],
    ],
    0.007,
    TURQUOISE,
    "filigreeUpperCurl",
  );

  rod(
    [
      [0.525, 0.735, zStem + 0.006],
      [0.610, 0.690, zStem + 0.006],
      [0.700, 0.705, zStem + 0.006],
      [0.742, 0.765, zStem + 0.006],
      [0.722, 0.820, zStem + 0.006],
      [0.660, 0.838, zStem + 0.006],
      [0.635, 0.805, zStem + 0.006],
    ],
    0.007,
    TURQUOISE,
    "filigreeLowerCurl",
  );

  // Six pearl leaves alternate sides of the stem.
  leaf(0.455, 0.765, -1, 1, CREAM, "leafA");
  leaf(0.505, 0.905, 1, 1, TURQUOISE, "leafB");
  leaf(0.615, 1.020, -1, 1, CREAM, "leafC");
  leaf(0.620, 1.155, 1, 1, TURQUOISE, "leafD");
  leaf(0.525, 1.265, -1, 1, CREAM, "leafE");
  leaf(0.675, 0.730, 1, 1, CREAM, "leafF");

  // Three flowers: cream petals with turquoise alternating petals and ruby/gold centers.
  flower(0.455, 0.805, 0.82, [CREAM, TURQUOISE, CREAM, TURQUOISE], "flowerBottom");
  flower(0.585, 1.015, 1.0, [CREAM, CREAM, TURQUOISE, CREAM, TURQUOISE], "flowerMiddle");
  flower(0.470, 1.285, 0.86, [TURQUOISE, CREAM, TURQUOISE, CREAM, CREAM], "flowerTop");

  // Tiny brass rivets punctuate the vine intersections and frame the emblem.
  const studs: [number, number][] = [
    [0.410, 0.700],
    [0.690, 1.050],
    [0.445, 1.355],
    [0.400, 0.920],
    [0.735, 0.755],
    [0.525, 0.680],
    [0.650, 1.205],
    [0.405, 1.135],
  ];
  studs.forEach(([x, y], i) => bead(x, y, 0.286, 0.010, GOLD, `filigreeRivet${i}`));

  // A restrained dark keyline behind the upper and lower scrolls makes the relief read against pearl.
  rod(
    [
      [0.385, 0.985, 0.250],
      [0.410, 1.075, 0.250],
      [0.485, 1.105, 0.250],
    ],
    0.003,
    INK,
    "upperScrollKeyline",
  );
  rod(
    [
      [0.610, 0.690, 0.250],
      [0.705, 0.700, 0.250],
      [0.755, 0.770, 0.250],
    ],
    0.003,
    INK,
    "lowerScrollKeyline",
  );
}
    return addLeftShellFiligree;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addKeyboardLabels(b: Builder) {
  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 82">
      <defs>
        <linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff9e9"/>
          <stop offset=".28" stop-color="#b9e8df"/>
          <stop offset=".55" stop-color="#f4c7cf"/>
          <stop offset=".78" stop-color="#fff2c9"/>
          <stop offset="1" stop-color="#9acfc8"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="414" height="76" rx="15" fill="url(#pearl)" stroke="#c88f32" stroke-width="5"/>
      <path d="M18 18 Q90 8 165 18 T312 18 T402 18" fill="none" stroke="#fffdf1" stroke-width="3" opacity=".8"/>
      <text x="210" y="54" text-anchor="middle"
        font-family="Georgia,serif" font-size="29" font-weight="bold"
        letter-spacing="2.5" fill="#5b1729" stroke="#fff8e8" stroke-width="1.1"
        paint-order="stroke">ACCORDI ITALIANI</text>
    </svg>`,
    { size: 256 },
  );

  const labelX = -0.56;
  const labelY = 1.485;
  const labelZ = 0.397;
  const labelW = 0.355;
  const labelH = 0.068;

  // Raised gold mounting plate and a second inset pearl layer give the tiny plaque
  // a convincing jewelry-like thickness.
  box(b, [labelW + 0.034, labelH + 0.026, 0.018], PALETTE.BRASS_DARK, [
    labelX,
    labelY,
    0.376,
  ], "keyboardNameplateMount", 0.008);

  box(b, [labelW + 0.018, labelH + 0.012, 0.014], PALETTE.GOLD_HI, [
    labelX,
    labelY,
    0.388,
  ], "keyboardNameplateGold", 0.006);

  b.part(new THREE.PlaneGeometry(labelW, labelH), "#ffffff", {
    at: [labelX, labelY, labelZ],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "keyboardLabel",
  });

  // Ruby terminal cabochons, each with a dark bezel and a small highlight.
  for (const x of [labelX - labelW / 2 - 0.025, labelX + labelW / 2 + 0.025]) {
    cylinder(b, 0.018, 0.018, PALETTE.BRASS_DARK, [x, labelY, 0.391], "labelJewelBezel", 10);
    cylinder(b, 0.012, 0.022, PALETTE.RUBY, [x, labelY, 0.404], "labelRuby", 10);
    cylinder(b, 0.0035, 0.006, PALETTE.RUBY_HI, [x - 0.004, labelY + 0.004, 0.417], "labelRubyGlint", 8);
  }

  // Tiny gold music-mark ornaments make the clear space above the keys feel intentional.
  for (const [x, y, scale] of [
    [-0.735, 1.535, 1],
    [-0.39, 1.535, 0.82],
  ] as const) {
    cylinder(b, 0.006 * scale, 0.008, PALETTE.GOLD_HI, [x, y, 0.394], "labelMusicNoteHead", 8);
    trimLine(
      b,
      [x + 0.005 * scale, y + 0.003, 0.394],
      [x + 0.005 * scale, y + 0.035 * scale, 0.394],
      0.0035 * scale,
      PALETTE.GOLD,
      "labelMusicNoteStem",
    );
    trimLine(
      b,
      [x + 0.005 * scale, y + 0.035 * scale, 0.394],
      [x + 0.019 * scale, y + 0.029 * scale, 0.394],
      0.003 * scale,
      PALETTE.GOLD,
      "labelMusicNoteFlag",
    );
  }

  // A second, jewel-like twelve-button array is added as raised caps over the
  // bass-face field. The staggered rows echo traditional Italian accordions.
  const rows = [
    { y: 1.345, xs: [0.455, 0.565, 0.675] },
    { y: 1.145, xs: [0.425, 0.525, 0.625] },
    { y: 0.935, xs: [0.425, 0.525, 0.625] },
    { y: 0.725, xs: [0.455, 0.565, 0.675] },
  ];

  let index = 0;
  for (const row of rows) {
    for (const x of row.xs) {
      const color =
        index % 3 === 0
          ? PALETTE.PEARL_HI
          : index % 3 === 1
            ? PALETTE.TURQUOISE
            : PALETTE.RUBY_HI;

      // Deep bezel, pale intermediate washer, and coloured pearl cap.
      cylinder(b, 0.041, 0.014, PALETTE.BRASS_DARK, [x, row.y, 0.345], `s23BassBezel${index}`, 12);
      cylinder(b, 0.035, 0.012, PALETTE.GOLD_HI, [x, row.y, 0.356], `s23BassWasher${index}`, 12);
      cylinder(b, 0.029, 0.018, color, [x, row.y, 0.367], `s23BassPearl${index}`, 12);

      // Offset specular pearl fleck and a fine engraved crescent.
      cylinder(
        b,
        0.006,
        0.004,
        color === PALETTE.RUBY_HI ? "#ffb7a4" : PALETTE.PEARL_HI,
        [x - 0.009, row.y + 0.010, 0.379],
        `s23BassHighlight${index}`,
        8,
      );
      trimLine(
        b,
        [x - 0.015, row.y - 0.012, 0.379],
        [x + 0.012, row.y - 0.017, 0.379],
        0.0022,
        color === PALETTE.PEARL_HI ? PALETTE.PEARL_BLUE : PALETTE.PEARL_HI,
        `s23BassCrescent${index}`,
      );
      index++;
    }
  }

  // Small brass separators reinforce the four-row layout without crowding the buttons.
  for (const y of [1.245, 1.04, 0.83]) {
    trimLine(b, [0.405, y, 0.337], [0.705, y, 0.337], 0.0025, PALETTE.GOLD, `s23BassRowDivider${y}`);
  }
}
    return addKeyboardLabels;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBellowsCorners(b: Builder) {
  const gold = PALETTE.GOLD;
  const brightGold = PALETTE.GOLD_HI;
  const burgundy = PALETTE.BURGUNDY;
  const darkLeather = PALETTE.BELLOWS_DARK;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
  ) =>
    b.part(geometry, color, {
      at,
      name,
      flat: true,
    });

  const guardBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, name);

  const rivet = (x: number, y: number, name: string, radius = 0.012) =>
    part(
      new THREE.CylinderGeometry(radius, radius * 0.9, 0.018, 8),
      brightGold,
      [x, y, 0.337],
      name,
    );

  const foldCount = 9;
  const yBottom = 0.455;
  const yTop = 1.555;
  const foldSpacing = 0.0975;

  for (let i = 0; i < foldCount; i++) {
    const x = -0.39 + i * foldSpacing;

    // Dark leather binding laid over each bellows ridge.
    guardBox(
      [0.031, 1.075, 0.032],
      darkLeather,
      [x, 1.005, 0.292],
      `s24LeatherBinding${i}`,
    );

    // Warm burgundy leather face inset, making the binding read as stitched material
    // rather than another metal rib.
    guardBox(
      [0.019, 1.035, 0.039],
      burgundy,
      [x, 1.005, 0.311],
      `s24LeatherFace${i}`,
    );

    // Small gold end guards at both ends of every fold.
    guardBox(
      [0.073, 0.034, 0.046],
      gold,
      [x, yTop, 0.326],
      `s24TopCornerGuard${i}`,
    );
    guardBox(
      [0.073, 0.034, 0.046],
      gold,
      [x, yBottom, 0.326],
      `s24BottomCornerGuard${i}`,
    );

    // Raised center ridge on each cap catches the light like pressed brass.
    guardBox(
      [0.014, 0.041, 0.012],
      brightGold,
      [x, yTop - 0.002, 0.354],
      `s24TopGuardRidge${i}`,
    );
    guardBox(
      [0.014, 0.041, 0.012],
      brightGold,
      [x, yBottom + 0.002, 0.354],
      `s24BottomGuardRidge${i}`,
    );

    // Four punched brass rivets secure each leather binding.
    rivet(x - 0.018, yTop - 0.002, `s24RivetTopL${i}`);
    rivet(x + 0.018, yTop - 0.002, `s24RivetTopR${i}`);
    rivet(x - 0.018, yBottom + 0.002, `s24RivetBottomL${i}`);
    rivet(x + 0.018, yBottom + 0.002, `s24RivetBottomR${i}`);

    // Two tiny cream stitch marks down the exposed leather, repeated consistently.
    for (const y of [0.73, 1.28]) {
      guardBox(
        [0.009, 0.034, 0.009],
        PALETTE.PEARL_GOLD,
        [x, y, 0.338],
        `s24LeatherStitch${i}_${y}`,
      );
    }
  }

  // A continuous dark leather binding at the upper and lower bellows ends.
  // It visually ties the individual fold guards together without flattening the pleats.
  guardBox(
    [0.87, 0.035, 0.034],
    darkLeather,
    [0, yTop - 0.006, 0.285],
    "s24BellowsUpperEndBinding",
  );
  guardBox(
    [0.87, 0.035, 0.034],
    darkLeather,
    [0, yBottom + 0.006, 0.285],
    "s24BellowsLowerEndBinding",
  );

  // Fine brass edging on the two bindings.
  guardBox(
    [0.86, 0.010, 0.041],
    gold,
    [0, yTop - 0.029, 0.315],
    "s24UpperBindingGoldEdge",
  );
  guardBox(
    [0.86, 0.010, 0.041],
    gold,
    [0, yBottom + 0.029, 0.315],
    "s24LowerBindingGoldEdge",
  );
}
    return addBellowsCorners;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addGrille(b: Builder) {
  const cx = -0.53;
  const cy = 0.63;

  const dark = PALETTE.BELLOWS_DARK;
  const gold = PALETTE.GOLD;
  const goldHi = PALETTE.GOLD_HI;
  const turquoise = PALETTE.TURQUOISE;
  const turquoiseDark = PALETTE.TURQUOISE_DARK;
  const pearl = PALETTE.PEARL_HI;

  const zBack = 0.292;
  const zLattice = 0.325;
  const zFrame = 0.345;

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, caps: "round", name });

  // Deep inset behind the grille, with a smaller central shadow panel to give the
  // ornament a real recessed speaker cavity.
  b.part(new THREE.BoxGeometry(0.335, 0.215, 0.026), dark, {
    at: [cx, cy, zBack],
    name: "grilleStage2Inset",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.292, 0.171, 0.012), PALETTE.BLACK, {
    at: [cx, cy, zBack + 0.017],
    name: "grilleStage2InnerShadow",
    flat: true,
  });

  // Rounded rectangular gold frame, built from stout rods and spherical corner
  // bosses so the outline reads as cast metal rather than a flat decal.
  const halfW = 0.187;
  const halfH = 0.126;
  const corner = 0.034;
  const left = cx - halfW;
  const right = cx + halfW;
  const bottom = cy - halfH;
  const top = cy + halfH;

  rod([left + corner, bottom, zFrame], [right - corner, bottom, zFrame], 0.012, gold, "grilleFrameBottom");
  rod([left + corner, top, zFrame], [right - corner, top, zFrame], 0.012, goldHi, "grilleFrameTop");
  rod([left, bottom + corner, zFrame], [left, top - corner, zFrame], 0.012, gold, "grilleFrameLeft");
  rod([right, bottom + corner, zFrame], [right, top - corner, zFrame], 0.012, goldHi, "grilleFrameRight");

  for (const [i, p] of [
    [0, [left, bottom, zFrame]],
    [1, [right, bottom, zFrame]],
    [2, [right, top, zFrame]],
    [3, [left, top, zFrame]],
  ] as Array<[number, [number, number, number]]>) {
    b.part(new THREE.SphereGeometry(0.022, 8, 5), goldHi, {
      at: p,
      name: `grilleFrameCorner${i}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.010, 7, 4), pearl, {
      at: [p[0], p[1], p[2] + 0.015],
      name: `grilleCornerPearl${i}`,
      flat: true,
    });
  }

  // Turquoise diagonal lattice. The alternating diagonals make a small
  // diamond pattern while the darker second layer gives the holes depth.
  const innerL = cx - 0.151;
  const innerR = cx + 0.151;
  const innerB = cy - 0.091;
  const innerT = cy + 0.091;

  const addDiagonalSet = (reverse: boolean, color: string, prefix: string) => {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      if (!reverse) {
        const x0 = innerL + t * (innerR - innerL);
        const x1 = Math.min(innerR, x0 + 0.115);
        const y0 = innerB;
        const y1 = innerB + ((x1 - x0) / 0.115) * (innerT - innerB);
        rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
        if (x0 > innerL + 0.01) {
          const sx = x0;
          const ex = Math.max(innerL, x0 - 0.115);
          const sy = innerT;
          const ey = innerT - ((sx - ex) / 0.115) * (innerT - innerB);
          rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Upper${i}`);
        }
      } else {
        const x0 = innerL + t * (innerR - innerL);
        const x1 = Math.min(innerR, x0 + 0.115);
        const y0 = innerT;
        const y1 = innerT - ((x1 - x0) / 0.115) * (innerT - innerB);
        rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
        if (x0 > innerL + 0.01) {
          const sx = x0;
          const ex = Math.max(innerL, x0 - 0.115);
          const sy = innerB;
          const ey = innerB + ((sx - ex) / 0.115) * (innerT - innerB);
          rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Lower${i}`);
        }
      }
    }
  };

  addDiagonalSet(false, turquoiseDark, "grilleDarkCrossA");
  addDiagonalSet(true, turquoise, "grilleTurquoiseCrossB");

  // A raised central rosette echoes the shell's Italian mother-of-pearl language
  // without obscuring the grille openings.
  b.part(new THREE.CylinderGeometry(0.040, 0.040, 0.014, 12), gold, {
    at: [cx, cy, zFrame + 0.012],
    dir: [0, 0, 1],
    name: "grilleRosetteHub",
    flat: true,
  });

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.sin(a) * 0.058;
    const y = cy + Math.cos(a) * 0.058;
    const petalColor = i % 2 === 0 ? pearl : turquoise;
    b.part(new THREE.SphereGeometry(0.020, 8, 5), petalColor, {
      at: [x, y, zFrame + 0.018],
      name: `grilleRosettePetal${i}`,
      flat: true,
    });
  }

  b.part(new THREE.SphereGeometry(0.014, 8, 5), PALETTE.RUBY_HI, {
    at: [cx, cy, zFrame + 0.039],
    name: "grilleRosetteRuby",
    flat: true,
  });

  // Tiny brass studs at the midpoints make the frame feel hand-riveted.
  const studs: Array<[number, number]> = [
    [left + 0.045, bottom],
    [right - 0.045, bottom],
    [left + 0.045, top],
    [right - 0.045, top],
    [left, cy],
    [right, cy],
  ];
  studs.forEach(([x, y], i) => {
    b.part(new THREE.SphereGeometry(0.010, 7, 4), goldHi, {
      at: [x, y, zFrame + 0.016],
      name: `grilleRivet${i}`,
      flat: true,
    });
  });
}
    return addGrille;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addShoulderStraps(b: Builder) {
  const P = PALETTE;

  const rearZ = -0.292;
  const strapZ = -0.315;
  const buckleZ = -0.342;

  const addBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const addCylinder = (
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    name: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 0.92, depth, 10), color, {
      at,
      dir: [0, 0, 1],
      name,
      flat: true,
    });

  // Broad burgundy leather shoulder straps, each assembled from overlapping
  // panels so the padded middle and hardware read as crafted attachments.
  for (const side of [-1, 1]) {
    const x = side * 0.385;

    addBox([0.13, 0.28, 0.038], P.STRAP, [x, 1.50, strapZ], `s26strap${side}Upper`);
    addBox([0.13, 0.33, 0.042], P.STRAP, [x, 1.20, strapZ], `s26strap${side}PadBase`);
    addBox([0.13, 0.32, 0.038], P.STRAP, [x, 0.82, strapZ], `s26strap${side}Lower`);
    addBox([0.13, 0.32, 0.038], P.STRAP, [x, 0.55, strapZ], `s26strap${side}Tail`);

    // Raised pearl-colored shoulder pad with contrasting stepped edges.
    addBox(
      [0.19, 0.28, 0.055],
      P.PEARL,
      [x, 1.31, rearZ - 0.006],
      `s26pad${side}`,
      [0, 0, side * 0.045],
    );
    addBox([0.16, 0.04, 0.064], P.PEARL_HI, [x, 1.46, rearZ - 0.012], `s26pad${side}Top`);
    addBox([0.16, 0.04, 0.064], P.PEARL_BLUE, [x, 1.16, rearZ - 0.012], `s26pad${side}Bottom`);
    addBox([0.018, 0.27, 0.068], P.GOLD, [x - 0.095, 1.31, rearZ - 0.014], `s26pad${side}EdgeL`);
    addBox([0.018, 0.27, 0.068], P.GOLD, [x + 0.095, 1.31, rearZ - 0.014], `s26pad${side}EdgeR`);

    // Repeated cream saddle-stitch marks down both sides of the leather.
    for (const dx of [-0.048, 0.048]) {
      for (let i = 0; i < 11; i++) {
        const y = 0.54 + i * 0.102;
        addBox(
          [0.011, 0.036, 0.012],
          P.PEARL_GOLD,
          [x + dx, y, buckleZ + 0.003],
          `s26stitch${side}${dx}${i}`,
        );
      }
    }

    // Brass buckle with dark leather inset and raised tongue.
    const buckleY = 0.96;
    b.part(new THREE.TorusGeometry(0.071, 0.012, 6, 12), P.GOLD, {
      at: [x, buckleY, buckleZ],
      name: `s26buckle${side}Frame`,
      flat: true,
    });
    addBox([0.105, 0.042, 0.018], P.BRASS_DARK, [x, buckleY, buckleZ - 0.006], `s26buckle${side}Inset`);
    addBox([0.018, 0.09, 0.025], P.GOLD_HI, [x, buckleY, buckleZ - 0.018], `s26buckle${side}Tongue`);

    // Brass anchor plates and paired rivets at the top and bottom.
    for (const y of [1.59, 0.43]) {
      addBox([0.18, 0.055, 0.048], P.BRASS_DARK, [x, y, rearZ], `s26anchor${side}${y}`);
      addCylinder(0.018, 0.022, P.GOLD_HI, [x - 0.061, y, buckleZ], `s26anchorRivet${side}${y}L`);
      addCylinder(0.018, 0.022, P.GOLD_HI, [x + 0.061, y, buckleZ], `s26anchorRivet${side}${y}R`);
    }
  }

  // Small crossed keeper straps bridge the harness behind the bellows.
  addBox([0.52, 0.055, 0.035], P.STRAP, [0, 1.54, -0.304], "s26rearUpperKeeper", [0, 0, 0.08]);
  addBox([0.52, 0.055, 0.035], P.STRAP, [0, 0.47, -0.304], "s26rearLowerKeeper", [0, 0, -0.08]);

  // Four ruby cabochons on the right shell and four matching turquoise
  // cabochons on the opposite shell.
  const jewels = [
    { x: -0.69, color: P.RUBY, hi: P.RUBY_HI, tag: "R" },
    { x: -0.41, color: P.RUBY, hi: P.RUBY_HI, tag: "R" },
    { x: 0.41, color: P.TURQUOISE, hi: P.PEARL_BLUE, tag: "L" },
    { x: 0.69, color: P.TURQUOISE, hi: P.PEARL_HI, tag: "L" },
  ];

  for (const jewel of jewels) {
    for (const y of [0.48, 1.51]) {
      const key = `s26jewel${jewel.tag}${jewel.x}${y}`;

      addCylinder(0.057, 0.018, P.BRASS_DARK, [jewel.x, y, 0.298], `${key}Bezel`);
      addCylinder(0.043, 0.026, P.GOLD, [jewel.x, y, 0.314], `${key}GoldRing`);

      b.part(new THREE.SphereGeometry(0.043, 8, 5), jewel.color, {
        at: [jewel.x, y, 0.335],
        scale: [1, 1, 0.52],
        name: `${key}Stone`,
        flat: true,
      });

      b.part(new THREE.SphereGeometry(0.010, 6, 4), jewel.hi, {
        at: [jewel.x - 0.014, y + 0.014, 0.357],
        scale: [1, 1, 0.35],
        name: `${key}Glint`,
        flat: true,
      });
    }
  }
}
    return addShoulderStraps;
  })(),
);
