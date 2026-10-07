```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Hot-air balloon",
  description:
    "A striped hot-air balloon envelope over a wicker basket with burner, propane tanks and suspension ropes.",
};

// Envelope profile, bottom to top: [radius, height] in metres.
const ENVELOPE: number[][] = [
  [1.8, 2.9],
  [2.6, 3.0],
  [4.2, 3.6],
  [5.9, 4.7],
  [7.5, 6.4],
  [8.5, 8.6],
  [8.8, 11.4],
  [8.3, 14.2],
  [6.9, 17.0],
  [4.9, 19.3],
  [2.6, 20.8],
  [0, 21.2],
];

const CREAM = "#f4ecd8";
const RED = "#d8362b";
const YELLOW = "#f2b630";
const BLUE = "#2f6fd0";
const WICKER = "#b98a52";
const WICKER_DARK = "#7a5530";
const STEEL = "#8c9098";
const DARK = "#3b2f2a";
const FLAME = "#ff8a1f";
const TANK = "#c9d1d8";

const v2 = (pts: number[][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));

/** Circle of points at height y, radius r, in the XZ plane. */
function ring(r: number, y: number, n: number, closed = true): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([r * Math.cos(t), y, r * Math.sin(t)]);
  }
  if (closed) pts.push(pts[0]);
  return pts;
}

/** Square loop of wicker reed around the basket at height y. */
function basketLoop(y: number, h: number): number[][] {
  const c = [
    [h, y, h],
    [-h, y, h],
    [-h, y, -h],
    [h, y, -h],
    [h, y, h],
  ];
  return c;
}

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---- Envelope: four colour bands of one turned shape ----
  const bands: { pts: number[][]; color: string }[] = [
    { pts: ENVELOPE.slice(0, 5), color: YELLOW },
    { pts: ENVELOPE.slice(4, 7), color: CREAM },
    { pts: ENVELOPE.slice(6, 9), color: RED },
    { pts: ENVELOPE.slice(8, 12), color: BLUE },
  ];
  for (const band of bands) {
    b.part(
      new THREE.LatheGeometry(v2(band.pts), 24),
      band.color,
      { at: [0, 0, 0] }
    );
  }

  // Gore seams: dark tubes running pole to mouth.
  const SEAMS = 6;
  for (let k = 0; k < SEAMS; k++) {
    const a = (k * Math.PI) / SEAMS;
    const seam: number[][] = ENVELOPE.map(([r, y]) => [
      r * 1.012 * Math.cos(a),
      y,
      r * 1.012 * Math.sin(a),
    ]);
    b.sweep(seam, 0.07, { color: DARK });
  }

  // Mouth rim and pole.
  b.sweep(ring(1.8, 2.9, 20), 0.1, { color: DARK });
  b.sweep(
    [
      [0, 21.2, 0],
      [0, 22.3, 0],
    ],
    0.07,
    { color: DARK }
  );
  // Pennant at the top.
  b.part(new THREE.BoxGeometry(1.0, 0.5, 0.05), RED, {
    at: [0.5, 22.4, 0],
  });

  // ---- Basket: wicker box with rim and feet ----
  b.part(new THREE.BoxGeometry(1.3, 0.9, 1.3), WICKER, { at: [0, 0.75, 0] });
  b.part(new THREE.BoxGeometry(1.44, 0.12, 1.44), WICKER_DARK, {
    at: [0, 1.22, 0],
  });
  b.part(new THREE.BoxGeometry(1.2, 0.06, 1.2), WICKER_DARK, {
    at: [0, 0.3, 0],
  });
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.14, 0.3, 0.14), WICKER_DARK, {
        at: [sx * 0.6, 0.15, sz * 0.6],
      });
    }
  }
  // Weave bands round the basket.
  for (const y of [0.5, 0.8, 1.0]) {
    b.sweep(basketLoop(y, 0.66), 0.03, { color: WICKER_DARK });
  }

  // ---- Burner and flame ----
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.5), STEEL, { at: [0, 1.5, 0] });
  b.part(new THREE.ConeGeometry(0.22, 0.5, 6), FLAME, { at: [0, 1.95, 0] });

  // ---- Propane tanks on the basket floor ----
  for (const sx of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.0, 10), TANK, {
      at: [sx * 1.0, 0.8, 0.25],
    });
  }

  // ---- Suspension ropes from basket corners to the envelope skirt ----
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.sweep(
        [
          [sx * 0.6, 1.25, sz * 0.6],
          [sx * 1.75, 3.05, sz * 1.75],
        ],
        0.03,
        { color: DARK }
      );
    }
  }

  return b.root;
}
```