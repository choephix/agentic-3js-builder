import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { mottle, countershade } from "../src/paint";

const COAT = "#5a382c";
const COAT_LIGHT = "#8d5c45";
const COAT_DARK = "#3a211d";
const CREAM = "#f1c98a";
const CREAM_LIGHT = "#ffe6b5";
const NOSE = "#2b1820";
const INK = "#28151c";
const EAR_INNER = "#d8877d";
const ROCK = mottle("#4e5960", "#718087", { size: 0.18, contrast: 0.6, seed: 4 });
const ROCK_LIGHT = "#8b9b9c";
const SHELL = mottle("#3f8f86", "#79c1a7", { size: 0.06, contrast: 0.4, seed: 7 });
const SHELL_DARK = "#24615f";
const PEARL = "#fff1c4";
const COAT_PAINT = countershade(mottle(COAT, COAT_LIGHT, { size: 0.12, contrast: 0.42, seed: 11 }), CREAM, { level: -0.18 });
const BELLY_PAINT = countershade(CREAM, "#d79c67", { level: -0.12 });

export const meta = {
  name: "Sea Otter with Clam",
  description: "A cheerful whimsical sea otter balanced on a mossy rock, cradling an opened clam.",
  style: "whimsical",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "seaOtter", detail: 1.15, paintSize: 1024 });

  const hips = b.joint("hips", { at: [0, 0.64, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, 0],
      [0, 0.77, 0.015],
      [0, 0.9, 0.06],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.tip!.at,
      [0, 1.01, 0.09],
      [0, 1.1, 0.14],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neckMid", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: neck.tip!.at, dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.075, 0.27], dir: [0, -0.16, 1], role: "jaw" });

  const legL = b.chain(
    "legL",
    polyline([
      [0.16, 0.63, 0.02],
      [0.2, 0.45, 0.055],
      [0.16, 0.31, 0.12],
      [0.15, 0.275, 0.225],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.15, 0.24, 0.25] },
  );
  const legR = b.chain(
    "legR",
    polyline([
      [-0.16, 0.63, 0.02],
      [-0.2, 0.45, 0.055],
      [-0.16, 0.31, 0.12],
      [-0.15, 0.275, 0.225],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.15, 0.24, 0.25] },
  );

  const armL = b.chain(
    "armL",
    polyline([
      [0.205, 0.9, 0.1],
      [0.28, 0.77, 0.2],
      [0.15, 0.64, 0.34],
      [0.095, 0.59, 0.405],
    ]),
    { parent: spine.tip!, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    polyline([
      [-0.205, 0.9, 0.1],
      [-0.28, 0.77, 0.2],
      [-0.15, 0.64, 0.34],
      [-0.095, 0.59, 0.405],
    ]),
    { parent: spine.tip!, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      hips.at,
      [0, 0.56, -0.22],
      [0, 0.43, -0.48],
      [0, 0.31, -0.68],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );

  const torso = b.sweep(spine, (t) => 0.21 + 0.045 * Math.sin(t * Math.PI), {
    color: COAT_PAINT,
    shift: (): [number, number] => [0, -0.015],
    section: { ngon: 8 },
    name: "torso",
  });
  b.sweep(neck, [0.14, 0.115], { color: COAT_PAINT, section: { ngon: 8 }, name: "neckFur" });
  b.sweep(tail, [0.14, 0.035], { color: COAT_PAINT, section: { ngon: 8 }, name: "broadTail" });
  b.sweep(legL, [0.105, 0.06], { color: COAT_PAINT, section: { ngon: 7 }, name: "hindLegL" });
  b.sweep(legR, [0.105, 0.06], { color: COAT_PAINT, section: { ngon: 7 }, name: "hindLegR" });
  b.sweep(armL, [0.075, 0.045], { color: COAT_PAINT, section: { ngon: 7 }, name: "armFurL" });
  b.sweep(armR, [0.075, 0.045], { color: COAT_PAINT, section: { ngon: 7 }, name: "armFurR" });

  const body = b.surface(torso);
  const chestPatch = b.part(new THREE.SphereGeometry(1, 12, 8), BELLY_PAINT, {
    bone: spine.tip!,
    at: [0, 0.82, 0.2],
    scale: [0.155, 0.25, 0.055],
    name: "creamChest",
  });
  const belly = b.part(new THREE.SphereGeometry(1, 12, 8), BELLY_PAINT, {
    bone: hips,
    at: [0, 0.62, 0.18],
    scale: [0.18, 0.18, 0.06],
    name: "creamBelly",
  });
  void chestPatch;
  void belly;

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT_PAINT, {
    bone: head,
    at: [0, 1.17, 0.17],
    scale: [0.19, 0.19, 0.19],
    name: "roundHead",
  });

  const muzzleL = b.part(new THREE.SphereGeometry(1, 10, 7), CREAM_LIGHT, {
    bone: head,
    at: [0.055, 1.1, 0.285],
    scale: [0.095, 0.075, 0.1],
    name: "muzzleL",
  });
  const muzzleR = b.part(new THREE.SphereGeometry(1, 10, 7), CREAM_LIGHT, {
    bone: head,
    at: [-0.055, 1.1, 0.285],
    scale: [0.095, 0.075, 0.1],
    name: "muzzleR",
  });
  void skull;
  void muzzleL;
  void muzzleR;
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, 1.13, 0.375],
    scale: [0.045, 0.035, 0.028],
    name: "shinyNose",
  });
  b.part(new THREE.SphereGeometry(1, 7, 5), CREAM_LIGHT, {
    bone: jaw,
    at: [0, 1.075, 0.31],
    scale: [0.105, 0.045, 0.07],
    name: "lowerJaw",
  });
  b.rod([0, 1.115, 0.355], [0, 1.095, 0.37], 0.009, { color: INK, name: "mouthLine" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 9, 6), COAT, {
      bone: head,
      at: [s * 0.145, 1.22, 0.13],
      scale: [0.06, 0.07, 0.035],
      name: `ear${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), EAR_INNER, {
      bone: head,
      at: [s * 0.145, 1.22, 0.16],
      scale: [0.035, 0.043, 0.012],
      name: `earInner${side}`,
    });
    const eyeAt = [s * 0.075, 1.195, 0.29] as [number, number, number];
    b.part(new THREE.SphereGeometry(1, 10, 8), CREAM_LIGHT, {
      bone: head,
      at: eyeAt,
      scale: [0.048, 0.055, 0.027],
      name: `eyeWhite${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 9, 7), INK, {
      bone: head,
      at: [s * 0.075, 1.195, 0.318],
      scale: [0.022, 0.031, 0.012],
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), "#fff9e4", {
      bone: head,
      at: [s * 0.066, 1.21, 0.33],
      scale: [0.008, 0.011, 0.006],
      name: `eyeGlint${side}`,
    });
    const whiskerBase = [s * 0.07, 1.095, 0.34] as [number, number, number];
    b.rod(whiskerBase, [s * 0.22, 1.115, 0.4], 0.004, { color: CREAM_LIGHT, name: `whiskerTop${side}` });
    b.rod(whiskerBase, [s * 0.235, 1.075, 0.35], 0.004, { color: CREAM_LIGHT, name: `whiskerMid${side}` });
    b.rod(whiskerBase, [s * 0.2, 1.04, 0.3], 0.004, { color: CREAM_LIGHT, name: `whiskerLow${side}` });
  }

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    b.part(new THREE.SphereGeometry(1, 10, 6), COAT_DARK, {
      bone: leg.tip!,
      at: [s * 0.15, 0.28, 0.24],
      scale: [0.09, 0.055, 0.13],
      name: `foot${s > 0 ? "L" : "R"}`,
    });
    for (let i = -1; i <= 1; i += 1) {
      b.spike([s * (0.15 + i * 0.028), 0.285, 0.34], [0, 0.02, 1], 0.055, 0.014, {
        color: CREAM,
        bone: leg.tip!,
        name: `toe${s > 0 ? "L" : "R"}${i + 2}`,
      });
    }
  }

  const clamCenter: [number, number, number] = [0, 0.63, 0.46];
  b.part(new THREE.SphereGeometry(1, 12, 8), SHELL, {
    at: [0, 0.55, 0.455],
    scale: [0.145, 0.055, 0.115],
    rotation: [-18, 0, 0],
    name: "clamLowerShell",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), SHELL, {
    at: [0, 0.7, 0.455],
    scale: [0.145, 0.055, 0.115],
    rotation: [18, 0, 0],
    name: "clamUpperShell",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), "#a5d5b5", {
    at: [0, 0.625, 0.465],
    scale: [0.11, 0.018, 0.08],
    name: "clamInnerShell",
  });
  b.part(new THREE.SphereGeometry(1, 9, 6), PEARL, {
    at: clamCenter,
    scale: [0.04, 0.035, 0.04],
    name: "clamPearl",
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), SHELL_DARK, {
    at: [0, 0.575, 0.35],
    scale: [0.026, 0.026, 0.018],
    name: "clamHinge",
  });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i += 1) {
      const x = s * (0.035 + i * 0.027);
      b.rod([0, 0.61, 0.48], [x, 0.705 + i * 0.005, 0.515], 0.006, { color: SHELL_DARK, name: `shellRidge${s > 0 ? "L" : "R"}${i}` });
    }
  }
  b.rod([-0.115, 0.61, 0.49], [0.115, 0.61, 0.49], 0.006, { color: SHELL_DARK, name: "clamSeam" });

  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 9, 6), COAT_DARK, {
      bone: arm.tip!,
      at: [s * 0.095, 0.59, 0.42],
      scale: [0.065, 0.06, 0.075],
      name: `paw${side}`,
    });
    for (let i = 0; i < 3; i += 1) {
      const x = s * (0.065 + i * 0.028);
      const fingerPath = polyline([
        [s * 0.095, 0.59, 0.43],
        [x, 0.6 + i * 0.008, 0.455 + i * 0.008],
      ]);
      const finger = b.chain(`finger${side}${i + 1}`, fingerPath, {
        parent: arm.tip!,
        names: [`finger${side}${i + 1}Base`, `finger${side}${i + 1}Tip`],
        role: "digit",
      });
      b.sweep(finger, [0.013, 0.004], { color: COAT_DARK, section: { ngon: 6 }, name: `finger${side}${i + 1}` });
    }
  }

  const furHits = body.scatter(24, {
    minDist: 0.07,
    filter: (h) => h.n.y > -0.15 && h.n.z < 0.55,
  });
  for (let i = 0; i < furHits.length; i += 1) {
    b.stick(new THREE.ConeGeometry(0.012, 0.035, 5), i % 3 === 0 ? COAT_LIGHT : COAT_DARK, furHits[i], {
      embed: 0.65,
      name: `furTuft${i}`,
    });
  }

  const rockPart = b.part(new THREE.SphereGeometry(1, 12, 7), ROCK, {
    at: [0, 0.12, 0],
    scale: [0.5, 0.12, 0.42],
    name: "mossyRock",
  });
  void rockPart;
  for (const p of [
    [-0.28, 0.215, 0.11],
    [0.32, 0.2, -0.12],
    [-0.08, 0.22, -0.27],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), ROCK_LIGHT, {
      at: p,
      scale: [0.1, 0.025, 0.07],
      name: "rockFacet",
    });
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.38, 0.21, 0.12], [0, 1, 0], 0.045, 0.024, { color: "#69a86e", name: `moss${s > 0 ? "L" : "R"}` });
  }

  return b.root;
}
