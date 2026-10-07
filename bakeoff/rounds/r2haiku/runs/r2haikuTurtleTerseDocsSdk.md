```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, scales } from "agentic-3js-builder";

export const meta = {
  name: "sea turtle",
  description: "Green sea turtle: domed scute shell, paddle flippers, hooked beak, rigged rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "sea-turtle", detail: 1.3 });

  // Paints
  const scute = scales(["#6f7c3c", "#5c6b2d", "#84884a"], "#2b3618", { size: 0.1, width: 0.012, seed: 3 });
  const shellPaint = countershade(scute, "#e8dcae", { level: -0.35 });
  const SKIN = countershade("#5e7a52", "#e6dbb0", { level: 0.2 });
  const DARK = "#17180f";
  const BEAK = "#3b3026";

  // Skeleton root: the body centre, standing with the shell bottom at y ~ 0.02
  const hips = b.joint("hips", { at: [0, 0.17, 0] });

  // Carapace: a flattened, elongated dome
  b.loft(
    [
      { at: [0, 0.17, 0.44], w: 0.42, h: 0.14 },
      { at: [0, 0.17, 0.28], w: 0.7, h: 0.24 },
      { at: [0, 0.17, 0.0], w: 0.86, h: 0.3 },
      { at: [0, 0.17, -0.28], w: 0.76, h: 0.26 },
      { at: [0, 0.17, -0.44], w: 0.4, h: 0.16 },
    ],
    { bone: hips, color: shellPaint },
  );

  // Neck and head
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.2, 0.36],
      [0, 0.23, 0.5],
      [0, 0.25, 0.63],
      [0, 0.26, 0.74],
    ]),
    { parent: hips, names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  b.sweep(neck, [0.105, 0.07], { color: SKIN });
  const head = neck.joints[neck.joints.length - 1];

  const headMesh = b.part(new THREE.SphereGeometry(0.1, 12, 9), SKIN, {
    bone: head,
    at: head.local({ forward: 0.02 }),
    scale: [1, 0.9, 1.2],
  });

  // Hooked beak: upper on the head, lower on the jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.05 }),
    aim: head.local({ forward: 0.2, up: -0.08 }),
  });
  b.capsule(head.local({ forward: 0.08, up: 0 }), head.local({ forward: 0.16, up: -0.02 }), [0.045, 0.03], {
    bone: head,
    color: BEAK,
  });
  b.capsule(jaw.at, jaw.local({ forward: 0.12, up: 0.01 }), [0.03, 0.022], { bone: jaw, color: BEAK });

  // Eyes seated on the head surface
  for (const s of [1, -1]) {
    const eyeHit = b.surface(headMesh).nearest(head.local({ left: s * 0.085, up: 0.035, forward: 0.03 }));
    b.stick(new THREE.SphereGeometry(0.028, 6, 4), DARK, eyeHit, { embed: 0.4 });
  }

  // Front flippers: arm chain with a paddle on the hand
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.22, 0.2, 0.22],
        [s * 0.42, 0.17, 0.24],
        [s * 0.6, 0.15, 0.16],
        [s * 0.74, 0.13, 0.06],
      ]),
      { parent: hips, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, [0.075, 0.035], { color: SKIN });
    const hand = arm.joints[arm.joints.length - 1];

    b.extrude(
      [
        [-0.34, -0.07],
        [-0.12, -0.13],
        [0.1, -0.1],
        [0.16, 0],
        [0.08, 0.1],
        [-0.14, 0.1],
        [-0.34, 0.04],
      ],
      {
        at: hand.at,
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.025,
        bevel: 0.006,
        smoothing: 1,
        color: SKIN,
        bone: hand,
      },
    );
  }

  // Hind flippers: shorter, swept back
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.2, 0.17, -0.2],
        [s * 0.34, 0.15, -0.3],
        [s * 0.4, 0.13, -0.4],
        [s * 0.44, 0.12, -0.5],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(leg, [0.06, 0.03], { color: SKIN });
    const foot = leg.joints[leg.joints.length - 1];

    b.extrude(
      [
        [-0.2, -0.05],
        [0.02, -0.08],
        [0.12, -0.02],
        [0.08, 0.05],
        [-0.1, 0.06],
        [-0.2, 0.02],
      ],
      {
        at: foot.at,
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.02,
        bevel: 0.005,
        smoothing: 1,
        color: SKIN,
        bone: foot,
      },
    );
  }

  // Short tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.16, -0.42],
      [0, 0.14, -0.5],
      [0, 0.13, -0.56],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.035, 0.012], { color: SKIN });

  return b.root;
}
```