```ts
import * as THREE from "three";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly treehouse: a plank cabin with a shingled gable roof, round window, teal door and shutters, built on a braced deck around a thick oak. The scene adds a leaning ladder, a rope swing, a bucket pulley, bunting, a lantern, a stovepipe, and a grassy base with mushrooms, rocks and flowers.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rng = makeRng(1337);

  // ---------- textures ----------
  const plankTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#c98b4f";
    g.fillRect(0, 0, 256, 256);
    const r = makeRng(7);
    for (let i = 0; i < 8; i++) {
      const y = i * 32;
      g.fillStyle = i % 2 ? "#c2834a" : "#cf9457";
      g.fillRect(0, y, 256, 32);
      g.strokeStyle = "rgba(110,65,30,0.35)";
      g.lineWidth = 1;
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        const yy = y + 6 + r() * 20;
        g.moveTo(0, yy);
        g.bezierCurveTo(80, yy + r() * 6 - 3, 170, yy + r() * 6 - 3, 256, yy);
        g.stroke();
      }
      g.fillStyle = "#7a4a24";
      g.fillRect(0, y + 30, 256, 2);
      g.fillStyle = "#5a3418";
      const nx = ((i * 97) % 200) + 20;
      g.fillRect(nx, y + 8, 3, 3);
      g.fillRect(nx, y + 22, 3, 3);
    }
  });

  const barkTex = canvasTex(128, 256, (g) => {
    g.fillStyle = "#6b4a32";
    g.fillRect(0, 0, 128, 256);
    const r = makeRng(21);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = r() > 0.5 ? "#4a3222" : "#7d5a3e";
      g.lineWidth = 2 + r() * 3;
      const x = r() * 128;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (r() - 0.5) * 12, 128);
      g.lineTo(x + (r() - 0.5) * 12, 256);
      g.stroke();
    }
  });

  const shingleTex = canvasTex(256, 256, (g) => {
    g.fillStyle = "#c8462f";
    g.fillRect(0, 0, 256, 256);
    const rows = 8;
    const rh = 256 / rows;
    for (let row = 0; row < rows; row++) {
      const off = row % 2 ? 16 : 0;
      for (let x = -32 + off; x < 288; x += 32) {
        g.fillStyle = (row + Math.floor(x / 32)) % 3 === 0 ? "#b63c27" : "#d0503a";
        g.beginPath();
        g.moveTo(x, row * rh);
        g.lineTo(x + 32, row * rh);
        g.lineTo(x + 32, row * rh + rh * 0.6);
        g.quadraticCurveTo(x + 16, row * rh + rh * 1.15, x, row * rh + rh * 0.6);
        g.closePath();
        g.fill();
        g.strokeStyle = "#7e2516";
        g.lineWidth = 2;
        g.stroke();
      }
    }
  });
  if (shingleTex) shingleTex.repeat.set(2, 1.5);

  const signTex = canvasTex(256, 96, (g) => {
    g.fillStyle = "#e9d3a6";
    g.fillRect(0, 0, 256, 96);
    g.strokeStyle = "#7a4a24";
    g.lineWidth = 6;
    g.strokeRect(4, 4, 248, 88);
    g.fillStyle = "#2f6f6a";
    g.font = "bold 44px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("TREE CLUB", 128, 50);
  });

  // ---------- materials ----------
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  const mWall = std({ color: plankTex ? 0xffffff : 0xc98b4f, map: plankTex, roughness: 0.85 });
  const mBark = std({ color: barkTex ? 0xffffff : 0x6b4a32, map: barkTex, roughness: 0.95, flatShading: true });
  const mRoof = std({ color: shingleTex ? 0xffffff : 0xc8462f, map: shingleTex, roughness: 0.8 });
  const mSign = std({ color: signTex ? 0xffffff : 0xe9d3a6, map: signTex, roughness: 0.8 });
  const mDeckA = std({ color: 0xa0673a, roughness: 0.9 });
  const mDeckB = std({ color: 0x8c5530, roughness: 0.9 });
  const mBeam = std({ color: 0x6e4226, roughness: 0.9 });
  const mTrim = std({ color: 0xf1e3c4, roughness: 0.7 });
  const mTeal = std({ color: 0x2f8f8a, roughness: 0.6 });
  const mTealDark = std({ color: 0x23706b, roughness: 0.6 });
  const mGlass = std({ color: 0xffd98a, emissive: 0xffb84a, emissiveIntensity: 0.55, roughness: 0.3 });
  const mBrass = std({ color: 0xd9a63a, metalness: 0.7, roughness: 0.35 });
  const mIron = std({ color: 0x3a3a40, metalness: 0.6, roughness: 0.5 });
  const mRope = std({ color: 0xd8c08a, roughness: 1 });
  const mRidge = std({ color: 0x8e2c1e, roughness: 0.7 });
  const mLeaf1 = std({ color: 0x3f9a3c, roughness: 0.85, flatShading: true });
  const mLeaf2 = std({ color: 0x5cb84a, roughness: 0.85, flatShading: true });
  const mLeaf3 = std({ color: 0x2c7a35, roughness: 0.85, flatShading: true });
  const mApple = std({ color: 0xe0332b, roughness: 0.5 });
  const mGrass = std({ color: 0x6fbf4a, roughness: 0.95, flatShading: true });
  const mGrassDark = std({ color: 0x4a9a3a, roughness: 0.95, flatShading: true });
  const mDirt = std({ color: 0x7a5636, roughness: 1, flatShading: true });
  const mRock = std({ color: 0x9a9a92, roughness: 0.9, flatShading: true });
  const mStone = std({ color: 0xb8b2a2, roughness: 0.9, flatShading: true });
  const mMushCap = std({ color: 0xd8342c, roughness: 0.6 });
  const mWhite = std({ color: 0xfaf6ea, roughness: 0.6 });
  const mPink = std({ color: 0xf07ab0, roughness: 0.7 });
  const mYellow = std({ color: 0xf5cf3a, roughness: 0.7 });
  const mPurple = std({ color: 0x8a5ad0, roughness: 0.7 });
  const mBlue = std({ color: 0x3f7fd8, roughness: 0.7 });
  const mDark = std({ color: 0x2a1a10, roughness: 1 });
  const mBird = std({ color: 0x2f6fd0, roughness: 0.6 });
  const mBeak = std({ color: 0xf3a330, roughness: 0.6 });
  const mBucket = std({ color: 0x8a96a0, metalness: 0.5, roughness: 0.45 });

  // ---------- helpers ----------
  const add = (geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x: number, y: number, z: number, parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };
  const box = (w: number, h: number, d: number, m: THREE.Material | THREE.Material[], x: number, y: number, z: number) =>
    add(new THREE.BoxGeometry(w, h, d), m, x, y, z);
  const UP = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, m: THREE.Material, seg = 6) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const me = add(new THREE.CylinderGeometry(r2, r1, len, seg), m, 0, 0, 0);
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(UP, d.normalize());
    return me;
  };
  const plank = (a: THREE.Vector3, b: THREE.Vector3, w: number, t: number, m: THREE.Material) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const me = add(new THREE.BoxGeometry(w, len, t), m, 0, 0, 0);
    me.position.copy(a).add(b).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(UP, d.normalize());
    return me;
  };

  // ---------- ground ----------
  add(new THREE.CylinderGeometry(4.2, 4.35, 0.12, 14), mGrass, 0, 0.06, 0);
  add(new THREE.CylinderGeometry(4.36, 4.2, 0.1, 14), mDirt, 0, -0.03, 0);
  // stepping stones
  [[1.0, 3.35], [0.7, 3.85], [0.95, 3.0 + 1.4]].forEach(([x, z], i) => {
    const s = add(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 7), mStone, x, 0.13, z);
    s.rotation.y = i;
  });
  // rocks
  [[-2.6, 1.8, 0.3], [-3.0, 1.2, 0.18], [2.9, -2.0, 0.35], [-1.8, -2.9, 0.25]].forEach(([x, z, r]) => {
    const rk = add(new THREE.DodecahedronGeometry(r, 0), mRock, x, 0.1 + r * 0.4, z);
    rk.scale.set(1.2, 0.7, 1);
    rk.rotation.y = x;
  });
  // mushrooms
  const mushroom = (x: number, z: number, s: number) => {
    add(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.22 * s, 6), mWhite, x, 0.12 + 0.11 * s, z);
    add(new THREE.SphereGeometry(0.16 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mMushCap, x, 0.12 + 0.2 * s, z);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + x;
      add(new THREE.SphereGeometry(0.025 * s, 4, 3), mWhite, x + Math.cos(a) * 0.1 * s, 0.12 + 0.31 * s, z + Math.sin(a) * 0.1 * s);
    }
  };
  mushroom(-0.75, 0.55, 1.2);
  mushroom(-0.95, 0.35, 0.8);
  mushroom(0.6, -0.7, 1.0);
  // grass tufts
  for (let i = 0; i < 40; i++) {
    const a = rng() * Math.PI * 2;
    const r = 0.8 + rng() * 3.2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    for (let k = 0; k < 3; k++) {
      const c = add(new THREE.ConeGeometry(0.04, 0.22 + rng() * 0.12, 3), k % 2 ? mGrass : mGrassDark, x + (rng() - 0.5) * 0.12, 0.2, z + (rng() - 0.5) * 0.12);
      c.rotation.set((rng() - 0.5) * 0.5, rng() * 3, (rng() - 0.5) * 0.5);
    }
  }
  // flowers
  const flowerMats = [mPink, mYellow, mWhite, mPurple];
  for (let i = 0; i < 18; i++) {
    const a = rng() * Math.PI * 2;
    const r = 1.4 + rng() * 2.6;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = 0.18 + rng() * 0.15;
    add(new THREE.CylinderGeometry(0.012, 0.012, h, 4), mGrassDark, x, 0.12 + h / 2, z);
    add(new THREE.IcosahedronGeometry(0.06, 0), flowerMats[i % 4], x, 0.12 + h, z);
    add(new THREE.SphereGeometry(0.025, 4, 3), mYellow, x, 0.12 + h + 0.04, z);
  }

  // ---------- tree ----------
  const trunk = add(new THREE.CylinderGeometry(0.28, 0.45, 7.0, 9), mBark, 0, 3.5, 0);
  trunk.rotation.y = 0.3;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const d = V(Math.cos(a), 0, Math.sin(a));
    rod(V(d.x * 0.25, 0.7, d.z * 0.25), V(d.x * (1.0 + (i % 2) * 0.3), 0.08, d.z * (1.0 + (i % 2) * 0.3)), 0.2, 0.05, mBark, 6);
  }
  // knot hole with glowing eyes
  const knot = add(new THREE.SphereGeometry(0.13, 8, 6), mDark, 0.05, 1.5, 0.4);
  knot.scale.set(0.8, 1.2, 0.4);
  add(new THREE.SphereGeometry(0.025, 5, 4), mYellow, 0.0, 1.53, 0.45);
  add(new THREE.SphereGeometry(0.025, 5, 4), mYellow, 0.1, 1.53, 0.45);

  // canopy
  const clusters: [number, number, number, number][] = [
    [0, 7.7, -0.1, 2.0],
    [1.7, 7.1, 0.5, 1.4],
    [-1.7, 7.1, 0.2, 1.5],
    [0.3, 7.0, -1.7, 1.4],
    [-0.6, 8.9, -0.3, 1.3],
    [0.9, 8.7, 0.5, 1.2],
    [3.1, 6.9, 1.4, 1.0],
    [-0.3, 7.0, 1.7, 1.2],
    [-2.4, 6.6, -1.1, 1.0],
  ];
  const leafMats = [mLeaf1, mLeaf2, mLeaf3];
  clusters.forEach(([x, y, z, r], i) => {
    rod(V(0, 6.0, 0), V(x * 0.8, y - r * 0.4, z * 0.8), 0.18, 0.08, mBark, 6);
    const c = add(new THREE.IcosahedronGeometry(r, 1), leafMats[i % 3], x, y, z);
    c.rotation.set(i, i * 2, 0);
    const n = Math.round(r * 4);
    for (let k = 0; k < n; k++) {
      const d = V(rng() - 0.5, rng() * 0.9 - 0.25, rng() - 0.5).normalize();
      const br = r * (0.35 + rng() * 0.15);
      const b = add(new THREE.IcosahedronGeometry(br, 0), leafMats[(i + k + 1) % 3], x + d.x * r * 0.85, y + d.y * r * 0.85, z + d.z * r * 0.85);
      b.rotation.set(rng() * 3, rng() * 3, 0);
    }
    for (let k = 0; k < 2; k++) {
      const a = rng() * Math.PI * 2;
      const d = V(Math.cos(a), -0.2 - rng() * 0.3, Math.sin(a)).normalize();
      add(new THREE.SphereGeometry(0.09, 6, 4), mApple, x + d.x * r * 1.0, y + d.y * r * 1.0, z + d.z * r * 1.0);
    }
  });

  // ---------- platform ----------
  const P = 3.0;
  const deckZ0 = -1.1, deckZ1 = 2.1;
  let bi = 0;
  for (let z = deckZ0 + 0.125; z < deckZ1; z += 0.25) {
    box(3.4 + (bi % 3 === 0 ? 0.08 : 0), 0.1, 0.235, bi % 2 ? mDeckA : mDeckB, (bi % 3) * 0.02 - 0.02, P - 0.05, z);
    bi++;
  }
  [-1.5, -0.5, 0.5, 1.5].forEach((x) => box(0.12, 0.18, 3.2, mBeam, x, P - 0.19, 0.5));
  [deckZ0 + 0.1, deckZ1 - 0.1].forEach((z) => box(3.5, 0.2, 0.15, mBeam, 0, P - 0.2, z));
  // braces
  const braceEnds: [number, number][] = [[-1.5, -1.0], [1.5, -1.0], [-1.5, 2.0], [1.5, 2.0]];
  braceEnds.forEach(([x, z]) => {
    const d = V(x, 0, z).normalize();
    plank(V(d.x * 0.38, 1.9, d.z * 0.38), V(x * 0.95, P - 0.25, z * 0.95), 0.12, 0.12, mBeam);
  });
  // front posts
  [-1.6, 1.6].forEach((x) => {
    box(0.16, P - 0.1, 0.16, mBeam, x, (P - 0.1) / 2 + 0.05, 2.0);
    add(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 6), mStone, x, 0.14, 2.0);
  });

  // ---------- cabin ----------
  const W = 2.4, D = 1.8, H = 1.75, Tp = P + H;
  box(W, H, 0.1, mWall, 0, P + H / 2, D / 2 - 0.05);
  box(W, H, 0.1, mWall, 0, P + H / 2, -D / 2 + 0.05);
  box(0.1, H, D, mWall, W / 2 - 0.05, P + H / 2, 0);
  box(0.1, H, D, mWall, -W / 2 + 0.05, P + H / 2, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.14, H, 0.14, mTrim, sx * W / 2, P + H / 2, sz * D / 2);
  box(W + 0.1, 0.1, 0.06, mTrim, 0, P + 0.05, D / 2 + 0.02);
  box(W + 0.1, 0.08, 0.06, mTrim, 0, Tp - 0.04, D / 2 + 0.02);

  // door
  const dx = 0.5, dw = 0.7, dh = 1.35;
  box(dw, dh, 0.06, mTeal, dx, P + dh / 2 + 0.02, D / 2 + 0.03);
  box(dw - 0.1, 0.08, 0.04, mTealDark, dx, P + 0.3, D / 2 + 0.07);
  box(dw - 0.1, 0.08, 0.04, mTealDark, dx, P + 1.1, D / 2 + 0.07);
  plank(V(dx - 0.25, P + 0.32, D / 2 + 0.075), V(dx + 0.25, P + 1.08, D / 2 + 0.075), 0.07, 0.035, mTealDark);
  box(0.08, dh + 0.1, 0.08, mTrim, dx - dw / 2 - 0.04, P + (dh + 0.1) / 2, D / 2 + 0.04);
  box(0.08, dh + 0.1, 0.08, mTrim, dx + dw / 2 + 0.04, P + (dh + 0.1) / 2, D / 2 + 0.04);
  box(dw + 0.16, 0.08, 0.08, mTrim, dx, P + dh + 0.08, D / 2 + 0.04);
  add(new THREE.SphereGeometry(0.04, 6, 4), mBrass, dx - 0.22, P + 0.7, D / 2 + 0.09);
  // little star on door
  const star = add(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 5), mYellow, dx, P + 0.75, D / 2 + 0.08);
  star.rotation.x = Math.PI / 2;

  // round window
  const wx = -0.55, wy = P + 1.05, wz = D / 2 + 0.03;
  const glass = add(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12), mGlass, wx, wy, wz);
  glass.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.32, 0.055, 6, 12), mTrim, wx, wy, wz + 0.02);
  box(0.6, 0.04, 0.03, mTrim, wx, wy, wz + 0.03);
  box(0.04, 0.6, 0.03, mTrim, wx, wy, wz + 0.03);

  // side windows with shutters
  for (const sx of [-1, 1]) {
    const x = sx * (W / 2 + 0.02);
    box(0.04, 0.55, 0.6, mGlass, x, P + 1.0, 0);
    box(0.06, 0.04, 0.64, mTrim, x + sx * 0.02, P + 1.0, 0);
    box(0.06, 0.55, 0.04, mTrim, x + sx * 0.02, P + 1.0, 0);
    box(0.08, 0.08, 0.74, mTrim, x + sx * 0.02, P + 1.31, 0);
    box(0.08, 0.08, 0.74, mTrim, x + sx * 0.02, P + 0.69, 0);
    for (const sz of [-1, 1]) {
      box(0.05, 0.62, 0.3, mTeal, x + sx * 0.02, P + 1.0, sz * 0.52);
      box(0.06, 0.04, 0.24, mTealDark, x + sx * 0.04, P + 1.15, sz * 0.52);
      box(0.06, 0.04, 0.24, mTealDark, x + sx * 0.04, P + 0.85, sz * 0.52);
    }
    // flower box
    box(0.18, 0.16, 0.7, mBeam, sx * (W / 2 + 0.11), P + 0.6, 0);
    for (let k = 0; k < 5; k++) {
      const z = -0.28 + k * 0.14;
      add(new THREE.IcosahedronGeometry(0.07, 0), mLeaf2, sx * (W / 2 + 0.11), P + 0.7, z);
      add(new THREE.IcosahedronGeometry(0.05, 0), [mPink, mYellow, mPurple, mWhite, mBlue][k], sx * (W / 2 + 0.13), P + 0.77, z + 0.03);
    }
  }

  // roof
  const rise = 0.85, half = D / 2, over = 0.32;
  const a = Math.atan2(rise, half);
  const Lp = Math.sqrt(half * half + rise * rise) + over;
  const ridgeY = Tp + rise;
  for (const s of [1, -1]) {
    const rp = box(W + 0.5, 0.1, Lp, mRoof, 0, 0, 0);
    rp.rotation.x = s * a;
    rp.position.set(0, ridgeY - Math.sin(a) * Lp / 2 + Math.cos(a) * 0.05, s * (Math.cos(a) * Lp / 2 + Math.sin(a) * 0.05));
    // fascia trim along the eave
    const eaveY = ridgeY - Math.sin(a) * Lp;
    const eaveZ = s * Math.cos(a) * Lp;
    box(W + 0.54, 0.08, 0.08, mTrim, 0, eaveY + 0.02, eaveZ);
  }
  const ridge = box(W + 0.6, 0.12, 0.2, mRidge, 0, ridgeY + 0.1, 0);
  ridge.rotation.x = Math.PI / 4;
  const tri = new THREE.Shape();
  tri.moveTo(-half, 0);
  tri.lineTo(half, 0);
  tri.lineTo(0, rise);
  tri.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
  for (const sx of [-1, 1]) {
    const g = add(gableGeo, mWall, sx > 0 ? W / 2 - 0.1 : -W / 2, Tp, 0);
    g.rotation.y = Math.PI / 2;
    // little attic vent
    const v = add(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 3), mDark, sx * (W / 2 + 0.01), Tp + 0.32, 0);
    v.rotation.z = Math.PI / 2;
  }
  // stovepipe
  {
    const sx = -0.75, sz = -0.5;
    const ry = ridgeY - Math.tan(a) * Math.abs(sz);
    add(new THREE.CylinderGeometry(0.08, 0.08, 0.95, 8), mIron, sx, ry + 0.38, sz);
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), mIron, sx, ry + 0.2, sz);
    add(new THREE.ConeGeometry(0.16, 0.14, 8), mIron, sx, ry + 0.95, sz);
    // smoke puffs
    [[0.0, 1.25, 0.1], [0.12, 1.55, 0.13], [0.3, 1.9, 0.16]].forEach(([ox, oy, r]) =>
      add(new THREE.IcosahedronGeometry(r, 0), mWhite, sx + ox, ry + oy, sz - ox * 0.5)
    );
  }
  // bird on the ridge
  {
    const bx = 0.85, by = ridgeY + 0.22;
    const body = add(new THREE.SphereGeometry(0.1, 8, 6), mBird, bx, by, 0);
    body.scale.set(1, 0.9, 1.3);
    add(new THREE.SphereGeometry(0.07, 8, 6), mBird, bx, by + 0.09, 0.09);
    const beak = add(new THREE.ConeGeometry(0.025, 0.07, 4), mBeak, bx, by + 0.09, 0.18);
    beak.rotation.x = Math.PI / 2;
    add(new THREE.SphereGeometry(0.015, 4, 3), mDark, bx + 0.05, by + 0.11, 0.13);
    add(new THREE.SphereGeometry(0.015, 4, 3), mDark, bx - 0.05, by + 0.11, 0.13);
    const tail = box(0.08, 0.02, 0.14, mBird, bx, by + 0.03, -0.17);
    tail.rotation.x = -0.4;
  }

  // ---------- railing ----------
  const railH = 0.9;
  const frontPosts = [-1.6, -1.0, -0.4, 0.2, 0.75];
  frontPosts.forEach((x) => box(0.08, railH, 0.08, mBeam, x, P + railH / 2, 2.02));
  box(2.45, 0.07, 0.1, mDeckA, -0.425, P + railH, 2.02);
  box(2.35, 0.05, 0.05, mDeckB, -0.425, P + 0.45, 2.02);
  // balusters
  for (let x = -1.45; x < 0.7; x += 0.15) box(0.03, railH - 0.05, 0.03, mTrim, x, P + (railH - 0.05) / 2, 2.02);
  for (const sx of [-1, 1]) {
    const x = sx * 1.62;
    [1.0, 1.5, 2.02].forEach((z) => box(0.08, railH, 0.08, mBeam, x, P + railH / 2, z));
    box(0.1, 0.07, 1.15, mDeckA, x, P + railH, 1.48);
    for (let z = 1.12; z < 2.0; z += 0.15) box(0.03, railH - 0.05, 0.03, mTrim, x, P + (railH - 0.05) / 2, z);
  }
  // sign
  {
    const s = box(0.9, 0.32, 0.04, [mDeckA, mDeckA, mDeckA, mDeckA, mSign, mDeckA], -0.6, P + 0.62, 2.08);
    s.rotation.z = 0.04;
  }

  // ---------- ladder ----------
  const lx = 1.17;
  const lad = (y: number) => 2.95 - (0.9 / (P + 0.5)) * y;
  for (const o of [-0.24, 0.24]) plank(V(lx + o, 0.1, lad(0.1)), V(lx + o, P + 0.55, lad(P + 0.55)), 0.07, 0.07, mBeam);
  for (let y = 0.35; y < P; y += 0.3) {
    const r = add(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), mDeckA, lx, y, lad(y));
    r.rotation.z = Math.PI / 2;
  }

  // ---------- rope swing ----------
  {
    const A = V(0.2, 5.8, 0.1), B = V(3.1, 6.7, 1.3);
    rod(A, B, 0.15, 0.07, mBark, 6);
    const p1 = A.clone().lerp(B, 0.7), p2 = A.clone().lerp(B, 0.86);
    const seatY = 0.62;
    for (const p of [p1, p2]) {
      rod(V(p.x, seatY, p.z), V(p.x, p.y, p.z), 0.018, 0.018, mRope, 4);
      add(new THREE.TorusGeometry(0.07, 0.02, 4, 8), mRope, p.x, p.y - 0.02, p.z);
    }
    const seat = box(0.7, 0.05, 0.22, mDeckA, (p1.x + p2.x) / 2, seatY, (p1.z + p2.z) / 2);
    seat.rotation.y = -Math.atan2(p2.z - p1.z, p2.x - p1.x);
  }

  // ---------- bucket pulley ----------
  {
    const px = -1.62, pz = 1.0, top = P + 1.6;
    box(0.09, top - P - railH, 0.09, mBeam, px, P + railH + (top - P - railH) / 2, pz);
    box(0.85, 0.09, 0.09, mBeam, px - 0.4, top, pz);
    plank(V(px, top - 0.4, pz), V(px - 0.4, top - 0.02, pz), 0.06, 0.06, mBeam);
    const wheel = add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), mIron, px - 0.72, top - 0.12, pz);
    wheel.rotation.x = Math.PI / 2;
    rod(V(px - 0.82, 1.62, pz), V(px - 0.82, top - 0.12, pz), 0.012, 0.012, mRope, 4);
    rod(V(px - 0.62, P + 0.9, pz), V(px - 0.62, top - 0.12, pz), 0.012, 0.012, mRope, 4);
    add(new THREE.CylinderGeometry(0.17, 0.13, 0.28, 8), mBucket, px - 0.82, 1.32, pz);
    add(new THREE.TorusGeometry(0.17, 0.015, 4, 10), mIron, px - 0.82, 1.46, pz).rotation.x = Math.PI / 2;
    const handle = add(new THREE.TorusGeometry(0.16, 0.012, 4, 8, Math.PI), mIron, px - 0.82, 1.46, pz);
    handle.rotation.y = 0;
    add(new THREE.IcosahedronGeometry(0.07, 0), mApple, px - 0.86, 1.48, pz + 0.03);
    add(new THREE.IcosahedronGeometry(0.07, 0), mApple, px - 0.76, 1.47, pz - 0.04);
  }

  // ---------- lantern ----------
  {
    const lx2 = -1.05, ly = Tp - 0.05, lz = 1.12;
    rod(V(lx2, ly - 0.2, lz), V(lx2, ly + 0.05, lz), 0.01, 0.01, mIron, 4);
    add(new THREE.BoxGeometry(0.16, 0.2, 0.16), mGlass, lx2, ly - 0.32, lz);
    const cap = add(new THREE.ConeGeometry(0.15, 0.12, 4), mIron, lx2, ly - 0.17, lz);
    cap.rotation.y = Math.PI / 4;
    box(0.2, 0.03, 0.2, mIron, lx2, ly - 0.43, lz);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.02, 0.2, 0.02, mIron, lx2 + sx * 0.08, ly - 0.32, lz + sz * 0.08);
  }

  // ---------- bunting ----------
  {
    const s = V(1.4, Tp - 0.12, 1.15), e = V(-1.6, P + railH + 0.05, 2.02);
    const n = 10;
    let prev = s.clone();
    const flagMats = [mYellow, mTeal, mPink, mBlue, mApple];
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const p = s.clone().lerp(e, t);
      p.y -= Math.sin(t * Math.PI) * 0.25;
      rod(prev, p, 0.006, 0.006, mRope, 3);
      if (i < n) {
        const f = add(new THREE.ConeGeometry(0.08, 0.17, 3), flagMats[i % 5], p.x, p.y - 0.09, p.z);
        f.rotation.x = Math.PI;
        f.rotation.y = Math.atan2(e.x - s.x, e.z - s.z) + Math.PI / 2;
        f.scale.z = 0.25;
      }
      prev = p;
    }
  }

  return root;
}
```