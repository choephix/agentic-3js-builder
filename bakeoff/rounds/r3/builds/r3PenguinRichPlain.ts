import * as THREE from "three";

export const meta = {
  name: "Emperor Penguin Parent with Chick",
  description: "Stylized low-poly emperor penguin with golden ear patches, orange-striped beak, flippers out, and a fluffy grey chick peeking between its feet.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.6, m = 0) => {
    const k = c + "_" + r;
    return (mats[k] ??= new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true }));
  };
  const black = M(0x14181f, 0.25, 0.1);
  const white = M(0xf6f6f0, 0.7);
  const gold = M(0xf2b52a, 0.6);
  const paleGold = M(0xf8dc8a, 0.7);
  const beakDark = M(0x1e1a1c, 0.4);
  const pink = M(0xff8a5c, 0.5);
  const grey = M(0x9a9da3, 1);
  const lightGrey = M(0xc4c6ca, 1);
  const eyeW = M(0xffffff, 0.3);
  const ice = M(0xdfeff8, 0.4);

  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], sc?: number[], rot?: number[], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    if (sc) me.scale.set(sc[0], sc[1], sc[2]);
    if (rot) me.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(me);
    return me;
  };
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  // ice base
  add(new THREE.CylinderGeometry(0.55, 0.62, 0.04, 10), ice, [0, 0.0, 0.05]);

  // body (back black, belly white)
  add(sph(10, 8), black, [0, 0.62, -0.02], [0.27, 0.5, 0.21]);
  add(sph(10, 8), white, [0, 0.6, 0.06], [0.23, 0.46, 0.17]);
  // gold chest blending
  add(sph(8, 6), paleGold, [0, 0.93, 0.1], [0.18, 0.14, 0.12]);
  add(sph(8, 6), gold, [0, 1.0, 0.1], [0.14, 0.09, 0.1]);

  // tail
  add(new THREE.ConeGeometry(0.1, 0.3, 5), black, [0, 0.1, -0.25], [1, 1, 0.5], [-2.2, 0, 0]);

  // neck + head
  add(new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8), black, [0, 1.05, 0.0]);
  add(sph(10, 8), black, [0, 1.2, 0.03], [0.12, 0.14, 0.13]);
  // gold ear patches + throat
  for (const sx of [-1, 1]) {
    add(sph(6, 5), gold, [sx * 0.1, 1.1, 0.04], [0.04, 0.09, 0.07], [0, 0, sx * 0.2]);
    add(sph(6, 5), paleGold, [sx * 0.095, 1.03, 0.07], [0.05, 0.07, 0.07]);
    // eyes
    add(sph(6, 5), eyeW, [sx * 0.085, 1.23, 0.13], [0.022, 0.022, 0.015]);
    add(sph(5, 4), beakDark, [sx * 0.087, 1.23, 0.145], [0.013, 0.013, 0.01]);
  }
  // beak
  const beakTop = add(new THREE.ConeGeometry(0.04, 0.26, 5), beakDark, [0, 1.2, 0.26], [1, 1, 0.8], [Math.PI / 2 + 0.2, 0, 0]);
  void beakTop;
  for (const sx of [-1, 1])
    add(new THREE.BoxGeometry(0.012, 0.012, 0.22), pink, [sx * 0.03, 1.175, 0.25], undefined, [-0.1, 0, 0]);

  // flippers, slightly out
  for (const sx of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(sx * 0.24, 0.88, 0);
    g.rotation.z = sx * -0.55;
    root.add(g);
    add(sph(8, 6), black, [0, -0.2, 0], [0.045, 0.24, 0.1], [0, 0, 0], g);
    add(sph(6, 5), white, [sx * -0.02, -0.2, 0.01], [0.02, 0.2, 0.08], [0, 0, 0], g);
    add(new THREE.ConeGeometry(0.045, 0.1, 5), black, [0, -0.45, 0], [1, 1, 2], [Math.PI, 0, 0], g);
  }

  // feet
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.17, 0.05, 0.3), black, [sx * 0.13, 0.03, 0.18], undefined, [0, sx * -0.15, 0]);
    for (let i = -1; i <= 1; i++)
      add(sph(5, 4), black, [sx * 0.13 + i * 0.06 + sx * 0.0, 0.035, 0.34], [0.035, 0.03, 0.04]);
    add(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 6), black, [sx * 0.12, 0.1, 0.05]);
  }

  // chick
  const chick = new THREE.Group();
  chick.position.set(0, 0, 0.27);
  root.add(chick);
  add(sph(8, 6), grey, [0, 0.17, 0], [0.12, 0.16, 0.1], undefined, chick);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * 6.28, y = 0.08 + rnd() * 0.18;
    add(sph(4, 3), grey, [Math.cos(a) * 0.1, y, Math.sin(a) * 0.08], [0.035, 0.035, 0.035], undefined, chick);
  }
  add(sph(8, 6), lightGrey, [0, 0.14, 0.06], [0.08, 0.1, 0.05], undefined, chick);
  add(sph(8, 6), grey, [0, 0.33, 0.02], [0.095, 0.09, 0.09], undefined, chick);
  add(sph(7, 5), M(0xe8e8ea, 1), [0, 0.32, 0.075], [0.065, 0.065, 0.04], undefined, chick);
  for (const sx of [-1, 1]) {
    add(sph(5, 4), beakDark, [sx * 0.04, 0.35, 0.105], [0.017, 0.017, 0.012], undefined, chick);
    add(sph(6, 4), grey, [sx * 0.13, 0.16, 0], [0.03, 0.08, 0.05], [0, 0, sx * 0.3], chick);
    add(sph(5, 4), black, [sx * 0.05, 0.015, 0.06], [0.05, 0.025, 0.07], undefined, chick);
  }
  add(new THREE.ConeGeometry(0.02, 0.06, 4), beakDark, [0, 0.325, 0.12], undefined, [Math.PI / 2, 0, 0], chick);

  return root;
}
