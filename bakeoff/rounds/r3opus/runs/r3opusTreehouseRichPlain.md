```ts
import * as THREE from "three";

export const meta = {
  name: "Cozy Oak Treehouse Diorama",
  description:
    "A stylized low-poly diorama: an old oak on a grassy round base holding a plank cabin with a red shingle roof, a round window, a pennant flag and a glowing lantern. A rope ladder, a wooden swing, mushrooms and a little bicycle sit at the foot of the tree.",
};

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

export default function build(): THREE.Object3D {
  const rand = makeRng(1337);
  const root = new THREE.Group();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const G = 0.67; // grass top height

  // ---------- textures ----------
  const texRand = makeRng(99);
  const plankTex = makeTex(256, 256, (ctx, w, h) => {
    const rows = 8;
    const rh = h / rows;
    const tones = ["#b9824e", "#ad7646", "#c28c57", "#b37c4a"];
    for (let i = 0; i < rows; i++) {
      ctx.fillStyle = tones[i % tones.length];
      ctx.fillRect(0, i * rh, w, rh);
      ctx.strokeStyle = "rgba(90,55,25,0.35)";
      ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) {
        const y = i * rh + 4 + texRand() * (rh - 8);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1);
        ctx.stroke();
      }
      ctx.fillStyle = "#5e3a1c";
      ctx.fillRect(0, i * rh, w, 3);
      ctx.fillStyle = "#3d2614";
      ctx.fillRect(10, i * rh + rh / 2 - 2, 4, 4);
      ctx.fillRect(w - 14, i * rh + rh / 2 - 2, 4, 4);
    }
  });
  const barkTex = makeTex(128, 256, (ctx, w, h) => {
    ctx.fillStyle = "#6e4a2f";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = texRand() * w;
      ctx.strokeStyle = texRand() > 0.5 ? "#4a301d" : "#87603f";
      ctx.lineWidth = 2 + texRand() * 4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      let cx = x;
      for (let y = 0; y <= h; y += 32) {
        cx += (texRand() - 0.5) * 10;
        ctx.lineTo(cx, y);
      }
      ctx.stroke();
    }
  });
  if (barkTex) barkTex.repeat.set(3, 1);
  const grassTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#6cae45";
    ctx.fillRect(0, 0, w, h);
    const cols = ["#5c9c3a", "#7dbd52", "#4f8c33", "#8ccb5c"];
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(texRand() * w, texRand() * h, 2 + texRand() * 4, 2 + texRand() * 4);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = texRand() > 0.5 ? "#fff6d8" : "#f6d24a";
      ctx.beginPath();
      ctx.arc(texRand() * w, texRand() * h, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ---------- materials ----------
  const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...o });
  const texMat = (t: THREE.Texture | null, fallback: number) =>
    new THREE.MeshStandardMaterial({ color: t ? 0xffffff : fallback, map: t, roughness: 0.9, flatShading: true });

  const mPlank = texMat(plankTex, 0xb9824e);
  const mBark = texMat(barkTex, 0x6e4a2f);
  const mGrass = texMat(grassTex, 0x6cae45);
  const mGrassSide = std(0x5a9a3a);
  const mDirt = std(0x7a5233);
  const mDirtDark = std(0x5a3b24);
  const mStone = std(0x9a9a92);
  const mStoneDark = std(0x76766f);
  const mWoodDark = std(0x6b4423);
  const mWoodLight = std(0xc99a62);
  const mDeckA = std(0xa8743f);
  const mDeckB = std(0x96663a);
  const mCream = std(0xf1e4c6);
  const mTeal = std(0x2f8a8c);
  const mRedA = std(0xb8322a);
  const mRedB = std(0x9c2924);
  const mRedC = std(0xcc4636);
  const mRidge = std(0x7a2320);
  const mGlow = std(0xffc861, { emissive: 0xffa531, emissiveIntensity: 1.3, roughness: 0.4 });
  const mGlass = std(0xffe2a0, { emissive: 0xffb347, emissiveIntensity: 0.7, roughness: 0.3 });
  const mIron = std(0x2d2b2a, { metalness: 0.5, roughness: 0.5 });
  const mBrass = std(0xd6a83a, { metalness: 0.6, roughness: 0.35 });
  const mRope = std(0xd9bf86);
  const mLeafDark = std(0x2f6232);
  const mLeafMid = std(0x47863a);
  const mLeafLight = std(0x6fb247);
  const mYellow = std(0xf2c230);
  const mMushRed = std(0xd23b2f);
  const mMushBrown = std(0xa8693a);
  const mStem = std(0xf4ead2);
  const mBike = std(0x3b8fd0, { roughness: 0.5, metalness: 0.2 });
  const mTire = std(0x232323);
  const mSilver = std(0xc8ccd0, { metalness: 0.6, roughness: 0.35 });
  const mWicker = std(0xc79a55);
  const mPink = std(0xf28ab0);
  const mWhite = std(0xfaf7ee);
  const mSmoke = std(0xe9ecef, { roughness: 1 });
  const mChimney = std(0x8d6e63);

  // ---------- helpers ----------
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, p: THREE.Object3D = root) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
  const up = V(0, 1, 0);
  const cylBetween = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r1: number,
    r2: number,
    mat: THREE.Material,
    seg = 6,
    p: THREE.Object3D = root
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, seg), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(up, dir.normalize());
    p.add(m);
    return m;
  };
  const blob = (x: number, y: number, z: number, r: number, mat: THREE.Material, detail = 1) => {
    const m = add(new THREE.IcosahedronGeometry(r, detail), mat, x, y, z);
    m.scale.set(1, 0.85, 1);
    m.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    return m;
  };

  // ---------- base ----------
  add(new THREE.CylinderGeometry(6, 5.5, 0.55, 14), mDirt, 0, 0.275, 0);
  add(new THREE.CylinderGeometry(5.84, 5.79, 0.08, 14), mDirtDark, 0, 0.3, 0);
  const grass = add(new THREE.CylinderGeometry(6.15, 6.05, 0.14, 14), mGrass, 0, 0.6, 0);
  grass.material = [mGrassSide, mGrass, mGrassSide] as unknown as THREE.Material;
  // embedded pebbles on the dirt side
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + rand() * 0.3;
    const r = 5.72;
    const s = add(new THREE.DodecahedronGeometry(0.09 + rand() * 0.07, 0), rand() > 0.5 ? mStone : mStoneDark,
      Math.cos(a) * r, 0.12 + rand() * 0.28, Math.sin(a) * r);
    s.rotation.set(rand() * 3, rand() * 3, 0);
  }
  // rim rocks
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const r = 4.9 + rand() * 0.9;
    const s = add(new THREE.DodecahedronGeometry(0.15 + rand() * 0.18, 0), rand() > 0.5 ? mStone : mStoneDark,
      Math.cos(a) * r, G + 0.05, Math.sin(a) * r);
    s.scale.y = 0.6;
    s.rotation.y = rand() * 3;
  }
  // stepping stones from ladder to front edge
  [[1.4, 3.1], [1.1, 3.8], [1.35, 4.5], [1.05, 5.2]].forEach(([x, z], i) => {
    const s = add(new THREE.CylinderGeometry(0.26, 0.28, 0.06, 7), i % 2 ? mStone : mStoneDark, x, G, z);
    s.rotation.y = rand() * 3;
  });
  // grass tufts
  const tuftGeo = new THREE.ConeGeometry(0.05, 0.32, 4);
  let tufts = 0;
  for (let n = 0; n < 200 && tufts < 26; n++) {
    const a = rand() * Math.PI * 2;
    const r = 1.4 + rand() * 4.3;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x, z + 1.2) < 1.9) continue;
    if (Math.abs(x - 1.25) < 0.45 && z > 2.6) continue;
    tufts++;
    const mat = rand() > 0.5 ? mLeafMid : mLeafLight;
    for (let k = 0; k < 3; k++) {
      const t = add(tuftGeo, mat, x + (k - 1) * 0.06, G + 0.13, z + (rand() - 0.5) * 0.06);
      t.rotation.z = (k - 1) * 0.35;
      t.rotation.x = (rand() - 0.5) * 0.3;
    }
  }
  // flowers
  const flowerCols = [mYellow, mWhite, mPink];
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const r = 2.0 + rand() * 3.6;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x, z + 1.2) < 1.9) continue;
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4), mLeafMid, x, G + 0.11, z);
    add(new THREE.IcosahedronGeometry(0.05, 0), flowerCols[i % 3], x, G + 0.24, z);
  }
  // ground bushes
  [[-4.2, -2.6, 0.7], [-3.4, -3.6, 0.55], [4.0, -2.9, 0.65], [4.6, 0.8, 0.45], [-4.7, 1.6, 0.5]].forEach(([x, z, r], i) => {
    blob(x, G + r * 0.55, z, r, i % 2 ? mLeafMid : mLeafDark, 0);
  });

  // ---------- tree ----------
  const trunkZ = -1.2;
  const trunk = add(new THREE.CylinderGeometry(0.72, 1.05, 5.4, 9), mBark, 0, G + 2.7, trunkZ);
  trunk.rotation.y = 0.2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    cylBetween(
      V(Math.cos(a) * 0.65, G + 0.7, trunkZ + Math.sin(a) * 0.65),
      V(Math.cos(a) * 1.85, G - 0.04, trunkZ + Math.sin(a) * 1.85),
      0.38, 0.1, mBark, 6
    );
  }
  // knothole
  const knot = add(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 8), mDirtDark, 0.15, G + 1.6, trunkZ + 0.93);
  knot.rotation.x = Math.PI / 2;
  knot.scale.z = 1.4;
  const knotRim = add(new THREE.TorusGeometry(0.19, 0.05, 4, 10), mWoodDark, 0.15, G + 1.6, trunkZ + 0.95);
  knotRim.scale.y = 1.4;
  // upper trunk and limbs
  cylBetween(V(0, 5.9, trunkZ), V(0, 8.8, -1.6), 0.72, 0.4, mBark, 8);
  cylBetween(V(0, 5.6, trunkZ), V(-2.3, 8.3, -1.2), 0.5, 0.22, mBark, 7);
  cylBetween(V(0, 5.8, -1.3), V(2.4, 8.5, -1.6), 0.5, 0.22, mBark, 7);
  cylBetween(V(0, 5.9, -1.4), V(0.2, 9.0, -2.8), 0.48, 0.22, mBark, 7);
  cylBetween(V(-1.4, 7.0, -1.2), V(-3.4, 7.4, -1.8), 0.22, 0.1, mBark, 5);
  cylBetween(V(1.5, 7.3, -1.4), V(3.5, 7.6, -2.0), 0.22, 0.1, mBark, 5);
  // swing branch
  const brA = V(-0.5, 3.3, -1.0);
  const brB = V(-3.9, 3.9, -0.3);
  cylBetween(brA, brB, 0.32, 0.13, mBark, 7);
  blob(-3.95, 4.05, -0.3, 0.6, mLeafMid, 0);

  // crown
  const leafMats: Record<string, THREE.Material> = { d: mLeafDark, m: mLeafMid, l: mLeafLight };
  const crown: [number, number, number, number, string][] = [
    [0, 9.6, -1.4, 2.5, "m"],
    [-2.4, 8.6, -1.1, 2.0, "d"],
    [2.5, 8.8, -1.4, 2.1, "d"],
    [0.1, 8.9, -3.2, 2.0, "d"],
    [-1.3, 10.3, 0.0, 1.7, "m"],
    [1.5, 10.4, -0.2, 1.6, "l"],
    [-3.6, 7.4, -1.8, 1.4, "m"],
    [3.7, 7.6, -2.0, 1.5, "m"],
    [-2.3, 9.0, 1.0, 1.2, "l"],
    [2.4, 9.1, 0.9, 1.2, "l"],
    [0, 11.2, -1.2, 1.4, "l"],
    [-3.0, 6.9, 0.0, 0.85, "m"],
  ];
  crown.forEach(([x, y, z, r, k]) => blob(x, y, z, r, leafMats[k], 1));
  // little highlight leaf clumps
  for (let i = 0; i < 10; i++) {
    const c = crown[i % crown.length];
    const a = rand() * Math.PI * 2;
    blob(c[0] + Math.cos(a) * c[3] * 0.8, c[1] + c[3] * 0.45, c[2] + Math.sin(a) * c[3] * 0.8, 0.45 + rand() * 0.3, mLeafLight, 0);
  }

  // ---------- deck ----------
  for (let i = 0; i < 15; i++) {
    box(0.28, 0.12, 4.5, i % 2 ? mDeckA : mDeckB, -2.1 + i * 0.3, 4.34, 0.05);
  }
  [-1.8, 0.05, 2.1].forEach((z) => box(4.6, 0.18, 0.2, mWoodDark, 0, 4.19, z));
  [-1, 1].forEach((s) => {
    cylBetween(V(s * 0.5, 2.9, -0.6), V(s * 2.0, 4.12, 2.0), 0.08, 0.08, mWoodDark, 5);
    cylBetween(V(s * 0.6, 3.0, -1.5), V(s * 2.1, 4.12, -1.8), 0.08, 0.08, mWoodDark, 5);
  });
  // railing
  const postGeo = new THREE.BoxGeometry(0.09, 0.8, 0.09);
  const deckTop = 4.4;
  const frontPosts = [-2.15, -1.5, -0.85, -0.2, 0.45, 0.95, 1.85, 2.15];
  frontPosts.forEach((x) => add(postGeo, mWoodLight, x, deckTop + 0.4, 2.25));
  box(3.15, 0.07, 0.12, mWoodLight, -0.6, deckTop + 0.8, 2.25);
  box(3.1, 0.05, 0.06, mWoodLight, -0.6, deckTop + 0.42, 2.25);
  box(0.36, 0.07, 0.12, mWoodLight, 2.0, deckTop + 0.8, 2.25);
  [-2.15, 2.15].forEach((x) => {
    [1.2, 0.1, -1.0, -2.1].forEach((z) => add(postGeo, mWoodLight, x, deckTop + 0.4, z));
    box(0.12, 0.07, 4.4, mWoodLight, x, deckTop + 0.8, 0.07);
    box(0.06, 0.05, 4.4, mWoodLight, x, deckTop + 0.42, 0.07);
  });
  // bunting on front rail
  const buntCols = [mRedC, mYellow, mTeal, mCream];
  const buntGeo = new THREE.ConeGeometry(0.08, 0.18, 3);
  for (let i = 0; i < 12; i++) {
    const x = -2.05 + i * 0.25;
    const b = add(buntGeo, buntCols[i % 4], x, deckTop + 0.68, 2.31);
    b.rotation.x = Math.PI;
    b.scale.z = 0.25;
  }

  // ---------- cabin ----------
  const cz = 0.5;
  const front = cz + 1.0;
  add(new THREE.BoxGeometry(2.8, 1.8, 2.0), mPlank, 0, 5.3, cz);
  [-1.4, 1.4].forEach((x) =>
    [cz - 1, cz + 1].forEach((z) => box(0.16, 1.85, 0.16, mWoodDark, x, 5.3, z))
  );
  box(2.95, 0.12, 2.15, mWoodDark, 0, 4.46, cz);
  // door
  box(0.7, 1.3, 0.06, mTeal, -0.55, deckTop + 0.65, front + 0.02);
  for (let k = 0; k < 3; k++) box(0.03, 1.2, 0.02, mWoodDark, -0.78 + k * 0.23, deckTop + 0.65, front + 0.06);
  box(0.82, 0.08, 0.1, mWoodDark, -0.55, deckTop + 1.34, front + 0.03);
  box(0.08, 1.34, 0.1, mWoodDark, -0.94, deckTop + 0.67, front + 0.03);
  box(0.08, 1.34, 0.1, mWoodDark, -0.16, deckTop + 0.67, front + 0.03);
  add(new THREE.SphereGeometry(0.04, 6, 4), mBrass, -0.33, deckTop + 0.62, front + 0.08);
  // welcome mat
  box(0.7, 0.02, 0.35, mRedB, -0.55, deckTop + 0.01, front + 0.3);
  // round window
  const win = add(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 14), mGlass, 0.6, 5.4, front + 0.02);
  win.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.32, 0.06, 5, 14), mCream, 0.6, 5.4, front + 0.04);
  box(0.6, 0.04, 0.03, mCream, 0.6, 5.4, front + 0.05);
  box(0.04, 0.6, 0.03, mCream, 0.6, 5.4, front + 0.05);
  // flower box
  box(0.72, 0.15, 0.18, mWoodDark, 0.6, 4.98, front + 0.1);
  for (let k = 0; k < 5; k++) {
    add(new THREE.IcosahedronGeometry(0.06, 0), k % 2 ? mLeafMid : [mRedC, mYellow, mPink][k % 3], 0.36 + k * 0.12, 5.1, front + 0.1);
  }
  // side window with shutters (+X)
  box(0.04, 0.5, 0.5, mGlass, 1.42, 5.4, cz);
  box(0.06, 0.06, 0.6, mCream, 1.44, 5.4, cz);
  box(0.06, 0.6, 0.06, mCream, 1.44, 5.4, cz);
  box(0.06, 0.06, 0.62, mCream, 1.44, 5.68, cz);
  box(0.06, 0.06, 0.62, mCream, 1.44, 5.12, cz);
  box(0.04, 0.58, 0.26, mTeal, 1.43, 5.4, cz + 0.45);
  box(0.04, 0.58, 0.26, mTeal, 1.43, 5.4, cz - 0.45);
  // side window (-X)
  box(0.04, 0.45, 0.45, mGlass, -1.42, 5.4, cz);
  box(0.06, 0.5, 0.06, mCream, -1.44, 5.4, cz);
  box(0.06, 0.06, 0.5, mCream, -1.44, 5.4, cz);

  // gables
  const gShape = new THREE.Shape();
  gShape.moveTo(-1.45, 0);
  gShape.lineTo(1.45, 0);
  gShape.lineTo(0, 1.0);
  gShape.closePath();
  const gGeo = new THREE.ExtrudeGeometry(gShape, { depth: 0.08, bevelEnabled: false });
  add(gGeo, mCream, 0, 6.2, front - 0.08);
  add(gGeo, mCream, 0, 6.2, cz - 1.0);
  const attic = add(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 10), mGlow, 0, 6.55, front + 0.02);
  attic.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.16, 0.04, 4, 10), mWoodDark, 0, 6.55, front + 0.03);

  // roof
  const slopeA = Math.atan2(1.18, 1.65);
  const L = Math.hypot(1.65, 1.18);
  const redMats = [mRedA, mRedB, mRedC];
  const tileGeo = new THREE.BoxGeometry(0.3, 0.05, 0.27);
  for (let side = 0; side < 2; side++) {
    const sg = new THREE.Group();
    sg.position.set(0, 0, cz);
    sg.rotation.y = side * Math.PI;
    root.add(sg);
    const slope = new THREE.Group();
    slope.position.set(-1.65, 6.12, 0);
    slope.rotation.z = slopeA;
    sg.add(slope);
    box(L + 0.06, 0.06, 2.6, mWoodDark, L / 2, 0.03, 0, slope);
    const rows = 8;
    const step = (L - 0.05) / rows;
    for (let r = 0; r < rows; r++) {
      for (let j = 0; j < 9; j++) {
        const z = -1.3 + (j + 0.5) * (2.6 / 9) + (r % 2 ? 0.07 : -0.07);
        const t = add(tileGeo, redMats[Math.floor(rand() * 3)], 0.15 + r * step, 0.085, z, slope);
        t.rotation.z = -0.12;
        t.rotation.y = (rand() - 0.5) * 0.06;
      }
    }
  }
  box(0.24, 0.14, 2.72, mRidge, 0, 7.38, cz);
  // chimney + smoke
  box(0.36, 0.95, 0.36, mChimney, 0.85, 6.95, 0.0);
  box(0.46, 0.1, 0.46, mStoneDark, 0.85, 7.45, 0.0);
  [[0.95, 7.75, 0.1, 0.14], [1.05, 8.05, 0.35, 0.18], [1.2, 8.4, 0.6, 0.22]].forEach(([x, y, z, r]) =>
    add(new THREE.IcosahedronGeometry(r, 0), mSmoke, x, y, z)
  );
  // pennant flag
  const poleTop = 8.55;
  add(new THREE.CylinderGeometry(0.03, 0.03, poleTop - 7.35, 5), mWoodDark, 0, (poleTop + 7.35) / 2, 1.6);
  add(new THREE.SphereGeometry(0.06, 6, 4), mBrass, 0, poleTop + 0.04, 1.6);
  const pShape = new THREE.Shape();
  pShape.moveTo(0, 0);
  pShape.lineTo(0.95, -0.17);
  pShape.lineTo(0, -0.36);
  pShape.closePath();
  const pen = add(new THREE.ExtrudeGeometry(pShape, { depth: 0.02, bevelEnabled: false }), mYellow, 0.03, poleTop - 0.04, 1.59);
  pen.rotation.y = 0.35;
  const sShape = new THREE.Shape();
  sShape.moveTo(0, 0);
  sShape.lineTo(0.35, -0.12);
  sShape.lineTo(0, -0.24);
  sShape.closePath();
  const pen2 = add(new THREE.ExtrudeGeometry(sShape, { depth: 0.03, bevelEnabled: false }), mRedC, 0.03, poleTop - 0.1, 1.585);
  pen2.rotation.y = 0.35;

  // lantern by door
  const lx = -1.15;
  box(0.05, 0.12, 0.04, mIron, lx, 5.65, front + 0.03);
  box(0.04, 0.04, 0.32, mIron, lx, 5.7, front + 0.18);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), mIron, lx, 5.62, front + 0.32);
  const ly = 5.4;
  const lz = front + 0.32;
  const lcap = add(new THREE.ConeGeometry(0.13, 0.12, 4), mIron, lx, ly + 0.17, lz);
  lcap.rotation.y = Math.PI / 4;
  box(0.15, 0.2, 0.15, mGlow, lx, ly, lz);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(0.025, 0.22, 0.025, mIron, lx + a * 0.08, ly, lz + b * 0.08));
  box(0.19, 0.04, 0.19, mIron, lx, ly - 0.12, lz);
  box(0.19, 0.03, 0.19, mIron, lx, ly + 0.11, lz);

  // ---------- rope ladder ----------
  const ladTop = deckTop + 0.05;
  const ropeXs = [1.2, 1.6];
  ropeXs.forEach((x) => cylBetween(V(x, ladTop, 2.28), V(x, G, 2.55), 0.025, 0.025, mRope, 4));
  for (let i = 0; i < 10; i++) {
    const t = (i + 0.6) / 10.3;
    const y = ladTop + (G + 0.1 - ladTop) * t;
    const z = 2.28 + 0.27 * t;
    box(0.52, 0.05, 0.08, mWoodLight, 1.4, y, z);
    ropeXs.forEach((x) => add(new THREE.SphereGeometry(0.04, 5, 3), mRope, x, y, z));
  }

  // ---------- swing ----------
  const seatY = G + 0.55;
  const ropeXsS = [-2.3, -2.9];
  const tops = ropeXsS.map((x) => {
    const t = (x - brA.x) / (brB.x - brA.x);
    return new THREE.Vector3().lerpVectors(brA, brB, t).add(V(0, -0.15, 0));
  });
  const seatZ = (tops[0].z + tops[1].z) / 2;
  tops.forEach((tp, i) => {
    cylBetween(tp, V(ropeXsS[i], seatY + 0.03, seatZ), 0.022, 0.022, mRope, 4);
    add(new THREE.TorusGeometry(0.13, 0.03, 4, 8), mRope, tp.x, tp.y + 0.12, tp.z).rotation.y = Math.PI / 2;
  });
  box(0.85, 0.07, 0.32, mWoodLight, -2.6, seatY, seatZ);
  box(0.85, 0.02, 0.04, mWoodDark, -2.6, seatY + 0.04, seatZ);

  // ---------- mushrooms ----------
  const mushroom = (x: number, z: number, s: number, cap: THREE.Material, dots: boolean) => {
    add(new THREE.CylinderGeometry(0.06 * s, 0.08 * s, 0.26 * s, 6), mStem, x, G + 0.13 * s, z);
    const R = 0.18 * s;
    const cy = G + 0.24 * s;
    const c = add(new THREE.SphereGeometry(R, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cap, x, cy, z);
    c.scale.y = 0.75;
    add(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.02, 8), mStem, x, cy, z);
    if (dots) {
      for (let k = 0; k < 5; k++) {
        const th = k * 1.26 + rand() * 0.3;
        const ph = k === 4 ? 0.1 : 0.85;
        add(new THREE.IcosahedronGeometry(0.028 * s, 0), mWhite,
          x + Math.sin(ph) * Math.cos(th) * R, cy + Math.cos(ph) * R * 0.75, z + Math.sin(ph) * Math.sin(th) * R);
      }
    }
  };
  mushroom(-1.25, 0.05, 1.3, mMushRed, true);
  mushroom(-0.95, 0.35, 0.9, mMushRed, true);
  mushroom(-1.55, 0.4, 0.7, mMushRed, true);
  mushroom(1.15, -0.25, 1.0, mMushBrown, false);
  mushroom(1.4, -0.05, 0.65, mMushBrown, false);
  mushroom(-1.7, -2.9, 1.1, mMushRed, true);

  // ---------- bicycle ----------
  const bike = new THREE.Group();
  bike.position.set(3.0, G, 2.5);
  bike.rotation.y = -0.6;
  root.add(bike);
  const wr = 0.33;
  const wy = wr + 0.035;
  [-0.5, 0.5].forEach((wx) => {
    add(new THREE.TorusGeometry(wr, 0.035, 5, 16), mTire, wx, wy, 0, bike);
    add(new THREE.TorusGeometry(wr - 0.035, 0.012, 3, 16), mSilver, wx, wy, 0, bike);
    for (let k = 0; k < 4; k++) {
      const s = box(wr * 2 - 0.06, 0.008, 0.008, mSilver, wx, wy, 0, bike);
      s.rotation.z = (k * Math.PI) / 4;
    }
    const hub = add(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 6), mSilver, wx, wy, 0, bike);
    hub.rotation.x = Math.PI / 2;
  });
  const R0 = V(-0.5, wy, 0), F0 = V(0.5, wy, 0), BB = V(-0.05, 0.33, 0);
  const ST = V(-0.2, 0.85, 0), HT = V(0.36, 0.86, 0), HB = V(0.41, 0.7, 0);
  const tube = (a: THREE.Vector3, b: THREE.Vector3, r = 0.025, m: THREE.Material = mBike) => cylBetween(a, b, r, r, m, 5, bike);
  tube(BB, ST);
  tube(ST, HT);
  tube(BB, HB);
  tube(R0, BB, 0.018);
  tube(R0, ST, 0.018);
  tube(HB, F0, 0.02, mSilver);
  tube(HB, HT, 0.03);
  tube(HT, V(0.33, 1.0, 0), 0.02, mSilver);
  const bar = add(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 5), mSilver, 0.33, 1.0, 0, bike);
  bar.rotation.x = Math.PI / 2;
  [-0.24, 0.24].forEach((z) => {
    const gp = add(new THREE.CylinderGeometry(0.026, 0.026, 0.1, 5), mTire, 0.33, 1.0, z, bike);
    gp.rotation.x = Math.PI / 2;
  });
  tube(ST, V(-0.22, 0.92, 0), 0.016, mSilver);
  box(0.24, 0.06, 0.13, mTire, -0.24, 0.94, 0, bike);
  const ring = add(new THREE.TorusGeometry(0.08, 0.012, 3, 10), mSilver, BB.x, BB.y, 0.04, bike);
  ring.rotation.y = 0;
  box(0.1, 0.02, 0.06, mTire, BB.x + 0.08, BB.y - 0.06, 0.1, bike);
  box(0.1, 0.02, 0.06, mTire, BB.x - 0.08, BB.y + 0.06, -0.1, bike);
  tube(V(-0.12, 0.33, 0.02), V(-0.2, 0.0, 0.2), 0.012, mSilver);
  // basket with flowers
  box(0.26, 0.2, 0.3, mWicker, 0.62, 0.9, 0, bike);
  for (let k = 0; k < 3; k++) box(0.27, 0.015, 0.31, mWoodDark, 0.62, 0.83 + k * 0.06, 0, bike);
  [[0.58, -0.07, mYellow], [0.66, 0.06, mPink], [0.6, 0.08, mWhite], [0.67, -0.05, mLeafLight]].forEach(([x, z, m]) =>
    add(new THREE.IcosahedronGeometry(0.06, 0), m as THREE.Material, x as number, 1.04, z as number, bike)
  );

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return root;
}
```