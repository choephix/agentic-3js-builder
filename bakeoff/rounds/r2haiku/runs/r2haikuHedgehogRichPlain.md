```ts
import * as THREE from "three";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an autumn evening walk, chestnut spines tipped in cream, with a red maple leaf stuck on its back.",
};

function mulberry32(seed: number) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildHedgehog(): THREE.Object3D {
  const rnd = mulberry32(2024);
  const root = new THREE.Group();

  // ---- Materials (one per colour, shared) ----
  const chestnut = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.8 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf3e3c3, roughness: 0.6 });
  const fawn = new THREE.MeshStandardMaterial({ color: 0xd9b58a, roughness: 0.75 });
  const black = new THREE.MeshStandardMaterial({ color: 0x151110, roughness: 0.25 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xf2a7b0, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0xb8261c,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const veinMat = new THREE.MeshStandardMaterial({ color: 0x5c1410, roughness: 0.6 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.9 });

  // ---- Body: plump ellipsoid ----
  const BODY_R = 0.1;
  const BODY_SY = 0.85;
  const BODY_SZ = 1.25;
  const BODY_C = new THREE.Vector3(0, 0.095, -0.02);

  const body = new THREE.Mesh(new THREE.SphereGeometry(BODY_R, 24, 16), chestnut);
  body.scale.set(1, BODY_SY, BODY_SZ);
  body.position.copy(BODY_C);
  root.add(body);

  // ---- Spines: fibonacci-distributed on the dome, two instanced layers ----
  const spineGeo = new THREE.ConeGeometry(0.009, 1, 5);
  spineGeo.translate(0, 0.5, 0);
  const tipGeo = new THREE.ConeGeometry(0.0038, 0.35, 5);
  tipGeo.translate(0, 0.825, 0);

  const N = 560;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const spines: { p: THREE.Vector3; dir: THREE.Vector3; len: number; w: number }[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const d = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);

    // Skip the face cap and the underside.
    if (d.z > 0.4 || d.y < -0.35) continue;

    // Surface point and outward normal of the ellipsoid.
    const p = new THREE.Vector3(d.x * BODY_R, d.y * BODY_R * BODY_SY, d.z * BODY_R * BODY_SZ).add(BODY_C);
    const n = new THREE.Vector3(
      d.x / BODY_R,
      d.y / (BODY_R * BODY_SY),
      d.z / (BODY_R * BODY_SZ)
    ).normalize();

    // Tilt spines slightly backward and fan them out, like a puffed-up back.
    const dir = n.clone().add(new THREE.Vector3(0, 0.15, -0.35 - 0.2 * rnd())).normalize();

    spines.push({
      p,
      dir,
      len: 0.04 + rnd() * 0.025,
      w: 0.85 + rnd() * 0.4,
    });
  }

  const spineMesh = new THREE.InstancedMesh(spineGeo, chestnut, spines.length);
  const tipMesh = new THREE.InstancedMesh(tipGeo, cream, spines.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();

  spines.forEach((sp, i) => {
    q.setFromUnitVectors(up, sp.dir);
    const base = sp.p.clone().addScaledVector(sp.dir, -0.004);
    s.set(sp.w, sp.len, sp.w);
    m.compose(base, q, s);
    spineMesh.setMatrixAt(i, m);
    tipMesh.setMatrixAt(i, m);
  });
  spineMesh.instanceMatrix.needsUpdate = true;
  tipMesh.instanceMatrix.needsUpdate = true;
  root.add(spineMesh, tipMesh);

  // ---- Head: fawn, with a pointed twitchy snout ----
  const headC = new THREE.Vector3(0, 0.08, 0.12);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.065, 22, 16), fawn);
  head.scale.set(1, 0.95, 1.1);
  head.position.copy(headC);
  root.add(head);

  const snoutGeo = new THREE.ConeGeometry(0.035, 0.1, 14);
  snoutGeo.rotateX(Math.PI / 2); // tip now points along +Z
  const snout = new THREE.Mesh(snoutGeo, fawn);
  snout.position.set(0, 0.075, 0.17);
  root.add(snout);

  // Shiny black button nose at snout tip
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.013, 14, 10), black);
  nose.position.set(0, 0.075, 0.218);
  root.add(nose);

  // ---- Eyes: bright beady, with glints ----
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 10), black);
    eye.position.set(sx * 0.04, 0.097, 0.172);
    root.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.003, 8, 6), white);
    glint.position.set(sx * 0.04 + 0.003, 0.102, 0.182);
    root.add(glint);
  }

  // ---- Tiny round ears, with pink insides ----
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), fawn);
    ear.scale.set(1, 1, 0.45);
    ear.position.set(sx * 0.05, 0.135, 0.075);
    root.add(ear);

    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), pink);
    inner.scale.set(1, 1, 0.4);
    inner.position.set(sx * 0.05, 0.135, 0.085);
    root.add(inner);
  }

  // ---- Little pink paws ----
  const pawGeo = new THREE.SphereGeometry(0.024, 14, 10);
  const pawPositions = [
    [-0.055, 0.02, 0.1],
    [0.055, 0.02, 0.1],
    [-0.065, 0.02, -0.09],
    [0.065, 0.02, -0.09],
  ];
  for (const [x, y, z] of pawPositions) {
    const paw = new THREE.Mesh(pawGeo, pink);
    paw.scale.set(1, 0.55, 1.25);
    paw.position.set(x, y, z);
    root.add(paw);
  }

  // ---- Red maple leaf stuck on the spines ----
  const leafShape = new THREE.Shape();
  const LEAF_N = 80;
  for (let i = 0; i <= LEAF_N; i++) {
    const th = (i / LEAF_N) * Math.PI * 2;
    const lobe = Math.pow(Math.abs(Math.cos(2.5 * (th - Math.PI / 2))), 0.7);
    const r = 0.075 * (0.42 + 0.58 * lobe);
    const x = r * Math.cos(th);
    const y = r * Math.sin(th);
    if (i === 0) leafShape.moveTo(x, y);
    else leafShape.lineTo(x, y);
  }
  const leafGeo = new THREE.ShapeGeometry(leafShape);

  const leafGroup = new THREE.Group();
  leafGroup.position.set(0.02, 0.25, -0.07);
  leafGroup.rotation.set(-0.25, 0.5, 0.15);

  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leafGroup.add(leaf);

  const vein = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.11, 0.002), veinMat);
  vein.position.set(0, 0.0, 0.002);
  leafGroup.add(vein);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6), stemMat);
  stem.position.set(0, -0.07, 0);
  stem.rotation.z = 0.1;
  leafGroup.add(stem);

  root.add(leafGroup);

  return root;
}
```