```ts
import * as THREE from "three";

export const meta = {
  name: "Hedgehog",
  description: "A stylized low-poly hedgehog built from primitives, with a spiky quilled back, snout, ears, and little feet.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const mat = (c: number, r = 0.9) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const quillDark = mat(0x4a3526);
  const quillMid = mat(0x7a5a3c);
  const quillLight = mat(0xc9a56e);
  const fur = mat(0xe3c299);
  const furDark = mat(0xc09a70);
  const black = mat(0x111111, 0.3);
  const white = mat(0xffffff, 0.3);
  const pink = mat(0xe58f8f);
  const nose = mat(0x1a1210, 0.4);

  const g = new THREE.Group();

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = g) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // Body: dome of quills (squashed sphere)
  const body = add(new THREE.IcosahedronGeometry(0.1, 1), quillMid, 0, 0.11, -0.01);
  body.scale.set(1.0, 0.95, 1.4);

  // Belly fur
  const belly = add(new THREE.IcosahedronGeometry(0.085, 1), fur, 0, 0.075, 0.02);
  belly.scale.set(1.0, 0.8, 1.45);

  // Quills: cones scattered over back hemisphere
  const quillGeo = new THREE.ConeGeometry(0.014, 0.075, 4);
  const mats = [quillDark, quillMid, quillLight, quillDark, quillMid];
  const N = 190;
  for (let i = 0; i < N; i++) {
    // random direction on upper/back hemisphere
    const u = rnd();
    const v = rnd();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(1 - v * 1.15); // from top, up to ~ beyond equator
    const dir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    // skip the front face region where head is
    if (dir.z > 0.55 && dir.y < 0.7) continue;
    const p = new THREE.Vector3(dir.x * 0.1, dir.y * 0.095, dir.z * 0.14);
    const q = new THREE.Mesh(quillGeo, mats[Math.floor(rnd() * mats.length)]);
    q.position.set(p.x, 0.11 + p.y - 0.01, p.z - 0.01);
    // tilt backwards a bit
    const d2 = dir.clone();
    d2.z -= 0.35;
    d2.normalize();
    q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d2);
    q.scale.setScalar(0.8 + rnd() * 0.6);
    q.translateY(0.03);
    g.add(q);
  }

  // Head group
  const head = new THREE.Group();
  head.position.set(0, 0.075, 0.14);
  g.add(head);
  const skull = add(new THREE.IcosahedronGeometry(0.058, 1), fur, 0, 0.01, 0.02, head);
  skull.scale.set(0.95, 0.9, 1.0);
  // Snout cone
  const snout = add(new THREE.ConeGeometry(0.04, 0.1, 6), fur, 0, -0.005, 0.1, head);
  snout.rotation.x = Math.PI / 2;
  // Nose
  add(new THREE.IcosahedronGeometry(0.016, 0), nose, 0, 0.0, 0.153, head);
  // Face mask darker patch
  const mask = add(new THREE.IcosahedronGeometry(0.03, 0), furDark, 0, 0.02, 0.005, head);
  mask.scale.set(1.6, 0.5, 1);
  // Eyes
  for (const sx of [-1, 1]) {
    add(new THREE.IcosahedronGeometry(0.0125, 1), black, sx * 0.032, 0.03, 0.065, head);
    add(new THREE.IcosahedronGeometry(0.004, 0), white, sx * 0.035, 0.036, 0.075, head);
    // ears
    const ear = add(new THREE.SphereGeometry(0.02, 6, 4), pink, sx * 0.048, 0.055, -0.005, head);
    ear.scale.set(0.8, 1, 0.5);
    const earOut = add(new THREE.SphereGeometry(0.025, 6, 4), furDark, sx * 0.05, 0.05, -0.015, head);
    earOut.scale.set(0.8, 1, 0.5);
  }
  // Quill fringe over forehead
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 2.2;
    const q = new THREE.Mesh(quillGeo, i % 2 ? quillDark : quillMid);
    q.position.set(Math.sin(a) * 0.055, 0.06, -0.015);
    q.rotation.set(0.9, 0, -a * 0.6);
    head.add(q);
  }

  // Feet
  for (const sx of [-1, 1]) {
    for (const z of [0.1, -0.1]) {
      const foot = add(new THREE.BoxGeometry(0.03, 0.03, 0.05), furDark, sx * 0.06, 0.015, z + 0.02);
      add(new THREE.BoxGeometry(0.036, 0.012, 0.03), fur, sx * 0.06, 0.006, z + 0.04);
      // toes
      for (let t = -1; t <= 1; t++) {
        add(new THREE.BoxGeometry(0.007, 0.007, 0.012), nose, sx * 0.06 + t * 0.01, 0.007, z + 0.068);
      }
      void foot;
    }
  }

  // tiny tail tuft
  const tail = add(new THREE.ConeGeometry(0.015, 0.03, 4), furDark, 0, 0.05, -0.2);
  tail.rotation.x = -Math.PI / 2 - 0.3;

  g.scale.setScalar(1.0);
  return g;
}
```