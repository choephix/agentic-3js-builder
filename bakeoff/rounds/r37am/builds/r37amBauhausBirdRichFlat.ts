import * as THREE from "three";
import { createBuilder, rng, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on Branch",
  description:
    "A stylized primary-colour songbird perched on a faceted branch, built from bold geometric primitives with graphic eyes, wings, tail feathers and tiny toes.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#d9272e";
  const RED_DARK = "#9e2026";
  const BLUE = "#1455a0";
  const BLUE_LIGHT = "#287dcc";
  const YELLOW = "#f4c51c";
  const YELLOW_DARK = "#c8940b";
  const BLACK = "#171a25";
  const WHITE = "#fff8e5";
  const CREAM = "#f3dfad";
  const BRANCH = "#593a2d";
  const BRANCH_LIGHT = "#85543a";
  const BRANCH_DARK = "#33231e";
  const GREEN = "#329447";

  // ---------------------------------------------------------------------------
  // Skeleton first: one root, a compact spine, a head hinge, legs, wings and
  // separated tail feather bones.

  const hips = b.joint("hips", {
    at: [0, 0.62, -0.03],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.62, -0.13],
    [0, 0.7, 0.02],
    [0, 0.78, 0.2],
    [0, 0.91, 0.3],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBase", "chest", "shoulder", "neckBase"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.98, 0.39],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.93, 0.45],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "head",
  });

  const legLPoints = limb(
    [0.105, 0.66, -0.015],
    [0.14, 0.22, 0.035],
    [0.17, 0.19, 0.18],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const legRPoints = limb(
    [-0.105, 0.66, -0.015],
    [-0.14, 0.22, 0.035],
    [0.17, 0.19, 0.18],
    [
      [0, 0, 1],
      [0, 0, -1],
    ],
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.14, 0.13, 0.035],
  });

  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.14, 0.13, 0.035],
  });

  const wingL = b.joint("wingL", {
    parent: spine.joints[2],
    at: [0.16, 0.84, 0.19],
    dir: [0.7, 0.12, -0.18],
    role: "wing",
    group: "wings",
  });

  const wingR = b.joint("wingR", {
    parent: spine.joints[2],
    at: [-0.16, 0.84, 0.19],
    dir: [-0.7, 0.12, -0.18],
    role: "wing",
    group: "wings",
  });

  const tailL = b.joint("tailL", {
    parent: hips,
    at: [0.045, 0.67, -0.17],
    dir: [0.18, 0.02, -1],
    role: "fan",
    group: "tail",
  });

  const tailC = b.joint("tailC", {
    parent: hips,
    at: [0, 0.68, -0.18],
    dir: [0, 0.02, -1],
    role: "fan",
    group: "tail",
  });

  const tailR = b.joint("tailR", {
    parent: hips,
    at: [-0.045, 0.67, -0.17],
    dir: [-0.18, 0.02, -1],
    role: "fan",
    group: "tail",
  });

  // ---------------------------------------------------------------------------
  // Reusable geometric helpers.

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    options: Record<string, any> = {},
  ) =>
    b.part(geometry, color, {
      at,
      bone,
      flat: true,
      ...options,
    });

  const cube = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    options: Record<string, any> = {},
  ) =>
    part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, bone, options);

  const lowSphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    scale: [number, number, number] = [1, 1, 1],
  ) =>
    part(
      new THREE.SphereGeometry(radius, 10, 6),
      color,
      at,
      bone,
      { scale },
    );

  const cylinder = (
    radius: number,
    length: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    dir: [number, number, number] = [0, 1, 0],
    radial = 8,
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius * 0.92, length, radial, 1),
      color,
      at,
      bone,
      { dir, axis: "y" },
    );

  const disc = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any,
    dir: [number, number, number] = [0, 0, 1],
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, 0.012, 12, 1),
      color,
      at,
      bone,
      { dir, axis: "y" },
    );

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    z: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone: any,
  ) => b.rod(a, z, radius, { color, bone, sides: 6 });

  const toe = (
    x: number,
    z: number,
    dx: number,
    dz: number,
    bone: any,
  ) => {
    rod([x, 0.205, z], [x + dx, 0.16, z + dz], 0.012, YELLOW_DARK, bone);
    lowSphere(0.018, YELLOW, [x + dx, 0.16, z + dz], bone, [1.2, 0.7, 1.2]);
  };

  // ---------------------------------------------------------------------------
  // The branch: deliberately simpler than the bird, with a strong Bauhaus
  // dark/light split and a few angular cut ends.

  const branchPath = catmull([
    [-0.78, 0.105, -0.22],
    [-0.53, 0.12, -0.15],
    [-0.25, 0.105, -0.04],
    [0.02, 0.11, 0.015],
    [0.29, 0.12, 0.07],
    [0.61, 0.105, 0.2],
    [0.82, 0.12, 0.27],
  ]);

  const branch = b.sweep(branchPath, 0.085, {
    color: BRANCH,
    sides: 7,
    section: { ngon: 7 },
    caps: "flat",
    skin: "rigid",
    name: "mainBranch",
    group: "branch",
  });

  const twigPath = catmull([
    [0.28, 0.12, 0.07],
    [0.42, 0.25, 0.2],
    [0.49, 0.43, 0.27],
    [0.54, 0.58, 0.31],
  ]);

  b.sweep(twigPath, [0.047, 0.018], {
    color: BRANCH_LIGHT,
    sides: 6,
    caps: { start: "round", end: "point" },
    name: "upturnedTwig",
    group: "branch",
  });

  const branchEnd = branch.at(0.88, 0);
  b.part(
    new THREE.CylinderGeometry(0.061, 0.061, 0.014, 7),
    BRANCH_DARK,
    {
      at: branchEnd.at,
      dir: branchEnd.tangent,
      axis: "y",
      bone: branch.bone,
      flat: true,
      name: "branchCut",
      group: "branch",
    },
  );

  // A few graphic green leaves at the twig tips, kept sparse.

  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.11, 0.055, "sharp"],
    [0.17, 0.14, "sharp"],
    [0.05, 0.115, "sharp"],
    [-0.04, 0.05, "sharp"],
  ];

  for (const s of [-1, 1]) {
    b.extrude(leafOutline, {
      at: [0.54 + s * 0.015, 0.56, 0.31],
      x: [s * 0.9, 0, 0.15],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: GREEN,
      bone: hips,
      name: `leaf${s > 0 ? "L" : "R"}`,
      group: "branch",
    });
  }

  // ---------------------------------------------------------------------------
  // Body: red faceted barrel with a cream geometric belly panel.

  const body = b.sweep(spine, (t) => {
    if (t < 0.22) return 0.135;
    if (t < 0.72) return 0.19;
    return 0.145;
  }, {
    color: RED,
    sides: 8,
    section: "circle",
    skin: "smooth",
    caps: "round",
    name: "redBody",
    group: "body",
  });

  const belly = b.sweep(
    catmull([
      [0, 0.67, 0.03],
      [0, 0.7, 0.16],
      [0, 0.78, 0.27],
    ]),
    [0.11, 0.105],
    {
      color: CREAM,
      sides: 6,
      caps: "round",
      bone: spine,
      name: "creamBelly",
      group: "body",
    },
  );

  // A bold blue breast band, like a painted geometric stripe.

  b.sweep(
    catmull([
      [0, 0.81, 0.22],
      [0, 0.84, 0.27],
      [0, 0.88, 0.3],
    ]),
    0.158,
    {
      color: BLUE,
      sides: 8,
      caps: "flat",
      bone: spine,
      name: "blueBreastBand",
      group: "body",
    },
  );

  // Small red-orange shoulder blocks add the characteristic Bauhaus colour rhythm.

  for (const s of [-1, 1]) {
    cube(
      [0.12, 0.14, 0.15],
      RED_DARK,
      [s * 0.14, 0.84, 0.19],
      spine.joints[2],
      { rotation: [0, s * 12, s * 8], name: `shoulderBlock${s}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Head, face discs, eyes and beak.

  lowSphere(0.18, RED, [0, 1.02, 0.4], head, [1.02, 0.98, 1.08]);

  // A square-ish cream cheek mask made from two overlapping discs.

  for (const s of [-1, 1]) {
    disc(0.105, CREAM, [s * 0.092, 1.01, 0.548], head, [0, 0, 1]);
    lowSphere(0.058, WHITE, [s * 0.093, 1.025, 0.568], head, [1, 1.05, 0.35]);
    lowSphere(0.030, BLACK, [s * 0.094, 1.026, 0.59], head, [1, 1.05, 0.32]);
    lowSphere(0.010, WHITE, [s * 0.105, 1.044, 0.602], head, [1, 1, 0.35]);

    // Strong rectangular brow, set above each eye.
    cube(
      [0.105, 0.024, 0.022],
      BLACK,
      [s * 0.095, 1.115, 0.552],
      head,
      { rotation: [0, 0, s * 9], name: `brow${s > 0 ? "L" : "R"}` },
    );
  }

  // Yellow two-part beak, upper and lower jaws separate for readability.

  part(
    new THREE.ConeGeometry(0.095, 0.22, 4),
    YELLOW,
    [0, 1.01, 0.635],
    jaw,
    { dir: [0, 0, 1], axis: "y", rotation: [0, 0, 0], name: "upperBeak" },
  );

  part(
    new THREE.ConeGeometry(0.06, 0.13, 4),
    YELLOW_DARK,
    [0, 0.965, 0.65],
    jaw,
    { dir: [0, 0, 1], axis: "y", name: "lowerBeak" },
  );

  // A black mouth seam under the beak.
  rod([0, 0.985, 0.685], [0, 0.985, 0.735], 0.008, BLACK, jaw);

  // Red angular crown crest.
  const crestOutline: [number, number, "sharp"][] = [
    [-0.13, 0, "sharp"],
    [-0.1, 0.09, "sharp"],
    [-0.035, 0.19, "sharp"],
    [0.02, 0.12, "sharp"],
    [0.075, 0.2, "sharp"],
    [0.12, 0.06, "sharp"],
    [0.13, 0, "sharp"],
  ];

  b.extrude(crestOutline, {
    at: [0, 1.12, 0.38],
    x: [1, 0, 0],
    y: [0, 0.35, 0.94],
    thickness: 0.035,
    bevel: 0.005,
    color: RED_DARK,
    bone: head,
    name: "crownCrest",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // Wings: large blue graphic slabs, each carrying a yellow roundel and red bar.

  const wingOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.16, 0.04, "sharp"],
    [0.29, 0.13, "sharp"],
    [0.35, 0.29, "sharp"],
    [0.3, 0.47, "sharp"],
    [0.18, 0.4, "sharp"],
    [0.06, 0.23, "sharp"],
    [-0.015, 0.08, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [s * 0.155, 0.83, 0.13],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: BLUE,
      bone: s > 0 ? wingL : wingR,
      name: `blueWing${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    disc(0.09, YELLOW, [s * 0.28, 1.025, 0.13], s > 0 ? wingL : wingR, [0, 0, 1]);

    cube(
      [0.055, 0.26, 0.026],
      RED,
      [s * 0.31, 0.84, 0.135],
      s > 0 ? wingL : wingR,
      { rotation: [0, 0, s * -18], name: `wingStripe${s > 0 ? "L" : "R"}` },
    );

    // A small yellow wing-tip triangle.
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.11, 0.025, "sharp"],
        [0.02, 0.14, "sharp"],
      ],
      {
        at: [s * 0.37, 0.88, 0.13],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.022,
        color: YELLOW,
        bone: s > 0 ? wingL : wingR,
        name: `wingTip${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Tail fan: three separate primary-colour feathers, visibly extended.

  const featherOutline: [number, number, "sharp"][] = [
    [-0.06, 0, "sharp"],
    [0.055, 0, "sharp"],
    [0.12, 0.35, "sharp"],
    [0.025, 0.62, "sharp"],
    [-0.08, 0.37, "sharp"],
  ];

  b.extrude(featherOutline, {
    at: [0.09, 0.68, -0.15],
    x: [0.28, 0, -0.96],
    y: [0, 1, 0],
    thickness: [0.03, 0.012],
    bevel: 0.004,
    color: BLUE,
    bone: tailL,
    name: "tailFeatherL",
    group: "tail",
  });

  b.extrude(featherOutline, {
    at: [0, 0.68, -0.17],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: [0.032, 0.01],
    bevel: 0.004,
    color: YELLOW,
    bone: tailC,
    name: "tailFeatherC",
    group: "tail",
  });

  b.extrude(featherOutline, {
    at: [-0.09, 0.68, -0.15],
    x: [-0.28, 0, -0.96],
    y: [0, 1, 0],
    thickness: [0.03, 0.012],
    bevel: 0.004,
    color: RED_DARK,
    bone: tailR,
    name: "tailFeatherR",
    group: "tail",
  });

  // Tail feather graphic bars.
  for (const s of [-1, 1]) {
    cube(
      [0.025, 0.34, 0.018],
      WHITE,
      [s * 0.045, 0.86, -0.36],
      s > 0 ? tailL : tailR,
      { rotation: [s * 18, 0, 0], name: `tailMark${s > 0 ? "L" : "R"}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs and feet: warm yellow cylinders with three graphic toes on each side.

  b.sweep(legL, [0.031, 0.023], {
    color: YELLOW_DARK,
    sides: 6,
    caps: "round",
    skin: "rigid",
    name: "legLTube",
    group: "legs",
  });

  b.sweep(legR, [0.031, 0.023], {
    color: YELLOW_DARK,
    sides: 6,
    caps: "round",
    skin: "rigid",
    name: "legRTube",
    group: "legs",
  });

  lowSphere(0.035, YELLOW, legL.tip.at, legL.tip.bone, [1.2, 0.65, 1.15]);
  lowSphere(0.035, YELLOW, legR.tip.at, legR.tip.bone, [1.2, 0.65, 1.15]);

  toe(0.14, 0.035, 0.075, 0.055, legL.tip);
  toe(0.14, 0.035, 0.025, 0.105, legL.tip);
  toe(0.14, 0.035, -0.055, 0.06, legL.tip);

  toe(-0.14, 0.035, -0.075, 0.055, legR.tip);
  toe(-0.14, 0.035, -0.025, 0.105, legR.tip);
  toe(-0.14, 0.035, 0.055, 0.06, legR.tip);

  // Small dark branch shadows directly beneath the feet make the contact read.
  for (const s of [-1, 1]) {
    disc(
      0.055,
      BRANCH_DARK,
      [s * 0.14, 0.184, 0.035],
      hips,
      [0, 1, 0],
    );
  }

  // A tiny red geometric badge on the visible breast.
  disc(0.045, RED_DARK, [0, 0.855, 0.405], spine.tip, [0, 0, 1]);
  cube([0.012, 0.06, 0.012], YELLOW, [0, 0.855, 0.42], spine.tip, {
    name: "breastBadge",
  });

  // Keep deterministic authoring intent explicit for any future scatter details.
  rng(17);

  return b.root;
}
