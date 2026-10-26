import * as THREE from "three";
import { type Builder, createBuilder, catmull, limb, paint, svg } from "../../../../src/index";

export const PALETTE = {
  ink: "#241b2b",
  body: "#3f5364",
  bodyDark: "#293847",
  belly: "#d8c49b",
  muzzle: "#b39b78",
  eye: "#f2dfb0",
  pupil: "#171521",
  tusk: "#eee0b1",
  earInner: "#8d4d4c",
  mane: "#202938",
  red: "#a83f43",
  ochre: "#c28a45",
  cloud: "#d9c7a1",
  shadow: "#596b75",
} as const;

export const REQUESTS = [
  {
    id: "dreamClouds",
    kind: "add",
    part: "body",
    what: "A restrained ukiyo-e dream cloud assembly curling around the baku's shoulders and rump: three overlapping flat cloud curls in CLOUD, INK, and OCHRE, with broad carved-looking contour shapes. Keep it attached to the body and inside the reserved shoulder and rump space.",
    at: [0, 1.02, 0.08],
    normal: [0, 1, 0],
    bone: "hips",
    room: [0.95, 0.5, 1.15],
  },
  {
    id: "browCrest",
    kind: "add",
    part: "head",
    what: "A dramatic but compact forehead crest in OCHRE and RED, shaped like two broad ukiyo-e brush blades rising between the ears, with a dark INK outline layer. Do not cover the eyes or snout.",
    at: [0, 1.67, 0.86],
    normal: [0, 1, 0.2],
    bone: "head",
    room: [0.42, 0.34, 0.22],
  },
  {
    id: "earRibbons",
    kind: "add",
    part: "head",
    what: "Short red ceremonial ribbons tied behind both ears, each with a knot, two angular tails, and tiny OCHRE tips. They should hang outward and backward without obscuring the face.",
    at: [0.16, 1.62, 0.69],
    normal: [0.5, 0.5, -0.5],
    bone: "head",
    room: [0.58, 0.35, 0.35],
  },
  {
    id: "dreamJar",
    kind: "add",
    part: "back",
    what: "A small lacquered dream jar strapped to the baku's back: squat dark red vessel, OCHRE lid, two black straps, and three little pale dream wisps escaping upward. Keep it low and centered so the silhouette remains readable.",
    at: [0, 1.34, -0.18],
    normal: [0, 1, 0],
    bone: "spine2",
    room: [0.42, 0.48, 0.4],
  },
  {
    id: "ankleBands",
    kind: "add",
    part: "legs",
    what: "Four simple ukiyo-e ankle bands, one on each lower leg: broad RED bands with one thin OCHRE edge, following the leg angle and leaving the feet clear.",
    at: [0.33, 0.27, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.36, 1.05],
  },
  {
    id: "tailCharm",
    kind: "add",
    part: "tail",
    what: "A tiny OCHRE bell and red cord at the end of the short tail, with one dark clapper. It should sit just beyond the tail tuft and read as a spirit charm.",
    at: [0.01, 0.73, -0.98],
    normal: [0, 0, -1],
    bone: "tail2",
    room: [0.18, 0.24, 0.2],
  },
  {
    id: "tuskCaps",
    kind: "add",
    part: "muzzle",
    what: "Two small carved OCHRE caps at the roots of the tusks, with dark red inset bands. They should reinforce the tapir silhouette without lengthening the tusks.",
    at: [0.1, 1.18, 0.99],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.34, 0.25, 0.22],
  },
  {
    id: "pawMarks",
    kind: "add",
    part: "feet",
    what: "Four flat dark INK paw pads and three small toe marks per foot, arranged like block-printed woodcut shapes on the top/front of each broad foot.",
    at: [0.31, 0.105, 0.35],
    normal: [0, 1, 0],
    bone: null,
    room: [0.95, 0.12, 0.8],
  },
  {
    id: "bodyTexture",
    kind: "texture",
    part: "body",
    what: "Apply a flat ukiyo-e woodblock pattern: BODY as the main field, BODY_DARK along the lower flank and rear plane, with sparse broad vertical hatch marks in SHADOW. Keep the center of the flank mostly plain for the dream-cloud emblem.",
    at: [0, 1.04, 0],
    normal: [0, 1, 0],
    bone: null,
    room: null,
  },
  {
    id: "bellyTexture",
    kind: "texture",
    part: "belly",
    what: "Paint the underside in BELLY with a slightly irregular carved edge against BODY, using wide dark blue-gray hatch strokes rather than a smooth gradient.",
    at: [0, 0.88, 0.1],
    normal: [0, -1, 0],
    bone: null,
    room: null,
  },
  {
    id: "faceTexture",
    kind: "texture",
    part: "head",
    what: "Use BODY and MUZZLE as two hard ukiyo-e color blocks: a pale MUZZLE mask around the eyes and long snout, a BODY forehead, and a few INK contour lines at the cheek and brow. Leave both eye surfaces clear.",
    at: [0, 1.48, 0.82],
    normal: [0, 0.3, 1],
    bone: "head",
    room: null,
  },
] as const;

export const STAGE2: ((b: Builder) => void)[] = [];

const bodyTexture = paint((p, n) => {
  const lower = p.y < 0.91 || (p.z < -0.34 && p.y < 1.25);
  const flankCenter = Math.abs(p.x) < 0.22 && p.z > -0.27 && p.z < 0.35;

  if (lower) return PALETTE.bodyDark;

  // Broad, irregular vertical woodblock hatching, deliberately omitted from
  // the central flank so the future dream-cloud emblem has breathing room.
  const hatchBand = Math.sin(p.x * 31 + Math.sin(p.z * 4.5) * 1.7);
  const hatch = !flankCenter && hatchBand > 0.86 && p.y > 0.93;
  if (hatch) return PALETTE.shadow;

  return PALETTE.body;
});

