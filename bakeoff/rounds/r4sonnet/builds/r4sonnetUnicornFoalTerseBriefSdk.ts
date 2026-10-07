import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A leggy pearl-white unicorn foal with a twisted golden horn, big amethyst eyes, a pastel pink/lilac/aqua mane, forelock and plume tail, lilac socks, pink hooves and a star cutie mark. Rigged skeleton-first with spine, neck, head, separate jaw, eyes, ears, horn, four legs and a five-joint tail.",
};

type V3 = [number, number, number];
type Pt = THREE.Vector3 | V3;
type Joint = any;

// ---------------------------------------------------------------- palette
const C = {
  coat: "#faf5f0",
  belly: "#ece1ec",
  dapple: "#f1e6f2",
  sock: "#e9dff8",
  nose: "#f3b9c8",
  nostril: "#a95676",
  blush: "#f9b8cb",
  blaze: "#fde3ea",
  earIn: "#f8bfd0",
  eye: "#2a1f48",
  iris: "#7a58d8",
  irisGlow: "#b8a2ff",
  pupil: "#120c28",
  white: "#ffffff",
  pink: "#f58ab7",
  lilac: "#b38df4",
  aqua: "#6fd5e9",
  gold: "#ffd36c",
  horn: "#ffd666",
  hornTip: "#fff2be",
  hoof: "#e8b4d3",
  hoofBand: "#f8dbe9",
  cream: "#fff7d6",
};
const PAL = [C.pink, C.lilac, C.aqua];
const SIDES = [1, -1];

// ---------------------------------------------------------------- math helpers
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const toV = (p: Pt): THREE.Vector3 => (Array.isArray(p) ? V(p[0], p[1], p[2]) : p.clone());
const tup = (p: THREE.Vector3): V3 => [p.x, p.y, p.z];
const mix = (a: Pt, c: Pt, t: number) => toV(a).lerp(toV(c), t);
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Rotation taking local +Y to `y` (local +Z leans toward `hint`). */
function basisFromY(y: THREE.Vector3, hint: THREE.Vector3 = V(0, 0, 1)): THREE.Matrix4 {
  const Y = y.clone().normalize();
  let z0 = hint.clone().normalize();
  if (Math.abs(Y.dot(z0)) > 0.97) z0 = V(1, 0, 0);
  const X = new THREE.Vector3().crossVectors(Y, z0).normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y).normalize();
  return new THREE.Matrix4().makeBasis(X, Y, Z);
}

/** Rotation taking local +Z to `z` (local +Y leans toward `hint`). */
function basisFromZ(z: THREE.Vector3, hint: THREE.Vector3 = V(0, 1, 0)): THREE.Matrix4 {
  const Z = z.clone().normalize();
  let y0 = hint.clone().normalize();
  if (Math.abs(Z.dot(y0)) > 0.97) y0 = V(0, 0, 1);
  const X = new THREE.Vector3().crossVectors(y0, Z).normalize();
  const Y = new THREE.Vector3().crossVectors(Z, X).normalize();
  return new THREE.Matrix4().makeBasis(X, Y, Z);
}

