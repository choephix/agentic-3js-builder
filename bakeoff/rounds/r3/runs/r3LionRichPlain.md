```ts
import * as THREE from "three";

export const meta = {
  name: "Old Lion",
  description: "A proud old lion resting with head held high, shaggy layered mane from gold to chocolate, scar, padded paws and tufted tail.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.9) => {
    const k = c + "_" + r;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
    return mats[k];
  };
  const root = new THREE.Group();
  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, p: number[], sc: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(sc[0], sc[1], sc[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    parent.add(mesh);
    return mesh;
  };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const sph = new THREE.IcosahedronGeometry(0.5, 1);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  const cone = new THREE.ConeGeometry(0.5, 1, 6);

  const tawny = M(0xc8924a), cream = M(0xeed8a8), dark = M(0x2a1a10), nose = M(0x151012, 0.5);
  const tawnyD = M(0xa8743a);

  // Body (lying-front-up sphinx-like pose, seated)
  add(root, sph, tawny, [0, 0.62, -0.5], [0.85, 0.9, 1.9]);
  add(root, sph, cream, [0, 0.38, -0.4], [0.62, 0.45, 1.6]);
  add(root, sph, tawny, [0, 0.7, 0.35], [0.8, 0.95, 0.8]); // chest/shoulders
  add(root, sph, cream, [0, 0.45, 0.6], [0.5, 0.6, 0.4]);
  // haunches
  for (const x of [-1, 1]) {
    add(root, sph, tawnyD, [x * 0.38, 0.4, -1.25], [0.5, 0.75, 0.95]);
    add(root, box, cream, [x * 0.4, 0.07, -0.95], [0.3, 0.14, 0.55]); // hind paw
    add(root, box, tawny, [x * 0.2, 0.12, 0.85], [0.26, 0.24, 0.9]); // front leg lying forward
    add(root, sph, cream, [x * 0.2, 0.1, 1.38], [0.34, 0.2, 0.42]); // paw
    // front leg upper
    add(root, box, tawny, [x * 0.25, 0.45, 0.5], [0.28, 0.7, 0.32], [0.1, 0, 0]);
    for (let i = -1; i <= 1; i++) add(root, sph, dark, [x * 0.2 + i * 0.08, 0.06, 1.55], [0.05, 0.05, 0.08]);
  }

  // Tail
  const tail = new THREE.Group();
  root.add(tail);
  let px = 0.45, py = 0.12, pz = -1.9;
  for (let i = 0; i < 7; i++) {
    add(tail, cyl, tawny, [px, py, pz], [0.09, 0.4, 0.09], [Math.PI / 2, 0, 0.5]);
    px += 0.17; pz -= 0.3 * 0.9 + 0; py += i < 2 ? 0 : 0.0;
  }
  add(tail, sph, dark, [px + 0.05, 0.14, pz - 0.1], [0.22, 0.22, 0.45]);
  add(tail, cone, dark, [px + 0.08, 0.14, pz - 0.38], [0.18, 0.3, 0.18], [-Math.PI / 2, 0, 0]);

  // Head group
  const head = new THREE.Group();
  head.position.set(0, 1.35, 0.75);
  root.add(head);
  // neck
  add(root, cyl, tawny, [0, 1.05, 0.55], [0.6, 0.7, 0.6], [0.35, 0, 0]);

  // Mane layers: rings of spiky cones/boxes, gold center to dark edges
  const cols = [0xe3b34a, 0xcf9a38, 0xa8702a, 0x7a4a20, 0x4e2c14, 0x2e1a0c];
  cols.forEach((c, li) => {
    const rad = 0.3 + li * 0.1;
    const n = 10 + li * 5;
    const m = M(c);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.2;
      const len = 0.28 + li * 0.05 + rnd() * 0.08;
      const rr = rad + rnd() * 0.04;
      const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 1.02;
      const z = -0.1 - li * 0.09 - rnd() * 0.05;
      const mesh = add(head, cone, m, [x, y, z], [0.2 + li * 0.015, len, 0.2 + li * 0.015]);
      mesh.rotation.z = a - Math.PI / 2;
      mesh.rotation.x = 0;
      mesh.lookAt; 
      mesh.rotation.set(-Math.PI / 2 + 0, 0, 0);
      mesh.quaternion.setFromEuler(new THREE.Euler(0, 0, a - Math.PI / 2));
    }
    // fill disc per layer
    add(head, new THREE.CylinderGeometry(rad + 0.05, rad + 0.05, 0.12, 12), m, [0, 0, -0.04 - li * 0.09], [1, 1, 1], [Math.PI / 2, 0, 0]);
  });
  // mane flowing down chest and back
  for (let i = 0; i < 16; i++) {
    const c = i % 3 === 0 ? 0x2e1a0c : i % 2 ? 0x4e2c14 : 0x7a4a20;
    const x = (rnd() - 0.5) * 1.0;
    add(root, cone, M(c), [x, 0.95 - rnd() * 0.3 - Math.abs(x) * 0.3, 0.25 - rnd() * 0.5], [0.22, 0.5 + rnd() * 0.3, 0.22], [Math.PI + (rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.6]);
  }
  for (let i = 0; i < 8; i++) add(root, sph, M(0x3a2210), [(rnd() - 0.5) * 0.7, 0.55 - rnd() * 0.1, 0.5 + rnd() * 0.2], [0.35, 0.5, 0.3]);
  add(root, sph, M(0x3a2210), [0, 1.0, -0.1], [1.0, 0.7, 1.0]);

  // Face
  add(head, sph, tawny, [0, 0, 0.12], [0.58, 0.55, 0.55]); // skull
  add(head, sph, cream, [0, -0.12, 0.42], [0.36, 0.26, 0.3]); // muzzle
  add(head, sph, cream, [0, -0.2, 0.36], [0.32, 0.18, 0.28]); // chin
  add(head, box, nose, [0, -0.02, 0.57], [0.17, 0.1, 0.08]); // nose
  add(head, cone, nose, [0, -0.07, 0.57], [0.16, 0.08, 0.08], [Math.PI, 0, 0]);
  add(head, box, tawnyD, [0, 0.12, 0.38], [0.1, 0.26, 0.12], [-0.5, 0, 0]); // bridge
  add(head, box, nose, [0, -0.16, 0.56], [0.03, 0.1, 0.03]);
  add(head, box, nose, [0, -0.215, 0.55], [0.22, 0.02, 0.05]);
  for (const x of [-1, 1]) {
    add(head, sph, M(0xffffff, 0.4), [x * 0.17, 0.1, 0.38], [0.13, 0.1, 0.07]);
    add(head, sph, M(0xf2a31c, 0.3), [x * 0.17, 0.1, 0.42], [0.09, 0.09, 0.05]);
    add(head, sph, nose, [x * 0.17, 0.1, 0.45], [0.04, 0.06, 0.03]);
    add(head, box, tawnyD, [x * 0.17, 0.2, 0.4], [0.17, 0.05, 0.08], [0, 0, x * -0.25]); // heavy brow
    add(head, sph, cream, [x * 0.1, -0.12, 0.5], [0.16, 0.12, 0.12]); // whisker pad
    add(head, sph, tawny, [x * 0.33, 0.33, 0.0], [0.2, 0.2, 0.12]); // ear
    add(head, sph, dark, [x * 0.33, 0.33, 0.06], [0.11, 0.11, 0.06]);
    for (let i = 0; i < 3; i++) add(head, box, nose, [x * 0.16, -0.12 - i * 0.0, 0.58], [0.005 + 0.2, 0.008, 0.008], [0, 0, x * (0.1 + i * 0.12)]);
  }
  // scar across left eyebrow (+X)
  add(head, box, M(0x7a3a2a), [0.18, 0.2, 0.43], [0.04, 0.26, 0.03], [0, 0, 0.5]);
  add(head, box, cream, [0.18, 0.2, 0.445], [0.015, 0.22, 0.01], [0, 0, 0.5]);

  // scale to real size: lion ~ 1.2 m tall seated head, fine
  root.scale.setScalar(1);
  return root;
}
```