import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade, mottle } from "../src/paint";
import { catmull } from "../src/path";

const SKIN = "#59677c";
const SKIN_LIGHT = "#8191a8";
const SKIN_DARK = "#38465d";
const BELLY = "#a6b2c0";
const EYE = "#101827";
const CYAN = "#35d4dc";
const CYAN_DARK = "#157f93";
const VIOLET = "#7564d8";
const MOUTH = "#202738";
const IVORY = "#f2d9a5";

const coat = countershade(mottle(SKIN, SKIN_LIGHT, { size: 0.42, contrast: 0.24, seed: 18 }), BELLY, {
  level: -0.25,
  soft: 0.4,
});

export const meta = {
  name: "Aegis Hippopotamus",
  description: "A standing, closed-mouth hippopotamus with polished Overwatch-inspired armor accents and expressive eyes.",
  style: "Overwatch",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "hippopotamus", detail: 1.15, paintSize: 1024 });

  // Skeleton first: a centered spine, four planted legs, a short tail, neck, head and separate jaw.
  const hips = b.joint("hips", { at: [0, 1.14, 0], role: "spine" });
  const spinePath = catmull([
    [0, 1.15, -1.25],
    [0, 1.23, -0.78],
    [0, 1.30, -0.15],
    [0, 1.34, 0.52],
    [0, 1.36, 1.08],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineChest", "spineFront", "spineTip"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.35, 1.02],
      [0, 1.40, 1.34],
      [0, 1.47, 1.62],
    ]),
    { parent: spine.joints[spine.joints.length - 1], names: ["neckBase", "neckMid", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.48, 1.66],
    aim: [0, 1.48, 2.1],
    group: "head",
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.24, -0.20]),
    aim: head.local([0, 0.58, -0.20]),
    group: "head",
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.19, -1.18],
      [0, 1.16, -1.53],
      [0, 1.08, -1.86],
      [0, 1.00, -2.08],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailEnd"], role: "tail" },
  );

  const legPaths: Array<{ side: number; z: number; front: boolean; names: string[] }> = [
    { side: 1, z: 0.70, front: true, names: ["hipFL", "kneeFL", "ankleFL", "hoofFL"] },
    { side: -1, z: 0.70, front: true, names: ["hipFR", "kneeFR", "ankleFR", "hoofFR"] },
    { side: 1, z: -0.78, front: false, names: ["hipHL", "kneeHL", "ankleHL", "hoofHL"] },
    { side: -1, z: -0.78, front: false, names: ["hipHR", "kneeHR", "ankleHR", "hoofHR"] },
  ];
  const legs = legPaths.map(({ side, z, front, names }) => {
    const x = side * 0.62;
    const points = front
      ? [[x, 1.16, z], [x * 1.03, 0.75, z + 0.03], [x * 1.04, 0.30, z + 0.08], [x * 1.04, 0.17, z + 0.14]]
      : [[x, 1.12, z], [x * 1.02, 0.72, z - 0.04], [x * 1.04, 0.29, z - 0.10], [x * 1.04, 0.16, z - 0.02]];
    return b.chain(front ? (side > 0 ? "legFL" : "legFR") : (side > 0 ? "legHL" : "legHR"), catmull(points), {
      parent: hips,
      names,
      role: "leg",
      group: "legs",
    });
  });

  // Main continuous masses: faceted enough to read as a built game asset, but with polished rounded volume.
  const body = b.sweep(spine, (t) => [0.57 + 0.18 * Math.sin(t * Math.PI), 0.55 + 0.16 * Math.sin(t * Math.PI)], {
    color: coat,
    section: { ngon: 10 },
    group: "body",
    name: "torso",
  });
  const neckSweep = b.sweep(neck, [0.46, 0.53], { color: coat, section: { ngon: 9 }, group: "body", name: "neck" });
  b.sweep(tail, [0.16, 0.055], {
    color: coat,
    bands: [[0.72, CYAN_DARK], [0.90, SKIN_DARK]],
    section: { ngon: 8 },
    group: "tail",
    name: "tail",
  });

  for (let i = 0; i < legs.length; i += 1) {
    const foot = legs[i].joints[legs[i].joints.length - 1];
    b.sweep(legs[i], (t) => (t < 0.35 ? 0.205 : t < 0.72 ? 0.17 : 0.19), {
      color: coat,
      section: { ngon: 8 },
      group: "legs",
      name: `leg${i}`,
    });
    b.part(new THREE.BoxGeometry(0.38, 0.20, 0.42), SKIN_DARK, {
      bone: foot,
      at: foot.at,
      group: "hooves",
      name: `hoofArmor${i}`,
    });
    b.part(new THREE.BoxGeometry(0.22, 0.08, 0.15), CYAN, {
      bone: foot,
      at: foot.local([0, 0.01, 0.13]),
      group: "hooves",
      name: `hoofAccent${i}`,
    });
  }

  // Head and the two explicitly separate jaw masses keep the mouth closed while remaining riggable.
  const skull = b.part(new THREE.SphereGeometry(1, 18, 12), coat, {
    bone: head,
    at: head.at,
    scale: [0.68, 0.62, 0.63],
    group: "head",
    name: "skull",
  });
  const upperMuzzle = b.part(new THREE.SphereGeometry(1, 16, 10), coat, {
    bone: head,
    at: head.local([0, 0.30, -0.04]),
    scale: [0.73, 0.52, 0.43],
    group: "head",
    name: "upperMuzzle",
  });
  const nosePad = b.part(new THREE.SphereGeometry(1, 14, 8), SKIN_DARK, {
    bone: head,
    at: head.local([0, 0.66, -0.06]),
    scale: [0.57, 0.19, 0.27],
    group: "head",
    name: "nosePad",
  });
  b.part(new THREE.SphereGeometry(1, 16, 10), SKIN_LIGHT, {
    bone: jaw,
    at: jaw.local([0, 0.18, 0.00]),
    scale: [0.61, 0.40, 0.24],
    group: "jaw",
    name: "lowerJaw",
  });
  b.rod([-0.53, 1.31, 2.28], [0.53, 1.31, 2.28], 0.019, {
    color: MOUTH,
    bone: head,
    group: "jaw",
    name: "closedMouthSeam",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.12, 0.18), IVORY, {
    bone: jaw,
    at: jaw.local([0.44, 0.20, 0.03]),
    group: "jaw",
    name: "tuskL",
  });
  b.part(new THREE.BoxGeometry(0.09, 0.12, 0.18), IVORY, {
    bone: jaw,
    at: jaw.local([-0.44, 0.20, 0.03]),
    group: "jaw",
    name: "tuskR",
  });

  // Ears use a short swept root plus a thick triangular fan, avoiding a horn-like silhouette.
  const headSurface = b.surface([skull, upperMuzzle, nosePad]);
  for (const side of [1, -1]) {
    const earHit = headSurface.around(head.at).at(side * 72, 55);
    if (earHit) {
      const earTip: [number, number, number] = [side * 0.70, 2.02, 1.60];
      b.sprout(side > 0 ? "earL" : "earR", earHit, earTip, [0.10, 0.035], {
        role: "fan",
        color: coat,
        count: 1,
        names: [side > 0 ? "earL" : "earR"],
        group: "head",
      });
      b.extrude(
        [[-0.20, 0], [0.21, 0], [0.14, 0.20], [-0.02, 0.30], [-0.18, 0.16]],
        {
          at: [side * 0.57, 1.88, 1.59],
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.065,
          bevel: 0.018,
          smoothing: 1,
          color: coat,
          bone: head,
          group: "head",
          name: side > 0 ? "earFanL" : "earFanR",
        },
      );
      b.extrude(
        [[-0.12, 0.02], [0.12, 0.02], [0.07, 0.14], [-0.02, 0.21], [-0.10, 0.12]],
        {
          at: [side * 0.57, 1.89, 1.625],
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.025,
          bevel: 0.008,
          smoothing: 1,
          color: CYAN_DARK,
          bone: head,
          group: "head",
          name: side > 0 ? "earInnerL" : "earInnerR",
        },
      );
    }
  }

  // Expressive eyes, brows and nostrils are seated from the head surface so they follow the head bone.
  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(side * 58, 34);
    if (eyeHit) {
      const eye = b.stick(new THREE.SphereGeometry(0.105, 12, 8), EYE, eyeHit, {
        embed: 0.20,
        group: "face",
        name: side > 0 ? "eyeL" : "eyeR",
      });
      b.stick(new THREE.SphereGeometry(0.064, 10, 6), CYAN, eye.moved([0, 0.065, 0]), {
        embed: 0.10,
        group: "face",
        name: side > 0 ? "irisL" : "irisR",
      });
      b.stick(new THREE.SphereGeometry(0.026, 8, 5), EYE, eye.moved([0, 0.112, 0.018]), {
        embed: 0.05,
        group: "face",
        name: side > 0 ? "pupilL" : "pupilR",
      });
      b.stick(new THREE.BoxGeometry(0.24, 0.055, 0.095), VIOLET, eyeHit.moved([0, 0.02, 0.13]), {
        embed: 0.38,
        group: "face",
        name: side > 0 ? "browL" : "browR",
      });
    }
  }
  const nostrilHit = headSurface.around(head.at).at(0, 8);
  if (nostrilHit) {
    for (const side of [1, -1]) {
      b.stick(new THREE.SphereGeometry(0.065, 10, 6), EYE, nostrilHit.moved([side * 0.17, 0.025, 0]), {
        embed: 0.25,
        group: "face",
        name: side > 0 ? "nostrilL" : "nostrilR",
      });
    }
  }

  // Four bold shoulder/hip plates break up the large torso with readable Overwatch panel language.
  for (const side of [1, -1]) {
    const shoulderHit = b.surface(body).around([0, 1.30, 0.42]).at(side * 82, 8);
    if (shoulderHit) {
      b.stick(new THREE.BoxGeometry(0.46, 0.13, 0.44), CYAN, shoulderHit, {
        embed: 0.45,
        group: "armor",
        name: side > 0 ? "shoulderPlateL" : "shoulderPlateR",
      });
      b.stick(new THREE.BoxGeometry(0.30, 0.035, 0.24), VIOLET, shoulderHit.moved([0, 0.07, 0]), {
        embed: 0.40,
        group: "armor",
        name: side > 0 ? "shoulderInsetL" : "shoulderInsetR",
      });
    }
    const hipHit = b.surface(body).around([0, 1.22, -0.45]).at(side * 88, 0);
    if (hipHit) {
      b.stick(new THREE.BoxGeometry(0.34, 0.10, 0.35), CYAN_DARK, hipHit, {
        embed: 0.42,
        group: "armor",
        name: side > 0 ? "hipPlateL" : "hipPlateR",
      });
    }
  }

  // A raised dorsal rail, forehead plate and collar rings finish the armor language.
  b.rod([0, 1.88, 0.10], [0, 1.88, 0.78], 0.035, { color: CYAN_DARK, bone: spine.joints[2], group: "armor", name: "dorsalRail" });
  b.part(new THREE.BoxGeometry(0.26, 0.14, 0.055), VIOLET, {
    bone: head,
    at: [0, 1.86, 2.16],
    group: "armor",
    name: "foreheadPlate",
  });
  b.sweep(b.surface(neckSweep).loop(neck.joints[1], { lift: 0.015 }), 0.027, {
    color: VIOLET,
    group: "armor",
    name: "neckCollar",
  });

  return b.root;
}
