import * as THREE from "three";

export const meta = {
  name: "Pufferfish",
  description:
    "An inflated golden pufferfish: a faceted egg-shaped body with a dark amber back, spotted flanks, cream belly and pink cheeks. It has cream-tipped pyramid spines, big glossy cartoon eyes, a pursed beak with buck teeth, ray-patterned fan fins and a rounded tail.",
};

// ---------------------------------------------------------------- helpers
const V3 = THREE.Vector3;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------- body shape
const RX = 0.165;
const RY = 0.16;
const RZ = 0.185;

/** Maps a unit direction to a point on the (egg-shaped) body surface. */
function surf(d: THREE.Vector3): THREE.Vector3 {
  const front = smooth(0.45, 1, d.z);
  const rear = smooth(0.3, 1, -d.z);
  const s = 1 - 0.2 * front - 0.35 * rear;
  return new V3(d.x * RX * s, d.y * RY * s, d.z * RZ);
}

function surfNormal(d: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(d.y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0);
  const t1 = new V3().crossVectors(d, ref).normalize();
  const t2 = new V3().crossVectors(d, t1).normalize();
  const e = 0.02;
  const p0 = surf(d);
  const p1 = surf(d.clone().addScaledVector(t1, e).normalize());
  const p2 = surf(d.clone().addScaledVector(t2, e).normalize());
  const n = new V3().crossVectors(p1.sub(p0), p2.sub(p0)).normalize();
  if (n.dot(d) < 0) n.negate();
  return n;
}

/** Basis with local Z = normal, local Y = world-up projected on the surface. */
function decalQuat(n: THREE.Vector3): THREE.Quaternion {
  const up = new V3(0, 1, 0);
  const y = up.addScaledVector(n, -up.dot(n)).normalize();
  const x = new V3().crossVectors(y, n);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
}

/** Basis with local X = fan axis, local Z = (orthogonalised) fin normal. */
function orient(axis: THREE.Vector3, normal: THREE.Vector3): THREE.Quaternion {
  const X = axis.clone().normalize();
  const Z = normal.clone().addScaledVector(X, -normal.dot(X)).normalize();
  const Y = new V3().crossVectors(Z, X);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
}

// ---------------------------------------------------------------- geometry utils
function paint(g: THREE.BufferGeometry, c: THREE.Color): THREE.BufferGeometry {
  const n = g.getAttribute("position").count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return g;
}

function merge(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0;
  for (const g of geos) total += g.getAttribute("position").count;
  const p = new Float32Array(total * 3);
  const c = new Float32Array(total * 3);
  let o = 0;
  for (const g of geos) {
    const pa = g.getAttribute("position");
    const ca = g.getAttribute("color");
    for (let i = 0; i < pa.count; i++) {
      p[(o + i) * 3] = pa.getX(i);
      p[(o + i) * 3 + 1] = pa.getY(i);
      p[(o + i) * 3 + 2] = pa.getZ(i);
      c[(o + i) * 3] = ca.getX(i);
      c[(o + i) * 3 + 1] = ca.getY(i);
      c[(o + i) * 3 + 2] = ca.getZ(i);
    }
    o += pa.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(p, 3));
  out.setAttribute("color", new THREE.BufferAttribute(c, 3));
  out.computeVertexNormals();
  return out;
}

