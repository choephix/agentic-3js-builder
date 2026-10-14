import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: V): V => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mirrorX = (p: V[]): V[] => p.map((q): V => [-q[0], q[1], q[2]]);
const X: V = [1, 0, 0];
const UP: V = [0, 1, 0];

/** Cubic bezier point. */
function cubic(p: V[], t: number): V {
  const u = 1 - t;
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const out: V = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    out[i] = w[0] * p[0][i] + w[1] * p[1][i] + w[2] * p[2][i] + w[3] * p[3][i];
  }
  return out;
}

/** Unit tangent of a cubic bezier. */
function cubicTangent(p: V[], t: number): V {
  const u = 1 - t;
  const v = add(
    add(mul(sub(p[1], p[0]), 3 * u * u), mul(sub(p[2], p[1]), 6 * u * t)),
    mul(sub(p[3], p[2]), 3 * t * t),
  );
  return norm(v);
}

/** Point along a polyline, u in 0..1 by station. */
function polyAt(pts: V[], u: number): V {
  const f = u * (pts.length - 1);
  const i = Math.min(Math.floor(f), pts.length - 2);
  const w = f - i;
  return add(mul(pts[i], 1 - w), mul(pts[i + 1], w));
}

/** Concatenate non-indexed copies of simple geometries into one. */
function mergeGeos(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  for (const src of list) {
    const g = src.index ? src.toNonIndexed() : src;
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return out;
}

/** Rotate geometry so its local X, Y, Z map to the given right-handed axes. */
function basisGeo(geo: THREE.BufferGeometry, x: V, y: V, z: V): THREE.BufferGeometry {
  const m = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(x[0], x[1], x[2]),
    new THREE.Vector3(y[0], y[1], y[2]),
    new THREE.Vector3(z[0], z[1], z[2]),
  );
  return geo.applyMatrix4(m);
}

/** Rotate geometry so its +Y axis points along d. */
function alongDir(geo: THREE.BufferGeometry, d: V): THREE.BufferGeometry {
  const y = norm(d);
  const x = norm(cross(Math.abs(y[1]) < 0.9 ? UP : X, y));
  return basisGeo(geo, x, y, cross(x, y));
}

/** Ellipsoid with radii r, built from a unit sphere. */
function ellipsoid(r: V, w = 14, h = 10): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(r[0], r[1], r[2]);
  return g;
}

export const meta = {
  name: "Unicorn foal",
  description:
    "A newborn unicorn foal on long wobbly legs: pearl-white coat with a lilac shimmer, pastel puff mane and tail, a small gold spiral horn, big dark eyes with long lashes, silver hooves and a daisy chain round the neck.",
};

const COAT = "#fbf8ff";
const PEARL = "#e6dafc";
const FLECKS = ["#c9f5e7", "#ffd3e9", "#e6dafc"];
const MANE = ["#ffb3d9", "#a8f2d7", "#c6b1f7"];
const GOLD = "#ffd66b";
const GOLD_DEEP = "#d6962b";
const SILVER = "#cdd5e4";
const EYE = "#150e26";
const EYE_DEEP = "#0a0614";
const IRIS = "#5d40a6";
const LASH = "#241a3a";
const BLUSH = "#ffc4de";
const INNER_EAR = "#ffc2dc";
const NOSTRIL = "#8a7aa3";
const WHITE = "#ffffff";
const FLOWER = "#fff8fc";
const FLOWER_CENTRE = "#ffd23f";
const LEAF = "#8fe6b1";
const STEM = "#7fdc9e";
const TAIL_CORE = "#e6dcfc";
const LEG_R = 0.03;

const NECK: V[] = [
  [0, 0.64, 0.16],
  [0, 0.76, 0.22],
  [0, 0.86, 0.3],
  [0, 0.91, 0.4],
];
const HEAD: V = [0, 0.93, 0.46];
const TAIL: V[] = [
  [0, 0.7, -0.28],
  [0, 0.66, -0.37],
  [0, 0.59, -0.42],
  [0, 0.52, -0.43],
];
const FORE_L: V[] = [
  [0.085, 0.5, 0.17],
  [0.095, 0.29, 0.195],
  [0.1, 0.11, 0.185],
  [0.102, 0.05, 0.185],
];
const HIND_L: V[] = [
  [0.085, 0.5, -0.2],
  [0.1, 0.28, -0.245],
  [0.1, 0.11, -0.22],
  [0.102, 0.05, -0.22],
];
const HORN_BASE: V = [0, 1.01, 0.515];
const HORN_DIR = norm([0, 0.72, 0.69]);
const HORN_LEN = 0.17;

