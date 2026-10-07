```ts
import * as THREE from "three";

export const meta = {
  name: "Curious Reef Octopus",
  description:
    "A stylised coral-and-rust reef octopus: bulbous mantle, golden bar-pupil eyes under a grumpy brow, eight cream-suckered arms curling in every direction, and one arm proudly holding up an old brass key from a shipwreck.",
};

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const IDENT = new THREE.Quaternion();
const COS_ROW = Math.cos((65 * Math.PI) / 180);
const SIN_ROW = Math.sin((65 * Math.PI) / 180);

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

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

function smooth(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// radius of an arm at normalised length s (0 at root, 1 at tip)
function armRadius(r0: number, s: number): number {
  return r0 * (1 - 0.55 * Math.pow(s, 1.1));
}

interface Tube {
  mesh: THREE.Mesh;
  T: THREE.Vector3[];
  N: THREE.Vector3[];
  B: THREE.Vector3[];
}

// Sweeps a circular section along a polyline using parallel-transport frames.
// A final radius of 0 closes the tip into a point.
function addTube(pts: THREE.Vector3[], radii: number[], material: THREE.Material, radial: number): Tube {
  const M = pts.length;
  const T: THREE.Vector3[] = [];
  for (let i = 0; i < M; i++) {
    T.push(pts[Math.min(M - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize());
  }
  const N: THREE.Vector3[] = [];
  const B: THREE.Vector3[] = [];
  const ref = Math.abs(T[0].y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const n = new THREE.Vector3().crossVectors(T[0], ref).normalize();
  for (let i = 0; i < M; i++) {
    n.addScaledVector(T[i], -n.dot(T[i])).normalize();
    N.push(n.clone());
    B.push(new THREE.Vector3().crossVectors(T[i], n));
  }

  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < M; i++) {
    const r = radii[i];
    for (let k = 0; k <= radial; k++) {
      const a = (k / radial) * TAU;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const dx = N[i].x * ca + B[i].x * sa;
      const dy = N[i].y * ca + B[i].y * sa;
      const dz = N[i].z * ca + B[i].z * sa;
      pos.push(pts[i].x + dx * r, pts[i].y + dy * r, pts[i].z + dz * r);
      nor.push(dx, dy, dz);
    }
  }
  const row = radial + 1;
  for (let i = 0; i < M - 1; i++) {
    for (let k = 0; k < radial; k++) {
      const a = i * row + k;
      const c = a + 1;
      const b = a + row;
      const d = b + 1;
      idx.push(a, c, b, c, d, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = "arm";
  return { mesh, T, N, B };
}

// A curling arm grown by a turtle walk. Steep at the root, flat on the floor
// (the floor clamp keeps it resting there), then lifting and curling at the tip.
function turtleArm(
  base: THREE.Vector3,
  h0: number,
  sgn: number,
  len: number,
  r0: number,
  pDown: number,
  pUp: number,
  k0: number,
  k1: number,
  kp: number,
  steps: number,
): THREE.Vector3[] {
  const pts = [base.clone()];
  const cur = base.clone();
  let h = h0;
  const ds = len / steps;
  for (let i = 1; i <= steps; i++) {
    const s = i / steps;
    h += sgn * (k0 + k1 * Math.pow(s, kp)) * ds;
    const pitch = -pDown * (1 - smooth(0.05, 0.4, s)) + pUp * smooth(0.5, 1, s);
    const floorY = armRadius(r0, s) * 0.92;
    const dy = Math.max(Math.sin(pitch), (floorY - cur.y) / ds);
    const hs = Math.sqrt(Math.max(0, 1 - dy * dy));
    cur.x += Math.cos(h) * hs * ds;
    cur.z += Math.sin(h) * hs * ds;
    cur.y += dy * ds;
    pts.push(cur.clone());
  }
  return pts;
}

export default function createReefOctopus(): THREE.Object3D {
  const rand = mulberry32(0x5eed0c7);
  const rr = (a: number, b: number) => a + (b - a) * rand();

  const mats = {
    mantle: new THREE.MeshStandardMaterial({ color: "#c76a3d", roughness: 0.6 }),
    arm: new THREE.MeshStandardMaterial({ color: "#a2472a", roughness: 0.66, flatShading: true }),
    bump: new THREE.MeshStandardMaterial({ color: "#5c2216", roughness: 0.8, flatShading: true }),
    mottle: new THREE.MeshStandardMaterial({ color: "#f0c79a", roughness: 0.6, flatShading: true }),
    sucker: new THREE.MeshStandardMaterial({ color: "#f7ecd3", roughness: 0.45 }),
    coral: new THREE.MeshStandardMaterial({ color: "#e4875a", roughness: 0.55, flatShading: true }),
    eye: new THREE.MeshStandardMaterial({ color: "#ebb030", metalness: 0.35, roughness: 0.22 }),
    pupil: new THREE.MeshStandardMaterial({ color: "#150e0a", roughness: 0.35 }),
    brow: new THREE.MeshStandardMaterial({ color: "#4a1b12", roughness: 0.8, flatShading: true }),
    brass: new THREE.MeshStandardMaterial({ color: "#caa045", metalness: 0.65, roughness: 0.32 }),
    patina: new THREE.MeshStandardMaterial({ color: "#5f8266", roughness: 0.85, flatShading: true }),
  };

  const root = new THREE.Group();
  root.name = "reef-octopus";

  // ---------- mantle: a lathe profile gives the soft bulbous head ----------
  const profile: [number, number][] = [
    [0.0, 0.1], [0.05, 0.11], [0.1, 0.14], [0.135, 0.2], [0.15, 0.27],
    [0.148, 0.33], [0.13, 0.39], [0.095, 0.44], [0.05, 0.47], [0.0, 0.485],
  ];
  root.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 16),
      mats.mantle,
    ),
  );

  type Seg = { r0: number; y0: number; r1: number; y1: number };
  type Surf = { r: number; y: number; nr: number; ny: number };
  const segs: Seg[] = profile.slice(0, -1).map((p, j) => ({
    r0: p[0],
    y0: p[1],
    r1: profile[j + 1][0],
    y1: profile[j + 1][1],
  }));
  // point on a profile segment with its outward (radial, vertical) normal
  const surfAt = (seg: Seg, t: number): Surf => {
    const dr = seg.r1 - seg.r0;
    const dy = seg.y1 - seg.y0;
    const L = Math.hypot(dr, dy) || 1;
    return { r: seg.r0 + dr * t, y: seg.y0 + dy * t, nr: dy / L, ny: -dr / L };
  };
  // lathe puts +Z at phi = 0, so x = r sin(phi), z = r cos(phi)
  const onMantle = (s: Surf, phi: number) => {
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    return {
      p: new THREE.Vector3(s.r * sp, s.y, s.r * cp),
      n: new THREE.Vector3(s.nr * sp, s.ny, s.nr * cp).normalize(),
    };
  };
  const mantleAtY = (y: number): Surf => {
    const seg = segs.find((sg) => sg.y0 <= y && y <= sg.y1) ?? segs[4];
    return surfAt(seg, (y - seg.y0) / (seg.y1 - seg.y0));
  };

  // instance lists, turned into InstancedMeshes at the end
  const bumpM: THREE.Matrix4[] = [];
  const mottleM: THREE.Matrix4[] = [];
  const suckerM: THREE.Matrix4[] = [];
  const mat4 = (p: THREE.Vector3, q: THREE.Quaternion, sx: number, sy: number, sz: number) =>
    new THREE.Matrix4().compose(p, q, new THREE.Vector3(sx, sy, sz));

  // dark bumps across the mantle
  for (let placed = 0, tries = 0; placed < 75 && tries < 800; tries++) {
    const seg = segs[Math.floor(rand() * segs.length)];
    const s = surfAt(seg, rand());
    if (s.y < 0.15) continue;
    const { p, n } = onMantle(s, rand() * TAU);
    const size = rr(0.006, 0.011);
    p.addScaledVector(n, size * 0.25);
    bumpM.push(mat4(p, IDENT, size, size, size));
    placed++;
  }

  // pale mottling on the mantle, keeping the eye area clear
  for (let placed = 0, tries = 0; placed < 40 && tries < 800; tries++) {
    const seg = segs[Math.floor(rand() * segs.length)];
    const s = surfAt(seg, rand());
    if (s.y < 0.17) continue;
    const phi = rand() * TAU;
    const a = Math.atan2(Math.sin(phi), Math.cos(phi));
    if (s.y > 0.2 && s.y < 0.38 && Math.abs(Math.abs(a) - 0.42) < 0.32) continue;
    const { p, n } = onMantle(s, phi);
    const w = rr(0.011, 0.02);
    p.addScaledVector(n, w * 0.1);
    mottleM.push(mat4(p, new THREE.Quaternion().setFromUnitVectors(FWD, n), w, w, w * 0.3));
    placed++;
  }

  // siphon funnel tucked under the front of the mantle
  const funnelDir = new THREE.Vector3(0, -0.5, 1).normalize();
  const funnel = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.07, 8), mats.bump);
  funnel.position.set(0, 0.165, 0.13);
  funnel.quaternion.setFromUnitVectors(UP, funnelDir);
  root.add(funnel);

  // a little coral tuft growing off the crown
  const tuftSpecs = [
    { p: v3(0.03, 0.44, -0.03), d: v3(0.35, 1, -0.2), h: 0.07, r: 0.016 },
    { p: v3(-0.035, 0.43, -0.01), d: v3(-0.5, 1, 0.1), h: 0.08, r: 0.014 },
    { p: v3(0.0, 0.45, 0.03), d: v3(0.1, 1, 0.45), h: 0.06, r: 0.013 },
  ];
  for (const t of tuftSpecs) {
    const d = t.d.clone().normalize();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 6), mats.coral);
    cone.position.copy(t.p).addScaledVector(d, t.h * 0.45);
    cone.quaternion.setFromUnitVectors(UP, d);
    root.add(cone);
  }

  // ---------- eyes: gold spheres, horizontal bar pupils, grumpy brows ----------
  for (const sg of [1, -1]) {
    const s = mantleAtY(0.3);
    const { p: S, n } = onMantle(s, sg * 0.42);
    const C = S.clone().addScaledVector(n, 0.011);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), mats.eye);
    eye.position.copy(C);
    root.add(eye);

    const z = n.clone();
    const x = new THREE.Vector3().crossVectors(UP, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x).normalize();

    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.0075, 0.005), mats.pupil);
    pupil.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    pupil.position.copy(C).addScaledVector(z, 0.0345);
    root.add(pupil);

    // outer end sits high, inner end is pressed down: a grumpy slope
    const dirB = x.clone().multiplyScalar(sg).addScaledVector(y, 0.45).normalize();
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0105, 0.05, 3, 6), mats.brow);
    brow.position.copy(C).addScaledVector(y, 0.034).addScaledVector(z, 0.011);
    brow.quaternion.setFromUnitVectors(UP, dirB);
    root.add(brow);
  }

  // ---------- suckers, dorsal bumps and mottling along each arm ----------
  // stations are spaced by arc length; each station gets two lateral rows
  const decorate = (
    pts: THREE.Vector3[],
    radii: number[],
    T: THREE.Vector3[],
    N: THREE.Vector3[],
    limitF: number,
  ) => {
    const M = pts.length;
    const arc: number[] = [0];
    for (let i = 1; i < M; i++) arc.push(arc[i - 1] + pts[i].distanceTo(pts[i - 1]));

    let lastStation = -1e9;
    for (let i = 2; i < M - 3; i++) {
      const f = i / (M - 1);
      if (f > limitF) break;
      const R = radii[i];
      if (R < 0.004) continue;
      const rs = R * 0.36;
      if (arc[i] - lastStation < 2.4 * rs) continue;
      lastStation = arc[i];

      const p = pts[i];
      const t = T[i];
      let up = UP.clone().addScaledVector(t, -t.y);
      if (up.lengthSq() < 0.06) up = N[i].clone();
      else up.normalize();
      const side = new THREE.Vector3().crossVectors(t, up).normalize();

      for (const sg of [1, -1]) {
        const d = up.clone().multiplyScalar(COS_ROW).addScaledVector(side, sg * SIN_ROW).normalize();
        const c = p.clone().addScaledVector(d, R * 0.94 + rs * 0.25);
        suckerM.push(mat4(c, new THREE.Quaternion().setFromUnitVectors(UP, d), rs, rs * 0.5, rs));
      }

      if (rand() < 0.45) {
        const ang = rand() * TAU;
        const d = up.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang));
        const size = R * rr(0.22, 0.32);
        bumpM.push(mat4(p.clone().addScaledVector(d, R * 0.85), IDENT, size, size, size));
      }

      if (rand() < 0.3) {
        const ang = rand() * TAU;
        const d = up.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang));
        const w = R * rr(0.4, 0.6);
        mottleM.push(
          mat4(
            p.clone().addScaledVector(d, R * 0.9),
            new THREE.Quaternion().setFromUnitVectors(FWD, d),
            w,
            w,
            w * 0.35,
          ),
        );
      }
    }
  };

  const addArm = (pts: THREE.Vector3[], radii: number[], limitF: number) => {
    const tube = addTube(pts, radii, mats.arm, 10);
    root.add(tube.mesh);
    decorate(pts, radii, tube.T, tube.N, limitF);
  };

  // ---------- arms ----------
  const KEY_HEADING = 1.05;
  const ARM_STEPS = 56;

  for (let j = 1; j <= 7; j++) {
    const h0 = KEY_HEADING + j * (TAU / 8) + rr(-0.12, 0.12);
    const sgn = rand() < 0.5 ? -1 : 1;
    const L = rr(0.44, 0.56);
    const r0 = rr(0.037, 0.045);
    const base = v3(Math.cos(h0) * 0.07, 0.2, Math.sin(h0) * 0.07);
    const pts = turtleArm(
      base,
      h0,
      sgn,
      L,
      r0,
      rr(0.55, 0.95), // pDown
      rr(-0.05, 0.42), // pUp
      rr(0.15, 0.6), // k0
      rr(18, 32), // k1
      rr(3.8, 5.4), // kp
      ARM_STEPS,
    );
    const radii = pts.map((_, i) => (i === pts.length - 1 ? 0 : armRadius(r0, i / ARM_STEPS)));
    addArm(pts, radii, 1);
  }

  // the key arm: spline up from the floor, then coil around the key shaft
  const KEY_AT = v3(0.2, 0.44, 0.355);
  const keyCtrl: THREE.Vector3[] = [
    v3(0.037, 0.2, 0.065),
    v3(0.075, 0.13, 0.13),
    v3(0.12, 0.04, 0.2),
    v3(0.165, 0.036, 0.27),
    v3(0.19, 0.13, 0.32),
    v3(0.2, 0.3, 0.34),
  ];
  const HELIX_R = 0.03;
  for (let k = 0; k <= 12; k++) {
    const t = k / 12;
    const phi = -Math.PI / 2 + t * TAU * 0.95;
    keyCtrl.push(
      v3(KEY_AT.x + HELIX_R * Math.cos(phi), 0.42 + t * 0.1, KEY_AT.z + HELIX_R * Math.sin(phi)),
    );
  }
  const keyCurve = new THREE.CatmullRomCurve3(keyCtrl, false, "centripetal");
  const keyPts = keyCurve.getSpacedPoints(64);
  const keyR0 = 0.042;
  const keyRadii = keyPts.map((_, i) => {
    if (i === keyPts.length - 1) return 0;
    const f = i / (keyPts.length - 1);
    return keyR0 * (1 - 0.5 * f) * (1 - 0.5 * smooth(0.66, 0.74, f));
  });
  addArm(keyPts, keyRadii, 0.6);

  // ---------- the old brass key ----------
  const key = new THREE.Group();
  key.name = "brass-key";
  key.position.copy(KEY_AT);
  key.rotation.z = -0.12;

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.17, 10), mats.brass);
  shaft.position.y = 0.015;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 10), mats.brass);
  collar.position.y = 0.1;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.0085, 8, 24), mats.brass);
  bow.position.y = 0.14;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.013, 0.008), mats.brass);
  blade.position.set(0.016, -0.063, 0);
  const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.012, 0.008), mats.brass);
  tooth1.position.set(0.0085, -0.075, 0);
  const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.012, 0.008), mats.brass);
  tooth2.position.set(0.0265, -0.075, 0);
  key.add(shaft, collar, bow, blade, tooth1, tooth2);

  // green patina flecks from the wreck
  const patinaGeo = new THREE.SphereGeometry(0.0055, 6, 4);
  for (const ang of [2.9, 3.4, 5.6]) {
    const fleck = new THREE.Mesh(patinaGeo, mats.patina);
    fleck.position.set(0.031 * Math.cos(ang), 0.14 + 0.031 * Math.sin(ang), 0.004);
    key.add(fleck);
  }
  root.add(key);

  // ---------- instanced details ----------
  const addInstanced = (geo: THREE.BufferGeometry, mat: THREE.Material, list: THREE.Matrix4[]) => {
    if (list.length === 0) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    root.add(im);
  };
  addInstanced(new THREE.CylinderGeometry(1, 1, 1, 8, 1), mats.sucker, suckerM);
  addInstanced(new THREE.IcosahedronGeometry(1, 0), mats.bump, bumpM);
  addInstanced(new THREE.SphereGeometry(1, 7, 5), mats.mottle, mottleM);

  return root;
}
```