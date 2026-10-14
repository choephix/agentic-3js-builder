import * as THREE from "three";

export const meta = {
  name: "Fennec Fox",
  description:
    "Stylized fennec fox in a relaxed standing pose: oversized ears, pale muzzle, sandy coat and a bushy tail with a black tip.",
};

type V3 = [number, number, number];

// Parts are authored in design units and scaled to real size.
// Result: ~0.37 m to the ear tips, ~0.63 m from nose to tail tip.
const SCALE = 0.75;

export default function createFennecFox(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "FennecFox";
  root.scale.setScalar(SCALE);

  // One material per colour, shared across meshes.
  const M = {
    coat: new THREE.MeshStandardMaterial({ color: 0xe2ad72, roughness: 0.85 }),
    coatDeep: new THREE.MeshStandardMaterial({ color: 0xbc7440, roughness: 0.85 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf8e8d0, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2a201b, roughness: 0.7 }),
    liner: new THREE.MeshStandardMaterial({ color: 0x4b2d1d, roughness: 0.8 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x0d0907, roughness: 0.25 }),
    glint: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
  };

  // Shared unit sphere, stretched into ellipsoids by scale.
  const ballGeo = new THREE.SphereGeometry(1, 14, 10);

  const blob = (
    parent: THREE.Object3D,
    mat: THREE.Material,
    pos: V3,
    radii: V3,
    rot: V3 = [0, 0, 0],
  ) => {
    const m = new THREE.Mesh(ballGeo, mat);
    m.position.set(...pos);
    m.scale.set(...radii);
    m.rotation.set(...rot);
    parent.add(m);
    return m;
  };

  const piece = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: V3,
    rot: V3 = [0, 0, 0],
    scale: V3 = [1, 1, 1],
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    parent.add(m);
    return m;
  };

  // ---- legs: slim, long, with dark-cream paws ----------------------------
  const legs = new THREE.Group();
  legs.name = "legs";
  root.add(legs);
  const legGeo = new THREE.CylinderGeometry(0.021, 0.014, 0.19, 8);
  for (const x of [-0.05, 0.05]) {
    for (const z of [0.085, -0.09]) {
      piece(legs, legGeo, M.coat, [x, 0.095, z]);
      blob(legs, M.cream, [x, 0.012, z + 0.012], [0.024, 0.014, 0.032]);
    }
  }

  // ---- torso: a chunky body built from overlapping ellipsoids -----------
  const torso = new THREE.Group();
  torso.name = "torso";
  root.add(torso);
  blob(torso, M.coat, [0, 0.225, -0.05], [0.085, 0.085, 0.11]); // rear
  blob(torso, M.coat, [0, 0.215, 0.08], [0.08, 0.082, 0.085]); // chest
  blob(torso, M.coatDeep, [0, 0.3, -0.03], [0.05, 0.024, 0.12]); // darker saddle
  blob(torso, M.cream, [0, 0.175, 0.0], [0.068, 0.05, 0.12]); // pale underbelly
  // Haunches: the thighs give the rear a puppet-like silhouette.
  for (const s of [-1, 1]) {
    blob(torso, M.coat, [s * 0.06, 0.2, -0.1], [0.04, 0.065, 0.072]);
  }

  // ---- head: neck, skull, pale muzzle, big dark eyes ---------------------
  const head = new THREE.Group();
  head.name = "head";
  root.add(head);
  blob(head, M.coat, [0, 0.28, 0.12], [0.06, 0.068, 0.07], [0.35, 0, 0]); // neck
  blob(head, M.cream, [0, 0.255, 0.16], [0.04, 0.05, 0.04]); // throat
  blob(head, M.coat, [0, 0.335, 0.215], [0.068, 0.062, 0.072]); // skull
  blob(head, M.cream, [0, 0.318, 0.258], [0.046, 0.036, 0.05]); // cheeks

  const muzzleGeo = new THREE.ConeGeometry(0.036, 0.11, 10);
  piece(head, muzzleGeo, M.cream, [0, 0.325, 0.3], [Math.PI / 2, 0, 0]);
  blob(head, M.dark, [0, 0.327, 0.352], [0.017, 0.014, 0.015]); // nose

  for (const s of [-1, 1]) {
    // Dark eyeliner ring, slanted up and out, then the eye itself.
    blob(head, M.liner, [s * 0.034, 0.345, 0.27], [0.022, 0.026, 0.006], [0, 0, -s * 0.25]);
    blob(head, M.eye, [s * 0.034, 0.345, 0.275], [0.016, 0.02, 0.008], [0, 0, -s * 0.25]);
    // Tiny specular glint for life.
    blob(head, M.glint, [s * 0.038, 0.351, 0.281], [0.0042, 0.0042, 0.0042]);
  }

  // ---- ears: the signature feature, thin blades with cream inner panels --
  const earGeo = new THREE.ConeGeometry(0.045, 0.13, 10);
  const earInnerGeo = new THREE.ConeGeometry(0.032, 0.12, 10);
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.name = s > 0 ? "earL" : "earR";
    ear.position.set(s * 0.042, 0.43, 0.19);
    ear.rotation.set(-0.2, 0, -s * 0.22); // flare outward, tip back slightly
    root.add(ear);
    piece(ear, earGeo, M.coat, [0, 0, 0], [0, 0, 0], [1, 1, 0.4]);
    piece(ear, earInnerGeo, M.cream, [0, -0.005, 0.006], [0, 0, 0], [1, 1, 0.4]);
  }

  // ---- tail: bushy, tapering stack of ellipsoids with a black tip --------
  const tail = new THREE.Group();
  tail.name = "tail";
  root.add(tail);
  blob(tail, M.coat, [0, 0.235, -0.17], [0.045, 0.045, 0.06]);
  blob(tail, M.coat, [0, 0.23, -0.25], [0.058, 0.056, 0.075]);
  blob(tail, M.coat, [0, 0.235, -0.33], [0.062, 0.06, 0.08]);
  blob(tail, M.coat, [0, 0.25, -0.38], [0.05, 0.05, 0.06]);
  blob(tail, M.dark, [0, 0.26, -0.44], [0.05, 0.05, 0.05]);

  // Fur tufts sticking out of the sides of the tail for a fluffy silhouette.
  const tuftGeo = new THREE.ConeGeometry(0.02, 0.05, 6);
  for (const s of [-1, 1]) {
    piece(tail, tuftGeo, M.coatDeep, [s * 0.06, 0.233, -0.25], [-0.45, 0, -s * 1.25]);
    piece(tail, tuftGeo, M.coatDeep, [s * 0.064, 0.24, -0.33], [-0.45, 0, -s * 1.25]);
  }

  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return root;
}
