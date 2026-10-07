```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Toco toucan",
  description:
    "A toco toucan perched on a mossy stump: black body, white throat, a three-tone bill with a black tip, a blue eye ring and a red undertail.",
};

type V = [number, number, number];

// Flat palette: one shared material per colour.
const BLACK = "#16130f";
const WHITE = "#f4f0e6";
const ORANGE = "#f7a11a";
const RED = "#d93a1c";
const BLUE = "#44a9e6";
const NAVY = "#24324f";
const LEG = "#4d4b46";
const BARK = "#6e4c2e";
const BARK_DARK = "#3e2817";
const CUT = "#dcae74";
const MOSS = "#5f9b3d";

const UP: V = [0, 1, 0];

// Mirror a point across the centre line: +1 is the bird's left (+X), -1 its right.
const side = (s: number, p: V): V => [s * p[0], p[1], p[2]];
const mid = (p: V, q: V): V => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
const lerp3 = (p: V, q: V, t: number): V => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
  p[2] + (q[2] - p[2]) * t,
];
const dist = (p: V, q: V) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);

export default function build() {
  const b = createBuilder({ name: "toco-toucan" });

  // One primitive at `at`. `aim` turns its +Y axis toward a point; `scale` stretches it.
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    at: V,
    extra: { aim?: V; up?: V; scale?: V } = {},
  ) => b.part({ geo, color, at, ...extra });
  const ball = (w = 16, h = 12) => new THREE.SphereGeometry(1, w, h);
  const bead = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const pod = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 3, 6);

  // ── Skeleton: perched, bill level, wings folded ─────────────────────
  const perch = b.joint("perch", { at: [0, 0, 0] });
  const hips = b.joint("hips", { at: [0, 0.245, -0.02], aim: [0, 0.31, 0.06], parent: perch });
  const chest = b.joint("chest", { at: [0, 0.31, 0.06], aim: [0, 0.36, 0.11], parent: hips });
  const head = b.joint("head", { at: [0, 0.36, 0.11], aim: [0, 0.383, 0.335], parent: chest });
  b.joint("beakTip", { at: [0, 0.383, 0.335], parent: head });
  const jaw = b.joint("jaw", { at: [0, 0.346, 0.165], aim: [0, 0.334, 0.325], parent: head });
  b.joint("jawTip", { at: [0, 0.334, 0.325], parent: jaw });
  const tail1 = b.joint("tail1", { at: [0, 0.21, -0.115], aim: [0, 0.165, -0.18], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.165, -0.18], aim: [0, 0.125, -0.245], parent: tail1 });
  b.joint("tailTip", { at: [0, 0.125, -0.245], parent: tail2 });
  for (const [s, k] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const hip = b.joint(`hip${k}`, {
      at: side(s, [0.035, 0.225, 0]),
      aim: side(s, [0.035, 0.17, 0.01]),
      parent: hips,
    });
    const ankle = b.joint(`ankle${k}`, {
      at: side(s, [0.035, 0.17, 0.01]),
      aim: side(s, [0.035, 0.1675, 0.03]),
      parent: hip,
    });
    b.joint(`foot${k}`, { at: side(s, [0.035, 0.1675, 0.03]), parent: ankle });
    const wing = b.joint(`wing${k}`, {
      at: side(s, [0.055, 0.31, 0.02]),
      aim: side(s, [0.06, 0.225, -0.13]),
      parent: chest,
    });
    b.joint(`wingTip${k}`, { at: side(s, [0.06, 0.225, -0.13]), parent: wing });
  }

  // ── Body and head ───────────────────────────────────────────────────
  // Black torso, tilted so the breast points forward and up.
  put(ball(16, 12), BLACK, [0, 0.27, -0.01], {
    aim: [0, 0.33, 0.098],
    scale: [0.07, 0.125, 0.07],
  });
  // White bib on the breast and throat.
  put(ball(12, 9), WHITE, [0, 0.296, 0.125], { scale: [0.04, 0.05, 0.04] });
  put(ball(12, 9), WHITE, [0, 0.322, 0.14], { scale: [0.034, 0.03, 0.03] });
  // Red undertail coverts under the tail root.
  put(ball(12, 9), RED, [0, 0.196, -0.125], { scale: [0.04, 0.022, 0.03] });
  // Head.
  put(ball(16, 12), BLACK, [0, 0.372, 0.115], { scale: [0.05, 0.05, 0.056] });

  // Eyes: black eye, blue bare-skin ring, white glint.
  for (const s of [1, -1]) {
    const ring = new THREE.TorusGeometry(0.019, 0.0055, 8, 16);
    ring.rotateX(Math.PI / 2); // torus axis becomes +Y, so aiming points it out of the face
    put(ring, BLUE, side(s, [0.0485, 0.3858, 0.1378]), {
      aim: side(s, [0.1402, 0.4112, 0.1689]),
    });
    put(bead(0.0125), BLACK, side(s, [0.0485, 0.3858, 0.1378]));
    put(bead(0.0038), WHITE, side(s, [0.0568, 0.3881, 0.1406]));
  }

  // ── Bill ────────────────────────────────────────────────────────────
  // Upper mandible (on the head): red base, orange middle, black tip.
  const upTip: V = [0, 0.383, 0.335];
  const upAt = (m: number): V => [0, 0.398 - 0.0879 * m, 0.165 + 0.996 * m];
  put(ball(16, 12), RED, upAt(0.022), { aim: upTip, up: UP, scale: [0.034, 0.034, 0.03] });
  put(ball(16, 12), ORANGE, upAt(0.09), { aim: upTip, up: UP, scale: [0.031, 0.05, 0.027] });
  put(ball(16, 12), BLACK, upAt(0.148), { aim: upTip, up: UP, scale: [0.022, 0.036, 0.02] });
  // Nostrils on the top of the bill base.
  for (const s of [1, -1]) put(bead(0.0045), BLACK, side(s, [0.012, 0.42, 0.2]));

  // Lower mandible (on the jaw joint): orange with a black tip.
  const loTip: V = [0, 0.334, 0.325];
  const loAt = (m: number): V => [0, 0.346 - 0.0748 * m, 0.165 + 0.9972 * m];
  put(ball(16, 12), ORANGE, loAt(0.06), { aim: loTip, up: UP, scale: [0.024, 0.048, 0.017] });
  put(ball(16, 12), BLACK, loAt(0.124), { aim: loTip, up: UP, scale: [0.018, 0.03, 0.014] });

  // ── Tail: two black plates, the tip a little wider ──────────────────
  const plate = (a: V, c: V, w: number) =>
    put(new THREE.BoxGeometry(1, 1, 1), BLACK, mid(a, c), {
      aim: c,
      up: UP,
      scale: [w, dist(a, c) + 0.006, 0.012],
    });
  plate([0, 0.21, -0.115], [0, 0.165, -0.18], 0.07);
  plate([0, 0.165, -0.18], [0, 0.125, -0.245], 0.085);

  // ── Wings folded along the flanks, navy flight-feather tips ─────────
  for (const s of [1, -1]) {
    const S = side(s, [0.055, 0.31, 0.02]);
    const W = side(s, [0.06, 0.225, -0.13]);
    put(ball(14, 10), BLACK, mid(S, W), {
      aim: W,
      up: UP,
      scale: [0.014, 0.09, 0.034],
    });
    put(ball(12, 9), NAVY, lerp3(S, W, 1.2), {
      aim: lerp3(S, W, 2.2),
      up: UP,
      scale: [0.012, 0.035, 0.03],
    });
  }

  // ── Legs and zygodactyl feet (two toes forward, two back) ───────────
  for (const s of [1, -1]) {
    const hipP = side(s, [0.035, 0.225, 0]);
    const ankleP = side(s, [0.035, 0.17, 0.01]);
    put(pod(0.0065, dist(hipP, ankleP) - 0.013), LEG, mid(hipP, ankleP), { aim: ankleP });

    const plant = side(s, [0.035, 0.1675, 0.012]);
    const toe = (tip: V) =>
      put(pod(0.0075, dist(plant, tip) - 0.015), LEG, mid(plant, tip), { aim: tip });
    toe(side(s, [0.051, 0.1675, 0.052])); // outer front
    toe(side(s, [0.023, 0.1675, 0.052])); // inner front
    toe(side(s, [0.047, 0.1675, -0.024])); // outer back
    toe(side(s, [0.025, 0.1675, -0.024])); // inner back
  }

  // ── Perch: mossy stump, a stub branch, and berries by the feet ──────
  put(new THREE.CylinderGeometry(0.085, 0.1, 0.16, 12, 1), BARK, [0, 0.08, 0]);
  put(new THREE.CylinderGeometry(0.086, 0.086, 0.004, 12, 1), CUT, [0, 0.158, 0]);
  put(ball(8, 6), BARK_DARK, [0.086, 0.1, 0.028], { scale: [0.012, 0.02, 0.012] });
  put(ball(8, 6), BARK_DARK, [-0.04, 0.05, -0.088], { scale: [0.014, 0.01, 0.01] });

  const moss: V[] = [
    [0.058, 0.152, -0.066],
    [-0.085, 0.13, 0.03],
    [0.01, 0.14, 0.089],
    [0.07, 0.11, 0.06],
  ];
  for (const m of moss) put(ball(10, 7), MOSS, m, { scale: [0.028, 0.012, 0.022] });

  const branchBase: V = [0.07, 0.115, -0.05];
  const branchTip: V = [0.14, 0.13, -0.105];
  put(new THREE.CylinderGeometry(0.016, 0.022, dist(branchBase, branchTip) + 0.01, 8, 1), BARK, mid(branchBase, branchTip), {
    aim: branchTip,
  });

  put(bead(0.013), RED, [-0.072, 0.173, 0.005]);
  put(bead(0.012), ORANGE, [-0.07, 0.172, -0.045]);
  put(bead(0.012), RED, [-0.082, 0.17, -0.02]);

  return b.root;
}
```