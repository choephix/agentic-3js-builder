// Beach lifeguard, about 1.85 m: shirtless, red swim trunks, barefoot, whistle on a cord, sunglasses pushed up on his
// head and a stripe of zinc on his nose. Every body part is a contoured sweep (src/experimental/contour.ts): one
// section per part drawn along its length from anatomy tables, so the torso, thighs, calves, arms, hands, feet, head
// and jaw all have the shape they have in life. Trunks, hair, nails and the zinc are colours and shelves in those
// sections, not extra shells.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { contour } from "../src/experimental/contour";
import { DEG } from "../src/math";
import { grain, mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Chain } from "../src/skeleton";

export const meta = {
  name: "Lifeguard (Contour)",
  description:
    "A beach lifeguard, 1.85 m: athletic and shirtless in red trunks, barefoot, whistle on a cord, sunglasses pushed up on his head, zinc on his nose. Every body part is a contoured sweep drawn from anatomy tables.",
};

// ------------------------------------------------------------------------------------------------- palette
const SKIN = "#c98b5e";
const SKIN_LIGHT = "#dca377";
const SKIN_SHADE = "#a56a45";
const RED = "#d0242c";
const WHITE = "#f2efe6";
const HAIR_A = "#d8b56a";
const HAIR_B = "#a8802f";
const BROW = "#7a5a2a";
const EYE_WHITE = "#f4f0ea";
const IRIS = "#4b6a86";
const PUPIL = "#101216";
const LIP = "#b0625a";
const MOUTH = "#5a2a28";
const NAIL = "#e6b9a0";
const ZINC = "#fbfbf6";
const FRAME = "#15161a";
const LENS = "#25455f";
const LENS_GLINT = "#8fb3cf";
const WHISTLE = "#f0801e";
const STEEL = "#b7bcc4";

type Rows = ReadonlyArray<readonly number[]>;
/** Column `col` of anatomy rows `[coordinate, ...values]` as keys over a straight path from c0 to c1. */
const column = (c0: number, c1: number, rows: Rows, col: number): Array<[number, number]> =>
  rows.map((r) => [(r[0] - c0) / (c1 - c0), r[col]]);
/** Rows closing a dome: `top`'s reaches shrunk along a quarter circle over y0..y1, the last ring tiny. */
const dome = (y0: number, y1: number, top: readonly number[]): number[][] =>
  [0.35, 0.6, 0.78, 0.9, 0.965, 0.995].map((u) => [y0 + u * (y1 - y0), ...top.map((v) => v * Math.sqrt(1 - u * u))]);

// ------------------------------------------------------------------------------------------------- paints
/** Tanned skin with a little sun-bleached and shaded mottle, plus the painted marks: abs, nipples, navel, spine. */
const SKIN_P = paint((p, n) => {
  const m = noise(p, 0.12, 3);
  let c: string | Rgb = mix(SKIN, m > 0.5 ? SKIN_LIGHT : SKIN_SHADE, Math.abs(m - 0.5) * 0.7);
  const ax = Math.abs(p.x);
  if (n.z > 0.2 && ax < 0.2) {
    // rectus abdominis: a centre line, three cross grooves, each block a little lighter in its middle
    if (p.y > 1.03 && p.y < 1.3 && ax < 0.07) {
      const rows = [1.245, 1.178, 1.112];
      const groove =
        (ax < 0.0022 && p.y > 1.04) ||
        (ax < 0.056 && rows.some((y) => Math.abs(p.y - y) < 0.0028 + 0.0012 * smoothstep(0.03, 0.05, ax)));
      if (groove) c = mix(SKIN, SKIN_SHADE, 0.75);
      else {
        const block = Math.min(...rows.map((y) => Math.abs(p.y - y))) * 12;
        c = mix(c, SKIN_LIGHT, 0.3 * (1 - smoothstep(0, 1, Math.max(ax * 22, block))));
      }
    }
    if (Math.hypot(ax - 0.093, p.y - 1.372) < 0.0105) c = "#8d573a";
    if (Math.hypot(p.x, p.y - 1.063) < 0.0075) c = mix(SKIN, SKIN_SHADE, 0.85);
    if (ax < 0.0025 && p.y > 1.33 && p.y < 1.46) c = mix(SKIN, SKIN_SHADE, 0.5);
  }
  if (n.z < -0.2 && ax < 0.005 && p.y > 1.0 && p.y < 1.44) c = mix(SKIN, SKIN_SHADE, 0.55);
  return c;
});
const HAIR_P = grain(HAIR_A, HAIR_B, { size: 0.007, axis: [0, 1, 0], seed: 5 });
/** Trunks: red, a white hem stripe and a white side stripe down each leg. */
const TRUNKS = paint((p) => (Math.abs(p.x) > 0.193 || (p.y < 0.733 && p.y > 0.717) ? WHITE : RED));
const LENS_P = paint((_p, _n, s) => (Math.abs(s[0] * 0.55 + s[1] - 0.006) < 0.0016 ? LENS_GLINT : LENS));

