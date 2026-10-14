```ts
// A dragonfly perched on a reed. Faceted blue eyes, a teal thorax with lime shoulder stripes, a black abdomen with
// turquoise dorsal spots and a club tail, four veined amber wings held out flat, and six spiny legs gripping the stem.
import * as THREE from "three";
import { cells, catmull, createBuilder, grain, mix, paint, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description: "A dragonfly perched on a reed: faceted blue eyes, teal thorax, turquoise-spotted abdomen and veined amber wings.",
};

const DEG = Math.PI / 180;
/** Height of the thorax centre above the ground. The reed stands on the ground and holds the body up. */
const Y = 0.13;
/** A point `dy` above the thorax centre, `x` across and `z` along the body, in metres. */
const P = (x: number, dy: number, z: number): [number, number, number] => [x, Y + dy, z];
const LIGHT = new THREE.Vector3(0.45, 0.75, 0.55).normalize();

const EYE_SEAM = "#0a1f2e";
const EYE_DEEP = "#0f5f8f";
const EYE_BRIGHT = "#37c8f0";
const THORAX = "#1c4a3c";
const LIME = "#b9e04a";
const BLACK = "#15181d";
const TURQUOISE = "#1fb8e8";
const FACE = "#c9e47e";
const LABIUM = "#e4eb9c";
const LEG = "#2a211a";
const CERCUS = "#3a2a1a";
const WING_CLEAR = "#f7ebc6";
const WING_AMBER = "#dfae58";
const WING_DEEP = "#b97f33";
const VEIN = "#6a4220";
const PTEROSTIGMA = "#2d1a0b";
const REED_LIGHT = "#8e7c4f";
const REED_DARK = "#5b4b2b";

/** Compound eyes: small facets with dark seams, a sky-to-navy sheen and a glint. */
const eyePaint = paint((p, n) => {
  const facet = cells(p, 0.0012, 7);
  const seam = smoothstep(0.0, 0.35, facet.d2 - facet.d1);
  const lens = mix(EYE_DEEP, EYE_BRIGHT, 0.35 + 0.5 * facet.id + 0.2 * (n.y * 0.5 + 0.5));
  const glint = Math.pow(Math.max(0, n.dot(LIGHT)), 12);
  return mix(mix(EYE_SEAM, lens, seam), "#ffffff", 0.85 * glint);
});

/** Teal thorax with lime shoulder stripes running back from the front, and a black mid-back ridge. */
const thoraxPaint = paint((p) => {
  const dy = p.y - Y;
  const side = smoothstep(0.0032, 0.0046, Math.abs(p.x));
  const stripe = 1 - smoothstep(0.0011, 0.002, Math.abs(dy + 0.001 - 0.22 * p.z));
  const body = mix(THORAX, LIME, side * stripe);
  const ridge = (1 - smoothstep(0.0006, 0.0014, Math.abs(p.x))) * smoothstep(0.004, 0.006, dy);
  return mix(body, BLACK, ridge);
});

/** Black segments, a turquoise dorsal spot near the front of each, and a turquoise club for the last two. */
const abdomenPaint = paint((_p, _n, [t, deg]) => {
  const along = Math.min(9.999, t * 10);
  const seg = Math.floor(along);
  const f = along - seg;
  const onTop = smoothstep(0.45, 0.8, Math.cos(deg * DEG));
  const spot = seg >= 1 && seg <= 6 ? smoothstep(0.05, 0.14, f) * (1 - smoothstep(0.52, 0.66, f)) * onTop : 0;
  const club = seg >= 8 ? 0.92 : 0;
  return mix(BLACK, TURQUOISE, Math.max(spot, club));
});

/** Clear amber wings: longitudinal veins, a net of cross-veins, a darker base and a dark pterostigma near each tip. */
const wingPaint = paint((_p, _n, [u, v]) => {
  let c: Rgb = mix(WING_CLEAR, WING_AMBER, 0.2 + 0.5 * v);
  c = mix(c, WING_DEEP, 0.4 * (1 - smoothstep(0, 0.25, u)));
  let longitudinal = 0;
  for (const v0 of [0.05, 0.22, 0.4, 0.58, 0.75, 0.9])
    longitudinal = Math.max(longitudinal, 1 - smoothstep(0.006, 0.013, Math.abs(v - v0)));
  const cell = u * 22;
  const across = Math.min(cell - Math.floor(cell), Math.floor(cell) + 1 - cell);
  const cross = 1 - smoothstep(0.012, 0.03, across);
  const ptero = (1 - smoothstep(0, 0.01, Math.abs(u - 0.8) - 0.03)) * (1 - smoothstep(0.07, 0.09, v));
  c = mix(c, VEIN, 0.95 * longitudinal);
  c = mix(c, VEIN, 0.55 * cross);
  return mix(c, PTEROSTIGMA, 0.95 * ptero);
});

/** A stem with long grain running up it. */
const reedPaint = grain(REED_LIGHT, REED_DARK, { size: 0.0016, axis: "y" });

type WingSpec = {
  /** Where the wing leaves the thorax, metres out from the mid-line. */
  root: number;
  length: number;
  /** Chord centre at the root, and how far it drifts (back, negative) toward the tip. */
  z0: number;
  z1: number;
  /** Full chord width at span fraction t (stops ascending from 0 to 1). */
  chord: ReadonlyArray<readonly [number, number]>;
  /** Height above the thorax centre at the root, and extra height at the tip. */
  lift: number;
  tilt: number;
};

const FORE: WingSpec = {
  root: 0.004,
  length: 0.0465,
  z0: 0.0058,
  z1: -0.0016,
  chord: [
    [0, 0.0048],
    [0.35, 0.0082],
    [0.7, 0.0096],
    [0.92, 0.0078],
    [1, 0.0042],
  ],
  lift: 0.005,
  tilt: 0.001,
};

const HIND: WingSpec = {
  root: 0.004,
  length: 0.044,
  z0: -0.0068,
  z1: -0.002,
  chord: [
    [0, 0.006],
    [0.3, 0.0105],
    [0.65, 0.0112],
    [0.9, 0.0088],
    [1, 0.005],
  ],
  lift: 0.005,
  tilt: 0.0008,
};

/** Each leg as hip, knee, ankle and tip for the left side: x across, dy above the thorax centre, z along the body. */
const LEGS = [
  {
    id: "f",
    hip: [0.0042, -0.0056, 0.0105],
    knee: [0.0112, -0.0068, 0.0102],
    ankle: [0.006, -0.0098, 0.006],
    tip: [0.0025, -0.0125, 0.0021],
  },
  {
    id: "m",
    hip: [0.0045, -0.0058, 0],
    knee: [0.0118, -0.0068, -0.0005],
    ankle: [0.0066, -0.01, -0.0012],
    tip: [0.0031, -0.0125, -0.0006],
  },
  {
    id: "h",
    hip: [0.004, -0.0058, -0.0088],
    knee: [0.0112, -0.007, -0.0102],
    ankle: [0.0058, -0.01, -0.0086],
    tip: [0.0022, -0.0125, -0.0024],
  },
];

/** Piecewise-linear value of a profile at t. */
function profile(stops: ReadonlyArray<readonly [number, number]>, t: number) {
  for (let i = 1; i < stops.length; i++) {
    const [t1, v1] = stops[i];
    if (t <= t1) {
      const [t0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return stops[stops.length - 1][1];
}

export default function dragonfly() {
  const b = createBuilder({ name: "dragonfly", detail: 1, paintSize: 2048 });

  // Skeleton: thorax (root), head with a lower jaw, a ten-segment abdomen, two wing pairs and six legs.
  b.joint("thorax", { at: P(0, 0, 0), role: "spine" });
  b.joint("head", { parent: "thorax", at: P(0, 0.006, 0.0215), role: "head" });
  b.joint("jaw", { parent: "head", at: P(0, 0.0028, 0.0268), dir: [0, -0.34, 0.94], role: "jaw" });

  // Abdomen: a drooping chain of ten segments, skinned as one smooth tube.
  const abdomen = b.chain(
    "abdomen",
    catmull([P(0, -0.0005, -0.006), P(0, -0.0028, -0.024), P(0, -0.006, -0.044), P(0, -0.0085, -0.058)]),
    { parent: "thorax", count: 10, names: (i) => `abd${i + 1}`, role: "tail" },
  );
  b.sweep(abdomen, {
    radius: [0.0042, 0.003, 0.0034, 0.004, 0.0043, 0.0042, 0.004, 0.0039, 0.004, 0.0044, 0.0036],
    color: abdomenPaint,
    sides: 10,
    name: "abdomen",
  });
  b.spike(abdomen.at(1), [0.5, -0.12, -1], 0.0095, 0.0011, { color: CERCUS, name: "cercusL" });
  b.spike(abdomen.at(1), [-0.5, -0.12, -1], 0.0095, 0.0011, { color: CERCUS, name: "cercusR" });

  // Thorax: a rounded, slightly tilted loft from the rear to the prothorax.
  b.loft(
    [
      { at: P(0, -0.003, -0.0125), w: 0.007, h: 0.0076 },
      { at: P(0, -0.0016, -0.0065), w: 0.012, h: 0.0122 },
      { at: P(0, 0, 0.0005), w: 0.0136, h: 0.014 },
      { at: P(0, 0.0013, 0.0082), w: 0.014, h: 0.0148 },
      { at: P(0, 0.0034, 0.0135), w: 0.011, h: 0.012 },
    ],
    { color: thoraxPaint, bone: "thorax", sides: 12, name: "thorax" },
  );

  // Head: big compound eyes that nearly meet on top, a pale face and a folded lower lip on the jaw.
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.006, b.segments(18), b.segments(12)), eyePaint, {
      at: P(0.0042 * s, 0.0066, 0.0222),
      scale: [0.95, 1, 1.2],
      bone: "head",
      name: `eye${tag}`,
    });
    b.spike(P(0.0012 * s, 0.0118, 0.0245), [0.2 * s, 1, 0.5], 0.0028, 0.00042, {
      color: BLACK,
      bone: "head",
      name: `antenna${tag}`,
    });
  }
  b.part(new THREE.SphereGeometry(0.0032, b.segments(14), b.segments(10)), FACE, {
    at: P(0, 0.003, 0.0262),
    scale: [1.3, 1, 0.9],
    bone: "head",
    name: "face",
  });
  b.capsule(P(0, 0.0028, 0.0268), P(0, 0.001, 0.0318), [0.0016, 0.0011], {
    color: LABIUM,
    bone: "jaw",
    name: "labium",
  });

  // The reed the dragonfly holds on to: planted at y = 0, its top just under the thorax.
  b.rod([0, 0, 0], P(0, -0.0095, 0), [0.0042, 0.0029], {
    color: reedPaint,
    bone: "thorax",
    sides: 7,
    name: "reed",
  });

  // Wings: each a membrane between a leading and a trailing edge, bending on a three-joint chain.
  const wing = (prefix: string, side: 1 | -1, spec: WingSpec) => {
    const tag = side > 0 ? "L" : "R";
    const name = `${prefix}${tag}`;
    const steps = 8;
    const leading: number[][] = [];
    const trailing: number[][] = [];
    const spine: number[][] = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const x = side * (spec.root + spec.length * t);
      const y = Y + spec.lift + spec.tilt * t;
      const zc = spec.z0 + spec.z1 * t;
      const half = profile(spec.chord, t) / 2;
      leading.push([x, y, zc + half]);
      trailing.push([x, y, zc - half]);
      spine.push([x, y, zc]);
    }
    const bone = b.chain(name, [spine[0], spine[4], spine[8]], {
      parent: "thorax",
      names: [`${name}1`, `${name}2`, `${name}Tip`],
      role: "wing",
    });
    b.membrane(leading, trailing, { color: wingPaint, thickness: 0.00022, rows: 6, bone, name });
  };
  for (const side of [1, -1] as const) {
    wing("forewing", side, FORE);
    wing("hindwing", side, HIND);
  }

  // Legs: six jointed, spiny legs, each gripping the reed with its tarsus.
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    for (const leg of LEGS) {
      const where = (q: readonly number[]) => [side * q[0], Y + q[1], q[2]];
      const chainName = `leg${leg.id.toUpperCase()}${tag}`;
      const limb = b.chain(chainName, [where(leg.hip), where(leg.knee), where(leg.ankle), where(leg.tip)], {
        parent: "thorax",
        names: [`${leg.id}Hip${tag}`, `${leg.id}Knee${tag}`, `${leg.id}Ankle${tag}`, `${leg.id}Tip${tag}`],
        role: "leg",
      });
      b.sweep(limb, { radius: (t: number) => 0.00125 - 0.00055 * t, color: LEG, sides: 6, name: chainName });
      b.spike(limb.at(0.45), [side * 0.6, 0.2, -0.6], 0.0022, 0.00028, {
        color: LEG,
        name: `${chainName}Spine`,
      });
    }
  }

  return b.root;
}
```