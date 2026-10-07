import * as THREE from "three";

export const meta = {
  name: "Savanna Lion",
  description:
    "A stylized low-poly male lion standing proud: a blocky tawny body with painted fur strokes, a three-layer flame mane, amber eyes, whisker pads, elbow tufts and a dark tail tassel.",
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

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const rand = rng(1337);

  // ---------- fur texture ----------
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#d9a04c";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const x = rand() * 256, y = rand() * 256;
    const light = rand() > 0.5;
    g.strokeStyle = light ? "rgba(246,206,130,0.35)" : "rgba(150,92,34,0.30)";
    g.lineWidth = 1 + rand() * 1.5;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rand() - 0.5) * 4, y + 5 + rand() * 7);
    g.stroke();
  }
  const furTex = new THREE.CanvasTexture(cv);
  furTex.colorSpace = THREE.SRGBColorSpace;

  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const M = (hex: string, rough = 0.85) => {
    if (!mats.has(hex))
      mats.set(hex, new THREE.MeshStandardMaterial({ color: hex, roughness: rough, flatShading: true }));
    return mats.get(hex)!;
  };
  const fur = new THREE.MeshStandardMaterial({ color: "#ffffff", map: furTex, roughness: 0.9, flatShading: true });
  const cream = M("#f2d9a2");
  const maneL = M("#d9822e");
  const maneM = M("#a5501f");
  const maneD = M("#5e2c14");
  const dark = M("#2a1913");
  const nose = M("#4a2a22", 0.5);
  const amber = M("#f3b42a", 0.3);
  const black = M("#0d0907", 0.3);
  const white = M("#ffffff", 0.2);
  const innerEar = M("#7a4a30");
  const whisk = M("#fff6e2");
  const pad = M("#c99a5a");

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);
  const up = new THREE.Vector3(0, 1, 0);
  const orient = (m: THREE.Object3D, dir: THREE.Vector3) => m.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material, seg = 6) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    orient(m, d);
    root.add(m);
    return m;
  };

  // ---------- body ----------
  box(0.78, 0.85, 0.55, fur, 0, 1.0, 0.5);          // chest
  box(0.7, 0.7, 0.95, fur, 0, 0.97, -0.12);          // barrel
  box(0.66, 0.72, 0.5, fur, 0, 1.0, -0.82);          // hips
  box(0.6, 0.2, 0.45, fur, 0, 1.38, 0.38, -0.12);    // shoulder hump
  box(0.5, 0.12, 1.15, cream, 0, 0.6, -0.12);        // belly
  box(0.56, 0.1, 0.4, cream, 0, 0.58, 0.45);         // chest underside
  box(0.48, 0.5, 0.4, fur, 0, 1.2, 0.72, -0.4);      // neck

  // ---------- legs ----------
  const toes = (x: number, z: number) => {
    for (const ox of [-0.09, -0.03, 0.03, 0.09]) {
      const t = add(new THREE.IcosahedronGeometry(0.048, 0), fur, x + ox, 0.045, z);
      t.scale.set(1, 0.85, 1.25);
    }
    box(0.22, 0.02, 0.2, pad, x, 0.012, z - 0.08);
  };
  for (const s of [-1, 1]) {
    const fx = 0.25 * s;
    box(0.25, 0.52, 0.3, fur, fx, 0.74, 0.5);
    box(0.19, 0.46, 0.21, fur, fx, 0.32, 0.53);
    box(0.25, 0.1, 0.26, fur, fx, 0.06, 0.56);
    toes(fx, 0.7);
    const tuft = add(new THREE.ConeGeometry(0.06, 0.18, 5), maneM, fx, 0.55, 0.33);
    orient(tuft, new THREE.Vector3(0, -0.6, -1));

    const rx = 0.24 * s;
    box(0.27, 0.58, 0.5, fur, rx, 0.84, -0.8);
    box(0.19, 0.4, 0.21, fur, rx, 0.48, -0.93, 0.35);
    box(0.16, 0.32, 0.17, fur, rx, 0.2, -0.97);
    box(0.24, 0.1, 0.26, fur, rx, 0.06, -0.9);
    toes(rx, -0.76);
  }

  // ---------- head ----------
  const H = new THREE.Vector3(0, 1.35, 1.0);
  box(0.48, 0.42, 0.45, fur, 0, H.y, H.z);                    // skull
  box(0.3, 0.22, 0.26, fur, 0, 1.24, 1.3);                    // muzzle
  box(0.17, 0.1, 0.3, fur, 0, 1.38, 1.27, 0.12);              // nose bridge
  box(0.17, 0.08, 0.13, cream, 0, 1.1, 1.33);                 // chin
  const nz = new THREE.CylinderGeometry(0.075, 0.03, 0.08, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 0.6);
  add(nz, nose, 0, 1.335, 1.44);
  box(0.012, 0.07, 0.02, dark, 0, 1.27, 1.445);
  box(0.14, 0.014, 0.02, dark, 0, 1.165, 1.43);               // mouth line
  for (const s of [-1, 1]) {
    const p = add(new THREE.IcosahedronGeometry(0.085, 0), cream, 0.075 * s, 1.215, 1.4);
    p.scale.set(1, 0.8, 0.75);
    for (let i = 0; i < 3; i++) {
      add(new THREE.IcosahedronGeometry(0.008, 0), dark, (0.06 + i * 0.03) * s, 1.225 + (i % 2) * 0.02, 1.455 - i * 0.008);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.24, 3), whisk);
      w.position.set(0.18 * s, 1.21 + (i - 1) * 0.025, 1.4);
      orient(w, new THREE.Vector3(s, (i - 1) * 0.25, 0.15));
      root.add(w);
    }
    // eyes
    const ex = 0.12 * s;
    box(0.115, 0.065, 0.02, dark, ex, 1.42, 1.226, 0, 0, -0.15 * s);
    box(0.085, 0.045, 0.02, amber, ex, 1.42, 1.232, 0, 0, -0.15 * s);
    box(0.024, 0.042, 0.02, black, ex, 1.42, 1.238);
    box(0.012, 0.012, 0.01, white, ex + 0.02 * s, 1.43, 1.246);
    box(0.15, 0.05, 0.1, fur, 0.125 * s, 1.475, 1.205, 0, 0, 0.22 * s); // brow
    box(0.1, 0.1, 0.12, cream, 0.17 * s, 1.27, 1.17);                 // cheek
    // ears
    add(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 6).rotateX(Math.PI / 2), fur, 0.2 * s, 1.6, 0.98);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6).rotateX(Math.PI / 2), innerEar, 0.2 * s, 1.6, 1.01);
  }

  // ---------- mane ----------
  const layers = [
    { z: 0.92, r: 0.27, n: 14, cr: 0.1, h: 0.3, back: 0.25, mat: maneL, off: 0 },
    { z: 0.78, r: 0.32, n: 16, cr: 0.13, h: 0.4, back: 0.45, mat: maneM, off: 0.5 },
    { z: 0.6, r: 0.35, n: 14, cr: 0.15, h: 0.46, back: 0.7, mat: maneD, off: 0.25 },
  ];
  for (const L of layers) {
    for (let i = 0; i < L.n; i++) {
      const a = ((i + L.off) / L.n) * Math.PI * 2 + (rand() - 0.5) * 0.12;
      const h = L.h * (0.85 + rand() * 0.3);
      const dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.95, -L.back).normalize();
      const c = new THREE.Mesh(new THREE.ConeGeometry(L.cr, h, 5), L.mat);
      c.position.set(Math.cos(a) * (L.r + h * 0.4), H.y + Math.sin(a) * (L.r + h * 0.4) * 0.95, L.z);
      orient(c, dir);
      root.add(c);
    }
  }
  const fill = add(new THREE.IcosahedronGeometry(0.46, 1), maneD, 0, 1.3, 0.62);
  fill.scale.set(1, 1.05, 0.8);
  // throat / chest mane
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.08;
    const c = add(new THREE.ConeGeometry(0.09, 0.35, 5), i % 2 ? maneM : maneL, x, 0.92, 0.82 - Math.abs(x) * 0.3);
    orient(c, new THREE.Vector3(x * 0.6, -1, 0.25));
  }
  // forehead fringe
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.09;
    const c = add(new THREE.ConeGeometry(0.06, 0.18, 5), maneL, x, 1.6, 1.08);
    orient(c, new THREE.Vector3(x * 0.8, 1, 0.5));
  }

  // ---------- tail ----------
  const pts = [
    [0, 1.1, -1.05], [0, 1.02, -1.3], [0, 0.85, -1.48], [0, 0.65, -1.58],
    [0, 0.48, -1.67], [0, 0.39, -1.8], [0, 0.39, -1.95], [0, 0.46, -2.06],
  ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  for (let i = 0; i < pts.length - 1; i++) {
    const r0 = 0.055 - i * 0.004, r1 = 0.055 - (i + 1) * 0.004;
    limb(pts[i], pts[i + 1], r0, r1, fur, 6);
    if (i > 0) add(new THREE.IcosahedronGeometry(r0, 0), fur, pts[i].x, pts[i].y, pts[i].z);
  }
  const tip = pts[pts.length - 1];
  add(new THREE.DodecahedronGeometry(0.09, 0), dark, tip.x, tip.y + 0.03, tip.z - 0.04);
  const tc = add(new THREE.ConeGeometry(0.07, 0.2, 5), dark, tip.x, tip.y + 0.09, tip.z - 0.1);
  orient(tc, new THREE.Vector3(0, 0.6, -1));

  return root;
}
