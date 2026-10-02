import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";

const SKIN = "#6f9c58";
const SKIN_LIGHT = "#9fc66e";
const SKIN_DARK = "#3f623d";
const BELLY = "#b7d77e";
const VEST = "#76528f";
const VEST_LIGHT = "#a978ad";
const BELT = "#5b3b2a";
const GOLD = "#e5b84c";
const PANTS = "#d39242";
const PANTS_LIGHT = "#efbd63";
const BOOT = "#824b32";
const BOOT_LIGHT = "#a9653e";
const WOOD = "#744326";
const WOOD_LIGHT = "#a9673d";
const WOOD_DARK = "#48291f";
const EYE = "#ffe27b";
const IRIS = "#7d5a27";
const PUPIL = "#19151b";
const IVORY = "#f7e8b9";
const BLUSH = "#d87962";

export const meta = {
  name: "Grumpy One-Eyed Cyclops",
  description: "A squat, storybook cyclops with a permanently pinched brow, a battered club, and a huge expressive eye.",
  style: "whimsical",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "grumpyCyclops", detail: 1 });

  // Skeleton first: a relaxed puppet stance with every limb and digit separated.
  const hips = b.joint("hips", { at: [0, 1.08, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.08, 0],
      [0, 1.34, 0.015],
      [0, 1.62, 0],
      [0, 1.82, 0.01],
    ]),
    { parent: hips, names: ["spineLow", "spineMid", "chest", "shoulders"], role: "spine" },
  );
  const shoulders = spine.tip!;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.82, 0.01],
      [0, 2.03, 0.015],
      [0, 2.17, 0.02],
    ]),
    { parent: shoulders, names: ["neck", "neckTop", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 2.26, 0.04],
    dir: [0, 0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.08, 0.22],
    dir: [0, -0.1, 1],
    role: "jaw",
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.43, 1.77, 0],
      [0.68, 1.59, 0.035],
      [0.86, 1.34, 0.1],
      [0.91, 1.1, 0.17],
    ]),
    { parent: shoulders, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.43, 1.77, 0],
      [-0.68, 1.59, 0.035],
      [-0.86, 1.34, 0.1],
      [-0.91, 1.1, 0.17],
    ]),
    { parent: shoulders, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );
  const legL = b.chain(
    "legL",
    catmull([
      [0.25, 1.03, 0],
      [0.3, 0.72, 0.06],
      [0.31, 0.39, 0.08],
      [0.31, 0.16, 0.1],
      [0.31, 0.13, 0.3],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "heelL", "footL"], role: "leg" },
  );
  const legR = b.chain(
    "legR",
    catmull([
      [-0.25, 1.03, 0],
      [-0.3, 0.72, 0.06],
      [-0.31, 0.39, 0.08],
      [-0.31, 0.16, 0.1],
      [-0.31, 0.13, 0.3],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "heelR", "footR"], role: "leg" },
  );

  const fingerChains: Chain[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hand = (s === 1 ? armL.tip : armR.tip)!;
    const fingerData = [
      [0.11, 0.18, 0.12],
      [0.02, 0.2, 0.17],
      [-0.1, 0.17, 0.12],
    ];
    fingerData.forEach(([dx, dz], i) => {
      const root = hand.local([s * dx * 0.45, 0.01, dz * 0.35]);
      const mid = hand.local([s * (dx * 0.7 + 0.02), 0.06, dz * 0.7 + 0.035]);
      const tip = hand.local([s * (dx * 0.8 + 0.025), 0.1, dz * 0.8 + 0.06]);
      fingerChains.push(
        b.chain(
          `finger${side}${i}`,
          [root, mid, tip],
          {
            parent: hand,
            names: [`finger${side}${i}`, `finger${side}${i}Mid`, `finger${side}${i}Tip`],
            role: "digit",
          },
        ),
      );
    });
  }

  const toeChains: Chain[] = [];
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const foot = (s === 1 ? legL.tip : legR.tip)!;
    [-0.11, 0, 0.11].forEach((x, i) => {
      const root = foot.local([s * x, 0.08, 0.02]);
      const tip = foot.local([s * (x * 1.18), 0.18, 0.12]);
      toeChains.push(
        b.chain(`toe${side}${i}`, [root, tip], {
          parent: foot,
          names: [`toe${side}${i}`, `toe${side}${i}Tip`],
          role: "digit",
        }),
      );
    });
  }

  // Main skin: chunky, soft masses with faceted silhouette.
  b.sweep(spine, (t) => 0.32 + 0.08 * (1 - t), {
    color: SKIN,
    section: { ngon: 8 },
    sectors: [[120, 240, BELLY]],
    caps: "round",
    name: "torsoSkin",
  });
  b.sweep(neck, [0.19, 0.23], { color: SKIN, section: { ngon: 8 }, caps: "round", name: "neckSkin" });
  b.sweep(armL, (t) => 0.14 - t * 0.055, { color: SKIN, section: { ngon: 7 }, name: "armSkinL" });
  b.sweep(armR, (t) => 0.14 - t * 0.055, { color: SKIN, section: { ngon: 7 }, name: "armSkinR" });
  b.sweep(legL, (t) => 0.19 - t * 0.07, { color: SKIN, section: { ngon: 8 }, name: "legSkinL" });
  b.sweep(legR, (t) => 0.19 - t * 0.07, { color: SKIN, section: { ngon: 8 }, name: "legSkinR" });
  for (const chain of fingerChains) {
    b.sweep(chain, [0.045, 0.018], { color: SKIN_LIGHT, section: { ngon: 6 }, caps: "round" });
  }
  for (const chain of toeChains) {
    b.sweep(chain, [0.055, 0.022], { color: SKIN_DARK, section: { ngon: 6 }, caps: "round" });
  }

  // Clothes: a bright vest, belt, cuffs and oversized boots.
  b.part(new THREE.SphereGeometry(1, 10, 7), VEST, {
    bone: spine.joints[2],
    at: [0, 1.6, 0.12],
    scale: [0.4, 0.42, 0.34],
    name: "vestFront",
  });
  b.part(new THREE.BoxGeometry(0.72, 0.07, 0.08), VEST_LIGHT, {
    bone: shoulders,
    at: [0, 1.8, 0.31],
    name: "vestCollar",
  });
  b.sweep(
    polyline(
      Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return [Math.cos(a) * 0.39, 1.27, Math.sin(a) * 0.27];
      }),
      { closed: true },
    ),
    0.045,
    { bone: hips, color: BELT, section: { ngon: 6 }, caps: "none", name: "belt" },
  );
  for (const x of [-0.26, 0, 0.26]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.028, 8), GOLD, {
      bone: hips,
      at: [x, 1.275, 0.29],
      rotation: [90, 0, 0],
      name: "beltStud",
    });
  }
  b.part(new THREE.BoxGeometry(0.13, 0.18, 0.08), BELT, {
    bone: hips,
    at: [0.32, 1.14, 0.25],
    name: "beltPouch",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.11, 0.2), PANTS, {
    bone: hips,
    at: [0.22, 0.99, 0.02],
    scale: [1, 1, 1.1],
    name: "pantsL",
  });
  b.part(new THREE.BoxGeometry(0.22, 0.11, 0.2), PANTS, {
    bone: hips,
    at: [-0.22, 0.99, 0.02],
    scale: [1, 1, 1.1],
    name: "pantsR",
  });
  for (const s of [1, -1]) {
    const leg = s === 1 ? legL : legR;
    b.part(new THREE.SphereGeometry(1, 8, 6), PANTS_LIGHT, {
      bone: leg.joints[0],
      at: leg.joints[0].at,
      scale: [0.2, 0.3, 0.2],
      name: `kneePatch${s === 1 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), BOOT, {
      bone: leg.tip!,
      at: leg.tip!.at,
      scale: [0.2, 0.15, 0.31],
      name: `boot${s === 1 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.28, 0.045, 0.07), BOOT_LIGHT, {
      bone: leg.tip!,
      at: leg.tip!.local({ forward: 0.08, up: 0.1 }),
      name: `bootStrap${s === 1 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), SKIN_LIGHT, {
      bone: s === 1 ? armL.tip! : armR.tip!,
      at: (s === 1 ? armL.tip! : armR.tip!).at,
      scale: [0.15, 0.15, 0.15],
      name: `hand${s === 1 ? "L" : "R"}`,
    });
  }

  // Head and face: the huge eye sits in a broad, slightly lopsided head.
  b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, {
    bone: head,
    at: head.at,
    scale: [0.43, 0.47, 0.43],
    name: "headMass",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_LIGHT, {
    bone: head,
    at: head.local({ forward: 0.13, down: 0.12 }),
    scale: [0.32, 0.23, 0.21],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_DARK, {
    bone: head,
    at: head.local([0.35, 0.02, 0.02]),
    scale: [0.1, 0.17, 0.16],
    name: "earL",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_DARK, {
    bone: head,
    at: head.local([-0.35, 0.02, 0.02]),
    scale: [0.1, 0.17, 0.16],
    name: "earR",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUSH, {
    bone: head,
    at: head.local([0.28, 0.22, -0.08]),
    scale: [0.045, 0.06, 0.045],
    name: "cheekL",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUSH, {
    bone: head,
    at: head.local([-0.28, 0.22, -0.08]),
    scale: [0.045, 0.06, 0.045],
    name: "cheekR",
  });
  const eyeAt = head.local({ forward: 0.39, up: 0.1 });
  b.part(new THREE.SphereGeometry(1, 12, 8), EYE, {
    bone: head,
    at: eyeAt,
    scale: [0.2, 0.2, 0.12],
    name: "giantEye",
  });
  b.part(new THREE.TorusGeometry(0.19, 0.025, 6, 12), SKIN_DARK, {
    bone: head,
    at: head.local({ forward: 0.49, up: 0.1 }),
    dir: [0, 0, 1],
    axis: "z",
    name: "eyeRim",
  });
  b.part(new THREE.CircleGeometry(0.105, 12), IRIS, {
    bone: head,
    at: head.local({ forward: 0.505, up: 0.1 }),
    dir: [0, 0, 1],
    axis: "z",
    name: "iris",
  });
  b.part(new THREE.CircleGeometry(0.043, 10), PUPIL, {
    bone: head,
    at: head.local({ forward: 0.512, up: 0.1 }),
    dir: [0, 0, 1],
    axis: "z",
    name: "pupil",
  });
  b.part(new THREE.CircleGeometry(0.018, 8), "#ffffff", {
    bone: head,
    at: head.local({ forward: 0.52, up: 0.145, right: 0.04 }),
    dir: [0, 0, 1],
    axis: "z",
    name: "eyeSpark",
  });
  b.rod(head.local({ forward: 0.33, up: 0.31, right: 0.17 }), head.local({ forward: 0.43, up: 0.25, right: -0.15 }), 0.045, { bone: head, color: SKIN_DARK, name: "angryBrow" });
  b.rod(head.local({ forward: 0.44, up: 0.26, right: 0.12 }), head.local({ forward: 0.41, up: 0.31, right: -0.04 }), 0.028, { bone: head, color: SKIN_LIGHT, name: "browHighlight" });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_DARK, {
    bone: head,
    at: head.local({ forward: 0.42, down: 0.01 }),
    scale: [0.09, 0.11, 0.07],
    name: "nose",
  });

  // Separate upper and lower jaw, with a crooked frown and two little teeth.
  b.part(new THREE.BoxGeometry(0.31, 0.1, 0.18), SKIN_LIGHT, {
    bone: head,
    at: head.local({ forward: 0.31, down: 0.13 }),
    name: "upperJaw",
  });
  b.part(new THREE.SphereGeometry(1, 9, 6), SKIN, {
    bone: jaw,
    at: jaw.at,
    scale: [0.3, 0.1, 0.18],
    name: "lowerJaw",
  });
  b.rod(jaw.local({ forward: 0.12, up: 0.02, right: 0.18 }), jaw.local({ forward: 0.14, up: 0.04, right: -0.18 }), 0.018, { bone: jaw, color: SKIN_DARK, name: "frownLine" });
  b.part(new THREE.ConeGeometry(0.032, 0.1, 6), IVORY, {
    bone: head,
    at: head.local({ forward: 0.39, down: 0.17, right: 0.12 }),
    dir: [0, -1, 0],
    name: "toothL",
  });
  b.part(new THREE.ConeGeometry(0.026, 0.08, 6), IVORY, {
    bone: jaw,
    at: jaw.local({ forward: 0.13, up: 0.06, right: -0.13 }),
    dir: [0, 1, 0],
    name: "toothR",
  });

  // Three stubborn hair tufts and a tiny leaf stuck to the shoulder.
  for (const [i, x] of [-0.16, 0, 0.16].entries()) {
    b.spike(head.local([x, 0.02, 0.38]), [x * 0.3, 0.7, -0.08], 0.2, 0.075, {
      bone: head,
      color: SKIN_DARK,
      name: `hairTuft${i}`,
    });
  }
  b.part(new THREE.SphereGeometry(1, 7, 5), GOLD, {
    bone: shoulders,
    at: shoulders.local({ forward: 0.28, up: 0.08, right: 0.24 }),
    scale: [0.09, 0.035, 0.14],
    rotation: [0, 25, -20],
    name: "shoulderLeaf",
  });

  // The club is rooted in the left hand, with a lumpy head and playful nail studs.
  const clubBase = armL.tip!;
  const clubPath = polyline([
    clubBase,
    clubBase.local({ forward: 0.28, up: 0.08 }),
    clubBase.local({ forward: 0.55, up: 0.2 }),
    clubBase.local({ forward: 0.72, up: 0.25 }),
  ]);
  const club = b.sweep(clubPath, [0.045, 0.06], {
    color: WOOD,
    section: { ngon: 7 },
    caps: "round",
    name: "clubHandle",
  });
  const clubHead = club.at(1);
  b.part(new THREE.SphereGeometry(1, 9, 7), WOOD_LIGHT, {
    bone: clubHead.bone!,
    at: clubHead.at,
    scale: [0.19, 0.25, 0.19],
    name: "clubHead",
  });
  for (const [i, dir] of [
    [0.8, 0.1, 0.2],
    [-0.7, 0.15, 0.1],
    [0.1, 0.9, -0.2],
    [0.1, -0.45, 0.75],
  ].entries()) {
    b.spike(clubHead, dir, 0.1, 0.035, { bone: clubHead.bone!, color: GOLD, name: `clubStud${i}` });
  }
  b.part(new THREE.SphereGeometry(1, 7, 5), WOOD_DARK, {
    bone: clubHead.bone!,
    at: clubHead.local({ forward: -0.12, up: 0.05 }),
    scale: [0.07, 0.05, 0.05],
    name: "clubDing",
  });

  return b.root;
}

