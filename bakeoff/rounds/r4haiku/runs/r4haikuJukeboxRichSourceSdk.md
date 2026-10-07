```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mix, paint, smoothstep, svg } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "1950s diner jukebox",
  description:
    "A cream and cherry jukebox with chrome trim: a neon arch of red, amber and teal tubes over a domed window holding a stack of records and their picker arm, a starburst speaker grille, three rows of chrome selection buttons with title cards, and a coin slot.",
};

// Palette
const CREAM = "#f1e6cb";
const CHERRY = "#c3202c";
const CHERRY_DEEP = "#9c1a25";
const NAVY = "#141c34";
const CHROME_TINT = "#d9dee4";
const GRIP = "#2b2f36";
const SLOT = "#0d0d10";
const TUBE_RED = "#ff4040";
const TUBE_AMBER = "#ffb000";
const TUBE_TEAL = "#27d6bf";
const BUTTONS = ["#d62828", "#f7a30b", "#1fa397"];
const RECORDS = ["#d62828", "#f7a30b", "#1fa397", "#f4ecd8", "#d62828"];
const TONES = ["#c1121f", "#d97706", "#0f7c74"];
const TITLES = [
  "ROCK ALL NITE",
  "TUTTI FRUTTI",
  "MOONGLOW",
  "PEGGY SUE",
  "BLUE SUEDE",
  "JAILHOUSE",
  "ROCKIN ROBIN",
  "SHAKE IT UP",
  "LONG TALL",
  "TEDDY BEAR",
  "LOVE ME",
  "BIG MAMA",
];

// Layout in meters. The cabinet front is at z = 0.26, the head front at z = 0.24.
const ARCH_Y = 1.37;
const HEAD_FRONT = 0.24;
const DOME = { y: 1.28, r: 0.13, hole: 0.0836, rimZ: 0.3396 };
const COLUMNS = [-0.1725, -0.0575, 0.0575, 0.1725];
const ROWS = [1.005, 0.865, 0.725];

const grey = (v: number): Rgb => [v, v, v];

/** Chrome: bright on faces turned up toward the light, a dark horizon line, faint streaks. */
const chrome = paint((p, n) => {
  const horizon = Math.exp(-n.y * n.y * 16);
  const light = 0.5 + 0.3 * n.y + 0.2 * Math.max(0, 0.75 * n.z - 0.35 * n.x);
  const streak = 0.03 * Math.sin(p.z * 160 + p.y * 25);
  return grey(Math.min(1, Math.max(0, light - 0.14 * horizon + streak)));
});

/** Lacquer: `side` on the flanks, `front` on the face, chrome where the surface turns up. */
const lacquer = (side: string, front: string) =>
  paint((_p, n) => mix(mix(side, front, smoothstep(0.55, 0.9, n.z)), CHROME_TINT, smoothstep(0.6, 0.92, n.y)));

/** The navy board behind the neon, glowing faintly round the record window. */
const backboard = paint((p, n) => {
  if (n.z < 0.5) return NAVY;
  return mix("#2c4378", NAVY, smoothstep(0.06, 0.3, Math.hypot(p.x, p.y - 1.3)));
});

/** Dark glass with a sheen on the faces that catch the light. */
const glass = paint((_p, n) => {
  const lit = Math.max(0, -0.5 * n.x + 0.6 * n.y + 0.62 * n.z);
  return mix("#0b2c38", "#c9f6f4", 0.85 * smoothstep(0.6, 0.98, lit));
});

/** Neon tube: the colour, lifted toward white on the side facing the viewer, so it reads as lit. */
const neon = (tube: string) => paint((_p, n) => mix(tube, "#fff3dc", 0.55 * smoothstep(0.3, 0.95, n.z)));

/** Speaker grille: twelve bright and dark rays about the centre, with a chrome hub. */
const starburst = paint((_p, _n, s) => {
  const r = Math.hypot(s[0], s[1]);
  const ray = smoothstep(-0.3, 0.3, Math.sin(Math.atan2(s[1], s[0]) * 12));
  const face = mix("#8f1b24", "#f8ebcf", ray);
  return mix(face, "#dfe5ea", smoothstep(0.075, 0.06, r));
});

/** Coin plate: chrome with a dark slot cut through its face. */
const coinPlate = paint((p, n, s) => {
  if (n.z > 0.5 && Math.abs(s[0]) < 0.0035 && Math.abs(s[1]) < 0.016) return SLOT;
  return chrome.at(p, n);
});

/** A record seen from above: a grooved black face round a coloured label, and a coloured edge. */
const record = (label: string) =>
  paint((p, n) => {
    if (n.y < 0.5) return label;
    const d = Math.hypot(p.x, p.z - 0.27);
    if (d < 0.02) return label;
    return mix("#121212", "#2b2b2b", 0.5 + 0.5 * Math.sin(d * 700));
  });

/** A rounded rectangle outline, centred on the origin. */
function roundRect(w: number, h: number, r: number, steps = 3): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  const corners: Array<[number, number, number]> = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (Math.PI / 2) * (i / steps);
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return points;
}

/** An arch in the x-y plane: straight legs from `bottom` up to ARCH_Y, a half circle of radius `hw` above. */
function archOutline(hw: number, bottom: number, steps = 12): Array<[number, number]> {
  const points: Array<[number, number]> = [
    [-hw, bottom],
    [-hw, ARCH_Y],
  ];
  for (let i = 1; i < steps; i++) {
    const a = Math.PI - (Math.PI * i) / steps;
    points.push([hw * Math.cos(a), ARCH_Y + hw * Math.sin(a)]);
  }
  points.push([hw, ARCH_Y], [hw, bottom]);
  return points;
}

/** The arch as a 3D path at depth z, from one leg to the other. */
function archPath(hw: number, bottom: number, z: number) {
  return archOutline(hw, bottom).map(([x, y]): [number, number, number] => [x, y, z]);
}

/** A title card: cream paper, a coloured border and the title, drawn as an SVG texture. */
function titleCard(title: string, tone: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">` +
      `<rect x="3" y="3" width="234" height="58" rx="10" fill="#fff6e3" stroke="${tone}" stroke-width="6"/>` +
      `<text x="120" y="42" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" ` +
      `font-size="26" fill="${tone}" textLength="204" lengthAdjust="spacingAndGlyphs">${title}</text>` +
      `</svg>`,
    { size: 512 },
  );
}

