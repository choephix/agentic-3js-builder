```ts
import * as THREE from "three";

export const meta = {
  name: "Proud Old Lion",
  description:
    "A resting, elder lion with head held high. Golden-blond face framed by a shaggy mane that darkens to chocolate at the edges, amber eyes, a scarred brow and a dark-tufted tail.",
};

// Seeded generator so every run builds the same model.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildLion(): THREE.Object3D {
  const rand = rng(1907);
  const root = new THREE.Group();

  // One material per colour, shared across meshes.
  const matCache = new Map<number, THREE.MeshStandardMaterial>();
  const M = (hex: number, rough = 0.85) => {
    const key = hex * 10 + Math.round(rough * 10);
    let m = matCache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough });
      matCache.set(key, m);
    }
    return m;
  };

  const TAWNY = 0xc08a45;
  const TAWNY_DARK = 0x9a6a32;
  const CREAM = 0xf2deb4;
  const BLACK = 0x161110;
  const AMBER = 0xe9a13a;
  const TUFT_DARK = 0x3a2414;
  const SCAR = 0x7a3327;
  const BROW = 0x8a5a2c;

  // Mane gradient: golden blond (face) -> dark chocolate (edges).
  const BLOND = new THREE.Color(0xecc76f);
  const CHOC = new THREE.Color(0x4a2914);
  const maneSteps = 6;
  const maneMats: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < maneSteps; i++) {
    const c = new THREE.Color().lerpColors(BLOND, CHOC, i / (maneSteps - 1));
    maneMats.push(
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })
    );
  }

  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const coneGeo = new THREE.ConeGeometry(0.07, 0.24, 5);

  function add(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0]
  ) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    parent.add(m);
    return m;
  }

  const ell = (
    parent: THREE.Object3D,
    hex: number,
    pos: [number, number, number],
    scale: [number, number, number],
    rough = 0.85
  ) => add(parent, sphere, M(hex, rough), pos, scale);

  // ---------- Body ----------
  const body = new THREE.Group();
  root.add(body);

  // Chest and back, raised sphinx-style.
  ell(body, TAWNY, [0, 0.72, 0.1], [0.36, 0.33, 0.75]);
  // Pale cream belly underside.
  ell(body, CREAM, [0, 0.46, 0.15], [0.3, 0.12, 0.6]);
  // Cream chest bib.
  ell(body, CREAM, [0, 0.86, 0.72], [0.2, 0.22, 0.2]);

  // Haunch, folded.
  ell(body, TAWNY, [0, 0.5, -0.5], [0.36, 0.38, 0.36]);

  // Forelegs: straight, planted.
  const cylForeleg = new THREE.CylinderGeometry(0.09, 0.065, 0.6, 10);
  for (const x of [-0.14, 0.14]) {
    add(body, cylForeleg, M(TAWNY_DARK), [x, 0.32, 0.55]);
    // Big padded paw.
    ell(body, TAWNY_DARK, [x, 0.06, 0.62], [0.1, 0.06, 0.12]);
    // Toe pad.
    ell(body, TUFT_DARK, [x, 0.04, 0.7], [0.04, 0.02, 0.03], 0.6);
  }

  // Hind legs: folded hocks lying forward along the ground.
  const cylHind = new THREE.CylinderGeometry(0.07, 0.1, 0.55, 10);
  for (const x of [-0.19, 0.19]) {
    add(body, cylHind, M(TAWNY_DARK), [x, 0.12, -0.3], [1, 1, 1], [Math.PI / 2, 0, 0]);
    ell(body, TAWNY_DARK, [x, 0.07, 0.02], [0.11, 0.07, 0.13]);
    ell(body, TUFT_DARK, [x, 0.05, 0.09], [0.04, 0.02, 0.03], 0.6);
  }

  // ---------- Neck & head ----------
  const headC = new THREE.Vector3(0, 1.24, 0.86);
  const neckA = new THREE.Vector3(0, 0.92, 0.55);
  const neckDir = new THREE.Vector3().subVectors(headC, neckA);
  const neckLen = neckDir.length();
  const neck = add(
    body,
    new THREE.CylinderGeometry(0.15, 0.19, neckLen, 12),
    M(TAWNY),
    [
      (neckA.x + headC.x) / 2,
      (neckA.y + headC.y) / 2,
      (neckA.z + headC.z) / 2,
    ]
  );
  neck.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    neckDir.clone().normalize()
  );

  const head = new THREE.Group();
  root.add(head);

  // Skull.
  ell(head, TAWNY, [headC.x, headC.y, headC.z], [0.19, 0.19, 0.2]);

  // Muzzle, cream.
  ell(head, CREAM, [0, 1.16, 1.0], [0.12, 0.1, 0.14]);
  // Chin.
  ell(head, CREAM, [0, 1.07, 1.02], [0.08, 0.05, 0.08]);

  // Broad black nose.
  ell(head, BLACK, [0, 1.2, 1.16], [0.075, 0.05, 0.04], 0.5);

  // Mouth line.
  add(head, new THREE.BoxGeometry(1, 1, 1), M(BLACK), [0, 1.105, 1.11], [0.1, 0.01, 0.02]);

  // Brow ridges.
  for (const x of [-0.1, 0.1]) {
    add(head, new THREE.BoxGeometry(1, 1, 1), M(BROW), [x, 1.315, 1.02], [0.11, 0.03, 0.05]);
  }

  // Scar across the lion's left brow (+X side).
  add(
    head,
    new THREE.BoxGeometry(1, 1, 1),
    M(SCAR, 0.6),
    [0.1, 1.335, 1.035],
    [0.1, 0.012, 0.03],
    [0, 0, -0.5]
  );

  // Amber eyes with black pupils.
  for (const x of [-0.09, 0.09]) {
    ell(head, AMBER, [x, 1.27, 1.05], [0.035, 0.025, 0.02], 0.3);
    ell(head, BLACK, [x, 1.27, 1.065], [0.014, 0.02, 0.01], 0.3);
  }

  // Small rounded ears, partly tucked into the mane.
  for (const x of [-0.13, 0.13]) {
    ell(head, TAWNY_DARK, [x, 1.4, 0.8], [0.06, 0.06, 0.04]);
    ell(head, TUFT_DARK, [x, 1.4, 0.82], [0.03, 0.03, 0.02], 0.7);
  }

  // ---------- Mane ----------
  // Solid base under the tufts, framing the cheeks.
  ell(head, 0xd9a85a, [0, headC.y, headC.z - 0.1], [0.27, 0.27, 0.22], 0.9);

  const up = new THREE.Vector3(0, 1, 0);
  const tuftCount = 120;
  for (let i = 0; i < tuftCount; i++) {
    // Random direction on the sphere, skipping the front of the face.
    const z = -1 + rand() * 1.5; // -1 .. 0.5
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    const dir = new THREE.Vector3(s * Math.cos(phi), s * Math.sin(phi), z);
    if (dir.y < -0.5) continue; // keep the chin clear

    const r = 0.2 + rand() * 0.14;
    // Inner tufts stay blond, outer tufts darken to chocolate.
    const t = Math.min(1, Math.max(0, (r - 0.2) / 0.14 + (rand() - 0.5) * 0.25));
    const idx = Math.round(t * (maneSteps - 1));

    const pos = headC.clone().addScaledVector(dir, r);
    const tuft = new THREE.Mesh(coneGeo, maneMats[idx]);
    tuft.position.copy(pos);
    tuft.quaternion.setFromUnitVectors(up, dir);
    tuft.scale.setScalar(0.8 + rand() * 0.5);
    head.add(tuft);
  }

  // ---------- Tail ----------
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.6, -0.95),
    new THREE.Vector3(0, 0.42, -1.2),
    new THREE.Vector3(0.12, 0.22, -1.38),
    new THREE.Vector3(0.35, 0.1, -1.45),
    new THREE.Vector3(0.55, 0.08, -1.4),
  ]);
  const tailMesh = new THREE.Mesh(
    new THREE.TubeGeometry(tailCurve, 24, 0.045, 8, false),
    M(TAWNY_DARK)
  );
  root.add(tailMesh);

  // Dark tuft at the tail tip.
  const tip = tailCurve.getPoint(1);
  const tipDir = tailCurve.getTangent(1).normalize();
  const tuftTip = add(
    root,
    new THREE.ConeGeometry(0.09, 0.22, 7),
    M(TUFT_DARK),
    [tip.x, tip.y, tip.z]
  );
  tuftTip.quaternion.setFromUnitVectors(up, tipDir);
  ell(root, TUFT_DARK, [tip.x - tipDir.x * 0.08, tip.y, tip.z - tipDir.z * 0.08], [0.08, 0.08, 0.08], 0.95);

  return root;
}
```