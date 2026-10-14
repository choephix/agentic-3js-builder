```ts
import * as THREE from "three";

export const meta = {
  name: "Garden Snail",
  description: "A stylized garden snail with a banded spiral shell, soft body, and extended eye stalks, built from primitives. Real-world scale, about 8 cm long."
};

export default function createSnail(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "GardenSnail";

  // Materials: one per colour, shared
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xc08a45, roughness: 0.55, metalness: 0.0 });
  const shellBandMat = new THREE.MeshStandardMaterial({ color: 0x6b3d1c, roughness: 0.6, metalness: 0.0 });
  const shellLipMat = new THREE.MeshStandardMaterial({ color: 0xf1dcae, roughness: 0.5, metalness: 0.0 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9c8a66, roughness: 0.8, metalness: 0.0 });
  const footMat = new THREE.MeshStandardMaterial({ color: 0xd9c08c, roughness: 0.75, metalness: 0.0 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xb29c74, roughness: 0.75, metalness: 0.0 });
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0xc9b38a, roughness: 0.7, metalness: 0.0 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.3, metalness: 0.1 });
  const eyeShineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.0 });

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  };

  // ---------- Shell ----------
  const shellCenter = new THREE.Vector3(0, 0.033, -0.02);

  // Main whorl body: a squashed dome
  add(new THREE.SphereGeometry(1, 20, 14), shellMat,
    [shellCenter.x, shellCenter.y, shellCenter.z],
    [0.016, 0.022, 0.022]);

  // Spiral ridge that winds across the shell's side (in the YZ plane)
  const spiralPts: THREE.Vector3[] = [];
  const turns = 2.75;
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = t * Math.PI * 2 * turns;
    const R = 0.019 * (1 - 0.68 * t);
    spiralPts.push(new THREE.Vector3(
      0.0125,
      shellCenter.y + R * Math.cos(theta),
      shellCenter.z + R * Math.sin(theta)
    ));
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts);
  add(new THREE.TubeGeometry(spiralCurve, 120, 0.0028, 7, false), shellBandMat, [0, 0, 0]);

  // Pale lip at the aperture end of the spiral
  const lipEnd = spiralPts[spiralPts.length - 1];
  add(new THREE.SphereGeometry(0.0035, 8, 6), shellLipMat,
    [lipEnd.x, lipEnd.y, lipEnd.z], [1, 1, 1]);

  // Apex knob on top of the shell
  add(new THREE.SphereGeometry(0.0055, 10, 8), shellBandMat,
    [0.004, shellCenter.y + 0.021, shellCenter.z], [1, 0.9, 1]);

  // ---------- Body ----------
  // Soft ellipsoid torso, sinking very slightly into the ground
  add(new THREE.SphereGeometry(1, 18, 12), bodyMat,
    [0, 0.018, 0.012],
    [0.02, 0.019, 0.05]);

  // Foot: flat sole running the length of the body, touching y=0
  const footGeo = new THREE.CapsuleGeometry(1, 1, 4, 10);
  add(footGeo, footMat,
    [0, 0.0075, 0.0],
    [0.0165, 0.0075, 0.058],
    [Math.PI / 2, 0, 0]);

  // Mantle hump above the shell's rear, blending shell and body
  add(new THREE.SphereGeometry(1, 12, 10), bodyMat,
    [0, 0.03, -0.01],
    [0.018, 0.016, 0.02]);

  // ---------- Head ----------
  add(new THREE.SphereGeometry(1, 14, 10), headMat,
    [0, 0.024, 0.068],
    [0.016, 0.015, 0.02]);

  // Mouth/snout bump
  add(new THREE.SphereGeometry(1, 8, 6), headMat,
    [0, 0.017, 0.085],
    [0.009, 0.007, 0.006]);

  // ---------- Eye stalks (long, extended, tipped with eyes) ----------
  const stalkH = 0.02;
  const stalkR = 0.0017;
  const stalkGeo = new THREE.CylinderGeometry(stalkR, stalkR * 1.2, stalkH, 8);
  const tilt = 0.32;

  for (const side of [1, -1]) {
    const cx = side * 0.0085;
    const cy = 0.043;
    const cz = 0.072;
    add(stalkGeo, stalkMat, [cx, cy, cz], [1, 1, 1], [0, 0, -side * tilt]);

    // Eye tip position (top of stalk)
    const tipX = cx - side * Math.sin(tilt) * (stalkH / 2);
    const tipY = cy + Math.cos(tilt) * (stalkH / 2);
    add(new THREE.SphereGeometry(0.0034, 10, 8), eyeMat, [tipX, tipY, cz]);
    add(new THREE.SphereGeometry(0.0009, 6, 4), eyeShineMat,
      [tipX + side * 0.0012, tipY + 0.0013, cz + 0.0019]);
  }

  // ---------- Short lower tentacles ----------
  const tentGeo = new THREE.CylinderGeometry(0.0011, 0.0014, 0.011, 6);
  for (const side of [1, -1]) {
    add(tentGeo, stalkMat,
      [side * 0.0042, 0.034, 0.08],
      [1, 1, 1],
      [0.35, 0, -side * 0.25]);
  }

  return root;
}
```