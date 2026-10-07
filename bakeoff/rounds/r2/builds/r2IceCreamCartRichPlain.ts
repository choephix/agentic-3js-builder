import * as THREE from "three";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description: "Mint and cream push cart with scalloped pink striped canopy, spoked wheels, chrome lid, cone sign and giant pastel cones.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.7, m = 0) => {
    const k = c + "_" + r + "_" + m;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
    return mats[k];
  };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    p.add(me);
    return me;
  };
  const mint = M(0xa8e6cf), cream = M(0xfff4dc), pink = M(0xff8fb1), white = M(0xffffff);
  const chrome = M(0xdfe6ea, 0.2, 0.9), dark = M(0x4a3b3b), wood = M(0xc08a54);

  // striped canvas texture for sign/body trim
  const cv = document.createElement("canvas");
  cv.width = 128; cv.height = 128;
  const cx = cv.getContext("2d")!;
  cx.fillStyle = "#fff4dc"; cx.fillRect(0, 0, 128, 128);
  cx.fillStyle = "#ff8fb1";
  for (let i = 0; i < 128; i += 32) cx.fillRect(i, 0, 16, 128);

  // body
  add(new THREE.BoxGeometry(1.5, 0.7, 0.9), mint, 0, 0.75, 0);
  add(new THREE.BoxGeometry(1.56, 0.12, 0.96), cream, 0, 0.45, 0);
  add(new THREE.BoxGeometry(1.56, 0.12, 0.96), cream, 0, 1.05, 0);
  // panels
  for (const sx of [-0.4, 0.4]) {
    add(new THREE.BoxGeometry(0.6, 0.38, 0.03), cream, sx, 0.75, 0.46);
    add(new THREE.BoxGeometry(0.5, 0.28, 0.03), mint, sx, 0.75, 0.475);
  }
  // chrome lid
  add(new THREE.BoxGeometry(1.5, 0.08, 0.9), chrome, 0, 1.15, 0);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8).rotateZ(Math.PI / 2), chrome, 0, 1.22, 0.4);
  add(new THREE.BoxGeometry(0.1, 0.06, 0.1), chrome, -0.55, 1.2, 0);

  // axle & wheels
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8).rotateZ(Math.PI / 2), dark, 0, 0.4, 0);
  for (const sx of [-0.78, 0.78]) {
    const w = new THREE.Group();
    w.position.set(sx, 0.4, 0);
    root.add(w);
    add(new THREE.TorusGeometry(0.38, 0.035, 6, 20).rotateY(Math.PI / 2), dark, 0, 0, 0, w);
    add(new THREE.TorusGeometry(0.33, 0.015, 4, 20).rotateY(Math.PI / 2), pink, 0, 0, 0, w);
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8).rotateZ(Math.PI / 2), chrome, 0, 0, 0, w);
    for (let i = 0; i < 8; i++) {
      const s = add(new THREE.BoxGeometry(0.025, 0.72, 0.025), cream, 0, 0, 0, w);
      s.rotation.x = (i * Math.PI) / 8;
    }
  }
  // legs/stand
  add(new THREE.BoxGeometry(0.08, 0.4, 0.08), dark, 0.6, 0.2, -0.35);
  add(new THREE.BoxGeometry(0.08, 0.4, 0.08), dark, -0.6, 0.2, -0.35);

  // push handle
  const hz = -0.45;
  for (const sy of [0.9, 1.15]) {
    const a = add(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6).rotateX(Math.PI / 2), wood, 0, sy, hz - 0.2);
    a.position.x = 0;
  }
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8).rotateZ(Math.PI / 2), wood, 0, 1.15, hz - 0.45);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8).rotateZ(Math.PI / 2), wood, 0, 0.9, hz - 0.45);
  for (const sx of [-0.45, 0.45]) add(new THREE.BoxGeometry(0.05, 0.3, 0.05), wood, sx, 1.02, hz - 0.45);

  // canopy poles
  for (const sx of [-0.7, 0.7]) for (const sz of [-0.4, 0.4]) add(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), chrome, sx, 1.69, sz);
  // canopy: striped roof slabs
  const nStripes = 10, cw = 1.8 / nStripes;
  for (let i = 0; i < nStripes; i++) {
    const m = i % 2 ? white : pink;
    const x = -0.9 + cw * (i + 0.5);
    const s = add(new THREE.BoxGeometry(cw, 0.05, 1.3), m, x, 2.3 - Math.abs(x) * 0.2, 0);
    s.rotation.z = x > 0 ? 0.2 : -0.2;
    s.rotation.z = Math.atan2(-0.2 * Math.sign(x), 1) * 1;
    // scallop
    const sc = add(new THREE.CylinderGeometry(cw / 2, cw / 2, 0.05, 8).rotateX(Math.PI / 2), m, x, 2.3 - Math.abs(x) * 0.2 - 0.03, 0.65);
    sc.rotation.z = s.rotation.z;
    const sb = add(new THREE.CylinderGeometry(cw / 2, cw / 2, 0.05, 8).rotateX(Math.PI / 2), m, x, 2.3 - Math.abs(x) * 0.2 - 0.03, -0.65);
    sb.rotation.z = s.rotation.z;
  }
  add(new THREE.SphereGeometry(0.07, 6, 5), pink, 0, 2.38, 0);

  // giant cones along top
  const flav = [0xffb3d1, 0xb5ead7, 0xfff1a8, 0xc7b8ff, 0xffd1a8];
  flav.forEach((c, i) => {
    const x = -0.72 + i * 0.36;
    const y = 2.4 - Math.abs(x) * 0.2;
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    g.rotation.z = Math.atan2(-0.2 * Math.sign(x), 1) * 0.0;
    root.add(g);
    add(new THREE.ConeGeometry(0.1, 0.3, 8).rotateX(Math.PI), M(0xe0a458), 0, 0.15, 0, g);
    add(new THREE.SphereGeometry(0.12, 8, 6), M(c), 0, 0.34, 0, g);
    add(new THREE.SphereGeometry(0.035, 6, 4), M(0xd6336c), 0, 0.49, 0, g);
  });

  // cone-shaped sign on the front
  const sg = new THREE.Group();
  sg.position.set(0, 1.45, 0.5);
  root.add(sg);
  add(new THREE.ConeGeometry(0.2, 0.45, 4).rotateX(Math.PI), M(0xe0a458), 0, -0.1, 0, sg).scale.z = 0.12;
  add(new THREE.SphereGeometry(0.18, 8, 6), pink, 0, 0.18, 0, sg).scale.z = 0.35;
  add(new THREE.SphereGeometry(0.13, 8, 6), cream, 0, 0.34, 0, sg).scale.z = 0.35;
  const stripeMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv), roughness: 0.8 });
  add(new THREE.BoxGeometry(1.5, 0.06, 0.02), stripeMat, 0, 1.13, 0.47);

  return root;
}
