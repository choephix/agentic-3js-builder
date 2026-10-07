```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "dragonfly",
  description:
    "Stylised dragonfly at rest: teal compound eyes, emerald thorax with black stripes, segmented cobalt abdomen with yellow claspers, four veined wings held out flat and six spiny legs.",
};

type Builder = ReturnType<typeof createBuilder>;
type Bone = ReturnType<Builder["joint"]>;
type V = [number, number, number];
type Poly = [number, number][];
type Vein = { pts: Poly; r: number };
type WingSpec = {
  name: string;
  z: number;
  yaw: number;
  outline: Poly;
  veins: Vein[];
  cross: [number, number, number[]][];
  ptero?: boolean;
};

const C = {
  eye: "#1fb5c4",
  eyeDot: "#0b3c5d",
  head: "#1d2a2e",
  face: "#d8ec7e",
  jaw: "#a9cf4e",
  thorax: "#2fa35a",
  stripe: "#14181c",
  wing: "#d4eee8",
  vein: "#2b4f5a",
  ptero: "#d9822b",
  leg: "#2c2f36",
  cobalt: "#1f5fd6",
  navy: "#0f1a33",
  tail: "#19b394",
  ring: "#0c1220",
  clasper: "#f0b72e",
};

const WING_T = 0.0004; // wing skin thickness
const WING_Y = 0.035; // wing plane height, level with the top of the thorax
const ABD_R = [0.005, 0.006, 0.0056, 0.0046, 0.004, 0.0037, 0.0035, 0.0034, 0.0036, 0.004, 0.0045];

// Wing outlines in (span, chord): span runs along +X, chord +Z is the leading edge.
const FORE_OUT: Poly = [
  [0, 0.0035], [0.01, 0.006], [0.024, 0.0068], [0.038, 0.006],
  [0.048, 0.004], [0.051, 0.0012], [0.046, -0.0025], [0.034, -0.004],
  [0.018, -0.0038], [0.006, -0.0022], [0, -0.0012],
];
const HIND_OUT: Poly = [
  [0, 0.0045], [0.01, 0.0105], [0.024, 0.0125], [0.036, 0.0112],
  [0.045, 0.0072], [0.047, 0.003], [0.043, -0.0025], [0.032, -0.0068],
  [0.018, -0.0062], [0.006, -0.0036], [0, -0.002],
];

const FORE_SPEC: WingSpec = {
  name: "wingF",
  z: 0.005,
  yaw: 0.18,
  outline: FORE_OUT,
  veins: [
    { pts: [[0, 0.003], [0.024, 0.006], [0.046, 0.0042]], r: 0.00042 },
    { pts: [[0, 0.0004], [0.024, 0.0036], [0.04, 0.0024]], r: 0.00028 },
    { pts: [[0, -0.001], [0.024, 0.001], [0.04, -0.0004]], r: 0.00024 },
    { pts: [[0, -0.0018], [0.024, -0.0018], [0.038, -0.0032]], r: 0.00024 },
  ],
  cross: [
    [0, 1, [0.008, 0.016, 0.03, 0.038]],
    [1, 2, [0.012, 0.026]],
    [2, 3, [0.012, 0.028]],
  ],
  ptero: true,
};

const HIND_SPEC: WingSpec = {
  name: "wingH",
  z: -0.0055,
  yaw: -0.12,
  outline: HIND_OUT,
  veins: [
    { pts: [[0, 0.004], [0.024, 0.011], [0.043, 0.0066]], r: 0.00042 },
    { pts: [[0, 0.0008], [0.024, 0.0052], [0.042, 0.003]], r: 0.00028 },
    { pts: [[0, -0.001], [0.024, 0.002], [0.04, -0.003]], r: 0.00024 },
    { pts: [[0, -0.002], [0.024, -0.003], [0.036, -0.004]], r: 0.00024 },
    { pts: [[0, -0.003], [0.02, -0.0052], [0.032, -0.006]], r: 0.0002 },
  ],
  cross: [
    [0, 1, [0.008, 0.016, 0.028, 0.036]],
    [1, 2, [0.01, 0.022, 0.034]],
    [2, 3, [0.012, 0.026]],
    [3, 4, [0.014, 0.026]],
  ],
};

const dist = (a: V, c: V) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

// chord position of a vein polyline at span x
function zAt(pts: Poly, x: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    if (x <= x1) return z0 + ((z1 - z0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
}

// a point in wing-local (span, chord) turned by the wing's yaw, in model space
function wingPoint(root: V, s: number, yaw: number, x: number, z: number): V {
  const th = -s * yaw;
  const lx = s * x;
  return [
    root[0] + lx * Math.cos(th) + z * Math.sin(th),
    root[1],
    root[2] - lx * Math.sin(th) + z * Math.cos(th),
  ];
}

// flat wing skin with its root at the origin; the left wing spans +X, the right wing -X
function wingGeometry(outline: Poly, s: number, yaw: number) {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(s * x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: WING_T, bevelEnabled: false });
  g.translate(0, 0, -WING_T / 2);
  g.rotateX(-Math.PI / 2); // chord goes to Z, thickness to Y
  g.rotateY(-s * yaw);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // every piece is a primitive on an explicit bone
  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: Bone, n = 8) => {
    b.part(new THREE.CylinderGeometry(r1, r0, dist(a, c), n), color, { at: mid(a, c), aim: c, bone });
  };
  const spike = (base: V, tip: V, r: number, color: string, bone: Bone) => {
    b.part(new THREE.ConeGeometry(r, dist(base, tip), 6), color, { at: mid(base, tip), aim: tip, bone });
  };
  const blob = (at: V, r: V, color: string, bone: Bone, w = 12, h = 8, rotZ = 0) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(r[0], r[1], r[2]);
    if (rotZ) g.rotateZ(rotZ);
    b.part(g, color, { at, bone });
  };

  // ---- skeleton: thorax root, head and jaw, legs, wings, abdomen
  const thorax = b.joint("thorax", { at: [0, 0.027, 0.0005] });
  const head = b.joint("head", { at: [0, 0.029, 0.029], parent: thorax });
  const jaw = b.joint("jaw", { at: [0, 0.02, 0.037], parent: head });

  // ---- head: big compound eyes, dark nape, pale face
  blob([0, 0.0292, 0.0295], [0.0085, 0.0095, 0.0085], C.head, head);
  blob([0, 0.029, 0.019], [0.0045, 0.005, 0.004], C.head, head, 10, 8);
  for (const s of [1, -1]) {
    const eyeC: V = [s * 0.007, 0.0305, 0.0325];
    blob(eyeC, [0.0105, 0.0105, 0.0105], C.eye, head, 14, 10);
    // facet dots over the front of each eye
    for (const el of [-45, -15, 15, 45]) {
      for (const az of [-20, 10, 40, 70]) {
        const e = (el * Math.PI) / 180;
        const a = (az * Math.PI) / 180;
        const d: V = [s * Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
        b.part(new THREE.SphereGeometry(0.0013, 5, 4), C.eyeDot, {
          at: [eyeC[0] + 0.0105 * d[0], eyeC[1] + 0.0105 * d[1], eyeC[2] + 0.0105 * d[2]],
          bone: head,
        });
      }
    }
  }
  blob([0, 0.0237, 0.0385], [0.006, 0.0058, 0.0042], C.face, head, 10, 8);
  blob([0, 0.0196, 0.0385], [0.0068, 0.003, 0.0058], C.jaw, jaw, 10, 6);

  // ---- thorax: emerald body with two black stripes a side
  blob([0, 0.027, 0.0005], [0.009, 0.0105, 0.013], C.thorax, thorax, 14, 10);
  for (const s of [1, -1]) {
    blob([s * 0.0088, 0.0272, 0.006], [0.002, 0.008, 0.0024], C.stripe, thorax, 8, 6, -s * 0.3);
    blob([s * 0.0088, 0.0268, -0.003], [0.0018, 0.007, 0.0022], C.stripe, thorax, 8, 6, -s * 0.3);
  }

  // ---- six spiny legs: hip, knee, foot on each side, feet on the floor
  const legs: { k: string; hip: V; knee: V; foot: V }[] = [
    { k: "F", hip: [0.006, 0.017, 0.011], knee: [0.0165, 0.008, 0.015], foot: [0.0235, 0, 0.02] },
    { k: "M", hip: [0.006, 0.017, 0.001], knee: [0.018, 0.008, 0.002], foot: [0.025, 0, 0.003] },
    { k: "H", hip: [0.006, 0.017, -0.0085], knee: [0.018, 0.008, -0.0075], foot: [0.024, 0, -0.012] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const mir = (p: V): V => [s * p[0], p[1], p[2]];
    for (const leg of legs) {
      const hip = b.joint(`hip${leg.k}${side}`, { at: mir(leg.hip), parent: thorax });
      const knee = b.joint(`knee${leg.k}${side}`, { at: mir(leg.knee), parent: hip });
      b.joint(`foot${leg.k}${side}`, { at: mir(leg.foot), parent: knee });
      seg(mir(leg.hip), mir(leg.knee), 0.0008, 0.0007, C.leg, hip, 6);
      seg(mir(leg.knee), mir(leg.foot), 0.0006, 0.0004, C.leg, knee, 6);
      const m = mid(mir(leg.knee), mir(leg.foot));
      spike(m, [m[0] + s * 0.0016, m[1] - 0.0005, m[2] - 0.0006], 0.0005, C.leg, knee);
    }
  }

  // ---- four wings held flat, with veins and a rust pterostigma
  const wing = (s: number, spec: WingSpec) => {
    const root: V = [s * 0.0045, WING_Y, spec.z];
    const joint = b.joint(`${spec.name}${s > 0 ? "L" : "R"}`, { at: root, parent: thorax });
    const P = (x: number, z: number) => wingPoint(root, s, spec.yaw, x, z);
    b.part(wingGeometry(spec.outline, s, spec.yaw), C.wing, { at: root, bone: joint });
    for (const v of spec.veins) {
      for (let i = 0; i < v.pts.length - 1; i++) {
        const [x0, z0] = v.pts[i];
        const [x1, z1] = v.pts[i + 1];
        seg(P(x0, z0), P(x1, z1), v.r, v.r, C.vein, joint, 5);
      }
    }
    for (const [i, j, xs] of spec.cross) {
      for (const x of xs) {
        seg(
          P(x, zAt(spec.veins[i].pts, x)),
          P(x, zAt(spec.veins[j].pts, x)),
          0.00016,
          0.00016,
          C.vein,
          joint,
          4,
        );
      }
    }
    if (spec.ptero) {
      const g = new THREE.BoxGeometry(0.0055, 0.0006, 0.0014);
      g.rotateY(-s * spec.yaw);
      b.part(g, C.ptero, { at: P(0.042, 0.0045), bone: joint });
    }
  };
  for (const s of [1, -1]) {
    wing(s, FORE_SPEC);
    wing(s, HIND_SPEC);
  }

  // ---- abdomen: ten segment joints, cobalt and navy bands, tail segments in teal
  const abdP: V[] = [];
  for (let i = 0; i <= 10; i++) abdP.push([0, 0.025 - i * 0.00035, -0.011 - i * 0.006]);
  const abd: Bone[] = [];
  let parent: Bone = thorax;
  for (let i = 0; i < 10; i++) {
    const j = b.joint(`abd${i + 1}`, { at: abdP[i], parent });
    abd.push(j);
    parent = j;
  }
  const tailTip = b.joint("tailTip", { at: abdP[10], parent });
  for (let i = 0; i < 10; i++) {
    const color = i >= 8 ? C.tail : i % 2 === 0 ? C.cobalt : C.navy;
    seg(abdP[i], abdP[i + 1], ABD_R[i], ABD_R[i + 1], color, abd[i], 10);
  }
  for (let i = 1; i < 10; i++) {
    b.part(new THREE.TorusGeometry(ABD_R[i], 0.00045, 6, 12), C.ring, { at: abdP[i], bone: abd[i] });
  }

  // ---- yellow claspers at the tip
  const T = abdP[10];
  for (const s of [1, -1]) {
    spike(
      [s * 0.0014, T[1] - 0.0004, T[2] + 0.0002],
      [s * 0.0042, T[1] - 0.0016, T[2] - 0.008],
      0.0012,
      C.clasper,
      tailTip,
    );
  }
  spike([0, T[1], T[2]], [0, T[1] - 0.001, T[2] - 0.005], 0.0008, C.clasper, tailTip);

  return b.root;
}
```