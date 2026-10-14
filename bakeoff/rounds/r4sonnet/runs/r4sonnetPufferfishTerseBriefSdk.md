```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Pufferfish",
  description:
    "A fully inflated tropical pufferfish, about 40 cm long. The faceted body is a green, gold and cream mosaic with dark spots and pale flecks, covered in studded cream spines. It has big hooded golden eyes, a puckered coral mouth with separate upper and lower jaw and buck teeth, splayed orange pectoral fins, dorsal and anal fins, and a fanned tail. Joints: root, head, jaw, eyeL/eyeR, pectoralL/R, dorsal, anal, tail1-3, caudal.",
};

type Vec = THREE.Vector3;
type Pt2 = [number, number];
interface FinShape {
  outline: Pt2[];
  rays: [Pt2, Pt2][];
}

const V = (x: number, y: number, z: number): Vec => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const deg = THREE.MathUtils.degToRad;

// ---------------------------------------------------------------- palette
const COL = {
  belly: "#f6efcf",
  flankLow: "#ecd17a",
  flankHigh: "#b9bd4c",
  back: "#5e8c3b",
  spot: "#1f3320",
  fleck: "#c5dc7c",
  pedBelly: "#d8c690",
  pedLow: "#b99a3c",
  pedHigh: "#7f8c2e",
  pedBack: "#3b6128",
  spine: "#f8f1d2",
  spineBack: "#efe3ae",
  finPlate: "#f5c04e",
  finRay: "#d9822b",
  lip: "#e8825f",
  mouth: "#4a1d1a",
  teeth: "#fffbe6",
  eyeWhite: "#fffaf0",
  iris: "#f3b02a",
  pupil: "#16110e",
  glint: "#ffffff",
  blush: "#f2a38a",
  gill: "#27431f",
  nostril: "#3b3322",
  tailBand: "#2f5226",
};

// ------------------------------------------------------------- proportions
const RX = 0.105; // half width
const RY = 0.115; // half height
const RZ = 0.125; // half length
const BELLY = 1.06; // belly bulges a little below the equator
const EYE_R = 0.03;
const ryAt = (y: number) => (y < 0 ? RY * BELLY : RY);

// ---------------------------------------------------------------- helpers
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

function randDir(rand: () => number): Vec {
  const y = rand() * 2 - 1;
  const t = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - y * y);
  return V(r * Math.cos(t), y, r * Math.sin(t));
}

/** point and outward normal of the body ellipsoid in direction `dir` from the centre */
function surf(dir: Vec): { p: Vec; n: Vec } {
  const u = dir.clone().normalize();
  const ry = ryAt(u.y);
  const t = 1 / Math.sqrt((u.x / RX) ** 2 + (u.y / ry) ** 2 + (u.z / RZ) ** 2);
  const p = u.clone().multiplyScalar(t);
  const n = V(p.x / (RX * RX), p.y / (ry * ry), p.z / (RZ * RZ)).normalize();
  return { p, n };
}

/** azimuth from +Z toward the side, elevation up; side = +1 left (+X), -1 right */
function aeDir(azDeg: number, elDeg: number, side = 1): Vec {
  const az = deg(azDeg);
  const el = deg(elDeg);
  return V(side * Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
}

/** faceted look: unshared vertices, per-face normals */
function flat(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g;
  out.computeVertexNormals();
  return out;
}

/** rotate a geometry built around +Y so +Y points along n (hint picks the twist) */
function place(g: THREE.BufferGeometry, n: Vec, hint: Vec = UP): THREE.BufferGeometry {
  const y = n.clone().normalize();
  const z = hint.clone().addScaledVector(y, -hint.dot(y));
  if (z.lengthSq() < 1e-6) z.set(0, 0, 1).addScaledVector(y, -y.z);
  if (z.lengthSq() < 1e-6) z.set(1, 0, 0).addScaledVector(y, -y.x);
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return g;
}

function ell(rx: number, ry: number, rz: number, ws = 10, hs = 7): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return flat(g);
}

/** flattened dome (axis +Y) */
function lens(a: number, c: number, ws = 12, hs = 6): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(a, c, a);
  return flat(g);
}

/** tapered tube along Z, centred on the origin; the narrow end points to -Z */
function taper(rFront: number, rRear: number, len: number, sx: number, seg: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rRear, rFront, len, seg, 1);
  g.rotateX(-Math.PI / 2);
  g.scale(sx, 1, 1);
  return flat(g);
}

function finPlate(outline: Pt2[], thick: number): THREE.BufferGeometry {
  const shape = new THREE.Shape(outline.map(([u, v]) => new THREE.Vector2(u, v)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
  g.translate(0, 0, -thick / 2);
  return g;
}

function rayGeo(p0: Pt2, p1: Pt2, w: number, t: number): THREE.BufferGeometry {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const g = new THREE.BoxGeometry(Math.hypot(dx, dy), w, t);
  g.rotateZ(Math.atan2(dy, dx));
  g.translate((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 0);
  return g;
}

/** a scalloped fan (pectoral / caudal) in fin-local (u along the fin, v across) coordinates */
function fanShape(ox: number, R: number, a0: number, a1: number, rays: number, notch: number, baseHalf: number): FinShape {
  const outline: Pt2[] = [[ox, -baseHalf]];
  const rl: [Pt2, Pt2][] = [];
  const M = rays * 2;
  for (let k = 0; k <= M; k++) {
    const th = deg(a0 + ((a1 - a0) * k) / M);
    const c = Math.cos(th);
    const s = Math.sin(th);
    const r = k % 2 === 0 ? R : R * (1 - notch);
    outline.push([ox + c * r, s * r]);
    if (k % 2 === 0) rl.push([[ox + c * 0.008, s * 0.008], [ox + c * R * 0.9, s * R * 0.9]]);
  }
  outline.push([ox, baseHalf]);
  return { outline, rays: rl };
}

function scaleShape(sh: FinShape, su: number, sv: number): FinShape {
  const f = (p: Pt2): Pt2 => [p[0] * su, p[1] * sv];
  return { outline: sh.outline.map(f), rays: sh.rays.map(([a, c]) => [f(a), f(c)] as [Pt2, Pt2]) };
}

/** the body ellipsoid cut into faceted triangles, sorted into colour zones */
function bodyZones(zoneOf: (d: Vec) => number): { geo: THREE.BufferGeometry; zone: number }[] {
  const src = new THREE.SphereGeometry(1, 30, 20);
  src.rotateX(Math.PI / 2); // poles along Z, hidden by mouth and tail
  const g = src.toNonIndexed();
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const buckets: number[][] = [[], [], [], [], [], []];
  const t = [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)];
  for (let i = 0; i < pos.count; i += 3) {
    for (let k = 0; k < 3; k++) t[k].fromBufferAttribute(pos, i + k);
    const c = t[0].clone().add(t[1]).add(t[2]).normalize();
    const zn = zoneOf(c);
    for (let k = 0; k < 3; k++) buckets[zn].push(t[k].x * RX, t[k].y * ryAt(t[k].y), t[k].z * RZ);
  }
  const out: { geo: THREE.BufferGeometry; zone: number }[] = [];
  buckets.forEach((arr, zone) => {
    if (!arr.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((arr.length / 3) * 2).fill(0), 2));
    geo.computeVertexNormals();
    out.push({ geo, zone });
  });
  return out;
}

// -------------------------------------------------------------------- model
export default function build(): THREE.Object3D {
  const rand = mulberry32(90210);

  // ---- body pattern: dark spots and pale flecks on the upper half ----
  const spots: { c: Vec; cos: number }[] = [];
  for (let guard = 0; spots.length < 10 && guard < 600; guard++) {
    const c = randDir(rand);
    const rr = 0.18 + rand() * 0.12;
    if (c.y < -0.1 || spots.some((s) => s.c.dot(c) > 0.8)) continue;
    spots.push({ c, cos: Math.cos(rr) });
  }
  const flecks: { c: Vec; cos: number }[] = [];
  for (let guard = 0; flecks.length < 14 && guard < 600; guard++) {
    const c = randDir(rand);
    const rr = 0.1 + rand() * 0.05;
    if (c.y < 0.15 || flecks.some((s) => s.c.dot(c) > 0.88) || spots.some((s) => s.c.dot(c) > 0.93)) continue;
    flecks.push({ c, cos: Math.cos(rr) });
  }
  const zoneOf = (d: Vec): number => {
    const az = Math.atan2(d.x, d.z);
    const wob = 0.055 * Math.sin(5 * az + 0.7) + 0.035 * Math.sin(9 * az + 2.1);
    if (d.y > -0.12) for (const s of spots) if (d.dot(s.c) > s.cos) return 4;
    if (d.y > 0.12) for (const f of flecks) if (d.dot(f.c) > f.cos) return 5;
    if (d.y < -0.42 + wob) return 0;
    if (d.y < -0.06 + wob) return 1;
    if (d.y < 0.34 + wob) return 2;
    return 3;
  };

  // ---- features (centre-relative coordinates) ----
  const makeEye = (side: number) => {
    const s = surf(aeDir(48, 20, side));
    return { side, p: s.p, n: s.n, c: s.p.clone().addScaledVector(s.n, 0.008) };
  };
  const eyeL = makeEye(1);
  const eyeR = makeEye(-1);

  const makePect = (side: number) => {
    const s = surf(aeDir(100, -8, side));
    const A = s.p.clone().multiplyScalar(0.97);
    const out = V(side * Math.sin(deg(60)), 0, -Math.cos(deg(60)));
    return { side, A, out };
  };
  const pectL = makePect(1);
  const pectR = makePect(-1);

  const gillL = surf(aeDir(82, 3, 1));
  const gillR = surf(aeDir(82, 3, -1));
  const cheekL = surf(aeDir(36, -16, 1));
  const cheekR = surf(aeDir(36, -16, -1));

  const dz = -0.075;
  const topY = RY * Math.sqrt(1 - (dz / RZ) ** 2);
  const botY = RY * BELLY * Math.sqrt(1 - (dz / RZ) ** 2);
  const dorsalBase = V(0, topY - 0.005, dz);
  const analBase = V(0, -botY + 0.005, dz);

  // ---- spines: golden-spiral spread, skipping eyes, mouth, tail and fin footprints ----
  const keepOut: { c: Vec; r: number }[] = [
    { c: eyeL.p, r: 0.058 },
    { c: eyeR.p, r: 0.058 },
    { c: V(0, -0.02, 0.12), r: 0.066 },
    { c: V(0, 0, -RZ + 0.005), r: 0.052 },
    { c: gillL.p, r: 0.024 },
    { c: gillR.p, r: 0.024 },
    { c: cheekL.p, r: 0.028 },
    { c: cheekR.p, r: 0.028 },
  ];
  const blocked = (p: Vec): boolean => {
    if (keepOut.some((k) => k.c.distanceTo(p) < k.r)) return true;
    if (Math.abs(p.x) < 0.024 && p.z < -0.04 && p.z > -0.125 && Math.abs(p.y) > 0.05) return true;
    for (const pf of [pectL, pectR]) {
      if (p.x * pf.side > 0.05 && p.z < pf.A.z + 0.014 && p.z > pf.A.z - 0.05 && Math.abs(p.y - pf.A.y) < 0.05) return true;
    }
    return false;
  };

  interface Spine {
    p: Vec;
    n: Vec;
    dir: Vec;
    len: number;
  }
  const spines: Spine[] = [];
  const NS = 230;
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NS; i++) {
    const y = 1 - (2 * (i + 0.5)) / NS;
    const r = Math.sqrt(1 - y * y);
    const th = GA * i;
    const { p, n } = surf(V(Math.cos(th) * r, y, Math.sin(th) * r));
    const jitter = V(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.26);
    const lenRand = rand();
    if (blocked(p)) continue;
    const dir = n.clone().add(jitter).normalize();
    const len = (0.027 + lenRand * 0.008) * (p.z > 0.06 ? 0.88 : 1);
    spines.push({ p, n, dir, len });
  }

  // ---- stand on the floor: lowest spine tip rests at y ~ 0 ----
  let minY = -RY * BELLY;
  for (const s of spines) minY = Math.min(minY, s.p.y + s.dir.y * s.len);
  minY = Math.min(minY, analBase.y - 0.8 * 0.043);
  const cy = -minY - 0.002;

  // ================================================================ builder
  const b = createBuilder({ name: "pufferfish" });
  type Joint = ReturnType<typeof b.joint>;
  const W = (v: Vec): [number, number, number] => [v.x, v.y + cy, v.z];

  const makeJoint = (name: string, at: Vec, parent?: Joint): Joint => {
    if (!parent) return b.joint(name, { at: W(at) });
    try {
      return b.joint(name, { at: W(at), parent });
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return b.joint(name, { at: W(at), parent: (parent as any).name });
    }
  };
  const add = (geo: THREE.BufferGeometry, color: string, at: Vec, bone: Joint) => {
    try {
      return b.part(geo, color, { at: W(at), bone });
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return b.part(geo, color, { at: W(at), bone: (bone as any).name });
    }
  };
  const tag = (j: unknown, role: string) => {
    const o = j as { userData?: Record<string, unknown> } | undefined;
    if (o && o.userData) o.userData.role = role;
  };

  // ---------------------------------------------------------------- skeleton
  const O = V(0, 0, 0);
  const root = makeJoint("root", O);
  const head = makeJoint("head", V(0, -0.005, 0.085), root);
  const jaw = makeJoint("jaw", V(0, -0.034, 0.105), head);
  const eyeLJ = makeJoint("eyeL", eyeL.c, head);
  const eyeRJ = makeJoint("eyeR", eyeR.c, head);
  const pectLJ = makeJoint("pectoralL", pectL.A, root);
  const pectRJ = makeJoint("pectoralR", pectR.A, root);
  const dorsalJ = makeJoint("dorsal", dorsalBase, root);
  const analJ = makeJoint("anal", analBase, root);
  const tail1 = makeJoint("tail1", V(0, 0, -0.095), root);
  const tail2 = makeJoint("tail2", V(0, 0, -0.15), tail1);
  const tail3 = makeJoint("tail3", V(0, 0, -0.192), tail2);
  const caudal = makeJoint("caudal", V(0, 0, -0.2), tail3);

  tag(root, "spine");
  tag(head, "head");
  tag(jaw, "jaw");
  [tail1, tail2, tail3].forEach((j) => tag(j, "tail"));
  [pectLJ, pectRJ, dorsalJ, analJ, caudal].forEach((j) => tag(j, "fan"));

  // -------------------------------------------------------------------- body
  const zoneCol = [COL.belly, COL.flankLow, COL.flankHigh, COL.back, COL.spot, COL.fleck];
  for (const { geo, zone } of bodyZones(zoneOf)) add(geo, zoneCol[zone], O, root);

  // ---------------------------------------------------------------- tail
  add(taper(0.048, 0.031, 0.055, 0.8, 8), COL.flankHigh, V(0, 0, -0.1225), tail1);
  add(taper(0.031, 0.0225, 0.04, 0.8, 8), COL.back, V(0, 0, -0.17), tail2);
  add(taper(0.0235, 0.0215, 0.014, 0.8, 8), COL.tailBand, V(0, 0, -0.193), tail3);

  // ---------------------------------------------------------------- fins
  const addFin = (shape: FinShape, basis: THREE.Matrix4, at: Vec, bone: Joint, thick = 0.0035) => {
    add(finPlate(shape.outline, thick).applyMatrix4(basis), COL.finPlate, at, bone);
    for (const [p0, p1] of shape.rays) {
      add(rayGeo(p0, p1, 0.0026, thick + 0.0016).applyMatrix4(basis), COL.finRay, at, bone);
    }
  };

  // pectoral fins: vertical sheets swung out and back
  const pectShape = fanShape(-0.012, 0.062, -34, 34, 5, 0.07, 0.012);
  for (const [pf, pj] of [[pectL, pectLJ], [pectR, pectRJ]] as const) {
    const basis = new THREE.Matrix4().makeBasis(pf.out, UP, new THREE.Vector3().crossVectors(pf.out, UP));
    addFin(pectShape, basis, pf.A, pj);
  }

  // dorsal, anal and tail fins: sheets in the YZ plane, u runs backward
  const SAGITTAL = new THREE.Matrix4().makeBasis(V(0, 0, -1), V(0, 1, 0), V(1, 0, 0));
  const dorsalShape: FinShape = {
    outline: [[-0.022, -0.008], [-0.016, 0.012], [-0.006, 0.032], [0.008, 0.043], [0.018, 0.041], [0.025, 0.028], [0.032, 0.01], [0.036, -0.008]],
    rays: [
      [[-0.012, -0.002], [-0.012, 0.015]],
      [[-0.002, -0.002], [-0.004, 0.031]],
      [[0.008, -0.002], [0.008, 0.039]],
      [[0.018, -0.002], [0.019, 0.035]],
      [[0.027, -0.002], [0.027, 0.0155]],
    ],
  };
  addFin(dorsalShape, SAGITTAL, dorsalBase, dorsalJ);
  addFin(scaleShape(dorsalShape, 0.85, -0.8), SAGITTAL, analBase, analJ);
  addFin(fanShape(-0.02, 0.095, -37, 37, 8, 0.08, 0.012), SAGITTAL, V(0, 0, -0.195), caudal);

  // ---------------------------------------------------------------- eyes
  const addEye = (e: typeof eyeL, joint: Joint) => {
    const R = EYE_R;
    const n = e.n;
    const upT = UP.clone().addScaledVector(n, -n.y).normalize();
    const hlRaw = V(0, 1, 0.55);
    const hl = hlRaw.clone().addScaledVector(n, -hlRaw.dot(n)).normalize();

    // raised socket ring, rides the head
    const sock = lens(1.32 * R, 0.5 * R);
    place(sock, n);
    add(sock, COL.pedBack, e.p.clone().addScaledVector(n, -0.0035), head);

    // eyeball, iris and pupil bulge out of each other
    add(flat(new THREE.SphereGeometry(R, 12, 8)), COL.eyeWhite, e.c, joint);
    const iris = lens(0.68 * R, 0.3 * R).translate(0, 0.72 * R, 0);
    place(iris, n);
    add(iris, COL.iris, e.c, joint);
    const pupil = lens(0.42 * R, 0.2 * R, 10, 6).translate(0, 0.92 * R, 0);
    place(pupil, n);
    add(pupil, COL.pupil, e.c, joint);

    // glint
    const gp = n.clone().multiplyScalar(1.04 * R).addScaledVector(hl, 0.3 * R);
    const glint = flat(new THREE.SphereGeometry(0.17 * R, 6, 4));
    glint.translate(gp.x, gp.y, gp.z);
    add(glint, COL.glint, e.c, joint);

    // heavy brow lid
    const lidAxis = n.clone().multiplyScalar(0.1).add(upT).normalize();
    const lid = flat(new THREE.SphereGeometry(1.14 * R, 12, 5, 0, Math.PI * 2, 0, 1.1));
    place(lid, lidAxis);
    add(lid, COL.back, e.c, joint);
  };
  addEye(eyeL, eyeLJ);
  addEye(eyeR, eyeRJ);

  // ---------------------------------------------------------------- mouth
  // upper jaw parts ride the head, lower jaw parts ride the jaw joint
  add(ell(0.028, 0.016, 0.024), COL.lip, V(0, -0.004, 0.132), head);
  add(ell(0.025, 0.0135, 0.021), COL.lip, V(0, -0.04, 0.128), jaw);
  add(ell(0.021, 0.0075, 0.014), COL.mouth, V(0, -0.0255, 0.128), head);
  for (const sx of [1, -1]) {
    add(new THREE.BoxGeometry(0.0155, 0.011, 0.006), COL.teeth, V(sx * 0.0085, -0.0225, 0.15), head);
    add(new THREE.BoxGeometry(0.0145, 0.008, 0.005), COL.teeth, V(sx * 0.0078, -0.0315, 0.1445), jaw);
    add(flat(new THREE.SphereGeometry(0.0035, 6, 4)), COL.nostril, V(sx * 0.011, 0.0092, 0.14), head);
  }

  // ------------------------------------------------- gills and cheek blush
  for (const g of [gillL, gillR]) {
    const gl = ell(0.0045, 0.0026, 0.02, 8, 5);
    place(gl, g.n, UP);
    add(gl, COL.gill, g.p.clone().addScaledVector(g.n, -0.001), root);
  }
  for (const c of [cheekL, cheekR]) {
    const bl = ell(0.018, 0.0035, 0.013, 8, 5);
    place(bl, c.n, UP);
    add(bl, COL.blush, c.p.clone().addScaledVector(c.n, -0.001), head);
  }

  // ---------------------------------------------------------------- spines
  for (const s of spines) {
    const yy = s.p.clone().normalize().y;
    const pedCol = yy > 0.34 ? COL.pedBack : yy > -0.06 ? COL.pedHigh : yy > -0.42 ? COL.pedLow : COL.pedBelly;
    const spineCol = yy > 0.3 ? COL.spineBack : COL.spine;
    const bone = s.p.z > 0.075 ? head : root;

    const ped = flat(new THREE.CylinderGeometry(0.0072, 0.0095, 0.006, 6));
    place(ped, s.n);
    add(ped, pedCol, s.p, bone);

    const h = s.len - 0.002;
    const cone = new THREE.ConeGeometry(0.0062, h, 5, 1, true);
    cone.translate(0, 0.002 + h / 2, 0);
    place(flat(cone), s.dir);
    add(cone, spineCol, s.p, bone);
  }

  return b.root;
}
```