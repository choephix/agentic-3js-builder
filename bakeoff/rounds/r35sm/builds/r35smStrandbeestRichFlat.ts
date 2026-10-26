import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Strandbeest Tube Walker",
  description:
    "A Theo Jansen style wind-walking beach creature: twelve Jansen-linkage legs of yellow PVC tubes on offset cranks, a Warren-truss frame, a mast with sails, rows of bottle wind-catchers and rigging.",
};

// palette
const YEL = "#e8b926";
const YEL2 = "#c98f17";
const BLK = "#1d1b1a";
const STEEL = "#8e939a";
const WHITE = "#f4f1e6";
const BOTTLE = "#bfdbe8";
const CAP = "#2b6fb3";
const CAP2 = "#e9e4d2";
const CLOTH = "#efe3c4";
const CLOTH2 = "#d9854a";
const ROPE = "#8a6a3a";

type V2 = [number, number];
type V3 = [number, number, number];

// ---------- Jansen linkage (2D, u = forward, v = up) ----------
const SC = 0.016; // metres per linkage unit
const LA = { a: 38, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, j: 50, k: 61.9, l: 7.8, m: 15 };

function inter(p: V2, r1: number, q: V2, r2: number, first: (a: V2, b: V2) => boolean): V2 {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r1 * r1 - a * a, 0));
  const mx = p[0] + (a * dx) / d;
  const my = p[1] + (a * dy) / d;
  const c1: V2 = [mx - (h * dy) / d, my + (h * dx) / d];
  const c2: V2 = [mx + (h * dy) / d, my - (h * dx) / d];
  return first(c1, c2) ? c1 : c2;
}

function jansen(theta: number) {
  const A: V2 = [0, 0];
  const C: V2 = [LA.a, LA.l];
  const P: V2 = [C[0] + LA.m * Math.cos(theta), C[1] + LA.m * Math.sin(theta)];
  const K = inter(A, LA.b, P, LA.j, (x, y) => x[1] < y[1]);
  const L = inter(A, LA.c, K, LA.d, (x, y) => x[0] < y[0]);
  const M = inter(K, LA.e, L, LA.g, (x, y) => x[1] < y[1]);
  const N = inter(P, LA.k, L, LA.f, (x, y) => x[1] < y[1]);
  return { A, C, P, K, L, M, N };
}

