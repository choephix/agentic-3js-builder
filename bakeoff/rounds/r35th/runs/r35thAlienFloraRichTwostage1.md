```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  rng,
} from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "bioluminescent-alien-plant",
  description:
    "A stylized Avatar-inspired alien plant with a luminous flower crown, broad turquoise leaves, curling tendrils, glowing seed pods, and a sculptural root rosette.",
};

export const REQUESTS = [
  {
    id: "crownHalo",
    kind: "add",
    part: "bioCore",
    what:
      "Add a floating Avatar-style halo above the flower core: a thin irregular ring with six small cyan and violet bioluminescent beads, held in place by barely visible translucent-looking dark teal stems. Use CYAN, LIME, VIOLET, and DEEP_TEAL.",
    at: [0, 3.02, 0.06],
    normal: [0, 1, 0],
    bone: null,
    room: [0.85, 0.32, 0.85],
  },
  {
    id: "leafVeinCrests",
    kind: "add",
    part: "leafBlade0",
    what:
      "Add raised glowing vein crests to the broad leaves: one bright cyan central vein and two branching lime veins per visible leaf, following the leaf planes and tapering toward the tips. Keep the shapes angular and low-poly.",
    at: [0.53, 1.38, 0.4],
    normal: [0.55, 0.35, 0.75],
    bone: null,
    room: [1.1, 0.75, 0.9],
  },
  {
    id: "hangingLanternPods",
    kind: "add",
    part: "tendril0",
    what:
      "Add three hanging alien seed lanterns beneath the front tendrils. Each should have a faceted violet shell, a cyan glowing inner slit, a short curled stem, and two tiny side fins. Use VIOLET, CYAN, MAGENTA, and INK.",
    at: [0.48, 1.22, 0.68],
    normal: [0.3, -0.4, 0.85],
    bone: null,
    room: [0.7, 0.7, 0.55],
  },
  {
    id: "rootRunes",
    kind: "add",
    part: "rootBase",
    what:
      "Add a ring of six small luminous rune stones around the root collar. They should be flat irregular plates with simple carved spiral marks, alternating CYAN and MAGENTA, seated on the upward-facing root shelf.",
    at: [0, 0.2, 0.42],
    normal: [0, 0.8, 0.6],
    bone: null,
    room: [0.9, 0.18, 0.42],
  },
  {
    id: "floatingSpores",
    kind: "add",
    part: "stem",
    what:
      "Add a sparse constellation of six floating spores around the upper stem: tiny faceted beads with short three-point star fins. Vary them between CYAN, LIME, and MAGENTA, with the largest two nearest the flower.",
    at: [0, 1.9, -0.08],
    normal: [0, 1, 0],
    bone: null,
    room: [1.35, 1.05, 1.15],
  },
  {
    id: "petalEye",
    kind: "add",
    part: "flowerCup",
    what:
      "Add a central eye to the front of the flower cup: a dark indigo almond-shaped inset surrounding a small cyan glowing pupil, with two short magenta lashes and a tiny lime highlight.",
    at: [0, 2.62, 0.3],
    normal: [0, 0.1, 1],
    bone: null,
    room: [0.34, 0.27, 0.1],
  },
  {
    id: "crownFilaments",
    kind: "add",
    part: "flowerCup",
    what:
      "Add twelve delicate crown filaments emerging between the petals. Make them short segmented cyan rods ending in tiny glowing violet beads, fanning upward and outward without exceeding the petal tips.",
    at: [0, 2.73, 0.08],
    normal: [0, 0.9, 0.1],
    bone: null,
    room: [0.75, 0.55, 0.75],
  },
  {
    id: "stemCollar",
    kind: "add",
    part: "stem",
    what:
      "Add three stepped luminous collars around the upper stem, built from thin dark-teal bands with inset cyan and lime bead segments. Keep them narrow and aligned to the stem, with the highest collar just below the flower.",
    at: [0, 2.18, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.28, 0.16, 0.28],
  },
  {
    id: "rootFrondTassels",
    kind: "add",
    part: "rootBase",
    what:
      "Add eight short root-frond tassels between the main roots. Each tassel has three chunky purple blades and a small cyan bead at its tip, like bioluminescent grass growing from the plant's collar.",
    at: [0.24, 0.12, -0.28],
    normal: [0, 1, -0.2],
    bone: null,
    room: [0.65, 0.35, 0.65],
  },
  {
    id: "leafEdgeFlares",
    kind: "add",
    part: "leafBlade0",
    what:
      "Add repeating angular edge flares along the largest leaves: small alternating MAGENTA and CYAN triangular fins seated on the leaf margins, pointing outward like an alien fern.",
    at: [0.78, 1.33, 0.4],
    normal: [0.65, 0.25, 0.7],
    bone: null,
    room: [1.15, 0.55, 0.95],
  },
  {
    id: "leafSurfacePattern",
    kind: "texture",
    part: "leafBlade0",
    what:
      "Paint all leafBlade parts with a bold Avatar-style radial vein pattern: deep teal base, turquoise lit planes, purple shadow wedges, and repeating thin CYAN and LIME bioluminescent veins that converge toward each leaf base. Keep broad clear areas between the veins.",
  },
  {
    id: "stemSurfacePattern",
    kind: "texture",
    part: "stem",
    what:
      "Paint the stem with horizontal organic banding in DEEP_TEAL, STEM_TEAL, and VIOLET, plus a sparse dotted bioluminescent pattern of CYAN and LIME marks. The pattern should follow the stalk's height and leave the glowing nodes readable.",
  },
  {
    id: "petalSurfacePattern",
    kind: "texture",
    part: "petal0",
    what:
      "Paint all petal parts with a rich Avatar flower gradient: VIOLET at the bases, MAGENTA through the middle, and hot pink-purple at the tips, with thin cyan edge lines and a few dark indigo triangular shadow facets.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const DEEP_TEAL = "#123d4a";
const ROOT_TEAL = "#175c63";
const STEM_TEAL = "#1d9f91";
const STEM_LIGHT = "#49d6a8";
const STEM_DARK = "#163e53";
const LEAF_TEAL = "#168b82";
const LEAF_LIGHT = "#36c8a2";
const LEAF_DARK = "#174d69";
const VIOLET = "#593a9b";
const VIOLET_DARK = "#2b245f";
const MAGENTA = "#b43a9e";
const MAGENTA_DARK = "#6d286f";
const CYAN = "#45f2e5";
const CYAN_DARK = "#159ea9";
const LIME = "#b9f25e";
const PINK = "#e45ab3";
const INK = "#17152f";
const ROOT_PURPLE = "#3d326e";

function unit(x: number, y: number, z: number): [number, number, number] {
  const v = new THREE.Vector3(x, y, z).normalize();
  return [v.x, v.y, v.z];
}

function scaled(
  v: readonly [number, number, number],
  s: number,
): [number, number, number] {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function addPoint(
  p: readonly [number, number, number],
  v: readonly [number, number, number],
  s = 1,
): [number, number, number] {
  return [p[0] + v[0] * s, p[1] + v[1] * s, p[2] + v[2] * s];
}

function buildLeafOutline(width: number, length: number) {
  return [
    [0, 0, "sharp"] as [number, number, "sharp"],
    [width * 0.62, length * 0.18, "sharp"] as [number, number, "sharp"],
    [width, length * 0.47, "sharp"] as [number, number, "sharp"],
    [width * 0.76, length * 0.72, "sharp"] as [number, number, "sharp"],
    [width * 0.28, length * 0.91, "sharp"] as [number, number, "sharp"],
    [0, length, "sharp"] as [number, number, "sharp"],
    [-width * 0.28, length * 0.91, "sharp"] as [number, number, "sharp"],
    [-width * 0.76, length * 0.72, "sharp"] as [number, number, "sharp"],
    [-width, length * 0.47, "sharp"] as [number, number, "sharp"],
    [-width * 0.62, length * 0.18, "sharp"] as [number, number, "sharp"],
  ];
}

function buildPetalOutline(width: number, length: number) {
  return [
    [0, 0, "sharp"] as [number, number, "sharp"],
    [width * 0.78, length * 0.18, "sharp"] as [number, number, "sharp"],
    [width, length * 0.48, "sharp"] as [number, number, "sharp"],
    [width * 0.65, length * 0.78, "sharp"] as [number, number, "sharp"],
    [0, length, "sharp"] as [number, number, "sharp"],
    [-width * 0.65, length * 0.78, "sharp"] as [number, number, "sharp"],
    [-width, length * 0.48, "sharp"] as [number, number, "sharp"],
    [-width * 0.78, length * 0.18, "sharp"] as [number, number, "sharp"],
  ];
}

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
  });

  const plantRng = rng(9147);

  const rootBase = b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.39, 0.045],
      [0.47, 0.13],
      [0.44, 0.25],
      [0.34, 0.36],
      [0.2, 0.42],
      [0, 0.44],
    ],
    {
      at: [0, 0.02, 0],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 0,
      color: ROOT_TEAL,
      name: "rootBase",
      group: "roots",
    },
  );

  const rootCrown = b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.38, 0.05],
      [0.34, 0.12],
      [0.23, 0.19],
      [0, 0.22],
    ],
    {
      at: [0, 0.36, 0],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 0,
      color: ROOT_PURPLE,
      name: "rootCrown",
      group: "roots",
    },
  );

  const rootDirections = [
    [1, 0, 0],
    [0.72, 0, 0.72],
    [0, 0, 1],
    [-0.72, 0, 0.72],
    [-1, 0, 0],
    [-0.72, 0, -0.72],
    [0, 0, -1],
    [0.72, 0, -0.72],
  ] as const;

  const rootSweeps: ReturnType<typeof b.sweep>[] = [];

  rootDirections.forEach((d, i) => {
    const side = unit(d[0], 0.16 + (i % 3) * 0.04, d[2]);
    const start: [number, number, number] = [
      d[0] * 0.17,
      0.24 + (i % 2) * 0.025,
      d[2] * 0.17,
    ];
    const middle = addPoint(start, side, 0.26 + (i % 3) * 0.035);
    const end: [number, number, number] = [
      d[0] * (0.84 + (i % 2) * 0.1),
      0.055,
      d[2] * (0.84 + (i % 2) * 0.1),
    ];

    const root = b.sweep(
      catmull([start, middle, end]),
      (t: number) => 0.105 * (1 - t) + 0.035,
      {
        color: i % 2 === 0 ? ROOT_TEAL : ROOT_PURPLE,
        section: { ngon: 6 },
        caps: "round",
        name: `rootArm${i}`,
        group: "roots",
      },
    );
    rootSweeps.push(root);

    b.sweep(
      catmull([
        addPoint(start, side, 0.04),
        addPoint(middle, side, 0.02),
        addPoint(end, side, -0.025),
      ]),
      [0.023, 0.006],
      {
        color: i % 2 === 0 ? STEM_LIGHT : MAGENTA_DARK,
        section: { ngon: 5 },
        caps: "round",
        name: `rootVein${i}`,
        group: "roots",
      },
    );

    const rootBead = b.part(
      new THREE.IcosahedronGeometry(0.047, 0),
      i % 2 === 0 ? CYAN_DARK : MAGENTA,
      {
        at: addPoint(end, side, -0.01),
        flat: true,
        name: `rootBead${i}`,
        group: "roots",
      },
    );
    if (i % 2 === 0) glow(rootBead, 1.3);
  });

  const stemPath = catmull([
    [0, 0.25, 0],
    [0.015, 0.73, 0.01],
    [-0.025, 1.18, -0.015],
    [0.025, 1.62, 0.015],
    [-0.015, 2.05, 0.01],
    [0, 2.47, 0.035],
    [0, 2.58, 0.05],
  ]);

  const stem = b.sweep(stemPath, (t: number) => {
    if (t < 0.2) return 0.16;
    if (t < 0.7) return 0.14 - t * 0.035;
    return 0.095 - (t - 0.7) * 0.11;
  }, {
    color: STEM_TEAL,
    bands: [
      [0.22, STEM_LIGHT],
      [0.45, STEM_TEAL],
      [0.68, STEM_DARK],
      [0.82, STEM_LIGHT],
      [1, STEM_TEAL],
    ],
    section: { ngon: 8 },
    caps: "round",
    name: "stem",
    group: "stem",
  });

  const stemRidge = b.sweep(
    catmull([
      [0.06, 0.28, 0.03],
      [0.075, 0.86, 0.045],
      [0.045, 1.48, 0.06],
      [0.055, 2.08, 0.08],
      [0.04, 2.48, 0.09],
    ]),
    [0.026, 0.009],
    {
      color: STEM_LIGHT,
      section: { ngon: 5 },
      caps: "round",
      name: "stemRidge",
      group: "stem",
    },
  );

  const stemShadowRidge = b.sweep(
    catmull([
      [-0.06, 0.29, -0.035],
      [-0.075, 0.9, -0.04],
      [-0.05, 1.55, -0.055],
      [-0.055, 2.1, -0.04],
      [-0.04, 2.48, -0.005],
    ]),
    [0.022, 0.007],
    {
      color: STEM_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: "stemShadowRidge",
      group: "stem",
    },
  );

  for (let i = 0; i < 10; i++) {
    const t = 0.12 + i * 0.085;
    const angle = i % 2 === 0 ? 180 : 0;
    const hit = stem.at(t, angle, 0.004);
    const node = b.stick(
      new THREE.IcosahedronGeometry(i % 3 === 0 ? 0.039 : 0.027, 0),
      i % 3 === 0 ? CYAN : LIME,
      hit,
      {
        embed: 0.3,
        name: `stemNode${i}`,
        group: "bioluminescence",
      },
    );
    glow(node, i % 3 === 0 ? 1.7 : 1.2);
  }

  const leafSpecs = [
    { a: 0.18, y: 0.72, len: 0.98, w: 0.29, c: LEAF_TEAL },
    { a: 0.92, y: 0.85, len: 0.88, w: 0.32, c: LEAF_LIGHT },
    { a: 1.68, y: 1.02, len: 1.06, w: 0.31, c: LEAF_TEAL },
    { a: 2.38, y: 1.2, len: 0.82, w: 0.3, c: LEAF_LIGHT },
    { a: 3.05, y: 1.42, len: 0.94, w: 0.28, c: LEAF_TEAL },
    { a: 3.74, y: 1.06, len: 1.03, w: 0.33, c: LEAF_LIGHT },
    { a: 4.45, y: 0.9, len: 0.92, w: 0.29, c: LEAF_TEAL },
    { a: 5.15, y: 1.28, len: 0.87, w: 0.31, c: LEAF_LIGHT },
    { a: 5.78, y: 1.52, len: 0.76, w: 0.27, c: LEAF_TEAL },
    { a: 2.86, y: 0.68, len: 0.75, w: 0.25, c: LEAF_DARK },
  ];

  const leafEnds: [number, number, number][] = [];

  leafSpecs.forEach((leaf, i) => {
    const radial: [number, number, number] = [
      Math.cos(leaf.a),
      0,
      Math.sin(leaf.a),
    ];
    const tangent: [number, number, number] = [
      -Math.sin(leaf.a),
      0,
      Math.cos(leaf.a),
    ];
    const leafAxis = unit(
      radial[0] * (0.78 + (i % 3) * 0.05),
      0.5 + (i % 2) * 0.08,
      radial[2] * (0.78 + (i % 3) * 0.05),
    );
    const base: [number, number, number] = [
      radial[0] * 0.09,
      leaf.y,
      radial[2] * 0.09,
    ];
    const tip = addPoint(base, leafAxis, leaf.len);
    leafEnds.push(tip);

    b.extrude(buildLeafOutline(leaf.w, leaf.len), {
      at: base,
      x: tangent,
      y: leafAxis,
      thickness: [0.026, 0.009],
      bevel: 0.006,
      smoothing: 0,
      color: leaf.c,
      name: `leafBlade${i}`,
      group: "leaves",
    });

    const undersideBase = addPoint(base, [0, -1, 0], 0.008);
    b.extrude(
      [
        [0, 0, "sharp"],
        [leaf.w * 0.45, leaf.len * 0.22, "sharp"],
        [leaf.w * 0.64, leaf.len * 0.55, "sharp"],
        [0, leaf.len * 0.8, "sharp"],
        [-leaf.w * 0.64, leaf.len * 0.55, "sharp"],
        [-leaf.w * 0.45, leaf.len * 0.22, "sharp"],
      ],
      {
        at: undersideBase,
        x: tangent,
        y: leafAxis,
        thickness: [0.008, 0.004],
        color: LEAF_DARK,
        name: `leafUnderside${i}`,
        group: "leaves",
      },
    );

    const centerPath = catmull([
      addPoint(base, leafAxis, 0.02),
      addPoint(base, leafAxis, leaf.len * 0.32),
      addPoint(base, leafAxis, leaf.len * 0.68),
      addPoint(tip, leafAxis, -0.025),
    ]);

    const centerVein = b.sweep(centerPath, [0.022, 0.006], {
      color: i % 2 === 0 ? CYAN_DARK : STEM_LIGHT,
      section: { ngon: 5 },
      caps: "round",
      name: `leafCenterVein${i}`,
      group: "leaves",
    });

    const veinA = addPoint(base, leafAxis, leaf.len * 0.38);
    const veinB = addPoint(base, leafAxis, leaf.len * 0.62);
    const edgeA1 = addPoint(addPoint(veinA, tangent, leaf.w * 0.63), leafAxis, 0.025);
    const edgeA2 = addPoint(addPoint(veinB, tangent, -leaf.w * 0.63), leafAxis, 0.04);

    b.rod(veinA, edgeA1, 0.009, {
      color: LIME,
      section: { ngon: 5 },
      caps: "round",
      name: `leafVeinA${i}`,
      group: "leaves",
    });
    b.rod(veinB, edgeA2, 0.009, {
      color: LIME,
      section: { ngon: 5 },
      caps: "round",
      name: `leafVeinB${i}`,
      group: "leaves",
    });

    if (i < 8) {
      const podAnchor = addPoint(tip, leafAxis, -0.06);
      const podPoint = addPoint(
        podAnchor,
        unit(-radial[0] * 0.3, -0.9, -radial[2] * 0.3),
        0.17 + (i % 3) * 0.035,
      );

      b.sweep(
        catmull([
          podAnchor,
          addPoint(podAnchor, [0, -1, 0], 0.07),
          podPoint,
        ]),
        [0.018, 0.006],
        {
          color: MAGENTA_DARK,
          section: { ngon: 5 },
          caps: "round",
          name: `leafPodStem${i}`,
          group: "pods",
        },
      );

      const pod = b.part(
        new THREE.IcosahedronGeometry(0.064 + (i % 2) * 0.012, 1),
        i % 2 === 0 ? VIOLET : MAGENTA,
        {
          at: podPoint,
          flat: true,
          name: `seedPod${i}`,
          group: "pods",
        },
      );
      glow(pod, 0.8);

      const slit = b.part(
        new THREE.SphereGeometry(0.026, 7, 4),
        CYAN,
        {
          at: addPoint(podPoint, unit(radial[0], 0.3, radial[2]), 0.052),
          scale: [0.45, 1.4, 0.45],
          flat: true,
          name: `seedPodLight${i}`,
          group: "bioluminescence",
        },
      );
      glow(slit, 1.8);
    }

    if (i === 1 || i === 4 || i === 7) {
      const tipFin = addPoint(tip, leafAxis, -0.05);
      b.spike(
        tipFin,
        tangent,
        0.12,
        0.022,
        {
          color: i === 4 ? MAGENTA : CYAN_DARK,
          section: { ngon: 5 },
          name: `leafTipFin${i}`,
          group: "leaves",
        },
      );
    }

    void centerVein;
  });

  const tendrilSpecs = [
    { a: 0.35, y: 1.0, len: 0.72, curl: 0.38 },
    { a: 1.18, y: 1.26, len: 0.68, curl: -0.32 },
    { a: 2.02, y: 0.98, len: 0.8, curl: 0.28 },
    { a: 2.84, y: 1.56, len: 0.63, curl: -0.36 },
    { a: 3.65, y: 1.18, len: 0.74, curl: 0.35 },
    { a: 4.48, y: 1.42, len: 0.7, curl: -0.33 },
    { a: 5.2, y: 1.02, len: 0.78, curl: 0.32 },
    { a: 5.85, y: 1.68, len: 0.6, curl: -0.3 },
  ];

  tendrilSpecs.forEach((spec, i) => {
    const radial = unit(Math.cos(spec.a), 0.08, Math.sin(spec.a));
    const tangent = unit(-Math.sin(spec.a), 0, Math.cos(spec.a));
    const base: [number, number, number] = [
      radial[0] * 0.12,
      spec.y,
      radial[2] * 0.12,
    ];
    const p1 = addPoint(base, radial, spec.len * 0.35);
    const p2 = addPoint(p1, radial, spec.len * 0.3);
    const p3 = addPoint(
      p2,
      unit(
        radial[0] + tangent[0] * spec.curl,
        -0.34,
        radial[2] + tangent[2] * spec.curl,
      ),
      spec.len * 0.28,
    );
    const tip = addPoint(
      p3,
      unit(
        radial[0] - tangent[0] * spec.curl * 0.65,
        -0.24,
        radial[2] - tangent[2] * spec.curl * 0.65,
      ),
      spec.len * 0.18,
    );

    const tendril = b.sweep(
      catmull([base, p1, p2, p3, tip]),
      (t: number) => 0.027 * (1 - t) + 0.006,
      {
        color: i % 2 === 0 ? MAGENTA_DARK : STEM_DARK,
        section: { ngon: 6 },
        caps: "round",
        name: `tendril${i}`,
        group: "tendrils",
      },
    );

    const tendrilRidge = b.sweep(
      catmull([
        addPoint(base, [0, 0.02, 0], 0),
        addPoint(p1, [0, 0.018, 0], 0),
        addPoint(p2, [0, 0.014, 0], 0),
        addPoint(tip, [0, 0.01, 0], 0),
      ]),
      [0.009, 0.003],
      {
        color: i % 2 === 0 ? CYAN_DARK : STEM_LIGHT,
        section: { ngon: 5 },
        caps: "round",
        name: `tendrilRidge${i}`,
        group: "tendrils",
      },
    );

    const bead = b.part(
      new THREE.IcosahedronGeometry(0.045 + (i % 3) * 0.008, 0),
      i % 2 === 0 ? CYAN : LIME,
      {
        at: tip,
        flat: true,
        name: `tendrilBead${i}`,
        group: "bioluminescence",
      },
    );
    glow(bead, 1.6);

    if (i === 0 || i === 3 || i === 6) {
      const mote = b.part(
        new THREE.TetrahedronGeometry(0.055, 0),
        MAGENTA,
        {
          at: addPoint(tip, unit(tangent[0], 0.45, tangent[2]), 0.07),
          flat: true,
          name: `tendrilMote${i}`,
          group: "bioluminescence",
        },
      );
      glow(mote, 1.25);
    }

    void tendril;
    void tendrilRidge;
  });

  const flowerCup = b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.22, 0.055],
      [0.25, 0.13],
      [0.22, 0.25],
      [0.15, 0.34],
      [0, 0.37],
    ],
    {
      at: [0, 2.42, 0.055],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: VIOLET_DARK,
      name: "flowerCup",
      group: "flower",
    },
  );

  const innerCup = b.lathe(
    [
      [0, 0],
      [0.105, 0],
      [0.17, 0.05],
      [0.16, 0.17],
      [0.1, 0.26],
      [0, 0.28],
    ],
    {
      at: [0, 2.5, 0.055],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: MAGENTA_DARK,
      name: "flowerInnerCup",
      group: "flower",
    },
  );

  const petalCount = 7;
  const petalLength = 0.61;

  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2 + 0.12;
    const radial = unit(Math.cos(a), 0.22, Math.sin(a));
    const tangent = unit(-Math.sin(a), 0, Math.cos(a));
    const base: [number, number, number] = [
      Math.cos(a) * 0.095,
      2.58,
      0.055 + Math.sin(a) * 0.095,
    ];
    const petalAxis = unit(
      radial[0] * (0.72 + (i % 2) * 0.06),
      0.8 + (i % 3) * 0.035,
      radial[2] * (0.72 + (i % 2) * 0.06),
    );

    b.extrude(buildPetalOutline(0.19 + (i % 2) * 0.025, petalLength), {
      at: base,
      x: tangent,
      y: petalAxis,
      thickness: [0.024, 0.007],
      bevel: 0.006,
      smoothing: 0,
      color: i % 2 === 0 ? MAGENTA : VIOLET,
      name: `petal${i}`,
      group: "flower",
    });

    const petalRidge = b.sweep(
      catmull([
        addPoint(base, petalAxis, 0.025),
        addPoint(base, petalAxis, petalLength * 0.33),
        addPoint(base, petalAxis, petalLength * 0.7),
        addPoint(base, petalAxis, petalLength * 0.94),
      ]),
      [0.018, 0.004],
      {
        color: i % 2 === 0 ? PINK : CYAN_DARK,
        section: { ngon: 5 },
        caps: "round",
        name: `petalRidge${i}`,
        group: "flower",
      },
    );

    const petalTip = addPoint(base, petalAxis, petalLength * 0.93);
    if (i % 2 === 0) {
      const tipLight = b.part(
        new THREE.IcosahedronGeometry(0.032, 0),
        CYAN,
        {
          at: petalTip,
          flat: true,
          name: `petalLight${i}`,
          group: "bioluminescence",
        },
      );
      glow(tipLight, 1.3);
    }

    void petalRidge;
  }

  const bioCore = b.part(
    new THREE.IcosahedronGeometry(0.145, 1),
    CYAN,
    {
      at: [0, 2.76, 0.09],
      flat: true,
      name: "bioCore",
      group: "bioluminescence",
    },
  );
  glow(bioCore, 2.2);

  const coreInner = b.part(
    new THREE.OctahedronGeometry(0.073, 0),
    LIME,
    {
      at: [0, 2.785, 0.18],
      flat: true,
      name: "bioCoreInner",
      group: "bioluminescence",
    },
  );
  glow(coreInner, 2.6);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    const radial = unit(Math.cos(a), 0.15, Math.sin(a));
    const filamentBase: [number, number, number] = [
      radial[0] * 0.08,
      2.72,
      0.1 + radial[2] * 0.08,
    ];
    const filamentTip = addPoint(filamentBase, radial, 0.23 + (i % 2) * 0.04);
    const liftedTip = addPoint(filamentTip, [0, 1, 0], 0.08);

    b.sweep(
      catmull([filamentBase, filamentTip, liftedTip]),
      [0.014, 0.004],
      {
        color: i % 2 === 0 ? CYAN_DARK : MAGENTA_DARK,
        section: { ngon: 5 },
        caps: "round",
        name: `stamen${i}`,
        group: "flower",
      },
    );

    const stamenGlow = b.part(
      new THREE.IcosahedronGeometry(0.038, 0),
      i % 2 === 0 ? LIME : CYAN,
      {
        at: liftedTip,
        flat: true,
        name: `stamenGlow${i}`,
        group: "bioluminescence",
      },
    );
    glow(stamenGlow, 1.8);
  }

  const crownRingPoints: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    crownRingPoints.push([
      Math.cos(a) * 0.19,
      2.86 + Math.sin(a * 2) * 0.018,
      0.12 + Math.sin(a) * 0.19,
    ]);
  }

  b.sweep(catmull(crownRingPoints, { closed: true }), 0.014, {
    color: CYAN_DARK,
    section: { ngon: 6 },
    caps: "none",
    name: "crownRing",
    group: "flower",
  });

  for (let i = 0; i < crownRingPoints.length; i++) {
    const bead = b.part(
      new THREE.IcosahedronGeometry(0.035, 0),
      i % 2 === 0 ? CYAN : MAGENTA,
      {
        at: crownRingPoints[i],
        flat: true,
        name: `crownBead${i}`,
        group: "bioluminescence",
      },
    );
    glow(bead, 1.7);
  }

  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.095;
    const side = i % 2 === 0 ? 1 : -1;
    const stemHit = stem.at(t, 90 * side, 0.008);
    const leafBud = b.stick(
      new THREE.TetrahedronGeometry(0.042 + (i % 3) * 0.008, 0),
      i % 2 === 0 ? LEAF_LIGHT : VIOLET,
      stemHit,
      {
        embed: 0.18,
        spin: i * 23,
        name: `stemBud${i}`,
        group: "stem",
      },
    );
    if (i % 2 === 0) glow(leafBud, 0.7);
  }

  const baseMotes = [
    [0.31, 0.22, 0.2],
    [-0.27, 0.27, 0.18],
    [0.18, 0.3, -0.32],
    [-0.2, 0.23, -0.3],
    [0.4, 0.19, -0.1],
    [-0.4, 0.2, -0.04],
  ] as const;

  baseMotes.forEach((p, i) => {
    const mote = b.part(
      new THREE.IcosahedronGeometry(0.035, 0),
      i % 2 === 0 ? CYAN : LIME,
      {
        at: p,
        flat: true,
        name: `rootMote${i}`,
        group: "bioluminescence",
      },
    );
    glow(mote, 1.2);
  });

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.35;
    const radial = unit(Math.cos(a), 0.12, Math.sin(a));
    const tasselBase: [number, number, number] = [
      radial[0] * 0.3,
      0.27,
      radial[2] * 0.3,
    ];
    const tasselTip = addPoint(tasselBase, radial, 0.16);

    for (let j = -1; j <= 1; j++) {
      const tangent = unit(-Math.sin(a), 0, Math.cos(a));
      const bladeBase = addPoint(tasselBase, tangent, j * 0.035);
      const bladeTip = addPoint(
        addPoint(tasselTip, tangent, j * 0.045),
        [0, 1, 0],
        0.06 + Math.abs(j) * 0.025,
      );

      b.spike(bladeBase, bladeTip, null, 0.022, {
        color: j === 0 ? ROOT_PURPLE : MAGENTA_DARK,
        section: { ngon: 5 },
        name: `rootTassel${i}_${j + 1}`,
        group: "roots",
      });
    }

    const tasselGlow = b.part(
      new THREE.IcosahedronGeometry(0.028, 0),
      CYAN,
      {
        at: tasselTip,
        flat: true,
        name: `rootTasselGlow${i}`,
        group: "bioluminescence",
      },
    );
    glow(tasselGlow, 1.5);
  }

  const topLeaf = leafEnds[8];
  const crownSpark = b.part(
    new THREE.TetrahedronGeometry(0.045, 0),
    LIME,
    {
      at: addPoint(topLeaf, [0, 1, 0], 0.12),
      flat: true,
      name: "topLeafSpark",
      group: "bioluminescence",
    },
  );
  glow(crownSpark, 1.5);

  for (const add of STAGE2) add(b);

  return b.root;
}
```