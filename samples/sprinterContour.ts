// Sprinter, about 1.70 m: an athletic woman in a crop top and running briefs, a race bib on the top, running spikes and
// hair in a high ponytail. Built with the same contoured sweeps as the lifeguard (src/experimental/contour.ts): the
// torso and neck are one section drawn from the pelvis to the jaw, legs and arms are chain sweeps, the foot is one
// section from heel to toe box, and the clothes are colours and shelves in those sections.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { contour } from "../src/experimental/contour";
import { DEG } from "../src/math";
import { grain, mix, noise, paint, smoothstep } from "../src/paint";
import { catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import type { Chain } from "../src/skeleton";

export const meta = {
  name: "Sprinter (Contour)",
  description:
    "A sprinter, 1.70 m: an athletic woman in a crop top and running briefs, race bib, running spikes and a high ponytail. Every body part is a contoured sweep drawn from anatomy tables.",
};

// ------------------------------------------------------------------------------------------------- palette
const SKIN = "#c58a63";
const SKIN_LIGHT = "#d9a07c";
const SKIN_SHADE = "#a06a4a";
const TOP = "#1f9d8e";
const BRIEFS = "#f26b21";
const SOLE = "#22242a";
const SHOE = "#ecebe6";
const SHOE_ACCENT = "#e83a6a";
const SPIKE = "#c9ccd2";
const HAIR_A = "#4a3020";
const HAIR_B = "#2a1a12";
const BROW = "#2c1c14";
const EYE_WHITE = "#f4f0ea";
const IRIS = "#4b6a86";
const PUPIL = "#101216";
const LIP = "#c0605e";
const MOUTH = "#5a2a28";
const NAIL = "#e6b9a0";

type Rows = ReadonlyArray<readonly number[]>;
/** Column `col` of anatomy rows `[coordinate, ...values]` as keys over a straight path from c0 to c1. */
const column = (c0: number, c1: number, rows: Rows, col: number): Array<[number, number]> =>
  rows.map((r) => [(r[0] - c0) / (c1 - c0), r[col]]);
/** Rows closing a dome: `top`'s reaches shrunk along a quarter circle over y0..y1, the last ring tiny. */
const dome = (y0: number, y1: number, top: readonly number[]): number[][] =>
  [0.35, 0.6, 0.78, 0.9, 0.965, 0.995].map((u) => [y0 + u * (y1 - y0), ...top.map((v) => v * Math.sqrt(1 - u * u))]);

// ------------------------------------------------------------------------------------------------- paints
/** Skin with a little sun-bleached and shaded mottle. */
const SKIN_P = paint((p) => {
  const m = noise(p, 0.12, 3);
  return mix(SKIN, m > 0.5 ? SKIN_LIGHT : SKIN_SHADE, Math.abs(m - 0.5) * 0.7);
});
const HAIR_P = grain(HAIR_A, HAIR_B, { size: 0.007, axis: [0, 1, 0], seed: 5 });
/** The bib: white with a big number and two pin dots at the top. */
const BIB_TEX = svg(
  `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#f8f8f4"/><rect x="0" y="0" width="64" height="7" fill="#e83a6a"/><text x="32" y="38" font-family="Arial Black, Arial" font-weight="900" font-size="34" text-anchor="middle" fill="#1b1b1f">247</text><circle cx="5" cy="3.5" r="1.6" fill="#f8f8f4"/><circle cx="59" cy="3.5" r="1.6" fill="#f8f8f4"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "sprinterContour", paintSize: 2048 });
  const sides = [
    ["L", 1],
    ["R", -1],
  ] as const;

  // ------------------------------------------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.915, 0],
      [0, 1.0705, 0.0018],
      [0, 1.217, 0.0073],
      [0, 1.3725, 0],
    ],
    { parent: hips, names: ["spine", "spine1", "spine2"], up: [0, 0, 1], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.3725, -0.011],
    aim: [0, 1.5235, -0.009],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.5235, -0.009],
    aim: [0, 1.7019, 0],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.5445, -0.041],
    aim: [0, 1.4896, 0.078],
    role: "jaw",
    group: "jaw",
  });

  // ------------------------------------------------------------------------------------------------- torso
  // Rows: y, front (chest), back, half width, roundness: pelvis, waist, ribs, chest, the shoulder line sloping over the
  // trapezius (back reach) into the neck, and the neck to the jaw. The waistband is the shelf between 1.006 and 1.048.
  const TORSO: Rows = [
    [0.7869, 0.0762, 0.0825, 0.1197, 1],
    [0.8235, 0.0897, 0.1106, 0.1497, 1],
    [0.8601, 0.0942, 0.1125, 0.1615, 1],
    [0.9205, 0.0914, 0.1047, 0.1576, 1],
    [0.9278, 0.0959, 0.1096, 0.1625, 1],
    [0.9516, 0.0959, 0.1096, 0.1625, 1],
    [0.9589, 0.0888, 0.0989, 0.1516, 1],
    [0.9974, 0.0888, 0.086, 0.1251, 0.95],
    [1.0614, 0.0906, 0.0824, 0.1208, 0.95],
    [1.1346, 0.097, 0.0933, 0.1418, 0.9],
    [1.1986, 0.0918, 0.0953, 0.1401, 0.9],
    [1.2627, 0.095, 0.0987, 0.1496, 0.9],
    [1.3084, 0.0934, 0.097, 0.1496, 0.92],
    [1.3451, 0.0805, 0.0953, 0.1385, 0.95],
    [1.3725, 0.0677, 0.0868, 0.1054, 1],
    [1.4, 0.0547, 0.0749, 0.0742, 1],
    [1.4274, 0.0499, 0.0646, 0.0577, 1],
    [1.464, 0.0532, 0.0578, 0.0527, 1],
    [1.5189, 0.0483, 0.0545, 0.0494, 1],
    [1.5555, 0.0435, 0.0494, 0.0461, 1],
  ];
  // briefs up to the waistband, bare midriff, then the crop top from below the bust to the collarbones
  const bodyColor = (y: number) => (y < 0.937 ? BRIEFS : y < 1.16 ? SKIN_P : y < 1.3377 ? TOP : SKIN_P);
  const torso = b.sweep(
    polyline([
      [0, 0.7869, 0],
      [0, 1.5555, -0.0055],
    ]),
    contour({
      front: column(0.7869, 1.5555, TORSO, 1),
      back: column(0.7869, 1.5555, TORSO, 2),
      side: column(0.7869, 1.5555, TORSO, 3),
      round: column(0.7869, 1.5555, TORSO, 4),
      sides: 16,
    }),
    {
      up: [0, 0, 1],
      bone: [hips, spine, neck, head],
      color: (t) => bodyColor(0.7869 + t * (1.5555 - 0.7869)),
      caps: { start: "round", end: "round" },
      name: "torso",
      group: "body",
    },
  );

  // breasts: a rounded mass on each side of the breastbone, under the crop top
  const pecs = sides.map(([, s]) =>
    b.sweep(
      catmull([
        [s * 0.024, 1.2673, 0.08],
        [s * 0.07, 1.2581, 0.084],
        [s * 0.115, 1.2718, 0.066],
      ]),
      contour({
        front: [
          [0, 0.018],
          [0.5, 0.05],
          [1, 0.016],
        ],
        back: 0.03,
        left: [
          [0, 0.02],
          [0.5, 0.05],
          [1, 0.022],
        ],
        right: [
          [0, 0.02],
          [0.5, 0.054],
          [1, 0.02],
        ],
        mirror: s < 0,
        sides: 12,
      }),
      { up: [0, 0, 1], bone: chest, color: TOP, caps: { start: "round", end: "round" }, name: "bust", group: "body" },
    ),
  );

  // ------------------------------------------------------------------------------------------------- head
  // skull: horizontal sections up the head: cheekbones, brow ridge, and a domed crown that ends flat and tiny at 1.85
  const SKULL: Rows = [
    [1.5189, 0.0622, 0.0686, 0.0604, 1],
    [1.5418, 0.0723, 0.0778, 0.0677, 1],
    [1.5738, 0.0805, 0.0869, 0.0714, 1],
    [1.5921, 0.0824, 0.0915, 0.0714, 1],
    [1.6104, 0.0869, 0.0933, 0.0714, 1],
    [1.6241, 0.0814, 0.0933, 0.0714, 1],
    [1.6379, 0.0778, 0.0933, 0.0705, 1],
    ...dome(1.6379, 1.6928, [0.0778, 0.0933, 0.0705]).map((r) => [...r, 1]),
  ];
  const skull = b.sweep(
    polyline([
      [0, 1.5189, 0.0037],
      [0, 1.6923, 0.0037],
    ]),
    contour({
      front: column(1.5189, 1.6923, SKULL, 1),
      back: column(1.5189, 1.6923, SKULL, 2),
      side: column(1.5189, 1.6923, SKULL, 3),
      sides: 16,
    }),
    { up: [0, 0, 1], bone: head, color: SKIN_P, name: "skull", group: "head", caps: { start: "round", end: "flat" } },
  );

  // lower jaw: a horizontal section from the ramus to the chin, hinged at `jaw`; its top edge rises toward the ear
  const JAW: Rows = [
    [-0.0503, 0.0274, 0.011, 0.0412],
    [-0.0274, 0.0366, 0.0146, 0.0549],
    [0, 0.0274, 0.0183, 0.0586],
    [0.0274, 0.0183, 0.021, 0.0494],
    [0.0458, 0.0146, 0.022, 0.0293],
  ];
  b.sweep(
    polyline([
      [0, 1.5006, -0.0503],
      [0, 1.5006, 0.0458],
    ]),
    contour({
      front: column(-0.0503, 0.0458, JAW, 1),
      back: column(-0.0503, 0.0458, JAW, 2),
      side: column(-0.0503, 0.0458, JAW, 3),
      sides: 12,
    }),
    { up: [0, 1, 0], bone: jaw, color: SKIN_P, name: "jaw", group: "jaw", caps: { start: "flat", end: "round" } },
  );

  // hair: the head sections a little fuller, the hairline a shelf above the brow, a dome over the crown
  const HAIR: Rows = [
    [1.5692, 0, 0.0842, 0.0641],
    [1.5875, 0, 0.0942, 0.075],
    [1.6104, 0.0458, 0.0997, 0.0759],
    [1.6433, 0.0458, 0.0997, 0.0769],
    [1.6525, 0.0851, 0.0997, 0.0787],
    [1.6745, 0.0705, 0.0888, 0.0677],
    ...dome(1.6379, 1.6992, [0.0851, 0.0997, 0.0769]).filter((r) => r[0] > 1.6745),
  ];
  b.sweep(
    polyline([
      [0, 1.5692, 0.0037],
      [0, 1.6987, 0.0037],
    ]),
    contour({
      front: column(1.5692, 1.6987, HAIR, 1),
      back: column(1.5692, 1.6987, HAIR, 2),
      side: column(1.5692, 1.6987, HAIR, 3),
      sides: 16,
    }),
    { up: [0, 0, 1], bone: head, color: HAIR_P, name: "hair", group: "head", caps: { start: "flat", end: "flat" } },
  );

  // ------------------------------------------------------------------------------------------------- face
  const skullSkin = b.surface(skull);
  for (const [side, s] of sides) {
    const x = s * 0.033;
    const front = skullSkin.ray([x, 1.593, 0.3], [0, 0, -1])?.at.z ?? 0.08;
    const c = new THREE.Vector3(x, 1.593, front - 0.0035);
    const eye = b.joint(`eye${side}`, { parent: head, at: c, dir: [0, 0, 1], group: "head" });
    b.part(new THREE.SphereGeometry(0.0108, 10, 8), EYE_WHITE, {
      bone: eye,
      at: c,
      name: `eyeball${side}`,
      group: "head",
    });
    for (const [r, z, color] of [
      [0.0058, 0.0093, IRIS],
      [0.0029, 0.0107, PUPIL],
    ] as const)
      b.part(new THREE.CircleGeometry(r, 10), color, {
        bone: eye,
        at: c.clone().add(new THREE.Vector3(0, 0, z)),
        dir: [0, 0, 1],
        axis: "z",
        name: `iris${side}`,
        group: "head",
      });
    // lids: arcs round the eyeball
    const lid = (from: number, to: number, r: number, zLift: number) =>
      catmull(
        Array.from({ length: 5 }, (_, i) => {
          const a = (from + ((to - from) * i) / 4) * DEG;
          return [
            c.x + s * Math.cos(a) * r * 1.12,
            c.y + Math.sin(a) * r,
            c.z + zLift - Math.abs(Math.cos(a)) * 0.0035,
          ] as [number, number, number];
        }),
      );
    b.sweep(lid(160, 20, 0.0114, 0.0028), 0.0034, {
      bone: head,
      color: SKIN_SHADE,
      name: `lidUpper${side}`,
      group: "head",
      sides: 6,
    });
    b.sweep(lid(205, 335, 0.0108, 0.0022), 0.003, {
      bone: head,
      color: SKIN_SHADE,
      name: `lidLower${side}`,
      group: "head",
      sides: 6,
    });
    // brows
    b.sweep(
      catmull([
        [s * 0.0119, 1.6154, 0.0856],
        [s * 0.0293, 1.6228, 0.0837],
        [s * 0.0476, 1.6159, 0.0723],
      ]),
      contour({ front: [0.0034, 0.0038, 0.003], back: 0.0025, side: 0.0034 }),
      { up: [0, 0, 1], bone: head, color: BROW, name: `brow${side}`, group: "head", sides: 8 },
    );
    // ears: a flat scoop on the side of the head, tilted back at the top
    b.sweep(
      catmull([
        [s * 0.07, 1.6077, -0.0128],
        [s * 0.0769, 1.5839, -0.0073],
        [s * 0.0723, 1.5601, 0],
      ]),
      contour({
        front: [0.007, 0.0085, 0.006],
        back: 0.004,
        side: [0.008, 0.012, 0.008],
        round: 0.9,
        sides: 8,
      }),
      { up: [s, 0, 0], bone: head, color: SKIN_P, name: `ear${side}`, group: "head" },
    );
  }

  // nose: bridge to tip with flared wings
  b.sweep(
    catmull([
      [0, 1.6067, 0.075],
      [0, 1.5738, 0.0915],
      [0, 1.5464, 0.1052],
    ]),
    contour({
      front: [
        [0, 0.0086],
        [0.5, 0.0094],
        [1, 0.0113],
      ],
      back: [0.02, 0.0101, 0.007],
      side: [
        [0, 0.0086],
        [0.3, 0.0082],
        [0.7, 0.0105],
        [0.88, 0.0175],
        [1, 0.0117],
      ],
      sides: 12,
      round: 0.9,
    }),
    {
      up: [0, 1, 0],
      bone: head,
      color: SKIN_P,
      caps: { start: "round", end: "round" },
      name: "nose",
      group: "head",
    },
  );
  // lips: two pads, the lower one on the jaw, and the mouth line between them
  const lipPath = (y: number, w: number, z: number) =>
    catmull([
      [-w, y + 0.002, z - 0.017],
      [-w * 0.5, y - 0.001, z - 0.004],
      [0, y + 0.001, z],
      [w * 0.5, y - 0.001, z - 0.004],
      [w, y + 0.002, z - 0.017],
    ]);
  b.sweep(
    lipPath(1.512, 0.028, 0.069),
    contour({ front: [0.005, 0.0085, 0.0085, 0.0085, 0.005], back: 0.004, left: 0.006, right: 0.0038, sides: 8 }),
    { up: [0, 0, 1], bone: head, color: LIP, name: "lipUpper", group: "head" },
  );
  b.sweep(
    lipPath(1.4983, 0.024, 0.063),
    contour({ front: [0.005, 0.0095, 0.0095, 0.0095, 0.005], back: 0.004, left: 0.004, right: 0.007, sides: 8 }),
    { up: [0, 0, 1], bone: jaw, color: LIP, name: "lipLower", group: "jaw" },
  );
  b.sweep(lipPath(1.505, 0.03, 0.0655), 0.0016, { bone: jaw, color: MOUTH, name: "mouthLine", group: "jaw", sides: 6 });

  // ------------------------------------------------------------------------------------------------- legs
  // Rows: y, front, back, medial, lateral. The briefs' hem is the shelf between 0.776 and 0.764.
  const LEG: Rows = [
    [0.8555, 0.0878, 0.1007, 0.0878, 0.0915],
    [0.8, 0.0995, 0.1017, 0.0925, 0.1003],
    [0.776, 0.0995, 0.0985, 0.0915, 0.1003],
    [0.764, 0.0895, 0.0895, 0.0825, 0.0925],
    [0.7137, 0.0915, 0.0897, 0.0824, 0.0952],
    [0.6442, 0.0888, 0.0851, 0.0787, 0.0906],
    [0.5673, 0.0805, 0.0769, 0.0714, 0.0824],
    [0.5124, 0.0695, 0.0659, 0.0677, 0.0641],
    [0.4758, 0.0631, 0.0586, 0.0586, 0.0586],
    [0.4484, 0.0604, 0.0567, 0.0567, 0.0567],
    [0.4118, 0.0531, 0.075, 0.0586, 0.0604],
    [0.366, 0.0476, 0.0769, 0.0567, 0.0586],
    [0.2928, 0.0439, 0.0641, 0.0476, 0.0503],
    [0.2013, 0.0403, 0.0476, 0.0384, 0.0421],
    [0.1281, 0.0366, 0.0421, 0.0348, 0.0384],
    [0.0686, 0.0366, 0.0458, 0.0366, 0.0384],
  ];
  // Rows for the shoe, by z along a path at y = 0.0274: top, sole, medial, lateral, roundness.
  const FOOT: Rows = [
    [-0.0641, 0.0457, 0.0275, 0.0293, 0.0293, 0.9],
    [-0.0366, 0.0567, 0.0275, 0.0339, 0.0339, 0.9],
    [-0.0046, 0.0604, 0.0275, 0.0366, 0.0366, 0.9],
    [0.0274, 0.0531, 0.0201, 0.0375, 0.0366, 0.8],
    [0.0732, 0.0366, 0.0201, 0.0412, 0.0375, 0.7],
    [0.1098, 0.0165, 0.0245, 0.0476, 0.0412, 0.6],
    [0.155, 0.0095, 0.0245, 0.04, 0.037, 0.6],
  ];
  const legs: Chain[] = [];
  for (const [side, s] of sides) {
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.0869, 0.8555, 0],
        [s * 0.0824, 0.4575, 0.0183],
        [s * 0.0824, 0.0686, -0.0046],
      ],
      {
        parent: hips,
        names: [`upLeg${side}`, `leg${side}`],
        up: [0, 0, 1],
        role: "leg",
        contact: [s * 0.0824, 0, 0.046],
        group: "legs",
      },
    );
    legs.push(leg);
    const foot = b.chain(
      `foot${side}`,
      [
        [s * 0.0824, 0.0686, -0.0046],
        [s * 0.0824, 0.0274, 0.1052],
        [s * 0.0824, 0.0183, 0.1876],
      ],
      { parent: leg.joints[1], names: [`foot${side}`, `toe${side}`], up: [0, 1, 0], role: "leg", group: "legs" },
    );
    b.sweep(
      leg,
      contour({
        front: column(0.8555, 0.0686, LEG, 1),
        back: column(0.8555, 0.0686, LEG, 2),
        right: column(0.8555, 0.0686, LEG, 3),
        left: column(0.8555, 0.0686, LEG, 4),
        mirror: s < 0,
        sides: 16,
      }),
      {
        up: [0, 0, 1],
        color: (t) => (0.8555 - t * 0.7869 > 0.77 ? BRIEFS : SKIN_P),
        caps: { start: "round", end: "round" },
        name: `leg${side}`,
        group: "legs",
      },
    );
    b.sweep(
      polyline([
        [s * 0.0824, 0.0274, -0.0641],
        [s * 0.0824, 0.0274, 0.155],
      ]),
      contour({
        front: column(-0.0641, 0.155, FOOT, 1),
        back: column(-0.0641, 0.155, FOOT, 2),
        right: column(-0.0641, 0.155, FOOT, 3),
        left: column(-0.0641, 0.155, FOOT, 4),
        round: column(-0.0641, 0.155, FOOT, 5),
        mirror: s < 0,
        sides: 12,
      }),
      {
        up: [0, 1, 0],
        bone: foot,
        color: SHOE,
        sectors: [[110, 250, SOLE]],
        caps: { start: "round", end: "round" },
        name: `shoe${side}`,
        group: "legs",
      },
    );
    // spikes under the forefoot: three on the ball (toe joint), two under the arch bone
    for (const [x, z, bone] of [
      [-0.026, 0.1, foot.joints[1]],
      [0.0, 0.112, foot.joints[1]],
      [0.026, 0.1, foot.joints[1]],
      [-0.02, 0.06, foot],
      [0.02, 0.06, foot],
    ] as const)
      b.spike([s * (0.0824 + x), 0.0048, z], [0, -1, 0], 0.0048, 0.0032, {
        bone,
        color: SPIKE,
        name: `spike${side}`,
        group: "legs",
      });
  }

  // ------------------------------------------------------------------------------------------------- arms and hands
  // Rows by chain t (shoulder 0, elbow 0.448, wrist 0.851, knuckles 1): front, back, upper side, underside.
  const ARM: Rows = [
    [0, 0.0604, 0.0586, 0.0641, 0.0531],
    [0.07, 0.0659, 0.0604, 0.0714, 0.0531],
    [0.16, 0.0567, 0.0531, 0.0604, 0.0476],
    [0.22, 0.0485, 0.0476, 0.0458, 0.0439],
    [0.32, 0.0503, 0.0476, 0.0421, 0.0421],
    [0.4, 0.0421, 0.0439, 0.0366, 0.0366],
    [0.448, 0.0339, 0.0384, 0.0311, 0.0311],
    [0.5, 0.0403, 0.0366, 0.0384, 0.0348],
    [0.58, 0.0421, 0.0384, 0.0384, 0.0366],
    [0.7, 0.0348, 0.0311, 0.0329, 0.0311],
    [0.8, 0.0238, 0.022, 0.0274, 0.0256],
    [0.851, 0.0201, 0.022, 0.0274, 0.0256],
    [0.9, 0.0128, 0.0183, 0.0403, 0.0403],
    [0.97, 0.011, 0.0137, 0.0421, 0.0421],
    [1, 0.0101, 0.0119, 0.0403, 0.0403],
  ];
  for (const [side, s] of sides) {
    const shoulder = b.joint(`shoulder${side}`, {
      parent: chest,
      at: [s * 0.0275, 1.3606, 0.027],
      aim: [s * 0.1693, 1.3524, 0.0],
      group: "body",
    });
    const S: [number, number, number] = [s * 0.1693, 1.3451, -0.004];
    const E: [number, number, number] = [S[0] + s * 0.194, S[1] - 0.194, 0.006];
    const W: [number, number, number] = [E[0] + s * 0.1757, E[1] - 0.1702, 0.028];
    const K: [number, number, number] = [W[0] + s * 0.0641, W[1] - 0.0641, 0.028];
    const arm = b.chain(`arm${side}`, [S, E, W, K], {
      parent: shoulder,
      names: [`upperArm${side}`, `lowerArm${side}`, `hand${side}`],
      up: [0, 0, 1],
      twist: (t) => -s * 100 * smoothstep(0.42, 0.85, t),
      role: "arm",
      group: "arms",
    });
    b.sweep(
      arm,
      contour({
        front: column(0, 1, ARM, 1),
        back: column(0, 1, ARM, 2),
        left: column(0, 1, ARM, 3),
        right: column(0, 1, ARM, 4),
        mirror: s < 0,
        sides: 12,
      }),
      { color: SKIN_P, caps: { start: "round", end: "round" }, name: `arm${side}`, group: "arms" },
    );
    // hand frame from the chain's own end frame: F along the fingers, D dorsal, TH toward the thumb
    const end = arm.at(1);
    const F = end.tangent.clone();
    const D = end.normal.clone();
    const TH = new THREE.Vector3(0, 0, 1);
    TH.addScaledVector(F, -TH.dot(F)).addScaledVector(D, -TH.dot(D)).normalize();
    const handJoint = arm.joints[2];
    const digit = (
      name: string,
      base: THREE.Vector3,
      dir: THREE.Vector3,
      lens: readonly [number, number, number],
      half: number,
      curl: number,
    ) => {
      const pts = [base.clone()];
      const d = dir.clone();
      lens.forEach((len, i) => {
        d.applyAxisAngle(new THREE.Vector3().crossVectors(D, d).normalize(), -curl * (i + 1) * DEG);
        pts.push(pts[i].clone().addScaledVector(d, len));
      });
      const ch = b.chain(`${name}${side}`, pts, {
        parent: handJoint,
        names: [1, 2, 3].map((i) => `${name}${i}${side}`),
        up: D.toArray(),
        role: "digit",
        group: "arms",
      });
      const total = lens[0] + lens[1] + lens[2];
      const knuckles = [lens[0] / total, (lens[0] + lens[1]) / total];
      b.sweep(
        ch,
        contour({
          front: [
            [0, half * 0.95],
            [knuckles[0] - 0.03, half * 0.86],
            [knuckles[0] + 0.02, half * 0.9],
            [knuckles[1], half * 0.8],
            [1, half * 0.66],
          ],
          back: [half * 0.95, half * 0.9, half * 0.72],
          side: [half, half * 0.88, half * 0.72],
          round: 0.95,
          sides: 8,
        }),
        {
          color: SKIN_P,
          sectors: [[-55, 55, NAIL, 0.86, 1]],
          caps: { start: "round", end: "round" },
          name: `${name}${side}`,
          group: "arms",
        },
      );
    };
    const K0 = new THREE.Vector3().fromArray(K);
    // fingers across the knuckle line, spread a little; the thumb well apart
    const specs: Array<[string, number, number, readonly [number, number, number], number]> = [
      ["index", 0.034, 8, [0.04, 0.024, 0.02], 0.0092],
      ["middle", 0.011, 1, [0.044, 0.027, 0.021], 0.0098],
      ["ring", -0.012, -6, [0.041, 0.025, 0.02], 0.0092],
      ["pinky", -0.033, -14, [0.032, 0.019, 0.017], 0.0082],
    ];
    for (const [name, off, spread, lens, half] of specs) {
      const base = K0.clone()
        .addScaledVector(TH, off)
        .addScaledVector(F, -Math.abs(off) * 0.12);
      const dir = F.clone()
        .multiplyScalar(Math.cos(spread * DEG))
        .addScaledVector(TH, Math.sin(spread * DEG));
      digit(name, base, dir, lens, half, 3);
    }
    const thumbBase = new THREE.Vector3()
      .fromArray(W)
      .addScaledVector(F, 0.036)
      .addScaledVector(TH, 0.03)
      .addScaledVector(D, -0.012);
    const thumbDir = F.clone()
      .multiplyScalar(Math.cos(38 * DEG))
      .addScaledVector(TH, Math.sin(38 * DEG))
      .addScaledVector(D, -0.28)
      .normalize();
    digit("thumb", thumbBase, thumbDir, [0.04, 0.033, 0.027], 0.0118, 4);
  }

  // ------------------------------------------------------------------------------------------------- props
  const skin = b.surface([torso, ...pecs]);
  // race bib pinned on the top, below the bust
  const bibZ = skin.ray([0, 1.2, 0.4], [0, 0, -1])?.at.z ?? 0.09;
  b.part(new THREE.PlaneGeometry(0.15, 0.105), "#ffffff", {
    bone: chest,
    at: [0, 1.2, bibZ + 0.004],
    dir: [0, 0, 1],
    axis: "z",
    texture: BIB_TEX,
    name: "bib",
    group: "body",
  });
  // high ponytail: a tie at the back of the crown and a tapering tail of hair down the back
  b.part(new THREE.TorusGeometry(0.02, 0.0045, 6, 12), SHOE_ACCENT, {
    bone: head,
    at: [0, 1.66, -0.083],
    dir: [0, 0.35, -1],
    axis: "z",
    name: "hairTie",
    group: "head",
  });
  b.sweep(
    catmull([
      [0, 1.655, -0.08],
      [0, 1.672, -0.13],
      [0, 1.63, -0.175],
      [0, 1.54, -0.19],
      [0, 1.46, -0.178],
    ]),
    contour({
      front: [0.016, 0.03, 0.03, 0.02, 0.004],
      back: [0.016, 0.03, 0.03, 0.02, 0.004],
      side: [0.018, 0.03, 0.03, 0.022, 0.004],
      sides: 8,
    }),
    {
      up: [1, 0, 0],
      bone: head,
      color: HAIR_P,
      caps: { start: "round", end: "point" },
      name: "ponytail",
      group: "head",
    },
  );

  return b.root;
}
