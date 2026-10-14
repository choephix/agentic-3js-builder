This is a sea turtle at about 1 m carapace length: a loft-built shell with scute paint, a blend-skinned neck and head with a hinged lower jaw, paddle flippers on arm chains, and short hind flippers and tail.

```ts
import * as THREE from "three";
import {
  catmull,
  createBuilder,
  mottle,
  paint,
  scales,
} from "agentic-3js-builder";

export const meta = {
  name: "Sea turtle",
  description:
    "A stylised green sea turtle resting on its shell: domed scute carapace, blend-skinned neck and head with a hinged jaw, paddle flippers and a short tail.",
};

export default function seaTurtle() {
  const b = createBuilder({ name: "sea-turtle", paintSize: 1024 });

  const skin = "#6e8c4a";
  const beak = "#5b4e35";
  const eyeWhite = "#efe8d2";
  const pupil = "#141414";

  // Carapace: olive scutes with cream edges, cream on the lower rim.
  const scutes = scales(["#4c6b38", "#5a7a40", "#41602f"], "#c9b77a", { size: 0.13, width: 0.16, seed: 3 });
  const shell = paint((p, n) => (n.y < -0.25 ? "#d9c98a" : scutes));
  const flipperSkin = mottle("#6e8c4a", "#8ea85e", { size: 0.12, seed: 2 });

  // Root body joint at the middle of the shell.
  const body = b.joint("body", { at: [0, 0.14, 0] });

  // Carapace: an elliptical-section loft along the shell, bottom resting at y = 0.
  b.loft(
    [
      { at: [0, 0.047, -0.46], w: 0.2, h: 0.1 },
      { at: [0, 0.107, -0.3], w: 0.5, h: 0.22 },
      { at: [0, 0.127, -0.05], w: 0.66, h: 0.26 },
      { at: [0, 0.117, 0.2], w: 0.6, h: 0.24 },
      { at: [0, 0.077, 0.4], w: 0.34, h: 0.16 },
    ],
    { bone: body, color: shell, sides: 12, name: "carapace" },
  );

  // Neck rising from the front of the shell; its tip joint is the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.1, 0.34],
      [0, 0.14, 0.48],
      [0, 0.18, 0.6],
    ]),
    { parent: body, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  b.sweep(neck, { radius: [0.085, 0.068], color: skin, name: "neck" });
  const head = neck.joints[neck.joints.length - 1];

  // Head: a short, rounded loft on the head joint.
  b.loft(
    [
      { at: [0, 0.17, 0.5], w: 0.13, h: 0.12 },
      { at: [0, 0.19, 0.6], w: 0.19, h: 0.16 },
      { at: [0, 0.17, 0.7], w: 0.13, h: 0.11 },
    ],
    { bone: head, color: skin, sides: 10, name: "head" },
  );

  // Beak: upper plate on the head, lower plate on a hinged jaw joint.
  b.extrude(
    [
      [-0.03, 0.03],
      [0.1, 0.02],
      [0.16, -0.01],
      [0.13, -0.04],
      [0.1, -0.02],
      [0.02, -0.03],
      [-0.03, -0.02],
    ],
    {
      at: [0, 0.2, 0.62],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      bone: head,
      color: beak,
      name: "beakUpper",
    },
  );

  const jaw = b.joint("jaw", { parent: head, at: [0, 0.165, 0.6], dir: [0, 0, 1], role: "jaw" });
  b.extrude(
    [
      [-0.02, 0.0],
      [0.12, 0.0],
      [0.14, -0.02],
      [0.1, -0.03],
      [-0.02, -0.025],
    ],
    {
      at: jaw,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.006,
      color: beak,
      name: "beakLower",
    },
  );

  // Eyes: cream whites with dark pupils, set into the head's flanks.
  for (const k of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)), eyeWhite, {
      at: [k * 0.09, 0.215, 0.6],
      bone: head,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(8), b.segments(6)), pupil, {
      at: [k * 0.108, 0.217, 0.6],
      bone: head,
      name: "pupil",
    });
  }

  // Limbs, mirrored: +1 is the creature's left, -1 its right.
  for (const [side, k] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const X = (v: number) => k * v;

    // Front flipper: shoulder, elbow, wrist; a flat paddle on the wrist.
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [X(0.22), 0.1, 0.22],
        [X(0.38), 0.05, 0.2],
        [X(0.5), 0.02, 0.12],
      ]),
      { parent: body, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, { radius: [0.05, 0.03], color: skin, name: `arm${side}` });
    const wrist = arm.joints[arm.joints.length - 1];
    b.extrude(
      [
        [0, -0.03],
        [0.1, -0.07],
        [0.25, -0.09],
        [0.36, -0.07],
        [0.44, -0.02],
        [0.46, 0.02],
        [0.4, 0.06],
        [0.28, 0.08],
        [0.12, 0.07],
        [0, 0.03],
      ],
      {
        at: wrist,
        x: [k, 0, -0.2],
        y: [0.2, 0, k],
        thickness: 0.02,
        bevel: 0.008,
        smoothing: 1,
        color: flipperSkin,
        name: `flipper${side}`,
      },
    );

    // Hind flipper: a short leg and a small paddle angled back.
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [X(0.2), 0.07, -0.3],
        [X(0.3), 0.04, -0.4],
        [X(0.36), 0.03, -0.5],
      ]),
      { parent: body, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, { radius: [0.05, 0.035], color: skin, name: `leg${side}` });
    const ankle = leg.joints[leg.joints.length - 1];
    b.extrude(
      [
        [0, -0.04],
        [0.08, -0.07],
        [0.18, -0.07],
        [0.25, -0.03],
        [0.27, 0.02],
        [0.22, 0.05],
        [0.12, 0.05],
        [0.04, 0.03],
      ],
      {
        at: ankle,
        x: [0.5 * k, 0, -1],
        y: [1, 0, 0.5 * k],
        thickness: 0.016,
        bevel: 0.005,
        color: flipperSkin,
        name: `hindFlipper${side}`,
      },
    );
  }

  // Short tail from under the rear of the shell.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.06, -0.34],
      [0, 0.05, -0.5],
      [0, 0.04, -0.6],
    ]),
    { parent: body, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, { radius: [0.035, 0.012], color: skin, name: "tail" });

  return b.root;
}
```