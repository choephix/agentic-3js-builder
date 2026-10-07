```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, scales } from "agentic-3js-builder";

export const meta = {
  name: "dragonfly",
  description: "A hawker-style dragonfly: big scaled eyes, a segmented blue abdomen, glassy wings and six spiny legs.",
};

const BLUE = "#1f6fbf";
const TEAL = "#2c9c9a";
const DARK = "#14181e";
const GREEN = "#4f8a3a";
const YELLOW = "#e8c63c";
const FACE = "#7fb34a";
const EYE = "#3a8fd0";
const EYE_DARK = "#0d2c4a";
const WING = "#d4eef6";
const AMBER = "#c58a2a";
const VEIN = "#2a3340";

const eyePaint = scales(EYE, EYE_DARK, { size: 0.0035, width: 0.0009 });
const thoraxPaint = paint((_p, n) => (Math.abs(n.x) > 0.7 ? YELLOW : GREEN));
const abdPaint = paint((_p, n, s) => {
  if (Math.floor(s[0] * 9) % 2 === 1) return DARK;
  return n.y > 0.3 ? TEAL : BLUE;
});
const wingPaint = paint((_p, _n, s) => (s[0] > 0.78 && s[1] < 0.3 ? AMBER : WING));

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // Skeleton: thorax root, head with a separate jaw, abdomen chain, six legs, four wings.
  const thorax = b.joint("thorax", { at: [0, 0.042, 0], role: "spine" });
  const head = b.joint("head", {
    parent: thorax,
    at: [0, 0.047, 0.027],
    aim: [0, 0.047, 0.07],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.011, down: 0.006 }),
    aim: head.local({ forward: 0.03, down: 0.008 }),
    role: "jaw",
  });

  // Head: a dark core, two big compound eyes meeting on top, short antennae.
  b.part(new THREE.SphereGeometry(0.0085, 12, 8), DARK, { bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0105, 14, 10), eyePaint, {
      bone: head,
      at: head.local({ left: s * 0.0085, up: 0.002, forward: 0.004 }),
    });
    b.rod(
      head.local({ left: s * 0.003, up: 0.008, forward: 0.006 }),
      head.local({ left: s * 0.008, up: 0.016, forward: 0.014 }),
      0.0007,
      { color: DARK },
    );
  }
  // Lower face on the jaw joint.
  b.part(new THREE.SphereGeometry(0.0055, 8, 6).scale(1.5, 0.6, 1.1), FACE, { bone: jaw });

  // Thorax: a stout loft, green with yellow flank stripes.
  b.loft(
    [
      { at: [0, 0.044, 0.014], w: 0.02, h: 0.02 },
      { at: [0, 0.042, 0.0], w: 0.026, h: 0.027 },
      { at: [0, 0.04, -0.014], w: 0.022, h: 0.024 },
    ],
    { bone: thorax, color: thoraxPaint },
  );

  // Abdomen: a long tapering tube with banded segments and a fork of claspers at the tip.
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, 0.042, 0.01],
      [0, 0.04, -0.02],
      [0, 0.037, -0.045],
      [0, 0.034, -0.07],
      [0, 0.032, -0.095],
      [0, 0.031, -0.115],
    ]),
    { parent: thorax, count: 6, role: "tail" },
  );
  b.sweep(abdomen, (t) => 0.0078 - 0.0046 * t, { color: abdPaint });
  for (const s of [1, -1]) b.spike(abdomen.at(1), [s * 0.5, 0, -1], 0.012, 0.0013, { color: DARK });

  // Legs: spiny, splayed, each planted on the floor by limb IK.
  const legs = [
    { k: "F", hip: [0.012, 0.03, 0.014], foot: [0.05, 0.0012, 0.032] },
    { k: "M", hip: [0.011, 0.029, 0.0], foot: [0.046, 0.0012, -0.006] },
    { k: "H", hip: [0.009, 0.027, -0.016], foot: [0.034, 0.0012, -0.056] },
  ];
  for (const leg of legs) {
    for (const s of [1, -1]) {
      const sl = s > 0 ? "L" : "R";
      const k = leg.k + sl;
      const pts = limb(
        [s * leg.hip[0], leg.hip[1], leg.hip[2]],
        [s * leg.foot[0], leg.foot[1], leg.foot[2]],
        [0.026, 0.024, 0.02],
        [
          [0, 1, 0],
          [0, 1, 0],
        ],
      );
      const chain = b.chain(`leg${k}`, pts, {
        parent: thorax,
        names: [`hip${k}`, `knee${k}`, `ankle${k}`, `foot${k}`],
        role: "leg",
      });
      b.sweep(chain, (t) => 0.0024 - 0.001 * t, { color: DARK });
    }
  }

  // Wings: each one a leading and trailing vein chain with a glassy membrane between them.
  const wing = (s: number, tag: string, lead: number[][], trail: number[][]) => {
    const sl = s > 0 ? "L" : "R";
    const mir = (p: number[]) => [s * p[0], p[1], p[2]];
    const a = b.chain(`${tag}Lead${sl}`, catmull(lead.map(mir)), {
      parent: thorax,
      names: [`${tag}Lead${sl}1`, `${tag}Lead${sl}2`],
      role: "wing",
    });
    const c = b.chain(`${tag}Trail${sl}`, catmull(trail.map(mir)), {
      parent: thorax,
      names: [`${tag}Trail${sl}1`, `${tag}Trail${sl}2`],
      role: "wing",
    });
    b.membrane(a, c, { color: wingPaint, thickness: 0.0005, rows: 4 });
    b.sweep(a, 0.0006, { color: VEIN });
    b.sweep(c, 0.0005, { color: VEIN });
    for (const t of [0.25, 0.5, 0.75]) b.rod(a.at(t), c.at(t), 0.0003, { color: VEIN });
  };
  for (const s of [1, -1]) {
    wing(
      s,
      "fw",
      [
        [0.007, 0.052, 0.016],
        [0.026, 0.06, 0.018],
        [0.05, 0.063, 0.02],
      ],
      [
        [0.007, 0.051, 0.006],
        [0.026, 0.059, 0.005],
        [0.046, 0.062, 0.002],
      ],
    );
    wing(
      s,
      "hw",
      [
        [0.006, 0.05, 0],
        [0.024, 0.057, -0.002],
        [0.044, 0.06, -0.004],
      ],
      [
        [0.006, 0.049, -0.018],
        [0.024, 0.056, -0.02],
        [0.041, 0.059, -0.02],
      ],
    );
  }

  return b.root;
}
```