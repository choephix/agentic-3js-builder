import * as THREE from "three";

export const meta = {
  name: "Grumpy Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with a mottled, bumpy bulbous mantle, golden bar-pupil eyes under grumpy brows, eight curling sucker-lined arms, and one arm proudly holding up an old brass shipwreck key.",
};

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

function makeSkinTexture(rand: () => number) {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const g = cv.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#d4613f");
  grad.addColorStop(0.5, "#c0502f");
  grad.addColorStop(1, "#a23f25");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // large rusty patches
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(130,45,25,${0.18 + rand() * 0.2})`;
    g.beginPath();
    g.ellipse(rand() * size, rand() * size, 10 + rand() * 22, 8 + rand() * 16, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // pale mottling
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(255,${200 + Math.floor(rand() * 30)},${165 + Math.floor(rand() * 40)},${0.22 + rand() * 0.35})`;
    g.beginPath();
    g.ellipse(rand() * size, rand() * size, 2 + rand() * 9, 2 + rand() * 6, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // dark speckles
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(95,28,15,${0.35 + rand() * 0.4})`;
    g.beginPath();
    g.arc(rand() * size, rand() * size, 0.6 + rand() * 1.8, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

interface ArmData {
  pts: THREE.Vector3[];
  Ts: THREE.Vector3[];
  Ns: THREE.Vector3[];
  Bs: THREE.Vector3[];
  radii: number[];
}

function buildArmPath(
  phi: number,
  curl: "up" | "left" | "right",
  thetaFn: (t: number) => number,
  L: number,
  r0: number,
  M: number
): ArmData {
  const u = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
  let c: THREE.Vector3;
  if (curl === "up") c = new THREE.Vector3(0, 1, 0);
  else {
    const s = curl === "left" ? 1 : -1;
    c = new THREE.Vector3(Math.cos(phi) * s, 0, -Math.sin(phi) * s);
  }
  const n = new THREE.Vector3().crossVectors(u, c).normalize();
  const ds = L / (M - 1);
  let a = 0,
    b = 0;
  const data: ArmData = { pts: [], Ts: [], Ns: [], Bs: [], radii: [] };
  const start = u.clone().multiplyScalar(0.035);
  for (let i = 0; i < M; i++) {
    const t = i / (M - 1);
    const th = thetaFn(t);
    const r = 0.0022 + (r0 - 0.0022) * Math.pow(1 - t, 1.1);
    const T = u.clone().multiplyScalar(Math.cos(th)).addScaledVector(c, Math.sin(th));
    const N = u.clone().multiplyScalar(-Math.sin(th)).addScaledVector(c, Math.cos(th));
    const drop = 0.035 * (1 - THREE.MathUtils.smoothstep(t, 0, 0.18));
    const p = start.clone().addScaledVector(u, a).addScaledVector(c, b);
    p.y += r + drop;
    data.pts.push(p);
    data.Ts.push(T);
    data.Ns.push(N);
    data.Bs.push(n.clone());
    data.radii.push(r);
    a += ds * Math.cos(th);
    b += ds * Math.sin(th);
  }
  return data;
}

function tubeGeometry(d: ArmData, S: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const M = d.pts.length;
  for (let i = 0; i < M; i++) {
    const p = d.pts[i],
      N = d.Ns[i],
      B = d.Bs[i],
      r = d.radii[i];
    for (let j = 0; j <= S; j++) {
      const a = (j / S) * Math.PI * 2;
      const ca = Math.cos(a),
        sa = Math.sin(a);
      pos.push(p.x + r * (ca * N.x + sa * B.x), p.y + r * (ca * N.y + sa * B.y), p.z + r * (ca * N.z + sa * B.z));
      uv.push((i / (M - 1)) * 3, j / S);
    }
  }
  const row = S + 1;
  for (let i = 0; i < M - 1; i++) {
    for (let j = 0; j < S; j++) {
      const A = i * row + j,
        Bv = i * row + j + 1,
        C = (i + 1) * row + j,
        D = (i + 1) * row + j + 1;
      idx.push(A, Bv, C, Bv, D, C);
    }
  }
  const last = d.pts[M - 1].clone().addScaledVector(d.Ts[M - 1], 0.004);
  const tip = pos.length / 3;
  pos.push(last.x, last.y, last.z);
  uv.push(3, 0.5);
  for (let j = 0; j < S; j++) idx.push((M - 1) * row + j, (M - 1) * row + j + 1, tip);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function createModel(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();

  // ---------- materials ----------
  const skinTex = makeSkinTexture(rand);
  const skin = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });
  const bumpPale = new THREE.MeshStandardMaterial({ color: "#f2bf98", roughness: 0.7, flatShading: true });
  const bumpRust = new THREE.MeshStandardMaterial({ color: "#9c3c24", roughness: 0.7, flatShading: true });
  const lidMat = new THREE.MeshStandardMaterial({ color: "#b4472b", roughness: 0.65, flatShading: true });
  const browMat = new THREE.MeshStandardMaterial({ color: "#7e2d1a", roughness: 0.7, flatShading: true });
  const sucker = new THREE.MeshStandardMaterial({ color: "#f4e4c4", roughness: 0.5, flatShading: true });
  const suckerIn = new THREE.MeshStandardMaterial({ color: "#d9917c", roughness: 0.6, flatShading: true });
  const eyeGold = new THREE.MeshStandardMaterial({ color: "#eab22a", roughness: 0.25, emissive: "#5a3a00", emissiveIntensity: 0.35, flatShading: true });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#120c08", roughness: 0.2 });
  const glint = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.1, emissive: "#ffffff", emissiveIntensity: 0.6 });
  const brass = new THREE.MeshStandardMaterial({ color: "#c4973f", metalness: 0.85, roughness: 0.32, flatShading: true });
  const brassDark = new THREE.MeshStandardMaterial({ color: "#7e5a22", metalness: 0.8, roughness: 0.45, flatShading: true });
  const verdigris = new THREE.MeshStandardMaterial({ color: "#4fa08c", roughness: 0.8, flatShading: true });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    return m;
  };

  // ---------- body ----------
  const mantle = add(new THREE.SphereGeometry(0.08, 12, 10), skin);
  mantle.scale.set(1, 1.3, 1.05);
  mantle.position.set(0, 0.17, -0.05);
  mantle.rotation.x = -0.5;
  mantle.updateMatrix();

  const head = add(new THREE.SphereGeometry(0.062, 12, 8), skin);
  head.scale.set(1.12, 0.8, 1.0);
  head.position.set(0, 0.075, 0.015);
  head.updateMatrix();

  const web = add(new THREE.CylinderGeometry(0.06, 0.105, 0.032, 8), skin);
  web.position.set(0, 0.02, 0);
  web.rotation.y = Math.PI / 8;

  // siphon on the right side
  const siphon = add(new THREE.CylinderGeometry(0.008, 0.012, 0.03, 7), lidMat);
  siphon.position.set(-0.066, 0.08, -0.01);
  siphon.rotation.z = Math.PI / 2 - 0.4;

  // bumps on mantle & head
  const bumpGeo = new THREE.IcosahedronGeometry(1, 0);
  const scatter = (mesh: THREE.Mesh, rad: number, count: number, minY: number) => {
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      if (v.lengthSq() < 0.01) continue;
      v.normalize();
      if (v.y < minY) continue;
      const p = v.multiplyScalar(rad * 0.985).applyMatrix4(mesh.matrix);
      const b = add(bumpGeo, rand() < 0.6 ? bumpPale : bumpRust);
      const s = 0.0035 + rand() * 0.0045;
      b.scale.set(s, s, s);
      b.position.copy(p);
      b.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    }
  };
  scatter(mantle, 0.08, 90, -0.3);
  scatter(head, 0.062, 30, 0.0);

  // ---------- eyes ----------
  for (const side of [1, -1]) {
    const ec = new THREE.Vector3(0.052 * side, 0.108, 0.04);
    const d = new THREE.Vector3(0.75 * side, 0.25, 0.62).normalize();
    const socket = add(new THREE.SphereGeometry(0.025, 10, 8), skin);
    socket.position.copy(ec);
    const eye = add(new THREE.SphereGeometry(0.019, 12, 10), eyeGold);
    eye.position.copy(ec).addScaledVector(d, 0.009);
    const lid = add(new THREE.TorusGeometry(0.019, 0.0045, 6, 14), lidMat);
    lid.position.copy(ec).addScaledVector(d, 0.012);
    lid.lookAt(lid.position.clone().add(d));
    const pupil = add(new THREE.BoxGeometry(0.019, 0.0055, 0.004), pupilMat);
    pupil.position.copy(eye.position).addScaledVector(d, 0.0175);
    pupil.lookAt(pupil.position.clone().add(d));
    const gl = add(new THREE.SphereGeometry(0.0025, 6, 4), glint);
    gl.position.copy(eye.position).addScaledVector(d, 0.017).add(new THREE.Vector3(0.003 * side, 0.007, 0.002));
    // grumpy brow: inner end lower
    const brow = add(new THREE.BoxGeometry(0.038, 0.009, 0.015), browMat);
    brow.position.copy(ec).add(new THREE.Vector3(0.002 * side, 0.024, 0.006));
    brow.rotation.order = "YXZ";
    brow.rotation.y = 0.75 * side;
    brow.rotation.z = 0.38 * side;
    // little horn papillae above brows
    for (let k = 0; k < 2; k++) {
      const horn = add(new THREE.ConeGeometry(0.004, 0.012, 5), bumpPale);
      horn.position.copy(ec).add(new THREE.Vector3((0.012 + k * 0.009) * side, 0.032 + k * 0.004, -0.004 - k * 0.006));
      horn.rotation.z = -0.4 * side;
    }
  }

  // ---------- arms ----------
  const M = 30;
  const S = 7;
  const suckerGeo = new THREE.CylinderGeometry(1, 0.85, 1, 8);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const deg = Math.PI / 180;
  const smooth = THREE.MathUtils.smoothstep;

  type Cfg = { phi: number; curl: "up" | "left" | "right"; L: number; r0: number; th: (t: number) => number };
  const wave = (ph: number) => (t: number) => 0.14 * Math.sin(t * 7 + ph);
  const cfgs: Cfg[] = [
    {
      phi: 22.5 * deg, curl: "up", L: 0.42, r0: 0.026,
      th: (t) => 1.4 * smooth(t, 0.05, 0.55) + (t > 0.78 ? (3.6 * (t - 0.78)) / 0.22 : 0),
    },
    { phi: -24 * deg, curl: "up", L: 0.34, r0: 0.024, th: (t) => -0.05 + 4.6 * Math.pow(t, 2.6) },
    { phi: 66 * deg, curl: "right", L: 0.35, r0: 0.024, th: (t) => wave(1)(t) + 4.2 * Math.pow(t, 2) },
    { phi: -70 * deg, curl: "up", L: 0.33, r0: 0.024, th: (t) => -0.05 + 5.0 * Math.pow(t, 3) },
    { phi: 115 * deg, curl: "left", L: 0.36, r0: 0.024, th: (t) => wave(2)(t) + 5.2 * Math.pow(t, 2.2) },
    { phi: -110 * deg, curl: "right", L: 0.33, r0: 0.024, th: (t) => wave(3)(t) + 3.8 * Math.pow(t, 1.8) },
    { phi: 158 * deg, curl: "up", L: 0.32, r0: 0.023, th: (t) => -0.05 + 4.2 * Math.pow(t, 2.5) },
    { phi: -155 * deg, curl: "left", L: 0.34, r0: 0.023, th: (t) => wave(4)(t) + 4.6 * Math.pow(t, 2.2) },
  ];

  let keyArm: ArmData | null = null;
  cfgs.forEach((cfg, ai) => {
    const d = buildArmPath(cfg.phi, cfg.curl, cfg.th, cfg.L, cfg.r0, M);
    if (ai === 0) keyArm = d;
    add(tubeGeometry(d, S), skin);

    // suckers: zigzag double row on the inner side
    for (let i = 2; i < M - 1; i++) {
      const r = d.radii[i];
      const row = i % 2 === 0 ? 1 : -1;
      const N = d.Ns[i],
        B = d.Bs[i];
      const dir = N.clone().multiplyScalar(0.9).addScaledVector(B, row * 0.42).normalize();
      const p = d.pts[i].clone().addScaledVector(dir, r * 0.88);
      const q = new THREE.Quaternion().setFromUnitVectors(yAxis, dir);
      const sr = r * 0.42;
      const sm = add(suckerGeo, sucker);
      sm.position.copy(p);
      sm.quaternion.copy(q);
      sm.scale.set(sr, r * 0.35, sr);
      if (i < M * 0.65) {
        const ci = add(suckerGeo, suckerIn);
        ci.position.copy(p).addScaledVector(dir, r * 0.06);
        ci.quaternion.copy(q);
        ci.scale.set(sr * 0.45, r * 0.3, sr * 0.45);
      }
    }

    // papillae on the outer/top side
    for (let i = 1; i < M - 3; i += 3) {
      const r = d.radii[i];
      const cands = [d.Bs[i], d.Bs[i].clone().negate(), d.Ns[i].clone().negate()];
      let top = cands[0];
      for (const cd of cands) if (cd.y > top.y) top = cd;
      const jit = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.6);
      const dir = top.clone().add(jit).normalize();
      const b = add(bumpGeo, rand() < 0.65 ? bumpPale : bumpRust);
      const s = r * (0.22 + rand() * 0.12);
      b.scale.set(s, s, s);
      b.position.copy(d.pts[i]).addScaledVector(dir, r * 0.95);
      b.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    }
  });

  // ---------- brass key ----------
  const ka = keyArm as unknown as ArmData;
  const ic = Math.round(0.8 * (M - 1));
  const R = (0.22 * 0.42) / 3.6;
  const center = ka.pts[ic].clone().addScaledVector(ka.Ns[ic], R);
  const key = new THREE.Group();
  const X = ka.Bs[ic].clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const Yr = up.clone().addScaledVector(X, -X.dot(up)).normalize();
  const Z = new THREE.Vector3().crossVectors(X, Yr);
  key.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Yr, Z));
  key.position.copy(center);
  key.rotateX(0.35);
  key.rotateY(-0.25);
  root.add(key);

  const shaft = add(new THREE.CylinderGeometry(0.0045, 0.0045, 0.1, 8), brass, key);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = -0.002;
  const bow = add(new THREE.TorusGeometry(0.015, 0.0042, 6, 12), brass, key);
  bow.position.x = -0.068;
  const bowInner = add(new THREE.TorusGeometry(0.007, 0.0022, 5, 10), brassDark, key);
  bowInner.position.x = -0.068;
  for (const cx of [-0.05, -0.043]) {
    const collar = add(new THREE.CylinderGeometry(0.0072, 0.0072, 0.004, 8), brassDark, key);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = cx;
  }
  const endCap = add(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 8), brassDark, key);
  endCap.rotation.z = Math.PI / 2;
  endCap.position.x = 0.049;
  const bit = add(new THREE.BoxGeometry(0.022, 0.016, 0.004), brass, key);
  bit.position.set(0.036, -0.011, 0);
  for (const [tx, th] of [[0.029, 0.007], [0.037, 0.004], [0.044, 0.009]] as [number, number][]) {
    const tooth = add(new THREE.BoxGeometry(0.0045, th, 0.0042), brassDark, key);
    tooth.position.set(tx, -0.019 - th / 2, 0);
  }
  // verdigris patina specks
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const v = add(bumpGeo, verdigris, key);
    const s = 0.002 + rand() * 0.0018;
    v.scale.set(s, s, s * 0.6);
    v.position.set(-0.068 + Math.cos(a) * 0.015, Math.sin(a) * 0.015, 0.003 * (rand() < 0.5 ? 1 : -1));
  }
  for (let i = 0; i < 3; i++) {
    const v = add(bumpGeo, verdigris, key);
    const s = 0.0022;
    v.scale.set(s, s, s);
    v.position.set(0.015 + i * 0.012, 0.003, 0.002);
  }

  return root;
}
