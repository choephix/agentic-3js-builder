```ts
import * as THREE from "three";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby low-poly baby dragon hatchling with a mint scaled hide, cream belly plates, coral wings and spines, golden horns, big amber eyes, and its hatched eggshell beside it.",
};

function makeRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildDragon(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const hasDoc = typeof document !== "undefined";

  // ---------- textures ----------
  function scaleTexture(): THREE.Texture | null {
    if (!hasDoc) return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#4cc3a5";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      g.fillStyle = rand() > 0.5 ? "#62d4b4" : "#3fb497";
      g.beginPath();
      g.ellipse(rand() * 256, rand() * 256, 6 + rand() * 14, 4 + rand() * 8, rand() * 3, 0, Math.PI * 2);
      g.fill();
    }
    for (let r = 0; r < 18; r++) {
      for (let col = -1; col < 13; col++) {
        const cx = col * 22 + (r % 2) * 11;
        const cy = r * 15;
        g.strokeStyle = "#2c8f7b";
        g.lineWidth = 2;
        g.beginPath();
        g.arc(cx, cy, 11, 0.15, Math.PI - 0.15);
        g.stroke();
        g.strokeStyle = "rgba(200,255,235,0.35)";
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(cx, cy + 1, 7, 0.6, Math.PI - 0.6);
        g.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function eggTexture(): THREE.Texture | null {
    if (!hasDoc) return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff1d6";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 45; i++) {
      g.fillStyle = rand() > 0.4 ? "#5cc9ad" : "#ff9a6e";
      g.beginPath();
      g.ellipse(rand() * 256, rand() * 256, 4 + rand() * 12, 3 + rand() * 9, rand() * 3, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // ---------- materials ----------
  const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...extra });

  const sTex = scaleTexture();
  const eTex = eggTexture();
  const bodyMat = sTex ? mat("#ffffff", { map: sTex }) : mat("#4cc3a5");
  const darkMat = mat("#2c8f7b");
  const bellyMat = mat("#ffe3a8", { roughness: 0.55 });
  const coralMat = mat("#ff7a59", { side: THREE.DoubleSide });
  const peachMat = mat("#ffb27a", { side: THREE.DoubleSide });
  const hornMat = mat("#f2c14e", { roughness: 0.4, metalness: 0.1 });
  const clawMat = mat("#fff4dd", { roughness: 0.4 });
  const whiteMat = mat("#ffffff", { roughness: 0.25 });
  const irisMat = mat("#ffb000", { roughness: 0.3 });
  const pupilMat = mat("#1b1b2f", { roughness: 0.2 });
  const blushMat = mat("#ff9db0", { roughness: 0.8 });
  const mouthMat = mat("#5a2238");
  const eggMat = eTex
    ? mat("#ffffff", { map: eTex, side: THREE.DoubleSide, roughness: 0.5 })
    : mat("#fff1d6", { side: THREE.DoubleSide });

  // ---------- helpers ----------
  const sph = new THREE.SphereGeometry(1, 10, 8);
  const sphHi = new THREE.SphereGeometry(1, 14, 10);

  function add(
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: [number, number, number],
    r?: [number, number, number],
    s?: [number, number, number],
    parent: THREE.Object3D = root
  ) {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    if (r) mesh.rotation.set(r[0], r[1], r[2]);
    if (s) mesh.scale.set(s[0], s[1], s[2]);
    parent.add(mesh);
    return mesh;
  }

  function between(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r1: number,
    r2: number,
    m: THREE.Material,
    parent: THREE.Object3D = root,
    seg = 8
  ) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(Math.max(r2, 0.001), r1, len, seg);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    parent.add(mesh);
    return mesh;
  }

  function spike(pos: THREE.Vector3, n: THREE.Vector3, h: number) {
    const g = new THREE.ConeGeometry(h * 0.45, h, 4);
    const m = new THREE.Mesh(g, coralMat);
    const dir = n.clone().normalize().add(V(0, 0, -0.45)).normalize();
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    m.position.copy(pos).addScaledVector(dir, h * 0.35);
    m.scale.set(0.45, 1, 1);
    root.add(m);
  }

  // ---------- body ----------
  const BY = 0.33, RX = 0.2, RY = 0.19, RZ = 0.26;
  add(sphHi, bodyMat, [0, BY, 0], undefined, [RX, RY, RZ]);

  // belly plates
  const plateGeo = new THREE.BoxGeometry(0.14, 0.05, 0.02);
  for (let i = 0; i < 10; i++) {
    const phi = THREE.MathUtils.degToRad(45 - i * 15);
    const y = BY + RY * Math.sin(phi);
    const z = RZ * Math.cos(phi);
    const n = V(0, Math.sin(phi) / RY, Math.cos(phi) / RZ).normalize();
    const w = 1 - Math.max(0, i - 6) * 0.12;
    const p = add(plateGeo, bellyMat, [0, y + n.y * 0.002, z + n.z * 0.002], [Math.atan2(-n.y, n.z), 0, 0], [w, 1, 1]);
    p.rotation.order = "XYZ";
  }

  // back spines on body
  for (let i = 0; i < 6; i++) {
    const z = 0.14 - i * 0.07;
    const y = BY + RY * Math.sqrt(Math.max(0, 1 - (z / RZ) ** 2));
    const n = V(0, (y - BY) / (RY * RY), z / (RZ * RZ));
    spike(V(0, y - 0.01, z), n, 0.085 - Math.abs(i - 2) * 0.006);
  }

  // ---------- neck ----------
  const nA = V(0, 0.4, 0.15), nB = V(0, 0.62, 0.27);
  between(nA, nB, 0.09, 0.078, bodyMat, root, 9);
  const nd = nB.clone().sub(nA);
  const nLen = nd.length();
  nd.normalize();
  const nFront = V(0, -nd.z, nd.y).normalize();
  const nBack = nFront.clone().multiplyScalar(-1);
  for (let i = 0; i < 3; i++) {
    const t = 0.25 + i * 0.25;
    const p = nA.clone().addScaledVector(nd, t * nLen).addScaledVector(nFront, 0.075);
    add(new THREE.BoxGeometry(0.1, 0.045, 0.02), bellyMat, [p.x, p.y, p.z], [Math.atan2(-nFront.y, nFront.z), 0, 0]);
    const q = nA.clone().addScaledVector(nd, t * nLen).addScaledVector(nBack, 0.07);
    spike(q, nBack, 0.06);
  }

  // ---------- head ----------
  const H = V(0, 0.68, 0.3);
  add(sphHi, bodyMat, [H.x, H.y, H.z], undefined, [0.17, 0.15, 0.16]);
  add(sph, bodyMat, [0, 0.63, 0.44], undefined, [0.11, 0.08, 0.11]); // snout
  add(sph, bellyMat, [0, 0.6, 0.43], undefined, [0.09, 0.05, 0.1]); // jaw
  // smile
  add(new THREE.TorusGeometry(0.035, 0.006, 4, 10, Math.PI), mouthMat, [0, 0.626, 0.54], [0, 0, Math.PI]);
  // fang
  add(new THREE.ConeGeometry(0.01, 0.025, 4), clawMat, [0.022, 0.588, 0.532], [Math.PI, 0, 0]);
  // nostrils
  for (const s of [1, -1]) {
    add(sph, mouthMat, [0.03 * s, 0.674, 0.526], [0.3, 0, 0], [0.012, 0.008, 0.008]);
  }
  // head spines
  spike(V(0, 0.8, 0.22), V(0, 1, -0.6), 0.06);
  spike(V(0, 0.76, 0.15), V(0, 1, -0.8), 0.05);

  for (const s of [1, -1]) {
    // eyes
    const eye = new THREE.Group();
    eye.position.set(0.095 * s, 0.7, 0.42);
    eye.rotation.set(-0.1, 0.55 * s, 0);
    root.add(eye);
    add(sph, whiteMat, [0, 0, 0], undefined, [0.05, 0.05, 0.05], eye);
    add(sph, irisMat, [0, 0, 0.022], undefined, [0.039, 0.039, 0.035], eye);
    add(sph, pupilMat, [0, 0, 0.038], undefined, [0.026, 0.028, 0.025], eye);
    add(sph, whiteMat, [0.012, 0.016, 0.06], undefined, [0.011, 0.011, 0.008], eye);
    add(sph, whiteMat, [-0.012, -0.012, 0.059], undefined, [0.005, 0.005, 0.004], eye);
    // brow
    add(new THREE.BoxGeometry(0.075, 0.02, 0.03), darkMat, [0.1 * s, 0.762, 0.415], [0, 0.55 * s, -0.25 * s]);
    // cheek blush
    add(sph, blushMat, [0.135 * s, 0.635, 0.38], [0, 0.9 * s, 0], [0.035, 0.022, 0.01]);

    // horns
    const A = V(0.07 * s, 0.79, 0.25), B = V(0.1 * s, 0.88, 0.19), C = V(0.12 * s, 0.93, 0.08);
    between(A, B, 0.032, 0.022, hornMat, root, 6);
    add(sph, hornMat, [B.x, B.y, B.z], undefined, [0.022, 0.022, 0.022]);
    between(B, C, 0.022, 0.002, hornMat, root, 6);
    // horn rings
    add(new THREE.TorusGeometry(0.03, 0.006, 4, 8), darkMat, [A.x * 0.95 + B.x * 0.05, A.y + 0.03, A.z - 0.02], [Math.PI / 2 - 0.6, 0, -0.3 * s]);
    // nub horns
    between(V(0.12 * s, 0.76, 0.2), V(0.17 * s, 0.81, 0.12), 0.018, 0.002, hornMat, root, 5);
    // ear frills
    const ear = between(V(0.14 * s, 0.7, 0.25), V(0.26 * s, 0.75, 0.16), 0.045, 0.003, coralMat, root, 4);
    ear.scale.set(1, 1, 0.35);
  }

  // ---------- legs ----------
  const coneClaw = new THREE.ConeGeometry(0.015, 0.04, 5);
  function leg(x: number, z: number, front: boolean) {
    const s = Math.sign(x);
    if (front) {
      add(sph, bodyMat, [x, 0.27, z], undefined, [0.075, 0.09, 0.08]);
      between(V(x + 0.01 * s, 0.22, z + 0.01), V(x + 0.01 * s, 0.05, z + 0.03), 0.045, 0.04, bodyMat);
    } else {
      add(sph, bodyMat, [x, 0.27, z], undefined, [0.1, 0.12, 0.12]);
      between(V(x + 0.01 * s, 0.2, z + 0.02), V(x + 0.01 * s, 0.05, z + 0.04), 0.055, 0.045, bodyMat);
    }
    const fz = z + (front ? 0.06 : 0.07);
    const fx = x + 0.01 * s;
    add(sph, bodyMat, [fx, 0.035, fz], undefined, front ? [0.055, 0.04, 0.07] : [0.065, 0.042, 0.085]);
    const len = front ? 0.065 : 0.08;
    for (const o of [-1, 0, 1]) {
      add(coneClaw, clawMat, [fx + o * 0.032, 0.022, fz + len - Math.abs(o) * 0.012], [Math.PI / 2, 0, 0]);
    }
  }
  for (const s of [1, -1]) {
    leg(0.13 * s, 0.13, true);
    leg(0.15 * s, -0.13, false);
  }

  // ---------- tail ----------
  const tailCurve = new THREE.CatmullRomCurve3([
    V(0, 0.3, -0.16),
    V(0, 0.25, -0.38),
    V(0.04, 0.2, -0.58),
    V(0.14, 0.2, -0.74),
    V(0.26, 0.26, -0.8),
    V(0.34, 0.34, -0.74),
  ]);
  const N = 12;
  const tPts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) tPts.push(tailCurve.getPoint(i / N));
  const rad = (t: number) => 0.12 * (1 - t) + 0.022 * t;
  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;
    between(tPts[i], tPts[i + 1], rad(t0), rad(t1), bodyMat, root, 8);
    if (i > 0) add(sph, bodyMat, [tPts[i].x, tPts[i].y, tPts[i].z], undefined, [rad(t0), rad(t0), rad(t0)]);
    if (i > 0 && i < N - 1) {
      const tan = tailCurve.getTangent(t0);
      const up = V(0, 1, 0);
      const n = up.clone().addScaledVector(tan, -up.dot(tan)).normalize();
      const p = tPts[i].clone().addScaledVector(n, rad(t0) * 0.85);
      const g = new THREE.ConeGeometry(0.03, 0.07 * (1 - t0) + 0.03, 4);
      const m = new THREE.Mesh(g, coralMat);
      const dir = n.clone().addScaledVector(tan, -0.5).normalize();
      m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      m.position.copy(p);
      m.scale.set(0.45, 1, 1);
      root.add(m);
    }
  }
  // spade tip
  {
    const end = tPts[N];
    const tan = tailCurve.getTangent(1);
    const sp = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), coralMat);
    sp.scale.set(0.075, 0.016, 0.1);
    sp.quaternion.setFromUnitVectors(V(0, 0, 1), tan);
    sp.position.copy(end).addScaledVector(tan, 0.07);
    root.add(sp);
    const sp2 = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), peachMat);
    sp2.scale.set(0.045, 0.02, 0.06);
    sp2.quaternion.copy(sp.quaternion);
    sp2.position.copy(end).addScaledVector(tan, 0.06);
    root.add(sp2);
  }

  // ---------- wings ----------
  function makeWing(): THREE.Group {
    const g = new THREE.Group();
    const S = new THREE.Vector2(0, 0);
    const E = new THREE.Vector2(0.14, 0.16);
    const W = new THREE.Vector2(0.3, 0.24);
    const T1 = new THREE.Vector2(0.52, 0.17);
    const T2 = new THREE.Vector2(0.47, -0.02);
    const T3 = new THREE.Vector2(0.33, -0.15);
    const B = new THREE.Vector2(0.04, -0.1);
    const ctrl = (a: THREE.Vector2, b: THREE.Vector2) =>
      a.clone().add(b).multiplyScalar(0.5).lerp(W, 0.35);

    function wingShape(scale: number) {
      const tf = (p: THREE.Vector2) => p.clone().sub(W).multiplyScalar(scale).add(W);
      const sh = new THREE.Shape();
      const s0 = tf(S), e = tf(E), w = tf(W), t1 = tf(T1), t2 = tf(T2), t3 = tf(T3), b = tf(B);
      sh.moveTo(s0.x, s0.y);
      sh.lineTo(e.x, e.y);
      sh.lineTo(w.x, w.y);
      sh.lineTo(t1.x, t1.y);
      let c = tf(ctrl(T1, T2));
      sh.quadraticCurveTo(c.x, c.y, t2.x, t2.y);
      c = tf(ctrl(T2, T3));
      sh.quadraticCurveTo(c.x, c.y, t3.x, t3.y);
      c = tf(ctrl(T3, B));
      sh.quadraticCurveTo(c.x, c.y, b.x, b.y);
      sh.lineTo(s0.x, s0.y);
      return new THREE.ShapeGeometry(sh, 5);
    }
    add(wingShape(1), coralMat, [0, 0, 0], undefined, undefined, g);
    const inner = wingShape(0.62);
    add(inner, peachMat, [0, 0, 0.003], undefined, undefined, g);
    add(inner, peachMat, [0, 0, -0.003], undefined, undefined, g);

    const v3 = (p: THREE.Vector2) => V(p.x, p.y, 0);
    between(v3(S), v3(E), 0.024, 0.018, bodyMat, g, 6);
    between(v3(E), v3(W), 0.018, 0.015, bodyMat, g, 6);
    add(sph, bodyMat, [E.x, E.y, 0], undefined, [0.02, 0.02, 0.02], g);
    add(sph, bodyMat, [W.x, W.y, 0], undefined, [0.02, 0.02, 0.02], g);
    for (const T of [T1, T2, T3]) between(v3(W), v3(T), 0.012, 0.004, bodyMat, g, 5);
    between(v3(W), V(W.x + 0.015, W.y + 0.06, 0), 0.012, 0.001, clawMat, g, 5);

    g.position.set(0.13, 0.46, 0.03);
    g.rotation.set(-0.2, 0.45, 0.12);
    return g;
  }
  root.add(makeWing());
  const rightWing = new THREE.Group();
  rightWing.scale.set(-1, 1, 1);
  rightWing.add(makeWing());
  root.add(rightWing);

  // ---------- hatched eggshell ----------
  {
    const egg = new THREE.Group();
    egg.position.set(-0.36, 0, -0.32);
    egg.rotation.y = 0.4;
    root.add(egg);
    const R = 0.11, SY = 1.3, th0 = Math.PI * 0.42;
    add(new THREE.SphereGeometry(R, 12, 6, 0, Math.PI * 2, th0, Math.PI - th0), eggMat, [0, R * SY, 0], undefined, [1, SY, 1], egg);
    const rimY = R * SY + Math.cos(th0) * R * SY;
    const rimR = Math.sin(th0) * R;
    const tooth = new THREE.ConeGeometry(0.024, 0.05, 3);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const hS = 0.6 + rand() * 0.9;
      const m = add(tooth, eggMat, [Math.cos(a) * rimR, rimY + 0.02 * hS, Math.sin(a) * rimR], [0, -a, 0], [1, hS, 0.35], egg);
      m.rotateZ((rand() - 0.5) * 0.3);
    }
    // fragments on the ground
    const frag = new THREE.SphereGeometry(0.1, 6, 3, 0, 1.1, 0, 0.55);
    const fragPos: [number, number, number][] = [
      [-0.2, -0.085, -0.5],
      [-0.48, -0.085, -0.12],
      [0.3, -0.085, 0.3],
    ];
    for (const fp of fragPos) {
      add(frag, eggMat, fp, [0, rand() * 6, 0], undefined, root);
    }
  }

  return root;
}
```