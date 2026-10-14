import * as THREE from "three";
import { createBuilder, gradient, grain, mottle, noise, paint } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan",
  description: "A keel-billed toucan with a rainbow beak on a mossy branch beside a pink orchid.",
};

const LIME = "#9be51a";
const SKY = "#3fc4f2";
const ORANGE = "#ff8a1c";
const RED = "#d8122e";
const BLACK = "#121217";
const LEMON = "#ffe21a";
const SCARLET = "#e0182d";
const EYE_RING = "#a6e22e";
const LEG_BLUE = "#2a9fe0";

const HEAD = new THREE.Vector3(0, 0.43, 0.15);
const EYES = [new THREE.Vector3(0.0475, 0.443, 0.2066), new THREE.Vector3(-0.0475, 0.443, 0.2066)];

// Beak: colour bands along its length, from the head to the cherry-red tip.
const beakPaint = paint((p) => (p.z < 0.2 ? LIME : p.z < 0.25 ? SKY : p.z < 0.29 ? ORANGE : RED));

// Head: black, with a lime skin ring round each eye.
const headPaint = paint((p) => {
  const d = Math.min(...EYES.map((e) => p.distanceTo(e)));
  if (d < 0.0045) return "#0b0b0b";
  if (d < 0.0085) return "#f1ecd8";
  if (d < 0.0215) return EYE_RING;
  return BLACK;
});

// Body: glossy black, lemon bib on the throat and chest, scarlet under the tail.
const plumage = paint((p, n) => {
  if (p.z > 0.08 && n.z > 0.25 && p.y < 0.335 + 0.012 * (noise(p, 0.03, 3) - 0.5)) return LEMON;
  if (p.z < -0.12 && p.y < 0.25 && n.y < 0.2) return SCARLET;
  return BLACK;
});

// Moss and bark for the branch.
const moss = mottle("#3f7a24", "#7cb342", { size: 0.035, seed: 4 });
const bark = grain("#6e4c2f", "#45301d", { size: 0.012, axis: "x", seed: 2 });
const branchPaint = paint((p, n) => (n.y > 0.45 + 0.25 * (noise(p, 0.06, 9) - 0.5) ? moss : bark));

// One orchid petal: a four-cornered blade in the plane of x and y, `deg` round from +x.
function petalPoints(c: number[], deg: number, len: number, wid: number) {
  const a = (deg * Math.PI) / 180;
  const d = [Math.cos(a), Math.sin(a)];
  const q = [-d[1], d[0]];
  const at = (u: number, v: number) => [c[0] + d[0] * u + q[0] * v, c[1] + d[1] * u + q[1] * v, c[2]];
  return [at(0.002, 0), at(len * 0.45, wid), at(len, 0), at(len * 0.45, -wid)];
}

