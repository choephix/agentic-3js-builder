import * as THREE from "three";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an autumn evening walk: a dome of chestnut spines with cream tips, a soft fawn face, a pointed twitchy snout, and a red maple leaf stuck on its back.",
};

// ---------------------------------------------------------------------------
// Seeded randomness so every build is identical
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Proportions (metres, +Y up, faces +Z, left side is +X)
// ---------------------------------------------------------------------------
type Ellipsoid = { c: THREE.Vector3; r: THREE.Vector3 };
const ellipsoid = (c: number[], r: number[]): Ellipsoid => ({
  c: new THREE.Vector3(c[0], c[1], c[2]),
  r: new THREE.Vector3(r[0], r[1], r[2]),
});

const BODY = ellipsoid([0, 0.105, -0.02], [0.085, 0.072, 0.078]);
const CHEST = ellipsoid([0, 0.092, 0.03], [0.066, 0.052, 0.055]);
const HEAD = ellipsoid([0, 0.112, 0.085], [0.054, 0.05, 0.062]);
const HEAD_LOCAL = ellipsoid([0, 0, 0], [0.054, 0.05, 0.062]);
const HEAD_TILT = new THREE.Euler(0.1, 0.12, 0);

const SNOUT_TILT = 0.12;
const SNOUT_LEN = 0.09;
const SNOUT_BASE = new THREE.Vector3(0, -0.012, 0.03);
const SNOUT_R0 = 0.03;
const SNOUT_R1 = 0.005;
const SNOUT_AXIS = new THREE.Vector3(0, -Math.sin(SNOUT_TILT), Math.cos(SNOUT_TILT)).normalize();

const EYE_DIR = (s: number) => new THREE.Vector3(s * 0.8, 0.28, 0.55).normalize();
const EAR_DIR = (s: number) => new THREE.Vector3(s * 0.8, 0.6, -0.1).normalize();

const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);

// Point and outward normal on an ellipsoid, for a unit direction u.
function onEllipsoid(e: Ellipsoid, u: THREE.Vector3) {
  const p = new THREE.Vector3(e.c.x + u.x * e.r.x, e.c.y + u.y * e.r.y, e.c.z + u.z * e.r.z);
  const n = new THREE.Vector3(u.x / e.r.x, u.y / e.r.y, u.z / e.r.z).normalize();
  return { p, n };
}

// Evenly spread unit directions (golden spiral), lightly jittered.
function fibonacci(i: number, n: number, rnd: () => number, jit: number) {
  const y = 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * 2.399963229728653;
  return new THREE.Vector3(
    Math.cos(phi) * r + (rnd() - 0.5) * jit,
    y + (rnd() - 0.5) * jit,
    Math.sin(phi) * r + (rnd() - 0.5) * jit
  ).normalize();
}

function jitter(rnd: () => number, amt: number) {
  return new THREE.Vector3((rnd() * 2 - 1) * amt, (rnd() * 2 - 1) * amt, (rnd() * 2 - 1) * amt);
}

// ---------------------------------------------------------------------------
// Materials: one per colour, shared
// ---------------------------------------------------------------------------
function mat(color: string, roughness: number, flat = true, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: flat });
}

const M = {
  bodyBase: mat("#4b2915", 0.9),
  spineDark: mat("#643418", 0.7),
  spine: mat("#8d5329", 0.62),
  tip: mat("#f3e4c6", 0.6),
  fawn: mat("#d7a36c", 0.75),
  fawnLight: mat("#e9c48f", 0.7),
  fawnDark: mat("#b98153", 0.75),
  pink: mat("#f2a2ad", 0.55),
  nose: mat("#120d0c", 0.18, false, 0.1),
  eye: mat("#140b07", 0.18, false),
  glint: new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.7,
    roughness: 0.3,
  }),
  whisker: mat("#2e1d11", 0.6, false),
  leaf: mat("#c8381f", 0.5, false),
  vein: mat("#7b1c12", 0.6, false),
  stem: mat("#5b3b1f", 0.8, false),
};

// ---------------------------------------------------------------------------
// Shared geometry
// ---------------------------------------------------------------------------
// Cone with base at origin and apex at +Y (length 1, scaled per instance).
const SPINE_GEO = (() => {
  const g = new THREE.ConeGeometry(0.0042, 1, 5, 1, false);
  g.translate(0, 0.5, 0);
  return g;
})();

