import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V3 = [number, number, number];

// Palette
const YELLOW = "#f7c31c";
const GOLD = "#e58d0c";
const INK = "#3b2a14";
const FRECKLE = "#fffdf3";
const EYE = "#fcf9ec";
const PUPIL = "#1e1b17";
const GLINT = "#ffffff";
const FIN = "#fff1ad";
const FIN_EDGE = "#e39f1a";
const GRASS = "#2f9447";
const GRASS_LT = "#5fbb5e";
const GRASS_DK = "#22703a";
const SAND = "#ead08c";
const PEBBLE = "#a39c8f";

// Seagrass strand axis (x = 0). The tail coils around it.
const ZC = -0.035;

// Body spine, bottom (tail root) to top (neck), in metres.
const TRUNK: V3[] = [
  [0, 0.09, -0.008],
  [0, 0.112, 0.004],
  [0, 0.136, 0.017],
  [0, 0.16, 0.016],
  [0, 0.186, 0.004],
  [0, 0.206, -0.001],
];
const TRUNK_R = 0.0185;
const RIDGES = 7;
const ridgeU = (k: number) => 0.1 + (0.82 * k) / (RIDGES - 1);

const HEAD_C: V3 = [0, 0.22, 0.012];

const GRASS_MAIN: V3[] = [
  [0, 0, ZC],
  [0, 0.1, ZC],
  [0.001, 0.2, ZC - 0.002],
  [0, 0.28, ZC - 0.005],
  [-0.006, 0.34, ZC - 0.004],
  [-0.012, 0.385, ZC + 0.002],
];

// Vector helpers
const add = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V3, c: V3): V3 => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => mul(a, 1 / (len(a) || 1));
const halfway = (a: V3, c: V3): V3 => mul(add(a, c), 0.5);
const cross = (a: V3, c: V3): V3 => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];

// Uniform Catmull-Rom through control points; u in [0, 1] spans the whole curve.
function spline(P: V3[], u: number): V3 {
  const n = P.length - 1;
  const f = Math.min(Math.max(u, 0), 1) * n;
  const i = Math.min(Math.floor(f), n - 1);
  const t = f - i;
  const p0 = P[Math.max(i - 1, 0)];
  const p1 = P[i];
  const p2 = P[i + 1];
  const p3 = P[Math.min(i + 2, n)];
  const t2 = t * t;
  const t3 = t2 * t;
  const k = (c: number) =>
    0.5 *
    (2 * p1[c] +
      (p2[c] - p0[c]) * t +
      (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 +
      (3 * p1[c] - p0[c] - 3 * p2[c] + p3[c]) * t3);
  return [k(0), k(1), k(2)];
}

const sampleCurve = (P: V3[], n: number): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => spline(P, i / n));

// Tangent of a curve f(u) by central difference.
const tangentOf = (f: (u: number) => V3, u: number): V3 =>
  unit(sub(f(Math.min(u + 0.002, 1)), f(Math.max(u - 0.002, 0))));

