```ts
import * as THREE from "three";

export const meta = {
  name: "Red panda on a mossy branch",
  description:
    "A delighted red panda perched on a moss-covered branch, holding up a bamboo shoot, its banded tail draped over the edge.",
};

type V3 = [number, number, number];

// Small seeded PRNG (mulberry32) so every build produces the same model.
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function redPanda(): THREE.Object3D {
  const rand = seededRandom(1907);
  const SCALE = 0.55; // design units (head ~1 unit high) -> metres

  // ---------- materials: one per colour ----------
  const mat = (color: number, roughness = 0.85) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true });

  const rustM = mat(0xa64b2a);
  const gingerM = mat(0xe07a34);
  const creamM = mat(0xf6e6c6);
  const whiteM = mat(0xfff8ee, 0.6);
  const blackM = mat(0x1c1715, 0.7);
  const tipM = mat(0x4a2f25);
  const tearM = mat(0xb23d26);
  const tongueM = mat(0xf08a95, 0.5);
  const mossM = mat(0x78b043, 1);
  const mossDarkM = mat(0x3f7f2f, 1);
  const barkM = mat(0x6e4c33, 0.95);
  const bambooM = mat(0xa8d870, 0.55);
  const sheathM = mat(0x9b7c45, 0.8);
  const leafM = mat(0x5ea63c, 0.6);

  // ---------- shared geometry ----------
  const SPH = new THREE.SphereGeometry(1, 14, 10);
  const SPH_S = new THREE.SphereGeometry(1, 8, 6);
  const ICO = new THREE.IcosahedronGeometry(1, 1);
  const UP = new THREE.Vector3(0, 1, 0);

  const put = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: V3,
    s: V3 = [1, 1, 1],
    r: V3 = [0, 0, 0],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    parent.add(mesh);
    return mesh;
  };

  // Capsule stretched between two points (limbs).
  const limb = (parent: THREE.Object3D, m: THREE.Material, a: V3, b: V3, rad: number) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(b[0], b[1], b[2]);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const core = Math.max(0.01, len - 2 * rad);
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(rad, core, 3, 6), m);
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  const world = new THREE.Group();
  world.scale.setScalar(SCALE);
  root.add(world);

  // ---------- branch, stump and moss ----------
  const branchRadius = (x: number) => 0.075 - 0.045 * ((x + 0.9) / 1.7);
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.03, 1.7, 9, 2), barkM);
  branch.rotation.z = Math.PI / 2; // thick end at -X, tapering towards +X
  branch.position.set(-0.05, 0.42, 0);
  world.add(branch);

  // Stump and flared roots
  put(world, new THREE.CylinderGeometry(0.12, 0.17, 0.44, 9, 1), barkM, [-0.97, 0.19, 0]);
  put(world, SPH_S, barkM, [-1.13, 0.005, 0.06], [0.1, 0.035, 0.07], [0, 0.4, 0]);
  put(world, SPH_S, barkM, [-0.82, 0.005, -0.12], [0.08, 0.035, 0.08], [0, -0.5, 0]);

  // Moss on stump and ground
  put(world, ICO, mossM, [-0.97, 0.0, 0.0], [0.27, 0.03, 0.23], [0, 0.6, 0]);
  put(world, ICO, mossDarkM, [-0.72, 0.0, 0.2], [0.1, 0.022, 0.08], [0, 1.2, 0]);
  put(world, ICO, mossM, [-1.22, 0.0, -0.1], [0.09, 0.022, 0.08], [0, 0.3, 0]);
  put(world, ICO, mossM, [-0.98, 0.41, 0.0], [0.15, 0.045, 0.13], [0, 0.4, 0]);
  put(world, ICO, mossDarkM, [-0.86, 0.33, 0.1], [0.06, 0.06, 0.05]);

  // Moss clumps along the top of the branch
  for (const x of [-0.8, -0.56, -0.34, 0.3, 0.52, 0.7]) {
    const top = 0.42 + branchRadius(x);
    put(
      world,
      ICO,
      rand() < 0.5 ? mossM : mossDarkM,
      [x, top - 0.006, (rand() - 0.5) * 0.05],
      [0.085 + rand() * 0.05, 0.03 + rand() * 0.012, 0.065 + rand() * 0.03],
      [0, rand() * Math.PI, 0],
    );
  }
  // Moss flanks
  for (const x of [-0.66, 0.1, 0.44]) {
    const rr = branchRadius(x) * 0.8;
    put(
      world,
      ICO,
      mossM,
      [x, 0.42, rand() < 0.5 ? rr : -rr],
      [0.06, 0.04, 0.05],
      [rand(), rand(), rand()],
    );
  }

  // ---------- panda ----------
  const panda = new THREE.Group();
  world.add(panda);

  // Torso: rusty back, black belly
  put(panda, SPH, rustM, [0, 0.7, -0.01], [0.2, 0.22, 0.18], [0.12, 0, 0]);
  put(panda, SPH, blackM, [0, 0.66, 0.085], [0.15, 0.17, 0.12], [0.12, 0, 0]);

  // Small fur tufts on the back
  const tufts: V3[] = [
    [-0.07, 0.88, -0.14],
    [0.0, 0.91, -0.15],
    [0.07, 0.88, -0.14],
  ];
  for (const [x, y, z] of tufts) {
    put(panda, new THREE.ConeGeometry(0.035, 0.09, 5), rustM, [x, y, z], [1, 1, 1], [-0.6, 0, 0]);
  }

  // Black haunches and hind feet resting on the branch
  for (const s of [-1, 1]) {
    put(panda, SPH, blackM, [s * 0.12, 0.57, 0], [0.1, 0.095, 0.11]);
    put(panda, SPH, blackM, [s * 0.12, 0.475, 0.04], [0.065, 0.03, 0.085]);
  }

  // Raised arm (model's left, +X) holding the bamboo shoot
  limb(panda, blackM, [0.15, 0.78, 0.05], [0.27, 0.7, 0.08], 0.04);
  limb(panda, blackM, [0.27, 0.7, 0.08], [0.17, 0.88, 0.22], 0.036);
  put(panda, SPH_S, blackM, [0.17, 0.88, 0.22], [0.045, 0.045, 0.05]);

  // Relaxed arm (model's right, -X) resting on the knee
  limb(panda, blackM, [-0.15, 0.78, 0.05], [-0.24, 0.7, 0.1], 0.04);
  limb(panda, blackM, [-0.24, 0.7, 0.1], [-0.13, 0.56, 0.17], 0.036);
  put(panda, SPH_S, blackM, [-0.13, 0.56, 0.17], [0.045, 0.04, 0.05]);

  // Head (rust cap, round white face mask), with a cheerful tilt
  const head = new THREE.Group();
  head.position.set(0, 1.0, 0);
  head.rotation.z = 0.06;
  panda.add(head);
  put(head, SPH, rustM, [0, 0, 0], [0.13, 0.13, 0.13]);
  put(head, SPH, whiteM, [0, -0.025, 0.09], [0.115, 0.1, 0.085]);

  // White cheek fluff
  for (const s of [-1, 1]) {
    put(
      head,
      new THREE.ConeGeometry(0.03, 0.07, 5),
      whiteM,
      [s * 0.115, -0.04, 0.02],
      [1, 1, 1],
      [0, 0, -s * Math.PI / 2],
    );
  }

  // Happy closed eyes: upward arcs
  const eyeGeo = new THREE.TorusGeometry(0.03, 0.011, 6, 14, Math.PI);
  for (const s of [-1, 1]) put(head, eyeGeo, blackM, [s * 0.05, 0, 0.172]);

  // Red tear marks running down from the eyes
  const tearGeo = new THREE.CapsuleGeometry(0.011, 0.065, 3, 5);
  for (const s of [-1, 1]) {
    put(head, tearGeo, tearM, [s * 0.075, -0.042, 0.15], [1, 1, 1], [0, 0, s * 0.23]);
  }

  // Little black nose, open smiling mouth, tongue
  put(head, SPH_S, blackM, [0, 0, 0.17], [0.026, 0.02, 0.022]);
  put(head, SPH_S, blackM, [0, -0.05, 0.165], [0.032, 0.02, 0.012]);
  put(head, SPH_S, tongueM, [0, -0.058, 0.172], [0.015, 0.009, 0.008]);

  // Pointed ears with white rims
  const earGeo = new THREE.ConeGeometry(0.055, 0.12, 6, 1);
  const rimGeo = new THREE.TorusGeometry(0.046, 0.013, 5, 10);
  for (const s of [-1, 1]) {
    const ear = put(head, earGeo, rustM, [s * 0.085, 0.13, -0.01], [1, 1, 1], [0.1, 0, -s * 0.35]);
    put(ear, rimGeo, whiteM, [0, -0.04, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  }

  // Bamboo shoot held up in the raised paw
  const shoot = new THREE.Group();
  shoot.position.set(0.2, 0.95, 0.25);
  shoot.rotation.set(0.08, 0, -0.1);
  world.add(shoot);
  put(shoot, new THREE.CylinderGeometry(0.012, 0.032, 0.42, 7, 1), bambooM, [0, 0, 0]);
  for (const y of [-0.15, -0.07, 0.01, 0.09]) {
    const rb = 0.032 - 0.02 * ((y + 0.21) / 0.42);
    put(shoot, new THREE.CylinderGeometry(rb + 0.007, rb + 0.007, 0.034, 7, 1), sheathM, [0, y, 0]);
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    const tilt = 0.5 + rand() * 0.2;
    const axis = new THREE.Vector3(
      Math.sin(a) * Math.sin(tilt),
      Math.cos(tilt),
      Math.cos(a) * Math.sin(tilt),
    ).normalize();
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.004), leafM);
    leaf.quaternion.setFromUnitVectors(UP, axis);
    leaf.position.copy(axis).multiplyScalar(0.075);
    leaf.position.y += 0.21;
    shoot.add(leaf);
  }

  // ---------- tail: banded, fluffy, draping off the branch ----------
  const tailPts: V3[] = [
    [0.02, 0.6, -0.15],
    [0.16, 0.56, -0.32],
    [0.33, 0.45, -0.38],
    [0.44, 0.31, -0.3],
    [0.47, 0.17, -0.12],
    [0.44, 0.09, 0.05],
    [0.36, 0.14, 0.15],
  ];
  const tailCurve = new THREE.CatmullRomCurve3(
    tailPts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
  );
  const SEG = 22;
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG;
    const p = tailCurve.getPointAt(u);
    const t = tailCurve.getTangentAt(u).normalize();
    const r = 0.022 + 0.07 * Math.sin(Math.PI * (0.12 + 0.8 * u));

    let m: THREE.Material;
    if (u > 0.92) m = tipM;
    else if (u < 0.12) m = rustM;
    else m = Math.floor((u - 0.12) / 0.1) % 2 === 0 ? gingerM : creamM;

    const seg = new THREE.Mesh(ICO, m);
    seg.position.copy(p);
    seg.quaternion.setFromUnitVectors(UP, t);
    seg.scale.set(r, r * 0.85, r);
    world.add(seg);

    // Fluffy tufts around each puff
    const side = new THREE.Vector3().crossVectors(t, UP);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize();
    const upv = new THREE.Vector3().crossVectors(side, t).normalize();
    for (let k = 0; k < 2; k++) {
      const a = rand() * Math.PI * 2;
      const d = r * (0.6 + rand() * 0.25);
      const f = new THREE.Mesh(ICO, m);
      f.position
        .copy(p)
        .addScaledVector(side, Math.cos(a) * d)
        .addScaledVector(upv, Math.sin(a) * d);
      f.quaternion.copy(seg.quaternion);
      f.scale.set(r * 0.5, r * 0.6, r * 0.5);
      world.add(f);
    }
  }

  // ---------- ground the model and centre it on x = 0 ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root, true);
  world.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, 0);

  return root;
}
```