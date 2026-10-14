import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Fennec Kit at Dusk",
  description:
    "A stylized fennec fox kit standing alert on a little sand dune: enormous satin ears lined in peach, cream fur warming to sandy gold, a fluffy black-tipped tail, oversized paws, big sparkling eyes and a woven leather collar with a brass bell.",
};

type V = number[];
const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => mul(a, 1 / (len(a) || 1));
const mix = (a: V, c: V, t: number): V => add(a, mul(sub(c, a), t));
const mirror = (p: V): V => [-p[0], p[1], p[2]];

const C = {
  cream: "#f6e7cc",
  belly: "#fdf6ea",
  sand: "#e9c48a",
  gold: "#d69b4f",
  deepGold: "#b8742f",
  peach: "#f8c3a6",
  peachDeep: "#ee9c84",
  eye: "#3a2116",
  pupil: "#0c0706",
  white: "#ffffff",
  nose: "#1f1512",
  tear: "#6b4128",
  whisker: "#3b2a22",
  claw: "#5b4636",
  smudge: "#5a3826",
  tipBlack: "#231a17",
  leather: "#7a4526",
  leatherLight: "#ad6c3c",
  leatherDark: "#4e2a17",
  brass: "#d6a63a",
  brassLight: "#f6dc82",
  brassDark: "#3a2a12",
  duneMain: "#e2a46c",
  duneBase: "#c27a5e",
  duneFar: "#cf8c62",
  duneLight: "#f4c891",
  duneDark: "#b86e52",
  print: "#c47f55",
  pebble: "#8e6b5c",
  pebble2: "#a9877a",
  grass: "#a8975a",
  grassDark: "#6f6a3a",
};

