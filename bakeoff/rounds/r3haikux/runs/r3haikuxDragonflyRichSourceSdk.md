```ts
import * as THREE from "three";
import { bezier, catmull, cells, createBuilder, mix, noise, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "An emperor dragonfly hovering over a pond: a long electric-blue abdomen with black dorsal markings, an apple-green thorax, huge turquoise eyes, four veined glassy wings held flat and wide, and six legs tucked beneath.",
};

// Palette
const ELECTRIC = "#1d6fff";
const SKY = "#6cb8ff";
const BLACK = "#0b0c10";
const APPLE = "#a3d84c";
const MOSS = "#4b8a24";
const HEAD = "#c9e76e";
const LABIUM = "#e8f0a4";
const LEG = "#16191c";
const EYE_LIGHT = "#5eeada";
const EYE_DEEP = "#0a8593";
const EYE_RIM = "#05333d";
const GLASS = "#eef7f2";
const GOLD = "#f1cd6b";
const AMBER = "#c8862c";
const VEIN = "#3a2e1c";
const STIGMA = "#2e1c0a";

// ---------------------------------------------------------------- paints

/** Electric blue, a black line down the back and a dash in each segment, fading toward the tip. */
const abdomenPaint = paint((_p, _n, s) => {
  const t = s[0]; // 0 at the thorax, 1 at the tip
  const dorsal = Math.min(s[1], 360 - s[1]); // 0 on top, 180 underneath
  const f = t * 10 - Math.floor(t * 10); // position within the current segment
  const fade = 1 - smoothstep(0.6, 0.95, t);
  const line = 1 - smoothstep(3, 5.5, dorsal);
  const dash =
    (1 - smoothstep(12, 15, dorsal)) * smoothstep(0.18, 0.3, f) * (1 - smoothstep(0.72, 0.84, f)) * fade;
  const body = mix(ELECTRIC, SKY, smoothstep(100, 140, dorsal));
  return mix(body, BLACK, Math.max(0.9 * line, dash));
});

/** Apple green, darker underneath, with two black shoulder stripes on each side. */
const thoraxPaint = paint((_p, _n, s) => {
  const t = s[0]; // 0 at the neck, 1 at the rear
  const a = Math.min(s[1], 360 - s[1]); // 0 on top, 180 underneath, the same on both sides
  const base = mix(APPLE, MOSS, smoothstep(105, 150, a));
  const band = (centre: number, half: number) => 1 - smoothstep(half, half + 2, Math.abs(a - centre));
  const stripe = Math.max(band(84 - 12 * t, 3), band(114 - 10 * t, 2));
  return mix(base, BLACK, stripe * smoothstep(0.04, 0.16, t) * (1 - smoothstep(0.82, 0.98, t)));
});

/** Turquoise compound eyes: a net of facets with dark borders, brighter on top. */
const eyePaint = paint((p, n) => {
  const cell = cells(p, 0.0013, 5);
  const inside = smoothstep(0.02, 0.14, cell.d2 - cell.d1); // 0 on a facet border
  const facet = mix(EYE_DEEP, EYE_LIGHT, 0.2 + 0.6 * cell.id + 0.3 * smoothstep(-0.2, 0.9, n.y));
  return mix(EYE_RIM, facet, inside);
});

type Edge = ReadonlyArray<readonly [number, number]>;

/** The leading edge's chord at span u, linearly between the given [span, chord] points. */
const edgeAt = (edge: Edge, u: number) => {
  for (let i = 1; i < edge.length; i++) {
    const [u0, v0] = edge[i - 1];
    const [u1, v1] = edge[i];
    if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / Math.max(u1 - u0, 1e-9);
  }
  return edge[edge.length - 1][1];
};

/**
 * Glassy wing: pale with a faint gold sheen, a fine net of dark cells, longitudinal veins, a dark costa along the
 * leading edge and, on the forewing, a pterostigma near the tip.
 */
const wingPaint = (edge: Edge, stigma: boolean) =>
  paint((p, _n, s) => {
    const u = s[0]; // out along the span from the root
    const v = s[1]; // across the chord: + forward (leading edge), - back
    const lead = edgeAt(edge, u);
    let c = mix(GLASS, GOLD, 0.15 + 0.3 * noise(p, 0.03, 4));
    c = mix(c, AMBER, 0.5 * (1 - smoothstep(0.003, 0.012, u)));
    const net = cells(new THREE.Vector3(u, v, 0), 0.0017, 9);
    c = mix(c, VEIN, 0.85 * (1 - smoothstep(0.03, 0.18, net.d2 - net.d1)));
    let longitudinal = 0;
    for (const k of [-0.0036, -0.0018, 0, 0.0018, 0.0034])
      longitudinal = Math.max(longitudinal, 1 - smoothstep(0.00008, 0.0002, Math.abs(v - k)));
    c = mix(c, VEIN, 0.6 * longitudinal);
    c = mix(c, VEIN, smoothstep(0.0009, 0.0004, lead - v));
    if (stigma)
      c = mix(
        c,
        STIGMA,
        smoothstep(0.0021, 0.0017, Math.abs(u - 0.0405)) *
          smoothstep(0.0002, 0.0004, lead - v) *
          smoothstep(0.0012, 0.0009, lead - v),
      );
    return c;
  });

// Wing outlines, [span, chord] in metres from the root (span outward, chord + forward).
const FORE: number[][] = [
  [0, 0.0011],
  [0.006, 0.0022],
  [0.016, 0.004],
  [0.028, 0.005],
  [0.038, 0.0052],
  [0.046, 0.0044],
  [0.05, 0.0022],
  [0.0512, 0],
  [0.05, -0.0024],
  [0.044, -0.004],
  [0.033, -0.0048],
  [0.02, -0.004],
  [0.008, -0.0022],
  [0, -0.0011],
];
const FORE_EDGE: Edge = [
  [0, 0.0011],
  [0.006, 0.0022],
  [0.016, 0.004],
  [0.028, 0.005],
  [0.038, 0.0052],
  [0.046, 0.0044],
  [0.05, 0.0022],
  [0.0512, 0],
];
const HIND: number[][] = [
  [0, 0.0026],
  [0.008, 0.0048],
  [0.02, 0.0064],
  [0.032, 0.007],
  [0.042, 0.0064],
  [0.049, 0.004],
  [0.052, 0.001],
  [0.0525, -0.0012],
  [0.05, -0.004],
  [0.044, -0.0058],
  [0.034, -0.0066],
  [0.022, -0.0062],
  [0.011, -0.0048],
  [0, -0.0022],
];
const HIND_EDGE: Edge = [
  [0, 0.0026],
  [0.008, 0.0048],
  [0.02, 0.0064],
  [0.032, 0.007],
  [0.042, 0.0064],
  [0.049, 0.004],
  [0.052, 0.001],
  [0.0525, -0.0012],
];

// ---------------------------------------------------------------- model

export default function emperorDragonfly() {
  const b = createBuilder({ name: "emperor dragonfly", paintSize: 2048 });
  const Y = 0.125; // thorax height: the hover height above the pond

  // Skeleton: the thorax is the root; head, jaw, abdomen, wings and legs hang from it.
  b.joint("thorax", { at: [0, Y, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("head", { parent: "thorax", at: [0, Y + 0.001, 0.019], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, Y - 0.0038, 0.0215], dir: [0, -0.45, 1], role: "jaw" });

  // Abdomen: ten segments, slim and gently drooping in the hover.
  const abdomen = b.chain(
    "abdomen",
    bezier([0, Y - 0.001, -0.01], [0, Y - 0.0015, -0.03], [0, Y - 0.0025, -0.049], [0, Y - 0.0035, -0.064]),
    { parent: "thorax", count: 10, role: "tail" },
  );
  b.sweep(abdomen, [0.0022, 0.0016, 0.002, 0.0024, 0.0025, 0.0024, 0.0021, 0.0015], {
    name: "abdomen",
    color: abdomenPaint,
    sides: 10,
  });
  // Two short black appendages at the tip.
  for (const side of [1, -1])
    b.rod([side * 0.0006, Y - 0.0036, -0.063], [side * 0.0016, Y - 0.0042, -0.07], [0.0009, 0.0003], {
      name: "appendage",
      color: BLACK,
      sides: 6,
      bone: "abdomen10",
    });

  // Thorax: a short, chunky apple-green body.
  b.loft(
    [
      { at: [0, Y + 0.0005, 0.0125], w: 0.0085, h: 0.008 },
      { at: [0, Y + 0.001, 0.0045], w: 0.0145, h: 0.013 },
      { at: [0, Y, -0.0045], w: 0.016, h: 0.014 },
      { at: [0, Y - 0.0005, -0.011], w: 0.014, h: 0.0125 },
      { at: [0, Y - 0.0015, -0.0165], w: 0.009, h: 0.009 },
    ],
    { name: "thorax", color: thoraxPaint, bone: "thorax", sides: 12 },
  );

  // Head, huge wraparound eyes and the lower lip.
  b.part(new THREE.SphereGeometry(0.0056, b.segments(12), b.segments(8)), HEAD, {
    name: "head",
    at: [0, Y + 0.001, 0.019],
    bone: "head",
  });
  for (const side of [1, -1])
    b.part(new THREE.SphereGeometry(0.0074, b.segments(16), b.segments(12)), eyePaint, {
      name: side > 0 ? "eye left" : "eye right",
      at: [side * 0.004, Y + 0.0025, 0.0185],
      scale: [1, 0.95, 1.12],
      bone: "head",
    });
  b.part(new THREE.SphereGeometry(0.0034, b.segments(10), b.segments(8)), LABIUM, {
    name: "labium",
    at: [0, Y - 0.0038, 0.0215],
    scale: [1.3, 0.7, 1],
    bone: "jaw",
  });

  // Four wings, held flat and wide: each a joint at its root with its own veined membrane.
  const wingY = Y + 0.0045;
  const wings = [
    { name: "foreL", side: 1, z: 0.0045, outline: FORE, edge: FORE_EDGE, stigma: true },
    { name: "hindL", side: 1, z: -0.008, outline: HIND, edge: HIND_EDGE, stigma: false },
    { name: "foreR", side: -1, z: 0.0045, outline: FORE, edge: FORE_EDGE, stigma: true },
    { name: "hindR", side: -1, z: -0.008, outline: HIND, edge: HIND_EDGE, stigma: false },
  ];
  for (const w of wings) {
    const at = [w.side * 0.0035, wingY, w.z];
    b.joint(w.name, { parent: "thorax", at, dir: [w.side, 0, 0], up: [0, 0, 1], role: "wing" });
    b.extrude(w.outline, {
      name: `wing.${w.name}`,
      color: wingPaint(w.edge, w.stigma),
      at,
      x: [w.side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.00016,
      smoothing: 2,
      bone: w.name,
    });
  }

  // Six legs, tucked forward under the head: a hip, a knee and a foot on each.
  const legs = [
    { name: "fore", hipZ: 0.0095, kneeZ: 0.012, footZ: 0.0215 },
    { name: "mid", hipZ: 0.001, kneeZ: 0.003, footZ: 0.012 },
    { name: "hind", hipZ: -0.008, kneeZ: -0.0065, footZ: 0.004 },
  ];
  for (const leg of legs)
    for (const side of [1, -1]) {
      const tag = side > 0 ? "L" : "R";
      const path = catmull([
        [side * 0.0045, Y - 0.0045, leg.hipZ],
        [side * 0.0125, Y - 0.016, leg.kneeZ],
        [side * 0.0065, Y - 0.0205, leg.footZ],
      ]);
      const chain = b.chain(`${leg.name}Leg${tag}`, path, {
        parent: "thorax",
        names: [`${leg.name}Thigh${tag}`, `${leg.name}Shin${tag}`],
        role: "leg",
      });
      b.sweep(chain, 0.0008, { color: LEG, sides: 6 });
    }

  return b.root;
}
```