/** Point + outward normal on an axis-aligned ellipsoid (az 0 = +Z, +90deg = +X). */
function surf(c: THREE.Vector3, r: V3, az: number, el: number) {
  const d = V(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  const p = V(c.x + r[0] * d.x, c.y + r[1] * d.y, c.z + r[2] * d.z);
  const n = V(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
  return { p, n };
}

// ---------------------------------------------------------------- geometry helpers
function ball(rx: number, ry: number, rz: number, detail = 1, rot?: THREE.Matrix4) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  g.scale(rx, ry, rz);
  if (rot) g.applyMatrix4(rot);
  return g;
}

/** Teardrop lock of hair: base at origin, tip at +Y * len. */
function dropGeo(w: number, len: number, flat = 1, segs = 6) {
  const prof = [
    new THREE.Vector2(0.0001, 0),
    new THREE.Vector2(0.55, 0.1),
    new THREE.Vector2(1.0, 0.34),
    new THREE.Vector2(0.78, 0.68),
    new THREE.Vector2(0.0001, 1),
  ];
  const g = new THREE.LatheGeometry(prof, segs);
  g.scale(w, len, w * flat);
  return g;
}

/** Twisted, fluted unicorn horn between t0..t1 of its length (axis +Y from 0). */
function hornGeo(len: number, r0: number, turns: number, t0: number, t1: number, levels: number, lobes: number) {
  const ring = lobes * 2;
  const pos: number[] = [];
  const idx: number[] = [];
  const rr = (t: number) => r0 * Math.pow(1 - t, 0.9);
  for (let i = 0; i <= levels; i++) {
    const t = t0 + ((t1 - t0) * i) / levels;
    const r = rr(t);
    const tw = t * turns * Math.PI * 2;
    for (let k = 0; k < ring; k++) {
      const a = (k / ring) * Math.PI * 2 + tw;
      const rk = r * (k % 2 === 0 ? 1 : 0.6);
      pos.push(Math.cos(a) * rk, t * len, Math.sin(a) * rk);
    }
  }
  for (let i = 0; i < levels; i++) {
    for (let k = 0; k < ring; k++) {
      const a = i * ring + k;
      const bb = i * ring + ((k + 1) % ring);
      const c = (i + 1) * ring + k;
      const d = (i + 1) * ring + ((k + 1) % ring);
      idx.push(a, c, bb, bb, c, d);
    }
  }
  const top = pos.length / 3;
  pos.push(0, t1 >= 0.9 ? len : t1 * len, 0);
  for (let k = 0; k < ring; k++) {
    idx.push(top, levels * ring + ((k + 1) % ring), levels * ring + k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  const n = flat.getAttribute("position").count;
  flat.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  return flat;
}

/** Flat star in the XY plane, thickness along Z, centred. */
function starGeo(outer: number, inner: number, depth: number, pts = 5) {
  const shape = new THREE.Shape();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / pts;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

// ================================================================= build
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "unicorn_foal" });

  // ---- part helpers: every piece of geometry goes through b.part
  const put = (geo: THREE.BufferGeometry, color: string, at: Pt, bone: Joint) =>
    b.part(geo, color, { at: tup(toV(at)), bone });

  const blob = (color: string, bone: Joint, at: Pt, r: V3, detail = 1, rot?: THREE.Matrix4) =>
    put(ball(r[0], r[1], r[2], detail, rot), color, at, bone);

  /** Tapered cylinder from a (radius r0) to c (radius r1). */
  const seg = (a: Pt, c: Pt, r0: number, r1: number, color: string, bone: Joint, radial = 7) => {
    const A = toV(a);
    const Cc = toV(c);
    const d = Cc.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), radial, 1);
    g.applyMatrix4(basisFromY(d));
    return put(g, color, A.clone().add(Cc).multiplyScalar(0.5), bone);
  };

  /** Teardrop lock from base to tip. */
  const drop = (base: Pt, tip: Pt, w: number, color: string, bone: Joint, flat = 1, hint?: THREE.Vector3) => {
    const A = toV(base);
    const T = toV(tip);
    const d = T.clone().sub(A);
    const g = dropGeo(w, d.length(), flat);
    g.applyMatrix4(basisFromY(d, hint));
    return put(g, color, A, bone);
  };

  /** 3D sparkle: three crossed slivers. */
  const sparkle = (c: Pt, size: number, color: string, bone: Joint) => {
    const at = toV(c);
    const dims: V3[] = [
      [0.3, 1, 0.3],
      [0.85, 0.3, 0.3],
      [0.3, 0.3, 0.6],
    ];
    for (const [sx, sy, sz] of dims) {
      const g = new THREE.OctahedronGeometry(1, 0);
      g.scale(sx * size, sy * size, sz * size);
      put(g, color, at, bone);
    }
  };

  // ---- joint helper
  const J = (name: string, at: V3, parent?: Joint, role?: string): Joint => {
    const opts: any = { at };
    if (parent) opts.parent = parent;
    if (role) opts.role = role;
    const j: any = b.joint(name, opts);
    if (role && j && j.userData) j.userData.role = role;
    return j;
  };

  // ============================================================ skeleton
  const hips = J("hips", [0, 0.8, -0.28], undefined, "spine");
  const spine1 = J("spine1", [0, 0.8, -0.06], hips, "spine");
  const spine2 = J("spine2", [0, 0.81, 0.15], spine1, "spine");
  const spine3 = J("spine3", [0, 0.83, 0.3], spine2, "spine");
  const neck1 = J("neck1", [0, 0.93, 0.34], spine3, "neck");
  const neck2 = J("neck2", [0, 1.04, 0.43], neck1, "neck");
  const head = J("head", [0, 1.15, 0.5], neck2, "head");

  // head frame: poll P0, forward along hF (nose side), up-along-face uF
  const P0 = V(0, 1.24, 0.54);
  const hF = V(0, -0.65, 0.76).normalize();
  const uF = V(0, 0.76, 0.65).normalize();
  const HR = new THREE.Matrix4().makeBasis(V(1, 0, 0), uF, hF);
  const H = (l: number, v = 0, w = 0) =>
    P0.clone().addScaledVector(hF, l).addScaledVector(uF, v).add(V(w, 0, 0));
  const hb = (l: number, v: number, w: number, r: V3, color: string, bone: Joint, detail = 1) =>
    blob(color, bone, H(l, v, w), r, detail, HR);

  const jaw = J("jaw", tup(H(0.1, -0.13)), head, "jaw");

  // tail chain
  const tailPts: V3[] = [
    [0, 0.87, -0.5],
    [0, 0.87, -0.6],
    [0, 0.79, -0.69],
    [0, 0.65, -0.735],
    [0, 0.5, -0.74],
  ];
  const tail: Joint[] = [];
  tailPts.forEach((p, i) => tail.push(J("tail" + (i + 1), p, i === 0 ? hips : tail[i - 1], "tail")));

  // ============================================================ torso
  const barrel = { c: V(0, 0.785, -0.03), r: [0.2, 0.235, 0.4] as V3 };
  const rump = { c: V(0, 0.8, -0.3), r: [0.205, 0.225, 0.2] as V3 };
  const chest = { c: V(0, 0.8, 0.28), r: [0.2, 0.235, 0.19] as V3 };

  blob(C.coat, spine1, barrel.c, barrel.r, 3);
  blob(C.coat, hips, rump.c, rump.r, 3);
  blob(C.coat, spine3, chest.c, chest.r, 3);
  blob(C.belly, spine1, V(0, 0.635, -0.02), [0.12, 0.1, 0.36], 2); // pale underside
  blob(C.coat, spine2, V(0, 0.985, 0.2), [0.075, 0.05, 0.13], 1); // withers

  // dapples (flat patches seated on the ellipsoids)
  const dap = (c: THREE.Vector3, r: V3, list: [number, number, number][], bone: Joint) => {
    for (const s of SIDES) {
      list.forEach(([az, el, size]) => {
        const jitter = s < 0 ? 6 : 0;
        const hit = surf(c, r, s * rad(az + jitter), rad(el - (s < 0 ? 3 : 0)));
        const g = ball(size, size * 0.82, 0.008, 1, basisFromZ(hit.n));
        put(g, C.dapple, hit.p.clone().addScaledVector(hit.n, -0.001), bone);
      });
    }
  };
  dap(barrel.c, barrel.r, [[78, 38, 0.036], [112, 30, 0.04], [82, -22, 0.034], [118, -20, 0.032], [100, 52, 0.028]], spine1);
  dap(rump.c, rump.r, [[104, 42, 0.034], [140, 30, 0.03]], hips);

  // cutie mark: lilac-pink star with a gold heart-of-star
  for (const s of SIDES) {
    const hit = surf(barrel.c, barrel.r, s * 1.65, 0.12);
    const M = basisFromZ(hit.n);
    const g1 = starGeo(0.062, 0.029, 0.014);
    g1.applyMatrix4(M);
    put(g1, C.pink, hit.p, spine1);
    const g2 = starGeo(0.031, 0.014, 0.008);
    g2.applyMatrix4(M);
    put(g2, C.gold, hit.p.clone().addScaledVector(hit.n, 0.008), spine1);
  }

  // ============================================================ neck
  seg([0, 0.9, 0.3], [0, 1.04, 0.43], 0.125, 0.102, C.coat, neck1, 8);
  blob(C.coat, neck2, [0, 1.04, 0.43], [0.102, 0.102, 0.102], 1);
  seg([0, 1.04, 0.43], [0, 1.15, 0.5], 0.102, 0.082, C.coat, neck2, 8);

  // ============================================================ head
  hb(0.085, -0.075, 0, [0.1, 0.105, 0.11], C.coat, head, 2); // cranium
  hb(0.13, -0.13, 0, [0.085, 0.085, 0.1], C.coat, head, 2); // chubby cheeks
  hb(0.235, -0.07, 0, [0.06, 0.057, 0.105], C.coat, head, 2); // muzzle
  hb(0.322, -0.08, 0, [0.058, 0.056, 0.05], C.nose, head, 1); // nose pad
  hb(0.23, -0.014, 0, [0.017, 0.008, 0.08], C.blaze, head, 1); // pale blaze
  // lower jaw (own bone so the mouth can open)
  hb(0.235, -0.15, 0, [0.05, 0.036, 0.1], C.coat, jaw, 1);
  hb(0.322, -0.135, 0, [0.045, 0.037, 0.04], C.nose, jaw, 1); // chin
  hb(0.352, -0.121, 0, [0.028, 0.0035, 0.01], C.nostril, head, 0); // mouth slit

  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";

    // nostrils + blush
    hb(0.368, -0.07, s * 0.027, [0.011, 0.014, 0.01], C.nostril, head, 1);
    hb(0.115, -0.115, s * 0.087, [0.012, 0.03, 0.04], C.blush, head, 1);

    // ---- eyes (own joints for gaze)
    const eyeJ = J("eye" + side, tup(H(0.12, -0.05, s * 0.088)), head);
    const E = (l: number, v: number, w: number, r: V3, color: string, d = 1) =>
      hb(l, v, s * w, r, color, eyeJ, d);
    E(0.12, -0.05, 0.088, [0.02, 0.036, 0.032], C.eye);
    E(0.12, -0.05, 0.1, [0.012, 0.03, 0.027], C.iris);
    E(0.12, -0.066, 0.104, [0.008, 0.012, 0.016], C.irisGlow);
    E(0.12, -0.05, 0.108, [0.007, 0.018, 0.013], C.pupil);
    E(0.131, -0.037, 0.11, [0.0085, 0.0085, 0.0085], C.white);
    E(0.111, -0.064, 0.109, [0.0045, 0.0045, 0.0045], C.white, 0);
    for (const th of [105, 135, 165]) {
      const a = rad(th);
      const base = H(0.12 + 0.033 * Math.cos(a), -0.05 + 0.04 * Math.sin(a), s * 0.093);
      const tip = H(0.12 + 0.064 * Math.cos(a), -0.05 + 0.064 * Math.sin(a), s * 0.108);
      seg(base, tip, 0.004, 0.0012, C.eye, eyeJ, 4);
    }

    // ---- ears
    const earBase = H(0.035, 0, s * 0.055);
    const earJ = J("ear" + side, tup(earBase), head);
    const ed = V(s * 0.24, 0.95, -0.14).normalize();
    const eLen = 0.17;
    const EM = basisFromY(ed, V(0, 0, 1));
    const eg = new THREE.ConeGeometry(1, 1, 6);
    eg.scale(0.045, eLen, 0.027);
    eg.applyMatrix4(EM);
    put(eg, C.coat, earBase.clone().addScaledVector(ed, eLen / 2 - 0.012), earJ);
    const zA = V().setFromMatrixColumn(EM, 2);
    const ig = new THREE.ConeGeometry(1, 1, 6);
    ig.scale(0.03, eLen * 0.78, 0.02);
    ig.applyMatrix4(EM);
    put(ig, C.earIn, earBase.clone().addScaledVector(ed, (eLen * 0.78) / 2 + 0.005).addScaledVector(zA, 0.01), earJ);

    // ---- forelock locks around the horn
    drop(H(0.07, 0.015, s * 0.04), H(0.2, 0.005, s * 0.045), 0.034, s > 0 ? C.pink : C.lilac, head, 0.8);
    drop(H(0.055, 0.02, s * 0.03), H(0.12, 0.085, s * 0.065), 0.03, s > 0 ? C.lilac : C.pink, head, 0.8);
  }
  drop(H(0.06, 0.02, 0), H(0.035, 0.11, 0), 0.04, C.aqua, head, 0.8);

  // ---- horn
  const hornBase = H(0.12, 0.012, 0);
  const hornDir = V(0, 0.86, 0.5).normalize();
  const hornLen = 0.28;
  const hornJ = J("horn", tup(hornBase), head);
  const HM = basisFromY(hornDir);
  const hg1 = hornGeo(hornLen, 0.034, 1.4, 0, 0.62, 15, 5);
  hg1.applyMatrix4(HM);
  put(hg1, C.horn, hornBase, hornJ);
  const hg2 = hornGeo(hornLen, 0.034, 1.4, 0.62, 0.96, 9, 5);
  hg2.applyMatrix4(HM);
  put(hg2, C.hornTip, hornBase, hornJ);
  const collar = new THREE.CylinderGeometry(0.037, 0.047, 0.03, 8);
  collar.applyMatrix4(HM);
  put(collar, C.pink, hornBase.clone().addScaledVector(hornDir, 0.008), hornJ);

  // ---- magic sparkles near the horn tip
  const hornTip = hornBase.clone().addScaledVector(hornDir, hornLen);
  sparkle(hornTip.clone().add(V(0.1, 0.03, 0.05)), 0.035, C.cream, hornJ);
  sparkle(hornTip.clone().add(V(-0.1, -0.03, 0.08)), 0.026, C.aqua, hornJ);
  sparkle(hornTip.clone().add(V(0.05, 0.1, -0.04)), 0.02, C.pink, hornJ);

  // ============================================================ mane
  const crest = [V(0, 1.03, 0.24), V(0, 1.098, 0.349), V(0, 1.195, 0.43), V(0, 1.262, 0.495)];
  const crestAt = (t: number) => {
    const f = Math.min(0.9999, Math.max(0, t)) * (crest.length - 1);
    const i = Math.floor(f);
    return mix(crest[i], crest[i + 1], f - i);
  };
  const N = 9;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = crestAt(t);
    const d = crestAt(t + 0.05).sub(crestAt(t - 0.05)).normalize();
    const n = V(0, d.z, -d.y).normalize(); // up/back normal of the crest
    const up = n.clone().multiplyScalar(0.55).add(V(0, 0.85, 0)).normalize();
    const bone = t < 0.3 ? neck1 : t < 0.78 ? neck2 : head;
    const len = 0.1 + 0.025 * Math.sin(i * 2.1);
    const base = p.clone().addScaledVector(n, -0.025);
    drop(base, base.clone().addScaledVector(up, len), 0.042, PAL[i % 3], bone, 0.8);
    for (const s of SIDES) {
      const b2 = base.clone().add(V(s * 0.03, -0.02, 0));
      const tip = b2.clone().add(V(s * 0.065, -0.06, -0.035));
      drop(b2, tip, 0.032, PAL[(i + 1) % 3], bone, 0.8);
    }
  }

  // ============================================================ tail
  const T = tailPts.map((p) => V(p[0], p[1], p[2]));
  seg(T[0], T[1], 0.04, 0.036, C.coat, tail[0], 7);
  blob(C.coat, tail[1], T[1], [0.04, 0.04, 0.04], 1);
  const tailW = [0, 0.05, 0.065, 0.078];
  for (let i = 1; i < 4; i++) {
    const a = T[i];
    const c = T[i + 1];
    const d = c.clone().sub(a).normalize();
    const baseP = a.clone().addScaledVector(d, -0.03);
    const tipP = c.clone().addScaledVector(d, 0.05);
    drop(baseP, tipP, tailW[i], PAL[(i - 1) % 3], tail[i], 0.85);
    for (const s of SIDES) {
      drop(
        baseP.clone().add(V(s * 0.02, 0, 0)),
        tipP.clone().add(V(s * 0.045, 0.02, -0.02)),
        tailW[i] * 0.8,
        PAL[i % 3],
        tail[i],
        0.85
      );
    }
  }
  drop(T[4].clone().add(V(0, 0.06, 0)), T[4].clone().add(V(0, -0.13, -0.005)), 0.06, C.gold, tail[4], 0.85);
  for (const s of SIDES) {
    drop(T[4].clone().add(V(s * 0.02, 0.05, 0)), T[4].clone().add(V(s * 0.07, -0.09, -0.02)), 0.045, C.pink, tail[4], 0.85);
  }

  // ============================================================ legs
  for (const s of SIDES) {
    const k = s > 0 ? "L" : "R";

    // ---------- front leg
    {
      const S = V(s * 0.115, 0.82, 0.3);
      const E = V(s * 0.12, 0.6, 0.25);
      const K = V(s * 0.12, 0.35, 0.285);
      const F = V(s * 0.12, 0.12, 0.29);
      const Hc = V(s * 0.12, 0.07, 0.308);
      const shoulder = J("shoulder" + k, tup(S), spine3, "leg");
      const elbow = J("elbow" + k, tup(E), shoulder, "leg");
      const knee = J("knee" + k, tup(K), elbow, "leg");
      const fetlock = J("fetlock" + k, tup(F), knee, "leg");
      const hoofJ = J("hoof" + k, tup(Hc), fetlock, "leg");

      blob(C.coat, shoulder, [s * 0.13, 0.79, 0.29], [0.075, 0.15, 0.12], 2);
      seg(S, E, 0.06, 0.05, C.coat, shoulder, 8);
      blob(C.coat, elbow, E, [0.052, 0.052, 0.052], 1);
      seg(E, K, 0.05, 0.036, C.coat, elbow, 8);
      blob(C.coat, knee, K, [0.042, 0.046, 0.05], 1);
      seg(K, F, 0.03, 0.034, C.sock, knee, 7);
      blob(C.sock, fetlock, F, [0.04, 0.042, 0.046], 1);
      seg(F, Hc, 0.033, 0.034, C.sock, fetlock, 7);
      drop(F.clone().add(V(0, 0.018, -0.022)), F.clone().add(V(0, -0.08, -0.05)), 0.03, C.pink, fetlock, 0.8);

      put(new THREE.CylinderGeometry(0.038, 0.054, 0.07, 8), C.hoof, [Hc.x, 0.035, Hc.z + 0.012], hoofJ);
      put(new THREE.CylinderGeometry(0.043, 0.045, 0.014, 8), C.hoofBand, [Hc.x, 0.067, Hc.z + 0.008], hoofJ);
    }

    // ---------- hind leg
    {
      const Hp = V(s * 0.115, 0.82, -0.3);
      const St = V(s * 0.13, 0.6, -0.19);
      const Hk = V(s * 0.12, 0.34, -0.36);
      const Fh = V(s * 0.12, 0.12, -0.335);
      const Hh = V(s * 0.12, 0.07, -0.315);
      const hip = J("hip" + k, tup(Hp), hips, "leg");
      const stifle = J("stifle" + k, tup(St), hip, "leg");
      const hock = J("hock" + k, tup(Hk), stifle, "leg");
      const fetlockH = J("hindFetlock" + k, tup(Fh), hock, "leg");
      const hoofH = J("hindHoof" + k, tup(Hh), fetlockH, "leg");

      const thighC = mix(Hp, St, 0.5).add(V(s * 0.01, 0, 0));
      blob(C.coat, hip, thighC, [0.088, 0.17, 0.1], 2, basisFromY(St.clone().sub(Hp)));
      blob(C.coat, stifle, St, [0.058, 0.058, 0.058], 1);
      seg(St, Hk, 0.056, 0.036, C.coat, stifle, 8);
      blob(C.coat, hock, Hk, [0.04, 0.048, 0.046], 1);
      blob(C.coat, hock, Hk.clone().add(V(0, 0.03, -0.04)), [0.028, 0.05, 0.035], 1);
      seg(Hk, Fh, 0.034, 0.032, C.sock, hock, 7);
      blob(C.sock, fetlockH, Fh, [0.04, 0.042, 0.046], 1);
      seg(Fh, Hh, 0.033, 0.034, C.sock, fetlockH, 7);
      drop(Fh.clone().add(V(0, 0.018, -0.022)), Fh.clone().add(V(0, -0.08, -0.05)), 0.03, C.pink, fetlockH, 0.8);

      put(new THREE.CylinderGeometry(0.038, 0.054, 0.07, 8), C.hoof, [Hh.x, 0.035, Hh.z + 0.012], hoofH);
      put(new THREE.CylinderGeometry(0.043, 0.045, 0.014, 8), C.hoofBand, [Hh.x, 0.067, Hh.z + 0.008], hoofH);
    }
  }

  return b.root;
}
