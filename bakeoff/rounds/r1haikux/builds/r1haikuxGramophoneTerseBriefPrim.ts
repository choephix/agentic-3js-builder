import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A wind-up tabletop gramophone: a mahogany cabinet with a turntable and record, a brass tone arm and crank, and a green horn flaring into a bell.",
};

type V = [number, number, number];

// ---- palette ---------------------------------------------------------------
const WOOD = "#6b3a1f";
const WOOD_DARK = "#3d2112";
const BRASS = "#c9a04a";
const FELT = "#2a1f1a";
const RECORD = "#161413";
const GROOVE = "#2e2a27";
const RED = "#a8232b";
const CREAM = "#efe3c4";
const HORN = "#1f5d4e";
const HORN_IN = "#2a1a10";
const IVORY = "#e8dcc0";
const JET = "#1d1a18";

const UP = new THREE.Vector3(0, 1, 0);
const SIDE = new THREE.Vector3(1, 0, 0);
// Lays a Z-axis part (torus) flat so its axis points along +Y.
const FLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

// ---- materials: one per colour and finish ----------------------------------
const cache = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string, roughness = 0.72, metalness = 0.04): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}|${metalness}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    cache.set(key, m);
  }
  return m;
}

// ---- small helpers ---------------------------------------------------------
const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3): V => [v.x, v.y, v.z];

