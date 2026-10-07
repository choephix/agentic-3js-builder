import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Red Panda",
  description:
    "A rigged, stylized red panda built from faceted primitives: russet back with a golden mantle, dark belly and legs, " +
    "white cheek ruffs with tear-line markings, big white-lined ears, a separate upper and lower jaw, " +
    "clawed toes and a long bushy ringed tail on a named skeleton.",
};

type V3 = [number, number, number];

interface PartOpts {
  dir?: any;
  ref?: any;
  rot?: V3;
  scale?: V3;
  pivot?: V3;
}

const PI = Math.PI;
const rad = (d: number): number => (d * PI) / 180;
const toV = (p: any): THREE.Vector3 =>
  p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
const arr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const mix = (a: V3, c: V3, t: number): V3 => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

// Quaternion that turns local +Y onto `dir`, and local +Z toward `ref` (default: world up).
function alignQ(dir: THREE.Vector3, ref?: THREE.Vector3): THREE.Quaternion {
  const y = dir.clone().normalize();
  let z = ref ? ref.clone() : new THREE.Vector3(0, 1, 0);
  z.addScaledVector(y, -z.dot(y));
  if (z.lengthSq() < 1e-8) {
    z = new THREE.Vector3(0, 0, 1);
    z.addScaledVector(y, -z.dot(y));
    if (z.lengthSq() < 1e-8) {
      z = new THREE.Vector3(1, 0, 0);
      z.addScaledVector(y, -z.dot(y));
    }
  }
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

// Point on an ellipsoid. az from +Z toward +X, el above the horizontal.
function ep(c: V3, r: V3, azD: number, elD: number, k = 1): V3 {
  const az = rad(azD);
  const el = rad(elD);
  return [
    c[0] + k * r[0] * Math.cos(el) * Math.sin(az),
    c[1] + k * r[1] * Math.sin(el),
    c[2] + k * r[2] * Math.cos(el) * Math.cos(az),
  ];
}
// Outward normal of an ellipsoid at p.
function en(c: V3, r: V3, p: V3): THREE.Vector3 {
  return new THREE.Vector3(
    (p[0] - c[0]) / (r[0] * r[0]),
    (p[1] - c[1]) / (r[1] * r[1]),
    (p[2] - c[2]) / (r[2] * r[2])
  ).normalize();
}

function makeRand(seed: number): () => number {
  try {
    const r: any = (rng as any)(seed);
    const probe: any =
      typeof r === "function"
        ? r
        : r && typeof r.next === "function"
        ? () => r.next()
        : r && typeof r.random === "function"
        ? () => r.random()
        : r && typeof r.float === "function"
        ? () => r.float()
        : null;
    if (probe) {
      const t = probe();
      if (typeof t === "number" && t >= 0 && t < 1) return probe;
    }
  } catch (e) {
    /* fall through to the local generator */
  }
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const perp = (a: THREE.Vector3): [THREE.Vector3, THREE.Vector3] => {
  const u = new THREE.Vector3().crossVectors(a, new THREE.Vector3(0, 1, 0)).normalize();
  const w = new THREE.Vector3().crossVectors(a, u).normalize();
  return [u, w];
};

export default function build(): THREE.Object3D {
  const b: any = createBuilder({ name: "red_panda" });
  const rand = makeRand(7);

  // ------------------------------------------------------------------ palette
  const K = {
    rump: "#b64a1a",
    back: "#c6561f",
    front: "#d4692b",
    flank: "#9f3f19",
    belly: "#3a211a",
    leg: "#2b1913",
    legWarm: "#4d2b1c",
    goldLt: "#eba85a",
    gold: "#dd8c3c",
    tan: "#cf7a33",
    white: "#f7f0e4",
    cream: "#e6d8c0",
    tear: "#7f301a",
    ring: "#2c1612",
    black: "#0d0908",
    nose: "#161010",
    noseHi: "#6b5b58",
    tongue: "#c95b62",
    mouth: "#3a1416",
    claw: "#efe4d0",
    earOut: "#93401d",
    earTip: "#4a1e13",
    earIn: "#f6eee1",
    tailA: "#cf6a28",
    tailB: "#963a17",
    tailC: "#b85a24",
    tailD: "#7a3016",
    tailE: "#7d3217",
    tailF: "#3c1b12",
    tailTip: "#26120d",
    whisker: "#f1e9da",
    shine: "#ffffff",
  };

  // ------------------------------------------------------------------ helpers
  const J = (name: string, at: V3, parent: any, role?: string): any => {
    let j: any;
    if (!parent) {
      j = b.joint(name, { at });
    } else {
      try {
        j = b.joint(name, { at, parent });
      } catch (err) {
        j = b.joint(name, { at, parent: parent.name });
      }
    }
    if (role && j && typeof j === "object") {
      j.userData = j.userData || {};
      j.userData.role = role;
    }
    return j;
  };

  // Every piece of geometry goes through b.part; transforms are baked, flat normals give the facets.
  const P = (geo: THREE.BufferGeometry, color: string, at: V3, bone: any, o: PartOpts = {}): any => {
    if (o.pivot) geo.translate(o.pivot[0], o.pivot[1], o.pivot[2]);
    const q = new THREE.Quaternion();
    if (o.dir) q.copy(alignQ(toV(o.dir), o.ref ? toV(o.ref) : undefined));
    if (o.rot) {
      q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(o.rot[0], o.rot[1], o.rot[2], "XYZ")));
    }
    const sc = o.scale || [1, 1, 1];
    geo.applyMatrix4(
      new THREE.Matrix4().compose(new THREE.Vector3(), q, new THREE.Vector3(sc[0], sc[1], sc[2]))
    );
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.clearGroups();
    g.computeVertexNormals();
    return b.part(g, color, { at: [at[0], at[1], at[2]], bone });
  };

  // Ellipsoid (optionally only a latitude band, theta from the +Y pole).
  const E = (color: string, at: V3, r: V3, bone: any, o: any = {}): any => {
    const t0 = o.t0 ?? 0;
    const t1 = o.t1 ?? PI;
    const w = o.w ?? 10;
    const hs = Math.max(2, Math.round((o.h ?? 7) * (t1 - t0) / PI));
    const g = new THREE.SphereGeometry(1, w, hs, 0, PI * 2, t0, t1 - t0);
    return P(g, color, at, bone, { scale: r, rot: o.rot, dir: o.dir, ref: o.ref });
  };

  // Stacked colour bands on one ellipsoid (perfectly seamed).
  const bands = (c: V3, r: V3, bone: any, list: [string, number, number][], o: any = {}) => {
    for (const [col, d0, d1] of list) E(col, c, r, bone, { ...o, t0: rad(d0), t1: rad(d1) });
  };

  // Frustum from point a to point bb.
  const R = (
    color: string, a: V3, bb: V3, rA: number, rB: number, bone: any, seg = 7, o: any = {}
  ): any => {
    const A = toV(a);
    const B = toV(bb);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(rB, rA, d.length(), seg, 1, false);
    const m = A.clone().add(B).multiplyScalar(0.5);
    return P(g, color, arr(m), bone, { dir: d, rot: [0, o.spin ?? 0, 0], scale: o.scale });
  };

  // Open cone from base to tip: fur tufts, claws, fangs.
  const Cone = (color: string, base: V3, tip: V3, rd: number, bone: any, seg = 4): any => {
    const A = toV(base);
    const B = toV(tip);
    const d = B.clone().sub(A);
    const g = new THREE.ConeGeometry(rd, d.length(), seg, 1, true);
    const m = A.clone().add(B).multiplyScalar(0.5);
    return P(g, color, arr(m), bone, { dir: d });
  };

  // Flat marking lying on an ellipsoid surface.
  const D = (
    color: string, c: V3, r: V3, azD: number, elD: number, size: [number, number], bone: any, o: any = {}
  ): any => {
    const p = ep(c, r, azD, elD, o.k ?? 1);
    const n = en(c, r, p);
    const th = o.th ?? 0.0016;
    const at = toV(p).addScaledVector(n, th * 0.5);
    return E(color, arr(at), [size[0], th, size[1]], bone, {
      dir: n,
      rot: [0, o.spin ?? 0, 0],
      w: o.w ?? 8,
      h: 4,
    });
  };

  // Painted stroke along a path of (az, el) points on an ellipsoid.
  const S = (
    color: string, c: V3, r: V3, pts: number[][], w: number, bone: any, th = 0.0016
  ) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = toV(ep(c, r, pts[i][0], pts[i][1]));
      const p1 = toV(ep(c, r, pts[i + 1][0], pts[i + 1][1]));
      const mid = p0.clone().add(p1).multiplyScalar(0.5);
      const n = en(c, r, arr(mid));
      const d = p1.clone().sub(p0);
      const at = mid.clone().addScaledVector(n, th * 0.5);
      E(color, arr(at), [w, th, d.length() * 0.62], bone, { dir: n, ref: d, w: 6, h: 4 });
    }
  };

  // Random fur tufts that lie backwards over an ellipsoid.
  const fuzz = (
    c: V3, r: V3, bone: any, color: string, n: number,
    az0: number, az1: number, el0: number, el1: number, len: number, rd: number
  ) => {
    for (let i = 0; i < n; i++) {
      const az = az0 + (az1 - az0) * rand();
      const el = el0 + (el1 - el0) * rand();
      const p = ep(c, r, az, el, 0.96);
      const nrm = en(c, r, p);
      const d = nrm.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0, -0.85)).normalize();
      const base = toV(p);
      const tip = base.clone().addScaledVector(d, len * (0.8 + 0.4 * rand()));
      Cone(color, arr(base), arr(tip), rd, bone, 4);
    }
  };

  // Ring of fur wedges around a limb or the tail.
  const fringe = (
    p: V3, a: THREE.Vector3, rr: number, color: string, bone: any, n: number, phase: number, len: number
  ) => {
    const [u, w] = perp(a);
    for (let k = 0; k < n; k++) {
      const ang = (k / n) * PI * 2 + phase;
      const radial = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
      const base = toV(p).addScaledVector(radial, rr);
      const tip = base.clone().addScaledVector(radial, 0.012).addScaledVector(a, len);
      Cone(color, arr(base), arr(tip), 0.0165, bone, 4);
    }
  };

  // Four clawed toes.
  const toes = (bone: any, cx: number, y: number, zf: number) => {
    for (let i = 0; i < 4; i++) {
      const k = i - 1.5;
      const x = cx + k * 0.0105;
      const z = zf - Math.abs(k) * 0.003;
      E(K.leg, [x, y, z], [0.0088, 0.0088, 0.012], bone, { w: 8, h: 6 });
      Cone(K.claw, [x + k * 0.0006, y - 0.0005, z + 0.008], [x + k * 0.003, y - 0.003, z + 0.0215], 0.0032, bone, 4);
    }
  };

  // ================================================================== SKELETON
  const hips = J("hips", [0, 0.205, -0.15], null, "spine");
  const spine1 = J("spine1", [0, 0.21, -0.04], hips, "spine");
  const spine2 = J("spine2", [0, 0.215, 0.07], spine1, "spine");
  const neck = J("neck", [0, 0.228, 0.155], spine2, "neck");
  const head = J("head", [0, 0.25, 0.215], neck, "head");
  const jaw = J("jaw", [0, 0.241, 0.262], head, "jaw");

  // ================================================================== TORSO
  const segs: { bone: any; c: V3; r: V3; top: string }[] = [
    { bone: hips, c: [0, 0.205, -0.14], r: [0.095, 0.092, 0.115], top: K.rump },
    { bone: spine1, c: [0, 0.207, -0.025], r: [0.092, 0.09, 0.105], top: K.back },
    { bone: spine2, c: [0, 0.213, 0.085], r: [0.097, 0.094, 0.11], top: K.front },
  ];
  for (const sg of segs) {
    bands(sg.c, sg.r, sg.bone, [[sg.top, 0, 74], [K.flank, 74, 112], [K.belly, 112, 180]], { w: 14, h: 10 });
  }
  // golden shoulder mantle and a warm blend on the mid back
  const sc = (r: V3, k: number): V3 => [r[0] * k, r[1] * k, r[2] * k];
  bands(segs[2].c, sc(segs[2].r, 1.02), spine2, [[K.gold, 0, 46]], { w: 14, h: 10 });
  bands(segs[1].c, sc(segs[1].r, 1.015), spine1, [[K.front, 0, 36]], { w: 14, h: 10 });

  // neck
  bands([0, 0.24, 0.19], [0.074, 0.068, 0.07], neck, [[K.gold, 0, 92], [K.tan, 92, 180]], { w: 12, h: 8 });
  // collar of fluff where head meets chest
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * PI * 2;
    const base: V3 = [Math.cos(a) * 0.066, 0.238 + Math.sin(a) * 0.062, 0.172];
    const dv = new THREE.Vector3(Math.cos(a) * 0.35, Math.sin(a) * 0.35 - 0.02, 0.9).normalize();
    const tip = toV(base).addScaledVector(dv, 0.032);
    Cone(Math.sin(a) > -0.2 ? K.goldLt : K.tan, base, arr(tip), 0.012, neck, 4);
  }

  // fur tufts over the torso
  for (const sg of segs) {
    for (const s of [1, -1]) {
      fuzz(sg.c, sg.r, sg.bone, sg.top, 3, 62 * s, 118 * s, 18, 58, 0.032, 0.011);
      fuzz(sg.c, sg.r, sg.bone, K.flank, 2, 70 * s, 110 * s, -12, 14, 0.03, 0.011);
      fuzz(sg.c, sg.r, sg.bone, K.belly, 2, 60 * s, 120 * s, -62, -34, 0.03, 0.011);
    }
    fuzz(sg.c, sg.r, sg.bone, sg.top, 3, -40, 40, 66, 84, 0.03, 0.011);
  }
  fuzz(segs[2].c, segs[2].r, spine2, K.gold, 5, -60, 60, 40, 80, 0.03, 0.011);

  // ================================================================== TAIL
  const tp: V3[] = [
    [0, 0.212, -0.22],
    [0, 0.226, -0.295],
    [0, 0.233, -0.375],
    [0, 0.231, -0.455],
    [0, 0.221, -0.53],
    [0, 0.205, -0.6],
    [0, 0.186, -0.662],
  ];
  const tr = [0.034, 0.052, 0.063, 0.065, 0.059, 0.046, 0.024];
  const tj: any[] = [];
  tp.forEach((p, i) => {
    tj.push(J("tail" + (i + 1), p, i === 0 ? hips : tj[i - 1], "tail"));
  });
  const segCols: [string, string][] = [
    [K.tailA, K.tailB],
    [K.tailA, K.tailB],
    [K.tailA, K.tailB],
    [K.tailA, K.tailB],
    [K.tailC, K.tailD],
    [K.tailE, K.tailF],
  ];
  for (let i = 0; i < 6; i++) {
    const A = tp[i];
    const B = tp[i + 1];
    const f = 0.58;
    const M = mix(A, B, f);
    const rm = tr[i] + (tr[i + 1] - tr[i]) * f;
    const ax = toV(B).sub(toV(A)).normalize();
    R(segCols[i][0], A, M, tr[i], rm, tj[i], 8, { spin: i * 0.4 });
    R(segCols[i][1], M, B, rm, tr[i + 1], tj[i], 8, { spin: i * 0.4 + 0.2 });
    if (i > 0) fringe(A, ax, tr[i] * 0.9, segCols[i][0], tj[i], 7, i * 0.45, 0.04);
    fringe(M, ax, rm * 0.9, segCols[i][1], tj[i], 7, i * 0.45 + 0.4, 0.03);
  }
  // dark tip and brush
  const aEnd = toV(tp[6]).sub(toV(tp[5])).normalize();
  E(K.tailTip, arr(toV(tp[6]).addScaledVector(aEnd, 0.012)), [0.027, 0.027, 0.04], tj[6], {
    rot: [-0.3, 0, 0],
    w: 9,
    h: 6,
  });
  {
    const [u, w] = perp(aEnd);
    for (let k = 0; k < 5; k++) {
      const ang = (k / 5) * PI * 2;
      const radial = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
      const base = toV(tp[6]).addScaledVector(aEnd, 0.03).addScaledVector(radial, 0.012);
      const tip = base.clone().addScaledVector(aEnd, 0.035).addScaledVector(radial, 0.003);
      Cone(K.tailTip, arr(base), arr(tip), 0.012, tj[6], 4);
    }
  }

  // ================================================================== LEGS
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // ---- front leg
    const sh = J("shoulder" + L, [0.074 * s, 0.188, 0.11], spine2, "leg");
    const el = J("elbow" + L, [0.078 * s, 0.108, 0.098], sh, "leg");
    const wr = J("wrist" + L, [0.077 * s, 0.04, 0.118], el, "leg");
    const pw = J("paw" + L, [0.077 * s, 0.016, 0.155], wr, "leg");

    bands([0.072 * s, 0.152, 0.105], [0.036, 0.064, 0.05], sh,
      [[K.flank, 0, 62], [K.legWarm, 62, 100], [K.leg, 100, 180]], { w: 10, h: 8, rot: [0.1, 0, 0.05 * s] });
    R(K.leg, [0.078 * s, 0.108, 0.098], [0.077 * s, 0.04, 0.118], 0.03, 0.022, el, 7);
    E(K.legWarm, [0.078 * s, 0.108, 0.098], [0.03, 0.03, 0.03], el, { w: 8, h: 6 });
    E(K.leg, [0.077 * s, 0.04, 0.118], [0.023, 0.023, 0.023], wr, { w: 8, h: 6 });
    E(K.leg, [0.077 * s, 0.0195, 0.14], [0.027, 0.0205, 0.04], wr, { w: 10, h: 6 });
    toes(pw, 0.077 * s, 0.0095, 0.17);
    Cone(K.flank, [0.082 * s, 0.116, 0.084], [0.086 * s, 0.104, 0.054], 0.012, el, 4);
    Cone(K.legWarm, [0.074 * s, 0.1, 0.082], [0.076 * s, 0.084, 0.056], 0.011, el, 4);

    // ---- hind leg
    const hp = J("hip" + L, [0.078 * s, 0.172, -0.165], hips, "leg");
    const kn = J("knee" + L, [0.088 * s, 0.1, -0.14], hp, "leg");
    const an = J("ankle" + L, [0.082 * s, 0.042, -0.19], kn, "leg");
    const ft = J("foot" + L, [0.082 * s, 0.016, -0.135], an, "leg");

    bands([0.075 * s, 0.15, -0.152], [0.047, 0.078, 0.082], hp,
      [[K.rump, 0, 60], [K.flank, 60, 100], [K.leg, 100, 180]], { w: 12, h: 8, rot: [-0.25, 0, 0] });
    R(K.leg, [0.088 * s, 0.1, -0.14], [0.082 * s, 0.042, -0.19], 0.034, 0.022, kn, 7);
    E(K.leg, [0.088 * s, 0.1, -0.14], [0.034, 0.034, 0.034], kn, { w: 8, h: 6 });
    E(K.leg, [0.082 * s, 0.042, -0.19], [0.024, 0.026, 0.026], an, { w: 8, h: 6 });
    E(K.leg, [0.082 * s, 0.0195, -0.15], [0.028, 0.0205, 0.048], an, { w: 10, h: 6 });
    toes(ft, 0.082 * s, 0.0095, -0.108);
    Cone(K.legWarm, [0.082 * s, 0.052, -0.205], [0.082 * s, 0.066, -0.236], 0.012, an, 4);
    Cone(K.flank, [0.09 * s, 0.13, -0.19], [0.094 * s, 0.116, -0.222], 0.014, hp, 4);
    Cone(K.flank, [0.086 * s, 0.108, -0.2], [0.09 * s, 0.092, -0.228], 0.013, hp, 4);
  }

  // ================================================================== HEAD
  const HC: V3 = [0, 0.264, 0.262];
  const HR: V3 = [0.066, 0.058, 0.062];
  const MC: V3 = [0, 0.245, 0.316];
  const MR: V3 = [0.03, 0.024, 0.03];
  const JC: V3 = [0, 0.2315, 0.3];
  const JR: V3 = [0.025, 0.0135, 0.033];
  const CKr: V3 = [0.037, 0.028, 0.043];

  // skull and muzzle
  bands(HC, HR, head, [[K.goldLt, 0, 40], [K.gold, 40, 95], [K.tan, 95, 180]], { w: 14, h: 10 });
  bands(MC, MR, head, [[K.white, 0, 118], [K.cream, 118, 180]], { w: 11, h: 7 });

  // nose
  const np = ep(MC, MR, 0, 22, 1.0);
  E(K.nose, [np[0], np[1], np[2] - 0.0005], [0.0115, 0.0078, 0.0088], head, { w: 9, h: 6 });
  E(K.nose, [np[0], np[1] - 0.0048, np[2] + 0.0007], [0.0068, 0.0052, 0.0065], head, { w: 8, h: 5 });
  E(K.noseHi, [np[0], np[1] + 0.0058, np[2] + 0.0028], [0.0042, 0.0016, 0.0032], head, {
    w: 6, h: 3, rot: [-0.5, 0, 0],
  });
  // philtrum
  S(K.ring, MC, MR, [[0, 6], [0, -26]], 0.0011, head);

  // lower jaw (its own bone so the mouth can open)
  bands(JC, JR, jaw, [[K.white, 0, 100], [K.cream, 100, 180]], { w: 10, h: 6 });
  E(K.mouth, [0, 0.2395, 0.298], [0.02, 0.0035, 0.028], jaw, { w: 8, h: 4 });
  E(K.tongue, [0, 0.2405, 0.304], [0.012, 0.0035, 0.022], jaw, { w: 8, h: 4 });
  for (const az of [-22, 0, 22]) {
    const p = ep(JC, JR, az, -52, 0.95);
    const tip = toV(p).add(new THREE.Vector3(az * 0.0004, -0.012, -0.012));
    Cone(K.cream, p, arr(tip), 0.008, jaw, 4);
  }

  // forehead tufts
  for (const [az, el] of [[-14, 76], [0, 80], [14, 76]]) {
    const p = ep(HC, HR, az, el, 0.97);
    const tip = toV(p).add(new THREE.Vector3(az * 0.0006, 0.02, -0.012));
    Cone(K.goldLt, p, arr(tip), 0.009, head, 4);
  }

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // cheeks
    const CKc: V3 = [0.037 * s, 0.244, 0.281];
    bands(CKc, CKr, head, [[K.white, 0, 105], [K.cream, 105, 180]], { w: 10, h: 7 });
    for (const [az, el] of [[72, 34], [84, 14], [96, -6], [108, -24], [120, -42]]) {
      const p = ep(CKc, CKr, az * s, el, 0.96);
      const nrm = en(CKc, CKr, p);
      const dv = nrm.clone().multiplyScalar(0.75).add(new THREE.Vector3(0, -0.12, -0.62)).normalize();
      const tip = toV(p).addScaledVector(dv, 0.022 + rand() * 0.006);
      Cone(az > 100 ? K.cream : K.white, p, arr(tip), 0.0095, head, 4);
    }

    // tear lines
    S(K.tear, CKc, CKr, [[-10 * s, 40], [-4 * s, 15], [4 * s, -12], [12 * s, -35]], 0.0034, head);
    // mouth line
    S(K.ring, MC, MR, [[0, -26], [28 * s, -30], [55 * s, -26], [75 * s, -14]], 0.0011, head);

    // upper fangs (hidden while the jaw is closed)
    Cone(K.claw, [0.011 * s, 0.2285, 0.326], [0.0113 * s, 0.2235, 0.3265], 0.0035, head, 4);
    // lower fangs
    Cone(K.claw, [0.011 * s, 0.236, 0.326], [0.0113 * s, 0.2485, 0.3265], 0.0032, jaw, 4);

    // eyes
    const eyeP = ep(HC, HR, 27 * s, 12, 0.985);
    const eye = J("eye" + L, eyeP, head);
    D(K.ring, HC, HR, 27 * s, 12, [0.0135, 0.0125], head, { th: 0.004 });
    D(K.white, HC, HR, 25 * s, 30, [0.0125, 0.0062], head, { spin: 0.35 * s });
    E(K.black, eyeP, [0.0095, 0.0105, 0.0095], eye, { w: 10, h: 7 });
    {
      const n = en(HC, HR, eyeP);
      const up = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
      const side = new THREE.Vector3(1, 0, 0).addScaledVector(n, -n.x).normalize();
      const h1 = toV(eyeP).addScaledVector(n, 0.0082).addScaledVector(up, 0.0035).addScaledVector(side, -0.0028 * s);
      E(K.shine, arr(h1), [0.0027, 0.0027, 0.0027], eye, { w: 6, h: 4 });
      const h2 = toV(eyeP).addScaledVector(n, 0.0086).addScaledVector(up, -0.003).addScaledVector(side, 0.0025 * s);
      E(K.shine, arr(h2), [0.0013, 0.0013, 0.0013], eye, { w: 5, h: 3 });
    }

    // whiskers
    const wEnd: V3[] = [
      [0.068, 0.256, 0.354],
      [0.073, 0.242, 0.344],
      [0.067, 0.228, 0.331],
    ];
    for (let j = 0; j < 3; j++) {
      R(K.whisker, [0.02 * s, 0.243 + (j - 1) * 0.004, 0.331], [wEnd[j][0] * s, wEnd[j][1], wEnd[j][2]],
        0.0007, 0.0004, head, 3);
    }

    // ears
    const base: V3 = [0.043 * s, 0.303, 0.243];
    const ear = J("ear" + L, base, head, "hinge");
    const tilt: V3 = [0.16, 0.34 * s, -0.34 * s];
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt[0], tilt[1], tilt[2], "XYZ"));
    const at = (x: number, y: number, z: number): V3 =>
      arr(toV(base).add(new THREE.Vector3(x, y, z).applyQuaternion(q)));
    P(new THREE.CylinderGeometry(0.014, 0.036, 0.056, 7), K.earOut, base, ear, {
      pivot: [0, 0.028, 0], scale: [1, 1, 0.5], rot: tilt,
    });
    E(K.earTip, at(0, 0.0555, 0), [0.0145, 0.012, 0.0075], ear, { rot: tilt, w: 7, h: 5 });
    P(new THREE.CylinderGeometry(0.0095, 0.027, 0.047, 7), K.earIn, at(0, 0.004, 0.0085), ear, {
      pivot: [0, 0.0235, 0], scale: [1, 1, 0.45], rot: tilt,
    });
    E(K.earIn, at(0, 0.0505, 0.0085), [0.0098, 0.009, 0.0042], ear, { rot: tilt, w: 7, h: 5 });
    for (const x of [-0.011, 0, 0.011]) {
      Cone(K.earIn, at(x, 0.006, 0.018), at(x * 1.4, 0.027, 0.021), 0.005, ear, 4);
    }
  }

  return b.root;
}
