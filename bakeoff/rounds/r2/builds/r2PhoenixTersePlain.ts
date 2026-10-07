import * as THREE from "three";

export const meta = {
  name: "Phoenix",
  description: "Stylized low-poly phoenix with layered flame wings, long tail plumes, crest and a glowing ember perch.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (hex: number, emi = 0, rough = 0.7) => {
    const k = hex + "_" + emi;
    if (!mats[k]) {
      mats[k] = new THREE.MeshStandardMaterial({
        color: hex,
        roughness: rough,
        flatShading: true,
        emissive: emi ? hex : 0x000000,
        emissiveIntensity: emi,
      });
    }
    return mats[k];
  };

  const red = mat(0xc4161c, 0.25);
  const crimson = mat(0x8e0f1a, 0.2);
  const orange = mat(0xff6a00, 0.5);
  const amber = mat(0xffa51f, 0.6);
  const yellow = mat(0xffe04a, 0.8);
  const gold = mat(0xf2b81c, 0.3, 0.4);
  const dark = mat(0x2a1210);
  const rock = mat(0x3b3436);
  const eye = mat(0xffffff, 0.3);

  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: [number, number, number],
    r: [number, number, number] = [0, 0, 0],
    sc: [number, number, number] = [1, 1, 1]
  ) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(...p);
    me.rotation.set(...r);
    me.scale.set(...sc);
    parent.add(me);
    return me;
  };

  // Perch: rock with ember glow
  const perch = new THREE.Group();
  root.add(perch);
  add(perch, new THREE.CylinderGeometry(0.35, 0.5, 0.35, 7), rock, [0, 0.17, 0]);
  add(perch, new THREE.DodecahedronGeometry(0.28, 0), rock, [0.15, 0.4, 0.05], [0.3, 0.5, 0]);
  add(perch, new THREE.ConeGeometry(0.2, 0.3, 5), rock, [-0.2, 0.45, -0.1]);
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2;
    add(perch, new THREE.OctahedronGeometry(0.05 + rnd() * 0.04, 0), i % 2 ? orange : yellow, [Math.cos(a) * 0.2, 0.52 + rnd() * 0.05, Math.sin(a) * 0.2]);
  }

  const bird = new THREE.Group();
  bird.position.y = 0.55;
  root.add(bird);

  // Body
  add(bird, new THREE.IcosahedronGeometry(0.4, 0), red, [0, 0.75, 0], [0.5, 0, 0], [0.85, 1.0, 1.4]);
  add(bird, new THREE.IcosahedronGeometry(0.3, 0), amber, [0, 0.68, 0.22], [0.5, 0, 0], [0.8, 1, 1.1]);
  // Chest feather scales
  for (let i = 0; i < 5; i++) {
    add(bird, new THREE.ConeGeometry(0.09, 0.2, 4), yellow, [0, 0.92 - i * 0.1, 0.42 - i * 0.02 + (i > 2 ? 0.05 : 0)], [Math.PI * 0.85, Math.PI / 4, 0]);
  }
  // Neck
  add(bird, new THREE.CylinderGeometry(0.15, 0.22, 0.4, 6), red, [0, 1.15, 0.38], [0.45, 0, 0]);
  // Head
  const head = new THREE.Group();
  head.position.set(0, 1.45, 0.52);
  bird.add(head);
  add(head, new THREE.IcosahedronGeometry(0.22, 0), red, [0, 0, 0], [0, 0, 0], [0.9, 0.95, 1.1]);
  add(head, new THREE.ConeGeometry(0.09, 0.3, 4), gold, [0, -0.04, 0.3], [Math.PI / 2 + 0.2, Math.PI / 4, 0]);
  add(head, new THREE.ConeGeometry(0.075, 0.2, 4), gold, [0, -0.1, 0.22], [Math.PI / 2 - 0.25, Math.PI / 4, 0]);
  for (const x of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.06, 6, 5), eye, [x * 0.14, 0.05, 0.12]);
    add(head, new THREE.SphereGeometry(0.03, 5, 4), dark, [x * 0.18, 0.05, 0.15]);
    add(head, new THREE.BoxGeometry(0.1, 0.025, 0.05), dark, [x * 0.15, 0.13, 0.13], [0, 0, x * -0.4]);
  }
  // Crest
  const crestCols = [yellow, amber, orange, amber, yellow];
  for (let i = 0; i < 5; i++) {
    const L = 0.35 + (i === 2 ? 0.2 : 0) - Math.abs(i - 2) * 0.03;
    add(head, new THREE.ConeGeometry(0.05, L, 4), crestCols[i], [0, 0.22 + i * 0.02 - Math.abs(i - 2) * 0.03, -0.05 - i * 0.07], [-0.9 - i * 0.18, 0, 0]);
  }

  // Legs
  for (const x of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(x * 0.2, 0.5, 0.05);
    bird.add(leg);
    add(leg, new THREE.CylinderGeometry(0.07, 0.05, 0.35, 5), gold, [0, 0, 0]);
    add(leg, new THREE.CylinderGeometry(0.05, 0.04, 0.3, 5), gold, [0, -0.28, 0.02]);
    for (const a of [-0.35, 0, 0.35]) {
      add(leg, new THREE.ConeGeometry(0.03, 0.25, 4), gold, [Math.sin(a) * 0.12, -0.45, Math.cos(a) * 0.12], [Math.PI / 2, 0, -a]);
    }
    add(leg, new THREE.ConeGeometry(0.03, 0.18, 4), gold, [0, -0.45, -0.1], [-Math.PI / 2, 0, 0]);
  }

  // Wings: layered feather rows
  const featherGeo = new THREE.ConeGeometry(0.1, 1, 4);
  const wingCols = [crimson, red, orange, amber, yellow];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(side * 0.3, 1.05, 0.0);
    bird.add(wing);
    // arm bones
    add(wing, new THREE.BoxGeometry(1.1, 0.14, 0.2), crimson, [side * 0.55, 0.12, 0], [0, 0, side * 0.2]);
    add(wing, new THREE.BoxGeometry(1.0, 0.11, 0.17), red, [side * 1.55, 0.3, -0.02], [0, 0, side * 0.1]);
    for (let row = 0; row < 5; row++) {
      const n = 9 - row;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const len = (1.3 - row * 0.17) * (0.7 + 0.5 * Math.sin(t * Math.PI * 0.9 + 0.2)) ;
        const f = new THREE.Group();
        const bx = side * (0.2 + t * 2.0 + row * 0.02);
        f.position.set(bx, 0.2 + t * 0.18 - row * 0.07, -0.08 - row * 0.05);
        const ang = -0.35 - t * 0.5 + (row * 0.05);
        f.rotation.set(0, side * 0.1, 0);
        const m = add(f, featherGeo, wingCols[(row + (i % 2)) % 5], [0, 0, 0], [Math.PI / 2 + ang * 0 , 0, 0], [1 + (1 - t) * 0.3, len, 0.18]);
        // orient feather: point backward and down
        m.rotation.set(Math.PI / 2 + 0.5 + t * 0.2, 0, 0);
        m.position.set(0, -Math.sin(m.rotation.x - Math.PI / 2) * len * 0.5 * 0.2 - len * 0.18, -len * 0.4);
        f.rotation.y = side * (0.05 + t * 0.2);
        wing.add(f);
      }
    }
    // tip primary flames
    for (let i = 0; i < 4; i++) {
      add(wing, new THREE.ConeGeometry(0.09, 0.9 - i * 0.1, 4), i % 2 ? yellow : orange, [side * (2.0 + i * 0.12), 0.35 - i * 0.08, -0.35 - i * 0.12], [Math.PI / 2 + 0.3, 0, side * (-0.2 - i * 0.1)]);
    }
    wing.rotation.z = side * 0.25;
  }

  // Tail plumes
  const plumeCols = [orange, red, amber, crimson, yellow];
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const g = new THREE.Group();
    g.position.set(0, 0.62, -0.55);
    g.rotation.set(0.15 + Math.abs(k) * 0.03, Math.PI + k * 0.2, 0);
    bird.add(g);
    const L = 1.8 - Math.abs(k) * 0.2;
    const segs = 5;
    for (let j = 0; j < segs; j++) {
      const w = 0.12 * (1 - j / segs * 0.4) + (j === segs - 1 ? 0.03 : 0);
      const seg = add(g, new THREE.OctahedronGeometry(w, 0), plumeCols[(i + j) % 5], [0, -j * 0.07 - Math.sin(j * 0.6) * 0.05, -(j * L) / segs], [0, 0, 0], [1.1, 0.5, (L / segs) * 4.2]);
      void seg;
    }
    add(g, new THREE.ConeGeometry(0.07, 0.4, 4), yellow, [0, -0.38, -L - 0.1], [-Math.PI / 2 - 0.2, 0, 0]);
  }

  // Flame wisps floating
  for (let i = 0; i < 10; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.8 + rnd() * 1.6;
    add(bird, new THREE.TetrahedronGeometry(0.05 + rnd() * 0.05, 0), rnd() > 0.5 ? yellow : orange, [Math.cos(a) * r, 0.2 + rnd() * 1.6, Math.sin(a) * r - 0.6], [rnd() * 3, rnd() * 3, 0]);
  }

  return root;
}
