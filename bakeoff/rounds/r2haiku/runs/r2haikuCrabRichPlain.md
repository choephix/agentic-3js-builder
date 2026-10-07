```ts
import * as THREE from "three";

export const meta = {
  name: "Feisty Red Rock Crab",
  description:
    "A brick-red rock crab with a knobbly speckled shell, eyes on stalks, eight pointed walking legs, and one oversized raised claw. A barnacle and seaweed cling to its back.",
};

// Seeded generator so every run builds the same crab.
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

export default function createModel(): THREE.Object3D {
  const rng = mulberry32(1187);
  const root = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  // Speckled shell texture drawn on a canvas.
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#9b2c1b";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = "rgba(60,14,8,0.35)";
    ctx.beginPath();
    ctx.arc(rng() * 512, rng() * 512, 6 + rng() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 380; i++) {
    ctx.fillStyle = rng() < 0.6 ? "#e0722a" : "#f1e2b8";
    ctx.beginPath();
    ctx.arc(rng() * 512, rng() * 512, 1.5 + rng() * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const shellTex = new THREE.CanvasTexture(canvas);
  shellTex.colorSpace = THREE.SRGBColorSpace;

  const shellMat = new THREE.MeshStandardMaterial({ map: shellTex, roughness: 0.8 });
  const knobOrange = new THREE.MeshStandardMaterial({ color: 0xe0722a, roughness: 0.7 });
  const knobCream = new THREE.MeshStandardMaterial({ color: 0xf1e2b8, roughness: 0.6 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x6b2418, roughness: 0.75 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xb5321f, roughness: 0.7 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x1a1412, roughness: 0.6 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.3 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0xd9531e, roughness: 0.7 });
  const barnacleMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b0, roughness: 0.9 });
  const seaweedMat = new THREE.MeshStandardMaterial({ color: 0x3f7a2e, roughness: 0.6, side: THREE.DoubleSide });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x2a0d08, roughness: 0.9 });

  // ---------- Helpers ----------
  const UP = new THREE.Vector3(0, 1, 0);

  // Cylinder-like limb between two points. topR < r gives a taper toward b.
  function limb(a: number[], b: number[], r: number, mat: THREE.Material, topR?: number) {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(b[0], b[1], b[2]);
    const d = new THREE.Vector3().subVectors(B, A);
    const len = d.length();
    const geo = new THREE.CylinderGeometry(topR ?? r * 0.75, r, len, 7);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    root.add(mesh);
    return mesh;
  }

  function joint(p: number[], r: number, mat: THREE.Material, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(sx, sy, sz);
    root.add(m);
    return m;
  }

  // ---------- Shell ----------
  const shellCenterY = 0.1;
  const RX = 0.2, RY = 0.08, RZ = 0.15;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), shellMat);
  shell.scale.set(RX, RY, RZ);
  shell.position.set(0, shellCenterY, 0);
  root.add(shell);

  // Front ridge lip over the eyes
  const lip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.05, 1, 1, 1), shellMat);
  lip.position.set(0, 0.125, 0.12);
  lip.rotation.x = -0.25;
  root.add(lip);

  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), mouthMat);
  mouth.position.set(0, 0.075, 0.148);
  root.add(mouth);

  // Knobs scattered over the upper shell surface
  let knobs = 0;
  let attempts = 0;
  while (knobs < 46 && attempts < 4000) {
    attempts++;
    const x = (rng() * 2 - 1) * RX * 0.92;
    const z = (rng() * 2 - 1) * RZ * 0.92;
    const k = (x / RX) ** 2 + (z / RZ) ** 2;
    if (k > 0.82) continue;
    const y = shellCenterY + RY * Math.sqrt(1 - k);
    // Keep the eye stalks clear
    if (Math.abs(x) < 0.09 && z > 0.06) continue;
    const n = new THREE.Vector3(x / (RX * RX), (y - shellCenterY) / (RY * RY), z / (RZ * RZ)).normalize();
    const size = 0.011 + rng() * 0.012;
    const mat = rng() < 0.55 ? knobOrange : knobCream;
    const knob = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), mat);
    knob.position.set(x, y - size * 0.2, z);
    knob.quaternion.setFromUnitVectors(UP, n);
    knob.rotateY(rng() * Math.PI);
    knob.scale.set(1, 0.7 + rng() * 0.4, 1);
    root.add(knob);
    knobs++;
  }

  // ---------- Eyes on stalks ----------
  for (const s of [1, -1]) {
    const base = [s * 0.05, 0.14, 0.12];
    const top = [s * 0.056, 0.2, 0.136];
    limb(base, top, 0.011, stalkMat);
    joint(base, 0.013, stalkMat);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), eyeMat);
    eye.position.set(top[0], top[1] + 0.012, top[2] + 0.004);
    root.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 4), eyeWhite);
    glint.position.set(eye.position.x + s * 0.006, eye.position.y + 0.007, eye.position.z + 0.014);
    root.add(glint);
  }

  // ---------- Barnacle and seaweed on the back ----------
  const barnacle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.012, 6), barnacleMat);
  barnacle.position.set(0.03, 0.166, -0.09);
  barnacle.rotation.x = -0.4;
  root.add(barnacle);
  const barnacleTop = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.004, 0.004, 4), tipMat);
  barnacleTop.position.set(0.03, 0.174, -0.092);
  barnacleTop.rotation.x = -0.4;
  root.add(barnacleTop);

  const weedCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.03, 0.165, -0.09),
    new THREE.Vector3(-0.04, 0.19, -0.1),
    new THREE.Vector3(-0.03, 0.225, -0.115),
    new THREE.Vector3(-0.06, 0.26, -0.13),
    new THREE.Vector3(-0.05, 0.29, -0.155),
  ]);
  const weed = new THREE.Mesh(new THREE.TubeGeometry(weedCurve, 20, 0.0045, 5, false), seaweedMat);
  root.add(weed);
  for (const t of [0.35, 0.65]) {
    const p = weedCurve.getPointAt(t);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), seaweedMat);
    leaf.scale.set(0.022, 0.006, 0.01);
    leaf.position.copy(p);
    leaf.rotation.set(0.3, 0, t > 0.5 ? 0.8 : -0.8);
    root.add(leaf);
  }

  // ---------- Walking legs (4 per side) ----------
  const zs = [0.06, 0.0, -0.06, -0.12];
  for (const s of [1, -1]) {
    zs.forEach((z, i) => {
      const spread = 0.9 + i * 0.04;
      const hip = [s * 0.1, 0.11, z];
      const knee = [s * 0.25 * spread, 0.15 - i * 0.005, z + 0.02];
      const ankle = [s * 0.33 * spread, 0.05, z - 0.02];
      const tip = [s * 0.37 * spread, 0.0, z - 0.035];
      limb(hip, knee, 0.02, legMat);
      joint(knee, 0.021, legMat);
      limb(knee, ankle, 0.015, legMat);
      joint(ankle, 0.016, legMat);
      limb(ankle, tip, 0.012, tipMat, 0.001);
    });
  }

  // ---------- Claws ----------
  function pincer(from: number[], to: number[], r: number, teethDir: number, sc: number) {
    limb(from, to, r, clawMat, 0.004 * sc);
    // Dark tip
    const tp = new THREE.Mesh(new THREE.SphereGeometry(r * 1.1, 7, 5), tipMat);
    tp.position.set(to[0], to[1], to[2]);
    root.add(tp);
    // Little teeth on the inner edge
    for (const t of [0.35, 0.55, 0.75]) {
      const px = from[0] + (to[0] - from[0]) * t;
      const py = from[1] + (to[1] - from[1]) * t;
      const pz = from[2] + (to[2] - from[2]) * t;
      limb([px, py, pz], [px, py + teethDir * 0.014 * sc, pz + 0.004], 0.006 * sc, tipMat, 0.0008);
    }
  }

  function claw(wrist: number[], scale: number, teethOffset: number) {
    const [wx, wy, wz] = wrist;
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), clawMat);
    palm.scale.set(0.07 * scale, 0.06 * scale, 0.085 * scale);
    palm.position.set(wx, wy, wz + 0.04 * scale);
    root.add(palm);
    const L = 0.2 * scale;
    // Upper and lower pincers meeting at a small gap
    pincer(
      [wx + 0.02 * scale, wy + 0.03 * scale, wz + 0.06 * scale],
      [wx - 0.004 * scale, wy + 0.012 * scale, wz + 0.06 * scale + L],
      0.02 * scale,
      -1,
      scale
    );
    pincer(
      [wx + 0.02 * scale, wy - 0.03 * scale, wz + 0.06 * scale],
      [wx - 0.004 * scale, wy - 0.012 * scale, wz + 0.06 * scale + L],
      0.02 * scale,
      1,
      scale
    );
    return teethOffset;
  }

  // Big raised claw on the +X side
  const bigShoulder = [0.12, 0.11, 0.08];
  const bigElbow = [0.22, 0.2, 0.16];
  const bigWrist = [0.2, 0.32, 0.3];
  limb(bigShoulder, bigElbow, 0.035, clawMat);
  joint(bigElbow, 0.036, clawMat);
  limb(bigElbow, bigWrist, 0.03, clawMat);
  joint(bigWrist, 0.03, clawMat);
  claw(bigWrist, 1.0, 0);

  // Smaller held claw on the -X side
  const smShoulder = [-0.12, 0.11, 0.09];
  const smElbow = [-0.18, 0.1, 0.2];
  const smWrist = [-0.13, 0.12, 0.3];
  limb(smShoulder, smElbow, 0.025, clawMat);
  joint(smElbow, 0.026, clawMat);
  limb(smElbow, smWrist, 0.02, clawMat);
  joint(smWrist, 0.022, clawMat);
  claw(smWrist, 0.6, 0);

  return root;
}
```