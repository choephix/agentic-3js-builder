```ts
import * as THREE from "three";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A stylised nine-banded armadillo: a domed, banded armour shell with bony bumps, a pointed snout with big ears, digging claws and a ringed tail.",
};

const SE = 2.6; // squareness of the shell sections (boxy, puppet-like)
const TAIL_LEN = 0.32;

// ---------- helpers ----------

// Small seeded PRNG (mulberry32) so every build is identical.
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Section {
  p: THREE.Vector3; // centre of the cross-section
  hw: number; // half width
  hh: number; // half height
  e: number; // squareness: 2 = ellipse, larger = boxier
  q?: THREE.Quaternion; // optional tilt of the section plane
}

function sec(z: number, cy: number, hw: number, hh: number, e = SE): Section {
  return { p: new THREE.Vector3(0, cy, z), hw, hh, e };
}

// Lofts superellipse cross-sections into one closed, faceted surface.
// Sections must be ordered along their local +Z.
function loft(sections: Section[], seg: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  const v = new THREE.Vector3();

  for (const s of sections) {
    const k = 2 / s.e;
    for (let j = 0; j < seg; j++) {
      const t = (j / seg) * Math.PI * 2;
      const c = Math.cos(t);
      const sn = Math.sin(t);
      v.set(
        s.hw * Math.sign(c) * Math.pow(Math.abs(c), k),
        s.hh * Math.sign(sn) * Math.pow(Math.abs(sn), k),
        0,
      );
      if (s.q) v.applyQuaternion(s.q);
      pos.push(s.p.x + v.x, s.p.y + v.y, s.p.z + v.z);
    }
  }

  const count = sections.length;
  for (let i = 0; i < count - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j;
      const b = i * seg + ((j + 1) % seg);
      const c = (i + 1) * seg + j;
      const d = (i + 1) * seg + ((j + 1) % seg);
      idx.push(a, b, c, b, d, c);
    }
  }

  // End caps: fans around the section centres.
  const first = sections[0].p;
  const startIdx = pos.length / 3;
  pos.push(first.x, first.y, first.z);
  for (let j = 0; j < seg; j++) idx.push(startIdx, (j + 1) % seg, j);

  const last = sections[count - 1].p;
  const base = (count - 1) * seg;
  const endIdx = pos.length / 3;
  pos.push(last.x, last.y, last.z);
  for (let j = 0; j < seg; j++) idx.push(endIdx, base + j, base + ((j + 1) % seg));

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Armour cross-section along the body: z from -0.19 (rump) to +0.19 (shoulder).
function shellAt(z: number) {
  const s = Math.max(-1, Math.min(1, z / 0.19));
  const g = Math.max(0.2, Math.pow(1 - s * s, 0.45));
  return { cy: 0.155, hw: 0.075 + 0.035 * g, hh: 0.02 + 0.045 * g };
}

// Height of the armour surface at (z, x) above the ground.
function shellTop(z: number, x: number): number {
  const b = shellAt(z);
  const q = Math.min(1, Math.abs(x) / b.hw);
  return b.cy + b.hh * Math.pow(Math.max(0, 1 - Math.pow(q, SE)), 1 / SE);
}

// Tail centre line: t = 0 at the rump, t = 1 at the tip.
function tailAt(t: number) {
  return {
    z: -0.15 - TAIL_LEN * t,
    y: 0.115 - 0.065 * Math.pow(t, 1.3),
    r: 0.042 * Math.pow(1 - t, 0.85) + 0.006,
  };
}

function tailDir(t: number): THREE.Vector3 {
  const dy = -0.065 * 1.3 * Math.pow(Math.max(t, 0.001), 0.3);
  return new THREE.Vector3(0, dy, -TAIL_LEN).normalize();
}

// ---------- model ----------

export default function buildArmadillo(): THREE.Object3D {
  const rand = makeRng(1337);
  const Z = new THREE.Vector3(0, 0, 1);
  const root = new THREE.Group();
  root.name = "armadillo";

  // ---- palette: one material per colour ----
  const mat = (color: string, roughness: number, flat = false) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: flat });
  const shellM = mat("#6e625a", 0.75, true);
  const bandM = mat("#a18e7a", 0.7, true);
  const boneM = mat("#cbb59a", 0.6, true);
  const bellyM = mat("#eadac4", 0.85);
  const skinM = mat("#d6ad9c", 0.8);
  const legM = mat("#5a4e46", 0.75, true);
  const clawM = mat("#f3ead8", 0.45, true);
  const earInM = mat("#e39b8f", 0.8);
  const eyeM = mat("#16120f", 0.35);
  const glintM = mat("#ffffff", 0.2);
  const noseM = mat("#2d221e", 0.6);

  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  const add = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = root,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // ---- 1. Armour shell: one lofted, boxy dome ----
  const shellSecs: Section[] = [];
  for (let i = 0; i <= 28; i++) {
    const z = -0.19 + (0.38 * i) / 28;
    const b = shellAt(z);
    shellSecs.push(sec(z, b.cy, b.hw, b.hh));
  }
  add(loft(shellSecs, 20), shellM, 0, 0, 0);

  // ---- 2. Nine raised bands across the middle of the shell ----
  for (let i = 0; i < 9; i++) {
    const zTop = 0.05 - i * 0.02;
    const zBot = zTop - 0.0145;
    const secs = [zBot, (zBot + zTop) / 2, zTop].map((z) => {
      const b = shellAt(z);
      return sec(z, b.cy, b.hw * 1.035, b.hh * 1.035 + 0.0015);
    });
    add(loft(secs, 20), bandM, 0, 0, 0);
  }

  // ---- 3. Pale underbelly, set back under the shell ----
  const bellySecs: Section[] = [];
  for (let i = 0; i <= 10; i++) {
    const z = -0.17 + (0.34 * i) / 10;
    const b = shellAt(z);
    bellySecs.push(sec(z, 0.12, b.hw * 0.85, b.hh * 0.9));
  }
  add(loft(bellySecs, 16), bellyM, 0, 0, 0);

  // ---- 4. Head and pointed snout ----
  add(
    loft(
      [
        sec(0.13, 0.142, 0.072, 0.064, 2.3),
        sec(0.22, 0.14, 0.066, 0.06, 2.3),
        sec(0.28, 0.136, 0.05, 0.047, 2.3),
        sec(0.33, 0.132, 0.03, 0.028, 2.3),
        sec(0.37, 0.128, 0.014, 0.013, 2.3),
      ],
      14,
    ),
    skinM,
    0,
    0,
    0,
  );

  // Bony head shield over the skull, ending where the snout turns pale.
  add(
    loft(
      [
        sec(0.17, 0.14, 0.074, 0.062, 2.3),
        sec(0.22, 0.145, 0.071, 0.065, 2.3),
        sec(0.265, 0.141, 0.056, 0.052, 2.3),
      ],
      14,
    ),
    shellM,
    0,
    0,
    0,
  );

  // ---- 5. Eyes, ears and nose ----
  for (const sx of [-1, 1]) {
    add(sph(0.0105, 10, 8), eyeM, sx * 0.056, 0.152, 0.25);
    add(sph(0.003, 6, 4), glintM, sx * 0.064, 0.158, 0.256);

    const ear = add(sph(0.02, 12, 8), shellM, sx * 0.056, 0.184, 0.2);
    ear.scale.set(0.35, 1, 1);
    const inner = add(sph(0.013, 10, 6), earInM, sx * 0.0645, 0.184, 0.2);
    inner.scale.set(0.25, 0.85, 0.85);
  }

  const nose = add(sph(0.012, 10, 8), noseM, 0, 0.13, 0.375);
  nose.scale.set(1.35, 0.85, 0.95);

  // ---- 6. Stubby legs, paws and claws (long digging claws in front) ----
  const legGeo = new THREE.CylinderGeometry(0.024, 0.019, 0.1, 9);
  const pawGeo = sph(0.03, 10, 6);
  const clawGeo = new THREE.ConeGeometry(1, 1, 5); // unit cone, scaled per claw
  const up = new THREE.Vector3(0, 1, 0);

  const claw = (
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    parent: THREE.Object3D,
  ) => {
    const c = new THREE.Mesh(clawGeo, clawM);
    c.scale.set(rad, len, rad);
    c.quaternion.setFromUnitVectors(up, dir);
    c.position.copy(base).addScaledVector(dir, len / 2);
    parent.add(c);
  };

  const legSpots = [
    { x: 0.085, z: 0.1, front: true },
    { x: -0.085, z: 0.1, front: true },
    { x: 0.09, z: -0.1, front: false },
    { x: -0.09, z: -0.1, front: false },
  ];
  for (const L of legSpots) {
    const leg = new THREE.Group();
    leg.position.set(L.x, 0, L.z);
    root.add(leg);

    add(legGeo, legM, 0, 0.05, 0, leg);
    const paw = add(pawGeo, legM, 0, 0.0135, 0.012, leg);
    paw.scale.set(1.1, 0.45, 1.35);

    const dir = new THREE.Vector3(0, -0.3, 1).normalize();
    const len = L.front ? 0.038 : 0.022;
    const rad = L.front ? 0.005 : 0.004;
    for (let k = -1; k <= 1; k++) {
      claw(new THREE.Vector3(k * 0.013, 0.012, 0.042), dir, len, rad, leg);
    }
  }

  // ---- 7. Bony tubercles on the shoulder and rump shields ----
  const bumpGeo = new THREE.SphereGeometry(1, 6, 4);
  const bump = (z: number, x: number, r: number) => {
    const m = new THREE.Mesh(bumpGeo, boneM);
    m.scale.setScalar(r);
    m.position.set(x, shellTop(z, x) - r * 0.3, z);
    root.add(m);
  };
  const grid = (rows: number[], spacing: number) => {
    rows.forEach((z, row) => {
      const hw = shellAt(z).hw;
      const shift = row % 2 ? spacing / 2 : 0;
      for (let k = -6; k <= 6; k++) {
        const x = k * spacing + shift;
        if (Math.abs(x) > hw * 0.84) continue;
        if (z > 0.12 && Math.abs(x) < 0.08) continue; // hidden under the head
        bump(z, x + (rand() - 0.5) * 0.004, 0.0055 + rand() * 0.003);
      }
    });
  };
  grid([0.06, 0.085, 0.11], 0.03);
  grid([-0.14, -0.165], 0.03);

  // ---- 8. Long tapering tail with bony rings ----
  const tailSecs: Section[] = [];
  const TN = 12;
  for (let i = 0; i <= TN; i++) {
    const t = i / TN;
    const p = tailAt(t);
    tailSecs.push({
      p: new THREE.Vector3(0, p.y, p.z),
      hw: p.r,
      hh: p.r * 0.95,
      e: 2.2,
      q: new THREE.Quaternion().setFromUnitVectors(Z, tailDir(t)),
    });
  }
  add(loft(tailSecs, 12), shellM, 0, 0, 0);

  for (let k = 0; k < 9; k++) {
    const t = 0.12 + k * 0.1;
    const p = tailAt(t);
    const tube = 0.0022 + p.r * 0.12;
    const hoop = new THREE.Mesh(
      new THREE.TorusGeometry(p.r + tube * 0.2, tube, 6, 12),
      boneM,
    );
    hoop.position.set(0, p.y, p.z);
    hoop.quaternion.setFromUnitVectors(Z, tailDir(t));
    root.add(hoop);
  }

  return root;
}
```