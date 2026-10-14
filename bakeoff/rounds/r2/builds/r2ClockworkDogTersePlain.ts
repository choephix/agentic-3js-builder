import * as THREE from "three";

export const meta = {
  name: "Clockwork Dog",
  description: "A wind-up tin-and-brass toy dog with visible gears, a winding key, rivets and articulated limbs.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (hex: number, metal = 0.5, rough = 0.5) => {
    const k = hex + "_" + metal + "_" + rough;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: hex, metalness: metal, roughness: rough, flatShading: true });
    return mats[k];
  };

  // canvas texture for tin body (painted panels with scratches)
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#3f78a8";
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "#2c5578";
  g.lineWidth = 2;
  for (let i = 0; i < 128; i += 16) { g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  g.fillStyle = "#e8c24a";
  for (let i = 0; i < 8; i++) g.fillRect(i * 16 + 6, 0, 4, 128);
  g.strokeStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 25; i++) {
    g.beginPath();
    const x = rnd() * 128, y = rnd() * 128;
    g.moveTo(x, y); g.lineTo(x + rnd() * 14 - 7, y + rnd() * 14 - 7); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const tin = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.6, roughness: 0.4, flatShading: true });

  const brass = M(0xc89a3c, 0.9, 0.3);
  const darkBrass = M(0x8a6a24, 0.8, 0.4);
  const steel = M(0x9aa3ab, 0.9, 0.35);
  const red = M(0xb8372e, 0.4, 0.5);
  const black = M(0x1a1a1e, 0.2, 0.6);
  const cream = M(0xf2e8cf, 0.1, 0.6);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  const gear = (r: number, teeth: number, thick: number, mat: THREE.Material) => {
    const gr = new THREE.Group();
    add(gr, new THREE.CylinderGeometry(r, r, thick, Math.max(8, teeth)), mat).rotation.x = Math.PI / 2;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const t = add(gr, new THREE.BoxGeometry(r * 0.3, r * 0.3, thick), mat, Math.cos(a) * r * 1.08, Math.sin(a) * r * 1.08, 0);
      t.rotation.z = a;
    }
    add(gr, new THREE.CylinderGeometry(r * 0.25, r * 0.25, thick * 1.5, 6), steel).rotation.x = Math.PI / 2;
    return gr;
  };

  const rivets = (parent: THREE.Object3D, pts: number[][], r = 0.012) => {
    const geo = new THREE.SphereGeometry(r, 5, 4);
    pts.forEach(p => add(parent, geo, brass, p[0], p[1], p[2]));
  };

  // Dimensions: ~0.5m tall toy-scale dog, scaled up lightly
  const legH = 0.2;
  const bodyY = 0.32;

  // Body
  const body = add(root, new THREE.BoxGeometry(0.3, 0.26, 0.55), tin, 0, bodyY, -0.02);
  // chest bevel
  add(root, new THREE.BoxGeometry(0.26, 0.22, 0.1), tin, 0, bodyY + 0.01, 0.3);
  // belly plate
  add(root, new THREE.BoxGeometry(0.28, 0.03, 0.5), darkBrass, 0, bodyY - 0.135, -0.02);
  // back seam strip
  add(root, new THREE.BoxGeometry(0.06, 0.012, 0.56), brass, 0, bodyY + 0.135, -0.02);

  // rivets along body sides
  const rv: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const z = -0.24 + i * 0.1;
    rv.push([0.155, bodyY + 0.1, z], [-0.155, bodyY + 0.1, z], [0.155, bodyY - 0.1, z], [-0.155, bodyY - 0.1, z]);
  }
  rivets(root, rv);

  // Side porthole showing gears (both sides)
  for (const s of [1, -1]) {
    const ring = add(root, new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12), brass, s * 0.155, bodyY, -0.03);
    ring.rotation.z = Math.PI / 2;
    const glass = add(root, new THREE.CylinderGeometry(0.08, 0.08, 0.024, 12), M(0x1b2a38, 0.3, 0.2), s * 0.158, bodyY, -0.03);
    glass.rotation.z = Math.PI / 2;
    const g1 = gear(0.045, 10, 0.012, brass);
    g1.rotation.y = Math.PI / 2;
    g1.position.set(s * 0.17, bodyY + 0.01, -0.01);
    g1.rotation.set(0, Math.PI / 2, 0.3);
    root.add(g1);
    const g2 = gear(0.03, 8, 0.012, steel);
    g2.position.set(s * 0.17, bodyY - 0.03, -0.075);
    g2.rotation.set(0, Math.PI / 2, 0.1);
    root.add(g2);
  }

  // Winding key on back
  const key = new THREE.Group();
  add(key, new THREE.CylinderGeometry(0.014, 0.014, 0.09, 6), steel, 0, 0.045, 0);
  add(key, new THREE.BoxGeometry(0.15, 0.02, 0.02), brass, 0, 0.1, 0);
  for (const s of [1, -1]) {
    add(key, new THREE.CylinderGeometry(0.045, 0.045, 0.02, 8), brass, s * 0.08, 0.1, 0).rotation.x = Math.PI / 2;
    add(key, new THREE.CylinderGeometry(0.02, 0.02, 0.022, 6), black, s * 0.08, 0.1, 0).rotation.x = Math.PI / 2;
  }
  key.position.set(0, bodyY + 0.14, -0.08);
  key.rotation.y = 0.4;
  root.add(key);

  // Back gear (on the back, flat)
  const bg = gear(0.06, 12, 0.02, darkBrass);
  bg.rotation.x = Math.PI / 2;
  bg.position.set(0, bodyY + 0.145, -0.24);
  root.add(bg);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.33);
  root.add(head);
  // neck
  add(root, new THREE.CylinderGeometry(0.07, 0.09, 0.14, 6), darkBrass, 0, 0.44, 0.3).rotation.x = -0.4;
  add(head, new THREE.BoxGeometry(0.22, 0.2, 0.22), tin, 0, 0.04, 0.05);
  // snout
  add(head, new THREE.BoxGeometry(0.13, 0.1, 0.16), cream, 0, -0.01, 0.2);
  add(head, new THREE.BoxGeometry(0.14, 0.02, 0.17), brass, 0, 0.045, 0.2);
  // jaw
  add(head, new THREE.BoxGeometry(0.11, 0.03, 0.14), darkBrass, 0, -0.07, 0.19);
  // nose
  add(head, new THREE.BoxGeometry(0.06, 0.045, 0.04), black, 0, 0.02, 0.29);
  // teeth
  for (let i = -2; i <= 2; i++) add(head, new THREE.ConeGeometry(0.008, 0.02, 4), cream, i * 0.02, -0.06, 0.27).rotation.x = Math.PI;
  // eyes
  for (const s of [1, -1]) {
    add(head, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), brass, s * 0.07, 0.09, 0.15).rotation.x = Math.PI / 2;
    add(head, new THREE.SphereGeometry(0.03, 7, 5), cream, s * 0.07, 0.09, 0.165);
    add(head, new THREE.SphereGeometry(0.014, 6, 4), black, s * 0.07, 0.09, 0.19);
    // ears: flat flopping tin plates
    const ear = add(head, new THREE.BoxGeometry(0.03, 0.15, 0.1), red, s * 0.13, 0.05, 0.0);
    ear.rotation.z = s * 0.35;
    add(head, new THREE.CylinderGeometry(0.014, 0.014, 0.04, 6), brass, s * 0.115, 0.115, 0.0).rotation.z = Math.PI / 2;
  }
  // collar
  add(root, new THREE.CylinderGeometry(0.1, 0.1, 0.035, 8), red, 0, 0.42, 0.29).rotation.x = -0.4;
  add(root, new THREE.SphereGeometry(0.025, 6, 5), brass, 0, 0.395, 0.34);
  // antenna-like gear on head
  const hg = gear(0.035, 8, 0.015, brass);
  hg.position.set(0, 0.15, 0.04);
  hg.rotation.x = Math.PI / 2;
  head.add(hg);

  // Legs
  const legPos: [number, number, boolean][] = [
    [0.11, 0.24, true], [-0.11, 0.24, true], [0.11, -0.25, false], [-0.11, -0.25, false],
  ];
  legPos.forEach(([x, z, front], idx) => {
    const lg = new THREE.Group();
    lg.position.set(x, bodyY - 0.1, z);
    root.add(lg);
    // upper leg
    add(lg, new THREE.BoxGeometry(0.075, 0.11, 0.09), tin, 0, -0.02, 0);
    // joint
    add(lg, new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8), brass, 0, -0.08, 0).rotation.z = Math.PI / 2;
    // lower leg (piston)
    add(lg, new THREE.CylinderGeometry(0.022, 0.022, 0.1, 6), steel, 0, -0.12, 0);
    add(lg, new THREE.CylinderGeometry(0.032, 0.032, 0.05, 6), darkBrass, 0, -0.095, 0);
    // paw
    add(lg, new THREE.BoxGeometry(0.08, 0.04, 0.12), red, 0, -0.18, 0.02);
    add(lg, new THREE.BoxGeometry(0.075, 0.015, 0.03), black, 0, -0.195, 0.07);
    // bolt on side
    add(lg, new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), black, 0, -0.08, 0).rotation.z = Math.PI / 2;
  });

  // Tail: coiled spring
  const tail = new THREE.Group();
  tail.position.set(0, bodyY + 0.08, -0.3);
  root.add(tail);
  add(tail, new THREE.CylinderGeometry(0.03, 0.04, 0.05, 6), darkBrass, 0, 0, -0.01).rotation.x = Math.PI / 2;
  const coils = 14;
  for (let i = 0; i < coils; i++) {
    const t = i / coils;
    const ang = t * Math.PI * 6;
    const r = 0.025;
    const ring = add(
      tail,
      new THREE.BoxGeometry(0.05, 0.012, 0.012),
      steel,
      Math.cos(ang) * 0.0,
      0.02 + t * 0.2,
      -0.04 - t * 0.12
    );
    ring.position.x += Math.sin(ang) * r;
    ring.position.y += Math.cos(ang) * r * 0.6;
    ring.rotation.z = ang;
    ring.rotation.y = 0.3;
  }
  add(tail, new THREE.SphereGeometry(0.03, 6, 5), red, 0, 0.23, -0.17);

  // Base placement: lowest point at y=0
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
