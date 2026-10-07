```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description: "A 1930s desk typewriter in racing green: round keys on chrome rims, a fan of type bars, a black platen with a half-typed sheet, a chrome carriage return lever and a brass maker's badge.",
};

const DEG = Math.PI / 180;

export default function typewriter() {
  const b = createBuilder({ name: "typewriter" });

  const GREEN = "#0b4a2f";
  const BLACK = "#151515";
  const KEY = "#1d1e20";
  const CHROME = "#c6ccd3";
  const STEEL = "#aeb4bb";
  const CREAM = "#f1e6c8";

  b.joint("body", { at: [0, 0, 0] });

  // Housing: a side profile pushed across the machine, its corners rounded.
  b.extrude(
    [
      [-0.15, 0.02],
      [0.11, 0.02],
      [0.11, 0.16],
      [-0.15, 0.16],
    ],
    {
      name: "housing",
      color: GREEN,
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.012,
      smoothing: 2,
    },
  );

  // Feet.
  for (const [x, z] of [
    [-0.16, -0.12],
    [0.16, -0.12],
    [-0.16, 0.08],
    [0.16, 0.08],
  ])
    b.part(new THREE.CylinderGeometry(0.018, 0.02, 0.024, b.segments(12)), BLACK, { at: [x, 0.012, z] });

  // Sloped keyboard deck, higher at the back.
  const DECK_TILT = 12 * DEG;
  b.part(new THREE.BoxGeometry(0.36, 0.02, 0.14), GREEN, {
    at: [0, 0.17, 0.05],
    rotation: [-12, 0, 0],
  });
  // Height of the deck's top surface above a given depth z.
  const deckY = (z: number) => 0.18 + (0.05 - z) * Math.tan(DECK_TILT);

  // Type bars: a fan of thin steel bars rising in a semicircle behind the keys.
  const pivot = new THREE.Vector3(0, 0.19, -0.045);
  for (let i = 0; i <= 30; i++) {
    const a = THREE.MathUtils.lerp(18, 162, i / 30) * DEG;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const base = pivot.clone().addScaledVector(dir, 0.03);
    const tip = pivot.clone().addScaledVector(dir, 0.11);
    b.rod(base, tip, 0.0018, { color: STEEL, name: `typebar${i + 1}` });
    b.part(new THREE.BoxGeometry(0.006, 0.006, 0.006), BLACK, {
      at: tip.clone().addScaledVector(dir, 0.003),
      dir,
    });
  }

  // Keys: chrome rims, ebony caps and a cream letter printed on each cap.
  const letters = new Map<string, THREE.Texture>();
  const letter = (ch: string) => {
    let tex = letters.get(ch);
    if (!tex) {
      tex = svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="16" y="16" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${CREAM}">${ch}</text></svg>`,
        { size: 64 },
      );
      letters.set(ch, tex);
    }
    return tex;
  };

  const rows = [
    { keys: "1234567890", x0: -0.135, z: 0.0 },
    { keys: "QWERTYUIOP", x0: -0.12, z: 0.03 },
    { keys: "ASDFGHJKL", x0: -0.105, z: 0.06 },
    { keys: "ZXCVBNM", x0: -0.09, z: 0.09 },
  ];
  for (const { keys, x0, z } of rows) {
    [...keys].forEach((ch, i) => {
      const x = x0 + i * 0.03;
      const y0 = deckY(z);
      b.part(new THREE.CylinderGeometry(0.0115, 0.0118, 0.008, b.segments(18)), CHROME, {
        at: [x, y0 + 0.004, z],
        name: `rim.${ch}`,
      });
      b.part(new THREE.CylinderGeometry(0.0092, 0.0095, 0.006, b.segments(18)), KEY, {
        at: [x, y0 + 0.011, z],
        name: `key.${ch}`,
      });
      b.part(new THREE.PlaneGeometry(0.013, 0.013), "#ffffff", {
        texture: letter(ch),
        at: [x, y0 + 0.0146, z],
        rotation: [-90, 0, 0],
        name: `letter.${ch}`,
      });
    });
  }

  // Space bar across the front of the deck.
  b.part(new THREE.BoxGeometry(0.13, 0.007, 0.02), KEY, {
    at: [0, deckY(0.115) + 0.0035, 0.115],
    name: "spacebar",
  });

  // Carriage uprights and the black platen between them.
  for (const x of [-0.165, 0.165])
    b.part(new THREE.BoxGeometry(0.014, 0.185, 0.03), BLACK, { at: [x, 0.2525, -0.1], name: "upright" });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.4, b.segments(20)), BLACK, {
    at: [0, 0.345, -0.1],
    rotation: [0, 0, 90],
    name: "platen",
  });
  for (const x of [-0.21, 0.21])
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.024, b.segments(14)), CHROME, {
      at: [x, 0.345, -0.1],
      rotation: [0, 0, 90],
      name: "platenKnob",
    });

  // A sheet of paper, half typed, wound over the front of the platen.
  const typed = [
    "Dear Mr. Hollis,",
    "",
    "Thank you for your letter of the 4th.",
    "The machine you asked after is",
    "being held for you at the works,",
    "and we expect to ship it in",
  ];
  const lines = typed
    .map((line, i) => (line ? `<text x="30" y="${44 + i * 13}">${line}</text>` : ""))
    .join("");
  const paper = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 260"><rect width="210" height="260" fill="#f4ecd6"/><line x1="24" y1="0" x2="24" y2="260" stroke="#d9a0a0" stroke-width="1"/><g font-family="Courier New, monospace" font-size="8.5" fill="#23201c">${lines}</g></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.21, 0.26), "#ffffff", {
    texture: paper,
    at: [0, 0.44, -0.07],
    rotation: [15, 0, 0],
    name: "paper",
  });

  // Chrome carriage return lever on the right-hand side of the carriage.
  b.rod([-0.175, 0.3, -0.09], [-0.25, 0.2, -0.03], 0.0055, { color: CHROME, name: "returnLever" });
  b.part(new THREE.SphereGeometry(0.013, b.segments(12), b.segments(8)), CHROME, {
    at: [-0.25, 0.2, -0.03],
    name: "returnKnob",
  });

  // Brass maker's badge on the front of the housing.
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 28"><rect x="1" y="1" width="68" height="26" rx="4" fill="#c9a24a" stroke="#6e4f16" stroke-width="1.5"/><circle cx="6" cy="14" r="1.6" fill="#6e4f16"/><circle cx="64" cy="14" r="1.6" fill="#6e4f16"/><text x="35" y="18" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" letter-spacing="1.5" fill="#3a2708">VELOX</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.07, 0.028), "#ffffff", {
    texture: badge,
    at: [0, 0.085, 0.1112],
    name: "badge",
  });

  return b.root;
}
```