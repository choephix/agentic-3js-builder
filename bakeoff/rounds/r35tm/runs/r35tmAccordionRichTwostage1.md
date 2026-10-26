```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

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
  box(b, [shellW, shellH, shellD], PALETTE.PEARL, [-0.55, centerY, 0], "rightShell", 0.035);
  box(b, [shellW, shellH, shellD], PALETTE.PEARL, [0.55, centerY, 0], "leftShell", 0.035);
  box(b, [1.02, 1.12, 0.26], PALETTE.BELLOWS_DARK, [0, 1.0, 0], "bellows", 0.015);
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
    box(b, [0.035, 1.08, 0.30], c, [x, 1.0, 0.005], "bellows", 0.004);
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
  box(b, [0.09, 0.80, 0.03], PALETTE.STRAP, [-0.38, 1.02, -0.285], "strap", 0.018);
  box(b, [0.09, 0.80, 0.03], PALETTE.STRAP, [0.38, 1.02, -0.285], "strap", 0.018);
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
```