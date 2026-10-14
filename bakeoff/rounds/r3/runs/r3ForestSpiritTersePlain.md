```ts
import * as THREE from "three";

export const meta = {
  name: "Forest Spirit",
  description: "A stag-like woodland spirit with antlers of branching wood, a pale mask face, moss mantle, glowing runes and drifting leaf wisps.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, e = 0, rough = 0.85) => {
    const k = c + "_" + e;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true, emissive: e ? c : 0x000000, emissiveIntensity: e });
    return mats[k];
  };
  const g = new THREE.Group();
  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, rz);
    parent.add(o);
    return o;
  };
  const fur = M(0xd9d2b8), dark = M(0x4a3a2a), bark = M(0x6b4a30), moss = M(0x4f8a3a), moss2 = M(0x73b04a),
    glow = M(0x7dffd0, 1.2), mask = M(0xf3efe0), leaf1 = M(0xe0a030, 0.3), leaf2 = M(0xc8502a, 0.3), black = M(0x151515);

  // body
  add(g, new THREE.BoxGeometry(0.7, 0.75, 1.5), fur, 0, 1.25, 0);
  add(g, new THREE.BoxGeometry(0.76, 0.3, 1.0), moss, 0, 1.68, -0.1);
  add(g, new THREE.BoxGeometry(0.5, 0.3, 0.5), fur, 0, 1.45, 0.75);
  // moss tufts
  for (let i = 0; i < 16; i++) {
    const w = 0.15 + rnd() * 0.2;
    add(g, new THREE.IcosahedronGeometry(w, 0), rnd() > 0.5 ? moss : moss2,
      (rnd() - 0.5) * 0.7, 1.75 + rnd() * 0.15, (rnd() - 0.5) * 1.3, rnd(), rnd(), rnd());
  }
  // legs
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.25, 0.9, sz * 0.55);
    g.add(leg);
    add(leg, new THREE.BoxGeometry(0.2, 0.5, 0.24), fur, 0, -0.2, 0);
    add(leg, new THREE.BoxGeometry(0.14, 0.5, 0.16), fur, 0, -0.6, 0.03 * sz);
    add(leg, new THREE.BoxGeometry(0.19, 0.12, 0.26), dark, 0, -0.84, 0.04);
    add(leg, new THREE.BoxGeometry(0.22, 0.06, 0.22), moss2, 0, -0.3, 0);
  }
  // neck + head
  const neck = new THREE.Group();
  neck.position.set(0, 1.5, 0.75);
  neck.rotation.x = 0.5;
  g.add(neck);
  add(neck, new THREE.BoxGeometry(0.34, 0.8, 0.36), fur, 0, 0.35, 0);
  add(neck, new THREE.BoxGeometry(0.38, 0.4, 0.2), moss, 0, 0.55, -0.15);
  const head = new THREE.Group();
  head.position.set(0, 2.45, 1.15);
  g.add(head);
  add(head, new THREE.BoxGeometry(0.42, 0.45, 0.5), mask, 0, 0, 0);
  add(head, new THREE.BoxGeometry(0.28, 0.26, 0.35), mask, 0, -0.12, 0.35, 0.2);
  add(head, new THREE.BoxGeometry(0.1, 0.08, 0.06), black, 0, -0.14, 0.55);
  for (const sx of [-1, 1]) {
    add(head, new THREE.BoxGeometry(0.1, 0.16, 0.04), glow, sx * 0.13, 0.05, 0.26, 0, 0, sx * -0.3);
    add(head, new THREE.BoxGeometry(0.06, 0.2, 0.04), dark, sx * 0.1, -0.2, 0.34, 0, 0, 0);
    add(head, new THREE.ConeGeometry(0.1, 0.45, 4), fur, sx * 0.3, 0.1, -0.1, 0, 0, sx * -1.2);
    add(head, new THREE.ConeGeometry(0.05, 0.3, 4), moss2, sx * 0.3, 0.1, -0.08, 0, 0, sx * -1.2);
    // antlers
    const ant = new THREE.Group();
    ant.position.set(sx * 0.15, 0.2, -0.1);
    head.add(ant);
    let ay = 0, ax = 0;
    for (let i = 0; i < 4; i++) {
      add(ant, new THREE.CylinderGeometry(0.04 - i * 0.007, 0.05 - i * 0.007, 0.5, 5), bark, sx * ax, ay + 0.22, -i * 0.05, 0, 0, sx * -0.25);
      for (const d of [0, 1]) {
        const L = 0.45 - i * 0.07;
        const b = add(ant, new THREE.CylinderGeometry(0.015, 0.03, L, 5), bark, sx * (ax + 0.1), ay + 0.3 + L * 0.3, -0.1 - d * 0.1 + (i * -0.03), d ? -0.9 : 0.1, 0, sx * (-0.9 - d * 0.2));
        add(ant, new THREE.IcosahedronGeometry(0.06, 0), glow, sx * (ax + 0.1 + sx * sx * L * 0.7), ay + 0.3 + L * 0.8, -0.1 - d * 0.25).visible = i % 2 === 0;
        void b;
      }
      ay += 0.42; ax += 0.1;
    }
    add(ant, new THREE.IcosahedronGeometry(0.07, 0), glow, sx * ax, ay + 0.25, -0.2);
  }
  // glowing runes on flank
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
    add(g, new THREE.BoxGeometry(0.02, 0.22, 0.05), glow, sx * 0.355, 1.3 + (i % 2) * 0.1, -0.3 + i * 0.35, 0, 0, i * 0.5);
    add(g, new THREE.BoxGeometry(0.02, 0.05, 0.2), glow, sx * 0.355, 1.15, -0.3 + i * 0.35);
  }
  // tail
  const tail = add(g, new THREE.ConeGeometry(0.18, 0.7, 5), moss2, 0, 1.6, -0.95, -2.0, 0, 0);
  tail.scale.set(1, 1, 1);
  // leaf wisps
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, r = 0.8 + rnd() * 0.9;
    add(g, new THREE.OctahedronGeometry(0.06 + rnd() * 0.05, 0), rnd() > 0.5 ? leaf1 : leaf2,
      Math.cos(a) * r, 0.3 + rnd() * 2.6, Math.sin(a) * r * 1.2, rnd() * 3, rnd() * 3, rnd() * 3).scale.set(1, 0.3, 1.6);
  }
  // roots at base
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05;
    add(g, new THREE.BoxGeometry(0.06, 0.04, 0.4), bark, Math.cos(a) * 0.9, 0.01, Math.sin(a) * 1.2, 0, -a, 0);
  }
  return g;
}
```