import * as THREE from "three";

export const meta = {
  name: "Baby Dragon with Egg",
  description: "A house-cat-sized teal baby dragon sitting proudly beside its broken speckled egg.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const M = (c: number, o: any = {}) =>
    new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.8, ...o });
  const teal = M(0x2aa3a0), dark = M(0x1b7a7c), belly = M(0xf6e3a1), orange = M(0xf08a3c),
    horn = M(0xf3ead2), amber = M(0xffb21e, { emissive: 0x663300, roughness: 0.3 }),
    pupil = M(0x1a0f10), white = M(0xffffff), membrane = M(0xffa63a, { transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
    bone = M(0x167377), smoke = M(0xcccccc, { transparent: true, opacity: 0.5 }),
    shell = M(0xf2ecd8), inner = M(0xf7c9a0), speck = M(0x8a6a4a), nest = M(0x6b4a2f), pink = M(0xe0707a);

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    me.scale.set(sx, sy, sz);
    p.add(me);
    return me;
  };
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ground patch
  add(root, new THREE.CylinderGeometry(0.5, 0.55, 0.02, 12), nest, 0, 0.01, 0.05);

  const d = new THREE.Group();
  d.position.set(-0.05, 0, 0);
  root.add(d);

  // body (sitting)
  add(d, sph(0.15, 10, 8), teal, 0, 0.17, 0, 1, 1.05, 1.0);
  add(d, sph(0.12, 8, 6), belly, 0, 0.16, 0.07, 0.95, 1.05, 0.8);
  // belly bands
  for (let i = 0; i < 4; i++) add(d, new THREE.BoxGeometry(0.17 - i * 0.01, 0.012, 0.02), M(0xe8cf86), 0, 0.09 + i * 0.045, 0.15 - i * 0.012);
  // haunches
  for (const sx of [-1, 1]) {
    add(d, sph(0.09, 8, 6), teal, sx * 0.13, 0.1, -0.02, 1, 1, 1.3);
    add(d, new THREE.BoxGeometry(0.08, 0.04, 0.13), dark, sx * 0.13, 0.02, 0.1);
    for (let t = -1; t <= 1; t++) add(d, new THREE.ConeGeometry(0.012, 0.03, 4), horn, sx * 0.13 + t * 0.025, 0.025, 0.18).rotation.x = Math.PI / 2;
  }
  // arms
  for (const sx of [-1, 1]) {
    const a = add(d, new THREE.CylinderGeometry(0.025, 0.03, 0.14, 6), teal, sx * 0.14, 0.2, 0.1);
    a.rotation.x = 0.4;
    a.rotation.z = -sx * 0.25;
    add(d, sph(0.035, 6, 5), dark, sx * 0.16, 0.13, 0.15);
    for (let t = -1; t <= 1; t++) add(d, new THREE.ConeGeometry(0.01, 0.03, 4), horn, sx * 0.16 + t * 0.016, 0.115, 0.185).rotation.x = Math.PI / 2;
  }

  // neck + head
  add(d, new THREE.CylinderGeometry(0.06, 0.08, 0.14, 7), teal, 0, 0.32, 0.03).rotation.x = -0.15;
  add(d, new THREE.BoxGeometry(0.06, 0.1, 0.03), belly, 0, 0.31, 0.1);
  const head = new THREE.Group();
  head.position.set(0, 0.43, 0.06);
  head.rotation.x = -0.12;
  d.add(head);
  add(head, new THREE.BoxGeometry(0.2, 0.15, 0.17), teal);
  add(head, new THREE.BoxGeometry(0.16, 0.07, 0.1), teal, 0, -0.03, 0.12);
  add(head, new THREE.BoxGeometry(0.15, 0.04, 0.09), belly, 0, -0.085, 0.1);
  add(head, new THREE.BoxGeometry(0.16, 0.012, 0.02), white, 0, -0.058, 0.17);
  // teeth
  for (let i = -3; i <= 3; i++) {
    const t = add(head, new THREE.ConeGeometry(0.009, 0.025, 4), white, i * 0.02, -0.07, 0.17);
    t.rotation.x = Math.PI;
  }
  add(head, new THREE.BoxGeometry(0.1, 0.012, 0.06), pink, 0, -0.07, 0.12);
  // nostrils & smoke
  for (const sx of [-1, 1]) add(head, new THREE.BoxGeometry(0.02, 0.015, 0.01), pupil, sx * 0.035, 0.02, 0.176);
  for (let i = 0; i < 6; i++) {
    const r = 0.014 + i * 0.006;
    add(head, sph(r, 6, 5), smoke, 0.035 + Math.sin(i * 1.1) * 0.03, 0.05 + i * 0.045, 0.19 + i * 0.01);
  }
  // eyes
  for (const sx of [-1, 1]) {
    add(head, sph(0.05, 8, 6), amber, sx * 0.075, 0.04, 0.07);
    add(head, new THREE.BoxGeometry(0.016, 0.055, 0.01), pupil, sx * 0.08, 0.04, 0.115);
    add(head, sph(0.01, 4, 3), white, sx * 0.09, 0.06, 0.12);
    add(head, new THREE.BoxGeometry(0.1, 0.02, 0.07), dark, sx * 0.075, 0.098, 0.07).rotation.z = -sx * 0.2;
    // horns
    const h = add(head, new THREE.ConeGeometry(0.03, 0.12, 5), horn, sx * 0.07, 0.12, -0.04);
    h.rotation.set(-0.5, 0, -sx * 0.35);
    // ears / frills
    const f = add(head, new THREE.ConeGeometry(0.03, 0.09, 4), orange, sx * 0.115, 0.0, -0.05);
    f.rotation.set(0, 0, -sx * 1.9);
  }

  // spines along back
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const y = 0.5 - t * 0.38, z = -0.07 - Math.sin(t * 2.2) * 0.1;
    const sp = add(d, new THREE.ConeGeometry(0.025 - t * 0.008, 0.07 - t * 0.02, 4), orange, 0, y, z - (i < 3 ? -0.04 : 0));
    sp.rotation.x = -0.6;
  }

  // tail curling around front-right
  const tailPts = [[0, 0.06, -0.12], [0.1, 0.05, -0.22], [0.22, 0.04, -0.2], [0.3, 0.04, -0.08], [0.3, 0.04, 0.06], [0.26, 0.04, 0.16]];
  for (let i = 0; i < tailPts.length; i++) {
    const r = 0.07 - i * 0.009;
    const [x, y, z] = tailPts[i];
    add(d, sph(r, 7, 5), i % 2 ? teal : dark, x, Math.max(y, r * 0.9), z);
    if (i > 0 && i < 5) add(d, new THREE.ConeGeometry(0.02, 0.05, 4), orange, x, r * 1.8, z);
  }
  const spade = add(d, new THREE.ConeGeometry(0.06, 0.1, 4), orange, 0.24, 0.03, 0.24, 1, 1, 0.3);
  spade.rotation.set(Math.PI / 2, 0, 0.0);
  spade.rotation.order = "YXZ";
  add(d, new THREE.ConeGeometry(0.05, 0.09, 4), orange, 0.24, 0.03, 0.26, 1, 0.3, 1).rotation.x = Math.PI / 2;

  // wings
  const wing = (sx: number) => {
    const w = new THREE.Group();
    w.position.set(sx * 0.12, 0.33, -0.08);
    w.rotation.set(0, sx * 0.5, sx * -0.25);
    d.add(w);
    const arm = add(w, new THREE.CylinderGeometry(0.014, 0.02, 0.26, 5), bone, sx * 0.1, 0.1, 0);
    arm.rotation.z = -sx * 0.6;
    const tips: [number, number][] = [[0.38, 0.3], [0.46, 0.17], [0.4, 0.03], [0.26, -0.05]];
    const o = new THREE.Vector3(sx * 0.2, 0.2, 0);
    add(w, sph(0.025, 5, 4), bone, o.x, o.y, 0);
    const base = new THREE.Vector3(0, 0, 0);
    tips.forEach((tp, i) => {
      const e = new THREE.Vector3(sx * tp[0], tp[1], -0.03 * i);
      const len = e.length();
      const f = add(w, new THREE.CylinderGeometry(0.006, 0.012, len, 4), bone);
      f.position.copy(e).multiplyScalar(0.5);
      f.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().normalize());
      add(w, new THREE.ConeGeometry(0.015, 0.04, 4), horn, e.x, e.y, e.z).quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().normalize());
    });
    // membrane panels
    const verts: number[] = [];
    const P = [base, ...tips.map((tp, i) => new THREE.Vector3(sx * tp[0], tp[1], -0.03 * i))];
    for (let i = 1; i < P.length - 1; i++) {
      verts.push(P[0].x, P[0].y, P[0].z, P[i].x, P[i].y, P[i].z, P[i + 1].x, P[i + 1].y, P[i + 1].z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.computeVertexNormals();
    w.add(new THREE.Mesh(g, membrane));
  };
  wing(1);
  wing(-1);

  // egg shell, to the left (+X side ... place at +x)
  const egg = new THREE.Group();
  egg.position.set(0.38, 0, -0.1);
  root.add(egg);
  add(egg, new THREE.CylinderGeometry(0.26, 0.28, 0.02, 10), nest, 0, 0.01, 0);
  // lower shell: sphere bottom portion
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6), shell);
  lower.scale.set(1, 1.3, 1);
  lower.position.y = 0.19;
  (shell as any).side = THREE.DoubleSide;
  egg.add(lower);
  // jagged rim
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const h = 0.04 + (i % 3) * 0.03;
    const r = 0.14 * Math.sin(Math.PI * 0.4) + 0.0;
    const c = add(egg, new THREE.ConeGeometry(0.035, h, 3), shell, Math.cos(a) * (r + 0.005), 0.19 + 0.14 * 1.3 * Math.cos(Math.PI * 0.4) + h / 2 - 0.02, Math.sin(a) * (r + 0.005));
    c.rotation.y = -a;
  }
  add(egg, sph(0.11, 8, 5), inner, 0, 0.2, 0, 1, 0.5, 1);
  // loose shell shards
  for (let i = 0; i < 4; i++) {
    const a = 1 + i * 1.6;
    const sh = add(egg, new THREE.ConeGeometry(0.06, 0.012, 3), shell, Math.cos(a) * 0.25, 0.03, Math.sin(a) * 0.25);
    sh.rotation.set(0.2, a * 2, 0.3);
    sh.scale.set(1, 1, 1);
  }
  // speckles
  for (let i = 0; i < 30; i++) {
    const a = rnd() * Math.PI * 2, ph = 0.4 + rnd() * 0.55;
    const R = 0.142;
    const x = Math.cos(a) * Math.sin(Math.PI * ph) * R, z = Math.sin(a) * Math.sin(Math.PI * ph) * R, y = 0.19 - Math.cos(Math.PI * ph) * R * 1.3;
    if (y > 0.19 + 0.14 * 1.3 * Math.cos(Math.PI * 0.4)) continue;
    const sp = add(egg, sph(0.012 + rnd() * 0.01, 4, 3), speck, x, y, z, 1, 1, 0.5);
    sp.lookAt(egg.position.x + x * 2, y, egg.position.z + z * 2);
  }

  root.scale.setScalar(1);
  return root;
}
