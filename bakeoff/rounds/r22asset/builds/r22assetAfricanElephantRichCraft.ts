import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { catmull, bezier } from "../../../../src/path";
import { countershade, gradient, mottle, paint, stripes } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description: "Adult African bush elephant: faceted low-poly bull with big fan ears, curved ivory tusks and a posable trunk.",
  style: "low-poly",
  commit: "88fc1f0",
};

const GREY = "#8c8681";
const GREY_D = "#756f6b";
const BELLY = "#a89e96";
const WRINK = "#5f5a57";
const DUST = "#a68763";
const IVORY = "#ece0c0";
const NAIL = "#cdbf9d";
const DARK = "#2a2523";
const PINK = "#b88f88";
const AMBER = "#c9892a";

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 2.1, -1.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.1, -1.2],
      [0, 2.15, -0.3],
      [0, 2.2, 0.5],
      [0, 2.3, 1.2],
    ]),
    { parent: hips, role: "spine", count: 3 },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: chest, at: [0, 2.3, 1.4], aim: [0, 2.3, 2.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.95, 1.75], aim: [0, 1.75, 2.4], role: "jaw" });

  // Paints
  const base = countershade(mottle(GREY, GREY_D, { size: 0.6, seed: 4 }), BELLY, { level: -0.3 });
  const bodyP = stripes(base, WRINK, { size: 0.2, axis: "z", width: 0.14, wobble: 0.8, seed: 3 });
  const trunkP = stripes(base, WRINK, { size: 0.07, axis: "y", width: 0.35, wobble: 0.3, seed: 8 });
  const legP = gradient(stripes(base, WRINK, { size: 0.16, axis: "y", width: 0.14, wobble: 0.7, seed: 5 }), DUST, [0, 0.8, 0], [0, 0.05, 0]);
  const earP = paint((_p, _n, s) => {
    if (s[0] > 1.05) return GREY_D;
    if (s[0] > 0.2 && s[0] < 0.95 && Math.abs(s[1] + 0.1) < 0.5) return mottle(PINK, GREY, { size: 0.25, seed: 2 });
    return base;
  });

  // Body
  b.sweep(
    catmull([
      [0, 2.05, -1.9],
      [0, 2.1, -1.0],
      [0, 2.15, 0],
      [0, 2.25, 1.1],
    ]),
    (t) => {
      const k = Math.sin(Math.PI * (0.1 + 0.8 * t));
      return [0.45 + 0.35 * k, 0.55 + 0.4 * k];
    },
    { bone: [hips, spine], color: bodyP, sides: 10, name: "body" },
  );
  b.sweep(
    [
      [0, 2.2, 0.9],
      [0, 2.3, 1.7],
    ],
    0.62,
    { bone: head, color: bodyP, sides: 10, name: "neck" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.55, 8, 6), bodyP, { bone: chest, at: [s * 0.6, 2.35, 0.8], scale: [0.8, 1.4, 1.2], name: "shoulder" });
    b.part(new THREE.SphereGeometry(0.55, 8, 6), bodyP, { bone: hips, at: [s * 0.6, 2.3, -1.3], scale: [0.8, 1.3, 1.3], name: "haunch" });
  }

  // Head
  b.part(new THREE.SphereGeometry(0.5, 10, 8), bodyP, { bone: head, at: [0, 2.3, 1.85], scale: [0.9, 1.2, 1.1], name: "skull" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.3, 7, 5), bodyP, { bone: head, at: [s * 0.2, 2.85, 1.85], name: "forehead" });
    b.part(new THREE.SphereGeometry(0.22, 7, 5), bodyP, { bone: head, at: [s * 0.32, 1.95, 2.2], scale: [0.8, 1, 1.1], name: "cheek" });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), AMBER, { bone: head, at: [s * 0.43, 2.32, 2.13], name: "eyeIris" });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), DARK, { bone: head, at: [s * 0.46, 2.32, 2.16], name: "pupil" });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), GREY_D, { bone: head, at: [s * 0.42, 2.4, 2.1], scale: [0.7, 0.6, 1.2], name: "brow" });
    b.part(new THREE.SphereGeometry(0.04, 5, 4), DARK, { bone: head, at: [s * 0.46, 2.15, 2.1], name: "gland" });
  }
  b.frustumBox([0, 1.88, 1.95], [0, 1.72, 2.4], [0.42, 0.2], [0.26, 0.16], { bone: jaw, color: bodyP, name: "lowerJaw" });

  // Trunk
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.0, 2.2],
      [0, 1.55, 2.55],
      [0, 1.0, 2.75],
      [0, 0.55, 2.7],
      [0, 0.3, 2.9],
    ]),
    { parent: head, role: "tentacle", count: 6 },
  );
  b.sweep(trunk, (t) => 0.22 - 0.13 * t, { color: trunkP, sides: 8, name: "trunk" });
  const trunkEnd = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1])
    b.spike([s * 0.035, 0.3, 2.9], [0, 0.1, 1], 0.1, 0.03, { color: PINK, bone: trunkEnd, sides: 5, name: "finger" });

  // Tusks
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.32, 1.95, 2.2], [s * 0.42, 1.4, 2.45], [s * 0.45, 1.0, 2.9], [s * 0.4, 1.05, 3.5]), [0.075, 0], {
      color: IVORY,
      bone: head,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "tusk",
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.08, 6), GREY_D, { bone: head, at: [s * 0.32, 1.95, 2.2], dir: [s * 0.4, -0.5, 0.25], name: "tuskRing" });
  }

  // Ears
  const ear = [
    [0, 0.5],
    [0.5, 0.65],
    [1.0, 0.45],
    [1.25, 0],
    [1.1, -0.5],
    [0.7, -0.95],
    [0.3, -0.7],
    [0, -0.3],
  ] as [number, number][];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eJ = b.joint(`ear${side}`, { parent: head, at: [s * 0.45, 2.65, 1.55], dir: [s * 0.8, 0, -0.6], role: "hinge" });
    b.extrude(ear, { at: [s * 0.42, 2.65, 1.5], x: [s * 0.8, 0, -0.6], y: [0, 1, 0], thickness: 0.035, color: earP, bone: eJ, name: "ear" });
    b.rod([s * 0.5, 2.62, 1.45], [s * 1.2, 2.5, 0.9], 0.03, { color: GREY_D, bone: eJ, sides: 5, name: "earVein" });
    b.rod([s * 0.55, 2.7, 1.4], [s * 1.25, 2.95, 0.85], 0.025, { color: GREY_D, bone: eJ, sides: 5, name: "earVein" });
  }

  // Legs
  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const z = front ? 0.9 : -1.2;
    const pts = limb([s * 0.5, 1.95, z], [s * 0.5, 0.05, z + 0.05], [0.95, 0.95], [[0, 0, 1]]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `footF${side}`] : [`hip${side}`, `knee${side}`, `footH${side}`];
    const ch = b.chain(front ? `legF${side}` : `legH${side}`, pts, { parent: front ? chest : hips, names, role: "leg" });
    b.sweep(ch, (t) => 0.4 - 0.1 * t, { color: legP, sides: 8, caps: { start: "round", end: "flat" }, name: "leg" });
    const foot = ch.joints[ch.joints.length - 1];
    const fz = z + 0.05;
    b.part(new THREE.CylinderGeometry(0.33, 0.35, 0.1, 8), DARK, { bone: foot, at: [s * 0.5, 0.05, fz], name: "pad" });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.ConeGeometry(0.07, 0.14, 5), NAIL, {
        bone: foot,
        at: [s * 0.5 + (i - 1.5) * 0.16, 0.1, fz + 0.3 - Math.abs(i - 1.5) * 0.04],
        dir: [0, 0.2, 1],
        name: "nail",
      });
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.0, -1.95],
      [0, 1.6, -2.15],
      [0, 1.1, -2.2],
      [0, 0.75, -2.2],
    ]),
    { parent: hips, role: "tail", count: 4 },
  );
  b.sweep(tail, [0.08, 0.03], { color: base, sides: 6, name: "tail" });
  const tailEnd = tail.joints[tail.joints.length - 1];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.spike([0, 0.78, -2.2], [Math.cos(a) * 0.25, -0.7, Math.sin(a) * 0.25], 0.32, 0.025, { color: DARK, bone: tailEnd, sides: 4, name: "tuft" });
  }

  return b.root;
}
