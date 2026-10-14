import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Pufferfish",
  description:
    "An inflated pufferfish: olive back, cream belly, spines and spots, bulging eyes, a fused beak and amber fins.",
};

type V3 = [number, number, number];

const OLIVE = "#9a8838";
const CREAM = "#f1e5bf";
const SPOT = "#3b2f1b";
const AMBER = "#e0a64a";
const EYE = "#fdfcf5";
const PUPIL = "#15110c";
const BEAK = "#6c6548";

// Inflated body: centre and half-sizes in metres. The belly's lowest point is y = 0.
const CENTER: V3 = [0, 0.13, 0];
const RX = 0.125;
const RY = 0.13;
const RZ = 0.13;

/** Deterministic pseudo-random value in 0..1 from an integer. */
function jitter(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Evenly spread unit directions over a sphere. */
function fibonacci(n: number): V3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    out.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  return out;
}

// Directions where spines and spots stay off: eyes, pectoral fins, dorsal fin.
const KEEP_CLEAR: { dir: V3; cos: number }[] = [
  { dir: [0.7, 0.31, 0.63], cos: 0.9 },
  { dir: [-0.7, 0.31, 0.63], cos: 0.9 },
  { dir: [0.93, -0.24, 0.26], cos: 0.9 },
  { dir: [-0.93, -0.24, 0.26], cos: 0.9 },
  { dir: [0, 0.87, -0.5], cos: 0.85 },
];

/** False over the face (mouth, nostrils) and the tail root. */
function clearOfFeatures(d: V3): boolean {
  if (d[2] > 0.8 || d[2] < -0.75) return false;
  return KEEP_CLEAR.every(({ dir, cos }) => dot(d, dir) < cos);
}

/** A fan-like fin in the body's centre plane. Shape x runs backwards, shape y is up. */
function sagittalFin(shape: THREE.Shape, thickness: number): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.translate(0, 0, -thickness / 2);
  g.rotateY(Math.PI / 2); // shape x -> -Z (back), shape y -> Y, thickness -> X
  return g;
}

/** A flat paddle lying in the horizontal plane. Shape x is outward, shape y is forward. */
function sideFin(shape: THREE.Shape, thickness: number): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.translate(0, 0, -thickness / 2);
  g.rotateX(Math.PI / 2); // shape y -> +Z (forward), thickness -> Y
  return g;
}