// shape a geometry in model space before it is placed: scale, then rotate Z, X, Y
function G(geo: THREE.BufferGeometry, o: { s?: V; rz?: number; rx?: number; ry?: number } = {}) {
  if (o.s) geo.scale(o.s[0], o.s[1], o.s[2]);
  if (o.rz) geo.rotateZ(o.rz);
  if (o.rx) geo.rotateX(o.rx);
  if (o.ry) geo.rotateY(o.ry);
  return geo;
}
// turn a geometry's +Y onto a unit direction n
function orient(geo: THREE.BufferGeometry, n: V) {
  const d = norm(n);
  geo.rotateZ(-Math.asin(Math.max(-1, Math.min(1, d[0]))));
  geo.rotateX(Math.atan2(d[2], d[1]));
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "fennecKit" });
  const B: any = b;

  const J = (name: string, at: V, parent?: any, aimAt?: V) => {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (aimAt) o.aim = aimAt;
    return B.joint(name, o);
  };
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone?: any) => {
    const o: any = { at };
    if (bone) o.bone = bone;
    return B.part(geo, color, o);
  };
  const ell = (r: number, s: V, color: string, at: V, bone?: any, ws = 8, hs = 6) =>
    P(G(new THREE.SphereGeometry(r, ws, hs), { s }), color, at, bone);
  // capsule between two points
  const seg = (a: V, c: V, r: number, color: string, bone?: any, s: V = [1, 1, 1], radial = 7) => {
    const L = len(sub(c, a));
    const geo = new THREE.CapsuleGeometry(r, Math.max(L, 0.001), 3, radial);
    geo.scale(s[0], s[1], s[2]);
    orient(geo, sub(c, a));
    return P(geo, color, mix(a, c, 0.5), bone);
  };
  // elongated fluff ellipsoid between two points
  const puff = (a: V, c: V, r: number, stretch: number, color: string, bone?: any) => {
    const geo = new THREE.SphereGeometry(r, 7, 5);
    geo.scale(1, stretch, 1);
    orient(geo, sub(c, a));
    return P(geo, color, mix(a, c, 0.5), bone);
  };
  // cone standing at base, pointing along dir
  const cone = (base: V, dir: V, r: number, h: number, color: string, bone?: any, seg = 5, flat = 1) => {
    const geo = new THREE.ConeGeometry(r, h, seg);
    geo.scale(1, 1, flat);
    orient(geo, dir);
    return P(geo, color, add(base, mul(norm(dir), h / 2)), bone);
  };

  // ---------------- skeleton ----------------
  const root = J("root", [0, 0, 0]);
  const hips = J("hips", [0, 0.2, -0.055], root, [0, 0.212, 0.04]);
  const spine = J("spine", [0, 0.212, 0.04], hips, [0, 0.235, 0.075]);
  const neck = J("neck", [0, 0.235, 0.075], spine, [0, 0.285, 0.105]);
  const head = J("head", [0, 0.285, 0.105], neck, [0, 0.33, 0.12]);
  const jaw = J("jaw", [0, 0.283, 0.14], head, [0, 0.278, 0.182]);

  const earDirL = norm([0.45, 0.88, -0.12]);
  const earBaseL: V = [0.026, 0.325, 0.105];
  const earLen = 0.112;
  const earL = J("earL", earBaseL, head, add(earBaseL, mul(earDirL, earLen)));
  const earDirR: V = [-earDirL[0], earDirL[1], earDirL[2]];
  const earBaseR = mirror(earBaseL);
  const earR = J("earR", earBaseR, head, add(earBaseR, mul(earDirR, earLen)));

  // front legs
  const fShoulder: V = [0.032, 0.2, 0.055];
  const fElbow: V = [0.035, 0.15, 0.062];
  const fWrist: V = [0.036, 0.115, 0.064];
  const fPaw: V = [0.037, 0.106, 0.072];
  // hind legs
  const hHip: V = [0.038, 0.205, -0.06];
  const hKnee: V = [0.044, 0.15, -0.035];
  const hHock: V = [0.044, 0.122, -0.075];
  const hAnkle: V = [0.044, 0.11, -0.066];
  const hPaw: V = [0.044, 0.106, -0.056];

  const legs: any = {};
  for (const side of ["L", "R"]) {
    const m = (p: V) => (side === "L" ? p : mirror(p));
    const sh = J("shoulder" + side, m(fShoulder), spine, m(fElbow));
    const el = J("elbow" + side, m(fElbow), sh, m(fWrist));
    const wr = J("wrist" + side, m(fWrist), el, m(fPaw));
    const hp = J("hip" + side, m(hHip), hips, m(hKnee));
    const kn = J("knee" + side, m(hKnee), hp, m(hHock));
    const hk = J("hock" + side, m(hHock), kn, m(hAnkle));
    const ft = J("foot" + side, m(hAnkle), hk, m(hPaw));
    legs[side] = { sh, el, wr, hp, kn, hk, ft, m };
  }

  const tailPts: V[] = [
    [0, 0.195, -0.105],
    [0, 0.17, -0.16],
    [0, 0.155, -0.215],
    [0, 0.152, -0.265],
    [0, 0.16, -0.31],
  ];
  const tail1 = J("tail1", tailPts[0], hips, tailPts[1]);
  const tail2 = J("tail2", tailPts[1], tail1, tailPts[2]);
  const tail3 = J("tail3", tailPts[2], tail2, tailPts[3]);
  const tail4 = J("tail4", tailPts[3], tail3, tailPts[4]);
  const tails = [tail1, tail2, tail3, tail4];

  // ---------------- dune ----------------
  const hemi = (R: number, ws: number, hs: number) =>
    new THREE.SphereGeometry(R, ws, hs, 0, Math.PI * 2, 0, Math.PI / 2);
  const DUNE_R = 0.42;
  const DUNE_H = 0.1;
  const duneY = (d: number) => DUNE_H * Math.sqrt(Math.max(0, 1 - (d / DUNE_R) ** 2));

  P(G(hemi(0.56, 16, 4), { s: [1, 0.09, 0.9] }), C.duneBase, [0, 0, -0.02], root);
  P(G(hemi(DUNE_R, 18, 8), { s: [1, DUNE_H / DUNE_R, 0.95] }), C.duneMain, [0, 0, 0], root);
  P(G(hemi(0.2, 12, 5), { s: [1.2, 0.35, 0.9] }), C.duneFar, [-0.3, 0, -0.27], root);
  P(G(hemi(0.13, 10, 4), { s: [1, 0.3, 1.1] }), C.duneFar, [0.33, 0, 0.22], root);

  // wind ripples: flat arcs half buried in the slope
  const ripples: [number, number, number, string][] = [
    [0.19, 0.3, 1.6, C.duneDark],
    [0.205, 0.32, 1.4, C.duneLight],
    [0.26, 2.2, 1.7, C.duneDark],
    [0.275, 2.25, 1.5, C.duneLight],
    [0.33, 4.0, 1.8, C.duneDark],
    [0.345, 4.05, 1.5, C.duneLight],
    [0.3, 5.3, 1.2, C.duneDark],
  ];
  for (const [rho, rot, arc, col] of ripples) {
    const geo = G(new THREE.TorusGeometry(rho, 0.004, 3, 18, arc), { rx: Math.PI / 2, ry: rot });
    geo.scale(1, 1, 0.95);
    P(geo, col, [0, duneY(rho) + 0.001, 0], root);
  }

  // pebbles (golden-angle spread, deterministic)
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39996 + 0.6;
    const d = 0.24 + ((i * 0.37) % 1) * 0.14;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d * 0.95;
    const r = 0.007 + (i % 3) * 0.003;
    P(
      G(new THREE.IcosahedronGeometry(r, 0), { s: [1.2, 0.7, 1], ry: a }),
      i % 2 ? C.pebble : C.pebble2,
      [x, duneY(d) + r * 0.2, z],
      root
    );
  }

  // little dry grass tufts
  const tuft = (cx: number, cz: number, n: number) => {
    const d = Math.hypot(cx, cz);
    const y = duneY(d) - 0.004;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const lean = 0.35 + (i % 3) * 0.12;
      const dir: V = [Math.cos(a) * lean, 1, Math.sin(a) * lean];
      const h = 0.05 + (i % 4) * 0.012;
      cone([cx + Math.cos(a) * 0.006, y, cz + Math.sin(a) * 0.006], dir, 0.003, h, i % 2 ? C.grass : C.grassDark, root, 3);
    }
  };
  tuft(0.27, 0.13, 7);
  tuft(-0.24, 0.2, 5);
  tuft(-0.33, -0.22, 6);

  // paw-print trail leading up the dune behind the kit
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = 0.12 + t * 0.2 + (i % 2 ? 0.02 : -0.02);
    const z = -0.12 - t * 0.2;
    const d = Math.hypot(x, z);
    if (d > 0.4) continue;
    const yy = duneY(d) - 0.0015;
    P(G(new THREE.SphereGeometry(0.011, 6, 3), { s: [1, 0.25, 1.3], ry: 0.6 }), C.print, [x, yy, z], root);
    for (let k = -1; k <= 1; k++)
      P(G(new THREE.SphereGeometry(0.004, 5, 3), { s: [1, 0.3, 1] }), C.print, [x + k * 0.006, yy, z + 0.013], root);
  }

  // ---------------- body ----------------
  const bodyC: V = [0, 0.205, -0.01];
  P(G(new THREE.CapsuleGeometry(0.05, 0.1, 3, 9), { s: [0.88, 1, 1], rx: Math.PI / 2 }), C.cream, bodyC, spine);
  P(G(new THREE.CapsuleGeometry(0.047, 0.1, 3, 9), { s: [0.92, 0.9, 1.0], rx: Math.PI / 2 }), C.sand, add(bodyC, [0, 0.011, -0.002]), spine);
  P(G(new THREE.CapsuleGeometry(0.04, 0.095, 3, 9), { s: [0.95, 0.9, 1.0], rx: Math.PI / 2 }), C.gold, add(bodyC, [0, 0.025, -0.006]), spine);
  seg([0, 0.262, 0.04], [0, 0.258, -0.08], 0.01, C.deepGold, spine, [1.2, 1, 0.6]);
  // belly + chest fluff
  ell(0.04, [0.8, 0.5, 1.4], C.belly, [0, 0.17, 0.0], spine);
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 1.6;
    const base: V = [Math.sin(a) * 0.026, 0.215 - Math.abs(a) * 0.01, 0.072 + Math.cos(a) * 0.006];
    cone(base, [Math.sin(a) * 0.4, -1, 0.55], 0.008, 0.03 - Math.abs(a) * 0.004, i % 2 ? C.belly : C.white, spine, 4);
  }
  // rump tufts
  ell(0.03, [1.1, 0.8, 0.8], C.gold, [0, 0.215, -0.085], hips);

  // ---------------- neck + collar ----------------
  seg([0, 0.225, 0.06], [0, 0.29, 0.105], 0.03, C.cream, neck, [0.95, 1, 1]);
  seg([0, 0.24, 0.05], [0, 0.305, 0.095], 0.025, C.gold, neck, [0.9, 1, 0.9]);

  const collarC: V = [0, 0.254, 0.08];
  const n: V = norm([0, 0.065, 0.045]);
  const u: V = [1, 0, 0];
  const v: V = [0, -n[2], n[1]];
  P(G(new THREE.TorusGeometry(0.031, 0.0055, 4, 20), { rx: -Math.atan2(n[1], n[2]) }), C.leatherDark, collarC, neck);
  const N = 18;
  for (let row = -1; row <= 1; row += 2) {
    for (let i = 0; i < N; i++) {
      const a = ((i + (row > 0 ? 0.5 : 0)) / N) * Math.PI * 2;
      const p = add(add(collarC, mul(n, row * 0.0035)), add(mul(u, Math.cos(a) * 0.0335), mul(v, Math.sin(a) * 0.0335)));
      P(G(new THREE.SphereGeometry(0.0042, 5, 4), { s: [1.2, 0.8, 1.2] }), (i + (row > 0 ? 1 : 0)) % 2 ? C.leather : C.leatherLight, p, neck);
    }
  }
  // bell
  const ringPt = add(collarC, mul(v, 0.034));
  P(G(new THREE.TorusGeometry(0.0042, 0.0013, 4, 8), { ry: Math.PI / 2 }), C.brass, add(ringPt, [0, -0.004, 0.002]), neck);
  const bell: V = add(ringPt, [0, -0.013, 0.006]);
  ell(0.0095, [1, 1, 1], C.brass, bell, neck, 8, 6);
  P(new THREE.CylinderGeometry(0.0108, 0.0108, 0.004, 8), C.brass, add(bell, [0, -0.005, 0]), neck);
  P(new THREE.BoxGeometry(0.013, 0.0016, 0.022), C.brassDark, add(bell, [0, -0.007, 0]), neck);
  ell(0.0028, [1, 1, 1], C.brassDark, add(bell, [0, -0.0095, 0.002]), neck, 5, 4);
  ell(0.0028, [1, 1, 0.6], C.brassLight, add(bell, [-0.004, 0.004, 0.008]), neck, 5, 4);
  ell(0.0012, [1, 1, 1], C.white, add(bell, [-0.0045, 0.0055, 0.0095]), neck, 4, 3);

  // ---------------- head ----------------
  const H: V = [0, 0.3, 0.115];
  ell(0.045, [1.05, 0.92, 1], C.cream, H, head, 10, 8);
  ell(0.043, [1.0, 0.85, 0.95], C.gold, add(H, [0, 0.009, -0.008]), head, 10, 8);
  ell(0.012, [1.1, 0.5, 1.4], C.gold, [0, 0.326, 0.142], head, 7, 5);
  // muzzle (upper jaw)
  P(G(new THREE.ConeGeometry(0.025, 0.05, 7), { s: [1, 1, 0.75], rx: Math.PI / 2 }), C.belly, [0, 0.29, 0.165], head);
  seg([0, 0.307, 0.145], [0, 0.297, 0.18], 0.005, C.sand, head, [1.4, 1, 0.7]);
  ell(0.0068, [1.25, 0.8, 0.9], C.nose, [0, 0.292, 0.19], head, 7, 5);
  ell(0.0017, [1.4, 1, 1], C.white, [-0.002, 0.2965, 0.1945], head, 4, 3);
  // lower jaw
  P(G(new THREE.ConeGeometry(0.017, 0.042, 6), { s: [1, 1, 0.5], rx: Math.PI / 2 }), C.white, [0, 0.278, 0.161], jaw);
  ell(0.004, [1.6, 0.4, 0.8], C.peachDeep, [0, 0.282, 0.178], jaw, 5, 3);

  // eyes, brows, tear lines, cheeks, whiskers
  for (const s of [1, -1]) {
    const m = (p: V): V => [p[0] * s, p[1], p[2]];
    ell(0.0145, [1, 1.12, 0.72], C.pupil, m([0.021, 0.304, 0.15]), head, 9, 7);
    ell(0.0125, [1, 1.1, 0.65], C.eye, m([0.021, 0.304, 0.153]), head, 9, 7);
    ell(0.0078, [1, 1.1, 0.6], C.pupil, m([0.0215, 0.3035, 0.1585]), head, 7, 5);
    ell(0.0036, [1, 1, 0.6], C.white, m([0.025, 0.3095, 0.1615]), head, 5, 4);
    ell(0.0016, [1, 1, 0.6], C.white, m([0.0175, 0.2985, 0.161]), head, 4, 3);
    ell(0.01, [1.2, 0.45, 0.8], C.belly, m([0.024, 0.322, 0.143]), head, 6, 4);
    seg(m([0.015, 0.295, 0.158]), m([0.009, 0.287, 0.176]), 0.0018, C.tear, head, [1, 1, 1], 4);
    cone(m([0.032, 0.288, 0.125]), m([1, -0.6, 0.15]), 0.011, 0.028, C.white, head, 4);
    cone(m([0.03, 0.278, 0.118]), m([0.9, -0.9, 0.05]), 0.009, 0.022, C.belly, head, 4);
    for (let k = 0; k < 3; k++) {
      const geo = new THREE.CylinderGeometry(0.0007, 0.0004, 0.045, 3);
      const dir: V = [s, 0.18 - k * 0.18, 0.12 - k * 0.05];
      orient(geo, dir);
      P(geo, C.whisker, add(m([0.012, 0.29 - k * 0.003, 0.176]), mul(norm(dir), 0.022)), head);
    }
  }

  // ears
  for (const [ear, base, dir, s] of [
    [earL, earBaseL, earDirL, 1],
    [earR, earBaseR, earDirR, -1],
  ] as [any, V, V, number][]) {
    const at = (t: number, fwd: number) => add(add(base, mul(dir, earLen * t)), [0, 0, fwd]);
    const flat = (geo: THREE.BufferGeometry, z: number) => (geo.scale(1, 1, z), orient(geo, dir));
    P(flat(new THREE.ConeGeometry(0.041, earLen, 8), 0.38), C.sand, at(0.5, 0), ear);
    P(flat(new THREE.ConeGeometry(0.032, earLen * 0.85, 8), 0.28), C.peach, at(0.46, 0.0075), ear);
    P(flat(new THREE.ConeGeometry(0.016, earLen * 0.62, 6), 0.25), C.peachDeep, at(0.38, 0.0105), ear);
    P(flat(new THREE.ConeGeometry(0.009, earLen * 0.18, 5), 0.6), C.deepGold, at(0.92, 0), ear);
    // satin fur fringe along the inner base
    for (let k = -1; k <= 1; k++) {
      const p = add(at(0.1, 0.013), [k * 0.011 * s, 0, 0]);
      cone(p, add(dir, [-k * 0.3 * s, 0, 0.25]), 0.0055, 0.032 - Math.abs(k) * 0.006, C.white, ear, 4);
    }
  }

  // ---------------- legs ----------------
  for (const side of ["L", "R"]) {
    const L = legs[side];
    const m = L.m as (p: V) => V;
    // front
    seg(m(fShoulder), m(fElbow), 0.018, C.sand, L.sh);
    seg(m(fElbow), m(fWrist), 0.0135, C.cream, L.el);
    ell(0.021, [1, 0.55, 1.25], C.cream, m(fPaw), L.wr, 9, 6);
    for (let k = -1; k <= 1; k++) {
      ell(0.0078, [1, 0.8, 1.1], C.belly, m([fPaw[0] + k * 0.0095, 0.101, fPaw[2] + 0.017]), L.wr, 6, 4);
      P(G(new THREE.ConeGeometry(0.0018, 0.006, 4), { rx: Math.PI / 2 }), C.claw, m([fPaw[0] + k * 0.0095, 0.0985, fPaw[2] + 0.026]), L.wr);
    }
    // hind
    ell(0.031, [0.7, 1, 1.05], C.gold, m([0.04, 0.19, -0.062]), L.hp, 8, 6);
    seg(m(hHip), m(hKnee), 0.017, C.sand, L.hp);
    seg(m(hKnee), m(hHock), 0.0125, C.sand, L.kn);
    seg(m(hHock), m(hAnkle), 0.011, C.cream, L.hk);
    ell(0.021, [1, 0.55, 1.25], C.cream, m(hPaw), L.ft, 9, 6);
    for (let k = -1; k <= 1; k++) {
      ell(0.0078, [1, 0.8, 1.1], C.belly, m([hPaw[0] + k * 0.0095, 0.101, hPaw[2] + 0.017]), L.ft, 6, 4);
      P(G(new THREE.ConeGeometry(0.0018, 0.006, 4), { rx: Math.PI / 2 }), C.claw, m([hPaw[0] + k * 0.0095, 0.0985, hPaw[2] + 0.026]), L.ft);
    }
    // little sand drifts kicked up around each paw
    for (const pp of [fPaw, hPaw]) {
      const q = m(pp);
      const d = Math.hypot(q[0], q[2]);
      P(G(new THREE.SphereGeometry(0.026, 9, 3), { s: [1, 0.18, 1.1] }), C.duneLight, [q[0], duneY(d) - 0.002, q[2]], root);
    }
  }

  // ---------------- tail ----------------
  const tailR = [0.022, 0.028, 0.03, 0.026];
  const tailCol = [C.gold, C.sand, C.sand, C.cream];
  for (let i = 0; i < 4; i++) {
    puff(tailPts[i], tailPts[i + 1], tailR[i], 1.55, tailCol[i], tails[i]);
  }
  puff(tailPts[0], tailPts[2], 0.016, 2.4, C.deepGold, tail1);
  puff(mix(tailPts[3], tailPts[4], 0.35), tailPts[4], 0.025, 1.3, C.smudge, tail4);
  const tip = add(tailPts[4], [0, 0.002, -0.006]);
  ell(0.02, [1, 0.95, 1.25], C.tipBlack, tip, tail4, 7, 5);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const dir: V = [Math.cos(a) * 0.5, Math.sin(a) * 0.5, -1];
    cone(add(tip, [0, 0, -0.008]), dir, 0.007, 0.022, C.tipBlack, tail4, 4);
  }
  // fluffy flank tufts along the tail
  for (let i = 0; i < 3; i++) {
    const p = mix(tailPts[1], tailPts[3], i / 2);
    for (const s of [1, -1]) cone(add(p, [s * 0.02, 0, 0]), [s, 0.2, -0.6], 0.008, 0.022, i === 2 ? C.cream : C.sand, tails[1 + i], 4);
  }

  return b.root;
}
