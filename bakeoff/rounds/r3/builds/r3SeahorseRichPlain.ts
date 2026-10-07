import * as THREE from "three";

export const meta = {
  name: "Lined Seahorse on Seagrass",
  description: "A sunny yellow lined seahorse gripping a seagrass strand with its curled tail, with crown spikes, tube snout, dorsal fin and big eyes.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const mat = (c: number, r = 0.7, extra: any = {}) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true, ...extra });
  const yellow = mat(0xffc81e);
  const yellow2 = mat(0xffdf4a);
  const dark = mat(0x4a2c0e);
  const white = mat(0xfffff0);
  const black = mat(0x111111, 0.3);
  const orange = mat(0xff9a1e);
  const fin = mat(0xffe9a0, 0.5, { transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const grassA = mat(0x2f9e4a);
  const grassB = mat(0x46b85a);

  const root = new THREE.Group();
  const sea = new THREE.Group();
  root.add(sea);

  // Seagrass strand: curved blades
  const grassBlade = (x: number, z: number, h: number, m: THREE.Material, ph: number) => {
    const g = new THREE.Group();
    const n = 10;
    for (let i = 0; i < n; i++) {
      const w = 0.045 * (1 - i / n * 0.6);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, h / n + 0.01, 0.012), m);
      const t = i / n;
      seg.position.set(x + Math.sin(t * 3 + ph) * 0.05 * t, (i + 0.5) * h / n, z + Math.cos(t * 2 + ph) * 0.03 * t);
      seg.rotation.z = -Math.cos(t * 3 + ph) * 0.15;
      g.add(seg);
    }
    return g;
  };
  // main strand the seahorse grips (at x=0, z=-0.02 area)
  const strandX = 0, strandZ = 0.0;
  const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 1.0, 5), grassA);
  strand.position.set(strandX, 0.5, strandZ - 0.02);
  root.add(strand);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    root.add(grassBlade(Math.cos(a) * 0.08, Math.sin(a) * 0.08 - 0.02, 0.5 + rnd() * 0.5, i % 2 ? grassA : grassB, i));
  }
  // base mound
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.04, 8), mat(0xd9c28a));
  base.position.y = 0.0;
  root.add(base);
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03 + rnd() * 0.03), mat(0x9a9a98));
    p.position.set((rnd() - 0.5) * 0.3, 0.02, (rnd() - 0.5) * 0.3);
    root.add(p);
  }

  // Seahorse body: chain of segments along a spine curve
  // spine points (y, z): head top down to tail
  const spine: THREE.Vector3[] = [];
  // neck/head region, belly, tail curl
  const pts = [
    [0.86, 0.17], [0.80, 0.14], [0.74, 0.115], [0.67, 0.10], [0.60, 0.10],
    [0.53, 0.115], [0.46, 0.115], [0.40, 0.09], [0.35, 0.055], [0.31, 0.02],
  ];
  pts.forEach(p => spine.push(new THREE.Vector3(0, p[0], p[1])));
  const radii = [0.05, 0.052, 0.055, 0.075, 0.095, 0.1, 0.085, 0.065, 0.05, 0.04];
  const body = new THREE.Group();
  sea.add(body);
  for (let i = 0; i < spine.length; i++) {
    const r = radii[i];
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? yellow : yellow2);
    m.scale.set(0.9, 0.75, 1);
    m.position.copy(spine[i]);
    body.add(m);
    // dark ring line
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.92, 0.005, 4, 12), dark);
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(0.9, 1, 1);
    ring.position.copy(spine[i]).add(new THREE.Vector3(0, -0.035, 0));
    if (i > 2) body.add(ring);
    // ridge spike on back
    if (i > 1) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.04, 4), orange);
      sp.rotation.x = -Math.PI / 2;
      sp.position.copy(spine[i]).add(new THREE.Vector3(0, 0, -r - 0.012));
      if (i < 8) body.add(sp);
    }
    // side ridge spikes
    for (const sx of [-1, 1]) {
      if (i > 2 && i < 9) {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.03, 4), orange);
        sp.rotation.z = -sx * Math.PI / 2;
        sp.position.copy(spine[i]).add(new THREE.Vector3(sx * r * 0.95, 0, 0));
        body.add(sp);
      }
    }
    // freckles
    for (const sx of [-1, 1]) {
      if (i > 2 && rnd() < 0.8) {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.007, 5, 4), white);
        f.position.copy(spine[i]).add(new THREE.Vector3(sx * r * 0.8, 0.012 + rnd() * 0.02, r * 0.45));
        body.add(f);
      }
    }
  }
  // pot belly bulge
  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), yellow2);
  belly.scale.set(0.85, 1.1, 0.9);
  belly.position.set(0, 0.55, 0.15);
  body.add(belly);
  // belly stripes
  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.083 - Math.abs(i - 2) * 0.012, 0.004, 4, 12, Math.PI), dark);
    t.scale.set(0.85, 1, 0.9);
    t.position.set(0, 0.5 + i * 0.027, 0.15);
    t.rotation.set(Math.PI / 2, 0, Math.PI / 2 * 0);
    t.rotation.x = Math.PI / 2;
    t.rotation.z = 0;
    // semi-ring facing front
    t.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    body.add(t);
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.88, 0.2);
  head.rotation.x = 0.35;
  sea.add(head);
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), yellow);
  skull.scale.set(0.85, 1, 1.1);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.17, 6), yellow2);
  snout.rotation.x = Math.PI / 2 - 0.1;
  snout.position.set(0, -0.025, 0.15);
  head.add(snout);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.02, 6), orange);
  tip.rotation.x = Math.PI / 2 - 0.1;
  tip.position.set(0, -0.032, 0.237);
  head.add(tip);
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.TorusGeometry(0.023, 0.004, 4, 8), dark);
    l.position.set(0, -0.022 - i * 0.003, 0.1 + i * 0.045);
    l.rotation.y = 0;
    l.rotation.x = 0;
    l.rotation.set(0, 0, 0);
    l.scale.set(1, 1, 1);
    l.rotation.x = 0;
    head.add(l);
  }
  // eyes
  for (const sx of [-1, 1]) {
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), white);
    eyeW.position.set(sx * 0.06, 0.015, 0.045);
    head.add(eyeW);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), orange);
    iris.position.set(sx * 0.081, 0.017, 0.058);
    head.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), black);
    pupil.position.set(sx * 0.092, 0.018, 0.066);
    head.add(pupil);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.006, 5, 4), white);
    gl.position.set(sx * 0.098, 0.03, 0.076);
    head.add(gl);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), orange);
    cheek.position.set(sx * 0.07, -0.04, 0.05);
    head.add(cheek);
  }
  // crown (coronet)
  for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 2.2;
    const h = 0.06 - Math.abs(i - 3) * 0.008;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.014, h, 5), i % 2 ? orange : yellow2);
    c.position.set(Math.sin(a) * 0.05, 0.075 + 0.0 - Math.abs(a) * 0.01, -0.02 - Math.cos(a) * 0.0);
    c.rotation.z = -a * 0.6;
    head.add(c);
  }
  // head lines
  const hl = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.004, 4, 10), dark);
  hl.rotation.y = Math.PI / 2;
  hl.scale.set(1, 1, 1);
  hl.position.set(0, 0, -0.01);
  head.add(hl);

  // Dorsal fin on back
  const finG = new THREE.Group();
  finG.position.set(0, 0.55, 0.0);
  sea.add(finG);
  for (let i = 0; i < 9; i++) {
    const ray = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.012, 0.0), dark);
    void ray;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.075 - Math.abs(i - 4) * 0.004), fin);
    panel.position.set(0, i * 0.02 - 0.08, 0.0 + 0.02 * Math.sin(i * 0.9));
    panel.rotation.x = Math.sin(i * 0.9) * 0.2;
    panel.position.z = 0.0;
    finG.add(panel);
    const rr = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.08 - Math.abs(i - 4) * 0.004), dark);
    rr.position.copy(panel.position);
    rr.position.y += 0.009;
    rr.rotation.copy(panel.rotation);
    finG.add(rr);
  }
  finG.position.set(0, 0.55, 0.0);
  finG.position.z = 0.0;
  // fin sits behind body
  finG.position.z = 0.0;
  finG.children.forEach(c => (c.position.z -= 0.1 + 0.0));
  // pectoral fins
  for (const sx of [-1, 1]) {
    const pf = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 4), fin);
    pf.position.set(sx * 0.1, 0.72, 0.09);
    pf.rotation.z = sx * Math.PI / 2 + sx * 0.3;
    sea.add(pf);
  }

  // Curled tail: spiral wrapping around the strand
  // Tail goes from (y .31, z .02) spiraling around strand axis at z=-0.02
  const tailSegs = 26;
  const cx = 0, cz = -0.02;
  let prev = new THREE.Vector3(0, 0.31, 0.02);
  for (let i = 0; i < tailSegs; i++) {
    const t = i / (tailSegs - 1);
    const ang = Math.PI / 2 + t * Math.PI * 2.6; // start at front (+z)
    const rad = 0.035 + 0.0 - 0.0;
    const rr = 0.052 - t * 0.0;
    const x = cx + Math.cos(ang - Math.PI / 2) * rr * (t < 0.1 ? 1 : 1);
    const z = cz + Math.sin(ang) * rr;
    const y = 0.31 - t * 0.2 + Math.sin(t * 6) * 0.0;
    const p = new THREE.Vector3(x, y, z);
    const size = 0.034 * (1 - t * 0.75) + 0.006;
    const seg = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), i % 2 ? yellow : orange);
    seg.position.copy(p);
    seg.scale.set(1, 0.9, 1);
    sea.add(seg);
    if (i % 3 === 0 && t < 0.9) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(size * 0.9, 0.004, 4, 8), dark);
      r.rotation.x = Math.PI / 2;
      r.position.copy(p);
      sea.add(r);
    }
    prev = p;
  }
  void prev;
  // bridge segments between belly and tail start
  const br = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 1), yellow);
  br.position.set(0, 0.28, 0.0);
  sea.add(br);
  const br2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 1), orange);
  br2.position.set(0.0, 0.33, 0.045);
  sea.add(br2);

  // The seahorse hovers so strand passes behind the body; shift so strand at x=0
  sea.position.set(0, 0.0, 0.02);
  // floor tail tip within base
  root.position.y = 0;
  // scale to a display size ~ realistic-ish seahorse (stylized larger)
  return root;
}
