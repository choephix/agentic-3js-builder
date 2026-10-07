import * as THREE from "three";
import { createBuilder, catmull, paint } from "../../../../src/index";

const BODY = "#8f8268";
const FOOT = "#cfc4a4";
const SHELL_BROWN = "#6e4526";
const SHELL_CREAM = "#e9d6ae";
const EYE = "#1d1a17";
const GLINT = "#ffffff";

function fract(x: number): number {
  return x - Math.floor(x);
}

export const meta = {
  name: "snail",
  description: "A garden snail with a spiral-banded shell, a broad creeping foot and two long eye stalks.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });

  // Spine of the soft body, front to back. First joint is the root.
  const body = b.chain("body", catmull([[0, 0.013, 0.052], [0, 0.014, 0], [0, 0.013, -0.045]]), {
    role: "spine",
    names: ["bodyF", "bodyM", "bodyR"],
  });

  // Creeping foot: a flat slab under the body, tapering at both ends.
  b.loft(
    [
      { at: [0, 0.005, 0.058], w: 0.012, h: 0.006 },
      { at: [0, 0.006, 0.02], w: 0.026, h: 0.008 },
      { at: [0, 0.007, -0.03], w: 0.024, h: 0.012 },
      { at: [0, 0.012, -0.048], w: 0.012, h: 0.014 },
    ],
    { bone: body, color: FOOT },
  );

  // Soft mantle body.
  b.sweep(body, (t) => [0.012 - 0.002 * t, 0.0105], { color: BODY });

  // Neck and head, rising from the front of the body.
  const neck = b.chain("neck", catmull([[0, 0.013, 0.05], [0, 0.017, 0.066], [0, 0.017, 0.078]]), {
    parent: body.joints[0],
    count: 2,
    names: ["neck", "head"],
    role: "neck",
  });
  b.sweep(neck, [0.0095, 0.0088], { color: BODY });
  const head = neck.joints[1];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Long upper eye stalks, each ending in a glossy eye.
    const stalk = b.chain(
      `stalk${side}`,
      catmull([
        [s * 0.005, 0.02, 0.076],
        [s * 0.009, 0.037, 0.074],
        [s * 0.012, 0.052, 0.07],
      ]),
      {
        parent: head,
        names: [`stalk${side}1`, `stalk${side}2`, `eye${side}`],
        role: "tentacle",
      },
    );
    b.sweep(stalk, [0.0038, 0.0016], { color: BODY });
    const tip = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.0048, 8, 6), EYE, { bone: tip, at: tip.at });
    b.part(new THREE.SphereGeometry(0.0016, 6, 4), GLINT, {
      bone: tip,
      at: tip.local({ forward: 0.0035, up: 0.0025, right: -s * 0.0015 }),
    });

    // Short lower feelers.
    b.sweep(
      catmull([
        [s * 0.004, 0.016, 0.082],
        [s * 0.0065, 0.025, 0.09],
        [s * 0.0075, 0.03, 0.092],
      ]),
      [0.0026, 0.001],
      { color: FOOT, bone: head },
    );
  }

  // Spiral-banded shell, a turned dome sitting on the back of the body.
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.024, 0.004],
      [0.023, 0.012],
      [0.018, 0.02],
      [0.01, 0.026],
      [0, 0.028],
    ],
    {
      at: [0, 0.013, -0.006],
      bone: body.joints[1],
      smoothing: 1,
      color: paint((_p, _n, s) => (fract(s[1] / 360 + s[0] * 40) < 0.5 ? SHELL_BROWN : SHELL_CREAM)),
    },
  );

  return b.root;
}
