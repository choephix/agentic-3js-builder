import * as THREE from "three";

export const meta = {
  name: "Nine-banded Armadillo",
  description: "Trotting armadillo with banded armour shell, pointed snout, tall ears, clawed feet, tapering armoured tail and pale hairs.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mat = (c: number, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  const shellM = mat(0xb89580);
  const shellD = mat(0x9a7766);
  const bandM = mat(0xc9a48c);
  const skin = mat(0xd9a89a);
  const dark = mat(0x3a2a28, 0.4);
  const clawM = mat(0xefe3cf);
  const hairM = mat(0xf3ead6);
  const earM = mat(0xc88f86);

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };

  // Carapace: dome from a half-sphere, scaled
  const dome = add(body, new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), shellM, 0, 0.17, 0);
  dome.scale.set(0.15, 0.2, 0.36);
  // belly
  const belly = add(body, new THREE.SphereGeometry(1, 10, 6), skin, 0, 0.19, 0);
  belly.scale.set(0.13, 0.08, 0.3);

  // Shield plates front and rear
  const shoulder = add(body, new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellD, 0, 0.17, 0.2);
  shoulder.scale.set(0.155, 0.19, 0.13);
  const pelvis = add(body, new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellD, 0, 0.17, -0.22);
  pelvis.scale.set(0.155, 0.19, 0.13);

  // Bands: 9 rings in the middle
  for (let i = 0; i < 9; i++) {
    const z = 0.1 - i * 0.0425 + 0.0;
    const t = (z) / 0.36;
    const k = Math.sqrt(Math.max(0.05, 1 - t * t));
    const ring = add(body, new THREE.TorusGeometry(1, 0.1, 5, 14, Math.PI), i % 2 ? bandM : shellM, 0, 0.17, z);
    ring.scale.set(0.155 * k, 0.205 * k, 0.045);
    ring.rotation.z = 0;
    ring.scale.z = 0.5;
    ring.scale.set(0.155 * k, 0.2 * k, 0.5);
    // torus lies in XY plane, arch up: good
    ring.scale.multiplyScalar(1.0);
    // hairs between bands
    for (let h = 0; h < 7; h++) {
      const a = (rnd() * 0.9 + 0.05) * Math.PI;
      const hair = add(body, new THREE.ConeGeometry(0.004, 0.035, 3), hairM, Math.cos(a) * 0.165 * k, 0.17 + Math.sin(a) * 0.21 * k, z - 0.02);
      hair.rotation.z = a - Math.PI / 2;
      hair.rotation.x = -0.5;
    }
  }
  // scute studs on shields
  for (let i = 0; i < 40; i++) {
    const a = rnd() * Math.PI * 0.9 + 0.05;
    const front = i % 2 === 0;
    const z = front ? 0.2 + (rnd() - 0.2) * 0.12 : -0.22 - (rnd() - 0.2) * 0.12;
    const st = add(body, new THREE.BoxGeometry(0.03, 0.012, 0.03), bandM, Math.cos(a) * 0.15, 0.17 + Math.sin(a) * 0.19, z);
    st.rotation.z = a - Math.PI / 2;
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.2, 0.36);
  head.rotation.x = 0.15;
  body.add(head);
  add(head, new THREE.SphereGeometry(0.075, 8, 6), skin, 0, 0, 0.02).scale.set(1, 0.9, 1.1);
  const snout = add(head, new THREE.ConeGeometry(0.058, 0.2, 6), skin, 0, -0.025, 0.15);
  snout.rotation.x = Math.PI / 2 + 0.15;
  add(head, new THREE.SphereGeometry(0.014, 5, 4), dark, 0, -0.045, 0.25);
  // head shield
  const cap = add(head, new THREE.SphereGeometry(0.078, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shellD, 0, 0.01, 0.0);
  cap.scale.set(1, 0.8, 1.15);
  for (const sx of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.012, 6, 5), dark, sx * 0.058, 0.015, 0.075);
    const ear = add(head, new THREE.ConeGeometry(0.04, 0.15, 4), earM, sx * 0.05, 0.1, -0.02);
    ear.rotation.z = -sx * 0.25;
    ear.rotation.x = -0.1;
    ear.scale.z = 0.4;
    const inner = add(head, new THREE.ConeGeometry(0.022, 0.11, 4), skin, sx * 0.05, 0.095, -0.005);
    inner.rotation.z = -sx * 0.25;
    inner.scale.z = 0.3;
  }

  // Tail: segmented tapering
  let ty = 0.15, tz = -0.34;
  for (let i = 0; i < 8; i++) {
    const r = 0.05 * (1 - i / 9) + 0.008;
    const seg = add(body, new THREE.ConeGeometry(r, 0.09, 6), i % 2 ? shellM : bandM, 0, ty, tz);
    seg.rotation.x = -Math.PI / 2 - 0.2;
    seg.scale.y = 1;
    // cone axis: after rotation, tip points toward -z
    seg.rotation.x = -Math.PI / 2;
    seg.position.y = ty;
    seg.rotation.x = -Math.PI / 2 - 0.0;
    tz -= 0.075;
    ty -= 0.012;
  }

  // Legs with trot pose (diagonal pairs)
  const legs: [number, number, number][] = [
    [0.1, 0.24, 0.5],
    [-0.1, 0.24, -0.5],
    [-0.1, -0.22, 0.5],
    [0.1, -0.22, -0.5],
  ];
  legs.forEach(([x, z, sw], idx) => {
    const g = new THREE.Group();
    g.position.set(x, 0.15, z);
    g.rotation.x = sw * 0.45 * (idx < 2 ? 1 : 1);
    root.add(g);
    const upper = add(g, new THREE.BoxGeometry(0.07, 0.1, 0.08), skin, 0, -0.03, 0);
    const low = add(g, new THREE.BoxGeometry(0.05, 0.09, 0.055), shellD, 0, -0.1, 0);
    // foot placed counter-rotated so it's flat
    const foot = new THREE.Group();
    foot.position.set(0, -0.145, 0.01);
    foot.rotation.x = -g.rotation.x;
    g.add(foot);
    add(foot, new THREE.BoxGeometry(0.06, 0.03, 0.09), skin, 0, 0, 0.015);
    for (let c = -1; c <= 1; c++) {
      const claw = add(foot, new THREE.ConeGeometry(0.01, 0.045, 4), clawM, c * 0.02, -0.003, 0.08);
      claw.rotation.x = Math.PI / 2 + 0.3;
    }
    void upper; void low;
  });

  // Ground-lift: compute and place on floor
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y - 0.002;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
