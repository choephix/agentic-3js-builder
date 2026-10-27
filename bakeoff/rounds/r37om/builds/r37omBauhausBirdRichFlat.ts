import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized low-poly songbird perched on a geometric branch, built from bold Bauhaus primary-colour forms.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const BLUE = "#1769aa";
  const BLUE_DARK = "#0b3767";
  const RED = "#d92f26";
  const RED_DARK = "#8f211d";
  const YELLOW = "#f2c230";
  const YELLOW_LIGHT = "#ffe27a";
  const BLACK = "#17191c";
  const WHITE = "#fff8e6";
  const OCHRE = "#9b642d";
  const BRANCH_DARK = "#493224";
  const GREEN = "#3e7c47";

  const root = b.joint("hips", {
    at: [0, 0.92, -0.02],
    dir: [0, 1, 0.12],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.88, -0.17],
      [0, 1.08, -0.04],
      [0, 1.3, 0.06],
      [0, 1.48, 0.16],
    ]),
    {
      parent: root,
      names: ["pelvis", "chest", "neck", "spineTip"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.55, 0.2],
    dir: [0, 0.1, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.51, 0.29],
    dir: [0, -0.25, 1],
    role: "jaw",
    group: "face",
  });

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.22, 1.34, 0.03],
      [0.46, 1.29, 0.01],
      [0.71, 1.14, 0.01],
      [0.88, 0.89, 0.04],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wingTipL"],
      role: "wing",
      group: "wings",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.22, 1.34, 0.03],
      [-0.46, 1.29, 0.01],
      [-0.71, 1.14, 0.01],
      [-0.88, 0.89, 0.04],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wingTipR"],
      role: "wing",
      group: "wings",
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.13, 0.92, -0.01],
      [0.14, 0.68, 0.02],
      [0.16, 0.48, 0.07],
    ],
    {
      parent: root,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.16, 0.39, 0.1],
      group: "legs",
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.13, 0.92, -0.01],
      [-0.14, 0.68, 0.02],
      [-0.16, 0.48, 0.07],
    ],
    {
      parent: root,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.16, 0.39, 0.1],
      group: "legs",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.2],
      [0, 0.93, -0.42],
      [0, 0.87, -0.65],
      [0, 0.8, -0.86],
    ]),
    {
      parent: root,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      group: "tail",
    },
  );

  // The main branch is deliberately chunky and geometric.
  b.sweep(
    catmull([
      [-0.92, 0.22, -0.03],
      [-0.5, 0.27, 0.02],
      [0, 0.23, -0.01],
      [0.48, 0.3, 0.02],
      [0.96, 0.25, -0.04],
    ]),
    0.075,
    {
      color: BRANCH_DARK,
      sides: 6,
      caps: "round",
      name: "mainBranch",
      group: "branch",
    },
  );

  b.sweep(
    [
      [0.56, 0.28, 0.02],
      [0.77, 0.47, 0.04],
    ],
    0.035,
    {
      color: OCHRE,
      sides: 6,
      caps: "round",
      name: "branchForkL",
      group: "branch",
    },
  );

  b.sweep(
    [
      [-0.53, 0.26, 0.01],
      [-0.75, 0.44, -0.01],
    ],
    0.032,
    {
      color: OCHRE,
      sides: 6,
      caps: "round",
      name: "branchForkR",
      group: "branch",
    },
  );

  b.sweep(spine, (t) => 0.25 - t * 0.075, {
    color: BLUE,
    sides: 8,
    section: "circle",
    caps: "round",
    name: "blueBody",
    group: "body",
  });

  b.part(
    new THREE.SphereGeometry(0.25, 10, 7),
    YELLOW,
    {
      bone: spine.joints[1],
      at: [0, 1.16, 0.235],
      scale: [0.78, 1.0, 0.34],
      name: "yellowBreast",
      group: "body",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.23, 10, 7),
    BLUE_DARK,
    {
      bone: head,
      at: [0, 1.57, 0.22],
      scale: [1.02, 1.0, 0.9],
      name: "head",
      group: "face",
    },
  );

  // A crisp black Bauhaus cap, made as a flattened overlapping primitive.
  b.part(
    new THREE.SphereGeometry(0.235, 10, 6),
    BLACK,
    {
      bone: head,
      at: [0, 1.68, 0.18],
      scale: [1.02, 0.48, 0.92],
      name: "blackCap",
      group: "face",
    },
  );

  // Red throat medallion.
  b.part(
    new THREE.CylinderGeometry(0.11, 0.11, 0.025, 8),
    RED,
    {
      bone: head,
      at: [0, 1.48, 0.39],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 0],
      name: "redThroat",
      group: "face",
    },
  );

  // Eyes: white discs, black pupils, and tiny yellow highlights.
  for (const s of [-1, 1]) {
    const eyeX = s * 0.095;

    b.part(
      new THREE.SphereGeometry(0.068, 8, 6),
      WHITE,
      {
        bone: head,
        at: [eyeX, 1.64, 0.405],
        scale: [1, 1, 0.42],
        name: s > 0 ? "eyeWhiteL" : "eyeWhiteR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.036, 7, 5),
      BLACK,
      {
        bone: head,
        at: [eyeX, 1.64, 0.455],
        scale: [1, 1, 0.35],
        name: s > 0 ? "pupilL" : "pupilR",
        group: "face",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.012, 6, 4),
      YELLOW_LIGHT,
      {
        bone: head,
        at: [eyeX - s * 0.012, 1.665, 0.47],
        scale: [1, 1, 0.3],
        name: s > 0 ? "eyeGlintL" : "eyeGlintR",
        group: "face",
      },
    );

    // Strong black eyebrow bars give the face a graphic Bauhaus silhouette.
    b.part(
      new THREE.BoxGeometry(0.14, 0.025, 0.035),
      BLACK,
      {
        bone: head,
        at: [eyeX, 1.735, 0.405],
        rotation: [0, s * 12, s * -5],
        name: s > 0 ? "browL" : "browR",
        group: "face",
      },
    );
  }

  // Square yellow beak with a red lower mandible.
  b.part(
    new THREE.ConeGeometry(0.105, 0.22, 4),
    YELLOW,
    {
      bone: head,
      at: [0, 1.585, 0.49],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 45],
      name: "upperBeak",
      group: "face",
    },
  );

  b.part(
    new THREE.ConeGeometry(0.065, 0.13, 4),
    RED,
    {
      bone: jaw,
      at: [0, 1.515, 0.48],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 45],
      name: "lowerBeak",
      group: "face",
    },
  );

  // Wings are broad flat primary-colour slabs, held slightly away from the body.
  const wingOutline: [number, number, "sharp"?][] = [
    [0, 0.18, "sharp"],
    [0.17, 0.23, "sharp"],
    [0.42, 0.08, "sharp"],
    [0.58, -0.2, "sharp"],
    [0.49, -0.52, "sharp"],
    [0.23, -0.42, "sharp"],
    [0.04, -0.18, "sharp"],
  ];

  for (const s of [-1, 1]) {
    b.extrude(wingOutline, {
      at: [s * 0.22, 1.34, 0.04],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      bone: s > 0 ? wingL.joints[0] : wingR.joints[0],
      color: RED,
      name: s > 0 ? "redWingL" : "redWingR",
      group: "wings",
    });

    // Blue wing root circle.
    b.part(
      new THREE.CylinderGeometry(0.13, 0.13, 0.055, 8),
      BLUE_DARK,
      {
        bone: s > 0 ? wingL.joints[0] : wingR.joints[0],
        at: [s * 0.28, 1.29, 0.075],
        dir: [s, 0, 0],
        axis: "y",
        rotation: [0, 0, 90],
        name: s > 0 ? "wingRootL" : "wingRootR",
        group: "wings",
      },
    );

    // Yellow graphic feather bars.
    for (let i = 0; i < 3; i++) {
      b.part(
        new THREE.BoxGeometry(0.055, 0.34 - i * 0.045, 0.028),
        YELLOW,
        {
          bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
          at: [s * (0.48 + i * 0.045), 1.13 - i * 0.06, 0.075],
          rotation: [0, 0, s * (18 + i * 5)],
          name: `${s > 0 ? "wingL" : "wingR"}Bar${i}`,
          group: "wings",
        },
      );
    }
  }

  // Tail: three bold red and yellow blades behind the bird.
  const tailBlade: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.13, 0.02, "sharp"],
    [0.08, -0.55, "sharp"],
    [-0.07, -0.46, "sharp"],
  ];

  for (const s of [-1, 0, 1]) {
    b.extrude(tailBlade, {
      at: [s * 0.105, 0.86, -0.67],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      bone: tail.tip,
      color: s === 0 ? YELLOW : RED,
      name: `tailFeather${s}`,
      group: "tail",
    });
  }

  // Legs and angular feet.
  for (const s of [-1, 1]) {
    const leg = s > 0 ? legL : legR;

    b.sweep(leg, [0.045, 0.032], {
      color: YELLOW,
      sides: 6,
      caps: "round",
      name: s > 0 ? "legL" : "legR",
      group: "legs",
    });

    b.part(
      new THREE.SphereGeometry(0.055, 7, 5),
      RED,
      {
        bone: leg.tip,
        at: [s * 0.16, 0.47, 0.08],
        scale: [1.15, 0.65, 1],
        name: s > 0 ? "ankleL" : "ankleR",
        group: "legs",
      },
    );

    // Three separated toes per foot, spread forward and sideways.
    b.rod(
      [s * 0.16, 0.46, 0.08],
      [s * 0.2, 0.42, 0.25],
      0.018,
      {
        color: YELLOW,
        caps: "round",
        name: s > 0 ? "toeFrontL" : "toeFrontR",
        group: "digits",
      },
    );

    b.rod(
      [s * 0.16, 0.46, 0.08],
      [s * 0.34, 0.42, 0.11],
      0.018,
      {
        color: YELLOW,
        caps: "round",
        name: s > 0 ? "toeOuterL" : "toeOuterR",
        group: "digits",
      },
    );

    b.rod(
      [s * 0.16, 0.46, 0.08],
      [s * 0.03, 0.42, 0.02],
      0.017,
      {
        color: YELLOW,
        caps: "round",
        name: s > 0 ? "toeBackL" : "toeBackR",
        group: "digits",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.025, 6, 4),
      RED_DARK,
      {
        at: [s * 0.2, 0.415, 0.25],
        name: s > 0 ? "clawFrontL" : "clawFrontR",
        group: "digits",
      },
    );
  }

  // Graphic breast medallion and small geometric flank patches.
  b.part(
    new THREE.CylinderGeometry(0.145, 0.145, 0.035, 8),
    YELLOW_LIGHT,
    {
      bone: spine.joints[1],
      at: [0, 1.2, 0.285],
      dir: [0, 0, 1],
      axis: "y",
      rotation: [90, 0, 0],
      name: "breastMedallion",
      group: "body",
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.BoxGeometry(0.1, 0.16, 0.025),
      RED_DARK,
      {
        bone: spine.joints[1],
        at: [s * 0.21, 1.15, 0.18],
        rotation: [0, s * 15, s * 20],
        name: s > 0 ? "flankPatchL" : "flankPatchR",
        group: "body",
      },
    );
  }

  // A few square branch leaves keep the stage graphic without distracting from the bird.
  for (const p of [
    [0.78, 0.5, 0.03],
    [0.87, 0.58, 0.03],
    [-0.78, 0.48, -0.01],
  ] as [number, number, number][]) {
    b.part(
      new THREE.BoxGeometry(0.14, 0.055, 0.025),
      GREEN,
      {
        at: p,
        rotation: [0, 0, p[0] > 0 ? 28 : -28],
        name: "branchLeaf",
        group: "branch",
      },
    );
  }

  return b.root;
}
