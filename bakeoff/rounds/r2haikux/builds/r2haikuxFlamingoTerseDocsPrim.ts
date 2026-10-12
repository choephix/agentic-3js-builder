import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, gradient, paint, polyline } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A standing flamingo: S-curved neck, hooked bill with a black tip, pink coverts with black primaries, webbed feet.",
};

// Palette: one pink family, a hot coral for the coverts, black for the flight feathers.
const BODY = "#f7a2bd";
const BELLY = "#ffdbe6";
const COVERT = "#ec5583";
const LEG = "#f7869f";
const FOOT_COLOR = "#d9557a";
const BLACK = "#17141a";
const EYE = "#fff3c4";

// Piecewise-linear profiles along a tube's source t.
type Stations = [number, number][];
function along(t: number, st: Stations): number {
  if (t <= st[0][0]) return st[0][1];
  for (let i = 1; i < st.length; i++) {
    const [t0, v0] = st[i - 1];
    const [t1, v1] = st[i];
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
  }
  return st[st.length - 1][1];
}

const BODY_RX: Stations = [[0, 0.06], [0.25, 0.115], [0.55, 0.125], [0.8, 0.115], [1, 0.085]];
const BODY_RY: Stations = [[0, 0.07], [0.25, 0.12], [0.55, 0.13], [0.8, 0.115], [1, 0.09]];
const NECK_R: Stations = [[0, 0.07], [0.3, 0.05], [0.7, 0.04], [1, 0.042]];
const LEG_R: Stations = [[0, 0.03], [0.3, 0.024], [0.6, 0.02], [0.85, 0.017], [1, 0.015]];

// Feather rows: pale shoulder, hot coverts, black primaries with a scalloped edge.
const wingPaint = paint((_p, _n, s) =>
  s[0] < -0.2 + 0.03 * Math.sin(s[1] * 50) ? BLACK : s[0] > 0 ? BODY : COVERT,
);

// Folded wing in the side plane: u runs forward, v up, from the wing's origin.
const WING: OutlinePoint[] = [
  [0.17, 0.12],
  [0.02, 0.14],
  [-0.14, 0.13],
  [-0.3, 0.08],
  [-0.44, 0.02],
  [-0.49, -0.05, "sharp"],
  [-0.36, -0.08],
  [-0.2, -0.1],
  [-0.06, -0.08],
  [0.08, -0.04],
  [0.17, 0],
];

// A drooping primary: base at the origin, tip `len` back and `droop` down.
function feather(len: number, width: number, droop: number): OutlinePoint[] {
  return [
    [0, width],
    [-len * 0.5, width * 1.15],
    [-len, -droop, "sharp"],
    [-len * 0.5, -width * 0.6 - droop * 0.5],
    [0, -width],
  ];
}

// [z, y, length, droop, half width] for the three primaries that trail past the tail.
const PRIMARIES: [number, number, number, number, number][] = [
  [-0.2, 0.83, 0.25, 0.05, 0.022],
  [-0.22, 0.81, 0.28, 0.1, 0.02],
  [-0.24, 0.79, 0.3, 0.14, 0.018],
];

