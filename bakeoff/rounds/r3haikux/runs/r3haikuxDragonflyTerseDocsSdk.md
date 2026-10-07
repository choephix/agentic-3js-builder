```ts
import * as THREE from "three";
import { createBuilder, catmull, frame, limb, paint, scales, svg } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description:
    "A perched dragonfly: emerald thorax with black stripes, cobalt abdomen with black rings, turquoise faceted eyes and four veined wings held flat.",
};

// Palette
const EMERALD = "#1fae7e";
const EMERALD_DARK = "#0f7a5a";
const BLACK = "#14191d";
const COBALT = "#2a6fe0";
const EYE = "#2ccfc0";
const EYE_EDGE = "#0a3d45";
const LEG = "#1a2024";

// Thorax: emerald with two black oblique stripes on each flank and a darker underside.
const THORAX = paint((p) => {
  if (p.y < 0.03) return EMERALD_DARK;
  const k = p.z + (p.y - 0.035) * 0.9;
  const side = Math.abs(p.x) > 0.0045;
  return side && ((k > 0.002 && k < 0.0085) || (k > 0.0105 && k < 0.0122)) ? BLACK : EMERALD;
});

// Abdomen: cobalt with black segment rings, a black dorsal line and a black tip.
// s = [t along the tube, dorsal clock angle in degrees].
const ABDOMEN = paint((_p, _n, s) => {
  if (s[0] > 0.95) return BLACK;
  const ring = (s[0] * 9) % 1 < 0.22;
  const dorsal = Math.cos((s[1] * Math.PI) / 180) > 0.9;
  return ring || dorsal ? BLACK : COBALT;
});

// Compound eyes: a faceted cell pattern on each eye.
const EYE_FACETS = scales(EYE, EYE_EDGE, { size: 0.0042 });

// Wing drawing, 50 x 200 units, root at the bottom (v = 0), tip at the top.
// Leading edge (costa) on the right, so the card's +Z side is the front.
function wingDrawing(): string {
  const CX = 25;
  const ROOT = 200;
  const TIP = 4;
  const y = (t: number) => ROOT - t * (ROOT - TIP);
  const half = (t: number) =>
    19 * Math.pow(Math.sin(Math.PI * (0.06 + 0.9 * t)), 0.55) * Math.pow(1 - Math.pow(t, 5), 0.5);
  const xl = (t: number) => CX + half(t);
  const xt = (t: number) => CX - half(t);
  const across = (t: number, f: number): [number, number] => [xt(t) + (xl(t) - xt(t)) * f, y(t)];
  const str = (pts: [number, number][]) => pts.map(([x, v]) => `${x.toFixed(2)},${v.toFixed(2)}`).join(" ");

  const steps = Array.from({ length: 33 }, (_, i) => i / 32);
  const outline: [number, number][] = [
    ...steps.map((t): [number, number] => [xt(t), y(t)]),
    ...steps
      .slice()
      .reverse()
      .map((t): [number, number] => [xl(t), y(t)]),
  ];
  const span = Array.from({ length: 25 }, (_, i) => (i / 24) * 0.96);
  const veins = [0.18, 0.36, 0.55, 0.74];
  const fractions = [0, ...veins, 1];

  const out: string[] = [
    `<polygon points="${str(outline)}" fill="#e4f7fc" stroke="#2a6b80" stroke-width="0.9" stroke-linejoin="round"/>`,
  ];
  for (const f of veins) {
    out.push(
      `<polyline points="${str(span.map((t) => across(t, f)))}" fill="none" stroke="#1f5a6b" stroke-width="0.6" stroke-linecap="round"/>`,
    );
  }
  for (let t = 0.04; t < 0.95; t += 0.05) {
    for (let k = 0; k < fractions.length - 1; k++) {
      out.push(
        `<polyline points="${str([across(t, fractions[k]), across(t + 0.012, fractions[k + 1])])}" fill="none" stroke="#2f7385" stroke-width="0.55"/>`,
      );
    }
  }
  // Costa: the thick leading edge.
  out.push(
    `<polyline points="${str(span.map((t) => [xl(t) - 1.1, y(t)] as [number, number]))}" fill="none" stroke="#143f4c" stroke-width="2.2" stroke-linecap="round"/>`,
  );
  // Pterostigma: the amber mark near the tip on the costa.
  out.push(
    `<rect x="${(xl(0.84) - 5.2).toFixed(2)}" y="${(y(0.84) - 1.8).toFixed(2)}" width="4" height="3.6" rx="0.6" fill="#9a6215"/>`,
  );
  // Nodus: the small joint on the costa.
  out.push(`<circle cx="${(xl(0.5) - 1.1).toFixed(2)}" cy="${y(0.5).toFixed(2)}" r="1.3" fill="#143f4c"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CX * 2} ${ROOT}">${out.join("")}</svg>`;
}

