import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { countershade, gradient, mottle, spots, stripes } from "../src/paint";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { svg } from "../src/texture";
import type { Chain } from "../src/skeleton";
const COAT_BASE = mottle("#b86e58", "#e9aa7d", { size: 0.18, contrast: 0.72, seed: 21 });
const COAT = countershade(COAT_BASE, "#f7d9ad", { level: -0.18, soft: 0.12 });
const PALE = "#f7d9ad";
const PALE_SHADE = "#d99183";
const NOSE = "#482746";
const EYE = "#312047";
const EYE_GLOW = "#ffd86a";
const INK = "#39213b";
const HORN = stripes("#d28a45", "#f4c766", { size: 0.11, axis: "y", width: 0.36, wobble: 0.22, seed: 8 });
const WING = "#69c7bd";
const WING_SHADOW = "#378f9a";
const WING_EDGE = "#f0bc64";
const EAR_INNER = "#ee8c99";
const PAW = gradient(COAT, "#8c4a50", [0, 0.48, -0.3], [0, 0.1, -0.3]);
const TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M2 62 L7 18 L12 28 L16 3 L20 28 L26 14 L30 62 Z" fill="white"/><path d="M7 59 L12 30 L16 42 L21 28 L26 59" fill="none" stroke="#d8a070" stroke-width="3"/></svg>`,
  { size: 128 },
);

