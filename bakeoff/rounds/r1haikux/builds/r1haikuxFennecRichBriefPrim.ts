import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Fennec kit on a dune",
  description:
    "A fennec fox kit standing alert on a small sand dune at dusk: oversized satin ears lined in peach, a cream-to-gold coat, a bushy tail with a black tip, big dark eyes and a woven leather collar with a brass bell.",
};

type V = [number, number, number];

// ---------- vector helpers ----------
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const mix = (a: V, b: V, t: number): V => add(mul(a, 1 - t), mul(b, t));
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => mul(a, 1 / len(a));
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const mirror = (p: V, s: number): V => [p[0] * s, p[1], p[2]];

// ---------- geometry helpers (orientation is baked in, so parts need no aim) ----------

/** Rotates a geometry so its +Y axis points along dir. */
function alongY<G extends THREE.BufferGeometry>(geo: G, dir: V): G {
  const y = unit(dir);
  const ref: V = Math.abs(y[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const x = unit(cross(ref, y));
  const z = cross(x, y);
  const m = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...x),
    new THREE.Vector3(...y),
    new THREE.Vector3(...z),
  );
  return geo.applyMatrix4(m);
}

/** Ellipsoid with radii rx, ry, rz. */
const ell = (rx: number, ry: number, rz: number, seg = 14, rings = 9) =>
  new THREE.SphereGeometry(1, seg, rings).scale(rx, ry, rz);

/** Top part of an ellipsoid; `top` is the fraction of PI from the pole (0.5 = dome). */
const cap = (rx: number, ry: number, rz: number, top: number) =>
  new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI * top).scale(rx, ry, rz);

/** Leaf-shaped ear outline: base at the origin, length along +Y. */
function leaf(w: number, L: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.quadraticCurveTo(-w * 0.72, L * 0.5, -w * 0.12, L * 0.9);
  s.quadraticCurveTo(0, L * 1.04, w * 0.12, L * 0.9);
  s.quadraticCurveTo(w * 0.72, L * 0.5, w / 2, 0);
  s.quadraticCurveTo(0, -w * 0.14, -w / 2, 0);
  return s;
}

/** Ears lean outward and forward. s = +1 for the left (+X) ear. */
function earTilt<G extends THREE.BufferGeometry>(g: G, s: number): G {
  g.rotateZ(-s * 0.22);
  g.rotateX(0.14);
  return g;
}

function earShell(s: number) {
  const g = new THREE.ExtrudeGeometry(leaf(0.08, 0.2), {
    depth: 0.003,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.0018,
    bevelSegments: 2,
    curveSegments: 8,
  });
  g.translate(0, 0, -0.0015);
  return earTilt(g, s);
}

