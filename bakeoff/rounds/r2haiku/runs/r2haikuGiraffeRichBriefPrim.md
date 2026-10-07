```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

// Palette
const CREAM = "#fff1d2";
const FAWN = "#e9b978";
const CHESTNUT = "#7a3b17";
const TAN = "#b9733a";
const LEG_CREAM = "#f3e3bd";
const MANE = "#4a2a14";
const BLACK = "#1a1410";
const HOOF = "#2b1e15";
const TONGUE = "#4b1d26";
const OSSICONE = "#d8b07a";
const MUZZLE = "#f4dfb0";
const EYE = "#0f0a08";

// Spine and neck centrelines, model space (+Y up, faces +Z)
const BODY: number[][] = [
  [0, 2.2, -0.65],
  [0, 2.28, -0.05],
  [0, 2.32, 0.5],
];
const NECK: number[][] = [
  [0, 2.3, 0.5],
  [0, 2.8, 0.78],
  [0, 3.3, 1.12],
];

// Point on a piecewise-linear path, t in [0, 1]
function along(path: number[][], t: number): number[] {
  const n = path.length - 1;
  const s = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.min(Math.floor(s), n - 1);
  const f = s - i;
  return path[i].map((v, k) => v + (path[i + 1][k] - v) * f);
}

// Flattened blob used for reticulation patches
function blob(radius: number, squash: number): THREE.SphereGeometry {
  const g = new THREE.SphereGeometry(radius, 10, 6);
  g.scale(1, squash, 1);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "reticulated giraffe calf" });

  // ---- Skeleton ----
  const hips = b.joint("hips", { at: [0, 2.2, 0] });
  const neck1 = b.joint("neck1", { at: [0, 2.4, 0.5], parent: hips });
  const neck2 = b.joint("neck2", { at: [0, 2.85, 0.8], parent: neck1 });
  const head = b.joint("head", { at: [0, 3.4, 1.18], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 3.3, 1.5], parent: head });

  // ---- Legs: slender, tan above, cream below the knee, dark hooves ----
  const legs = [
    { side: "L", x: 0.22, z: 0.42, hip: "shoulderL", knee: "kneeL", ankle: "ankleL" },
    { side: "R", x: -0.22, z: 0.42, hip: "shoulderR", knee: "kneeR", ankle: "ankleR" },
    { side: "L", x: 0.22, z: -0.42, hip: "hipL", knee: "kneeBL", ankle: "ankleBL" },
    { side: "R", x: -0.22, z: -0.42, hip: "hipR", knee: "kneeBR", ankle: "ankleBR" },
  ];
  for (const leg of legs) {
    const { x, z } = leg;
    const hip = b.joint(leg.hip, { at: [x, 2.15, z], parent: hips });
    const knee = b.joint(leg.knee, { at: [x, 1.2, z], parent: hip });
    const ankle = b.joint(leg.ankle, { at: [x, 0.1, z], parent: knee });

    // upper leg
    b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.95, 8), TAN, {
      at: [x, 1.675, z],
      bone: hip,
    });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), TAN, { at: [x, 1.2, z], bone: knee });
    // lower leg tan band, then cream shin
    b.part(new THREE.CylinderGeometry(0.05, 0.045, 0.45, 8), TAN, {
      at: [x, 0.975, z],
      bone: knee,
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.04, 0.65, 8), LEG_CREAM, {
      at: [x, 0.425, z],
      bone: ankle,
    });
    // hoof sits on the floor
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), HOOF, {
      at: [x, 0.05, z],
      bone: ankle,
    });
  }

  // ---- Body and neck ----
  const bodySweep = b.sweep(BODY, 0.42, { color: FAWN });
  const neckSweep = b.sweep(NECK, 0.2, { color: FAWN });
  const bodySurf = b.surface(bodySweep);
  const neckSurf = b.surface(neckSweep);

  // Tail with a dark switch
  b.sweep(
    [
      [0, 2.25, -0.7],
      [0, 2.1, -0.95],
      [0, 1.7, -1.1],
    ],
    0.035,
    { color: TAN },
  );
  b.part(new THREE.SphereGeometry(0.07, 8, 6), MANE, { at: [0, 1.66, -1.12], bone: hips });

  // ---- Reticulated patches: cream outline, chestnut centre ----
  const rBody = rng(11);
  for (let i = 0; i < 46; i++) {
    const c = along(BODY, rBody());
    const az = rBody() * Math.PI * 2;
    const el = (rBody() - 0.5) * 1.2;
    const d = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
    const hit = bodySurf.nearest([c[0] + d[0] * 0.9, c[1] + d[1] * 0.9, c[2] + d[2] * 0.9]);
    b.stick(blob(0.13, 0.3), CREAM, hit);
    b.stick(blob(0.095, 0.45), CHESTNUT, hit);
  }

  const rNeck = rng(12);
  for (let i = 0; i < 30; i++) {
    const c = along(NECK, rNeck() * 0.9);
    const az = rNeck() * Math.PI * 2;
    const el = (rNeck() - 0.5) * 1.2;
    const d = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
    const hit = neckSurf.nearest([c[0] + d[0] * 0.6, c[1] + d[1] * 0.6, c[2] + d[2] * 0.6]);
    b.stick(blob(0.13, 0.3), CREAM, hit);
    b.stick(blob(0.095, 0.45), CHESTNUT, hit);
  }

  // ---- Short stiff mane down the top of the neck ----
  const rMane = rng(13);
  for (let i = 0; i < 24; i++) {
    const t = 0.06 + (i / 23) * 0.88;
    const c = along(NECK, t);
    const jitter = (rMane() - 0.5) * 0.04;
    const hit = neckSurf.nearest([c[0] + jitter, c[1] + 0.3, c[2] - 0.12]);
    b.stick(new THREE.ConeGeometry(0.028, 0.14, 4), MANE, hit);
  }

  // ---- Head ----
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.34), FAWN, { at: [0, 3.44, 1.36], bone: head });
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.22), MUZZLE, { at: [0, 3.38, 1.6], bone: head });
  b.part(new THREE.BoxGeometry(0.14, 0.06, 0.2), MUZZLE, { at: [0, 3.3, 1.6], bone: jaw });

  // Big leaf ears, flat and sideways
  for (const sx of [1, -1]) {
    const ear = new THREE.SphereGeometry(0.12, 10, 6);
    ear.scale(2.0, 0.9, 0.45);
    b.part(ear, TAN, { at: [sx * 0.2, 3.52, 1.3], bone: head });
    const inner = new THREE.SphereGeometry(0.08, 8, 6);
    inner.scale(1.6, 0.6, 0.3);
    b.part(inner, CREAM, { at: [sx * 0.22, 3.52, 1.34], bone: head });
  }

  // Eyes with long dark lashes
  for (const sx of [1, -1]) {
    const ex = sx * 0.115;
    b.part(new THREE.SphereGeometry(0.04, 8, 6), EYE, { at: [ex, 3.5, 1.42], bone: head });
    for (const dz of [-0.035, -0.017, 0, 0.017, 0.035]) {
      const lash = new THREE.BoxGeometry(0.012, 0.055, 0.012);
      lash.rotateZ(-sx * 0.4);
      b.part(lash, EYE, { at: [ex, 3.56, 1.42 + dz], bone: head });
    }
  }

  // Fuzzy ossicones with black tufts
  for (const sx of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.13, 6), OSSICONE, {
      at: [sx * 0.07, 3.66, 1.25],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), BLACK, {
      at: [sx * 0.07, 3.74, 1.25],
      bone: head,
    });
  }

  // Long dark tongue peeking out past the lower jaw
  const tongue = new THREE.CapsuleGeometry(0.028, 0.14, 4, 6);
  tongue.rotateX(Math.PI / 2);
  b.part(tongue, TONGUE, { at: [0, 3.27, 1.78], bone: jaw });

  // ---- Tail tuft and nostrils ----
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), BLACK, {
      at: [sx * 0.03, 3.36, 1.72],
      bone: head,
    });
  }

  return b.root;
}

export const meta = {
  name: "Reticulated giraffe calf",
  description:
    "A young reticulated giraffe with chestnut patches outlined in cream, a brown mane, fuzzy ossicones with black tufts, big ears, long lashes and a dark tongue peeking out.",
};
```