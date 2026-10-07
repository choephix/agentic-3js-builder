```ts
import * as THREE from "three";

export const meta = {
  name: "Scorpion",
  description:
    "Stylized desert scorpion with a raised, curled tail ending in a glossy stinger, broad pincers, and eight legs in a rest pose.",
};

// One material per colour, shared across meshes.
const mats = {
  shell: new THREE.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.45, metalness: 0.1 }),
  shellDark: new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.5, metalness: 0.1 }),
  leg: new THREE.MeshStandardMaterial({ color: 0x5c3517, roughness: 0.55, metalness: 0.05 }),
  claw: new THREE.MeshStandardMaterial({ color: 0x9a6a3c, roughness: 0.4, metalness: 0.1 }),
  tail: new THREE.MeshStandardMaterial({ color: 0x8c5a2c, roughness: 0.4, metalness: 0.1 }),
  sting: new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.25, metalness: 0.2 }),
  eye: new THREE.MeshStandardMaterial({
    color: 0x2a0a00,
    emissive: 0xff7a1a,
    emissiveIntensity: 0.6,
    roughness: 0.15,
    metalness: 0.0,
  }),
};

const UP = new THREE.Vector3(0, 1, 0);

export default function createScorpion(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = "Scorpion";

  // Tapered cylinder from point a to point b (r0 at a, r1 at b).
  function link(
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    mat: THREE.Material,
    seg = 8,
  ) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
    group.add(mesh);
    return mesh;
  }

  function ball(
    p: THREE.Vector3 | [number, number, number],
    r: number,
    mat: THREE.Material,
    scale: [number, number, number] = [1, 1, 1],
    seg = 10,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)), mat);
    if (Array.isArray(p)) mesh.position.set(p[0], p[1], p[2]);
    else mesh.position.copy(p);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    group.add(mesh);
    return mesh;
  }

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- Body ----
  // Prosoma (cephalothorax), broad front shield.
  ball([0, 0.042, 0.07], 0.04, mats.shell, [0.92, 0.5, 1.0], 12);

  // Mesosoma (segmented abdomen), wider and lower.
  ball([0, 0.036, -0.04], 0.034, mats.shell, [0.9, 0.55, 1.4], 12);

  // Tergite plates ridging the mesosoma.
  for (let i = 0; i < 4; i++) {
    ball([0, 0.056, -0.015 - i * 0.015], 0.012, mats.shellDark, [1.3, 0.4, 1.0], 8);
  }

  // Eyes: a pair of big median eyes and a lateral cluster on each side.
  for (const s of [-1, 1]) {
    ball([s * 0.012, 0.066, 0.1], 0.005, mats.eye, [1, 1, 1], 8);
    ball([s * 0.022, 0.06, 0.09], 0.0035, mats.eye, [1, 1, 1], 6);
    ball([s * 0.028, 0.058, 0.078], 0.003, mats.eye, [1, 1, 1], 6);
  }

  // ---- Pedipalps (raised pincer arms) ----
  for (const s of [-1, 1]) {
    const hip = V(s * 0.03, 0.04, 0.1);
    const elbow = V(s * 0.07, 0.045, 0.15);
    const wrist = V(s * 0.08, 0.035, 0.2);

    link(hip, elbow, 0.008, 0.007, mats.shell, 8);
    ball(elbow, 0.0075, mats.shell, [1, 1, 1], 8);
    link(elbow, wrist, 0.007, 0.008, mats.shell, 8);

    // Pincer hand.
    ball(wrist, 0.011, mats.claw, [1, 0.8, 1.3], 8);
    link(wrist, V(s * 0.07, 0.03, 0.27), 0.008, 0.003, mats.claw, 6); // fixed finger
    link(wrist, V(s * 0.09, 0.03, 0.265), 0.008, 0.003, mats.claw, 6); // moving finger
    // Small teeth on the pincer tips.
    ball(V(s * 0.07, 0.03, 0.27), 0.0035, mats.sting, [1, 1, 1], 6);
    ball(V(s * 0.09, 0.03, 0.265), 0.0035, mats.sting, [1, 1, 1], 6);
  }

  // ---- Legs: four pairs, splayed in a rest pose ----
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const hz = 0.05 - i * 0.03;
      const hip = V(s * 0.028, 0.045, hz);
      const knee = V(s * 0.085, 0.07, hz - 0.004);
      const foot = V(s * 0.115, 0.004, hz - 0.02);

      link(hip, knee, 0.005, 0.0035, mats.leg, 6);
      ball(knee, 0.0045, mats.leg, [1, 1, 1], 6);
      link(knee, foot, 0.0035, 0.0018, mats.leg, 6);
      ball(foot, 0.0022, mats.sting, [1, 1, 1], 5);
    }
  }

  // ---- Metasoma (curled tail) ----
  // Arc in the YZ plane: starts behind the body, rises over the back,
  // and the stinger hooks down toward the head.
  const R = 0.09;
  const cy = 0.04;
  const cz = -0.01;
  const P = (a: number) => V(0, cy + R * Math.sin(a), cz - R * Math.cos(a));
  const A = 0.85 * Math.PI;

  const segRadius = [0.022, 0.02, 0.018, 0.015, 0.013];
  for (let i = 0; i < 5; i++) {
    const a0 = (A * i) / 5;
    const a1 = (A * (i + 1)) / 5;
    const r = segRadius[i];
    const mat = i % 2 === 0 ? mats.tail : mats.shell;
    link(P(a0), P(a1), r, r * 0.9, mat, 10);
    ball(P(a1), r * 0.92, mat, [1, 1, 1], 10);
  }

  // Venom bulb (telson).
  const end = P(A);
  ball(end, 0.016, mats.sting, [1, 1, 1.2], 12);

  // Stinger: tangent direction at the tail tip, bent slightly.
  const T = V(0, R * Math.cos(A), R * Math.sin(A)).normalize();
  const s1 = end.clone().addScaledVector(T, 0.02);
  const s2 = s1.clone().addScaledVector(T, 0.018).add(V(0, 0.004, 0.002));
  link(end, s1, 0.007, 0.005, mats.sting, 8);
  link(s1, s2, 0.005, 0.0012, mats.sting, 6);

  return group;
}
```