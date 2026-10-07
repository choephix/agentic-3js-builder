import * as THREE from "three";

export const meta = {
  name: "Fennec Fox",
  description: "Stylized low-poly fennec fox with huge ears, built from primitives.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number) =>
    (mats[c] ??= new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.9 }));

  const sand = M(0xe2b878), cream = M(0xf6e8cf), dark = M(0x2a1d16), pink = M(0xe8a0a0), tail = M(0xcf9a58), tip = M(0x3a2a20), nose = M(0x1a1210);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s = [1, 1, 1], r = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  const sph = new THREE.IcosahedronGeometry(0.5, 1);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cone = new THREE.ConeGeometry(0.5, 1, 5);
  const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);

  // body
  add(sph, sand, [0, 0.27, 0], [0.22, 0.22, 0.42]);
  add(sph, cream, [0, 0.21, 0.04], [0.19, 0.16, 0.36]);
  add(sph, sand, [0, 0.29, 0.02], [0.21, 0.19, 0.38]);
  // chest
  add(sph, cream, [0, 0.27, 0.17], [0.16, 0.2, 0.16]);

  // legs
  for (const sx of [-1, 1]) {
    for (const z of [0.14, -0.15]) {
      add(cyl, sand, [sx * 0.065, 0.1, z], [0.05, 0.2, 0.05]);
      add(box, dark, [sx * 0.065, 0.012, z + 0.015], [0.055, 0.025, 0.08]);
    }
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.4, 0.25);
  root.add(head);
  add(sph, sand, [0, 0, 0], [0.24, 0.2, 0.22], [0, 0, 0], head);
  add(sph, cream, [0, -0.04, 0.05], [0.17, 0.1, 0.16], [0, 0, 0], head);
  // snout
  add(cone, cream, [0, -0.025, 0.13], [0.09, 0.14, 0.09], [Math.PI / 2, 0, 0], head);
  add(sph, nose, [0, -0.01, 0.2], [0.035, 0.03, 0.035], [0, 0, 0], head);
  // eyes
  for (const sx of [-1, 1]) {
    add(sph, dark, [sx * 0.065, 0.03, 0.095], [0.04, 0.05, 0.03], [0, 0, 0], head);
    add(box, dark, [sx * 0.07, 0.0, 0.12], [0.012, 0.05, 0.01], [0, 0, sx * 0.4], head);
    // ears
    const ear = new THREE.Group();
    ear.position.set(sx * 0.09, 0.08, -0.02);
    ear.rotation.set(-0.1, sx * 0.1, -sx * 0.35);
    head.add(ear);
    add(cone, sand, [0, 0.13, 0], [0.12, 0.3, 0.04], [0, 0, 0], ear);
    add(cone, pink, [0, 0.12, 0.015], [0.08, 0.24, 0.03], [0, 0, 0], ear);
    add(cone, cream, [sx * 0.0, 0.1, 0.03], [0.04, 0.16, 0.02], [0, 0, 0], ear);
    // cheek fluff
    add(cone, cream, [sx * 0.11, -0.04, 0.03], [0.06, 0.08, 0.06], [0, 0, -sx * 1.6], head);
  }

  // tail
  const t = new THREE.Group();
  t.position.set(0, 0.28, -0.4);
  t.rotation.x = -0.9;
  root.add(t);
  add(sph, tail, [0, -0.1, 0], [0.13, 0.3, 0.13], [0, 0, 0], t);
  add(sph, tip, [0, -0.28, 0], [0.1, 0.12, 0.1], [0, 0, 0], t);

  // whiskers
  for (const sx of [-1, 1])
    for (const dy of [-0.01, 0.015])
      add(box, cream, [sx * 0.1, -0.02 + dy, 0.15], [0.12, 0.004, 0.004], [0, sx * 0.3, dy * 6], head);

  return root;
}