export default function build() {
  const b = createBuilder({ name: "strandbeest" });

  const FOOT_R = 0.035;
  const NU = 6;
  const ZI = (i: number) => -1.35 + i * 0.54;
  const XI = [0.3, 0.42, 0.36, 0.48, 0.33, 0.45];

  // leg data first, so the lowest foot lands on the floor
  const legs: { i: number; s: number; n: ReturnType<typeof jansen> }[] = [];
  let minV = 0;
  for (let i = 0; i < NU; i++)
    for (const s of [1, -1]) {
      const th = ((i * 137 + (s < 0 ? 180 : 0)) * Math.PI) / 180;
      const n = jansen(th);
      minV = Math.min(minV, n.M[1]);
      legs.push({ i, s, n });
    }
  const Y0 = FOOT_R - minV * SC;
  const YT = Y0 + 0.62;

  // ---------- helpers ----------
  const tube = (p: V3, q: V3, r: number, color: string, sides = 8) =>
    b.rod(p, q, r, color, { sides });
  const plug = (at: V3, dir: V3, r: number) =>
    b.part(new THREE.CylinderGeometry(r * 1.1, r * 1.1, r * 1.2, 8), BLK, { at, dir });
  const tie = (at: V3, r = 0.036) =>
    b.part(new THREE.TorusGeometry(r, 0.006, 4, 10), WHITE, { at });
  const pin = (p: V3, q: V3) => tube(p, q, 0.014, BLK, 6);

  // ---------- legs, cranks, cross beams ----------
  for (let i = 0; i < NU; i++) {
    const zi = ZI(i);
    const xi = XI[i];
    const col = i % 2 ? YEL2 : YEL;
    // cross beam carrying the hip pivots
    tube([-xi, Y0, zi], [xi, Y0, zi], 0.03, col);
    plug([xi + 0.015, Y0, zi], [1, 0, 0], 0.03);
    plug([-xi - 0.015, Y0, zi], [-1, 0, 0], 0.03);
    // crank axle
    const ay = Y0 + LA.l * SC;
    const az = zi + LA.a * SC;
    tube([-xi - 0.11, ay, az], [xi + 0.11, ay, az], 0.018, STEEL, 8);
    b.part(new THREE.BoxGeometry(0.07, 0.06, 0.07), BLK, { at: [0, ay, az] });
    tube([0, ay, az], [0, Y0, zi], 0.014, STEEL, 6);
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), STEEL, {
        at: [s * (xi + 0.11), ay, az],
        dir: [s, 0, 0],
      });
    }
  }

  for (const { i, s, n } of legs) {
    const zi = ZI(i);
    const xi = XI[i];
    const pA = s * xi;
    const pB = s * (xi + 0.04);
    const pC = s * (xi + 0.08);
    const at = (x: number, q: V2): V3 => [x, Y0 + q[1] * SC, zi + q[0] * SC];
    const c1 = i % 2 ? YEL2 : YEL;
    const c2 = i % 2 ? YEL : YEL2;
    const R = 0.011;
    const link = (p: V3, q: V3, c: string) => tube(p, q, R, c, 6);

    link(at(pA, n.A), at(pA, n.K), c1);
    link(at(pA, n.A), at(pA, n.L), c1);
    link(at(pA, n.K), at(pA, n.L), c2);
    link(at(pA, n.K), at(pA, n.M), c1);
    link(at(pA, n.L), at(pA, n.M), c2);
    link(at(pB, n.P), at(pB, n.K), c2);
    link(at(pB, n.P), at(pB, n.N), c1);
    link(at(pB, n.N), at(pB, n.L), c2);
    // crank arm and pin
    tube(at(pC, n.C), at(pC, n.P), 0.013, STEEL, 6);
    pin(at(pA, n.P), at(pC, n.P));
    // pins at joints
    pin(at(pA - s * 0.01, n.K), at(pB + s * 0.01, n.K));
    pin(at(pA - s * 0.01, n.L), at(pB + s * 0.01, n.L));
    pin(at(pB - s * 0.01, n.N), at(pB + s * 0.012, n.N));
    pin(at(pA - s * 0.015, n.A), at(pA + s * 0.015, n.A));
    // foot: rubber ball with a pale sock ring
    const m = at(pA, n.M);
    b.part(new THREE.SphereGeometry(FOOT_R, 8, 6), BLK, { at: m });
    b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.05, 6), WHITE, { at: [m[0], m[1] + 0.045, m[2]] });
  }

  // ---------- frame (Warren truss each side) ----------
  const zA = -1.6;
  const zB = 1.52;
  for (const s of [1, -1]) {
    const x = s * 0.26;
    tube([x, Y0, zA], [x, Y0, zB], 0.03, YEL);
    tube([x, YT, zA], [x, YT, zB], 0.03, YEL);
    plug([x, Y0, zA - 0.01], [0, 0, -1], 0.03);
    plug([x, YT, zA - 0.01], [0, 0, -1], 0.03);
    for (let i = 0; i < NU; i++) {
      const zi = ZI(i);
      tube([x, Y0, zi], [x, YT, zi], 0.022, YEL2);
      tie([x, Y0, zi]);
      tie([x, YT, zi]);
      if (i < NU - 1) {
        const z2 = ZI(i + 1);
        if (i % 2) tube([x, Y0, zi], [x, YT, z2], 0.018, YEL2, 6);
        else tube([x, YT, zi], [x, Y0, z2], 0.018, YEL2, 6);
      }
    }
    // outer bottle rail with arms
    tube([s * 0.5, YT + 0.05, zA + 0.1], [s * 0.5, YT + 0.05, zB - 0.1], 0.02, YEL2, 6);
    for (let i = 0; i < NU; i++) tube([x, YT, ZI(i)], [s * 0.5, YT + 0.05, ZI(i)], 0.016, YEL, 6);
  }
  for (let i = 0; i < NU; i++) tube([-0.26, YT, ZI(i)], [0.26, YT, ZI(i)], 0.026, i % 2 ? YEL2 : YEL);

  // front and rear hoops
  const hoop = (z: number, rise: number, lean: number) => {
    const pts: V3[] = [
      [-0.26, Y0, z],
      [-0.28, YT, z + lean * 0.5],
      [-0.14, YT + rise * 0.8, z + lean * 0.9],
      [0, YT + rise, z + lean],
      [0.14, YT + rise * 0.8, z + lean * 0.9],
      [0.28, YT, z + lean * 0.5],
      [0.26, Y0, z],
    ];
    b.sweep(pts, 0.026, { color: YEL, sides: 8 });
  };
  hoop(zB, 0.5, 0.26);
  hoop(zA, 0.6, -0.2);

  // ---------- mast, sails ----------
  const mastZ = ZI(1);
  const baseY = YT + 0.06;
  const mastTop = baseY + 1.5;
  tube([0, YT, mastZ], [0, mastTop, mastZ], 0.032, YEL, 8);
  plug([0, mastTop + 0.01, mastZ], [0, 1, 0], 0.032);
  tie([0, baseY + 0.4, mastZ].map((v, k) => (k === 2 ? v : v)) as V3, 0.04);
  // boom
  tube([0, baseY, mastZ], [0, baseY, mastZ - 1.1], 0.018, YEL2, 6);

  const SZ = (x: number) => mastZ - x;
  const SY = (y: number) => baseY + y;

  const mainOutline: [number, number][] = [
    [0.04, 0.0],
    [0.04, 1.45],
    [0.5, 1.0],
    [1.0, 0.45],
    [0.9, 0.0],
  ];
  b.extrude(mainOutline, { at: [0, baseY, mastZ], x: [0, 0, -1], thickness: 0.01, color: CLOTH });
  b.extrude(
    [
      [0.04, 0.0],
      [0.9, 0.0],
      [0.93, 0.15],
      [0.04, 0.15],
    ],
    { at: [0, baseY, mastZ], x: [0, 0, -1], thickness: 0.016, color: CLOTH2 },
  );
  // battens
  for (const yy of [0.35, 0.65, 0.95]) {
    const edgeX = yy < 0.45 ? 0.95 : yy < 1.0 ? 1.0 - ((yy - 0.45) / 0.55) * 0.5 : 0.5;
    for (const s of [1, -1]) tube([s * 0.011, SY(yy), SZ(0.05)], [s * 0.011, SY(yy), SZ(edgeX - 0.03)], 0.006, YEL2, 4);
  }
  // jib
  b.extrude(
    [
      [0.04, 0.1],
      [0.04, 1.35],
      [0.55, 0.7],
      [0.9, 0.12],
    ],
    { at: [0, baseY, mastZ], x: [0, 0, 1], thickness: 0.008, color: CLOTH2 },
  );
  tube([0, baseY, mastZ], [0, baseY, mastZ + 1.0], 0.014, YEL2, 6);
  // emblem: ring with three linkage spokes
  const ecz = SZ(0.42);
  const ecy = SY(0.62);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.17, 0.014, 4, 14), BLK, { at: [s * 0.014, ecy, ecz], dir: [s, 0, 0], axis: "z" });
    for (const ang of [90, 210, 330]) {
      const r = (ang * Math.PI) / 180;
      tube(
        [s * 0.014, ecy, ecz],
        [s * 0.014, ecy + Math.sin(r) * 0.16, ecz + Math.cos(r) * 0.16],
        0.01,
        BLK,
        4,
      );
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 4), CLOTH2, { at: [s * 0.016, ecy, ecz] });
  }

  // rigging
  const rope = (p: V3, q: V3) => b.rod(p, q, 0.004, ROPE, { sides: 4 });
  rope([0, mastTop, mastZ], [0, YT + 0.5, zB + 0.26]);
  rope([0, mastTop, mastZ], [0, YT + 0.6, zA - 0.2]);
  rope([0, mastTop - 0.2, mastZ], [0, baseY, mastZ + 1.0]);
  for (const s of [1, -1]) {
    rope([0, mastTop - 0.1, mastZ], [s * 0.5, YT + 0.05, ZI(0)]);
    rope([0, mastTop - 0.1, mastZ], [s * 0.5, YT + 0.05, ZI(3)]);
    rope([0, mastTop - 0.5, mastZ], [s * 0.26, YT, ZI(2)]);
  }

  // ---------- bottle wind-catchers ----------
  const BN = 11;
  for (const s of [1, -1]) {
    for (let k = 0; k < BN; k++) {
      const z = zA + 0.2 + k * ((zB - zA - 0.4) / (BN - 1));
      const base: V3 = [s * 0.5, YT + 0.07, z];
      const ax = new THREE.Vector3(s * 0.38, 1, 0).normalize();
      b.lathe(
        [
          [0, 0],
          [0.05, 0],
          [0.05, 0.27],
          [0.022, 0.33],
          [0.022, 0.37],
          [0, 0.37],
        ],
        { at: base, axis: ax.toArray() as V3, segments: 8, color: BOTTLE },
      );
      const capAt = new THREE.Vector3(...base).addScaledVector(ax, 0.385);
      b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.035, 8), k % 2 ? CAP : CAP2, {
        at: capAt.toArray() as V3,
        dir: ax.toArray() as V3,
      });
      // zip tie band around the bottle belly
      const bandAt = new THREE.Vector3(...base).addScaledVector(ax, 0.12);
      b.part(new THREE.CylinderGeometry(0.054, 0.054, 0.012, 8), WHITE, {
        at: bandAt.toArray() as V3,
        dir: ax.toArray() as V3,
      });
    }
  }

  // ---------- wind vane at the nose ----------
  const noseTop: V3 = [0, YT + 0.5, zB + 0.26];
  tube(noseTop, [0, YT + 0.95, zB + 0.26], 0.012, STEEL, 6);
  b.extrude(
    [
      [0, 0],
      [0.32, 0.0],
      [0.4, 0.05],
      [0.32, 0.1],
      [0, 0.1],
      [-0.12, 0.2],
      [-0.12, -0.1],
    ],
    { at: [0, YT + 0.9, zB + 0.26], x: [0, 0, 1], thickness: 0.006, color: CLOTH2 },
  );
  b.part(new THREE.SphereGeometry(0.025, 6, 4), BLK, { at: [0, YT + 0.97, zB + 0.26] });

  // ---------- belly bottle lungs (low, between the leg rows) ----------
  for (let k = 0; k < 5; k++) {
    const z = ZI(0) + k * 0.54 + 0.27;
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.045, 0.2],
        [0.02, 0.26],
        [0, 0.26],
      ],
      { at: [0, YT + 0.0, z], axis: [0, 1, 0], segments: 8, color: BOTTLE },
    );
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 8), CAP, { at: [0, YT + 0.275, z] });
  }

  return b.root;
}