export const meta = {
  name: "Wolpertinger",
  description: "A storybook wolpertinger: a horned, winged, fanged hare with a bright patchwork coat and curious little accessories.",
  style: "whimsical",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "wolpertinger", detail: 1.1, paintSize: 1024 });

  // Skeleton first: one root, then the articulated body, limbs, ears, horns and wings.
  const hips = b.joint("hips", { at: [0, 0.43, -0.22], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.45, -0.25],
      [0, 0.49, 0.02],
      [0, 0.54, 0.25],
    ]),
    { parent: hips, names: ["spineBase", "spineChest", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.54, 0.24],
      [0, 0.67, 0.37],
      [0, 0.77, 0.43],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckMid", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 0.8, 0.47], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.79, 0.53], dir: [0, -0.13, 0.99], role: "jaw" });

  const hindLegs: Chain[] = [];
  const frontLegs: Chain[] = [];
  for (const s of [1, -1]) {
    const hind = b.chain(
      `hindLeg${s > 0 ? "L" : "R"}`,
      limb(
        [s * 0.16, 0.47, -0.2],
        [s * 0.2, 0.07, -0.3],
        [0.18, 0.17, 0.14],
        [[0, 0, 1], [0, 0, -1]],
      ),
      {
        parent: spine.joints[0],
        names: [s > 0 ? "hipHL" : "hipHR", s > 0 ? "kneeHL" : "kneeHR", s > 0 ? "hockHL" : "hockHR", s > 0 ? "pawHL" : "pawHR"],
        role: "leg",
        contact: [s * 0.2, 0, -0.3],
      },
    );
    hindLegs.push(hind);

    const front = b.chain(
      `frontLeg${s > 0 ? "L" : "R"}`,
      limb(
        [s * 0.14, 0.5, 0.22],
        [s * 0.16, 0.07, 0.3],
        [0.15, 0.15, 0.13],
        [[0, 0, 1], [0, 0, -1]],
      ),
      {
        parent: spine.tip!,
        names: [s > 0 ? "shoulderL" : "shoulderR", s > 0 ? "elbowL" : "elbowR", s > 0 ? "wristL" : "wristR", s > 0 ? "pawFL" : "pawFR"],
        role: "leg",
        contact: [s * 0.16, 0, 0.3],
      },
    );
    frontLegs.push(front);
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.47, -0.32],
      [0, 0.59, -0.49],
      [0, 0.7, -0.65],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );

  const ears: Chain[] = [];
  const horns: Chain[] = [];
  const wings: Chain[] = [];
  const wingRibs: Chain[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ears.push(
      b.chain(
        `ear${side}`,
        catmull([
          [s * 0.1, 0.92, 0.44],
          [s * 0.12, 1.1, 0.4],
          [s * 0.08, 1.24, 0.35],
        ]),
        { parent: head, names: [`ear${side}Base`, `ear${side}Mid`, `ear${side}Tip`], role: "hinge" },
      ),
    );
    horns.push(
      b.chain(
        `horn${side}`,
        catmull([
          [s * 0.13, 0.91, 0.45],
          [s * 0.23, 1.04, 0.53],
          [s * 0.29, 1.15, 0.49],
          [s * 0.23, 1.2, 0.39],
        ]),
        { parent: head, names: [`horn${side}Base`, `horn${side}Mid`, `horn${side}Bend`, `horn${side}Tip`], role: "fan" },
      ),
    );
    wings.push(
      b.chain(
        `wing${side}`,
        catmull([
          [s * 0.14, 0.63, 0.19],
          [s * 0.3, 0.84, 0.12],
          [s * 0.48, 0.93, -0.06],
        ]),
        { parent: spine.tip!, names: [`wing${side}Root`, `wing${side}Mid`, `wing${side}Tip`], role: "wing" },
      ),
    );
    wingRibs.push(
      b.chain(
        `wingRib${side}`,
        catmull([
          [s * 0.14, 0.63, 0.19],
          [s * 0.28, 0.7, -0.02],
          [s * 0.4, 0.7, -0.22],
        ]),
        { parent: spine.tip!, names: [`rib${side}Root`, `rib${side}Mid`, `rib${side}Tip`], role: "wing" },
      ),
    );
  }

  // Main soft masses.
  b.sweep(spine, (t) => [0.205 + 0.025 * Math.sin(t * Math.PI), 0.18 + 0.025 * Math.sin(t * Math.PI)], {
    section: "circle",
    sides: 10,
    color: COAT,
    group: "body",
    name: "bodyCoat",
  });
  const neckTube = b.sweep(neck, [0.14, 0.105], { sides: 9, color: COAT, group: "neck", name: "neckCoat" });
  b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.at,
    scale: [0.185, 0.19, 0.19],
    name: "headMass",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), PALE, {
    bone: head,
    at: [0, 0.82, 0.62],
    scale: [0.135, 0.105, 0.115],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.83, 0.73],
    scale: [0.06, 0.045, 0.035],
    name: "velvetNose",
  });

  // A soft bib and a spotted rump give the hare a readable colour break.
  b.sweep(
    catmull([
      [0, 0.58, 0.37],
      [0, 0.64, 0.43],
      [0, 0.75, 0.49],
    ]),
    [0.13, 0.075],
    { bone: neck, color: PALE, sides: 8, name: "creamBib" },
  );
  b.part(new THREE.SphereGeometry(1, 10, 7), spots(COAT_BASE, "#f1c48a", { size: 0.08, amount: 0.3, rosette: true, seed: 4 }), {
    bone: spine.joints[0],
    at: [0, 0.48, -0.28],
    scale: [0.18, 0.16, 0.14],
    name: "spottedRump",
  });

  // Four articulated legs, padded feet, and three playful toes on each paw.
  for (const leg of [...hindLegs, ...frontLegs]) {
    b.sweep(leg, (t) => [0.07 - 0.028 * t, 0.065 - 0.025 * t], {
      sides: 7,
      color: (t) => (t > 0.72 ? PAW : COAT),
      skin: "smooth",
      group: "legs",
    });
    const tip = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 9, 6), PAW, {
      bone: tip,
      at: tip.at,
      scale: [0.09, 0.065, 0.1],
      name: `${tip.name}Pad`,
    });
    for (const toe of [-1, 0, 1]) {
      const start = tip.local([toe * 0.035, -0.018, 0.045]);
      b.spike(start, tip.dir([0, -0.12, 1]), 0.085, 0.016, { color: PALE, bone: tip, name: `${tip.name}Toe${toe + 2}` });
    }
  }

  // Tail with a pale tip and a ring of fluffy triangular tufts.
  b.sweep(tail, (t) => 0.12 - 0.085 * t, {
    sides: 9,
    color: (t) => (t > 0.68 ? PALE : COAT),
    name: "pomTail",
  });
  b.cards(
    [tail.at(0.65), tail.at(0.78), tail.at(0.9)].map((p) => frame(p.at, p.normal)),
    TUFT,
    { size: [0.08, 0.14], lean: 35, bend: 18, color: PALE, vary: 0.16, rng: rng(19), cross: true },
  );

  // Long ears: warm inner panels sit inside the coat tubes.
  for (let i = 0; i < ears.length; i++) {
    const s = i === 0 ? 1 : -1;
    const ear = ears[i];
    b.sweep(ear, [0.065, 0.022], { section: "box", color: COAT, group: "ears", name: `ear${s > 0 ? "L" : "R"}Fur` });
    b.sweep(
      catmull([
        [s * 0.102, 0.98, 0.45],
        [s * 0.12, 1.1, 0.41],
        [s * 0.08, 1.2, 0.36],
      ]),
      [0.037, 0.012],
      { bone: ear, section: "box", color: EAR_INNER, name: `ear${s > 0 ? "L" : "R"}Inner` },
    );
    b.cards([frame(ear.at(0.72).at, ear.at(0.72).normal)], TUFT, {
      size: [0.045, 0.1],
      lean: 12,
      color: PALE_SHADE,
      mirror: s < 0,
    });
  }

  // Curved golden horns with small studs following their ridges.
  for (const horn of horns) {
    const side = horn.joints[0].at.x > 0 ? "L" : "R";
    const hornTube = b.sweep(horn, [0.045, 0.008], { sides: 7, color: HORN, caps: { start: "flat", end: "point" }, name: `horn${side}Gold` });
    b.along(hornTube, 5, (at) => b.part(new THREE.SphereGeometry(0.012, 6, 4), WING_EDGE, { at, bone: at.bone, name: `horn${side}Stud` }));
  }

  // Wing membranes and their raised golden spar lines.
  for (let i = 0; i < wings.length; i++) {
    const wing = wings[i];
    const rib = wingRibs[i];
    const side = wing.joints[0].at.x > 0 ? "L" : "R";
    b.membrane(wing, rib, { color: WING, thickness: 0.012, rows: 4, cols: 6, scallop: 0.16, name: `wing${side}Membrane` });
    b.sweep(wing, [0.024, 0.008], { sides: 6, color: WING_EDGE, name: `wing${side}Spar` });
    b.sweep(rib, [0.014, 0.005], { sides: 6, color: WING_SHADOW, name: `wing${side}Rib` });
    b.along(wing, 4, (at) => b.part(new THREE.SphereGeometry(0.017, 6, 4), WING_EDGE, { at, name: `wing${side}Knuckle` }));
  }

  // Eyes: gold iris discs, dark pupils and tiny catchlights on both cheeks.
  for (const s of [1, -1]) {
    const eyeAt = [s * 0.105, 0.87, 0.59] as [number, number, number];
    b.part(new THREE.SphereGeometry(1, 10, 8), EYE_GLOW, { bone: head, at: eyeAt, scale: [0.045, 0.052, 0.028], name: `iris${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 8, 6), EYE, { bone: head, at: [s * 0.105, 0.88, 0.613], scale: [0.019, 0.03, 0.014], name: `pupil${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#fff4d6", { bone: head, at: [s * 0.098, 0.895, 0.625], scale: [0.008, 0.01, 0.006], name: `eyeSpark${s > 0 ? "L" : "R"}` });
    b.spike([s * 0.105, 0.9, 0.59], head.dir([s * 0.1, 0.1, 1]), 0.02, 0.006, { color: INK, bone: head, name: `brow${s > 0 ? "L" : "R"}` });
  }

  // Separate jaws let the fangs read even in the neutral pose.
  b.sweep(
    catmull([
      [0, 0.79, 0.54],
      [0, 0.75, 0.62],
      [0, 0.71, 0.69],
    ]),
    [0.09, 0.05],
    { bone: jaw, sides: 8, color: PALE, name: "lowerJaw" },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.062, 0.84, 0.676], [0, -0.9, 0.18], 0.075, 0.014, { color: "#fff5df", bone: head, name: `upperFang${s > 0 ? "L" : "R"}` });
    b.spike([s * 0.06, 0.745, 0.676], [0, 0.65, 0.25], 0.052, 0.012, { color: "#fff5df", bone: jaw, name: `lowerFang${s > 0 ? "L" : "R"}` });
    const whiskerStart = [s * 0.1, 0.81, 0.68] as [number, number, number];
    b.sweep(
      catmull([whiskerStart, [s * 0.18, 0.82, 0.73], [s * 0.25, 0.84, 0.71]]),
      [0.006, 0.001],
      { bone: head, sides: 5, color: INK, caps: "point", name: `whisker${s > 0 ? "L" : "R"}A` },
    );
    b.sweep(
      catmull([whiskerStart, [s * 0.18, 0.79, 0.69], [s * 0.24, 0.77, 0.62]]),
      [0.005, 0.001],
      { bone: head, sides: 5, color: INK, caps: "point", name: `whisker${s > 0 ? "L" : "R"}B` },
    );
  }

  // A tiny chest medallion gives the otherwise feral creature a storybook keepsake.
  const medallion = b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 10), WING_EDGE, {
    bone: spine.tip!,
    at: [0, 0.6, 0.42],
    dir: [0, 0, 1],
    axis: "y",
    name: "chestMedallion",
  });
  b.part(new THREE.SphereGeometry(0.018, 7, 5), NOSE, { bone: spine.tip!, at: medallion.local([0, 0.01, 0.045]), name: "medallionDot" });

  // Keep a couple of fine fur cards on the cheeks and rump so the silhouette feels plush.
  const cheekFrames = [head.local([0.14, 0.02, -0.01]), head.local([-0.14, 0.02, -0.01])].map((p) => frame(p, [0, 0, 1]));
  b.cards(cheekFrames, TUFT, { size: [0.045, 0.075], lean: 70, bend: 18, color: PALE, cross: true, sink: 0.18 });

  // A named line is used for the collar seam, which keeps the ring derived from the neck.
  const collar = b.surface(neckTube).loop(neck.tip!, { lift: 0.008 });
  b.sweep(collar, 0.014, { color: WING_EDGE, sides: 6, name: "collarSeam" });

  return b.root;
}

