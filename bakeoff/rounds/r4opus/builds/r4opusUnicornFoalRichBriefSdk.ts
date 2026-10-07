import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A newborn unicorn foal on wobbly long legs: pearly white coat with a lilac shimmer, short fluffy pastel mane and tail, a small gold spiral horn, big dark lashed eyes, silver hooves and a daisy chain around its neck.",
};

type P = [number, number, number];
type V3 = THREE.Vector3;

const v = (p: P | V3): V3 =>
  p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
const t3 = (x: V3): P => [x.x, x.y, x.z];
const lerpV = (a: P | V3, c: P | V3, t: number) => v(a).lerp(v(c), t);

// Orthonormal basis: local +Y -> yDir, local +Z -> zHint (orthogonalised)
function basis(yDir: V3, zHint?: V3) {
  const y = yDir.clone().normalize();
  let z = zHint ? zHint.clone() : new THREE.Vector3(0, 0, 1);
  z.addScaledVector(y, -z.dot(y));
  if (z.lengthSq() < 1e-8) {
    z = Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    z.addScaledVector(y, -z.dot(y));
  }
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Matrix4().makeBasis(x, y, z);
}

export default function build() {
  const b = createBuilder({ name: "unicornFoal" });

  const r0: any = rng(20240611);
  const rand = (): number => {
    let x: any;
    if (typeof r0 === "function") x = r0();
    else if (r0 && typeof r0.random === "function") x = r0.random();
    else if (r0 && typeof r0.float === "function") x = r0.float();
    else if (r0 && typeof r0.next === "function") x = r0.next();
    if (x && typeof x === "object") x = x.value;
    return typeof x === "number" ? x : 0.5;
  };
  const jit = (a: number) => (rand() * 2 - 1) * a;

  const C = {
    pearl: "#f8f4fc",
    pearlShade: "#eee6f8",
    lilac: "#e0d1f3",
    lilacDeep: "#cfbcec",
    dapple: "#ebe0f8",
    dappleRose: "#f6e6f1",
    belly: "#e6dbf5",
    blush: "#f8c4d9",
    nose: "#f4c0d2",
    nostril: "#c4859f",
    lip: "#f2d4e2",
    eye: "#3a2552",
    pupil: "#150d21",
    irisGlow: "#7a5bb4",
    white: "#ffffff",
    lash: "#2b1b35",
    earInner: "#f7c4d8",
    gold: "#e2ad45",
    goldLight: "#f7da86",
    goldDeep: "#c48a2a",
    silver: "#c4cad6",
    silverLight: "#e8ebf2",
    pink: "#f8b3cf",
    pinkLight: "#fcd5e5",
    mint: "#a6e8cc",
    mintLight: "#d2f6e6",
    lav: "#c6b2f1",
    lavLight: "#e2d8fb",
    fluff: "#f2eafc",
    daisy: "#fffdf4",
    daisyCore: "#f7c843",
    daisyCoreDeep: "#e3a12c",
    stem: "#79c27c",
    leaf: "#5aa863",
  };
  const fluffCols = [C.pink, C.mint, C.lav];
  const fluffLight: Record<string, string> = {
    [C.pink]: C.pinkLight,
    [C.mint]: C.mintLight,
    [C.lav]: C.lavLight,
  };

  // ---------- primitive helpers (all routed through b.part) ----------
  const part = (geo: THREE.BufferGeometry, color: string, at: P | V3, bone: any) =>
    b.part(geo, color, { at: t3(v(at)), bone });
  const ball = (at: P | V3, r: number, color: string, bone: any, w = 10, h = 8) =>
    part(new THREE.SphereGeometry(r, w, h), color, at, bone);
  const puff = (at: P | V3, r: number, color: string, bone: any) =>
    part(new THREE.IcosahedronGeometry(r, 1), color, at, bone);
  const ell = (at: P | V3, radii: P, color: string, bone: any, rot: P = [0, 0, 0], w = 12, h = 9) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(radii[0], radii[1], radii[2]);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    return part(g, color, at, bone);
  };
  const ellB = (at: P | V3, radii: P, color: string, bone: any, yDir: V3, zHint?: V3, w = 10, h = 7) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(radii[0], radii[1], radii[2]);
    g.applyMatrix4(basis(yDir, zHint));
    return part(g, color, at, bone);
  };
  const seg = (
    a: P | V3,
    c: P | V3,
    r1: number,
    r2: number,
    color: string,
    bone: any,
    radial = 8,
    flat = 1,
    zHint?: V3,
  ) => {
    const A = v(a);
    const B = v(c);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), radial, 1);
    if (flat !== 1) g.scale(1, 1, flat);
    g.applyMatrix4(basis(d, zHint));
    return part(g, color, A.add(B).multiplyScalar(0.5), bone);
  };
  const onEll = (c: P, r: P, d: V3) => {
    const dn = d.clone().normalize();
    const k = 1 / Math.sqrt((dn.x / r[0]) ** 2 + (dn.y / r[1]) ** 2 + (dn.z / r[2]) ** 2);
    const p = v(c).addScaledVector(dn, k);
    const n = new THREE.Vector3(dn.x / (r[0] * r[0]), dn.y / (r[1] * r[1]), dn.z / (r[2] * r[2])).normalize();
    return { p, n };
  };
  const setRole = (j: any, role: string) => {
    try {
      if (j && j.userData) j.userData.role = role;
    } catch (e) {
      /* ignore */
    }
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.2] });
  const spine1 = b.joint("spine1", { at: [0, 0.8, 0.0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.82, 0.18], parent: spine1 });
  const neck1 = b.joint("neck1", { at: [0, 0.88, 0.24], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 1.03, 0.32], parent: neck1 });
  const head = b.joint("head", { at: [0, 1.17, 0.39], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 1.14, 0.45], parent: head });
  const earLJ = b.joint("earL", { at: [0.055, 1.305, 0.375], parent: head });
  const earRJ = b.joint("earR", { at: [-0.055, 1.305, 0.375], parent: head });
  const horn = b.joint("horn", { at: [0, 1.315, 0.465], parent: head });
  const tailPts: P[] = [
    [0, 0.86, -0.355],
    [0, 0.835, -0.47],
    [0, 0.785, -0.565],
    [0, 0.715, -0.635],
  ];
  const tail1 = b.joint("tail1", { at: tailPts[0], parent: hips });
  const tail2 = b.joint("tail2", { at: tailPts[1], parent: tail1 });
  const tail3 = b.joint("tail3", { at: tailPts[2], parent: tail2 });
  const tail4 = b.joint("tail4", { at: tailPts[3], parent: tail3 });
  [hips, spine1, chest].forEach((j) => setRole(j, "spine"));
  [neck1, neck2].forEach((j) => setRole(j, "neck"));
  setRole(head, "head");
  setRole(jaw, "jaw");
  setRole(earLJ, "hinge");
  setRole(earRJ, "hinge");
  setRole(horn, "head");
  [tail1, tail2, tail3, tail4].forEach((j) => setRole(j, "tail"));

  // ---------- body ----------
  const haunchC: P = [0, 0.8, -0.19];
  const haunchR: P = [0.155, 0.16, 0.17];
  ell(haunchC, haunchR, C.pearl, hips, [0, 0, 0], 14, 10);
  const barrelC: P = [0, 0.79, 0.0];
  const barrelR: P = [0.15, 0.15, 0.22];
  ell(barrelC, barrelR, C.pearl, spine1, [0, 0, 0], 14, 10);
  ell([0, 0.705, 0.0], [0.12, 0.08, 0.19], C.belly, spine1, [0, 0, 0], 12, 8);
  const chestC: P = [0, 0.81, 0.19];
  const chestR: P = [0.14, 0.155, 0.15];
  ell(chestC, chestR, C.pearl, chest, [0, 0, 0], 14, 10);
  ell([0, 0.93, 0.12], [0.09, 0.07, 0.13], C.pearl, chest, [0.25, 0, 0], 10, 7);
  ell([0, 0.75, 0.24], [0.1, 0.08, 0.08], C.pearlShade, chest, [0, 0, 0], 10, 7);

  // pearly dapples: the lilac shimmer on rump, flank and shoulder
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const d = new THREE.Vector3(s * (0.45 + rand() * 0.6), -0.25 + rand() * 0.75, -0.15 - rand() * 0.8);
      const { p, n } = onEll(haunchC, haunchR, d);
      const rd = 0.011 + rand() * 0.014;
      ellB(p, [rd, 0.006, rd * 0.85], i % 3 === 0 ? C.dappleRose : C.dapple, hips, n, undefined, 8, 5);
    }
    for (let i = 0; i < 4; i++) {
      const d = new THREE.Vector3(s * (0.7 + rand() * 0.3), -0.1 + rand() * 0.5, -0.35 - rand() * 0.4);
      const { p, n } = onEll(barrelC, barrelR, d);
      const rd = 0.009 + rand() * 0.01;
      ellB(p, [rd, 0.005, rd * 0.85], C.dapple, spine1, n, undefined, 8, 5);
    }
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Vector3(s * (0.8 + rand() * 0.2), 0.1 + rand() * 0.4, 0.2 + rand() * 0.4);
      const { p, n } = onEll(chestC, chestR, d);
      const rd = 0.008 + rand() * 0.008;
      ellB(p, [rd, 0.005, rd * 0.85], C.dappleRose, chest, n, undefined, 8, 5);
    }
  }

  // ---------- neck ----------
  const neckA = v([0, 0.88, 0.22]);
  const neckB = v([0, 1.2, 0.39]);
  const axis = neckB.clone().sub(neckA).normalize();
  const backDir = new THREE.Vector3(0, axis.z, -axis.y); // up-back, perpendicular to neck
  const fwdDown = new THREE.Vector3(0, -axis.z, axis.y); // forward-down
  seg([0, 0.84, 0.2], [0, 1.03, 0.32], 0.105, 0.082, C.pearl, neck1, 12);
  ball([0, 1.03, 0.32], 0.082, C.pearl, neck2, 12, 9);
  seg([0, 1.03, 0.32], [0, 1.19, 0.4], 0.082, 0.07, C.pearl, neck2, 12);
  ell([0, 1.06, 0.37], [0.06, 0.07, 0.05], C.pearlShade, neck2, [0.4, 0, 0], 10, 7); // throat

  // ---------- head ----------
  ell([0, 1.22, 0.42], [0.105, 0.1, 0.115], C.pearl, head, [0, 0, 0], 14, 11);
  for (const s of [1, -1]) {
    ell([0.055 * s, 1.17, 0.44], [0.05, 0.065, 0.075], C.pearl, head, [0, 0, 0], 10, 8); // round cheeks
    const { p, n } = onEll([0.055 * s, 1.17, 0.44], [0.05, 0.065, 0.075], new THREE.Vector3(0.8 * s, -0.15, 0.6));
    ellB(p, [0.024, 0.004, 0.017], C.blush, head, n, new THREE.Vector3(0, 0.3, 1), 10, 5);
  }
  ell([0, 1.155, 0.53], [0.072, 0.06, 0.1], C.pearl, head, [0.55, 0, 0], 12, 9); // muzzle
  ell([0, 1.118, 0.598], [0.062, 0.045, 0.042], C.nose, head, [0.55, 0, 0], 12, 8); // soft nose
  for (const s of [1, -1]) {
    ell([0.024 * s, 1.11, 0.632], [0.008, 0.012, 0.006], C.nostril, head, [0.55, 0, 0.35 * s], 8, 6);
  }
  // lower jaw (separate bone)
  ell([0, 1.098, 0.515], [0.055, 0.032, 0.085], C.pearlShade, jaw, [0.45, 0, 0], 12, 8);
  ell([0, 1.077, 0.582], [0.04, 0.018, 0.026], C.lip, jaw, [0.45, 0, 0], 10, 6);

  // eyes: big, dark, sparkly, with long lashes
  const eye = (s: number) => {
    const ec = v([0.083 * s, 1.225, 0.472]);
    const n = v([0.873 * s, 0.06, 0.485]).normalize();
    const upP = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const fwd = new THREE.Vector3(0, 0, 1).addScaledVector(n, -n.z).addScaledVector(upP, -upP.z).normalize();
    ellB(ec, [0.036, 0.028, 0.046], C.eye, head, n, upP, 14, 10);
    ellB(ec.clone().addScaledVector(n, 0.007), [0.022, 0.024, 0.03], C.pupil, head, n, upP, 12, 8);
    ellB(
      ec.clone().addScaledVector(n, 0.02).addScaledVector(upP, -0.022),
      [0.017, 0.006, 0.008],
      C.irisGlow,
      head,
      n,
      upP,
      10,
      5,
    );
    ball(ec.clone().addScaledVector(n, 0.027).addScaledVector(upP, 0.016).addScaledVector(fwd, 0.01), 0.0105, C.white, head, 8, 6);
    ball(ec.clone().addScaledVector(n, 0.026).addScaledVector(upP, -0.012).addScaledVector(fwd, -0.012), 0.005, C.white, head, 6, 5);
    // upper lid
    const lid = new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, 0, 1.0);
    lid.scale(0.04, 0.05, 0.033);
    lid.applyMatrix4(basis(upP, n));
    part(lid, C.pearl, ec, head);
    const X = new THREE.Vector3().crossVectors(upP, n);
    for (let k = 0; k < 7; k++) {
      const psi = THREE.MathUtils.degToRad(-72 + (k * 144) / 6);
      const radial = n.clone().multiplyScalar(Math.cos(psi)).addScaledVector(X, Math.sin(psi));
      const base = ec
        .clone()
        .addScaledVector(upP, 0.05 * Math.cos(1.0))
        .addScaledVector(n, Math.cos(psi) * 0.033 * Math.sin(1.0))
        .addScaledVector(X, Math.sin(psi) * 0.04 * Math.sin(1.0));
      const dir = radial.clone().addScaledVector(upP, 0.75).normalize();
      const rear = THREE.MathUtils.clamp(-radial.z * 1.6, 0, 1);
      const len = 0.02 + 0.024 * rear + 0.004;
      const mid = base.clone().addScaledVector(dir, len * 0.55);
      const dir2 = dir.clone().addScaledVector(upP, 0.7).addScaledVector(radial, 0.2).normalize();
      const tip = mid.clone().addScaledVector(dir2, len * 0.5);
      seg(base, mid, 0.0042, 0.0026, C.lash, head, 5);
      seg(mid, tip, 0.0026, 0.0007, C.lash, head, 5);
    }
  };
  eye(1);
  eye(-1);

  // ears
  const ear = (s: number, j: any, at: P) => {
    const base = v(at);
    const dir = v([0.38 * s, 1, -0.12]).normalize();
    const face = v([0.35 * s, 0, 1]);
    const len = 0.105;
    seg(base, base.clone().addScaledVector(dir, len), 0.034, 0.003, C.pearl, j, 8, 0.55, face);
    const ib = base.clone().addScaledVector(dir, 0.012).addScaledVector(face.clone().normalize(), 0.011);
    seg(ib, ib.clone().addScaledVector(dir, 0.072), 0.021, 0.003, C.earInner, j, 7, 0.4, face);
    const tb = base.clone().addScaledVector(dir, 0.07);
    seg(tb, base.clone().addScaledVector(dir, len + 0.003), 0.0148, 0.0035, C.lilacDeep, j, 8, 0.62, face);
  };
  ear(1, earLJ, [0.055, 1.305, 0.375]);
  ear(-1, earRJ, [-0.055, 1.305, 0.375]);

  // ---------- horn: small gold spiral ----------
  const H = v([0, 1.315, 0.465]);
  const hd = v([0, 1, 0.38]).normalize();
  const hLen = 0.155;
  const hStart = -0.012;
  const hR0 = 0.026;
  const hR1 = 0.003;
  const coneR = (s: number) => hR0 + ((hR1 - hR0) * (s - hStart)) / (hLen - hStart);
  seg(H.clone().addScaledVector(hd, hStart), H.clone().addScaledVector(hd, hLen), hR0, hR1, C.gold, horn, 10);
  const hm = basis(hd);
  const he1 = new THREE.Vector3().setFromMatrixColumn(hm, 0);
  const he2 = new THREE.Vector3().setFromMatrixColumn(hm, 2);
  const helix = (phase: number, rOff: number, color: string, tubeR: number) => {
    const pts: V3[] = [];
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
      const s = t * hLen * 0.94;
      const a = phase + t * 3 * Math.PI * 2;
      const rad = coneR(s) + rOff;
      pts.push(
        hd.clone().multiplyScalar(s).addScaledVector(he1, Math.cos(a) * rad).addScaledVector(he2, Math.sin(a) * rad),
      );
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, tubeR, 5, false);
    part(geo, color, H, horn);
  };
  helix(0, 0.0005, C.goldLight, 0.0048);
  helix(Math.PI, -0.0008, C.goldDeep, 0.0032);
  const collar = new THREE.TorusGeometry(0.028, 0.0075, 6, 16);
  collar.rotateX(Math.PI / 2);
  collar.applyMatrix4(basis(hd));
  part(collar, C.goldLight, H.clone().addScaledVector(hd, 0.002), horn);
  ball(H.clone().addScaledVector(hd, hLen), 0.0045, C.goldLight, horn, 6, 5);

  // forelock around the horn
  const forelock: [P, number, string][] = [
    [[0.042, 1.312, 0.438], 0.03, C.pink],
    [[-0.042, 1.312, 0.438], 0.03, C.mint],
    [[0, 1.33, 0.405], 0.034, C.lav],
    [[0.028, 1.288, 0.492], 0.02, C.lav],
    [[-0.028, 1.288, 0.492], 0.02, C.pink],
  ];
  for (const [p, r, col] of forelock) {
    puff(p, r, col, head);
    puff(v(p).add(new THREE.Vector3(0, r * 0.55, r * 0.15)), r * 0.45, fluffLight[col], head);
  }

  // ---------- mane: short fluffy pastel puffs along the crest ----------
  const maneN = 10;
  for (let i = 0; i < maneN; i++) {
    const t = i / (maneN - 1);
    const ap = neckA.clone().lerp(neckB, t);
    const r = 0.1 - 0.028 * t;
    const c = ap.clone().addScaledVector(backDir, r + 0.012);
    const bone = t < 0.45 ? neck1 : t < 0.92 ? neck2 : head;
    const col = fluffCols[i % 3];
    const col2 = fluffCols[(i + 1) % 3];
    const pr = 0.043 + jit(0.004);
    puff(c, pr, col, bone);
    const side = i % 2 === 0 ? 1 : -1;
    puff(
      c.clone().add(new THREE.Vector3(0.03 * side, 0, 0)).addScaledVector(backDir, -0.014).addScaledVector(axis, 0.012),
      pr * 0.78,
      col2,
      bone,
    );
    puff(
      c.clone().add(new THREE.Vector3(-0.022 * side, 0, 0)).addScaledVector(backDir, -0.02).addScaledVector(axis, -0.01),
      pr * 0.62,
      fluffCols[(i + 2) % 3],
      bone,
    );
    puff(c.clone().addScaledVector(backDir, pr * 0.62).addScaledVector(axis, 0.008), pr * 0.42, fluffLight[col], bone);
  }

  // ---------- tail: fluffy pastel pompom ----------
  seg(tailPts[0], tailPts[1], 0.04, 0.03, C.pearl, tail1, 8);
  const tailBones = [tail1, tail2, tail3];
  const tailV = tailPts.map((p) => v(p));
  const tailAt = (t: number) => {
    const f = t * 3;
    const i = Math.min(2, Math.floor(f));
    return { p: tailV[i].clone().lerp(tailV[i + 1], f - i), bone: tailBones[i] };
  };
  const tailDir = tailV[3].clone().sub(tailV[2]).normalize();
  for (let k = 0; k < 9; k++) {
    const t = 0.18 + (k / 8) * 0.82;
    const { p, bone } = tailAt(t);
    const pr = 0.034 + 0.03 * t;
    const col = fluffCols[k % 3];
    puff(p, pr, col, bone);
    for (let m = 0; m < 2; m++) {
      const o = new THREE.Vector3(jit(1), jit(0.6), jit(0.6)).normalize().multiplyScalar(pr * 0.6);
      o.x = Math.abs(o.x) * (m === 0 ? 1 : -1);
      puff(p.clone().add(o), pr * (0.66 + rand() * 0.12), fluffCols[(k + 1 + m) % 3], bone);
    }
    puff(p.clone().add(new THREE.Vector3(0, pr * 0.62, 0)), pr * 0.4, fluffLight[col], bone);
  }
  const tipP = tailV[3].clone().addScaledVector(tailDir, 0.03);
  puff(tipP, 0.06, C.lav, tail3);
  puff(tipP.clone().add(new THREE.Vector3(0.03, 0.02, 0.0)), 0.035, C.pink, tail3);
  puff(tipP.clone().add(new THREE.Vector3(-0.03, 0.015, -0.01)), 0.035, C.mint, tail3);
  puff(tipP.clone().add(new THREE.Vector3(0, 0.045, 0)), 0.024, C.lavLight, tail3);

  // ---------- legs: long, knobby, a little splayed ----------
  const leg = (s: number, front: boolean) => {
    const L = s > 0 ? "L" : "R";
    const raw: P[] = front
      ? [
          [0.1, 0.8, 0.2],
          [0.115, 0.58, 0.22],
          [0.125, 0.35, 0.215],
          [0.145, 0.11, 0.225],
          [0.152, 0.05, 0.235],
        ]
      : [
          [0.1, 0.8, -0.2],
          [0.13, 0.6, -0.12],
          [0.14, 0.38, -0.27],
          [0.15, 0.11, -0.245],
          [0.156, 0.05, -0.235],
        ];
    const pts: P[] = raw.map((p) => [p[0] * s, p[1], p[2]] as P);
    const names = front
      ? ["shoulder", "elbow", "wrist", "fetlock", "hoof"]
      : ["hip", "knee", "hock", "hindFetlock", "hindHoof"];
    const js: any[] = [];
    let parent: any = front ? chest : hips;
    for (let i = 0; i < pts.length; i++) {
      const j = b.joint(names[i] + L, { at: pts[i], parent });
      setRole(j, "leg");
      js.push(j);
      parent = j;
    }
    const out = new THREE.Vector3(s, 0, 0);
    // upper limb muscle
    if (front) {
      ellB(lerpV(pts[0], pts[1], 0.42).addScaledVector(out, 0.012), [0.058, 0.13, 0.078], C.pearl, js[0], v(pts[1]).sub(v(pts[0])), undefined, 10, 8);
      ball(pts[1], 0.044, C.pearl, js[1], 10, 7);
      seg(pts[1], pts[2], 0.044, 0.03, C.pearl, js[1], 9);
    } else {
      ellB(lerpV(pts[0], pts[1], 0.4).addScaledVector(out, 0.016), [0.075, 0.15, 0.105], C.pearl, js[0], v(pts[1]).sub(v(pts[0])), undefined, 10, 8);
      ball(pts[1], 0.05, C.pearl, js[1], 10, 7);
      seg(pts[1], pts[2], 0.05, 0.03, C.pearl, js[1], 9);
    }
    // knobby knee / hock
    ball(pts[2], 0.036, C.pearlShade, js[2], 10, 7);
    // cannon
    seg(pts[2], pts[3], 0.026, 0.023, C.pearlShade, js[2], 8);
    // fetlock + pastern
    ball(pts[3], 0.03, C.lilac, js[3], 9, 7);
    seg(pts[3], pts[4], 0.024, 0.028, C.lilac, js[3], 8);
    // fluffy sock ring
    const ht = v(pts[4]);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + 0.3;
      puff(
        ht.clone().add(new THREE.Vector3(Math.cos(a) * 0.029, 0.008 + (k % 2) * 0.006, Math.sin(a) * 0.029)),
        0.0145,
        k % 3 === 0 ? C.lilacDeep : C.fluff,
        js[3],
      );
    }
    // little silver hoof
    part(new THREE.CylinderGeometry(0.031, 0.04, 0.05, 10), C.silver, [ht.x, 0.025, ht.z], js[4]);
    part(new THREE.CylinderGeometry(0.0328, 0.0328, 0.008, 10), C.silverLight, [ht.x, 0.047, ht.z], js[4]);
    ball([ht.x, 0.028, ht.z + 0.037], 0.005, C.white, js[4], 6, 5);
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  // ---------- daisy chain around the neck ----------
  const dC = v([0, 0.929, 0.266]);
  const X = new THREE.Vector3(1, 0, 0);
  const NF = 15;
  const R = 0.116;
  const dp: V3[] = [];
  const dn: V3[] = [];
  for (let i = 0; i < NF; i++) {
    const a = (i / NF) * Math.PI * 2;
    const radial = X.clone().multiplyScalar(Math.sin(a)).addScaledVector(fwdDown, Math.cos(a));
    const cp = Math.max(0, Math.cos(a));
    const p = dC.clone().addScaledVector(radial, R).add(new THREE.Vector3(0, -0.05 * cp * cp, -0.02 * cp * cp));
    dp.push(p);
    dn.push(radial.clone().addScaledVector(axis, 0.35).normalize());
  }
  for (let i = 0; i < NF; i++) {
    const a = dp[i].clone().addScaledVector(dn[i], -0.004);
    const c = dp[(i + 1) % NF].clone().addScaledVector(dn[(i + 1) % NF], -0.004);
    seg(a, c, 0.0038, 0.0038, C.stem, neck1, 5);
    if (i % 2 === 0) {
      const mid = a.clone().lerp(c, 0.5);
      const tan = c.clone().sub(a).normalize();
      const nm = dn[i].clone().add(dn[(i + 1) % NF]).normalize();
      const sideV = new THREE.Vector3().crossVectors(nm, tan);
      ellB(mid.clone().addScaledVector(nm, 0.003).addScaledVector(sideV, 0.008), [0.006, 0.0025, 0.016], C.leaf, neck1, nm, tan.clone().multiplyScalar(0.6).addScaledVector(sideV, 0.8), 6, 4);
    }
  }
  for (let i = 0; i < NF; i++) {
    const a = (i / NF) * Math.PI * 2;
    if (Math.cos(a) < -0.6) continue; // hidden under the mane
    const p = dp[i];
    const n = dn[i];
    const sc = 0.85 + rand() * 0.35;
    const m = basis(n);
    const e1 = new THREE.Vector3().setFromMatrixColumn(m, 0);
    const e2 = new THREE.Vector3().setFromMatrixColumn(m, 2);
    const turn = rand() * Math.PI;
    for (let k = 0; k < 9; k++) {
      const ang = turn + (k / 9) * Math.PI * 2 + jit(0.12);
      const u = e1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(e2, Math.sin(ang));
      ellB(
        p.clone().addScaledVector(u, 0.017 * sc).addScaledVector(n, 0.003),
        [0.0065 * sc, 0.0028, 0.0125 * sc],
        C.daisy,
        neck1,
        n,
        u,
        6,
        4,
      );
    }
    ellB(p.clone().addScaledVector(n, 0.006), [0.0095 * sc, 0.006, 0.0095 * sc], C.daisyCore, neck1, n, undefined, 8, 5);
    ball(p.clone().addScaledVector(n, 0.0115), 0.0038 * sc, C.daisyCoreDeep, neck1, 6, 4);
  }

  return b.root;
}
