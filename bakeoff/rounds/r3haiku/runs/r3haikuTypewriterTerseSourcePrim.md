```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description: "A cream desktop typewriter with red cheeks, a black key bank on a slope, a chrome-trimmed platen and a sheet of typed paper.",
};

const CREAM = "#e8dcc2";
const RED = "#c4432c";
const INK = "#1f1f24";
const CHROME = "#c3c7cc";

// The keyboard deck slopes up toward the front, 12 degrees.
const TILT = -12 * (Math.PI / 180);
const DECK = { y: 0.13, z: 0.04 };
const UP = [0, Math.cos(TILT), Math.sin(TILT)];      // deck normal
const FORWARD = [0, -Math.sin(TILT), Math.cos(TILT)]; // up the slope, toward the front
const DECK_HALF = 0.015;

/** A point on the deck: x across, d up the slope, h above the top surface. */
const onDeck = (x: number, d: number, h: number): [number, number, number] => {
  const s = DECK_HALF + h;
  return [x, DECK.y + UP[1] * s + FORWARD[1] * d, DECK.z + UP[2] * s + FORWARD[2] * d];
};

// Side profile in (z, y), extruded into both cheeks.
const cheek: [number, number][] = [
  [0.14, 0.02],
  [0.14, 0.14],
  [-0.02, 0.15],
  [-0.08, 0.26],
  [-0.16, 0.26],
  [-0.16, 0.02],
];

const sheet = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="#f7f1e1"/>
  <line x1="44" y1="0" x2="44" y2="200" stroke="#c4432c" stroke-width="2"/>
  <line x1="0" y1="176" x2="300" y2="176" stroke="#9fb3c8" stroke-width="1.5"/>
  <text x="56" y="44" font-family="Courier New, monospace" font-size="20" fill="#2a2a2e">TO BE, OR NOT TO BE,</text>
  <text x="56" y="84" font-family="Courier New, monospace" font-size="20" fill="#2a2a2e">THAT IS THE QUESTION.</text>
  <text x="56" y="124" font-family="Courier New, monospace" font-size="20" fill="#2a2a2e">_ _ _ _ _ _ _ _ _ _</text>
</svg>`);

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("frame", { at: [0, 0, 0] });

  // Feet, base plate, body and keyboard deck.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.012, b.segments(10)), INK, {
        at: [sx * 0.19, 0.006, sz * 0.11],
      });

  b.part(new THREE.BoxGeometry(0.46, 0.02, 0.3), INK, { at: [0, 0.022, 0] });
  b.part(new THREE.BoxGeometry(0.44, 0.09, 0.26), CREAM, { at: [0, 0.065, 0] });
  b.part(new THREE.BoxGeometry(0.42, 0.03, 0.2), CREAM, {
    at: [0, DECK.y, DECK.z],
    rotation: [-12, 0, 0],
  });
  // Back hood that carries the platen.
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.08), CREAM, { at: [0, 0.19, -0.12] });

  // Red cheeks, one on each side.
  b.extrude(cheek, { name: "cheekL", color: RED, at: [0.225, 0, 0], thickness: 0.02 });
  b.extrude(cheek, { name: "cheekR", color: RED, at: [-0.225, 0, 0], thickness: 0.02 });

  // Keys: four rows of ten on the slope, shift keys in red, plus a chrome space bar.
  const rows = [-0.045, -0.015, 0.015, 0.045];
  const keyTop = new THREE.CylinderGeometry(0.0095, 0.011, 0.008, b.segments(10));
  rows.forEach((d, r) => {
    for (let i = 0; i < 10; i++) {
      const x = -0.17 + i * 0.0378;
      const shift = r === 0 && (i === 0 || i === 9);
      b.part(keyTop, shift ? RED : INK, {
        at: onDeck(x, d, 0.004),
        rotation: [-12, 0, 0],
      });
    }
  });
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.04), CHROME, {
    at: onDeck(0, 0.078, 0.006),
    rotation: [-12, 0, 0],
  });

  // Platen with a knob at its right end, carriage brackets and the paper.
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.42, b.segments(16)), INK, {
    at: [0, 0.29, -0.06],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), RED, { at: [0.235, 0.29, -0.06] });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.05), CHROME, { at: [sx * 0.2, 0.265, -0.06] });

  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.003), "#ffffff", {
    at: [0, 0.36, -0.095],
    rotation: [-6, 0, 0],
    texture: sheet,
  });

  return b.root;
}
```