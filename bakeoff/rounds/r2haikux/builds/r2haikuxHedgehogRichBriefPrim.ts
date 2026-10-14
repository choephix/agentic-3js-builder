import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Autumn hedgehog",
  description:
    "A plump hedgehog on an autumn evening walk: a chestnut spine dome with cream tips, a fawn face with a twitchy snout, pink paws and a red maple leaf stuck on its back.",
};

const CHESTNUT = "#7b4a2b";
const CREAM = "#f3e4c4";
const FAWN = "#dcaa70";
const DEEP_FAWN = "#b47b4c";
const PINK = "#f2a2b6";
const INK = "#17110e";
const SHINE = "#ffffff";
const MAPLE = "#c8282e";
const VEIN = "#7d1a1c";
const STEM = "#5c3b1f";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function ellipsoid(rx: number, ry: number, rz: number, w: number, h: number) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

// Maple leaf outline as [angle in degrees, radius]; the stem notch sits at 270.
const LOBES: [number, number][] = [
  [10, 0.4], [40, 0.95], [65, 0.48], [90, 1.0], [115, 0.48],
  [140, 0.95], [170, 0.4], [200, 0.9], [270, 0.28], [340, 0.9],
];
const LEAF_S = 0.065;
const LEAF_BASE = V(0.02, 0.19, -0.035);
const lx = V(1, 0, 0);
const ly = V(0, 0.6, -0.8).normalize(); // leaf axis: up and back
const lz = V(0, 0.8, 0.6).normalize(); // leaf face: up and forward
const leafBasis = new THREE.Matrix4().makeBasis(lx, ly, lz);

function leafWorld(p: THREE.Vector3) {
  return LEAF_BASE.clone()
    .addScaledVector(lx, p.x)
    .addScaledVector(ly, p.y)
    .addScaledVector(lz, p.z);
}

