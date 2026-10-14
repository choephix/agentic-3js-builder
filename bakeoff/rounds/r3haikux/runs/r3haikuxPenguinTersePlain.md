```ts
import * as THREE from "three";

export const meta = {
  name: "Penguin",
  description:
    "A stylised king-style penguin with gold ear patches and an orange beak, standing on a small ice floe.",
};

type V3 = [number, number, number];

// Seeded PRNG (mulberry32): the same model is built on every run.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createPenguin(): THREE.Object3D {
  const rand = makeRng(2024);
  const FLOOR = 0.04; // thickness of the ice floe; the penguin stands on its top

  // One material per colour, shared between meshes.
  const mat = {
    black: new THREE.MeshStandardMaterial({ color: 0x1a1d27, roughness: 0.45, flatShading: true }),
    white: new THREE.MeshStandardMaterial({ color: 0xf6f3ec, roughness: 0.55, flatShading: true }),
    orange: new THREE.MeshStandardMaterial({ color: 0xf0872a, roughness: 0.4, flatShading: true }),
    orangeDeep: new THREE.MeshStandardMaterial({ color: 0xd3601c, roughness: 0.4, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xf5b73e, roughness: 0.4, flatShading: true }),
    ink: new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.3, flatShading: true }),
    ice: new THREE.MeshStandardMaterial({ color: 0xaee3f2, roughness: 0.2, flatShading: true }),
  };

  // Shared unit sphere; each mesh scales it into its own ellipsoid.
  const ball = new THREE.SphereGeometry(1, 16, 12);

  const place = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    pos: V3,
    scale: V3 = [1, 1, 1],
    rot: V3 = [0, 0, 0]
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();

  // The bird itself, lifted so its feet sit on top of the floe.
  const bird = new THREE.Group();
  bird.position.y = FLOOR;
  root.add(bird);

  // Torso: black egg-shaped back, with a white front bib pushed slightly forward.
  place(bird, ball, mat.black, [0, 0.36, 0], [0.2, 0.3, 0.19]);
  const bibGeo = new THREE.SphereGeometry(1, 18, 12, 0, Math.PI, 0.75, 1.65);
  place(bird, bibGeo, mat.white, [0, 0.36, 0], [0.17, 0.27, 0.23]);

  // Head group: slight upward tilt gives the proud, readable stance.
  const head = new THREE.Group();
  head.position.set(0, 0.615, 0);
  head.rotation.x = -0.08;
  bird.add(head);

  place(head, ball, mat.black, [0, 0, 0], [0.125, 0.13, 0.125]);

  // Gold ear patches on each side of the head, sweeping down toward the neck.
  place(head, ball, mat.gold, [0.108, -0.02, 0.03], [0.03, 0.075, 0.06]);
  place(head, ball, mat.gold, [-0.108, -0.02, 0.03], [0.03, 0.075, 0.06]);

  // Eyes: white sclera, black pupil, and a small highlight for life.
  for (const s of [-1, 1]) {
    place(head, ball, mat.white, [s * 0.052, 0.035, 0.1], [0.03, 0.03, 0.03]);
    place(head, ball, mat.ink, [s * 0.047, 0.033, 0.126], [0.016, 0.016, 0.016]);
    place(head, ball, mat.white, [s * 0.053, 0.042, 0.136], [0.0055, 0.0055, 0.0055]);
  }

  // Beak: upper and lower cones, tilted slightly down.
  place(head, new THREE.ConeGeometry(0.034, 0.085, 10), mat.orange, [0, 0, 0.15], [1, 1, 1], [1.69, 0, 0]);
  place(head, new THREE.ConeGeometry(0.026, 0.07, 10), mat.orangeDeep, [0, -0.03, 0.135], [1, 1, 1], [1.62, 0, 0]);

  // Flippers: flattened tapering blades hanging out from the shoulders.
  const flipperGeo = new THREE.CylinderGeometry(0.075, 0.02, 0.34, 8);
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.185, 0.5, 0);
    pivot.rotation.z = s * 0.35; // angle away from the body
    bird.add(pivot);
    place(pivot, flipperGeo, mat.black, [0, -0.17, 0], [0.35, 1, 1]);
  }

  // Short legs and webbed orange feet.
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6);
  for (const s of [-1, 1]) {
    place(bird, legGeo, mat.orangeDeep, [s * 0.065, 0.04, 0]);
    place(bird, ball, mat.orange, [s * 0.065, 0.012, 0.035], [0.055, 0.012, 0.085]);
  }

  // Short tail fan, pointing back and down.
  place(bird, new THREE.ConeGeometry(0.045, 0.1, 6), mat.black, [0, 0.185, -0.157], [1, 1, 1], [-2.09, 0, 0]);

  // Ice floe: a chunky low-poly puck whose top sits at FLOOR and whose bottom is at y = 0.
  const floe = new THREE.CylinderGeometry(0.3, 0.34, FLOOR, 7, 1);
  const floeMesh = new THREE.Mesh(floe, mat.ice);
  floeMesh.position.set(0, FLOOR / 2, 0);
  floeMesh.rotation.y = 0.4;
  floeMesh.scale.set(1, 1, 0.85);
  root.add(floeMesh);

  // A few seeded snow lumps dusted on the floe, kept clear of the feet.
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.14 + rand() * 0.08;
    const rad = 0.018 + rand() * 0.02;
    place(root, ball, mat.white, [Math.cos(a) * r, FLOOR, Math.sin(a) * r * 0.85], [rad, rad * 0.5, rad]);
  }

  return root;
}
```