function earLining(s: number) {
  const g = new THREE.ExtrudeGeometry(leaf(0.058, 0.16), {
    depth: 0.0016,
    bevelEnabled: false,
    curveSegments: 8,
  });
  g.translate(0, 0.014, 0.003);
  return earTilt(g, s);
}

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });
  type Jt = ReturnType<typeof b.joint>;

  const C = {
    cream: "#f4e4c8",
    creamHi: "#fff6e6",
    sand: "#e6bf88",
    gold: "#d8995a",
    earGold: "#e6ae70",
    peach: "#f7bea0",
    ink: "#1f1512",
    leather: "#5a3420",
    tan: "#d6a668",
    brass: "#dcb052",
    dune: "#d69e63",
    duneDeep: "#b97847",
    ripple: "#bf8651",
    farA: "#8e6e80",
    farB: "#a58292",
    grass: "#ab8f58",
    pebble: "#8c5d3c",
    spark: "#ffffff",
  };

  // A piece centred at p, riding the bone of joint j.
  const on = (j: Jt, geo: THREE.BufferGeometry, color: string, p: V) =>
    b.part({ geo, color, at: j.moved(p) });
  // Scenery: no joint, sits at a world point.
  const free = (geo: THREE.BufferGeometry, color: string, p: V) =>
    b.part({ geo, color, at: p });
  // A capsule strut from a to c riding joint j.
  const strut = (j: Jt, a: V, c: V, r: number, color: string) => {
    const d = sub(c, a);
    const geo = alongY(
      new THREE.CapsuleGeometry(r, Math.max(0.002, len(d) - 2 * r), 3, 8),
      d,
    );
    b.part({ geo, color, at: j.moved(mix(a, c, 0.5)) });
  };

  // ---------- scenery: dusk dunes, ripples, pebbles, a grass tuft ----------
  const DUNE = { x: 0.44, y: 0.12, z: 0.36 };
  const duneH = (x: number, z: number) =>
    DUNE.y * Math.sqrt(Math.max(0, 1 - (x / DUNE.x) ** 2 - (z / DUNE.z) ** 2));

  free(cap(0.55, 0.15, 0.26, 0.5), C.farA, [-0.62, 0, -0.62]);
  free(cap(0.46, 0.1, 0.22, 0.5), C.farB, [0.66, 0, -0.55]);
  free(cap(DUNE.x * 1.12, 0.05, DUNE.z * 1.12, 0.5), C.duneDeep, [0, 0, 0]);
  free(cap(DUNE.x, DUNE.y, DUNE.z, 0.5), C.dune, [0, 0, 0]);

  const ripples: [number, number, number][] = [
    [-0.2, 0.1, 0.1],
    [0.12, -0.14, 0.08],
    [-0.05, -0.27, 0.07],
  ];
  for (const [x, z, w] of ripples) {
    free(ell(w, 0.0035, w * 0.2), C.ripple, [x, duneH(x, z) + 0.001, z]);
  }

  const pebbles: [number, number][] = [
    [0.2, -0.05],
    [-0.24, 0.16],
    [0.3, -0.22],
  ];
  for (const [x, z] of pebbles) {
    free(ell(0.012, 0.008, 0.01, 8, 6), C.pebble, [x, duneH(x, z) + 0.002, z]);
  }

  const tuft: V = [0.3, duneH(0.3, 0.14), 0.14];
  const blades: V[] = [
    [0.22, 1, 0.06],
    [-0.18, 1, 0.12],
    [0.04, 1, -0.2],
  ];
  for (const d of blades) {
    const dir = unit(d);
    free(
      alongY(new THREE.ConeGeometry(0.0042, 0.072, 4), dir),
      C.grass,
      add(tuft, mul(dir, 0.036)),
    );
  }

  // ---------- skeleton (rest pose, metres, the kit faces +Z) ----------
  const BODY: V = [0, 0.27, -0.02];
  const NECK_A: V = [0, 0.32, 0.105];
  const HEAD_C: V = [0, 0.385, 0.165];

  const hips = b.joint("hips", { at: [0, 0.27, -0.12] });
  const spine = b.joint("spine", { at: BODY, parent: hips });
  const chest = b.joint("chest", { at: [0, 0.285, 0.07], parent: spine });
  const neck = b.joint("neck", { at: NECK_A, parent: chest });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.36, 0.19], parent: head });
  const earL = b.joint("earL", { at: [0.028, 0.41, 0.145], parent: head });
  const earR = b.joint("earR", { at: [-0.028, 0.41, 0.145], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.27, -0.165], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.256, -0.235], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.246, -0.305], parent: tail2 });
  const tail4 = b.joint("tail4", { at: [0, 0.262, -0.35], parent: tail3 });
  const tail5 = b.joint("tail5", { at: [0, 0.287, -0.382], parent: tail4 });

  const FORE: V[] = [
    [0.046, 0.26, 0.08],
    [0.046, 0.19, 0.09],
    [0.046, 0.135, 0.11],
  ];
  const HIND: V[] = [
    [0.05, 0.25, -0.11],
    [0.05, 0.178, -0.075],
    [0.05, 0.135, -0.135],
  ];
  const legs = [1, -1].map((s) => {
    const k = s > 0 ? "L" : "R";
    const f = FORE.map((p) => mirror(p, s));
    const h = HIND.map((p) => mirror(p, s));
    const sh = b.joint(`shoulder${k}`, { at: f[0], parent: chest });
    const el = b.joint(`elbow${k}`, { at: f[1], parent: sh });
    const wr = b.joint(`wrist${k}`, { at: f[2], parent: el });
    const hi = b.joint(`hip${k}`, { at: h[0], parent: hips });
    const kn = b.joint(`knee${k}`, { at: h[1], parent: hi });
    const an = b.joint(`ankle${k}`, { at: h[2], parent: kn });
    return { s, f, h, sh, el, wr, hi, kn, an };
  });

  // ---------- body: cream base, sand band, gold back ----------
  on(spine, ell(0.056, 0.058, 0.122), C.cream, BODY);
  on(spine, cap(0.0575, 0.0605, 0.1245, 0.66), C.sand, BODY);
  on(spine, cap(0.059, 0.062, 0.126, 0.4), C.gold, BODY);

  // Little fur tufts that break up the gold back line.
  for (const z of [-0.1, -0.055, -0.01]) {
    const top = 0.27 + 0.062 * Math.sqrt(Math.max(0, 1 - ((z + 0.02) / 0.126) ** 2));
    const base: V = [0, top, z];
    const dir = unit([0, 1, -0.45]);
    on(
      spine,
      alongY(new THREE.ConeGeometry(0.0105, 0.03, 5), dir),
      C.gold,
      add(base, mul(dir, 0.012)),
    );
  }

  on(chest, ell(0.04, 0.04, 0.036), C.creamHi, [0, 0.27, 0.095]); // chest ruff
  on(chest, ell(0.038, 0.042, 0.04), C.cream, [0, 0.3, 0.09]); // neck base
  strut(neck, NECK_A, HEAD_C, 0.03, C.cream);

  // ---------- legs: long, thin, with oversized paws ----------
  for (const L of legs) {
    const { f, h } = L;

    // Front leg
    on(L.sh, ell(0.03, 0.036, 0.034), C.sand, f[0]);
    strut(L.sh, f[0], f[1], 0.017, C.sand);
    on(L.el, ell(0.0172, 0.0172, 0.0172), C.sand, f[1]);
    strut(L.el, f[1], f[2], 0.0145, C.sand);
    on(L.wr, ell(0.0152, 0.0152, 0.0152), C.sand, f[2]);
    const fz = 0.125;
    on(L.wr, ell(0.03, 0.02, 0.043), C.creamHi, [f[2][0], 0.128, fz]);
    for (const dx of [-0.011, 0, 0.011]) {
      on(L.wr, ell(0.0105, 0.0095, 0.0105), C.creamHi, [f[2][0] + dx, 0.112, fz + 0.036]);
      on(L.wr, ell(0.0034, 0.0028, 0.005, 6, 5), C.ink, [f[2][0] + dx, 0.109, fz + 0.044]);
    }

    // Hind leg
    on(L.hi, ell(0.03, 0.04, 0.046), C.sand, [h[0][0], 0.262, -0.1]); // haunch
    strut(L.hi, h[0], h[1], 0.018, C.sand);
    on(L.kn, ell(0.0175, 0.0175, 0.0175), C.sand, h[1]);
    strut(L.kn, h[1], h[2], 0.015, C.sand);
    on(L.an, ell(0.0152, 0.0152, 0.0152), C.sand, h[2]);
    const hz = -0.12;
    on(L.an, ell(0.03, 0.02, 0.043), C.creamHi, [h[2][0], 0.128, hz]);
    for (const dx of [-0.011, 0, 0.011]) {
      on(L.an, ell(0.0105, 0.0095, 0.0105), C.creamHi, [h[2][0] + dx, 0.112, hz + 0.036]);
      on(L.an, ell(0.0034, 0.0028, 0.005, 6, 5), C.ink, [h[2][0] + dx, 0.109, hz + 0.044]);
    }
  }

  // ---------- tail: stacked fluffy puffs, gold on top, black tip ----------
  on(tail1, ell(0.036, 0.038, 0.048), C.cream, [0, 0.27, -0.165]);
  on(tail1, cap(0.038, 0.04, 0.05, 0.5), C.gold, [0, 0.27, -0.165]);
  on(tail2, ell(0.04, 0.04, 0.05), C.cream, [0, 0.256, -0.235]);
  on(tail2, cap(0.042, 0.042, 0.052, 0.5), C.gold, [0, 0.256, -0.235]);
  on(tail3, ell(0.041, 0.04, 0.05), C.cream, [0, 0.246, -0.305]);
  on(tail3, cap(0.043, 0.042, 0.052, 0.5), C.gold, [0, 0.246, -0.305]);
  on(tail4, ell(0.038, 0.038, 0.046), C.cream, [0, 0.262, -0.35]);
  on(tail4, cap(0.04, 0.04, 0.048, 0.5), C.gold, [0, 0.262, -0.35]);
  on(tail5, ell(0.031, 0.031, 0.034), C.ink, [0, 0.287, -0.384]); // black smudge

  // ---------- head: cream skull, gold crown, long snout, big dark eyes ----------
  on(head, ell(0.046, 0.042, 0.05), C.cream, HEAD_C);
  on(head, cap(0.0475, 0.0435, 0.0515, 0.3), C.gold, HEAD_C); // gold crown

  const snoutDir = unit([0, -0.06, 1]);
  on(
    head,
    alongY(new THREE.ConeGeometry(0.027, 0.072, 10), snoutDir),
    C.cream,
    [0, 0.374, 0.226],
  );
  on(head, ell(0.0115, 0.0092, 0.0105), C.ink, [0, 0.372, 0.262]); // nose

  for (const s of [1, -1]) {
    on(head, ell(0.02, 0.022, 0.03), C.creamHi, [s * 0.038, 0.372, 0.176]); // cheek ruff
    on(head, ell(0.0125, 0.0135, 0.008, 10, 7), C.ink, [s * 0.026, 0.402, 0.2]); // eye
    on(head, ell(0.0038, 0.0038, 0.0038, 6, 4), C.spark, [s * 0.0295, 0.409, 0.2095]); // sparkle
  }

  // Lower jaw, hinged so the mouth can open.
  on(jaw, ell(0.017, 0.0105, 0.04), C.creamHi, [0, 0.35, 0.225]);

  // ---------- ears: enormous satin shells, peach lining ----------
  const ears = [
    { s: 1, j: earL },
    { s: -1, j: earR },
  ];
  for (const { s, j } of ears) {
    b.part({ geo: earShell(s), color: C.earGold, at: j });
    b.part({ geo: earLining(s), color: C.peach, at: j });
  }

  // ---------- woven leather collar with a brass bell ----------
  const nAxis = unit(sub(HEAD_C, NECK_A));
  const cc = mix(NECK_A, HEAD_C, 0.22);
  const ringX: V = [1, 0, 0];
  const ringZ = cross(ringX, nAxis); // down-and-forward, toward the throat
  const R = 0.041;

  const band = new THREE.TorusGeometry(R, 0.0075, 8, 26);
  band.rotateX(Math.PI / 2);
  on(neck, alongY(band, nAxis), C.leather, cc);

  const TILES = 14;
  for (let k = 0; k < TILES; k++) {
    const th = (k / TILES) * Math.PI * 2;
    const out = add(mul(ringX, Math.cos(th)), mul(ringZ, Math.sin(th)));
    const tan = add(mul(ringX, -Math.sin(th)), mul(ringZ, Math.cos(th)));
    const g = alongY(new THREE.CapsuleGeometry(0.0042, 0.0045, 2, 6), tan);
    on(neck, g, C.tan, add(cc, mul(out, R + 0.0072)));
  }

  const hang = add(cc, mul(ringZ, R + 0.0085));
  on(neck, new THREE.TorusGeometry(0.0042, 0.0014, 6, 12), C.brass, [
    hang[0],
    hang[1] + 0.0005,
    hang[2],
  ]);
  on(neck, ell(0.0118, 0.0112, 0.0118), C.brass, add(hang, [0, -0.0165, 0.002]));

  // ---------- tail-tip and hip details are done; the kit stands on the dune ----------
  return b.root;
}
