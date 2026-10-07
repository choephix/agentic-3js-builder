```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, mottle, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan",
  description:
    "A keel-billed toucan perched on a mossy branch beside a pink orchid. Rainbow bill, glossy black body, lemon bib, lime eye rings, blue feet.",
};

const LIME = "#9be23a";
const SKY = "#43b8f0";
const ORANGE = "#ff8a1f";
const CHERRY = "#d4102a";
const BLACK = "#111114";
const YELLOW = "#ffe03a";
const RED = "#d7261e";
const BLUE = "#2a7fff";
const LEG = "#2b3a44";
const STEM = "#4f9a3a";
const PINK = "#ff6fb1";
const PINK_DEEP = "#ff4fa0";
const MAGENTA = "#c2187a";
const GOLD = "#ffd23f";
const MOSS_A = "#4f8f2f";
const MOSS_B = "#6fae3a";

const BEAK_BANDS: Array<[number, string]> = [
  [0.42, LIME],
  [0.66, SKY],
  [0.86, ORANGE],
  [1, CHERRY],
];

// Body: black, with a lemon bib on the chest and a scarlet patch under the tail.
const bodyPaint = paint((p, n) => {
  const bib = smoothstep(0.25, 0.4, n.z) * smoothstep(0.27, 0.24, p.y);
  const vent = smoothstep(-0.03, -0.06, p.z) * smoothstep(0.2, 0.17, p.y);
  return mix(mix(BLACK, YELLOW, bib), RED, vent);
});

// Branch: bark brown blending into mossy green.
const barkPaint = mottle("#6e4f2e", "#4d7a2c", { size: 0.07, seed: 4, contrast: 1.2 });

export default function toucan() {
  const b = createBuilder({ name: "keel-billed toucan", detail: 1, paintSize: 1024 });

  // Skeleton (rest pose: perched, beak level, legs under the hips).
  const hips = b.joint("hips", { at: [0, 0.2, 0] });
  b.joint("neck", { parent: "hips", at: [0, 0.27, 0.07], dir: [0, 1, 0.35], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.345, 0.11], dir: [0, 0.35, 1], role: "head" });
  b.joint("beakUpper", { parent: "head", at: [0, 0.36, 0.13], dir: [0, 0.1, 1] });
  b.joint("jaw", { parent: "head", at: [0, 0.342, 0.13], dir: [0, -0.1, 1], role: "jaw" });
  b.joint("tail", { parent: "hips", at: [0, 0.19, -0.09], aim: [0, 0.08, -0.36], role: "tail" });
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.joint(`leg${S}`, {
      parent: "hips",
      at: [0.045 * s, 0.17, 0],
      aim: [0.05 * s, 0.1, 0.02],
      role: "leg",
    });
    b.joint(`ankle${S}`, { parent: `leg${S}`, at: [0.05 * s, 0.1, 0.02], dir: [0, -0.4, 1] });
  }

  // Branch: a short mossy limb lying along x, its underside on y = 0.
  b.rod([-0.42, 0.035, -0.03], [0.42, 0.035, 0.03], 0.035, {
    color: barkPaint,
    bone: "hips",
    sides: 10,
  });
  for (const [x, y, z, sx] of [
    [-0.3, 0.068, -0.01, 0.06],
    [-0.12, 0.07, 0.0, 0.05],
    [0.1, 0.07, 0.01, 0.055],
    [0.32, 0.068, 0.02, 0.05],
  ] as const) {
    b.part(new THREE.SphereGeometry(1, 8, 6), x > 0 ? MOSS_B : MOSS_A, {
      bone: "hips",
      at: [x, y, z],
      scale: [sx, 0.03, sx * 0.8],
    });
  }

  // Body: a loft from the rump to the neck.
  b.loft(
    [
      { at: [0, 0.2, -0.1], w: 0.08, h: 0.08 },
      { at: [0, 0.22, 0.0], w: 0.14, h: 0.15 },
      { at: [0, 0.235, 0.08], w: 0.15, h: 0.16 },
      { at: [0, 0.27, 0.12], w: 0.11, h: 0.12 },
    ],
    { color: bodyPaint, bone: "hips", sides: 12 },
  );

  // Folded wings along the flanks.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), BLACK, {
      bone: "hips",
      at: [0.072 * s, 0.22, -0.05],
      scale: [0.022, 0.07, 0.11],
    });
  }

  // Head: a big black dome, with lime eye rings and dark eyes.
  b.part(new THREE.SphereGeometry(0.052, b.segments(14), b.segments(10)), BLACK, {
    bone: "head",
    at: [0, 0.35, 0.11],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.017, 0.006, 6, 12), LIME, {
      bone: "head",
      at: [s * 0.04, 0.36, 0.14],
      dir: [s * 0.7, 0, 0.7],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), "#050505", {
      bone: "head",
      at: [s * 0.04, 0.36, 0.14],
    });
  }

  // Bill: upper and lower mandibles, rainbow banded from lime at the base to cherry at the tip.
  b.sweep(
    catmull([
      [0, 0.37, 0.13],
      [0, 0.382, 0.22],
      [0, 0.37, 0.31],
      [0, 0.34, 0.38],
    ]),
    (t: number) => [0.055 - 0.04 * t, 0.04 - 0.028 * t] as const,
    { bands: BEAK_BANDS, bone: "beakUpper", sides: 10, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 0.345, 0.13],
      [0, 0.335, 0.22],
      [0, 0.32, 0.3],
      [0, 0.31, 0.35],
    ]),
    (t: number) => [0.05 - 0.035 * t, 0.024 - 0.016 * t] as const,
    { bands: BEAK_BANDS, bone: "jaw", sides: 10, name: "jaw" },
  );

  // Tail: a flat fan trailing down and back.
  b.sweep(
    catmull([
      [0, 0.19, -0.09],
      [0, 0.15, -0.2],
      [0, 0.1, -0.32],
      [0, 0.08, -0.36],
    ]),
    (t: number) => [0.035 - 0.01 * t, 0.012] as const,
    { color: BLACK, bone: "tail", sides: 8, name: "tail" },
  );

  // Legs and zygodactyl blue feet, gripping the branch top (y = 0.07).
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ankle = `ankle${S}`;
    b.rod([0.045 * s, 0.17, 0], [0.05 * s, 0.1, 0.02], 0.014, { color: LEG, bone: `leg${S}`, sides: 8 });
    b.rod([0.05 * s, 0.1, 0.02], [0.07 * s, 0.078, 0.09], 0.009, { color: BLUE, bone: ankle, sides: 6 });
    b.rod([0.05 * s, 0.1, 0.02], [0.03 * s, 0.078, 0.085], 0.009, { color: BLUE, bone: ankle, sides: 6 });
    b.rod([0.05 * s, 0.1, 0.02], [0.05 * s, 0.078, -0.03], 0.009, { color: BLUE, bone: ankle, sides: 6 });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), BLUE, { bone: ankle, at: [0.05 * s, 0.1, 0.02] });
  }

  // One pink orchid on a stem rising from the branch beside the bird.
  b.rod([0.2, 0.06, 0], [0.22, 0.24, 0.065], 0.008, { color: STEM, bone: "hips", sides: 6 });
  const C: [number, number, number] = [0.22, 0.24, 0.065];
  for (let k = 0; k < 5; k++) {
    const a = ((90 + 72 * k) * Math.PI) / 180;
    const d = [Math.cos(a), Math.sin(a), 0];
    b.part(new THREE.SphereGeometry(1, 10, 8), k % 2 ? PINK : PINK_DEEP, {
      bone: "hips",
      at: [C[0] + d[0] * 0.03, C[1] + d[1] * 0.03, C[2]],
      dir: d,
      scale: [0.02, 0.035, 0.007],
    });
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), MAGENTA, {
    bone: "hips",
    at: [C[0], C[1] - 0.012, C[2] + 0.012],
    scale: [0.018, 0.02, 0.01],
  });
  b.part(new THREE.SphereGeometry(1, 6, 5), GOLD, {
    bone: "hips",
    at: [C[0], C[1], C[2] + 0.01],
    scale: [0.008, 0.008, 0.008],
  });

  return b.root;
}
```