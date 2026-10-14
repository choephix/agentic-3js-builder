import * as THREE from "three";

export const meta = {
  name: "Sleepy Koala on Eucalyptus",
  description: "A drowsy low-poly koala hugging a eucalyptus branch, holding a leafy sprig mid-munch.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (hex: number, rough = 0.95) => {
    const k = hex + "_" + rough;
    return (mats[k] ||= new THREE.MeshStandardMaterial({ color: hex, roughness: rough, flatShading: true }));
  };
  const grey = M(0x9a9ea3), dark = M(0x7c8085), cream = M(0xf1e6cc), black = M(0x1b1a1c, 0.5);
  const brown = M(0x4a2e1e, 0.4), bark = M(0x8b6a50), bark2 = M(0x6e5240);
  const leafA = M(0x6f9f93), leafB = M(0x5a8a80), leafC = M(0x86b3a5), claw = M(0x2a2523, 0.6);
  const pink = M(0xd9a0a0);

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    p.add(o);
    return o;
  };
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // Branch: vertical-ish trunk the koala hugs, slight tilt
  const trunk = new THREE.Group();
  root.add(trunk);
  add(trunk, new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8), bark, 0, 0.75, -0.02);
  for (let i = 0; i < 7; i++) {
    const a = rnd() * 6.28;
    add(trunk, new THREE.BoxGeometry(0.04, 0.2 + rnd() * 0.2, 0.03), bark2, Math.cos(a) * 0.115, 0.15 + rnd() * 1.2, -0.02 + Math.sin(a) * 0.115).rotation.y = -a;
  }
  // base block
  add(root, new THREE.CylinderGeometry(0.28, 0.32, 0.06, 8), bark2, 0, 0.03, -0.02);
  // side branch with leaves
  const sb = new THREE.Group();
  sb.position.set(-0.05, 1.25, -0.05);
  sb.rotation.z = 0.9;
  trunk.add(sb);
  add(sb, new THREE.CylinderGeometry(0.025, 0.04, 0.5, 6), bark, 0, 0.25, 0);
  const leaf = (p: THREE.Object3D, x: number, y: number, z: number, ry: number, rz: number, m: THREE.Material, sc = 1) => {
    const l = add(p, sph(0.06, 5, 4), m, x, y, z, 0.35 * sc, 1.1 * sc, 0.12 * sc);
    l.rotation.set(0, ry, rz);
  };
  for (let i = 0; i < 14; i++) {
    const m = [leafA, leafB, leafC][i % 3];
    leaf(sb, (rnd() - 0.5) * 0.18, 0.2 + rnd() * 0.45, (rnd() - 0.5) * 0.18, rnd() * 3, (rnd() - 0.5) * 1.6, m, 1.3);
  }
  // top leaves of trunk
  for (let i = 0; i < 10; i++) {
    leaf(trunk, (rnd() - 0.5) * 0.3, 1.5 + rnd() * 0.15, (rnd() - 0.5) * 0.3, rnd() * 3, (rnd() - 0.5) * 1.5, [leafA, leafB, leafC][i % 3], 1.4);
  }

  // Koala, sitting in front of trunk (trunk at z≈0), body leans onto it
  const k = new THREE.Group();
  k.position.set(0, 0, 0);
  root.add(k);

  // Body
  add(k, sph(0.3, 10, 8), grey, 0, 0.62, 0.3, 1, 1.15, 0.95);
  add(k, sph(0.22, 8, 6), cream, 0, 0.66, 0.5, 0.95, 1.1, 0.5); // chest
  // rump
  add(k, sph(0.27, 9, 7), dark, 0, 0.32, 0.28, 1.1, 0.8, 1.0);
  // fur tufts on chest
  for (let i = 0; i < 6; i++) {
    const t = add(k, new THREE.ConeGeometry(0.03, 0.07, 4), cream, (i % 3 - 1) * 0.07, 0.55 + Math.floor(i / 3) * 0.1, 0.65);
    t.rotation.x = Math.PI / 2 + 0.3;
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0.03, 1.08, 0.45);
  head.rotation.set(0.12, 0.0, 0.12);
  k.add(head);
  add(head, sph(0.27, 12, 9), grey, 0, 0, 0, 1.2, 1, 1);
  add(head, sph(0.2, 8, 6), cream, 0, -0.1, 0.1, 1.05, 0.7, 0.9); // cheeks
  // ears
  for (const sx of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(sx * 0.3, 0.17, -0.02);
    head.add(e);
    add(e, sph(0.15, 9, 7), grey, 0, 0, 0, 1, 1, 0.55);
    add(e, sph(0.115, 8, 6), cream, 0, 0, 0.04, 1, 1, 0.5);
    for (let i = 0; i < 4; i++) {
      const t = add(e, new THREE.ConeGeometry(0.025, 0.07, 4), cream, sx * (i - 1.5) * 0.04, 0.12 - Math.abs(i - 1.5) * 0.02, 0.05);
      t.rotation.z = (i - 1.5) * -0.2;
    }
    // eye
    const ex = sx * 0.13;
    add(head, sph(0.05, 8, 6), brown, ex, 0.04, 0.24, 1, 1, 0.6);
    // heavy eyelid
    const lid = add(head, sph(0.058, 8, 5), dark, ex, 0.075, 0.245, 1.1, 0.6, 0.7);
    lid.rotation.z = sx * -0.2;
    add(head, new THREE.BoxGeometry(0.1, 0.012, 0.02), black, ex, 0.047, 0.275).rotation.z = sx * -0.15;
    // fur lines under eyes
    add(head, new THREE.BoxGeometry(0.06, 0.01, 0.02), dark, ex, -0.03, 0.26);
  }
  // nose
  add(head, sph(0.1, 8, 6), black, 0, -0.04, 0.3, 1.1, 1.35, 0.8);
  add(head, sph(0.03, 5, 4), M(0x555358, 0.3), -0.03, 0.02, 0.37, 1, 0.7, 0.5);
  // mouth chewing
  add(head, new THREE.BoxGeometry(0.1, 0.018, 0.03), black, 0, -0.17, 0.26);
  add(head, sph(0.03, 5, 4), pink, 0.0, -0.19, 0.25);

  // Arms hugging trunk
  const arm = (sx: number) => {
    const a = new THREE.Group();
    a.position.set(sx * 0.27, 0.85, 0.42);
    k.add(a);
    const up = add(a, new THREE.CapsuleGeometry(0.07, 0.25, 4, 7), grey, sx * -0.08, -0.02, -0.12);
    up.rotation.set(-1.0, 0, sx * -0.9);
    return a;
  };
  arm(1);
  // left arm (-x) holds the sprig toward the mouth
  const la = new THREE.Group();
  la.position.set(-0.27, 0.85, 0.42);
  k.add(la);
  const lu = add(la, new THREE.CapsuleGeometry(0.07, 0.25, 4, 7), grey, -0.07, 0.08, 0.08);
  lu.rotation.set(0.2, 0, 0.7);
  const handL = add(la, sph(0.08, 7, 6), dark, -0.2, 0.28, 0.12, 1, 0.9, 1);
  // sprig in hand
  const sprig = new THREE.Group();
  sprig.position.set(-0.2, 0.3, 0.15);
  sprig.rotation.set(0.6, 0, 0.3);
  k.add(sprig);
  add(sprig, new THREE.CylinderGeometry(0.01, 0.015, 0.4, 5), bark, 0, 0.1, 0);
  for (let i = 0; i < 9; i++) {
    leaf(sprig, (rnd() - 0.5) * 0.12, 0.05 + i * 0.04, (rnd() - 0.5) * 0.12, rnd() * 3, (rnd() - 0.5) * 2, [leafA, leafB, leafC][i % 3], 1.1);
  }
  // right hand grips trunk
  add(k, sph(0.085, 7, 6), dark, 0.16, 0.78, 0.1, 1, 0.9, 1);
  add(k, sph(0.085, 7, 6), dark, -0.12, 0.6, 0.12, 0.01, 0.01, 0.01);
  // claws on both hands
  const clawsAt = (x: number, y: number, z: number, dir = 1) => {
    for (let i = -1; i <= 1; i++) {
      const c = add(k, new THREE.ConeGeometry(0.014, 0.07, 4), claw, x + i * 0.03, y, z);
      c.rotation.x = Math.PI * 0.5 * dir;
    }
  };
  clawsAt(0.16, 0.76, 0.0, -1);
  for (let i = -1; i <= 1; i++) {
    const c = add(k, new THREE.ConeGeometry(0.014, 0.07, 4), claw, -0.2 + i * 0.03, 0.36, 0.2);
    c.rotation.x = 1.0;
  }

  // Legs wrapped around trunk
  for (const sx of [-1, 1]) {
    const l = add(k, new THREE.CapsuleGeometry(0.1, 0.22, 4, 7), grey, sx * 0.22, 0.28, 0.4);
    l.rotation.set(1.2, 0, sx * 0.25);
    add(k, sph(0.09, 7, 6), dark, sx * 0.16, 0.22, 0.1, 1.1, 0.9, 1.2);
    for (let i = -1; i <= 1; i++) {
      const c = add(k, new THREE.ConeGeometry(0.014, 0.06, 4), claw, sx * 0.16 + i * 0.03, 0.2, -0.03);
      c.rotation.x = -Math.PI / 2;
    }
  }

  // Stub tail-less rump tuft
  add(k, sph(0.07, 6, 5), cream, 0, 0.18, 0.02, 1, 0.8, 0.8);

  root.rotation.y = 0;
  return root;
}
