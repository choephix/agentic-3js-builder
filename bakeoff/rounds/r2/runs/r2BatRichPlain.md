```ts
import * as THREE from "three";

export const meta = {
  name: "Fruit Bat with Fig",
  description:
    "A golden-brown fluffy fruit bat with a fox-like face, wings spread wide over charcoal membranes, hovering while clutching a half-eaten fig.",
};

export default function build(): THREE.Object3D {
  let s = 1234567;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mat = (c: number, r = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true, ...extra });

  const fur = mat(0xb87a2e);
  const furLight = mat(0xdca552);
  const furDark = mat(0x8a5420);
  const skin = mat(0x2c2a31, 0.6, { side: THREE.DoubleSide });
  const bone = mat(0x1b1a20, 0.6);
  const black = mat(0x08080a, 0.25);
  const glint = mat(0xffffff, 0.2);
  const pink = mat(0xc77b7b);
  const claw = mat(0xd9ceb4, 0.5);
  const figSkin = mat(0x5a2a5e);
  const figRim = mat(0xe8d5a0);
  const figFlesh = mat(0xb02a45);
  const seed = mat(0xf2d675);
  const stemM = mat(0x56602e);

  const g = new THREE.Group();
  const add = (m: THREE.Object3D, parent: THREE.Object3D = g) => (parent.add(m), m);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, p: THREE.Vector3, sc?: THREE.Vector3) => {
    const o = new THREE.Mesh(geo, m);
    o.position.copy(p);
    if (sc) o.scale.copy(sc);
    return add(o);
  };

  const bar = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, r2 = r) => {
    const d = b.clone().sub(a);
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r, d.length(), 5), m);
    o.position.copy(a.clone().add(b).multiplyScalar(0.5));
    o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return add(o);
  };

  // Body
  mesh(new THREE.SphereGeometry(1, 10, 8), fur, V(0, 0.42, 0), V(0.115, 0.115, 0.18));
  // chest ruff
  mesh(new THREE.SphereGeometry(1, 8, 6), furLight, V(0, 0.41, 0.07), V(0.1, 0.095, 0.1));
  // fluff tufts
  const tuft = new THREE.IcosahedronGeometry(0.03, 0);
  for (let i = 0; i < 70; i++) {
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(rnd() * 2 - 1);
    const dir = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    const p = V(dir.x * 0.118, 0.42 + dir.y * 0.118, dir.z * 0.185);
    const m = mesh(tuft, rnd() < 0.4 ? furLight : rnd() < 0.5 ? fur : furDark, p, V(1, 1 + rnd() * 0.6, 1.3));
    m.lookAt(p.clone().add(dir));
  }
  // shoulder mantle (lighter golden collar)
  mesh(new THREE.SphereGeometry(1, 8, 6), furLight, V(0, 0.45, 0.1), V(0.12, 0.09, 0.08));

  // Head
  mesh(new THREE.SphereGeometry(0.075, 9, 7), fur, V(0, 0.47, 0.19), V(1, 0.95, 1));
  // cheeks fluff
  for (const sx of [-1, 1]) mesh(new THREE.IcosahedronGeometry(0.04, 0), furLight, V(sx * 0.05, 0.45, 0.2), V(1, 0.9, 1));
  // snout
  const snout = mesh(new THREE.CylinderGeometry(0.018, 0.045, 0.1, 6), furDark, V(0, 0.45, 0.28));
  snout.rotation.x = Math.PI / 2 + 0.12;
  mesh(new THREE.IcosahedronGeometry(0.024, 1), black, V(0, 0.455, 0.335), V(1.2, 0.9, 1));
  mesh(new THREE.SphereGeometry(0.006, 4, 3), glint, V(0.006, 0.463, 0.355));
  // mouth line
  mesh(new THREE.BoxGeometry(0.006, 0.004, 0.06), black, V(0, 0.425, 0.285));
  // eyes
  for (const sx of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.022, 8, 6), black, V(sx * 0.04, 0.50, 0.245));
    mesh(new THREE.SphereGeometry(0.006, 4, 3), glint, V(sx * 0.035, 0.508, 0.265));
    // brow
    const br = mesh(new THREE.BoxGeometry(0.035, 0.008, 0.015), furDark, V(sx * 0.04, 0.527, 0.24));
    br.rotation.z = -sx * 0.3;
    // ears
    const ear = mesh(new THREE.ConeGeometry(0.035, 0.12, 4), fur, V(sx * 0.05, 0.57, 0.17));
    ear.rotation.z = -sx * 0.3;
    ear.rotation.x = -0.15;
    const inner = mesh(new THREE.ConeGeometry(0.02, 0.08, 4), pink, V(sx * 0.05, 0.56, 0.18));
    inner.rotation.z = -sx * 0.3;
    inner.rotation.x = -0.15;
  }

  // Wings
  const shoulder = V(0.08, 0.46, 0.06);
  const elbow = V(0.23, 0.57, 0.12);
  const wrist = V(0.4, 0.54, 0.1);
  const tips = [V(0.7, 0.5, 0.2), V(0.68, 0.42, -0.04), V(0.54, 0.34, -0.2), V(0.34, 0.3, -0.3)];
  const knee = V(0.07, 0.36, -0.14);

  const wing = (sx: number) => {
    const f = (v: THREE.Vector3) => V(v.x * sx, v.y, v.z);
    const W = f(wrist);
    const edge: THREE.Vector3[] = [];
    const t = tips.map(f);
    t.forEach((p, i) => {
      edge.push(p);
      const nxt = i < t.length - 1 ? t[i + 1] : f(knee);
      if (i < t.length - 1) edge.push(p.clone().add(nxt).multiplyScalar(0.5).lerp(W, 0.2));
      else edge.push(p.clone().add(nxt).multiplyScalar(0.5).lerp(W, 0.15));
    });
    edge.push(f(knee));
    const pos: number[] = [];
    const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    for (let i = 0; i < edge.length - 1; i++) tri(W, edge[i], edge[i + 1]);
    tri(W, f(knee), f(shoulder));
    tri(f(shoulder), f(knee), V(0, 0.4, -0.1));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    add(new THREE.Mesh(geo, skin));

    bar(f(shoulder), f(elbow), 0.014, bone, 0.016);
    bar(f(elbow), W, 0.011, bone, 0.014);
    mesh(new THREE.SphereGeometry(0.017, 5, 4), bone, W);
    mesh(new THREE.SphereGeometry(0.014, 5, 4), bone, f(elbow));
    t.forEach((p) => bar(W, p, 0.003, bone, 0.007));
    // hind leg bone to wing
    bar(V(sx * 0.05, 0.37, -0.1), f(knee), 0.01, bone);
    // thumb + hooked claw
    const th = f(V(0.42, 0.6, 0.17));
    bar(W, th, 0.008, bone, 0.011);
    const c = mesh(new THREE.ConeGeometry(0.011, 0.045, 5), claw, th.clone().add(V(0, 0.015, 0.014)));
    c.rotation.x = 0.9;
    const c2 = mesh(new THREE.ConeGeometry(0.007, 0.025, 4), claw, th.clone().add(V(0, 0.005, 0.045)));
    c2.rotation.x = 1.9;
  };
  wing(1);
  wing(-1);

  // Legs and fig
  const figC = V(0, 0.087, -0.15);
  for (const sx of [-1, 1]) {
    const hip = V(sx * 0.055, 0.36, -0.12);
    const ank = V(sx * 0.08, 0.17, -0.15);
    bar(hip, V(sx * 0.07, 0.25, -0.15), 0.017, furDark, 0.022);
    bar(V(sx * 0.07, 0.25, -0.15), ank, 0.011, furDark, 0.016);
    mesh(new THREE.SphereGeometry(0.02, 5, 4), furDark, ank);
    // toes wrapping the fig
    for (let k = 0; k < 4; k++) {
      const z = -0.19 + k * 0.026;
      const a = V(sx * 0.085, 0.165, z);
      const b = V(sx * 0.08, 0.125, z + 0.003);
      bar(a, b, 0.005, furDark, 0.007);
      const cl = mesh(new THREE.ConeGeometry(0.005, 0.02, 4), claw, V(sx * 0.07, 0.105, z + 0.003));
      cl.rotation.z = sx * 0.9;
    }
  }

  const fig = new THREE.Group();
  fig.position.copy(figC);
  fig.rotation.x = 0.5;
  g.add(fig);
  const prof = [
    [0.001, -0.085], [0.025, -0.08], [0.058, -0.055], [0.08, -0.01], [0.082, 0.03], [0.068, 0.065], [0.06, 0.075],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  fig.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 9), figSkin));
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.006, 9), figRim);
  rim.position.y = 0.075;
  fig.add(rim);
  const flesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 9), figFlesh);
  flesh.position.y = 0.0785;
  fig.add(flesh);
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 0.045;
    const sd = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.006), seed);
    sd.position.set(Math.cos(a) * r, 0.0825, Math.sin(a) * r);
    sd.rotation.y = rnd() * 3;
    fig.add(sd);
  }
  // bite scoop notch
  const bite = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.03), figFlesh);
  bite.position.set(0.0, 0.069, 0.052);
  fig.add(bite);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.02, 5), stemM);
  stem.position.y = -0.088;
  fig.add(stem);

  return g;
}
```