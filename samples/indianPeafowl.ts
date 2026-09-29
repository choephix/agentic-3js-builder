// Indian peafowl (Pavo cristatus), a male in full display at real size. The train is a fan of individually drawn
// feathers: teardrop eye feathers in four staggered tiers and fishtail feathers at the lateral edges, each an
// extruded outline with its eye spot stacked on its face in four extruded layers. Nine ring joints carry the fan. The
// body and neck share one continuous loft over the spine and neck chains.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Joint } from "../src/skeleton";
import { limb } from "../src/ik";
import { DEG, lerp, offset, rng } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { catmull } from "../src/path";
import type { Hit } from "../src/surface";

export const meta = {
  name: "Indian peafowl",
  description:
    "A displaying peacock: a raised semicircle of extruded eye and fishtail feathers, a lathed beak and eyes, a spatulate crest, barred wings and chestnut primaries.",
};

const BLUE = "#1f4fc4";
const BLUE_DEEP = "#16358f";
const MANTLE = "#2c3f23";
const SCALE = "#7b9440";
const BELLY = "#1b231f";
const THIGH = "#3a3a31";
const LEG = "#8f877a";
const BEAK = "#cbbb9c";
const BEAK_DARK = "#a8987c";
const FACE_WHITE = "#f2f0e8";
const EYE_DARK = "#2a1a12";
const CREST_SHAFT = "#3b4747";
const CREST_TIP = "#1f86a8";
const VANES = ["#5e8f2c", "#528a30", "#467e33", "#3c7337"];
const FISHTAIL = "#7a8a2a";
const GOLD = "#c9b247";
const COPPER = "#a4602c";
const TEAL = "#27aa9c";
const NAVY = "#1a2682";
const RECTRIX = "#6b5541";
const DOWN = "#9a9384";
const BARBS = "#5f6d30";
const RACHIS = "#b8a47e";
const PRIMARY = "#b5532a";
const SECONDARY = "#1f3a3f";
const COVERT = "#ddd0ab";
const BAR = "#1d1b17";

/** A symmetric outline: the right half from bottom to top, then the points on the centre line, then the left half. */
function mirrored(right: readonly OutlinePoint[], centre: readonly OutlinePoint[]): OutlinePoint[] {
  const left = [...right].reverse().map((p): OutlinePoint => (p.length === 3 ? [-p[0], p[1], "sharp"] : [-p[0], p[1]]));
  return [...right, ...centre, ...left];
}

/** Stem to `a`, then a flare into a round teardrop head of half-width `w`; the eye sits in the head. */
const eyeVane = (len: number, w: number, a: number, stem: number) =>
  mirrored(
    [
      [stem, 0, "sharp"],
      [stem, a, "sharp"],
      [0.42 * w, a + 0.45 * (len - w - a)],
      [w, len - 1.05 * w],
      [0.82 * w, len - 0.3 * w],
    ],
    [[0, len]],
  );

/** A narrow vane ending in two pointed tips around a rounded notch. */
const fishtail = (len: number, w: number, a: number, stem: number) =>
  mirrored(
    [
      [stem, 0, "sharp"],
      [stem, a, "sharp"],
      [0.5 * w, a + 0.4 * (len - a)],
      [0.72 * w, len - 0.16],
      [1.35 * w, len, "sharp"],
    ],
    [[0, len - 0.11]],
  );

/** An egg, slightly pointed toward the feather's base, centred `cy` above the origin. */
const oval = (rx: number, ry: number, cy: number): OutlinePoint[] => [
  [0, cy - 1.12 * ry],
  [0.9 * rx, cy - 0.45 * ry],
  [0.8 * rx, cy + 0.6 * ry],
  [0, cy + ry],
  [-0.8 * rx, cy + 0.6 * ry],
  [-0.9 * rx, cy - 0.45 * ry],
];

/** The ocellus's dark heart: a kidney with its notch toward the quill. */
const kidney = (w: number, h: number, cy: number): OutlinePoint[] => [
  [0.55 * w, cy - h],
  [w, cy - 0.3 * h],
  [0.85 * w, cy + 0.55 * h],
  [0, cy + h],
  [-0.85 * w, cy + 0.55 * h],
  [-w, cy - 0.3 * h],
  [-0.55 * w, cy - h],
  [0, cy - 0.5 * h],
];