const bellyTexture = paint((p, n) => {
  const boundary =
    0.91 +
    0.035 * Math.sin(p.z * 15.0) +
    0.018 * Math.sin(p.x * 27.0 + p.z * 5.0);

  if (p.y < boundary || n.y < -0.42) {
    const hatch = Math.sin(p.z * 24 + p.x * 7) > 0.72;
    return hatch ? PALETTE.shadow : PALETTE.belly;
  }
  return PALETTE.body;
});

const faceTexture = paint((p, n) => {
  // The mask begins as a hard carved shape on the lower forehead and
  // continues into the long tapir muzzle.
  const mask =
    p.z > 0.77 &&
    (p.y < 1.59 || p.z > 0.94 || Math.abs(p.x) < 0.11);

  // Sparse dark contour cuts at the cheek and brow; the eye meshes are
  // separate and remain visibly clear above this painted base.
  const cheekCut =
    Math.abs(p.y - 1.45) < 0.014 &&
    p.z > 0.78 &&
    Math.abs(p.x) > 0.12;
  const browCut =
    Math.abs(p.y - 1.69) < 0.012 &&
    p.z > 0.78 &&
    Math.abs(p.x) > 0.08;

  if (cheekCut || browCut) return PALETTE.ink;
  return mask ? PALETTE.muzzle : PALETTE.body;
});

