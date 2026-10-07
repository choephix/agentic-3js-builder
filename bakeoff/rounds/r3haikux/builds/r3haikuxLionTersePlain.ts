import * as THREE from "three";

export const meta = {
  name: "Lion",
  description:
    "A stylized adult male lion at rest: blocky primitive body and legs, a layered three-tone mane with spikes, amber eyes, brows and fangs, and a tufted tail.",
};

type V3 = [number, number, number];

// Seeded PRNG (mulberry32) so every build produces the same model.
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function createLion(): THREE.Object3D {
  const rand = makeRandom(1907);

  const mat = (color: number, roughness = 0.85) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const M = {
    fur: mat(0xc98a3c),
    belly: mat(0xe3bd7e),
    cream: mat(0xf4e4bd, 0.7),
    maneDark: mat(0x4a2611, 0.9),
    maneMid: mat(0x7d4219, 0.9),
    maneTip: mat(0xc27a33, 0.8),
    nose: mat(0x1d120c, 0.5),
    eye: mat(0xf5b82e, 0.25),
    pupil: mat(0x120a06, 0.4),
    tooth: mat(0xf6efdc, 0.4),
    earIn: mat(0x6a3a1c, 0.9),
  };

  const root = new THREE.Group();
  root.name = "lion";

  const sphereCache = new Map<number, THREE.SphereGeometry>();
  const sphere = (seg: number): THREE.SphereGeometry => {
    let g = sphereCache.get(seg);
    if (!g) {
      g = new THREE.SphereGeometry(1, seg, Math.max(5, Math.round(seg * 0.75)));
      sphereCache.set(seg, g);
    }
    return g;
  };

  // Ellipsoid: unit sphere scaled per axis.
  const ell = (
    parent: THREE.Object3D,
    c: V3,
    r: V3,
    m: THREE.Material,
    seg = 9,
    rot?: V3
  ) => {
    const mesh = new THREE.Mesh(sphere(seg), m);
    mesh.position.set(c[0], c[1], c[2]);
    mesh.scale.set(r[0], r[1], r[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    parent.add(mesh);
    return mesh;
  };

  // Tapered cylinder between two points (ra at a, rb at b).
  const strut = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    ra: number,
    rb: number,
    m: THREE.Material,
    seg = 8
  ) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.normalize());
    parent.add(mesh);
    return mesh;
  };

  // Cone whose base sits at `base` and whose apex points along `dir`.
  const cone = (
    parent: THREE.Object3D,
    base: V3,
    dir: V3,
    len: number,
    rad: number,
    m: THREE.Material,
    seg = 5
  ) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(rad, len, seg, 1), m);
    mesh.position.set(base[0], base[1], base[2]).addScaledVector(d, len / 2);
    mesh.quaternion.setFromUnitVectors(UP, d);
    parent.add(mesh);
    return mesh;
  };

  // ---------- torso ----------
  const torso = new THREE.Group();
  torso.name = "torso";
  root.add(torso);
  strut(torso, V(0, 0.84, -0.5), V(0, 0.84, 0.4), 0.25, 0.27, M.fur, 12);
  ell(torso, [0, 0.84, -0.5], [0.27, 0.27, 0.36], M.fur, 12); // haunch
  ell(torso, [0, 0.84, 0.36], [0.3, 0.27, 0.36], M.fur, 12); // deep chest
  ell(torso, [0, 0.66, 0.22], [0.2, 0.1, 0.42], M.belly, 10); // lighter underbelly

  // ---------- legs ----------
  const legs = new THREE.Group();
  legs.name = "legs";
  root.add(legs);
  for (const s of [-1, 1]) {
    // foreleg
    const x = s * 0.17;
    ell(legs, [x * 0.9, 0.74, 0.34], [0.14, 0.18, 0.16], M.fur, 10); // shoulder
    strut(legs, V(x, 0.78, 0.36), V(x, 0.42, 0.38), 0.1, 0.075, M.fur, 10);
    ell(legs, [x, 0.42, 0.38], [0.075, 0.075, 0.075], M.fur, 8); // elbow
    strut(legs, V(x, 0.42, 0.38), V(x, 0.13, 0.42), 0.075, 0.05, M.fur, 8);
    ell(legs, [x, 0.13, 0.42], [0.05, 0.05, 0.05], M.fur, 8); // wrist
    ell(legs, [x, 0.045, 0.51], [0.085, 0.05, 0.1], M.maneMid, 8); // paw
    for (const k of [-1, 0, 1]) {
      cone(legs, [x + k * 0.03, 0.03, 0.585], [0, -0.35, 1], 0.05, 0.011, M.tooth, 4);
    }

    // hindleg
    const hx = s * 0.18;
    ell(legs, [hx * 1.05, 0.74, -0.5], [0.15, 0.2, 0.22], M.fur, 10); // haunch muscle
    strut(legs, V(hx, 0.8, -0.5), V(hx, 0.44, -0.42), 0.12, 0.08, M.fur, 10);
    ell(legs, [hx, 0.44, -0.42], [0.08, 0.08, 0.08], M.fur, 8); // stifle
    strut(legs, V(hx, 0.44, -0.42), V(hx, 0.15, -0.6), 0.08, 0.05, M.fur, 8);
    ell(legs, [hx, 0.15, -0.6], [0.05, 0.05, 0.05], M.fur, 8); // hock
    ell(legs, [hx, 0.045, -0.52], [0.085, 0.05, 0.1], M.maneMid, 8); // paw
    for (const k of [-1, 0, 1]) {
      cone(legs, [hx + k * 0.03, 0.03, -0.43], [0, -0.35, 1], 0.05, 0.011, M.tooth, 4);
    }
  }

  // ---------- neck & head ----------
  ell(root, [0, 1.0, 0.5], [0.21, 0.2, 0.22], M.fur, 10); // neck
  ell(root, [0, 1.15, 0.72], [0.19, 0.18, 0.2], M.fur, 12); // skull
  ell(root, [0, 1.1, 0.88], [0.1, 0.085, 0.1], M.cream, 10); // muzzle
  ell(root, [0, 1.02, 0.85], [0.08, 0.045, 0.07], M.cream, 8); // chin
  ell(root, [0, 1.13, 0.975], [0.055, 0.04, 0.035], M.nose, 8); // nose
  ell(root, [0, 1.06, 0.98], [0.012, 0.05, 0.02], M.nose, 4); // philtrum line

  for (const s of [-1, 1]) {
    // cheek ruffs bulging out past the muzzle
    ell(root, [s * 0.115, 1.085, 0.84], [0.065, 0.06, 0.065], M.cream, 8);

    // eyes: amber orb, round pupil, heavy brow
    ell(root, [s * 0.09, 1.23, 0.86], [0.036, 0.036, 0.022], M.eye, 10);
    ell(root, [s * 0.09, 1.23, 0.88], [0.016, 0.016, 0.01], M.pupil, 6);
    ell(root, [s * 0.09, 1.275, 0.85], [0.065, 0.02, 0.03], M.maneDark, 8, [0, 0, s * 0.28]);

    // small round ears poking up through the mane
    ell(root, [s * 0.145, 1.33, 0.66], [0.05, 0.05, 0.026], M.fur, 8);
    ell(root, [s * 0.145, 1.33, 0.675], [0.03, 0.03, 0.012], M.earIn, 6);

    // fangs hanging from the upper jaw
    cone(root, [s * 0.035, 1.035, 0.93], [0, -1, 0], 0.045, 0.011, M.tooth, 4);
  }

  // mouth line
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.035), M.nose);
  mouth.position.set(0, 1.0, 0.94);
  root.add(mouth);

  // whisker dots, placed on the muzzle surface
  const muzzleFront = (x: number, y: number) =>
    0.88 + 0.1 * Math.sqrt(Math.max(0, 1 - (x / 0.1) ** 2 - ((y - 1.1) / 0.085) ** 2));
  for (const s of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = s * (0.04 + c * 0.025);
        const y = 1.12 - r * 0.035;
        ell(root, [x, y, muzzleFront(x, y) - 0.002], [0.007, 0.007, 0.007], M.nose, 5);
      }
    }
  }

  // ---------- mane: dark inner ring, mid outer ring, tip spikes ----------
  const mane = new THREE.Group();
  mane.name = "mane";
  root.add(mane);
  const cx = 0;
  const cy = 1.15;
  const cz = 0.58;

  // inner dark ring, hugging the skull
  for (let i = 0; i < 26; i++) {
    const th = (i / 26) * Math.PI * 2 + (rand() - 0.5) * 0.15;
    const r = 0.25 + rand() * 0.03;
    const lr = 0.085 + rand() * 0.02;
    ell(
      mane,
      [cx + Math.cos(th) * r, cy + Math.sin(th) * r, cz + (rand() - 0.5) * 0.05],
      [lr, lr * 1.1, lr * 0.9],
      M.maneDark,
      7,
      [0, 0, rand() * Math.PI]
    );
  }

  // outer mid ring
  for (let i = 0; i < 22; i++) {
    const th = (i / 22) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    const r = 0.33 + rand() * 0.02;
    const lr = 0.095 + rand() * 0.02;
    ell(
      mane,
      [cx + Math.cos(th) * r, cy + Math.sin(th) * r, 0.5 + (rand() - 0.5) * 0.04],
      [lr, lr * 1.05, lr * 0.85],
      M.maneMid,
      7,
      [0, 0, rand() * Math.PI]
    );
  }

  // light spikes between the outer lumps, swept back for a crown silhouette
  for (let i = 0; i < 22; i++) {
    const th = ((i + 0.5) / 22) * Math.PI * 2 + (rand() - 0.5) * 0.1;
    const ux = Math.cos(th);
    const uy = Math.sin(th);
    const base: V3 = [cx + ux * 0.36, cy + uy * 0.36, 0.5];
    cone(mane, base, [ux * 0.8, uy * 0.8, -0.45], 0.13 + rand() * 0.05, 0.028, M.maneTip, 5);
  }

  // mane draping down over the shoulders
  for (const s of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const x = s * (0.27 + t * 0.03) + (rand() - 0.5) * 0.03;
      const y = 1.13 - t * 0.23 + (rand() - 0.5) * 0.03;
      const z = 0.56 - t * 0.36 + (rand() - 0.5) * 0.04;
      const lr = 0.085 + rand() * 0.015;
      ell(mane, [x, y, z], [lr, lr * 1.1, lr], M.maneMid, 7, [0, 0, rand() * Math.PI]);
    }
  }

  // full back-of-neck crest
  ell(mane, [-0.1, 1.2, 0.4], [0.09, 0.09, 0.09], M.maneMid, 7);
  ell(mane, [0.1, 1.2, 0.4], [0.09, 0.09, 0.09], M.maneMid, 7);
  ell(mane, [0, 1.22, 0.34], [0.1, 0.09, 0.1], M.maneMid, 7);
  cone(mane, [0, 1.2, 0.42], [0.1, 1, -0.8], 0.14, 0.03, M.maneTip, 5);

  // ---------- tail: tapered curve with a dark tuft ----------
  const tail = new THREE.Group();
  tail.name = "tail";
  root.add(tail);
  const P0 = V(0, 0.92, -0.84);
  const P1 = V(0, 0.9, -1.12);
  const P2 = V(0, 0.55, -1.27);
  const P3 = V(0, 0.22, -1.2);
  const N = 8;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const u = 1 - t;
    pts.push(
      new THREE.Vector3()
        .addScaledVector(P0, u * u * u)
        .addScaledVector(P1, 3 * u * u * t)
        .addScaledVector(P2, 3 * u * t * t)
        .addScaledVector(P3, t * t * t)
    );
  }
  const tailRad = (i: number) => 0.05 - 0.022 * (i / N);
  for (let i = 0; i < N; i++) {
    strut(tail, pts[i], pts[i + 1], tailRad(i), tailRad(i + 1), M.fur, 7);
  }
  for (let i = 0; i <= N; i++) {
    const p = pts[i];
    const r = tailRad(i);
    ell(tail, [p.x, p.y, p.z], [r, r, r], M.fur, 7);
  }
  // dark tuft at the tip
  ell(tail, [0, 0.21, -1.2], [0.068, 0.1, 0.068], M.maneDark, 8);
  cone(tail, [0.03, 0.27, -1.2], [0.8, -0.2, 0], 0.07, 0.024, M.maneDark, 4);
  cone(tail, [-0.03, 0.27, -1.2], [-0.8, -0.2, 0], 0.07, 0.024, M.maneDark, 4);
  cone(tail, [0, 0.28, -1.22], [0, 0.4, -1], 0.07, 0.024, M.maneDark, 4);

  return root;
}
