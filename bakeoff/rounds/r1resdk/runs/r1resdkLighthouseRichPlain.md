```ts
import * as THREE from "three";

export const meta = {
  name: "Lighthouse Island Diorama",
  description: "Cozy lighthouse on a tiny rocky island with cottage, jetty, rowboat, gulls, flowers and turquoise sea on a round base.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const k = c + JSON.stringify(o);
    return (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o }));
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 12) => new THREE.CylinderGeometry(rt, rb, h, n);

  // striped texture for tower
  const cv = document.createElement("canvas");
  cv.width = 8; cv.height = 128;
  const cx = cv.getContext("2d")!;
  for (let i = 0; i < 4; i++) {
    cx.fillStyle = i % 2 ? "#f5f0e8" : "#c8342c";
    cx.fillRect(0, i * 32, 8, 32);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const stripeM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, flatShading: true });

  // base
  add(cyl(2.6, 2.7, 0.3, 32), M(0x5a3b24), 0, 0.15, 0);
  add(cyl(2.7, 2.7, 0.06, 32), M(0xc9a35a, { metalness: 0.5, roughness: 0.4 }), 0, 0.2, 0);
  const water = add(cyl(2.55, 2.55, 0.5, 32), M(0x27b5b8, { roughness: 0.25, transparent: true, opacity: 0.92 }), 0, 0.4, 0);
  add(cyl(2.55, 2.55, 0.02, 32), M(0x7fe3e0, { roughness: 0.2 }), 0, 0.66, 0);
  void water;

  // island
  const island = new THREE.Group();
  root.add(island);
  add(new THREE.CylinderGeometry(1.6, 1.9, 0.45, 9), M(0x7b7a78), 0, 0.75, 0, island);
  add(new THREE.CylinderGeometry(1.35, 1.6, 0.2, 9), M(0x6fa84a), 0, 1.07, 0, island);
  // foam rings
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 1.85 + rnd() * 0.15;
    add(new THREE.IcosahedronGeometry(0.16 + rnd() * 0.08, 0), M(0xffffff), Math.cos(a) * r, 0.68, Math.sin(a) * r).scale.y = 0.4;
  }
  // rocks
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 1.35 + rnd() * 0.45;
    const sz = 0.12 + rnd() * 0.2;
    const m = add(new THREE.DodecahedronGeometry(sz, 0), M(rnd() > 0.5 ? 0x8a8984 : 0x6b6a68), Math.cos(a) * r, 0.85 + sz * 0.4, Math.sin(a) * r);
    m.rotation.set(rnd() * 3, rnd() * 3, 0);
  }
  // grass and flowers
  const fc = [0xffd23f, 0xff7ab0, 0xffffff, 0xb78cf0];
  for (let i = 0; i < 30; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.5 + rnd() * 0.95;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > -0.2 && x < 1.1 && z > 0.1 && z < 0.9) continue;
    add(new THREE.ConeGeometry(0.05, 0.2, 4), M(0x4f9a3a), x, 1.27, z);
    if (i % 2 === 0) {
      add(cyl(0.01, 0.01, 0.2, 3), M(0x3d7a2e), x + 0.06, 1.27, z);
      add(new THREE.OctahedronGeometry(0.05, 0), M(fc[i % 4]), x + 0.06, 1.4, z);
    }
  }

  // lighthouse
  const lx = -0.5, lz = -0.2;
  const L = new THREE.Group();
  L.position.set(lx, 1.17, lz);
  root.add(L);
  add(cyl(0.5, 0.55, 0.15, 12), M(0x777777), 0, 0.07, 0, L);
  add(cyl(0.28, 0.42, 1.9, 12), stripeM, 0, 1.1, 0, L);
  add(cyl(0.42, 0.3, 0.1, 12), M(0x222428), 0, 2.1, 0, L);
  add(cyl(0.46, 0.46, 0.05, 12), M(0x222428), 0, 2.17, 0, L);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    add(cyl(0.012, 0.012, 0.16, 4), M(0x222428), Math.cos(a) * 0.44, 2.27, Math.sin(a) * 0.44, L);
  }
  add(new THREE.TorusGeometry(0.44, 0.015, 4, 12), M(0x222428), 0, 2.35, 0, L).rotation.x = Math.PI / 2;
  add(cyl(0.2, 0.2, 0.35, 8), M(0xffe27a, { emissive: 0xffc83a, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 }), 0, 2.37, 0, L);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    add(cyl(0.012, 0.012, 0.38, 4), M(0x222428), Math.cos(a) * 0.21, 2.37, Math.sin(a) * 0.21, L);
  }
  add(cyl(0.05, 0.24, 0.16, 8), M(0xc8342c), 0, 2.62, 0, L);
  add(new THREE.ConeGeometry(0.24, 0.25, 8), M(0x222428), 0, 2.72, 0, L);
  add(new THREE.SphereGeometry(0.04, 6, 4), M(0x222428), 0, 2.88, 0, L);
  // door & windows
  add(box(0.14, 0.26, 0.05), M(0x6b4423), 0, 0.28, 0.44, L);
  for (const y of [0.9, 1.5]) add(box(0.08, 0.14, 0.05), M(0x2a3b55), 0, y, 0.33 - (y - 0.9) * 0.1, L);
  const pl = new THREE.PointLight(0xffd98a, 2, 4);
  pl.position.set(0, 2.4, 0);
  L.add(pl);

  // cottage
  const C = new THREE.Group();
  C.position.set(0.55, 1.17, 0.35);
  C.rotation.y = -0.4;
  root.add(C);
  add(box(0.8, 0.4, 0.55), M(0xf1e4c8), 0, 0.2, 0, C);
  add(box(0.84, 0.04, 0.59), M(0x8a8a8a), 0, 0.01, 0, C);
  const roof = add(new THREE.CylinderGeometry(0.02, 0.5, 0.3, 4), M(0x8c3b2e), 0, 0.55, 0, C);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.15, 1, 0.8);
  add(box(0.13, 0.25, 0.04), M(0x2f6fd0), -0.15, 0.13, 0.29, C);
  add(new THREE.SphereGeometry(0.012, 5, 4), M(0xffd23f), -0.11, 0.13, 0.32, C);
  add(box(0.14, 0.14, 0.04), M(0xffe27a, { emissive: 0xffb830, emissiveIntensity: 0.8 }), 0.2, 0.25, 0.29, C);
  add(box(0.18, 0.02, 0.07), M(0x6b4423), 0.2, 0.16, 0.31, C);
  // crooked chimney
  const ch = add(box(0.11, 0.3, 0.11), M(0x9a5a44), 0.25, 0.65, -0.05, C);
  ch.rotation.z = -0.15;
  add(box(0.14, 0.04, 0.14), M(0x555555), 0.28, 0.8, -0.05, C).rotation.z = -0.15;
  for (let i = 0; i < 3; i++) add(new THREE.IcosahedronGeometry(0.04 + i * 0.015, 0), M(0xeeeeee, { transparent: true, opacity: 0.6 }), 0.3 + i * 0.05, 0.9 + i * 0.1, -0.05, C);

  // jetty
  const J = new THREE.Group();
  J.position.set(1.5, 0, 1.0);
  J.rotation.y = -0.9;
  root.add(J);
  const wood = M(0x9a6a3c), dark = M(0x5e3d20);
  for (let i = 0; i < 9; i++) add(box(0.34, 0.04, 0.09), i % 2 ? wood : M(0xa87646), 0, 1.05, i * 0.1 - 0.2, J);
  for (const sx of [-0.15, 0.15]) for (const k of [0, 4, 8]) add(cyl(0.025, 0.025, 0.5, 5), dark, sx, 0.85, k * 0.1 - 0.2, J);
  J.position.set(1.35, 0, 1.0);
  J.position.y = 0;
  J.scale.set(1, 1, 1);
  J.rotation.y = 0.9 + Math.PI;
  J.position.set(1.3, 0, 1.05);
  J.rotation.y = -0.8;
  J.children.forEach(c => (c.position.z += 0.6));

  // rowboat
  const B = new THREE.Group();
  B.position.set(1.95, 0.7, 1.55);
  B.rotation.y = -0.2;
  root.add(B);
  add(box(0.3, 0.04, 0.6), M(0xb8864a), 0, 0, 0, B);
  for (const sx of [-1, 1]) {
    const w = add(box(0.03, 0.14, 0.62), M(0x2f6fd0), sx * 0.16, 0.07, 0, B);
    w.rotation.z = sx * -0.2;
  }
  const bow = add(box(0.2, 0.14, 0.03), M(0x2f6fd0), 0, 0.07, 0.32, B);
  bow.rotation.x = 0.3;
  add(box(0.28, 0.14, 0.03), M(0x2f6fd0), 0, 0.07, -0.31, B);
  add(box(0.28, 0.025, 0.07), M(0xd9b27a), 0, 0.09, 0, B);
  add(cyl(0.01, 0.01, 0.5, 4), M(0xd9b27a), 0.1, 0.12, 0.05, B).rotation.set(0.2, 0, 1.2);
  // rope
  const rope = add(cyl(0.008, 0.008, 0.7, 4), M(0xe0cfa0), 1.67, 0.9, 1.35);
  rope.rotation.set(Math.PI / 2, 0, 0.6);
  rope.rotation.order = "YXZ";
  rope.rotation.set(Math.PI / 2, 0.75, 0);
  rope.scale.y = 0.6;

  // gulls
  const gull = (x: number, y: number, z: number, ry: number, fly: boolean) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    root.add(g);
    const w = M(0xffffff), gr = M(0x9aa3ad);
    add(new THREE.SphereGeometry(0.07, 6, 5), w, 0, 0, 0, g).scale.set(0.8, 0.8, 1.4);
    add(new THREE.SphereGeometry(0.045, 6, 5), w, 0, 0.06, 0.1, g);
    add(new THREE.ConeGeometry(0.015, 0.05, 4), M(0xffb020), 0, 0.06, 0.16, g).rotation.x = Math.PI / 2;
    add(box(0.03, 0.02, 0.08), gr, 0, 0.01, -0.14, g);
    for (const sx of [-1, 1]) {
      const wing = add(box(0.2, 0.01, 0.09), gr, sx * 0.13, 0.02, 0, g);
      wing.rotation.z = fly ? sx * 0.3 : sx * -0.1;
      if (!fly) wing.position.set(sx * 0.07, 0.02, -0.02), (wing.scale.x = 0.6);
      add(box(0.06, 0.012, 0.05), M(0x222222), sx * (fly ? 0.24 : 0.12), fly ? 0.05 : 0.0, 0, g);
    }
    if (!fly) for (const sx of [-1, 1]) add(cyl(0.005, 0.005, 0.06, 3), M(0xffb020), sx * 0.025, -0.06, 0, g);
  };
  gull(-1.0, 1.4, 0.6, 0.6, false);
  gull(-0.1, 1.9, 1.2, 2.2, true);
  gull(1.1, 2.3, -0.8, 4, true);

  // buoy
  add(cyl(0.07, 0.09, 0.14, 8), M(0xc8342c), -1.8, 0.72, 1.2);
  add(cyl(0.08, 0.08, 0.04, 8), M(0xffffff), -1.8, 0.74, 1.2);
  add(new THREE.ConeGeometry(0.05, 0.1, 6), M(0xc8342c), -1.8, 0.84, 1.2);

  return root;
}
```