```ts
import * as THREE from "three";

export const meta = { name: "Tree Frog", description: "A stylized low-poly green frog with bulging eyes, folded legs, and a pale belly, built from primitives." };

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const mat = (c: number, r = 0.7) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const green = mat(0x4caf3a), dark = mat(0x2e7d2c), light = mat(0xb9e27a), belly = mat(0xf2ecc0, 0.8);
  const black = mat(0x111111, 0.3), gold = mat(0xf2b01e, 0.4), spot = mat(0x1f5f25), pink = mat(0xe8707a), toe = mat(0xf08a3c);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s = [1, 1, 1], r = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  const sph = (w = 7, h = 5) => new THREE.SphereGeometry(1, w, h);

  // body
  add(sph(8, 6), green, [0, 0.09, -0.02], [0.11, 0.08, 0.15], [-0.15, 0, 0]);
  add(sph(8, 5), belly, [0, 0.045, 0.02], [0.095, 0.05, 0.13]);
  // rump
  add(sph(7, 5), dark, [0, 0.07, -0.12], [0.1, 0.07, 0.07]);
  // head
  add(sph(8, 6), green, [0, 0.13, 0.12], [0.1, 0.055, 0.085]);
  // mouth line
  add(new THREE.BoxGeometry(0.19, 0.006, 0.12), dark, [0, 0.105, 0.15]);
  // lower jaw hint
  add(sph(7, 4), light, [0, 0.1, 0.16], [0.085, 0.02, 0.06]);
  // nostrils
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.01, 0.008, 0.01), black, [s * 0.025, 0.15, 0.2]);

  // eyes
  for (const s of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(s * 0.065, 0.185, 0.115);
    root.add(eg);
    add(sph(7, 5), green, [0, -0.015, 0], [0.04, 0.03, 0.04], [0, 0, 0], eg);
    add(sph(8, 6), gold, [0, 0.005, 0.005], [0.036, 0.036, 0.036], [0, 0, 0], eg);
    add(new THREE.BoxGeometry(0.05, 0.012, 0.012), black, [s * 0.002, 0.005, 0.038], [0.7, 1, 1], [0, 0, 0], eg);
    add(sph(6, 4), black, [s * 0.008, 0.005, 0.03], [0.02, 0.028, 0.012], [0, 0, 0], eg);
  }

  // back spots
  for (let i = 0; i < 9; i++) {
    const x = (rnd() - 0.5) * 0.14, z = -0.12 + rnd() * 0.2;
    const y = 0.155 - Math.abs(x) * 0.25 + (z < -0.05 ? -0.02 : 0);
    const sc = 0.012 + rnd() * 0.014;
    add(sph(5, 3), spot, [x, y, z], [sc * 1.3, sc * 0.5, sc * 1.3]);
  }
  // pale side stripe
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.008, 0.01, 0.2), light, [s * 0.1, 0.1, -0.02], [1, 1, 1], [0, 0, 0.1 * s]);

  // front legs
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.014, 0.018, 0.1, 5), green, [s * 0.09, 0.055, 0.1], [1, 1, 1], [0.15, 0, s * 0.35]);
    const fg = new THREE.Group();
    fg.position.set(s * 0.115, 0.012, 0.15);
    root.add(fg);
    add(new THREE.BoxGeometry(0.05, 0.016, 0.05), green, [0, 0.004, 0.01], [1, 1, 1], [0, 0, 0], fg);
    for (let t = -1; t <= 1; t++) {
      add(new THREE.CylinderGeometry(0.005, 0.007, 0.04, 4), green, [t * 0.017, 0.004, 0.05], [1, 1, 1], [Math.PI / 2, 0, 0], fg);
      add(sph(5, 4), toe, [t * 0.017, 0.004, 0.072], [0.011, 0.008, 0.011], [0, 0, 0], fg);
    }
  }

  // hind legs
  for (const s of [-1, 1]) {
    // thigh
    add(sph(7, 5), dark, [s * 0.12, 0.075, -0.1], [0.04, 0.06, 0.1], [0.2, 0, s * -0.1]);
    // shin (folded back, pointing backward-up)
    add(new THREE.CylinderGeometry(0.016, 0.022, 0.15, 5), green, [s * 0.15, 0.04, -0.14], [1, 1, 1], [Math.PI / 2 + 0.1, 0, s * 0.25]);
    // foot
    const g = new THREE.Group();
    g.position.set(s * 0.17, 0.012, -0.03);
    g.rotation.y = s * 0.3;
    root.add(g);
    add(new THREE.BoxGeometry(0.04, 0.016, 0.1), green, [0, 0.004, 0.0], [1, 1, 1], [0, 0, 0], g);
    for (let t = -1.5; t <= 1.5; t++) {
      const sp = 0.016;
      add(new THREE.CylinderGeometry(0.004, 0.006, 0.07, 4), green, [t * sp, 0.004, 0.08], [1, 1, 1], [Math.PI / 2, 0, t * 0.12], g);
      add(sph(5, 4), toe, [t * sp * 1.25, 0.004, 0.118], [0.01, 0.008, 0.01], [0, 0, 0], g);
    }
    // web
    add(new THREE.BoxGeometry(0.075, 0.004, 0.06), light, [0, 0.002, 0.08], [1, 1, 1], [0, 0, 0], g);
  }

  // throat sac
  add(sph(7, 5), pink, [0, 0.085, 0.17], [0.04, 0.025, 0.04]);

  const group = new THREE.Group();
  group.add(root);
  group.scale.setScalar(1.6);
  return group;
}
```