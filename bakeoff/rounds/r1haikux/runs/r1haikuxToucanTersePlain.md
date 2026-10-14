```ts
import * as THREE from "three";

export const meta = {
  name: "Toco Toucan",
  description:
    "A toco toucan perched on a mossy stump: a big orange beak with a black tip, white throat, blue eye skin and folded navy-tipped wings.",
};

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

export default function toucan(): THREE.Object3D {
  const rand = mulberry32(20240611);

  const mat = (color: number, roughness = 0.6, flat = true) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: flat });

  const black = mat(0x16130f, 0.5);
  const navy = mat(0x203049, 0.4);
  const white = mat(0xf5f1e6, 0.6, false);
  const beakTop = mat(0xff8a1c, 0.35);
  const beakLow = mat(0xffb53d, 0.35);
  const blue = mat(0x2d9cff, 0.4, false);
  const eyeMat = mat(0x0b0806, 0.25, false);
  const red = mat(0xe2411d, 0.6);
  const legMat = mat(0x4b5562, 0.7);
  const clawMat = mat(0x23272c, 0.5, false);
  const bark = mat(0x6d4a2b, 0.95);
  const cut = mat(0xcaa26d, 0.8, false);
  const ringMat = mat(0x5a3a20, 0.9);
  const moss = mat(0x5f9b3a, 0.95);

  const ellipsoid = (rx: number, ry: number, rz: number, m: THREE.Material, seg = 16) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), m);
    mesh.scale.set(rx, ry, rz);
    return mesh;
  };

  // Ellipsoid whose front (+Z) half droops by `bend` metres: gives a curved beak.
  const bentEllipsoid = (rx: number, ry: number, rz: number, bend: number, m: THREE.Material) => {
    const g = new THREE.SphereGeometry(1, 16, 12);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const f = Math.max(z, 0);
      p.setXYZ(i, x * rx, y * ry - bend * f * f, z * rz);
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, m);
  };

  const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T => {
    o.position.set(x, y, z);
    return o;
  };

  const root = new THREE.Group();

  // ---------- Mossy stump ----------
  const stump = new THREE.Group();
  root.add(stump);

  stump.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16), bark), 0, 0.08, 0));
  stump.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.005, 16), cut), 0, 0.16, 0));

  const rings: [number, number][] = [
    [0.02, 0.028],
    [0.058, 0.064],
    [0.092, 0.098],
  ];
  for (const [r0, r1] of rings) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 28), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1635;
    stump.add(ring);
  }

  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.125 + rand() * 0.02;
    const m = ellipsoid(0.03 + rand() * 0.025, 0.016, 0.022 + rand() * 0.02, moss, 10);
    m.position.set(Math.cos(a) * r, 0.01, Math.sin(a) * r);
    m.rotation.y = rand() * Math.PI;
    stump.add(m);
  }

  // ---------- Bird ----------
  const bird = new THREE.Group();
  root.add(bird);

  // Torso and everything attached to it share one tilted frame.
  const body = new THREE.Group();
  body.position.set(0, 0.33, -0.01);
  body.rotation.x = -0.55;
  bird.add(body);

  body.add(ellipsoid(0.095, 0.105, 0.155, black, 18));
  body.add(at(ellipsoid(0.075, 0.07, 0.06, white, 14), 0, -0.045, 0.125)); // white bib
  body.add(at(ellipsoid(0.055, 0.04, 0.055, red, 12), 0, -0.06, -0.1)); // red undertail

  // Folded wings with layered navy feather tips.
  for (const s of [-1, 1]) {
    body.add(at(ellipsoid(0.034, 0.092, 0.16, black, 14), s * 0.09, -0.01, -0.03));
    for (let i = 0; i < 3; i++) {
      body.add(
        at(
          ellipsoid(0.03 - i * 0.004, 0.009, 0.07 - i * 0.01, navy, 10),
          s * (0.09 + i * 0.006),
          -0.025 - i * 0.018,
          -0.17 - i * 0.04
        )
      );
    }
  }

  // Long black tail with a navy tip.
  body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.24), black), 0, -0.02, -0.26));
  body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.07), navy), 0, -0.02, -0.37));

  // Legs and zygodactyl feet gripping the stump top.
  const footY = 0.1695;
  for (const s of [-1, 1]) {
    const fx = s * 0.035;
    bird.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.07, 10), legMat), fx, 0.2, 0));

    const toes: [number, number][] = [
      [0.3, 0.045],
      [-0.3, 0.042],
      [Math.PI - 0.25, 0.035],
      [-Math.PI + 0.25, 0.035],
    ];
    for (const [yaw, len] of toes) {
      const g = new THREE.Group();
      g.position.set(fx, footY, 0);
      g.rotation.y = yaw;

      const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0055, len, 8), legMat);
      toe.rotation.x = Math.PI / 2;
      toe.position.z = len / 2;
      g.add(toe);

      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.016, 8), clawMat);
      claw.rotation.x = Math.PI - 0.35;
      claw.position.set(0, -0.003, len + 0.003);
      g.add(claw);

      bird.add(g);
    }
  }

  // ---------- Head and beak ----------
  const head = new THREE.Group();
  head.position.set(0, 0.414, 0.126);
  bird.add(head);

  head.add(ellipsoid(0.066, 0.062, 0.072, black, 18));

  // Upper mandible: orange, hooked tip, black cap.
  head.add(at(bentEllipsoid(0.042, 0.046, 0.125, 0.024, beakTop), 0, 0.012, 0.11));
  head.add(at(ellipsoid(0.034, 0.038, 0.045, black, 12), 0, 0.001, 0.195));

  // Lower mandible: slightly shorter, curls up, black cap.
  head.add(at(bentEllipsoid(0.03, 0.022, 0.1, -0.012, beakLow), 0, -0.03, 0.1));
  head.add(at(ellipsoid(0.024, 0.02, 0.04, black, 12), 0, -0.024, 0.175));

  // Nostrils on the upper beak.
  for (const s of [-1, 1]) {
    head.add(at(ellipsoid(0.006, 0.0035, 0.011, black, 8), s * 0.011, 0.056, 0.085));
  }

  // Blue eye skin, dark eye, small highlight.
  for (const s of [-1, 1]) {
    head.add(at(ellipsoid(0.021, 0.019, 0.017, blue, 12), s * 0.056, 0.012, 0.036));
    head.add(at(ellipsoid(0.0095, 0.0095, 0.0095, eyeMat, 10), s * 0.061, 0.013, 0.044));
    head.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.0033, 6, 4), white), s * 0.067, 0.02, 0.05));
  }

  return root;
}
```