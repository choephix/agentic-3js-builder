import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

export const meta = {
  name: "Armoured Knight",
  description:
    "A stylised plate-armoured knight: bucket helm with a crimson plume, gold trim, crimson tabard, round heraldic shield, sword in the right hand and a hanging cape. Rest pose, built from primitives.",
};

type Pt = [number, number, number];

const STEEL = "#b9c1cb";
const STEEL_DK = "#667080";
const GOLD = "#d8a53e";
const CRIMSON = "#9b1f28";
const CRIMSON_DK = "#5c1219";
const LEATHER = "#4a2d1b";
const SLIT = "#0c0c0f";

const Y: Pt = [0, 1, 0];
const Z: Pt = [0, 0, 1];

const unit = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const mix = (a: Pt, c: Pt, t: number): Pt => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const step = (a: Pt, d: Pt, k: number): Pt => [
  a[0] + d[0] * k,
  a[1] + d[1] * k,
  a[2] + d[2] * k,
];
const sphere = (r: number) => new THREE.SphereGeometry(r, 10, 8);
const block = (w: number, h: number, d: number) =>
  new THREE.BoxGeometry(w, h, d);
const around = (n: number) =>
  Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2);

export default function build() {
  const b = createBuilder({ name: "armored-knight" });
  type Body = Parameters<typeof b.surface>[0];

  // A lofted tube through [point, radius] stations.
  const tube = (stations: [Pt, number][], color: string) =>
    b.loft(
      stations.map(([at, radius]) => ({ at, radius })),
      { color },
    );

  // A closed band (a rectangle turned round an axis) through `at`.
  const band = (
    at: Pt,
    axis: Pt,
    r: number,
    h: number,
    t: number,
    color: string,
  ) =>
    b.lathe([[r, 0], [r + t, 0], [r + t, h], [r, h]], {
      at,
      axis: unit(axis),
      color,
    });

  // A turned solid: [radius, height] profile, closed on its axis.
  const turned = (
    at: Pt,
    axis: Pt,
    profile: [number, number][],
    color: string,
  ) => b.lathe(profile, { at, axis: unit(axis), color });

  // Studs seated on a round body at height y; angle 0 is the front (+Z).
  const studs = (
    body: Body,
    y: number,
    R: number,
    angles: number[],
    r: number,
    color: string,
  ) => {
    const s = b.surface(body);
    for (const a of angles) {
      const p: Pt = [Math.sin(a) * (R + 0.05), y, Math.cos(a) * (R + 0.05)];
      b.stick(sphere(r), color, s.nearest(p));
    }
  };

  // ---- skeleton, rest pose ----
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.joint("spine", { at: [0, 1.28, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.46, 0], parent: spine });
  b.joint("head", { at: [0, 1.64, 0], parent: neck });

  // ---- limbs, mirrored (+1 = left, -1 = right) ----
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): Pt => [x * s, y, z];

    const hip = b.joint("hip" + L, { at: P(0.13, 0.94, 0), parent: hips });
    const knee = b.joint("knee" + L, { at: P(0.14, 0.5, 0.02), parent: hip });
    const ankle = b.joint("ankle" + L, { at: P(0.14, 0.1, 0), parent: knee });
    b.joint("toe" + L, { at: P(0.14, 0.04, 0.17), parent: ankle });

    const shoulder = b.joint("shoulder" + L, {
      at: P(0.27, 1.38, 0),
      parent: spine,
    });
    const elbow = b.joint("elbow" + L, {
      at: P(0.33, 1.12, 0.04),
      parent: shoulder,
    });
    const wrist = b.joint("wrist" + L, {
      at: P(0.33, 0.9, 0.22),
      parent: elbow,
    });
    b.joint("hand" + L, { at: P(0.33, 0.86, 0.27), parent: wrist });

    // Leg: cuisse, knee cop with a gold boss, greave with a gold band, sabaton.
    tube(
      [
        [P(0.13, 0.95, 0), 0.1],
        [P(0.14, 0.72, 0.01), 0.1],
        [P(0.14, 0.5, 0.02), 0.085],
      ],
      STEEL,
    );
    turned(
      P(0.14, 0.5, 0.06),
      Z,
      [[0, 0], [0.078, 0], [0.092, 0.02], [0.088, 0.05], [0.06, 0.07], [0, 0.078]],
      STEEL,
    );
    b.stick(sphere(0.022), GOLD, frame(P(0.14, 0.5, 0.135), Z));
    tube(
      [
        [P(0.14, 0.5, 0.02), 0.085],
        [P(0.14, 0.32, 0), 0.09],
        [P(0.14, 0.14, 0), 0.066],
      ],
      STEEL,
    );
    band(P(0.14, 0.36, 0), Y, 0.089, 0.022, 0.012, GOLD);
    tube(
      [
        [P(0.14, 0.065, -0.05), 0.065],
        [P(0.14, 0.06, 0.06), 0.06],
        [P(0.14, 0.045, 0.17), 0.045],
      ],
      STEEL_DK,
    );

    // Arm: pauldron with a gold lame, couter, vambrace with gold bands, gauntlet with a cuff.
    const pc = P(0.25, 1.42, 0);
    const pd: Pt = [s, 0.35, 0];
    turned(
      pc,
      pd,
      [[0, 0], [0.1, 0], [0.122, 0.03], [0.116, 0.066], [0.086, 0.098], [0, 0.116]],
      STEEL,
    );
    band(step(pc, unit(pd), 0.03), pd, 0.118, 0.02, 0.012, GOLD);
    b.stick(sphere(0.02), GOLD, frame(step(pc, unit(pd), 0.116), pd));

    const E = P(0.33, 1.12, 0.04);
    const W = P(0.33, 0.9, 0.22);
    const fore: Pt = unit([0, -0.22, 0.18]);
    tube(
      [
        [P(0.27, 1.38, 0), 0.075],
        [P(0.3, 1.25, 0.02), 0.068],
        [E, 0.06],
      ],
      STEEL,
    );
    b.stick(sphere(0.062), STEEL_DK, frame(E, Z));
    tube(
      [
        [E, 0.058],
        [P(0.335, 1.01, 0.13), 0.055],
        [W, 0.05],
      ],
      STEEL,
    );
    band(mix(E, W, 0.3), fore, 0.057, 0.02, 0.012, GOLD);
    band(mix(E, W, 0.7), fore, 0.052, 0.02, 0.012, GOLD);
    band(W, fore, 0.052, 0.035, 0.012, LEATHER);
    b.stick(sphere(0.05), STEEL_DK, frame(P(0.33, 0.86, 0.27), fore));
  }

  // ---- torso: cuirass, faulds, belt, tabard ----
  const torso = tube(
    [
      [[0, 0.98, 0], 0.15],
      [[0, 1.08, 0], 0.152],
      [[0, 1.2, 0], 0.176],
      [[0, 1.31, 0], 0.2],
      [[0, 1.42, 0], 0.19],
      [[0, 1.5, 0], 0.14],
    ],
    STEEL,
  );
  turned(
    [0, 0.88, 0],
    Y,
    [[0.152, 0.12], [0.19, 0], [0.205, 0], [0.165, 0.12]],
    STEEL_DK,
  );
  band([0, 0.885, 0], Y, 0.2, 0.012, 0.01, GOLD);
  band([0, 1.035, 0], Y, 0.151, 0.05, 0.014, LEATHER);
  studs(
    torso,
    1.14,
    0.163,
    [0.8, 1.3, 1.85, 2.4, 2.9, -2.9, -2.4, -1.85, -1.3, -0.8],
    0.011,
    GOLD,
  );

  // Crimson tabard with a gold cross, hanging over the front of the cuirass.
  b.extrude(
    [[-0.085, 0.2], [0.085, 0.2], [0.095, -0.12], [0, -0.25], [-0.095, -0.12]],
    { at: [0, 1.22, 0.19], x: [1, 0, 0], y: Y, depth: 0.012, color: CRIMSON },
  );
  b.stick(block(0.03, 0.012, 0.2), GOLD, frame([0, 1.24, 0.205], Z));
  b.stick(block(0.13, 0.012, 0.03), GOLD, frame([0, 1.24, 0.205], Z));

  // Cape hanging from the shoulders down the back.
  b.membrane(
    [[-0.2, 1.44, -0.2], [0, 1.5, -0.23], [0.2, 1.44, -0.2]],
    [[-0.26, 0.32, -0.36], [0, 0.28, -0.4], [0.26, 0.32, -0.36]],
    { color: CRIMSON_DK },
  );

  // ---- head: great helm with gold bands, slit, breath holes and crest ----
  const helm = turned(
    [0, 1.47, 0],
    Y,
    [
      [0, 0],
      [0.15, 0],
      [0.166, 0.02],
      [0.172, 0.1],
      [0.172, 0.24],
      [0.166, 0.3],
      [0.14, 0.336],
      [0.09, 0.354],
      [0, 0.358],
    ],
    STEEL,
  );
  band([0, 1.47, 0], Y, 0.172, 0.03, 0.012, GOLD);
  band([0, 1.72, 0], Y, 0.166, 0.02, 0.012, GOLD);
  studs(helm, 1.53, 0.172, around(10), 0.011, GOLD);
  b.stick(block(0.2, 0.02, 0.03), SLIT, frame([0, 1.66, 0.172], Z));
  studs(helm, 1.6, 0.172, [-0.12, -0.06, 0, 0.06, 0.12], 0.009, SLIT);
  studs(helm, 1.565, 0.172, [-0.12, -0.06, 0, 0.06, 0.12], 0.009, SLIT);

  // Gold crest mount and crimson plume sweeping back.
  turned(
    [0, 1.82, 0],
    Y,
    [[0, 0], [0.07, 0], [0.075, 0.02], [0.05, 0.045], [0, 0.05]],
    GOLD,
  );
  tube(
    [
      [[0, 1.85, 0], 0.035],
      [[0, 1.93, -0.03], 0.045],
      [[0, 1.99, -0.085], 0.04],
      [[0, 2.02, -0.15], 0.014],
    ],
    CRIMSON,
  );

  // ---- round heraldic shield on the left arm ----
  const N = unit([0.3, 0, 1]);
  const C: Pt = [0.36, 1.02, 0.3];
  const back = step(C, N, -0.04);
  const face = step(C, N, 0.04);
  turned(
    back,
    N,
    [
      [0, 0],
      [0.1, 0],
      [0.17, 0.008],
      [0.2, 0.02],
      [0.21, 0.04],
      [0.2, 0.06],
      [0.17, 0.072],
      [0.1, 0.08],
      [0, 0.08],
    ],
    CRIMSON,
  );
  band(back, N, 0.2, 0.08, 0.02, GOLD);
  b.stick(block(0.035, 0.02, 0.32), GOLD, frame(face, N));
  b.stick(block(0.32, 0.02, 0.035), GOLD, frame(face, N));
  b.stick(sphere(0.045), GOLD, frame(step(face, N, 0.01), N));

  // ---- sword in the right hand, point down, tip on the ground ----
  const H: Pt = [-0.33, 0.86, 0.27];
  const T: Pt = [-0.36, 0, 0.5];
  const d = unit([T[0] - H[0], T[1] - H[1], T[2] - H[2]]);
  const pommel = step(H, d, -0.1);
  const guard = step(H, d, 0.07);
  const edge = step(guard, d, 0.012);
  const g1: Pt = [guard[0] - 0.11, guard[1], guard[2]];
  const g2: Pt = [guard[0] + 0.11, guard[1], guard[2]];
  tube(
    [
      [pommel, 0.013],
      [guard, 0.014],
    ],
    LEATHER,
  );
  b.stick(sphere(0.022), GOLD, frame(pommel, d));
  tube(
    [
      [g1, 0.014],
      [g2, 0.014],
    ],
    GOLD,
  );
  tube(
    [
      [edge, 0.02],
      [mix(edge, T, 0.4), 0.017],
      [mix(edge, T, 0.85), 0.011],
      [T, 0.003],
    ],
    STEEL,
  );

  return b.root;
}
