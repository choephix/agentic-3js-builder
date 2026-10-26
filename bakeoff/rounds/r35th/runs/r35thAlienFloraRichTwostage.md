<!-- call: stage1 -->

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

<!-- call: texture -->

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  paint,
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

const DEG = Math.PI / 180;

function fract(x: number) {
  return x - Math.floor(x);
}

// leafSurfacePattern: radial teal, purple, cyan, and lime veins converge toward each blade base.
const leafPaint = paint((_p, n, s) => {
  const u = s[0];
  const v = Math.max(0, s[1]);
  const t = Math.min(1, v / 1.08);

  let base =
    n.y < -0.22
      ? LEAF_DARK
      : n.y > 0.45
        ? LEAF_LIGHT
        : LEAF_TEAL;

  const shadowFacet =
    n.z < -0.35 &&
    fract(v * 4.4 + Math.abs(u) * 7.1) > 0.62 &&
    Math.abs(u) > 0.035 &&
    Math.abs(u) < 0.18;
  if (shadowFacet) base = VIOLET_DARK;

  const centerWidth = 0.009 + t * 0.014;
  if (Math.abs(u) < centerWidth) return CYAN;

  const fan = Math.abs(Math.sin((u / (v + 0.055)) * 8.4));
  if (v > 0.075 && fan < 0.075) {
    return Math.floor((u / (v + 0.055) + 8) * 2) % 3 === 0 ? LIME : CYAN_DARK;
  }

  const leftBranch = Math.abs(u + v * 0.34);
  const rightBranch = Math.abs(u - v * 0.34);
  if (leftBranch < 0.006 + t * 0.003 || rightBranch < 0.006 + t * 0.003) {
    return LIME;
  }

  const secondLeft = Math.abs(u + v * 0.57);
  const secondRight = Math.abs(u - v * 0.57);
  if (secondLeft < 0.0055 + t * 0.002 || secondRight < 0.0055 + t * 0.002) {
    return CYAN_DARK;
  }

  const impliedEdge = 0.285 * (0.92 - 0.25 * t);
  if (Math.abs(u) > impliedEdge * 0.88) return CYAN_DARK;

  return base;
});

// stemSurfacePattern: painted horizontal organic bands with restrained dotted bioluminescent marks.
const stemPaint = paint((_p, n, s) => {
  const t = Math.min(1, Math.max(0, s[0]));
  const deg = s[1];
  const band = Math.floor(t * 13);

  let base =
    band % 5 === 0
      ? DEEP_TEAL
      : band % 5 === 1
        ? STEM_TEAL
        : band % 5 === 2
          ? STEM_DARK
          : band % 5 === 3
            ? STEM_TEAL
            : VIOLET;

  if (n.y < -0.2) base = DEEP_TEAL;

  const angularCell = Math.floor((deg + 180) / 38);
  const dotCell = band * 37 + angularCell * 11;
  const dotValue = fract(Math.sin(dotCell * 12.9898 + 78.233) * 43758.5453);
  const around = fract((deg + 180) / 360);
  const narrowBand = fract(t * 19.0);

  if (dotValue > 0.91 && narrowBand > 0.27 && narrowBand < 0.73) {
    return (band + angularCell) % 3 === 0 ? LIME : CYAN;
  }

  if (Math.abs(n.y) > 0.72 && fract(t * 9.0) < 0.12) {
    return STEM_LIGHT;
  }

  if (around > 0.47 && around < 0.53 && band % 3 === 0) {
    return CYAN_DARK;
  }

  return base;
});

