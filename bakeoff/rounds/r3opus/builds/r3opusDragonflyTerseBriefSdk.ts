import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

type P = [number, number, number];

export const meta = {
  name: "Dragonfly",
  description:
    "A stylized hawker dragonfly in a rigging rest pose. It has faceted compound eyes, a slanted green synthorax with yellow stripes, and a segmented dark abdomen with turquoise spots. Its four veined wings carry amber bases and dark pterostigmas, and its six spiny legs plant it on the ground.",
};

export default function build() {
  const b: any = createBuilder({ name: "dragonfly" });
  const rand: any = rng(11);
  const rnd = (): number => (typeof rand === "function" ? rand() : rand.next());

  const V = (p: P) => new THREE.Vector3(p[0], p[1], p[2]);
  const T = (v: THREE.Vector3): P => [v.x, v.y, v.z];

  // ---------- geometry helpers (orientation baked into geometry, position via `at`) ----------
  function basisY(d: THREE.Vector3) {
    const y = d.clone().normalize();
    const h = Math.abs(y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const x = new THREE.Vector3().crossVectors(y, h).normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    return new THREE.Matrix4().makeBasis(x, y, z);
  }
  function seg(a: P, c: P, r1: number, r2: number, color: string, bone: any, sides = 6) {
    const A = V(a), B = V(c);
    const d = B.clone().sub(A);
    const len = Math.max(d.length(), 1e-6);
    const g = new THREE.CylinderGeometry(r2, r1, len, sides, 1);
    g.applyMatrix4(basisY(d));
    const m = A.clone().add(B).multiplyScalar(0.5);
    return b.part(g, color, { at: T(m), bone });
  }
  function blob(c: P, s: P, color: string, bone: any, rot?: P, ico = false, w = 8, h = 6) {
    const g: THREE.BufferGeometry = ico
      ? new THREE.IcosahedronGeometry(1, 1)
      : new THREE.SphereGeometry(1, w, h);
    g.scale(s[0], s[1], s[2]);
    if (rot) {
      g.rotateX(rot[0]);
      g.rotateY(rot[1]);
      g.rotateZ(rot[2]);
    }
    return b.part(g, color, { at: c, bone });
  }
  function J(name: string, at: P, parent?: any, role?: string) {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return b.joint(name, o);
  }

  // ---------- palette ----------
  const C = {
    thorax: "#2fa37f",
    thoraxDark: "#1f6b55",
    stripe: "#f2d04b",
    black: "#0c121a",
    abdomen: "#1b2735",
    spotBlue: "#36b6f0",
    spotGreen: "#9be15d",
    eye: "#2e7fd6",
    eyeDeep: "#1a4f96",
    pupil: "#0d1b2e",
    glint: "#f4fbff",
    face: "#d6e86a",
    clypeus: "#9fc04a",
    labrum: "#e8d27a",
    labium: "#c9a85a",
    ocellus: "#f6e9a8",
    femur: "#3a2a1e",
    leg: "#141a20",
    wing: "#cfe8f0",
    vein: "#3a4652",
    stigma: "#3b2416",
    amber: "#e3a03c",
  };

  // ---------- skeleton ----------
  const thorax = J("thorax", [0, 0.015, 0.011], undefined, "spine");
  const neck = J("neck", [0, 0.016, 0.0195], thorax, "neck");
  const head = J("head", [0, 0.0165, 0.022], neck, "head");
  const jaw = J("jaw", [0, 0.0114, 0.0268], head, "jaw");
  J("jawTip", [0, 0.0108, 0.0285], jaw, "jaw");

  // abdomen
  const segLens = [0.003, 0.004, 0.0055, 0.0058, 0.0058, 0.0058, 0.0055, 0.005, 0.004, 0.003];
  const radii = [0.0028, 0.003, 0.0026, 0.0018, 0.0017, 0.0018, 0.0019, 0.002, 0.0021, 0.0021, 0.0017];
  const totalLen = segLens.reduce((a, c) => a + c, 0);
  const abPts: P[] = [];
  {
    let z = 0.004;
    let acc = 0;
    for (let i = 0; i <= segLens.length; i++) {
      const t = acc / totalLen;
      abPts.push([0, 0.0145 - 0.0015 * Math.pow(t, 1.5), z]);
      if (i < segLens.length) {
        z -= segLens[i];
        acc += segLens[i];
      }
    }
  }
  const tail: any[] = [];
  for (let i = 0; i < abPts.length; i++) {
    const name = i < segLens.length ? `tail${i + 1}` : "tailTip";
    tail.push(J(name, abPts[i], i === 0 ? thorax : tail[i - 1], "tail"));
  }

  // ---------- thorax ----------
  const tilt = -0.35;
  blob([0, 0.0152, 0.0108], [0.0047, 0.0052, 0.0075], C.thorax, thorax, [tilt, 0, 0], false, 9, 7);
  // dorsal carina and wing-base plates
  blob([0, 0.0199, 0.0115], [0.0007, 0.0006, 0.0048], C.black, thorax, [tilt, 0, 0], false, 6, 4);
  for (const s of [1, -1]) {
    // antehumeral yellow stripe, black suture, yellow lateral stripes
    blob([s * 0.0036, 0.0172, 0.0138], [0.0008, 0.0032, 0.0009], C.stripe, thorax, [tilt, 0, s * 0.35], false, 6, 5);
    blob([s * 0.0044, 0.0152, 0.0112], [0.0006, 0.0042, 0.0008], C.black, thorax, [tilt - 0.1, 0, 0], false, 6, 5);
    blob([s * 0.0045, 0.0148, 0.0092], [0.0006, 0.004, 0.0011], C.stripe, thorax, [tilt - 0.15, 0, 0], false, 6, 5);
    blob([s * 0.0043, 0.0145, 0.0068], [0.0006, 0.0034, 0.001], C.stripe, thorax, [tilt - 0.2, 0, 0], false, 6, 5);
    // wing hinge sclerites
    blob([s * 0.0018, 0.0196, 0.0135], [0.0012, 0.0006, 0.0014], C.thoraxDark, thorax);
    blob([s * 0.0018, 0.0194, 0.0065], [0.0012, 0.0006, 0.0014], C.thoraxDark, thorax);
  }
  // underside
  blob([0, 0.0106, 0.0115], [0.0026, 0.0012, 0.0052], C.thoraxDark, thorax);

  // ---------- neck / prothorax ----------
  blob([0, 0.0157, 0.0186], [0.0025, 0.0022, 0.0018], C.thoraxDark, neck, undefined, false, 7, 5);
  blob([0, 0.0176, 0.0187], [0.0018, 0.0007, 0.0012], C.stripe, neck, undefined, false, 6, 4);

  // ---------- head ----------
  blob([0, 0.0162, 0.0207], [0.003, 0.0028, 0.002], C.abdomen, head, undefined, false, 7, 5);
  for (const s of [1, -1]) {
    const e: P = [s * 0.0032, 0.0178, 0.0246];
    blob(e, [0.0036, 0.0038, 0.0036], C.eye, head, undefined, true);
    blob([e[0] + s * 0.0004, e[1] - 0.0016, e[2] - 0.0004], [0.0031, 0.0024, 0.0031], C.eyeDeep, head, undefined, true);
    blob([e[0] + s * 0.0015, e[1] + 0.0003, e[2] + 0.0029], [0.0009, 0.0009, 0.0006], C.pupil, head, undefined, false, 6, 4);
    blob([e[0] + s * 0.001, e[1] + 0.0024, e[2] + 0.0018], [0.0007, 0.0005, 0.0005], C.glint, head, undefined, false, 6, 4);
    blob([e[0] + s * 0.0026, e[1] + 0.0016, e[2] + 0.0006], [0.0004, 0.0003, 0.0003], C.glint, head, undefined, false, 5, 3);
    // antennae
    seg([s * 0.0006, 0.0188, 0.0272], [s * 0.0016, 0.0204, 0.0287], 0.00018, 0.00013, C.black, head, 4);
    seg([s * 0.0016, 0.0204, 0.0287], [s * 0.0024, 0.0213, 0.0302], 0.00012, 0.00006, C.black, head, 4);
  }
  // face
  blob([0, 0.0155, 0.0272], [0.0028, 0.0022, 0.0018], C.face, head, undefined, false, 8, 6);
  blob([0, 0.0136, 0.0281], [0.0024, 0.0011, 0.0013], C.clypeus, head, undefined, false, 7, 5);
  // upper jaw (labrum)
  blob([0, 0.0124, 0.0286], [0.0021, 0.0009, 0.0011], C.labrum, head, undefined, false, 7, 5);
  // vertex + ocelli
  blob([0, 0.019, 0.0258], [0.0011, 0.0008, 0.0009], C.face, head, undefined, false, 6, 4);
  blob([0, 0.0197, 0.0263], [0.0004, 0.0004, 0.0004], C.ocellus, head, undefined, false, 5, 4);
  for (const s of [1, -1]) blob([s * 0.0008, 0.0194, 0.0256], [0.00032, 0.00032, 0.00032], C.ocellus, head, undefined, false, 5, 4);

  // lower jaw (labium) + mandibles
  blob([0, 0.0112, 0.0274], [0.0022, 0.0008, 0.0016], C.labium, jaw, undefined, false, 7, 5);
  for (const s of [1, -1]) {
    seg([s * 0.0012, 0.0118, 0.0278], [s * 0.0004, 0.0116, 0.0291], 0.00035, 0.00012, C.stigma, jaw, 4);
  }

  // ---------- abdomen ----------
  for (let i = 0; i < segLens.length; i++) {
    const A = V(abPts[i]), B = V(abPts[i + 1]);
    const M = A.clone().add(B).multiplyScalar(0.5);
    const r0 = radii[i] * 0.88, r1 = radii[i + 1] * 0.88;
    const rm = Math.max(radii[i], radii[i + 1]);
    const bone = tail[i];
    seg(T(A), T(M), r0, rm, C.abdomen, bone, 8);
    seg(T(M), T(B), rm, r1, C.abdomen, bone, 8);
    // intersegment ring
    const dir = B.clone().sub(A).normalize();
    seg(T(A.clone().addScaledVector(dir, -0.00025)), T(A.clone().addScaledVector(dir, 0.00025)), radii[i] * 0.94, radii[i] * 0.94, C.black, bone, 8);
    // dorsal ridge
    seg(T(A.clone().add(new THREE.Vector3(0, r0 * 0.95, 0))), T(B.clone().add(new THREE.Vector3(0, r1 * 0.95, 0))), 0.00018, 0.00018, C.black, bone, 3);
    // spots
    const len = segLens[i];
    const P = A.clone().lerp(B, 0.62);
    const r = rm;
    const dorsal = i < 2 ? C.spotGreen : C.spotBlue;
    for (const s of [1, -1]) {
      if (i < segLens.length - 2) {
        blob([P.x + s * r * 0.45, P.y + r * 0.82, P.z], [r * 0.36, r * 0.22, len * 0.22], dorsal, bone, [0, 0, -s * 0.5], false, 6, 4);
      }
      if (i > 0 && i < segLens.length - 1) {
        const Q = A.clone().lerp(B, 0.35);
        blob([Q.x + s * r * 0.9, Q.y + r * 0.1, Q.z], [r * 0.2, r * 0.36, len * 0.16], C.spotBlue, bone, undefined, false, 6, 4);
      }
      if (i < 2) {
        blob([M.x + s * rm * 0.88, M.y - rm * 0.1, M.z], [rm * 0.22, rm * 0.5, len * 0.32], C.spotGreen, bone, undefined, false, 6, 4);
      }
    }
    if (i >= segLens.length - 2) {
      blob([P.x, P.y + r * 0.86, P.z], [r * 0.6, r * 0.24, len * 0.32], C.spotBlue, bone, undefined, false, 7, 4);
    }
  }
  // anal appendages
  {
    const E = abPts[abPts.length - 1];
    const last = tail[segLens.length - 1];
    for (const s of [1, -1]) {
      seg(E, [E[0] + s * 0.0013, E[1] + 0.0004, E[2] - 0.0045], 0.00042, 0.00014, C.black, last, 5);
      blob([E[0] + s * 0.0013, E[1] + 0.0004, E[2] - 0.0045], [0.00018, 0.00018, 0.0004], C.ocellus, last, undefined, false, 5, 3);
    }
    seg(E, [E[0], E[1] - 0.0006, E[2] - 0.0026], 0.00035, 0.00012, C.black, last, 5);
  }

  // ---------- wings ----------
  function wing(code: string, side: number, hinge: P, L: number, W: number, hind: boolean) {
    const base = hind ? 0.22 : 0.1;
    const lead = (t: number) => 0.0012 - 0.0016 * t * t * t + (hind ? 0.0004 : 0);
    const width = (t: number) => W * Math.pow(Math.max(0, Math.sin(Math.PI * (base + (1 - base) * t))), 0.55);
    const vAt = (t: number, k: number) => lead(t) - k * width(t);

    const root = J(`wing${code}`, hinge, thorax, "wing");
    J(`wing${code}Mid`, [hinge[0] + side * L * 0.5, hinge[1], hinge[2] + vAt(0.5, 0.3)], root, "wing");

    const N = 16;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push(new THREE.Vector2(side * t * L, lead(t)));
    }
    for (let i = N - 1; i >= 0; i--) {
      const t = i / N;
      pts.push(new THREE.Vector2(side * t * L, vAt(t, 1)));
    }
    const thick = 0.00025;
    const flat = (shapePts: THREE.Vector2[], depth: number) => {
      const g = new THREE.ExtrudeGeometry(new THREE.Shape(shapePts), { depth, bevelEnabled: false, steps: 1 });
      g.rotateX(Math.PI / 2);
      g.translate(0, depth / 2, 0);
      return g;
    };
    b.part(flat(pts, thick), C.wing, { at: hinge, bone: root });

    // amber base patch
    const tb = hind ? 0.17 : 0.07;
    const ap: THREE.Vector2[] = [];
    for (let i = 0; i <= 4; i++) ap.push(new THREE.Vector2(side * (i / 4) * tb * L, lead((i / 4) * tb) + 0.0001));
    for (let i = 4; i >= 0; i--) {
      const t = (i / 4) * tb;
      const k = hind ? 0.85 - (i / 4) * 0.45 : 0.6;
      ap.push(new THREE.Vector2(side * t * L, vAt(t, k)));
    }
    b.part(flat(ap, thick * 1.6), C.amber, { at: hinge, bone: root });

    // pterostigma
    const t0 = 0.8, t1 = 0.88;
    const sp = [
      new THREE.Vector2(side * t0 * L, lead(t0) - 0.0002),
      new THREE.Vector2(side * t1 * L, lead(t1) - 0.0002),
      new THREE.Vector2(side * t1 * L, lead(t1) - 0.0013),
      new THREE.Vector2(side * t0 * L, lead(t0) - 0.0013),
    ];
    b.part(flat(sp, thick * 2), C.stigma, { at: hinge, bone: root });

    const top = thick / 2;
    const H = V(hinge);
    const local = (t: number, k: number) => new THREE.Vector3(side * t * L, top, -vAt(t, k) * -1);
    // note: shape v maps to +Z after rotateX(+PI/2)
    const loc = (t: number, k: number) => new THREE.Vector3(side * t * L, top, vAt(t, k));
    void local;

    // longitudinal veins
    const ks = [0, 0.13, 0.3, 0.5, 0.72, 1];
    for (const k of ks) {
      const tEnd = k === 0 || k === 1 ? 0.99 : 0.97 - k * 0.1;
      const cp: THREE.Vector3[] = [];
      for (let i = 0; i <= 8; i++) cp.push(loc(0.01 + (tEnd - 0.01) * (i / 8), k));
      const r = k === 0 ? 0.0003 : k === 1 ? 0.00011 : 0.00017;
      const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp), 14, r, 3, false);
      b.part(g, C.vein, { at: hinge, bone: root });
    }
    // crossveins
    for (let gi = 0; gi < ks.length - 1; gi++) {
      const n = 7;
      for (let j = 0; j < n; j++) {
        const t = 0.1 + (0.8 * (j + 0.3 + rnd() * 0.4)) / n;
        const tmax = 0.97 - ks[gi + 1] * 0.1;
        if (t > tmax) continue;
        const a = loc(t, ks[gi]).add(H);
        const c = loc(t + (rnd() - 0.5) * 0.02, ks[gi + 1]).add(H);
        seg(T(a), T(c), 0.0001, 0.0001, C.vein, root, 3);
      }
    }
    // nodus
    blob(T(loc(0.48, 0).add(H)), [0.0005, 0.0003, 0.0005], C.stigma, root, undefined, false, 5, 3);
  }
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    wing(`F${tag}`, s, [s * 0.0015, 0.0195, 0.0135], 0.042, 0.0085, false);
    wing(`H${tag}`, s, [s * 0.0015, 0.0194, 0.0065], 0.04, 0.012, true);
  }

  // ---------- legs ----------
  const zs = [0.0155, 0.0118, 0.0082];
  const kz = [0.0035, 0.0005, -0.0028];
  const az = [0.0062, 0.0002, -0.0058];
  const fz = [0.0072, -0.0001, -0.0068];
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    for (let n = 0; n < 3; n++) {
      const z = zs[n];
      const pHip: P = [s * 0.0016, 0.0108, z];
      const pKnee: P = [s * 0.0062, 0.0128, z + kz[n]];
      const pAnkle: P = [s * 0.0086, 0.0035, z + az[n]];
      const pFoot: P = [s * 0.0096, 0.0004, z + fz[n]];
      const hip = J(`hip${n + 1}${tag}`, pHip, thorax, "leg");
      const knee = J(`knee${n + 1}${tag}`, pKnee, hip, "leg");
      const ankle = J(`ankle${n + 1}${tag}`, pAnkle, knee, "leg");
      J(`foot${n + 1}${tag}`, pFoot, ankle, "leg");

      blob(pHip, [0.0007, 0.0006, 0.0007], C.thoraxDark, hip, undefined, false, 6, 4);
      seg(pHip, pKnee, 0.00045, 0.00034, C.femur, hip, 5);
      blob(pKnee, [0.0004, 0.0004, 0.0004], C.leg, knee, undefined, false, 5, 4);
      seg(pKnee, pAnkle, 0.0003, 0.00022, C.leg, knee, 5);
      seg(pAnkle, pFoot, 0.0002, 0.00014, C.leg, ankle, 4);
      blob(pFoot, [0.00032, 0.00032, 0.00032], C.leg, ankle, undefined, false, 5, 3);
      // tibial spines, pointing in toward the body like a prey basket
      const K = V(pKnee), A = V(pAnkle);
      for (let i = 1; i <= 4; i++) {
        const p = K.clone().lerp(A, i / 5);
        const tip = p.clone().add(new THREE.Vector3(-s * 0.0007, 0.0002, 0.0003));
        seg(T(p), T(tip), 0.00009, 0.00002, C.leg, knee, 3);
      }
      // femur spines
      const Hh = V(pHip);
      for (let i = 1; i <= 2; i++) {
        const p = Hh.clone().lerp(K, i / 3);
        seg(T(p), T(p.clone().add(new THREE.Vector3(0, -0.0006, 0.0002))), 0.0001, 0.00002, C.leg, hip, 3);
      }
      // claws
      for (const c of [1, -1]) {
        seg(pFoot, [pFoot[0] + s * 0.0004, 0.0001, pFoot[2] + c * 0.0003], 0.00008, 0.00003, C.leg, ankle, 3);
      }
    }
  }

  return b.root;
}
