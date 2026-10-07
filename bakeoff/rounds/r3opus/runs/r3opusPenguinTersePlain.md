```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Penguin on an Ice Floe",
  description:
    "A stylized, low-poly emperor penguin in a striped knit scarf, standing on a faceted ice floe beside a small fish. Its belly carries a hand-drawn feather gradient.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = rng(1234);
  const root = new THREE.Group();

  // ---------- Textures ----------
  const bellyCanvas = document.createElement("canvas");
  bellyCanvas.width = 256;
  bellyCanvas.height = 256;
  const bc = bellyCanvas.getContext("2d")!;
  const g = bc.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#ffc94a");
  g.addColorStop(0.28, "#fff1c4");
  g.addColorStop(0.5, "#ffffff");
  g.addColorStop(1, "#eef3f8");
  bc.fillStyle = g;
  bc.fillRect(0, 0, 256, 256);
  bc.strokeStyle = "rgba(150,170,195,0.35)";
  bc.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const x = rand() * 256;
    const y = 90 + rand() * 160;
    bc.beginPath();
    bc.moveTo(x - 5, y - 3);
    bc.lineTo(x, y + 2);
    bc.lineTo(x + 5, y - 3);
    bc.stroke();
  }
  const bellyTex = new THREE.CanvasTexture(bellyCanvas);
  bellyTex.colorSpace = THREE.SRGBColorSpace;

  const scarfCanvas = document.createElement("canvas");
  scarfCanvas.width = 64;
  scarfCanvas.height = 64;
  const sc = scarfCanvas.getContext("2d")!;
  sc.fillStyle = "#d8283a";
  sc.fillRect(0, 0, 64, 64);
  sc.fillStyle = "#fff6e8";
  sc.fillRect(0, 22, 64, 10);
  sc.fillStyle = "#1f6fb5";
  sc.fillRect(0, 48, 64, 6);
  sc.strokeStyle = "rgba(0,0,0,0.15)";
  for (let x = 0; x < 64; x += 8) {
    sc.beginPath();
    sc.moveTo(x, 0);
    sc.lineTo(x + 4, 64);
    sc.stroke();
  }
  const scarfTex = new THREE.CanvasTexture(scarfCanvas);
  scarfTex.colorSpace = THREE.SRGBColorSpace;
  scarfTex.wrapS = scarfTex.wrapT = THREE.RepeatWrapping;
  scarfTex.repeat.set(6, 1);
  const scarfTailTex = scarfTex.clone();
  scarfTailTex.repeat.set(1, 3);
  scarfTailTex.rotation = Math.PI / 2;
  scarfTailTex.needsUpdate = true;

  // ---------- Materials ----------
  const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, ...extra });
  const mBlack = flat("#1c2230", { roughness: 0.5 });
  const mBelly = new THREE.MeshStandardMaterial({ color: "#ffffff", map: bellyTex, flatShading: true, roughness: 0.8 });
  const mOrange = flat("#ff9a1f");
  const mFoot = flat("#f27d16");
  const mBeak = flat("#2a2a33", { roughness: 0.4 });
  const mEyeW = flat("#ffffff", { roughness: 0.3 });
  const mPupil = flat("#0a0a10", { roughness: 0.2 });
  const mIce = flat("#8fd3f0", { roughness: 0.25, metalness: 0.05 });
  const mIceDeep = flat("#4fa6d6", { roughness: 0.3 });
  const mSnow = flat("#f4f9ff", { roughness: 0.95 });
  const mScarf = new THREE.MeshStandardMaterial({ color: "#ffffff", map: scarfTex, flatShading: true, roughness: 0.9 });
  const mScarfTail = new THREE.MeshStandardMaterial({ color: "#ffffff", map: scarfTailTex, flatShading: true, roughness: 0.9 });
  const mFringe = flat("#d8283a", { roughness: 0.9 });
  const mFish = flat("#7fa6c4", { roughness: 0.3, metalness: 0.3 });
  const mFishBelly = flat("#d9e6ee", { roughness: 0.3, metalness: 0.2 });
  const mCheek = flat("#ff8fa0", { roughness: 0.9 });

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    p: [number, number, number],
    s: [number, number, number] = [1, 1, 1],
    r: [number, number, number] = [0, 0, 0],
    parent: THREE.Object3D = root
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    parent.add(m);
    return m;
  };

  const sph = (w = 12, h = 9) => new THREE.SphereGeometry(1, w, h);

  // ---------- Ice floe ----------
  add(new THREE.CylinderGeometry(0.56, 0.48, 0.09, 8), mIce, [0, 0.045, 0], [1, 1, 0.85], [0, 0.2, 0]);
  add(new THREE.CylinderGeometry(0.5, 0.56, 0.02, 8), mIceDeep, [0, 0.005, 0], [1, 1, 0.85], [0, 0.2, 0]);
  add(new THREE.CylinderGeometry(0.5, 0.53, 0.03, 8), mSnow, [0.01, 0.1, -0.01], [1, 1, 0.82], [0, 0.6, 0]);
  // snow lumps
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.25 + rand() * 0.2;
    const sz = 0.03 + rand() * 0.04;
    add(sph(6, 4), mSnow, [Math.cos(a) * rr, 0.11, Math.sin(a) * rr * 0.8], [sz * 1.4, sz * 0.7, sz]);
  }
  // little ice crystals
  for (let i = 0; i < 4; i++) {
    const a = -2.2 + i * 0.5 + rand() * 0.2;
    const rr = 0.38 + rand() * 0.06;
    const h = 0.06 + rand() * 0.06;
    add(new THREE.ConeGeometry(0.025, h, 4), mIce, [Math.cos(a) * rr, 0.115 + h / 2, Math.sin(a) * rr * 0.8], [1, 1, 1], [rand() * 0.3, rand(), rand() * 0.3]);
  }

  const Y0 = 0.115;
  const peng = new THREE.Group();
  root.add(peng);

  // ---------- Feet ----------
  for (const sx of [1, -1]) {
    const foot = new THREE.Group();
    foot.position.set(0.085 * sx, Y0 + 0.015, 0.07);
    foot.rotation.y = 0.25 * sx;
    peng.add(foot);
    add(sph(8, 5), mFoot, [0, 0.005, 0], [0.05, 0.022, 0.05], [0, 0, 0], foot);
    for (const t of [-1, 0, 1]) {
      const toe = add(new THREE.BoxGeometry(0.028, 0.022, 0.085), mFoot, [t * 0.026, 0, 0.05], [1, 1, 1], [0, t * 0.4, 0], foot);
      toe.position.x += Math.sin(t * 0.4) * 0.03;
      add(new THREE.ConeGeometry(0.012, 0.025, 4), mBeak, [toe.position.x + Math.sin(t * 0.4) * 0.045, 0, 0.05 + 0.045 * Math.cos(t * 0.4)], [1, 1, 1], [Math.PI / 2, 0, -t * 0.4], foot);
    }
  }

  // ---------- Body ----------
  add(sph(12, 10), mBlack, [0, Y0 + 0.36, 0], [0.24, 0.36, 0.22]);
  add(sph(12, 10), mBelly, [0, Y0 + 0.34, 0.1], [0.19, 0.31, 0.14]);
  // tail
  add(new THREE.ConeGeometry(0.06, 0.12, 5), mBlack, [0, Y0 + 0.05, -0.2], [1, 1, 0.5], [-Math.PI / 2 - 0.5, 0, 0]);

  // flippers
  for (const sx of [1, -1]) {
    const f = new THREE.Group();
    f.position.set(0.235 * sx, Y0 + 0.5, -0.01);
    f.rotation.set(0.1, 0, 0.42 * sx);
    peng.add(f);
    add(sph(8, 8), mBlack, [0, -0.17, 0], [0.028, 0.2, 0.075], [0, 0, 0], f);
    add(sph(6, 6), mBelly, [-0.012 * sx, -0.19, 0.005], [0.016, 0.16, 0.055], [0, 0, 0], f);
  }

  // ---------- Head ----------
  const HY = Y0 + 0.75;
  add(sph(12, 10), mBlack, [0, HY, 0.02], [0.14, 0.14, 0.14]);
  // orange ear patches
  for (const sx of [1, -1]) {
    add(sph(8, 6), mOrange, [0.112 * sx, HY - 0.065, 0.05], [0.03, 0.075, 0.05], [0.3, 0, -0.35 * sx]);
    // eyes
    add(sph(8, 6), mEyeW, [0.062 * sx, HY + 0.025, 0.135], [0.032, 0.036, 0.022]);
    add(sph(8, 6), mPupil, [0.058 * sx, HY + 0.022, 0.152], [0.019, 0.023, 0.01]);
    add(sph(5, 4), mEyeW, [0.052 * sx, HY + 0.033, 0.161], [0.006, 0.006, 0.004]);
    // brows
    add(new THREE.BoxGeometry(0.05, 0.01, 0.012), mBeak, [0.064 * sx, HY + 0.072, 0.142], [1, 1, 1], [-0.3, 0, -0.25 * sx]);
    // cheeks
    add(sph(6, 4), mCheek, [0.09 * sx, HY - 0.025, 0.115], [0.022, 0.012, 0.01], [0, 0.6 * sx, 0]);
  }
  // beak
  add(new THREE.ConeGeometry(0.034, 0.14, 6), mBeak, [0, HY - 0.012, 0.215], [1, 1, 0.7], [Math.PI / 2 + 0.15, 0, 0]);
  add(new THREE.ConeGeometry(0.026, 0.1, 6), mOrange, [0, HY - 0.03, 0.2], [1, 1, 0.5], [Math.PI / 2 + 0.22, 0, 0]);
  // crown feather tuft
  add(new THREE.ConeGeometry(0.02, 0.06, 4), mBlack, [0.01, HY + 0.15, 0.01], [1, 1, 1], [0, 0, -0.3]);
  add(new THREE.ConeGeometry(0.015, 0.045, 4), mBlack, [-0.02, HY + 0.14, 0], [1, 1, 1], [0, 0, 0.4]);

  // ---------- Scarf ----------
  add(new THREE.TorusGeometry(0.15, 0.042, 6, 14), mScarf, [0, Y0 + 0.635, 0.015], [1, 1, 0.95], [Math.PI / 2 + 0.08, 0, 0]);
  const tail = new THREE.Group();
  tail.position.set(0.075, Y0 + 0.62, 0.2);
  tail.rotation.set(-0.28, 0, 0.18);
  peng.add(tail);
  add(new THREE.BoxGeometry(0.075, 0.24, 0.025), mScarfTail, [0, -0.11, 0], [1, 1, 1], [0, 0, 0], tail);
  for (let i = 0; i < 4; i++) {
    add(new THREE.BoxGeometry(0.012, 0.04, 0.012), mFringe, [-0.027 + i * 0.018, -0.25, 0], [1, 1, 1], [0, 0, (i - 1.5) * 0.08], tail);
  }
  add(sph(6, 5), mScarf, [0.1, Y0 + 0.63, 0.15], [0.04, 0.035, 0.035]);

  // ---------- Fish ----------
  const fish = new THREE.Group();
  fish.position.set(-0.3, 0.135, 0.22);
  fish.rotation.y = 0.7;
  root.add(fish);
  add(sph(8, 6), mFish, [0, 0, 0], [0.07, 0.025, 0.03], [0, 0, 0], fish);
  add(sph(6, 4), mFishBelly, [0, -0.01, 0.005], [0.055, 0.015, 0.025], [0, 0, 0], fish);
  add(new THREE.ConeGeometry(0.03, 0.045, 4), mFish, [-0.085, 0, 0], [1, 1, 0.35], [0, 0, -Math.PI / 2], fish);
  add(sph(5, 4), mPupil, [0.048, 0.008, 0.022], [0.006, 0.006, 0.004], [0, 0, 0], fish);

  return root;
}
```