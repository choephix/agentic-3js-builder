import * as THREE from "three";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A young reticulated giraffe with chestnut patches outlined in cream, a short stiff mane, fuzzy ossicones with black tufts, big ears, long lashes and a dark tongue peeking out.",
};

// ---- seeded random ----
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

// ---- reticulated coat texture: chestnut patches with cream outlines ----
function makeCoatTexture(rand: () => number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;

  g.fillStyle = "#efdcaa";
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 70; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 26 + rand() * 30;
    const n = 7 + Math.floor(rand() * 3);
    g.beginPath();
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = r * (0.7 + rand() * 0.45);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * 0.85;
      if (k === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fillStyle = rand() < 0.15 ? "#7a4520" : "#a2622f";
    g.fill();
    g.strokeStyle = "#fbf1d2";
    g.lineWidth = 9;
    g.lineJoin = "round";
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---- helpers ----
const UP = new THREE.Vector3(0, 1, 0);

/** Tapered cylinder spanning from point a to point b. */
function segment(
  a: THREE.Vector3,
  b: THREE.Vector3,
  rTop: number,
  rBot: number,
  mat: THREE.Material,
  radial = 12
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(rTop, rBot, len, radial, 1);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  return mesh;
}

function ellipsoid(
  pos: [number, number, number],
  scale: [number, number, number],
  mat: THREE.Material,
  seg = 14
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(8, seg - 4)), mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  return m;
}

// ---- model ----
export default function createGiraffe(): THREE.Object3D {
  const rand = mulberry32(20417);
  const coatTex = makeCoatTexture(rand);

  const coat = new THREE.MeshStandardMaterial({
    map: coatTex,
    roughness: 0.82,
    metalness: 0.0,
  });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf2e3b8, roughness: 0.75 });
  const mane = new THREE.MeshStandardMaterial({ color: 0x5b3a1f, roughness: 0.9 });
  const tuft = new THREE.MeshStandardMaterial({ color: 0x1b1310, roughness: 0.95 });
  const hoof = new THREE.MeshStandardMaterial({ color: 0x2b1e14, roughness: 0.6 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf7f2e8, roughness: 0.3 });
  const pupil = new THREE.MeshStandardMaterial({ color: 0x120c09, roughness: 0.25 });
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0x3a1622, roughness: 0.5 });

  const root = new THREE.Group();
  root.name = "ReticulatedGiraffe";

  // Body
  const body = ellipsoid([0, 2.1, 0], [0.42, 0.45, 0.6], coat, 18);
  root.add(body);
  // Chest and rump, softer cream underside patch
  root.add(ellipsoid([0, 1.78, 0.2], [0.3, 0.14, 0.34], cream, 12));

  // Legs: chestnut upper, cream lower fading to dark hooves
  const legSpots: [number, number][] = [
    [-0.25, 0.32],
    [0.25, 0.32],
    [-0.25, -0.3],
    [0.25, -0.3],
  ];
  for (const [x, z] of legSpots) {
    const upperTop = new THREE.Vector3(x, 1.75, z);
    const knee = new THREE.Vector3(x, 0.62, z);
    const fetlock = new THREE.Vector3(x, 0.14, z);
    root.add(segment(upperTop, knee, 0.075, 0.062, coat, 10));
    root.add(segment(knee, fetlock, 0.06, 0.042, cream, 10));
    const hoofMesh = segment(
      new THREE.Vector3(x, 0.0, z),
      new THREE.Vector3(x, 0.11, z),
      0.052,
      0.05,
      hoof,
      10
    );
    root.add(hoofMesh);
  }

  // Tail with dark tuft
  const tailBase = new THREE.Vector3(0, 2.25, -0.6);
  const tailEnd = new THREE.Vector3(0, 1.6, -0.72);
  root.add(segment(tailBase, tailEnd, 0.018, 0.028, coat, 8));
  root.add(ellipsoid([0, 1.5, -0.74], [0.035, 0.09, 0.035], tuft, 8));

  // Neck
  const neckBase = new THREE.Vector3(0, 2.3, 0.45);
  const neckTop = new THREE.Vector3(0, 3.3, 0.85);
  root.add(segment(neckBase, neckTop, 0.13, 0.2, coat, 16));

  // Neck front (chest-side) cream patch for contrast
  const neckDir = new THREE.Vector3().subVectors(neckTop, neckBase).normalize();
  const dorsal = new THREE.Vector3(0, 0.37, -0.93).normalize();

  // Short stiff mane down the top of the neck
  const maneCount = 14;
  for (let i = 0; i < maneCount; i++) {
    const t = (i + 0.5) / maneCount;
    const p = new THREE.Vector3().lerpVectors(neckBase, neckTop, t);
    const r = THREE.MathUtils.lerp(0.2, 0.13, t);
    const start = p.clone().addScaledVector(dorsal, r * 0.85);
    const end = start.clone().addScaledVector(dorsal, 0.075).addScaledVector(neckDir, -0.012);
    root.add(segment(start, end, 0.0, 0.02, mane, 6));
  }

  // Head
  const headCenter = new THREE.Vector3(0, 3.42, 1.0);
  root.add(ellipsoid([headCenter.x, headCenter.y, headCenter.z], [0.14, 0.13, 0.22], coat, 16));

  // Snout and muzzle
  root.add(ellipsoid([0, 3.34, 1.2], [0.1, 0.095, 0.12], cream, 12));
  // Nostrils
  root.add(ellipsoid([-0.03, 3.37, 1.31], [0.012, 0.01, 0.01], tuft, 6));
  root.add(ellipsoid([0.03, 3.37, 1.31], [0.012, 0.01, 0.01], tuft, 6));

  // Tongue, long and dark, peeking out below the muzzle
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.018, 0.13), tongueMat);
  tongue.position.set(0, 3.27, 1.33);
  tongue.rotation.x = 0.18;
  root.add(tongue);

  // Ossicones: fuzzy cream shafts with black tufts on top
  for (const sx of [-1, 1]) {
    const bx = sx * 0.065;
    const base = new THREE.Vector3(bx, 3.5, 0.98);
    const top = new THREE.Vector3(bx * 1.1, 3.64, 0.96);
    root.add(segment(base, top, 0.024, 0.03, cream, 10));
    root.add(ellipsoid([top.x, top.y + 0.02, top.z], [0.04, 0.04, 0.04], tuft, 10));
  }

  // Ears: big, sideways, with cream inners
  for (const sx of [-1, 1]) {
    const ear = ellipsoid([sx * 0.17, 3.42, 0.92], [0.12, 0.05, 0.06], coat, 12);
    ear.rotation.z = sx * -0.35;
    ear.rotation.y = sx * 0.2;
    root.add(ear);
    const inner = ellipsoid([sx * 0.18, 3.41, 0.915], [0.085, 0.03, 0.045], cream, 10);
    inner.rotation.z = sx * -0.35;
    inner.rotation.y = sx * 0.2;
    root.add(inner);
  }

  // Eyes with long lashes
  for (const sx of [-1, 1]) {
    const ex = sx * 0.12;
    const ey = 3.47;
    const ez = 1.06;
    root.add(ellipsoid([ex, ey, ez], [0.036, 0.036, 0.034], eyeWhite, 12));
    root.add(ellipsoid([ex + sx * 0.004, ey, ez + 0.03], [0.018, 0.02, 0.012], pupil, 8));
    // Lashes arc over the top of the eye
    for (let k = 0; k < 4; k++) {
      const a = THREE.MathUtils.lerp(-0.9, 0.6, k / 3) + Math.PI / 2;
      const lashBase = new THREE.Vector3(ex, ey + 0.03, ez + 0.02);
      const lashDir = new THREE.Vector3(
        Math.cos(a) * sx * 0.5,
        Math.sin(a) * 0.9,
        0.25
      ).normalize();
      const lashEnd = lashBase.clone().addScaledVector(lashDir, 0.06);
      root.add(segment(lashBase, lashEnd, 0.003, 0.007, tuft, 4));
    }
  }

  // Mild shadow-like cheek patch for character
  root.add(ellipsoid([0, 3.3, 1.1], [0.12, 0.05, 0.1], cream, 10));

  return root;
}
