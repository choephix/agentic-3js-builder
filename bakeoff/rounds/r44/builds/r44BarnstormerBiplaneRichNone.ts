import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Barnstormer Biplane",
  description: "A chubby whimsical red-and-yellow barnstormer biplane with a goggled pilot and streaming scarf.",
};

const RED = "#d7382d";
const CREAM = "#f6e7c1";
const BLUE = "#2f5fa8";
const YELLOW = "#f2c230";
const DARK = "#2b2430";
const WOOD = "#9a6234";
const SILVER = "#b9c2cc";
const TIRE = "#26232b";

export default function build() {
  const b = createBuilder({ name: "biplane" });

  const box = (w: number, h: number, d: number, color: any, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });
  const cylX = (r: number, len: number, color: any, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [0, 0, 90] });
  const cylZ = (r: number, len: number, color: any, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [90, 0, 0] });

  // ---- fuselage
  const bodyPaint = paint((p, n) => {
    if (n.y < -0.35) return CREAM;
    if (p.z < -2.2) return BLUE;
    if (Math.abs(p.z - 0.75) < 0.06) return CREAM;
    return RED;
  });
  const fus = b.loft(
    [
      { at: [0, 1.38, -3.3], w: 0.08, h: 0.2 },
      { at: [0, 1.32, -2.2], w: 0.3, h: 0.45 },
      { at: [0, 1.27, -1.0], w: 0.7, h: 0.85 },
      { at: [0, 1.25, 0.2], w: 0.95, h: 1.05 },
      { at: [0, 1.25, 1.0], w: 1.0, h: 1.1 },
    ],
    { color: bodyPaint },
  );

  // ---- cowling and engine
  b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.58, 0.1],
      [0.58, 0.45],
      [0.42, 0.62],
      [0, 0.64],
    ],
    { at: [0, 1.25, 1.0], axis: [0, 0, 1], color: SILVER, segments: 14 },
  );
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 14), CREAM, { at: [0, 1.25, 1.02], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.16, 0.3, 10), RED, { at: [0, 1.25, 1.77], rotation: [90, 0, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.025, 5, 4), DARK, {
      at: [Math.cos(a) * 0.46, 1.25 + Math.sin(a) * 0.46, 1.63],
    });
  }
  for (const s of [1, -1]) {
    b.rod([s * 0.52, 1.1, 1.3], [s * 0.6, 0.95, 0.7], 0.05, DARK);
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), SILVER, { at: [s * 0.62, 1.55, 1.15], rotation: [0, 0, s * 35] });
  }
  // propeller
  const blade = [
    [-0.07, 0.0],
    [0.07, 0.0],
    [0.12, 0.7],
    [0.05, 1.12],
    [-0.05, 1.12],
    [-0.12, 0.7],
  ] as [number, number][];
  for (const s of [1, -1]) {
    b.extrude(blade, {
      at: [0, 1.25, 1.74],
      x: [1, 0, 0],
      y: [0, s, 0],
      thickness: 0.04,
      color: WOOD,
    });
    b.extrude(
      [
        [-0.09, 0.86],
        [0.09, 0.86],
        [0.1, 1.12],
        [-0.1, 1.12],
      ],
      { at: [0, 1.25, 1.745], x: [1, 0, 0], y: [0, s, 0], thickness: 0.045, color: YELLOW },
    );
  }

  // ---- wings
  const wingPaint = paint((p, n) => {
    if (n.y > 0.5 && Math.abs(((p.x + 10) % 0.85) - 0.4) < 0.02) return "#c99a1c";
    return n.y < -0.5 ? "#e8b22a" : YELLOW;
  });
  const wing = (span: number, chord: number, y: number, z: number) => {
    b.part(new THREE.BoxGeometry(span, 0.1, chord), wingPaint, { at: [0, y, z] });
    for (const s of [1, -1]) cylZ(0.05, chord, RED, [s * span / 2, y, z], 10);
    for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.1, chord), RED, { at: [s * span / 2, y, z], visible: true } as any);
  };
  wing(7.0, 1.3, 2.2, 0.5);
  wing(6.5, 1.1, 1.0, 0.4);
  // aileron stripes
  for (const s of [1, -1]) {
    box(1.6, 0.115, 0.3, RED, [s * 2.5, 2.2, -0.0]);
    box(1.5, 0.115, 0.28, RED, [s * 2.3, 1.0, -0.0]);
  }
  // roundels
  const roundel = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22112f"/><circle cx="50" cy="50" r="44" fill="#ffffff"/><circle cx="50" cy="50" r="32" fill="#2f5fa8"/><circle cx="50" cy="50" r="18" fill="#d7382d"/><path d="M50 36 L54 46 L64 47 L56 54 L58 64 L50 58 L42 64 L44 54 L36 47 L46 46Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
      at: [s * 2.2, 2.254, 0.5],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: roundel,
    });

  // ---- struts and wires
  for (const s of [1, -1]) {
    for (const z of [0.9, 0.0]) {
      b.rod([s * 1.5, 1.0, z], [s * 1.5, 2.2, z], 0.04, WOOD);
      b.rod([s * 3.0, 1.0, z], [s * 3.0, 2.2, z], 0.04, WOOD);
    }
    b.rod([s * 1.5, 1.05, 0.45], [s * 3.0, 2.15, 0.45], 0.012, DARK);
    b.rod([s * 3.0, 1.05, 0.45], [s * 1.5, 2.15, 0.45], 0.012, DARK);
    // cabane
    b.rod([s * 0.35, 1.7, 0.75], [s * 0.6, 2.15, 0.85], 0.04, WOOD);
    b.rod([s * 0.35, 1.7, 0.05], [s * 0.6, 2.15, 0.1], 0.04, WOOD);
    // pennant
    b.extrude(
      [
        [0, 0],
        [0.4, 0.07],
        [0, 0.14],
      ],
      { at: [s * 3.0, 2.5, 0.5], x: [0, 0, -1], thickness: 0.01, color: s > 0 ? RED : BLUE },
    );
    b.rod([s * 3.0, 2.25, 0.5], [s * 3.0, 2.64, 0.5], 0.012, DARK);
  }

  // ---- tail
  b.extrude(
    [
      [0, 0],
      [0.8, 0],
      [0.95, 0.3],
      [0.8, 0.85],
      [0.3, 0.9],
      [0.05, 0.5],
    ],
    { at: [0, 1.4, -2.45], x: [0, 0, -1], thickness: 0.07, bevel: 0.015, smoothing: 1, color: BLUE },
  );
  box(2.5, 0.07, 0.75, YELLOW, [0, 1.38, -2.9]);
  for (const s of [1, -1]) {
    cylZ(0.035, 0.75, RED, [s * 1.25, 1.38, -2.9], 8);
    box(1.0, 0.075, 0.28, RED, [s * 0.75, 1.38, -3.15]);
  }
  b.rod([0, 1.2, -2.6], [0, 0.65, -3.05], 0.035, WOOD);
  b.part(new THREE.SphereGeometry(0.06, 6, 5), DARK, { at: [0, 0.62, -3.07] });

  // ---- landing gear
  for (const s of [1, -1]) {
    cylX(0.43, 0.17, TIRE, [s * 0.85, 0.43, 0.7], 14);
    cylX(0.18, 0.2, CREAM, [s * 0.85, 0.43, 0.7], 10);
    cylX(0.05, 0.26, DARK, [s * 0.85, 0.43, 0.7], 6);
    b.rod([s * 0.3, 0.85, 0.95], [s * 0.85, 0.43, 0.7], 0.04, WOOD);
    b.rod([s * 0.3, 0.85, 0.45], [s * 0.85, 0.43, 0.7], 0.04, WOOD);
  }
  b.rod([-0.85, 0.43, 0.7], [0.85, 0.43, 0.7], 0.035, DARK);

  // ---- cockpit and pilot
  box(0.5, 0.03, 0.75, DARK, [0, 1.79, -0.15]);
  box(0.62, 0.06, 0.8, CREAM, [0, 1.76, -0.15]);
  box(0.46, 0.26, 0.02, "#bfe6f2", [0, 1.95, 0.32], [-25, 0, 0]);
  b.part(new THREE.SphereGeometry(0.26, 8, 6), BLUE, { at: [0, 1.75, -0.12] });
  for (const s of [1, -1]) b.rod([s * 0.2, 1.8, 0.05], [s * 0.3, 1.95, 0.2], 0.04, BLUE);
  b.part(new THREE.SphereGeometry(0.2, 10, 8), "#f1c39a", { at: [0, 2.07, -0.12] });
  b.part(new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), WOOD, { at: [0, 2.1, -0.13] });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), "#e39a7e", { at: [0, 2.04, 0.08] });
  cylX(0.215, 0.02, DARK, [0, 2.1, -0.1], 10);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8), "#8fd8ff", { at: [s * 0.085, 2.12, 0.085], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.065, 0.015, 5, 8), SILVER, { at: [s * 0.085, 2.12, 0.09] });
    b.part(new THREE.SphereGeometry(0.06, 6, 5), "#f1c39a", { at: [s * 0.11, 2.0, -0.12] });
  }
  b.extrude(
    [
      [0, 0],
      [0.5, 0.06],
      [1.0, -0.05],
      [1.5, 0.1],
      [1.4, 0.2],
      [0.9, 0.12],
      [0.5, 0.2],
      [0, 0.14],
    ],
    { at: [0, 1.93, -0.25], x: [0, 0, -1], thickness: 0.03, color: CREAM },
  );
  b.extrude(
    [
      [0.2, 0.05],
      [0.45, 0.11],
      [0.5, 0.15],
      [0.25, 0.12],
    ],
    { at: [0, 1.93, -0.25], x: [0, 0, -1], thickness: 0.035, color: RED },
  );

  // ---- fuselage lettering
  const letters = svg(
    `<svg viewBox="0 0 220 64"><text x="110" y="46" text-anchor="middle" font-family="serif" font-weight="bold" font-size="46" fill="#22112f" stroke="#22112f" stroke-width="7">FLYING PIE</text><text x="110" y="46" text-anchor="middle" font-family="serif" font-weight="bold" font-size="46" fill="#f6e7c1">FLYING PIE</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    b.decal(fus, letters, { at: [s * 0.4, 1.3, -0.9], dir: [s, 0, 0], size: [1.3, 0.38] });

  return b.root;
}
