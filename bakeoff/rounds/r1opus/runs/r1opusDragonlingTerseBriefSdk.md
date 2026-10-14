```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby, big-eyed baby dragon in a rigging rest pose: mint-teal hide, cream belly plates, coral spines and two-tone wings, stubby horns and a spade-tipped tail. Built from low-poly primitives on a named skeleton.",
};

type V = [number, number, number];
type P = V | THREE.Vector3;

export default function build() {
  const b = createBuilder({ name: "babyDragon" });

  // ---------- palette ----------
  const C = {
    body: "#3fae95",
    dark: "#2a7f73",
    belly: "#f6e4b4",
    plate: "#e6c487",
    wing: "#ff7f57",
    wingIn: "#ffb47d",
    spine: "#ff6159",
    horn: "#fff0d2",
    hornBase: "#efd29c",
    claw: "#fff7e8",
    eyeW: "#fffdf5",
    iris: "#f7b733",
    pupil: "#1b1630",
    blush: "#ff9aa8",
    mouth: "#b8425a",
    nose: "#1e5b52",
  };

  // ---------- small math helpers ----------
  const vv = (p: P) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
  const tv = (p: P): V => {
    const q = vv(p);
    return [q.x, q.y, q.z];
  };

  const basis = (yDir: P, xHint?: P) => {
    const y = vv(yDir).normalize();
    let x: THREE.Vector3;
    if (xHint) {
      const h = vv(xHint);
      x = h.sub(y.clone().multiplyScalar(h.dot(y)));
      if (x.lengthSq() < 1e-8) x = new THREE.Vector3(1, 0, 0);
      x.normalize();
    } else {
      const ref = Math.abs(y.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      x = new THREE.Vector3().crossVectors(y, ref).normalize();
    }
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    return new THREE.Matrix4().makeBasis(x, y, z);
  };

  // Every part is built in model space, then seated on the frame of an anchor
  // point that lies on the bone it should ride.
  const add = (g: THREE.BufferGeometry, color: string, anchor: P) => {
    const a = vv(anchor);
    g.translate(-a.x, -a.y, -a.z);
    b.stick(g, color, frame([a.x, a.y, a.z], [0, 1, 0], [0, 0, 1]));
  };

  const ell = (
    c: P, R: V, color: string, anchor: P,
    yDir?: P, xHint?: P, ws = 10, hs = 8,
  ) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(R[0], R[1], R[2]);
    if (yDir) g.applyMatrix4(basis(yDir, xHint));
    const q = vv(c);
    g.translate(q.x, q.y, q.z);
    add(g, color, anchor);
  };

  const ball = (c: P, r: number, color: string, anchor: P, ws = 8, hs = 6) =>
    ell(c, [r, r, r], color, anchor, undefined, undefined, ws, hs);

  const tube = (a: P, c: P, ra: number, rc: number, color: string, anchor: P, sides = 8) => {
    const A = vv(a), Cc = vv(c);
    const d = Cc.clone().sub(A);
    const g = new THREE.CylinderGeometry(rc, ra, d.length(), sides, 1);
    g.applyMatrix4(basis(d));
    const m = A.clone().add(Cc).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    add(g, color, anchor);
  };

  const cone = (
    base: P, dir: P, len: number, r: number, color: string, anchor: P,
    sides = 6, flat = 1, xHint?: P,
  ) => {
    const g = new THREE.ConeGeometry(r, len, sides, 1);
    g.translate(0, len / 2, 0);
    g.scale(flat, 1, 1);
    g.applyMatrix4(basis(dir, xHint));
    const q = vv(base);
    g.translate(q.x, q.y, q.z);
    add(g, color, anchor);
  };

  const ringBand = (c: P, dir: P, R: number, t: number, color: string, anchor: P) => {
    const g = new THREE.TorusGeometry(R, t, 4, 12);
    g.rotateX(Math.PI / 2);
    g.applyMatrix4(basis(dir));
    const q = vv(c);
    g.translate(q.x, q.y, q.z);
    add(g, color, anchor);
  };

  const sheet = (tris: THREE.Vector3[][], color: string, anchor: P) => {
    const pos: number[] = [];
    for (const [p0, p1, p2] of tris) {
      pos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      pos.push(p0.x, p0.y, p0.z, p2.x, p2.y, p2.z, p1.x, p1.y, p1.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
    g.setIndex(Array.from({ length: pos.length / 3 }, (_, i) => i));
    g.computeVertexNormals();
    add(g, color, anchor);
  };

  // point + outward normal on an ellipsoid, in a given direction from its centre
  const ellPt = (c: P, R: V, d: P) => {
    const dv = vv(d).normalize();
    const t = 1 / Math.sqrt((dv.x / R[0]) ** 2 + (dv.y / R[1]) ** 2 + (dv.z / R[2]) ** 2);
    const cc = vv(c);
    const p = cc.clone().addScaledVector(dv, t);
    const n = new THREE.Vector3(
      (dv.x * t) / (R[0] * R[0]),
      (dv.y * t) / (R[1] * R[1]),
      (dv.z * t) / (R[2] * R[2]),
    ).normalize();
    return { p, n };
  };

  // ---------- skeleton ----------
  const J: Record<string, V> = {};
  const joints: Record<string, any> = {};
  const jt = (name: string, at: V, parent?: string) => {
    J[name] = at;
    joints[name] = parent
      ? b.joint(name, { at, parent: joints[parent] })
      : b.joint(name, { at });
    return joints[name];
  };
  const bm = (a: string, c: string): V => [
    (J[a][0] + J[c][0]) / 2,
    (J[a][1] + J[c][1]) / 2,
    (J[a][2] + J[c][2]) / 2,
  ];

  jt("hips", [0, 0.3, -0.06]);
  jt("spine", [0, 0.32, 0.07], "hips");
  jt("chest", [0, 0.37, 0.16], "spine");
  jt("neck", [0, 0.45, 0.23], "chest");
  jt("head", [0, 0.58, 0.3], "neck");
  jt("snout", [0, 0.55, 0.48], "head");
  jt("jaw", [0, 0.51, 0.35], "head");
  jt("jawTip", [0, 0.475, 0.47], "jaw");

  const tailN = ["hips", "tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"];
  const tailP: V[] = [
    J.hips,
    [0, 0.27, -0.22],
    [0, 0.2, -0.36],
    [0, 0.12, -0.49],
    [0, 0.07, -0.62],
    [0, 0.062, -0.74],
    [0, 0.09, -0.85],
  ];
  const tailR = [0.09, 0.075, 0.058, 0.043, 0.031, 0.022, 0.014];
  for (let i = 1; i < tailN.length; i++) jt(tailN[i], tailP[i], tailN[i - 1]);

  const sides: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];
  for (const [s, S] of sides) {
    const X = (p: V): V => [p[0] * s, p[1], p[2]];
    jt("shoulder" + S, X([0.105, 0.31, 0.15]), "chest");
    jt("elbow" + S, X([0.14, 0.17, 0.17]), "shoulder" + S);
    jt("wrist" + S, X([0.14, 0.065, 0.18]), "elbow" + S);
    jt("hand" + S, X([0.14, 0.025, 0.25]), "wrist" + S);

    jt("hip" + S, X([0.1, 0.27, -0.07]), "hips");
    jt("knee" + S, X([0.155, 0.17, 0.0]), "hip" + S);
    jt("ankle" + S, X([0.155, 0.07, -0.06]), "knee" + S);
    jt("foot" + S, X([0.155, 0.025, 0.04]), "ankle" + S);

    jt("wing" + S, X([0.07, 0.41, 0.06]), "chest");
    jt("wingElbow" + S, X([0.22, 0.5, 0.02]), "wing" + S);
    jt("wingWrist" + S, X([0.36, 0.56, -0.02]), "wingElbow" + S);
    jt("wingF1" + S, X([0.5, 0.61, -0.08]), "wingWrist" + S);
    jt("wingF2" + S, X([0.48, 0.47, -0.13]), "wingWrist" + S);
    jt("wingF3" + S, X([0.37, 0.39, -0.16]), "wingWrist" + S);
  }

  // ---------- torso ----------
  const BODY_C: V = [0, 0.3, 0.02];
  const BODY_R: V = [0.145, 0.14, 0.2];
  const bodyA = bm("hips", "spine");
  const chestA = bm("spine", "chest");
  ell(BODY_C, BODY_R, C.body, bodyA, undefined, undefined, 12, 9);
  ell([0, 0.37, 0.15], [0.115, 0.12, 0.11], C.body, chestA, undefined, undefined, 12, 9);

  // cream belly + chest
  const BELLY_C: V = [0, 0.275, 0.06];
  const BELLY_R: V = [0.115, 0.12, 0.18];
  ell(BELLY_C, BELLY_R, C.belly, bodyA, undefined, undefined, 12, 9);
  const CB_C: V = [0, 0.34, 0.18];
  const CB_R: V = [0.085, 0.1, 0.1];
  ell(CB_C, CB_R, C.belly, chestA, undefined, undefined, 10, 8);

  // belly plates
  for (let k = 0; k < 5; k++) {
    const a = 0.35 + k * 0.33;
    const { p, n } = ellPt(BELLY_C, BELLY_R, [0, -Math.sin(a), Math.cos(a)]);
    ell(p.clone().addScaledVector(n, -0.01), [0.066, 0.016, 0.022], C.plate, bodyA, n, [1, 0, 0], 8, 4);
  }
  for (const dy of [0.35, -0.05]) {
    const { p, n } = ellPt(CB_C, CB_R, [0, dy, 1]);
    ell(p.clone().addScaledVector(n, -0.01), [0.052, 0.015, 0.02], C.plate, chestA, n, [1, 0, 0], 8, 4);
  }

  // back spots (hand-placed, a little asymmetric)
  const spotDirs: [V, number][] = [
    [[0.55, 0.7, -0.3], 0.03],
    [[0.75, 0.55, 0.05], 0.022],
    [[0.4, 0.85, 0.25], 0.017],
    [[-0.6, 0.7, -0.15], 0.028],
    [[-0.72, 0.5, 0.22], 0.019],
    [[-0.35, 0.88, -0.45], 0.022],
    [[0.2, 0.9, -0.6], 0.015],
  ];
  for (const [d, r] of spotDirs) {
    const { p, n } = ellPt(BODY_C, BODY_R, d);
    ell(p.clone().addScaledVector(n, -0.002), [r, 0.006, r * 0.8], C.dark, bodyA, n, [0, 0, 1], 8, 4);
  }

  // ---------- neck ----------
  const N0: V = [0, 0.4, 0.19];
  const N1: V = [0, 0.53, 0.28];
  const neckA = bm("neck", "head");
  tube(N0, N1, 0.078, 0.068, C.body, neckA, 9);
  const nAxis = vv(N1).sub(vv(N0)).normalize();
  const nFront = new THREE.Vector3(0, -nAxis.z, nAxis.y).normalize(); // forward-down
  const nBack = nFront.clone().multiplyScalar(-1);
  const nMid = vv(N0).lerp(vv(N1), 0.5);
  ell(nMid.clone().addScaledVector(nFront, 0.045), [0.05, 0.08, 0.035], C.belly, neckA, nAxis, [1, 0, 0], 8, 6);
  // throat plates
  for (const t of [0.3, 0.7]) {
    const q = vv(N0).lerp(vv(N1), t).addScaledVector(nFront, 0.07);
    ell(q, [0.04, 0.012, 0.011], C.plate, neckA, nFront, [1, 0, 0], 8, 4);
  }

  // ---------- head ----------
  const HA = bm("head", "snout");
  const JA = bm("jaw", "jawTip");
  const CR_C: V = [0, 0.6, 0.31];
  const CR_R: V = [0.15, 0.13, 0.14];
  ell(CR_C, CR_R, C.body, HA, undefined, undefined, 12, 9);
  const SN_C: V = [0, 0.555, 0.43];
  const SN_R: V = [0.105, 0.065, 0.1];
  ell(SN_C, SN_R, C.body, HA, undefined, undefined, 10, 8);

  // lower jaw, chin and mouth interior
  ell([0, 0.495, 0.41], [0.09, 0.035, 0.085], C.body, JA, undefined, undefined, 10, 6);
  ell([0, 0.488, 0.412], [0.074, 0.03, 0.08], C.belly, JA, undefined, undefined, 10, 6);
  ell([0, 0.515, 0.4], [0.08, 0.022, 0.07], C.mouth, JA, undefined, undefined, 8, 5);

  // forehead diamond emblem
  {
    const { p, n } = ellPt(CR_C, CR_R, [0, 0.62, 0.78]);
    const g = new THREE.OctahedronGeometry(1, 0);
    g.scale(0.022, 0.006, 0.032);
    g.applyMatrix4(basis(n, [1, 0, 0]));
    g.translate(p.x, p.y, p.z);
    add(g, C.spine, HA);
  }
  // head-back spine
  {
    const { p, n } = ellPt(CR_C, CR_R, [0, 0.55, -0.83]);
    cone(p.clone().addScaledVector(n, -0.01), n.clone().add(new THREE.Vector3(0, 0, -0.5)), 0.055, 0.03, C.spine, HA, 4, 0.35, [1, 0, 0]);
  }

  for (const [s, S] of sides) {
    const X = (p: V): V => [p[0] * s, p[1], p[2]];

    // eyes: sclera, iris, pupil, highlights
    {
      const { p, n } = ellPt(CR_C, CR_R, X([0.5, 0.3, 0.81]));
      const at = (k: number) => p.clone().addScaledVector(n, k);
      ell(at(-0.005), [0.06, 0.034, 0.06], C.eyeW, HA, n, [0, 1, 0], 12, 8);
      ell(at(0.016), [0.046, 0.022, 0.046], C.iris, HA, n, [0, 1, 0], 12, 6);
      ell(at(0.026), [0.031, 0.015, 0.029], C.pupil, HA, n, [0, 1, 0], 10, 6);
      ball(at(0.037).add(new THREE.Vector3(0.008 * s, 0.014, 0)), 0.011, C.eyeW, HA, 6, 5);
      ball(at(0.035).add(new THREE.Vector3(-0.01 * s, -0.012, 0)), 0.0055, C.eyeW, HA, 5, 4);
    }
    // brow
    {
      const { p, n } = ellPt(CR_C, CR_R, X([0.46, 0.66, 0.6]));
      ell(p, [0.04, 0.012, 0.014], C.dark, HA, n, X([1, 0.3, 0]), 8, 4);
    }
    // blush cheeks
    {
      const { p, n } = ellPt(CR_C, CR_R, X([0.78, -0.2, 0.55]));
      ell(p.clone().addScaledVector(n, -0.001), [0.03, 0.005, 0.022], C.blush, HA, n, [0, 1, 0], 8, 4);
    }
    // nostrils
    {
      const { p, n } = ellPt(SN_C, SN_R, X([0.32, 0.5, 0.8]));
      ell(p.clone().addScaledVector(n, 0.002), [0.014, 0.008, 0.01], C.body, HA, n, X([1, 0, 0]), 6, 4);
      ell(p.clone().addScaledVector(n, 0.008), [0.009, 0.004, 0.006], C.nose, HA, n, X([1, 0, 0]), 6, 4);
    }
    // little overbite fangs
    cone(X([0.04, 0.512, 0.49]), [0, -1, 0.15], 0.026, 0.008, C.claw, HA, 5);

    // horns: three curving segments, sweeping back
    {
      const { p, n } = ellPt(CR_C, CR_R, X([0.4, 0.82, -0.4]));
      const h0 = p.clone().addScaledVector(n, -0.012);
      const h1 = h0.clone().add(vv(X([0.03, 0.06, -0.03])));
      const h2 = h1.clone().add(vv(X([0.02, 0.035, -0.05])));
      const h3 = h2.clone().add(vv(X([0.006, 0.002, -0.045])));
      tube(h0, h1, 0.03, 0.023, C.hornBase, HA, 7);
      ball(h1, 0.023, C.hornBase, HA, 7, 5);
      tube(h1, h2, 0.023, 0.015, C.horn, HA, 7);
      ball(h2, 0.015, C.horn, HA, 6, 5);
      cone(h2, h3.clone().sub(h2), 0.05, 0.015, C.horn, HA, 7);
    }
    // ear frills
    {
      const { p } = ellPt(CR_C, CR_R, X([0.92, 0.2, -0.35]));
      const d1 = vv(X([1, 0.35, -0.7]));
      cone(p, d1, 0.095, 0.035, C.spine, HA, 4, 0.3, new THREE.Vector3().crossVectors(d1, new THREE.Vector3(0, 1, 0)));
      const q = ellPt(CR_C, CR_R, X([0.9, -0.1, -0.5])).p;
      const d2 = vv(X([1, 0.0, -0.8]));
      cone(q, d2, 0.065, 0.025, C.wing, HA, 4, 0.3, new THREE.Vector3().crossVectors(d2, new THREE.Vector3(0, 1, 0)));
    }
  }

  // ---------- dorsal spines ----------
  cone(nMid.clone().addScaledVector(nBack, 0.064), nBack.clone().add(new THREE.Vector3(0, 0.6, 0)), 0.05, 0.028, C.spine, neckA, 4, 0.35, [1, 0, 0]);
  const backSp: [number, number][] = [
    [-0.25, 0.055],
    [0.2, 0.068],
    [0.62, 0.064],
    [1.0, 0.052],
  ];
  for (const [th, h] of backSp) {
    const { p, n } = ellPt(BODY_C, BODY_R, [0, Math.cos(th), -Math.sin(th)]);
    const anchor = p.z > 0.07 ? chestA : bodyA;
    cone(p.clone().addScaledVector(n, -0.012), n.clone().add(new THREE.Vector3(0, 0, -0.55)), h, h * 0.55, C.spine, anchor, 4, 0.35, [1, 0, 0]);
  }

  // ---------- tail ----------
  for (let i = 0; i < tailN.length - 1; i++) {
    const a = bm(tailN[i], tailN[i + 1]);
    tube(tailP[i], tailP[i + 1], tailR[i], tailR[i + 1], C.body, a, 8);
    ball(tailP[i + 1], tailR[i + 1], C.body, a, 8, 6);
  }
  const tailSp = [0.045, 0.038, 0.03, 0.022, 0.016];
  for (let i = 1; i <= 5; i++) {
    const a = bm(tailN[i - 1], tailN[i]);
    const base = vv(tailP[i]).add(new THREE.Vector3(0, tailR[i] - 0.008, 0));
    cone(base, [0, 1, -0.7], tailSp[i - 1], tailSp[i - 1] * 0.55, C.spine, a, 4, 0.35, [1, 0, 0]);
  }
  for (const i of [2, 3, 4]) {
    const dir = vv(tailP[i + 1]).sub(vv(tailP[i - 1]));
    ringBand(tailP[i], dir, tailR[i] * 0.98, 0.007, C.dark, bm(tailN[i - 1], tailN[i]));
  }
  // spade tip
  {
    const tipA = bm("tail5", "tailTip");
    const end = vv(tailP[6]).add(new THREE.Vector3(0, 0.006, -0.045));
    const g = new THREE.OctahedronGeometry(1, 0);
    g.scale(0.06, 0.013, 0.08);
    g.translate(end.x, end.y, end.z);
    add(g, C.spine, tipA);
    const g2 = new THREE.OctahedronGeometry(1, 0);
    g2.scale(0.033, 0.012, 0.046);
    g2.translate(end.x, end.y + 0.004, end.z - 0.004);
    add(g2, C.wingIn, tipA);
  }

  // ---------- legs, arms, wings ----------
  for (const [s, S] of sides) {
    const X = (p: V): V => [p[0] * s, p[1], p[2]];
    const j = (n: string) => J[n + S];
    const m = (a: string, c: string) => bm(a + S, c + S);

    // hind leg
    const thighA = m("hip", "knee");
    const HC: V = X([0.115, 0.235, -0.05]);
    const HR: V = [0.068, 0.095, 0.1];
    ell(HC, HR, C.body, thighA, undefined, undefined, 10, 8);
    {
      const { p, n } = ellPt(HC, HR, X([1, 0.4, -0.2]));
      ell(p, [0.026, 0.005, 0.02], C.dark, thighA, n, [0, 0, 1], 8, 4);
    }
    tube(j("hip"), j("knee"), 0.055, 0.045, C.body, thighA, 8);
    ball(j("knee"), 0.045, C.body, thighA);
    const shinA = m("knee", "ankle");
    tube(j("knee"), j("ankle"), 0.042, 0.034, C.body, shinA, 8);
    ball(j("ankle"), 0.034, C.body, shinA);
    const footA = m("ankle", "foot");
    ell(X([0.155, 0.03, 0.015]), [0.052, 0.03, 0.075], C.body, footA, undefined, undefined, 10, 6);
    for (const dx of [-0.028, 0, 0.028]) {
      ell(X([0.155 + dx, 0.022, 0.076]), [0.019, 0.018, 0.02], C.body, footA, undefined, undefined, 6, 5);
      cone(X([0.155 + dx, 0.022, 0.09]), [0, -0.3, 1], 0.026, 0.009, C.claw, footA, 5);
    }

    // front leg
    const upA = m("shoulder", "elbow");
    ball(j("shoulder"), 0.052, C.body, upA, 8, 6);
    tube(j("shoulder"), j("elbow"), 0.045, 0.036, C.body, upA, 8);
    ball(j("elbow"), 0.036, C.body, upA);
    const foreA = m("elbow", "wrist");
    tube(j("elbow"), j("wrist"), 0.034, 0.03, C.body, foreA, 8);
    ball(j("wrist"), 0.03, C.body, foreA);
    const pawA = m("wrist", "hand");
    ell(X([0.14, 0.03, 0.215]), [0.042, 0.03, 0.055], C.body, pawA, undefined, undefined, 10, 6);
    for (const dx of [-0.022, 0, 0.022]) {
      ell(X([0.14 + dx, 0.022, 0.258]), [0.016, 0.016, 0.017], C.body, pawA, undefined, undefined, 6, 5);
      cone(X([0.14 + dx, 0.022, 0.27]), [0, -0.3, 1], 0.022, 0.008, C.claw, pawA, 5);
    }

    // wing arm
    const wA = m("wing", "wingElbow");
    ball(j("wing"), 0.032, C.body, wA, 8, 6);
    tube(j("wing"), j("wingElbow"), 0.024, 0.018, C.body, wA, 7);
    ball(j("wingElbow"), 0.019, C.body, wA, 7, 5);
    const wB = m("wingElbow", "wingWrist");
    tube(j("wingElbow"), j("wingWrist"), 0.018, 0.014, C.body, wB, 7);
    ball(j("wingWrist"), 0.016, C.body, wB, 7, 5);
    cone(j("wingWrist"), X([0.25, 1, 0.5]), 0.03, 0.009, C.claw, wB, 5);
    for (const f of ["wingF1", "wingF2", "wingF3"]) {
      const fa = m("wingWrist", f);
      tube(j("wingWrist"), j(f), 0.011, 0.005, C.body, fa, 6);
      const d = vv(j(f)).sub(vv(j("wingWrist")));
      cone(j(f), d, 0.018, 0.005, C.claw, fa, 4);
    }

    // wing membranes: scalloped coral outer panels, peach inner panel
    const W = vv(j("wingWrist"));
    const E = vv(j("wingElbow"));
    const R0 = vv(j("wing"));
    const F1 = vv(j("wingF1"));
    const F2 = vv(j("wingF2"));
    const F3 = vv(j("wingF3"));
    const Bt = vv(X([0.08, 0.36, -0.08]));
    const scallop = (a: THREE.Vector3, c: THREE.Vector3, toward: THREE.Vector3, k: number) =>
      a.clone().add(c).multiplyScalar(0.5).lerp(toward, k);
    const m12 = scallop(F1, F2, W, 0.28);
    const m23 = scallop(F2, F3, W, 0.25);
    const m3B = scallop(F3, Bt, E, 0.22);
    sheet([[W, F1, m12], [W, m12, F2]], C.wing, m("wingWrist", "wingF1"));
    sheet([[W, F2, m23], [W, m23, F3]], C.wing, m("wingWrist", "wingF3"));
    sheet(
      [[R0, E, Bt], [E, W, F3], [E, F3, m3B], [E, m3B, Bt]],
      C.wingIn,
      wB,
    );
  }

  return b.root;
}
```