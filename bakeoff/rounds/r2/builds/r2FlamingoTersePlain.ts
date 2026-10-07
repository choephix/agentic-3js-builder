import * as THREE from "three";

export const meta = { name: "Flamingo", description: "Stylized low-poly flamingo standing on one leg, built from primitives." };

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

  const mk = (c: number, rough = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });

  // feather texture
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f4799a"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) {
    const l = 60 + rnd() * 30;
    g.fillStyle = `hsl(345,${70 + rnd() * 25}%,${l}%)`;
    g.beginPath();
    g.ellipse(rnd() * 128, rnd() * 128, 3 + rnd() * 4, 7 + rnd() * 5, 0, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;

  const body = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: 0.9, flatShading: true });
  const pink = mk(0xf06a8f);
  const light = mk(0xf9a1b8);
  const leg = mk(0xe0527a, 0.6);
  const beakPink = mk(0xf7c3cc);
  const black = mk(0x1a1a1a, 0.5);
  const white = mk(0xffffff, 0.4);
  const yellow = mk(0xffe27a, 0.4);

  const root = new THREE.Group();

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, p: number[], r: number[] = [0, 0, 0], sc: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(p[0], p[1], p[2]);
    me.rotation.set(r[0], r[1], r[2]);
    me.scale.set(sc[0], sc[1], sc[2]);
    parent.add(me);
    return me;
  };
  // limb between two points
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, m: THREE.Material, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 6), m);
    me.position.copy(a.clone().add(b).multiplyScalar(0.5));
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(me);
    return me;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // body
  add(new THREE.IcosahedronGeometry(0.2, 1), body, [0, 0.72, 0], [0, 0, 0], [0.85, 0.9, 1.45]);
  // tail
  add(new THREE.ConeGeometry(0.1, 0.35, 5), pink, [0, 0.7, -0.4], [-Math.PI / 2 - 0.25, 0, 0], [1.1, 1, 0.4]);
  // chest
  add(new THREE.IcosahedronGeometry(0.14, 1), light, [0, 0.78, 0.2], [0, 0, 0], [1, 1, 1]);

  // wings folded
  for (const sx of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(sx * 0.17, 0.8, 0.02);
    w.rotation.set(0.12, 0, sx * -0.08);
    root.add(w);
    add(new THREE.SphereGeometry(0.2, 6, 5), pink, [0, -0.04, -0.12], [0, 0, 0], [0.3, 0.7, 1.6], w);
    add(new THREE.ConeGeometry(0.08, 0.3, 5), black, [sx * 0.005, -0.05, -0.4], [-Math.PI / 2 - 0.1, 0, 0], [1, 1, 0.3], w);
    add(new THREE.SphereGeometry(0.1, 5, 4), light, [0, 0.04, 0.08], [0, 0, 0], [0.35, 0.6, 1.2], w);
  }

  // neck: S-curve
  const pts = [
    V(0, 0.85, 0.28), V(0, 1.0, 0.38), V(0, 1.2, 0.34), V(0, 1.4, 0.24), V(0, 1.55, 0.26), V(0, 1.68, 0.38),
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / (pts.length - 1);
    limb(pts[i], pts[i + 1], 0.06 - t * 0.02, 0.055 - t * 0.02, i % 2 ? pink : light);
    add(new THREE.SphereGeometry(0.052 - t * 0.02, 6, 5), pink, [pts[i + 1].x, pts[i + 1].y, pts[i + 1].z]);
  }
  // head
  const head = new THREE.Group();
  head.position.set(0, 1.7, 0.42);
  root.add(head);
  add(new THREE.SphereGeometry(0.06, 7, 6), pink, [0, 0, 0], [0, 0, 0], [1, 1, 1.15], head);
  // beak
  add(new THREE.ConeGeometry(0.045, 0.16, 5), beakPink, [0, -0.01, 0.12], [Math.PI / 2 + 0.05, 0, 0], [1, 1, 0.7], head);
  add(new THREE.ConeGeometry(0.048, 0.15, 5), black, [0, -0.05, 0.2], [Math.PI / 2 + 0.55, 0, 0], [1, 1, 0.6], head);
  add(new THREE.ConeGeometry(0.04, 0.12, 5), beakPink, [0, -0.045, 0.1], [Math.PI / 2 - 0.2, 0, 0], [1, 1, 0.6], head);
  // eyes
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.02, 6, 5), yellow, [sx * 0.045, 0.015, 0.03], [0, 0, 0], [1, 1, 1], head);
    add(new THREE.SphereGeometry(0.01, 5, 4), black, [sx * 0.058, 0.016, 0.035], [0, 0, 0], [1, 1, 1], head);
  }

  // standing leg (left, +X) straight
  const hip = V(0.07, 0.6, 0.0);
  const knee = V(0.07, 0.32, 0.03);
  const ankle = V(0.07, 0.02, -0.02);
  limb(hip, knee, 0.022, 0.018, leg);
  add(new THREE.SphereGeometry(0.03, 6, 5), leg, [knee.x, knee.y, knee.z]);
  limb(knee, V(0.07, 0.04, -0.03), 0.014, 0.016, leg);
  // foot
  for (const a of [-0.35, 0, 0.35]) {
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.012, 0.15), leg);
    toe.position.set(0.07 + Math.sin(a) * 0.07, 0.007, -0.03 + Math.cos(a) * 0.07);
    toe.rotation.y = a;
    root.add(toe);
  }
  add(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 6), leg, [0.07, 0.005, 0.0]);
  void ankle;

  // raised leg (right, -X): thigh forward, shin folded back
  const hip2 = V(-0.07, 0.6, 0.0);
  const knee2 = V(-0.07, 0.5, 0.2);
  const foot2 = V(-0.07, 0.3, 0.08);
  limb(hip2, knee2, 0.022, 0.02, leg);
  add(new THREE.SphereGeometry(0.03, 6, 5), leg, [knee2.x, knee2.y, knee2.z]);
  limb(knee2, foot2, 0.016, 0.014, leg);
  for (const a of [-0.3, 0, 0.3]) {
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.1), leg);
    toe.position.set(-0.07 + Math.sin(a) * 0.04, 0.29, 0.08 + Math.cos(a) * 0.04);
    toe.rotation.set(0.3, a, 0);
    root.add(toe);
  }

  // feather tufts on back
  for (let i = 0; i < 6; i++) {
    add(new THREE.ConeGeometry(0.04, 0.14, 4), i % 2 ? pink : light, [(rnd() - 0.5) * 0.12, 0.88 + rnd() * 0.04, -0.15 - i * 0.04], [-1.9, 0, (rnd() - 0.5) * 0.4]);
  }

  void white;
  return root;
}
