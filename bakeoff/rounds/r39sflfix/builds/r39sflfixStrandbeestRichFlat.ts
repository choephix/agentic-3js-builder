import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Wind Walker",
  description:
    "A Theo Jansen style beach creature: yellow conduit frame, twenty-four Jansen-linkage legs on crank axles, and soda-bottle wind wings on top.",
};

const TUBE = "#e8c21a";
const TUBE_D = "#c79a10";
const JOINT = "#e9e3cf";
const STEEL = "#8a8f96";
const BOTTLE_A = "#d3ecf2";
const BOTTLE_B = "#bfe0c8";
const CAP = "#e0502c";
const SAND = "#d8c28a";
const TANK = "#4a86c4";
const ROPE = "#3a2d20";
const FOOT = "#2f2a26";

type P2 = [number, number];
const S = 0.011; // meters per linkage unit

function ix(p: P2, r1: number, q: P2, r2: number): [P2, P2] {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const d = Math.max(Math.hypot(dx, dy), 1e-6);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h2 = r1 * r1 - a * a;
  const h = h2 > 0 ? Math.sqrt(h2) : 0;
  const mx = p[0] + (a * dx) / d, my = p[1] + (a * dy) / d;
  return [
    [mx - (h * dy) / d, my + (h * dx) / d],
    [mx + (h * dy) / d, my - (h * dx) / d],
  ];
}
const up = (r: [P2, P2]) => (r[0][1] >= r[1][1] ? r[0] : r[1]);
const down = (r: [P2, P2]) => (r[0][1] < r[1][1] ? r[0] : r[1]);
const back = (r: [P2, P2]) => (r[0][0] <= r[1][0] ? r[0] : r[1]);

const A: P2 = [0, 0];
const B: P2 = [-38, -7.8];

function leg(phi: number) {
  const C: P2 = [15 * Math.cos(phi), 15 * Math.sin(phi)];
  const D = up(ix(B, 41.5, C, 50));
  const E = down(ix(B, 40.1, C, 61.9));
  const F = back(ix(D, 39.4, E, 36.7));
  const G = down(ix(F, 49, E, 65.7));
  return { C, D, E, F, G };
}

