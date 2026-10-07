import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { cellPaint, pixelArt } from "../kits/pixel";

export const meta = {
  name: "Greater flamingo",
  description:
    "A greater flamingo standing on both legs: a plump coral body with black-tipped primaries, an S-curved neck, a two-tone bent bill with a jaw, webbed feet with claws, and a pixel-cell feather finish with feather-tuft cards.",
  style: "whimsical pixel-art mix",
  commit: "b816db2",
};

// One texel size for every pixel cell on the model: 1.6 cm square cells.
const TEXEL = 0.016;

// Palettes, darkest first.
const PLUM = ["#8a2a4e", "#b8415f", "#d85a78", "#ec7390", "#f98fa9", "#ffb3c6", "#ffd4de"];
const BLACK = ["#0c0a10", "#1b1822", "#2b2736"];
const LEG = ["#b8456a", "#dd6185", "#f57f9c", "#ff9cb4"];
const BILL = ["#b23f66", "#e05f86", "#ff8ca9"];
const BLUSH = ["#ff9cb4", "#ffc2d0", "#ffe0e8"];
const FOOT = ["#a33a60", "#cf4f76", "#ec6f8f", "#ff98b5"];

// Pixel-art textures: a big storybook eye and a small feather tuft.
const EYE = pixelArt(
  ["..bbbb..", ".byyyyb.", "byyyyyyb", "byykkyyb", "byykkwyb", "byyyyyyb", ".byyyyb.", "..bbbb.."],
  { b: "#2a1420", y: "#ffd84a", k: "#120b12", w: "#ffffff" },
);
const FEATHER = pixelArt(
  ["..w..", ".wpp.", "pPPPd", ".pPd.", "..d.."],
  { w: "#ffe6ee", p: "#ff9fb8", P: "#ff7a9c", d: "#c24a72" },
);

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const mod = (x: number, n: number) => ((x % n) + n) % n;
const lerp1 = (a: number, b: number, t: number) => a + (b - a) * t;

/** Piecewise-smooth values keyed by t: each key is [t, v0, v1, ...]. */
function keyed(t: number, keys: readonly number[][]): number[] {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const z = keys[i];
      const f = (t - a[0]) / (z[0] - a[0]);
      const k = f * f * (3 - 2 * f);
      return a.slice(1).map((v, j) => lerp1(v, z[j + 1], k));
    }
  }
  return keys[keys.length - 1].slice(1);
}

const BODY_KEYS = [
  [0, 0.035, 0.05],
  [0.2, 0.105, 0.1],
  [0.5, 0.16, 0.135],
  [0.8, 0.14, 0.125],
  [1, 0.095, 0.09],
];
const NECK_KEYS = [
  [0, 0.075],
  [0.3, 0.05],
  [0.6, 0.042],
  [0.85, 0.05],
  [1, 0.058],
];
const LEG_KEYS = [
  [0, 0.034],
  [0.3, 0.02],
  [1, 0.013],
];

// Coat: pink feather rows, staggered, with a darker edge on every third cell and dithered shading.
const plumage = cellPaint(
  TEXEL,
  (c) => {
    const scale = mod(c.u + mod(c.v, 2), 3) === 0 ? -0.2 : 0;
    return c.pick(PLUM, clamp(0.5 + 0.3 * c.n.y + scale + 0.1 * (c.random(7) - 0.5)));
  },
  { dither: true },
);

// Head: small dithered blush on the cheeks over a coral face, brighter on top.
const headPaint = cellPaint(
  TEXEL,
  (c) => {
    const cheek = Math.abs(c.at.x) > 0.045 && c.at.y > 1.26 && c.at.y < 1.34 && c.at.z > 0.52;
    if (cheek) return c.pick(BLUSH, 0.2 + 0.6 * c.random(11));
    return c.pick(PLUM, clamp(0.55 + 0.35 * c.n.y + 0.1 * (c.random(5) - 0.5)));
  },
  { dither: true },
);

// Wing: coral coverts, black primaries on the rear third (outline x runs forward, so the tip is negative).
const wingPaint = cellPaint(
  TEXEL,
  (c) =>
    c.s[0] < -0.17
      ? c.pick(BLACK, clamp(0.45 + 0.3 * c.random(3)))
      : c.pick(PLUM, clamp(0.55 + 0.3 * c.n.y + 0.15 * (c.random(9) - 0.5))),
  { dither: true },
);