/** A thin scalloped fan fin (with ray ribs) pointing along local +X. */
function fanGeo(
  radius: number,
  spread: number,
  rays: number,
  bw: number,
  scallop: number,
  thick: number,
  cBase: THREE.Color,
  cValley: THREE.Color,
  cTip: THREE.Color,
  cRay: THREE.Color
): THREE.BufferGeometry {
  type P = { x: number; y: number; c: THREE.Color };
  const pts: P[] = [];
  const tipAngles: number[] = [];
  pts.push({ x: 0, y: -bw, c: cBase });
  for (let i = 0; i <= rays; i++) {
    const a = -spread / 2 + (spread * i) / rays;
    tipAngles.push(a);
    if (i > 0) {
      const am = a - spread / rays / 2;
      const rv = radius * (1 - scallop);
      pts.push({ x: Math.cos(am) * rv, y: Math.sin(am) * rv, c: cValley });
    }
    pts.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius, c: cTip });
  }
  pts.push({ x: 0, y: bw, c: cBase });

  const pos: number[] = [];
  const col: number[] = [];
  const push = (x: number, y: number, z: number, c: THREE.Color) => {
    pos.push(x, y, z);
    col.push(c.r, c.g, c.b);
  };
  const h = thick / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i];
    const B = pts[i + 1];
    // front
    push(0, 0, h, cBase);
    push(A.x, A.y, h, A.c);
    push(B.x, B.y, h, B.c);
    // back
    push(0, 0, -h, cBase);
    push(B.x, B.y, -h, B.c);
    push(A.x, A.y, -h, A.c);
    // wall
    push(A.x, A.y, -h, A.c);
    push(B.x, B.y, -h, B.c);
    push(B.x, B.y, h, B.c);
    push(A.x, A.y, -h, A.c);
    push(B.x, B.y, h, B.c);
    push(A.x, A.y, h, A.c);
  }
  const fan = new THREE.BufferGeometry();
  fan.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  fan.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));

  const parts: THREE.BufferGeometry[] = [fan];
  for (const a of tipAngles) {
    const L = radius * 0.99;
    const b = new THREE.BoxGeometry(L, 0.0028, thick + 0.0015).toNonIndexed();
    b.translate(L / 2, 0, 0);
    b.rotateZ(a);
    paint(b, cRay);
    parts.push(b);
  }
  return merge(parts);
}