const SPH = new THREE.SphereGeometry(1, 18, 12);

// ---------------------------------------------------------------------------
// Spines as instanced cones, with cream tips on the outer 40%
// ---------------------------------------------------------------------------
type Spine = {
  base: THREE.Vector3;
  dir: THREE.Vector3;
  len: number;
  thick: number;
  dark: boolean;
};

const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _m = new THREE.Matrix4();

function addSpines(parent: THREE.Object3D, spines: Spine[]) {
  const build = (list: Spine[], material: THREE.Material, tipPass: boolean) => {
    if (list.length === 0) return;
    const im = new THREE.InstancedMesh(SPINE_GEO, material, list.length);
    list.forEach((s, i) => {
      _q.setFromUnitVectors(UP, s.dir);
      if (tipPass) {
        _p.copy(s.base).addScaledVector(s.dir, s.len * 0.6);
        _s.set(s.thick * 0.45, s.len * 0.4, s.thick * 0.45);
      } else {
        _p.copy(s.base);
        _s.set(s.thick, s.len, s.thick);
      }
      _m.compose(_p, _q, _s);
      im.setMatrixAt(i, _m);
    });
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    parent.add(im);
  };
  build(spines.filter((s) => s.dark), M.spineDark, false);
  build(spines.filter((s) => !s.dark), M.spine, false);
  build(spines, M.tip, true);
}

// ---------------------------------------------------------------------------
// Maple leaf outline: five pointed palmate lobes with a toothed margin
// ---------------------------------------------------------------------------
const LOBES = [
  { a: 0.0, R: 1.0, hw: 0.36 },
  { a: 1.2, R: 0.8, hw: 0.34 },
  { a: -1.2, R: 0.8, hw: 0.34 },
  { a: 2.42, R: 0.6, hw: 0.38 },
  { a: -2.42, R: 0.6, hw: 0.38 },
];
const LEAF_BASE = 0.34; // radius of the notches
const LEAF_CY = -0.27; // shifts the leaf so it is roughly centred

