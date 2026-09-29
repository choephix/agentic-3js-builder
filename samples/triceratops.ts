// Triceratops at real size (8.5 m), four-square in a rigging rest pose. Tail, barrel trunk and short neck are one
// smooth-skinned loft drawn from the tail tip to the base of the skull, over an eight-joint tail chain that runs back
// from the hips and a spine chain that runs forward from them, so the tail grows out of the rump without a seam.
// The head is the show: a deep skull loft with a separate lower jaw, a hooked beak drawn as extruded side profiles
// (upper rostral hook over the lower predentary), two long brow horns swept on curved paths with a dark keratin tip,
// and a turned nasal horn and cheek horns. The frill is one big extrude whose outline is a smooth rim cut into
// scallops with sharp-cornered epoccipitals, a maroon rim around an ochre core panel, dressed with turned display
// spots on both faces. Turned shapes are lathes: the nasal and cheek horns, the horn bosses, eyelid rings, the
// elephantine foot pads and the skin tubercles; the hoof nails are small extrudes ringed round each pad.
import { SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { bezier, catmull } from "../src/path";
import type { Hit } from "../src/surface";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Triceratops",
  description:
    "A life-size triceratops: a scalloped display frill with sharp epoccipitals, long tapered brow horns, a hooked beak over a separate lower jaw and pillar legs on turned foot pads.",
  builtBy: "Claude Opus 5.5",
};

const HIDE = "#8a7a52";
const BACK = "#5b5236";
const STRIPE = "#4a4330";
const BELLY = "#d8c9a0";
const RIM = "#6e2a22";
const FRILL = "#d98c35";
const SPOT = "#efe0b8";
const HORN = "#ece2c6";
const HORN_TIP = "#4a3a2c";
const BEAK = "#2e2a26";
const MOUTH = "#b0565a";
const EYE = "#d49a2a";
const PUPIL = "#140f0c";
const PAD = "#4b4232";
const NAIL = "#2a241e";
const BUMP = "#6c6242";
const STUD = "#a79a6e";

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return keys[keys.length - 1][1];
}

/** Right half of the frill rim, from the skull base up to the midline notch; mirrored for the left. */
const RIM_HALF: [number, number][] = [
  [0.38, -0.14],
  [0.6, 0.14],
  [0.86, 0.5],
  [0.98, 0.88],
  [0.9, 1.18],
  [0.62, 1.36],
  [0.27, 1.38],
  [0, 1.26],
];

/** The whole rim in the frill's plane, right base to left base, counter-clockwise. */
const FRILL_RIM = catmull([
  ...RIM_HALF.map(([x, y]): V3 => [x, y, 0]),
  ...RIM_HALF.slice(0, -1)
    .reverse()
    .map(([x, y]): V3 => [-x, y, 0]),
]);

/** The rim point at `t`, pushed `h` out along the rim's outward normal. */
function rimPoint(t: number, h: number): [number, number] {
  const p = FRILL_RIM.at(t);
  const d = FRILL_RIM.tangentAt(t);
  const n = Math.hypot(d.x, d.y);
  return [p.x + (h * d.y) / n, p.y - (h * d.x) / n];
}

/**
 * Front view of the frill in its own plane (x across, y up the frill): a flat base buried in the skull, then the rim
 * from the right base over the top to the left base. Between `from` and `1 - from` the rim is cut into `count`
 * scallops, each a sharp valley, a bulging flank, a sharp epoccipital tip `height` out, a flank and the next valley.
 */
function frillOutline(count: number, height: number, from: number): OutlinePoint[] {
  const [bx, by] = RIM_HALF[0];
  const points: OutlinePoint[] = [
    [-bx, by, "sharp"],
    [bx, by, "sharp"],
  ];
  for (let t = from / 3; t < from; t += from / 3) points.push(rimPoint(t, 0));
  const step = (1 - 2 * from) / count;
  for (let i = 0; i < count; i++) {
    const t = from + i * step;
    points.push([...rimPoint(t, 0), "sharp"]);
    points.push(rimPoint(t + step * 0.25, height * 0.45));
    points.push([...rimPoint(t + step * 0.5, height), "sharp"]);
    points.push(rimPoint(t + step * 0.75, height * 0.45));
  }
  points.push([...rimPoint(1 - from, 0), "sharp"]);
  for (let t = 1 - from + from / 3; t < 1 - 1e-6; t += from / 3) points.push(rimPoint(t, 0));
  return points;
}

