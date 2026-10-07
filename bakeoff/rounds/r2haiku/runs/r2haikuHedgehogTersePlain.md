```ts
import * as THREE from "three";

export const meta = {
  name: "Hedgehog",
  description: "A stylized hedgehog in a rest pose: a domed body bristling with instanced spines, a cream face, dark legs, and small ears, eyes and nose.",
};

// Small seeded PRNG (mulberry32) so every build is identical.
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

export default function createHedgehog(): THREE.Object3D {
  const rand = makeRng(20240611);
  const group = new THREE.Group();

  // Shared materials, one per colour.
  const furMat = new THREE.MeshStandardMaterial({ color: "#3e2c1c", roughness: 0.9 });
  const faceMat = new THREE.MeshStandardMaterial({ color: "#d9c4a0", roughness: 0.8 });
  const legMat = new THREE.MeshStandardMaterial({ color: "#3b2c20", roughness: 0.85 });
  const earMat = new THREE.MeshStandardMaterial({ color: "#6b4a3d", roughness: 0.7 });
  const blackMat = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.4 });
  const spineMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6 });

  // Body: a squashed ellipsoid with the spines on top.
  const rx = 0.09, ry = 0.078, rz = 0.115, cy = 0.09;
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), furMat);
  body.scale.set(rx, ry, rz);
  body.position.set(0, cy, 0);
  group.add(body);

  // Head: cream, sitting slightly forward and low.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.048, 14, 10), faceMat);
  head.position.set(0, 0.072, 0.135);
  group.add(head);

  // Snout: a cone pointing along +Z.
  const snoutGeo = new THREE.ConeGeometry(0.02, 0.05, 8);
  snoutGeo.rotateX(Math.PI / 2);
  const snout = new THREE.Mesh(snoutGeo, faceMat);
  snout.position.set(0, 0.07, 0.18);
  group.add(snout);

  // Nose, eyes.
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), blackMat);
  nose.position.set(0, 0.072, 0.199);
  group.add(nose);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 8, 6), blackMat);
    eye.position.set(sx * 0.021, 0.086, 0.176);
    group.add(eye);

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), earMat);
    ear.scale.set(1, 1.3, 0.4);
    ear.position.set(sx * 0.036, 0.108, 0.122);
    group.add(ear);
  }

  // Legs and feet.
  const legGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.05, 8);
  const footGeo = new THREE.SphereGeometry(0.02, 8, 6);
  for (const sx of [-1, 1]) {
    for (const z of [0.07, -0.08]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(sx * 0.055, 0.025, z);
      group.add(leg);

      const foot = new THREE.Mesh(footGeo, legMat);
      foot.scale.set(1, 0.5, 1.3);
      foot.position.set(sx * 0.055, 0.01, z + 0.012);
      group.add(foot);
    }
  }

  // Spines: instanced cones placed on the upper body, leaning back toward the tail.
  const spineCount = 900;
  const spineGeo = new THREE.ConeGeometry(0.0055, 1, 5);
  spineGeo.translate(0, 0.5, 0); // base sits at the origin, tip points +Y

  const placements: { p: THREE.Vector3; d: THREE.Vector3; len: number; color: THREE.Color }[] = [];
  const browns = ["#5b4128", "#7a5a36", "#3e2c1c", "#6a4c2e"];
  const cream = "#e8d9b5";

  for (let i = 0; i < spineCount; i++) {
    // Fibonacci sphere direction.
    const t = (i + 0.5) / spineCount;
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(theta);

    // Skip the belly and the face.
    if (ny < -0.15 || nz > 0.5) continue;

    // Project onto the ellipsoid surface and take its normal.
    const s = 1 / Math.sqrt((nx / rx) ** 2 + (ny / ry) ** 2 + (nz / rz) ** 2);
    const px = nx * s, py = ny * s, pz = nz * s;
    const gx = px / (rx * rx), gy = py / (ry * ry), gz = pz / (rz * rz);
    const normal = new THREE.Vector3(gx, gy, gz).normalize();

    // Lean backward and jitter so the coat looks ruffled.
    const dir = new THREE.Vector3(
      normal.x + (rand() - 0.5) * 0.3,
      normal.y + 0.15 + (rand() - 0.5) * 0.2,
      normal.z - 0.55 + (rand() - 0.5) * 0.3
    ).normalize();

    const len = 0.03 + rand() * 0.016;
    const colorHex = rand() < 0.12 ? cream : browns[Math.floor(rand() * browns.length)];

    placements.push({
      p: new THREE.Vector3(px, cy + py, pz).addScaledVector(normal, 0.002),
      d: dir,
      len,
      color: new THREE.Color(colorHex),
    });
  }

  const spines = new THREE.InstancedMesh(spineGeo, spineMat, placements.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const scale = new THREE.Vector3();
  placements.forEach((sp, i) => {
    q.setFromUnitVectors(up, sp.d);
    scale.set(1, sp.len, 1);
    m.compose(sp.p, q, scale);
    spines.setMatrixAt(i, m);
    spines.setColorAt(i, sp.color);
  });
  spines.instanceMatrix.needsUpdate = true;
  if (spines.instanceColor) spines.instanceColor.needsUpdate = true;
  group.add(spines);

  return group;
}
```