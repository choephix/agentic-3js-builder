```ts
import * as THREE from "three";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A leggy, big-eyed unicorn foal built from faceted primitives: cream-lilac coat, twisted pearl-and-gold spiral horn, golden hooves, rainbow pastel mane and tail, daisies in the mane, and a golden star cutie mark on each haunch.",
};

type P3 = [number, number, number];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = mulberry32(20240607);
  const root = new THREE.Group();
  root.name = "UnicornFoal";

  // ---------- materials (one per colour, shared) ----------
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (
    color: number,
    o: { r?: number; m?: number; flat?: boolean; e?: number; ei?: number } = {}
  ) => {
    const flat = o.flat ?? true;
    const key = `${color}|${o.r ?? 0.8}|${o.m ?? 0}|${flat}|${o.e ?? 0}|${o.ei ?? 1}`;
    let m = cache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: o.r ?? 0.8,
        metalness: o.m ?? 0,
        flatShading: flat,
        emissive: o.e ?? 0x000000,
        emissiveIntensity: o.ei ?? 1,
      });
      cache.set(key, m);
    }
    return m;
  };

  const coat = mat(0xf6effb);
  const coatShade = mat(0xdac8f0);
  const pink = mat(0xffa3cc);
  const nosePink = mat(0xffb3d1);
  const nostril = mat(0xc4608f);
  const gold = mat(0xf5c453, { r: 0.45, m: 0.12, e: 0x6a4a00, ei: 0.25 });
  const eyeDark = mat(0x2a1650, { r: 0.2, flat: false });
  const iris = mat(0x8a5cf2, { r: 0.25, flat: false });
  const irisLight = mat(0xff9be0, { r: 0.3, flat: false });
  const pupil = mat(0x12072a, { r: 0.2, flat: false });
  const shine = mat(0xffffff, { r: 0.1, flat: false, e: 0xffffff, ei: 0.9 });
  const lashMat = mat(0x3a2160);
  const starLilac = mat(0xb990f5);
  const petalWhite = mat(0xffffff);
  const petalPink = mat(0xffc2de);
  const petalButter = mat(0xfff0a0);
  const flowerCentre = mat(0xffc72c);
  const MANE = [0xff7eb6, 0xb58cff, 0x74c8ff, 0x7fe8b8, 0xffe27a, 0xffa97a].map((c) =>
    mat(c, { r: 0.7 })
  );

  // ---------- helpers ----------
  const UP = new THREE.Vector3(0, 1, 0);
  const DOWN = new THREE.Vector3(0, -1, 0);
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const blob = (
    parent: THREE.Object3D,
    m: THREE.Material,
    r: number,
    p: P3,
    s: P3 = [1, 1, 1],
    detail = 1
  ) => {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), m);
    mesh.position.set(...p);
    mesh.scale.set(...s);
    parent.add(mesh);
    return mesh;
  };

  const ball = (
    parent: THREE.Object3D,
    m: THREE.Material,
    r: number,
    p: P3,
    s: P3 = [1, 1, 1]
  ) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m);
    mesh.position.set(...p);
    mesh.scale.set(...s);
    parent.add(mesh);
    return mesh;
  };

  const cone = (
    parent: THREE.Object3D,
    m: THREE.Material,
    r: number,
    h: number,
    seg: number,
    p: P3,
    rot: P3 = [0, 0, 0],
    s: P3 = [1, 1, 1]
  ) => {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
    mesh.position.set(...p);
    mesh.rotation.set(...rot);
    mesh.scale.set(...s);
    parent.add(mesh);
    return mesh;
  };

  const box = (parent: THREE.Object3D, m: THREE.Material, size: P3, p: P3, rot: P3 = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), m);
    mesh.position.set(...p);
    mesh.rotation.set(...rot);
    parent.add(mesh);
    return mesh;
  };

  const limb = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    m: THREE.Material,
    seg = 7
  ) => {
    const len = a.distanceTo(b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg, 1), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    parent.add(mesh);
    return mesh;
  };

  const taperBox = (w0: number, h0: number, w1: number, h1: number, len: number) => {
    const g = new THREE.BoxGeometry(1, 1, len);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const front = p.getZ(i) > 0;
      p.setX(i, p.getX(i) * (front ? w1 : w0));
      p.setY(i, p.getY(i) * (front ? h1 : h0));
    }
    g.computeVertexNormals();
    return g;
  };

  // A chain of tapered prisms that sags under gravity: used for mane and tail locks.
  const lockChain = (
    parent: THREE.Object3D,
    rootP: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    w: number,
    m: THREE.Material,
    droops: number[],
    swirl = 0
  ) => {
    const segs = droops.length;
    const step = len / segs;
    const d = dir.clone().normalize();
    let p = rootP.clone();
    const pts = [p.clone()];
    for (let i = 0; i < segs; i++) {
      const wa = w * (1 - (0.78 * i) / segs);
      const wb = w * (1 - (0.78 * (i + 1)) / segs);
      const end = p.clone().addScaledVector(d, step);
      const endExt = i < segs - 1 ? p.clone().addScaledVector(d, step * 1.15) : end;
      limb(parent, p, endExt, wa, wb, m, 5);
      pts.push(end.clone());
      p = end;
      const axis = new THREE.Vector3().crossVectors(d, DOWN);
      if (axis.lengthSq() > 1e-4) d.applyAxisAngle(axis.normalize(), droops[i]);
      if (swirl) d.applyAxisAngle(UP, swirl * (i % 2 === 0 ? 1 : -1));
      d.normalize();
    }
    return pts;
  };

  const flower = (
    parent: THREE.Object3D,
    pos: THREE.Vector3,
    normal: THREE.Vector3,
    size: number,
    petal: THREE.Material
  ) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().normalize());
    const pg = new THREE.SphereGeometry(0.014 * size, 5, 4);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const pm = new THREE.Mesh(pg, petal);
      pm.position.set(Math.cos(a) * 0.017 * size, Math.sin(a) * 0.017 * size, 0);
      pm.scale.set(1.35, 0.85, 0.45);
      pm.rotation.z = a;
      g.add(pm);
    }
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.0105 * size, 6, 4), flowerCentre);
    c.position.z = 0.004 * size;
    c.scale.z = 0.8;
    g.add(c);
    parent.add(g);
  };

  // ---------- torso ----------
  const barrelGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.5, 8, 1);
  barrelGeo.rotateY(Math.PI / 8);
  const barrel = new THREE.Mesh(barrelGeo, coat);
  barrel.rotation.x = Math.PI / 2;
  barrel.scale.set(0.85, 1, 1);
  barrel.position.set(0, 0.72, -0.03);
  root.add(barrel);

  blob(root, coat, 0.2, [0, 0.72, 0.22], [0.82, 1.05, 1.0]); // chest
  blob(root, coat, 0.2, [0, 0.73, -0.27], [0.82, 1.05, 1.05]); // rump
  blob(root, coatShade, 0.17, [0, 0.57, -0.03], [0.86, 0.5, 1.9]); // lilac belly

  // ---------- legs ----------
  for (const s of [1, -1]) {
    // front leg
    const x = 0.095 * s;
    blob(root, coat, 0.12, [0.125 * s, 0.67, 0.2], [0.55, 1.1, 1.0]); // shoulder
    limb(root, v3(0.105 * s, 0.66, 0.21), v3(x, 0.36, 0.225), 0.072, 0.048, coat);
    blob(root, coat, 0.052, [x, 0.35, 0.23], [0.95, 1, 1.05]); // knee
    limb(root, v3(x, 0.35, 0.23), v3(x, 0.13, 0.232), 0.038, 0.03, coat);
    blob(root, coat, 0.04, [x, 0.118, 0.236], [0.9, 1, 1]); // fetlock
    limb(root, v3(x, 0.118, 0.236), v3(x, 0.065, 0.246), 0.03, 0.034, coatShade);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.052, 0.065, 7), gold);
    hoof.position.set(x, 0.0325, 0.248);
    root.add(hoof);
    cone(root, pink, 0.03, 0.065, 5, [x, 0.1, 0.206], [Math.PI, 0, 0]);

    // hind leg
    const hx = 0.1 * s;
    blob(root, coat, 0.15, [0.115 * s, 0.67, -0.26], [0.6, 1.05, 1.0]); // thigh
    const H = v3(0.11 * s, 0.62, -0.26);
    const S = v3(0.105 * s, 0.48, -0.19);
    const K = v3(hx, 0.31, -0.32);
    const F = v3(hx, 0.115, -0.29);
    limb(root, H, S, 0.085, 0.065, coat);
    limb(root, S, K, 0.065, 0.04, coat);
    blob(root, coat, 0.045, [K.x, K.y, K.z], [0.9, 1, 1]); // hock
    box(root, coat, [0.035, 0.065, 0.04], [hx, 0.325, -0.352], [0.35, 0, 0]);
    limb(root, K, F, 0.036, 0.03, coat);
    blob(root, coat, 0.04, [F.x, F.y, F.z], [0.9, 1, 1]);
    limb(root, F, v3(hx, 0.065, -0.275), 0.03, 0.034, coatShade);
    const hoof2 = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.052, 0.065, 7), gold);
    hoof2.position.set(hx, 0.0325, -0.27);
    root.add(hoof2);
    cone(root, pink, 0.03, 0.065, 5, [hx, 0.1, -0.325], [Math.PI, 0, 0]);
  }

  // ---------- neck ----------
  const neckA = v3(0, 0.8, 0.25);
  const neckB = v3(0, 1.05, 0.43);
  const neck = limb(root, neckA, neckB, 0.125, 0.085, coat, 7);
  neck.scale.x = 0.85;

  // ---------- head ----------
  const HS = 1.12;
  const TILT = 0.7;
  const headPos = v3(0, 1.1, 0.47);
  const head = new THREE.Group();
  head.position.copy(headPos);
  head.rotation.x = TILT;
  head.scale.setScalar(HS);
  root.add(head);
  const hq = new THREE.Quaternion().setFromEuler(new THREE.Euler(TILT, 0, 0));
  const hw = (x: number, y: number, z: number) =>
    v3(x, y, z).multiplyScalar(HS).applyQuaternion(hq).add(headPos);
  const hd = (x: number, y: number, z: number) => v3(x, y, z).applyQuaternion(hq);

  blob(head, coat, 0.095, [0, 0, 0], [0.95, 1.0, 1.1]); // cranium
  for (const s of [1, -1]) blob(head, coat, 0.07, [0.05 * s, -0.045, 0], [0.8, 1, 1]); // cheeks
  const muzzle = new THREE.Mesh(taperBox(0.13, 0.15, 0.09, 0.095, 0.215), coat);
  muzzle.position.set(0, -0.032, 0.1375);
  head.add(muzzle);
  const nose = new THREE.Mesh(taperBox(0.093, 0.098, 0.085, 0.09, 0.06), nosePink);
  nose.position.set(0, -0.034, 0.272);
  head.add(nose);
  box(head, coat, [0.07, 0.03, 0.07], [0, -0.088, 0.225]); // chin
  box(head, nostril, [0.045, 0.004, 0.004], [0, -0.07, 0.303]); // smile line
  for (const s of [1, -1]) {
    ball(head, nostril, 0.012, [0.022 * s, -0.04, 0.302], [1, 0.75, 0.5]);
    ball(head, pink, 0.03, [0.062 * s, -0.035, 0.085], [0.35, 1, 1]); // blush
  }
  blob(head, MANE[0], 0.045, [0, 0.07, -0.075], [1.1, 0.9, 1], 0); // poll puff

  // eyes
  for (const s of [1, -1]) {
    const eye = new THREE.Group();
    eye.position.set(0.072 * s, 0.012, 0.05);
    eye.rotation.y = -0.35 * s;
    head.add(eye);
    ball(eye, eyeDark, 0.042, [0, 0, 0], [0.4, 1.1, 1.0]);
    ball(eye, iris, 0.031, [0.007 * s, -0.002, 0.002], [0.4, 1.05, 1.0]);
    ball(eye, irisLight, 0.017, [0.012 * s, -0.013, 0.002], [0.4, 0.8, 1.2]);
    ball(eye, pupil, 0.017, [0.0125 * s, 0.003, 0.004], [0.4, 1.1, 1.0]);
    ball(eye, shine, 0.0105, [0.017 * s, 0.018, 0.012], [0.5, 1, 1]);
    ball(eye, shine, 0.0055, [0.017 * s, -0.012, -0.01], [0.5, 1, 1]);
    cone(eye, lashMat, 0.006, 0.035, 3, [0.012 * s, 0.04, -0.028], [-1.0, 0, 0]);
    cone(eye, lashMat, 0.006, 0.03, 3, [0.012 * s, 0.03, -0.04], [-1.5, 0, 0]);
  }

  // ears
  for (const s of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(0.062 * s, 0.068, -0.045);
    ear.rotation.set(-0.8, 0, -0.3 * s);
    head.add(ear);
    cone(ear, coat, 0.04, 0.12, 4, [0, 0.06, 0], [0, 0, 0], [1, 1, 0.55]);
    cone(ear, pink, 0.027, 0.095, 4, [0, 0.052, 0.012], [0, 0, 0], [1, 1, 0.5]);
  }

  // horn: twisted, ridged cone with a canvas gradient
  const hornGeo = (len: number, r: number) => {
    const g = new THREE.CylinderGeometry(r * 0.03, r, len, 8, 18);
    const p = g.attributes.position as THREE.BufferAttribute;
    const twist = Math.PI * 3.2;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const t = (y + len / 2) / len;
      const rad = Math.hypot(x, z);
      const a = Math.atan2(z, x);
      const k = 1 + 0.26 * Math.cos(a * 4);
      const a2 = a + twist * t;
      p.setXYZ(i, Math.cos(a2) * rad * k, y, Math.sin(a2) * rad * k);
    }
    g.computeVertexNormals();
    g.translate(0, len / 2, 0);
    return g;
  };
  let hornTex: THREE.CanvasTexture | null = null;
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      for (let i = 0; i < 8; i++) {
        const odd = i % 2 === 1;
        const grad = g.createLinearGradient(0, 0, 0, 128);
        grad.addColorStop(0, odd ? "#ffb52e" : "#ffd45c");
        grad.addColorStop(0.5, odd ? "#ffd9a0" : "#ffeab8");
        grad.addColorStop(1, odd ? "#ffd0ea" : "#fff4fb");
        g.fillStyle = grad;
        g.fillRect(i * 8, 0, 8, 128);
      }
      hornTex = new THREE.CanvasTexture(c);
      hornTex.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const hornMat = new THREE.MeshStandardMaterial({
    color: hornTex ? 0xffffff : 0xffe08a,
    map: hornTex ?? null,
    emissive: hornTex ? 0xffffff : 0x6a4a10,
    emissiveMap: hornTex ?? null,
    emissiveIntensity: hornTex ? 0.3 : 0.3,
    roughness: 0.35,
    metalness: 0.1,
    flatShading: true,
  });
  const horn = new THREE.Group();
  horn.position.set(0, 0.085, 0.035);
  horn.rotation.x = -0.2;
  head.add(horn);
  horn.add(new THREE.Mesh(hornGeo(0.28, 0.032), hornMat));
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.043, 0.026, 8), pink);
  collar.position.y = 0.004;
  horn.add(collar);

  // flower behind the left eye
  flower(head, v3(0.07, 0.02, -0.06), v3(0.86, 0.22, -0.55), 1.0, petalPink);

  // forelock (built in world space so it sags with gravity)
  for (const s of [1, -1]) {
    lockChain(
      root,
      hw(0.04 * s, 0.088, -0.03),
      hd(0.06 * s, -0.22, 1),
      0.17 * HS,
      0.03,
      MANE[1],
      [0.12, 0.3, 0.35]
    );
    lockChain(
      root,
      hw(0.054 * s, 0.078, -0.035),
      hd(0.4 * s, 0.05, 1),
      0.12 * HS,
      0.027,
      MANE[0],
      [0.15, 0.3, 0.35]
    );
  }

  // ---------- mane along the neck ----------
  const nd = neckB.clone().sub(neckA).normalize();
  const perp = v3(0, nd.z, -nd.y); // up/back from the neck axis
  const N = 6;
  const flowerSpots: { pts: THREE.Vector3[]; s: number; k: number }[] = [];
  for (let i = 0; i < N; i++) {
    const t = 0.04 + (i / (N - 1)) * 0.88;
    const c = neckA.clone().lerp(neckB, t);
    const rr = THREE.MathUtils.lerp(0.125, 0.085, t) * 0.95;
    const base = c.clone().addScaledVector(perp, rr);
    const m = MANE[i % MANE.length];
    blob(root, m, 0.042, [base.x, base.y, base.z], [1, 0.9, 1], 0);
    lockChain(root, base, v3(0, 1, -0.35), 0.13 * (0.9 + rand() * 0.25), 0.036, m, [0.1, 0.3]);
    for (const s of [1, -1]) {
      const pts = lockChain(
        root,
        base.clone().add(v3(0.02 * s, 0, 0)),
        v3(0.65 * s, 0.5, -0.35),
        0.21 * (0.9 + rand() * 0.25),
        0.037,
        m,
        [0.3, 0.45, 0.5],
        0.05 * s
      );
      flowerSpots.push({ pts, s, k: i });
    }
  }
  const flowerPlan: [number, number, THREE.Material][] = [
    [1, 1, petalWhite],
    [3, 1, petalButter],
    [2, -1, petalPink],
  ];
  for (const [k, s, pm] of flowerPlan) {
    const fs = flowerSpots.find((f) => f.k === k && f.s === s);
    if (!fs) continue;
    const n = v3(s, 0.6, -0.1).normalize();
    flower(root, fs.pts[1].clone().addScaledVector(n, 0.03), n, 1.1, pm);
  }

  // ---------- tail ----------
  const tailRoot = v3(0, 0.76, -0.45);
  blob(root, pink, 0.05, [tailRoot.x, tailRoot.y, tailRoot.z], [1, 1, 1], 0);
  const TN = 9;
  for (let i = 0; i < TN; i++) {
    const a = (i / (TN - 1) - 0.5) * 1.6;
    const lift = 0.3 + (i % 3) * 0.08;
    const dir = v3(Math.sin(a), lift, -Math.cos(a));
    const rp = tailRoot.clone().add(v3(Math.sin(a) * 0.03, (i % 3) * 0.015, -0.01));
    lockChain(
      root,
      rp,
      dir,
      0.46 * (0.88 + rand() * 0.25),
      0.048,
      MANE[i % MANE.length],
      [0.35, 0.55, 0.6, 0.35],
      0.07
    );
  }

  // ---------- cutie marks ----------
  const starShape = (R: number, r: number) => {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const ang = Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? R : r;
      const px = Math.cos(ang) * rad,
        py = Math.sin(ang) * rad;
      if (i === 0) sh.moveTo(px, py);
      else sh.lineTo(px, py);
    }
    sh.closePath();
    return sh;
  };
  const bigStar = new THREE.ExtrudeGeometry(starShape(0.052, 0.025), {
    depth: 0.02,
    bevelEnabled: false,
  });
  const smallStar = new THREE.ExtrudeGeometry(starShape(0.04, 0.019), {
    depth: 0.02,
    bevelEnabled: false,
  });
  for (const s of [1, -1]) {
    const a = new THREE.Mesh(bigStar, starLilac);
    a.rotation.y = (Math.PI / 2) * s;
    a.position.set(0.19 * s, 0.67, -0.26);
    root.add(a);
    const b = new THREE.Mesh(smallStar, gold);
    b.rotation.y = (Math.PI / 2) * s;
    b.position.set(0.2 * s, 0.67, -0.26);
    root.add(b);
  }

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
```