function leafOutline(): THREE.Vector2[] {
  const N = 240;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    let r = LEAF_BASE;
    for (const L of LOBES) {
      const d = Math.abs(Math.atan2(Math.sin(th - L.a), Math.cos(th - L.a)));
      const w = Math.max(0, 1 - d / L.hw);
      r = Math.max(r, LEAF_BASE + (L.R - LEAF_BASE) * Math.pow(w, 0.85));
    }
    const tooth = (i % 4) / 4; // saw-tooth margin
    r = LEAF_BASE + (r - LEAF_BASE) * (1 - 0.1 * tooth);
    pts.push(new THREE.Vector2(Math.sin(th) * r, Math.cos(th) * r + LEAF_CY));
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Build the hedgehog
// ---------------------------------------------------------------------------
export default function createHedgehog(): THREE.Object3D {
  const rnd = mulberry32(7741);

  // ---- body spines: Fibonacci points mapped onto the body ellipsoid -------
  const bodySpines: Spine[] = [];
  const NB = 520;
  for (let i = 0; i < NB; i++) {
    const { p, n } = onEllipsoid(BODY, fibonacci(i, NB, rnd, 0.08));
    if (n.y < -0.12) continue; // bare fawn underside
    const hx = (p.x - HEAD.c.x) / (HEAD.r.x * 1.15);
    const hy = (p.y - HEAD.c.y) / (HEAD.r.y * 1.15);
    const hz = (p.z - HEAD.c.z) / (HEAD.r.z * 1.15);
    if (hx * hx + hy * hy + hz * hz < 1) continue; // would sit inside the head
    const dir = n
      .clone()
      .add(new THREE.Vector3(0, 0, -0.35))
      .add(jitter(rnd, 0.2))
      .normalize();
    bodySpines.push({
      base: p.clone().addScaledVector(n, -0.003),
      dir,
      len: (0.028 + rnd() * 0.013) * (1 + 0.15 * Math.max(0, n.y)),
      thick: 0.85 + rnd() * 0.35,
      dark: rnd() < 0.4,
    });
  }

  // ---- crown spines on the head (head-local space) -----------------------
  const earPts = [1, -1].map((s) => onEllipsoid(HEAD_LOCAL, EAR_DIR(s)).p);
  const eyePts = [1, -1].map((s) => onEllipsoid(HEAD_LOCAL, EYE_DIR(s)).p);
  const crownSpines: Spine[] = [];
  const NC = 220;
  for (let i = 0; i < NC; i++) {
    const { p, n } = onEllipsoid(HEAD_LOCAL, fibonacci(i, NC, rnd, 0.08));
    if (n.y < 0.3 || p.z > 0.025) continue;
    if (earPts.some((e) => e.distanceTo(p) < 0.024)) continue;
    if (eyePts.some((e) => e.distanceTo(p) < 0.02)) continue;
    crownSpines.push({
      base: p.clone().addScaledVector(n, -0.002),
      dir: n
        .clone()
        .add(new THREE.Vector3(0, 0, -0.55))
        .add(jitter(rnd, 0.16))
        .normalize(),
      len: 0.02 + rnd() * 0.01,
      thick: 0.8 + rnd() * 0.3,
      dark: rnd() < 0.5,
    });
  }

  const root = new THREE.Group();
  root.name = "hedgehog";

  // ---- body -------------------------------------------------------------
  const bodyBall = new THREE.Mesh(SPH, M.bodyBase);
  bodyBall.scale.copy(BODY.r);
  bodyBall.position.copy(BODY.c);
  root.add(bodyBall);

  // fawn underside: the lower cap of a slightly larger sphere
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4),
    M.fawnLight
  );
  belly.scale.copy(BODY.r).multiplyScalar(1.01);
  belly.position.copy(BODY.c);
  root.add(belly);

  // chest that bridges the head and the body
  const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), M.fawnLight);
  chest.scale.copy(CHEST.r);
  chest.position.copy(CHEST.c);
  root.add(chest);

  addSpines(root, bodySpines);

  // ---- legs and pink paws -----------------------------------------------
  const LEG_GEO = new THREE.CylinderGeometry(0.0165, 0.019, 0.07, 8);
  const PAW_GEO = new THREE.SphereGeometry(1, 12, 8);
  const TOE_GEO = new THREE.SphereGeometry(0.0065, 8, 6);
  const LEGS = [
    { x: 0.042, z: 0.03 },
    { x: -0.042, z: 0.03 },
    { x: 0.047, z: -0.07 },
    { x: -0.047, z: -0.07 },
  ];
  for (const l of LEGS) {
    const leg = new THREE.Mesh(LEG_GEO, M.fawnDark);
    leg.position.set(l.x, 0.05, l.z);
    root.add(leg);

    const paw = new THREE.Mesh(PAW_GEO, M.pink);
    paw.scale.set(0.02, 0.013, 0.026);
    paw.position.set(l.x, 0.013, l.z + 0.004);
    root.add(paw);

    for (const tx of [-0.0072, 0, 0.0072]) {
      const toe = new THREE.Mesh(TOE_GEO, M.pink);
      toe.position.set(l.x + tx, 0.0065, l.z + 0.026);
      root.add(toe);
    }
  }

  // ---- head (tilted and turned slightly) --------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.copy(HEAD.c);
  headGroup.rotation.copy(HEAD_TILT);
  root.add(headGroup);

  const headBall = new THREE.Mesh(SPH, M.fawn);
  headBall.scale.copy(HEAD.r);
  headGroup.add(headBall);

  // pointed snout
  const snoutAxisEnd = SNOUT_BASE.clone().addScaledVector(SNOUT_AXIS, SNOUT_LEN);
  const snout = new THREE.Mesh(
    new THREE.CylinderGeometry(SNOUT_R1, SNOUT_R0, SNOUT_LEN, 10, 1, false),
    M.fawnLight
  );
  snout.quaternion.setFromUnitVectors(UP, SNOUT_AXIS);
  snout.position.copy(SNOUT_BASE).addScaledVector(SNOUT_AXIS, SNOUT_LEN / 2);
  headGroup.add(snout);

  // shiny black button nose with a catch-light
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 16, 12), M.nose);
  nose.scale.set(1.15, 0.85, 0.9);
  nose.position.copy(snoutAxisEnd).addScaledVector(SNOUT_AXIS, 0.001);
  headGroup.add(nose);

  const noseGlint = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 8, 6), M.glint);
  noseGlint.position.copy(nose.position).add(new THREE.Vector3(-0.003, 0.005, 0.006));
  headGroup.add(noseGlint);

  // bright beady eyes
  const EYE_GEO = new THREE.SphereGeometry(0.0092, 16, 12);
  const GLINT_GEO = new THREE.SphereGeometry(0.0028, 8, 6);
  for (const s of [1, -1]) {
    const { p, n } = onEllipsoid(HEAD_LOCAL, EYE_DIR(s));
    const c = p.clone().addScaledVector(n, 0.0045);
    const eye = new THREE.Mesh(EYE_GEO, M.eye);
    eye.position.copy(c);
    headGroup.add(eye);

    const glint = new THREE.Mesh(GLINT_GEO, M.glint);
    glint.position.copy(c).addScaledVector(n, 0.0068).add(new THREE.Vector3(0, 0.0032, 0));
    headGroup.add(glint);
  }

  // tiny round ears: fawn disc with a pink inner
  const EAR_GEO = new THREE.SphereGeometry(1, 14, 8);
  for (const s of [1, -1]) {
    const { p, n } = onEllipsoid(HEAD_LOCAL, EAR_DIR(s));
    const q = new THREE.Quaternion().setFromUnitVectors(FWD, n);

    const outer = new THREE.Mesh(EAR_GEO, M.fawnDark);
    outer.scale.set(0.0135, 0.0135, 0.0036);
    outer.quaternion.copy(q);
    outer.position.copy(p).addScaledVector(n, 0.0016);
    headGroup.add(outer);

    const inner = new THREE.Mesh(EAR_GEO, M.pink);
    inner.scale.set(0.0085, 0.0085, 0.0016);
    inner.quaternion.copy(q);
    inner.position.copy(p).addScaledVector(n, 0.0036);
    headGroup.add(inner);
  }

  // twitchy whiskers fanning out from the snout
  const whiskerGeo = new THREE.CylinderGeometry(0.0007, 0.0007, 0.04, 4);
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const f = 0.42 + k * 0.18;
      const r = SNOUT_R0 + (SNOUT_R1 - SNOUT_R0) * f;
      const start = SNOUT_BASE.clone().addScaledVector(SNOUT_AXIS, SNOUT_LEN * f);
      start.x += s * r * 0.85;
      const dir = new THREE.Vector3(s * 1.0, -0.2 + k * 0.2, -0.3).normalize();
      const w = new THREE.Mesh(whiskerGeo, M.whisker);
      w.quaternion.setFromUnitVectors(UP, dir);
      w.position.copy(start).addScaledVector(dir, 0.02);
      headGroup.add(w);
    }
  }

  addSpines(headGroup, crownSpines);

  // ---- red maple leaf stuck on the spines ---------------------------------
  const S = 0.05;
  const leafGeo = new THREE.ExtrudeGeometry(new THREE.Shape(leafOutline()), {
    depth: 0.06,
    bevelEnabled: false,
  });
  leafGeo.translate(0, 0, -0.03);
  leafGeo.scale(S, S, S);

  const leafRoot = new THREE.Group();
  leafRoot.position.set(-0.018, 0.21, -0.035);
  // lie flat, tilt slightly so the stem dips into the spines, turn it back-left
  leafRoot.rotation.set(-Math.PI / 2 + 0.25, 0.5, 0, "YXZ");
  root.add(leafRoot);

  leafRoot.add(new THREE.Mesh(leafGeo, M.leaf));

  // darker raised veins from the stem to each lobe
  const veinBase = new THREE.Vector2(0, -0.42);
  for (const L of LOBES) {
    const tip = new THREE.Vector2(Math.sin(L.a) * L.R, Math.cos(L.a) * L.R + LEAF_CY);
    const end = veinBase.clone().lerp(tip, 0.84);
    const dir = end.clone().sub(veinBase);
    const len = dir.length() * S;
    const mid = veinBase.clone().add(end).multiplyScalar(0.5 * S);
    const vein = new THREE.Mesh(new THREE.BoxGeometry(0.0032, len, 0.0012), M.vein);
    vein.position.set(mid.x, mid.y, 0.0021);
    vein.rotation.z = Math.atan2(-dir.x, dir.y);
    leafRoot.add(vein);
  }

  // short stem tucked into the spines
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0015, 0.03, 6), M.stem);
  stem.position.set(0, -0.0455, 0);
  stem.rotation.z = 0.2;
  leafRoot.add(stem);

  return root;
}
