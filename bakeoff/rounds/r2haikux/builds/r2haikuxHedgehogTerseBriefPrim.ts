import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

type V3 = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;
type Rand = ReturnType<typeof rng>;

export const meta = {
  name: "Hedgehog",
  description:
    "A stylised hedgehog: a round brown body under banded cream-and-brown quills, a cream face with a black nose and bright eyes, a hinged lower jaw, pink-lined ears and four stubby legs.",
};

// Flat palette
const FUR = "#7a5638";
const FACE = "#e6d3ab";
const QUILL_ROOT = "#f0e2c2";
const QUILL_TIP = "#4d3423";
const LEG = "#4a3224";
const NOSE = "#17120f";
const EYE = "#100c09";
const SHINE = "#ffffff";
const EAR = "#5b3e2a";
const EAR_IN = "#d9a090";

// Body layout in metres, model space (+Z is the face)
const BODY_C: V3 = [0, 0.08, -0.012];
const BODY_R: V3 = [0.064, 0.05, 0.08];
const BELLY_C: V3 = [0, 0.066, 0];
const BELLY_R: V3 = [0.056, 0.042, 0.072];
const NECK_C: V3 = [0, 0.082, 0.06];
const NECK_R: V3 = [0.046, 0.04, 0.04];
const HEAD_C: V3 = [0, 0.095, 0.118];
const HEAD_R: V3 = [0.038, 0.036, 0.044];

// Vector helpers
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const mid = (a: V3, b: V3): V3 => mul(add(a, b), 0.5);
const unit = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

// The backward lean every quill shares.
const BACK = unit([0, 0.25, -1]);

// A point on an ellipsoid (centre c, radii r) in direction dir, with its outward normal.
function onEllipsoid(c: V3, r: V3, dir: V3) {
  const d = unit(dir);
  const k = 1 / Math.hypot(d[0] / r[0], d[1] / r[1], d[2] / r[2]);
  const p: V3 = [c[0] + d[0] * k, c[1] + d[1] * k, c[2] + d[2] * k];
  const n = unit([d[0] / (r[0] * r[0]), d[1] / (r[1] * r[1]), d[2] / (r[2] * r[2])]);
  return { p, n };
}

// Direction at angle theta (0 = front, PI = back, round the body) and elevation phi.
const dirAt = (theta: number, phi: number): V3 => [
  Math.sin(theta) * Math.cos(phi),
  Math.sin(phi),
  Math.cos(theta) * Math.cos(phi),
];

