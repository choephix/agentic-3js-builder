```ts
import * as THREE from "three";

export const meta = {
  name: "Antique Gramophone",
  description:
    "Walnut cabinet with pale floral inlay, claw feet, a verdigris-patinated morning-glory brass horn, a record on the turntable, a silver tonearm and a side crank.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "gramophone";

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (c: string, rough = 0.7, metal = 0.05) => {
    const k = c + rough + metal;
    let m = mats.get(k);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, flatShading: true });
      mats.set(k, m);
    }
    return m;
  };

  const add = (
    parent: THREE.Object3D,
    g: THREE.BufferGeometry,
    m: THREE.Material,
    x = 0, y = 0, z = 0
  ) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  const rodBetween = (
    parent: THREE.Object3D,
    a: THREE.Vector3, b: THREE.Vector3,
    r: number, m: THREE.Material, seg = 8
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), m);
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(mesh);
    return mesh;
  };

  const walnut = mat("#5a3419", 0.6, 0.05);
  const walnutDark = mat("#3f2210", 0.6, 0.05);
  const walnutLight = mat("#74461f", 0.5, 0.05);
  const inlay = mat("#ead9ae", 0.5, 0.02);
  const inlay2 = mat("#c9b27c", 0.5, 0.02);
  const leafMat = mat("#b9c79a", 0.5, 0.02);
  const brass = mat("#b8892f", 0.35, 0.7);
  const patina = mat("#6a9a78", 0.6, 0.3);
  const silver = mat("#cfd3d6", 0.25, 0.85);
  const steel = mat("#6c7075", 0.4, 0.7);

  // ---------- cabinet ----------
  const W = 0.46, D = 0.44;
  // plinth
  add(root, new THREE.BoxGeometry(W + 0.04, 0.025, D + 0.04), walnutDark, 0, 0.0625, 0);
  // body
  add(root, new THREE.BoxGeometry(W, 0.225, D), walnut, 0, 0.1875, 0);
  // mid moulding
  add(root, new THREE.BoxGeometry(W + 0.015, 0.012, D + 0.015), walnutLight, 0, 0.286, 0);
  // lid
  add(root, new THREE.BoxGeometry(W + 0.03, 0.022, D + 0.03), walnutLight, 0, 0.309, 0);
  // corner columns
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(root, new THREE.CylinderGeometry(0.016, 0.016, 0.225, 6), walnutDark, sx * (W / 2), 0.1875, sz * (D / 2));
    add(root, new THREE.SphereGeometry(0.02, 6, 4), brass, sx * (W / 2), 0.3, sz * (D / 2));
  }

  // ---------- inlay ----------
  const flower = (px: number, py: number, pz: number, rotY: number, s: number) => {
    const g = new THREE.Group();
    g.position.set(px, py, pz);
    g.rotation.y = rotY;
    g.scale.setScalar(s);
    const petalGeo = new THREE.SphereGeometry(0.02, 6, 4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = add(g, petalGeo, i % 2 ? inlay : inlay2, Math.cos(a) * 0.028, Math.sin(a) * 0.028, 0);
      p.scale.set(1, 1, 0.12);
      p.rotation.z = a;
    }
    add(g, new THREE.SphereGeometry(0.012, 6, 4), mat("#8a5a2a"), 0, 0, 0.002).scale.set(1, 1, 0.3);
    // leaves & stems
    for (const sx of [-1, 1]) {
      const l = add(g, new THREE.SphereGeometry(0.02, 5, 4), leafMat, sx * 0.05, -0.06, 0);
      l.scale.set(1.5, 0.5, 0.12);
      l.rotation.z = sx * 0.6;
      const l2 = add(g, new THREE.SphereGeometry(0.016, 5, 4), leafMat, sx * 0.075, -0.035, 0);
      l2.scale.set(1.4, 0.45, 0.12);
      l2.rotation.z = sx * -0.5;
    }
    add(g, new THREE.BoxGeometry(0.008, 0.06, 0.004), leafMat, 0, -0.065, 0);
    return g;
  };
  const panel = (rotY: number, nx: number, nz: number, w: number) => {
    const off = rotY === 0 ? D / 2 : W / 2;
    const g = new THREE.Group();
    g.rotation.y = rotY;
    root.add(g);
    // recessed panel + border
    add(g, new THREE.BoxGeometry(w, 0.15, 0.006), walnutDark, 0, 0.19, off + 0.001);
    const bw = 0.004;
    add(g, new THREE.BoxGeometry(w - 0.03, bw, 0.004), inlay2, 0, 0.19 + 0.065, off + 0.004);
    add(g, new THREE.BoxGeometry(w - 0.03, bw, 0.004), inlay2, 0, 0.19 - 0.065, off + 0.004);
    add(g, new THREE.BoxGeometry(bw, 0.13, 0.004), inlay2, -(w / 2 - 0.015), 0.19, off + 0.004);
    add(g, new THREE.BoxGeometry(bw, 0.13, 0.004), inlay2, (w / 2 - 0.015), 0.19, off + 0.004);
    // corner diamonds
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const d = add(g, new THREE.BoxGeometry(0.014, 0.014, 0.004), inlay, sx * (w / 2 - 0.015), 0.19 + sy * 0.065, off + 0.005);
      d.rotation.z = Math.PI / 4;
    }
    const f = flower(0, 0.205, off + 0.006, 0, 1);
    g.add(f);
    // side blossoms
    for (const sx of [-1, 1]) {
      const sf = flower(sx * (w / 2 - 0.07), 0.19, off + 0.006, 0, 0.5);
      g.add(sf);
    }
  };
  panel(0, 0, 1, 0.38);
  panel(Math.PI / 2, 1, 0, 0.36);
  panel(-Math.PI / 2, -1, 0, 0.36);
  panel(Math.PI, 0, -1, 0.38);

  // ---------- claw feet ----------
  const up = new THREE.Vector3(0, 1, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const cx = sx * 0.2, cz = sz * 0.19;
    add(root, new THREE.CylinderGeometry(0.02, 0.026, 0.03, 6), walnutDark, cx, 0.045, cz);
    add(root, new THREE.SphereGeometry(0.03, 7, 5), brass, cx, 0.03, cz);
    const base = Math.atan2(sz, sx);
    for (const da of [-0.75, 0, 0.75]) {
      const a = base + da;
      const dir = new THREE.Vector3(Math.cos(a) * 0.8, -0.6, Math.sin(a) * 0.8).normalize();
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.0095, 0.035, 5), brass);
      claw.position.set(cx, 0.03, cz).addScaledVector(dir, 0.03);
      claw.quaternion.setFromUnitVectors(up, dir);
      root.add(claw);
    }
  }

  // ---------- turntable ----------
  const topY = 0.32;
  const tx = 0, tz = 0.06;
  add(root, new THREE.CylinderGeometry(0.155, 0.155, 0.012, 20), steel, tx, topY + 0.006, tz);
  add(root, new THREE.CylinderGeometry(0.14, 0.14, 0.006, 24), mat("#0c0c0d", 0.35, 0.1), tx, topY + 0.015, tz);
  for (let i = 0; i < 5; i++) {
    const r0 = 0.06 + i * 0.015;
    const ring = add(root, new THREE.RingGeometry(r0, r0 + 0.006, 24), mat("#1f1f22", 0.3, 0.1), tx, topY + 0.0185, tz);
    ring.rotation.x = -Math.PI / 2;
  }
  add(root, new THREE.CylinderGeometry(0.046, 0.046, 0.005, 20), mat("#b3202a", 0.6), tx, topY + 0.0185, tz);
  const gr = add(root, new THREE.RingGeometry(0.03, 0.034, 20), mat("#e8c36a", 0.4, 0.4), tx, topY + 0.0215, tz);
  gr.rotation.x = -Math.PI / 2;
  add(root, new THREE.CylinderGeometry(0.004, 0.004, 0.02, 6), brass, tx, topY + 0.03, tz);

  // ---------- tonearm ----------
  const pivot = new THREE.Vector3(0.19, topY, -0.07);
  add(root, new THREE.CylinderGeometry(0.026, 0.032, 0.03, 8), brass, pivot.x, topY + 0.015, pivot.z);
  add(root, new THREE.SphereGeometry(0.02, 7, 5), silver, pivot.x, topY + 0.04, pivot.z);
  const armStart = new THREE.Vector3(pivot.x, topY + 0.045, pivot.z);
  const elbow = new THREE.Vector3(0.17, topY + 0.05, 0.06);
  const head = new THREE.Vector3(0.075, topY + 0.032, 0.115);
  rodBetween(root, armStart, elbow, 0.006, silver, 6);
  add(root, new THREE.SphereGeometry(0.008, 6, 4), silver, elbow.x, elbow.y, elbow.z);
  rodBetween(root, elbow, head, 0.005, silver, 6);
  const shell = add(root, new THREE.BoxGeometry(0.03, 0.012, 0.022), silver, head.x - 0.004, head.y, head.z + 0.004);
  shell.rotation.y = 0.8;
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.003, 0.014, 5), steel);
  needle.position.set(head.x - 0.008, head.y - 0.012, head.z + 0.009);
  needle.rotation.x = Math.PI;
  root.add(needle);
  // counterweight
  const cw = add(root, new THREE.CylinderGeometry(0.014, 0.014, 0.025, 8), silver, pivot.x + 0.012, topY + 0.045, pivot.z - 0.03);
  cw.rotation.x = Math.PI / 2;
  rodBetween(root, armStart, new THREE.Vector3(pivot.x + 0.012, topY + 0.045, pivot.z - 0.03), 0.004, silver, 6);

  // ---------- horn ----------
  const hornBase = new THREE.Vector3(0, 0.4, -0.17);
  add(root, new THREE.CylinderGeometry(0.04, 0.055, 0.04, 8), brass, 0, topY + 0.02, hornBase.z);
  add(root, new THREE.CylinderGeometry(0.03, 0.04, 0.05, 8), brass, 0, topY + 0.065, hornBase.z);
  add(root, new THREE.SphereGeometry(0.045, 8, 6), brass, hornBase.x, hornBase.y, hornBase.z);
  const collar = add(root, new THREE.TorusGeometry(0.038, 0.008, 5, 10), patina, 0, topY + 0.043, hornBase.z);
  collar.rotation.x = Math.PI / 2;

  const horn = new THREE.Group();
  horn.position.copy(hornBase);
  horn.rotation.x = 0.88;
  root.add(horn);

  const L = 0.72, R0 = 0.028, R1 = 0.3;
  const rf = (t: number) => R0 + R1 * Math.pow(t, 2.7) + 0.02 * Math.pow(t, 12);
  const pts: THREE.Vector2[] = [];
  const steps = 24;
  for (let j = 0; j <= steps; j++) {
    const t = j / steps;
    pts.push(new THREE.Vector2(rf(t), t * L));
  }
  const hg = new THREE.LatheGeometry(pts, 16);
  const pos = hg.getAttribute("position");
  const cols = new Float32Array(pos.count * 3);
  const cb = new THREE.Color("#c0903a"), cg = new THREE.Color("#6a9a78"), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / L;
    const ang = Math.atan2(pos.getZ(i), pos.getX(i));
    const n = 0.5 + 0.5 * Math.sin(ang * 5 + t * 11) * Math.cos(t * 17 - ang * 2);
    const k = Math.min(1, Math.max(0, (t - 0.25) * 0.9 + n * 0.35 - 0.15));
    tmp.copy(cb).lerp(cg, k);
    cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
  }
  hg.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const hornMat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide, flatShading: true,
  });
  add(horn, hg, hornMat);

  // rim and bands
  const rim = add(horn, new THREE.TorusGeometry(rf(1), 0.014, 5, 24), patina, 0, L, 0);
  rim.rotation.x = Math.PI / 2;
  const rim2 = add(horn, new THREE.TorusGeometry(rf(1) - 0.012, 0.007, 4, 24), brass, 0, L - 0.01, 0);
  rim2.rotation.x = Math.PI / 2;
  for (const t of [0.12, 0.3, 0.5, 0.7, 0.88]) {
    const band = add(horn, new THREE.TorusGeometry(rf(t) + 0.003, t < 0.4 ? 0.007 : 0.006, 4, 16), t > 0.6 ? patina : brass, 0, t * L, 0);
    band.rotation.x = Math.PI / 2;
  }
  // petal-like flutes at the bell lip
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const f = add(horn, new THREE.SphereGeometry(0.02, 5, 4), brass, Math.cos(a) * (rf(1) + 0.003), L - 0.02, Math.sin(a) * (rf(1) + 0.003));
    f.scale.set(0.5, 1.4, 0.5);
  }

  // support stay from lid to horn underside
  const stayA = new THREE.Vector3(0, topY + 0.02, 0.1);
  const stayB = new THREE.Vector3(0, 0.62, 0.22);
  rodBetween(root, stayA, stayB, 0.007, brass, 6);
  add(root, new THREE.SphereGeometry(0.014, 6, 4), patina, stayA.x, stayA.y, stayA.z);

  // ---------- crank on the +X side ----------
  const cy = 0.19, cz = -0.02, sideX = W / 2;
  const plate = add(root, new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12), brass, sideX + 0.004, cy, cz);
  plate.rotation.z = Math.PI / 2;
  const plate2 = add(root, new THREE.TorusGeometry(0.03, 0.004, 4, 12), patina, sideX + 0.009, cy, cz);
  plate2.rotation.y = Math.PI / 2;
  const axle = add(root, new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8), steel, sideX + 0.035, cy, cz);
  axle.rotation.z = Math.PI / 2;
  const cx0 = sideX + 0.065;
  add(root, new THREE.SphereGeometry(0.014, 6, 4), steel, cx0, cy, cz);
  rodBetween(root, new THREE.Vector3(cx0, cy, cz), new THREE.Vector3(cx0, cy - 0.07, cz + 0.045), 0.007, steel, 6);
  const handle = add(root, new THREE.CylinderGeometry(0.011, 0.011, 0.055, 8), walnutDark, cx0 + 0.02, cy - 0.07, cz + 0.045);
  handle.rotation.z = Math.PI / 2;
  add(root, new THREE.SphereGeometry(0.014, 6, 4), brass, cx0 + 0.052, cy - 0.07, cz + 0.045);

  // speed knob and brake lever on lid
  add(root, new THREE.CylinderGeometry(0.012, 0.014, 0.014, 8), brass, -0.18, topY + 0.018, 0.17);
  add(root, new THREE.SphereGeometry(0.008, 5, 4), patina, -0.18, topY + 0.03, 0.17);

  // ---------- sit on floor ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  return root;
}
```