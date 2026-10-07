import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { aim, vec } from "../src/math";
import { mix, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Wedge Supercar",
  description:
    "Mid-engine wedge supercar in faceted low-poly: sharp one-plane nose, scissor doors, glass-roofed engine bay with louvres, GT wing with a hinged flap, spinning wheels and steering knuckles.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const ORG = "#ff6a13";
const ORG_D = "#e04e0a";
const ORG_L = "#ff8a2c";
const GRAPH = "#2b2d34";
const CARBON = "#17181c";
const BLACK = "#0c0d10";
const RUBBER = "#1a1a1d";
const SILVER = "#c9ced6";
const STEEL = "#8a9099";
const DSTEEL = "#454952";
const CYAN = "#14d2e8";
const CYAN_D = "#0a7f90";
const RED = "#e2262b";
const AMBER = "#ffb01f";
const WHITE_L = "#f4fbff";
const INT = "#25262c";
const INT_W = "#303239";
const CARPET = "#15161a";
const SEAT = "#1f2026";
const SEAT_I = "#383a43";
const ALU = "#aeb4be";
const TITAN = "#8c8678";
const BAY = "#202126";

// ---------------------------------------------------------------------------------------------------------------
// Dimensions (meters). The car faces +Z, left is +X.
const FA = { z: 1.3, R: 0.3, r: 0.37, x: 0.835, w: 0.13, name: "F" };
const RA = { z: -1.4, R: 0.34, r: 0.43, x: 0.83, w: 0.17, name: "R" };
const WHEEL_SINK = 0.004;

type P2 = [number, number];
type V = [number, number, number];

const rad = (d: number) => (d * Math.PI) / 180;

function tab(t: readonly (readonly [number, number])[], x: number) {
  if (x <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    if (x <= t[i][0]) {
      const [x0, y0] = t[i - 1];
      const [x1, y1] = t[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return t[t.length - 1][1];
}

const hoodH = (z: number) => 0.38 + 0.285 * (2.15 - z);
const tubLip = (z: number) => 0.82 + (0.06 * (0.6 - z)) / 1.55;
const TAIL_LIP: [number, number][] = [
  [-2.25, 0.89],
  [-1.9, 0.92],
  [-1.4, 0.935],
  [-0.95, 0.89],
];
const lipAt = (z: number) => (z > 0.6 ? hoodH(z) : z > -0.95 ? tubLip(z) : tab(TAIL_LIP, z));

const archY = (a: { z: number; R: number; r: number }, z: number) => {
  const d = Math.abs(z - a.z);
  return d >= a.r - 1e-6 ? a.R : a.R + Math.sqrt(a.r * a.r - d * d);
};

const UNDER = "#101114";
/** Body faces that are plain colour (underside, liners, wheel pockets): kept out of the paint sheet so it stays dense. */
function flatClass(px: number, py: number, pz: number, nx: number, ny: number, nz: number): string | null {
  const sx = px >= 0 ? 1 : -1;
  const ax = Math.abs(px);
  if (ny < -0.5) return UNDER;
  if (pz < 0.6 && ax > 0.2 && nx * sx < -0.35) return pz < -0.95 ? BAY : INT_W;
  if (ny > 0.5 && py < 0.55 && pz < 0.58 && ax < 0.9) return pz < -0.95 ? "#2a2b31" : CARPET;
  if (nz < -0.9 && pz > 0.55 && pz < 0.65) return INT;
  const well = Math.abs(pz - FA.z) < FA.r + 0.01 ? FA : Math.abs(pz - RA.z) < RA.r + 0.01 ? RA : null;
  if (well && ax > 0.58 && ax < 0.95 && py < archY(well, pz) + 0.02) return "#0a0a0c";
  return null;
}

/** Splits a geometry's triangles by `flatClass` (centroid and face normal); "paint" keeps the rest. */
function splitFlat(geo: THREE.BufferGeometry) {
  const g = norm(geo);
  const pos = g.getAttribute("position");
  const groups = new Map<string, number[]>();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let t = 0; t < pos.count; t += 3) {
    a.fromBufferAttribute(pos, t);
    b.fromBufferAttribute(pos, t + 1);
    c.fromBufferAttribute(pos, t + 2);
    n.subVectors(b, a).cross(c.clone().sub(a)).normalize();
    const m = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    const key = flatClass(m.x, m.y, m.z, n.x, n.y, n.z) ?? "paint";
    const list = groups.get(key);
    if (list) list.push(t);
    else groups.set(key, [t]);
  }
  const out: [string, THREE.BufferGeometry][] = [];
  for (const [key, starts] of groups) {
    const arr: number[] = [];
    for (const t of starts) for (let k = 0; k < 3; k++) arr.push(pos.getX(t + k), pos.getY(t + k), pos.getZ(t + k));
    const sub = new THREE.BufferGeometry();
    sub.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    out.push([key, sub]);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers
function place<T extends THREE.BufferGeometry>(g: T, pos: V, rot: V = [0, 0, 0]): T {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rad(rot[0]), rad(rot[1]), rad(rot[2]), "XYZ"));
  m.setPosition(pos[0], pos[1], pos[2]);
  g.applyMatrix4(m);
  return g;
}
const box = (w: number, h: number, d: number, pos: V, rot?: V) => place(new THREE.BoxGeometry(w, h, d), pos, rot);
const cyl = (r: number, h: number, n: number, pos: V, rot?: V, r2?: number) =>
  place(new THREE.CylinderGeometry(r2 ?? r, r, h, n), pos, rot);
const cylZ = (r: number, len: number, n: number, pos: V, r2?: number) => cyl(r, len, n, pos, [90, 0, 0], r2);
const cylX = (r: number, len: number, n: number, pos: V, r2?: number) => cyl(r, len, n, pos, [0, 0, 90], r2);

function tube(a: V, b: V, r0: number, r1 = r0, n = 6, open = false) {
  const A = vec(a);
  const B = vec(b);
  const d = B.clone().sub(A);
  const g = new THREE.CylinderGeometry(r1, r0, d.length(), n, 1, open);
  g.applyQuaternion(aim(d));
  const m = A.clone().add(B).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}
function tubeChain(pts: V[], r: number, n = 5, open = false) {
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < pts.length - 1; i++) out.push(tube(pts[i], pts[i + 1], r, r, n, open));
  return out;
}

const area2 = (r: P2[]) => {
  let a = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
};

function pushTri(pos: number[], a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, want: THREE.Vector3) {
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
  if (n.lengthSq() < 1e-12) return;
  if (n.dot(want) < 0) pos.push(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z);
  else pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
}
function geoOf(pos: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

type Station = { z: number; ring: P2[] };

/** A faceted loft of equal-length rings along Z (stations in descending z). Normals face away from the ring's material. */
function ringLoft(st: Station[], caps: { front?: boolean; back?: boolean } = {}) {
  const pos: number[] = [];
  for (let k = 0; k < st.length - 1; k++) {
    const A = st[k];
    const B = st[k + 1];
    const n = A.ring.length;
    if (B.ring.length !== n) throw new Error("ringLoft: ring size changes");
    const sg = area2(A.ring) >= 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const a0 = new THREE.Vector3(A.ring[i][0], A.ring[i][1], A.z);
      const a1 = new THREE.Vector3(A.ring[j][0], A.ring[j][1], A.z);
      const b0 = new THREE.Vector3(B.ring[i][0], B.ring[i][1], B.z);
      const b1 = new THREE.Vector3(B.ring[j][0], B.ring[j][1], B.z);
      const ex = A.ring[j][0] - A.ring[i][0];
      const ey = A.ring[j][1] - A.ring[i][1];
      const ox = sg * ey;
      const oy = -sg * ex;
      let want: THREE.Vector3;
      if (Math.abs(A.z - B.z) < 1e-9) {
        const dx = (a0.x + a1.x) / 2 - (b0.x + b1.x) / 2;
        const dy = (a0.y + a1.y) / 2 - (b0.y + b1.y) / 2;
        want = new THREE.Vector3(0, 0, dx * ox + dy * oy > 0 ? -1 : 1);
      } else want = new THREE.Vector3(ox, oy, 0);
      pushTri(pos, a0, a1, b1, want);
      pushTri(pos, a0, b1, b0, want);
    }
  }
  const parts = [geoOf(pos)];
  if (caps.front) parts.push(capGeo(st[0].ring, st[0].z, 1));
  if (caps.back) parts.push(capGeo(st[st.length - 1].ring, st[st.length - 1].z, -1));
  return mergeGeometries(parts.map(norm))!;
}

function capGeo(ring: P2[], z: number, dirZ: 1 | -1) {
  const tris = THREE.ShapeUtils.triangulateShape(
    ring.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  const pos: number[] = [];
  const want = new THREE.Vector3(0, 0, dirZ);
  for (const t of tris) {
    const [a, b, c] = t.map((i) => new THREE.Vector3(ring[i][0], ring[i][1], z));
    pushTri(pos, a, b, c, want);
  }
  return geoOf(pos);
}

/** A convex polygon (3D points) pushed into a prism `t` thick along its normal. */
function slabGeo(pts: V[], t: number) {
  const P = pts.map((q) => vec(q));
  const n = new THREE.Vector3().subVectors(P[1], P[0]).cross(new THREE.Vector3().subVectors(P[2], P[0])).normalize();
  const top = P.map((p) => p.clone().addScaledVector(n, t / 2));
  const bot = P.map((p) => p.clone().addScaledVector(n, -t / 2));
  const c = P.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / P.length);
  const pos: number[] = [];
  for (let i = 1; i < P.length - 1; i++) {
    pushTri(pos, top[0], top[i], top[i + 1], n);
    pushTri(pos, bot[0], bot[i], bot[i + 1], n.clone().negate());
  }
  for (let i = 0; i < P.length; i++) {
    const j = (i + 1) % P.length;
    const mid = top[i].clone().add(top[j]).multiplyScalar(0.5).sub(c);
    pushTri(pos, top[i], top[j], bot[j], mid);
    pushTri(pos, top[i], bot[j], bot[i], mid);
  }
  return geoOf(pos);
}

/** A double-sided quad with 0..1 UVs (p0 bottom-left, p1 bottom-right, p2 top-right, p3 top-left). */
function quad(p0: V, p1: V, p2: V, p3: V) {
  const g = new THREE.BufferGeometry();
  const P = [p0, p1, p2, p3];
  const uvs = [0, 0, 1, 0, 1, 1, 0, 1];
  const idx = [0, 1, 2, 0, 2, 3];
  const pos: number[] = [];
  const uv: number[] = [];
  for (const i of idx) {
    pos.push(...P[i]);
    uv.push(uvs[i * 2], uvs[i * 2 + 1]);
  }
  for (const i of [...idx].reverse()) {
    pos.push(...P[i]);
    uv.push(uvs[i * 2], uvs[i * 2 + 1]);
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function norm(g: THREE.BufferGeometry) {
  const src = g.index ? g.toNonIndexed() : g;
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", src.getAttribute("position"));
  out.computeVertexNormals();
  const uv = src.getAttribute("uv");
  out.setAttribute("uv", uv ?? new THREE.Float32BufferAttribute(new Float32Array(src.getAttribute("position").count * 2), 2));
  return out;
}

const mirrorClosed = (R: P2[]): P2[] => [...R, ...R.slice(1).reverse().map(([x, y]): P2 => [-x, y])];
const mirrorOpen = (R: P2[]): P2[] => [...R, ...[...R].reverse().map(([x, y]): P2 => [-x, y])];

/** An open path thickened inward (right of travel) into a closed loop. */
function thick(path: P2[], t: number): P2[] {
  const n = path.length;
  const segN = (a: P2, b: P2): P2 => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dy / l, -dx / l];
  };
  const inner: P2[] = [];
  for (let i = 0; i < n; i++) {
    const n1 = i > 0 ? segN(path[i - 1], path[i]) : segN(path[0], path[1]);
    const n2 = i < n - 1 ? segN(path[i], path[i + 1]) : n1;
    let ax = n1[0] + n2[0];
    let ay = n1[1] + n2[1];
    const l = Math.hypot(ax, ay) || 1;
    ax /= l;
    ay /= l;
    const k = t / Math.max(0.5, ax * n1[0] + ay * n1[1]);
    inner.push([path[i][0] + ax * k, path[i][1] + ay * k]);
  }
  return [...path, ...inner.reverse()];
}

/** The four lower-side points of a body ring: the side, then (under a wheel arch) the pocket ceiling and its inner wall. */
const POCKET_X = 0.6;
function lower(ww: number, ys: number, yb: number, ya: number | null): P2[] {
  if (ya !== null)
    return [
      [ww - 0.006, ya + (ys - ya) * 0.5],
      [ww - 0.03, ya],
      [POCKET_X, ya],
      [POCKET_X, yb],
    ];
  return [
    [ww - 0.012, yb + (ys - yb) * 0.55],
    [ww - 0.03, yb + 0.1],
    [ww - 0.17, yb],
    [POCKET_X, yb],
  ];
}

// ---------------------------------------------------------------------------------------------------------------
// Ring profiles
function noseRing(z: number, arch: boolean): P2[] {
  const h = hoodH(z);
  const ww = tab(
    [
      [0.6, 0.985],
      [1.3, 0.985],
      [1.6, 0.97],
      [1.9, 0.86],
      [2.15, 0.72],
    ],
    z,
  );
  const wh = tab(
    [
      [1.5, 0.46],
      [1.8, 0.52],
      [2.15, 0.62],
    ],
    z,
  );
  const bw = tab(
    [
      [0.9, 0.125],
      [1.6, 0.1],
      [2.15, 0.06],
    ],
    z,
  );
  const yb = tab([[1.9, 0.13], [2.15, 0.15]], z);
  const ya = arch ? archY(FA, z) : null;
  const yf = ya === null ? h : Math.max(h, ya + 0.07);
  const ys = Math.max(yf - 0.06, (ya ?? yb) + 0.05);
  const yc = h - 0.03;
  const R: P2[] = [[0, yc], [wh, yc], [wh, yf], [ww - bw, yf], [ww, ys], ...lower(ww, ys, yb, ya)];
  return mirrorClosed(R);
}

function tubPath(z: number): P2[] {
  const lip = tubLip(z);
  const ww = 0.985;
  const ys = lip - 0.06;
  return mirrorOpen([[0.64, lip], [0.86, lip], [ww, ys], ...lower(ww, ys, 0.13, null)]);
}

function tailPath(z: number, arch: boolean): P2[] {
  const lip = tab(TAIL_LIP, z);
  const ww = tab(
    [
      [-2.25, 0.92],
      [-2.05, 0.985],
      [-1.8, 1.03],
      [-1.4, 1.035],
      [-0.95, 1.02],
    ],
    z,
  );
  const yb = tab([[-2.25, 0.32], [-1.9, 0.14]], z);
  const ya = arch ? archY(RA, z) : null;
  const ys = Math.max(lip - 0.07, (ya ?? yb) + 0.05);
  return mirrorOpen([[0.7, lip], [0.86, lip], [ww, ys], ...lower(ww, ys, yb, ya)]);
}

type St = { z: number; arch: boolean };
const FRACS = [1, 0.78, 0.46, 0, -0.46, -0.78, -1];
function stationsFor(a: { z: number; r: number }, pre: number[], post: number[]): St[] {
  const out: St[] = [];
  for (const z of pre) out.push({ z, arch: false });
  out.push({ z: a.z + a.r, arch: false });
  for (const f of FRACS) out.push({ z: a.z + f * a.r, arch: true });
  out.push({ z: a.z - a.r, arch: false });
  for (const z of post) out.push({ z, arch: false });
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
const GLASS_TEX = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="128" height="9" fill="#0d2230"/>
  <rect x="0" y="0" width="128" height="3" fill="#06131c"/>
  <rect x="0" y="0" width="4" height="64" fill="#0d2230"/>
  <rect x="124" y="0" width="4" height="64" fill="#0d2230"/>
  <rect x="0" y="60" width="128" height="4" fill="#0d2230"/>
  <polygon points="22,60 38,60 80,9 64,9" fill="#8ad8ea"/>
  <polygon points="52,60 58,60 100,9 94,9" fill="#6cbfd4"/>
  <polygon points="84,60 88,60 124,24 124,18" fill="#6cbfd4"/>
</svg>`,
  { size: 256 },
);

const GRILLE_TEX = svg(
  `<svg viewBox="0 0 96 24" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="h" width="6" height="10.4" patternUnits="userSpaceOnUse">
    <path d="M3 0.2 L5.8 1.8 L5.8 5.0 L3 6.6 L0.2 5.0 L0.2 1.8Z" fill="#0b0c0f" stroke="#444a54" stroke-width="0.9"/>
    <path d="M0 5.4 L0 8.6 M6 5.4 L6 8.6" stroke="#444a54" stroke-width="0.9"/>
    <path d="M0.2 8.6 L3 7 L5.8 8.6 L5.8 10 L3 11.6 L0.2 10Z" fill="#0b0c0f" stroke="#444a54" stroke-width="0.9"/>
  </pattern></defs>
  <rect width="96" height="24" fill="#0b0c0f"/>
  <rect width="96" height="24" fill="url(#h)"/>
  <rect x="0" y="0" width="96" height="2" fill="#16d4ea"/>
</svg>`,
  { size: 384 },
);

const GAUGE_TEX = svg(
  `<svg viewBox="0 0 128 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="40" rx="5" fill="#0d0e11"/>
  <circle cx="26" cy="21" r="16" fill="#14161b" stroke="#454b57" stroke-width="2"/>
  <circle cx="26" cy="21" r="12" fill="none" stroke="#e9eef5" stroke-width="2.4" stroke-dasharray="2 3.2"/>
  <path d="M26 21 L16 29" stroke="#ff6a13" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="102" cy="21" r="16" fill="#14161b" stroke="#454b57" stroke-width="2"/>
  <circle cx="102" cy="21" r="12" fill="none" stroke="#e9eef5" stroke-width="2.4" stroke-dasharray="2 3.2"/>
  <path d="M102 21 L111 11" stroke="#ff6a13" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="46" y="8" width="36" height="24" rx="3" fill="#06262c" stroke="#14d2e8" stroke-width="1.6"/>
  <text x="64" y="26" font-family="Arial, sans-serif" font-weight="bold" font-size="15" text-anchor="middle" fill="#2cf0ff">186</text>
  <rect x="50" y="11" width="28" height="3" fill="#14d2e8"/>
  <circle cx="26" cy="21" r="3" fill="#ff6a13"/><circle cx="102" cy="21" r="3" fill="#ff6a13"/>
</svg>`,
  { size: 512 },
);

const SCREEN_TEX = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="40" rx="3" fill="#06191e"/>
  <path d="M4 30 L16 20 L26 25 L40 10 L60 18" fill="none" stroke="#2cf0ff" stroke-width="2"/>
  <rect x="5" y="5" width="22" height="5" fill="#14d2e8"/>
  <rect x="34" y="5" width="25" height="3" fill="#0b8fa0"/>
  <circle cx="14" cy="34" r="2.2" fill="#ff6a13"/><circle cx="24" cy="34" r="2.2" fill="#ffb01f"/>
</svg>`,
  { size: 256 },
);

const PLATE_TEX = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="60" rx="6" fill="#f3f0e2"/>
  <rect x="3" y="3" width="114" height="54" rx="4" fill="none" stroke="#1b1d22" stroke-width="2.4"/>
  <rect x="3" y="3" width="14" height="54" rx="3" fill="#1d4fb8"/>
  <text x="70" y="41" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="23" text-anchor="middle" fill="#1b1d22">WEDGE</text>
</svg>`,
  { size: 384 },
);

const ROUNDEL_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#f6f6f2"/>
  <circle cx="32" cy="32" r="30" fill="none" stroke="#14d2e8" stroke-width="3"/>
  <text x="32" y="43" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="32" text-anchor="middle" fill="#17181c">07</text>
</svg>`,
  { size: 192 },
);

const TAIL_TEX = svg(
  `<svg viewBox="0 0 160 10" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="10" fill="#e2262b"/>
  <rect x="0" y="3.5" width="160" height="3" fill="#ff6b5a"/>
  <g fill="#6c0f14">
    <rect x="6" width="2.6" height="10"/><rect x="14" width="2.6" height="10"/><rect x="22" width="2.6" height="10"/>
    <rect x="30" width="2.6" height="10"/><rect x="38" width="2.6" height="10"/><rect x="46" width="2.6" height="10"/>
    <rect x="54" width="2.6" height="10"/><rect x="62" width="2.6" height="10"/><rect x="70" width="2.6" height="10"/>
    <rect x="78" width="2.6" height="10"/><rect x="86" width="2.6" height="10"/><rect x="94" width="2.6" height="10"/>
    <rect x="102" width="2.6" height="10"/><rect x="110" width="2.6" height="10"/><rect x="118" width="2.6" height="10"/>
    <rect x="126" width="2.6" height="10"/><rect x="134" width="2.6" height="10"/><rect x="142" width="2.6" height="10"/>
    <rect x="150" width="2.6" height="10"/>
  </g>
</svg>`,
  { size: 640 },
);

const LAMP_TEX = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="15" fill="#e2262b"/>
  <circle cx="16" cy="16" r="10" fill="#ff5148"/>
  <circle cx="16" cy="16" r="5" fill="#ffd2c2"/>
  <path d="M16 1 L16 31 M1 16 L31 16" stroke="#7a1015" stroke-width="1.4"/>
</svg>`,
  { size: 128 },
);

const HEAD_TEX = svg(
  `<svg viewBox="0 0 96 40" xmlns="http://www.w3.org/2000/svg">
  <polygon points="2,34 10,4 94,8 90,36" fill="#cfeaf4"/>
  <polygon points="2,34 10,4 94,8 90,36" fill="none" stroke="#0d2230" stroke-width="3"/>
  <circle cx="30" cy="22" r="11" fill="#ffffff" stroke="#0d2230" stroke-width="3"/>
  <circle cx="30" cy="22" r="5" fill="#bfe9ff"/>
  <rect x="50" y="14" width="38" height="5" fill="#ffffff"/>
  <rect x="50" y="24" width="34" height="5" fill="#ffffff"/>
</svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "wedgeSupercar", paintSize: 2048 });
  const CHROME = "#e6eaf0";

  // ---- joints
  const body = b.joint("body", { at: [0, 0.4, 0], dir: [0, 0, 1] });
  const wheelY = (a: { R: number }) => a.R - WHEEL_SINK;
  const steerL = b.joint("steerL", { parent: body, at: [FA.x, wheelY(FA), FA.z], dir: [0, 1, 0], role: "hinge" });
  const steerR = b.joint("steerR", { parent: body, at: [-FA.x, wheelY(FA), FA.z], dir: [0, 1, 0], role: "hinge" });
  const hood = b.joint("hood", { parent: body, at: [0, 0.82, 0.66], dir: [0, 0, 1], role: "hinge" });
  const engineLid = b.joint("engineLid", { parent: body, at: [0, 0.9, -2.16], dir: [0, 0, -1], role: "hinge" });
  const doorL = b.joint("doorL", { parent: body, at: [0.93, 0.8, 0.47], dir: [0, 0, 1], role: "hinge" });
  const doorR = b.joint("doorR", { parent: body, at: [-0.93, 0.8, 0.47], dir: [0, 0, 1], role: "hinge" });
  const WING = { y: 1.0, z: -2.0, flapZ: -2.15, flapY: 1.037 };
  const wingFlap = b.joint("wingFlap", {
    parent: body,
    at: [0, WING.flapY, WING.flapZ + 0.1],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const colDir: V = [0, 0.45, -0.89];
  const hub: V = [0.38, 0.8, 0.2];
  const steeringWheel = b.joint("steeringWheel", { parent: body, at: hub, dir: colDir, role: "hinge" });

  // ---- bins: static pieces on one bone and colour merge into one part
  type Bin = { bone: Joint; color: string | Paint; geos: THREE.BufferGeometry[]; glow: number };
  const bins = new Map<string, Bin>();
  const addBin = (bone: Joint, color: string | Paint, geo: THREE.BufferGeometry, glowK: number) => {
    const key = `${bone.name}|${String(color)}|${glowK}`;
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { bone, color, geos: [], glow: glowK }));
    bin.geos.push(norm(geo));
  };
  const put = (bone: Joint, color: string | Paint, geo: THREE.BufferGeometry | THREE.BufferGeometry[], glowK = 0) => {
    for (const g of Array.isArray(geo) ? geo : [geo]) {
      if (color !== bodyP) addBin(bone, color, g, glowK);
      else for (const [c, sub] of splitFlat(g)) addBin(bone, c === "paint" ? bodyP : c, sub, 0);
    }
  };
  const flush = () => {
    for (const bin of bins.values()) {
      const merged = mergeGeometries(bin.geos);
      if (!merged) throw new Error("merge failed for " + bin.bone.name);
      const part = b.part(merged, bin.color, { bone: bin.bone, at: [0, 0, 0], flat: true });
      if (bin.glow > 0) glow(part, bin.glow);
    }
  };
  const tex = (bone: Joint, geo: THREE.BufferGeometry, texture: THREE.Texture, glowK = 0) => {
    const part = b.part(geo, "#ffffff", { bone, at: [0, 0, 0], texture });
    if (glowK > 0) glow(part, glowK);
    return part;
  };
  const decalPlane = (
    bone: Joint,
    w: number,
    h: number,
    at: V,
    dir: V,
    texture: THREE.Texture,
    glowK = 0,
  ) => {
    const n = vec(dir).normalize();
    const right = new THREE.Vector3().crossVectors(n.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(n, right);
    const corner = (sx: number, sy: number): V => {
      const q = vec(at).addScaledVector(right, (sx * w) / 2).addScaledVector(up, (sy * h) / 2);
      return [q.x, q.y, q.z];
    };
    return tex(bone, quad(corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)), texture, glowK);
  };

  // ---- the body paint
  const bodyP = paint((p, n) => {
    const ax = Math.abs(p.x);
    const flat = flatClass(p.x, p.y, p.z, n.x, n.y, n.z);
    if (flat) return flat;
    if (p.z < -2.2 && n.z < -0.6) {
      if (p.y < 0.5) return CARBON;
      if (p.y < 0.525) return CYAN;
      return p.y < 0.66 && ax < 0.95 ? GRAPH : ORG;
    }
    if (p.z > 2.1 && n.z > 0.6 && p.y < 0.2) return GRAPH;
    if (ax > 0.95 && Math.abs(n.z) > 0.85 && p.z < 0.52 && p.z > -0.6 && p.y < 0.85 && p.y > 0.25) return "#2a0f05";
    if (ax > 0.55 && p.y < 0.215) return GRAPH;
    if (ax > 0.55 && p.y < 0.232) return CYAN;
    if (n.y > 0.35) {
      if (ax < 0.15) return "#24262d";
      if (ax > 0.172 && ax < 0.19) return CYAN;
    }
    if (Math.abs(n.x) > 0.6 && p.z > -2.0 && p.z < 2.0) {
      const off = p.y - lipAt(p.z);
      if (off > -0.31 && off < -0.2 && p.y > 0.28) return "#24262d";
      if (off > -0.19 && off < -0.175) return CYAN;
    }
    return mix(ORG_D, ORG_L, smoothstep(0.2, 1.0, p.y));
  });

  // =============================================================================================================
  // BODY SHELLS
  const noseSt = stationsFor(FA, [2.15, 1.95, 1.8], [0.6]);
  put(
    body,
    bodyP,
    ringLoft(
      noseSt.map((s) => ({ z: s.z, ring: noseRing(s.z, s.arch) })),
      { front: true, back: true },
    ),
  );

  put(
    body,
    bodyP,
    ringLoft(
      [0.6, -0.95].map((z) => ({ z, ring: thick(tubPath(z), 0.035) })),
      { front: true, back: true },
    ),
  );

  const tailSt = stationsFor(RA, [-0.95], [-2.1, -2.25]);
  const tailStations = tailSt.map((s) => ({ z: s.z, ring: thick(tailPath(s.z, s.arch), 0.03) }));
  put(body, bodyP, ringLoft(tailStations, { front: true }));
  put(body, bodyP, capGeo(tailPath(-2.25, false), -2.25, -1));

  // roof panel
  const roofRing = (w: number, y: number): P2[] =>
    mirrorClosed([[0, y + 0.012], [w, y], [w + 0.015, y - 0.04], [w, y - 0.05]]);
  put(
    body,
    bodyP,
    ringLoft(
      [
        { z: -0.02, ring: roofRing(0.5, 1.09) },
        { z: -0.62, ring: roofRing(0.52, 1.08) },
      ],
      { front: true, back: true },
    ),
  );
  // roof scoop (engine air)
  const scoopRing = (h: number): P2[] => mirrorClosed([[0, h], [0.085, h - 0.006], [0.1, 1.09], [0.09, 1.06]]);
  put(
    body,
    CARBON,
    ringLoft(
      [
        { z: -0.27, ring: scoopRing(1.14) },
        { z: -0.5, ring: scoopRing(1.115) },
      ],
      { front: true, back: true },
    ),
  );
  put(body, BLACK, box(0.14, 0.035, 0.012, [0, 1.106, -0.2705]));

  // bulkhead and shelf behind the seats
  put(body, INT, box(1.56, 0.56, 0.04, [0, 0.43, -0.96]));
  put(body, INT_W, box(1.5, 0.03, 0.32, [0, 0.72, -0.8]));
  for (const s of [1, -1]) put(body, BLACK, box(0.26, 0.012, 0.16, [s * 0.4, 0.738, -0.8]));

  // hinge-free glass and pillars --------------------------------------------------------------------------------
  const ws = (u: number, v: number): V => {
    const bx = 0.8 * u;
    const tx = 0.5 * u;
    return [bx + (tx - bx) * v, 0.815 + (1.085 - 0.815) * v, 0.58 + (-0.02 - 0.58) * v];
  };
  tex(body, quad(ws(-1, 0), ws(1, 0), ws(1, 1), ws(-1, 1)), GLASS_TEX);
  const rg = (u: number, v: number): V => {
    const bx = 0.8 * u;
    const tx = 0.52 * u;
    return [bx + (tx - bx) * v, 0.93 + (1.077 - 0.93) * v, -1.02 + (-0.62 + 1.02) * v];
  };
  tex(body, quad(rg(-1, 0), rg(1, 0), rg(1, 1), rg(-1, 1)), GLASS_TEX);
  for (const s of [1, -1]) {
    // A-pillar, C-pillar buttress and sail panel
    put(body, bodyP, tube([s * 0.8, 0.815, 0.58], [s * 0.5, 1.088, -0.02], 0.03, 0.028, 5));
    put(body, bodyP, tube([s * 0.52, 1.075, -0.62], [s * 0.82, 0.935, -1.04], 0.032, 0.036, 5));
    put(body, bodyP, tube([s * 0.5, 1.088, -0.02], [s * 0.52, 1.078, -0.62], 0.025, 0.025, 5));
    put(
      body,
      bodyP,
      slabGeo(
        [
          [s * 0.535, 1.07, -0.62],
          [s * 0.84, 0.93, -1.05],
          [s * 0.9, 0.9, -1.03],
          [s * 0.87, 0.866, -0.58],
        ],
        0.025,
      ),
    );
    for (let i = 0; i < 4; i++) {
      const t = 0.22 + i * 0.17;
      const a: V = [s * (0.6 + 0.26 * t), 1.0 - 0.1 * t, -0.68 - 0.28 * t];
      put(body, BLACK, tube([a[0], a[1], a[2]], [a[0] + s * 0.04, a[1] - 0.045, a[2] - 0.02], 0.007, 0.007, 4));
    }
    // wipers
    const wl = (u: number, v: number): V => {
      const q = ws(u, v);
      return [q[0], q[1] + 0.009, q[2] + 0.004];
    };
    put(body, BLACK, tube(wl(s * 0.66, 0.045), wl(s * 0.1, 0.12), 0.0055, 0.0055, 4));
    put(body, BLACK, tube(wl(s * 0.64, 0.07), wl(s * 0.14, 0.145), 0.003, 0.003, 4));
  }
  // cowl vent, rear-view mirror
  put(body, BLACK, box(1.4, 0.014, 0.05, [0, 0.818, 0.625]));
  for (let i = 0; i < 12; i++) put(body, GRAPH, box(0.07, 0.016, 0.012, [-0.77 + i * 0.14, 0.826, 0.625]));
  put(body, BLACK, tube(ws(0, 0.9), [0, 1.0, 0.0], 0.008, 0.008, 4));
  put(body, BLACK, box(0.22, 0.05, 0.03, [0, 1.0, -0.02]));

  // =============================================================================================================
  // HOOD (hinged)
  const hoodW = (z: number) =>
    tab(
      [
        [1.5, 0.46],
        [1.8, 0.52],
        [2.15, 0.62],
      ],
      z,
    ) - 0.005;
  const hoodRing = (z: number): P2[] => {
    const y = hoodH(z);
    const w = hoodW(z);
    return mirrorClosed([[0, y + 0.008], [w, y], [w, y - 0.028]]);
  };
  put(
    hood,
    bodyP,
    ringLoft(
      [2.12, 1.6, 1.1, 0.67].map((z) => ({ z, ring: hoodRing(z) })),
      { front: true, back: true },
    ),
  );
  const hoodTilt = Math.atan(0.285) / (Math.PI / 180);
  const onHood = (x: number, z: number, lift = 0.004): V => [x, hoodH(z) + 0.008 * 0 + lift, z];
  for (const s of [1, -1]) {
    // louvred heat extractors
    for (let i = 0; i < 6; i++) {
      const z = 1.12 - i * 0.075 + 0.05;
      put(hood, BLACK, box(0.2 - i * 0.004, 0.02, 0.05, onHood(s * 0.27, z, 0.002), [hoodTilt, 0, 0]));
      put(hood, "#24262d", box(0.2 - i * 0.004, 0.012, 0.016, onHood(s * 0.27, z - 0.01, 0.019), [hoodTilt - 22, 0, 0]));
    }
    // hood pins
    put(hood, CARBON, cyl(0.016, 0.02, 6, onHood(s * 0.42, 0.86, 0.012), [hoodTilt, 0, 0]));
    put(hood, STEEL, cyl(0.007, 0.012, 6, onHood(s * 0.42, 0.86, 0.025), [hoodTilt, 0, 0]));
    put(hood, CARBON, cyl(0.016, 0.02, 6, onHood(s * 0.4, 1.9, 0.012), [hoodTilt, 0, 0]));
    put(hood, STEEL, cyl(0.007, 0.012, 6, onHood(s * 0.4, 1.9, 0.025), [hoodTilt, 0, 0]));
  }
  // radiator duct (centre) with fins
  put(hood, BLACK, box(0.5, 0.012, 0.22, onHood(0, 1.5, 0.003), [hoodTilt, 0, 0]));
  for (let i = 0; i < 6; i++) put(hood, GRAPH, box(0.5, 0.01, 0.012, onHood(0, 1.4 + i * 0.038, 0.012), [hoodTilt - 14, 0, 0]));
  // hood roundel
  decalPlane(hood, 0.2, 0.2, onHood(0, 1.0, 0.0105), [0, Math.cos(rad(hoodTilt)), Math.sin(rad(hoodTilt))], ROUNDEL_TEX);

  // =============================================================================================================
  // NOSE DETAILS
  put(body, CARBON, box(1.42, 0.028, 0.42, [0, 0.112, 1.95]));
  put(body, CARBON, box(1.3, 0.02, 0.09, [0, 0.108, 2.2]));
  put(body, CYAN, box(1.3, 0.008, 0.012, [0, 0.12, 2.246]));
  for (const s of [1, -1]) {
    put(body, CARBON, slabGeo([[s * 0.72, 0.12, 2.02], [s * 0.72, 0.12, 1.76], [s * 0.72, 0.27, 2.02]], 0.014));
    put(body, CYAN, slabGeo([[s * 0.735, 0.13, 1.99], [s * 0.735, 0.13, 1.8], [s * 0.735, 0.235, 1.99]], 0.01));
    // fender vents behind the wheel arch
    for (let i = 0; i < 4; i++) put(body, BLACK, box(0.012, 0.02, 0.17, [s * 0.9875 + s * 0.0, 0.5 + i * 0.045, 0.76], [0, 0, 0]));
    // headlight units on the nose edge
    const hl: V = onHood(s * 0.665, 1.9, 0.003);
    put(body, BLACK, box(0.3, 0.014, 0.24, hl, [hoodTilt, 0, 0]));
    // front side markers
    put(body, AMBER, box(0.012, 0.03, 0.07, [s * 0.865, 0.37, 1.97]), 1.3);
    // tow hook
  }
  decalPlane(body, 0.99, 0.2, [0, 0.27, 2.156], [0, 0, 1], GRILLE_TEX);
  put(body, CYAN_D, place(new THREE.TorusGeometry(0.035, 0.008, 5, 8), [0.33, 0.2, 2.16]));
  for (const s of [1, -1]) {
    put(body, BLACK, cylZ(0.05, 0.03, 8, [s * 0.6, 0.23, 2.14]));
    put(body, CYAN, cylZ(0.058, 0.01, 8, [s * 0.6, 0.23, 2.158]));
    put(body, WHITE_L, cylZ(0.04, 0.012, 8, [s * 0.6, 0.23, 2.164]), 1.4);
  }
  for (const s of [1, -1]) {
    const lampAt = (dx: number, dz: number): V => [s * 0.665 + dx, hoodH(1.9 + dz) + 0.012, 1.9 + dz];
    tex(body, quad(lampAt(-s * 0.15, -0.12), lampAt(s * 0.15, -0.12), lampAt(s * 0.15, 0.12), lampAt(-s * 0.15, 0.12)), HEAD_TEX, 1.5);
  }

  // =============================================================================================================
  // DOORS (scissor): shell loft per side with window frame, glass, mirror, handle
  const doorPath = (s: number, z: number): P2[] => {
    const lip = tubLip(z);
    const ys = lip - 0.06;
    const lo = lower(0.985, ys, 0.13, null);
    const pts: P2[] = [[0.86 + 0.012, lip + 0.003], [0.985 + 0.012, ys], [lo[0][0] + 0.012, lo[0][1]], [lo[1][0] + 0.012, lo[1][1]]];
    return pts.map(([x, y]): P2 => [s * x, y]);
  };
  for (const [s, dj] of [[1, doorL], [-1, doorR]] as const) {
    put(
      dj,
      bodyP,
      ringLoft(
        [0.5, -0.58].map((z) => ({ z, ring: thick(doorPath(s, z), s * 0.03) })),
        { front: true, back: true },
      ),
    );
    // window frame rods and glass on the door
    const FB: V = [s * 0.763, 0.851, 0.5];
    const FT: V = [s * 0.5, 1.085, -0.02];
    const RT: V = [s * 0.52, 1.078, -0.6];
    const RB: V = [s * 0.865, 0.866, -0.575];
    tex(dj, quad(FB, RB, RT, FT), GLASS_TEX);
    put(dj, bodyP, tube([FB[0], FB[1], FB[2]], [RB[0], RB[1], RB[2]], 0.02, 0.02, 5));
    put(dj, bodyP, tube([RB[0], RB[1], RB[2]], [RT[0], RT[1], RT[2]], 0.022, 0.022, 5));
    put(dj, BLACK, tube([FB[0], FB[1], FB[2]], [FT[0], FT[1], FT[2]], 0.012, 0.012, 4));
    // handle: recessed pocket + pull
    put(dj, BLACK, box(0.014, 0.05, 0.2, [s * 1.0, 0.68, -0.23]));
    put(dj, CHROME, box(0.012, 0.014, 0.15, [s * 1.0055, 0.68, -0.23]));
    // mirror
    put(dj, BLACK, tube([s * 0.9, 0.87, 0.4], [s * 1.04, 0.915, 0.37], 0.017, 0.015, 5));
    put(dj, bodyP, ringLoft(
      [
        { z: 0.46, ring: mirrorRing(s, 0.04) },
        { z: 0.28, ring: mirrorRing(s, 0.065) },
      ],
      { front: true, back: true },
    ));
    put(dj, BLACK, box(0.012, 0.075, 0.11, [s * 1.0, 0.925, 0.31]), 0);
    put(dj, AMBER, box(0.01, 0.014, 0.05, [s * 1.12, 0.945, 0.37]), 1.2);
    // roundel
    decalPlane(dj, 0.26, 0.26, [s * 1.0085, 0.5, 0.06], [s, 0, 0], ROUNDEL_TEX);
  }

  // =============================================================================================================
  // SIDE INTAKES, SKIRTS, ARCH TRIM, SHOULDER DETAILS
  for (const s of [1, -1]) {
    put(body, BLACK, slabGeo([[s * 0.998, 0.62, -0.62], [s * 1.002, 0.62, -0.93], [s * 1.002, 0.38, -0.93], [s * 1.0, 0.38, -0.62]], 0.012));
    for (let i = 0; i < 4; i++) put(body, GRAPH, box(0.012, 0.012, 0.3, [s * 1.003, 0.57 - i * 0.055, -0.775], [0, 0, 0]));
    put(body, CARBON, box(0.05, 0.034, 1.6, [s * 0.955, 0.16, 0.0]));
    put(body, CYAN, box(0.01, 0.01, 1.6, [s * 0.985, 0.19, 0.0]));
    // arch trim
    for (const [a, ww] of [[FA, 0.953], [RA, 1.005]] as const) {
      const pts: V[] = [];
      for (const f of FRACS) {
        const z = a.z + f * a.r;
        pts.push([s * ww, archY(a, z) + 0.006, z]);
      }
      put(body, CARBON, tubeChain(pts, 0.012, 5));
    }
    // fuel cap
    if (s === 1) {
      put(body, CARBON, place(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 8), [1.037, 0.66, -1.62], [0, 0, 90]));
      put(body, CYAN, place(new THREE.CylinderGeometry(0.036, 0.036, 0.016, 8), [1.04, 0.66, -1.62], [0, 0, 90]));
    }
    // rear side markers
    put(body, RED, box(0.012, 0.03, 0.07, [s * 0.935, 0.52, -2.2]), 1.1);
    // inner liner panels behind the wheels
    put(body, BLACK, box(0.03, 0.42, 0.7, [s * 0.57, 0.22, FA.z]));
    put(body, BLACK, box(0.03, 0.66, 0.8, [s * 0.57, 0.35, RA.z]));
  }

  // =============================================================================================================
  // REAR: lights, plate, exhaust, diffuser
  tex(body, quad([0.78, 0.7, -2.264], [-0.78, 0.7, -2.264], [-0.78, 0.762, -2.264], [0.78, 0.762, -2.264]), TAIL_TEX, 1.2);
  put(body, BLACK, box(1.62, 0.085, 0.01, [0, 0.731, -2.253]));
  for (const s of [1, -1]) {
    for (const [x, y] of [[0.62, 0.6], [0.8, 0.6]] as const) {
      put(body, BLACK, cylZ(0.072, 0.012, 8, [s * x, y, -2.256]));
      decalPlane(body, 0.12, 0.12, [s * x, y, -2.27], [0, 0, -1], LAMP_TEX, 1.2);
    }
    put(body, WHITE_L, box(0.08, 0.03, 0.01, [s * 0.5, 0.63, -2.258]), 1.2);
  }
  put(body, BLACK, box(0.46, 0.2, 0.01, [0, 0.62, -2.256]));
  decalPlane(body, 0.34, 0.17, [0, 0.62, -2.27], [0, 0, -1], PLATE_TEX);
  for (const x of [-0.5, -0.34, 0.34, 0.5]) {
    put(body, TITAN, cylZ(0.052, 0.2, 8, [x, 0.42, -2.25]));
    put(body, BLACK, cylZ(0.04, 0.012, 8, [x, 0.42, -2.357]));
    put(body, STEEL, cylZ(0.056, 0.02, 8, [x, 0.42, -2.35]));
  }
  // diffuser
  put(body, CARBON, box(1.5, 0.02, 0.45, [0, 0.31, -2.03], [-8, 0, 0]));
  for (let i = -3; i <= 3; i++) put(body, GRAPH, box(0.018, 0.14, 0.42, [i * 0.2, 0.22, -2.05], [-8, 0, 0]));
  put(body, CYAN, box(1.4, 0.008, 0.012, [0, 0.321, -2.262]));
  // third brake light, rear fog
  put(body, RED, box(0.5, 0.012, 0.03, [0, 0.905, -2.2]), 1.0);
  // rear fender louvres on the shoulder bevel
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = -1.5 - i * 0.1;
      const lip = tab(TAIL_LIP, z);
      const ww = tab([[-2.25, 0.92], [-2.05, 0.985], [-1.8, 1.03], [-1.4, 1.035]], z);
      const ys = lip - 0.07;
      const x = (0.86 + ww) / 2 + 0.01;
      const y = lip + ((ys - lip) * (x - 0.86)) / (ww - 0.86) + 0.004;
      const slope = (Math.atan2(lip - ys, ww - 0.86) * 180) / Math.PI;
      put(body, BLACK, box(0.07, 0.01, 0.06, [s * x, y, z], [0, 0, -s * slope]));
    }
  }
  // fasteners: splitter bolts, wing endplate bolts, rear tow loop
  for (let i = 0; i < 6; i++) put(body, STEEL, cyl(0.012, 0.012, 6, [-0.6 + i * 0.24, 0.128, 1.82]));
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) put(body, STEEL, cylX(0.009, 0.01, 6, [s * 0.879, WING.y + 0.03 + (i % 2) * 0.04, WING.z - 0.2 + i * 0.1]));
  put(body, CYAN_D, place(new THREE.TorusGeometry(0.04, 0.009, 5, 8), [-0.33, 0.3, -2.262]));

  // =============================================================================================================
  // ENGINE LID (hinged louvres)
  for (let i = 0; i < 7; i++) {
    const z = -1.02 - i * 0.175;
    const y = tab(TAIL_LIP, z) + 0.008;
    for (const s of [1, -1]) put(engineLid, bodyP, box(0.6, 0.014, 0.085, [s * 0.51, y, z], [-14, 0, 0]));
  }
  for (const s of [1, -1]) {
    put(engineLid, CARBON, box(0.04, 0.03, 1.22, [s * 0.2, 0.915, -1.55]));
    put(engineLid, CARBON, box(0.05, 0.018, 1.2, [s * 0.82, 0.935, -1.55]));
  }

  // =============================================================================================================
  // ENGINE BAY
  const ezc = -1.46;
  put(body, GRAPH, box(0.42, 0.3, 0.64, [0, 0.4, ezc]));
  for (const s of [1, -1]) {
    const rot: V = [0, 0, -s * 38];
    const ctr: V = [s * 0.17, 0.58, ezc];
    put(body, STEEL, box(0.17, 0.17, 0.6, ctr, rot));
    const nrm = new THREE.Vector3(s * Math.sin(rad(38)), Math.cos(rad(38)), 0);
    const cc: V = [ctr[0] + nrm.x * 0.1, ctr[1] + nrm.y * 0.1, ezc];
    put(body, ORG, box(0.14, 0.035, 0.56, cc, rot));
    put(body, BLACK, box(0.05, 0.039, 0.5, cc, rot));
    // exhaust headers
    const hp: V[] = [
      [s * 0.31, 0.55, ezc + 0.2],
      [s * 0.37, 0.45, ezc + 0.28],
      [s * 0.38, 0.32, ezc - 0.05],
      [s * 0.33, 0.3, ezc - 0.35],
      [s * 0.3, 0.3, -1.95],
    ];
    put(body, TITAN, tubeChain(hp, 0.028, 6));
    const hp2: V[] = [
      [s * 0.32, 0.55, ezc - 0.2],
      [s * 0.4, 0.42, ezc - 0.25],
      [s * 0.37, 0.3, ezc - 0.4],
    ];
    put(body, TITAN, tubeChain(hp2, 0.026, 6));
    put(body, STEEL, cylZ(0.085, 0.5, 8, [s * 0.34, 0.31, -1.9]));
    put(body, TITAN, tubeChain([[s * 0.34, 0.31, -2.1], [s * 0.42, 0.4, -2.24]], 0.04, 6));
    // axles
    put(body, STEEL, cylX(0.022, 0.58, 6, [s * 0.4, 0.34, RA.z]));
    // coil-over dampers (rear): shaft + spring
    const top: V = [s * 0.5, 0.74, RA.z + 0.05];
    const bot: V = [s * 0.68, 0.24, RA.z + 0.08];
    put(body, CYAN_D, tube(bot, top, 0.018, 0.018, 6));
    const spring: V[] = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      const a = t * Math.PI * 2 * 4;
      const px = bot[0] + (top[0] - bot[0]) * (0.18 + 0.7 * t);
      const py = bot[1] + (top[1] - bot[1]) * (0.18 + 0.7 * t);
      const pz = bot[2] + (top[2] - bot[2]) * (0.18 + 0.7 * t);
      spring.push([px + Math.cos(a) * 0.045, py, pz + Math.sin(a) * 0.045]);
    }
    put(body, CYAN, tubeChain(spring, 0.007, 4, true));
    // wishbones rear
    for (const dz of [-0.2, 0.22]) {
      put(body, DSTEEL, tube([s * 0.4, 0.22, RA.z + dz], [s * 0.74, 0.24, RA.z], 0.014, 0.014, 5));
      put(body, DSTEEL, tube([s * 0.42, 0.52, RA.z + dz * 0.8], [s * 0.74, 0.5, RA.z], 0.012, 0.012, 5));
    }
  }
  put(body, TITAN, cyl(0.03, 0.2, 6, [0, 0.31, -1.95], [0, 0, 90]));
  // plenum and trumpets
  put(body, ALU, box(0.22, 0.09, 0.46, [0, 0.745, ezc]));
  for (let i = 0; i < 4; i++) {
    for (const s of [1, -1]) {
      put(body, ALU, cyl(0.04, 0.075, 8, [s * 0.065, 0.83, ezc - 0.17 + i * 0.113], undefined, 0.052));
      put(body, "#2e3138", cyl(0.032, 0.012, 8, [s * 0.065, 0.872, ezc - 0.17 + i * 0.113]));
    }
  }
  // gearbox, belts, brace
  put(body, GRAPH, cylZ(0.12, 0.3, 8, [0, 0.34, -1.12]));
  put(body, STEEL, cylZ(0.14, 0.06, 8, [0, 0.34, -1.2]));
  for (const [x, y, r] of [[0.0, 0.37, 0.07], [0.16, 0.5, 0.05], [-0.16, 0.5, 0.05]] as const) put(body, DSTEEL, cylZ(r, 0.03, 10, [x, y, ezc + 0.34]));
  put(body, CARBON, tube([-0.72, 0.7, -1.8], [0.72, 0.7, -1.8], 0.018, 0.018, 6));
  put(body, CYAN_D, box(0.2, 0.12, 0.16, [0.4, 0.27, -1.78]));
  put(body, CYAN_D, tube([0.1, 0.5, ezc + 0.3], [0.33, 0.28, -1.1], 0.016, 0.016, 5));

  // =============================================================================================================
  // INTERIOR
  const seatParts = (x: number) => {
    const out: { c: string; g: THREE.BufferGeometry }[] = [];
    // cushion
    const cush: THREE.BufferGeometry[] = [box(0.44, 0.1, 0.5, [0, 0, 0]), box(0.07, 0.07, 0.46, [0.2, 0.05, 0.0]), box(0.07, 0.07, 0.46, [-0.2, 0.05, 0.0])];
    for (const g of cush) place(g, [x, 0.285, -0.3], [-7, 0, 0]);
    out.push(...cush.map((g) => ({ c: SEAT, g })));
    const ins = box(0.24, 0.012, 0.4, [0, 0.056, 0]);
    place(ins, [x, 0.285, -0.3], [-7, 0, 0]);
    out.push({ c: SEAT_I, g: ins });
    const stitch = [box(0.01, 0.014, 0.4, [0.125, 0.057, 0]), box(0.01, 0.014, 0.4, [-0.125, 0.057, 0])];
    for (const g of stitch) place(g, [x, 0.285, -0.3], [-7, 0, 0]);
    out.push(...stitch.map((g) => ({ c: CYAN, g })));
    // back
    const back: THREE.BufferGeometry[] = [box(0.44, 0.6, 0.1, [0, 0, 0]), box(0.07, 0.5, 0.13, [0.2, 0.0, 0.02]), box(0.07, 0.5, 0.13, [-0.2, 0.0, 0.02])];
    const head: THREE.BufferGeometry[] = [box(0.25, 0.2, 0.09, [0, 0.4, 0.0])];
    const binS: THREE.BufferGeometry[] = [box(0.24, 0.5, 0.012, [0, -0.0, 0.056])];
    const stit: THREE.BufferGeometry[] = [box(0.01, 0.5, 0.014, [0.125, 0, 0.057]), box(0.01, 0.5, 0.014, [-0.125, 0, 0.057]), box(0.2, 0.01, 0.014, [0, 0.12, 0.057]), box(0.2, 0.01, 0.014, [0, -0.1, 0.057])];
    const slot: THREE.BufferGeometry[] = [box(0.16, 0.025, 0.012, [0, 0.4, 0.047])];
    const belt: THREE.BufferGeometry[] = [box(0.05, 0.7, 0.008, [0.1, 0.12, 0.062], [0, 0, 24])];
    for (const g of [...back, ...head, ...binS, ...stit, ...slot, ...belt]) place(g, [x, 0.61, -0.62], [-18, 0, 0]);
    out.push(...back.map((g) => ({ c: SEAT, g })), ...head.map((g) => ({ c: SEAT, g })));
    out.push(...binS.map((g) => ({ c: SEAT_I, g })), ...stit.map((g) => ({ c: CYAN, g })));
    out.push(...slot.map((g) => ({ c: BLACK, g })), ...belt.map((g) => ({ c: "#2f3138", g })));
    return out;
  };
  for (const x of [0.38, -0.38]) for (const { c, g } of seatParts(x)) put(body, c, g);
  // seat rails
  for (const x of [0.38, -0.38]) put(body, STEEL, box(0.3, 0.02, 0.6, [x, 0.18, -0.3]));

  // dash
  put(body, INT, box(1.56, 0.12, 0.3, [0, 0.74, 0.43], [-12, 0, 0]));
  put(body, GRAPH, box(1.56, 0.03, 0.14, [0, 0.8, 0.5], [-12, 0, 0]));
  put(body, INT_W, box(1.5, 0.3, 0.05, [0, 0.55, 0.57]));
  put(body, INT, box(0.36, 0.1, 0.14, [0.38, 0.835, 0.38]));
  decalPlane(body, 0.3, 0.094, [0.38, 0.835, 0.3085], [0, 0, -1], GAUGE_TEX, 0.9);
  put(body, GRAPH, box(0.24, 0.18, 0.1, [0, 0.69, 0.43], [-12, 0, 0]));
  decalPlane(body, 0.17, 0.106, [0, 0.7, 0.376], [0, 0.06, -1], SCREEN_TEX, 0.9);
  for (let i = 0; i < 3; i++) put(body, BLACK, box(0.05, 0.012, 0.02, [-0.06 + i * 0.06, 0.62, 0.382]));
  for (const x of [-0.35, 0.0, 0.7, -0.7]) put(body, BLACK, box(0.1, 0.012, 0.02, [x, 0.808, 0.3 + 0.02], [-12, 0, 0]));
  put(body, GRAPH, box(0.56, 0.22, 0.02, [-0.4, 0.66, 0.375], [-4, 0, 0]));
  put(body, BLACK, box(0.5, 0.02, 0.012, [-0.4, 0.7, 0.364]));
  // centre console + tunnel + shifter
  put(body, INT_W, box(0.28, 0.2, 1.1, [0, 0.27, -0.05]));
  put(body, GRAPH, box(0.26, 0.03, 0.46, [0, 0.38, 0.18]));
  put(body, BLACK, box(0.1, 0.012, 0.2, [0, 0.396, 0.16]));
  put(body, STEEL, tube([0, 0.4, 0.14], [0, 0.55, 0.12], 0.01, 0.01, 6));
  put(body, SILVER, place(new THREE.IcosahedronGeometry(0.03, 0), [0, 0.57, 0.12]));
  put(body, CYAN, cylZ(0.016, 0.01, 6, [0.07, 0.4, -0.03]));
  put(body, GRAPH, box(0.07, 0.03, 0.28, [0.0, 0.4, -0.35], [10, 0, 0]));
  put(body, CYAN, cylZ(0.02, 0.012, 6, [0.0, 0.405, -0.46]));
  // pedals, footrest
  for (const [x, w] of [[0.28, 0.06], [0.37, 0.05], [0.46, 0.05]] as const) {
    put(body, STEEL, box(w, 0.1, 0.012, [x, 0.34, 0.5], [-30, 0, 0]));
    put(body, BLACK, box(w - 0.01, 0.08, 0.016, [x, 0.34, 0.505], [-30, 0, 0]));
  }
  put(body, STEEL, box(0.14, 0.012, 0.18, [0.14, 0.28, 0.35], [-20, 0, 0]));
  // door cards
  for (const s of [1, -1]) {
    put(body, GRAPH, box(0.02, 0.2, 0.9, [s * 0.9, 0.62, -0.12]));
    put(body, CYAN, box(0.012, 0.012, 0.9, [s * 0.888, 0.725, -0.12]));
    put(body, BLACK, box(0.05, 0.02, 0.2, [s * 0.88, 0.58, -0.05]));
  }
  // rear hoop
  put(body, GRAPH, tubeChain([[0.62, 0.18, -0.82], [0.58, 0.78, -0.82], [0.4, 0.98, -0.82], [-0.4, 0.98, -0.82], [-0.58, 0.78, -0.82], [-0.62, 0.18, -0.82]], 0.022, 6));
  put(body, ORG, box(0.2, 0.05, 0.05, [0.0, 0.98, -0.82]));
  // floor mats
  put(body, "#0f1013", box(0.4, 0.008, 0.45, [0.38, 0.178, 0.25], [-10, 0, 0]));
  put(body, "#0f1013", box(0.4, 0.008, 0.45, [-0.38, 0.178, 0.25], [-10, 0, 0]));

  // steering wheel (hinged), column on the body
  const sdir = vec(colDir).normalize();
  const sq = aim(sdir, undefined, "z");
  const rim = new THREE.TorusGeometry(0.17, 0.016, 5, 14);
  rim.scale(1, 0.92, 1);
  rim.applyQuaternion(sq);
  rim.translate(hub[0], hub[1], hub[2]);
  put(steeringWheel, CARBON, rim);
  const hubG = new THREE.CylinderGeometry(0.05, 0.06, 0.05, 8);
  hubG.rotateX(Math.PI / 2);
  hubG.applyQuaternion(sq);
  hubG.translate(hub[0], hub[1], hub[2]);
  put(steeringWheel, GRAPH, hubG);
  const spokes: THREE.BufferGeometry[] = [];
  for (const ang of [90, 210, 330]) {
    const g = new THREE.BoxGeometry(0.17, 0.028, 0.012);
    g.translate(0.085, 0, 0);
    g.rotateZ(rad(ang));
    g.applyQuaternion(sq);
    g.translate(hub[0], hub[1], hub[2]);
    spokes.push(g);
  }
  put(steeringWheel, CARBON, spokes);
  const mark = new THREE.BoxGeometry(0.02, 0.03, 0.02);
  mark.translate(0, 0.17 * 0.92, 0);
  mark.applyQuaternion(sq);
  mark.translate(hub[0], hub[1], hub[2]);
  put(steeringWheel, CYAN, mark);
  const bump = new THREE.CylinderGeometry(0.028, 0.028, 0.012, 6);
  bump.rotateX(Math.PI / 2);
  bump.translate(0, 0, 0.03);
  bump.applyQuaternion(sq);
  bump.translate(hub[0], hub[1], hub[2]);
  put(steeringWheel, ORG, bump);
  put(body, GRAPH, tube([hub[0], hub[1], hub[2]], [0.38, 0.68, 0.42], 0.03, 0.036, 6));

  // =============================================================================================================
  // REAR WING
  const foil: P2[] = [[0.18, 0.0], [0.15, 0.022], [0.05, 0.036], [-0.08, 0.03], [-0.18, 0.008], [-0.18, 0.0], [-0.1, -0.012], [0.05, -0.014], [0.15, -0.007]];
  b.extrude(foil, { at: [0, WING.y, WING.z], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, bevel: 0.004, color: CARBON, bone: body, name: "wing.main" });
  b.extrude(
    [[0.1, 0.0], [0.07, 0.015], [-0.02, 0.026], [-0.1, 0.02], [-0.1, 0.0], [-0.02, -0.006]],
    { at: [0, WING.flapY, WING.flapZ], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.72, bevel: 0.003, color: ORG, bone: wingFlap, name: "wing.flap" },
  );
  put(wingFlap, CARBON, box(1.56, 0.022, 0.012, [0, WING.flapY + 0.02, WING.flapZ - 0.1]));
  put(wingFlap, CYAN, box(1.4, 0.006, 0.02, [0, WING.flapY + 0.027, WING.flapZ - 0.045]));
  for (const s of [1, -1]) {
    b.extrude(
      [[-0.28, -0.03], [0.24, -0.03], [0.24, 0.04], [0.1, 0.1], [-0.28, 0.115]],
      { at: [s * 0.865, WING.y, WING.z], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, color: ORG, bone: body, name: `wing.plate${s > 0 ? "L" : "R"}` },
    );
    put(body, CYAN, box(0.006, 0.016, 0.3, [s * 0.874, WING.y + 0.075, WING.z - 0.04]));
    put(body, CARBON, tube([s * 0.5, 0.9, -1.9], [s * 0.5, WING.y - 0.01, -1.95], 0.028, 0.02, 5));
    put(body, CARBON, tube([s * 0.5, 0.9, -2.1], [s * 0.5, WING.y - 0.01, -2.06], 0.028, 0.02, 5));
    put(body, GRAPH, box(0.1, 0.012, 0.22, [s * 0.5, 0.9, -2.0]));
  }

  // =============================================================================================================
  // WHEELS, BRAKES, SUSPENSION
  const tirePaint = (cx: number, cy: number, cz: number, s: number, R: number) =>
    paint((p, n) => {
      const dy = p.y - cy;
      const dz = p.z - cz;
      const r = Math.hypot(dy, dz);
      const a = (p.x - cx) * s;
      const ang = Math.atan2(dy, dz);
      if (Math.abs(n.x) > 0.55) {
        if (n.x * s > 0) {
          if (r > R - 0.06 && r < R - 0.053) return CYAN;
          if (r > R - 0.088 && r < R - 0.072) return ((ang / (Math.PI * 2)) * 48 + 48) % 1 < 0.5 ? "#4a4d57" : RUBBER;
          if (r > R - 0.05 && r < R - 0.026) return "#26272c";
        }
        return RUBBER;
      }
      const k = (((ang * 180) / Math.PI / 12) % 1 + 1) % 1;
      if (Math.abs(a) < 0.007 || Math.abs(Math.abs(a) - 0.048) < 0.005) return "#08080a";
      if (k < 0.1) return "#0c0c0e";
      return "#232328";
    });

  const makeWheel = (a: typeof FA, s: number, front: boolean) => {
    const cx = s * a.x;
    const cy = wheelY(a);
    const cz = a.z;
    const R = a.R;
    const w = a.w;
    const Rr = R - (front ? 0.088 : 0.095);
    const sideName = s > 0 ? "L" : "R";
    const parent: Joint = front ? (s > 0 ? steerL : steerR) : body;
    const wj = b.joint(`wheel${a.name}${sideName}`, { parent, at: [cx, cy, cz], dir: [0, 0, 1], role: "hinge" });
    const orient = <T extends THREE.BufferGeometry>(g: T) => {
      g.rotateZ(rad(-90 * s));
      g.translate(cx, cy, cz);
      return g;
    };
    const lathe = (pts: [number, number][], seg = 16) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    const cylA = (r: number, h: number, n: number, ax: number, ox = 0, oz = 0, r2?: number) =>
      new THREE.CylinderGeometry(r2 ?? r, r, h, n).translate(ox, ax, oz);
    // tire
    put(
      wj,
      tirePaint(cx, cy, cz, s, R),
      orient(lathe([[Rr - 0.005, -0.95 * w], [R - 0.035, -w], [R - 0.005, -0.78 * w], [R, -0.55 * w], [R, 0.55 * w], [R - 0.005, 0.78 * w], [R - 0.035, w], [Rr - 0.005, 0.95 * w]])),
    );
    // rim lip, barrel, hub
    put(wj, SILVER, orient(lathe([[Rr + 0.006, 0.9 * w], [Rr - 0.035, 0.9 * w]])));
    put(wj, DSTEEL, orient(lathe([[Rr - 0.012, 0.9 * w], [Rr - 0.012, -0.9 * w]])));
    put(wj, DSTEEL, orient(lathe([[Rr - 0.035, 0.9 * w], [Rr - 0.035, 0.6 * w]])));
    const hubA = 0.78 * w;
    put(wj, STEEL, orient(cylA(0.05, 0.03, 8, hubA + 0.012)));
    put(wj, CYAN, orient(cylA(0.026, 0.012, 8, hubA + 0.026)));
    for (let i = 0; i < 5; i++) {
      const an = (i / 5) * Math.PI * 2;
      put(wj, ALU, orient(cylA(0.009, 0.014, 6, hubA + 0.02, Math.cos(an) * 0.038, Math.sin(an) * 0.038)));
    }
    // brake disc + hat, caliper
    put(wj, STEEL, orient(cylA(Rr - 0.04, 0.022, 16, -0.02)));
    put(wj, DSTEEL, orient(cylA(Rr - 0.095, 0.012, 16, -0.012)));
    put(wj, GRAPH, orient(cylA(0.07, 0.08, 12, -0.045)));
    for (let i = 0; i < 8; i++) {
      const an = (i / 8) * Math.PI * 2;
      put(wj, BLACK, orient(cylA(0.007, 0.026, 5, -0.02, Math.cos(an) * (Rr - 0.095), Math.sin(an) * (Rr - 0.095))));
    }
    const cal = box(0.15, 0.07, 0.1, [0, -0.02, -(Rr - 0.065)]);
    put(parent, CYAN, orient(cal));
    put(parent, BLACK, orient(box(0.03, 0.074, 0.03, [0.02, -0.02, -(Rr - 0.065) + 0.03])));
    // spoke star
    const rh = 0.062;
    const rt = Rr - 0.02;
    const pol = (r: number, ang: number): [number, number] => [r * Math.cos(rad(ang)), r * Math.sin(rad(ang))];
    const star: [number, number][] = [];
    const nsp = front ? 5 : 6;
    const step = 360 / nsp;
    for (let i = 0; i < nsp; i++) {
      const th = 90 + i * step;
      star.push(pol(rh, th - 21), pol(rt - 0.012, th - 6), pol(rt, th - 3.5), pol(rt, th + 3.5), pol(rt - 0.012, th + 6), pol(rh, th + 21));
    }
    b.extrude(star, { at: [cx + s * hubA, cy, cz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.022, bevel: 0.004, detail: 0.5, color: SILVER, bone: wj, name: `spokes${a.name}${sideName}` });
    // accent edge ring on the spokes
    put(wj, CYAN_D, orient(lathe([[Rr - 0.02, 0.9 * w + 0.002], [Rr - 0.032, 0.9 * w + 0.002]])));
    return wj;
  };
  for (const s of [1, -1]) {
    makeWheel(FA, s, true);
    makeWheel(RA, s, false);
  }

  // front suspension, knuckles, arches
  for (const s of [1, -1]) {
    const st = s > 0 ? steerL : steerR;
    put(st, DSTEEL, box(0.05, 0.22, 0.1, [s * 0.69, wheelY(FA), FA.z]));
    put(st, STEEL, cylX(0.045, 0.06, 8, [s * 0.71, wheelY(FA), FA.z]));
    for (const dz of [-0.2, 0.2]) {
      put(body, DSTEEL, tube([s * 0.4, 0.2, FA.z + dz * 0.8], [s * 0.7, 0.2, FA.z], 0.014, 0.014, 5));
      put(body, DSTEEL, tube([s * 0.42, 0.48, FA.z + dz * 0.7], [s * 0.7, 0.44, FA.z], 0.012, 0.012, 5));
    }
    put(body, DSTEEL, tube([s * 0.4, 0.3, FA.z - 0.18], [s * 0.68, 0.32, FA.z - 0.1], 0.01, 0.01, 4));
    const topF: V = [s * 0.5, 0.62, FA.z - 0.02];
    const botF: V = [s * 0.64, 0.22, FA.z + 0.02];
    put(body, CYAN_D, tube(botF, topF, 0.016, 0.016, 6));
    const spr: V[] = [];
    for (let k = 0; k <= 22; k++) {
      const t = k / 22;
      const an = t * Math.PI * 2 * 4;
      const f = 0.2 + 0.68 * t;
      spr.push([botF[0] + (topF[0] - botF[0]) * f + Math.cos(an) * 0.04, botF[1] + (topF[1] - botF[1]) * f, botF[2] + (topF[2] - botF[2]) * f + Math.sin(an) * 0.04]);
    }
    put(body, CYAN, tubeChain(spr, 0.006, 4, true));
  }

  flush();
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
function mirrorRing(s: number, h: number): P2[] {
  const x = s * 1.07;
  return mirrorClosed([[0, 0.0 + h], [0.04, h * 0.8], [0.06, 0.0], [0.03, -h]]).map(([px, py]): P2 => [x + px, 0.915 + py]);
}