// Bill: pink base, black hooked tip (surface t runs base to tip).
const billPaint = cellPaint(TEXEL * 0.6, (c) =>
  c.s[0] > 0.78 ? c.pick(BLACK, 0.5) : c.pick(BILL, clamp(0.5 + 0.3 * c.n.y)),
);

const legPaint = cellPaint(
  TEXEL,
  (c) => c.pick(LEG, clamp(0.5 + 0.3 * c.n.y + 0.1 * (c.random(4) - 0.5))),
  { dither: true },
);

const footPaint = cellPaint(
  TEXEL,
  (c) => c.pick(FOOT, clamp(0.4 + 0.3 * c.n.y + 0.1 * (c.random(2) - 0.5))),
  { dither: true },
);

// Outlines (outline x, y in metres).
const FOOT_OUTLINE: OutlinePoint[] = [
  [-0.035, -0.035],
  [0.035, -0.035],
  [0.09, 0.07, "sharp"],
  [0.045, 0.05],
  [0.0, 0.15, "sharp"],
  [-0.045, 0.05],
  [-0.09, 0.07, "sharp"],
];
const TAIL_OUTLINE: OutlinePoint[] = [
  [0.04, -0.03],
  [-0.08, -0.05],
  [-0.15, -0.01, "sharp"],
  [-0.13, 0.06],
  [-0.12, 0.12, "sharp"],
  [-0.05, 0.1],
  [0.04, 0.05],
];
const WING_OUTLINE: OutlinePoint[] = [
  [0.02, 0.0],
  [0.04, 0.05],
  [-0.06, 0.06],
  [-0.18, 0.03],
  [-0.3, -0.02, "sharp"],
  [-0.22, -0.08],
  [-0.1, -0.08],
  [0.0, -0.04],
];
const PRIMARY_OUTLINE: OutlinePoint[] = [
  [0.01, 0.012],
  [-0.1, 0.006],
  [-0.15, -0.004, "sharp"],
  [-0.1, -0.012],
  [0.01, -0.012],
];