export default function build() {
  const b = createBuilder({ name: "triceratops" });
  const random = rng(23);

  // ---------------------------------------------------------------- tail, trunk and neck
  // One loft from the tail tip to the base of the skull; w/h are full width and height. A tapering tail swells into a
  // wide barrel with the back peaking over the hips, then falls to a short, thick neck hidden under the frill.
  const stations = [
    { at: [0, 1.35, -4.3], w: 0.1, h: 0.12 },
    { at: [0, 1.55, -3.6], w: 0.26, h: 0.3 },
    { at: [0, 1.85, -2.8], w: 0.56, h: 0.62 },
    { at: [0, 2.04, -2.3], w: 0.92, h: 1.02 },
    { at: [0, 2.14, -1.9], w: 1.3, h: 1.4 },
    { at: [0, 2.2, -1.3], w: 1.8, h: 1.65 },
    { at: [0, 2.05, -0.4], w: 2.1, h: 1.85 },
    { at: [0, 1.85, 0.5], w: 1.85, h: 1.65 },
    { at: [0, 1.72, 1.15], w: 1.25, h: 1.15 },
    { at: [0, 1.66, 1.6], w: 0.8, h: 0.8 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[5];
  const hips = b.joint("hips", { at: stations[5].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 8, role: "tail", group: "tail" });
  // Colour and belly sag are keyed on z, so they stay put along the one curve.
  const zAt = (t: number) => curve.at(t).z;
  const belly = (z: number) => Math.sin(Math.PI * Math.min(Math.max((z + 1.6) / 2.15, 0), 1));
  // Dark saddle stripes across the back and down the tail; the back and belly sectors keep their own colours.
  const stripe = (t: number) => {
    const z = zAt(t);
    return z > -3.8 && z < 0.75 && ((z + 3.8) / 0.36) % 1 > 0.6 ? STRIPE : HIDE;
  };
  const body = b.loft(stations, {
    bone: [tail, hips, spine],
    color: stripe,
    sectors: [
      [-55, 55, BACK],
      [120, 240, BELLY],
    ],
    shift: (t) => [0, -0.12 * belly(zAt(t))],
    sides: 18,
    group: "body",
  });

  // ---------------------------------------------------------------- head
  const headDir: V3 = [0, -0.3, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  // Head-local (+Z forward, +Y up): z, centre y, full width, full height. A deep skull, widest at the cheeks,
  // narrowing to a tall snout that ends in the beak.
  const upperKeys = [
    [-0.15, 0.1, 0.7, 0.75],
    [0.2, 0.05, 0.95, 0.85],
    [0.55, 0.02, 0.62, 0.72],
    [0.85, -0.04, 0.42, 0.56],
    [1.08, -0.08, 0.28, 0.44],
  ] as const;
  const upper = b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: skull,
      color: HIDE,
      sectors: [
        [-55, 55, BACK],
        [145, 215, MOUTH],
      ],
      sides: 16,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.28, 0.1],
    aim: [0, -0.36, 1.1],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [0.05, -0.32, 0.62, 0.3],
    [0.5, -0.36, 0.46, 0.24],
    [0.9, -0.36, 0.3, 0.18],
    [1.08, -0.35, 0.2, 0.14],
  ] as const;
  b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: jaw,
      color: HIDE,
      sectors: [
        [-40, 40, MOUTH],
        [125, 235, BELLY],
      ],
      sides: 14,
      group: "jaw",
    },
  );

  // Beak: side profiles extruded across the head. The upper rostral hooks down over the tip of the lower predentary.
  b.extrude(
    [
      [-0.12, 0.22],
      [0.08, 0.16],
      [0.26, 0.02],
      [0.36, -0.14],
      [0.34, -0.3, "sharp"],
      [0.24, -0.2],
      [0.1, -0.2],
      [-0.12, -0.2, "sharp"],
    ],
    {
      at: head.p([0, -0.08, 1.02]),
      x: head.d([0, 0, 1]),
      y: head.d([0, 1, 0]),
      thickness: [0.1, 0.27],
      bevel: 0.05,
      smoothing: 2,
      color: BEAK,
      bone: skull,
      group: "head",
    },
  );
  b.extrude(
    [
      [-0.12, 0.07, "sharp"],
      [0.12, 0.06],
      [0.26, 0.05, "sharp"],
      [0.2, -0.04],
      [0.04, -0.09],
      [-0.12, -0.08, "sharp"],
    ],
    {
      at: head.p([0, -0.36, 1.04]),
      x: head.d([0, 0, 1]),
      y: head.d([0, 1, 0]),
      thickness: [0.12, 0.18],
      bevel: 0.04,
      smoothing: 2,
      color: BEAK,
      bone: jaw,
      group: "jaw",
    },
  );

  const upperSkin = b.surface(upper);
  for (const s of [1, -1]) {
    // Eyes: an amber ball with a round pupil under a turned lid ring, set into the side of the skull.
    const side = upperSkin.ray(head.p([s * 1, 0.16, 0.42]), head.d([-s, 0, 0]));
    if (side) {
      const gaze = head.d([s * 0.85, 0.25, 0.3]).normalize();
      const eye = offset(side.at, side.n, -0.02);
      b.part(new SphereGeometry(0.075, 16, 12), EYE, { bone: skull, at: eye, group: "head" });
      b.part(new SphereGeometry(0.038, 10, 8), PUPIL, { bone: skull, at: offset(eye, gaze, 0.056), group: "head" });
      b.lathe(
        [
          [0.05, -0.015],
          [0.085, -0.03],
          [0.1, 0.0],
          [0.075, 0.028],
          [0.052, 0.015],
        ],
        { at: offset(eye, gaze, 0.031), axis: gaze, smoothing: 1, color: HIDE, bone: skull, group: "head" },
      );
    }

    // Brow horns: long tapered cones rising forward from bony bosses above the eyes, ivory with a dark tip.
    const brow = upperSkin.ray(head.p([s * 0.2, 1, 0.42]), head.d([0, -1, 0]));
    if (brow) {
      b.lathe(
        [
          [0, -0.04, "sharp"],
          [0.16, -0.04, "sharp"],
          [0.15, 0.03],
          [0.1, 0.08],
          [0, 0.09, "sharp"],
        ],
        { at: brow, axis: brow, smoothing: 1, color: HIDE, bone: skull, group: "head" },
      );
      const rise = head.d([s * 0.2, 0.8, 0.55]).normalize();
      const reach = head.d([s * 0.12, 0.3, 1]).normalize();
      const base = offset(brow.at, brow.n, 0.04);
      b.sprout(
        `horn${s > 0 ? "L" : "R"}`,
        brow,
        bezier(base, offset(base, rise, 0.45), offset(offset(base, reach, 1.0), rise, 0.35)),
        [0.11, 0.09, 0.065, 0.035, 0.006],
        {
          count: 0,
          caps: { end: "point" },
          bands: [
            [0.72, HORN],
            [1, HORN_TIP],
          ],
          sides: 14,
          group: "head",
        },
      );
    }

    // Cheek horns: short turned cones on the jugal flare, pointing out and down.
    const cheek = upperSkin.ray(head.p([s * 1, -0.14, 0.2]), head.d([-s, 0, 0]));
    if (cheek)
      b.lathe(
        [
          [0, -0.05, "sharp"],
          [0.085, -0.05, "sharp"],
          [0.07, 0.06],
          [0.03, 0.14],
          [0, 0.19, "sharp"],
        ],
        {
          at: cheek,
          axis: head.d([s * 0.8, -0.55, -0.1]),
          smoothing: 1,
          color: HORN,
          bone: skull,
          group: "head",
        },
      );

    // Nostrils high on the snout just behind the beak.
    const nose = upperSkin.ray(head.p([s * 1, 0.04, 0.9]), head.d([-s, -0.3, 0]));
    if (nose)
      b.stick(new SphereGeometry(0.5, 10, 6), PUPIL, nose, {
        bone: skull,
        flow: head.d([0, 0.4, 1]),
        scale: [0.04, 0.02, 0.08],
        embed: 0.5,
        group: "head",
      });
  }

  // Nasal horn: a short turned cone leaning forward over the snout.
  const nasal = upperSkin.ray(head.p([0, 1, 0.9]), head.d([0, -1, 0]));
  if (nasal)
    b.lathe(
      [
        [0, -0.06, "sharp"],
        [0.1, -0.06, "sharp"],
        [0.09, 0.06],
        [0.045, 0.2],
        [0, 0.36, "sharp"],
      ],
      { at: nasal, axis: head.d([0, 1, 0.45]), smoothing: 1, color: HORN, bone: skull, group: "head" },
    );

  // ---------------------------------------------------------------- frill
  // Sweeping up and back from the back of the skull over the neck. Outline x runs to the creature's left, y up the
  // frill; the +z face looks forward and up.
  const frillX = head.d([1, 0, 0]);
  const frillY = head.d([0, 0.55, -0.85]).normalize();
  const frillAt = head.p([0, 0.3, -0.08]);
  const outline = frillOutline(16, 0.13, 0.12);
  const [t0, t1] = [0.12, 0.05];
  const yLow = Math.min(...outline.map((p) => p[1]));
  const yHigh = Math.max(...outline.map((p) => p[1]));
  const thick = (v: number) => t0 + ((t1 - t0) * (v - yLow)) / (yHigh - yLow);
  const frill = b.extrude(outline, {
    at: frillAt,
    x: frillX,
    y: frillY,
    thickness: [t0, t1],
    bevel: 0.025,
    smoothing: 2,
    color: RIM,
    bone: skull,
    group: "head",
  });
  // The ochre core: the smooth rim shrunk toward the frill's centre, standing proud of both faces by `e`.
  const shrink = ([x, y]: readonly [number, number], k: number): [number, number] => [x * k, 0.55 + (y - 0.55) * k];
  const [bx, by] = RIM_HALF[0];
  const core: OutlinePoint[] = [
    [...shrink([-bx, by], 0.76), "sharp"],
    [...shrink([bx, by], 0.76), "sharp"],
    ...RIM_HALF.slice(1).map((p) => shrink(p, 0.76)),
    ...RIM_HALF.slice(1, -1)
      .reverse()
      .map(([x, y]) => shrink([-x, y], 0.76)),
  ];
  const e = 0.014;
  const coreYs = core.map((p) => p[1]);
  b.extrude(core, {
    at: frillAt,
    x: frillX,
    y: frillY,
    thickness: [thick(Math.min(...coreYs)) + e, thick(Math.max(...coreYs)) + e],
    bevel: 0.014,
    smoothing: 2,
    color: FRILL,
    bone: skull,
    group: "head",
  });
  // A sunburst on both faces of the core: maroon rays fanning from the base between an arc of turned cream spots,
  // and a midline ridge up to the notch.
  const onFace = ([u, v]: readonly [number, number], face: number) => frill.local([u, v, (face * (thick(v) + e)) / 2]);
  for (const face of [1, -1]) {
    const axis = frill.dir([0, 0, face]);
    for (const [t, r] of [
      [0.17, 0.07],
      [0.26, 0.095],
      [0.35, 0.095],
      [0.435, 0.07],
    ] as const)
      for (const tt of [t, 1 - t])
        b.lathe(
          [
            [0, -0.02, "sharp"],
            [r, -0.02, "sharp"],
            [r, 0.012],
            [r * 0.8, 0.024],
            [0, 0.026, "sharp"],
          ],
          {
            at: onFace(shrink(rimPoint(tt, 0), 0.6), face),
            axis,
            smoothing: 1,
            color: SPOT,
            bone: skull,
            group: "head",
          },
        );
    for (const t of [0.215, 0.305, 0.39])
      for (const tt of [t, 1 - t]) {
        const tip = shrink(rimPoint(tt, 0), 0.74);
        b.capsule(onFace([tip[0] * 0.2, 0.2], face), onFace(tip, face), [0.032, 0.018], {
          color: RIM,
          bone: skull,
          group: "head",
        });
      }
    b.capsule(onFace([0, 0.05], face), onFace([0, 1.08], face), [0.045, 0.025], {
      color: RIM,
      bone: skull,
      group: "head",
    });
  }

  // ---------------------------------------------------------------- legs
  // Pillar legs on turned, elephantine pads, hoof nails ringed round the front of each. Hind legs are long (knee
  // forward, ankle back); forelegs shorter, elbows back and a little out.
  const hoof: OutlinePoint[] = [
    [-0.06, 0, "sharp"],
    [0.055, 0, "sharp"],
    [0.085, 0.045],
    [0.04, 0.13],
    [-0.06, 0.14, "sharp"],
  ];
  const legTubes: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs = [
      {
        kind: "hind",
        parent: hips,
        root: [s * 0.6, 1.95, -1.3] as V3,
        foot: [s * 0.68, 0.24, -1.2] as V3,
        lengths: [0.9, 0.72, 0.28],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ] as V3[],
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        rx: [0.5, 0.32, 0.22, 0.2],
        ry: [0.58, 0.34, 0.22, 0.2],
        pad: [0.3, 0.34],
        nails: { count: 3, span: 36 },
      },
      {
        kind: "front",
        parent: spine.joints[2],
        root: [s * 0.62, 1.55, 0.75] as V3,
        foot: [s * 0.82, 0.22, 0.95] as V3,
        lengths: [0.72, 0.58, 0.22],
        bends: [
          [s * 0.4, 0, -1],
          [0, 0, 1],
        ] as V3[],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        rx: [0.36, 0.26, 0.19, 0.18],
        ry: [0.4, 0.27, 0.19, 0.18],
        pad: [0.25, 0.3],
        nails: { count: 5, span: 62 },
      },
    ];
    for (const leg of legs) {
      const points = limb(leg.root, leg.foot, leg.lengths, leg.bends);
      const end = points[points.length - 1];
      const group = `leg${leg.kind}${side}`;
      const chain = b.chain(`leg${leg.kind === "hind" ? "H" : "F"}${side}`, [...points, [end.x, end.y, end.z + 0.2]], {
        parent: leg.parent,
        names: leg.names,
        role: "leg",
        contact: [end.x, 0, end.z],
        group,
      });
      // The tube stops at the foot joint; radii are keyed at the hip, knee, ankle and foot.
      const rx = leg.rx.map((r, i) => [chain.ts[i], r] as const);
      const ry = leg.ry.map((r, i) => [chain.ts[i], r] as const);
      legTubes.push(
        b.sweep(chain, (t) => [interp(rx, t), interp(ry, t)], { to: chain.ts[3], color: HIDE, sides: 14, group }),
      );
      const footJoint = chain.joints[3];
      const [padR, padH] = leg.pad;
      const pad = b.lathe(
        [
          [0, 0, "sharp"],
          [padR, 0, "sharp"],
          [padR * 1.07, padH * 0.22],
          [padR * 0.97, padH * 0.6],
          [padR * 0.78, padH],
          [0, padH, "sharp"],
        ],
        { at: [end.x, 0, end.z], smoothing: 2, color: PAD, bone: footJoint, group },
      );
      b.ring(
        frame(pad, [0, 1, 0]),
        { count: leg.nails.count, radius: padR * 0.92, fromDeg: -leg.nails.span, toDeg: leg.nails.span },
        (item) =>
          b.extrude(hoof, {
            at: item,
            x: item.outward,
            y: [0, 1, 0],
            thickness: leg.kind === "hind" ? 0.14 : 0.1,
            bevel: 0.02,
            smoothing: 2,
            color: NAIL,
            bone: footJoint,
            group,
          }),
      );
    }
  }

  // ---------------------------------------------------------------- skin details
  // Rounded tubercles: pale and dark on the flanks and the base of the tail, dark along the back, smaller down the
  // legs.
  const tubercle = (r: number): OutlinePoint[] => [
    [0, -0.4 * r, "sharp"],
    [r, -0.4 * r, "sharp"],
    [0.95 * r, 0.25 * r],
    [0, 0.7 * r, "sharp"],
  ];
  const trunk = b.surface([body]);
  for (const [surface, count, minDist, r, filter, colors] of [
    [trunk, 70, 0.26, 0.055, (h: Hit) => Math.abs(h.n.y) < 0.6 && h.at.z > -2.8 && h.at.z < 1.0, [BUMP, STUD]],
    [trunk, 40, 0.24, 0.05, (h: Hit) => h.n.y >= 0.6 && h.at.z > -3.2 && h.at.z < 0.9, [BUMP]],
    [b.surface(legTubes), 44, 0.16, 0.04, (h: Hit) => h.at.y > 0.45 && h.n.y > -0.3, [BUMP, STUD]],
  ] as const)
    for (const hit of surface.scatter(count, { rng: random, minDist, filter }))
      b.lathe(tubercle(r * (0.75 + random() * 0.5)), {
        at: hit,
        axis: hit,
        segments: 7,
        smoothing: 1,
        color: colors[Math.floor(random() * colors.length)],
      });

  // Rest pose: the jaw a little open.
  b.pose(jaw, { axis: head.d([1, 0, 0]), deg: 8 });
  return b.root;
}
