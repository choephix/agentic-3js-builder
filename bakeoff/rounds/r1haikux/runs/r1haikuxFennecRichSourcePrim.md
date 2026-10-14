```ts
import * as THREE from "three";
import { catmull, createBuilder, noise, paint, rgb, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox kit on a dune",
  description:
    "A fennec kit standing alert on a sand dune at dusk: oversized satin ears lined in peach, a cream-to-gold coat, a plumed tail with a black tip, big dark eyes and a brass bell on a woven leather collar.",
};

type RGB = readonly [number, number, number];

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const dim = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];

// Palette: warm fox, sand going violet in the dusk shade, peach satin lining, brass and leather.
const CREAM = rgb("#f8ecd6");
const UNDERCOAT = rgb("#ead2ac");
const GOLD = rgb("#dba262");
const PEACH = rgb("#f7c8a2");
const PEACH_DEEP = rgb("#eba784");
const JET = rgb("#1d1613");
const SAND_LIT = rgb("#f1c98f");
const SAND = rgb("#cf9b69");
const SAND_SHADE = rgb("#a07662");
const DUSK = rgb("#6b5873");
const LEATHER = rgb("#86522f");
const LEATHER_DEEP = rgb("#5b3521");
const BRASS = rgb("#ebc16a");
const BRASS_DEEP = rgb("#9b7430");

/** The coat: cream underneath, warming to sandy gold along the back. */
function fur(p: THREE.Vector3, n: THREE.Vector3): RGB {
  const patch = noise(p, 0.025, 11) - 0.5;
  const back = smoothstep(0.1, 0.8, n.y + 0.3 * patch);
  return mixRGB(mixRGB(CREAM, GOLD, back), UNDERCOAT, smoothstep(-0.1, -0.7, n.y) * 0.6);
}

const furPaint = paint((p, n) => fur(p, n));

/** Plume tail: coat, with a ragged black smudge over the last fifth of its length. */
const tailPaint = paint((p, n, s) => {
  const tip = smoothstep(0.8, 0.9, s[0] + 0.06 * (noise(p, 0.03, 5) - 0.5));
  return mixRGB(fur(p, n), JET, tip);
});

/** Satin ear: gold-warmed coat on the back, peach lining on the face that looks forward. */
const earPaint = (face: THREE.Vector3) =>
  paint((p, n, s) => {
    const lining = smoothstep(-0.35, 0.35, n.dot(face));
    const outer = mixRGB(fur(p, n), GOLD, 0.35);
    const inner = mixRGB(PEACH, PEACH_DEEP, (1 - smoothstep(0, 0.07, s[1])) * 0.5);
    return mixRGB(outer, inner, lining);
  });

/** Sand dune: lit crest, shaded flanks going violet at dusk, grit and wind ripples. */
const dunePaint = paint((p, n) => {
  const lit = smoothstep(0.1, 0.9, n.y);
  let c = mixRGB(SAND_SHADE, SAND_LIT, lit);
  c = mixRGB(c, SAND, 0.25);
  c = mixRGB(c, DUSK, smoothstep(0.55, 0.15, n.y) * 0.4);
  const grit = noise(p, 0.006, 4);
  const ripple = Math.sin(p.x * 90 + 6 * noise(p, 0.09, 8));
  return dim(c, 0.92 + 0.12 * grit + 0.03 * ripple);
});

/** Woven leather: a basket-weave check across the collar band. */
const weavePaint = paint((p, n, s) => {
  const over = (Math.floor(s[0] * 32) + Math.floor(s[1] * 4)) % 2 === 0;
  return dim(over ? LEATHER : LEATHER_DEEP, 0.88 + 0.22 * smoothstep(-0.3, 0.8, n.y));
});

const brassPaint = paint((p, n) => mixRGB(BRASS_DEEP, BRASS, smoothstep(-0.4, 0.9, n.y + 0.4 * n.z)));

/** An ear's frame: up along its length, face = the lining side, width across it. */
function earFrame(lean: THREE.Vector3, hint: THREE.Vector3) {
  const up = lean.clone().normalize();
  const face = hint.clone().addScaledVector(up, -hint.dot(up)).normalize();
  const width = new THREE.Vector3().crossVectors(up, face);
  return { up, face, width };
}

// Ear outline in its own plane, metres: width along x, length along y, base at the origin.
const EAR = [
  [-0.036, 0],
  [0.036, 0],
  [0.04, 0.05],
  [0.036, 0.11],
  [0.018, 0.15],
  [0, 0.176, "sharp"],
  [-0.018, 0.15],
  [-0.036, 0.11],
  [-0.04, 0.05],
] as const;

const EAR_BASE_L: [number, number, number] = [0.036, 0.398, 0.128];
const EAR_BASE_R: [number, number, number] = [-0.036, 0.398, 0.128];

export default function fennecKit() {
  const b = createBuilder({ name: "fennec-kit", paintSize: 2048 });

  // ---- Skeleton: rest pose, alert, head and ears up, paws planted on the dune. ----
  b.joint("root", { at: [0, 0, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.27, -0.02] });

  // Neck runs from the chest up into the head: its first joint is the chest, its tip the head.
  b.chain(
    "neck",
    catmull([
      [0, 0.3, 0.07],
      [0, 0.335, 0.108],
      [0, 0.365, 0.135],
    ]),
    { parent: "hips", names: ["chest", "neck", "head"], role: "neck" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.335, 0.165], role: "jaw" });

  const earL = earFrame(new THREE.Vector3(0.18, 1, 0.12), new THREE.Vector3(-0.35, 0, 0.94));
  const earR = earFrame(new THREE.Vector3(-0.1, 1, 0.22), new THREE.Vector3(0.2, 0, 0.98));
  b.joint("earL", { parent: "head", at: EAR_BASE_L, dir: earL.up, up: earL.face, role: "hinge" });
  b.joint("earR", { parent: "head", at: EAR_BASE_R, dir: earR.up, up: earR.face, role: "hinge" });

  // Plume tail, drooping gently behind the rump.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.29, -0.09],
      [0, 0.292, -0.17],
      [0, 0.28, -0.26],
      [0, 0.25, -0.33],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, [0.04, 0.062, 0.066, 0.056, 0.04], { color: tailPaint, name: "tail", sides: 12 });

  // ---- Body ----
  b.capsule([0, 0.272, -0.09], [0, 0.3, 0.06], [0.05, 0.06], {
    bone: "hips",
    color: furPaint,
    sides: 10,
    name: "torso",
  });

  // Neck as one smooth bending tube.
  const neck = b.chain(
    "neckTube",
    catmull([
      [0, 0.3, 0.07],
      [0, 0.335, 0.108],
      [0, 0.365, 0.135],
    ]),
    { parent: "hips", names: ["chestB", "neckB", "headB"], role: "neck" },
  );
  b.sweep(neck, [0.052, 0.043, 0.048], { color: furPaint, name: "neckTube", sides: 10 });

  // ---- Legs: slim, on long joints; paws oversized relative to them. ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";

    const fore = b.chain(
      `foreleg${k}`,
      [
        [s * 0.04, 0.275, 0.06],
        [s * 0.04, 0.205, 0.05],
        [s * 0.042, 0.165, 0.085],
        [s * 0.042, 0.148, 0.105],
      ],
      { parent: "chest", names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `pawF${k}`], role: "leg" },
    );
    b.sweep(fore, [0.024, 0.017, 0.014, 0.013], { color: furPaint, name: `foreleg${k}`, sides: 8 });

    // Digitigrade hind leg: knee forward, hock back and low.
    const hind = b.chain(
      `hindleg${k}`,
      [
        [s * 0.042, 0.27, -0.08],
        [s * 0.044, 0.2, -0.045],
        [s * 0.042, 0.15, -0.105],
        [s * 0.042, 0.146, -0.062],
      ],
      { parent: "hips", names: [`hip${k}`, `knee${k}`, `hock${k}`, `pawH${k}`], role: "leg" },
    );
    b.sweep(hind, [0.026, 0.018, 0.014, 0.013], { color: furPaint, name: `hindleg${k}`, sides: 8 });

    b.part(new THREE.SphereGeometry(0.03, 14, 10), furPaint, {
      bone: `pawF${k}`,
      at: [s * 0.042, 0.148, 0.108],
      scale: [1, 0.62, 1.2],
      name: `pawF${k}`,
    });
    b.part(new THREE.SphereGeometry(0.03, 14, 10), furPaint, {
      bone: `pawH${k}`,
      at: [s * 0.042, 0.146, -0.058],
      scale: [1, 0.62, 1.2],
      name: `pawH${k}`,
    });
  }

  // ---- Head ----
  b.part(new THREE.SphereGeometry(0.055, 18, 13), furPaint, {
    bone: "head",
    at: [0, 0.37, 0.15],
    scale: [0.98, 0.92, 1.08],
    name: "skull",
  });
  b.capsule([0, 0.36, 0.17], [0, 0.354, 0.226], [0.036, 0.013], {
    bone: "head",
    color: furPaint,
    sides: 10,
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.0145, 10, 8), "#241915", {
    bone: "head",
    at: [0, 0.355, 0.232],
    scale: [1.15, 0.8, 0.9],
    name: "nose",
  });
  b.capsule([0, 0.338, 0.165], [0, 0.34, 0.212], [0.019, 0.0105], {
    bone: "jaw",
    color: furPaint,
    sides: 8,
    name: "jaw",
  });

  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    // Cheek ruffs.
    b.part(new THREE.SphereGeometry(0.028, 12, 9), furPaint, {
      bone: "head",
      at: [s * 0.034, 0.342, 0.166],
      scale: [0.85, 1, 1.2],
      name: `cheek${k}`,
    });
    // Big dark eyes, with a tiny white catch-light each.
    b.part(new THREE.SphereGeometry(0.02, 14, 10), "#17100d", {
      bone: "head",
      at: [s * 0.031, 0.376, 0.188],
      name: `eye${k}`,
    });
    b.part(new THREE.SphereGeometry(0.0042, 8, 6), "#ffffff", {
      bone: "head",
      at: [s * 0.0392, 0.3866, 0.2073],
      name: `sparkle${k}`,
    });
  }

  // ---- Satin ears: thin extruded shells, peach lining facing forward. ----
  b.extrude(EAR, {
    name: "earL",
    color: earPaint(earL.face),
    at: EAR_BASE_L,
    x: earL.width,
    y: earL.up,
    thickness: [0.014, 0.004],
    bevel: 0.004,
    smoothing: 1,
    bone: "earL",
  });
  b.extrude(EAR, {
    name: "earR",
    color: earPaint(earR.face),
    at: EAR_BASE_R,
    x: earR.width,
    y: earR.up,
    thickness: [0.014, 0.004],
    bevel: 0.004,
    smoothing: 1,
    bone: "earR",
  });

  // ---- Woven leather collar with a small brass bell ----
  b.part(new THREE.TorusGeometry(0.058, 0.0095, 6, 36), weavePaint, {
    bone: "chest",
    at: [0, 0.312, 0.082],
    dir: [0, 0.707, 0.707],
    axis: "z",
    name: "collar",
  });
  b.part(new THREE.SphereGeometry(0.011, 12, 9), brassPaint, {
    bone: "chest",
    at: [0, 0.2585, 0.1255],
    scale: [1, 1.2, 1],
    name: "bell",
  });

  // ---- The sand dune: a half-ellipsoid mound standing on y = 0 ----
  b.part(new THREE.SphereGeometry(0.4, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), dunePaint, {
    bone: "root",
    at: [0, 0, 0],
    scale: [1, 0.36, 1.2],
    name: "dune",
  });

  return b.root;
}
```