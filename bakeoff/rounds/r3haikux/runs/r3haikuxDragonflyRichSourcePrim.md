```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, mix, noise, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "An emperor dragonfly (Anax imperator) hovering over a pond at real size: a slim electric-blue abdomen with a black dorsal line, an apple-green thorax, huge turquoise compound eyes, six tucked legs and four veined, faintly golden wings held flat.",
};

const DEG = Math.PI / 180;

/** Thorax centre height: the dragonfly hovers this far above the pond. */
const HOVER = 0.3;
/** Height of the flat plane the four wings lie in. */
const WING_Y = 0.3094;

const BLUE = "#1f78ff";
const BLUE_PALE = "#9cc8ff";
const BLACK = "#06070c";
const APPLE = "#a6dc4e";
const APPLE_DARK = "#183a2c";
const PLATE = "#1d4530";
const EYE_LIT = "#3ad9c6";
const EYE_DARK = "#0b5561";
const FACE = "#2b6b62";
const LEG = "#15181c";
const CLEAR = "#f6f1da";
const GOLD = "#ebcb80";
const VEIN = "#3a2a14";
const PTEROSTIGMA = "#2e1c0c";
const WATER_DEEP = "#24717c";
const WATER_EDGE = "#0c3b47";
const RIPPLE = "#cdf4ee";

/** Forewing chord profile: [share of span, offset across in wing units]. + is forward (the leading edge). */
const LEAD: ReadonlyArray<readonly [number, number]> = [
  [0, 0.0026],
  [0.2, 0.004],
  [0.45, 0.0047],
  [0.7, 0.0044],
  [0.9, 0.0033],
  [1, 0.0012],
];
const TRAIL: ReadonlyArray<readonly [number, number]> = [
  [0, -0.0022],
  [0.2, -0.0031],
  [0.45, -0.004],
  [0.7, -0.0042],
  [0.9, -0.0034],
  [1, -0.001],
];
/** Longitudinal veins, as offsets across the wing. */
const LONG_VEINS = [0.0032, 0.0018, 0.0004, -0.001, -0.0024, -0.0034];
/** Spacing of the cross veins along the span. */
const CROSS_GAP = 0.0016;

type Wing = {
  name: string;
  /** Root of the left wing, in model metres. */
  base: [number, number, number];
  /** Degrees from +X toward +Z (forward). */
  angle: number;
  length: number;
  width: number;
};

const WINGS: Wing[] = [
  { name: "forewing", base: [0.0042, WING_Y, 0.0058], angle: 8, length: 0.051, width: 1 },
  { name: "hindwing", base: [0.0042, WING_Y, -0.0066], angle: -7, length: 0.048, width: 1.06 },
];

type Limb = Record<"hip" | "knee" | "ankle" | "foot", [number, number, number]>;

/** Tucked legs, as left-side points (x is mirrored for the right side). */
const LEGS: Record<"F" | "M" | "B", Limb> = {
  F: {
    hip: [0.004, 0.2935, 0.0105],
    knee: [0.0098, 0.28, 0.0232],
    ankle: [0.0118, 0.2718, 0.0152],
    foot: [0.007, 0.2682, 0.0058],
  },
  M: {
    hip: [0.0044, 0.2928, -0.0032],
    knee: [0.0118, 0.2792, -0.0012],
    ankle: [0.0108, 0.2706, -0.0082],
    foot: [0.0058, 0.2676, -0.015],
  },
  B: {
    hip: [0.004, 0.2928, -0.0118],
    knee: [0.0104, 0.2802, -0.0136],
    ankle: [0.0104, 0.2716, -0.0214],
    foot: [0.0044, 0.268, -0.0262],
  },
};

/** Piecewise-linear value of a profile table at s. */
function profile(table: ReadonlyArray<readonly [number, number]>, s: number) {
  if (s <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [s1, v1] = table[i];
    if (s <= s1) {
      const [s0, v0] = table[i - 1];
      return v0 + ((v1 - v0) * (s - s0)) / (s1 - s0);
    }
  }
  return table[table.length - 1][1];
}

/** Unit direction of a left wing's span, in the x and z axes. */
function spanDir(w: Wing) {
  const r = w.angle * DEG;
  return { dx: Math.cos(r), dz: Math.sin(r) };
}

/** Model point of a wing outline: `a` along the span, `c` across (+ forward). `side` is +1 left, -1 right. */
function wingPoint(w: Wing, side: number, a: number, c: number): [number, number, number] {
  const { dx, dz } = spanDir(w);
  const [bx, by, bz] = w.base;
  return [side * (bx + a * dx - c * dz), by, bz + a * dz + c * dx];
}

/** The wing outline as [span, across] points, counter-clockwise around the wing. */
function wingOutline(w: Wing): Array<[number, number]> {
  const L = w.length;
  const k = w.width;
  const lead = LEAD.map(([s, c]): [number, number] => [s * L, c * k]);
  const trail = [...TRAIL].reverse().map(([s, c]): [number, number] => [s * L, c * k]);
  return [...lead, [L * 1.025, 0.0001 * k], ...trail];
}

/** Glassy wing: pale clear membrane with a golden sheen, a fine vein net and a dark pterostigma near the tip. */
function wingSkin(w: Wing, side: number) {
  const { dx, dz } = spanDir(w);
  return paint((p) => {
    const rx = side * p.x - w.base[0];
    const rz = p.z - w.base[2];
    const a = rx * dx + rz * dz;
    const c = (rz * dx - rx * dz) / w.width;
    const s = Math.min(Math.max(a / w.length, 0), 1);
    const lead = profile(LEAD, s);
    const long = Math.max(...LONG_VEINS.map((v) => smoothstep(0.00026, 0.00012, Math.abs(c - v))));
    const cross = 0.85 * smoothstep(0.00013, 0.00006, Math.abs(a - Math.round(a / CROSS_GAP) * CROSS_GAP));
    const costa = smoothstep(0.00042, 0.00024, Math.abs(c - (lead - 0.0003)));
    const stigma =
      smoothstep(0.855, 0.865, s) *
      smoothstep(0.935, 0.925, s) *
      smoothstep(0.0008, 0.0004, Math.abs(c - (lead - 0.0011)));
    const sheen = Math.min(Math.max(0.25 + 0.5 * (1 - s) + 0.6 * (noise(p, 0.016, 5) - 0.5), 0), 1);
    const ink = mix(mix(CLEAR, GOLD, sheen), VEIN, 0.85 * Math.max(long, cross, costa));
    return mix(ink, PTEROSTIGMA, stigma);
  });
}

/** Apple-green thorax with two dark oblique bars on each flank. */
const thoraxPaint = paint((p) => {
  const y = p.y - HOVER;
  const flank = smoothstep(0.003, 0.0046, Math.abs(p.x));
  const bar1 = smoothstep(0.0013, 0.0007, Math.abs(p.z - (0.0045 + 0.9 * y)));
  const bar2 = smoothstep(0.0014, 0.0008, Math.abs(p.z + 0.0055 + 0.6 * y));
  return mix(APPLE, APPLE_DARK, flank * Math.max(bar1, bar2));
});

/** Electric-blue abdomen: a black dorsal line and black marks at the back of each segment on the flanks. */
const abdomenPaint = paint((_p, _n, s) => {
  const [t, deg] = s;
  const dorsal = Math.min(deg, 360 - deg); // 0 on top, 180 underneath
  const rear = t * 9 - Math.floor(t * 9); // position within a segment
  const flank = smoothstep(35, 50, dorsal) * smoothstep(115, 100, dorsal);
  const mark = smoothstep(0.78, 0.86, rear) * flank;
  const line = smoothstep(15, 9, dorsal);
  const body = mix(BLUE, BLUE_PALE, smoothstep(105, 150, dorsal));
  return mix(body, BLACK, Math.max(line, mark));
});

/** Turquoise compound eye: faceted with darker ommatidia seams and a glint toward the viewer. */
const eyePaint = paint((p, n) => {
  const cell = cells(p, 0.0012, 3);
  const seam = smoothstep(0.03, 0.14, cell.d2 - cell.d1);
  const lit = 0.8 + 0.3 * cell.id + 0.12 * smoothstep(0.2, 0.9, n.z);
  const k = mix(EYE_DARK, EYE_LIT, seam);
  return [k[0] * lit, k[1] * lit, k[2] * lit] as const;
});

/** Pond water: deeper towards the rim, with a few concentric ripple rings. */
const pondPaint = paint((p) => {
  const r = Math.hypot(p.x, p.z);
  const water = mix(WATER_DEEP, WATER_EDGE, smoothstep(0.03, 0.11, r));
  const ripple = Math.max(
    smoothstep(0.001, 0.0004, Math.abs(r - 0.036)),
    0.7 * smoothstep(0.001, 0.0004, Math.abs(r - 0.064)),
    0.45 * smoothstep(0.0009, 0.0003, Math.abs(r - 0.09)),
  );
  return mix(water, RIPPLE, 0.75 * ripple);
});

export default function emperorDragonfly() {
  const b = createBuilder({ name: "emperor dragonfly", detail: 1, paintSize: 2048 });
  const sphere = (w: number, h: number) => new THREE.SphereGeometry(1, b.segments(w), b.segments(h));

  // Skeleton: the thorax is the root. The head, wings and legs hang from it and the abdomen runs back.
  const thorax = b.joint("thorax", { at: [0, HOVER, -0.002], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.304, 0.018], dir: [0, 0, 1], role: "head" });
  const abdomen = b.chain(
    "abdomen",
    catmull([
      [0, HOVER, -0.01],
      [0, HOVER - 0.0005, -0.03],
      [0, HOVER - 0.0018, -0.052],
      [0, HOVER - 0.0036, -0.076],
    ]),
    {
      parent: thorax,
      count: 6,
      names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5", "abdomen6", "abdomenTip"],
      role: "tail",
    },
  );

  // Head: two huge eyes that wrap over the top, and a small dark face beneath them.
  for (const side of [1, -1]) {
    b.part(sphere(16, 12), eyePaint, {
      at: [side * 0.0048, 0.3065, 0.0225],
      scale: [0.0088, 0.0086, 0.0105],
      bone: head,
      name: side > 0 ? "eyeL" : "eyeR",
    });
  }
  b.part(sphere(8, 6), FACE, {
    at: [0, 0.2985, 0.0262],
    scale: [0.0028, 0.002, 0.0024],
    bone: head,
    name: "face",
  });

  // Thorax, with dark wing-root plates bridging it to the wings.
  b.part(sphere(14, 10), thoraxPaint, {
    at: [0, HOVER, -0.002],
    scale: [0.0072, 0.0098, 0.012],
    bone: thorax,
    name: "thorax",
  });
  for (const z of [0.0058, -0.0066]) {
    for (const side of [1, -1]) {
      b.part(sphere(8, 6), PLATE, {
        at: [side * 0.0042, 0.308, z],
        scale: [0.003, 0.0016, 0.0042],
        bone: thorax,
        name: "wingRoot",
      });
    }
  }

  // Abdomen: a slim tapering tube along the chain, with a waist and a slight club at the end.
  b.sweep(abdomen, [0.0026, 0.003, 0.0031, 0.0029, 0.0025, 0.0022, 0.002, 0.0019, 0.0021], {
    color: abdomenPaint,
    sides: 10,
    name: "abdomen",
  });
  const tip = abdomen.joints[abdomen.joints.length - 1];
  for (const side of [1, -1]) {
    b.spike(
      [side * 0.0008, HOVER - 0.0036, -0.0745],
      [side * 0.3, -0.12, -1],
      0.0055,
      0.0009,
      { color: BLACK, bone: tip, name: "cercus" },
    );
  }

  // Four wings: a flat veined membrane per wing on its own joint, held out level.
  for (const w of WINGS) {
    for (const side of [1, -1]) {
      const { dx, dz } = spanDir(w);
      const suffix = side > 0 ? "L" : "R";
      const joint = b.joint(`${w.name}${suffix}`, {
        parent: thorax,
        at: wingPoint(w, side, 0, 0),
        dir: [side * dx, 0, dz],
        role: "wing",
      });
      b.slab(
        wingOutline(w).map(([a, c]) => wingPoint(w, side, a, c)),
        {
          color: wingSkin(w, side),
          thickness: 0.00007,
          bone: joint,
          name: `${w.name}${suffix}`,
        },
      );
    }
  }

  // Six thin legs, tucked forward and back under the body.
  for (const pair of ["F", "M", "B"] as const) {
    for (const side of [1, -1]) {
      const tag = `${pair}${side > 0 ? "L" : "R"}`;
      const pose = LEGS[pair];
      const points = (["hip", "knee", "ankle", "foot"] as const).map(
        (k): [number, number, number] => [side * pose[k][0], pose[k][1], pose[k][2]],
      );
      const leg = b.chain(`leg${tag}`, points, {
        parent: thorax,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`],
        role: "leg",
      });
      b.sweep(leg, [0.0005, 0.0004, 0.00032, 0.00022], { color: LEG, sides: 6 });
    }
  }

  // The pond below: a flat disc of water, its top at the floor, with ripples.
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.003, b.segments(48)), pondPaint, {
    at: [0, -0.0015, 0],
    bone: thorax,
    name: "pond",
  });

  return b.root;
}
```