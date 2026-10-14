import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description:
    "A cherry-red desk typewriter: cream keys on a sloped deck, a black rubber platen and a sheet of typed paper.",
};

// Palette
const RED = "#b8322a";
const CHARCOAL = "#1e2026";
const TRAY = "#2a2d36";
const CREAM = "#f3ead3";
const CHROME = "#c5cad3";
const INK = "#2a2a33";
const RUBBER = "#17181c";
const GOLD = "#d9a441";
const PAPER = "#fbf7ec";

// Keyboard deck: top surface at y = DECK_Y when z = 0, falling toward the typist (+Z).
const DECK_Y = 0.17;
const DECK_TILT = 0.38;
const TAN = Math.tan(DECK_TILT);
const COS = Math.cos(DECK_TILT);
const SIN = Math.sin(DECK_TILT);

// Sheet of paper in front of the platen, leaning back slightly.
const PAPER_TILT = -0.12;
const PAPER_Y = 0.27;
const PAPER_Z = -0.066;
const PCOS = Math.cos(PAPER_TILT);
const PSIN = Math.sin(PAPER_TILT);

// Point on the deck's top surface above depth z, lifted d along the deck normal.
function onDeck(x: number, z: number, d: number): [number, number, number] {
  const top = DECK_Y - TAN * z;
  return [x, top + d * COS, z + d * SIN];
}

// Point on the sheet: u across, v up from its centre, lifted along its normal.
function onPaper(u: number, v: number, lift: number): [number, number, number] {
  return [u, PAPER_Y + v * PCOS - lift * PSIN, PAPER_Z + v * PSIN + lift * PCOS];
}

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const carriage = b.joint("carriage", { at: [0, 0.23, -0.1], parent: base });

  // A box centred on `at`, optionally tilted about X.
  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    at: [number, number, number],
    tilt = 0,
    bone = base,
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (tilt) g.rotateX(tilt);
    b.part(g, color, { at, bone });
  };

  // A cylinder lying along X, centred on `at`.
  const rod = (
    r: number,
    len: number,
    color: string,
    at: [number, number, number],
    bone = base,
  ) => {
    const g = new THREE.CylinderGeometry(r, r, len, 20);
    g.rotateZ(Math.PI / 2);
    b.part(g, color, { at, bone });
  };

  const ball = (r: number, color: string, at: [number, number, number], bone = base) => {
    b.part(new THREE.SphereGeometry(r, 16, 10), color, { at, bone });
  };

  // Plinth, body, rear housing
  box(0.42, 0.05, 0.29, CHARCOAL, [0, 0.025, 0]);
  box(0.4, 0.07, 0.27, RED, [0, 0.085, 0.005]);
  box(0.4, 0.05, 0.13, RED, [0, 0.145, -0.065]);

  // Chrome pinlines where the body meets the deck and along the front
  box(0.404, 0.008, 0.274, CHROME, [0, 0.12, 0.005]);
  box(0.4, 0.006, 0.004, CHROME, [0, 0.062, 0.1415]);

  // Side details: gold badge on the right, vent slats on the left
  box(0.004, 0.024, 0.07, GOLD, [0.2015, 0.095, 0.01]);
  for (const y of [0.078, 0.094, 0.11]) {
    box(0.004, 0.005, 0.06, CHARCOAL, [-0.2015, y, 0.01]);
  }

  // Carriage rail on top of the housing
  box(0.4, 0.012, 0.02, CHROME, [0, 0.176, -0.1]);

  // Sloped keyboard deck and the dark tray the keys sit in
  box(0.4, 0.03, 0.152, RED, onDeck(0, 0.07, -0.015), DECK_TILT);
  box(0.37, 0.004, 0.14, TRAY, onDeck(0, 0.072, 0), DECK_TILT);

  // Keys: a cap on the tray, with a small raised letter mark on top
  const KH = 0.012;
  const KD = 0.022;
  const P = 0.031;
  const key = (x: number, z: number, w: number, color: string, mark = true) => {
    box(w, KH, KD, color, onDeck(x, z, KH / 2), DECK_TILT);
    if (mark) {
      box(0.0095, 0.0016, 0.0095, INK, onDeck(x, z, KH + 0.0009), DECK_TILT);
    }
  };

  // Row 1
  for (let i = 0; i < 11; i++) key((i - 5) * P, 0.025, 0.026, CREAM);
  // Row 2
  for (let i = 0; i < 10; i++) key((i - 4.5) * P, 0.055, 0.026, CREAM);
  // Row 3: chrome shift keys either side
  key(-0.1665, 0.085, 0.03, CHROME, false);
  key(0.1665, 0.085, 0.03, CHROME, false);
  for (let i = 0; i < 9; i++) key((i - 4) * P, 0.085, 0.026, CREAM);
  // Row 4: two end keys and the space bar
  key(-0.105, 0.115, 0.024, CREAM);
  key(0.105, 0.115, 0.024, CREAM);
  key(0, 0.115, 0.14, CREAM, false);

  // Carriage: platen, end collars, side arms
  rod(0.03, 0.36, RUBBER, [0, 0.23, -0.1], carriage);
  rod(0.031, 0.012, CHROME, [0.176, 0.23, -0.1], carriage);
  rod(0.031, 0.012, CHROME, [-0.176, 0.23, -0.1], carriage);
  box(0.012, 0.065, 0.05, CHROME, [0.175, 0.1975, -0.1], 0, carriage);
  box(0.012, 0.065, 0.05, CHROME, [-0.175, 0.1975, -0.1], 0, carriage);

  // Gold platen knob on the left, chrome return lever with a red knob on the right
  rod(0.007, 0.03, CHROME, [-0.19, 0.23, -0.1], carriage);
  rod(0.02, 0.03, GOLD, [-0.21, 0.23, -0.1], carriage);
  rod(0.007, 0.06, CHROME, [0.205, 0.232, -0.1], carriage);
  ball(0.016, RED, [0.238, 0.232, -0.1], carriage);

  // Sheet of paper hanging in front of the platen
  box(0.3, 0.2, 0.002, PAPER, [0, PAPER_Y, PAPER_Z], PAPER_TILT, carriage);

  // Typed lines: [length, height on the sheet, ink]. The title is in red.
  const lines: [number, number, string][] = [
    [0.16, 0.08, RED],
    [0.24, 0.058, INK],
    [0.22, 0.04, INK],
    [0.24, 0.022, INK],
    [0.18, 0.004, INK],
    [0.23, -0.014, INK],
    [0.2, -0.032, INK],
    [0.09, -0.05, INK],
  ];
  for (const [len, v, color] of lines) {
    box(len, 0.006, 0.001, color, onPaper(-0.12 + len / 2, v, 0.0018), PAPER_TILT, carriage);
  }

  return b.root;
}
