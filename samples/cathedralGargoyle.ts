import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { mottle, countershade } from "../src/paint";
import { catmull } from "../src/path";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched stone gargoyle sentinel on a stepped plinth, wings half open and eyes lit with a cold cyan glow.",
  style: "Blizzard/Overwatch mix",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "cathedralGargoyle", detail: 1 });

  const STONE = countershade(
    mottle("#68737c", "#3e4a55", { size: 0.28, contrast: 0.32, seed: 18 }),
    "#2d3640",
    { level: -0.15, soft: 0.25 },
  );
  const STONE_DARK = "#303943";
  const STONE_LIGHT = "#aeb7bd";
  const SLATE = "#4d5a66";
  const TRIM = "#2d70a5";
  const TRIM_DARK = "#183b61";
  const GLOW = "#71e7f2";
  const MOUTH = "#161d25";
  const PLINTH = "#3c464f";
  const PLINTH_TOP = "#65717a";

  const hips = b.joint("hips", { at: [0, 1.2, 0], dir: [0, 0.35, 1], role: "spine" });


  // Stepped architectural perch: everything else grows from its top plane.
  b.part(new THREE.BoxGeometry(1.42, 0.34, 1.12), PLINTH, {
    at: [0, 0.17, 0],
    flat: true,
    name: "plinthBase",
    group: "plinth",
  });
  b.part(new THREE.BoxGeometry(1.18, 0.12, 0.94), PLINTH_TOP, {
    at: [0, 0.4, 0],
    flat: true,
    name: "plinthCap",
    group: "plinth",
  });
  b.part(new THREE.BoxGeometry(0.92, 0.08, 0.76), TRIM_DARK, {
    at: [0, 0.5, 0],
    flat: true,
    name: "plinthInset",
    group: "plinth",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.22, 0.78), TRIM, {
      at: [s * 0.53, 0.48, 0],
      flat: true,
      name: s < 0 ? "plinthBandL" : "plinthBandR",
      group: "plinth",
    });
  }

  // One strong root and a short, broad heroic torso.
  const chest = b.joint("chest", { parent: hips, at: [0, 1.62, 0.02], aim: [0, 1.95, 0.07], role: "spine" });
  const shoulder = b.joint("shoulder", { parent: chest, at: [0, 1.94, 0.07], aim: [0, 2.15, 0.1], role: "spine" });
  const torsoPath = catmull([hips.at, chest.at, shoulder.at]);
  b.sweep(torsoPath, (t) => [0.32 - t * 0.04, 0.28 - t * 0.03], {
    bone: [hips, chest, shoulder],
    color: STONE,
    section: "box",
    caps: "round",
    smooth: false,
    name: "torso",
    group: "body",
  });
  b.part(new THREE.SphereGeometry(0.28, 8, 6), SLATE, {
    bone: chest,
    at: [0, 1.71, 0.05],
    scale: [1.18, 0.82, 1.08],
    flat: true,
    name: "chestMass",
    group: "body",
  });

  // Angular front breastplate, with inset cyan service line.
  b.extrude(
    [[-0.25, 0], [0.25, 0], [0.3, 0.2], [0.17, 0.38], [0, 0.46, "sharp"], [-0.17, 0.38], [-0.3, 0.2]],
    {
      at: [0, 1.64, 0.28],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.07, 0.045],
      bevel: 0.025,
      color: TRIM_DARK,
      bone: chest,
      name: "breastplate",
      group: "armor",
    },
  );
  b.part(new THREE.BoxGeometry(0.035, 0.28, 0.018), GLOW, {
    bone: chest,
    at: [0, 1.78, 0.33],
    flat: true,
    name: "chestLight",
    group: "armor",
  });

  // Neck, head, separated upper muzzle and opening jaw.
  const neck = b.joint("neck", { parent: shoulder, at: [0, 2.12, 0.1], aim: [0, 2.31, 0.18], role: "neck" });
  b.sweep([shoulder.at, neck.at], [0.2, 0.2], {
    bone: [shoulder, neck],
    color: STONE,
    section: { ngon: 6 },
    caps: "round",
    name: "neck",
    group: "body",
  });
  const head = b.joint("head", { parent: neck, at: [0, 2.36, 0.18], dir: [0, 0.05, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.31, 10, 7), STONE, {
    bone: head,
    at: [0, 2.37, 0.17],
    scale: [1.1, 0.95, 1.1],
    flat: true,
    name: "skull",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.2, 0.34), SLATE, {
    bone: head,
    at: [0, 2.29, 0.4],
    flat: true,
    name: "muzzle",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.2, 0.35], aim: [0, 2.15, 0.58], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.28, 0.1, 0.28), STONE_DARK, {
    bone: jaw,
    at: [0, 2.19, 0.42],
    flat: true,
    name: "lowerJaw",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.035, 0.055), MOUTH, {
    bone: head,
    at: [0, 2.2, 0.56],
    flat: true,
    name: "mouthGap",
    group: "head",
  });

  // Brow ridges and luminous eyes are separate, readable shapes.
  for (const s of [-1, 1]) {
    b.sweep(
      [head.local([s * 0.21, 0.04, 0.12]), head.local([s * 0.08, 0.11, 0.2])],
      [0.045, 0.025],
      { bone: head, color: STONE_LIGHT, section: { ngon: 5 }, caps: "flat", name: s < 0 ? "browL" : "browR", group: "head" },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.045, 8, 5), GLOW, {
        bone: head,
        at: head.local([s * 0.14, 0.17, 0.07]),
        flat: true,
        name: s < 0 ? "eyeL" : "eyeR",
        group: "head",
      }),
      1.8,
    );
    b.spike(head.local([s * 0.22, 0.06, 0.2]), [s * 0.25, 0.45, -0.08], 0.25, 0.065, {
      color: STONE_LIGHT,
      bone: head,
      name: s < 0 ? "hornL" : "hornR",
      group: "head",
    });
  }

  // Crouched digitigrade legs: thick thighs, armored shins, planted feet.
  for (const s of [-1, 1]) {
    const legTipName = s < 0 ? "footL" : "footR";
    const leg = b.chain(
      s < 0 ? "legL" : "legR",
      [
        [s * 0.25, 1.24, 0],
        [s * 0.43, 0.92, 0.16],
        [s * 0.39, 0.61, 0.18],
        [s * 0.38, 0.55, 0.37],
      ],
      { parent: hips, names: s < 0 ? ["hipL", "kneeL", "ankleL", "footL"] : ["hipR", "kneeR", "ankleR", "footR"], role: "leg" },
    );
    b.sweep(leg, (t) => 0.14 - t * 0.045, {
      color: STONE,
      section: { ngon: 6 },
      caps: "round",
      name: s < 0 ? "legTubeL" : "legTubeR",
      group: "limbs",
    });
    b.part(new THREE.BoxGeometry(0.23, 0.16, 0.34), SLATE, {
      bone: leg.joints[1],
      at: leg.joints[1].at,
      flat: true,
      name: s < 0 ? "kneeGuardL" : "kneeGuardR",
      group: "armor",
    });
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.3), TRIM_DARK, {
      bone: leg.joints[2],
      at: leg.joints[2].at,
      flat: true,
      name: s < 0 ? "shinGuardL" : "shinGuardR",
      group: "armor",
    });
    b.part(new THREE.BoxGeometry(0.25, 0.13, 0.37), STONE_DARK, {
      bone: leg.tip ?? undefined,
      at: leg.tip?.at,
      flat: true,
      name: legTipName,
      group: "limbs",
    });
    for (const x of [-0.07, 0, 0.07]) {
      b.spike([s * 0.38 + x, 0.55, 0.52], [0, -0.04, 1], 0.16, 0.027, {
        color: STONE_LIGHT,
        bone: leg.tip ?? undefined,
        name: s < 0 ? "talonL" : "talonR",
        group: "claws",
      });
    }
  }

  // Broad shoulders and bent arms with oversized gauntleted hands.
  for (const s of [-1, 1]) {
    const arm = b.chain(
      s < 0 ? "armL" : "armR",
      [
        [s * 0.28, 1.98, 0.05],
        [s * 0.52, 1.78, 0.22],
        [s * 0.63, 1.46, 0.32],
        [s * 0.68, 1.43, 0.43],
      ],
      { parent: shoulder, names: s < 0 ? ["shoulderL", "elbowL", "wristL", "handL"] : ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
    );
    b.sweep(arm, (t) => 0.11 - t * 0.035, {
      color: STONE,
      section: { ngon: 6 },
      caps: "round",
      name: s < 0 ? "armTubeL" : "armTubeR",
      group: "limbs",
    });
    b.part(new THREE.SphereGeometry(0.18, 8, 6), SLATE, {
      bone: arm.joints[0],
      at: arm.joints[0].at,
      scale: [1.15, 0.75, 1.2],
      flat: true,
      name: s < 0 ? "pauldronL" : "pauldronR",
      group: "armor",
    });
    b.part(new THREE.BoxGeometry(0.22, 0.23, 0.22), TRIM_DARK, {
      bone: arm.joints[2],
      at: arm.joints[2].at,
      flat: true,
      name: s < 0 ? "gauntletL" : "gauntletR",
      group: "armor",
    });
    for (const f of [-0.055, 0, 0.055]) {
      b.spike([s * 0.68 + f, 1.42, 0.44], [0, -0.12, 1], 0.15, 0.022, {
        color: STONE_LIGHT,
        bone: arm.tip ?? undefined,
        name: s < 0 ? "fingerL" : "fingerR",
        group: "claws",
      });
    }
  }

  // Half-open wings: articulated spars, a thick leading rim, and scalloped membranes.
  for (const s of [-1, 1]) {
    const wing = b.chain(
      s < 0 ? "wingL" : "wingR",
      [
        [s * 0.24, 2.02, -0.12],
        [s * 0.58, 2.34, -0.18],
        [s * 0.98, 2.48, -0.04],
      ],
      { parent: shoulder, names: s < 0 ? ["wingRootL", "wingMidL", "wingTipL"] : ["wingRootR", "wingMidR", "wingTipR"], role: "wing" },
    );
    const trailing = [
      [s * 0.24, 2.02, -0.12],
      [s * 0.47, 2.03, -0.34],
      [s * 0.78, 2.14, -0.29],
      [s * 0.98, 2.48, -0.04],
    ];
    b.membrane(wing, trailing, {
      color: STONE_DARK,
      thickness: 0.025,
      rows: 4,
      scallop: 0.12,
      name: s < 0 ? "wingMembraneL" : "wingMembraneR",
      group: "wings",
    });
    b.sweep(wing, [0.065, 0.026], {
      color: STONE_LIGHT,
      section: { ngon: 5 },
      caps: "round",
      name: s < 0 ? "wingRimL" : "wingRimR",
      group: "wings",
    });
    const digit = b.chain(
      s < 0 ? "wingDigitL" : "wingDigitR",
      [wing.joints[1].at, [s * 0.84, 2.72, -0.08], [s * 1.11, 2.61, 0.02]],
      { parent: wing.joints[1], names: s < 0 ? ["wingFingerL", "wingClawL", "wingPointL"] : ["wingFingerR", "wingClawR", "wingPointR"], role: "digit" },
    );
    b.sweep(digit, [0.035, 0.012], {
      color: STONE_LIGHT,
      section: { ngon: 5 },
      caps: "point",
      name: s < 0 ? "wingDigitTubeL" : "wingDigitTubeR",
      group: "wings",
    });
    b.membrane(wing, digit, {
      color: TRIM_DARK,
      thickness: 0.018,
      rows: 3,
      scallop: 0.18,
      name: s < 0 ? "wingInnerL" : "wingInnerR",
      group: "wings",
    });
    b.along(wing, 3, (at) =>
      b.spike(at, at, 0.12, 0.02, {
        color: TRIM,
        name: s < 0 ? "wingRivetL" : "wingRivetR",
        group: "wings",
      }),
    );
  }

  // A few deliberately placed stone rivets and cyan edge plates sell the sci-fi masonry.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.032, 6, 4), STONE_LIGHT, {
      bone: chest,
      at: [s * 0.22, 1.77, 0.31],
      flat: true,
      name: s < 0 ? "chestRivetL" : "chestRivetR",
      group: "armor",
    });
    b.part(new THREE.BoxGeometry(0.04, 0.24, 0.025), TRIM, {
      bone: shoulder,
      at: [s * 0.31, 1.99, 0.24],
      flat: true,
      name: s < 0 ? "shoulderLightL" : "shoulderLightR",
      group: "armor",
    });
  }

  return b.root;
}
