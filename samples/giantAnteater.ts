import { ConeGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { aim, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";

export const meta = {
  name: "Giant Anteater",
  description:
    "A long-snouted giant anteater with a shaggy plume tail, dark shoulder mantle, and enormous hooked claws.",
  builtBy: "GPT-6 Astra",
};

const FUR = "#9b6a3f";
const BACK = "#b98550";
const BELLY = "#e6d4b3";
const DARK = "#29221f";
const DARK_BROWN = "#4a3023";
const NOSE = "#211c1b";
const EYE = "#11100e";
const IRIS = "#c38b35";
const CLAW = "#d7c7a9";
const EAR = "#8b5b3b";
const EAR_IN = "#d49b78";
const TONGUE = "#bd625c";

export default function build() {
  const b = createBuilder({ name: "giantAnteater" });
  const random = rng(29);

  // One continuous tube runs from the tail plume through the low torso and rises into the neck.
  const stations = [
    { at: [0, 0.72, -0.62], w: 0.2, h: 0.27 },
    { at: [0, 0.78, -0.4], w: 0.43, h: 0.5 },
    { at: [0, 0.79, -0.08], w: 0.48, h: 0.54 },
    { at: [0, 0.83, 0.2], w: 0.42, h: 0.52 },
    { at: [0, 0.94, 0.4], w: 0.3, h: 0.36 },
    { at: [0, 1.08, 0.51], w: 0.2, h: 0.24 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const tailCurve = catmull([
    [0, 0.78, -0.62],
    [0, 0.75, -0.86],
    [0, 0.78, -1.1],
    [0, 0.9, -1.32],
    [0, 1.06, -1.5],
    [0, 1.18, -1.64],
    [0, 1.27, -1.73],
  ]);
  const root = b.joint("hips", { at: stations[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(curve.knots[1], 1), {
    parent: root,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", tailCurve, {
    parent: root,
    count: 8,
    names: ["tailBase", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tailTip"],
    role: "tail",
    group: "tail",
  });
  const joinedStations = [
    { at: tailCurve.at(1), w: 0.05, h: 0.04 },
    { at: tailCurve.at(0.82), w: 0.12, h: 0.09 },
    { at: tailCurve.at(0.62), w: 0.17, h: 0.13 },
    { at: tailCurve.at(0.4), w: 0.21, h: 0.16 },
    { at: tailCurve.at(0.2), w: 0.22, h: 0.16 },
    ...stations,
  ] as const;
  const tailFraction = tailCurve.length / (tailCurve.length + curve.length);
  const bellyDip = (t: number) =>
    Math.sin(Math.PI * Math.min(Math.max(((t - tailFraction) / (1 - tailFraction) - 0.08) / 0.72, 0), 1));
  b.loft(joinedStations, {
    bone: [tail, root, spine],
    from: 0,
    to: tailFraction,
    color: FUR,
    bands: [
      [0.22 * tailFraction, DARK_BROWN],
      [0.45 * tailFraction, FUR],
      [0.68 * tailFraction, BACK],
      [0.82 * tailFraction, FUR],
      [tailFraction, DARK_BROWN],
    ],
    caps: { start: "round", end: "none" },
    sides: 14,
    group: "tail",
  });
  const body = b.loft(joinedStations, {
    bone: [tail, root, spine],
    from: tailFraction,
    color: FUR,
    sectors: [
      [-68, 68, BACK],
      [125, 235, BELLY],
    ],
    shift: (t) => [0, -0.045 * bellyDip(t)],
    caps: { start: "none", end: "round" },
    sides: 14,
    group: "body",
  });

  // Four separated, heavy limbs. The short front wrists and broad paws make the anteater's plantigrade stance clear.
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `frontLeg${side}`,
      [
        [s * 0.17, 0.74, 0.27],
        [s * 0.2, 0.48, 0.28],
        [s * 0.18, 0.19, 0.34],
        [s * 0.18, 0.075, 0.42],
        [s * 0.18, 0.06, 0.5],
      ],
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontPaw${side}`],
        role: "leg",
        contact: [s * 0.18, 0, 0.49],
        group: `frontLeg${side}`,
      },
    );
    b.sweep(front, (t) => [0.078 - 0.045 * t, 0.092 - 0.055 * t], {
      color: FUR,
      sides: 10,
      caps: { start: "round", end: "flat" },
    });
    const frontPaw = front.joints[3];
    b.frustumBox(front.at(1).at, [front.at(1).at.x, 0.06, front.at(1).at.z + 0.045], [0.13, 0.11], [0.16, 0.08], {
      bone: frontPaw,
      color: DARK_BROWN,
      group: `frontLeg${side}`,
    });
    // Three long, pale claws fan forward from each front paw.
    for (const dx of [-0.055, 0, 0.055]) {
      const clawBase = frontPaw.moved([dx, -0.005, 0.08]);
      b.spike(clawBase, [0, 0.24, 1], 0.18, 0.016, { bone: frontPaw, color: CLAW, group: `frontLeg${side}` });
    }

    const hind = b.chain(
      `hindLeg${side}`,
      [
        [s * 0.18, 0.72, -0.38],
        [s * 0.23, 0.45, -0.5],
        [s * 0.21, 0.17, -0.37],
        [s * 0.21, 0.065, -0.27],
        [s * 0.21, 0.055, -0.2],
      ],
      {
        parent: root,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
        role: "leg",
        contact: [s * 0.21, 0, -0.2],
        group: `hindLeg${side}`,
      },
    );
    b.sweep(hind, (t) => [0.1 - 0.065 * t, 0.115 - 0.07 * t], {
      color: FUR,
      sides: 10,
      caps: { start: "round", end: "flat" },
    });
    const hindPaw = hind.joints[3];
    b.frustumBox(hind.at(1).at, [hind.at(1).at.x, 0.05, hind.at(1).at.z + 0.04], [0.13, 0.1], [0.16, 0.075], {
      bone: hindPaw,
      color: DARK_BROWN,
      group: `hindLeg${side}`,
    });
  }

  // Head: an elongated wedge, with a separate lower jaw so the rig can open the mouth.
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, scale: 1, quat: aim([0, -0.2, 1], [0, 1, 0], "z") });
  b.loft(
    [
      { at: head.p([0, 0.02, -0.12]), w: 0.2, h: 0.22 },
      { at: head.p([0, 0.01, 0.12]), w: 0.18, h: 0.19 },
      { at: head.p([0, -0.01, 0.38]), w: 0.115, h: 0.12 },
      { at: head.p([0, -0.035, 0.63]), w: 0.065, h: 0.065 },
      { at: head.p([0, -0.045, 0.78]), w: 0.045, h: 0.045 },
    ],
    { bone: skull, color: FUR, sectors: [[120, 240, BELLY]], sides: 10, group: "head" },
  );
  // The dark nose caps the pencil-thin muzzle.
  head.part(new SphereGeometry(0.048, b.segments(12), b.segments(8)), NOSE, { at: [0, -0.045, 0.8], group: "head" });
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.08, 0.18],
    aim: [0, -0.12, 0.74],
    role: "jaw",
    group: "jaw",
  });
  b.capsule(jaw, head.p([0, -0.1, 0.73]), [0.047, 0.028], { color: BELLY, group: "jaw" });
  b.rod(head.p([0, -0.058, 0.58]), head.p([0, -0.07, 0.79]), 0.009, { color: DARK, bone: skull, group: "jaw" });
  // A little tongue peeks out between the jaws.
  b.sweep([head.p([0, -0.105, 0.59]), head.p([0, -0.13, 0.86])], [0.016, 0.008], {
    bone: jaw,
    color: TONGUE,
    caps: { start: "round", end: "round" },
    sides: 8,
    group: "jaw",
  });

  // Eyes sit high on the wedge, with a warm iris and a tiny glint.
  for (const s of [1, -1]) {
    head.part(new SphereGeometry(0.029, b.segments(10), b.segments(8)), IRIS, {
      at: [s * 0.105, 0.075, 0.2],
      group: "head",
    });
    head.part(new SphereGeometry(0.014, b.segments(8), b.segments(6)), EYE, {
      at: [s * 0.112, 0.077, 0.215],
      group: "head",
    });
    head.part(new SphereGeometry(0.0045, b.segments(6), b.segments(5)), "#fff5dc", {
      at: [s * 0.116, 0.087, 0.225],
      group: "head",
    });
    // Large, rounded ears stand behind the eyes.
    const ear: V3[] = [
      [s * 0.11, 0.1, -0.08],
      [s * 0.19, 0.22, -0.13],
      [s * 0.24, 0.11, -0.2],
      [s * 0.16, 0.045, -0.15],
    ];
    b.slab(
      ear.map((p) => head.p(p)),
      { thickness: 0.022, color: EAR, bone: skull, group: "head" },
    );
    b.slab(
      ear.map(([x, y, z]) => head.p([x * 0.82, y * 0.94, z + 0.012])),
      {
        thickness: 0.008,
        color: EAR_IN,
        bone: skull,
        group: "head",
      },
    );

    // Three stiff whiskers on each side emphasize the long, sensitive muzzle.
    for (const [dy, dz] of [
      [0.025, 0.5],
      [-0.005, 0.58],
      [-0.035, 0.53],
    ]) {
      const base = head.p([s * 0.045, -0.045 + dy, dz]);
      b.rod(base, head.p([s * (0.19 + random() * 0.035), -0.02 + dy * 1.4, dz + 0.08]), 0.004, {
        color: CLAW,
        bone: skull,
        group: "head",
      });
    }
  }

  // The signature black shoulder mantle is a pair of broad, angular side plates following the body profile.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.205, 1.01, 0.34],
        [s * 0.244, 0.9, 0.2],
        [s * 0.25, 0.68, -0.2],
        [s * 0.2, 0.64, -0.48],
        [s * 0.155, 0.75, -0.5],
        [s * 0.17, 0.86, -0.12],
      ],
      { thickness: 0.018, color: DARK, bone: spine.joints[1], group: "body" },
    );
  }

  // A few lifted fur blocks break up the smooth primitive body without turning it into a texture.
  const skin = b.surface(body);
  for (const hit of skin.scatter(18, {
    rng: random,
    minDist: 0.08,
    filter: (h) => h.n.y > 0.45 && h.at.z > -0.45 && h.at.z < 0.35,
  })) {
    b.stick(new ConeGeometry(0.022, 0.075, b.segments(6)), BACK, hit, {
      embed: 0.45,
      flow: [0, 0, -1],
      scale: 0.65 + random() * 0.55,
      group: "body",
    });
  }

  // Rest pose: the jaw parts slightly and the long tail lifts clear of the floor.
  b.pose(jaw, { axis: [1, 0, 0], deg: 11 });
  b.pose(tail.joints[1], { axis: [1, 0, 0], deg: 9 });
  b.pose(tail.joints[3], { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