// Quaternion that turns local +Y onto d.
function quatY(d: THREE.Vector3): THREE.Quaternion {
  const y = d.clone().normalize();
  const x = new THREE.Vector3().crossVectors(Math.abs(y.y) > 0.95 ? SIDE : UP, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

// Quaternion that turns local +Z onto d.
function quatZ(d: THREE.Vector3): THREE.Quaternion {
  const z = d.clone().normalize();
  const x = new THREE.Vector3().crossVectors(Math.abs(z.y) > 0.95 ? SIDE : UP, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

function place(
  root: THREE.Object3D,
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  at: V,
  q?: THREE.Quaternion,
) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(at[0], at[1], at[2]);
  if (q) mesh.quaternion.copy(q);
  root.add(mesh);
  return mesh;
}

// Cylinder from a to c; radius rA at a, rB at c.
function rod(root: THREE.Object3D, a: V, c: V, rA: number, rB: number, m: THREE.Material, seg = 12) {
  const A = P(a[0], a[1], a[2]);
  const C = P(c[0], c[1], c[2]);
  const d = C.clone().sub(A);
  const mid = A.clone().add(C).multiplyScalar(0.5);
  place(root, new THREE.CylinderGeometry(rB, rA, d.length(), seg, 1), m, arr(mid), quatY(d));
}

function ball(root: THREE.Object3D, at: V, r: number, m: THREE.Material, seg = 14) {
  place(root, new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), m, at);
}

// Tube swept along any curve, with a radius that varies along it (parallel-transport frames).
function sweep(
  curve: THREE.Curve<THREE.Vector3>,
  radius: (u: number) => number,
  radial: number,
  steps: number,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  let N = new THREE.Vector3();
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const p = curve.getPointAt(u);
    const T = curve.getTangentAt(u).normalize();
    if (i === 0) N = new THREE.Vector3().crossVectors(Math.abs(T.y) > 0.9 ? SIDE : UP, T).normalize();
    else N.addScaledVector(T, -N.dot(T)).normalize();
    const B = new THREE.Vector3().crossVectors(T, N);
    const r = radius(u);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a) * r;
      const s = Math.sin(a) * r;
      pos.push(p.x + N.x * c + B.x * s, p.y + N.y * c + B.y * s, p.z + N.z * c + B.z * s);
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---- painted and grained surfaces (skipped where there is no DOM) ----------
function woodTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  const rand = rng(7);
  ctx.fillStyle = WOOD;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = WOOD_DARK;
  for (let i = 0; i < 28; i++) {
    const y = rand() * 256;
    ctx.globalAlpha = 0.2 + rand() * 0.4;
    ctx.lineWidth = 1 + rand() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      80, y + (rand() - 0.5) * 20,
      170, y + (rand() - 0.5) * 20,
      256, y + (rand() - 0.5) * 8,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function labelTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 22;
  ctx.strokeRect(11, 11, 490, 234);
  ctx.strokeStyle = BRASS;
  ctx.lineWidth = 6;
  ctx.strokeRect(46, 40, 420, 176);
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(256, 158, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = BRASS;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = BRASS;
  ctx.beginPath();
  ctx.arc(256, 158, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WOOD_DARK;
  ctx.font = "bold 40px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PHONOGRAPH", 256, 84);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---- the model -------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const root = b.root;

  const woodTex = woodTexture();
  const wood = woodTex
    ? new THREE.MeshStandardMaterial({ color: "#ffffff", map: woodTex, roughness: 0.6, metalness: 0.02 })
    : mat(WOOD, 0.6, 0.02);
  const woodDark = mat(WOOD_DARK, 0.6, 0.02);
  const brass = mat(BRASS, 0.35, 0.35);
  const ivory = mat(IVORY, 0.5, 0);
  const felt = mat(FELT, 0.95, 0);
  const horn = mat(HORN, 0.5, 0.05);
  const hornIn = mat(HORN_IN, 0.9, 0);
  const jet = mat(JET, 0.4, 0.05);
  const red = mat(RED, 0.5, 0);
  const record = mat(RECORD, 0.25, 0.1);
  const groove = mat(GROOVE, 0.3, 0.1);

  const labelTex = labelTexture();
  const labelMat = labelTex
    ? new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.6, metalness: 0 })
    : mat(CREAM, 0.6, 0);

  // plinth and feet
  place(root, new THREE.BoxGeometry(0.46, 0.02, 0.42), woodDark, [0, 0.04, 0]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      place(root, new THREE.CylinderGeometry(0.02, 0.022, 0.03, 14), woodDark, [sx * 0.19, 0.015, sz * 0.165]);
    }
  }

  // cabinet body, brass corner guards and top rim
  place(root, new THREE.BoxGeometry(0.44, 0.22, 0.4), wood, [0, 0.14, 0]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      place(root, new THREE.BoxGeometry(0.022, 0.22, 0.022), brass, [sx * 0.22, 0.14, sz * 0.2]);
    }
  }
  place(root, new THREE.BoxGeometry(0.466, 0.012, 0.02), brass, [0, 0.256, 0.2]);
  place(root, new THREE.BoxGeometry(0.466, 0.012, 0.02), brass, [0, 0.256, -0.2]);
  place(root, new THREE.BoxGeometry(0.02, 0.012, 0.42), brass, [0.22, 0.256, 0]);
  place(root, new THREE.BoxGeometry(0.02, 0.012, 0.42), brass, [-0.22, 0.256, 0]);

  // front: painted label and a row of brass studs
  place(root, new THREE.PlaneGeometry(0.22, 0.11), labelMat, [0, 0.155, 0.2015]);
  for (let i = -2; i <= 2; i++) {
    place(root, new THREE.SphereGeometry(0.009, 10, 8), brass, [i * 0.045, 0.07, 0.2]);
  }

  // turntable with a record on it
  const TZ = 0.03;
  place(root, new THREE.CylinderGeometry(0.14, 0.14, 0.012, 48), brass, [0, 0.256, TZ]);
  place(root, new THREE.TorusGeometry(0.14, 0.005, 8, 48), brass, [0, 0.262, TZ], FLAT);
  place(root, new THREE.CylinderGeometry(0.128, 0.128, 0.004, 48), felt, [0, 0.264, TZ]);
  place(root, new THREE.CylinderGeometry(0.135, 0.135, 0.004, 56), record, [0, 0.268, TZ]);
  place(root, new THREE.TorusGeometry(0.1, 0.0012, 4, 56), groove, [0, 0.2702, TZ], FLAT);
  place(root, new THREE.TorusGeometry(0.12, 0.0012, 4, 56), groove, [0, 0.2702, TZ], FLAT);
  place(root, new THREE.CylinderGeometry(0.052, 0.052, 0.0022, 40), red, [0, 0.2701, TZ]);
  place(root, new THREE.TorusGeometry(0.05, 0.0016, 6, 40), brass, [0, 0.2713, TZ], FLAT);
  place(root, new THREE.CylinderGeometry(0.005, 0.005, 0.026, 12), brass, [0, 0.275, TZ]);
  ball(root, [0, 0.2885, TZ], 0.0065, brass, 10);

  // tone arm: pivot column, S-curved arm, black head with stylus
  place(root, new THREE.CylinderGeometry(0.026, 0.026, 0.008, 18), brass, [0.14, 0.254, -0.12]);
  place(root, new THREE.CylinderGeometry(0.016, 0.02, 0.04, 16), brass, [0.14, 0.27, -0.12]);
  const armCurve = new THREE.CatmullRomCurve3([
    P(0.14, 0.29, -0.12),
    P(0.128, 0.31, -0.05),
    P(0.1, 0.306, 0.01),
    P(0.075, 0.29, 0.05),
    P(0.06, 0.28, 0.078),
  ]);
  place(root, sweep(armCurve, (u) => 0.0095 - 0.0035 * u, 12, 18), brass);
  ball(root, [0.14, 0.29, -0.12], 0.012, brass, 12);
  const armEnd = armCurve.getTangentAt(1);
  place(root, new THREE.BoxGeometry(0.03, 0.016, 0.042), jet, [0.058, 0.2785, 0.086], quatZ(P(armEnd.x, 0, armEnd.z)));
  place(root, new THREE.CylinderGeometry(0.0015, 0.0015, 0.009, 6), brass, [0.058, 0.2735, 0.086]);

  // arm rest on the front left
  place(root, new THREE.BoxGeometry(0.05, 0.02, 0.035), woodDark, [0.155, 0.26, 0.13]);
  place(root, new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12), brass, [0.155, 0.28, 0.13]);
  ball(root, [0.155, 0.292, 0.13], 0.01, ivory, 12);

  // crank on the right-hand side: boss, radial arm, pin and ivory grip
  rod(root, [-0.218, 0.16, -0.12], [-0.234, 0.16, -0.12], 0.022, 0.022, brass, 18);
  rod(root, [-0.234, 0.16, -0.12], [-0.234, 0.19, -0.12], 0.007, 0.007, brass, 8);
  rod(root, [-0.234, 0.19, -0.12], [-0.262, 0.19, -0.12], 0.007, 0.007, brass, 8);
  ball(root, [-0.266, 0.19, -0.12], 0.013, ivory, 14);

  // horn: socket on the back of the cabinet, a flared pipe, and a bell
  place(root, new THREE.CylinderGeometry(0.036, 0.042, 0.035, 20), brass, [0, 0.2675, -0.15]);
  const hornCurve = new THREE.CatmullRomCurve3([
    P(0, 0.28, -0.15),
    P(0, 0.36, -0.165),
    P(0, 0.44, -0.135),
    P(0, 0.5, -0.06),
    P(0, 0.525, 0.04),
  ]);
  place(root, sweep(hornCurve, (u) => 0.024 + 0.012 * u, 16, 28), horn);

  const pipeMid = hornCurve.getPointAt(0.5);
  const pipeMidT = hornCurve.getTangentAt(0.5);
  place(root, new THREE.TorusGeometry(0.032, 0.004, 8, 24), brass, arr(pipeMid), quatZ(pipeMidT));

  const B0 = hornCurve.getPointAt(1);
  const D = P(0, 0.32, 0.95).normalize();
  const B1 = B0.clone().addScaledVector(D, 0.13);
  place(
    root,
    sweep(new THREE.LineCurve3(B0, B1), (u) => 0.036 + 0.134 * Math.pow(u, 2.2), 28, 28),
    horn,
  );
  place(root, new THREE.TorusGeometry(0.038, 0.005, 8, 28), brass, arr(B0), quatZ(D));
  place(root, new THREE.TorusGeometry(0.17, 0.008, 10, 40), brass, arr(B1), quatZ(D));
  place(root, new THREE.CircleGeometry(0.158, 40), hornIn, arr(B1.clone().addScaledVector(D, -0.003)), quatZ(D));

  return root;
}