export default function toucan() {
  const b = createBuilder({ name: "keel-billed toucan", detail: 1, paintSize: 1024 });

  // Skeleton: root at the hips, spine chain up to the head, tail back, wings and legs out to each side.
  b.joint("root", { at: [0, 0.25, -0.16] });

  const spine = b.chain(
    "spine",
    [
      [0, 0.25, -0.16],
      [0, 0.28, 0.0],
      [0, 0.34, 0.1],
      [0, 0.42, 0.14],
    ],
    { parent: "root", names: ["spine1", "chest", "neck", "head"], role: "spine" },
  );

  b.joint("jaw", { parent: "head", at: [0, 0.4, 0.12], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });

  const tail = b.chain(
    "tail",
    [
      [0, 0.25, -0.16],
      [0, 0.22, -0.27],
      [0, 0.19, -0.37],
    ],
    { parent: "root", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Body and head.
  b.loft(
    [
      { at: [0, 0.24, -0.2], w: 0.08, h: 0.07 },
      { at: [0, 0.25, -0.08], w: 0.15, h: 0.16 },
      { at: [0, 0.29, 0.02], w: 0.2, h: 0.2 },
      { at: [0, 0.33, 0.1], w: 0.17, h: 0.17 },
      { at: [0, 0.38, 0.14], w: 0.12, h: 0.12 },
    ],
    { bone: spine, color: plumage, name: "body" },
  );

  b.part(new THREE.SphereGeometry(0.075, b.segments(16), b.segments(12)), headPaint, {
    at: HEAD,
    bone: "head",
    scale: [1, 1.05, 1.05],
    name: "head",
  });

  // Huge beak: upper half on the head, lower half on the jaw.
  b.loft(
    [
      { at: [0, 0.45, 0.1], w: 0.11, h: 0.1 },
      { at: [0, 0.45, 0.2], w: 0.12, h: 0.11 },
      { at: [0, 0.44, 0.28], w: 0.07, h: 0.07 },
      { at: [0, 0.425, 0.34], w: 0.02, h: 0.03 },
    ],
    { bone: "head", color: beakPaint, name: "beakUpper" },
  );
  b.loft(
    [
      { at: [0, 0.4, 0.12], w: 0.09, h: 0.06 },
      { at: [0, 0.39, 0.2], w: 0.1, h: 0.07 },
      { at: [0, 0.39, 0.27], w: 0.05, h: 0.04 },
      { at: [0, 0.385, 0.32], w: 0.015, h: 0.02 },
    ],
    { bone: "jaw", color: beakPaint, name: "beakLower" },
  );
  // The bird opens its bill a little to show off.
  b.pose("jaw", { axis: [1, 0, 0], deg: 8 });

  // Tail with a scarlet patch on its underside near the base.
  b.sweep(tail, (t) => 0.03 - 0.012 * t, {
    color: BLACK,
    name: "tail",
    sectors: [[130, 230, SCARLET, 0, 0.5]],
  });

  // Wings folded along the flanks, one chain and loft per side.
  const wingPts = [
    [0.08, 0.3, 0.05],
    [0.11, 0.27, -0.05],
    [0.12, 0.24, -0.16],
    [0.1, 0.21, -0.25],
  ];
  const wingW = [0.03, 0.035, 0.025, 0.012];
  const wingH = [0.1, 0.11, 0.08, 0.03];
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const mx = (p: number[]) => [side * p[0], p[1], p[2]];
    const wing = b.chain(
      `wing${s}`,
      wingPts.map(mx),
      { parent: "root", names: [1, 2, 3].map((i) => `wing${s}${i}`), role: "wing" },
    );
    b.loft(
      wingPts.map((p, i) => ({ at: mx(p), w: wingW[i], h: wingH[i] })),
      { bone: wing, color: BLACK, name: `wing.${s}` },
    );
  }

  // Blue legs and feet, gripping the branch.
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const x = side * 0.05;
    const ankle = `ankle${s}`;
    const leg = b.chain(
      `leg${s}`,
      [
        [x, 0.24, 0.0],
        [x, 0.16, 0.02],
        [x, 0.085, 0.03],
      ],
      { parent: "root", names: [`hip${s}`, `knee${s}`, ankle], role: "leg" },
    );
    b.sweep(leg, (t) => 0.012 - 0.003 * t, { color: LEG_BLUE, name: `leg.${s}` });

    const toe = (to: number[]) => b.capsule([x, 0.077, 0.03], to, 0.007, { color: LEG_BLUE, bone: ankle });
    toe([x + 0.02 * side, 0.077, 0.095]);
    toe([x - 0.012 * side, 0.077, 0.1]);
    toe([x + 0.01 * side, 0.077, -0.035]);
  }

  // The perch: a bent, mossy branch lying on the floor.
  b.sweep(
    [
      [-0.55, 0.035, -0.02],
      [-0.1, 0.035, -0.03],
      [0.3, 0.035, -0.01],
      [0.55, 0.035, -0.02],
    ],
    0.035,
    { bone: "root", color: branchPaint, sides: 10, name: "branch" },
  );
  for (const [x, z, r] of [
    [-0.3, -0.01, 0.035],
    [-0.12, -0.04, 0.028],
    [0.5, -0.02, 0.03],
  ]) {
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), moss, {
      at: [x, 0.068, z],
      bone: "root",
      scale: [1.5, 0.55, 1.2],
      name: "moss",
    });
  }

  // A single pink orchid on a stem beside the bird.
  b.sweep(
    [
      [0.34, 0.06, -0.02],
      [0.355, 0.17, -0.03],
      [0.335, 0.27, -0.015],
    ],
    0.008,
    { bone: "root", color: "#5f9e2f", name: "orchid stem" },
  );

  const C = [0.335, 0.285, -0.01];
  const petalPaint = gradient("#ffd1e8", "#ff3d9a", C, [C[0], C[1] + 0.05, C[2]]);
  const petals: Array<[number, number, number]> = [
    [90, 0.04, 0.02],
    [18, 0.036, 0.019],
    [-54, 0.034, 0.017],
    [234, 0.034, 0.017],
    [162, 0.036, 0.019],
  ];
  for (const [deg, len, wid] of petals) {
    b.slab(petalPoints(C, deg, len, wid), { color: petalPaint, thickness: 0.005, bone: "root", name: "petal" });
  }
  b.part(new THREE.SphereGeometry(0.012, b.segments(10), b.segments(8)), "#d81b7a", {
    at: [C[0], C[1] - 0.008, 0.0],
    bone: "root",
    scale: [1, 0.9, 0.6],
    name: "lip",
  });
  b.part(new THREE.SphereGeometry(0.006, b.segments(8), b.segments(6)), "#fff4fa", {
    at: [C[0], C[1], 0.004],
    bone: "root",
    name: "column",
  });

  return b.root;
}
