import * as THREE from "three";

export const meta = {
  name: "Sleepy Koala on a Eucalyptus Branch",
  description:
    "A drowsy ash-grey koala hugs a eucalyptus trunk while munching a sprig of blue-green leaves. It has a cream chest, fluffy cream-lined ears, a big leathery nose and heavy-lidded brown eyes, with little sleepy Zs drifting up.",
};

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rng = mulberry32(20240611);
  const root = new THREE.Group();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const hasDoc = typeof document !== "undefined";

  // ---------- textures ----------
  function furTex(base: string, light: string, dark: string): THREE.Texture | null {
    if (!hasDoc) return null;
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) {
      const x = rng() * 256, y = rng() * 256, a = -Math.PI / 2 + (rng() - 0.5) * 0.9, l = 4 + rng() * 7;
      g.strokeStyle = rng() < 0.5 ? light : dark;
      g.globalAlpha = 0.25 + rng() * 0.35;
      g.lineWidth = 1 + rng() * 1.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  function barkTex(): THREE.Texture | null {
    if (!hasDoc) return null;
    const c = document.createElement("canvas");
    c.width = 128; c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#cfc3ad"; g.fillRect(0, 0, 128, 256);
    const cols = ["#b9a88f", "#e2d9c6", "#a7948a", "#d8b9a0", "#9fa59a"];
    for (let i = 0; i < 70; i++) {
      g.fillStyle = cols[Math.floor(rng() * cols.length)];
      g.globalAlpha = 0.35 + rng() * 0.4;
      const x = rng() * 128, y = rng() * 256, w = 4 + rng() * 14, h = 20 + rng() * 70;
      g.beginPath(); g.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 0.5; g.strokeStyle = "#7d6b58";
    for (let i = 0; i < 25; i++) {
      const x = rng() * 128, y = rng() * 256;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - 0.5) * 4, y + 15 + rng() * 30); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // ---------- materials ----------
  const std = (color: string | number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...o });
  const furMap = furTex("#9b9fa6", "#c4c8ce", "#6f737b");
  const creamMap = furTex("#f1e7d3", "#fffaf0", "#d5c7ad");
  const M = {
    fur: furMap ? std("#ffffff", { map: furMap }) : std("#9b9fa6"),
    furDark: std("#7c8088"),
    cream: creamMap ? std("#ffffff", { map: creamMap }) : std("#f1e7d3"),
    earIn: std("#e9d6c3"),
    nose: std("#1c1a1d", { roughness: 0.35, metalness: 0.05 }),
    noseHi: std("#5a5560", { roughness: 0.2 }),
    eye: std("#4a2a17", { roughness: 0.3 }),
    lash: std("#2a2324"),
    claw: std("#2c2622", { roughness: 0.5 }),
    pad: std("#3d3438", { roughness: 0.6 }),
    mouth: std("#4b2329"),
    bark: barkTex() ? std("#ffffff", { map: barkTex()! }) : std("#cfc3ad"),
    peel: std("#b98f6e"),
    stem: std("#9a5640"),
    leafA: std("#6f9c94", { side: THREE.DoubleSide }),
    leafB: std("#56868a", { side: THREE.DoubleSide }),
    leafC: std("#93b8a8", { side: THREE.DoubleSide }),
    leafBit: std("#b7cfa9", { side: THREE.DoubleSide }),
    nut: std("#6b6648"),
    ground: std("#7a6a4f"),
    groundTop: std("#8f8a5c"),
    pebble: std("#a29c90"),
    zzz: std("#bfdcf5", { emissive: "#5d86b0", emissiveIntensity: 0.5, roughness: 0.5 }),
  };
  const leafMats = [M.leafA, M.leafB, M.leafC];

  // ---------- helpers ----------
  const sphere = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  function add(geo: THREE.BufferGeometry, mat: THREE.Material, p: THREE.Vector3, s?: THREE.Vector3, parent: THREE.Object3D = root) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(p);
    if (s) m.scale.copy(s);
    parent.add(m);
    return m;
  }
  const UP = V(0, 1, 0);
  function limb(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, rad = 8) {
    const d = b.clone().sub(a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len), 3, rad), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    root.add(m);
    return m;
  }
  function rod(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material, seg = 6) {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    root.add(m);
    return m;
  }
  // leaf geometry: length 1 along +Y, sickle-shaped
  const ls = new THREE.Shape();
  ls.moveTo(0, 0);
  ls.quadraticCurveTo(0.2, 0.35, 0.08, 1);
  ls.quadraticCurveTo(-0.16, 0.4, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(ls, 4);
  const midribGeo = new THREE.BoxGeometry(0.012, 0.9, 0.012);
  function leaf(p: THREE.Vector3, dir: THREE.Vector3, len: number, mat?: THREE.Material, roll = rng() * Math.PI) {
    const g = new THREE.Group();
    g.position.copy(p);
    g.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    g.rotateY(roll);
    const m = new THREE.Mesh(leafGeo, mat || leafMats[Math.floor(rng() * 3)]);
    m.scale.set(len, len, len);
    g.add(m);
    const rib = new THREE.Mesh(midribGeo, M.stem);
    rib.scale.set(len * 0.5, len, len * 0.5);
    rib.position.set(len * 0.03, len * 0.45, 0);
    g.add(rib);
    root.add(g);
    return g;
  }

  // ---------- ground base ----------
  add(new THREE.CylinderGeometry(0.44, 0.47, 0.05, 11), M.ground, V(0, 0.025, 0));
  add(new THREE.CylinderGeometry(0.42, 0.44, 0.015, 11), M.groundTop, V(0, 0.055, 0));
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2, r = 0.15 + rng() * 0.22;
    const p = add(new THREE.DodecahedronGeometry(0.02 + rng() * 0.025, 0), M.pebble, V(Math.cos(a) * r, 0.065, Math.sin(a) * r), V(1, 0.6, 1));
    p.rotation.set(rng(), rng(), rng());
  }
  for (let i = 0; i < 6; i++) {
    const a = rng() * Math.PI * 2, r = 0.12 + rng() * 0.25;
    const l = leaf(V(Math.cos(a) * r, 0.066, Math.sin(a) * r), V(Math.cos(a + 1), 0.02, Math.sin(a + 1)), 0.09 + rng() * 0.04, rng() < 0.5 ? M.leafBit : undefined, 0);
    l.rotateY(Math.PI / 2);
  }

  // ---------- trunk ----------
  const TX = -0.2, TZ = -0.02;
  const trunk = add(new THREE.CylinderGeometry(0.05, 0.07, 1.42, 9), M.bark, V(TX, 0.04 + 0.71, TZ));
  trunk.rotation.y = 0.3;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    rod(V(TX + Math.cos(a) * 0.05, 0.16, TZ + Math.sin(a) * 0.05), V(TX + Math.cos(a) * 0.14, 0.05, TZ + Math.sin(a) * 0.14), 0.035, 0.015, M.bark, 5);
  }
  // peeling bark strips
  for (let i = 0; i < 6; i++) {
    const y = 0.2 + rng() * 1.05;
    const rr = 0.07 - 0.02 * ((y - 0.04) / 1.42) + 0.004;
    const g = new THREE.CylinderGeometry(rr, rr, 0.08 + rng() * 0.12, 9, 1, true, rng() * 6, 0.6 + rng() * 0.8);
    add(g, M.peel, V(TX, y, TZ)).material = M.peel;
  }
  // side branch the koala sits on
  rod(V(TX, 0.33, TZ), V(0.3, 0.37, TZ), 0.042, 0.03, M.bark, 7);
  rod(V(0.3, 0.37, TZ), V(0.4, 0.45, 0.02), 0.02, 0.008, M.stem, 5);
  for (let i = 0; i < 4; i++) leaf(V(0.34 + i * 0.02, 0.4 + i * 0.015, 0.0), V(0.5 + rng() * 0.5, -0.3 - rng() * 0.6, rng() - 0.5), 0.1 + rng() * 0.03);

  // canopy twigs
  for (let i = 0; i < 4; i++) {
    const y = 0.92 + i * 0.16;
    const a = [0.2, 2.6, -1.1, 1.6][i];
    const dir = V(Math.cos(a), 0.55, Math.sin(a)).normalize();
    const s = V(TX, y, TZ);
    const len = 0.32 + rng() * 0.12;
    const e = s.clone().addScaledVector(dir, len);
    rod(s, e, 0.016, 0.006, M.stem, 5);
    for (let k = 0; k < 6; k++) {
      const t = 0.35 + (k / 5) * 0.65;
      const p = s.clone().lerp(e, t);
      const side = k % 2 ? 1 : -1;
      const ld = V(Math.cos(a + side * 0.9), -0.5 - rng() * 0.6, Math.sin(a + side * 0.9));
      leaf(p, ld, 0.11 + rng() * 0.05);
    }
    leaf(e, dir.clone().add(V(0, -0.4, 0)), 0.1);
    if (i === 1) {
      for (let k = 0; k < 4; k++) {
        const p = s.clone().lerp(e, 0.55).add(V((rng() - 0.5) * 0.04, -0.03 - rng() * 0.02, (rng() - 0.5) * 0.04));
        add(new THREE.CylinderGeometry(0.011, 0.006, 0.02, 6), M.nut, p);
      }
    }
  }
  for (let k = 0; k < 5; k++) {
    const a = k * 1.3;
    leaf(V(TX, 1.45, TZ), V(Math.cos(a) * 0.5, 0.8, Math.sin(a) * 0.5), 0.11 + rng() * 0.04);
  }

  // ---------- koala ----------
  // body
  add(sphere(1, 12, 10), M.fur, V(0, 0.56, -0.01), V(0.17, 0.21, 0.15));
  add(sphere(1, 10, 8), M.cream, V(0, 0.56, 0.085), V(0.12, 0.16, 0.08));
  // fur tufts on body sides
  for (let i = 0; i < 6; i++) {
    const s = i < 3 ? 1 : -1, y = 0.48 + (i % 3) * 0.08;
    const c = add(new THREE.ConeGeometry(0.02, 0.045, 5), M.fur, V(s * 0.165, y, 0.0));
    c.rotation.z = -s * 1.9;
  }

  // head
  const HY = 0.85;
  add(sphere(0.135, 12, 10), M.fur, V(0, HY, 0.03), V(1.12, 0.95, 1));
  add(sphere(1, 10, 8), M.cream, V(0, 0.77, 0.1), V(0.07, 0.045, 0.05));
  // cheek fluff
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const c = add(new THREE.ConeGeometry(0.018, 0.045, 5), i === 1 ? M.cream : M.fur, V(s * 0.145, 0.79 + i * 0.025, 0.06));
      c.rotation.z = -s * (1.9 + i * 0.25);
    }
  }
  // nose
  add(sphere(1, 10, 8), M.nose, V(0, 0.825, 0.158), V(0.045, 0.064, 0.042));
  add(sphere(0.012, 6, 5), M.noseHi, V(0.012, 0.85, 0.192), V(1, 1.4, 0.5));
  for (const s of [1, -1]) {
    const n = add(sphere(0.009, 6, 4), M.mouth, V(s * 0.02, 0.785, 0.183), V(1, 0.5, 0.6));
    n.rotation.z = s * 0.5;
  }
  // mouth (munching)
  add(sphere(0.02, 8, 6), M.mouth, V(0, 0.762, 0.128), V(1, 0.55, 0.7));

  // eyes: drowsy half-closed
  for (const s of [1, -1]) {
    const ep = V(s * 0.062, 0.872, 0.142);
    add(sphere(0.02, 8, 6), M.eye, ep);
    const lid = add(new THREE.SphereGeometry(0.0225, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.47), M.furDark, ep);
    lid.rotation.set(0.5, 0, -s * 0.18);
    const lash = add(new THREE.BoxGeometry(0.044, 0.005, 0.008), M.lash, V(s * 0.062, 0.865, 0.162));
    lash.rotation.z = s * 0.2;
    // sleepy brow wrinkle
    const brow = add(new THREE.BoxGeometry(0.035, 0.006, 0.01), M.furDark, V(s * 0.066, 0.905, 0.15));
    brow.rotation.z = -s * 0.25;
  }

  // ears
  for (const s of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.14, 0.95, 0.0);
    ear.rotation.set(-0.1, s * 0.35, -s * 0.35);
    root.add(ear);
    add(sphere(1, 10, 8), M.fur, V(0, 0, 0), V(0.088, 0.08, 0.035), ear);
    add(sphere(1, 10, 6), M.earIn, V(0, -0.005, 0.018), V(0.06, 0.055, 0.02), ear);
    for (let i = 0; i < 9; i++) {
      const a = -0.6 + (i / 8) * 3.6;
      const ang = s > 0 ? a : Math.PI - a;
      const c = add(new THREE.ConeGeometry(0.016, 0.04, 5), i % 2 ? M.cream : M.earIn, V(Math.cos(ang) * 0.08, Math.sin(ang) * 0.072, 0.02), undefined, ear);
      c.rotation.z = ang - Math.PI / 2;
    }
    for (let i = 0; i < 4; i++) {
      const c = add(new THREE.ConeGeometry(0.01, 0.035, 4), M.cream, V((rng() - 0.5) * 0.04, (rng() - 0.5) * 0.04, 0.03), undefined, ear);
      c.rotation.set(1.2, 0, rng() * 6);
    }
  }

  // claws helper
  function claws(p: THREE.Vector3, dir: THREE.Vector3, spread: THREE.Vector3, n: number) {
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 0.016;
      const c = add(new THREE.ConeGeometry(0.0075, 0.032, 5), M.claw, p.clone().addScaledVector(spread, o));
      c.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    }
  }

  // right arm (-X) hugging the trunk
  const rS = V(-0.12, 0.68, 0.04), rE = V(-0.2, 0.62, 0.115), rH = V(-0.272, 0.64, 0.0);
  limb(rS, rE, 0.05, M.fur);
  limb(rE, rH, 0.042, M.fur);
  add(sphere(1, 8, 6), M.fur, rH, V(0.04, 0.05, 0.045));
  claws(V(-0.285, 0.64, -0.035), V(0.4, 0, -1), V(0, 1, 0), 3);
  claws(V(-0.245, 0.6, 0.06), V(0.6, -0.3, -0.4), V(0, 0, 1), 2);

  // left arm (+X) holding sprig to mouth
  const lS = V(0.12, 0.68, 0.04), lE = V(0.18, 0.59, 0.14), lH = V(0.075, 0.725, 0.185);
  limb(lS, lE, 0.05, M.fur);
  limb(lE, lH, 0.042, M.fur);
  add(sphere(1, 8, 6), M.fur, lH, V(0.045, 0.042, 0.04));
  add(sphere(1, 6, 5), M.pad, V(0.06, 0.72, 0.17), V(0.02, 0.025, 0.012));
  claws(V(0.045, 0.74, 0.21), V(-1, 0.3, 0.2), V(0, 1, 0), 3);
  claws(V(0.1, 0.705, 0.215), V(-0.5, 0.5, 0.6), V(1, 0, 0), 2);

  // eucalyptus sprig
  const sp0 = V(0.08, 0.7, 0.195), sp1 = V(0.22, 0.95, 0.24);
  rod(V(0.06, 0.66, 0.19), sp1, 0.006, 0.004, M.stem, 5);
  for (let k = 0; k < 6; k++) {
    const p = sp0.clone().lerp(sp1, 0.25 + k * 0.15);
    const side = k % 2 ? 1 : -1;
    leaf(p, V(side * 0.8 + 0.4, 0.3 - k * 0.05, 0.4 + rng() * 0.3), 0.09 + rng() * 0.03);
  }
  leaf(sp1, V(0.4, 1, 0.2), 0.1, M.leafC);
  // leaf being munched — tip disappears into mouth
  leaf(V(0.07, 0.735, 0.185), V(-0.07, 0.03, -0.045), 0.085, M.leafA, 1.4);
  leaf(V(0.07, 0.72, 0.19), V(-0.4, -0.6, 0.3), 0.06, M.leafBit, 0.3);

  // legs
  const legs = [
    { hip: V(0.09, 0.42, 0.05), knee: V(0.17, 0.47, 0.15), foot: V(0.15, 0.38, 0.08) },
    { hip: V(-0.09, 0.42, 0.05), knee: V(-0.15, 0.48, 0.15), foot: V(-0.185, 0.4, 0.075) },
  ];
  for (const L of legs) {
    limb(L.hip, L.knee, 0.062, M.fur);
    limb(L.knee, L.foot, 0.046, M.fur);
    add(sphere(1, 8, 6), M.fur, L.foot, V(0.045, 0.035, 0.055));
    add(sphere(1, 6, 5), M.pad, L.foot.clone().add(V(0, -0.025, 0.01)), V(0.03, 0.01, 0.035));
    claws(L.foot.clone().add(V(0, -0.02, 0.045)), V(0, -0.8, 0.5), V(1, 0, 0), 4);
  }

  // ---------- sleepy Zs ----------
  function Z(p: THREE.Vector3, s: number, tilt: number) {
    const g = new THREE.Group();
    g.position.copy(p);
    g.rotation.z = tilt;
    root.add(g);
    const w = s, h = s, t = s * 0.18;
    add(new THREE.BoxGeometry(w, t, t), M.zzz, V(0, h / 2, 0), undefined, g);
    add(new THREE.BoxGeometry(w, t, t), M.zzz, V(0, -h / 2, 0), undefined, g);
    const d = add(new THREE.BoxGeometry(Math.hypot(w, h), t, t), M.zzz, V(0, 0, 0), undefined, g);
    d.rotation.z = Math.atan2(h, w);
  }
  Z(V(0.2, 1.06, 0.06), 0.035, 0.15);
  Z(V(0.27, 1.16, 0.04), 0.05, -0.1);
  Z(V(0.36, 1.3, 0.02), 0.07, 0.12);

  return root;
}
