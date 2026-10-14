```ts
import * as THREE from "three";
import { createBuilder, catmull, paint } from "agentic-3js-builder";

export const meta = {
  name: "penguin",
  description: "A chunky, stylised emperor-style penguin on a rigged skeleton, with a white belly, black back, orange feet and a bright beak.",
};

const BLACK = "#1c1e24";
const WHITE = "#f5f4ef";
const ORANGE = "#f19a2a";
const BEAK = "#f7b531";

// Black back, white front: the belly is wherever the surface faces forward and sits in the chest band.
const coat = paint((p, n) => (n.z > 0.3 && p.y > 0.08 && p.y < 0.55 ? WHITE : BLACK));
// Black head with a white face patch around the beak.
const headPaint = paint((p, n) => (n.z > 0.4 && p.y < 0.66 ? WHITE : BLACK));

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Spine: hips (root), chest, neck. Feet sit at y = 0, the hips bottom just touches them.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.12, 0],
      [0, 0.36, 0],
      [0, 0.52, 0.01],
      [0, 0.6, 0.02],
    ]),
    { names: ["hips", "chest", "neck"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[1];
  const neck = spine.joints[2];

  // Body: an upright egg, wider in the chest, tapering to the neck.
  b.sweep(
    spine,
    (t: number): [number, number] => {
      const s = Math.sin(Math.PI * Math.min(1, t * 1.15));
      return [0.1 + 0.07 * s, 0.08 + 0.06 * s];
    },
    { color: coat },
  );

  // Head, a joint on the neck.
  const head = b.joint("head", { parent: neck, at: [0, 0.62, 0.02], dir: [0, 1, 0.15] });
  b.part(new THREE.SphereGeometry(0.095, 16, 12), headPaint, { bone: head, at: [0, 0.66, 0.02] });

  // Eyes: a white ring with a black pupil on each side of the face.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), WHITE, { bone: head, at: [s * 0.06, 0.68, 0.1] });
    b.part(new THREE.SphereGeometry(0.013, 8, 6), BLACK, { bone: head, at: [s * 0.064, 0.682, 0.118] });
  }

  // Beak: an upper and a lower jaw, the lower on its own joint so it can open.
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.64, 0.085], dir: [0, 0, 1] });
  b.extrude(
    [
      [-0.01, 0.025],
      [0.095, 0.0, "sharp"],
      [-0.01, -0.005],
    ],
    {
      at: [0, 0.655, 0.09],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.008,
      color: BEAK,
      bone: head,
    },
  );
  b.extrude(
    [
      [-0.01, 0.004],
      [0.08, -0.004, "sharp"],
      [-0.01, -0.02],
    ],
    {
      at: [0, 0.64, 0.09],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.007,
      color: BEAK,
      bone: jaw,
    },
  );

  // Flippers: a chain from the chest shoulder, elbow and hand, with a tip joint.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      "wing" + side,
      catmull([
        [s * 0.14, 0.5, 0],
        [s * 0.2, 0.36, 0],
        [s * 0.17, 0.2, 0.01],
      ]),
      { parent: chest, names: ["shoulder" + side, "elbow" + side, "hand" + side], role: "wing" },
    );
    b.sweep(wing, (t: number): [number, number] => [0.035 - 0.015 * t, 0.05 - 0.03 * t], { color: BLACK });
  }

  // Feet: flat webbed orange shapes in the ground plane, one each side.
  const footOutline: [number, number][] = [
    [-0.03, -0.05],
    [0.12, -0.035],
    [0.14, 0],
    [0.12, 0.035],
    [-0.03, 0.05],
  ];
  for (const s of [1, -1]) {
    b.extrude(footOutline, {
      at: [s * 0.085, 0.012, 0],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: ORANGE,
      bone: hips,
    });
  }

  // Tail: a short stiff nub pointing back and slightly up.
  b.spike([0, 0.14, -0.08], [0, 0.3, -1], 0.07, 0.035, { color: BLACK, bone: hips });

  return b.root;
}
```