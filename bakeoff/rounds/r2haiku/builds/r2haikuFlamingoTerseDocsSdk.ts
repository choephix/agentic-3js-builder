import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  bezier,
  paint,
  countershade,
  type OutlinePoint,
} from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "A standing greater flamingo: S-curved neck, bent beak, backward-hocked legs and a folded coral wing with black flight tips.",
};

const BODY_BACK = "#f792b0";
const BODY_BELLY = "#fcd2de";
const NECK = "#f8b3c7";
const CORAL = "#ee5a7a";
const LEG = "#e8708c";
const BEAK = "#f48fa8";
const BLACK = "#1d1a1f";
const EYE = "#f2c94c";

const WING: OutlinePoint[] = [
  [0, 0.1],
  [0.12, 0.13],
  [0.3, 0.12],
  [0.42, 0.05],
  [0.5, -0.02, "sharp"],
  [0.42, -0.08],
  [0.28, -0.1],
  [0.12, -0.08],
  [0, -0.04],
];

const TAIL: OutlinePoint[] = [
  [0, 0.07],
  [0.1, 0.11],
  [0.2, 0.05, "sharp"],
  [0.18, -0.04],
  [0.06, -0.06],
  [0, -0.03],
];

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton: hips root, body spine, S-neck with head tip, two legs.
  const hips = b.joint("hips", { at: [0, 0.95, -0.05] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.93, -0.12],
      [0, 0.96, 0.04],
      [0, 1.0, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.2],
      [0, 1.22, 0.3],
      [0, 1.44, 0.2],
      [0, 1.52, 0.36],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  const head = neck.joints[neck.joints.length - 1];

  // Body and neck.
  b.sweep(spine, [0.09, 0.19, 0.14], {
    color: countershade(BODY_BACK, BODY_BELLY, { level: 0 }),
  });
  b.sweep(neck, [0.05, 0.04, 0.034, 0.042], { color: NECK });

  // Head: flattened, slightly elongated ball.
  b.part(new THREE.SphereGeometry(0.07, 12, 8).scale(1, 1.2, 1), NECK, { frame: head });

  // Eyes: yellow ring with a black pupil on each side.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.062, up: 0.01, forward: 0.01 }),
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.07, up: 0.012, forward: 0.01 }),
    });
  }

  // Bent beak: pink base, black hooked tip.
  const beak = bezier(
    head.local({ forward: 0.05, up: -0.02 }),
    head.local({ forward: 0.13, up: -0.02 }),
    head.local({ forward: 0.2, up: -0.03 }),
    head.local({ forward: 0.2, up: -0.1 }),
  );
  b.sweep(beak, [0.024, 0.009], {
    bone: head,
    color: paint((_p, _n, s) => (s[0] > 0.55 ? BLACK : BEAK)),
  });

  // Folded wings: coral coverts with black flight-feather tips.
  for (const s of [1, -1]) {
    b.extrude(WING, {
      at: [s * 0.185, 0.97, 0.06],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 2,
      bone: spine.joints[1],
      color: paint((_p, _n, s2) => (s2[0] > 0.36 ? BLACK : CORAL)),
    });
  }

  // Short fanned tail with black tips.
  b.extrude(TAIL, {
    at: [0, 0.95, -0.1],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.024,
    bevel: 0.006,
    smoothing: 1,
    bone: spine.joints[0],
    color: paint((_p, _n, s) => (s[0] > 0.15 ? BLACK : CORAL)),
  });

  // Legs: thigh into the body, backward-bent hock, forward foot with three toes.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.07, 0.9, -0.03],
        [s * 0.07, 0.5, -0.15],
        [s * 0.07, 0.012, 0.08],
      ]),
      { parent: hips, names: [`hip${S}`, `hock${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(leg, [0.022, 0.013, 0.011], { color: LEG });

    const foot = leg.joints[leg.joints.length - 1];
    for (const k of [-1, 0, 1]) {
      b.rod(foot, foot.local({ forward: 0.07, left: k * 0.03 }), 0.008, {
        color: LEG,
        bone: foot,
      });
    }
  }

  return b.root;
}
