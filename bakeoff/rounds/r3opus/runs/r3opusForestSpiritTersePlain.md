```ts
import * as THREE from "three";

export const meta = {
  name: "Mossback, the Grove Warden",
  description:
    "A stylized forest spirit: bark body under a moss mantle and leaf shawl, a pale wooden mask with glowing eyes, branching leafy antlers with glowing berries, a heart-light in its chest, and a crooked staff with a hanging lantern. It stands on a mossy patch with mushrooms, grass and stones.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTexture(draw: (ctx: CanvasRenderingContext2D, s: number) => void, size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rng = mulberry32(1337);

  // ---------- textures ----------
  const barkTex = makeTexture((ctx, s) => {
    const r = mulberry32(7);
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) {
      const x = r() * s;
      const w = 1 + r() * 4;
      const g = 110 + Math.floor(r() * 70);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(x, 0, w, s);
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = "rgba(60,60,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(r() * s, r() * s, 2 + r() * 3, 5 + r() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  barkTex.repeat.set(2, 1);
  const mossTex = makeTexture((ctx, s) => {
    const r = mulberry32(11);
    ctx.fillStyle = "#cfcfcf";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 500; i++) {
      const g = 150 + Math.floor(r() * 105);
      ctx.fillStyle = `rgb(${g},${g},${Math.floor(g * 0.85)})`;
      ctx.beginPath();
      ctx.arc(r() * s, r() * s, 1 + r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ---------- materials ----------
  const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...o });
  const bark = std(0x7a5236, { map: barkTex });
  const barkDark = std(0x4a3222, { map: barkTex });
  const moss = std(0x5d8f34, { map: mossTex });
  const mossDark = std(0x3c6a2c, { map: mossTex });
  const leafA = std(0x3f8a3a);
  const leafB = std(0x7fbf45);
  const leafC = std(0xe0892a);
  const maskMat = std(0xf1e6cb, { roughness: 0.6 });
  const paint = std(0xb8352c);
  const dark = std(0x1c130d);
  const glow = std(0xd4ff7a, { emissive: 0xb8ff4a, emissiveIntensity: 1.6 });
  const lampGlow = std(0xffe08a, { emissive: 0xffb43a, emissiveIntensity: 2 });
  const berryGlow = std(0x9ff3ff, { emissive: 0x4fd8ff, emissiveIntensity: 1.6 });
  const capRed = std(0xc5362b);
  const stemCream = std(0xf0e4c4);
  const spotWhite = std(0xfff8ea);
  const stone = std(0x8b918e);
  const dirt = std(0x4b3524);
  const pink = std(0xf2a3c6);
  const metal = std(0x3a3a34, { metalness: 0.6, roughness: 0.4 });

  const UP = new THREE.Vector3(0, 1, 0);
  const ZV = new THREE.Vector3(0, 0, 1);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  function add(geo: THREE.BufferGeometry, mat: THREE.Material, p: THREE.Vector3, s?: THREE.Vector3) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(p);
    if (s) m.scale.copy(s);
    root.add(m);
    return m;
  }
  function limb(a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, mat: THREE.Material, seg = 6) {
    const d = b.clone().sub(a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, seg, 1), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    root.add(m);
    return m;
  }
  const jointGeo = new THREE.IcosahedronGeometry(1, 0);
  function joint(p: THREE.Vector3, r: number, mat: THREE.Material) {
    return add(jointGeo, mat, p, V(r, r, r));
  }
  const leafGeo = new THREE.OctahedronGeometry(1, 0);
  function leaf(p: THREE.Vector3, dir: THREE.Vector3, size: number, mat?: THREE.Material) {
    const d = dir.clone().normalize();
    const pick = rng();
    const m = new THREE.Mesh(leafGeo, mat ?? (pick < 0.5 ? leafA : pick < 0.85 ? leafB : leafC));
    m.scale.set(size * 0.42, size * 0.07, size);
    m.quaternion.setFromUnitVectors(ZV, d);
    m.rotateZ((rng() - 0.5) * 1.2);
    m.position.copy(p).addScaledVector(d, size * 0.9);
    root.add(m);
    return m;
  }

  // ---------- ground patch ----------
  add(new THREE.CylinderGeometry(0.78, 0.74, 0.05, 10), dirt, V(0, 0.025, 0));
  add(new THREE.CylinderGeometry(0.74, 0.77, 0.05, 10), moss, V(0, 0.07, 0));
  const G = 0.095; // ground top
  // moss lumps
  for (let i = 0; i < 9; i++) {
    const a = rng() * Math.PI * 2, r = 0.3 + rng() * 0.38;
    const s = 0.06 + rng() * 0.06;
    add(jointGeo, rng() < 0.5 ? moss : mossDark, V(Math.cos(a) * r, G - 0.01, Math.sin(a) * r), V(s, s * 0.45, s));
  }
  // stones
  [[0.45, -0.35, 0.09], [-0.25, 0.55, 0.07], [0.6, 0.15, 0.05]].forEach(([x, z, s]) => {
    const m = add(new THREE.DodecahedronGeometry(1, 0), stone, V(x, G + s * 0.2, z), V(s, s * 0.7, s * 0.9));
    m.rotation.set(rng(), rng() * 3, rng());
  });
  // mushrooms
  const capGeo = new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  const spotGeo = new THREE.IcosahedronGeometry(1, 0);
  function mushroom(base: THREE.Vector3, h: number, cr: number, tilt = 0) {
    const top = base.clone().add(V(tilt * h, h, 0));
    limb(base, top, cr * 0.32, cr * 0.25, stemCream, 6);
    add(capGeo, capRed, top.clone().add(V(0, -cr * 0.05, 0)), V(cr, cr * 0.7, cr));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + rng();
      const el = 0.5 + rng() * 0.6;
      const sp = V(Math.cos(a) * Math.cos(el) * cr, Math.sin(el) * cr * 0.7, Math.sin(a) * Math.cos(el) * cr);
      add(spotGeo, spotWhite, top.clone().add(sp).add(V(0, -cr * 0.05, 0)), V(cr * 0.14, cr * 0.08, cr * 0.14));
    }
  }
  mushroom(V(0.38, G, 0.42), 0.14, 0.08, 0.15);
  mushroom(V(0.48, G, 0.32), 0.09, 0.055, -0.1);
  mushroom(V(0.3, G, 0.52), 0.06, 0.04, 0.2);
  mushroom(V(-0.45, G, -0.4), 0.11, 0.07);
  // grass + fireflies on tips
  for (let i = 0; i < 34; i++) {
    const a = rng() * Math.PI * 2, r = 0.28 + rng() * 0.44;
    const b = V(Math.cos(a) * r, G, Math.sin(a) * r);
    const h = 0.08 + rng() * 0.12;
    const tip = b.clone().add(V((rng() - 0.5) * 0.06, h, (rng() - 0.5) * 0.06));
    limb(b, tip, 0.012, 0.001, rng() < 0.6 ? leafA : leafB, 3);
    if (i % 7 === 0) joint(tip, 0.012, glow);
  }
  // little flowers
  for (let i = 0; i < 6; i++) {
    const a = rng() * Math.PI * 2, r = 0.35 + rng() * 0.35;
    const b = V(Math.cos(a) * r, G, Math.sin(a) * r);
    const t = b.clone().add(V(0, 0.07 + rng() * 0.05, 0));
    limb(b, t, 0.005, 0.005, leafA, 3);
    for (let k = 0; k < 5; k++) {
      const pa = (k / 5) * Math.PI * 2;
      add(jointGeo, pink, t.clone().add(V(Math.cos(pa) * 0.014, 0, Math.sin(pa) * 0.014)), V(0.012, 0.005, 0.012));
    }
    joint(t.clone().add(V(0, 0.004, 0)), 0.008, lampGlow);
  }

  // ---------- legs & root feet ----------
  for (const sx of [1, -1]) {
    const hip = V(0.13 * sx, 0.76, 0);
    const knee = V(0.16 * sx, 0.44, 0.05);
    const ankle = V(0.14 * sx, 0.16, 0.01);
    limb(hip, knee, 0.1, 0.075, bark, 7);
    joint(knee, 0.08, barkDark);
    limb(knee, ankle, 0.075, 0.07, bark, 7);
    // mossy knee pad
    add(jointGeo, moss, knee.clone().add(V(0, 0.02, 0.05)), V(0.08, 0.06, 0.06));
    // roots
    const dirs = [
      [0.1, 0.0, 1], [0.6, 0, 0.8], [-0.5, 0, 0.9], [1, 0, 0.1], [0.2, 0, -0.9],
    ];
    dirs.forEach(([dx, , dz], i) => {
      const d = V(dx * sx, 0, dz).normalize();
      const len = i === 0 ? 0.24 : 0.16 + rng() * 0.06;
      const end = V(ankle.x, G - 0.01, ankle.z).addScaledVector(d, len);
      const mid = V(ankle.x, 0.13, ankle.z).addScaledVector(d, len * 0.4);
      limb(ankle.clone().add(V(0, -0.02, 0)), mid, 0.06, 0.04, barkDark, 5);
      limb(mid, end, 0.04, 0.006, barkDark, 5);
      joint(mid, 0.04, barkDark);
    });
  }

  // ---------- body ----------
  add(jointGeo, barkDark, V(0, 0.78, 0), V(0.25, 0.14, 0.2));
  add(new THREE.CylinderGeometry(0.3, 0.23, 0.62, 8), bark, V(0, 1.06, 0));
  // leaf skirt
  for (let ring = 0; ring < 2; ring++) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.22;
      const r = 0.24 + ring * 0.02;
      const y = 0.86 - ring * 0.08;
      leaf(V(Math.cos(a) * r, y, Math.sin(a) * r * 0.85), V(Math.cos(a) * 0.45, -1, Math.sin(a) * 0.45), 0.09);
    }
  }
  // chest heart-light
  const ringM = add(new THREE.TorusGeometry(0.08, 0.026, 5, 10), barkDark, V(0, 1.12, 0.27));
  ringM.rotation.z = 0.3;
  joint(V(0, 1.12, 0.26), 0.06, glow);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    limb(V(Math.cos(a) * 0.09, 1.12 + Math.sin(a) * 0.09, 0.27), V(Math.cos(a) * 0.18, 1.12 + Math.sin(a) * 0.17, 0.24), 0.018, 0.006, barkDark, 4);
  }
  // bark ridges on belly
  for (let i = 0; i < 3; i++) {
    const a = -0.9 + i * 0.9;
    limb(V(Math.sin(a) * 0.25, 0.8, Math.cos(a) * 0.25), V(Math.sin(a) * 0.28, 0.98, Math.cos(a) * 0.28), 0.02, 0.012, barkDark, 4);
  }
  // moss mantle + leaf shawl
  add(new THREE.IcosahedronGeometry(1, 1), moss, V(0, 1.36, -0.01), V(0.4, 0.15, 0.33));
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    leaf(V(Math.cos(a) * 0.36, 1.35, Math.sin(a) * 0.29), V(Math.cos(a), -0.55, Math.sin(a)), 0.1);
  }
  // shoulder mushrooms
  mushroom(V(0.27, 1.43, -0.05), 0.07, 0.05, 0.3);
  mushroom(V(0.33, 1.4, 0.04), 0.045, 0.035, 0.4);
  // neck
  limb(V(0, 1.38, 0), V(0, 1.5, 0), 0.1, 0.09, barkDark, 6);

  // ---------- head ----------
  const HY = 1.6;
  add(new THREE.IcosahedronGeometry(1, 1), mossDark, V(0, HY, -0.02), V(0.2, 0.21, 0.19));
  // mask
  const MZ = 0.1, MR = V(0.18, 0.24, 0.11);
  add(new THREE.SphereGeometry(1, 9, 6), maskMat, V(0, HY - 0.02, MZ), MR);
  const maskZ = (x: number, y: number) => {
    const u = x / MR.x, v = (y - (HY - 0.02)) / MR.y;
    return MZ + MR.z * Math.sqrt(Math.max(0, 1 - u * u - v * v));
  };
  for (const sx of [1, -1]) {
    const ex = 0.068 * sx, ey = HY + 0.03;
    const socket = add(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 8), dark, V(ex, ey, maskZ(ex, ey) - 0.004));
    socket.rotation.x = Math.PI / 2;
    socket.rotation.z = -sx * 0.25;
    socket.scale.set(1, 1, 1.25);
    joint(V(ex, ey - 0.004, maskZ(ex, ey) + 0.008), 0.022, glow);
    // red paint stripes under eyes
    for (let k = 0; k < 2; k++) {
      const px = ex + sx * (k * 0.025 - 0.005), py = ey - 0.08;
      const st = add(new THREE.BoxGeometry(0.012, 0.055, 0.01), paint, V(px, py, maskZ(px, py)));
      st.rotation.z = sx * 0.15;
    }
    // cheek swirl dot
    const cx = 0.12 * sx, cy = HY - 0.07;
    add(jointGeo, paint, V(cx, cy, maskZ(cx, cy) - 0.004), V(0.016, 0.016, 0.008));
  }
  // forehead mark
  const fm = add(new THREE.OctahedronGeometry(1, 0), glow, V(0, HY + 0.13, maskZ(0, HY + 0.13)), V(0.018, 0.035, 0.01));
  fm.rotation.x = -0.3;
  add(new THREE.BoxGeometry(0.06, 0.012, 0.012), paint, V(0, HY + 0.085, maskZ(0, HY + 0.085)));
  // mouth slit
  add(new THREE.BoxGeometry(0.05, 0.01, 0.02), dark, V(0, HY - 0.15, maskZ(0, HY - 0.15) - 0.005));
  // hair leaves around mask
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * (0.05 + (i / 9) * 0.9);
    leaf(V(Math.cos(a) * 0.17, HY + Math.sin(a) * 0.18, 0.04), V(Math.cos(a), Math.sin(a) * 0.6, -0.5), 0.07);
  }

  // ---------- antlers ----------
  const berryGeo = new THREE.IcosahedronGeometry(1, 0);
  function branch(s: THREE.Vector3, d: THREE.Vector3, len: number, r: number, depth: number, sx: number, br: () => number) {
    const e = s.clone().addScaledVector(d, len);
    limb(s, e, r, r * 0.72, barkDark, 5);
    joint(e, r * 0.75, barkDark);
    if (depth === 0) {
      for (let k = 0; k < 3; k++) {
        const ld = V((br() - 0.3) * sx, 0.6 + br() * 0.6, (br() - 0.5)).normalize();
        leaf(e, ld, 0.06 + br() * 0.02);
      }
      add(berryGeo, berryGlow, e.clone().add(V(0, 0.015, 0.01)), V(0.018, 0.018, 0.018));
      return;
    }
    for (let c = 0; c < 2; c++) {
      const nd = d.clone();
      nd.x += (c === 0 ? 0.55 : -0.25) * sx + (br() - 0.5) * 0.2 * sx;
      nd.y += c === 0 ? -0.1 : 0.35;
      nd.z += (br() - 0.5) * 0.5;
      nd.normalize();
      if (nd.y < 0.15) { nd.y = 0.15; nd.normalize(); }
      branch(e, nd, len * (0.7 + br() * 0.1), r * 0.7, depth - 1, sx, br);
    }
  }
  for (const sx of [1, -1]) {
    const br = mulberry32(42);
    branch(V(0.1 * sx, HY + 0.15, -0.03), V(0.55 * sx, 1, -0.15).normalize(), 0.2, 0.03, 3, sx, br);
  }

  // ---------- arms ----------
  // left arm (+X), open hand
  {
    const sh = V(0.32, 1.3, 0), el = V(0.48, 1.0, 0.04), wr = V(0.53, 0.74, 0.12);
    joint(sh, 0.085, bark);
    limb(sh, el, 0.07, 0.055, bark, 6);
    joint(el, 0.06, barkDark);
    limb(el, wr, 0.055, 0.045, bark, 6);
    leaf(el, V(0.6, 0.3, -0.6), 0.08);
    leaf(el, V(0.7, -0.2, 0.4), 0.07);
    add(jointGeo, barkDark, wr.clone().add(V(0.01, -0.03, 0)), V(0.055, 0.05, 0.045));
    const fdirs = [V(0.25, -1, 0.5), V(0.35, -1, 0.15), V(0.35, -1, -0.15), V(-0.3, -0.7, 0.6)];
    fdirs.forEach((d, i) => {
      const s = wr.clone().add(V(0.01, -0.05, 0));
      const m = s.clone().addScaledVector(d.clone().normalize(), i === 3 ? 0.06 : 0.08);
      const t = m.clone().add(V(0.01, -0.04, 0.02));
      limb(s, m, 0.016, 0.012, barkDark, 4);
      limb(m, t, 0.012, 0.003, barkDark, 4);
    });
    // a firefly resting by the hand
    joint(V(0.6, 0.6, 0.22), 0.016, glow);
  }
  // right arm (-X), gripping staff
  {
    const sh = V(-0.32, 1.3, 0), el = V(-0.5, 1.03, 0.1), wr = V(-0.56, 0.9, 0.2);
    joint(sh, 0.085, bark);
    limb(sh, el, 0.07, 0.055, bark, 6);
    joint(el, 0.06, barkDark);
    limb(el, wr, 0.055, 0.045, bark, 6);
    leaf(el, V(-0.6, 0.3, -0.6), 0.08);
    add(jointGeo, barkDark, V(-0.6, 0.86, 0.2), V(0.06, 0.06, 0.055));
  }

  // ---------- staff & lantern ----------
  const sp = [
    V(-0.6, 0.08, 0.2), V(-0.58, 0.5, 0.21), V(-0.61, 0.95, 0.2), V(-0.58, 1.4, 0.19),
    V(-0.61, 1.75, 0.2), V(-0.68, 1.9, 0.2), V(-0.79, 1.91, 0.2), V(-0.85, 1.83, 0.2),
  ];
  for (let i = 0; i < sp.length - 1; i++) {
    const r1 = 0.026 - i * 0.002, r2 = 0.026 - (i + 1) * 0.002;
    limb(sp[i], sp[i + 1], r1, r2, barkDark, 5);
    joint(sp[i + 1], r2 * 1.15, barkDark);
  }
  leaf(V(-0.61, 1.6, 0.2), V(0.6, 0.4, 0.5), 0.08);
  leaf(V(-0.62, 1.78, 0.2), V(0.3, 0.9, -0.3), 0.07);
  leaf(V(-0.7, 1.9, 0.2), V(-0.2, 1, 0.4), 0.07, leafC);
  // moss wrap on staff
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6), moss, V(-0.59, 1.15, 0.2));
  // lantern
  const lt = V(-0.85, 1.83, 0.2);
  limb(lt, V(-0.85, 1.72, 0.2), 0.004, 0.004, metal, 3);
  add(new THREE.ConeGeometry(0.06, 0.045, 6), metal, V(-0.85, 1.7, 0.2));
  add(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 6), lampGlow, V(-0.85, 1.635, 0.2));
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    limb(V(-0.85 + Math.cos(a) * 0.05, 1.68, 0.2 + Math.sin(a) * 0.05), V(-0.85 + Math.cos(a) * 0.044, 1.59, 0.2 + Math.sin(a) * 0.044), 0.004, 0.004, metal, 3);
  }
  add(new THREE.CylinderGeometry(0.05, 0.035, 0.02, 6), metal, V(-0.85, 1.585, 0.2));
  joint(V(-0.85, 1.565, 0.2), 0.01, metal);

  return root;
}
```