export default function build() {
  const b = createBuilder({ name: "windwalker" });
  const R = rng(11);

  // Plan the legs first so the lowest foot lands on the floor.
  const specs: { x: number; z: number; phi: number }[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const phi = i * 2.4 + (s > 0 ? 0 : Math.PI);
      const z = -0.8 + i * 0.32;
      specs.push({ x: s * 0.52, z, phi });
      specs.push({ x: s * 0.6, z, phi: phi + 2.1 });
    }
  let minV = 0;
  for (let k = 0; k < 24; k++) for (let n = 0; n < 12; n++) minV = Math.min(minV, leg((n / 12) * Math.PI * 2 + k).G[1]);
  const FR = 0.03;
  const PY = FR - minV * S;
  const top = PY + 0.75;

  b.joint("body", { at: [0, PY, 0] });

  const pt = (x: number, p: P2, z: number): [number, number, number] => [x, PY + p[1] * S, z + p[0] * S];
  const rod = (a: number[], c: number[], r: number, col = TUBE) => b.rod(a, c, r, col, { detail: 0.6 });
  const knob = (p: number[], r: number, col = JOINT) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { at: p });

  // --- legs ---
  for (const sp of specs) {
    const L = leg(sp.phi);
    const T = (p: P2) => pt(sp.x, p, sp.z);
    const a = T(A), bb = T(B), c = T(L.C), d = T(L.D), e = T(L.E), f = T(L.F), g = T(L.G);
    rod(a, c, 0.011, STEEL);
    rod(bb, d, 0.013);
    rod(bb, e, 0.013);
    rod(c, d, 0.011);
    rod(c, e, 0.011, TUBE_D);
    rod(d, f, 0.013);
    rod(e, f, 0.013, TUBE_D);
    rod(f, g, 0.015);
    rod(e, g, 0.011, TUBE_D);
    knob(c, 0.02, CAP);
    knob(d, 0.016);
    knob(e, 0.016);
    knob(f, 0.017);
    knob(bb, 0.015, STEEL);
    b.part(new THREE.ConeGeometry(0.03, 0.06, 6), FOOT, { at: [g[0], g[1] + 0.005, g[2]], dir: [0, -1, 0] });
  }

  // --- axles ---
  for (const s of [1, -1]) {
    rod([s * 0.47, PY, -1.15], [s * 0.47, PY, 1.15], 0.02, STEEL);
    rod([s * 0.47 + s * 0.17, PY, -1.0], [s * 0.47 + s * 0.17, PY, 1.0], 0.012, STEEL);
  }

  // --- frame: lower rails, upper rails, truss ---
  const Z0 = -1.25, Z1 = 1.3;
  const rails: [number, number, number][][] = [];
  for (const s of [1, -1]) {
    rod([s * 0.3, PY + 0.05, Z0], [s * 0.3, PY + 0.05, Z1], 0.022);
    rod([s * 0.2, top, Z0 + 0.1], [s * 0.2, top, Z1 - 0.1], 0.022);
    rails.push([[s * 0.3, PY + 0.05, 0]]);
  }
  rod([0, top + 0.12, Z0 + 0.1], [0, top + 0.12, Z1 - 0.1], 0.026);
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const z = Z0 + 0.1 + (i / N) * (Z1 - Z0 - 0.2);
    for (const s of [1, -1]) {
      rod([s * 0.3, PY + 0.05, z], [s * 0.2, top, z], 0.014);
      rod([s * 0.2, top, z], [0, top + 0.12, z], 0.012);
      if (i < N) {
        const z2 = z + (Z1 - Z0 - 0.2) / N;
        const flip = i % 2 === 0;
        rod(
          [s * 0.3, PY + 0.05, flip ? z : z2],
          [s * 0.2, top, flip ? z2 : z],
          0.01,
          TUBE_D,
        );
      }
    }
    rod([-0.3, PY + 0.05, z], [0.3, PY + 0.05, z], 0.012, TUBE_D);
    knob([0.3, PY + 0.05, z], 0.017);
    knob([-0.3, PY + 0.05, z], 0.017);
    knob([0.2, top, z], 0.015);
    knob([-0.2, top, z], 0.015);
  }
  // end braces tying frame to axle bearings
  for (const s of [1, -1])
    for (const z of [Z0 + 0.1, Z1 - 0.1]) rod([s * 0.3, PY + 0.05, z], [s * 0.47, PY, z * 0.9], 0.013, STEEL);

  // --- bottle wind wings ---
  const NB = 18;
  for (const s of [1, -1]) {
    for (let i = 0; i < NB; i++) {
      const z = Z0 + 0.2 + (i / (NB - 1)) * (Z1 - Z0 - 0.4);
      const bulge = Math.sin((i / (NB - 1)) * Math.PI);
      const rise = 0.28 + 0.35 * bulge;
      const a: [number, number, number] = [s * 0.22, top + 0.08, z];
      const e: [number, number, number] = [s * 0.95, top + 0.08 + rise, z];
      const col = i % 3 === 1 ? BOTTLE_B : BOTTLE_A;
      b.capsule(a, e, [0.05, 0.062], col, { detail: 0.7 });
      const dir = new THREE.Vector3(e[0] - a[0], e[1] - a[1], e[2] - a[2]).normalize();
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.035, 6), CAP, {
        at: [a[0] - dir.x * 0.01, a[1] - dir.y * 0.01, a[2]],
        dir: [-dir.x, -dir.y, -dir.z],
      });
      // sand-labelled band
      b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.05, 8), SAND, {
        at: [a[0] + dir.x * 0.4, a[1] + dir.y * 0.4, a[2]],
        dir: [dir.x, dir.y, dir.z],
      });
      if (i % 3 === 0) {
        rod([s * 0.2, top, z], [s * 0.3, top + 0.1, z], 0.01, ROPE);
        rod([s * 0.95, top + 0.08 + rise, z], [s * 0.45, top + 0.1, z], 0.006, ROPE);
      }
    }
    // wing spar
    rod([s * 0.22, top + 0.08, Z0 + 0.1], [s * 0.22, top + 0.08, Z1 - 0.1], 0.016);
    rod([s * 0.6, top + 0.22, Z0 + 0.4], [s * 0.6, top + 0.22, Z1 - 0.4], 0.01, TUBE_D);
  }

  // --- head probe (front) ---
  rod([0, top + 0.05, Z1 - 0.1], [0, top - 0.2, Z1 + 0.5], 0.02);
  rod([0, top - 0.2, Z1 + 0.5], [0, PY - 0.15, Z1 + 0.75], 0.014, TUBE_D);
  b.part(new THREE.SphereGeometry(0.07, 8, 6), JOINT, { at: [0, PY - 0.15, Z1 + 0.78] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), FOOT, { at: [0.04, PY - 0.13, Z1 + 0.84] });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), FOOT, { at: [-0.04, PY - 0.13, Z1 + 0.84] });
  rod([0, top - 0.2, Z1 + 0.5], [0.25, PY + 0.05, Z1 - 0.1], 0.011, TUBE_D);
  rod([0, top - 0.2, Z1 + 0.5], [-0.25, PY + 0.05, Z1 - 0.1], 0.011, TUBE_D);

  // --- tail vane ---
  rod([0, top + 0.12, Z0 + 0.1], [0, top + 0.5, Z0 - 0.3], 0.015);
  b.extrude(
    [[0, 0], [0.4, 0.05], [0.45, 0.35], [0.05, 0.3]],
    { at: [0, top + 0.5, Z0 - 0.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: CAP },
  );

  // --- ballast tanks hanging under the belly ---
  for (const s of [1, -1])
    for (const z of [-0.5, 0.5]) {
      const cx = s * 0.12;
      b.capsule([cx, PY + 0.2, z - 0.18], [cx, PY + 0.2, z + 0.18], 0.07, TANK, { detail: 0.7 });
      rod([cx, PY + 0.2, z], [s * 0.3, PY + 0.05, z], 0.006, ROPE);
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), CAP, { at: [cx, PY + 0.27, z], dir: [0, 1, 0] });
    }

  // sand flecks stuck to a few feet
  for (let i = 0; i < 12; i++) {
    const sp = specs[Math.floor(R() * specs.length)];
    const g = pt(sp.x, leg(sp.phi).G, sp.z);
    b.part(new THREE.SphereGeometry(0.014 + R() * 0.01, 5, 3), SAND, { at: [g[0], g[1] + 0.03, g[2]] });
  }

  return b.root;
}
