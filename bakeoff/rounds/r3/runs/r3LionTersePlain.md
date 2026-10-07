```ts
import * as THREE from "three";

export const meta = {
  name: "Lion",
  description: "Stylized low-poly male lion built from primitives, with a faceted mane, tufted tail and canvas-textured coat.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  // canvas fur texture
  const mkTex = (base: string, spots: string, n: number) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = base;
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < n; i++) {
      g.fillStyle = spots;
      g.globalAlpha = 0.25;
      g.fillRect(rnd() * 64, rnd() * 64, 1 + rnd() * 2, 3 + rnd() * 5);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return t;
  };
  const M = (color: number | THREE.Texture, rough = 0.9) =>
    new THREE.MeshStandardMaterial(
      typeof color === "number"
        ? { color, roughness: rough, flatShading: true }
        : { map: color, roughness: rough, flatShading: true }
    );
  const fur = M(mkTex("#d49a4c", "#a8702e", 200));
  const furLight = M(0xecc98a);
  const mane = M(mkTex("#6b3a17", "#2e1707", 300));
  const maneDark = M(0x45240e);
  const dark = M(0x1c1008);
  const pink = M(0x3a1a1a);
  const white = M(0xfaf6ea, 0.5);
  const eye = M(0xe8a010, 0.3);

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    p.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // body
  add(root, box(0.55, 0.62, 1.0), fur, 0, 1.0, -0.05);
  add(root, box(0.62, 0.7, 0.5), fur, 0, 1.05, 0.4); // chest/shoulders
  add(root, box(0.5, 0.5, 0.45), fur, 0, 0.98, -0.6); // hips
  add(root, box(0.45, 0.2, 0.9), furLight, 0, 0.7, 0.0); // belly

  // legs
  const leg = (x: number, z: number, front: boolean) => {
    const g = new THREE.Group();
    g.position.set(x, 0.75, z);
    add(g, box(front ? 0.2 : 0.24, 0.45, front ? 0.22 : 0.3), fur, 0, -0.1, front ? 0 : -0.02);
    add(g, box(0.15, 0.4, 0.17), fur, 0, -0.4, 0.02);
    add(g, box(0.2, 0.1, 0.3), furLight, 0, -0.68, 0.06);
    for (let i = -1; i <= 1; i++) add(g, box(0.04, 0.04, 0.05), white, i * 0.06, -0.7, 0.22);
    root.add(g);
  };
  leg(0.2, 0.5, true);
  leg(-0.2, 0.5, true);
  leg(0.22, -0.62, false);
  leg(-0.22, -0.62, false);

  // tail
  const tail = new THREE.Group();
  tail.position.set(0, 1.1, -0.85);
  tail.rotation.x = 0.5;
  root.add(tail);
  for (let i = 0; i < 5; i++) {
    add(tail, box(0.08, 0.08, 0.2), fur, 0, 0.0 - i * 0.02, -0.1 - i * 0.2).rotation.x = -0.15 * i;
  }
  const tuft = add(tail, new THREE.OctahedronGeometry(0.13), maneDark, 0, -0.18, -1.15, 1, 1, 1.8);
  tuft.rotation.x = -0.5;

  // head
  const head = new THREE.Group();
  head.position.set(0, 1.35, 0.85);
  root.add(head);
  // mane: layered faceted blobs
  const maneGeo = new THREE.IcosahedronGeometry(0.5, 0);
  add(head, maneGeo, mane, 0, 0.0, -0.15, 1.15, 1.2, 0.9);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 0.5;
    const m = add(head, new THREE.OctahedronGeometry(0.2), i % 2 ? mane : maneDark, Math.cos(a) * r, Math.sin(a) * r * 1.05, -0.2 - rnd() * 0.1, 1, 1.3, 1.2);
    m.rotation.z = a;
  }
  // mane drapes down chest and back
  add(root, new THREE.IcosahedronGeometry(0.4, 0), mane, 0, 1.0, 0.6, 1.3, 1.0, 1.0);
  add(root, new THREE.IcosahedronGeometry(0.3, 0), maneDark, 0, 1.4, 0.3, 1.2, 0.7, 1.4);
  add(root, new THREE.IcosahedronGeometry(0.28, 0), mane, 0, 0.75, 0.75, 1.3, 0.8, 0.8);

  // face
  add(head, box(0.45, 0.42, 0.35), fur, 0, -0.03, 0.2);
  add(head, box(0.3, 0.2, 0.28), furLight, 0, -0.14, 0.42); // muzzle
  add(head, box(0.12, 0.08, 0.06), pink, 0, -0.02, 0.58); // nose
  add(head, box(0.04, 0.1, 0.04), dark, 0, -0.12, 0.58);
  add(head, box(0.2, 0.05, 0.06), dark, 0, -0.27, 0.5);
  add(head, box(0.2, 0.08, 0.2), furLight, 0, -0.3, 0.4); // chin
  add(head, box(0.34, 0.1, 0.12), fur, 0, 0.13, 0.35); // brow ridge
  for (const sx of [-1, 1]) {
    add(head, box(0.09, 0.07, 0.05), eye, sx * 0.14, 0.08, 0.38);
    add(head, box(0.03, 0.05, 0.03), dark, sx * 0.14, 0.08, 0.41);
    add(head, box(0.1, 0.03, 0.05), dark, sx * 0.14, 0.135, 0.39);
    const ear = add(head, new THREE.CylinderGeometry(0.05, 0.11, 0.1, 5), fur, sx * 0.27, 0.3, 0.05);
    ear.rotation.z = -sx * 0.2;
    add(head, new THREE.CylinderGeometry(0.02, 0.07, 0.04, 5), pink, sx * 0.27, 0.3, 0.1).rotation.x = Math.PI / 2 * 0.3;
    for (let i = 0; i < 3; i++) add(head, box(0.015, 0.015, 0.1), white, sx * 0.1, -0.15 - i * 0.02, 0.55).rotation.y = sx * (0.2 + i * 0.2);
  }

  root.position.y = 0.02;
  return root;
}
```