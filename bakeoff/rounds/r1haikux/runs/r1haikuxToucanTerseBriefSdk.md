```ts
import * as THREE from "three";
import { createBuilder, frame } from "agentic-3js-builder";

export const meta = {
  name: "Toco toucan",
  description:
    "A standing toco toucan: glossy black plumage, a white throat, a big orange bill with a black tip, cobalt eye rings and a red undertail.",
};

type V3 = [number, number, number];

// Nine flat colours.
const INK = "#17130f";
const BIB = "#f3efe6";
const BILL = "#f7a41b";
const BILL_TIP = "#14100c";
const RING = "#2d6ddb";
const PUPIL = "#0b0b0b";
const RED = "#e2402c";
const LEG = "#7c8995";
const CLAW = "#1d1d1d";

const FWD: V3 = [0, 0, 1];

const add = (a: V3, c: V3): V3 => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V3, c: V3): V3 => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const unit = (a: V3): V3 => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const along = (p: V3, d: V3, t: number): V3 => add(p, mul(d, t));
const span = (a: V3, c: V3): number =>
  Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);

// Every piece is built with its anchor at the origin and its length running up +Y,
// so a stick on a frame sits on the surface and points along that frame's axis.
const tube = (len: number, r0: number, r1: number, seg = 10) =>
  new THREE.CylinderGeometry(r1, r0, len, seg, 1).translate(0, len / 2, 0);

// Upper hemisphere resting on its base, optionally squashed along its axis.
const dome = (r: number, squash = 1, seg = 14) =>
  new THREE.SphereGeometry(r, seg, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(
    1,
    squash,
    1,
  );

const ball = (r: number, seg = 10) =>
  new THREE.SphereGeometry(r, seg, 8).translate(0, r, 0);

const turned = (profile: [number, number][], seg = 14) =>
  new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    seg,
  );

// Radius (x) against height (y) for the turned pieces.
const TORSO: [number, number][] = [
  [0, 0],
  [0.036, 0.01],
  [0.06, 0.04],
  [0.078, 0.1],
  [0.087, 0.15],
  [0.086, 0.2],
  [0.07, 0.24],
  [0.04, 0.265],
  [0, 0.275],
];

const HEAD: [number, number][] = [
  [0, 0],
  [0.05, 0],
  [0.064, 0.025],
  [0.075, 0.065],
  [0.079, 0.1],
  [0.074, 0.13],
  [0.054, 0.152],
  [0, 0.162],
];

const WING: [number, number][] = [
  [0, 0],
  [0.02, 0.012],
  [0.034, 0.05],
  [0.036, 0.095],
  [0.026, 0.13],
  [0, 0.15],
];

export default function build() {
  const b = createBuilder({ name: "toco-toucan" });

  // ---- Skeleton -------------------------------------------------------
  // Spine: hips (rump, root) -> chest (top of body) -> head (base of skull).
  const hipsP: V3 = [0, 0.14, -0.1];
  const chestP: V3 = [0, 0.31, 0.114];
  const headP: V3 = [0, 0.37, 0.135];
  const hips = b.joint("hips", { at: hipsP, aim: chestP });
  const chest = b.joint("chest", { at: chestP, aim: headP, parent: hips });
  const head = b.joint("head", {
    at: headP,
    aim: [0, 0.45, 0.14],
    parent: chest,
  });

  // Bill: upper and lower mandibles hinge from the skull so the beak can open.
  const beakDir = unit([0, -0.12, 1]);
  const upperBase: V3 = [0, 0.46, 0.19];
  const upperTip = along(upperBase, beakDir, 0.19);
  const jawU = b.joint("jawU", { at: upperBase, aim: upperTip, parent: head });
  b.joint("beakTip", {
    at: upperTip,
    aim: along(upperTip, beakDir, 0.02),
    parent: jawU,
  });

  const lowerBase: V3 = [0, 0.44, 0.19];
  const lowerTip = along(lowerBase, beakDir, 0.16);
  const jawL = b.joint("jawL", { at: lowerBase, aim: lowerTip, parent: head });
  b.joint("lowerTip", {
    at: lowerTip,
    aim: along(lowerTip, beakDir, 0.02),
    parent: jawL,
  });

  // Tail: three joints running back and down from the rump.
  const tail1P: V3 = [0, 0.205, -0.105];
  const tail2P: V3 = [0, 0.155, -0.19];
  const tail3P: V3 = [0, 0.1, -0.285];
  const tail1 = b.joint("tail1", { at: tail1P, aim: tail2P, parent: hips });
  const tail2 = b.joint("tail2", { at: tail2P, aim: tail3P, parent: tail1 });
  b.joint("tail3", { at: tail3P, aim: [0, 0.07, -0.33], parent: tail2 });

  // ---- Body -----------------------------------------------------------
  b.stick(turned(TORSO, 14), INK, hips);
  b.stick(tube(0.07, 0.052, 0.046, 10), INK, chest); // neck
  b.stick(turned(HEAD, 14), INK, head);

  // White throat: one patch on the skull, one on the neck.
  b.stick(
    dome(0.042, 0.55, 14),
    BIB,
    frame([0, 0.405, 0.19], unit([0, -0.25, 0.97])),
  );
  b.stick(
    dome(0.035, 0.9, 12),
    BIB,
    frame([0, 0.33, 0.158], unit([0, -0.2, 0.98])),
  );

  // Red undertail coverts under the tail base.
  b.stick(
    dome(0.04, 0.6, 12),
    RED,
    frame([0, 0.175, -0.125], unit([0, -0.7, -0.7])),
  );

  // Tail: a round wedge, widest at the base.
  b.stick(tube(span(tail1P, tail2P), 0.036, 0.03, 10), INK, tail1);
  b.stick(tube(span(tail2P, tail3P), 0.03, 0.012, 10), INK, tail2);

  // ---- Bill -----------------------------------------------------------
  // Upper mandible: orange cone with a black tip and a dark ridge along its top.
  b.stick(tube(0.19, 0.036, 0, 14), BILL, jawU);
  b.stick(
    tube(0.06, 0.0135, 0, 12),
    BILL_TIP,
    frame(along(upperBase, beakDir, 0.13), beakDir),
  );

  const upperUp: V3 = [0, 0.9929, 0.1191]; // perpendicular to beakDir, facing up
  const topAt = (t: number): V3 =>
    add(along(upperBase, beakDir, t), mul(upperUp, 0.036 * (1 - t / 0.19) * 0.98));
  const ridgeA = topAt(0.012);
  const ridgeB = topAt(0.11);
  b.stick(
    tube(span(ridgeA, ridgeB), 0.0026, 0.002, 6),
    INK,
    frame(ridgeA, unit(sub(ridgeB, ridgeA))),
  );

  // Lower mandible: shorter orange cone with a black tip.
  b.stick(tube(0.16, 0.02, 0, 12), BILL, jawL);
  b.stick(
    tube(0.05, 0.0095, 0, 12),
    BILL_TIP,
    frame(along(lowerBase, beakDir, 0.11), beakDir),
  );

  // ---- Eyes -----------------------------------------------------------
  for (const s of [1, -1]) {
    const p: V3 = [s * 0.065, 0.465, 0.176];
    const n = unit([s * 0.848, 0.12, 0.53]);
    b.stick(dome(0.028, 0.45, 12), RING, frame(p, n));
    b.stick(dome(0.0125, 0.9, 10), PUPIL, frame(along(p, n, 0.004), n));
  }

  // ---- Legs, feet and wings (mirrored) ---------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.045;
    const hipP: V3 = [x, 0.16, -0.03];
    const kneeP: V3 = [x, 0.09, 0.02];
    const ankleP: V3 = [x, 0.035, -0.02];
    const sole: V3 = [x, 0.0115, -0.02];

    const hip = b.joint(`hip${L}`, { at: hipP, aim: kneeP, parent: hips });
    const knee = b.joint(`knee${L}`, { at: kneeP, aim: ankleP, parent: hip });
    const ankle = b.joint(`ankle${L}`, {
      at: ankleP,
      aim: along(ankleP, FWD, 0.03),
      parent: knee,
    });
    b.joint(`toe${L}`, { at: sole, aim: along(sole, FWD, 0.05), parent: ankle });

    // Thigh (mostly hidden in belly feathers), tarsus, ankle.
    b.stick(tube(span(hipP, kneeP), 0.021, 0.016, 10), INK, hip);
    b.stick(tube(span(kneeP, ankleP), 0.013, 0.011, 8), LEG, knee);
    b.stick(ball(0.0125, 8), LEG, ankle);

    // Toes lie on the floor: forward, forward-outward, and a hind toe.
    const toes: [V3, number][] = [
      [FWD, 0.065],
      [unit([s * 0.45, 0, 0.9]), 0.05],
      [[0, 0, -1], 0.032],
    ];
    for (const [dir, len] of toes) {
      b.stick(tube(len, 0.0115, 0.0085, 8), LEG, frame(sole, dir));
      b.stick(
        tube(0.02, 0.0085, 0, 8),
        CLAW,
        frame(along(sole, dir, len), dir),
      );
    }

    // Folded wing lying along the flank, aimed back and down.
    const wing = b.joint(`wing${L}`, {
      at: [s * 0.072, 0.262, 0.05],
      aim: [s * 0.082, 0.168, -0.06],
      parent: chest,
    });
    b.stick(turned(WING, 10), INK, wing);
  }

  return b.root;
}
```