// Webbed foot lying on the floor: u across, v forward, origin at the toe joint.
const WEB: OutlinePoint[] = [
  [0, -0.035],
  [0.03, -0.01],
  [0.065, 0.09, "sharp"],
  [0.03, 0.045],
  [0, 0.13, "sharp"],
  [-0.03, 0.045],
  [-0.065, 0.09, "sharp"],
  [-0.03, -0.01],
];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.76, -0.02], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.83, -0.26],
      [0, 0.79, -0.02],
      [0, 0.8, 0.14],
      [0, 0.84, 0.22],
    ]),
    { parent: hips, names: ["rump", "back", "chest", "breast"], role: "spine" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.86, -0.24],
      [0, 0.92, -0.36],
      [0, 0.95, -0.45],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.92, 0.16],
      [0, 1.1, 0.32],
      [0, 1.28, 0.25],
      [0, 1.4, 0.31],
    ]),
    { parent: spine, names: ["neckLow", "neckMid", "neckHigh", "neckTop"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 1.42, 0.33], dir: [0, 0, 1], role: "head" });
  const jawTip = head.local({ forward: 0.15, up: -0.08 });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, up: -0.03 }),
    aim: jawTip,
    role: "jaw",
  });

  // ---- Body, tail, neck, head --------------------------------------------
  b.sweep(spine, (t): [number, number] => [along(t, BODY_RX), along(t, BODY_RY)], {
    color: countershade(BODY, BELLY),
    sides: 10,
  });
  b.sweep(tail, (t): [number, number] => [0.05 + 0.03 * t, 0.02], { color: COVERT });
  b.sweep(neck, (t) => along(t, NECK_R), {
    color: gradient(BODY, BELLY, [0, 0.95, 0.2], [0, 1.36, 0.3]),
  });
  b.part(new THREE.SphereGeometry(0.07, 10, 8), BELLY, {
    bone: head,
    at: head.at,
    scale: [0.95, 0.9, 1.15],
    flat: true,
  });

  // Bill: pale base, black tip. The upper bill hooks down; the jaw is the lower mandible.
  b.sweep(
    bezier(
      head.local({ forward: 0.05, up: 0.01 }),
      head.local({ forward: 0.1, up: 0 }),
      head.local({ forward: 0.15, up: -0.03 }),
      head.local({ forward: 0.16, up: -0.14 }),
    ),
    [0.03, 0.012],
    { bone: head, color: BELLY, bands: [[0.62, BELLY], [1, BLACK]] },
  );
  b.capsule(jaw, jawTip, [0.02, 0.008], {
    bone: jaw,
    color: BELLY,
    bands: [[0.55, BELLY], [1, BLACK]],
  });

  // Eyes on either side of the head: a pale ball with a black pupil facing out.
  for (const side of [1, -1]) {
    const eye =
      side > 0
        ? head.local({ left: 0.058, up: 0.012, forward: 0.012 })
        : head.local({ right: 0.058, up: 0.012, forward: 0.012 });
    const pupil =
      side > 0
        ? head.local({ left: 0.073, up: 0.014, forward: 0.022 })
        : head.local({ right: 0.073, up: 0.014, forward: 0.022 });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), EYE, { bone: head, at: eye });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), BLACK, { bone: head, at: pupil });
  }

  // ---- Legs, wings, feet --------------------------------------------------
  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";

    // Digitigrade leg: knee bends forward inside the belly, heel bends back, toes forward on the floor.
    const leg = b.chain(
      `leg${s}`,
      polyline([
        [side * 0.075, 0.72, 0],
        [side * 0.085, 0.47, 0.08],
        [side * 0.08, 0.25, -0.07],
        [side * 0.085, 0, 0.08],
      ]),
      { parent: hips, names: [`hip${s}`, `knee${s}`, `heel${s}`, `foot${s}`], role: "leg" },
    );
    b.sweep(leg, (t) => along(t, LEG_R), { color: LEG });

    b.extrude(WEB, {
      at: [side * 0.085, 0.008, 0.08],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: FOOT_COLOR,
      bone: leg.joints[3],
    });

    // Folded wing: a painted slab over the flank, with black primaries trailing past the tail.
    const wing = b.chain(
      `wing${s}`,
      catmull([
        [side * 0.12, 0.9, 0.1],
        [side * 0.13, 0.84, -0.12],
        [side * 0.13, 0.78, -0.42],
      ]),
      { parent: hips, names: [`shoulder${s}`, `elbow${s}`, `wingTip${s}`], role: "wing" },
    );
    b.extrude(WING, {
      at: [side * 0.14, 0.8, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: wingPaint,
      bone: wing.joints[1],
    });

    for (const [z, y, len, droop, w] of PRIMARIES) {
      b.extrude(feather(len, w, droop), {
        at: [side * 0.158, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.01,
        bevel: 0.003,
        smoothing: 1,
        color: BLACK,
        bone: wing.joints[2],
      });
    }
  }

  return b.root;
}
