import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A low-poly songbird assembled from bold primary-colour geometry, perched on a faceted branch with graphic eyes, wings, tail feathers, toes, and a jaunty open beak.",
};

const RED = "#e53935";
const BLUE = "#2455d6";
const YELLOW = "#f5c51b";
const BLACK = "#17191f";
const WHITE = "#fff8e8";
const BRANCH = "#6b3f28";
const BRANCH_LIGHT = "#9b6035";
const LEG = "#d98728";
const INNER_WING = "#f04a3a";

const EYE = svg(
  `<svg viewBox="0 0 64 88" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 42 Q32 5 59 42 Q32 78 5 42Z" fill="#fff8e8" stroke="#17191f" stroke-width="6"/>
    <ellipse cx="34" cy="43" rx="13" ry="23" fill="#2455d6" stroke="#17191f" stroke-width="4"/>
    <ellipse cx="35" cy="47" rx="5.5" ry="14" fill="#17191f"/>
    <circle cx="29" cy="31" r="5.5" fill="#fff8e8"/>
    <circle cx="41" cy="58" r="2.5" fill="#fff8e8"/>
  </svg>`,
  { size: 256 },
);

const CHEST_MARK = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="#f5c51b" stroke="#17191f" stroke-width="7"/>
    <path d="M50 16 L58 42 L86 42 L63 58 L71 85 L50 69 L29 85 L37 58 L14 42 L42 42Z"
      fill="#e53935" stroke="#17191f" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
  { size: 192 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string,
  at: THREE.Vector3 | [number, number, number],
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    flat: true,
    ...options,
  });
}

function lowSphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: string,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  bone?: unknown,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    scale,
    bone,
    flat: true,
  });
}

