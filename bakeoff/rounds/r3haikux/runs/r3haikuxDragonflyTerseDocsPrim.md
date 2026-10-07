```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, paint } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

type V3 = [number, number, number];
/** A vein as [ax, ay, bx, by], in wing-outline meters. */
type Seg = [number, number, number, number];

export const meta = {
  name: "dragonfly",
  description:
    "A perched dragonfly: honeycomb turquoise eyes, lime thorax with yellow shoulder bars, a segmented cobalt and turquoise abdomen, and amber veined wings held flat.",
};

// Wing outlines in meters. x runs forward (the leading edge is at +x), y runs out along the span.
const FORE: OutlinePoint[] = [
  [0.0018, 0.0],
  [0.004, 0.01],
  [0.0052, 0.024],
  [0.0048, 0.037],
  [0.0018, 0.0415],
  [-0.0008, 0.0425],
  [-0.004, 0.0385],
  [-0.0048, 0.026],
  [-0.0042, 0.012],
  [-0.0018, 0.0],
];

const HIND: OutlinePoint[] = [
  [0.0046, 0.0],
  [0.0058, 0.009],
  [0.0064, 0.02],
  [0.0056, 0.03],
  [0.003, 0.0358],
  [-0.003, 0.0368],
  [-0.005, 0.03],
  [-0.0058, 0.019],
  [-0.005, 0.009],
  [-0.004, 0.0],
];

// Palette
const INK = "#15181c";
const HEAD = "#1d2a30";
const LEG = "#2a2320";
const TARSUS = "#d9b86c";
const EYE_A = "#22d0c6";
const EYE_B = "#0b76a0";
const GLINT = "#f4fffd";
const TURQ = "#2ad2c9";
const COBALT = "#1f5cbc";
const SPOT = "#9af5e8";
const PALE = "#d6f8ef";
const LIME = "#8cc64a";
const YELLOW = "#f2de52";
const DEEP = "#2d5a2e";
const MOUTH = "#c5ecdc";
const CERCI = "#efe6bd";
const WING = "#ead39c";
const WING_BASE = "#d7a64e";
const VEIN = "#6a4619";
const PTERO = "#8c3f12";

/** Distance from (x, y) to the segment s. */
function segDist(x: number, y: number, s: Seg): number {
  const [ax, ay, bx, by] = s;
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - dx * t, y - ay - dy * t);
}

/** Longitudinal wing veins fanning from the root to the tip. */
function fanVeins(count: number, base: number, tip: number, shift: number, len: number): Seg[] {
  const veins: Seg[] = [];
  for (let i = 0; i < count; i++) {
    const k = i - (count - 1) / 2;
    veins.push([k * base, 0.0008, k * tip + shift, len]);
  }
  return veins;
}

/** Angle from the dorsal top: 0 = up, 180 = belly. */
function dorsal(deg: number): number {
  return Math.abs((((deg % 360) + 540) % 360) - 180);
}

function wingPaint(veins: Seg[], pterostigma: boolean, rungs: boolean) {
  return paint((_p, _n, s) => {
    const x = s[0];
    const y = s[1];
    if (y < 0.0045) return WING_BASE;
    if (pterostigma && x > 0.0034 && x < 0.0047 && y > 0.0347 && y < 0.0369) return PTERO;
    for (const v of veins) if (segDist(x, y, v) < 0.00011) return VEIN;
    if (rungs && x > 0.002 && y % 0.0042 < 0.00011) return VEIN;
    return WING;
  });
}

const CELL = (2 * Math.PI) / 30; // 12 degree facets

export default function build() {
  const b = createBuilder({ name: "dragonfly" });

  // ---- paints ----
  const eyePaint = paint((p, n) => {
    const sx = p.x >= 0 ? 1 : -1;
    // catchlight, mirrored for each eye
    if (sx * n.x * 0.348 + n.y * 0.497 + n.z * 0.795 > 0.955) return GLINT;
    const lon = Math.atan2(n.x, n.z) / CELL;
    const lat = Math.asin(Math.max(-1, Math.min(1, n.y))) / CELL;
    const fu = Math.abs(lon - Math.round(lon));
    const fv = Math.abs(lat - Math.round(lat));
    if (Math.min(fu, fv) < 0.16) return INK;
    return (Math.floor(lon) + Math.floor(lat)) % 2 === 0 ? EYE_A : EYE_B;
  });

  const thoraxPaint = paint((p, n) => {
    if (n.y < -0.5) return DEEP;
    if (n.y > 0.55 && Math.abs(p.x) < 0.0011) return INK;
    if (Math.abs(n.x) > 0.45) {
      const bar = (c: number) => Math.abs(p.z - c - 0.6 * (p.y - 0.0355)) < 0.0018;
      if (bar(0.0035) || bar(-0.006)) return YELLOW;
    }
    return LIME;
  });

  const abdPaint = paint((_p, _n, s) => {
    const seg = s[0] * 10;
    const f = seg - Math.floor(seg);
    if (f < 0.1 || f > 0.9) return INK;
    const d = dorsal(s[1]);
    if (d < 26) return TURQ;
    if (d > 125) return PALE;
    if (f > 0.34 && f < 0.66 && d > 55 && d < 100) return SPOT;
    return COBALT;
  });

  const legPaint = paint((_p, _n, s) => (s[0] > 0.8 ? TARSUS : LEG));

  const forePaint = wingPaint(fanVeins(7, 0.0006, 0.0012, -0.0004, 0.036), true, true);
  const hindPaint = wingPaint(fanVeins(5, 0.0008, 0.0016, 0.0003, 0.034), false, false);

  // ---- skeleton ----
  const thorax = b.joint("thorax", { at: [0, 0.0355, 0], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: thorax, at: [0, 0.0358, 0.0175], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.0358, 0.0255], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.0296, 0.0296], dir: [0, -0.5, 1], role: "jaw" });

  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, 0.0348, -0.004],
      [0, 0.0338, -0.02],
      [0, 0.0332, -0.038],
      [0, 0.0334, -0.056],
      [0, 0.0342, -0.07],
    ]),
    { parent: thorax, count: 5, role: "tail" },
  );

  // ---- thorax and head ----
  b.part(new THREE.SphereGeometry(1, 14, 10).scale(0.0085, 0.0105, 0.0135), thoraxPaint, {
    at: [0, 0.0355, 0],
    bone: thorax,
    flat: true,
  });

  b.capsule([0, 0.0358, 0.01], [0, 0.0358, 0.023], 0.0042, { bone: neck, color: HEAD });

  b.part(new THREE.SphereGeometry(0.0078, 12, 8), HEAD, {
    at: [0, 0.0358, 0.0255],
    bone: head,
    flat: true,
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0074, 14, 10), eyePaint, {
      at: [s * 0.0068, 0.037, 0.0265],
      bone: head,
    });
    b.rod([s * 0.001, 0.0432, 0.03], [s * 0.0034, 0.0456, 0.0345], 0.0006, { bone: head, color: INK });
  }

  // pale frons between the eyes
  b.part(new THREE.SphereGeometry(1, 10, 6).scale(0.002, 0.0018, 0.0012), PALE, {
    at: [0, 0.0362, 0.0336],
    bone: head,
    flat: true,
  });

  // lower jaw
  b.part(new THREE.SphereGeometry(1, 10, 6).scale(0.0042, 0.0026, 0.0038), MOUTH, {
    at: [0, 0.0296, 0.0296],
    bone: jaw,
    flat: true,
  });

  // ---- abdomen ----
  b.sweep(abdomen, [0.0072, 0.004, 0.003, 0.0034, 0.0038, 0.0033, 0.0027], {
    color: abdPaint,
    sides: 8,
    smooth: false,
  });

  const tip = abdomen.joints[abdomen.joints.length - 1];
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.002, 0.0341, -0.0685],
        [s * 0.0046, 0.0327, -0.0815],
      ],
      [0.0011, 0.0004],
      { bone: tip, color: CERCI, sides: 6 },
    );
  }

  // ---- wings: held flat, forewing and hindwing per side ----
  const wingSpecs = [
    { key: "F", at: [0.007, 0.041, 0.0045] as V3, outline: FORE, shade: forePaint },
    { key: "H", at: [0.0068, 0.0399, -0.0035] as V3, outline: HIND, shade: hindPaint },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const w of wingSpecs) {
      const at: V3 = [s * w.at[0], w.at[1], w.at[2]];
      const wing = b.joint(`wing${w.key}${side}`, { parent: thorax, at, dir: [s, 0, 0], role: "wing" });
      b.extrude(w.outline, {
        at,
        x: [0, 0, 1],
        y: [s, 0, 0],
        thickness: 0.0006,
        bevel: 0.0002,
        smoothing: 2,
        color: w.shade,
        bone: wing,
      });
    }
  }

  // ---- six legs, feet resting on the floor ----
  const legs: { key: string; hip: V3; foot: V3 }[] = [
    { key: "F", hip: [0.0048, 0.0296, 0.0095], foot: [0.015, 0.0006, 0.0185] },
    { key: "M", hip: [0.0052, 0.0294, 0.0], foot: [0.02, 0.0006, -0.0045] },
    { key: "H", hip: [0.0046, 0.0292, -0.01], foot: [0.0125, 0.0006, -0.0245] },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const leg of legs) {
      const k = leg.key + side;
      const root: V3 = [s * leg.hip[0], leg.hip[1], leg.hip[2]];
      const target: V3 = [s * leg.foot[0], leg.foot[1], leg.foot[2]];
      const pts = limb(root, target, [0.012, 0.012, 0.01], [
        [s * 0.4, 1, 0],
        [s * 0.4, 1, 0],
      ]);
      const chain = b.chain(`leg${k}`, pts, {
        parent: thorax,
        names: [`hip${k}`, `knee${k}`, `ankle${k}`, `foot${k}`],
        role: "leg",
      });
      b.sweep(chain, [0.003, 0.0017, 0.0012, 0.0008], { color: legPaint, sides: 6 });
    }
  }

  return b.root;
}
```