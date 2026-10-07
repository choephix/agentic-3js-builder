```ts
import * as THREE from "three";

export const meta = {
  name: "Armored Knight",
  description: "A stylized low-poly knight in plate armor with plumed helm, tabard, sword and heater shield.",
};

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, m = 0.3, r = 0.5) => {
    const k = c + "_" + m + "_" + r;
    return (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, flatShading: true }));
  };
  const steel = M(0xaab3bd, 0.8, 0.35);
  const dark = M(0x5c6670, 0.8, 0.45);
  const gold = M(0xd4a73a, 0.8, 0.3);
  const red = M(0xa8201f, 0, 0.8);
  const white = M(0xeeeeee, 0, 0.8);
  const leather = M(0x4a2e1a, 0, 0.9);
  const black = M(0x111111, 0, 0.9);
  const plume = M(0xc42a2a, 0, 0.8);

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    p.add(o);
    return o;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);

  // legs
  for (const sd of [1, -1]) {
    const leg = new THREE.Group();
    leg.position.set(sd * 0.12, 0, 0);
    root.add(leg);
    add(leg, box(0.2, 0.1, 0.34), dark, 0, 0.05, 0.05); // sabaton
    add(leg, cyl(0.07, 0.075, 0.4, 8), steel, 0, 0.3, 0); // greave
    add(leg, sph(0.085), gold, 0, 0.53, 0.03); // knee
    add(leg, box(0.05, 0.08, 0.06), gold, 0, 0.53, 0.1);
    add(leg, cyl(0.09, 0.075, 0.38, 8), steel, 0, 0.74, 0); // thigh
    add(leg, box(0.03, 0.3, 0.1), dark, sd * 0.08, 0.74, 0);
  }
  // hips / skirt
  add(root, box(0.42, 0.14, 0.26), dark, 0, 0.97, 0);
  add(root, box(0.46, 0.04, 0.3), gold, 0, 1.05, 0);
  // tabard
  add(root, box(0.26, 0.4, 0.03), red, 0, 0.82, 0.15);
  add(root, box(0.26, 0.4, 0.03), red, 0, 0.82, -0.15);
  add(root, box(0.06, 0.12, 0.035), gold, 0, 0.84, 0.17);
  // torso
  add(root, cyl(0.2, 0.17, 0.3, 8), steel, 0, 1.2, 0, 1.15, 1, 0.85);
  add(root, cyl(0.26, 0.2, 0.22, 8), steel, 0, 1.46, 0, 1.2, 1, 0.8);
  add(root, box(0.1, 0.34, 0.03), gold, 0, 1.33, 0.2);
  add(root, box(0.3, 0.06, 0.03), gold, 0, 1.4, 0.2);
  add(root, box(0.46, 0.04, 0.3), gold, 0, 1.12, 0);
  // gorget
  add(root, cyl(0.13, 0.19, 0.1, 8), dark, 0, 1.62, 0);

  // arms
  const arm = (sd: number) => {
    const a = new THREE.Group();
    a.position.set(sd * 0.36, 1.55, 0);
    root.add(a);
    add(a, sph(0.14), steel, 0, 0, 0, 1.1, 0.8, 1.1); // pauldron
    add(a, box(0.26, 0.03, 0.22), gold, sd * 0.01, -0.04, 0);
    const up = new THREE.Group();
    up.rotation.z = -sd * 0.25;
    a.add(up);
    add(up, cyl(0.065, 0.06, 0.3, 8), steel, 0, -0.2, 0);
    add(up, sph(0.07), gold, 0, -0.38, 0);
    const lo = new THREE.Group();
    lo.position.set(0, -0.38, 0);
    lo.rotation.x = -0.5;
    up.add(lo);
    add(lo, cyl(0.06, 0.05, 0.3, 8), steel, 0, -0.17, 0);
    add(lo, box(0.13, 0.12, 0.13), dark, 0, -0.36, 0);
    return lo;
  };
  const lArm = arm(1);
  const rArm = arm(-1);

  // sword in right hand (-X)
  const sword = new THREE.Group();
  sword.position.set(0, -0.37, 0.04);
  rArm.add(sword);
  add(sword, cyl(0.02, 0.02, 0.14, 6), leather, 0, 0, 0);
  add(sword, box(0.26, 0.035, 0.05), gold, 0, 0.08, 0);
  add(sword, sph(0.035), gold, 0, -0.08, 0);
  add(sword, box(0.06, 0.7, 0.015), M(0xdfe6ee, 0.9, 0.2), 0, 0.45, 0);
  add(sword, box(0.015, 0.7, 0.025), steel, 0, 0.45, 0);
  const tip = add(sword, cyl(0, 0.03, 0.1, 4), M(0xdfe6ee, 0.9, 0.2), 0, 0.85, 0);
  tip.rotation.y = Math.PI / 4;
  sword.rotation.x = 1.0;

  // shield on left arm
  const sh = new THREE.Group();
  sh.position.set(0.14, -0.2, 0.1);
  lArm.add(sh);
  const shape = new THREE.Shape();
  shape.moveTo(-0.22, 0.28);
  shape.lineTo(0.22, 0.28);
  shape.lineTo(0.22, -0.02);
  shape.lineTo(0, -0.38);
  shape.lineTo(-0.22, -0.02);
  shape.closePath();
  const sg = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
  add(sh, sg, red);
  const rim = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
  add(sh, rim, gold, 0, 0, -0.01, 1.0, 1.0, 1);
  const face = add(sh, sg, red, 0, 0, 0.015, 0.88, 0.88, 1);
  add(sh, box(0.08, 0.5, 0.02), white, 0, -0.02, 0.07);
  add(sh, box(0.34, 0.08, 0.02), white, 0, 0.12, 0.07);
  add(sh, sph(0.045), gold, 0, 0.12, 0.08);
  face.position.y = 0.03;
  sh.rotation.y = 0.2;

  // head
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0);
  root.add(head);
  add(head, cyl(0.14, 0.15, 0.26, 8), steel, 0, 0, 0);
  add(head, sph(0.145), steel, 0, 0.13, 0, 1, 0.8, 1);
  add(head, box(0.22, 0.025, 0.02), black, 0, 0.03, 0.145); // visor slit
  add(head, box(0.025, 0.14, 0.02), black, 0, -0.06, 0.15);
  for (let i = 0; i < 4; i++) add(head, box(0.02, 0.02, 0.02), black, 0.045 + (i % 2) * 0.04 * 1, -0.04 - i * 0.03, 0.15).position.x *= i % 2 ? 1 : 1;
  add(head, box(0.04, 0.32, 0.04), gold, 0, 0.04, 0.14).scale.set(0.5, 0.3, 0.5);
  add(head, box(0.03, 0.04, 0.3), gold, 0, 0.23, 0);
  // plume
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    add(head, sph(0.06 - t * 0.015), plume, 0, 0.29 - Math.sin(t * 3) * 0.02 - t * 0.08, 0.1 - t * 0.28, 0.6, 1, 1.1);
  }

  // cape
  const cape = add(root, box(0.42, 0.85, 0.03), red, 0, 1.15, -0.2);
  cape.rotation.x = 0.08;

  // base slight random wear dots
  for (let i = 0; i < 6; i++) {
    add(root, box(0.02, 0.02, 0.01), dark, (rnd() - 0.5) * 0.3, 1.2 + rnd() * 0.3, 0.215);
  }

  return root;
}
```