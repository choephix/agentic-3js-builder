```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, paint, scales, stripes } from "agentic-3js-builder";

export const meta = {
  name: "armadillo",
  description:
    "A nine-banded armadillo: a domed, banded shell over a pale belly, a long pointed snout with small ears, four clawed legs and a ringed tail.",
};

const SHELL = "#9b7656";
const BAND = "#c9a57c";
const SHIELD = "#8a6447";
const EDGE = "#4b3426";
const BELLY = "#e6d2b6";
const SKIN = "#b99b82";
const EAR = "#d99f8e";
const NOSE = "#2b2019";
const EYE = "#17120f";
const CLAW = "#ece4d2";
const TAIL = "#7f5e45";

// Shield scales over the front and rump, banded plates across the middle.
const shieldPaint = scales(SHIELD, EDGE, { size: 0.03 });
const bandPaint = stripes(SHELL, BAND, { size: 0.045, axis: "z", width: 0.55 });
const rumpPaint = scales(SHELL, EDGE, { size: 0.035 });
const armor = paint((p, _n, _s) => (p.z > 0.1 ? shieldPaint : p.z < -0.1 ? rumpPaint : bandPaint));
const bodyPaint = countershade(armor, BELLY, { level: 0.2 });
const headPaint = scales(SHIELD, EDGE, { size: 0.025 });
const tailPaint = stripes(TAIL, BAND, { size: 0.03, axis: "z", width: 0.5 });

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // Skeleton: hips at the root, a three-joint spine, head and tail.
  const hips = b.joint("hips", { at: [0, 0.29, -0.14], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.29, -0.14],
      [0, 0.31, 0.02],
      [0, 0.33, 0.17],
      [0, 0.34, 0.27],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // Domed shell: a loft that follows the spine, narrowing at the rump and the shoulder.
  b.loft(
    [
      { at: [0, 0.29, -0.2], w: 0.16, h: 0.16 },
      { at: [0, 0.3, -0.05], w: 0.24, h: 0.2 },
      { at: [0, 0.32, 0.12], w: 0.28, h: 0.22 },
      { at: [0, 0.33, 0.26], w: 0.22, h: 0.18 },
    ],
    { bone: spine, color: bodyPaint },
  );

  // Head: a scaled skull, a long tapering snout and a hinged lower jaw.
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.34, 0.31],
    dir: [0, -0.2, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.075, 12, 8), headPaint, {
    bone: head,
    at: head.local({ forward: 0, up: 0.005 }),
    flat: true,
  });
  b.sweep(
    catmull([
      head.local({ forward: 0 }),
      head.local({ forward: 0.12, up: -0.01 }),
      head.local({ forward: 0.21, up: -0.02 }),
    ]),
    [0.062, 0.028],
    { bone: head, color: SKIN },
  );
  b.part(new THREE.SphereGeometry(0.024, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.225, up: -0.005 }),
    flat: true,
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.04 }),
    aim: head.local({ forward: 0.2, up: -0.07 }),
    role: "jaw",
  });
  b.sweep(
    catmull([jaw.local({ forward: 0 }), jaw.local({ forward: 0.1 }), jaw.local({ forward: 0.15 })]),
    [0.03, 0.018],
    { bone: jaw, color: SKIN },
  );

  // Paired details: eyes, ears and legs.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    b.part(new THREE.SphereGeometry(0.014, 6, 4), EYE, {
      bone: head,
      at: head.local([-s * 0.05, 0.05, 0.03]),
      flat: true,
    });

    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.02, 0.075],
        [-0.025, 0.065],
      ],
      {
        at: head.local([-s * 0.06, -0.02, 0.04]),
        thickness: 0.008,
        bevel: 0.003,
        color: EAR,
        bone: head,
      },
    );

    // Front leg: shoulder, elbow, wrist, paw.
    const fx = s * 0.13;
    const foreLeg = b.chain(
      `foreLeg${S}`,
      catmull([
        [fx, 0.26, 0.18],
        [fx * 1.08, 0.13, 0.19],
        [fx, 0.05, 0.19],
        [fx, 0.02, 0.225],
      ]),
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`], role: "leg" },
    );
    b.sweep(foreLeg, [0.04, 0.024], { color: SKIN });

    // Hind leg: hip, knee, ankle, foot.
    const hindLeg = b.chain(
      `hindLeg${S}`,
      catmull([
        [s * 0.12, 0.27, -0.14],
        [s * 0.15, 0.14, -0.13],
        [s * 0.12, 0.05, -0.14],
        [s * 0.12, 0.02, -0.1],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `hindPaw${S}`], role: "leg" },
    );
    b.sweep(hindLeg, [0.046, 0.026], { color: SKIN });

    // Three long claws on each paw.
    for (const k of [-1, 0, 1]) {
      b.spike([fx + k * 0.014, 0.04, 0.23], [k * 0.2, -0.9, 0.4], 0.03, 0.008, { color: CLAW });
      b.spike([s * 0.12 + k * 0.014, 0.04, -0.1], [k * 0.2, -0.9, 0.3], 0.03, 0.008, { color: CLAW });
    }
  }

  // Ringed tail, tapering from the hips.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.28, -0.16],
      [0, 0.25, -0.33],
      [0, 0.21, -0.5],
      [0, 0.18, -0.66],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.05 * (1 - t) + 0.012, { color: tailPaint });

  return b.root;
}
```