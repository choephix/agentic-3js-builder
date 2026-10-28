import * as THREE from "three";
import { createBuilder, catmull, lerp, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper",
  description: "Long-fork custom chopper with orange tank, hexagon emblem, teal energy glow and chrome pipes, in a bold hero-shooter style.",
};

const ORANGE = "#f2761b";
const ORANGE_D = "#c4520f";
const CREAM = "#f6ecd4";
const GRAPH = "#2b2f3a";
const IRON = "#3d4350";
const STEEL = "#a9b3c4";
const CHROME = "#dfe7f2";
const RUBBER = "#17191f";
const TEAL = "#3de0ff";
const RED = "#ff3b30";

const SVGNS = 'xmlns="http://www.w3.org/2000/svg"';

const EMBLEM = svg(
  `<svg viewBox="0 0 100 80" ${SVGNS}>
  <path d="M50 4 L88 22 L88 58 L50 76 L12 58 L12 22Z" fill="#1d2230" stroke="#f6ecd4" stroke-width="5" stroke-linejoin="round"/>
  <path d="M50 14 L78 27 L78 53 L50 66 L22 53 L22 27Z" fill="none" stroke="#3de0ff" stroke-width="3"/>
  <path d="M30 52 L48 18 L52 36 L70 28 L52 62 L48 44Z" fill="#f2761b" stroke="#f6ecd4" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);
const QUILT = svg(
  `<svg viewBox="0 0 40 80" ${SVGNS}>
  <rect width="40" height="80" fill="#2a2024"/>
  <rect x="17" width="6" height="80" fill="#f2761b"/>
  <path d="M0 0L40 40L0 80M40 0L0 40L40 80M0 20L20 40 0 60M40 20L20 40 40 60" stroke="#6b4a3c" stroke-width="1.6" fill="none"/>
  <rect x="1" y="1" width="38" height="78" fill="none" stroke="#f6ecd4" stroke-width="1.5" stroke-dasharray="3 2"/>
  </svg>`,
  { size: 192 },
);
const HEXC = svg(
  `<svg viewBox="0 0 100 100" ${SVGNS}>
  <circle cx="50" cy="50" r="48" fill="#f2761b" stroke="#2b2f3a" stroke-width="4"/>
  <path d="M50 14 L82 32 L82 68 L50 86 L18 68 L18 32Z" fill="#2b2f3a"/>
  <path d="M50 26 L72 38 L72 62 L50 74 L28 62 L28 38Z" fill="none" stroke="#3de0ff" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="7" fill="#3de0ff"/>
  </svg>`,
  { size: 160 },
);
const GAUGE = svg(
  `<svg viewBox="0 0 100 100" ${SVGNS}>
  <circle cx="50" cy="50" r="48" fill="#10151f" stroke="#dfe7f2" stroke-width="4"/>
  <path d="M18 72 A40 40 0 1 1 82 72" fill="none" stroke="#3de0ff" stroke-width="5"/>
  <path d="M70 34 A40 40 0 0 1 82 72" fill="none" stroke="#ff3b30" stroke-width="5"/>
  <path d="M50 50 L36 30" stroke="#f6ecd4" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="5" fill="#f2761b"/>
  </svg>`,
  { size: 128 },
);

const TANK = paint((p, n) => {
  if (Math.abs(p.x) < 0.03 && n.y > 0.2) return CREAM;
  if (Math.abs(p.x) < 0.04 && n.y > 0.2) return ORANGE_D;
  return n.y < -0.2 ? ORANGE_D : n.y > 0.55 ? "#ff9340" : ORANGE;
});
const LEATHER = paint((_p, n) => (n.y > 0.3 ? "#3a2c30" : "#241b1e"));
const TIRE = paint((p, n, s) => {
  if (Math.abs(Math.abs(n.x) - 0.93) < 0.025) return CREAM;
  return Math.floor(s[0] * 56) % 2 ? "#1b1d24" : "#262932";
});

export default function build() {
  const b = createBuilder({ name: "chopper" });

  const tube = (pts: number[][], r: number | [number, number], color: string, extra: object = {}) =>
    b.sweep(catmull(pts), r, { color, sides: 8, ...extra });
  const cylX = (r: number, len: number, color: string, at: number[], seg = 14) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir: [1, 0, 0] });
  const cylZ = (r: number, len: number, color: string, at: number[], seg = 14) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir: [0, 0, 1] });
  const box = (w: number, h: number, d: number, color: string, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at });

  // ---------- wheels ----------
  function wheel(z: number, y: number, R: number, tr: number, wide: number, rimR: number) {
    b.part(new THREE.TorusGeometry(R, tr, 8, 28), TIRE, { at: [0, y, z], dir: [1, 0, 0], axis: "z", scale: [1, 1, wide] });
    cylX(rimR, 0.05 * wide, STEEL, [0, y, z], 24);
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.02, rimR * 2, 0.03), CHROME, { at: [0, y, z], rotation: [i * 45, 0, 0] });
    b.part(new THREE.TorusGeometry(rimR, 0.018, 6, 24), CHROME, { at: [0, y, z], dir: [1, 0, 0], axis: "z" });
    cylX(0.05, 0.16, ORANGE, [0, y, z], 10);
    glow(b.part(new THREE.TorusGeometry(rimR * 0.72, 0.01, 5, 24), TEAL, { at: [0, y, z], dir: [1, 0, 0], axis: "z" }), 1.6);
    for (const s of [1, -1]) cylX(0.12, 0.012, "#7d8696", [s * 0.065 * wide, y, z], 20);
  }
  const RY = 0.365, RZ = -0.85, FY = 0.34, FZ = 1.07;
  wheel(RZ, RY, 0.28, 0.085, 1.4, 0.2);
  wheel(FZ, FY, 0.28, 0.06, 1.0, 0.2);

  // ---------- frame ----------
  tube([[0, 1.0, 0.5], [0, 0.88, 0.2], [0, 0.78, -0.3], [0, 0.6, -0.65], [0, RY, RZ]], 0.026, GRAPH);
  tube([[0, 0.82, 0.52], [0, 0.45, 0.25], [0, 0.32, -0.1], [0, 0.34, -0.5], [0, RY, RZ]], 0.028, GRAPH);
  b.rod([0, 0.74, 0.53], [0, 1.04, 0.49], 0.042, { color: ORANGE_D });
  for (const s of [1, -1]) {
    tube([[s * 0.09, 0.42, -0.3], [s * 0.1, 0.38, -0.6], [s * 0.1, RY, RZ]], 0.02, GRAPH);
    tube([[s * 0.09, 0.7, -0.5], [s * 0.1, 0.5, -0.7], [s * 0.1, RY, RZ]], 0.016, GRAPH);
  }

  // ---------- engine ----------
  box(0.26, 0.26, 0.36, IRON, [0, 0.42, 0.08]);
  box(0.2, 0.08, 0.3, GRAPH, [0, 0.27, 0.08]);
  const cyl = (a: number[], c: number[]) => {
    b.rod(a, c, 0.065, { color: IRON, sides: 8 });
    for (let i = 1; i <= 4; i++) {
      const q = lerp(a, c, i / 4.6);
      b.part(new THREE.CylinderGeometry(0.093, 0.093, 0.014, 10), STEEL, {
        at: q,
        dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
      });
    }
    b.part(new THREE.CylinderGeometry(0.1, 0.085, 0.05, 10), ORANGE, {
      at: lerp(a, c, 1.02),
      dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
    });
  };
  cyl([0, 0.5, 0.17], [0, 0.69, 0.37]);
  cyl([0, 0.5, -0.01], [0, 0.69, -0.21]);
  for (const s of [1, -1]) {
    cylX(0.108, 0.02, ORANGE, [s * 0.135, 0.42, 0.1], 16);
    b.part(new THREE.CircleGeometry(0.1, 16), "#ffffff", {
      at: [s * 0.147, 0.42, 0.1], dir: [s, 0, 0], axis: "z", texture: HEXC,
    });
    glow(box(0.012, 0.025, 0.2, TEAL, [s * 0.133, 0.28, 0.08]), 1.5);
  }
  glow(box(0.04, 0.015, 0.9, TEAL, [0, 0.22, -0.1]), 1.6);

  // ---------- exhaust ----------
  for (const s of [1, -1]) {
    tube(
      [[s * 0.05, 0.64, 0.38], [s * 0.2, 0.5, 0.44], [s * 0.27, 0.3, 0.28], [s * 0.29, 0.27, -0.4], [s * 0.27, 0.32, -1.05]],
      [0.032, 0.05], CHROME, { caps: { start: "round", end: "flat" } },
    );
    tube([[s * 0.27, 0.31, -0.85], [s * 0.27, 0.32, -1.05]], 0.052, ORANGE_D, { caps: "flat" });
    glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10), TEAL, { at: [s * 0.27, 0.32, -1.06], dir: [0, 0, 1] }), 1.5);
    cylX(0.02, 0.14, RUBBER, [s * 0.32, 0.2, 0.1], 8);
    b.rod([s * 0.2, 0.3, 0.44], [s * 0.2, 0.3, 0.2], 0.012, { color: STEEL });
  }

  // ---------- tank ----------
  const tank = b.part(new THREE.SphereGeometry(1, 16, 10), TANK, { at: [0, 0.86, 0.15], scale: [0.19, 0.17, 0.4] });
  for (const s of [1, -1])
    b.decal(tank, EMBLEM, { at: [s * 0.19, 0.88, 0.15], dir: [s, 0, 0], size: [0.3, 0.24] });
  cylX(0.035, 0.03, CHROME, [0, 1.03, 0.1], 10);
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), CHROME, { at: [0, 1.035, 0.08] });

  // ---------- seat ----------
  const seat = b.loft(
    [
      { at: [0, 0.8, 0.0], w: 0.2, h: 0.07 },
      { at: [0, 0.77, -0.35], w: 0.32, h: 0.09 },
      { at: [0, 0.8, -0.7], w: 0.2, h: 0.07 },
    ],
    { color: LEATHER },
  );
  b.decal(seat, QUILT, { at: [0, 0.82, -0.36], dir: [0, 1, 0], up: [0, 0, 1], size: [0.28, 0.66] });

  // ---------- rear fender, sissy bar, tail ----------
  const fPts = [-80, -45, -10, 25, 50].map((a) => {
    const r = (a * Math.PI) / 180;
    return [0, RY + 0.46 * Math.cos(r), RZ + 0.46 * Math.sin(r)];
  });
  b.sweep(catmull(fPts), (t) => [0.14 - 0.02 * t, 0.014], { color: ORANGE, sides: 6 });
  const fPtsF = [30, 55, 80].map((a) => {
    const r = (a * Math.PI) / 180;
    return [0, FY + 0.38 * Math.cos(r), FZ + 0.38 * Math.sin(r)];
  });
  b.sweep(catmull(fPtsF), [0.09, 0.09], { color: ORANGE, sides: 6 });
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), RED, { at: [0, 0.45, -1.32], scale: [1.6, 0.8, 0.8] }), 1.8);
  tube(
    [[0.1, 0.74, -0.65], [0.1, 1.1, -0.85], [0.1, 1.22, -0.88], [-0.1, 1.22, -0.88], [-0.1, 1.1, -0.85], [-0.1, 0.74, -0.65]],
    0.013, CHROME,
  );
  box(0.22, 0.12, 0.04, ORANGE, [0, 1.12, -0.87]);

  // ---------- front end ----------
  const topF = (s: number) => [s * 0.1, 1.0, 0.5];
  const axleF = (s: number) => [s * 0.1, FY, FZ];
  box(0.3, 0.05, 0.1, GRAPH, [0, 1.0, 0.5]);
  for (const s of [1, -1]) {
    const t = topF(s), a = axleF(s);
    const mid = lerp(t, a, 0.55);
    b.rod(t, mid, 0.022, { color: CHROME });
    b.rod(mid, a, 0.032, { color: STEEL });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), ORANGE, { at: lerp(t, a, 0.56), dir: [a[0] - t[0], a[1] - t[1], a[2] - t[2]] });
    cylX(0.15, 0.008, "#8a93a3", [s * 0.045, FY, FZ], 18);
    cylX(0.04, 0.05, GRAPH, [s * 0.12, FY, FZ], 8);
    // bars
    tube([[s * 0.5, 1.2, 0.43], [s * 0.52, 1.05, 0.5], [s * 0.3, 0.99, 0.57], [0, 0.98, 0.58]], 0.014, CHROME);
    b.capsule([s * 0.5, 1.2, 0.43], [s * 0.51, 1.12, 0.46], 0.025, { color: RUBBER });
    b.rod([s * 0.4, 1.0, 0.54], [s * 0.38, 1.04, 0.64], 0.008, { color: CHROME });
    // mirror
    b.rod([s * 0.51, 1.2, 0.43], [s * 0.54, 1.38, 0.38], 0.008, { color: CHROME });
    b.part(new THREE.SphereGeometry(1, 10, 6), CHROME, { at: [s * 0.54, 1.42, 0.38], scale: [0.065, 0.048, 0.014] });
    b.part(new THREE.SphereGeometry(1, 10, 6), "#b9e4ff", { at: [s * 0.54, 1.42, 0.372], scale: [0.055, 0.04, 0.012] });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 18), "#8a93a3", { at: [0.07, FY, FZ], dir: [1, 0, 0] });
  // headlight
  b.lathe([[0, 0], [0.1, 0], [0.13, 0.05], [0.13, 0.14], [0.11, 0.19], [0, 0.19]], {
    at: [0, 0.93, 0.62], axis: [0, 0, 1], color: ORANGE, segments: 14,
  });
  glow(cylZ(0.1, 0.02, "#e8fbff", [0, 0.93, 0.81], 16), 1.8);
  cylZ(0.115, 0.012, CHROME, [0, 0.93, 0.8], 16);
  // dash
  cylZ(0.05, 0.03, GRAPH, [0, 1.03, 0.56], 12);
  b.part(new THREE.CircleGeometry(0.043, 16), "#ffffff", { at: [0, 1.036, 0.552], dir: [0, 0.6, -0.8], axis: "z", texture: GAUGE });
  // front disc & kickstand
  b.rod([0.14, 0.3, -0.3], [0.2, 0.012, -0.35], 0.014, { color: STEEL, caps: "flat" });
  cylX(0.025, 0.04, STEEL, [0.14, 0.3, -0.3], 8);

  // ---------- drive ----------
  cylX(0.1, 0.03, STEEL, [0.15, RY, RZ], 20);
  cylX(0.05, 0.03, STEEL, [0.15, 0.38, -0.18], 12);
  b.rod([0.15, RY + 0.1, RZ], [0.15, 0.43, -0.18], 0.008, { color: RUBBER });
  b.rod([0.15, RY - 0.1, RZ], [0.15, 0.33, -0.18], 0.008, { color: RUBBER });
  cylX(0.12, 0.008, "#8a93a3", [-0.1, RY, RZ], 20);

  return b.root;
}
