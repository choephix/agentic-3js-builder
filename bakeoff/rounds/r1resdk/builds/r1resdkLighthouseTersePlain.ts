import * as THREE from "three";

export const meta = {
  name: "Lighthouse Island",
  description: "A striped lighthouse on a tiny rocky island with a keeper's cottage, dock, and sea.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, o: Partial<THREE.MeshStandardMaterial> = {}) => {
    const k = c + JSON.stringify(o);
    return (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85, ...o }));
  };
  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };

  // sea
  add(new THREE.CylinderGeometry(9, 9, 0.3, 24), M(0x2a7fb0, { roughness: 0.4 }), 0, -0.05, 0);
  // foam rings
  add(new THREE.CylinderGeometry(5.2, 5.4, 0.12, 14), M(0xe8f4f8), 0, 0.12, 0);

  // island rocks
  const rock = M(0x6f6a64), rock2 = M(0x8a847b);
  add(new THREE.CylinderGeometry(4, 4.8, 1.2, 10), rock, 0, 0.5, 0);
  add(new THREE.CylinderGeometry(3.2, 3.9, 0.8, 9), rock2, 0, 1.4, 0);
  const grass = M(0x5fa04a);
  add(new THREE.CylinderGeometry(2.9, 3.1, 0.3, 10), grass, 0, 1.95, 0);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * 6.28, r = 3.6 + rnd() * 1.4, sz = 0.3 + rnd() * 0.5;
    const m = add(new THREE.DodecahedronGeometry(sz, 0), i % 2 ? rock : rock2, Math.cos(a) * r, 0.3 + rnd() * 0.3, Math.sin(a) * r);
    m.rotation.set(rnd() * 3, rnd() * 3, 0);
  }
  for (let i = 0; i < 10; i++) {
    const a = rnd() * 6.28, r = 0.8 + rnd() * 2, 
      m = add(new THREE.ConeGeometry(0.15, 0.4, 4), M(0x3f8a38), Math.cos(a) * r, 2.3, Math.sin(a) * r);
    m.position.x += 0;
  }

  // tower
  const ty = 2.1;
  const stripes = [0xf4f1ea, 0xd23a32];
  const segs = 6, h = 1.5;
  for (let i = 0; i < segs; i++) {
    const r0 = 1.2 - (i * 0.6) / segs, r1 = 1.2 - ((i + 1) * 0.6) / segs;
    add(new THREE.CylinderGeometry(r1, r0, h, 12), M(stripes[i % 2]), 0, ty + h * i + h / 2, 0);
  }
  const topY = ty + h * segs;
  add(new THREE.CylinderGeometry(1.3, 1.3, 0.2, 12), M(0x2d2f36), 0, ty + 0.1, 0);
  // door
  add(new THREE.BoxGeometry(0.5, 0.9, 0.2), M(0x5a3a22), 0, ty + 0.45, 1.15);
  // windows
  for (let i = 1; i < 5; i++) {
    const r = 1.2 - (i * 0.6 + 0.75) / segs;
    const w = add(new THREE.BoxGeometry(0.22, 0.4, 0.15), M(0x1d3a52), 0, ty + h * i + 0.75, r + 0.5 * 0.0 + 0.03);
    w.position.z = (1.2 - ((i + 0.5) * 0.6) / segs) - 0.03;
  }
  // gallery
  add(new THREE.CylinderGeometry(1.1, 0.8, 0.25, 12), M(0x2d2f36), 0, topY + 0.12, 0);
  const rail = M(0x2d2f36);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.28;
    add(new THREE.BoxGeometry(0.06, 0.4, 0.06), rail, Math.cos(a) * 1.05, topY + 0.45, Math.sin(a) * 1.05);
  }
  const ring = add(new THREE.TorusGeometry(1.05, 0.04, 4, 12), rail, 0, topY + 0.65, 0);
  ring.rotation.x = Math.PI / 2;
  // lantern
  const glow = M(0xffe27a, { emissive: new THREE.Color(0xffc830), emissiveIntensity: 1.2, flatShading: true });
  add(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8), glow, 0, topY + 0.65, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28 + 0.39;
    add(new THREE.BoxGeometry(0.06, 0.85, 0.06), rail, Math.cos(a) * 0.52, topY + 0.65, Math.sin(a) * 0.52);
  }
  add(new THREE.CylinderGeometry(0.2, 0.62, 0.3, 8), M(0xd23a32), 0, topY + 1.2, 0);
  add(new THREE.ConeGeometry(0.62, 0.5, 8), M(0xd23a32), 0, topY + 1.5, 0);
  add(new THREE.SphereGeometry(0.1, 6, 4), rail, 0, topY + 1.82, 0);
  const light = new THREE.PointLight(0xffd870, 6, 12);
  light.position.set(0, topY + 0.65, 0);
  root.add(light);

  // cottage
  const cot = new THREE.Group();
  cot.position.set(-1.9, 2.1, 0.9);
  cot.rotation.y = 0.5;
  root.add(cot);
  add(new THREE.BoxGeometry(1.3, 0.8, 1), M(0xf1e2c0), 0, 0.4, 0, cot);
  const roof = add(new THREE.CylinderGeometry(0, 0.95, 0.6, 4), M(0xa8452f), 0, 1.1, 0, cot);
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.1, 1, 0.8);
  add(new THREE.BoxGeometry(0.22, 0.4, 0.1), M(0x5a3a22), 0, 0.2, 0.52, cot);
  add(new THREE.BoxGeometry(0.25, 0.25, 0.1), M(0x9bd0e8), -0.4, 0.5, 0.52, cot);
  add(new THREE.BoxGeometry(0.25, 0.25, 0.1), M(0x9bd0e8), 0.4, 0.5, 0.52, cot);
  add(new THREE.BoxGeometry(0.15, 0.5, 0.15), rock, 0.4, 1.3, -0.2, cot);

  // dock
  const wood = M(0x8a5a33);
  const dock = new THREE.Group();
  dock.position.set(2.5, 0.3, 3.8);
  dock.rotation.y = -0.5;
  root.add(dock);
  add(new THREE.BoxGeometry(0.8, 0.1, 3), wood, 0, 0.35, 0, dock);
  for (let i = 0; i < 4; i++) {
    for (const sx of [-0.35, 0.35]) add(new THREE.BoxGeometry(0.1, 0.8, 0.1), wood, sx, 0, -1.3 + i * 0.85, dock);
  }
  // boat
  const boat = new THREE.Group();
  boat.position.set(5, 0.1, 3.5);
  boat.rotation.y = 0.4;
  root.add(boat);
  add(new THREE.BoxGeometry(0.7, 0.25, 1.6), M(0x2c5d9a), 0, 0.15, 0, boat);
  add(new THREE.BoxGeometry(0.5, 0.05, 1.3), wood, 0, 0.29, 0, boat);
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), wood, 0, 0.8, 0.1, boat);
  const sail = add(new THREE.BoxGeometry(0.02, 0.9, 0.6), M(0xf4f1ea), 0, 0.85, -0.2, boat);
  sail.rotation.y = 0.1;

  // light beams
  const beamM = M(0xfff0a0, { transparent: true, opacity: 0.25, emissive: new THREE.Color(0xffe080), emissiveIntensity: 0.6 });
  for (const d of [1, -1]) {
    const b = add(new THREE.ConeGeometry(0.8, 6, 8, 1, true), beamM, 0, 0, 0);
    b.position.set(0, topY + 0.65, d * 3);
    b.rotation.x = d * Math.PI / 2;
    b.material.side = THREE.DoubleSide;
  }

  // gulls
  const gm = M(0xffffff);
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    g.position.set(-3 + i * 1.5, 7 + i * 0.6, -2 + i);
    root.add(g);
    add(new THREE.BoxGeometry(0.25, 0.05, 0.1), gm, 0, 0, 0, g);
    const w1 = add(new THREE.BoxGeometry(0.4, 0.03, 0.15), gm, 0.3, 0.05, 0, g); w1.rotation.z = 0.3;
    const w2 = add(new THREE.BoxGeometry(0.4, 0.03, 0.15), gm, -0.3, 0.05, 0, g); w2.rotation.z = -0.3;
  }

  root.add(new THREE.HemisphereLight(0xcfe8ff, 0x556655, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 10, 6);
  root.add(sun);
  return root;
}
