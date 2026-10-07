```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, paint, stripes } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description:
    "A dragonfly at real size (about 12 cm across the wings), resting on six legs. Green thorax with yellow shoulder bands, blue-and-black abdomen with cerci, faceted compound eyes and four clear veined wings.",
};

const THORAX_A = "#2f8a4f";
const THORAX_B = "#c9d94a";
const BODY = "#16362e";
const ABD_A = "#1e8fb3";
const ABD_B = "#0b2f45";
const EYE_A = "#26b5c4";
const EYE_B = "#0a5f73";
const WING = "#d6eef4";
const VEIN = "#3c5f6b";
const STIG = "#2a1a12";
const LEG = "#1d2a26";

const abdomenPaint = paint((_p, _n, s) => {
  const deg = ((s[1] % 360) + 360) % 360;
  if (deg < 35 || deg > 325) return ABD_B; // black dorsal line
  return Math.floor(s[0] * 7) % 2 ? ABD_A : ABD_B; // alternating segment bands
});

const eyePaint = paint((_p, _n, s) =>
  (Math.floor(s[0] * 6) + Math.floor(s[1] * 5)) % 2 ? EYE_A : EYE_B,
);

const thoraxPaint = stripes(THORAX_A, THORAX_B, { size: 0.02, axis: "z" });

const forewingOutline: OutlinePoint[] = [
  [-0.003, 0],
  [0.003, 0],
  [0.005, 0.02],
  [0.0045, 0.042],
  [0.0, 0.058, "sharp"],
  [-0.004, 0.046],
  [-0.0055, 0.02],
];

const hindwingOutline: OutlinePoint[] = [
  [-0.005, 0],
  [0.005, 0],
  [0.0065, 0.02],
  [0.0055, 0.038],
  [0.0, 0.05, "sharp"],
  [-0.005, 0.04],
  [-0.0065, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---- Skeleton -----------------------------------------------------------
  const thorax = b.joint("thorax", { at: [0, 0.03, 0], dir: [0, 0.2, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.041, 0.024], dir: [0, 0.3, 1], role: "head" });

  const abd = b.chain(
    "abd",
    catmull([
      [0, 0.03, -0.016],
      [0, 0.027, -0.045],
      [0, 0.023, -0.08],
      [0, 0.019, -0.115],
    ]),
    { parent: thorax, count: 4, role: "tail" },
  );

  // ---- Body ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.0075, 12, 10), thoraxPaint, {
    bone: thorax,
    at: thorax.at,
    scale: [0.95, 1.1, 1.7],
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.0075, 10, 8), BODY, { bone: head, at: head.at, flat: true });

  // Abdomen: a slender tube with a gentle swell toward the tail.
  b.sweep(abd, (t: number) => 0.0034 + 0.0018 * Math.sin(Math.PI * t * 0.9), {
    color: abdomenPaint,
  });

  // Cerci: a forked pair at the tail tip.
  const tail = abd.at(1).at;
  for (const s of [1, -1]) {
    b.spike(tail, [s * 0.35, -0.25, -1], 0.009, 0.0007, { color: STIG });
  }

  // ---- Head ---------------------------------------------------------------
  // Compound eyes meet over the head; they carry most of the read.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0088, 12, 8), eyePaint, {
      bone: head,
      at: head.local({ right: s * 0.0068, up: 0.0012, forward: 0.0035 }),
      flat: true,
    });
  }

  // Short antennae.
  for (const s of [1, -1]) {
    b.spike(
      head.local({ right: s * 0.0015, up: 0.0055, forward: -0.001 }),
      [s * 0.25, 0.5, 1],
      0.0085,
      0.0007,
      { color: BODY },
    );
  }

  // ---- Legs ---------------------------------------------------------------
  // Three pairs, front, middle and hind, folded under the thorax and planted on the floor.
  const hipZ = [0.004, 0.0, -0.005];
  const footZ = [0.022, 0.0, -0.024];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    for (let k = 0; k < 3; k++) {
      const hip = [s * 0.0055, 0.025, hipZ[k]];
      const foot = [s * 0.026, 0.0006, footZ[k]];
      const pts = limb(hip, foot, [0.02, 0.02], [[s * 0.6, 1, 0]]);
      const names = [`hip${k}${sd}`, `knee${k}${sd}`, `foot${k}${sd}`];
      const leg = b.chain(`leg${k}${sd}`, pts, { parent: thorax, names, role: "leg" });
      b.sweep(leg, [0.0011, 0.0006], { color: LEG });
    }
  }

  // ---- Wings --------------------------------------------------------------
  // Each wing is a flat, veined slab on its own joint, held out sideways at rest.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // Forewing
    const fw = b.joint(`wingF${sd}`, { parent: thorax, at: [s * 0.004, 0.04, 0.003], dir: [s, 0, 0.05], role: "wing" });
    const fwing = b.extrude(forewingOutline, {
      at: fw,
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: 0.0009,
      bevel: 0.0003,
      smoothing: 1,
      color: WING,
      bone: fw,
    });
    const fveins: [number[], number[]][] = [
      [[0, 0], [0, 0.055]],
      [[-0.002, 0], [-0.0035, 0.04]],
      [[0.002, 0], [0.0035, 0.035]],
      [[-0.0035, 0.02], [0.0035, 0.02]],
    ];
    for (const [a, c] of fveins) {
      b.rod(fwing.local([a[0], a[1], s * 0.0005]), fwing.local([c[0], c[1], s * 0.0005]), 0.00035, {
        color: VEIN,
      });
    }
    b.part(new THREE.BoxGeometry(0.0016, 0.0006, 0.0022), STIG, {
      bone: fw,
      at: fwing.local([0.0035, 0.05, s * 0.0004]),
      flat: true,
    });

    // Hindwing, broader at the base and set a little further back
    const hw = b.joint(`wingH${sd}`, { parent: thorax, at: [s * 0.004, 0.04, -0.008], dir: [s, 0, -0.05], role: "wing" });
    const hwing = b.extrude(hindwingOutline, {
      at: hw,
      x: [0, 0, 1],
      y: [s, 0, 0],
      thickness: 0.0009,
      bevel: 0.0003,
      smoothing: 1,
      color: WING,
      bone: hw,
    });
    const hveins: [number[], number[]][] = [
      [[0, 0], [0, 0.048]],
      [[-0.003, 0], [-0.0035, 0.035]],
      [[0.003, 0], [0.003, 0.03]],
    ];
    for (const [a, c] of hveins) {
      b.rod(hwing.local([a[0], a[1], s * 0.0005]), hwing.local([c[0], c[1], s * 0.0005]), 0.00035, {
        color: VEIN,
      });
    }
  }

  return b.root;
}
```