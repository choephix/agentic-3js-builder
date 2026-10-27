import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  mottle,
  countershade,
  stripes,
  svg,
  rng,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with a braided violet trunk, luminous cyan leaves, glowing seed bulbs, root tendrils, and a radiant crown.",
};

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
    paintSize: 2048,
  });

  const BLUE = "#173c68";
  const DEEP_BLUE = "#0b1d42";
  const VIOLET = "#552e91";
  const PURPLE = "#8f43b7";
  const CYAN = "#62f4e6";
  const PALE_CYAN = "#c4fff3";
  const LIME = "#baff77";
  const PINK = "#ff69cd";
  const DARK = "#071426";
  const INK = "#07152e";

  const bark = countershade(
    mottle(BLUE, VIOLET, { size: 0.17, contrast: 1.8, seed: 12 }),
    DEEP_BLUE,
    { level: -0.12, soft: 0.42 },
  );

  const branchPaint = countershade(
    stripes(VIOLET, [BLUE, PURPLE], {
      size: 0.11,
      width: 0.26,
      wobble: 0.3,
      seed: 29,
    }),
    DEEP_BLUE,
    { level: -0.1, soft: 0.35 },
  );

  const leafPaint = countershade(
    mottle(CYAN, "#1b9eaa", { size: 0.11, contrast: 1.7, seed: 44 }),
    "#0d596d",
    { level: -0.05, soft: 0.28 },
  );

  const veinPaint = paint((_p, n) => (n.y > 0.25 ? PALE_CYAN : "#267e92"));

  const root = b.joint("root", {
    at: [0, 0.1, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "plant",
  });

  // ---------- SVG marks and luminous drawings ----------

  const veinTexture = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 252 C65 190 62 128 64 12" fill="none" stroke="#d8fff5" stroke-width="6"/>
      <path d="M64 180 C38 164 22 146 10 122 M64 153 C90 138 108 118 119 94
               M64 111 C42 96 28 77 17 51 M64 83 C85 73 103 55 112 31"
            fill="none" stroke="#65e9de" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="64" cy="47" r="6" fill="#ffffff"/>
      <circle cx="39" cy="151" r="4" fill="#c4fff3"/>
      <circle cx="91" cy="129" r="4" fill="#c4fff3"/>
      <circle cx="25" cy="69" r="3" fill="#ffffff"/>
      <circle cx="105" cy="57" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const bulbTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".35" stop-color="#baffff"/>
          <stop offset="1" stop-color="#39c9d9"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="57" fill="url(#g)" stroke="#e7ffff" stroke-width="4"/>
      <path d="M64 9 C48 35 48 63 64 119 C80 63 80 35 64 9Z"
            fill="none" stroke="#ffffff" stroke-width="3" opacity=".75"/>
      <circle cx="43" cy="38" r="10" fill="#ffffff" opacity=".8"/>
      <circle cx="86" cy="83" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );

  const starTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 4 L72 54 L124 64 L72 73 L64 124 L55 73 L4 64 L55 54Z"
        fill="#dffffb"/>
      <circle cx="64" cy="64" r="13" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  const tinyDotTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="27" fill="#dfffff"/>
      <circle cx="22" cy="21" r="9" fill="#ffffff"/>
    </svg>`,
    { size: 96 },
  );

  // ---------- skeleton first ----------

  const trunkPath = catmull(
    [
      [0, 0.11, 0],
      [0.02, 0.38, -0.01],
      [-0.02, 0.68, 0.02],
      [0.05, 0.98, 0.04],
      [0.01, 1.28, 0.01],
      [0, 1.48, 0],
    ],
    { tension: 0.35 },
  );

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    count: 6,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "crownStem", "crownTip"],
    role: "spine",
    group: "plant",
  });

  const branchSpecs = [
    {
      name: "branchL1",
      parent: trunk.joints[1],
      points: [
        [0.01, 0.43, 0],
        [0.25, 0.58, 0.04],
        [0.51, 0.68, 0.1],
        [0.7, 0.75, 0.18],
      ],
      side: 1,
    },
    {
      name: "branchR1",
      parent: trunk.joints[1],
      points: [
        [-0.01, 0.46, 0.01],
        [-0.22, 0.6, 0.02],
        [-0.48, 0.7, 0.04],
        [-0.66, 0.77, 0.07],
      ],
      side: -1,
    },
    {
      name: "branchL2",
      parent: trunk.joints[3],
      points: [
        [0.02, 0.91, 0.02],
        [0.27, 1.05, -0.01],
        [0.48, 1.2, -0.06],
        [0.58, 1.32, -0.12],
      ],
      side: 1,
    },
    {
      name: "branchR2",
      parent: trunk.joints[3],
      points: [
        [0.01, 0.98, 0.03],
        [-0.25, 1.1, 0.02],
        [-0.48, 1.22, 0.04],
        [-0.63, 1.37, 0.08],
      ],
      side: -1,
    },
    {
      name: "branchBack",
      parent: trunk.joints[2],
      points: [
        [0, 0.66, -0.01],
        [0, 0.82, -0.23],
        [0.03, 0.98, -0.42],
        [0.02, 1.08, -0.58],
      ],
      side: 0,
    },
  ] as const;

  const branches = branchSpecs.map((spec) =>
    b.chain(spec.name, catmull(spec.points), {
      parent: spec.parent,
      count: 4,
      names: [`${spec.name}Base`, `${spec.name}Mid`, `${spec.name}Fork`, `${spec.name}Tip`],
      role: "fan",
      group: "plant",
    }),
  );

  // ---------- core body ----------

  const trunkTube = b.sweep(trunk, (t) => 0.105 - t * 0.045, {
    color: bark,
    sides: 8,
    caps: "round",
    group: "plant",
    name: "faceted-trunk",
  });

  for (let i = 0; i < branches.length; i++) {
    b.sweep(branches[i], (t) => 0.052 - t * 0.025, {
      color: branchPaint,
      sides: 7,
      caps: "round",
      group: "plant",
      name: `${branchSpecs[i].name}-tube`,
    });
  }

  // Braided raised ridges on the trunk make the silhouette feel grown rather than manufactured.
  for (let i = 0; i < 3; i++) {
    const phase = i * 2.1;
    const ridge = catmull([
      [0.07 * Math.cos(phase), 0.13, 0.07 * Math.sin(phase)],
      [0.08 * Math.cos(phase + 0.7), 0.48, 0.08 * Math.sin(phase + 0.7)],
      [0.075 * Math.cos(phase + 1.5), 0.88, 0.075 * Math.sin(phase + 1.5)],
      [0.03 * Math.cos(phase + 2.1), 1.3, 0.03 * Math.sin(phase + 2.1)],
    ]);
    b.sweep(ridge, [0.016, 0.006], {
      bone: trunk.joints[0],
      color: PURPLE,
      sides: 5,
      caps: "round",
      name: `raised-ridge-${i}`,
    });
  }

  // ---------- root tendrils ----------

  const roots = [
    [[0, 0.1, 0], [0.16, 0.07, 0.08], [0.34, 0.045, 0.16], [0.48, 0.035, 0.2]],
    [[0, 0.095, 0], [-0.18, 0.07, 0.06], [-0.38, 0.045, 0.14], [-0.54, 0.03, 0.2]],
    [[0, 0.1, 0], [0.03, 0.07, -0.17], [0.02, 0.045, -0.35], [-0.05, 0.03, -0.5]],
    [[0, 0.1, 0], [0.04, 0.07, 0.15], [-0.02, 0.045, 0.31], [0.08, 0.03, 0.47]],
  ];

  roots.forEach((points, i) => {
    b.sweep(catmull(points), [0.065, 0.018], {
      bone: root,
      color: branchPaint,
      sides: 7,
      caps: "round",
      name: `root-tendril-${i}`,
    });
  });

  // A chunky basal collar gives the plant a visible point of contact with the soil.
  b.part(
    new THREE.CylinderGeometry(0.16, 0.22, 0.12, 9),
    bark,
    {
      bone: root,
      at: [0, 0.09, 0],
      name: "basal-collar",
      group: "plant",
    },
  );

  // ---------- leaf helper ----------

  const branchEnd = (branch: (typeof branches)[number]) =>
    branch.joints[branch.joints.length - 1];
  const trunkEnd = trunk.joints[trunk.joints.length - 1];

  function leaf(
    name: string,
    at: THREE.Vector3 | number[],
    x: THREE.Vector3 | number[],
    y: THREE.Vector3 | number[],
    length: number,
    width: number,
    bone: any,
    tilt = 0,
  ) {
    const outline: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [width * 0.28, length * 0.12, "sharp"],
      [width * 0.7, length * 0.42, "sharp"],
      [width * 0.78, length * 0.72, "sharp"],
      [width * 0.35, length * 0.94, "sharp"],
      [0, length, "sharp"],
      [-width * 0.3, length * 0.82, "sharp"],
      [-width * 0.72, length * 0.48, "sharp"],
      [-width * 0.62, length * 0.18, "sharp"],
    ];

    const part = b.extrude(outline, {
      at,
      x,
      y,
      thickness: [0.014, 0.004],
      bevel: 0.006,
      smoothing: 1,
      color: leafPaint,
      bone,
      group: "leaves",
      name,
    });

    // A luminous central vein follows the same local drawing directions.
    b.sweep(
      catmull([
        part.local([0, 0.015, 0.012]),
        part.local([0, length * 0.32, 0.012]),
        part.local([0, length * 0.68, 0.012]),
        part.local([0, length * 0.96, 0.012]),
      ]),
      [0.009, 0.003],
      {
        bone,
        color: veinPaint,
        sides: 5,
        caps: "round",
        name: `${name}-vein`,
      },
    );

    // Sparse glowing vein nodes, intentionally oversized for a graphic Avatar silhouette.
    [0.28, 0.52, 0.74].forEach((t, i) => {
      const p = part.local([0, length * t, 0.016]);
      const node = b.part(new THREE.SphereGeometry(0.014, 7, 5), PALE_CYAN, {
        bone,
        at: p,
        name: `${name}-node-${i}`,
        group: "glow",
      });
      glow(node, 2.2);
    });

    if (tilt !== 0) {
      // A small decorative translucent-looking star mark is placed near the leaf tip.
      const mark = b.part(new THREE.PlaneGeometry(width * 0.32, width * 0.32), PALE_CYAN, {
        bone,
        at: part.local([0, length * 0.72, 0.018]),
        dir: y,
        axis: "z",
        rotation: [0, 0, tilt],
        texture: starTexture,
        name: `${name}-star-mark`,
        group: "glow",
      });
      glow(mark, 1.5);
    }

    return part;
  }

  // Lower fans.
  leaf(
    "leaf-lower-left",
    branchEnd(branches[0]).at,
    [-0.22, 0.15, 0.96],
    [0.2, 0.93, 0.1],
    0.54,
    0.27,
    branchEnd(branches[0]).bone,
    14,
  );
  leaf(
    "leaf-lower-right",
    branchEnd(branches[1]).at,
    [0.24, 0.1, 0.97],
    [-0.12, 0.95, 0.08],
    0.58,
    0.29,
    branchEnd(branches[1]).bone,
    -14,
  );

  // Middle leaves point toward the viewer and create a broad readable crown.
  leaf(
    "leaf-middle-left",
    branchEnd(branches[2]).at,
    [-0.98, 0.08, 0.12],
    [0.13, 0.96, 0.08],
    0.5,
    0.25,
    branchEnd(branches[2]).bone,
    10,
  );
  leaf(
    "leaf-middle-right",
    branchEnd(branches[3]).at,
    [0.98, 0.08, 0.12],
    [-0.08, 0.98, 0.06],
    0.52,
    0.26,
    branchEnd(branches[3]).bone,
    -10,
  );

  // Back leaf is darker and longer, visible as a silhouette behind the plant.
  const backLeaf = leaf(
    "leaf-back",
    branchEnd(branches[4]).at,
    [0.58, 0.1, 0.8],
    [-0.04, 0.94, -0.18],
    0.62,
    0.31,
    branchEnd(branches[4]).bone,
    0,
  );

  // Three small crown leaves around the top stem.
  leaf(
    "crown-leaf-left",
    trunk.tip.at,
    [-0.95, 0.08, 0.18],
    [0.08, 0.98, 0.03],
    0.48,
    0.22,
    trunk.tip.bone,
    6,
  );
  leaf(
    "crown-leaf-right",
    trunk.tip.at,
    [0.95, 0.08, 0.18],
    [-0.08, 0.98, 0.03],
    0.49,
    0.23,
    trunk.tip.bone,
    -6,
  );
  leaf(
    "crown-leaf-front",
    trunk.tip.at,
    [0.05, 0.12, -0.98],
    [0, 0.98, 0.1],
    0.46,
    0.23,
    trunk.tip.bone,
    0,
  );

  // ---------- luminous seed bulbs ----------

  function bulb(
    name: string,
    at: THREE.Vector3 | number[],
    radius: number,
    color: string,
    bone: any,
    front = true,
  ) {
    const outer = b.part(new THREE.SphereGeometry(radius, 12, 8), color, {
      bone,
      at,
      scale: [1, 1.18, 0.92],
      name,
      group: "glow",
    });
    glow(outer, 2.7);

    const cap = b.part(new THREE.SphereGeometry(radius * 0.52, 9, 6), PALE_CYAN, {
      bone,
      at: new THREE.Vector3(...(at as any)).add(new THREE.Vector3(0, radius * 0.12, radius * 0.68)),
      name: `${name}-core`,
      group: "glow",
    });
    glow(cap, 4);

    if (front) {
      const emblem = b.part(new THREE.PlaneGeometry(radius * 0.78, radius * 0.78), "#ffffff", {
        bone,
        at: new THREE.Vector3(...(at as any)).add(new THREE.Vector3(0, 0, radius * 0.88)),
        dir: [0, 0, 1],
        axis: "z",
        texture: bulbTexture,
        name: `${name}-face`,
        group: "glow",
      });
      glow(emblem, 2.5);
    }

    return outer;
  }

  bulb("seed-lower-left", branches[0].tip.at, 0.067, CYAN, branches[0].tip.bone);
  bulb("seed-lower-right", branches[1].tip.at, 0.072, PINK, branches[1].tip.bone);
  bulb("seed-middle-left", branches[2].tip.at, 0.06, LIME, branches[2].tip.bone);
  bulb("seed-middle-right", branches[3].tip.at, 0.064, CYAN, branches[3].tip.bone);
  bulb("seed-back", branches[4].tip.at, 0.058, PURPLE, branches[4].tip.bone, false);

  // Bulb strings and collars.
  [branches[0], branches[1], branches[2], branches[3], branches[4]].forEach((branch, i) => {
    const p = branch.tip.at;
    const collar = b.part(new THREE.TorusGeometry(0.055, 0.008, 5, 10), PALE_CYAN, {
      bone: branch.tip.bone,
      at: p,
      dir: branch.tip.tangent,
      name: `bulb-collar-${i}`,
      group: "glow",
    });
    glow(collar, 2.2);
  });

  // ---------- floating crown flower / lantern ----------

  const crownAt = trunk.tip.at;
  const crownCore = bulb("crown-heart", crownAt, 0.105, CYAN, trunkEnd.bone);

  // Broad six-petal alien flower, all petals separated and readable.
  const petalOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.06, 0.08, "sharp"],
    [0.13, 0.21, "sharp"],
    [0.1, 0.34, "sharp"],
    [0, 0.44, "sharp"],
    [-0.1, 0.34, "sharp"],
    [-0.13, 0.21, "sharp"],
    [-0.06, 0.08, "sharp"],
  ];

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.sin(a), 0.16, Math.cos(a)).normalize();
    const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).normalize();
    const petal = b.extrude(petalOutline, {
      at: crownAt,
      x: tangent,
      y: radial,
      thickness: [0.018, 0.004],
      bevel: 0.005,
      smoothing: 1,
      color: i % 2 ? leafPaint : "#36c7c7",
      bone: trunk.tip.bone,
      name: `crown-petal-${i}`,
      group: "crown",
    });

    const petalLight = b.part(new THREE.PlaneGeometry(0.09, 0.13), "#ffffff", {
      bone: trunk.tip.bone,
      at: petal.local([0, 0.25, 0.018]),
      dir: radial,
      axis: "z",
      texture: starTexture,
      name: `crown-petal-light-${i}`,
      group: "glow",
    });
    glow(petalLight, 1.6);
  }

  // A short luminous antenna rising from the crown, staying below the plant's top.
  const antennaPath = catmull([
    crownAt,
    [0.02, 1.55, 0.01],
    [0.08, 1.61, 0.04],
  ]);
  const antenna = b.sweep(antennaPath, [0.014, 0.004], {
    bone: trunk.tip.bone,
    color: PALE_CYAN,
    sides: 6,
    caps: "round",
    name: "crown-antenna",
    group: "glow",
  });
  const antennaTip = b.part(new THREE.SphereGeometry(0.035, 8, 6), LIME, {
    bone: trunk.tip.bone,
    at: [0.08, 1.61, 0.04],
    name: "antenna-lantern",
    group: "glow",
  });
  glow(antennaTip, 4);

  // ---------- decorative bioluminescent freckles ----------

  const frecklePoints = [
    [0.087, 0.32, 0.076],
    [-0.09, 0.5, 0.06],
    [0.078, 0.7, 0.07],
    [-0.07, 0.9, 0.065],
    [0.06, 1.12, 0.055],
    [-0.04, 1.3, 0.045],
    [0.1, 0.58, -0.02],
    [-0.1, 0.83, -0.03],
  ];

  frecklePoints.forEach((p, i) => {
    const dot = b.part(new THREE.SphereGeometry(0.012 + (i % 3) * 0.003, 6, 4), PALE_CYAN, {
      bone: trunk.joints[Math.min(Math.floor(i / 2), trunk.joints.length - 1)],
      at: p,
      name: `trunk-freckle-${i}`,
      group: "glow",
    });
    glow(dot, 2.8);
  });

  // Small suspended motes cling to a few leaf tips, giving the silhouette a living halo without adding scenery.
  const moteData = [
    [0.76, 0.78, 0.2],
    [-0.72, 0.8, 0.1],
    [0.63, 1.37, -0.1],
    [-0.7, 1.43, 0.08],
  ];
  moteData.forEach((p, i) => {
    const mote = b.part(new THREE.SphereGeometry(0.018, 7, 5), PALE_CYAN, {
      bone: branches[i % branches.length].tip.bone,
      at: p,
      name: `leaf-mote-${i}`,
      group: "glow",
    });
    glow(mote, 3.5);
    b.part(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", {
      bone: branches[i % branches.length].tip.bone,
      at: [p[0], p[1], p[2] + 0.02],
      dir: [0, 0, 1],
      axis: "z",
      texture: tinyDotTexture,
      name: `leaf-mote-mark-${i}`,
      group: "glow",
    });
  });

  // Preserve deterministic construction intent for future scatter/detail extensions.
  rng(918273);

  return b.root;
}
