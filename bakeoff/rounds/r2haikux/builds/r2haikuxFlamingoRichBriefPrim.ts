import * as THREE from "three";
import { catmull, createBuilder } from "../../../../src/index";

type V3 = [number, number, number];

export const meta = {
  name: "flamingo",
  description:
    "A greater flamingo standing tall in shallow water: candy-pink body grading to coral wings with black flight tips, S-curved neck, bent pale beak with a black tip, pale yellow eyes, rose legs with knobbly joints and webbed feet.",
};

const COL = {
  candy: "#ff9ec6",
  candyLight: "#ffc4da",
  candyDeep: "#ff7fb0",
  coralPink: "#ff8c9c",
  coral: "#ff6b57",
  coralDeep: "#e8503f",
  black: "#1c1a22",
  beak: "#ffd3df",
  rose: "#f06f97",
  roseKnee: "#e05a85",
  web: "#d9557f",
  eye: "#fff2a2",
  pupil: "#1b1a20",
  water: "#6fd3d4",
  ripple: "#e8fbf8",
};

// Body lean about X (radians): chest up, tail down.
const LEAN = -0.42;

const P = (x: number, y: number, z: number): V3 => [x, y, z];

// Rotation carrying +Y onto direction d, built from an orthonormal basis.
function yAlong(d: V3): THREE.Matrix4 {
  const y = new THREE.Vector3(d[0], d[1], d[2]).normalize();
  const ref =
    Math.abs(y.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

// Flattened or stretched ellipsoid, centred on its origin.
function blob(r: V3, rot: V3 = [0, 0, 0], seg = 10): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
  g.scale(r[0], r[1], r[2]);
  g.rotateX(rot[0]);
  g.rotateY(rot[1]);
  g.rotateZ(rot[2]);
  return g;
}

// Tapered beam from a (radius rA) to c (radius rB), with its midpoint.
function beam(a: V3, c: V3, rA: number, rB: number, seg = 6) {
  const d: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const g = new THREE.CylinderGeometry(rB, rA, Math.hypot(...d), seg, 1);
  g.applyMatrix4(yAlong(d));
  const at: V3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  return { geo: g, at };
}

// Webbed foot lying flat: outline in (u, v) with v = -forward, heel at origin.
const WEB_OUTLINE: [number, number][] = [
  [-0.06, -0.02],
  [-0.085, -0.08],
  [-0.04, -0.05],
  [0, -0.11],
  [0.04, -0.05],
  [0.085, -0.08],
  [0.06, -0.02],
  [0, 0.015],
];

function webGeo(): THREE.BufferGeometry {
  const shape = new THREE.Shape(WEB_OUTLINE.map(([u, v]) => new THREE.Vector2(u, v)));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2); // lie flat, face up, toes toward +Z
  return g;
}

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: P(0, 0.86, -0.01) });
  const head = b.joint("head", { at: P(0, 1.44, 0.29), parent: hips });
  const jaw = b.joint("jaw", { at: P(0, 1.41, 0.36), parent: head });
  const wingL = b.joint("wingL", { at: P(0.12, 0.84, -0.02), parent: hips });
  const wingR = b.joint("wingR", { at: P(-0.12, 0.84, -0.02), parent: hips });
  const tipL = b.joint("tipL", { at: P(0.12, 0.77, -0.24), parent: wingL });
  const tipR = b.joint("tipR", { at: P(-0.12, 0.77, -0.24), parent: wingR });

  // S-curve: forward from the chest, back through the middle, forward to the head.
  const neck = b.chain(
    "neck",
    catmull([
      P(0, 0.94, 0.1),
      P(0, 1.02, 0.24),
      P(0, 1.13, 0.3),
      P(0, 1.23, 0.2),
      P(0, 1.32, 0.14),
      P(0, 1.41, 0.25),
    ]),
    { parent: hips, role: "neck" },
  );
  b.sweep(neck, 0.036, { color: COL.candy });

  // ---- body ---------------------------------------------------------------
  b.part(blob([0.13, 0.15, 0.25], [LEAN, 0, 0]), COL.candy, {
    at: P(0, 0.86, -0.01),
    bone: hips,
  });
  b.part(blob([0.1, 0.11, 0.11]), COL.candy, { at: P(0, 0.95, 0.13), bone: hips });
  b.part(blob([0.11, 0.08, 0.2], [LEAN, 0, 0]), COL.candyLight, {
    at: P(0, 0.765, 0),
    bone: hips,
  });

  // Tail fan, drooping behind.
  for (const [x, yaw] of [
    [-0.03, -0.35],
    [0, 0],
    [0.03, 0.35],
  ] as const) {
    b.part(blob([0.035, 0.03, 0.06], [LEAN - 0.2, yaw, 0]), COL.candyDeep, {
      at: P(x, 0.79, -0.27),
      bone: hips,
    });
  }

  // Thigh feathers that hide the hip joints.
  for (const s of [1, -1] as const) {
    b.part(blob([0.05, 0.06, 0.06]), COL.candy, { at: P(s * 0.075, 0.755, 0), bone: hips });
  }

  // ---- folded wings -------------------------------------------------------
  for (const s of [1, -1] as const) {
    const wing = s > 0 ? wingL : wingR;
    const tip = s > 0 ? tipL : tipR;
    const at = (x: number, y: number, z: number): V3 => P(s * x, y, z);
    const covert = (col: string, x: number, y: number, z: number, r: V3) =>
      b.part(blob(r, [LEAN, 0, 0]), col, { at: at(x, y, z), bone: wing });

    // Deep coral underlayer tucked along the flank.
    covert(COL.coralDeep, 0.112, 0.79, -0.07, [0.036, 0.07, 0.24]);

    // Coral covert rows.
    covert(COL.coral, 0.135, 0.893, 0.08, [0.024, 0.05, 0.08]);
    covert(COL.coral, 0.136, 0.852, -0.02, [0.024, 0.05, 0.08]);
    covert(COL.coral, 0.134, 0.805, -0.11, [0.024, 0.05, 0.08]);
    covert(COL.coral, 0.128, 0.758, -0.2, [0.022, 0.046, 0.07]);

    // Pink-coral ridge along the top of the wing.
    covert(COL.coralPink, 0.118, 0.955, 0.06, [0.02, 0.028, 0.07]);
    covert(COL.coralPink, 0.118, 0.905, -0.06, [0.02, 0.028, 0.07]);
    covert(COL.coralPink, 0.12, 0.854, -0.16, [0.018, 0.026, 0.06]);

    // Scalloped rear edge.
    covert(COL.coralDeep, 0.114, 0.746, -0.23, [0.02, 0.03, 0.035]);
    covert(COL.coralDeep, 0.11, 0.719, -0.27, [0.018, 0.028, 0.035]);

    // Black flight feathers fanning past the tail.
    const quills: [V3, V3][] = [
      [P(0.12, 0.8, -0.16), P(0.12, 0.72, -0.48)],
      [P(0.12, 0.785, -0.2), P(0.12, 0.7, -0.52)],
      [P(0.12, 0.77, -0.24), P(0.115, 0.68, -0.55)],
      [P(0.115, 0.755, -0.27), P(0.11, 0.67, -0.56)],
      [P(0.11, 0.74, -0.3), P(0.1, 0.68, -0.52)],
    ];
    for (const [p0, p1] of quills) {
      const q = beam(at(p0[0], p0[1], p0[2]), at(p1[0], p1[1], p1[2]), 0.016, 0.005, 5);
      b.part(q.geo, COL.black, { at: q.at, bone: tip });
    }
  }

  // ---- head, eyes and beak ------------------------------------------------
  b.part(blob([0.052, 0.058, 0.08], [0.35, 0, 0]), COL.candy, {
    at: P(0, 1.44, 0.29),
    bone: head,
  });

  for (const s of [1, -1] as const) {
    b.part(blob([0.014, 0.014, 0.014]), COL.eye, { at: P(s * 0.046, 1.458, 0.325), bone: head });
    b.part(blob([0.0065, 0.0065, 0.0065]), COL.pupil, {
      at: P(s * 0.057, 1.458, 0.333),
      bone: head,
    });
  }

  const beakSeg = (
    a: V3,
    c: V3,
    rA: number,
    rB: number,
    col: string,
    bone: typeof head,
  ) => {
    const g = beam(a, c, rA, rB, 7);
    b.part(g.geo, col, { at: g.at, bone });
  };

  // Upper mandible, bent down; black tip.
  const U0 = P(0, 1.45, 0.36);
  const U1 = P(0, 1.43, 0.43);
  const U2 = P(0, 1.39, 0.47);
  const U3 = P(0, 1.35, 0.46);
  beakSeg(U0, U1, 0.022, 0.019, COL.beak, head);
  beakSeg(U1, U2, 0.019, 0.014, COL.beak, head);
  beakSeg(U2, U3, 0.014, 0.006, COL.black, head);

  // Lower mandible on its own jaw joint; black tip.
  const L0 = P(0, 1.41, 0.36);
  const L1 = P(0, 1.395, 0.42);
  const L2 = P(0, 1.365, 0.45);
  const L3 = P(0, 1.34, 0.43);
  beakSeg(L0, L1, 0.02, 0.017, COL.beak, jaw);
  beakSeg(L1, L2, 0.017, 0.012, COL.beak, jaw);
  beakSeg(L2, L3, 0.012, 0.005, COL.black, jaw);

  // ---- legs and webbed feet -----------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const fx = s * 0.07;
    const knee = P(s * 0.065, 0.66, 0.04);
    const hock = P(fx, 0.42, -0.04);
    const heel = P(fx, 0.012, 0.06);

    const leg = b.chain(`leg${side}`, [P(fx, 0.8, -0.02), knee, hock, heel], {
      parent: hips,
      role: "leg",
    });
    b.sweep(leg, 0.013, { color: COL.rose });

    // Knobbly knee and hock.
    b.part(blob([0.027, 0.03, 0.027]), COL.roseKnee, { at: knee });
    b.part(blob([0.022, 0.025, 0.022]), COL.roseKnee, { at: hock });

    // Web fan and three front toes.
    b.part(webGeo(), COL.web, { at: P(fx, 0.006, 0.06) });
    for (const [u, f] of [
      [-0.085, 0.08],
      [0, 0.11],
      [0.085, 0.08],
    ] as const) {
      const t = beam(P(fx, 0.008, 0.06), P(fx + u, 0.008, 0.06 + f), 0.008, 0.005, 6);
      b.part(t.geo, COL.rose, { at: t.at });
    }
  }

  // ---- shallow water -------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.5, 0.52, 0.02, 28), COL.water, {
    at: P(0, -0.01, 0.04),
    bone: hips,
  });
  for (const [r, t] of [
    [0.2, 0.006],
    [0.34, 0.005],
  ] as const) {
    const ring = new THREE.TorusGeometry(r, t, 6, 32);
    ring.rotateX(Math.PI / 2);
    b.part(ring, COL.ripple, { at: P(0, 0.004, 0.04), bone: hips });
  }

  return b.root;
}
