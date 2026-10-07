```ts
import * as THREE from "three";

export const meta = {
  name: "Desert Scorpion",
  description:
    "A glossy amber desert scorpion with dark banded joints, pincers held forward, an arched segmented tail ending in a bulbous dark stinger, and a cluster of black eyes on the head shield.",
};

// ---------- Materials (one per colour, shared) ----------
const amberMat = new THREE.MeshStandardMaterial({ color: 0xd7932f, roughness: 0.2, metalness: 0.1 });
const shellMat = new THREE.MeshStandardMaterial({ color: 0xb06f1e, roughness: 0.25, metalness: 0.1 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a1d0a, roughness: 0.35, metalness: 0.05 });
const legMat = new THREE.MeshStandardMaterial({ color: 0x8a5520, roughness: 0.4, metalness: 0.05 });
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.08, metalness: 0.4 });
const stingMat = new THREE.MeshStandardMaterial({ color: 0x2a1006, roughness: 0.3, metalness: 0.1 });

// Shared unit sphere, scaled per use
const unitSphere = new THREE.SphereGeometry(1, 14, 10);
const UP = new THREE.Vector3(0, 1, 0);

function V(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

// Ellipsoid at (x,y,z) with radii (sx,sy,sz)
function ell(parent, x, y, z, sx, sy, sz, mat) {
  const m = new THREE.Mesh(unitSphere, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  parent.add(m);
  return m;
}

function ball(parent, p, r, mat) {
  return ell(parent, p.x, p.y, p.z, r, r, r, mat);
}

// Tapered cylinder from a to b
function bone(parent, a, b, r0, r1, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r0, len, 8, 1);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  parent.add(m);
  return m;
}

// Chain of bones with joint balls (joints get their own colour, acting as bands)
function chain(parent, pts, radii, mat, jointMat, jointScale = 1.12) {
  for (let i = 0; i < pts.length - 1; i++) {
    bone(parent, pts[i], pts[i + 1], radii[i], radii[i + 1], mat);
  }
  for (let i = 0; i < pts.length; i++) {
    ball(parent, pts[i], radii[i] * jointScale, jointMat);
  }
}

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return new THREE.Vector3()
    .addScaledVector(p0, u * u * u)
    .addScaledVector(p1, 3 * u * u * t)
    .addScaledVector(p2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
}

export default function build() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // ---------- Prosoma (cephalothorax) ----------
  ell(body, 0, 0.026, 0.05, 0.026, 0.02, 0.035, amberMat);

  // Pedicel joining prosoma to abdomen
  ell(body, 0, 0.024, 0.0, 0.013, 0.012, 0.012, amberMat);

  // Head shield (darker plate on the front of the prosoma)
  ell(body, 0, 0.033, 0.072, 0.02, 0.009, 0.013, shellMat);

  // Cluster of tiny black eyes on the shield
  const eyePts = [
    [0.0045, 0.0405, 0.0835],
    [-0.0045, 0.0405, 0.0835],
    [0.0105, 0.0375, 0.0815],
    [-0.0105, 0.0375, 0.0815],
    [0.0, 0.0425, 0.0825],
    [0.0, 0.0385, 0.0855],
  ];
  for (const [x, y, z] of eyePts) {
    ball(body, V(x, y, z), 0.0026, eyeMat);
  }

  // ---------- Mesosoma (five abdominal segments) ----------
  const segZ = [-0.03, -0.048, -0.066, -0.084, -0.102];
  for (let i = 0; i < segZ.length; i++) {
    const w = 0.021 - i * 0.001;
    ell(body, 0, 0.024, segZ[i], w, 0.018 - i * 0.0006, 0.011, amberMat);
    if (i < segZ.length - 1) {
      const zb = (segZ[i] + segZ[i + 1]) / 2;
      ell(body, 0, 0.024, zb, 0.0205 - i * 0.0008, 0.0185 - i * 0.0005, 0.0032, darkMat);
    }
  }

  // ---------- Metasoma (tail arched high over the back) ----------
  const P0 = V(0, 0.04, -0.09);
  const P1 = V(0, 0.12, -0.2);
  const P2 = V(0, 0.26, -0.16);
  const P3 = V(0, 0.19, -0.03);

  const N = 8;
  const tailPts = [];
  const tailRad = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    tailPts.push(bezier(P0, P1, P2, P3, t));
    tailRad.push(0.0135 - 0.0065 * t);
  }
  chain(body, tailPts, tailRad, amberMat, darkMat, 1.15);

  // Bulbous dark stinger at the tail tip
  const tipA = tailPts[N - 1];
  const tipB = tailPts[N];
  const tan = new THREE.Vector3().subVectors(tipB, tipA).normalize();
  const bulbC = tipB.clone().addScaledVector(tan, 0.011);
  ball(body, bulbC, 0.0145, stingMat);
  const stingTip = bulbC.clone().addScaledVector(tan, 0.03).add(V(0, 0.006, 0.004));
  bone(body, bulbC, stingTip, 0.0055, 0.0008, stingMat);

  // ---------- Pedipalps (crab-like pincers held forward) ----------
  for (const s of [1, -1]) {
    const shoulder = V(s * 0.024, 0.028, 0.08);
    const elbow = V(s * 0.042, 0.03, 0.115);
    const wrist = V(s * 0.045, 0.03, 0.165);
    chain(body, [shoulder, elbow, wrist], [0.0085, 0.007, 0.0065], amberMat, darkMat, 1.15);

    // Palm
    ell(body, s * 0.045, 0.03, 0.19, 0.014, 0.011, 0.02, amberMat);
    ell(body, s * 0.045, 0.03, 0.18, 0.012, 0.009, 0.006, darkMat);

    // Fixed finger
    bone(body, V(s * 0.04, 0.03, 0.205), V(s * 0.032, 0.028, 0.256), 0.0072, 0.0022, amberMat);
    ball(body, V(s * 0.032, 0.028, 0.256), 0.0026, darkMat);

    // Movable finger (slightly opened outward)
    bone(body, V(s * 0.05, 0.03, 0.205), V(s * 0.063, 0.028, 0.246), 0.0072, 0.0022, amberMat);
    ball(body, V(s * 0.063, 0.028, 0.246), 0.0026, darkMat);
  }

  // ---------- Walking legs (four pairs, thin and separated) ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.045 - i * 0.024;
      const hip = V(s * 0.022, 0.024, z);
      const knee = V(s * 0.068, 0.046, z + 0.008);
      const ankle = V(s * 0.1, 0.02, z - 0.006);
      const foot = V(s * 0.122, 0.002, z - 0.02);
      chain(body, [hip, knee, ankle, foot], [0.0055, 0.0045, 0.0035, 0.0022], legMat, darkMat, 1.25);
    }
  }

  // Scale the whole creature to a realistic desert scorpion size
  root.scale.setScalar(0.6);
  return root;
}
```