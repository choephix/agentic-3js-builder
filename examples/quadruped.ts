// Example 2: a quadruped. Countershaded, sagging loft body split over a spine chain; digitigrade hind legs and
// two-bone front legs from `limb`, with rigging names and rig roles (legs record their floor contact); a
// region-scaled head riding on the neck, re-posed mid-build, with a frustumBox snout and spiral ram horns sprouted
// from its surface; spots, scales and a draped strap on the real body surface; jaw opened and tail raised by
// posing after everything is built.
import { BoxGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull, spiral } from "../src/path";

export const meta = { name: "SDK smoke: quadruped" };

const FUR = "#b0703a";
const SPOT = "#4a2c17";
const PALE = "#ecd9b4";
const BACK = "#6b3f1f";
const CREAM = "#f0dcb0";
const STRAP = "#8c1d2c";
const HOOF = "#302621";
const EYE = "#101010";

/** Change this one number to resize the whole head; joints move, never scale. */
const HEAD_SCALE = 1.15;

export default function build() {
  const b = createBuilder({ name: "quadruped" });

  const root = b.joint("root", { at: [0, 0.95, -0.55] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.95, -0.55],
      [0, 0.97, -0.1],
      [0, 1.0, 0.35],
      [0, 1.05, 0.62],
    ],
    { parent: root, role: "spine", group: "body" },
  );
  const body = b.loft(
    [
      { at: [0, 0.98, -0.8], w: 0.3, h: 0.3 },
      { at: [0, 0.95, -0.55], w: 0.55, h: 0.55 },
      { at: [0, 0.96, -0.1], w: 0.6, h: 0.62 },
      { at: [0, 1.0, 0.35], w: 0.58, h: 0.64 },
      { at: [0, 1.05, 0.62], w: 0.4, h: 0.44 },
    ],
    {
      bone: spine,
      color: FUR,
      // Countershading: dark back, cream belly, fur flanks.
      sectors: [
        [-65, 65, BACK],
        [125, 235, CREAM],
      ],
      // The belly hangs 6 cm below the spine line mid-body; the joints stay on the spine.
      shift: (t) => [0, -0.06 * Math.sin(Math.PI * t)],
      group: "body",
    },
  );

  // Legs end exactly on feet resting on y = 0: two-bone front legs, digitigrade hind legs (knee forward, hock back).
  const footR = 0.06;
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs: Array<[string, V3, [number, number, number], number[], V3[], string[], number]> = [
      [
        `legF${side}`,
        [s * 0.2, 0.9, 0.35],
        [s * 0.24, footR, 0.4],
        [0.46, 0.44],
        [[0, 0, -1]],
        ["shoulder", "elbow"],
        2,
      ],
      [
        `legH${side}`,
        [s * 0.2, 0.9, -0.5],
        [s * 0.24, footR, -0.52],
        [0.36, 0.34, 0.26],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
        ["hip", "knee", "hock"],
        0,
      ],
    ];
    for (const [group, hip, ankle, lengths, bends, names, spineIndex] of legs) {
      const leg = b.chain(group, limb(hip, ankle, lengths, bends), {
        parent: spine.joints[spineIndex],
        names: names.map((n) => `${n}${group.slice(3)}`),
        role: "leg",
        contact: [ankle[0], 0, ankle[2] + 0.06],
        group,
      });
      b.sweep(leg, [0.1, 0.05], { color: FUR });
      const foot = b.joint(`foot${group.slice(3)}`, {
        parent: leg.joints[leg.joints.length - 1],
        at: ankle,
        dir: [0, 0, 1],
        group,
      });
      const [x, , z] = ankle;
      b.capsule(ankle, [x, footR, z + 0.12], footR, { bone: foot, color: HOOF });
      for (const dx of [-0.035, 0.035])
        b.rod([x + dx, 0.02, z + 0.13], [x + dx, 0.02, z + 0.2], [0.02, 0.012], { bone: foot, color: HOOF });
    }
  }

  // Neck and a region-scaled head.
  const neck = b.chain(
    "neck",
    [
      [0, 1.05, 0.62],
      [0, 1.25, 0.8],
      [0, 1.4, 0.92],
    ],
    { parent: spine.joints[2], role: "neck", group: "neck" },
  );
  b.sweep(neck, [0.17, 0.13], { color: FUR });
  // The head region rides on the upper neck joint, so re-posing the neck carries every later head.p() with it.
  const head = b.region({ at: [0, 1.4, 0.92], scale: HEAD_SCALE, bone: neck.joints[1] });
  const skull = head.joint("head", {
    parent: neck.joints[1],
    at: [0, 0, 0],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  head.part(new SphereGeometry(0.17, 12, 10), FUR, { bone: skull, at: [0, 0.03, 0], group: "head" });
  b.frustumBox(
    head.p([0, -0.02, 0.08]),
    head.p([0, -0.05, 0.34]),
    [head.s(0.2), head.s(0.17)],
    [head.s(0.14), head.s(0.1)],
    {
      bone: skull,
      color: PALE,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.08, 0.05],
    aim: [0, -0.1, 0.3],
    role: "jaw",
    group: "jaw",
  });
  b.frustumBox(
    head.p([0, -0.08, 0.05]),
    head.p([0, -0.1, 0.3]),
    [head.s(0.16), head.s(0.06)],
    [head.s(0.11), head.s(0.05)],
    {
      bone: jaw,
      color: PALE,
      group: "jaw",
    },
  );
  // Lift the head a little. Everything built so far follows, and the region, surfaces and handles used below see
  // the new pose.
  b.pose(neck.joints[1], { axis: [1, 0, 0], deg: -10 });

  // Ram horns: log-spiral coils sprouted from the skull's real surface, coiling back, down and outward. The
  // surface is taken before the ears exist, so the hits land on the skull itself.
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSurface.around(skull.at).at(s * 55, 40);
    if (!hit) continue;
    const coil = spiral(offset(hit.p, [0, -1, -0.3], head.s(0.075)), hit.p, [s, 0, 0], {
      turns: -s * 1.15,
      r1: head.s(0.035),
      pitch: head.s(0.07),
    });
    b.sprout(`horn${s > 0 ? "L" : "R"}`, hit, coil, [head.s(0.04), head.s(0.008)], {
      count: 0,
      color: PALE,
      caps: { start: "round", end: "point" },
      group: "head",
    });
  }
  for (const s of [1, -1]) {
    head.part(new SphereGeometry(0.03, 10, 8), EYE, { bone: skull, at: [s * 0.1, 0.07, 0.12], group: "head" });
    b.slab([head.p([s * 0.1, 0.13, -0.02]), head.p([s * 0.24, 0.3, -0.08]), head.p([s * 0.12, 0.2, -0.1])], {
      thickness: head.s(0.02),
      color: FUR,
      bone: skull,
      group: "head",
    });
  }
  // A nose ray-cast from the front onto the snout.
  const nose = b.surface(skull).ray(head.p([0, -0.03, 1]), head.d([0, 0, -1]));
  if (nose) b.stick(new SphereGeometry(0.03, 8, 6), HOOF, nose, { embed: 0.4 });

  // Spots on the flanks and back scales on the real body surface; scales shingle backwards (flow = -Z).
  const bodySurface = b.surface(body);
  const random = rng(7);
  for (const hit of bodySurface.scatter(22, { rng: random, minDist: 0.12, filter: (h) => Math.abs(h.n.x) > 0.6 }))
    b.stick(new CylinderGeometry(0.05, 0.05, 0.012, 10), SPOT, hit, { embed: 0.5, scale: 0.6 + random() * 0.6 });
  for (const hit of bodySurface.scatter(18, { rng: rng(11), minDist: 0.08, filter: (h) => h.n.y > 0.8 }))
    b.stick(new BoxGeometry(0.06, 0.02, 0.08), PALE, hit, { flow: [0, 0, -1], spin: 0, embed: 0.4 });

  // A saddle blanket seated at the point of the back nearest to a model-space guess.
  const saddle = bodySurface.nearest([0, 1.5, -0.1]);
  b.part(new BoxGeometry(0.26, 0.03, 0.22), SPOT, { bone: saddle.joint, at: saddle.p, quat: aim(saddle.n, [0, 0, 1]) });

  // A chest strap: a rough closed loop around the body, draped onto the skin, swept as a seamless ring.
  const loop = catmull(
    [
      [0.45, 0.95, 0.2],
      [0, 1.5, 0.2],
      [-0.45, 0.95, 0.2],
      [0, 0.5, 0.2],
    ],
    { closed: true },
  );
  b.sweep(bodySurface.drape(loop, { lift: 0.012 }), 0.018, {
    bone: bodySurface.nearest([0, 1.4, 0.2]).joint,
    color: STRAP,
  });

  // Tail sprouted from the rump: its root is buried in the body, its first joint sits on the surface.
  const rump = bodySurface.ray([0, 0.98, -1.6], [0, 0, 1])!;
  const tail = b.sprout("tail", rump, catmull([rump.p, [0, 0.92, -1.05], [0, 0.78, -1.22]]), [0.07, 0.03], {
    count: 2,
    names: ["tailBase", "tailTip"],
    role: "tail",
    group: "tail",
    bands: [
      [0.7, FUR],
      [1, SPOT],
    ],
  });

  // Rest-pose edits after building: open the jaw and raise the tail. +deg about +X tips forward-pointing bones
  // down and backward-pointing bones up.
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });
  b.pose(tail.chain!.joints[0], { axis: [1, 0, 0], deg: 30 });

  return b.root;
}
