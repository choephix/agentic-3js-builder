import * as THREE from "three";
import {
  createBuilder,
  catmull,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description: "A stylized primary-colour songbird with geometric wings, a graphic face, sturdy feet, and a low-poly branch.",
};

const BLUE = "#1769aa";
const BLUE_DARK = "#0d3b66";
const RED = "#e53935";
const RED_DARK = "#9e1b32";
const YELLOW = "#f6c843";
const YELLOW_DARK = "#c88719";
const CREAM = "#fff1c1";
const BLACK = "#17151c";
const WHITE = "#fffdf2";
const BRANCH = "#5a3828";
const BRANCH_LIGHT = "#8b5a36";
const LEAF = "#2f8f62";

const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128">
    <ellipse cx="48" cy="66" rx="38" ry="50" fill="#17151c"/>
    <ellipse cx="48" cy="68" rx="30" ry="42" fill="#fffdf2"/>
    <ellipse cx="48" cy="70" rx="19" ry="29" fill="#e53935"/>
    <ellipse cx="48" cy="76" rx="10" ry="21" fill="#17151c"/>
    <ellipse cx="41" cy="55" rx="8" ry="11" fill="#ffffff"/>
    <circle cx="59" cy="91" r="4" fill="#ffffff"/>
    <path d="M15 24 Q45 4 81 24" fill="none" stroke="#17151c" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const WING_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="#f6c843" stroke="#17151c" stroke-width="7"/>
    <circle cx="50" cy="50" r="22" fill="#e53935"/>
    <path d="M50 9 V91 M9 50 H91" stroke="#17151c" stroke-width="5"/>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: string,
  at: [number, number, number],
  scale?: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    scale,
    bone,
    flat: true,
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: one central spine, head, wings, legs, toes, and tail joints.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.02],
    dir: [0, 0, 1],
    role: "spine",
    group: "bird",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.02],
      [0, 0.96, 0.08],
      [0, 1.07, 0.23],
    ]),
    {
      parent: hips,
      names: ["spine", "chest", "neckBase"],
      role: "spine",
      group: "bird",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip ?? undefined,
    at: [0, 1.13, 0.29],
    dir: [0, 0.04, 1],
    role: "head",
    group: "bird",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.08, 0.38],
    dir: [0, -0.1, 1],
    role: "jaw",
    group: "face",
  });

  const wingChains: any[] = [];
  for (const side of [1, -1]) {
    const wing = b.chain(
      `wing${side > 0 ? "L" : "R"}`,
      catmull([
        [side * 0.115, 1.04, 0.08],
        [side * 0.22, 1.02, 0.02],
        [side * 0.36, 0.93, 0.00],
        [side * 0.43, 0.78, 0.07],
      ]),
      {
        parent: spine.joints[1],
        names: [
          `shoulder${side > 0 ? "L" : "R"}`,
          `elbow${side > 0 ? "L" : "R"}`,
          `wingTip${side > 0 ? "L" : "R"}`,
        ],
        role: "wing",
        group: "wings",
      },
    );
    wingChains.push(wing);
  }

  const legChains: any[] = [];
  for (const side of [1, -1]) {
    const leg = b.chain(
      `leg${side > 0 ? "L" : "R"}`,
      [
        [side * 0.075, 0.86, 0.01],
        [side * 0.09, 0.70, 0.035],
        [side * 0.10, 0.57, 0.06],
      ],
      {
        parent: hips,
        names: [
          `hip${side > 0 ? "L" : "R"}`,
          `knee${side > 0 ? "L" : "R"}`,
          `ankle${side > 0 ? "L" : "R"}`,
        ],
        role: "leg",
        contact: [side * 0.10, 0.52, 0.06],
        group: "feet",
      },
    );
    legChains.push(leg);

    for (let toe = 0; toe < 3; toe++) {
      const z = 0.045 + (toe - 1) * 0.045;
      b.chain(
        `toe${side > 0 ? "L" : "R"}${toe + 1}`,
        [
          [side * 0.10, 0.57, z],
          [side * (0.13 + toe * 0.012), 0.54, z + 0.025],
          [side * (0.17 + toe * 0.014), 0.535, z + 0.035],
        ],
        {
          parent: leg.tip ?? undefined,
          names: [
            `toe${side > 0 ? "L" : "R"}${toe + 1}Base`,
            `toe${side > 0 ? "L" : "R"}${toe + 1}Tip`,
          ],
          role: "digit",
          group: "feet",
        },
      );
    }
  }

  const tail = b.chain(
    "tail",
    [
      [0, 0.94, -0.10],
      [0, 0.94, -0.27],
      [0, 0.91, -0.43],
    ],
    {
      parent: hips,
      names: ["tailBase", "tailMid", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  // ---------------------------------------------------------------------------
  // Main body: faceted blue oval, yellow belly, and a strong Bauhaus silhouette.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.19 - t * 0.045, {
    color: BLUE,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "blue_body",
  });

  // Graphic yellow belly plate, slightly proud of the front-facing body.
  b.slab(
    [
      [-0.13, 0.78, 0.145],
      [0.13, 0.78, 0.145],
      [0.14, 1.00, 0.265],
      [0.10, 1.18, 0.25],
      [-0.10, 1.18, 0.25],
      [-0.14, 1.00, 0.265],
    ],
    {
      color: YELLOW,
      thickness: 0.018,
      bone: spine.joints[1],
      group: "body",
      name: "yellow_belly",
    },
  );

  // A dark blue geometric back saddle.
  b.extrude(
    [
      [-0.17, 0],
      [0.17, 0],
      [0.14, 0.18],
      [0, 0.27],
      [-0.14, 0.18],
    ],
    {
      at: [0, 0.91, -0.13],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      bevel: 0.008,
      color: BLUE_DARK,
      bone: spine.joints[0],
      group: "body",
      name: "back_saddle",
    },
  );

  // ---------------------------------------------------------------------------
  // Head and face: a large yellow cube-like sphere, red cheek disks, and eyes.
  // ---------------------------------------------------------------------------

  const skull = sphere(
    b,
    1,
    YELLOW,
    [0, 1.18, 0.31],
    [0.17, 0.16, 0.16],
    head,
    "round_head",
  );

  // Red circular cheek plates emphasize the graphic front.
  for (const side of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 10), RED, {
      at: [side * 0.105, 1.11, 0.405],
      dir: [0, 0, 1],
      bone: head,
      flat: true,
      name: side > 0 ? "cheek_L" : "cheek_R",
    });
  }

  // Two oversized eyes, conformed to the head surface.
  for (const side of [1, -1]) {
    b.decal(skull, EYE, {
      at: [side * 0.078, 1.205, 0.455],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.075, 0.105],
      mirror: side > 0,
      lift: 0.004,
      segments: 6,
      bone: head,
      name: side > 0 ? "eye_L" : "eye_R",
      group: "face",
    });
  }

  // Separate upper and lower jaw, slightly open for a readable bird expression.
  b.part(
    new THREE.BoxGeometry(0.12, 0.045, 0.10),
    CREAM,
    {
      at: [0, 1.095, 0.445],
      dir: [0, -0.05, 1],
      bone: jaw,
      flat: true,
      name: "lower_jaw",
    },
  );

  const beak = b.part(
    new THREE.ConeGeometry(0.072, 0.19, 5),
    RED,
    {
      at: [0, 1.155, 0.485],
      dir: [0, 0.02, 1],
      bone: head,
      flat: true,
      name: "red_beak",
    },
  );

  // A black beak seam and a small yellow lower bill.
  b.rod([0, 1.14, 0.405], [0, 1.14, 0.555], 0.008, {
    color: BLACK,
    bone: head,
    name: "beak_seam",
  });
  b.part(new THREE.ConeGeometry(0.045, 0.11, 5), YELLOW_DARK, {
    at: [0, 1.10, 0.47],
    dir: [0, -0.08, 1],
    bone: jaw,
    flat: true,
    name: "lower_bill",
  });

  // Small square crown mark.
  box(b, [0.075, 0.035, 0.045], RED, [0, 1.335, 0.29], head, "crown_block");

  // ---------------------------------------------------------------------------
  // Wings: broad red slabs, blue feather ribs, and yellow circular emblems.
  // ---------------------------------------------------------------------------

  for (let wi = 0; wi < wingChains.length; wi++) {
    const side = wi === 0 ? 1 : -1;
    const wing = wingChains[wi];

    b.extrude(
      [
        [0.00, 0.00],
        [0.13, 0.02],
        [0.25, 0.12],
        [0.29, 0.28],
        [0.22, 0.43],
        [0.08, 0.49],
        [-0.01, 0.30],
      ],
      {
        at: [side * 0.17, 1.035, 0.065],
        x: [0, 0, side],
        y: [0, 1, 0],
        thickness: [0.035, 0.018],
        bevel: 0.008,
        smoothing: 0,
        color: RED,
        bone: wing.joints[0],
        group: "wings",
        name: side > 0 ? "wing_L_red" : "wing_R_red",
      },
    );

    // Three bold blue feather ribs.
    for (let i = 0; i < 3; i++) {
      const y0 = 1.10 + i * 0.075;
      b.rod(
        [side * 0.19, y0, 0.075],
        [side * (0.36 - i * 0.02), y0 - 0.12, 0.075],
        0.012,
        {
          color: BLUE_DARK,
          bone: wing.joints[0],
          name: `wing${side > 0 ? "L" : "R"}_rib_${i}`,
        },
      );
    }

    // Primary-colour emblem on the broad face.
    b.decal(b.root, WING_MARK, {
      at: [side * 0.30, 0.96, 0.088],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.13, 0.13],
      mirror: side > 0,
      lift: 0.006,
      segments: 4,
      bone: wing.joints[1],
      name: side > 0 ? "wing_L_emblem" : "wing_R_emblem",
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------
  // Tail fan: three crisp blue feathers with red tips.
  // ---------------------------------------------------------------------------

  for (const side of [1, 0, -1]) {
    const x = side * 0.065;
    const tailPart = b.extrude(
      [
        [0, 0],
        [0.075, 0.02],
        [0.12, 0.14],
        [0.08, 0.34],
        [0.025, 0.43],
        [-0.025, 0.28],
      ],
      {
        at: [x, 0.91, -0.19],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.006,
        color: BLUE,
        bone: tail.joints[1],
        group: "tail",
        name: `tail_feather_${side}`,
      },
    );

    // A small red terminal stripe on each feather.
    b.part(new THREE.BoxGeometry(0.055, 0.09, 0.012), RED, {
      at: tailPart.local([0.045, 0.31, 0.014]),
      bone: tail.joints[1],
      flat: true,
      name: `tail_red_tip_${side}`,
      group: "tail",
    });
  }

  // ---------------------------------------------------------------------------
  // Legs and gripping toes: warm yellow against the brown branch.
  // ---------------------------------------------------------------------------

  for (const side of [1, -1]) {
    const leg = legChains[side > 0 ? 0 : 1];

    b.sweep(leg, [0.032, 0.019], {
      color: YELLOW_DARK,
      section: { ngon: 6 },
      caps: "round",
      group: "feet",
      name: side > 0 ? "leg_L" : "leg_R",
    });

    b.part(new THREE.SphereGeometry(0.038, 8, 6), YELLOW, {
      at: [side * 0.10, 0.57, 0.06],
      bone: leg.tip,
      flat: true,
      name: side > 0 ? "foot_L" : "foot_R",
    });

    for (let toe = 0; toe < 3; toe++) {
      const z = 0.045 + (toe - 1) * 0.045;
      b.rod(
        [side * 0.10, 0.565, z],
        [side * (0.165 + toe * 0.014), 0.535, z + 0.035],
        0.012,
        {
          color: YELLOW,
          bone: leg.tip,
          name: `toe_${side > 0 ? "L" : "R"}_${toe}`,
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Branch: simple low-poly support, with a grounded trunk and two angular twigs.
  // ---------------------------------------------------------------------------

  b.rod([0, 0.02, -0.18], [0, 0.49, 0.02], 0.085, {
    color: BRANCH,
    section: { ngon: 6 },
    caps: "round",
    name: "grounded_branch_stem",
    group: "branch",
  });

  b.rod([-0.47, 0.53, 0.02], [0.49, 0.53, 0.02], 0.065, {
    color: BRANCH_LIGHT,
    section: { ngon: 7 },
    caps: "round",
    name: "main_branch",
    group: "branch",
  });

  b.rod([0.20, 0.55, 0.02], [0.38, 0.72, -0.02], 0.04, {
    color: BRANCH,
    section: { ngon: 6 },
    caps: "round",
    name: "right_twig",
    group: "branch",
  });

  b.rod([-0.26, 0.54, 0.01], [-0.43, 0.68, 0.04], 0.038, {
    color: BRANCH,
    section: { ngon: 6 },
    caps: "round",
    name: "left_twig",
    group: "branch",
  });

  // A few flat geometric leaves, kept sparse so the bird remains the hero.
  for (const [x, y, z, s] of [
    [0.39, 0.72, -0.02, 1],
    [-0.44, 0.69, 0.04, -1],
    [0.47, 0.58, 0.02, 1],
  ] as [number, number, number, number][]) {
    b.extrude(
      [
        [0, 0],
        [0.06, 0.025],
        [0.11, 0.10],
        [0.045, 0.16],
        [-0.01, 0.08],
      ],
      {
        at: [x, y, z],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: LEAF,
        group: "branch",
        name: "geometric_leaf",
      },
    );
  }

  return b.root;
}
