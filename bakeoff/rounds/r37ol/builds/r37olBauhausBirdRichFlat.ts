import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description: "A stylized primary-colour songbird perched on a geometric wooden branch.",
};

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird", detail: 1 });

  const RED = "#e3312f";
  const YELLOW = "#f5c542";
  const BLUE = "#1769aa";
  const CYAN = "#2aa9b8";
  const BLACK = "#17191c";
  const CREAM = "#f5ead0";
  const BRANCH = "#68452d";
  const BRANCH_LIGHT = "#a66a38";
  const BRANCH_DARK = "#39261d";
  const WHITE = "#fffaf0";
  const ORANGE = "#e86b2c";

  const root = b.joint("bodyRoot", {
    at: [0, 0.82, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, -0.22],
      [0, 0.91, -0.08],
      [0, 0.98, 0.12],
      [0, 1.03, 0.28],
    ]),
    {
      parent: root,
      names: ["pelvis", "back", "chest", "shoulder"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.03, 0.28],
      [0, 1.12, 0.37],
      [0, 1.22, 0.45],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
      count: 2,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.28, 0.49],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.215, 0.55],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.22],
      [0, 0.80, -0.42],
      [0, 0.77, -0.66],
      [0, 0.78, -0.88],
    ]),
    {
      parent: root,
      names: ["tailBase", "tailMid", "tail3", "tailTip"],
      role: "tail",
      count: 4,
    },
  );

  const leftLegPts = limb(
    [0.105, 0.78, -0.02],
    [0.105, 0.54, 0.01],
    [0.13, 0.11],
    [[0, 0, 1]],
    { sole: [0, 0, 1] },
  );
  const rightLegPts = limb(
    [-0.105, 0.78, -0.02],
    [-0.105, 0.54, 0.01],
    [0.13, 0.11],
    [[0, 0, 1]],
    { sole: [0, 0, 1] },
  );

  const legL = b.chain("legL", leftLegPts, {
    parent: root,
    names: ["hipL", "ankleL", "footL"],
    role: "leg",
    contact: [0.105, 0.47, 0.01],
  });
  const legR = b.chain("legR", rightLegPts, {
    parent: root,
    names: ["hipR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.105, 0.47, 0.01],
  });

  const wingL = b.joint("wingL", {
    parent: spine.joints[2],
    at: [0.16, 1.0, 0.13],
    dir: [0.35, -0.04, 0.08],
    role: "wing",
    group: "wings",
  });
  const wingR = b.joint("wingR", {
    parent: spine.joints[2],
    at: [-0.16, 1.0, 0.13],
    dir: [-0.35, -0.04, 0.08],
    role: "wing",
    group: "wings",
  });

  const branchPath = catmull([
    [-0.72, 0.43, -0.1],
    [-0.4, 0.47, -0.03],
    [0, 0.45, 0.02],
    [0.42, 0.48, 0.06],
    [0.78, 0.46, -0.02],
  ]);

  b.sweep(branchPath, 0.075, {
    color: BRANCH,
    section: { ngon: 6 },
    caps: "round",
    name: "mainBranch",
    group: "branch",
  });

  b.sweep(
    catmull([
      [-0.68, 0.47, -0.1],
      [-0.32, 0.53, -0.02],
      [0.05, 0.51, 0.02],
      [0.44, 0.55, 0.07],
    ]),
    0.027,
    {
      color: BRANCH_LIGHT,
      section: { ngon: 5 },
      caps: "round",
      name: "branchHighlight",
      group: "branch",
    },
  );

  b.rod([-0.58, 0.45, -0.08], [-0.78, 0.68, -0.16], 0.038, {
    color: BRANCH,
    section: { ngon: 6 },
    name: "twigLeft",
    group: "branch",
  });
  b.rod([0.43, 0.48, 0.06], [0.69, 0.7, 0.01], 0.04, {
    color: BRANCH,
    section: { ngon: 6 },
    name: "twigRight",
    group: "branch",
  });
  b.rod([0.64, 0.69, 0.01], [0.79, 0.82, 0.03], 0.026, {
    color: BRANCH_LIGHT,
    section: { ngon: 5 },
    name: "twigTip",
    group: "branch",
  });

  for (const p of [
    [-0.43, 0.49, 0.015],
    [-0.18, 0.48, 0.025],
    [0.2, 0.51, 0.045],
    [0.51, 0.54, 0.07],
  ]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRANCH_DARK, {
      at: p,
      group: "branch",
      name: "barkKnot",
    });
  }

  b.sweep(spine, (t) => 0.16 + 0.045 * Math.sin(Math.PI * t), {
    color: RED,
    section: { ngon: 8 },
    caps: "round",
    name: "redBody",
    group: "bird",
  });

  b.sweep(neck, [0.13, 0.115], {
    color: RED,
    section: { ngon: 8 },
    caps: "round",
    name: "redNeck",
    group: "bird",
  });

  b.part(new THREE.SphereGeometry(0.19, 10, 7), RED, {
    bone: head,
    at: [0, 1.28, 0.48],
    scale: [1, 1.02, 0.92],
    flat: true,
    group: "head",
    name: "roundHead",
  });

  b.part(new THREE.SphereGeometry(0.135, 8, 6), CREAM, {
    bone: head,
    at: [0, 1.235, 0.605],
    scale: [1.05, 0.82, 0.58],
    flat: true,
    group: "face",
    name: "creamFace",
  });

  b.part(new THREE.SphereGeometry(0.105, 8, 5), YELLOW, {
    bone: jaw,
    at: [0, 1.207, 0.655],
    scale: [1.05, 0.4, 0.82],
    flat: true,
    group: "face",
    name: "lowerJaw",
  });

  b.part(new THREE.ConeGeometry(0.055, 0.2, 4), YELLOW, {
    bone: head,
    at: [0, 1.285, 0.72],
    dir: [0, -0.01, 1],
    axis: "z",
    rotation: [0, 0, 45],
    group: "face",
    name: "goldBeak",
  });

  for (const s of [1, -1]) {
    const eyeX = s * 0.092;
    b.part(new THREE.SphereGeometry(0.048, 8, 6), WHITE, {
      bone: head,
      at: [eyeX, 1.335, 0.635],
      scale: [1, 1.1, 0.46],
      flat: true,
      group: "face",
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), BLACK, {
      bone: head,
      at: [eyeX, 1.337, 0.658],
      scale: [1, 1.08, 0.42],
      flat: true,
      group: "face",
      name: s > 0 ? "pupilL" : "pupilR",
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), WHITE, {
      bone: head,
      at: [eyeX + s * 0.008, 1.35, 0.673],
      group: "face",
      name: "eyeGlint",
    });
    b.rod(
      [eyeX - s * 0.045, 1.39, 0.642],
      [eyeX + s * 0.035, 1.405, 0.65],
      0.009,
      {
        color: BLACK,
        section: { ngon: 5 },
        bone: head,
        name: "brow",
        group: "face",
      },
    );
  }

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.13, 0.045],
        [0.14, 0.2],
        [0.08, 0.37],
        [0.0, 0.31],
        [-0.055, 0.12],
      ],
      {
        at: [s * 0.145, 1.04, 0.13],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        smoothing: 0,
        color: s > 0 ? BLUE : CYAN,
        bone: s > 0 ? wingL : wingR,
        group: "wings",
        name: s > 0 ? "blueWing" : "cyanWing",
      },
    );

    b.extrude(
      [
        [0.025, 0.04],
        [0.105, 0.08],
        [0.09, 0.13],
        [0.02, 0.1],
      ],
      {
        at: [s * 0.151, 1.07, 0.151],
        x: [0, 0, 1],
        thickness: 0.041,
        color: YELLOW,
        bone: s > 0 ? wingL : wingR,
        group: "wings",
        name: "wingStripe",
      },
    );
  }

  b.sweep(tail, (t) => 0.105 * (1 - t) + 0.035, {
    color: BLUE,
    section: { ngon: 6 },
    caps: "point",
    name: "blueTailBase",
    group: "tail",
  });

  for (const s of [-1.0, -0.5, 0, 0.5, 1.0]) {
    const x = s * 0.075;
    b.extrude(
      [
        [0, 0],
        [0.055, 0.025],
        [0.07, 0.42 + Math.abs(s) * 0.08],
        [-0.005, 0.51 + Math.abs(s) * 0.1],
        [-0.07, 0.19],
      ],
      {
        at: [x, 0.79, -0.58],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.005,
        color: Math.abs(s) < 0.25 ? YELLOW : BLUE,
        bone: tail.joints[Math.min(2, tail.joints.length - 1)],
        group: "tail",
        name: "tailFeather",
      },
    );
  }

  for (const [s, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    b.sweep(leg, [0.026, 0.018], {
      color: ORANGE,
      section: { ngon: 6 },
      caps: "round",
      name: s > 0 ? "legL" : "legR",
      group: "feet",
    });

    const ankle = s > 0 ? legL.tip : legR.tip;
    const foot = [s * 0.105, 0.48, 0.01] as [number, number, number];

    for (const dx of [-0.035, 0, 0.035]) {
      b.rod(
        [foot[0], foot[1], foot[2] + dx * 0.15],
        [foot[0] + s * dx * 0.8, 0.46, foot[2] + 0.085],
        0.012,
        {
          color: ORANGE,
          section: { ngon: 5 },
          bone: ankle,
          name: "frontToe",
          group: "feet",
        },
      );
    }

    b.rod(
      [foot[0], foot[1], foot[2] - 0.015],
      [foot[0] - s * 0.055, 0.46, foot[2] - 0.055],
      0.013,
      {
        color: ORANGE,
        section: { ngon: 5 },
        bone: ankle,
        name: "backToe",
        group: "feet",
      },
    );

    b.part(new THREE.SphereGeometry(0.023, 6, 4), ORANGE, {
      bone: ankle,
      at: foot,
      scale: [1.25, 0.55, 1.4],
      group: "feet",
      name: "footPad",
    });
  }

  b.part(new THREE.BoxGeometry(0.19, 0.035, 0.035), BLACK, {
    bone: root,
    at: [0, 1.055, 0.255],
    rotation: [0, 0, 0],
    group: "graphic",
    name: "chestBand",
  });

  b.part(new THREE.BoxGeometry(0.12, 0.025, 0.012), YELLOW, {
    bone: root,
    at: [0, 0.995, 0.34],
    group: "graphic",
    name: "chestBadge",
  });

  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 8), RED, {
    bone: root,
    at: [0.0, 0.99, 0.355],
    dir: [0, 0, 1],
    group: "graphic",
    name: "roundBadge",
  });

  b.part(new THREE.SphereGeometry(0.034, 6, 4), YELLOW, {
    bone: head,
    at: [0, 1.42, 0.48],
    scale: [1.6, 0.55, 0.8],
    group: "head",
    name: "crownAccent",
  });

  return b.root;
}
