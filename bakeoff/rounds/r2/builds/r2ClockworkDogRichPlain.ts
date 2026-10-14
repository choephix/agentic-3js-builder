import * as THREE from "three";

export const meta = {
  name: "Clockwork Terrier",
  description: "Wind-up terrier of polished brass and copper with riveted plates, chest gears, winding key, spring tail, leather ears and green lens eyes.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const mat = (c: number, m = 0.8, r = 0.3, extra: any = {}) =>
    new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r, flatShading: true, ...extra });
  const brass = mat(0xd4a62a, 0.95, 0.25);
  const brassDark = mat(0x9a7418, 0.9, 0.4);
  const copper = mat(0xb8662e, 0.95, 0.3);
  const copperDark = mat(0x7d3f1c, 0.9, 0.45);
  const steel = mat(0x555a60, 0.9, 0.4);
  const leather = mat(0x5a3420, 0.0, 0.9);
  const red = mat(0xb81d24, 0.1, 0.6);
  const glass = mat(0x55ff88, 0.1, 0.05, { transparent: true, opacity: 0.7, emissive: 0x1a8a40, emissiveIntensity: 0.5 });
  const dark = mat(0x151515, 0.3, 0.6);
  const glassChest = mat(0x99ddcc, 0.1, 0.05, { transparent: true, opacity: 0.3 });

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  const rivet = (parent: THREE.Object3D, x: number, y: number, z: number, nx = 0, ny = 0, nz = 1, r = 0.011) => {
    const m = add(parent, new THREE.SphereGeometry(r, 5, 4), brassDark, x, y, z);
    m.scale.set(1, 1, 0.6);
    m.lookAt(x + nx, y + ny, z + nz);
  };

  // Body
  const body = new THREE.Group();
  body.position.set(0, 0.36, 0);
  root.add(body);
  add(body, box(0.26, 0.24, 0.5), brass);
  // copper top plate & belly plate
  add(body, box(0.275, 0.07, 0.4), copper, 0, 0.1, -0.02);
  add(body, box(0.275, 0.05, 0.36), copperDark, 0, -0.1, 0);
  // plate seams
  for (const z of [-0.18, 0.0, 0.18]) add(body, box(0.272, 0.25, 0.012), brassDark, 0, 0, z);
  // rivets along seams
  for (const z of [-0.18, 0.0, 0.18]) {
    for (const y of [-0.08, -0.03, 0.03, 0.08]) {
      rivet(body, 0.136, y, z, 1, 0, 0);
      rivet(body, -0.136, y, z, -1, 0, 0);
    }
  }
  for (let i = 0; i < 5; i++) { rivet(body, -0.1 + i * 0.05, 0.138, -0.18, 0, 1, 0); rivet(body, -0.1 + i * 0.05, 0.138, 0.15, 0, 1, 0); }

  // Chest window with gears
  const chest = new THREE.Group();
  chest.position.set(0, -0.005, 0.255);
  body.add(chest);
  add(chest, box(0.2, 0.17, 0.02), dark, 0, 0, -0.005);
  const gears: THREE.Object3D[] = [];
  const makeGear = (r: number, teeth: number, m: THREE.Material) => {
    const g = new THREE.Group();
    add(g, cyl(r, r, 0.015, teeth * 2), m).rotation.x = Math.PI / 2;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const t = add(g, box(r * 0.35, r * 0.35, 0.015), m, Math.cos(a) * r, Math.sin(a) * r, 0);
      t.rotation.z = a;
    }
    add(g, cyl(r * 0.25, r * 0.25, 0.022, 6), dark).rotation.x = Math.PI / 2;
    return g;
  };
  const g1 = makeGear(0.05, 10, brass); g1.position.set(-0.035, 0.02, 0.012);
  const g2 = makeGear(0.034, 7, copper); g2.position.set(0.045, 0.035, 0.02);
  const g3 = makeGear(0.028, 6, brass); g3.position.set(0.04, -0.04, 0.012);
  const g4 = makeGear(0.025, 6, steel); g4.position.set(-0.05, -0.05, 0.02);
  g1.rotation.z = 0.2; g2.rotation.z = 0.5; g3.rotation.z = 0.1;
  [g1, g2, g3, g4].forEach(g => { chest.add(g); gears.push(g); });
  add(chest, box(0.2, 0.17, 0.008), glassChest, 0, 0, 0.04);
  for (const [x, y] of [[-0.1, 0.085], [0.1, 0.085], [-0.1, -0.085], [0.1, -0.085]]) rivet(chest, x, y, 0.012, 0, 0, 1, 0.014);
  add(chest, box(0.22, 0.015, 0.02), copper, 0, 0.09, 0.005);
  add(chest, box(0.22, 0.015, 0.02), copper, 0, -0.09, 0.005);
  add(chest, box(0.015, 0.18, 0.02), copper, 0.105, 0, 0.005);
  add(chest, box(0.015, 0.18, 0.02), copper, -0.105, 0, 0.005);

  // Winding key on back
  const key = new THREE.Group();
  key.position.set(0, 0.17, -0.06);
  body.add(key);
  add(key, cyl(0.03, 0.04, 0.03, 8), brassDark, 0, -0.01, 0);
  add(key, cyl(0.014, 0.014, 0.12, 6), brass, 0, 0.06, 0);
  for (const s of [-1, 1]) {
    const w = add(key, box(0.09, 0.1, 0.018), brass, s * 0.06, 0.15, 0);
    add(key, cyl(0.04, 0.04, 0.018, 10), brass, s * 0.07, 0.19, 0).rotation.x = Math.PI / 2;
    w.scale.set(0.8, 1, 1);
  }
  add(key, box(0.06, 0.05, 0.02), brass, 0, 0.12, 0);
  for (const s of [-1, 1]) add(key, cyl(0.016, 0.016, 0.022, 8), dark, s * 0.07, 0.19, 0).rotation.x = Math.PI / 2;
  key.rotation.y = 0.4;

  // Neck + Head
  const head = new THREE.Group();
  head.position.set(0, 0.2, 0.3);
  body.add(head);
  add(body, box(0.15, 0.17, 0.14), copper, 0, 0.13, 0.25).rotation.x = -0.4;
  add(head, box(0.2, 0.19, 0.2), brass, 0, 0.04, 0.0);
  add(head, box(0.215, 0.05, 0.14), copper, 0, 0.13, -0.02);
  // muzzle
  add(head, box(0.12, 0.09, 0.15), brass, 0, -0.02, 0.15);
  add(head, box(0.125, 0.025, 0.14), copperDark, 0, -0.075, 0.15);
  // beard
  add(head, box(0.07, 0.07, 0.06), copperDark, 0, -0.1, 0.17);
  // nose
  add(head, box(0.06, 0.04, 0.04), dark, 0, 0.03, 0.235);
  // jaw teeth/ mouth line
  add(head, box(0.125, 0.008, 0.15), dark, 0, -0.058, 0.15);
  // brow ridge
  add(head, box(0.2, 0.025, 0.04), copperDark, 0, 0.1, 0.1);
  // eyes
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.06, 0.06, 0.1);
    head.add(e);
    add(e, cyl(0.04, 0.04, 0.03, 10), brassDark).rotation.x = Math.PI / 2;
    const lens = add(e, new THREE.SphereGeometry(0.036, 8, 6), glass, 0, 0, 0.012);
    lens.scale.z = 0.7;
    add(e, new THREE.SphereGeometry(0.014, 6, 5), dark, 0, 0, 0.032);
    add(e, new THREE.SphereGeometry(0.007, 4, 4), mat(0xffffff, 0, 0.3), 0.012, 0.012, 0.038);
    add(e, new THREE.TorusGeometry(0.04, 0.007, 4, 10), copper, 0, 0, 0.016);
  }
  // ears (floppy leather)
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.1, 0.12, -0.02);
    head.add(ear);
    ear.rotation.z = -s * 0.5;
    ear.rotation.x = 0.2;
    add(ear, box(0.03, 0.05, 0.1), leather, s * 0.005, -0.01, 0);
    const e2 = add(ear, box(0.025, 0.09, 0.09), leather, s * 0.015, -0.07, 0.015);
    e2.rotation.z = -s * 0.15;
    const e3 = add(ear, box(0.02, 0.06, 0.07), leather, s * 0.03, -0.13, 0.03);
    e3.rotation.z = -s * 0.3;
    rivet(ear, s * 0.022, -0.01, 0.0, s, 0, 0, 0.012);
  }
  // antenna-like small bolt on head
  add(head, cyl(0.012, 0.012, 0.02, 6), steel, 0, 0.16, -0.04);

  // Collar
  const collar = add(body, cyl(0.085, 0.09, 0.05, 8), red, 0, 0.14, 0.22);
  collar.rotation.x = -0.4;
  collar.scale.set(1.05, 1, 1);
  const tag = new THREE.Group();
  tag.position.set(0, 0.07, 0.32);
  body.add(tag);
  add(tag, new THREE.TorusGeometry(0.012, 0.004, 4, 8), steel, 0, 0.02, 0);
  add(tag, cyl(0.03, 0.03, 0.008, 12), brass, 0, -0.02, 0.005).rotation.x = Math.PI / 2;
  add(tag, box(0.02, 0.006, 0.004), dark, 0, -0.02, 0.01);
  add(tag, box(0.006, 0.02, 0.004), dark, 0, -0.02, 0.01);

  // Legs
  const legs: THREE.Group[] = [];
  const makeLeg = (x: number, z: number, front: boolean) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.3, z);
    root.add(hip);
    add(hip, new THREE.SphereGeometry(0.05, 7, 5), copper);
    add(hip, cyl(0.055, 0.055, 0.04, 8), brassDark, Math.sign(x) * 0.03, 0, 0).rotation.z = Math.PI / 2;
    // upper
    add(hip, box(0.06, 0.12, 0.07), brass, 0, -0.07, 0);
    // spring knee
    for (let i = 0; i < 5; i++) {
      const t = add(hip, new THREE.TorusGeometry(0.03, 0.008, 4, 8), steel, 0, -0.14 - i * 0.012, 0);
      t.rotation.x = Math.PI / 2 + 0.2;
    }
    // lower
    const low = add(hip, box(0.045, 0.1, 0.05), brass, 0, -0.23, front ? 0 : 0.01);
    add(hip, cyl(0.03, 0.03, 0.055, 6), copper, 0, -0.1, 0).rotation.z = Math.PI / 2;
    // paw
    add(hip, box(0.075, 0.04, 0.12), copper, 0, -0.285, 0.025);
    for (const t of [-0.022, 0, 0.022]) add(hip, box(0.018, 0.02, 0.03), brassDark, t, -0.29, 0.09);
    rivet(hip, Math.sign(x) * 0.031, -0.07, 0.0, Math.sign(x), 0, 0);
    rivet(hip, Math.sign(x) * 0.031, -0.04, 0.02, Math.sign(x), 0, 0);
    void low;
    legs.push(hip);
  };
  makeLeg(0.1, 0.19, true);
  makeLeg(-0.1, 0.19, true);
  makeLeg(0.1, -0.19, false);
  makeLeg(-0.1, -0.19, false);
  legs[0].rotation.x = -0.12; legs[3].rotation.x = -0.12;
  legs[1].rotation.x = 0.1; legs[2].rotation.x = 0.1;

  // Spring tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.42, -0.26);
  root.add(tail);
  add(tail, cyl(0.03, 0.04, 0.04, 6), brassDark, 0, 0, 0).rotation.x = Math.PI / 2 - 0.5;
  const turns = 9;
  for (let i = 0; i < turns * 8; i++) {
    const t = i / (turns * 8);
    const a = t * turns * Math.PI * 2;
    const r = 0.035 - t * 0.012;
    const len = t * 0.28;
    const seg = add(tail, box(0.014, 0.014, 0.05), copper, Math.cos(a) * r, 0.0 + len * 0.82 + Math.sin(a) * r, -len * 0.5 - 0.03);
    seg.rotation.set(0, 0, 0);
    seg.rotation.x = a + Math.PI / 2;
    seg.rotation.y = 0;
    seg.scale.set(1, 1, 1);
  }
  add(tail, new THREE.SphereGeometry(0.025, 6, 5), brass, 0, 0.24, -0.17);

  // Subtle hind seam gear on flank
  for (const s of [-1, 1]) {
    const fg = makeGear(0.04, 8, brassDark);
    fg.position.set(s * 0.14, 0.0, -0.1);
    fg.rotation.y = Math.PI / 2;
    body.add(fg);
  }

  // Slight pose
  head.rotation.x = 0.05;

  // Sink check: paw bottoms at y = 0.3-0.31 = -0.01 (within tolerance)
  void rnd;
  return root;
}
