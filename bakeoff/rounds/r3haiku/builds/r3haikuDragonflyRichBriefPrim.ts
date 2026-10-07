import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "Hovering emperor dragonfly: electric-blue abdomen with black dorsal markings, apple-green thorax, turquoise wraparound eyes, four flat glassy wings with a fine golden-veined net, six tucked legs.",
};

type P = [number, number, number];

const lerpP = (a: P, b: P, t: number): P => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const mirrorX = (p: P): P => [-p[0], p[1], p[2]];

// Palette
const BLUE = "#1f6bff";
const BLACK = "#111418";
const GREEN = "#8cd65a";
const TURQ = "#2fd6c8";
const HEAD = "#1d3b2a";
const WING = "#dff1ff";
const GOLD = "#d8b65a";
const PTERO = "#3a2412";
const LEG = "#1a1a1a";
const GLINT = "#effffb";

// Hover height: the dragonfly flies, so it keeps its height above the pond.
const BODY_Y = 0.3;

// Abdomen centreline: runs back from the thorax (-Z), slight droop at the tip.
const abdP = (t: number): P => [0, 0.304 - 0.006 * t, -0.012 - 0.08 * t];

// Forewing edges (right-hand side, +X), mirrored for the other side.
const foreLE = (t: number): P => [
  0.007 + 0.054 * t,
  0.318 + 0.007 * t + 0.003 * Math.sin(Math.PI * t),
  0.014 - 0.01 * t,
];
const foreTE = (t: number): P => [
  0.007 + 0.046 * t,
  0.317 + 0.005 * t,
  -0.002 - 0.008 * t,
];

// Hindwing edges: rounder, set further back.
const hindLE = (t: number): P => [
  0.007 + 0.05 * t,
  0.315 + 0.006 * t + 0.002 * Math.sin(Math.PI * t),
  -0.004 - 0.012 * t,
];
const hindTE = (t: number): P => [
  0.007 + 0.042 * t,
  0.314 + 0.004 * t,
  -0.016 - 0.014 * t,
];

