```ts
import * as THREE from "three";

export const meta = {
  name: "Vintage Typewriter",
  description: "A stylized manual typewriter with round glass-topped keys, platen, paper, type bars and carriage levers, built from primitives.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.5, m = 0.1) => {
    const k = c + "_" + r + "_" + m;
    return (mats[k] ??= new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true }));
  };
  const body = M(0x2f6f6a, 0.45, 0.2);
  const dark = M(0x1c1c1f, 0.6, 0.2);
  const chrome = M(0xc9ced4, 0.25, 0.9);
  const rubber = M(0x111111, 0.9, 0);
  const paper = M(0xf4efe0, 0.9, 0);
  const cream = M(0xeee6cf, 0.4, 0.05);
  const red = M(0xb3262b, 0.5, 0.1);
  const brass = M(0xc9a13b, 0.35, 0.8);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // Base plinth
  add(box(0.4, 0.04, 0.38), dark, 0, 0.02, 0);
  // Lower body (sloped via stacked boxes)
  add(box(0.38, 0.07, 0.36), body, 0, 0.075, 0);
  add(box(0.36, 0.06, 0.3), body, 0, 0.14, -0.02);
  // Keyboard sloped deck
  const deck = add(box(0.34, 0.025, 0.2), body, 0, 0.17, 0.1);
  deck.rotation.x = 0.35;
  // Rear housing
  add(box(0.36, 0.14, 0.14), body, 0, 0.23, -0.1);
  // Upper front panel (type basket cover)
  const cover = add(box(0.3, 0.03, 0.12), body, 0, 0.32, -0.02);
  cover.rotation.x = -0.4;
  // Side plates
  for (const s of [-1, 1]) {
    add(box(0.02, 0.2, 0.3), body, s * 0.19, 0.17, -0.02);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), chrome, s * 0.2, 0.2, 0.0).rotation.z = Math.PI / 2;
  }

  // Keys: 4 rows, sloped
  const keyGeo = new THREE.CylinderGeometry(0.0115, 0.0115, 0.014, 8);
  const ringGeo = new THREE.CylinderGeometry(0.0135, 0.0135, 0.008, 8);
  const rows = [10, 11, 10, 9];
  const keyG = new THREE.Group();
  keyG.position.set(0, 0.185, 0.1);
  keyG.rotation.x = 0.35;
  root.add(keyG);
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.028 + (r % 2) * 0.004;
      const z = -0.07 + r * 0.04;
      add(ringGeo, chrome, x, 0.004, z, keyG);
      add(keyGeo, i % 7 === 3 && r === 0 ? red : cream, x, 0.014, z, keyG).rotation.y = rnd();
    }
  });
  // Space bar
  add(box(0.18, 0.012, 0.022), cream, 0, 0.012, 0.105, keyG);

  // Type bars fan
  for (let i = 0; i < 15; i++) {
    const a = (i / 14 - 0.5) * 1.6;
    const g = new THREE.Group();
    g.position.set(0, 0.3, 0.0);
    g.rotation.y = a * 0.35;
    root.add(g);
    const bar = add(box(0.004, 0.004, 0.1), chrome, 0, 0.0, 0.06, g);
    bar.rotation.x = -0.5;
    add(box(0.008, 0.012, 0.008), dark, 0, 0.04, 0.1, g);
  }
  // Ribbon spools
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 10), chrome, s * 0.12, 0.345, -0.07);
    add(new THREE.CylinderGeometry(0.025, 0.025, 0.016, 10), rubber, s * 0.12, 0.347, -0.07);
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), brass, s * 0.12, 0.36, -0.07);
  }

  // Carriage
  const car = new THREE.Group();
  car.position.set(0, 0.36, -0.15);
  root.add(car);
  add(box(0.5, 0.025, 0.05), body, 0, -0.06, 0, car);
  add(box(0.5, 0.01, 0.01), chrome, 0, -0.04, 0.03, car);
  // Platen
  const platen = add(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 10), rubber, 0, 0, 0, car);
  platen.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), chrome, s * 0.245, 0, 0, car).rotation.z = Math.PI / 2;
    const knob = add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), dark, s * 0.28, 0, 0, car);
    knob.rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), chrome, s * 0.3, 0, 0, car).rotation.z = Math.PI / 2;
    add(box(0.02, 0.1, 0.06), chrome, s * 0.25, -0.03, 0, car);
  }
  // Carriage return lever
  const lev = add(box(0.01, 0.01, 0.12), chrome, 0.27, 0.05, 0.05, car);
  lev.rotation.x = 0.2;
  add(new THREE.SphereGeometry(0.014, 6, 5), red, 0.27, 0.055, 0.115, car);
  // Paper
  const pap = add(box(0.3, 0.26, 0.004), paper, 0, 0.14, -0.04, car);
  pap.rotation.x = -0.12;
  const pap2 = add(box(0.3, 0.06, 0.004), paper, 0, 0.0, 0.045, car);
  pap2.rotation.x = 0.3;
  // text lines
  for (let i = 0; i < 6; i++) {
    const w = 0.12 + rnd() * 0.14;
    const l = add(box(w, 0.004, 0.002), dark, (w - 0.26) / 2, 0.08 + i * 0.03, -0.0365 - i * 0.0036, car);
    l.rotation.x = -0.12;
  }
  // Paper bail
  add(box(0.4, 0.006, 0.006), chrome, 0, 0.04, 0.045, car);
  // Feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.CylinderGeometry(0.02, 0.025, 0.02, 6), rubber, sx * 0.17, 0.01, sz * 0.15);

  // Badge
  add(box(0.08, 0.02, 0.004), brass, 0, 0.12, 0.146);

  root.scale.setScalar(1);
  return root;
}
```