import * as THREE from "three";

export const meta = {
  name: "Penguin",
  description: "A stylized standing penguin with a black back, white belly, orange beak and feet, and yellow cheek patches."
};

export default function createPenguin(): THREE.Object3D {
  const root = new THREE.Group();

  // Shared materials, one per colour
  const black = new THREE.MeshStandardMaterial({ color: 0x1b1d24, roughness: 0.55, metalness: 0.0 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.4, metalness: 0.0 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xf2a33a, roughness: 0.35, metalness: 0.0 });
  const feet = new THREE.MeshStandardMaterial({ color: 0xe8892b, roughness: 0.5, metalness: 0.0 });
  const cheek = new THREE.MeshStandardMaterial({ color: 0xf5c542, roughness: 0.45, metalness: 0.0 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], scale?: [number, number, number], rot?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(pos[0], pos[1], pos[2]);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    root.add(m);
    return m;
  };

  // Body: tall black egg shape
  const bodyGeo = new THREE.SphereGeometry(0.2, 22, 16);
  add(bodyGeo, black, [0, 0.35, 0], [1, 1.6, 0.95]);

  // White belly bulging forward
  const bellyGeo = new THREE.SphereGeometry(0.16, 18, 14);
  add(bellyGeo, white, [0, 0.33, 0.12], [0.85, 1.45, 0.5]);

  // Head
  const headGeo = new THREE.SphereGeometry(0.13, 18, 14);
  add(headGeo, black, [0, 0.6, 0], [1, 0.95, 0.95]);

  // Yellow cheek patches on both sides of the head
  const cheekGeo = new THREE.SphereGeometry(0.06, 12, 10);
  add(cheekGeo, cheek, [0.125, 0.57, 0.03], [0.35, 1, 0.7]);
  add(cheekGeo, cheek, [-0.125, 0.57, 0.03], [0.35, 1, 0.7]);

  // Eyes: white sclera with black pupils
  const eyeGeo = new THREE.SphereGeometry(0.03, 12, 10);
  add(eyeGeo, white, [0.06, 0.63, 0.115]);
  add(eyeGeo, white, [-0.06, 0.63, 0.115]);
  const pupilGeo = new THREE.SphereGeometry(0.016, 10, 8);
  add(pupilGeo, black, [0.06, 0.63, 0.14]);
  add(pupilGeo, black, [-0.06, 0.63, 0.14]);

  // Beak: cone pointing forward (+Z)
  const beakGeo = new THREE.ConeGeometry(0.03, 0.09, 12);
  add(beakGeo, orange, [0, 0.58, 0.16], undefined, [Math.PI / 2, 0, 0]);

  // Feet: flat orange pads with a forward toe
  const footGeo = new THREE.BoxGeometry(0.1, 0.03, 0.14);
  add(footGeo, feet, [0.07, 0.015, 0.1]);
  add(footGeo, feet, [-0.07, 0.015, 0.1]);
  const toeGeo = new THREE.BoxGeometry(0.05, 0.025, 0.04);
  add(toeGeo, feet, [0.07, 0.0125, 0.19]);
  add(toeGeo, feet, [-0.07, 0.0125, 0.19]);

  // Flippers: black paddles held out from the body, angled slightly outward
  const flipperGeo = new THREE.SphereGeometry(0.1, 16, 12);
  add(flipperGeo, black, [0.2, 0.34, 0], [0.35, 1.3, 0.6], [0, 0, 0.25]);
  add(flipperGeo, black, [-0.2, 0.34, 0], [0.35, 1.3, 0.6], [0, 0, -0.25]);

  // Tail: small wedge at the back
  const tailGeo = new THREE.ConeGeometry(0.05, 0.12, 10);
  add(tailGeo, black, [0, 0.14, -0.2], undefined, [-1.3, 0, 0]);

  return root;
}
