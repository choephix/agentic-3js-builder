```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, frame, gradient, mottle, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Flamingo",
  description:
    "A standing greater flamingo: an S-curved neck, a bent bill with a black tip and a hinged lower jaw, a coral wing with black flight feathers, and webbed feet on legs that bend backward at the ankle.",
};

const CORAL = "#ff6b8f";
const BLUSH = "#ffc2cf";
const PALE = "#ffe3ea";
const LEG = "#ff8fa6";
const FOOT = "#ff4f7a";
const BILL = "#ffd3dd";
const INK = "#17151b";

/** A three-toed webbed foot in metres, drawn on the ground (u across, v forward from the ankle). */
const TOES: number[][] = [
  [0, -0.03],
  [0.035, -0.006],
  [0.075, 0.034],
  [0.046, 0.046],
  [0.03, 0.092],
  [0, 0.118],
  [-0.03, 0.092],
  [-0.046, 0.046],
  [-0.075, 0.034],
  [-0.035, -0.006],
];

/** A feather: a light vane (tinted by `color`) with a white quill. */
const FEATHER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120"><path d="M20 2C34 26 38 92 20 118C2 92 6 26 20 2Z" fill="#cfcfcf"/><path d="M20 9V111" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`;

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", detail: 1, paintSize: 1024 });

  // Paints and textures
  const bodyPaint = countershade(mottle(CORAL, "#ff8fab", { size: 0.1, seed: 4, contrast: 0.8 }), BLUSH, {
    level: -0.1,
    soft: 0.4,
  });
  const neckPaint = gradient(CORAL, PALE, [0, 0.98, 0.25], [0, 1.3, 0.4]);
  const wingPaint = mottle("#ff3d72", "#ff6f98", { size: 0.06, seed: 9 });
  const feather = svg(FEATHER, { size: 256 });

  // Skeleton: hips (root), an S-shaped neck chain, the head at its tip, and a hinged lower jaw
  const hips = b.joint("hips", { at: [0, 0.84, -0.02], role: "spine" });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.93, 0.2],
      [0, 1.04, 0.38],
      [0, 1.16, 0.22],
      [0, 1.27, 0.3],
      [0, 1.32, 0.42],
    ]),
    { parent: hips, names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: "neck4",
    at: [0, 1.32, 0.42],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    role: "head",
  });
  const H = (x: number, y: number, z: number) => head.local([x, y, z]);
  const jaw = b.joint("jaw", {
    parent: head,
    at: H(0, -0.004, 0.018),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  // Bill: the upper mandible rides the head, the lower one the jaw. Pale base, black tip.
  b.sweep(
    catmull([
      H(0, 0.01, 0.018),
      H(0, 0.01, 0.07),
      H(0, 0.002, 0.095),
      H(0, -0.02, 0.108),
      H(0, -0.055, 0.108),
      H(0, -0.078, 0.096),
    ]),
    [0.024, 0.021, 0.017, 0.013, 0.01],
    { name: "billUpper", bone: head, bands: [[0.6, BILL], [1, INK]] },
  );
  b.sweep(
    catmull([
      H(0, -0.004, 0.018),
      H(0, -0.014, 0.07),
      H(0, -0.024, 0.09),
      H(0, -0.045, 0.096),
      H(0, -0.064, 0.086),
      H(0, -0.07, 0.074),
    ]),
    [0.017, 0.015, 0.012, 0.009, 0.007],
    { name: "billLower", bone: jaw, bands: [[0.6, BILL], [1, INK]] },
  );

  // Head and eyes
  b.part(new THREE.SphereGeometry(0.07, b.segments(14), b.segments(10)), PALE, {
    name: "head",
    frame: head,
    scale: [1, 0.95, 1.1],
  });
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.014, b.segments(8), b.segments(6)), "#fff6df", {
      name: `eye${L}`,
      frame: head,
      at: H(s * 0.06, 0.012, 0.022),
    });
    b.part(new THREE.SphereGeometry(0.0075, b.segments(6), b.segments(4)), INK, {
      name: `pupil${L}`,
      frame: head,
      at: H(s * 0.068, 0.013, 0.025),
    });
  }

  // Body and neck
  b.loft(
    [
      { at: [0, 0.91, -0.36], w: 0.1, h: 0.12 },
      { at: [0, 0.9, -0.22], w: 0.22, h: 0.24 },
      { at: [0, 0.86, -0.04], w: 0.3, h: 0.3 },
      { at: [0, 0.85, 0.12], w: 0.28, h: 0.3 },
      { at: [0, 0.9, 0.23], w: 0.2, h: 0.24 },
    ],
    { name: "body", color: bodyPaint, bone: hips, sides: 12 },
  );
  b.sweep(neck, [0.062, 0.042, 0.034, 0.036, 0.04], { name: "neck", color: neckPaint, sides: 10 });

  // Legs, webbed feet, folded wings and their feathers
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.08;

    // Hip, hidden knee, backward-bending ankle, foot
    const leg = b.chain(
      `leg${L}`,
      [
        [x, 0.8, -0.02],
        [x + s * 0.01, 0.6, 0.04],
        [x, 0.36, -0.12],
        [x, 0.006, 0.02],
      ],
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.026, 0.017, 0.013, 0.01], {
      name: `leg${L}`,
      bands: [
        [0.25, CORAL],
        [1, LEG],
      ],
      sides: 8,
    });
    b.extrude(TOES, {
      name: `foot${L}`,
      color: FOOT,
      at: [x, 0.008, 0.02],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.004,
      bone: `foot${L}`,
    });

    // Folded wing: a skin between the leading edge over the back and the trailing edge down the flank
    const wing = b.joint(`wing${L}`, { parent: hips, at: [s * 0.1, 0.95, 0.05], role: "wing" });
    const leading = catmull([
      [s * 0.06, 0.99, 0.16],
      [s * 0.07, 1.03, 0.0],
      [s * 0.07, 1.0, -0.18],
      [s * 0.06, 0.95, -0.36],
    ]);
    const trailing = catmull([
      [s * 0.155, 0.86, 0.14],
      [s * 0.16, 0.86, -0.02],
      [s * 0.15, 0.88, -0.2],
      [s * 0.12, 0.9, -0.37],
    ]);
    b.membrane(leading, trailing, { name: `wing${L}`, color: wingPaint, thickness: 0.02, rows: 5, bone: wing });

    // Black flight feathers fanning out past the tail
    b.cards(
      [0, 1, 2, 3, 4].map((i) =>
        frame([s * 0.1, 0.94 - 0.014 * i, -0.28 - 0.024 * i], [s * 0.03, 0.08 - 0.04 * i, -1]),
      ),
      feather,
      {
        name: `primaries${L}`,
        size: [0.06, 0.18],
        lean: 0,
        flow: [1, 0, 0],
        color: "#2b2733",
        bone: wing,
        vary: 0.08,
        spin: 4,
        rng: rng(s > 0 ? 3 : 4),
        sink: 0.15,
      },
    );
  }

  // Short coral tail feathers at the rump
  b.cards(
    [-0.06, -0.03, 0, 0.03, 0.06].map((dx) => frame([dx, 0.9, -0.3], [dx * 1.2, 0.3, -1])),
    feather,
    {
      name: "tail",
      size: [0.08, 0.15],
      flow: [0, 1, 0],
      color: "#ff6a8c",
      bone: hips,
      vary: 0.1,
      rng: rng(11),
    },
  );

  return b.root;
}
```