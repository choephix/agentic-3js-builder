import * as THREE from "three";

export const meta = {
  name: "Moonpetal, the Newborn Unicorn Foal",
  description:
    "A wobbly-legged newborn unicorn foal built from faceted primitives: pearly white coat with a lilac shimmer texture, fluffy pink, mint and lavender mane and tail, a twisted golden horn, big dark lashed eyes, silver hooves, a golden star cutie mark and a daisy chain around its neck.",
};

type P3 = [number, number, number];

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pearly coat: near-white base with soft pastel blotches and tiny sparkles.
function makeCoatTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return null;
  const rnd = mulberry32(99);
  g.fillStyle = "#f8f3fc";
  g.fillRect(0, 0, size, size);
  const palette: P3[] = [
    [214, 194, 250],
    [255, 205, 230],
    [204, 244, 229],
    [196, 216, 255],
    [228, 208, 255],
    [214, 194, 250],
  ];
  for (let i = 0; i < 54; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 26 + rnd() * 54;
    const c = palette[Math.floor(rnd() * palette.length)];
    const a = 0.22 + rnd() * 0.3;
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const cx = x + ox;
        const cy = y + oy;
        if (cx + r < 0 || cx - r > size || cy + r < 0 || cy - r > size) continue;
        const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        g.fillStyle = grad;
        g.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    }
  }
  for (let i = 0; i < 90; i++) {
    g.fillStyle = rnd() > 0.5 ? "rgba(255,255,255,0.95)" : "rgba(200,170,255,0.7)";
    g.fillRect(Math.floor(rnd() * size), Math.floor(rnd() * size), 2, 2);
  }
  g.strokeStyle = "rgba(255,255,255,0.95)";
  g.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    g.beginPath();
    g.moveTo(x - 4, y);
    g.lineTo(x + 4, y);
    g.moveTo(x, y - 4);
    g.lineTo(x, y + 4);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function buildUnicornFoal(): THREE.Object3D {
  const rnd = mulberry32(20240611);
  const root = new THREE.Group();
  root.name = "UnicornFoal";

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const FWD = V(0, 0, 1);
  const toArr = (p: P3 | THREE.Vector3): P3 => (Array.isArray(p) ? p : [p.x, p.y, p.z]);

  // ---------- materials ----------
  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, flatShading: true, ...o });

  const coatTex = makeCoatTexture();
  const M = {
    coat: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: coatTex,
      roughness: 0.5,
      metalness: 0.05,
      emissive: new THREE.Color(0xcdb8f0),
      emissiveIntensity: 0.12,
      flatShading: true,
    }),
    lilac: std(0xe4d4f8, { roughness: 0.55 }),
    pink: std(0xf9b9d3, { roughness: 0.6 }),
    nostril: std(0x6b4366),
    eyeDark: std(0x1a0f2e, { flatShading: false, roughness: 0.25 }),
    iris: std(0x5a3792, { flatShading: false, roughness: 0.3, emissive: 0x24104a, emissiveIntensity: 0.5 }),
    pupil: std(0x07030f, { flatShading: false, roughness: 0.2 }),
    shine: std(0xffffff, { flatShading: false, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.2 }),
    lash: std(0x2b1a3d, { flatShading: false }),
    goldDeep: std(0xf2b631, { metalness: 0.45, roughness: 0.35, emissive: 0x5a3a00, emissiveIntensity: 0.35 }),
    goldLight: std(0xffe27a, { metalness: 0.45, roughness: 0.3, emissive: 0x6a4a00, emissiveIntensity: 0.35 }),
    silver: std(0xd4dae6, { metalness: 0.5, roughness: 0.28, emissive: 0x2a2f3c, emissiveIntensity: 0.35 }),
    manePink: std(0xffa6cc, { roughness: 0.85 }),
    maneMint: std(0xa6efd0, { roughness: 0.85 }),
    maneLav: std(0xc4a8ff, { roughness: 0.85 }),
    petal: std(0xfffdf7, { roughness: 0.7 }),
    center: std(0xffcf2e, { roughness: 0.6 }),
    stem: std(0x62c777),
    leaf: std(0x45ad63),
  };
  const maneMats = [M.manePink, M.maneMint, M.maneLav];

  // ---------- helpers ----------
  const sphereCache = new Map<string, THREE.SphereGeometry>();
  const sphereGeo = (w: number, h: number) => {
    const k = `${w}x${h}`;
    let g = sphereCache.get(k);
    if (!g) {
      g = new THREE.SphereGeometry(1, w, h);
      sphereCache.set(k, g);
    }
    return g;
  };

  function blob(
    mat: THREE.Material,
    r: number,
    p: P3 | THREE.Vector3,
    s: P3 = [1, 1, 1],
    w = 8,
    h = 6,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const m = new THREE.Mesh(sphereGeo(w, h), mat);
    const q = toArr(p);
    m.position.set(q[0], q[1], q[2]);
    m.scale.set(r * s[0], r * s[1], r * s[2]);
    parent.add(m);
    return m;
  }

  function limb(
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    mat: THREE.Material,
    seg = 6,
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    parent.add(m);
    return m;
  }

  const tuftGeo = new THREE.IcosahedronGeometry(1, 1);
  function tuft(
    mat: THREE.Material,
    p: P3 | THREE.Vector3,
    r: number,
    s: P3 = [1, 1, 1],
    parent: THREE.Object3D = root
  ): THREE.Mesh {
    const m = new THREE.Mesh(tuftGeo, mat);
    const q = toArr(p);
    m.position.set(q[0], q[1], q[2]);
    m.scale.set(r * s[0], r * s[1], r * s[2]);
    m.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
    parent.add(m);
    return m;
  }

  function lock(
    mat: THREE.Material,
    start: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    parent: THREE.Object3D = root
  ) {
    const g = new THREE.ConeGeometry(r, len, 5, 1);
    g.translate(0, len / 2, 0);
    const m = new THREE.Mesh(g, mat);
    m.position.copy(start);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    parent.add(m);
  }

  // ---------- torso ----------
  const torsoGeo = new THREE.CapsuleGeometry(0.17, 0.42, 4, 10);
  torsoGeo.rotateX(Math.PI / 2);
  const torso = new THREE.Mesh(torsoGeo, M.coat);
  torso.position.set(0, 0.78, 0);
  torso.scale.set(0.9, 1, 1);
  root.add(torso);
  blob(M.coat, 0.15, [0, 0.76, 0.26], [0.95, 1, 1], 9, 7); // chest
  for (const sx of [1, -1]) {
    blob(M.coat, 0.11, [sx * 0.07, 0.8, -0.25], [1, 1.05, 1.1], 8, 6); // haunch
    blob(M.coat, 0.095, [sx * 0.095, 0.73, 0.235], [1, 1.1, 1], 8, 6); // shoulder
  }

  // ---------- legs ----------
  function addLeg(sx: number, front: boolean, out: number, fwd: number, kneeZ: number, tuftMat: THREE.Material) {
    const yTop = front ? 0.7 : 0.76;
    const fr = (y: number) => (yTop - y) / yTop;
    const pt = (x: number, y: number, z: number, ez = 0) =>
      V(sx * (x + out * fr(y)), y, z + fwd * fr(y) + ez);

    let joint: THREE.Vector3; // knee or hock
    let fet: THREE.Vector3;
    let cor: THREE.Vector3;

    if (front) {
      const top = pt(0.105, 0.7, 0.24);
      joint = pt(0.108, 0.385, 0.25, kneeZ);
      fet = pt(0.108, 0.115, 0.25);
      cor = pt(0.108, 0.052, 0.282);
      limb(top, joint, 0.07, 0.042, M.coat, 7);
      blob(M.coat, 0.05, joint, [1, 1, 1.05], 6, 5);
    } else {
      const top = pt(0.105, 0.76, -0.24);
      const stifle = pt(0.12, 0.52, -0.185);
      joint = pt(0.115, 0.345, -0.335, kneeZ);
      fet = pt(0.115, 0.112, -0.305);
      cor = pt(0.115, 0.052, -0.28);
      limb(top, stifle, 0.088, 0.06, M.coat, 7);
      blob(M.coat, 0.058, stifle, [1, 1, 1], 6, 5);
      limb(stifle, joint, 0.06, 0.04, M.coat, 7);
      blob(M.coat, 0.045, joint, [1, 1, 1], 6, 5);
      limb(joint, joint.clone().add(V(0, 0.06, -0.04)), 0.028, 0.019, M.coat, 5); // point of hock
    }
    limb(joint, fet, 0.033, 0.028, M.lilac, 6); // cannon
    blob(M.lilac, 0.04, fet, [1, 1, 1], 6, 5); // fetlock
    limb(fet, cor, 0.03, 0.032, M.lilac, 6); // pastern
    // fluffy fetlock feather
    tuft(tuftMat, [fet.x, fet.y - 0.012, fet.z - 0.032], 0.028, [1, 1.6, 1]);
    // silver hoof, flat on the floor
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.046, 0.052, 8, 1), M.silver);
    hoof.position.set(cor.x, 0.026, cor.z + 0.004);
    hoof.scale.z = 1.1;
    root.add(hoof);
  }

  addLeg(1, true, 0.05, 0.09, 0.02, M.maneMint); // front left, stepped forward
  addLeg(-1, true, 0.03, -0.05, -0.01, M.manePink); // front right, tucked back
  addLeg(1, false, 0.04, -0.04, 0.0, M.maneLav); // hind left
  addLeg(-1, false, 0.06, 0.06, 0.015, M.manePink); // hind right

  // ---------- neck ----------
  const B = V(0, 0.86, 0.3);
  const T = V(0, 1.12, 0.47);
  const dN = T.clone().sub(B).normalize();
  const nAx = V(0, dN.z, -dN.y).normalize(); // up-and-back (crest side)
  const neck = limb(
    B.clone().addScaledVector(dN, -0.07),
    T.clone().addScaledVector(dN, 0.05),
    0.105,
    0.07,
    M.coat,
    8
  );
  neck.scale.x = 0.9;

  // ---------- daisy factory ----------
  const petalGeo = new THREE.SphereGeometry(1, 5, 3);
  function makeDaisy(size: number, petals = 10): THREE.Group {
    const g = new THREE.Group();
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      const p = new THREE.Mesh(petalGeo, M.petal);
      p.rotation.order = "ZXY";
      p.scale.set(0.0085 * size, 0.0185 * size, 0.0035 * size);
      p.position.set(Math.cos(a) * 0.0185 * size, Math.sin(a) * 0.0185 * size, 0.002 * size);
      p.rotation.set(0.22, 0, a - Math.PI / 2);
      g.add(p);
    }
    const c = new THREE.Mesh(sphereGeo(6, 4), M.center);
    c.scale.set(0.0115 * size, 0.0115 * size, 0.006 * size);
    c.position.z = 0.005 * size;
    g.add(c);
    return g;
  }
  function placeDaisy(
    parent: THREE.Object3D,
    pos: THREE.Vector3,
    normal: THREE.Vector3,
    size: number,
    petals = 10
  ) {
    const d = makeDaisy(size, petals);
    d.position.copy(pos);
    d.quaternion.setFromUnitVectors(FWD, normal.clone().normalize());
    d.rotateZ(rnd() * Math.PI * 2);
    parent.add(d);
  }

  // ---------- head ----------
  const head = new THREE.Group();
  head.name = "Head";
  head.position.set(0, 1.18, 0.53);
  head.rotation.x = 0.55;
  root.add(head);

  blob(M.coat, 0.12, [0, 0, 0], [0.88, 1, 1], 10, 8, head); // skull
  blob(M.coat, 0.085, [0, -0.065, 0.05], [0.85, 0.9, 1.15], 8, 6, head); // jaw
  const muzzleGeo = new THREE.CylinderGeometry(0.052, 0.08, 0.2, 8, 1);
  muzzleGeo.rotateX(Math.PI / 2);
  const muzzle = new THREE.Mesh(muzzleGeo, M.coat);
  muzzle.scale.x = 0.85;
  muzzle.position.set(0, -0.048, 0.14);
  head.add(muzzle);
  blob(M.pink, 0.056, [0, -0.05, 0.245], [0.92, 0.88, 0.8], 8, 6, head); // soft pink nose
  for (const sx of [1, -1]) {
    blob(M.nostril, 0.012, [sx * 0.026, -0.038, 0.282], [0.9, 1.4, 0.6], 6, 4, head);
    blob(M.pink, 0.026, [sx * 0.071, -0.062, 0.06], [0.5, 1, 1], 6, 5, head); // blush
  }

  // eyes
  function addEye(sx: number) {
    const eye = new THREE.Group();
    eye.position.set(sx * 0.084, 0.03, 0.05);
    eye.rotation.y = sx * (Math.PI / 2 - 0.6);
    head.add(eye);
    blob(M.eyeDark, 0.046, [0, 0, 0], [1, 1.12, 0.6], 12, 9, eye);
    blob(M.iris, 0.036, [0, 0, 0.01], [1, 1.12, 0.55], 12, 9, eye);
    blob(M.pupil, 0.021, [0, 0, 0.022], [1, 1.15, 0.5], 10, 8, eye);
    blob(M.shine, 0.0105, [-sx * 0.012, 0.016, 0.031], [1, 1, 0.55], 6, 5, eye);
    blob(M.shine, 0.0055, [sx * 0.012, -0.014, 0.031], [1, 1, 0.55], 6, 4, eye);

    const arc = Math.PI * 1.05;
    const liner = new THREE.Mesh(new THREE.TorusGeometry(0.049, 0.0042, 4, 12, arc), M.lash);
    liner.scale.y = 1.1;
    liner.rotation.z = Math.PI / 2 - arc / 2;
    eye.add(liner);

    // long curled lashes sweeping back and up
    const nL = 6;
    for (let i = 0; i < nL; i++) {
      const a = THREE.MathUtils.degToRad(-50 + i * (150 / (nL - 1)));
      const dx = sx * Math.sin(a);
      const dy = Math.cos(a);
      const base = V(dx * 0.05, dy * 0.0545, 0.004);
      const L = 0.03 + 0.027 * (i / (nL - 1));
      const mid = base.clone().add(V(dx * L * 0.6, dy * L * 0.6, 0.006));
      const dir2 = V(dx, dy + 0.9, 0).normalize();
      const tip = mid.clone().add(V(dir2.x * L * 0.5, dir2.y * L * 0.5, 0.008));
      limb(base, mid, 0.0035, 0.0024, M.lash, 3, eye);
      limb(mid, tip, 0.0024, 0.0008, M.lash, 3, eye);
    }
  }
  addEye(1);
  addEye(-1);

  // ears
  function addEar(sx: number) {
    const ear = new THREE.Group();
    ear.position.set(sx * 0.062, 0.085, -0.04);
    ear.rotation.set(-0.5, 0, -sx * 0.42);
    head.add(ear);
    const g = new THREE.ConeGeometry(0.042, 0.14, 5, 1);
    g.translate(0, 0.06, 0);
    const outer = new THREE.Mesh(g, M.coat);
    outer.scale.z = 0.6;
    ear.add(outer);
    const g2 = new THREE.ConeGeometry(0.027, 0.11, 5, 1);
    g2.translate(0, 0.05, 0);
    const inner = new THREE.Mesh(g2, M.pink);
    inner.scale.z = 0.5;
    inner.position.z = 0.011;
    ear.add(inner);
  }
  addEar(1);
  addEar(-1);

  // golden spiral horn
  {
    const horn = new THREE.Group();
    horn.name = "Horn";
    horn.position.set(0, 0.088, 0.07);
    horn.rotation.x = -0.1;
    head.add(horn);
    const H = 0.22;
    const R = 0.032;
    const coneGeo = new THREE.ConeGeometry(R, H, 8, 1);
    coneGeo.translate(0, H / 2, 0);
    horn.add(new THREE.Mesh(coneGeo, M.goldDeep));
    const N = 26;
    for (let k = 0; k < 2; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * 0.93;
        const a = k * Math.PI + t * 3.2 * Math.PI * 2;
        const r = R * (1 - t) + 0.0008;
        pts.push(V(Math.cos(a) * r, t * H, Math.sin(a) * r));
      }
      for (let i = 0; i < N; i++) {
        const t0 = (i / N) * 0.93;
        const t1 = ((i + 1) / N) * 0.93;
        limb(pts[i], pts[i + 1], 0.0068 * (1 - t0) + 0.0012, 0.0068 * (1 - t1) + 0.0012, M.goldLight, 4, horn);
      }
    }
  }

  // forelock and poll fluff
  {
    const fore: [P3, number][] = [
      [[-0.035, 0.085, 0.1], 1],
      [[0.03, 0.09, 0.105], 2],
      [[0, 0.07, 0.125], 0],
      [[-0.062, 0.09, 0.055], 2],
      [[0.065, 0.092, 0.05], 0],
      [[0, 0.1, -0.005], 1],
      [[0, 0.085, -0.065], 0],
      [[-0.04, 0.1, -0.03], 2],
      [[0.04, 0.1, -0.03], 1],
    ];
    for (const [p, c] of fore) tuft(maneMats[c], p, 0.036 + rnd() * 0.008, [1, 0.95, 1.1], head);
    lock(M.manePink, V(-0.03, 0.085, 0.115), V(-0.1, -0.55, 0.8), 0.09, 0.022, head);
    lock(M.maneMint, V(0.03, 0.085, 0.115), V(0.12, -0.55, 0.8), 0.085, 0.021, head);
    lock(M.maneLav, V(0, 0.075, 0.13), V(0, -0.6, 0.8), 0.07, 0.02, head);
    // a little daisy tucked behind the ear
    placeDaisy(head, V(-0.095, 0.045, -0.035), V(-1, 0.35, 0.1), 0.7, 8);
  }

  // ---------- mane ----------
  for (let i = 0; i < 13; i++) {
    const t = 0.04 + i * 0.088;
    const A = B.clone().lerp(T, t);
    const rN = 0.105 + (0.07 - 0.105) * Math.min(t, 1);
    const crest = A.clone().addScaledVector(nAx, rN * 0.9 + 0.012);
    const sx = i % 2 === 0 ? 1 : -1;
    tuft(maneMats[i % 3], crest, 0.05 + rnd() * 0.012, [1, 0.9, 1.2]);
    const side = crest.clone().add(V(sx * 0.042, 0, 0)).addScaledVector(nAx, -0.012);
    tuft(maneMats[(i + 1) % 3], side, 0.042 + rnd() * 0.01);
    lock(maneMats[(i + 2) % 3], side, V(sx * 0.65, -0.55, -0.4), 0.1, 0.028);
    if (i === 3 || i === 8 || i === 11) {
      const dp = crest.clone().addScaledVector(nAx, 0.045).add(V(-sx * 0.02, 0, 0));
      placeDaisy(root, dp, nAx.clone().add(V(-sx * 0.6, 0.1, 0)), 0.55, 8);
    }
  }

  // ---------- tail ----------
  {
    const strandMat = [M.maneMint, M.manePink, M.maneLav, M.manePink, M.maneMint];
    for (let k = 0; k < 5; k++) {
      const ox = (k - 2) * 0.032;
      for (let j = 0; j < 6; j++) {
        const s = j / 5;
        const x = ox + Math.sin(s * Math.PI * 1.4 + k * 1.3) * 0.025 + (k - 2) * 0.012 * s;
        const y = 0.86 - 0.48 * s;
        const z = -0.37 - 0.11 * s - 0.07 * Math.sin(s * Math.PI);
        const r = 0.048 * (1 - 0.35 * s) + 0.012 * Math.sin(s * Math.PI);
        tuft(strandMat[k], [x, y, z], r, [1, 1.25, 1]);
      }
    }
    placeDaisy(root, V(0.075, 0.7, -0.46), V(1, 0.1, -0.35), 0.6, 8);
  }

  // ---------- cutie marks ----------
  function starGeo(outer: number, inner: number, depth: number) {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  }
  const bigStar = starGeo(0.046, 0.022, 0.008);
  const smallStar = starGeo(0.032, 0.015, 0.008);
  for (const sx of [1, -1]) {
    const g = new THREE.Group();
    g.position.set(sx * 0.166, 0.8, -0.215);
    g.rotation.y = sx * (Math.PI / 2);
    root.add(g);
    g.add(new THREE.Mesh(bigStar, M.maneLav));
    const top = new THREE.Mesh(smallStar, M.goldLight);
    top.position.z = 0.007;
    g.add(top);
  }

  // ---------- daisy chain ----------
  {
    const A0 = B.clone().lerp(T, 0.12);
    const uAx = V(1, 0, 0);
    const fAx = nAx.clone().negate();
    const N = 14;
    const pts: THREE.Vector3[] = [];
    const nrms: THREE.Vector3[] = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.PI / 2 + (i / N) * Math.PI * 2;
      const s = Math.sin(phi);
      const c = Math.cos(phi);
      const R = 0.125 + 0.045 * Math.max(0, -s);
      const droop = 0.11 * Math.pow(Math.max(0, s), 1.5);
      const p = A0.clone().addScaledVector(uAx, c * R).addScaledVector(fAx, s * R);
      p.y -= droop;
      const nr = uAx.clone().multiplyScalar(c).addScaledVector(fAx, s);
      nr.y += 0.35 * Math.max(0, s);
      nr.normalize();
      pts.push(p);
      nrms.push(nr);
    }
    for (let i = 0; i < N; i++) {
      const size = (i === 0 ? 1.15 : i % 2 === 0 ? 1.0 : 0.8) * (0.92 + rnd() * 0.16);
      placeDaisy(root, pts[i], nrms[i], size, 10);
      const j = (i + 1) % N;
      limb(pts[i], pts[j], 0.006, 0.006, M.stem, 4);
      // little leaf on each stem
      const mid = pts[i].clone().add(pts[j]).multiplyScalar(0.5);
      const tan = pts[j].clone().sub(pts[i]).normalize();
      const nm = nrms[i].clone().add(nrms[j]).normalize();
      const side = new THREE.Vector3().crossVectors(nm, tan).normalize();
      const ls = i % 2 === 0 ? 1 : -1;
      const dir = tan.clone().multiplyScalar(0.5).addScaledVector(side, 0.7 * ls).addScaledVector(nm, 0.5).normalize();
      const leaf = blob(M.leaf, 1, mid.clone().addScaledVector(nm, 0.008).addScaledVector(dir, 0.02), [0.01, 0.024, 0.004], 5, 3);
      leaf.quaternion.setFromUnitVectors(UP, dir);
    }
  }

  // shadows
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  return root;
}
