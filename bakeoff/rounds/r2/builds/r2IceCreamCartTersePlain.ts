import * as THREE from "three";

export const meta = {
  name: "Ice Cream Cart",
  description: "A stylized vintage street ice cream cart with striped umbrella, scoop display, wheels and cones.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.7, m = 0) => {
    const k = c + "_" + r + "_" + m;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
    return mats[k];
  };
  const add = (g: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    p.add(m);
    return m;
  };

  // stripe texture for canopy
  const cv = document.createElement("canvas");
  cv.width = 256; cv.height = 8;
  const cx = cv.getContext("2d")!;
  const n = 8;
  for (let i = 0; i < n; i++) {
    cx.fillStyle = i % 2 ? "#fff6ea" : "#ee4466";
    cx.fillRect((i * 256) / n, 0, 256 / n, 8);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  const canopyMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, flatShading: true, side: THREE.DoubleSide });

  const cream = M(0xfff1d6), mint = M(0x7fd8c4), pink = M(0xf59ab5), wood = M(0xb7794a), dark = M(0x3b2a22);
  const metal = M(0xc9ced6, 0.3, 0.8), red = M(0xe0405a), gold = M(0xf2b84b, 0.4, 0.4);

  // body box
  add(new THREE.BoxGeometry(1.5, 0.75, 0.9), mint, 0, 0.85, 0);
  add(new THREE.BoxGeometry(1.6, 0.08, 1.0), cream, 0, 0.5, 0); // base trim
  add(new THREE.BoxGeometry(1.6, 0.06, 1.0), cream, 0, 1.25, 0.0); // top trim
  // panels on front and sides
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(1.2, 0.45, 0.02), pink, 0, 0.85, s * 0.46);
    add(new THREE.BoxGeometry(1.25, 0.5, 0.01), cream, 0, 0.85, s * 0.455);
  }
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.02, 0.45, 0.7), pink, s * 0.76, 0.85, 0);
  // scalloped trim
  for (let i = 0; i < 8; i++) {
    const x = -0.7 + i * 0.2;
    add(new THREE.ConeGeometry(0.1, 0.12, 4), red, x, 1.18, 0.51).rotation.x = Math.PI;
    add(new THREE.ConeGeometry(0.1, 0.12, 4), red, x, 1.18, -0.51).rotation.x = Math.PI;
  }

  // lid with glass display on top
  add(new THREE.BoxGeometry(1.4, 0.2, 0.8), metal, 0, 1.38, 0);
  // scoop tubs
  const flav = [0xf59ab5, 0xfff1d6, 0x7a4a2e, 0x8fe0a0, 0xf2b84b, 0xb48be0];
  for (let i = 0; i < 6; i++) {
    const x = -0.5 + (i % 3) * 0.5;
    const z = i < 3 ? 0.18 : -0.18;
    add(new THREE.CylinderGeometry(0.15, 0.13, 0.1, 8), metal, x, 1.53, z);
    add(new THREE.IcosahedronGeometry(0.14, 0), M(flav[i], 0.5), x, 1.62, z).scale.y = 0.7;
  }
  // glass
  const glass = new THREE.MeshStandardMaterial({ color: 0xcdeeff, transparent: true, opacity: 0.25, roughness: 0.1 });
  add(new THREE.BoxGeometry(1.4, 0.3, 0.8), glass, 0, 1.6, 0);

  // wheels
  for (const s of [1, -1]) {
    const w = new THREE.Group();
    w.position.set(0.0, 0.4, s * 0.58);
    root.add(w);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 6, 14), dark);
    w.add(tire);
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), gold, 0, 0, 0, w).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const sp = add(new THREE.BoxGeometry(0.03, 0.7, 0.03), wood, 0, 0, 0, w);
      sp.rotation.z = (i * Math.PI) / 6;
    }
  }
  // axle
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), dark, 0, 0.4, 0).rotation.x = Math.PI / 2;

  // handles
  for (const s of [1, -1]) {
    const h = add(new THREE.BoxGeometry(0.9, 0.05, 0.05), wood, -1.15, 0.9, s * 0.35);
    h.rotation.z = -0.25;
    add(new THREE.SphereGeometry(0.05, 6, 4), gold, -1.6, 0.8, s * 0.35);
  }
  add(new THREE.BoxGeometry(0.05, 0.05, 0.75), wood, -1.58, 0.8, 0);
  // front leg stand
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.06, 0.5, 0.06), wood, 0.65, 0.25, s * 0.4);

  // umbrella pole
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), metal, 0, 2.2, -0.3);
  const can = add(new THREE.ConeGeometry(1.3, 0.55, 8, 1, true), canopyMat, 0, 2.7, -0.3);
  add(new THREE.SphereGeometry(0.07, 6, 4), gold, 0, 3.0, -0.3);
  // scalloped canopy edge
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.12, 5, 4), i % 2 ? cream : red, Math.cos(a) * 1.2, 2.44, -0.3 + Math.sin(a) * 1.2).scale.y = 0.6;
  }
  void can;

  // sign flag with cone on side
  const cone = new THREE.Group();
  cone.position.set(0.9, 1.0, 0.0);
  root.add(cone);
  add(new THREE.ConeGeometry(0.1, 0.25, 6), M(0xd9a05b), 0, -0.12, 0, cone).rotation.z = Math.PI;
  add(new THREE.IcosahedronGeometry(0.11, 0), pink, 0, 0.05, 0, cone);
  cone.position.set(0, 2.05, 0.55);
  cone.scale.setScalar(1.2);
  // hang sign on hooks
  add(new THREE.BoxGeometry(0.35, 0.02, 0.02), gold, 0, 1.6, 0.5);

  // bell
  add(new THREE.ConeGeometry(0.08, 0.1, 8), gold, 0.7, 1.55, 0.4);

  // stacked cones for sale
  for (let i = 0; i < 4; i++) {
    const c = add(new THREE.ConeGeometry(0.06, 0.2, 6), M(0xd9a05b), -0.55 + i * 0.1, 1.5, 0.37 + rnd() * 0.02);
    c.rotation.z = Math.PI;
  }

  return root;
}
