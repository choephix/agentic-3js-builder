This is an owl built from a spine, a lathed head with a facial disc, extruded folded wings, two feathered legs with toes and talons, and a tail. The plumage is a painted brown and cream pattern.

```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, mottle, spots, stripes, paint } from "agentic-3js-builder";

export const meta = {
  name: "Owl",
  description: "A stylised barn-style owl: heart-faced, amber-eyed, feathered legs, folded wings, about 0.45 m tall.",
};

export default function owl() {
  const b = createBuilder({ name: "owl", detail: 1, paintSize: 2048 });

  // ---- Colours and paints -------------------------------------------------------------
  const brown = mottle("#8b5e34", "#4a2f1b", { size: 0.03, seed: 4 });
  const cream = mottle("#f2e4c8", "#cfb589", { size: 0.02, seed: 9 });
  const chest = spots(cream, brown, { size: 0.025, amount: 0.35, seed: 2 });
  // Cream chest on the front of the body, mottled brown everywhere else.
  const plumage = paint((p, n) => (n.z > 0.35 && p.y < 0.3 ? chest : brown));
  const wingPaint = stripes(brown, cream, { size: 0.02, axis: "y", width: 0.3, seed: 3 });
  const facePaint = mottle("#f3e3c3", "#d9b98a", { size: 0.012, seed: 6 });
  const legColor = "#d8c6a0";
  const talon = "#2b2a27";
  const beak = "#3d3530";
  const amber = "#f2a51e";
  const pupil = "#130d08";

  // ---- Skeleton -----------------------------------------------------------------------
  // Root joint at the hips; the spine climbs to the top of the body; the head sits on it.
  const hips = b.joint("hips", { at: [0, 0.1, 0] });
  const spine = b.chain("spine", catmull([[0, 0.1, 0], [0, 0.2, 0.008], [0, 0.3, 0]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const head = b.joint("head", { parent: spine, at: [0, 0.335, 0], role: "head" });

  // Folded wings, one chain per side hanging from the shoulder.
  const wingL = b.chain(
    "wingL",
    polyline([[0.07, 0.3, -0.01], [0.09, 0.24, -0.01], [0.095, 0.17, -0.005], [0.09, 0.1, 0]]),
    { parent: spine, role: "wing", names: ["wingL1", "wingL2", "wingL3"] },
  );
  const wingR = b.chain(
    "wingR",
    polyline([[-0.07, 0.3, -0.01], [-0.09, 0.24, -0.01], [-0.095, 0.17, -0.005], [-0.09, 0.1, 0]]),
    { parent: spine, role: "wing", names: ["wingR1", "wingR2", "wingR3"] },
  );

  // Tail, angled down and back from the hips.
  b.chain("tail", catmull([[0, 0.1, -0.01], [0, 0.075, -0.06], [0, 0.05, -0.1]]), {
    parent: hips,
    role: "tail",
    names: ["tail1", "tail2"],
  });

  // ---- Body ---------------------------------------------------------------------------
  // A round, upright body: a tube that swells in the middle and tapers to the feet and the neck.
  b.sweep(spine, {
    radius: (t: number) => {
      const s = Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));
      return [0.025 + 0.035 * s, 0.024 + 0.035 * s];
    },
    color: plumage,
    name: "body",
  });

  // Tail feathers: a flattened tube.
  const tail = b.chain("tail", catmull([[0, 0.1, -0.01], [0, 0.075, -0.06], [0, 0.05, -0.1]]), {
    parent: hips,
    role: "tail",
    names: ["tail1", "tail2"],
  });
  b.sweep(tail, { radius: (t: number) => [0.03 - 0.008 * t, 0.008], color: brown, name: "tail" });

  // ---- Head ---------------------------------------------------------------------------
  // Round head from a lathe, spun around the head's vertical axis.
  b.lathe(
    [[0, -0.068], [0.04, -0.062], [0.063, -0.03], [0.068, 0], [0.062, 0.035], [0.04, 0.062], [0, 0.068]],
    { color: brown, at: [0, 0.335, 0], bone: head, name: "head" },
  );

  // Facial rim and facial disc, both pointing forward (+Z).
  b.lathe(
    [[0, 0], [0.062, 0], [0.066, 0.004], [0.06, 0.01], [0, 0.01]],
    { color: brown, at: [0, 0.335, 0.054], axis: [0, 0, 1], bone: head, name: "faceRim" },
  );
  b.lathe(
    [[0, 0], [0.052, 0], [0.058, 0.006], [0.052, 0.013], [0, 0.013]],
    { color: facePaint, at: [0, 0.335, 0.058], axis: [0, 0, 1], bone: head, name: "faceDisc" },
  );

  // Big amber eyes with dark pupils.
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, b.segments(12), b.segments(10)), amber, {
      at: [sx * 0.024, 0.345, 0.066],
      bone: head,
      name: sx > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.009, b.segments(10), b.segments(8)), pupil, {
      at: [sx * 0.024, 0.345, 0.08],
      bone: head,
      name: sx > 0 ? "pupilL" : "pupilR",
    });
    // Ear tufts, swept up and out from the crown.
    b.spike([sx * 0.03, 0.385, 0], [sx * 0.05, 0.44, -0.02], null, 0.013, {
      color: brown,
      bone: head,
      name: sx > 0 ? "tuftL" : "tuftR",
    });
  }

  // Hooked beak: a short cone pointing down and forward.
  b.spike([0, 0.33, 0.072], [0, 0.31, 0.095], null, 0.012, { color: beak, bone: head, name: "beak" });

  // ---- Wings --------------------------------------------------------------------------
  // Flat folded wings: an outline pushed out to a slab on each side, rounded at the shoulder, sharp at the tip.
  const wingShape = [
    [-0.03, 0.035],
    [0.035, 0.035],
    [0.04, -0.06],
    [0.03, -0.14],
    [0.0, -0.21, "sharp"],
    [-0.03, -0.12],
  ] as const;
  b.extrude(wingShape, {
    color: wingPaint,
    at: [0.07, 0.3, 0],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 1,
    bone: wingL.joints[0],
    name: "wingL",
  });
  b.extrude(wingShape, {
    color: wingPaint,
    at: [-0.07, 0.3, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 1,
    bone: wingR.joints[0],
    name: "wingR",
  });

  // ---- Legs and feet -----------------------------------------------------------------
  // Feathered legs down to three forward toes, each tipped with a talon.
  const leg = (side: 1 | -1) => {
    const name = side > 0 ? "legL" : "legR";
    const chain = b.chain(
      name,
      catmull([
        [side * 0.035, 0.1, 0],
        [side * 0.04, 0.045, 0.012],
        [side * 0.042, 0.012, 0.028],
      ]),
      { parent: hips, role: "leg", names: [`${name}1`, `${name}2`] },
    );
    b.sweep(chain, { radius: (t: number) => 0.02 - 0.004 * t, color: legColor, name: `${name}Feather` });
    const ankle = chain.joints[1];
    const foot: [number, number, number] = [side * 0.042, 0.012, 0.028];
    for (const [dx, dz] of [
      [-0.012, 0.03],
      [0, 0.036],
      [0.012, 0.03],
    ]) {
      const tip: [number, number, number] = [side * 0.042 + dx, 0.007, 0.028 + dz];
      b.rod(foot, tip, 0.0065, { color: legColor, bone: ankle });
      b.spike(tip, [0, -1, 0], 0.01, 0.0035, { color: talon, bone: ankle });
    }
  };
  leg(1);
  leg(-1);

  return b.root;
}
```