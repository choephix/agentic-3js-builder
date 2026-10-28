This is a static prop with no joints. It's a workbench with a riveted-free stylised look: a warm wood table, glowing potions, a brass scale, stacked and open books, a mortar with herbs, and a sack on the lower shelf.

```ts
import * as THREE from "three";
import { createBuilder, frame, rng, grain, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "alchemist-workbench",
  description: "A Genshin-style alchemist's workbench: glowing potions, stacked and open books, a brass scale, a mortar of herbs and a sack on the lower shelf.",
};

// Palette: warm wood, gilt trim, bright potion liquids, cream paper.
const WOOD = grain("#a86e3e", "#6e4424", { size: 0.04, axis: "x" });
const DARK_WOOD = grain("#6a4424", "#3e2615", { size: 0.03, axis: "x" });
const GILT = "#e9b94c";
const BRASS = "#d9a441";
const GLASS = "#dff4fb";
const CORK = "#c48a52";
const PAPER = "#f7edd4";
const IRON = "#4b5163";
const STONE = "#b9b0a2";
const SACK = "#dcc48f";
const TEAL = "#3fe6c6";
const MAGENTA = "#ec4f9e";
const AMBER = "#ffb23e";
const EMERALD = "#7ff26a";

// Heights and layout (meters). The table top sits at TOP, the floor is y = 0.
const TOP = 0.9;

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const LEAF = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 C31 14 31 34 16 46 C1 34 1 14 16 2Z" fill="#6fd65c" stroke="#1d4d2a" stroke-width="2"/>
    <path d="M16 7 L16 42 M16 16 L8 22 M16 26 L24 32 M16 16 L24 20 M16 30 L9 35" stroke="#1d4d2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

const SPRIG = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2 C27 12 28 30 16 46 C4 30 5 12 16 2Z" fill="#9be36a" stroke="#2c5b2e" stroke-width="2"/>
    <path d="M16 6 L16 42" stroke="#2c5b2e" stroke-width="1.6"/>
  </svg>`,
  { size: 128 },
);

