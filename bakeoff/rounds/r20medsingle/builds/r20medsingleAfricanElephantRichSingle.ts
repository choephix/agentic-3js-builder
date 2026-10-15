import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, mottle, paint, stripes } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in faceted low-poly: huge Africa-shaped ears, curved ivory tusks, ringed trunk, columnar legs with nails, wrinkle-painted grey hide with dusty lower legs. Full skeleton with jaw, ear hinges, trunk chain and tail.",
  style: "low-poly",
  commit: "88fc1f0",
};

const CREASE = "#625c53";
const BELLY = "#9a9186";
const DUST = "#9b8566";
const PINK = "#a8968c";
const VEIN = "#6e655c";
const IVORY = "#e9dfc3";
const IVORY_DARK = "#c7b88f";
const NAIL = "#cfc5ad";
const DARK = "#2b2724";
const AMBER = "#8a5a22";
const LIDS = "#5c564e";
const HAIR = "#3f3a34";

// Ear outline, drawn from the top front corner back (u) and down (v).
const EAR_BASE: Array<[number, number, boolean?]> = [
  [0, 0],
  [0.3, 0.12],
  [0.75, 0.05],
  [1.0, -0.3],
  [1.05, -0.8],
  [0.8, -1.3],
  [0.45, -1.6, true],
  [0.2, -1.0],
  [0.05, -0.5],
];
const earOutline = (k: number, ox: number, oy: number): OutlinePoint[] =>
  EAR_BASE.map(([x, y, sharp]) => {
    const p: OutlinePoint = sharp ? [x * k + ox, y * k + oy, "sharp"] : [x * k + ox, y * k + oy];
    return p;
  });

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // ---- paints ----
  const baseMottle = mottle("#8b8478", "#7b756b", { size: 0.45, seed: 3, contrast: 0.9 });
  const bodyCreases = stripes(baseMottle, CREASE, { size: 0.2, axis: [0.3, 1, 0.2], width: 0.14, wobble: 0.9, seed: 2 });
  const coat = countershade(bodyCreases, BELLY, { level: -0.45, soft: 0.3 });
  const legCreases = stripes(baseMottle, CREASE, { size: 0.12, axis: "y", width: 0.18, wobble: 1, seed: 5 });
  const legCoat = gradient(legCreases, DUST, [0, 0.9, 0], [0, 0.05, 0]);
  const trunkPaint = paint((_p, _n, s) => {
    const k = (s[0] * 40) % 1;
    if (k < 0.2) return CREASE;
    return s[1] > 120 && s[1] < 240 ? PINK : coat;
  });
  const earPaint = paint((_p, _n, s) => {
    const ang = Math.atan2(-s[1], s[0] + 0.05);
    const vein = Math.sin(ang * 22 + s[0] * 3) > 0.93;
    return vein ? VEIN : coat;
  });

  // ---- skeleton ----
  const pelvis = b.joint("pelvis", { at: [0, 2.4, -1.3] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.4, -1.3],
      [0, 2.5, -0.4],
      [0, 2.6, 0.5],
      [0, 2.55, 1.1],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.55, 1.1],
      [0, 2.5, 1.5],
      [0, 2.4, 1.85],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.4, 1.85], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.0, 2.0], aim: [0, 1.85, 2.45], role: "jaw" });

  const trunkPts = [
    [0, 2.15, 2.2],
    [0, 1.85, 2.75],
    [0, 1.3, 3.0],
    [0, 0.75, 3.05],
    [0, 0.45, 3.15],
    [0, 0.5, 3.5],
  ];
  const trunk = b.chain("trunk", catmull(trunkPts), {
    parent: head,
    names: (i: number) => `trunk${i + 1}`,
    role: "tentacle",
  });
  const trunkTip = trunk.joints[trunk.joints.length - 1];

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.5, -2.0],
      [0, 2.1, -2.25],
      [0, 1.5, -2.3],
      [0, 0.85, -2.25],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailEnd = tail.joints[tail.joints.length - 1];

  // ---- body, neck, head ----
  b.loft(
    [
      { at: [0, 2.25, -2.0], w: 1.0, h: 1.3 },
      { at: [0, 2.15, -1.3], w: 1.5, h: 1.7 },
      { at: [0, 2.1, -0.3], w: 1.55, h: 1.65 },
      { at: [0, 2.15, 0.6], w: 1.5, h: 1.7 },
      { at: [0, 2.2, 1.2], w: 1.2, h: 1.4 },
      { at: [0, 2.3, 1.55], w: 0.9, h: 1.1 },
    ],
    { bone: spine, color: coat, sides: 10, smooth: false, name: "body" },
  );
  b.sweep(neck, [0.55, 0.5, 0.48], { color: coat, sides: 8, smooth: false, caps: "flat", name: "neck" });

  const skull = b.loft(
    [
      { at: [0, 2.4, 1.55], w: 0.9, h: 1.2 },
      { at: [0, 2.35, 2.0], w: 0.95, h: 1.2 },
      { at: [0, 2.1, 2.4], w: 0.6, h: 0.8 },
    ],
    { bone: head, color: coat, sides: 8, smooth: false, name: "skull" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.3, 8, 6), coat, {
      bone: head,
      at: [s * 0.2, 2.9, 1.85],
      scale: [1, 0.8, 0.9],
      flat: true,
      name: `forehead${s > 0 ? "L" : "R"}`,
    });
    // shoulder and hip muscle masses
    b.part(new THREE.SphereGeometry(0.45, 8, 6), coat, {
      bone: spine.joints[2],
      at: [s * 0.55, 2.35, 0.65],
      scale: [0.6, 1.1, 1.0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
      bone: pelvis,
      at: [s * 0.6, 2.35, -1.4],
      scale: [0.6, 1.1, 1.0],
      flat: true,
    });
  }
  // lower jaw / lip under the trunk root
  b.frustumBox([0, 1.95, 2.0], [0, 1.82, 2.45], [0.42, 0.22], [0.3, 0.18], { bone: jaw, color: coat, name: "lowerJaw" });

  // ---- trunk ----
  b.sweep(trunk, [0.3, 0.26, 0.2, 0.16, 0.13, 0.1], {
    color: trunkPaint,
    sides: 8,
    smooth: false,
    name: "trunk",
  });
  b.spike([0, 0.5, 3.5], [0, 0.6, 0.8], 0.11, 0.04, { bone: trunkTip, color: PINK, sides: 5, smooth: false });
  b.spike([0, 0.42, 3.5], [0, -0.1, 1], 0.08, 0.035, { bone: trunkTip, color: PINK, sides: 5, smooth: false });

  // ---- tusks ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.sweep(
      catmull([
        [s * 0.32, 1.95, 2.2],
        [s * 0.4, 1.75, 2.7],
        [s * 0.42, 1.55, 3.2],
        [s * 0.38, 1.6, 3.7],
      ]),
      [0.1, 0.015],
      {
        bone: head,
        color: gradient(IVORY_DARK, IVORY, [0, 1.9, 2.3], [0, 1.6, 3.2]),
        sides: 6,
        smooth: false,
        caps: { start: "flat", end: "point" },
        name: `tusk${side}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.13, 6, 5), PINK, {
      bone: head,
      at: [s * 0.32, 2.0, 2.3],
      scale: [1, 0.8, 1],
      flat: true,
      name: `tuskBase${side}`,
    });
  }

  // ---- ears ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJoint = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.45, 2.85, 1.6],
      dir: [s * 0.3, -1, -0.1],
      role: "hinge",
    });
    b.extrude(earOutline(1, 0, 0), {
      at: [s * 0.42, 2.85, 1.62],
      x: [0, 0, -1],
      y: [-s * 0.2, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      smoothing: 1,
      color: earPaint,
      bone: earJoint,
      name: `ear${side}`,
    });
    b.extrude(earOutline(0.8, 0.06, -0.06), {
      at: [s * (0.42 - 0.035), 2.85, 1.62],
      x: [0, 0, -1],
      y: [-s * 0.2, 1, 0],
      thickness: 0.02,
      smoothing: 1,
      color: PINK,
      bone: earJoint,
      name: `earInner${side}`,
    });
  }

  // ---- eyes ----
  for (const s of [1, -1]) {
    const hit = b.surface(skull).ray([s * 1.2, 2.5, 2.05], [-s, 0, 0]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), LIDS, hit, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 8), AMBER, hit.moved([0, 0.012, 0]), { embed: 0.4 });
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), DARK, hit.moved([0, 0.02, 0]), { embed: 0.3 });
  }
  // coarse bristles on the crown
  const crown = b.surface(skull).scatter(30, { rng: rng(5), minDist: 0.12, filter: (h) => h.n.y > 0.5 });
  for (const hit of crown) b.stick(new THREE.ConeGeometry(0.014, 0.1, 4), HAIR, hit, { embed: 0.2 });

  // ---- legs ----
  const legs = [
    { id: "F", front: true, z: 0.65, footZ: 0.7, root: 1.95, parent: spine.joints[2], r: [0.38, 0.3, 0.26, 0.25, 0.27] },
    { id: "H", front: false, z: -1.4, footZ: -1.35, root: 1.9, parent: pelvis, r: [0.42, 0.33, 0.27, 0.25, 0.27] },
  ];
  for (const L of legs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const x = s * 0.5;
      const pts = limb([x, L.root, L.z], [x, 0.15, L.footZ], [1.0, 0.95], [[0, 0, 1]]);
      const leg = b.chain(`leg${L.id}${side}`, pts, {
        parent: L.parent,
        names: L.front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
          : [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [x, 0, L.footZ],
      });
      b.sweep(leg, L.r, {
        color: legCoat,
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "flat" },
        name: `leg${L.id}${side}`,
      });
      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.2, 8), legCoat, {
        bone: foot,
        at: [x, 0.1, L.footZ],
        flat: true,
        name: `foot${L.id}${side}`,
      });
      const n = L.front ? 5 : 4;
      for (let i = 0; i < n; i++) {
        const a = (-55 + (110 * i) / (n - 1)) * DEG;
        const sx = Math.sin(a);
        const cz = Math.cos(a);
        b.part(new THREE.BoxGeometry(0.1, 0.1, 0.08), NAIL, {
          bone: foot,
          at: [x + sx * 0.31, 0.07, L.footZ + cz * 0.31],
          dir: [sx, 0, cz],
          axis: "z",
          flat: true,
          name: `nail${L.id}${side}${i}`,
        });
      }
    }
  }

  // ---- tail ----
  b.sweep(tail, [0.11, 0.075, 0.05, 0.04], { color: coat, sides: 6, smooth: false, caps: { start: "round", end: "round" }, name: "tail" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([0, 0.85, -2.25], [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5], 0.3, 0.02, {
      bone: tailEnd,
      color: DARK,
      sides: 4,
      smooth: false,
    });
  }

  return b.root;
}
