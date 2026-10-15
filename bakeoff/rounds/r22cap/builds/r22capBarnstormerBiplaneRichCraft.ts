import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby, toy-like red barnstormer biplane with a round cowling, a leather-capped pilot, a goggled dog passenger, striped wings, wire bracing and a painted banner.",
  style: "whimsical",
  commit: "88fc1f0",
};

const RED = cel("#e5412d");
const CREAM = cel("#fff0c4");
const YEL = cel("#ffc83a");
const TEAL = cel("#2aa9a0");
const BROWN = cel("#7a4a2b");
const WOOD = cel("#c07f42");
const TAN = cel("#d9a46a");
const STEEL = cel("#8e9bb0");
const DARK = cel("#3a2b3d");
const PINK = cel("#ff8fa3");

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...opts });
  const ball = (r: number, color: any, at: number[], scale: any = 1) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at, scale });

  // ---------- textures ----------
  const ROUNDEL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#22112f"/><circle cx="32" cy="32" r="27" fill="#fff0c4"/><circle cx="32" cy="32" r="19" fill="#2aa9a0"/><circle cx="32" cy="32" r="11" fill="#fff0c4"/><polygon points="32,22 35,29 42,29 36.5,33.5 38.5,41 32,36.5 25.5,41 27.5,33.5 22,29 29,29" fill="#e5412d"/></svg>`,
    { size: 192 },
  );
  const BANNER = svg(
    `<svg viewBox="0 0 160 40"><rect x="2" y="3" width="156" height="34" rx="10" fill="#fff0c4" stroke="#22112f" stroke-width="3"/><text x="80" y="27" font-size="20" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#22112f">WOBBLE &amp; CO.</text><circle cx="16" cy="20" r="4" fill="#e5412d"/><circle cx="144" cy="20" r="4" fill="#e5412d"/></svg>`,
    { size: 512 },
  );
  const NUM = svg(
    `<svg viewBox="0 0 64 64"><text x="32" y="52" font-size="58" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#22112f">7</text></svg>`,
    { size: 192 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#9be7ff" stroke="#22112f" stroke-width="3"/><ellipse cx="11" cy="10" rx="4" ry="3" fill="#ffffff"/></svg>`,
    { size: 96 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 32 32"><polygon points="16,3 19.5,12 29,12 21.5,18 24,28 16,22 8,28 10.5,18 3,12 12.5,12" fill="#e5412d" stroke="#22112f" stroke-width="2"/></svg>`,
    { size: 96 },
  );

  // ---------- fuselage ----------
  const fusPaint = cel(
    paint((p, n) => {
      if ((p.z > -2.25 && p.z < -2.1) || (p.z > -2.0 && p.z < -1.93)) return "#ffc83a";
      if (n.y < -0.35) return "#fff0c4";
      return "#e5412d";
    }),
  );
  const fus = b.loft(
    [
      { at: [0, 1.28, -3.4], w: 0.1, h: 0.14 },
      { at: [0, 1.27, -2.6], w: 0.32, h: 0.42 },
      { at: [0, 1.22, -1.5], w: 0.72, h: 0.85 },
      { at: [0, 1.2, -0.3], w: 0.98, h: 1.05 },
      { at: [0, 1.2, 0.7], w: 1.02, h: 1.05 },
      { at: [0, 1.2, 1.3], w: 0.96, h: 1.0 },
    ],
    { color: fusPaint, sides: 12 },
  );

  // cowling
  b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.6, 0.22],
      [0.55, 0.5],
      [0.36, 0.68],
      [0, 0.72],
    ],
    { at: [0, 1.2, 1.22], axis: [0, 0, 1], smoothing: 1, segments: 14, color: RED },
  );
  b.lathe(
    [
      [0.5, 0],
      [0.62, 0.02],
      [0.62, 0.12],
      [0.5, 0.14],
    ],
    { at: [0, 1.2, 1.2], axis: [0, 0, 1], segments: 14, color: YEL },
  );
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.2, 0.1],
      [0, 0.12],
    ],
    { at: [0, 1.2, 1.9], axis: [0, 0, 1], segments: 10, color: DARK },
  );
  b.spike([0, 1.2, 1.97], [0, 0, 1], 0.4, 0.17, YEL, { sides: 10 });
  // cowl rivets
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rivets.push(new THREE.SphereGeometry(0.022, 5, 4).translate(Math.cos(a) * 0.6, 1.2 + Math.sin(a) * 0.6, 1.3));
  }
  b.part(mergeGeometries(rivets), STEEL, { at: [0, 0, 0] });
  // cooling louvres on cowl cheeks
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      box(0.03, 0.05, 0.22, DARK, [s * 0.585, 1.0 + i * 0.09, 1.55], { rotation: [0, 0, s * -8] });
  // exhaust stubs
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.5, 0.98 + i * 0.12, 1.4 - i * 0.18], [s * 0.72, 0.98 + i * 0.12, 1.45 - i * 0.18], 0.05, DARK, { sides: 6 });
      b.rod([s * 0.72, 0.98 + i * 0.12, 1.45 - i * 0.18], [s * 0.82, 1.02 + i * 0.12, 1.4 - i * 0.18], 0.04, STEEL, { sides: 6 });
    }

  // propeller
  const bladePaint = cel(paint((_p, _n, s) => (Math.abs(s[1]) > 0.85 ? "#ffc83a" : "#c07f42")));
  b.extrude(
    [
      [-0.07, -1.1],
      [0.07, -1.1],
      [0.14, -0.3],
      [0.14, 0.3],
      [0.07, 1.1],
      [-0.07, 1.1],
      [-0.14, 0.3],
      [-0.14, -0.3],
    ],
    { at: [0, 1.2, 2.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.015, color: bladePaint },
  );
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), STEEL, { at: [0, 1.2, 2.0], dir: [0, 0, 1] });

  // cockpits
  const cockpit = (z: number, w: number) => {
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12), DARK, { at: [0, 1.715, z], scale: [w, 1, 1.15] });
    b.part(new THREE.TorusGeometry(0.28, 0.05, 6, 14), BROWN, { at: [0, 1.73, z], dir: [0, 1, 0], axis: "z", scale: [w, 1.15, 1] });
  };
  cockpit(-0.75, 1);
  cockpit(0.3, 0.95);
  // windscreens
  box(0.5, 0.2, 0.025, "#bfeaf5", [0, 1.85, 0.62], { rotation: [-25, 0, 0] });
  box(0.45, 0.17, 0.025, "#bfeaf5", [0, 1.83, -0.4], { rotation: [-25, 0, 0] });
  // turtle deck behind the pilot
  b.capsule([0, 1.72, -1.1], [0, 1.66, -1.9], [0.2, 0.08], RED, { sides: 8 });

  // pilot
  b.capsule([0, 1.55, -0.75], [0, 1.82, -0.78], 0.2, BROWN, { sides: 8 });
  ball(0.17, PINK, [0, 2.0, -0.72]);
  b.part(new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), BROWN, { at: [0, 2.03, -0.73] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), YEL, { at: [s * 0.075, 2.02, -0.55], dir: [0, 0, 1] });
    b.part(new THREE.CircleGeometry(0.04, 10), "#ffffff", { at: [s * 0.075, 2.02, -0.528], texture: LENS });
    ball(0.045, BROWN, [s * 0.18, 1.98, -0.73], [0.6, 1.2, 1.1]);
    ball(0.025, DARK, [s * 0.07, 1.93, -0.54]);
  }
  b.rod([-0.08, 2.02, -0.55], [0.08, 2.02, -0.55], 0.015, BROWN, { sides: 6 });
  ball(0.035, "#ff6b7d", [0, 1.96, -0.55]);
  b.sweep(catmull([[0, 1.82, -0.72], [0.15, 1.85, -0.95], [-0.1, 1.9, -1.3], [0.12, 1.88, -1.7], [-0.05, 1.92, -2.1]]), [0.07, 0.04], TEAL, { sides: 6 });
  for (const s of [1, -1]) b.capsule([s * 0.19, 1.7, -0.72], [s * 0.3, 1.78, -0.5], 0.06, BROWN, { sides: 6 });

  // dog passenger
  ball(0.19, TAN, [0, 1.95, 0.3]);
  b.capsule([0, 1.9, 0.38], [0, 1.88, 0.52], 0.09, CREAM, { sides: 8 });
  ball(0.05, DARK, [0, 1.92, 0.62], [1, 0.8, 0.8]);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), STEEL, { at: [s * 0.085, 2.0, 0.44], dir: [0, 0, 1] });
    b.part(new THREE.CircleGeometry(0.036, 10), "#ffffff", { at: [s * 0.085, 2.0, 0.457], texture: LENS });
    b.capsule([s * 0.14, 2.06, 0.28], [s * 0.26, 1.82, 0.24], [0.06, 0.04], BROWN, { sides: 6 });
  }
  b.rod([-0.08, 2.0, 0.44], [0.08, 2.0, 0.44], 0.012, DARK, { sides: 6 });
  b.capsule([0, 1.55, 0.3], [0, 1.78, 0.3], 0.16, TAN, { sides: 8 });
  b.sweep(catmull([[0, 1.77, 0.26], [0.07, 1.82, 0.02], [-0.07, 1.86, -0.18]]), [0.05, 0.03], RED, { sides: 6 });

  // ---------- wings ----------
  const wingPaint = cel(
    paint((_p, n, s) => {
      const ax = Math.abs(s[0]);
      if (Math.abs(n.y) < 0.5) return "#7a4a2b";
      if (ax > 3.25) return "#e5412d";
      if (ax > 3.15 && ax < 3.25) return "#ffc83a";
      const m = ((ax % 0.5) + 0.5) % 0.5;
      if (m < 0.02) return "#e8c987";
      return "#fff0c4";
    }),
  );
  const wingOutline = (span: number, chord: number): Array<[number, number]> => [
    [-span, -chord * 0.45],
    [-span + 0.25, -chord],
    [span - 0.25, -chord],
    [span, -chord * 0.45],
    [span, chord * 0.45],
    [span - 0.25, chord],
    [-span + 0.25, chord],
    [-span, chord * 0.45],
  ];
  // upper wing (wider, extra chord)
  b.extrude(wingOutline(4.0, 0.68), {
    at: [0, 2.35, 0.55], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.035, smoothing: 1, color: wingPaint,
  });
  b.extrude(wingOutline(3.6, 0.6), {
    at: [0, 0.95, 0.45], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.11, bevel: 0.03, smoothing: 1, color: wingPaint,
  });
  // wing-top numbers and roundels
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { at: [s * 2.35, 2.415, 0.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: NUM });
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { at: [s * 2.3, 0.89, 0.45], dir: [0, -1, 0], axis: "z", up: [0, 0, 1], texture: ROUNDEL });
    // aileron hinge lines
    box(1.6, 0.012, 0.02, DARK, [s * 2.5, 2.416, 0.05]);
    box(1.5, 0.012, 0.02, DARK, [s * 2.4, 1.006, 0.0]);
    // wingtip pennants
    b.extrude([[0, 0], [0.3, 0.08], [0, 0.16]], { at: [s * 3.95, 2.35, 0.55], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.015, color: YEL });
    b.rod([s * 3.95, 2.3, 0.55], [s * 3.95, 2.5, 0.55], 0.012, DARK, { sides: 5 });
    // navigation lamps
    ball(0.05, s > 0 ? "#43e86b" : "#ff4a4a", [s * 4.0, 2.35, 0.55]);
  }
  // centre-section fuel tank on the upper wing
  b.capsule([0, 2.5, 0.35], [0, 2.5, 0.8], 0.12, YEL, { sides: 8 });

  // struts
  const strut = (a: number[], c: number[], col: any = WOOD) => b.rod(a, c, 0.04, col, { sides: 6 });
  for (const s of [1, -1]) {
    for (const x of [1.9, 3.4]) {
      strut([s * x, 1.0, 0.95], [s * x, 2.3, 1.05]);
      strut([s * x, 1.0, 0.05], [s * x, 2.3, 0.15]);
      box(0.1, 0.1, 0.12, STEEL, [s * x, 1.0, 0.95]);
      box(0.1, 0.1, 0.12, STEEL, [s * x, 2.3, 1.05]);
    }
    // cabane
    strut([s * 0.3, 1.68, 0.8], [s * 0.55, 2.3, 0.95], RED);
    strut([s * 0.3, 1.68, 0.05], [s * 0.55, 2.3, 0.15], RED);
    // cross wires
    for (const [x0, x1] of [[0.6, 1.9], [1.9, 3.4]]) {
      b.rod([s * x0, 1.03, 0.95], [s * x1, 2.28, 1.05], 0.012, DARK, { sides: 4 });
      b.rod([s * x0, 2.28, 1.05], [s * x1, 1.03, 0.95], 0.012, DARK, { sides: 4 });
    }
    // lower wing root to fuselage
    box(0.2, 0.16, 0.8, RED, [s * 0.52, 0.95, 0.45]);
  }

  // ---------- tail ----------
  const finPaint = cel(paint((_p, _n, s) => (s[0] < 0.18 ? "#ffc83a" : s[0] < 0.45 ? "#fff0c4" : "#e5412d")));
  b.extrude(
    [[0.0, 0], [0.85, 0], [0.8, 0.35], [0.55, 0.78], [0.2, 0.9], [-0.15, 0.72], [-0.25, 0.3]],
    { at: [0, 1.3, -3.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, bevel: 0.02, smoothing: 1, color: finPaint },
  );
  b.extrude(
    [[-1.3, -0.15], [-1.1, -0.42], [1.1, -0.42], [1.3, -0.15], [1.1, 0.38], [-1.1, 0.38]],
    { at: [0, 1.3, -2.95], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1, color: wingPaint },
  );
  // elevator hinge, brace wires
  box(2.3, 0.01, 0.015, DARK, [0, 1.341, -3.15]);
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 1.3, -2.8], [0.04, 1.95, -3.05], 0.012, DARK, { sides: 4 });
    b.rod([s * 0.5, 1.28, -2.6], [s * 0.2, 1.3, -2.55], 0.02, DARK, { sides: 4 });
  }
  b.rod([0, 1.3, -3.0], [0, 1.9, -3.05], 0.015, DARK, { sides: 4 });
  // tail skid + wheel
  b.rod([0, 1.2, -3.2], [0, 0.18, -3.45], [0.05, 0.04], STEEL, { sides: 6 });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), DARK, { at: [0, 0.1, -3.48], dir: [1, 0, 0] });

  // fuselage side decals
  for (const s of [1, -1]) {
    b.decal(fus, BANNER, { at: [s * 0.45, 1.05, -1.1], dir: [s, 0, 0], size: [1.5, 0.38] });
    b.decal(fus, ROUNDEL, { at: [s * 0.35, 1.25, -2.4], dir: [s, 0, 0], size: [0.4, 0.4] });
    b.part(new THREE.PlaneGeometry(0.45, 0.45), "#ffffff", { at: [s * 0.045, 1.8, -3.1], dir: [s, 0, 0], axis: "z", texture: STAR });
  }

  // ---------- landing gear ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.4, 0.88, 0.95], [s * 0.98, 0.45, 0.75], 0.045, STEEL, { sides: 6 });
    b.rod([s * 0.4, 0.88, 0.15], [s * 0.98, 0.45, 0.75], 0.045, STEEL, { sides: 6 });
    // bungee cord wraps
    for (let i = 0; i < 4; i++) b.rod([s * (0.62 + i * 0.07), 0.7 - i * 0.07, 0.78 - 0.02], [s * (0.64 + i * 0.07), 0.68 - i * 0.07, 0.78], 0.06, YEL, { sides: 6 });
    // wheel
    b.part(new THREE.TorusGeometry(0.32, 0.12, 8, 16), DARK, { at: [s * 1.05, 0.44, 0.75], dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 12), RED, { at: [s * 1.05, 0.44, 0.75], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 8), YEL, { at: [s * 1.05, 0.44, 0.75], dir: [1, 0, 0] });
    b.part(new THREE.CircleGeometry(0.2, 8), "#ffffff", { at: [s * 1.13, 0.44, 0.75], dir: [s, 0, 0], axis: "z", texture: STAR });
  }
  b.rod([-1.0, 0.44, 0.75], [1.0, 0.44, 0.75], 0.05, STEEL, { sides: 6 });
  // pitot tube and mudguard
  b.rod([3.0, 2.3, 1.2], [3.0, 2.3, 1.55], 0.015, STEEL, { sides: 5 });

  return b.root;
}
