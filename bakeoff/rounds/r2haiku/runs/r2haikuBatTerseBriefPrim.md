```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "bat",
  description:
    "A stylised bat in a rest pose: spread wings with scalloped membranes, huge pink ears, a fanged grin and a web tail. Stands on y = 0.",
};

type P = [number, number, number];

const FUR = "#4a3457";
const BELLY = "#9b7bb0";
const WING = "#7d3f8e";
const WING_DARK = "#4f2a63";
const INK = "#241a2e";
const EAR = "#ee8aa6";
const EYE = "#ffc83d";
const PUPIL = "#120c18";
const FANG = "#f6f0e2";
const NOSE = "#c9587f";

export default function build() {
  const b = createBuilder({ name: "bat" });

  const midOf = (a: P, c: P): P => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  const dist = (a: P, c: P) =>
    Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);

  // A straight tube between two points, aimed along its length.
  const bar = (a: P, c: P, r: number, color: string) => {
    b.part(new THREE.CylinderGeometry(r, r, dist(a, c), 8), color, {
      at: midOf(a, c),
      aim: c,
    });
  };

  // A squashed or stretched sphere.
  const ball = (p: P, r: number, color: string, sy = 1, sz = 1) => {
    const g = new THREE.SphereGeometry(r, 10, 8);
    g.scale(1, sy, sz);
    b.part(g, color, { at: p });
  };

  // A pointed cone from base to tip.
  const cone = (base: P, tip: P, r: number, color: string) => {
    b.part(new THREE.ConeGeometry(r, dist(base, tip), 6), color, {
      at: midOf(base, tip),
      aim: tip,
    });
  };

  // ---- Spine, head and tail skeleton ----
  const hips = b.joint("hips", { at: [0, 0.1, 0] });
  const chest = b.joint("chest", { at: [0, 0.16, 0.005], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.21, 0.015], parent: chest });
  const head = b.joint("head", { at: [0, 0.255, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.228, 0.05], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.09, -0.07], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.085, -0.14], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.08, -0.2], parent: tail2 });

  // ---- Torso, neck and head ----
  ball([0, 0.13, 0], 0.06, FUR, 1.15, 1.35);
  ball([0, 0.12, 0.03], 0.04, BELLY, 0.95, 1.1);
  bar([0, 0.16, 0.005], [0, 0.21, 0.015], 0.03, FUR);
  ball([0, 0.255, 0.03], 0.045, FUR, 0.95, 1.05);
  ball([0, 0.242, 0.07], 0.024, BELLY, 0.8, 0.7);

  // Nose leaf
  b.part(new THREE.BoxGeometry(0.02, 0.03, 0.012), NOSE, { at: [0, 0.256, 0.086] });

  // Lower jaw, rigid on its own joint so it can open
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.04), FUR, {
    at: [0, 0.222, 0.055],
    bone: jaw,
  });

  // Eyes, pupils and fangs
  for (const sx of [1, -1]) {
    ball([sx * 0.022, 0.268, 0.066], 0.013, EYE);
    ball([sx * 0.024, 0.268, 0.078], 0.006, PUPIL);
    cone([sx * 0.012, 0.236, 0.07], [sx * 0.012, 0.214, 0.074], 0.005, FANG);
  }

  // Huge ears: dark outer shell with a pink inner cone
  for (const sx of [1, -1]) {
    cone([sx * 0.026, 0.28, 0.0], [sx * 0.05, 0.38, -0.02], 0.026, FUR);
    cone([sx * 0.026, 0.29, 0.03], [sx * 0.042, 0.355, 0.005], 0.014, EAR);
  }

  // ---- Tail ----
  bar([0, 0.1, -0.02], [0, 0.09, -0.07], 0.022, FUR);
  bar([0, 0.09, -0.07], [0, 0.085, -0.14], 0.014, FUR);
  bar([0, 0.085, -0.14], [0, 0.08, -0.2], 0.009, FUR);
  cone([0, 0.08, -0.2], [0, 0.078, -0.25], 0.014, INK);

  // ---- Wings and legs, built for each side (left = +X) ----
  const tipsRaw: P[] = [
    [0.66, 0.36, 0.02],
    [0.62, 0.22, -0.02],
    [0.52, 0.12, -0.03],
    [0.42, 0.06, -0.03],
  ];
  const sc43: P = [0.47, 0.12, -0.02];
  const sc32: P = [0.57, 0.2, -0.01];
  const sc21: P = [0.64, 0.29, 0.0];
  const flankRaw: P = [0.04, 0.1, -0.01];
  const kneeRaw: P = [0.07, 0.05, 0.03];

  for (const [s, S] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const X = (p: P): P => [p[0] * s, p[1], p[2]];

    // Wing arm
    const sh = X([0.03, 0.19, 0]);
    const el = X([0.17, 0.27, -0.03]);
    const wr = X([0.4, 0.31, 0]);
    const shoulder = b.joint("shoulder" + S, { at: sh, parent: chest });
    const elbow = b.joint("elbow" + S, { at: el, parent: shoulder });
    const wrist = b.joint("wrist" + S, { at: wr, parent: elbow });
    const tips = tipsRaw.map(X);
    tips.forEach((t, i) => b.joint(`finger${S}${i + 1}`, { at: t, parent: wrist }));

    bar(sh, el, 0.016, FUR);
    bar(el, wr, 0.013, FUR);
    ball(sh, 0.02, FUR);
    ball(el, 0.017, FUR);
    ball(wr, 0.016, FUR);
    tips.forEach((t) => bar(wr, t, 0.007, INK));
    cone(X([0.4, 0.33, 0.02]), X([0.43, 0.37, 0.04]), 0.007, FANG);

    // Wing membrane: leading edge along the arm and outer finger,
    // trailing edge from the flank and leg across scalloped finger tips.
    const lead: P[] = [sh, el, wr, tips[0]];
    const trail: P[] = [
      X(flankRaw),
      X(kneeRaw),
      tips[3],
      X(sc43),
      tips[2],
      X(sc32),
      tips[1],
      X(sc21),
      tips[0],
    ];
    b.membrane(lead, trail, { color: WING });

    // Legs
    const hip = b.joint("hip" + S, { at: X([0.04, 0.09, 0]), parent: hips });
    const knee = b.joint("knee" + S, { at: X(kneeRaw), parent: hip });
    const ankle = b.joint("ankle" + S, { at: X([0.05, 0.012, 0]), parent: knee });
    bar(X([0.04, 0.09, 0]), X(kneeRaw), 0.012, FUR);
    bar(X(kneeRaw), X([0.05, 0.012, 0]), 0.008, FUR);
    ball(X([0.05, 0.009, 0.022]), 0.013, INK, 0.7, 1.6);
    void ankle;
  }

  // Tail web stretched between the two ankles and the tail tip
  const webL: P[] = [[0.05, 0.012, 0], [0.03, 0.05, -0.1], [0, 0.08, -0.2]];
  const webR: P[] = [[-0.05, 0.012, 0], [-0.03, 0.05, -0.1], [0, 0.08, -0.2]];
  b.membrane(webL, webR, { color: WING_DARK });

  return b.root;
}
```