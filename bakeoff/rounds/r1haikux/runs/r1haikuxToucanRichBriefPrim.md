```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "A glossy black keel-billed toucan with a huge lime, sky, orange and cherry-red beak, bright blue feet, a lemon bib and a scarlet under-tail, perched on a mossy branch beside one pink orchid.",
};

type V = [number, number, number];
type Piece = { geo: THREE.BufferGeometry; at: V };

// Flat colours (one material each)
const INK = "#15121c";
const SHEEN = "#263a63";
const LIME = "#9ad93a";
const SKY = "#4cb8f0";
const ORANGE = "#f7892b";
const RED = "#d8202a";
const LEMON = "#ffd92b";
const BLUE = "#2288ee";
const CLAW = "#2a2a30";
const IRIS = "#2b160b";
const NOSTRIL = "#0c0b0e";
const BARK = "#6e4a2c";
const BARK_DK = "#4a3019";
const MOSS = "#64a63c";
const MOSS_DK = "#3b7a2a";
const LEAF = "#4fa23f";
const LEAF_DK = "#2f7430";
const STEM = "#5f9d4a";
const PINK = "#f472b6";
const PINK_DK = "#d9428f";
const PINK_LT = "#ffb3dc";
const LIP = "#b82a79";
const CENTRE = "#ffe066";

const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const SIDE = new THREE.Vector3(1, 0, 0);

const vec = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
const mix = (a: number, c: number, t: number) => a + (c - a) * t;
const frac = (x: number) => x - Math.floor(x);

// Quaternion turning the geometry's `base` axis onto the unit vector `dir`.
function turn(base: THREE.Vector3, dir: THREE.Vector3) {
  const q = new THREE.Quaternion();
  const axis = new THREE.Vector3().crossVectors(base, dir);
  const s = axis.length();
  const c = THREE.MathUtils.clamp(base.dot(dir), -1, 1);
  if (s > 1e-6) q.setFromAxisAngle(axis.multiplyScalar(1 / s), Math.atan2(s, c));
  else if (c < 0) q.setFromAxisAngle(SIDE, Math.PI);
  return q;
}

// Length, turn and midpoint of a span from a to c, with `base` as the geometry's long axis.
function span(a: V, c: V, base: THREE.Vector3 = UP) {
  const d = vec(c).sub(vec(a));
  const len = d.length();
  const q = turn(base, d.multiplyScalar(1 / len));
  const mid: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  return { len, q, mid };
}

// Point a further distance k beyond c, along a -> c.
const extend = (a: V, c: V, k: number): V => {
  const d = vec(c).sub(vec(a)).setLength(k);
  return [c[0] + d.x, c[1] + d.y, c[2] + d.z];
};

// Ellipsoid centred on the origin.
function ell(rx: number, ry: number, rz: number, seg = 12) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(rx, ry, rz);
  return g;
}

const blob = (at: V, rx: number, ry: number, rz: number, seg = 12): Piece => ({
  geo: ell(rx, ry, rz, seg),
  at,
});

// Rounded tube from a to c.
function capsule(a: V, c: V, r: number): Piece {
  const s = span(a, c);
  const g = new THREE.CapsuleGeometry(r, Math.max(s.len - 2 * r, 0.002), 3, 8);
  g.applyQuaternion(s.q);
  return { geo: g, at: s.mid };
}

// Flat slab from a to c: width on x, thickness on y.
function slab(a: V, c: V, w: number, t: number): Piece {
  const s = span(a, c, FWD);
  const g = new THREE.BoxGeometry(w, t, s.len);
  g.applyQuaternion(s.q);
  return { geo: g, at: s.mid };
}

// Thin ellipsoid with its long axis from a to c (leaves).
function blade(a: V, c: V, w: number, t: number): Piece {
  const s = span(a, c);
  const g = ell(w, s.len / 2, t, 10);
  g.applyQuaternion(s.q);
  return { geo: g, at: s.mid };
}

// A point on the top of the perch (branch radius 0.05, centred at y = 0.05), a touch sunk in.
const onPerch = (x: number, z: number): V => [
  x,
  0.05 + Math.sqrt(Math.max(0, 0.0025 - x * x)) + 0.006,
  z,
];

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });
  type Bone = ReturnType<typeof b.joint>;
  const put = (p: Piece, color: string, bone: Bone) =>
    b.part(p.geo, color, { at: p.at, bone });

  // ---- skeleton: a static root for the scenery, then the bird on top of it
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { at: [0, 0.36, -0.02], parent: root });
  const chest = b.joint("chest", { at: [0, 0.43, 0.07], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.49, 0.15], parent: chest });
  const head = b.joint("head", { at: [0, 0.53, 0.19], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.515, 0.2], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.35, -0.13], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.31, -0.25], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.27, -0.37], parent: tail2 });
  const wingL = b.joint("wingL", { at: [0.1, 0.42, -0.02], parent: chest });
  const wingR = b.joint("wingR", { at: [-0.1, 0.42, -0.02], parent: chest });

  // ---- body, plumage and head (glossy black, blue sheen across the back)
  put(blob([0, 0.38, 0], 0.12, 0.115, 0.165), INK, hips);
  const body = b.parts?.length ? undefined : undefined; // placeholder removed below
  return finish(b, {
    root,
    hips,
    chest,
    neck,
    head,
    jaw,
    tail1,
    tail2,
    tail3,
    wingL,
    wingR,
    put,
  });
}

function finish(
  b: ReturnType<typeof createBuilder>,
  k: {
    root: ReturnType<typeof b.joint>;
    hips: ReturnType<typeof b.joint>;
    chest: ReturnType<typeof b.joint>;
    neck: ReturnType<typeof b.joint>;
    head: ReturnType<typeof b.joint>;
    jaw: ReturnType<typeof b.joint>;
    tail1: ReturnType<typeof b.joint>;
    tail2: ReturnType<typeof b.joint>;
    tail3: ReturnType<typeof b.joint>;
    wingL: ReturnType<typeof b.joint>;
    wingR: ReturnType<typeof b.joint>;
    put: (
      p: Piece,
      color: string,
      bone: ReturnType<typeof b.joint>,
    ) => ReturnType<typeof b.part>;
  },
) {
  const { root, hips, chest, neck, head, jaw, tail1, tail2, tail3, wingL, wingR, put } = k;

  const bodyPart = put(blob([0, 0.38, 0], 0.12, 0.115, 0.165), INK, hips);
  put(blob([0, 0.42, 0.09], 0.105, 0.105, 0.09), INK, chest);
  const neckPart = put(blob([0, 0.48, 0.14], 0.085, 0.09, 0.085), INK, neck);
  const skull = put(blob([0, 0.53, 0.19], 0.085, 0.085, 0.09, 14), INK, head);
  put(blob([0, 0.475, -0.06], 0.07, 0.02, 0.1, 10), SHEEN, hips);

  // ---- wings folded along the flanks, with blue-sheen primary tips
  for (const [s, j] of [
    [1, wingL],
    [-1, wingR],
  ] as const) {
    put(blob([0.105 * s, 0.39, -0.05], 0.028, 0.08, 0.17), INK, j);
    put(blob([0.1 * s, 0.355, -0.2], 0.02, 0.028, 0.07), SHEEN, j);
  }

  // ---- tail: three flat boards on the tail joints
  put(slab([0, 0.35, -0.12], [0, 0.31, -0.25], 0.09, 0.012), INK, tail1);
  put(slab([0, 0.31, -0.25], [0, 0.27, -0.37], 0.1, 0.012), INK, tail2);
  put(slab([0, 0.27, -0.37], [0, 0.25, -0.45], 0.11, 0.01), SHEEN, tail3);

  // ---- legs and blue feet gripping the branch
  for (const [s, n] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = 0.035 * s;
    const hip = b.joint(`hip${n}`, { at: [x, 0.34, -0.02], parent: hips });
    const knee = b.joint(`knee${n}`, { at: [x + 0.005 * s, 0.22, 0.03], parent: hip });
    const ankle = b.joint(`ankle${n}`, { at: [x, 0.14, 0.03], parent: knee });
    const heel = onPerch(x, 0.03);

    put(capsule([x, 0.34, -0.02], [x + 0.005 * s, 0.22, 0.03], 0.03), INK, hip);
    put(capsule([x + 0.005 * s, 0.22, 0.03], [x, 0.14, 0.03], 0.012), BLUE, knee);
    put(capsule([x, 0.14, 0.03], heel, 0.01), BLUE, ankle);
    for (const [tx, tz] of [
      [0.016, 0.1],
      [-0.01, 0.09],
      [0.012, -0.035],
      [-0.006, -0.03],
    ] as const) {
      const toe = onPerch(x + tx * s, tz);
      put(capsule(heel, toe, 0.008), BLUE, ankle);
      put(capsule(toe, extend(heel, toe, 0.014), 0.005), CLAW, ankle);
    }
  }

  // ---- beak: drooping ellipsoids banded lime, sky, orange and cherry red
  const UPPER = 10;
  const upper: ReturnType<typeof put>[] = [];
  for (let i = 0; i < UPPER; i++) {
    const t = (i + 0.5) / UPPER;
    const g = ell(mix(0.068, 0.016, t ** 0.85), mix(0.072, 0.02, t ** 0.8), 0.042, 14);
    g.rotateX(Math.atan2(0.045 + 0.07 * t, 0.4));
    const color = t < 0.3 ? LIME : t < 0.5 ? SKY : t < 0.78 ? ORANGE : RED;
    const at: V = [0, 0.565 - 0.045 * t - 0.035 * t * t, mix(0.2, 0.6, t)];
    upper.push(b.part(g, color, { at, bone: head }));
  }

  const LOWER = 7;
  for (let i = 0; i < LOWER; i++) {
    const t = (i + 0.5) / LOWER;
    const g = ell(mix(0.05, 0.012, t ** 0.8), mix(0.04, 0.012, t ** 0.8), 0.036, 14);
    g.rotateX(Math.atan2(0.075 + 0.04 * t, 0.32));
    const color = t < 0.35 ? LIME : t < 0.7 ? SKY : t < 0.85 ? ORANGE : RED;
    const at: V = [0, 0.53 - 0.075 * t - 0.02 * t * t, mix(0.2, 0.52, t)];
    b.part(g, color, { at, bone: jaw });
  }

  // nostrils on the top of the beak base
  const beakTop = b.surface(upper[0]);
  for (const s of [1, -1]) {
    b.stick(ell(0.011, 0.005, 0.008, 8), NOSTRIL, beakTop.nearest([0.022 * s, 0.66, 0.245]));
  }

  // ---- face: lime skin ring around a dark eye, on each side of the head
  const skullTop = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullTop.nearest([0.09 * s, 0.545, 0.13]);
    const ring = new THREE.TorusGeometry(0.03, 0.011, 6, 14);
    ring.rotateX(Math.PI / 2);
    b.stick(ell(0.02, 0.02, 0.02, 8), IRIS, hit);
    b.stick(ring, LIME, hit);
  }

  // ---- lemon bib under the beak, and the scarlet under-tail patch
  b.stick(ell(0.08, 0.016, 0.075), LEMON, b.surface(neckPart).nearest([0, 0.44, 0.22]));
  b.stick(ell(0.05, 0.012, 0.034), RED, b.surface(bodyPart).nearest([0, 0.27, -0.13]));

  // ---- the perch: a short mossy branch lying on the ground (static, on root)
  const bs = span([0, 0.05, -0.42], [0, 0.05, 0.42]);
  const branchGeo = new THREE.CylinderGeometry(0.05, 0.05, bs.len, 12, 1);
  branchGeo.applyQuaternion(bs.q);
  const branch = b.part(branchGeo, BARK, { at: bs.mid, bone: root });
  put(capsule([0.03, 0.07, -0.26], [0.13, 0.1, -0.31], 0.02), BARK_DK, root);
  put(capsule([-0.03, 0.06, 0.3], [-0.12, 0.1, 0.34], 0.018), BARK_DK, root);

  // moss scattered over the top of the branch (golden-ratio spacing, so it is repeatable)
  const branchTop = b.surface(branch);
  for (let i = 0; i < 24; i++) {
    const z = -0.38 + 0.76 * frac(i * 0.618034);
    const a = -1.1 + 2.2 * frac(i * 0.381966 + 0.2);
    const p: V = [Math.sin(a) * 0.09, 0.05 + Math.cos(a) * 0.09, z];
    const g = ell(0.03 + 0.01 * (i % 3), 0.012, 0.026 + 0.008 * ((i + 1) % 2), 8);
    b.stick(g, i % 3 === 0 ? MOSS_DK : MOSS, branchTop.nearest(p));
  }

  // mossy ground pad under the branch, with a few tufts
  const pad = put(blob([0, 0.012, 0], 0.2, 0.02, 0.5, 10), MOSS_DK, root);
  const padTop = b.surface(pad);
  for (let i = 0; i < 12; i++) {
    const x = (frac(i * 0.618034 + 0.3) - 0.5) * 0.34;
    const z = (frac(i * 0.381966 + 0.7) - 0.5) * 0.8;
    b.stick(ell(0.022, 0.01, 0.02, 8), MOSS, padTop.nearest([x, 0.2, z]));
  }

  // ---- one pink orchid rooted on the branch's flank, beside the toucan
  const stemPts: V[] = [
    [-0.045, 0.065, -0.12],
    [-0.1, 0.1, -0.13],
    [-0.125, 0.22, -0.135],
    [-0.12, 0.35, -0.13],
  ];
  for (let i = 0; i < 3; i++) {
    put(capsule(stemPts[i], stemPts[i + 1], 0.0075), STEM, root);
  }
  put(blade([-0.05, 0.07, -0.1], [-0.17, 0.08, -0.16], 0.024, 0.004), LEAF, root);
  put(blade([-0.05, 0.06, -0.16], [-0.15, 0.09, -0.24], 0.02, 0.004), LEAF_DK, root);
  put(capsule([-0.125, 0.22, -0.135], [-0.14, 0.27, -0.15], 0.005), STEM, root);
  put(blob([-0.142, 0.28, -0.155], 0.011, 0.016, 0.011, 8), PINK, root);

  // flower head: sepals and petals fan around the centre, facing the front (+Z)
  const flower: V = stemPts[3];
  const petal = (angle: number, len: number, w: number, color: string) => {
    const g = ell(w, len, 0.008, 10);
    g.translate(0, len, 0);
    g.rotateZ(angle);
    b.part(g, color, { at: flower, bone: root });
  };
  petal(0, 0.05, 0.02, PINK_DK);
  petal(2.1, 0.046, 0.019, PINK_DK);
  petal(-2.1, 0.046, 0.019, PINK_DK);
  petal(1.45, 0.04, 0.032, PINK_LT);
  petal(-1.45, 0.04, 0.032, PINK_LT);

  const lip = ell(0.016, 0.02, 0.012, 10);
  lip.translate(0, -0.024, 0.008);
  b.part(lip, LIP, { at: flower, bone: root });
  b.part(ell(0.008, 0.008, 0.008, 8), CENTRE, { at: flower, bone: root });

  return b.root;
}
```