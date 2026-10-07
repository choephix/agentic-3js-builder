import * as THREE from "three";

export const meta = {
  name: "Toucan",
  description: "A stylised keel-billed toucan perched upright on its feet, with a large orange bill, black body, cream chest and red undertail.",
};

export default function buildToucan(): THREE.Object3D {
  const root = new THREE.Group();

  // ---------- Materials (one per colour, shared) ----------
  const mat = {
    black: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6, metalness: 0.05, flatShading: true }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf5f0e1, roughness: 0.7, flatShading: true }),
    orange: new THREE.MeshStandardMaterial({ color: 0xf0801c, roughness: 0.35, flatShading: true }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf9c629, roughness: 0.35, flatShading: true }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2f6fd6, roughness: 0.5, flatShading: true }),
    red: new THREE.MeshStandardMaterial({ color: 0xd62f25, roughness: 0.6, flatShading: true }),
    grey: new THREE.MeshStandardMaterial({ color: 0x5d5a57, roughness: 0.8, flatShading: true }),
    eye: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.2 }),
    glint: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x222222 }),
  };

  // ---------- Shared geometries ----------
  const sphereLo = new THREE.SphereGeometry(1, 14, 10);
  const sphereMid = new THREE.SphereGeometry(1, 18, 12);
  const boxTail = new THREE.BoxGeometry(1, 1, 1);
  const cylLeg = new THREE.CylinderGeometry(0.008, 0.009, 1, 6);
  const eyeRing = new THREE.TorusGeometry(0.016, 0.0055, 6, 14);

  type V3 = [number, number, number];
  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    pos: V3 = [0, 0, 0],
    rot: V3 = [0, 0, 0],
    scl: V3 = [1, 1, 1],
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.scale.set(...scl);
    parent.add(mesh);
    return mesh;
  };

  // ---------- Body group (tilted, perched posture) ----------
  const body = new THREE.Group();
  body.position.set(0, 0.26, 0);
  body.rotation.set(-0.35, 0, 0); // head raised, tail lowered
  root.add(body);

  // Main torso
  add(body, sphereMid, mat.black, [0, 0, 0], [0, 0, 0], [0.10, 0.11, 0.15]);
  // Neck bridging torso to head
  add(body, sphereLo, mat.black, [0, 0.045, 0.115], [0, 0, 0], [0.07, 0.08, 0.07]);
  // Cream chest bib
  add(body, sphereLo, mat.cream, [0, -0.035, 0.07], [0, 0, 0], [0.075, 0.085, 0.10]);
  // Red undertail coverts
  add(body, sphereLo, mat.red, [0, -0.05, -0.13], [0, 0, 0], [0.05, 0.045, 0.06]);

  // Tail: long, slightly fanned with a red tip hint
  add(body, boxTail, mat.black, [0, -0.01, -0.27], [0.05, 0, 0], [0.075, 0.018, 0.2]);
  add(body, boxTail, mat.black, [0, -0.02, -0.39], [0.08, 0, 0], [0.085, 0.014, 0.1]);

  // Folded wings, one per side, with slight splay
  for (const s of [-1, 1]) {
    add(body, sphereLo, mat.black, [s * 0.095, 0.0, -0.02], [0.1, 0, s * 0.08], [0.03, 0.07, 0.14]);
    add(body, boxTail, mat.black, [s * 0.095, -0.005, -0.17], [0.04, s * 0.05, 0], [0.035, 0.012, 0.1]);
  }

  // Head
  add(body, sphereMid, mat.black, [0, 0.10, 0.15], [0, 0, 0], [0.065, 0.068, 0.07]);

  // Blue skin patch around eyes and eyes
  for (const s of [-1, 1]) {
    add(body, eyeRing, mat.blue, [s * 0.058, 0.113, 0.17], [0, Math.PI / 2, 0]);
    add(body, sphereLo, mat.eye, [s * 0.06, 0.115, 0.178], [0, 0, 0], [0.012, 0.012, 0.012]);
    add(body, sphereLo, mat.glint, [s * 0.064, 0.12, 0.185], [0, 0, 0], [0.003, 0.003, 0.003]);
  }

  // Bill: big orange upper mandible, tapering to black tip, with yellow ridge
  const billBase = 0.13;
  add(body, sphereMid, mat.orange, [0, 0.13, 0.25], [0.12, 0, 0], [0.038, 0.045, 0.13]);
  add(body, sphereLo, mat.yellow, [0, 0.175, 0.24], [0.12, 0, 0], [0.02, 0.018, 0.11]);
  add(body, sphereLo, mat.black, [0, 0.12, 0.37], [0.12, 0, 0], [0.024, 0.022, 0.04]);
  // Black base strip on bill
  add(body, sphereLo, mat.black, [0, 0.135, 0.19], [0, 0, 0], [0.036, 0.04, 0.02]);
  // Lower mandible
  add(body, sphereMid, mat.yellow, [0, 0.095, 0.235], [0.1, 0, 0], [0.03, 0.028, 0.115]);
  // Keep unused variable quiet
  void billBase;

  // ---------- Legs and feet (world space, standing on y = 0) ----------
  for (const s of [-1, 1]) {
    const x = s * 0.03;
    // Shank
    add(root, cylLeg, mat.grey, [x, 0.09, 0.03], [0, 0, 0], [1, 0.18, 1]);
    // Three forward toes and one back toe
    add(root, boxTail, mat.grey, [x, 0.006, 0.05], [0, 0, 0], [0.012, 0.012, 0.06]);
    add(root, boxTail, mat.grey, [x + s * 0.015, 0.006, 0.04], [0, s * 0.5, 0], [0.012, 0.012, 0.05]);
    add(root, boxTail, mat.grey, [x - s * 0.005, 0.006, 0.04], [0, -s * 0.4, 0], [0.012, 0.012, 0.05]);
    add(root, boxTail, mat.grey, [x, 0.006, -0.01], [0, 0, 0], [0.012, 0.012, 0.03]);
  }

  return root;
}