// ---------------------------------------------------------------- the model
export default function buildPufferfish(): THREE.Object3D {
  const rng = mulberry32(20240611);
  const fish = new THREE.Group();
  fish.name = "Pufferfish";

  // ---- palette
  const C = {
    back: new THREE.Color(0x8a5a26),
    upper: new THREE.Color(0xc88a32),
    lower: new THREE.Color(0xe8be62),
    belly: new THREE.Color(0xf8eed2),
    spotDark: new THREE.Color(0x4a2c14),
    spotPale: new THREE.Color(0xf2cb6e),
    blush: new THREE.Color(0xf0937a),
    speckle: new THREE.Color(0xd9b87c),
    spineTip: new THREE.Color(0xfff1cc),
  };

  // ---- materials
  const matBody = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.72, metalness: 0 });
  const matSpine = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.55, metalness: 0 });
  const matFin = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xc98a33, flatShading: true, roughness: 0.7 });
  const matEyeWhite = new THREE.MeshStandardMaterial({ color: 0xfffcef, roughness: 0.2 });
  const matLimbus = new THREE.MeshStandardMaterial({ color: 0x9a4d12, roughness: 0.25 });
  const matIris = new THREE.MeshStandardMaterial({ color: 0xf2b624, roughness: 0.25 });
  const matPupil = new THREE.MeshStandardMaterial({ color: 0x0d0a10, roughness: 0.15 });
  const matShine = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.7, roughness: 0.3 });
  const matEyeRing = new THREE.MeshStandardMaterial({ color: 0x5a3818, flatShading: true, roughness: 0.8 });
  const matLip = new THREE.MeshStandardMaterial({ color: 0xe8825c, flatShading: true, roughness: 0.55 });
  const matMouth = new THREE.MeshStandardMaterial({ color: 0x2a1010, roughness: 0.9 });
  const matTeeth = new THREE.MeshStandardMaterial({ color: 0xfffbec, roughness: 0.35 });
  const matGill = new THREE.MeshStandardMaterial({ color: 0x3e2410, flatShading: true, roughness: 0.9 });

  // ---- direction anchors
  const eyeDirs = [1, -1].map((s) => new V3(s * 0.795, 0.348, 0.497).normalize());
  const mouthDir = new V3(0, -0.12, 0.99).normalize();
  const nostrilDirs = [1, -1].map((s) => new V3(s * 0.28, 0.5, 0.82).normalize());
  const pectDirs = [1, -1].map((s) => new V3(s * 1, -0.1, -0.05).normalize());
  const gillDirs = [1, -1].map((s) => new V3(s * 0.97, -0.02, 0.2).normalize());
  const blushDirs = [1, -1].map((s) => new V3(s * 0.84, -0.2, 0.5).normalize());
  const dorsalDir = new V3(0, 0.82, -0.57).normalize();
  const analDir = new V3(0, -0.82, -0.57).normalize();

  // ---- skin pattern: spots
  const spots: { c: THREE.Vector3; r: number }[] = [];
  for (let tries = 0; tries < 700 && spots.length < 30; tries++) {
    const u = rng() * 2 - 1;
    const th = rng() * Math.PI * 2;
    const rr = Math.sqrt(1 - u * u);
    const c = new V3(Math.cos(th) * rr, u, Math.sin(th) * rr);
    if (c.y < -0.05 || c.z > 0.72 || c.z < -0.85) continue;
    if (eyeDirs.some((e) => e.angleTo(c) < 0.5)) continue;
    if (pectDirs.some((e) => e.angleTo(c) < 0.3)) continue;
    const rad = 0.11 + rng() * 0.1;
    if (spots.some((s) => s.c.angleTo(c) < s.r + rad + 0.07)) continue;
    spots.push({ c, r: rad });
  }
  const specks: THREE.Vector3[] = [];
  for (let tries = 0; tries < 200 && specks.length < 22; tries++) {
    const u = rng() * 2 - 1;
    const th = rng() * Math.PI * 2;
    const rr = Math.sqrt(1 - u * u);
    const c = new V3(Math.cos(th) * rr, u, Math.sin(th) * rr);
    if (c.y > -0.42 || Math.abs(c.z) > 0.8) continue;
    specks.push(c);
  }

  function bodyColor(d: THREE.Vector3, nz: number, withSpots: boolean): THREE.Color {
    const t = d.y + nz * 0.09;
    let c = t > 0.52 ? C.back : t > 0.14 ? C.upper : t > -0.22 ? C.lower : C.belly;
    if (!withSpots) return c;
    if (t > -0.22) {
      for (const s of spots) {
        if (d.angleTo(s.c) < s.r) {
          c = t > 0.52 ? C.spotPale : C.spotDark;
          break;
        }
      }
    } else if (specks.some((s) => d.angleTo(s) < 0.07)) {
      c = C.speckle;
    }
    if (blushDirs.some((b) => d.angleTo(b) < 0.2)) c = C.blush;
    return c;
  }

  // ---------------------------------------------------------------- body
  {
    const ico = new THREE.IcosahedronGeometry(1, 5);
    ico.deleteAttribute("uv");
    ico.deleteAttribute("normal");
    const pos = ico.getAttribute("position");
    const cols = new Float32Array(pos.count * 3);
    const u = [new V3(), new V3(), new V3()];
    for (let f = 0; f < pos.count / 3; f++) {
      for (let k = 0; k < 3; k++) u[k].fromBufferAttribute(pos, f * 3 + k);
      const d = new V3().add(u[0]).add(u[1]).add(u[2]).normalize();
      const c = bodyColor(d, rng() * 2 - 1, true);
      for (let k = 0; k < 3; k++) {
        const p = surf(u[k].clone().normalize());
        pos.setXYZ(f * 3 + k, p.x, p.y, p.z);
        cols[(f * 3 + k) * 3] = c.r;
        cols[(f * 3 + k) * 3 + 1] = c.g;
        cols[(f * 3 + k) * 3 + 2] = c.b;
      }
    }
    ico.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    ico.computeVertexNormals();
    const body = new THREE.Mesh(ico, matBody);
    body.name = "body";
    fish.add(body);
  }

  // ---------------------------------------------------------------- spines
  {
    const exclusions: { d: THREE.Vector3; cosA: number }[] = [];
    const ex = (d: THREE.Vector3, a: number) => exclusions.push({ d, cosA: Math.cos(a) });
    eyeDirs.forEach((d) => ex(d, 0.44));
    ex(mouthDir, 0.42);
    nostrilDirs.forEach((d) => ex(d, 0.2));
    pectDirs.forEach((d) => ex(d, 0.36));
    gillDirs.forEach((d) => ex(d, 0.2));
    ex(dorsalDir, 0.34);
    ex(analDir, 0.34);
    ex(new V3(0, 0, -1), 0.55);
    const excluded = (d: THREE.Vector3) => exclusions.some((e) => d.dot(e.d) > e.cosA);

    const geos: THREE.BufferGeometry[] = [];
    const N = 260;
    const GA = Math.PI * (3 - Math.sqrt(5));
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();
    const one = new V3(1, 1, 1);
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = GA * i;
      const d = new V3(
        Math.cos(th) * r + (rng() - 0.5) * 0.05,
        y + (rng() - 0.5) * 0.05,
        Math.sin(th) * r + (rng() - 0.5) * 0.05
      ).normalize();
      if (excluded(d)) continue;
      const n = surfNormal(d);
      const p = surf(d);
      const fr = smooth(0.3, 1, d.z);
      const re = smooth(0.3, 1, -d.z);
      const len = (0.046 + rng() * 0.014) * (1 - 0.3 * fr - 0.3 * re);
      const rad = 0.0105 * (0.85 + 0.3 * rng()) * (1 - 0.2 * fr - 0.2 * re);
      const g = new THREE.ConeGeometry(rad, len, 5, 1, true).toNonIndexed();
      g.translate(0, len / 2, 0);
      const base = bodyColor(d, 0, false).clone().lerp(C.spineTip, 0.25);
      const pa = g.getAttribute("position");
      const ca = new Float32Array(pa.count * 3);
      for (let k = 0; k < pa.count; k++) {
        const c = pa.getY(k) > len * 0.5 ? C.spineTip : base;
        ca[k * 3] = c.r;
        ca[k * 3 + 1] = c.g;
        ca[k * 3 + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(ca, 3));
      const dir = n.clone().add(new V3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.12)).normalize();
      q.setFromUnitVectors(Y_AXIS, dir);
      q2.setFromAxisAngle(Y_AXIS, rng() * Math.PI * 2);
      q.multiply(q2);
      m4.compose(p.clone().addScaledVector(n, -0.01), q, one);
      g.applyMatrix4(m4);
      geos.push(g);
    }
    const spines = new THREE.Mesh(merge(geos), matSpine);
    spines.name = "spines";
    fish.add(spines);
  }

  // ---------------------------------------------------------------- eyes
  [1, -1].forEach((side) => {
    const dir = eyeDirs[side === 1 ? 0 : 1];
    const p = surf(dir);
    const n = surfNormal(dir);
    const look = n.clone().add(new V3(0, 0, 0.55)).normalize();

    const eye = new THREE.Group();
    eye.position.copy(p).addScaledVector(n, 0.005);
    eye.quaternion.setFromUnitVectors(Z_AXIS, look);

    const R = 0.04;
    eye.add(new THREE.Mesh(new THREE.SphereGeometry(R, 14, 10), matEyeWhite));
    const cap = (r: number, ang: number, mat: THREE.Material) => {
      const g = new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, ang);
      g.rotateX(Math.PI / 2);
      return new THREE.Mesh(g, mat);
    };
    eye.add(cap(0.0408, 0.82, matLimbus));
    eye.add(cap(0.0412, 0.7, matIris));
    eye.add(cap(0.0416, 0.38, matPupil));

    const inv = eye.quaternion.clone().invert();
    const h1 = look.clone().add(new V3(0, 0.34, 0.14)).normalize().applyQuaternion(inv).multiplyScalar(0.0418);
    const hl1 = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 6), matShine);
    hl1.position.copy(h1);
    eye.add(hl1);
    const h2 = look.clone().add(new V3(0, -0.3, -0.12)).normalize().applyQuaternion(inv).multiplyScalar(0.0418);
    const hl2 = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 5), matShine);
    hl2.position.copy(h2);
    eye.add(hl2);
    fish.add(eye);

    // eyelid ring + brow
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.043, 0.007, 5, 12), matEyeRing);
    ring.position.copy(p).addScaledVector(n, 0.006);
    ring.quaternion.copy(decalQuat(n));
    fish.add(ring);

    const browG = new THREE.TorusGeometry(0.046, 0.0085, 5, 8, Math.PI * 0.9);
    browG.rotateZ(Math.PI * 0.05);
    const brow = new THREE.Mesh(browG, matEyeRing);
    brow.position.copy(p).addScaledVector(n, 0.0065);
    brow.quaternion.copy(decalQuat(n));
    fish.add(brow);
  });

  // ---------------------------------------------------------------- mouth
  {
    const mP = surf(mouthDir);
    const mN = surfNormal(mouthDir);
    const mouth = new THREE.Group();
    mouth.position.copy(mP).addScaledVector(mN, -0.002);
    mouth.quaternion.setFromUnitVectors(Z_AXIS, mN);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0095, 6, 10), matLip);
    lip.position.z = 0.002;
    mouth.add(lip);

    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.017, 8), matMouth);
    hole.position.z = 0.004;
    mouth.add(hole);

    const toothG = new THREE.BoxGeometry(0.0092, 0.0085, 0.008);
    const teeth: [number, number, number][] = [
      [0.0052, 0.0047, 0.0088],
      [-0.0052, 0.0047, 0.0088],
      [0.0052, -0.0047, 0.0065],
      [-0.0052, -0.0047, 0.0065],
    ];
    for (const [x, y, z] of teeth) {
      const t = new THREE.Mesh(toothG, matTeeth);
      t.position.set(x, y, z);
      mouth.add(t);
    }
    fish.add(mouth);

    // nostrils
    const nosG = new THREE.SphereGeometry(0.008, 6, 4);
    nostrilDirs.forEach((d) => {
      const m = new THREE.Mesh(nosG, matLip);
      m.position.copy(surf(d)).addScaledVector(surfNormal(d), 0.001);
      fish.add(m);
    });
  }

  // ---------------------------------------------------------------- gill slits
  [1, -1].forEach((side) => {
    const dir = gillDirs[side === 1 ? 0 : 1];
    const p = surf(dir);
    const n = surfNormal(dir);
    const g = new THREE.TorusGeometry(0.03, 0.0035, 4, 8, Math.PI * 0.7);
    g.rotateZ(-Math.PI * 0.35);
    g.translate(-0.03, 0, 0);
    if (side < 0) g.rotateZ(Math.PI);
    const m = new THREE.Mesh(g, matGill);
    m.position.copy(p).addScaledVector(n, 0.003);
    m.quaternion.copy(decalQuat(n));
    fish.add(m);
  });

  // ---------------------------------------------------------------- fins
  const col = (h: number) => new THREE.Color(h);
  const addFin = (g: THREE.BufferGeometry, pos: THREE.Vector3, axis: THREE.Vector3, normal: THREE.Vector3) => {
    const m = new THREE.Mesh(g, matFin);
    m.position.copy(pos);
    m.quaternion.copy(orient(axis, normal));
    fish.add(m);
  };

  // pectoral fins
  const pectGeo = fanGeo(0.075, 1.6, 6, 0.012, 0.1, 0.004, col(0xd9963a), col(0xf0c673), col(0xfbe6b0), col(0xb9712d));
  [1, -1].forEach((s) => {
    const dir = pectDirs[s === 1 ? 0 : 1];
    const p = surf(dir).addScaledVector(surfNormal(dir), -0.012);
    addFin(pectGeo, p, new V3(s * 0.5, 0.12, -0.86), new V3(s * 0.86, 0.35, 0.5));
  });

  // dorsal + anal fins
  const dorsalGeo = fanGeo(0.055, 1.2, 4, 0.018, 0.1, 0.004, col(0xc98a33), col(0xeab961), col(0xf8dc9a), col(0xa8602a));
  addFin(
    dorsalGeo,
    surf(dorsalDir).addScaledVector(surfNormal(dorsalDir), -0.012),
    new V3(0, 0.7, -0.7),
    new V3(1, 0, 0)
  );
  addFin(
    dorsalGeo,
    surf(analDir).addScaledVector(surfNormal(analDir), -0.012),
    new V3(0, -0.7, -0.7),
    new V3(1, 0, 0)
  );

  // tail peduncle
  {
    const g = new THREE.CylinderGeometry(0.028, 0.05, 0.13, 7, 1);
    g.rotateX(-Math.PI / 2); // top (narrow) end toward -Z
    g.scale(1, 1.35, 1);
    const ped = new THREE.Mesh(g, matGold);
    ped.position.set(0, 0, -0.205);
    fish.add(ped);
  }
  // caudal fin
  const tailGeo = fanGeo(0.092, 1.55, 7, 0.032, 0.09, 0.005, col(0xc5832f), col(0xe6b45c), col(0xf6d890), col(0x9c5a26));
  addFin(tailGeo, new V3(0, 0, -0.262), new V3(0, 0, -1), new V3(1, 0, 0));

  // ---------------------------------------------------------------- finish
  fish.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  fish.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(fish, true);
  const H = box.max.y - box.min.y;
  fish.position.y = -box.min.y - H * 0.004;
  fish.position.z = -(box.min.z + box.max.z) / 2;

  const root = new THREE.Group();
  root.name = "PufferfishRoot";
  root.add(fish);
  return root;
}
