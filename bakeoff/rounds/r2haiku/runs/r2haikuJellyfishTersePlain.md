```ts
import * as THREE from "three";

export const meta = {
  name: "Jellyfish",
  description: "A stylized translucent pink jellyfish with glowing spots, a frilled rim, oral arms and long swaying tentacles.",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createJellyfish(): THREE.Object3D {
  const rand = mulberry32(42);
  const root = new THREE.Group();

  // Palette and shared materials
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xff8cc4,
    transparent: true,
    opacity: 0.55,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xff3d8b,
    roughness: 0.5,
    side: THREE.BackSide,
  });
  const tentacleMat = new THREE.MeshStandardMaterial({
    color: 0xffb3d9,
    transparent: true,
    opacity: 0.75,
    roughness: 0.4,
  });
  const armMat = new THREE.MeshStandardMaterial({
    color: 0xff5fa2,
    roughness: 0.6,
  });
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xfff27a,
    emissive: 0xffd23f,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xfff0f7,
    roughness: 0.4,
  });

  const BELL_Y = 0.5;
  const BELL_R = 0.2;
  const BELL_H = 0.9; // squash factor for the dome

  // Outer bell dome
  const bellGeo = new THREE.SphereGeometry(BELL_R, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.position.y = BELL_Y;
  bell.scale.set(1, BELL_H, 1);
  root.add(bell);

  // Inner bell (darker, gives thickness and depth through the translucent shell)
  const innerGeo = new THREE.SphereGeometry(BELL_R * 0.86, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.y = BELL_Y - 0.01;
  inner.scale.set(1, BELL_H * 0.95, 1);
  root.add(inner);

  // Frilled rim: a torus lying flat at the bell opening
  const rimGeo = new THREE.TorusGeometry(BELL_R, 0.014, 6, 28);
  const rim = new THREE.Mesh(rimGeo, armMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = BELL_Y;
  root.add(rim);

  // Glowing spots on the dome, placed by spherical coordinates
  const spotGeo = new THREE.SphereGeometry(0.02, 8, 6);
  for (let i = 0; i < 9; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = 0.3 + rand() * 0.9; // from top toward rim
    const r = BELL_R * 1.01;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = BELL_Y + r * Math.cos(phi) * BELL_H;
    const spot = new THREE.Mesh(spotGeo, spotMat);
    spot.position.set(x, y, z);
    root.add(spot);
  }

  // Helper: cylinder between two points
  const up = new THREE.Vector3(0, 1, 0);
  function segment(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material, radial = 6) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r1, r0, len, radial, 1, true);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(up, dir.normalize());
    return mesh;
  }

  // Long swaying tentacles
  const TENTACLES = 22;
  for (let i = 0; i < TENTACLES; i++) {
    const a = (i / TENTACLES) * Math.PI * 2 + (rand() - 0.5) * 0.15;
    const outward = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const rimR = BELL_R * (0.92 + rand() * 0.08);
    const start = new THREE.Vector3(outward.x * rimR, BELL_Y - 0.02, outward.z * rimR);
    const L = 0.42 + rand() * 0.2;
    const S = 6;
    const phase = rand() * Math.PI * 2;
    const amp = 0.025 + rand() * 0.02;
    const flare = 0.03 + rand() * 0.04;

    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= S; k++) {
      const t = k / S;
      const sway = Math.sin(phase + k * 0.9) * amp * t;
      const p = new THREE.Vector3(
        start.x + outward.x * flare * t + side.x * sway,
        start.y - L * t,
        start.z + outward.z * flare * t + side.z * sway
      );
      pts.push(p);
    }

    for (let k = 0; k < S; k++) {
      const r0 = 0.011 - (0.007 * k) / S;
      const r1 = 0.011 - (0.007 * (k + 1)) / S;
      root.add(segment(pts[k], pts[k + 1], r0, r1, tentacleMat, 5));
    }

    // Small pale tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), tipMat);
    tip.position.copy(pts[S]);
    root.add(tip);
  }

  // Four frilly oral arms under the bell
  const ARMS = 4;
  for (let i = 0; i < ARMS; i++) {
    const a = (i / ARMS) * Math.PI * 2 + Math.PI / 4;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const base = new THREE.Vector3(dx * 0.04, BELL_Y - 0.03, dz * 0.04);
    const segs = 4;
    const L = 0.22 + rand() * 0.06;
    const curl = (rand() - 0.5) * 0.04;
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      pts.push(new THREE.Vector3(
        base.x + dx * 0.05 * t + -dz * curl * t,
        base.y - L * t,
        base.z + dz * 0.05 * t + dx * curl * t
      ));
    }
    for (let k = 0; k < segs; k++) {
      const r0 = 0.024 - 0.006 * (k / segs);
      const r1 = 0.024 - 0.006 * ((k + 1) / segs);
      root.add(segment(pts[k], pts[k + 1], r0, r1, armMat, 7));
    }
    // Ruffled frill: blobs along the arm
    for (let k = 1; k <= segs; k++) {
      const frillGeo = new THREE.SphereGeometry(0.03 - 0.004 * (k / segs), 7, 5);
      const f = new THREE.Mesh(frillGeo, armMat);
      f.position.copy(pts[k]);
      f.scale.set(1.3, 0.7, 1.0);
      root.add(f);
    }
  }

  // Ground the model: lowest point touches y = 0
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  const wrapper = new THREE.Group();
  wrapper.add(root);
  return wrapper;
}
```