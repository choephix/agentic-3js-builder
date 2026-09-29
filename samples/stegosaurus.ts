// Stegosaurus at 1/4 scale (2 m), four-square in a rigging rest pose. Tail, trunk and neck are one smooth-skinned tube
// drawn from the tail tip through the hips to the base of the skull, over an eight-joint tail chain running back from
// the hips and a spine chain running forward. The dorsal plates are the signature: two staggered rows of extruded
// outlines drawn in four families (rounded neck plates, upright back plates, broad hip plates, swept tail plates) that
// grow toward the hips and shrink toward the head and tail. Each plate is two extrudes, a tapered red-rimmed blade
// with a thicker ochre core carrying vascular grooves, seated on a ray hit so it takes the skin's weights and rides the
// one tube when it bends. Hoof nails and leaf-shaped cheek teeth are small extrudes too. Turned shapes are lathes: the
// elephantine foot pads, the keratin beak on both jaws, the eyelid rings, the throat ossicles and the skin tubercles.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { bezier, catmull } from "../src/path";
import type { Hit } from "../src/surface";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Stegosaurus",
  description:
    "A quarter-scale stegosaurus: two staggered rows of red-rimmed dorsal plates, a four-spike thagomizer, a tiny beaked head and pillar legs on turned foot pads.",
  builtBy: "Claude Opus 5.5",
};

const HIDE = "#6b7543";
const BACK = "#434e2d";
const STRIPE = "#4f5832";
const BELLY = "#d6c996";
const PLATE = "#d9a54e";
const RIM = "#a33c28";
const SPIKE = "#eadfc4";
const SPIKE_TIP = "#3b3328";
const BEAK = "#3d352b";
const NAIL = "#2e2822";
const PAD = "#4a4a33";
const MOUTH = "#b9575a";
const TOOTH = "#efe6cf";
const EYE = "#c98a2a";
const PUPIL = "#120f0c";
const STUD = "#8e8b58";
const BUMP = "#58613a";

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return keys[keys.length - 1][1];
}

type PlateKind = { fw: number; rw: number; fs: number; rs: number; lean: number; sharp: boolean };

/** Plate families, as fractions of the plate's length L and height H. Outline +x runs toward the tail. */
const PLATE_KINDS = {
  neck: { fw: 0.5, rw: 0.48, fs: 0.5, rs: 0.45, lean: 0.06, sharp: false },
  back: { fw: 0.52, rw: 0.44, fs: 0.56, rs: 0.4, lean: 0.16, sharp: true },
  hip: { fw: 0.56, rw: 0.5, fs: 0.62, rs: 0.46, lean: 0.2, sharp: true },
  tail: { fw: 0.5, rw: 0.36, fs: 0.46, rs: 0.22, lean: 0.5, sharp: true },
} satisfies Record<string, PlateKind>;

/**
 * A side-view dorsal plate `L` long and `H` tall above the skin, with a narrow root buried `bury` below it: a waist
 * just above the skin, a front and a rear shoulder, and a tip leaning `lean × L` toward the tail.
 */
function plateOutline(L: number, H: number, bury: number, k: PlateKind): OutlinePoint[] {
  const lean = k.lean * L;
  return [
    [-0.28 * L, -bury, "sharp"],
    [0.28 * L, -bury, "sharp"],
    [0.34 * L, 0.08 * H],
    [k.rw * L + lean * k.rs, k.rs * H],
    k.sharp ? [lean, H, "sharp"] : [lean, H],
    [-k.fw * L + lean * k.fs, k.fs * H],
    [-0.34 * L, 0.08 * H],
  ];
}

