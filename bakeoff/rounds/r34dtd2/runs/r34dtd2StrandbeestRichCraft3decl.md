```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle, noise, smoothstep, mix, svg } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest",
  description:
    "Wind-walking beach creature in the manner of Theo Jansen: yellow conduit frame, twelve phased Jansen-linkage legs, a sloped sail rack and bottle floats.",
};

type V2 = [number, number];
const S = 0.012; // metres per linkage unit

function isect(p: V2, r0: number, q: V2, r1: number, hi: boolean): V2 {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  let d = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / d, uy = dy / d;
  if (d > r0 + r1 - 1e-6) return [p[0] + ux * r0 * (d / (r0 + r1)), p[1] + uy * r0 * (d / (r0 + r1))];
  if (d < Math.abs(r0 - r1) + 1e-6) d = Math.abs(r0 - r1) + 1e-3;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = p[0] + ux * a, my = p[1] + uy * a;
  const c1: V2 = [mx - uy * h, my + ux * h];
  const c2: V2 = [mx + uy * h, my - ux * h];
  return (c1[1] > c2[1]) === hi ? c1 : c2;
}

type Leg = { O: V2; C: V2; A: V2; B: V2; E: V2; F: V2 };
function solve(th: number): Leg {
  const O: V2 = [0, 0];
  const X: V2 = [38, 7.8];
  const C: V2 = [X[0] + 15 * Math.cos(th), X[1] + 15 * Math.sin(th)];
  const A = isect(O, 41.5, C, 39.3, true);
  const B = isect(O, 40.1, C, 55.8, false);
  const E = isect(A, 39.4, B, 36.7, false);
  const F = isect(E, 65.7, C, 61.9, false);
  return { O, C, A, B, E, F };
}

export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const R = rng(11);

  const YELLOW = mottle("#f2c418", "#d9a60e", { size: 0.18, seed: 3 });
  const YELLOW2 = paint((p, n) => {
    const base = mix("#f6d02a", "#c99a0c", noise(p, 0.1, 5));
    const wear = smoothstep(0.62, 0.8, noise(p, 0.03, 9));
    const c = mix(base, "#8a6a22", wear * 0.5);
    const k = 0.85 + 0.15 * smoothstep(-0.8, 0.6, n.y);
    return [c[0] * k, c[1] * k, c[2] * k];
  });
  const LEGC = ["#f4cb1c", "#e8b812", "#fbd83a"];
  const SHOE = "#2b2a2e";
  const KNOB = "#d8d6cc";
  const BOTTLE = "#a9d8ea";
  const CAP = "#e84a3a";
  const ROPE = "#c9b48a";

  // Sail cloth: pale, seamed, stitched, with a faint sun-bleached gradient.
  const CLOTH = paint((p, n, s) => {
    const u = s[0], v = s[1];
    let c = mix("#f4efe0", "#d8d0b8", noise(p, 0.15, 2));
    const seam = Math.abs(((u / 0.22) % 1 + 1) % 1 - 0.5) > 0.47;
    const hem = v < 0.03 || v > 0.62;
    if (seam || hem) c = mix(c, "#a89a78", 0.7);
    const sal = smoothstep(0.1, 0.4, v) * 0.1;
    return [c[0] - sal, c[1] - sal, c[2] - sal * 0.5];
  });
  const flag = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#1f5f8b" stroke-width="5"/>
      <path d="M8 38 Q20 24 32 38 T56 38" fill="none" stroke="#1f5f8b" stroke-width="5" stroke-linecap="round"/>
      <path d="M12 48 Q22 38 32 48 T52 48" fill="none" stroke="#e84a3a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="18" r="5" fill="#f2c418"/>
    </svg>`,
    { size: 128 },
  );

  // Pick the pivot height so the lowest foot touches the floor.
  const NP = 12;
  const phases = Array.from({ length: NP }, (_, i) => (i * 2 * Math.PI) / NP * 5 / 1); // spread phases
  let minRel = 1e9;
  for (let k = 0; k < 48; k++) minRel = Math.min(minRel, (solve((k / 48) * Math.PI * 2).F[1] - 7.8) * S);
  const Y0 = -minRel - 0.01;
  const W = 1.3;

  const P = (x: number, q: V2): [number, number, number] => [x, Y0 + (q[1] - 7.8) * S, -(q[0] - 38) * S];
  const rod = (a: number[], c: number[], r: number, col: any) => b.rod(a, c, r, col, { sides: 6 });
  const ball = (p: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { at: p });

  // Main axle & pivot rods and frame tubes.
  const axleY = Y0, pivY = Y0 - 7.8 * S, pivZ = 38 * S;
  const TOPY = Y0 + 1.05, TOPZ = 0.05;
  rod([-W, axleY, 0], [W, axleY, 0], 0.03, YELLOW);
  rod([-W, pivY, pivZ], [W, pivY, pivZ], 0.03, YELLOW);
  rod([-W, TOPY, TOPZ], [W, TOPY, TOPZ], 0.028, YELLOW2);
  rod([-W, Y0 + 0.35, -1.15], [W, Y0 + 0.35, -1.15], 0.026, YELLOW2);
  rod([-W, Y0 - 0.1, -0.5], [W, Y0 - 0.1, -0.5], 0.02, YELLOW);
  for (const s of [1, -1]) {
    const x = s * W;
    rod([x, axleY, 0], [x, pivY, pivZ], 0.026, YELLOW);
    rod([x, axleY, 0], [x, TOPY, TOPZ], 0.026, YELLOW2);
    rod([x, pivY, pivZ], [x, TOPY, TOPZ], 0.026, YELLOW2);
    rod([x, TOPY, TOPZ], [x, Y0 + 0.35, -1.15], 0.022, YELLOW);
    rod([x, axleY, 0], [x, Y0 + 0.35, -1.15], 0.022, YELLOW);
    rod([x, Y0 - 0.1, -0.5], [x, axleY, 0], 0.018, YELLOW);
    ball([x, axleY, 0], 0.045, KNOB);
    ball([x, pivY, pivZ], 0.045, KNOB);
    ball([x, TOPY, TOPZ], 0.045, KNOB);
    ball([x, Y0 + 0.35, -1.15], 0.04, KNOB);
  }
  // Cross braces along the width
  for (let k = -2; k <= 2; k++) {
    const x = k * 0.5;
    rod([x, axleY, 0], [x * 0.9, Y0 + 0.35, -1.15], 0.015, YELLOW);
    rod([x, pivY, pivZ], [x, TOPY, TOPZ], 0.015, YELLOW);
  }

  // Legs
  for (let i = 0; i < NP; i++) {
    const x = (i - (NP - 1) / 2) * 0.2;
    const th = phases[i] % (Math.PI * 2);
    const L = solve(th);
    const col = LEGC[i % 3];
    const pts = { O: P(x, L.O), C: P(x, L.C), A: P(x, L.A), B: P(x, L.B), E: P(x, L.E), F: P(x, L.F) };
    const r = 0.011;
    rod(pts.O, pts.A, r, col);
    rod(pts.C, pts.A, r, col);
    rod(pts.O, pts.B, r, col);
    rod(pts.C, pts.B, r, col);
    rod(pts.A, pts.E, r, col);
    rod(pts.B, pts.E, r, col);
    rod(pts.E, pts.F, r, col);
    rod(pts.C, pts.F, r, col);
    // crank pin
    rod([x, axleY, 0], pts.C, 0.012, KNOB);
    for (const k of ["A", "B", "E", "C"] as const) ball(pts[k], 0.017, KNOB);
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), SHOE, { at: [pts.F[0], pts.F[1] + 0.02, pts.F[2]], dir: [0, -1, 0] });
    ball(pts.F, 0.026, SHOE);
  }

  // Sail rack
  const sailSlope = (t: number): [number, number] => [TOPY - (TOPY - (Y0 + 0.35)) * t, TOPZ - (TOPZ + 1.15) * t];
  const outline: [number, number][] = [[0, 0], [2.3, 0], [2.3, 0.62], [0, 0.62]];
  for (let k = 0; k < 4; k++) {
    const [y, z] = sailSlope((k + 0.5) / 4.2);
    b.extrude(outline, { at: [-1.15, y - 0.7, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CLOTH });
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      at: [(R() - 0.5) * 1.2, y - 0.4, z + 0.01],
      dir: [0, 0, 1],
      axis: "z",
      texture: flag,
    });
    // hanging lines
    for (const x of [-1.1, -0.4, 0.4, 1.1]) rod([x, y - 0.08, z], [x, sailSlope(k / 4.2)[0], sailSlope(k / 4.2)[1]], 0.004, ROPE);
  }
  // Wing tubes holding sails
  for (const s of [1, -1]) {
    const a = sailSlope(0.0), c = sailSlope(1.0);
    rod([s * 1.17, a[0], a[1]], [s * 1.17, c[0], c[1]], 0.013, YELLOW);
  }

  // Bottle floats along the ridge
  for (let k = 0; k < 9; k++) {
    const x = -1.05 + k * 0.26;
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), BOTTLE, {
      at: [x, TOPY + 0.07, TOPZ + 0.02],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), CAP, {
      at: [x, TOPY + 0.07, TOPZ + 0.13],
      dir: [0, 0, 1],
    });
  }

  return b.root;
}
```