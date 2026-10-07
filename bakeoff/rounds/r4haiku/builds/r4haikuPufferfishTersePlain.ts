import * as THREE from "three";

export const meta = {
  name: "Pufferfish",
  description:
    "A puffed-up pufferfish resting on the seabed: mustard back, cream belly, dark spots, a bristle of spines, big orange-ringed eyes and fan-shaped fins.",
};

// Seeded PRNG (mulberry32) so every build is identical.
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

// Body is an ellipsoid, in metres. The front of the fish is +Z.
const RX = 0.105; // half width
const RY = 0.11; // half height
const RZ = 0.13; // half length
const CY = RY; // body centre height, so the belly rests on y = 0

const UP = new THREE.Vector3(0, 1, 0);
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// d is a unit direction in ellipsoid parameter space.
function surfacePoint(d: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(d.x * RX, CY + d.y * RY, d.z * RZ);
}

function surfaceNormal(d: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(d.x / RX, d.y / RY, d.z / RZ).normalize();
}

// side +1 = left (+X), -1 = right (-X)
function eyeDir(side: number): THREE.Vector3 {
  return new THREE.Vector3(side * 0.55, 0.35, 0.75).normalize();
}

type Ray = [number, number, number, number];

// A fin is drawn in 2D: x runs back from the body (negative = towards the tail), y is up.
// The group turns it so the fin lies in the side plane, with its face along X.
function makeFin(
  shape: THREE.Shape,
  rays: Ray[],
  fanMat: THREE.Material,
  rayMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), fanMat));
  for (const [x0, y0, x1, y1] of rays) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ray = new THREE.Mesh(new THREE.BoxGeometry(len, 0.0035, 0.004), rayMat);
    ray.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
    ray.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    g.add(ray);
  }
  g.rotation.y = -Math.PI / 2;
  return g;
}

