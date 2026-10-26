import * as THREE from "three";
import { type Builder, createBuilder, catmull, countershade, limb, paint, scales, type ColorInput, line, polyline, frame, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

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

const BODY_SCALE_PLATES = scales(
  [SCALE, SCALE_LIGHT, SCALE_HIGHLIGHT],
  COAL,
  { size: 0.19, width: 0.13, seed: 101 },
);

const BODY_PAINT = paint((p, n, s) => {
  if (n.y < -0.32) return n.y < -0.68 ? BELLY_LIGHT : BELLY;

  const shoulderScratchA =
    s[0] > 0.68 &&
    s[0] < 0.94 &&
    n.z > -0.15 &&
    Math.abs(Math.sin(p.x * 33 + p.y * 19 + p.z * 11)) > 0.975;
  const shoulderScratchB =
    s[0] > 0.72 &&
    s[0] < 0.9 &&
    n.z > 0.18 &&
    Math.abs(Math.sin(p.x * 21 - p.y * 29 + p.z * 17)) > 0.982;

  return shoulderScratchA || shoulderScratchB ? SCAR : BODY_SCALE_PLATES;
});

const NECK_SCALE_PLATES = scales(
  [SCALE, SCALE_LIGHT, SCALE_HIGHLIGHT],
  COAL,
  { size: 0.14, width: 0.15, seed: 202 },
);

const NECK_PAINT = paint((_p, n, s) => {
  const throatFront =
    n.z > 0.22 ||
    (s[1] > 110 && s[1] < 250 && n.y < 0.15);

  if (throatFront) return n.y < -0.45 ? BELLY_LIGHT : BELLY;
  return n.y > 0.45 ? SCALE_LIGHT : NECK_SCALE_PLATES;
});

const HEAD_SCALE_PLANES = scales(
  [SCALE, SCALE_LIGHT, SCALE_HIGHLIGHT],
  COAL,
  { size: 0.105, width: 0.14, seed: 303 },
);

const HEAD_PAINT = paint((p, n) => {
  const slashOne =
    p.z > 0.86 &&
    p.y > 2.24 &&
    p.y < 2.92 &&
    n.z > -0.15 &&
    Math.abs(Math.sin(p.x * 15 + p.y * 19 + p.z * 7)) < 0.105;

  const slashTwo =
    p.z > 0.9 &&
    p.y > 2.3 &&
    p.y < 2.86 &&
    n.z > 0.05 &&
    Math.abs(Math.sin(p.x * 11 - p.y * 20 + p.z * 8)) < 0.095;

  return slashOne || slashTwo ? SCAR : HEAD_SCALE_PLANES;
});

const SHOULDER_PAINT = paint((p, n, s) => {
  const u = s[0];
  const v = s[1];

  if (n.y > 0.52 || n.z > 0.7) return BRONZE_LIGHT;

  const seam =
    Math.abs(u - 0.5) < 0.018 ||
    Math.abs(v - 0.5) < 0.018;
  if (seam) return IRON;

  const rivet =
    Math.hypot(u - 0.25, v - 0.25) < 0.045 ||
    Math.hypot(u - 0.75, v - 0.25) < 0.045 ||
    Math.hypot(u - 0.25, v - 0.75) < 0.045 ||
    Math.hypot(u - 0.75, v - 0.75) < 0.045;
  if (rivet) return GOLD;

  const warMark =
    n.z > 0.15 &&
    Math.abs(Math.sin(p.x * 23 + p.y * 17 + p.z * 11)) > 0.985;
  if (warMark) return SCAR;

  return BRONZE;
});

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
  color: ColorInput,
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
  color: ColorInput,
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
  color: ColorInput,
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

  const body = b.sweep(spine, (t: number) => [0.57 - 0.08 * t, 0.48 - 0.06 * t], {
    bone: spine,
    color: BODY_PAINT,
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
      color: NECK_PAINT,
      section: "circle",
      sides: 8,
      smooth: false,
      sectors: [[124, 236, BELLY]],
      name: `neckCoat${spec.key}`,
      group: "heads",
    });
    neckTubes[spec.key] = tube;
  }

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

    const spurBase = paw.at.clone().add(new THREE.Vector3(legSide * 0.13, 0.03, -0.03));
    b.spike(spurBase, [legSide * 0.7, 0.15, -0.2], 0.14, 0.035, {
      color: BONE_DARK,
      bone: paw,
      name: `pawSpur${spec.key}`,
      group: "legs",
    });
  }

  for (const s of [1, -1]) {
    const shoulder = new THREE.Vector3(s * 0.56, 1.22, 0.38);
    sphere(b, `shoulderMass${s > 0 ? "L" : "R"}`, shoulder, 0.24, [1.25, 1.05, 1.3], SCALE, hips);

    plate(
      b,
      `shoulderArmor${s > 0 ? "L" : "R"}`,
      [s * 0.65, 1.29, 0.38],
      [0.13, 0.48, 0.56],
      SHOULDER_PAINT,
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
    const tag = key;

    sphere(b, `headSkull${tag}`, head.at, 0.34, [1.08, 0.93, 1.18], HEAD_PAINT, head);
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

    const crownBase = head.local([0, -0.18, 0.2]);
    b.spike(crownBase, [0, -0.45, 0.62], 0.27, 0.062, {
      color: BONE,
      bone: head,
      name: `hornCrown${tag}`,
      group: "heads",
    });

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

    const guard = neckTubes[key].at(0.88, 0);
    b.spike(guard, guard, 0.1, 0.05, {
      color: IRON,
      bone: guard.bone,
      name: `headGuard${tag}`,
      group: "heads",
    });
  }

  for (const s of [1, -1]) {
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCentralCrown(b: Builder) {
  const BONE_TIP = BONE;
  const crownBone = "headC";

  const toVec = (p: readonly [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2]);

  const horns = [
    {
      name: "s21HornC",
      points: [
        [0.0, 2.93, 0.93],
        [-0.015, 3.005, 0.895],
        [0.035, 3.085, 0.855],
        [0.095, 3.145, 0.835],
      ] as [number, number, number][],
    },
    {
      name: "s21HornL",
      points: [
        [0.13, 2.94, 0.925],
        [0.155, 3.005, 0.89],
        [0.215, 3.075, 0.855],
        [0.275, 3.115, 0.87],
      ] as [number, number, number][],
    },
    {
      name: "s21HornR",
      points: [
        [-0.135, 2.945, 0.93],
        [-0.175, 3.005, 0.895],
        [-0.235, 3.065, 0.865],
        [-0.285, 3.105, 0.89],
      ] as [number, number, number][],
    },
  ];

  // A jagged iron crown plate anchors the three horns visually behind the skull.
  b.extrude(
    [
      [-0.3, 0],
      [-0.285, 0.095],
      [-0.19, 0.17],
      [-0.075, 0.125],
      [0.0, 0.235],
      [0.075, 0.135],
      [0.19, 0.18],
      [0.285, 0.1],
      [0.3, 0],
    ],
    {
      at: [0, 2.87, 0.82],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.038,
      bevel: 0.006,
      color: IRON,
      bone: crownBone,
      name: "s21CrownBackplate",
      group: "crown",
    },
  );

  // Bone-colored edge teeth on the crown plate.
  for (const x of [-0.22, -0.11, 0.0, 0.11, 0.22]) {
    b.spike(
      [x, 3.005 + (x === 0 ? 0.03 : 0), 0.842],
      [0, 1, 0],
      x === 0 ? 0.09 : 0.065,
      0.018,
      {
        color: BONE_DARK,
        bone: crownBone,
        name: `s21PlateTooth${x.toFixed(2).replace("-", "m")}`,
        group: "crown",
      },
    );
  }

  const hornSweeps: { sweep: any; base: THREE.Vector3; axis: THREE.Vector3; name: string }[] = [];

  for (const horn of horns) {
    const base = toVec(horn.points[0]);
    const first = toVec(horn.points[1]);
    const axis = first.clone().sub(base).normalize();

    const sweep = b.sweep(polyline(horn.points), [0.086, 0.008], {
      bone: crownBone,
      color: IRON,
      section: { ngon: 6 },
      caps: { start: "round", end: "point" },
      smooth: false,
      sectors: [[-42, 42, IRON_LIGHT]],
      bands: [
        [0.7, BONE_DARK],
        [1, BONE_TIP],
      ],
      name: horn.name,
      group: "crown",
    });

    hornSweeps.push({ sweep, base, axis, name: horn.name });

    const collarCenter = base.clone().addScaledVector(axis, 0.032);

    b.part(new THREE.CylinderGeometry(0.108, 0.098, 0.068, 8), BRONZE, {
      at: collarCenter,
      dir: axis,
      bone: crownBone,
      flat: true,
      name: `${horn.name}Collar`,
      group: "crown",
    });

    const firstBand = base.clone().addScaledVector(axis, 0.018);
    const secondBand = base.clone().addScaledVector(axis, 0.073);

    for (const [i, p] of [firstBand, secondBand].entries()) {
      b.part(new THREE.TorusGeometry(0.096, 0.012, 6, 10), BRONZE_LIGHT, {
        at: p,
        dir: axis,
        axis: "z",
        bone: crownBone,
        flat: true,
        name: `${horn.name}Band${i}`,
        group: "crown",
      });
    }

    // Six chunky gold rivets around each bronze collar.
    const rivets = b.ring(
      line(base, first),
      {
        count: 6,
        radius: 0.105,
        fromDeg: 0,
        toDeg: 360,
        group: "crown",
      },
      (item: any) =>
        b.part(new THREE.SphereGeometry(0.019, 6, 4), GOLD, {
          frame: item,
          bone: crownBone,
          flat: true,
          name: `${horn.name}Rivet${item.i}`,
          group: "crown",
        }),
    );

    // A second, smaller rivet row gives the collar a hammered-warband edge.
    b.ring(
      line(base.clone().addScaledVector(axis, 0.055), first),
      {
        count: 6,
        radius: 0.101,
        fromDeg: 30,
        toDeg: 390,
        group: "crown",
      },
      (item: any) =>
        b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, {
          frame: item,
          bone: crownBone,
          flat: true,
          name: `${horn.name}FineRivet${item.i}`,
          group: "crown",
        }),
    );

    // Angular bone barbs break up the smooth horn silhouette.
    for (const [i, t] of [0.34, 0.52].entries()) {
      const barb = sweep.at(t, i === 0 ? 72 : -72, 0.002);
      b.spike(barb, barb, 0.045 - i * 0.008, 0.014, {
        color: BONE_DARK,
        bone: crownBone,
        name: `${horn.name}Barb${i}`,
        group: "crown",
      });
    }

    // Small iron wedges sit between the horn and its collar like forged sockets.
    const socket = base.clone().addScaledVector(axis, 0.09);
    b.part(new THREE.ConeGeometry(0.065, 0.05, 6), IRON_LIGHT, {
      at: socket,
      dir: axis,
      bone: crownBone,
      flat: true,
      name: `${horn.name}Socket`,
      group: "crown",
    });
  }

  // Bronze struts run from the rear plate into the horn sockets.
  const struts: [THREE.Vector3, THREE.Vector3, string][] = [
    [new THREE.Vector3(-0.2, 3.02, 0.84), toVec(horns[1].points[0]), "L"],
    [new THREE.Vector3(0.0, 3.055, 0.84), toVec(horns[0].points[0]), "C"],
    [new THREE.Vector3(0.2, 3.025, 0.84), toVec(horns[2].points[0]), "R"],
  ];

  for (const [a, z, tag] of struts) {
    b.rod(a, z, 0.019, {
      color: BRONZE,
      bone: crownBone,
      name: `s21CrownStrut${tag}`,
      group: "crown",
    });

    const mid = a.clone().lerp(z, 0.52);
    b.part(new THREE.SphereGeometry(0.026, 6, 4), GOLD, {
      at: mid,
      bone: crownBone,
      flat: true,
      name: `s21StrutRivet${tag}`,
      group: "crown",
    });
  }

  // A faceted gold war emblem crowns the center of the backplate.
  b.part(new THREE.ConeGeometry(0.048, 0.026, 6), GOLD, {
    at: [0, 3.005, 0.846],
    dir: [0, 0, 1],
    bone: crownBone,
    flat: true,
    name: "s21CrownEmblem",
    group: "crown",
  });

  // Three tiny bone chips sit on the outer faces like old battlefield repairs.
  for (const [i, point] of [
    [0.23, 3.035, 0.84],
    [-0.24, 3.02, 0.845],
    [0.065, 3.075, 0.845],
  ].entries()) {
    b.spike(point as [number, number, number], [0, 0, 1], 0.032, 0.011, {
      color: BONE,
      bone: crownBone,
      name: `s21CrownChip${i}`,
      group: "crown",
    });
  }
}
    return addCentralCrown;
  })(),
);
// add2
STAGE2.push(
  (() => {
function v(p: [number, number, number]) {
  return new THREE.Vector3(p[0], p[1], p[2]);
}

function midpoint(a: THREE.Vector3, b: THREE.Vector3) {
  return a.clone().add(b).multiplyScalar(0.5);
}

function collar(
  b: Builder,
  name: string,
  a: THREE.Vector3,
  c: THREE.Vector3,
  radius: number,
  color: string,
  bone: any,
) {
  const axis = c.clone().sub(a);
  const center = midpoint(a, c);
  return b.part(new THREE.CylinderGeometry(radius, radius * 1.04, axis.length(), 8, 1), color, {
    at: center,
    dir: axis,
    bone,
    flat: true,
    name,
    group: "s22-crowns",
  });
}

function addLeftCrown(b: Builder) {
  // The supplied stage-two assignment contains the two mirrored outer crowns.
  // s = +1 is the creature's left, which is +X in model space.
  for (const s of [1, -1]) {
    const sideName = s > 0 ? "L" : "R";
    const headName = s > 0 ? "headOL" : "headOR";

    const cx = 1.34 * s;

    const crown = b.joint(`s22Crown${sideName}`, {
      parent: headName,
      at: [cx, 2.535, 0.78],
      dir: [0, 1, 0],
      role: "fan",
      group: "s22-crowns",
    });

    const horns = [
      {
        id: "outer",
        base: v([cx + s * 0.105, 2.545, 0.785]),
        shoulder: v([cx + s * 0.12, 2.595, 0.745]),
        breakAt: v([cx + s * 0.105, 2.655, 0.695]),
        tipDir: [s * 0.12, 0.72, -0.3] as [number, number, number],
      },
      {
        id: "inner",
        base: v([cx - s * 0.105, 2.55, 0.80]),
        shoulder: v([cx - s * 0.12, 2.605, 0.765]),
        breakAt: v([cx - s * 0.095, 2.66, 0.715]),
        tipDir: [s * -0.08, 0.78, -0.22] as [number, number, number],
      },
    ];

    for (let h = 0; h < horns.length; h++) {
      const horn = horns[h];
      const hornJoint = b.joint(`s22Horn${sideName}${h + 1}`, {
        parent: crown,
        at: horn.base,
        dir: horn.shoulder.clone().sub(horn.base),
        role: "hinge",
        group: "s22-crowns",
      });

      const lowerEnd = horn.shoulder.clone().add(
        horn.shoulder
          .clone()
          .sub(horn.base)
          .normalize()
          .multiplyScalar(0.012),
      );

      b.rod(horn.base, lowerEnd, [0.064, 0.052], {
        color: BONE,
        bone: hornJoint,
        name: `s22HornLower${sideName}${h + 1}`,
        group: "s22-crowns",
      });

      // A dark bronze collar is deliberately oversized, like a forged repair band.
      collar(
        b,
        `s22BronzeCollar${sideName}${h + 1}`,
        horn.shoulder.clone().add(new THREE.Vector3(0, -0.026, 0)),
        horn.shoulder.clone().add(new THREE.Vector3(0, 0.032, 0)),
        0.073,
        BRONZE,
        hornJoint,
      );

      // Six low-poly studs around each collar make the crown read as crafted armor.
      const studRing = b.ring(
        line(
          horn.shoulder.clone().add(new THREE.Vector3(0, -0.025, 0)),
          horn.shoulder.clone().add(new THREE.Vector3(0, 0.035, 0)),
        ),
        {
          count: 6,
          radius: 0.073,
          fromDeg: 0,
          toDeg: 360,
          name: `s22CollarRing${sideName}${h + 1}`,
          group: "s22-crowns",
          role: "fan",
        },
      );

      for (let i = 0; i < studRing.items.length; i++) {
        b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
          frame: studRing.items[i],
          bone: hornJoint,
          flat: true,
          name: `s22CollarStud${sideName}${h + 1}_${i}`,
          group: "s22-crowns",
        });
      }

      // A second darker segment exaggerates the angular, broken-horn silhouette.
      b.rod(horn.shoulder, horn.breakAt, [0.052, 0.037], {
        color: BONE_DARK,
        bone: hornJoint,
        name: `s22HornDarkSegment${sideName}${h + 1}`,
        group: "s22-crowns",
      });

      const breakAxis = horn.tipDir;
      collar(
        b,
        `s22BrokenCap${sideName}${h + 1}`,
        horn.breakAt.clone().add(new THREE.Vector3(0, -0.018, 0)),
        horn.breakAt.clone().add(new THREE.Vector3(0, 0.014, 0)),
        0.047,
        IRON,
        hornJoint,
      );

      // The short tip is offset from the lower horn, suggesting a snapped and re-grown point.
      b.spike(horn.breakAt, breakAxis, 0.058, 0.046, {
        color: BONE,
        bone: hornJoint,
        name: `s22HornBrokenTip${sideName}${h + 1}`,
        group: "s22-crowns",
      });

      // Two tiny jagged shards at each break reinforce the fracture rather than making a smooth cone.
      b.spike(
        horn.breakAt.clone().add(new THREE.Vector3(s * 0.018, 0.008, 0.004)),
        [s * 0.65, 0.35, 0.12],
        0.038,
        0.013,
        {
          color: BONE_DARK,
          bone: hornJoint,
          name: `s22BreakShardA${sideName}${h + 1}`,
          group: "s22-crowns",
        },
      );

      b.spike(
        horn.breakAt.clone().add(new THREE.Vector3(-s * 0.014, 0.004, -0.006)),
        [-s * 0.45, 0.5, -0.18],
        0.031,
        0.011,
        {
          color: BONE,
          bone: hornJoint,
          name: `s22BreakShardB${sideName}${h + 1}`,
          group: "s22-crowns",
        },
      );

      // A small bronze root boss seats the collar into the charcoal skull.
      b.part(new THREE.SphereGeometry(0.078, 8, 5), BRONZE, {
        at: horn.base.clone().add(new THREE.Vector3(0, -0.012, 0)),
        bone: hornJoint,
        scale: [1, 0.55, 0.9],
        flat: true,
        name: `s22HornRootBoss${sideName}${h + 1}`,
        group: "s22-crowns",
      });
    }

    // Three narrow red war-paint cuts lie on the forward face of each skull.
    // They are intentionally separate primitive strokes, not a floating decal.
    const scars = [
      [
        [cx + s * 0.025, 2.505, 1.238],
        [cx + s * 0.125, 2.548, 1.252],
      ],
      [
        [cx + s * 0.045, 2.452, 1.246],
        [cx + s * 0.145, 2.487, 1.257],
      ],
      [
        [cx - s * 0.045, 2.405, 1.249],
        [cx - s * 0.135, 2.438, 1.258],
      ],
    ] as const;

    for (let i = 0; i < scars.length; i++) {
      const a = v(scars[i][0]);
      const c = v(scars[i][1]);

      b.rod(a, c, 0.009, {
        color: SCAR,
        bone: headName,
        name: `s22WarPaint${sideName}${i + 1}`,
        group: "s22-crowns",
      });

      // A black lower edge gives each paint cut a carved, God-of-War-like graphic silhouette.
      const offset = new THREE.Vector3(0, -0.012, 0.003);
      b.rod(
        a.clone().add(offset),
        c.clone().add(offset),
        0.004,
        {
          color: INK,
          bone: headName,
          name: `s22WarPaintEdge${sideName}${i + 1}`,
          group: "s22-crowns",
        },
      );
    }

    // Two small bronze brow rivets tie the red markings into the existing cheek armor.
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.SphereGeometry(0.019, 6, 4), BRONZE_LIGHT, {
        at: [cx + s * (0.19 + i * 0.045), 2.525 - i * 0.065, 1.245],
        bone: headName,
        flat: true,
        name: `s22BrowRivet${sideName}${i + 1}`,
        group: "s22-crowns",
      });
    }
  }
}
    return addLeftCrown;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addThroatChains(b: Builder) {
  const LEATHER = "#43151b";
  const CHAIN_SHADOW = "#17171b";

  const surface = b.surface(b.root);

  const linkGeometry = (major: number, tube: number) =>
    new THREE.TorusGeometry(major, tube, 5, 10);

  const addThroatChain = (
    key: string,
    bone: string,
    anchorQuery: [number, number, number],
    points: readonly [number, number, number][],
  ) => {
    const anchor = surface.nearest(anchorQuery);

    // A buried leather tie and an angular bronze throat clasp.
    b.rod(anchor.at, points[0], 0.018, {
      color: LEATHER,
      bone,
      caps: "round",
      name: `s23LeatherTie${key}`,
      group: "stage2",
    });

    b.stick(
      new THREE.CylinderGeometry(0.085, 0.1, 0.055, 8),
      BRONZE,
      anchor,
      {
        embed: 0.42,
        bone,
        name: `s23ThroatClasp${key}`,
        group: "stage2",
      },
    );

    b.stick(
      new THREE.ConeGeometry(0.043, 0.105, 6),
      GOLD,
      anchor,
      {
        embed: 0.2,
        bone,
        spin: 45,
        name: `s23ClaspStud${key}`,
        group: "stage2",
      },
    );

    // Alternating vertical and transverse links give the chain a readable silhouette.
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const holeAxis: [number, number, number] =
        i % 2 === 0 ? [1, 0, 0] : [0, 0, 1];

      b.part(
        linkGeometry(i === 1 ? 0.073 : 0.078, i === 1 ? 0.018 : 0.021),
        i % 2 === 0 ? BRONZE_LIGHT : CHAIN_SHADOW,
        {
          at: p,
          bone,
          dir: holeAxis,
          axis: "z",
          flat: true,
          name: `s23ChainLink${key}${i}`,
          group: "stage2",
        },
      );

      if (i < points.length - 1) {
        b.rod(p, points[i + 1], 0.012, {
          color: IRON,
          bone,
          caps: "round",
          name: `s23ChainConnector${key}${i}`,
          group: "stage2",
        });
      }
    }

    // Two little pointed ornaments sit over the upper link like forged chain hooks.
    for (const [i, dx] of [-1, 1].entries()) {
      const q: [number, number, number] = [
        points[0][0] + dx * 0.09,
        points[0][1] + 0.035,
        points[0][2] - 0.025,
      ];
      b.spike(q, [0, 0.08, 1], 0.105, 0.026, {
        color: GOLD,
        bone,
        name: `s23ChainHook${key}${i}`,
        group: "stage2",
      });
    }

    // A dark red knot is visible just below the clasp.
    b.part(new THREE.SphereGeometry(0.036, 7, 5), LEATHER, {
      at: [
        points[0][0],
        points[0][1] + 0.055,
        points[0][2] - 0.015,
      ],
      bone,
      scale: [1.35, 0.72, 0.9],
      flat: true,
      name: `s23LeatherKnot${key}`,
      group: "stage2",
    });
  };

  // Five separate chains, each following the front plane of its own neck.
  addThroatChain(
    "C",
    "neckC3",
    [0, 2.18, 0.86],
    [
      [0, 2.245, 1.015],
      [0, 2.08, 0.99],
      [0, 1.91, 0.955],
      [0, 1.745, 0.91],
    ],
  );

  addThroatChain(
    "L",
    "neckL3",
    [0.61, 2.08, 0.75],
    [
      [0.61, 2.295, 0.94],
      [0.605, 2.13, 0.895],
      [0.59, 1.965, 0.845],
      [0.575, 1.8, 0.79],
    ],
  );

  addThroatChain(
    "R",
    "neckR3",
    [-0.61, 2.08, 0.75],
    [
      [-0.61, 2.295, 0.94],
      [-0.605, 2.13, 0.895],
      [-0.59, 1.965, 0.845],
      [-0.575, 1.8, 0.79],
    ],
  );

  addThroatChain(
    "OL",
    "neckOL3",
    [1.11, 2.02, 0.72],
    [
      [1.12, 2.22, 0.985],
      [1.105, 2.055, 0.935],
      [1.08, 1.89, 0.88],
      [1.05, 1.725, 0.82],
    ],
  );

  addThroatChain(
    "OR",
    "neckOR3",
    [-1.11, 2.02, 0.72],
    [
      [-1.12, 2.22, 0.985],
      [-1.105, 2.055, 0.935],
      [-1.08, 1.89, 0.88],
      [-1.05, 1.725, 0.82],
    ],
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Left shoulder pauldron: three overlapping, outward-facing plates, lower teeth, seams, and rivets.
  // ---------------------------------------------------------------------------------------------------------------

  const pauldronOutline = (
    width: number,
    height: number,
  ): [number, number, "sharp"][] => [
    [-width * 0.52, 0],
    [width * 0.52, 0],
    [width * 0.49, height * 0.22],
    [width * 0.38, height * 0.72],
    [width * 0.17, height],
    [-width * 0.2, height * 0.93],
    [-width * 0.44, height * 0.63],
  ];

  const plates = [
    {
      at: [0.765, 1.075, 0.405] as [number, number, number],
      width: 0.68,
      height: 0.47,
      color: BRONZE,
      name: "s23PauldronBaseL",
    },
    {
      at: [0.825, 1.16, 0.345] as [number, number, number],
      width: 0.59,
      height: 0.43,
      color: BRONZE_LIGHT,
      name: "s23PauldronMiddleL",
    },
    {
      at: [0.885, 1.255, 0.285] as [number, number, number],
      width: 0.49,
      height: 0.36,
      color: BRONZE,
      name: "s23PauldronTopL",
    },
  ];

  for (const plate of plates) {
    b.extrude(pauldronOutline(plate.width, plate.height), {
      at: plate.at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.058,
      bevel: 0.012,
      smoothing: 1,
      color: plate.color,
      bone: "hips",
      name: plate.name,
      group: "stage2",
    });
  }

  // Dark forged seams show between the overlapping layers.
  const seamLines: [number, number, number][][] = [
    [
      [0.912, 1.12, 0.105],
      [0.912, 1.285, 0.16],
      [0.912, 1.48, 0.245],
    ],
    [
      [0.947, 1.2, 0.235],
      [0.947, 1.35, 0.285],
      [0.947, 1.51, 0.345],
    ],
    [
      [0.978, 1.29, 0.37],
      [0.978, 1.41, 0.405],
      [0.978, 1.545, 0.445],
    ],
  ];

  for (let i = 0; i < seamLines.length; i++) {
    const seam = seamLines[i];
    for (let j = 0; j < seam.length - 1; j++) {
      b.rod(seam[j], seam[j + 1], 0.012, {
        color: IRON,
        bone: "hips",
        caps: "flat",
        name: `s23PauldronSeamL${i}${j}`,
        group: "stage2",
      });
    }
  }

  // Large raised gold rivets follow the outer edge of the plates.
  const rivets: [number, number, number][] = [
    [0.982, 1.13, 0.105],
    [0.982, 1.29, 0.155],
    [0.982, 1.45, 0.225],
    [1.005, 1.22, 0.34],
    [1.005, 1.38, 0.39],
    [1.005, 1.52, 0.445],
    [1.025, 1.33, 0.53],
    [1.025, 1.47, 0.555],
  ];

  for (let i = 0; i < rivets.length; i++) {
    b.part(new THREE.SphereGeometry(0.041, 7, 5), GOLD, {
      at: rivets[i],
      bone: "hips",
      scale: [1.0, 0.92, 0.82],
      flat: true,
      name: `s23PauldronRivetL${i}`,
      group: "stage2",
    });
  }

  // Four sharpened lower teeth hang below the pauldron's silhouette.
  const teeth: [number, number, number][] = [
    [0.935, 1.095, 0.13],
    [0.945, 1.075, 0.28],
    [0.955, 1.09, 0.43],
    [0.965, 1.115, 0.58],
  ];

  for (let i = 0; i < teeth.length; i++) {
    b.spike(teeth[i], [0, -1, 0], 0.16, 0.038, {
      color: BONE_DARK,
      bone: "hips",
      name: `s23PauldronToothL${i}`,
      group: "stage2",
    });
  }

  // A final iron edge rail ties the three plates together without hiding the neck root.
  b.rod(
    [0.995, 1.09, 0.09],
    [0.995, 1.09, 0.61],
    0.018,
    {
      color: IRON,
      bone: "hips",
      caps: "round",
      name: "s23PauldronLowerRailL",
      group: "stage2",
    },
  );
}
    return addThroatChains;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addShoulderPauldronR(b: Builder) {
  const bone = "hips";
  const group = "shoulderArmorR";

  const WEATHERED_BRONZE = panelled(
    metal("bronze", {
      tarnish: 0.52,
      verdigris: 0.16,
      polish: 0.16,
      size: 0.085,
      seed: 24,
    }),
    {
      size: 0.13,
      aspect: 0.72,
      rivets: 0.055,
      seam: IRON,
    },
  );

  type Outline = [number, number][] | [number, number, "sharp"][];

  const panel = (
    name: string,
    at: [number, number, number],
    outline: Outline,
    thickness: number,
    color: any,
  ) =>
    b.extrude(outline, {
      at,
      bone,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness,
      bevel: 0.008,
      smoothing: 0,
      color,
      name,
      group,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
  ) =>
    b.rod(a, c, radius, {
      bone,
      color,
      name,
      group,
      caps: "round",
    });

  // Dark iron foundation: it peeks through every overlap and makes the bronze plates read as separate layers.
  panel(
    "s24PauldronRBacking",
    [-0.735, 1.31, 0.42],
    [
      [-0.36, -0.29],
      [0.31, -0.29],
      [0.37, -0.18],
      [0.36, 0.22],
      [0.25, 0.3],
      [-0.25, 0.29],
      [-0.38, 0.14],
    ],
    0.045,
    IRON,
  );

  // Upper shoulder plate, tucked behind the middle plate.
  panel(
    "s24PauldronRUpper",
    [-0.775, 1.485, 0.42],
    [
      [-0.255, -0.12],
      [0.23, -0.12],
      [0.285, -0.035],
      [0.23, 0.105],
      [0.08, 0.155],
      [-0.135, 0.145],
      [-0.285, 0.035],
    ],
    0.064,
    WEATHERED_BRONZE,
  );

  // Broad central plate, the visual hero of the pauldron.
  panel(
    "s24PauldronRMiddle",
    [-0.815, 1.315, 0.42],
    [
      [-0.315, -0.135],
      [0.305, -0.135],
      [0.345, -0.045],
      [0.315, 0.095],
      [0.225, 0.145],
      [-0.23, 0.145],
      [-0.34, 0.035],
    ],
    0.068,
    WEATHERED_BRONZE,
  );

  // Lower skirt plate is stepped forward and ends in a saw-toothed silhouette.
  panel(
    "s24PauldronRLower",
    [-0.85, 1.145, 0.42],
    [
      [-0.345, -0.085],
      [-0.245, -0.125],
      [-0.15, -0.095],
      [-0.04, -0.13],
      [0.08, -0.092],
      [0.2, -0.125],
      [0.335, -0.07],
      [0.315, 0.07],
      [0.23, 0.125],
      [-0.245, 0.125],
      [-0.34, 0.04],
    ],
    0.072,
    WEATHERED_BRONZE,
  );

  // Heavy dark seams at each overlap.
  rod("s24PauldronRSeamUpper", [-0.845, 1.395, 0.145], [-0.845, 1.395, 0.695], 0.014, IRON);
  rod("s24PauldronRSeamLower", [-0.885, 1.225, 0.09], [-0.885, 1.225, 0.75], 0.016, IRON);
  rod("s24PauldronRTopRim", [-0.835, 1.6, 0.18], [-0.835, 1.6, 0.65], 0.012, IRON_DARK ?? IRON);

  // Raised bronze-light ribs make each plate look forged rather than painted flat.
  rod("s24PauldronRRibUpper", [-0.855, 1.425, 0.205], [-0.855, 1.555, 0.36], 0.019, BRONZE_LIGHT);
  rod("s24PauldronRRibMiddle", [-0.895, 1.255, 0.19], [-0.895, 1.39, 0.42], 0.021, BRONZE_LIGHT);
  rod("s24PauldronRRibLower", [-0.935, 1.075, 0.2], [-0.935, 1.19, 0.42], 0.018, BRONZE_LIGHT);

  // Small red war-paint cuts across the bronze, deliberately irregular.
  rod("s24PauldronRMark1", [-0.87, 1.52, 0.46], [-0.87, 1.555, 0.54], 0.009, SCAR);
  rod("s24PauldronRMark2", [-0.91, 1.32, 0.31], [-0.91, 1.365, 0.405], 0.009, SCAR);
  rod("s24PauldronRMark3", [-0.95, 1.16, 0.49], [-0.95, 1.195, 0.57], 0.009, SCAR);

  // Rivets have a dark iron washer beneath every gold head.
  const rivet = (index: number, y: number, z: number, x: number) => {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 8), IRON, {
      at: [x + 0.008, y, z],
      dir: [-1, 0, 0],
      bone,
      flat: true,
      name: `s24PauldronRWasher${index}`,
      group,
    });

    b.part(new THREE.CylinderGeometry(0.031, 0.036, 0.034, 8), GOLD, {
      at: [x - 0.018, y, z],
      dir: [-1, 0, 0],
      bone,
      flat: true,
      name: `s24PauldronRGoldRivet${index}`,
      group,
    });

    b.part(new THREE.SphereGeometry(0.028, 8, 5), GOLD, {
      at: [x - 0.04, y, z],
      bone,
      scale: [0.7, 1, 1],
      flat: true,
      name: `s24PauldronRivetCap${index}`,
      group,
    });
  };

  rivet(0, 1.535, 0.22, -0.86);
  rivet(1, 1.545, 0.42, -0.86);
  rivet(2, 1.515, 0.62, -0.86);

  rivet(3, 1.36, 0.13, -0.9);
  rivet(4, 1.39, 0.39, -0.9);
  rivet(5, 1.35, 0.67, -0.9);

  rivet(6, 1.17, 0.12, -0.94);
  rivet(7, 1.185, 0.31, -0.94);
  rivet(8, 1.17, 0.53, -0.94);
  rivet(9, 1.15, 0.71, -0.94);

  // Four long, uneven lower teeth. Their bases disappear beneath the skirt edge.
  const tooth = (
    index: number,
    z: number,
    length: number,
    lean: number,
  ) => {
    b.spike(
      [-0.91, 1.075, z],
      [-0.32, -0.78, lean],
      length,
      0.038,
      {
        bone,
        color: BONE,
        name: `s24PauldronRLowerTooth${index}`,
        group,
      },
    );

    // A dark bronze collar at the root makes each tooth look bolted into the plate.
    b.part(new THREE.ConeGeometry(0.047, 0.045, 7), BRONZE_LIGHT, {
      at: [-0.895, 1.087, z],
      dir: [-1, -0.25, lean],
      bone,
      flat: true,
      name: `s24PauldronRToothCollar${index}`,
      group,
    });
  };

  tooth(0, 0.16, 0.115, -0.12);
  tooth(1, 0.32, 0.13, 0.035);
  tooth(2, 0.5, 0.145, -0.025);
  tooth(3, 0.665, 0.12, 0.11);

  // Short side fangs sharpen the front and rear corners of the silhouette.
  b.spike(
    [-0.905, 1.14, 0.105],
    [-0.6, 0.02, -0.48],
    0.115,
    0.029,
    {
      bone,
      color: BONE_DARK,
      name: "s24PauldronRFrontFang",
      group,
    },
  );

  b.spike(
    [-0.905, 1.14, 0.735],
    [-0.6, 0.02, 0.48],
    0.115,
    0.029,
    {
      bone,
      color: BONE_DARK,
      name: "s24PauldronRRearFang",
      group,
    },
  );

  // A small inset iron badge gives the shoulder a distinct God-of-War-like relic mark.
  panel(
    "s24PauldronRRelicBadge",
    [-0.93, 1.405, 0.505],
    [
      [-0.065, -0.085],
      [0.065, -0.085],
      [0.085, 0],
      [0.045, 0.085],
      [-0.045, 0.085],
      [-0.085, 0],
    ],
    0.025,
    IRON,
  );

  // Gold diagonal rune slash on the inset badge.
  rod("s24PauldronRRelicSlash", [-0.95, 1.36, 0.46], [-0.95, 1.45, 0.55], 0.014, GOLD);
  b.part(new THREE.SphereGeometry(0.022, 7, 5), GOLD, {
    at: [-0.968, 1.405, 0.505],
    bone,
    flat: true,
    name: "s24PauldronRRelicCenter",
    group,
  });
}
    return addShoulderPauldronR;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addBackRidge(b: Builder) {
  const blackIron = metal("iron", {
    tarnish: 0.58,
    polish: 0.18,
    size: 0.09,
    seed: 41,
  });

  const oldBronze = metal("bronze", {
    tarnish: 0.42,
    verdigris: 0.08,
    polish: 0.22,
    size: 0.06,
    seed: 47,
  });

  const ridgeZ = [0.52, 0.23, -0.07, -0.37, -0.67, -0.96];
  const ridgeHeight = [0.275, 0.33, 0.37, 0.345, 0.285, 0.22];
  const ridgeHalfWidth = [0.29, 0.34, 0.375, 0.35, 0.295, 0.22];
  const ridgeBase = [1.47, 1.465, 1.45, 1.43, 1.4, 1.37];

  // Six heavy dorsal blades. They are broad in the creature's left-right plane,
  // with a thin front-to-back thickness, so they read strongly in silhouette.
  for (let i = 0; i < ridgeZ.length; i++) {
    const z = ridgeZ[i];
    const h = ridgeHeight[i];
    const w = ridgeHalfWidth[i];
    const base = ridgeBase[i];

    const outline: [number, number, "sharp"][] = [
      [-w, 0, "sharp"],
      [-w * 0.86, h * 0.34, "sharp"],
      [-w * 0.31, h * 0.79, "sharp"],
      [0, h, "sharp"],
      [w * 0.3, h * 0.78, "sharp"],
      [w * 0.86, h * 0.34, "sharp"],
      [w, 0, "sharp"],
    ];

    b.extrude(outline, {
      at: [0, base, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.052,
      bevel: 0.008,
      color: blackIron,
      bone: "spine3",
      name: `backRidgePlate${i}`,
      group: "backRidge",
    });

    // Bone-colored raised edges make the plates legible against the dark back.
    const leftBase = [-w, base, z] as [number, number, number];
    const leftShoulder = [-w * 0.86, base + h * 0.34, z] as [number, number, number];
    const leftPeak = [-w * 0.31, base + h * 0.79, z] as [number, number, number];
    const peak = [0, base + h, z] as [number, number, number];
    const rightPeak = [w * 0.3, base + h * 0.78, z] as [number, number, number];
    const rightShoulder = [w * 0.86, base + h * 0.34, z] as [number, number, number];
    const rightBase = [w, base, z] as [number, number, number];

    const edgeSegments = [
      [leftBase, leftShoulder],
      [leftShoulder, leftPeak],
      [leftPeak, peak],
      [peak, rightPeak],
      [rightPeak, rightShoulder],
      [rightShoulder, rightBase],
    ];

    for (let e = 0; e < edgeSegments.length; e++) {
      b.rod(edgeSegments[e][0], edgeSegments[e][1], 0.014, {
        color: BONE,
        bone: "spine3",
        caps: "round",
        name: `backRidgeEdge${i}_${e}`,
        group: "backRidge",
      });
    }

    // A single red war-mark is inset into the front face of every plate.
    const notchSide = i % 2 === 0 ? -1 : 1;
    const notchX = notchSide * w * 0.28;
    const notchH = Math.min(0.095, h * 0.35);
    b.extrude(
      [
        [-0.024, 0, "sharp"],
        [0.027, 0.014, "sharp"],
        [0.004, notchH, "sharp"],
        [-0.025, notchH * 0.63, "sharp"],
      ],
      {
        at: [notchX, base + h * 0.27, z + 0.031],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.002,
        color: SCAR,
        bone: "spine3",
        name: `backRidgeWarMark${i}`,
        group: "backRidge",
      },
    );

    // Small dark fasteners at the roots visually anchor each blade into the scales.
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.026, 6, 4), BONE_DARK, {
        at: [s * w * 0.66, base + 0.018, z + 0.03],
        bone: "spine3",
        flat: true,
        name: `backRidgeRootRivet${i}_${s > 0 ? "L" : "R"}`,
        group: "backRidge",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail reliquary: an old bronze plaque seated on the upper curve of tailCoat.
  // -------------------------------------------------------------------------------------------------------------

  const tailSurface = new THREE.Vector3(0, 0.87, -1.56);
  const tailMount = frame(tailSurface, [0, 1, 0]);

  const plaque = b.stick(
    new THREE.BoxGeometry(0.28, 0.065, 0.2),
    oldBronze,
    tailMount,
    {
      bone: "tail3",
      embed: 0.18,
      name: "tailRelicPlaque",
      group: "tailRelic",
    },
  );

  // Four raised border bars turn the simple block into a proper reliquary casing.
  const plaqueTop = 0.925;
  const plaqueZ = -1.56;

  b.part(new THREE.BoxGeometry(0.225, 0.018, 0.018), BRONZE_LIGHT, {
    at: [0, plaqueTop, plaqueZ - 0.083],
    bone: "tail3",
    flat: true,
    name: "tailRelicBorderBack",
    group: "tailRelic",
  });
  b.part(new THREE.BoxGeometry(0.225, 0.018, 0.018), BRONZE_LIGHT, {
    at: [0, plaqueTop, plaqueZ + 0.083],
    bone: "tail3",
    flat: true,
    name: "tailRelicBorderFront",
    group: "tailRelic",
  });
  b.part(new THREE.BoxGeometry(0.018, 0.018, 0.15), BRONZE_LIGHT, {
    at: [-0.116, plaqueTop, plaqueZ],
    bone: "tail3",
    flat: true,
    name: "tailRelicBorderLeft",
    group: "tailRelic",
  });
  b.part(new THREE.BoxGeometry(0.018, 0.018, 0.15), BRONZE_LIGHT, {
    at: [0.116, plaqueTop, plaqueZ],
    bone: "tail3",
    flat: true,
    name: "tailRelicBorderRight",
    group: "tailRelic",
  });

  // Gold rivets sit at the four corners of the bronze frame.
  const rivetX = 0.102;
  const rivetZ = 0.068;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.027, 7, 5), GOLD, {
        at: [sx * rivetX, plaqueTop + 0.018, plaqueZ + sz * rivetZ],
        bone: "tail3",
        flat: true,
        name: `tailRelicRivet${sx > 0 ? "L" : "R"}${sz > 0 ? "F" : "B"}`,
        group: "tailRelic",
      });
    }
  }

  // The octagonal amber core is an emissive-looking focal point.
  const amber = b.part(new THREE.CylinderGeometry(0.057, 0.057, 0.018, 8), EYE, {
    at: [0, plaqueTop + 0.018, plaqueZ],
    dir: [0, 1, 0],
    axis: "y",
    bone: "tail3",
    flat: true,
    name: "tailRelicAmberCore",
    group: "tailRelic",
  });
  glow(amber, 1.35);

  // A tiny runic mark is laid directly over the amber inset.
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M20 10 L20 52 M44 10 L44 52 M20 21 L44 21 M20 43 L44 43
               M28 10 L36 21 L28 32 L36 43 L28 54"
            fill="none" stroke="#160b0d" stroke-width="5"
            stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M14 10 L50 10 M14 54 L50 54"
            fill="none" stroke="#ffe39a" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  b.part(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", {
    at: [0, plaqueTop + 0.029, plaqueZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    bone: "tail3",
    texture: rune,
    name: "tailRelicRune",
    group: "tailRelic",
  });

  // Short side spikes turn the plaque into a weapon-like tail ornament.
  for (const s of [-1, 1]) {
    const side = s > 0 ? "L" : "R";
    const spikeBase: [number, number, number] = [s * 0.145, plaqueTop + 0.004, plaqueZ];

    b.part(new THREE.CylinderGeometry(0.034, 0.041, 0.04, 7), BRONZE_LIGHT, {
      at: [s * 0.143, plaqueTop - 0.006, plaqueZ],
      dir: [s, 0, 0],
      bone: "tail3",
      flat: true,
      name: `tailRelicSpikeCollar${side}`,
      group: "tailRelic",
    });

    b.spike(spikeBase, [s, 0.08, 0], 0.145, 0.026, {
      color: BONE,
      bone: "tail3",
      caps: { start: "round", end: "point" },
      name: `tailRelicSideSpike${side}`,
      group: "tailRelic",
    });
  }

  // Two small red scratches on the lower casing give the relic the same war-mark language
  // as the new dorsal plates.
  b.part(new THREE.BoxGeometry(0.012, 0.008, 0.052), SCAR, {
    at: [-0.07, plaqueTop + 0.014, plaqueZ + 0.035],
    bone: "tail3",
    rotation: [0, 0, -0.45],
    flat: true,
    name: "tailRelicScarL",
    group: "tailRelic",
  });
  b.part(new THREE.BoxGeometry(0.012, 0.008, 0.038), SCAR, {
    at: [0.075, plaqueTop + 0.014, plaqueZ - 0.038],
    bone: "tail3",
    rotation: [0, 0, 0.55],
    flat: true,
    name: "tailRelicScarR",
    group: "tailRelic",
  });
}
    return addBackRidge;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addClawBands(b: Builder) {
  const EMBER_RED = "#8d211d";
  const EMBER_ORANGE = "#f05a24";
  const EMBER_GOLD = "#ffd15b";

  const feet = [
    {
      key: "FL",
      side: 1,
      root: [0.68, 1.03, 0.42] as [number, number, number],
      target: [0.82, 0.18, 0.57] as [number, number, number],
    },
    {
      key: "FR",
      side: -1,
      root: [-0.68, 1.03, 0.42] as [number, number, number],
      target: [-0.82, 0.18, 0.57] as [number, number, number],
    },
    {
      key: "HL",
      side: 1,
      root: [0.72, 1.0, -0.5] as [number, number, number],
      target: [0.84, 0.18, -0.62] as [number, number, number],
    },
    {
      key: "HR",
      side: -1,
      root: [-0.72, 1.0, -0.5] as [number, number, number],
      target: [-0.84, 0.18, -0.62] as [number, number, number],
    },
  ];

  // ---------------------------------------------------------------------------------------------------------------
  // Claw bands: heavy leather cuffs, bronze buckles, rivets, and reinforced talon guards on every foot.
  // ---------------------------------------------------------------------------------------------------------------

  for (const foot of feet) {
    const points = limb(
      foot.root,
      foot.target,
      [0.38, 0.43, 0.29],
      foot.key.startsWith("F")
        ? [
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 0, -1],
            [0, 0, 1],
          ],
    );

    const knee = points[1];
    const ankle = points[2];
    const paw = points[3];
    const ankleBone = `ankle${foot.key}`;
    const pawBone = `paw${foot.key}`;
    const ankleAxis = paw.clone().sub(ankle).normalize();

    // A wide scarlet leather band, with dark edge stitching represented by two raised rings.
    const band = b.part(
      new THREE.CylinderGeometry(0.145, 0.145, 0.075, 8, 1),
      EMBER_RED,
      {
        at: ankle,
        bone: ankleBone,
        dir: ankleAxis,
        flat: true,
        name: `s26LeatherBand${foot.key}`,
        group: "clawBands",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.151, 0.151, 0.012, 8, 1),
      MOUTH,
      {
        at: ankle.clone().addScaledVector(ankleAxis, -0.034),
        bone: ankleBone,
        dir: ankleAxis,
        flat: true,
        name: `s26BandEdgeA${foot.key}`,
        group: "clawBands",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.151, 0.151, 0.012, 8, 1),
      MOUTH,
      {
        at: ankle.clone().addScaledVector(ankleAxis, 0.034),
        bone: ankleBone,
        dir: ankleAxis,
        flat: true,
        name: `s26BandEdgeB${foot.key}`,
        group: "clawBands",
      },
    );

    // A broad outer buckle and four little gold rivets make the band read as worn armor rather than paint.
    const buckleAt = ankle
      .clone()
      .addScaledVector(new THREE.Vector3(foot.side, 0, 0), 0.14)
      .addScaledVector(ankleAxis, 0.004);

    b.part(
      new THREE.BoxGeometry(0.045, 0.07, 0.105),
      BRONZE_LIGHT,
      {
        at: buckleAt,
        bone: ankleBone,
        dir: ankleAxis,
        flat: true,
        name: `s26Buckle${foot.key}`,
        group: "clawBands",
      },
    );

    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const rivet = buckleAt
          .clone()
          .addScaledVector(new THREE.Vector3(0, sy * 0.021, sz * 0.031), 1)
          .addScaledVector(new THREE.Vector3(foot.side, 0, 0), 0.026);

        b.part(
          new THREE.SphereGeometry(0.012, 6, 4),
          GOLD,
          {
            at: rivet,
            bone: ankleBone,
            flat: true,
            name: `s26BuckleRivet${foot.key}${sy > 0 ? "T" : "B"}${sz > 0 ? "F" : "B"}`,
            group: "clawBands",
          },
        );
      }
    }

    // Reinforce all three existing talons with dark bronze collars and a small pale inset on each guard.
    for (let toe = -1; toe <= 1; toe++) {
      const talonBase = paw.clone().add(new THREE.Vector3(toe * 0.095, -0.025, 0.08));
      const talonDir = new THREE.Vector3(0, -0.08, 1).normalize();

      b.part(
        new THREE.CylinderGeometry(0.058, 0.05, 0.065, 6, 1),
        BRONZE,
        {
          at: talonBase,
          bone: pawBone,
          dir: talonDir,
          flat: true,
          name: `s26TalonGuard${foot.key}${toe + 1}`,
          group: "clawBands",
        },
      );

      b.part(
        new THREE.ConeGeometry(0.025, 0.032, 6),
        GOLD,
        {
          at: talonBase.clone().addScaledVector(talonDir, 0.036),
          bone: pawBone,
          dir: talonDir,
          flat: true,
          name: `s26TalonGuardInset${foot.key}${toe + 1}`,
          group: "clawBands",
        },
      );

      // A second, slightly darker blade lies beneath the original claw, making each toe chunkier.
      b.spike(
        talonBase.clone().add(new THREE.Vector3(0, -0.018, 0.018)),
        [0, -0.1, 1],
        0.115,
        0.031,
        {
          color: CLAW,
          bone: pawBone,
          name: `s26ReinforcedClaw${foot.key}${toe + 1}`,
          group: "clawBands",
        },
      );
    }

    // A small ankle spur echoes the body's dorsal spines.
    b.spike(
      ankle.clone().add(new THREE.Vector3(foot.side * 0.09, 0.015, -0.025)),
      [foot.side * 0.7, 0.2, -0.25],
      0.11,
      0.026,
      {
        color: BONE_DARK,
        bone: ankleBone,
        name: `s26AnkleSpur${foot.key}`,
        group: "clawBands",
      },
    );

    void band;
    void knee;
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Mouth embers: each open jaw gets a faceted red core, two hot sparks, a dark ember cage, and smoke spikes.
  // ---------------------------------------------------------------------------------------------------------------

  const mouths = [
    { key: "OL", x: 1.34, y: 2.23, z: 1.26 },
    { key: "L", x: 0.66, y: 2.44, z: 1.32 },
    { key: "C", x: 0, y: 2.63, z: 1.38 },
    { key: "R", x: -0.66, y: 2.44, z: 1.32 },
    { key: "OR", x: -1.34, y: 2.23, z: 1.26 },
  ];

  for (const mouth of mouths) {
    const jawBone = `jaw${mouth.key}`;
    const center = new THREE.Vector3(mouth.x, mouth.y, mouth.z);

    const core = b.part(
      new THREE.DodecahedronGeometry(0.066, 0),
      EMBER_RED,
      {
        at: center,
        bone: jawBone,
        scale: [0.95, 0.72, 1.08],
        flat: true,
        name: `s26EmberCore${mouth.key}`,
        group: "mouthEmbers",
      },
    );
    glow(core, 2.1);

    const hotCenter = center.clone().add(new THREE.Vector3(0, 0.006, 0.026));
    const hot = b.part(
      new THREE.OctahedronGeometry(0.034, 0),
      EMBER_ORANGE,
      {
        at: hotCenter,
        bone: jawBone,
        scale: [0.8, 0.72, 1.2],
        flat: true,
        name: `s26EmberHotCenter${mouth.key}`,
        group: "mouthEmbers",
      },
    );
    glow(hot, 2.7);

    // Two side sparks point toward the mouth opening, staying inside the upper and lower jaw silhouette.
    for (const s of [-1, 1]) {
      const sparkAt = center.clone().add(new THREE.Vector3(s * 0.09, s * 0.026, 0.004));
      const spark = b.part(
        new THREE.ConeGeometry(0.026, 0.075, 6, 1),
        EMBER_ORANGE,
        {
          at: sparkAt,
          bone: jawBone,
          dir: [0, 0, 1],
          flat: true,
          name: `s26SideSpark${mouth.key}${s > 0 ? "L" : "R"}`,
          group: "mouthEmbers",
        },
      );
      glow(spark, 2.4);

      const sparkTip = sparkAt.clone().add(new THREE.Vector3(0, s * 0.018, 0.057));
      const sparkPoint = b.part(
        new THREE.TetrahedronGeometry(0.017, 0),
        EMBER_GOLD,
        {
          at: sparkTip,
          bone: jawBone,
          flat: true,
          name: `s26SparkTip${mouth.key}${s > 0 ? "L" : "R"}`,
          group: "mouthEmbers",
        },
      );
      glow(sparkPoint, 3.0);
    }

    // Crossed dark iron bars sit behind the ember, giving the glowing pieces a crafted, contained silhouette.
    const cageA = center.clone().add(new THREE.Vector3(-0.105, -0.055, -0.045));
    const cageB = center.clone().add(new THREE.Vector3(0.105, 0.055, -0.045));
    const cageC = center.clone().add(new THREE.Vector3(0.105, -0.055, -0.045));
    const cageD = center.clone().add(new THREE.Vector3(-0.105, 0.055, -0.045));

    b.rod(cageA, cageB, 0.012, {
      color: COAL,
      bone: jawBone,
      name: `s26EmberCageA${mouth.key}`,
      group: "mouthEmbers",
    });

    b.rod(cageC, cageD, 0.012, {
      color: COAL,
      bone: jawBone,
      name: `s26EmberCageB${mouth.key}`,
      group: "mouthEmbers",
    });

    // Thin smoke-like spikes recede behind the teeth, never extending beyond the open mouth.
    for (const s of [-1, 1]) {
      const smokeBase = center.clone().add(new THREE.Vector3(s * 0.075, 0.02, -0.005));
      b.spike(
        smokeBase,
        [s * 0.24, 0.3, -1],
        0.12,
        0.011,
        {
          color: MOUTH,
          bone: jawBone,
          name: `s26SmokeSpike${mouth.key}${s > 0 ? "L" : "R"}`,
          group: "mouthEmbers",
        },
      );
    }
  }
}
    return addClawBands;
  })(),
);
