```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Hatchling Dragon",
  description:
    "A house-cat sized baby dragon sitting proudly beside its broken speckled egg: teal scales fading to a buttery belly, stubby horns, soft orange back spines, oversized amber-membraned wings, a chubby spade tail, big amber eyes, a toothy grin, a shell cap on its head and a wisp of smoke from one nostril.",
};

type Look = string | ((n: THREE.Vector3, p: THREE.Vector3) => THREE.Color) | THREE.Material;

export default function build() {
  const b: any = createBuilder({ name: "hatchling_dragon" });

  // ---------- deterministic randomness ----------
  const R: any = rng(20240611);
  let seed = 1234567;
  const fallback = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const rand = (): number => {
    let v: any;
    try {
      v =
        typeof R === "function"
          ? R()
          : R && typeof R.next === "function"
          ? R.next()
          : R && typeof R.float === "function"
          ? R.float()
          : undefined;
    } catch {
      v = undefined;
    }
    if (typeof v !== "number" || !isFinite(v)) return fallback();
    return v - Math.floor(v);
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const toV = (p: number[]) => V(p[0], p[1], p[2]);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);
  const sm = (a: number, c: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (c - a)));
    return t * t * (3 - 2 * t);
  };

  // ---------- skeleton ----------
  const J: Record<string, any> = {};
  const roles: Record<string, string> = {};
  function joint(name: string, at: THREE.Vector3, parent: string | null, role: string) {
    const opts: any = { at: [at.x, at.y, at.z] };
    if (parent) opts.parent = J[parent];
    J[name] = b.joint(name, opts);
    roles[name] = role;
    return at;
  }

  // ---------- materials ----------
  const matCache = new Map<string, THREE.Material>();
  function flat(color: string, opacity = 1, double = false): THREE.Material {
    const key = color + "|" + opacity + "|" + double;
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.04,
        flatShading: true,
        transparent: opacity < 1,
        opacity,
        depthWrite: opacity >= 1,
        side: double || opacity < 1 ? THREE.DoubleSide : THREE.FrontSide,
      });
      matCache.set(key, m);
    }
    return m;
  }
  const vcMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.72,
    metalness: 0.04,
    flatShading: true,
  });
  const vcMatDouble = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.72,
    metalness: 0.04,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  // palette
  const cTeal = new THREE.Color("#2fb7a6");
  const cDeep = new THREE.Color("#167a7c");
  const cButter = new THREE.Color("#ffe08c");
  const DEEP = "#167a7c";
  const ORANGE = "#ff8a3d";
  const ORANGE_LIGHT = "#ffbe78";
  const CREAM = "#f6e7c1";
  const TOOTH = "#fffaf0";
  const BAND = "#f0b65a";
  const MEMBRANE = "#ffa53a";
  const VEIN = "#e57a22";
  const SHELL = "#f3e7cf";

  const shadeBody = (n: THREE.Vector3) => {
    const top = sm(0.2, 0.9, n.y * 0.6 - n.z * 0.6);
    const bel = sm(0.15, 0.7, n.z - 0.4 * n.y);
    return cTeal.clone().lerp(cDeep, top).lerp(cButter, bel);
  };
  const shadeHead = (n: THREE.Vector3) => {
    const top = sm(0.45, 1.0, n.y);
    const bel = sm(0.1, 0.6, -n.y + 0.15 * n.z);
    return cTeal.clone().lerp(cDeep, top * 0.6).lerp(cButter, bel);
  };
  const shadeJaw = (n: THREE.Vector3) => {
    const bel = sm(-0.5, 0.3, -n.y + 0.3 * n.z);
    return cTeal.clone().lerp(cButter, bel);
  };
  const shadeTail = (n: THREE.Vector3) => {
    const top = sm(0.3, 0.95, n.y);
    const bel = sm(-0.15, 0.45, -n.y);
    return cTeal.clone().lerp(cDeep, top).lerp(cButter, bel);
  };
  const shadeLimb = (n: THREE.Vector3) => {
    const top = sm(0.2, 0.9, n.y * 0.5 - n.z * 0.5);
    const bel = sm(0.5, 0.95, n.z) * 0.45;
    return cTeal.clone().lerp(cDeep, top).lerp(cButter, bel);
  };

  // ---------- geometry plumbing (all geometry baked in model space) ----------
  const parts: { geo: THREE.BufferGeometry; mat: THREE.Material; bone: string }[] = [];

  function colorize(g: THREE.BufferGeometry, fn: (n: THREE.Vector3, p: THREE.Vector3) => THREE.Color) {
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    const nA = g.getAttribute("normal");
    const pA = g.getAttribute("position");
    const arr = new Float32Array(pA.count * 3);
    const n = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let i = 0; i < pA.count; i++) {
      n.fromBufferAttribute(nA as any, i).normalize();
      p.fromBufferAttribute(pA as any, i);
      const c = fn(n, p);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  }

  function add(g: THREE.BufferGeometry, look: Look, bone: string) {
    let mat: THREE.Material;
    if (typeof look === "string") mat = flat(look);
    else if (typeof look === "function") {
      colorize(g, look);
      mat = vcMat;
    } else mat = look;
    parts.push({ geo: g, mat, bone });
  }

  const pickHint = (d: THREE.Vector3) =>
    Math.abs(d.clone().normalize().x) > 0.7 ? V(0, 0, 1) : V(1, 0, 0);

  function basisYX(y0: THREE.Vector3, xh0: THREE.Vector3) {
    const y = y0.clone().normalize();
    let x = xh0.clone().addScaledVector(y, -xh0.dot(y));
    if (x.lengthSq() < 1e-8) {
      x = Math.abs(y.x) < 0.9 ? V(1, 0, 0) : V(0, 0, 1);
      x.addScaledVector(y, -x.dot(y));
    }
    x.normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    return new THREE.Matrix4().makeBasis(x, y, z);
  }
  function basisZ(z0: THREE.Vector3, upH = V(0, 1, 0)) {
    const z = z0.clone().normalize();
    let y = upH.clone().addScaledVector(z, -upH.dot(z));
    if (y.lengthSq() < 1e-8) y = V(0, 0, 1).addScaledVector(z, -z.z);
    y.normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    return new THREE.Matrix4().makeBasis(x, y, z);
  }

  function ellipsoid(c: THREE.Vector3, s: THREE.Vector3, look: Look, bone: string, Rm?: THREE.Matrix4, ws = 10, hs = 7) {
    const g = new THREE.SphereGeometry(1, ws, hs);
    const m = new THREE.Matrix4().makeScale(s.x, s.y, s.z);
    if (Rm) m.premultiply(Rm);
    m.premultiply(new THREE.Matrix4().makeTranslation(c.x, c.y, c.z));
    g.applyMatrix4(m);
    add(g, look, bone);
  }
  function sphere(c: THREE.Vector3, r: number, look: Look, bone: string, ws = 8, hs = 6) {
    ellipsoid(c, V(r, r, r), look, bone, undefined, ws, hs);
  }
  function capsule(a: THREE.Vector3, c: THREE.Vector3, r: number, look: Look, bone: string, radial = 7) {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.CapsuleGeometry(r, Math.max(len, 1e-4), 2, radial);
    const m = basisYX(d, pickHint(d));
    m.setPosition(lerpV(a, c, 0.5));
    g.applyMatrix4(m);
    add(g, look, bone);
  }
  function cone(base: THREE.Vector3, dir: THREE.Vector3, h: number, r: number, look: Look, bone: string, radial = 6, side?: THREE.Vector3, sx = 1) {
    const g = new THREE.ConeGeometry(r, h, radial, 1);
    g.translate(0, h / 2, 0);
    if (sx !== 1) g.scale(sx, 1, 1);
    const m = basisYX(dir, side ?? pickHint(dir));
    m.setPosition(base);
    g.applyMatrix4(m);
    add(g, look, bone);
  }
  function hex(p: THREE.Vector3, n: THREE.Vector3, r: number, look: Look, bone: string) {
    const g = new THREE.CylinderGeometry(r, r * 1.15, 0.004, 6);
    const m = basisYX(n, pickHint(n));
    m.setPosition(p);
    g.applyMatrix4(m);
    add(g, look, bone);
  }

  type Ell = { c: THREE.Vector3; s: THREE.Vector3 };
  function surf(e: Ell, u0: THREE.Vector3) {
    const u = u0.clone().normalize();
    const p = V(u.x * e.s.x, u.y * e.s.y, u.z * e.s.z).add(e.c);
    const n = V(u.x / e.s.x, u.y / e.s.y, u.z / e.s.z).normalize();
    return { p, n };
  }

  // ---------- body landmarks ----------
  const E_body: Ell = { c: V(0, 0.15, 0), s: V(0.085, 0.11, 0.08) };
  const E_chest: Ell = { c: V(0, 0.225, 0.025), s: V(0.066, 0.066, 0.062) };
  const E_pelvis: Ell = { c: V(0, 0.08, -0.03), s: V(0.075, 0.065, 0.07) };
  const E_cran: Ell = { c: V(0, 0.348, 0.062), s: V(0.068, 0.06, 0.064) };
  const E_snout: Ell = { c: V(0, 0.326, 0.118), s: V(0.046, 0.03, 0.05) };
  const E_jaw: Ell = { c: V(0, 0.299, 0.11), s: V(0.039, 0.017, 0.045) };

  // tail curve
  const tailPts = [
    [0, 0.085, -0.06],
    [0, 0.045, -0.135],
    [-0.025, 0.034, -0.205],
    [-0.07, 0.028, -0.255],
    [-0.125, 0.022, -0.275],
    [-0.18, 0.03, -0.265],
  ].map(toV);
  const tailCurve = new THREE.CatmullRomCurve3(tailPts, false, "centripetal");
  const tailR = (u: number) => 0.052 - 0.036 * u;
  const tailFrame = (u: number) => {
    const P = tailCurve.getPointAt(u);
    const T = tailCurve.getTangentAt(u).normalize();
    const side = new THREE.Vector3().crossVectors(T, V(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(side, T).normalize();
    return { P, T, side, up };
  };

  // ---------- joints ----------
  joint("hips", V(0, 0.1, -0.02), null, "spine");
  joint("spine1", V(0, 0.165, -0.005), "hips", "spine");
  joint("chest", V(0, 0.225, 0.02), "spine1", "spine");
  joint("neck", V(0, 0.255, 0.03), "chest", "neck");
  joint("head", V(0, 0.315, 0.05), "neck", "head");
  joint("jaw", V(0, 0.312, 0.088), "head", "jaw");

  for (let i = 0; i < 6; i++) {
    joint("tail" + (i + 1), tailFrame(i / 5).P, i === 0 ? "hips" : "tail" + i, "tail");
  }

  type SideData = {
    s: number;
    k: string;
    W: THREE.Vector3;
    E: THREE.Vector3;
    Rt: THREE.Vector3;
    tips: THREE.Vector3[];
    T: THREE.Vector3;
  };
  const sides: SideData[] = [];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    // hind legs
    joint("hip" + k, V(s * 0.055, 0.095, -0.02), "hips", "leg");
    joint("knee" + k, V(s * 0.085, 0.09, 0.06), "hip" + k, "leg");
    joint("ankle" + k, V(s * 0.088, 0.025, 0.025), "knee" + k, "leg");
    joint("toe" + k, V(s * 0.092, 0.012, 0.09), "ankle" + k, "leg");
    // front legs
    joint("shoulder" + k, V(s * 0.05, 0.205, 0.05), "chest", "arm");
    joint("elbow" + k, V(s * 0.06, 0.12, 0.085), "shoulder" + k, "arm");
    joint("wrist" + k, V(s * 0.058, 0.03, 0.1), "elbow" + k, "arm");
    joint("hand" + k, V(s * 0.058, 0.012, 0.14), "wrist" + k, "arm");
    // wings
    const Rt = joint("wing" + k, V(s * 0.035, 0.255, -0.035), "chest", "wing");
    const E = joint("wingElbow" + k, V(s * 0.11, 0.305, -0.06), "wing" + k, "wing");
    const W = joint("wingWrist" + k, V(s * 0.2, 0.335, -0.04), "wingElbow" + k, "wing");
    const tips = [V(s * 0.37, 0.33, -0.05), V(s * 0.345, 0.235, -0.08), V(s * 0.27, 0.155, -0.09)];
    tips.forEach((tip, i) => {
      joint("wingFinger" + (i + 1) + k, lerpV(W, tip, 0.08), "wingWrist" + k, "digit");
      joint("wingFinger" + (i + 1) + "Tip" + k, tip, "wingFinger" + (i + 1) + k, "digit");
    });
    sides.push({ s, k, W, E, Rt, tips, T: V(s * 0.045, 0.18, -0.06) });
  }

  // ---------- torso ----------
  ellipsoid(E_pelvis.c, E_pelvis.s, shadeBody, "hips", undefined, 10, 7);
  ellipsoid(E_body.c, E_body.s, shadeBody, "spine1", undefined, 12, 9);
  ellipsoid(E_chest.c, E_chest.s, shadeBody, "chest", undefined, 10, 8);
  capsule(V(0, 0.23, 0.02), V(0, 0.32, 0.052), 0.037, shadeBody, "neck", 9);

  // belly plates: curved bands following whichever surface is frontmost
  const frontZ = (e: Ell, y: number) => {
    const t = (y - e.c.y) / e.s.y;
    return Math.abs(t) >= 1 ? -1 : e.c.z + e.s.z * Math.sqrt(1 - t * t);
  };
  for (const y of [0.075, 0.1, 0.125, 0.15, 0.175, 0.2, 0.225, 0.25]) {
    const e = frontZ(E_chest, y) > frontZ(E_body, y) ? E_chest : E_body;
    const t = (y - e.c.y) / e.s.y;
    const kk = Math.sqrt(Math.max(0, 1 - t * t));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 4; i++) {
      const ph = ((-50 + i * 25) * Math.PI) / 180;
      pts.push(V(e.c.x + e.s.x * kk * Math.sin(ph) * 0.99, y, e.c.z + e.s.z * kk * Math.cos(ph) * 0.99));
    }
    for (let i = 0; i < 4; i++) capsule(pts[i], pts[i + 1], 0.0028, BAND, e === E_chest ? "chest" : "spine1", 5);
  }

  // dorsal spines (soft orange)
  const spine = (p: THREE.Vector3, dir: THREE.Vector3, h: number, bone: string, side = V(1, 0, 0)) => {
    cone(p.clone().addScaledVector(dir.clone().normalize(), -0.003), dir, h, h * 0.42, ORANGE, bone, 5, side, 0.5);
    sphere(p.clone().addScaledVector(dir.clone().normalize(), h * 0.62), h * 0.12, ORANGE_LIGHT, bone, 5, 4);
  };
  for (const th of [80, 108]) {
    const r = (th * Math.PI) / 180;
    const { p, n } = surf(E_cran, V(0, Math.cos(r), -Math.sin(r)));
    spine(p, n.clone().add(V(0, 0.25, -0.35)), th < 90 ? 0.022 : 0.019, "head");
  }
  {
    const a = V(0, 0.23, 0.02);
    const c = V(0, 0.32, 0.052);
    const d = c.clone().sub(a).normalize();
    const back = V(0, d.z, -d.y).normalize();
    for (const t of [0.85, 0.55, 0.25]) {
      const p = lerpV(a, c, t).addScaledVector(back, 0.036);
      spine(p, back.clone().add(V(0, 0, -0.3)), 0.024, "neck");
    }
  }
  for (const th of [22, 42, 62, 82, 102]) {
    const r = (th * Math.PI) / 180;
    const { p, n } = surf(E_body, V(0, Math.cos(r), -Math.sin(r)));
    spine(p, n.clone().add(V(0, -0.1, -0.4)), 0.031 - th * 0.00004, th < 50 ? "chest" : "spine1");
  }
  for (let i = 0; i < 8; i++) {
    const u = 0.06 + i * 0.11;
    const f = tailFrame(u);
    const r = tailR(u);
    const bone = "tail" + Math.min(5, Math.floor(u / 0.2) + 1);
    spine(f.P.clone().addScaledVector(f.up, r * 0.88), f.up.clone().addScaledVector(f.T, -0.55), 0.028 - 0.015 * u, bone, f.side);
  }

  // scale patches
  for (let i = 0; i < 30; i++) {
    const u = V(rand() * 2 - 1, rand() * 1.2 - 0.3, -0.25 - rand() * 0.75);
    if (Math.abs(u.normalize().x) < 0.18) continue;
    const { p, n } = surf(E_body, u);
    hex(p, n, 0.006 + rand() * 0.004, DEEP, "spine1");
  }
  for (let i = 0; i < 12; i++) {
    const u = V(rand() * 2 - 1, 0.45 + rand() * 0.6, -0.6 + rand() * 0.7);
    if (Math.abs(u.normalize().x) < 0.2) continue;
    const { p, n } = surf(E_cran, u);
    hex(p, n, 0.005 + rand() * 0.003, DEEP, "head");
  }

  // ---------- tail ----------
  function tubeSeg(u0: number, u1: number, steps: number, bone: string) {
    const radial = 8;
    const pos: number[] = [];
    const nor: number[] = [];
    const idx: number[] = [];
    for (let k = 0; k <= steps; k++) {
      const u = u0 + ((u1 - u0) * k) / steps;
      const f = tailFrame(u);
      const r = tailR(u);
      for (let a = 0; a < radial; a++) {
        const ang = (a / radial) * Math.PI * 2;
        const d = f.side.clone().multiplyScalar(Math.cos(ang)).addScaledVector(f.up, Math.sin(ang));
        const p = f.P.clone().addScaledVector(d, r);
        pos.push(p.x, p.y, p.z);
        nor.push(d.x, d.y, d.z);
      }
    }
    for (let k = 0; k < steps; k++)
      for (let a = 0; a < radial; a++) {
        const a2 = (a + 1) % radial;
        const i0 = k * radial + a, i1 = k * radial + a2, i2 = (k + 1) * radial + a, i3 = (k + 1) * radial + a2;
        idx.push(i0, i2, i1, i1, i2, i3);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx);
    add(g, shadeTail, bone);
  }
  for (let i = 0; i < 5; i++) tubeSeg(i * 0.2, (i + 1) * 0.2, 3, "tail" + (i + 1));
  {
    const f = tailFrame(1);
    sphere(f.P, tailR(1), shadeTail, "tail5", 8, 6);
    for (let i = 0; i < 8; i++) {
      const u = 0.12 + i * 0.1;
      const ff = tailFrame(u);
      const r = tailR(u);
      const bone = "tail" + Math.min(5, Math.floor(u / 0.2) + 1);
      for (const a of [-0.75, 0.75]) {
        const d = ff.side.clone().multiplyScalar(Math.sin(a)).addScaledVector(ff.up, Math.cos(a));
        hex(ff.P.clone().addScaledVector(d, r), d, 0.0075 - u * 0.003, DEEP, bone);
      }
    }
    // spade
    const T = f.T.clone();
    const up = V(0, 1, 0).addScaledVector(T, -T.y).normalize();
    const Z = new THREE.Vector3().crossVectors(T, up);
    const mk = (scale: number, depth: number, color: string, bevel: boolean) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.bezierCurveTo(0.004, 0.012, 0.012, 0.034, 0.03, 0.03);
      sh.bezierCurveTo(0.046, 0.026, 0.056, 0.01, 0.07, 0);
      sh.bezierCurveTo(0.056, -0.01, 0.046, -0.026, 0.03, -0.03);
      sh.bezierCurveTo(0.012, -0.034, 0.004, -0.012, 0, 0);
      const g = new THREE.ExtrudeGeometry(sh, {
        depth,
        bevelEnabled: bevel,
        bevelThickness: 0.002,
        bevelSize: 0.002,
        bevelSegments: 1,
        curveSegments: 5,
      });
      g.translate(0, 0, -depth / 2);
      g.scale(scale, scale, 1);
      g.translate(-0.008 + (1 - scale) * 0.03, 0, 0);
      const m = new THREE.Matrix4().makeBasis(T, up, Z);
      m.setPosition(f.P);
      g.applyMatrix4(m);
      add(g, color, "tail5");
    };
    mk(1, 0.006, ORANGE, true);
    mk(0.55, 0.0125, ORANGE_LIGHT, false);
  }

  // ---------- legs & arms ----------
  for (const { s, k } of sides) {
    // hind
    ellipsoid(V(s * 0.07, 0.085, 0.02), V(0.042, 0.048, 0.068), shadeLimb, "hip" + k, undefined, 10, 7);
    for (let i = 0; i < 5; i++) {
      const { p, n } = surf({ c: V(s * 0.07, 0.085, 0.02), s: V(0.042, 0.048, 0.068) }, V(s, 0.3 + rand() * 0.8, rand() * 1.2 - 0.6));
      hex(p, n, 0.006 + rand() * 0.003, DEEP, "hip" + k);
    }
    capsule(V(s * 0.085, 0.09, 0.06), V(s * 0.088, 0.025, 0.025), 0.018, shadeLimb, "knee" + k);
    ellipsoid(V(s * 0.09, 0.014, 0.055), V(0.026, 0.014, 0.042), shadeLimb, "ankle" + k, undefined, 8, 6);
    for (const t of [-1, 0, 1]) {
      const toe = V(s * 0.09 + t * 0.014, 0.011, 0.091 - Math.abs(t) * 0.004);
      sphere(toe, 0.011, shadeLimb, "ankle" + k, 7, 5);
      cone(toe.clone().add(V(0, -0.002, 0.008)), V(0, -0.35, 1), 0.01, 0.004, CREAM, "ankle" + k, 5);
    }
    // front
    capsule(V(s * 0.05, 0.205, 0.05), V(s * 0.06, 0.12, 0.085), 0.02, shadeLimb, "shoulder" + k);
    capsule(V(s * 0.06, 0.12, 0.085), V(s * 0.058, 0.03, 0.1), 0.016, shadeLimb, "elbow" + k);
    ellipsoid(V(s * 0.058, 0.013, 0.115), V(0.021, 0.013, 0.03), shadeLimb, "wrist" + k, undefined, 8, 6);
    for (const t of [-1, 0, 1]) {
      const toe = V(s * 0.058 + t * 0.011, 0.009, 0.141 - Math.abs(t) * 0.004);
      sphere(toe, 0.009, shadeLimb, "wrist" + k, 7, 5);
      cone(toe.clone().add(V(0, -0.001, 0.006)), V(0, -0.35, 1), 0.008, 0.0035, CREAM, "wrist" + k, 5);
    }
  }

  // ---------- wings ----------
  for (const { s, k, W, E, Rt, tips, T } of sides) {
    capsule(Rt, E, 0.013, shadeLimb, "wing" + k);
    capsule(E, W, 0.01, shadeLimb, "wingElbow" + k);
    sphere(E, 0.0135, DEEP, "wingElbow" + k, 7, 5);
    sphere(W, 0.012, DEEP, "wingWrist" + k, 7, 5);
    cone(W.clone().add(V(0, 0.006, 0.004)), V(s * 0.3, 0.6, 0.7), 0.02, 0.005, CREAM, "wingWrist" + k, 5);
    tips.forEach((tip, i) => {
      const fb = "wingFinger" + (i + 1) + k;
      capsule(W, tip, 0.0058 - i * 0.0006, shadeLimb, fb, 6);
      cone(tip, tip.clone().sub(W), 0.012, 0.0045, CREAM, fb, 5);
    });
    const scallop = (a: THREE.Vector3, c: THREE.Vector3, pull: number) =>
      [0.25, 0.5, 0.75].map((t) => lerpV(a, c, t).lerp(W, pull * Math.sin(Math.PI * t)));
    const s12 = scallop(tips[0], tips[1], 0.22);
    const s23 = scallop(tips[1], tips[2], 0.22);
    const s3T = scallop(tips[2], T, 0.14);
    const fan = (rim: THREE.Vector3[], bone: string) => {
      const pos: number[] = [];
      for (let i = 0; i < rim.length - 1; i++)
        for (const p of [W, rim[i], rim[i + 1]]) pos.push(p.x, p.y, p.z);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.computeVertexNormals();
      add(g, flat(MEMBRANE, 0.72, true), bone);
    };
    fan([tips[0], ...s12, tips[1], ...s23, tips[2]], "wingWrist" + k);
    fan([tips[2], ...s3T, T, Rt, E], "wingElbow" + k);
    for (const sc of [s12, s23, s3T]) capsule(W, lerpV(W, sc[1], 0.8), 0.0018, VEIN, "wingWrist" + k, 4);
  }

  // ---------- head ----------
  ellipsoid(E_cran.c, E_cran.s, shadeHead, "head", undefined, 11, 8);
  ellipsoid(E_snout.c, E_snout.s, shadeHead, "head", undefined, 10, 7);
  ellipsoid(E_jaw.c, E_jaw.s, shadeJaw, "jaw", undefined, 10, 6);

  // upper teeth: toothy grin
  for (const deg of [-62, -42, -24, -9, 9, 24, 42, 62]) {
    const ph = (deg * Math.PI) / 180;
    const base = E_snout.c.clone().add(V(0.036 * Math.sin(ph), -0.02, 0.039 * Math.cos(ph)));
    const fang = Math.abs(deg) === 24;
    cone(base.add(V(0, 0.003, 0)), V(0, -1, 0.15), fang ? 0.015 : 0.011, fang ? 0.0042 : 0.0034, TOOTH, "head", 4);
  }
  for (const deg of [-38, -14, 14, 38]) {
    const ph = (deg * Math.PI) / 180;
    const base = E_jaw.c.clone().add(V(0.032 * Math.sin(ph), 0.007, 0.037 * Math.cos(ph)));
    cone(base, V(0, 1, 0.15), 0.008, 0.003, TOOTH, "jaw", 4);
  }

  for (const { s } of sides) {
    // big amber eyes
    const { p, n } = surf(E_cran, V(s * 0.6, 0.22, 0.78));
    const eye = p.clone().addScaledVector(n, -0.008);
    const Rz = basisZ(n);
    const ex = V(1, 0, 0).applyMatrix4(new THREE.Matrix4().extractRotation(Rz));
    const ey = V(0, 1, 0).applyMatrix4(new THREE.Matrix4().extractRotation(Rz));
    sphere(eye, 0.022, "#ffb21e", "head", 10, 8);
    ellipsoid(eye.clone().addScaledVector(n, 0.0165), V(0.0145, 0.0165, 0.006), "#e0700c", "head", Rz, 9, 6);
    ellipsoid(eye.clone().addScaledVector(n, 0.0195), V(0.0075, 0.012, 0.004), "#1a1208", "head", Rz, 8, 6);
    sphere(eye.clone().addScaledVector(n, 0.0215).addScaledVector(ex, -0.005 * s).addScaledVector(ey, 0.006), 0.0038, "#ffffff", "head", 6, 4);
    sphere(eye.clone().addScaledVector(n, 0.021).addScaledVector(ex, 0.005 * s).addScaledVector(ey, -0.006), 0.0018, "#ffffff", "head", 5, 4);
    // proud brow
    ellipsoid(eye.clone().add(V(0, 0.021, 0)).addScaledVector(n, -0.003), V(0.022, 0.0065, 0.014), DEEP, "head", Rz, 8, 5);
    // blush
    const ch = surf(E_cran, V(s * 0.72, -0.3, 0.62));
    ellipsoid(ch.p.clone().addScaledVector(ch.n, -0.001), V(0.013, 0.008, 0.003), "#ff8f8a", "head", basisZ(ch.n), 8, 5);
    // nostrils
    const no = surf(E_snout, V(s * 0.33, 0.45, 0.85));
    ellipsoid(no.p.clone().addScaledVector(no.n, -0.001), V(0.0055, 0.0038, 0.003), "#0f3d3f", "head", basisZ(no.n), 7, 5);
    // mouth corners (grin)
    capsule(V(s * 0.036, 0.305, 0.097), V(s * 0.043, 0.315, 0.083), 0.0025, "#6b2236", "head", 5);
    // stubby horns
    const hb = surf(E_cran, V(s * 0.42, 0.85, -0.3));
    const hd = V(s * 0.3, 0.75, -0.6).normalize();
    const hBase = hb.p.clone().addScaledVector(hb.n, -0.004);
    cone(hBase, hd, 0.026, 0.012, CREAM, "head", 6);
    cone(hBase.clone().addScaledVector(hd, 0.02), V(s * 0.25, 0.45, -0.85), 0.017, 0.0075, CREAM, "head", 6);
    capsule(hBase.clone().addScaledVector(hd, 0.002), hBase.clone().addScaledVector(hd, 0.008), 0.0128, "#d9c49a", "head", 6);
    // ear frills
    const eb = surf(E_cran, V(s * 0.92, 0.2, -0.35));
    const ed = V(s, 0.35, -0.7).normalize();
    cone(eb.p.clone().addScaledVector(eb.n, -0.004), ed, 0.034, 0.015, ORANGE, "head", 5, new THREE.Vector3().crossVectors(ed, V(0, 1, 0)), 0.35);
  }

  // smoke wisp curling from the left nostril
  {
    const no = surf(E_snout, V(0.33, 0.45, 0.85));
    const start = no.p.clone().addScaledVector(no.n, 0.006);
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const p = start.clone().add(
        V(0.004 + 0.022 * t + 0.012 * Math.sin(t * 7), 0.006 + 0.1 * t, 0.008 + 0.014 * Math.cos(t * 7) * t)
      );
      const op = t < 0.34 ? 0.85 : t < 0.67 ? 0.65 : 0.45;
      const g = new THREE.IcosahedronGeometry(0.004 + 0.011 * t, 0);
      g.translate(p.x, p.y, p.z);
      add(g, flat("#e3e8ee", op), "head");
    }
  }

  // ---------- eggshell pieces ----------
  const eggPos = V(0.23, 0, 0.1);
  const shellC = new THREE.Color(SHELL);
  const innerC = new THREE.Color("#fffaf0");
  const speckC = [new THREE.Color("#8b6a4c"), new THREE.Color("#5f8f7d"), new THREE.Color("#c98b52")];
  function shellLathe(prof: number[][], rims: number[], amp: number, speckle: number) {
    const segs = 14;
    const pts = prof.map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(pts, segs);
    const np = pts.length;
    const zig: number[] = [];
    for (let i = 0; i < segs; i++) zig.push((i % 2 === 0 ? amp : -amp * 0.8) + (rand() - 0.5) * amp * 0.5);
    const pos = g.getAttribute("position");
    for (let i = 0; i <= segs; i++)
      for (const j of rims) pos.setY(i * np + j, pos.getY(i * np + j) + zig[i % segs]);
    const cols = new Float32Array(pos.count * 3);
    const half = np / 2;
    for (let i = 0; i <= segs; i++)
      for (let j = 0; j < np; j++) {
        let c = j < half ? shellC : innerC;
        if (j < half && j > 0 && rand() < speckle) c = speckC[Math.floor(rand() * 3)];
        const v = i * np + j;
        cols[v * 3] = c.r;
        cols[v * 3 + 1] = c.g;
        cols[v * 3 + 2] = c.b;
      }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }
  const outer = [[0.001, 0], [0.03, 0.004], [0.05, 0.016], [0.062, 0.036], [0.066, 0.06], [0.064, 0.085], [0.06, 0.1]];
  const inner = [[0.054, 0.1], [0.058, 0.085], [0.06, 0.06], [0.056, 0.036], [0.045, 0.019], [0.026, 0.01], [0.001, 0.008]];
  {
    const g = shellLathe([...outer, ...inner], [6, 7], 0.012, 0);
    g.translate(eggPos.x, eggPos.y, eggPos.z);
    add(g, vcMatDouble, "hips");
    const rAt = (y: number) => {
      for (let i = 0; i < outer.length - 1; i++)
        if (y <= outer[i + 1][1]) {
          const t = (y - outer[i][1]) / (outer[i + 1][1] - outer[i][1]);
          return outer[i][0] + (outer[i + 1][0] - outer[i][0]) * t;
        }
      return outer[outer.length - 1][0];
    };
    const sc = ["#8b6a4c", "#5f8f7d", "#c98b52"];
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const y = 0.014 + rand() * 0.068;
      const r = rAt(y);
      const p = eggPos.clone().add(V(r * Math.sin(a), y, r * Math.cos(a)));
      const n = V(Math.sin(a), 0.12, Math.cos(a)).normalize();
      const sz = 0.003 + rand() * 0.005;
      ellipsoid(p, V(sz, sz * 0.7, 0.0015), sc[Math.floor(rand() * 3)], "hips", basisZ(n), 6, 4);
    }
  }
  // fallen top cap
  {
    const prof = [[0.057, 0], [0.05, 0.028], [0.034, 0.05], [0.001, 0.06], [0.001, 0.054], [0.03, 0.045], [0.045, 0.026], [0.051, 0]];
    const g = shellLathe(prof, [0, 7], 0.009, 0.18);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(2.2, 0.5, 0.4)));
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    g.translate(0.33 - (bb.min.x + bb.max.x) / 2, -bb.min.y - 0.001, 0.22 - (bb.min.z + bb.max.z) / 2);
    add(g, vcMatDouble, "hips");
  }
  // tiny shell fragments on the floor
  for (const [x, z] of [[0.31, 0.04], [0.16, 0.21], [0.27, 0.27], [0.4, 0.1], [0.12, 0.25], [0.36, 0.31]]) {
    const sh = new THREE.Shape();
    const n = 3 + Math.floor(rand() * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.6;
      const r = 0.009 + rand() * 0.01;
      if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.rotateY(rand() * Math.PI * 2);
    g.translate(x, 0, z);
    add(g, flat(SHELL, 1, true), "hips");
  }
  // a little shell cap still on the hatchling's head
  {
    const prof = [[0.026, 0], [0.023, 0.012], [0.013, 0.022], [0.001, 0.026], [0.001, 0.022], [0.012, 0.018], [0.02, 0.009], [0.022, 0]];
    const g = shellLathe(prof, [0, 7], 0.005, 0.15);
    const { p, n } = surf(E_cran, V(0, 0.9, 0.45));
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.35, 0, -0.2)));
    const at = p.clone().addScaledVector(n, -0.009);
    g.translate(at.x, at.y, at.z);
    add(g, vcMatDouble, "head");
  }

  // ---------- hang everything on its bone ----------
  const root: THREE.Object3D = b.root;
  const nodeOf = (j: any): THREE.Object3D => {
    if (!j) return root;
    if (j.isObject3D) return j;
    for (const key of ["bone", "object", "node", "obj", "object3d"]) if (j[key] && j[key].isObject3D) return j[key];
    return root;
  };
  for (const name of Object.keys(J)) {
    const n = nodeOf(J[name]);
    if (n !== root || name === "hips") {
      n.userData = n.userData || {};
      n.userData.role = roles[name];
    }
  }
  root.updateMatrixWorld(true);
  const rootW = root.matrixWorld.clone();
  parts.forEach((p, i) => {
    const node = nodeOf(J[p.bone]);
    const mesh = new THREE.Mesh(p.geo, p.mat);
    mesh.name = p.bone + "_part" + i;
    const m = node.matrixWorld.clone().invert().multiply(rootW);
    m.decompose(mesh.position, mesh.quaternion, mesh.scale);
    node.add(mesh);
  });

  return root;
}
```