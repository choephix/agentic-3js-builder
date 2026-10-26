import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  limb,
  svg,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "five-headed hydra",
  description:
    "A low-poly God of War inspired five-headed hydra with armored scales, open jaws, horns, glowing eyes, muscular legs, a bladed tail, and warpaint.",
};

const COAT = cel("#405d3d", "#1c2a20", { threshold: 0.18 });
const COAT_DARK = cel("#26372a", "#111b16", { threshold: 0.12 });
const COAT_LIGHT = cel("#5c7545", "#263a25", { threshold: 0.2 });
const BELLY = cel("#a18b59", "#574a32", { threshold: 0.12 });
const BELLY_DARK = cel("#796744", "#392f25", { threshold: 0.1 });

const ARMOR = cel("#8d5b32", "#3f271d", { threshold: 0.16 });
const ARMOR_LIGHT = cel("#bd8245", "#5a3520", { threshold: 0.2 });
const ARMOR_DARK = cel("#4e3024", "#211b19", { threshold: 0.1 });

const HORN = cel("#d0b579", "#695435", { threshold: 0.12 });
const HORN_DARK = cel("#866c44", "#3a3024", { threshold: 0.1 });
const TOOTH = "#e8d5a4";
const CLAW = "#c3ae78";

const MOUTH = "#271317";
const GUM = "#6f2529";
const SCAR = "#a42b29";
const RUNE = "#d43c27";
const INK = "#171016";
const EYE = "#ff5425";
const EYE_HOT = "#ffb13d";
const EYE_DARK = "#280806";
const HIGHLIGHT = "#fff0c4";

