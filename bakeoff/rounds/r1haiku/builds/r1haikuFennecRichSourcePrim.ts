import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  mix,
  mottle,
  paint,
  polyline,
  smoothstep,
  stripes,
} from "../../../../src/index";
import type { OutlineInput } from "../../../../src/index";

export const meta = {
  name: "Fennec fox kit",
  description:
    "A fennec fox kit standing alert on a little sand dune at dusk: huge satin peach-lined ears, cream fur warming to sandy gold, a black-tipped tail, big dark eyes and a leather collar with a brass bell.",
};

const GOLD = "#d99a52";
const CREAM = "#f5e3c4";
const PEACH = "#f4b9a0";
const EAR_OUT = "#e8c08c";
const SAND_LIGHT = "#e7bd82";
const SAND_DARK = "#c98f55";
const INK = "#1b130f";
const LEATHER = "#7a4a2b";
const LEATHER_DARK = "#5b3419";
const BRASS = "#d9ad46";

/** Ear outline in the ear's plane: x forward, y up the ear, metres. The tip is kept pointed. */
const EAR: OutlineInput = [
  [-0.04, 0],
  [0.04, 0],
  [0.036, 0.08],
  [0.012, 0.14],
  [0, 0.17, "sharp"],
  [-0.014, 0.13],
  [-0.036, 0.06],
];

/** Body spine, rump to neck. Also the body loft's stations. */
const BODY: number[][] = [
  [0, 0.19, -0.13],
  [0, 0.2, -0.04],
  [0, 0.21, 0.05],
  [0, 0.23, 0.11],
];

/** Tail, from the rump back and slightly up. */
const TAIL: number[][] = [
  [0, 0.2, -0.14],
  [0, 0.2, -0.22],
  [0, 0.22, -0.3],
  [0, 0.27, -0.36],
];

/** Dune profile: half cross-section, x = radius, y = height. Bottom sits on y = 0. */
const DUNE: OutlineInput = [
  [0, 0],
  [0.2, 0],
  [0.22, 0.012],
  [0.19, 0.04],
  [0.12, 0.075],
  [0.05, 0.095],
  [0, 0.1],
];