export default function build() {
  const b = createBuilder({ name: "lifeguardContour", paintSize: 2048 });
  const sides = [
    ["L", 1],
    ["R", -1],
  ] as const;

  // ------------------------------------------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.0, 0],
      [0, 1.17, 0.002],
      [0, 1.33, 0.008],
      [0, 1.5, 0.0],
    ],
    { parent: hips, names: ["spine", "spine1", "spine2"], up: [0, 0, 1], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 1.5, -0.012],
    aim: [0, 1.665, -0.01],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", { parent: neck, at: [0, 1.665, -0.01], aim: [0, 1.86, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.688, -0.045],
    aim: [0, 1.628, 0.085],
    role: "jaw",
    group: "jaw",
  });

  // ------------------------------------------------------------------------------------------------- torso
  // Rows: y, front (chest), back, half width, roundness: pelvis, waist, ribs, chest, the shoulder line sloping over the
  // trapezius (back reach) into the neck, and the neck to the jaw. The waistband is the shelf between 1.006 and 1.048.
  const TORSO: Rows = [
    [0.86, 0.085, 0.085, 0.12, 1],
    [0.9, 0.1, 0.114, 0.15, 1],
    [0.94, 0.105, 0.116, 0.162, 1],
    [1.006, 0.102, 0.108, 0.158, 1],
    [1.014, 0.107, 0.113, 0.163, 1],
    [1.04, 0.107, 0.113, 0.163, 1],
    [1.048, 0.099, 0.102, 0.152, 1],
    [1.09, 0.097, 0.094, 0.147, 0.95],
    [1.16, 0.099, 0.09, 0.142, 0.95],
    [1.24, 0.106, 0.102, 0.155, 0.9],
    [1.31, 0.114, 0.112, 0.178, 0.9],
    [1.38, 0.118, 0.116, 0.19, 0.9],
    [1.43, 0.116, 0.114, 0.19, 0.92],
    [1.47, 0.1, 0.112, 0.176, 0.95],
    [1.5, 0.084, 0.102, 0.128, 1],
    [1.53, 0.068, 0.088, 0.09, 1],
    [1.56, 0.062, 0.076, 0.07, 1],
    [1.6, 0.066, 0.068, 0.064, 1],
    [1.66, 0.06, 0.064, 0.06, 1],
    [1.7, 0.054, 0.058, 0.056, 1],
  ];
  const bodyColor = (y: number) => (y < 1.014 ? RED : y < 1.048 ? WHITE : SKIN_P);
  const torso = b.sweep(
    polyline([
      [0, 0.86, 0],
      [0, 1.7, -0.006],
    ]),
    contour({
      front: column(0.86, 1.7, TORSO, 1),
      back: column(0.86, 1.7, TORSO, 2),
      side: column(0.86, 1.7, TORSO, 3),
      round: column(0.86, 1.7, TORSO, 4),
      sides: 16,
    }),
    {
      up: [0, 0, 1],
      bone: [hips, spine, neck, head],
      color: (t) => bodyColor(0.86 + t * (1.7 - 0.86)),
      caps: { start: "round", end: "round" },
      name: "torso",
      group: "body",
    },
  );

  // pecs: a lens from the breastbone to the armpit, its lower edge a shelf
  const pecs = sides.map(([, s]) =>
    b.sweep(
      catmull([
        [s * 0.014, 1.398, 0.084],
        [s * 0.085, 1.392, 0.084],
        [s * 0.16, 1.405, 0.062],
      ]),
      contour({
        front: [
          [0, 0.026],
          [0.5, 0.048],
          [1, 0.014],
        ],
        back: 0.03,
        left: [
          [0, 0.02],
          [0.35, 0.046],
          [0.7, 0.05],
          [1, 0.022],
        ],
        right: [
          [0, 0.024],
          [0.4, 0.05],
          [0.7, 0.052],
          [0.84, 0.038],
          [1, 0.012],
        ],
        mirror: s < 0,
        sides: 12,
        round: 0.9,
      }),
      { up: [0, 0, 1], bone: chest, color: SKIN_P, caps: { start: "round", end: "point" }, name: "pec", group: "body" },
    ),
  );

  // ------------------------------------------------------------------------------------------------- head
  // skull: horizontal sections up the head: cheekbones, brow ridge, and a domed crown that ends flat and tiny at 1.85
  const SKULL: Rows = [
    [1.66, 0.068, 0.075, 0.066, 1],
    [1.685, 0.079, 0.085, 0.074, 1],
    [1.72, 0.088, 0.095, 0.078, 1],
    [1.74, 0.09, 0.1, 0.078, 1],
    [1.76, 0.095, 0.102, 0.078, 1],
    [1.775, 0.089, 0.102, 0.078, 1],
    [1.79, 0.085, 0.102, 0.077, 1],
    ...dome(1.79, 1.85, [0.085, 0.102, 0.077]).map((r) => [...r, 1]),
  ];
  const skull = b.sweep(
    polyline([
      [0, 1.66, 0.004],
      [0, 1.8495, 0.004],
    ]),
    contour({
      front: column(1.66, 1.8495, SKULL, 1),
      back: column(1.66, 1.8495, SKULL, 2),
      side: column(1.66, 1.8495, SKULL, 3),
      sides: 16,
    }),
    { up: [0, 0, 1], bone: head, color: SKIN_P, name: "skull", group: "head", caps: { start: "round", end: "flat" } },
  );

  // lower jaw: a horizontal section from the ramus to the chin, hinged at `jaw`; its top edge rises toward the ear
  const JAW: Rows = [
    [-0.055, 0.03, 0.012, 0.045],
    [-0.03, 0.04, 0.016, 0.06],
    [0.0, 0.03, 0.02, 0.064],
    [0.03, 0.02, 0.023, 0.054],
    [0.05, 0.016, 0.024, 0.032],
  ];
  b.sweep(
    polyline([
      [0, 1.64, -0.055],
      [0, 1.64, 0.05],
    ]),
    contour({
      front: column(-0.055, 0.05, JAW, 1),
      back: column(-0.055, 0.05, JAW, 2),
      side: column(-0.055, 0.05, JAW, 3),
      sides: 12,
    }),
    { up: [0, 1, 0], bone: jaw, color: SKIN_P, name: "jaw", group: "jaw", caps: { start: "flat", end: "round" } },
  );

  // hair: the head sections a little fuller, the hairline a shelf above the brow, a dome over the crown
  const HAIR: Rows = [
    [1.715, 0.0, 0.092, 0.07],
    [1.735, 0.0, 0.103, 0.082],
    [1.76, 0.05, 0.109, 0.083],
    [1.796, 0.05, 0.109, 0.084],
    [1.806, 0.093, 0.109, 0.086],
    [1.83, 0.077, 0.097, 0.074],
    ...dome(1.79, 1.857, [0.093, 0.109, 0.084]).filter((r) => r[0] > 1.83),
  ];
  const hair = b.sweep(
    polyline([
      [0, 1.715, 0.004],
      [0, 1.8565, 0.004],
    ]),
    contour({
      front: column(1.715, 1.8565, HAIR, 1),
      back: column(1.715, 1.8565, HAIR, 2),
      side: column(1.715, 1.8565, HAIR, 3),
      sides: 16,
    }),
    { up: [0, 0, 1], bone: head, color: HAIR_P, name: "hair", group: "head", caps: { start: "flat", end: "flat" } },
  );

  // sunglasses pushed up on the hair: each lens lies on the hair where it sits, the temples run back over it
  const hairSkin = b.surface(hair);
  const lensOutline = (w: number, h: number) =>
    Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const sin = Math.sin(a);
      return [w * Math.cos(a) * (sin < 0 ? 0.86 : 1), h * sin * (sin > 0 ? 0.92 : 1)] as [number, number];
    });
  const bridge: THREE.Vector3[] = [];
  for (const [side, s] of sides) {
    const on = hairSkin.ray([s * 0.036, 2.0, 0.045], [0, -1, 0])!;
    const n = on.n.clone();
    const xDir = new THREE.Vector3(1, 0, 0).addScaledVector(n, -n.x).normalize();
    const yDir = new THREE.Vector3().crossVectors(n, xDir).normalize();
    const at = on.at.clone().addScaledVector(n, 0.003);
    bridge.push(
      at
        .clone()
        .addScaledVector(xDir, -s * 0.0255)
        .addScaledVector(n, 0.003),
    );
    b.extrude(lensOutline(0.0285, 0.0215), {
      at,
      x: xDir.toArray(),
      y: yDir.toArray(),
      thickness: 0.006,
      bevel: 0.0015,
      smoothing: 1,
      color: FRAME,
      bone: head,
      name: `glassesRim${side}`,
      group: "head",
    });
    b.extrude(lensOutline(0.0245, 0.0175), {
      at: at.clone().addScaledVector(n, 0.0028),
      x: xDir.toArray(),
      y: yDir.toArray(),
      thickness: 0.0035,
      bevel: 0.001,
      smoothing: 1,
      color: LENS_P,
      bone: head,
      name: `glassesLens${side}`,
      group: "head",
    });
    // temple arm: back over the hair, dropping to the ear
    const arm = [
      [0.062, 0.03],
      [0.068, 0.0],
      [0.073, -0.028],
      [0.078, -0.05],
    ].map(([x, z]) => {
      const q = hairSkin.ray([s * x, 2.0, z], [0, -1, 0]) ?? hairSkin.nearest([s * x, 1.8, z]);
      return q.at.clone().addScaledVector(q.n, 0.0022);
    });
    b.sweep(catmull(arm), 0.0022, { bone: head, color: FRAME, name: `glassesArm${side}`, group: "head", sides: 6 });
  }
  const mid = hairSkin.ray([0, 2.0, bridge[0].clone().lerp(bridge[1], 0.5).z], [0, -1, 0])!;
  b.sweep(catmull([bridge[0], mid.at.clone().addScaledVector(mid.n, 0.004), bridge[1]]), 0.0022, {
    bone: head,
    color: FRAME,
    name: "glassesBridge",
    group: "head",
    sides: 6,
  });

  // ------------------------------------------------------------------------------------------------- face
  const skullSkin = b.surface(skull);
  for (const [side, s] of sides) {
    const x = s * 0.033;
    const front = skullSkin.ray([x, 1.741, 0.3], [0, 0, -1])?.at.z ?? 0.08;
    const c = new THREE.Vector3(x, 1.741, front - 0.0035);
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
        [s * 0.013, 1.7655, 0.0935],
        [s * 0.032, 1.7735, 0.0915],
        [s * 0.052, 1.766, 0.079],
      ]),
      contour({ front: [0.0034, 0.0038, 0.003], back: 0.0025, side: 0.0034 }),
      { up: [0, 0, 1], bone: head, color: BROW, name: `brow${side}`, group: "head", sides: 8 },
    );
    // ears: a flat scoop on the side of the head, tilted back at the top
    b.sweep(
      catmull([
        [s * 0.0765, 1.757, -0.014],
        [s * 0.084, 1.731, -0.008],
        [s * 0.079, 1.705, 0.0],
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

  // nose: bridge to tip with flared wings; the zinc stripe is a sector along its ridge
  b.sweep(
    catmull([
      [0, 1.756, 0.082],
      [0, 1.72, 0.1],
      [0, 1.69, 0.115],
    ]),
    contour({
      front: [
        [0, 0.011],
        [0.5, 0.012],
        [1, 0.0145],
      ],
      back: [0.02, 0.013, 0.009],
      side: [
        [0, 0.011],
        [0.3, 0.0105],
        [0.7, 0.0135],
        [0.88, 0.0225],
        [1, 0.015],
      ],
      sides: 12,
      round: 0.9,
    }),
    {
      up: [0, 1, 0],
      bone: head,
      color: SKIN_P,
      sectors: [[-22, 22, ZINC, 0.02, 0.95]],
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
    lipPath(1.6525, 0.03, 0.074),
    contour({ front: [0.005, 0.0085, 0.0085, 0.0085, 0.005], back: 0.004, left: 0.006, right: 0.0038, sides: 8 }),
    { up: [0, 0, 1], bone: head, color: LIP, name: "lipUpper", group: "head" },
  );
  b.sweep(
    lipPath(1.6375, 0.026, 0.068),
    contour({ front: [0.005, 0.0095, 0.0095, 0.0095, 0.005], back: 0.004, left: 0.004, right: 0.007, sides: 8 }),
    { up: [0, 0, 1], bone: jaw, color: LIP, name: "lipLower", group: "jaw" },
  );
  b.sweep(lipPath(1.6448, 0.032, 0.0705), 0.0016, {
    bone: jaw,
    color: MOUTH,
    name: "mouthLine",
    group: "jaw",
    sides: 6,
  });

  // ------------------------------------------------------------------------------------------------- legs
  // Rows: y, front, back, medial, lateral. The trunks' hem is the shelf between 0.716 and 0.704.
  const LEG: Rows = [
    [0.935, 0.096, 0.11, 0.096, 0.1],
    [0.85, 0.1, 0.106, 0.094, 0.102],
    [0.78, 0.1, 0.098, 0.09, 0.104],
    [0.735, 0.107, 0.103, 0.096, 0.111],
    [0.716, 0.107, 0.101, 0.094, 0.111],
    [0.704, 0.097, 0.093, 0.086, 0.099],
    [0.62, 0.088, 0.084, 0.078, 0.09],
    [0.56, 0.076, 0.072, 0.074, 0.07],
    [0.52, 0.069, 0.064, 0.064, 0.064],
    [0.49, 0.066, 0.062, 0.062, 0.062],
    [0.45, 0.058, 0.082, 0.064, 0.066],
    [0.4, 0.052, 0.084, 0.062, 0.064],
    [0.32, 0.048, 0.07, 0.052, 0.055],
    [0.22, 0.044, 0.052, 0.042, 0.046],
    [0.14, 0.04, 0.046, 0.038, 0.042],
    [0.075, 0.04, 0.05, 0.04, 0.042],
  ];
  // Rows for the foot, by z along a path at y = 0.03: top, sole, medial, lateral, roundness.
  const FOOT: Rows = [
    [-0.07, 0.05, 0.03, 0.032, 0.032, 0.9],
    [-0.04, 0.062, 0.03, 0.037, 0.037, 0.9],
    [-0.005, 0.066, 0.03, 0.04, 0.04, 0.9],
    [0.03, 0.058, 0.022, 0.041, 0.04, 0.8],
    [0.08, 0.04, 0.022, 0.045, 0.041, 0.7],
    [0.12, 0.018, 0.03, 0.052, 0.045, 0.6],
    [0.16, 0.012, 0.03, 0.048, 0.043, 0.6],
  ];
  const legs: Chain[] = [];
  for (const [side, s] of sides) {
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.095, 0.935, 0],
        [s * 0.09, 0.5, 0.02],
        [s * 0.09, 0.075, -0.005],
      ],
      {
        parent: hips,
        names: [`upLeg${side}`, `leg${side}`],
        up: [0, 0, 1],
        role: "leg",
        contact: [s * 0.09, 0, 0.05],
        group: "legs",
      },
    );
    legs.push(leg);
    const foot = b.chain(
      `foot${side}`,
      [
        [s * 0.09, 0.075, -0.005],
        [s * 0.09, 0.03, 0.115],
        [s * 0.09, 0.02, 0.205],
      ],
      { parent: leg.joints[1], names: [`foot${side}`, `toe${side}`], up: [0, 1, 0], role: "leg", group: "legs" },
    );
    b.sweep(
      leg,
      contour({
        front: column(0.935, 0.075, LEG, 1),
        back: column(0.935, 0.075, LEG, 2),
        right: column(0.935, 0.075, LEG, 3),
        left: column(0.935, 0.075, LEG, 4),
        mirror: s < 0,
        sides: 16,
      }),
      {
        up: [0, 0, 1],
        color: (t) => (0.935 - t * 0.86 > 0.71 ? TRUNKS : SKIN_P),
        caps: { start: "round", end: "round" },
        name: `leg${side}`,
        group: "legs",
      },
    );
    b.sweep(
      polyline([
        [s * 0.09, 0.03, -0.07],
        [s * 0.09, 0.03, 0.16],
      ]),
      contour({
        front: column(-0.07, 0.16, FOOT, 1),
        back: column(-0.07, 0.16, FOOT, 2),
        right: column(-0.07, 0.16, FOOT, 3),
        left: column(-0.07, 0.16, FOOT, 4),
        round: column(-0.07, 0.16, FOOT, 5),
        mirror: s < 0,
        sides: 12,
      }),
      {
        up: [0, 1, 0],
        bone: foot,
        color: SKIN_P,
        caps: { start: "round", end: "round" },
        name: `foot${side}`,
        group: "legs",
      },
    );
    // toes: five short contoured tubes on the toe joint, the big toe longest
    for (const [i, [off, tip, w, h]] of (
      [
        [-0.026, 0.212, 0.0115, 0.012],
        [-0.008, 0.207, 0.0085, 0.0095],
        [0.008, 0.197, 0.008, 0.009],
        [0.021, 0.187, 0.0075, 0.0085],
        [0.032, 0.175, 0.007, 0.008],
      ] as const
    ).entries()) {
      const x = s * (0.09 - off);
      b.sweep(
        polyline([
          [x, h, 0.15],
          [x, h * 0.9, tip - 0.005],
        ]),
        contour({ front: [h * 0.9, h * 0.75], back: h, side: [w, w * 0.88], round: 0.8, sides: 8 }),
        {
          up: [0, 1, 0],
          bone: foot.joints[1],
          color: SKIN_P,
          caps: { start: "round", end: "round" },
          name: `toe${i + 1}${side}`,
          group: "legs",
        },
      );
    }
  }

  // ------------------------------------------------------------------------------------------------- arms and hands
  // Rows by chain t (shoulder 0, elbow 0.448, wrist 0.851, knuckles 1): front, back, upper side, underside.
  const ARM: Rows = [
    [0, 0.066, 0.064, 0.07, 0.058],
    [0.07, 0.072, 0.066, 0.078, 0.058],
    [0.16, 0.062, 0.058, 0.066, 0.052],
    [0.22, 0.053, 0.052, 0.05, 0.048],
    [0.32, 0.055, 0.052, 0.046, 0.046],
    [0.4, 0.046, 0.048, 0.04, 0.04],
    [0.448, 0.037, 0.042, 0.034, 0.034],
    [0.5, 0.044, 0.04, 0.042, 0.038],
    [0.58, 0.046, 0.042, 0.042, 0.04],
    [0.7, 0.038, 0.034, 0.036, 0.034],
    [0.8, 0.026, 0.024, 0.03, 0.028],
    [0.851, 0.022, 0.024, 0.03, 0.028],
    [0.9, 0.014, 0.02, 0.044, 0.044],
    [0.97, 0.012, 0.015, 0.046, 0.046],
    [1, 0.011, 0.013, 0.044, 0.044],
  ];
  for (const [side, s] of sides) {
    const shoulder = b.joint(`shoulder${side}`, {
      parent: chest,
      at: [s * 0.03, 1.487, 0.03],
      aim: [s * 0.185, 1.478, 0.0],
      group: "body",
    });
    const S: [number, number, number] = [s * 0.185, 1.47, -0.004];
    const E: [number, number, number] = [S[0] + s * 0.212, S[1] - 0.212, 0.006];
    const W: [number, number, number] = [E[0] + s * 0.192, E[1] - 0.186, 0.03];
    const K: [number, number, number] = [W[0] + s * 0.07, W[1] - 0.07, 0.03];
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
  // whistle cord: a loop round the neck and down to the breastbone, draped onto the body
  const cord = catmull(
    [
      [0, 1.535, -0.07],
      [0.07, 1.53, -0.03],
      [0.058, 1.49, 0.078],
      [0.022, 1.43, 0.124],
      [0, 1.412, 0.128],
      [-0.022, 1.43, 0.124],
      [-0.058, 1.49, 0.078],
      [-0.07, 1.53, -0.03],
    ],
    { closed: true },
  );
  b.sweep(skin.drape(cord, { lift: 0.0035 }), 0.0032, { color: WHITE, name: "cord", group: "body", sides: 6 });
  const whistleDir = new THREE.Vector3(0, -0.3, 0.95).normalize();
  const w0 = new THREE.Vector3(0, 1.4, 0.128);
  const w1 = w0.clone().addScaledVector(whistleDir, 0.05);
  b.sweep(
    [w0, w1],
    contour({ front: [0.011, 0.008], back: [0.008, 0.006], side: [0.009, 0.0065], round: 0.6, sides: 8 }),
    {
      up: [0, 1, 0],
      bone: chest,
      color: WHISTLE,
      caps: { start: "flat", end: "round" },
      name: "whistle",
      group: "body",
    },
  );
  b.part(new THREE.TorusGeometry(0.0055, 0.0013, 5, 10), STEEL, {
    bone: chest,
    at: w0
      .clone()
      .addScaledVector(whistleDir, -0.004)
      .addScaledVector(new THREE.Vector3(0, 1, 0), 0.004),
    dir: [1, 0, 0],
    name: "whistleRing",
    group: "body",
  });

  return b.root;
}
