```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Penguin and Chick",
  description:
    "A proud emperor penguin parent in glossy blue-black and white, with a golden ear patch, an orange-pink bill stripe and big webbed feet, and a fluffy grey chick peeking out between its feet.",
};

// Seeded generator so every build is identical.
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

// Deterministic hash of a position, used to bump the chick's down.
function hash3(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

// Icosphere with lumpy, position-hashed displacement: reads as fluffy down.
function fluffyGeometry(detail: number, lump: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const k = 1 + lump * (hash3(v.x, v.y, v.z) - 0.5);
    pos.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

export default function buildEmperorWithChick(): THREE.Object3D {
  const rand = mulberry32(20250917);

  const M = {
    back: new THREE.MeshStandardMaterial({ color: 0x18213f, roughness: 0.28, metalness: 0.05 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xf4f3ee, roughness: 0.55 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xeab334, roughness: 0.4 }),
    bill: new THREE.MeshStandardMaterial({ color: 0x17171d, roughness: 0.22 }),
    stripe: new THREE.MeshStandardMaterial({ color: 0xff8868, roughness: 0.4 }),
    foot: new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.5 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x040406, roughness: 0.12 }),
    glint: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
    down: new THREE.MeshStandardMaterial({ color: 0xaab0b8, roughness: 0.95, flatShading: true }),
    downShade: new THREE.MeshStandardMaterial({ color: 0x7a8089, roughness: 0.95, flatShading: true }),
  };

  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  const ellipsoid = (
    rx: number,
    ry: number,
    rz: number,
    mat: THREE.Material,
    w = 12,
    h = 9,
  ): THREE.Mesh => {
    const m = mesh(new THREE.SphereGeometry(1, w, h), mat);
    m.scale.set(rx, ry, rz);
    return m;
  };

  const at = <T extends THREE.Object3D>(
    obj: T,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
  ): T => {
    obj.position.set(x, y, z);
    parent.add(obj);
    return obj;
  };

  const root = new THREE.Group();
  root.name = "emperor-penguin-with-chick";

  // ---------- Adult emperor penguin ----------
  const adult = new THREE.Group();
  adult.name = "adult";
  root.add(adult);

  // Egg-shaped blue-black body from a faceted lathe.
  const bodyProfile = [
    [0.001, 0.0],
    [0.13, 0.03],
    [0.18, 0.16],
    [0.212, 0.36],
    [0.218, 0.56],
    [0.2, 0.74],
    [0.158, 0.9],
    [0.11, 0.98],
    [0.001, 1.0],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  adult.add(mesh(new THREE.LatheGeometry(bodyProfile, 14), M.back));

  // Crisp white front bulging out of the dark body.
  at(ellipsoid(0.2, 0.46, 0.19, M.belly, 14, 10), 0, 0.46, 0.05, adult);

  // Warm golden ear and neck patches on each side.
  for (const s of [-1, 1]) {
    at(ellipsoid(0.05, 0.1, 0.075, M.gold, 12, 9), s * 0.108, 0.95, -0.005, adult);
  }

  // Glossy head.
  at(ellipsoid(0.136, 0.136, 0.142, M.back, 14, 10), 0, 1.0, 0, adult);

  // Dark eyes with catch-lights.
  for (const s of [-1, 1]) {
    at(ellipsoid(0.022, 0.022, 0.022, M.eye, 8, 6), s * 0.066, 1.03, 0.108, adult);
    at(ellipsoid(0.007, 0.007, 0.007, M.glint, 6, 4), s * 0.072, 1.042, 0.123, adult);
  }

  // Long slender bill, tipped slightly down.
  const bill = new THREE.Group();
  bill.position.set(0, 0.995, 0.105);
  bill.rotation.x = 0.1;
  adult.add(bill);

  const upperGeo = new THREE.CylinderGeometry(0.011, 0.03, 0.19, 6, 1);
  upperGeo.rotateX(Math.PI / 2); // tip (+Y) now points forward (+Z)
  upperGeo.translate(0, 0, 0.095);
  bill.add(mesh(upperGeo, M.bill));

  const lowerGeo = new THREE.CylinderGeometry(0.008, 0.024, 0.165, 6, 1);
  lowerGeo.rotateX(Math.PI / 2);
  lowerGeo.translate(0, 0, 0.0825);
  const lowerMesh = mesh(lowerGeo, M.bill);
  lowerMesh.position.y = -0.02;
  bill.add(lowerMesh);

  // Orange-pink stripe along the lower mandible.
  for (const s of [-1, 1]) {
    at(mesh(new THREE.BoxGeometry(0.008, 0.016, 0.09), M.stripe), s * 0.017, -0.02, 0.06, bill);
  }

  // Stubby flippers held slightly out from the body.
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.2, 0.74, 0);
    pivot.rotation.z = s * 0.42;
    adult.add(pivot);
    at(ellipsoid(0.034, 0.1, 0.07, M.back, 8, 8), 0, -0.1, 0, pivot);
  }

  // Big webbed feet with three scalloped toes.
  const footShape = new THREE.Shape();
  footShape.moveTo(-0.035, -0.05);
  footShape.lineTo(0.035, -0.05);
  footShape.quadraticCurveTo(0.095, 0.02, 0.1, 0.1);
  footShape.lineTo(0.088, 0.2);
  footShape.quadraticCurveTo(0.045, 0.16, 0.0, 0.23);
  footShape.quadraticCurveTo(-0.045, 0.16, -0.088, 0.2);
  footShape.lineTo(-0.1, 0.1);
  footShape.quadraticCurveTo(-0.095, 0.02, -0.035, -0.05);

  const footGeo = new THREE.ExtrudeGeometry(footShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 1,
    curveSegments: 5,
  });
  footGeo.rotateX(Math.PI / 2); // shape's forward axis becomes +Z, thickness goes down
  footGeo.computeBoundingBox();
  footGeo.translate(0, -footGeo.boundingBox!.min.y, 0); // sole sits on y = 0

  for (const s of [-1, 1]) {
    const foot = mesh(footGeo, M.foot);
    foot.position.set(s * 0.1, 0, -0.01);
    foot.rotation.y = s * 0.18;
    adult.add(foot);
  }

  // Small tail nub.
  const tail = mesh(new THREE.ConeGeometry(0.05, 0.1, 5), M.back);
  tail.rotation.x = -Math.PI / 2; // apex points backward
  tail.position.set(0, 0.13, -0.17);
  adult.add(tail);

  // ---------- Fluffy grey chick tucked between the feet ----------
  const chick = new THREE.Group();
  chick.name = "chick";
  root.add(chick);

  const chickBody = mesh(fluffyGeometry(2, 0.22), M.down);
  chickBody.scale.set(0.095, 0.13, 0.12);
  chickBody.position.set(0, 0.14, 0.17);
  chick.add(chickBody);

  const HEAD_Z = 0.21;
  const chickHead = mesh(fluffyGeometry(2, 0.2), M.down);
  chickHead.scale.set(0.088, 0.085, 0.09);
  chickHead.position.set(0, 0.28, HEAD_Z);
  chick.add(chickHead);

  // Three little down tufts on the crown.
  for (let i = 0; i < 3; i++) {
    const tuft = mesh(new THREE.ConeGeometry(0.024, 0.07, 5), M.downShade);
    tuft.rotation.set(-0.55, 0, (1 - i) * 0.35);
    tuft.position.set((i - 1) * 0.036 + (rand() - 0.5) * 0.012, 0.343, HEAD_Z - 0.03);
    chick.add(tuft);
  }

  // Short dark bill.
  const chickBill = mesh(new THREE.ConeGeometry(0.016, 0.04, 5), M.bill);
  chickBill.rotation.x = Math.PI / 2; // apex forward
  chickBill.position.set(0, 0.272, HEAD_Z + 0.1);
  chick.add(chickBill);

  // Bright little eyes.
  for (const s of [-1, 1]) {
    at(ellipsoid(0.012, 0.012, 0.012, M.eye, 8, 6), s * 0.04, 0.3, 0.285, chick);
  }

  // Stubby wing nubs.
  for (const s of [-1, 1]) {
    const nub = at(ellipsoid(0.02, 0.06, 0.042, M.down, 8, 6), s * 0.1, 0.15, 0.17, chick);
    nub.rotation.z = s * 0.35;
  }

  // Tiny dark feet.
  for (const s of [-1, 1]) {
    at(ellipsoid(0.026, 0.01, 0.036, M.bill, 8, 5), s * 0.04, 0.006, 0.2, chick);
  }

  return root;
}
```