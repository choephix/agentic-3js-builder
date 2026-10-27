import * as THREE from "three";
import { createBuilder, catmull, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A stylized songbird perched on a geometric branch, assembled from bold Bauhaus primary-color primitives.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#e53935";
  const BLUE = "#2455c3";
  const YELLOW = "#f6c431";
  const BLACK = "#17191f";
  const CREAM = "#f4e9c8";
  const GREEN = "#2f8b57";
  const BRANCH = "#6d432c";
  const BRANCH_DARK = "#3c281e";
  const WHITE = "#fffaf0";

  // ---------------------------------------------------------------------------
  // Skeleton first: one central spine, a head, jaw hinge, wings, legs and toes.
  // ---------------------------------------------------------------------------

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.18],
      [0, 0.83, 0.08],
      [0, 0.86, 0.34],
      [0, 0.9, 0.54],
    ]),
    {
      count: 4,
      names: ["pelvis", "chest", "shoulder", "neck"],
      role: "spine",
    },
  );

  const neck = spine.tip!;
  const head = b.joint("head", {
    parent: spine,
    at: [0, 0.98, 0.67],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.945, 0.775],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.16, 0.9, 0.28],
      [0.34, 0.84, 0.18],
      [0.54, 0.73, 0.08],
      [0.68, 0.67, -0.02],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingL", "wingL_elbow", "wingL_tip"],
      role: "wing",
      group: "wings",
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.16, 0.9, 0.28],
      [-0.34, 0.84, 0.18],
      [-0.54, 0.73, 0.08],
      [-0.68, 0.67, -0.02],
    ]),
    {
      parent: spine.joints[2],
      names: ["wingR", "wingR_elbow", "wingR_tip"],
      role: "wing",
      group: "wings",
    },
  );

  const legL = b.chain(
    "legL",
    [
      [0.12, 0.72, 0.12],
      [0.16, 0.48, 0.13],
      [0.14, 0.29, 0.16],
    ],
    {
      parent: spine.joints[0],
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.14, 0.2, 0.16],
    },
  );

  const legR = b.chain(
    "legR",
    [
      [-0.12, 0.72, 0.12],
      [-0.16, 0.48, 0.13],
      [-0.14, 0.29, 0.16],
    ],
    {
      parent: spine.joints[0],
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.14, 0.2, 0.16],
    },
  );

  const toeL = b.chain(
    "toeL",
    [
      [0.14, 0.29, 0.16],
      [0.2, 0.24, 0.24],
      [0.28, 0.23, 0.29],
    ],
    { parent: legL, names: ["toeL", "toeL_tip"], role: "digit" },
  );

  const toeR = b.chain(
    "toeR",
    [
      [-0.14, 0.29, 0.16],
      [-0.2, 0.24, 0.24],
      [-0.28, 0.23, 0.29],
    ],
    { parent: legR, names: ["toeR", "toeR_tip"], role: "digit" },
  );

  // ---------------------------------------------------------------------------
  // Branch: a chunky Bauhaus perch, kept simpler than the bird.
  // ---------------------------------------------------------------------------

  b.sweep(
    catmull([
      [-0.92, 0.2, -0.35],
      [-0.55, 0.22, -0.08],
      [-0.12, 0.21, 0.08],
      [0.32, 0.2, 0.04],
      [0.88, 0.22, -0.2],
    ]),
    0.075,
    {
      color: BRANCH,
      section: { ngon: 6 },
      sides: 6,
      caps: "round",
      name: "mainBranch",
      group: "scenery",
    },
  );

  b.sweep(
    catmull([
      [-0.36, 0.22, -0.06],
      [-0.55, 0.38, 0.03],
      [-0.68, 0.56, 0.02],
    ]),
    [0.045, 0.018],
    {
      color: BRANCH_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: "branchForkL",
      group: "scenery",
    },
  );

  b.sweep(
    catmull([
      [0.42, 0.21, -0.03],
      [0.56, 0.36, -0.12],
      [0.69, 0.47, -0.26],
    ]),
    [0.04, 0.012],
    {
      color: BRANCH_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: "branchForkR",
      group: "scenery",
    },
  );

  // ---------------------------------------------------------------------------
  // Body silhouette: red breast, blue back, cream belly.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.19 - 0.035 * t, {
    color: RED,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "redBody",
    group: "body",
  });

  b.sweep(
    catmull([
      [0, 0.84, 0.13],
      [0, 0.91, 0.35],
      [0, 0.97, 0.55],
      [0, 1.0, 0.66],
    ]),
    [0.14, 0.1],
    {
      color: BLUE,
      section: { ngon: 6 },
      caps: "round",
      name: "blueBack",
      group: "body",
    },
  );

  b.sweep(
    catmull([
      [0, 0.7, 0.28],
      [0, 0.68, 0.42],
      [0, 0.72, 0.56],
    ]),
    [0.13, 0.085],
    {
      color: CREAM,
      section: { ngon: 7 },
      caps: "round",
      name: "creamBelly",
      group: "body",
    },
  );

  // Tail feathers: three strong primary-colored wedges.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.075, 0],
        [0.16, 0.3, "sharp"],
        [0.035, 0.2],
      ],
      {
        at: [s * 0.055, 0.82, -0.02],
        x: [s, 0, 0],
        y: [0, 0.75, -0.18],
        thickness: 0.025,
        bevel: 0.008,
        color: s > 0 ? BLUE : YELLOW,
        bone: spine.joints[0],
        name: s > 0 ? "tailFeatherL" : "tailFeatherR",
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Head, face, beak, eye graphics and crown disc.
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(0.18, 10, 7),
    RED,
    {
      bone: head,
      at: [0, 1.03, 0.7],
      scale: [1.0, 1.08, 1.12],
      flat: true,
      name: "roundHead",
      group: "head",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.115, 8, 6),
    CREAM,
    {
      bone: head,
      at: [0, 0.985, 0.82],
      scale: [1.15, 0.72, 0.72],
      flat: true,
      name: "muzzle",
      group: "face",
    },
  );

  // Black angular beak, split into upper and lower graphic wedges.
  b.extrude(
    [
      [0, 0],
      [0.075, 0.015],
      [0.0, 0.11, "sharp"],
      [-0.075, 0.015],
    ],
    {
      at: [0, 0.99, 0.875],
      x: [1, 0, 0],
      y: [0, 0.12, 0],
      thickness: 0.045,
      bevel: 0.006,
      color: BLACK,
      bone: head,
      name: "upperBeak",
      group: "face",
    },
  );

  b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.0, -0.055, "sharp"],
    ],
    {
      at: [0, 0.98, 0.89],
      x: [1, 0, 0],
      y: [0, 0.1, 0],
      thickness: 0.032,
      bevel: 0.004,
      color: BLACK,
      bone: jaw,
      name: "lowerBeak",
      group: "face",
    },
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#17191f"/>
      <circle cx="50" cy="53" r="30" fill="#f6c431"/>
      <circle cx="50" cy="56" r="13" fill="#17191f"/>
      <circle cx="40" cy="35" r="8" fill="#fffaf0"/>
      <circle cx="62" cy="43" r="4" fill="#fffaf0"/>
    </svg>`,
    { size: 128 },
  );

  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSurface.around([0, 1.03, 0.7]).at(s * 48, 8);
    if (hit) {
      b.decal(faceSurface, eyeTexture, {
        at: hit,
        size: [0.095, 0.095],
        dir: hit.n,
        up: [0, 1, 0],
        mirror: s > 0,
        lift: 0.004,
        name: s > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }
  }

  // A Bauhaus yellow forehead button and a red/blue crown fan.
  b.part(
    new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10),
    YELLOW,
    {
      bone: head,
      at: [0, 1.19, 0.67],
      dir: [0, 1, 0],
      flat: true,
      name: "foreheadButton",
      group: "ornament",
    },
  );

  b.extrude(
    [
      [0, 0],
      [0.13, 0.02],
      [0.1, 0.16],
      [0.035, 0.27, "sharp"],
      [-0.03, 0.13],
    ],
    {
      at: [0, 1.12, 0.63],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.004,
      color: BLUE,
      bone: head,
      name: "crest",
      group: "ornament",
    },
  );

  // ---------------------------------------------------------------------------
  // Wings: chunky blue geometric slabs with yellow inset feathers.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const wingColor = s > 0 ? BLUE : "#315fce";

    b.membrane(wingL, [wingL.at(0), wingL.at(0.45), wingL.at(1)], {
      color: wingColor,
      thickness: 0.025,
      rows: 3,
      cols: 4,
      skin: "smooth",
      name: s > 0 ? "leftWing" : "rightWing",
      group: "wings",
    });

    // Broad yellow wing stripe, layered on each side.
    b.extrude(
      [
        [0, 0],
        [0.07, 0],
        [0.14, 0.23],
        [0.03, 0.3, "sharp"],
      ],
      {
        at: [s * 0.28, 0.83, 0.17],
        x: [s, 0, 0],
        y: [0, 0.35, -0.1],
        thickness: 0.025,
        bevel: 0.005,
        color: YELLOW,
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        name: s > 0 ? "yellowWingMarkL" : "yellowWingMarkR",
        group: "wings",
      },
    );
  }

  // Add the opposite wing membrane explicitly; the first membrane above is the left-side hero surface.
  b.membrane(
    wingR,
    [wingR.at(0), wingR.at(0.45), wingR.at(1)],
    {
      color: "#315fce",
      thickness: 0.025,
      rows: 3,
      cols: 4,
      skin: "smooth",
      name: "rightWing",
      group: "wings",
    },
  );

  // Wing button rivets.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.035, 7, 5),
      YELLOW,
      {
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        at: [s * 0.36, 0.82, 0.13],
        flat: true,
        name: s > 0 ? "wingRivetL" : "wingRivetR",
        group: "wings",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Feet and toes: warm yellow rods gripping the branch.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.035, 0.025], {
    color: YELLOW,
    section: { ngon: 5 },
    caps: "round",
    name: "legL",
    group: "feet",
  });
  b.sweep(legR, [0.035, 0.025], {
    color: YELLOW,
    section: { ngon: 5 },
    caps: "round",
    name: "legR",
    group: "feet",
  });

  for (const [chain, side] of [
    [toeL, 1],
    [toeR, -1],
  ] as const) {
    b.sweep(chain, [0.018, 0.006], {
      color: YELLOW,
      section: { ngon: 5 },
      caps: "round",
      name: side > 0 ? "toeL" : "toeR",
      group: "feet",
    });

    // Rear toe, a short opposing diagonal.
    b.rod(
      chain.at(0).at,
      [side * 0.25, 0.235, 0.08],
      0.014,
      {
        color: YELLOW,
        section: { ngon: 5 },
        caps: "round",
        bone: chain.joints[0],
        name: side > 0 ? "backToeL" : "backToeR",
        group: "feet",
      },
    );
  }

  // Small red circular badge on the breast: the signature Bauhaus accent.
  b.part(
    new THREE.CylinderGeometry(0.07, 0.07, 0.018, 12),
    RED,
    {
      at: [0, 0.86, 0.22],
      dir: [0, 0, 1],
      axis: "y",
      bone: spine.joints[1],
      flat: true,
      name: "breastBadge",
      group: "ornament",
    },
  );

  return b.root;
}
