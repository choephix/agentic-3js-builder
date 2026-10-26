```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  limb,
  polyline,
} from "agentic-3js-builder";

export const meta = {
  name: "bauhaus-songbird",
  description:
    "A low-poly songbird in bold Bauhaus primary colours, perched on a geometric branch with graphic wings, crest, tail feathers, expressive eyes, and orange gripping toes.",
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const BLUE = "#1559a6";
  const DEEP_BLUE = "#0c3976";
  const RED = "#d52b2f";
  const DARK_RED = "#971d27";
  const YELLOW = "#f2c230";
  const GOLD = "#e69d20";
  const ORANGE = "#e87525";
  const WHITE = "#fff4d2";
  const BLACK = "#171b29";
  const BROWN = "#70452d";
  const LIGHT_BROWN = "#a96b3c";
  const PALE_BROWN = "#c58b55";

  const sphere = (
    name: string,
    at: THREE.Vector3 | [number, number, number],
    color: string,
    scale: [number, number, number],
    bone?: any,
    segments = 10,
    rings = 7,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, rings), color, {
      name,
      at,
      bone,
      scale,
      flat: true,
    });

  const box = (
    name: string,
    at: THREE.Vector3 | [number, number, number],
    color: string,
    size: [number, number, number],
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone,
      rotation,
      flat: true,
    });

  const disc = (
    name: string,
    at: THREE.Vector3 | [number, number, number],
    color: string,
    radius: number,
    depth: number,
    dir: [number, number, number],
    bone?: any,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 10), color, {
      name,
      at,
      dir,
      bone,
      flat: true,
    });

  const plate = (
    name: string,
    outline: [number, number][],
    at: THREE.Vector3 | [number, number, number],
    color: string,
    x: [number, number, number],
    y: [number, number, number],
    thickness: number,
    bone?: any,
  ) =>
    b.extrude(outline, {
      name,
      at,
      color,
      x,
      y,
      thickness,
      bevel: thickness * 0.2,
      bone,
      smoothing: 0,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted bird rig, with named chains for the spine, neck, jaw, wings, tail, legs, and toes.

  const hips = b.joint("hips", {
    at: [0, 1.12, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, 0],
      [0, 1.27, 0.015],
      [0, 1.47, 0.08],
      [0, 1.65, 0.16],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "spineTip"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      spine.tip.at,
      [0, 1.72, 0.19],
      [0, 1.78, 0.25],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip", "neckEnd"],
      role: "neck",
      count: 3,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: neck.tip.at,
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.715, 0.445],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.19, 1.50, 0.025],
      [0.36, 1.46, 0.07],
      [0.55, 1.36, 0.12],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wingTipL"],
      role: "wing",
      count: 3,
    },
  );

  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.19, 1.50, 0.025],
      [-0.36, 1.46, 0.07],
      [-0.55, 1.36, 0.12],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wingTipR"],
      role: "wing",
      count: 3,
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.16, -0.16],
      [0, 1.08, -0.34],
      [0, 1.10, -0.58],
      [0, 1.17, -0.78],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
      count: 4,
    },
  );

  const makeLeg = (side: number, label: string) => {
    const root: [number, number, number] = [
      side * 0.135,
      1.11,
      0.015,
    ];
    const contact: [number, number, number] = [
      side * 0.135,
      0.965,
      0.02,
    ];
    const points = limb(
      root,
      contact,
      [0.105, 0.12],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    return b.chain(`leg${label}`, points, {
      parent: hips,
      names: [`hip${label}`, `ankle${label}`, `foot${label}`],
      role: "leg",
      contact,
    });
  };

  const legL = makeLeg(1, "L");
  const legR = makeLeg(-1, "R");

  const makeToe = (
    side: number,
    label: string,
    root: [number, number, number],
    tip: [number, number, number],
  ) =>
    b.chain(
      `toe${label}`,
      catmull([root, tip]),
      {
        parent: side > 0 ? legL.tip : legR.tip,
        names: [`toe${label}`, `toe${label}Tip`],
        role: "digit",
        count: 2,
      },
    );

  const toeLL = makeToe(1, "LL", [0.135, 0.965, 0.02], [0.135, 0.925, 0.235]);
  const toeLM = makeToe(1, "LM", [0.135, 0.965, 0.02], [0.205, 0.925, 0.18]);
  const toeLB = makeToe(1, "LB", [0.135, 0.965, 0.02], [0.135, 0.925, -0.13]);

  const toeRL = makeToe(-1, "RL", [-0.135, 0.965, 0.02], [-0.135, 0.925, 0.235]);
  const toeRM = makeToe(-1, "RM", [-0.135, 0.965, 0.02], [-0.205, 0.925, 0.18]);
  const toeRB = makeToe(-1, "RB", [-0.135, 0.965, 0.02], [-0.135, 0.925, -0.13]);

  // ---------------------------------------------------------------------------------------------------------------
  // Main body and neck. The large blue body is a deliberately faceted, slightly pear-shaped tube.

  const body = b.sweep(
    spine,
    (t) => [
      0.205 + 0.045 * Math.sin(Math.PI * t),
      0.255 + 0.035 * Math.sin(Math.PI * t),
    ],
    {
      name: "blue_body",
      color: BLUE,
      sides: 8,
      caps: "round",
      flat: true,
      section: "circle",
    },
  );

  const neckTube = b.sweep(neck, [0.145, 0.105], {
    name: "yellow_neck",
    color: YELLOW,
    sides: 8,
    caps: "round",
    flat: true,
  });

  // A strong red collar block separates the head from the yellow neck.
  disc("red_collar", [0, 1.665, 0.18], RED, 0.145, 0.035, [0, 1, 0], neck.joints[0]);

  // Large graphic yellow breast, sunk into the blue body rather than floating in front of it.
  sphere(
    "yellow_breast",
    [0, 1.36, 0.205],
    YELLOW,
    [0.18, 0.255, 0.125],
    spine.joints[1],
    10,
    7,
  );

  // A second smaller gold geometric bib gives the front a clear primary-colour rhythm.
  sphere(
    "gold_bib",
    [0, 1.485, 0.305],
    GOLD,
    [0.115, 0.145, 0.045],
    spine.joints[2],
    8,
    5,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Face first: the head, eyes, pupils, cheek discs, beak, and split jaw.

  const skull = sphere(
    "red_head",
    head.at,
    RED,
    [0.245, 0.225, 0.235],
    head,
    12,
    8,
  );

  const skullSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(side * 31, 5);
    if (eyeHit) {
      b.stick(
        new THREE.SphereGeometry(0.066, 10, 6),
        WHITE,
        eyeHit,
        {
          name: side > 0 ? "eyeL_white" : "eyeR_white",
          embed: 0.42,
          flat: true,
        },
      );

      const pupilFrame = eyeHit.moved([0, 0.047, 0]);
      b.stick(
        new THREE.SphereGeometry(0.036, 8, 5),
        BLACK,
        pupilFrame,
        {
          name: side > 0 ? "eyeL_pupil" : "eyeR_pupil",
          embed: 0.28,
          flat: true,
        },
      );

      const highlightFrame = eyeHit.moved([0, 0.076, 0]);
      b.stick(
        new THREE.SphereGeometry(0.010, 6, 4),
        WHITE,
        highlightFrame,
        {
          name: side > 0 ? "eyeL_glint" : "eyeR_glint",
          embed: 0.25,
          flat: true,
        },
      );
    }

    // Yellow cheek buttons emphasize the circular Bauhaus face.
    sphere(
      side > 0 ? "cheekL" : "cheekR",
      [side * 0.155, 1.715, 0.405],
      YELLOW,
      [0.058, 0.06, 0.025],
      head,
      8,
      5,
    );
  }

  // Two simple upper/lower beak solids leave a readable dark mouth gap.
  b.part(new THREE.ConeGeometry(0.105, 0.22, 4), YELLOW, {
    name: "upper_beak",
    at: [0, 1.795, 0.435],
    dir: [0, 0.035, 1],
    bone: head,
    flat: true,
  });

  b.part(new THREE.ConeGeometry(0.082, 0.17, 4), ORANGE, {
    name: "lower_beak",
    at: jaw.at,
    dir: [0, -0.2, 1],
    bone: jaw,
    flat: true,
  });

  b.rod([ -0.072, 1.765, 0.535 ], [0.072, 1.765, 0.535], 0.008, {
    name: "mouth_line",
    color: BLACK,
    bone: head,
    section: { ngon: 6 },
    caps: "flat",
  });

  // A small dark throat triangle makes the open lower jaw read from a distance.
  plate(
    "throat_shadow",
    [
      [-0.055, 0],
      [0.055, 0],
      [0, -0.055],
    ],
    [0, 1.745, 0.425],
    BLACK,
    [1, 0, 0],
    [0, 1, 0],
    0.012,
    jaw,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Crest: three overlapping primary-colour triangular blades, broad enough to read as a silhouette.

  plate(
    "crest_blue",
    [
      [-0.13, 0],
      [-0.045, 0.17],
      [0.03, 0.05],
      [0.10, 0.20],
      [0.17, 0],
    ],
    [0, 1.94, 0.22],
    BLUE,
    [1, 0, 0],
    [0, 1, 0],
    0.038,
    head,
  );

  plate(
    "crest_red_left",
    [
      [-0.14, 0],
      [-0.10, 0.13],
      [-0.035, 0.04],
      [-0.02, 0],
    ],
    [0, 1.955, 0.245],
    DARK_RED,
    [1, 0, 0],
    [0, 1, 0],
    0.045,
    head,
  );

  plate(
    "crest_gold_right",
    [
      [0.025, 0],
      [0.085, 0.145],
      [0.15, 0],
    ],
    [0, 1.96, 0.255],
    GOLD,
    [1, 0, 0],
    [0, 1, 0],
    0.05,
    head,
  );

  // A small blue forehead square gives the red head a constructed, poster-like face.
  box(
    "forehead_block",
    [0, 1.91, 0.275],
    DEEP_BLUE,
    [0.095, 0.055, 0.028],
    head,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wings: chains and membranes establish extended, separated wings; red bars add graphic decoration.

  const lowerWingL = polyline([
    [0.205, 1.425, 0.055],
    [0.38, 1.34, 0.08],
    [0.56, 1.24, 0.115],
  ]);

  const lowerWingR = polyline([
    [-0.205, 1.425, 0.055],
    [-0.38, 1.34, 0.08],
    [-0.56, 1.24, 0.115],
  ]);

  b.sweep(wingL, [0.075, 0.045], {
    name: "wingL_leading_edge",
    color: DEEP_BLUE,
    sides: 6,
    section: "circle",
    caps: "round",
    flat: true,
  });

  b.sweep(wingR, [0.075, 0.045], {
    name: "wingR_leading_edge",
    color: DEEP_BLUE,
    sides: 6,
    section: "circle",
    caps: "round",
    flat: true,
  });

  b.membrane(wingL, lowerWingL, {
    name: "wingL_blue_plane",
    color: BLUE,
    thickness: 0.018,
    rows: 3,
    cols: 5,
    scallop: 0.06,
  });

  b.membrane(wingR, lowerWingR, {
    name: "wingR_blue_plane",
    color: BLUE,
    thickness: 0.018,
    rows: 3,
    cols: 5,
    scallop: 0.06,
  });

  for (const side of [1, -1]) {
    plate(
      side > 0 ? "wingL_red_bar" : "wingR_red_bar",
      [
        [0, 0],
        [0.09, 0],
        [0.125, -0.20],
        [0.035, -0.18],
      ],
      [side * 0.30, 1.48, 0.13],
      RED,
      [side, 0, 0],
      [0, 1, 0],
      0.025,
      side > 0 ? wingL.joints[0] : wingR.joints[0],
    );

    plate(
      side > 0 ? "wingL_gold_tip" : "wingR_gold_tip",
      [
        [0, 0],
        [0.10, 0],
        [0.14, -0.10],
        [0.045, -0.075],
      ],
      [side * 0.425, 1.34, 0.14],
      YELLOW,
      [side, 0, 0],
      [0, 1, 0],
      0.021,
      side > 0 ? wingL.joints[1] : wingR.joints[1],
    );

    // A round shoulder boss makes the wing roots feel mechanically assembled.
    sphere(
      side > 0 ? "shoulderL_gold" : "shoulderR_gold",
      [side * 0.205, 1.505, 0.11],
      GOLD,
      [0.075, 0.075, 0.038],
      side > 0 ? wingL.joints[0] : wingR.joints[0],
      8,
      5,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tail: a tapered blue chain plus three broad, overlapping geometric feathers.

  b.sweep(
    tail,
    (t) => [0.105 - 0.065 * t, 0.11 - 0.07 * t],
    {
      name: "tail_blue_core",
      color: BLUE,
      bands: [
        [0.58, YELLOW],
        [0.82, RED],
        [1, RED],
      ],
      sides: 7,
      caps: "point",
      flat: true,
    },
  );

  plate(
    "tail_center_feather",
    [
      [-0.105, 0],
      [0.105, 0],
      [0.13, 0.38],
      [0.055, 0.73],
      [0, 0.84],
      [-0.055, 0.73],
      [-0.13, 0.38],
    ],
    [0, 1.145, -0.17],
    DEEP_BLUE,
    [1, 0, 0],
    [0, 0, -1],
    0.032,
    tail.joints[0],
  );

  plate(
    "tail_center_gold_tip",
    [
      [-0.055, 0],
      [0.055, 0],
      [0.065, 0.22],
      [0, 0.34],
      [-0.065, 0.22],
    ],
    [0, 1.145, -0.70],
    GOLD,
    [1, 0, 0],
    [0, 0, -1],
    0.039,
    tail.joints[2],
  );

  plate(
    "tail_left_feather",
    [
      [-0.025, 0],
      [0.13, 0.015],
      [0.22, 0.36],
      [0.17, 0.62],
      [0.045, 0.52],
    ],
    [0.015, 1.15, -0.18],
    RED,
    [1, 0, 0],
    [0, 0, -1],
    0.035,
    tail.joints[0],
  );

  plate(
    "tail_right_feather",
    [
      [-0.13, 0.015],
      [0.025, 0],
      [-0.045, 0.52],
      [-0.17, 0.62],
      [-0.22, 0.36],
    ],
    [-0.015, 1.15, -0.18],
    RED,
    [1, 0, 0],
    [0, 0, -1],
    0.035,
    tail.joints[0],
  );

  // Tail feather ribs are narrow yellow slabs, echoing Bauhaus poster stripes.
  plate(
    "tail_left_rib",
    [
      [-0.018, 0],
      [0.018, 0],
      [0.055, 0.43],
      [0.025, 0.52],
    ],
    [0.08, 1.15, -0.25],
    YELLOW,
    [1, 0, 0],
    [0, 0, -1],
    0.042,
    tail.joints[1],
  );

  plate(
    "tail_right_rib",
    [
      [-0.018, 0],
      [0.018, 0],
      [-0.025, 0.52],
      [-0.055, 0.43],
    ],
    [-0.08, 1.15, -0.25],
    YELLOW,
    [1, 0, 0],
    [0, 0, -1],
    0.042,
    tail.joints[1],
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and toes. Orange blocky legs emerge from the yellow lower body and grip the perch.

  b.sweep(legL, [0.038, 0.032], {
    name: "legL_orange",
    color: ORANGE,
    sides: 6,
    section: "circle",
    caps: "round",
    flat: true,
  });

  b.sweep(legR, [0.038, 0.032], {
    name: "legR_orange",
    color: ORANGE,
    sides: 6,
    section: "circle",
    caps: "round",
    flat: true,
  });

  const toes = [
    [toeLL, "toeLL"],
    [toeLM, "toeLM"],
    [toeLB, "toeLB"],
    [toeRL, "toeRL"],
    [toeRM, "toeRM"],
    [toeRB, "toeRB"],
  ] as const;

  for (const [toe, label] of toes) {
    b.sweep(toe, [0.020, 0.010], {
      name: `${label}_orange`,
      color: ORANGE,
      sides: 6,
      caps: "round",
      flat: true,
    });

    sphere(
      `${label}_claw`,
      toe.tip.at,
      BLACK,
      [0.022, 0.012, 0.022],
      toe.tip,
      6,
      4,
    );
  }

  // Yellow ankle bands make the tiny feet legible against the dark branch.
  disc("ankleL_band", legL.joints[1].at, YELLOW, 0.041, 0.022, [0, 1, 0], legL.joints[1]);
  disc("ankleR_band", legR.joints[1].at, YELLOW, 0.041, 0.022, [0, 1, 0], legR.joints[1]);

  // ---------------------------------------------------------------------------------------------------------------
  // Branch: a simple geometric support with a vertical stem, horizontal perch, fork, and primary end cap.

  const stemPath = polyline([
    [0, 0.075, -0.13],
    [0.015, 0.38, -0.12],
    [-0.012, 0.72, -0.10],
    [0, 0.86, -0.06],
  ]);

  const perchPath = polyline([
    [0, 0.875, -0.62],
    [0.012, 0.885, -0.28],
    [0, 0.89, 0.08],
    [-0.01, 0.89, 0.62],
  ]);

  b.sweep(stemPath, 0.075, {
    name: "branch_vertical_stem",
    color: BROWN,
    bone: hips,
    sides: 7,
    caps: "flat",
    flat: true,
  });

  b.sweep(perchPath, 0.072, {
    name: "branch_main_perch",
    color: BROWN,
    bone: hips,
    sides: 7,
    caps: "flat",
    flat: true,
    bands: [
      [0.18, LIGHT_BROWN],
      [0.22, BROWN],
      [0.64, LIGHT_BROWN],
      [0.70, BROWN],
    ],
  });

  b.rod([0, 0.84, -0.28], [0.23, 1.04, -0.60], 0.043, {
    name: "branch_left_fork",
    color: BROWN,
    bone: hips,
    section: { ngon: 6 },
    caps: "round",
  });

  b.rod([0, 0.84, -0.28], [-0.19, 1.00, -0.57], 0.040, {
    name: "branch_right_fork",
    color: LIGHT_BROWN,
    bone: hips,
    section: { ngon: 6 },
    caps: "round",
  });

  // Angular branch knots, kept as large readable forms rather than naturalistic noise.
  sphere("branch_knot_stem", [0, 0.40, -0.12], PALE_BROWN, [0.095, 0.11, 0.085], hips, 7, 5);
  sphere("branch_knot_left", [0.125, 0.965, -0.48], PALE_BROWN, [0.06, 0.06, 0.06], hips, 7, 5);
  sphere("branch_knot_right", [-0.10, 0.94, -0.45], DARK_RED, [0.052, 0.052, 0.052], hips, 7, 5);

  // A bright yellow cut face caps the forward end of the perch.
  disc("branch_yellow_cut", [0, 0.89, 0.625], YELLOW, 0.066, 0.018, [0, 0, 1], hips);

  // A small blue geometric mark at the base gives the otherwise brown prop the same visual language as the bird.
  plate(
    "branch_blue_mark",
    [
      [-0.07, 0],
      [0.07, 0],
      [0.045, 0.11],
      [-0.045, 0.11],
    ],
    [0, 0.37, -0.193],
    BLUE,
    [1, 0, 0],
    [0, 1, 0],
    0.012,
    hips,
  );

  // Two tiny yellow shoulder rivets and two red tail-root rivets complete the constructed puppet feel.
  sphere("body_rivet_L", [0.205, 1.485, 0.17], YELLOW, [0.025, 0.025, 0.014], spine.joints[2], 6, 4);
  sphere("body_rivet_R", [-0.205, 1.485, 0.17], YELLOW, [0.025, 0.025, 0.014], spine.joints[2], 6, 4);
  sphere("tail_rivet_L", [0.085, 1.17, -0.20], RED, [0.025, 0.025, 0.018], tail.joints[0], 6, 4);
  sphere("tail_rivet_R", [-0.085, 1.17, -0.20], RED, [0.025, 0.025, 0.018], tail.joints[0], 6, 4);

  return b.root;
}
```