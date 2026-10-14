import * as THREE from "three";

export const meta = {
  name: "Koala",
  description:
    "A drowsy koala perched on a cut eucalyptus stump, with fluffy ears, a big black nose, a cream chest and heavy-lidded eyes.",
};

type V3 = [number, number, number];

// Seeded PRNG (mulberry32) so every build is identical.
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Canvas-drawn fur: grey base with short strokes of light and dark hair.
function furTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#9a9ea3";
  g.fillRect(0, 0, size, size);
  g.lineCap = "round";
  const rand = rng(11);
  for (let i = 0; i < 1400; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 5 + rand() * 9;
    const a = Math.PI / 2 + (rand() - 0.5) * 0.9;
    g.strokeStyle = rand() > 0.45 ? "rgba(238,240,242,0.32)" : "rgba(58,61,67,0.26)";
    g.lineWidth = 1 + rand() * 1.4;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeMaterials() {
  const tex = furTexture();
  const std = (color: number, roughness: number) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  return {
    fur: tex
      ? new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.95 })
      : std(0x8f9297, 0.95),
    furDark: std(0x6c7075, 0.95),
    cream: std(0xefe7d7, 0.9),
    nose: std(0x171414, 0.4),
    eye: std(0x0b0908, 0.25),
    glint: std(0xffffff, 0.2),
    claw: std(0x2c2826, 0.5),
    bark: std(0x6b4f37, 0.9),
    wood: std(0xc69c6a, 0.8),
    twig: std(0x5a4330, 0.85),
    leaf: std(0x84a282, 0.7),
    leafDark: std(0x5f8066, 0.7),
  };
}
type Mats = ReturnType<typeof makeMaterials>;

// Ellipsoid built from a unit sphere, positioned and stretched per axis.
function blob(
  parent: THREE.Object3D,
  mat: THREE.Material,
  pos: V3,
  scale: V3,
  seg = 14
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)),
    mat
  );
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  parent.add(mesh);
  return mesh;
}

// Rounded capsule stretched between two points.
function limb(
  parent: THREE.Object3D,
  mat: THREE.Material,
  a: V3,
  b: V3,
  r: number,
  seg = 8
): THREE.Mesh {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = B.clone().sub(A);
  const len = dir.length();
  const shaft = Math.max(0.001, len - 2 * r);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, shaft, 4, seg), mat);
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  parent.add(mesh);
  return mesh;
}

// Tapered claw starting at `base` and pointing along `dir`.
function claw(
  parent: THREE.Object3D,
  mat: THREE.Material,
  base: V3,
  dir: V3,
  h: number,
  r: number
) {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), mat);
  mesh.position
    .set(base[0], base[1], base[2])
    .addScaledVector(d, h / 2);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  parent.add(mesh);
  return mesh;
}

// Flat disc whose face normal is +Z (so it can be oriented by quaternion).
function disc(r: number, h: number, seg: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.rotateX(Math.PI / 2);
  return g;
}

