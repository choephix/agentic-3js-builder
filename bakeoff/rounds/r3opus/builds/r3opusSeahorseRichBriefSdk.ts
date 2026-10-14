import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a ridged, ringed body, thin dark lines and white freckles, a spiky crown, a long tube snout with an opening jaw, big curious eyes and a ruffled dorsal fin. Its prehensile tail is coiled around a strand of seagrass rising from a small sand mound.",
};

export default function build() {
  const b: any = createBuilder({ name: "lined_seahorse" });

  // ---------- utilities ----------
  const R: any = rng(1337);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.random ? R.random() : R.float();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const arr = (v: THREE.Vector3) => [v.x, v.y, v.z];
  const X = V(1, 0, 0);
  const UP = V(0, 1, 0);

  const J = (name: string, at: THREE.Vector3, parent?: any, role?: string) => {
    const o: any = { at: arr(at) };
    if (parent) o.parent = parent;
    if (role) {
      try {
        return b.joint(name, { ...o, role });
      } catch (e) {
        /* fall through */
      }
    }
    return b.joint(name, o);
  };

  const P = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, dir?: THREE.Vector3, bone?: any) => {
    const o: any = { at: arr(at) };
    if (dir) o.dir = arr(dir.clone().normalize());
    if (bone) o.bone = bone;
    return b.part(geo, color, o);
  };

  const prof = (keys: number[][], t: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i];
      const [t1, v1] = keys[i + 1];
      if (t <= t1) {
        const u = (t - t0) / (t1 - t0);
        const s = u * u * (3 - 2 * u);
        return v0 + (v1 - v0) * s;
      }
    }
    return keys[keys.length - 1][1];
  };

  const quad = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
    const pts = [a, bb, c, a, c, d, a, c, bb, a, d, c];
    const pos: number[] = [];
    pts.forEach((p) => pos.push(p.x, p.y, p.z));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  };

  // ---------- palette ----------
  const C = {
    yellow: "#ffcc2e",
    yellow2: "#ffb81f",
    rim: "#f29a17",
    knob: "#ffe27a",
    line: "#3a2618",
    freckle: "#fffaf0",
    eyeWhite: "#f6f1e3",
    iris: "#d9822b",
    irisRing: "#7a3d12",
    pupil: "#120c08",
    shine: "#ffffff",
    fin: "#fff1c8",
    fin2: "#ffe2a6",
    ray: "#f08a2c",
    grass1: "#4f9a3c",
    grass2: "#63b04a",
    grass3: "#3c7a31",
    grassTip: "#a7d36a",
    sand: "#ead09a",
    sandDark: "#d4b47a",
    pebble1: "#b9a58a",
    pebble2: "#8f8676",
    pebble3: "#cfc2ae",
    star: "#ff7a4d",
    starDot: "#ffd3b8",
  };

  // ---------- skeleton ----------
  const root = J("root", V(0, 0, 0));
  const hipsAt = V(0, 0.2, 0.003);
  const hips = J("hips", hipsAt, root, "spine");
  const spine1 = J("spine1", V(0, 0.228, 0.011), hips, "spine");
  const spine2 = J("spine2", V(0, 0.258, 0.01), spine1, "spine");
  const neck = J("neck", V(0, 0.286, -0.001), spine2, "neck");
  const headAt = V(0, 0.303, 0.003);
  const head = J("head", headAt, neck, "head");
  const snoutBase = V(0, 0.3, 0.012);
  const snoutTip = V(0, 0.292, 0.04);
  const jaw = J("jaw", V(0, 0.2915, 0.033), head, "jaw");
  const eyeLAt = V(0.0078, 0.3055, 0.0055);
  const eyeRAt = V(-0.0078, 0.3055, 0.0055);
  const eyeL = J("eyeL", eyeLAt, head);
  const eyeR = J("eyeR", eyeRAt, head);
  const crownJ = J("crown", V(0, 0.3135, -0.002), head);

  // ---------- trunk ----------
  const trunk = new THREE.CatmullRomCurve3([
    V(0, 0.199, 0.003),
    V(0, 0.222, 0.01),
    V(0, 0.248, 0.012),
    V(0, 0.272, 0.006),
    V(0, 0.292, -0.003),
  ]);
  const trunkR = (t: number) =>
    prof([[0, 0.0075], [0.3, 0.0125], [0.5, 0.0138], [0.75, 0.011], [1, 0.0078]], t);
  const SX = 0.78;
  const NT = 11;
  const tLen = trunk.getLength() / NT;
  const tFrame = (t: number) => {
    const p = trunk.getPointAt(t);
    const T = trunk.getTangentAt(t);
    const n = X.clone().cross(T).normalize();
    return { p, T, n };
  };
  const hexV = (p: THREE.Vector3, n: THREE.Vector3, r: number, th: number) =>
    p.clone().add(X.clone().multiplyScalar(SX * r * Math.sin(th))).add(n.clone().multiplyScalar(r * Math.cos(th)));

  for (let i = 0; i < NT; i++) {
    const t = (i + 0.5) / NT;
    const { p, T, n } = tFrame(t);
    const r = trunkR(t);
    const g = new THREE.CylinderGeometry(r * 0.92, r, tLen * 1.04, 6, 1);
    g.scale(SX, 1, 1);
    P(g, i % 2 ? C.yellow2 : C.yellow, p, T);

    // ridge knobs at the hex corners
    for (let k = 0; k < 6; k++) {
      const th = (k * Math.PI) / 3;
      const pos = hexV(p, n, r * 0.97, th);
      const out = X.clone().multiplyScalar(Math.sin(th) / SX).add(n.clone().multiplyScalar(Math.cos(th))).normalize();
      const dorsal = k === 3;
      const kg = new THREE.ConeGeometry(dorsal ? 0.0017 : 0.0012, dorsal ? 0.0042 : 0.0026, 4);
      P(kg, C.knob, pos.add(out.clone().multiplyScalar(0.0008)), out);
    }

    // thin dark longitudinal lines on the side faces
    for (const deg of [30, 90, 150, 210, 270, 330]) {
      const th = (deg * Math.PI) / 180;
      const rm = r * 0.965;
      const a = hexV(p, n, rm, th - Math.PI / 6);
      const c = hexV(p, n, rm, th + Math.PI / 6);
      const mid = a.add(c).multiplyScalar(0.5);
      const out = mid.clone().sub(p).normalize();
      mid.add(out.multiplyScalar(0.0003));
      P(new THREE.BoxGeometry(0.0007, tLen * 0.98, 0.0007), C.line, mid, T);
    }
  }
  // dark rims between body rings
  for (let i = 0; i <= NT; i++) {
    const t = Math.min(0.999, Math.max(0.001, i / NT));
    const { p, T } = tFrame(t);
    const r = trunkR(t);
    const g = new THREE.TorusGeometry(r * 0.93, 0.00075, 4, 12);
    g.rotateX(Math.PI / 2);
    g.scale(SX, 1, 1);
    P(g, C.line, p, T);
  }
  // white freckles on the trunk
  for (let f = 0; f < 18; f++) {
    const t = 0.08 + rand() * 0.84;
    const { p, n } = tFrame(t);
    const r = trunkR(t) * 0.95;
    const face = Math.floor(rand() * 6);
    const th0 = (face * Math.PI) / 3;
    const u = 0.2 + rand() * 0.25;
    const a = hexV(p, n, r, th0);
    const c = hexV(p, n, r, th0 + Math.PI / 3);
    const pos = a.lerp(c, u);
    const out = pos.clone().sub(p).normalize();
    P(new THREE.SphereGeometry(0.0009 + rand() * 0.0005, 6, 4), C.freckle, pos.add(out.multiplyScalar(0.0004)));
  }

  // ---------- tail (coiled around the seagrass) ----------
  const stemZ = 0.012;
  const coilR = 0.008;
  const tailPts: THREE.Vector3[] = [V(0, 0.203, 0.003), V(0, 0.192, 0.0005), V(0, 0.182, 0.002)];
  const aMax = Math.PI * 2 * 1.35;
  for (let a = 0.45; a <= aMax + 1e-6; a += 0.45) {
    const y = 0.176 - 0.026 * (a / aMax);
    tailPts.push(V(coilR * Math.sin(a), y, stemZ - coilR * Math.cos(a)));
  }
  const tail = new THREE.CatmullRomCurve3(tailPts);

  // tail joints
  const tailJointPts: number[][] = [];
  for (let i = 0; i < 10; i++) tailJointPts.push(arr(tail.getPointAt(0.04 + (i / 9) * 0.94)));
  try {
    b.chain("tail", tailJointPts, { parent: hips, role: "tail" });
  } catch (e) {
    let prev = hips;
    tailJointPts.forEach((q, i) => {
      prev = J(`tail${i}`, V(q[0], q[1], q[2]), prev, "tail");
    });
  }

  const NTl = 28;
  const tlLen = tail.getLength() / NTl;
  const tailR = (t: number) => 0.0072 * Math.pow(1 - t, 0.75) + 0.0016;
  const tailFrame = (t: number) => {
    const p = tail.getPointAt(t);
    const T = tail.getTangentAt(t);
    const o = p.clone().sub(V(0, p.y, stemZ));
    o.y = 0;
    if (o.length() < 1e-4) o.set(0, 0, -1);
    o.sub(T.clone().multiplyScalar(o.dot(T))).normalize();
    const s = T.clone().cross(o).normalize();
    return { p, T, o, s };
  };
  for (let i = 0; i < NTl; i++) {
    const t = (i + 0.5) / NTl;
    const { p, T, o, s } = tailFrame(t);
    const r = tailR(t);
    // T points tail-ward: wide end toward the body
    P(new THREE.CylinderGeometry(r * 0.88, r, tlLen * 1.05, 6, 1), i % 2 ? C.yellow2 : C.yellow, p, T.clone().negate());
    // ridge knobs: dorsal + both sides
    const kr = Math.max(0.0007, r * 0.17);
    for (const [dir, big] of [[o, true], [s, false], [s.clone().negate(), false]] as [THREE.Vector3, boolean][]) {
      const pos = p.clone().add(dir.clone().multiplyScalar(r * 0.95));
      P(new THREE.ConeGeometry(big ? kr * 1.3 : kr, (big ? 3 : 2.2) * kr, 4), C.knob, pos, dir);
    }
    // side line
    if (i % 1 === 0) {
      const lp = p.clone().add(s.clone().multiplyScalar(r * 0.55)).add(o.clone().multiplyScalar(r * 0.75));
      P(new THREE.BoxGeometry(0.0006, tlLen * 0.9, 0.0006), C.line, lp, T);
      const lp2 = p.clone().sub(s.clone().multiplyScalar(r * 0.55)).add(o.clone().multiplyScalar(r * 0.75));
      P(new THREE.BoxGeometry(0.0006, tlLen * 0.9, 0.0006), C.line, lp2, T);
    }
    if (i < 18 && rand() < 0.3) {
      const fp = p.clone().add(s.clone().multiplyScalar(r * 0.8)).add(o.clone().multiplyScalar(r * 0.5));
      P(new THREE.SphereGeometry(0.0007, 6, 4), C.freckle, fp);
    }
  }
  for (let i = 0; i <= NTl; i++) {
    const t = Math.min(0.995, Math.max(0.005, i / NTl));
    const { p, T } = tailFrame(t);
    const g = new THREE.TorusGeometry(tailR(t) * 0.93, 0.0006, 4, 10);
    g.rotateX(Math.PI / 2);
    P(g, C.line, p, T);
  }
  // curled tail tip
  {
    const { p, T } = tailFrame(1);
    P(new THREE.SphereGeometry(0.0018, 6, 5), C.yellow, p.clone().add(T.clone().multiplyScalar(0.0005)));
  }

  // ---------- head ----------
  const hA = 0.0082, hB = 0.0098, hC = 0.0112;
  const headGeo = new THREE.SphereGeometry(1, 10, 7);
  headGeo.scale(hA, hB, hC);
  P(headGeo, C.yellow, headAt, undefined, head);
  const cheek = new THREE.SphereGeometry(1, 8, 6);
  cheek.scale(0.0072, 0.006, 0.0075);
  P(cheek, C.yellow2, headAt.clone().add(V(0, -0.004, 0.004)), undefined, head);
  const onHead = (d: THREE.Vector3, lift = 0.0003) => {
    d = d.clone().normalize();
    const s = 1 / Math.sqrt((d.x / hA) ** 2 + (d.y / hB) ** 2 + (d.z / hC) ** 2);
    return headAt.clone().add(d.multiplyScalar(s + lift));
  };
  // dark dotted lines and freckles on the head
  for (const side of [1, -1]) {
    for (let row = 0; row < 2; row++) {
      for (let k = 0; k < 5; k++) {
        const d = V(side * (0.8 + 0.1 * k), -0.35 - 0.35 * row + 0.05 * k, -0.15 - 0.22 * k);
        P(new THREE.SphereGeometry(0.00055, 5, 3), C.line, onHead(d), undefined, head);
      }
    }
    for (let k = 0; k < 3; k++) {
      const d = V(side * (0.6 + rand() * 0.3), 0.3 + rand() * 0.4, -0.3 - rand() * 0.5);
      P(new THREE.SphereGeometry(0.0008, 6, 4), C.freckle, onHead(d), undefined, head);
    }
    // brow spine
    const bp = onHead(V(side * 0.6, 0.75, 0.25), -0.0004);
    P(new THREE.ConeGeometry(0.0011, 0.0035, 4), C.knob, bp, V(side * 0.5, 1, 0.1), head);
    // cheek spine
    const cp = onHead(V(side * 0.7, -0.5, -0.3), -0.0003);
    P(new THREE.ConeGeometry(0.0009, 0.0028, 4), C.knob, cp, V(side, -0.3, -0.4), head);
  }

  // snout
  const sDir = snoutTip.clone().sub(snoutBase);
  const sLen = sDir.length();
  sDir.normalize();
  const sMid = snoutBase.clone().lerp(snoutTip, 0.5).add(sDir.clone().multiplyScalar(-0.002));
  P(new THREE.CylinderGeometry(0.0026, 0.0033, sLen + 0.004, 7), C.yellow, sMid, sDir, head);
  for (const f of [0.15, 0.45, 0.75]) {
    const g = new THREE.TorusGeometry(0.0033 - f * 0.0007, 0.0005, 4, 10);
    g.rotateX(Math.PI / 2);
    P(g, C.line, snoutBase.clone().lerp(snoutTip, f), sDir, head);
  }
  const sDown = sDir.clone().cross(X).normalize(); // perpendicular, check sign below
  if (sDown.y > 0) sDown.negate();
  // upper lip (head) and lower jaw (jaw bone)
  P(new THREE.BoxGeometry(0.0058, 0.0055, 0.0022), C.yellow2, snoutTip.clone().add(sDown.clone().multiplyScalar(-0.0011)), sDir, head);
  P(new THREE.BoxGeometry(0.0052, 0.005, 0.0018), C.rim, snoutTip.clone().add(sDown.clone().multiplyScalar(0.0012)).add(sDir.clone().multiplyScalar(-0.0003)), sDir, jaw);
  P(new THREE.BoxGeometry(0.0046, 0.0008, 0.0006), C.line, snoutTip.clone().add(sDir.clone().multiplyScalar(0.0026)), sDir, head);

  // crown (coronet)
  const crownAt = V(0, 0.3135, -0.002);
  const crownDir = V(0, 1, -0.35).normalize();
  P(new THREE.CylinderGeometry(0.0028, 0.0038, 0.0055, 6), C.yellow, crownAt, crownDir, crownJ);
  {
    const g = new THREE.TorusGeometry(0.0031, 0.0005, 4, 10);
    g.rotateX(Math.PI / 2);
    P(g, C.line, crownAt.clone().add(crownDir.clone().multiplyScalar(0.0008)), crownDir, crownJ);
  }
  const crownTop = crownAt.clone().add(crownDir.clone().multiplyScalar(0.0027));
  const cu = X.clone();
  const cv = crownDir.clone().cross(cu).normalize();
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    const radial = cu.clone().multiplyScalar(Math.cos(a)).add(cv.clone().multiplyScalar(Math.sin(a)));
    const base = crownTop.clone().add(radial.clone().multiplyScalar(0.0024));
    const d = crownDir.clone().multiplyScalar(1).add(radial.clone().multiplyScalar(0.55)).normalize();
    P(new THREE.ConeGeometry(0.0011, 0.0055, 4), C.knob, base.clone().add(d.clone().multiplyScalar(0.0022)), d, crownJ);
    P(new THREE.SphereGeometry(0.0006, 5, 3), C.rim, base.clone().add(d.clone().multiplyScalar(0.005)), undefined, crownJ);
  }
  P(new THREE.ConeGeometry(0.0013, 0.006, 4), C.knob, crownTop.clone().add(crownDir.clone().multiplyScalar(0.0028)), crownDir, crownJ);

  // ---------- eyes ----------
  for (const [side, eAt, eJ] of [[1, eyeLAt, eyeL], [-1, eyeRAt, eyeR]] as [number, THREE.Vector3, any][]) {
    const look = V(side * 0.85, 0.12, 0.5).normalize();
    P(new THREE.SphereGeometry(0.0052, 12, 9), C.eyeWhite, eAt, undefined, eJ);
    const lid = new THREE.TorusGeometry(0.0048, 0.0012, 5, 14);
    lid.rotateX(Math.PI / 2);
    P(lid, C.rim, eAt.clone().add(look.clone().multiplyScalar(0.0024)), look, eJ);
    P(new THREE.CylinderGeometry(0.0039, 0.0039, 0.0012, 14), C.irisRing, eAt.clone().add(look.clone().multiplyScalar(0.0046)), look, eJ);
    P(new THREE.CylinderGeometry(0.0033, 0.0033, 0.0012, 14), C.iris, eAt.clone().add(look.clone().multiplyScalar(0.0051)), look, eJ);
    P(new THREE.CylinderGeometry(0.0019, 0.0019, 0.0012, 12), C.pupil, eAt.clone().add(look.clone().multiplyScalar(0.0057)), look, eJ);
    const side2 = look.clone().cross(UP).normalize();
    P(new THREE.SphereGeometry(0.00085, 6, 4), C.shine,
      eAt.clone().add(look.clone().multiplyScalar(0.0064)).add(UP.clone().multiplyScalar(0.0012)).add(side2.clone().multiplyScalar(0.0009)), undefined, eJ);
    P(new THREE.SphereGeometry(0.00045, 5, 3), C.shine,
      eAt.clone().add(look.clone().multiplyScalar(0.0063)).add(UP.clone().multiplyScalar(-0.0009)).add(side2.clone().multiplyScalar(-0.0008)), undefined, eJ);
    // lash-like line flicks
    for (let k = 0; k < 3; k++) {
      const a = 0.5 + k * 0.35;
      const d = UP.clone().multiplyScalar(Math.cos(a)).add(V(0, 0, -1).multiplyScalar(Math.sin(a))).normalize();
      P(new THREE.BoxGeometry(0.0005, 0.0024, 0.0005), C.line, eAt.clone().add(d.clone().multiplyScalar(0.0062)).add(look.clone().multiplyScalar(0.0012)), d, eJ);
    }
  }

  // ---------- dorsal fin (ruffled fan) ----------
  const finMid = tFrame(0.42);
  const finJ = J("dorsalFin", finMid.p.clone().sub(finMid.n.clone().multiplyScalar(trunkR(0.42) * 0.9)), spine1, "fan");
  const NR = 12;
  const bases: THREE.Vector3[] = [];
  const tips: THREE.Vector3[] = [];
  for (let i = 0; i < NR; i++) {
    const s = i / (NR - 1);
    const t = 0.2 + 0.42 * s;
    const { p, T, n } = tFrame(t);
    const base = p.clone().sub(n.clone().multiplyScalar(trunkR(t) * 0.88));
    const d = n.clone().negate().add(T.clone().multiplyScalar(-0.55 + 1.1 * s)).normalize();
    const len = 0.011 + 0.008 * Math.sin(Math.PI * s);
    const tip = base.clone().add(d.multiplyScalar(len)).add(X.clone().multiplyScalar((i % 2 ? 1 : -1) * 0.0014));
    bases.push(base);
    tips.push(tip);
  }
  for (let i = 0; i < NR - 1; i++) {
    P(quad(bases[i], bases[i + 1], tips[i + 1], tips[i]), i % 2 ? C.fin : C.fin2, V(0, 0, 0), undefined, finJ);
  }
  for (let i = 0; i < NR; i++) {
    const d = tips[i].clone().sub(bases[i]);
    P(new THREE.CylinderGeometry(0.00035, 0.0005, d.length(), 4), C.ray, bases[i].clone().lerp(tips[i], 0.5), d, finJ);
    P(new THREE.SphereGeometry(0.0006, 5, 3), C.ray, tips[i], undefined, finJ);
  }

  // ---------- pectoral fins ----------
  for (const side of [1, -1]) {
    const pAt = V(side * 0.0068, 0.288, 0.001);
    const pJ = J(side > 0 ? "pecFinL" : "pecFinR", pAt, neck, "fan");
    const NP = 6;
    const pt: THREE.Vector3[] = [];
    const pb: THREE.Vector3[] = [];
    for (let i = 0; i < NP; i++) {
      const s = i / (NP - 1);
      const base = pAt.clone().add(V(0, 0.003 - 0.006 * s, -0.001 * s));
      const d = V(side * 1, 0.5 - 1.0 * s, -0.5).normalize();
      pb.push(base);
      pt.push(base.clone().add(d.multiplyScalar(0.006 + 0.002 * Math.sin(Math.PI * s))));
    }
    for (let i = 0; i < NP - 1; i++) P(quad(pb[i], pb[i + 1], pt[i + 1], pt[i]), i % 2 ? C.fin : C.fin2, V(0, 0, 0), undefined, pJ);
    for (let i = 0; i < NP; i++) {
      const d = pt[i].clone().sub(pb[i]);
      P(new THREE.CylinderGeometry(0.0003, 0.0004, d.length(), 4), C.ray, pb[i].clone().lerp(pt[i], 0.5), d, pJ);
    }
  }

  // ---------- seagrass strand (held by the tail) ----------
  const stem = new THREE.CatmullRomCurve3([
    V(0.008, 0.004, 0.024),
    V(0.004, 0.06, 0.018),
    V(0, 0.12, stemZ),
    V(0, 0.16, stemZ),
    V(0, 0.185, stemZ),
    V(-0.016, 0.215, 0.006),
    V(-0.034, 0.27, -0.006),
    V(-0.046, 0.34, -0.016),
    V(-0.05, 0.41, -0.02),
    V(-0.044, 0.46, -0.016),
  ]);
  const gJ: any[] = [];
  let gPrev = root;
  for (let i = 0; i < 4; i++) {
    gPrev = J(`grass${i}`, stem.getPointAt(0.02 + (i / 3) * 0.75), gPrev);
    gJ.push(gPrev);
  }
  const NS = 44;
  const sSeg = stem.getLength() / NS;
  for (let i = 0; i < NS; i++) {
    const t = (i + 0.5) / NS;
    const r = 0.0036 - 0.0016 * t;
    const bone = gJ[Math.min(3, Math.floor((t / 0.78) * 3 + 0.5))];
    P(new THREE.CylinderGeometry(r * 0.95, r, sSeg * 1.08, 6), i > NS - 4 ? C.grassTip : i % 2 ? C.grass1 : C.grass2, stem.getPointAt(t), stem.getTangentAt(t), bone);
    if (i % 5 === 2) {
      const g = new THREE.TorusGeometry(r * 0.95, 0.0004, 3, 8);
      g.rotateX(Math.PI / 2);
      P(g, C.grass3, stem.getPointAt(t), stem.getTangentAt(t), bone);
    }
  }
  P(new THREE.SphereGeometry(0.002, 6, 4), C.grassTip, stem.getPointAt(1), undefined, gJ[3]);

  // ---------- extra seagrass blades (flat ribbons) ----------
  const blades = [
    [V(-0.03, 0.006, 0.02), V(-0.04, 0.09, 0.03), V(-0.065, 0.18, 0.04), V(-0.09, 0.23, 0.05)],
    [V(0.028, 0.006, -0.01), V(0.04, 0.1, -0.02), V(0.05, 0.2, -0.03), V(0.07, 0.29, -0.025), V(0.09, 0.33, -0.01)],
    [V(-0.012, 0.008, -0.03), V(-0.02, 0.08, -0.05), V(-0.015, 0.15, -0.075), V(0.0, 0.19, -0.09)],
    [V(0.04, 0.004, 0.035), V(0.055, 0.06, 0.045), V(0.08, 0.11, 0.05)],
  ];
  blades.forEach((pts, bi) => {
    const cur = new THREE.CatmullRomCurve3(pts);
    const n = Math.max(8, Math.round(cur.getLength() / 0.012));
    const seg = cur.getLength() / n;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const w = 0.009 * (1 - t * 0.7);
      const col = i >= n - 2 ? C.grassTip : (i + bi) % 2 ? C.grass1 : C.grass3;
      P(new THREE.BoxGeometry(w, seg * 1.06, 0.0012), col, cur.getPointAt(t), cur.getTangentAt(t), root);
    }
  });

  // ---------- sand mound, pebbles, starfish ----------
  const dome = new THREE.SphereGeometry(0.085, 16, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.25, 1);
  P(dome, C.sand, V(0, 0, 0), undefined, root);
  const domeY = (x: number, z: number) => 0.02125 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (0.085 * 0.085)));
  for (let k = 0; k < 10; k++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.02 + rand() * 0.06;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const g = new THREE.DodecahedronGeometry(0.004 + rand() * 0.006, 0);
    g.scale(1, 0.6, 1);
    P(g, [C.pebble1, C.pebble2, C.pebble3, C.sandDark][k % 4], V(x, domeY(x, z) + 0.001, z), undefined, root);
  }
  {
    const sx = 0.05, sz = 0.04;
    const sAt = V(sx, domeY(sx, sz) + 0.0015, sz);
    P(new THREE.CylinderGeometry(0.004, 0.0045, 0.003, 5), C.star, sAt, undefined, root);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const d = V(Math.cos(a), -0.12, Math.sin(a)).normalize();
      P(new THREE.ConeGeometry(0.0028, 0.012, 4), C.star, sAt.clone().add(d.clone().multiplyScalar(0.0065)), d, root);
      P(new THREE.SphereGeometry(0.0007, 4, 3), C.starDot, sAt.clone().add(d.clone().multiplyScalar(0.005)).add(V(0, 0.0014, 0)), undefined, root);
    }
  }

  return b.root;
}
