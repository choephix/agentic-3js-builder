import * as THREE from "three";
import { createBuilder, bezier, catmull, paint, polyline } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "toucan",
  description: "Toco toucan perched on the ground: black body, white chest, huge orange bill with a black tip, blue eye rings.",
};

const BLACK = "#15120f";
const WHITE = "#f5f1e8";
const ORANGE = "#f28a1e";
const BLUE = "#2f7fe0";
const GREY = "#5d5b57";

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // Skeleton: root at the body centre, spine chain up to the head tip.
  const hips = b.joint("hips", { at: [0, 0.46, -0.02], role: "spine" });
  const trunk = catmull([
    [0, 0.46, -0.02],
    [0, 0.53, 0.05],
    [0, 0.62, 0.1],
    [0, 0.72, 0.13],
  ]);
  const spine = b.chain("spine", trunk, {
    parent: hips,
    names: ["back", "chest", "neck", "head"],
    role: "spine",
  });
  const head = spine.joints[3];

  // Tail: a long black plume trailing down behind the hips.
  b.chain("tail", polyline([[0, 0.46, -0.04], [0, 0.4, -0.2], [0, 0.33, -0.36]]), {
    parent: hips,
    names: ["tail1", "tail2", "tailTip"],
    role: "tail",
  });

  // Body paint: white throat and chest on the front-under side, black elsewhere.
  const coat = paint((p, n) => (n.z > 0.2 && p.y < 0.6 ? WHITE : BLACK));

  // Body tube along the spine, bulging at the chest.
  b.sweep(spine, (t) => 0.07 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.15)), {
    color: coat,
    caps: "round",
  });

  // Tail tube.
  const tail = b.chain("tailShape", polyline([[0, 0.46, -0.04], [0, 0.4, -0.2], [0, 0.33, -0.36]]), {
    parent: hips,
    names: ["tailA", "tailB", "tailC"],
  });
  b.sweep(tail, [0.05, 0.03], { color: BLACK, caps: "round" });

  // Head: a black ball, slightly stretched.
  b.part(new THREE.SphereGeometry(0.075, 14, 10), BLACK, {
    bone: head,
    at: head.local({ forward: -0.01, up: 0.0 }),
    scale: [1, 1.05, 1.1],
    name: "head",
  });

  // Eyes: blue rings with a dark pupil, one each side.
  for (const s of [1, -1]) {
    const ring = s > 0 ? head.local({ left: 0.052, up: 0.015, forward: 0.03 }) : head.local({ right: 0.052, up: 0.015, forward: 0.03 });
    const pupil = s > 0 ? head.local({ left: 0.06, up: 0.016, forward: 0.048 }) : head.local({ right: 0.06, up: 0.016, forward: 0.048 });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), BLUE, { bone: head, at: ring, name: "eyeRing" });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), BLACK, { bone: head, at: pupil, name: "pupil" });
  }

  // Bill: a long upper mandible and a shorter lower one, orange at the base, black at the tip.
  const beakUp = bezier([0, 0.745, 0.15], [0, 0.745, 0.25], [0, 0.715, 0.36], [0, 0.66, 0.42]);
  b.sweep(beakUp, (t) => [0.042 - 0.02 * t, 0.04 - 0.03 * t], {
    bone: head,
    color: ORANGE,
    bands: [
      [0.8, ORANGE],
      [1, BLACK],
    ],
    caps: { start: "round", end: "round" },
    name: "beakUpper",
  });

  const beakLow = bezier([0, 0.705, 0.15], [0, 0.7, 0.25], [0, 0.675, 0.33], [0, 0.635, 0.38]);
  b.sweep(beakLow, (t) => [0.036 - 0.014 * t, 0.022 - 0.012 * t], {
    bone: head,
    color: ORANGE,
    bands: [
      [0.8, ORANGE],
      [1, BLACK],
    ],
    caps: { start: "round", end: "round" },
    name: "beakLower",
  });

  // Wings: small black flaps along each flank.
  const wing: OutlinePoint[] = [
    [0.08, 0.06],
    [0.03, 0.03],
    [-0.04, -0.02],
    [-0.1, -0.08],
    [-0.15, -0.16, "sharp"],
    [-0.08, -0.13],
    [-0.02, -0.1],
    [0.04, -0.06],
  ];
  for (const s of [1, -1]) {
    b.extrude(wing, {
      at: [s * 0.09, 0.55, 0.0],
      x: [0, 0, 1],
      y: [0, -1, 0],
      thickness: 0.02,
      bevel: 0.006,
      smoothing: 2,
      color: BLACK,
      bone: spine.joints[1],
      name: "wing",
    });
  }

  // Legs: grey tarsi with three forward toes each.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const x = s * 0.055;
    const leg = b.chain(
      `leg${sd}`,
      polyline([
        [x, 0.44, -0.01],
        [x * 1.1, 0.24, 0.03],
        [x, 0.035, -0.015],
      ]),
      { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" },
    );
    const ankle = leg.joints[2];
    b.sweep(leg, 0.017, { color: GREY, caps: "round" });

    for (const [dx, len] of [
      [-0.022, 0.05],
      [0, 0.062],
      [0.022, 0.05],
    ] as const) {
      b.capsule([x, 0.012, -0.012], [x + dx * 1.4, 0.012, -0.012 + len], 0.011, {
        bone: ankle,
        color: GREY,
        name: `toe${sd}`,
      });
    }
  }

  return b.root;
}
