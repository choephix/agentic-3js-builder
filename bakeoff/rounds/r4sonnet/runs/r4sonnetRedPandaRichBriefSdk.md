```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Red Panda on a Mossy Branch",
  description:
    "A delighted red panda balancing on a mossy branch between two stones: rusty back, black belly and legs, a round white face with red tear marks, white-rimmed ears, a big cream-and-ginger ringed tail and a bamboo shoot gripped in one raised paw. Rigged with root, hips, spine, neck, head, jaw, ears, four legs and a nine-joint tail.",
};

type V3 = [number, number, number];
type VecLike = V3 | THREE.Vector3;
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ palette
const C = {
  rust: "#c4521b", rustDark: "#9e3b14", rustLight: "#de7a2e", ginger: "#d9702a",
  cream: "#f3deb0", creamShade: "#e3c88e", white: "#fbf5e9",
  black: "#2a1f1e", blackSoft: "#3b2b29", nose: "#120c0c",
  eye: "#1b1110", shine: "#ffffff", eyePatch: "#8a3516", tear: "#b8431a",
  tongue: "#ee7d92", mouth: "#72202c", earIn: "#f7e6d8", blush: "#f4b09a",
  tailTip: "#5d2c15", claw: "#efe4cc",
  bark: "#6b4a2f", barkDark: "#4d3422", barkLight: "#8a643f", woodCut: "#d9b27a", woodRing: "#b98c53",
  moss1: "#5d8f2e", moss2: "#7ab03c", moss3: "#3e6b25", moss4: "#a1c653",
  rock: "#8b8e92", rockDark: "#6b6f75", rockLight: "#a9acaf",
  bamboo: "#8cc152", bambooLight: "#a3d166", bambooDark: "#5f9a33", bambooTop: "#c7d48a", bambooCut: "#e4efb5",
  leaf1: "#4fa63a", leaf2: "#74c04a",
  flowerY: "#f6d24a", capRed: "#d8433a", stem: "#efe3c8",
};

// Deterministic randomness: the SDK's rng when it behaves like a function, else a tiny fallback.
function makeRand(seed: number): () => number {
  try {
    const r: any = rng(seed);
    const fn: any = typeof r === "function" ? r : r && (r.next || r.random || r.float || r.value);
    if (typeof fn === "function") {
      const f = () => fn.call(r);
      const t = f();
      if (typeof t === "number" && t >= 0 && t < 1) return f;
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

type Frame = { c: THREE.Vector3; A: THREE.Vector3; B: THREE.Vector3 };

// A tube (or a sector of one) along a frame function; (A, B, tangent) must be right-handed.
function tubeGeo(
  frameAt: (u: number) => Frame,
  u0: number,
  u1: number,
  steps: number,
  radius: (u: number, i: number) => number,
  sides: number,
  a0 = 0,
  a1 = Math.PI * 2,
): THREE.BufferGeometry {
  const nA = Math.max(1, Math.round((sides * (a1 - a0)) / (Math.PI * 2)));
  const rings: THREE.Vector3[][] = [];
  for (let i = 0; i <= steps; i++) {
    const u = u0 + ((u1 - u0) * i) / steps;
    const f = frameAt(u);
    const r = radius(u, i);
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j <= nA; j++) {
      const a = a0 + ((a1 - a0) * j) / nA;
      ring.push(f.c.clone().addScaledVector(f.A, Math.cos(a) * r).addScaledVector(f.B, Math.sin(a) * r));
    }
    rings.push(ring);
  }
  const pos: number[] = [];
  const uv: number[] = [];
  const push = (p: THREE.Vector3, s: number, t: number) => {
    pos.push(p.x, p.y, p.z);
    uv.push(s, t);
  };
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < nA; j++) {
      const a = rings[i][j], bb = rings[i][j + 1], c = rings[i + 1][j], d = rings[i + 1][j + 1];
      const s0 = j / nA, s1 = (j + 1) / nA, t0 = i / steps, t1 = (i + 1) / steps;
      push(a, s0, t0); push(bb, s1, t0); push(c, s0, t1);
      push(bb, s1, t0); push(d, s1, t1); push(c, s0, t1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

const hash3 = (x: number, y: number, z: number, k: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + k * 19.3) * 43758.5453;
  return s - Math.floor(s);
};
function jitter(g: THREE.BufferGeometry, amt: number) {
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const f = 1 + (hash3(x, y, z, 0) - 0.5) * 2 * amt;
    p.setXYZ(i, x * f, y * f, z * f);
  }
  p.needsUpdate = true;
}

export default function build(): THREE.Object3D {
  const b: any = createBuilder({ name: "red_panda_on_branch" });
  const rand = makeRand(2024);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * rand();

  // ================================================================ helpers
  const vec = (a: VecLike): THREE.Vector3 =>
    a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]);
  const arr = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
  const mid = (a: V3, c: V3): V3 => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  // Right-handed basis whose `axis` column is `dir`, with the next axis leaning towards `hint`.
  const basisMat = (axis: "x" | "y" | "z", dir: VecLike, hint: VecLike = [0, 1, 0]) => {
    const p = vec(dir).normalize();
    const cands = [vec(hint), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)];
    let s = new THREE.Vector3(0, 1, 0);
    for (const c of cands) {
      s = c.clone().addScaledVector(p, -c.dot(p));
      if (s.lengthSq() > 1e-4) break;
    }
    s.normalize();
    let X: THREE.Vector3, Y: THREE.Vector3, Z: THREE.Vector3;
    if (axis === "y") { Y = p; Z = s; X = new THREE.Vector3().crossVectors(Y, Z); }
    else if (axis === "z") { Z = p; Y = s; X = new THREE.Vector3().crossVectors(Y, Z); }
    else { X = p; Y = s; Z = new THREE.Vector3().crossVectors(X, Y); }
    return new THREE.Matrix4().makeBasis(X, Y, Z);
  };
  const align = (g: THREE.BufferGeometry, axis: "x" | "y" | "z", dir: VecLike, hint: VecLike = [0, 1, 0]) =>
    g.applyMatrix4(basisMat(axis, dir, hint));

  // Faceted, non-indexed geometry with uvs, so every part is flat shaded and merges the same way.
  const prep = (g: THREE.BufferGeometry) => {
    const h = g.index ? g.toNonIndexed() : g;
    h.clearGroups();
    if (!h.getAttribute("uv")) {
      h.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(h.getAttribute("position").count * 2), 2));
    }
    h.computeVertexNormals();
    return h;
  };
  const put = (g: THREE.BufferGeometry, color: string, bone: any, at: V3) =>
    b.part(prep(g), color, { at, bone });
  const putAbs = (g: THREE.BufferGeometry, color: string, bone: any) => {
    g.computeBoundingBox();
    const c = g.boundingBox!.getCenter(new THREE.Vector3());
    g.translate(-c.x, -c.y, -c.z);
    return put(g, color, bone, arr(c));
  };

  type EllOpt = { axis?: "x" | "y" | "z"; dir?: VecLike; up?: VecLike; w?: number; h?: number; rotX?: number };
  const ell = (bone: any, color: string, c: V3, r: V3, o: EllOpt = {}) => {
    const g = new THREE.SphereGeometry(1, o.w ?? 10, o.h ?? 7);
    g.scale(r[0], r[1], r[2]);
    if (o.rotX) g.rotateX(o.rotX);
    if (o.dir) align(g, o.axis ?? "z", o.dir, o.up ?? [0, 1, 0]);
    return put(g, color, bone, c);
  };
  const ball = (bone: any, color: string, c: V3, r: number, w = 8, h = 6) =>
    ell(bone, color, c, [r, r, r], { w, h });

  // A cone with its base centre at `base`, its tip along `dir`: fur tufts, claws, blades, whiskers.
  const tuft = (bone: any, color: string, base: V3, dir: VecLike, len: number, r: number, sides = 5) => {
    const g = new THREE.ConeGeometry(r, len, sides, 1);
    g.translate(0, len / 2, 0);
    align(g, "y", dir);
    return put(g, color, bone, base);
  };
  // A tapered limb piece from a to c (radius r1 at a, r2 at c).
  const seg = (bone: any, color: string, a: V3, c: V3, r1: number, r2: number, sides = 8) => {
    const d = vec(c).sub(vec(a));
    const g = new THREE.CylinderGeometry(r2, r1, d.length(), sides, 1);
    align(g, "y", d, [0, 0, 1]);
    return put(g, color, bone, mid(a, c));
  };
  // Point and outward normal on an ellipsoid (azimuth from +Z towards +X, elevation from the horizon).
  const ellSurf = (c: V3, r: V3, azDeg: number, elDeg: number, push = 0) => {
    const az = azDeg * DEG, el = elDeg * DEG;
    const d = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    const n = new THREE.Vector3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
    const p = new THREE.Vector3(c[0] + r[0] * d.x, c[1] + r[1] * d.y, c[2] + r[2] * d.z).addScaledVector(n, push);
    return { p: arr(p), n: arr(n), pv: p, nv: n };
  };

  const leafGeo = (len: number, wid: number, depth = 0.003) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(wid, len * 0.5, 0, len);
    sh.quadraticCurveTo(-wid, len * 0.5, 0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 3 });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  const leaf = (bone: any, color: string, base: V3, dir: VecLike, normalHint: VecLike, len: number, wid: number) => {
    const g = leafGeo(len, wid);
    align(g, "y", dir, normalHint);
    return put(g, color, bone, base);
  };

  // Joint helper: parent given as joint (falls back to its name if the builder wants a string).
  const J = (name: string, at: V3, parent?: any, role?: string): any => {
    let j: any;
    if (!parent) {
      j = b.joint(name, { at });
    } else {
      try {
        j = b.joint(name, { at, parent });
      } catch (e) {
        j = b.joint(name, { at, parent: parent.name });
      }
    }
    try {
      if (role && j && j.userData) j.userData.role = role;
    } catch (e) {
      /* roles are only hints */
    }
    return j;
  };

  // ================================================================ skeleton
  const root = J("root", [0, 0, 0]);
  const hips = J("hips", [0, 0.52, -0.14], root, "spine");
  const spine1 = J("spine1", [0, 0.52, 0.03], hips, "spine");
  const spine2 = J("spine2", [0, 0.525, 0.17], spine1, "spine");
  const neck = J("neck", [0, 0.545, 0.27], spine2, "neck");
  const head = J("head", [0, 0.585, 0.31], neck, "head");
  const JAW: V3 = [0, 0.585, 0.385];
  const jaw = J("jaw", JAW, head, "jaw");

  const H: V3 = [0, 0.64, 0.36];
  const RH: V3 = [0.125, 0.095, 0.105];
  const earBase = (s: number) => ellSurf(H, RH, s * 66, 50, -0.014);
  const earL = J("earL", earBase(1).p, head, "hinge");
  const earR = J("earR", earBase(-1).p, head, "hinge");

  // tail: nine joints along a rainbow arc
  const tailCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.555, -0.255),
      new THREE.Vector3(0, 0.61, -0.35),
      new THREE.Vector3(0.02, 0.65, -0.44),
      new THREE.Vector3(0.05, 0.665, -0.53),
      new THREE.Vector3(0.1, 0.65, -0.61),
      new THREE.Vector3(0.16, 0.61, -0.67),
      new THREE.Vector3(0.21, 0.55, -0.71),
      new THREE.Vector3(0.24, 0.48, -0.73),
    ],
    false,
    "catmullrom",
    0.5,
  );
  const NB = 9;
  const tailJ: any[] = [];
  for (let k = 0; k < NB; k++) {
    tailJ.push(J("tail" + (k + 1), arr(tailCurve.getPointAt(k / NB)), k === 0 ? hips : tailJ[k - 1], "tail"));
  }

  // legs
  const hindPts = (s: number) => ({
    hip: [s * 0.075, 0.47, -0.17] as V3,
    knee: [s * 0.09, 0.415, -0.105] as V3,
    ankle: [s * 0.068, 0.36, -0.2] as V3,
    foot: [s * 0.058, 0.335, -0.14] as V3,
  });
  const frontPts = (s: number) =>
    s > 0
      ? {
          shoulder: [0.085, 0.475, 0.2] as V3,
          elbow: [0.16, 0.43, 0.3] as V3,
          wrist: [0.135, 0.5, 0.44] as V3,
          paw: [0.13, 0.52, 0.47] as V3,
        }
      : {
          shoulder: [-0.085, 0.475, 0.2] as V3,
          elbow: [-0.085, 0.405, 0.205] as V3,
          wrist: [-0.063, 0.352, 0.24] as V3,
          paw: [-0.058, 0.335, 0.262] as V3,
        };
  const L: Record<string, any> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const hp = hindPts(s);
    L["hip" + k] = J("hip" + k, hp.hip, hips, "leg");
    L["knee" + k] = J("knee" + k, hp.knee, L["hip" + k], "leg");
    L["ankle" + k] = J("ankle" + k, hp.ankle, L["knee" + k], "leg");
    L["foot" + k] = J("foot" + k, hp.foot, L["ankle" + k], "leg");
    const fp = frontPts(s);
    L["shoulder" + k] = J("shoulder" + k, fp.shoulder, spine2, "arm");
    L["elbow" + k] = J("elbow" + k, fp.elbow, L["shoulder" + k], "arm");
    L["wrist" + k] = J("wrist" + k, fp.wrist, L["elbow" + k], "arm");
    L["paw" + k] = J("paw" + k, fp.paw, L["wrist" + k], "arm");
  }

  // ================================================================ body
  const blobs: { bone: any; c: V3; r: V3 }[] = [
    { bone: hips, c: [0, 0.52, -0.14], r: [0.12, 0.11, 0.15] },
    { bone: spine1, c: [0, 0.52, 0.03], r: [0.115, 0.105, 0.13] },
    { bone: spine2, c: [0, 0.525, 0.17], r: [0.115, 0.108, 0.12] },
  ];
  const CUT = 100 * DEG;
  blobs.forEach(({ bone, c, r }) => {
    ell(bone, C.black, c, r, { w: 11, h: 7 }); // black belly
    const dome = (k: number, ang: number, color: string) => {
      const g = new THREE.SphereGeometry(1, 11, 6, 0, Math.PI * 2, 0, ang);
      g.scale(r[0] * k, r[1] * k, r[2] * k);
      put(g, color, bone, c);
    };
    dome(1.035, CUT, C.rust); // rusty coat
    dome(1.065, 52 * DEG, C.rustDark); // darker saddle along the spine
    // ragged fur edge where the rust meets the black
    for (const sg of [1, -1]) {
      [38, 62, 86, 110, 134].forEach((ph, i) => {
        const a = sg * ph * DEG;
        const sx = Math.sin(a), cz = Math.cos(a);
        const k = 1.035 * Math.sin(CUT) * 0.97;
        const base: V3 = [
          c[0] + r[0] * k * sx,
          c[1] + r[1] * 1.035 * Math.cos(CUT),
          c[2] + r[2] * k * cz,
        ];
        tuft(bone, i % 3 === 0 ? C.rustLight : C.rust, base, [sx * 0.5, -0.85, -0.3], 0.05, 0.022, 5);
      });
    }
  });
  // dorsal fur tufts
  const topY = (z: number) => {
    let y = 0;
    for (const { c, r } of blobs) {
      const q = (z - c[2]) / (r[2] * 1.035);
      if (Math.abs(q) < 1) y = Math.max(y, c[1] + r[1] * 1.065 * Math.sqrt(1 - q * q));
    }
    return y;
  };
  for (let i = 0; i < 10; i++) {
    const z = -0.24 + i * 0.05;
    const bone = z < -0.05 ? hips : z < 0.1 ? spine1 : spine2;
    tuft(bone, i % 2 ? C.rustLight : C.rustDark, [0, topY(z) - 0.012, z], [0, 0.75, -0.65], 0.045, 0.02, 5);
  }
  // neck: cream throat under a rusty nape
  {
    const c: V3 = [0, 0.55, 0.27], r: V3 = [0.085, 0.078, 0.08];
    ell(neck, C.cream, c, r, { w: 10, h: 7 });
    const g = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, 95 * DEG);
    g.scale(r[0] * 1.04, r[1] * 1.04, r[2] * 1.04);
    put(g, C.rust, neck, c);
  }

  // ================================================================ tail
  {
    const tFr = tailCurve.computeFrenetFrames(120, false);
    const tailFrame = (u: number): Frame & { T: THREE.Vector3 } => {
      const i = Math.min(120, Math.max(0, Math.round(u * 120)));
      return {
        c: tailCurve.getPointAt(u),
        A: tFr.normals[i].clone(),
        B: tFr.binormals[i].clone(),
        T: tFr.tangents[i].clone(),
      };
    };
    const prof = (u: number) => 0.046 + 0.048 * Math.sin(Math.PI * Math.pow(u, 0.85));
    for (let k = 0; k < NB; k++) {
      const u0 = k / NB, u1 = (k + 1) / NB;
      const ginger = k % 2 === 0;
      const bulge = ginger ? 1.06 : 0.985;
      const g = tubeGeo(tailFrame, u0, u1, 2, (u, i) => prof(u) * (i === 1 ? bulge : 1), 9);
      putAbs(g, ginger ? C.ginger : C.cream, tailJ[k]);
      // fluffy tufts on the ring
      const uM = (u0 + u1) / 2;
      const f = tailFrame(uM);
      const rM = prof(uM) * bulge;
      for (let q = 0; q < 4; q++) {
        const a = (q / 4) * Math.PI * 2 + k * 0.9;
        const rad = f.A.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.B, Math.sin(a));
        const base = f.c.clone().addScaledVector(rad, rM * 0.92);
        const dir = rad.clone().multiplyScalar(0.55).addScaledVector(f.T, 0.85);
        tuft(tailJ[k], ginger ? C.rustLight : C.white, arr(base), dir, 0.045, 0.02, 4);
      }
    }
    const fe = tailFrame(1);
    ell(tailJ[NB - 1], C.tailTip, arr(fe.c.clone().addScaledVector(fe.T, 0.024)), [0.05, 0.05, 0.06], {
      dir: fe.T,
      w: 9,
      h: 7,
    });
  }

  // ================================================================ legs and paws
  const paw = (bone: any, c: V3) => {
    ell(bone, C.black, c, [0.037, 0.02, 0.052], { w: 9, h: 6 });
    for (let i = 0; i < 4; i++) {
      const o = i - 1.5;
      const tx = c[0] + o * 0.0165;
      const tz = c[2] + 0.047 - Math.abs(o) * 0.007;
      ball(bone, C.blackSoft, [tx, c[1] - 0.004, tz], 0.0115, 7, 5);
      tuft(bone, C.claw, [tx, c[1] - 0.007, tz + 0.009], [o * 0.15, -0.3, 1], 0.015, 0.0048, 4);
    }
  };

  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const hp = hindPts(s);
    ell(L["hip" + k], C.black, [s * 0.082, 0.455, -0.135], [0.052, 0.075, 0.092], { w: 9, h: 6 });
    seg(L["hip" + k], C.black, hp.hip, hp.knee, 0.05, 0.037);
    ball(L["knee" + k], C.black, hp.knee, 0.038);
    seg(L["knee" + k], C.black, hp.knee, hp.ankle, 0.034, 0.027);
    ball(L["ankle" + k], C.black, hp.ankle, 0.028);
    seg(L["ankle" + k], C.black, hp.ankle, hp.foot, 0.027, 0.025);
    paw(L["foot" + k], [s * 0.056, 0.333, -0.123]);
    tuft(L["ankle" + k], C.blackSoft, [hp.ankle[0], hp.ankle[1] + 0.012, hp.ankle[2] - 0.012], [s * 0.2, 0.3, -1], 0.04, 0.02, 5);

    const fp = frontPts(s);
    ell(L["shoulder" + k], C.black, [s * 0.098, 0.46, 0.2], [0.056, 0.075, 0.08], { w: 9, h: 6 });
    seg(L["shoulder" + k], C.black, fp.shoulder, fp.elbow, 0.05, 0.038);
    ball(L["elbow" + k], C.black, fp.elbow, 0.039);
    seg(L["elbow" + k], C.black, fp.elbow, fp.wrist, 0.037, 0.029);
    ball(L["wrist" + k], C.black, fp.wrist, 0.03);
    tuft(L["elbow" + k], C.blackSoft, [fp.elbow[0] + s * 0.02, fp.elbow[1], fp.elbow[2] - 0.01], [s * 0.8, 0.1, -0.6], 0.04, 0.02, 5);
    if (s < 0) {
      seg(L["wrist" + k], C.black, fp.wrist, fp.paw, 0.029, 0.027);
      paw(L["paw" + k], [-0.056, 0.333, 0.262]);
    }
  }

  // ---- the raised left paw and the bamboo shoot it holds
  {
    const pawJ = L["pawL"];
    const fp = frontPts(1);
    const pawC = fp.paw;
    const bd = vec([-0.15, 0.981, 0.12]).normalize();
    const fwd = new THREE.Vector3(0, 0, 1).addScaledVector(bd, -bd.z).normalize();
    const sideV = new THREE.Vector3().crossVectors(bd, fwd).normalize();
    const PT = (t: number) => vec(pawC).addScaledVector(bd, -0.12 + 0.46 * t);
    const rad = (t: number) => 0.0175 + (0.0125 - 0.0175) * t;

    // stalk: internodes, node rings, pale cut end, young pointed tip
    const ts = [0, 0.2, 0.42, 0.65, 0.85, 1];
    for (let i = 0; i < ts.length - 1; i++) {
      seg(pawJ, i % 2 ? C.bambooLight : C.bamboo, arr(PT(ts[i])), arr(PT(ts[i + 1])), rad(ts[i]), rad(ts[i + 1]), 8);
    }
    for (let i = 1; i < ts.length - 1; i++) {
      const g = new THREE.CylinderGeometry(rad(ts[i]) + 0.0035, rad(ts[i]) + 0.0035, 0.01, 8, 1);
      align(g, "y", bd);
      put(g, C.bambooDark, pawJ, arr(PT(ts[i])));
    }
    {
      const g = new THREE.CylinderGeometry(0.0165, 0.0165, 0.006, 8, 1);
      align(g, "y", bd);
      put(g, C.bambooCut, pawJ, arr(PT(0).addScaledVector(bd, -0.002)));
    }
    tuft(pawJ, C.bambooTop, arr(PT(1).addScaledVector(bd, -0.004)), bd, 0.055, 0.0128, 6);

    // leaves fanning from the upper nodes
    const e1 = new THREE.Vector3().crossVectors(bd, new THREE.Vector3(0, 0, 1)).normalize();
    const e2 = new THREE.Vector3().crossVectors(bd, e1).normalize();
    const leafAt = (t: number, ang: number, lift: number, len: number, col: string) => {
      const radial = e1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(e2, Math.sin(ang));
      const dir = radial.clone().multiplyScalar(0.9).addScaledVector(bd, lift).normalize();
      leaf(pawJ, col, arr(PT(t).addScaledVector(radial, rad(t) * 0.8)), dir, bd, len, 0.034);
    };
    [0, 2.1, 4.2].forEach((a, i) => leafAt(0.65, a + 0.4, 0.15, 0.13, i % 2 ? C.leaf1 : C.leaf2));
    [1.0, 3.1, 5.2].forEach((a, i) => leafAt(0.85, a, 0.55, 0.14, i % 2 ? C.leaf2 : C.leaf1));
    leafAt(0.97, 0.3, 0.9, 0.12, C.leaf2);
    leafAt(0.97, 3.6, 0.9, 0.12, C.leaf1);

    // the hand: palm behind the stalk, four fingers across the front, a thumb
    ell(pawJ, C.black, arr(vec(pawC).addScaledVector(fwd, -0.016)), [0.034, 0.036, 0.026], {
      axis: "y", dir: bd, up: fwd, w: 9, h: 6,
    });
    for (let q = 0; q < 4; q++) {
      const c = vec(pawC)
        .addScaledVector(bd, (q - 1.5) * 0.0165)
        .addScaledVector(fwd, 0.0175)
        .addScaledVector(sideV, 0.004);
      ell(pawJ, C.blackSoft, arr(c), [0.025, 0.0095, 0.0095], { axis: "y", dir: bd, up: fwd, w: 8, h: 5 });
      const tip = c.clone().addScaledVector(sideV, 0.022);
      tuft(pawJ, C.claw, arr(tip), sideV.clone().multiplyScalar(0.6).addScaledVector(fwd, 0.7), 0.014, 0.0045, 4);
    }
    ball(pawJ, C.blackSoft, arr(vec(pawC).addScaledVector(sideV, -0.03).addScaledVector(bd, -0.012)), 0.0125, 7, 5);
    seg(L["wristL"], C.black, fp.wrist, arr(vec(pawC).addScaledVector(fwd, -0.014)), 0.029, 0.027);
  }

  // ================================================================ head
  ell(head, C.white, H, RH, { w: 12, h: 8 });
  // rusty crown tilted back over the skull
  {
    const AX = 85 * DEG;
    const cap = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, AX);
    cap.rotateX(-0.55);
    cap.scale(RH[0] * 1.03, RH[1] * 1.03, RH[2] * 1.03);
    put(cap, C.rust, head, H);
    // fringe of fur tufts along the crown edge
    const axisU = new THREE.Vector3(0, Math.cos(-0.55), Math.sin(-0.55));
    const e1 = new THREE.Vector3(1, 0, 0);
    const e2 = new THREE.Vector3().crossVectors(axisU, e1).normalize();
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      const e = e1.clone().multiplyScalar(Math.cos(t)).addScaledVector(e2, Math.sin(t));
      const dir = axisU.clone().multiplyScalar(Math.cos(AX)).addScaledVector(e, Math.sin(AX));
      const tan = axisU.clone().multiplyScalar(-Math.sin(AX)).addScaledVector(e, Math.cos(AX));
      const k = 1.03;
      const p = new THREE.Vector3(H[0] + RH[0] * k * dir.x, H[1] + RH[1] * k * dir.y, H[2] + RH[2] * k * dir.z);
      const n = new THREE.Vector3(dir.x / RH[0], dir.y / RH[1], dir.z / RH[2]).normalize();
      const tw = new THREE.Vector3(tan.x * RH[0], tan.y * RH[1], tan.z * RH[2]).normalize();
      const d = n.clone().multiplyScalar(0.5).addScaledVector(tw, 0.9);
      tuft(head, i % 2 ? C.rustLight : C.rust, arr(p.addScaledVector(n, -0.006)), d, 0.04, 0.02, 5);
    }
  }

  // muzzle, nose, whiskers
  const M: V3 = [0, 0.605, 0.45];
  const RM: V3 = [0.048, 0.04, 0.058];
  ell(head, C.white, M, RM, { w: 10, h: 7 });
  ell(head, C.nose, [0, 0.626, 0.5025], [0.0195, 0.0135, 0.0145], { w: 8, h: 6 });
  ball(head, C.blackSoft, [-0.006, 0.6325, 0.5105], 0.0042, 5, 4);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      tuft(head, C.white, [s * 0.036, 0.598 - i * 0.008, 0.478], [s * 0.85, 0.12 - i * 0.14, -0.35], 0.075, 0.0016, 3);
    }
  }

  // mouth: dark cavity, upper jaw is the muzzle, lower jaw hangs open on the jaw joint
  const OPEN = 0.25;
  const rotJaw = (p: V3): V3 => {
    const dy = p[1] - JAW[1], dz = p[2] - JAW[2];
    return [p[0], JAW[1] + dy * Math.cos(OPEN) - dz * Math.sin(OPEN), JAW[2] + dy * Math.sin(OPEN) + dz * Math.cos(OPEN)];
  };
  ell(head, C.mouth, [0, 0.561, 0.452], [0.03, 0.013, 0.04], { w: 8, h: 5 });
  ell(jaw, C.white, rotJaw([0, 0.556, 0.445]), [0.04, 0.019, 0.052], { rotX: OPEN, w: 9, h: 6 });
  ell(jaw, C.tongue, rotJaw([0, 0.574, 0.465]), [0.02, 0.007, 0.03], { rotX: OPEN, w: 8, h: 5 });
  for (const x of [-0.02, 0, 0.02]) {
    tuft(jaw, C.white, rotJaw([x, 0.545, 0.44]), [x * 8, -1, 0.35], 0.035, 0.012, 4);
  }

  // eyes: patch, big glossy eye, two sparkles
  for (const s of [1, -1]) {
    const e = ellSurf(H, RH, s * 36, 6, 0.001);
    const Mt = basisMat("z", e.n, [0, 1, 0]);
    const off = (c: V3, ox: number, oy: number, oz: number): V3 => {
      const q = new THREE.Vector3(ox, oy, oz).applyMatrix4(Mt);
      return [c[0] + q.x, c[1] + q.y, c[2] + q.z];
    };
    ell(head, C.eyePatch, e.p, [0.028, 0.032, 0.006], { dir: e.n, w: 9, h: 6 });
    const ec = off(e.p, 0, 0, 0.004);
    ell(head, C.eye, ec, [0.0215, 0.0255, 0.0125], { dir: e.n, w: 10, h: 8 });
    ell(head, C.shine, off(ec, -s * 0.007, 0.009, 0.0105), [0.0065, 0.0065, 0.0065], { w: 6, h: 5 });
    ell(head, C.shine, off(ec, s * 0.008, -0.01, 0.0095), [0.0033, 0.0033, 0.0033], { w: 5, h: 4 });
    // rosy cheek
    const bl = ellSurf(H, RH, s * 64, -10, 0.001);
    ell(head, C.blush, bl.p, [0.02, 0.014, 0.004], { dir: bl.n, w: 8, h: 5 });
  }

  // red tear marks running from the eyes towards the mouth
  {
    const az = [33, 35, 38, 42, 46, 49];
    const el = [-10, -19, -28, -37, -46, -54];
    const wd = [0.0098, 0.0092, 0.0082, 0.0072, 0.006, 0.0045];
    for (const s of [1, -1]) {
      const pts = az.map((a, i) => ellSurf(H, RH, s * a, el[i], 0.003));
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], c = pts[i + 1];
        const tan = c.pv.clone().sub(a.pv);
        const hl = tan.length() * 0.62;
        const cen = a.pv.clone().add(c.pv).multiplyScalar(0.5);
        const n = a.nv.clone().add(c.nv).normalize();
        ell(head, C.tear, arr(cen), [wd[i], hl, 0.0045], { dir: n, up: tan, w: 7, h: 4 });
      }
    }
  }

  // fluffy cheeks and side whiskers of fur
  for (const s of [1, -1]) {
    const azs = [58, 74, 92, 112, 134, 156];
    const els = [-24, -30, -32, -30, -26, -22];
    azs.forEach((az, i) => {
      const e = ellSurf(H, RH, s * az, els[i], -0.01);
      const dir = e.nv.clone().multiplyScalar(0.8).add(new THREE.Vector3(0, -0.45, i >= 3 ? -0.35 : 0.05));
      tuft(head, i % 2 ? C.cream : C.white, e.p, dir, 0.055 - i * 0.002, 0.024, 5);
    });
    [100, 125, 150].forEach((az, i) => {
      const e = ellSurf(H, RH, s * az, -4, -0.01);
      const dir = e.nv.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, -0.15, -0.8));
      tuft(head, i % 2 ? C.white : C.cream, e.p, dir, 0.05, 0.022, 5);
    });
  }

  // ears: white rim, rusty face, soft inner fluff, rusty back
  const buildEar = (bone: any, s: number) => {
    const base = earBase(s);
    const n = new THREE.Vector3(s * 0.42, 0.25, 0.87).normalize();
    const Mt = basisMat("z", n, [s * 0.38, 0.92, -0.1]);
    const earShape = (w: number, h: number, depth: number) => {
      const sh = new THREE.Shape();
      sh.moveTo(-w / 2, 0);
      sh.lineTo(w / 2, 0);
      sh.quadraticCurveTo(w * 0.5, h * 0.55, 0, h);
      sh.quadraticCurveTo(-w * 0.5, h * 0.55, -w / 2, 0);
      return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 3 });
    };
    const layer = (w: number, h: number, depth: number, oy: number, oz: number, color: string) => {
      const g = earShape(w, h, depth);
      g.translate(0, oy, oz);
      g.applyMatrix4(Mt);
      put(g, color, bone, base.p);
    };
    layer(0.11, 0.115, 0.01, -0.022, -0.01, C.rustDark); // back
    layer(0.11, 0.115, 0.014, -0.022, 0, C.white); // rim
    layer(0.086, 0.09, 0.012, -0.015, 0.01, C.rust); // face
    layer(0.054, 0.056, 0.008, -0.009, 0.02, C.earIn); // inner fluff
    [[-0.014, 0.008], [0, 0.014], [0.014, 0.008]].forEach(([lx, ly], i) => {
      const o = new THREE.Vector3(lx, ly, 0.026).applyMatrix4(Mt);
      const d = new THREE.Vector3(lx * 6, 1, 0.5).applyMatrix4(Mt);
      tuft(bone, C.white, [base.p[0] + o.x, base.p[1] + o.y, base.p[2] + o.z], d, 0.03 + (i === 1 ? 0.008 : 0), 0.008, 4);
    });
  };
  buildEar(earL, 1);
  buildEar(earR, -1);

  // ================================================================ branch and scenery (on the root joint)
  const brCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.225, -1.05),
      new THREE.Vector3(0, 0.23, -0.6),
      new THREE.Vector3(0, 0.23, -0.2),
      new THREE.Vector3(0, 0.23, 0.25),
      new THREE.Vector3(0, 0.23, 0.65),
      new THREE.Vector3(0, 0.245, 1.0),
    ],
    false,
    "centripetal",
  );
  const Yup = new THREE.Vector3(0, 1, 0);
  const brFrame = (u: number): Frame & { T: THREE.Vector3 } => {
    const c = brCurve.getPointAt(u);
    const T = brCurve.getTangentAt(u).normalize();
    const S = new THREE.Vector3().crossVectors(Yup, T).normalize();
    const U = new THREE.Vector3().crossVectors(T, S).normalize();
    return { c, T, A: S, B: U };
  };
  const brR = (u: number) => {
    const taper = 1 - 0.1 * Math.max(0, (u - 0.9) / 0.1) - 0.08 * Math.max(0, (0.08 - u) / 0.08);
    return (0.1 + 0.005 * Math.sin(u * 31) + 0.004 * Math.sin(u * 13 + 1)) * taper;
  };
  // angle a: 0 = +X side, 90 deg = top, 180 deg = -X side, 270 deg = underside
  const brPt = (u: number, ang: number, out = 0) => {
    const f = brFrame(u);
    const dir = f.A.clone().multiplyScalar(Math.cos(ang)).addScaledVector(f.B, Math.sin(ang));
    return { p: f.c.clone().addScaledVector(dir, brR(u) + out), n: dir, T: f.T };
  };

  // bark: a patchwork of tube sectors
  {
    const barkCols = [C.bark, C.barkLight, C.barkDark, C.bark, C.barkLight];
    const CH = 12;
    for (let i = 0; i < CH; i++) {
      for (let j = 0; j < 5; j++) {
        const g = tubeGeo(brFrame, i / CH, (i + 1) / CH, 2, (u) => brR(u), 10, (j * 2 * Math.PI) / 5, ((j + 1) * 2 * Math.PI) / 5);
        putAbs(g, barkCols[(i * 2 + j * 3 + ((i + j) % 2)) % 5], root);
      }
    }
    // sawn ends with growth rings
    [0, 1].forEach((u) => {
      const f = brFrame(u);
      const out = f.T.clone().multiplyScalar(u === 0 ? -1 : 1);
      const r = brR(u);
      const disc = (rad: number, h: number, col: string) => {
        const g = new THREE.CylinderGeometry(rad, rad, h, 10, 1);
        align(g, "y", out);
        put(g, col, root, arr(f.c.clone().addScaledVector(out, 0.003)));
      };
      disc(r * 0.96, 0.012, C.woodCut);
      disc(r * 0.64, 0.016, C.woodRing);
      disc(r * 0.34, 0.02, C.woodCut);
      disc(r * 0.1, 0.024, C.woodRing);
    });
    // knots and a snapped stub
    [[0.18, 200], [0.74, 150], [0.55, 330]].forEach(([u, a]) => {
      const h = brPt(u, a * DEG, 0.002);
      ell(root, C.barkDark, arr(h.p), [0.026, 0.012, 0.026], { axis: "y", dir: h.n, up: h.T, w: 7, h: 4 });
    });
    {
      const h = brPt(0.82, 205 * DEG, -0.01);
      seg(root, C.barkLight, arr(h.p), arr(h.p.clone().addScaledVector(h.n, 0.08).add(new THREE.Vector3(0, -0.02, 0))), 0.026, 0.017, 7);
    }
  }

  // stones holding the branch up
  const rock = (c: V3, r: V3, color: string) => {
    const g = new THREE.IcosahedronGeometry(1, 1);
    jitter(g, 0.12);
    g.scale(r[0], r[1], r[2]);
    put(g, color, root, c);
  };
  rock([0.03, 0.064, 0.6], [0.2, 0.07, 0.17], C.rock);
  rock([-0.13, 0.058, 0.68], [0.1, 0.05, 0.09], C.rockDark);
  rock([-0.02, 0.064, -0.62], [0.21, 0.07, 0.17], C.rockLight);
  rock([0.14, 0.055, -0.72], [0.09, 0.045, 0.08], C.rock);
  rock([0.26, 0.028, 0.5], [0.05, 0.03, 0.045], C.rockDark);
  rock([-0.24, 0.026, -0.5], [0.045, 0.028, 0.04], C.rock);

  // moss
  const mossCols = [C.moss1, C.moss2, C.moss3, C.moss4];
  const mossBlob = (bone: any, p: V3, n: VecLike, T: VecLike, size: number, col?: string) => {
    const g = new THREE.SphereGeometry(1, 6, 4);
    g.scale(size, size * 0.55, size * 1.25);
    g.applyMatrix4(basisMat("y", n, T));
    const nn = vec(n).normalize();
    put(
      g,
      col ?? mossCols[Math.floor(rand() * 4)],
      bone,
      [p[0] + nn.x * size * 0.2, p[1] + nn.y * size * 0.2, p[2] + nn.z * size * 0.2],
    );
  };
  const spots: { p: V3; n: THREE.Vector3; T: THREE.Vector3; size: number }[] = [];
  const inPawZone = (deg: number, z: number) => deg > 38 && deg < 142 && z > -0.36 && z < 0.38;
  {
    let placed = 0, guard = 0;
    while (placed < 34 && guard++ < 500) {
      const u = rr(0.02, 0.98);
      const a = rr(-45, 215) * DEG;
      const h = brPt(u, a, 0);
      if (inPawZone(a / DEG, h.p.z)) continue;
      const size = rr(0.028, 0.055);
      mossBlob(root, arr(h.p), h.n, h.T, size);
      spots.push({ p: arr(h.p), n: h.n.clone(), T: h.T.clone(), size });
      for (let k = 0; k < 2; k++) {
        const u2 = Math.min(0.99, Math.max(0.01, u + rr(-0.03, 0.03)));
        const a2 = a + rr(-0.35, 0.35);
        const h2 = brPt(u2, a2, 0);
        if (inPawZone(a2 / DEG, h2.p.z)) continue;
        mossBlob(root, arr(h2.p), h2.n, h2.T, size * rr(0.45, 0.75));
      }
      placed++;
    }
    // hanging moss strands
    for (let i = 0; i < 16; i++) {
      const u = rr(0.04, 0.96);
      const a = rr(205, 335) * DEG;
      const h = brPt(u, a, -0.006);
      const d = h.n.clone().multiplyScalar(0.25).add(new THREE.Vector3(0, -1, 0));
      tuft(root, i % 2 ? C.moss3 : C.moss1, arr(h.p), d, rr(0.05, 0.11), rr(0.012, 0.02), 5);
    }
  }
  // mossy caps on the stones
  [[0.03, 0.135, 0.6, 0.07], [-0.13, 0.1, 0.68, 0.045], [-0.02, 0.135, -0.62, 0.07], [0.14, 0.095, -0.72, 0.04]].forEach(
    ([x, y, z, s]) => {
      mossBlob(root, [x + 0.05, y - 0.01, z + 0.03], [0.1, 1, 0.1], [0, 0, 1], s, C.moss1);
      mossBlob(root, [x - 0.06, y - 0.015, z - 0.04], [-0.1, 1, 0], [0, 0, 1], s * 0.7, C.moss2);
    },
  );

  // tiny flowers on the moss
  [3, 9, 15, 21, 27].forEach((idx, fi) => {
    const sp = spots[idx % Math.max(1, spots.length)];
    if (!sp) return;
    const n = sp.