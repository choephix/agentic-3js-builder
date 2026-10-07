import * as THREE from "three";
import { catmull, countershade, createBuilder, limb } from "../../../../src/index";

export const meta = {
  name: "lion",
  description: "A stylised male lion in rest pose: a maned head with a separate jaw, a long-bodied primitive build on four limbs, and a tufted tail.",
};

const BODY = "#e3a548";
const BODY_DARK = "#b8772c";
const BELLY = "#f2d49a";
const MANE = "#8a4a1e";
const MANE_DEEP = "#5a2c10";
const MANE_LIGHT = "#b8692c";
const MUZZLE = "#f5e1b4";
const NOSE = "#2b1b16";
const EYE = "#f2b233";
const PUPIL = "#1a120e";
const CLAW = "#efe6d2";

export default function build() {
  const b = createBuilder({ name: "lion" });

  // Spine: hips at the root, body runs forward to the chest.
  const hips = b.joint("hips", { at: [0, 1.0, -0.55], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.55],
      [0, 1.02, -0.2],
      [0, 1.06, 0.15],
      [0, 1.1, 0.45],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );

  b.sweep(
    spine,
    (t: number): [number, number] => [0.2 + 0.04 * Math.sin(Math.PI * t), 0.21 + 0.03 * Math.sin(Math.PI * t)],
    { sides: 10, color: countershade(BODY, BELLY, { level: -0.2 }) },
  );

  // Neck rises from the chest into the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.1, 0.45],
      [0, 1.22, 0.6],
      [0, 1.31, 0.76],
      [0, 1.36, 0.86],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  b.sweep(neck, [0.17, 0.15], { sides: 10, color: BODY });

  // Head and separate lower jaw.
  const head = b.joint("head", { parent: neck, at: [0, 1.36, 0.86], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.31, 0.96], dir: [0, 0, 1], role: "jaw" });

  b.part(new THREE.SphereGeometry(0.17, 10, 8), BODY, {
    bone: head,
    at: [0, 1.37, 0.88],
    scale: [1, 0.94, 1.08],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.035, 0.06), MANE_DEEP, { bone: head, at: [0, 1.46, 1.02] });
  b.part(new THREE.BoxGeometry(0.17, 0.1, 0.13), MUZZLE, { bone: head, at: [0, 1.33, 1.03] });
  b.part(new THREE.BoxGeometry(0.07, 0.05, 0.05), NOSE, { bone: head, at: [0, 1.36, 1.12] });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 7, 5), MUZZLE, { bone: head, at: [s * 0.075, 1.335, 1.07] });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, { bone: head, at: [s * 0.075, 1.4, 1.03] });
    b.part(new THREE.BoxGeometry(0.014, 0.03, 0.012), PUPIL, { bone: head, at: [s * 0.075, 1.4, 1.06] });
    b.part(new THREE.ConeGeometry(0.05, 0.08, 6), BODY_DARK, { bone: head, at: [s * 0.12, 1.5, 0.86] });
  }

  // Lower jaw and a dark mouth line.
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.13), MUZZLE, { bone: jaw, at: [0, 1.29, 1.0] });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.03), NOSE, { bone: head, at: [0, 1.305, 1.085] });

  // Mane: two layered rings of spikes around the neck and head.
  b.ring(
    neck.at(0.45),
    { count: 26, radius: 0.27, tilt: -30 },
    (item) => {
      const k = 0.5 + 0.5 * Math.sin(item.i * 12.9898);
      b.spike(item, item, 0.14 + 0.06 * k, 0.06, { color: MANE });
    },
  );
  b.ring(
    neck.at(0.7),
    { count: 18, radius: 0.2, tilt: -20 },
    (item) => {
      const k = 0.5 + 0.5 * Math.sin(item.i * 7.231);
      b.spike(item, item, 0.1 + 0.04 * k, 0.045, { color: MANE_LIGHT });
    },
  );

  // Front legs: shoulder, elbow back, paw forward.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const pts = limb([s * 0.14, 1.0, 0.3], [s * 0.15, 0.07, 0.38], [0.5, 0.46], [[0, 0, -1]]);
    const fl = b.chain(`frontLeg${side}`, pts, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `fpaw${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.09, 0.06], { sides: 8, color: BODY });
    b.part(new THREE.SphereGeometry(0.11, 9, 7), BODY, { bone: fl.joints[0], at: [s * 0.13, 1.02, 0.3] });

    const paw = fl.tip!;
    b.part(new THREE.BoxGeometry(0.17, 0.09, 0.2), BODY_DARK, { bone: paw, at: [s * 0.15, 0.045, 0.42] });
    for (const dx of [-0.05, 0, 0.05]) {
      b.spike([s * 0.15 + dx, 0.03, 0.5], [0, -0.25, 1], 0.04, 0.012, { color: CLAW, bone: paw });
    }
  }

  // Hind legs: thigh, stifle forward, hock back, paw forward.
  for (const [side, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const pts = limb([s * 0.15, 1.0, -0.5], [s * 0.15, 0.07, -0.62], [0.46, 0.4, 0.13], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`hindLeg${side}`, pts, {
      parent: hips,
      names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `hpaw${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.1, 0.055], { sides: 8, color: BODY });
    b.part(new THREE.SphereGeometry(0.14, 10, 8), BODY, { bone: hl.joints[0], at: [s * 0.14, 1.02, -0.5] });

    const paw = hl.tip!;
    b.part(new THREE.BoxGeometry(0.17, 0.09, 0.2), BODY_DARK, { bone: paw, at: [s * 0.15, 0.045, -0.56] });
    for (const dx of [-0.05, 0, 0.05]) {
      b.spike([s * 0.15 + dx, 0.03, -0.46], [0, -0.25, 1], 0.04, 0.012, { color: CLAW, bone: paw });
    }
  }

  // Tail: long and thin, ending in a dark tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.58],
      [0, 0.97, -0.85],
      [0, 0.7, -1.12],
      [0, 0.32, -1.2],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.05, 0.028], { sides: 8, color: BODY });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), MANE_DEEP, { bone: tail.tip!, at: [0, 0.3, -1.22] });
  b.ring(
    tail.tip!,
    { count: 10, radius: 0.06, tilt: 0 },
    (item) => {
      b.spike(item, item, 0.06, 0.03, { color: MANE_DEEP });
    },
  );

  return b.root;
}