export default function build() {
  const b = createBuilder({ name: "pufferfish" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: CENTER });
  const head = b.joint("head", { at: [0, 0.13, 0.11], parent: hips });
  const jawUpper = b.joint("jawUpper", { at: [0, 0.12, 0.11], parent: head });
  const jawLower = b.joint("jawLower", { at: [0, 0.102, 0.11], parent: head });
  const dorsal = b.joint("dorsal", { at: [0, 0.2, -0.04], parent: hips });
  const anal = b.joint("anal", { at: [0, 0.075, -0.1], parent: hips });
  const pectoralL = b.joint("pectoralL", { at: [0.11, 0.1, 0.03], parent: hips });
  const pectoralR = b.joint("pectoralR", { at: [-0.11, 0.1, 0.03], parent: hips });
  b.chain(
    "tail",
    [
      [0, 0.13, -0.1],
      [0, 0.128, -0.16],
      [0, 0.125, -0.22],
    ],
    { parent: hips, role: "tail" },
  );

  // ---- Tail peduncle ------------------------------------------------------
  b.sweep(
    b.chain(
      "tailCurve",
      [
        [0, 0.13, -0.1],
        [0, 0.128, -0.16],
        [0, 0.125, -0.22],
      ],
      { parent: hips },
    ),
    0.03,
    { color: OLIVE },
  );

  // ---- Body: a two-tone dome, olive back over a cream belly ---------------
  const backGeo = new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  backGeo.scale(RX, RY, RZ);
  const back = b.part(backGeo, OLIVE, { at: CENTER, bone: hips });

  const bellyGeo = new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  bellyGeo.scale(RX, RY, RZ);
  const belly = b.part(bellyGeo, CREAM, { at: CENTER, bone: hips });

  const backSurf = b.surface(back);
  const bellySurf = b.surface(belly);
  const surfaceFor = (d: V3) => (d[1] >= 0 ? backSurf : bellySurf);

  // ---- Spines: stuck out along the surface normal, kept off the face -----
  fibonacci(220).forEach((d, i) => {
    if (d[1] < -0.3 || !clearOfFeatures(d)) return;
    const hit = surfaceFor(d).ray(CENTER, d);
    const len = 0.024 + 0.012 * jitter(i);
    const r = 0.0055 + 0.002 * jitter(i + 91);
    b.spike(hit, hit, len, r);
  });

  // ---- Spots: dark blotches on the upper body ------------------------------
  fibonacci(140).forEach((d, i) => {
    if (d[1] < -0.2 || !clearOfFeatures(d) || jitter(i + 40) > 0.6) return;
    const hit = surfaceFor(d).ray(CENTER, d);
    const spot = new THREE.SphereGeometry(0.012 + 0.006 * jitter(i + 7), 6, 4);
    b.stick(spot, SPOT, hit);
  });

  // ---- Eyes: big, bulging, with glints ------------------------------------
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 12, 8), EYE, {
      at: [s * 0.088, 0.17, 0.082],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.017, 10, 6), PUPIL, {
      at: [s * 0.106, 0.178, 0.098],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), EYE, {
      at: [s * 0.1145, 0.1817, 0.1056],
      bone: head,
    });
  }

  // ---- Nostrils ------------------------------------------------------------
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.005, 6, 4), SPOT, {
      at: [s * 0.035, 0.155, 0.122],
      bone: head,
    });
  }

  // ---- Fused beak: upper and lower jaw, each on its own joint ---------------
  b.part(new THREE.BoxGeometry(0.05, 0.022, 0.034), BEAK, {
    at: [0, 0.122, 0.128],
    bone: jawUpper,
  });
  b.part(new THREE.BoxGeometry(0.044, 0.02, 0.03), BEAK, {
    at: [0, 0.1, 0.122],
    bone: jawLower,
  });

  // ---- Dorsal fin -----------------------------------------------------------
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(-0.035, 0);
  dorsalShape.quadraticCurveTo(-0.02, 0.085, 0.02, 0.09);
  dorsalShape.quadraticCurveTo(0.05, 0.08, 0.065, 0);
  dorsalShape.closePath();
  b.part(sagittalFin(dorsalShape, 0.008), AMBER, { at: [0, 0.2, -0.04], bone: dorsal });

  // ---- Anal fin (underside, toward the tail) --------------------------------
  const analShape = new THREE.Shape();
  analShape.moveTo(-0.02, 0);
  analShape.quadraticCurveTo(0.0, -0.045, 0.03, -0.05);
  analShape.quadraticCurveTo(0.045, -0.02, 0.04, 0);
  analShape.closePath();
  b.part(sagittalFin(analShape, 0.007), AMBER, { at: [0, 0.075, -0.1], bone: anal });

  // ---- Pectoral paddles, one each side --------------------------------------
  const pectoralShape = (sg: number) => {
    const s = new THREE.Shape();
    s.moveTo(sg * -0.02, 0.03);
    s.quadraticCurveTo(sg * 0.05, 0.055, sg * 0.085, 0.0);
    s.quadraticCurveTo(sg * 0.09, -0.045, sg * 0.01, -0.04);
    s.closePath();
    return s;
  };
  b.part(sideFin(pectoralShape(1), 0.006), AMBER, {
    at: [0.11, 0.1, 0.03],
    bone: pectoralL,
  });
  b.part(sideFin(pectoralShape(-1), 0.006), AMBER, {
    at: [-0.11, 0.1, 0.03],
    bone: pectoralR,
  });

  // ---- Caudal fin: a rounded fan at the tail tip ----------------------------
  const caudalShape = new THREE.Shape();
  caudalShape.moveTo(-0.01, 0.035);
  caudalShape.quadraticCurveTo(0.035, 0.07, 0.075, 0.085);
  caudalShape.quadraticCurveTo(0.055, 0.0, 0.075, -0.085);
  caudalShape.quadraticCurveTo(0.035, -0.07, -0.01, -0.035);
  caudalShape.closePath();
  b.part(sagittalFin(caudalShape, 0.008), AMBER, { at: [0, 0.125, -0.22] });

  return b.root;
}
