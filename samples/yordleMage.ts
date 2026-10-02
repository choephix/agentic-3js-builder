import * as THREE from "three";
import { createBuilder } from "../src/builder";

import { catmull } from "../src/path";
import { rng } from "../src/math";
import { glow } from "../kits/glow";

export const meta = {
  name: "Yordle Mage",
  description: "A small furry rune mage with a towering crystal staff, layered robes, and bright arcane eyes.",
  style: "League of Legends",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "yordleMage", detail: 1 });
  const random = rng(91337);

  const FUR = "#7650a8";
  const FUR_LIGHT = "#a479d0";
  const FUR_DARK = "#3a245f";
  const ROBE = "#293c91";
  const ROBE_DARK = "#18245d";
  const GOLD = "#e4ad42";
  const GOLD_DARK = "#986329";
  const SKIN = "#d69778";
  const DARK = "#17132a";
  const EYE = "#ffe483";
  const CYAN = "#58e5ff";
  const MAGENTA = "#ee5cc8";
  const WOOD = "#704229";
  const WOOD_LIGHT = "#ad7040";
  const CRYSTAL = "#80f3ff";
  const CLOTH = "#d54d87";

  const CREAM = "#f2dfbd";

  // Skeleton: compact humanoid proportions, with a relaxed readable rest pose.
  const hips = b.joint("hips", { at: [0, 0.53, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.53, 0], [0, 0.68, 0], [0, 0.81, 0]]), {
    parent: hips,
    names: ["spine1", "chest", "spineTip"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.81, 0], [0, 0.91, 0]], {
    parent: spine.tip!,
    names: ["neck", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 0.99, 0.015], dir: [0, 0.02, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.95, 0.09], aim: [0, 0.93, 0.23], role: "jaw", group: "head" });

  const armL = b.chain("armL", [[0.19, 0.76, 0], [0.32, 0.64, 0.015], [0.45, 0.52, 0.035]], {
    parent: spine.tip!,
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", [[-0.19, 0.76, 0], [-0.33, 0.65, 0.02], [-0.45, 0.55, 0.03]], {
    parent: spine.tip!,
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
  });
  const legL = b.chain("legL", [[0.12, 0.45, 0], [0.15, 0.24, 0.01], [0.15, 0.09, 0.06], [0.15, 0.075, 0.14]], {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
  });
  const legR = b.chain("legR", [[-0.12, 0.45, 0], [-0.15, 0.24, 0.01], [-0.15, 0.09, 0.06], [-0.15, 0.075, 0.14]], {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
  });

  // Main furry body and robe silhouette.
  b.sweep(spine, (t) => 0.17 + 0.045 * (1 - t), {
    color: (t) => (t < 0.45 ? FUR : FUR_LIGHT),
    section: { ngon: 8 },
    caps: "round",
    name: "furryTorso",
    group: "body",
  });
  b.part(new THREE.ConeGeometry(0.31, 0.39, 8), ROBE, { bone: hips, at: [0, 0.40, 0], name: "robeSkirt", group: "body", flat: true });
  b.part(new THREE.ConeGeometry(0.28, 0.22, 8), ROBE_DARK, { bone: hips, at: [0, 0.54, 0], name: "robeUpper", group: "body", flat: true });
  b.part(new THREE.TorusGeometry(0.245, 0.025, 5, 12), GOLD_DARK, { bone: hips, at: [0, 0.585, 0], rotation: [90, 0, 0], name: "waistBand", group: "body", flat: true });
  b.part(new THREE.TorusGeometry(0.255, 0.012, 5, 12), GOLD, { bone: hips, at: [0, 0.61, 0], rotation: [90, 0, 0], name: "waistTrim", group: "body", flat: true });

  // Sleeves, legs and oversized mitts.
  b.sweep(armL, (t) => 0.085 - t * 0.025, { color: ROBE, section: { ngon: 7 }, name: "sleeveL", group: "arms" });
  b.sweep(armR, (t) => 0.085 - t * 0.025, { color: ROBE, section: { ngon: 7 }, name: "sleeveR", group: "arms" });
  b.sweep(legL, (t) => 0.095 - t * 0.025, { color: FUR_DARK, section: { ngon: 7 }, name: "legL", group: "legs" });
  b.sweep(legR, (t) => 0.095 - t * 0.025, { color: FUR_DARK, section: { ngon: 7 }, name: "legR", group: "legs" });
  b.part(new THREE.SphereGeometry(0.105, 8, 5), FUR_LIGHT, { bone: armL.tip!, at: armL.tip!.at, name: "mittenL", group: "arms", flat: true });
  b.part(new THREE.SphereGeometry(0.11, 8, 5), FUR_LIGHT, { bone: armR.tip!, at: armR.tip!.at, name: "mittenR", group: "arms", flat: true });
  b.part(new THREE.TorusGeometry(0.088, 0.012, 5, 10), GOLD, { bone: armL.joints[1], at: armL.joints[1].at, dir: armL.joints[1].axis, name: "cuffL", group: "arms", flat: true });
  b.part(new THREE.TorusGeometry(0.088, 0.012, 5, 10), GOLD, { bone: armR.joints[1], at: armR.joints[1].at, dir: armR.joints[1].axis, name: "cuffR", group: "arms", flat: true });
  b.part(new THREE.SphereGeometry(0.105, 8, 5), FUR, { bone: legL.tip!, at: legL.tip!.at, name: "bootL", group: "legs", flat: true });
  b.part(new THREE.SphereGeometry(0.105, 8, 5), FUR, { bone: legR.tip!, at: legR.tip!.at, name: "bootR", group: "legs", flat: true });
  b.part(new THREE.SphereGeometry(0.13, 8, 5), ROBE_DARK, { bone: legL.tip!, at: [0.15, 0.06, 0.145], scale: [1.1, 0.65, 1.45], name: "shoeL", group: "legs", flat: true });
  b.part(new THREE.SphereGeometry(0.13, 8, 5), ROBE_DARK, { bone: legR.tip!, at: [-0.15, 0.06, 0.145], scale: [1.1, 0.65, 1.45], name: "shoeR", group: "legs", flat: true });
  b.part(new THREE.TorusGeometry(0.102, 0.012, 5, 10), GOLD_DARK, { bone: legL.joints[1], at: legL.joints[1].at, dir: legL.joints[1].axis, name: "kneeBandL", group: "legs", flat: true });
  b.part(new THREE.TorusGeometry(0.102, 0.012, 5, 10), GOLD_DARK, { bone: legR.joints[1], at: legR.joints[1].at, dir: legR.joints[1].axis, name: "kneeBandR", group: "legs", flat: true });

  // Head, muzzle, cheeks and enormous expressive ears.
  b.part(new THREE.SphereGeometry(0.285, 10, 7), FUR, { bone: head, at: head.at, scale: [1.0, 1.03, 0.92], name: "skull", group: "head", flat: true });
  b.part(new THREE.SphereGeometry(0.17, 8, 5), FUR_LIGHT, { bone: jaw, at: [0, 0.94, 0.16], scale: [1.05, 0.68, 0.92], name: "muzzle", group: "head", flat: true });
  b.part(new THREE.SphereGeometry(0.085, 8, 5), SKIN, { bone: jaw, at: [0, 0.96, 0.245], scale: [1.0, 0.62, 0.72], name: "nose", group: "head", flat: true });
  b.part(new THREE.BoxGeometry(0.16, 0.018, 0.012), DARK, { bone: jaw, at: [0, 0.885, 0.245], name: "mouthLine", group: "head" });
  b.part(new THREE.ConeGeometry(0.018, 0.045, 5), CREAM, { bone: jaw, at: [0.065, 0.895, 0.258], rotation: [180, 0, 0], name: "toothL", group: "head", flat: true });
  b.part(new THREE.ConeGeometry(0.018, 0.045, 5), CREAM, { bone: jaw, at: [-0.065, 0.895, 0.258], rotation: [180, 0, 0], name: "toothR", group: "head", flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.065, 8, 6), DARK, { bone: head, at: [s * 0.115, 1.045, 0.238], scale: [1.0, 1.15, 0.52], name: `eyeSocket${s > 0 ? "L" : "R"}`, group: "head", flat: true });
    glow(b.part(new THREE.SphereGeometry(0.045, 8, 5), EYE, { bone: head, at: [s * 0.115, 1.045, 0.264], scale: [1.0, 1.2, 0.42], name: `eyeGlow${s > 0 ? "L" : "R"}`, group: "head", flat: true }), 1.8);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, { bone: head, at: [s * 0.115, 1.045, 0.285], name: `pupil${s > 0 ? "L" : "R"}`, group: "head", flat: true });
    b.spike(head.local([s * 0.13, 0.09, 0.26]), head.local([s * 0.16, 0.15, 0.3]), 0.075, 0.014, { color: FUR_DARK, name: `brow${s > 0 ? "L" : "R"}`, group: "head" });
    b.spike(head.local([s * 0.235, 0.02, 0.02]), [s * 0.18, 0.02, 0.02], 0.18, 0.026, { color: FUR_LIGHT, bone: head, name: `ear${s > 0 ? "L" : "R"}`, group: "head" });
    b.part(new THREE.ConeGeometry(0.105, 0.03, 6), MAGENTA, { bone: head, at: [s * 0.32, 1.0, 0.02], dir: [s * 0.8, 0.2, 0], name: `earInner${s > 0 ? "L" : "R"}`, group: "head", flat: true });
  }

  // Tufted fur silhouette and shoulder ruff.
  const tufts: Array<[number, number, number, number, number, number]> = [
    [-0.22, 0.87, 0.02, -0.5, 0.25, 0.05], [0.22, 0.87, 0.02, 0.5, 0.25, 0.05],
    [-0.20, 0.76, 0.03, -0.45, 0.3, 0.08], [0.20, 0.76, 0.03, 0.45, 0.3, 0.08],
    [-0.14, 1.20, 0.02, -0.2, 0.4, 0.1], [0.14, 1.20, 0.02, 0.2, 0.4, 0.1],
    [0, 1.26, 0.01, 0, 0.5, 0.1], [0, 0.71, -0.15, 0, -0.1, -0.4],
  ];
  for (let i = 0; i < tufts.length; i++) {
    const t = tufts[i];
    b.spike([t[0], t[1], t[2]], [t[3], t[4], t[5]], 0.105 + random() * 0.025, 0.035, { color: i % 2 ? FUR_LIGHT : FUR, bone: hips, name: `furTuft${i}`, group: "fur" });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.19, 0.78, 0.01], [s * 0.85, 0.15, 0.15], 0.14, 0.045, { color: FUR_LIGHT, bone: spine.tip!, name: `ruff${s > 0 ? "L" : "R"}`, group: "fur" });
  }
  // Three little claw tips make the mittens feel furry rather than featureless.
  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip! : armR.tip!;
    for (let i = -1; i <= 1; i++) {
      b.spike(hand.local([i * 0.035, 0.005, 0.075]), [0, 0.05, 1], 0.042, 0.009, {
        color: CREAM,
        bone: hand,
        name: `claw${s > 0 ? "L" : "R"}${i + 1}`,
        group: "arms",
      });
    }
  }
  // Small hanging robe tabs break up the skirt's broad blue plane.
  for (const s of [1, -1]) {
    b.spike([s * 0.205, 0.49, 0.08], [s * 0.05, -0.24, 0.02], 0.09, 0.018, {
      color: CLOTH,
      bone: hips,
      name: `robeTab${s > 0 ? "L" : "R"}`,
      group: "trim",
    });
  }

  // Arcane staff: a deliberately oversized, readable silhouette with metal collars and a floating crystal.
  b.rod([-0.47, 0.08, 0.01], [-0.57, 1.54, 0.01], 0.032, { color: WOOD, bone: hips, name: "staffShaft", group: "staff", section: { ngon: 6 } });
  b.rod([-0.48, 0.52, 0.01], [-0.51, 1.2, 0.01], 0.043, { color: WOOD_LIGHT, bone: hips, name: "staffInlay", group: "staff", section: { ngon: 6 } });
  b.part(new THREE.TorusGeometry(0.052, 0.011, 5, 10), GOLD, { bone: hips, at: [-0.505, 0.58, 0.01], rotation: [90, 0, 0], name: "staffGripBand", group: "staff", flat: true });
  b.part(new THREE.TorusGeometry(0.064, 0.014, 5, 10), GOLD, { bone: hips, at: [-0.56, 1.27, 0.01], rotation: [90, 0, 0], name: "staffCrownBand", group: "staff", flat: true });
  const crystal = b.part(new THREE.OctahedronGeometry(0.135, 1), CRYSTAL, { bone: hips, at: [-0.57, 1.43, 0.01], name: "staffCrystal", group: "staff", flat: true });
  glow(crystal, 2.2);
  const rune = b.part(new THREE.OctahedronGeometry(0.06, 0), MAGENTA, { bone: hips, at: [-0.57, 1.43, 0.12], rotation: [0, 45, 0], name: "crystalRune", group: "staff", flat: true });
  glow(rune, 2.6);
  b.spike([-0.57, 1.30, 0.01], [-0.57, 1.22, 0.01], 0.12, 0.018, { color: GOLD, bone: hips, name: "crownPoint", group: "staff" });
  for (const s of [1, -1]) {
    const p = [-0.57 + s * 0.075, 1.38, 0.01] as [number, number, number];
    b.spike(p, [-0.57 + s * 0.14, 1.43, 0.01], 0.08, 0.014, { color: GOLD, bone: hips, name: `crownArm${s > 0 ? "L" : "R"}`, group: "staff" });
  }

  // Floating rune motes around the crystal establish the League-style magic accent.
  const motes = [
    [-0.76, 1.51, 0.02, 0.032], [-0.38, 1.57, 0.01, 0.024], [-0.74, 1.28, 0.02, 0.021],
    [-0.36, 1.32, 0.03, 0.028], [-0.82, 1.39, -0.01, 0.016],
  ];
  for (let i = 0; i < motes.length; i++) {
    const m = motes[i];
    const mote = b.part(new THREE.TetrahedronGeometry(m[3], 0), i % 2 ? MAGENTA : CYAN, { bone: hips, at: [m[0], m[1], m[2]], rotation: [i * 19, i * 31, i * 13], name: `runeMote${i}`, group: "magic", flat: true });
    glow(mote, 1.8);
  }

  // A few crisp rune plates on the robe and gold trim keep large surfaces from reading flat.
  for (const s of [1, -1]) {
    const plate = b.part(new THREE.OctahedronGeometry(0.047, 0), s > 0 ? CYAN : MAGENTA, { bone: hips, at: [s * 0.17, 0.48, 0.245], rotation: [90, 0, 0], name: `robeRune${s > 0 ? "L" : "R"}`, group: "magic", flat: true });
    glow(plate, 1.5);
    b.part(new THREE.TorusGeometry(0.06, 0.008, 4, 8), GOLD, { bone: hips, at: [s * 0.17, 0.48, 0.238], rotation: [90, 0, 0], name: `robeRuneTrim${s > 0 ? "L" : "R"}`, group: "trim", flat: true });
  }

  return b.root;
}
