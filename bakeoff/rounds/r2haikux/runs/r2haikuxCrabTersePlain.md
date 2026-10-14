```ts
import * as THREE from "three";

export const meta = {
  name: "Crab",
  description:
    "A stylised red crab with a speckled domed shell, raised pincers, glossy stalked eyes and four pairs of splayed legs.",
};

// Small seeded generator so every build is identical.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Tapered cylinder running from a (radius ra) to b (radius rb).
function limb(
  a: THREE.Vector3,
  b: THREE.Vector3,
  ra: number,
  rb: number,
  mat: THREE.Material,
  radial = 6
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, radial, 1), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
  return mesh;
}

// Ellipsoid centred on c with semi-axes r.
function blob(
  c: THREE.Vector3,
  r: THREE.Vector3,
  mat: THREE.Material,
  w = 10,
  h = 7
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, w, h), mat);
  mesh.position.copy(c);
  mesh.scale.copy(r);
  return mesh;
}

// Speckled, mottled shell pattern drawn on a canvas (falls back to flat colour).
function makeShellTexture(rand: () => number): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) return null;

  g.fillStyle = "#c2432a";
  g.fillRect(0, 0, size, size);

  // Draw each mark three times across x so the horizontal seam wraps cleanly.
  const wrapped = (x: number, draw: (px: number) => void) => {
    draw(x - size);
    draw(x);
    draw(x + size);
  };

  for (let i = 0; i < 70; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 10 + rand() * 28;
    g.fillStyle = rand() < 0.6 ? "rgba(105,28,16,0.35)" : "rgba(246,150,100,0.22)";
    wrapped(x, (px) => {
      g.beginPath();
      g.arc(px, y, r, 0, Math.PI * 2);
      g.fill();
    });
  }

  for (let i = 0; i < 1100; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.7 + rand() * 1.9;
    g.fillStyle = rand() < 0.72 ? "#f5a06c" : "#6a1c10";
    wrapped(x, (px) => {
      g.beginPath();
      g.arc(px, y, r, 0, Math.PI * 2);
      g.fill();
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function buildCrab(): THREE.Object3D {
  const rand = mulberry32(20240611);
  const shellTex = makeShellTexture(rand);

  // One material per colour, shared across meshes.
  const shell = new THREE.MeshStandardMaterial({
    color: shellTex ? 0xffffff : 0xc2432a,
    map: shellTex,
    roughness: 0.5,
  });
  const legMat = new THREE.MeshStandardMaterial({ color: 0xb23a20, roughness: 0.6 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xf08a3c, roughness: 0.4 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x2a1410, roughness: 0.7 });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf2d6a8, roughness: 0.7 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.18 });
  const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

  const crab = new THREE.Group();
  crab.name = "crab";

  // Domed shell, wider than it is long.
  crab.add(blob(V(0, 0.078, 0), V(0.13, 0.05, 0.105), shell, 18, 11));

  // Flat front plate between the eye stalks.
  const rostrum = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.026, 0.045), shell);
  rostrum.position.set(0, 0.082, 0.1);
  crab.add(rostrum);

  // Raised tubercles on the top of the shell.
  const bumps: [number, number, number, number][] = [
    [0, 0.119, 0.04, 0.012],
    [0.055, 0.117, 0.03, 0.011],
    [-0.055, 0.117, 0.03, 0.011],
    [0, 0.118, -0.05, 0.012],
    [0.075, 0.114, -0.02, 0.01],
    [-0.075, 0.114, -0.02, 0.01],
  ];
  for (const [x, y, z, r] of bumps) {
    crab.add(blob(V(x, y, z), V(r, r * 0.8, r), shell, 8, 6));
  }

  // Pale abdomen tucked under the back edge.
  crab.add(blob(V(0, 0.034, -0.1), V(0.065, 0.02, 0.05), bellyMat, 12, 7));

  // Mouth parts under the front plate.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.022, 0.03), bellyMat);
  mouth.position.set(0, 0.06, 0.1);
  crab.add(mouth);

  // Four walking legs per side: hip, raised knee, foot on the floor.
  const walkingLegs = [
    { z: 0.025, ax: 0.112, kx: 0.225, kz: 0.06, fx: 0.285, fz: 0.075 },
    { z: -0.01, ax: 0.116, kx: 0.235, kz: 0.012, fx: 0.3, fz: 0.02 },
    { z: -0.05, ax: 0.104, kx: 0.225, kz: -0.035, fx: 0.28, fz: -0.06 },
    { z: -0.085, ax: 0.078, kx: 0.19, kz: -0.08, fx: 0.24, fz: -0.12 },
  ];

  for (const sx of [1, -1]) {
    // Walking legs.
    for (const L of walkingLegs) {
      const hip = V(sx * L.ax, 0.07, L.z);
      const knee = V(sx * L.kx, 0.105, L.kz);
      const foot = V(sx * L.fx, 0.007, L.fz);
      crab.add(limb(hip, knee, 0.013, 0.011, legMat));
      crab.add(limb(knee, foot, 0.011, 0.007, legMat));
      crab.add(blob(knee, V(0.013, 0.013, 0.013), legMat, 8, 6));
      crab.add(blob(foot, V(0.008, 0.008, 0.008), tipMat, 6, 4));
    }

    // Raised claw arm: shoulder, elbow, wrist, then the palm.
    const shoulder = V(sx * 0.085, 0.085, 0.075);
    const elbow = V(sx * 0.165, 0.112, 0.13);
    const wrist = V(sx * 0.19, 0.095, 0.21);
    crab.add(limb(shoulder, elbow, 0.02, 0.019, legMat, 7));
    crab.add(blob(elbow, V(0.021, 0.021, 0.021), legMat, 8, 6));
    crab.add(limb(elbow, wrist, 0.019, 0.017, legMat, 7));
    crab.add(blob(wrist, V(0.018, 0.018, 0.018), legMat, 8, 6));
    crab.add(blob(V(sx * 0.2, 0.08, 0.27), V(0.056, 0.05, 0.07), shell, 14, 9));

    // Pincers, opened slightly: outer fixed finger and inner moving finger.
    crab.add(limb(V(sx * 0.205, 0.08, 0.31), V(sx * 0.22, 0.072, 0.43), 0.024, 0.008, clawMat, 6));
    crab.add(limb(V(sx * 0.18, 0.082, 0.31), V(sx * 0.165, 0.085, 0.41), 0.022, 0.007, clawMat, 6));
    // Small teeth on the inner edges.
    crab.add(limb(V(sx * 0.205, 0.075, 0.395), V(sx * 0.195, 0.073, 0.41), 0.008, 0.002, clawMat, 5));
    crab.add(limb(V(sx * 0.176, 0.082, 0.37), V(sx * 0.19, 0.08, 0.385), 0.006, 0.002, clawMat, 5));

    // Eye stalk, glossy eye and highlight.
    crab.add(limb(V(sx * 0.045, 0.094, 0.08), V(sx * 0.05, 0.158, 0.1), 0.012, 0.01, legMat, 7));
    crab.add(blob(V(sx * 0.05, 0.168, 0.105), V(0.02, 0.02, 0.02), eyeMat, 14, 10));
    crab.add(blob(V(sx * 0.056, 0.176, 0.121), V(0.0055, 0.0055, 0.0055), glintMat, 6, 5));

    // Short antenna in front of the eyes.
    crab.add(limb(V(sx * 0.02, 0.088, 0.112), V(sx * 0.05, 0.12, 0.16), 0.004, 0.002, legMat, 5));
  }

  return crab;
}
```