const WARPAINT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <g fill="none" stroke="#b52c24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M43 20 L57 36 L46 49 L60 64 L43 82" stroke-width="8"/>
      <path d="M76 18 L64 38 L78 52 L64 72 L78 91" stroke-width="7"/>
      <path d="M28 84 L48 99 L37 115" stroke-width="6"/>
      <path d="M93 74 L76 91 L91 108" stroke-width="6"/>
    </g>
    <g fill="#f06a32">
      <circle cx="42" cy="20" r="4"/>
      <circle cx="76" cy="18" r="4"/>
      <circle cx="37" cy="115" r="3"/>
      <circle cx="91" cy="108" r="3"/>
    </g>
  </svg>`,
  { size: 256 },
);

function sphere(
  radius: number,
  widthSegments = 8,
  heightSegments = 6,
): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

function box(x: number, y: number, z: number): THREE.BoxGeometry {
  return new THREE.BoxGeometry(x, y, z);
}

function addCollar(
  b: ReturnType<typeof createBuilder>,
  chain: any,
  t: number,
  radius: number,
  color: any,
) {
  const ring = b.ring(chain.at(t), {
    count: 10,
    radius,
    name: "neckCollar",
    role: "fan",
  });
  b.sweep(catmull(ring.items, { closed: true }), 0.022, {
    color,
    section: { ngon: 8 },
    caps: "none",
    name: "collarBand",
  });
  for (let i = 0; i < ring.items.length; i += 2) {
    b.stick(sphere(0.028, 6, 4), ARMOR_LIGHT, ring.items[i], {
      embed: 0.38,
      name: "collarRivet",
    });
  }
}

function addJawTooth(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  radius: number,
  bone: any,
  name: string,
) {
  b.spike(at, dir, length, radius, {
    color: TOOTH,
    bone,
    caps: { start: "round", end: "point" },
    name,
  });
}

export default function build() {
  const b = createBuilder({
    name: "five-headed-hydra",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one heavy spine, a tapered tail, four planted legs, five neck chains, five heads and five jaws.

  const hips = b.joint("hips", {
    at: [0, 1.04, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const bodyPath = catmull([
    [0, 0.98, -1.04],
    [0, 1.04, -0.7],
    [0, 1.08, -0.28],
    [0, 1.1, 0.18],
    [0, 1.14, 0.56],
    [0, 1.2, 0.82],
  ]);

  const bodyChain = b.chain("body", bodyPath, {
    parent: hips,
    names: [
      "spineRear",
      "spineBack",
      "spineMid",
      "spineChest",
      "spineShoulder",
    ],
    role: "spine",
    group: "body",
  });

  const tailPath = catmull([
    [0, 1.0, -0.82],
    [0, 0.88, -1.35],
    [0, 0.72, -1.85],
    [0, 0.59, -2.28],
    [0, 0.5, -2.68],
  ]);

  const tailChain = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "tail",
  });

  const legSpecs: Array<{
    side: number;
    front: boolean;
    label: string;
    root: [number, number, number];
    target: [number, number, number];
  }> = [
    {
      side: 1,
      front: true,
      label: "FL",
      root: [0.43, 1.0, 0.46],
      target: [0.63, 0.2, 0.66],
    },
    {
      side: -1,
      front: true,
      label: "FR",
      root: [-0.43, 1.0, 0.46],
      target: [-0.63, 0.2, 0.66],
    },
    {
      side: 1,
      front: false,
      label: "HL",
      root: [0.45, 0.99, -0.47],
      target: [0.66, 0.2, -0.7],
    },
    {
      side: -1,
      front: false,
      label: "HR",
      root: [-0.45, 0.99, -0.47],
      target: [-0.66, 0.2, -0.7],
    },
  ];

  const legs = legSpecs.map((spec) => {
    const points = limb(
      spec.root,
      spec.target,
      [0.43, 0.4, 0.29],
      [
        [0, 0, spec.front ? 1 : -1],
        [0, 0, spec.front ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );

    const chain = b.chain(`leg${spec.label}`, points, {
      parent: hips,
      names: [
        `hip${spec.label}`,
        `knee${spec.label}`,
        `ankle${spec.label}`,
        `paw${spec.label}`,
      ],
      role: "leg",
      contact: spec.target,
      group: "legs",
    });

    return { ...spec, chain };
  });

  const neckSpecs: Array<{
    key: string;
    base: [number, number, number];
    points: [number, number, number][];
    dir: [number, number, number];
  }> = [
    {
      key: "A",
      base: [0.58, 1.26, 0.38],
      points: [
        [0.58, 1.3, 0.38],
        [0.76, 1.67, 0.55],
        [0.9, 2.08, 0.73],
        [0.97, 2.46, 0.88],
      ],
      dir: [0.12, 0.06, 1],
    },
    {
      key: "B",
      base: [0.28, 1.3, 0.48],
      points: [
        [0.28, 1.31, 0.48],
        [0.38, 1.76, 0.69],
        [0.45, 2.18, 0.91],
        [0.44, 2.67, 1.08],
      ],
      dir: [0.05, 0.04, 1],
    },
    {
      key: "C",
      base: [0, 1.34, 0.52],
      points: [
        [0, 1.34, 0.52],
        [0.02, 1.82, 0.76],
        [0, 2.26, 1.03],
        [0, 2.8, 1.18],
      ],
      dir: [0, 0.02, 1],
    },
    {
      key: "D",
      base: [-0.28, 1.3, 0.48],
      points: [
        [-0.28, 1.31, 0.48],
        [-0.4, 1.76, 0.69],
        [-0.47, 2.18, 0.91],
        [-0.45, 2.67, 1.08],
      ],
      dir: [-0.05, 0.04, 1],
    },
    {
      key: "E",
      base: [-0.58, 1.26, 0.38],
      points: [
        [-0.58, 1.3, 0.38],
        [-0.76, 1.67, 0.55],
        [-0.9, 2.08, 0.73],
        [-0.97, 2.46, 0.88],
      ],
      dir: [-0.12, 0.06, 1],
    },
  ];

  const necks: Array<{
    key: string;
    chain: any;
    head: any;
    jaw: any;
  }> = [];

  neckSpecs.forEach((spec) => {
    const neck = b.chain(`neck${spec.key}`, catmull(spec.points), {
      parent: hips,
      names: [
        `neck${spec.key}Base`,
        `neck${spec.key}Mid`,
        `neck${spec.key}Upper`,
      ],
      role: "neck",
      group: "necks",
    });

    const head = b.joint(`head${spec.key}`, {
      parent: neck.joints[2],
      at: neck.at(1),
      dir: spec.dir,
      role: "head",
      group: "heads",
    });

    const jaw = b.joint(`jaw${spec.key}`, {
      parent: head,
      at: head.local({ forward: 0.03, down: 0.1 }),
      aim: head.local({ forward: 0.36, down: 0.2 }),
      role: "jaw",
      group: "heads",
    });

    necks.push({ key: spec.key, chain: neck, head, jaw });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Main body, tail and limbs.

  const bodyTube = b.sweep(bodyChain, (t) => {
    if (t < 0.18) return 0.33;
    if (t < 0.72) return 0.46;
    return 0.4;
  }, {
    color: COAT,
    sectors: [
      [-65, 65, COAT_LIGHT],
      [120, 240, BELLY],
    ],
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "armoredBody",
  });

  const tailTube = b.sweep(tailChain, (t) => {
    if (t < 0.18) return 0.3;
    return 0.3 * (1 - t) + 0.035;
  }, {
    color: COAT_DARK,
    sectors: [
      [-58, 58, COAT],
      [125, 235, BELLY_DARK],
    ],
    bands: [
      [0.72, COAT_LIGHT],
      [0.88, HORN_DARK],
      [1, HORN],
    ],
    sides: 7,
    section: "circle",
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "bladedTail",
  });

  for (const leg of legs) {
    const legTube = b.sweep(leg.chain, (t) => {
      if (t < 0.32) return 0.17;
      if (t < 0.7) return 0.13;
      return 0.105;
    }, {
      color: COAT_DARK,
      sectors: [
        [-60, 60, COAT],
        [120, 240, BELLY_DARK],
      ],
      sides: 7,
      section: "circle",
      caps: "round",
      group: "legs",
      name: `muscleLeg${leg.label}`,
    });

    const paw = leg.chain.at(1);
    b.part(sphere(0.17, 8, 5), COAT_DARK, {
      bone: leg.chain.tip,
      at: paw.at,
      scale: [1.15, 0.72, 1.28],
      name: `paw${leg.label}`,
      group: "legs",
    });

    const cuffA = b.ring(leg.chain.at(0.31), {
      count: 8,
      radius: 0.15,
      name: `cuff${leg.label}A`,
      role: "fan",
    });
    b.sweep(catmull(cuffA.items, { closed: true }), 0.018, {
      color: ARMOR_DARK,
      caps: "none",
      name: `legCuff${leg.label}A`,
      group: "armor",
    });

    const cuffB = b.ring(leg.chain.at(0.7), {
      count: 8,
      radius: 0.118,
      name: `cuff${leg.label}B`,
      role: "fan",
    });
    b.sweep(catmull(cuffB.items, { closed: true }), 0.016, {
      color: ARMOR,
      caps: "none",
      name: `legCuff${leg.label}B`,
      group: "armor",
    });

    const clawBone = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
    for (let c = -1; c <= 1; c++) {
      const clawBase = paw.moved([c * 0.07, 0.015, 0.035]);
      const clawTip = paw.moved([c * 0.075, -0.01, 0.2 + Math.abs(c) * 0.015]);
      b.spike(clawBase, clawTip, null, 0.035, {
        color: CLAW,
        bone: clawBone,
        name: `claw${leg.label}${c}`,
        group: "claws",
      });
    }

    const anklePlate = paw.moved([0, 0.065, -0.01]);
    b.stick(new THREE.CylinderGeometry(0.09, 0.11, 0.045, 7), ARMOR_LIGHT, anklePlate, {
      embed: 0.42,
      name: `anklePlate${leg.label}`,
      group: "armor",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Dorsal armor and tail blades.

  for (let i = 0; i < 11; i++) {
    const t = 0.08 + i * 0.077;
    const dorsal = bodyTube.at(t, 0);
    const h = i < 3 ? 0.17 : i < 8 ? 0.21 : 0.15;
    b.spike(dorsal, dorsal, h, 0.055, {
      color: HORN_DARK,
      name: `backSpine${i}`,
      group: "spines",
    });
  }

  for (let i = 0; i < 8; i++) {
    const t = 0.12 + i * 0.105;
    const dorsal = tailTube.at(t, 0);
    const h = 0.16 * (1 - t) + 0.05;
    b.spike(dorsal, dorsal, h, 0.045, {
      color: HORN,
      name: `tailSpine${i}`,
      group: "tail",
    });
  }

  for (let i = 0; i < 7; i++) {
    const t = 0.15 + i * 0.1;
    for (const angle of [52, 308]) {
      const sideScale = bodyTube.at(t, angle);
      b.stick(new THREE.ConeGeometry(0.085, 0.07, 6), ARMOR_DARK, sideScale, {
        embed: 0.42,
        name: `sideScale${i}${angle}`,
        group: "scales",
      });
    }
  }

  // Large shoulder plates, sternum plates and rivet details.
  const bodySurface = b.surface(bodyTube);

  for (const side of [1, -1]) {
    const shoulder = bodySurface
      .around([0, 1.16, 0.5])
      .at(side * 90, 18);

    if (shoulder) {
      const plate = b.stick(
        new THREE.CylinderGeometry(0.23, 0.27, 0.075, 8),
        ARMOR,
        shoulder,
        {
          embed: 0.35,
          name: `shoulderPlate${side}`,
          group: "armor",
        },
      );

      b.stick(sphere(0.036, 6, 4), ARMOR_LIGHT, shoulder.moved([0, 0.045, 0]), {
        embed: 0.3,
        name: `shoulderRivet${side}`,
        group: "armor",
      });

      b.stick(sphere(0.026, 6, 4), ARMOR_LIGHT, shoulder.moved([0.08, 0.04, 0.02]), {
        embed: 0.3,
        name: `shoulderRivet${side}B`,
        group: "armor",
      });

      b.stick(sphere(0.026, 6, 4), ARMOR_LIGHT, shoulder.moved([-0.08, 0.04, -0.02]), {
        embed: 0.3,
        name: `shoulderRivet${side}C`,
        group: "armor",
      });

      void plate;
    }
  }

  for (let i = 0; i < 6; i++) {
    const t = 0.43 + i * 0.07;
    const breast = bodyTube.at(t, 180);
    b.stick(new THREE.CylinderGeometry(0.13, 0.15, 0.045, 7), BELLY_DARK, breast, {
      embed: 0.46,
      name: `bellyScute${i}`,
      group: "belly",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Five heavily armored necks.

  const neckTubes: Array<{ key: string; chain: any; tube: any }> = [];

  for (const neck of necks) {
    const tube = b.sweep(neck.chain, (t) => {
      if (t < 0.2) return 0.22;
      if (t < 0.72) return 0.19;
      return 0.145;
    }, {
      color: COAT,
      sectors: [
        [-62, 62, COAT_LIGHT],
        [120, 240, BELLY],
      ],
      sides: 8,
      section: "circle",
      caps: "round",
      group: "necks",
      name: `neckFlesh${neck.key}`,
    });

    neckTubes.push({ key: neck.key, chain: neck.chain, tube });

    addCollar(b, neck.chain, 0.18, 0.205, ARMOR_DARK);
    addCollar(b, neck.chain, 0.5, 0.175, ARMOR);
    addCollar(b, neck.chain, 0.82, 0.14, ARMOR_DARK);

    for (let i = 0; i < 6; i++) {
      const t = 0.16 + i * 0.125;
      const top = tube.at(t, 0);
      b.spike(top, top, 0.11 - i * 0.008, 0.036, {
        color: HORN_DARK,
        name: `neckRidge${neck.key}${i}`,
        group: "spines",
      });

      const left = tube.at(t, 56);
      b.spike(left, left, 0.075, 0.028, {
        color: COAT_LIGHT,
        name: `neckScaleL${neck.key}${i}`,
        group: "scales",
      });

      const right = tube.at(t, 304);
      b.spike(right, right, 0.075, 0.028, {
        color: COAT_LIGHT,
        name: `neckScaleR${neck.key}${i}`,
        group: "scales",
      });
    }

    for (let i = 0; i < 4; i++) {
      const belly = tube.at(0.28 + i * 0.15, 180);
      b.stick(new THREE.ConeGeometry(0.08, 0.05, 6), BELLY_DARK, belly, {
        embed: 0.44,
        name: `neckBellyPlate${neck.key}${i}`,
        group: "belly",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Heads, eyes, muzzles, open jaws, horns, crests, tusks and warpaint.

  for (const neck of necks) {
    const h = neck.head;
    const j = neck.jaw;

    const skull = b.part(sphere(1, 12, 8), COAT, {
      bone: h,
      at: h.at,
      dir: h.axis,
      axis: "z",
      scale: [0.34, 0.31, 0.43],
      name: `skull${neck.key}`,
      group: "heads",
    });

    const skullSurface = b.surface(skull);
    const faceHit = skullSurface.around(h.at).at(0, 8);

    if (faceHit) {
      b.decal(skull, WARPAINT, {
        at: faceHit,
        dir: h.axis,
        up: [0, 1, 0],
        size: [0.24, 0.26],
        lift: 0.006,
        segments: 8,
        name: `warpaint${neck.key}`,
        group: "warpaint",
      });
    }

    // Broad brow armor gives every head a predatory silhouette.
    for (const side of [1, -1]) {
      b.part(box(0.15, 0.065, 0.11), ARMOR_DARK, {
        bone: h,
        at: h.local({
          left: side * 0.15,
          up: 0.19,
          forward: 0.27,
        }),
        dir: h.axis,
        axis: "z",
        name: `browPlate${neck.key}${side}`,
        group: "armor",
      });

      b.part(box(0.115, 0.035, 0.06), ARMOR_LIGHT, {
        bone: h,
        at: h.local({
          left: side * 0.15,
          up: 0.218,
          forward: 0.315,
        }),
        dir: h.axis,
        axis: "z",
        name: `browHighlight${neck.key}${side}`,
        group: "armor",
      });
    }

    // Deep black eye sockets and ember-like eyes.
    for (const side of [1, -1]) {
      const socketAt = h.local({
        left: side * 0.145,
        up: 0.095,
        forward: 0.292,
      });

      b.part(sphere(0.084, 8, 6), EYE_DARK, {
        bone: h,
        at: socketAt,
        name: `eyeSocket${neck.key}${side}`,
        group: "face",
      });

      const ember = b.part(sphere(0.052, 8, 5), EYE, {
        bone: h,
        at: h.local({
          left: side * 0.145,
          up: 0.095,
          forward: 0.355,
        }),
        name: `glowingEye${neck.key}${side}`,
        group: "face",
      });
      glow(ember, 1.8);

      const pupil = b.part(sphere(0.023, 7, 5), EYE_DARK, {
        bone: h,
        at: h.local({
          left: side * 0.145,
          up: 0.095,
          forward: 0.402,
        }),
        name: `verticalPupil${neck.key}${side}`,
        group: "face",
      });
      glow(pupil, 0.5);

      b.part(sphere(0.014, 6, 4), HIGHLIGHT, {
        bone: h,
        at: h.local({
          left: side * 0.125,
          up: 0.13,
          forward: 0.425,
        }),
        name: `eyeGlint${neck.key}${side}`,
        group: "face",
      });
    }

    // Upper muzzle.
    const muzzleStart = h.local({ forward: 0.2, down: 0.02 });
    const muzzleEnd = h.local({ forward: 0.51, down: 0.06 });

    b.frustumBox(
      muzzleStart,
      muzzleEnd,
      [0.24, 0.19],
      [0.17, 0.14],
      {
        color: COAT_DARK,
        bone: h,
        section: "box",
        name: `upperMuzzle${neck.key}`,
        group: "face",
      },
    );

    b.part(sphere(0.115, 8, 6), ARMOR_DARK, {
      bone: h,
      at: h.local({ forward: 0.54, down: 0.065 }),
      scale: [1.15, 0.8, 0.7],
      name: `nose${neck.key}`,
      group: "face",
    });

    b.part(sphere(0.06, 7, 5), GUM, {
      bone: h,
      at: h.local({ forward: 0.6, down: 0.05 }),
      scale: [1.2, 0.5, 0.5],
      name: `noseScar${neck.key}`,
      group: "face",
    });

    // Lower jaw is its own bone and deliberately hangs open beneath the muzzle.
    const jawEnd = h.local({ forward: 0.5, down: 0.19 });
    b.sweep([j.at, jawEnd], [0.145, 0.095], {
      color: COAT_DARK,
      bone: j,
      section: { ngon: 7 },
      caps: "round",
      name: `lowerJaw${neck.key}`,
      group: "jaws",
    });

    b.rod(j.at, jawEnd, 0.035, {
      color: MOUTH,
      bone: j,
      name: `mouthCavity${neck.key}`,
      group: "jaws",
    });

    b.rod(
      h.local({ forward: 0.46, down: 0.065 }),
      h.local({ forward: 0.54, down: 0.09 }),
      0.022,
      {
        color: GUM,
        bone: h,
        name: `upperGum${neck.key}`,
        group: "jaws",
      },
    );

    b.rod(
      j.at,
      h.local({ forward: 0.42, down: 0.18 }),
      0.018,
      {
        color: GUM,
        bone: j,
        name: `lowerGum${neck.key}`,
        group: "jaws",
      },
    );

    // Upper fangs: two sweeping tusks and three smaller teeth.
    for (const side of [1, -1]) {
      addJawTooth(
        b,
        h.local({
          left: side * 0.095,
          up: -0.015,
          forward: 0.47,
        }),
        h.dir([0, -0.45, 1]),
        0.18,
        0.038,
        h,
        `upperFang${neck.key}${side}`,
      );
    }

    for (const side of [1, -1]) {
      addJawTooth(
        b,
        h.local({
          left: side * 0.045,
          up: -0.02,
          forward: 0.48,
        }),
        h.dir([0, -0.7, 1]),
        0.115,
        0.022,
        h,
        `upperTooth${neck.key}${side}`,
      );

      addJawTooth(
        b,
        j.local({
          left: side * 0.075,
          up: 0.01,
          forward: 0.16,
        }),
        h.dir([0, 0.5, 1]),
        0.1,
        0.022,
        j,
        `lowerTooth${neck.key}${side}`,
      );
    }

    addJawTooth(
      b,
      h.local({ up: -0.015, forward: 0.49 }),
      h.dir([0, -0.55, 1]),
      0.12,
      0.023,
      h,
      `centerTooth${neck.key}`,
    );

    // Two curled horns from the rear crown.
    for (const side of [1, -1]) {
      const hornRoot = h.local({
        left: side * 0.145,
        up: 0.16,
        back: 0.18,
      });
      const hornCtrl1 = h.local({
        left: side * 0.2,
        up: 0.3,
        back: 0.24,
      });
      const hornCtrl2 = h.local({
        left: side * 0.28,
        up: 0.42,
        back: 0.34,
      });
      const hornTip = h.local({
        left: side * 0.18,
        up: 0.55,
        back: 0.46,
      });

      b.sweep(
        bezier(hornRoot, hornCtrl1, hornCtrl2, hornTip),
        [0.07, 0],
        {
          color: HORN,
          bone: h,
          sides: 7,
          caps: { start: "round", end: "point" },
          name: `curvedHorn${neck.key}${side}`,
          group: "horns",
        },
      );

      b.part(sphere(0.043, 7, 5), HORN_DARK, {
        bone: h,
        at: hornRoot,
        name: `hornRoot${neck.key}${side}`,
        group: "horns",
      });
    }

    // Three heavy crown spines form a ragged silhouette behind each skull.
    for (let i = 0; i < 3; i++) {
      const base = h.local({
        left: (i - 1) * 0.105,
        up: 0.18 + i * 0.02,
        back: 0.16 + i * 0.055,
      });
      const tip = h.local({
        left: (i - 1) * 0.13,
        up: 0.38 + i * 0.035,
        back: 0.2 + i * 0.06,
      });

      b.spike(base, tip, null as null, 0.052, {
        color: HORN_DARK,
        bone: h,
        name: `crownSpine${neck.key}${i}`,
        group: "horns",
      });
    }

    // Small cheek plates and jaw hinge studs.
    for (const side of [1, -1]) {
      b.part(box(0.075, 0.13, 0.12), ARMOR, {
        bone: h,
        at: h.local({
          left: side * 0.285,
          up: -0.005,
          forward: 0.18,
        }),
        dir: h.axis,
        axis: "z",
        name: `cheekPlate${neck.key}${side}`,
        group: "armor",
      });

      b.stick(
        sphere(0.038, 6, 4),
        ARMOR_LIGHT,
        h.local({
          left: side * 0.285,
          up: -0.04,
          forward: 0.255,
        }),
        {
          embed: 0.25,
          bone: h,
          name: `jawHinge${neck.key}${side}`,
          group: "armor",
        },
      );
    }

    // A dark red scar line beneath the throat.
    b.rod(
      h.local({ forward: 0.08, down: 0.14 }),
      h.local({ forward: 0.34, down: 0.18 }),
      0.012,
      {
        color: SCAR,
        bone: h,
        name: `throatScar${neck.key}`,
        group: "warpaint",
      },
    );

    // Brow rivets.
    for (const side of [1, -1]) {
      b.stick(
        sphere(0.022, 6, 4),
        ARMOR_LIGHT,
        h.local({
          left: side * 0.21,
          up: 0.205,
          forward: 0.32,
        }),
        {
          embed: 0.22,
          bone: h,
          name: `browRivet${neck.key}${side}`,
          group: "armor",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A few final graphic accents: red dorsal scars and bronze chain-like spine studs.

  for (let i = 0; i < 5; i++) {
    const t = 0.28 + i * 0.105;
    const scar = bodyTube.at(t, 180);
    b.rod(
      scar.moved([0, 0.008, -0.055]),
      scar.moved([0, 0.008, 0.08]),
      0.012,
      {
        color: SCAR,
        name: `bodyScar${i}`,
        group: "warpaint",
      },
    );
  }

  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.09;
    const side = i % 2 === 0 ? 1 : -1;
    const point = bodyTube.at(t, side * 42);
    b.stick(sphere(0.031, 6, 4), ARMOR_LIGHT, point, {
      embed: 0.34,
      name: `bodyRivet${i}`,
      group: "armor",
    });
  }

  for (const leg of legs) {
    const side = leg.side;
    const root = leg.chain.at(0);
    b.stick(sphere(0.06, 7, 5), SCAR, root.moved([0, 0.12, 0]), {
      embed: 0.35,
      name: `legMark${leg.label}`,
      group: "warpaint",
    });

    const shin = leg.chain.at(0.62);
    b.spike(shin, shin, 0.08, 0.028, {
      color: HORN_DARK,
      name: `shinSpur${leg.label}`,
      group: "spines",
    });

    void side;
  }

  return b.root;
}
