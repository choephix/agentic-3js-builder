```ts
import * as THREE from "three";

export const meta = {
  name: "Vintage Dutch City Bicycle",
  description:
    "A mint green omafiets with tall cream-gripped bars, a chrome bell, a leather sprung saddle, chrome guards, whitewall tyres, and a wicker basket of sunflowers and a baguette.",
};

const UP = new THREE.Vector3(0, 1, 0);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

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

// A cylinder stretched between two points (used for tubes, spokes, cables).
function link(p: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const d = b.clone().sub(a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  p.add(m);
  return m;
}

function ball(p: THREE.Object3D, c: THREE.Vector3, r: number, mat: THREE.Material) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), mat);
  m.position.copy(c);
  p.add(m);
  return m;
}

function makeWicker(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c39a5c";
  g.fillRect(0, 0, 128, 128);
  for (let k = -128; k <= 256; k += 16) {
    g.strokeStyle = "#7d5128";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + 128, 128);
    g.stroke();
    g.strokeStyle = "#e0bd82";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(k + 8, 0);
    g.lineTo(k + 136, 128);
    g.stroke();
    g.strokeStyle = "#8a5c30";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(k, 128);
    g.lineTo(k + 128, 0);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function buildBike(): THREE.Object3D {
  const rand = rng(20240611);
  const root = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  const mint = new THREE.MeshStandardMaterial({ color: 0x9fd9bf, roughness: 0.38, metalness: 0.05 });
  const mintDS = mint.clone();
  mintDS.side = THREE.DoubleSide;
  const cream = new THREE.MeshStandardMaterial({ color: 0xf4ebd6, roughness: 0.6 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.16, metalness: 1 });
  const chromeDS = chrome.clone();
  chromeDS.side = THREE.DoubleSide;
  const leather = new THREE.MeshStandardMaterial({ color: 0x6b3f22, roughness: 0.55 });
  const tyre = new THREE.MeshStandardMaterial({ color: 0x1e1e20, roughness: 0.85 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.5, metalness: 0.6 });
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x55595e, roughness: 0.4, metalness: 0.8 });
  const wicker = new THREE.MeshStandardMaterial({
    map: makeWicker(),
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf5b700, roughness: 0.5 });
  const seedMat = new THREE.MeshStandardMaterial({ color: 0x4b2a12, roughness: 0.9 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5f8f3a, roughness: 0.7 });
  const bread = new THREE.MeshStandardMaterial({ color: 0xd9a25c, roughness: 0.7 });
  const breadDark = new THREE.MeshStandardMaterial({ color: 0xa8702f, roughness: 0.8 });

  // ---------- Wheels ----------
  function buildWheel(z: number) {
    const g = new THREE.Group();
    g.position.set(0, 0.34, z);
    g.rotation.y = Math.PI / 2; // local +Z becomes the axle (X)

    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.03, 10, 36), tyre));

    for (const s of [-1, 1]) {
      const geo = new THREE.TorusGeometry(0.31, 0.034, 8, 36);
      geo.scale(1, 1, 0.35);
      const ww = new THREE.Mesh(geo, cream);
      ww.position.z = s * 0.026;
      g.add(ww);
    }

    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.007, 6, 36), chrome));

    const hubGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.13, 10);
    hubGeo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(hubGeo, chrome));

    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      link(g, v(0, 0, 0), v(Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0), 0.0016, chrome);
    }

    // Chrome mudguard: open arc over the top of the tyre.
    const fGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.09, 28, 1, true, Math.PI * 0.667, Math.PI * 0.667);
    fGeo.rotateX(Math.PI / 2);
    g.add(new THREE.Mesh(fGeo, chromeDS));

    root.add(g);
  }
  buildWheel(0.52);
  buildWheel(-0.52);

  // ---------- Frame (mint) ----------
  const bb = v(0, 0.3, 0);
  const headBot = v(0, 0.8, 0.4);
  const headTop = v(0, 1.0, 0.4);
  const seatTop = v(0, 0.95, -0.14);

  link(root, headBot, headTop, 0.02, mint);
  link(root, v(0, 0.97, 0.4), seatTop, 0.017, mint);
  link(root, v(0, 0.84, 0.4), bb, 0.02, mint);
  link(root, bb, seatTop, 0.018, mint);
  for (const s of [-1, 1]) {
    link(root, v(s * 0.02, 0.9, -0.13), v(s * 0.06, 0.34, -0.52), 0.011, mint);
    link(root, v(s * 0.03, 0.3, 0), v(s * 0.06, 0.34, -0.52), 0.012, mint);
    link(root, v(s * 0.05, 0.78, 0.42), v(s * 0.06, 0.34, 0.52), 0.012, mint);
  }
  link(root, v(-0.05, 0.78, 0.42), v(0.05, 0.78, 0.42), 0.011, mint);

  // Lugs at joints
  ball(root, headBot, 0.024, mint);
  ball(root, headTop, 0.024, mint);
  ball(root, bb, 0.026, mint);
  ball(root, seatTop, 0.022, mint);
  for (const s of [-1, 1]) {
    ball(root, v(s * 0.06, 0.34, -0.52), 0.016, dark);
    ball(root, v(s * 0.06, 0.34, 0.52), 0.016, dark);
  }

  // ---------- Chrome cockpit ----------
  const stemTop = v(0, 1.1, 0.38);
  link(root, headTop, stemTop, 0.016, chrome);

  for (const s of [-1, 1]) {
    const P = v(s * 0.22, 1.19, 0.3);
    link(root, stemTop, P, 0.011, chrome);
    const g0 = stemTop.clone().lerp(P, 0.62);
    const g1 = P.clone().add(v(s * 0.03, 0.005, -0.02));
    link(root, g0, g1, 0.017, cream);
    ball(root, g1, 0.017, cream);
  }

  // Silver bell clamped to the right bar
  const bellMount = v(0.1, 1.155, 0.343);
  const mountGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10);
  const mountMesh = new THREE.Mesh(mountGeo, chrome);
  mountMesh.position.copy(bellMount);
  root.add(mountMesh);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), chrome);
  dome.position.set(0.1, 1.165, 0.343);
  root.add(dome);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), chrome);
  button.position.set(0.1, 1.2, 0.343);
  root.add(button);

  // ---------- Saddle, post and springs ----------
  link(root, seatTop, v(0, 0.99, -0.19), 0.013, chrome);
  for (let i = 0; i < 4; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.003, 6, 16), chrome);
    t.rotation.x = Math.PI / 2;
    t.position.set(0, 0.975 + i * 0.008, -0.19);
    root.add(t);
  }
  const saddle = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), leather);
  saddle.scale.set(0.09, 0.035, 0.17);
  saddle.position.set(0, 1.03, -0.2);
  root.add(saddle);

  // ---------- Chain, chainring, cranks, pedals ----------
  const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 20), chainMat);
  chainring.rotation.z = Math.PI / 2;
  chainring.position.set(0.05, 0.3, 0);
  root.add(chainring);

  const sprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 16), chainMat);
  sprocket.rotation.z = Math.PI / 2;
  sprocket.position.set(0.05, 0.34, -0.52);
  root.add(sprocket);

  link(root, v(0.05, 0.39, 0), v(0.05, 0.385, -0.52), 0.004, chainMat);
  link(root, v(0.05, 0.21, 0), v(0.05, 0.295, -0.52), 0.004, chainMat);

  // Chain guard: a shroud over the upper-rear quarter of the chainring.
  const cgGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.09, 24, 1, true, Math.PI / 2, Math.PI / 2);
  cgGeo.rotateX(Math.PI / 2);
  const cg = new THREE.Mesh(cgGeo, mintDS);
  const cgGroup = new THREE.Group();
  cgGroup.position.set(0.05, 0.3, 0);
  cgGroup.rotation.y = Math.PI / 2;
  cgGroup.add(cg);
  root.add(cgGroup);

  link(root, v(-0.08, 0.3, 0), v(0.08, 0.3, 0), 0.014, dark);
  link(root, v(0.075, 0.3, 0), v(0.075, 0.14, 0.04), 0.008, dark);
  link(root, v(-0.075, 0.3, 0), v(-0.075, 0.46, -0.04), 0.008, dark);
  for (const [px, py, pz] of [
    [0.075, 0.14, 0.04],
    [-0.075, 0.46, -0.04],
  ] as const) {
    const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.014, 0.1), dark);
    pedal.position.set(px, py, pz);
    root.add(pedal);
  }

  // ---------- Front wicker basket ----------
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.22, 8, 1, true), wicker);
  basket.position.set(0, 0.9, 0.66);
  root.add(basket);

  const basketBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 8), wicker);
  basketBase.position.set(0, 0.79, 0.66);
  root.add(basketBase);

  const basketRim = new THREE.TorusGeometry(0.17, 0.012, 6, 24);
  basketRim.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(basketRim, mint);
  rimMesh.position.set(0, 1.01, 0.66);
  root.add(rimMesh);

  // Mount strut from head tube to basket floor
  link(root, v(0, 0.84, 0.4), v(0, 0.79, 0.62), 0.008, chrome);

  // Sunflowers
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.4;
    const rad = 0.04 + rand() * 0.04;
    const ox = Math.cos(a) * rad;
    const oz = Math.sin(a) * rad;
    const base = v(ox * 0.6, 0.82, 0.66 + oz * 0.6);
    const headPos = v(ox * 1.8, 1.07 + rand() * 0.07, 0.66 + oz * 1.8);
    link(root, base, headPos, 0.005, stemMat);

    const head = new THREE.Group();
    head.position.copy(headPos);
    const petals = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 20), yellow);
    head.add(petals);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), seedMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.z = 0.005;
    head.add(disc);
    const dir = v(ox * 0.6, 1, oz * 0.6).normalize();
    head.lookAt(headPos.clone().add(dir));
    root.add(head);
  }

  // Baguette resting across the top of the basket
  const baguette = new THREE.Group();
  baguette.position.set(0.0, 1.03, 0.68);
  baguette.rotation.y = 0.25;
  const loaf = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.3, 4, 10), bread);
  loaf.rotation.z = Math.PI / 2;
  baguette.add(loaf);
  for (const sx of [-0.08, 0, 0.08]) {
    const slash = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 0.05), breadDark);
    slash.position.set(sx, 0.025, 0);
    baguette.add(slash);
  }
  root.add(baguette);

  return root;
}
```