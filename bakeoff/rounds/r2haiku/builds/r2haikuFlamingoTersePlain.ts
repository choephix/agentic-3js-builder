import * as THREE from "three";

export const meta = {
  name: "Flamingo",
  description: "A stylized standing flamingo in a neutral rest pose, built from primitives with a pink palette, black wing tips and a bent beak.",
};

export default function buildFlamingo(): THREE.Object3D {
  const root = new THREE.Group();

  // Shared materials, one per colour
  const mats = {
    body: new THREE.MeshStandardMaterial({ color: 0xff8fb8, roughness: 0.6 }),
    wing: new THREE.MeshStandardMaterial({ color: 0xff5f8f, roughness: 0.6 }),
    legs: new THREE.MeshStandardMaterial({ color: 0xff6f9e, roughness: 0.5 }),
    beak: new THREE.MeshStandardMaterial({ color: 0xffb3cc, roughness: 0.5 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.2 }),
  };

  const UP = new THREE.Vector3(0, 1, 0);

  // Ellipsoid from a unit sphere
  function blob(
    center: [number, number, number],
    radii: [number, number, number],
    material: THREE.Material,
    rot: [number, number, number] = [0, 0, 0]
  ): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), material);
    m.position.set(...center);
    m.scale.set(...radii);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  }

  // Tapered cylinder between two points; rA at a, rB at b
  function limb(
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    material: THREE.Material,
    radial = 8
  ): THREE.Mesh {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(rB, rA, len, radial, 1);
    const m = new THREE.Mesh(geo, material);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    root.add(m);
    return m;
  }

  function joint(p: THREE.Vector3, r: number, material: THREE.Material): void {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), material);
    m.position.copy(p);
    root.add(m);
  }

  // ---- Body ----
  blob([0, 0.82, 0], [0.2, 0.18, 0.42], mats.body, [0.08, 0, 0]);

  // ---- Tail plumes ----
  limb(
    new THREE.Vector3(0, 0.88, -0.36),
    new THREE.Vector3(0, 1.0, -0.6),
    0.1,
    0.02,
    mats.body,
    7
  );

  // ---- Wings (folded, with dark tips) ----
  for (const s of [-1, 1]) {
    blob([s * 0.19, 0.86, -0.04], [0.08, 0.05, 0.3], mats.wing, [0, 0, s * 0.12]);
    blob([s * 0.19, 0.85, -0.3], [0.07, 0.035, 0.1], mats.black);
  }

  // ---- Neck (S-curve) ----
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.92, 0.3),
    new THREE.Vector3(0, 1.06, 0.38),
    new THREE.Vector3(0, 1.18, 0.3),
    new THREE.Vector3(0, 1.28, 0.34),
    new THREE.Vector3(0, 1.38, 0.42),
  ]);
  const neck = new THREE.Mesh(
    new THREE.TubeGeometry(neckCurve, 20, 0.04, 8, false),
    mats.body
  );
  root.add(neck);
  joint(new THREE.Vector3(0, 1.38, 0.42), 0.045, mats.body);

  // ---- Head ----
  blob([0, 1.4, 0.44], [0.085, 0.08, 0.11], mats.body);

  // Eyes
  for (const s of [-1, 1]) {
    blob([s * 0.07, 1.42, 0.47], [0.013, 0.013, 0.013], mats.eye);
  }

  // ---- Beak: thick at base, bent down, black tip ----
  const beakBase = new THREE.Vector3(0, 1.37, 0.5);
  const beakTip = new THREE.Vector3(0, 1.27, 0.67);
  const beakDir = new THREE.Vector3().subVectors(beakTip, beakBase);
  const beakMid = beakBase.clone().addScaledVector(beakDir, 0.6);
  limb(beakBase, beakMid, 0.035, 0.024, mats.beak, 8);
  limb(beakMid, beakTip, 0.024, 0.012, mats.black, 8);

  // ---- Legs (long, with a backward-bending ankle) ----
  for (const s of [-1, 1]) {
    const x = s * 0.08;
    const hip = new THREE.Vector3(x, 0.72, 0.02);
    const knee = new THREE.Vector3(x, 0.4, 0.02);
    const foot = new THREE.Vector3(x, 0.03, -0.04);

    limb(hip, knee, 0.03, 0.02, mats.legs, 8);
    joint(knee, 0.024, mats.legs);
    limb(knee, foot, 0.018, 0.011, mats.legs, 7);

    // Toes (three forward, webbing implied by flat boxes)
    const toeY = 0.006;
    for (const dx of [-0.022, 0, 0.022]) {
      const toe = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.012, 0.09),
        mats.legs
      );
      toe.position.set(x + dx, toeY + 0.006, foot.z + 0.035);
      toe.rotation.y = dx * 1.5;
      root.add(toe);
    }
  }

  return root;
}
