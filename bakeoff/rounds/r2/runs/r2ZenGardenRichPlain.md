```ts
import * as THREE from "three";

export const meta = {
  name: "Japanese Garden Diorama",
  description: "Square base with a red arched bridge over a koi pond, stone lantern, cloud-pruned pine, blooming cherry tree, raked gravel, mossy rocks and stepping stones.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mats: Record<string, THREE.MeshStandardMaterial> = {};
function M(color: number, rough = 0.85, extra: Partial<THREE.MeshStandardMaterial> = {}) {
  const k = color + "_" + rough + "_" + Object.keys(extra).join();
  if (!mats[k]) {
    mats[k] = new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true, ...extra });
  }
  return mats[k];
}

function gravelTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e6dc";
  g.fillRect(0, 0, 256, 256);
  const r = rng(5);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = r() > 0.5 ? "#d6d3c6" : "#f7f5ee";
    g.fillRect(r() * 256, r() * 256, 2, 2);
  }
  g.strokeStyle = "#bdb9aa";
  g.lineWidth = 2;
  for (let y = 8; y < 256; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const R = rng(42);

  function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  // Base: 4x4 m, wood frame
  add(root, new THREE.BoxGeometry(4.0, 0.2, 4.0), M(0x5a3a22), 0, 0.1, 0);
  add(root, new THREE.BoxGeometry(4.1, 0.06, 4.1), M(0x3b2515), 0, 0.03, 0);
  // Ground top (gravel) – with hole region made by separate pieces
  const gravel = M(0xffffff, 0.95, { map: gravelTexture() });
  (gravel.map as THREE.Texture).repeat.set(4, 4);
  const gy = 0.23;
  // pond occupies x in [-1.3,0.7], z in [-0.9,0.9] ; build ground as 4 slabs around it
  const slab = (w: number, d: number, x: number, z: number) =>
    add(root, new THREE.BoxGeometry(w, 0.06, d), gravel, x, 0.2 + 0.03, z);
  slab(4, 1.1, 0, -1.45); // back
  slab(4, 1.1, 0, 1.45); // front
  slab(1.3, 1.8, -1.35, 0); // left (x -2..-0.7)... adjust
  slab(1.3, 1.8, 1.35, 0);
  // pond: x -0.7..0.7
  const pondW = 1.4;
  // pond bed and water
  add(root, new THREE.BoxGeometry(pondW, 0.04, 1.8), M(0x2c5e6e), 0, 0.2, 0);
  const water = add(root, new THREE.BoxGeometry(pondW, 0.04, 1.8), M(0x4aa7c0, 0.15, { transparent: true, opacity: 0.8 }), 0, 0.245, 0);
  water.name = "water";
  // pond border stones
  for (let i = 0; i < 14; i++) {
    const t = i / 14;
    const sides: [number, number][] = [
      [-0.72 + t * 1.44 * 1, -0.92],
      [-0.72 + t * 1.44, 0.92],
    ];
    sides.forEach(([x, z]) => {
      const s = 0.12 + R() * 0.07;
      const m = add(root, new THREE.DodecahedronGeometry(s, 0), M(0x8a8a84), x, 0.26, z);
      m.scale.y = 0.6;
      m.rotation.y = R() * 3;
    });
  }
  for (let i = 0; i < 8; i++) {
    const z = -0.8 + (i / 7) * 1.6;
    [-0.74, 0.74].forEach((x) => {
      const s = 0.12 + R() * 0.07;
      const m = add(root, new THREE.DodecahedronGeometry(s, 0), M(0x7d7d78), x, 0.26, z);
      m.scale.y = 0.6;
      m.rotation.y = R() * 3;
    });
  }
  // lily pads
  const pad = M(0x4f9a3c);
  [[-0.35, 0.5], [0.3, -0.6], [0.45, 0.2]].forEach(([x, z]) => {
    add(root, new THREE.CylinderGeometry(0.09, 0.09, 0.01, 7), pad, x, 0.27, z);
  });
  add(root, new THREE.SphereGeometry(0.04, 5, 4), M(0xf7a8c4), 0.45, 0.285, 0.2);

  // Koi
  const orange = M(0xff6a1a, 0.5), white = M(0xfff7ee, 0.5), dark = M(0x111111);
  function koi(x: number, z: number, rot: number, pattern: number) {
    const g = new THREE.Group();
    const body = add(g, new THREE.SphereGeometry(0.1, 7, 5), pattern === 2 ? white : orange);
    body.scale.set(0.6, 0.55, 1.5);
    const patch = add(g, new THREE.SphereGeometry(0.1, 6, 4), pattern === 2 ? orange : white, 0, 0.02, -0.03);
    patch.scale.set(0.5, 0.45, 0.8);
    const head = add(g, new THREE.SphereGeometry(0.07, 6, 4), pattern === 1 ? white : orange, 0, 0, 0.12);
    head.scale.set(0.8, 0.7, 1);
    const tail = add(g, new THREE.ConeGeometry(0.07, 0.14, 4), orange, 0, 0, -0.2);
    tail.rotation.x = -Math.PI / 2;
    tail.scale.set(1, 1, 0.3);
    add(g, new THREE.BoxGeometry(0.01, 0.06, 0.07), orange, 0, 0.06, -0.02);
    [-1, 1].forEach((s) => {
      const f = add(g, new THREE.BoxGeometry(0.07, 0.008, 0.05), orange, s * 0.07, -0.02, 0.05);
      f.rotation.y = s * 0.6;
      add(g, new THREE.SphereGeometry(0.012, 4, 3), dark, s * 0.04, 0.025, 0.17);
    });
    g.position.set(x, 0.255, z);
    g.rotation.y = rot;
    root.add(g);
  }
  koi(-0.3, -0.3, 0.6, 0);
  koi(0.25, 0.1, 3.8, 1);
  koi(-0.15, 0.65, 2.2, 2);

  // Bridge along X across pond (pond x -0.7..0.7). Arch.
  const bridge = new THREE.Group();
  const red = M(0xc4251c, 0.6), darkRed = M(0x8f1810, 0.6), gold = M(0xd9a62e, 0.4);
  const N = 9, span = 2.0, H = 0.38;
  const archY = (x: number) => H * (1 - Math.pow(x / (span / 2), 2));
  for (let i = 0; i < N; i++) {
    const x0 = -span / 2 + (i / N) * span, x1 = -span / 2 + ((i + 1) / N) * span;
    const xm = (x0 + x1) / 2;
    const len = Math.hypot(x1 - x0, archY(x1) - archY(x0));
    const seg = add(bridge, new THREE.BoxGeometry(len + 0.02, 0.06, 0.5), red, xm, archY(xm), 0);
    seg.rotation.z = Math.atan2(archY(x1) - archY(x0), x1 - x0);
    add(bridge, new THREE.BoxGeometry(len + 0.02, 0.025, 0.5), darkRed, xm, archY(xm) - 0.04, 0).rotation.z = seg.rotation.z;
  }
  [-1, 1].forEach((s) => {
    // side beams
    for (let i = 0; i < N; i++) {
      const x0 = -span / 2 + (i / N) * span, x1 = -span / 2 + ((i + 1) / N) * span;
      const xm = (x0 + x1) / 2;
      const len = Math.hypot(x1 - x0, archY(x1) - archY(x0));
      const r = add(bridge, new THREE.BoxGeometry(len + 0.02, 0.04, 0.04), red, xm, archY(xm) + 0.3, s * 0.23);
      r.rotation.z = Math.atan2(archY(x1) - archY(x0), x1 - x0);
      const r2 = add(bridge, new THREE.BoxGeometry(len + 0.02, 0.025, 0.03), red, xm, archY(xm) + 0.17, s * 0.23);
      r2.rotation.z = r.rotation.z;
    }
    for (let i = 0; i <= N; i++) {
      const x = -span / 2 + (i / N) * span;
      add(bridge, new THREE.BoxGeometry(0.05, 0.34, 0.05), red, x, archY(x) + 0.17, s * 0.23);
      if (i % N === 0) add(bridge, new THREE.SphereGeometry(0.05, 5, 4), gold, x, archY(x) + 0.37, s * 0.23);
    }
  });
  // supports in water
  [-0.6, 0.6].forEach((x) => [-1, 1].forEach((s) => add(bridge, new THREE.BoxGeometry(0.1, 0.3, 0.1), darkRed, x, 0.02, s * 0.18)));
  bridge.position.set(0, 0.27 + 0.0, 0);
  bridge.position.y = 0.3;
  bridge.rotation.y = Math.PI / 2;
  root.add(bridge);
  // Bridge ends after rotation lie along z: z -1..1, pond z -0.9..0.9 -- but pond is wide in z. Fix: span across x instead.
  bridge.rotation.y = 0;
  bridge.scale.set(0.8, 1, 1);
  bridge.position.y = 0.3;

  // Stepping stones to the bridge (from +x side, front)
  const stone = M(0x9b9b94);
  [[1.0, 0.35], [1.25, 0.7], [1.5, 1.1], [1.55, 1.5]].forEach(([x, z], i) => {
    const m = add(root, new THREE.CylinderGeometry(0.17 + R() * 0.04, 0.2, 0.06, 7), stone, x, 0.26, z);
    m.rotation.y = R() * 3;
  });
  [[-1.0, -0.35], [-1.25, -0.8]].forEach(([x, z]) => {
    add(root, new THREE.CylinderGeometry(0.17, 0.2, 0.06, 7), stone, x, 0.26, z);
  });

  // Mossy rocks
  const moss = M(0x5f8f3a), rock = M(0x77776f);
  function mossyRock(x: number, z: number, s: number) {
    const g = new THREE.Group();
    const a = add(g, new THREE.DodecahedronGeometry(s, 0), rock);
    a.scale.set(1.2, 0.8, 1);
    a.rotation.set(R(), R() * 3, R());
    const b = add(g, new THREE.DodecahedronGeometry(s * 0.7, 0), moss, 0, s * 0.45, 0);
    b.scale.set(1.2, 0.5, 1);
    g.position.set(x, 0.26 + s * 0.3, z);
    root.add(g);
  }
  mossyRock(-1.5, 1.4, 0.22);
  mossyRock(-1.2, 1.65, 0.13);
  mossyRock(1.6, -1.5, 0.2);
  mossyRock(1.2, -1.3, 0.12);
  mossyRock(-0.2, -1.5, 0.15);

  // Stone lantern at (1.4,-0.6)
  const lan = new THREE.Group();
  const gs = M(0xa5a59c);
  add(lan, new THREE.CylinderGeometry(0.17, 0.2, 0.06, 6), gs, 0, 0.03, 0);
  add(lan, new THREE.CylinderGeometry(0.06, 0.07, 0.4, 6), gs, 0, 0.26, 0);
  add(lan, new THREE.CylinderGeometry(0.15, 0.1, 0.06, 6), gs, 0, 0.49, 0);
  add(lan, new THREE.BoxGeometry(0.17, 0.17, 0.17), gs, 0, 0.61, 0);
  add(lan, new THREE.BoxGeometry(0.1, 0.1, 0.18), M(0xffd27a, 0.4, { emissive: new THREE.Color(0xffa030), emissiveIntensity: 0.7 }), 0, 0.61, 0);
  add(lan, new THREE.BoxGeometry(0.18, 0.1, 0.1), M(0xffd27a, 0.4, { emissive: new THREE.Color(0xffa030), emissiveIntensity: 0.7 }), 0, 0.61, 0);
  const roof = add(lan, new THREE.ConeGeometry(0.24, 0.14, 4), gs, 0, 0.75, 0);
  roof.rotation.y = Math.PI / 4;
  add(lan, new THREE.SphereGeometry(0.04, 5, 4), gs, 0, 0.85, 0);
  lan.position.set(1.35, 0.26, -0.55);
  root.add(lan);

  // Pine tree at (-1.4, -1.1)
  const pine = new THREE.Group();
  const bark = M(0x5b3d28), needle = M(0x2f6b3a), needle2 = M(0x3d8247);
  const trunk: [number, number, number, number][] = [
    [0, 0.2, 0.0, 0.1], [0.05, 0.5, 0, 0.09], [0.15, 0.75, 0, 0.07], [0.1, 1.0, 0, 0.06],
  ];
  trunk.forEach(([x, y, z, r], i) => {
    const c = add(pine, new THREE.CylinderGeometry(r * 0.8, r, 0.3, 6), bark, x, y, z);
    c.rotation.z = i % 2 ? 0.25 : -0.2;
  });
  const clouds: [number, number, number, number][] = [
    [0.3, 0.8, 0.0, 0.25], [-0.25, 0.65, 0.1, 0.22], [0.0, 1.15, 0, 0.28], [0.25, 1.05, 0.1, 0.18],
  ];
  clouds.forEach(([x, y, z, s], i) => {
    const cl = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const b = add(cl, new THREE.IcosahedronGeometry(s * (0.55 + R() * 0.3), 0), k % 2 ? needle : needle2, (k - 1.5) * s * 0.5, R() * 0.05, (R() - 0.5) * s * 0.4);
      b.scale.y = 0.55;
    }
    cl.position.set(x, y, z);
    pine.add(cl);
    if (i < 2) {
      const br = add(pine, new THREE.CylinderGeometry(0.02, 0.03, 0.3, 5), bark, x * 0.5, y - 0.1, 0);
      br.rotation.z = x > 0 ? -1.1 : 1.1;
    }
  });
  pine.position.set(-1.4, 0.23, -1.1);
  root.add(pine);

  // Cherry tree at (-1.3, 0.9)
  const ch = new THREE.Group();
  const cbark = M(0x4a3430);
  add(ch, new THREE.CylinderGeometry(0.09, 0.13, 0.7, 6), cbark, 0, 0.35, 0);
  const limbs: [number, number][] = [[0.6, 0], [-0.6, 1.5], [0.5, 3.2], [-0.5, 4.5]];
  limbs.forEach(([tilt, ry]) => {
    const l = new THREE.Group();
    const b = add(l, new THREE.CylinderGeometry(0.03, 0.06, 0.6, 5), cbark, 0, 0.3, 0);
    l.rotation.set(0, ry, tilt);
    l.position.set(0, 0.6, 0);
    ch.add(l);
  });
  const pinks = [M(0xf8b4cc), M(0xffc9db), M(0xf29ab8), M(0xffdde8)];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2, rr = R() * 0.6;
    const b = add(ch, new THREE.IcosahedronGeometry(0.2 + R() * 0.15, 0), pinks[i % 4], Math.cos(a) * rr, 1.1 + R() * 0.55 - rr * 0.3, Math.sin(a) * rr);
    b.rotation.set(R() * 3, R() * 3, 0);
  }
  ch.position.set(-1.3, 0.23, 0.9);
  root.add(ch);
  // falling petals
  const petalMat = M(0xffb7d0, 0.6);
  const petalGeo = new THREE.CircleGeometry(0.03, 5);
  for (let i = 0; i < 60; i++) {
    const a = R() * Math.PI * 2, rr = 0.1 + R() * 0.9;
    const p = new THREE.Mesh(petalGeo, petalMat);
    const py = R() < 0.3 ? 0.27 : 0.3 + R() * 1.1;
    p.position.set(-1.3 + Math.cos(a) * rr * 1.1, py, 0.9 + Math.sin(a) * rr * 1.1);
    p.rotation.set(-Math.PI / 2 + (R() - 0.5), R() * 3, R() * 3);
    p.material.side = THREE.DoubleSide;
    root.add(p);
  }

  // Raked gravel ridges on front slab
  const ridge = M(0xf4f2ea);
  for (let i = 0; i < 5; i++) {
    add(root, new THREE.BoxGeometry(1.5, 0.012, 0.03), ridge, 0.0, 0.258, 1.2 + i * 0.1 - 0.0);
  }

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = o.receiveShadow = true;
    }
  });
  return root;
}
```