// One quill: a cream root band and a dark tip, aimed along the same axis.
function quill(
  b: Builder,
  bone: Joint,
  rand: Rand,
  c: V3,
  r: V3,
  theta: number,
  phi: number,
  length: number,
  width: number,
) {
  const { p, n } = onEllipsoid(c, r, dirAt(theta, phi));
  const wobble: V3 = [
    (rand() - 0.5) * 0.3,
    (rand() - 0.5) * 0.3,
    (rand() - 0.5) * 0.3,
  ];
  const dir = unit(add(add(mul(n, 0.8), mul(BACK, 0.6)), wobble));
  const root = add(p, mul(n, -0.004)); // root sunk a few millimetres into the skin
  const lower = length * 0.55;
  const upper = length - lower;

  b.part(new THREE.CylinderGeometry(width * 0.5, width, lower, 6), QUILL_ROOT, {
    at: add(root, mul(dir, lower / 2)),
    bone,
    dir,
  });
  b.part(new THREE.CylinderGeometry(0, width * 0.5, upper, 6), QUILL_TIP, {
    at: add(root, mul(dir, lower + upper / 2)),
    bone,
    dir,
  });
}

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rand = rng(11);
  const ball = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);

  // ---- skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: BODY_C });
  const chest = b.joint("chest", { at: [0, 0.08, 0.03], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.086, 0.09], parent: chest });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.066, 0.15], parent: head });

  // ---- body, belly, neck, head --------------------------------------------
  b.part(ball(14, 10), FUR, { at: BODY_C, bone: hips, scale: BODY_R });
  b.part(ball(12, 8), FACE, { at: BELLY_C, bone: hips, scale: BELLY_R });
  b.part(ball(10, 8), FUR, { at: NECK_C, bone: neck, scale: NECK_R });
  b.part(ball(14, 10), FACE, { at: HEAD_C, bone: head, scale: HEAD_R });

  // ---- snout, nose, lower jaw ---------------------------------------------
  b.part(new THREE.CylinderGeometry(0.012, 0.022, 0.06, 10), FACE, {
    at: [0, 0.084, 0.18],
    bone: head,
    dir: [0, 0, 1],
  });
  b.part(ball(12, 8), NOSE, {
    at: [0, 0.084, 0.2105],
    bone: head,
    scale: [0.0105, 0.0105, 0.0105],
  });
  b.part(ball(12, 6), FACE, {
    at: [0, 0.066, 0.185],
    bone: jaw,
    scale: [0.013, 0.007, 0.026],
  });

  // ---- eyes, eye shines, ears ---------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const eye = onEllipsoid(HEAD_C, HEAD_R, [s * 0.55, 0.5, 0.6]);
    b.part(ball(10, 8), EYE, {
      at: eye.p,
      bone: head,
      scale: [0.0088, 0.0088, 0.0088],
    });
    b.part(ball(6, 5), SHINE, {
      at: add(eye.p, mul(eye.n, 0.0085)),
      bone: head,
      scale: [0.0032, 0.0032, 0.0032],
    });

    const ear = onEllipsoid(HEAD_C, HEAD_R, [s * 0.8, 0.5, -0.05]);
    const earJoint = b.joint(`ear${side}`, { at: ear.p, parent: head });
    b.part(ball(10, 8), EAR, {
      at: ear.p,
      bone: earJoint,
      scale: [0.0045, 0.0145, 0.0115],
    });
    b.part(ball(10, 8), EAR_IN, {
      at: add(ear.p, [s * 0.003, 0, 0]),
      bone: earJoint,
      scale: [0.0037, 0.0118, 0.0095],
    });
  }

  // ---- legs: hip, knee, ankle, and a paw with three toes ------------------
  const legs: [string, V3, V3, V3][] = [
    ["FL", [0.042, 0.06, 0.04], [0.045, 0.03, 0.042], [0.047, 0.014, 0.045]],
    ["FR", [-0.042, 0.06, 0.04], [-0.045, 0.03, 0.042], [-0.047, 0.014, 0.045]],
    ["BL", [0.042, 0.06, -0.06], [0.045, 0.03, -0.058], [0.047, 0.014, -0.056]],
    ["BR", [-0.042, 0.06, -0.06], [-0.045, 0.03, -0.058], [-0.047, 0.014, -0.056]],
  ];
  for (const [tag, hp, kp, ap] of legs) {
    const hip = b.joint(`hip${tag}`, { at: hp, parent: hips });
    const knee = b.joint(`knee${tag}`, { at: kp, parent: hip });
    const ankle = b.joint(`ankle${tag}`, { at: ap, parent: knee });

    b.part(ball(10, 8), LEG, {
      at: mid(hp, kp),
      bone: hip,
      scale: [0.02, 0.022, 0.02],
    });
    b.part(ball(10, 8), LEG, {
      at: mid(kp, ap),
      bone: knee,
      scale: [0.015, 0.016, 0.015],
    });
    b.part(ball(10, 8), LEG, {
      at: [ap[0], 0.009, ap[2] + 0.005],
      bone: ankle,
      scale: [0.02, 0.009, 0.022],
    });
    for (const t of [-1, 0, 1]) {
      b.part(ball(8, 6), LEG, {
        at: [ap[0] + t * 0.0075, 0.0065, ap[2] + 0.02],
        bone: ankle,
        scale: [0.0065, 0.0065, 0.0065],
      });
    }
  }

  // ---- quills over the back and sides --------------------------------------
  // Rows climb from the flanks over the top; the face side stays bare.
  const BODY_T0 = 1.2;
  const BODY_SPAN = Math.PI * 2 - 2.4;
  for (let row = 0; row < 8; row++) {
    const phi = -0.12 + row * 0.2;
    const count = Math.max(
      4,
      Math.round((BODY_SPAN * Math.cos(phi) * 0.072) / 0.014),
    );
    const step = BODY_SPAN / count;
    for (let k = 0; k < count; k++) {
      const theta =
        BODY_T0 + (k + 0.5 * (row % 2) + (rand() - 0.5) * 0.4) * step;
      const back = Math.max(0, -Math.cos(theta));
      const length = (0.026 + 0.01 * back) * (0.85 + 0.3 * rand());
      quill(b, hips, rand, BODY_C, BODY_R, theta, phi, length, 0.004);
    }
  }

  // ---- quills over the crown of the head (none on the face) ---------------
  const HEAD_T0 = 2.1;
  const HEAD_SPAN = Math.PI * 2 - 4.2;
  for (let row = 0; row < 6; row++) {
    const phi = 0.15 + row * 0.2;
    const count = Math.max(
      3,
      Math.round((HEAD_SPAN * Math.cos(phi) * 0.04) / 0.011),
    );
    const step = HEAD_SPAN / count;
    for (let k = 0; k < count; k++) {
      const theta =
        HEAD_T0 + (k + 0.5 * (row % 2) + (rand() - 0.5) * 0.4) * step;
      const back = Math.max(0, -Math.cos(theta));
      const length = (0.017 + 0.008 * back) * (0.85 + 0.3 * rand());
      quill(b, head, rand, HEAD_C, HEAD_R, theta, phi, length, 0.003);
    }
  }

  return b.root;
}
