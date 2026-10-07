```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  limb,
  mottle,
  noise,
  offset,
  paint,
  rng,
  spiral,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Newborn unicorn foal",
  description:
    "A wobbly-legged unicorn foal: pearly lilac-shimmer coat, pastel pink, mint and lavender mane and tail, a gold spiral horn, big lashed eyes, silver hooves and a daisy chain.",
};

// ---- palette -------------------------------------------------------------
const PEARL = mottle("#fdfcff", "#e9e0fb", { size: 0.25, contrast: 0.6, seed: 3 });
const COAT = countershade(PEARL, "#d6c7f1", { level: -0.2 });
const MUZZLE = "#ffc3da";
const BLUSH = "#ffa9c9";
const PINK = "#ffb3d6";
const MINT = "#9fe9d2";
const LAVENDER = "#c6b2f7";
const HOOF = "#c3ccd9";
const GOLD = "#f4c24c";
const GOLD_LIGHT = "#fff2b5";
const LEAF = "#8fdcae";
const NOSTRIL = "#5b4a7d";
const EAR_INNER = "#ffb8d4";

// Pastel mane/tail: noise picks one of three colours per card root.
const MANE = paint((p) => {
  const k = noise(p, 0.07, 5);
  return k < 0.34 ? PINK : k < 0.67 ? MINT : LAVENDER;
});

// Head: blush on the cheeks, pink muzzle, pearly coat elsewhere.
const HEAD = paint((p) => {
  const cheek = Math.hypot(Math.abs(p.x) - 0.075, p.y - 0.945, p.z - 0.63);
  if (cheek < 0.042) return BLUSH;
  return p.z > 0.7 ? MUZZLE : COAT;
});

// Horn: gold with light spiral ridges.
const HORN = paint((_p, _n, s) => ((((s[1] - 900 * s[0]) % 90) + 90) % 90 < 24 ? GOLD_LIGHT : GOLD));

// Ears: pink inner strip down the middle of each face.
const EAR = paint((_p, n, s) =>
  s[1] > 0.01 && Math.abs(n.x) > 0.5 && Math.abs(s[0]) < 0.016 - 0.12 * s[1] ? EAR_INNER : COAT,
);

// ---- textures ------------------------------------------------------------
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="50" cy="56" rx="33" ry="34" fill="#2e2256"/>
<ellipse cx="50" cy="69" rx="22" ry="17" fill="#6c52b8"/>
<ellipse cx="50" cy="59" rx="19" ry="22" fill="#0d0816"/>
<ellipse cx="38" cy="46" rx="9" ry="11" fill="#ffffff"/>
<circle cx="63" cy="72" r="4.5" fill="#ffffff"/>
<path d="M11 54 Q50 -4 89 54" fill="none" stroke="#0d0816" stroke-width="7" stroke-linecap="round"/>
<path d="M11 54 L3 42 M21 38 L12 25 M35 29 L29 13 M50 26 L50 8 M65 29 L71 13 M79 38 L88 25 M89 54 L97 43" fill="none" stroke="#0d0816" stroke-width="5" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const petals = [0, 45, 90, 135, 180, 225, 270, 315]
  .map(
    (a) =>
      `<ellipse cx="32" cy="16" rx="7" ry="13" fill="#ffffff" stroke="#d7c3f7" stroke-width="1.2" transform="rotate(${a} 32 32)"/>`,
  )
  .join("");
const DAISY = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${petals}<circle cx="32" cy="32" r="8" fill="#ffd66b" stroke="#f2b84f" stroke-width="1.2"/></svg>`,
  { size: 192 },
);

// Greyscale wisp: the part colour tints it, so each card takes its paint.
const WISP = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
<path d="M20 63 C5 50 3 30 11 16 C14 10 17 5 20 1 C23 6 27 12 29 18 C37 32 35 50 20 63 Z" fill="#ffffff"/>
<path d="M20 58 C13 46 13 30 18 12" fill="none" stroke="#b9b9b9" stroke-width="2.5" stroke-linecap="round"/>
<path d="M23 57 C28 45 28 31 23 17" fill="none" stroke="#d6d6d6" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

