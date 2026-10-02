import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { countershade, gradient, mottle, paint, stripes } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Gray Wolf",
  description: "An alert gray wolf with a raised tail, painted fur markings, expressive eyes, and a layered neck ruff.",
  style: "Blizzard/Warcraft",
  commit: "34f986c",
};

const COAT = "#66727a";
const COAT_LIGHT = "#8f9ba0";
const COAT_DARK = "#29353d";
const BELLY = "#c6c5b8";
const EAR_INNER = "#694d50";
const NOSE = "#171c22";
const EYE = "#d99432";
const PUPIL = "#10151a";
const CLAW = "#d9d0b8";
const MOUTH = "#3a1f25";

const coat = countershade(
  stripes(mottle(COAT, COAT_LIGHT, { size: 0.19, contrast: 0.32, seed: 18 }), COAT_DARK, {
    size: 0.36,
    width: 0.2,
    wobble: 0.08,
    seed: 7,
  }),
  BELLY,
  { level: -0.25, soft: 0.35 },
);
const muzzlePaint = mottle("#9c9b8d", "#c5c0ae", { size: 0.08, contrast: 0.28, seed: 31 });
const tailCoat = gradient(coat, COAT_DARK, [0, 0.72, -0.7], [0, 1.06, -1.25]);

const furTuft = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 64 C8 52 8 38 11 28 C8 20 11 10 16 0 C21 10 24 20 21 28 C24 38 24 52 16 64Z" fill="white"/>
    <path d="M16 61 C13 48 14 35 16 23 C18 35 19 48 16 61Z" fill="#bfc6c7" opacity=".55"/>
  </svg>`,
  { size: 128 },
);
const earFur = svg(
  `<svg viewBox="0 0 24 48"><path d="M12 48 L3 4 L12 0 L21 4 Z" fill="white"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "grayWolf", detail: 1.15, paintSize: 2048 });

  // Skeleton first: torso, alert neck/head, four digitigrade legs, and a lifted tail.
  const hips = b.joint("hips", { at: [0, 0.82, -0.34], dir: [0, 0.12, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.34],
      [0, 0.91, -0.03],
      [0, 1.01, 0.30],
      [0, 1.03, 0.56],
    ]),
    { parent: hips, names: ["pelvis", "spineMid", "chest", "spineTip"], role: "spine", up: [0, 1, 0] },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.03, 0.56],
      [0, 1.16, 0.69],
      [0, 1.31, 0.78],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neckBase", "neckTip", "neckHead"], role: "neck", up: [0, 1, 0] },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 1.31, 0.78], aim: [0, 1.38, 1.15], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.28, 1.01], aim: [0, 1.27, 1.40], role: "jaw", group: "head" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.83, -0.42],
      [0, 0.78, -0.68],
      [0, 0.89, -0.96],
      [0, 1.03, -1.18],
      [0, 1.13, -1.32],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailLift", "tailTip", "tailEnd"], role: "tail", up: [0, 1, 0] },
  );

  const legL = b.chain(
    "legL",
    catmull([
      [0.24, 0.99, 0.43],
      [0.30, 0.70, 0.49],
      [0.27, 0.39, 0.66],
      [0.27, 0.12, 0.75],
    ]),
    { parent: spine.joints[2], names: ["shoulderL", "elbowL", "wristL", "pawL"], role: "leg", contact: [0.27, 0, 0.75] },
  );
  const legR = b.chain(
    "legR",
    catmull([
      [-0.24, 0.99, 0.43],
      [-0.30, 0.70, 0.49],
      [-0.27, 0.39, 0.66],
      [-0.27, 0.12, 0.75],
    ]),
    { parent: spine.joints[2], names: ["shoulderR", "elbowR", "wristR", "pawR"], role: "leg", contact: [-0.27, 0, 0.75] },
  );
  const hindL = b.chain(
    "hindL",
    catmull([
      [0.27, 0.81, -0.28],
      [0.37, 0.60, -0.10],
      [0.34, 0.34, -0.31],
      [0.31, 0.12, -0.05],
    ]),
    { parent: hips, names: ["hipL", "stifleL", "hockL", "rearPawL"], role: "leg", contact: [0.31, 0, -0.05] },
  );
  const hindR = b.chain(
    "hindR",
    catmull([
      [-0.27, 0.81, -0.28],
      [-0.37, 0.60, -0.10],
      [-0.34, 0.34, -0.31],
      [-0.31, 0.12, -0.05],
    ]),
    { parent: hips, names: ["hipR", "stifleR", "hockR", "rearPawR"], role: "leg", contact: [-0.31, 0, -0.05] },
  );

  // Main fur masses use low-poly faceted tubes with a strong painted countershade.
  const body = b.sweep(spine, (t) => 0.24 + 0.055 * Math.sin(Math.PI * t), {
    color: coat,
    section: { ngon: 8 },
    smooth: false,
    shift: (t) => [0, -0.035 * Math.sin(Math.PI * t)],
    group: "body",
    name: "bodyFur",
  });
  const neckFur = b.sweep(neck, [0.19, 0.15], {
    color: coat,
    section: { ngon: 8 },
    smooth: false,
    group: "neck",
    name: "neckFur",
  });
  const tailFur = b.sweep(tail, [0.14, 0.025], {
    color: tailCoat,
    section: { ngon: 8 },
    smooth: false,
    group: "tail",
    name: "tailFur",
  });
  for (const leg of [legL, legR, hindL, hindR]) {
    b.sweep(leg, (t) => 0.105 - 0.052 * t, {
      color: (t) => t > 0.72 ? BELLY : coat,
      section: { ngon: 6 },
      smooth: false,
      group: "legs",
    });
  }

  b.part(new THREE.SphereGeometry(1, 10, 7), coat, {
    bone: head,
    at: head.at,
    scale: [0.22, 0.24, 0.27],
    flat: true,
    group: "head",
    name: "skull",
  });
  b.sweep(
    catmull([
      [0, 1.34, 0.99],
      [0, 1.36, 1.19],
      [0, 1.35, 1.42],
    ]),
    [0.12, 0.055],
    { bone: head, color: muzzlePaint, section: { ngon: 8 }, smooth: false, group: "head", name: "muzzle" },
  );
  const lowerJaw = b.sweep(
    catmull([
      [0, 1.275, 1.00],
      [0, 1.26, 1.20],
      [0, 1.28, 1.39],
    ]),
    [0.075, 0.035],
    { bone: jaw, color: muzzlePaint, section: { ngon: 6 }, smooth: false, group: "jaw", name: "lowerJaw" },
  );
  b.sweep([[0, 1.305, 1.08], [0, 1.30, 1.40]], 0.018, { bone: jaw, color: MOUTH, caps: "flat", section: { ngon: 5 }, name: "mouthLine" });

  // Ears, inner ear leather, and a mane-like ruff sell the heroic silhouette.
  const earOutline: [number, number][] = [[-0.10, 0], [0.10, 0], [0.065, 0.17], [0, 0.28], [-0.07, 0.17]];
  for (const s of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: head.local([s * 0.13, -0.005, 0.12]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: coat,
      bone: head,
      group: "head",
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    b.extrude([[-0.06, 0.03], [0.06, 0.03], [0.035, 0.14], [0, 0.21], [-0.04, 0.14]], {
      at: ear.local([0, 0, 0.026]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.004,
      color: EAR_INNER,
      bone: head,
      group: "head",
      name: `innerEar${s > 0 ? "L" : "R"}`,
    });
    b.cards([frame(head.local([s * 0.12, -0.01, 0.16]), [0, 1, 0])], earFur, {
      size: [0.09, 0.18],
      lean: 12,
      color: COAT_LIGHT,
      bone: head,
      sink: 0.05,
    });
  }

  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 1.375, 1.45],
    scale: [0.095, 0.065, 0.07],
    flat: true,
    group: "head",
    name: "nose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), EYE, {
      bone: head,
      at: head.local([s * 0.145, 0.10, 0.075]),
      scale: [0.038, 0.038, 0.038],
      flat: true,
      group: "face",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), PUPIL, {
      bone: head,
      at: head.local([s * 0.171, 0.115, 0.078]),
      scale: [0.014, 0.014, 0.022],
      flat: true,
      group: "face",
      name: `pupil${s > 0 ? "L" : "R"}`,
    });
    b.sweep(
      [head.local([s * 0.10, 0.10, 0.12]), head.local([s * 0.16, 0.105, 0.12])],
      0.018,
      { bone: head, color: COAT_DARK, caps: "flat", section: { ngon: 5 }, name: `brow${s > 0 ? "L" : "R"}` },
    );
  }

  // Four broad paws, split toes, and pale claws make floor contact readable.
  const paws = [legL.joints[legL.joints.length - 1], legR.joints[legR.joints.length - 1], hindL.joints[hindL.joints.length - 1], hindR.joints[hindR.joints.length - 1]] as const;
  for (const [s, paw, rear] of [[1, paws[0], false], [-1, paws[1], false], [1, paws[2], true], [-1, paws[3], true]] as const) {
    const p = paw.at;
    b.part(new THREE.SphereGeometry(1, 8, 5), COAT_DARK, {
      bone: paw,
      at: [p.x, 0.065, p.z + (rear ? 0.035 : 0.04)],
      scale: [0.13, 0.065, 0.18],
      flat: true,
      name: `${rear ? "rear" : "front"}Paw${s > 0 ? "L" : "R"}`,
    });
    for (let i = -1; i <= 1; i++) {
      const toeX = p.x + i * 0.042;
      const toeZ = p.z + (rear ? 0.07 : 0.09);
      b.sweep([[toeX, 0.09, toeZ], [toeX, 0.065, toeZ + 0.085]], 0.017, {
        bone: paw,
        color: CLAW,
        section: { ngon: 5 },
        caps: "point",
        name: `${rear ? "rear" : "front"}Claw${s > 0 ? "L" : "R"}${i + 2}`,
      });
    }
  }

  // Painted mane/ruff and directional fur cards add the hand-painted surface breakup.
  const bodySurface = b.surface(body);
  const neckSurface = b.surface(neckFur);
  const tailSurface = b.surface(tailFur);
  b.cards(
    tailSurface.scatter(36, { rng: rng(18), minDist: 0.03, filter: (h) => h.n.y > -0.2 }),
    furTuft,
    { size: [0.05, 0.15], lean: 48, bend: 25, vary: 0.22, rng: rng(19), color: COAT_LIGHT, cross: true },
  );
  b.cards(
    bodySurface.scatter(70, { rng: rng(14), minDist: 0.055, filter: (h) => h.n.y > 0.15 }),
    furTuft,
    { size: [0.045, 0.12], lean: 55, bend: 20, vary: 0.25, rng: rng(15), color: COAT_LIGHT, cross: true },
  );
  b.cards(
    neckSurface.scatter(85, { rng: rng(16), minDist: 0.035, filter: (h) => h.n.y > -0.1 }),
    furTuft,
    { size: [0.06, 0.19], lean: 42, bend: 28, vary: 0.3, rng: rng(17), color: COAT_LIGHT, cross: true },
  );

  // Small paint-defined highlights on the shoulder ridge and cheek planes.
  const shoulderPaint = paint((_p, n, s) => (n.y > 0.65 && s[0] > 0.2 ? COAT_LIGHT : coat));
  b.sweep(spine, [0.248, 0.19], { color: shoulderPaint, section: { ngon: 8 }, smooth: false, name: "shoulderHighlight" });

  // Chin teeth are intentionally few and chunky, keeping the Warcraft puppet language.
  b.along(lowerJaw, 5, (at) => b.spike(at, at, 0.045, 0.012, { color: CLAW, name: "tooth" }));

  return b.root;
}
