import * as THREE from "three";

export const meta = {
  name: "Red-eyed Tree Frog on Leaf",
  description: "Stylized low-poly red-eyed tree frog clinging to a leaf, with ruby eyes, striped flanks and orange sticky toes.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.6) => {
    const k = c + "_" + r;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
    return mats[k];
  };
  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, p: number[], s: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(p[0], p[1], p[2]);
    o.scale.set(s[0], s[1], s[2]);
    o.rotation.set(r[0], r[1], r[2]);
    parent.add(o);
    return o;
  };
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  const green = M(0x6fd22a, 0.45), dark = M(0x4aa51e, 0.5), cream = M(0xf6efd0, 0.6);
  const blue = M(0x2a5fd8, 0.5), orange = M(0xff7a12, 0.5), red = M(0xd8062a, 0.25);
  const black = M(0x050505, 0.3), leafM = M(0x2f8a2e, 0.7), leafD = M(0x1f6a22, 0.7), vein = M(0x9ad06a, 0.7);
  const gold = M(0xffc83a, 0.3);

  // Leaf: tilted plane-ish shape
  const leaf = new THREE.Group();
  root.add(leaf);
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.28);
  shape.quadraticCurveTo(0.2, -0.15, 0.17, 0.05);
  shape.quadraticCurveTo(0.12, 0.25, 0, 0.4);
  shape.quadraticCurveTo(-0.12, 0.25, -0.17, 0.05);
  shape.quadraticCurveTo(-0.2, -0.15, 0, -0.28);
  const lg = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false });
  lg.rotateX(-Math.PI / 2);
  const leafMesh = add(leaf, lg, leafM, [0, 0, 0], [1.1, 1, 1.15]);
  leafMesh.position.y = 0.03;
  add(leaf, new THREE.BoxGeometry(0.01, 0.006, 0.62), vein, [0, 0.045, 0.06]);
  for (let i = -2; i <= 2; i++) {
    if (!i) continue;
    for (const s of [-1, 1]) {
      add(leaf, new THREE.BoxGeometry(0.1, 0.005, 0.008), vein, [s * 0.05, 0.045, i * 0.08 + 0.04], [1, 1, 1], [0, s * 0.6, 0]);
    }
  }
  add(leaf, new THREE.CylinderGeometry(0.008, 0.012, 0.25, 6), leafD, [0, 0.015, -0.42], [1, 1, 1], [Math.PI / 2, 0, 0]);
  leaf.position.set(0, 0.02, 0);
  // second smaller leaf behind
  const l2 = new THREE.Mesh(lg, leafD);
  l2.scale.set(0.9, 1, 0.9);
  l2.position.set(-0.25, 0.0, -0.1);
  l2.rotation.y = 1.0;
  root.add(l2);

  // Frog
  const frog = new THREE.Group();
  frog.position.set(0, 0.07, 0.02);
  root.add(frog);

  // body
  add(frog, sph(0.062, 12, 9), green, [0, 0.05, -0.03], [1.05, 0.8, 1.45], [0.1, 0, 0]);
  add(frog, sph(0.055, 10, 8), cream, [0, 0.025, -0.02], [0.95, 0.6, 1.35]);
  add(frog, sph(0.05, 10, 8), green, [0, 0.07, 0.05], [1.0, 0.8, 1.2]);
  // head
  add(frog, sph(0.05, 12, 9), green, [0, 0.085, 0.1], [1.15, 0.75, 1.0]);
  add(frog, sph(0.04, 10, 8), green, [0, 0.07, 0.14], [1.1, 0.6, 1.0]);
  // nostrils
  for (const s of [-1, 1]) add(frog, sph(0.004, 5, 4), dark, [s * 0.015, 0.088, 0.176]);
  // mouth line
  add(frog, new THREE.BoxGeometry(0.075, 0.004, 0.004), dark, [0, 0.056, 0.172]);
  // dorsal spots
  for (const [x, z] of [[-0.02, -0.04], [0.025, -0.07], [0.0, -0.1]]) add(frog, sph(0.007, 5, 4), gold, [x, 0.088, z], [1, 0.3, 1]);

  // eyes
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.045, 0.125, 0.115);
    frog.add(eye);
    add(eye, sph(0.03, 12, 10), red, [0, 0, 0]);
    add(eye, sph(0.017, 8, 6), gold, [s * 0.006, 0.001, 0.019], [1, 1, 0.35]);
    add(eye, new THREE.BoxGeometry(0.0055, 0.035, 0.006), black, [s * 0.006, 0.001, 0.0225]);
    // upper lid
    add(eye, sph(0.031, 8, 5), green, [0, 0.008, -0.004], [1, 0.45, 1]);
  }

  // flanks stripes
  for (const s of [-1, 1]) {
    add(frog, sph(0.05, 8, 7), blue, [s * 0.052, 0.045, -0.055], [0.3, 0.55, 1.0]);
    for (const z of [-0.02, -0.065, -0.1]) add(frog, new THREE.BoxGeometry(0.012, 0.05, 0.016), cream, [s * 0.063, 0.052, z], [1, 1, 1], [0, 0, s * 0.1]);
  }

  // toe builder
  const foot = (parent: THREE.Object3D, n: number, spread: number, len: number, dirs: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * spread;
      const g = new THREE.Group();
      g.rotation.y = a * dirs;
      parent.add(g);
      add(g, new THREE.CylinderGeometry(0.004, 0.005, len, 5), orange, [0, 0, len / 2], [1, 1, 1], [Math.PI / 2, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.0095, 0.0095, 0.005, 9), orange, [0, 0, len + 0.003], [1, 1, 1], [Math.PI / 2, 0, 0]);
      add(g, new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), M(0xffa040, 0.3), [0, 0.001, len + 0.003], [1, 1, 1], [Math.PI / 2, 0, 0]);
    }
  };

  for (const s of [-1, 1]) {
    // front legs
    const arm = new THREE.Group();
    arm.position.set(s * 0.045, 0.04, 0.07);
    frog.add(arm);
    add(arm, new THREE.CylinderGeometry(0.009, 0.012, 0.06, 6), green, [s * 0.015, -0.01, 0.01], [1, 1, 1], [0.2, 0, s * 0.8]);
    add(arm, sph(0.011, 6, 5), green, [s * 0.04, -0.03, 0.015]);
    add(arm, new THREE.CylinderGeometry(0.008, 0.009, 0.045, 6), green, [s * 0.05, -0.04, 0.035], [1, 1, 1], [1.2, 0, s * 0.2]);
    const hand = new THREE.Group();
    hand.position.set(s * 0.055, -0.056, 0.05);
    arm.add(hand);
    foot(hand, 4, 0.4, 0.04, 1);
    hand.children.forEach((c) => (c.rotation.y += s * 0.2));

    // hind legs folded
    const leg = new THREE.Group();
    leg.position.set(s * 0.06, 0.04, -0.09);
    frog.add(leg);
    add(leg, sph(0.032, 9, 7), green, [s * 0.006, 0.0, 0], [0.7, 1, 1.4]);
    add(leg, new THREE.CylinderGeometry(0.011, 0.016, 0.08, 6), green, [s * 0.035, -0.005, 0.035], [1, 1, 1], [1.3, 0, s * 0.3]);
    add(leg, sph(0.014, 6, 5), green, [s * 0.04, -0.01, 0.075]);
    add(leg, new THREE.CylinderGeometry(0.008, 0.011, 0.085, 6), green, [s * 0.055, -0.025, 0.04], [1, 1, 1], [1.45, 0, s * -0.3]);
    add(leg, new THREE.BoxGeometry(0.012, 0.012, 0.012), blue, [s * 0.082, -0.005, -0.005]);
    const hf = new THREE.Group();
    hf.position.set(s * 0.07, -0.04, 0.085);
    leg.add(hf);
    foot(hf, 4, 0.38, 0.05, 1);
    hf.children.forEach((c) => (c.rotation.y += s * 0.15));
  }

  frog.rotation.x = -0.08;
  const out = new THREE.Group();
  out.add(root);
  out.scale.setScalar(1.6);
  return out;
}
