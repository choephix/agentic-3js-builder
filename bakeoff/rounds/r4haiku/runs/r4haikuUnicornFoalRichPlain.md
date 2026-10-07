```ts
import * as THREE from "three";

export const meta = {
  name: "Newborn Unicorn Foal",
  description:
    "A wobbly-legged newborn unicorn foal with a pearly lilac-shimmer coat, pastel pink, mint and lavender puff mane and tail, a small gold spiral horn, big lashed eyes, silver hooves and a daisy chain around its neck.",
};

type V3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);

// Small seeded PRNG so every run builds the same foal.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createUnicornFoal(): THREE.Object3D {
  const rand = mulberry32(90210);
  const range = (a: number, b: number) => a + (b - a) * rand();

  const std = (color: number, p: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, ...p });

  // ---------- one material per colour ----------
  const M = {
    coat: std(0xf7f3fc, { roughness: 0.42, metalness: 0.05, emissive: 0x2a1c44, emissiveIntensity: 0.18 }),
    sheen: std(0xdcc8ff, {
      roughness: 0.25,
      metalness: 0.25,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      emissive: 0x6a4fa8,
      emissiveIntensity: 0.25,
    }),
    sock: std(0xe9dcff, { roughness: 0.4, emissive: 0x1e1433, emissiveIntensity: 0.15 }),
    muzzle: std(0xffbfd3, { roughness: 0.55 }),
    pink: std(0xff9fc8, { roughness: 0.7 }),
    mint: std(0x9ff5d6, { roughness: 0.7 }),
    lavender: std(0xc7a6ff, { roughness: 0.7 }),
    eye: std(0x1c1426, { roughness: 0.2 }),
    shine: std(0xffffff, { roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.8 }),
    lash: std(0x231a2e, { roughness: 0.6 }),
    hoof: std(0xd3dae8, { roughness: 0.22, metalness: 0.9 }),
    horn: std(0xf2bf4a, { roughness: 0.28, metalness: 0.75 }),
    ridge: std(0xfff1b5, { roughness: 0.25, metalness: 0.6 }),
    stem: std(0x8ad9a6, { roughness: 0.6 }),
    leaf: std(0x6fcf8f, { roughness: 0.6 }),
    petal: std(0xfffdfb, { roughness: 0.5 }),
    center: std(0xffd65c, { roughness: 0.4, emissive: 0x3a2a00, emissiveIntensity: 0.3 }),
    spark: std(0xfff4d0, { roughness: 0.2, emissive: 0xffe6a0, emissiveIntensity: 1.2 }),
  };
  const hairs = [M.pink, M.mint, M.lavender];

  // ---------- helpers ----------
  const blob = (parent: THREE.Object3D, m: THREE.Material, p: V3, s: V3, seg = 10, rings = 7) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg, rings), m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    parent.add(mesh);
    return mesh;
  };

  const puff = (parent: THREE.Object3D, m: THREE.Material, p: V3, r: number, sy = 1) =>
    blob(parent, m, p, [r, r * sy, r], 8, 6);

  // Cylinder from a (radius rA) to b (radius rB).
  const beam = (parent: THREE.Object3D, m: THREE.Material, a: V3, b: V3, rA: number, rB: number, seg = 8) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(b[0], b[1], b[2]);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg, 1), m);
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(mesh);
    return mesh;
  };

  // Cone standing on base point, pointing along dir.
  const cone = (parent: THREE.Object3D, m: THREE.Material, base: V3, dir: THREE.Vector3, r: number, len: number, seg = 8) => {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, len, seg), m);
    mesh.position.set(base[0], base[1], base[2]).addScaledVector(dir, len / 2);
    mesh.quaternion.setFromUnitVectors(UP, dir);
    parent.add(mesh);
    return mesh;
  };

  const root = new THREE.Group();
  root.name = "unicorn-foal";

  // ---------- torso ----------
  blob(root, M.coat, [0, 0.6, 0.12], [0.135, 0.15, 0.19], 12, 9); // chest
  blob(root, M.coat, [0, 0.58, -0.02], [0.14, 0.14, 0.2], 12, 9); // barrel
  blob(root, M.coat, [0, 0.6, -0.17], [0.125, 0.14, 0.15], 12, 9); // rump
  blob(root, M.coat, [0, 0.5, 0.02], [0.115, 0.07, 0.2], 10, 6); // belly
  // soft lilac shimmer shells over chest and barrel
  blob(root, M.sheen, [0, 0.58, -0.02], [0.144, 0.144, 0.206], 12, 9);
  blob(root, M.sheen, [0, 0.6, 0.12], [0.139, 0.155, 0.196], 12, 9);

  // ---------- wobbly long legs ----------
  const makeLeg = (x: number, z: number) => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.5, z);
    hip.rotation.set(range(-0.06, 0.06), 0, Math.sign(x) * range(0.05, 0.1));
    root.add(hip);

    blob(hip, M.coat, [0, 0.01, 0], [0.04, 0.045, 0.04], 8, 6); // hip / shoulder joint
    beam(hip, M.coat, [0, 0, 0], [0, -0.2, 0], 0.036, 0.026, 8); // thigh / forearm

    const knee = new THREE.Group();
    knee.position.set(0, -0.21, 0);
    knee.rotation.set(range(-0.16, 0.16), 0, range(-0.08, 0.08));
    hip.add(knee);

    blob(knee, M.coat, [0, 0, 0], [0.03, 0.03, 0.03], 8, 6); // knee
    beam(knee, M.sock, [0, -0.01, 0], [0, -0.2, 0], 0.02, 0.026, 8); // cannon
    blob(knee, M.sock, [0, -0.2, 0], [0.023, 0.024, 0.023], 8, 6); // fetlock
    beam(knee, M.hoof, [0, -0.19, 0], [0, -0.255, 0], 0.026, 0.031, 8); // silver hoof
  };
  makeLeg(0.085, 0.2);
  makeLeg(-0.085, 0.2);
  makeLeg(0.085, -0.2);
  makeLeg(-0.085, -0.2);

  // ---------- neck ----------
  const NA: V3 = [0, 0.6, 0.14];
  const NB: V3 = [0, 0.83, 0.37];
  beam(root, M.coat, NA, NB, 0.085, 0.055, 9);

  const vA = new THREE.Vector3(NA[0], NA[1], NA[2]);
  const vB = new THREE.Vector3(NB[0], NB[1], NB[2]);
  const dAxis = vB.clone().sub(vA).normalize(); // neck direction
  const mid = vA.clone().add(vB).multiplyScalar(0.5);
  // dorsal (top / back) side of the neck, perpendicular to the axis
  const dorsal = new THREE.Vector3(0, dAxis.z, -dAxis.y).normalize();

  // ---------- neck mane: short fluffy puffs along the crest ----------
  for (let i = 0; i < 10; i++) {
    const s = -0.16 + i * (0.32 / 9);
    const rN = 0.07 - 0.0923 * s; // neck radius at this point
    const c = mid.clone().addScaledVector(dAxis, s).addScaledVector(dorsal, rN * 0.9);
    puff(root, hairs[i % 3], [c.x, c.y, c.z], range(0.026, 0.034), 0.9);
    for (const sd of [1, -1]) {
      const c2 = mid
        .clone()
        .addScaledVector(dAxis, s)
        .addScaledVector(dorsal, rN * 0.5)
        .add(new THREE.Vector3(sd * rN * 0.85, 0, 0));
      puff(root, hairs[(i + (sd > 0 ? 1 : 2)) % 3], [c2.x, c2.y, c2.z], range(0.02, 0.026));
    }
  }

  // ---------- head ----------
  const head = new THREE.Group();
  head.position.set(0, 0.84, 0.4);
  head.rotation.x = -0.12;
  root.add(head);

  blob(head, M.coat, [0, 0.02, -0.02], [0.065, 0.068, 0.07], 12, 9); // cranium
  blob(head, M.coat, [0, -0.022, 0.07], [0.042, 0.036, 0.07], 10, 7); // muzzle
  blob(head, M.coat, [0, -0.058, 0.02], [0.03, 0.018, 0.06], 8, 5); // jaw
  blob(head, M.muzzle, [0, -0.02, 0.136], [0.032, 0.028, 0.02], 10, 6); // soft pink nose
  for (const s of [1, -1]) {
    blob(head, M.coat, [s * 0.05, -0.02, 0.03], [0.03, 0.03, 0.035], 8, 6); // cheeks
    blob(head, M.eye, [s * 0.013, -0.012, 0.148], [0.0055, 0.0045, 0.004], 6, 4); // nostrils
    blob(head, M.lavender, [s * 0.05, 0.046, 0.01], [0.024, 0.009, 0.022], 8, 4); // lilac lid shade
  }

  // ears: outer ear + pink inner ear pushed forward
  for (const s of [1, -1]) {
    const base: V3 = [s * 0.04, 0.07, -0.035];
    const d = new THREE.Vector3(s * 0.35, 0.85, -0.45).normalize();
    cone(head, M.coat, base, d, 0.022, 0.085, 7);
    cone(head, M.pink, [base[0], base[1] + 0.002, base[2] + 0.009], d, 0.011, 0.06, 6);
  }

  // short fluffy head mane / forelock
  puff(head, hairs[0], [0.0, 0.09, -0.03], 0.024);
  puff(head, hairs[1], [0.02, 0.084, -0.055], 0.021);
  puff(head, hairs[2], [-0.02, 0.084, -0.055], 0.021);
  puff(head, hairs[1], [0.0, 0.085, -0.082], 0.022);
  puff(head, hairs[2], [0.022, 0.082, 0.02], 0.016);
  puff(head, hairs[0], [-0.022, 0.082, 0.02], 0.016);

  // ---------- spiralled gold horn ----------
  const hornBase = new THREE.Vector3(0, 0.06, 0.035);
  const hornDir = new THREE.Vector3(0, 0.7, 0.72).normalize();
  const hornLen = 0.14;
  const hornMesh = new THREE.Mesh(new THREE.ConeGeometry(0.021, hornLen, 12, 1), M.horn);
  hornMesh.position.copy(hornBase).addScaledVector(hornDir, hornLen / 2);
  hornMesh.quaternion.setFromUnitVectors(UP, hornDir);
  head.add(hornMesh);

  const hu = new THREE.Vector3().crossVectors(hornDir, XAxis()).normalize();
  const hv = new THREE.Vector3().crossVectors(hornDir, hu).normalize();
  const spiralPts: THREE.Vector3[] = [];
  const turns = 2.6;
  const SN = 48;
  for (let i = 0; i <= SN; i++) {
    const t = 0.06 + 0.86 * (i / SN);
    const ang = t * turns * Math.PI * 2;
    const rad = 0.021 * (1 - t) + 0.0005;
    const p = hornBase
      .clone()
      .addScaledVector(hornDir, hornLen * t)
      .addScaledVector(hu, Math.cos(ang) * rad)
      .addScaledVector(hv, Math.sin(ang) * rad);
    spiralPts.push(p);
  }
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts);
  head.add(new THREE.Mesh(new THREE.TubeGeometry(spiralCurve, 90, 0.0034, 6, false), M.ridge));

  // ---------- big lashed eyes ----------
  for (const s of [1, -1]) {
    const E: V3 = [s * 0.058, 0.03, 0.006];
    blob(head, M.eye, E, [0.026, 0.026, 0.026], 12, 9);
    blob(head, M.shine, [E[0] + s * 0.011, E[1] + 0.011, E[2] + 0.02], [0.0085, 0.0085, 0.0085], 8, 6);
    blob(head, M.shine, [E[0] - s * 0.008, E[1] - 0.01, E[2] + 0.022], [0.0035, 0.0035, 0.0035], 6, 4);

    for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
      const base = new THREE.Vector3(E[0] + s * 0.0163, E[1] + 0.02 * Math.cos(a), E[2] + 0.02 * Math.sin(a));
      const len = 0.02 + 0.006 * Math.cos(a);
      const dir = new THREE.Vector3(s * 0.5, Math.cos(a) * 0.8 + 0.25, Math.sin(a) * 0.5).normalize();
      const geo = new THREE.BoxGeometry(0.0034, len, 0.0034);
      geo.translate(0, len / 2, 0);
      const lash = new THREE.Mesh(geo, M.lash);
      lash.position.copy(base);
      lash.quaternion.setFromUnitVectors(UP, dir);
      head.add(lash);
    }
  }

  // ---------- fluffy tail ----------
  const tailPts: Array<[V3, number]> = [
    [[0, 0.6, -0.33], 0.034],
    [[0, 0.55, -0.36], 0.04],
    [[0, 0.47, -0.375], 0.042],
    [[0, 0.39, -0.365], 0.04],
    [[0, 0.32, -0.345], 0.034],
    [[0, 0.27, -0.32], 0.026],
  ];
  tailPts.forEach(([p, r], i) => {
    const jitter = range(-0.008, 0.008);
    puff(root, hairs[i % 3], [p[0] + jitter, p[1], p[2]], r, 1.15);
    if (i > 0 && i < 5) {
      const side = i % 2 ? 0.022 : -0.022;
      puff(root, hairs[(i + 1) % 3], [p[0] + side, p[1], p[2] + 0.01], r * 0.7);
    }
  });

  // ---------- daisy chain around the neck ----------
  const chainR = 0.078;
  const chainCenter = mid.clone().addScaledVector(dAxis, 0.05);
  const chain = new THREE.Group();
  chain.position.copy(chainCenter);
  chain.quaternion.setFromUnitVectors(FWD, dAxis);
  root.add(chain);

  chain.add(new THREE.Mesh(new THREE.TorusGeometry(chainR, 0.0055, 6, 48), M.stem));

  const NF = 7;
  for (let i = 0; i < NF; i++) {
    const t = i * ((Math.PI * 2) / NF);
    const out = new THREE.Vector3(Math.cos(t), Math.sin(t), 0);

    const flower = new THREE.Group();
    flower.position.set(out.x * chainR, out.y * chainR, 0);
    flower.quaternion.setFromUnitVectors(FWD, out);
    chain.add(flower);

    for (let k = 0; k < 6; k++) {
      const petal = new THREE.Group();
      petal.rotation.z = (k * Math.PI) / 3;
      blob(petal, M.petal, [0, 0.0165, 0], [0.0085, 0.0145, 0.0022], 8, 5);
      flower.add(petal);
    }
    blob(flower, M.center, [0, 0, 0.002], [0.0085, 0.0085, 0.0045], 8, 6);

    // a leaf between each pair of flowers
    const lt = (i + 0.5) * ((Math.PI * 2) / NF);
    const tan = new THREE.Vector3(-Math.sin(lt), Math.cos(lt), 0);
    const leaf = blob(chain, M.leaf, [chainR * Math.cos(lt), chainR * Math.sin(lt), 0], [0.0055, 0.0017, 0.014], 6, 4);
    leaf.quaternion.setFromUnitVectors(FWD, tan);
  }

  // ---------- shimmer glints on the coat ----------
  const sparkGeo = new THREE.OctahedronGeometry(0.0085, 0);
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const ux = side * range(0.6, 0.95);
    const uy = range(-0.1, 0.5);
    const uz = range(-0.7, 0.7);
    const n = Math.hypot(ux, uy, uz);
    const isChest = i % 3 === 0;
    const c = isChest ? [0, 0.6, 0.12] : [0, 0.58, -0.02];
    const rad = isChest ? [0.135, 0.15, 0.19] : [0.14, 0.14, 0.2];
    const k = 1.05;
    const sp = new THREE.Mesh(sparkGeo, M.spark);
    sp.position.set(
      c[0] + (ux / n) * rad[0] * k,
      c[1] + (uy / n) * rad[1] * k,
      c[2] + (uz / n) * rad[2] * k
    );
    sp.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    sp.scale.setScalar(range(0.7, 1.3));
    root.add(sp);
  }

  // ---------- stand on the floor ----------
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;

  return root;
}

function XAxis(): THREE.Vector3 {
  return new THREE.Vector3(1, 0, 0);
}
```