export default function build() {
  const b = createBuilder({ name: "unicorn-foal" });
  type Bone = ReturnType<typeof b.joint>;

  const put = (geo: THREE.BufferGeometry, colour: string, at: V, bone?: Bone) => {
    if (bone) b.part(geo, colour, { at, bone });
    else b.part(geo, colour, { at });
  };

  // ── Skeleton ─────────────────────────────────────────────
  const hips = b.joint("hips", { at: [0, 0.62, -0.05] });
  const chest = b.joint("chest", { at: NECK[0], parent: hips });
  const head = b.joint("head", { at: HEAD, parent: chest });
  const jaw = b.joint("jaw", { at: [0, 0.87, 0.52], parent: head });

  // ── Chains and sweeps ────────────────────────────────────
  const neck = b.chain(
    "neck",
    [0, 0.25, 0.5, 0.75, 1].map((t) => cubic(NECK, t)),
    { role: "neck" },
  );
  b.sweep(neck, 0.068, { color: COAT });

  const tail = b.chain("tail", TAIL, { role: "tail" });
  b.sweep(tail, 0.016, { color: TAIL_CORE });

  const legs: [string, V[]][] = [
    ["foreL", FORE_L],
    ["foreR", mirrorX(FORE_L)],
    ["hindL", HIND_L],
    ["hindR", mirrorX(HIND_L)],
  ];
  for (const [name, pts] of legs) {
    const leg = b.chain(name, pts, { role: "leg" });
    b.sweep(leg, LEG_R, { color: COAT });
    const foot = pts[pts.length - 1];
    put(new THREE.CylinderGeometry(0.03, 0.036, 0.05, 10), SILVER, [foot[0], 0.025, foot[2]]);
  }

  // ── Body ─────────────────────────────────────────────────
  put(ellipsoid([0.15, 0.17, 0.27]), COAT, [0, 0.6, 0], hips);
  put(ellipsoid([0.152, 0.168, 0.16]), COAT, [0, 0.6, 0.15], chest);
  put(ellipsoid([0.15, 0.165, 0.15]), COAT, [0, 0.62, -0.15], hips);
  // lilac underside, a soft two-tone shade
  put(ellipsoid([0.152, 0.095, 0.275]), PEARL, [0, 0.49, 0], hips);
  // pearly flecks on the flanks
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const y = 0.6 + 0.12 * Math.sin(i * 2.4);
    const z = 0.2 * Math.cos(i * 1.7) - 0.02;
    const dy = (y - 0.6) / 0.17;
    const dz = z / 0.27;
    const x = side * 0.15 * Math.sqrt(Math.max(0, 1 - dy * dy - dz * dz));
    put(ellipsoid([0.006, 0.022, 0.03], 8, 6), FLECKS[i % 3], [x, y, z], hips);
  }

  // ── Head ─────────────────────────────────────────────────
  put(ellipsoid([0.095, 0.105, 0.1]), COAT, HEAD, head);
  put(ellipsoid([0.06, 0.055, 0.075]), COAT, [0, 0.905, 0.58], head);
  put(ellipsoid([0.052, 0.047, 0.045], 12, 8), BLUSH, [0, 0.9, 0.62], head);
  put(new THREE.SphereGeometry(0.008, 6, 4), NOSTRIL, [0.024, 0.915, 0.645], head);
  put(new THREE.SphereGeometry(0.008, 6, 4), NOSTRIL, [-0.024, 0.915, 0.645], head);
  put(ellipsoid([0.045, 0.028, 0.07]), COAT, [0, 0.868, 0.58], jaw);

  // ears with pink insides
  for (const s of [1, -1]) {
    const ear = new THREE.ConeGeometry(0.028, 0.1, 6);
    ear.rotateZ(-0.3 * s);
    put(ear, COAT, [0.052 * s, 1.05, 0.42], head);
    const inner = new THREE.ConeGeometry(0.015, 0.07, 5);
    inner.rotateZ(-0.3 * s);
    put(inner, INNER_EAR, [0.052 * s, 1.05, 0.452], head);
  }

  // forelock
  put(new THREE.IcosahedronGeometry(0.024, 1), MANE[0], [0, 1.045, 0.472], head);
  put(new THREE.IcosahedronGeometry(0.02, 1), MANE[1], [0.024, 1.03, 0.462], head);
  put(new THREE.IcosahedronGeometry(0.02, 1), MANE[2], [-0.024, 1.03, 0.462], head);

  // eyes: big, dark, glossy, with long lashes
  const EYE_C: V = [0.082, 0.95, 0.505];
  for (const s of [1, -1]) {
    const E: V = [EYE_C[0] * s, EYE_C[1], EYE_C[2]];
    const n = norm([0.88 * s, 0.18, 0.44]);
    const up = norm(sub(UP, mul(n, n[1])));
    const tt = norm(cross(n, up));

    put(new THREE.SphereGeometry(0.03, 14, 10), EYE, E, head);
    put(new THREE.SphereGeometry(0.02, 12, 8), IRIS, add(E, mul(n, 0.014)), head);
    put(new THREE.SphereGeometry(0.008, 8, 6), EYE_DEEP, add(E, mul(n, 0.03)), head);
    put(new THREE.SphereGeometry(0.0065, 6, 5), WHITE, add(E, add(mul(n, 0.034), [0, 0.008, 0])), head);

    for (const phi of [-1.0, -0.65, -0.3, 0.05, 0.4, 0.75]) {
      const rad = add(mul(up, Math.cos(phi)), mul(tt, Math.sin(phi)));
      const base = add(add(E, mul(n, 0.012)), mul(rad, 0.03));
      const dn = norm(add(add(mul(n, 0.55), mul(rad, 0.6)), mul(up, 0.3)));
      const mid = add(base, mul(dn, 0.026));
      const tip = add(add(base, mul(dn, 0.05)), mul(up, 0.012));
      b.sweep([base, mid, tip], 0.0035, { color: LASH });
    }
  }

  // spiral gold horn: a cone with a twisting ridge
  const horn = alongDir(new THREE.ConeGeometry(0.03, HORN_LEN, 10), HORN_DIR);
  put(horn, GOLD, add(HORN_BASE, mul(HORN_DIR, HORN_LEN / 2)), head);
  const hx = norm(cross(UP, HORN_DIR));
  const hz = cross(hx, HORN_DIR);
  const helix: V[] = [];
  const HN = 40;
  for (let i = 0; i <= HN; i++) {
    const s = (i / HN) * 0.92;
    const th = s * Math.PI * 2 * 2.3;
    const r = 0.03 * (1 - s) * 0.9 + 0.001;
    const c = add(HORN_BASE, mul(HORN_DIR, s * HORN_LEN));
    helix.push(add(c, add(mul(hx, r * Math.cos(th)), mul(hz, r * Math.sin(th)))));
  }
  b.sweep(helix, 0.0055, { color: GOLD_DEEP });

  // ── Mane along the crest (dorsal side of the neck) ───────
  const MANE_N = 11;
  for (let k = 0; k < MANE_N; k++) {
    const t = 0.6 + 0.36 * (k / (MANE_N - 1));
    const P = cubic(NECK, t);
    const T = cubicTangent(NECK, t);
    const D = norm(cross(T, X));
    for (const side of [-1, 1]) {
      const c = add(add(P, mul(D, 0.062)), [side * 0.03, 0, 0]);
      const r = 0.03 - 0.006 * (k / MANE_N) + 0.002 * Math.sin(k * 2.1 + side);
      put(new THREE.IcosahedronGeometry(r, 1), MANE[(k + (side > 0 ? 1 : 0)) % 3], c);
    }
  }

  // ── Puff tail along the tail chain ───────────────────────
  for (let k = 0; k < 8; k++) {
    const u = k / 7;
    const P = polyAt(TAIL, u);
    const r = 0.05 - 0.02 * u;
    for (const side of [-1, 1]) {
      put(
        new THREE.IcosahedronGeometry(r, 1),
        MANE[(k + (side > 0 ? 1 : 0)) % 3],
        add(P, [side * 0.022, 0, 0]),
      );
    }
  }

  // ── Daisy chain hanging round the neck ───────────────────
  const TG = 0.46;
  const PG = cubic(NECK, TG);
  const TGd = cubicTangent(NECK, TG);
  const DG = norm(cross(TGd, X));
  const CG = add(PG, [0, -0.004, 0]);
  const RG = 0.09;
  const onRing = (th: number): V =>
    add(CG, add(mul(X, RG * Math.cos(th)), mul(DG, RG * Math.sin(th))));
  const radial = (th: number) => ({
    R: add(mul(X, Math.cos(th)), mul(DG, Math.sin(th))),
    Tt: add(mul(X, -Math.sin(th)), mul(DG, Math.cos(th))),
  });

  const stem: V[] = [];
  for (let i = 0; i <= 36; i++) stem.push(onRing((i / 36) * Math.PI * 2));
  b.sweep(stem, 0.0048, { color: STEM });

  const petalList: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.SphereGeometry(1, 6, 4);
    g.scale(0.0115, 0.0042, 0.0028);
    g.translate(0.0125, 0, 0);
    g.rotateZ((i * Math.PI) / 3);
    petalList.push(g);
  }
  const petalGeo = mergeGeos(petalList);

  const FLOWERS = 12;
  for (let k = 0; k < FLOWERS; k++) {
    const th = (k / FLOWERS) * Math.PI * 2 + 0.2;
    const { R, Tt } = radial(th);
    const pg = petalGeo.clone();
    basisGeo(pg, Tt, TGd, R);
    const centre = onRing(th);
    put(pg, FLOWER, centre);
    put(new THREE.SphereGeometry(0.0065, 8, 6), FLOWER_CENTRE, centre);

    const lth = th + Math.PI / FLOWERS;
    const leaf = radial(lth);
    const lg = new THREE.SphereGeometry(1, 6, 4);
    lg.scale(0.0135, 0.0032, 0.0065);
    basisGeo(lg, leaf.Tt, TGd, leaf.R);
    put(lg, LEAF, onRing(lth));
  }

  // ── Done ─────────────────────────────────────────────────
  return b.root;
}
