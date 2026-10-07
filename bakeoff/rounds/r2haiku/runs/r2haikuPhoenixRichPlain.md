```ts
import * as THREE from "three";

export const meta = {
  name: "Phoenix",
  description:
    "A stylized phoenix with wings flung open. Crimson body, flame-coloured feathers graduating to gold tips, a flame crest, ribbon tail feathers, amber eyes and a golden hooked beak, with embers drifting off the wings.",
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildPhoenix(): THREE.Object3D {
  const rand = mulberry32(1337);
  const rr = (a: number, b: number) => a + (b - a) * rand();

  // ---- Palette (one material per colour, shared) ----
  const M = {
    crimson: new THREE.MeshStandardMaterial({ color: 0x7a0c1c, roughness: 0.55 }),
    red: new THREE.MeshStandardMaterial({ color: 0xb3200f, roughness: 0.5 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xe85a14, roughness: 0.45 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xf59a1c, roughness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffc23a, roughness: 0.35, metalness: 0.2 }),
    yellow: new THREE.MeshStandardMaterial({
      color: 0xfff2a8,
      emissive: 0xffd060,
      emissiveIntensity: 0.4,
      roughness: 0.4,
    }),
    beak: new THREE.MeshStandardMaterial({ color: 0xe0a020, metalness: 0.7, roughness: 0.25 }),
    eyeRim: new THREE.MeshStandardMaterial({ color: 0x2a1812, roughness: 0.8 }),
    eye: new THREE.MeshStandardMaterial({
      color: 0xffb000,
      emissive: 0xff8a00,
      emissiveIntensity: 2.5,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0xff7a10,
      emissiveIntensity: 3,
    }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2a1812, roughness: 0.8 }),
    glow: new THREE.MeshBasicMaterial({
      color: 0xff6a1a,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    }),
  };

  // ---- Shared geometry ----
  const geoCache = new Map<string, THREE.BufferGeometry>();
  function featherGeo(L: number, w: number): THREE.BufferGeometry {
    const key = L.toFixed(3) + "_" + w.toFixed(3);
    let g = geoCache.get(key);
    if (!g) {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.bezierCurveTo(w, L * 0.22, w * 1.15, L * 0.68, w * 0.15, L);
      s.bezierCurveTo(-w * 0.8, L * 0.7, -w * 1.05, L * 0.25, 0, 0);
      g = new THREE.ExtrudeGeometry(s, {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.012,
        bevelSegments: 1,
        curveSegments: 5,
      });
      g.translate(0, 0, -0.006);
      geoCache.set(key, g);
    }
    return g;
  }

  // Feather pivot chain: a (position, in-plane spread, yaw) -> b (tilt about X)
  function feather(
    parent: THREE.Object3D,
    L: number,
    w: number,
    mat: THREE.Material,
    pos: THREE.Vector3,
    spread: number,
    tilt: number,
    yaw: number,
    overlay?: THREE.Material
  ) {
    const a = new THREE.Group();
    a.position.copy(pos);
    a.rotation.set(0, yaw, spread);
    const b = new THREE.Group();
    b.rotation.x = tilt;
    a.add(b);
    b.add(new THREE.Mesh(featherGeo(L, w), mat));
    if (overlay) {
      const o = new THREE.Mesh(featherGeo(L * 0.5, w * 0.8), overlay);
      o.position.set(0, L * 0.5, 0.012);
      b.add(o);
    }
    parent.add(a);
  }

  const root = new THREE.Group();

  // ---- Body ----
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), M.crimson);
  torso.position.set(0, 1.38, -0.05);
  torso.scale.set(0.85, 0.9, 1.35);
  root.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), M.orange);
  belly.position.set(0, 1.28, 0.12);
  belly.scale.set(0.8, 0.7, 1.1);
  root.add(belly);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), M.red);
  chest.position.set(0, 1.5, 0.25);
  root.add(chest);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.55, 8), M.red);
  neck.position.set(0, 1.72, 0.3);
  neck.rotation.x = 0.45;
  root.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.orange);
  head.position.set(0, 2.02, 0.5);
  head.scale.set(0.95, 1, 1.1);
  root.add(head);

  // ---- Legs and talons ----
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.5, 6), M.beak);
    leg.position.set(s * 0.13, 0.85, 0.05);
    root.add(leg);
    for (let k = -1; k <= 1; k++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.1, 4), M.dark);
      claw.position.set(s * 0.13 + k * 0.03, 0.6, 0.1);
      claw.rotation.x = Math.PI / 2 - 0.3;
      root.add(claw);
    }
  }

  // ---- Flame crest ----
  for (let i = 0; i < 5; i++) {
    const mats = [M.orange, M.amber, M.red, M.amber, M.orange];
    const L = rr(0.5, 0.7);
    feather(
      root,
      L,
      0.1,
      mats[i],
      new THREE.Vector3(0, 2.12, 0.42),
      -0.5 + i * 0.25 + rr(-0.06, 0.06),
      -0.75 - rr(0, 0.15),
      0,
      M.gold
    );
  }

  // ---- Beak ----
  const upper = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), M.beak);
  upper.position.set(0, 2.0, 0.68);
  upper.rotation.x = Math.PI / 2;
  root.add(upper);

  const hook = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), M.beak);
  hook.position.set(0, 1.97, 0.84);
  hook.rotation.x = Math.PI / 2 + 0.5;
  root.add(hook);

  const lower = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), M.beak);
  lower.position.set(0, 1.93, 0.62);
  lower.rotation.x = Math.PI / 2 - 0.12;
  root.add(lower);

  // ---- Eyes ----
  for (const s of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), M.eyeRim);
    rim.position.set(s * 0.1, 2.08, 0.6);
    root.add(rim);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.eye);
    eye.position.set(s * 0.1, 2.08, 0.63);
    root.add(eye);
  }

  // ---- Wings ----
  function buildWing(s: number) {
    // leading arm bone
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 1.0, 6), M.crimson);
    arm.position.set(s * 0.72, 1.62, -0.12);
    arm.rotation.z = (-s * Math.PI) / 2;
    root.add(arm);

    // coverts / secondaries along the arm
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const pos = new THREE.Vector3(s * (0.28 + 0.95 * t), 1.5 + 0.22 * t, 0.02 - 0.25 * t);
      const phi = 1.25 + rr(-0.06, 0.06);
      const L = 0.8 - 0.1 * t + rr(-0.05, 0.05);
      const mat = t < 0.4 ? M.crimson : t < 0.75 ? M.red : M.orange;
      feather(root, L, 0.13, mat, pos, -s * phi, -0.5 + rr(-0.08, 0.08), 0, M.amber);
    }

    // primaries fanning from the hand to the tips
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const pos = new THREE.Vector3(s * (1.05 + 0.18 * t), 1.72 - 0.06 * t, -0.27 - 0.05 * t);
      const phi = 1.2 + 0.75 * t + rr(-0.05, 0.05);
      const L = 1.25 + 0.35 * (0.5 + 0.5 * Math.sin(Math.PI * t)) + rr(-0.05, 0.05);
      const mat = t < 0.35 ? M.orange : t < 0.7 ? M.amber : M.gold;
      const over = t < 0.35 ? M.amber : M.yellow;
      feather(root, L, 0.15, mat, pos, -s * phi, -0.3 - 0.1 * t, 0, over);
    }
  }
  buildWing(1);
  buildWing(-1);

  // ---- Tail ribbons ----
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const yaw = -0.55 + 1.1 * t + rr(-0.05, 0.05);
    const tilt = -1.72 - rr(0, 0.2);
    const L = 1.5 + 0.5 * (1 - Math.abs(t - 0.5) * 2) + rr(0, 0.2);
    const mat = t < 0.33 ? M.red : t < 0.66 ? M.orange : M.amber;
    const pos = new THREE.Vector3((t - 0.5) * 0.12, 1.2 + rr(-0.03, 0.03), -0.55 - 0.04 * i * 0.2);
    feather(root, L, 0.11, mat, pos, 0, tilt, yaw, M.yellow);
  }

  // ---- Drifting embers around the wings ----
  const emberGeo = new THREE.IcosahedronGeometry(1, 0);
  const emberGroup = new THREE.Group();
  for (let i = 0; i < 60; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    const ember = new THREE.Mesh(emberGeo, M.ember);
    ember.position.set(side * rr(0.4, 2.7), rr(0.6, 3.0), rr(-0.8, 0.5));
    ember.scale.setScalar(rr(0.012, 0.04));
    emberGroup.add(ember);
  }
  for (let i = 0; i < 12; i++) {
    const ember = new THREE.Mesh(emberGeo, M.ember);
    ember.position.set(rr(-0.4, 0.4), rr(0.3, 1.3), rr(-2.0, -0.8));
    ember.scale.setScalar(rr(0.012, 0.03));
    emberGroup.add(ember);
  }
  root.add(emberGroup);

  // ---- Soft heat haze behind the bird ----
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), M.glow);
  glow.position.set(0, 1.7, -0.05);
  glow.scale.set(1.5, 0.9, 0.8);
  root.add(glow);

  // ---- Place: centre on x, stand lowest point on y = 0 ----
  const wrapper = new THREE.Group();
  wrapper.add(root);
  wrapper.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wrapper);
  const cx = (box.min.x + box.max.x) / 2;
  root.position.set(-cx, -box.min.y, 0);

  return wrapper;
}
```