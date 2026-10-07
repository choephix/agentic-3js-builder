```ts
import * as THREE from "three";

export const meta = {
  name: "Autumn Hedgehog",
  description: "A plump low-poly hedgehog on an evening walk, with a chestnut and cream spine dome and a red maple leaf trophy.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mat = (c: number, r = 0.85, m = 0) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const chestnut = mat(0x7a4223);
  const dark = mat(0x4f2a16);
  const cream = mat(0xf0dcae);
  const fawn = mat(0xd9a66e);
  const belly = mat(0xe8c795);
  const pink = mat(0xf0a0a8);
  const black = mat(0x0a0a0c, 0.2, 0.3);
  const white = mat(0xffffff, 0.3);
  const red = mat(0xc4281c);
  const stem = mat(0x6a2a14);

  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    p.add(o);
    return o;
  };

  // body base (fawn belly)
  const body = add(new THREE.SphereGeometry(0.17, 12, 9), belly, 0, 0.16, 0);
  body.scale.set(1, 0.85, 1.25);

  // spine dome
  const dome = add(new THREE.SphereGeometry(0.185, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), dark, 0, 0.14, -0.015);
  dome.scale.set(1.02, 1.0, 1.3);

  // spines
  const spineGeo = new THREE.ConeGeometry(0.014, 0.1, 4);
  spineGeo.translate(0, 0.05, 0);
  const tipGeo = new THREE.ConeGeometry(0.0085, 0.035, 4);
  tipGeo.translate(0, 0.0825, 0);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 230; i++) {
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(1 - rnd() * 1.05) * 0.95;
    if (ph > 1.95) continue;
    let dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    // skip face area (front, low)
    if (dir.z > 0.45 && dir.y < 0.65) continue;
    const pos = new THREE.Vector3(dir.x * 0.185 * 1.02, dir.y * 0.185, dir.z * 0.185 * 1.3);
    const d2 = dir.clone();
    d2.z -= 0.25; // sweep backward
    d2.normalize();
    const g = new THREE.Group();
    g.position.set(pos.x, pos.y + 0.14, pos.z - 0.015);
    g.quaternion.setFromUnitVectors(up, d2);
    g.rotateZ(rnd() * 3);
    const sc = 0.8 + rnd() * 0.6;
    g.scale.setScalar(sc);
    add(spineGeo, rnd() < 0.5 ? chestnut : dark, 0, 0, 0, g);
    add(tipGeo, cream, 0, 0, 0, g);
    root.add(g);
  }

  // face group
  const head = new THREE.Group();
  head.position.set(0, 0.12, 0.2);
  root.add(head);
  const skull = add(new THREE.SphereGeometry(0.095, 10, 8), fawn, 0, 0.02, 0.03, head);
  skull.scale.set(0.95, 0.9, 1.05);
  // snout
  const snout = add(new THREE.ConeGeometry(0.07, 0.17, 7), fawn, 0, -0.01, 0.15, head);
  snout.rotation.x = Math.PI / 2;
  snout.rotation.z = 0;
  snout.scale.set(1, 1, 0.8);
  const nose = add(new THREE.SphereGeometry(0.02, 8, 6), black, 0, -0.005, 0.24, head);
  nose.scale.set(1, 0.85, 1);
  add(new THREE.SphereGeometry(0.006, 5, 4), white, -0.007, 0.003, 0.256, head);
  // cheeks
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.038, 7, 6), pink, sx * 0.06, -0.025, 0.1, head).scale.set(1, 0.7, 0.6);
    // eyes
    add(new THREE.SphereGeometry(0.019, 8, 6), black, sx * 0.05, 0.05, 0.1, head);
    add(new THREE.SphereGeometry(0.006, 5, 4), white, sx * 0.055, 0.058, 0.115, head);
    // ears
    const ear = add(new THREE.SphereGeometry(0.03, 8, 6), fawn, sx * 0.075, 0.1, 0.0, head);
    ear.scale.set(1, 1, 0.55);
    add(new THREE.SphereGeometry(0.018, 6, 5), pink, sx * 0.076, 0.1, 0.012, head).scale.set(1, 1, 0.4);
    // whisker-ish brow tuft
    add(new THREE.ConeGeometry(0.01, 0.04, 4), cream, sx * 0.04, 0.095, 0.06, head).rotation.x = 0.6;
  }
  // fringe of cream spines over forehead
  for (let i = -3; i <= 3; i++) {
    const c = add(new THREE.ConeGeometry(0.014, 0.06, 4), i % 2 ? cream : chestnut, i * 0.026, 0.1, 0.0, head);
    c.rotation.x = 0.9;
    c.rotation.z = -i * 0.12;
  }

  // paws
  const legGeo = new THREE.CylinderGeometry(0.03, 0.036, 0.07, 7);
  const pawGeo = new THREE.SphereGeometry(0.037, 7, 6);
  const legs: [number, number][] = [[-1, 0.14], [1, 0.14], [-1, -0.12], [1, -0.12]];
  for (const [sx, z] of legs) {
    const x = sx * 0.1;
    add(legGeo, fawn, x, 0.065, z);
    const p = add(pawGeo, pink, x, 0.022, z + 0.015);
    p.scale.set(1, 0.6, 1.4);
    for (let t = -1; t <= 1; t++) add(new THREE.SphereGeometry(0.008, 5, 4), pink, x + t * 0.014, 0.014, z + 0.055).scale.set(1, 0.8, 1);
  }

  // tail nub
  const tail = add(new THREE.ConeGeometry(0.03, 0.06, 5), fawn, 0, 0.1, -0.27);
  tail.rotation.x = -Math.PI / 2 - 0.3;

  // maple leaf
  const leaf = new THREE.Group();
  const shape = new THREE.Shape();
  const pts: [number, number][] = [
    [0, -0.04], [0.012, -0.01], [0.05, -0.03], [0.04, 0.0], [0.07, 0.02], [0.05, 0.035],
    [0.058, 0.07], [0.03, 0.06], [0.0, 0.11], [-0.03, 0.06], [-0.058, 0.07], [-0.05, 0.035],
    [-0.07, 0.02], [-0.04, 0.0], [-0.05, -0.03], [-0.012, -0.01],
  ];
  pts.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const leafMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false }), red);
  leaf.add(leafMesh);
  add(new THREE.BoxGeometry(0.006, 0.06, 0.006), mat(0xe0521e), 0, 0.03, 0.008, leaf);
  add(new THREE.CylinderGeometry(0.004, 0.005, 0.05, 5), stem, 0, -0.06, 0.003, leaf);
  leaf.scale.setScalar(1.5);
  leaf.position.set(0.06, 0.3, -0.05);
  leaf.rotation.set(-0.9, 0.3, -0.5);
  root.add(leaf);

  return root;
}
```