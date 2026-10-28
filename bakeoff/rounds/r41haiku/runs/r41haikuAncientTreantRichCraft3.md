```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, grain, limb, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "ancient-treant",
  description: "An ancient walking treant guardian: a knotted trunk with a carved face, glowing amber eyes, root legs and a broad leafy crown.",
};

const DEG = Math.PI / 180;

// Palette
const BARK_LIGHT = "#8c6b45";
const BARK_DARK = "#3a2918";
const LEAF_D = "#2d6325";
const LEAF_L = "#86cc4e";
const MOSS = "#5f8f3a";
const AMBER = "#ffb13b";
const MOUTH = "#1c0f07";

// Paints
const bark = countershade(grain(BARK_DARK, BARK_LIGHT, { size: 0.06, axis: "y", seed: 2 }), "#22180e", { level: -0.25 });
const trunkPaint = paint((p, n) => (n.y > 0.5 && noise(p, 0.22, 4) > 0.52 ? MOSS : bark));
const foliage = paint((p, n) => mix(LEAF_D, LEAF_L, smoothstep(-0.3, 0.8, n.y) * 0.75 + 0.25 * noise(p, 0.2, 6)));

// Drawings
const LEAF_A = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 C4 34 2 16 16 2 C30 16 28 34 16 46Z" fill="#6cc03a" stroke="#1d4316" stroke-width="2"/><path d="M16 44 L16 10" stroke="#2c6322" stroke-width="2"/></svg>`,
  { size: 128 },
);
const LEAF_B = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 46 C5 33 3 15 16 3 C29 15 27 33 16 46Z" fill="#9ad65a" stroke="#2c5a1c" stroke-width="2"/><path d="M16 44 L16 12" stroke="#3a7426" stroke-width="2"/></svg>`,
  { size: 128 },
);
const MOUTH_TEX = svg(
  `<svg viewBox="0 0 60 30"><path d="M4 8 Q30 -2 56 8 Q48 26 30 27 Q12 26 4 8Z" fill="${MOUTH}" stroke="#0c0603" stroke-width="2"/><path d="M10 9 L14 16 L18 9 M24 8 L28 15 L32 8 M38 8 L42 15 L46 8" fill="#e6d4a4"/></svg>`,
  { size: 256 },
);

const b = createBuilder({ name: "ancient-treant" });

// ---- Skeleton -----------------------------------------------------------------------------------------------