export const meta = {
  name: "Ukiyo-e Baku",
  description:
    "A flat-colored, low-poly baku dream-eating tapir spirit in a bold ukiyo-e woodblock palette, with a rig-ready quadruped skeleton and painted stage-two woodblock textures.",
};

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  const hips = b.joint("hips", {
    at: [0, 1.02, -0.28],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, -0.62],
      [0, 1.06, -0.28],
      [0, 1.08, 0.12],
      [0, 1.13, 0.42],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "shoulders"],
      role: "spine",
      group: "body",
    },
  );

  b.sweep(spine, (t) => 0.28 + 0.035 * Math.sin(t * Math.PI), {
    color: bodyTexture,
    section: { ngon: 8 },
    sides: 8,
    name: "body",
    group: "body",
    caps: "round",
  });

  b.sweep(spine, (t) => 0.285 + 0.03 * Math.sin(t * Math.PI), {
    color: bellyTexture,
    shift: [0, -0.16],
    section: { ngon: 8 },
    sides: 8,
    name: "belly",
    group: "belly",
    caps: "none",
    from: 0.12,
    to: 0.9,
    sectors: [[108, 252, PALETTE.belly]],
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.38],
      [0, 1.27, 0.52],
      [0, 1.42, 0.63],
      [0, 1.52, 0.7],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neck3", "neckTip"],
      role: "neck",
      group: "head",
    },
  );

  b.sweep(neck, [0.24, 0.2], {
    color: bodyTexture,
    section: { ngon: 8 },
    sides: 8,
    name: "neck",
    group: "neck",
    caps: "round",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.53, 0.72],
    dir: [0, -0.03, 1],
    role: "head",
    group: "head",
  });

  b.part(new THREE.SphereGeometry(0.245, 10, 7), faceTexture, {
    at: [0, 1.55, 0.73],
    bone: head,
    scale: [1, 1.02, 1.12],
    name: "head",
    group: "head",
    flat: true,
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.36, 0.82],
    aim: [0, 1.32, 1.12],
    role: "jaw",
    group: "face",
  });

  b.sweep(
    catmull([
      [0, 1.49, 0.82],
      [0, 1.43, 0.98],
      [0, 1.35, 1.16],
      [0, 1.31, 1.28],
    ]),
    [0.18, 0.12],
    {
      color: PALETTE.muzzle,
      bone: jaw,
      section: { ngon: 8 },
      sides: 8,
      name: "muzzle",
      group: "face",
      caps: "round",
    },
  );

  b.sweep(
    catmull([
      [0, 1.38, 0.95],
      [0, 1.31, 1.08],
      [0, 1.27, 1.22],
    ]),
    [0.13, 0.07],
    {
      color: PALETTE.belly,
      bone: jaw,
      section: { ngon: 8 },
      name: "lowerMuzzle",
      group: "face",
      caps: "round",
    },
  );

  b.part(new THREE.SphereGeometry(0.105, 8, 5), PALETTE.ink, {
    at: [0, 1.31, 1.3],
    bone: jaw,
    scale: [1.2, 0.72, 0.7],
    name: "nose",
    group: "face",
    flat: true,
  });

  for (const s of [-1, 1]) {
    const side = s < 0 ? "R" : "L";

    b.part(new THREE.SphereGeometry(0.055, 8, 5), PALETTE.eye, {
      at: [s * 0.145, 1.61, 0.89],
      bone: head,
      scale: [1, 1.2, 0.42],
      name: `eyeWhite${side}`,
      group: "face",
      flat: true,
    });

    b.part(new THREE.SphereGeometry(0.026, 7, 5), PALETTE.pupil, {
      at: [s * 0.145, 1.61, 0.925],
      bone: head,
      name: `pupil${side}`,
      group: "face",
      flat: true,
    });

    b.part(new THREE.BoxGeometry(0.028, 0.022, 0.11), PALETTE.ink, {
      at: [s * 0.15, 1.69, 0.9],
      bone: head,
      rotation: [0, s * 0.18, s * 0.12],
      name: `brow${side}`,
      group: "face",
    });

    b.extrude(
      [
        [0, 0],
        [0.15, 0.02],
        [0.13, 0.16],
        [0.075, 0.29],
        [0.005, 0.34],
        [-0.035, 0.1],
      ],
      {
        at: [s * 0.19, 1.66, 0.7],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        smoothing: 0,
        color: PALETTE.bodyDark,
        bone: head,
        name: `ear${side}`,
        group: "head",
      },
    );

    b.part(new THREE.BoxGeometry(0.09, 0.16, 0.018), PALETTE.earInner, {
      at: [s * 0.22, 1.78, 0.715],
      bone: head,
      rotation: [0, s * 0.08, s * 0.18],
      name: `earInner${side}`,
      group: "head",
    });

    b.spike([s * 0.11, 1.32, 1.08], [0, -0.42, 0.12], 0.16, 0.028, {
      color: PALETTE.tusk,
      bone: jaw,
      caps: "point",
      name: `tusk${side}`,
      group: "face",
    });
  }

  for (const s of [-1, 1]) {
    const frontPts = limb(
      [s * 0.3, 1.03, 0.29],
      [s * 0.38, 0.18, 0.38],
      [0.34, 0.34, 0.27],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );

    const front = b.chain(s < 0 ? "legFR" : "legFL", frontPts, {
      parent: hips,
      names: s < 0 ? ["hipFR", "kneeFR", "ankleFR"] : ["hipFL", "kneeFL", "ankleFL"],
      role: "leg",
      group: "legs",
      contact: [s * 0.38, 0, 0.38],
    });

    b.sweep(front, [0.095, 0.07], {
      color: PALETTE.bodyDark,
      section: { ngon: 6 },
      name: s < 0 ? "frontLegR" : "frontLegL",
      group: "legs",
      caps: "round",
    });

    b.part(new THREE.BoxGeometry(0.2, 0.105, 0.27), PALETTE.ink, {
      at: [s * 0.39, 0.09, 0.43],
      bone: front.tip || hips,
      name: s < 0 ? "frontFootR" : "frontFootL",
      group: "feet",
    });

    const rearPts = limb(
      [s * 0.3, 1.02, -0.42],
      [s * 0.4, 0.18, -0.55],
      [0.36, 0.34, 0.25],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, -1] },
    );

    const rear = b.chain(s < 0 ? "legRR" : "legRL", rearPts, {
      parent: hips,
      names: s < 0 ? ["hipRR", "kneeRR", "ankleRR"] : ["hipRL", "kneeRL", "ankleRL"],
      role: "leg",
      group: "legs",
      contact: [s * 0.4, 0, -0.55],
    });

    b.sweep(rear, [0.11, 0.075], {
      color: PALETTE.bodyDark,
      section: { ngon: 6 },
      name: s < 0 ? "rearLegR" : "rearLegL",
      group: "legs",
      caps: "round",
    });

    b.part(new THREE.BoxGeometry(0.23, 0.11, 0.3), PALETTE.ink, {
      at: [s * 0.4, 0.09, -0.61],
      bone: rear.tip || hips,
      name: s < 0 ? "rearFootR" : "rearFootL",
      group: "feet",
    });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1, -0.61],
      [0, 0.88, -0.78],
      [0.01, 0.76, -0.94],
      [0.01, 0.72, -1.04],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  b.sweep(tail, [0.09, 0.025], {
    color: PALETTE.bodyDark,
    section: { ngon: 6 },
    name: "tail",
    group: "tail",
    caps: "point",
  });

  for (const t of [0.25, 0.45, 0.65, 0.82]) {
    const p = neck.at(t);
    b.spike(p, [0, 0.15, -1], 0.13 - t * 0.04, 0.035, {
      color: PALETTE.mane,
      bone: p.bone,
      caps: "point",
      name: `maneSpine${t}`,
      group: "mane",
    });
  }

  for (const t of [0.18, 0.42, 0.65, 0.82]) {
    const p = spine.at(t);
    b.spike(p, [0, 0.12, -1], 0.11, 0.033, {
      color: PALETTE.mane,
      bone: p.bone,
      caps: "point",
      name: `backMane${t}`,
      group: "mane",
    });
  }

  b.part(new THREE.SphereGeometry(0.16, 8, 5), PALETTE.mane, {
    at: [0, 1.26, -0.5],
    bone: hips,
    scale: [1.2, 0.72, 0.95],
    name: "rumpTuft",
    group: "mane",
    flat: true,
  });

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addDreamClouds(b: Builder) {
  const CLOUD = "#d9c7a1";
  const CLOUD_SHADOW = "#74828a";
  const CLOUD_HIGHLIGHT = "#ead9ad";
  const INK = PALETTE.ink;
  const OCHRE = PALETTE.ochre;

  type Outline = [number, number, "sharp"][];

  const cloud = (
    outline: Outline,
    at: [number, number, number],
    fill: string,
    scale = 1,
    name = "dreamCloud",
  ) => {
    const safeOutline: Outline = [
      [-0.42, -0.08, "sharp"],
      [-0.34, -0.17, "sharp"],
      [-0.19, -0.18, "sharp"],
      [-0.08, -0.12, "sharp"],
      [0.02, -0.17, "sharp"],
      [0.18, -0.18, "sharp"],
      [0.33, -0.12, "sharp"],
      [0.41, -0.02, "sharp"],
      [0.37, 0.08, "sharp"],
      [0.26, 0.11, "sharp"],
      [0.18, 0.18, "sharp"],
      [0.05, 0.20, "sharp"],
      [-0.06, 0.15, "sharp"],
      [-0.17, 0.22, "sharp"],
      [-0.31, 0.18, "sharp"],
      [-0.40, 0.09, "sharp"],
    ];
    const shaped = safeOutline.map(([x, y, mark]) => [
      x * scale,
      y * scale,
      mark,
    ] as [number, number, "sharp"]);

    // Broad dark carved border behind the printed color block.
    b.extrude(shaped, {
      at: [at[0], at[1], at[2] - 0.012],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.004,
      smoothing: 0,
      color: INK,
      bone: "hips",
      name: `${name}Outline`,
      group: "dream-clouds",
    });

    // The offset color layer leaves a visible woodblock contour.
    b.extrude(shaped, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      smoothing: 0,
      color: fill,
      bone: "hips",
      name,
      group: "dream-clouds",
    });
  };

  const leftCurl: Outline = [
    [-0.39, -0.08, "sharp"],
    [-0.33, -0.16, "sharp"],
    [-0.19, -0.18, "sharp"],
    [-0.06, -0.13, "sharp"],
    [0.01, -0.04, "sharp"],
    [0.10, 0.03, "sharp"],
    [0.22, 0.035, "sharp"],
    [0.31, -0.015, "sharp"],
    [0.35, -0.105, "sharp"],
    [0.31, -0.17, "sharp"],
    [0.24, -0.19, "sharp"],
    [0.18, -0.15, "sharp"],
    [0.19, -0.105, "sharp"],
    [0.24, -0.085, "sharp"],
    [0.26, -0.04, "sharp"],
    [0.21, 0.0, "sharp"],
    [0.12, 0.01, "sharp"],
    [0.02, -0.045, "sharp"],
    [-0.08, -0.11, "sharp"],
    [-0.21, -0.08, "sharp"],
    [-0.28, 0.0, "sharp"],
    [-0.27, 0.10, "sharp"],
    [-0.20, 0.17, "sharp"],
    [-0.09, 0.19, "sharp"],
    [0.01, 0.16, "sharp"],
    [0.07, 0.09, "sharp"],
    [0.02, 0.05, "sharp"],
    [-0.06, 0.08, "sharp"],
    [-0.15, 0.07, "sharp"],
    [-0.21, 0.01, "sharp"],
    [-0.19, -0.045, "sharp"],
    [-0.26, -0.02, "sharp"],
    [-0.34, 0.015, "sharp"],
  ];

  const centerCurl: Outline = [
    [-0.42, -0.11, "sharp"],
    [-0.34, -0.18, "sharp"],
    [-0.20, -0.19, "sharp"],
    [-0.08, -0.14, "sharp"],
    [0.02, -0.06, "sharp"],
    [0.13, -0.02, "sharp"],
    [0.23, -0.07, "sharp"],
    [0.27, -0.15, "sharp"],
    [0.24, -0.21, "sharp"],
    [0.17, -0.24, "sharp"],
    [0.12, -0.20, "sharp"],
    [0.15, -0.16, "sharp"],
    [0.19, -0.15, "sharp"],
    [0.20, -0.11, "sharp"],
    [0.16, -0.08, "sharp"],
    [0.08, -0.10, "sharp"],
    [-0.01, -0.15, "sharp"],
    [-0.12, -0.22, "sharp"],
    [-0.25, -0.23, "sharp"],
    [-0.35, -0.18, "sharp"],
    [-0.39, -0.08, "sharp"],
    [-0.36, 0.02, "sharp"],
    [-0.29, 0.09, "sharp"],
    [-0.18, 0.12, "sharp"],
    [-0.08, 0.09, "sharp"],
    [-0.02, 0.02, "sharp"],
    [-0.07, -0.01, "sharp"],
    [-0.15, 0.02, "sharp"],
    [-0.23, 0.0, "sharp"],
    [-0.28, -0.05, "sharp"],
  ];

  const rightCurl: Outline = [
    [-0.34, -0.1, "sharp"],
    [-0.28, -0.17, "sharp"],
    [-0.16, -0.18, "sharp"],
    [-0.05, -0.13, "sharp"],
    [0.04, -0.04, "sharp"],
    [0.14, 0.0, "sharp"],
    [0.25, -0.02, "sharp"],
    [0.32, -0.09, "sharp"],
    [0.34, -0.18, "sharp"],
    [0.30, -0.24, "sharp"],
    [0.23, -0.25, "sharp"],
    [0.18, -0.21, "sharp"],
    [0.20, -0.17, "sharp"],
    [0.25, -0.17, "sharp"],
    [0.27, -0.13, "sharp"],
    [0.23, -0.09, "sharp"],
    [0.14, -0.10, "sharp"],
    [0.04, -0.16, "sharp"],
    [-0.07, -0.22, "sharp"],
    [-0.20, -0.23, "sharp"],
    [-0.31, -0.18, "sharp"],
    [-0.37, -0.09, "sharp"],
    [-0.36, 0.01, "sharp"],
    [-0.29, 0.08, "sharp"],
    [-0.18, 0.11, "sharp"],
    [-0.08, 0.08, "sharp"],
    [-0.01, 0.01, "sharp"],
    [-0.08, -0.01, "sharp"],
    [-0.17, 0.01, "sharp"],
    [-0.24, -0.02, "sharp"],
    [-0.27, -0.08, "sharp"],
  ];

  cloud(leftCurl, [-0.27, 1.10, 0.385], CLOUD_SHADOW, 0.82, "cloudLeftShadow");
  cloud(leftCurl, [-0.27, 1.115, 0.414], CLOUD, 0.74, "cloudLeft");

  cloud(centerCurl, [0.02, 1.22, 0.405], OCHRE, 0.95, "cloudCenterOchre");
  cloud(centerCurl, [0.02, 1.235, 0.434], CLOUD_HIGHLIGHT, 0.84, "cloudCenter");

  cloud(rightCurl, [0.32, 1.08, 0.39], INK, 0.78, "cloudRightInk");
  cloud(rightCurl, [0.32, 1.095, 0.425], CLOUD, 0.69, "cloudRight");

  // Broad comma-shaped carved contour lines, kept deliberately chunky like
  // hand-cut ukiyo-e registration marks.
  const contour = (
    points: [number, number, number][],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.sweep(catmull(points), radius, {
      color,
      bone: "hips",
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "dream-cloud-contours",
    });
  };

  contour(
    [
      [-0.48, 1.04, 0.455],
      [-0.39, 1.00, 0.47],
      [-0.27, 1.01, 0.48],
      [-0.16, 1.08, 0.475],
      [-0.19, 1.16, 0.47],
      [-0.27, 1.18, 0.468],
    ],
    0.014,
    INK,
    "cloudLeftCarvedCurl",
  );

  contour(
    [
      [-0.19, 1.30, 0.47],
      [-0.08, 1.35, 0.475],
      [0.05, 1.33, 0.478],
      [0.13, 1.26, 0.475],
      [0.09, 1.20, 0.47],
      [0.02, 1.19, 0.468],
    ],
    0.012,
    INK,
    "cloudCenterCarvedCurl",
  );

  contour(
    [
      [0.16, 1.00, 0.458],
      [0.26, 0.96, 0.465],
      [0.39, 0.98, 0.472],
      [0.46, 1.06, 0.47],
      [0.42, 1.13, 0.465],
      [0.35, 1.14, 0.46],
    ],
    0.013,
    OCHRE,
    "cloudRightCarvedCurl",
  );

  // A few small block-printed accent wedges break up the large fields and
  // make the clouds read as layered woodcut shapes rather than decals.
  const accent = (at: [number, number, number], sx: number, sy: number, color: string, name: string) =>
    b.extrude(
      [
        [0, 0, "sharp"],
        [sx, sy * 0.28, "sharp"],
        [sx * 0.82, sy, "sharp"],
        [sx * 0.25, sy * 0.78, "sharp"],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        smoothing: 0,
        color,
        bone: "hips",
        name,
        group: "dream-cloud-accents",
      },
    );

  accent([-0.39, 1.145, 0.455], 0.075, 0.035, OCHRE, "cloudLeftAccent");
  accent([0.00, 1.39, 0.458], 0.09, 0.04, INK, "cloudCenterAccent");
  accent([0.38, 1.16, 0.455], 0.07, 0.035, CLOUD_SHADOW, "cloudRightAccent");
}
    return addDreamClouds;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBrowCrest(b: Builder) {
  const INK = PALETTE.ink;
  const OCHRE = PALETTE.ochre;
  const RED = PALETTE.red;
  const headBone = "head";

  const bladeOutline: [number, number, "sharp"][] = [
    [-0.075, 0, "sharp"],
    [0.075, 0, "sharp"],
    [0.064, 0.055, "sharp"],
    [0.034, 0.13, "sharp"],
    [0.012, 0.235, "sharp"],
    [-0.012, 0.275, "sharp"],
    [-0.034, 0.16, "sharp"],
    [-0.073, 0.075, "sharp"],
  ];

  const innerBlade: [number, number, "sharp"][] = [
    [-0.052, 0.012, "sharp"],
    [0.052, 0.012, "sharp"],
    [0.042, 0.063, "sharp"],
    [0.019, 0.132, "sharp"],
    [0.006, 0.215, "sharp"],
    [-0.018, 0.135, "sharp"],
    [-0.051, 0.07, "sharp"],
  ];

  const slash: [number, number, "sharp"][] = [
    [-0.012, 0, "sharp"],
    [0.014, 0, "sharp"],
    [0.027, 0.09, "sharp"],
    [0.008, 0.166, "sharp"],
    [-0.013, 0.078, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const x = s * 0.073;

    // Broad dark carved silhouette, giving the crest the heavy inked edge of a
    // woodblock print and keeping it visually separate from the forehead.
    b.extrude(bladeOutline, {
      at: [x, 1.655, 0.875],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.052,
      bevel: 0.006,
      smoothing: 0,
      color: INK,
      bone: headBone,
      name: `s22CrestInk${s < 0 ? "R" : "L"}`,
      group: "crest",
    });

    // Ochre face inset from the ink silhouette.
    b.extrude(innerBlade, {
      at: [x, 1.66, 0.904],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.004,
      smoothing: 0,
      color: OCHRE,
      bone: headBone,
      name: `s22CrestOchre${s < 0 ? "R" : "L"}`,
      group: "crest",
    });

    // A red asymmetric brush slash laid onto each ochre blade.
    b.extrude(slash, {
      at: [x + s * 0.005, 1.668, 0.924],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      smoothing: 0,
      color: RED,
      bone: headBone,
      name: `s22CrestSlash${s < 0 ? "R" : "L"}`,
      group: "crest",
    });

    // Small dark rivet at the root, like a carved fastening mark.
    b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      INK,
      {
        at: [x, 1.665, 0.94],
        bone: headBone,
        scale: [1, 0.7, 0.45],
        name: `s22CrestRivet${s < 0 ? "R" : "L"}`,
        group: "crest",
        flat: true,
      },
    );
  }

  // A narrow red bridge binds the two blades into one ceremonial forehead crest.
  b.extrude(
    [
      [-0.065, 0],
      [0.065, 0],
      [0.052, 0.035],
      [0.018, 0.065],
      [-0.018, 0.065],
      [-0.052, 0.035],
    ],
    {
      at: [0, 1.655, 0.914],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.002,
      smoothing: 0,
      color: RED,
      bone: headBone,
      name: "s22CrestBridge",
      group: "crest",
    },
  );
}
    return addBrowCrest;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addEarRibbons(b: Builder) {
  const RED = PALETTE.red;
  const OCHRE = PALETTE.ochre;
  const INK = PALETTE.ink;
  const LACQUER = "#6d2937";
  const WISP = PALETTE.cloud;

  const ribbonTail = [
    [0, 0, "sharp"] as [number, number, "sharp"],
    [0.075, -0.018, "sharp"] as [number, number, "sharp"],
    [0.105, -0.145, "sharp"] as [number, number, "sharp"],
    [0.038, -0.116, "sharp"] as [number, number, "sharp"],
  ];

  for (const side of [-1, 1]) {
    const suffix = side < 0 ? "R" : "L";
    const knot = new THREE.Vector3(side * 0.215, 1.635, 0.675);

    b.part(
      new THREE.SphereGeometry(0.045, 8, 5),
      RED,
      {
        at: knot,
        bone: "head",
        scale: [1.12, 0.82, 0.62],
        name: `s23RibbonKnot${suffix}`,
        group: "earRibbons",
        flat: true,
      },
    );

    b.part(
      new THREE.SphereGeometry(0.026, 7, 5),
      OCHRE,
      {
        at: [side * 0.215, 1.64, 0.649],
        bone: "head",
        name: `s23RibbonKnotCap${suffix}`,
        group: "earRibbons",
        flat: true,
      },
    );

    b.rod(
      [side * 0.19, 1.665, 0.685],
      knot,
      0.014,
      RED,
      {
        bone: "head",
        caps: "round",
        name: `s23RibbonTie${suffix}`,
        group: "earRibbons",
      },
    );

    b.extrude(ribbonTail, {
      at: [side * 0.215, 1.625, 0.673],
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      color: RED,
      bone: "head",
      name: `s23RibbonTailA${suffix}`,
      group: "earRibbons",
    });

    b.extrude(
      [
        [0, 0, "sharp"],
        [0.067, 0.026, "sharp"],
        [0.086, -0.118, "sharp"],
        [0.018, -0.15, "sharp"],
      ],
      {
        at: [side * 0.222, 1.625, 0.681],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.003,
        smoothing: 0,
        color: RED,
        bone: "head",
        name: `s23RibbonTailB${suffix}`,
        group: "earRibbons",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.043, 0.038, 0.022),
      OCHRE,
      {
        at: [side * 0.295, 1.49, 0.671],
        bone: "head",
        rotation: [0, 0, side * -0.24],
        name: `s23RibbonTipA${suffix}`,
        group: "earRibbons",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.036, 0.034, 0.02),
      OCHRE,
      {
        at: [side * 0.284, 1.475, 0.681],
        bone: "head",
        rotation: [0, 0, side * 0.18],
        name: `s23RibbonTipB${suffix}`,
        group: "earRibbons",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.014, 0.12, 0.012),
      INK,
      {
        at: [side * 0.255, 1.563, 0.655],
        bone: "head",
        rotation: [0, 0, side * -0.25],
        name: `s23RibbonInkFold${suffix}`,
        group: "earRibbons",
      },
    );
  }

  const jarCenter = new THREE.Vector3(0, 1.365, -0.18);

  b.part(
    new THREE.CylinderGeometry(0.135, 0.15, 0.24, 10, 3),
    LACQUER,
    {
      at: jarCenter,
      bone: "spine2",
      name: "s23DreamJarBody",
      group: "dreamJar",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.115, 0.125, 0.028, 10, 1),
    OCHRE,
    {
      at: [0, 1.505, -0.18],
      bone: "spine2",
      name: "s23DreamJarLid",
      group: "dreamJar",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.074, 0.082, 0.018, 10, 1),
    INK,
    {
      at: [0, 1.524, -0.18],
      bone: "spine2",
      name: "s23DreamJarLidRim",
      group: "dreamJar",
      flat: true,
    },
  );

  b.part(
    new THREE.SphereGeometry(0.034, 8, 5),
    OCHRE,
    {
      at: [0, 1.55, -0.18],
      bone: "spine2",
      scale: [1, 0.72, 1],
      name: "s23DreamJarKnob",
      group: "dreamJar",
      flat: true,
    },
  );

  for (const side of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.038, 0.27, 0.018),
      INK,
      {
        at: [side * 0.092, 1.365, -0.038],
        bone: "spine2",
        rotation: [0, side * 0.035, 0],
        name: `s23DreamJarStrap${side < 0 ? "R" : "L"}`,
        group: "dreamJar",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.052, 0.048, 0.024),
      OCHRE,
      {
        at: [side * 0.092, 1.375, -0.025],
        bone: "spine2",
        name: `s23DreamJarBuckle${side < 0 ? "R" : "L"}`,
        group: "dreamJar",
      },
    );
  }

  const jarMark = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 8 C25 18 39 20 31 29 C22 38 31 42 25 55
               M32 8 C39 18 25 20 33 29 C42 38 33 42 39 55"
            fill="none" stroke="#f1d486" stroke-width="4"
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="5" fill="#241b2b"/>
      <circle cx="32" cy="32" r="2" fill="#f1d486"/>
    </svg>`,
    { size: 128 },
  );

  b.part(
    new THREE.PlaneGeometry(0.13, 0.13),
    "#ffffff",
    {
      at: [0, 1.37, -0.023],
      bone: "spine2",
      dir: [0, 0, 1],
      axis: "z",
      texture: jarMark,
      name: "s23DreamJarSigil",
      group: "dreamJar",
    },
  );

  const wisps = [
    [
      [0, 1.535, -0.18],
      [-0.035, 1.60, -0.17],
      [-0.085, 1.665, -0.19],
      [-0.055, 1.735, -0.22],
    ],
    [
      [0.015, 1.535, -0.17],
      [0.06, 1.59, -0.13],
      [0.09, 1.655, -0.15],
      [0.07, 1.715, -0.11],
    ],
    [
      [0, 1.54, -0.185],
      [0.015, 1.595, -0.23],
      [-0.01, 1.645, -0.27],
      [0.025, 1.69, -0.3],
    ],
  ];

  wisps.forEach((points, i) => {
    const path = catmull(points);
    b.sweep(path, [0.018, 0.004], {
      color: WISP,
      bone: "spine2",
      section: { ngon: 6 },
      caps: "point",
      name: `s23DreamWisp${i + 1}`,
      group: "dreamJar",
    });

    const tip = points[points.length - 1];
    b.part(
      new THREE.SphereGeometry(0.017, 7, 4),
      OCHRE,
      {
        at: tip,
        bone: "spine2",
        scale: [0.72, 1.15, 0.72],
        name: `s23DreamWispBead${i + 1}`,
        group: "dreamJar",
        flat: true,
      },
    );
  });

  b.part(
    new THREE.CylinderGeometry(0.035, 0.042, 0.055, 8, 1),
    OCHRE,
    {
      at: [0, 1.205, -0.18],
      bone: "spine2",
      name: "s23DreamJarBottomSeal",
      group: "dreamJar",
      flat: true,
    },
  );
}
    return addEarRibbons;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addAnkleBands(b: Builder) {
  const RED = PALETTE.red;
  const OCHRE = PALETTE.ochre;
  const INK = PALETTE.ink;

  const band = (
    name: string,
    bone: string,
    at: [number, number, number],
    axis: [number, number, number],
    radius: number,
    tube: number,
    color: string,
    offset = 0,
  ) => {
    const p: [number, number, number] = [
      at[0] + axis[0] * offset,
      at[1] + axis[1] * offset,
      at[2] + axis[2] * offset,
    ];
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, 12),
      color,
      {
        at: p,
        dir: axis,
        bone,
        name,
        group: "ankleBands",
        flat: true,
      },
    );
  };

  const emblem = (
    name: string,
    bone: string,
    at: [number, number, number],
    axis: [number, number, number],
    side: number,
  ) => {
    const n = new THREE.Vector3(...axis).normalize();
    const center = new THREE.Vector3(...at).addScaledVector(n, 0.086);
    return b.part(
      new THREE.BoxGeometry(0.036, 0.044, 0.012),
      INK,
      {
        at: center,
        dir: axis,
        bone,
        rotation: [0, side * 0.12, side * 0.08],
        name,
        group: "ankleBands",
        flat: true,
      },
    );
  };

  // The lower-leg axes are deliberately taken from the visible stage-one silhouette:
  // each ring is aimed along its shin rather than being a world-horizontal decal.
  const legs = [
    {
      side: -1,
      front: true,
      bone: "ankleFR",
      at: [-0.38, 0.255, 0.395] as [number, number, number],
      axis: [-0.035, -0.997, 0.055] as [number, number, number],
    },
    {
      side: 1,
      front: true,
      bone: "ankleFL",
      at: [0.38, 0.255, 0.395] as [number, number, number],
      axis: [0.035, -0.997, 0.055] as [number, number, number],
    },
    {
      side: -1,
      front: false,
      bone: "ankleRR",
      at: [-0.4, 0.255, -0.535] as [number, number, number],
      axis: [-0.035, -0.997, -0.045] as [number, number, number],
    },
    {
      side: 1,
      front: false,
      bone: "ankleRL",
      at: [0.4, 0.255, -0.535] as [number, number, number],
      axis: [0.035, -0.997, -0.045] as [number, number, number],
    },
  ];

  for (const leg of legs) {
    const tag = `${leg.front ? "front" : "rear"}${leg.side < 0 ? "R" : "L"}`;

    // Broad red woodblock-print sash, with narrow ochre piping on both edges.
    band(`s24_band_${tag}`, leg.bone, leg.at, leg.axis, 0.083, 0.021, RED);
    band(
      `s24_bandTop_${tag}`,
      leg.bone,
      leg.at,
      leg.axis,
      0.084,
      0.006,
      OCHRE,
      -0.033,
    );
    band(
      `s24_bandBottom_${tag}`,
      leg.bone,
      leg.at,
      leg.axis,
      0.084,
      0.006,
      OCHRE,
      0.033,
    );

    // A small dark diamond stamp on the forward-facing side gives each cuff
    // the graphic asymmetry of a carved textile seal.
    const stampAt: [number, number, number] = [
      leg.at[0],
      leg.at[1] + 0.002,
      leg.at[2] + (leg.front ? 0.078 : -0.078),
    ];
    emblem(`s24_stamp_${tag}`, leg.bone, stampAt, leg.axis, leg.side);
  }
}
    return addAnkleBands;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTailCharm(b: Builder) {
  const BELL = "#c28a45";
  const CORD = "#a83f43";
  const DARK = "#241b2b";
  const HIGHLIGHT = "#e0ad58";

  const bone = "tail2";
  const root: [number, number, number] = [0.01, 0.73, -0.98];
  const loopTop: [number, number, number] = [0.01, 0.705, -1.035];
  const bellCenter: [number, number, number] = [0.01, 0.655, -1.075];

  // A short red suspension cord, buried slightly into the tail tuft.
  b.rod(root, loopTop, 0.009, {
    bone,
    color: CORD,
    caps: "round",
    name: "s25CharmCord",
    group: "tailCharm",
  });

  // Small folded cord knot above the bell.
  b.part(
    new THREE.SphereGeometry(0.021, 7, 5),
    CORD,
    {
      bone,
      at: [0.01, 0.704, -1.04],
      scale: [1.15, 0.75, 0.8],
      name: "s25CharmKnot",
      group: "tailCharm",
      flat: true,
    },
  );

  // Loop of cord passing through the bell's crown.
  b.part(
    new THREE.TorusGeometry(0.026, 0.006, 5, 8),
    CORD,
    {
      bone,
      at: [0.01, 0.692, -1.052],
      rotation: [90, 0, 0],
      name: "s25BellLoop",
      group: "tailCharm",
      flat: true,
    },
  );

  // Faceted bell body: broad shoulder, narrow lower opening.
  b.part(
    new THREE.ConeGeometry(0.061, 0.078, 8, 1, false),
    BELL,
    {
      bone,
      at: bellCenter,
      scale: [1, 1, 0.9],
      name: "s25BellBody",
      group: "tailCharm",
      flat: true,
    },
  );

  // Dark carved mouth beneath the bell.
  b.part(
    new THREE.TorusGeometry(0.046, 0.008, 5, 10),
    DARK,
    {
      bone,
      at: [0.01, 0.614, -1.075],
      rotation: [90, 0, 0],
      name: "s25BellMouth",
      group: "tailCharm",
      flat: true,
    },
  );

  // Raised ochre rim catches the light like a woodblock highlight.
  b.part(
    new THREE.TorusGeometry(0.056, 0.009, 5, 10),
    HIGHLIGHT,
    {
      bone,
      at: [0.01, 0.626, -1.075],
      rotation: [90, 0, 0],
      name: "s25BellRim",
      group: "tailCharm",
      flat: true,
    },
  );

  // Red painted band around the upper bell.
  b.part(
    new THREE.TorusGeometry(0.053, 0.006, 5, 10),
    CORD,
    {
      bone,
      at: [0.01, 0.674, -1.075],
      rotation: [90, 0, 0],
      name: "s25BellBand",
      group: "tailCharm",
      flat: true,
    },
  );

  // Hanging clapper and its dark spherical end.
  b.rod(
    [0.01, 0.676, -1.075],
    [0.01, 0.606, -1.075],
    0.006,
    {
      bone,
      color: DARK,
      caps: "round",
      name: "s25ClapperStem",
      group: "tailCharm",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.017, 7, 5),
    DARK,
    {
      bone,
      at: [0.01, 0.601, -1.075],
      name: "s25Clapper",
      group: "tailCharm",
      flat: true,
    },
  );

  // Two tiny angular cord tails make the charm read clearly from the side.
  b.rod(
    [0.01, 0.698, -1.043],
    [0.045, 0.655, -1.058],
    0.0055,
    {
      bone,
      color: CORD,
      caps: "point",
      name: "s25CordTailL",
      group: "tailCharm",
    },
  );

  b.rod(
    [0.01, 0.698, -1.043],
    [-0.025, 0.649, -1.061],
    0.0055,
    {
      bone,
      color: CORD,
      caps: "point",
      name: "s25CordTailR",
      group: "tailCharm",
    },
  );

  // Small ochre bead at the fork of the hanging cord.
  b.part(
    new THREE.SphereGeometry(0.012, 6, 4),
    HIGHLIGHT,
    {
      bone,
      at: [0.01, 0.692, -1.047],
      name: "s25CordBead",
      group: "tailCharm",
      flat: true,
    },
  );
}
    return addTailCharm;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTuskCaps(b: Builder) {
  const OCHRE = PALETTE.ochre;
  const RED = PALETTE.red;
  const INK = PALETTE.ink;

  const tuskAxis = new THREE.Vector3(0, -0.42, 0.12).normalize();

  // Carved collars at the two tusk roots.  The short dark-red inset band is
  // deliberately kept behind the ivory-colored tusk tips.
  for (const side of [-1, 1]) {
    const root = new THREE.Vector3(side * 0.11, 1.32, 1.08);
    const capCenter = root.clone().addScaledVector(tuskAxis, 0.018);

    b.part(
      new THREE.CylinderGeometry(0.045, 0.053, 0.075, 8, 1, false),
      OCHRE,
      {
        bone: "jaw",
        at: capCenter,
        dir: tuskAxis,
        name: `s26_tuskCap_${side < 0 ? "R" : "L"}`,
        group: "muzzle",
        flat: true,
      },
    );

    const bandCenter = root.clone().addScaledVector(tuskAxis, 0.047);
    b.part(
      new THREE.CylinderGeometry(0.054, 0.055, 0.014, 8, 1, false),
      RED,
      {
        bone: "jaw",
        at: bandCenter,
        dir: tuskAxis,
        name: `s26_tuskBand_${side < 0 ? "R" : "L"}`,
        group: "muzzle",
        flat: true,
      },
    );

    // A tiny raised carved mark makes each cap read as a woodblock ornament.
    const markCenter = root.clone().addScaledVector(tuskAxis, 0.009);
    b.part(
      new THREE.BoxGeometry(0.012, 0.006, 0.032),
      INK,
      {
        bone: "jaw",
        at: markCenter,
        dir: tuskAxis,
        rotation: [0, side * 0.42, side * 0.18],
        name: `s26_tuskCarve_${side < 0 ? "R" : "L"}`,
        group: "muzzle",
        flat: true,
      },
    );
  }

  const feet = [
    { side: -1, z: 0.43, bone: "ankleFR", name: "frontR" },
    { side: 1, z: 0.43, bone: "ankleFL", name: "frontL" },
    { side: -1, z: -0.61, bone: "ankleRR", name: "rearR" },
    { side: 1, z: -0.61, bone: "ankleRL", name: "rearL" },
  ] as const;

  for (const foot of feet) {
    const x = foot.side * 0.39;
    const z = foot.z;
    const front = z > 0;

    // Broad, slightly irregular-looking central pad made from two overlapping
    // low-poly slabs, giving it the carved, imperfect stamp of a print block.
    b.part(
      new THREE.BoxGeometry(0.125, 0.014, 0.14),
      INK,
      {
        bone: foot.bone,
        at: [x, 0.151, z],
        rotation: [0, foot.side * 0.035, foot.side * 0.045],
        name: `s26_pawPad_${foot.name}`,
        group: "feet",
        flat: true,
      },
    );
    b.part(
      new THREE.BoxGeometry(0.082, 0.016, 0.052),
      INK,
      {
        bone: foot.bone,
        at: [x, 0.161, z + (front ? 0.045 : -0.045)],
        rotation: [0, foot.side * 0.03, 0],
        name: `s26_pawHeel_${foot.name}`,
        group: "feet",
        flat: true,
      },
    );

    // Three blunt toe marks across the front edge of each pad.  They are
    // separated enough to read from the camera while remaining in the cleared
    // foot room.
    for (let i = 0; i < 3; i++) {
      const toeX = x + (i - 1) * 0.043;
      const toeZ = z + (front ? 0.097 : -0.097);
      b.part(
        new THREE.BoxGeometry(0.027, 0.012, 0.052),
        INK,
        {
          bone: foot.bone,
          at: [toeX, 0.159, toeZ],
          rotation: [0, foot.side * (i - 1) * 0.08, (i - 1) * 0.035],
          name: `s26_toe_${foot.name}_${i + 1}`,
          group: "feet",
          flat: true,
        },
      );
    }

    // A small ochre registration fleck at the heel echoes the tusk-cap carving
    // without introducing a new palette color.
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.009, 6),
      PALETTE.ochre,
      {
        bone: foot.bone,
        at: [x, 0.168, z + (front ? -0.052 : 0.052)],
        dir: [0, 1, 0],
        name: `s26_heelFleck_${foot.name}`,
        group: "feet",
        flat: true,
      },
    );
  }
}
    return addTuskCaps;
  })(),
);
