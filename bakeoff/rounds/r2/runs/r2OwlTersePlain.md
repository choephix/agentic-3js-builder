```ts
import * as THREE from "three";

export const meta = {
  name: "Owl",
  description: "A stylized low-poly barn-style owl perched on a branch stump, built from primitives with facial disc, ear tufts, layered feathers and talons.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const R = rng(7);
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (hex: number, rough = 0.9) => {
    const k = hex + "_" + rough;
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, flatShading: true });
    return mats[k];
  };

  // feather texture
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a5a35"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 90; i++) {
    const x = R() * 128, y = R() * 128;
    g.fillStyle = R() < 0.5 ? "#6b4226" : "#b07c4a";
    g.beginPath(); g.ellipse(x, y, 3, 7, 0, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const bodyMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, flatShading: true });

  const brown = M(0x6b4226), dark = M(0x4a2c18), cream = M(0xf0dfbc), tan = M(0xc9955c);
  const yellow = M(0xf2b01e, 0.4), black = M(0x111111, 0.3), beak = M(0x3b3b34, 0.5), wood = M(0x5a3e28), moss = M(0x4f7a3a);

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], r: number[] = [0, 0, 0], s: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.rotation.set(r[0], r[1], r[2]);
    m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  // perch: branch stump
  add(new THREE.CylinderGeometry(0.07, 0.085, 0.12, 8), wood, [0, 0.06, 0]);
  add(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 10), wood, [0, 0.02, 0]);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6), wood, [0, 0.12, 0], [0, 0, Math.PI / 2], [1, 1, 1]);
  add(new THREE.SphereGeometry(0.06, 6, 4), moss, [0.15, 0.04, 0.1], [0, 0, 0], [1.4, 0.5, 1]);

  const top = 0.14;
  // body
  const body = add(new THREE.SphereGeometry(0.12, 10, 8), bodyMat, [0, top + 0.15, -0.01], [-0.12, 0, 0], [1, 1.5, 0.95]);
  // belly
  add(new THREE.SphereGeometry(0.1, 10, 8), cream, [0, top + 0.13, 0.04], [-0.1, 0, 0], [0.85, 1.4, 0.7]);
  // belly spots
  for (let i = 0; i < 16; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    const x = (col - 1.5) * 0.04 + (row % 2) * 0.015;
    const y = top + 0.05 + row * 0.05;
    add(new THREE.BoxGeometry(0.014, 0.03, 0.01), dark, [x, y, 0.1 - Math.abs(x) * 0.5 + 0.005], [0, 0, 0.2 * (R() - 0.5)]);
  }

  // head
  const hy = top + 0.36;
  add(new THREE.SphereGeometry(0.115, 10, 8), bodyMat, [0, hy, 0.01], [0, 0, 0], [1.2, 0.9, 1]);
  // facial discs
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 10), cream, [s * 0.058, hy, 0.1], [Math.PI / 2, 0, 0], [1, 1, 1.05]);
    add(new THREE.TorusGeometry(0.06, 0.007, 4, 12), tan, [s * 0.058, hy, 0.108]);
    // eyes
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10), yellow, [s * 0.058, hy + 0.005, 0.112], [Math.PI / 2, 0, 0]);
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), black, [s * 0.058, hy + 0.005, 0.12], [Math.PI / 2, 0, 0]);
    add(new THREE.BoxGeometry(0.008, 0.008, 0.01), cream, [s * 0.065, hy + 0.015, 0.131]);
    // brows
    add(new THREE.BoxGeometry(0.075, 0.016, 0.02), dark, [s * 0.062, hy + 0.05, 0.108], [0, 0, -s * 0.35]);
    // ear tufts
    add(new THREE.ConeGeometry(0.03, 0.12, 4), dark, [s * 0.08, hy + 0.12, -0.005], [0, 0, -s * 0.3]);
    add(new THREE.ConeGeometry(0.018, 0.08, 4), tan, [s * 0.082, hy + 0.115, 0.012], [0, 0, -s * 0.3]);
  }
  // beak
  add(new THREE.ConeGeometry(0.025, 0.06, 4), beak, [0, hy - 0.03, 0.135], [Math.PI * 0.62, Math.PI / 4, 0]);
  // forehead stripe
  add(new THREE.BoxGeometry(0.02, 0.05, 0.02), cream, [0, hy + 0.04, 0.11], [0.3, 0, 0]);

  // wings
  for (const s of [-1, 1]) {
    const w = new THREE.Group();
    w.position.set(s * 0.125, top + 0.3, -0.01);
    w.rotation.set(0, 0, s * 0.08);
    root.add(w);
    add(new THREE.SphereGeometry(0.07, 8, 6), brown, [s * 0.01, -0.12, -0.02], [-0.12, 0, 0], [0.5, 2.1, 0.9], w);
    for (let i = 0; i < 4; i++) {
      add(new THREE.BoxGeometry(0.04, 0.09, 0.012), i % 2 ? dark : tan, [s * 0.015, -0.2 - i * 0.012, -0.075 - i * 0.012 + 0.03], [0.05, 0, s * (i - 1.5) * 0.05], [1, 1, 1], w);
    }
    // wing spots
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.012, 0.012, 0.01), cream, [s * 0.04, -0.05 - i * 0.04, -0.005 - 0.01 * i], [0, 0, 0.6], [1, 1, 1], w);
  }

  // tail
  for (let i = -2; i <= 2; i++) {
    add(new THREE.BoxGeometry(0.04, 0.012, 0.16), i % 2 ? dark : brown, [i * 0.032, top + 0.01, -0.15], [0.9, i * 0.07, 0], [1, 1, 1]);
  }
  add(new THREE.BoxGeometry(0.18, 0.012, 0.012), cream, [0, top + 0.0, -0.215], [0.9, 0, 0]);

  // feet
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 5), tan, [s * 0.04, top + 0.03, 0.02]);
    add(new THREE.SphereGeometry(0.03, 6, 4), cream, [s * 0.04, top + 0.06, 0.01], [0, 0, 0], [1, 1.2, 1]);
    for (let t = -1; t <= 1; t++) {
      add(new THREE.BoxGeometry(0.014, 0.014, 0.06), tan, [s * 0.04 + t * 0.02, top + 0.005, 0.06], [0, t * -0.2, 0]);
      add(new THREE.ConeGeometry(0.008, 0.025, 4), beak, [s * 0.04 + t * 0.022, top - 0.005, 0.098], [Math.PI * 0.8, 0, 0]);
    }
  }

  root.scale.setScalar(1.15);
  return root;
}
```