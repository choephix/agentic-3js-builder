import * as THREE from "three";
import { catmull, cells, createBuilder, paint, polyline, rgb, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description:
    "A dragonfly perched on a reed: teal thorax with lime shoulders, a sapphire and turquoise banded abdomen, faceted emerald eyes and clear wings with brown veins.",
};

type Color3 = [number, number, number];

const col = (hex: string): Color3 => [...rgb(hex)] as Color3;
const mixC = (a: Color3, b: Color3, t: number): Color3 => {
  const k = Math.min(Math.max(t, 0), 1);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

// ---------------------------------------------------------------- palette
const TEAL = col("#1d9a88");
const LIME = col("#d4f25e");
const PALE = col("#dcf6c8");
const BELLY = col("#a8eedd");
const BLACK = col("#111416");
const SAPPHIRE = col("#1b3d9c");
const TURQ = col("#2ed3c6");
const SKY = col("#63d9ff");
const WHITE: Color3 = [1, 1, 1];
const EYE_TEAL = col("#0f8074");
const EYE_GREEN = col("#44d18a");
const EYE_BLUE = col("#2b6fe0");
const EYE_DARK = col("#05201f");
const WING_CLEAR = col("#e7f5f1");
const WING_AMBER = col("#f0b25a");
const WING_TIP = col("#bfe2ff");
const VEIN = col("#4a3322");
const PTERO = col("#2e1b10");

const LIME_HEX = "#d4f25e";
const LEG = "#1f2e2c";
const STALK = "#5b7b34";
const BLADE = "#58813b";
const PEBBLE = "#6d675d";
const CERCI = "#141a1f";
const ANTENNA = "#15181c";

// ---------------------------------------------------------------- paints
const thoraxPaint = paint((p, n) => {
  if (n.y < -0.45) return PALE;
  if (n.y > 0.5 && Math.abs(p.x) < 0.001) return BLACK;
  if (Math.abs(n.x) > 0.5) {
    if ((p.z > 0.018 && p.z < 0.0198) || (p.z > 0.0222 && p.z < 0.0238)) return BLACK;
    if (p.z > 0.0246 && p.z < 0.0276) return LIME;
  }
  return TEAL;
});

const ABDOMEN_FRONT = 0.004;
const ABDOMEN_LENGTH = 0.08;
const SEGMENTS: Color3[] = [TURQ, TURQ, BLACK, SAPPHIRE, SAPPHIRE, SAPPHIRE, SAPPHIRE, BLACK, TURQ, BLACK];
const abdomenPaint = paint((p, n) => {
  if (n.y < -0.45) return BELLY;
  const u = Math.min(Math.max((ABDOMEN_FRONT - p.z) / ABDOMEN_LENGTH, 0), 0.9999) * SEGMENTS.length;
  const seg = Math.floor(u);
  const f = u - seg;
  if (f < 0.06 || f > 0.94) return BLACK; // the joint between segments
  if (n.y > 0.6 && Math.abs(p.x) < 0.0008) return BLACK; // dorsal line
  if (Math.abs(n.x) > 0.6 && f > 0.3 && f < 0.7 && seg >= 3 && seg <= 6) return SKY; // lateral spots
  return SEGMENTS[seg];
});

const headPaint = paint((_, n) => (n.z > 0.45 && n.y < 0.2 ? LIME : EYE_DARK));

const EYE_LIGHT = new THREE.Vector3(-0.35, 0.65, 0.68).normalize();
const eyePaint = paint((p, n) => {
  const c = cells(p, 0.0017, 7); // ommatidia: one facet per cell
  const base = c.id < 0.35 ? EYE_TEAL : c.id < 0.7 ? EYE_GREEN : EYE_BLUE;
  const seam = 1 - smoothstep(0, 0.16, c.d2 - c.d1);
  const glint = smoothstep(0.55, 0.95, n.dot(EYE_LIGHT));
  return mixC(mixC(base, EYE_DARK, seam * 0.9), WHITE, glint * 0.7);
});

const WING_ROOT = 0.0035;
/** Wing paint: amber at the root, clear toward the tip, veins, cross-veins and a pterostigma. */
function wingPaint(zc: number, half: number, hind: boolean) {
  return paint((p) => {
    const x = Math.max(Math.abs(p.x) - WING_ROOT, 0); // along the wing
    const a = (p.z - zc) / half; // across: -1 trailing edge .. +1 leading edge
    let c = mixC(WING_AMBER, WING_CLEAR, smoothstep(0, 0.022, x));
    c = mixC(c, WING_TIP, smoothstep(0.028, 0.048, x) * 0.8);
    if (x > 0.0015 && Math.abs(a * 3 - Math.round(a * 3)) < 0.07) c = VEIN; // longitudinal veins
    if (x > 0.0015 && a > 0.55 && x % 0.0016 < 0.00022) c = VEIN; // costal cross-veins
    if (!hind && x > 0.031 && x < 0.04 && a > 0.6 && a < 0.92) c = PTERO; // pterostigma
    if (!hind && x > 0.019 && x < 0.023 && a > 0.55 && a < 0.8) c = VEIN; // nodus
    return c;
  });
}

// ---------------------------------------------------------------- shapes
const ABDOMEN = [
  [0, 0.2, 0.004],
  [0, 0.1999, -0.012],
  [0, 0.1994, -0.028],
  [0, 0.1986, -0.044],
  [0, 0.1975, -0.06],
  [0, 0.1962, -0.076],
];
const ABDOMEN_NAMES = ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5", "abdomenEnd"];

const LEGS = [
  {
    name: "fore",
    pts: [
      [0.003, 0.195, 0.0275],
      [0.0105, 0.188, 0.0305],
      [0.012, 0.18, 0.0262],
      [0.0016, 0.1858, 0.02],
    ],
  },
  {
    name: "mid",
    pts: [
      [0.0034, 0.1945, 0.0185],
      [0.0128, 0.187, 0.0178],
      [0.0122, 0.1785, 0.014],
      [0.0026, 0.1842, 0.0176],
    ],
  },
  {
    name: "hind",
    pts: [
      [0.0034, 0.1945, 0.0105],
      [0.0118, 0.188, 0.0078],
      [0.0098, 0.18, 0.004],
      [0.0019, 0.1868, 0.0158],
    ],
  },
];

// Wing outlines in (x, z) for the left side; the right side mirrors x.
const FORE_WING: Array<[number, number]> = [
  [0.0035, 0.0275],
  [0.009, 0.0298],
  [0.02, 0.0307],
  [0.033, 0.0303],
  [0.042, 0.0292],
  [0.0485, 0.027],
  [0.0505, 0.024],
  [0.0488, 0.0215],
  [0.044, 0.0195],
  [0.034, 0.018],
  [0.022, 0.0178],
  [0.011, 0.019],
  [0.0035, 0.0212],
];
const HIND_WING: Array<[number, number]> = [
  [0.0035, 0.0205],
  [0.012, 0.0212],
  [0.024, 0.02],
  [0.033, 0.0168],
  [0.0385, 0.013],
  [0.039, 0.0098],
  [0.036, 0.0075],
  [0.029, 0.0068],
  [0.019, 0.0072],
  [0.01, 0.0082],
  [0.0035, 0.0095],
];

export default function dragonfly() {
  const b = createBuilder({ name: "dragonfly", detail: 1, paintSize: 2048 });

  // Skeleton: the thorax is the root; head, jaw, wings, abdomen and six legs hang from it.
  b.joint("thorax", { at: [0, 0.2, 0.018], dir: [0, 0, 1], up: [0, 1, 0], role: "spine" });
  b.joint("head", { parent: "thorax", at: [0, 0.203, 0.0385], dir: [0, 0, 1], up: [0, 1, 0], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.1994, 0.0438], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const out = [side, 0, 0];
    b.joint(`wingF${tag}`, {
      parent: "thorax",
      at: [side * 0.0035, 0.2068, 0.0243],
      dir: out,
      up: [0, 0, 1],
      role: "wing",
    });
    b.joint(`wingH${tag}`, {
      parent: "thorax",
      at: [side * 0.0035, 0.2058, 0.0145],
      dir: out,
      up: [0, 0, 1],
      role: "wing",
    });
  }
  b.chain("abdomen", ABDOMEN, { parent: "thorax", names: ABDOMEN_NAMES, role: "tail" });
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    for (const leg of LEGS) {
      const chain = b.chain(
        `${leg.name}Leg${tag}`,
        leg.pts.map(([x, y, z]) => [x * side, y, z]),
        {
          parent: "thorax",
          names: [`${leg.name}Hip${tag}`, `${leg.name}Knee${tag}`, `${leg.name}Ankle${tag}`, `${leg.name}Foot${tag}`],
          role: "leg",
        },
      );
      b.sweep(chain, [0.0012, 0.0005], { color: LEG, sides: 6 });
    }
  }

  // Head: the eyes are most of it, faceted by cell noise; a lime face plate and antennae.
  b.part(new THREE.SphereGeometry(0.0072, b.segments(12), b.segments(9)), headPaint, {
    at: [0, 0.203, 0.0385],
    bone: "head",
    name: "head",
  });
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0068, b.segments(14), b.segments(10)), eyePaint, {
      at: [side * 0.006, 0.2036, 0.0398],
      scale: [1, 1, 1.1],
      bone: "head",
      name: side > 0 ? "eyeL" : "eyeR",
    });
  }
  for (const side of [1, -1]) {
    b.rod(
      [side * 0.0006, 0.2064, 0.042],
      [side * 0.0016, 0.2078, 0.0446],
      [0.0006, 0.00016],
      { color: ANTENNA, bone: "head", name: "antenna" },
    );
  }
  b.part(new THREE.SphereGeometry(0.0046, b.segments(10), b.segments(7)), LIME_HEX, {
    at: [0, 0.1992, 0.0462],
    scale: [1.1, 0.75, 0.6],
    bone: "jaw",
    name: "labium",
  });

  // Thorax: a stout, banded loft on the root.
  b.loft(
    [
      { at: [0, 0.2003, 0.0295], w: 0.01, h: 0.011 },
      { at: [0, 0.2, 0.019], w: 0.0128, h: 0.0132 },
      { at: [0, 0.1998, 0.0095], w: 0.0098, h: 0.0108 },
      { at: [0, 0.1996, 0.0035], w: 0.006, h: 0.0068 },
    ],
    { color: thoraxPaint, bone: "thorax", sides: 10, name: "thorax" },
  );

  // Abdomen: ten segments on a drooping spine, banded by the paint.
  const abdomen = b.chain("abdomenBody", ABDOMEN, { parent: "thorax", names: ABDOMEN_NAMES, role: "tail" });
  b.sweep(abdomen, [0.0029, 0.0034, 0.0039, 0.0041, 0.004, 0.0038, 0.0035, 0.0032, 0.0028, 0.0023, 0.0019], {
    color: abdomenPaint,
    sides: 8,
    name: "abdomen",
  });
  for (const side of [1, -1]) {
    b.rod([side * 0.0008, 0.1961, -0.0745], [side * 0.003, 0.195, -0.0852], [0.0009, 0.0003], {
      color: CERCI,
      bone: "abdomenEnd",
      name: "cercus",
    });
  }

  // Wings: flat, extended, veined; each a planar slab on its own wing joint.
  const foreWing = wingPaint(0.0243, 0.0065, false);
  const hindWing = wingPaint(0.0143, 0.0068, true);
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    b.slab(
      FORE_WING.map(([x, z]) => [side * x, 0.2068, z]),
      { color: foreWing, thickness: 0.00028, bone: `wingF${tag}`, name: `forewing${tag}` },
    );
    b.slab(
      HIND_WING.map(([x, z]) => [side * x, 0.2058, z]),
      { color: hindWing, thickness: 0.00028, bone: `wingH${tag}`, name: `hindwing${tag}` },
    );
  }

  // Scenery: the reed the dragonfly rests on, its pebble base, and a leaning blade.
  b.sweep(
    polyline([
      [0, 0.003, 0.018],
      [0, 0.198, 0.018],
    ]),
    [0.0034, 0.0021],
    { color: STALK, bone: "thorax", sides: 7, name: "reed" },
  );
  b.part(new THREE.SphereGeometry(0.0105, b.segments(10), b.segments(6)), PEBBLE, {
    at: [0, 0.0045, 0.018],
    scale: [1, 0.5, 1],
    bone: "thorax",
    name: "pebble",
  });
  b.sweep(
    catmull([
      [-0.03, 0.002, -0.022],
      [-0.035, 0.065, -0.026],
      [-0.045, 0.125, -0.034],
    ]),
    [0.0016, 0.0002],
    { color: BLADE, bone: "thorax", sides: 4, name: "blade" },
  );

  return b.root;
}
