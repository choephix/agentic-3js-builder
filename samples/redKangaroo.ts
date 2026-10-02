import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { cellPaint, pixelArt } from "../kits/pixel";

const FUR = cellPaint(
  0.028,
  (c) =>
    c.pick(["#5f2515", "#78321c", "#94401f", "#ad5127", "#c26935"], 0.38 + 0.35 * c.n.y + 0.12 * (c.random(11) - 0.5)),
  { dither: true },
);
const BELLY = "#d99158";
const DARK = "#24130f";
const NOSE = "#171116";
const EAR_INNER = "#d78679";
const EYE_WHITE = "#f8e8c5";
const EYE_GLOW = "#271b16";
const PAW = "#372018";
const POUCH = "#9b4b2a";

const EYE = pixelArt(["..kkkk..", ".kwwwwk.", "kwwggwwk", "kwwggwwk", ".kwwwwk.", "..kkkk.."], {
  k: NOSE,
  w: EYE_WHITE,
  g: EYE_GLOW,
});

export const meta = {
  name: "Red Kangaroo Buck",
  description:
    "A full-size pixel-faceted red kangaroo buck standing on powerful hind feet and a resting tail, with a joey in his pouch.",
};

export default function build() {
  const b = createBuilder({ name: "redKangaroo", detail: 0.82, paintSize: 1024 });
  const hips = b.joint("hips", { at: [0, 0.92, -0.02], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([hips.at, [0, 1.02, 0.01], [0, 1.18, 0.03], [0, 1.31, 0.08], [0, 1.42, 0.12]]),
    { parent: hips, names: ["spine1", "spine2", "chest", "shoulder"], role: "spine" },
  );
  const neck = b.chain("neck", catmull([spine.joints[3].at, [0, 1.43, 0.14], [0, 1.46, 0.18]]), {
    parent: spine.joints[3],
    names: ["neck1", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.49, 0.22],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 0.34],
    dir: [0, -0.2, 1],
    role: "jaw",
    group: "head",
  });

  // The torso and thick tail establish the characteristic upright silhouette.
  b.sweep(spine, [0.22, 0.24, 0.2, 0.13], {
    color: FUR,
    section: { ngon: 8 },
    sides: 8,
    shift: (t) => [0, -0.025 * Math.sin(t * Math.PI)],
    name: "torso",
    group: "body",
  });
  b.sweep(neck, [0.13, 0.105], { color: FUR, sides: 8, name: "neck", group: "body" });
  b.sweep(
    b.chain(
      "tail",
      catmull([
        [0, 0.91, -0.13],
        [0, 0.68, -0.48],
        [0, 0.36, -0.82],
        [0, 0.18, -1.08],
        [0, 0.115, -1.28],
      ]),
      { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", contact: [0, 0, -1.28] },
    ),
    [0.17, 0.145, 0.105, 0.065, 0.018],
    {
      color: FUR,
      bands: [
        [0.78, BELLY],
        [0.94, "#e4b278"],
      ],
      sides: 8,
      name: "tail",
      group: "tail",
    },
  );

  // Long digitigrade hind legs with broad planted feet.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.14, 0.93, 0.01] as const;
    const foot = [s * 0.17, 0.08, 0.34] as const;
    const points = limb(
      hip,
      foot,
      [0.35, 0.3, 0.2, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${side}`, points, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.sweep(leg, [0.115, 0.095, 0.075, 0.07, 0.055], {
      color: FUR,
      section: "box",
      sides: 6,
      name: `leg${side}`,
      group: "legs",
    });
    b.capsule(leg.tip!.at, [s * 0.18, 0.08, 0.54], 0.075, {
      color: PAW,
      bone: leg.tip!,
      sides: 6,
      name: `foot${side}`,
      group: "legs",
    });
    for (let d = 0; d < 3; d++) {
      const toeStart = [s * (0.14 + d * 0.035), 0.075, 0.47] as const;
      const toeEnd = [s * (0.14 + d * 0.04), 0.055, 0.63 - d * 0.025] as const;
      b.capsule(toeStart, toeEnd, 0.022, {
        color: PAW,
        bone: leg.tip!,
        sides: 6,
        name: `toe${side}${d + 1}`,
        group: "digits",
      });
    }
  }

  // Short forearms held forward, with three little digits on each hand.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.16, 1.3, 0.14],
        [s * 0.23, 1.17, 0.3],
        [s * 0.2, 1.09, 0.5],
      ]),
      { parent: spine.joints[3], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, [0.065, 0.052, 0.038], { color: FUR, sides: 6, name: `arm${side}`, group: "arms" });
    for (let d = 0; d < 3; d++) {
      const tip = [s * (0.2 + (d - 1) * 0.04), 1.055 - d * 0.01, 0.68 + d * 0.025] as const;
      b.sprout(`digit${side}${d + 1}`, arm.tip!, tip, [0.017, 0.006], {
        count: 0,
        color: PAW,
        caps: { end: "point" },
        role: "digit",
        name: `digit${side}${d + 1}`,
        group: "digits",
      });
    }
  }

  // Broad pointed ears: a warm outer slab with a smaller pink inner slab.
  const earOutline: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.062, 0.18, "sharp"],
    [0.018, 0.29, "sharp"],
    [-0.018, 0.32, "sharp"],
    [-0.06, 0.2, "sharp"],
  ];
  const innerOutline: [number, number, "sharp"][] = [
    [-0.038, 0.03, "sharp"],
    [0.038, 0.03, "sharp"],
    [0.03, 0.16, "sharp"],
    [0, 0.25, "sharp"],
    [-0.03, 0.16, "sharp"],
  ];
  for (const s of [1, -1]) {
    const earAt = head.local({ left: s * 0.115, up: 0.04, back: 0.015 });
    b.extrude(earOutline, {
      at: earAt,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: FUR,
      bone: head,
      name: `ear${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
    b.extrude(innerOutline, {
      at: head.local({ left: s * 0.115, up: 0.045, forward: 0.022 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: EAR_INNER,
      bone: head,
      name: `earInner${s > 0 ? "L" : "R"}`,
      group: "ears",
    });
  }

  // Blocky head, separate upper/lower jaws, nose and bright pixel eyes.
  b.part(new THREE.SphereGeometry(1, 10, 7), FUR, {
    bone: head,
    at: head.at,
    scale: [0.16, 0.17, 0.2],
    flat: true,
    name: "skull",
    group: "head",
  });
  b.capsule(head.local({ forward: 0.09, down: 0.015 }), head.local({ forward: 0.34, down: 0.035 }), 0.095, {
    color: FUR,
    bone: head,
    sides: 7,
    name: "muzzle",
    group: "head",
  });
  b.capsule(jaw.at, jaw.local({ forward: 0.28, down: 0.06 }), 0.072, {
    color: BELLY,
    bone: jaw,
    sides: 7,
    name: "lowerJaw",
    group: "jaw",
  });
  b.rod(jaw.local({ forward: 0.03, up: 0.015 }), jaw.local({ forward: 0.27, up: 0.015 }), 0.012, {
    color: DARK,
    bone: jaw,
    name: "mouthLine",
    group: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.39, down: 0.02 }),
    flat: true,
    name: "nose",
    group: "head",
  });
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.1, up: 0.055, forward: 0.17 });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), EYE_WHITE, {
      bone: head,
      at: eyeAt,
      texture: EYE,
      flat: true,
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NOSE, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.055, forward: 0.201 }),
      flat: true,
      name: `pupil${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // A pouch and its rim sit forward of the belly; the joey has independent head and jaw joints.
  b.part(new THREE.SphereGeometry(1, 9, 6), POUCH, {
    bone: hips,
    at: [0, 0.78, 0.17],
    scale: [0.19, 0.21, 0.09],
    flat: true,
    name: "pouch",
    group: "joey",
  });
  b.rod([-0.15, 0.91, 0.25], [0.15, 0.91, 0.25], 0.018, {
    color: BELLY,
    bone: hips,
    name: "pouchRim",
    group: "joey",
  });
  const joeyHead = b.joint("joeyHead", {
    parent: hips,
    at: [0, 0.94, 0.3],
    dir: [0, 0.12, 1],
    role: "head",
    group: "joey",
  });
  const joeyJaw = b.joint("joeyJaw", {
    parent: joeyHead,
    at: [0, 0.905, 0.38],
    dir: [0, -0.15, 1],
    role: "jaw",
    group: "joey",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), FUR, {
    bone: joeyHead,
    at: joeyHead.at,
    scale: [0.095, 0.1, 0.11],
    flat: true,
    name: "joeySkull",
    group: "joey",
  });
  b.capsule(joeyJaw.at, joeyJaw.local({ forward: 0.13, down: 0.02 }), 0.038, {
    color: BELLY,
    bone: joeyJaw,
    sides: 6,
    name: "joeyJaw",
    group: "joey",
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), NOSE, {
    bone: joeyHead,
    at: joeyHead.local({ forward: 0.12, down: 0.005 }),
    name: "joeyNose",
    group: "joey",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), EYE_WHITE, {
      bone: joeyHead,
      at: joeyHead.local({ left: s * 0.055, up: 0.035, forward: 0.09 }),
      group: "joey",
    });
  }

  // Pixel-readable cheek and belly accents, each as a separate primitive detail.
  b.part(new THREE.SphereGeometry(0.09, 7, 5), BELLY, {
    bone: spine.joints[1],
    at: [0, 1.05, 0.17],
    scale: [1.55, 1.2, 0.35],
    flat: true,
    name: "bellyPatch",
    group: "body",
  });

  // Consume the seeded RNG in one deterministic place for any future detail additions.
  rng(19)();
  return b.root;
}
