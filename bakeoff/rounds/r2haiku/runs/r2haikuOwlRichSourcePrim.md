```ts
import * as THREE from "three";
import { createBuilder, grain, mix, mottle, paint, smoothstep, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Great horned owl",
  description: "A great horned owl perched on a gnarled branch: barred bark-brown plumage, ear tufts, a tawny facial disc and orange eyes.",
};

export default function owl() {
  const b = createBuilder({ name: "great-horned-owl", detail: 1, paintSize: 1024 });

  // Palette
  const bark = "#6e5235";
  const buff = "#c7a46e";
  const dark = "#2c1f14";
  const bib = "#eee3c8";
  const tawny = "#c98a3a";
  const rimCol = "#1a120c";
  const talon = "#1d1a17";
  const beakCol = "#6e6a64";
  const eyeCol = "#f0a020";
  const tuftCol = "#3b2a1c";

  // Paints
  const mottled = mottle(bark, buff, { size: 0.07, contrast: 1.2 });
  const barred = stripes(mottled, dark, { size: 0.03, axis: "y", width: 0.22, wobble: 0.4, seed: 3 });
  const plumage = paint((p, n) => {
    const bibness =
      smoothstep(0.1, 0.06, Math.hypot(p.x, (p.y - 0.33) * 1.3)) * smoothstep(0.03, 0.08, p.z);
    return mix(barred.at(p, n), bib, bibness);
  });
  const disc = paint((p) => {
    const d = Math.hypot(p.x, p.y - 0.405) / 0.1;
    const face = mix(tawny, "#e4bd82", 0.5 + 0.5 * Math.sin(d * 60));
    return mix(face, rimCol, smoothstep(0.8, 0.95, d));
  });
  const legPaint = stripes(buff, dark, { size: 0.02, axis: "y", width: 0.3, seed: 5 });
  const barkPaint = grain("#4a3826", "#8c7150", { size: 0.03, axis: "x", seed: 7 });

  // Skeleton: perch (root) > body > head, legs as chains from the body.
  b.joint("perch", { at: [0, 0, 0] });
  b.joint("body", { parent: "perch", at: [0, 0.27, 0], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.4, 0], role: "head" });

  const legL = b.chain(
    "legL",
    [
      [0.07, 0.2, -0.01],
      [0.075, 0.1, 0.02],
    ],
    { parent: "body", role: "leg", names: ["hipL", "ankleL"] },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.07, 0.2, -0.01],
      [-0.075, 0.1, 0.02],
    ],
    { parent: "body", role: "leg", names: ["hipR", "ankleR"] },
  );

  // Branch: a gnarled, slightly bent perch with a knot and a twig.
  const branchPts: [number, number, number][] = [
    [-0.4, 0.045, -0.04],
    [-0.2, 0.05, 0.0],
    [0.0, 0.042, 0.0],
    [0.2, 0.05, 0.03],
    [0.4, 0.075, 0.06],
  ];
  b.sweep(branchPts, {
    radius: (t: number) => 0.04 - 0.012 * t,
    color: barkPaint,
    bone: "perch",
    name: "branch",
    sides: 8,
    caps: "round",
  });
  b.part(new THREE.SphereGeometry(0.035, b.segments(10), b.segments(8)), barkPaint, {
    at: [-0.22, 0.075, 0.02],
    scale: [1.2, 0.9, 1],
    bone: "perch",
    name: "knot",
  });
  b.capsule([0.2, 0.09, -0.03], [0.27, 0.16, -0.06], 0.009, { color: barkPaint, bone: "perch", name: "twig" });

  // Body and head.
  b.part(new THREE.SphereGeometry(0.15, b.segments(16), b.segments(12)), plumage, {
    at: [0, 0.27, 0],
    scale: [0.95, 1.2, 0.9],
    bone: "body",
    name: "body",
  });
  b.part(new THREE.SphereGeometry(0.12, b.segments(14), b.segments(10)), plumage, {
    at: [0, 0.4, 0],
    bone: "head",
    name: "head",
  });

  // Facial disc: a flattened sphere with a tawny face and a black rim.
  b.part(new THREE.SphereGeometry(0.1, b.segments(14), b.segments(10)), disc, {
    at: [0, 0.405, 0.1],
    scale: [1, 1, 0.3],
    bone: "head",
    name: "facialDisc",
  });

  // Eyes and pupils.
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.042, b.segments(10), b.segments(8)), eyeCol, {
      at: [sx * 0.045, 0.415, 0.12],
      bone: "head",
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.02, b.segments(8), b.segments(6)), "#0b0805", {
      at: [sx * 0.045, 0.415, 0.158],
      bone: "head",
      name: `pupil${side}`,
    });
  }

  // Hooked beak: a cone pointing forward and down, with a hook at the tip.
  b.part(new THREE.ConeGeometry(0.03, 0.07, b.segments(8)), beakCol, {
    at: [0, 0.37, 0.14],
    dir: [0, -0.45, 1],
    bone: "head",
    name: "beak",
  });
  b.part(new THREE.SphereGeometry(0.02, b.segments(8), b.segments(6)), beakCol, {
    at: [0, 0.345, 0.165],
    bone: "head",
    name: "beakHook",
  });

  // Ear tufts: tapered feather cones standing up from the crown.
  b.spike([0.07, 0.5, -0.01], [0.1, 0.62, -0.04], null, 0.03, { color: tuftCol, bone: "head", name: "tuftL" });
  b.spike([-0.07, 0.5, -0.01], [-0.1, 0.62, -0.04], null, 0.03, { color: tuftCol, bone: "head", name: "tuftR" });

  // Wings: feathered slabs folded along the flanks.
  const wingPts = (s: number) =>
    [
      [0.13, 0.44, 0.06],
      [0.15, 0.36, 0.12],
      [0.15, 0.22, 0.12],
      [0.14, 0.12, 0.08],
      [0.13, 0.09, 0.0],
      [0.14, 0.12, -0.1],
      [0.15, 0.25, -0.12],
      [0.15, 0.38, -0.08],
      [0.13, 0.44, -0.02],
    ].map(([x, y, z]) => [x * s, y, z]);
  b.slab(wingPts(1), { color: plumage, thickness: 0.03, bone: "body", name: "wingL" });
  b.slab(wingPts(-1), { color: plumage, thickness: 0.03, bone: "body", name: "wingR" });

  // Tail, hanging behind and below the perch.
  b.slab(
    [
      [-0.05, 0.2, -0.1],
      [0.05, 0.2, -0.1],
      [0.065, 0.095, -0.22],
      [-0.065, 0.095, -0.22],
    ],
    { color: barred, thickness: 0.015, bone: "body", name: "tail" },
  );

  // Feathered legs, yellow toe bases and black talons gripping the branch.
  for (const [leg, sx, ankle] of [
    [legL, 1, "ankleL"],
    [legR, -1, "ankleR"],
  ] as const) {
    const [hip, foot] = leg.joints;
    b.capsule(hip, foot, 0.04, { color: legPaint, name: `leg${sx > 0 ? "L" : "R"}` });
    const x = 0.075 * sx;
    b.capsule([x, 0.1, 0.02], [x, 0.09, 0.035], 0.014, { color: "#cdb24e", bone: ankle, name: "toeBase" });
    const tips = [
      [x - 0.02 * sx, 0.07, 0.075],
      [x, 0.065, 0.08],
      [x + 0.02 * sx, 0.07, 0.075],
    ];
    tips.forEach((tip, i) =>
      b.spike([x, 0.095, 0.03], tip, null, 0.007, { color: talon, bone: ankle, name: `talon${i + 1}` }),
    );
  }

  return b.root;
}
```