```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  noise,
  paint,
  rng,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

const INK = "#0e1a2e";
const WHITE = "#f3f0e8";
const GOLD = "#e9b233";
const ORANGE = "#ff8c5a";
const BEAK = "#2b2622";
const BLACK = "#0b0b0c";
const EYE = "#040404";
const FLUFF_A = "#c4c8ce";
const FLUFF_B = "#9aa0a9";

export const meta = {
  name: "emperor-penguin-parent",
  description:
    "An emperor penguin parent with glossy blue-black plumage, a golden ear and chest patch, a long beak with an orange stripe, and a grey chick between its feet.",
};

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-parent" });

  // Skeleton: hips, spine to chest, head and lower jaw, legs and flippers.
  const hips = b.joint("hips", { at: [0, 0.5, 0], dir: [0, 1, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, 0],
      [0, 0.72, 0.02],
      [0, 0.92, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 1.03, 0.05],
    dir: [0, 1, 0.12],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.08, 0.12],
    aim: [0, 1.06, 0.36],
    role: "jaw",
  });

  // Torso: one tube skinned over the spine chain and the hips.
  const bodyPath = catmull([
    [0, 0.3, 0],
    [0, 0.5, 0.01],
    [0, 0.7, 0.02],
    [0, 0.9, 0.03],
    [0, 1.02, 0.04],
  ]);

  const coat = paint((p, n) => {
    const frontness = n.z + (noise(p, 0.08, 4) - 0.5) * 0.6;
    if (p.y < 0.82 && frontness > 0.3) return WHITE;
    if (p.y > 0.8 && p.y < 0.98 && n.z > 0.25 && Math.abs(n.x) < 0.6) return GOLD;
    return INK;
  });

  b.sweep(bodyPath, [0.08, 0.15, 0.15, 0.13, 0.11], {
    bone: [spine, hips],
    color: coat,
  });

  // Head: glossy dark with a golden ear patch on each side.
  const headCoat = paint((p, n) => {
    if (Math.abs(n.x) > 0.45 && n.z > -0.3 && p.y < 1.1 && p.y > 1.0) return GOLD;
    return INK;
  });

  const headPart = b.part(new THREE.SphereGeometry(0.1, 16, 12), headCoat, {
    bone: head,
    at: [0, 1.1, 0.05],
  });

  for (const s of [1, -1]) {
    const hit = b.surface(headPart).around([0, 1.1, 0.05]).at(s * 40, 12);
    if (hit) b.stick(new THREE.SphereGeometry(0.02, 8, 6), EYE, hit, { embed: 0.3 });
  }

  // Beak: upper mandible with an orange-pink stripe along each side.
  const beakCoat = paint((_p, _n, s) =>
    Math.abs(Math.sin((s[1] * Math.PI) / 180)) > 0.8 && s[0] > 0.3 ? ORANGE : BEAK,
  );

  b.sweep(
    bezier([0, 1.11, 0.12], [0, 1.13, 0.2], [0, 1.1, 0.3], [0, 1.06, 0.36]),
    (t) => [0.02 * (1 - t) + 0.006, 0.03 * (1 - t) + 0.008],
    { bone: head, color: beakCoat },
  );

  // Lower mandible, hinged on the jaw joint.
  b.sweep(
    bezier([0, 1.09, 0.12], [0, 1.09, 0.2], [0, 1.08, 0.29], [0, 1.06, 0.34]),
    [0.012, 0.006],
    { bone: jaw, color: BEAK },
  );

  // Flippers, legs and feet.
  const flipperShape: OutlinePoint[] = [
    [-0.04, 0.12],
    [0.04, 0.12],
    [0.05, -0.05],
    [0.03, -0.2],
    [0, -0.27, "sharp"],
    [-0.03, -0.2],
    [-0.05, -0.05],
  ];
  const footShape: OutlinePoint[] = [
    [-0.045, -0.04],
    [0.045, -0.04],
    [0.075, 0.02],
    [0.04, 0.06],
    [0, 0.1, "sharp"],
    [-0.04, 0.06],
    [-0.075, 0.02],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.13, 0.92, 0],
        [s * 0.19, 0.76, 0],
        [s * 0.22, 0.6, 0.02],
      ]),
      {
        parent: spine.joints[0],
        names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
        role: "arm",
      },
    );

    b.extrude(flipperShape, {
      at: [s * 0.17, 0.86, 0],
      x: [0, 0, 1],
      y: [-s * 0.2, 1, 0],
      thickness: [0.012, 0.035],
      bevel: 0.004,
      smoothing: 1,
      color: INK,
      bone: arm.joints[1],
    });

    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.07, 0.46, 0],
        [s * 0.085, 0.22, 0.02],
        [s * 0.09, 0.01, 0.05],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
      },
    );

    b.sweep(leg, [0.034, 0.02], { color: BLACK });

    b.extrude(footShape, {
      at: [s * 0.09, 0.01, 0.06],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.02,
      bevel: 0.004,
      smoothing: 1,
      color: BLACK,
      bone: leg.joints[2],
    });
  }

  // Grey chick between the feet: a fluffy body and head with tufts stuck on.
  const chickBody = b.part(new THREE.SphereGeometry(0.1, 14, 10), FLUFF_A, {
    bone: hips,
    at: [0, 0.1, 0.18],
  });
  const chickHead = b.part(new THREE.SphereGeometry(0.07, 12, 9), FLUFF_A, {
    bone: hips,
    at: [0, 0.2, 0.2],
  });

  b.surface([chickBody, chickHead])
    .scatter(40, { rng: rng(7), minDist: 0.04 })
    .forEach((hit, i) => {
      b.stick(new THREE.SphereGeometry(0.028, 6, 4), i % 3 === 0 ? FLUFF_B : FLUFF_A, hit, {
        embed: 0.35,
      });
    });

  for (const s of [1, -1]) {
    const hit = b.surface(chickHead).around([0, 0.2, 0.2]).at(s * 35, 10);
    if (hit) b.stick(new THREE.SphereGeometry(0.012, 6, 4), EYE, hit, { embed: 0.3 });
  }

  b.part(new THREE.ConeGeometry(0.018, 0.04, 6), ORANGE, {
    bone: hips,
    at: [0, 0.19, 0.29],
    dir: [0, 0, 1],
  });

  return b.root;
}
```