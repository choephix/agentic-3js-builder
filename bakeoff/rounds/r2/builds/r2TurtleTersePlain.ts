import * as THREE from "three";

export const meta = {
  name: "Sea Turtle",
  description: "Stylized low-poly green sea turtle with patterned scute shell, paddle flippers and a textured plastron, in a swimming rest pose.",
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
  const rand = rng(7);

  // Shell texture
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#6b5a2c";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(${60 + rand() * 40},${50 + rand() * 40},20,0.35)`;
    g.beginPath();
    g.arc(rand() * 256, rand() * 256, 8 + rand() * 25, 0, 7);
    g.fill();
  }
  g.strokeStyle = "#2e2610";
  g.lineWidth = 4;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const shellMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, flatShading: true });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x8a7a3e, roughness: 0.7, flatShading: true });
  const skin = new THREE.MeshStandardMaterial({ color: 0x5f8a4a, roughness: 0.8, flatShading: true });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0x3f6637, roughness: 0.8, flatShading: true });
  const belly = new THREE.MeshStandardMaterial({ color: 0xe6d9a0, roughness: 0.8, flatShading: true });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  const baseY = 0.2;
  // Plastron
  const pl = add(new THREE.SphereGeometry(0.5, 10, 6), belly, 0, baseY + 0.02, 0);
  pl.scale.set(0.9, 0.22, 1.2);
  // Carapace dome
  const sh = add(new THREE.SphereGeometry(0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), shellMat, 0, baseY + 0.06, 0);
  sh.scale.set(0.95, 0.55, 1.25);
  // Rim
  const rim = add(new THREE.TorusGeometry(0.5, 0.04, 5, 14), rimMat, 0, baseY + 0.06, 0);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(0.95, 1.25, 1.2);
  // Raised scutes along the spine
  for (let i = 0; i < 5; i++) {
    const z = -0.38 + i * 0.19;
    const w = 0.12 - Math.abs(i - 2) * 0.012;
    const s = add(new THREE.CylinderGeometry(w, w * 1.3, 0.06, 6), rimMat, 0, baseY + 0.06 + 0.275 * Math.sqrt(Math.max(0, 1 - (z / 0.625) ** 2)) + 0.01, z);
    s.rotation.x = z * 0.5;
  }
  // Tail-end point
  const tail = add(new THREE.ConeGeometry(0.07, 0.25, 5), skin, 0, baseY + 0.03, -0.7);
  tail.rotation.x = -Math.PI / 2;

  // Head
  const neck = add(new THREE.CylinderGeometry(0.1, 0.13, 0.25, 7), skin, 0, baseY + 0.08, 0.65);
  neck.rotation.x = Math.PI / 2;
  const head = add(new THREE.SphereGeometry(0.14, 8, 6), skin, 0, baseY + 0.09, 0.84);
  head.scale.set(1, 0.85, 1.2);
  const beak = add(new THREE.ConeGeometry(0.09, 0.14, 6), skinDark, 0, baseY + 0.05, 0.99);
  beak.rotation.x = Math.PI / 2;
  beak.scale.set(1.1, 1, 0.6);
  for (const sx of [-1, 1]) {
    add(new THREE.SphereGeometry(0.035, 6, 5), white, sx * 0.1, baseY + 0.13, 0.9);
    add(new THREE.SphereGeometry(0.022, 6, 5), eyeMat, sx * 0.12, baseY + 0.13, 0.915);
    // Brow ridge
    const b = add(new THREE.BoxGeometry(0.06, 0.015, 0.08), skinDark, sx * 0.09, baseY + 0.17, 0.89);
    b.rotation.z = sx * -0.3;
  }

  // Flippers
  const flipper = (sx: number, front: boolean) => {
    const grp = new THREE.Group();
    grp.position.set(sx * 0.4, baseY + 0.07, front ? 0.38 : -0.42);
    const len = front ? 0.75 : 0.4;
    const wid = front ? 0.2 : 0.16;
    const m = add(new THREE.SphereGeometry(0.5, 8, 5), skin, sx * len * 0.5, 0, 0, grp);
    m.scale.set(len, 0.06, wid);
    const tip = add(new THREE.ConeGeometry(wid * 0.5, 0.18, 5), skinDark, sx * len * 0.98, 0, 0, grp);
    tip.rotation.z = -sx * Math.PI / 2;
    tip.scale.set(1, 1, 0.3);
    // Pale leading edge
    const e = add(new THREE.BoxGeometry(len * 0.8, 0.02, 0.025), rimMat, sx * len * 0.5, 0.025, wid * 0.3, grp);
    void e;
    grp.rotation.y = sx * (front ? -0.55 : 0.7);
    grp.rotation.z = sx * (front ? 0.15 : 0.05);
    root.add(grp);
  };
  flipper(1, true);
  flipper(-1, true);
  flipper(1, false);
  flipper(-1, false);

  // Sink slightly: lowest point is plastron bottom
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y - 0.002;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
