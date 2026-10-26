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