export default function build() {
  const b = createBuilder({ name: "stegosaurus" });
  const random = rng(17);

  // ---------------------------------------------------------------- tail, trunk and neck
  // One tube from the tail tip to the base of the skull; w/h are full width and height. It tapers from the tail,
  // swells into the rump over the hips, then falls steeply to a low neck.
  const stations = [
    { at: [0, 0.39, -1.22], w: 0.044, h: 0.052 },
    { at: [0, 0.43, -1.02], w: 0.09, h: 0.1 },
    { at: [0, 0.5, -0.78], w: 0.16, h: 0.18 },
    { at: [0, 0.57, -0.48], w: 0.26, h: 0.3 },
    { at: [0, 0.6, -0.2], w: 0.38, h: 0.42 },
    { at: [0, 0.54, 0.04], w: 0.44, h: 0.44 },
    { at: [0, 0.45, 0.25], w: 0.38, h: 0.38 },
    { at: [0, 0.38, 0.4], w: 0.26, h: 0.27 },
    { at: [0, 0.34, 0.52], w: 0.17, h: 0.18 },
    { at: [0, 0.31, 0.61], w: 0.12, h: 0.12 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[4].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 8, role: "tail", group: "tail" });
  const zAt = (t: number) => curve.at(t).z;
  const belly = (z: number) => Math.sin(Math.PI * Math.min(Math.max((z + 0.75) / 1.25, 0), 1));
  const stripe = (t: number) => {
    const z = zAt(t);
    return z > -1.12 && z < 0.52 && ((z + 1.12) / 0.12) % 1 > 0.6 ? STRIPE : HIDE;
  };
  const body = b.loft(stations, {
    bone: [tail, hips, spine],
    color: stripe,
    sectors: [
      [-58, 58, BACK],
      [118, 242, BELLY],
    ],
    shift: (t) => [0, -0.03 * belly(zAt(t))],
    sides: 12,
    group: "body",
  });

  // ---------------------------------------------------------------- head
  const headDir: V3 = [0, -0.35, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  // Head-local (+Z forward, +Y up): z, centre y, full width, full height. Small, low and narrow: a domed
  // cranium behind the eyes tapering fast to the beak.
  const upperKeys = [
    [-0.03, 0.012, 0.085, 0.085],
    [0.02, 0.016, 0.088, 0.08],
    [0.06, 0.006, 0.07, 0.062],
    [0.1, -0.006, 0.052, 0.046],
    [0.13, -0.012, 0.04, 0.036],
  ] as const;
  const upper = b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: skull,
      color: HIDE,
      sectors: [
        [-55, 55, BACK],
        [140, 220, MOUTH],
      ],
      sides: 8,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.026, -0.01],
    aim: [0, -0.04, 0.13],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [-0.02, -0.036, 0.074, 0.036],
    [0.04, -0.042, 0.064, 0.032],
    [0.09, -0.043, 0.046, 0.026],
    [0.105, -0.042, 0.036, 0.021],
  ] as const;
  const lower = b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: jaw,
      color: HIDE,
      sectors: [
        [-40, 40, MOUTH],
        [125, 235, BELLY],
      ],
      sides: 8,
      group: "jaw",
    },
  );

  // Beak: a turned keratin sheath on the tip of each jaw, the upper one bigger and hooked down over the lower.
  b.lathe(
    [
      [0, -0.012, "sharp"],
      [0.021, -0.012],
      [0.023, 0.008],
      [0.013, 0.028],
      [0, 0.038, "sharp"],
    ],
    {
      at: head.p([0, -0.013, 0.128]),
      axis: head.d([0, -0.4, 1]),
      segments: 8,
      smoothing: 1,
      color: BEAK,
      bone: skull,
      group: "head",
    },
  );
  b.lathe(
    [
      [0, -0.008, "sharp"],
      [0.016, -0.008],
      [0.017, 0.007],
      [0.009, 0.02],
      [0, 0.025, "sharp"],
    ],
    {
      at: head.p([0, -0.042, 0.108]),
      axis: head.d([0, 0.15, 1]),
      segments: 8,
      smoothing: 1,
      color: BEAK,
      bone: jaw,
      group: "jaw",
    },
  );

  // Leaf-shaped cheek teeth along both jaw margins, seen when the jaw drops.
  const leaf: OutlinePoint[] = [
    [-0.0035, 0, "sharp"],
    [0.0035, 0, "sharp"],
    [0.0028, 0.0045],
    [0, 0.008, "sharp"],
    [-0.0028, 0.0045],
  ];
  const upperSurface = b.surface(upper);
  const lowerSurface = b.surface(lower);
  const upperHalfW = upperKeys.map((k) => [k[0], k[2] / 2] as const);
  const lowerHalfW = lowerKeys.map((k) => [k[0], k[2] / 2] as const);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 0.03 + i * 0.017;
      const up = upperSurface.ray(head.p([s * interp(upperHalfW, z) * 0.62, -0.2, z]), head.d([0, 1, 0]));
      if (up)
        b.extrude(leaf, {
          at: up.moved([0, 0.002, 0]),
          x: head.d([0, 0, 1]),
          y: head.d([0, -1, 0]),
          thickness: 0.003,
          smoothing: 0,
          color: TOOTH,
          bone: skull,
          group: "head",
        });
      const down = lowerSurface.ray(head.p([s * interp(lowerHalfW, z) * 0.6, 0.2, z]), head.d([0, -1, 0]));
      if (down)
        b.extrude(leaf, {
          at: down.moved([0, 0.002, 0]),
          x: head.d([0, 0, 1]),
          y: head.d([0, 1, 0]),
          thickness: 0.003,
          smoothing: 0,
          color: TOOTH,
          bone: jaw,
          group: "jaw",
        });
    }
  }

  // Eyes: an amber ball with a round pupil, framed by a turned lid ring (a lathe loop that never touches its axis).
  for (const s of [1, -1]) {
    const gaze = head.d([s * 0.85, 0.3, 0.25]).normalize();
    const eye = head.p([s * 0.038, 0.024, 0.02]);
    b.part(new SphereGeometry(0.014, 8, 5), EYE, { bone: skull, at: eye, group: "head" });
    b.part(new SphereGeometry(0.007, 6, 4), PUPIL, { bone: skull, at: offset(eye, gaze, 0.0105), group: "head" });
    b.lathe(
      [
        [0.009, -0.003],
        [0.016, -0.006],
        [0.019, 0.0],
        [0.014, 0.005],
        [0.0095, 0.003],
      ],
      { at: offset(eye, gaze, 0.006), axis: gaze, segments: 8, smoothing: 0, color: HIDE, bone: skull, group: "head" },
    );
    // Nostrils just behind the beak, seated on the snout's skin.
    const nose = upperSurface.ray(head.p([s * 0.06, 0.03, 0.108]), head.d([-s, -0.5, 0]));
    if (nose)
      b.stick(new SphereGeometry(0.5, 6, 4), PUPIL, nose, {
        bone: skull,
        flow: head.d([0, 0, 1]),
        scale: [0.007, 0.004, 0.012],
        embed: 0.5,
        group: "head",
      });
  }

  // ---------------------------------------------------------------- legs
  // Pillar legs on turned, elephantine pads: a lathe with a flat sole, a bulging rim and a waist into the leg, with
  // hoof nails ringed around its front. Hind legs are long (knee forward, ankle back), forelegs short and columnar.
  const hoof: OutlinePoint[] = [
    [-0.016, 0, "sharp"],
    [0.014, 0, "sharp"],
    [0.022, 0.012],
    [0.01, 0.034],
    [-0.016, 0.036, "sharp"],
  ];
  const legTubes: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs = [
      {
        kind: "hind",
        parent: hips,
        root: [s * 0.13, 0.52, -0.18] as V3,
        foot: [s * 0.16, 0.06, -0.14] as V3,
        lengths: [0.23, 0.19, 0.08],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ] as V3[],
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        rx: [0.115, 0.075, 0.056, 0.054],
        ry: [0.13, 0.08, 0.058, 0.056],
        pad: [0.07, 0.078],
        nails: { count: 3, span: 36 },
      },
      {
        kind: "front",
        parent: spine.joints[2],
        root: [s * 0.12, 0.37, 0.34] as V3,
        foot: [s * 0.15, 0.055, 0.38] as V3,
        lengths: [0.15, 0.13, 0.05],
        bends: [
          [0, 0, -1],
          [0, 0, 1],
        ] as V3[],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        rx: [0.086, 0.062, 0.05, 0.048],
        ry: [0.092, 0.064, 0.05, 0.048],
        pad: [0.058, 0.066],
        nails: { count: 5, span: 62 },
      },
    ];
    for (const leg of legs) {
      const points = limb(leg.root, leg.foot, leg.lengths, leg.bends);
      const end = points[points.length - 1];
      const chain = b.chain(`leg${leg.kind === "hind" ? "H" : "F"}${side}`, [...points, [end.x, end.y, end.z + 0.06]], {
        parent: leg.parent,
        names: leg.names,
        role: "leg",
        contact: [end.x, 0, end.z],
        group: `leg${leg.kind}${side}`,
      });
      // The tube stops at the foot joint; radii are keyed at the hip, knee, ankle and foot.
      const rx = leg.rx.map((r, i) => [chain.ts[i], r] as const);
      const ry = leg.ry.map((r, i) => [chain.ts[i], r] as const);
      legTubes.push(
        b.sweep(chain, (t) => [interp(rx, t), interp(ry, t)], {
          to: chain.ts[3],
          color: HIDE,
          sides: 8,
          group: `leg${leg.kind}${side}`,
        }),
      );
      const footJoint = chain.joints[3];
      const [padR, padH] = leg.pad;
      const pad = b.lathe(
        [
          [0, 0, "sharp"],
          [padR, 0, "sharp"],
          [padR * 1.07, padH * 0.22],
          [padR * 0.97, padH * 0.6],
          [padR * 0.78, padH],
          [0, padH, "sharp"],
        ],
        {
          at: [end.x, 0, end.z],
          segments: 10,
          smoothing: 1,
          color: PAD,
          bone: footJoint,
          group: `leg${leg.kind}${side}`,
        },
      );
      b.ring(
        frame(pad, [0, 1, 0]),
        { count: leg.nails.count, radius: padR * 0.92, fromDeg: -leg.nails.span, toDeg: leg.nails.span },
        (item) =>
          b.extrude(hoof, {
            at: item,
            x: item.outward,
            y: [0, 1, 0],
            thickness: leg.kind === "hind" ? 0.03 : 0.022,
            bevel: 0.006,
            smoothing: 1,
            detail: 0.34,
            color: NAIL,
            bone: footJoint,
            group: `leg${leg.kind}${side}`,
          }),
      );
    }
  }

  // ---------------------------------------------------------------- dorsal plates
  // Walk from the neck to the tail; each step is half a plate so neighbours in one row never touch, and the rows
  // alternate sides. Size peaks over the hips and the base of the tail.
  const back = b.surface(body);
  const size: [number, number][] = [
    [-0.9, 0.3],
    [-0.7, 0.55],
    [-0.45, 0.92],
    [-0.25, 1],
    [0.0, 0.86],
    [0.2, 0.62],
    [0.4, 0.4],
    [0.58, 0.24],
  ];
  let side = 1;
  for (let z = 0.58; z > -0.9; side = -side) {
    const k = interp(size, z);
    const L = 0.2 * k + 0.025;
    const H = 0.24 * k + 0.02;
    const bury = 0.02 + 0.025 * k;
    const hit = back.ray([side * (0.012 + 0.024 * k), 2, z], [0, -1, 0]);
    const ahead = back.ray([0, 2, z + 0.02], [0, -1, 0]);
    const behind = back.ray([0, 2, z - 0.02], [0, -1, 0]);
    if (hit && ahead && behind) {
      const x = behind.at.clone().sub(ahead.at).normalize();
      const y = new Vector3(side * 0.16, 1, 0);
      const kind =
        z > 0.33 ? PLATE_KINDS.neck : z > -0.08 ? PLATE_KINDS.back : z > -0.55 ? PLATE_KINDS.hip : PLATE_KINDS.tail;
      const outline = plateOutline(L, H, bury, kind);
      const t0 = 0.012 + 0.018 * k;
      const t1 = 0.004;
      const group = z > -0.2 ? "body" : "tail";
      b.extrude(outline, {
        at: hit,
        x,
        y,
        thickness: [t0, t1],
        bevel: 0.005,
        smoothing: 1,
        detail: 0.5,
        color: RIM,
        group,
      });
      // The ochre core: the same drawing shrunk toward its root, standing proud of both faces by the same margin.
      const inner = outline.map(([u, v, sharp]): OutlinePoint => {
        const p: [number, number] = [u * 0.78, -bury + (v + bury) * 0.78];
        return sharp ? [...p, sharp] : p;
      });
      const e = 0.003;
      const core = b.extrude(inner, {
        at: hit,
        x,
        y,
        thickness: [t0 + e, t0 + 0.78 * (t1 - t0) + e],
        bevel: 0.004,
        smoothing: 1,
        detail: 0.5,
        color: PLATE,
        group,
      });
      // Vascular grooves fanning up both faces of the bigger plates. The core's faces are planar, and at height v
      // the core is `e` thicker than the blade, so a rod between two face points lies on the face.
      if (k > 0.45) {
        const lean = kind.lean * L;
        const face = (u: number, v: number, s: number) =>
          core.moved([u, v, (s * (t0 + e + ((t1 - t0) * (v + bury)) / (H + bury))) / 2]);
        for (const s of [1, -1])
          for (const [u, v] of [
            [0.62 * lean, 0.6 * H],
            [-0.28 * L + 0.3 * lean, 0.4 * H],
            [0.24 * L + 0.3 * lean, 0.34 * H],
          ])
            b.rod(face(0.05 * lean, 0.03 * H, s), face(u, v, s), [0.0024, 0.0012], { color: RIM, sides: 4, group });
      }
    }
    z -= 0.5 * L;
  }

  // ---------------------------------------------------------------- thagomizer
  // Four curved bony spikes near the tail tip, splayed out, up and back, ivory with dark tips. The tail runs toward
  // -Z, so on its dorsal clock positive angles lie on the creature's left.
  for (const s of [1, -1])
    for (const [i, t, dir, len] of [
      [1, 0.8, [s * 1, 0.55, -0.3], 0.19],
      [2, 0.9, [s * 0.75, 0.55, -0.75], 0.2],
    ] as const) {
      const base = body.at(hipsT * (1 - t), s * 58);
      const d = new Vector3(...dir).normalize();
      const tip = offset(offset(base.at, d, len), [0, 1, 0], 0.03);
      b.sprout(
        `spike${s > 0 ? "L" : "R"}${i}`,
        base,
        bezier(base.at, offset(base.at, d, len * 0.55), tip),
        [0.022, 0.003],
        {
          count: 0,
          caps: { end: "point" },
          bands: [
            [0.72, SPIKE],
            [1, SPIKE_TIP],
          ],
          sides: 7,
          group: "tail",
        },
      );
    }

  // ---------------------------------------------------------------- skin details
  // Throat ossicles: a pavement of turned, faceted studs under the neck.
  const skin = b.surface(body);
  const stud: OutlinePoint[] = [
    [0, -0.004, "sharp"],
    [0.011, -0.004, "sharp"],
    [0.011, 0.002],
    [0.007, 0.007],
    [0, 0.008, "sharp"],
  ];
  for (const hit of skin.scatter(22, {
    rng: random,
    minDist: 0.022,
    filter: (h) => h.n.y < -0.35 && h.at.z > 0.44,
  }))
    b.lathe(stud, { at: hit, axis: hit, segments: 6, spin: random() * 45, smoothing: 0, color: STUD, group: "body" });

  // Rounded tubercles: pale and dark on the flanks and the base of the tail, dark along the back between the plate
  // rows, and smaller ones down the legs.
  const tubercle: OutlinePoint[] = [
    [0, -0.005, "sharp"],
    [0.013, -0.005, "sharp"],
    [0.012, 0.003],
    [0, 0.009, "sharp"],
  ];
  const trunk = b.surface(body);
  for (const [surface, count, minDist, filter, colors] of [
    [trunk, 46, 0.06, (h: Hit) => Math.abs(h.n.y) < 0.6 && h.at.z > -0.7 && h.at.z < 0.4, [BUMP, STUD]],
    [trunk, 30, 0.05, (h: Hit) => h.n.y >= 0.6 && Math.abs(h.at.x) > 0.06 && h.at.z > -0.8 && h.at.z < 0.45, [BUMP]],
    [b.surface(legTubes), 36, 0.045, (h: Hit) => h.at.y > 0.12 && h.n.y > -0.3, [BUMP, STUD]],
  ] as const)
    for (const hit of surface.scatter(count, { rng: random, minDist, filter }))
      b.lathe(tubercle, {
        at: hit,
        axis: hit,
        segments: 6,
        smoothing: 0,
        color: colors[Math.floor(random() * colors.length)],
      });

  // Rest pose: the jaw a little open.
  b.pose(jaw, { axis: head.d([1, 0, 0]), deg: 12 });
  return b.root;
}
