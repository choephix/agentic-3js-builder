import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { line } from "../src/frame";
import { limb } from "../src/ik";
import { catmull } from "../src/path";

export const meta = {
  name: "Centaur Archer",
  description:
    "A proud centaur archer with a horse body, planted hooves, braided hair, leather bracers, a back quiver and a recurved bow.",
  builtBy: "GPT-6 Astra",
};

type V3 = [number, number, number];

const COAT = "#8e4e2e";
const COAT_LIGHT = "#bd7546";
const COAT_DARK = "#67321f";
const SKIN = "#c98d68";
const SKIN_LIGHT = "#e0ae82";
const HAIR = "#2c1b1b";
const HAIR_LIGHT = "#54302a";
const LEATHER = "#59331f";
const LEATHER_LIGHT = "#8b5832";
const BOW_WOOD = "#9d542b";
const BOW_LIGHT = "#d58a42";
const METAL = "#c99b45";
const HOOF = "#241d20";
const EYE = "#f2c35b";
const INK = "#17131a";
const IVORY = "#f0dfb6";

export default function build() {
  const b = createBuilder({ name: "centaurArcher", detail: 0.9 });

  // Skeleton first: horse spine, four legs, human torso, arms, head and expressive jaw.
  const hips = b.joint("hips", { at: [0, 1.03, -0.18], role: "spine", group: "horseBody" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.03, -0.72],
      [0, 1.08, -0.42],
      [0, 1.12, -0.05],
      [0, 1.17, 0.32],
      [0, 1.21, 0.48],
    ]),
    { parent: hips, count: 5, role: "spine", group: "horseBody" },
  );
  const horseNeck = b.chain(
    "horseNeck",
    catmull([
      [0, 1.18, 0.42],
      [0, 1.25, 0.48],
      [0, 1.37, 0.49],
    ]),
    { parent: spine.joints[3], count: 3, role: "spine", group: "horseBody" },
  );

  const torso = b.chain(
    "torso",
    catmull([
      [0, 1.28, 0.18],
      [0, 1.48, 0.25],
      [0, 1.70, 0.29],
      [0, 1.86, 0.32],
    ]),
    { parent: hips, count: 4, names: ["pelvis", "chest", "shoulder", "neckBase"], role: "spine", group: "humanBody" },
  );
  const head = b.joint("head", {
    parent: torso.joints[3],
    at: [0, 1.90, 0.34],
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.055, 0.05]),
    aim: head.local([0, -0.10, 0.30]),
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.02, -0.66],
      [0, 0.95, -0.98],
      [0.02, 0.82, -1.27],
      [0.07, 0.67, -1.48],
      [0.11, 0.61, -1.65],
    ]),
    { parent: hips, count: 6, role: "tail", group: "tail" },
  );

  const legData = [
    { s: 1, side: "L", z: 0.31, label: "front" },
    { s: -1, side: "R", z: 0.31, label: "front" },
    { s: 1, side: "L", z: -0.45, label: "hind" },
    { s: -1, side: "R", z: -0.45, label: "hind" },
  ] as const;
  const legs = legData.map(({ s, side, z, label }) => {
    const hip: V3 = [s * 0.27, 1.02, z];
    const foot: V3 = [s * (label === "hind" ? 0.31 : 0.25), 0.065, z + (label === "front" ? 0.08 : -0.04)];
    const points = limb(
      hip,
      foot,
      label === "hind" ? [0.39, 0.36, 0.30] : [0.35, 0.37, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(`leg${label}${side}`, points, {
      parent: hips,
      names: [`hip${label}${side}`, `knee${label}${side}`, `hock${label}${side}`],
      role: "leg",
      group: `leg${label}${side}`,
      contact: [foot[0], 0, foot[2] + 0.08],
    });
    return { chain, points, side, label };
  });

  const arms = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    const shoulder: V3 = [s * 0.20, 1.68, 0.28];
    const elbow: V3 = [s * 0.43, 1.60, 0.43];
    const wrist: V3 = [s * 0.62, 1.49, 0.62];
    const chain = b.chain(`arm${side}`, [shoulder, elbow, wrist], {
      parent: torso.joints[2],
      count: 3,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    return { chain, side, s, shoulder, elbow, wrist };
  });

  const braids = ([1, -1] as const).map((s) => {
    const side = s > 0 ? "L" : "R";
    return b.chain(
      `braid${side}`,
      catmull([
        head.local([s * 0.105, 0.09, -0.005]),
        head.local([s * 0.13, -0.08, -0.035]),
        head.local([s * 0.16, -0.24, -0.01]),
        head.local([s * 0.18, -0.34, 0.035]),
      ]),
      { parent: head, count: 4, role: "digit", group: "hair" },
    );
  });
  const beard = b.chain(
    "beard",
    catmull([
      head.local([0, -0.03, 0.13]),
      head.local([0, -0.13, 0.16]),
      head.local([0, -0.27, 0.10]),
    ]),
    { parent: jaw, count: 3, role: "digit", group: "hair" },
  );

  // Horse body and withers.
  b.sweep(
    catmull([
      [0, 1.03, -0.78],
      [0, 1.09, -0.48],
      [0, 1.12, -0.12],
      [0, 1.17, 0.24],
      [0, 1.20, 0.48],
    ]),
    (t) => [0.26 + 0.055 * Math.sin(t * Math.PI), 0.25 + 0.045 * Math.sin(t * Math.PI)],
    { bone: [tail, hips, spine], color: COAT, section: "circle", sides: 8, group: "horseBody", name: "barrel" },
  );
  b.sweep(horseNeck, [0.19, 0.14], { color: COAT_LIGHT, sides: 8, group: "horseBody", name: "withers" });

  // Strong, slightly angular legs and four broad hooves.
  for (const { chain, points, side, label } of legs) {
    b.sweep(chain, (t) => [0.12 - 0.055 * t, 0.13 - 0.06 * t], {
      color: label === "hind" ? COAT : COAT_LIGHT,
      sides: 7,
      group: `leg${label}${side}`,
      name: `legTube${label}${side}`,
    });
    const ankle = points[points.length - 1];
    const hoof = b.part(new THREE.BoxGeometry(0.13, 0.085, 0.19), HOOF, {
      bone: chain.joints[2],
      at: [ankle.x, 0.043, ankle.z + 0.055],
      group: `leg${label}${side}`,
      name: `hoof${label}${side}`,
    });
    // A small brass fetlock band makes the four stance points easy to read.
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), METAL, {
      bone: chain.joints[2],
      at: [ankle.x, ankle.y + 0.035, ankle.z],
      group: `leg${label}${side}`,
      name: `fetlock${label}${side}`,
    });
    void hoof;
  }

  // Tail taper, with a dark tuft at the tip.
  b.sweep(tail, (t) => 0.105 - 0.085 * t, {
    color: COAT_DARK,
    sides: 7,
    group: "tail",
    name: "tailTube",
  });
  b.sweep(
    catmull([
      tail.at(0.82),
      tail.at(0.91),
      tail.at(1),
      [0.10, 0.60, -1.73],
    ]),
    [0.06, 0],
    { bone: tail.joints[4], color: HAIR, caps: "point", group: "tail", name: "tailTuft" },
  );

  // Human torso: a warm leather harness and a pale shirt-like chest over the horse.
  b.sweep(torso, (t) => [0.19 - 0.035 * t, 0.16 - 0.035 * t], {
    color: SKIN_LIGHT,
    section: "box",
    group: "humanBody",
    name: "torso",
  });
  b.sweep(catmull([[0, 1.33, 0.10], [0, 1.52, 0.19], [0, 1.76, 0.23]]), [0.205, 0.018], {
    bone: torso.joints[0],
    color: LEATHER,
    caps: "flat",
    group: "humanBody",
    name: "harnessBelt",
  });
  b.sweep(catmull([[-0.18, 1.35, 0.11], [0, 1.59, 0.24], [0.18, 1.35, 0.11]]), 0.018, {
    bone: torso.joints[0],
    color: LEATHER_LIGHT,
    caps: "round",
    group: "humanBody",
    name: "harnessYoke",
  });

  // Arms, hands and chunky leather bracers.
  for (const { chain, side, s, elbow, wrist } of arms) {
    b.sweep(chain, [0.065, 0.045], { color: SKIN, sides: 7, group: `arm${side}`, name: `armTube${side}` });
    const bracerMid: V3 = [s * 0.53, 1.55, 0.52];
    b.capsule(elbow, bracerMid, [0.083, 0.073], { bone: chain.joints[1], color: LEATHER, group: `arm${side}`, name: `bracer${side}` });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), SKIN_LIGHT, {
      bone: chain.joints[2],
      at: wrist,
      group: `arm${side}`,
      name: `hand${side}`,
    });
    b.part(new THREE.TorusGeometry(0.075, 0.008, 5, 8), METAL, {
      bone: chain.joints[1],
      at: [s * 0.50, 1.56, 0.48],
      rotation: [0, 90, 20 * s],
      group: `arm${side}`,
      name: `bracerRivet${side}`,
    });
  }

  // Face: low-poly skull, separate lower jaw, eyes, nose and pointed ears.
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, {
    bone: head,
    at: [0, 2.04, 0.43],
    scale: [0.145, 0.17, 0.14],
    group: "head",
    name: "skull",
  });
  b.capsule(jaw.at, jaw.local([0, 0.25, 0]), [0.105, 0.072], { bone: jaw, color: SKIN_LIGHT, group: "head", name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(1, 10, 7), HAIR, {
    bone: head,
    at: [0, 2.10, 0.39],
    scale: [0.15, 0.11, 0.14],
    group: "hair",
    name: "hairCap",
  });
  for (const s of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(0.029, 8, 6), EYE, {
      bone: head,
      at: [s * 0.075, 2.04, 0.558],
      group: "head",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), INK, {
      bone: head,
      at: [s * 0.075, 2.04, 0.586],
      group: "head",
      name: `pupil${s > 0 ? "L" : "R"}`,
    });
    b.spike([s * 0.12, 2.13, 0.42], [s * 0.42, 0.48, -0.08], 0.10, 0.035, {
      bone: head,
      color: HAIR,
      group: "head",
      name: `ear${s > 0 ? "L" : "R"}`,
    });
  }
  b.spike([0, 2.00, 0.56], [0, -0.08, 1], 0.095, 0.035, {
    bone: head,
    color: SKIN_LIGHT,
    group: "head",
    name: "nose",
  });
  b.rod([-0.06, 1.95, 0.56], [0.06, 1.95, 0.56], 0.008, {
    bone: jaw,
    color: INK,
    group: "head",
    name: "mouthLine",
  });

  // Braids are made of short linked tubes with gold ties; beard and moustache frame the jaw.
  for (const [i, braid] of braids.entries()) {
    b.sweep(braid, [0.034, 0.021], { color: HAIR, sides: 6, group: "hair", name: `braid${i === 0 ? "L" : "R"}` });
    for (const t of [0.18, 0.42, 0.66, 0.86])
      b.part(new THREE.SphereGeometry(0.037, 6, 5), METAL, {
        bone: braid.joints[Math.min(braid.joints.length - 1, Math.floor(t * braid.joints.length))],
        at: braid.at(t),
        group: "hair",
        name: "braidTie",
      });
  }
  b.sweep(beard, (t) => 0.065 - 0.052 * t, { color: HAIR, caps: "point", sides: 7, group: "hair", name: "beard" });
  for (const s of [1, -1] as const) {
    b.sweep(catmull([head.local([0, -0.02, 0.15]), head.local([s * 0.105, -0.03, 0.17]), head.local([s * 0.14, -0.07, 0.13])]), [0.025, 0.008], {
      bone: head,
      color: HAIR_LIGHT,
      caps: "point",
      group: "hair",
      name: "moustache",
    });
  }

  // Recurve bow held across the front, with a taut string and leather grip.
  const lowerTip: V3 = [0.56, 1.39, 0.72];
  const upperTip: V3 = [-0.56, 1.89, 0.72];
  const bowPath = catmull([lowerTip, [0.42, 1.49, 0.62], [0.09, 1.65, 0.78], [-0.30, 1.78, 0.64], upperTip]);
  b.sweep(bowPath, [0.022, 0.012], { color: BOW_WOOD, sides: 6, group: "bow", name: "recurveBow" });
  b.rod(lowerTip, upperTip, 0.006, { color: IVORY, group: "bow", name: "bowString" });
  b.capsule([0.02, 1.63, 0.77], [0.10, 1.68, 0.77], [0.035, 0.032], { color: LEATHER_LIGHT, group: "bow", name: "bowGrip" });
  b.spike(lowerTip, [0.2, -0.1, 0], 0.075, 0.014, { color: BOW_LIGHT, group: "bow", name: "lowerNock" });
  b.spike(upperTip, [-0.2, 0.1, 0], 0.075, 0.014, { color: BOW_LIGHT, group: "bow", name: "upperNock" });

  // Diagonal leather quiver over the back, with five readable arrow shafts and heads.
  const quiverBase: V3 = [0.30, 1.45, -0.34];
  const quiverTop: V3 = [0.52, 1.91, -0.28];
  b.capsule(quiverBase, quiverTop, [0.075, 0.055], { bone: torso.joints[1], color: LEATHER, group: "quiver", name: "quiverBody" });
  b.ring(line(quiverBase, quiverTop), { count: 2, radius: 0.078 }, (item) =>
    b.sweep(catmull([item.moved([0, -0.02, 0]), item.moved([0, 0.02, 0])]), 0.012, { color: METAL, group: "quiver", name: "quiverBand" }),
  );
  for (let i = 0; i < 5; i++) {
    const base: V3 = [0.43 + (i - 2) * 0.025, 1.79 + (i % 2) * 0.018, -0.27 + (i - 2) * 0.012];
    const tip: V3 = [base[0] + (i - 2) * 0.012, 2.20 + (i % 3) * 0.018, base[2] + 0.03];
    b.rod(base, tip, 0.007, { bone: torso.joints[1], color: BOW_WOOD, group: "quiver", name: "arrowShaft" });
    b.spike(tip, [0, 1, 0.04], 0.075, 0.018, { bone: torso.joints[1], color: IVORY, group: "quiver", name: "arrowHead" });
    b.spike(base, [0, -1, 0], 0.055, 0.018, { bone: torso.joints[1], color: HAIR_LIGHT, group: "quiver", name: "arrowFletching" });
  }

  return b.root;
}
