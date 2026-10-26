<!-- call: stage1 -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  limb,
  rng,
  type Builder,
} from "agentic-3js-builder";

export const INK = "#21182a";
export const INDIGO = "#293b5b";
export const DEEP_INDIGO = "#18253d";
export const NIGHT = "#111827";
export const CREAM = "#e7d3a2";
export const IVORY = "#f2e8c9";
export const OCHRE = "#bd7734";
export const VERMILION = "#ad3d35";
export const ROSE = "#d86658";
export const TEAL = "#4d8587";
export const PALE_BLUE = "#88b6b2";
export const GOLD = "#d6a44a";

export const meta = {
  name: "baku",
  description:
    "A stout dream-eating tapir spirit in a flat ukiyo-e woodblock palette, with a long expressive snout, giant ears, tusks, curling tail, mane-spines, four planted legs, and small vapor-like spirit wisps.",
};

export const REQUESTS = [
  {
    id: "foreheadCrest",
    kind: "add",
    part: "headShell",
    what: "A bold ukiyo-e crest on the forehead: a vermilion tomoe-like dream spiral with a dark INK outline and a small CREAM highlight. Keep it broad, graphic, and centered between the eyes.",
    at: [0, 1.78, 1.12],
    normal: [0, 0.72, 0.7],
    bone: "head",
    room: [0.32, 0.2, 0.08],
  },
  {
    id: "mouthInterior",
    kind: "add",
    part: "mouthLine",
    what: "A layered open mouth at the end of the snout: deep NIGHT interior, a thin VERMILION lower lip, two small IVORY tooth glints, and a dark woodblock contour. Follow the existing jaw hinge.",
    at: [0, 1.1, 1.415],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.3, 0.16, 0.08],
  },
  {
    id: "tuskBands",
    kind: "add",
    part: "tuskL",
    what: "Three tiny OCHRE and VERMILION cord bands wrapped around the visible tusk, with an INK knot. Keep the bands narrow and seated on the ivory.",
    at: [0.13, 1.12, 1.38],
    normal: [0.12, -0.2, 0.96],
    bone: "jaw",
    room: [0.12, 0.15, 0.12],
  },
  {
    id: "dreamRibbon",
    kind: "add",
    part: "upperSnout",
    what: "A thin PALE_BLUE dream ribbon emerging from the snout and curling upward once, like a Japanese painted cloud. Add an INK edge, one TEAL bead, and a small GOLD charm at its tip.",
    at: [0, 1.31, 1.4],
    normal: [0, 0, 1],
    bone: "upperTip",
    room: [0.55, 0.55, 0.18],
  },
  {
    id: "backSeal",
    kind: "add",
    part: "bodyCoat",
    what: "A large flat ukiyo-e dream seal on the upper back: an INK oval border, a vermilion stylized cloud glyph, and two CREAM registration marks. Keep the surrounding indigo back clear.",
    at: [0, 1.48, -0.05],
    normal: [0, 1, 0],
    bone: "back",
    room: [0.42, 0.24, 0.42],
  },
  {
    id: "earCharms",
    kind: "add",
    part: "earL",
    what: "A pair of simple ear ornaments: small GOLD diamond plates with VERMILION cords, mirrored on both ears and attached near the lower outer ear.",
    at: [0.43, 1.53, 0.8],
    normal: [0.7, 0.3, 0.6],
    bone: "earL",
    room: [0.16, 0.2, 0.12],
  },
  {
    id: "maneRibbons",
    kind: "add",
    part: "mane",
    what: "Three narrow VERMILION and CREAM ribbon strips threaded through the dorsal mane, with little square ends. They should follow the creature's spine and read as carved print shapes.",
    at: [0, 1.62, -0.25],
    normal: [0, 1, 0],
    bone: "back",
    room: [0.3, 0.34, 0.55],
  },
  {
    id: "tailCharm",
    kind: "add",
    part: "tailCoat",
    what: "A tiny GOLD bell and PALE_BLUE tassel at the tail tuft, outlined in INK. The bell is ornamental, not metallic-realistic, and must stay within the tail silhouette.",
    at: [0.04, 1.34, -1.08],
    normal: [0, 0.2, -1],
    bone: "tailTip",
    room: [0.16, 0.2, 0.16],
  },
  {
    id: "hoofSeals",
    kind: "add",
    part: "footFL",
    what: "Four small hoof seals, one on each planted foot: CREAM rectangular plaques with a single INK cloud mark and a VERMILION lower edge. Keep them low and flush to the hoof tops.",
    at: [0.35, 0.145, 0.24],
    normal: [0, 1, 0],
    bone: "footFL",
    room: [0.24, 0.1, 0.24],
  },
  {
    id: "spiritBeads",
    kind: "add",
    part: "wispL1",
    what: "Two suspended PALE_BLUE spirit beads along the left vapor wisp, each with a tiny GOLD core and a crisp INK rim. They should be sparse and graphic rather than glittery.",
    at: [0.38, 1.74, 0.67],
    normal: [0, 1, 0],
    bone: "wispL1",
    room: [0.22, 0.28, 0.2],
  },
  {
    id: "bodyWoodgrain",
    kind: "texture",
    part: "bodyCoat",
    what: "A restrained ukiyo-e woodblock texture: broad uneven indigo hatch marks following the body length, slightly lighter CREAM belly brushwork, and a few sparse OCHRE flecks on the rump. Keep the silhouette flat and avoid photoreal fur.",
  },
  {
    id: "headWoodgrain",
    kind: "texture",
    part: "headShell",
    what: "Flat carved-print shading on the head: DEEP_INDIGO contour hatching beneath the brow and cheeks, CREAM block shading around the muzzle, and a few short INK strokes that emphasize the tapir's heavy brow.",
  },
  {
    id: "earPrint",
    kind: "texture",
    part: "earL",
    what: "Ukiyo-e ear print marks in VERMILION, OCHRE, and INK: two broad interior wedge shapes and three short parallel cut lines, leaving the outer INDIGO rim clean. Mirror the design on earR.",
  },
  {
    id: "tailPrint",
    kind: "texture",
    part: "tailCoat",
    what: "Short alternating OCHRE and CREAM block bands across the tail tuft, with a dark INK contour at the tip and a subtle PALE_BLUE spirit haze around the last segment.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first. The baku is posed neutrally with all four feet planted, its jaw slightly open,
  // its ears separated, and the two spirit wisps extended away from the body.

  const hips = b.joint("hips", {
    at: [0, 0.98, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 1.0, -0.55],
    [0, 1.07, -0.25],
    [0, 1.1, 0.1],
    [0, 1.13, 0.48],
    [0, 1.18, 0.62],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["rump", "back", "chest", "shoulder"],
    role: "spine",
    count: 4,
  });

  const neckPath = catmull([
    [0, 1.16, 0.56],
    [0, 1.31, 0.69],
    [0, 1.43, 0.8],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip ?? spine.joints[spine.joints.length - 1],
    names: ["neckBase", "neckTip"],
    role: "neck",
    count: 2,
  });

  const head = b.joint("head", {
    parent: neck.tip ?? neck.joints[neck.joints.length - 1],
    at: [0, 1.46, 0.86],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.32, 1.01],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const upperSnoutPath = catmull([
    [0, 1.42, 0.94],
    [0, 1.38, 1.12],
    [0, 1.3, 1.3],
    [0, 1.18, 1.4],
  ]);

  const upperSnout = b.chain("upperSnout", upperSnoutPath, {
    parent: head,
    names: ["upperBridge", "upperMuzzle", "upperTip"],
    role: "jaw",
    count: 3,
    group: "head",
  });

  const lowerJawPath = catmull([
    [0, 1.3, 1.0],
    [0, 1.2, 1.18],
    [0, 1.1, 1.35],
    [0, 1.08, 1.4],
  ]);

  const lowerJaw = b.chain("lowerJaw", lowerJawPath, {
    parent: jaw,
    names: ["lowerJaw", "lowerMuzzle", "lowerTip"],
    role: "jaw",
    count: 3,
    group: "head",
  });

  const trunkPath = catmull([
    [0, 1.41, 1.0],
    [0, 1.3, 1.16],
    [0, 1.14, 1.34],
    [0, 0.96, 1.38],
    [0, 0.84, 1.28],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunkBase", "trunkMid", "trunkCurl", "trunkTip"],
    role: "tentacle",
    count: 4,
    group: "head",
  });

  const earL = b.joint("earL", {
    parent: head,
    at: [0.29, 1.57, 0.79],
    dir: [0.2, 0.55, 0],
    role: "hinge",
    group: "head",
  });

  const earR = b.joint("earR", {
    parent: head,
    at: [-0.29, 1.57, 0.79],
    dir: [-0.2, 0.55, 0],
    role: "hinge",
    group: "head",
  });

  const legDefinitions = [
    {
      side: 1,
      prefix: "FL",
      root: [0.34, 0.88, 0.4] as [number, number, number],
      knee: [0.38, 0.55, 0.42] as [number, number, number],
      ankle: [0.35, 0.25, 0.47] as [number, number, number],
      foot: [0.35, 0.14, 0.54] as [number, number, number],
    },
    {
      side: -1,
      prefix: "FR",
      root: [-0.34, 0.88, 0.4] as [number, number, number],
      knee: [-0.38, 0.55, 0.42] as [number, number, number],
      ankle: [-0.35, 0.25, 0.47] as [number, number, number],
      foot: [-0.35, 0.14, 0.54] as [number, number, number],
    },
    {
      side: 1,
      prefix: "HL",
      root: [0.36, 0.87, -0.34] as [number, number, number],
      knee: [0.4, 0.54, -0.38] as [number, number, number],
      ankle: [0.37, 0.25, -0.3] as [number, number, number],
      foot: [0.37, 0.14, -0.22] as [number, number, number],
    },
    {
      side: -1,
      prefix: "HR",
      root: [-0.36, 0.87, -0.34] as [number, number, number],
      knee: [-0.4, 0.54, -0.38] as [number, number, number],
      ankle: [-0.37, 0.25, -0.3] as [number, number, number],
      foot: [-0.37, 0.14, -0.22] as [number, number, number],
    },
  ];

  const legs = legDefinitions.map((d) => {
    const path = catmull([d.root, d.knee, d.ankle, d.foot]);
    return b.chain(`leg${d.prefix}`, path, {
      parent: hips,
      names: [`hip${d.prefix}`, `knee${d.prefix}`, `ankle${d.prefix}`, `foot${d.prefix}`],
      role: "leg",
      count: 4,
      contact: [d.foot[0], 0, d.foot[2] + 0.08],
    });
  });

  const toeDefinitions = [
    { s: 1, prefix: "FL", z: 0.47, x: 0.35 },
    { s: -1, prefix: "FR", z: 0.47, x: -0.35 },
    { s: 1, prefix: "HL", z: -0.22, x: 0.37 },
    { s: -1, prefix: "HR", z: -0.22, x: -0.37 },
  ];

  const toes = toeDefinitions.map((d) => {
    const parent = legs.find((leg) => leg.joints.some((j) => j.name === `foot${d.prefix}`))?.tip;
    const start: [number, number, number] = [d.x, 0.11, d.z + 0.02];
    const end: [number, number, number] = [d.x, 0.075, d.z + 0.19];
    return b.chain(`toe${d.prefix}`, [start, end], {
      parent: parent ?? hips,
      names: [`toe${d.prefix}`],
      role: "digit",
      count: 1,
    });
  });

  const tailPath = catmull([
    [0, 1.05, -0.48],
    [0, 1.14, -0.72],
    [0.04, 1.26, -0.94],
    [0.02, 1.32, -1.08],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tailBase", "tailMid", "tailTip"],
    role: "tail",
    count: 3,
  });

  const wispLPath = catmull([
    [0.18, 1.42, 0.65],
    [0.32, 1.61, 0.54],
    [0.48, 1.77, 0.66],
    [0.4, 1.84, 0.85],
  ]);

  const wispRPath = catmull([
    [-0.18, 1.43, 0.66],
    [-0.31, 1.61, 0.52],
    [-0.47, 1.74, 0.6],
    [-0.41, 1.81, 0.79],
  ]);

  const wispL = b.chain("wispL", wispLPath, {
    parent: head,
    names: ["wispL1", "wispL2", "wispL3"],
    role: "tentacle",
    count: 3,
    group: "spirit",
  });

  const wispR = b.chain("wispR", wispRPath, {
    parent: head,
    names: ["wispR1", "wispR2", "wispR3"],
    role: "tentacle",
    count: 3,
    group: "spirit",
  });

  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: 9,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Main body and silhouette.

  const body = b.sweep(spine, (t) => {
    const rx = 0.45 + 0.06 * Math.sin(t * Math.PI);
    const ry = 0.37 + 0.06 * Math.sin(t * Math.PI);
    return [rx, ry];
  }, {
    color: INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "bodyCoat",
    group: "body",
    sectors: [
      [112, 248, CREAM],
      [248, 292, OCHRE, 0.05, 0.72],
    ],
  });

  const neckTube = b.sweep(neck, (t) => [0.31 - t * 0.035, 0.3 - t * 0.025], {
    color: DEEP_INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "neckCoat",
    group: "body",
    sectors: [[112, 248, CREAM]],
  });

  const upperSnoutTube = b.sweep(upperSnout, (t) => [0.22 - t * 0.08, 0.2 - t * 0.07], {
    color: DEEP_INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "upperSnout",
    group: "head",
    sectors: [[105, 255, CREAM]],
  });

  const lowerJawTube = b.sweep(lowerJaw, (t) => [0.17 - t * 0.045, 0.115 - t * 0.035], {
    color: DEEP_INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "lowerJaw",
    group: "head",
    sectors: [[105, 255, ROSE]],
  });

  const trunkTube = b.sweep(trunk, (t) => [0.18 - t * 0.11, 0.16 - t * 0.09], {
    color: INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "trunkCoat",
    group: "head",
    sectors: [[110, 250, CREAM]],
  });

  const legTubes = legs.map((leg, i) =>
    b.sweep(leg, (t) => {
      const r = t < 0.55 ? 0.145 - t * 0.025 : 0.12 - (t - 0.55) * 0.035;
      return [r, r * 0.94];
    }, {
      color: DEEP_INDIGO,
      section: { ngon: 6 },
      smooth: false,
      caps: "round",
      name: `legCoat${i}`,
      group: "limbs",
      sectors: [[110, 250, INDIGO]],
    }),
  );

  const tailTube = b.sweep(tail, (t) => [0.115 - t * 0.075, 0.105 - t * 0.07], {
    color: INDIGO,
    section: { ngon: 7 },
    smooth: false,
    caps: "round",
    name: "tailCoat",
    group: "body",
    bands: [
      [0.62, OCHRE],
      [0.84, CREAM],
      [1, OCHRE],
    ],
  });

  const wispLTubes = b.sweep(wispL, [0.045, 0.012], {
    color: PALE_BLUE,
    section: { ngon: 6 },
    smooth: false,
    caps: "point",
    name: "wispL",
    group: "spirit",
  });

  const wispRTubes = b.sweep(wispR, [0.045, 0.012], {
    color: TEAL,
    section: { ngon: 6 },
    smooth: false,
    caps: "point",
    name: "wispR",
    group: "spirit",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Head, face, and the readable tapir expression.

  const skull = b.part(
    new THREE.SphereGeometry(0.41, 12, 8),
    INDIGO,
    {
      bone: head,
      at: [0, 1.47, 0.87],
      scale: [1.04, 1.0, 1.04],
      flat: true,
      name: "headShell",
      group: "head",
    },
  );

  const brow = b.part(
    new THREE.SphereGeometry(0.31, 10, 6),
    DEEP_INDIGO,
    {
      bone: head,
      at: [0, 1.58, 1.02],
      scale: [1.22, 0.46, 0.6],
      flat: true,
      name: "browMass",
      group: "head",
    },
  );

  for (const s of [1, -1]) {
    const socket = b.part(
      new THREE.SphereGeometry(0.105, 8, 6),
      INK,
      {
        bone: head,
        at: [s * 0.17, 1.48, 1.17],
        scale: [1.0, 0.34, 1.15],
        flat: true,
        name: s > 0 ? "eyeSocketL" : "eyeSocketR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.073, 8, 6),
      OCHRE,
      {
        bone: head,
        at: [s * 0.17, 1.48, 1.205],
        scale: [0.8, 0.2, 0.92],
        flat: true,
        name: s > 0 ? "eyeGoldL" : "eyeGoldR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.027, 7, 5),
      NIGHT,
      {
        bone: head,
        at: [s * 0.17, 1.48, 1.225],
        scale: [0.72, 0.18, 1.45],
        flat: true,
        name: s > 0 ? "pupilL" : "pupilR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      IVORY,
      {
        bone: head,
        at: [s * 0.145, 1.515, 1.242],
        scale: [1, 0.16, 1],
        flat: true,
        name: s > 0 ? "eyeGlintL" : "eyeGlintR",
        group: "face",
      },
    );

    b.rod(
      [s * 0.11, 1.61, 1.14],
      [s * 0.25, 1.59, 1.12],
      0.018,
      INK,
      {
        bone: head,
        name: s > 0 ? "browL" : "browR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.18, 9, 6),
      CREAM,
      {
        bone: head,
        at: [s * 0.25, 1.31, 1.08],
        scale: [1.0, 0.8, 0.56],
        flat: true,
        name: s > 0 ? "cheekL" : "cheekR",
        group: "face",
      },
    );
  }

  const nose = b.part(
    new THREE.SphereGeometry(0.13, 9, 6),
    NIGHT,
    {
      bone: upperSnout.tip ?? head,
      at: [0, 1.18, 1.405],
      scale: [1.16, 0.56, 0.62],
      flat: true,
      name: "nose",
      group: "face",
    },
  );

  const mouthLine = b.part(
    new THREE.BoxGeometry(0.22, 0.045, 0.022),
    INK,
    {
      bone: jaw,
      at: [0, 1.115, 1.414],
      name: "mouthLine",
      group: "face",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.13, 0.022, 0.018),
    ROSE,
    {
      bone: lowerJaw.tip ?? jaw,
      at: [0, 1.075, 1.417],
      name: "lowerLip",
      group: "face",
    },
  );

  // Tusks are kept small and slightly splayed, more like carved ivory punctuation than elephant tusks.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.11, 1.19, 1.31],
      [s * 0.16, 1.04, 1.47],
      null,
      0.055,
      {
        color: IVORY,
        bone: jaw,
        section: { ngon: 6 },
        name: s > 0 ? "tuskL" : "tuskR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.025, 6, 4),
      GOLD,
      {
        bone: jaw,
        at: [s * 0.125, 1.16, 1.35],
        scale: [1.2, 0.5, 0.7],
        flat: true,
        name: s > 0 ? "tuskCollarL" : "tuskCollarR",
        group: "face",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Ears: broad, upright, and graphic like cut paper.

  const earOutline: [number, number][] = [
    [-0.15, -0.13],
    [0.02, -0.18],
    [0.17, -0.09],
    [0.21, 0.08],
    [0.15, 0.25],
    [0.03, 0.34],
    [-0.11, 0.27],
    [-0.2, 0.09],
  ];

  const earInnerOutline: [number, number][] = [
    [-0.1, -0.08],
    [0.01, -0.11],
    [0.11, -0.05],
    [0.13, 0.08],
    [0.09, 0.2],
    [0.02, 0.25],
    [-0.08, 0.19],
    [-0.13, 0.06],
  ];

  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.31, 1.58, 0.79],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 1,
      color: DEEP_INDIGO,
      bone: s > 0 ? earL : earR,
      name: s > 0 ? "earL" : "earR",
      group: "head",
    });

    b.extrude(earInnerOutline, {
      at: [s * 0.31, 1.58, 0.834],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: VERMILION,
      bone: s > 0 ? earL : earR,
      name: s > 0 ? "earInnerL" : "earInnerR",
      group: "head",
    });

    b.rod(
      [s * 0.27, 1.48, 0.85],
      [s * 0.42, 1.65, 0.85],
      0.012,
      OCHRE,
      {
        bone: s > 0 ? earL : earR,
        name: s > 0 ? "earCutL" : "earCutR",
        group: "head",
      },
    );
  }

  // A small forehead blade gives the spirit a silhouette cue without becoming a horn.
  const crest = b.extrude(
    [
      [-0.1, -0.02],
      [-0.05, 0.1],
      [0.0, 0.22],
      [0.07, 0.12],
      [0.12, -0.02],
      [0.04, -0.08],
      [-0.04, -0.08],
    ],
    {
      at: [0, 1.69, 1.03],
      x: [1, 0, 0],
      y: [0, 0.3, 1],
      thickness: 0.035,
      bevel: 0.006,
      color: VERMILION,
      bone: head,
      name: "foreheadCrest",
      group: "head",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.018, 0.15, 0.018),
    IVORY,
    {
      bone: head,
      at: crest.local([0, 0.08, 0.025]),
      name: "crestHighlight",
      group: "head",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs and feet. Each leg has a dark carved contour, a warm cuff, a chunky foot, and two separated toes.

  const footPoints = [
    [0.35, 0.14, 0.54],
    [-0.35, 0.14, 0.54],
    [0.37, 0.14, -0.22],
    [-0.37, 0.14, -0.22],
  ] as const;

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const p = footPoints[i];
    const footBone = leg.tip ?? leg.joints[leg.joints.length - 1];

    b.part(
      new THREE.BoxGeometry(0.27, 0.1, 0.3),
      INK,
      {
        bone: footBone,
        at: [p[0], 0.105, p[2] + 0.035],
        scale: [1, 1, 1],
        flat: true,
        name: `hoofOutline${i}`,
        group: "limbs",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.22, 0.085, 0.26),
      CREAM,
      {
        bone: footBone,
        at: [p[0], 0.13, p[2] + 0.04],
        flat: true,
        name: `hoof${i}`,
        group: "limbs",
      },
    );

    b.rod(
      [p[0], 0.24, p[2] - 0.015],
      [p[0], 0.24, p[2] + 0.12],
      0.022,
      VERMILION,
      {
        bone: leg.joints[Math.min(2, leg.joints.length - 1)],
        name: `legCuff${i}`,
        group: "limbs",
      },
    );
  }

  const toeEnds = [
    [0.31, 0.075, 0.69],
    [0.39, 0.075, 0.7],
    [-0.31, 0.075, 0.69],
    [-0.39, 0.075, 0.7],
    [0.33, 0.075, -0.06],
    [0.41, 0.075, -0.05],
    [-0.33, 0.075, -0.06],
    [-0.41, 0.075, -0.05],
  ] as const;

  for (let i = 0; i < toeEnds.length; i++) {
    const p = toeEnds[i];
    const s = p[0] > 0 ? 1 : -1;
    b.spike(
      [p[0], p[1] + 0.015, p[2] - 0.09],
      [p[0] + s * 0.012, p[1] - 0.005, p[2]],
      null,
      0.035,
      {
        color: IVORY,
        section: { ngon: 6 },
        bone: legs[Math.floor(i / 2)].tip ?? hips,
        name: `toeClaw${i}`,
        group: "limbs",
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Dorsal mane, tail tuft, and spirit wisps.

  b.along(body, 8, (at) =>
    b.spike(
      at,
      at,
      at.t < 0.45 ? 0.105 : 0.145,
      at.t < 0.45 ? 0.035 : 0.045,
      {
        color: at.t < 0.35 ? OCHRE : VERMILION,
        section: { ngon: 6 },
        name: `maneSpike${Math.round(at.t * 100)}`,
        group: "mane",
      },
    ),
  );

  const tailTuftOutline: [number, number][] = [
    [-0.14, -0.08],
    [-0.08, 0.04],
    [-0.11, 0.19],
    [-0.03, 0.12],
    [0.03, 0.28],
    [0.08, 0.11],
    [0.17, 0.18],
    [0.12, 0.0],
    [0.16, -0.09],
    [0, -0.15],
  ];

  b.extrude(tailTuftOutline, {
    at: [0.02, 1.31, -1.07],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.065,
    bevel: 0.009,
    smoothing: 1,
    color: OCHRE,
    bone: tail.tip ?? hips,
    name: "tailCoat",
    group: "body",
  });

  b.extrude(
    [
      [-0.07, -0.05],
      [-0.01, 0.02],
      [-0.03, 0.16],
      [0.04, 0.1],
      [0.09, 0.18],
      [0.08, -0.04],
      [0, -0.09],
    ],
    {
      at: [0.02, 1.32, -1.09],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: VERMILION,
      bone: tail.tip ?? hips,
      name: "tailTuftInner",
      group: "body",
    },
  );

  b.along(wispL, 3, (at) =>
    b.part(
      new THREE.SphereGeometry(0.055, 7, 5),
      at.t < 0.6 ? PALE_BLUE : GOLD,
      {
        bone: at.bone ?? head,
        at: at.at,
        flat: true,
        name: `wispLBead${Math.round(at.t * 10)}`,
        group: "spirit",
      },
    ),
  );

  b.along(wispR, 3, (at) =>
    b.part(
      new THREE.SphereGeometry(0.05, 7, 5),
      at.t < 0.6 ? TEAL : GOLD,
      {
        bone: at.bone ?? head,
        at: at.at,
        flat: true,
        name: `wispRBead${Math.round(at.t * 10)}`,
        group: "spirit",
      },
    ),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Ukiyo-e construction marks: one collar, sparse upper-body pelt marks, and graphic cheek bands.

  const collarItems = b.ring(neck.at(0.5), {
    count: 12,
    radius: 0.29,
    name: "collar",
    role: "fan",
    group: "body",
  });

  b.sweep(catmull(collarItems.items, { closed: true }), 0.026, {
    color: VERMILION,
    section: { ngon: 6 },
    caps: "none",
    name: "neckCollar",
    group: "body",
  });

  const upperMarks = b.surface(body).scatter(12, {
    rng: rng(27),
    minDist: 0.17,
    filter: (hit) => hit.n.y > -0.12 && hit.at.z < 0.38,
  });

  for (let i = 0; i < upperMarks.length; i++) {
    const hit = upperMarks[i];
    b.stick(
      new THREE.CylinderGeometry(0.042, 0.042, 0.012, 7),
      i % 3 === 0 ? OCHRE : VERMILION,
      hit,
      {
        embed: 0.35,
        name: `peltMark${i}`,
        group: "body",
      },
    );
  }

  for (const s of [1, -1]) {
    b.rod(
      [s * 0.29, 1.25, 1.04],
      [s * 0.32, 1.36, 1.09],
      0.012,
      OCHRE,
      {
        bone: head,
        name: s > 0 ? "cheekCutL" : "cheekCutR",
        group: "face",
      },
    );
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

```ts
// bodyWoodgrain — Painted the body in broad indigo woodblock hatching, with cream belly brushwork and sparse ochre rump flecks.
// headWoodgrain — Painted the head with deep-indigo contour cuts, cream muzzle blocks, and short ink brow strokes.
// earPrint — Painted mirrored vermilion and ochre ear wedges with three ink cut lines while preserving the indigo rim.
// tailPrint — Painted alternating ochre/cream tail blocks, an ink tip contour, and a restrained pale-blue spirit haze.

<<<<<<< SEARCH
  rng,
  type Builder,
=======
  noise,
  paint,
  rng,
  type Builder,
>>>>>>> REPLACE

<<<<<<< SEARCH
export const GOLD = "#d6a44a";

export const meta = {
=======
export const GOLD = "#d6a44a";

const bodyWoodgrain = paint((p, n) => {
  const hatch = Math.sin(p.z * 34 + p.x * 9 + Math.sin(p.y * 13) * 1.6);
  const bellyStroke = Math.sin(p.z * 31 + p.x * 18) > 0.15;
  const rumpFleck = p.z < -0.18 && noise(p, 0.09, 17) > 0.7;
  if (n.y < -0.2) return bellyStroke ? CREAM : "#d3bb88";
  if (rumpFleck) return OCHRE;
  return hatch > 0.82 ? DEEP_INDIGO : INDIGO;
});

const headWoodgrain = paint((p, n) => {
  const muzzle = p.z > 1.04 || (p.y < 1.32 && p.z > 0.8);
  if (muzzle) return Math.sin(p.x * 35 + p.y * 8) > 0.6 ? IVORY : CREAM;
  const contour = Math.sin(p.x * 44 + p.z * 18) > 0.82;
  const browCut = p.y < 1.58 && p.z > 0.88 && Math.sin(p.x * 52 + p.z * 21) > 0.78;
  if (browCut) return INK;
  if (contour || n.y < -0.25) return DEEP_INDIGO;
  return INDIGO;
});

const earPrint = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.45) return INDIGO;
  const side = p.x >= 0 ? 1 : -1;
  const x = s[0] * side;
  const y = s[1];
  const inside = Math.abs(x) < 0.145 && y > -0.1 && y < 0.27;
  if (!inside) return INDIGO;
  const cuts = [-0.07, 0, 0.07].some(
    (line) => Math.abs(x - line - 0.12 * y) < 0.008 && y > -0.02 && y < 0.18,
  );
  if (cuts) return INK;
  const vermilionWedge = y > -0.04 && y < 0.16 && x > -0.11 && x < 0.02 + y * 0.2;
  const ochreWedge = y > 0.03 && y < 0.23 && x > 0.03 && x < 0.12;
  if (vermilionWedge) return VERMILION;
  if (ochreWedge) return OCHRE;
  return INDIGO;
});

const tailPrintSweep = paint((_p, _n, s) => {
  const t = s[0];
  if (t < 0.72) return INDIGO;
  if (t > 0.94) return INK;
  const clock = ((s[1] % 360) + 360) % 360;
  if (t > 0.82 && (clock < 38 || clock > 322)) return PALE_BLUE;
  return Math.floor((t - 0.72) * 18) % 2 === 0 ? OCHRE : CREAM;
});

const tailPrintTuft = paint((_p, _n, s) => {
  const x = s[0];
  const y = s[1];
  if (x > 0.09 || (y > 0.18 && x > 0.03)) return INK;
  return Math.floor((x + 0.16) / 0.055) % 2 === 0 ? OCHRE : CREAM;
});

export const meta = {
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: INDIGO,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "bodyCoat",
    group: "body",
    sectors: [
      [112, 248, CREAM],
      [248, 292, OCHRE, 0.05, 0.72],
    ],
=======
    color: bodyWoodgrain,
    section: { ngon: 8 },
    smooth: false,
    caps: "round",
    name: "bodyCoat",
    group: "body",
>>>>>>> REPLACE

<<<<<<< SEARCH
    INDIGO,
    {
      bone: head,
=======
    headWoodgrain,
    {
      bone: head,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: DEEP_INDIGO,
      bone: s > 0 ? earL : earR,
      name: s > 0 ? "earL" : "earR",
=======
      color: earPrint,
      bone: s > 0 ? earL : earR,
      name: s > 0 ? "earL" : "earR",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: INDIGO,
    section: { ngon: 7 },
    smooth: false,
    caps: "round",
    name: "tailCoat",
    group: "body",
    bands: [
      [0.62, OCHRE],
      [0.84, CREAM],
      [1, OCHRE],
    ],
=======
    color: tailPrintSweep,
    section: { ngon: 7 },
    smooth: false,
    caps: "round",
    name: "tailCoat",
    group: "body",
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: OCHRE,
    bone: tail.tip ?? hips,
    name: "tailCoat",
    group: "body",
=======
    color: tailPrintTuft,
    bone: tail.tip ?? hips,
    name: "tailCoat",
    group: "body",
>>>>>>> REPLACE
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { catmull, type Builder } from "agentic-3js-builder";

export function addForeheadCrest(b: Builder) {
  const at = new THREE.Vector3(0, 1.78, 1.12);
  const normal = new THREE.Vector3(0, 0.72, 0.7).normalize();

  // Tangent axes on the sloping forehead. The +X direction is the creature's left;
  // the second axis climbs the brow while remaining flush to the surface.
  const xAxis = new THREE.Vector3(1, 0, 0);
  const yAxis = new THREE.Vector3(0, normal.z, -normal.y).normalize();

  const point = (x: number, y: number, lift = 0) =>
    at
      .clone()
      .addScaledVector(xAxis, x)
      .addScaledVector(yAxis, y)
      .addScaledVector(normal, lift);

  const outline = [
    [-0.13, -0.045],
    [-0.105, -0.073],
    [-0.045, -0.088],
    [0.035, -0.086],
    [0.105, -0.057],
    [0.13, -0.005],
    [0.118, 0.05],
    [0.073, 0.08],
    [0.01, 0.091],
    [-0.06, 0.082],
    [-0.115, 0.047],
  ] as [number, number][];

  // A broad dark carved seal gives the crest a strong woodblock silhouette.
  b.extrude(outline, {
    at,
    x: xAxis,
    y: yAxis,
    thickness: 0.022,
    bevel: 0.006,
    smoothing: 1,
    color: INK,
    bone: "head",
    name: "s21ForeheadSealOutline",
    group: "stage2",
  });

  // Vermilion inset, deliberately smaller than the ink plate so the dark registration
  // edge remains visible on every side.
  const inset = [
    [-0.102, -0.035],
    [-0.082, -0.057],
    [-0.032, -0.068],
    [0.03, -0.066],
    [0.082, -0.043],
    [0.103, -0.002],
    [0.092, 0.039],
    [0.052, 0.061],
    [0.005, 0.07],
    [-0.048, 0.063],
    [-0.09, 0.034],
  ] as [number, number][];

  b.extrude(inset, {
    at: point(0, 0, 0.013),
    x: xAxis,
    y: yAxis,
    thickness: 0.009,
    bevel: 0.003,
    smoothing: 1,
    color: VERMILION,
    bone: "head",
    name: "s21ForeheadSealRed",
    group: "stage2",
  });

  // The tomoe head: a dark rim and a flat vermilion comma bulb.
  b.part(new THREE.CircleGeometry(0.041, 12), INK, {
    bone: "head",
    at: point(0.058, -0.034, 0.025),
    dir: normal,
    axis: "z",
    flat: true,
    name: "s21TomoeHeadOutline",
    group: "stage2",
  });

  b.part(new THREE.CircleGeometry(0.031, 12), VERMILION, {
    bone: "head",
    at: point(0.058, -0.034, 0.031),
    dir: normal,
    axis: "z",
    flat: true,
    name: "s21TomoeHead",
    group: "stage2",
  });

  const spiral = catmull([
    point(0.058, -0.006, 0.031),
    point(0.091, 0.012, 0.031),
    point(0.081, 0.048, 0.031),
    point(0.035, 0.065, 0.031),
    point(-0.025, 0.056, 0.031),
    point(-0.067, 0.027, 0.031),
    point(-0.071, -0.012, 0.031),
    point(-0.042, -0.045, 0.031),
    point(0.006, -0.051, 0.031),
    point(0.041, -0.029, 0.031),
    point(0.043, 0.002, 0.031),
    point(0.019, 0.025, 0.031),
    point(-0.014, 0.024, 0.031),
    point(-0.03, 0.004, 0.031),
    point(-0.018, -0.015, 0.031),
    point(0.006, -0.018, 0.031),
  ]);

  // Ink underprint makes the spiral readable from a distance.
  b.sweep(spiral, 0.021, {
    bone: "head",
    color: INK,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "s21TomoeInk",
    group: "stage2",
  });

  // Slightly lifted red keyline leaves a consistent dark carved edge.
  b.sweep(spiral, 0.013, {
    bone: "head",
    color: VERMILION,
    section: { ngon: 6 },
    smooth: false,
    caps: "round",
    name: "s21TomoeRed",
    group: "stage2",
  });

  // Small cream registration glint on the upper curl.
  const highlight = catmull([
    point(-0.052, 0.046, 0.05),
    point(-0.028, 0.058, 0.05),
    point(0.002, 0.06, 0.05),
  ]);

  b.sweep(highlight, 0.0055, {
    bone: "head",
    color: CREAM,
    section: { ngon: 5 },
    smooth: false,
    caps: "round",
    name: "s21TomoeHighlight",
    group: "stage2",
  });

  // A tiny cream eye inside the comma gives the spirit seal a dream-consuming focal point.
  b.part(new THREE.CircleGeometry(0.009, 8), CREAM, {
    bone: "head",
    at: point(0.057, -0.034, 0.052),
    dir: normal,
    axis: "z",
    flat: true,
    name: "s21TomoeEye",
    group: "stage2",
  });

  // Two square printer's registration marks finish the graphic plaque without cluttering it.
  const mark = [
    [-0.011, -0.004],
    [0.011, -0.004],
    [0.011, 0.004],
    [-0.011, 0.004],
  ] as [number, number][];

  for (const [i, [mx, my]] of [
    [-0.092, 0.059],
    [0.081, -0.063],
  ] as [number, number][]) {
    b.extrude(mark, {
      at: point(mx, my, 0.048),
      x: xAxis,
      y: yAxis,
      thickness: 0.004,
      color: CREAM,
      bone: "head",
      name: `s21Registration${i}`,
      group: "stage2",
    });
  }
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import {
  catmull,
  frame,
  type Builder,
} from "agentic-3js-builder";

export function addMouthInterior(b: Builder) {
  // The jaw has already been posed by stage 1. These pieces are rigidly assigned to it
  // so the print-like mouth remains a single readable hinged graphic.

  const JAW = "jaw";

  // Deep open-mouth panel, inset behind the lips.
  b.part(
    new THREE.BoxGeometry(0.235, 0.072, 0.018),
    NIGHT,
    {
      bone: JAW,
      at: [0, 1.112, 1.431],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: "s22_mouthInterior",
      group: "face",
    },
  );

  // A warmer tongue shape breaks up the black interior without losing the heavy contour.
  b.part(
    new THREE.SphereGeometry(1, 8, 4),
    VERMILION,
    {
      bone: JAW,
      at: [0, 1.096, 1.447],
      scale: [0.095, 0.018, 0.042],
      flat: true,
      name: "s22_tongue",
      group: "face",
    },
  );

  // Thick carved upper and lower contours.
  b.rod(
    [-0.12, 1.151, 1.447],
    [0.12, 1.151, 1.447],
    0.009,
    INK,
    {
      bone: JAW,
      name: "s22_mouthUpperContour",
      group: "face",
    },
  );

  b.rod(
    [-0.105, 1.073, 1.45],
    [0.105, 1.073, 1.45],
    0.008,
    INK,
    {
      bone: JAW,
      name: "s22_mouthLowerContour",
      group: "face",
    },
  );

  // Thin vermilion lip laid over the lower contour.
  b.part(
    new THREE.BoxGeometry(0.19, 0.022, 0.025),
    VERMILION,
    {
      bone: JAW,
      at: [0, 1.078, 1.458],
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
      name: "s22_lowerLip",
      group: "face",
    },
  );

  // Two small downward-pointing ivory tooth glints.
  for (const s of [1, -1]) {
    b.spike(
      [s * 0.072, 1.145, 1.459],
      [s * 0.072, 1.111, 1.463],
      null,
      0.018,
      {
        color: IVORY,
        bone: JAW,
        section: { ngon: 5 },
        name: s > 0 ? "s22_toothGlintL" : "s22_toothGlintR",
        group: "face",
      },
    );
  }

  // A tiny central ink notch gives the mouth a carved, calligraphic termination.
  b.part(
    new THREE.SphereGeometry(0.012, 6, 4),
    INK,
    {
      bone: JAW,
      at: [0, 1.12, 1.466],
      flat: true,
      name: "s22_mouthNotch",
      group: "face",
    },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Three narrow cord bands around the visible left (+X) tusk. The rings are made as actual closed sweeps,
  // perpendicular to the tusk axis, so they read as wrapped cords rather than floating decals.

  const tuskRoot = new THREE.Vector3(0.11, 1.19, 1.31);
  const tuskTip = new THREE.Vector3(0.16, 1.04, 1.47);
  const tuskAxis = tuskTip.clone().sub(tuskRoot).normalize();

  const bandFractions = [0.31, 0.52, 0.73];
  const bandColors = [OCHRE, VERMILION, OCHRE];

  for (let i = 0; i < bandFractions.length; i++) {
    const p = tuskRoot.clone().lerp(tuskTip, bandFractions[i]);
    const ringFrame = frame(p, tuskAxis);
    const ring = b.ring(ringFrame, {
      count: 8,
      radius: 0.043,
      name: `s22_tuskBandRing${i}`,
      group: "face",
    });

    b.sweep(
      catmull(ring.items, { closed: true }),
      0.006,
      {
        bone: JAW,
        color: bandColors[i],
        section: { ngon: 6 },
        caps: "none",
        name: `s22_tuskBand${i}`,
        group: "face",
      },
    );
  }

  // Small dark knot seated on the outward side of the middle band.
  const knotPoint = tuskRoot.clone().lerp(tuskTip, 0.52);
  const outward = new THREE.Vector3(0.9, 0.15, 0.38).normalize();
  knotPoint.addScaledVector(outward, 0.044);

  b.part(
    new THREE.SphereGeometry(0.013, 7, 5),
    INK,
    {
      bone: JAW,
      at: knotPoint,
      scale: [1.15, 0.75, 0.8],
      flat: true,
      name: "s22_tuskKnot",
      group: "face",
    },
  );

  // Two short cord tails make the knot legible at the model's viewing distance.
  b.rod(
    knotPoint,
    knotPoint.clone().add(new THREE.Vector3(0.018, -0.018, 0.012)),
    0.0045,
    INK,
    {
      bone: JAW,
      name: "s22_tuskKnotTailA",
      group: "face",
    },
  );

  b.rod(
    knotPoint,
    knotPoint.clone().add(new THREE.Vector3(-0.012, -0.024, 0.016)),
    0.0045,
    INK,
    {
      bone: JAW,
      name: "s22_tuskKnotTailB",
      group: "face",
    },
  );
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { catmull, svg, type Builder } from "agentic-3js-builder";

export function addDreamRibbon(b: Builder) {
  const group = "stage2";

  // A dark carved contour beneath the painted spirit ribbon makes it read like a
  // separate woodblock mark even when it crosses the pale muzzle.
  const ribbonPath = catmull([
    [0.0, 1.31, 1.405],
    [0.055, 1.365, 1.432],
    [0.135, 1.415, 1.445],
    [0.155, 1.485, 1.445],
    [0.115, 1.545, 1.44],
    [0.035, 1.565, 1.435],
    [-0.055, 1.535, 1.435],
    [-0.09, 1.475, 1.435],
    [-0.045, 1.445, 1.435],
    [0.02, 1.47, 1.435],
  ]);

  b.sweep(ribbonPath, 0.031, {
    bone: "upperTip",
    color: INK,
    section: { ngon: 6 },
    caps: "round",
    name: "s23DreamRibbonInk",
    group,
  });

  b.sweep(ribbonPath, 0.021, {
    bone: "upperTip",
    color: PALE_BLUE,
    section: { ngon: 6 },
    caps: "round",
    name: "s23DreamRibbon",
    group,
  });

  // A narrow cream registration-like highlight gives the ribbon a hand-printed
  // edge without turning it into a glossy tube.
  const ribbonHighlight = catmull([
    [0.012, 1.34, 1.431],
    [0.07, 1.385, 1.463],
    [0.125, 1.43, 1.47],
    [0.135, 1.475, 1.47],
  ]);

  b.sweep(ribbonHighlight, 0.005, {
    bone: "upperTip",
    color: CREAM,
    section: { ngon: 5 },
    caps: "round",
    name: "s23DreamRibbonHighlight",
    group,
  });

  // Teal bead at the outside of the curl, with a tiny dark inset so it reads
  // as a carved ornament rather than a plain sphere.
  b.part(new THREE.SphereGeometry(0.036, 8, 6), TEAL, {
    bone: "upperTip",
    at: [0.145, 1.475, 1.452],
    flat: true,
    name: "s23RibbonBead",
    group,
  });

  b.part(new THREE.SphereGeometry(0.013, 7, 5), INK, {
    bone: "upperTip",
    at: [0.147, 1.478, 1.483],
    flat: true,
    name: "s23RibbonBeadInset",
    group,
  });

  // The inward tip carries a small diamond-shaped gold charm and a short
  // vermilion hanging cord.
  b.rod(
    [0.019, 1.468, 1.44],
    [0.031, 1.438, 1.442],
    0.008,
    VERMILION,
    {
      bone: "upperTip",
      name: "s23RibbonCharmCord",
      group,
    },
  );

  b.extrude(
    [
      [0, 0.045],
      [0.036, 0],
      [0, -0.048],
      [-0.036, 0],
    ],
    {
      at: [0.032, 1.425, 1.442],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: GOLD,
      bone: "upperTip",
      name: "s23RibbonGoldCharm",
      group,
    },
  );

  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.012), INK, {
    bone: "upperTip",
    at: [0.032, 1.425, 1.456],
    flat: true,
    name: "s23RibbonCharmMark",
    group,
  });

  // A transparent ukiyo-e seal: the double oval is slightly irregular, with
  // a vermilion cloud glyph and two cream registration marks. The decal keeps
  // the design seated on the curved back rather than floating as a card.
  const seal = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="80" cy="50" rx="67" ry="37" stroke-width="5"/>
        <ellipse cx="80" cy="50" rx="62" ry="33" stroke-width="1.8" opacity="0.8"/>
        <path d="M31 32 Q39 25 47 31 M113 69 Q121 76 129 68"
              stroke-width="2.2" opacity="0.75"/>
      </g>

      <path d="M47 56
               C39 51 41 42 50 40
               C57 38 63 43 63 49
               C63 40 71 35 79 39
               C87 43 86 52 80 56
               C88 53 98 56 99 64
               C100 72 90 76 82 71
               C75 77 64 76 62 68
               C55 70 48 66 47 56Z"
            fill="${VERMILION}" stroke="${INK}" stroke-width="3.2"
            stroke-linejoin="round"/>

      <path d="M59 52
               C64 48 68 49 70 53
               C72 57 68 61 64 60
               M82 48
               C87 45 92 47 93 51
               C94 55 91 58 87 58"
            fill="none" stroke="${CREAM}" stroke-width="3.1"
            stroke-linecap="round"/>

      <g fill="${CREAM}" stroke="${INK}" stroke-width="1.4">
        <path d="M22 47 l7 0 l0 3 l-7 0Z M24 45 l3 0 l0 7 l-3 0Z"/>
        <path d="M131 47 l7 0 l0 3 l-7 0Z M133 45 l3 0 l0 7 l-3 0Z"/>
      </g>

      <path d="M73 28 Q80 24 87 28 M72 72 Q80 76 88 72"
            fill="none" stroke="${OCHRE}" stroke-width="2"
            stroke-linecap="round" opacity="0.9"/>
    </svg>`,
    { size: 512 },
  );

  b.decal(b.root, seal, {
    at: [0, 1.48, -0.05],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.38, 0.24],
    segments: 12,
    lift: 0.006,
    bone: "back",
    name: "s23BackSeal",
    group,
  });

  // A few physical registration studs just outside the printed seal add a
  // restrained layered-print feel and catch the light from above.
  for (const z of [-0.145, 0.045]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6), GOLD, {
      bone: "back",
      at: [0.205, 1.515, z],
      dir: [0, 1, 0],
      flat: true,
      name: `s23SealStud${z < 0 ? "A" : "B"}`,
      group,
    });
  }

  // Two very short ink cuts below the seal mimic the broken edges of a
  // hand-carved border while leaving the indigo back visibly open.
  b.rod(
    [-0.16, 1.505, -0.155],
    [-0.09, 1.515, -0.16],
    0.006,
    INK,
    {
      bone: "back",
      name: "s23SealLowerCutL",
      group,
    },
  );

  b.rod(
    [0.09, 1.515, 0.06],
    [0.16, 1.505, 0.055],
    0.006,
    INK,
    {
      bone: "back",
      name: "s23SealLowerCutR",
      group,
    },
  );
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addEarCharms(b: Builder) {
  const diamond = (w: number, h: number): [number, number][] => [
    [0, -h * 0.5],
    [w * 0.5, 0],
    [0, h * 0.5],
    [-w * 0.5, 0],
  ];

  for (const side of [1, -1]) {
    const bone = side > 0 ? "earL" : "earR";
    const attach = new THREE.Vector3(0.43 * side, 1.53, 0.8);

    // Mirror the supplied outward normal across the creature's mid-plane.
    const normal = new THREE.Vector3(0.7 * side, 0.3, 0.6).normalize();

    // A vertical tangent and a broad tangent across the ornament face.
    const up = new THREE.Vector3(0, 1, 0);
    const yAxis = up
      .clone()
      .addScaledVector(normal, -up.dot(normal))
      .normalize();
    const xAxis = yAxis.clone().cross(normal).normalize();

    const point = (u: number, v: number, depth = 0) =>
      attach
        .clone()
        .addScaledVector(xAxis, u)
        .addScaledVector(yAxis, v)
        .addScaledVector(normal, depth);

    // Dark carved silhouette behind the ornament.
    b.extrude(diamond(0.098, 0.132), {
      at: point(0, 0, 0.004),
      x: xAxis,
      y: yAxis,
      thickness: 0.016,
      bevel: 0.006,
      color: INK,
      bone,
      flat: true,
      name: side > 0 ? "s24_earCharmOutlineL" : "s24_earCharmOutlineR",
      group: "earCharms",
    });

    // Main gold diamond plate.
    b.extrude(diamond(0.084, 0.114), {
      at: point(0, 0, 0.014),
      x: xAxis,
      y: yAxis,
      thickness: 0.011,
      bevel: 0.004,
      color: GOLD,
      bone,
      flat: true,
      name: side > 0 ? "s24_earCharmGoldL" : "s24_earCharmGoldR",
      group: "earCharms",
    });

    // Vermilion inset, like a second carved color pass.
    b.extrude(diamond(0.056, 0.078), {
      at: point(0, 0, 0.022),
      x: xAxis,
      y: yAxis,
      thickness: 0.005,
      bevel: 0.002,
      color: VERMILION,
      bone,
      flat: true,
      name: side > 0 ? "s24_earCharmInsetL" : "s24_earCharmInsetR",
      group: "earCharms",
    });

    // Four tiny gold corner rivets make the plate feel assembled rather than painted on.
    const rivets = [
      [0.028, 0.028],
      [-0.028, 0.028],
      [0.028, -0.028],
      [-0.028, -0.028],
    ];
    rivets.forEach(([u, v], i) => {
      b.part(
        new THREE.SphereGeometry(0.0065, 6, 4),
        GOLD,
        {
          bone,
          at: point(u, v, 0.031),
          flat: true,
          name: `s24_earRivet${side > 0 ? "L" : "R"}${i}`,
          group: "earCharms",
        },
      );
    });

    // A small raised gold boss catches the light at the center.
    b.part(
      new THREE.OctahedronGeometry(0.013, 0),
      GOLD,
      {
        bone,
        at: point(0, 0, 0.034),
        scale: [1, 0.55, 1],
        flat: true,
        name: side > 0 ? "s24_earCharmBossL" : "s24_earCharmBossR",
        group: "earCharms",
      },
    );

    // Vermilion cord: two dark under-strokes and two thinner red over-strokes.
    const leftTop = point(-0.026, -0.035, 0.026);
    const rightTop = point(0.026, -0.035, 0.026);
    const knot = point(0, -0.074, 0.028);

    for (const [i, start] of [leftTop, rightTop].entries()) {
      b.rod(start, knot, 0.008, INK, {
        bone,
        caps: "round",
        name: `s24_cordShadow${side > 0 ? "L" : "R"}${i}`,
        group: "earCharms",
      });
      b.rod(start, knot, 0.0045, VERMILION, {
        bone,
        caps: "round",
        name: `s24_cord${side > 0 ? "L" : "R"}${i}`,
        group: "earCharms",
      });
    }

    // Two small red knots sit at the plate's lower corners.
    for (const [i, u] of [-0.026, 0.026].entries()) {
      b.part(
        new THREE.SphereGeometry(0.009, 7, 5),
        VERMILION,
        {
          bone,
          at: point(u, -0.035, 0.029),
          flat: true,
          name: `s24_cordKnot${side > 0 ? "L" : "R"}${i}`,
          group: "earCharms",
        },
      );
    }

    // A small hanging gold diamond repeats the plate motif below the cords.
    const pendantCenter = point(0, -0.083, 0.025);

    b.extrude(diamond(0.052, 0.062), {
      at: pendantCenter.clone().addScaledVector(normal, -0.004),
      x: xAxis,
      y: yAxis,
      thickness: 0.012,
      bevel: 0.004,
      color: INK,
      bone,
      flat: true,
      name: side > 0 ? "s24_pendantOutlineL" : "s24_pendantOutlineR",
      group: "earCharms",
    });

    b.extrude(diamond(0.039, 0.049), {
      at: pendantCenter.clone().addScaledVector(normal, 0.006),
      x: xAxis,
      y: yAxis,
      thickness: 0.008,
      bevel: 0.003,
      color: GOLD,
      bone,
      flat: true,
      name: side > 0 ? "s24_pendantGoldL" : "s24_pendantGoldR",
      group: "earCharms",
    });

    // The lower bead and a pair of tiny gold tassel strokes complete the charm.
    const bead = point(0, -0.116, 0.027);

    b.part(
      new THREE.SphereGeometry(0.012, 8, 5),
      VERMILION,
      {
        bone,
        at: bead,
        flat: true,
        name: side > 0 ? "s24_pendantBeadL" : "s24_pendantBeadR",
        group: "earCharms",
      },
    );

    const tasselTop = bead.clone().addScaledVector(yAxis, -0.008);
    for (const [i, u] of [-0.009, 0.009].entries()) {
      b.rod(
        tasselTop.clone().addScaledVector(xAxis, u),
        tasselTop
          .clone()
          .addScaledVector(xAxis, u * 1.25)
          .addScaledVector(yAxis, -0.018),
        0.003,
        GOLD,
        {
          bone,
          caps: "round",
          name: `s24_tassel${side > 0 ? "L" : "R"}${i}`,
          group: "earCharms",
        },
      );
    }
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addManeRibbons(b: Builder) {
  // The ribbons are made as ink-backed, slightly irregular woodblock plates. Each one
  // sits at a different point along the back so the three strips read as threaded
  // through the separate mane spikes rather than as one floating decal.
  const ribbon = (
    x: number,
    z: number,
    main: string,
    end: string,
    lean: number,
    index: number,
  ) => {
    const w = 0.027;
    const outline: [number, number][] = [
      [-w, -0.132],
      [w, -0.132],
      [w + lean, -0.005],
      [w * 0.82 + lean, 0.132],
      [-w * 0.82 + lean, 0.132],
      [-w + lean, -0.005],
    ];

    b.extrude(outline, {
      at: [x, 1.61, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.004,
      color: INK,
      bone: "back",
      name: `s25ManeRibbonInk${index}`,
      group: "s25",
    });

    const inner: [number, number][] = [
      [-w * 0.68, -0.116],
      [w * 0.68, -0.116],
      [w * 0.68 + lean * 0.7, 0.0],
      [w * 0.55 + lean * 0.7, 0.113],
      [-w * 0.55 + lean * 0.7, 0.113],
      [-w * 0.68 + lean * 0.7, 0.0],
    ];

    b.extrude(inner, {
      at: [x, 1.61, z + 0.019],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: main,
      bone: "back",
      name: `s25ManeRibbon${index}`,
      group: "s25",
    });

    // A square terminal tab gives each strip a clear carved-paper ending.
    b.part(new THREE.BoxGeometry(0.057, 0.027, 0.018), end, {
      bone: "back",
      at: [x + lean * 0.35, 1.485, z + 0.027],
      flat: true,
      name: `s25ManeRibbonEnd${index}`,
      group: "s25",
    });

    // Small dark cut marks imitate the gaps and registration cuts of a woodblock print.
    for (const y of [1.535, 1.625]) {
      b.rod(
        [x - 0.015 + lean * 0.16, y, z + 0.029],
        [x + 0.015 + lean * 0.16, y, z + 0.029],
        0.0038,
        INK,
        {
          bone: "back",
          name: `s25ManeCut${index}_${Math.round(y * 1000)}`,
          group: "s25",
        },
      );
    }
  };

  ribbon(0.075, -0.08, VERMILION, CREAM, 0.004, 0);
  ribbon(0.0, -0.27, CREAM, VERMILION, -0.003, 1);
  ribbon(-0.075, -0.46, VERMILION, CREAM, 0.005, 2);

  // -------------------------------------------------------------------------------------------------------------
  // Tail bell and tassel. The dark outer lathe is intentionally a little larger than
  // the gold body, producing a crisp ink contour without adding a separate outline texture.

  const bellAxis = new THREE.Vector3(0, -0.24, -1).normalize();
  const bellAt = new THREE.Vector3(0.04, 1.335, -1.112);

  const bellOutline: [number, number][] = [
    [0, -0.047],
    [0.031, -0.047],
    [0.052, -0.029],
    [0.056, -0.005],
    [0.049, 0.031],
    [0.036, 0.047],
    [0, 0.052],
  ];

  b.lathe(bellOutline, {
    at: bellAt,
    axis: bellAxis,
    segments: 10,
    smoothing: 0,
    color: INK,
    bone: "tailTip",
    name: "s25TailBellInk",
    group: "s25",
  });

  const bellGold: [number, number][] = [
    [0, -0.041],
    [0.026, -0.041],
    [0.045, -0.025],
    [0.049, -0.004],
    [0.043, 0.027],
    [0.031, 0.041],
    [0, 0.045],
  ];

  const bellFace = bellAt.clone().addScaledVector(bellAxis, 0.005);
  b.lathe(bellGold, {
    at: bellFace,
    axis: bellAxis,
    segments: 10,
    smoothing: 0,
    color: GOLD,
    bone: "tailTip",
    name: "s25TailBell",
    group: "s25",
  });

  // Dark and gold mouth rims make the bell readable even when it overlaps the tuft.
  const mouthAt = bellAt.clone().addScaledVector(bellAxis, 0.048);

  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.014, 10), INK, {
    bone: "tailTip",
    at: mouthAt,
    dir: bellAxis,
    name: "s25TailBellRimInk",
    group: "s25",
  });

  b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.017, 10), GOLD, {
    bone: "tailTip",
    at: mouthAt.clone().addScaledVector(bellAxis, 0.004),
    dir: bellAxis,
    name: "s25TailBellRim",
    group: "s25",
  });

  // The hanging cord is a simple ink stroke, with one gold knot at the tail tuft.
  const cordTop = new THREE.Vector3(0.04, 1.375, -1.078);
  const cordBottom = bellAt.clone().addScaledVector(bellAxis, -0.025);

  b.rod(cordTop, cordBottom, 0.012, INK, {
    bone: "tailTip",
    name: "s25TailBellCordInk",
    group: "s25",
  });

  b.rod(
    cordTop.clone().addScaledVector(bellAxis, 0.004),
    cordBottom.clone().addScaledVector(bellAxis, 0.004),
    0.006,
    GOLD,
    {
      bone: "tailTip",
      name: "s25TailBellCord",
      group: "s25",
    },
  );

  b.part(new THREE.SphereGeometry(0.021, 7, 5), GOLD, {
    bone: "tailTip",
    at: cordTop,
    flat: true,
    name: "s25TailBellKnot",
    group: "s25",
  });

  // A dark clapper peeks from the mouth, with a gold bead at its end.
  const clapperStart = mouthAt.clone().addScaledVector(bellAxis, 0.006);
  const clapperEnd = clapperStart.clone().addScaledVector(bellAxis, 0.032);

  b.rod(clapperStart, clapperEnd, 0.006, INK, {
    bone: "tailTip",
    name: "s25TailClapperStem",
    group: "s25",
  });

  b.part(new THREE.SphereGeometry(0.015, 7, 5), GOLD, {
    bone: "tailTip",
    at: clapperEnd,
    flat: true,
    name: "s25TailClapper",
    group: "s25",
  });

  // Three short PALE_BLUE tassel strands are outlined in ink and terminate in square
  // print-like tabs. They stay inside the small room reserved around the tail tuft.
  const tasselTop = mouthAt.clone().addScaledVector(bellAxis, 0.018);
  const strands = [
    { x: -0.026, y: 1.255, z: -1.155 },
    { x: 0.0, y: 1.247, z: -1.158 },
    { x: 0.026, y: 1.255, z: -1.155 },
  ];

  for (let i = 0; i < strands.length; i++) {
    const s = strands[i];
    const start = new THREE.Vector3(
      tasselTop.x + (i - 1) * 0.018,
      tasselTop.y,
      tasselTop.z,
    );
    const end = new THREE.Vector3(s.x, s.y, s.z);

    b.rod(start, end, 0.011, INK, {
      bone: "tailTip",
      name: `s25TailTasselInk${i}`,
      group: "s25",
    });

    b.rod(
      start.clone().addScaledVector(bellAxis, 0.004),
      end.clone().addScaledVector(bellAxis, 0.004),
      0.0065,
      PALE_BLUE,
      {
        bone: "tailTip",
        name: `s25TailTassel${i}`,
        group: "s25",
      },
    );

    b.part(new THREE.BoxGeometry(0.026, 0.026, 0.016), PALE_BLUE, {
      bone: "tailTip",
      at: end,
      flat: true,
      name: `s25TailTasselTab${i}`,
      group: "s25",
    });

    b.part(new THREE.BoxGeometry(0.018, 0.009, 0.018), INK, {
      bone: "tailTip",
      at: end.clone().add(new THREE.Vector3(0, 0.018, 0)),
      flat: true,
      name: `s25TailTasselTabInk${i}`,
      group: "s25",
    });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addHoofSeals(b: Builder) {
  const sealTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <path d="M42 76
        C27 77 19 68 23 57
        C26 48 36 45 45 48
        C48 35 59 28 71 33
        C78 20 96 19 104 32
        C118 27 132 36 132 49
        C144 51 149 61 145 70
        C141 79 128 82 116 78
        C105 91 86 94 73 84
        C62 91 49 89 42 76Z"
        fill="none" stroke="${INK}" stroke-width="8"
        stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M20 102 H140" stroke="${VERMILION}" stroke-width="11"
        stroke-linecap="square"/>
      <path d="M31 101 H129" stroke="${GOLD}" stroke-width="2"
        opacity=".9"/>
    </svg>`,
    { size: 192 },
  );

  const plaqueGeo = new THREE.BoxGeometry(0.215, 0.016, 0.17);
  const insetGeo = new THREE.BoxGeometry(0.188, 0.018, 0.145);
  const edgeGeo = new THREE.BoxGeometry(0.15, 0.008, 0.014);
  const studGeo = new THREE.SphereGeometry(0.009, 6, 4);

  // Stage 1's planted hoof centres. The request anchor is the front-left hoof;
  // the other three are its visible mirrored/front-back companions.
  const feet = [
    { x: 0.35, z: 0.54, bone: "footFL" },
    { x: -0.35, z: 0.54, bone: "footFR" },
    { x: 0.37, z: -0.22, bone: "footHL" },
    { x: -0.37, z: -0.22, bone: "footHR" },
  ];

  for (let i = 0; i < feet.length; i++) {
    const foot = feet[i];
    const y = 0.181;

    b.part(plaqueGeo, INK, {
      bone: foot.bone,
      at: [foot.x, y - 0.006, foot.z + 0.035],
      flat: true,
      name: `s26_hoofSealBacking${i}`,
      group: "stage2-hoof-seals",
    });

    b.part(insetGeo, CREAM, {
      bone: foot.bone,
      at: [foot.x, y + 0.006, foot.z + 0.035],
      flat: true,
      name: `s26_hoofSeal${i}`,
      group: "stage2-hoof-seals",
    });

    b.part(edgeGeo, VERMILION, {
      bone: foot.bone,
      at: [foot.x, y + 0.02, foot.z + 0.094],
      flat: true,
      name: `s26_hoofSealRedEdge${i}`,
      group: "stage2-hoof-seals",
    });

    // The transparent print sits just above the cream plaque, so the cloud mark
    // remains crisp even with the low-poly inset and its dark border.
    b.part(new THREE.PlaneGeometry(0.178, 0.127), CREAM, {
      bone: foot.bone,
      at: [foot.x, y + 0.022, foot.z + 0.035],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: sealTexture,
      name: `s26_hoofSealPrint${i}`,
      group: "stage2-hoof-seals",
    });

    // Four tiny registration studs give each plaque the hand-printed,
    // assembled-ornament character without making it look metallic.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.part(studGeo, GOLD, {
          bone: foot.bone,
          at: [foot.x + sx * 0.084, y + 0.026, foot.z + 0.035 + sz * 0.058],
          flat: true,
          name: `s26_hoofSealStud${i}_${sx}_${sz}`,
          group: "stage2-hoof-seals",
        });
      }
    }
  }

  // The first bead is tucked into the first bend of the left dream wisp;
  // the second is placed near the supplied stage-2 anchor.
  const beads = [
    { at: [0.315, 1.605, 0.55] as [number, number, number], name: "A" },
    { at: [0.38, 1.74, 0.67] as [number, number, number], name: "B" },
  ];

  const beadInk = new THREE.SphereGeometry(0.065, 8, 6);
  const beadBlue = new THREE.SphereGeometry(0.052, 8, 6);
  const beadCore = new THREE.OctahedronGeometry(0.019, 0);
  const beadPin = new THREE.SphereGeometry(0.008, 6, 4);

  for (const bead of beads) {
    const [x, y, z] = bead.at;

    // Dark silhouette rim.
    b.part(beadInk, INK, {
      bone: "wispL1",
      at: bead.at,
      flat: true,
      name: `s26_spiritBeadRim${bead.name}`,
      group: "stage2-spirit-beads",
    });

    // Pale blue inset leaves a deliberate ink halo around the bead.
    b.part(beadBlue, PALE_BLUE, {
      bone: "wispL1",
      at: [x, y, z + 0.004],
      flat: true,
      name: `s26_spiritBead${bead.name}`,
      group: "stage2-spirit-beads",
    });

    // Small faceted gold dream-kernel.
    b.part(beadCore, GOLD, {
      bone: "wispL1",
      at: [x, y, z + 0.052],
      flat: true,
      name: `s26_spiritBeadCore${bead.name}`,
      group: "stage2-spirit-beads",
    });

    // A tiny dark hanging pin visually joins the ornament to the vapor ribbon.
    b.part(beadPin, INK, {
      bone: "wispL1",
      at: [x, y - 0.058, z],
      flat: true,
      name: `s26_spiritBeadPin${bead.name}`,
      group: "stage2-spirit-beads",
    });

    // Two short gold ticks read like carved highlights rather than glitter.
    b.rod(
      [x - 0.019, y + 0.021, z + 0.01],
      [x + 0.019, y + 0.021, z + 0.01],
      0.004,
      GOLD,
      {
        bone: "wispL1",
        name: `s26_spiritBeadHighlight${bead.name}`,
        group: "stage2-spirit-beads",
      },
    );
    b.rod(
      [x, y + 0.003, z - 0.014],
      [x, y + 0.003, z + 0.027],
      0.0035,
      GOLD,
      {
        bone: "wispL1",
        name: `s26_spiritBeadHighlightV${bead.name}`,
        group: "stage2-spirit-beads",
      },
    );
  }
}
```