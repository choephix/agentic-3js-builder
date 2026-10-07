```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, gradient, countershade, scales } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description: "A stylised standing phoenix with flame-feathered wings, tail and crest, rigged on a bird skeleton.",
};

const GOLD = "#f4b13a";
const ORANGE = "#ea7a22";
const RED = "#c83a1e";
const CRIMSON = "#8e1f1a";
const CREAM = "#fbe9bd";
const BEAK = "#f0b43c";
const TALON = "#2b2220";
const EYE = "#1d1410";
const LEG = "#e7a03a";

// A flame-like plume: rounded root, sharp tip, drawn along +x with width along +y.
function plume(len: number, w: number): OutlinePoint[] {
  return [
    [0, -w * 0.6],
    [len * 0.3, -w],
    [len * 0.7, -w * 0.7],
    [len, 0, "sharp"],
    [len * 0.7, w * 0.7],
    [len * 0.3, w],
    [0, w * 0.6],
  ];
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // Spine: the first spine joint is the root (the hips).
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.05],
      [0, 1.16, 0.1],
      [0, 1.34, 0.3],
      [0, 1.5, 0.44],
    ]),
    { names: ["hips", "midback", "chest"], role: "spine" },
  );
  const bodyPaint = countershade(scales(GOLD, ORANGE, { size: 0.07 }), CREAM, { level: -0.2 });
  b.sweep(spine, [0.13, 0.2, 0.2, 0.12], { color: bodyPaint });

  // Neck and head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.5, 0.44],
      [0, 1.7, 0.56],
      [0, 1.86, 0.7],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  b.sweep(neck, [0.1, 0.066], {
    color: gradient(GOLD, CRIMSON, [0, 1.5, 0.44], [0, 1.86, 0.7]),
  });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1),
    dir: [0, 0.4, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.12, 12, 9), CRIMSON, {
    bone: head,
    at: head.local({ up: 0.04 }),
    scale: [0.9, 0.95, 1.1],
  });

  // Eyes: gold sclera with a dark pupil.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, {
      bone: head,
      at: head.local({ left: s * 0.085, forward: 0.09, up: 0.07 }),
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 5), EYE, {
      bone: head,
      at: head.local({ left: s * 0.085, forward: 0.112, up: 0.07 }),
    });
  }

  // Flame crest: five plates standing up and back from the crown.
  const crestPaint = paint((_p, _n, s) => (s[0] > 0.15 ? GOLD : CRIMSON));
  for (let k = -2; k <= 2; k++) {
    const base = head.moved({ up: 0.1, back: 0.05, left: k * 0.03 });
    b.extrude(plume(0.3 - Math.abs(k) * 0.04, 0.035), {
      at: base,
      x: [0, 0.8, -0.6],
      y: [0, 0.6, 0.8],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: crestPaint,
    });
  }

  // Beaks: upper on the head, lower on the jaw.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.08 }),
    role: "jaw",
  });
  b.spike(head.moved({ forward: 0.09, up: 0.02 }), [0, -0.15, 1], 0.16, 0.04, { color: BEAK });
  b.spike(jaw.moved({ forward: 0.02 }), [0, 0.1, 1], 0.14, 0.03, { color: BEAK });

  // Wings, mirrored.
  const primaryPaint = paint((_p, _n, s) => (s[0] < 0.12 ? RED : s[0] < 0.3 ? ORANGE : GOLD));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.14, 1.42, 0.22],
        [s * 0.42, 1.64, 0.1],
        [s * 0.8, 1.72, -0.1],
        [s * 1.12, 1.5, -0.32],
      ]),
      {
        parent: spine.joints[2],
        names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.045, 0.012], { color: GOLD });

    // Membrane between the arm and the trailing edge.
    const trailing = catmull([
      [s * 0.12, 1.26, -0.06],
      [s * 0.5, 1.26, -0.3],
      [s * 0.9, 1.38, -0.42],
      [s * 1.12, 1.5, -0.32],
    ]);
    b.membrane(wing, trailing, {
      color: gradient(RED, GOLD, [s * 0.3, 1.45, -0.1], [s * 1.1, 1.5, -0.3]),
      thickness: 0.015,
      scallop: 0.1,
    });

    // Primary feathers: longer toward the tip.
    for (let k = 0; k < 6; k++) {
      const t = 0.5 + k * 0.09;
      const len = 0.22 + k * 0.03;
      b.extrude(plume(len, 0.05), {
        at: wing.at(t),
        x: [s, 0, 0],
        y: [0, -0.5, -0.85],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: primaryPaint,
      });
    }

    // Shorter coverts along the leading edge.
    for (let k = 0; k < 5; k++) {
      const t = 0.12 + k * 0.08;
      b.extrude(plume(0.2, 0.06), {
        at: wing.at(t),
        x: [s, 0, 0],
        y: [0, -0.5, -0.85],
        thickness: 0.01,
        bevel: 0.003,
        smoothing: 1,
        color: ORANGE,
      });
    }
  }

  // Tail: a long curved chain with a fan of flame plumes.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.12],
      [0, 0.92, -0.5],
      [0, 1.02, -0.9],
      [0, 1.3, -1.22],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.07, 0.025], {
    color: gradient(GOLD, ORANGE, [0, 0.98, -0.12], [0, 1.3, -1.22]),
  });

  const tailPaint = paint((_p, _n, s) => (s[0] > 0.55 ? CRIMSON : s[0] > 0.25 ? RED : GOLD));
  for (let k = 0; k < 7; k++) {
    const a = (k - 3) * 0.2;
    const len = 0.95 - Math.abs(k - 3) * 0.08;
    b.extrude(plume(len, 0.075), {
      at: tail.at(0.6),
      x: [Math.sin(a), 0, -Math.cos(a)],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: tailPaint,
    });
  }

  // Legs with talons. Knee bends back, hock forward (bird-like).
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.1, 1.0, -0.02],
      [s * 0.14, 0.03, 0.12],
      [0.36, 0.38, 0.3],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.05, 0.022], { color: LEG });

    const foot = leg.tip;
    if (foot) {
      for (const x of [-0.6, 0, 0.6]) {
        b.spike(foot, [x * 0.5, -0.25, 1], 0.075, 0.014, { color: TALON });
      }
      b.spike(foot, [0, -0.3, -1], 0.05, 0.012, { color: TALON });
    }
  }

  return b.root;
}
```