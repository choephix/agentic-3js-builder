import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  mottle,
  scales,
  countershade,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle with spread bat wings, horns, claws, fangs, and a carved cathedral ledge.",
};

const STONE = "#68636a";
const STONE_LIT = "#827b80";
const STONE_DARK = "#39363d";
const CREVICE = "#242128";
const EYE_GLOW = "#f2bd55";
const IRON = "#29262e";
const MOSS = "#52634a";
const LEDGE = "#4b4850";
const LEDGE_TOP = "#6d6870";

const stoneBase = mottle(STONE_DARK, STONE_LIT, { size: 0.22, contrast: 1.3, seed: 18 });
const stone = countershade(
  scales(stoneBase, CREVICE, { size: 0.075, width: 0.1, seed: 7 }),
  STONE_DARK,
  { level: -0.18, soft: 0.3 },
);
const wingStone = cel("#777177", "#47434b", { threshold: 0.08 });
const bellyStone = furEdge(stone, "#888086", {
  by: "position",
  axis: [0, 1, 0],
  level: 0.95,
  teeth: 0.12,
  period: 0.08,
  along: [1, 0, 0],
  ink: CREVICE,
  inkWidth: 0.004,
});
const eyeTexture = animeEye({ iris: EYE_GLOW, irisDark: "#65351b", blush: false, size: 384 });

const toothGeo = new THREE.ConeGeometry(0.032, 0.13, 6);
const clawGeo = new THREE.ConeGeometry(0.027, 0.15, 6);
const rivetGeo = new THREE.SphereGeometry(0.018, 6, 4);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  options: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, { at, ...options });
}

function claw(
  b: ReturnType<typeof createBuilder>,
  at: any,
  dir: [number, number, number],
  length = 0.13,
  color = CREVICE,
) {
  return b.spike(at, dir, length, 0.025, { color, caps: "point", section: { ngon: 6 } });
}

