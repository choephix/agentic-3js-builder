```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  frame,
} from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized low-poly songbird perched on a forked branch, built from bold Bauhaus primary-colour geometry.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#e53935";
  const BLUE = "#165dba";
  const YELLOW = "#f5c518";
  const OCHRE = "#e89d20";
  const WHITE = "#f4f0df";
  const BLACK = "#16191f";
  const BROWN = "#70452c";
  const LIGHT_BROWN = "#a86d3e";
  const GREEN = "#3d8f52";

  const H = 1.55;
  const bodyRoot = [0, 1.02, -0.08] as const;
  const headAt = [0, 1.58, 0.20] as const;

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted, readable songbird rig.

  const hips = b.joint("hips", {
    at: bodyRoot,
    dir: [0, 0.2, 1],
    role: "spine",
  });

  const torsoPath = catmull(
    [
      [0, 1.00, -0.26],
      [0, 1.08, -0.04],
      [0, 1.17, 0.18],
      [0, 1.29, 0.34],
    ],
    { tension: 0.35 },
  );
  const torso = b.chain("torso", torsoPath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.25, 0.28],
    [0, 1.40, 0.27],
    [0, 1.54, 0.22],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: hips,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: headAt,
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.52, 0.30],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const leftLegPts = [
    [0.105, 1.06, -0.10],
    [0.145, 0.87, -0.035],
    [0.135, 0.69, 0.04],
  ] as const;
  const rightLegPts = [
    [-0.105, 1.06, -0.10],
    [-0.145, 0.87, -0.035],
    [-0.135, 0.69, 0.04],
  ] as const;

  const legL = b.chain("legL", polyline(leftLegPts), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.135, 0.66, 0.04],
  });
  const legR = b.chain("legR", polyline(rightLegPts), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.135, 0.66, 0.04],
  });

  const toesL = [
    b.chain(
      "toeLfront",
      polyline([
        [0.135, 0.69, 0.04],
        [0.185, 0.67, 0.17],
      ]),
      { parent: legL.tip, names: ["toeLfront", "toeLfrontTip"], role: "digit" },
    ),
    b.chain(
      "toeLside",
      polyline([
        [0.135, 0.69, 0.04],
        [0.255, 0.67, 0.03],
      ]),
      { parent: legL.tip, names: ["toeLside", "toeLsideTip"], role: "digit" },
    ),
    b.chain(
      "toeLback",
      polyline([
        [0.135, 0.69, 0.04],
        [0.075, 0.67, -0.105],
      ]),
      { parent: legL.tip, names: ["toeLback", "toeLbackTip"], role: "digit" },
    ),
  ];

  const toesR = [
    b.chain(
      "toeRfront",
      polyline([
        [-0.135, 0.69, 0.04],
        [-0.185, 0.67, 0.17],
      ]),
      { parent: legR.tip, names: ["toeRfront", "toeRfrontTip"], role: "digit" },
    ),
    b.chain(
      "toeRside",
      polyline([
        [-0.135, 0.69, 0.04],
        [-0.255, 0.67, 0.03],
      ]),
      { parent: legR.tip, names: ["toeRside", "toeRsideTip"], role: "digit" },
    ),
    b.chain(
      "toeRback",
      polyline([
        [-0.135, 0.69, 0.04],
        [-0.075, 0.67, -0.105],
      ]),
      { parent: legR.tip, names: ["toeRback", "toeRbackTip"], role: "digit" },
    ),
  ];

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.17, 1.32, 0.17],
      [0.34, 1.40, 0.16],
      [0.54, 1.47, 0.13],
      [0.71, 1.39, 0.10],
    ]),
    {
      parent: torso.joints[2],
      names: ["wingL", "wingMidL", "wingElbowL", "wingTipL"],
      role: "wing",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.17, 1.32, 0.17],
      [-0.34, 1.40, 0.16],
      [-0.54, 1.47, 0.13],
      [-0.71, 1.39, 0.10],
    ]),
    {
      parent: torso.joints[2],
      names: ["wingR", "wingMidR", "wingElbowR", "wingTipR"],
      role: "wing",
    },
  );

  const tailL = b.chain(
    "tailL",
    catmull([
      [0.05, 1.06, -0.26],
      [0.12, 1.02, -0.45],
      [0.19, 1.00, -0.72],
    ]),
    { parent: torso.joints[0], names: ["tailL", "tailL2", "tailLTip"], role: "fan" },
  );
  const tailC = b.chain(
    "tailC",
    catmull([
      [0, 1.05, -0.27],
      [0, 1.01, -0.49],
      [0, 1.00, -0.80],
    ]),
    { parent: torso.joints[0], names: ["tailC", "tailC2", "tailCTip"], role: "fan" },
  );
  const tailR = b.chain(
    "tailR",
    catmull([
      [-0.05, 1.06, -0.26],
      [-0.12, 1.02, -0.45],
      [-0.19, 1.00, -0.72],
    ]),
    { parent: torso.joints[0], names: ["tailR", "tailR2", "tailRTip"], role: "fan" },
  );

  // ------------------------------------------------------------------------------------------------
  // Branch: a simple geometric stage, with a fork behind the feet.

  const branch = b.sweep(
    catmull([
      [-1.05, 0.16, -0.02],
      [-0.62, 0.12, 0.00],
      [-0.20, 0.15, 0.01],
      [0.22, 0.13, 0.01],
      [0.68, 0.17, -0.01],
      [1.06, 0.23, 0.02],
    ]),
    0.085,
    { color: BROWN, sides: 7, caps: "round", name: "mainBranch", group: "branch" },
  );

  b.sweep(
    polyline([
      [-0.52, 0.13, 0.00],
      [-0.70, 0.32, -0.02],
      [-0.83, 0.52, -0.01],
    ]),
    0.052,
    { color: LIGHT_BROWN, sides: 6, caps: "round", name: "forkL", group: "branch" },
  );
  b.sweep(
    polyline([
      [0.53, 0.15, -0.01],
      [0.69, 0.35, -0.02],
      [0.82, 0.53, 0.01],
    ]),
    0.048,
    { color: LIGHT_BROWN, sides: 6, caps: "round", name: "forkR", group: "branch" },
  );

  // Angular branch paint marks and a few stylized leaves.
  for (const x of [-0.82, -0.41, 0.05, 0.47, 0.82]) {
    b.part(
      new THREE.CylinderGeometry(0.092, 0.092, 0.012, 7),
      OCHRE,
      {
        at: [x, 0.16, 0.01],
        dir: [0, 1, 0],
        axis: "y",
        name: "branchRing",
        group: "branch",
      },
    );
  }

  for (const [x, z, s] of [
    [-0.72, -0.02, 1],
    [0.78, 0.02, -1],
  ] as const) {
    b.extrude(
      [
        [0, 0],
        [0.13, 0.03],
        [0.19, 0.12],
        [0.08, 0.20],
        [-0.06, 0.13],
      ],
      {
        at: [x, 0.43, z],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.005,
        color: GREEN,
        name: "geometricLeaf",
        group: "branch",
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Body and head. The body is intentionally made from chunky, almost constructivist forms.

  b.sweep(torso, (t) => 0.205 - t * 0.035, {
    color: RED,
    sides: 8,
    caps: "round",
    name: "redBody",
    group: "body",
    sectors: [[115, 245, YELLOW]],
  });

  b.sweep(neck, [0.145, 0.19], {
    color: RED,
    sides: 8,
    caps: "round",
    name: "neck",
    group: "body",
  });

  b.part(
    new THREE.SphereGeometry(0.235, 12, 8),
    YELLOW,
    {
      bone: head,
      at: headAt,
      scale: [1.0, 0.92, 0.92],
      name: "goldenHead",
      group: "head",
      flat: true,
    },
  );

  // White geometric throat patch.
  b.part(
    new THREE.SphereGeometry(0.13, 8, 6),
    WHITE,
    {
      bone: head,
      at: [0, 1.53, 0.385],
      scale: [0.78, 0.82, 0.34],
      name: "throatPatch",
      group: "head",
      flat: true,
    },
  );

  // Cheek discs create a strong Bauhaus face silhouette.
  for (const s of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(0.082, 0.082, 0.018, 8),
      RED,
      {
        bone: head,
        at: [s * 0.185, 1.55, 0.285],
        dir: [s, 0, 0],
        axis: "y",
        name: "cheekDisc",
        group: "head",
      },
    );
  }

  // Eyes: white discs, black pupils, and tiny yellow highlights.
  for (const s of [-1, 1]) {
    const eyeX = s * 0.105;
    b.part(
      new THREE.SphereGeometry(0.067, 10, 6),
      WHITE,
      {
        bone: head,
        at: [eyeX, 1.69, 0.385],
        scale: [1, 1, 0.38],
        name: "eyeWhite",
        group: "face",
        flat: true,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.039, 8, 5),
      BLACK,
      {
        bone: head,
        at: [eyeX, 1.695, 0.412],
        scale: [0.85, 0.85, 0.42],
        name: "pupil",
        group: "face",
        flat: true,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.011, 6, 4),
      YELLOW,
      {
        bone: head,
        at: [eyeX - s * 0.012, 1.715, 0.428],
        name: "eyeGlint",
        group: "face",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.105, 0.018, 0.025),
      BLACK,
      {
        bone: head,
        at: [eyeX, 1.775, 0.37],
        rotation: [0, s * 0.15, s * 0.18],
        name: "brow",
        group: "face",
      },
    );
  }

  // Beak: a black root block with a yellow triangular upper bill and red lower bill.
  b.part(
    new THREE.BoxGeometry(0.105, 0.075, 0.075),
    BLACK,
    {
      bone: jaw,
      at: [0, 1.59, 0.405],
      name: "beakRoot",
      group: "face",
      flat: true,
    },
  );
  b.part(
    new THREE.ConeGeometry(0.095, 0.22, 4),
    YELLOW,
    {
      bone: jaw,
      at: [0, 1.60, 0.51],
      dir: [0, 0, 1],
      axis: "y",
      name: "upperBill",
      group: "face",
      flat: true,
    },
  );
  b.part(
    new THREE.ConeGeometry(0.06, 0.15, 4),
    RED,
    {
      bone: jaw,
      at: [0, 1.535, 0.475],
      dir: [0, 0, 1],
      axis: "y",
      name: "lowerBill",
      group: "face",
      flat: true,
    },
  );

  // Three square crest blocks.
  for (const [x, y, z, scale] of [
    [0, 1.84, 0.18, 0.10],
    [0.075, 1.81, 0.16, 0.085],
    [-0.075, 1.81, 0.16, 0.085],
  ] as const) {
    b.part(
      new THREE.BoxGeometry(scale, scale * 1.35, scale * 0.7),
      BLUE,
      {
        bone: head,
        at: [x, y, z],
        rotation: [0, 0, x * 2],
        name: "crestBlock",
        group: "head",
        flat: true,
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Legs and toes. Red legs contrast with black graphic toes.

  for (const leg of [legL, legR]) {
    b.sweep(leg, [0.034, 0.025], {
      color: OCHRE,
      sides: 6,
      caps: "round",
      name: "ochreLeg",
      group: "legs",
    });
    b.part(
      new THREE.SphereGeometry(0.043, 7, 5),
      RED,
      {
        bone: leg.tip,
        at: leg.tip.at,
        name: "ankleCuff",
        group: "legs",
      },
    );
  }

  for (const toes of [...toesL, ...toesR]) {
    b.sweep(toes, [0.017, 0.009], {
      color: BLACK,
      sides: 6,
      caps: "round",
      name: "blackToe",
      group: "legs",
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Wings: red structural tubes with yellow rectangular feather bars and blue tips.

  for (const [wing, side] of [
    [wingL, 1],
    [wingR, -1],
  ] as const) {
    b.sweep(wing, (t) => 0.075 - t * 0.045, {
      color: RED,
      sides: 6,
      caps: "round",
      name: side > 0 ? "wingLRed" : "wingRRed",
      group: "wings",
    });

    b.membrane(
      wing.slice(0, 0.82),
      [
        wing.at(0).at,
        [side * 0.34, 1.29, 0.10],
        [side * 0.61, 1.31, 0.08],
      ],
      {
        color: YELLOW,
        thickness: 0.012,
        rows: 3,
        cols: 5,
        scallop: 0.08,
        name: side > 0 ? "wingLPanel" : "wingRPanel",
        group: "wings",
      },
    );

    for (const t of [0.22, 0.43, 0.64, 0.82]) {
      const p = wing.at(t);
      b.part(
        new THREE.BoxGeometry(0.035, 0.12, 0.028),
        WHITE,
        {
          bone: p.bone,
          at: p.at,
          aim: [side * 0.7, -0.04, 0.02],
          name: "wingFeatherBar",
          group: "wings",
          flat: true,
        },
      );
    }

    b.part(
      new THREE.BoxGeometry(0.12, 0.10, 0.045),
      BLUE,
      {
        bone: wing.tip,
        at: wing.tip.at,
        rotation: [0, side * 0.2, side * 0.25],
        name: "blueWingTip",
        group: "wings",
        flat: true,
      },
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Tail fan: three blue blades with yellow terminal triangles.

  for (const [tail, side] of [
    [tailL, 1],
    [tailC, 0],
    [tailR, -1],
  ] as const) {
    b.sweep(tail, [0.065, 0.012], {
      color: BLUE,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: side > 0 ? "tailBlueL" : side < 0 ? "tailBlueR" : "tailBlueCenter",
      group: "tail",
    });

    const p = tail.at(0.82);
    b.part(
      new THREE.ConeGeometry(0.034, 0.13, 4),
      YELLOW,
      {
        bone: p.bone,
        at: p.at,
        dir: [side * 0.15, -0.02, -1],
        axis: "y",
        name: "tailGoldTip",
        group: "tail",
        flat: true,
      },
    );
  }

  // Tail root saddle, a black geometric band.
  b.sweep(
    polyline([
      [-0.14, 1.08, -0.24],
      [0, 1.08, -0.28],
      [0.14, 1.08, -0.24],
    ]),
    0.026,
    { color: BLACK, sides: 6, caps: "round", bone: torso.joints[0], name: "tailBand", group: "tail" },
  );

  // A few deliberate primary-colour studs on the breast and branch.
  for (const [x, y, z, c] of [
    [-0.10, 1.27, 0.33, WHITE],
    [0.10, 1.30, 0.34, WHITE],
    [0, 1.35, 0.36, BLUE],
    [-0.23, 0.20, 0.03, YELLOW],
    [0.25, 0.19, 0.03, RED],
  ] as const) {
    b.part(
      new THREE.SphereGeometry(0.025, 7, 5),
      c,
      {
        at: [x, y, z],
        bone: x === 0 && y > 1 ? torso.joints[2] : undefined,
        name: "colourStud",
        group: "ornament",
      },
    );
  }

  return b.root;
}
```