/** Long, round-tipped feather drawn up its shaft: primaries, secondaries, rectrices. */
const quill = (len: number, w: number) =>
  mirrored(
    [
      [0.3 * w, 0, "sharp"],
      [0.85 * w, 0.25 * len],
      [w, 0.78 * len],
      [0.55 * w, 0.97 * len],
    ],
    [[0, len]],
  );

const CREST_PADDLE = mirrored(
  [
    [0.0015, 0, "sharp"],
    [0.005, 0.01],
    [0.011, 0.019],
    [0.0095, 0.028],
  ],
  [[0, 0.033]],
);

function must(hit: Hit | null, what: string): Hit {
  if (!hit) throw new Error(`indianPeafowl: no surface hit for ${what}`);
  return hit;
}

export default function build() {
  const b = createBuilder({ name: "indianPeafowl" });
  const jitter = rng(23);

  // ---- Skeleton and body --------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.62, -0.16], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.63, -0.06],
      [0, 0.65, 0.04],
      [0, 0.71, 0.14],
    ]),
    { parent: hips, count: 2, names: ["spine", "chest"], role: "spine", group: "body" },
  );
  const rump = b.joint("rump", { parent: hips, at: [0, 0.66, -0.25], aim: [0, 0.72, -0.31], group: "body" });
  const stations = [
    { at: [0, 0.68, -0.31], w: 0.12, h: 0.1 },
    { at: [0, 0.64, -0.2], w: 0.25, h: 0.26 },
    { at: [0, 0.63, -0.04], w: 0.3, h: 0.32 },
    { at: [0, 0.68, 0.1], w: 0.26, h: 0.3 },
    { at: [0, 0.77, 0.17], w: 0.15, h: 0.17 },
    { at: [0, 0.8413, 0.2122], w: 0.12, h: 0.12 },
    { at: [0, 0.87, 0.21], w: 0.12, h: 0.12 },
    { at: [0, 0.97, 0.215], w: 0.09, h: 0.09 },
    { at: [0, 1.05, 0.25], w: 0.058, h: 0.058 },
  ] as const;
  const bodyPath = catmull(stations.map(({ at }) => at));
  const neckStart = bodyPath.closestT(stations[5].at);
  const neckChain = b.chain("neck", bodyPath.slice(neckStart, 1), {
    parent: spine.joints[1],
    count: 3,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });

  // One curve carries the body and neck. Split only to preserve the body's belly sectors and its colour bands.
  const body = b.loft(stations, {
    bone: [spine, neckChain],
    from: 0,
    to: neckStart,
    color: MANTLE,
    bands: [
      [neckStart * 0.5, MANTLE],
      [neckStart, BLUE],
    ],
    sectors: [[122, 238, BELLY]],
    caps: { start: "round", end: "none" },
    group: "body",
  });
  b.loft(stations, {
    bone: [spine, neckChain],
    from: neckStart,
    to: 1,
    color: BLUE,
    caps: { start: "none", end: "round" },
    group: "neck",
  });
  const bodySkin = b.surface(body);

  // Bronze-green mantle scales on the back between the folded wings.
  for (const hit of bodySkin.scatter(38, {
    rng: rng(5),
    minDist: 0.038,
    filter: (h) => h.n.y > 0.5 && h.at.z > -0.25 && h.at.z < 0.08,
  }))
    b.stick(new SphereGeometry(1, b.segments(7), b.segments(4)), SCALE, hit, {
      scale: [0.019, 0.008, 0.025],
      flow: [0, 0, -1],
      embed: 0.45,
      group: "body",
    });

  // ---- Neck, head, beak ---------------------------------------------------------------------------------------
  const head = b.joint("head", {
    parent: neckChain.joints[2],
    at: neckChain.at(1),
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });
  // Head local axes: +Y forward, +Z up, +X toward the bird's right.
  const skull = b.part(new SphereGeometry(1, b.segments(14), b.segments(10)), BLUE, {
    bone: head,
    frame: head.moved([0, 0.012, 0.004]),
    scale: [0.035, 0.055, 0.04],
    group: "head",
  });
  // A darker blue throat patch under the chin.
  b.part(new SphereGeometry(1, b.segments(10), b.segments(7)), BLUE_DEEP, {
    bone: head,
    frame: head.moved([0, 0.01, -0.018]),
    scale: [0.028, 0.04, 0.024],
    group: "head",
  });

  b.lathe(
    [
      [0, 0],
      [0.012, 0],
      [0.012, 0.008],
      [0.009, 0.022],
      [0.004, 0.036],
      [0, 0.041],
    ],
    {
      at: head.local([0, 0.05, -0.004]),
      axis: head.dir([0, 1, -0.2]),
      bone: head,
      smoothing: 1,
      segments: 12,
      color: BEAK,
      group: "head",
      name: "beakUpper",
    },
  );
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.044, -0.016]),
    dir: head.dir([0, 1, -0.42]),
    role: "jaw",
    group: "head",
  });
  b.lathe(
    [
      [0, 0],
      [0.008, 0],
      [0.008, 0.006],
      [0.0055, 0.02],
      [0, 0.031],
    ],
    {
      at: jaw.local([0, 0.004, 0]),
      axis: jaw.axis,
      bone: jaw,
      smoothing: 1,
      segments: 12,
      color: BEAK_DARK,
      group: "head",
      name: "beakLower",
    },
  );

  // Eyes: a lathed ring of bare white skin around a lathed dark dome, with white stripes draped above and below.
  const headSkin = b.surface(skull);
  const fwd = head.dir([0, 1, 0]);
  const up = head.dir([0, 0, 1]);
  for (const s of [1, -1]) {
    const eye = must(headSkin.around(skull.at).at(s * 62, 14), "eye");
    const n = eye.n.clone();
    b.lathe(
      [
        [0.0072, 0],
        [0.0098, 0],
        [0.0092, 0.0028],
        [0.0082, 0.0042],
      ],
      {
        at: offset(eye, n, -0.0015),
        axis: n,
        bone: head,
        segments: 16,
        color: FACE_WHITE,
        group: "head",
        name: `eyeRing${s > 0 ? "L" : "R"}`,
      },
    );
    b.lathe(
      [
        [0, 0],
        [0.0085, 0],
        [0.008, 0.002],
        [0.0055, 0.0048],
        [0, 0.006],
      ],
      {
        at: offset(eye, n, -0.002),
        axis: n,
        bone: head,
        smoothing: 1,
        segments: 14,
        color: EYE_DARK,
        group: "head",
        name: `eye${s > 0 ? "L" : "R"}`,
      },
    );
    const onFace = (u: number, v: number) =>
      eye.at.clone().addScaledVector(fwd, u).addScaledVector(up, v).addScaledVector(n, 0.012);
    for (const stripe of [
      [onFace(0.03, 0.009), onFace(0.012, 0.016), onFace(-0.012, 0.016), onFace(-0.032, 0.009)],
      [onFace(0.026, -0.009), onFace(0.008, -0.016), onFace(-0.014, -0.015), onFace(-0.03, -0.007)],
    ])
      b.sweep(headSkin.drape(catmull(stripe), { lift: 0.0005 }), [0.0016, 0.0032, 0.0032, 0.0015], {
        bone: head,
        color: FACE_WHITE,
        sides: 6,
        group: "head",
      });
  }

  // Crest: a transverse fan of bare shafts, each ending in a spatulate paddle facing forward.
  b.ring(
    frame(head.local([0, 0.004, 0.034]), fwd),
    {
      count: 15,
      radius: 0.004,
      fromDeg: -42,
      toDeg: 42,
      tilt: 10,
      joints: 1,
      name: "crest",
      parent: head,
      role: "fan",
      group: "crest",
    },
    (item) => {
      b.rod(item, item.moved([0, 0.058, 0]), 0.0011, { color: CREST_SHAFT, sides: 5, group: "crest" });
      b.extrude(CREST_PADDLE, {
        at: item.moved([0, 0.052, 0]),
        x: item.dir([1, 0, 0]),
        y: item.axis,
        thickness: [0.0024, 0.0012],
        smoothing: 2,
        color: CREST_TIP,
        group: "crest",
      });
    },
  );

  // ---- Folded wings -----------------------------------------------------------------------------------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `wing${side}`;
    // The folded wing hugs the flank: a surface bowed in toward the top and bottom of the body.
    const wp = (z: number, y: number, out = 0) => new Vector3(s * (0.166 + out - 1.6 * (y - 0.66) ** 2), y, z);
    const wing = b.chain(g, [wp(0.11, 0.74, -0.05), wp(-0.06, 0.68), wp(0.05, 0.71), wp(-0.08, 0.65)], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
      group: g,
    });
    const [shoulder, elbow, wrist] = wing.joints;
    // One feather drawn up its shaft from `root` to `tip`, lying in the wing surface.
    const feather = (
      root: Vector3,
      tip: Vector3,
      w: number,
      thickness: readonly [number, number],
      color: string,
      bone: Joint,
    ) => {
      const along = tip.clone().sub(root);
      const up = new Vector3(s * -3.2 * (root.y - 0.66), 1, 0);
      const across = up.addScaledVector(along, -up.dot(along) / along.lengthSq());
      return b.extrude(quill(along.length(), w), {
        at: root,
        x: across,
        y: along,
        thickness,
        smoothing: 1,
        bone,
        color,
        group: g,
      });
    };

    // Chestnut primaries reach back from the hand, under everything else.
    for (let i = 0; i < 6; i++) {
      const out = 0.002 * i;
      const root = lerp(wp(0.05, 0.7, out), wp(-0.08, 0.655, out), i / 5);
      feather(root, wp(-0.37 + 0.016 * i, 0.575 - 0.012 * i, out), 0.036, [0.007, 0.003], PRIMARY, wrist);
    }
    // Dark secondaries hang from the forearm over the primaries' roots.
    for (let j = 0; j < 6; j++) {
      const out = 0.014 + 0.002 * j;
      const root = lerp(wp(-0.07, 0.69, out), wp(0.05, 0.72, out), j / 5);
      feather(root, wp(root.z - 0.2, 0.56 + 0.004 * j, out), 0.042, [0.008, 0.003], SECONDARY, elbow);
    }
    // Three shingled rows of buff coverts, each crossed by a black bar: the peacock's barred shoulder.
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++) {
        const out = 0.03 + 0.004 * (2 - r) + 0.0015 * (c % 2);
        const root = wp(0.1 - 0.015 * r - 0.058 * c, 0.765 - 0.04 * r, out);
        const tip = wp(root.z - 0.085, root.y - 0.035, out);
        const covert = feather(root, tip, 0.03, [0.006, 0.003], COVERT, r === 0 ? shoulder : elbow);
        const len = root.distanceTo(tip);
        const outZ = covert.dir([0, 0, 1]).x * s > 0 ? 1 : -1;
        b.extrude(
          [
            [-0.024, 0.52 * len],
            [0.024, 0.49 * len],
            [0.025, 0.66 * len],
            [-0.025, 0.69 * len],
          ],
          {
            at: covert.moved([0, 0, outZ * 0.0026]),
            x: covert.dir([1, 0, 0]),
            y: covert.dir([0, 1, 0]),
            thickness: 0.002,
            color: BAR,
            group: g,
          },
        );
      }
  }

  // ---- Legs -------------------------------------------------------------------------------------------------
  const TOE_R = 0.012;
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const g = `leg${side}`;
    const leg = b.chain(
      g,
      limb(
        [s * 0.075, 0.57, -0.06],
        [s * 0.095, TOE_R + 0.003, 0.1],
        [0.16, 0.27, 0.18, 0.075],
        [
          [0, 0, 1],
          [0, 0, -1],
          [0, 0, 1],
        ],
        { sole: [0, 0, 1] },
      ),
      {
        parent: hips,
        names: ["thigh", "shin", "tarsus", "toe"].map((name) => name + side),
        role: "leg",
        contact: [s * 0.095, 0, 0.06],
        group: g,
      },
    );
    b.sweep(leg, [0.05, 0.045, 0.03, 0.017, 0.015, TOE_R], {
      bands: [
        [0.4, THIGH],
        [1, LEG],
      ],
      group: g,
    });
    const [, , tarsus, ball] = leg.joints;
    const b0 = new Vector3(ball.at.x, 0.009, ball.at.z);
    for (const dx of [-1, 1])
      b.capsule(b0, [b0.x + dx * 0.04, 0.008, b0.z + 0.05], [0.009, 0.007], { bone: ball, color: LEG, group: g });
    b.capsule(b0, [b0.x, 0.007, b0.z - 0.042], [0.008, 0.006], { bone: ball, color: LEG, group: g });
    b.spike(lerp(tarsus.at, ball.at, 0.55), [0, -0.25, -1], 0.022, 0.0045, {
      bone: tarsus,
      color: BEAK_DARK,
      group: g,
    });
  }

  // ---- The train ----------------------------------------------------------------------------------------------
  // A made-up line through the rump: the fan is the plane across it, leaning a little forward at the top, and a
  // positive tilt dishes every feather toward the front.
  const FAN_AT = new Vector3(0, 0.72, -0.3);
  const FAN_AXIS = new Vector3(0, -0.14, 1).normalize();
  const TILT = 8;

  const tiers = [
    {
      count: 27,
      span: 100,
      radius: 0.2,
      len: 1.22,
      w: 0.098,
      vane: 0.48,
      stem: 0.006,
      thick: [0.012, 0.004],
      smoothing: 2,
    },
    {
      count: 20,
      span: 96,
      radius: 0.19,
      len: 0.92,
      w: 0.092,
      vane: 0.46,
      stem: 0.0055,
      thick: [0.011, 0.004],
      smoothing: 1,
    },
    {
      count: 15,
      span: 92,
      radius: 0.17,
      len: 0.64,
      w: 0.085,
      vane: 0.44,
      stem: 0.005,
      thick: [0.01, 0.004],
      smoothing: 1,
    },
    {
      count: 8,
      span: 84,
      radius: 0.15,
      len: 0.38,
      w: 0.075,
      vane: 0.32,
      stem: 0.0045,
      thick: [0.009, 0.004],
      smoothing: 1,
    },
  ] as const;
  const FISHTAILS = 3; // per side, at the ends of the outer tier

  // The outer tier owns the fan's joints: nine group joints, three feathers each. Inner tiers, the rectrices and
  // the base rosette ride whichever group joint points closest to them, so each joint moves a whole wedge.
  const train = b.ring(frame(FAN_AT, FAN_AXIS), {
    count: tiers[0].count,
    radius: tiers[0].radius,
    fromDeg: -tiers[0].span,
    toDeg: tiers[0].span,
    tilt: TILT,
    joints: 9,
    name: "train",
    parent: rump,
    role: "tail",
    group: "train",
  });
  const wedge = (dir: Vector3): Joint =>
    train.joints.reduce((best, j) => (j.axis.dot(dir) > best.axis.dot(dir) ? j : best));

  tiers.forEach((tier, k) => {
    const items =
      k === 0
        ? train.items
        : b.ring(frame(offset(FAN_AT, FAN_AXIS, 0.03 * k), FAN_AXIS), {
            count: tier.count,
            radius: tier.radius,
            fromDeg: -tier.span,
            toDeg: tier.span,
            tilt: TILT,
          }).items;
    for (const item of items) {
      const bone = item.bone ?? wedge(item.axis);
      const len = tier.len * (1 + (jitter() - 0.5) * 0.04);
      const edge = k === 0 && (item.i < FISHTAILS || item.i >= tier.count - FISHTAILS);
      // Neighbours alternate in depth so overlapping vanes never share a plane.
      const at = item.moved([0, 0, item.i % 2 ? 0.009 : 0]);
      // Pale shafts run up the back of the outer feathers, over the barbs, so the fan's back shows its spokes.
      if (k === 0)
        b.rod(item.moved([0, 0.02, -0.028]), item.moved([0, len * 0.85, -0.028]), [0.0045, 0.0018], {
          color: RACHIS,
          sides: 5,
          group: "train",
        });
      if (edge) {
        const ftLen = len * 0.9;
        b.extrude(fishtail(ftLen, 0.06, ftLen - 0.42, tier.stem), {
          at,
          x: item.dir([1, 0, 0]),
          y: item.axis,
          thickness: tier.thick,
          bevel: 0.0025,
          smoothing: 2,
          bone,
          color: FISHTAIL,
          group: "train",
          name: "fishtail",
        });
        continue;
      }
      const { w } = tier;
      const vane = b.extrude(eyeVane(len, w, len - tier.vane, tier.stem), {
        at,
        x: item.dir([1, 0, 0]),
        y: item.axis,
        thickness: tier.thick,
        bevel: 0.0025,
        smoothing: tier.smoothing,
        bone,
        color: VANES[k],
        group: "train",
        name: "eyeFeather",
      });
      // The ocellus: gold, copper, turquoise and a navy kidney, stacked on the vane's front face.
      const eyeY = len - 1.1 * w;
      const front = (tier.thick[0] + (tier.thick[1] - tier.thick[0]) * (eyeY / len)) / 2;
      [
        oval(0.72 * w, 0.86 * w, 0),
        oval(0.58 * w, 0.7 * w, -0.05 * w),
        oval(0.43 * w, 0.52 * w, -0.1 * w),
        kidney(0.29 * w, 0.28 * w, -0.17 * w),
      ].forEach((outline, layer) =>
        b.extrude(outline, {
          at: vane.moved([0, eyeY, front + 0.0011 + layer * 0.0013]),
          x: vane.dir([1, 0, 0]),
          y: vane.dir([0, 1, 0]),
          thickness: 0.0022,
          smoothing: 1,
          color: [GOLD, COPPER, TEAL, NAVY][layer],
          group: "train",
          name: "ocellus",
        }),
      );
    }
  });

  // The loose barbs between the feathers: one flat sector behind each train joint's wedge, so the fan reads as
  // one solid semicircle from the front and from behind, and still folds joint by joint.
  const step = (2 * tiers[0].span) / (tiers[0].count - 1);
  train.joints.forEach((joint, k) => {
    // Each sector spans its three feathers; the two end sectors stop at their outermost feather's shaft.
    let [lo, hi] = [-(1.5 * step + 0.5) * DEG, (1.5 * step + 0.5) * DEG];
    const end = k === 0 ? train.items[0] : k === train.joints.length - 1 ? train.items[train.items.length - 1] : null;
    if (end && end.axis.dot(joint.dir([1, 0, 0])) > 0) hi = step * DEG;
    else if (end) lo = -step * DEG;
    const arc = (r: number, n: number, from: number, to: number) =>
      Array.from({ length: n }, (_, i): OutlinePoint => {
        const a = from + ((to - from) * i) / (n - 1);
        return [r * Math.sin(a), r * Math.cos(a)];
      });
    b.extrude([...arc(1.22, 7, lo, hi), ...arc(0.02, 3, hi, lo)], {
      at: offset(FAN_AT, FAN_AXIS, -0.017 - 0.004 * (k % 2)),
      x: joint.dir([1, 0, 0]),
      y: joint.axis,
      thickness: 0.005,
      bone: joint,
      color: BARBS,
      group: "train",
      name: "barbs",
    });
  });

  // Behind the train: the short brown rectrices that prop it up, around a lathed dome of grey down.
  b.ring(
    frame(offset(FAN_AT, FAN_AXIS, -0.035), FAN_AXIS),
    { count: 16, radius: 0.1, fromDeg: -82, toDeg: 82, tilt: TILT },
    (item) =>
      b.extrude(quill(0.6, 0.045), {
        at: item,
        x: item.dir([1, 0, 0]),
        y: item.axis,
        thickness: [0.01, 0.004],
        smoothing: 1,
        bone: wedge(item.axis),
        color: RECTRIX,
        group: "train",
        name: "rectrix",
      }),
  );
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.066, 0.022],
      [0.036, 0.04],
      [0, 0.046],
    ],
    {
      at: offset(FAN_AT, FAN_AXIS, -0.03),
      axis: FAN_AXIS.clone().negate(),
      bone: rump,
      smoothing: 1,
      segments: 14,
      color: DOWN,
      group: "train",
      name: "undertail",
    },
  );

  return b.root;
}
