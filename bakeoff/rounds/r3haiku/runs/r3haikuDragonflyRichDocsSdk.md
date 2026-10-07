```ts
import * as THREE from "three";
import { createBuilder, catmull, noise, paint } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

const BLUE = "#1a5cff";
const BLACK = "#101418";
const GREEN = "#8fd45a";
const DARK = "#1b2b2a";
const TURQ_A = "#1ab3b8";
const TURQ_B = "#3fe0d0";
const HILITE = "#e9fffb";
const WING = "#c9ecef";
const VEIN = "#1c2b33";
const GOLD = "#e6c76a";
const LEG = "#1d1d1d";

export const meta = {
  name: "Emperor dragonfly",
  description: "A hovering emperor dragonfly with a blue abdomen, green thorax, turquoise eyes and veined glassy wings.",
};

export default function build() {
  const b = createBuilder({ name: "emperor dragonfly" });

  // Skeleton: thorax is the root; the body hovers at y = 0.30.
  const thorax = b.joint("thorax", { at: [0, 0.3, 0], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.31, 0.03], dir: [0, 0, 1], role: "head" });

  // Thorax: apple-green capsule with black side stripes.
  const thoraxPaint = paint((p, n) =>
    Math.abs(n.x) > 0.5 && Math.sin(p.z * 260) > 0.2 ? BLACK : GREEN,
  );
  b.capsule([0, 0.3, 0.014], [0, 0.302, -0.034], 0.011, { bone: thorax, color: thoraxPaint });

  // Head: dark cap between the eyes.
  b.part(new THREE.SphereGeometry(0.013, 10, 8), DARK, { bone: head, at: [0, 0.308, 0.034] });

  // Huge wraparound eyes, faceted, with a glint on each.
  const eyePaint = paint((p) => (noise(p, 0.012) > 0.5 ? TURQ_A : TURQ_B));
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 14, 10), eyePaint, {
      bone: head,
      at: [s * 0.0105, 0.314, 0.034],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), HILITE, {
      bone: head,
      at: [s * 0.0105 + s * 0.004, 0.323, 0.047],
    });
  }

  // Abdomen: long slender chain, electric blue with black dorsal rings.
  const abd = b.chain(
    "abdomen",
    catmull([
      [0, 0.302, -0.02],
      [0, 0.3, -0.06],
      [0, 0.298, -0.1],
      [0, 0.295, -0.135],
    ]),
    { parent: thorax, names: ["abd1", "abd2", "abd3", "abd4"], role: "tail" },
  );
  const abdPaint = paint((_p, n, s) => (n.y > 0.4 && Math.floor(s[0] * 10) % 2 === 0 ? BLACK : BLUE));
  b.sweep(abd, (t: number) => 0.0035 + 0.0012 * Math.sin(t * Math.PI), { color: abdPaint });

  // Cerci: two small black claspers at the tail tip.
  const e = abd.at(1).at;
  const tipJoint = abd.joints[abd.joints.length - 1];
  for (const s of [1, -1]) {
    b.capsule(e, [e.x + s * 0.003, e.y - 0.002, e.z - 0.012], 0.0007, { bone: tipJoint, color: BLACK });
  }

  // Wings: four flat, veined, glassy panels with a gold sheen.
  const wingPaint = paint((p, _n, s) => {
    if (s[1] > 0.0038) return VEIN; // thick costa
    const net =
      Math.abs(Math.sin((s[0] + s[1]) * 1800)) < 0.08 || Math.abs(Math.sin((s[0] - s[1]) * 1800)) < 0.08;
    if (net) return VEIN;
    return noise(p, 0.02) > 0.6 ? GOLD : WING;
  });

  const fore: OutlinePoint[] = [
    [0, -0.004],
    [0.018, -0.005],
    [0.045, -0.004],
    [0.056, -0.001, "sharp"],
    [0.054, 0.002],
    [0.035, 0.005],
    [0.01, 0.005],
  ];
  const hind: OutlinePoint[] = [
    [0, -0.006],
    [0.02, -0.008],
    [0.045, -0.004],
    [0.052, 0.001, "sharp"],
    [0.04, 0.004],
    [0.012, 0.006],
    [0, 0.004],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wf = b.joint(`fore${side}`, { parent: thorax, at: [s * 0.008, 0.318, 0.012], dir: [s, 0, 0], role: "wing" });
    const wh = b.joint(`hind${side}`, { parent: thorax, at: [s * 0.008, 0.318, -0.008], dir: [s, 0, 0], role: "wing" });
    b.extrude(fore, {
      at: [s * 0.008, 0.318, 0.012],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0009,
      bevel: 0.0003,
      smoothing: 1,
      color: wingPaint,
      bone: wf,
    });
    b.extrude(hind, {
      at: [s * 0.008, 0.318, -0.008],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0009,
      bevel: 0.0003,
      smoothing: 1,
      color: wingPaint,
      bone: wh,
    });
  }

  // Six thin legs tucked under the thorax: knees out, feet folded back.
  const rows: [string, number][] = [
    ["f", 0.014],
    ["m", -0.002],
    ["h", -0.018],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, z] of rows) {
      const leg = b.chain(
        `leg${tag}${side}`,
        [
          [s * 0.008, 0.289, z],
          [s * 0.036, 0.276, z + 0.008],
          [s * 0.026, 0.266, z - 0.004],
        ],
        { parent: thorax, names: [`hip${tag}${side}`, `knee${tag}${side}`], role: "leg" },
      );
      b.sweep(leg, 0.0009, { color: LEG });
    }
  }

  return b.root;
}
```