const sample = (f: (t: number) => P, n: number): P[] =>
  Array.from({ length: n }, (_, i) => f(i / (n - 1)));

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });
  const rand = rng(11);

  // ---- Skeleton -----------------------------------------------------------
  const body = b.joint("body", { at: [0, BODY_Y, 0] });
  const thorax = b.joint("thorax", { at: [0, 0.305, 0], parent: body });
  const head = b.joint("head", { at: [0, 0.31, 0.03], parent: body });

  // Abdomen: a slim chain running back from the thorax.
  const abdPts = sample(abdP, 7);
  const abdomen = b.chain("abdomen", abdPts, { role: "tail", parent: thorax });

  // Wings: each a short chain (root, mid, tip) along its leading edge.
  const wingPath = (f: (t: number) => P, side: number): P[] => {
    const pts = [f(0), f(0.5), f(1)];
    return side > 0 ? pts : pts.map(mirrorX);
  };
  b.chain("wingL_fore", wingPath(foreLE, 1), { role: "wing", parent: thorax });
  b.chain("wingR_fore", wingPath(foreLE, -1), { role: "wing", parent: thorax });
  b.chain("wingL_hind", wingPath(hindLE, 1), { role: "wing", parent: thorax });
  b.chain("wingR_hind", wingPath(hindLE, -1), { role: "wing", parent: thorax });

  // Legs: three per side, tucked under the thorax, each a 3-joint chain.
  const legZ = [0.012, 0.0, -0.012];
  const legPaths: { name: string; pts: P[] }[] = [];
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    legZ.forEach((z, j) => {
      const pts: P[] = [
        [s * 0.005, 0.302, z],
        [s * 0.024, 0.286, z + 0.004],
        [s * 0.008, 0.268, z + 0.012],
      ];
      const name = `leg${side}${j}`;
      b.chain(name, pts, { role: "leg", parent: thorax });
      legPaths.push({ name, pts });
    });
  }

  // ---- Thorax and head ----------------------------------------------------
  const thoraxGeo = new THREE.SphereGeometry(0.0115, 14, 10);
  thoraxGeo.scale(0.9, 1.0, 1.6);
  b.part(thoraxGeo, GREEN, { at: [0, 0.305, 0], bone: thorax });

  // Two dark shoulder stripes on the thorax.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.0028, 0.0015, 0.012), BLACK, {
      at: [s * 0.0035, 0.3165, 0.002],
      bone: thorax,
    });
  }

  // Head: small dark core between the eyes.
  b.part(new THREE.SphereGeometry(0.0065, 12, 9), HEAD, {
    at: [0, 0.31, 0.03],
    bone: head,
  });

  // Huge wraparound turquoise eyes, meeting at the top of the head.
  for (const s of [1, -1]) {
    const eyeGeo = new THREE.SphereGeometry(0.0095, 16, 12);
    eyeGeo.scale(0.82, 1.1, 1.25);
    b.part(eyeGeo, TURQ, { at: [s * 0.0074, 0.312, 0.03], bone: head });

    // Small glint on each eye.
    b.part(new THREE.SphereGeometry(0.0016, 6, 5), GLINT, {
      at: [s * 0.0105, 0.318, 0.04],
      bone: head,
    });
  }

  // ---- Abdomen ------------------------------------------------------------
  b.sweep(abdomen, 0.0032, { color: BLUE });

  // Black dorsal markings along the abdomen, heavier toward the tip.
  const markT = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.94];
  markT.forEach((t, i) => {
    const c = abdP(t);
    const wide = i >= 4 ? 0.0052 : 0.0042;
    b.part(new THREE.BoxGeometry(wide, 0.0011, 0.0068), BLACK, {
      at: [c[0], c[1] + 0.0031, c[2]],
      bone: abdomen,
    });
  });
  // Dark band down the sides of the last segments.
  for (const s of [1, -1]) {
    const c = abdP(0.9);
    b.part(new THREE.BoxGeometry(0.0012, 0.0036, 0.016), BLACK, {
      at: [s * 0.0031, c[1], c[2]],
      bone: abdomen,
    });
  }

  // Anal appendages (cerci) at the tip.
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.001, 0.298, -0.09],
        [s * 0.003, 0.297, -0.1],
      ],
      0.0008,
      { color: BLACK },
    );
  }

  // ---- Wings --------------------------------------------------------------
  const SAMPLES = 9;
  const vein = 0.00025;

  const buildWing = (
    LE: (t: number) => P,
    TE: (t: number) => P,
    side: number,
    isFore: boolean,
  ) => {
    const m = (p: P): P => (side > 0 ? p : mirrorX(p));
    const leSamples = sample(LE, SAMPLES).map(m);
    const teSamples = sample(TE, SAMPLES).map(m);

    // Glassy membrane between leading and trailing edges.
    b.membrane(leSamples, teSamples, { color: WING });

    // Longitudinal golden veins across the wing.
    for (const f of [0.3, 0.68]) {
      const line: P[] = [];
      for (let i = 0; i < SAMPLES; i++) {
        const t = i / (SAMPLES - 1);
        line.push(lerpP(LE(t), TE(t), f).map((v, k) => v) as P);
      }
      b.sweep(line.map(m), vein * 1.6, { color: GOLD });
    }

    // Fine cross-vein net, with a little jitter for an organic feel.
    for (let i = 0; i < 12; i++) {
      const t = 0.08 + (i / 11) * 0.87 + (rand() - 0.5) * 0.012;
      const a = m(LE(t));
      const c = m(TE(t));
      b.sweep([a, c], vein, { color: GOLD });
    }

    // Pterostigma: a dark tab on the leading edge near the tip of the forewing.
    if (isFore) {
      const a = LE(0.84);
      const c = TE(0.84);
      const mid = lerpP(a, c, 0.2);
      b.part(new THREE.BoxGeometry(0.0046, 0.0009, 0.0018), PTERO, {
        at: m([mid[0], mid[1] + 0.0004, mid[2]]),
        bone: undefined,
      });
    }
  };

  buildWing(foreLE, foreTE, 1, true);
  buildWing(foreLE, foreTE, -1, true);
  buildWing(hindLE, hindTE, 1, false);
  buildWing(hindLE, hindTE, -1, false);

  // ---- Legs ---------------------------------------------------------------
  for (const leg of legPaths) {
    b.sweep(leg.pts, 0.0008, { color: LEG });
  }

  return b.root;
}