export default function build() {
  const b = createBuilder({ name: "flamingoHaiku" });

  // Skeleton: hips at the root, a short spine to the chest, an S-curved neck, a head, a jaw and a tail.
  const hips = b.joint("hips", { at: [0, 0.8, -0.02], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.8, -0.02], [0, 0.84, 0.1], [0, 0.9, 0.2]]), {
    parent: hips,
    names: ["spine1", "chest"],
    role: "spine",
  });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.2],
      [0, 1.02, 0.34],
      [0, 1.16, 0.3],
      [0, 1.25, 0.36],
      [0, 1.28, 0.46],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2", "neck3", "neck4", "neckTip"], role: "neck" },
  );
  const neckTip = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckTip, at: [0, 1.31, 0.52], aim: [0, 1.23, 0.66], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.3, 0.58], aim: [0, 1.19, 0.7], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.82, -0.12], [0, 0.86, -0.24], [0, 0.9, -0.32]]), {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // Body: one tube over the hips and spine, from the rump to the chest.
  const bodyPath = catmull([
    [0, 0.82, -0.3],
    [0, 0.8, -0.14],
    [0, 0.8, -0.02],
    [0, 0.84, 0.1],
    [0, 0.9, 0.2],
  ]);
  const body = b.sweep(bodyPath, (t) => keyed(t, BODY_KEYS) as [number, number], {
    bone: [hips, spine],
    color: plumage,
  });

  // Neck: a tube along the S-curve.
  const neckSweep = b.sweep(neck, (t) => keyed(t, NECK_KEYS)[0], { color: plumage });

  // Head: a chunky sphere, slightly long front to back.
  const skull = b.part(new THREE.SphereGeometry(0.095, 18, 12), headPaint, {
    bone: head,
    at: [0, 1.32, 0.53],
    scale: [1, 0.96, 1.12],
  });
  for (const s of [1, -1]) {
    const eyeHit = b.surface(skull).nearest([s * 0.085, 1.35, 0.56]);
    b.decal(skull, EYE, { at: eyeHit, size: [0.05, 0.05], mirror: s < 0 });
    // Lashes: four short black spikes in an arc above the eye.
    b.ring(eyeHit, { count: 4, radius: 0.03, fromDeg: -55, toDeg: 55 }, (lash) =>
      b.spike(lash, lash, 0.018, 0.003, { color: BLACK[0] }),
    );
  }

  // Bill: the upper mandible bends down; a lower mandible hangs from the jaw joint.
  b.sweep(
    bezier([0, 1.34, 0.6], [0, 1.33, 0.7], [0, 1.27, 0.74], [0, 1.2, 0.7]),
    (t) => [lerp1(0.034, 0.016, t), lerp1(0.026, 0.012, t)] as [number, number],
    { bone: head, color: billPaint },
  );
  b.sweep(
    bezier([0, 1.31, 0.6], [0, 1.3, 0.7], [0, 1.26, 0.72], [0, 1.21, 0.67]),
    (t) => [lerp1(0.022, 0.01, t), lerp1(0.014, 0.007, t)] as [number, number],
    { bone: jaw, color: billPaint },
  );

  // Legs, wings, feet and the tail fan, mirrored left and right.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.075;

    // Legs: the thigh hides under the body and the bent hock stands out behind.
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [x, 0.8, -0.02],
        [x, 0.62, 0.05],
        [x, 0.32, -0.06],
        [x, 0.03, 0.04],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`], role: "leg" },
    );
    const foot = leg.joints[leg.joints.length - 1];
    b.sweep(leg, (t) => keyed(t, LEG_KEYS)[0], { color: legPaint });
    b.part(new THREE.SphereGeometry(0.068, 12, 8), plumage, {
      bone: hips,
      at: [x * 1.05, 0.73, 0.01],
      scale: [0.8, 1.0, 1.15],
    });

    // Webbed foot: a flat paddle on the floor with three forward toes and a small hind toe.
    const footPart = b.extrude(FOOT_OUTLINE, {
      at: [x, 0.006, 0.0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: footPaint,
      bone: foot,
    });
    for (const [u, v] of [
      [0.09, 0.07],
      [0, 0.15],
      [-0.09, 0.07],
    ]) {
      b.spike(footPart.local([u, v, 0]), [0, -0.3, 1], 0.03, 0.006, { color: BLACK[0] });
    }
    b.rod(footPart.local([0, -0.03, 0]), footPart.local([0, -0.09, 0.01]), 0.007, { color: LEG[1] });

    // Wing: a folded coral wing lying on the flank, its tip overlapping the tail.
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.12, 0.88, 0.1],
        [s * 0.12, 0.84, -0.04],
        [s * 0.12, 0.8, -0.2],
      ]),
      { parent: hips, names: [`wing${side}1`, `wing${side}2`, `wing${side}Tip`], role: "wing" },
    );
    b.extrude(WING_OUTLINE, {
      at: [s * 0.165, 0.84, 0.1],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 2,
      color: wingPaint,
      bone: wing.joints[1],
    });
    // Three black primaries fanning out past the wing tip.
    for (const [y, z] of [
      [0.84, -0.12],
      [0.81, -0.16],
      [0.78, -0.2],
    ]) {
      b.extrude(PRIMARY_OUTLINE, {
        at: [s * 0.185, y, z],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        detail: 0.5,
        smoothing: 1,
        color: BLACK[1],
        bone: wing.joints[2],
      });
    }
  }

  // Tail: a short side-view fan of plumes at the rump.
  b.extrude(TAIL_OUTLINE, {
    at: [0, 0.86, -0.2],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    color: plumage,
    bone: tail.joints[1],
  });

  // Feather tufts: small pixel cards scattered over the body and neck.
  b.cards(
    b.surface(body).scatter(110, { rng: rng(21), minDist: 0.035, filter: (h) => h.n.y > -0.4 }),
    FEATHER,
    { size: [0.034, 0.046], lean: 45, bend: 12, vary: 0.25, rng: rng(22) },
  );
  b.cards(
    b.surface(neckSweep).scatter(50, { rng: rng(31), minDist: 0.03, filter: (h) => h.n.y > -0.5 }),
    FEATHER,
    { size: [0.03, 0.04], lean: 45, bend: 12, vary: 0.2, rng: rng(32) },
  );

  return b.root;
}
