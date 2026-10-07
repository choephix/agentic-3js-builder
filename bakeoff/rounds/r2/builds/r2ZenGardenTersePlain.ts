import * as THREE from "three";

export const meta = {
  name: "Japanese Garden",
  description: "A stylized low-poly Japanese garden with a pond, arched bridge, stone lantern, pagoda-style teahouse, torii gate, pine, maple and cherry trees, raked gravel and stepping stones.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, rough = 0.9) => {
    const k = c + "_" + rough;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });
    return mats[k];
  };
  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // gravel canvas texture
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const cx = cv.getContext("2d")!;
  cx.fillStyle = "#d9d2bd"; cx.fillRect(0, 0, 128, 128);
  cx.strokeStyle = "#b8b098"; cx.lineWidth = 2;
  for (let i = 0; i < 16; i++) { cx.beginPath(); cx.moveTo(0, i * 8 + 4); cx.lineTo(128, i * 8 + 4); cx.stroke(); }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  const gravelMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });

  // ground
  add(box(24, 0.2, 20), M(0x5f8f45), 0, -0.08, 0); // grass, top at 0.02
  add(box(9, 0.06, 7), gravelMat, -6, 0.03, 5.5); // gravel bed
  // pond
  const pond = add(cyl(4.5, 4.5, 0.05, 14), M(0x3f86a6, 0.2), 3, 0.04, -1);
  pond.scale.set(1.2, 1, 0.9);
  const rim = add(new THREE.TorusGeometry(4.5, 0.18, 5, 14), M(0x7d7a74), 3, 0.08, -1);
  rim.rotation.x = Math.PI / 2; rim.scale.set(1.2, 0.9, 1);
  // rocks on rim
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = add(new THREE.DodecahedronGeometry(0.25 + rnd() * 0.25, 0), M(i % 2 ? 0x8a8780 : 0x6f6c66), 3 + Math.cos(a) * 5.45, 0.12, -1 + Math.sin(a) * 4.1);
    r.scale.y = 0.7; r.rotation.y = rnd() * 6;
  }
  // lily pads and koi
  const pad = M(0x3f9a4a), flower = M(0xf7a8c4);
  for (let i = 0; i < 7; i++) {
    const p = add(cyl(0.3, 0.3, 0.02, 8), pad, 1 + rnd() * 4, 0.08, -2.5 + rnd() * 3);
    if (i % 3 === 0) add(new THREE.ConeGeometry(0.1, 0.12, 6), flower, p.position.x, 0.14, p.position.z);
  }
  const koi = (x: number, z: number, ry: number, c: number) => {
    const g = new THREE.Group();
    const b = add(new THREE.SphereGeometry(0.2, 6, 4), M(c), 0, 0, 0, g); b.scale.set(2, 0.4, 0.8);
    const t = add(new THREE.ConeGeometry(0.12, 0.25, 4), M(c), -0.45, 0, 0, g); t.rotation.z = Math.PI / 2;
    add(new THREE.SphereGeometry(0.08, 5, 4), M(0x222222), 0.2, 0.07, 0, g);
    g.position.set(x, 0.08, z); g.rotation.y = ry; root.add(g);
  };
  koi(3, -0.5, 0.5, 0xf07830); koi(5, 0.5, 2.2, 0xf5f0e8); koi(1.5, -2, 4, 0xe03c2c);

  // bridge
  const br = new THREE.Group();
  const red = M(0xc4352b), wood = M(0x7a4a2a);
  for (let i = 0; i < 9; i++) {
    const t = i / 8 * 2 - 1;
    const y = 0.5 * (1 - t * t) + 0.25;
    const pl = add(box(0.38, 0.12, 1.4), wood, t * 1.8, y, 0, br);
    pl.rotation.z = -t * 0.55;
    if (i % 2 === 0) {
      add(cyl(0.05, 0.05, 0.6, 5), red, t * 1.8, y + 0.35, 0.7, br);
      add(cyl(0.05, 0.05, 0.6, 5), red, t * 1.8, y + 0.35, -0.7, br);
    }
  }
  for (const z of [0.7, -0.7]) {
    for (let i = 0; i < 8; i++) {
      const t0 = i / 8 * 2 - 1, t1 = (i + 1) / 8 * 2 - 1;
      const y0 = 0.5 * (1 - t0 * t0) + 0.7, y1 = 0.5 * (1 - t1 * t1) + 0.7;
      const len = Math.hypot(3.6 / 8 * 1, y1 - y0) ;
      const r = add(box(len + 0.02, 0.07, 0.08), red, (t0 + t1) * 0.9, (y0 + y1) / 2, z, br);
      r.rotation.z = Math.atan2(y1 - y0, 0.45);
    }
  }
  br.position.set(3, 0.1, 2.4);
  br.rotation.y = 0;
  br.scale.set(1.4, 1, 1);
  root.add(br);
  // bridge abutments
  add(box(1, 0.3, 1.6), M(0x8a8780), 0.2, 0.12, 2.4);
  add(box(1, 0.3, 1.6), M(0x8a8780), 5.8, 0.12, 2.4);

  // stone lantern
  const st = M(0x9b9890), stD = M(0x77746e);
  const lan = new THREE.Group();
  add(box(0.8, 0.15, 0.8), stD, 0, 0.1, 0, lan);
  add(cyl(0.14, 0.17, 0.7, 6), st, 0, 0.5, 0, lan);
  add(box(0.6, 0.12, 0.6), stD, 0, 0.9, 0, lan);
  add(box(0.4, 0.4, 0.4), st, 0, 1.15, 0, lan);
  for (const sg of [1, -1]) {
    add(box(0.14, 0.2, 0.02), M(0xffd77a, 0.5), 0, 1.15, sg * 0.21, lan);
  }
  add(new THREE.ConeGeometry(0.6, 0.35, 4), stD, 0, 1.55, 0, lan).rotation.y = Math.PI / 4;
  add(new THREE.SphereGeometry(0.1, 6, 4), st, 0, 1.78, 0, lan);
  lan.position.set(-2.5, 0, 2.2);
  root.add(lan);

  // torii gate
  const to = new THREE.Group();
  const tr = M(0xd8402e), bk = M(0x222222);
  for (const x of [-1.1, 1.1]) {
    add(cyl(0.14, 0.17, 3, 8), tr, x, 1.5, 0, to);
    add(cyl(0.2, 0.2, 0.1, 8), bk, x, 0.05, 0, to);
  }
  add(box(3.6, 0.2, 0.3), bk, 0, 3.1, 0, to);
  add(box(3.8, 0.16, 0.3), tr, 0, 3.28, 0, to);
  add(box(2.8, 0.16, 0.2), tr, 0, 2.5, 0, to);
  add(box(0.2, 0.4, 0.2), tr, 0, 2.7, 0, to);
  to.position.set(-6, 0, -1);
  to.rotation.y = 0.5;
  root.add(to);

  // teahouse
  const th = new THREE.Group();
  add(box(4.4, 0.4, 3.4), M(0x6b5a48), 0, 0.2, 0, th);
  add(box(3.6, 0.1, 2.8), M(0xcfa86a), 0, 0.45, 0, th);
  const post = M(0x5a3a22);
  for (const x of [-1.6, 1.6]) for (const z of [-1.2, 1.2]) add(cyl(0.09, 0.09, 2, 6), post, x, 1.5, z, th);
  add(box(3.2, 1.8, 0.1), M(0xf2ead6), 0, 1.45, -1.15, th);
  add(box(0.1, 1.8, 2.3), M(0xf2ead6), -1.55, 1.45, 0, th);
  add(box(0.1, 1.8, 2.3), M(0xf2ead6), 1.55, 1.45, 0, th);
  for (let i = 0; i < 3; i++) add(box(0.04, 1.8, 0.12), post, -1 + i * 1, 1.45, -1.12, th);
  // roof
  const roof = M(0x3b4552);
  const r1 = add(new THREE.ConeGeometry(3.6, 1.3, 4), roof, 0, 3.15, 0, th);
  r1.rotation.y = Math.PI / 4; r1.scale.set(1.15, 1, 0.9);
  add(new THREE.ConeGeometry(0.25, 0.5, 6), M(0xc9a23a), 0, 4.0, 0, th);
  th.position.set(-4.5, 0, -5);
  root.add(th);

  // trees
  const trunk = M(0x5b3f2a);
  const pine = (x: number, z: number, h: number) => {
    const g = new THREE.Group();
    const t = add(cyl(0.12, 0.2, h, 6), trunk, 0, h / 2, 0, g);
    t.rotation.z = 0.12;
    for (let i = 0; i < 4; i++) {
      const p = add(new THREE.IcosahedronGeometry(0.8 - i * 0.12, 0), M(i % 2 ? 0x2f6b3a : 0x3a7d44), Math.sin(i * 2) * 0.4, h * 0.45 + i * h * 0.17, Math.cos(i * 2) * 0.4, g);
      p.scale.y = 0.5;
    }
    g.position.set(x, 0, z); root.add(g);
  };
  pine(-8, 3, 2.8); pine(-9.5, -4, 3.4); pine(8.5, 4.5, 2.6);
  const blossom = (x: number, z: number, c1: number, c2: number, h: number) => {
    const g = new THREE.Group();
    add(cyl(0.12, 0.22, h, 6), trunk, 0, h / 2, 0, g);
    for (let i = 0; i < 6; i++) {
      add(new THREE.IcosahedronGeometry(0.7 + rnd() * 0.4, 0), i % 2 ? M(c1) : M(c2), (rnd() - 0.5) * 1.8, h + (rnd() - 0.3) * 0.7, (rnd() - 0.5) * 1.8, g);
    }
    g.position.set(x, 0, z); root.add(g);
  };
  blossom(8, -5, 0xf6b4cc, 0xf08fb2, 2.4);
  blossom(-1, -7, 0xf6b4cc, 0xfad0de, 2.2);
  blossom(9, 0, 0xd8402e, 0xe8651f, 2.0); // maple

  // petals on ground
  for (let i = 0; i < 30; i++) {
    const p = add(new THREE.CircleGeometry(0.06, 5), M(0xf8c2d4), 6 + rnd() * 5 - 2, 0.03, -6 + rnd() * 8);
    p.rotation.x = -Math.PI / 2;
  }

  // stepping stones path
  for (let i = 0; i < 7; i++) {
    const p = add(cyl(0.38, 0.42, 0.08, 7), M(0x8f8c85), -3.2 + i * 0.1 + Math.sin(i) * 0.3, 0.05, 1 - i * 0.55 - 0.5);
    p.rotation.y = rnd() * 3;
  }

  // zen rocks and bamboo
  for (let i = 0; i < 3; i++) {
    const r = add(new THREE.DodecahedronGeometry(0.35 + i * 0.12, 0), M(0x5e5c58), -7 + i * 1.2, 0.2, 5 + (i % 2));
    r.scale.y = 0.8;
  }
  const bam = M(0x6fae4c), bamD = M(0x4f8c38);
  for (let i = 0; i < 9; i++) {
    const h = 2.5 + rnd() * 1.5;
    const x = 8 + rnd() * 2, z = -8 + rnd() * 2;
    add(cyl(0.06, 0.07, h, 5), i % 2 ? bam : bamD, x, h / 2, z);
    for (let k = 1; k < 4; k++) add(cyl(0.075, 0.075, 0.03, 5), bamD, x, h * k / 4, z);
    add(new THREE.ConeGeometry(0.25, 0.5, 4), bam, x, h + 0.1, z);
  }

  return root;
}
