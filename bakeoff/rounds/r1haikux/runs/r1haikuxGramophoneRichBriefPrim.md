```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Antique gramophone",
  description:
    "A walnut-cased wind-up gramophone: a huge lobed morning-glory horn in warm brass with a green patina, a black record with a red label, a silver tonearm, a side crank, claw feet and a pale floral inlay.",
};

type V = [number, number, number];
const vec = (p: V) => new THREE.Vector3(p[0], p[1], p[2]);
const toV = (v: THREE.Vector3): V => [v.x, v.y, v.z];
const UP = new THREE.Vector3(0, 1, 0);

/* ------------------------------------------------------------------ materials */

const M = {
  walnut: new THREE.MeshStandardMaterial({ color: "#5c3b23", roughness: 0.6, metalness: 0 }),
  walnutDark: new THREE.MeshStandardMaterial({ color: "#3a2415", roughness: 0.62, metalness: 0 }),
  grain: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0 }),
  brass: new THREE.MeshStandardMaterial({ color: "#c6994f", roughness: 0.36, metalness: 0.6 }),
  brassAged: new THREE.MeshStandardMaterial({ color: "#a9a16c", roughness: 0.42, metalness: 0.55 }),
  horn: new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.42,
    metalness: 0.5,
    side: THREE.DoubleSide,
  }),
  silver: new THREE.MeshStandardMaterial({ color: "#d3d7dc", roughness: 0.22, metalness: 0.65 }),
  steel: new THREE.MeshStandardMaterial({ color: "#4b4e54", roughness: 0.4, metalness: 0.6 }),
  record: new THREE.MeshStandardMaterial({ color: "#131313", roughness: 0.2, metalness: 0.1 }),
  groove: new THREE.MeshStandardMaterial({ color: "#2e2e31", roughness: 0.3 }),
  label: new THREE.MeshStandardMaterial({ color: "#b3261e", roughness: 0.5 }),
  cream: new THREE.MeshStandardMaterial({ color: "#efe4c6", roughness: 0.6 }),
  felt: new THREE.MeshStandardMaterial({ color: "#2d2a27", roughness: 1 }),
  inlay: new THREE.MeshStandardMaterial({ color: "#eadcb8", roughness: 0.5, side: THREE.DoubleSide }),
};

/* ------------------------------------------------------------------- helpers */

// Rotation whose Y axis follows `dir`.
function basisY(dir: THREE.Vector3): THREE.Matrix4 {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : UP.clone();
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

// Rotation whose Z axis follows `dir` (for tori and flat discs).
function basisZ(dir: THREE.Vector3): THREE.Matrix4 {
  const z = dir.clone().normalize();
  const ref = Math.abs(z.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : UP.clone();
  const x = new THREE.Vector3().crossVectors(ref, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

function put(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, at: V): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(at[0], at[1], at[2]);
  parent.add(m);
  return m;
}

const boxAt = (p: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, at: V) =>
  put(p, new THREE.BoxGeometry(w, h, d), mat, at);

const cylAt = (p: THREE.Object3D, r: number, h: number, mat: THREE.Material, at: V, seg = 24) =>
  put(p, new THREE.CylinderGeometry(r, r, h, seg), mat, at);

const ballAt = (p: THREE.Object3D, r: number, mat: THREE.Material, at: V, seg = 16) =>
  put(p, new THREE.SphereGeometry(r, seg, Math.ceil(seg * 0.6)), mat, at);

// A cylinder from a to b, tapering from rA at a to rB at b.
function rod(p: THREE.Object3D, a: V, b: V, rA: number, rB: number, mat: THREE.Material, seg = 10) {
  const A = vec(a);
  const B = vec(b);
  const d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, d.length(), seg, 1), mat);
  m.quaternion.setFromRotationMatrix(basisY(d));
  m.position.copy(A).add(B).multiplyScalar(0.5);
  p.add(m);
  return m;
}

// A torus lying in the plane whose normal is `normal`.
function ringAt(
  p: THREE.Object3D,
  at: V,
  normal: THREE.Vector3,
  R: number,
  tube: number,
  mat: THREE.Material,
  seg = 8,
  tub = 48,
) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, tube, seg, tub), mat);
  m.quaternion.setFromRotationMatrix(basisZ(normal));
  m.position.set(at[0], at[1], at[2]);
  p.add(m);
  return m;
}

// Walnut block with streaky vertex-colour grain running along X.
function grainBlock(
  p: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  sx: number,
  sy: number,
  sz: number,
  at: V,
  phase: number,
) {
  const geo = new THREE.BoxGeometry(w, h, d, sx, sy, sz);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const light = new THREE.Color("#7b5030");
  const dark = new THREE.Color("#3b2414");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const g = 0.5 + 0.5 * Math.sin(y * 130 + 2.2 * Math.sin(x * 4 + phase) + 1.4 * Math.sin(z * 9));
    c.copy(dark).lerp(light, 0.45 + 0.5 * g * g * g);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return put(p, geo, M.grain, at);
}

/* ------------------------------------------------------------ pale inlay */

const PETAL_GEO = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.017, 0.008, 0.016, 0.036, 0, 0.044);
  s.bezierCurveTo(-0.016, 0.036, -0.017, 0.008, 0, 0);
  return new THREE.ShapeGeometry(s, 6);
})();

const LEAF_GEO = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.013, 0.02, 0, 0.052);
  s.quadraticCurveTo(-0.013, 0.02, 0, 0);
  return new THREE.ShapeGeometry(s, 6);
})();

const EYE_GEO = new THREE.CircleGeometry(0.0075, 12);

// A five-petal flower with a brass eye and two leaves, lying flat on a face.
// `at` is the world position; `onTop` lays it on a horizontal surface.
function inlayFlower(p: THREE.Object3D, at: V, scale: number, spin: number, onTop: boolean) {
  const g = new THREE.Group();
  g.position.set(at[0], at[1], at[2]);
  g.rotation.set(onTop ? -Math.PI / 2 : 0, 0, spin);
  g.scale.setScalar(scale);
  for (let k = 0; k < 5; k++) {
    const petal = new THREE.Mesh(PETAL_GEO, M.inlay);
    petal.rotation.z = (k * Math.PI * 2) / 5;
    g.add(petal);
  }
  const eye = new THREE.Mesh(EYE_GEO, M.brass);
  eye.position.z = 0.0012;
  g.add(eye);
  for (const a of [2.3, 3.98]) {
    const leaf = new THREE.Mesh(LEAF_GEO, M.inlay);
    leaf.position.set(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0.0008);
    leaf.rotation.z = a - Math.PI / 2;
    g.add(leaf);
  }
  p.add(g);
}

// A thin pale stem lying on the front face.
function stripFront(p: THREE.Object3D, a: [number, number], b: [number, number], z: number, w: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const m = boxAt(p, Math.hypot(dx, dy), w, 0.0018, M.inlay, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]);
  m.rotation.z = Math.atan2(dy, dx);
}

/* ------------------------------------------------------------------- horn */

// Horn axis: throat sits above the cabinet's back edge, the bell flares up and forward.
const HORN_T = new THREE.Vector3(0, 0.56, -0.12);
const HORN_LEN = 0.72;
const HORN_BEND = 0.12;
const AXIS0 = new THREE.Vector3(0, 0.543, 0.839).normalize();
const E1 = new THREE.Vector3(1, 0, 0);

function hornCentre(s: number): THREE.Vector3 {
  return HORN_T.clone().addScaledVector(AXIS0, HORN_LEN * s).addScaledVector(UP, HORN_LEN * HORN_BEND * s * s);
}

function hornTangent(s: number): THREE.Vector3 {
  return AXIS0.clone().addScaledVector(UP, 2 * HORN_BEND * s).normalize();
}

function hornBase(s: number): number {
  return 0.03 + 0.07 * s * s + 0.34 * Math.pow(s, 5);
}

// Five soft lobes around the bell: +1 at a petal tip, negative in the creases.
function lobe(th: number): number {
  const c = Math.cos(5 * th);
  return Math.sign(c) * Math.pow(Math.abs(c), 0.7);
}

function hornPoint(s: number, th: number, grow = 1): THREE.Vector3 {
  const t = hornTangent(s);
  const e2 = new THREE.Vector3(0, t.z, -t.y);
  const r = hornBase(s) * (1 + 0.1 * Math.pow(s, 3) * lobe(th)) * grow;
  return hornCentre(s)
    .addScaledVector(E1, r * Math.cos(th))
    .addScaledVector(e2, r * Math.sin(th));
}

function hornGeometry(): THREE.BufferGeometry {
  const NU = 22;
  const NV = 60;
  const brass = new THREE.Color("#c99a4a");
  const verdigris = new THREE.Color("#5f8f74");
  const c = new THREE.Color();
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i < NU; i++) {
    const s = i / (NU - 1);
    for (let j = 0; j < NV; j++) {
      const th = (j / NV) * Math.PI * 2;
      const p = hornPoint(s, th);
      pos.push(p.x, p.y, p.z);
      // Patina: greener towards the mouth, in the creases, and in soft blotches.
      const crease = (1 - lobe(th)) * 0.5;
      const blot = 0.5 + 0.5 * Math.sin(2 * th + 3 * s) * Math.cos(3 * th - 2 * s + 0.7);
      const pa = Math.min(0.5, 0.04 + 0.5 * Math.pow(s, 2.5) + 0.1 * blot * s + 0.1 * crease * s);
      c.copy(brass).lerp(verdigris, pa);
      col.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < NU - 1; i++) {
    for (let j = 0; j < NV; j++) {
      const a = i * NV + j;
      const b = i * NV + ((j + 1) % NV);
      const cc = (i + 1) * NV + j;
      const d = (i + 1) * NV + ((j + 1) % NV);
      idx.push(a, b, cc, b, d, cc);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A lobed brass bead following the bell's cross-section at parameter s.
function hornRing(p: THREE.Object3D, s: number, grow: number, tube: number, mat: THREE.Material) {
  const pts: THREE.Vector3[] = [];
  for (let j = 0; j < 48; j++) pts.push(hornPoint(s, (j / 48) * Math.PI * 2, grow));
  const curve = new THREE.CatmullRomCurve3(pts, true);
  p.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 160, tube, 8, true), mat));
}

/* ------------------------------------------------------------------ build */

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gramophone" });
  const root = b.root;

  /* cabinet */
  boxAt(root, 0.54, 0.02, 0.44, M.walnutDark, [0, 0.09, 0]); // plinth
  grainBlock(root, 0.52, 0.26, 0.44, 20, 20, 16, [0, 0.23, 0], 0.0); // body
  grainBlock(root, 0.54, 0.02, 0.46, 24, 2, 20, [0, 0.37, 0], 1.3); // top

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      boxAt(root, 0.03, 0.26, 0.03, M.walnut, [sx * 0.255, 0.23, sz * 0.215]); // carved corner pilasters
    }
  }

  // carved beads along the front
  rod(root, [-0.25, 0.345, 0.226], [0.25, 0.345, 0.226], 0.0075, 0.0075, M.walnutDark, 10);
  rod(root, [-0.25, 0.115, 0.226], [0.25, 0.115, 0.226], 0.0065, 0.0065, M.walnutDark, 10);
  for (let i = 0; i < 12; i++) {
    ballAt(root, 0.0072, M.walnutDark, [-0.22 + i * 0.04, 0.345, 0.231], 8);
  }

  // brass pinstripe around the top edge
  const TOPY = 0.38;
  rod(root, [-0.27, TOPY, 0.23], [0.27, TOPY, 0.23], 0.0038, 0.0038, M.brass, 8);
  rod(root, [-0.27, TOPY, -0.23], [0.27, TOPY, -0.23], 0.0038, 0.0038, M.brass, 8);
  rod(root, [-0.27, TOPY, -0.23], [-0.27, TOPY, 0.23], 0.0038, 0.0038, M.brass, 8);
  rod(root, [0.27, TOPY, -0.23], [0.27, TOPY, 0.23], 0.0038, 0.0038, M.brass, 8);

  /* pale floral inlay: front panel */
  const FZ = 0.22;
  const fx = 0.2;
  const fy0 = 0.13;
  const fy1 = 0.32;
  boxAt(root, 2 * fx + 0.006, 0.006, 0.004, M.inlay, [0, fy1, FZ + 0.002]);
  boxAt(root, 2 * fx + 0.006, 0.006, 0.004, M.inlay, [0, fy0, FZ + 0.002]);
  boxAt(root, 0.006, fy1 - fy0, 0.004, M.inlay, [-fx, (fy0 + fy1) / 2, FZ + 0.002]);
  boxAt(root, 0.006, fy1 - fy0, 0.004, M.inlay, [fx, (fy0 + fy1) / 2, FZ + 0.002]);

  const FLOW_Z = FZ + 0.004;
  const sides: [number, number, number, number][] = [
    [-0.115, 0.278, 0.85, -0.2],
    [0.115, 0.278, 0.85, 0.5],
    [-0.115, 0.172, 0.85, 0.9],
    [0.115, 0.172, 0.85, -0.6],
  ];
  for (const [x, y] of sides) stripFront(root, [0, 0.225], [x, y], FZ + 0.0025, 0.0022);
  inlayFlower(root, [0, 0.225, FLOW_Z], 1.25, 0.3, false);
  for (const [x, y, s, spin] of sides) inlayFlower(root, [x, y, FLOW_Z], s, spin, false);

  /* pale floral inlay: top */
  const TY = 0.381;
  boxAt(root, 0.496, 0.002, 0.006, M.inlay, [0, TY, 0.205]);
  boxAt(root, 0.496, 0.002, 0.006, M.inlay, [0, TY, -0.205]);
  boxAt(root, 0.006, 0.002, 0.416, M.inlay, [0.245, TY, 0]);
  boxAt(root, 0.006, 0.002, 0.416, M.inlay, [-0.245, TY, 0]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      inlayFlower(root, [sx * 0.2, 0.382, sz * 0.16], 0.55, sx * sz * 0.5 + 0.3, true);
    }
  }

  /* claw feet */
  const feet: [number, number][] = [
    [-0.21, -0.17],
    [0.21, -0.17],
    [-0.21, 0.17],
    [0.21, 0.17],
  ];
  for (const [x, z] of feet) {
    ballAt(root, 0.026, M.brassAged, [x, 0.026, z], 16);
    rod(root, [x, 0.04, z], [x, 0.085, z], 0.011, 0.011, M.brassAged, 10);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3 + 0.5;
      const R: V = [x + Math.cos(a) * 0.017, 0.05, z + Math.sin(a) * 0.017];
      const T: V = [x + Math.cos(a) * 0.031, 0.015, z + Math.sin(a) * 0.031];
      rod(root, R, T, 0.0065, 0.0045, M.brassAged, 8);
      ballAt(root, 0.0055, M.brassAged, T, 8);
    }
  }

  /* wind-up crank on the right side (-X) */
  const CY = 0.22;
  const CZ = 0.1;
  rod(root, [-0.262, CY, CZ], [-0.27, CY, CZ], 0.034, 0.034, M.brass, 24); // ratchet disc
  rod(root, [-0.27, CY, CZ], [-0.292, CY, CZ], 0.02, 0.02, M.brass, 16); // winding boss
  rod(root, [-0.292, CY, CZ], [-0.33, CY, CZ], 0.0075, 0.0075, M.brass, 10); // crank arm
  rod(root, [-0.33, CY, CZ], [-0.33, CY + 0.035, CZ], 0.0065, 0.0065, M.brass, 10); // stalk
  ballAt(root, 0.019, M.walnutDark, [-0.33, CY + 0.045, CZ], 16); // wooden grip

  /* turntable, felt, record, label, spindle */
  const TX = 0;
  const TZ = 0.02;
  cylAt(root, 0.165, 0.01, M.brass, [TX, 0.385, TZ], 64); // platter
  ringAt(root, [TX, 0.39, TZ], UP, 0.165, 0.0042, M.brass, 8, 64); // platter rim
  cylAt(root, 0.155, 0.002, M.felt, [TX, 0.391, TZ], 48); // felt mat
  cylAt(root, 0.13, 0.006, M.record, [TX, 0.395, TZ], 64); // black record
  for (const R of [0.06, 0.08, 0.1, 0.118]) {
    ringAt(root, [TX, 0.3985, TZ], UP, R, 0.0009, M.groove, 4, 96); // grooves
  }
  cylAt(root, 0.045, 0.002, M.label, [TX, 0.399, TZ], 40); // red label
  ringAt(root, [TX, 0.399, TZ], UP, 0.0455, 0.0012, M.brass, 6, 48); // gold label edge
  boxAt(root, 0.05, 0.0008, 0.006, M.cream, [TX, 0.4009, TZ - 0.012]);
  boxAt(root, 0.036, 0.0008, 0.006, M.cream, [TX, 0.4009, TZ + 0.012]);
  rod(root, [TX, 0.398, TZ], [TX, 0.44, TZ], 0.0035, 0.0035, M.silver, 8); // spindle
  ballAt(root, 0.0075, M.brass, [TX, 0.441, TZ], 10);

  /* silver tonearm on a brass pillar at the back right */
  const PV: V = [0.2, 0.38, -0.11];
  cylAt(root, 0.022, 0.012, M.brassAged, [PV[0], 0.386, PV[2]], 24); // pivot base
  rod(root, [PV[0], 0.392, PV[2]], [PV[0], 0.46, PV[2]], 0.0105, 0.0085, M.brassAged, 12); // pillar
  ballAt(root, 0.014, M.brassAged, [PV[0], 0.462, PV[2]], 14); // bearing
  rod(root, [0.2, 0.462, -0.11], [0.228, 0.468, -0.142], 0.0045, 0.0045, M.silver, 8); // counterweight arm
  ballAt(root, 0.012, M.silver, [0.23, 0.468, -0.145], 12);

  const armPts: V[] = [
    [0.2, 0.46, -0.11],
    [0.165, 0.472, -0.085],
    [0.122, 0.46, -0.06],
    [0.092, 0.432, -0.042],
    [0.077, 0.405, -0.032],
  ];
  const armCurve = new THREE.CatmullRomCurve3(armPts.map(vec));
  root.add(new THREE.Mesh(new THREE.TubeGeometry(armCurve, 40, 0.0046, 8, false), M.silver));

  const N = vec(armPts[4]);
  const hsDir = N.clone().sub(vec(armPts[3])).normalize();
  const headshell = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.026, 0.011), M.steel);
  headshell.quaternion.setFromRotationMatrix(basisY(hsDir));
  headshell.position.copy(N).addScaledVector(hsDir, -0.012);
  root.add(headshell);
  rod(root, armPts[4], [armPts[4][0], armPts[4][1] - 0.008, armPts[4][2]], 0.0012, 0.0003, M.steel, 6); // needle

  /* morning-glory horn */
  const colBase = vec([0, 0.38, -0.18]);
  const colTop = HORN_T.clone().addScaledVector(AXIS0, -0.03);
  cylAt(root, 0.03, 0.012, M.brassAged, [0, 0.386, -0.18], 24); // column foot
  rod(root, toV(colBase), toV(colTop), 0.024, 0.015, M.brass, 14); // column
  ringAt(root, toV(colBase.clone().lerp(colTop, 0.45)), UP, 0.03, 0.006, M.brass, 8, 28); // collar
  rod(
    root,
    toV(HORN_T.clone().addScaledVector(AXIS0, -0.008)),
    toV(HORN_T.clone().addScaledVector(AXIS0, 0.008)),
    0.04,
    0.04,
    M.brass,
    24,
  ); // throat flange

  root.add(new THREE.Mesh(hornGeometry(), M.horn)); // the bell
  hornRing(root, 0.42, 1.03, 0.006, M.brass); // bands around the bell
  hornRing(root, 0.7, 1.03, 0.007, M.brass);
  hornRing(root, 1.0, 1.03, 0.009, M.brass); // flared mouth bead

  return root;
}
```