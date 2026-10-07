```ts
import * as THREE from "three";

export const meta = {
  name: "Proud Old Lion",
  description:
    "A resting old lion with his head held high: a shaggy mane fading from golden blond at the face to dark chocolate at its edges, amber eyes, a scarred brow and a dark-tufted tail.",
};

type V3 = [number, number, number];

// Small seeded generator so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UP = new THREE.Vector3(0, 1, 0);

export default function buildLion(): THREE.Object3D {
  const rng = mulberry32(90317);

  // ---------- materials: one per colour, shared ----------
  const fur = (color: string, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0,
      flatShading: true,
      ...o,
    });

  const M = {
    tawny: fur("#c48a4f"),
    limb: fur("#a8703b"),
    tawnyDark: fur("#8f5b2c"),
    paw: fur("#7a4f2b"),
    cream: fur("#f2e2c0"),
    pad: fur("#2a1b12"),
    nose: fur("#17110f", { roughness: 0.45 }),
    amber: fur("#f2a516", { emissive: "#7a4204", emissiveIntensity: 0.35, roughness: 0.3 }),
    pupil: fur("#120b07", { roughness: 0.3 }),
    scar: fur("#a25f55", { roughness: 0.6 }),
    // mane gradient: golden blond at the face -> dark chocolate at the edges
    mane: [
      fur("#f5d07c"),
      fur("#e3aa5c"),
      fur("#bb7b40"),
      fur("#825129"),
      fur("#4b2d1b"),
    ],
  };

  // ---------- helpers ----------
  const blob = (parent: THREE.Object3D, p: V3, s: V3, mat: THREE.Material, w = 12, h = 9) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, w, h), mat);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    parent.add(m);
    return m;
  };

  // tapered cylinder from a (radius rA) to b (radius rB)
  const limb = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    mat: THREE.Material
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, dir.length(), 7, 1), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    parent.add(m);
    return m;
  };

  // unit cone with its base at the origin; scaled to length/radius
  const coneGeo = new THREE.ConeGeometry(1, 1, 5, 1);
  coneGeo.translate(0, 0.5, 0);

  const tuft = (
    parent: THREE.Object3D,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    mat: THREE.Material
  ) => {
    const m = new THREE.Mesh(coneGeo, mat);
    m.position.copy(base);
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    const spin = new THREE.Quaternion().setFromAxisAngle(UP, rng() * Math.PI * 2);
    m.quaternion.copy(q.multiply(spin));
    m.scale.set(rad, len, rad);
    parent.add(m);
    return m;
  };

  // dark toe beans on the front of a padded paw
  const toes = (parent: THREE.Object3D, x: number, y: number, z: number, front: number) => {
    for (const dx of [-0.045, 0, 0.045]) {
      blob(parent, [x + dx, y - 0.02, z + front - 0.01], [0.028, 0.026, 0.03], M.pad, 6, 5);
    }
  };

  const root = new THREE.Group();

  // ---------- body: raised chest, folded haunches ----------
  blob(root, [0, 0.52, -0.05], [0.3, 0.27, 0.72], M.tawny, 14, 10); // torso
  blob(root, [0, 0.32, -0.05], [0.27, 0.13, 0.66], M.cream, 14, 8); // cream belly
  blob(root, [0, 0.56, 0.5], [0.27, 0.3, 0.26], M.tawny, 14, 10); // chest
  blob(root, [0, 0.4, 0.58], [0.2, 0.17, 0.15], M.cream, 10, 8); // cream bib
  blob(root, [0, 0.36, -0.62], [0.33, 0.3, 0.34], M.tawny, 14, 10); // haunch

  for (const s of [-1, 1]) {
    const x = s * 0.2;

    // shoulder
    blob(root, [x, 0.5, 0.38], [0.16, 0.2, 0.2], M.tawny, 10, 8);

    // folded hind leg: thigh, hock, big padded paw tucked forward
    blob(root, [x, 0.26, -0.5], [0.15, 0.2, 0.26], M.tawny, 10, 8);
    limb(root, new THREE.Vector3(x, 0.2, -0.42), new THREE.Vector3(x, 0.1, -0.12), 0.07, 0.055, M.limb);
    blob(root, [x, 0.065, 0.02], [0.1, 0.07, 0.13], M.paw, 10, 8);
    toes(root, x, 0.065, 0.02, 0.13);

    // foreleg: straight, extended forward, paw on the ground
    const S = new THREE.Vector3(x, 0.46, 0.4);
    const E = new THREE.Vector3(x, 0.16, 0.6);
    const W = new THREE.Vector3(x, 0.1, 0.9);
    limb(root, S, E, 0.1, 0.085, M.limb);
    limb(root, E, W, 0.085, 0.07, M.limb);
    blob(root, [x, 0.065, 0.98], [0.1, 0.07, 0.13], M.paw, 10, 8);
    toes(root, x, 0.065, 0.98, 0.13);
  }

  // ---------- tail: lies on the ground, curls up to a dark tuft ----------
  const tailPts = [
    [0, 0.44, -0.9],
    [0, 0.36, -1.18],
    [0.07, 0.2, -1.46],
    [0.2, 0.08, -1.7],
    [0.36, 0.06, -1.8],
    [0.47, 0.13, -1.78],
  ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const tailCurve = new THREE.CatmullRomCurve3(tailPts);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 30, 0.05, 6, false), M.tawny));

  const tip = tailPts[tailPts.length - 1];
  blob(root, [tip.x, tip.y + 0.01, tip.z], [0.085, 0.11, 0.085], M.mane[4], 9, 7);
  for (let i = 0; i < 7; i++) {
    const dir = new THREE.Vector3(rng() * 2 - 1, rng() * 1.2 - 0.1, rng() * 2 - 1);
    tuft(root, tip.clone(), dir, 0.09 + rng() * 0.04, 0.035, M.mane[4]);
  }

  // ---------- neck: raised high, leading up into the head ----------
  const nA = new THREE.Vector3(0, 0.55, 0.5);
  const nB = new THREE.Vector3(0, 0.95, 0.7);
  limb(root, nA, nB, 0.22, 0.18, M.tawny);

  // neck mane: runs from the shoulders up to the back of the head
  const nAxis = new THREE.Vector3().subVectors(nB, nA).normalize();
  const nLen = nA.distanceTo(nB);
  const nU = new THREE.Vector3(1, 0, 0);
  const nV = new THREE.Vector3().crossVectors(nAxis, nU).normalize();
  for (let i = 0; i < 90; i++) {
    const t = 0.05 + rng() * 0.95;
    const a = rng() * Math.PI * 2;
    const radial = new THREE.Vector3()
      .addScaledVector(nU, Math.cos(a))
      .addScaledVector(nV, Math.sin(a));
    if (radial.z > 0.8 && t < 0.6) continue; // keep the throat clearer
    const base = nA
      .clone()
      .addScaledVector(nAxis, t * nLen)
      .addScaledVector(radial, 0.19 + rng() * 0.03);
    const dir = radial.clone().add(new THREE.Vector3(0, -0.35, -0.3)); // flows back and down
    const idx = THREE.MathUtils.clamp(Math.round(3.6 - t * 2.2 + (rng() - 0.5) * 1.2), 0, 4);
    tuft(root, base, dir, 0.14 + rng() * 0.08, 0.05 + rng() * 0.015, M.mane[idx]);
  }

  // ---------- head: held high, chin lifted ----------
  const head = new THREE.Group();
  head.position.set(0, 1.08, 0.82);
  head.rotation.x = -0.12;
  root.add(head);

  blob(head, [0, 0, 0], [0.21, 0.19, 0.2], M.tawny, 14, 10); // skull
  blob(head, [0, -0.06, 0.2], [0.12, 0.09, 0.13], M.cream, 12, 9); // muzzle
  for (const s of [-1, 1]) {
    blob(head, [s * 0.045, -0.05, 0.31], [0.05, 0.04, 0.035], M.cream, 8, 6); // whisker pads
  }
  blob(head, [0, -0.17, 0.19], [0.065, 0.045, 0.07], M.cream, 8, 6); // chin
  blob(head, [0, 0.0, 0.335], [0.07, 0.048, 0.04], M.nose, 10, 7); // broad black nose

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.02), M.pad);
  mouth.position.set(0, -0.085, 0.322);
  head.add(mouth);

  for (const s of [-1, 1]) {
    const x = s * 0.075;
    blob(head, [x, 0.03, 0.178], [0.028, 0.028, 0.028], M.amber, 8, 6); // amber eye
    blob(head, [x, 0.03, 0.201], [0.013, 0.013, 0.01], M.pupil, 6, 5); // pupil
    blob(head, [x, 0.095, 0.16], [0.075, 0.03, 0.05], M.tawnyDark, 10, 6); // brow
    blob(head, [s * 0.13, 0.15, -0.02], [0.055, 0.055, 0.03], M.tawnyDark, 8, 6); // ear
    blob(head, [s * 0.13, 0.15, 0.0], [0.03, 0.03, 0.012], M.pad, 6, 5); // inner ear
  }

  // scar cutting diagonally across the brow over the lion's left eye
  const scar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.014, 0.02), M.scar);
  scar.position.set(0.085, 0.1, 0.216);
  scar.rotation.z = -0.6;
  head.add(scar);

  // ---------- head mane: golden round the face, chocolate at the edges ----------
  const EARS = [new THREE.Vector3(0.13, 0.15, -0.02), new THREE.Vector3(-0.13, 0.15, -0.02)];
  for (let i = 0; i < 300; i++) {
    const y = rng() * 2 - 1;
    const phi = rng() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    const d = new THREE.Vector3(Math.sin(phi) * r, y, Math.cos(phi) * r);

    if (d.z > 0.62) continue; // keep the face clear
    if (d.z > 0.4 && d.y < -0.1) continue; // keep muzzle and chin clear

    const base = d.clone().multiplyScalar(0.17 + rng() * 0.04);
    if (EARS.some((e) => e.distanceTo(base) < 0.11)) continue;

    const back = (1 - d.z) * 0.5; // 0 at the front, 1 at the back
    const len = 0.14 + rng() * 0.1 + back * 0.08;

    const t = Math.acos(THREE.MathUtils.clamp(d.z, -1, 1)); // angle from the face
    let idx = Math.min(4, Math.floor(THREE.MathUtils.clamp((t - 0.7) / 1.9, 0, 0.999) * 5));
    if (rng() < 0.25) idx = THREE.MathUtils.clamp(idx + (rng() < 0.5 ? -1 : 1), 0, 4);

    const dir = d.clone().add(new THREE.Vector3(0, -0.2, -0.15)); // shaggy droop
    tuft(head, base, dir, len, 0.045 + rng() * 0.02, M.mane[idx]);
  }

  return root;
}
```