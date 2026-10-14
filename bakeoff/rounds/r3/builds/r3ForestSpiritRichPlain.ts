import * as THREE from "three";

export const meta = {
  name: "Moss Stag Spirit",
  description: "A small forest spirit: river-stone body with moss, wooden legs and hooves, flowering antlers, a pale wooden mask face with glowing eyes, and circling fireflies.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, o: Partial<{ r: number; e: number; ec: number }> = {}) => {
    const k = c + "_" + (o.e || 0);
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.9, flatShading: true, emissive: o.ec ?? 0, emissiveIntensity: o.e ?? 0 });
    return mats[k];
  };
  const stone = M(0x7d8486), stone2 = M(0x646b6e), moss = M(0x4f8a3a), moss2 = M(0x6aa84a), moss3 = M(0x3a6b2e);
  const wood = M(0x7a5233), woodDark = M(0x4a3020), mask = M(0xe8dcc0), hoof = M(0x2b211b);
  const white = M(0xffffff), petalY = M(0xffd84a);
  const eyeM = M(0x66ff88, { e: 2, ec: 0x44ff66 });
  const flyM = M(0xfff59a, { e: 2.5, ec: 0xffee66 });
  const leafM = M(0x7fc05a);

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); p.add(o); return o;
  };

  // body stone
  const body = new THREE.Group(); body.position.set(0, 0.62, 0); root.add(body);
  const main = add(body, new THREE.IcosahedronGeometry(0.3, 1), stone);
  main.scale.set(0.9, 0.85, 1.4);
  const rump = add(body, new THREE.IcosahedronGeometry(0.22, 0), stone2, 0, 0.02, -0.28); rump.scale.set(1, 0.95, 1);
  const chest = add(body, new THREE.IcosahedronGeometry(0.2, 0), stone2, 0, 0.05, 0.3);
  // moss cap on back
  const cap = add(body, new THREE.IcosahedronGeometry(0.3, 1), moss, 0, 0.12, -0.03);
  cap.scale.set(0.85, 0.5, 1.3);
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2, r = 0.05 + rnd() * 0.2;
    const m = add(body, new THREE.IcosahedronGeometry(0.05 + rnd() * 0.06, 0), [moss, moss2, moss3][i % 3],
      Math.cos(a) * r * 1.1, 0.2 + rnd() * 0.08 - r * 0.2, Math.sin(a) * r * 2.0 - 0.03);
    m.scale.y = 0.6;
  }
  // moss patches on sides
  for (let i = 0; i < 6; i++) {
    const sd = i % 2 ? 1 : -1;
    const m = add(body, new THREE.IcosahedronGeometry(0.06 + rnd() * 0.03, 0), moss2, sd * 0.25, 0.0 + rnd() * 0.1, -0.3 + rnd() * 0.6);
    m.scale.x = 0.5;
  }
  // tail tuft
  add(body, new THREE.ConeGeometry(0.06, 0.18, 5), moss2, 0, 0.1, -0.5).rotation.x = -2;

  // legs
  const legPos: [number, number][] = [[0.14, 0.26], [-0.14, 0.26], [0.14, -0.28], [-0.14, -0.28]];
  legPos.forEach(([x, z], i) => {
    const g = new THREE.Group(); g.position.set(x, 0.48, z); root.add(g);
    add(g, new THREE.CylinderGeometry(0.035, 0.045, 0.26, 5), wood, 0, -0.12, 0);
    const lower = add(g, new THREE.CylinderGeometry(0.025, 0.033, 0.26, 5), woodDark, 0, -0.34, 0.01);
    add(g, new THREE.IcosahedronGeometry(0.045, 0), wood, 0, -0.22, 0);
    add(g, new THREE.CylinderGeometry(0.03, 0.04, 0.06, 5), hoof, 0, -0.45, 0.015);
    add(g, new THREE.BoxGeometry(0.06, 0.04, 0.02), moss2, 0, -0.04, 0.04 * (i < 2 ? 1 : -1));
    void lower;
  });

  // neck + head
  const neck = add(root, new THREE.CylinderGeometry(0.07, 0.11, 0.38, 6), wood, 0, 0.9, 0.38);
  neck.rotation.x = 0.4;
  add(root, new THREE.IcosahedronGeometry(0.09, 0), moss, 0, 0.9, 0.3).scale.set(1.2, 0.6, 1.2);
  const head = new THREE.Group(); head.position.set(0, 1.12, 0.5); root.add(head);
  add(head, new THREE.BoxGeometry(0.2, 0.26, 0.2), wood);
  const face = add(head, new THREE.BoxGeometry(0.22, 0.3, 0.05), mask, 0, 0, 0.12);
  face.rotation.x = 0.05;
  const snout = add(head, new THREE.BoxGeometry(0.1, 0.12, 0.1), mask, 0, -0.1, 0.17);
  add(head, new THREE.BoxGeometry(0.05, 0.04, 0.03), woodDark, 0, -0.1, 0.225);
  add(head, new THREE.BoxGeometry(0.03, 0.2, 0.03), woodDark, 0, 0.04, 0.15);
  [-1, 1].forEach(sd => {
    const e = add(head, new THREE.OctahedronGeometry(0.035, 0), eyeM, sd * 0.06, 0.05, 0.15);
    e.scale.set(1.2, 0.8, 0.6);
    add(head, new THREE.BoxGeometry(0.07, 0.015, 0.02), woodDark, sd * 0.06, 0.1, 0.15).rotation.z = sd * -0.3;
    const ear = add(head, new THREE.ConeGeometry(0.05, 0.16, 4), wood, sd * 0.13, 0.08, -0.02);
    ear.rotation.z = -sd * 1.1; ear.rotation.x = -0.2;
    add(head, new THREE.IcosahedronGeometry(0.03, 0), leafM, sd * 0.17, 0.1, -0.02);
  });
  void snout;
  add(head, new THREE.IcosahedronGeometry(0.1, 0), moss2, 0, 0.15, -0.02).scale.set(1.1, 0.5, 1);

  // flower
  const flower = (p: THREE.Object3D, x: number, y: number, z: number, sc: number) => {
    const f = new THREE.Group(); f.position.set(x, y, z); f.scale.setScalar(sc); p.add(f);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(f, new THREE.OctahedronGeometry(0.03, 0), white, Math.cos(a) * 0.03, Math.sin(a) * 0.03, 0).scale.set(1, 1, 0.4);
    }
    add(f, new THREE.IcosahedronGeometry(0.016, 0), petalY);
  };
  const leaf = (p: THREE.Object3D, x: number, y: number, z: number, rz: number) => {
    const l = add(p, new THREE.OctahedronGeometry(0.035, 0), leafM, x, y, z);
    l.scale.set(0.5, 1.3, 0.3); l.rotation.z = rz;
  };

  // antlers
  const branch = (p: THREE.Object3D, len: number, r: number, depth: number, rz: number, rx: number) => {
    const g = new THREE.Group(); g.rotation.set(rx, 0, rz); p.add(g);
    add(g, new THREE.CylinderGeometry(r * 0.65, r, len, 5), wood, 0, len / 2, 0);
    const tip = new THREE.Group(); tip.position.y = len; g.add(tip);
    if (depth > 0) {
      branch(tip, len * 0.8, r * 0.7, depth - 1, rz * 0.5 + 0.1, rx * 0.5 + 0.1);
      branch(tip, len * 0.6, r * 0.6, depth - 1, -0.7 - rnd() * 0.3, rx * 0.4 + 0.4);
      if (depth === 2) leaf(tip, 0.03, 0, 0, -0.6);
    } else {
      if (rnd() < 0.7) flower(tip, 0, 0.02, 0.01, 1); else leaf(tip, 0, 0.03, 0, rnd());
      leaf(tip, 0.03, -0.03, 0, -0.8);
    }
  };
  [-1, 1].forEach(sd => {
    const a = new THREE.Group(); a.position.set(sd * 0.07, 0.12, -0.03); a.rotation.z = -sd * 0.45; a.rotation.x = -0.15; head.add(a);
    branch(a, 0.25, 0.022, 2, -sd * 0.25, 0);
    const b = new THREE.Group(); b.position.y = 0.12; b.rotation.set(0.6, 0, -sd * 0.6); a.add(b);
    branch(b, 0.14, 0.014, 1, sd * 0.2, 0);
    flower(a, sd * 0.02, 0.1, 0.03, 1.1);
  });

  // fireflies
  const flies: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const f = add(root, new THREE.OctahedronGeometry(0.018, 0), flyM, Math.cos(a) * 0.38, 1.2 + Math.sin(i * 2.1) * 0.18 + 0.1, 0.5 + Math.sin(a) * 0.38);
    flies.push(f);
  }
  root.userData.fireflies = flies;

  // ground-tied floor sink
  root.position.y = 0.005;
  return root;
}
