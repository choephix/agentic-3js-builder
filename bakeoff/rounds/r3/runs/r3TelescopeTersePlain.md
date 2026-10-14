```ts
import * as THREE from "three";

export const meta = {
  name: "Brass Refractor Telescope",
  description: "Stylized brass and white refractor telescope on a wooden tripod with equatorial mount, finder scope, and eyepiece.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (k: string, color: number, rough = 0.5, metal = 0) =>
    (mats[k] ??= new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: true }));

  const white = M("white", 0xf1efe8, 0.4, 0.1);
  const brass = M("brass", 0xc9963a, 0.3, 0.9);
  const dark = M("dark", 0x23252b, 0.6, 0.4);
  const wood = M("wood", 0x8a5a33, 0.8);
  const woodD = M("woodD", 0x6a4224, 0.8);
  const glass = M("glass", 0x3a6fa8, 0.1, 0.6);
  const red = M("red", 0xb3322b, 0.5, 0.2);
  const steel = M("steel", 0x9aa0a8, 0.35, 0.8);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  // cylinder along Z
  const tubeZ = (parent: THREE.Object3D, rt: number, rb: number, len: number, m: THREE.Material, z: number, y = 0, x = 0, seg = 12) => {
    const me = add(parent, new THREE.CylinderGeometry(rt, rb, len, seg), m, x, y, z);
    me.rotation.x = Math.PI / 2;
    return me;
  };

  // Tripod
  const legH = 1.15;
  const topY = 1.1;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const spread = 0.55;
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(a) * 0.06, topY, Math.sin(a) * 0.06);
    pivot.rotation.y = -a;
    const tilt = new THREE.Group();
    tilt.rotation.z = Math.atan2(spread, topY); // lean outward along local +X
    tilt.rotation.z = -Math.atan2(spread, topY);
    pivot.add(tilt);
    const len = Math.hypot(spread, topY);
    const leg = add(tilt, new THREE.BoxGeometry(0.05, len, 0.035), wood, 0, -len / 2, 0);
    add(tilt, new THREE.BoxGeometry(0.058, 0.3, 0.042), woodD, 0, -len + 0.15, 0);
    add(tilt, new THREE.CylinderGeometry(0.02, 0.025, 0.05, 6), dark, 0, -len + 0.01, 0);
    root.add(pivot);
    void leg; void legH;
  }
  // tripod head
  add(root, new THREE.CylinderGeometry(0.14, 0.17, 0.08, 6), dark, 0, topY + 0.02, 0);
  add(root, new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), brass, 0, topY + 0.08, 0);
  // spreader tray
  add(root, new THREE.CylinderGeometry(0.2, 0.2, 0.02, 3), woodD, 0, 0.5, 0).rotation.y = Math.PI / 2 + Math.PI / 6 * 0;

  // Mount
  const mountY = topY + 0.1;
  add(root, new THREE.BoxGeometry(0.16, 0.14, 0.16), dark, 0, mountY + 0.07, 0);
  const polar = new THREE.Group();
  polar.position.set(0, mountY + 0.16, 0);
  polar.rotation.x = -0.1;
  root.add(polar);
  add(polar, new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8), dark, 0, 0.05, 0);
  // counterweight shaft
  const shaft = add(polar, new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), steel, 0, 0.0, -0.25);
  shaft.rotation.x = Math.PI / 2 - 0.5;
  const cw = add(polar, new THREE.CylinderGeometry(0.07, 0.07, 0.09, 10), dark, 0, -0.1, -0.42);
  cw.rotation.x = Math.PI / 2 - 0.5;
  add(polar, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), brass, 0, -0.1, -0.55).rotation.x = Math.PI / 2 - 0.5;

  // Declination head
  const head = new THREE.Group();
  head.position.set(0, 0.2, 0.0);
  polar.add(head);
  add(head, new THREE.BoxGeometry(0.14, 0.12, 0.12), dark, 0, 0, 0);
  const wheel = add(head, new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), brass, 0.09, 0, 0);
  wheel.rotation.z = Math.PI / 2;
  const knob = add(head, new THREE.SphereGeometry(0.025, 6, 5), red, 0.13, 0, 0);
  void knob;

  // Optical tube
  const tube = new THREE.Group();
  tube.position.set(0, 0.12, 0.05);
  tube.rotation.x = -0.45;
  head.add(tube);
  const L = 1.1;
  // main body
  tubeZ(tube, 0.065, 0.065, L, white, 0.1);
  // brass bands
  for (const z of [-0.35, 0.1, 0.5]) tubeZ(tube, 0.072, 0.072, 0.03, brass, z, 0, 0, 12);
  // dew shield
  tubeZ(tube, 0.085, 0.075, 0.3, white, L / 2 + 0.1);
  tubeZ(tube, 0.09, 0.09, 0.025, brass, L / 2 + 0.25);
  // lens
  tubeZ(tube, 0.075, 0.075, 0.015, glass, L / 2 + 0.1 - 0.05);
  // rear focuser
  tubeZ(tube, 0.05, 0.065, 0.1, dark, -L / 2 + 0.1 - 0.12);
  tubeZ(tube, 0.03, 0.03, 0.15, brass, -L / 2 - 0.1);
  tubeZ(tube, 0.04, 0.04, 0.03, dark, -L / 2 - 0.2);
  // focus knobs
  for (const s of [-1, 1]) {
    const k = add(tube, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8), brass, s * 0.07, 0, -L / 2 - 0.0);
    k.rotation.z = Math.PI / 2;
  }
  // diagonal + eyepiece
  add(tube, new THREE.BoxGeometry(0.07, 0.07, 0.09), brass, 0, 0, -L / 2 - 0.3);
  add(tube, new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8), steel, 0, -0.08, -L / 2 - 0.3).rotation.x = 0;
  add(tube, new THREE.CylinderGeometry(0.03, 0.025, 0.07, 8), dark, 0, -0.17, -L / 2 - 0.3);
  add(tube, new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8), glass, 0, -0.21, -L / 2 - 0.3);

  // finder scope
  const fy = 0.13;
  tubeZ(tube, 0.02, 0.02, 0.32, dark, -0.1, fy);
  tubeZ(tube, 0.028, 0.02, 0.06, dark, 0.1, fy);
  tubeZ(tube, 0.024, 0.024, 0.01, glass, 0.13, fy);
  tubeZ(tube, 0.015, 0.02, 0.05, dark, -0.29, fy);
  for (const z of [-0.2, 0.0]) {
    add(tube, new THREE.BoxGeometry(0.02, 0.1, 0.02), brass, 0, 0.075, z);
    add(tube, new THREE.TorusGeometry(0.03, 0.006, 4, 8), brass, 0, fy, z);
  }

  // saddle clamp
  add(tube, new THREE.BoxGeometry(0.16, 0.04, 0.12), dark, 0, -0.08, 0.0);
  add(head, new THREE.BoxGeometry(0.1, 0.05, 0.1), brass, 0, 0.07, 0.03);

  // base shadow-free floor ring tip pads already included
  return root;
}
```