export default function createPufferfish(): THREE.Object3D {
  const rnd = mulberry32(2024);

  const mat = {
    back: new THREE.MeshStandardMaterial({ color: 0xe3a92f, roughness: 0.55 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xf7eed3, roughness: 0.6 }),
    spot: new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.7 }),
    spine: new THREE.MeshStandardMaterial({ color: 0xf2e6c0, roughness: 0.45 }),
    white: new THREE.MeshStandardMaterial({ color: 0xfbfbf6, roughness: 0.3 }),
    iris: new THREE.MeshStandardMaterial({ color: 0xe0582a, roughness: 0.4 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.2 }),
    fin: new THREE.MeshStandardMaterial({
      color: 0xec8c3e,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
    finRay: new THREE.MeshStandardMaterial({ color: 0xb5521e, roughness: 0.5 }),
    beak: new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.6 }),
    teeth: new THREE.MeshStandardMaterial({ color: 0xf3ead2, roughness: 0.5 }),
  };

  const root = new THREE.Group();
  const eyeDirs = [eyeDir(1), eyeDir(-1)];

  // ---- Body and belly ----
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat.back);
  body.scale.set(RX, RY, RZ);
  body.position.y = CY;

  // Pale belly: the lower cap of a slightly larger copy of the body.
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.44),
    mat.belly,
  );
  belly.scale.set(RX * 1.012, RY * 1.012, RZ * 1.012);
  belly.position.y = CY;
  root.add(body, belly);

  // ---- Spines: short cones spread over the skin (Fibonacci sphere, jittered) ----
  const spineXf: THREE.Matrix4[] = [];
  const NS = 300;
  for (let i = 0; i < NS; i++) {
    const y0 = 1 - (2 * (i + 0.5)) / NS;
    const r0 = Math.sqrt(1 - y0 * y0);
    const th = GOLDEN * i + (rnd() - 0.5) * 0.25;
    const d = new THREE.Vector3(Math.cos(th) * r0, y0, Math.sin(th) * r0);
    d.y += (rnd() - 0.5) * 0.04;
    d.normalize();

    // Keep the snout, the eyes and the underside clear of spines.
    if (d.z > 0.72 || d.z < -0.86 || d.y < -0.7) continue;
    if (eyeDirs.some((e) => e.dot(d) > 0.8)) continue;

    const sc = 0.8 + rnd() * 0.4;
    const h = 0.03 * sc;
    const p = surfacePoint(d);
    const n = surfaceNormal(d);
    const c = p.addScaledVector(n, h / 2 - 0.005); // base sinks slightly into the skin
    const q = new THREE.Quaternion().setFromUnitVectors(UP, n);
    spineXf.push(
      new THREE.Matrix4().compose(c, q, new THREE.Vector3(0.0065, h, 0.0065)),
    );
  }
  const spines = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1, 1, 5, 1),
    mat.spine,
    spineXf.length,
  );
  spineXf.forEach((m, i) => spines.setMatrixAt(i, m));
  spines.instanceMatrix.needsUpdate = true;
  root.add(spines);

  // ---- Dark spots: flat discs scattered over the back and flanks ----
  const spotXf: THREE.Matrix4[] = [];
  const spotPts: THREE.Vector3[] = [];
  for (let tries = 0; tries < 3000 && spotXf.length < 30; tries++) {
    const z = rnd() * 2 - 1;
    const phi = rnd() * Math.PI * 2;
    const rr = Math.sqrt(1 - z * z);
    const d = new THREE.Vector3(Math.cos(phi) * rr, z, Math.sin(phi) * rr);
    if (d.y < -0.1 || d.z > 0.45 || d.z < -0.9) continue;
    if (eyeDirs.some((e) => e.dot(d) > 0.6)) continue;
    const p = surfacePoint(d);
    if (spotPts.some((o) => o.distanceTo(p) < 0.034)) continue;
    spotPts.push(p);
    const n = surfaceNormal(d);
    const sr = 0.011 + rnd() * 0.008;
    const c = p.clone().addScaledVector(n, 0.0004);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, n);
    spotXf.push(
      new THREE.Matrix4().compose(c, q, new THREE.Vector3(sr, 0.003, sr)),
    );
  }
  const spots = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    mat.spot,
    spotXf.length,
  );
  spotXf.forEach((m, i) => spots.setMatrixAt(i, m));
  spots.instanceMatrix.needsUpdate = true;
  root.add(spots);

  // ---- Big bulging eyes with orange iris ----
  const buildEye = (side: number): THREE.Group => {
    const g = new THREE.Group();
    const d = eyeDir(side);
    const n = surfaceNormal(d);
    const eyeC = surfacePoint(d).addScaledVector(n, 0.015);
    const at = (dist: number) => eyeC.clone().addScaledVector(n, dist);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), mat.white);
    ball.position.copy(eyeC);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), mat.iris);
    iris.position.copy(at(0.018));

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 10, 8), mat.pupil);
    pupil.position.copy(at(0.03));

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 4), mat.white);
    glint.position.copy(at(0.0395)).add(new THREE.Vector3(0, 0.0045, 0));

    g.add(ball, iris, pupil, glint);
    return g;
  };
  root.add(buildEye(1), buildEye(-1));

  // ---- Pectoral fins: fan-shaped, angled out from the flanks ----
  const pecShape = new THREE.Shape();
  pecShape.moveTo(0, 0.018);
  pecShape.quadraticCurveTo(-0.025, 0.05, -0.06, 0.03);
  pecShape.quadraticCurveTo(-0.07, 0.0, -0.058, -0.028);
  pecShape.quadraticCurveTo(-0.03, -0.012, 0, -0.012);
  pecShape.closePath();
  const pecRays: Ray[] = [
    [0, 0.004, -0.05, 0.028],
    [0, 0.004, -0.062, 0.004],
    [0, 0.002, -0.052, -0.02],
  ];
  for (const side of [1, -1]) {
    const w = new THREE.Group();
    w.add(makeFin(pecShape, pecRays, mat.fin, mat.finRay));
    w.position.set(side * 0.095, 0.095, 0.03);
    w.rotation.z = -0.35 * side;
    root.add(w);
  }

  // ---- Dorsal fin: small, swept back, rising out of the top of the back ----
  const dorShape = new THREE.Shape();
  dorShape.moveTo(0, 0);
  dorShape.quadraticCurveTo(-0.01, 0.075, -0.035, 0.085);
  dorShape.quadraticCurveTo(-0.062, 0.06, -0.07, 0);
  dorShape.closePath();
  const dorsal = makeFin(
    dorShape,
    [
      [-0.006, 0, -0.03, 0.066],
      [-0.012, 0, -0.052, 0.04],
    ],
    mat.fin,
    mat.finRay,
  );
  dorsal.position.set(0, 0.16, -0.02);
  root.add(dorsal);

  // ---- Anal fin: under the rear of the body ----
  const anaShape = new THREE.Shape();
  anaShape.moveTo(0, 0);
  anaShape.quadraticCurveTo(-0.02, -0.012, -0.04, -0.04);
  anaShape.quadraticCurveTo(-0.05, -0.03, -0.056, 0);
  anaShape.closePath();
  const anal = makeFin(
    anaShape,
    [
      [-0.005, 0, -0.036, -0.034],
      [-0.02, 0, -0.046, -0.022],
    ],
    mat.fin,
    mat.finRay,
  );
  anal.position.set(0, 0.085, -0.07);
  root.add(anal);

  // ---- Peduncle (tail stalk) ----
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.018, 0.045, 10), mat.back);
  ped.rotation.x = Math.PI / 2; // wide end towards the body
  ped.position.set(0, 0.1, -0.14);
  root.add(ped);

  // ---- Caudal (tail) fin: rounded fan with rays ----
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, -0.012);
  tailShape.quadraticCurveTo(-0.022, -0.012, -0.04, -0.05);
  tailShape.quadraticCurveTo(-0.06, 0, -0.04, 0.05);
  tailShape.quadraticCurveTo(-0.022, 0.012, 0, 0.012);
  tailShape.closePath();
  const tail = makeFin(
    tailShape,
    [
      [-0.004, 0, -0.04, 0.038],
      [-0.004, 0, -0.05, 0],
      [-0.004, 0, -0.04, -0.038],
    ],
    mat.fin,
    mat.finRay,
  );
  tail.position.set(0, 0.1, -0.16);
  root.add(tail);

  // ---- Beak: dark upper beak, cream lower teeth plate ----
  const beakTop = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.028, 6, 1), mat.beak);
  beakTop.rotation.x = Math.PI / 2; // apex towards +Z
  beakTop.position.set(0, CY - 0.012, 0.124);

  const beakLow = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.022, 6, 1), mat.teeth);
  beakLow.rotation.x = Math.PI / 2;
  beakLow.position.set(0, CY - 0.028, 0.12);
  root.add(beakTop, beakLow);

  return root;
}
