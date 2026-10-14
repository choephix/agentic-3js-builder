import * as THREE from "three";

export const meta = {
  name: "Proud Emperor Penguin & Chick",
  description:
    "A stylized low-poly emperor penguin parent with glossy blue-black plumage, white belly fading to gold at the neck, golden ear patches and an orange-pink beak stripe, standing on a snowy floe while a fluffy grey chick peeks out from between its big black feet.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = rng(1337);
  const root = new THREE.Group();

  // ---------- textures ----------
  const bellyCanvas = document.createElement("canvas");
  bellyCanvas.width = 64;
  bellyCanvas.height = 256;
  const bctx = bellyCanvas.getContext("2d")!;
  const grad = bctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#f6c84a");
  grad.addColorStop(0.18, "#f9d872");
  grad.addColorStop(0.32, "#fbeec4");
  grad.addColorStop(0.45, "#fbfaf4");
  grad.addColorStop(1.0, "#f4f6f8");
  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, 64, 256);
  // subtle feather marks
  bctx.fillStyle = "rgba(180,190,205,0.18)";
  for (let i = 0; i < 90; i++) {
    const x = rand() * 64;
    const y = 90 + rand() * 166;
    bctx.fillRect(x, y, 3, 1);
  }
  const bellyTex = new THREE.CanvasTexture(bellyCanvas);
  bellyTex.colorSpace = THREE.SRGBColorSpace;

  const backCanvas = document.createElement("canvas");
  backCanvas.width = 128;
  backCanvas.height = 128;
  const kctx = backCanvas.getContext("2d")!;
  const g2 = kctx.createLinearGradient(0, 0, 0, 128);
  g2.addColorStop(0, "#141a2a");
  g2.addColorStop(0.5, "#27324a");
  g2.addColorStop(1, "#1a2130");
  kctx.fillStyle = g2;
  kctx.fillRect(0, 0, 128, 128);
  kctx.strokeStyle = "rgba(90,115,160,0.25)";
  kctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const x = rand() * 128;
    const y = rand() * 128;
    kctx.beginPath();
    kctx.moveTo(x, y);
    kctx.lineTo(x + 4, y + 2);
    kctx.stroke();
  }
  const backTex = new THREE.CanvasTexture(backCanvas);
  backTex.colorSpace = THREE.SRGBColorSpace;

  // ---------- materials ----------
  const mBack = new THREE.MeshStandardMaterial({ color: 0xffffff, map: backTex, roughness: 0.22, metalness: 0.15, flatShading: true });
  const mHead = new THREE.MeshStandardMaterial({ color: 0x10141f, roughness: 0.2, metalness: 0.15, flatShading: true });
  const mBelly = new THREE.MeshStandardMaterial({ color: 0xffffff, map: bellyTex, roughness: 0.6, flatShading: true });
  const mGold = new THREE.MeshStandardMaterial({ color: 0xf2a41e, roughness: 0.45, flatShading: true });
  const mPaleGold = new THREE.MeshStandardMaterial({ color: 0xf7d36a, roughness: 0.5, flatShading: true });
  const mBeak = new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.3, flatShading: true });
  const mStripe = new THREE.MeshStandardMaterial({ color: 0xf3765f, roughness: 0.4, flatShading: true });
  const mFeet = new THREE.MeshStandardMaterial({ color: 0x1e1d20, roughness: 0.75, flatShading: true });
  const mClaw = new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: 0.6, flatShading: true });
  const mEye = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });
  const mGlint = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x666666, roughness: 0.2 });
  const mWhite = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: 0.7, flatShading: true });
  const mChick = new THREE.MeshStandardMaterial({ color: 0x9da3aa, roughness: 0.95, flatShading: true });
  const mChickLight = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.95, flatShading: true });
  const mChickHead = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.85, flatShading: true });
  const mSnow = new THREE.MeshStandardMaterial({ color: 0xe9f2fa, roughness: 0.85, flatShading: true });
  const mIce = new THREE.MeshStandardMaterial({ color: 0xa9d2ec, roughness: 0.3, metalness: 0.05, flatShading: true });
  const mFlipperUnder = new THREE.MeshStandardMaterial({ color: 0xdfe3ea, roughness: 0.6, flatShading: true });

  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    p: [number, number, number],
    s: [number, number, number] = [1, 1, 1],
    r: [number, number, number] = [0, 0, 0]
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    parent.add(m);
    return m;
  };

  const sph = (seg = 12, rings = 9) => new THREE.SphereGeometry(1, seg, rings);
  const ico0 = new THREE.IcosahedronGeometry(1, 0);
  const ico1 = new THREE.IcosahedronGeometry(1, 1);

  // ---------- snow floe ----------
  add(root, new THREE.CylinderGeometry(0.62, 0.68, 0.05, 11), mSnow, [0, 0.025, 0.04]);
  add(root, new THREE.CylinderGeometry(0.68, 0.7, 0.012, 11), mIce, [0, 0.006, 0.04]);
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.42 + rand() * 0.18;
    const sz = 0.03 + rand() * 0.04;
    add(root, ico0, mSnow, [Math.cos(a) * rr, 0.05, Math.sin(a) * rr + 0.04], [sz, sz * 0.6, sz], [rand(), rand(), rand()]);
  }

  const base = 0.05;
  const P = new THREE.Group();
  P.position.y = base;
  root.add(P);

  // ---------- parent body ----------
  add(P, sph(14, 10), mBack, [0, 0.6, -0.02], [0.3, 0.46, 0.28]);
  // belly bulge (front)
  add(P, sph(14, 10), mBelly, [0, 0.6, 0.035], [0.27, 0.44, 0.255]);
  // chest / neck
  add(P, sph(12, 8), mBack, [0, 0.92, 0.0], [0.17, 0.15, 0.16]);
  add(P, sph(12, 8), mPaleGold, [0, 0.9, 0.05], [0.14, 0.12, 0.13]);
  // tail
  add(P, new THREE.ConeGeometry(0.07, 0.2, 6), mHead, [0, 0.12, -0.27], [1, 1, 0.45], [-2.3, 0, 0]);

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 1.02, 0.03);
  head.rotation.x = 0.3; // gazing down at the chick
  P.add(head);
  add(head, sph(12, 9), mHead, [0, 0, 0], [0.12, 0.115, 0.135]);

  // golden ear patches: comma shape down the neck
  for (const sx of [1, -1]) {
    add(head, sph(10, 7), mGold, [sx * 0.09, -0.03, -0.02], [0.045, 0.06, 0.055], [0.3, 0, sx * 0.2]);
    add(head, sph(10, 7), mGold, [sx * 0.1, -0.1, 0.0], [0.04, 0.07, 0.05], [0.5, 0, sx * -0.15]);
    add(head, sph(10, 7), mPaleGold, [sx * 0.085, -0.16, 0.04], [0.045, 0.06, 0.05], [0.6, 0, 0]);
    // eye
    add(head, sph(8, 6), mEye, [sx * 0.085, 0.025, 0.075], [0.016, 0.018, 0.016]);
    add(head, sph(6, 4), mGlint, [sx * 0.096, 0.033, 0.084], [0.005, 0.005, 0.005]);
  }

  // beak: long slender, gently downturned
  const beak = new THREE.Group();
  beak.position.set(0, -0.01, 0.12);
  beak.rotation.x = 0.22;
  head.add(beak);
  add(beak, new THREE.ConeGeometry(0.026, 0.17, 6), mBeak, [0, 0.005, 0.085], [0.75, 1, 1], [Math.PI / 2, 0, 0]);
  // orange-pink mandible stripe
  add(beak, new THREE.ConeGeometry(0.024, 0.12, 6), mStripe, [0, -0.009, 0.055], [0.85, 1, 0.45], [Math.PI / 2, 0, 0]);
  for (const sx of [1, -1]) {
    add(beak, new THREE.BoxGeometry(0.004, 0.009, 0.09), mStripe, [sx * 0.016, -0.004, 0.05], [1, 1, 1], [0, sx * -0.12, 0]);
  }

  // ---------- flippers ----------
  for (const sx of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.26, 0.82, -0.01);
    pivot.rotation.set(0.1, 0, sx * 0.38);
    P.add(pivot);
    add(pivot, sph(10, 8), mBack, [0, -0.18, 0], [0.028, 0.2, 0.075]);
    add(pivot, sph(10, 8), mFlipperUnder, [-sx * 0.008, -0.17, 0.008], [0.022, 0.17, 0.06]);
  }

  // ---------- legs & feet ----------
  for (const sx of [1, -1]) {
    add(P, new THREE.CylinderGeometry(0.04, 0.05, 0.12, 7), mFeet, [sx * 0.11, 0.08, 0.04]);
    const foot = new THREE.Group();
    foot.position.set(sx * 0.12, 0, 0.12);
    foot.rotation.y = sx * 0.28;
    P.add(foot);
    add(foot, sph(10, 6), mFeet, [0, 0.022, 0], [0.075, 0.03, 0.11]);
    for (let t = -1; t <= 1; t++) {
      const toe = new THREE.Group();
      toe.position.set(t * 0.042, 0.018, 0.07);
      toe.rotation.y = t * 0.3;
      foot.add(toe);
      add(toe, new THREE.CylinderGeometry(0.018, 0.024, 0.11, 6), mFeet, [0, 0, 0.05], [1, 0.7, 1], [Math.PI / 2, 0, 0]);
      add(toe, new THREE.ConeGeometry(0.012, 0.035, 5), mClaw, [0, -0.004, 0.12], [1, 0.7, 1], [Math.PI / 2 + 0.3, 0, 0]);
    }
  }

  // brood fold: a little belly flap above the chick
  add(P, sph(12, 6, ), mBelly, [0, 0.27, 0.19], [0.17, 0.07, 0.1], [0.3, 0, 0]);

  // ---------- chick ----------
  const C = new THREE.Group();
  C.position.set(0, 0.05, 0.28);
  C.rotation.y = 0.25;
  P.add(C);
  add(C, ico1, mChick, [0, 0.1, 0], [0.105, 0.1, 0.095]);
  add(C, ico1, mChickLight, [0, 0.09, 0.04], [0.08, 0.075, 0.07]);
  // fluff tufts
  for (let i = 0; i < 22; i++) {
    const th = rand() * Math.PI * 2;
    const ph = rand() * Math.PI * 0.8 + 0.1;
    const x = Math.sin(ph) * Math.cos(th) * 0.1;
    const y = Math.cos(ph) * 0.095 + 0.1;
    const z = Math.sin(ph) * Math.sin(th) * 0.09;
    const sz = 0.022 + rand() * 0.018;
    add(C, ico0, rand() > 0.4 ? mChick : mChickLight, [x, y, z], [sz, sz, sz], [rand() * 3, rand() * 3, rand() * 3]);
  }
  // little flippers
  for (const sx of [1, -1]) {
    add(C, sph(8, 6), mChick, [sx * 0.1, 0.11, 0.0], [0.018, 0.06, 0.035], [0, 0, sx * 0.6]);
  }
  // chick head
  const ch = new THREE.Group();
  ch.position.set(0, 0.24, 0.02);
  ch.rotation.set(-0.35, 0.15, 0.12); // looking up at parent
  C.add(ch);
  add(ch, ico1, mChickHead, [0, 0, 0], [0.07, 0.068, 0.07]);
  for (const sx of [1, -1]) {
    // white face mask
    add(ch, sph(8, 6), mWhite, [sx * 0.035, -0.004, 0.045], [0.032, 0.04, 0.03]);
    add(ch, sph(6, 5), mEye, [sx * 0.03, 0.006, 0.072], [0.011, 0.013, 0.008]);
    add(ch, sph(5, 4), mGlint, [sx * 0.033, 0.011, 0.079], [0.0035, 0.0035, 0.003]);
  }
  add(ch, new THREE.ConeGeometry(0.012, 0.04, 5), mBeak, [0, -0.015, 0.08], [1, 1, 1], [Math.PI / 2 + 0.2, 0, 0]);
  // fluffy cowlick
  for (let i = 0; i < 3; i++) {
    add(ch, new THREE.ConeGeometry(0.01, 0.04, 4), mChickHead, [(i - 1) * 0.012, 0.07, -0.005], [1, 1, 1], [-0.2, 0, (i - 1) * 0.4]);
  }

  return root;
}
