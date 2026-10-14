```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "1930s racing-green typewriter",
  description:
    "A glossy racing-green portable typewriter: cream-lettered round keys on chrome rims in four staggered rows, a fan of type bars, a chrome carriage-return lever, a black platen with a half-typed letter, and a brass maker's badge.",
};

const GREEN = "#14583b";
const KEY_GREEN = "#1d5c3c";
const CHROME = "#d5dbe0";
const STEEL = "#aab2b9";
const BLACK = "#121212";
const CREAM = "#efe6c8";

/** Key letters, one atlas row each, top row first. */
const ATLAS_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM", "1234567890"];

/** Physical key rows, front to back: the atlas row each uses, its position along the deck, and its key count. */
const KEY_ROWS = [
  { atlas: 2, s: 0.16, count: 7 },
  { atlas: 1, s: 0.38, count: 9 },
  { atlas: 0, s: 0.6, count: 10 },
  { atlas: 3, s: 0.82, count: 10 },
];

/** One texture with every key face: cream letters on green discs, 10 columns by 4 rows. */
function keyAtlas() {
  let cells = "";
  ATLAS_ROWS.forEach((letters, r) =>
    [...letters].forEach((ch, c) => {
      const x = c * 100 + 50;
      const y = r * 100 + 50;
      cells +=
        `<circle cx="${x}" cy="${y}" r="47" fill="${KEY_GREEN}"/>` +
        `<text x="${x}" y="${y + 2}" font-family="Georgia, serif" font-size="56" font-weight="bold" ` +
        `fill="#f3ead2" text-anchor="middle" dominant-baseline="central">${ch}</text>`;
    }),
  );
  return svg(`<svg viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`, { size: 1024 });
}

/** A key face's disc, with its UVs moved onto one cell of the atlas. */
function capGeometry(col: number, atlasRow: number) {
  const geometry = new THREE.CircleGeometry(0.0125, 20);
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    uv.setXY(i, (col + u) / 10, 1 - (atlasRow + 1) / 4 + v / 4);
  }
  uv.needsUpdate = true;
  return geometry;
}

/** The sheet of paper, half typed. Its front face carries the drawing. */
function paperSheet() {
  const lines = [
    "DEAR MR HOLLOWAY,",
    "THANK YOU FOR YOUR LETTER OF THE TENTH.",
    "THE SHIPMENT OF FABRIC WILL LEAVE ON",
    "THURSDAY WEATHER PERMITTING AND WE",
    "EXPECT IT AT YOUR WORKS BY MONDAY.",
    "YOURS SINCERELY, R. ASH",
  ];
  const text = lines
    .map(
      (line, i) =>
        `<text x="78" y="${110 + i * 56}" font-family="Courier New, monospace" font-size="30" fill="#2a2a2a">${line}</text>`,
    )
    .join("");
  return svg(
    `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="800" height="600" fill="#f5efdc"/>` +
      `<line x1="58" y1="0" x2="58" y2="600" stroke="#d98a7e" stroke-width="2"/>` +
      text +
      `</svg>`,
    { size: 1024 },
  );
}

/** The brass maker's badge. */
function badge() {
  return svg(
    `<svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="280" height="100" fill="#c9a24a"/>` +
      `<rect x="12" y="12" width="256" height="76" fill="none" stroke="#7a5a1c" stroke-width="4"/>` +
      `<text x="140" y="52" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#3a2a0c" ` +
      `text-anchor="middle" dominant-baseline="central" letter-spacing="3">ROYAL 1934</text>` +
      `</svg>`,
    { size: 512 },
  );
}

