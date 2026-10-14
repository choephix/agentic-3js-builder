```ts
import * as THREE from "three";

export const meta = {
  name: "Emperor Penguin with Chick",
  description:
    "A proud emperor penguin parent with a glossy blue-black back, white belly, golden neck and ear patches, and a fluffy grey chick peeking out between its feet.",
};

// Seeded RNG so every build is identical
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

export default function createModel(): THREE.Object3D {
  const rand = mulberry32(1907);

  // ---- Materials (one per colour, shared) ----
  const matBack = new THREE.MeshStandardMaterial({ color: 0x18243a, roughness: 0.28, metalness: 0.1 });
  const matBelly = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.5 });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xe8a829, roughness: 0.4 });
  const matBeak = new THREE.MeshStandardMaterial({ color: 0x1d1d22, roughness: 0.35 });
  const matStripe = new THREE.MeshStandardMaterial({ color: 0xff7a6b, roughness: 0.4 });
  const matFoot = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.6 });
  const matEye = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 });
  const matShine = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x222222 });
  const matChick = new THREE.MeshStandardMaterial({ color: 0xa3acb6, roughness: 0.95 });
  const matChickDark = new THREE.MeshStandardMaterial({ color: 0x7d8691, roughness: 0.95 });

  const root = new THREE.Group();

  function add(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0],
  ) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    parent.add(m);
    return m;
  }

  // ---- Adult penguin ----
  const adult = new THREE.Group();
  root.add(adult);

  // Back / main torso (dark, egg-shaped)
  add(adult, new THREE.SphereGeometry(1, 28, 20), matBack, [0, 0.6, 0], [0.36, 0.5, 0.34]);

  // White belly front, pushed forward so it reads from the front
  add(adult, new THREE.SphereGeometry(1, 24, 18), matBelly, [0, 0.58, 0.1], [0.27, 0.43, 0.2]);

  // Golden neck patch, sitting on the upper chest
  add(adult, new THREE.SphereGeometry(1, 16, 12), matGold, [0, 0.98, 0.16], [0.14, 0.09, 0.07]);

  // Head
  const headY = 1.1;
  add(adult, new THREE.SphereGeometry(1, 24, 18), matBack, [0, headY, 0.02], [0.18, 0.18, 0.18]);

  // Gold ear patches on both sides of the head
  for (const s of [-1, 1]) {
    add(adult, new THREE.SphereGeometry(1, 14, 10), matGold,
      [s * 0.165, headY - 0.02, 0.07], [0.07, 0.085, 0.045], [0, s * 0.35, 0]);
  }

  // Eyes with tiny highlights
  for (const s of [-1, 1]) {
    add(adult, new THREE.SphereGeometry(1, 10, 8), matEye,
      [s * 0.1, headY + 0.03, 0.15], [0.03, 0.03, 0.03]);
    add(adult, new THREE.SphereGeometry(1, 6, 5), matShine,
      [s * 0.1 + 0.01, headY + 0.04, 0.177], [0.009, 0.009, 0.009]);
  }

  // Long slender beak
  const beakZ = 0.2;
  add(adult, new THREE.ConeGeometry(0.035, 0.36, 10), matBeak,
    [0, headY - 0.04, beakZ + 0.15], [1, 1, 1], [Math.PI / 2, 0, 0]);
  // Beak lower mandible, slightly darker and thinner
  add(adult, new THREE.ConeGeometry(0.028, 0.32, 8), matBeak,
    [0, headY - 0.085, beakZ + 0.14], [1, 1, 1], [Math.PI / 2 + 0.04, 0, 0]);
  // Orange-pink stripe along the top of the beak
  add(adult, new THREE.ConeGeometry(0.012, 0.3, 6), matStripe,
    [0, headY + 0.005, beakZ + 0.15], [1.6, 1, 1], [Math.PI / 2, 0, 0]);

  // Stubby flippers held slightly out from the body
  for (const s of [-1, 1]) {
    add(adult, new THREE.SphereGeometry(1, 14, 10), matBack,
      [s * 0.36, 0.66, 0.0], [0.075, 0.27, 0.13], [0.05, 0, s * 0.38]);
  }

  // Short tail nub
  add(adult, new THREE.ConeGeometry(0.07, 0.14, 8), matBack,
    [0, 0.2, -0.3], [1, 1, 1], [-Math.PI / 2 + 0.35, 0, 0]);

  // Legs and big black feet
  for (const s of [-1, 1]) {
    const fx = s * 0.12;
    add(adult, new THREE.CylinderGeometry(0.035, 0.04, 0.12, 10), matFoot,
      [fx, 0.07, 0.04]);
    // Foot pad
    add(adult, new THREE.SphereGeometry(1, 14, 8), matFoot,
      [fx, 0.02, 0.12], [0.1, 0.03, 0.14]);
    // Three forward toes, fanned slightly
    for (const t of [-0.35, 0, 0.35]) {
      add(adult, new THREE.ConeGeometry(0.035, 0.12, 6), matFoot,
        [fx + t * 0.07, 0.02, 0.26], [1, 1, 1], [Math.PI / 2, 0, -t]);
    }
  }

  // ---- Chick, peeking out from between the feet ----
  const chick = new THREE.Group();
  chick.rotation.y = 0.12;
  chick.position.set(0.02, 0, 0.24);
  root.add(chick);

  // Fluffy body, tilted a little forward
  add(chick, new THREE.SphereGeometry(1, 20, 16), matChick, [0, 0.14, 0], [0.13, 0.16, 0.12], [0.15, 0, 0]);
  // Fluffy head
  add(chick, new THREE.SphereGeometry(1, 18, 14), matChick, [0, 0.31, 0.04], [0.095, 0.095, 0.095]);

  // Fluff tufts: small spheres scattered around the body and head
  for (let i = 0; i < 26; i++) {
    const onHead = i < 8;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const cx = onHead ? 0 : 0;
    const cy = onHead ? 0.31 : 0.14;
    const cz = onHead ? 0.04 : 0;
    const rx = onHead ? 0.1 : 0.14;
    const ry = onHead ? 0.1 : 0.18;
    const rz = onHead ? 0.1 : 0.13;
    const x = cx + Math.sin(phi) * Math.cos(theta) * rx;
    const y = cy + Math.cos(phi) * ry;
    const z = cz + Math.sin(phi) * Math.sin(theta) * rz;
    const r = 0.03 + rand() * 0.025;
    add(chick, new THREE.SphereGeometry(1, 8, 6), rand() > 0.5 ? matChick : matChickDark,
      [x, y, z], [r, r, r]);
  }

  // Chick eyes and tiny beak
  for (const s of [-1, 1]) {
    add(chick, new THREE.SphereGeometry(1, 8, 6), matEye,
      [s * 0.045, 0.33, 0.12], [0.014, 0.014, 0.014]);
  }
  add(chick, new THREE.ConeGeometry(0.014, 0.05, 6), matBeak,
    [0, 0.29, 0.14], [1, 1, 1], [Math.PI / 2, 0, 0]);

  // Little chick feet poking below its body
  for (const s of [-1, 1]) {
    add(chick, new THREE.SphereGeometry(1, 8, 6), matBeak,
      [s * 0.05, 0.01, 0.07], [0.025, 0.01, 0.035]);
  }

  return root;
}
```