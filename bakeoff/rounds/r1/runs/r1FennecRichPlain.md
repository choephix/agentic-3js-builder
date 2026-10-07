```ts
import * as THREE from "three";

export const meta = {
  name: "Fennec Fox Kit on Dune",
  description: "Alert fennec fox kit with huge peach-lined ears, fluffy black-tipped tail, oversized paws, woven collar and brass bell, standing on a dusk sand dune.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (k: string, c: number, r = 0.9, m = 0) =>
    (mats[k] ||= new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true }));

  // sand texture
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#d9a86a"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > 0.5 ? "rgba(255,220,160,0.35)" : "rgba(150,100,60,0.3)";
    g.fillRect(rnd() * 128, rnd() * 128, 2, 2);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const sandM = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, flatShading: true });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number,
    sx = 1, sy = 1, sz = 1, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz);
    parent.add(m); return m;
  };
  const sph = (d = 1) => new THREE.IcosahedronGeometry(0.5, d);

  // dune: layered squashed cylinders + ripples
  const duneTop = 0.12;
  add(new THREE.CylinderGeometry(0.55, 0.9, 0.12, 14), sandM, 0, 0.06, 0);
  add(new THREE.CylinderGeometry(0.4, 0.55, 0.05, 14), sandM, 0, 0.145, 0).position.y = 0.095;
  for (let i = 0; i < 4; i++) {
    const r = add(new THREE.TorusGeometry(0.6 + i * 0.07, 0.008, 4, 24), M("rip", 0xb98350), 0.1, 0.01 + i * 0.002, 0.05);
    r.rotation.x = Math.PI / 2; r.scale.set(1.3, 1, 1);
  }
  for (let i = 0; i < 14; i++) {
    const a = rnd() * 6.28, d = 0.5 + rnd() * 0.5;
    add(sph(0), M("pebble", 0xa6764a), Math.cos(a) * d, 0.02, Math.sin(a) * d, 0.04, 0.025, 0.04);
  }

  const fur = M("cream", 0xf3e2c0), gold = M("gold", 0xd9a35a), dark = M("dark", 0x1a1210, 0.4);
  const peach = M("peach", 0xf4b79a, 0.5), white = M("white", 0xffffff, 0.2);
  const y0 = duneTop + 0.06;

  const fox = new THREE.Group();
  fox.position.set(0, y0 - 0.02, 0);
  root.add(fox);

  // body
  add(sph(1), fur, 0, 0.17, 0, 0.2, 0.2, 0.36, fox);
  add(sph(1), gold, 0, 0.215, -0.03, 0.19, 0.14, 0.32, fox); // golden back
  add(sph(1), fur, 0, 0.19, 0.12, 0.17, 0.2, 0.15, fox); // chest

  // legs & oversized paws
  const legs = [[0.07, 0.11], [-0.07, 0.11], [0.07, -0.12], [-0.07, -0.12]];
  legs.forEach(([x, z]) => {
    add(new THREE.CylinderGeometry(0.026, 0.02, 0.15, 5), gold, x, 0.085, z, 1, 1, 1, fox);
    add(sph(1), fur, x, 0.015, z + 0.02, 0.065, 0.035, 0.1, fox);
    add(sph(0), dark, x - 0.015, 0.012, z + 0.068, 0.012, 0.012, 0.012, fox);
    add(sph(0), dark, x + 0.015, 0.012, z + 0.068, 0.012, 0.012, 0.012, fox);
  });

  // head
  const head = new THREE.Group();
  head.position.set(0, 0.34, 0.2);
  fox.add(head);
  add(sph(1), fur, 0, 0, 0, 0.23, 0.18, 0.2, head);
  add(sph(1), gold, 0, 0.055, -0.02, 0.19, 0.08, 0.15, head);
  add(new THREE.ConeGeometry(0.055, 0.12, 5), fur, 0, -0.02, 0.14, 1, 1, 1, head).rotation.x = Math.PI / 2;
  add(sph(1), dark, 0, -0.005, 0.205, 0.05, 0.038, 0.04, head); // nose
  // cheeks
  add(sph(0), fur, 0.09, -0.04, 0.05, 0.1, 0.07, 0.1, head);
  add(sph(0), fur, -0.09, -0.04, 0.05, 0.1, 0.07, 0.1, head);
  // eyes
  [1, -1].forEach(s => {
    add(sph(1), dark, s * 0.07, 0.03, 0.12, 0.062, 0.075, 0.04, head);
    add(sph(0), white, s * 0.07 + 0.012, 0.045, 0.145, 0.018, 0.018, 0.012, head);
    add(sph(0), dark, s * 0.07, 0.075, 0.115, 0.07, 0.014, 0.03, head).rotation.z = s * -0.3;
    // ears
    const ear = new THREE.Group();
    ear.position.set(s * 0.09, 0.08, -0.02);
    ear.rotation.set(-0.1, 0, s * -0.3);
    head.add(ear);
    const outer = add(new THREE.ConeGeometry(0.07, 0.3, 4), M("sat", 0xe6b878, 0.35), 0, 0.14, 0, 1, 1, 0.35, ear);
    outer.rotation.y = Math.PI / 4;
    const inner = add(new THREE.ConeGeometry(0.052, 0.25, 4), peach, 0, 0.125, 0.014, 1, 1, 0.3, ear);
    inner.rotation.y = Math.PI / 4;
    add(sph(0), fur, 0, 0.06, 0.03, 0.07, 0.05, 0.03, ear);
    // whiskers
    for (let i = 0; i < 2; i++) {
      const w = add(new THREE.CylinderGeometry(0.002, 0.002, 0.12, 3), white, s * 0.1, -0.03 - i * 0.015, 0.15, 1, 1, 1, head);
      w.rotation.z = Math.PI / 2 + s * (0.1 - i * 0.2);
    }
  });

  // collar
  const collar = add(new THREE.TorusGeometry(0.095, 0.017, 5, 14), M("leather", 0x6b3d22, 0.8), 0, 0.27, 0.15, 1, 1, 1, fox);
  collar.rotation.x = Math.PI / 2 - 0.5;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * 6.28;
    const st = add(new THREE.BoxGeometry(0.014, 0.012, 0.014), i % 2 ? M("leather2", 0x9a6038, 0.8) : M("leather", 0x6b3d22), 0, 0, 0, 1, 1, 1, fox);
    const p = new THREE.Vector3(Math.cos(a) * 0.095, Math.sin(a) * 0.095, 0).applyEuler(collar.rotation);
    st.position.set(p.x, 0.27 + p.y, 0.15 + p.z);
    st.rotation.copy(collar.rotation); st.rotation.z = a;
  }
  const brass = M("brass", 0xd8a931, 0.3, 0.8);
  add(new THREE.SphereGeometry(0.03, 8, 6), brass, 0, 0.215, 0.235, 1, 1, 1, fox);
  add(new THREE.BoxGeometry(0.04, 0.003, 0.003), dark, 0, 0.208, 0.262, 1, 1, 1, fox);
  add(new THREE.TorusGeometry(0.012, 0.004, 4, 8), brass, 0, 0.247, 0.232, 1, 1, 1, fox);

  // tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.15, -0.3);
  tail.rotation.x = 0.9;
  fox.add(tail);
  add(sph(1), gold, 0, 0.0, -0.1, 0.16, 0.16, 0.34, tail).rotation.x = 0;
  add(sph(1), fur, 0, -0.03, -0.12, 0.13, 0.1, 0.3, tail);
  add(sph(1), dark, 0, 0.0, -0.29, 0.11, 0.11, 0.14, tail);
  tail.rotation.x = 0.15;
  tail.position.set(0, 0.1, -0.3);

  root.rotation.y = 0.25;
  return root;
}
```