function toe(
  b: ReturnType<typeof createBuilder>,
  foot: THREE.Vector3,
  end: THREE.Vector3,
) {
  b.rod(foot, end, 0.014, { color: LEG, caps: "round", section: { ngon: 5 } });
  const claw = end.clone();
  claw.y -= 0.018;
  claw.z += 0.018;
  b.spike(end, claw, null, 0.009, { color: BLACK, caps: "point" });
}

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  // ------------------------------------------------------------------------------------------
  // Skeleton first: one readable neutral bird rig, wings separated and jaw independently hinged.

  const hips = b.joint("hips", {
    at: [0, 0.39, -0.08],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.19],
      [0, 0.41, -0.03],
      [0, 0.45, 0.13],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      group: "body",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.45, 0.12],
      [0, 0.55, 0.16],
      [0, 0.64, 0.18],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
      group: "body",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 0.67, 0.2],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.61, 0.29],
    dir: [0, -0.04, 1],
    role: "jaw",
    group: "head",
  });

  const legChains: Array<{
    side: number;
    chain: ReturnType<typeof b.chain>;
    foot: THREE.Vector3;
  }> = [];

  for (const side of [1, -1]) {
    const hip = [side * 0.105, 0.36, -0.035] as [number, number, number];
    const foot = new THREE.Vector3(side * 0.105, 0.145, -0.015);
    const pts = limb(
      hip,
      foot,
      [0.105, 0.105],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );
    const chain = b.chain(`leg${side > 0 ? "L" : "R"}`, pts, {
      parent: hips,
      names: [
        `hip${side > 0 ? "L" : "R"}`,
        `ankle${side > 0 ? "L" : "R"}`,
        `foot${side > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      contact: [foot.x, 0, foot.z],
      group: "legs",
    });
    legChains.push({ side, chain, foot });
  }

  const wingChains: Array<{
    side: number;
    chain: ReturnType<typeof b.chain>;
  }> = [];

  for (const side of [1, -1]) {
    const shoulder = [side * 0.145, 0.48, 0.085] as [number, number, number];
    const elbow = [side * 0.235, 0.42, 0.04] as [number, number, number];
    const wingTip = [side * 0.19, 0.29, -0.08] as [number, number, number];
    const chain = b.chain(
      `wing${side > 0 ? "L" : "R"}`,
      [shoulder, elbow, wingTip],
      {
        parent: hips,
        names: [
          `shoulder${side > 0 ? "L" : "R"}`,
          `elbow${side > 0 ? "L" : "R"}`,
          `wingTip${side > 0 ? "L" : "R"}`,
        ],
        role: "wing",
        group: "wings",
      },
    );
    wingChains.push({ side, chain });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.39, -0.19],
      [0, 0.35, -0.31],
      [0, 0.32, -0.48],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3"],
      role: "tail",
      group: "tail",
    },
  );

  // ------------------------------------------------------------------------------------------
  // Branch: a chunky Bauhaus stage with a fork and clean geometric cut ends.

  const branchPath = catmull([
    [-0.78, 0.075, -0.08],
    [-0.43, 0.075, -0.03],
    [0, 0.075, 0],
    [0.42, 0.08, 0.035],
    [0.82, 0.09, 0.02],
  ]);
  const branch = b.sweep(branchPath, 0.075, {
    color: BRANCH,
    sides: 6,
    caps: "flat",
    section: "circle",
    name: "mainBranch",
    group: "perch",
  });

  b.sweep(
    catmull([
      [0.45, 0.08, 0.035],
      [0.58, 0.18, 0.11],
      [0.68, 0.29, 0.15],
    ]),
    [0.045, 0.018],
    {
      color: BRANCH_LIGHT,
      sides: 6,
      caps: "flat",
      group: "perch",
      name: "forkL",
    },
  );

  b.sweep(
    catmull([
      [-0.45, 0.075, -0.03],
      [-0.58, 0.17, -0.12],
      [-0.67, 0.27, -0.18],
    ]),
    [0.04, 0.012],
    {
      color: BRANCH_LIGHT,
      sides: 6,
      caps: "flat",
      group: "perch",
      name: "forkR",
    },
  );

  // Two angular cut marks on the branch.
  for (const x of [-0.59, 0.61]) {
    b.part(
      new THREE.CylinderGeometry(0.047, 0.047, 0.012, 6),
      YELLOW,
      {
        at: [x, 0.105, x > 0 ? 0.03 : -0.06],
        dir: [0, 1, 0],
        flat: true,
        group: "perch",
      },
    );
  }

  // ------------------------------------------------------------------------------------------
  // Body: faceted blue-black core with a yellow geometric belly.

  const body = b.sweep(spine, (t) => 0.145 + 0.025 * Math.sin(t * Math.PI), {
    color: BLUE,
    sides: 8,
    caps: "round",
    smooth: false,
    group: "body",
    name: "facetedBody",
  });

  b.sweep(neck, [0.12, 0.105], {
    color: BLUE,
    sides: 8,
    caps: "round",
    smooth: false,
    group: "body",
    name: "neck",
  });

  const belly = b.part(new THREE.SphereGeometry(0.13, 8, 6), YELLOW, {
    bone: spine.joints[1],
    at: [0, 0.405, 0.115],
    scale: [0.9, 1.05, 0.72],
    flat: true,
    group: "body",
    name: "yellowBelly",
  });

  b.decal(
    belly,
    CHEST_MARK,
    {
      at: [0, 0.42, 0.22],
      dir: [0, 0.05, 1],
      up: [0, 1, 0],
      size: [0.09, 0.09],
      lift: 0.004,
      segments: 5,
      group: "body",
      name: "chestEmblem",
    },
  );

  // ------------------------------------------------------------------------------------------
  // Head and graphic face.

  const skull = lowSphere(
    b,
    0.16,
    RED,
    [0, 0.69, 0.21],
    [1.12, 1.05, 1.04],
    head,
  );
  skull.mesh.name = "redHead";

  for (const side of [1, -1]) {
    b.decal(skull, EYE, {
      at: [side * 0.072, 0.705, 0.335],
      dir: [0, 0.02, 1],
      up: [0, 1, 0],
      size: [0.075, 0.095],
      mirror: side > 0,
      lift: 0.003,
      segments: 6,
      group: "face",
      name: `eye${side > 0 ? "L" : "R"}`,
    });
  }

  // Crown blocks make the head unmistakably graphic and songbird-like.
  box(b, [0.075, 0.055, 0.075], YELLOW, [-0.075, 0.835, 0.19], {
    bone: head,
    group: "face",
    name: "crownL",
  });
  box(b, [0.075, 0.055, 0.075], YELLOW, [0.075, 0.835, 0.19], {
    bone: head,
    group: "face",
    name: "crownR",
  });

  // Upper and lower beaks are separate so the jaw reads as a hinge.
  b.part(new THREE.ConeGeometry(0.065, 0.16, 4), YELLOW, {
    bone: head,
    at: [0, 0.675, 0.38],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [0, 0, 0],
    flat: true,
    group: "beak",
    name: "upperBeak",
  });

  b.part(new THREE.ConeGeometry(0.045, 0.12, 4), RED, {
    bone: jaw,
    at: [0, 0.615, 0.35],
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    group: "beak",
    name: "lowerBeak",
  });

  b.rod(
    [-0.075, 0.635, 0.322],
    [0.075, 0.635, 0.322],
    0.009,
    { color: BLACK, caps: "flat", group: "beak", name: "mouthLine" },
  );

  // ------------------------------------------------------------------------------------------
  // Legs, feet, and toes gripping the branch.

  for (const { side, chain, foot } of legChains) {
    b.sweep(chain, [0.025, 0.018], {
      color: LEG,
      sides: 5,
      caps: "round",
      group: "legs",
      name: `legTube${side > 0 ? "L" : "R"}`,
    });

    lowSphere(b, 0.027, LEG, foot, [1.15, 0.8, 1.2], chain.tip);

    toe(
      b,
      foot,
      new THREE.Vector3(side * 0.16, 0.105, 0.055),
    );
    toe(
      b,
      foot,
      new THREE.Vector3(side * 0.065, 0.105, 0.11),
    );
    toe(
      b,
      foot,
      new THREE.Vector3(side * 0.075, 0.105, -0.095),
    );
  }

  // ------------------------------------------------------------------------------------------
  // Large Bauhaus wings: red silhouette, blue inset stripe, black edge rods.

  const wingOutline: [number, number][] = [
    [0.0, 0.02],
    [0.18, 0.03],
    [0.28, -0.08],
    [0.19, -0.19],
    [0.04, -0.23],
    [-0.015, -0.12],
  ];

  for (const { side, chain } of wingChains) {
    const root = new THREE.Vector3(side * 0.14, 0.535, 0.075);
    const wing = b.extrude(wingOutline, {
      at: root,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      smoothing: 0,
      color: INNER_WING,
      bone: chain.joints[0],
      group: "wings",
      name: `redWing${side > 0 ? "L" : "R"}`,
    });

    b.extrude(
      [
        [0.01, -0.01],
        [0.135, 0.0],
        [0.19, -0.075],
        [0.13, -0.12],
        [0.035, -0.15],
      ],
      {
        at: root.clone().add(new THREE.Vector3(0, 0.004, side * 0.012)),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        color: BLUE,
        bone: chain.joints[0],
        group: "wings",
        name: `blueWingPanel${side > 0 ? "L" : "R"}`,
      },
    );

    b.rod(
      chain.at(0.05),
      chain.at(0.9),
      0.012,
      { color: BLACK, caps: "round", group: "wings", name: `wingEdge${side > 0 ? "L" : "R"}` },
    );

    b.rod(
      chain.at(0.18),
      chain.at(0.78),
      0.009,
      { color: YELLOW, caps: "flat", group: "wings", name: `wingBar${side > 0 ? "L" : "R"}` },
    );

    void wing;
  }

  // ------------------------------------------------------------------------------------------
  // Three blue tail blades fan behind the bird.

  const tailTips = [
    new THREE.Vector3(-0.16, 0.27, -0.67),
    new THREE.Vector3(0, 0.26, -0.73),
    new THREE.Vector3(0.16, 0.27, -0.67),
  ];
  const tailBases = [
    new THREE.Vector3(-0.055, 0.38, -0.22),
    new THREE.Vector3(0, 0.37, -0.22),
    new THREE.Vector3(0.055, 0.38, -0.22),
  ];

  for (let i = 0; i < 3; i++) {
    b.rod(tailBases[i], tailTips[i], [0.035, 0.006], {
      color: BLUE,
      caps: "point",
      sides: 5,
      group: "tail",
      name: `tailFeather${i}`,
    });
    b.rod(
      tailBases[i].clone().add(new THREE.Vector3(0, 0.012, 0)),
      tailTips[i].clone().add(new THREE.Vector3(0, 0.012, 0)),
      0.006,
      { color: YELLOW, caps: "flat", group: "tail", name: `tailStripe${i}` },
    );
  }

  // A small red tail fan cap makes the silhouette terminate cleanly.
  lowSphere(b, 0.06, RED, [0, 0.36, -0.23], [1.3, 0.65, 0.8], tail.joints[0]);

  // ------------------------------------------------------------------------------------------
  // Bauhaus circular accents and tiny details.

  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.018, 8), BLACK, {
    at: [0.145, 0.39, 0.17],
    dir: [1, 0, 0],
    flat: true,
    group: "details",
    name: "sideBadge",
  });

  b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.022, 8), YELLOW, {
    at: [0.17, 0.39, 0.17],
    dir: [1, 0, 0],
    flat: true,
    group: "details",
    name: "badgeCenter",
  });

  // A few square branch leaves keep the perch designed rather than naturalistic.
  for (const [x, y, z, s] of [
    [-0.7, 0.28, -0.2, 1],
    [0.72, 0.3, 0.15, -1],
  ] as const) {
    b.extrude(
      [
        [0, 0],
        [0.08, 0.02],
        [0.12, 0.09],
        [0.04, 0.13],
        [-0.04, 0.08],
      ],
      {
        at: [x, y, z],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: YELLOW,
        group: "perch",
        name: `graphicLeaf${x > 0 ? "L" : "R"}`,
      },
    );
  }

  // Keep construction deterministic even if a downstream renderer inspects seeded metadata.
  b.root.userData.seed = rng(27)();

  return b.root;
}
