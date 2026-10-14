```ts
import * as THREE from "three";

export const meta = {
  name: "Keel-billed Toucan on a Mossy Branch",
  description:
    "Glossy black keel-billed toucan with a lime, sky-blue, orange and cherry-red rainbow beak, lime eye rings and bright blue feet, perched on a mossy branch beside a single pink orchid.",
};

type P = [number, number, number];

// ---------- seeded randomness ----------
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = makeRng(20260607);

// ---------- materials: one per colour, shared ----------
function mat(color: number, roughness = 0.5, flatShading = false) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading });
}

const M = {
  black: mat(0x0f0f15, 0.3),
  wing: mat(0x1e2434, 0.4),
  bib: mat(0xffe81a, 0.45),
  lime: mat(0x9be83a, 0.4),
  scarlet: mat(0xe3162d, 0.5),
  blue: mat(0x1d8ff0, 0.4),
  eye: mat(0x050508, 0.2),
  glint: mat(0xffffff, 0.15),
  nostril: mat(0x050508, 0.4),
  beakLime: mat(0x94e83b, 0.35),
  beakBlue: mat(0x56c8f5, 0.35),
  beakOrange: mat(0xff8b1f, 0.35),
  beakRed: mat(0xd8142c, 0.35),
  bark: mat(0x5f4430, 0.9, true),
  barkDark: mat(0x3a2818, 0.9, true),
  rock: mat(0x75736a, 0.95, true),
  moss: mat(0x3f9632, 0.95, true),
  moss2: mat(0x66b43e, 0.95, true),
  mossDark: mat(0x2b6e2a, 0.95, true),
  leaf: mat(0x4fb640, 0.5, true),
  stem: mat(0x6cc24c, 0.5),
  petal: mat(0xff8ccb, 0.4),
  sepal: mat(0xffb9e0, 0.4),
  lip: mat(0xd81e7c, 0.4),
  column: mat(0xfff1a8, 0.4),
};

// ---------- primitive helpers ----------
function blob(parent: THREE.Object3D, m: THREE.Material, p: P, r: P, seg = 12): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, seg, Math.max(5, Math.round(seg * 0.7))),
    m,
  );
  mesh.position.set(p[0], p[1], p[2]);
  mesh.scale.set(r[0], r[1], r[2]);
  parent.add(mesh);
  return mesh;
}

function rod(
  parent: THREE.Object3D,
  a: P,
  b: P,
  ra: number,
  rb: number,
  m: THREE.Material,
  seg = 8,
): THREE.Mesh {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const d = new THREE.Vector3().subVectors(B, A);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, len, seg, 1), m);
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  parent.add(mesh);
  return mesh;
}

// ---------- bird frame ----------
// Upright bird frame: feet at origin, head toward +Y, facing +Z.
// The torso/head/beak/tail sit in a group pivoting at the hip and leaning forward.
const HIP_Y = 0.13;
const LEAN = 0.38; // radians, forward lean of the torso
const bodyP = (x: number, y: number, z: number): P => [x, y - HIP_Y, z];

// Keel-billed beak: one lofted, tapering, curved mesh with four rainbow bands.
function beakGeometry(): THREE.BufferGeometry {
  const P0 = new THREE.Vector3(0, 0.375, 0.07);
  const P1 = new THREE.Vector3(0, 0.445, 0.2);
  const P2 = new THREE.Vector3(0, 0.4, 0.27);
  const RINGS = 20;
  const SEG = 12;
  const side = new THREE.Vector3(1, 0, 0);

  const point = (t: number) =>
    new THREE.Vector3()
      .addScaledVector(P0, (1 - t) * (1 - t))
      .addScaledVector(P1, 2 * (1 - t) * t)
      .addScaledVector(P2, t * t);

  const d01 = new THREE.Vector3().subVectors(P1, P0);
  const d12 = new THREE.Vector3().subVectors(P2, P1);
  const tangent = (t: number) =>
    new THREE.Vector3()
      .addScaledVector(d01, 2 * (1 - t))
      .addScaledVector(d12, 2 * t)
      .normalize();

  const halfW = (t: number) => 0.03 * (1 - 0.78 * t);
  const halfTop = (t: number) => 0.046 * (1 - 0.72 * Math.pow(t, 1.1));
  const halfBot = (t: number) => 0.55 * halfTop(t);

  const positions: number[] = [];
  for (let i = 0; i <= RINGS; i++) {
    const t = i / RINGS;
    const c = point(t);
    const up = new THREE.Vector3().crossVectors(tangent(t), side);
    const w = halfW(t);
    const ht = halfTop(t);
    const hb = halfBot(t);
    for (let k = 0; k < SEG; k++) {
      const ang = (k / SEG) * Math.PI * 2;
      const s = Math.cos(ang);
      const u = Math.sin(ang);
      const h = u >= 0 ? ht : hb;
      const p = c.clone().addScaledVector(side, w * s).addScaledVector(up, h * u);
      positions.push(p.x, p.y, p.z);
    }
  }
  const tip = point(1).addScaledVector(tangent(1), 0.003);
  const tipIdx = (RINGS + 1) * SEG;
  positions.push(tip.x, tip.y, tip.z);

  const vi = (i: number, k: number) => i * SEG + (k % SEG);
  // rainbow bands along the beak: lime, sky blue, orange, cherry-red tip
  const bandOf = (t: number) => (t < 0.4 ? 0 : t < 0.65 ? 1 : t < 0.85 ? 2 : 3);
  const bands: number[][] = [[], [], [], []];
  for (let i = 0; i < RINGS; i++) {
    for (let k = 0; k < SEG; k++) {
      const tm = (i + 0.5) / RINGS;
      const lower = k >= SEG / 2; // lower mandible has its bands shifted back a little
      const b = bandOf(lower ? tm - 0.05 : tm);
      const a0 = vi(i, k);
      const a1 = vi(i, k + 1);
      const b0 = vi(i + 1, k);
      const b1 = vi(i + 1, k + 1);
      bands[b].push(a0, a1, b0, a1, b1, b0);
    }
  }
  for (let k = 0; k < SEG; k++) {
    bands[3].push(vi(RINGS, k), vi(RINGS, k + 1), tipIdx);
  }

  const indices: number[] = [];
  const groups: [number, number, number][] = [];
  for (let b = 0; b < 4; b++) {
    groups.push([indices.length, bands[b].length, b]);
    indices.push(...bands[b]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  for (const [start, count, mi] of groups) geo.addGroup(start, count, mi);
  geo.computeVertexNormals();
  return geo;
}

function buildBird(): THREE.Group {
  const bird = new THREE.Group();

  const body = new THREE.Group();
  body.position.set(0, HIP_Y, 0);
  body.rotation.x = LEAN;
  bird.add(body);

  // torso and head, glossy black
  blob(body, M.black, bodyP(0, 0.2, 0), [0.072, 0.105, 0.078], 14);
  blob(body, M.black, bodyP(0, 0.36, 0.02), [0.075, 0.078, 0.072], 16);

  // lemon-yellow bib
  blob(body, M.bib, bodyP(0, 0.27, 0.058), [0.05, 0.072, 0.034], 12);

  // scarlet under-tail patch
  blob(body, M.scarlet, bodyP(0, 0.11, -0.07), [0.05, 0.035, 0.045], 10);

  // folded wings with feather tips
  for (const sx of [-1, 1]) {
    blob(body, M.wing, bodyP(sx * 0.062, 0.18, -0.03), [0.022, 0.085, 0.05], 10);
    blob(body, M.wing, bodyP(sx * 0.066, 0.075, -0.052), [0.018, 0.034, 0.03], 8);
  }

  // tail hanging down and back
  rod(body, bodyP(0, 0.1, -0.06), bodyP(0, -0.12, -0.2), 0.03, 0.02, M.black, 8);

  // eyes: black eye inside a lime-green skin ring, with a small glint
  for (const sx of [-1, 1]) {
    const ex = sx * 0.072;
    const ey = 0.372;
    const ez = 0.038;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0065, 8, 18), M.lime);
    ring.position.set(...bodyP(ex, ey, ez));
    ring.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(sx * 0.7, 0.1, 0.7).normalize(),
    );
    body.add(ring);
    blob(body, M.eye, bodyP(ex, ey, ez), [0.012, 0.012, 0.012], 10);
    blob(body, M.glint, bodyP(ex + sx * 0.007, ey + 0.007, ez + 0.008), [0.0035, 0.0035, 0.0035], 6);
  }

  // the huge rainbow beak
  const beak = new THREE.Mesh(beakGeometry(), [M.beakLime, M.beakBlue, M.beakOrange, M.beakRed]);
  beak.geometry.translate(0, -HIP_Y, 0);
  body.add(beak);

  // nostrils on the upper mandible near the base
  for (const sx of [-1, 1]) {
    const n = blob(body, M.nostril, bodyP(sx * 0.011, 0.422, 0.082), [0.0065, 0.0035, 0.0095], 8);
    n.rotation.x = -0.44;
  }

  // legs, bright blue, zygodactyl toes gripping the branch
  for (const sx of [-1, 1]) {
    const fx = sx * 0.03;
    rod(bird, [fx, 0.125, -0.005], [fx, 0.026, 0.004], 0.011, 0.008, M.blue, 7);
    blob(bird, M.blue, [fx, 0.024, 0.004], [0.011, 0.011, 0.011], 8);
    rod(bird, [fx - 0.007, 0.008, 0.004], [fx - 0.007, 0.007, 0.042], 0.0055, 0.0045, M.blue, 6);
    rod(bird, [fx + 0.007, 0.008, 0.004], [fx + 0.007, 0.007, 0.042], 0.0055, 0.0045, M.blue, 6);
    rod(bird, [fx, 0.008, 0.0], [fx, 0.007, -0.034], 0.0055, 0.0045, M.blue, 6);
  }

  return bird;
}

// ---------- branch and stump ----------
// Branch centre-line: x, y, z, radius. Runs along X, bird faces +Z.
const CHAIN: [number, number, number, number][] = [
  [-0.46, 0.262, 0.012, 0.02],
  [-0.26, 0.259, -0.008, 0.029],
  [0.0, 0.255, 0.0, 0.035],
  [0.26, 0.259, 0.008, 0.031],
  [0.46, 0.272, 0.024, 0.019],
];

function chainAt(x: number) {
  for (let i = 0; i < CHAIN.length - 1; i++) {
    const a = CHAIN[i];
    const b = CHAIN[i + 1];
    if (x <= b[0]) {
      const t = THREE.MathUtils.clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
      return {
        y: a[1] + (b[1] - a[1]) * t,
        z: a[2] + (b[2] - a[2]) * t,
        r: a[3] + (b[3] - a[3]) * t,
      };
    }
  }
  const last = CHAIN[CHAIN.length - 1];
  return { y: last[1], z: last[2], r: last[3] };
}

function buildPerch(model: THREE.Group) {
  // branch segments with rounded joints
  for (let i = 0; i < CHAIN.length - 1; i++) {
    const a = CHAIN[i];
    const b = CHAIN[i + 1];
    rod(model, [a[0], a[1], a[2]], [b[0], b[1], b[2]], a[3], b[3], M.bark, 9);
  }
  CHAIN.forEach((c) => blob(model, M.bark, [c[0], c[1], c[2]], [c[3], c[3], c[3]], 9));

  // bark knots on the camera-facing side
  for (const x of [-0.36, 0.12, 0.38]) {
    const c = chainAt(x);
    blob(model, M.barkDark, [x, c.y + c.r * 0.2, c.z + c.r * 0.98], [0.012, 0.009, 0.006], 7);
  }

  // moss clumps hugging the branch, kept clear of the bird's feet
  const mossMats = [M.moss, M.moss2, M.mossDark];
  for (let i = 0; i < 30; i++) {
    const x = -0.43 + rand() * 0.86;
    if (x > -0.2 && x < 0.04) continue;
    const c = chainAt(x);
    const th = (rand() - 0.5) * 2.6;
    const rr = c.r * 0.95;
    const p: P = [x, c.y + rr * Math.cos(th), c.z + rr * Math.sin(th)];
    blob(
      model,
      mossMats[Math.floor(rand() * mossMats.length)],
      p,
      [0.03 + rand() * 0.025, 0.014 + rand() * 0.01, 0.026 + rand() * 0.016],
      7,
    );
  }

  // mossy boulder at the ground, grounded exactly at y = 0
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), M.rock);
  rock.scale.set(1.25, 0.55, 1.1);
  rock.rotation.y = 0.4;
  model.add(rock);
  rock.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(rock, true);
  rock.position.y = -bb.min.y;

  for (let i = 0; i < 9; i++) {
    const th = (i / 9) * Math.PI * 2 + rand() * 0.5;
    const R = 0.15 + rand() * 0.02;
    blob(
      model,
      rand() < 0.5 ? M.moss : M.moss2,
      [Math.cos(th) * R * 1.15, 0.1 + rand() * 0.04, Math.sin(th) * R],
      [0.035 + rand() * 0.02, 0.018, 0.03 + rand() * 0.015],
      7,
    );
  }
  blob(model, M.moss, [0, 0.15, 0], [0.12, 0.028, 0.1], 9);

  // stump rising out of the rock, capped with moss, holding the branch
  rod(model, [0, 0.07, 0], [0, 0.225, 0], 0.1, 0.09, M.bark, 9);
  blob(model, M.moss, [0, 0.222, 0], [0.104, 0.024, 0.1], 9);
  for (let i = 0; i < 3; i++) {
    const th = i * 2.1 + 0.4;
    blob(model, M.barkDark, [Math.cos(th) * 0.09, 0.13 + i * 0.04, Math.sin(th) * 0.09], [0.012, 0.012, 0.008], 7);
  }

  // small twig with two leaves on the left end
  const tc = chainAt(-0.34);
  rod(model, [-0.34, tc.y + tc.r * 0.3, tc.z], [-0.37, 0.34, -0.03], 0.011, 0.006, M.bark, 6);
  blob(model, M.leaf, [-0.375, 0.35, -0.03], [0.03, 0.006, 0.012], 7).rotation.set(0.2, 0.5, 0.5);
  blob(model, M.leaf, [-0.36, 0.36, -0.035], [0.024, 0.005, 0.01], 7).rotation.set(-0.2, -0.4, 0.8);
}

// ---------- orchid ----------
function orchidFlower(parent: THREE.Object3D, c: P, s: number, spin: number, tilt: number) {
  const g = new THREE.Group();
  g.position.set(c[0], c[1], c[2]);
  g.scale.setScalar(s);
  g.rotation.set(tilt, 0, spin);
  parent.add(g);

  const parts: { deg: number; R: number; rx: number; ry: number; m: THREE.Material }[] = [
    { deg: 90, R: 0.021, rx: 0.025, ry: 0.015, m: M.sepal },
    { deg: 205, R: 0.02, rx: 0.026, ry: 0.015, m: M.sepal },
    { deg: 335, R: 0.02, rx: 0.026, ry: 0.015, m: M.sepal },
    { deg: 14, R: 0.021, rx: 0.027, ry: 0.021, m: M.petal },
    { deg: 166, R: 0.021, rx: 0.027, ry: 0.021, m: M.petal },
  ];
  for (const p of parts) {
    const a = (p.deg * Math.PI) / 180;
    const pet = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), p.m);
    pet.position.set(Math.cos(a) * p.R, Math.sin(a) * p.R, 0.002);
    pet.scale.set(p.rx, p.ry, 0.004);
    pet.rotation.z = a;
    g.add(pet);
  }

  const lip = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), M.lip);
  lip.position.set(0, -0.015, 0.004);
  lip.scale.set(0.011, 0.013, 0.006);
  g.add(lip);

  blob(g, M.column, [0, 0.003, 0.006], [0.0075, 0.0075, 0.0075], 8);
}

function buildOrchid(): THREE.Group {
  const orchid = new THREE.Group();

  // moss base and two strappy leaves
  blob(orchid, M.moss2, [0, -0.005, 0], [0.05, 0.024, 0.042], 8);
  const leafA = blob(orchid, M.leaf, [-0.034, 0.022, 0.004], [0.05, 0.0075, 0.014], 8);
  leafA.rotation.set(0.1, 0.4, 0.32);
  const leafB = blob(orchid, M.leaf, [0.038, 0.02, 0.012], [0.046, 0.007, 0.013], 8);
  leafB.rotation.set(-0.12, -0.55, -0.28);

  // arching flower spike
  const S: P[] = [
    [0, 0, 0],
    [0.004, 0.07, 0.012],
    [0.014, 0.13, 0.03],
    [0.03, 0.18, 0.05],
    [0.05, 0.21, 0.06],
  ];
  for (let i = 0; i < S.length - 1; i++) {
    rod(orchid, S[i], S[i + 1], 0.0045 - i * 0.0004, 0.0041 - i * 0.0004, M.stem, 6);
  }

  // three open blossoms
  const flowers: { c: P; s: number; spin: number; tilt: number; from: number }[] = [
    { c: [-0.03, 0.125, 0.085], s: 0.85, spin: 0.25, tilt: -0.35, from: 2 },
    { c: [0.05, 0.165, 0.1], s: 0.8, spin: -0.3, tilt: -0.25, from: 3 },
    { c: [0.0, 0.23, 0.1], s: 0.7, spin: 0.6, tilt: -0.5, from: 4 },
  ];
  for (const f of flowers) {
    rod(orchid, S[f.from], f.c, 0.0028, 0.0022, M.stem, 5);
    orchidFlower(orchid, f.c, f.s, f.spin, f.tilt);
  }

  // closed bud at the top
  rod(orchid, S[4], [0.068, 0.25, 0.072], 0.0025, 0.002, M.stem, 5);
  blob(orchid, M.petal, [0.07, 0.258, 0.076], [0.012, 0.018, 0.011], 8);
  blob(orchid, M.sepal, [0.068, 0.248, 0.074], [0.014, 0.01, 0.014], 7);

  return orchid;
}

// ---------- assembly ----------
export default function buildToucanOnMossyBranch(): THREE.Object3D {
  const model = new THREE.Group();
  model.name = "keel-billed-toucan";

  buildPerch(model);

  const BX = -0.08;
  const bc = chainAt(BX);
  const bird = buildBird();
  bird.position.set(BX, bc.y + bc.r - 0.004, bc.z);
  model.add(bird);

  const OX = 0.27;
  const oc = chainAt(OX);
  const orchid = buildOrchid();
  orchid.position.set(OX, oc.y + oc.r - 0.003, oc.z);
  model.add(orchid);

  return model;
}
```