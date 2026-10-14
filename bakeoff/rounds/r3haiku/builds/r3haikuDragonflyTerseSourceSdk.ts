import * as THREE from "three";
import { catmull, cells, createBuilder, gradient, paint, stripes } from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description: "A stylised dragonfly at rest: big faceted eyes, a green thorax, a segmented blue abdomen, six spined legs and four veined, amber-tinted wings held out flat.",
};

type V3 = [number, number, number];

export default function dragonfly() {
  const b = createBuilder({ name: "dragonfly", detail: 1, paintSize: 1024 });

  // ---- Paints -------------------------------------------------------------------------------------------------
  const thoraxPaint = stripes("#3a9b5c", "#0e2c1e", { size: 0.018, axis: [1, 0, 0.6], width: 0.3 });
  const abdomenPaint = stripes("#1f9fb3", "#0a2330", { size: 0.012, axis: "z", width: 0.45 });
  const eyePaint = paint((p) => {
    const c = cells(p, 0.0034, 5);
    if (c.d2 - c.d1 < 0.18) return "#0b2236";
    return c.id < 0.5 ? "#2f7fd8" : "#5fc0ec";
  });

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  b.joint("thorax", { at: [0, 0.036, -0.012], dir: [0, 0.15, 1], role: "spine" });
  b.joint("head", { parent: "thorax", at: [0, 0.042, 0.03], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.036, 0.034], dir: [0, -0.5, 1], role: "jaw" });

  // Legs: hip on the thorax, knee, then a spiny foot tip. Left side is +X.
  const legs: Array<{ p: string; pts: V3[] }> = [
    {
      p: "fL",
      pts: [
        [0.01, 0.028, 0.016],
        [0.034, 0.036, 0.026],
        [0.05, 0.0015, 0.04],
      ],
    },
    {
      p: "mL",
      pts: [
        [0.01, 0.026, -0.004],
        [0.036, 0.032, -0.006],
        [0.058, 0.0015, -0.016],
      ],
    },
    {
      p: "hL",
      pts: [
        [0.01, 0.024, -0.02],
        [0.032, 0.03, -0.034],
        [0.05, 0.0015, -0.046],
      ],
    },
  ];
  for (const { p, pts } of legs) {
    const mirrored = pts.map(([x, y, z]) => [-x, y, z] as V3);
    for (const [side, set] of [
      ["L", pts],
      ["R", mirrored],
    ] as const) {
      const name = `${p.charAt(0)}${side}`;
      const leg = b.chain(name, catmull(set), {
        parent: "thorax",
        names: [`${name}1`, `${name}2`, `${name}Tip`],
        role: "leg",
      });
      b.sweep(leg, (t: number) => 0.0016 - 0.0006 * t, { color: "#24302a", caps: "round" });
    }
  }

  // Abdomen: nine segments, a thin waist that swells into a club at the tip.
  const abdomen = b.chain(
    "tail",
    catmull([
      [0, 0.032, -0.026],
      [0, 0.03, -0.06],
      [0, 0.026, -0.09],
      [0, 0.02, -0.12],
    ]),
    { parent: "thorax", count: 9, role: "tail" },
  );
  const width = (t: number) => 0.0028 + 0.0016 * t + 0.0012 * Math.exp(-(((t - 0.92) / 0.08) ** 2));
  b.sweep(abdomen, (t: number) => [width(t), 0.85 * width(t)], {
    color: abdomenPaint,
    caps: "round",
  });

  // Cerci: two short tail appendages on the last segment.
  b.rod([0.002, 0.019, -0.12], [0.005, 0.016, -0.135], [0.0012, 0.0004], { color: "#3b2a1a", bone: "tail9" });
  b.rod([-0.002, 0.019, -0.12], [-0.005, 0.016, -0.135], [0.0012, 0.0004], { color: "#3b2a1a", bone: "tail9" });

  // ---- Body ---------------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 0.04, 0.02], w: 0.02, h: 0.022 },
      { at: [0, 0.038, -0.004], w: 0.03, h: 0.03 },
      { at: [0, 0.034, -0.026], w: 0.024, h: 0.024 },
    ],
    { color: thoraxPaint, bone: "thorax" },
  );

  // Head and eyes: a small green head carrying two large faceted compound eyes.
  b.part(new THREE.SphereGeometry(0.0105, b.segments(14), b.segments(10)), "#2c6b48", {
    at: [0, 0.043, 0.031],
    bone: "head",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0125, b.segments(14), b.segments(10)), eyePaint, {
      at: [0.0078 * s, 0.0465, 0.0345],
      bone: "head",
    });
    b.rod([0.002 * s, 0.052, 0.034], [0.006 * s, 0.06, 0.044], 0.0006, { color: "#111111", bone: "head" });
  }
  b.capsule([0, 0.038, 0.036], [0, 0.031, 0.044], 0.0035, { color: "#2c6b48", bone: "jaw" });

  // ---- Wings --------------------------------------------------------------------------------------------------
  // Wing outlines are given for the left side (+X); the right side is the mirror image.
  const forewing = {
    leading: [
      [0.01, 0.052, 0.024],
      [0.04, 0.062, 0.024],
      [0.07, 0.066, 0.02],
      [0.09, 0.066, 0.014],
    ] as V3[],
    trailing: [
      [0.01, 0.052, 0.016],
      [0.04, 0.062, 0.015],
      [0.07, 0.066, 0.012],
      [0.086, 0.066, 0.008],
    ] as V3[],
  };
  const hindwing = {
    leading: [
      [0.01, 0.05, -0.004],
      [0.035, 0.06, -0.004],
      [0.06, 0.064, -0.002],
      [0.074, 0.064, -0.004],
    ] as V3[],
    trailing: [
      [0.01, 0.05, -0.02],
      [0.035, 0.06, -0.022],
      [0.06, 0.064, -0.016],
      [0.07, 0.064, -0.01],
    ] as V3[],
  };

  const mix3 = (a: V3, c: V3, f: number): V3 => [
    a[0] + (c[0] - a[0]) * f,
    a[1] + (c[1] - a[1]) * f,
    a[2] + (c[2] - a[2]) * f,
  ];

  const wing = (kind: "F" | "H", s: 1 | -1, wingShape: { leading: V3[]; trailing: V3[] }) => {
    const name = `wing${kind}${s === 1 ? "L" : "R"}`;
    const mirror = (pts: V3[]) => pts.map(([x, y, z]) => [x * s, y, z] as V3);
    const L = mirror(wingShape.leading);
    const T = mirror(wingShape.trailing);
    b.joint(name, { parent: "thorax", at: L[0], dir: [s, 0.08, 0], role: "wing" });

    const wingPaint = gradient("#d9a441", "#eaf8ff", L[0], L[3]);
    b.membrane(catmull(L), catmull(T), { color: wingPaint, thickness: 0.0005, bone: name });

    // Veins: two longitudinal veins and two cross veins, all lying on the wing plane.
    for (const f of [0.3, 0.65]) {
      const vein = L.map((l, i) => mix3(l, T[i], f));
      b.sweep(catmull(vein), 0.00035, { color: "#21403a", bone: name });
    }
    for (const i of [1, 2]) b.rod(L[i], T[i], 0.00025, { color: "#21403a", bone: name });

    // Pterostigma: the dark tip spot on the leading edge.
    b.slab([L[2], L[3], mix3(L[3], T[3], 0.45), mix3(L[2], T[2], 0.45)], {
      color: "#1c1a14",
      thickness: 0.0007,
      bone: name,
    });
  };

  for (const s of [1, -1] as const) {
    wing("F", s, forewing);
    wing("H", s, hindwing);
  }

  return b.root;
}
