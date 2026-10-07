import * as THREE from "three";

export const meta = {
  name: "Keel-billed Toucan",
  description: "Stylized low-poly keel-billed toucan with a rainbow beak perched on a mossy branch beside a pink orchid.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.7, m = 0) => {
    const k = c + "_" + r;
    return (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true }));
  };
  const add = (p: THREE.Object3D, g: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    p.add(m);
    return m;
  };
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // Branch
  const branch = new THREE.Group();
  root.add(branch);
  const bark = M(0x5a3d26, 0.95), moss = M(0x4f8a2e, 1), moss2 = M(0x7ab33c, 1);
  const br = add(branch, new THREE.CylinderGeometry(0.03, 0.04, 0.8, 7), bark, 0, 0.1, 0);
  br.rotation.z = Math.PI / 2;
  br.rotation.y = 0;
  for (let i = 0; i < 14; i++) {
    const x = -0.36 + rnd() * 0.72;
    const a = rnd() * Math.PI * 2;
    const r = 0.035;
    add(branch, sph(0.02 + rnd() * 0.025, 6, 4), rnd() > 0.5 ? moss : moss2, x, 0.1 + Math.sin(a) * r, Math.cos(a) * r, 1, 0.6, 1);
  }
  // side twig
  const tw = add(branch, new THREE.CylinderGeometry(0.01, 0.018, 0.25, 6), bark, -0.36, 0.2, 0);
  tw.rotation.z = 0.6;
  add(branch, sph(0.03, 6, 4), moss2, -0.4, 0.3, 0);

  // Bird (y base: branch top ~0.14)
  const bird = new THREE.Group();
  bird.position.set(0.05, 0.14, 0);
  bird.rotation.y = 0;
  root.add(bird);
  const black = M(0x0b0b10, 0.25, 0.1), yellow = M(0xffe83a, 0.6), white = M(0xf4f4ee, 0.6);
  const lime = M(0x9be02a, 0.5), blue = M(0x35a8e8, 0.3), orange = M(0xff8a1c, 0.35), red = M(0xd8142a, 0.3), scarlet = M(0xe8182c, 0.7), feet = M(0x2f7be0, 0.5);

  // body tilted upright
  const body = new THREE.Group();
  body.rotation.x = 0.55;
  body.position.set(0, 0.17, 0);
  bird.add(body);
  add(body, sph(0.1, 10, 8), black, 0, 0, 0, 1, 1.45, 1);
  // bib
  add(body, sph(0.085, 8, 6), yellow, 0, 0.1, 0.045, 1.0, 0.95, 0.8);
  add(body, sph(0.05, 8, 6), white, 0, 0.06, 0.09, 1.1, 0.5, 0.5);
  // wings
  for (const sd of [-1, 1]) {
    const w = add(body, sph(0.08, 8, 6), black, sd * 0.088, -0.01, -0.02, 0.45, 1.6, 0.9);
    w.rotation.z = sd * -0.08;
  }
  // tail
  const tail = new THREE.Group();
  tail.position.set(0, -0.15, -0.03);
  tail.rotation.x = -0.35;
  body.add(tail);
  add(tail, new THREE.BoxGeometry(0.1, 0.24, 0.025), black, 0, -0.1, 0);
  add(tail, new THREE.BoxGeometry(0.1, 0.03, 0.026), M(0x1d3f8a, 0.4), 0, -0.22, 0);
  // undertail patch
  add(body, sph(0.06, 7, 5), scarlet, 0, -0.12, -0.04, 1.1, 0.7, 0.9);

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.36, 0.1);
  bird.add(head);
  add(head, sph(0.075, 10, 8), black, 0, 0, 0, 1, 1, 1.05);
  add(head, sph(0.05, 8, 6), yellow, 0, -0.04, 0.035, 1.1, 0.7, 0.8);
  for (const sd of [-1, 1]) {
    const x = sd * 0.056;
    const ring = add(head, new THREE.CylinderGeometry(0.036, 0.036, 0.012, 10), lime, x, 0.015, 0.045);
    ring.rotation.z = Math.PI / 2;
    ring.rotation.y = 0;
    add(head, new THREE.CylinderGeometry(0.022, 0.022, 0.016, 8), black, x + sd * 0.003, 0.015, 0.045).rotation.z = Math.PI / 2;
    add(head, sph(0.008, 4, 3), white, x + sd * 0.011, 0.02, 0.05);
  }

  // beak: stacked tapered segments along z
  const beak = new THREE.Group();
  beak.position.set(0, 0.0, 0.1);
  beak.rotation.x = 0.12;
  head.add(beak);
  const segs = [
    { m: lime, z: 0.0, l: 0.09, w: 0.062, h: 0.075 },
    { m: lime, z: 0.09, l: 0.07, w: 0.056, h: 0.068 },
    { m: blue, z: 0.16, l: 0.06, w: 0.05, h: 0.06 },
    { m: orange, z: 0.22, l: 0.07, w: 0.044, h: 0.052 },
    { m: orange, z: 0.29, l: 0.05, w: 0.036, h: 0.042 },
    { m: red, z: 0.34, l: 0.035, w: 0.026, h: 0.03 },
  ];
  segs.forEach((g, i) => {
    const n = segs[i + 1];
    const b = add(beak, new THREE.BoxGeometry(g.w * 2, g.h * 2, g.l), g.m, 0, -0.01 - i * 0.0085, g.z + g.l / 2);
    b.rotation.x = 0.03 * i;
    // lower mandible
    add(beak, new THREE.BoxGeometry(g.w * 1.5, g.h * 0.55, g.l), g.m === lime ? M(0x7dc81f, 0.5) : g.m, 0, -0.03 - g.h * 0.75 - i * 0.012, g.z + g.l / 2);
    // ridge
    add(beak, new THREE.BoxGeometry(0.014, 0.014, g.l * 0.95), g.m === red ? red : yellow, 0, g.h - 0.005 - i * 0.009 + 0.0, g.z + g.l / 2);
  });
  add(beak, new THREE.BoxGeometry(0.02, 0.02, 0.4), M(0x1a1a1a, 0.4), 0, -0.036, 0.19).scale.set(0.2, 0.05, 1);
  add(beak, sph(0.006, 4, 3), black, 0.014, 0.03, 0.05);
  add(beak, sph(0.006, 4, 3), black, -0.014, 0.03, 0.05);

  // legs and feet
  for (const sd of [-1, 1]) {
    const x = sd * 0.04;
    add(bird, new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), feet, x, 0.07, 0.01);
    for (let t = 0; t < 3; t++) {
      const toe = add(bird, new THREE.BoxGeometry(0.014, 0.014, 0.075), feet, x + (t - 1) * 0.016, 0.01, 0.045);
      toe.rotation.y = (t - 1) * 0.25 * -1;
    }
    const back = add(bird, new THREE.BoxGeometry(0.014, 0.014, 0.05), feet, x, 0.01, -0.03);
    void back;
    for (let t = 0; t < 3; t++) add(bird, new THREE.ConeGeometry(0.008, 0.02, 4), M(0x15233f), x + (t - 1) * 0.025, 0.008, 0.085).rotation.x = Math.PI / 2;
  }

  // Orchid
  const orch = new THREE.Group();
  orch.position.set(-0.26, 0.12, 0.05);
  root.add(orch);
  const stem = add(orch, new THREE.CylinderGeometry(0.005, 0.007, 0.2, 5), M(0x3e7a2a), 0.03, 0.1, 0);
  stem.rotation.z = -0.3;
  const leaf = add(orch, new THREE.BoxGeometry(0.1, 0.004, 0.03), M(0x2f6b25), -0.04, 0.02, 0.02);
  leaf.rotation.z = 0.4;
  const fl = new THREE.Group();
  fl.position.set(0.07, 0.21, 0.01);
  fl.rotation.x = 0.25;
  orch.add(fl);
  const pink = M(0xff6fb5, 0.5), pale = M(0xffb6d8, 0.5), deep = M(0xc2257a, 0.5);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const p = add(fl, sph(0.04, 6, 4), pink, Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0, 1, 1, 0.12);
    p.rotation.z = a;
    p.scale.set(1.1, 0.7, 0.12);
  }
  for (const sd of [-1, 1]) {
    const p = add(fl, sph(0.04, 6, 4), pale, sd * 0.045, 0.01, 0.005, 1, 1, 0.12);
    p.scale.set(1, 1.2, 0.12);
  }
  add(fl, sph(0.028, 6, 4), deep, 0, -0.03, 0.01, 1, 0.9, 0.2);
  add(fl, sph(0.012, 5, 4), yellow, 0, 0, 0.015);

  // slight lift: branch base at y=0
  branch.position.y = 0.04 - 0.0;
  bird.position.y += 0.04;
  orch.position.y += 0.04;
  // the lowest point is the branch bottom at 0.04+0.1-0.04 -> sink to floor
  root.position.y = -0.1;
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  wrap.rotation.y = 0;
  return wrap;
}
