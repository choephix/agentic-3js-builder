import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { limb } from "../src/ik";

export const meta = {
  name: "Bull Moose",
  description: "A broad, dark-coated bull moose with palmate antlers, a hanging dewlap, long legs and cloven hooves.",
  builtBy: "GPT-6 Astra",
};

const COAT = "#3d2a20";
const COAT_LIGHT = "#5b3d2b";
const COAT_WARM = "#704c32";
const LEG = "#806147";
const LEG_LIGHT = "#a28768";
const ANTLER = "#86664a";
const ANTLER_LIGHT = "#b3946d";
const MUZZLE = "#5d493c";
const NOSE = "#211b18";
const MOUTH = "#2d1717";
const HOOF = "#28211e";
const EYE = "#120f0e";
const GLINT = "#ead9b5";
const EAR_IN = "#9b735d";
const DEWLAP = "#73523c";

const lowSphere = (radius: number) => new THREE.SphereGeometry(radius, 8, 5);

export default function build() {
  const b = createBuilder({ name: "moose", detail: 1 });

  // Skeleton first: one spine, a short neck, a hinged jaw, four named leg chains,
  // a small tail chain, and two antler fans.
  const hips = b.joint("hips", { at: [0, 1.46, -0.35], dir: [0, 0.05, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.49, -0.78],
      [0, 1.51, -0.42],
      [0, 1.63, -0.05],
      [0, 1.78, 0.27],
      [0, 1.82, 0.47],
    ]),
    { parent: hips, count: 5, names: ["spineRump", "spine1", "spine2", "spine3", "spineShoulder"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.at(1),
      [0, 1.92, 0.55],
      [0, 2.09, 0.63],
      [0, 2.2, 0.72],
    ]),
    { parent: spine.joints[spine.joints.length - 1], count: 4, names: ["neckBase", "neckMid", "neckHigh", "poll"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 2.2, 0.73], dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.12, 0.99], dir: [0, -0.22, 1], role: "jaw" });
  const lowerJaw = b.joint("lowerJaw", { parent: jaw, at: [0, 2.06, 1.01], dir: [0, -0.2, 1], role: "jaw" });

  const hindL = limb([0.38, 1.48, -0.48], [0.42, 0.088, -0.62], [0.55, 0.56, 0.42], [[0, 0, 1], [0, 0, -1]]);
  const hindR = limb([-0.38, 1.48, -0.48], [-0.42, 0.088, -0.62], [0.55, 0.56, 0.42], [[0, 0, 1], [0, 0, -1]]);
  const foreL = limb([0.38, 1.77, 0.34], [0.42, 0.088, 0.42], [0.58, 0.56, 0.43], [[0, 0, 1], [0, 0, -1]]);
  const foreR = limb([-0.38, 1.77, 0.34], [-0.42, 0.088, 0.42], [0.58, 0.56, 0.43], [[0, 0, 1], [0, 0, -1]]);
  const hindChainL = b.chain("hindLegL", hindL, { parent: spine.joints[1], names: ["hipL", "kneeL", "hockL"], role: "leg", contact: [0.42, 0, -0.62] });
  const hindChainR = b.chain("hindLegR", hindR, { parent: spine.joints[1], names: ["hipR", "kneeR", "hockR"], role: "leg", contact: [-0.42, 0, -0.62] });
  const foreChainL = b.chain("foreLegL", foreL, { parent: spine.joints[spine.joints.length - 1], names: ["shoulderL", "elbowL", "wristL"], role: "leg", contact: [0.42, 0, 0.42] });
  const foreChainR = b.chain("foreLegR", foreR, { parent: spine.joints[spine.joints.length - 1], names: ["shoulderR", "elbowR", "wristR"], role: "leg", contact: [-0.42, 0, 0.42] });

  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 1.52, -0.82], dir: [0, 0, -1], role: "tail" });
  const tailTip = b.joint("tailTip", { parent: tailBase, at: [0, 1.52, -1.05], dir: [0, 0.15, -1], role: "tail" });

  const antlerL = b.chain(
    "antlerL",
    catmull([
      [0.18, 2.31, 0.68],
      [0.37, 2.48, 0.65],
      [0.58, 2.68, 0.61],
      [0.79, 2.76, 0.58],
    ]),
    { parent: head, count: 4, names: ["antlerRootL", "antlerRiseL", "antlerPalmL", "antlerTipL"], role: "fan" },
  );
  const antlerR = b.chain(
    "antlerR",
    catmull([
      [-0.18, 2.31, 0.68],
      [-0.37, 2.48, 0.65],
      [-0.58, 2.68, 0.61],
      [-0.79, 2.76, 0.58],
    ]),
    { parent: head, count: 4, names: ["antlerRootR", "antlerRiseR", "antlerPalmR", "antlerTipR"], role: "fan" },
  );

  // Main hide: faceted barrels keep the puppet-like construction readable.
  const bodyPath = catmull([
    [0, 1.5, -0.84],
    [0, 1.54, -0.43],
    [0, 1.64, -0.05],
    [0, 1.78, 0.28],
    [0, 1.8, 0.5],
  ]);
  b.sweep(bodyPath, (t) => [0.43 + 0.11 * Math.sin(t * Math.PI), 0.38 + 0.1 * Math.sin(t * Math.PI)], {
    bone: [hips, ...spine.joints],
    section: { ngon: 8 },
    color: COAT,
    sectors: [[120, 240, COAT_LIGHT]],
    caps: "round",
    name: "barrelBody",
  });
  b.sweep(spine, [0.38, 0.3], { bone: spine, color: COAT_WARM, section: { ngon: 8 }, caps: "round", name: "shoulderHump" });
  b.sweep(neck, (t) => [0.3 - 0.08 * t, 0.27 - 0.07 * t], {
    bone: neck,
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "thickNeck",
  });

  // Long muzzle, with the upper and lower jaw on different bones and a visible mouth seam.
  b.sweep(catmull([[0, 2.2, 0.76], [0, 2.19, 1.02], [0, 2.12, 1.3]]), [0.23, 0.16], {
    bone: head,
    color: MUZZLE,
    section: { ngon: 8 },
    caps: "round",
    name: "upperMuzzle",
  });
  b.sweep(catmull([[0, 2.08, 1.0], [0, 2.04, 1.2], [0, 2.0, 1.31]]), [0.18, 0.11], {
    bone: lowerJaw,
    color: MUZZLE,
    section: { ngon: 8 },
    caps: "round",
    name: "lowerMuzzle",
  });
  b.rod([0, 2.08, 1.305], [0, 2.01, 1.31], 0.014, { color: MOUTH, name: "mouthLine" });
  b.part(lowSphere(0.16), NOSE, { at: [0, 2.1, 1.39], bone: lowerJaw, scale: [1.2, 0.75, 0.7], name: "nosePad" });
  for (const s of [1, -1]) {
    b.part(lowSphere(0.035), NOSE, { at: [s * 0.12, 2.13, 1.49], bone: lowerJaw, name: `nostril${s > 0 ? "L" : "R"}` });
  }

  // The bell is deliberately a separate hanging volume, not a filler sphere.
  b.sweep(catmull([[0, 1.89, 0.56], [0, 1.72, 0.64], [0, 1.48, 0.67], [0, 1.34, 0.68]]), [0.21, 0.07], {
    bone: [neck.joints[0], neck.joints[1], neck.joints[2]],
    color: DEWLAP,
    section: { ngon: 7 },
    caps: "round",
    name: "throatDewlap",
  });

  // Four long, slightly bent legs and the paired cloven hoof blocks.
  const legChains = [hindChainL, hindChainR, foreChainL, foreChainR];
  for (const leg of legChains) {
    b.sweep(leg, [0.115, 0.085], { bone: leg, color: LEG, section: { ngon: 6 }, caps: "round", name: `${leg.name}Shin` });
    const foot = leg.at(1);
    for (const s of [1, -1]) {
      const toe = [foot.at.x + s * 0.055, 0.073, foot.at.z + 0.07] as [number, number, number];
      b.frustumBox(foot.at, toe, [0.06, 0.09], [0.045, 0.075], { bone: foot.bone, color: HOOF, name: `${leg.name}Cloven${s > 0 ? "L" : "R"}` });
    }
    b.rod(leg.at(0.82), leg.at(0.98), 0.095, { bone: leg.at(0.82).bone, color: LEG_LIGHT, name: `${leg.name}PaleCannon` });
  }

  // Ears, set high and broad like a moose's shovel-shaped ears.
  const earOutline: [number, number][] = [[0, 0], [0.16, 0.03], [0.28, 0.15], [0.2, 0.3], [0.06, 0.24]];
  const earInner: [number, number][] = [[0.02, 0.03], [0.14, 0.07], [0.22, 0.15], [0.15, 0.24], [0.06, 0.2]];
  for (const s of [1, -1]) {
    b.extrude(earOutline, { at: [s * 0.23, 2.37, 0.65] as [number, number, number], x: [s, 0, 0] as [number, number, number], y: [0, 1, 0], thickness: 0.065, bevel: 0.012, smoothing: 1, color: COAT_WARM, bone: head, name: `ear${s > 0 ? "L" : "R"}` });
    b.extrude(earInner, { at: [s * 0.235, 2.375, 0.685] as [number, number, number], x: [s, 0, 0] as [number, number, number], y: [0, 1, 0], thickness: 0.07, bevel: 0.008, smoothing: 1, color: EAR_IN, bone: head, name: `earInner${s > 0 ? "L" : "R"}` });
  }

  // Eyes and tiny catchlights make the long head readable in the front and three-quarter views.
  for (const s of [1, -1]) {
    const eyeAt = [s * 0.205, 2.29, 0.96] as [number, number, number];
    b.part(lowSphere(0.055), EYE, { at: eyeAt, bone: head, scale: [1, 1, 0.55], name: `eye${s > 0 ? "L" : "R"}` });
    b.part(lowSphere(0.015), GLINT, { at: [s * 0.218, 2.31, 1.0] as [number, number, number], bone: head, name: `eyeGlint${s > 0 ? "L" : "R"}` });
  }

  // A short tail droops from the rump.
  b.sweep(catmull([[0, 1.53, -0.78], [0, 1.48, -0.98], [0, 1.4, -1.1]]), [0.1, 0.035], {
    bone: [tailBase, tailTip],
    color: COAT,
    section: { ngon: 7 },
    caps: "point",
    name: "stubbyTail",
  });

  // Broad paddles and upward tines: each side has a single connected main beam plus three separate points.
  for (const s of [1, -1]) {
    const palm = [s * 0.68, 2.68, 0.58] as [number, number, number];
    b.extrude(
      [[0, 0], [0.12, 0.04], [0.28, 0.18], [0.3, 0.38], [0.2, 0.52], [0.05, 0.47], [0, 0.24]],
      { at: palm, x: [s, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.016, smoothing: 1, color: ANTLER, bone: s > 0 ? antlerL.joints[2] : antlerR.joints[2], name: `antlerPalm${s > 0 ? "L" : "R"}` },
    );
    b.sweep(s > 0 ? antlerL : antlerR, [0.075, 0.035], { bone: s > 0 ? antlerL : antlerR, section: { ngon: 6 }, color: ANTLER_LIGHT, caps: "round", name: `antlerBeam${s > 0 ? "L" : "R"}` });
    const bases = [
      [s * 0.48, 2.62, 0.61],
      [s * 0.68, 2.75, 0.58],
      [s * 0.83, 2.78, 0.57],
    ] as [number, number, number][];
    const tips = [
      [s * 0.42, 3.08, 0.61],
      [s * 0.7, 3.2, 0.58],
      [s * 0.93, 3.08, 0.56],
    ] as [number, number, number][];
    for (let i = 0; i < bases.length; i++) {
      b.spike(bases[i], tips[i], null, 0.045, { bone: s > 0 ? antlerL.joints[Math.min(i + 1, 3)] : antlerR.joints[Math.min(i + 1, 3)], color: ANTLER_LIGHT, name: `antlerTine${s > 0 ? "L" : "R"}${i + 1}` });
    }
  }

  return b.root;
}
