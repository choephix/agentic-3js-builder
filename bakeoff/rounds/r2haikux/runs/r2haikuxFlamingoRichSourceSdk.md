```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, mottle } from "agentic-3js-builder";
import type { OutlineInput } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "An elegant flamingo standing tall in shallow water: candy-pink body, coral wings flashing black at the tips, an S-curved neck, a bent bill that is pale pink with a black tip, pale yellow eyes, and rose legs with knobbly joints and webbed feet.",
};

const PINK = mottle("#ff9bc5", "#ffb9d8", { size: 0.16, seed: 4, contrast: 0.8 });
const CORAL = gradient("#ff9ac2", "#ff6a52", [0, 0.97, 0.06], [0, 0.82, -0.36]);
const ROSE = "#e5719b";
const BLACK = "#17151a";
const BILL = "#ffd3e1";
const EYE = "#f6ed8f";
const PUPIL = "#1d1a20";

// Wing silhouette in the side plane, as [z, y] in meters (forward is +z). The trailing edge is scalloped.
const WING: OutlineInput = [
  [0.1, 0.99],
  [0.0, 0.975],
  [-0.1, 0.95],
  [-0.2, 0.915],
  [-0.29, 0.86],
  [-0.36, 0.8, "sharp"],
  [-0.27, 0.815],
  [-0.2, 0.835],
  [-0.12, 0.82],
  [-0.04, 0.84],
  [0.04, 0.87],
  [0.1, 0.92],
];

// The black flight feathers: the outer tip of the wing, laid over the coral.
const PRIMARIES: OutlineInput = [
  [-0.18, 0.91],
  [-0.29, 0.86],
  [-0.36, 0.8, "sharp"],
  [-0.27, 0.815],
  [-0.2, 0.835],
];

export default function flamingo() {
  const b = createBuilder({ name: "flamingo" });

  // Root: the hips, carrying the body.
  b.joint("hips", { at: [0, 0.82, 0], role: "spine" });

  // Body: a plump teardrop from the tail to the breast.
  b.loft(
    [
      { at: [0, 0.875, -0.22], w: 0.1, h: 0.12 },
      { at: [0, 0.86, -0.1], w: 0.22, h: 0.21 },
      { at: [0, 0.86, 0.02], w: 0.26, h: 0.24 },
      { at: [0, 0.9, 0.12], w: 0.22, h: 0.22 },
      { at: [0, 0.95, 0.17], w: 0.14, h: 0.16 },
    ],
    { color: PINK, bone: "hips", sides: 10, name: "body" },
  );

  // Tail: a small fan of coral feathers lifted behind.
  for (const [dx, dy] of [
    [-0.45, 0.45],
    [0, 0.6],
    [0.45, 0.45],
  ]) {
    b.spike([0, 0.875, -0.2], [dx, dy, -1], 0.14, 0.05, { color: CORAL, bone: "hips", name: "tailFeather" });
  }

  // Wings: a coral silhouette with a black primary layer over its tips.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.joint(`wing${L}`, { parent: "hips", at: [s * 0.11, 0.93, 0], dir: [0, -0.35, -1], role: "wing" });
    b.extrude(WING, {
      color: CORAL,
      at: [s * 0.118, 0, 0],
      thickness: [0.016, 0.042],
      bone: `wing${L}`,
      name: `wing${L}`,
    });
    b.extrude(PRIMARIES, {
      color: BLACK,
      at: [s * 0.126, 0, 0],
      thickness: [0.01, 0.02],
      bone: `wing${L}`,
      name: `primaries${L}`,
    });
  }

  // Legs: feathered thigh in pink, bare shank in rose, a knobbly knee and hock, and webbed feet.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const p = (x: number, y: number, z: number): [number, number, number] => [s * x, y, z];

    const leg = b.chain(
      `leg${L}`,
      catmull([p(0.07, 0.8, 0), p(0.075, 0.56, 0.03), p(0.085, 0.3, -0.05), p(0.08, 0.02, 0.02)]),
      { parent: "hips", names: [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.034, 0.024, 0.014, 0.011], {
      bands: [
        [0.3, PINK],
        [1, ROSE],
      ],
      sides: 8,
      name: `leg${L}`,
    });

    // Knobs: a faceted knee and a two-lump hock where the leg bends back.
    b.part(new THREE.DodecahedronGeometry(0.031, 0), ROSE, {
      at: p(0.075, 0.56, 0.03),
      bone: `knee${L}`,
      name: `kneeKnob${L}`,
    });
    b.part(new THREE.IcosahedronGeometry(0.021, 0), ROSE, {
      at: p(0.085, 0.3, -0.05),
      bone: `hock${L}`,
      name: `hockKnob${L}`,
    });
    b.part(new THREE.IcosahedronGeometry(0.013, 0), ROSE, {
      at: p(0.09, 0.315, -0.075),
      bone: `hock${L}`,
      name: `hockLump${L}`,
    });

    // Webbed foot: a flat scalloped web between three forward toes.
    const foot = leg.joints[leg.joints.length - 1];
    b.slab(
      [
        p(0.08, 0.012, 0.03),
        p(0.125, 0.012, 0.11),
        p(0.105, 0.012, 0.09),
        p(0.08, 0.012, 0.13),
        p(0.055, 0.012, 0.09),
        p(0.035, 0.012, 0.11),
      ],
      { color: ROSE, thickness: 0.004, bone: `foot${L}`, name: `webbing${L}` },
    );
    for (const [x, z] of [
      [0.125, 0.11],
      [0.08, 0.13],
      [0.035, 0.11],
    ]) {
      b.rod(foot, p(x, 0.01, z), 0.0055, { color: ROSE, caps: "round", name: `toe${L}` });
    }
  }

  // Neck: a long S, thick at the breast and slender under the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.93, 0.1],
      [0, 1.04, 0.2],
      [0, 1.15, 0.17],
      [0, 1.25, 0.09],
      [0, 1.34, 0.17],
    ]),
    { parent: "hips", names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  b.sweep(neck, [0.056, 0.044, 0.034, 0.03], { color: PINK, sides: 8, name: "neck" });

  // Head: a small skull on the neck's top, with a hinged lower bill.
  b.joint("head", { parent: "neck4", at: [0, 1.345, 0.19], dir: [0, -0.2, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.05, b.segments(10), b.segments(7)), PINK, {
    at: [0, 1.35, 0.2],
    bone: "head",
    scale: [0.92, 0.95, 1.18],
    name: "skull",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), EYE, {
      at: [s * 0.044, 1.36, 0.215],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.0055, b.segments(6), b.segments(4)), PUPIL, {
      at: [s * 0.053, 1.361, 0.222],
      bone: "head",
      name: "pupil",
    });
  }

  // Upper bill, bent down at the tip, pale pink with a black tip.
  const upper = catmull([
    [0, 1.336, 0.245],
    [0, 1.322, 0.3],
    [0, 1.298, 0.337],
    [0, 1.262, 0.338],
  ]);
  b.sweep(upper, (t: number) => [0.005 + 0.013 * (1 - t), 0.008 + 0.012 * (1 - t)] as const, {
    bands: [
      [0.74, BILL],
      [1, BLACK],
    ],
    bone: "head",
    sides: 8,
    name: "billUpper",
  });

  // Lower jaw: hinged at the base of the bill so it can open.
  b.joint("jaw", { parent: "head", at: [0, 1.322, 0.25], dir: [0, -0.2, 1], role: "jaw" });
  const lower = catmull([
    [0, 1.322, 0.25],
    [0, 1.31, 0.298],
    [0, 1.287, 0.326],
    [0, 1.268, 0.322],
  ]);
  b.sweep(lower, (t: number) => [0.004 + 0.01 * (1 - t), 0.006 + 0.009 * (1 - t)] as const, {
    bands: [
      [0.74, BILL],
      [1, BLACK],
    ],
    bone: "jaw",
    sides: 8,
    name: "billLower",
  });

  // Shallow water: a pale pool at the feet, two ripple rings and a couple of lily pads.
  b.part(new THREE.CylinderGeometry(0.42, 0.46, 0.01, b.segments(20)), "#8fd7e1", {
    at: [0, -0.005, 0],
    bone: "hips",
    name: "water",
  });
  b.part(new THREE.TorusGeometry(0.26, 0.004, b.segments(6), b.segments(32)), "#e6fcfc", {
    at: [0, 0.002, 0],
    rotation: [90, 0, 0],
    bone: "hips",
    name: "ripple",
  });
  b.part(new THREE.TorusGeometry(0.36, 0.003, b.segments(6), b.segments(36)), "#e6fcfc", {
    at: [0, 0.001, 0],
    rotation: [90, 0, 0],
    bone: "hips",
    name: "ripple",
  });
  for (const [x, z] of [
    [0.24, -0.2],
    [-0.3, 0.1],
  ]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.006, b.segments(10)), "#7bbf7a", {
      at: [x, 0.003, z],
      bone: "hips",
      name: "lilyPad",
    });
  }

  return b.root;
}
```