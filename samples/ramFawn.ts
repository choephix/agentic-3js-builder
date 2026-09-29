// Ram fawn. One continuous smooth-skinned body from rump to head: a loft with a real profile (a width and height
// per station), a belly that sags below the spine (`shift`) and countershading (`sectors`), bending over five
// spine and neck joints. Legs from `limb` with elliptical `(t) => [rx, ry]` sections, digitigrade behind; a
// region-scaled head with spiral horns sprouted from its surface; pale dapples stuck on the back that bend with
// the skin; a collar ringed around the neck and draped onto it; jaw opened and tail raised after building.
import { BoxGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull, spiral } from "../src/path";

export const meta = {
  name: "Ram Fawn",
  description: "A dappled young ram: one smooth-skinned body from rump to head, countershaded, with spiral horns.",
  builtBy: "SDK author (Claude Opus 5.5)",
};

const BACK = "#7a4726";
const FLANK = "#b87a42";
const CREAM = "#f0dfc2";
const DAPPLE = "#f6ead3";
const HOOF = "#2e2522";
const HORN = "#dccaa2";
const NOSE = "#2b1f1c";
const EYE = "#16110e";
const EAR = "#e5ad97";
const COLLAR = "#2f5d8a";
const BELL = "#d6a62b";

/** Change this one number to resize the whole head; joints move, never scale. */
const HEAD_SCALE = 1;

