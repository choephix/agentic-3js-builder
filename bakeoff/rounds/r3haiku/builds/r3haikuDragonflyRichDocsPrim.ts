import * as THREE from "three";
import { createBuilder, catmull, polyline, paint, noise, cells } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description: "Hovering emperor dragonfly: electric blue barred abdomen, apple-green thorax, turquoise compound eyes, four veined wings held flat.",
};

const BLUE = "#1f5fff";
const BLACK = "#101418";
const GREEN = "#9ccc3a";
const TURQ = "#2ccfc0";
const DEEP = "#0d4f5a";
const LEG = "#1b1f24";
const VEIN = "#3a2e1a";
const GOLD = "#eadfb4";
const CLEAR = "#d6ecf7";

const fr = (x: number) => x - Math.floor(x);

// Electric blue abdomen with black dorsal bands.
const abdomenPaint = paint((_p, n, s) => (n.y > 0.4 && fr(s[0] * 9) < 0.45 ? BLACK : BLUE));

// Apple-green thorax with black side stripes.
const thoraxPaint = paint((p, n) => (Math.abs(n.x) > 0.5 && fr(p.z * 50) < 0.35 ? BLACK : GREEN));

// Compound eyes: turquoise with a Worley facet pattern.
const eyePaint = paint((p) => {
  const c = cells(p, 0.0022);
  return c.d2 - c.d1 < 0.16 ? DEEP : TURQ;
});

// Wings: a fine dark net of veins over a faintly golden, glassy tint.
const wingPaint = paint((p, _n, s) => {
  const gx = Math.abs(fr(s[0] / 0.005) - 0.5);
  const gy = Math.abs(fr(s[1] / 0.005) - 0.5);
  const dg = Math.abs(fr((s[0] + s[1]) / 0.0065) - 0.5);
  if (gx > 0.44 || gy > 0.44 || dg > 0.46) return VEIN;
  return noise(p, 0.02) > 0.5 ? GOLD : CLEAR;
});

// Forewing and hindwing outlines in (outward, forward) metres.
const foreOutline: OutlinePoint[] = [
  [0.003, 0.008],
  [0.02, 0.009],
  [0.045, 0.007],
  [0.058, 0.0],
  [0.052, -0.006],
  [0.03, -0.009],
  [0.008, -0.006],
];
const hindOutline: OutlinePoint[] = [
  [0.003, 0.006],
  [0.02, 0.005],
  [0.046, 0.0],
  [0.056, -0.009],
  [0.048, -0.016],
  [0.026, -0.016],
  [0.006, -0.01],
];

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });

  // Skeleton: thorax root, head, abdomen chain, three leg pairs.
  const thorax = b.joint("thorax", { at: [0, 0.3, 0], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.306, 0.026], dir: [0, 0.25, 1], role: "head" });

  // Body: thorax as a flat-shaded ellipsoid.
  b.part(new THREE.SphereGeometry(0.0125, 12, 8), thoraxPaint, {
    bone: thorax,
    at: [0, 0.301, 0],
    scale: [1.0, 1.05, 1.7],
    flat: true,
  });

  // Abdomen: long, slim, slightly clubbed toward the tip.
  const abd = b.chain(
    "abdomen",
    catmull([
      [0, 0.302, -0.016],
      [0, 0.3, -0.045],
      [0, 0.297, -0.08],
      [0, 0.295, -0.115],
    ]),
    { parent: thorax, role: "tail" },
  );
  b.sweep(abd, (t: number) => 0.0028 + 0.0022 * t * t, { color: abdomenPaint, caps: "round" });

  // Cerci at the tail end.
  for (const s of [1, -1]) {
    b.rod([0, 0.295, -0.115], [s * 0.003, 0.293, -0.128], 0.0006, { color: BLACK });
  }

  // Head and huge wraparound eyes.
  b.part(new THREE.SphereGeometry(0.008, 8, 6), BLACK, { bone: head, at: [0, 0.306, 0.026], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0098, 12, 8), eyePaint, {
      bone: head,
      at: [s * 0.0062, 0.307, 0.03],
      scale: [1.0, 1.0, 1.15],
      flat: true,
    });
    b.rod([s * 0.002, 0.316, 0.034], [s * 0.005, 0.322, 0.04], 0.0005, { color: BLACK, bone: head });
  }

  // Wings: flat and wide, a forewing and a hindwing per side.
  for (const s of [1, -1]) {
    b.extrude(foreOutline, {
      at: [0, 0.318, 0.004],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0005,
      smoothing: 1,
      color: wingPaint,
      bone: thorax,
    });
    b.extrude(hindOutline, {
      at: [0, 0.317, -0.01],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0005,
      smoothing: 1,
      color: wingPaint,
      bone: thorax,
    });
  }

  // Six thin legs tucked under the body: forward, middle and hind pairs.
  const pairs = [
    { id: "F", hip: [0.008, 0.294, 0.012], knee: [0.03, 0.288, 0.03], tip: [0.012, 0.283, 0.046] },
    { id: "M", hip: [0.008, 0.293, -0.002], knee: [0.04, 0.286, -0.012], tip: [0.022, 0.28, -0.03] },
    { id: "H", hip: [0.008, 0.292, -0.018], knee: [0.034, 0.287, -0.05], tip: [0.014, 0.281, -0.068] },
  ];
  for (const pair of pairs) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pts = [pair.hip, pair.knee, pair.tip].map(([x, y, z]) => [s * x, y, z]);
      const leg = b.chain(`leg${pair.id}${side}`, polyline(pts), {
        parent: thorax,
        names: [`hip${pair.id}${side}`, `knee${pair.id}${side}`, `tip${pair.id}${side}`],
        role: "leg",
      });
      b.sweep(leg, 0.0011, { color: LEG });
    }
  }

  return b.root;
}
