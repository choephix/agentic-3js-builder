A stylized keel-billed toucan, built from faceted primitives, standing about 34 cm tall. I couldn't run this module, and I worked out the call shapes of the following from the reference without confirming them:
- `b.part(geometry, colour, { at, bone })`
- the `parent` and `aim` options on `b.joint`

Chain roles are written into `userData.role` where the joint allows it.

- **Body and markings:** black body with a yellow bib edged by an orange-to-red band below. The nape has a maroon wash and the undertail coverts are red.
- **Eyes:** lime bare-skin patches with blue eye-rings and a white catch-light.
- **Beak:** banded in green, orange and red on top and green, blue and red below, with a ridge along the top and dark notches along the cutting edges. The lower jaw is a separate hinged part on its own `jaw` joint.
- **Wings:** spread sideways in the rest pose, with layered secondary, primary and covert feathers.
- **Legs and feet:** blue, with two toes forward and two back on each foot, ringed scales and claws.
- **Tail:** a three-joint tail with a fan of feather tips.

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "Stylized low-poly keel-billed toucan in a rigging rest pose: rainbow banded beak with separate jaw, yellow bib, lime eye skin, wings spread, zygodactyl blue feet.",
};

type V = [number, number, number];

export default function build() {
  const b: any = createBuilder({ name: "toucan" });

  // ---------- palette ----------
  const BLACK = "#16171d";
  const SHEEN = "#252a3a";
  const SHEEN2 = "#2d3346";
  const DARKF = "#121318";
  const ALT = "#1d1f28";
  const YELLOW = "#ffd23f";
  const YELLOW2 = "#f7b500";
  const YELLOW3 = "#fff0a0";
  const ORANGE_EDGE = "#f49a00";
  const RED = "#d7263d";
  const MAROON = "#5c1e2e";
  const GREEN = "#8bd13f";
  const GREEN_D = "#6aa82c";
  const ORANGE = "#ff8a1f";
  const ORANGE_D = "#e06a0a";
  const BLUE = "#3a8fd6";
  const RED_D = "#7a1020";
  const LIME = "#9be564";
  const EYE = "#1a1a20";
  const WHITE = "#ffffff";
  const LEG = "#4f7cc4";
  const LEG_D = "#3d64a8";
  const CLAW = "#2a2a30";
  const SERR = "#1b1b22";

  // ---------- math helpers ----------
  const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (x: THREE.Vector3): V => [x.x, x.y, x.z];
  const add = (a: number[], c: number[]): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
  const scl = (a: number[], s: number): V => [a[0] * s, a[1] * s, a[2] * s];
  const sub = (a: number[], c: number[]): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const lerpV = (a: number[], c: number[], t: number): V => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];
  const norm = (a: number[]): V => arr(v(a).normalize());

  function basis(dir: number[], side?: number[]) {
    const y = v(dir).normalize();
    let s: THREE.Vector3;
    if (side) s = v(side);
    else if (Math.abs(y.y) > 0.95) s = new THREE.Vector3(1, 0, 0);
    else s = new THREE.Vector3().crossVectors(y, new THREE.Vector3(0, 1, 0));
    const x = s.sub(y.clone().multiplyScalar(s.dot(y))).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    return new THREE.Matrix4().makeBasis(x, y, z);
  }

  function tag(j: any, role: string) {
    try {
      const o = j && (j.bone ?? j.object ?? j);
      if (o && o.userData) o.userData.role = role;
    } catch (e) {
      /* ignore */
    }
  }

  // ---------- part helpers ----------
  function put(geo: THREE.BufferGeometry, color: string, at: number[], bone: any, dir: number[] = [0, 1, 0], side?: number[]) {
    geo.applyMatrix4(basis(dir, side));
    return b.part(geo, color, { at: [at[0], at[1], at[2]], bone });
  }

  // ellipsoid; radii in local frame: x = side, y = along dir, z = third axis
  function blob(at: number[], r: number[], color: string, bone: any, dir: number[] = [0, 1, 0], detail = 1) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    g.scale(r[0], r[1], r[2]);
    return put(g, color, at, bone, dir);
  }

  function seg(
    a: number[],
    c: number[],
    r0: number,
    r1: number,
    color: string,
    bone: any,
    o: { n?: number; sx?: number; sz?: number; side?: number[]; ext?: number } = {}
  ) {
    const d = sub(c, a);
    const len0 = v(d).length();
    const ext = o.ext ?? 0;
    const dn = norm(d);
    const a2 = sub(a, scl(dn, ext));
    const len = len0 + ext;
    const g = new THREE.CylinderGeometry(r1, r0, len, o.n ?? 6, 1);
    g.scale(o.sx ?? 1, 1, o.sz ?? 1);
    return put(g, color, lerpV(a2, c, 0.5), bone, dn, o.side);
  }

  function feather(root: number[], dir: number[], len: number, w: number, th: number, color: string, bone: any) {
    const dn = norm(dir);
    const g = new THREE.CapsuleGeometry(0.5, 1, 2, 6);
    g.scale(w, len / 2, th);
    return put(g, color, add(root, scl(dn, len / 2)), bone, dn);
  }

  function onEllipsoid(c: number[], r: number[], azDeg: number, elDeg: number) {
    const az = (azDeg * Math.PI) / 180;
    const el = (elDeg * Math.PI) / 180;
    const u = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    const p: V = [c[0] + r[0] * u[0], c[1] + r[1] * u[1], c[2] + r[2] * u[2]];
    const n = norm([u[0] / r[0], u[1] / r[1], u[2] / r[2]]);
    return { p, n };
  }

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.13, -0.01] });
  const spine = b.joint("spine", { at: [0, 0.19, 0.015], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.25, 0.045], parent: spine });
  const head = b.joint("head", { at: [0, 0.29, 0.065], parent: neck });
  const headEnd = b.joint("headEnd", { at: [0, 0.262, 0.322], parent: head });
  const jaw = b.joint("jaw", { at: [0, 0.281, 0.11], parent: head });
  const jawTip = b.joint("jawTip", { at: [0, 0.256, 0.298], parent: jaw });
  tag(hips, "spine");
  tag(spine, "spine");
  tag(neck, "neck");
  tag(head, "head");
  tag(headEnd, "head");
  tag(jaw, "jaw");
  tag(jawTip, "jaw");

  const T1: V = [0, 0.14, -0.065];
  const T2: V = [0, 0.112, -0.13];
  const T3: V = [0, 0.086, -0.195];
  const TE: V = [0, 0.062, -0.26];
  const tail1 = b.joint("tail1", { at: T1, parent: hips });
  const tail2 = b.joint("tail2", { at: T2, parent: tail1 });
  const tail3 = b.joint("tail3", { at: T3, parent: tail2 });
  const tailEnd = b.joint("tail4", { at: TE, parent: tail3 });
  [tail1, tail2, tail3, tailEnd].forEach((j) => tag(j, "tail"));

  // ---------- body ----------
  const BODY_C: V = [0, 0.18, 0.01];
  const BODY_R: V = [0.071, 0.094, 0.083];
  blob(BODY_C, BODY_R, BLACK, spine);
  blob([0, 0.2, -0.02], [0.06, 0.08, 0.06], ALT, spine);
  blob([0, 0.255, 0.045], [0.05, 0.05, 0.05], BLACK, neck);
  blob([0, 0.3, 0.07], [0.044, 0.044, 0.05], BLACK, head);
  blob([0, 0.307, 0.04], [0.042, 0.036, 0.03], MAROON, head);
  blob([0, 0.335, 0.062], [0.03, 0.012, 0.03], MAROON, head);

  // bib
  const BIB_C: V = [0, 0.235, 0.065];
  const BIB_R: V = [0.05, 0.055, 0.032];
  blob(BIB_C, BIB_R, YELLOW, neck);
  blob([0, 0.275, 0.088], [0.038, 0.03, 0.026], YELLOW, head);
  for (const s of [1, -1]) blob([s * 0.026, 0.288, 0.098], [0.018, 0.02, 0.016], YELLOW, head);
  blob([0, 0.2, 0.075], [0.048, 0.012, 0.025], ORANGE_EDGE, spine);
  blob([0, 0.188, 0.079], [0.046, 0.0065, 0.022], RED, spine);

  // bib feather scallops
  const scallopRows: [number, number[]][] = [
    [-28, [-40, -14, 14, 40]],
    [-6, [-28, 0, 28]],
    [16, [-14, 14]],
  ];
  let k = 0;
  for (const [el, azs] of scallopRows) {
    for (const az of azs) {
      const h = onEllipsoid(BIB_C, BIB_R, az, el);
      blob(add(h.p, scl(h.n, 0.001)), [0.011, 0.003, 0.008], k++ % 2 ? YELLOW2 : YELLOW3, neck, h.n, 0);
    }
  }

  // back / belly scallops
  for (const el of [5, 30]) {
    for (const az of [130, 155, 180, 205, 230]) {
      const h = onEllipsoid(BODY_C, BODY_R, az, el);
      blob(add(h.p, scl(h.n, 0.001)), [0.018, 0.003, 0.013], el > 10 ? SHEEN : ALT, spine, h.n, 0);
    }
  }
  for (const az of [-25, 0, 25]) {
    const h = onEllipsoid(BODY_C, BODY_R, az, -30);
    blob(add(h.p, scl(h.n, 0.001)), [0.016, 0.003, 0.012], ALT, spine, h.n, 0);
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const sd: V = [s, 0, 0];
    blob([s * 0.036, 0.31, 0.095], [0.02, 0.008, 0.017], LIME, head, sd);
    const tor = new THREE.TorusGeometry(0.0088, 0.0018, 5, 10);
    tor.rotateX(Math.PI / 2);
    put(tor, BLUE, [s * 0.043, 0.311, 0.096], head, sd);
    blob([s * 0.043, 0.311, 0.096], [0.0075, 0.0075, 0.0075], EYE, head, sd);
    blob([s * 0.049, 0.315, 0.099], [0.0022, 0.0022, 0.0022], WHITE, head, sd, 0);
    // lime brow fleck
    blob([s * 0.035, 0.326, 0.1], [0.008, 0.003, 0.004], LIME, head, sd, 0);
  }

  // ---------- beak ----------
  const UP: V[] = [
    [0, 0.306, 0.106],
    [0, 0.304, 0.125],
    [0, 0.299, 0.2],
    [0, 0.288, 0.265],
    [0, 0.274, 0.302],
    [0, 0.262, 0.322],
  ];
  const UR = [0.022, 0.022, 0.019, 0.014, 0.007, 0.0015];
  const UC = [BLACK, GREEN, ORANGE, RED, RED_D];
  const UCD = [BLACK, GREEN_D, ORANGE_D, RED_D, RED_D];
  const USX = 0.78;
  const USZ = 1.35;
  for (let i = 0; i < UP.length - 1; i++) {
    seg(UP[i], UP[i + 1], UR[i], UR[i + 1], UC[i], head, { n: 6, sx: USX, sz: USZ, ext: i > 0 ? 0.004 : 0 });
    // keel ridge on top
    if (i > 0 && i < 4) {
      const a = add(UP[i], [0, UR[i] * USZ * 0.97, 0]);
      const c = add(UP[i + 1], [0, UR[i + 1] * USZ * 0.97, 0]);
      seg(a, c, 0.0035, 0.0025, UCD[i], head, { n: 4, sx: 0.6, ext: 0.003 });
    }
  }
  // nostril slits
  for (const s of [1, -1]) blob([s * 0.009, 0.33, 0.121], [0.002, 0.006, 0.002], SERR, head, [0, 0, 1], 0);

  function upperAt(z: number) {
    for (let i = 0; i < UP.length - 1; i++) {
      if (z >= UP[i][2] && z <= UP[i + 1][2]) {
        const t = (z - UP[i][2]) / (UP[i + 1][2] - UP[i][2]);
        return { y: UP[i][1] + (UP[i + 1][1] - UP[i][1]) * t, r: UR[i] + (UR[i + 1] - UR[i]) * t };
      }
    }
    return { y: UP[UP.length - 1][1], r: UR[UR.length - 1] };
  }
  // serrated cutting edges
  for (let z = 0.135; z <= 0.29; z += 0.014) {
    const { y, r } = upperAt(z);
    for (const s of [1, -1]) {
      const g = new THREE.ConeGeometry(0.0026, 0.007, 4);
      put(g, SERR, [s * r * USX * 0.62, y - r * USZ * 0.78, z], head, [0, -1, 0.15]);
    }
  }

  const LP: V[] = [
    [0, 0.279, 0.108],
    [0, 0.276, 0.125],
    [0, 0.271, 0.2],
    [0, 0.262, 0.262],
    [0, 0.256, 0.298],
  ];
  const LR = [0.017, 0.017, 0.014, 0.009, 0.002];
  const LC = [BLACK, GREEN, BLUE, RED];
  for (let i = 0; i < LP.length - 1; i++) {
    seg(LP[i], LP[i + 1], LR[i], LR[i + 1], LC[i], jaw, { n: 6, sx: 0.76, sz: 1.0, ext: i > 0 ? 0.004 : 0 });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const SH: V = [s * 0.055, 0.225, 0];
    const EL: V = [s * 0.145, 0.228, -0.006];
    const WR: V = [s * 0.235, 0.23, -0.008];
    const TP: V = [s * 0.32, 0.228, 0];
    const jSh = b.joint("shoulder" + side, { at: SH, parent: spine });
    const jEl = b.joint("elbow" + side, { at: EL, parent: jSh });
    const jWr = b.joint("wrist" + side, { at: WR, parent: jEl });
    const jTp = b.joint("wingTip" + side, { at: TP, parent: jWr });
    [jSh, jEl, jWr, jTp].forEach((j) => tag(j, "wing"));

    seg(SH, EL, 0.02, 0.017, BLACK, jSh, { n: 6, sz: 0.5 });
    seg(EL, WR, 0.016, 0.012, BLACK, jEl, { n: 6, sz: 0.5, ext: 0.004 });
    seg(WR, TP, 0.011, 0.006, BLACK, jWr, { n: 6, sz: 0.5, ext: 0.004 });
    blob(EL, [0.017, 0.017, 0.01], BLACK, jEl, [s, 0, 0], 0);
    blob(WR, [0.013, 0.013, 0.008], BLACK, jWr, [s, 0, 0], 0);

    // secondaries
    for (let i = 0; i < 7; i++) {
      const x = 0.075 + i * 0.024;
      const root: V = [s * x, 0.222, -0.006];
      const dir: V = [s * (0.05 + i * 0.04), -0.08, -1];
      feather(root, dir, 0.1 + i * 0.004, 0.032, 0.006, i % 2 ? ALT : BLACK, x < 0.145 ? jSh : jEl);
    }
    // primaries
    for (let j = 0; j < 6; j++) {
      const t = j / 5;
      const root = lerpV(WR, TP, t);
      const ang = 0.35 + t * 1.05;
      const dir: V = [s * Math.sin(ang), -0.05, -Math.cos(ang)];
      feather([root[0], root[1] - 0.003, root[2]], dir, 0.12 + t * 0.035, 0.03, 0.006, j % 2 ? DARKF : BLACK, jWr);
    }
    // greater coverts
    for (let i = 0; i < 9; i++) {
      const x = 0.07 + i * 0.026;
      const root: V = [s * x, 0.232, -0.002];
      const dir: V = [s * (0.15 + i * 0.05), -0.06, -1];
      const bone = x < 0.145 ? jSh : x < 0.235 ? jEl : jWr;
      feather(root, dir, 0.055, 0.03, 0.006, SHEEN, bone);
    }
    // lesser coverts
    for (let i = 0; i < 7; i++) {
      const x = 0.075 + i * 0.026;
      const root: V = [s * x, 0.237, 0.004];
      const dir: V = [s * (0.1 + i * 0.05), -0.05, -1];
      const bone = x < 0.145 ? jSh : x < 0.235 ? jEl : jWr;
      feather(root, dir, 0.032, 0.026, 0.006, SHEEN2, bone);
    }
  }

  // ---------- tail ----------
  const tailBones = [tail1, tail2, tail3];
  const TP_ = [T1, T2, T3, TE];
  const TW = [0.06, 0.07, 0.078];
  for (let i = 0; i < 3; i++) {
    const a = TP_[i];
    const c = TP_[i + 1];
    const d = sub(c, a);
    const len = v(d).length() + 0.008;
    const g = new THREE.BoxGeometry(TW[i], len, 0.014);
    put(g, BLACK, lerpV(a, c, 0.5), tailBones[i], d);
    // feather separation lines on top
    for (let q = -2; q <= 2; q++) {
      const lg = new THREE.BoxGeometry(0.0025, len * 0.95, 0.0025);
      put(lg, SHEEN, add(lerpV(a, c, 0.5), [q * TW[i] * 0.18, 0.0075, 0]), tailBones[i], d);
    }
  }
  const tdir = norm(sub(TE, T3));
  for (let q = 0; q < 6; q++) {
    const off = q - 2.5;
    const root = add(TE, [off * 0.0135, 0, 0]);
    const dir = norm(add(tdir, [off * 0.05, 0, 0]));
    feather(sub(root, scl(dir, 0.012)), dir, 0.045 - Math.abs(off) * 0.003, 0.02, 0.009, q % 2 ? BLACK : ALT, tail3);
  }
  // uppertail coverts
  for (let q = -1; q <= 1; q++) {
    feather([q * 0.02, 0.158, -0.045], [q * 0.15, -0.35, -1], 0.065, 0.028, 0.007, SHEEN, tail1);
  }
  // red undertail coverts
  blob([0, 0.115, -0.055], [0.032, 0.045, 0.02], RED, hips, [0, -0.4, -1]);
  for (let q = -1; q <= 1; q++) {
    feather([q * 0.016, 0.108, -0.07], [q * 0.2, -0.45, -1], 0.05, 0.02, 0.008, RED, tail1);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const HP: V = [s * 0.035, 0.12, 0];
    const KN: V = [s * 0.044, 0.078, 0.028];
    const AN: V = [s * 0.044, 0.052, 0.004];
    const FT: V = [s * 0.044, 0.013, 0.014];
    const jHip = b.joint("hip" + side, { at: HP, parent: hips });
    const jKnee = b.joint("knee" + side, { at: KN, parent: jHip });
    const jAnk = b.joint("ankle" + side, { at: AN, parent: jKnee });
    const jFoot = b.joint("foot" + side, { at: FT, parent: jAnk });
    [jHip, jKnee, jAnk, jFoot].forEach((j) => tag(j, "leg"));

    blob(lerpV(HP, KN, 0.5), [0.022, 0.032, 0.021], BLACK, jHip, sub(KN, HP));
    seg(KN, AN, 0.014, 0.009, ALT, jKnee, { n: 6 });
    blob(AN, [0.008, 0.008, 0.008], LEG, jAnk, [0, 1, 0], 0);
    seg(AN, FT, 0.0075, 0.0065, LEG, jAnk, { n: 6 });
    for (const t of [0.3, 0.55, 0.8]) {
      const g = new THREE.CylinderGeometry(0.0085, 0.0085, 0.0025, 6);
      put(g, LEG_D, lerpV(AN, FT, t), jAnk, sub(FT, AN));
    }
    blob(FT, [0.0085, 0.006, 0.0085], LEG, jFoot, [0, 1, 0], 0);

    const toeTips: V[] = [
      add(FT, [-s * 0.01, 0, 0.035]),
      add(FT, [s * 0.015, 0, 0.033]),
      add(FT, [s * 0.015, 0, -0.026]),
      add(FT, [-s * 0.008, 0, -0.028]),
    ];
    toeTips.forEach((tp, i) => {
      tp[1] = 0.004;
      const d = norm(sub(tp, FT));
      const base = add(FT, scl(d, 0.006));
      const jt = b.joint("toe" + (i + 1) + side, { at: base, aim: tp, parent: jFoot });
      tag(jt, "digit");
      seg(FT, tp, 0.005, 0.004, LEG, jt, { n: 5 });
      blob(tp, [0.0045, 0.0045, 0.0045], LEG, jt, [0, 1, 0], 0);
      const cd = norm([d[0], -0.5, d[2]]);
      const cg = new THREE.ConeGeometry(0.0028, 0.009, 5);
      put(cg, CLAW, add(tp, scl(cd, 0.0045)), jt, cd);
    });
  }

  return b.root;
}
```