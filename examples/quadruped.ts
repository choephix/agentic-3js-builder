// Example 2: a quadruped. Loft body split over a spine chain, IK-planted legs of capsules and rods, a
// region-scaled head with a frustumBox snout, spots and scales stuck onto the real body surface.
import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { twoBoneIK } from "../src/ik";
import { aim, rng } from "../src/math";
import type { V3 } from "../src/math";

export const meta = { name: "SDK smoke: quadruped" };

const FUR = "#b0703a";
const SPOT = "#4a2c17";
const PALE = "#ecd9b4";
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
    { parent: root, group: "body" },
  );
  const body = b.loft(
    [
      { at: [0, 0.98, -0.8], w: 0.3, h: 0.3 },
      { at: [0, 0.95, -0.55], w: 0.55, h: 0.55 },
      { at: [0, 0.96, -0.1], w: 0.6, h: 0.62 },
      { at: [0, 1.0, 0.35], w: 0.58, h: 0.64 },
      { at: [0, 1.05, 0.62], w: 0.4, h: 0.44 },
    ],
    { chain: spine, color: FUR, group: "body" },
  );

  // Legs: hip → knee (IK) → ankle exactly above a foot resting on y = 0.
  const footR = 0.06;
  type Tuple = [number, number, number];
  const legs: Array<[string, Tuple, Tuple, V3, number]> = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    legs.push([`legF${side}`, [s * 0.2, 0.9, 0.35], [s * 0.24, footR, 0.4], [0, 0, -1], 2]);
    legs.push([`legH${side}`, [s * 0.2, 0.9, -0.5], [s * 0.24, footR, -0.52], [0, 0, 1], 0]);
  }
  for (const [name, hip, ankle, bend, spineIndex] of legs) {
    const knee = twoBoneIK(hip, ankle, [0.46, 0.44], bend);
    const leg = b.chain(name, [hip, knee, ankle], { parent: spine.joints[spineIndex], group: name });
    b.capsule(hip, knee, [0.1, 0.07], { bone: leg.joints[0], color: FUR });
    b.capsule(knee, ankle, [0.065, 0.05], { bone: leg.joints[1], color: FUR });
    const [x, , z] = ankle;
    const foot = b.joint(`${name}Foot`, { parent: leg.joints[1], at: ankle, dir: [0, 0, 1], group: name });
    b.capsule(ankle, [x, footR, z + 0.12], footR, { bone: foot, color: HOOF });
    for (const dx of [-0.035, 0.035])
      b.rod([x + dx, 0.02, z + 0.13], [x + dx, 0.02, z + 0.2], [0.02, 0.012], { bone: foot, color: HOOF });
  }

  // Neck and a region-scaled head.
  const neck = b.chain(
    "neck",
    [
      [0, 1.05, 0.62],
      [0, 1.25, 0.8],
      [0, 1.4, 0.92],
    ],
    { parent: spine.joints[2], group: "neck" },
  );
  b.sweep(neck, [0.17, 0.13], { color: FUR });
  const head = b.region({ at: [0, 1.4, 0.92], scale: HEAD_SCALE });
  const skull = head.joint("head", { parent: neck.joints[1], at: [0, 0, 0], dir: [0, 0, 1], group: "head" });
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
  const jaw = head.joint("jaw", { parent: skull, at: [0, -0.08, 0.05], aim: [0, -0.1, 0.3], group: "jaw" });
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
  for (const s of [1, -1]) {
    head.part(new SphereGeometry(0.03, 10, 8), EYE, { bone: skull, at: [s * 0.1, 0.07, 0.12], group: "head" });
    b.slab([head.p([s * 0.1, 0.13, -0.02]), head.p([s * 0.24, 0.3, -0.08]), head.p([s * 0.12, 0.2, -0.1])], {
      thickness: head.s(0.02),
      color: FUR,
      bone: skull,
      group: "head",
    });
  }

  // A horn on the crown found by addressing the head's real surface, plus a nose ray-cast from the front.
  const headSurface = b.surface(skull);
  const crown = headSurface.around(skull.at).at(0, 70);
  if (crown) b.stick(new ConeGeometry(0.035, 0.14, 8), PALE, crown, { embed: 0.15 });
  const nose = headSurface.ray(head.p([0, -0.03, 1]), [0, 0, -1]);
  if (nose) b.stick(new SphereGeometry(0.03, 8, 6), HOOF, nose, { embed: 0.4 });

  // Spots and back scales on the body surface; scales shingle backwards (flow = -Z).
  const bodySurface = b.surface(body);
  const random = rng(7);
  for (const hit of bodySurface.scatter(26, { rng: random, minDist: 0.12, filter: (h) => h.n.y > -0.3 }))
    b.stick(new CylinderGeometry(0.05, 0.05, 0.012, 10), SPOT, hit, { embed: 0.5, scale: 0.6 + random() * 0.6 });
  for (const hit of bodySurface.scatter(18, { rng: rng(11), minDist: 0.08, filter: (h) => h.n.y > 0.8 }))
    b.stick(new BoxGeometry(0.06, 0.02, 0.08), PALE, hit, { flow: [0, 0, -1], spin: 0, embed: 0.4 });

  // A saddle blanket seated at the point of the back nearest to a model-space guess.
  const saddle = bodySurface.nearest([0, 1.5, -0.1]);
  b.part(new BoxGeometry(0.26, 0.03, 0.22), SPOT, { bone: saddle.joint, at: saddle.p, quat: aim(saddle.n, [0, 0, 1]) });

  // Short tail.
  const tail = b.chain(
    "tail",
    [
      [0, 0.98, -0.8],
      [0, 0.9, -1.05],
      [0, 0.75, -1.2],
    ],
    { parent: root, group: "tail" },
  );
  b.sweep(tail, [0.07, 0.03], {
    color: FUR,
    bands: [
      [0.7, FUR],
      [1, SPOT],
    ],
  });

  return b.root;
}
