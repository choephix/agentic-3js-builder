```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  type Builder,
} from "agentic-3js-builder";

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

export const meta = {
  name: "Ukiyo-e Baku",
  description:
    "A flat-colored, low-poly baku dream-eating tapir spirit in a bold ukiyo-e woodblock palette, with a rig-ready quadruped skeleton and reserved surfaces for stage-two dream motifs.",
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

  const body = b.sweep(
    spine,
    (t) => 0.28 + 0.035 * Math.sin(t * Math.PI),
    {
      color: PALETTE.body,
      section: { ngon: 8 },
      sides: 8,
      name: "body",
      group: "body",
      caps: "round",
    },
  );

  const belly = b.sweep(
    spine,
    (t) => 0.285 + 0.03 * Math.sin(t * Math.PI),
    {
      color: PALETTE.belly,
      shift: [0, -0.16],
      section: { ngon: 8 },
      sides: 8,
      name: "belly",
      group: "belly",
      caps: "none",
      from: 0.12,
      to: 0.9,
      sectors: [[108, 252, PALETTE.belly]],
    },
  );

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
    color: PALETTE.body,
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

  const headPart = b.part(
    new THREE.SphereGeometry(0.245, 10, 7),
    PALETTE.body,
    {
      at: [0, 1.55, 0.73],
      bone: head,
      scale: [1.0, 1.02, 1.12],
      name: "head",
      group: "head",
      flat: true,
    },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.36, 0.82],
    aim: [0, 1.32, 1.12],
    role: "jaw",
    group: "face",
  });

  const muzzlePath = catmull([
    [0, 1.49, 0.82],
    [0, 1.43, 0.98],
    [0, 1.35, 1.16],
    [0, 1.31, 1.28],
  ]);

  b.sweep(muzzlePath, [0.18, 0.12], {
    color: PALETTE.muzzle,
    bone: jaw,
    section: { ngon: 8 },
    sides: 8,
    name: "muzzle",
    group: "face",
    caps: "round",
  });

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

  const nose = b.part(
    new THREE.SphereGeometry(0.105, 8, 5),
    PALETTE.ink,
    {
      at: [0, 1.31, 1.3],
      bone: jaw,
      scale: [1.2, 0.72, 0.7],
      name: "nose",
      group: "face",
      flat: true,
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.055, 8, 5),
      PALETTE.eye,
      {
        at: [s * 0.145, 1.61, 0.89],
        bone: head,
        scale: [1.0, 1.2, 0.42],
        name: `eyeWhite${s < 0 ? "R" : "L"}`,
        group: "face",
        flat: true,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.026, 7, 5),
      PALETTE.pupil,
      {
        at: [s * 0.145, 1.61, 0.925],
        bone: head,
        name: `pupil${s < 0 ? "R" : "L"}`,
        group: "face",
        flat: true,
      },
    );

    b.part(
      new THREE.BoxGeometry(0.028, 0.022, 0.11),
      PALETTE.ink,
      {
        at: [s * 0.15, 1.69, 0.9],
        bone: head,
        rotation: [0, s * 0.18, s * 0.12],
        name: `brow${s < 0 ? "R" : "L"}`,
        group: "face",
      },
    );
  }

  for (const s of [-1, 1]) {
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
        name: `ear${s < 0 ? "R" : "L"}`,
        group: "head",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.09, 0.16, 0.018),
      PALETTE.earInner,
      {
        at: [s * 0.22, 1.78, 0.715],
        bone: head,
        rotation: [0, s * 0.08, s * 0.18],
        name: `earInner${s < 0 ? "R" : "L"}`,
        group: "head",
      },
    );

    b.spike(
      [s * 0.11, 1.32, 1.08],
      [0, -0.42, 0.12],
      0.16,
      0.028,
      {
        color: PALETTE.tusk,
        bone: jaw,
        caps: "point",
        name: `tusk${s < 0 ? "R" : "L"}`,
        group: "face",
      },
    );
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
    const front = b.chain(
      s < 0 ? "legFR" : "legFL",
      frontPts,
      {
        parent: hips,
        names: s < 0 ? ["hipFR", "kneeFR", "ankleFR"] : ["hipFL", "kneeFL", "ankleFL"],
        role: "leg",
        group: "legs",
        contact: [s * 0.38, 0, 0.38],
      },
    );
    b.sweep(front, [0.095, 0.07], {
      color: PALETTE.bodyDark,
      section: { ngon: 6 },
      name: s < 0 ? "frontLegR" : "frontLegL",
      group: "legs",
      caps: "round",
    });
    b.part(
      new THREE.BoxGeometry(0.2, 0.105, 0.27),
      PALETTE.ink,
      {
        at: [s * 0.39, 0.09, 0.43],
        bone: front.tip,
        scale: [1, 1, 1],
        name: s < 0 ? "frontFootR" : "frontFootL",
        group: "feet",
      },
    );

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
    const rear = b.chain(
      s < 0 ? "legRR" : "legRL",
      rearPts,
      {
        parent: hips,
        names: s < 0 ? ["hipRR", "kneeRR", "ankleRR"] : ["hipRL", "kneeRL", "ankleRL"],
        role: "leg",
        group: "legs",
        contact: [s * 0.4, 0, -0.55],
      },
    );
    b.sweep(rear, [0.11, 0.075], {
      color: PALETTE.bodyDark,
      section: { ngon: 6 },
      name: s < 0 ? "rearLegR" : "rearLegL",
      group: "legs",
      caps: "round",
    });
    b.part(
      new THREE.BoxGeometry(0.23, 0.11, 0.3),
      PALETTE.ink,
      {
        at: [s * 0.4, 0.09, -0.61],
        bone: rear.tip,
        name: s < 0 ? "rearFootR" : "rearFootL",
        group: "feet",
      },
    );
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.61],
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

  b.part(
    new THREE.SphereGeometry(0.16, 8, 5),
    PALETTE.mane,
    {
      at: [0, 1.26, -0.5],
      bone: hips,
      scale: [1.2, 0.72, 0.95],
      name: "rumpTuft",
      group: "mane",
      flat: true,
    },
  );

  for (const add of STAGE2) add(b);
  return b.root;
}
```