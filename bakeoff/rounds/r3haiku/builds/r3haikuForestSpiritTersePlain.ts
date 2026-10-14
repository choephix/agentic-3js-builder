import * as THREE from "three";

export const meta = {
  name: "Forest Spirit",
  description:
    "A stylized antlered forest spirit with bark limbs, a moss-and-leaf shawl, glowing amber eyes, and drifting fireflies. Built from primitives and about 2 m tall.",
};

// Seeded RNG (mulberry32) so every build is identical.
let seed = 7;
function rng() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const UP = new THREE.Vector3(0, 1, 0);

function barkTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5a4330";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = rng() < 0.5 ? "#3b2a1d" : "#7a5c40";
    g.fillRect(rng() * 256, 0, 1 + rng() * 3, 256);
  }
  for (let i = 0; i < 40; i++) {
    g.fillStyle = "#2a1f15";
    g.fillRect(rng() * 256, rng() * 256, 2, 6 + rng() * 14);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Recursive branching limb. Returns the tip position.
function limb(parent, origin, dir, len, r, depth, mat) {
  const d = dir.clone().normalize();
  const end = origin.clone().addScaledVector(d, len);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, len, 6), mat);
  m.position.copy(origin).addScaledVector(d, len / 2);
  m.quaternion.setFromUnitVectors(UP, d);
  parent.add(m);
  if (depth > 0) {
    const n = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < n; i++) {
      const nd = d
        .clone()
        .add(new THREE.Vector3((rng() - 0.5) * 0.9, rng() * 0.3, (rng() - 0.5) * 0.9))
        .normalize();
      limb(parent, end, nd, len * 0.68, r * 0.6, depth - 1, mat);
    }
  }
  return end;
}

function leaf(parent, pos, scale, mat) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(scale, 0), mat);
  m.scale.set(1, 0.18, 0.55);
  m.position.copy(pos);
  m.rotation.set(rng() * 0.8 - 0.4, rng() * Math.PI * 2, rng() * 0.8 - 0.4);
  parent.add(m);
  return m;
}

export default function createForestSpirit() {
  const group = new THREE.Group();

  // Materials: one per colour, shared.
  const bark = new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.9 });
  const moss = new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x7fb34a,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const antler = new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.6 });
  const glow = new THREE.MeshStandardMaterial({
    color: 0xffc857,
    emissive: 0xffa930,
    emissiveIntensity: 2.2,
  });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc9d8a8, roughness: 0.8 });
  const cap = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
  const stem = new THREE.MeshStandardMaterial({ color: 0xf2e6cc, roughness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x7d7d72, roughness: 0.95 });

  // Mossy mound the spirit stands on (bottom sinks slightly below y=0).
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.08, 9), moss);
  mound.position.y = 0.01;
  group.add(mound);

  const stoneA = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), stone);
  stoneA.scale.set(1, 0.6, 0.8);
  stoneA.position.set(0.3, 0.02, -0.2);
  group.add(stoneA);

  // Mushrooms at the base.
  for (const [x, z, s] of [[0.28, 0.12, 1], [0.22, 0.2, 0.7]]) {
    const sg = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * s, 0.024 * s, 0.07 * s, 6), stem);
    sg.position.set(x, 0.035 * s, z);
    group.add(sg);
    const cg = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      cap
    );
    cg.position.set(x, 0.07 * s, z);
    group.add(cg);
  }

  // Feet: flattened root-like blobs.
  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), bark);
    foot.scale.set(1.1, 0.5, 1.9);
    foot.position.set(side * 0.1, 0.03, 0.05);
    group.add(foot);
  }

  // Legs: tapered trunks.
  for (const side of [-1, 1]) {
    limb(
      group,
      new THREE.Vector3(side * 0.1, 0.85, 0),
      new THREE.Vector3(side * 0.05, -1, 0.02),
      0.8,
      0.085,
      0,
      bark
    );
  }

  // Torso: a tapered trunk with a moss belt.
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.21, 0.62, 8), bark);
  torso.position.y = 1.1;
  group.add(torso);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.03, 5, 10), moss);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.94;
  group.add(belt);

  // Neck.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.16, 6), bark);
  neck.position.y = 1.47;
  group.add(neck);

  // Head: elongated faceted form with a gentle brow.
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), skin);
  head.scale.set(0.95, 1.1, 1.05);
  head.position.y = 1.62;
  group.add(head);

  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.06), bark);
  brow.position.set(0, 1.68, 0.14);
  brow.rotation.x = -0.2;
  group.add(brow);

  // Glowing amber eyes.
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), glow);
    eye.position.set(side * 0.06, 1.63, 0.15);
    group.add(eye);
  }

  // Mouth sliver.
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.02), bark);
  mouth.position.set(0, 1.55, 0.155);
  group.add(mouth);

  // Antlers: branching twig crowns.
  for (const side of [-1, 1]) {
    limb(
      group,
      new THREE.Vector3(side * 0.08, 1.74, 0),
      new THREE.Vector3(side * 0.45, 1, 0.1),
      0.32,
      0.035,
      3,
      antler
    );
  }

  // Arms: bark limbs with twig fingers ending in small knuckle spheres.
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Vector3(side * 0.2, 1.3, 0);
    const tip = limb(
      group,
      shoulder,
      new THREE.Vector3(side * 0.7, -0.8, 0.25),
      0.5,
      0.05,
      1,
      bark
    );
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 0), skin);
    hand.position.copy(tip);
    group.add(hand);
    limb(
      group,
      tip,
      new THREE.Vector3(side * 0.4, -0.5, 0.6),
      0.12,
      0.018,
      1,
      bark
    );
  }

  // Crown leaves around the antlers.
  for (let i = 0; i < 18; i++) {
    const a = rng() * Math.PI * 2;
    const pos = new THREE.Vector3(
      Math.cos(a) * (0.2 + rng() * 0.12),
      1.82 + rng() * 0.28,
      Math.sin(a) * 0.16 - 0.02
    );
    leaf(group, pos, 0.07 + rng() * 0.03, leafMat);
  }

  // Shawl of hanging leaves around the torso.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rng() * 0.2;
    const r = 0.23 + rng() * 0.03;
    const y = 0.8 + rng() * 0.4;
    const l = leaf(
      group,
      new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
      0.09,
      leafMat
    );
    l.rotation.set(0.6 + rng() * 0.3, a, 0);
  }

  // Fireflies drifting around the spirit.
  for (let i = 0; i < 10; i++) {
    const a = rng() * Math.PI * 2;
    const r = 0.4 + rng() * 0.5;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), glow);
    f.position.set(Math.cos(a) * r, 0.5 + rng() * 1.1, Math.sin(a) * r);
    group.add(f);
  }

  return group;
}
