import * as THREE from "three";
import { createBuilder, limb, catmull, paint, countershade } from "../../../../src/index";

const BODY = "#f6b6cb";
const BODY_BELLY = "#ef8fb1";
const CORAL = "#ec5f8a";
const BLACK = "#1d1a1f";
const BEAK = "#f7c4d2";
const LEG = "#e8779f";

export const meta = {
  name: "flamingo",
  description: "A standing pink flamingo with an S-curved neck, bent beak and folded black-tipped wings.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // Skeleton: hips -> spine -> neck -> head
  const hips = b.joint("hips", { at: [0, 0.7, -0.02], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.1],
      [0, 0.76, 0.05],
      [0, 0.8, 0.18],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.84, 0.16],
      [0, 1.02, 0.26],
      [0, 1.16, 0.18],
      [0, 1.3, 0.3],
    ]),
    { parent: spine.joints[spine.joints.length - 1], count: 4, role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.3, 0.3],
    dir: [0, -0.25, 1],
    role: "head",
  });

  // Body: tapered tube along the spine
  b.sweep(spine, (t: number) => 0.1 + 0.03 * Math.sin(Math.PI * t), {
    color: countershade(BODY, BODY_BELLY, { level: 0.1 }),
  });

  // Short stubby tail
  b.sweep(
    catmull([
      [0, 0.74, -0.12],
      [0, 0.7, -0.24],
      [0, 0.66, -0.3],
    ]),
    [0.06, 0.025],
    { bone: hips, color: BODY },
  );

  // Neck
  b.sweep(neck, (t: number) => 0.05 - 0.012 * t, { color: BODY });

  // Head: slightly flattened sphere
  b.part(new THREE.SphereGeometry(0.075, 10, 8), BODY, {
    bone: head,
    scale: [1, 0.9, 1.15],
  });

  // Eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.068, up: 0.02, forward: 0.03 }),
    });
  }

  // Bent beak, pale with a black tip
  b.sweep(
    catmull([
      [0, 1.3, 0.31],
      [0, 1.28, 0.42],
      [0, 1.21, 0.5],
      [0, 1.13, 0.49],
    ]),
    [0.032, 0.016],
    {
      bone: head,
      color: BEAK,
      bands: [
        [0.55, BEAK],
        [1, BLACK],
      ],
    },
  );

  // Folded wings: flat extruded drawings on each flank, black tips at the back
  const wingOutline: [number, number][] = [
    [0.1, 0.02],
    [0.02, 0.16],
    [-0.18, 0.2],
    [-0.36, 0.14],
    [-0.42, 0.0],
    [-0.2, -0.04],
    [0.02, -0.02],
  ];
  const wingColor = paint((_p, _n, s) => (s[0] < -0.26 ? BLACK : CORAL));
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.12, 0.76, 0],
      thickness: 0.025,
      bevel: 0.006,
      smoothing: 1,
      color: wingColor,
      bone: spine.joints[1],
    });
  }

  // Legs: knee bends backward, feet with three forward toes
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.08, 0.7, -0.02], [s * 0.08, 0.05, 0.0], [0.3, 0.36], [[0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const tipJoint = leg.joints[leg.joints.length - 1];

    b.sweep(leg, (t: number) => 0.024 - 0.008 * t, { color: LEG });

    for (const d of [-1, 0, 1]) {
      b.rod(
        [s * 0.08, 0.05, 0],
        [s * 0.08 + d * 0.035, 0.012, 0.13],
        0.011,
        { bone: tipJoint, color: LEG },
      );
    }
  }

  return b.root;
}