const RUNE_CIRCLE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#3b6cc9" stroke-width="3"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#3b6cc9" stroke-width="2"/>
    <path d="M50 16 L78 66 L22 66Z M50 84 L22 34 L78 34Z" fill="none" stroke="#2e56a8" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="6" fill="#e9b94c"/>
  </svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg viewBox="0 0 50 36" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="48" height="34" rx="5" fill="#fbf3dc" stroke="#6b4024" stroke-width="2.4"/>
    <path d="M9 12 H41 M9 20 H30 M9 28 H22" stroke="#6b4024" stroke-width="3" stroke-linecap="round"/>
    <path d="M38 22 l2 -4 l2 4 l4 0 l-3 2 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -2z" fill="#e9b94c"/>
  </svg>`,
  { size: 128 },
);

const coverCache = new Map<string, THREE.Texture>();
/** A book cover in one colour, with a gilt border and a star emblem. */
function coverTexture(color: string) {
  let t = coverCache.get(color);
  if (!t) {
    t = svg(
      `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="140" fill="${color}"/>
        <rect x="8" y="8" width="84" height="124" fill="none" stroke="${GILT}" stroke-width="4"/>
        <rect x="16" y="16" width="68" height="108" fill="none" stroke="${GILT}" stroke-width="1.6"/>
        <path d="M50 42 L56 60 L75 60 L60 71 L66 90 L50 79 L34 90 L40 71 L25 60 L44 60Z" fill="${GILT}"/>
      </svg>`,
      { size: 256 },
    );
    coverCache.set(color, t);
  }
  return t;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "alchemist-workbench" });
  const jit = rng(11);

  // Plain box helper: a size, a model-space centre, a colour and extra part options.
  const bx = (w: number, h: number, d: number, at: [number, number, number], color: any, extra: object = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...extra });

  // A round-bottomed or tall glass flask standing on the table at (x, TOP, z).
  // `profile` is the glass outline (solid, from the axis out and back), `liquid` the inner fill.
  function flask(
    x: number,
    z: number,
    colour: string,
    kind: "round" | "tall",
  ) {
    const at: [number, number, number] = [x, TOP, z];
    const round = kind === "round";
    const glassProfile: [number, number][] = round
      ? [[0, 0], [0.05, 0], [0.065, 0.04], [0.068, 0.09], [0.05, 0.12], [0.02, 0.14], [0.02, 0.18], [0, 0.18]]
      : [[0, 0], [0.042, 0], [0.048, 0.02], [0.048, 0.16], [0.028, 0.2], [0.024, 0.26], [0.024, 0.3], [0, 0.3]];
    const liquidProfile: [number, number][] = round
      ? [[0, 0.01], [0.056, 0.01], [0.061, 0.04], [0.061, 0.08], [0.046, 0.1], [0, 0.1]]
      : [[0, 0.01], [0.04, 0.01], [0.044, 0.03], [0.044, 0.13], [0.026, 0.17], [0, 0.17]];
    b.lathe(glassProfile, { at, color: GLASS, segments: 12 });
    glow(b.lathe(liquidProfile, { at, color: colour, segments: 12 }), 1.3);
    const top = round ? 0.18 : 0.3;
    b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.03, 10), CORK, { at: [x, TOP + top + 0.012, z] });
    // A little brass collar under the cork.
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 10), BRASS, { at: [x, TOP + top - 0.004, z] });
    // Paper label on the front face.
    const labelY = round ? 0.06 : 0.1;
    const labelZ = round ? 0.066 : 0.047;
    b.part(new THREE.PlaneGeometry(0.05, 0.036), "#ffffff", {
      at: [x, TOP + labelY, z + labelZ],
      dir: [0, 0, 1],
      axis: "z",
      texture: LABEL,
    });
  }

  // ---- Table: top, legs, gilt trim, lower shelf, apron ----
  bx(1.3, 0.04, 0.62, [0, TOP - 0.02, 0], WOOD, { name: "tableTop" });
  for (const x of [-0.58, 0.58])
    for (const z of [-0.26, 0.26]) bx(0.07, 0.86, 0.07, [x, 0.43, z], DARK_WOOD);
  bx(1.3, 0.012, 0.012, [0, TOP + 0.002, 0.31], GILT);
  bx(1.3, 0.012, 0.012, [0, TOP + 0.002, -0.31], GILT);
  bx(0.012, 0.012, 0.62, [0.65, TOP + 0.002, 0], GILT);
  bx(0.012, 0.012, 0.62, [-0.65, TOP + 0.002, 0], GILT);
  bx(1.12, 0.02, 0.5, [0, 0.25, 0], DARK_WOOD, { name: "lowerShelf" });
  bx(1.2, 0.1, 0.03, [0, 0.8, 0.27], DARK_WOOD);
  bx(1.2, 0.1, 0.03, [0, 0.8, -0.27], DARK_WOOD);
  bx(0.03, 0.1, 0.5, [0.58, 0.8, 0], DARK_WOOD);
  bx(0.03, 0.1, 0.5, [-0.58, 0.8, 0], DARK_WOOD);

  // ---- Lower shelf: a crate and a sack ----
  bx(0.22, 0.16, 0.2, [-0.36, 0.26 + 0.08, -0.1], WOOD);
  bx(0.23, 0.012, 0.21, [-0.36, 0.26 + 0.166, -0.1], GILT);
  b.lathe(
    [[0, 0], [0.1, 0], [0.12, 0.08], [0.07, 0.2], [0.03, 0.24], [0, 0.25]],
    { at: [0.1, 0.26, 0.05], color: SACK, segments: 10 },
  );
  b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.03, 8), CORK, { at: [0.1, 0.26 + 0.25, 0.05] });

  // ---- Potions along the back ----
  flask(-0.52, -0.18, TEAL, "tall");
  flask(-0.39, -0.18, MAGENTA, "round");
  flask(-0.26, -0.18, AMBER, "tall");
  flask(-0.13, -0.18, EMERALD, "round");

  // ---- Books, left side ----
  const stack: [string, number, number][] = [
    ["#2e5fb0", 0.035, 0],
    ["#b8373b", 0.035, 0.034],
    ["#3c8a4e", 0.034, 0.068],
  ];
  for (const [color, h, dy] of stack) {
    const y = TOP + h / 2 + dy;
    bx(0.19, h, 0.14, [-0.44, y, 0.12], color, { texture: coverTexture(color) });
    bx(0.18, h * 0.8, 0.135, [-0.44 + 0.006, y, 0.12 + 0.002], PAPER);
  }

  // An open book with a rune circle on its right page.
  bx(0.44, 0.012, 0.16, [-0.36, TOP + 0.006, -0.02], "#7a3d20", { name: "openBookBase" });
  b.part(new THREE.PlaneGeometry(0.2, 0.14), PAPER, {
    at: [-0.46, TOP + 0.014, -0.02],
    rotation: [-90, 0, 4],
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.14), PAPER, {
    at: [-0.26, TOP + 0.014, -0.02],
    rotation: [-90, 0, -4],
  });
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    at: [-0.26, TOP + 0.0175, -0.02],
    rotation: [-90, 0, -4],
    texture: RUNE_CIRCLE,
  });

  // ---- Mortar and pestle with herbs ----
  const MORTAR = [[0, 0], [0.05, 0], [0.08, 0.05], [0.09, 0.12], [0.075, 0.12], [0.065, 0.06], [0, 0.04]] as [number, number][];
  const mortarAt: [number, number, number] = [-0.2, TOP, 0.12];
  b.lathe(MORTAR, { at: mortarAt, color: STONE, segments: 12 });
  b.capsule(
    [mortarAt[0] + 0.03, TOP + 0.09, mortarAt[2] + 0.02],
    [mortarAt[0] + 0.06, TOP + 0.2, mortarAt[2] + 0.03],
    0.016,
    { color: DARK_WOOD },
  );
  const sprigFrames = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + jit() * 0.4;
    const r = 0.03 + jit() * 0.02;
    sprigFrames.push(
      frame([mortarAt[0] + Math.cos(a) * r, TOP + 0.04, mortarAt[2] + Math.sin(a) * r], [0, 1, 0]),
    );
  }
  b.cards(sprigFrames, LEAF, { size: [0.05, 0.09], lean: 22, bend: 14, vary: 0.2, rng: rng(5) });

  // ---- Brass scale, right side ----
  const sx = 0.3;
  const sz = -0.05;
  bx(0.12, 0.02, 0.12, [sx, TOP + 0.01, sz], DARK_WOOD);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 10), BRASS, { at: [sx, TOP + 0.145, sz] });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 10), BRASS, { at: [sx, TOP + 0.27, sz] });
  b.rod([sx - 0.16, TOP + 0.27, sz], [sx + 0.16, TOP + 0.27, sz], 0.008, BRASS);
  for (const side of [-1, 1]) {
    const px = sx + side * 0.16;
    b.part(new THREE.SphereGeometry(0.012, 8, 6), GILT, { at: [px, TOP + 0.27, sz] });
    b.lathe(
      [[0, 0], [0.05, 0], [0.056, 0.01], [0.05, 0.02], [0.045, 0.02], [0, 0.01]],
      { at: [px, TOP + 0.13, sz], color: BRASS, segments: 12 },
    );
    for (const dx of [-0.045, 0.045]) b.rod([px, TOP + 0.27, sz], [px + dx, TOP + 0.14, sz], 0.004, IRON);
  }

  // Small stoppered vials in front, glowing softly.
  glow(
    b.part(new THREE.SphereGeometry(0.03, 10, 8), "#ff8fd0", { at: [0.02, TOP + 0.03, 0.2] }),
    1,
  );
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8), CORK, { at: [0.02, TOP + 0.07, 0.2] });

  // Loose herb bundle on the right.
  const bundle = [];
  for (let i = 0; i < 9; i++) {
    const x = 0.5 + (jit() - 0.5) * 0.08;
    const z = 0.14 + (jit() - 0.5) * 0.06;
    bundle.push(frame([x, TOP + 0.005, z], [0, 1, 0]));
  }
  b.cards(bundle, SPRIG, { size: [0.05, 0.1], lean: 14, bend: 18, cross: true, vary: 0.25, rng: rng(9) });
  b.lathe(
    [[0, 0], [0.02, 0], [0.02, 0.03], [0.026, 0.05], [0, 0.05]],
    { at: [0.5, TOP, 0.14], color: "#c9a25c", segments: 8 },
  );

  return b.root;
}
```