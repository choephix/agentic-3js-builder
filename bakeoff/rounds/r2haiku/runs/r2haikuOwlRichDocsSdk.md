This owl is built on a gnarled perch. It has a mottled bark-and-buff barred coat, a pale bib, ear tufts, a tawny facial disc with a black rim, large orange eyes, a hooked beak and feathered legs gripping the branch with black talons.

```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, countershade, mottle, stripes } from "agentic-3js-builder";

// Palette
const BARK = "#5b4632";
const DARK = "#2a2019";
const BUFF = "#c9a46b";
const BIB = "#efe6d0";
const TAWNY = "#b8692c";
const RIM = "#1c1814";
const EYE = "#f2901e";
const BEAK = "#6f716f";
const TALON = "#1b1916";
const BRANCH = "#4d3b2c";
const LICHEN = "#8a9466";

export const meta = {
  name: "Great horned owl",
  description: "A great horned owl perched on a gnarled branch, built from primitives.",
};

export default function build() {
  const b = createBuilder({ name: "great-horned-owl" });

  // Paints
  const feather = stripes(mottle(BARK, BUFF, { size: 0.1, contrast: 0.5 }), DARK, {
    size: 0.02,
    axis: "y",
    width: 0.3,
  });
  const coat = feather;
  const body = countershade(feather, BIB, { level: -0.25 });
  const branchPaint = mottle(BRANCH, LICHEN, { size: 0.12 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.36, 0] });
  const perch = b.joint("perch", { parent: hips, at: [0, 0.1, 0] });

  // Gnarled branch: centre at y = 0.1, radius about 0.1, so it rests on the floor
  const branchPath = catmull([
    [-0.75, 0.1, -0.12],
    [-0.3, 0.1, 0.07],
    [0.05, 0.1, -0.01],
    [0.42, 0.1, 0.1],
    [0.85, 0.1, -0.05],
  ]);
  b.sweep(branchPath, (t: number) => 0.1 - 0.006 * Math.sin(t * 12), {
    bone: perch,
    color: branchPaint,
  });
  // Knots and twigs
  b.sweep(
    catmull([
      [0.3, 0.16, 0.03],
      [0.36, 0.27, 0.07],
      [0.4, 0.34, 0.05],
    ]),
    [0.02, 0.006],
    { bone: perch, color: branchPaint },
  );
  b.sweep(
    catmull([
      [-0.5, 0.12, -0.06],
      [-0.55, 0.22, -0.1],
      [-0.6, 0.3, -0.12],
    ]),
    [0.025, 0.008],
    { bone: perch, color: branchPaint },
  );

  // Spine and body
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, 0],
      [0, 0.44, 0.01],
      [0, 0.52, 0.03],
      [0, 0.58, 0.035],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  b.loft(
    [
      { at: [0, 0.37, 0], w: 0.17, h: 0.16 },
      { at: [0, 0.44, 0.01], w: 0.22, h: 0.2 },
      { at: [0, 0.5, 0.03], w: 0.22, h: 0.21 },
      { at: [0, 0.56, 0.035], w: 0.15, h: 0.15 },
    ],
    { bone: spine, color: body },
  );

  // Throat bib
  b.part(new THREE.SphereGeometry(0.06, 12, 8), BIB, {
    bone: spine.joints[2],
    at: [0, 0.555, 0.08],
    scale: [1.3, 1, 0.45],
  });

  // Head
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.58, 0.035],
    aim: [0, 0.66, 0.06],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.085, 14, 10), body, {
    bone: head,
    at: [0, 0.63, 0.045],
    scale: [1, 1.02, 0.95],
  });

  // Facial disc and black rim
  b.part(new THREE.SphereGeometry(0.075, 14, 10), TAWNY, {
    bone: head,
    at: [0, 0.63, 0.12],
    scale: [1, 1, 0.35],
  });
  b.part(new THREE.TorusGeometry(0.076, 0.01, 6, 20), RIM, {
    bone: head,
    at: [0, 0.63, 0.125],
  });

  // Eyes, pupils and rims
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 12, 8), EYE, {
      bone: head,
      at: [s * 0.032, 0.645, 0.135],
    });
    b.part(new THREE.SphereGeometry(0.013, 8, 6), RIM, {
      bone: head,
      at: [s * 0.032, 0.645, 0.158],
    });
    b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 14), RIM, {
      bone: head,
      at: [s * 0.032, 0.645, 0.14],
    });
  }

  // Hooked beak
  b.sweep(
    bezier(
      [0, 0.635, 0.14],
      [0, 0.635, 0.18],
      [0, 0.615, 0.19],
      [0, 0.59, 0.165],
    ),
    [0.016, 0.006],
    {
      bone: head,
      color: BEAK,
      caps: { start: "round", end: "point" },
    },
  );

  // Ear tufts
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.02, 0],
        [0.02, 0],
        [0.006, 0.09, "sharp"],
        [-0.012, 0.07],
      ],
      {
        at: [s * 0.035, 0.67, 0.035],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: coat,
        bone: head,
      },
    );
  }

  // Folded wings along the flanks
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.03, 0.08],
        [0.03, 0.07],
        [0.04, -0.05],
        [0.03, -0.2],
        [0, -0.28, "sharp"],
        [-0.03, -0.2],
        [-0.04, -0.02],
      ],
      {
        at: [s * 0.115, 0.5, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.02,
        bevel: 0.004,
        smoothing: 1,
        color: coat,
        bone: spine.joints[1],
      },
    );
  }

  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.37, 0],
      [0, 0.3, -0.09],
      [0, 0.24, -0.15],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.05, 0.04, 0.03], { color: coat });

  // Feathered legs, talons gripping the perch
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.07, 0.36, 0],
        [s * 0.09, 0.27, 0.04],
        [s * 0.07, 0.2, 0.03],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
      },
    );
    b.sweep(leg, [0.04, 0.03, 0.022], { color: coat });

    // Front toes with talons
    for (const d of [-0.025, 0, 0.025]) {
      const start: [number, number, number] = [s * 0.07 + d * 0.3, 0.205, 0.04];
      const tip: [number, number, number] = [s * 0.07 + d, 0.205, 0.1];
      b.capsule(start, tip, 0.011, { color: TALON });
      b.spike(tip, [0, -0.35, 1], 0.03, 0.007, { color: TALON });
    }

    // Hind toe with talon
    const hindStart: [number, number, number] = [s * 0.07, 0.205, 0.03];
    const hindTip: [number, number, number] = [s * 0.07, 0.205, -0.03];
    b.capsule(hindStart, hindTip, 0.012, { color: TALON });
    b.spike(hindTip, [0, -0.35, -1], 0.028, 0.007, { color: TALON });
  }

  return b.root;
}
```