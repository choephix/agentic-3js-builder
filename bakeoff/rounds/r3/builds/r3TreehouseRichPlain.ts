import * as THREE from "three";

export const meta = { name: "Treehouse Diorama", description: "Cozy oak treehouse on a round grassy base with ladder, swing, lantern, mushrooms and bicycle." };

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, e = 0) => {
    const k = c + "_" + e;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.9, emissive: e ? c : 0, emissiveIntensity: e });
    return mats[k];
  };
  const root = new THREE.Group();
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); p.add(o); return o;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);

  // base
  add(cyl(3.6, 3.4, 0.3, 24), M(0x4f9a3c), 0, 0.15, 0);
  add(cyl(3.4, 3.0, 0.5, 24), M(0x6b4a2f), 0, -0.1, 0).position.y = -0.1;
  // lift so min y ~0: shift everything up by 0.25 later
  const top = new THREE.Group(); root.add(top);
  root.children.forEach(c => { if (c !== top) top.add(c); });
  root.remove(top);
  const R = new THREE.Group(); R.add(top); R.position.y = 0.25;
  const W = R; // working parent
  const a = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => add(g, m, x, y, z, W);

  const bark = M(0x6e4a2c), bark2 = M(0x58391f), leaf1 = M(0x2f7d32), leaf2 = M(0x3f9a3a), leaf3 = M(0x5ab048);
  const wood = M(0xc08a52), wood2 = M(0x9a6a3a), red = M(0xb5302a), red2 = M(0x8f2220);

  // trunk
  a(cyl(0.7, 1.1, 1.2, 9), bark, 0, 0.9, 0);
  a(cyl(0.6, 0.7, 1.6, 9), bark2, 0, 2.2, 0);
  a(cyl(0.55, 0.6, 1.6, 9), bark, 0, 3.7, 0);
  // roots
  for (let i = 0; i < 6; i++) {
    const ang = i * Math.PI / 3 + 0.3;
    const r = a(box(0.35, 0.3, 1.1), bark, Math.sin(ang) * 1.1, 0.4, Math.cos(ang) * 1.1);
    r.rotation.y = ang; r.rotation.x = 0.0;
  }
  // branches
  const br: [number, number][] = [[1, 0], [-1, 0.5], [0.3, -1], [-0.5, -0.9]];
  br.forEach(([dx, dz], i) => {
    const b = a(cyl(0.14, 0.24, 2.2, 6), bark, dx * 0.9, 4.1 + i * 0.1, dz * 0.9);
    b.rotation.z = -dx * 0.9; b.rotation.x = dz * 0.9;
  });

  // crown
  const lm = [leaf1, leaf2, leaf3];
  for (let i = 0; i < 34; i++) {
    const ang = rnd() * 6.28, rad = 0.4 + rnd() * 2.2;
    const y = 5.0 + rnd() * 1.8 - rad * 0.2;
    const sz = 0.8 + rnd() * 0.7;
    const o = a(new THREE.IcosahedronGeometry(sz, 0), lm[i % 3], Math.cos(ang) * rad, y, Math.sin(ang) * rad);
    o.rotation.set(rnd() * 3, rnd() * 3, 0);
  }
  a(new THREE.IcosahedronGeometry(1.4, 0), leaf2, 0, 6.4, 0);

  // platform
  a(cyl(1.7, 1.7, 0.18, 10), wood2, 0, 3.2, 0);
  for (let i = 0; i < 10; i++) {
    const ang = i / 10 * 6.28;
    a(box(0.08, 0.5, 0.08), wood2, Math.cos(ang) * 1.6, 3.5, Math.sin(ang) * 1.6);
  }
  a(cyl(1.62, 1.62, 0.06, 10), wood2, 0, 3.8, 0).scale.set(1, 1, 1);

  // cabin (offset in front of the trunk)
  const cab = new THREE.Group(); cab.position.set(0, 3.3, 0.55); W.add(cab);
  const c = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => add(g, m, x, y, z, cab);
  c(box(1.7, 1.1, 1.4), wood, 0, 0.55, 0);
  for (let i = -3; i <= 3; i++) c(box(0.02, 1.1, 0.02), wood2, i * 0.24, 0.55, 0.71);
  c(box(1.8, 0.08, 0.08), wood2, 0, 0.04, 0.72);
  // roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.9, 4), red);
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.05, 1, 0.9); roof.position.set(0, 1.55, 0); cab.add(roof);
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.0 - i * 0.28, 0.025, 4, 4), red2);
    r.rotation.x = Math.PI / 2; r.rotation.z = Math.PI / 4; r.scale.set(1.05, 0.9, 1); r.position.y = 1.2 + i * 0.28; cab.add(r);
  }
  // chimney
  c(box(0.25, 0.5, 0.25), M(0x8a8580), 0.5, 1.6, -0.2);
  // window
  const wd = c(cyl(0.3, 0.3, 0.06, 12), M(0x4a2f1a), 0.4, 0.7, 0.72); wd.rotation.x = Math.PI / 2;
  const gl = c(cyl(0.23, 0.23, 0.08, 12), M(0xffd978, 0.6), 0.4, 0.7, 0.72); gl.rotation.x = Math.PI / 2;
  c(box(0.46, 0.04, 0.09), M(0x4a2f1a), 0.4, 0.7, 0.73);
  c(box(0.04, 0.46, 0.09), M(0x4a2f1a), 0.4, 0.7, 0.73);
  // door
  c(box(0.4, 0.8, 0.06), M(0x6a3d1e), -0.4, 0.4, 0.72);
  c(new THREE.SphereGeometry(0.03, 5, 4), M(0xe8c34a), -0.27, 0.4, 0.77);
  // lantern
  c(box(0.02, 0.2, 0.02), M(0x333333), -0.82, 0.85, 0.8);
  c(box(0.3, 0.02, 0.02), M(0x333333), -0.68, 0.95, 0.8);
  c(box(0.14, 0.18, 0.14), M(0xffc040, 0.8), -0.55, 0.78, 0.8);
  c(cyl(0.01, 0.1, 0.07, 4), M(0x333333), -0.55, 0.91, 0.8);
  // flag
  c(cyl(0.02, 0.02, 0.9, 5), M(0xeeeeee), 0, 2.35, 0);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.55, 3), M(0xf2c230)); fl.rotation.z = -Math.PI / 2; fl.position.set(0.27, 2.62, 0); cab.add(fl);

  // rope ladder
  const rope = M(0xd8c08a);
  for (const sx of [-0.25, 0.25]) a(cyl(0.02, 0.02, 3.1, 4), rope, sx - 0.0 + 0, 1.75, 1.75);
  for (let i = 0; i < 9; i++) a(cyl(0.025, 0.025, 0.56, 5), wood2, 0, 0.35 + i * 0.33, 1.75).rotation.z = Math.PI / 2;
  // swing
  const bx = 1.7, bz = 0.3;
  for (const dz of [-0.35, 0.35]) a(cyl(0.015, 0.015, 2.0, 4), rope, bx + 0.5, 2.2, bz + dz - 0.0);
  a(box(0.3, 0.06, 0.9), wood2, bx + 0.5, 1.2, bz);
  a(cyl(0.1, 0.16, 1.4, 5), bark, 0.9, 3.9, bz).rotation.z = -1.2;
  a(cyl(0.05, 0.05, 0.1, 5), bark, bx + 0.5, 3.3, bz);

  // mushrooms
  const mc = [0xd23b34, 0xe8a23a, 0xc94f8a];
  [[-1.4, 1.3, 0.3], [-1.9, 0.9, 0.2], [-1.1, 1.8, 0.22]].forEach(([x, z, sc], i) => {
    a(cyl(0.05 * sc / 0.3, 0.07 * sc / 0.3, 0.25 * sc / 0.3, 6), M(0xf0e6d0), x, 0.12 * sc / 0.3, z);
    a(new THREE.SphereGeometry(0.17 * sc / 0.3, 7, 4, 0, 6.28, 0, 1.6), M(mc[i]), x, 0.24 * sc / 0.3, z);
  });

  // bicycle
  const bike = new THREE.Group(); bike.position.set(1.7, 0.33, 1.7); bike.rotation.y = -0.6; W.add(bike);
  const bm = M(0x2a7fb8), blk = M(0x222222);
  for (const x of [-0.5, 0.5]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 5, 14), blk); bike.add(t); t.position.x = x;
    t.rotation.y = Math.PI / 2; t.position.x = x;
    t.rotation.set(0, 0, 0); t.rotation.y = 0;
    t.rotation.y = Math.PI / 2;
    add(new THREE.SphereGeometry(0.05, 5, 4), bm, 0, 0, x, bike);
  }
  // wheels axis along z
  bike.children.forEach(ch => { ch.rotation.set(0, 0, 0); });
  bike.clear();
  for (const z of [-0.5, 0.5]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 5, 14), blk); t.position.z = z; bike.add(t);
    add(new THREE.SphereGeometry(0.05, 5, 4), bm, 0, 0, z, bike);
  }
  const bar = (len: number, x: number, y: number, z: number, rx: number) => { const o = add(cyl(0.025, 0.025, len, 5), bm, x, y, z, bike); o.rotation.x = rx; };
  bar(0.75, 0, 0.12, 0.0, Math.PI / 2);
  bar(0.55, 0, 0.1, -0.25, -0.5);
  bar(0.55, 0, 0.1, 0.35, 0.5);
  bar(0.4, 0, 0.45, -0.4, 0);
  add(box(0.1, 0.04, 0.22), blk, 0, 0.47, -0.4, bike);
  const hb = add(cyl(0.02, 0.02, 0.45, 5), blk, 0, 0.6, 0.5, bike); hb.rotation.z = Math.PI / 2;
  bar(0.6, 0, 0.33, 0.5, 0);

  // grass tufts and flowers
  for (let i = 0; i < 24; i++) {
    const ang = rnd() * 6.28, rad = 1.5 + rnd() * 1.8;
    const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
    if (rnd() < 0.5) a(new THREE.ConeGeometry(0.08, 0.25, 4), leaf3, x, 0.12, z);
    else {
      a(cyl(0.01, 0.01, 0.2, 3), leaf1, x, 0.1, z);
      a(new THREE.IcosahedronGeometry(0.07, 0), M(rnd() < 0.5 ? 0xffffff : 0xffd23a), x, 0.22, z);
    }
  }
  // rocks
  for (let i = 0; i < 4; i++) {
    const ang = 2.2 + i * 0.5;
    a(new THREE.DodecahedronGeometry(0.2 + rnd() * 0.1, 0), M(0x8a8a88), Math.cos(ang) * 3.0, 0.1, Math.sin(ang) * 3.0);
  }
  return R;
}
