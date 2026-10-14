import * as THREE from "three";

export const meta = {
  name: "Treehouse",
  description: "A stylized low-poly treehouse built in a big oak, with a plank cabin, a gabled shingle roof, a wraparound deck, a rope ladder, a swing and lanterns.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const k = c + JSON.stringify(opts);
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...opts });
    return mats[k];
  };
  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // plank texture
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const cx = cv.getContext("2d")!;
  cx.fillStyle = "#c8894f"; cx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) {
    cx.fillStyle = i % 2 ? "#b87a42" : "#d29659";
    cx.fillRect(0, i * 16, 128, 15);
    cx.fillStyle = "#8a5428";
    cx.fillRect(0, i * 16 + 15, 128, 1.5);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const plankM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, flatShading: true });

  const bark = M(0x6b4a2f), barkD = M(0x4f3522), wood = M(0x9a6a3a), woodD = M(0x6e4524);
  const roofM = M(0xb23a30), roofM2 = M(0x8f2c28);
  const leaf = [M(0x3f8f3f), M(0x4fa34a), M(0x2f7a3a), M(0x66b552)];
  const glow = M(0xffd27a, { emissive: 0xffa930, emissiveIntensity: 0.8 });
  const glass = M(0x9fd8ee, { emissive: 0x4a90b0, emissiveIntensity: 0.3 });

  // trunk
  const trunk = add(new THREE.CylinderGeometry(0.85, 1.25, 6, 9), bark, 0, 3, 0);
  add(new THREE.CylinderGeometry(0.6, 0.85, 4, 8), bark, 0, 8, 0);
  // roots
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = add(box(0.5, 0.45, 1.8), barkD, Math.cos(a) * 1.35, 0.15, Math.sin(a) * 1.35);
    r.rotation.y = -a + Math.PI / 2;
    r.rotation.x = 0.25;
    r.scale.y = 1;
  }
  // grass ground disc
  add(new THREE.CylinderGeometry(4.5, 4.8, 0.2, 10), M(0x5e9c45), 0, 0.08, 0);
  add(new THREE.CylinderGeometry(4.5, 4.8, 0.2, 10), M(0x5e9c45), 0, 0.08, 0);

  // big branches
  const branch = (x: number, y: number, z: number, len: number, rx: number, rz: number, ry: number, r = 0.25) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.set(rx, ry, rz);
    root.add(g);
    add(new THREE.CylinderGeometry(r * 0.6, r, len, 6), bark, 0, len / 2, 0, g);
  };
  branch(0.4, 7.5, 0, 4, 0, -1.0, 0.3);
  branch(-0.4, 8, 0, 4, 0.5, 0.9, 0.2);
  branch(0, 9, 0, 4, -0.9, 0.2, 0);
  branch(0, 10, 0, 3.5, 0.9, -0.3, 0.5);

  // canopy
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = 1 + rnd() * 3.3;
    const y = 9.6 + rnd() * 3.4 - rad * 0.25;
    const sz = 1.1 + rnd() * 1.1;
    const m = add(new THREE.IcosahedronGeometry(sz, 0), leaf[Math.floor(rnd() * 4)], Math.cos(a) * rad, y, Math.sin(a) * rad);
    m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  }
  add(new THREE.IcosahedronGeometry(2, 0), leaf[0], 0, 12.3, 0);

  // platform
  const py = 4.2;
  add(new THREE.CylinderGeometry(0.2, 0.2, 1, 6), woodD, 0, 0, 0).visible = false;
  const deck = add(box(5.2, 0.25, 5.2), plankM, 0, py, 0);
  // trunk hole: trunk passes through
  add(box(5.4, 0.2, 0.2), woodD, 0, py - 0.2, 2.6);
  add(box(5.4, 0.2, 0.2), woodD, 0, py - 0.2, -2.6);
  add(box(0.2, 0.2, 5.4), woodD, 2.6, py - 0.2, 0);
  add(box(0.2, 0.2, 5.4), woodD, -2.6, py - 0.2, 0);
  // support struts
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const st = add(box(0.2, 3.2, 0.2), woodD, sx * 1.8, py - 1.3, sz * 1.8);
      st.rotation.z = sx * 0.55;
      st.position.x = sx * 1.6;
      st.rotation.x = -sz * 0.0;
    }
  }
  // posts and railing (front deck is z 1.2..2.6)
  const rh = py + 0.9;
  for (const x of [-2.5, -1.25, 0, 1.25, 2.5]) for (const z of [2.5, -2.5]) add(box(0.14, 0.9, 0.14), wood, x, py + 0.55, z);
  for (const z of [-1.25, 0, 1.25]) for (const x of [-2.5, 2.5]) add(box(0.14, 0.9, 0.14), wood, x, py + 0.55, z);
  add(box(5.2, 0.12, 0.12), wood, 0, rh, -2.5);
  add(box(5.2, 0.12, 0.12), wood, 0, rh, 2.5);
  add(box(0.12, 0.12, 5.2), wood, -2.5, rh, 0);
  add(box(0.12, 0.12, 5.2), wood, 2.5, rh, 0);
  for (const z of [-2.5, 2.5]) add(box(5.0, 0.08, 0.08), wood, 0, py + 0.45, z);
  for (const x of [-2.5, 2.5]) add(box(0.08, 0.08, 5.0), wood, x, py + 0.45, 0);

  // cabin
  const cy = py + 0.125;
  const ch = 2.4;
  const cabin = add(box(3.4, ch, 3.0), plankM, 0, cy + ch / 2, -0.4);
  // trunk is inside cabin; corner posts
  for (const x of [-1.7, 1.7]) for (const z of [-1.9, 1.1]) add(box(0.2, ch + 0.1, 0.2), woodD, x, cy + ch / 2, z);
  // door (front)
  add(box(0.9, 1.7, 0.08), M(0x5a3a1e), -0.7, cy + 0.85, 1.12);
  add(box(1.1, 0.12, 0.12), woodD, -0.7, cy + 1.75, 1.13);
  add(box(0.1, 1.8, 0.12), woodD, -1.2, cy + 0.9, 1.13);
  add(box(0.1, 1.8, 0.12), woodD, -0.2, cy + 0.9, 1.13);
  add(new THREE.SphereGeometry(0.06, 5, 4), M(0xe6c04a), -0.35, cy + 0.85, 1.19);
  // round window front
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 8).rotateX(Math.PI / 2), glass, 0.75, cy + 1.4, 1.12);
  add(new THREE.TorusGeometry(0.42, 0.06, 4, 8), woodD, 0.75, cy + 1.4, 1.14);
  add(box(0.06, 0.8, 0.06), woodD, 0.75, cy + 1.4, 1.17);
  add(box(0.8, 0.06, 0.06), woodD, 0.75, cy + 1.4, 1.17);
  // side windows
  for (const sx of [-1, 1]) {
    add(box(0.08, 0.7, 0.7), glass, sx * 1.72, cy + 1.4, -0.4);
    add(box(0.12, 0.1, 0.9), woodD, sx * 1.74, cy + 1.05, -0.4);
    add(box(0.12, 0.1, 0.9), woodD, sx * 1.74, cy + 1.75, -0.4);
    add(box(0.12, 0.8, 0.1), woodD, sx * 1.74, cy + 1.4, -0.4);
    // shutters
    add(box(0.06, 0.8, 0.28), M(0x3d7a8a), sx * 1.74, cy + 1.4, 0.2);
    add(box(0.06, 0.8, 0.28), M(0x3d7a8a), sx * 1.74, cy + 1.4, -1.0);
  }
  // window box with flowers
  add(box(1.0, 0.2, 0.25), woodD, 0.75, cy + 0.85, 1.28);
  const fc = [0xff6f91, 0xffd84a, 0xffffff];
  for (let i = 0; i < 6; i++) add(new THREE.IcosahedronGeometry(0.09, 0), M(fc[i % 3]), 0.4 + i * 0.14, cy + 1.02, 1.28);

  // gabled roof
  const roofY = cy + ch;
  const roofLen = 3.9, half = 2.2, rise = 1.5;
  const ang = Math.atan2(rise, half);
  const slopeL = Math.hypot(half, rise) + 0.2;
  for (const sd of [-1, 1]) {
    const g = new THREE.Group();
    g.position.set(sd * half / 2 * 1.0, roofY + rise / 2, -0.4);
    g.rotation.z = -sd * ang;
    root.add(g);
    add(box(slopeL, 0.14, roofLen), roofM, 0, 0, 0, g);
    // shingle rows
    for (let i = 0; i < 5; i++) {
      add(box(0.12, 0.08, roofLen + 0.05), i % 2 ? roofM2 : roofM, -slopeL / 2 + 0.3 + i * (slopeL / 5), 0.1, 0, g);
    }
  }
  add(box(0.25, 0.2, roofLen), roofM2, 0, roofY + rise + 0.05, -0.4);
  // gable triangles
  const tri = new THREE.Shape();
  tri.moveTo(-1.9, 0); tri.lineTo(1.9, 0); tri.lineTo(0, rise); tri.lineTo(-1.9, 0);
  const tg = new THREE.ShapeGeometry(tri);
  for (const z of [1.09, -1.89]) {
    const t = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false }), plankM);
    t.position.set(0, roofY, z - 0.05);
    root.add(t);
  }
  tg.dispose();
  // gable window
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 6).rotateX(Math.PI / 2), glow, 0, roofY + 0.55, 1.17);
  // chimney
  add(box(0.45, 1.0, 0.45), M(0x8a8a8a), -1.0, roofY + 1.3, -1.0);
  add(box(0.55, 0.12, 0.55), M(0x6e6e6e), -1.0, roofY + 1.85, -1.0);

  // flag
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4), woodD, 0, roofY + rise + 0.7, -1.9);
  const flag = add(box(0.6, 0.35, 0.03), M(0xf2c230), 0.3, roofY + rise + 1.15, -1.9);
  flag.rotation.y = 0.2;

  // rope ladder
  const lx = 0.6, lz = 2.5;
  for (const dx of [-0.3, 0.3]) add(new THREE.CylinderGeometry(0.025, 0.025, py, 4), M(0xd9c08a), lx + dx, py / 2, lz + 0.6);
  for (let i = 0; i < 9; i++) add(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5).rotateZ(Math.PI / 2), wood, lx, 0.35 + i * 0.42, lz + 0.6);
  add(box(0.8, 0.08, 0.08), woodD, lx, py + 0.05, lz + 0.1);
  for (const dx of [-0.3, 0.3]) add(box(0.04, 0.04, 0.6), M(0xd9c08a), lx + dx, py + 0.02, lz + 0.35);

  // swing from a branch
  const sx0 = -3.6;
  for (const dz of [-0.35, 0.35]) add(new THREE.CylinderGeometry(0.02, 0.02, 2.8, 4), M(0xd9c08a), sx0, 5.6, 0.4 + dz);
  add(box(0.3, 0.07, 0.9), wood, sx0, 4.2, 0.4);
  add(new THREE.CylinderGeometry(0.18, 0.2, 0.2, 6).rotateX(0), barkD, sx0, 7.05, 0.4).scale.set(0.5, 0.6, 3);
  add(box(0.18, 0.18, 1.2), bark, sx0, 7.1, 0.4);

  // lanterns
  for (const [x, z] of [[2.5, 2.5], [-2.5, 2.5]]) {
    add(box(0.05, 0.3, 0.05), woodD, x, py + 1.2, z);
    add(new THREE.OctahedronGeometry(0.17, 0), glow, x, py + 0.95, z);
  }
  add(new THREE.PointLight(0xffb85a, 0.6, 6), glow, 0, 0, 0).visible = false;

  // bushes and rocks
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 2.6 + rnd() * 1.4;
    add(new THREE.IcosahedronGeometry(0.4 + rnd() * 0.3, 0), leaf[i % 4], Math.cos(a) * r, 0.25, Math.sin(a) * r);
  }
  for (let i = 0; i < 4; i++) {
    const a = rnd() * Math.PI * 2;
    add(new THREE.DodecahedronGeometry(0.3, 0), M(0x8d8d8d), Math.cos(a) * 3.3, 0.2, Math.sin(a) * 3.3);
  }
  // mushrooms
  for (const [x, z] of [[1.6, 1.8], [-1.8, 1.4]]) {
    add(new THREE.CylinderGeometry(0.06, 0.08, 0.25, 5), M(0xf3ead2), x, 0.3, z);
    add(new THREE.ConeGeometry(0.2, 0.18, 6), M(0xd8352f), x, 0.5, z);
  }

  // remove invisible helper meshes
  const rem: THREE.Object3D[] = [];
  root.traverse((o) => { if (!o.visible) rem.push(o); });
  rem.forEach((o) => o.parent?.remove(o));
  void trunk; void deck; void cabin;
  return root;
}
