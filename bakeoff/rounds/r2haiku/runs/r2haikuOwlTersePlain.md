```ts
import * as THREE from "three";

export const meta = {
  name: "Tawny Owl",
  description: "A stylized perched tawny owl built from primitives, facing forward with a round facial disc, big amber eyes, ear tufts and folded wings.",
};

// Seeded generator so every run builds the same feather speckles.
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

export default function createOwl(): THREE.Object3D {
  const rand = mulberry32(1337);
  const root = new THREE.Group();
  root.name = "TawnyOwl";

  // Palette
  const mats = {
    feather: new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.85 }),
    featherDark: new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 0.9 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xd9c49a, roughness: 0.9 }),
    disc: new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 0.8 }),
    beak: new THREE.MeshStandardMaterial({ color: 0xe0a92e, roughness: 0.5 }),
    eye: new THREE.MeshStandardMaterial({ color: 0xffb81c, roughness: 0.3, emissive: 0x402000, emissiveIntensity: 0.3 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x0b0806, roughness: 0.4 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x2e1d12, roughness: 0.7 }),
    talon: new THREE.MeshStandardMaterial({ color: 0x3b3b3b, roughness: 0.6 }),
    speckle: new THREE.MeshStandardMaterial({ color: 0x5c4128, roughness: 0.9 }),
  };

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.scale.set(scale[0], scale[1], scale[2]);
    root.add(m);
    return m;
  };

  // Body: plump, upright egg shape
  add(new THREE.SphereGeometry(0.11, 16, 12), mats.feather, [0, 0.19, 0], [0, 0, 0], [1, 1.25, 0.95]);

  // Cream belly patch on the front
  add(new THREE.SphereGeometry(0.075, 14, 10), mats.belly, [0, 0.18, 0.068], [0, 0, 0], [1, 1.3, 0.45]);

  // Chevron-ish speckles scattered on the belly
  for (let i = 0; i < 16; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = (col - 1.5) * 0.034 + (rand() - 0.5) * 0.01;
    const y = 0.25 - row * 0.03 + (rand() - 0.5) * 0.01;
    const z = 0.1 - Math.abs(x) * 0.25;
    add(new THREE.SphereGeometry(0.009, 6, 4), mats.speckle, [x, y, z], [0, 0, 0], [1.4, 0.7, 0.35]);
  }

  // Head
  add(new THREE.SphereGeometry(0.1, 18, 14), mats.feather, [0, 0.33, 0], [0, 0, 0], [1.12, 0.95, 0.95]);

  // Facial disc (flattened, faces forward)
  add(new THREE.SphereGeometry(0.085, 16, 12), mats.disc, [0, 0.33, 0.075], [0, 0, 0], [1.05, 1.0, 0.3]);

  // Eyes
  for (const s of [-1, 1]) {
    const ex = s * 0.036;
    add(new THREE.SphereGeometry(0.03, 14, 10), mats.eye, [ex, 0.345, 0.092], [0, 0, 0], [1, 1, 0.6]);
    add(new THREE.SphereGeometry(0.016, 10, 8), mats.pupil, [ex, 0.345, 0.112], [0, 0, 0], [1, 1, 0.5]);
    // Dark rim framing each eye
    add(new THREE.TorusGeometry(0.034, 0.007, 8, 16), mats.rim, [ex, 0.345, 0.1]);
  }

  // Beak: short hooked cone pointing forward
  add(new THREE.ConeGeometry(0.018, 0.04, 6), mats.beak, [0, 0.315, 0.112], [Math.PI / 2, 0, 0]);
  add(new THREE.SphereGeometry(0.012, 8, 6), mats.beak, [0, 0.322, 0.105], [0, 0, 0], [1, 0.8, 1]);

  // Ear tufts
  for (const s of [-1, 1]) {
    add(new THREE.ConeGeometry(0.028, 0.08, 6), mats.featherDark, [s * 0.065, 0.43, -0.005], [0, 0, -s * 0.3]);
  }

  // Wings folded against the sides
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.05, 14, 10), mats.featherDark, [s * 0.1, 0.2, -0.01], [0.05, 0, s * 0.08], [0.5, 1.9, 0.9]);
    // Dark wing tip reaching down
    add(new THREE.ConeGeometry(0.03, 0.09, 6), mats.featherDark, [s * 0.095, 0.1, -0.02], [Math.PI, 0, s * 0.05]);
    // Pale spotting on wing
    for (let k = 0; k < 4; k++) {
      add(new THREE.SphereGeometry(0.008, 6, 4), mats.belly, [s * (0.115 + rand() * 0.01), 0.22 - k * 0.035, 0.03], [0, 0, 0], [0.8, 1.6, 0.5]);
    }
  }

  // Tail
  add(new THREE.BoxGeometry(0.07, 0.13, 0.02), mats.featherDark, [0, 0.08, -0.12], [-0.35, 0, 0]);

  // Legs and feet
  for (const s of [-1, 1]) {
    const lx = s * 0.04;
    add(new THREE.CylinderGeometry(0.012, 0.014, 0.07, 8), mats.belly, [lx, 0.035, 0.05]);
    // Toes as a flattened blob
    add(new THREE.SphereGeometry(0.024, 10, 8), mats.belly, [lx, 0.012, 0.072], [0, 0, 0], [1.1, 0.5, 1.3]);
    // Three forward talons
    for (const t of [-1, 0, 1]) {
      add(new THREE.ConeGeometry(0.005, 0.02, 5), mats.talon, [lx + t * 0.013, 0.008, 0.095], [Math.PI / 2 + 0.3, 0, 0]);
    }
  }

  return root;
}
```