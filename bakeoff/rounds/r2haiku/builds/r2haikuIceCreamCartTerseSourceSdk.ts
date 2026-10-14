import * as THREE from "three";
import { createBuilder, patches, spots, stripes } from "../../../../src/index";

export const meta = {
  name: "Ice cream cart",
  description: "A striped-canopy ice cream cart with a mint freezer case, a tub display of three flavours and a waffle-cone sign.",
};

const MINT = "#8fd6bd";
const CREAM = "#fff6e8";
const RED = "#e8464f";
const CHROME = "#c9d1db";
const DARK = "#2f3640";
const WALNUT = "#9a6b45";
const LID = "#f6f8fb";

/** Scoop profile in units of its radius: a flat base, a rounded dome. */
const SCOOP: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [1.03, 0.3],
  [0.95, 0.68],
  [0.72, 0.92],
  [0.4, 1.02],
  [0, 1.04],
];

/** Wheel cross-section, radial x and along-axis y: a rounded tyre with an open centre. */
const WHEEL: Array<[number, number]> = [
  [0.04, -0.03],
  [0.12, -0.03],
  [0.14, -0.015],
  [0.14, 0.015],
  [0.12, 0.03],
  [0.04, 0.03],
];

export default function build() {
  const b = createBuilder({ name: "ice cream cart", detail: 1, paintSize: 1024 });

  // One root bone for the whole cart: every part rides it.
  b.joint("cart", { at: [0, 0, 0], dir: [0, 1, 0] });

  // Chassis and axles.
  b.frustumBox([0, 0.22, -0.6], [0, 0.22, 0.6], [0.92, 0.1], [0.92, 0.1], {
    name: "chassis",
    color: DARK,
    caps: "flat",
  });
  for (const z of [-0.32, 0.3]) {
    b.rod([-0.47, 0.14, z], [0.47, 0.14, z], 0.015, { name: "axle", color: DARK });
    for (const x of [-0.47, 0.47]) {
      b.lathe(WHEEL, { name: "tyre", color: DARK, at: [x, 0.14, z], axis: [1, 0, 0], segments: 16 });
      b.lathe(
        [
          [0, -0.045],
          [0.05, -0.045],
          [0.05, 0.045],
          [0, 0.045],
        ],
        { name: "hub", color: CHROME, at: [x, 0.14, z], axis: [1, 0, 0], segments: 10 },
      );
    }
  }

  // Freezer case, its sides striped vertically.
  b.frustumBox([0, 0.52, -0.45], [0, 0.52, 0.5], [0.86, 0.5], [0.86, 0.5], {
    name: "freezer",
    color: stripes(MINT, CREAM, { size: 0.14, axis: "z", width: 0.35 }),
    caps: "flat",
  });

  // Lid, slightly overhanging the case.
  b.frustumBox([0, 0.79, -0.5], [0, 0.79, 0.55], [0.92, 0.04], [0.92, 0.04], {
    name: "lid",
    color: LID,
    caps: "flat",
  });

  // Serving ledge at the front, on two chrome legs.
  b.frustumBox([0, 0.46, 0.5], [0, 0.46, 0.8], [0.8, 0.05], [0.8, 0.05], {
    name: "ledge",
    color: WALNUT,
    caps: "flat",
  });
  for (const x of [-0.36, 0.36]) b.rod([x, 0.27, 0.74], [x, 0.435, 0.74], 0.018, { name: "ledgeLeg", color: DARK });

  // Push handle at the back.
  for (const x of [-0.42, 0.42]) b.rod([x, 0.27, -0.58], [x, 1.0, -0.58], 0.022, { name: "handle", color: CHROME });
  b.rod([-0.42, 1.0, -0.58], [0.42, 1.0, -0.58], 0.022, { name: "handleBar", color: CHROME });

  // Four canopy poles.
  for (const z of [-0.45, 0.45])
    for (const x of [-0.41, 0.41]) b.rod([x, 0.81, z], [x, 1.49, z], 0.02, { name: "pole", color: CHROME });

  // Scalloped striped canopy, built as one flat slab with zigzag front edge.
  const N = 6;
  const step = 1.24 / N;
  const canopy: number[][] = [
    [-0.62, 1.5, -0.7],
    [0.62, 1.5, -0.7],
    [0.62, 1.5, 0.7],
  ];
  for (let k = 0; k < N; k++) {
    canopy.push([0.62 - (k + 0.5) * step, 1.5, 0.8]);
    canopy.push([0.62 - (k + 1) * step, 1.5, 0.7]);
  }
  b.slab(canopy, {
    name: "canopy",
    color: stripes(RED, CREAM, { size: 0.2, axis: "x", width: 0.5 }),
    thickness: 0.02,
  });

  // Bulbs hung under the scalloped edge.
  const bulb = new THREE.SphereGeometry(0.018, 8, 6);
  for (const x of [0.413, 0.206, 0, -0.206, -0.413]) b.part(bulb, "#fff3b0", { at: [x, 1.48, 0.7], name: "bulb" });

  // Waffle-cone sign on top of the canopy, with a scoop on it.
  b.lathe(
    [
      [0, 0],
      [0.1, 0.22],
      [0, 0.22],
    ],
    {
      name: "cone",
      color: patches("#d9a05b", "#c4843f", { size: 0.03 }),
      at: [0, 1.51, 0],
      segments: 12,
    },
  );
  b.lathe(
    SCOOP.map(([x, y]) => [x * 0.1, y * 0.1]),
    {
      name: "topScoop",
      color: spots("#ffb3c7", "#e2668f", { size: 0.04, amount: 0.3 }),
      at: [0, 1.73, 0],
      segments: 12,
    },
  );

  // Tub display on the lid: three flavours.
  const flavours = [
    { x: -0.25, base: "#f7a8c4", chip: "#d94f7c" },
    { x: 0, base: "#7a4a32", chip: "#f2dcc0" },
    { x: 0.25, base: "#b8f0d8", chip: "#3b2418" },
  ];
  for (const { x, base, chip } of flavours) {
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.105, 0.03],
        [0.1, 0.07],
        [0, 0.07],
      ],
      { name: "tub", color: "#f4efe6", at: [x, 0.81, 0.05], segments: 14 },
    );
    b.lathe(
      SCOOP.map(([sx, sy]) => [sx * 0.09, sy * 0.09]),
      {
        name: "scoop",
        color: spots(base, chip, { size: 0.05, amount: 0.3 }),
        at: [x, 0.88, 0.05],
        segments: 14,
      },
    );
  }

  return b.root;
}
