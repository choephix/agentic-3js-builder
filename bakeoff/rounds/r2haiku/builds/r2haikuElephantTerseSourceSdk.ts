import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle } from "../../../../src/index";

export const meta = {
  name: "Elephant",
  description: "A stylised African elephant, about 3.2 m at the shoulder, in a neutral rest pose with a curled trunk.",
};

// Ear outline in the ear's own plane: x runs forward (+Z), y runs up. Centred on the ear's attachment point.
const EAR: [number, number][] = [
  [0.25, 0.55],
  [0.5, 0.25],
  [0.45, -0.35],
  [0.15, -0.85],
  [-0.3, -0.8],
  [-0.55, -0.3],
  [-0.45, 0.35],
  [-0.1, 0.6],
];

export default function elephant() {
  const b = createBuilder({ name: "elephant", paintSize: 1024 });

  // Paint: mottled grey hide, paler underneath. Ivory and eyes are plain colours.
  const skin = countershade(
    mottle("#7d8189", "#666a72", { size: 0.8, seed: 2, contrast: 1 }),
    "#aaa39a",
    { level: -0.1, soft: 0.4 },
  );
  const ivory = "#efe6cf";
  const dark = "#1b1b1d";

  // Skeleton: pelvis root, spine up the back, head on the spine, trunk from the head.
  b.joint("pelvis", { at: [0, 2.25, -1.3] });
  const spine = b.chain(
    "spine",
    [
      [0, 2.25, -1.3],
      [0, 2.35, -0.5],
      [0, 2.4, 0.2],
      [0, 2.4, 0.9],
    ],
    { names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: "spine3", at: [0, 2.85, 1.6] });

  // Body: one smooth tube bending along the spine.
  b.loft(
    [
      { at: [0, 2.25, -1.5], w: 1.3, h: 1.6 },
      { at: [0, 2.3, -0.6], w: 1.6, h: 1.8 },
      { at: [0, 2.35, 0.2], w: 1.6, h: 1.8 },
      { at: [0, 2.25, 0.9], w: 1.4, h: 1.7 },
      { at: [0, 2.05, 1.25], w: 1.1, h: 1.4 },
    ],
    { color: skin, bone: spine, sides: 12, name: "body" },
  );

  // Head: a bulky, forward-set skull on its own bone.
  const headTube = b.loft(
    [
      { at: [0, 2.7, 1.0], w: 1.3, h: 1.5 },
      { at: [0, 2.85, 1.6], w: 1.4, h: 1.7 },
      { at: [0, 2.9, 2.0], w: 1.2, h: 1.6 },
    ],
    { color: skin, bone: head, sides: 12, name: "head" },
  );

  // Ears: broad flat fans hanging beside the head.
  for (const sx of [1, -1]) {
    b.extrude(EAR, {
      color: skin,
      at: [sx * 0.72, 2.75, 1.5],
      bone: head,
      thickness: 0.07,
      bevel: 0.03,
      smoothing: 1,
      name: sx > 0 ? "earL" : "earR",
    });
  }

  // Eyes: small dark spheres seated on the skull surface.
  const skull = b.surface(headTube);
  for (const sx of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.055, 10, 8), dark, skull.nearest([sx * 0.7, 2.95, 1.6]), {
      embed: 0.35,
      name: sx > 0 ? "eyeL" : "eyeR",
    });
  }

  // Tusks: curved ivory, growing from the upper lip, tapering to a point.
  for (const sx of [1, -1]) {
    b.sweep(
      catmull([
        [sx * 0.3, 2.0, 1.9],
        [sx * 0.5, 1.75, 2.25],
        [sx * 0.55, 1.5, 2.6],
        [sx * 0.45, 1.3, 2.8],
      ]),
      [0.085, 0.012],
      { color: ivory, bone: head, sides: 8, name: sx > 0 ? "tuskL" : "tuskR" },
    );
  }

  // Trunk: a long tube from the head, curling up at the tip.
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.4, 2.0],
      [0, 1.85, 2.45],
      [0, 1.3, 2.7],
      [0, 0.85, 2.75],
      [0, 0.45, 2.65],
      [0, 0.6, 2.5],
    ]),
    {
      parent: "head",
      names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5"],
      role: "tentacle",
    },
  );
  b.sweep(trunk, [0.36, 0.3, 0.23, 0.18, 0.14, 0.1], { color: skin, sides: 10, name: "trunk" });

  // Tail: a thin whip from the rear with a tuft at the end.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.3, -1.6],
      [0, 2.0, -2.1],
      [0, 1.6, -2.5],
      [0, 1.05, -2.7],
    ]),
    { parent: "pelvis", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.13, 0.09, 0.05, 0.035], { color: skin, sides: 8, name: "tail" });
  b.part(new THREE.SphereGeometry(0.08, 8, 6), "#4a3b2c", { at: [0, 1.02, -2.72], bone: "tail3" });

  // Legs: four columns with a flat pad foot and toenails.
  const leg = (side: "L" | "R", sx: number, kind: "hind" | "front") => {
    const hind = kind === "hind";
    const base = hind
      ? [
          [0.5, 2.1, -0.9],
          [0.52, 0.95, -0.95],
          [0.5, 0.42, -1.0],
          [0.5, 0.3, -0.85],
        ]
      : [
          [0.5, 2.1, 0.7],
          [0.56, 0.95, 0.75],
          [0.55, 0.42, 0.8],
          [0.55, 0.3, 0.92],
        ];
    const pts = base.map(([x, y, z]) => [sx * x, y, z]);
    const names = hind
      ? [`hip${side}`, `knee${side}`, `ankle${side}`]
      : [`shoulder${side}`, `elbow${side}`, `wrist${side}`];
    const chain = b.chain(`${kind}${side}`, pts, { names, role: "leg" });
    b.sweep(chain, hind ? [0.42, 0.34, 0.27, 0.26] : [0.4, 0.32, 0.26, 0.26], {
      color: skin,
      caps: { end: "flat" },
      sides: 10,
    });
    const foot = pts[3];
    const ankle = names[2];
    b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 10), skin, {
      at: [foot[0], 0.15, foot[2]],
      bone: ankle,
    });
    for (const dx of [-0.14, -0.05, 0.05, 0.14]) {
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), "#e8dfcc", {
        at: [foot[0] + dx, 0.1, foot[2] + 0.31],
        rotation: [90, 0, 0],
        bone: ankle,
      });
    }
  };
  leg("L", 1, "hind");
  leg("R", -1, "hind");
  leg("L", 1, "front");
  leg("R", -1, "front");

  return b.root;
}
