import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

const COAL = "#17151b";
const SCALE = "#302d35";
const SCALE_LIGHT = "#514a50";
const SCALE_HIGHLIGHT = "#77676b";
const BELLY = "#641d27";
const BELLY_LIGHT = "#9b3032";
const MOUTH = "#180b12";
const BONE = "#c4aa83";
const BONE_DARK = "#705943";
const BRONZE = "#80552e";
const BRONZE_LIGHT = "#b27a3b";
const IRON = "#252b32";
const IRON_LIGHT = "#4c5358";
const GOLD = "#d39a42";
const EYE = "#ffb52e";
const EYE_LIGHT = "#fff0a1";
const PUPIL = "#120b0b";
const CLAW = "#ded0a2";
const SCAR = "#c23a32";
const INK = "#08070a";

export const meta = {
  name: "five-headed hydra",
  description:
    "A towering five-headed hydra in a God of War-inspired low-poly style, with armored shoulders, heavy legs, open jaws, horns, spines, and five individually rigged necks.",
};

export const REQUESTS = [
  {
    id: "centralCrown",
    kind: "add",
    part: "headSkullCenter",
    what: "Build a brutal crown of three broad black-iron horns and small bronze riveted collars behind the central hydra head. Use BONE, BONE_DARK, BRONZE, and GOLD. Keep it angular and asymmetrical, with the tallest horn swept backward.",
    at: [0, 2.95, 1.02],
    normal: [0, 1, 0],
    bone: "headC",
    room: [0.75, 0.45, 0.45],
  },
  {
    id: "leftCrown",
    kind: "add",
    part: "headSkullL",
    what: "Add a matching but slightly smaller horn crown to the hydra's left outer head, with two broken-looking BONE horns, dark bronze collars, and tiny red war-paint cuts.",
    at: [1.34, 2.54, 0.76],
    normal: [0, 1, 0],
    bone: "headOL",
    room: [0.55, 0.38, 0.4],
  },
  {
    id: "rightCrown",
    kind: "add",
    part: "headSkullR",
    what: "Add a matching but slightly smaller horn crown to the hydra's right outer head, with two broken-looking BONE horns, dark bronze collars, and tiny red war-paint cuts.",
    at: [-1.34, 2.54, 0.76],
    normal: [0, 1, 0],
    bone: "headOR",
    room: [0.55, 0.38, 0.4],
  },
  {
    id: "throatChains",
    kind: "add",
    part: "neckCoatC",
    what: "Hang heavy bronze-and-iron chain ornaments down the front of all five throats. Each chain should have chunky links, a few pointed studs, and a dark red leather tie disappearing into the scales.",
    at: [0, 2.18, 0.86],
    normal: [0, 0, 1],
    bone: "neckC3",
    room: [1.65, 0.75, 0.28],
  },
  {
    id: "shoulderPauldronL",
    kind: "add",
    part: "shoulderArmorL",
    what: "Build a massive layered bronze shoulder pauldron on the hydra's left side: three overlapping plates, sharp lower teeth, dark seams, and large GOLD rivets. Keep it clear of the neck root.",
    at: [0.72, 1.32, 0.42],
    normal: [1, 0, 0],
    bone: "hips",
    room: [0.45, 0.62, 0.72],
  },
  {
    id: "shoulderPauldronR",
    kind: "add",
    part: "shoulderArmorR",
    what: "Build a massive layered bronze shoulder pauldron on the hydra's right side: three overlapping plates, sharp lower teeth, dark seams, and large GOLD rivets. Keep it clear of the neck root.",
    at: [-0.72, 1.32, 0.42],
    normal: [-1, 0, 0],
    bone: "hips",
    room: [0.45, 0.62, 0.72],
  },
  {
    id: "backRidge",
    kind: "add",
    part: "bodyCore",
    what: "Add a row of six broad black-iron dorsal plates from the shoulder to the rump, each edged in BONE and marked with a single SCAR-red notch. The plates should form a threatening silhouette without hiding the body scales.",
    at: [0, 1.53, -0.52],
    normal: [0, 1, 0],
    bone: "spine3",
    room: [0.8, 0.42, 1.45],
  },
  {
    id: "tailRelic",
    kind: "add",
    part: "tailCoat",
    what: "At the tail's upper curve, add a small ancient bronze reliquary plate with a glowing-looking amber inset, four rivets, and a short BONE spike on each side.",
    at: [0, 0.87, -1.56],
    normal: [0, 1, 0],
    bone: "tail3",
    room: [0.36, 0.3, 0.46],
  },
  {
    id: "clawBands",
    kind: "add",
    part: "pawFL",
    what: "Give every foot three thick CLAW talons with dark bronze nail guards and narrow red leather bands around the ankle. Repeat the same brutal motif on all four feet.",
    at: [0.82, 0.16, 0.57],
    normal: [0, 1, 0],
    bone: "pawFL",
    room: [0.48, 0.28, 0.62],
  },
  {
    id: "mouthEmbers",
    kind: "add",
    part: "jawC",
    what: "Build a deep ember-red glow assembly inside all five mouths: a faceted ember core, two smaller side sparks, and thin dark smoke-like spikes tucked behind the teeth. The glow must remain inside the open jaws.",
    at: [0, 2.62, 1.37],
    normal: [0, 0, 1],
    bone: "jawC",
    room: [0.32, 0.25, 0.18],
  },
  {
    id: "bodyScales",
    kind: "texture",
    part: "bodyCore",
    what: "Paint the main torso with large overlapping SCALE plates in SCALE, SCALE_LIGHT, and SCALE_HIGHLIGHT. Put BELLY and BELLY_LIGHT on the underside, with a subtle irregular transition and a few SCAR-red scratches near the shoulder.",
  },
  {
    id: "neckScales",
    kind: "texture",
    part: "neckCoatC",
    what: "Paint all five necks with broad armor-like scales: dark SCALE on the backs, SCALE_LIGHT on raised edges, and a continuous BELLY strip on the front of each throat. Keep the pattern bold and readable at a distance.",
  },
  {
    id: "headWarPaint",
    kind: "texture",
    part: "headSkullCenter",
    what: "Paint the five skulls with charcoal SCALE and warm SCALE_LIGHT planes, then add angular SCAR-red war-paint slashes around the brows and cheek plates. Leave the eyes, teeth, horns, and mouths clean.",
  },
  {
    id: "bronzePatina",
    kind: "texture",
    part: "shoulderArmorL",
    what: "Texture both shoulder pauldrons as battered BRONZE armor with BRONZE_LIGHT bevels, dark IRON seams, worn GOLD rivets, and a few small SCAR-red paint marks.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

type BoneLike = any;

function box(
  b: Builder,
  geometryName: string,
  at: THREE.Vector3 | [number, number, number],
  size: [number, number, number],
  color: string,
  bone?: BoneLike,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    rotation,
    flat: true,
    name: geometryName,
  });
}