function runeCard(b: ReturnType<typeof createBuilder>, at: [number, number, number], w: number, h: number) {
  const rune = svg(
    `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 8 L40 108 M18 30 L62 30 M22 78 L58 78 M18 108 L62 108
               M40 30 L18 58 L40 78 L62 58 Z"
        fill="none" stroke="#e2b866" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="40" cy="58" r="8" fill="#f5d27a"/>
    </svg>`,
    { size: 128 },
  );
  return b.part(new THREE.PlaneGeometry(w, h), "#b79048", {
    at,
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    lift: 0.002,
  } as any);
}

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  // A simple stepped cathedral ledge: the subject's feet and tail overlap it slightly.
  box(b, [1.72, 0.18, 0.92], [0, 0.09, 0.02], LEDGE, { name: "ledge_base", group: "scenery" });
  box(b, [1.96, 0.16, 1.08], [0, 0.25, 0.02], LEDGE_TOP, { name: "ledge_cap", group: "scenery" });
  box(b, [1.76, 0.16, 0.88], [0, 0.41, -0.03], LEDGE, { name: "ledge_shadow", group: "scenery" });

  for (const x of [-0.72, -0.36, 0, 0.36, 0.72]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 6), STONE_DARK, {
      at: [x, 0.5, -0.43],
      dir: [0, 0, 1],
      name: "ledge_moulding",
      group: "scenery",
    });
  }
  for (const x of [-0.72, 0.72]) {
    b.part(new THREE.ConeGeometry(0.11, 0.2, 6), STONE_LIT, {
      at: [x, 0.56, -0.44],
      name: "ledge_finial",
      group: "scenery",
    });
  }

  // Skeleton first: crouched spine, neck, jaw, hips and expressive shoulders.
  const hips = b.joint("hips", { at: [0, 1.0, -0.02], dir: [0, 0.15, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, -0.08],
      [0, 1.08, 0.02],
      [0, 1.28, 0.12],
      [0, 1.43, 0.25],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest", "shoulderRoot"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.25],
      [0, 1.57, 0.34],
      [0, 1.7, 0.42],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.72, 0.44], dir: [0, 0.02, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.61, 0.59],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const shoulderL = b.joint("shoulderL", { parent: spine.tip, at: [0.27, 1.4, 0.24], dir: [0.65, 0.15, 0.25], role: "wing" });
  const shoulderR = b.joint("shoulderR", { parent: spine.tip, at: [-0.27, 1.4, 0.24], dir: [-0.65, 0.15, 0.25], role: "wing" });

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.27, 1.4, 0.25],
      [0.58, 1.62, 0.18],
      [0.98, 1.85, 0.02],
      [1.34, 1.95, -0.12],
    ]),
    { parent: shoulderL, names: ["wingL1", "wingL2", "wingL3", "wingLTip"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.27, 1.4, 0.25],
      [-0.58, 1.62, 0.18],
      [-0.98, 1.85, 0.02],
      [-1.34, 1.95, -0.12],
    ]),
    { parent: shoulderR, names: ["wingR1", "wingR2", "wingR3", "wingRTip"], role: "wing" },
  );

  const hindL = b.chain(
    "legL",
    catmull([
      [0.23, 1.02, -0.02],
      [0.42, 0.76, 0.16],
      [0.38, 0.53, 0.35],
      [0.28, 0.48, 0.55],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.28, 0.47, 0.55] },
  );
  const hindR = b.chain(
    "legR",
    catmull([
      [-0.23, 1.02, -0.02],
      [-0.42, 0.76, 0.16],
      [-0.38, 0.53, 0.35],
      [-0.28, 0.48, 0.55],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.28, 0.47, 0.55] },
  );

  const armL = b.chain(
    "armL",
    catmull([
      [0.33, 1.38, 0.3],
      [0.52, 1.15, 0.48],
      [0.48, 0.9, 0.62],
      [0.39, 0.67, 0.72],
    ]),
    { parent: shoulderL, names: ["armL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.33, 1.38, 0.3],
      [-0.52, 1.15, 0.48],
      [-0.48, 0.9, 0.62],
      [-0.39, 0.67, 0.72],
    ]),
    { parent: shoulderR, names: ["armR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.18],
      [0, 0.8, -0.48],
      [0.02, 0.68, -0.75],
      [0, 0.61, -1.02],
      [0.08, 0.59, -1.25],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // Main carved volumes.
  b.sweep(spine, (t) => 0.22 - t * 0.035, {
    color: bellyStone,
    section: "box",
    sides: 8,
    name: "heavy_chest",
    group: "body",
  });
  b.sweep(neck, [0.18, 0.13], { color: stone, section: { ngon: 7 }, name: "neck_mass", group: "body" });
  b.sweep(hindL, [0.14, 0.105], { color: stone, section: { ngon: 6 }, name: "thighL", group: "legs" });
  b.sweep(hindR, [0.14, 0.105], { color: stone, section: { ngon: 6 }, name: "thighR", group: "legs" });
  b.sweep(armL, [0.095, 0.055], { color: stone, section: { ngon: 6 }, name: "armL_mass", group: "arms" });
  b.sweep(armR, [0.095, 0.055], { color: stone, section: { ngon: 6 }, name: "armR_mass", group: "arms" });
  b.sweep(tail, [0.13, 0.018], {
    color: stone,
    section: { ngon: 7 },
    caps: { end: "point", start: "round" },
    name: "long_tail",
    group: "tail",
  });

  const skull = b.part(new THREE.SphereGeometry(0.24, 12, 8), stone, {
    bone: head,
    at: [0, 1.73, 0.46],
    scale: [1.05, 0.92, 1.08],
    name: "carved_skull",
    group: "head",
  });
  const muzzle = b.part(new THREE.SphereGeometry(0.16, 10, 7), bellyStone, {
    bone: jaw,
    at: [0, 1.59, 0.62],
    scale: [1.15, 0.7, 1.15],
    name: "muzzle",
    group: "face",
  });
  b.part(new THREE.BoxGeometry(0.19, 0.07, 0.025), CREVICE, {
    bone: jaw,
    at: [0, 1.61, 0.75],
    name: "open_mouth",
    group: "face",
  });

  // Eyes are deliberately oversized and luminous against the stone.
  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.105, 1.76, 0.665],
      dir: [0, 0.12, 1],
      up: [0, 1, 0],
      size: [0.105, 0.14],
      mirror: s > 0,
      lift: 0.006,
      name: s > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
    b.part(new THREE.SphereGeometry(0.027, 7, 5), CREVICE, {
      bone: head,
      at: [s * 0.105, 1.75, 0.69],
      scale: [1, 0.7, 0.4],
      name: "brow_ridge",
      group: "face",
    });
  }

  // Horns, ears and the angular brow silhouette.
  for (const s of [1, -1]) {
    const hornPath = catmull([
      [s * 0.14, 1.86, 0.42],
      [s * 0.2, 2.05, 0.32],
      [s * 0.27, 2.18, 0.2],
      [s * 0.22, 2.27, 0.1],
    ]);
    b.sweep(hornPath, [0.075, 0.008], {
      color: stone,
      caps: { start: "round", end: "point" },
      bone: head,
      name: s > 0 ? "hornL" : "hornR",
      group: "head",
    });
    b.extrude(
      [
        [0, 0],
        [0.13, 0.03],
        [0.16, 0.22],
        [0.05, 0.35],
        [-0.035, 0.14],
      ],
      {
        at: [s * 0.19, 1.78, 0.4],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        smoothing: 1,
        color: stone,
        bone: head,
        name: s > 0 ? "earL" : "earR",
        group: "head",
      },
    );
    b.spike([s * 0.12, 1.64, 0.73], [s * 0.1, 0.01, 0.11], 0.12, 0.035, {
      color: stone,
      bone: jaw,
      name: "cheek_fang",
      group: "face",
    });
  }

  // Fangs and lower jaw teeth.
  for (const s of [-1, -0.5, 0, 0.5, 1]) {
    const x = s * 0.085;
    b.part(toothGeo, "#d0c5aa", {
      bone: jaw,
      at: [x, 1.57, 0.745],
      rotation: [Math.PI, 0, 0],
      scale: [0.8, 0.9, 0.8],
      name: "fang",
      group: "face",
    });
  }

  // Bat-wing spars and membranes.
  for (const s of [1, -1]) {
    const wing = s > 0 ? wingL : wingR;
    const root = s > 0 ? wingL.at(0) : wingR.at(0);
    const w1 = s > 0 ? wingL.at(0.42) : wingR.at(0.42);
    const w2 = s > 0 ? wingL.at(0.72) : wingR.at(0.72);
    const tip = s > 0 ? wingL.at(1) : wingR.at(1);

    b.sweep(catmull([root.at, w1.at, w2.at, tip.at]), [0.06, 0.018], {
      color: wingStone,
      bone: wing,
      section: { ngon: 5 },
      name: s > 0 ? "wing_sparL" : "wing_sparR",
      group: "wings",
    });

    const lower = catmull([
      [s * 0.28, 1.37, 0.15],
      [s * 0.55, 1.2, 0.0],
      [s * 0.87, 1.12, -0.16],
      [s * 1.22, 1.02, -0.34],
    ]);
    const lowerChain = b.chain(
      s > 0 ? "wingLowerL" : "wingLowerR",
      lower,
      { parent: s > 0 ? shoulderL : shoulderR, names: s > 0 ? ["wingLowerL1", "wingLowerL2", "wingLowerL3", "wingLowerLTip"] : ["wingLowerR1", "wingLowerR2", "wingLowerR3", "wingLowerRTip"], role: "wing" },
    );
    b.sweep(lowerChain, [0.035, 0.012], {
      color: wingStone,
      section: { ngon: 5 },
      name: s > 0 ? "wing_lower_sparL" : "wing_lower_sparR",
      group: "wings",
    });
    b.membrane(wing, lowerChain, {
      color: wingStone,
      thickness: 0.012,
      rows: 4,
      cols: 8,
      scallop: 0.13,
      name: s > 0 ? "wing_membraneL" : "wing_membraneR",
      group: "wings",
    });

    // Three long finger bones make the silhouette unmistakably gargoyle-like.
    for (const [i, end] of [
      [[s * 0.86, 1.78, -0.02], [s * 1.47, 2.12, -0.3]],
      [[s * 0.98, 1.69, -0.04], [s * 1.58, 1.78, -0.48]],
      [[s * 1.02, 1.57, -0.08], [s * 1.45, 1.35, -0.58]],
    ] as any) {
      b.rod([s * 0.55, 1.52, 0.12], end, 0.024, {
        color: stone,
        bone: s > 0 ? shoulderL : shoulderR,
        name: `${s > 0 ? "wingL" : "wingR"}_finger${i}`,
        group: "wings",
      });
      claw(b, end, [s * 0.1, 0.05, -0.08], 0.11, STONE_DARK);
    }
  }

  // Feet with oversized talons gripping the ledge.
  for (const s of [1, -1]) {
    const foot = s > 0 ? hindL.tip : hindR.tip;
    for (let i = -1; i <= 1; i++) {
      const toe = foot.local([i * 0.052, 0.02, 0.09]);
      b.rod(foot.at, toe, 0.035, { color: stone, name: "foot_toe", group: "legs" });
      claw(b, toe, [i * 0.25, -0.18, 0.8], 0.16, CREVICE);
    }
    b.part(new THREE.SphereGeometry(0.11, 8, 5), stone, {
      bone: foot,
      at: foot.at,
      scale: [1.15, 0.55, 1.25],
      name: "stone_foot",
      group: "legs",
    });
  }

  // Hands and finger talons planted forward in a crouching pose.
  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    b.part(new THREE.SphereGeometry(0.085, 8, 5), stone, {
      bone: hand,
      at: hand.at,
      scale: [1.1, 0.55, 1.15],
      name: "hand_palm",
      group: "arms",
    });
    for (let i = -1; i <= 1; i++) {
      const toe = hand.local([i * 0.043, -0.01, 0.08]);
      b.rod(hand.at, toe, 0.022, { color: stone, name: "finger", group: "arms" });
      claw(b, toe, [i * 0.35, -0.15, 0.82], 0.12, CREVICE);
    }
  }

  // Carved ridges, belly plates, shoulder studs and a central chest rune.
  for (let i = 0; i < 6; i++) {
    const z = 0.06 + i * 0.075;
    b.part(new THREE.ConeGeometry(0.085 - i * 0.008, 0.11, 6), STONE_LIT, {
      bone: spine.joints[Math.min(i, spine.joints.length - 1)],
      at: [0, 1.07 + i * 0.075, z],
      rotation: [Math.PI / 2, 0, 0],
      name: "chest_keel",
      group: "carving",
    });
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(rivetGeo, STONE_LIT, {
        bone: spine.tip,
        at: [s * (0.22 + i * 0.025), 1.3 + i * 0.045, 0.3],
        name: "shoulder_rivet",
        group: "carving",
      });
    }
  }
  runeCard(b, [0, 1.34, 0.365], 0.11, 0.16);

  // Moss in protected ledge cracks and a few gothic stone chips.
  for (const p of [
    [-0.62, 0.45, -0.46],
    [-0.48, 0.46, -0.45],
    [0.52, 0.46, -0.45],
    [0.64, 0.45, -0.44],
    [0.82, 0.5, 0.17],
  ] as [number, number, number][]) {
    b.part(new THREE.ConeGeometry(0.025, 0.08, 5), MOSS, {
      at: p,
      rotation: [0.2, 0.4, -0.2],
      name: "moss",
      group: "scenery",
    });
  }
  for (const p of [
    [-0.7, 0.49, 0.26],
    [0.7, 0.49, -0.12],
    [-0.82, 0.49, -0.12],
  ] as [number, number, number][]) {
    b.part(new THREE.DodecahedronGeometry(0.035, 0), STONE_DARK, {
      at: p,
      name: "stone_chip",
      group: "scenery",
    });
  }

  return b.root;
}