const hips = b.joint("hips", { at: [0, 1.2, 0], role: "spine" });
const spine = b.chain(
  "spine",
  catmull([
    [0, 1.25, 0],
    [0, 1.9, 0],
    [0, 2.5, 0.04],
    [0, 3.0, 0],
  ]),
  { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
);
const head = b.joint("head", { parent: spine.joints[2], at: [0, 3.0, 0], role: "head" });

// Trunk body: one smooth tube over the spine, extended down to the ground (centre height = radius).
const trunk = b.sweep(spine, (t: number) => 0.32 - 0.12 * t + 0.03 * Math.sin(t * Math.PI), {
  extend: [0.95, 0],
  color: trunkPaint,
});

// Root-toes that grip the ground around the base.
for (const a of [20, 80, 150, 210, 280, 340]) {
  const c = Math.cos(a * DEG);
  const sn = Math.sin(a * DEG);
  b.sweep(
    bezier([c * 0.12, 0.3, sn * 0.12], [c * 0.35, 0.14, sn * 0.35], [c * 0.6, 0.03, sn * 0.6], [c * 0.85, 0.03, sn * 0.85]),
    [0.11, 0.03],
    { color: bark },
  );
}

// Arms: branch limbs with a hand of twig fingers.
for (const s of [1, -1]) {
  const side = s > 0 ? "L" : "R";
  const arm = b.chain(
    `arm${side}`,
    catmull([
      [s * 0.2, 2.35, 0.02],
      [s * 0.5, 2.2, 0.12],
      [s * 0.78, 1.85, 0.26],
      [s * 0.9, 1.55, 0.36],
    ]),
    {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    },
  );
  b.sweep(arm, (t: number) => 0.1 - 0.04 * t, { color: bark });
  const hand = arm.tip!;
  for (const d of [
    [0.5, 0.7, 0.2],
    [0.2, 0.9, 0.1],
    [0.6, 0.5, -0.2],
  ])
    b.spike(hand, [s * d[0], d[1], d[2]], 0.2, 0.035, { color: bark });
}

// Legs: two-bone limbs planted on the ground, with a root foot.
for (const s of [1, -1]) {
  const side = s > 0 ? "L" : "R";
  const pts = limb([s * 0.24, 1.12, 0], [s * 0.3, 0.07, 0.1], [0.66, 0.62], [[0, 0, 1]]);
  const leg = b.chain(`leg${side}`, pts, {
    parent: hips,
    names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    role: "leg",
    contact: [s * 0.3, 0, 0.1],
  });
  b.sweep(leg, (t: number) => 0.13 - 0.03 * t, { color: bark });
  b.part(new THREE.SphereGeometry(0.15, 8, 6), bark, {
    bone: leg.tip!,
    at: [s * 0.3, 0.07, 0.1],
    scale: [1, 0.5, 1.5],
  });
}

// ---- Face ---------------------------------------------------------------------------------------------------

const skin = b.surface(trunk);

// Heavy brows.
for (const s of [1, -1])
  b.sweep(
    catmull([
      [s * 0.03, 2.3, 0.3],
      [s * 0.12, 2.36, 0.27],
    ]),
    0.028,
    { color: BARK_DARK },
  );

// Glowing amber eyes sunk into the bark.
for (const s of [1, -1]) {
  const hit = skin.nearest([s * 0.1, 2.2, 0.3]);
  glow(b.stick(new THREE.SphereGeometry(0.035, 8, 6), AMBER, hit, { embed: 0.35 }));
}

// Carved mouth.
b.decal(trunk, MOUTH_TEX, { at: [0, 1.95, 0.3], dir: [0, 0, 1], size: [0.3, 0.15] });

// Knots and burls along the trunk.
for (const hit of skin.scatter(10, {
  rng: rng(11),
  minDist: 0.3,
  filter: (h) => h.at.y > 0.4 && h.n.z > 0.2 && (h.at.y < 1.6 || h.at.y > 2.75),
})) {
  b.stick(new THREE.SphereGeometry(0.06, 6, 4), BARK_DARK, hit, { embed: 0.4 });
}

// ---- Crown --------------------------------------------------------------------------------------------------

for (const d of [
  [0.25, 3.5, -0.1, 0.6],
  [-0.5, 3.55, 0.05, 0.5],
]) {
  b.sweep(
    catmull([
      [0, 3.0, 0],
      [d[0] * 0.5, d[1] - 0.05, d[2]],
      [d[0], d[1], d[2]],
    ]),
    (t: number) => 0.09 - 0.05 * t,
    { bone: head, color: bark },
  );
}

const crownSpecs: [number, number, number, number][] = [
  [0, 3.55, 0, 0.62],
  [-0.42, 3.32, 0.12, 0.42],
  [0.44, 3.36, -0.04, 0.44],
  [0.02, 3.25, 0.4, 0.36],
  [-0.2, 3.7, -0.2, 0.38],
];
const blobs = crownSpecs.map(([x, y, z, r], i) =>
  b.part(new THREE.DodecahedronGeometry(r, 0), foliage, {
    bone: head,
    at: [x, y, z],
    rotation: [i * 23, i * 41, i * 17],
  }),
);

const canopy = b.surface(blobs);
b.cards(
  canopy.scatter(90, { rng: rng(21), minDist: 0.12, filter: (h) => h.n.y > -0.4 }),
  [LEAF_A, LEAF_B],
  { size: 0.3, lean: 35, bend: 20, vary: 0.3, rng: rng(22) },
);

return_root: {
}

export default function build() {
  return b.root;
}
```