// Centre a leaf-local piece on its own origin, orient it, and return where to seat it.
function seatLeaf(geo: THREE.BufferGeometry, c: THREE.Vector3) {
  geo.translate(-c.x, -c.y, -c.z);
  geo.applyMatrix4(leafBasis);
  return leafWorld(c);
}

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  // ---- skeleton ----
  const BODY_C = V(0, 0.08, -0.005);
  const HEAD_C = V(0, 0.084, 0.1);
  const JAW_C = V(0, 0.07, 0.14);

  const body = b.joint("body", { at: BODY_C });
  const head = b.joint("head", { at: HEAD_C, parent: body });
  const jaw = b.joint("jaw", { at: JAW_C, parent: head });
  const hips = [
    { joint: b.joint("hipFL", { at: V(0.05, 0.035, 0.03), parent: body }), x: 0.05, z: 0.03 },
    { joint: b.joint("hipFR", { at: V(-0.05, 0.035, 0.03), parent: body }), x: -0.05, z: 0.03 },
    { joint: b.joint("hipBL", { at: V(0.05, 0.035, -0.055), parent: body }), x: 0.05, z: -0.055 },
    { joint: b.joint("hipBR", { at: V(-0.05, 0.035, -0.055), parent: body }), x: -0.05, z: -0.055 },
  ];

  // ---- body: plump chestnut ellipsoid ----
  b.part(ellipsoid(0.088, 0.072, 0.082, 24, 16), CHESTNUT, { at: BODY_C, bone: body });

  // ---- spine dome: brown shafts with cream tips, leaning back ----
  const RX = 0.088, RY = 0.072, RZ = 0.082;
  const GOLD = Math.PI * (3 - Math.sqrt(5));
  const COUNT = 300;
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (2 * (i + 0.5)) / COUNT;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * GOLD;
    const nx = Math.cos(phi) * ring;
    const ny = y;
    const nz = Math.sin(phi) * ring;
    if (ny < -0.2 || nz > 0.42) continue; // keep the belly and the face clear

    // Point on the body ellipsoid along this ray, and its outward normal.
    const k = 1 / Math.sqrt((nx * nx) / (RX * RX) + (ny * ny) / (RY * RY) + (nz * nz) / (RZ * RZ));
    const surf = V(nx * k, ny * k, nz * k).add(BODY_C);
    const N = V(nx / (RX * RX), ny / (RY * RY), nz / (RZ * RZ)).normalize();
    const dir = N.clone().add(V(0, 0, -0.35)).normalize();

    const L = 0.03 * (0.85 + 0.3 * ((i * 0.618034) % 1));
    const R = 0.0034;
    const base = surf.clone().addScaledVector(N, -0.003);
    const brownL = L * 0.55;
    const creamL = L * 0.45;

    b.part(new THREE.CylinderGeometry(R * 0.45, R, brownL, 6), CHESTNUT, {
      at: base.clone().addScaledVector(dir, brownL / 2),
      dir,
      bone: body,
    });
    b.part(new THREE.CylinderGeometry(0, R * 0.45, creamL, 6), CREAM, {
      at: base.clone().addScaledVector(dir, brownL + creamL / 2),
      dir,
      bone: body,
    });
  }

  // ---- head: fawn sphere, pointed twitchy snout, black button nose ----
  b.part(ellipsoid(0.046, 0.042, 0.048, 16, 12), FAWN, { at: HEAD_C, bone: head });

  const SNOUT_DIR = V(0, 0.16, 1).normalize();
  const SNOUT_BASE = V(0, 0.082, 0.128);
  const SNOUT_L = 0.075;
  b.part(new THREE.ConeGeometry(0.026, SNOUT_L, 8), FAWN, {
    at: SNOUT_BASE.clone().addScaledVector(SNOUT_DIR, SNOUT_L / 2),
    dir: SNOUT_DIR,
    bone: head,
  });

  b.part(ellipsoid(0.0135, 0.0115, 0.0135, 12, 9), INK, { at: V(0, 0.093, 0.196), bone: head });
  b.part(new THREE.SphereGeometry(0.0028, 6, 5), SHINE, { at: V(0, 0.1, 0.207), bone: head });

  // Lower jaw: a small fawn wedge tucked under the snout.
  const JAW_DIR = V(0, -0.12, 1).normalize();
  const JAW_L = 0.05;
  b.part(new THREE.ConeGeometry(0.014, JAW_L, 7), FAWN, {
    at: JAW_C.clone().addScaledVector(JAW_DIR, JAW_L / 2),
    dir: JAW_DIR,
    bone: jaw,
  });

  // Beady eyes with bright glints.
  for (const s of [1, -1]) {
    const eye = V(0.027 * s, 0.098, 0.136);
    b.part(new THREE.SphereGeometry(0.0088, 10, 8), INK, { at: eye, bone: head });
    b.part(new THREE.SphereGeometry(0.0028, 6, 5), SHINE, {
      at: eye.clone().add(V(0.0045 * s, 0.0042, 0.0062)),
      bone: head,
    });
  }

  // Tiny round ears, flat against the sides of the head, with pink insides.
  for (const s of [1, -1]) {
    const ear = V(0.037 * s, 0.107, 0.09);
    b.part(ellipsoid(0.006, 0.0115, 0.0115, 12, 8), DEEP_FAWN, { at: ear, bone: head });
    b.part(ellipsoid(0.0032, 0.0072, 0.0072, 10, 6), PINK, {
      at: ear.clone().add(V(0.005 * s, 0, 0)),
      bone: head,
    });
  }

  // ---- legs and pink paws with three toes each ----
  for (const h of hips) {
    b.part(new THREE.CylinderGeometry(0.018, 0.021, 0.075, 8), DEEP_FAWN, {
      at: V(h.x, 0.0375, h.z),
      bone: h.joint,
    });
    const pawZ = h.z + 0.006;
    b.part(ellipsoid(0.022, 0.012, 0.027, 12, 8), PINK, {
      at: V(h.x, 0.012, pawZ),
      bone: h.joint,
    });
    for (const d of [-0.0085, 0, 0.0085]) {
      b.part(new THREE.SphereGeometry(0.0065, 6, 5), PINK, {
        at: V(h.x + d, 0.0065, h.z + 0.034),
        bone: h.joint,
      });
    }
  }

  // ---- red maple leaf, impaled on the spines by its stem ----
  const leafShape = new THREE.Shape();
  LOBES.forEach(([deg, r], i) => {
    const a = (deg * Math.PI) / 180;
    const x = Math.cos(a) * r * LEAF_S;
    const y = (Math.sin(a) * r + 0.28) * LEAF_S;
    if (i === 0) leafShape.moveTo(x, y);
    else leafShape.lineTo(x, y);
  });
  leafShape.closePath();

  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.003, bevelEnabled: false });
  leafGeo.computeBoundingBox();
  const leafC = new THREE.Vector3();
  leafGeo.boundingBox?.getCenter(leafC);
  b.part(leafGeo, MAPLE, { at: seatLeaf(leafGeo, leafC), bone: body });

  const veinGeo = new THREE.BoxGeometry(0.0022, 0.9 * LEAF_S, 0.0012);
  const veinC = V(0, 0.65 * LEAF_S, 0.0035);
  b.part(veinGeo, VEIN, { at: seatLeaf(veinGeo, veinC), bone: body });

  const stemGeo = new THREE.CylinderGeometry(0.0022, 0.0028, 0.045, 6);
  const stemC = V(0, -0.0225, 0.0015);
  b.part(stemGeo, STEM, { at: seatLeaf(stemGeo, stemC), bone: body });

  return b.root;
}
