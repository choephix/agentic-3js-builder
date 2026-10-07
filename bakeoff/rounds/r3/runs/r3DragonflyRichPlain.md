```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Dragonfly",
  description: "Hovering emperor dragonfly with blue segmented abdomen, green thorax, turquoise eyes and veined glassy wings over a small pond disc.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function wingTexture(len: number, wid: number, seed: number) {
  const r = rng(seed);
  const W = 512, H = Math.round(512 * wid / len) + 16;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, W, H);
  g.strokeStyle = "rgba(30,25,15,0.85)";
  // longitudinal veins
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = (i + 0.5) / n * H;
    g.lineWidth = i === 0 ? 4 : 1.6;
    g.beginPath();
    g.moveTo(0, H * 0.1 + i * 3);
    g.quadraticCurveTo(W * 0.5, y, W, H * 0.25 + (y / H) * H * 0.55);
    g.stroke();
  }
  // cross veins net
  g.lineWidth = 0.9;
  for (let x = 6; x < W; x += 11) {
    for (let k = 0; k < 6; k++) {
      const y0 = r() * H;
      g.beginPath();
      g.moveTo(x + r() * 6, y0);
      g.lineTo(x + r() * 8, y0 + 10 + r() * 22);
      g.stroke();
    }
  }
  // pterostigma
  g.fillStyle = "rgba(60,35,10,0.95)";
  g.fillRect(W * 0.86, 2, 20, 12);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const M = (color: number, rough = 0.5, metal = 0, extra: any = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: true, ...extra });
  const blue = M(0x1478ff, 0.35, 0.2);
  const black = M(0x0c0c14, 0.5);
  const green = M(0x8bd62a, 0.5);
  const eyeM = M(0x18d6c8, 0.2, 0.3);
  const dark = M(0x1a1a1a, 0.6);
  const legM = M(0x2a1e14, 0.7);
  const water = M(0x2c6b6e, 0.15, 0.3, { transparent: true, opacity: 0.9 });
  const pad = M(0x3f8a3a, 0.8);
  const flower = M(0xf5f0e0, 0.8);

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], s = [1, 1, 1], rot = [0, 0, 0], parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(m);
    return m;
  };

  const H = 1.0; // hover height of body centre
  const body = new THREE.Group();
  body.position.set(0, H, 0);
  root.add(body);

  // Thorax
  add(new THREE.IcosahedronGeometry(0.03, 1), green, [0, 0, 0], [1, 0.95, 1.4], [0, 0, 0], body);
  // dark stripes on thorax
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.003, 0.04, 0.012), black, [sx * 0.027, 0.004, 0.006], [1, 1, 1], [0, 0, sx * 0.2], body);
    add(new THREE.BoxGeometry(0.003, 0.04, 0.012), black, [sx * 0.026, 0.004, -0.014], [1, 1, 1], [0, 0, sx * 0.2], body);
  }
  // Head
  add(new THREE.BoxGeometry(0.03, 0.02, 0.016), dark, [0, 0.003, 0.058], [1, 1, 1], [0, 0, 0], body);
  add(new THREE.BoxGeometry(0.02, 0.012, 0.012), green, [0, 0.003, 0.068], [1, 1, 1], [0, 0, 0], body);
  for (const sx of [-1, 1]) {
    add(new THREE.IcosahedronGeometry(0.019, 1), eyeM, [sx * 0.014, 0.008, 0.062], [1, 1, 1.05], [0, 0, 0], body);
    add(new THREE.IcosahedronGeometry(0.006, 0), dark, [sx * 0.022, 0.012, 0.072], [1, 1, 1], [0, 0, 0], body);
  }

  // Abdomen: 10 segments
  const segs = 10;
  let z = -0.04;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const r = i < 2 ? 0.016 - i * 0.002 : 0.011 - t * 0.003;
    const len = 0.0175;
    z -= len / 2;
    const seg = add(new THREE.CylinderGeometry(r, r * 1.05, len * 1.02, 8), i === 0 ? green : blue, [0, -0.002 - t * 0.004, z], [1, 1, 1], [Math.PI / 2, 0, 0], body);
    if (i > 0) {
      // black dorsal marking
      add(new THREE.BoxGeometry(r * 0.9, 0.002, len * 0.6), black, [0, -0.002 - t * 0.004 + r * 0.98, z], [1, 1, 1], [0, 0, 0], body);
      add(new THREE.BoxGeometry(r * 2.1, r * 0.25, 0.0025), black, [0, -0.002 - t * 0.004 + r * 0.1, z - len / 2 + 0.0005], [1, 1, 1], [0, 0, 0], body);
    }
    z -= len / 2;
  }
  // cerci
  for (const sx of [-1, 1]) {
    add(new THREE.ConeGeometry(0.0025, 0.022, 4), black, [sx * 0.005, -0.04 + 0.0, z - 0.01], [1, 1, 1], [-Math.PI / 2, 0, sx * 0.1], body);
  }

  // Legs tucked under
  for (let i = 0; i < 3; i++) {
    for (const sx of [-1, 1]) {
      const zz = 0.016 - i * 0.014;
      const up = new THREE.Group();
      up.position.set(sx * 0.014, -0.019, zz);
      body.add(up);
      add(new THREE.CylinderGeometry(0.0013, 0.0013, 0.026, 4), legM, [sx * 0.007, -0.006, 0.004], [1, 1, 1], [0.3, 0, sx * 0.7], up);
      add(new THREE.CylinderGeometry(0.0011, 0.001, 0.026, 4), legM, [sx * 0.016, -0.018, 0.012], [1, 1, 1], [-0.7, 0, -sx * 0.3], up);
    }
  }

  // Wings
  const wl = 0.46 * 0.2 * 2.2; // ~0.2 length
  const wlen = 0.2, wwid = 0.034;
  const wingMats: THREE.Material[] = [];
  const wingGeo = (hw: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(wlen * 0.4, wwid * 0.55);
    sh.lineTo(wlen, wwid * 0.45);
    sh.lineTo(wlen * 1.0, wwid * 0.1);
    sh.lineTo(wlen * 0.8, -wwid * 0.45 * hw);
    sh.lineTo(wlen * 0.3, -wwid * 0.55 * hw);
    sh.lineTo(0, -wwid * 0.25 * hw);
    sh.closePath();
    const g = new THREE.ShapeGeometry(sh);
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, pos.getX(i) / wlen, (pos.getY(i) + wwid * 0.6) / (wwid * 1.2));
    }
    return g;
  };
  let seed = 11;
  const makeWing = (sx: number, zPos: number, hw: number, sweep: number) => {
    const tex = wingTexture(wlen, wwid * 1.2, seed++);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, opacity: 0.9, color: 0xfff3cf,
      roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false,
      emissive: 0x6a4a10, emissiveIntensity: 0.12,
    });
    wingMats.push(mat);
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.015, 0.02, zPos);
    // flat: wing shape in XY -> rotate to XZ plane
    const m = new THREE.Mesh(wingGeo(hw), mat);
    m.rotation.x = -Math.PI / 2;
    pivot.add(m);
    if (sx < 0) pivot.scale.x = -1;
    pivot.rotation.y = sx * sweep;
    pivot.rotation.z = sx * 0.04;
    body.add(pivot);
    // leading edge vein bar
    add(new THREE.BoxGeometry(wlen * 0.97, 0.0012, 0.0015), dark, [wlen * 0.5, 0.0005, 0], [1, 1, 1], [0, 0, 0], pivot).position.z = -wwid * 0.0;
  };
  for (const sx of [-1, 1]) {
    makeWing(sx, 0.012, 0.8, 0.05);
    makeWing(sx, -0.006, 1.5, -0.08);
  }

  // Pond
  add(new THREE.CylinderGeometry(0.6, 0.6, 0.02, 20), water, [0, -0.005, 0]);
  const r = rng(5);
  for (let i = 0; i < 5; i++) {
    const a = r() * Math.PI * 2, d = 0.25 + r() * 0.25;
    const px = Math.cos(a) * d, pz = Math.sin(a) * d;
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.006, 8), pad, [px, 0.01, pz], [1, 1, 1 + r() * 0.2]);
    if (i % 2 === 0) add(new THREE.ConeGeometry(0.02, 0.03, 6), flower, [px + 0.02, 0.028, pz], [1, 1, 1]);
  }
  // reed
  for (let i = 0; i < 4; i++) {
    const a = 0.5 + i * 0.25;
    add(new THREE.CylinderGeometry(0.004, 0.006, 0.5 + i * 0.1, 5), pad, [Math.cos(a) * 0.5, 0.25 + i * 0.05, Math.sin(a) * 0.5 - 0.1]);
  }

  // Scale model up ~ real size (body ~0.08m long); lift so pond sits at floor
  root.position.y = 0.0;
  return root;
}
```