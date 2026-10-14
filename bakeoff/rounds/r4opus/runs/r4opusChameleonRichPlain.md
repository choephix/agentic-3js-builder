```ts
import * as THREE from "three";

export const meta = {
  name: "Panther Chameleon on a Twig",
  description:
    "A stylized low-poly panther chameleon walking along a forked twig on a mossy base. Its faceted body shifts from turquoise at the head through lime to a sunset-orange tail, with a white lateral stripe and red bars. It has a ridged casque crest, turret eyes looking in two directions, mitten feet gripping the twig and a tightly coiled tail.",
};

type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UPY = new THREE.Vector3(0, 1, 0);

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Frames { P: V3[]; T: V3[]; S: V3[]; U: V3[]; A: number[]; L: number }

function makeFrames(pts: V3[]): Frames {
  const n = pts.length;
  const A = [0];
  for (let i = 1; i < n; i++) A.push(A[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const T: V3[] = [], S: V3[] = [], U: V3[] = [];
  const X = V(1, 0, 0);
  for (let i = 0; i < n; i++) {
    const t = pts[Math.min(n - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
    let s = X.clone().addScaledVector(t, -t.dot(X));
    if (s.lengthSq() < 1e-6) s = V(0, 0, 1);
    s.normalize();
    const u = new THREE.Vector3().crossVectors(s, t).normalize();
    T.push(t); S.push(s); U.push(u);
  }
  return { P: pts, T, S, U, A, L: A[n - 1] };
}

function buildTube(
  fr: Frames,
  sides: number,
  prof: (a: number) => [number, number],
  shape: (th: number) => [number, number],
  col: ((a: number, th: number) => THREE.Color) | null,
  capStart: boolean,
  capEnd: boolean
): THREE.BufferGeometry {
  const n = fr.P.length;
  const rings: V3[][] = [];
  for (let i = 0; i < n; i++) {
    const [w, h] = prof(fr.A[i]);
    const ring: V3[] = [];
    for (let j = 0; j < sides; j++) {
      const th = (j / sides) * Math.PI * 2;
      const [cx, cy] = shape(th);
      ring.push(fr.P[i].clone().addScaledVector(fr.S[i], cx * w).addScaledVector(fr.U[i], cy * h));
    }
    rings.push(ring);
  }
  const pos: number[] = [];
  const cols: number[] = [];
  const tri = (a: V3, b: V3, c: V3, k: THREE.Color | null) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    if (k) for (let q = 0; q < 3; q++) cols.push(k.r, k.g, k.b);
  };
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < sides; j++) {
      const j1 = (j + 1) % sides;
      const k = col ? col((fr.A[i] + fr.A[i + 1]) / 2, ((j + 0.5) / sides) * Math.PI * 2) : null;
      tri(rings[i][j], rings[i + 1][j], rings[i + 1][j1], k);
      tri(rings[i][j], rings[i + 1][j1], rings[i][j1], k);
    }
  }
  if (capStart) {
    const c = fr.P[0];
    const k = col ? col(0, Math.PI / 2) : null;
    for (let j = 0; j < sides; j++) tri(c, rings[0][j], rings[0][(j + 1) % sides], k);
  }
  if (capEnd) {
    const c = fr.P[n - 1];
    const k = col ? col(fr.L, Math.PI / 2) : null;
    for (let j = 0; j < sides; j++) tri(c, rings[n - 1][(j + 1) % sides], rings[n - 1][j], k);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  if (col) g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();
  const rnd = makeRng(1337);

  const mats = new Map<number, THREE.MeshStandardMaterial>();
  const M = (hex: number, rough = 0.6): THREE.MeshStandardMaterial => {
    let m = mats.get(hex);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: 0, flatShading: true });
      mats.set(hex, m);
    }
    return m;
  };
  const colCache = new Map<number, THREE.Color>();
  const C = (hex: number) => {
    let c = colCache.get(hex);
    if (!c) { c = new THREE.Color(hex); colCache.set(hex, c); }
    return c;
  };

  const SPH = new THREE.SphereGeometry(1, 9, 7);
  const SPH_LO = new THREE.SphereGeometry(1, 6, 4);
  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const DODE = new THREE.DodecahedronGeometry(1, 0);

  const ell = (p: V3, sx: number, sy: number, sz: number, m: THREE.Material, geo: THREE.BufferGeometry = SPH, parent: THREE.Object3D = root) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.copy(p);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  };
  const limb = (a: V3, b: V3, ra: number, rb: number, m: THREE.Material, seg = 6, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.quaternion.setFromUnitVectors(UPY, d.normalize());
    parent.add(mesh);
    return mesh;
  };
  const spike = (base: V3, dir: V3, r: number, h: number, m: THREE.Material, seg = 4, parent: THREE.Object3D = root) => {
    const g = new THREE.ConeGeometry(r, h, seg);
    g.translate(0, h / 2, 0);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.copy(base);
    mesh.quaternion.setFromUnitVectors(UPY, dir.clone().normalize());
    parent.add(mesh);
    return mesh;
  };

  // ---------- COLOUR GRADIENT ----------
  const STOPS: [number, number][] = [
    [0, 0x1fc3d6], [0.05, 0x27cfae], [0.1, 0x86d93a], [0.16, 0xcbdc2e],
    [0.22, 0xffb92c], [0.3, 0xff7c24], [0.42, 0xff4b2f],
  ];
  const gradHex = (a: number): number => {
    const q = Math.min(STOPS[STOPS.length - 1][0], Math.max(0, Math.round(a / 0.03) * 0.03));
    for (let i = 0; i < STOPS.length - 1; i++) {
      const [a0, h0] = STOPS[i];
      const [a1, h1] = STOPS[i + 1];
      if (q <= a1 + 1e-9) {
        const t = Math.max(0, Math.min(1, (q - a0) / (a1 - a0)));
        return new THREE.Color(h0).lerp(new THREE.Color(h1), t).getHex();
      }
    }
    return STOPS[STOPS.length - 1][1];
  };

  const WHITE = 0xf7f9ef, BELLY = 0xdff3cf, RED = 0xd4232e, BAND = 0xd9402a;
  const whiteMat = M(WHITE, 0.5);
  const redMat = M(RED, 0.5);
  const blackMat = M(0x101418, 0.3);
  const goldMat = M(0xffcf3a, 0.4);

  // ---------- CHAMELEON BODY + TAIL (one swept, face-coloured mesh) ----------
  const sp: V3[] = [
    V(0, 0.293, 0.072), V(0, 0.302, 0.045), V(0, 0.308, 0.01), V(0, 0.305, -0.03),
    V(0, 0.294, -0.065), V(0, 0.279, -0.095), V(0, 0.266, -0.125), V(0, 0.258, -0.15),
  ];
  const cz = -0.168, cy = 0.211, r0 = 0.045, r1 = 0.008, phMax = 2.45 * Math.PI;
  for (let ph = 0; ph <= phMax + 1e-6; ph += 0.16) {
    const k = ph / phMax;
    const r = r0 - (r0 - r1) * Math.pow(k, 0.85);
    sp.push(V(0, cy + r * Math.cos(ph), cz - r * Math.sin(ph)));
  }
  const spCurve = new THREE.CatmullRomCurve3(sp, false, "centripetal");
  const body = makeFrames(spCurve.getSpacedPoints(150));
  const Lb = body.L;

  const BK: [number, number, number][] = [
    [0, 0.0155, 0.024], [0.03, 0.0185, 0.033], [0.07, 0.021, 0.039], [0.11, 0.02, 0.036],
    [0.15, 0.0165, 0.026], [0.185, 0.012, 0.0155], [0.24, 0.0098, 0.012], [0.33, 0.0075, 0.0085],
    [Math.max(Lb, 0.34), 0.003, 0.0032],
  ];
  const bodyProf = (a: number): [number, number] => {
    if (a <= BK[0][0]) return [BK[0][1], BK[0][2]];
    for (let i = 0; i < BK.length - 1; i++) {
      if (a <= BK[i + 1][0]) {
        const t = (a - BK[i][0]) / (BK[i + 1][0] - BK[i][0]);
        return [BK[i][1] + (BK[i + 1][1] - BK[i][1]) * t, BK[i][2] + (BK[i + 1][2] - BK[i][2]) * t];
      }
    }
    const l = BK[BK.length - 1];
    return [l[1], l[2]];
  };
  const bodyShape = (th: number): [number, number] => {
    const s = Math.sin(th);
    return [Math.cos(th) * (1 - 0.34 * Math.max(0, s) - 0.12 * Math.max(0, -s)), s];
  };
  const bodyCol = (a: number, th: number): THREE.Color => {
    const s = Math.sin(th), co = Math.abs(Math.cos(th));
    if (s > -0.45 && s < -0.05 && co > 0.8 && a > 0.004 && a < 0.215) return C(WHITE);
    if (s < -0.8 && a < 0.205) return C(BELLY);
    if (a > 0.012 && a < 0.18 && s > -0.85) {
      const ph = ((a - 0.012) / 0.03) % 1;
      if (ph < 0.38) return C(RED);
    }
    if (a > 0.215 && s > -0.5) {
      const ph = ((a - 0.215) / 0.032) % 1;
      if (ph < 0.3) return C(BAND);
    }
    return C(gradHex(a));
  };
  const skinMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, flatShading: true });
  root.add(new THREE.Mesh(buildTube(body, 12, bodyProf, bodyShape, bodyCol, true, true), skinMat));

  const idxAt = (fr: Frames, a: number) => {
    let best = 0, bd = 1e9;
    for (let i = 0; i < fr.A.length; i++) {
      const d = Math.abs(fr.A[i] - a);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  };

  // dorsal saw-tooth crest
  for (let a = 0.004; a <= 0.225; a += 0.011) {
    const i = idxAt(body, a);
    const [, h] = bodyProf(body.A[i]);
    const t = a / 0.225;
    const base = body.P[i].clone().addScaledVector(body.U[i], h * 0.94);
    const dir = body.U[i].clone().addScaledVector(body.T[i], 0.35);
    spike(base, dir, 0.0026 - 0.001 * t, 0.0062 - 0.003 * t, M(gradHex(a), 0.5));
  }
  // ventral white crest
  for (let a = 0.025; a <= 0.15; a += 0.011) {
    const i = idxAt(body, a);
    const [, h] = bodyProf(body.A[i]);
    const base = body.P[i].clone().addScaledVector(body.U[i], -h * 0.93);
    spike(base, body.U[i].clone().negate(), 0.0018, 0.0042, whiteMat);
  }

  // ---------- BRANCHES ----------
  const barkMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, flatShading: true });
  const BARK = [0x6e4a30, 0x5a3b25, 0x80593a];
  const hash = (x: number) => { const s = Math.sin(x) * 43758.5453; return s - Math.floor(s); };
  const barkCol = (a: number, th: number) =>
    C(BARK[Math.floor(hash(Math.round(a * 300) * 12.9898 + Math.round(th * 3) * 78.233) * 3) % 3]);
  const roundShape = (th: number): [number, number] => [Math.cos(th), Math.sin(th)];

  const mainCtrl = [
    V(0.006, 0.004, -0.152), V(0.004, 0.09, -0.136), V(0.001, 0.168, -0.112), V(0, 0.207, -0.083),
    V(0, 0.221, -0.045), V(0, 0.226, 0.02), V(0, 0.225, 0.09), V(0, 0.219, 0.16),
    V(-0.002, 0.212, 0.23), V(-0.006, 0.212, 0.285), V(-0.012, 0.218, 0.33),
  ];
  const main = makeFrames(new THREE.CatmullRomCurve3(mainCtrl, false, "centripetal").getSpacedPoints(64));
  const mainR = (a: number) => 0.0125 - 0.0072 * (a / main.L);
  root.add(new THREE.Mesh(buildTube(main, 7, (a) => [mainR(a), mainR(a)], roundShape, barkCol, false, true), barkMat));

  const forkCtrl = [V(0.066, 0.004, 0.252), V(0.05, 0.09, 0.24), V(0.022, 0.17, 0.218), V(0.002, 0.214, 0.196)];
  const fork = makeFrames(new THREE.CatmullRomCurve3(forkCtrl, false, "centripetal").getSpacedPoints(24));
  const forkR = (a: number) => 0.0105 - 0.003 * (a / fork.L);
  root.add(new THREE.Mesh(buildTube(fork, 6, (a) => [forkR(a), forkR(a)], roundShape, barkCol, false, false), barkMat));

  const offCtrl = [V(0, 0.222, 0.15), V(-0.012, 0.25, 0.178), V(-0.03, 0.285, 0.203), V(-0.05, 0.31, 0.225)];
  const off = makeFrames(new THREE.CatmullRomCurve3(offCtrl, false, "centripetal").getSpacedPoints(16));
  const offR = (a: number) => 0.005 - 0.0028 * (a / off.L);
  root.add(new THREE.Mesh(buildTube(off, 6, (a) => [offR(a), offR(a)], roundShape, barkCol, false, true), barkMat));

  // broken stub + knot
  const stubBase = V(0.006, 0.222, -0.02);
  limb(stubBase, V(0.024, 0.205, -0.008), 0.0045, 0.0035, M(0x5a3b25, 0.9), 6);
  ell(V(0.024, 0.205, -0.008), 0.0034, 0.0034, 0.0034, M(0xc9a77a, 0.8), SPH_LO);
  ell(V(-0.009, 0.226, 0.125), 0.004, 0.003, 0.006, M(0x4a301e, 0.9), SPH_LO);

  // lichen spots
  const lichenMats = [M(0xa9c48a, 0.95), M(0xd8d37a, 0.95), M(0x8fb7a0, 0.95)];
  const lichenOn = (fr: Frames, rf: (a: number) => number, count: number, i0: number, i1: number) => {
    for (let k = 0; k < count; k++) {
      const i = i0 + Math.floor(rnd() * (i1 - i0));
      const th = rnd() * Math.PI * 2;
      const nrm = fr.S[i].clone().multiplyScalar(Math.cos(th)).addScaledVector(fr.U[i], Math.sin(th)).normalize();
      const r = rf(fr.A[i]);
      const m = ell(fr.P[i].clone().addScaledVector(nrm, r * 0.95), 0.0035 + rnd() * 0.003, 0.0012, 0.0035 + rnd() * 0.003, lichenMats[k % 3], SPH_LO);
      m.quaternion.setFromUnitVectors(UPY, nrm);
    }
  };
  lichenOn(main, mainR, 7, 2, 18);
  lichenOn(main, mainR, 4, 44, 60);
  lichenOn(fork, forkR, 4, 2, 18);

  // leaves
  const leafMats = [M(0x3f9a3a, 0.6), M(0x58b33e, 0.6), M(0x2f7f3a, 0.6)];
  const ribMat = M(0x9fd86a, 0.6);
  const leaf = (base: V3, dir: V3, len: number, m: THREE.Material, roll = 0) => {
    const g = new THREE.Group();
    g.position.copy(base);
    root.add(g);
    g.lookAt(base.clone().add(dir));
    g.rotateZ(roll);
    ell(V(0, 0, len * 0.55), len * 0.3, len * 0.05, len * 0.5, m, SPH_LO, g);
    const rib = new THREE.Mesh(BOX, ribMat);
    rib.scale.set(0.0012, 0.0012, len * 0.9);
    rib.position.set(0, len * 0.05, len * 0.55);
    g.add(rib);
  };
  const offTip = off.P[off.P.length - 1];
  leaf(offTip, V(-0.3, 0.6, 0.7), 0.05, leafMats[0], 0.3);
  leaf(offTip, V(0.45, 0.5, 0.6), 0.045, leafMats[1], -0.4);
  leaf(offTip, V(-0.7, 0.25, 0.25), 0.04, leafMats[2], 0.6);
  leaf(off.P[8], V(0.6, 0.35, 0.3), 0.035, leafMats[1], -0.2);
  const mainTip = main.P[main.P.length - 1];
  leaf(mainTip, V(0.15, 0.3, 1), 0.05, leafMats[1], 0.2);
  leaf(mainTip, V(-0.6, 0.15, 0.6), 0.042, leafMats[0], -0.5);
  leaf(mainTip, V(0.6, 0.05, 0.5), 0.04, leafMats[2], 0.4);

  // ---------- LEGS & MITTEN FEET ----------
  const twigAt = (z: number) => {
    let best = 0, bd = 1e9;
    for (let i = 0; i < main.P.length; i++) {
      if (main.P[i].y < 0.17) continue;
      const d = Math.abs(main.P[i].z - z);
      if (d < bd) { bd = d; best = i; }
    }
    return { c: main.P[best].clone(), t: main.T[best].clone(), r: mainR(main.A[best]) };
  };
  const clawMat = M(0x2e2a26, 0.45);
  const foot = (c: V3, t: V3, r: number, m: THREE.Material) => {
    const g = new THREE.Group();
    g.position.copy(c);
    root.add(g);
    g.lookAt(c.clone().add(t));
    ell(V(0, r + 0.003, 0), 0.0064, 0.0042, 0.0088, m, SPH, g);
    const R = r + 0.0028;
    const defs: [number, number][] = [[-0.55, 1], [Math.PI - 1.45, -1]];
    for (const [st, sgn] of defs) {
      const tm = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0037, 5, 7, 2.0), m);
      tm.rotation.z = st;
      tm.scale.set(1, 1, 1.25);
      g.add(tm);
      const al = sgn > 0 ? st : st + 2.0;
      const p = V(R * Math.cos(al), R * Math.sin(al), 0);
      const d = sgn > 0 ? V(Math.sin(al), -Math.cos(al), 0) : V(-Math.sin(al), Math.cos(al), 0);
      for (const dz of [-0.0026, 0.0026]) spike(p.clone().add(V(0, 0, dz)), d, 0.0013, 0.0045, clawMat, 4, g);
    }
  };

  const legSet = [
    { a: 0.038, s: 1, zf: 0.078, front: true },
    { a: 0.038, s: -1, zf: 0.028, front: true },
    { a: 0.152, s: 1, zf: -0.092, front: false },
    { a: 0.152, s: -1, zf: -0.046, front: false },
  ];
  for (const L of legSet) {
    const i = idxAt(body, L.a);
    const [w, h] = bodyProf(body.A[i]);
    const sh = body.P[i].clone().addScaledVector(body.S[i], L.s * w * 0.55).addScaledVector(body.U[i], -h * 0.3);
    const tw = twigAt(L.zf);
    const palm = tw.c.clone().add(V(0, tw.r + 0.0035, 0));
    const legMat = M(gradHex(L.front ? 0.04 : 0.15), 0.5);
    const midZ = (sh.z + palm.z) / 2 + (L.front ? -0.008 : 0.012);
    const joint = V(L.s * (L.front ? 0.04 : 0.043), palm.y + (sh.y - palm.y) * 0.45, midZ);
    const wrist = palm.clone().add(V(L.s * 0.002, 0.007, 0));
    const r0l = L.front ? 0.0062 : 0.0068;
    ell(sh, r0l * 1.2, r0l * 1.2, r0l * 1.2, legMat);
    limb(sh, joint, r0l, 0.0048, legMat, 7);
    ell(joint, 0.0052, 0.0052, 0.0052, legMat);
    limb(joint, wrist, 0.0047, 0.0038, legMat, 7);
    ell(wrist, 0.0041, 0.0041, 0.0041, legMat);
    limb(wrist, palm, 0.0038, 0.0045, legMat, 6);
    // red bar on the upper limb + white tubercle
    const mid = sh.clone().lerp(joint, 0.5);
    ell(mid, 0.0066, 0.0066, 0.0028, redMat, SPH_LO).quaternion.setFromUnitVectors(V(0, 0, 1), joint.clone().sub(sh).normalize());
    ell(sh.clone().add(V(L.s * 0.005, 0.004, 0)), 0.0018, 0.0018, 0.0018, whiteMat, SPH_LO);
    foot(tw.c, tw.t, tw.r, legMat);
  }

  // ---------- HEAD ----------
  const headMat = M(gradHex(0), 0.45);
  const tealMat = M(0x138fa0, 0.5);
  ell(V(0, 0.299, 0.094), 0.02, 0.023, 0.03, headMat);
  const snG = new THREE.CylinderGeometry(0.0055, 0.0152, 0.032, 7);
  snG.rotateX(Math.PI / 2);
  const sn = new THREE.Mesh(snG, headMat);
  sn.position.set(0, 0.292, 0.116);
  sn.scale.set(0.85, 0.8, 1);
  root.add(sn);
  ell(V(0, 0.281, 0.1), 0.016, 0.0105, 0.027, headMat);
  ell(V(0, 0.2855, 0.101), 0.0169, 0.003, 0.028, whiteMat); // bright lips
  for (const z of [0.086, 0.094, 0.102, 0.11]) spike(V(0, 0.2725, z), V(0, -1, 0.35), 0.0017, 0.0042, whiteMat);

  // casque plate
  const cs = new THREE.Shape();
  const casPts: [number, number][] = [
    [0.128, 0.297], [0.112, 0.313], [0.09, 0.329], [0.068, 0.338], [0.054, 0.343],
    [0.049, 0.33], [0.056, 0.31], [0.09, 0.302], [0.122, 0.289],
  ];
  cs.moveTo(casPts[0][0], casPts[0][1]);
  for (let k = 1; k < casPts.length; k++) cs.lineTo(casPts[k][0], casPts[k][1]);
  const casG = new THREE.ExtrudeGeometry(cs, { depth: 0.0045, bevelEnabled: false });
  casG.translate(0, 0, -0.00225);
  casG.rotateY(-Math.PI / 2);
  root.add(new THREE.Mesh(casG, tealMat));
  // saw-tooth ridges on the casque
  const topEdge = casPts.slice(0, 5);
  const ridgeMat = M(0xe6e43a, 0.45);
  for (let k = 0; k < 8; k++) {
    const t = 0.06 + (k / 7) * 0.92;
    const f = t * (topEdge.length - 1);
    const i0 = Math.min(topEdge.length - 2, Math.floor(f));
    const u = f - i0;
    const z = topEdge[i0][0] + (topEdge[i0 + 1][0] - topEdge[i0][0]) * u;
    const y = topEdge[i0][1] + (topEdge[i0 + 1][1] - topEdge[i0][1]) * u;
    spike(V(0, y - 0.001, z), V(0, 1, -0.45), 0.0024 + 0.001 * t, 0.0035 + 0.005 * t, k % 2 ? ridgeMat : goldMat);
  }
  // canthal ridges, nostrils, cheek bars
  for (const s of [1, -1]) {
    limb(V(s * 0.0125, 0.317, 0.098), V(s * 0.0055, 0.2975, 0.131), 0.0019, 0.0013, tealMat, 5);
    ell(V(s * 0.0064, 0.2935, 0.124), 0.0013, 0.0013, 0.0013, blackMat, SPH_LO);
    limb(V(s * 0.0188, 0.297, 0.093), V(s * 0.0168, 0.2875, 0.086), 0.0015, 0.0015, redMat, 4);
    limb(V(s * 0.019, 0.3, 0.083), V(s * 0.0165, 0.29, 0.077), 0.0013, 0.0013, M(0xff8a2a, 0.5), 4);
  }

  // turret eyes
  const streakG = new THREE.TorusGeometry(0.0106, 0.0008, 3, 5, 1.1);
  streakG.rotateX(Math.PI / 2);
  const eye = (pos: V3, dir: V3) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    root.add(g);
    g.lookAt(pos.clone().add(dir));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.0105, 10, 8), headMat));
    for (let k = 0; k < 6; k++) {
      const st = new THREE.Mesh(streakG, k % 2 ? redMat : tealMat);
      st.rotation.z = (k * Math.PI) / 3 + 0.3;
      g.add(st);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0041, 0.0012, 4, 12), goldMat);
    ring.position.z = 0.0097;
    g.add(ring);
    ell(V(0, 0, 0.0094), 0.0031, 0.0031, 0.0031, blackMat, SPH, g);
    ell(V(0.0011, 0.0012, 0.0123), 0.0009, 0.0009, 0.0009, whiteMat, SPH_LO, g);
  };
  eye(V(0.0185, 0.304, 0.1), V(0.55, 0.12, 0.85));
  eye(V(-0.0185, 0.304, 0.1), V(-0.7, 0.35, -0.6));

  // ---------- MOSSY BASE ----------
  const soilMat = M(0x4a3426, 0.95);
  const mossMats = [M(0x4f7a2c, 0.95), M(0x6a9a36, 0.95), M(0x3d6526, 0.95)];
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.02, 14), soilMat);
  soil.position.set(0, 0.01, 0.04);
  soil.scale.set(1, 1, 1.6);
  root.add(soil);
  const moss = new THREE.Mesh(new THREE.CylinderGeometry(0.163, 0.17, 0.006, 14), mossMats[0]);
  moss.position.set(0, 0.022, 0.04);
  moss.scale.set(1, 1, 1.6);
  root.add(moss);
  const inBase = (k: number) => {
    const ang = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * k;
    return [Math.cos(ang) * 0.16 * rr, 0.04 + Math.sin(ang) * 0.16 * 1.6 * rr];
  };
  for (let k = 0; k < 16; k++) {
    const [x, z] = inBase(0.85);
    const r = 0.012 + rnd() * 0.02;
    ell(V(x, 0.024, z), r, r * 0.35, r * (0.8 + rnd() * 0.4), mossMats[k % 3]);
  }
  const rockMats = [M(0x8a8a82, 0.85), M(0x6f6f6a, 0.85)];
  const rocks: [number, number, number][] = [[0.03, -0.16, 0.018], [-0.022, -0.135, 0.012], [0.09, 0.27, 0.014], [0.045, 0.235, 0.01], [-0.1, 0.12, 0.016]];
  rocks.forEach(([x, z, r], k) => {
    const m = ell(V(x, 0.022, z), r, r * 0.65, r * 1.1, rockMats[k % 2], DODE);
    m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  });
  const grassMat = M(0x7fae3a, 0.8);
  const grassMat2 = M(0xa6c94a, 0.8);
  for (let k = 0; k < 7; k++) {
    const [x, z] = inBase(0.9);
    for (let b = 0; b < 4; b++) {
      spike(V(x + (rnd() - 0.5) * 0.008, 0.02, z + (rnd() - 0.5) * 0.008), V((rnd() - 0.5) * 0.7, 1, (rnd() - 0.5) * 0.7), 0.0024, 0.028 + rnd() * 0.025, b % 2 ? grassMat : grassMat2, 3);
    }
  }
  // mushrooms echoing the tail colours
  const capMat = M(0xe8552a, 0.55);
  const stemMat = M(0xefe2c4, 0.7);
  const capG = new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const mushroom = (x: number, z: number, h: number, cr: number) => {
    const top = V(x, 0.02 + h, z);
    limb(V(x, 0.018, z), top, 0.0032, 0.0026, stemMat, 6);
    ell(top, cr, cr * 0.7, cr, capMat, capG);
    const under = new THREE.Mesh(new THREE.CylinderGeometry(cr * 0.97, cr * 0.97, 0.0015, 8), stemMat);
    under.position.copy(top);
    root.add(under);
    for (let k = 0; k < 4; k++) {
      const phi = k * 1.7 + 0.4, pol = 0.55 + (k % 2) * 0.35;
      ell(top.clone().add(V(Math.sin(pol) * Math.cos(phi) * cr, Math.cos(pol) * cr * 0.7, Math.sin(pol) * Math.sin(phi) * cr)), cr * 0.16, cr * 0.1, cr * 0.16, whiteMat, SPH_LO);
    }
  };
  mushroom(-0.085, -0.085, 0.022, 0.012);
  mushroom(-0.1, -0.055, 0.014, 0.008);
  mushroom(0.11, 0.06, 0.017, 0.01);

  // fallen leaves
  const fallen1 = M(0xc9772f, 0.8);
  const fallen2 = M(0xd9b23a, 0.8);
  const flat = (x: number, z: number, ang: number, len: number, m: THREE.Material) => {
    const g = new THREE.Group();
    g.position.set(x, 0.026, z);
    g.rotation.y = ang;
    root.add(g);
    ell(V(0, 0, len * 0.5), len * 0.3, len * 0.04, len * 0.5, m, SPH_LO, g);
    const rib = new THREE.Mesh(BOX, stemMat);
    rib.scale.set(0.0012, 0.0012, len * 0.9);
    rib.position.set(0, len * 0.04, len * 0.5);
    g.add(rib);
  };
  flat(0.09, -0.13, 1.1, 0.045, fallen1);
  flat(-0.11, 0.2, -0.6, 0.04, fallen2);
  flat(0.06, 0.12, 2.4, 0.035, fallen1);

  return root;
}
```