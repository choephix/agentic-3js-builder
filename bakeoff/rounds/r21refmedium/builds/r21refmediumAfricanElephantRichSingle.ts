import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, gradient, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in a faceted low-poly style: massive barrel body, huge fan ears, curved ivory tusks, ringed trunk and pillar legs, fully rigged with jaw, ears, trunk and tail chains.",
  style: "low-poly",
  commit: "88fc1f0",
};

const SKIN = "#7d7771";
const SKIN_DARK = "#67625c";
const WRINKLE = "#5f5a55";
const BELLY = "#8f877f";
const DUST = "#8d7b64";
const PINK = "#9c7b74";
const PINK_DARK = "#74544f";
const IVORY = "#eadfc3";
const IVORY_DARK = "#c9b48a";
const NAIL = "#d9ccb0";
const EYE = "#1b1410";
const IRIS = "#7a4a22";
const HAIR = "#2c2825";

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // ---- paints
  const coat = countershade(
    stripes(mottle(SKIN, SKIN_DARK, { size: 0.55, seed: 3 }), WRINKLE, {
      size: 0.2,
      axis: [0.35, 1, 0.1],
      width: 0.14,
      wobble: 1,
      seed: 5,
    }),
    BELLY,
    { level: -0.35 },
  );
  const legWrinkle = stripes(mottle(SKIN, SKIN_DARK, { size: 0.4, seed: 8 }), WRINKLE, {
    size: 0.15,
    axis: "y",
    width: 0.22,
    wobble: 0.9,
    seed: 11,
  });
  const legCoat = gradient(legWrinkle, DUST, [0, 0.6, 0], [0, 0.05, 0]);
  const trunkCoat = paint((_p, _n, s) => {
    const k = Math.abs(Math.sin(s[0] * 40 * Math.PI));
    return mix(SKIN, WRINKLE, k * k * 0.75 + (s[1] > 120 && s[1] < 240 ? 0.0 : 0));
  });
  const earCoat = paint((_p, _n, s) => {
    const dx = s[0] - 0.1;
    const dy = s[1] + 0.1;
    const d = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    const vein = Math.sin(ang * 16 + noise(_p, 0.3, 4) * 4) > 0.82 ? 0.35 : 0;
    const inner = smoothstep(0.25, 0.9, d) * 0.85;
    const base = mix(SKIN, PINK, inner);
    return mix(base, PINK_DARK, vein * smoothstep(0.1, 0.5, d));
  });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 2.05, -0.9] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.05, -0.9],
      [0, 2.1, -0.2],
      [0, 2.15, 0.5],
      [0, 2.2, 1.15],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 2.2, 1.15],
      [0, 2.6, 1.5],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.6, 1.5], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.35, 1.75], aim: [0, 2.1, 2.05], role: "jaw" });

  // ---- body
  b.sweep(
    catmull([
      [0, 2.0, -1.5],
      [0, 2.05, -0.9],
      [0, 2.1, -0.2],
      [0, 2.15, 0.5],
      [0, 2.2, 1.15],
    ]),
    (t): [number, number] => [0.62 + 0.18 * Math.sin(Math.PI * t), 0.8 + 0.2 * Math.sin(Math.PI * t)],
    { bone: [hips, spine], color: coat, sides: 10, smooth: false, name: "body" },
  );
  for (const s of [1, -1]) {
    // shoulder and haunch masses
    b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
      bone: chest,
      at: [s * 0.58, 2.35, 0.65],
      scale: [0.65, 1.05, 1.0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.5, 8, 6), coat, {
      bone: hips,
      at: [s * 0.55, 2.1, -1.1],
      scale: [0.7, 1.0, 1.05],
      flat: true,
    });
  }
  b.capsule([0, 2.2, 1.1], [0, 2.6, 1.5], [0.6, 0.55], {
    bone: neck.joints[0],
    color: coat,
    sides: 10,
    smooth: false,
    name: "neckMass",
  });

  // ---- head
  const skull = b.sweep(
    [
      [0, 2.65, 1.35],
      [0, 2.6, 1.7],
      [0, 2.35, 2.0],
    ],
    (t): [number, number] => [0.5 - 0.2 * t, 0.58 - 0.26 * t],
    { bone: head, color: coat, sides: 10, smooth: false, name: "skull" },
  );
  b.part(new THREE.SphereGeometry(0.45, 9, 7), coat, {
    bone: head,
    at: [0, 2.88, 1.55],
    scale: [0.98, 0.85, 0.9],
    flat: true,
  });
  b.frustumBox([0, 2.2, 1.8], [0, 2.05, 2.05], [0.42, 0.2], [0.3, 0.14], {
    bone: jaw,
    color: coat,
    name: "lowerJaw",
  });
  // forehead bristles
  const tuft = svg(`<svg viewBox="0 0 16 32"><path d="M2 32 L8 0 L14 32Z" fill="#ffffff"/></svg>`, { size: 64 });
  const bristleHits = b
    .surface(skull)
    .scatter(45, { rng: rng(5), minDist: 0.08, filter: (h) => h.n.y > 0.45 && h.at.z > 1.3 });
  b.cards(bristleHits, tuft, { size: [0.025, 0.1], lean: 30, vary: 0.3, rng: rng(6), color: HAIR, bone: head });

  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.052, 6, 5), IRIS, { bone: head, at: [s * 0.405, 2.62, 1.82] });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), EYE, { bone: head, at: [s * 0.435, 2.62, 1.83] });
    b.capsule([s * 0.38, 2.71, 1.75], [s * 0.41, 2.69, 1.92], 0.03, SKIN_DARK, { bone: head, sides: 5 });
    b.capsule([s * 0.38, 2.55, 1.76], [s * 0.41, 2.56, 1.9], 0.022, SKIN_DARK, { bone: head, sides: 5 });
  }

  // ---- ears
  const earOutline: Array<[number, number]> = [
    [0, 0.45],
    [0.35, 0.62],
    [0.8, 0.5],
    [1.15, 0.15],
    [1.25, -0.3],
    [1.0, -0.85],
    [0.65, -1.15],
    [0.35, -0.95],
    [0.1, -0.5],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.42, 3.0, 1.35],
      dir: [s * 0.6, 0.1, -0.8],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: [s * 0.42, 3.0, 1.35],
      x: [s * 0.65, 0, -0.76],
      y: [s * 0.1, 1, 0],
      thickness: [0.05, 0.08],
      bevel: 0.012,
      smoothing: 1,
      color: earCoat,
      bone: ear,
      name: `ear${side}`,
    });
    // thick rim along the top
    b.capsule([s * 0.46, 3.43, 1.32], [s * 0.95, 3.5, 0.62], 0.04, SKIN_DARK, { bone: ear, sides: 6 });
  }

  // ---- tusks
  for (const s of [1, -1]) {
    const tuskPath = catmull([
      [s * 0.27, 2.2, 1.9],
      [s * 0.36, 1.85, 2.3],
      [s * 0.42, 1.6, 2.9],
      [s * 0.4, 1.65, 3.5],
    ]);
    b.sweep(tuskPath, [0.075, 0.012], {
      bone: head,
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.8, IVORY],
        [1, IVORY_DARK],
      ],
      name: `tusk${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 5), coat, { bone: head, at: [s * 0.27, 2.2, 1.93], flat: true });
  }

  // ---- trunk
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.35, 1.85],
      [0, 1.9, 2.28],
      [0, 1.3, 2.5],
      [0, 0.75, 2.55],
      [0, 0.4, 2.78],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"], role: "tentacle" },
  );
  b.sweep(trunk, [0.24, 0.2, 0.15, 0.12, 0.09], {
    color: trunkCoat,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "flat" },
    name: "trunk",
  });
  const tip = trunk.at(1);
  b.part(new THREE.CylinderGeometry(0.075, 0.08, 0.03, 8), PINK, { frame: tip, name: "trunkTipPad" });
  for (const x of [0.035, -0.035])
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 6), EYE, {
      frame: tip.moved([x, 0.012, 0]),
      name: "nostril",
    });

  // ---- legs
  const rings: Array<{ x: number; y: number; z: number }> = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `legF${side}`,
      catmull([
        [s * 0.5, 1.75, 0.72],
        [s * 0.5, 1.05, 0.8],
        [s * 0.5, 0.5, 0.78],
        [s * 0.5, 0.2, 0.8],
      ]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `footF${side}`],
        role: "leg",
      },
    );
    b.sweep(front, [0.38, 0.33, 0.29, 0.27, 0.3], {
      color: legCoat,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
      name: `legF${side}`,
    });
    const hind = b.chain(
      `legH${side}`,
      catmull([
        [s * 0.5, 1.85, -1.0],
        [s * 0.5, 1.1, -0.9],
        [s * 0.5, 0.55, -1.12],
        [s * 0.5, 0.2, -1.1],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `footH${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, [0.4, 0.34, 0.29, 0.27, 0.3], {
      color: legCoat,
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
      name: `legH${side}`,
    });

    const feet: Array<{ joint: NonNullable<typeof front.tip>; x: number; z: number; angles: number[] }> = [
      { joint: front.tip!, x: s * 0.5, z: 0.8, angles: [-0.62, -0.21, 0.21, 0.62] },
      { joint: hind.tip!, x: s * 0.5, z: -1.1, angles: [-0.45, 0, 0.45] },
    ];
    for (const f of feet) {
      b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.2, 9), legCoat, {
        bone: f.joint,
        at: [f.x, 0.1, f.z],
        flat: true,
        name: "footPad",
      });
      for (const a of f.angles) {
        const dx = Math.sin(a);
        const dz = Math.cos(a);
        b.part(new THREE.BoxGeometry(0.12, 0.13, 0.09), NAIL, {
          bone: f.joint,
          at: [f.x + dx * 0.355, 0.095, f.z + dz * 0.355],
          dir: [dx, 0, dz],
          axis: "z",
          name: "toenail",
        });
      }
    }
    rings.push({ x: s * 0.5, y: 1.05, z: 0.8 }, { x: s * 0.5, y: 0.55, z: 0.78 });
    rings.push({ x: s * 0.5, y: 1.1, z: -0.9 }, { x: s * 0.5, y: 0.6, z: -1.1 });
  }
  // skin folds at elbows, knees and ankles
  rings.forEach((r, i) => {
    b.part(new THREE.TorusGeometry(0.3, 0.028, 4, 9), WRINKLE, {
      at: [r.x, r.y, r.z],
      rotation: [90, 0, 0],
      flat: true,
      name: `fold${i}`,
    });
  });

  // ---- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.1, -2.1],
      [0, 1.9, -2.35],
      [0, 1.4, -2.45],
      [0, 0.95, -2.4],
      [0, 0.75, -2.35],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.07, 0.05, 0.04, 0.03, 0.025], { color: coat, sides: 6, smooth: false, caps: "round", name: "tail" });
  const tailEnd = tail.at(1);
  b.ring(tailEnd, { count: 9, radius: 0.03, tilt: 60 }, (it) =>
    b.spike(it, it, 0.32, 0.022, { color: HAIR, sides: 5 }),
  );
  b.spike(tailEnd, tailEnd, 0.36, 0.03, { color: HAIR, sides: 5 });

  return b.root;
}
