```ts
import * as THREE from "three";

export const meta = {
  name: "Koala",
  description: "A stylized low-poly koala sitting upright, built from primitives, with fluffy ears, big nose and clinging arms.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const mat = (c: number, r = 0.95) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const fur = mat(0x8d9096);
  const furDark = mat(0x6f7379);
  const belly = mat(0xdcdcd6);
  const earIn = mat(0xf2e6e0);
  const nose = mat(0x232326, 0.5);
  const eye = mat(0x111111, 0.3);
  const claw = mat(0x3b3b3f);
  const white = mat(0xffffff, 0.3);
  const bark = mat(0x7a5a3c);
  const leaf = mat(0x5f9a4a);

  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, p: number[], s: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    parent.add(mesh);
    return mesh;
  };
  const sph = (w = 7, h = 5) => new THREE.SphereGeometry(1, w, h);

  // Body (sitting, height ~0.75m total)
  add(root, sph(10, 7), fur, [0, 0.27, -0.02], [0.24, 0.27, 0.22]);
  add(root, sph(8, 6), belly, [0, 0.29, 0.13], [0.17, 0.2, 0.12]);
  // rump / bottom
  add(root, sph(8, 6), furDark, [0, 0.1, -0.06], [0.24, 0.12, 0.26]);

  // Legs (sitting, feet forward)
  for (const s of [-1, 1]) {
    add(root, sph(7, 5), fur, [s * 0.2, 0.12, 0.1], [0.1, 0.1, 0.17]);
    add(root, sph(7, 5), furDark, [s * 0.2, 0.06, 0.26], [0.075, 0.05, 0.1]);
    for (let i = -1; i <= 1; i++) {
      add(root, new THREE.ConeGeometry(0.012, 0.04, 4), claw, [s * 0.2 + i * 0.03, 0.05, 0.37], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }
  }

  // Arms reaching forward-out
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.22, 0.46, 0.08);
    arm.rotation.set(-0.6, 0, s * -0.35);
    root.add(arm);
    add(arm, new THREE.CylinderGeometry(0.06, 0.05, 0.25, 6), fur, [0, -0.1, 0]);
    add(arm, sph(6, 5), furDark, [0, -0.24, 0], [0.06, 0.05, 0.06]);
    for (let i = -1; i <= 1; i++) {
      add(arm, new THREE.ConeGeometry(0.01, 0.045, 4), claw, [i * 0.025, -0.3, 0.01], [1, 1, 1], [Math.PI, 0, 0]);
    }
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.68, 0.05);
  root.add(head);
  add(head, sph(10, 8), fur, [0, 0, 0], [0.24, 0.19, 0.2]);
  // cheek fluff
  for (const s of [-1, 1]) {
    add(head, sph(6, 5), belly, [s * 0.17, -0.07, 0.07], [0.08, 0.07, 0.08]);
    // ears
    add(head, sph(8, 6), fur, [s * 0.2, 0.15, -0.02], [0.14, 0.14, 0.05]);
    add(head, sph(8, 6), earIn, [s * 0.2, 0.15, 0.01], [0.09, 0.09, 0.03]);
    // eyes
    add(head, sph(6, 5), eye, [s * 0.085, 0.04, 0.18], [0.025, 0.03, 0.02]);
    add(head, sph(4, 3), white, [s * 0.09, 0.052, 0.2], [0.008, 0.008, 0.006]);
  }
  // muzzle & big nose
  add(head, sph(7, 5), furDark, [0, -0.04, 0.17], [0.09, 0.07, 0.06]);
  add(head, new THREE.BoxGeometry(0.1, 0.13, 0.06), nose, [0, 0.0, 0.215], [1, 1, 1], [0.15, 0, 0]);
  // tuft on forehead
  add(head, new THREE.ConeGeometry(0.05, 0.06, 5), furDark, [0, 0.19, 0.0]);

  // Eucalyptus branch held by the koala
  const br = add(root, new THREE.CylinderGeometry(0.018, 0.022, 0.7, 5), bark, [0.0, 0.33, 0.3], [1, 1, 1], [0, 0, Math.PI / 2 - 0.15]);
  br.position.x = 0.0;
  for (let i = 0; i < 7; i++) {
    const x = -0.3 + i * 0.1;
    const m = add(root, sph(5, 4), leaf, [x, 0.36 + rnd() * 0.05 + i * 0.01, 0.3 + (rnd() - 0.5) * 0.06], [0.05, 0.015, 0.09], [0, rnd() * 3, rnd() * 0.6]);
    m.rotation.x = rnd() * 0.5;
  }

  return root;
}
```