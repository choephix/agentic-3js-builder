import * as THREE from "three";

export const meta = {
  name: "Clockwork Dog",
  description: "A brass and copper wind-up dog with gear flanks, a spring tail, a key on its back and glowing amber eyes.",
};

export default function createClockworkDog(): THREE.Object3D {
  const root = new THREE.Group();

  // Materials, one per colour, shared across meshes
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a14a, metalness: 0.85, roughness: 0.32 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xb06a3b, metalness: 0.8, roughness: 0.4 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.6, roughness: 0.55 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x20242b, metalness: 0.5, roughness: 0.6 });
  const amber = new THREE.MeshStandardMaterial({
    color: 0xffb040,
    emissive: 0xff8a10,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const black = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.4 });

  const add = (
    parent: THREE.Object3D,
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0
  ): THREE.Mesh => {
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  // Torso
  const torsoY = 0.44;
  add(root, new THREE.BoxGeometry(0.22, 0.22, 0.55), copper, 0, torsoY, 0);

  // Brass bands wrapping the torso
  const bandGeom = new THREE.BoxGeometry(0.236, 0.236, 0.03);
  add(root, bandGeom, brass, 0, torsoY, 0.16);
  add(root, bandGeom, brass, 0, torsoY, -0.12);

  // Chest plate
  add(root, new THREE.BoxGeometry(0.16, 0.18, 0.04), brass, 0, torsoY - 0.01, 0.29);

  // Rivets along both flanks
  const rivetGeom = new THREE.SphereGeometry(0.008, 6, 4);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const z = -0.22 + i * 0.065;
      add(root, rivetGeom, brass, side * 0.113, torsoY + 0.09, z);
      add(root, rivetGeom, brass, side * 0.113, torsoY - 0.09, z);
    }
  }

  // Gear builder: a toothed wheel lying in the XY plane (normal along Z)
  const buildGear = (r: number, teeth: number, thickness: number, mat: THREE.Material): THREE.Group => {
    const g = new THREE.Group();
    const body = new THREE.CylinderGeometry(r, r, thickness, 20);
    add(g, body, mat, 0, 0, 0, Math.PI / 2, 0, 0);
    const toothGeom = new THREE.BoxGeometry(r * 0.38, r * 0.34, thickness);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      add(
        g,
        toothGeom,
        mat,
        Math.cos(a) * r * 1.02,
        Math.sin(a) * r * 1.02,
        0,
        0,
        0,
        a
      );
    }
    add(g, new THREE.CylinderGeometry(r * 0.22, r * 0.22, thickness * 1.6, 8), iron, 0, 0, 0, Math.PI / 2, 0, 0);
    return g;
  };

  // Gears on both flanks, facing outward
  for (const side of [-1, 1]) {
    const g1 = buildGear(0.07, 12, 0.025, brass);
    g1.position.set(side * 0.116, torsoY + 0.02, 0.12);
    g1.rotation.y = side * Math.PI / 2;
    root.add(g1);

    const g2 = buildGear(0.05, 9, 0.025, iron);
    g2.position.set(side * 0.118, torsoY - 0.05, -0.05);
    g2.rotation.y = side * Math.PI / 2 + 0.3;
    root.add(g2);
  }

  // Key on top of the back
  add(root, new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), brass, 0, torsoY + 0.16, -0.18);
  add(root, new THREE.TorusGeometry(0.032, 0.008, 6, 14), brass, 0, torsoY + 0.22, -0.18, Math.PI / 2, 0, 0);
  add(root, new THREE.BoxGeometry(0.02, 0.012, 0.05), brass, 0, torsoY + 0.13, -0.18);

  // Legs: four jointed legs, each a group whose origin sits at the hip
  const hipY = torsoY - 0.11; // underside of torso
  const buildLeg = (x: number, z: number) => {
    const leg = new THREE.Group();
    leg.position.set(x, hipY, z);
    root.add(leg);
    add(leg, new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), iron, 0, 0, 0);
    add(leg, new THREE.BoxGeometry(0.05, 0.16, 0.05), copper, 0, -0.08, 0);
    add(leg, new THREE.SphereGeometry(0.03, 8, 6), brass, 0, -0.16, 0);
    add(leg, new THREE.BoxGeometry(0.04, 0.14, 0.04), iron, 0, -0.23, 0);
    add(leg, new THREE.BoxGeometry(0.06, 0.03, 0.09), darkMetal, 0, -0.315, 0.02);
  };
  buildLeg(-0.07, 0.2);
  buildLeg(0.07, 0.2);
  buildLeg(-0.07, -0.2);
  buildLeg(0.07, -0.2);

  // Neck
  add(root, new THREE.BoxGeometry(0.09, 0.16, 0.1), copper, 0, 0.56, 0.3, -0.5, 0, 0);
  add(root, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), brass, 0, 0.56, 0.3, -0.5, 0, Math.PI / 2);

  // Head group
  const head = new THREE.Group();
  head.position.set(0, 0.64, 0.4);
  root.add(head);
  add(head, new THREE.BoxGeometry(0.15, 0.14, 0.17), copper, 0, 0, 0);
  // Brow plate
  add(head, new THREE.BoxGeometry(0.16, 0.03, 0.1), brass, 0, 0.075, 0.02);
  // Snout
  add(head, new THREE.BoxGeometry(0.08, 0.07, 0.1), copper, 0, -0.025, 0.13);
  // Nose
  add(head, new THREE.SphereGeometry(0.02, 8, 6), black, 0, -0.005, 0.19);
  // Jaw
  add(head, new THREE.BoxGeometry(0.07, 0.02, 0.09), iron, 0, -0.08, 0.12);
  // Eyes
  for (const side of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.018, 10, 8), amber, side * 0.072, 0.02, 0.05);
    add(head, new THREE.TorusGeometry(0.024, 0.005, 5, 10), brass, side * 0.074, 0.02, 0.05, 0, Math.PI / 2, 0);
  }
  // Ears: pointed cones angled out
  for (const side of [-1, 1]) {
    add(head, new THREE.ConeGeometry(0.035, 0.08, 6), iron, side * 0.06, 0.11, -0.02, 0, 0, -side * 0.4);
  }
  // Little antenna with a ball on top
  add(head, new THREE.CylinderGeometry(0.004, 0.004, 0.08, 6), brass, 0, 0.14, -0.05);
  add(head, new THREE.SphereGeometry(0.014, 8, 6), amber, 0, 0.19, -0.05);

  // Spring tail: a row of torus coils rising from the rear
  const tailCount = 7;
  for (let i = 0; i < tailCount; i++) {
    const t = i / (tailCount - 1);
    const coil = new THREE.TorusGeometry(0.035 - t * 0.008, 0.007, 6, 12);
    const mat = i % 2 === 0 ? brass : copper;
    add(root, coil, mat, 0, 0.48 + t * 0.2, -0.33 - t * 0.12, Math.PI / 2 - 0.5 * t, 0, 0);
  }

  // Tail tip
  add(root, new THREE.SphereGeometry(0.02, 8, 6), amber, 0, 0.7, -0.5);

  return root;
}
