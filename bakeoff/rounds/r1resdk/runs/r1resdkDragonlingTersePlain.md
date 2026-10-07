```ts
import * as THREE from "three";

export const meta = {
  name: "Baby Dragon",
  description: "A chubby, low-poly baby dragon with horns, wings, spikes and a curled tail, built from primitives.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, rough = 0.7, flat = true) => {
    const k = c + "_" + rough;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: flat });
    return mats[k];
  };

  // belly texture
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#f2d98b";
  g.fillRect(0, 0, 64, 128);
  g.strokeStyle = "#d4b565";
  g.lineWidth = 3;
  for (let y = 6; y < 128; y += 12) {
    g.beginPath(); g.moveTo(4, y); g.quadraticCurveTo(32, y + 8, 60, y); g.stroke();
  }
  const bellyTex = new THREE.CanvasTexture(cv);
  bellyTex.colorSpace = THREE.SRGBColorSpace;
  const bellyMat = new THREE.MeshStandardMaterial({ map: bellyTex, roughness: 0.8, flatShading: true });

  const green = M(0x4fae5a), dark = M(0x2f7d46), cream = M(0xf2d98b), horn = M(0xf5ead0, 0.5);
  const orange = M(0xe8743b), white = M(0xffffff, 0.3), black = M(0x151515, 0.3), pink = M(0xe88a9a);

  const root = new THREE.Group();

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], sc: number[] = [1, 1, 1], r: number[] = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(sc[0], sc[1], sc[2]);
    m.rotation.set(r[0], r[1], r[2]);
    parent.add(m);
    return m;
  };
  const sph = (d = 1) => new THREE.IcosahedronGeometry(0.5, d);

  // body
  const body = new THREE.Group();
  body.position.set(0, 0.42, 0);
  root.add(body);
  add(body, sph(1), green, [0, 0, 0], [0.5, 0.52, 0.55], [0.3, 0, 0]);
  add(body, sph(1), bellyMat, [0, -0.03, 0.1], [0.38, 0.44, 0.42], [0.3, 0, 0]);

  // back spikes
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const sz = 0.09 - t * 0.02;
    add(body, new THREE.ConeGeometry(sz, sz * 2.2, 4), orange,
      [0, 0.28 - t * 0.12 + (i === 0 ? 0 : 0), -0.12 - t * 0.2], [1, 1, 1], [-0.6 - t * 0.5, 0, 0]);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.45, 0.28);
  body.add(head);
  add(head, sph(1), green, [0, 0.1, 0], [0.46, 0.4, 0.44]);
  add(head, new THREE.BoxGeometry(0.26, 0.17, 0.2), green, [0, 0.03, 0.22]);
  add(head, new THREE.BoxGeometry(0.22, 0.05, 0.16), cream, [0, -0.07, 0.22]);
  for (const x of [-1, 1]) {
    add(head, new THREE.BoxGeometry(0.035, 0.035, 0.03), dark, [x * 0.05, 0.06, 0.33]);
    // eyes
    add(head, sph(0), white, [x * 0.14, 0.17, 0.14], [0.14, 0.17, 0.12]);
    add(head, sph(0), black, [x * 0.14, 0.17, 0.2], [0.08, 0.1, 0.06]);
    add(head, sph(0), white, [x * 0.12, 0.2, 0.235], [0.03, 0.03, 0.02]);
    // cheeks
    add(head, sph(0), pink, [x * 0.2, 0.0, 0.14], [0.08, 0.06, 0.03]);
    // horns
    add(head, new THREE.ConeGeometry(0.05, 0.22, 5), horn, [x * 0.12, 0.34, -0.02], [1, 1, 1], [-0.4, 0, -x * 0.35]);
    // ear frills
    add(head, new THREE.ConeGeometry(0.07, 0.2, 3), orange, [x * 0.25, 0.14, -0.03], [1, 0.6, 1], [0, 0, -x * 1.3]);
  }
  // head crest
  for (let i = 0; i < 3; i++)
    add(head, new THREE.ConeGeometry(0.04, 0.1, 4), orange, [0, 0.3 - i * 0.04, -0.12 - i * 0.07], [1, 1, 1], [-0.9 - i * 0.2, 0, 0]);

  // arms
  for (const x of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(x * 0.24, 0.1, 0.22);
    arm.rotation.set(0.2, 0, -x * 0.5);
    body.add(arm);
    add(arm, new THREE.CylinderGeometry(0.06, 0.05, 0.2, 6), green, [0, -0.08, 0]);
    add(arm, sph(0), green, [0, -0.2, 0.02], [0.14, 0.12, 0.16]);
    for (const f of [-1, 0, 1])
      add(arm, new THREE.ConeGeometry(0.02, 0.06, 4), horn, [f * 0.045, -0.26, 0.07], [1, 1, 1], [Math.PI / 2 + 0.2, 0, 0]);
  }

  // legs
  for (const x of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(x * 0.22, -0.2, 0.0);
    body.add(leg);
    add(leg, sph(1), dark, [0, 0, -0.02], [0.28, 0.3, 0.34]);
    add(leg, new THREE.BoxGeometry(0.18, 0.08, 0.3), green, [0, -0.17, 0.07]);
    for (const f of [-1, 0, 1])
      add(leg, new THREE.ConeGeometry(0.035, 0.08, 4), horn, [f * 0.06, -0.17, 0.25], [1, 1, 1], [Math.PI / 2, 0, 0]);
  }

  // tail
  let px = 0, py = -0.1, pz = -0.25;
  const tail = new THREE.Group();
  body.add(tail);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const r = 0.17 * (1 - t) + 0.03;
    const ang = 0.35 + i * 0.05;
    const yaw = 0.18 * i;
    px += Math.sin(yaw) * 0.14;
    pz -= Math.cos(yaw) * 0.14;
    py += i < 3 ? -0.03 : 0.0;
    add(tail, sph(0), i % 2 ? dark : green, [px, py, pz], [r * 2, r * 1.8, r * 2.3], [ang * 0, yaw, 0]);
    if (i > 0 && i < n - 1)
      add(tail, new THREE.ConeGeometry(r * 0.5, r * 1.2, 4), orange, [px, py + r * 0.95, pz]);
  }
  // tail tip spade
  add(tail, new THREE.ConeGeometry(0.1, 0.2, 4), orange, [px + 0.05, py, pz - 0.14], [1, 0.4, 1], [-Math.PI / 2, 0, -0.3 ]);

  // wings
  for (const x of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(x * 0.15, 0.2, -0.12);
    w.rotation.set(0, x * 0.5, -x * 0.2);
    body.add(w);
    // arm bones
    add(w, new THREE.CylinderGeometry(0.02, 0.025, 0.5, 5), dark, [x * 0.25, 0.2, 0], [1, 1, 1], [0, 0, -x * 1.0]);
    add(w, new THREE.CylinderGeometry(0.015, 0.02, 0.45, 5), dark, [x * 0.45, 0.38, 0], [1, 1, 1], [0, 0, -x * 0.5]);
    // membrane
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(0.55, 0.52);
    sh.lineTo(0.5, 0.22);
    sh.lineTo(0.42, 0.3);
    sh.lineTo(0.36, 0.05);
    sh.lineTo(0.24, 0.12);
    sh.lineTo(0.05, -0.12);
    sh.lineTo(0, 0);
    const geo = new THREE.ShapeGeometry(sh);
    const mem = new THREE.Mesh(geo, M(0xe8743b, 0.8));
    (mem.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    mem.scale.x = x;
    mem.position.set(0, 0, 0);
    w.add(mem);
    add(w, new THREE.ConeGeometry(0.025, 0.08, 4), horn, [x * 0.55, 0.52, 0], [1, 1, 1], [0, 0, -x * 0.6]);
  }

  // belly-side floor stabilizer: slight random scale jitter on spikes for charm
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.type === "ConeGeometry" && rnd() > 0.7) o.scale.multiplyScalar(0.9 + rnd() * 0.2);
  });

  // lift so feet touch ground
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  const out = new THREE.Group();
  out.add(root);
  return out;
}
```