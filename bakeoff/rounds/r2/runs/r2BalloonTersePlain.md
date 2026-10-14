```ts
import * as THREE from "three";

export const meta = {
  name: "Hot-Air Balloon",
  description: "Low-poly striped hot-air balloon with wicker basket, burner, ropes and sandbags.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // striped canvas texture
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 64;
  const g = cv.getContext("2d")!;
  const cols = ["#d62f2f", "#f6e7c1", "#2a6fb5", "#f6e7c1", "#f0b429", "#f6e7c1"];
  const n = 12;
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i % cols.length];
    g.fillRect((i * 512) / n, 0, 512 / n + 1, 64);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  const envMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, flatShading: true });

  // wicker texture
  const wc = document.createElement("canvas");
  wc.width = 128; wc.height = 128;
  const w = wc.getContext("2d")!;
  w.fillStyle = "#a9743a"; w.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 16) {
    for (let x = 0; x < 128; x += 16) {
      w.fillStyle = ((x + y) / 16) % 2 ? "#8b5a2b" : "#c48d4e";
      w.fillRect(x + 1, y + 1, 14, 14);
    }
  }
  const wtex = new THREE.CanvasTexture(wc);
  wtex.colorSpace = THREE.SRGBColorSpace;
  wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping;
  wtex.repeat.set(4, 1);
  const wicker = new THREE.MeshStandardMaterial({ map: wtex, roughness: 1, flatShading: true });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.9 });
  const rope = new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 1 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.8, roughness: 0.4 });
  const flame = new THREE.MeshStandardMaterial({ color: 0xffa31a, emissive: 0xff6a00, emissiveIntensity: 1.5 });
  const sand = new THREE.MeshStandardMaterial({ color: 0xc9b27a, roughness: 1 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x8a1f1f, roughness: 0.8 });

  // envelope via lathe
  const prof: THREE.Vector2[] = [];
  const pts: [number, number][] = [
    [0.01, 0], [0.45, 0.02], [0.8, 0.2], [1.3, 0.7], [1.7, 1.5], [2.0, 2.4],
    [2.1, 3.3], [1.95, 4.2], [1.5, 5.0], [0.8, 5.5], [0.01, 5.7],
  ];
  pts.forEach(([r, y]) => prof.push(new THREE.Vector2(r, y)));
  const env = new THREE.Mesh(new THREE.LatheGeometry(prof, 12), envMat);
  env.position.y = 2.6;
  root.add(env);

  // skirt ring at mouth
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12), trim);
  ring.position.y = 2.6;
  root.add(ring);

  // top cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.1, 8), trim);
  cap.position.y = 8.3;
  root.add(cap);

  // basket
  const bw = 1.2, bh = 0.9, by = 0.0;
  const basket = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw), wicker);
  basket.position.y = by + bh / 2;
  root.add(basket);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.1, 0.08, bw + 0.1), wood);
  rim.position.y = bh + 0.02;
  root.add(rim);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.04, 0.06, bw + 0.04), wood);
  floor.position.y = 0.03;
  root.add(floor);
  // corner posts
  const ph = 1.5;
  const corners: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  corners.forEach(([sx, sz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, ph, 6), wood);
    post.position.set(sx * bw / 2, ph / 2, sz * bw / 2);
    root.add(post);
    // ropes from post top to envelope ring
    const a = new THREE.Vector3(sx * bw / 2, ph, sz * bw / 2);
    const b = new THREE.Vector3(sx * 0.42, 2.6, sz * 0.42);
    const d = b.clone().sub(a);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, d.length(), 4), rope);
    r.position.copy(a).add(b).multiplyScalar(0.5);
    r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    root.add(r);
  });

  // burner frame and flame
  const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.25, 8), metal);
  burner.position.y = 2.1;
  root.add(burner);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04), metal);
  bar.position.y = 1.5;
  root.add(bar);
  const bar2 = bar.clone(); bar2.rotation.y = Math.PI / 2;
  root.add(bar2);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), metal);
  pipe.position.y = 1.8;
  root.add(pipe);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 6), flame);
  fl.position.y = 2.5;
  root.add(fl);

  // propane tanks inside basket
  [-0.3, 0.3].forEach((x) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 8), metal);
    t.position.set(x, 0.55, 0);
    root.add(t);
  });

  // sandbags hanging outside
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13 + rnd() * 0.02), sand);
    s.scale.y = 1.2;
    s.position.set(Math.cos(a) * 0.78, 0.55, Math.sin(a) * 0.78);
    root.add(s);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 4), rope);
    st.position.set(s.position.x * 0.9, 0.8, s.position.z * 0.9);
    root.add(st);
  }

  return root;
}
```