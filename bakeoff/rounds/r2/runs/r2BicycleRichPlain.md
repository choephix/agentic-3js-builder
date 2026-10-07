```ts
import * as THREE from "three";

export const meta = {
  name: "Vintage Dutch City Bicycle",
  description: "Mint green omafiets with upright bars, sprung leather saddle, chrome mudguards, chain guard, whitewall tyres and a wicker basket of sunflowers and a baguette.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let s = 12345;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

  const mat = (c: number, r = 0.6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const mint = mat(0x8fd6b8, 0.4, 0.2);
  const chrome = mat(0xd8dde0, 0.2, 0.9);
  const rubber = mat(0x1d1d1f, 0.9);
  const white = mat(0xf4f1e6, 0.8);
  const cream = mat(0xf0e4c0, 0.7);
  const brown = mat(0x7a4423, 0.6);
  const wicker = mat(0xc08c4a, 0.9);
  const wicker2 = mat(0x9a6c32, 0.9);
  const petal = mat(0xffc61a, 0.7);
  const center = mat(0x4a2c12, 0.9);
  const leaf = mat(0x3f8a3a, 0.8);
  const bread = mat(0xd9a45a, 0.8);
  const breadD = mat(0xb5782f, 0.8);
  const dark = mat(0x333638, 0.5, 0.5);
  const red = mat(0xc83a32, 0.5);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    me.rotation.set(rx, ry, rz);
    parent.add(me);
    return me;
  };
  // tube between two points
  const tube = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, seg = 8, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), m);
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(me);
    return me;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const R = 0.34; // wheel radius to tyre centre
  const tubeR = 0.035;
  const axleY = R + tubeR;
  const rearZ = -0.55, frontZ = 0.55;

  // wheels
  const wheel = (z: number) => {
    const g = new THREE.Group();
    g.position.set(0, axleY, z);
    root.add(g);
    const tyre = add(new THREE.TorusGeometry(R, 0.035, 6, 24), rubber, 0, 0, 0, 0, Math.PI / 2, 0, g);
    // whitewall: flat white ring on both sides
    for (const sx of [-1, 1]) {
      add(new THREE.RingGeometry(R - 0.045, R - 0.012, 24), white, sx * 0.02, 0, 0, 0, sx * Math.PI / 2, 0, g).material = white;
    }
    (white as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    add(new THREE.TorusGeometry(R - 0.05, 0.008, 4, 24), chrome, 0, 0, 0, 0, Math.PI / 2, 0, g);
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 10), chrome, 0, 0, 0, 0, 0, Math.PI / 2, g);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const off = i % 2 ? 0.02 : -0.02;
      const sp = tube(V(off, 0, 0), V(off * 0.3, Math.cos(a) * (R - 0.05), Math.sin(a) * (R - 0.05)), 0.0025, chrome, 3, g);
    }
    return g;
  };
  wheel(rearZ);
  const fw = wheel(frontZ);

  // frame
  const BB = V(0, 0.32, -0.12); // bottom bracket
  const rearAx = V(0, axleY, rearZ);
  const frontAx = V(0, axleY, frontZ);
  const seatTop = V(0, 0.92, -0.3);
  const headBot = V(0, 0.78, 0.42);
  const headTop = V(0, 1.0, 0.36);
  tube(BB, seatTop, tubeR, mint); // seat tube
  tube(headBot, BB, tubeR * 1.2, mint); // down tube
  tube(V(0, 0.9, -0.28), V(0, 0.95, 0.38), tubeR, mint); // top tube (swoopy low via straight)
  tube(headBot, headTop, 0.04, mint, 8);
  for (const sx of [-0.05, 0.05]) {
    tube(V(sx, 0.32, -0.12), V(sx * 1.3, axleY, rearZ), 0.016, mint, 6); // chain stays
    tube(V(sx, 0.82, -0.3), V(sx * 1.3, axleY, rearZ), 0.016, mint, 6); // seat stays
    tube(V(sx * 1.2, 0.8, 0.42), V(sx * 1.6, axleY, frontZ), 0.02, mint, 6); // fork
  }
  add(new THREE.BoxGeometry(0.16, 0.03, 0.05), mint, 0, 0.8, 0.43); // fork crown
  // steering: stem + bars
  tube(headTop, V(0, 1.12, 0.34), 0.016, chrome, 8);
  const bar = new THREE.Group();
  bar.position.set(0, 1.12, 0.34);
  root.add(bar);
  tube(V(-0.28, 0.02, -0.12), V(-0.24, 0.02, 0.0), 0.012, chrome, 6, bar);
  tube(V(-0.24, 0.02, 0), V(-0.2, 0.02, 0), 0.012, chrome, 6, bar);
  // swept bars: left/right
  for (const sx of [-1, 1]) {
    tube(V(sx * 0.02, 0, 0), V(sx * 0.22, 0.06, -0.02), 0.012, chrome, 6, bar);
    tube(V(sx * 0.22, 0.06, -0.02), V(sx * 0.32, 0.1, -0.2), 0.012, chrome, 6, bar);
    tube(V(sx * 0.32, 0.1, -0.2), V(sx * 0.33, 0.1, -0.3), 0.017, cream, 8, bar); // grip
    add(new THREE.SphereGeometry(0.019, 6, 5), cream, sx * 0.33, 0.1, -0.3, 0, 0, 0, bar);
    // brake lever
    tube(V(sx * 0.3, 0.085, -0.17), V(sx * 0.27, 0.06, -0.06), 0.005, dark, 4, bar);
  }
  // headlamp
  add(new THREE.CylinderGeometry(0.001, 0.001, 0.001, 3), chrome, 0, 0, 0, 0, 0, 0, bar);
  const lamp = add(new THREE.SphereGeometry(0.05, 8, 6), chrome, 0, -0.12, 0.1, 0, 0, 0, bar);
  lamp.scale.set(1, 1, 0.8);
  add(new THREE.SphereGeometry(0.03, 6, 5), cream, 0, -0.12, 0.14, 0, 0, 0, bar);
  // bell
  add(new THREE.SphereGeometry(0.04, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), chrome, 0.15, 0.09, -0.02, 0, 0, 0, bar);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6), dark, 0.15, 0.075, -0.02, 0, 0, 0, bar);

  // saddle with springs
  tube(seatTop, V(0, 1.0, -0.31), 0.015, chrome, 6);
  const sad = new THREE.Group();
  sad.position.set(0, 1.08, -0.3);
  root.add(sad);
  add(new THREE.BoxGeometry(0.2, 0.05, 0.2), brown, 0, 0.03, -0.03, 0.05, 0, 0, sad);
  add(new THREE.BoxGeometry(0.1, 0.045, 0.14), brown, 0, 0.03, 0.14, 0.1, 0, 0, sad);
  add(new THREE.BoxGeometry(0.21, 0.015, 0.1), mat(0x5a3016, 0.6), 0, 0.0, -0.06, 0, 0, 0, sad);
  for (const sx of [-0.06, 0.06]) {
    for (let i = 0; i < 5; i++) add(new THREE.TorusGeometry(0.022, 0.005, 4, 8), chrome, sx, -0.07 + i * 0.016, -0.08, Math.PI / 2, 0, 0, sad);
    tube(V(sx, -0.08, -0.08), V(sx, 0.0, -0.08), 0.004, chrome, 4, sad);
  }
  tube(V(0, -0.08, -0.08), V(0, -0.08, 0.06), 0.006, chrome, 4, sad);
  add(new THREE.SphereGeometry(0.02, 6, 5), brown, 0, 0.03, -0.14, 0, 0, 0, sad);

  // cranks & pedals
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 14), chrome, 0.07, 0.32, -0.12, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), dark, 0, 0.32, -0.12, 0, 0, Math.PI / 2);
  tube(V(0.085, 0.32, -0.12), V(0.085, 0.2, -0.12), 0.011, chrome, 6);
  tube(V(-0.085, 0.32, -0.12), V(-0.085, 0.44, -0.12), 0.011, chrome, 6);
  add(new THREE.BoxGeometry(0.1, 0.02, 0.06), dark, 0.14, 0.2, -0.12);
  add(new THREE.BoxGeometry(0.1, 0.02, 0.06), dark, -0.14, 0.44, -0.12);

  // chain guard (rounded plate side) + chain
  const cg = add(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 14), mint, 0.095, 0.32, -0.12, 0, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(0.02, 0.15, 0.43), mint, 0.095, 0.35, -0.34, 0.05, 0, 0).position.y = 0.35;
  add(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 10), mint, 0.095, axleY, rearZ, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8), chrome, 0.1, 0.32, -0.12, 0, 0, Math.PI / 2);

  // mudguards
  const mud = (z: number, a0: number, a1: number) => {
    const g = new THREE.TorusGeometry(R + 0.07, 0.006, 4, 20, a1 - a0);
    const gm = new THREE.Group();
    gm.position.set(0, axleY, z);
    root.add(gm);
    for (const sx of [-1, 1]) add(new THREE.TorusGeometry(R + 0.065, 0.004, 3, 18, a1 - a0), chrome, 0, 0, sx * 0.0, 0, 0, a0, gm);
    const w = new THREE.TorusGeometry(R + 0.065, 0.045, 3, 20, a1 - a0);
    const m = add(w, chrome, 0, 0, 0, 0, 0, a0, gm);
    m.scale.set(1, 1, 0.3);
    m.material = chrome;
    return gm;
  };
  mud(rearZ, -0.2, Math.PI * 0.85);
  mud(frontZ, 0.1, Math.PI * 0.75);
  // fix orientation: torus lies in XY, rotate to YZ
  root.children.slice(-2).forEach((c) => c.children.forEach((m) => { m.rotation.y = Math.PI / 2; }));
  // rear reflector + rack
  add(new THREE.BoxGeometry(0.14, 0.012, 0.28), chrome, 0, 0.82, -0.62, 0.1, 0, 0);
  add(new THREE.BoxGeometry(0.04, 0.05, 0.015), red, 0, 0.55, -0.9);

  // kickstand
  tube(V(0.03, 0.32, -0.45), V(0.1, 0.05, -0.5), 0.01, dark, 5);

  // basket on front
  const bk = new THREE.Group();
  bk.position.set(0, 1.08, 0.58);
  root.add(bk);
  tube(V(0, 1.0, 0.4), V(0, 0.98, 0.55), 0.01, chrome, 5); // carrier arm
  add(new THREE.BoxGeometry(0.34, 0.015, 0.26), wicker2, 0, -0.1, 0.0, 0, 0, 0, bk);
  const bw = 0.17, bd = 0.14, bh = 0.2;
  const side = (w: number, px: number, pz: number, ry: number) => {
    for (let i = 0; i < 6; i++) {
      add(new THREE.BoxGeometry(w, 0.025, 0.018), i % 2 ? wicker : wicker2, px, -0.09 + i * 0.034, pz, 0, ry, 0, bk);
    }
  };
  side(0.36, 0, bd + 0.01, 0);
  side(0.36, 0, -bd - 0.01, 0);
  side(0.28, bw + 0.01, 0, Math.PI / 2);
  side(0.28, -bw - 0.01, 0, Math.PI / 2);
  for (const [x, z] of [[bw, bd], [-bw, bd], [bw, -bd], [-bw, -bd]]) {
    add(new THREE.BoxGeometry(0.025, bh + 0.02, 0.025), wicker2, x + Math.sign(x) * 0.005, 0.0, z + Math.sign(z) * 0.005, 0, 0, 0, bk);
  }
  add(new THREE.BoxGeometry(0.38, 0.02, 0.3), wicker2, 0, 0.09, 0, 0, 0, 0, bk).scale.set(1, 1, 1);
  // rim hollowed look: dark interior
  add(new THREE.BoxGeometry(0.3, 0.01, 0.24), dark, 0, 0.085, 0, 0, 0, 0, bk);
  // sunflowers
  const flower = (x: number, y: number, z: number, tilt: number, tz: number) => {
    const f = new THREE.Group();
    f.position.set(x, y, z);
    f.rotation.set(tilt, 0, tz);
    bk.add(f);
    tube(V(0, -0.15, 0), V(0, 0, 0), 0.007, leaf, 4, f);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const p = add(new THREE.ConeGeometry(0.018, 0.07, 4), petal, Math.cos(a) * 0.05, 0.0, Math.sin(a) * 0.05, 0, 0, 0, f);
      p.rotation.set(Math.PI / 2, 0, 0);
      p.rotation.order = "YXZ";
      p.rotation.y = -a + Math.PI / 2;
      p.rotation.x = 0;
      p.rotation.set(0, 0, 0);
      p.lookAt; // keep default
      p.quaternion.setFromUnitVectors(V(0, 1, 0), V(Math.cos(a), 0, Math.sin(a)));
    }
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 8), center, 0, 0.005, 0, 0, 0, 0, f);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), mat(0x2e1a0a, 0.9), 0, 0.01, 0, 0, 0, 0, f);
  };
  // flowers face up/outwards, stems in basket
  flower(0.0, 0.3, 0.02, 0.5, 0.0);
  flower(-0.1, 0.26, 0.0, 0.2, 0.5);
  flower(0.11, 0.27, 0.04, 0.4, -0.5);
  flower(-0.04, 0.24, -0.06, -0.3, 0.2);
  flower(0.06, 0.22, 0.12, 0.8, -0.2);
  // leaves
  for (let i = 0; i < 6; i++) {
    const l = add(new THREE.ConeGeometry(0.04, 0.12, 4), leaf, (rnd() - 0.5) * 0.26, 0.12 + rnd() * 0.05, (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 1.5, 0, (rnd() - 0.5) * 2, bk);
    l.scale.z = 0.3;
  }
  // baguette
  const bag = new THREE.Group();
  bag.position.set(0.0, 0.14, -0.04);
  bag.rotation.set(0.0, 0.0, 0.0);
  bk.add(bag);
  const loaf = add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 7), bread, 0, 0, 0, 0, 0, 0, bag);
  loaf.rotation.set(0.5, 0, 1.15);
  loaf.position.set(0.04, 0.05, 0);
  for (let i = -2; i <= 2; i++) {
    const sc = add(new THREE.BoxGeometry(0.02, 0.012, 0.045), breadD, 0, 0, 0, 0, 0, 0, bag);
    const t = i * 0.085;
    const dir = V(Math.sin(1.15) * -1, Math.cos(1.15), 0);
    sc.position.set(0.04 + dir.x * -t * 1 * 0 + Math.cos(1.15) * t, 0.05 + Math.sin(1.15) * t * -1 * -1, 0.0);
    sc.position.set(0.04 + Math.sin(1.15) * t * -1, 0.05 + Math.cos(1.15) * t, Math.sin(0.5) * 0.03 + 0.0);
    sc.rotation.set(0.5, 0, 1.15);
    sc.position.z += 0.03;
  }
  add(new THREE.ConeGeometry(0.03, 0.04, 7), bread, 0, 0, 0, 0, 0, 0, bag).visible = false;

  root.position.y = 0;
  return root;
}
```