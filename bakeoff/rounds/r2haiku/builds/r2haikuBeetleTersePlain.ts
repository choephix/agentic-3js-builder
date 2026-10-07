import * as THREE from "three";

export const meta = {
  name: "Stag Beetle",
  description:
    "A male stag beetle in a neutral rest pose: glossy chestnut elytra, a black head, long branching mandibles, elbowed antennae and six jointed legs. Built from primitives, about 11 cm long.",
};

export default function createStagBeetle(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "StagBeetle";

  // ---- Materials (one per colour, shared) ----
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x4a2a17,
    roughness: 0.28,
    metalness: 0.15,
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x14100e,
    roughness: 0.22,
    metalness: 0.2,
  });
  const mandibleMat = new THREE.MeshStandardMaterial({
    color: 0x7a3f1c,
    roughness: 0.4,
    metalness: 0.05,
  });
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x2b1a10,
    roughness: 0.5,
    metalness: 0.05,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.08,
    metalness: 0.4,
  });
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x1a0f09,
    roughness: 0.6,
  });

  // ---- Helpers ----
  const up = new THREE.Vector3(0, 1, 0);

  // Cylinder stretched between two points (a limb segment).
  function limb(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(up, dir.normalize());
    return mesh;
  }

  function joint(p: THREE.Vector3, r: number, mat: THREE.Material, seg = 6) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, 5), mat);
    mesh.position.copy(p);
    return mesh;
  }

  function ellipsoid(
    p: [number, number, number],
    s: [number, number, number],
    mat: THREE.Material,
    seg: [number, number] = [14, 10]
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg[0], seg[1]), mat);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    return mesh;
  }

  // ---- Elytra (wing cases): the main glossy shell ----
  const elytra = ellipsoid([0, 0.027, -0.012], [0.024, 0.017, 0.04], shellMat, [16, 12]);
  root.add(elytra);

  // Central seam where the two wing cases meet
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.0016, 0.0025, 0.07), seamMat);
  seam.position.set(0, 0.0435, -0.012);
  root.add(seam);

  // Raised ridges along each elytron for a bit of sculpted character
  for (const s of [1, -1]) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.004, 0.058), shellMat);
    ridge.position.set(s * 0.011, 0.0415, -0.014);
    ridge.rotation.z = s * -0.18;
    root.add(ridge);
  }

  // Tiny punctures on the elytra front, laid out on a regular pattern
  const pitMat = seamMat;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      for (const s of [1, -1]) {
        const x = s * (0.006 + col * 0.0065);
        const z = 0.0 - row * 0.011 - 0.003;
        // Approximate the shell height at this point on the ellipsoid
        const nx = x / 0.024;
        const nz = (z + 0.012) / 0.04;
        const k = 1 - nx * nx - nz * nz;
        if (k <= 0) continue;
        const y = 0.027 + 0.017 * Math.sqrt(k);
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0008, 4, 3), pitMat);
        dot.position.set(x, y - 0.0005, z);
        root.add(dot);
      }
    }
  }

  // Abdomen tip, tapering behind the elytra
  root.add(ellipsoid([0, 0.02, -0.05], [0.016, 0.012, 0.014], shellMat));

  // ---- Pronotum (thorax shield) ----
  const pronotum = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.016, 0.018, 2, 2, 2), shellMat);
  pronotum.position.set(0, 0.027, 0.03);
  root.add(pronotum);

  // Small rounded bumps on the pronotum
  for (const s of [1, -1]) {
    root.add(joint(new THREE.Vector3(s * 0.007, 0.036, 0.03), 0.0035, shellMat, 6));
  }

  // ---- Head ----
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.018, 0.02, 2, 2, 2), headMat);
  head.position.set(0, 0.024, 0.052);
  root.add(head);

  // Compound eyes, one on each side
  for (const s of [1, -1]) {
    root.add(ellipsoid([s * 0.0125, 0.027, 0.054], [0.0036, 0.0045, 0.0045], eyeMat, [10, 8]));
  }

  // ---- Mandibles (the stag antlers) ----
  // Each mandible is a curved tube, with an inner tooth near the base.
  for (const s of [1, -1]) {
    const pts = [
      new THREE.Vector3(s * 0.006, 0.023, 0.06),
      new THREE.Vector3(s * 0.016, 0.022, 0.072),
      new THREE.Vector3(s * 0.02, 0.02, 0.09),
      new THREE.Vector3(s * 0.014, 0.018, 0.107),
      new THREE.Vector3(s * 0.005, 0.017, 0.112),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.0026, 6, false), mandibleMat);
    root.add(tube);

    // Inner tooth jutting toward the centre line
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.0022, 0.008, 5), mandibleMat);
    tooth.position.set(s * 0.012, 0.0205, 0.082);
    tooth.rotation.z = s * -1.0;
    tooth.rotation.y = 0.3 * s;
    root.add(tooth);

    // Hook-shaped tip tooth
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0018, 0.006, 5), mandibleMat);
    tip.position.set(s * 0.004, 0.0175, 0.105);
    tip.rotation.z = s * -0.6;
    root.add(tip);

    // Joint where the mandible meets the head
    root.add(joint(new THREE.Vector3(s * 0.008, 0.023, 0.058), 0.0032, headMat, 6));
  }

  // ---- Antennae: elbowed with a small club at the end ----
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.005, 0.03, 0.068);
    const elbow = new THREE.Vector3(s * 0.011, 0.034, 0.078);
    const tipP = new THREE.Vector3(s * 0.017, 0.031, 0.086);
    root.add(limb(base, elbow, 0.0013, legMat, 5));
    root.add(joint(elbow, 0.0016, legMat, 5));
    root.add(limb(elbow, tipP, 0.0013, legMat, 5));
    const club = ellipsoid(
      [tipP.x + s * 0.001, tipP.y, tipP.z + 0.002],
      [0.0028, 0.0022, 0.0042],
      mandibleMat,
      [8, 6]
    );
    root.add(club);
  }

  // ---- Legs: three pairs, each with hip, knee and foot ----
  const legZ = [0.018, 0.0, -0.018];
  const footOffset = [0.006, 0.0, -0.006];
  for (let i = 0; i < 3; i++) {
    for (const s of [1, -1]) {
      const z = legZ[i];
      const hip = new THREE.Vector3(s * 0.014, 0.024, z);
      const knee = new THREE.Vector3(s * 0.04, 0.034, z + footOffset[i] * 0.5);
      const foot = new THREE.Vector3(s * 0.054, 0.0025, z + footOffset[i] * 1.5);

      // Femur and tibia
      root.add(limb(hip, knee, 0.0026, legMat, 6));
      root.add(limb(knee, foot, 0.0017, legMat, 6));

      // Joints and a small claw-tip pad touching the floor
      root.add(joint(hip, 0.0034, legMat, 6));
      root.add(joint(knee, 0.0028, legMat, 6));
      root.add(joint(foot, 0.0025, mandibleMat, 5));
    }
  }

  return root;
}
