```ts
import * as THREE from "three";
import { catmull, createBuilder, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "1930s typewriter",
  description:
    "Glossy racing-green portable typewriter: round keys with cream letters on chrome rims in four staggered rows, a semicircular typebar basket, a chrome carriage-return lever, a black platen with a half-typed sheet, and a brass maker's badge.",
};

type Rgb = [number, number, number];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Colours
const CHROME = "#cbd0d6";
const BLACK = "#16181b";
const ROLLER = "#0c0d0f";
const BRASS = "#b98b46";

// Lacquered racing green: deep in the shadows, richer on top, a glint on the highest faces, and a cream pinstripe
// along each side.
const DEEP: Rgb = [0.015, 0.13, 0.07];
const RICH: Rgb = [0.03, 0.29, 0.16];
const GLOSS: Rgb = [0.55, 0.78, 0.66];
const CREAM: Rgb = [0.86, 0.8, 0.56];
const RACING = paint((p, n) => {
  const lift = ease(-0.2, 0.9, n.y);
  let c = mixRgb(DEEP, RICH, 0.25 + 0.6 * lift);
  const pin = ease(0.0026, 0.0012, Math.abs(p.y - 0.058)) * ease(0.6, 0.9, Math.abs(n.x));
  c = mixRgb(c, CREAM, pin);
  const glint = ease(0.93, 1, n.y) * 0.3 + ease(0.85, 1, n.z) * 0.06;
  return mixRgb(c, GLOSS, glint);
});

// Layout, in meters: +Y up, the machine faces +Z where the operator sits.
// The keyboard deck falls toward the operator; the platen is at the back, raised above the housing.
const DECK = { z: 0.158, y: 0.088, slope: 0.263 };
const deckY = (z: number) => DECK.y + (DECK.z - z) * DECK.slope;
const DECK_UP = new THREE.Vector3(0, 1, DECK.slope).normalize();

const PLATEN_Y = 0.225;
const PLATEN_Z = -0.068;
const PLATEN_R = 0.026;
// The printing point: where the typebars strike, on the platen's front skin.
const STRIKE = new THREE.Vector3(0, PLATEN_Y, PLATEN_Z + PLATEN_R);

const X = new THREE.Vector3(1, 0, 0);
const BASKET_DIR = new THREE.Vector3(0, -0.7, 0.714).normalize();
const BASKET_R = 0.125;
const BARS = 36;

const ROWS = [
  { z: 0.03, shift: 0, keys: "1234567890" },
  { z: 0.064, shift: 0.4, keys: "QWERTYUIOP" },
  { z: 0.098, shift: 0.8, keys: "ASDFGHJKL" },
  { z: 0.131, shift: 1.2, keys: "ZXCVBNM" },
];
const PITCH = 0.0265;

const PAPER_W = 0.21;
const PAPER_H = 0.17;
const TILT = (12 * Math.PI) / 180;

const TYPED = [
  "Dear Mr. Halden,",
  "Thank you for your letter of the third.",
  "I enclose the revised proofs as agreed,",
  "and will return the corrected sheets by",
  "Friday. Should the second order be",
  "delayed any further, kindly wire the",
  "works at once so that we may arrange",
];

export default function typewriter() {
  const b = createBuilder({ name: "typewriter", paintSize: 1024 });
  const frame = b.joint("frame", { at: [0, 0, 0] });

  // Housing: a side profile (z, y) pushed across the width.
  b.extrude(
    [
      [-0.15, 0.03],
      [0.15, 0.03],
      [0.166, 0.044],
      [0.166, 0.08],
      [DECK.z, DECK.y],
      [0.01, 0.127],
      [-0.012, 0.142],
      [-0.03, 0.16],
      [-0.12, 0.16],
      [-0.15, 0.147],
    ],
    {
      color: RACING,
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.42,
      bevel: 0.012,
      smoothing: 1,
      name: "housing",
    },
  );

  // Chrome trim along the front lip of the deck.
  b.rod([-0.19, 0.0835, 0.163], [0.19, 0.0835, 0.163], 0.0024, { color: CHROME, name: "frontTrim" });

  // Rubber feet, standing on the floor.
  const FEET: Array<[number, number]> = [
    [-0.16, -0.115],
    [0.16, -0.115],
    [-0.16, 0.115],
    [0.16, 0.115],
  ];
  for (const [x, z] of FEET)
    b.part(new THREE.CylinderGeometry(0.013, 0.015, 0.036, b.segments(14)), ROLLER, {
      at: [x, 0.018, z],
      name: "foot",
    });

  // Carriage end brackets, rounded over the platen.
  const BRACKET: number[][] = [
    [-0.108, 0.15],
    [-0.028, 0.15],
    [-0.024, 0.2],
    [-0.028, 0.24],
    [-0.068, 0.262],
    [-0.108, 0.24],
    [-0.112, 0.2],
  ];
  for (const x of [-0.14, 0.14])
    b.extrude(BRACKET, {
      color: RACING,
      at: [x, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      smoothing: 2,
      name: "bracket",
    });

  // Carriage rail behind the platen.
  b.rod([-0.14, 0.19, -0.104], [0.14, 0.19, -0.104], 0.0045, { color: CHROME, name: "carriageRail" });

  // Black platen roller on a chrome spindle, with a knob on the left.
  b.part(new THREE.CylinderGeometry(PLATEN_R, PLATEN_R, 0.27, b.segments(24)), ROLLER, {
    at: [0, PLATEN_Y, PLATEN_Z],
    dir: [1, 0, 0],
    name: "platen",
  });
  b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.026, b.segments(12)), CHROME, {
    at: [-0.147, PLATEN_Y, PLATEN_Z],
    dir: [1, 0, 0],
    name: "platenSpindle",
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, b.segments(18)), ROLLER, {
    at: [-0.166, PLATEN_Y, PLATEN_Z],
    dir: [1, 0, 0],
    name: "platenKnob",
  });

  // Carriage-return lever: a hinged chrome arm on the right, with a black grip.
  const PIVOT = [0.146, PLATEN_Y, PLATEN_Z];
  const lever = b.joint("lever", { parent: frame, at: PIVOT, dir: [0, 1, 0], role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.012, b.segments(12)), CHROME, {
    at: PIVOT,
    dir: [1, 0, 0],
    bone: lever,
    name: "leverBoss",
  });
  const ARM = [
    PIVOT,
    [0.158, 0.214, -0.044],
    [0.17, 0.198, -0.01],
    [0.177, 0.18, 0.018],
    [0.179, 0.164, 0.044],
  ];
  b.sweep(catmull(ARM), 0.0042, { color: CHROME, bone: lever, name: "leverArm" });
  b.part(new THREE.SphereGeometry(0.0125, b.segments(14), b.segments(10)), BLACK, {
    at: [0.179, 0.164, 0.044],
    bone: lever,
    name: "leverGrip",
  });

  // Typebar basket: thin bars fanned in a semicircle, all aimed at the printing point, and a chrome rail through
  // their tails.
  const tails: THREE.Vector3[] = [];
  for (let i = 0; i < BARS; i++) {
    const a = Math.PI * (0.03 + (0.94 * i) / (BARS - 1));
    const tail = STRIKE.clone()
      .addScaledVector(X, BASKET_R * Math.cos(a))
      .addScaledVector(BASKET_DIR, BASKET_R * Math.sin(a));
    tails.push(tail);
    const tip = STRIKE.clone().lerp(tail, 0.06);
    const bar = tip.clone().sub(tail);
    b.part(new THREE.BoxGeometry(0.0022, bar.length(), 0.0022), CHROME, {
      at: tail.clone().add(tip).multiplyScalar(0.5),
      dir: bar.normalize(),
      name: `typebar.${i + 1}`,
    });
  }
  b.sweep(catmull(tails), 0.0017, { color: CHROME, name: "basketRail" });

  // Keys: black caps with cream letters on chrome rims, four staggered rows along the sloped deck.
  const glyphs = new Map<string, THREE.Texture>();
  const glyph = (ch: string) => {
    let texture = glyphs.get(ch);
    if (!texture) {
      texture = svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
          `<text x="50" y="50" dy="0.35em" text-anchor="middle" font-family="Futura, 'Century Gothic', Arial, sans-serif" font-weight="600" font-size="64" fill="#efe6c9">${ch}</text></svg>`,
        { size: 128 },
      );
      glyphs.set(ch, texture);
    }
    return texture;
  };
  for (const row of ROWS) {
    [...row.keys].forEach((ch, i) => {
      const x = (i - (row.keys.length - 1) / 2 + row.shift) * PITCH;
      const seat = new THREE.Vector3(x, deckY(row.z), row.z);
      const cap = seat.clone().addScaledVector(DECK_UP, 0.0045);
      const rim = seat.clone().addScaledVector(DECK_UP, 0.0105);
      const face = seat.clone().addScaledVector(DECK_UP, 0.0118);
      b.part(new THREE.CylinderGeometry(0.0088, 0.0098, 0.014, b.segments(16)), BLACK, {
        at: cap,
        dir: DECK_UP,
        up: [0, 0, 1],
        name: `key.${ch}`,
      });
      b.part(
        new THREE.TorusGeometry(0.0096, 0.0014, b.segments(8), b.segments(20)).rotateX(Math.PI / 2),
        CHROME,
        { at: rim, dir: DECK_UP, name: `rim.${ch}` },
      );
      b.part(new THREE.CircleGeometry(0.008, b.segments(16)).rotateX(-Math.PI / 2), "#ffffff", {
        at: face,
        dir: DECK_UP,
        up: [0, 0, 1],
        texture: glyph(ch),
        name: `glyph.${ch}`,
      });
    });
  }

  // Brass maker's badge on the front, with rivets and an engraved name.
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44">` +
      `<text x="60" y="31" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" letter-spacing="3" fill="#3a2810">VELOX</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.048, 0.015, 0.002), BRASS, { at: [0, 0.062, 0.166], name: "badgePlate" });
  b.part(new THREE.PlaneGeometry(0.04, 0.04 * (44 / 120)), "#ffffff", {
    at: [0, 0.062, 0.1675],
    texture: badge,
    name: "badgeLettering",
  });
  for (const x of [-0.0205, 0.0205])
    for (const y of [0.0565, 0.0675])
      b.part(new THREE.SphereGeometry(0.0014, 8, 6), BRASS, { at: [x, y, 0.1675], name: "rivet" });

  // The sheet on the platen: the top half typed, leaning back from the roller's front.
  const sheet = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 170">` +
      `<rect width="210" height="170" fill="#f4efdf"/>` +
      `<line x1="17" y1="0" x2="17" y2="170" stroke="#d98577" stroke-width="0.5"/>` +
      `<g font-family="'Courier New', Courier, monospace" font-size="5.6" fill="#2a2620">` +
      TYPED.map((line, i) => `<text x="24" y="${26 + i * 9.5}">${line}</text>`).join("") +
      `</g></svg>`,
    { size: 512 },
  );
  const sheetUp = new THREE.Vector3(0, Math.cos(TILT), -Math.sin(TILT));
  const sheetFront = new THREE.Vector3(0, Math.sin(TILT), Math.cos(TILT));
  const sheetBase = new THREE.Vector3(0, PLATEN_Y, PLATEN_Z + PLATEN_R + 0.0004);
  b.part(new THREE.BoxGeometry(PAPER_W, PAPER_H, 0.0007), "#ffffff", {
    at: sheetBase.clone().addScaledVector(sheetUp, PAPER_H / 2),
    dir: sheetUp,
    up: sheetFront,
    texture: sheet,
    name: "sheet",
  });

  return b.root;
}
```