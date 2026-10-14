```ts
import * as THREE from "three";

export const meta = {
  name: "Frog",
  description: "A stylized green frog in a relaxed sitting pose, built from primitives with a pale belly, gold-ringed eyes, folded hind legs and dark back spots.",
};

// Seeded generator so the spot pattern is the same every run.
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

export default function buildFrog(): THREE.Object3D {
  const rand = mulberry32(7);

  // One material per colour, shared across meshes.
  const skin = new THREE.MeshStandardMaterial({ color: 0x4f9e3c, roughness: 0.5 });
  const belly = new THREE.MeshStandardMaterial({ color: 0xd9e8a0, roughness: 0.6 });
  const spot = new THREE.MeshStandardMaterial({ color: 0x24501f, roughness: 0.6 });
  const pad = new THREE.MeshStandardMaterial({ color: 0xa6e07a, roughness: 0.45 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 });
  const iris = new THREE.MeshStandardMaterial({ color: 0xe8b722, roughness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x101410, roughness: 0.4 });

  const group = new THREE.Group();

  // Helper: ellipsoid from a unit sphere.
  function ell(
    r: number,
    s: [number, number, number],
    p: [number, number, number],
    m: THREE.Material,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.position.set(p[0], p[1], p[2]);
    return mesh;
  }

  // Helper: tapered limb between two points with rounded joints.
  function limb(
    a: [number, number, number],
    b: [number, number, number],
    r: number,
    m: THREE.Material,
  ): THREE.Group {
    const g = new THREE.Group();
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    const len = d.length();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, len, 6, 1), m);
    cyl.position.copy(A).addScaledVector(d, 0.5);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.add(cyl);
    const ja = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m);
    ja.position.copy(A);
    const jb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 8, 6), m);
    jb.position.copy(B);
    g.add(ja, jb);
    return g;
  }

  // ---- Body ----
  // Wide, squat torso with a dorsal bulge.
  const torso = ell(1, [0.047, 0.033, 0.06], [0, 0.042, 0], skin);
  group.add(torso);

  // Pale belly underneath, pushed slightly down so it reads at the floor.
  group.add(ell(1, [0.04, 0.02, 0.05], [0, 0.03, 0.005], belly));

  // Broad head blending into the front of the torso.
  group.add(ell(1, [0.04, 0.026, 0.038], [0, 0.05, 0.05], skin));

  // Snout tip, a little rounder.
  group.add(ell(1, [0.03, 0.02, 0.018], [0, 0.047, 0.08], skin));

  // Wide mouth line, a dark slit.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.0035, 0.004), dark);
  mouth.position.set(0, 0.04, 0.093);
  group.add(mouth);

  // ---- Eyes: big domed bulbs on top of the head ----
  for (const s of [-1, 1]) {
    const ex = 0.028 * s;
    group.add(ell(0.014, [1, 1, 1], [ex, 0.087, 0.06], eyeWhite));
    group.add(ell(0.0095, [1, 1, 0.6], [ex, 0.089, 0.072], iris));
    group.add(ell(0.0055, [1, 1, 0.6], [ex, 0.09, 0.08], dark));
    // Little highlight for character.
    group.add(ell(0.0023, [1, 1, 1], [ex + 0.004 * s, 0.1, 0.078], eyeWhite));
    // Nostril bumps.
    group.add(ell(0.0033, [1, 1, 1], [0.011 * s, 0.07, 0.108], dark));
  }

  // ---- Back spots: flattened dark dabs scattered on the upper body ----
  for (let i = 0; i < 26; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(0.15 + rand() * 0.8); // upper body only
    const rx = 0.047, ry = 0.033, rz = 0.06;
    const x = rx * Math.sin(ph) * Math.cos(th);
    const y = 0.042 + ry * Math.cos(ph);
    const z = rz * Math.sin(ph) * Math.sin(th);
    // Keep spots off the head and eye zone.
    if (z > 0.035) continue;
    const size = 0.0045 + rand() * 0.0035;
    const dab = ell(size, [1, 0.35, 1], [x * 1.03, y * 1.02 + 0.001, z * 1.03], spot);
    dab.lookAt(new THREE.Vector3(0, 0.042, 0).add(new THREE.Vector3(x, 0, z)).multiplyScalar(2));
    group.add(dab);
  }

  // ---- Front arms: bent, splayed, with toe pads ----
  for (const s of [-1, 1]) {
    const shoulder: [number, number, number] = [0.03 * s, 0.034, 0.045];
    const elbow: [number, number, number] = [0.05 * s, 0.018, 0.078];
    const wrist: [number, number, number] = [0.06 * s, 0.009, 0.1];
    group.add(limb(shoulder, elbow, 0.0082, skin));
    group.add(limb(elbow, wrist, 0.0068, skin));
    // Four small finger pads fanned forward.
    for (let f = 0; f < 4; f++) {
      const ang = (f - 1.5) * 0.35;
      const tip: [number, number, number] = [
        wrist[0] + Math.sin(ang) * 0.014 * s,
        wrist[1] - 0.001,
        wrist[2] + Math.cos(ang) * 0.014,
      ];
      group.add(limb(wrist, tip, 0.0027, skin));
      group.add(ell(0.0042, [1, 0.7, 1], tip, pad));
    }
  }

  // ---- Hind legs: folded thighs, shins and long flat feet ----
  for (const s of [-1, 1]) {
    const hip: [number, number, number] = [0.034 * s, 0.03, -0.035];
    const knee: [number, number, number] = [0.074 * s, 0.02, -0.012];
    const ankle: [number, number, number] = [0.046 * s, 0.007, 0.03];
    group.add(limb(hip, knee, 0.0155, skin));
    group.add(limb(knee, ankle, 0.0105, skin));

    // Flattened foot running forward along the floor.
    const footStart = ankle;
    const footEnd: [number, number, number] = [0.03 * s, 0.003, 0.082];
    group.add(limb(footStart, footEnd, 0.0075, skin));

    // Toe pads at the end of the foot.
    for (let t = 0; t < 4; t++) {
      const ang = (t - 1.5) * 0.3;
      const tip: [number, number, number] = [
        footEnd[0] + Math.sin(ang) * 0.016 * s,
        0.0025,
        footEnd[2] + Math.cos(ang) * 0.016,
      ];
      group.add(limb(footEnd, tip, 0.0022, skin));
      group.add(ell(0.0036, [1, 0.6, 1], tip, pad));
    }
  }

  // Sit the model on y = 0 and centre it on x = 0.
  const box = new THREE.Box3().setFromObject(group);
  group.position.y -= box.min.y;
  group.position.x -= (box.max.x + box.min.x) / 2;

  const root = new THREE.Group();
  root.add(group);
  return root;
}
```