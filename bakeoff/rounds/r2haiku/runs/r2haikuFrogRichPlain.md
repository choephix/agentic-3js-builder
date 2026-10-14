```ts
import * as THREE from "three";

export const meta = {
  name: "Red-Eyed Tree Frog",
  description: "A lime-green red-eyed tree frog with blue and cream flank stripes, orange sticky toe pads and ruby eyes, clinging to a leaf."
};

export default function createModel(): THREE.Object3D {
  const root = new THREE.Group();

  // Materials: one per colour, shared
  const lime = new THREE.MeshStandardMaterial({ color: 0x8ee04a, roughness: 0.45 });
  const limeDark = new THREE.MeshStandardMaterial({ color: 0x6cc13a, roughness: 0.5 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x2a6fd6, roughness: 0.4 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff1cf, roughness: 0.5 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.35 });
  const ruby = new THREE.MeshStandardMaterial({ color: 0xc4102b, roughness: 0.2, emissive: 0x2a0004, emissiveIntensity: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 0.6, side: THREE.DoubleSide });
  const leafVein = new THREE.MeshStandardMaterial({ color: 0x4f9e44, roughness: 0.6 });

  const frog = new THREE.Group();
  root.add(frog);

  // Helpers
  const ell = (
    parent: THREE.Object3D,
    x: number, y: number, z: number,
    rx: number, ry: number, rz: number,
    mat: THREE.Material,
    seg = 14
  ) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(8, seg - 4)), mat);
    m.position.set(x, y, z);
    m.scale.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  const seg = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    mat: THREE.Material
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, 8), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    parent.add(m);
    return m;
  };

  const chain = (parent: THREE.Object3D, pts: THREE.Vector3[], radii: number[], mat: THREE.Material) => {
    for (let i = 0; i < pts.length - 1; i++) {
      seg(parent, pts[i], pts[i + 1], radii[i], radii[i + 1], mat);
    }
    pts.forEach((p, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(radii[i], 10, 8), mat);
      s.position.copy(p);
      parent.add(s);
    });
  };

  const toePad = (parent: THREE.Object3D, tip: THREE.Vector3, from: THREE.Vector3, r: number) => {
    const pts = [from, tip];
    seg(parent, from, tip, r * 0.6, r * 0.55, lime);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), orange);
    pad.position.copy(tip);
    pad.scale.set(1, 0.7, 1);
    parent.add(pad);
    void pts;
  };

  // ---------- Leaf ----------
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.1);
  leafShape.bezierCurveTo(0.09, -0.09, 0.075, 0.06, 0, 0.11);
  leafShape.bezierCurveTo(-0.075, 0.06, -0.09, -0.09, 0, -0.1);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.003,
    bevelEnabled: false,
    curveSegments: 16
  });
  leafGeo.rotateX(-Math.PI / 2);
  const leafMesh = new THREE.Mesh(leafGeo, leaf);
  leafMesh.position.set(0, 0, 0.005);
  root.add(leafMesh);

  // Midrib and side veins
  const midrib = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.002, 0.2), leafVein);
  midrib.position.set(0, 0.0035, 0.005);
  root.add(midrib);
  for (let i = 0; i < 5; i++) {
    const zz = -0.05 + i * 0.025;
    for (const s of [-1, 1]) {
      const vein = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.0015, 0.002), leafVein);
      vein.position.set(0.02 * s, 0.0035, zz + 0.005);
      vein.rotation.y = s * -0.5;
      root.add(vein);
    }
  }

  // ---------- Body ----------
  // Torso
  ell(frog, 0, 0.068, 0.0, 0.034, 0.03, 0.05, lime, 18);
  // Back ridge highlight
  ell(frog, 0, 0.094, -0.005, 0.02, 0.01, 0.04, limeDark, 12);

  // Cream belly (underside)
  ell(frog, 0, 0.056, 0.008, 0.026, 0.017, 0.042, cream, 16);

  // Flank stripes: blue with cream underline on each side
  for (const s of [-1, 1]) {
    ell(frog, 0.034 * s, 0.075, 0.0, 0.004, 0.005, 0.05, blue, 8);
    ell(frog, 0.033 * s, 0.064, 0.0, 0.003, 0.0035, 0.048, cream, 8);
  }

  // Head
  ell(frog, 0, 0.088, 0.036, 0.03, 0.024, 0.03, lime, 16);
  // Snout
  ell(frog, 0, 0.082, 0.062, 0.02, 0.014, 0.013, limeDark, 12);

  // Mouth line
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.003), black);
  mouth.position.set(0, 0.076, 0.061);
  frog.add(mouth);

  // Nostrils
  for (const s of [-1, 1]) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.0025, 6, 4), black);
    n.position.set(0.007 * s, 0.09, 0.07);
    frog.add(n);
  }

  // ---------- Eyes (enormous ruby, slit pupils, surprised) ----------
  for (const s of [-1, 1]) {
    const ex = 0.031 * s;
    const ey = 0.105;
    const ez = 0.045;
    // Eyeball bulging out
    ell(frog, ex, ey, ez, 0.0185, 0.0185, 0.0185, ruby, 16);
    // Slit pupil (vertical)
    ell(frog, ex, ey, ez + 0.0172, 0.0028, 0.0105, 0.0022, black, 8);
    // Glint highlight
    ell(frog, ex + 0.006 * s, ey + 0.008, ez + 0.0145, 0.0038, 0.0038, 0.0038, white, 8);
    // Raised brow / lid ring
    ell(frog, ex, ey + 0.016, ez - 0.002, 0.02, 0.005, 0.014, limeDark, 10);
  }

  // ---------- Legs ----------
  for (const s of [-1, 1]) {
    // Front leg (arm): shoulder -> elbow -> wrist
    const shoulder = new THREE.Vector3(0.03 * s, 0.07, 0.035);
    const elbow = new THREE.Vector3(0.068 * s, 0.03, 0.05);
    const wrist = new THREE.Vector3(0.076 * s, 0.012, 0.085);
    // Thigh-like upper arm bulge
    ell(frog, 0.036 * s, 0.062, 0.036, 0.012, 0.012, 0.012, lime, 10);
    chain(frog, [shoulder, elbow, wrist], [0.0105, 0.0075, 0.0055], lime);

    // Fingers with round sticky pads
    const fingerOffsets: [number, number][] = [
      [0.012, 0.004],
      [0.011, 0.014],
      [0.005, 0.017],
      [-0.001, 0.012]
    ];
    for (const [ox, oz] of fingerOffsets) {
      const tip = new THREE.Vector3(wrist.x + ox * s, 0.0065, wrist.z + oz);
      toePad(frog, tip, wrist.clone(), 0.0036);
    }

    // Hind leg: hip -> knee -> ankle
    const hip = new THREE.Vector3(0.03 * s, 0.058, -0.03);
    const knee = new THREE.Vector3(0.08 * s, 0.036, -0.012);
    const ankle = new THREE.Vector3(0.06 * s, 0.012, 0.036);
    ell(frog, 0.04 * s, 0.05, -0.02, 0.016, 0.016, 0.02, limeDark, 12);
    chain(frog, [hip, knee, ankle], [0.013, 0.0085, 0.0058], lime);

    // Five toes with pads
    const toeOffsets: [number, number][] = [
      [0.024, 0.002],
      [0.032, 0.02],
      [0.022, 0.042],
      [0.008, 0.052],
      [-0.006, 0.034]
    ];
    for (const [ox, oz] of toeOffsets) {
      const tip = new THREE.Vector3(ankle.x + ox * s, 0.0065, ankle.z + oz);
      toePad(frog, tip, ankle.clone(), 0.0038);
    }
  }

  // Place the frog so its toes rest on the leaf surface
  frog.position.set(0, 0.0, 0);

  // Slight, lively head tilt upward for the surprised look
  frog.rotation.x = -0.06;

  root.updateMatrixWorld(true);
  return root;
}
```