// Two directions perpendicular to T.
const perpFrame = (T: V3): [V3, V3] => {
  const ref: V3 = Math.abs(T[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const n1 = unit(cross(T, ref));
  return [n1, cross(T, n1)];
};

// Tail coil: wraps the seagrass strand about 1.35 turns and tightens toward the tip.
const coilAt = (s: number): V3 => {
  const th = Math.PI / 2 + 2 * Math.PI * 1.35 * s;
  const R = 0.0166 - 0.0016 * s;
  return [R * Math.cos(th), 0.088 - 0.034 * s, ZC + R * Math.sin(th)];
};

export const meta = {
  name: "Lined seahorse",
  description:
    "A sunny-yellow seahorse with dark ridge lines, white freckles, a crown of spikes, a fluttering dorsal fin and big curious eyes, its tail curled round a strand of seagrass.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Placement helpers ----------------------------------------------------
  const place = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V3,
    dir?: V3 | null,
    bone?: unknown,
  ) => {
    const opts: Record<string, unknown> = { at };
    if (dir) opts.dir = dir;
    if (bone) opts.bone = bone;
    return b.part(geo, color, opts as any);
  };
  const ball = (at: V3, r: number, color: string, bone?: unknown) =>
    place(new THREE.SphereGeometry(r, 10, 8), color, at, null, bone);
  // A thin disc whose axis runs along dir (rings, plates, dark lines).
  const disc = (at: V3, dir: V3, r: number, h: number, color: string, bone?: unknown) =>
    place(new THREE.CylinderGeometry(r, r, h, 12, 1), color, at, dir, bone);
  // A tube from a to c, radius rA at a and rC at c.
  const rod = (a: V3, c: V3, rA: number, rC: number, color: string, bone?: unknown) =>
    place(
      new THREE.CylinderGeometry(rC, rA, len(sub(c, a)), 8, 1),
      color,
      halfway(a, c),
      unit(sub(c, a)),
      bone,
    );

  // Skeleton -------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.09, -0.006] });
  const chest = b.joint("chest", { at: [0, 0.14, 0.016], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.19, 0.003], parent: chest });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.2028, 0.04], parent: head });

  const tailPath: V3[] = [
    [0, 0.09, -0.008],
    ...Array.from({ length: 22 }, (_, i) => coilAt(i / 21)),
  ];
  const tail = b.chain("tail", tailPath, { role: "tail", parent: hips });

  // Body -----------------------------------------------------------------
  const trunk = b.sweep(sampleCurve(TRUNK, 24), TRUNK_R, { color: YELLOW });
  const skin = b.surface(trunk);
  // Rounded belly end where the tail leaves the body.
  ball([0, 0.094, -0.006], TRUNK_R, YELLOW, hips);

  // Ridged plates with thin dark lines along each edge.
  for (let k = 0; k < RIDGES; k++) {
    const u = ridgeU(k);
    const c = spline(TRUNK, u);
    const T = tangentOf((v) => spline(TRUNK, v), u);
    const R = TRUNK_R + 0.0024 + 0.0026 * Math.sin(Math.PI * u);
    const PH = 0.0068;
    const bone = u < 0.36 ? hips : u < 0.72 ? chest : neck;
    disc(c, T, R, PH, YELLOW, bone);
    for (const side of [1, -1]) {
      disc(add(c, mul(T, side * (PH / 2 + 0.0004))), T, R + 0.0005, 0.0013, INK, bone);
    }
  }

  // White freckles in the gaps between plates.
  for (let k = 0; k < RIDGES - 1; k++) {
    const uMid = (ridgeU(k) + ridgeU(k + 1)) / 2;
    for (let j = 0; j < 3; j++) {
      const u = uMid + (j - 1) * 0.01;
      const a = k * 2.4 + j * 2.1 + 0.5;
      const [n1, n2] = perpFrame(tangentOf((v) => spline(TRUNK, v), u));
      const out = add(mul(n1, Math.cos(a)), mul(n2, Math.sin(a)));
      const hit = skin.nearest(add(spline(TRUNK, u), mul(out, 0.05)));
      b.stick(new THREE.SphereGeometry(0.0022, 6, 5), FRECKLE, hit);
    }
  }

  // Head -----------------------------------------------------------------
  place(
    new THREE.SphereGeometry(0.024, 18, 12).scale(0.96, 0.98, 1.08),
    YELLOW,
    HEAD_C,
    null,
    head,
  );

  // Long tube snout with a separate lower jaw on its own joint.
  const snoutA: V3 = [0, 0.2115, 0.028];
  const snoutB: V3 = [0, 0.2005, 0.088];
  rod(snoutA, snoutB, 0.0092, 0.0056, YELLOW, head);
  ball(snoutB, 0.0034, INK, head);
  rod([0, 0.2028, 0.04], [0, 0.1968, 0.082], 0.0046, 0.0034, YELLOW, jaw);

  // Crown of spikes ringed round the top of the head.
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.3;
    const base: V3 = [0.0125 * Math.cos(a), 0.2375, 0.012 + 0.0125 * Math.sin(a)];
    const dir = unit([0.55 * Math.cos(a), 1, 0.55 * Math.sin(a)]);
    const L = 0.0175;
    place(new THREE.ConeGeometry(0.0042, L, 6, 1), GOLD, add(base, mul(dir, L / 2)), dir, head);
  }

  // Big, curious eyes: white ball, dark pupil, glint.
  for (const s of [1, -1]) {
    const eye = add(HEAD_C, [s * 0.0158, 0.0065, 0.0118]);
    ball(eye, 0.0125, EYE, head);
    const gaze = unit([s * 0.45, 0.12, 0.88]);
    const pupil = add(eye, mul(gaze, 0.0118));
    ball(pupil, 0.0058, PUPIL, head);
    ball(add(add(pupil, mul(gaze, 0.0046)), [0, 0.0022, 0]), 0.0021, GLINT, head);
  }

  // Small translucent pectoral fins on each side of the neck.
  for (const s of [1, -1]) {
    b.membrane(
      [
        [s * 0.0185, 0.178, 0.004],
        [s * 0.0196, 0.192, 0.0],
      ],
      [
        [s * 0.037, 0.171, -0.008],
        [s * 0.04, 0.189, -0.006],
      ],
      { color: FIN },
    );
  }

  // Fluttering dorsal fin: a wavy membrane with a gold rim and fin rays.
  const finRoot: V3[] = [
    [0, 0.125, -0.004],
    [0, 0.144, -0.005],
    [0, 0.163, -0.005],
    [0, 0.18, -0.004],
    [0, 0.191, -0.002],
  ];
  const finEdge: V3[] = [
    [-0.004, 0.117, -0.031],
    [0.006, 0.135, -0.047],
    [-0.006, 0.154, -0.055],
    [0.006, 0.171, -0.047],
    [-0.004, 0.186, -0.029],
  ];
  b.membrane(finRoot, finEdge, { color: FIN });
  b.sweep(finEdge, 0.0011, { color: FIN_EDGE });
  for (const i of [1, 2, 3]) {
    rod(finRoot[i], finEdge[i], 0.0007, 0.0007, FIN_EDGE);
  }

  // Tail: a chain that curls round the seagrass, with dark rings.
  b.sweep(tail, 0.0078, { color: YELLOW });
  ball(coilAt(1), 0.0078, YELLOW);
  for (const s of [0.14, 0.25, 0.36, 0.47, 0.58, 0.69, 0.8, 0.91]) {
    disc(coilAt(s), tangentOf(coilAt, s), 0.0091, 0.0022, INK);
  }

  // Seagrass scene ------------------------------------------------------
  b.sweep(sampleCurve(GRASS_MAIN, 16), 0.0068, { color: GRASS });
  b.sweep(
    sampleCurve(
      [
        [0.055, 0, -0.052],
        [0.056, 0.1, -0.056],
        [0.064, 0.2, -0.055],
        [0.062, 0.255, -0.05],
      ],
      10,
    ),
    0.0054,
    { color: GRASS_LT },
  );
  b.sweep(
    sampleCurve(
      [
        [-0.05, 0, -0.07],
        [-0.052, 0.08, -0.072],
        [-0.056, 0.16, -0.068],
      ],
      8,
    ),
    0.0048,
    { color: GRASS_DK },
  );

  // Sand mound and pebbles at the grass root, sitting on the floor.
  place(new THREE.CylinderGeometry(0.052, 0.062, 0.012, 14, 1), SAND, [0, 0.004, ZC], [0, 1, 0], hips);
  place(new THREE.DodecahedronGeometry(0.011, 0), PEBBLE, [0.042, 0.007, -0.02]);
  place(new THREE.IcosahedronGeometry(0.008, 0), PEBBLE, [-0.03, 0.005, -0.055]);

  return b.root;
}
