```ts
import * as THREE from "three";

export const meta = {
  name: "Giraffe",
  description: "Low-poly stylized giraffe built from primitives, with a canvas-patterned coat, ossicones, mane and tufted tail.",
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

  // Coat texture
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#e9b44c";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#8a4b1e";
  for (let i = 0; i < 38; i++) {
    const x = rand() * 256, y = rand() * 256, r = 16 + rand() * 14;
    for (const ox of [-256, 0, 256]) {
      g.beginPath();
      const n = 6;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rand() * 0.3;
        const rr = r * (0.75 + rand() * 0.35);
        const px = x + ox + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        k ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.closePath();
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const coat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, flatShading: true });
  const tan = new THREE.MeshStandardMaterial({ color: 0xf0cf8a, roughness: 0.9, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.8, flatShading: true });
  const hoof = new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.7, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xc98a7a, roughness: 0.8 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Body
  const body = add(new THREE.BoxGeometry(0.85, 0.95, 1.7), coat, 0, 2.55, 0);
  add(new THREE.BoxGeometry(0.7, 0.8, 0.5), coat, 0, 2.8, 0.75).rotation.x = -0.1; // shoulder hump
  add(new THREE.BoxGeometry(0.75, 0.8, 0.5), coat, 0, 2.45, -0.8);
  body.rotation.x = 0.05;
  // belly
  add(new THREE.BoxGeometry(0.6, 0.15, 1.4), tan, 0, 2.05, 0);

  // Legs
  const legs: [number, number, number][] = [
    [0.27, 0.78, 1], [-0.27, 0.78, 1], [0.27, -0.75, 0.9], [-0.27, -0.75, 0.9],
  ];
  for (const [x, z, s] of legs) {
    const top = add(new THREE.BoxGeometry(0.24, 0.9, 0.26), coat, x, 1.6, z);
    top.scale.x = s;
    add(new THREE.BoxGeometry(0.2, 0.15, 0.2), dark, x, 1.12, z); // knee
    add(new THREE.BoxGeometry(0.17, 0.95, 0.19), coat, x, 0.6, z);
    add(new THREE.BoxGeometry(0.2, 0.12, 0.22), tan, x, 0.2, z);
    add(new THREE.BoxGeometry(0.22, 0.14, 0.28), hoof, x, 0.07, z + 0.02);
  }

  // Neck
  const neck = new THREE.Group();
  neck.position.set(0, 2.9, 0.85);
  neck.rotation.x = 0.38;
  root.add(neck);
  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const w = 0.42 - i * 0.045;
    add(new THREE.BoxGeometry(w, 0.8, w * 0.95), coat, 0, 0.4 + i * 0.75, 0, neck);
  }
  // mane
  for (let i = 0; i < 12; i++) {
    const m = add(new THREE.BoxGeometry(0.08, 0.2, 0.12), dark, 0, 0.2 + i * 0.3, -0.22 + i * 0.002, neck);
    m.rotation.x = -0.2;
  }

  // Head group at top of neck
  const head = new THREE.Group();
  head.position.set(0, 4.05, 0);
  neck.updateMatrixWorld(true);
  const topWorld = new THREE.Vector3(0, 0.4 + 4 * 0.75 + 0.4, 0).applyMatrix4(neck.matrixWorld);
  head.position.copy(topWorld);
  head.rotation.x = 0.35;
  root.add(head);
  add(new THREE.BoxGeometry(0.34, 0.36, 0.5), coat, 0, 0.1, 0.05, head);
  add(new THREE.BoxGeometry(0.24, 0.24, 0.3), tan, 0, -0.03, 0.4, head); // muzzle
  add(new THREE.BoxGeometry(0.25, 0.05, 0.1), pink, 0, -0.18, 0.5, head);
  add(new THREE.BoxGeometry(0.05, 0.05, 0.03), black, 0.07, 0.03, 0.56, head);
  add(new THREE.BoxGeometry(0.05, 0.05, 0.03), black, -0.07, 0.03, 0.56, head);
  for (const sx of [1, -1]) {
    const eye = add(new THREE.SphereGeometry(0.06, 6, 5), black, sx * 0.18, 0.15, 0.15, head);
    eye.scale.set(0.6, 1, 1);
    add(new THREE.SphereGeometry(0.02, 4, 3), white, sx * 0.21, 0.17, 0.19, head);
    const ear = add(new THREE.BoxGeometry(0.32, 0.1, 0.16), coat, sx * 0.3, 0.2, -0.1, head);
    ear.rotation.z = sx * -0.3;
    add(new THREE.BoxGeometry(0.1, 0.06, 0.1), pink, sx * 0.42, 0.24, -0.1, head);
    // ossicones
    add(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 5), tan, sx * 0.09, 0.4, -0.05, head);
    add(new THREE.SphereGeometry(0.07, 6, 5), dark, sx * 0.09, 0.58, -0.05, head);
  }

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 2.85, -0.88);
  tail.rotation.x = -0.25;
  root.add(tail);
  add(new THREE.BoxGeometry(0.06, 0.9, 0.06), coat, 0, -0.45, 0, tail);
  add(new THREE.BoxGeometry(0.14, 0.35, 0.14), dark, 0, -1.0, 0, tail);

  // Spots on legs/body get texture; scale root to realistic height (~5.2m)
  return root;
}
```