import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { cellPaint, pixelArt, stepped } from "../kits/pixel";

const TEXEL = 0.018;
const FUR_RAMP = ["#252832", "#3b3e49", "#545763", "#737681", "#96979b"];
const FUR = cellPaint(TEXEL, (c) => c.pick(FUR_RAMP, 0.42 + c.n.y * 0.18 + (c.random(8) - 0.5) * 0.12), { dither: true });
const FUR_DARK = cellPaint(TEXEL, (c) => c.pick(["#191b22", "#282b35", "#3b3e49"], 0.35 + c.n.y * 0.2), { dither: true });
const MUZZLE = cellPaint(TEXEL, (c) => c.pick(["#a9a5a0", "#c1bbb4", "#d2c9c0"], 0.5 + c.n.y * 0.18), { dither: true });
const WOOD = cellPaint(TEXEL, (c) => c.pick(["#3b2117", "#5a3020", "#75432a", "#925d36", "#b07a4b"], 0.35 + c.n.y * 0.28 + (c.random(4) - 0.5) * 0.16), { dither: true });
const WOOD_DARK = "#2a1814";
const LEAF = ["#294b27", "#3d6b31", "#59883a", "#78a54b"];
const CLAW = "#d6c6ab";
const EYE_TEX = pixelArt([
  "kkkkkk",
  "kwwwwk",
  "kwggwk",
  "kwgbwk",
  "kwwwwk",
  "kkkkkk",
], { k: "#171820", w: "#e5e8dd", g: "#657078", b: "#0d1017" });
const NOSE_TEX = pixelArt([
  "..kk..",
  ".kkkk.",
  "kkkkkk",
  "kkkkkk",
  ".kkkk.",
  "..kk..",
], { k: "#17171c" });
const LEAF_SHAPE = stepped(
  [[0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [2, 4], [1, 3]],
  TEXEL,
  { rows: true },
);

export const meta = {
  name: "Pixel Koala on Eucalyptus",
  description: "A chunky pixel-art koala clings to a leafy eucalyptus branch stand.",
  style: "pixel art",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "koala", detail: 1, paintSize: 1024 });
  const root = b.joint("hips", { at: [0, 1.04, 0.12], role: "spine" });

  // The stand is built first so the animal's hands and feet can be placed around it.
  const trunk = b.sweep(catmull([[0, 0, -0.08], [0, 0.42, -0.06], [0, 0.8, 0.02], [0, 1.03, 0.12]]), [0.085, 0.07], {
    color: WOOD,
    section: { ngon: 6 },
    caps: "flat",
    name: "standTrunk",
    group: "stand",
  });
  const branch = b.sweep(catmull([[-0.62, 0.89, 0.1], [-0.34, 0.91, 0.12], [0, 0.93, 0.14], [0.36, 0.91, 0.13], [0.68, 0.86, 0.08]]), [0.066, 0.045], {
    color: WOOD,
    section: { ngon: 6 },
    caps: "round",
    name: "grippingBranch",
    group: "stand",
  });
  for (const s of [-1, 1]) {
    b.sweep(catmull([[s * 0.36, 0.91, 0.13], [s * 0.5, 1.08, 0.18], [s * 0.62, 1.2, 0.22]]), [0.035, 0.018], {
      color: WOOD,
      section: { ngon: 5 },
      caps: "round",
      name: `twig${s > 0 ? "L" : "R"}`,
      group: "stand",
    });
  }
  // Pixel-cut leaves and their dark blocky veins dress every twig.
  const leaves = [
    [0.53, 1.16, 0.2, 0.15, 24], [0.64, 1.27, 0.22, 0.16, -18], [0.4, 1.25, 0.18, 0.14, 42],
    [-0.53, 1.14, 0.2, 0.15, -28], [-0.66, 1.25, 0.22, 0.16, 18], [-0.4, 1.24, 0.18, 0.14, -42],
    [0.77, 0.92, 0.18, 0.12, -4], [-0.78, 0.93, 0.18, 0.12, 6],
  ] as const;
  leaves.forEach(([x, y, w, h, rot], i) => {
    b.rod([x, y - 0.09, 0.175], [x, y, 0.175], 0.007, {
      color: WOOD_DARK,
      name: `leafStem${i}`,
      group: "foliage",
    });
    const leaf = b.extrude(LEAF_SHAPE, {
      at: [x, y, 0.18],
      x: [Math.cos(rot * Math.PI / 180), 0, Math.sin(rot * Math.PI / 180)],
      y: [0, 1, 0],
      thickness: 0.012,
      color: LEAF[i % LEAF.length],
      bevel: 0,
      name: `leaf${i}`,
      group: "foliage",
    });
    b.rod(leaf.local([0.01, h * 0.35, 0.012]), leaf.local([w * 0.65, h * 0.65, 0.012]), 0.006, {
      color: WOOD_DARK,
      name: `leafVein${i}`,
      group: "foliage",
    });
  });

  const spine = b.chain("spine", catmull([[0, 1.04, 0.12], [0, 1.18, 0.13], [0, 1.34, 0.16]]), {
    parent: root,
    names: ["spine", "chest", "neckBase"],
    role: "spine",
  });
  const body = b.sweep(spine, (t) => 0.22 - t * 0.035, {
    color: FUR,
    section: { ngon: 8 },
    group: "body",
    name: "roundBody",
  });
  b.sweep(catmull([[0, 1.08, 0.13], [0, 1.19, 0.17], [0, 1.31, 0.18]]), [0.18, 0.145], {
    color: FUR_DARK,
    bone: spine.joints[0],
    section: { ngon: 6 },
    caps: "flat",
    group: "belly",
    name: "bellyPatch",
  });

  const head = b.joint("head", { parent: spine.joints[spine.joints.length - 1], at: [0, 1.49, 0.2], dir: [0, 0.03, 1], role: "head", group: "head" });
  b.part(new THREE.SphereGeometry(1, 10, 7), FUR, {
    bone: head,
    at: head.at,
    scale: [0.255, 0.25, 0.23],
    flat: true,
    name: "headMass",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.1, -0.08]), dir: [0, 0.7, -0.2], role: "jaw", group: "head" });
  b.sweep(catmull([jaw.at, head.local([0, 0.17, -0.09]), head.local([0, 0.24, -0.05])]), [0.105, 0.055], {
    color: MUZZLE,
    bone: jaw,
    section: { ngon: 6 },
    caps: "round",
    group: "face",
    name: "lowerJaw",
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 5), MUZZLE, {
    bone: head,
    at: head.local([0, 0.16, -0.01]),
    scale: [0.12, 0.1, 0.08],
    flat: true,
    name: "muzzle",
    group: "face",
  });
  b.part(new THREE.BoxGeometry(0.085, 0.068, 0.012), "#ffffff", {
    texture: NOSE_TEX,
    bone: head,
    at: head.local([0, 0.238, 0.005]),
    dir: head.local([0, 1, 0]),
    axis: "z",
    name: "nosePixel",
    group: "face",
  });
  for (const s of [-1, 1]) {
    const ear = b.extrude(LEAF_SHAPE, {
      at: head.local([s * 0.18, -0.015, 0.08]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: FUR_DARK,
      name: `ear${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 5), "#b4a59f", ear.moved([0, 0, 0.024]), {
      embed: 0.1,
      name: `earInner${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    const eye = head.local([s * 0.095, 0.145, 0.065]);
    b.part(new THREE.BoxGeometry(0.052, 0.052, 0.014), "#ffffff", {
      texture: EYE_TEX,
      bone: head,
      at: eye,
      dir: head.local([0, 1, 0]),
      axis: "z",
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }
  // A few square fur tufts break up the otherwise round silhouette.
  for (const s of [-1, 1]) {
    b.spike(head.local([s * 0.2, -0.01, 0.11]), head.local([s * 0.24, -0.015, 0.2]), 0.085, 0.025, {
      color: FUR_DARK,
      bone: head,
      group: "head",
      name: `earTuft${s > 0 ? "L" : "R"}`,
    });
  }

  const shoulderPts = [
    { s: 1, target: [0.25, 0.91, 0.16] as [number, number, number], side: "L" },
    { s: -1, target: [-0.25, 0.91, 0.16] as [number, number, number], side: "R" },
  ];
  for (const arm of shoulderPts) {
    const shoulder = [arm.s * 0.19, 1.31, 0.18] as [number, number, number];
    const points = limb(shoulder, arm.target, [0.2, 0.17, 0.14], [[0, -0.2, 1], [0, 0.3, 1]], { sole: [0, 0, 1] });
    const chain = b.chain(`arm${arm.side}`, points, {
      parent: spine.joints[1],
      names: [`shoulder${arm.side}`, `elbow${arm.side}`, `wrist${arm.side}`, `palm${arm.side}`],
      role: "arm",
      contact: arm.target,
    });
    b.sweep(chain, [0.062, 0.045], { color: FUR, section: { ngon: 6 }, group: "arms", name: `armTube${arm.side}` });
    const paw = b.part(new THREE.SphereGeometry(1, 7, 5), FUR_DARK, {
      bone: chain.joints[chain.joints.length - 1],
      at: chain.joints[chain.joints.length - 1].at,
      scale: [0.075, 0.055, 0.065],
      flat: true,
      name: `paw${arm.side}`,
      group: "arms",
    });
    for (let i = 0; i < 3; i++) {
      const p0 = [arm.s * (0.22 + i * 0.022), 0.9, 0.2 + i * 0.01] as [number, number, number];
      const p1 = [arm.s * (0.22 + i * 0.025), 0.88, 0.11 - i * 0.015] as [number, number, number];
      const finger = b.chain(`finger${arm.side}${i}`, [chain.joints[chain.joints.length - 1].at, p0, p1], {
        parent: chain.joints[chain.joints.length - 1],
        names: [`finger${arm.side}${i}Base`, `finger${arm.side}${i}Tip`],
        role: "digit",
      });
      b.sweep(finger, [0.018, 0.006], { color: FUR_DARK, section: { ngon: 5 }, caps: "round", group: "digits" });
      b.spike(finger.joints[finger.joints.length - 1].at, finger.joints[finger.joints.length - 1], 0.032, 0.009, { color: CLAW, group: "digits", name: `clawHand${arm.side}${i}` });
    }
    void paw;
  }

  const hipPts = [
    { s: 1, target: [0.22, 0.86, 0.04] as [number, number, number], side: "L" },
    { s: -1, target: [-0.22, 0.86, 0.04] as [number, number, number], side: "R" },
  ];
  for (const leg of hipPts) {
    const hip = [leg.s * 0.16, 1.05, 0.08] as [number, number, number];
    const points = limb(hip, leg.target, [0.2, 0.18, 0.13], [[0, 0.4, 1], [0, -0.3, 1]], { sole: [0, 0, 1] });
    const chain = b.chain(`leg${leg.side}`, points, {
      parent: root,
      names: [`hip${leg.side}`, `knee${leg.side}`, `ankle${leg.side}`, `foot${leg.side}`],
      role: "leg",
      contact: leg.target,
    });
    b.sweep(chain, [0.075, 0.05], { color: FUR_DARK, section: { ngon: 6 }, group: "legs", name: `legTube${leg.side}` });
    for (let i = 0; i < 3; i++) {
      const toe = [leg.s * (0.19 + i * 0.026), 0.865, 0.12 + i * 0.02] as [number, number, number];
      const toeChain = b.chain(`toe${leg.side}${i}`, [chain.joints[chain.joints.length - 1].at, toe], {
        parent: chain.joints[chain.joints.length - 1],
        role: "digit",
      });
      b.sweep(toeChain, [0.018, 0.006], { color: FUR_DARK, section: { ngon: 5 }, caps: "round", group: "digits" });
      b.spike(toeChain.joints[toeChain.joints.length - 1].at, toeChain.joints[toeChain.joints.length - 1], 0.03, 0.009, { color: CLAW, group: "digits", name: `clawFoot${leg.side}${i}` });
    }
  }

  // Pixel flecks on the belly and bark are individual readable blocks.
  const bellyHits = b.surface(body).scatter(18, { rng: rng(11), minDist: 0.055, filter: (h) => h.n.z > 0.2 && h.n.y < 0.3 });
  for (const [i, hit] of bellyHits.entries()) {
    b.stick(new THREE.BoxGeometry(0.024, 0.024, 0.008), i % 3 === 0 ? "#b8b1a9" : "#8f8e90", hit, {
      embed: 0.35,
      group: "furFlecks",
      name: `bellyFleck${i}`,
    });
  }
  void trunk;
  void branch;
  void muzzle;
  return b.root;
}
