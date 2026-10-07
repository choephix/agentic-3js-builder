```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Startled Pufferfish",
  description:
    "A fully puffed-up pufferfish ball: creamy yellow skin with brown leopard spots fading in wavy bands to a white belly, short spikes all over, a tiny pouting mouth with separate upper and lower jaw, big worried eyes with slanted brows, small side fins, a stubby fan-shaped tail and a few bubbles rising from its mouth.",
};

type Vec = THREE.Vector3;

/* ------------------------------------------------------------------ */
/* small math helpers                                                  */
/* ------------------------------------------------------------------ */
const TAU = Math.PI * 2;
const v3 = (x = 0, y = 0, z = 0): Vec => new THREE.Vector3(x, y, z);
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const UP = v3(0, 1, 0);
const FWD = v3(0, 0, 1);

// rotation taking unit vector a onto unit vector b (axis-angle, no helpers needed)
function quatFromTo(a: Vec, b: Vec): THREE.Quaternion {
  const q = new THREE.Quaternion();
  const d = a.dot(b);
  if (d > 0.999999) return q;
  if (d < -0.999999) {
    const ax = (Math.abs(a.x) < 0.9 ? v3(1, 0, 0) : v3(0, 1, 0)).cross(a).normalize();
    return q.setFromAxisAngle(ax, Math.PI);
  }
  const ax = a.clone().cross(b).normalize();
  return q.setFromAxisAngle(ax, Math.acos(d));
}
function alignTo(geo: THREE.BufferGeometry, from: Vec, to: Vec) {
  geo.applyQuaternion(quatFromTo(from, to.clone().normalize()));
  return geo;
}

function makeRand(seed: number): () => number {
  try {
    const r: any = (rng as any)(seed);
    let f: (() => number) | null = null;
    if (typeof r === "function") f = () => r();
    else if (r && typeof r.next === "function") f = () => r.next();
    else if (r && typeof r.random === "function") f = () => r.random();
    if (f) {
      const probe = f();
      if (typeof probe === "number" && probe >= 0 && probe < 1) return f;
    }
  } catch (e) {
    /* fall back to the local generator below */
  }
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* the puffed body: an ellipsoid parametrised by a unit direction      */
/* ------------------------------------------------------------------ */
const A = 0.15; // half width
const B = 0.155; // half height
const C = 0.165; // half length
const surfPoint = (d: Vec): Vec => v3(A * d.x, B * d.y, C * d.z);
const surfNormal = (d: Vec): Vec => v3(d.x / A, d.y / B, d.z / C).normalize();

// belly gradient: stepped bands with wavy borders (polar angle from the back)
const BAND_RAD = [0, 62, 86, 108, 130, 180].map((d) => (d * Math.PI) / 180);
const BAND_COL = ["#efc24f", "#f4d276", "#f8e19c", "#fcefc9", "#fffaf0"];
const SPIKE_COL = ["#d9a132", "#e5b64e", "#efce7c", "#f8e5b0", "#fff3d9"];

function edgeTheta(k: number, phi: number): number {
  if (k <= 0) return 0;
  if (k >= BAND_RAD.length - 1) return Math.PI;
  return (
    BAND_RAD[k] +
    0.075 * (0.55 * Math.sin(2 * phi + k * 1.7) + 0.45 * Math.sin(3 * phi + k * 2.3 + 1))
  );
}
function bandIndex(d: Vec): number {
  const th = Math.acos(clamp(d.y, -1, 1));
  const phi = Math.atan2(d.x, d.z);
  for (let k = 1; k < BAND_RAD.length - 1; k++) if (th < edgeTheta(k, phi)) return k - 1;
  return BAND_RAD.length - 2;
}

function bandGeo(k: number, nPhi: number, nRows: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const vert = (i: number, j: number): Vec => {
    const phi = ((i % nPhi) / nPhi) * TAU;
    const t0 = edgeTheta(k, phi);
    const t1 = edgeTheta(k + 1, phi);
    const th = t0 + (t1 - t0) * (j / nRows);
    return v3(A * Math.sin(th) * Math.sin(phi), B * Math.cos(th), C * Math.sin(th) * Math.cos(phi));
  };
  const tri = (a: Vec, b: Vec, c: Vec) => {
    if (a.distanceToSquared(b) < 1e-12 || b.distanceToSquared(c) < 1e-12 || a.distanceToSquared(c) < 1e-12) return;
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };
  for (let i = 0; i < nPhi; i++) {
    for (let j = 0; j < nRows; j++) {
      const p00 = vert(i, j);
      const p10 = vert(i + 1, j);
      const p01 = vert(i, j + 1);
      const p11 = vert(i + 1, j + 1);
      tri(p00, p01, p10);
      tri(p10, p01, p11);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}

// slightly irregular flattened blob used for spots
function blobGeo(rx: number, th: number, rz: number, seed: number): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 7, 4);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const ang = Math.atan2(z, x);
    const f = 1 + 0.16 * Math.sin(3 * ang + seed) + 0.09 * Math.sin(5 * ang + seed * 1.7);
    p.setXYZ(i, x * f * rx, y * th, z * f * rz);
  }
  g.computeVertexNormals();
  g.rotateY(seed);
  return g;
}

/* fan outlines for tail and fins ---------------------------------- */
function fanProfile(R: number, half: number, nRays: number, scallop: number, sub: number) {
  const pts: { x: number; y: number; th: number }[] = [];
  const n = (nRays - 1) * sub;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = -half + 2 * half * t;
    const phase = t * (nRays - 1);
    const dd = Math.abs(phase - Math.round(phase)) * 2;
    const r = R * (1 - scallop * dd);
    pts.push({ x: r * Math.cos(th), y: r * Math.sin(th), th });
  }
  return pts;
}
// thin extruded plate; shape x runs along (cos yaw, 0, -sin yaw), shape y is up
function plate(shape: THREE.Shape, thick: number, yaw: number): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -thick / 2);
  g.rotateY(yaw);
  return g;
}
function rodGeo(p0: Vec, p1: Vec, r: number, seg: number) {
  const dir = p1.clone().sub(p0);
  const geo = new THREE.CylinderGeometry(r, r, dir.length(), seg, 1);
  alignTo(geo, UP, dir);
  return { geo, at: p0.clone().add(p1).multiplyScalar(0.5) };
}

type FanOpts = {
  origin: Vec;
  yaw: number;
  R: number;
  half: number;
  nRays: number;
  sub: number;
  scallop: number;
  r0: number;
  thick: number;
  fill: string;
  rays: string;
  rayR: number;
  raySeg: number;
  bone: any;
  rim?: { color: string; frac: number; extra: number; bone: any };
};

/* ================================================================== */
export default function build(): THREE.Object3D {
  const rand = makeRand(31);
  const b = createBuilder({ name: "pufferfish" });

  /* ---------------- planning (pure math) ---------------- */
  const SIDES = [
    { id: "L", s: 1 },
    { id: "R", s: -1 },
  ];
  const eyeDir = (s: number) => v3(s * 0.6, 0.3, 0.74).normalize();
  const finDir = (s: number) => v3(s * 0.97, -0.07, -0.2).normalize();
  const mouthDir = v3(0, -0.16, 1).normalize();
  const zones: { d: Vec; r: number }[] = [
    ...SIDES.map(({ s }) => ({ d: eyeDir(s), r: 0.56 })),
    { d: mouthDir, r: 0.36 },
    ...SIDES.map(({ s }) => ({ d: finDir(s), r: 0.3 })),
    { d: v3(0, 0, -1), r: 0.42 },
    { d: v3(0, 0.78, -0.63).normalize(), r: 0.34 },
    { d: v3(0, -0.78, -0.63).normalize(), r: 0.34 },
  ];
  const blocked = (d: Vec, extra = 0) => zones.some((z) => d.angleTo(z.d) < z.r + extra);

  // leopard spots: dense on the back, small and sparse towards the flanks
  type Spot = { d: Vec; p: Vec; n: Vec; r: number; ros: boolean; dot: boolean; col: string; aspect: number; seed: number };
  const SPOT_COLS = ["#8a5528", "#7a4a22", "#966030"];
  const spots: Spot[] = [];
  for (let tries = 0; tries < 7000 && spots.length < 56; tries++) {
    const y = -0.3 + 1.3 * rand();
    if (rand() > 0.2 + 0.8 * smooth(-0.25, 0.5, y)) continue;
    const ph = rand() * TAU;
    const rh = Math.sqrt(Math.max(0, 1 - y * y));
    const d = v3(rh * Math.sin(ph), y, rh * Math.cos(ph));
    const r = (0.0105 + 0.0135 * smooth(-0.1, 0.8, y)) * (0.78 + 0.5 * rand());
    if (blocked(d, 0.1 + r / 0.15)) continue;
    let ok = true;
    for (const s of spots) {
      if (d.angleTo(s.d) * 0.152 < (r + s.r) * 1.18 + 0.003) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    spots.push({
      d,
      p: surfPoint(d),
      n: surfNormal(d),
      r,
      ros: r > 0.0155 && rand() < 0.5,
      dot: rand() < 0.35,
      col: SPOT_COLS[Math.floor(rand() * SPOT_COLS.length) % SPOT_COLS.length],
      aspect: 0.75 + 0.4 * rand(),
      seed: rand() * TAU,
    });
  }

  // spikes: jittered Fibonacci lattice, brown where they grow out of a spot
  type Spike = { p: Vec; n: Vec; len: number; rad: number; col: string; yaw: number };
  const spikes: Spike[] = [];
  const NS = 430;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NS; i++) {
    const y = 1 - (2 * (i + 0.5)) / NS;
    const rh = Math.sqrt(1 - y * y);
    const ph = i * golden;
    const d = v3(rh * Math.sin(ph), y, rh * Math.cos(ph));
    d.x += (rand() - 0.5) * 0.045;
    d.y += (rand() - 0.5) * 0.045;
    d.z += (rand() - 0.5) * 0.045;
    d.normalize();
    if (blocked(d)) continue;
    const p = surfPoint(d);
    const n = surfNormal(d);
    const len = 0.021 * (0.85 + 0.3 * rand());
    let col = SPIKE_COL[bandIndex(d)];
    for (const s of spots) {
      if (p.distanceTo(s.p) < s.r * 0.85) {
        col = "#7a4a22";
        break;
      }
    }
    spikes.push({ p, n, len, rad: 0.0066 * (0.85 + 0.3 * (len / 0.021)), col, yaw: rand() * TAU });
  }

  // rest the fish on its lowest spikes
  let minY = -B;
  for (const s of spikes) minY = Math.min(minY, s.p.y + s.n.y * s.len);
  const cy = -minY - 0.001;

  const W = (p: Vec | number[]): [number, number, number] =>
    Array.isArray(p) ? [p[0], p[1] + cy, p[2]] : [p.x, p.y + cy, p.z];
  const put = (geo: THREE.BufferGeometry, color: string, pos: Vec | number[], bone: any) => {
    b.part(geo, color, { at: W(pos), bone });
  };
  const tag = (j: any, role: string) => {
    if (j) j.userData = Object.assign(j.userData ?? {}, { role });
    return j;
  };

  /* ---------------- skeleton ---------------- */
  const root = tag(b.joint("root", { at: W([0, 0, 0]), aim: W([0, 0, 0.07]) }), "spine");
  const spine1 = tag(b.joint("spine1", { at: W([0, 0, 0.07]), parent: root, aim: W([0, -0.005, 0.14]) }), "spine");
  const head = tag(b.joint("head", { at: W([0, -0.005, 0.14]), parent: spine1, aim: W([0, -0.02, 0.19]) }), "head");
  const jaw = tag(b.joint("jaw", { at: W([0, -0.034, 0.152]), parent: head, aim: W([0, -0.034, 0.19]) }), "jaw");
  const tail1 = tag(b.joint("tail1", { at: W([0, -0.01, -0.13]), parent: root, aim: W([0, -0.01, -0.205]) }), "tail");
  const tail2 = tag(b.joint("tail2", { at: W([0, -0.01, -0.205]), parent: tail1, aim: W([0, -0.01, -0.275]) }), "tail");
  const tail3 = tag(b.joint("tail3", { at: W([0, -0.01, -0.275]), parent: tail2, dir: [0, 0, -1] }), "tail");
  const dorsal = tag(b.joint("dorsal", { at: W([0, 0.13, -0.1]), parent: root, dir: [0, 0.5, -0.85] }), "fan");
  const anal = tag(b.joint("anal", { at: W([0, -0.13, -0.1]), parent: root, dir: [0, -0.5, -0.85] }), "fan");

  /* ---------------- body: banded, faceted ball ---------------- */
  for (let k = 0; k < 5; k++) put(bandGeo(k, 28, 3), BAND_COL[k], [0, 0, 0], root);

  /* ---------------- leopard spots ---------------- */
  for (const sp of spots) {
    if (!sp.ros) {
      const th = Math.max(0.0042, sp.r * 0.3);
      const geo = blobGeo(sp.r, th, sp.r * sp.aspect, sp.seed);
      alignTo(geo, UP, sp.n);
      put(geo, sp.col, sp.p.clone().addScaledVector(sp.n, -th * 0.35), root);
    } else {
      const tube = sp.r * 0.27;
      const fill = blobGeo(sp.r - tube * 1.1, 0.0026, (sp.r - tube * 1.1) * sp.aspect, sp.seed);
      alignTo(fill, UP, sp.n);
      put(fill, "#d9a447", sp.p.clone().addScaledVector(sp.n, -0.0006), root);
      const ring = new THREE.TorusGeometry(sp.r - tube, tube, 5, 9);
      ring.rotateX(-Math.PI / 2);
      ring.scale(1, 0.75, 1);
      alignTo(ring, UP, sp.n);
      put(ring, "#744520", sp.p.clone().addScaledVector(sp.n, -tube * 0.15), root);
      if (sp.dot) {
        const dot = blobGeo(sp.r * 0.24, 0.0034, sp.r * 0.24, sp.seed + 1);
        alignTo(dot, UP, sp.n);
        put(dot, "#7a4a22", sp.p.clone().addScaledVector(sp.n, -0.0008), root);
      }
    }
  }

  /* ---------------- spikes ---------------- */
  for (const sp of spikes) {
    const h = sp.len + 0.005;
    const geo = new THREE.ConeGeometry(sp.rad, h, 5, 1);
    geo.translate(0, h / 2 - 0.005, 0);
    geo.rotateY(sp.yaw);
    alignTo(geo, UP, sp.n);
    put(geo, sp.col, sp.p, root);
  }

  /* ---------------- fans (tail, pectoral fins) ---------------- */
  const addFan = (o: FanOpts) => {
    const pts = fanProfile(o.R, o.half, o.nRays, o.scallop, o.sub);
    const k = o.rim ? 0.975 : 1;
    const shape = new THREE.Shape();
    shape.moveTo(o.r0 * Math.cos(-o.half), o.r0 * Math.sin(-o.half));
    pts.forEach((p) => shape.lineTo(p.x * k, p.y * k));
    shape.lineTo(o.r0 * Math.cos(o.half), o.r0 * Math.sin(o.half));
    shape.closePath();
    put(plate(shape, o.thick, o.yaw), o.fill, o.origin, o.bone);

    if (o.rim) {
      const rim = new THREE.Shape();
      rim.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) rim.lineTo(pts[i].x, pts[i].y);
      for (let i = pts.length - 1; i >= 0; i--) {
        rim.lineTo(o.R * o.rim.frac * Math.cos(pts[i].th), o.R * o.rim.frac * Math.sin(pts[i].th));
      }
      rim.closePath();
      put(plate(rim, o.thick * o.rim.extra, o.yaw), o.rim.color, o.origin, o.rim.bone);
    }

    const toW = (x: number, y: number) =>
      v3(o.origin.x + x * Math.cos(o.yaw), o.origin.y + y, o.origin.z - x * Math.sin(o.yaw));
    for (let i = 0; i < o.nRays; i++) {
      const p = pts[i * o.sub];
      const a = toW(o.r0 * 1.3 * Math.cos(p.th), o.r0 * 1.3 * Math.sin(p.th));
      const e = toW(0.97 * o.R * Math.cos(p.th), 0.97 * o.R * Math.sin(p.th));
      const rod = rodGeo(a, e, o.rayR, o.raySeg);
      put(rod.geo, o.rays, rod.at, o.bone);
    }
  };

  /* ---------------- tail: stubby peduncle + fan ---------------- */
  const ped = new THREE.CylinderGeometry(0.027, 0.05, 0.095, 8, 1);
  ped.scale(1, 1, 1.3);
  ped.rotateX(-Math.PI / 2);
  put(ped, BAND_COL[1], v3(0, -0.01, -0.1825), tail1);
  addFan({
    origin: v3(0, -0.01, -0.215),
    yaw: Math.PI / 2,
    R: 0.09,
    half: 0.95,
    nRays: 7,
    sub: 2,
    scallop: 0.14,
    r0: 0.018,
    thick: 0.0055,
    fill: "#f3d47c",
    rays: "#b9732e",
    rayR: 0.0038,
    raySeg: 4,
    bone: tail2,
    rim: { color: "#d99a45", frac: 0.78, extra: 1.25, bone: tail3 },
  });

  /* ---------------- dorsal and anal fins ---------------- */
  const finPts: [number, number][] = [
    [0, 0.115],
    [0.012, 0.15],
    [0.036, 0.157],
    [0.058, 0.146],
    [0.078, 0.108],
    [0.078, 0.06],
    [0, 0.06],
  ];
  const finShape = (sy: number) => {
    const s = new THREE.Shape();
    finPts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y * sy) : s.lineTo(x, y * sy)));
    s.closePath();
    return s;
  };
  put(plate(finShape(1), 0.005, Math.PI / 2), "#efc460", v3(0, 0, -0.065), dorsal);
  put(plate(finShape(-1), 0.005, Math.PI / 2), "#efc460", v3(0, 0, -0.065), anal);

  /* ---------------- pectoral fins ---------------- */
  for (const { id, s } of SIDES) {
    const dF = finDir(s);
    const SF = surfPoint(dF);
    const nF = surfNormal(dF);
    const rootP = SF.clone().addScaledVector(nF, -0.012);
    const yaw = s > 0 ? Math.PI / 4 : (3 * Math.PI) / 4;
    const u = v3(Math.cos(yaw), 0, -Math.sin(yaw));
    const fj = tag(
      b.joint("fin" + id, { at: W(rootP), parent: root, aim: W(rootP.clone().addScaledVector(u, 0.06)) }),
      "fan",
    );
    addFan({
      origin: rootP,
      yaw,
      R: 0.062,
      half: 1.0,
      nRays: 5,
      sub: 2,
      scallop: 0.12,
      r0: 0.012,
      thick: 0.0045,
      fill: "#f8e7ad",
      rays: "#d9ae62",
      rayR: 0.003,
      raySeg: 5,
      bone: fj,
    });
    const sock = new THREE.SphereGeometry(1, 8, 5);
    sock.scale(0.026, 0.016, 0.026);
    alignTo(sock, UP, nF);
    put(sock, BAND_COL[bandIndex(dF)], SF.clone().addScaledVector(nF, -0.003), fj);
  }

  /* ---------------- eyes ---------------- */
  const domeOnSphere = (center: Vec, g: Vec, R: number, r: number, lift: number) => {
    const a0 = Math.sqrt(R * R - r * r) * 0.96;
    const semi = R + lift - a0;
    const geo = new THREE.SphereGeometry(1, 12, 6);
    geo.scale(r, semi, r);
    alignTo(geo, UP, g);
    return { geo, at: center.clone().addScaledVector(g, a0) };
  };
  const EYE_R = 0.044;

  for (const { id, s } of SIDES) {
    const dE = eyeDir(s);
    const S = surfPoint(dE);
    const n = surfNormal(dE);
    const Ce = S.clone().addScaledVector(n, 0.014);
    const eyeJ = b.joint("eye" + id, { at: W(Ce), parent: head, dir: [n.x, n.y, n.z] });

    // eyeball
    put(new THREE.SphereGeometry(EYE_R, 14, 10), "#fffdf5", Ce, eyeJ);

    // gaze slightly forward and up
    const g = n.clone().add(v3(0, 0.1, 0.55)).normalize();
    const gu = UP.clone().addScaledVector(g, -UP.dot(g)).normalize();
    const gx = v3(1, 0, 0).addScaledVector(g, -g.x).normalize();

    const iris = domeOnSphere(Ce, g, EYE_R, 0.028, 0.0012);
    put(iris.geo, "#d99a2b", iris.at, eyeJ);
    const pupil = domeOnSphere(Ce, g, EYE_R, 0.0178, 0.0045);
    put(pupil.geo, "#1c1512", pupil.at, eyeJ);

    const h1 = g.clone().addScaledVector(gu, 0.25).addScaledVector(gx, 0.16).normalize();
    put(new THREE.SphereGeometry(0.0068, 8, 6), "#ffffff", Ce.clone().addScaledVector(h1, EYE_R + 0.003), eyeJ);
    const h2 = g.clone().addScaledVector(gu, -0.2).addScaledVector(gx, -0.15).normalize();
    put(new THREE.SphereGeometry(0.0035, 6, 4), "#ffffff", Ce.clone().addScaledVector(h2, EYE_R + 0.0035), eyeJ);

    // eyelid ring where the ball meets the skin
    const ring = new THREE.TorusGeometry(0.0405, 0.0068, 6, 16);
    alignTo(ring, FWD, n);
    put(ring, "#c07a2c", S.clone().addScaledVector(n, -0.005), head);

    // worried brow: inner end raised
    const upT = UP.clone().addScaledVector(n, -UP.dot(n)).normalize();
    const h = v3().crossVectors(UP, n).normalize();
    const inner = h.x * s > 0 ? h.clone().negate() : h.clone();
    const tilt = 0.45;
    const browAxis = inner
      .clone()
      .multiplyScalar(Math.cos(tilt))
      .addScaledVector(upT, Math.sin(tilt))
      .normalize();
    const Bc = S.clone().addScaledVector(upT, 0.062).addScaledVector(n, -0.0085).addScaledVector(inner, 0.004);
    const brow = new THREE.CapsuleGeometry(0.0072, 0.05, 3, 6);
    alignTo(brow, UP, browAxis);
    put(brow, "#7d4b24", Bc, head);
  }

  /* ---------------- tiny pouting mouth ---------------- */
  const SM = surfPoint(mouthDir);
  const nM = surfNormal(mouthDir);
  const qM = quatFromTo(FWD, nM);
  const mAt = (x: number, y: number, z: number) => v3(x, y, z).applyQuaternion(qM).add(SM);

  const muzzle = new THREE.CylinderGeometry(0.019, 0.027, 0.02, 10, 1);
  alignTo(muzzle, UP, nM);
  put(muzzle, BAND_COL[bandIndex(mouthDir)], mAt(0, 0, -0.0025), head);

  const cavity = new THREE.CircleGeometry(0.0115, 8);
  cavity.applyQuaternion(qM);
  put(cavity, "#4b211c", mAt(0, 0, 0.0085), head);

  const lipUp = new THREE.TorusGeometry(0.0138, 0.0062, 6, 8, Math.PI);
  lipUp.applyQuaternion(qM);
  put(lipUp, "#ec8a74", mAt(0, 0, 0.01), head);
  const lipDn = new THREE.TorusGeometry(0.0138, 0.0062, 6, 8, Math.PI);
  lipDn.rotateZ(Math.PI);
  lipDn.applyQuaternion(qM);
  put(lipDn, "#ec8a74", mAt(0, 0, 0.01), jaw);

  const toothUp = new THREE.BoxGeometry(0.0105, 0.0055, 0.0035);
  toothUp.applyQuaternion(qM);
  put(toothUp, "#fffdf2", mAt(0, 0.0058, 0.0145), head);
  const toothDn = new THREE.BoxGeometry(0.0105, 0.0055, 0.0035);
  toothDn.applyQuaternion(qM);
  put(toothDn, "#fffdf2", mAt(0, -0.0058, 0.0145), jaw);

  // nostrils
  for (const { s } of SIDES) {
    const dN = v3(s * 0.1, 0.1, 1).normalize();
    const nn = surfNormal(dN);
    const nos = new THREE.SphereGeometry(1, 6, 4);
    nos.scale(0.0048, 0.002, 0.0048);
    alignTo(nos, UP, nn);
    put(nos, "#7a4a22", surfPoint(dN).addScaledVector(nn, -0.0004), head);
  }

  /* ---------------- bubbles rising from the mouth ---------------- */
  const bubbleSpec: [number, number, number, number][] = [
    [0.008, -0.01, 0.208, 0.0075],
    [-0.012, 0.04, 0.232, 0.012],
    [0.014, 0.1, 0.242, 0.0165],
    [-0.01, 0.172, 0.236, 0.0215],
    [0.012, 0.256, 0.222, 0.028],
  ];
  bubbleSpec.forEach(([x, y, z, r], i) => {
    const c = v3(x, y, z);
    const bj = b.joint("bubble" + (i + 1), { at: W(c), parent: root, dir: [0, 1, 0] });
    put(new THREE.SphereGeometry(r, 10, 7), "#8fcfe6", c, bj);
    // lighter inner cap peeking out on the upper front gives a rim-lit look
    const off = v3(-0.12, 0.15, 0.2).multiplyScalar(r);
    put(new THREE.SphereGeometry(r * 0.84, 10, 7), "#d9f3fc", c.clone().add(off), bj);
    const hl = v3(-0.4, 0.5, 0.7).normalize();
    put(new THREE.SphereGeometry(r * 0.26, 6, 4), "#ffffff", c.clone().addScaledVector(hl, r * 0.9), bj);
  });

  return b.root;
}
```