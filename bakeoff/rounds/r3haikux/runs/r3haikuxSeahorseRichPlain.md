```ts
import * as THREE from "three";

export const meta = {
  name: "Lined Yellow Seahorse",
  description:
    "A sunny-yellow seahorse with thin dark ridge lines and white freckles, a coral crown of spikes, a translucent dorsal fin and big curious eyes, its tail coiled around a seagrass strand.",
};

type Vec = THREE.Vector3;
type Mat = THREE.Material;
type Joint = { p: Vec; r: number; t: Vec };

const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const V = (x: number, y: number, z: number): Vec => new THREE.Vector3(x, y, z);

// Small seeded PRNG (mulberry32) so every build is identical.
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

function put(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: Mat, p: Vec): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(p);
  parent.add(m);
  return m;
}

function ball(parent: THREE.Object3D, p: Vec, r: number, mat: Mat): THREE.Mesh {
  return put(parent, new THREE.SphereGeometry(r, 8, 6), mat, p);
}

// Cylinder from a (radius ra) to b (radius rb).
function strut(
  parent: THREE.Object3D,
  a: Vec,
  b: Vec,
  ra: number,
  rb: number,
  mat: Mat,
  sides = 8,
): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const mid = new THREE.Vector3().copy(a).addScaledVector(d, 0.5);
  const m = put(parent, new THREE.CylinderGeometry(rb, ra, len, sides, 1, false), mat, mid);
  m.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
  return m;
}

// Thin ring lying across a body at p, facing along tangent t.
function hoop(parent: THREE.Object3D, p: Vec, t: Vec, r: number, tube: number, mat: Mat): THREE.Mesh {
  const m = put(parent, new THREE.TorusGeometry(r, tube, 5, 14), mat, p);
  m.quaternion.setFromUnitVectors(FWD, t.clone().normalize());
  return m;
}

// Cone spike with its base at `base`, pointing along `dir`.
function spike(
  parent: THREE.Object3D,
  base: Vec,
  dir: Vec,
  h: number,
  r: number,
  mat: Mat,
  sides = 5,
): THREE.Mesh {
  const d = dir.clone().normalize();
  const m = put(parent, new THREE.ConeGeometry(r, h, sides), mat, base.clone().addScaledVector(d, h / 2));
  m.quaternion.setFromUnitVectors(UP, d);
  return m;
}

function tangentsOf(ps: Vec[]): Vec[] {
  return ps.map((_, i) => {
    const a = ps[Math.max(0, i - 1)];
    const b = ps[Math.min(ps.length - 1, i + 1)];
    return new THREE.Vector3().subVectors(b, a).normalize();
  });
}

// A chain of faceted segments with a joint ball at each node and thin dark rings.
function sausage(
  parent: THREE.Object3D,
  js: Joint[],
  mat: Mat,
  lineMat: Mat,
  ringEvery: number,
  sides: number,
) {
  for (let i = 0; i < js.length - 1; i++) {
    strut(parent, js[i].p, js[i + 1].p, js[i].r, js[i + 1].r, mat, sides);
  }
  for (const j of js) ball(parent, j.p, j.r, mat);
  js.forEach((j, i) => {
    if (i % ringEvery === 0) hoop(parent, j.p, j.t, j.r + 0.0012, 0.0014, lineMat);
  });
}

// A small white dot pressed onto the surface of a tube-like segment.
function freckleOn(
  parent: THREE.Object3D,
  p: Vec,
  t: Vec,
  r: number,
  geo: THREE.BufferGeometry,
  mat: Mat,
  rand: () => number,
) {
  const tn = t.clone().normalize();
  const aux = Math.abs(tn.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
  const n = new THREE.Vector3().crossVectors(tn, aux).normalize();
  const b = new THREE.Vector3().crossVectors(tn, n).normalize();
  const phi = rand() * Math.PI * 2;
  const dir = new THREE.Vector3().addScaledVector(n, Math.cos(phi)).addScaledVector(b, Math.sin(phi));
  put(parent, geo, mat, p.clone().addScaledVector(dir, r + 0.0005));
}

export default function buildSeahorse(): THREE.Object3D {
  const rand = mulberry32(90210);
  const root = new THREE.Group();
  root.name = "lined-seahorse";

  const M = {
    body: new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.5 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xfff2b3, roughness: 0.55 }),
    spine: new THREE.MeshStandardMaterial({ color: 0xf0a020, roughness: 0.45 }),
    line: new THREE.MeshStandardMaterial({ color: 0x5b3418, roughness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    crown: new THREE.MeshStandardMaterial({ color: 0xff7a3d, roughness: 0.45 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x17110d, roughness: 0.3 }),
    fin: new THREE.MeshStandardMaterial({
      color: 0xfff6d2,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.35,
    }),
    finRay: new THREE.MeshStandardMaterial({ color: 0xffe08a, roughness: 0.5 }),
    grassA: new THREE.MeshStandardMaterial({ color: 0x6cc257, roughness: 0.6 }),
    grassB: new THREE.MeshStandardMaterial({ color: 0x3a8f3e, roughness: 0.6 }),
    sand: new THREE.MeshStandardMaterial({ color: 0xe9d29b, roughness: 0.9 }),
  };

  const freckleGeo = new THREE.SphereGeometry(0.0034, 6, 4);

  // ---------- 1. Torso: ridged chain of bony rings along a curved spine ----------
  const torsoNodes: [number, number, number][] = [
    // [y, z, radius]
    [0.201, 0.014, 0.018],
    [0.184, 0.024, 0.024],
    [0.162, 0.032, 0.029],
    [0.138, 0.035, 0.031],
    [0.114, 0.031, 0.029],
    [0.092, 0.023, 0.026],
    [0.07, 0.013, 0.022],
    [0.051, 0.003, 0.018],
    [0.038, -0.005, 0.0145],
  ];
  const spineCurve = new THREE.CatmullRomCurve3(torsoNodes.map(([y, z]) => V(0, y, z)));
  const NT = 14;
  const torsoPts: Vec[] = [];
  const torsoR: number[] = [];
  for (let i = 0; i <= NT; i++) {
    const u = i / NT;
    torsoPts.push(spineCurve.getPoint(u));
    const f = u * (torsoNodes.length - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(i0 + 1, torsoNodes.length - 1);
    const k = f - i0;
    torsoR.push(torsoNodes[i0][2] * (1 - k) + torsoNodes[i1][2] * k);
  }
  const torsoT = tangentsOf(torsoPts);
  const torso: Joint[] = torsoPts.map((p, i) => ({ p, r: torsoR[i], t: torsoT[i] }));
  sausage(root, torso, M.body, M.line, 1, 8);

  // Cream belly plate on the chest
  const belly = put(root, new THREE.SphereGeometry(1, 10, 8), M.belly, V(0, 0.13, 0.056));
  belly.scale.set(0.0135, 0.036, 0.011);

  // Dorsal spines along the back (skipping the fin root)
  const BACK = V(0, 0, -1);
  torso.forEach((n, i) => {
    if (i === 0 || i === NT) return;
    if (n.p.y > 0.075 && n.p.y < 0.14) return;
    const nb = BACK.clone().addScaledVector(n.t, -BACK.dot(n.t)).normalize();
    const up = n.t.clone().negate();
    const dir = nb.clone().multiplyScalar(0.85).addScaledVector(up, 0.5);
    spike(
      root,
      n.p.clone().addScaledVector(nb, n.r * 0.8),
      dir,
      n.p.y > 0.15 ? 0.014 : 0.011,
      0.0042,
      M.spine,
      4,
    );
  });

  // Side knobs
  for (const s of [-1, 1]) {
    for (let i = 2; i < NT - 1; i += 2) {
      const n = torso[i];
      spike(root, n.p.clone().add(V(s * n.r * 0.8, 0, 0)), V(s, 0.25, -0.2), 0.009, 0.0032, M.spine, 4);
    }
  }

  // Torso freckles
  for (let k = 0; k < 13; k++) {
    const i = 1 + Math.floor(rand() * (NT - 1));
    const n = torso[i];
    freckleOn(root, n.p, n.t, n.r, freckleGeo, M.white, rand);
  }

  // ---------- 2. Tail: segmented curl that wraps the seagrass strand ----------
  const B = V(0.035, 0, -0.07); // seagrass strand centre
  const coilTop = 0.075;
  const coilBot = 0.027;
  const turns = 1.55;
  const th0 = -0.52;
  const tailPts: Vec[] = [];
  const tailR: number[] = [];
  const addTail = (p: Vec, r: number) => {
    tailPts.push(p);
    tailR.push(r);
  };
  addTail(torsoPts[NT].clone(), 0.0145);
  addTail(V(0.01, 0.031, -0.03), 0.0125);
  addTail(V(0.016, 0.05, -0.04), 0.0115);
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const th = th0 + t * turns * Math.PI * 2;
    const R = 0.0195 - 0.0015 * t;
    addTail(
      V(B.x + R * Math.sin(th), coilTop - (coilTop - coilBot) * t, B.z + R * Math.cos(th)),
      0.0095 - 0.003 * t,
    );
  }
  const thEnd = th0 + turns * Math.PI * 2;
  for (let j = 1; j <= 6; j++) {
    const s = j / 6;
    const th = thEnd + s * 1.2;
    const R = 0.018 + 0.008 * s;
    addTail(V(B.x + R * Math.sin(th), coilBot - 0.007 * s, B.z + R * Math.cos(th)), 0.0065 - 0.0018 * s);
  }
  const tailT = tangentsOf(tailPts);
  const tail: Joint[] = tailPts.map((p, i) => ({ p, r: tailR[i], t: tailT[i] }));
  sausage(root, tail, M.body, M.line, 2, 8);

  for (let k = 0; k < 6; k++) {
    const i = 3 + Math.floor(rand() * (tail.length - 5));
    freckleOn(root, tail[i].p, tail[i].t, tail[i].r, freckleGeo, M.white, rand);
  }

  // ---------- 3. Head, snout, eyes and crown ----------
  const H = V(0, 0.232, 0.026);
  const HR = [0.0285, 0.0285, 0.0336];
  const head = put(root, new THREE.SphereGeometry(0.03, 14, 10), M.body, H);
  head.scale.set(0.95, 0.95, 1.12);

  // Long tube snout angled forward and down
  const snB = V(0, 0.224, 0.042);
  const snT = V(0, 0.2, 0.118);
  strut(root, snB, snT, 0.0105, 0.0078, M.body, 8);
  const sd = snT.clone().sub(snB).normalize();
  hoop(root, snB.clone().lerp(snT, 0.35), sd, 0.0097, 0.0012, M.line);
  hoop(root, snB.clone().lerp(snT, 0.7), sd, 0.0086, 0.0012, M.line);
  put(root, new THREE.SphereGeometry(0.0046, 8, 6), M.pupil, snT.clone().addScaledVector(sd, -0.0012));

  // Big curious eyes with pupil domes and glints
  const eyeGeo = new THREE.SphereGeometry(0.0135, 12, 9);
  const pupilGeo = new THREE.SphereGeometry(0.0072, 10, 8);
  const glintGeo = new THREE.SphereGeometry(0.0023, 6, 5);
  for (const s of [-1, 1]) {
    const ec = V(s * 0.0235, 0.238, 0.04);
    put(root, eyeGeo, M.white, ec);
    const dir = V(s * 0.75, 0.12, 0.66).normalize();
    const pc = ec.clone().addScaledVector(dir, 0.0118);
    put(root, pupilGeo, M.pupil, pc);
    const gc = pc.clone().addScaledVector(dir, 0.006).add(V(-s * 0.0013, 0.0017, 0));
    put(root, glintGeo, M.white, gc);
  }

  // Coral crown of spikes radiating from the top of the head toward the back
  const crownSpecs = [
    { a: 0.02, h: 0.018, r: 0.0042 },
    { a: 0.24, h: 0.024, r: 0.005 },
    { a: 0.46, h: 0.027, r: 0.0054 },
    { a: 0.68, h: 0.024, r: 0.005 },
    { a: 0.9, h: 0.017, r: 0.0043 },
  ];
  for (const c of crownSpecs) {
    const base = V(0, H.y + HR[1] * Math.cos(c.a) - 0.002, H.z - HR[2] * Math.sin(c.a));
    const dir = V(0, Math.cos(c.a + 0.3), -Math.sin(c.a + 0.3));
    spike(root, base, dir, c.h, c.r, M.crown, 5);
  }

  // Head freckles (kept off the front face so the eyes stay clear)
  let hf = 0;
  while (hf < 3) {
    const d = V(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    const l2 = d.lengthSq();
    if (l2 < 0.05 || l2 > 1) continue;
    d.normalize();
    if (d.z > 0.2) continue;
    put(root, freckleGeo, M.white, V(H.x + d.x * HR[0], H.y + d.y * HR[1], H.z + d.z * HR[2]));
    hf++;
  }

  // ---------- 4. Fins ----------
  // Translucent dorsal fan with scalloped edge and a gentle flutter
  const FY0 = 0.084;
  const ZB0 = -0.002;
  const FH = 0.05;
  const FL = 0.044;
  const FB = 0.004;
  const NF = 4;
  const zbOf = (v: number) => ZB0 + 0.1 * v;
  const mapFin = (u: number, v: number) => V(0, FY0 + v, zbOf(v) - u);

  const fan = new THREE.Shape();
  fan.moveTo(0, 0);
  fan.lineTo(0, FH);
  const Dx = FL;
  const Dy = FB - FH;
  const nl = Math.hypot(-Dy, Dx);
  const tips: { x: number; y: number }[] = [{ x: 0, y: FH }];
  for (let k = 0; k < NF; k++) {
    const x0 = Dx * (k / NF);
    const y0 = FH + Dy * (k / NF);
    const x1 = Dx * ((k + 1) / NF);
    const y1 = FH + Dy * ((k + 1) / NF);
    const cx = (x0 + x1) / 2 + (-Dy / nl) * 0.0075;
    const cy = (y0 + y1) / 2 + (Dx / nl) * 0.0075;
    fan.quadraticCurveTo(cx, cy, x1, y1);
    tips.push({ x: x1, y: y1 });
  }
  fan.lineTo(0, 0);

  const finGeo = new THREE.ShapeGeometry(fan, 8);
  const fp = finGeo.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < fp.count; i++) {
    const u = fp.getX(i);
    const v = fp.getY(i);
    const flutter = 0.005 * Math.sin(u * 70 + v * 30) * Math.min(1, u / 0.015);
    fp.setXYZ(i, flutter, FY0 + v, zbOf(v) - u);
  }
  finGeo.computeVertexNormals();
  root.add(new THREE.Mesh(finGeo, M.fin));

  // Fine fin rays fanning from the fin root
  const pivot = mapFin(0, 0.016);
  for (const t of tips) {
    strut(root, pivot, mapFin(t.x, t.y), 0.0008, 0.0008, M.finRay, 4);
  }

  // Small translucent pectoral fins on the chest sides
  for (const s of [-1, 1]) {
    const pf = new THREE.Mesh(new THREE.CircleGeometry(1, 12), M.fin);
    pf.scale.set(0.0125, 0.0075, 1);
    pf.rotation.y = (s * Math.PI) / 2;
    pf.position.set(s * 0.031, 0.15, 0.018);
    root.add(pf);
  }

  // ---------- 5. Seagrass tuft and sandy base ----------
  const blade = (base: Vec, h: number, lean: Vec, mat: Mat) => {
    const g = new THREE.Group();
    g.position.copy(base);
    g.quaternion.setFromUnitVectors(UP, V(lean.x, 1, lean.z).normalize());
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0062, h, 4, 1, false), mat);
    m.position.y = h / 2;
    m.scale.set(1.45, 1, 0.75); // flatten into a ribbon
    g.add(m);
    root.add(g);
  };
  blade(B, 0.3, V(0, 0, 0), M.grassA); // the strand the tail grips
  blade(V(0.075, 0, -0.035), 0.2, V(0.18, 0, -0.05), M.grassB);
  blade(V(-0.045, 0, -0.085), 0.24, V(-0.12, 0, -0.07), M.grassB);
  blade(V(0.09, 0, -0.1), 0.13, V(0.22, 0, -0.1), M.grassA);
  blade(V(-0.012, 0, -0.14), 0.17, V(-0.05, 0, -0.2), M.grassA);

  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    M.sand,
  );
  mound.scale.y = 0.12;
  mound.position.set(0.01, 0, -0.05);
  root.add(mound);

  root.scale.setScalar(0.85);
  return root;
}
```