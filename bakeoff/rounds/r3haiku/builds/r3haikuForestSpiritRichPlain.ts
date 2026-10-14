import * as THREE from "three";

export const meta = {
  name: "Mossstone Forest Spirit",
  description:
    "A small deer-like forest spirit with a river-stone body under soft moss, slender wooden legs, a pale carved mask face with glowing green eyes, flowering antlers and circling fireflies.",
};

type V3 = THREE.Vector3;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Cylinder spanning from a to b (top radius r1 at b, bottom radius r0 at a).
function link(
  parent: THREE.Object3D,
  a: V3,
  b: V3,
  r0: number,
  r1: number,
  mat: THREE.Material,
  seg = 6
) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  parent.add(m);
  return m;
}

export default function build(): THREE.Object3D {
  const rand = rng(7731);
  const root = new THREE.Group();

  // ---- Materials (one per colour, shared) ----
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x7d8288,
    roughness: 0.95,
    flatShading: true,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x5d9a48,
    roughness: 0.9,
    flatShading: true,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x7a5a3a,
    roughness: 0.75,
    flatShading: true,
  });
  const hoofMat = new THREE.MeshStandardMaterial({
    color: 0x3a2e25,
    roughness: 0.6,
    flatShading: true,
  });
  const maskMat = new THREE.MeshStandardMaterial({
    color: 0xe3d2a8,
    roughness: 0.6,
    flatShading: true,
  });
  const carveMat = new THREE.MeshStandardMaterial({
    color: 0x8a6b45,
    roughness: 0.7,
  });
  const socketMat = new THREE.MeshStandardMaterial({
    color: 0x2a2018,
    roughness: 0.8,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x7dff9a,
    emissive: 0x3dff6a,
    emissiveIntensity: 2.2,
  });
  const antlerMat = new THREE.MeshStandardMaterial({
    color: 0x6e5238,
    roughness: 0.8,
    flatShading: true,
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xf4f1e8,
    roughness: 0.5,
    flatShading: true,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x7fb04e,
    roughness: 0.7,
    flatShading: true,
  });
  const fireflyMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff6a,
    emissive: 0xc8ff40,
    emissiveIntensity: 3,
  });

  // ---- Body: displaced river stone ----
  const bodyGeo = new THREE.IcosahedronGeometry(1, 2);
  const bp = bodyGeo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < bp.count; i++) {
    v.fromBufferAttribute(bp, i);
    const n = v.clone().normalize();
    const k =
      1 +
      0.12 * Math.sin(v.x * 5.1 + 1.3) * Math.cos(v.y * 4.3 - 0.7) +
      0.08 * Math.sin(v.z * 7.7 + v.x * 3.1);
    v.copy(n).multiplyScalar(k);
    bp.setXYZ(i, v.x, v.y, v.z);
  }
  bodyGeo.computeVertexNormals();
  const body = new THREE.Mesh(bodyGeo, stoneMat);
  body.position.set(0, 0.98, 0);
  body.scale.set(0.32, 0.27, 0.5);
  root.add(body);

  // ---- Moss patches on the stone ----
  const mossSpots: [number, number, number][] = [
    [0, 1.22, 0.1],
    [0.15, 1.17, -0.05],
    [-0.12, 1.2, -0.2],
    [0.1, 1.15, 0.3],
    [-0.18, 1.1, 0.1],
    [0.2, 1.05, 0.2],
    [-0.05, 1.08, -0.35],
  ];
  for (const [x, y, z] of mossSpots) {
    const mg = new THREE.IcosahedronGeometry(0.12, 1);
    const m = new THREE.Mesh(mg, mossMat);
    m.position.set(x, y, z);
    m.scale.set(1.2 + rand() * 0.4, 0.45, 1.0 + rand() * 0.4);
    m.rotation.set(rand() * 0.3, rand() * Math.PI * 2, rand() * 0.3);
    root.add(m);
  }

  // ---- Tail nub ----
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), maskMat);
  tail.position.set(0, 1.02, -0.56);
  tail.rotation.x = -Math.PI / 2 + 0.5;
  root.add(tail);

  // ---- Legs and hooves ----
  const legPositions: [number, number][] = [
    [0.17, 0.28],
    [-0.17, 0.28],
    [0.17, -0.28],
    [-0.17, -0.28],
  ];
  for (const [x, z] of legPositions) {
    link(
      root,
      new THREE.Vector3(x, 0.8, z),
      new THREE.Vector3(x, 0.08, z),
      0.025,
      0.035,
      woodMat
    );
    // knee knob
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.036, 6, 4), woodMat);
    knee.position.set(x, 0.36, z);
    root.add(knee);
    // hoof
    link(
      root,
      new THREE.Vector3(x, 0.0, z),
      new THREE.Vector3(x, 0.08, z),
      0.032,
      0.03,
      hoofMat,
      6
    );
  }

  // ---- Neck ----
  const neckBase = new THREE.Vector3(0, 1.12, 0.38);
  const neckTop = new THREE.Vector3(0, 1.45, 0.62);
  link(root, neckBase, neckTop, 0.11, 0.075, woodMat, 7);

  // ---- Head: skull and carved mask ----
  const skullGeo = new THREE.IcosahedronGeometry(0.15, 2);
  const skull = new THREE.Mesh(skullGeo, maskMat);
  skull.position.set(0, 1.55, 0.7);
  skull.scale.set(0.85, 0.95, 1.05);
  root.add(skull);

  const mask = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), maskMat);
  mask.position.set(0, 1.54, 0.84);
  mask.scale.set(0.72, 0.9, 0.3);
  root.add(mask);

  // carved brow lines
  for (const s of [-1, 1]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.02), carveMat);
    line.position.set(s * 0.05, 1.63, 0.93);
    line.rotation.z = s * -0.25;
    root.add(line);
  }
  // centre cheek stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.02), carveMat);
  stripe.position.set(0, 1.5, 0.945);
  root.add(stripe);

  // eye sockets and glowing eyes
  for (const s of [-1, 1]) {
    const sock = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), socketMat);
    sock.position.set(s * 0.065, 1.58, 0.9);
    sock.scale.set(1.1, 0.8, 0.5);
    root.add(sock);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), eyeMat);
    eye.position.set(s * 0.065, 1.58, 0.915);
    root.add(eye);
  }

  // soft green glow cast from the face
  const glow = new THREE.PointLight(0x6dff8a, 0.4, 1.2);
  glow.position.set(0, 1.56, 1.0);
  root.add(glow);

  // snout and nose
  link(
    root,
    new THREE.Vector3(0, 1.5, 0.82),
    new THREE.Vector3(0, 1.4, 1.0),
    0.07,
    0.05,
    maskMat,
    7
  );
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.023, 6, 4), socketMat);
  nose.position.set(0, 1.4, 1.02);
  root.add(nose);

  // leaf-shaped ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), maskMat);
    ear.position.set(s * 0.15, 1.6, 0.66);
    ear.rotation.z = s * -1.2;
    ear.rotation.x = 0.3;
    root.add(ear);
  }

  // ---- Antlers with flowers and leaves ----
  const growAntler = (
    origin: V3,
    dir: V3,
    len: number,
    r: number,
    depth: number
  ) => {
    const end = origin.clone().addScaledVector(dir, len);
    link(root, origin, end, r, r * 0.7, antlerMat, 5);

    if (depth === 0) {
      // flower cluster at the tip
      for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.018, 0), flowerMat);
        f.position.copy(end).add(
          new THREE.Vector3(
            (rand() - 0.5) * 0.04,
            (rand() - 0.5) * 0.04,
            (rand() - 0.5) * 0.04
          )
        );
        root.add(f);
      }
      // a couple of leaves
      for (let i = 0; i < 2; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), leafMat);
        leaf.position.copy(end).add(
          new THREE.Vector3((rand() - 0.5) * 0.06, -0.01, (rand() - 0.5) * 0.06)
        );
        leaf.rotation.set(rand() * 3, rand() * 3, rand() * 3);
        root.add(leaf);
      }
      return;
    }

    // occasional flower or leaf along the branch
    if (rand() > 0.5) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.014, 0), flowerMat);
      f.position.copy(end);
      root.add(f);
    }

    const n = depth > 1 ? 2 : 2 + (rand() > 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = new THREE.Vector3(
        (rand() - 0.5) * 0.9,
        rand() * 0.3,
        (rand() - 0.5) * 0.7
      );
      const nd = dir.clone().add(spread).normalize();
      growAntler(end, nd, len * (0.62 + rand() * 0.15), r * 0.7, depth - 1);
    }
  };

  for (const s of [-1, 1]) {
    const origin = new THREE.Vector3(s * 0.07, 1.68, 0.7);
    const dir = new THREE.Vector3(s * 0.35, 1, -0.2).normalize();
    growAntler(origin, dir, 0.3, 0.02, 3);
  }

  // ---- Fireflies circling the head ----
  const fireflyCenter = new THREE.Vector3(0, 1.62, 0.7);
  const fireflyCount = 6;
  for (let i = 0; i < fireflyCount; i++) {
    const a = (i / fireflyCount) * Math.PI * 2 + rand() * 0.5;
    const radius = 0.36 + rand() * 0.14;
    const y = fireflyCenter.y + Math.sin(a * 2 + i) * 0.12;
    const fx = fireflyCenter.x + Math.cos(a) * radius;
    const fz = fireflyCenter.z + Math.sin(a) * radius;
    const ff = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), fireflyMat);
    ff.position.set(fx, y, fz);
    root.add(ff);
  }

  return root;
}
