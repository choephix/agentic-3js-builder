```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Sleepy Koala",
  description:
    "A drowsy koala with a cream chest and fluffy cream-lined ears, hugging a eucalyptus branch and munching a sprig of blue-green leaves.",
};

type V = [number, number, number];
const ORIGIN: V = [0, 0, 0];
const Z_AXIS: V = [0, 0, 1];

// ---- vector helpers --------------------------------------------------------
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / len(a));
const midOf = (a: V, b: V): V => mul(add(a, b), 0.5);

// quadratic curve from p0 to p2, pulled toward control point c
const quad = (p0: V, c: V, p2: V, t: number): V => {
  const u = 1 - t;
  const w0 = u * u;
  const w1 = 2 * u * t;
  const w2 = t * t;
  return [0, 1, 2].map((i) => w0 * p0[i] + w1 * c[i] + w2 * p2[i]) as V;
};

// point on an ellipsoid (centre c, radii r) reached from direction d, with its outward normal
function onEllipsoid(c: V, r: V, d: V): { p: V; n: V } {
  const u = norm(d);
  const s = 1 / Math.hypot(u[0] / r[0], u[1] / r[1], u[2] / r[2]);
  return {
    p: add(c, mul(u, s)),
    n: norm([u[0] / (r[0] * r[0]), u[1] / (r[1] * r[1]), u[2] / (r[2] * r[2])]),
  };
}

// rotation with +Y along y and +Z as close to w as possible
function rotation(y: V, w: V): THREE.Matrix4 {
  const Y = norm(y);
  let Z: V = Z_AXIS;
  for (const cand of [w, Z_AXIS, [1, 0, 0] as V]) {
    const z = sub(cand, mul(Y, dot(cand, Y)));
    if (len(z) > 1e-4) {
      Z = norm(z);
      break;
    }
  }
  const X = cross(Y, Z);
  return new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...X),
    new THREE.Vector3(...Y),
    new THREE.Vector3(...Z),
  );
}

// geometry built around the origin (base on y = 0, pole along +Y) turned so +Y runs along y, then moved to p
function put(g: THREE.BufferGeometry, y: V, p: V, w: V = Z_AXIS): THREE.BufferGeometry {
  const m = rotation(y, w);
  m.setPosition(p[0], p[1], p[2]);
  return g.applyMatrix4(m);
}

// ---- geometry factories ----------------------------------------------------
const ball = (c: V, r: V, seg = 14, rings = 10) =>
  new THREE.SphereGeometry(1, seg, rings).scale(r[0], r[1], r[2]).translate(c[0], c[1], c[2]);

// half-ball resting on its flat face at the origin, pole along +Y
const dome = (r: V) =>
  new THREE.SphereGeometry(1, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(r[0], r[1], r[2]);

const cone = (rad: number, h: number) =>
  new THREE.ConeGeometry(rad, h, 6).translate(0, h / 2, 0);

const cyl = (rad: number, h: number) =>
  new THREE.CylinderGeometry(rad, rad, h, 14).translate(0, h / 2, 0);

const rim = (R: number, tube: number) =>
  new THREE.TorusGeometry(R, tube, 6, 14).rotateX(Math.PI / 2);

// puffy limb segment from a to z
const segment = (a: V, z: V, rad: number) => {
  const d = sub(z, a);
  const g = new THREE.SphereGeometry(1, 10, 6).scale(rad, len(d) / 2 + rad * 0.6, rad);
  return put(g, d, midOf(a, z));
};

// lanceolate eucalyptus leaf: base at `base`, reaching along `dir`
const leaf = (base: V, dir: V, L: number, W: number) => {
  const g = new THREE.SphereGeometry(1, 6, 4).scale(W, L / 2, W * 0.3);
  return put(g, dir, add(base, mul(norm(dir), L / 2)));
};

// ---- palette and key positions --------------------------------------------
const FUR = "#9da1a6";
const FUR_DK = "#7d8288";
const FUR_LT = "#bcc0c4";
const CREAM = "#eee3c8";
const CREAM_HI = "#fbf8ef";
const NOSE = "#131313";
const EYE = "#5c3517";
const LID = "#868b91";
const CLAW = "#22232a";
const PAW = "#6b7077";
const MOUTH = "#2b1f18";
const BARK = "#8c9182";
const BARK_PALE = "#c4c1ae";
const STEM = "#7b8b66";
const LEAF = ["#5e9b92", "#47847c", "#7aaea4"];

const HEAD_C: V = [0, 0.675, 0.05];
const HEAD_R: V = [0.155, 0.14, 0.14];
const MUZ_C: V = [0, 0.635, 0.17];
const MUZ_R: V = [0.088, 0.066, 0.075];
const PAW_R_C: V = [-0.258, 0.5, 0.04];
const FOOT_R: V = [0.07, 0.04, 0.09];

export default function build() {
  const b = createBuilder({ name: "sleepy-koala" });
  type Bone = ReturnType<typeof b.joint>;

  // Geometry is in model space; the bone decides what it moves with.
  const seat = (g: THREE.BufferGeometry, color: string, bone: Bone) => {
    b.part(g, color, { at: ORIGIN, bone });
  };

  // ---- skeleton --------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.16, 0] });
  const spine = b.joint("spine", { at: [0, 0.32, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.46, 0.02], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.57, 0.04], parent: chest });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.6, 0.1], parent: head });
  const tail = b.joint("tail", { at: [0, 0.22, -0.2], parent: hips });

  const earP = {
    L: onEllipsoid(HEAD_C, HEAD_R, [0.7, 0.62, -0.2]),
    R: onEllipsoid(HEAD_C, HEAD_R, [-0.7, 0.62, -0.2]),
  };
  const earL = b.joint("earL", { at: earP.L.p, parent: head });
  const earR = b.joint("earR", { at: earP.R.p, parent: head });

  const shoulderL = b.joint("shoulderL", { at: [0.13, 0.5, 0.03], parent: chest });
  const elbowL = b.joint("elbowL", { at: [0.2, 0.39, 0.12], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.13, 0.58, 0.2], parent: elbowL });
  const shoulderR = b.joint("shoulderR", { at: [-0.13, 0.5, 0.03], parent: chest });
  const elbowR = b.joint("elbowR", { at: [-0.27, 0.38, 0.12], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.255, 0.5, 0.05], parent: elbowR });
  const hipL = b.joint("hipL", { at: [0.11, 0.12, 0.04], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.11, 0.08, 0.17], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.1, 0.04, 0.26], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.11, 0.12, 0.04], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.11, 0.08, 0.17], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.1, 0.04, 0.26], parent: kneeR });

  // ---- body ------------------------------------------------------------------
  seat(ball([0, 0.2, -0.01], [0.19, 0.17, 0.18]), FUR, hips); // haunch
  seat(ball([0, 0.22, -0.2], [0.04, 0.04, 0.04], 8, 6), FUR_LT, tail); // stub tail
  seat(ball([0, 0.42, 0], [0.16, 0.19, 0.15]), FUR, spine); // torso
  seat(ball([0, 0.49, -0.07], [0.14, 0.1, 0.1]), FUR_DK, spine); // darker back
  seat(ball([0, 0.4, 0.12], [0.11, 0.14, 0.06]), CREAM, chest); // cream chest
  seat(ball([0, 0.56, 0.03], [0.12, 0.08, 0.11]), FUR, neck); // neck

  // ---- head ------------------------------------------------------------------
  seat(ball(HEAD_C, HEAD_R, 16, 10), FUR, head);
  seat(ball(MUZ_C, MUZ_R, 12, 8), CREAM, head); // muzzle
  seat(ball([0, 0.55, 0.15], [0.064, 0.04, 0.058], 10, 6), CREAM, jaw); // lower jaw

  const nose = onEllipsoid(MUZ_C, MUZ_R, [0, 0.5, 1]);
  seat(put(dome([0.05, 0.04, 0.046]), nose.n, nose.p), NOSE, head); // big leathery nose

  for (const s of [1, -1]) {
    const eye = onEllipsoid(HEAD_C, HEAD_R, [s * 0.5, 0.1, 0.86]);
    const lid = onEllipsoid(HEAD_C, HEAD_R, [s * 0.5, 0.36, 0.86]); // heavy lid, shifted up
    const glint = onEllipsoid(HEAD_C, HEAD_R, [s * 0.44, -0.04, 0.9]);
    seat(put(dome([0.036, 0.024, 0.036]), eye.n, eye.p), EYE, head);
    seat(put(dome([0.042, 0.026, 0.042]), lid.n, lid.p), LID, head);
    seat(put(dome([0.009, 0.009, 0.009]), glint.n, glint.p), CREAM_HI, head);
  }

  // mouth line on the muzzle, drooping at the middle
  const smile: V[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = -1 + i / 4;
    smile.push(onEllipsoid(MUZ_C, MUZ_R, [u * 0.55, -0.2 + 0.1 * u * u, 0.85]).p);
  }
  b.sweep(smile, 0.0045, { color: MOUTH, bone: head });

  // ---- ears: fluffy, cream-lined ----------------------------------------------
  for (const [e, bone] of [
    [earP.L, earL],
    [earP.R, earR],
  ] as const) {
    seat(put(dome([0.072, 0.034, 0.072]), e.n, e.p), FUR, bone);
    seat(put(rim(0.07, 0.013), e.n, e.p), FUR_LT, bone);
    seat(put(cyl(0.05, 0.012), e.n, add(e.p, mul(e.n, 0.024))), CREAM, bone);
  }

  // ---- arms ------------------------------------------------------------------
  // left arm: paw lifts the sprig up beside the mouth
  seat(segment([0.13, 0.5, 0.03], [0.2, 0.39, 0.12], 0.05), FUR, shoulderL);
  seat(segment([0.2, 0.39, 0.12], [0.13, 0.58, 0.2], 0.045), FUR, elbowL);
  seat(ball([0.14, 0.61, 0.23], [0.05, 0.05, 0.055], 12, 8), PAW, wristL);

  // right arm: wraps round the branch from the front
  seat(segment([-0.13, 0.5, 0.03], [-0.27, 0.38, 0.12], 0.05), FUR, shoulderR);
  seat(segment([-0.27, 0.38, 0.12], [-0.255, 0.5, 0.05], 0.045), FUR, elbowR);
  seat(ball(PAW_R_C, [0.05, 0.05, 0.05], 12, 8), PAW, wristR);
  for (const k of [-1, 0, 1]) {
    const c = onEllipsoid(PAW_R_C, [0.05, 0.05, 0.05], [k * 0.4, -0.9, 0.25]);
    seat(put(cone(0.011, 0.035), c.n, c.p), CLAW, wristR);
  }

  // ---- legs and feet -----------------------------------------------------------
  for (const s of [1, -1]) {
    const hip = s > 0 ? hipL : hipR;
    const knee = s > 0 ? kneeL : kneeR;
    const ankle = s > 0 ? ankleL : ankleR;
    const footC: V = [s * 0.1, 0.04, 0.26];
    seat(ball([s * 0.11, 0.11, 0.1], [0.085, 0.09, 0.11]), FUR, hip);
    seat(segment([s * 0.11, 0.08, 0.17], footC, 0.05), FUR, knee);
    seat(ball(footC, FOOT_R, 12, 8), PAW, ankle);
    for (const k of [-1, 0, 1]) {
      const c = onEllipsoid(footC, FOOT_R, [k * 0.45, -0.1, 1]);
      seat(put(cone(0.011, 0.04), c.n, c.p), CLAW, ankle);
    }
  }

  // ---- eucalyptus sprig in the left paw ----------------------------------------
  const SP: [V, V, V] = [
    [0.14, 0.6, 0.245],
    [0.19, 0.7, 0.3],
    [0.2, 0.8, 0.29],
  ];
  const sprig = (t: number) => quad(SP[0], SP[1], SP[2], t);
  b.sweep(
    Array.from({ length: 9 }, (_, i) => sprig(i / 8)),
    0.007,
    { color: STEM, bone: wristL },
  );

  // leaves alternate along a path, angled out from the stem
  const Z: V = Z_AXIS;
  const spray = (path: (t: number) => V, ts: number[], bone: Bone, size: number, flip: number) => {
    ts.forEach((t, i) => {
      const base = path(t);
      const tan = norm(sub(path(Math.min(1, t + 0.02)), path(Math.max(0, t - 0.02))));
      const side = norm(cross(tan, Z));
      const dir = norm(add(mul(tan, 0.5), mul(side, (i % 2 ? -flip : flip) * 0.9)));
      seat(leaf(base, dir, size * (1.05 - 0.4 * t), 0.012), LEAF[i % LEAF.length], bone);
    });
  };
  spray(sprig, [0.15, 0.27, 0.39, 0.5, 0.62, 0.74, 0.86, 0.97], wristL, 0.09, 1);

  // ---- eucalyptus branch the koala hugs -----------------------------------------
  const TR: [V, V, V] = [
    [-0.33, 0, -0.14],
    [-0.26, 0.45, -0.08],
    [-0.2, 1.1, 0.0],
  ];
  const trunk = (t: number) => quad(TR[0], TR[1], TR[2], t);
  b.sweep(
    Array.from({ length: 13 }, (_, i) => trunk(i / 12)),
    0.052,
    { color: BARK, bone: hips },
  );

  // pale peeling patches of smooth bark
  const patchN: V = norm([0.5, 0, 0.87]);
  for (const t of [0.22, 0.44, 0.66, 0.86]) {
    const q = add(trunk(t), mul(patchN, 0.05));
    seat(
      put(new THREE.SphereGeometry(1, 8, 6).scale(0.02, 0.035, 0.01), [0, 1, 0], q, patchN),
      BARK_PALE,
      hips,
    );
  }

  // side twig with leaves near the top
  const T0 = trunk(0.8);
  const twig = (t: number) => quad(T0, [-0.15, 0.93, 0.02], [-0.03, 0.95, 0.04], t);
  b.sweep(
    Array.from({ length: 6 }, (_, i) => twig(i / 5)),
    0.018,
    { color: BARK, bone: hips },
  );
  spray(twig, [0.3, 0.6, 0.9], hips, 0.075, -1);
  spray(trunk, [0.9, 0.98], hips, 0.08, 1);

  return b.root;
}
```