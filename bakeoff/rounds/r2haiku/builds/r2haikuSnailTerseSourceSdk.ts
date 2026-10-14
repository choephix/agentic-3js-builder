import * as THREE from "three";
import { createBuilder, countershade, mottle, paint } from "../../../../src/index";

export const meta = {
  name: "Snail",
  description: "A garden snail with a banded spiral shell, a blotched soft body and two eye-stalks on a rigged spine.",
};

/** Piecewise-linear value of `ys` at t in 0..1, keyed evenly. */
const key = (t: number, ys: number[]) => {
  const x = Math.min(Math.max(t, 0), 1) * (ys.length - 1);
  const i = Math.min(Math.floor(x), ys.length - 2);
  const f = x - i;
  return ys[i] + (ys[i + 1] - ys[i]) * f;
};

const BODY_RX = [0.007, 0.018, 0.021, 0.019, 0.017];
const BODY_RY = [0.007, 0.013, 0.016, 0.015, 0.014];

// Soft body: darker blotched back, pale belly and foot.
const bodyPaint = countershade(
  mottle("#8c6a40", "#6e4f2e", { size: 0.015, seed: 3, contrast: 1.2 }),
  "#eadbb0",
  { level: -0.2, soft: 0.3 },
);

// Shell: cream dome with brown helical bands and a darker rim at the base.
const shellPaint = paint((_p, _n, s) => {
  const f = s[0] * 90 + (s[1] / 360) * 2;
  const frac = f - Math.floor(f);
  if (s[0] < 0.006) return "#8e6b44";
  return frac < 0.18 ? "#6b4526" : "#e6d3a3";
});

export default function snail() {
  const b = createBuilder({ name: "snail", detail: 1, paintSize: 1024 });

  // Spine: tail to head, rising slightly toward the neck. The tip joint is the head.
  const body = b.chain(
    "body",
    [
      [0, 0.012, -0.065],
      [0, 0.016, -0.02],
      [0, 0.02, 0.02],
      [0, 0.025, 0.06],
    ],
    { names: ["rear", "midBody", "neck", "head"], role: "spine" },
  );

  // Soft body tube: round at both ends, flattened foot underneath.
  b.sweep(body, {
    radius: (t) => [key(t, BODY_RX), key(t, BODY_RY)],
    color: bodyPaint,
    name: "body",
  });

  // Spiral shell: a lathed dome seated on the mantle.
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.044, 0.012],
      [0.036, 0.032],
      [0.022, 0.046],
      [0.01, 0.054],
      [0, 0.058],
    ],
    {
      color: shellPaint,
      at: [0, 0.03, -0.02],
      axis: [0, 1, 0],
      segments: 16,
      bone: "midBody",
      name: "shell",
    },
  );

  // Upper eye-stalks, one per side, each a two-span chain ending in an eye.
  const stalk = (side: "L" | "R", x: number) => {
    const chain = b.chain(
      `stalk${side}`,
      [
        [x, 0.028, 0.05],
        [x * 1.3, 0.045, 0.058],
        [x * 1.8, 0.066, 0.062],
      ],
      {
        parent: "head",
        names: [`stalk${side}1`, `stalk${side}2`, `eye${side}`],
        role: "tentacle",
      },
    );
    b.sweep(chain, { radius: [0.0045, 0.0025], color: bodyPaint, name: `stalk${side}` });

    const tip = chain.at(1);
    b.part(new THREE.SphereGeometry(0.0048, b.segments(10), b.segments(8)), "#16110d", {
      frame: tip,
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0013, b.segments(6), b.segments(5)), "#ffffff", {
      frame: tip,
      at: tip.local([0.0022, 0.0018, 0.0038]),
      name: `eyeShine${side}`,
    });
  };
  stalk("L", 0.01);
  stalk("R", -0.01);

  // Short lower feelers at the front of the head.
  for (const [side, x] of [
    ["L", 0.006],
    ["R", -0.006],
  ] as const) {
    b.capsule(
      [x, 0.02, 0.054],
      [x * 1.3, 0.028, 0.078],
      0.0028,
      { color: bodyPaint, bone: "head", name: `feeler${side}` },
    );
  }

  return b.root;
}
