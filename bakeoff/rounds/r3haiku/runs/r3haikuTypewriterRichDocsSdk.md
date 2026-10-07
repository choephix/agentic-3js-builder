```ts
import * as THREE from "three";
import { createBuilder, bezier, svg } from "agentic-3js-builder";

export const meta = {
  name: "Halcyon Standard No. 9",
  description:
    "A 1930s office typewriter in racing green: cream-lettered keys on chrome rims in four staggered rows, a fan of type bars, a chrome carriage-return lever, a black platen with a half-typed letter, and a brass maker's badge.",
};

const GREEN = "#0d4a2c";
const CHROME = "#cdd2d8";
const STEEL = "#aab0b8";
const BLACK = "#141414";

type V3 = [number, number, number];

// Key surface normal (leans forward and up on the sloped deck).
const N: V3 = [0, 0.882, 0.471];

// Deck runs from the front lip (z 0.15, y 0.07) to the back (z 0, y 0.15).
function deckAt(x: number, t: number): V3 {
  return [x, 0.07 + 0.08 * t, 0.15 - 0.15 * t];
}

function lift(p: V3, d: number): V3 {
  return [p[0] + N[0] * d, p[1] + N[1] * d, p[2] + N[2] * d];
}

// Key rows, back (numbers) to front (Z row). Each row is one band of the sheet.
const KEY_ROWS: { keys: string; t: number; shift: number }[] = [
  { keys: "1234567890", t: 0.9, shift: 0 },
  { keys: "QWERTYUIOP", t: 0.63, shift: 0.0165 },
  { keys: "ASDFGHJKL", t: 0.37, shift: 0 },
  { keys: "ZXCVBNM", t: 0.11, shift: 0.0165 },
];

// One sheet holds every key face: 10 columns by 4 rows, cream letters on black.
function keySheetSvg(): string {
  let cells = "";
  KEY_ROWS.forEach((row, r) => {
    [...row.keys].forEach((ch, j) => {
      const cx = j * 64 + 32;
      const cy = r * 64 + 32;
      cells +=
        `<circle cx="${cx}" cy="${cy}" r="31" fill="#1b1d1c"/>` +
        `<circle cx="${cx}" cy="${cy}" r="27" fill="none" stroke="#2c2f2d" stroke-width="1.5"/>` +
        `<text x="${cx}" y="${cy + 13}" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#efe3c2">${ch}</text>`;
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 256">${cells}</svg>`;
}

