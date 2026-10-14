```ts
import * as THREE from "three";

export const meta = {
  name: "Proud Stag Beetle on Mossy Log",
  description:
    "A chestnut stag beetle with branched reddish jaws, feathery elbowed antennae and spiny black legs gripping a mossy log, with a dewdrop on one antler.",
};

// Seeded generator so every build is identical.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V3 = [number, number, number];

export default function createModel(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();

  // ---- Materials (one per colour, shared) ----
  const mats = {
    chestnut: new THREE.MeshStandardMaterial({ color: "#8a3c1c", roughness: 0.12, metalness: 0.25 }),
    black: new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.35, metalness: 0.1 }),
    legs: new THREE.MeshStandardMaterial({ color: "#1c1a18", roughness: 0.5, metalness: 0.05 }),
    jaw: new THREE.MeshStandardMaterial({ color: "#7a3b22", roughness: 0.45, metalness: 0.05 }),
    bark: new THREE.MeshStandardMaterial({ color: "#5a4632", roughness: 0.9, metalness: 0 }),
    mossDark: new THREE.MeshStandardMaterial({ color: "#4f7a35", roughness: 0.95, metalness: 0 }),
    mossLight: new THREE.MeshStandardMaterial({ color: "#6b9444", roughness: 0.95, metalness: 0 }),
    dew: new THREE.MeshStandardMaterial({
      color: "#bfe9ff",
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.55,
    }),
    eye: new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.15, metalness: 0.2 }),
  };

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    return m;
  };

  const ellipsoid = (p: V3, s: V3, mat: THREE.Material, parent: THREE.Object3D = root, seg = 16) => {
    const m = mesh(new THREE.SphereGeometry(1, seg, Math.max(8, seg - 4)), mat, parent);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    return m;
  };

  const tubeThrough = (pts: V3[], r: number, mat: THREE.Material, segs = 24, radial = 6, parent: THREE.Object3D = root) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    return mesh(new THREE.TubeGeometry(curve, segs, r, radial, false), mat, parent);
  };

  const rodBetween = (a: V3, b: V3, r: number, mat: THREE.Material, radial = 6) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const m = mesh(new THREE.CylinderGeometry(r, r, len, radial), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  };

  const mirror = (pts: V3[]): V3[] => pts.map((p) => [-p[0], p[1], p[2]] as V3);

  // ---- Mossy log (top at y = 0.10, bottom on the floor) ----
  const LOG_R = 0.05;
  const LOG_Y = 0.05;
  const log = mesh(new THREE.CylinderGeometry(LOG_R, LOG_R * 1.06, 0.42, 14), mats.bark);
  log.geometry.rotateX(Math.PI / 2);
  log.position.set(0, LOG_Y, 0);

  // Bark knobs and a fungal shelf for character.
  for (let i = 0; i < 6; i++) {
    const z = -0.16 + i * 0.065 + (rand() - 0.5) * 0.02;
    const th = rand() * Math.PI * 2;
    const k = mesh(new THREE.IcosahedronGeometry(0.008, 0), mats.bark);
    k.position.set(Math.sin(th) * LOG_R * 0.95, LOG_Y + Math.cos(th) * LOG_R * 0.95, z);
    k.scale.set(1, 0.6, 1.4);
  }
  const shelf = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 8), mats.jaw);
  shelf.rotation.z = Math.PI / 2;
  shelf.position.set(0.05, 0.035, -0.12);

  // Moss clumps on the upper surface, sunk slightly into the bark.
  for (let i = 0; i < 34; i++) {
    const th = (rand() - 0.5) * Math.PI * 1.3; // mostly top, some flanks
    const z = -0.19 + rand() * 0.38;
    const r = 0.012 + rand() * 0.012;
    const m = mesh(new THREE.IcosahedronGeometry(r, 0), rand() > 0.5 ? mats.mossDark : mats.mossLight);
    m.position.set(Math.sin(th) * LOG_R * 0.98, LOG_Y + Math.cos(th) * LOG_R * 0.98, z);
    m.scale.set(1.2 + rand() * 0.4, 0.45 + rand() * 0.2, 1.1 + rand() * 0.5);
    m.rotation.y = rand() * Math.PI;
  }

  // ---- Body ----
  const BODY_Y = 0.12;

  // Head: black, slightly flattened, with glossy eyes.
  ellipsoid([0, BODY_Y + 0.005, 0.068], [0.03, 0.026, 0.03], mats.black);
  for (const s of [1, -1]) {
    ellipsoid([s * 0.022, BODY_Y + 0.008, 0.075], [0.008, 0.009, 0.007], mats.eye, root, 10);
  }

  // Thorax: black, with a rounded pronotum.
  ellipsoid([0, BODY_Y, 0.02], [0.032, 0.03, 0.036], mats.black);

  // Elytra: glossy chestnut wing cases meeting at the midline.
  for (const s of [1, -1]) {
    ellipsoid([s * 0.0155, BODY_Y + 0.002, -0.022], [0.0215, 0.032, 0.068], mats.chestnut, root, 20);
  }
  // Dark sutural seam where the wing cases meet.
  const seam = mesh(new THREE.BoxGeometry(0.003, 0.004, 0.13), mats.black);
  seam.position.set(0, BODY_Y + 0.031, -0.02);

  // Abdomen tip peeking out behind the elytra.
  ellipsoid([0, BODY_Y - 0.012, -0.096], [0.024, 0.02, 0.03], mats.black);

  // ---- Jaws (branched mandibles) ----
  const jawLeft: V3[] = [
    [0.012, BODY_Y + 0.004, 0.064],
    [0.02, BODY_Y + 0.006, 0.09],
    [0.03, BODY_Y + 0.004, 0.12],
    [0.026, BODY_Y, 0.146],
    [0.012, BODY_Y - 0.004, 0.166],
  ];
  const tineA: V3[] = [
    [0.03, BODY_Y + 0.004, 0.12],
    [0.044, BODY_Y + 0.014, 0.124],
    [0.05, BODY_Y + 0.022, 0.13],
  ];
  const tineB: V3[] = [
    [0.027, BODY_Y, 0.143],
    [0.04, BODY_Y - 0.008, 0.152],
    [0.046, BODY_Y - 0.012, 0.162],
  ];
  const tineC: V3[] = [
    [0.02, BODY_Y + 0.004, 0.095],
    [0.032, BODY_Y + 0.012, 0.094],
  ];

  for (const side of [jawLeft, tineA, tineB, tineC]) {
    tubeThrough(side, 0.0055, mats.jaw, 18, 6);
    tubeThrough(mirror(side), 0.0055, mats.jaw, 18, 6);
  }
  // Blunt tips on the branches.
  for (const p of [jawLeft[jawLeft.length - 1], tineA[tineA.length - 1], tineB[tineB.length - 1]]) {
    ellipsoid(p, [0.0065, 0.0065, 0.0065], mats.jaw, root, 8);
    ellipsoid([-p[0], p[1], p[2]], [0.0065, 0.0065, 0.0065], mats.jaw, root, 8);
  }

  // Dewdrop clinging to the upper tine of the left antler.
  const dew = mesh(new THREE.SphereGeometry(0.0062, 14, 10), mats.dew);
  dew.position.set(0.05, BODY_Y + 0.026, 0.13);
  dew.scale.set(1, 1.15, 1);
  const dewHi = mesh(new THREE.SphereGeometry(0.0016, 6, 4), mats.dew);
  dewHi.position.set(0.053, BODY_Y + 0.032, 0.1275);

  // ---- Antennae: elbowed, with feathery club tips ----
  const antennaLeft: V3[] = [
    [0.012, BODY_Y + 0.024, 0.06],
    [0.02, BODY_Y + 0.04, 0.08],
    [0.03, BODY_Y + 0.046, 0.108],
    [0.046, BODY_Y + 0.042, 0.128],
  ];
  for (const pts of [antennaLeft, mirror(antennaLeft)]) {
    tubeThrough(pts, 0.0028, mats.legs, 16, 5);
    const tip = pts[pts.length - 1];
    const dir = new THREE.Vector3(tip[0] - pts[2][0], tip[1] - pts[2][1], tip[2] - pts[2][2]).normalize();
    const side = Math.sign(tip[0]) || 1;
    // Fan of lamellae around the tip.
    for (let k = 0; k < 6; k++) {
      const a = (k / 5 - 0.5) * 1.6;
      const plate = mesh(new THREE.SphereGeometry(1, 8, 6), mats.black);
      plate.scale.set(0.0022, 0.0013, 0.0105);
      plate.position.set(tip[0] + side * 0.002 * Math.cos(a), tip[1] + 0.002 * Math.sin(a) + 0.001, tip[2] + 0.006);
      plate.rotation.set(0, side * a * 0.6, a * 0.8);
      void dir;
    }
  }

  // ---- Legs: three pairs, black and spiny, gripping the log ----
  const legZ = [0.035, 0.0, -0.035];
  const footZ = [0.045, 0.0, -0.045];
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const z = legZ[i];
      const fz = z + footZ[i];
      const C: V3 = [s * 0.022, BODY_Y - 0.006, z];
      const F: V3 = [s * 0.036, 0.0857, fz];
      const K: V3 = [s * 0.074, 0.1, z + (fz - z) * 0.5];

      ellipsoid(C, [0.009, 0.008, 0.009], mats.legs, root, 10);
      tubeThrough([C, K, F], 0.0045, mats.legs, 14, 5);

      // Spines along the tibia, angled outward and backward.
      for (const t of [0.3, 0.55, 0.8]) {
        const px = K[0] + (F[0] - K[0]) * t;
        const py = K[1] + (F[1] - K[1]) * t;
        const pz = K[2] + (F[2] - K[2]) * t;
        const spineDir = new THREE.Vector3(s * (0.6 + rand() * 0.4), 0.3 + rand() * 0.5, (rand() - 0.5) * 0.8).normalize();
        const spine = mesh(new THREE.ConeGeometry(0.0016, 0.009, 4), mats.legs);
        spine.position.set(px, py, pz).addScaledVector(spineDir, 0.0045);
        spine.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), spineDir);
      }
      // Small claw-tip at the foot.
      ellipsoid([F[0], F[1] - 0.001, F[2]], [0.0045, 0.0035, 0.0045], mats.legs, root, 8);
    }
  }

  // Scatter a few stray moss flecks on the beetle's footing for integration.
  for (let i = 0; i < 4; i++) {
    const z = -0.1 + rand() * 0.2;
    const m = mesh(new THREE.IcosahedronGeometry(0.009, 0), mats.mossLight);
    m.position.set((rand() - 0.5) * 0.04, LOG_Y + LOG_R - 0.002, z);
    m.scale.set(1.3, 0.5, 1.2);
  }

  return root;
}
```