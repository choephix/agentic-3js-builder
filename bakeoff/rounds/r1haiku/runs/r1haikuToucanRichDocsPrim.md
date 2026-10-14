```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  limb,
  mottle,
  paint,
  rng,
  type OutlinePoint,
} from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan",
  description:
    "A keel-billed toucan perched on a mossy branch, with a rainbow beak, glossy black body, lemon bib and blue feet, beside a pink orchid.",
};

const BLACK = "#17130f";
const BLACK_SHEEN = "#24202a";
const YELLOW = "#ffd21f";
const LIME = "#9ee03a";
const SKY = "#3fb6ff";
const ORANGE = "#ff8a1f";
const RED = "#e8242b";
const SCARLET = "#ff2d1c";
const EYE_SKIN = "#a6ec2a";
const EYE = "#e9f6ff";
const FEET = "#1f7fff";
const MOSS = "#4f9a2c";
const MOSS_DARK = "#2b6321";
const MOSS_LIGHT = "#7cc044";
const BARK = "#6b4a2e";
const PINK = "#ff62b8";
const DEEP_PINK = "#d4187a";
const STEM = "#3f8a2a";

const MOSS_PAINT = mottle(MOSS_DARK, MOSS, { size: 0.05, seed: 4 });
const BRANCH_PAINT = paint((_p, n) => (n.y > 0.45 ? MOSS_PAINT : BARK));

function petalOutline(scale: number): OutlinePoint[] {
  return [
    [0.0, -0.01 * scale],
    [0.02 * scale, -0.022 * scale],
    [0.046 * scale, -0.018 * scale],
    [0.06 * scale, 0.0, "sharp"],
    [0.046 * scale, 0.018 * scale],
    [0.02 * scale, 0.022 * scale],
    [0.0, 0.01 * scale],
  ];
}

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.27, -0.02] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.3, -0.12],
      [0, 0.33, -0.02],
      [0, 0.37, 0.06],
      [0, 0.4, 0.12],
    ]),
    { parent: hips, names: ["back", "chest", "neck"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.44, 0.15],
    aim: [0, 0.5, 0.3],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.03 }),
    aim: head.local({ forward: 0.2, up: -0.05 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.3, -0.12],
      [0, 0.27, -0.22],
      [0, 0.22, -0.34],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- Body ---------------------------------------------------------------
  b.sweep(spine, (t: number) => 0.045 + 0.03 * Math.sin(Math.PI * t), {
    color: BLACK,
  });

  b.part(new THREE.SphereGeometry(0.07, 12, 9), BLACK, {
    bone: head,
    at: head.at,
  });

  // Lemon-yellow bib on the throat
  b.part(new THREE.SphereGeometry(0.058, 10, 8), YELLOW, {
    bone: spine.joints[2],
    at: [0, 0.355, 0.11],
    scale: [1, 1, 0.55],
  });

  // Tail with a scarlet undertail patch near the base
  b.sweep(tail, (t: number) => [0.036 - 0.012 * t, 0.016], {
    color: BLACK,
    sectors: [[120, 240, SCARLET, 0, 0.7]],
  });

  // Folded wings lying along each flank
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0.05],
        [0.1, 0.06],
        [0.2, 0.015, "sharp"],
        [0.13, -0.02],
        [0.02, -0.03],
      ],
      {
        at: [s * 0.07, 0.35, 0.02],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: BLACK_SHEEN,
      },
    );
  }

  // ---- Beak ---------------------------------------------------------------
  const rainbow: [number, string][] = [
    [0.28, LIME],
    [0.52, SKY],
    [0.74, ORANGE],
    [1, RED],
  ];

  const upperBeak = bezier(
    head.local({ forward: 0.03, up: 0.01 }),
    head.local({ forward: 0.1, up: 0.025 }),
    head.local({ forward: 0.18, up: 0.0 }),
    head.local({ forward: 0.24, up: -0.04 }),
  );
  b.sweep(upperBeak, (t: number) => [0.034 - 0.014 * t, 0.03 - 0.012 * t], {
    bone: head,
    color: LIME,
    bands: rainbow,
    caps: { start: "round", end: "round" },
  });

  const lowerBeak = bezier(
    head.local({ forward: 0.03, up: -0.03 }),
    head.local({ forward: 0.1, up: -0.045 }),
    head.local({ forward: 0.17, up: -0.05 }),
    head.local({ forward: 0.22, up: -0.05 }),
  );
  b.sweep(lowerBeak, (t: number) => [0.024 - 0.01 * t, 0.02 - 0.008 * t], {
    bone: jaw,
    color: LIME,
    bands: rainbow,
  });

  // ---- Eyes: lime-green skin rings with pale irises -----------------------
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.02, 0.008, 6, 12), EYE_SKIN, {
      bone: head,
      at: head.local({ left: s * 0.06, forward: 0.03, up: 0.02 }),
      dir: [s * 0.5, 0.25, 0.8],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.06, forward: 0.04, up: 0.02 }),
    });
  }

  // ---- Legs and feet ------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt = [s * 0.045, 0.27, -0.01];
    const footPt = [s * 0.05, 0.09, 0.02];
    const pts = limb(hipPt, footPt, [0.11, 0.1], [[0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });

    const toeBone = leg.joints[2];
    const toes: [number, number][] = [
      [-0.03, 0.04],
      [0.03, 0.04],
      [-0.025, -0.035],
      [0.025, -0.035],
    ];
    for (const [dx, dz] of toes) {
      b.rod(footPt, [footPt[0] + dx, 0.088, footPt[2] + dz], [0.009, 0.006], {
        color: FEET,
        bone: toeBone,
      });
    }
  }

  // ---- Branch: a short mossy log lying on the floor ------------------------
  const branchPath = catmull([
    [-0.38, 0.042, -0.02],
    [-0.12, 0.042, 0.0],
    [0.14, 0.042, 0.02],
    [0.38, 0.042, 0.0],
  ]);
  const branch = b.sweep(branchPath, 0.042, { color: BRANCH_PAINT });

  // Little moss clumps on the top of the branch
  const branchSurf = b.surface(branch);
  const clumps = branchSurf.scatter(16, {
    rng: rng(5),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.6,
  });
  for (const hit of clumps) {
    b.stick(
      new THREE.SphereGeometry(0.035, 6, 4).scale(1, 0.55, 1),
      MOSS_LIGHT,
      hit,
      { embed: 0.3 },
    );
  }

  // ---- Pink orchid beside the toucan --------------------------------------
  const C: [number, number, number] = [0.27, 0.34, 0.04];

  b.sweep(
    catmull([
      [0.27, 0.07, 0.0],
      [0.27, 0.2, 0.02],
      [0.28, 0.3, 0.03],
      [C[0], C[1], C[2]],
    ]),
    0.006,
    { color: STEM },
  );

  // Five pink petals in the flower's plane (facing +Z)
  for (let i = 0; i < 5; i++) {
    const th = ((i * 72 + 18) * Math.PI) / 180;
    const r: [number, number, number] = [Math.cos(th), Math.sin(th), 0];
    const t: [number, number, number] = [-Math.sin(th), Math.cos(th), 0];
    b.extrude(petalOutline(1), {
      at: C,
      x: r,
      y: t,
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: PINK,
    });
  }

  // Deep pink lip hanging below the column
  const lipTh = (270 * Math.PI) / 180;
  const lipR: [number, number, number] = [Math.cos(lipTh), Math.sin(lipTh), 0];
  const lipT: [number, number, number] = [-Math.sin(lipTh), Math.cos(lipTh), 0];
  b.extrude(petalOutline(1.5), {
    at: C,
    x: lipR,
    y: lipT,
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 1,
    color: DEEP_PINK,
  });

  // Yellow column at the flower's heart
  b.part(new THREE.SphereGeometry(0.014, 6, 5), YELLOW, {
    at: [C[0], C[1], C[2] + 0.008],
  });

  return b.root;
}
```