export default function koala(): THREE.Object3D {
  const M: Mats = makeMaterials();
  const rand = rng(2024);
  const root = new THREE.Group();
  root.name = "koala";

  // ---------- Stump: the koala's perch ----------
  const STUMP_H = 0.14;
  const stump = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.27, STUMP_H, 18),
    M.bark
  );
  stump.position.y = STUMP_H / 2;
  root.add(stump);

  // Growth rings on the cut top, alternating wood and bark tones.
  const rings: [number, THREE.Material][] = [
    [0.215, M.wood],
    [0.17, M.bark],
    [0.125, M.wood],
    [0.08, M.bark],
    [0.035, M.wood],
  ];
  rings.forEach(([r, mat], i) => {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.002, 18), mat);
    d.position.y = STUMP_H + 0.001 + i * 0.0015;
    root.add(d);
  });

  // Knots on the bark.
  for (const [ang, y] of [
    [0.6, 0.07],
    [2.5, 0.11],
    [4.2, 0.05],
  ] as const) {
    const k = blob(
      root,
      M.bark,
      [Math.sin(ang) * 0.258, y, Math.cos(ang) * 0.258],
      [0.03, 0.024, 0.012],
      10
    );
    k.rotation.y = ang;
  }

  // ---------- Body ----------
  blob(root, M.fur, [0, 0.36, 0], [0.19, 0.22, 0.17], 16);
  blob(root, M.cream, [0, 0.39, 0.13], [0.105, 0.14, 0.06], 12); // chest patch
  blob(root, M.furDark, [0, 0.19, -0.15], [0.035, 0.035, 0.035], 8); // tail tuft

  // ---------- Head and face ----------
  blob(root, M.fur, [0, 0.63, 0.02], [0.13, 0.105, 0.11], 18);
  blob(root, M.cream, [0, 0.575, 0.11], [0.085, 0.055, 0.07], 12); // chin
  blob(root, M.nose, [0, 0.61, 0.135], [0.05, 0.032, 0.034], 12); // big nose
  blob(root, M.glint, [0.014, 0.62, 0.168], [0.009, 0.007, 0.006], 6);

  for (const s of [-1, 1]) {
    const x = s * 0.058;
    blob(root, M.eye, [x, 0.655, 0.115], [0.024, 0.026, 0.017], 12);
    blob(root, M.glint, [x + s * 0.009, 0.641, 0.129], [0.0065, 0.0065, 0.005], 6);
    // heavy sleepy lid covering the top of the eye
    blob(root, M.fur, [x, 0.672, 0.12], [0.03, 0.015, 0.02], 12);
  }

  // ---------- Fluffy ears: grey rim, cream inner ----------
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.12, 0.69, -0.005);
    const n = new THREE.Vector3(s * 0.6, 0.35, 0.7).normalize();
    ear.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const outer = new THREE.Mesh(disc(0.074, 0.02, 18), M.fur);
    const inner = new THREE.Mesh(disc(0.052, 0.014, 16), M.cream);
    inner.position.z = 0.006;
    ear.add(outer, inner);
    root.add(ear);
  }

  // ---------- Arms, paws and claws ----------
  for (const s of [-1, 1]) {
    limb(root, M.furDark, [s * 0.15, 0.5, 0.05], [s * 0.125, 0.2, 0.13], 0.042, 8);
    blob(root, M.furDark, [s * 0.12, 0.165, 0.165], [0.05, 0.034, 0.058], 12);
    for (const k of [-1, 0, 1]) {
      claw(root, M.claw, [s * 0.12 + k * 0.02, 0.158, 0.212], [0, -0.35, 1], 0.03, 0.0075);
    }

    // ---------- Hind legs and feet ----------
    blob(root, M.fur, [s * 0.115, 0.205, 0.095], [0.085, 0.065, 0.1], 14); // thigh
    blob(root, M.fur, [s * 0.115, 0.165, 0.15], [0.05, 0.03, 0.072], 12); // foot
    blob(root, M.cream, [s * 0.115, 0.152, 0.178], [0.038, 0.014, 0.046], 10); // sole
    for (const k of [-1, 0, 1]) {
      claw(root, M.claw, [s * 0.115 + k * 0.017, 0.152, 0.216], [0, -0.3, 1], 0.026, 0.0068);
    }
  }

  // ---------- Fallen eucalyptus sprig on the ground ----------
  const A: V3 = [0.27, 0.009, 0.16];
  const B: V3 = [0.5, 0.009, 0.05];
  limb(root, M.twig, A, B, 0.008, 6);
  const av = new THREE.Vector3(A[0], A[1], A[2]);
  const bv = new THREE.Vector3(B[0], B[1], B[2]);
  const twigDir = bv.clone().sub(av);
  const baseYaw = Math.atan2(-twigDir.z, twigDir.x);
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.12;
    const p = av.clone().lerp(bv, t);
    const side = i % 2 === 0 ? 1 : -1;
    const yaw = baseYaw + side * (0.6 + rand() * 0.25);
    // leaf long axis (local X) points along yaw; offset centre so it grows from the twig
    const outward = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(0.03);
    const leaf = blob(
      root,
      i % 3 === 0 ? M.leafDark : M.leaf,
      [p.x + outward.x, 0.007, p.z + outward.z],
      [0.042, 0.0045, 0.013],
      8
    );
    leaf.rotation.y = yaw;
  }

  return root;
}
