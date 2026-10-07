```ts
import * as THREE from "three";
import { createBuilder, frame, limb, mottle, paint, rng, bezier, catmull } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

type V = [number, number, number];

const BLACK = "#15151b";
const YELLOW = "#ffd42a";
const LIME = "#8ee03b";
const SKY = "#4fc3ff";
const ORANGE = "#ff8a1e";
const RED = "#d8192b";
const FOOT = "#1f6fe8";
const LEG = "#3b3f48";
const EYE = "#2a1a10";
const BARK = "#6e4c2f";
const MOSS = "#5aa33a";
const MOSS_D = "#2d6320";
const PINK = "#ff6fb4";
const PINK_D = "#d2237f";
const STEM = "#58913a";

// Piecewise-linear radius keys: [t, rx, ry]
const keyed = (t: number, keys: [number, number, number][]): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    const [t1, a1, c1] = keys[i];
    const [t0, a0, c0] = keys[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return [a0 + (a1 - a0) * k, c0 + (c1 - c0) * k];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
};

// Plumage: glossy black body, lemon bib on the throat, scarlet patch under the tail
const plumage = paint((p, n) => {
  if (p.z > 0.12 && n.z > 0.25 && n.y < 0.55 && p.y < 0.7) return YELLOW;
  if (n.y < -0.4 && p.z < 0.0 && p.z > -0.2 && p.y < 0.45) return RED;
  return BLACK;
});

// Branch: bark with mossy top
const bark = paint((_p, n) => (n.y > 0.4 ? mottle(MOSS_D, MOSS, { size: 0.05, seed: 4 }) : BARK));

const beakBands: [number, string][] = [
  [0.3, LIME],
  [0.55, SKY],
  [0.8, ORANGE],
  [1, RED],
];

export const meta = {
  name: "Keel-billed toucan",
  description: "A keel-billed toucan with a rainbow beak on a mossy branch beside a pink orchid.",
};

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });

  // Branch lying on the floor (centre height equals its radius)
  const branch = b.sweep(
    catmull([
      [0.02, 0.05, -0.5],
      [0.0, 0.05, -0.15],
      [0.0, 0.05, 0.15],
      [-0.07, 0.05, 0.4],
      [-0.12, 0.05, 0.56],
    ]),
    0.05,
    { color: bark },
  );

  // Moss clumps on the branch
  for (const h of b.surface(branch).scatter(34, { rng: rng(7), minDist: 0.06, filter: (h) => h.n.y > 0.2 })) {
    b.stick(new THREE.SphereGeometry(0.035, 6, 4), MOSS, h, { embed: 0.45 });
  }

  // Spine: hips are the root, neck ends at the last span
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.12],
      [0, 0.44, 0.0],
      [0, 0.5, 0.14],
      [0, 0.6, 0.24],
      [0, 0.7, 0.3],
    ]),
    { names: ["hips", "back", "chest", "neck"], role: "spine" },
  );
  const hips = spine.joints[0];
  const neck = spine.joints[3];

  // Body: tapered bulk over the spine
  b.sweep(spine, (t) => keyed(t, [[0, 0.06, 0.07], [0.3, 0.1, 0.1], [0.6, 0.09, 0.09], [0.85, 0.06, 0.06], [1, 0.045, 0.05]]), {
    color: plumage,
  });

  // Head
  const head = b.joint("head", { parent: neck, at: [0, 0.7, 0.3], aim: [0, 0.74, 0.36], role: "head" });
  const skull = b.sweep(bezier([0, 0.69, 0.22], [0, 0.71, 0.3], [0, 0.73, 0.34]), [0.08, 0.075], {
    bone: head,
    color: plumage,
  });

  // Jaw and the two-part rainbow beak
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.69, 0.34], aim: [0, 0.66, 0.6], role: "jaw" });
  const beakRadius = (t: number) =>
    keyed(t, [
      [0, 0.05, 0.065],
      [0.5, 0.06, 0.07],
      [0.85, 0.035, 0.04],
      [1, 0.012, 0.015],
    ]);
  b.sweep(bezier([0, 0.74, 0.34], [0, 0.79, 0.46], [0, 0.77, 0.57], [0, 0.7, 0.63]), beakRadius, {
    bone: head,
    color: LIME,
    bands: beakBands,
  });
  b.sweep(bezier([0, 0.7, 0.34], [0, 0.7, 0.44], [0, 0.68, 0.54], [0, 0.66, 0.58]), (t) =>
    keyed(t, [
      [0, 0.04, 0.035],
      [0.7, 0.02, 0.02],
      [1, 0.01, 0.01],
    ]),
    { bone: jaw, color: LIME, bands: beakBands },
  );

  // Eyes: lime skin ring draped onto the head, dark eye seated on it
  const headSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = headSurf.nearest([s * 0.07, 0.74, 0.31]);
    const ringPts = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return eyeHit.local([0.036 * Math.cos(a), 0, 0.036 * Math.sin(a)]);
    });
    const ringPath = headSurf.drape(catmull(ringPts, { closed: true }), { lift: 0.006 });
    b.sweep(ringPath, 0.007, { color: LIME });
    b.stick(new THREE.SphereGeometry(0.02, 8, 6), EYE, eyeHit, { embed: 0.3 });
  }

  // Tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.42, -0.1],
      [0, 0.34, -0.28],
      [0, 0.28, -0.44],
      [0, 0.25, -0.56],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, (t) => keyed(t, [[0, 0.05, 0.03], [1, 0.04, 0.02]]), { color: plumage });

  // Folded wings, one per side
  const wingOutline: OutlinePoint[] = [
    [0.1, 0.05],
    [-0.02, 0.09],
    [-0.2, 0.05],
    [-0.32, -0.07, "sharp"],
    [-0.22, -0.02],
    [-0.1, -0.04],
    [0, -0.06],
    [0.08, -0.02],
  ];
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.1, 0.45, 0],
      thickness: [0.012, 0.004],
      bevel: 0.003,
      smoothing: 2,
      color: BLACK,
      bone: spine.joints[1],
    });
  }

  // Legs and blue zygodactyl feet on the branch
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const T: V = [s * 0.05, 0.107, 0.03];
    const pts = limb([s * 0.05, 0.36, -0.02], T, [0.15, 0.13], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.02, 0.013], { color: LEG });
    const foot = leg.tip!;
    for (const [dx, dz] of [
      [0.025, 0.06],
      [-0.02, 0.06],
      [0.025, -0.05],
      [-0.02, -0.05],
    ]) {
      b.capsule(T, [T[0] + dx, 0.107, T[2] + dz], 0.008, { bone: foot, color: FOOT });
    }
  }

  // Pink orchid on the branch in front of the bird
  const orchidHit = b.surface(branch).nearest([-0.07, 0.12, 0.4]);
  const F: V = [-0.09, 0.36, 0.42];
  b.sprout("orchidStem", orchidHit, F, 0.006, { count: 0, color: STEM });

  const petal: OutlinePoint[] = [
    [0, 0],
    [0.02, 0.012],
    [0.03, 0.036],
    [0.016, 0.064],
    [0, 0.072],
    [-0.016, 0.064],
    [-0.03, 0.036],
    [-0.02, 0.012],
  ];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    b.extrude(petal, {
      at: F,
      x: [-sn, 0, c],
      y: [c * 0.8, 0.6, sn * 0.8],
      thickness: [0.012, 0.004],
      bevel: 0.002,
      smoothing: 2,
      color: PINK,
    });
  }
  b.stick(new THREE.SphereGeometry(0.018, 8, 6), PINK_D, frame(F, [0, 1, 0]), { embed: 0.2 });

  return b.root;
}
```