export default function build() {
  const b = createBuilder({ name: "ramFawn" });

  // Body profile: station centres run from the rump tip to the base of the head; w/h are the full width and
  // height there. The spine and neck joints sit on the same curve, from the hips on.
  const stations = [
    { at: [0, 0.86, -0.64], w: 0.24, h: 0.28 },
    { at: [0, 0.87, -0.42], w: 0.36, h: 0.42 },
    { at: [0, 0.86, -0.08], w: 0.4, h: 0.46 },
    { at: [0, 0.9, 0.26], w: 0.36, h: 0.48 },
    { at: [0, 1.06, 0.46], w: 0.22, h: 0.28 },
    { at: [0, 1.24, 0.56], w: 0.15, h: 0.18 },
    { at: [0, 1.38, 0.63], w: 0.14, h: 0.15 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const root = b.joint("root", { at: stations[1].at });
  const spine = b.chain("spine", curve.slice(curve.knots[1], 1), {
    parent: root,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  // The belly hangs up to 5 cm below the spine line between hips and chest; the joints stay on the spine.
  const belly = (t: number) => Math.sin(Math.PI * Math.min(Math.max((t - 0.1) / 0.45, 0), 1));
  const body = b.loft(stations, {
    bone: spine,
    color: FLANK,
    sectors: [
      [-70, 70, BACK],
      [125, 235, CREAM],
    ],
    shift: (t) => [0, -0.05 * belly(t)],
    sides: 10,
    group: "body",
  });

  // Legs end on hooves resting on y = 0: straight front legs, digitigrade hind legs (knee forward, hock back).
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `legF${side}`,
      limb([s * 0.12, 0.78, 0.28], [s * 0.13, 0.1, 0.33], [0.37, 0.35], [0, 0, -1]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`], role: "leg", group: `legF${side}` },
    );
    b.sweep(front, [0.075, 0.05, 0.042], { color: FLANK, sides: 8 });
    const hind = b.chain(
      `legH${side}`,
      limb(
        [s * 0.13, 0.8, -0.42],
        [s * 0.14, 0.1, -0.5],
        [0.3, 0.3, 0.2],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      ),
      {
        parent: spine.joints[0],
        names: [`hip${side}`, `knee${side}`, `hock${side}`],
        role: "leg",
        group: `legH${side}`,
      },
    );
    // A deep thigh tapering to a slim cannon: an elliptical section, deeper front-to-back than side-to-side.
    b.sweep(
      hind,
      (t) => {
        const thigh = Math.max(0, 1 - t / 0.45);
        return [0.042 + 0.04 * thigh, 0.045 + 0.075 * thigh];
      },
      { color: FLANK, sides: 8 },
    );
    for (const leg of [front, hind]) {
      const ankle = leg.at(1).at;
      b.frustumBox(ankle, [ankle.x, 0, ankle.z], [0.07, 0.08], [0.085, 0.1], {
        bone: leg.joints[leg.joints.length - 1],
        color: HOOF,
      });
    }
  }

  // Tail: a short flattened tuft on its own two joints, cream at the tip.
  const tail = b.chain(
    "tail",
    [
      [0, 0.92, -0.6],
      [0, 0.98, -0.7],
      [0, 0.95, -0.8],
    ],
    { parent: root, names: ["tailBase", "tailTip"], role: "tail", group: "tail" },
  );
  b.sweep(tail, (t) => [0.06 - 0.03 * t, 0.04 - 0.02 * t], {
    bands: [
      [0.6, FLANK],
      [1, CREAM],
    ],
  });

  // Head: a joint at the end of the neck and a region riding on it, +Z forward and +Y up in head units.
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: [0, -0.45, 1],
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, scale: HEAD_SCALE, quat: aim([0, -0.45, 1], [0, 1, 0], "z") });
  b.loft(
    [
      { at: head.p([0, 0.02, -0.06]), w: head.s(0.19), h: head.s(0.2) },
      { at: head.p([0, 0.03, 0.07]), w: head.s(0.21), h: head.s(0.21) },
      { at: head.p([0, -0.01, 0.2]), w: head.s(0.14), h: head.s(0.14) },
      { at: head.p([0, -0.03, 0.29]), w: head.s(0.11), h: head.s(0.1) },
    ],
    { bone: skull, color: FLANK, sectors: [[120, 240, CREAM]], group: "head" },
  );
  head.part(new BoxGeometry(0.07, 0.04, 0.03), NOSE, { at: [0, -0.02, 0.33], group: "head" });
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.06, 0.06],
    aim: [0, -0.08, 0.27],
    role: "jaw",
    group: "jaw",
  });
  b.capsule(jaw, head.p([0, -0.08, 0.26]), [head.s(0.05), head.s(0.035)], { color: CREAM, group: "jaw" });

  // Horns: log-spiral coils sprouted from the skull's real surface, coiling back, down and outward.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(skull.at).at(s * 60, 55);
    if (!hit) continue;
    const coil = spiral(offset(hit, [0, -1, -0.4], head.s(0.1)), hit, [s, 0, 0], {
      turns: -s * 1.25,
      r1: head.s(0.04),
      pitch: head.s(0.08),
    });
    b.sprout(`horn${s > 0 ? "L" : "R"}`, hit, coil, [head.s(0.05), head.s(0.01)], {
      count: 0,
      color: HORN,
      caps: { start: "round", end: "point" },
      group: "head",
    });
  }
  for (const s of [1, -1]) {
    head.part(new SphereGeometry(0.026, 8, 6), EYE, { at: [s * 0.085, 0.04, 0.12], group: "head" });
    head.part(new SphereGeometry(0.008, 5, 4), "#ffffff", { at: [s * 0.1, 0.055, 0.135], group: "head" });
    // Ears: a leaf pointing out and back, with a paler inner leaf just in front.
    const ear: V3[] = [
      [s * 0.08, 0.06, -0.02],
      [s * 0.2, 0.09, -0.08],
      [s * 0.26, 0.05, -0.1],
      [s * 0.19, 0.02, -0.06],
    ];
    b.slab(
      ear.map((p) => head.p(p)),
      { thickness: head.s(0.015), color: FLANK, bone: skull, group: "head" },
    );
    b.slab(
      ear.map(([x, y, z]) => head.p([x * 0.95, y + 0.008, z + 0.012])),
      { thickness: head.s(0.006), color: EAR, bone: skull, group: "head" },
    );
  }

  // Pale dapples on the back. Stuck parts copy the skin's weights, so the ones on a bend bend with it.
  const skin = b.surface(body);
  const random = rng(5);
  const dapples = skin.scatter(28, {
    rng: random,
    minDist: 0.075,
    filter: (h) => h.n.y > 0.35 && h.at.z > -0.55 && h.at.z < 0.32,
  });
  for (const hit of dapples)
    b.stick(new CylinderGeometry(0.028, 0.028, 0.01, 8), DAPPLE, hit, { embed: 0.5, scale: 0.7 + random() * 0.6 });

  // Collar: points ringed around the neck line, draped onto the real neck and swept as a closed loop.
  const around = b.ring(spine.at(0.8), { count: 10, radius: 0.18 });
  const collarPath = skin.drape(catmull(around.items, { closed: true }), { lift: 0.012 });
  b.sweep(collarPath, 0.016, { color: COLLAR, sides: 6, group: "body" });
  let lowest = collarPath.at(0);
  for (let i = 1; i < 60; i++) if (collarPath.at(i / 60).y < lowest.y) lowest = collarPath.at(i / 60);
  b.part(new SphereGeometry(0.03, 8, 6), BELL, { at: offset(lowest, [0, -1, 0.3], 0.032), group: "body" });

  // Rest-pose edits after building: open the jaw a little and lift the tail.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  b.pose(tail.joints[0], { axis: [1, 0, 0], deg: 25 });

  return b.root;
}