export default function jukebox() {
  const b = createBuilder({ name: "jukebox", paintSize: 2048 });
  b.joint("cabinet", { at: [0, 0, 0] });
  b.joint("picker", { at: [0.1, 1.4, 0.25], parent: "cabinet" });

  // Chrome plinth, cream cabinet with a cherry front, cherry head on top.
  b.extrude(
    [
      [-0.22, 0],
      [0.24, 0],
      [0.26, 0.04],
      [0.26, 0.14],
      [-0.24, 0.14],
      [-0.24, 0.04],
    ],
    { color: chrome, at: [0, 0, 0], thickness: 0.6, bevel: 0.02, name: "plinth" },
  );
  b.extrude(
    [
      [-0.2, 0.14],
      [0.23, 0.14],
      [0.26, 0.2],
      [0.26, 1.12],
      [-0.24, 1.12],
      [-0.24, 0.2],
    ],
    { color: lacquer(CREAM, CHERRY), at: [0, 0, 0], thickness: 0.6, bevel: 0.025, name: "cabinet" },
  );
  b.extrude(
    [
      [-0.22, 1.12],
      [0.24, 1.12],
      [0.24, 1.62],
      [0.2, 1.67],
      [-0.14, 1.68],
      [-0.22, 1.6],
    ],
    { color: lacquer(CHERRY_DEEP, CHERRY), at: [0, 0, 0], thickness: 0.54, bevel: 0.02, name: "head" },
  );

  // Chrome trim along the cabinet top, and pinstripes down both flanks.
  b.rod([-0.27, 1.12, 0.262], [0.27, 1.12, 0.262], 0.008, { color: chrome, name: "trim.top" });
  for (const side of [1, -1])
    for (const y of [0.3, 1.0])
      b.rod([0.302 * side, y, -0.22], [0.302 * side, y, 0.22], 0.0065, { color: chrome, name: "trim.side" });

  // The arch: a navy board, a chrome rim, and three concentric neon tubes.
  b.extrude(archOutline(0.245, 1.14), {
    color: backboard,
    at: [0, 0, HEAD_FRONT],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    name: "arch.board",
  });
  b.sweep(catmull(archPath(0.245, 1.14, 0.25)), 0.007, { color: chrome, sides: 8, name: "trim.arch" });
  const NEON = [
    { hw: 0.22, color: TUBE_RED, name: "neon.red" },
    { hw: 0.19, color: TUBE_AMBER, name: "neon.amber" },
    { hw: 0.16, color: TUBE_TEAL, name: "neon.teal" },
  ];
  for (const tube of NEON)
    b.sweep(catmull(archPath(tube.hw, 1.16, 0.257)), 0.011, {
      color: neon(tube.color),
      sides: 10,
      name: tube.name,
    });

  // The domed window: a glass dome cut open at its apex, a chrome base ring and a chrome rim at the opening.
  b.part(
    new THREE.SphereGeometry(DOME.r, b.segments(20), b.segments(12), 0, Math.PI * 2, 0.698, 0.8727),
    glass,
    { at: [0, DOME.y, HEAD_FRONT], dir: [0, 0, 1], name: "dome.glass" },
  );
  b.part(new THREE.TorusGeometry(DOME.r, 0.008, 10, 40), chrome, {
    at: [0, DOME.y, HEAD_FRONT],
    name: "dome.base",
  });
  b.part(new THREE.TorusGeometry(DOME.hole, 0.006, 10, 32), chrome, {
    at: [0, DOME.y, DOME.rimZ],
    name: "dome.rim",
  });

  // The record stack, seen through the opening.
  RECORDS.forEach((label, i) =>
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.008, 28), record(label), {
      at: [0, 1.25 + i * 0.017, 0.27],
      name: "record",
    }),
  );

  // The picker arm: a chrome boss on the board, an arm over the stack, and a grip on the top record.
  b.part(new THREE.SphereGeometry(0.013, 12, 8), chrome, {
    at: [0.1, 1.4, 0.25],
    bone: "picker",
    name: "picker.boss",
  });
  b.sweep(
    catmull([
      [0.1, 1.4, 0.262],
      [0.095, 1.43, 0.335],
      [0.06, 1.37, 0.35],
      [0.035, 1.345, 0.31],
    ]),
    0.0065,
    { color: chrome, bone: "picker", sides: 8, name: "picker.arm" },
  );
  b.part(new THREE.BoxGeometry(0.02, 0.016, 0.026), GRIP, {
    at: [0.035, 1.335, 0.31],
    bone: "picker",
    name: "picker.grip",
  });

  // Speaker grille: a chrome frame and a starburst panel.
  b.extrude(roundRect(0.46, 0.34, 0.035), {
    color: chrome,
    at: [0, 0.4, 0.262],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    name: "grille.frame",
  });
  b.extrude(roundRect(0.4, 0.3, 0.03), {
    color: starburst,
    at: [0, 0.4, 0.268],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    name: "grille",
  });

  // Selection panel: cream paper, three rows of chrome buttons, a title card above each.
  b.extrude(roundRect(0.52, 0.48, 0.03), {
    color: grain("#f7f0dc", "#ebe0c4", { size: 0.04, axis: "x" }),
    at: [0, 0.845, 0.262],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    name: "panel",
  });
  ROWS.forEach((y, r) =>
    COLUMNS.forEach((x, c) => {
      const title = TITLES[r * 4 + c];
      const tone = TONES[(r + c) % 3];
      const cap = BUTTONS[(r + 2 * c) % 3];
      b.part(new THREE.CylinderGeometry(0.0185, 0.0185, 0.01, 20), chrome, {
        at: [x, y, 0.272],
        dir: [0, 0, 1],
        name: "button.bezel",
      });
      b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 20), cap, {
        at: [x, y, 0.28],
        dir: [0, 0, 1],
        name: "button",
      });
      b.part(new THREE.PlaneGeometry(0.1, 0.1 / 3.75), "#ffffff", {
        at: [x, y + 0.034, 0.272],
        texture: titleCard(title, tone),
        name: "card",
      });
    }),
  );

  // Coin slot, with its coin return knob.
  b.extrude(roundRect(0.05, 0.07, 0.012), {
    color: coinPlate,
    at: [0.19, 0.645, 0.272],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.01,
    bevel: 0.003,
    name: "coin.plate",
  });
  b.part(new THREE.SphereGeometry(0.009, 12, 8), BUTTONS[0], {
    at: [0.135, 0.645, 0.28],
    name: "coin.return",
  });

  return b.root;
}
```