```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, grain, mottle, paint, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Great horned owl",
  description:
    "A great horned owl perched on a gnarled branch: mottled bark-brown and buff plumage with fine barring, a pale bib, tall ear tufts, a tawny facial disc rimmed in black, orange eyes and a hooked grey beak on a jointed jaw, with feathered legs gripping the wood.",
};

const TALON = "#1b1a18";
const BEAK = "#6f7277";

export default function greatHornedOwl() {
  const b = createBuilder({ name: "great-horned-owl", detail: 1, paintSize: 1024 });
  const seg = (n: number) => b.segments(n);

  // Paints: mottled brown-buff plumage, fine horizontal barring on the breast, a pale bib on the throat.
  const fur = mottle("#5a4430", "#b8965f", { size: 0.05, seed: 3 });
  const bars = stripes("#d2b57c", "#3a2a1c", { size: 0.024, axis: "y", width: 0.3, wobble: 0.4, seed: 5 });
  const plumage = paint((p, n) => {
    if (p.z > 0.05 && p.y > 0.49 && p.y < 0.6 && n.z > 0.2) return "#eee3c6";
    if (p.z > 0.02 && n.z > 0.2 && p.y < 0.5) return bars;
    return fur;
  });
  const disc = mottle("#c4894f", "#e6bd85", { size: 0.03, seed: 9 });
  const wingPaint = stripes("#4b3a28", "#b99660", { size: 0.035, axis: "y", width: 0.35, wobble: 0.5, seed: 2 });
  const bark = grain("#5b4530", "#2f2319", { size: 0.05, axis: "x", seed: 4 });

  // Skeleton: body, head with a hinged lower jaw, folded wings, two feathered legs.
  b.joint("body", { at: [0, 0.42, 0], dir: [0, 1, 0], role: "spine" });
  b.joint("head", { parent: "body", at: [0, 0.6, 0.03], dir: [0, 1, 0.1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.6, 0.14], dir: [0, 0, 1], role: "jaw" });
  b.joint("wingL", { parent: "body", at: [0.1, 0.56, 0], dir: [0, -1, -0.35], role: "wing" });
  b.joint("wingR", { parent: "body", at: [-0.1, 0.56, 0], dir: [0, -1, -0.35], role: "wing" });

  // Body: a plump upright loft from tail to shoulders.
  b.loft(
    [
      { at: [0, 0.38, -0.1], w: 0.13, h: 0.13 },
      { at: [0, 0.45, 0.0], w: 0.23, h: 0.23 },
      { at: [0, 0.51, 0.05], w: 0.21, h: 0.22 },
      { at: [0, 0.57, 0.03], w: 0.17, h: 0.18 },
    ],
    { name: "body", color: plumage, bone: "body" },
  );

  // Head, with a tawny facial disc rimmed in black.
  b.part(new THREE.SphereGeometry(0.1, seg(12), seg(8)), plumage, { bone: "head", at: [0, 0.63, 0.04] });
  b.part(new THREE.SphereGeometry(0.085, seg(14), seg(10)), disc, {
    bone: "head",
    at: [0, 0.63, 0.12],
    scale: [1, 1, 0.4],
  });
  b.part(new THREE.TorusGeometry(0.086, 0.009, seg(6), seg(20)), "#1c1915", { bone: "head", at: [0, 0.63, 0.12] });

  // Huge orange eyes with dark pupils.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.033, seg(12), seg(8)), "#f08a1c", { bone: "head", at: [sx * 0.038, 0.64, 0.14] });
    b.part(new THREE.SphereGeometry(0.015, seg(8), seg(6)), "#0c0906", { bone: "head", at: [sx * 0.038, 0.64, 0.165] });
  }

  // Hooked beak: upper mandible on the head, lower mandible on the jaw joint.
  b.sweep(
    bezier([0, 0.625, 0.145], [0, 0.612, 0.185], [0, 0.59, 0.19], [0, 0.578, 0.162]),
    (t) => 0.022 * (1 - 0.6 * t),
    { color: BEAK, bone: "head", caps: "round" },
  );
  b.sweep(
    bezier([0, 0.6, 0.15], [0, 0.592, 0.175], [0, 0.583, 0.175], [0, 0.575, 0.152]),
    (t) => 0.014 * (1 - 0.5 * t),
    { color: "#5f6266", bone: "jaw" },
  );

  // Ear tufts.
  for (const sx of [1, -1])
    b.spike([sx * 0.045, 0.685, 0.0], [sx * 0.3, 1, -0.25], 0.13, 0.024, { color: "#3c2e20", bone: "head" });

  // Folded wings, flat feather shapes lying against each flank.
  for (const sx of [1, -1]) {
    b.slab(
      [
        [sx * 0.112, 0.6, 0.0],
        [sx * 0.112, 0.56, 0.06],
        [sx * 0.112, 0.46, 0.05],
        [sx * 0.112, 0.4, -0.02],
        [sx * 0.112, 0.36, -0.12],
        [sx * 0.112, 0.44, -0.1],
        [sx * 0.112, 0.53, -0.06],
      ],
      { color: wingPaint, thickness: 0.022, bone: sx > 0 ? "wingL" : "wingR" },
    );
  }

  // Long barred tail hanging behind the perch.
  b.sweep(
    catmull([
      [0, 0.42, -0.08],
      [0, 0.36, -0.17],
      [0, 0.31, -0.26],
    ]),
    (t) => [0.07 - 0.02 * t, 0.018],
    { color: plumage, bone: "body" },
  );

  // Feathered legs ending in strong black talons that grip the branch.
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [sx * 0.08, 0.43, -0.01],
        [sx * 0.075, 0.375, 0.0],
        [sx * 0.075, 0.355, 0.035],
      ],
      { parent: "body", names: [`hip${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(leg, 0.024, { color: "#9b7b50" });

    for (const k of [-1, 0, 1])
      b.spike(
        [sx * 0.075 + k * 0.016, 0.352, 0.035],
        [k * 0.6, -0.8, 1],
        0.045,
        0.01,
        { color: TALON, bone: `foot${side}` },
      );
    b.spike([sx * 0.075, 0.355, 0.0], [0, -0.3, -1], 0.035, 0.01, { color: TALON, bone: `foot${side}` });
  }

  // Gnarled perch: a bent branch on a stub that touches the ground, with knots and twigs.
  b.rod([0, 0, 0], [0, 0.3, 0], 0.045, { color: bark, bone: "body" });
  b.sweep(
    catmull([
      [-0.42, 0.2, -0.05],
      [-0.22, 0.27, 0.0],
      [0, 0.31, 0.0],
      [0.22, 0.29, 0.03],
      [0.42, 0.18, 0.06],
    ]),
    (t) => 0.03 + 0.012 * Math.sin(Math.PI * t),
    { color: bark, bone: "body" },
  );
  b.spike([0.24, 0.3, 0.02], [0.5, 0.45, 0.6], 0.09, 0.012, { color: bark, bone: "body" });
  b.spike([-0.26, 0.27, -0.02], [-0.4, 0.5, -0.5], 0.08, 0.011, { color: bark, bone: "body" });

  return b.root;
}
```