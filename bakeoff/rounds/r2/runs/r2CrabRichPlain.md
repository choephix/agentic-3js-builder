```ts
import * as THREE from "three";

export const meta = { name: "Feisty Red Rock Crab", description: "A brick-red rock crab with an oversized raised claw, stalk eyes, jointed legs, a barnacle and seaweed on its shell." };

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const root = new THREE.Group();
  const M = (c: number, r = 0.8) => new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true });
  // speckled texture
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#a82a1c"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = rnd() < 0.5 ? "#e8782a" : rnd() < 0.5 ? "#f3e2b8" : "#7d1a12";
    g.beginPath(); g.arc(rnd() * 128, rnd() * 128, 1 + rnd() * 2.2, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const shellM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, flatShading: true });
  const red = M(0xa82a1c), dark = M(0x2a1410, 0.5), cream = M(0xf3e2b8), orange = M(0xd8602a);
  const white = M(0xffffff, 0.3), black = M(0x000000, 0.3), bar = M(0xb8b0a0, 0.95), kelp = M(0x3f6b2a, 0.6), kelp2 = M(0x5a8a30, 0.6);

  const add = (p: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); p.add(me); return me;
  };
  // body
  const shell = add(root, new THREE.SphereGeometry(0.2, 10, 7), shellM, 0, 0.12, 0);
  shell.scale.set(1.5, 0.55, 1.1);
  const rim = add(root, new THREE.CylinderGeometry(0.27, 0.3, 0.04, 10), orange, 0, 0.07, 0.0);
  rim.scale.set(1.15, 1, 0.85);
  // knobs
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2, r = 0.05 + rnd() * 0.17;
    const x = Math.cos(a) * r * 1.35, z = Math.sin(a) * r * 0.95;
    const y = 0.12 + 0.11 * Math.sqrt(Math.max(0, 1 - (x / 0.3) ** 2 - (z / 0.22) ** 2));
    add(root, new THREE.IcosahedronGeometry(0.014 + rnd() * 0.014, 0), rnd() < 0.5 ? orange : cream, x, y, z);
  }
  // eyes
  for (const sx of [-1, 1]) {
    add(root, new THREE.CylinderGeometry(0.008, 0.01, 0.07, 5), cream, sx * 0.07, 0.24, 0.17);
    add(root, new THREE.SphereGeometry(0.03, 7, 6), white, sx * 0.07, 0.285, 0.175);
    add(root, new THREE.SphereGeometry(0.016, 6, 5), black, sx * 0.07, 0.288, 0.2);
  }
  // legs
  const seg = (p: THREE.Object3D, len: number, w: number, m: THREE.Material, tip = false) => {
    const geo = tip ? new THREE.ConeGeometry(w, len, 5) : new THREE.CylinderGeometry(w * 0.7, w, len, 5);
    const me = add(p, geo, m, 0, 0, 0);
    me.geometry.translate(0, tip ? -len / 2 : len / 2, 0);
    if (tip) me.rotation.x = 0;
    return me;
  };
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
    const z = 0.1 - i * 0.07, yaw = (0.25 + i * -0.18) ;
    const hip = new THREE.Group();
    hip.position.set(sx * 0.27, 0.1, z);
    hip.rotation.y = sx * (yaw * 0.6);
    root.add(hip);
    const up = new THREE.Group(); hip.add(up);
    up.rotation.z = -sx * 0.9;
    seg(up, 0.17, 0.018, red).rotation.z = 0;
    // seg points along +Y; rotate group so it goes outward-up
    up.children[0].rotation.z = 0;
    const knee = new THREE.Group(); knee.position.set(0, 0.17, 0); up.add(knee);
    add(knee, new THREE.SphereGeometry(0.022, 6, 5), orange);
    knee.rotation.z = sx * 2.3;
    seg(knee, 0.2, 0.015, red);
    const foot = new THREE.Group(); foot.position.set(0, 0.2, 0); knee.add(foot);
    foot.rotation.z = 0;
    const t = seg(foot, 0.06, 0.013, dark, true);
    t.rotation.x = Math.PI;
    t.geometry.translate(0, 0.06, 0);
  }
  // claws
  const claw = (big: boolean, sx: number) => {
    const k = big ? 1.8 : 1;
    const arm = new THREE.Group();
    arm.position.set(sx * 0.3, 0.13, 0.12);
    root.add(arm);
    const a1 = new THREE.Group(); arm.add(a1);
    a1.rotation.set(big ? -0.5 : -0.3, sx * (big ? 0.5 : -0.4), -sx * (big ? 0.5 : 0.7));
    seg(a1, 0.17 * (big ? 1.3 : 1), 0.025 * k * 0.8, red);
    const el = new THREE.Group(); el.position.y = 0.17 * (big ? 1.3 : 1); a1.add(el);
    add(el, new THREE.SphereGeometry(0.03 * k * 0.8, 6, 5), orange);
    el.rotation.set(big ? -0.4 : -0.9, 0, sx * (big ? 0.9 : 0.5));
    seg(el, 0.15 * (big ? 1.3 : 1), 0.022 * k * 0.8, red);
    const hand = new THREE.Group(); hand.position.y = 0.15 * (big ? 1.3 : 1); el.add(hand);
    hand.rotation.x = big ? -0.3 : -0.4;
    const palm = add(hand, new THREE.BoxGeometry(0.09 * k * 0.8, 0.12 * k * 0.8, 0.07 * k * 0.8), red, 0, 0.06 * k * 0.8, 0);
    add(hand, new THREE.IcosahedronGeometry(0.025 * k * 0.7, 0), cream, 0, 0.07 * k * 0.8, 0.04 * k * 0.8);
    const L = 0.14 * k * 0.8, W = 0.035 * k * 0.8;
    const py = 0.12 * k * 0.8;
    for (const f of [0, 1]) {
      const fg = new THREE.Group(); fg.position.set(0, py, (f ? 1 : -1) * 0.015 * k); hand.add(fg);
      fg.rotation.x = (f ? 1 : -1) * 0.0 + (f ? 0.28 : -0.28) * (big ? 1 : 0.6) * -1;
      add(fg, new THREE.BoxGeometry(W * 1.6, L, W), red, 0, L / 2, 0);
      add(fg, new THREE.ConeGeometry(W * 0.8, L * 0.4, 4), dark, 0, L + L * 0.15, 0);
      for (let t = 0; t < 3; t++) {
        const tt = add(fg, new THREE.ConeGeometry(0.006 * k, 0.02 * k, 3), cream, 0, L * (0.25 + t * 0.22), (f ? -1 : 1) * W * 0.55);
        tt.rotation.x = (f ? 1 : -1) * Math.PI / 2 * -1;
      }
    }
  };
  claw(true, 1);
  claw(false, -1);
  // barnacle
  const bc = add(root, new THREE.ConeGeometry(0.03, 0.04, 7, 1, true), bar, -0.08, 0.235, -0.06);
  bc.material = bar; (bar as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  add(root, new THREE.CylinderGeometry(0.014, 0.018, 0.012, 6), dark, -0.08, 0.252, -0.06);
  add(root, new THREE.ConeGeometry(0.018, 0.025, 6), bar, -0.04, 0.23, -0.1);
  // seaweed
  for (let i = 0; i < 5; i++) {
    let px = 0.08 + i * 0.012, py = 0.22, pz = -0.1;
    const m = i % 2 ? kelp : kelp2;
    for (let j = 0; j < 6; j++) {
      const sgm = add(root, new THREE.BoxGeometry(0.014, 0.05, 0.004), m, px, py + 0.02, pz);
      sgm.rotation.set(0.3 * j * 0.3, 0, -0.3 + Math.sin(j + i) * 0.35);
      px += Math.sin(sgm.rotation.z) * -0.04 + 0.004; py += 0.04; pz -= 0.012;
      if (j > 2) py -= 0.025;
    }
  }
  root.position.y = 0.0;
  // lift so leg tips touch floor
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y;
  const out = new THREE.Group(); out.add(root);
  return out;
}
```