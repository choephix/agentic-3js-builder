```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type P = [number, number, number];

const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: P, s: number): P => [a[0] * s, a[1] * s, a[2] * s];
const mid = (a: P, b: P): P => mul(add(a, b), 0.5);
const size = (a: P): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: P): P => mul(a, 1 / size(a));

// An ellipsoid: a low-poly sphere squashed to size.
const blob = (r: number, sx = 1, sy = 1, sz = 1, seg = 12) => {
  const g = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
  g.scale(sx, sy, sz);
  return g;
};

const FUR = "#8d9299";
const FUR_DARK = "#6b7078";
const CREAM = "#ebe4d1";
const NOSE = "#1d1b1f";
const INK = "#120f11";
const WHITE = "#ffffff";
const CLAW = "#e4d9bd";
const BARK = "#6e4f37";
const BARK_DARK = "#4b3424";
const WOOD = "#d7b385";
const LEAF_A = "#97bba9";
const LEAF_B = "#6e9a86";

// Rest-pose joints on the left side (+X). The right side is mirrored.
const J = {
  hips: [0, 0.3, 0] as P,
  tail: [0, 0.26, -0.18] as P,
  chest: [0, 0.44, 0.01] as P,
  neck: [0, 0.53, 0.03] as P,
  head: [0, 0.62, 0.03] as P,
  jaw: [0, 0.585, 0.07] as P,
  ear: [0.095, 0.715, -0.005] as P,
  shoulder: [0.125, 0.47, 0.02] as P,
  elbow: [0.175, 0.34, 0.07] as P,
  wrist: [0.2, 0.245, 0.13] as P,
  hip: [0.1, 0.27, 0.03] as P,
  knee: [0.135, 0.2, 0.2] as P,
  ankle: [0.12, 0.055, 0.31] as P,
};

export const meta = {
  name: "koala",
  description:
    "A koala sitting on a eucalyptus stump, with fluffy ears, a big black nose and sharp claws.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });
  type Bone = ReturnType<typeof b.joint>;

  const put = (geo: THREE.BufferGeometry, color: string, at: P, bone: Bone) => {
    b.part(geo, color, { at, bone });
  };

  // A capsule from joint a to joint c, riding the bone that runs a -> c.
  const segment = (a: P, c: P, r: number, color: string, bone: Bone) => {
    b.part(new THREE.CapsuleGeometry(r, size(sub(c, a)), 3, 8), color, {
      at: mid(a, c),
      bone,
      dir: unit(sub(c, a)),
    });
  };

  // A claw: a cone whose tip points along dir.
  const claw = (base: P, dir: P, len: number, r: number, bone: Bone) => {
    const d = unit(dir);
    b.part(new THREE.ConeGeometry(r, len, 5), CLAW, {
      at: add(base, mul(d, len / 2)),
      bone,
      dir: d,
    });
  };

  // ---- skeleton ----
  const hips = b.joint("hips", { at: J.hips });
  const tail = b.joint("tail", { at: J.tail, parent: hips });
  const chest = b.joint("chest", { at: J.chest, parent: hips });
  const neck = b.joint("neck", { at: J.neck, parent: chest });
  const head = b.joint("head", { at: J.head, parent: neck });
  const jaw = b.joint("jaw", { at: J.jaw, parent: head });

  // ---- paired parts: ears, cheeks, eyes, arms, legs ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const m = (p: P): P => [p[0] * s, p[1], p[2]];

    const ear = b.joint("ear" + k, { at: m(J.ear), parent: head });
    const shoulder = b.joint("shoulder" + k, { at: m(J.shoulder), parent: chest });
    const elbow = b.joint("elbow" + k, { at: m(J.elbow), parent: shoulder });
    const wrist = b.joint("wrist" + k, { at: m(J.wrist), parent: elbow });
    const hip = b.joint("hip" + k, { at: m(J.hip), parent: hips });
    const knee = b.joint("knee" + k, { at: m(J.knee), parent: hip });
    const ankle = b.joint("ankle" + k, { at: m(J.ankle), parent: knee });

    // Ear: a grey disc with a cream inside.
    put(blob(0.07, 0.8, 1, 0.36), FUR, m([0.1, 0.72, 0]), ear);
    put(blob(0.05, 0.75, 0.95, 0.3), CREAM, m([0.1, 0.72, 0.02]), ear);

    // Cheek fluff and eye with a catchlight.
    put(blob(0.065), FUR, m([0.085, 0.6, 0.04]), head);
    put(blob(0.02, 1, 1, 0.7), INK, m([0.062, 0.672, 0.122]), head);
    put(blob(0.0065), WHITE, m([0.068, 0.68, 0.134]), head);

    // Foreleg: shoulder ball, upper arm, forearm, paw and four claws.
    put(blob(0.075), FUR, m(J.shoulder), shoulder);
    segment(m(J.shoulder), m(J.elbow), 0.055, FUR, shoulder);
    segment(m(J.elbow), m(J.wrist), 0.047, FUR, elbow);
    put(blob(0.05, 1.15, 0.9, 1), FUR, m([0.2, 0.22, 0.158]), wrist);
    for (const x of [-0.03, -0.01, 0.01, 0.03]) {
      claw(m([0.2 + x, 0.21, 0.198]), [0, -0.3, 1], 0.05, 0.011, wrist);
    }

    // Hindleg: hip ball, thigh, knee, shin, broad foot and five claws.
    put(blob(0.085), FUR, m(J.hip), hip);
    segment(m(J.hip), m(J.knee), 0.07, FUR, hip);
    put(blob(0.065), FUR, m(J.knee), knee);
    segment(m(J.knee), m(J.ankle), 0.058, FUR, knee);
    put(blob(0.07, 1.05, 0.5, 1.4), FUR, m([0.12, 0.035, 0.37]), ankle);
    for (const x of [-0.05, -0.025, 0, 0.025, 0.05]) {
      claw(m([0.12 + x, 0.03, 0.455]), [0, -0.12, 1], 0.055, 0.011, ankle);
    }
  }

  // ---- body: darker back, lighter belly and chest ----
  put(blob(0.15, 1.1, 0.95, 1), FUR_DARK, [0, 0.29, -0.02], hips); // rump
  put(blob(0.13, 1, 0.95, 0.85), FUR, [0, 0.34, 0.07], hips); // belly
  put(blob(0.14, 1.05, 1.1, 0.95), FUR, [0, 0.44, 0.03], chest); // chest
  put(blob(0.13, 1.05, 1, 0.7), FUR_DARK, [0, 0.4, -0.06], chest); // back saddle
  put(blob(0.11, 0.85, 0.95, 0.42), CREAM, [0, 0.42, 0.14], chest); // chest bib
  put(blob(0.1, 1, 0.8, 0.95), FUR, [0, 0.52, 0.03], neck); // neck
  put(blob(0.035), CREAM, [0, 0.255, -0.185], tail); // tail tuft

  // ---- head: broad skull, big black nose, cream chin ----
  put(blob(0.11, 1.12, 0.98, 0.95), FUR, [0, 0.625, 0.03], head); // skull
  put(blob(0.065, 1.2, 0.8, 0.9), FUR, [0, 0.59, 0.11], head); // muzzle
  put(blob(0.04, 1.25, 0.9, 0.85), NOSE, [0, 0.61, 0.158], head); // nose
  put(blob(0.012, 1.8, 0.5, 0.6), WHITE, [0.02, 0.636, 0.19], head); // nose glint
  put(blob(0.05, 1.3, 0.7, 0.9), CREAM, [0, 0.565, 0.13], jaw); // chin
  put(blob(0.011, 2.4, 0.5, 0.6), INK, [0, 0.568, 0.176], jaw); // mouth

  // ---- eucalyptus stump it sits on ----
  put(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 10), BARK, [0, 0.1, 0], hips);
  put(new THREE.CylinderGeometry(0.142, 0.142, 0.012, 10), WOOD, [0, 0.198, 0], hips);
  for (const a of [0.35, 2.4, 4.3]) {
    put(blob(0.05, 1.2, 0.6, 1.1, 8), BARK, [Math.cos(a) * 0.15, 0.02, Math.sin(a) * 0.15], hips);
  }

  // A twig leaving the stump, with a hanging cluster of eucalyptus leaves.
  const T: P = [-0.34, 0.19, -0.26];
  b.sweep([[-0.12, 0.13, -0.1], [-0.22, 0.165, -0.17], T], 0.014, { color: BARK_DARK });
  for (let i = 0; i < 8; i++) {
    const yaw = i * 0.78 + 0.2;
    const t = 0.35 + (i % 3) * 0.22;
    const dir: P = [Math.cos(t) * Math.sin(yaw), -Math.sin(t), Math.cos(t) * Math.cos(yaw)];
    const leaf = blob(0.05, 0.5, 0.12, 1.2, 8);
    leaf.rotateX(t);
    leaf.rotateY(yaw);
    put(leaf, i % 2 ? LEAF_A : LEAF_B, add(T, mul(dir, 0.05)), hips);
  }

  return b.root;
}
```