export default function fennecKit() {
  const b = createBuilder({ name: "fennec-kit", detail: 1 });

  // Coats ------------------------------------------------------------------------------------------
  const bodyCoat = countershade(GOLD, CREAM, { level: 0.15, soft: 0.5 });
  const headCoat = countershade(GOLD, CREAM, { level: 0.35, soft: 0.4 });
  const legCoat = countershade(GOLD, CREAM, { level: 0.3, soft: 0.3 });
  const tailCoat = countershade(GOLD, CREAM, { level: 0.2, soft: 0.4 });
  // The tail's tip fades into a black smudge, read from the tail's own source t.
  const tailPaint = paint((p, n, s) => mix(tailCoat.at(p, n, s), INK, smoothstep(0.8, 0.9, s[0])));
  const collarCoat = stripes(LEATHER, LEATHER_DARK, { size: 0.009, axis: "y", width: 0.5 });
  const duneCoat = mottle(SAND_LIGHT, SAND_DARK, { size: 0.05, contrast: 1.2 });

  // Skeleton -----------------------------------------------------------------------------------------
  b.joint("pelvis", { at: [0, 0.18, -0.1] });
  const spine = b.chain("spine", catmull(BODY), {
    parent: "pelvis",
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  b.joint("head", { parent: "spine4", at: [0, 0.3, 0.14], dir: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.282, 0.17], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull(TAIL), {
    parent: "pelvis",
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // Dune and sand -----------------------------------------------------------------------------------
  b.lathe(DUNE, { color: duneCoat, at: [0, 0, 0], bone: "pelvis", segments: 16, name: "dune" });
  for (const [x, y, z] of [
    [-0.15, 0.03, -0.06],
    [0.14, 0.035, -0.1],
    [-0.05, 0.03, 0.17],
  ]) {
    b.part(new THREE.SphereGeometry(0.014, b.segments(8), b.segments(6)), SAND_DARK, {
      at: [x, y, z],
      scale: [1, 0.6, 1],
      bone: "pelvis",
      name: "sand",
    });
  }

  // Body, tail and legs -----------------------------------------------------------------------------
  b.loft(
    [
      { at: BODY[0], w: 0.1, h: 0.1 },
      { at: BODY[1], w: 0.13, h: 0.12 },
      { at: BODY[2], w: 0.12, h: 0.11 },
      { at: BODY[3], w: 0.09, h: 0.09 },
    ],
    { color: bodyCoat, bone: spine, name: "body" },
  );

  b.sweep(tail, (t) => 0.036 + 0.018 * Math.sin(Math.PI * t), { color: tailPaint, name: "tail" });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = 0.055 * s;

    const fore = b.chain(
      `legF${L}`,
      polyline([
        [x, 0.2, 0.05],
        [x * 0.95, 0.13, 0.065],
        [x, 0.09, 0.08],
      ]),
      { parent: "spine3", names: [`shoulderF${L}`, `elbowF${L}`, `wristF${L}`], role: "leg" },
    );
    b.sweep(fore, (t) => 0.021 - 0.006 * t, { color: legCoat, name: `legF${L}` });
    b.part(new THREE.SphereGeometry(0.026, b.segments(12), b.segments(8)), CREAM, {
      at: [x, 0.088, 0.093],
      bone: `wristF${L}`,
      scale: [1.1, 0.7, 1.5],
      name: `pawF${L}`,
    });

    const hind = b.chain(
      `legB${L}`,
      polyline([
        [x * 1.05, 0.19, -0.12],
        [x * 1.1, 0.13, -0.1],
        [x, 0.09, -0.12],
      ]),
      { parent: "pelvis", names: [`hipB${L}`, `kneeB${L}`, `hockB${L}`], role: "leg" },
    );
    b.sweep(hind, (t) => 0.026 - 0.01 * t, { color: legCoat, name: `legB${L}` });
    b.part(new THREE.SphereGeometry(0.027, b.segments(12), b.segments(8)), CREAM, {
      at: [x, 0.088, -0.1],
      bone: `hockB${L}`,
      scale: [1.1, 0.7, 1.5],
      name: `pawB${L}`,
    });
  }

  // Head ------------------------------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.07, b.segments(18), b.segments(12)), headCoat, {
    at: [0, 0.3, 0.14],
    bone: "head",
    scale: [1, 0.94, 1.12],
    name: "head",
  });
  b.part(new THREE.ConeGeometry(0.032, 0.065, b.segments(12)), headCoat, {
    at: [0, 0.283, 0.19],
    rotation: [90, 0, 0],
    bone: "head",
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), INK, {
    at: [0, 0.289, 0.224],
    bone: "head",
    name: "nose",
  });
  // Lower jaw, hinged at the jaw joint.
  b.part(new THREE.BoxGeometry(0.036, 0.012, 0.07), CREAM, {
    at: [0, 0.274, 0.195],
    bone: "jaw",
    name: "jawLower",
  });

  // Ears: satin, pale peach on the inner face (the face whose normal points at the midline).
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const earCoat = paint((p, n) => (n.x * s < -0.45 ? PEACH : EAR_OUT));
    b.extrude(EAR, {
      color: earCoat,
      at: [0.03 * s, 0.35, 0.12],
      x: [0, 0, 1],
      y: [0.3 * s, 1, -0.2],
      thickness: [0.012, 0.004],
      smoothing: 1,
      bone: "head",
      name: `ear${L}`,
    });
  }

  // Eyes with a small white sparkle.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.024, b.segments(14), b.segments(10)), INK, {
      at: [0.04 * s, 0.31, 0.19],
      bone: "head",
      name: `eye${L}`,
    });
    b.part(new THREE.SphereGeometry(0.0055, b.segments(6), b.segments(4)), "#ffffff", {
      at: [0.047 * s, 0.318, 0.2105],
      bone: "head",
      name: `sparkle${L}`,
    });
  }

  // Woven leather collar with a brass bell.
  b.part(new THREE.TorusGeometry(0.052, 0.011, b.segments(8), b.segments(32)), collarCoat, {
    at: [0, 0.228, 0.108],
    rotation: [90, 0, 0],
    bone: "spine4",
    name: "collar",
  });
  b.part(new THREE.SphereGeometry(0.011, b.segments(10), b.segments(8)), BRASS, {
    at: [0, 0.2, 0.163],
    bone: "spine4",
    name: "bell",
  });

  return b.root;
}
