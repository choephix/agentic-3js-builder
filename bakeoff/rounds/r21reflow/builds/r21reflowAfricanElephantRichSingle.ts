import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { countershade, mottle, paint, stripes } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { interpolate } from "../../../../src/sweep";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in faceted low-poly: huge fan ears, curving ivory tusks, ringed trunk, wrinkled legs with toenails, full rig with jaw, trunk, ears and tail.",
  style: "low-poly",
  commit: "88fc1f0",
};

const GREY = "#8c8681";
const GREY_D = "#6b6662";
const BELLY = "#9a8f89";
const PINK = "#b08a80";
const PINK_D = "#8e6a62";
const IVORY = "#efe4c2";
const IVORY_D = "#c9b88a";
const NAIL = "#d8cba5";
const HAIR = "#26211f";
const EYE = "#2e1a0e";
const EYE_HI = "#f2e6c8";

export default function build() {
  const b = createBuilder({ name: "africanElephant", detail: 0.8 });

  // ---- paints
  const SKIN = mottle(GREY, "#7d7773", { size: 0.6, contrast: 0.8, seed: 3 });
  const BODYP = countershade(stripes(SKIN, GREY_D, { size: 0.3, axis: "y", width: 0.12, wobble: 0.6, seed: 5 }), BELLY, {
    level: -0.2,
  });
  const LEGP = stripes(SKIN, GREY_D, { size: 0.15, axis: "y", width: 0.22, wobble: 0.35, seed: 8 });
  const HEADP = stripes(SKIN, GREY_D, { size: 0.16, axis: "y", width: 0.15, wobble: 0.7, seed: 11 });
  const TRUNKP = paint((_p, _n, s) => (Math.sin(s[0] * 75) > 0.5 ? GREY_D : SKIN));
  const EARIN = mottle(PINK, PINK_D, { size: 0.3, contrast: 1.2, seed: 2 });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 2.3, -1.0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.0],
      [0, 2.4, -0.2],
      [0, 2.45, 0.6],
      [0, 2.45, 1.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.45, 1.2],
      [0, 2.6, 1.5],
      [0, 2.7, 1.75],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.7, 1.75], dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.45, 2.0], aim: [0, 2.3, 2.5], role: "jaw" });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.4, 2.45],
      [0, 2.0, 2.85],
      [0, 1.4, 3.05],
      [0, 0.85, 3.1],
      [0, 0.5, 3.3],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"], role: "tentacle" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.4],
      [0, 2.2, -1.7],
      [0, 1.6, -1.75],
      [0, 1.0, -1.7],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---- body
  b.sweep(
    catmull([
      [0, 2.3, -1.35],
      [0, 2.35, -0.5],
      [0, 2.45, 0.4],
      [0, 2.5, 1.3],
    ]),
    (t) => [interpolate([0, 0.3, 0.6, 1], [0.62, 0.88, 0.9, 0.76], t), interpolate([0, 0.3, 0.6, 1], [0.8, 0.95, 0.95, 0.85], t)],
    { bone: spine, color: BODYP, sides: 10, name: "body" },
  );
  // shoulder / hip masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.5, 8, 6), SKIN, { at: [s * 0.62, 2.35, 0.85], bone: spine.joints[2], scale: [0.7, 1, 1], flat: true });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), SKIN, { at: [s * 0.6, 2.3, -0.95], bone: hips, scale: [0.7, 1, 1], flat: true });
  }
  // back ridge
  b.sweep(
    catmull([
      [0, 3.25, -0.9],
      [0, 3.38, 0],
      [0, 3.42, 0.7],
    ]),
    [0.1, 0.07],
    { bone: spine, color: GREY_D, sides: 6, name: "ridge" },
  );

  // ---- neck + head
  b.sweep(neck, [0.62, 0.55], { color: HEADP, sides: 10, name: "neckTube" });
  b.part(new THREE.SphereGeometry(0.55, 10, 8), HEADP, { at: [0, 2.8, 1.85], bone: head, scale: [0.9, 1.0, 1.05], flat: true, name: "skull" });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), HEADP, { at: [0, 2.55, 2.25], bone: head, scale: [0.85, 1.0, 1.0], flat: true, name: "muzzle" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.3, 7, 5), HEADP, { at: [s * 0.2, 3.2, 1.95], bone: head, flat: true, name: "forehead" });
    b.part(new THREE.SphereGeometry(0.26, 7, 5), HEADP, { at: [s * 0.4, 2.55, 2.0], bone: head, flat: true, name: "cheek" });
    // eyes
    b.part(new THREE.SphereGeometry(0.075, 7, 5), SKIN, { at: [s * 0.44, 2.88, 2.2], bone: head, scale: [0.8, 0.8, 1], flat: true, name: "lid" });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), EYE, { at: [s * 0.49, 2.87, 2.24], bone: head, name: "eye" });
    b.part(new THREE.SphereGeometry(0.014, 5, 3), EYE_HI, { at: [s * 0.52, 2.89, 2.27], bone: head, name: "eyeShine" });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), GREY_D, { at: [s * 0.5, 2.98, 2.15], bone: head, scale: [1, 0.5, 1.4], flat: true, name: "brow" });
    // temporal gland
    b.part(new THREE.SphereGeometry(0.035, 5, 3), GREY_D, { at: [s * 0.52, 2.78, 2.0], bone: head, name: "gland" });
  }
  // jaw
  b.part(new THREE.SphereGeometry(0.28, 8, 6), BELLY, { at: [0, 2.3, 2.3], bone: jaw, scale: [0.75, 0.55, 1.0], flat: true, name: "lowerJaw" });

  // ---- trunk
  b.sweep(trunk, [0.3, 0.24, 0.18, 0.14, 0.1], { color: TRUNKP, sides: 8, name: "trunkTube" });
  b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.1, 8), GREY_D, { at: [0, 0.4, 3.38], bone: trunk.joints[4], dir: [0, -0.5, 1], name: "trunkEnd" });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.03, 5, 3), HAIR, { at: [s * 0.04, 0.36, 3.45], bone: trunk.joints[4], name: "nostril" });

  // ---- tusks
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.36, 2.3, 2.3], [s * 0.5, 1.8, 2.75], [s * 0.38, 2.0, 3.45]), [0.1, 0.0], {
      bone: head,
      color: IVORY,
      bands: [[0.15, IVORY_D]],
      sides: 7,
      caps: { start: "flat", end: "point" },
      name: "tusk",
    });
  }

  // ---- ears
  for (const s of [1, -1]) {
    const earJ = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.5, 3.25, 1.7],
      dir: [s * 0.5, 0, -1],
      role: "hinge",
    });
    const outline: OutlinePoint[] = [
      [0, 0.1],
      [0.25, 0.35],
      [0.7, 0.3],
      [1.05, -0.1],
      [1.12, -0.7],
      [0.85, -1.25],
      [0.4, -1.2],
      [0.1, -0.7],
      [0, -0.3],
    ];
    const inner: OutlinePoint[] = outline.map(([x, y]) => [0.5 + (x - 0.5) * 0.72, -0.5 + (y + 0.5) * 0.72] as OutlinePoint);
    const X: [number, number, number] = [s * 0.5, 0, -1];
    b.extrude(outline, { at: [s * 0.5, 3.25, 1.7], x: X, y: [0, 1, 0], thickness: 0.05, bone: earJ, color: SKIN, name: "ear" });
    b.extrude(inner, { at: [s * 0.5, 3.25, 1.7], x: X, y: [0, 1, 0], thickness: 0.075, bone: earJ, color: EARIN, name: "earInner" });
  }

  // ---- legs
  const legs: Array<[number, number, string, number]> = [
    [0.62, 0.85, "F", 2],
    [0.62, -0.95, "H", 0],
  ];
  for (const [x, z, tag, si] of legs)
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pts = limb([s * x, 2.1, z], [s * x, 0.22, z], [0.7, 0.65, 0.6], [[0, 0, 1]]);
      const parent = spine.joints[si];
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`, `foot${tag}${side}`],
        role: "leg",
        contact: [s * x, 0, z],
      });
      b.sweep(leg, [0.44, 0.38, 0.32, 0.3, 0.33], { color: LEGP, sides: 8, name: `leg${tag}${side}` });
      b.part(new THREE.SphereGeometry(0.22, 7, 5), GREY_D, {
        at: [s * x, pts[1].y, pts[1].z + 0.18],
        bone: leg.joints[1],
        scale: [0.9, 1, 0.8],
        flat: true,
        name: "knee",
      });
      const foot = leg.joints[3];
      b.part(new THREE.CylinderGeometry(0.4, 0.43, 0.22, 8), GREY_D, { at: [s * x, 0.11, z + 0.03], bone: foot, flat: true, name: "foot" });
      for (let k = 0; k < 4; k++) {
        const dx = (k - 1.5) * 0.19;
        b.part(new THREE.BoxGeometry(0.13, 0.12, 0.1), NAIL, {
          at: [s * x + dx, 0.08, z + 0.4 - Math.abs(k - 1.5) * 0.07],
          bone: foot,
          name: "toenail",
        });
      }
    }

  // ---- tail
  b.sweep(tail, [0.1, 0.07, 0.04], { color: GREY_D, sides: 6, name: "tailTube" });
  const tailTip = tail.joints[2];
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    b.spike([0, 1.05, -1.7], [Math.cos(a) * 0.1, 0.62, -1.7 + Math.sin(a) * 0.1], null, 0.03, {
      color: HAIR,
      bone: tailTip,
      sides: 5,
      name: "tuft",
    });
  }
  b.spike([0, 1.05, -1.7], [0, 0.55, -1.7], null, 0.04, { color: HAIR, bone: tailTip, sides: 5, name: "tuft" });

  return b.root;
}
