```ts
import * as THREE from "three";
import { createBuilder, paint, svg } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description: "A hot-air balloon about to take off: striped envelope with a checked band, glowing burner, rope rigging, a wicker basket with sandbags and a little flag.",
};

// Palette
const SUN = "#ffc629";
const TOMATO = "#e8412c";
const SKY = "#6cc3f0";
const CREAM = "#fff4d8";
const BAND = "#d9731f";
const SKIRT = "#2d2a4a";
const WICKER = "#b9824a";
const WICKER_DARK = "#8a5a2e";
const INSIDE = "#5a3b22";
const ROPE = "#e8d9b0";
const SAND = "#d8c08a";
const STEEL = "#5b6470";
const STEEL_LIGHT = "#8a939e";
const FLAME = "#ff7a1a";
const CORE = "#ffd23f";

const STRIPES = [SUN, TOMATO, SKY];

// Envelope: vertical stripes around, a checked band at the middle, a dark skirt at the mouth.
const envelopePaint = paint((_p, _n, s) => {
  const y = s[0];
  const deg = ((s[1] % 360) + 360) % 360;
  if (y < 4.6) return SKIRT;
  if (y >= 8.4 && y <= 10.6) {
    const cell = Math.floor(deg / 15) + Math.floor((y - 8.4) / 0.4);
    return cell % 2 === 0 ? CREAM : BAND;
  }
  return STRIPES[Math.floor(deg / 30) % 3];
});

// Envelope profile, radius (x) against height (y), in metres. Solid, so the mouth is a flat cap.
const envelopeProfile: OutlinePoint[] = [
  [0, 4.0, "sharp"],
  [1.7, 4.0, "sharp"],
  [2.7, 4.6],
  [4.2, 7.0],
  [5.0, 10.0],
  [4.3, 13.0],
  [2.7, 16.0],
  [1.3, 18.0],
  [0.45, 19.2],
  [0, 19.6, "sharp"],
];

// Basket weave: a greyscale drawing, tinted by the wicker colour.
const cells: string[] = [];
for (let r = 0; r < 12; r++) {
  for (let c = 0; c < 16; c++) {
    const x = c * 4 + (r % 2) * 2 - 1;
    const y = r * 5.4 - 0.5;
    cells.push(
      `<rect x="${x}" y="${y}" width="3.4" height="4.2" rx="1.6" fill="#ffffff" stroke="#4a4a4a" stroke-width="1.2"/>`,
    );
  }
}
const weave = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#d8d8d8"/>${cells.join("")}</svg>`,
  { size: 256 },
);

// Point on a circle around the vertical axis, angle in degrees (0 = front, +Z).
const around = (deg: number, r: number, y: number): [number, number, number] => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.sin(a), y, r * Math.cos(a)];
};

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  b.joint("base", { at: [0, 0, 0] });

  // ---- Envelope -----------------------------------------------------------
  b.lathe(envelopeProfile, {
    at: [0, 0, 0],
    segments: 18,
    smoothing: 1,
    color: envelopePaint,
  });

  // ---- Basket -------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.6, 0.5, 1.0, 16, 1, true), WICKER, {
    at: [0, 0.5, 0],
    texture: weave,
  });
  b.part(new THREE.CircleGeometry(0.58, 14), INSIDE, {
    at: [0, 0.95, 0],
    rotation: [-90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.6, 0.045, 6, 16), WICKER_DARK, {
    at: [0, 1.0, 0],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.5, 0.035, 6, 14), WICKER_DARK, {
    at: [0, 0.06, 0],
    rotation: [90, 0, 0],
  });

  // ---- Sandbags hanging from the rim -------------------------------------
  for (const deg of [-38, 22, 96]) {
    const bagY = 0.55;
    b.part(new THREE.SphereGeometry(1, 8, 6), SAND, {
      at: around(deg, 0.6, bagY),
      scale: [0.15, 0.1, 0.07],
      rotation: [0, deg, 0],
    });
    b.rod(around(deg, 0.6, 1.0), around(deg, 0.6, 0.74), 0.012, { color: ROPE });
  }

  // ---- Burner -------------------------------------------------------------
  // Steel posts from inside the basket up to the burner housing.
  for (const deg of [0, 120, 240]) {
    b.rod(around(deg, 0.25, 0.95), around(deg, 0.2, 2.45), 0.018, { color: STEEL });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.4, 0.5), STEEL, { at: [0, 2.65, 0] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 8), STEEL_LIGHT, { at: [0, 3.0, 0] });
  b.part(new THREE.ConeGeometry(0.3, 0.9, 8), FLAME, { at: [0, 3.5, 0] });
  b.part(new THREE.ConeGeometry(0.15, 0.55, 8), CORE, { at: [0, 3.3, 0] });

  // ---- Ropes from the basket corners to the envelope skirt --------------
  for (const corner of [45, 135, 225, 315]) {
    const rimPoint = around(corner, 0.6, 1.0);
    for (const offset of [-16, 16]) {
      b.rod(rimPoint, around(corner + offset, 1.6, 3.95), 0.016, { color: ROPE });
    }
  }

  // ---- Flag on the front-left corner -------------------------------------
  const flagPole = around(45, 0.6, 1.0);
  const poleTop: [number, number, number] = [flagPole[0], 2.1, flagPole[2]];
  b.rod(flagPole, poleTop, 0.012, { color: STEEL_LIGHT });

  const flag: OutlinePoint[] = [
    [0, 0],
    [0.25, 0.04],
    [0.5, 0],
    [0.5, 0.3],
    [0.25, 0.26],
    [0, 0.3],
  ];
  b.extrude(flag, {
    at: [poleTop[0], 1.7, poleTop[2]],
    x: [-1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.01,
    color: TOMATO,
  });

  return b.root;
}
```