const PAPER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 200">
<rect width="210" height="200" fill="#f3ecd6"/>
<line x1="20" y1="0" x2="20" y2="200" stroke="#c0654b" stroke-width="0.6"/>
<g font-family="Courier New, Courier, monospace" font-size="6.6" fill="#2b2620">
<text x="26" y="22">Dear Mr. Hollis,</text>
<text x="26" y="36">Thank you for your letter of the 3rd inst.,</text>
<text x="26" y="46">and for the enclosed schedule. The figures</text>
<text x="26" y="56">have been checked twice by our accounts</text>
<text x="26" y="66">office, and I can confirm the quarter closed</text>
<text x="26" y="76">with a surplus of forty-one pounds.</text>
<text x="26" y="90">I shall call on Thursday at ten o'clock</text>
<text x="26" y="100">to go through the remaining items with you.</text>
</g>
</svg>`;

const BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 56">
<rect x="2" y="2" width="136" height="52" rx="6" fill="#c9a15a" stroke="#7a5a22" stroke-width="3"/>
<rect x="8" y="8" width="124" height="40" rx="3" fill="none" stroke="#7a5a22" stroke-width="1.2"/>
<text x="70" y="30" text-anchor="middle" font-family="Georgia, serif" font-size="15" letter-spacing="2" fill="#2a1d0a">HALCYON</text>
<text x="70" y="43" text-anchor="middle" font-family="Georgia, serif" font-size="7" fill="#2a1d0a">STANDARD NO. 9</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const lever = b.joint("carriageLever", { parent: base, at: [-0.2, 0.26, -0.1] });

  // Casing: a side profile in (z, y), extruded across the width.
  const profile: [number, number][] = [
    [-0.13, 0],
    [0.15, 0],
    [0.15, 0.07],
    [0, 0.15],
    [-0.06, 0.15],
    [-0.06, 0.2],
    [-0.13, 0.2],
  ];
  b.extrude(profile, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.38,
    color: GREEN,
    bone: base,
  });

  // Chrome trim along the front lip and the base.
  b.rod([-0.19, 0.072, 0.152], [0.19, 0.072, 0.152], 0.0045, { color: CHROME, bone: base });
  b.rod([-0.185, 0.006, 0.15], [0.185, 0.006, 0.15], 0.005, { color: CHROME, bone: base });

  // Keys: chrome rim, then a cream-lettered cap from one shared sheet.
  const keySheet = svg(keySheetSvg(), { size: 1024 });
  const PITCH = 0.033;
  KEY_ROWS.forEach((row, r) => {
    const chars = [...row.keys];
    chars.forEach((_, j) => {
      const x = (j - (chars.length - 1) / 2) * PITCH + row.shift;
      const p = deckAt(x, row.t);

      b.part(new THREE.CylinderGeometry(0.0185, 0.0185, 0.008, 20), CHROME, {
        at: lift(p, 0.006),
        dir: N,
        bone: base,
      });

      // Point this key's cap at its cell in the sheet.
      const cap = new THREE.CircleGeometry(0.0165, 20);
      const uv = cap.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i);
        const v = uv.getY(i);
        uv.setXY(i, (j + u) / 10, 1 - (r + 1) / 4 + v / 4);
      }
      b.part(cap, "#ffffff", {
        at: lift(p, 0.0105),
        dir: N,
        axis: "z",
        up: [0, 0, -1],
        texture: keySheet,
        bone: base,
      });
    });
  });

  // Type bars: a fan of thin rods from a semicircle behind the keys to the platen.
  const BARS = 25;
  for (let i = 0; i < BARS; i++) {
    const th = Math.PI * (0.06 + 0.88 * (i / (BARS - 1)));
    const x = 0.17 * Math.cos(th);
    const pivot: V3 = [x, 0.21, -0.035 - 0.045 * Math.sin(th)];
    const tip: V3 = [x * 0.3, 0.262, -0.075];
    b.rod(pivot, tip, 0.0017, { color: STEEL, bone: base });
  }

  // Carriage: green rail, black end brackets, black platen.
  b.part(new THREE.BoxGeometry(0.4, 0.014, 0.05), GREEN, { at: [0, 0.207, -0.1], bone: base });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.018, 0.06, 0.05), BLACK, { at: [s * 0.2, 0.238, -0.1], bone: base });
  }
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.38, 18), BLACK, {
    at: [0, 0.26, -0.1],
    dir: [1, 0, 0],
    bone: base,
  });

  // Half-typed letter, hanging from the front of the platen.
  const paper = svg(PAPER_SVG, { size: 512 });
  b.part(new THREE.PlaneGeometry(0.21, 0.2), "#ffffff", {
    at: [0, 0.37, -0.068],
    dir: [0, 0, 1],
    axis: "z",
    texture: paper,
    bone: base,
  });

  // Carriage-return lever: a chrome arm from the carriage end, with a black knob.
  b.sweep(
    bezier([-0.2, 0.26, -0.1], [-0.235, 0.255, -0.07], [-0.25, 0.225, -0.01], [-0.245, 0.2, 0.035]),
    0.0065,
    { color: CHROME, bone: lever },
  );
  b.part(new THREE.SphereGeometry(0.016, 10, 8), BLACK, { at: [-0.245, 0.2, 0.035], bone: lever });
  b.part(new THREE.SphereGeometry(0.009, 10, 8), CHROME, { at: [-0.2, 0.26, -0.1], bone: lever });

  // Brass maker's badge on the front lip.
  const badge = svg(BADGE_SVG, { size: 512 });
  b.part(new THREE.PlaneGeometry(0.07, 0.028), "#ffffff", {
    at: [0, 0.03, 0.1515],
    dir: [0, 0, 1],
    axis: "z",
    texture: badge,
    bone: base,
  });

  return b.root;
}
```