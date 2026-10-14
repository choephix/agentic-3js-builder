import * as THREE from "three";
import { createBuilder, mix, paint, smoothstep } from "../../../../src/index";

const WHITE = "#f4f3ee";
const BLACK = "#16181f";
const ORANGE = "#f29a2e";
const DEEP_ORANGE = "#d9771c";

// Black back and sides, white front: blends by how far the surface faces forward (+Z).
const coat = paint((p, n) => mix(BLACK, WHITE, smoothstep(0.2, 0.55, n.z)));

// Webbed foot, drawn in (forward, side) metres around its origin.
const FOOT = [
  [-0.055, -0.02],
  [0.055, -0.02],
  [0.06, 0.05],
  [0, 0.11],
  [-0.06, 0.05],
];

// Head profile: x = distance from the head's axis, y = height about its centre.
const HEAD = [
  [0, -0.1],
  [0.06, -0.095],
  [0.09, -0.07],
  [0.1, -0.02],
  [0.1, 0.03],
  [0.085, 0.08],
  [0.05, 0.1],
  [0, 0.105],
];

export const meta = {
  name: "Penguin",
  description:
    "A stylised Adelie-style penguin about 0.7 m tall: black back, white front, orange beak and webbed feet, flippers hanging at rest.",
};

export default function penguin() {
  const b = createBuilder({ name: "penguin", paintSize: 1024 });

  // Skeleton: a spine up to the head, a jaw hinge, a leg and a flipper chain per side.
  b.joint("hips", { at: [0, 0.22, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("chest", { parent: "hips", at: [0, 0.38, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("neck", { parent: "chest", at: [0, 0.52, 0.01], dir: [0, 1, 0.2], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.6, 0.03], dir: [0, 1, 0.1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.58, 0.1], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.joint(`leg${side}`, { parent: "hips", at: [0.08 * s, 0.14, 0], dir: [0, -1, 0] });
  }

  // Egg-shaped body: one smooth tube bending across the hips, chest and neck.
  b.loft(
    [
      { at: [0, 0.14, 0], w: 0.26, h: 0.24 },
      { at: [0, 0.3, 0], w: 0.34, h: 0.4 },
      { at: [0, 0.46, 0], w: 0.3, h: 0.34 },
      { at: [0, 0.56, 0.01], w: 0.2, h: 0.2 },
    ],
    { name: "body", color: coat, bone: ["hips", "chest", "neck"] },
  );

  // Flippers: a tapered flat sweep on a three-joint chain, hanging at the sides.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      [
        [0.13 * s, 0.5, 0],
        [0.19 * s, 0.36, 0],
        [0.21 * s, 0.22, 0],
      ],
      {
        parent: "chest",
        up: [0, 0, 1],
        role: "wing",
        names: [`wing${side}1`, `wing${side}2`, `wing${side}3`],
      },
    );
    b.sweep(wing, {
      radius: (t): [number, number] => [0.07 - 0.035 * t, 0.02 - 0.01 * t],
      color: coat,
      name: `flipper${side}`,
    });
  }

  // Legs and webbed feet, planted on the floor.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.rod([0.08 * s, 0.14, 0], [0.08 * s, 0.03, 0.02], 0.022, {
      color: ORANGE,
      bone: `leg${side}`,
      name: `leg${side}`,
    });
    b.extrude(FOOT, {
      color: ORANGE,
      at: [0.08 * s, 0.012, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.018,
      bevel: 0.006,
      bone: `leg${side}`,
      name: `foot${side}`,
    });
  }

  // Head, then a two-piece beak: the upper on the head, the lower on the jaw so it can open.
  const head = b.lathe(HEAD, { color: BLACK, at: [0, 0.6, 0.03], bone: "head", name: "head" });
  b.extrude(
    [
      [0, 0],
      [0.11, -0.012],
      [0, 0.05],
    ],
    { color: ORANGE, at: [0, 0.585, 0.1], thickness: 0.05, bone: "head", name: "beakUpper" },
  );
  b.extrude(
    [
      [0, 0],
      [0.09, -0.008],
      [0, -0.03],
    ],
    { color: DEEP_ORANGE, at: [0, 0.58, 0.1], thickness: 0.036, bone: "jaw", name: "beakLower" },
  );

  // Eyes: white domes seated on the head, each with a black pupil on its front.
  const headSurface = b.surface(head);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eye = b.stick(
      new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)),
      "#ffffff",
      headSurface.nearest([0.042 * s, 0.625, 0.16]),
      { embed: 0.3, name: `eye${side}` },
    );
    b.stick(
      new THREE.SphereGeometry(0.016, b.segments(8), b.segments(6)),
      "#0b0c10",
      b.surface(eye).nearest([0.042 * s, 0.625, 0.25]),
      { embed: 0.2, name: `pupil${side}` },
    );
  }

  return b.root;
}