// ---- outlines --------------------------------------------------------------
const EAR_OUTLINE: OutlinePoint[] = [
  [-0.02, 0],
  [0.02, 0],
  [0.016, 0.045],
  [0, 0.085, "sharp"],
  [-0.016, 0.045],
];

const HOOF_OUTLINE: OutlinePoint[] = [
  [0, 0],
  [0.036, 0],
  [0.04, 0.022],
  [0.034, 0.056],
  [0.028, 0.064],
  [0, 0.064],
];

// Piecewise-linear profile over evenly spaced keys along a path.
function keyed(vals: number[]) {
  return (t: number): number => {
    const f = Math.min(Math.max(t, 0), 1) * (vals.length - 1);
    const i = Math.min(Math.floor(f), vals.length - 2);
    return vals[i] + (vals[i + 1] - vals[i]) * (f - i);
  };
}

export default function build() {
  const b = createBuilder({ name: "unicorn-foal" });

  // ---- skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.66, -0.05], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.65, -0.26],
      [0, 0.66, -0.06],
      [0, 0.66, 0.1],
      [0, 0.66, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.2],
      [0, 0.76, 0.28],
      [0, 0.86, 0.38],
      [0, 0.96, 0.47],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.68, -0.36],
      [0, 0.66, -0.44],
      [0, 0.6, -0.49],
      [0, 0.54, -0.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0.52], dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.9, 0.6], aim: [0, 0.88, 0.8], role: "jaw" });
  const earL = b.joint("earL", { parent: head, at: [0.05, 1.06, 0.46], dir: [0.25, 1, -0.2], role: "hinge" });
  const earR = b.joint("earR", { parent: head, at: [-0.05, 1.06, 0.46], dir: [-0.25, 1, -0.2], role: "hinge" });

  // ---- legs: long, wobbly, slightly bent at the joints ---------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const fore = b.chain(
      `fore${side}`,
      limb(
        [s * 0.1, 0.6, 0.16],
        [s * 0.12, 0.04, 0.2],
        [0.25, 0.23, 0.17],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      {
        parent: spine,
        names: [`shoulder${side}`, `knee${side}`, `fetlock${side}`, `hoof${side}`],
        role: "leg",
      },
    );
    b.sweep(fore, [0.062, 0.042, 0.03, 0.028], { color: COAT });
    b.lathe(HOOF_OUTLINE, { at: [s * 0.12, 0, 0.2], bone: fore, segments: 8, color: HOOF });

    const hind = b.chain(
      `hind${side}`,
      limb(
        [s * 0.11, 0.6, -0.26],
        [s * 0.13, 0.04, -0.12],
        [0.27, 0.25, 0.17],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      {
        parent: hips,
        names: [`hip${side}`, `stifle${side}`, `hock${side}`, `hindHoof${side}`],
        role: "leg",
      },
    );
    b.sweep(hind, [0.07, 0.044, 0.03, 0.028], { color: COAT });
    b.lathe(HOOF_OUTLINE, { at: [s * 0.13, 0, -0.12], bone: hind, segments: 8, color: HOOF });
  }

  // ---- body, neck, tail ----------------------------------------------------
  const bodyW = keyed([0.13, 0.155, 0.158, 0.14]);
  const bodyH = keyed([0.15, 0.175, 0.17, 0.16]);
  b.sweep(spine, (t): [number, number] => [bodyW(t), bodyH(t)], { color: COAT });

  const neckTube = b.sweep(neck, [0.085, 0.058], { color: COAT });
  const tailTube = b.sweep(tail, [0.032, 0.016], { color: COAT });

  // ---- head: skull and muzzle as one loft, lower jaw on its own joint -----
  const headLoft = b.loft(
    [
      { at: [0, 1.0, 0.45], w: 0.15, h: 0.16 },
      { at: [0, 1.005, 0.52], w: 0.17, h: 0.17 },
      { at: [0, 0.995, 0.6], w: 0.155, h: 0.15 },
      { at: [0, 0.97, 0.68], w: 0.12, h: 0.12 },
      { at: [0, 0.95, 0.75], w: 0.1, h: 0.1 },
      { at: [0, 0.94, 0.77], w: 0.07, h: 0.07 },
    ],
    { bone: head, color: HEAD },
  );

  b.loft(
    [
      { at: [0, 0.9, 0.6], w: 0.08, h: 0.05 },
      { at: [0, 0.9, 0.7], w: 0.065, h: 0.045 },
      { at: [0, 0.905, 0.77], w: 0.045, h: 0.035 },
    ],
    { bone: jaw, color: MUZZLE },
  );

  // Big lashed eyes, drawn on the skull so they wrap the curve.
  for (const s of [1, -1]) {
    b.decal(headLoft, EYE, {
      at: head.local({ left: s * 0.08, up: 0.01, forward: 0.03 }),
      dir: [s, 0, 0.35],
      up: [0, 1, 0],
      size: [0.1, 0.1],
      segments: 8,
      mirror: s < 0,
    });
  }

  // Nostrils seated on the muzzle front.
  const headSurf = b.surface(headLoft);
  for (const s of [1, -1]) {
    const hit = headSurf.nearest([s * 0.022, 0.945, 0.8]);
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), NOSTRIL, hit, { embed: 0.4 });
  }

  // Ears: thin pastel plates standing up and splayed out from the skull.
  for (const s of [1, -1]) {
    b.extrude(EAR_OUTLINE, {
      at: [s * 0.05, 1.06, 0.46],
      x: [0, 0, 1],
      y: [s * 0.25, 1, -0.2],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: EAR,
      bone: s > 0 ? earL : earR,
    });
  }

  // Spiral gold horn: a helix that narrows to a point, sprouted from the forehead.
  const hornHit = headSurf.nearest([0, 1.07, 0.6]);
  const hornCenter = offset(hornHit, [1, 0, 0], -0.012);
  const coil = spiral(hornCenter, hornHit, [0, 0.95, 0.31], { turns: 2.2, r1: 0.002, pitch: 0.04 });
  b.sprout("horn", hornHit, coil, [0.02, 0.003], {
    count: 0,
    color: HORN,
    caps: { start: "flat", end: "point" },
  });

  // ---- fluffy hair ---------------------------------------------------------
  // Forelock falling forward between the ears.
  const forelock = [
    [-0.07, 0.03],
    [0.07, 0.03],
    [-0.06, 0.09],
    [0.06, 0.09],
  ].map(([dx, dz]) => headSurf.nearest(head.local({ left: dx, forward: dz, up: 0.12 })));
  b.cards(forelock, WISP, {
    size: [0.045, 0.08],
    lean: 60,
    flow: [0, -0.3, 1],
    bend: 25,
    vary: 0.2,
    color: MANE,
    rng: rng(21),
  });

  // Mane along the top of the neck, flowing back toward the withers.
  const mane = [0.1, 0.25, 0.4, 0.7, 0.85].flatMap((t) =>
    [-50, -25, 0, 25, 50].map((deg) => neckTube.at(t, deg)),
  );
  b.cards(mane, WISP, {
    size: [0.05, 0.1],
    lean: 50,
    flow: [0, -0.35, -1],
    bend: 25,
    vary: 0.25,
    color: MANE,
    rng: rng(11),
  });

  // Tail tuft round the tail's end.
  const tuft = [0.4, 0.62, 0.84, 1].flatMap((t) =>
    [0, 60, 120, 180, 240, 300].map((deg) => tailTube.at(t, deg)),
  );
  b.cards(tuft, WISP, {
    size: [0.055, 0.1],
    lean: 60,
    flow: [0, -0.2, -1],
    bend: 30,
    vary: 0.25,
    color: MANE,
    rng: rng(12),
  });

  // ---- daisy chain around the neck ----------------------------------------
  const neckSurf = b.surface(neckTube);
  const garland = neckSurf.loop(neck.at(0.5), { lift: 0.004 });
  b.sweep(garland, 0.006, { color: LEAF });

  const DAISIES = 9;
  for (let i = 0; i < DAISIES; i++) {
    const t = (i + 0.5) / DAISIES;
    const hit = neckSurf.nearest(garland.at(t));
    b.decal(neckTube, DAISY, {
      at: hit,
      dir: hit.n,
      up: garland.tangentAt(t),
      size: [0.05, 0.05],
      segments: 5,
      lift: 0.002,
    });
  }

  return b.root;
}
```