export default function typewriter() {
  const b = createBuilder({ name: "typewriter", paintSize: 1024 });
  b.joint("body", { at: [0, 0, 0] });

  const atlas = keyAtlas();
  const paper = paperSheet();
  const brass = badge();

  // Main casing: a low green base, a sloping keyboard deck and a tall back housing carrying the platen.
  b.frustumBox([0, 0.03, -0.12], [0, 0.03, 0.11], [0.42, 0.06], [0.42, 0.06], { color: GREEN, name: "base" });
  b.frustumBox([0, 0.075, 0.1], [0, 0.115, -0.035], [0.4, 0.025], [0.4, 0.025], { color: GREEN, name: "deck" });
  b.frustumBox([0, 0.1, -0.035], [0, 0.1, -0.125], [0.38, 0.14], [0.36, 0.14], { color: GREEN, name: "housing" });

  // Chrome trim: the deck's front lip, the base's sides and the paper bail.
  b.rod([-0.2, 0.08, 0.104], [0.2, 0.08, 0.104], 0.0035, { color: CHROME });
  b.rod([-0.212, 0.04, -0.1], [-0.212, 0.04, 0.1], 0.003, { color: CHROME });
  b.rod([0.212, 0.04, -0.1], [0.212, 0.04, 0.1], 0.003, { color: CHROME });
  b.rod([-0.13, 0.27, -0.07], [0.13, 0.27, -0.07], 0.0035, { color: CHROME });

  // Black rubber feet.
  for (const x of [-0.19, 0.19])
    for (const z of [-0.09, 0.08])
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 12), BLACK, { at: [x, 0.006, z] });

  // Brass maker's badge on the front of the base.
  b.part(new THREE.BoxGeometry(0.07, 0.024, 0.002), "#ffffff", {
    at: [0, 0.03, 0.1125],
    texture: brass,
  });

  // Keyboard: chrome rims with green discs carrying cream letters, on the sloping deck.
  const F = new THREE.Vector3(0, 0.075, 0.1);
  const B = new THREE.Vector3(0, 0.115, -0.035);
  const D = B.clone().sub(F).normalize();
  const N = new THREE.Vector3(0, -D.z, D.y).normalize();
  KEY_ROWS.forEach(({ atlas: row, s, count }, r) => {
    const base = F.clone().lerp(B, s).addScaledVector(N, 0.0125);
    const shift = 0.017 * (r % 2);
    for (let i = 0; i < count; i++) {
      const p = base.clone().add(new THREE.Vector3((i - (count - 1) / 2) * 0.034 + shift, 0, 0));
      b.part(new THREE.CylinderGeometry(0.0145, 0.0145, 0.008, 20), CHROME, {
        at: p.clone().addScaledVector(N, 0.004),
        dir: N,
      });
      b.part(capGeometry(i, row), "#ffffff", {
        at: p.clone().addScaledVector(N, 0.0085),
        dir: N,
        axis: "z",
        texture: atlas,
      });
    }
  });

  // Type bars: a fan of 26 thin steel rods from a curved row of pivots to the platen.
  for (let i = 0; i < 26; i++) {
    const a = i / 25;
    const pivot = [(a - 0.5) * 0.26, 0.065, -0.02 + 0.035 * Math.sin(Math.PI * a)];
    const strike = [(a - 0.5) * 0.34, 0.2, -0.092];
    b.rod(pivot, strike, 0.002, { color: STEEL });
  }

  // Platen: a black roller across the back, with chrome knobs at each end.
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.4, 24), BLACK, {
    at: [0, 0.2, -0.12],
    rotation: [0, 0, 90],
  });
  for (const x of [-0.21, 0.21])
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 16), CHROME, {
      at: [x, 0.2, -0.12],
      rotation: [0, 0, 90],
    });

  // The half-typed sheet, leaning back over the front of the platen.
  b.part(new THREE.BoxGeometry(0.2, 0.15, 0.0012), "#ffffff", {
    at: [0, 0.262, -0.09],
    rotation: [-10, 0, 0],
    texture: paper,
  });

  // Carriage-return lever on the model's right side, with a cream knob.
  b.rod([-0.192, 0.11, -0.07], [-0.236, 0.15, 0.02], 0.0055, { color: CHROME });
  b.part(new THREE.SphereGeometry(0.016, 14, 10), CREAM, { at: [-0.238, 0.152, 0.024] });

  return b.root;
}
```