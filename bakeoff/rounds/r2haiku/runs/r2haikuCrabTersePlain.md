```ts
import * as THREE from "three";

export const meta = {
  name: "Stylized Crab",
  description: "A bold, low-poly crab with a domed shell, segmented legs, raised pincers and stalked eyes, built from primitives.",
};

// Seeded generator so every run builds the same model.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function buildCrab(): THREE.Object3D {
  const rand = rng(20240607);
  const root = new THREE.Group();

  // Shared materials, one per colour.
  const shell = new THREE.MeshStandardMaterial({ color: 0xe0492b, roughness: 0.5, metalness: 0.05 });
  const shellDark = new THREE.MeshStandardMaterial({ color: 0xa83218, roughness: 0.55 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xf2b48a, roughness: 0.6 });
  const joint = new THREE.MeshStandardMaterial({ color: 0x6e2010, roughness: 0.6 });
  const spot = new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.4 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const pupil = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });

  // Place a mesh with optional scale and rotation.
  function put<T extends THREE.Mesh>(mesh: T, p: [number, number, number], sc?: [number, number, number]): T {
    mesh.position.set(p[0], p[1], p[2]);
    if (sc) mesh.scale.set(sc[0], sc[1], sc[2]);
    root.add(mesh);
    return mesh;
  }

  // A straight segment between two points, used for legs, arms and stalks.
  function limb(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 7), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    root.add(mesh);
    return mesh;
  }

  // Tapered segment: thick at a, thin at b.
  function taper(a: THREE.Vector3, b: THREE.Vector3, rA: number, rB: number, m: THREE.Material) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, 8), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    root.add(mesh);
    return mesh;
  }

  const knob = (p: THREE.Vector3, r: number, m: THREE.Material) => put(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m), [p.x, p.y, p.z]);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- Carapace (main shell) ----
  put(new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10), shell), [0, 0.1, 0], [1.35, 0.5, 1.1]);

  // Front brow ridge with a little notch.
  put(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.035), shellDark), [0, 0.108, 0.105]);
  for (const s of [1, -1]) {
    put(new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 5), shellDark), [s * 0.05, 0.115, 0.1]).rotation.x = Math.PI / 2;
  }

  // Shell spots for character.
  const spotPos: [number, number, number][] = [
    [0.07, 0.135, 0.02], [-0.07, 0.135, 0.02],
    [0.04, 0.14, -0.04], [-0.04, 0.14, -0.04],
    [0.0, 0.145, -0.02], [0.1, 0.12, -0.05], [-0.1, 0.12, -0.05],
  ];
  for (const p of spotPos) {
    const r = 0.012 + rand() * 0.01;
    put(new THREE.Mesh(new THREE.SphereGeometry(r, 6, 4), spot), p, [1, 0.5, 1]);
  }

  // ---- Abdomen and tail fan on the underside, rear ----
  put(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 7), belly), [0, 0.055, -0.13], [1, 0.55, 0.95]);
  put(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.05, 6), shellDark), [0, 0.05, -0.19]).rotation.x = -Math.PI / 2 + 0.3;

  // ---- Eyes on stalks ----
  for (const s of [1, -1]) {
    const x = s * 0.048;
    limb(V(x, 0.15, 0.1), V(x * 1.05, 0.2, 0.12), 0.012, shellDark);
    const eyeC = V(x * 1.05, 0.215, 0.125);
    put(new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), eyeWhite), [eyeC.x, eyeC.y, eyeC.z]);
    put(new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), pupil), [eyeC.x, eyeC.y + 0.005, eyeC.z + 0.026]);
  }

  // ---- Walking legs: 4 per side, three segments each ----
  const legZ = [-0.035, 0.0, 0.035, 0.07];
  legZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      const hip = V(s * 0.1, 0.08, z);
      const knee = V(s * (0.2 + i * 0.008), 0.11 - i * 0.005, z + 0.01 + i * 0.01);
      const foot = V(s * (0.27 + i * 0.012), 0.012, z + 0.045 + i * 0.015);
      taper(hip, knee, 0.017, 0.012, joint);
      taper(knee, foot, 0.012, 0.007, joint);
      knob(knee, 0.016, joint);
      put(new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), joint), [foot.x, foot.y, foot.z]);
    }
  });

  // ---- Pincer arms and claws ----
  for (const s of [1, -1]) {
    const shoulder = V(s * 0.12, 0.07, 0.1);
    const elbow = V(s * 0.2, 0.09, 0.19);
    const wrist = V(s * 0.2, 0.085, 0.27);
    taper(shoulder, elbow, 0.024, 0.02, shell);
    taper(elbow, wrist, 0.02, 0.016, shell);
    knob(elbow, 0.022, shellDark);

    // Palm: a squashed, widened sphere.
    put(new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 9), shell), [wrist.x, wrist.y, wrist.z + 0.02], [1.05, 0.85, 1.2]);

    // Two fingers that open at the tips.
    const fA0 = V(s * 0.17, 0.09, 0.3), fA1 = V(s * 0.13, 0.085, 0.41);
    const fB0 = V(s * 0.23, 0.09, 0.3), fB1 = V(s * 0.21, 0.085, 0.41);
    taper(fA0, fA1, 0.02, 0.008, shellDark);
    taper(fB0, fB1, 0.024, 0.01, shell);
    // Tooth bumps on the inner edges.
    put(new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.025, 5), belly), [s * 0.155, 0.08, 0.36]).rotation.x = Math.PI / 2;
    put(new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.025, 5), belly), [s * 0.2, 0.08, 0.36]).rotation.x = Math.PI / 2;
  }

  // Center the model on x = 0 and keep the lowest point on the floor.
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.y -= box.min.y;

  return root;
}
```