function sphere(
  b: Builder,
  geometryName: string,
  at: THREE.Vector3 | [number, number, number],
  radius: number,
  scale: [number, number, number],
  color: string,
  bone?: BoneLike,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
    at,
    bone,
    scale,
    flat: true,
    name: geometryName,
  });
}

function plate(
  b: Builder,
  geometryName: string,
  at: THREE.Vector3 | [number, number, number],
  size: [number, number, number],
  color: string,
  bone?: BoneLike,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    rotation,
    flat: true,
    name: geometryName,
  });
}

function buildHydra() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 0.82 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted spine, one tail, five neck chains, five heads and five hinged jaws.
  // ---------------------------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 1.0, -0.42],
    dir: [0, 0, 1],
    role: "spine",
    group: "torso",
  });

  const bodyPath = catmull([
    [0, 0.98, -1.02],
    [0, 1.02, -0.62],
    [0, 1.08, -0.12],
    [0, 1.12, 0.36],
    [0, 1.14, 0.7],
  ]);

  const spine = b.chain("spine", bodyPath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
    group: "torso",
  });

  const tailPath = catmull([
    [0, 0.98, -0.82],
    [0, 0.9, -1.28],
    [0, 0.75, -1.7],
    [0, 0.59, -2.08],
    [0, 0.52, -2.34],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    group: "tail",
  });

  const neckSpecs = [
    {
      key: "OL",
      x: 1.18,
      root: [1.0, 1.17, 0.28] as [number, number, number],
      points: [
        [1.0, 1.17, 0.28],
        [1.06, 1.62, 0.43],
        [1.2, 2.08, 0.65],
        [1.34, 2.34, 0.88],
      ] as [number, number, number][],
      head: [1.34, 2.38, 0.9] as [number, number, number],
    },
    {
      key: "L",
      x: 0.62,
      root: [0.52, 1.2, 0.34] as [number, number, number],
      points: [
        [0.52, 1.2, 0.34],
        [0.58, 1.7, 0.52],
        [0.65, 2.17, 0.74],
        [0.66, 2.55, 0.94],
      ] as [number, number, number][],
      head: [0.66, 2.59, 0.96] as [number, number, number],
    },
    {
      key: "C",
      x: 0,
      root: [0, 1.22, 0.38] as [number, number, number],
      points: [
        [0, 1.22, 0.38],
        [0, 1.78, 0.59],
        [0, 2.28, 0.83],
        [0, 2.73, 1.0],
      ] as [number, number, number][],
      head: [0, 2.78, 1.02] as [number, number, number],
    },
    {
      key: "R",
      x: -0.62,
      root: [-0.52, 1.2, 0.34] as [number, number, number],
      points: [
        [-0.52, 1.2, 0.34],
        [-0.58, 1.7, 0.52],
        [-0.65, 2.17, 0.74],
        [-0.66, 2.55, 0.94],
      ] as [number, number, number][],
      head: [-0.66, 2.59, 0.96] as [number, number, number],
    },
    {
      key: "OR",
      x: -1.18,
      root: [-1.0, 1.17, 0.28] as [number, number, number],
      points: [
        [-1.0, 1.17, 0.28],
        [-1.06, 1.62, 0.43],
        [-1.2, 2.08, 0.65],
        [-1.34, 2.34, 0.88],
      ] as [number, number, number][],
      head: [-1.34, 2.38, 0.9] as [number, number, number],
    },
  ];

  const necks: Record<string, any> = {};
  const heads: Record<string, any> = {};
  const jaws: Record<string, any> = {};

  for (const spec of neckSpecs) {
    const names = [`neck${spec.key}1`, `neck${spec.key}2`, `neck${spec.key}3`, `neck${spec.key}4`];
    const neck = b.chain(`neck${spec.key}`, catmull(spec.points), {
      parent: hips,
      names,
      role: "neck",
      group: "heads",
    });
    necks[spec.key] = neck;

    const head = b.joint(`head${spec.key}`, {
      parent: neck.tip,
      at: spec.head,
      dir: [0, 0, 1],
      role: "head",
      group: "heads",
    });
    heads[spec.key] = head;

    const jaw = b.joint(`jaw${spec.key}`, {
      parent: head,
      at: head.local([0, 0.18, -0.1]),
      aim: head.local([0, 0.5, -0.22]),
      role: "jaw",
      group: "heads",
    });
    jaws[spec.key] = jaw;
  }

  const legSpecs = [
    {
      key: "FL",
      root: [0.68, 1.03, 0.42] as [number, number, number],
      target: [0.82, 0.18, 0.57] as [number, number, number],
      bends: [[0, 0, 1], [0, 0, -1]] as [number, number, number][],
    },
    {
      key: "FR",
      root: [-0.68, 1.03, 0.42] as [number, number, number],
      target: [-0.82, 0.18, 0.57] as [number, number, number],
      bends: [[0, 0, 1], [0, 0, -1]] as [number, number, number][],
    },
    {
      key: "HL",
      root: [0.72, 1.0, -0.5] as [number, number, number],
      target: [0.84, 0.18, -0.62] as [number, number, number],
      bends: [[0, 0, -1], [0, 0, 1]] as [number, number, number][],
    },
    {
      key: "HR",
      root: [-0.72, 1.0, -0.5] as [number, number, number],
      target: [-0.84, 0.18, -0.62] as [number, number, number],
      bends: [[0, 0, -1], [0, 0, 1]] as [number, number, number][],
    },
  ];

  const legs: Record<string, any> = {};

  for (const spec of legSpecs) {
    const points = limb(spec.root, spec.target, [0.38, 0.43, 0.29], spec.bends);
    const leg = b.chain(`leg${spec.key}`, points, {
      parent: hips,
      names: [`hip${spec.key}`, `knee${spec.key}`, `ankle${spec.key}`, `paw${spec.key}`],
      role: "leg",
      contact: spec.target,
      group: "legs",
    });
    legs[spec.key] = leg;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main body, belly, tail, neck tubes, and broad dorsal silhouette.
  // ---------------------------------------------------------------------------------------------------------------

  const body = b.sweep(spine, (t: number) => [0.57 - 0.08 * t, 0.48 - 0.06 * t], {
    bone: spine,
    color: SCALE,
    section: "circle",
    sides: 8,
    smooth: false,
    sectors: [[122, 238, BELLY]],
    name: "bodyCore",
    group: "torso",
  });

  b.sweep(spine, (t: number) => [0.45 - 0.07 * t, 0.39 - 0.04 * t], {
    bone: spine,
    color: SCALE_LIGHT,
    section: { ngon: 8 },
    caps: "none",
    from: 0.08,
    to: 0.91,
    sectors: [[130, 230, BELLY_LIGHT]],
    name: "bodyHighlight",
    group: "torso",
  });

  const tailTube = b.sweep(tail, (t: number) => 0.25 * (1 - t) + 0.045, {
    bone: tail,
    color: SCALE,
    section: "circle",
    sides: 8,
    smooth: false,
    sectors: [[125, 235, BELLY]],
    name: "tailCoat",
    group: "tail",
  });

  const neckTubes: Record<string, any> = {};

  for (const spec of neckSpecs) {
    const neck = necks[spec.key];
    const tube = b.sweep(neck, (t: number) => 0.28 * (1 - t) + 0.105, {
      bone: neck,
      color: SCALE,
      section: "circle",
      sides: 8,
      smooth: false,
      sectors: [[124, 236, BELLY]],
      name: `neckCoat${spec.key}`,
      group: "heads",
    });
    neckTubes[spec.key] = tube;
  }

  // Dorsal bone ridges over the torso and tail.
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.115;
    const ridge = body.at(t, 0);
    b.spike(ridge, ridge, 0.17 - i * 0.006, 0.055, {
      color: BONE,
      bone: ridge.bone,
      name: `bodySpine${i}`,
      group: "torso",
    });
  }

  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.17;
    const ridge = tailTube.at(t, 0);
    b.spike(ridge, ridge, 0.13 - i * 0.018, 0.042, {
      color: BONE_DARK,
      bone: ridge.bone,
      name: `tailSpine${i}`,
      group: "tail",
    });
  }

  // Neck ridges and lateral throat scales.
  for (const spec of neckSpecs) {
    const tube = neckTubes[spec.key];
    for (let i = 0; i < 4; i++) {
      const t = 0.24 + i * 0.18;
      const dorsal = tube.at(t, 0);
      b.spike(dorsal, dorsal, 0.13 - i * 0.015, 0.042, {
        color: BONE,
        bone: dorsal.bone,
        name: `neckRidge${spec.key}${i}`,
        group: "heads",
      });

      const leftScale = tube.at(t, 72);
      b.spike(leftScale, leftScale, 0.075, 0.033, {
        color: SCALE_HIGHLIGHT,
        bone: leftScale.bone,
        name: `neckScaleL${spec.key}${i}`,
        group: "heads",
      });

      const rightScale = tube.at(t, -72);
      b.spike(rightScale, rightScale, 0.075, 0.033, {
        color: SCALE_HIGHLIGHT,
        bone: rightScale.bone,
        name: `neckScaleR${spec.key}${i}`,
        group: "heads",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Heavy legs, feet, iron cuffs, shoulder blocks, and claws.
  // ---------------------------------------------------------------------------------------------------------------

  for (const spec of legSpecs) {
    const leg = legs[spec.key];
    const legSide = spec.key.endsWith("L") ? 1 : -1;

    b.sweep(leg, (t: number) => 0.145 - 0.035 * t, {
      bone: leg,
      color: SCALE,
      section: { ngon: 6 },
      smooth: false,
      name: `legCoat${spec.key}`,
      group: "legs",
    });

    const knee = leg.at(0.34);
    b.part(new THREE.CylinderGeometry(0.17, 0.185, 0.075, 8), BRONZE, {
      at: knee.at,
      dir: knee.tangent,
      bone: knee.bone,
      flat: true,
      name: `kneeCuff${spec.key}`,
      group: "legs",
    });

    const ankle = leg.at(0.72);
    b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.065, 8), IRON, {
      at: ankle.at,
      dir: ankle.tangent,
      bone: ankle.bone,
      flat: true,
      name: `ankleCuff${spec.key}`,
      group: "legs",
    });

    const paw = leg.tip;
    sphere(
      b,
      `paw${spec.key}`,
      paw.at,
      0.19,
      [1.2, 0.62, 1.35],
      SCALE_LIGHT,
      paw,
    );

    plate(
      b,
      `pawArmor${spec.key}`,
      paw.at.clone().add(new THREE.Vector3(0, 0.075, 0.025)),
      [0.27, 0.07, 0.27],
      BRONZE,
      paw,
      [0, 0, 0],
    );

    for (let toe = -1; toe <= 1; toe++) {
      const base = paw.at.clone().add(new THREE.Vector3(toe * 0.095, -0.025, 0.08));
      b.spike(base, [0, -0.08, 1], 0.2, 0.047, {
        color: CLAW,
        bone: paw,
        name: `claw${spec.key}${toe + 1}`,
        group: "legs",
      });
      const guard = base.clone().add(new THREE.Vector3(0, 0.015, -0.025));
      b.part(new THREE.ConeGeometry(0.052, 0.055, 6), BRONZE_LIGHT, {
        at: guard,
        bone: paw,
        dir: [0, 0, 1],
        flat: true,
        name: `clawGuard${spec.key}${toe + 1}`,
        group: "legs",
      });
    }

    // Small side spurs make the silhouette more predatory.
    const spurBase = paw.at.clone().add(new THREE.Vector3(legSide * 0.13, 0.03, -0.03));
    b.spike(spurBase, [legSide * 0.7, 0.15, -0.2], 0.14, 0.035, {
      color: BONE_DARK,
      bone: paw,
      name: `pawSpur${spec.key}`,
      group: "legs",
    });
  }

  // Broad shoulder masses and layered side armor.
  for (const s of [1, -1]) {
    const shoulder = new THREE.Vector3(s * 0.56, 1.22, 0.38);
    sphere(b, `shoulderMass${s > 0 ? "L" : "R"}`, shoulder, 0.24, [1.25, 1.05, 1.3], SCALE, hips);

    plate(
      b,
      `shoulderArmor${s > 0 ? "L" : "R"}`,
      [s * 0.65, 1.29, 0.38],
      [0.13, 0.48, 0.56],
      BRONZE,
      hips,
      [0, 0, s * 7],
    );
    plate(
      b,
      `shoulderArmorEdge${s > 0 ? "L" : "R"}`,
      [s * 0.72, 1.17, 0.48],
      [0.1, 0.31, 0.42],
      BRONZE_LIGHT,
      hips,
      [0, 0, s * 12],
    );
    for (let i = 0; i < 3; i++) {
      sphere(
        b,
        `shoulderRivet${s > 0 ? "L" : "R"}${i}`,
        [s * 0.735, 1.36 - i * 0.12, 0.22 + i * 0.1],
        0.034,
        [1, 1, 1],
        GOLD,
        hips,
      );
    }
  }

  // Rib plates leave the central side surfaces plain for Stage 2 texture work.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      plate(
        b,
        `ribPlate${s > 0 ? "L" : "R"}${i}`,
        [s * 0.54, 1.04 + i * 0.13, -0.28 + i * 0.27],
        [0.075, 0.105, 0.27],
        i === 1 ? BRONZE_LIGHT : BRONZE,
        hips,
        [0, s * 12, s * 5],
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Five angular heads: skull, brows, eyes, upper jaw, lower jaw, teeth, noses, horns, cheek plates, and crests.
  // ---------------------------------------------------------------------------------------------------------------

  const crestOutline: [number, number, "sharp"][] = [
    [-0.24, 0],
    [-0.18, 0.18],
    [-0.08, 0.34],
    [0, 0.43],
    [0.09, 0.31],
    [0.2, 0.17],
    [0.25, 0],
  ];

  for (const spec of neckSpecs) {
    const key = spec.key;
    const head = heads[key];
    const jaw = jaws[key];
    const side = spec.x === 0 ? 0 : spec.x > 0 ? 1 : -1;
    const tag = key;

    sphere(b, `headSkull${tag}`, head.at, 0.34, [1.08, 0.93, 1.18], SCALE, head);
    sphere(
      b,
      `headCrownPlane${tag}`,
      head.local([0, -0.02, 0.16]),
      0.27,
      [1.08, 0.62, 1.18],
      SCALE_LIGHT,
      head,
    );

    b.extrude(crestOutline, {
      at: head.local([0, -0.22, 0.03]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.008,
      color: BONE_DARK,
      bone: head,
      name: `headCrest${tag}`,
      group: "heads",
    });

    // Upper muzzle and a separate lower jaw give the mouth a clear hinge.
    b.frustumBox(
      head.local([0, 0.13, 0.01]),
      head.local([0, 0.55, -0.02]),
      [0.39, 0.34],
      [0.27, 0.24],
      {
        color: SCALE_LIGHT,
        bone: head,
        section: "box",
        name: `upperMuzzle${tag}`,
        group: "heads",
      },
    );

    b.frustumBox(
      jaw.at,
      head.local([0, 0.57, -0.19]),
      [0.3, 0.19],
      [0.19, 0.115],
      {
        color: BELLY,
        bone: jaw,
        section: "box",
        name: `lowerJaw${tag}`,
        group: "heads",
      },
    );

    box(
      b,
      `mouth${tag}`,
      head.local([0, 0.43, -0.105]),
      [0.38, 0.1, 0.31],
      MOUTH,
      jaw,
    );

    sphere(b, `nose${tag}`, head.local([0, 0.61, -0.015]), 0.105, [1.35, 0.65, 0.82], IRON, head);

    for (const s of [1, -1]) {
      sphere(
        b,
        `nostril${tag}${s > 0 ? "L" : "R"}`,
        head.local([s * 0.058, 0.67, 0.025]),
        0.026,
        [1, 0.6, 0.7],
        PUPIL,
        head,
      );

      // Large amber eyes and inset pupils.
      sphere(
        b,
        `eye${tag}${s > 0 ? "L" : "R"}`,
        head.local([s * 0.185, 0.235, 0.12]),
        0.082,
        [1.0, 0.72, 1.12],
        EYE,
        head,
      );
      sphere(
        b,
        `pupil${tag}${s > 0 ? "L" : "R"}`,
        head.local([s * 0.185, 0.298, 0.12]),
        0.039,
        [0.7, 0.42, 1.18],
        PUPIL,
        head,
      );
      sphere(
        b,
        `eyeGlint${tag}${s > 0 ? "L" : "R"}`,
        head.local([s * 0.16, 0.326, 0.151]),
        0.014,
        [1, 0.55, 1],
        EYE_LIGHT,
        head,
      );

      // Heavy brow blades.
      b.rod(
        head.local([s * 0.09, 0.18, 0.18]),
        head.local([s * 0.29, 0.2, 0.21]),
        0.048,
        {
          color: COAL,
          bone: head,
          name: `brow${tag}${s > 0 ? "L" : "R"}`,
          group: "heads",
        },
      );

      // Cheek armor and two swept horns per side.
      sphere(
        b,
        `cheek${tag}${s > 0 ? "L" : "R"}`,
        head.local([s * 0.28, 0.2, -0.015]),
        0.15,
        [0.7, 1.05, 1.3],
        BRONZE,
        head,
      );

      const hornBase = head.local([s * 0.22, -0.05, 0.17]);
      b.spike(hornBase, [s * 0.55, -0.18, 0.65], 0.34, 0.07, {
        color: BONE,
        bone: head,
        name: `hornOuter${tag}${s > 0 ? "L" : "R"}`,
        group: "heads",
      });

      const rearHornBase = head.local([s * 0.12, -0.18, 0.19]);
      b.spike(rearHornBase, [s * 0.2, -0.32, 0.8], 0.28, 0.06, {
        color: BONE_DARK,
        bone: head,
        name: `hornRear${tag}${s > 0 ? "L" : "R"}`,
        group: "heads",
      });
    }

    // A central crown horn makes each head distinct without merging the silhouettes.
    const crownBase = head.local([0, -0.18, 0.2]);
    b.spike(crownBase, [0, -0.45, 0.62], 0.27, 0.062, {
      color: BONE,
      bone: head,
      name: `hornCrown${tag}`,
      group: "heads",
    });

    // Four upper teeth and three lower teeth, all separated from the jaw geometry.
    for (let i = 0; i < 4; i++) {
      const x = -0.18 + i * 0.12;
      b.spike(head.local([x, 0.43 + (i % 2) * 0.035, -0.105]), [0, -1, 0], 0.14, 0.034, {
        color: CLAW,
        bone: head,
        name: `upperTooth${tag}${i}`,
        group: "heads",
      });
    }

    for (let i = 0; i < 3; i++) {
      const x = -0.13 + i * 0.13;
      b.spike(head.local([x, 0.45, -0.19]), [0, 1, 0], 0.105, 0.03, {
        color: CLAW,
        bone: jaw,
        name: `lowerTooth${tag}${i}`,
        group: "heads",
      });
    }

    // Small iron neck guards anchor each skull visually to its neck.
    const guard = neckTubes[key].at(0.88, 0);
    b.spike(guard, guard, 0.1, 0.05, {
      color: IRON,
      bone: guard.bone,
      name: `headGuard${tag}`,
      group: "heads",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Small structural details that sell the God of War scale without filling the Stage 2 rooms.
  // ---------------------------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    // Belt-like iron plates over the lower torso.
    for (let i = 0; i < 4; i++) {
      plate(
        b,
        `bellyGuard${s > 0 ? "L" : "R"}${i}`,
        [s * 0.41, 0.76 + i * 0.09, -0.34 + i * 0.18],
        [0.07, 0.08, 0.2],
        IRON,
        hips,
        [0, s * 8, 0],
      );
    }

    // Large bronze side blades behind the shoulders.
    b.extrude(
      [
        [0, 0],
        [0.25, 0.04],
        [0.19, 0.2],
        [0.08, 0.34],
        [0, 0.18],
      ],
      {
        at: [s * 0.63, 1.12, 0.02],
        x: [0, 0, 1],
        y: [s * 0.15, 1, 0],
        thickness: 0.045,
        bevel: 0.006,
        color: BRONZE,
        bone: hips,
        name: `sideBlade${s > 0 ? "L" : "R"}`,
        group: "torso",
      },
    );
  }

  // A dark iron throat collar around each neck root, built as a small row of plates.
  for (const spec of neckSpecs) {
    const neck = necks[spec.key];
    const ring = b.ring(neck.at(0.18), {
      count: 8,
      radius: 0.255,
      fromDeg: 0,
      toDeg: 360,
      name: `throatRing${spec.key}`,
      role: "fan",
      group: "heads",
    });
    for (let i = 0; i < ring.items.length; i++) {
      const item = ring.items[i];
      b.part(new THREE.ConeGeometry(0.045, 0.075, 6), IRON, {
        frame: item,
        bone: item.bone,
        name: `throatStud${spec.key}${i}`,
        group: "heads",
        flat: true,
      });
    }
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

export default function build() {
  return buildHydra();
}
