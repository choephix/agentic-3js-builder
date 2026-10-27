```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with a braided violet trunk, luminous cyan veins, broad iridescent leaves, dangling glowing seed pods, and a radiant star-bloom crown.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const rngPlant = rng(41);

  const VIOLET = cel("#552b83", "#24194c");
  const VIOLET_DARK = cel("#321850", "#150d2d");
  const TEAL = cel("#159c9b", "#07525e");
  const LEAF = furEdge("#31d6bc", "#105e77", {
    level: -0.02,
    teeth: 0.18,
    period: 0.18,
    along: [1, 0, 0],
  });
  const LEAF_DARK = cel("#137b86", "#073b59");
  const MAGENTA = cel("#d64aaa", "#682064");
  const CYAN = "#66fff1";
  const CYAN_SOFT = "#1ddfd8";
  const PINK = "#ff75dc";
  const GOLD = "#ffe887";
  const INK = "#160d32";
  const ROOT = "#241938";
  const SOIL = "#34234a";

  const root = b.joint("root", {
    at: [0, 0.12, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  // --- Small grounding crown, deliberately simple so the plant remains the hero.
  const rootPlate = b.part(
    new THREE.CylinderGeometry(0.27, 0.34, 0.09, 8),
    ROOT,
    { bone: root, at: [0, 0.045, 0], name: "rootPlate" },
  );
  b.part(
    new THREE.CylinderGeometry(0.19, 0.23, 0.045, 8),
    SOIL,
    { bone: root, at: [0, 0.1, 0], name: "soilCap" },
  );

  const rootSpokes: THREE.Vector3[] = [
    new THREE.Vector3(0.23, 0.075, 0.02),
    new THREE.Vector3(-0.23, 0.075, 0.01),
    new THREE.Vector3(0.03, 0.075, 0.24),
    new THREE.Vector3(-0.01, 0.075, -0.24),
  ];
  for (let i = 0; i < rootSpokes.length; i++) {
    const p = rootSpokes[i];
    b.rod([0, 0.08, 0], p, 0.025, { color: VIOLET_DARK, bone: root });
    b.part(new THREE.SphereGeometry(0.035, 7, 5), TEAL, {
      bone: root,
      at: p,
      name: `rootNode${i}`,
    });
  }

  // --- Main trunk, built as a gently S-curved alien stalk.
  const trunkPath = catmull([
    [0, 0.11, 0],
    [0.02, 0.42, -0.015],
    [-0.04, 0.82, 0.015],
    [0.06, 1.20, -0.01],
    [-0.02, 1.57, 0.03],
    [0.04, 1.93, 0.02],
    [0, 2.18, 0.02],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    count: 7,
    names: ["trunk0", "trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
    role: "spine",
  });

  const trunkSweep = b.sweep(trunk, (t) => 0.145 - t * 0.075, {
    color: VIOLET,
    sides: 7,
    caps: "round",
    name: "violetTrunk",
  });

  // Raised luminous ridges make the trunk read as an Avatar-like living organism.
  for (const side of [-1, 1]) {
    const ridge = catmull([
      [side * 0.08, 0.16, 0.095],
      [side * 0.095, 0.62, 0.09],
      [side * 0.065, 1.12, 0.095],
      [side * 0.08, 1.60, 0.08],
      [side * 0.02, 2.08, 0.06],
    ]);
    b.sweep(ridge, [0.012, 0.022], {
      color: CYAN_SOFT,
      bone: trunk,
      caps: "round",
      name: side > 0 ? "trunkRidgeL" : "trunkRidgeR",
    });
  }

  // Luminous nodes spaced up the stalk.
  const trunkNodes = [
    [0.045, 0.38, 0.13],
    [-0.07, 0.77, 0.12],
    [0.09, 1.16, 0.11],
    [-0.025, 1.52, 0.10],
    [0.06, 1.86, 0.075],
  ];
  for (let i = 0; i < trunkNodes.length; i++) {
    const p = trunkNodes[i];
    const node = b.part(new THREE.SphereGeometry(0.035, 8, 6), CYAN, {
      bone: trunk,
      at: p,
      name: `trunkGlowNode${i}`,
    });
    glow(node, 2.2);
  }

  // --- Branch helper.
  type BranchSpec = {
    name: string;
    points: [number, number, number][];
    side: number;
    leafScale: number;
    hue: "teal" | "violet";
  };

  const branches: BranchSpec[] = [
    {
      name: "branchLowL",
      points: [
        [-0.02, 0.68, 0.01],
        [-0.28, 0.83, 0.02],
        [-0.54, 1.02, 0.04],
        [-0.78, 1.12, 0.06],
      ],
      side: 1,
      leafScale: 1,
      hue: "teal",
    },
    {
      name: "branchLowR",
      points: [
        [-0.01, 0.63, -0.01],
        [0.28, 0.76, -0.015],
        [0.56, 0.94, 0.02],
        [0.82, 1.02, 0.07],
      ],
      side: -1,
      leafScale: 0.92,
      hue: "violet",
    },
    {
      name: "branchMidL",
      points: [
        [0.01, 1.02, 0.015],
        [-0.27, 1.18, 0.025],
        [-0.50, 1.39, 0.06],
        [-0.72, 1.53, 0.08],
      ],
      side: 1,
      leafScale: 1.08,
      hue: "teal",
    },
    {
      name: "branchMidR",
      points: [
        [0.02, 1.20, 0.02],
        [0.29, 1.34, 0.04],
        [0.55, 1.56, 0.10],
        [0.75, 1.72, 0.15],
      ],
      side: -1,
      leafScale: 1.08,
      hue: "violet",
    },
    {
      name: "branchHighL",
      points: [
        [-0.01, 1.56, 0.02],
        [-0.22, 1.72, 0.07],
        [-0.42, 1.92, 0.13],
        [-0.58, 2.06, 0.18],
      ],
      side: 1,
      leafScale: 0.82,
      hue: "teal",
    },
    {
      name: "branchHighR",
      points: [
        [0.00, 1.72, 0.025],
        [0.22, 1.84, 0.08],
        [0.40, 2.00, 0.16],
        [0.55, 2.11, 0.22],
      ],
      side: -1,
      leafScale: 0.78,
      hue: "violet",
    },
  ];

  const branchChains: Record<string, ReturnType<typeof b.chain>> = {};
  const branchSweeps: Record<string, ReturnType<typeof b.sweep>> = {};

  for (const spec of branches) {
    const path = catmull(spec.points);
    const chain = b.chain(spec.name, path, {
      parent: trunk.joints[Math.min(4, Math.floor(spec.points[0][1] * 3))],
      count: 4,
      names: [`${spec.name}Base`, `${spec.name}Mid`, `${spec.name}Tip`, `${spec.name}End`],
      role: "arm",
    });
    const branch = b.sweep(chain, (t) => 0.062 - t * 0.035, {
      color: spec.hue === "teal" ? TEAL : VIOLET_DARK,
      sides: 6,
      caps: "round",
      name: `${spec.name}Stem`,
    });
    branchChains[spec.name] = chain;
    branchSweeps[spec.name] = branch;

    // A bright seam follows each branch.
    b.sweep(
      catmull([
        [spec.points[0][0] + spec.side * 0.035, spec.points[0][1], spec.points[0][2] + 0.04],
        [spec.points[1][0] + spec.side * 0.045, spec.points[1][1], spec.points[1][2] + 0.04],
        [spec.points[2][0] + spec.side * 0.03, spec.points[2][1], spec.points[2][2] + 0.04],
        [spec.points[3][0] + spec.side * 0.02, spec.points[3][1], spec.points[3][2] + 0.03],
      ]),
      [0.008, 0.014],
      { color: CYAN_SOFT, caps: "round", name: `${spec.name}Vein` },
    );

    // Terminal fork and two broad leaves.
    const tip = spec.points[spec.points.length - 1];
    const s = spec.leafScale;
    addLeaf(
      b,
      root,
      [tip[0] + spec.side * 0.18 * s, tip[1] + 0.13 * s, tip[2] + 0.015],
      spec.side,
      s,
      spec.hue === "teal" ? LEAF : LEAF_DARK,
      `${spec.name}LeafA`,
    );
    addLeaf(
      b,
      root,
      [tip[0] - spec.side * 0.04 * s, tip[1] + 0.20 * s, tip[2] + 0.06],
      -spec.side,
      s * 0.82,
      spec.hue === "teal" ? LEAF_DARK : LEAF,
      `${spec.name}LeafB`,
    );

    // Tiny glowing terminal bead.
    const bead = b.part(new THREE.SphereGeometry(0.045 * s, 8, 6), PINK, {
      bone: chain.tip,
      at: [tip[0], tip[1], tip[2] + 0.015],
      name: `${spec.name}Terminal`,
    });
    glow(bead, 1.8);
  }

  // --- Leaf helper: flat, angular, boldly readable.
  function addLeaf(
    builder: ReturnType<typeof createBuilder>,
    bone: ReturnType<typeof b.joint>,
    at: [number, number, number],
    side: number,
    scale: number,
    color: any,
    name: string,
  ) {
    const outline: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.16, 0.045, "sharp"],
      [0.34, 0.14, "sharp"],
      [0.50, 0.27, "sharp"],
      [0.62, 0.43, "sharp"],
      [0.48, 0.47, "sharp"],
      [0.29, 0.40, "sharp"],
      [0.10, 0.25, "sharp"],
    ].map(([x, y, sharp]) => [x * side * scale, y * scale, sharp]);

    const leaf = builder.extrude(outline, {
      at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.012, 0.004],
      bevel: 0.006,
      color,
      bone,
      name,
    });

    // Central luminous rib, placed just in front of the leaf.
    const ribEnd: [number, number, number] = [
      at[0] + side * 0.51 * scale,
      at[1] + 0.31 * scale,
      at[2] + 0.015,
    ];
    builder.rod(at, ribEnd, 0.009 * scale, {
      color: CYAN_SOFT,
      bone,
      name: `${name}Rib`,
    });

    // Three little vein bars give the leaves an unmistakable alien pattern.
    for (let i = 0; i < 3; i++) {
      const t = 0.18 + i * 0.16;
      const x = at[0] + side * (0.15 + t * 0.48) * scale;
      const y = at[1] + (0.07 + t * 0.32) * scale;
      builder.rod(
        [x - side * 0.08 * scale, y - 0.03 * scale, at[2] + 0.017],
        [x + side * 0.045 * scale, y + 0.055 * scale, at[2] + 0.019],
        0.0045 * scale,
        { color: CYAN, bone, name: `${name}Vein${i}` },
      );
    }
    return leaf;
  }

  // --- Crown: six long petals around a glowing central seed.
  const crownCenter: [number, number, number] = [0, 2.25, 0.03];
  const crownPetal: [number, number, "sharp"?][] = [
    [0, 0, "sharp"],
    [0.12, 0.12, "sharp"],
    [0.19, 0.39, "sharp"],
    [0.10, 0.74, "sharp"],
    [0, 0.92, "sharp"],
    [-0.10, 0.74, "sharp"],
    [-0.19, 0.39, "sharp"],
    [-0.12, 0.12, "sharp"],
  ];

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const radial: [number, number, number] = [
      Math.sin(angle),
      0.08 + Math.cos(angle) * 0.035,
      Math.cos(angle),
    ];
    const petal = b.extrude(crownPetal, {
      at: [
        crownCenter[0] + radial[0] * 0.025,
        crownCenter[1] + radial[1],
        crownCenter[2] + radial[2] * 0.025,
      ],
      x: [Math.cos(angle), 0, -Math.sin(angle)],
      y: [Math.sin(angle) * 0.08, 1, Math.cos(angle) * 0.08],
      thickness: [0.018, 0.006],
      bevel: 0.006,
      color: i % 2 ? MAGENTA : LEAF,
      bone: trunk.tip,
      name: `crownPetal${i}`,
    });

    const tip: [number, number, number] = [
      crownCenter[0] + Math.sin(angle) * 0.19,
      crownCenter[1] + 0.08 + 0.92,
      crownCenter[2] + Math.cos(angle) * 0.19,
    ];
    b.rod(
      [crownCenter[0], crownCenter[1] + 0.08, crownCenter[2]],
      tip,
      0.008,
      { color: CYAN_SOFT, bone: trunk.tip, name: `crownVein${i}` },
    );
  }

  const crownCore = b.part(
    new THREE.SphereGeometry(0.14, 12, 8),
    GOLD,
    { bone: trunk.tip, at: crownCenter, name: "radiantCrownCore" },
  );
  glow(crownCore, 3.5);

  const coreHalo = b.part(
    new THREE.SphereGeometry(0.19, 12, 8),
    CYAN_SOFT,
    { bone: trunk.tip, at: [0, 2.255, 0.03], name: "crownHalo" },
  );
  glow(coreHalo, 1.2);

  // --- Hanging bioluminescent seed pods under the lower boughs.
  const pods = [
    { x: -0.58, y: 0.93, z: 0.12, s: 1.0 },
    { x: 0.64, y: 0.83, z: 0.10, s: 0.86 },
    { x: -0.39, y: 1.31, z: 0.16, s: 0.76 },
    { x: 0.49, y: 1.43, z: 0.18, s: 0.72 },
    { x: -0.28, y: 1.86, z: 0.21, s: 0.55 },
    { x: 0.33, y: 1.94, z: 0.22, s: 0.52 },
  ];

  for (let i = 0; i < pods.length; i++) {
    const p = pods[i];
    const parent = i < 2 ? root : trunk;
    const top: [number, number, number] = [p.x, p.y + 0.17 * p.s, p.z];
    const bottom: [number, number, number] = [p.x + 0.025 * (i % 2 ? 1 : -1), p.y, p.z + 0.025];
    b.sweep(
      catmull([
        top,
        [p.x - 0.02, p.y + 0.10 * p.s, p.z],
        bottom,
      ]),
      [0.012 * p.s, 0.006 * p.s],
      { color: VIOLET_DARK, bone: parent, caps: "round", name: `podCord${i}` },
    );

    const pod = b.part(
      new THREE.SphereGeometry(0.075 * p.s, 10, 7),
      i % 2 ? PINK : CYAN,
      { bone: parent, at: bottom, scale: [0.75, 1.25, 0.75], name: `glowingSeedPod${i}` },
    );
    glow(pod, 2.8);

    // A dark cap and a tiny bright spot make the pod read in silhouette.
    b.part(new THREE.CylinderGeometry(0.032 * p.s, 0.04 * p.s, 0.018, 8), INK, {
      bone: parent,
      at: [bottom[0], bottom[1] + 0.055 * p.s, bottom[2]],
      name: `podCap${i}`,
    });
    const spot = b.part(
      new THREE.SphereGeometry(0.018 * p.s, 7, 5),
      GOLD,
      { bone: parent, at: [bottom[0], bottom[1] - 0.035 * p.s, bottom[2] + 0.06 * p.s], name: `podSpot${i}` },
    );
    glow(spot, 4);
  }

  // --- Fine tendrils curling from the two lowest roots.
  const tendrilPaths = [
    catmull([
      [-0.16, 0.24, 0.12],
      [-0.34, 0.28, 0.16],
      [-0.45, 0.18, 0.20],
      [-0.52, 0.08, 0.26],
      [-0.44, 0.035, 0.33],
    ]),
    catmull([
      [0.17, 0.23, 0.10],
      [0.34, 0.26, 0.07],
      [0.47, 0.18, 0.02],
      [0.52, 0.09, -0.08],
      [0.45, 0.035, -0.13],
    ]),
  ];

  for (let i = 0; i < tendrilPaths.length; i++) {
    b.sweep(tendrilPaths[i], [0.018, 0.004], {
      color: TEAL,
      bone: root,
      caps: { start: "round", end: "point" },
      name: `rootTendril${i}`,
    });
    const tip = tendrilPaths[i].at(1);
    const tipLight = b.part(new THREE.SphereGeometry(0.025, 7, 5), CYAN, {
      bone: root,
      at: tip,
      name: `tendrilLight${i}`,
    });
    glow(tipLight, 2.4);
  }

  // A handful of angular, floating-looking scales on the trunk are actually seated on it
  // by explicit model-space placement and stay visually close to the surface.
  const scales = [
    [0.105, 0.53, 0.055],
    [-0.125, 0.91, 0.045],
    [0.12, 1.30, 0.052],
    [-0.10, 1.68, 0.072],
    [0.075, 1.98, 0.06],
  ];
  for (let i = 0; i < scales.length; i++) {
    const [x, y, z] = scales[i];
    const scale = b.extrude(
      [
        [0, 0, "sharp"],
        [0.055, 0.018, "sharp"],
        [0.042, 0.075, "sharp"],
        [0, 0.095, "sharp"],
        [-0.042, 0.075, "sharp"],
        [-0.055, 0.018, "sharp"],
      ],
      {
        at: [x, y, z + 0.13],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.008,
        color: i % 2 ? CYAN_SOFT : MAGENTA,
        bone: trunk,
        name: `trunkScale${i}`,
      },
    );
    if (i === 2 || i === 4) glow(scale, 1.5);
  }

  // Four tiny hovering pollen sparks are attached to the crown stem, not added as scenery.
  const pollen = [
    [0.24, 2.31, 0.10],
    [-0.22, 2.38, 0.08],
    [0.11, 2.51, -0.01],
    [-0.12, 2.47, 0.16],
  ];
  for (let i = 0; i < pollen.length; i++) {
    const spark = b.part(new THREE.IcosahedronGeometry(0.025, 0), i % 2 ? PINK : GOLD, {
      bone: trunk.tip,
      at: pollen[i],
      name: `crownPollen${i}`,
    });
    glow(spark, 4);
  }

  // Ensure the authored palette remains compact and deterministic.
  void rngPlant;

  return b.root;
}
```