export default function build() {
  const b = createBuilder({ name: "dragonfly" });
  const WING = svg(wingDrawing(), { size: 1024 });

  // Skeleton
  const thorax = b.joint("thorax", { at: [0, 0.035, 0.012], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.04, 0.031], dir: [0, 0.25, 1], role: "head" });

  const abd = b.chain(
    "abd",
    catmull([
      [0, 0.032, -0.004],
      [0, 0.03, -0.02],
      [0, 0.028, -0.04],
      [0, 0.026, -0.056],
      [0, 0.025, -0.07],
    ]),
    { parent: thorax, count: 5, names: (i: number) => `abd${i + 1}`, role: "tail" },
  );
  const tipJoint = abd.joints[abd.joints.length - 1];

  // Thorax: a stocky loft, painted with the flank stripes.
  b.loft(
    [
      { at: [0, 0.033, -0.006], w: 0.013, h: 0.014 },
      { at: [0, 0.035, 0.004], w: 0.02, h: 0.02 },
      { at: [0, 0.036, 0.013], w: 0.023, h: 0.024 },
      { at: [0, 0.036, 0.021], w: 0.02, h: 0.021 },
      { at: [0, 0.035, 0.027], w: 0.012, h: 0.014 },
    ],
    { bone: thorax, color: THORAX },
  );

  // Head: dark core between the eyes, two big faceted compound eyes, antennae, labium.
  b.part(new THREE.SphereGeometry(0.0105, 10, 7), BLACK, { bone: head, at: [0, 0.04, 0.033], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0105, 10, 7), EYE_FACETS, {
      bone: head,
      at: [s * 0.0085, 0.0415, 0.0345],
      flat: true,
    });
    b.spike([s * 0.0025, 0.0505, 0.0405], [s * 0.35, 0.45, 1], 0.0075, 0.0009, { color: BLACK, bone: head });
  }
  b.part(new THREE.SphereGeometry(0.0045, 8, 6).scale(1.5, 1, 0.9), BLACK, {
    bone: head,
    at: [0, 0.0315, 0.0425],
  });

  // Abdomen: a long tapering tube with a dark tip and two cerci.
  b.sweep(abd, [0.0068, 0.0058, 0.0044, 0.0039, 0.0042, 0.0046], { color: ABDOMEN });
  for (const s of [1, -1]) {
    b.spike([s * 0.0015, 0.025, -0.069], [s * 0.35, 0, -1], 0.009, 0.0014, { color: BLACK, bone: tipJoint });
  }

  // Legs: three pairs of spiny legs, knees up, feet on the floor.
  const LEG_SETS = [
    { id: "front", hip: [0.0075, 0.028, 0.018], foot: [0.03, 0.0012, 0.034] },
    { id: "mid", hip: [0.0085, 0.028, 0.004], foot: [0.036, 0.0012, 0.006] },
    { id: "hind", hip: [0.008, 0.028, -0.01], foot: [0.03, 0.0012, -0.028] },
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (const leg of LEG_SETS) {
      const [hx, hy, hz] = leg.hip;
      const [fx, fy, fz] = leg.foot;
      const pts = limb(
        [s * hx, hy, hz],
        [s * fx, fy, fz],
        [0.017, 0.015, 0.011],
        [
          [0, 1, 0],
          [0, 1, 0],
        ],
      );
      const c = b.chain(`${leg.id}Leg${L}`, pts, {
        parent: thorax,
        names: [`${leg.id}Hip${L}`, `${leg.id}Knee${L}`, `${leg.id}Ankle${L}`, `${leg.id}Foot${L}`],
        role: "leg",
      });
      b.sweep(c, [0.0016, 0.0014, 0.0011, 0.0008], { color: LEG });
    }
  }

  // Wings: forewings and hindwings held flat and out. Each is a double-sided card
  // lying on a joint, with the veined drawing's costa at the front (+Z).
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const fore = b.joint(`foreWing${L}`, {
      parent: thorax,
      at: [s * 0.008, 0.0425, 0.024],
      aim: [s * 0.06, 0.0425, 0.02],
      role: "wing",
    });
    const hind = b.joint(`hindWing${L}`, {
      parent: thorax,
      at: [s * 0.008, 0.041, 0.0],
      aim: [s * 0.06, 0.041, -0.003],
      role: "wing",
    });
    b.cards([frame([s * 0.008, 0.0425, 0.024], [0, 1, 0])], WING, {
      size: [0.0125, 0.05],
      lean: 90,
      flow: [s, 0, 0],
      mirror: s > 0,
      bone: fore,
    });
    b.cards([frame([s * 0.008, 0.041, 0.0], [0, 1, 0])], WING, {
      size: [0.015, 0.048],
      lean: 90,
      flow: [s, 0, 0],
      mirror: s > 0,
      bone: hind,
    });
  }

  return b.root;
}
```