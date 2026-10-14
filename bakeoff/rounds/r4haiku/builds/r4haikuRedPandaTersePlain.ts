import * as THREE from "three";

export const meta = {
  name: "Red Panda",
  description:
    "A stylised red panda standing square on four short dark legs. Rust fur with a canvas-drawn texture, cream face markings, a dark eye mask, upright white-rimmed ears and a long bushy ringed tail.",
};

type V3 = [number, number, number];

const PALETTE = {
  fur: 0xb9592d,
  dark: 0x2a1a13,
  cream: 0xf0e4c9,
  black: 0x0c0907,
};

/** Small seeded PRNG (mulberry32) so every build is identical. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Canvas-drawn fur grain. Returns null when no DOM is available. */
function furTexture(base: string, seed: number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rand = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const strokes = ["#7a2f16", "#d9803f", "#8f3b1c", "#e59a58"];
  for (let i = 0; i < 1100; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 5 + rand() * 9;
    const ang = Math.PI / 2 + (rand() - 0.5) * 0.9;
    ctx.strokeStyle = strokes[Math.floor(rand() * strokes.length)];
    ctx.globalAlpha = 0.12 + rand() * 0.2;
    ctx.lineWidth = 0.7 + rand() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Ellipsoid made from a unit sphere, scaled per axis. */
function blob(
  parent: THREE.Object3D,
  mat: THREE.Material,
  radii: V3,
  pos: V3,
  seg = 12,
  rot: V3 = [0, 0, 0],
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(1, seg, Math.max(5, Math.round(seg * 0.75)));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(radii[0], radii[1], radii[2]);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(mesh);
  return mesh;
}

/** Thin strand (whisker) from a start point along a direction. */
function strand(
  parent: THREE.Object3D,
  mat: THREE.Material,
  start: THREE.Vector3,
  dir: THREE.Vector3,
  len: number,
): void {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, len, 4), mat);
  const d = dir.clone().normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  mesh.position.copy(start).addScaledVector(d, len / 2);
  parent.add(mesh);
}

export default function createRedPanda(): THREE.Object3D {
  const furMap = furTexture("#b9592d", 7);
  if (furMap) furMap.repeat.set(2, 2);

  const mats = {
    fur: new THREE.MeshStandardMaterial({
      color: furMap ? 0xffffff : PALETTE.fur,
      map: furMap,
      roughness: 0.9,
    }),
    dark: new THREE.MeshStandardMaterial({ color: PALETTE.dark, roughness: 0.85 }),
    cream: new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: 0.7 }),
    black: new THREE.MeshStandardMaterial({ color: PALETTE.black, roughness: 0.25 }),
  };

  const root = new THREE.Group();
  root.name = "RedPanda";

  // ---- Torso -------------------------------------------------------------
  blob(root, mats.fur, [0.115, 0.115, 0.23], [0, 0.245, 0], 14);

  // Dark underside: lower part of a sphere, slightly larger than the torso.
  const bellyGeo = new THREE.SphereGeometry(
    1, 14, 8, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42,
  );
  const belly = new THREE.Mesh(bellyGeo, mats.dark);
  belly.scale.set(0.12, 0.12, 0.24);
  belly.position.set(0, 0.245, 0);
  root.add(belly);

  // Neck bridging torso and head.
  blob(root, mats.fur, [0.085, 0.085, 0.07], [0, 0.31, 0.24], 12);

  // Hind haunches give the rear a little shape.
  for (const s of [1, -1]) {
    blob(root, mats.fur, [0.05, 0.07, 0.075], [s * 0.075, 0.25, -0.1], 10);
  }

  // ---- Head --------------------------------------------------------------
  blob(root, mats.fur, [0.095, 0.089, 0.097], [0, 0.35, 0.3], 16);

  // Cream muzzle and nose.
  blob(root, mats.cream, [0.05, 0.04, 0.05], [0, 0.322, 0.385], 12);
  blob(root, mats.black, [0.018, 0.013, 0.014], [0, 0.345, 0.428], 8);

  for (const s of [1, -1]) {
    // Dark eye mask.
    blob(root, mats.dark, [0.036, 0.03, 0.04], [s * 0.04, 0.36, 0.37], 10, [0, 0, s * 0.25]);
    // Glossy eye with a small highlight.
    blob(root, mats.black, [0.016, 0.016, 0.016], [s * 0.04, 0.365, 0.405], 10);
    blob(root, mats.cream, [0.005, 0.005, 0.005], [s * 0.045, 0.373, 0.42], 6);
    // Cream brow blaze above the eye.
    blob(root, mats.cream, [0.03, 0.014, 0.03], [s * 0.045, 0.4, 0.345], 10, [0, 0, -s * 0.35]);
    // Cream cheek patch.
    blob(root, mats.cream, [0.03, 0.025, 0.035], [s * 0.066, 0.31, 0.34], 10);
  }

  // Whiskers: three per side, fanning out from the muzzle.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const dir = new THREE.Vector3(s, -0.12 + i * 0.14, 0.18);
      const start = new THREE.Vector3(s * 0.035, 0.322, 0.418);
      strand(root, mats.dark, start, dir, 0.075);
    }
  }

  // ---- Ears --------------------------------------------------------------
  for (const s of [1, -1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.068, 0.415, 0.28);
    ear.rotation.z = -s * 0.28; // tilt outward
    root.add(ear);
    blob(ear, mats.fur, [0.04, 0.046, 0.016], [0, 0, 0], 10);
    blob(ear, mats.cream, [0.025, 0.03, 0.01], [0, -0.004, 0.012], 8);
  }

  // ---- Legs and feet -----------------------------------------------------
  const legSpots: Array<[number, number]> = [
    [0.068, 0.13],
    [-0.068, 0.13],
    [0.068, -0.12],
    [-0.068, -0.12],
  ];
  for (const [x, z] of legSpots) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.023, 0.2, 8), mats.dark);
    leg.position.set(x, 0.1, z);
    root.add(leg);
    blob(root, mats.dark, [0.036, 0.02, 0.045], [x, 0.02, z + 0.02], 10);
  }

  // ---- Tail --------------------------------------------------------------
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.28, -0.2),
    new THREE.Vector3(0, 0.25, -0.38),
    new THREE.Vector3(0.03, 0.29, -0.54),
    new THREE.Vector3(0.04, 0.42, -0.62),
  );

  const tailCount = 18;
  const tailRand = rng(42);
  for (let i = 0; i < tailCount; i++) {
    const t = i / (tailCount - 1);
    const p = curve.getPoint(t);
    // Bushy profile: fuller in the middle, rounded at the tip.
    const r = 0.036 + 0.03 * Math.sin(Math.PI * (0.12 + 0.8 * t)) + (tailRand() - 0.5) * 0.008;
    p.x += (tailRand() - 0.5) * 0.012;
    p.y += (tailRand() - 0.5) * 0.012;
    // Dark bands alternate with rust, and the tip is dark.
    const isDark = (i >= 3 && i <= 5) || (i >= 9 && i <= 11) || i >= 15;
    blob(root, isDark ? mats.dark : mats.fur, [r, r * 0.95, r], [p.x, p.y, p.z], 10);
  }

  return root;
}
