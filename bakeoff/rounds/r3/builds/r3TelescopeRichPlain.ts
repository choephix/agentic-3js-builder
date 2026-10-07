import * as THREE from "three";

export const meta = {
  name: "Explorer's Telescope",
  description: "Brass telescope with leather wraps, finder scope, focus knobs on a mahogany tripod with tray and rolled star chart.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  const mat = (c: number, r = 0.5, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const brass = mat(0xd4a437, 0.25, 0.9);
  const darkBrass = mat(0x9a7220, 0.35, 0.85);
  const leather = mat(0x5a2e1a, 0.85);
  const mahog = mat(0x6b2a18, 0.55);
  const mahogDark = mat(0x4a1c10, 0.6);
  const rubber = mat(0x151515, 0.9);
  const glass = new THREE.MeshStandardMaterial({ color: 0x7fb8d8, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.8 });
  const paper = mat(0xeadfbf, 0.9);
  const red = mat(0x9a2a2a, 0.7);
  const blue = mat(0x1f2f5a, 0.7);

  const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  // cylinder along Z axis
  const tube = (parent: THREE.Object3D, rt: number, rb: number, len: number, m: THREE.Material, z: number, seg = 14) => {
    const o = add(parent, new THREE.CylinderGeometry(rt, rb, len, seg), m, 0, 0, z);
    o.rotation.x = Math.PI / 2;
    return o;
  };

  // ---- Tripod ----
  const hubY = 1.0;
  const legLen = 1.12;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const g = new THREE.Group();
    g.rotation.y = a;
    const splay = 0.26;
    const pivot = new THREE.Group();
    pivot.position.set(0.06, hubY, 0);
    pivot.rotation.z = -splay;
    g.add(pivot);
    // upper leg
    add(pivot, new THREE.BoxGeometry(0.06, legLen, 0.05), mahog, 0, -legLen / 2, 0);
    // tapered lower
    add(pivot, new THREE.CylinderGeometry(0.018, 0.03, 0.3, 6), mahogDark, 0, -legLen + 0.1, 0);
    // brass band
    add(pivot, new THREE.BoxGeometry(0.075, 0.05, 0.065), brass, 0, -0.12, 0);
    add(pivot, new THREE.BoxGeometry(0.075, 0.03, 0.065), brass, 0, -0.7, 0);
    // brass foot
    add(pivot, new THREE.ConeGeometry(0.03, 0.09, 6), brass, 0, -legLen - 0.03, 0);
    root.add(g);
  }
  // hub
  add(root, new THREE.CylinderGeometry(0.15, 0.17, 0.1, 6), mahogDark, 0, hubY + 0.02, 0);
  add(root, new THREE.CylinderGeometry(0.16, 0.16, 0.025, 6), brass, 0, hubY + 0.08, 0);
  add(root, new THREE.CylinderGeometry(0.16, 0.16, 0.025, 6), brass, 0, hubY - 0.04, 0);

  // tray (triangular-ish hexagon) with brackets, hung under hub
  const trayY = 0.62;
  add(root, new THREE.CylinderGeometry(0.25, 0.25, 0.025, 6), mahog, 0, trayY, 0);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.012, 4, 6), brass);
  rim.rotation.x = Math.PI / 2; rim.rotation.z = Math.PI / 6 * 0; rim.position.y = trayY + 0.014;
  root.add(rim);
  add(root, new THREE.CylinderGeometry(0.02, 0.02, hubY - trayY - 0.04, 6), darkBrass, 0, (hubY + trayY) / 2 - 0.02, 0);
  // rolled star chart
  const chart = new THREE.Group();
  chart.position.set(0.02, trayY + 0.06, 0.02);
  chart.rotation.z = Math.PI / 2;
  chart.rotation.y = 0.5;
  root.add(chart);
  add(chart, new THREE.CylinderGeometry(0.04, 0.04, 0.34, 12), paper);
  add(chart, new THREE.CylinderGeometry(0.042, 0.042, 0.03, 12), blue, 0, 0.1, 0);
  add(chart, new THREE.CylinderGeometry(0.042, 0.042, 0.03, 12), blue, 0, -0.1, 0);
  add(chart, new THREE.CylinderGeometry(0.03, 0.03, 0.36, 8), paper, 0, 0, 0).scale.set(0.5, 1, 0.5);
  add(chart, new THREE.CylinderGeometry(0.043, 0.043, 0.012, 12), red, 0, 0, 0);
  // little brass ink pot on tray
  add(root, new THREE.CylinderGeometry(0.035, 0.04, 0.05, 8), brass, -0.13, trayY + 0.037, 0.08);

  // ---- Mount head ----
  add(root, new THREE.CylinderGeometry(0.05, 0.06, 0.18, 8), brass, 0, hubY + 0.18, 0);
  add(root, new THREE.CylinderGeometry(0.09, 0.09, 0.04, 10), darkBrass, 0, hubY + 0.29, 0);
  // yoke forks
  const yokeY = hubY + 0.5;
  add(root, new THREE.BoxGeometry(0.2, 0.05, 0.08), brass, 0, hubY + 0.33, 0);
  for (const sx of [-1, 1]) {
    add(root, new THREE.BoxGeometry(0.04, 0.26, 0.08), brass, sx * 0.1, hubY + 0.46, 0);
    const cap = add(root, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), darkBrass, sx * 0.125, yokeY, 0);
    cap.rotation.z = Math.PI / 2;
  }
  // azimuth knob
  const kn = (x: number, y: number, z: number, rx: boolean, r = 0.035) => {
    const k = new THREE.Group(); k.position.set(x, y, z);
    if (rx) k.rotation.z = Math.PI / 2;
    add(k, new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), darkBrass, 0, 0, 0);
    const h = add(k, new THREE.CylinderGeometry(r, r, 0.025, 8), brass, 0, 0.04, 0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(k, new THREE.BoxGeometry(0.01, 0.028, 0.01), darkBrass, Math.cos(a) * r, 0.04, Math.sin(a) * r);
    }
    root.add(k);
    return h;
  };
  kn(0.06, hubY + 0.18, 0.05, false, 0.03);
  kn(0.14, yokeY, 0, true, 0.04);

  // ---- Telescope (pivot at yoke) ----
  const scope = new THREE.Group();
  scope.position.set(0, yokeY, 0);
  scope.rotation.x = -0.38; // tilt up toward +Z front
  root.add(scope);

  const ringAt = (par: THREE.Object3D, r: number, z: number, w = 0.02, m = darkBrass) => tube(par, r, r, w, m, z, 16);

  // main tube sections (front = +Z)
  tube(scope, 0.062, 0.062, 0.5, brass, 0.0);       // middle body
  tube(scope, 0.085, 0.075, 0.55, brass, 0.5);      // objective section
  tube(scope, 0.05, 0.05, 0.4, brass, -0.42);       // draw tube
  tube(scope, 0.04, 0.04, 0.2, darkBrass, -0.7);    // eyepiece tube
  // dew shade
  tube(scope, 0.105, 0.088, 0.2, brass, 0.87);
  tube(scope, 0.09, 0.09, 0.012, glass, 0.77);
  // leather wraps
  tube(scope, 0.066, 0.066, 0.2, leather, -0.02, 12);
  tube(scope, 0.09, 0.08, 0.2, leather, 0.55, 12);
  // stitching
  for (let i = 0; i < 8; i++) {
    const z = -0.1 + i * 0.025;
    const b = add(scope, new THREE.BoxGeometry(0.01, 0.01, 0.012), paper, 0, 0.068, z - 0.02);
  }
  // engraved rings
  for (const z of [-0.3, -0.22, 0.27, 0.32, 0.77, 0.95, 0.38, 0.72]) {
    ringAt(scope, z > 0.7 ? 0.1 : z > 0.2 ? 0.088 : 0.066, z, 0.014, z === 0.77 ? brass : darkBrass);
  }
  for (const z of [-0.6, -0.64]) ringAt(scope, 0.045, z, 0.012);
  // yoke trunnion band
  ringAt(scope, 0.075, 0, 0.07, darkBrass);
  for (const sx of [-1, 1]) {
    const p = add(scope, new THREE.CylinderGeometry(0.025, 0.025, 0.06, 8), brass, sx * 0.09, 0, 0);
    p.rotation.z = Math.PI / 2;
  }
  // eyepiece
  tube(scope, 0.032, 0.032, 0.08, brass, -0.84);
  tube(scope, 0.04, 0.03, 0.06, rubber, -0.9);
  ringAt(scope, 0.043, -0.93, 0.02, rubber);
  tube(scope, 0.025, 0.025, 0.005, glass, -0.935);

  // focus knobs (both sides on draw tube)
  for (const sx of [-1, 1]) {
    const f = new THREE.Group();
    f.position.set(sx * 0.07, 0, -0.38);
    f.rotation.z = sx * Math.PI / 2;
    add(f, new THREE.CylinderGeometry(0.01, 0.01, 0.05, 6), darkBrass, 0, 0, 0);
    add(f, new THREE.CylinderGeometry(0.04, 0.04, 0.025, 10), brass, 0, 0.04, 0);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      add(f, new THREE.BoxGeometry(0.008, 0.026, 0.012), darkBrass, Math.cos(a) * 0.04, 0.04, Math.sin(a) * 0.04).rotation.y = -a;
    }
    scope.add(f);
  }

  // finder scope on top
  const fy = 0.17;
  const finder = new THREE.Group();
  finder.position.set(0, fy, 0.1);
  scope.add(finder);
  tube(finder, 0.025, 0.025, 0.4, brass, 0);
  tube(finder, 0.036, 0.028, 0.1, brass, 0.25);
  tube(finder, 0.033, 0.033, 0.01, glass, 0.305);
  tube(finder, 0.02, 0.02, 0.06, rubber, -0.23);
  ringAt(finder, 0.03, -0.1, 0.012);
  ringAt(finder, 0.03, 0.12, 0.012);
  // brackets
  for (const z of [-0.08, 0.14]) {
    const zz = z + 0.1;
    add(scope, new THREE.BoxGeometry(0.014, 0.1, 0.03), darkBrass, 0, 0.115, zz);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 4, 10), brass);
    r.position.set(0, fy, zz); scope.add(r);
  }
  // finder adjust screws
  for (const sx of [-1, 1]) add(finder, new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), darkBrass, sx * 0.035, 0, -0.1).rotation.z = Math.PI / 2;

  // small rivets on objective section
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    add(scope, new THREE.SphereGeometry(0.007, 5, 4), brass, Math.cos(a) * 0.087, Math.sin(a) * 0.087, 0.43 + rnd() * 0.0);
  }

  // ensure floor contact
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y - 0.005;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