// petalSurfacePattern: a violet-to-magenta-to-hot-pink flower gradient with cyan rims and indigo facets.
const petalPaint = paint((_p, n, s) => {
  const u = s[0];
  const v = Math.max(0, s[1]);
  const t = Math.min(1, v / 0.61);

  let base =
    t < 0.2
      ? VIOLET
      : t < 0.7
        ? MAGENTA
        : PINK;

  if (n.y < -0.25) base = VIOLET_DARK;

  const widthAt = 0.19 * (0.82 + 0.22 * Math.sin(t * Math.PI));
  if (Math.abs(u) > widthAt * 0.84) return CYAN_DARK;

  const facet =
    (u < -0.055 && t > 0.22 && t < 0.58 && fract(t * 5.1 + u * 18) < 0.42) ||
    (u > 0.075 && t > 0.5 && fract(t * 4.1 - u * 13) > 0.73);

  if (facet) return VIOLET_DARK;

  const centralGlow = Math.abs(u) < 0.012 && t > 0.15;
  if (centralGlow) return MAGENTA;

  return base;
};

function unit(x: number, y: number, z: number): [number, number, number] {
  const v = new THREE.Vector3(x, y, z).normalize();
  return [v.x, v.y, v.z];
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

    b.sweep(
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

  const stem = b.sweep(
    stemPath,
    (t: number) => {
      if (t < 0.2) return 0.16;
      if (t < 0.7) return 0.14 - t * 0.035;
      return 0.095 - (t - 0.7) * 0.11;
    },
    {
      color: stemPaint,
      section: { ngon: 8 },
      caps: "round",
      name: "stem",
      group: "stem",
    },
  );

  b.sweep(
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

  b.sweep(
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
      color: leafPaint,
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

    b.sweep(centerPath, [0.022, 0.006], {
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
      b.spike(tipFin, tangent, 0.12, 0.022, {
        color: i === 4 ? MAGENTA : CYAN_DARK,
        section: { ngon: 5 },
        name: `leafTipFin${i}`,
        group: "leaves",
      });
    }
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

    b.sweep(
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

    b.sweep(
      catmull([
        base,
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

  b.lathe(
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
      color: petalPaint,
      name: `petal${i}`,
      group: "flower",
    });

    b.sweep(
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

<!-- call: add1 -->

```ts
import * as THREE from "three";
import {
  catmull,
  rng,
  type Builder,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCrownHalo(b: Builder) {
  const TAU = Math.PI * 2;
  const random = rng(21031);

  const normalize = (
    x: number,
    y: number,
    z: number,
  ): [number, number, number] => {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  };

  const add = (
    p: readonly [number, number, number],
    v: readonly [number, number, number],
    amount: number,
  ): [number, number, number] => [
    p[0] + v[0] * amount,
    p[1] + v[1] * amount,
    p[2] + v[2] * amount,
  ];

  const center: [number, number, number] = [0, 3.015, 0.075];

  // A slightly tilted oval gives the floating halo a readable front silhouette,
  // while the uneven spacing and height make it feel grown rather than manufactured.
  const planeY: [number, number, number] = [0, 0.88, 0.48];
  const haloPoints: [number, number, number][] = [];

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    const wobble = (random() - 0.5) * 0.018;
    const rx = 0.345 + wobble;
    const ry = 0.135 + (random() - 0.5) * 0.014;

    haloPoints.push([
      center[0] + Math.cos(a) * rx,
      center[1] + planeY[1] * Math.sin(a) * ry + (random() - 0.5) * 0.014,
      center[2] + planeY[2] * Math.sin(a) * ry,
    ]);
  }

  const haloPath = catmull(haloPoints, { closed: true });

  const halo = b.sweep(haloPath, 0.012, {
    color: DEEP_TEAL,
    bands: [
      [0.14, CYAN_DARK],
      [0.29, DEEP_TEAL],
      [0.43, CYAN_DARK],
      [0.58, VIOLET_DARK],
      [0.72, CYAN_DARK],
      [0.87, DEEP_TEAL],
      [1, CYAN_DARK],
    ],
    section: { ngon: 6 },
    caps: "none",
    name: "s21HaloRing",
    group: "stage2Halo",
  });
  glow(halo, 0.75);

  // Bright living filaments grow over three portions of the dark support ring.
  const accentA = b.sweep(haloPath.slice(0.015, 0.22), 0.0065, {
    color: CYAN,
    section: { ngon: 5 },
    caps: "round",
    name: "s21HaloCyanArc",
    group: "stage2Halo",
  });
  glow(accentA, 1.6);

  const accentB = b.sweep(haloPath.slice(0.39, 0.57), 0.006, {
    color: LIME,
    section: { ngon: 5 },
    caps: "round",
    name: "s21HaloLimeArc",
    group: "stage2Halo",
  });
  glow(accentB, 1.35);

  const accentC = b.sweep(haloPath.slice(0.73, 0.9), 0.0065, {
    color: MAGENTA,
    section: { ngon: 5 },
    caps: "round",
    name: "s21HaloVioletArc",
    group: "stage2Halo",
  });
  glow(accentC, 1.25);

  const haloNormal = normalize(0, -planeY[2], planeY[1]);

  // Six very thin organic supports converge into the luminous flower crown.
  const anchor: [number, number, number] = [0, 2.805, 0.085];

  for (let i = 0; i < 6; i++) {
    const pointIndex = i * 2;
    const beadAt = haloPoints[pointIndex];
    const radial = normalize(
      beadAt[0] - center[0],
      (beadAt[1] - center[1]) * 0.8,
      beadAt[2] - center[2],
    );

    const stemStart: [number, number, number] = [
      anchor[0] + radial[0] * 0.035,
      anchor[1] + (i % 2) * 0.018,
      anchor[2] + radial[2] * 0.035,
    ];

    const control: [number, number, number] = [
      radial[0] * 0.11,
      2.89 + (i % 3) * 0.018,
      0.09 + radial[2] * 0.11,
    ];

    const support = b.sweep(
      catmull([stemStart, control, beadAt]),
      [0.009, 0.0028],
      {
        color: i % 2 === 0 ? STEM_DARK : DEEP_TEAL,
        section: { ngon: 5 },
        caps: "round",
        name: `s21HaloStem${i}`,
        group: "stage2Halo",
      },
    );

    // A barely brighter ridge on each support suggests translucent sap inside.
    const ridgeStart = add(stemStart, haloNormal, 0.006);
    const ridgeControl = add(control, haloNormal, 0.006);
    const ridgeEnd = add(beadAt, haloNormal, 0.006);

    b.sweep(
      catmull([ridgeStart, ridgeControl, ridgeEnd]),
      [0.0028, 0.0008],
      {
        color: i % 2 === 0 ? CYAN_DARK : STEM_TEAL,
        section: { ngon: 5 },
        caps: "round",
        name: `s21HaloSap${i}`,
        group: "stage2Halo",
      },
    );

    void support;
  }

  // Faceted living beads sit on every other halo knot.
  const beadColors = [CYAN, VIOLET, CYAN, LIME, VIOLET, CYAN] as const;

  for (let i = 0; i < 6; i++) {
    const beadAt = haloPoints[i * 2];
    const color = beadColors[i];
    const radial = normalize(
      beadAt[0] - center[0],
      beadAt[1] - center[1],
      beadAt[2] - center[2],
    );
    const tangent = normalize(-radial[2], 0, radial[0]);

    const shell = b.part(
      new THREE.IcosahedronGeometry(0.039 + (i % 2) * 0.005, 1),
      color === LIME ? CYAN_DARK : color,
      {
        at: beadAt,
        flat: true,
        name: `s21HaloBead${i}`,
        group: "stage2Halo",
      },
    );
    glow(shell, color === VIOLET ? 1.3 : 1.8);

    const inner = b.part(
      new THREE.OctahedronGeometry(0.014, 0),
      color === VIOLET ? CYAN : LIME,
      {
        at: add(beadAt, haloNormal, 0.033),
        flat: true,
        name: `s21HaloBeadCore${i}`,
        group: "stage2Halo",
      },
    );
    glow(inner, 2.3);

    // Two tiny fins make each bead read as an alien seed rather than a round lamp.
    b.spike(beadAt, radial, 0.038, 0.006, {
      color: color === VIOLET ? MAGENTA : LIME,
      section: { ngon: 5 },
      caps: "point",
      name: `s21HaloFinRadial${i}`,
      group: "stage2Halo",
    });

    b.spike(beadAt, tangent, 0.027, 0.005, {
      color: color === CYAN ? CYAN_DARK : CYAN,
      section: { ngon: 5 },
      caps: "point",
      name: `s21HaloFinTangent${i}`,
      group: "stage2Halo",
    });
  }

  // Three small drifting motes echo the halo's light and soften its silhouette.
  const motes: [
    [number, number, number],
    number,
    string
  ][] = [
    [[-0.405, 3.045, 0.095], 0.022, CYAN],
    [[0.392, 3.11, 0.11], 0.018, LIME],
    [[0.045, 2.887, 0.16], 0.02, MAGENTA],
  ];

  motes.forEach(([at, radius, color], i) => {
    const mote = b.part(
      new THREE.TetrahedronGeometry(radius, 0),
      color,
      {
        at,
        flat: true,
        name: `s21HaloMote${i}`,
        group: "stage2Halo",
      },
    );
    glow(mote, 1.7);
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { polyline, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addLeafVeinCrests(b: Builder) {
  const add = (
    p: THREE.Vector3,
    v: THREE.Vector3,
    amount = 1,
  ) => p.clone().addScaledVector(v, amount);

  const makeLeafVeins = (
    index: number,
    angle: number,
    y: number,
    length: number,
    width: number,
    lightLeaf: boolean,
  ) => {
    const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));

    const leafAxis = new THREE.Vector3(
      radial.x * (0.78 + (index % 3) * 0.05),
      0.5 + (index % 2) * 0.08,
      radial.z * (0.78 + (index % 3) * 0.05),
    ).normalize();

    const surfaceNormal = new THREE.Vector3()
      .crossVectors(tangent, leafAxis)
      .normalize();

    if (surfaceNormal.y < 0) surfaceNormal.negate();

    const base = new THREE.Vector3(
      radial.x * 0.09,
      y,
      radial.z * 0.09,
    );

    const halfWidthAt = (t: number) =>
      width * (0.98 - 0.43 * Math.min(Math.max(t, 0), 1));

    const point = (t: number, lateral = 0, lift = 0.019) => {
      const p = base.clone().addScaledVector(leafAxis, length * t);
      p.addScaledVector(tangent, halfWidthAt(t) * lateral);
      p.addScaledVector(surfaceNormal, lift);
      return p;
    };

    const center = b.sweep(
      polyline([
        point(0.035),
        point(0.24),
        point(0.5),
        point(0.76),
        point(0.955),
      ]),
      [0.019, 0.004],
      {
        color: CYAN,
        section: { ngon: 5 },
        caps: "round",
        name: `s2_leafCenterVein${index}`,
        group: "stage2-leaf-veins",
      },
    );
    glow(center, 1.7);

    const branchA = b.sweep(
      polyline([
        point(0.29, 0),
        point(0.4, 0.31),
        point(0.57, 0.83),
      ]),
      [0.009, 0.0025],
      {
        color: LIME,
        section: { ngon: 5 },
        caps: "round",
        name: `s2_leafBranchA${index}`,
        group: "stage2-leaf-veins",
      },
    );
    glow(branchA, 1.25);

    const branchB = b.sweep(
      polyline([
        point(0.55, 0),
        point(0.66, -0.3),
        point(0.84, -0.74),
      ]),
      [0.008, 0.002],
      {
        color: lightLeaf ? CYAN : LIME,
        section: { ngon: 5 },
        caps: "round",
        name: `s2_leafBranchB${index}`,
        group: "stage2-leaf-veins",
      },
    );
    glow(branchB, lightLeaf ? 1.35 : 1.15);

    const junction = b.part(
      new THREE.IcosahedronGeometry(0.022, 0),
      lightLeaf ? LIME : CYAN,
      {
        at: point(0.43, 0, 0.024),
        flat: true,
        name: `s2_leafVeinJunction${index}`,
        group: "stage2-leaf-veins",
      },
    );
    glow(junction, 1.8);

    // Two tiny terminal pearls make the tapered veins read as living, raised structures.
    for (const [name, t, side] of [
      ["A", 0.57, 0.83],
      ["B", 0.84, -0.74],
    ] as const) {
      const pearl = b.part(
        new THREE.IcosahedronGeometry(0.014, 0),
        name === "A" ? CYAN : LIME,
        {
          at: point(t, side, 0.024),
          flat: true,
          name: `s2_leafPearl${index}${name}`,
          group: "stage2-leaf-veins",
        },
      );
      glow(pearl, 1.45);
    }
  };

  const leafSpecs = [
    { a: 0.18, y: 0.72, len: 0.98, w: 0.29, light: false },
    { a: 0.92, y: 0.85, len: 0.88, w: 0.32, light: true },
    { a: 1.68, y: 1.02, len: 1.06, w: 0.31, light: false },
    { a: 2.38, y: 1.2, len: 0.82, w: 0.3, light: true },
    { a: 3.05, y: 1.42, len: 0.94, w: 0.28, light: false },
    { a: 3.74, y: 1.06, len: 1.03, w: 0.33, light: true },
    { a: 4.45, y: 0.9, len: 0.92, w: 0.29, light: false },
    { a: 5.15, y: 1.28, len: 0.87, w: 0.31, light: true },
    { a: 5.78, y: 1.52, len: 0.76, w: 0.27, light: false },
    { a: 2.86, y: 0.68, len: 0.75, w: 0.25, light: true },
  ];

  leafSpecs.forEach((leaf, i) =>
    makeLeafVeins(i, leaf.a, leaf.y, leaf.len, leaf.w, leaf.light),
  );

  const attachment = new THREE.Vector3(0.48, 1.22, 0.68);

  const lanterns = [
    {
      attach: attachment.clone(),
      stem: [
        attachment.clone(),
        new THREE.Vector3(0.405, 1.34, 0.705),
        new THREE.Vector3(0.315, 1.28, 0.755),
        new THREE.Vector3(0.28, 1.08, 0.735),
      ],
      pod: new THREE.Vector3(0.28, 0.99, 0.735),
      scale: [0.92, 1.12, 0.86] as [number, number, number],
    },
    {
      attach: attachment.clone(),
      stem: [
        attachment.clone(),
        new THREE.Vector3(0.48, 1.37, 0.715),
        new THREE.Vector3(0.505, 1.27, 0.79),
        new THREE.Vector3(0.49, 1.08, 0.805),
      ],
      pod: new THREE.Vector3(0.49, 0.99, 0.805),
      scale: [1.02, 1.2, 0.9] as [number, number, number],
    },
    {
      attach: attachment.clone(),
      stem: [
        attachment.clone(),
        new THREE.Vector3(0.565, 1.33, 0.69),
        new THREE.Vector3(0.66, 1.26, 0.735),
        new THREE.Vector3(0.685, 1.1, 0.705),
      ],
      pod: new THREE.Vector3(0.685, 1.01, 0.705),
      scale: [0.9, 1.06, 0.82] as [number, number, number],
    },
  ];

  lanterns.forEach((lantern, i) => {
    const pod = lantern.pod;

    const stem = b.sweep(polyline(lantern.stem), [0.018, 0.006], {
      color: i === 1 ? VIOLET_DARK : INK,
      section: { ngon: 6 },
      caps: "round",
      name: `s2_lanternStem${i}`,
      group: "stage2-lanterns",
    });

    const stemRidgePoints = lantern.stem
      .slice(0, 3)
      .map((p, j) => p.clone().add(new THREE.Vector3(0, 0.012 + j * 0.002, 0.008)));

    const stemRidge = b.sweep(polyline(stemRidgePoints), [0.007, 0.002], {
      color: CYAN_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: `s2_lanternStemRidge${i}`,
      group: "stage2-lanterns",
    });
    glow(stemRidge, 1.15);
    void stem;

    const shell = b.part(
      new THREE.IcosahedronGeometry(0.092, 1),
      i === 1 ? VIOLET : MAGENTA_DARK,
      {
        at: pod,
        scale: lantern.scale,
        flat: true,
        name: `s2_lanternShell${i}`,
        group: "stage2-lanterns",
      },
    );
    glow(shell, 0.45);

    const lowerShell = b.part(
      new THREE.TetrahedronGeometry(0.054, 0),
      VIOLET_DARK,
      {
        at: pod.clone().add(new THREE.Vector3(0, -0.085, 0)),
        scale: [1.05, 0.7, 0.95],
        flat: true,
        name: `s2_lanternLowerFacet${i}`,
        group: "stage2-lanterns",
      },
    );
    void lowerShell;

    const band = b.part(
      new THREE.TorusGeometry(0.073, 0.008, 5, 10),
      i === 1 ? CYAN_DARK : MAGENTA,
      {
        at: pod.clone().add(new THREE.Vector3(0, 0.012, 0)),
        scale: [1, lantern.scale[1] * 0.82, 1],
        rotation: [0, 0, 0],
        flat: true,
        name: `s2_lanternBand${i}`,
        group: "stage2-lanterns",
      },
    );
    glow(band, 0.8);

    const aperture = b.part(
      new THREE.CircleGeometry(0.043, 9),
      INK,
      {
        at: pod.clone().add(new THREE.Vector3(0, 0.018, 0.078)),
        scale: [0.58, 1.38, 1],
        dir: [0, 0, 1],
        axis: "z",
        flat: true,
        name: `s2_lanternAperture${i}`,
        group: "stage2-lanterns",
      },
    );
    void aperture;

    const slitRim = b.part(
      new THREE.RingGeometry(0.034, 0.049, 9),
      MAGENTA,
      {
        at: pod.clone().add(new THREE.Vector3(0, 0.018, 0.081)),
        scale: [0.58, 1.38, 1],
        dir: [0, 0, 1],
        axis: "z",
        flat: true,
        name: `s2_lanternSlitRim${i}`,
        group: "stage2-lanterns",
      },
    );
    void slitRim;

    const slit = b.part(
      new THREE.SphereGeometry(0.034, 8, 5),
      CYAN,
      {
        at: pod.clone().add(new THREE.Vector3(0, 0.018, 0.086)),
        scale: [0.34, 1.45, 0.22],
        flat: true,
        name: `s2_lanternSlit${i}`,
        group: "stage2-lanterns",
      },
    );
    glow(slit, 2.4);

    for (const side of [-1, 1] as const) {
      const fin = b.extrude(
        [
          [0, -0.035, "sharp"],
          [0.05, -0.018, "sharp"],
          [0.073, 0.018, "sharp"],
          [0.018, 0.047, "sharp"],
        ],
        {
          at: pod.clone().add(new THREE.Vector3(side * 0.062, -0.035, 0.025)),
          x: [side, 0, 0],
          y: [0, 1, 0],
          thickness: 0.009,
          bevel: 0.002,
          smoothing: 0,
          color: i === 1 ? CYAN_DARK : MAGENTA,
          name: `s2_lanternFin${i}_${side > 0 ? "L" : "R"}`,
          group: "stage2-lanterns",
        },
      );
      if (i === 1) glow(fin, 0.75);
    }

    const stemNode = b.part(
      new THREE.IcosahedronGeometry(0.022, 0),
      i % 2 === 0 ? LIME : CYAN,
      {
        at: lantern.stem[2],
        flat: true,
        name: `s2_lanternStemNode${i}`,
        group: "stage2-lanterns",
      },
    );
    glow(stemNode, 1.4);
  });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { catmull, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRootRunes(b: Builder) {
  const surface = b.surface(b.root);

  const v = (p: readonly [number, number, number]) =>
    new THREE.Vector3(p[0], p[1], p[2]);

  const pointOnPlane = (
    center: THREE.Vector3,
    x: THREE.Vector3,
    y: THREE.Vector3,
    normal: THREE.Vector3,
    px: number,
    py: number,
    lift: number,
  ) =>
    center
      .clone()
      .addScaledVector(x, px)
      .addScaledVector(y, py)
      .addScaledVector(normal, lift);

  const planeBasis = (normalInput: THREE.Vector3) => {
    const normal = normalInput.clone().normalize();
    let x = new THREE.Vector3(0, 1, 0).cross(normal);
    if (x.lengthSq() < 0.01) x = new THREE.Vector3(1, 0, 0).cross(normal);
    x.normalize();
    const y = normal.clone().cross(x).normalize();
    return { normal, x, y };
  };

  const runeOutline: [number, number, "sharp"][] = [
    [-0.072, -0.022, "sharp"],
    [-0.045, -0.061, "sharp"],
    [0.027, -0.067, "sharp"],
    [0.076, -0.014, "sharp"],
    [0.056, 0.052, "sharp"],
    [-0.012, 0.073, "sharp"],
    [-0.073, 0.032, "sharp"],
  ];

  const runePath = [
    [-0.033, -0.026],
    [0.022, -0.035],
    [0.043, 0.005],
    [0.024, 0.038],
    [-0.022, 0.043],
    [-0.039, 0.012],
    [-0.012, -0.004],
    [0.018, 0.004],
  ];

  // The provided room is on the front shelf of the root collar. The six stones
  // form a visible oval ring there rather than disappearing behind the plant.
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const intended = new THREE.Vector3(
      Math.cos(angle) * 0.31,
      0.225 + (i % 2) * 0.008,
      0.39 + Math.sin(angle) * 0.105,
    );

    const hit = surface.nearest(intended);
    const { normal, x, y } = planeBasis(hit.n);
    const center = hit.at.clone().addScaledVector(normal, 0.008);
    const stoneColor = i % 2 === 0 ? CYAN : MAGENTA;
    const edgeColor = i % 2 === 0 ? CYAN_DARK : MAGENTA_DARK;

    const plate = b.extrude(runeOutline, {
      at: center,
      x,
      y,
      thickness: [0.016, 0.009],
      bevel: 0.005,
      smoothing: 0,
      color: stoneColor,
      name: `s23RuneStone${i}`,
      group: "stage2RootRunes",
    });
    glow(plate, 1.15);

    const rimPoints = runeOutline.map(([px, py]) =>
      pointOnPlane(center, x, y, normal, px, py, 0.018),
    );
    const rim = b.sweep(catmull(rimPoints, { closed: true }), 0.0032, {
      color: edgeColor,
      section: { ngon: 5 },
      caps: "none",
      name: `s23RuneRim${i}`,
      group: "stage2RootRunes",
    });
    glow(rim, 0.8);

    const markPoints = runePath.map(([px, py]) =>
      pointOnPlane(center, x, y, normal, px, py, 0.021),
    );
    b.sweep(catmull(markPoints), [0.006, 0.003], {
      color: INK,
      section: { ngon: 5 },
      caps: "round",
      name: `s23RuneSpiral${i}`,
      group: "stage2RootRunes",
    });

    const runeDot = b.part(
      new THREE.IcosahedronGeometry(0.012, 0),
      i % 2 === 0 ? LIME : CYAN,
      {
        at: pointOnPlane(center, x, y, normal, 0.003, 0.003, 0.024),
        flat: true,
        name: `s23RuneSpark${i}`,
        group: "stage2RootRunes",
      },
    );
    glow(runeDot, 2.1);

    const tinyRayA = pointOnPlane(center, x, y, normal, -0.055, 0.0, 0.021);
    const tinyRayB = pointOnPlane(center, x, y, normal, -0.042, 0.0, 0.021);
    b.rod(tinyRayA, tinyRayB, 0.0025, {
      color: edgeColor,
      caps: "round",
      name: `s23RuneNotch${i}`,
      group: "stage2RootRunes",
    });
  }

  const spores = [
    {
      anchor: [0.055, 1.63, 0.018] as [number, number, number],
      at: [0.36, 1.66, 0.22] as [number, number, number],
      size: 0.052,
      color: CYAN,
      core: LIME,
    },
    {
      anchor: [-0.05, 1.78, 0.015] as [number, number, number],
      at: [-0.43, 1.83, -0.12] as [number, number, number],
      size: 0.058,
      color: LIME,
      core: CYAN,
    },
    {
      anchor: [0.048, 1.94, 0.025] as [number, number, number],
      at: [0.4, 2.0, -0.27] as [number, number, number],
      size: 0.064,
      color: MAGENTA,
      core: CYAN,
    },
    {
      anchor: [-0.045, 2.08, 0.035] as [number, number, number],
      at: [-0.42, 2.17, 0.14] as [number, number, number],
      size: 0.068,
      color: CYAN,
      core: LIME,
    },
    {
      anchor: [0.03, 2.24, 0.05] as [number, number, number],
      at: [0.28, 2.38, 0.29] as [number, number, number],
      size: 0.084,
      color: LIME,
      core: CYAN,
    },
    {
      anchor: [-0.024, 2.36, 0.06] as [number, number, number],
      at: [-0.26, 2.47, -0.25] as [number, number, number],
      size: 0.094,
      color: MAGENTA,
      core: CYAN,
    },
  ];

  for (let i = 0; i < spores.length; i++) {
    const spore = spores[i];
    const attachment = surface.nearest(v(spore.anchor));
    const base = attachment.at.clone().addScaledVector(attachment.n, 0.004);
    const target = v(spore.at);
    const halfway = base
      .clone()
      .lerp(target, 0.47)
      .add(
        new THREE.Vector3(
          i % 2 === 0 ? 0.035 : -0.035,
          0.045 + (i % 3) * 0.018,
          i % 3 === 0 ? 0.028 : -0.022,
        ),
      );

    const filament = b.sweep(catmull([base, halfway, target]), [
      0.011,
      0.006,
      0.0025,
    ], {
      color: i % 2 === 0 ? STEM_DARK : MAGENTA_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: `s23SporeFilament${i}`,
      group: "stage2FloatingSpores",
    });

    if (i % 2 === 0) glow(filament, 0.42);

    const filamentPulse = b.part(
      new THREE.IcosahedronGeometry(0.014 + (i % 2) * 0.004, 0),
      i % 3 === 0 ? CYAN : LIME,
      {
        at: halfway,
        flat: true,
        name: `s23SporePulse${i}`,
        group: "stage2FloatingSpores",
      },
    );
    glow(filamentPulse, 1.1);

    const bead = b.part(
      new THREE.IcosahedronGeometry(spore.size, 1),
      spore.color,
      {
        at: target,
        flat: true,
        name: `s23FloatingSpore${i}`,
        group: "stage2FloatingSpores",
      },
    );
    glow(bead, 1.35 + i * 0.08);

    const coreDirection = new THREE.Vector3(0, 0.18, 1).normalize();
    const core = b.part(
      new THREE.OctahedronGeometry(spore.size * 0.34, 0),
      spore.core,
      {
        at: target.clone().addScaledVector(coreDirection, spore.size * 0.78),
        flat: true,
        name: `s23SporeCore${i}`,
        group: "stage2FloatingSpores",
      },
    );
    glow(core, 2.0);

    const finPalette = [CYAN_DARK, LIME, MAGENTA_DARK] as const;
    for (let j = 0; j < 3; j++) {
      const a = (j / 3) * Math.PI * 2 + i * 0.19;
      const direction = new THREE.Vector3(
        Math.cos(a),
        0.12 + (j === 1 ? 0.08 : 0),
        Math.sin(a),
      ).normalize();

      const finBase = target
        .clone()
        .addScaledVector(direction, spore.size * 0.6);
      const finTip = target
        .clone()
        .addScaledVector(direction, spore.size * (1.55 + (i % 2) * 0.16))
        .add(
          new THREE.Vector3(
            0,
            j === 1 ? spore.size * 0.22 : -spore.size * 0.03,
            0,
          ),
        );

      const fin = b.spike(finBase, finTip, null, spore.size * 0.16, {
        color: finPalette[(i + j) % finPalette.length],
        section: { ngon: 5 },
        caps: { start: "round", end: "point" },
        name: `s23SporeFin${i}_${j}`,
        group: "stage2FloatingSpores",
      });
      glow(fin, 0.95);
    }

    const collarPath: [number, number, number][] = [];
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2;
      collarPath.push([
        target.x + Math.cos(a) * spore.size * 0.78,
        target.y + Math.sin(a) * spore.size * 0.22,
        target.z + Math.sin(a) * spore.size * 0.78,
      ]);
    }

    const collar = b.sweep(catmull(collarPath, { closed: true }), 0.0022, {
      color: i % 2 === 0 ? CYAN_DARK : MAGENTA,
      caps: "none",
      name: `s23SporeCollar${i}`,
      group: "stage2FloatingSpores",
    });
    glow(collar, 0.7);
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { bezier, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addPetalEye(b: Builder) {
  const center = new THREE.Vector3(0, 2.62, 0.3);
  const normal = new THREE.Vector3(0, 0.1, 1).normalize();

  // Keep the eye's drawing plane tangent to the flower cup while preserving
  // a readable upright orientation.
  const xAxis = new THREE.Vector3(1, 0, 0);
  const yAxis = new THREE.Vector3(0, 1, 0)
    .addScaledVector(normal, -normal.y)
    .normalize();

  const point = (x: number, y: number, lift = 0) =>
    center
      .clone()
      .addScaledVector(xAxis, x)
      .addScaledVector(yAxis, y)
      .addScaledVector(normal, lift);

  const almond = (
    width: number,
    height: number,
    at: THREE.Vector3,
    color: string,
    name: string,
    thickness: number,
    bevel = 0.003,
  ) => {
    const outline: [number, number, "sharp"][] = [
      [0, height, "sharp"],
      [width * 0.42, height * 0.84, "sharp"],
      [width, height * 0.28, "sharp"],
      [width * 0.72, -height * 0.18, "sharp"],
      [0, -height * 0.48, "sharp"],
      [-width * 0.72, -height * 0.18, "sharp"],
      [-width, height * 0.28, "sharp"],
      [-width * 0.42, height * 0.84, "sharp"],
    ];

    return b.extrude(outline, {
      at,
      x: xAxis,
      y: yAxis,
      thickness,
      bevel,
      smoothing: 1,
      color,
      name,
      group: "petalEye",
    });
  };

  const ellipse = (
    width: number,
    height: number,
    at: THREE.Vector3,
    color: string,
    name: string,
    thickness: number,
  ) => {
    const outline: [number, number, "sharp"][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      outline.push([
        Math.cos(a) * width,
        Math.sin(a) * height,
        "sharp",
      ]);
    }

    return b.extrude(outline, {
      at,
      x: xAxis,
      y: yAxis,
      thickness,
      bevel: Math.min(0.0025, thickness * 0.28),
      smoothing: 1,
      color,
      name,
      group: "petalEye",
    });
  };

  // A thick indigo socket makes the eye read as an inset rather than a flat
  // sticker on the petal.
  almond(
    0.135,
    0.085,
    point(0, 0, -0.006),
    VIOLET_DARK,
    "petalEyeSocket",
    0.018,
    0.006,
  );

  // Raised inner rim, slightly smaller and warmer than the socket.
  almond(
    0.103,
    0.064,
    point(0, 0.003, 0.006),
    MAGENTA_DARK,
    "petalEyeInnerRim",
    0.012,
    0.003,
  );

  // A narrow turquoise iris plate gives the cyan pupil a strong silhouette.
  almond(
    0.061,
    0.053,
    point(0, 0.006, 0.014),
    CYAN_DARK,
    "petalEyeIris",
    0.009,
    0.002,
  );

  const pupil = ellipse(
    0.026,
    0.043,
    point(0, 0.008, 0.022),
    CYAN,
    "petalEyeGlowingPupil",
    0.008,
  );
  glow(pupil, 2.8);

  // A tiny four-point lime glint is built as a raised diamond so it catches
  // light as geometry as well as reading in the silhouette.
  const glint = b.extrude(
    [
      [0, 0.015, "sharp"],
      [0.008, 0, "sharp"],
      [0, -0.015, "sharp"],
      [-0.008, 0, "sharp"],
    ],
    {
      at: point(-0.011, 0.025, 0.032),
      x: xAxis,
      y: yAxis,
      thickness: 0.006,
      bevel: 0.001,
      color: LIME,
      name: "petalEyeLimeGlint",
      group: "petalEye",
    },
  );
  glow(glint, 2.1);

  // Upper lid line: a thin cool ridge following the almond's expressive arc.
  b.sweep(
    bezier(
      point(-0.108, 0.044, 0.027),
      point(-0.055, 0.078, 0.028),
      point(0.055, 0.078, 0.028),
      point(0.108, 0.044, 0.027),
    ),
    [0.007, 0.003],
    {
      color: CYAN_DARK,
      section: { ngon: 5 },
      caps: "round",
      name: "petalEyeUpperLid",
      group: "petalEye",
    },
  );

  // Two short magenta lashes flare from the outer upper corners.
  const lashData = [
    {
      side: -1,
      start: point(-0.101, 0.044, 0.031),
      control: point(-0.124, 0.057, 0.032),
      tip: point(-0.148, 0.083, 0.032),
    },
    {
      side: 1,
      start: point(0.101, 0.044, 0.031),
      control: point(0.124, 0.057, 0.032),
      tip: point(0.148, 0.083, 0.032),
    },
  ];

  for (const lash of lashData) {
    b.sweep(
      bezier(lash.start, lash.control, lash.control, lash.tip),
      [0.010, 0.002],
      {
        color: MAGENTA,
        section: { ngon: 5 },
        caps: "round",
        name: `petalEyeLash${lash.side < 0 ? "L" : "R"}`,
        group: "petalEye",
      },
    );

    const lashTip = b.part(
      new THREE.IcosahedronGeometry(0.008, 0),
      MAGENTA,
      {
        at: lash.tip,
        flat: true,
        name: `petalEyeLashTip${lash.side < 0 ? "L" : "R"}`,
        group: "petalEye",
      },
    );
    glow(lashTip, 0.55);
  }

  // Small lower-corner cyan beads tie the eye into the flower's existing
  // bioluminescent vein language.
  for (const side of [-1, 1]) {
    const bead = b.part(
      new THREE.IcosahedronGeometry(0.010, 0),
      side < 0 ? CYAN : LIME,
      {
        at: point(side * 0.092, -0.028, 0.031),
        flat: true,
        name: `petalEyeCornerBead${side < 0 ? "L" : "R"}`,
        group: "petalEye",
      },
    );
    glow(bead, 1.15);
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCrownFilaments(b: Builder) {
  type P = [number, number, number];

  const add = (a: P, v: P, s: number): P => [
    a[0] + v[0] * s,
    a[1] + v[1] * s,
    a[2] + v[2] * s,
  ];

  const normalize = (x: number, y: number, z: number): P => {
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l];
  };

  const rod = (a: P, z: P, radius: number, color: string, name: string) =>
    b.rod(a, z, radius, {
      color,
      section: { ngon: 5 },
      caps: "round",
      name,
      group: "stage2",
    });

  // Twelve short, segmented crown filaments emerging from the spaces between
  // the petals. Their highest tips remain below the broad petal silhouette.
  const flowerCenter: P = [0, 2.73, 0.08];

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.12;
    const radial = normalize(Math.cos(a), 0.08, Math.sin(a));
    const outward = normalize(Math.cos(a), 0, Math.sin(a));
    const tangent: P = [-Math.sin(a), 0, Math.cos(a)];

    const base: P = [
      flowerCenter[0] + radial[0] * 0.095,
      flowerCenter[1] + (i % 3) * 0.006,
      flowerCenter[2] + radial[2] * 0.095,
    ];

    const p1 = add(
      base,
      normalize(
        outward[0] * 0.58 + tangent[0] * ((i % 2 ? -1 : 1) * 0.08),
        0.73,
        outward[2] * 0.58 + tangent[2] * ((i % 2 ? -1 : 1) * 0.08),
      ),
      0.085,
    );

    const p2 = add(
      p1,
      normalize(
        outward[0] * 0.7 + tangent[0] * ((i % 3) - 1) * 0.11,
        0.62,
        outward[2] * 0.7 + tangent[2] * ((i % 3) - 1) * 0.11,
      ),
      0.085 + (i % 2) * 0.008,
    );

    const tip = add(
      p2,
      normalize(
        outward[0] * 0.74 + tangent[0] * ((i % 2 ? 1 : -1) * 0.12),
        0.46 + (i % 3) * 0.05,
        outward[2] * 0.74 + tangent[2] * ((i % 2 ? 1 : -1) * 0.12),
      ),
      0.075 + (i % 3) * 0.006,
    );

    // A dark violet socket makes each filament visibly emerge from the flower.
    b.part(
      new THREE.IcosahedronGeometry(0.027, 0),
      VIOLET_DARK,
      {
        at: base,
        flat: true,
        name: `s25_filamentSocket${i}`,
        group: "stage2",
      },
    );

    rod(base, p1, 0.013, CYAN_DARK, `s25_filamentLower${i}`);
    rod(p1, p2, 0.010, CYAN, `s25_filamentMiddle${i}`);
    rod(p2, tip, 0.007, CYAN_DARK, `s25_filamentUpper${i}`);

    const bead = b.part(
      new THREE.IcosahedronGeometry(0.031 + (i % 3) * 0.003, 0),
      VIOLET,
      {
        at: tip,
        flat: true,
        name: `s25_filamentBead${i}`,
        group: "stage2",
      },
    );
    glow(bead, 1.8);
  }

  // Three stepped bands follow the slight lean of the upper stalk while
  // retaining a clean, readable vertical collar silhouette.
  const collars: Array<{
    center: P;
    radius: number;
    height: number;
    beadRadius: number;
  }> = [
    {
      center: [0.019, 2.02, 0.019],
      radius: 0.112,
      height: 0.026,
      beadRadius: 0.019,
    },
    {
      center: [0.014, 2.17, 0.022],
      radius: 0.105,
      height: 0.023,
      beadRadius: 0.018,
    },
    {
      center: [0.008, 2.32, 0.028],
      radius: 0.096,
      height: 0.020,
      beadRadius: 0.017,
    },
  ];

  collars.forEach((collar, collarIndex) => {
    const band = b.part(
      new THREE.CylinderGeometry(
        collar.radius,
        collar.radius * 0.96,
        collar.height,
        10,
        1,
        false,
      ),
      STEM_DARK,
      {
        at: collar.center,
        flat: true,
        name: `s25_stemCollar${collarIndex}`,
        group: "stage2",
      },
    );

    const beadCount = 6;
    for (let i = 0; i < beadCount; i++) {
      // A small phase shift per collar makes the bright segments read as
      // stepped circuitry rather than three identical rings.
      const a =
        (i / beadCount) * Math.PI * 2 +
        collarIndex * 0.34 +
        Math.PI / 6;

      const beadAt: P = [
        collar.center[0] + Math.cos(a) * (collar.radius * 0.985),
        collar.center[1] +
          Math.sin(a * 2 + collarIndex) * collar.height * 0.16,
        collar.center[2] + Math.sin(a) * (collar.radius * 0.985),
      ];

      const bead = b.part(
        new THREE.IcosahedronGeometry(collar.beadRadius, 0),
        (i + collarIndex) % 2 === 0 ? CYAN : LIME,
        {
          at: beadAt,
          flat: true,
          name: `s25_collarBead${collarIndex}_${i}`,
          group: "stage2",
        },
      );
      glow(bead, (i + collarIndex) % 2 === 0 ? 1.9 : 1.45);
    }

    // A narrow luminous front marker breaks up the dark collar and gives the
    // three bands a clear face toward the viewer (+Z).
    const frontMarker: P = [
      collar.center[0],
      collar.center[1],
      collar.center[2] + collar.radius * 0.99,
    ];
    const marker = b.part(
      new THREE.BoxGeometry(
        collar.radius * 0.20,
        collar.height * 0.48,
        0.009,
      ),
      collarIndex === 1 ? LIME : CYAN,
      {
        at: frontMarker,
        flat: true,
        name: `s25_collarFrontMarker${collarIndex}`,
        group: "stage2",
      },
    );
    glow(marker, 1.35);

    void band;
  });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { catmull, rng, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRootFrondTassels(b: Builder) {
  const detailRng = rng(2606);

  const v3 = (
    x: number,
    y: number,
    z: number,
  ) => new THREE.Vector3(x, y, z);

  const normalized = (v: THREE.Vector3) => v.clone().normalize();

  const sharpOutline = (
    points: readonly [number, number][],
  ): [number, number, "sharp"][] =>
    points.map(([x, y]) => [x, y, "sharp"]);

  // -------------------------------------------------------------------------------------------------------------
  // Eight compact root-frond tassels, clustered around the requested root-collar attachment region.

  const tasselCenter = v3(0.24, 0.135, -0.28);
  const up = v3(0, 1, 0);

  const makeRootBlade = (
    base: THREE.Vector3,
    radial: THREE.Vector3,
    tangent: THREE.Vector3,
    index: number,
    spread: number,
    height: number,
    width: number,
    color: string,
  ) => {
    const bladeAxis = normalized(
      radial.clone().multiplyScalar(0.32 + Math.abs(spread) * 0.08)
        .add(tangent.clone().multiplyScalar(spread))
        .addScaledVector(up, 1.25),
    );

    const blade = b.extrude(
      sharpOutline([
        [0, 0],
        [width * 0.82, height * 0.16],
        [width * 0.62, height * 0.68],
        [width * 0.18, height],
        [-width * 0.42, height * 0.72],
        [-width * 0.66, height * 0.2],
      ]),
      {
        at: base,
        x: tangent,
        y: bladeAxis,
        thickness: [0.016, 0.005],
        bevel: 0.003,
        color,
        flat: true,
        name: `s26_rootFrondBlade${index}`,
        group: "s26-root-fronds",
      },
    );

    return { blade, tip: base.clone().addScaledVector(bladeAxis, height), bladeAxis };
  };

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + 0.16;
    const radial = normalized(v3(Math.cos(angle), 0, Math.sin(angle)));
    const tangent = normalized(v3(-Math.sin(angle), 0, Math.cos(angle)));

    const base = tasselCenter.clone()
      .addScaledVector(radial, 0.13 + (i % 2) * 0.018)
      .addScaledVector(tangent, (detailRng() - 0.5) * 0.025)
      .add(v3(0, -0.008, 0));

    const collar = b.part(
      new THREE.CylinderGeometry(0.045, 0.052, 0.038, 7),
      MAGENTA_DARK,
      {
        at: base.clone().add(v3(0, -0.012, 0)),
        flat: true,
        name: `s26_rootFrondCollar${i}`,
        group: "s26-root-fronds",
      },
    );

    const left = makeRootBlade(
      base.clone().addScaledVector(tangent, -0.026),
      radial,
      tangent,
      i * 3,
      -0.32,
      0.18 + (i % 3) * 0.014,
      0.045,
      ROOT_PURPLE,
    );

    const center = makeRootBlade(
      base.clone().add(v3(0, 0.004, 0)),
      radial,
      tangent,
      i * 3 + 1,
      0,
      0.225 + (i % 2) * 0.018,
      0.05,
      VIOLET,
    );

    const right = makeRootBlade(
      base.clone().addScaledVector(tangent, 0.026),
      radial,
      tangent,
      i * 3 + 2,
      0.32,
      0.17 + ((i + 1) % 3) * 0.015,
      0.043,
      ROOT_PURPLE,
    );

    // A raised cyan seam makes the three blades read as one designed alien tassel.
    const ridge = b.rod(
      center.tip.clone().addScaledVector(center.bladeAxis, -0.16),
      center.tip.clone().addScaledVector(center.bladeAxis, -0.018),
      0.0065,
      {
        color: CYAN_DARK,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_rootFrondRidge${i}`,
        group: "s26-root-fronds",
      },
    );
    glow(ridge, 0.8);

    const bead = b.part(
      new THREE.IcosahedronGeometry(0.029 + (i % 2) * 0.004, 0),
      CYAN,
      {
        at: center.tip.clone().addScaledVector(center.bladeAxis, 0.012),
        flat: true,
        name: `s26_rootFrondBead${i}`,
        group: "s26-root-fronds",
      },
    );
    glow(bead, 1.65);

    void collar;
    void left;
    void right;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Repeating angular flares along both margins of the large forward-right leaf (leafBlade0).
  // These coordinates reproduce stage 1's leaf basis without reaching into its local build scope.

  const leafAngle = 0.18;
  const leafLength = 0.98;
  const leafWidth = 0.29;

  const leafRadial = normalized(v3(Math.cos(leafAngle), 0, Math.sin(leafAngle)));
  const leafTangent = normalized(v3(-Math.sin(leafAngle), 0, Math.cos(leafAngle)));
  const leafAxis = normalized(
    v3(
      leafRadial.x * 0.78,
      0.5,
      leafRadial.z * 0.78,
    ),
  );
  const leafBase = v3(
    leafRadial.x * 0.09,
    0.72,
    leafRadial.z * 0.09,
  );
  const leafNormal = normalized(
    new THREE.Vector3().crossVectors(leafTangent, leafAxis),
  );

  const halfLeafWidth = (t: number) => {
    if (t < 0.18) return leafWidth * (t / 0.18) * 0.62;
    if (t < 0.47) return leafWidth * (0.62 + ((t - 0.18) / 0.29) * 0.38);
    if (t < 0.72) return leafWidth * (1 - ((t - 0.47) / 0.25) * 0.24);
    if (t < 0.91) return leafWidth * (0.76 - ((t - 0.72) / 0.19) * 0.48);
    return leafWidth * Math.max(0, (1 - t) / 0.09) * 0.28;
  };

  const leafMarginPoint = (t: number, side: number) =>
    leafBase.clone()
      .addScaledVector(leafAxis, leafLength * t)
      .addScaledVector(leafTangent, side * (halfLeafWidth(t) + 0.006))
      .addScaledVector(leafNormal, 0.014);

  const flareTimes = [0.27, 0.41, 0.55, 0.68, 0.8, 0.89];

  for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
    const side = sideIndex === 0 ? 1 : -1;
    const outward = leafTangent.clone().multiplyScalar(side);
    const finUp = normalized(
      leafRadial.clone().multiplyScalar(0.22).addScaledVector(up, 0.98),
    );

    for (let j = 0; j < flareTimes.length; j++) {
      const t = flareTimes[j];
      const attach = leafMarginPoint(t, side);
      const flareColor = (j + sideIndex) % 2 === 0 ? MAGENTA : CYAN;

      const flare = b.extrude(
        sharpOutline([
          [0, 0],
          [0.045, 0.014],
          [0.085, 0.078],
          [0.042, 0.128],
          [0.008, 0.048],
        ]),
        {
          at: attach,
          x: outward,
          y: finUp,
          thickness: [0.014, 0.004],
          bevel: 0.003,
          color: flareColor,
          flat: true,
          name: `s26_leafEdgeFlare${sideIndex}_${j}`,
          group: "s26-leaf-edge-flares",
        },
      );

      // Every other flare carries a small luminous terminal bead.
      if ((j + sideIndex) % 2 === 0) {
        const flareTip = attach
          .clone()
          .addScaledVector(outward, 0.052)
          .addScaledVector(finUp, 0.098)
          .addScaledVector(leafNormal, 0.008);

        const bead = b.part(
          new THREE.IcosahedronGeometry(0.018, 0),
          flareColor === CYAN ? LIME : CYAN,
          {
            at: flareTip,
            flat: true,
            name: `s26_leafFlareBead${sideIndex}_${j}`,
            group: "s26-leaf-edge-flares",
          },
        );
        glow(bead, flareColor === CYAN ? 1.4 : 1.1);
      }

      void flare;
    }

    // A continuous, faceted luminous margin cord ties the separate fins together.
    const cordPoints = [0.24, 0.42, 0.6, 0.77, 0.9].map((t) =>
      leafBase.clone()
        .addScaledVector(leafAxis, leafLength * t)
        .addScaledVector(leafTangent, side * (halfLeafWidth(t) + 0.018))
        .addScaledVector(leafNormal, 0.023),
    );

    const cord = b.sweep(
      catmull(cordPoints),
      [0.009, 0.003],
      {
        color: sideIndex === 0 ? CYAN_DARK : STEM_LIGHT,
        section: { ngon: 5 },
        caps: "round",
        name: `s26_leafMarginCord${sideIndex}`,
        group: "s26-leaf-edge-flares",
      },
    );
    glow(cord, 0.9);
  }
}
```