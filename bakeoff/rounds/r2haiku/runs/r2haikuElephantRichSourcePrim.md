```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, paint, patches } from "agentic-3js-builder";

type V = [number, number, number];

export const meta = {
  name: "African elephant calf",
  description:
    "A gentle African elephant calf, about a metre at the shoulder: dusty slate-grey wrinkled skin, huge fan ears with pink insides, a curious curling trunk, baby tusks, long lashes and a tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "african-elephant-calf", paintSize: 2048 });

  // Palette and paints. The skin is slate grey with a reddish dust, cut into soft wrinkle plates.
  const SLATE = "#6e6866";
  const DUST = "#8d6a5c";
  const CREASE = "#4a4442";
  const PINK = "#e0a09a";
  const IVORY = "#efe4c8";
  const NAIL = "#ece0cc";
  const dustA = mottle(SLATE, DUST, { size: 0.35, contrast: 0.9 });
  const dustB = mottle("#625c5a", "#7f6259", { size: 0.5, seed: 4 });
  const SKIN = patches(CREASE, [dustA, dustB], { size: 0.22, gap: 0.07, seed: 2 });
  const TRUNK = patches(CREASE, [dustA, dustB], { size: 0.08, gap: 0.12, seed: 6 });

  // The body: one loft from rump to chest, riding the root bone.
  b.joint("body", { at: [0, 0.66, 0] });
  b.loft(
    [
      { at: [0, 0.66, -0.32], w: 0.5, h: 0.56 },
      { at: [0, 0.66, -0.04], w: 0.62, h: 0.68 },
      { at: [0, 0.66, 0.2], w: 0.56, h: 0.64 },
      { at: [0, 0.7, 0.34], w: 0.42, h: 0.5 },
    ],
    { color: SKIN, name: "body" },
  );

  // Neck and head.
  const neck = b.chain("neck", [
    [0, 0.72, 0.26],
    [0, 0.86, 0.4],
  ], { parent: "body", role: "neck", names: ["neck1"] });
  b.sweep(neck, { radius: 0.13, color: SKIN, name: "neck" });
  b.joint("head", { parent: "neck1", at: [0, 0.9, 0.42], dir: [0, 0.2, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.14, b.segments(14), b.segments(10)), SKIN, {
    at: [0, 0.9, 0.42],
    bone: "head",
    scale: [1, 0.95, 1.05],
    name: "head",
  });
  // Calf forehead dome.
  b.part(new THREE.SphereGeometry(0.09, b.segments(10), b.segments(8)), SKIN, {
    at: [0, 0.99, 0.46],
    bone: "head",
    scale: [1, 0.8, 0.9],
    name: "forehead",
  });

  // Curious trunk curling forward, tip lifting up.
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.86, 0.55],
      [0, 0.78, 0.68],
      [0, 0.67, 0.77],
      [0, 0.6, 0.75],
      [0, 0.61, 0.67],
    ]),
    { parent: "head", names: ["trunk1", "trunk2", "trunk3", "trunk4"] },
  );
  b.sweep(trunk, { radius: (t) => 0.1 - 0.065 * t, color: TRUNK, name: "trunk" });

  // Stubby baby tusks, low on either side of the trunk.
  for (const s of [1, -1] as const) {
    b.spike([s * 0.085, 0.74, 0.6], [s * 0.25, -0.3, 1], 0.075, 0.022, {
      color: IVORY,
      bone: "head",
      name: s > 0 ? "tuskL" : "tuskR",
    });
  }

  // Big fan-shaped ears, pink on the side that faces the head.
  const EAR: [number, number][] = [
    [-0.1, 0.13],
    [0.0, 0.2],
    [0.1, 0.19],
    [0.17, 0.09],
    [0.19, -0.03],
    [0.13, -0.15],
    [0.02, -0.2],
    [-0.08, -0.13],
  ];
  for (const s of [1, -1] as const) {
    const earPaint = paint((_p, n) => (n.x * s < -0.5 ? PINK : SKIN));
    b.extrude(EAR, {
      color: earPaint,
      at: [s * 0.15, 0.92, 0.36],
      thickness: 0.022,
      bevel: 0.008,
      smoothing: 1,
      bone: "head",
      name: s > 0 ? "earL" : "earR",
    });
  }

  // Eyes: brown iris, black pupil, a glint, and a fringe of lashes on the upper lid.
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)), "#5a3218", {
      at: [s * 0.095, 0.93, 0.508],
      bone: "head",
      name: `iris${side}`,
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(8), b.segments(6)), "#1a0f0a", {
      at: [s * 0.095, 0.93, 0.532],
      bone: "head",
      name: `pupil${side}`,
    });
    b.part(new THREE.SphereGeometry(0.006, b.segments(6), b.segments(4)), "#ffffff", {
      at: [s * 0.105, 0.94, 0.54],
      bone: "head",
      name: `glint${side}`,
    });
    for (let i = 0; i < 4; i++) {
      const z = 0.5 + 0.012 * i;
      b.rod([s * 0.095, 0.95, z], [s * 0.125, 0.975, z + 0.012], 0.0045, {
        color: "#1d130e",
        bone: "head",
        name: `lash${side}${i + 1}`,
      });
    }
  }

  // Legs: a chain per leg (hip, knee, ankle), a tapered tube, a round padded foot and pale toenails.
  const leg = (s: 1 | -1, tag: "F" | "H", zs: V, toes: number[]) => {
    const side = s > 0 ? "L" : "R";
    const names = [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`];
    const chain = b.chain(
      `leg${tag}${side}`,
      [
        [s * 0.2, 0.6, zs[0]],
        [s * 0.2, 0.36, zs[1]],
        [s * 0.2, 0.1, zs[2]],
      ],
      { parent: "body", role: "leg", names },
    );
    b.sweep(chain, { radius: [0.12, 0.085], color: SKIN, name: `leg${tag}${side}` });
    b.part(new THREE.SphereGeometry(0.1, b.segments(12), b.segments(8)), SKIN, {
      at: [s * 0.2, 0.042, zs[2] + 0.02],
      bone: names[2],
      scale: [1, 0.42, 1.05],
      name: `foot${tag}${side}`,
    });
    for (const x of toes)
      b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.012, b.segments(6)), NAIL, {
        at: [s * 0.2 + x, 0.03, zs[2] + 0.1],
        bone: names[2],
        rotation: [90, 0, 0],
        name: "toenail",
      });
  };
  for (const s of [1, -1] as const) {
    leg(s, "F", [0.22, 0.25, 0.22], [-0.06, -0.02, 0.02, 0.06]);
    leg(s, "H", [-0.2, -0.22, -0.2], [-0.05, 0, 0.05]);
  }

  // Small tufted tail: a tapering tube ending in a little brush of dark hairs.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.7, -0.34],
      [0, 0.6, -0.45],
      [0, 0.48, -0.5],
    ]),
    { parent: "body", role: "tail", names: ["tail1", "tail2"] },
  );
  b.sweep(tail, { radius: [0.024, 0.012], color: SKIN, name: "tail" });
  const TUFT = "#4b3a2b";
  const tips: V[] = [
    [0.01, 0.41, -0.52],
    [-0.01, 0.41, -0.53],
    [0, 0.4, -0.5],
  ];
  tips.forEach((tip, i) =>
    b.rod([0, 0.48, -0.5], tip, 0.006, { color: TUFT, bone: "tail2", name: `tuft${i + 1}` }),
  );

  return b.root;
}
```