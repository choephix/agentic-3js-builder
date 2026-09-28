// Griffin: an eagle's head, wings and forelegs on a lion's hindquarters and tail, lion-sized (3.2 m from beak to tail
// tuft, 4.2 m wingspan). One continuous lion tube is lofted from the tail tip through the spine and up the neck, with
// the eagle half feathered in extruded contour feathers laid in shingled rows on the real skin of the neck, chest, nape
// chest, nape and forelegs, so they bend with it. The wings are spread in a shallow V for rigging: each is an arm
// chain (shoulder, elbow, wrist) carrying layered extruded feathers (primaries, secondaries, tertials and three rows
// of coverts with dark shaft streaks), and the nine primaries hang on three digit joints so the hand fans and folds.
// The hooked beak is a tapering bezier sweep over a lathed cere; the eyes, the leg cuffs, the foot pads, the lion
// paws and the tail tuft are lathes. Ears, brow shelves and the tuft's hair locks are extrudes.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, DEG, lerp, offset } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import type { Part } from "../src/parts";
import type { Joint } from "../src/skeleton";
import { bezier, catmull } from "../src/path";

export const meta = {
  name: "Griffin",
  description:
    "A lion-bodied griffin with a white eagle head and hooked beak, spread layered wings with fingered primaries, taloned eagle forelegs and a tufted lion tail.",
  builtBy: "Claude Opus 5.5",
};

const LION = "#c9954f";
const LION_BELLY = "#e8cc98";
const LION_BACK = "#b7803f";
const TUFT = "#5a3a22";
const TUFT_DARK = "#3b2516";
const WHITE = "#f3efe6";
const WHITE_SHADE = "#dcd4c3";
const CHEST = "#9c6a36";
const CHEST_DARK = "#7d5129";
const CHEST_LIGHT = "#c89a58";
const WING_ARM = "#4a3121";
const PRIMARY = "#2a1d16";
const SECONDARY = "#3a281c";
const TERTIAL = "#5a3d27";
const GOLD = "#c9973f";
const GOLD_LIGHT = "#ddb467";
const STREAK = "#4a3121";
const RACHIS = "#d9c9a3";
const BEAK = "#eab53b";
const BEAK_TIP = "#6b5238";
const CERE = "#f5d36a";
const IRIS = "#f0c43c";
const PUPIL = "#111111";
const EYE_SKIN = "#3d3530";
const GLINT = "#ffffff";
const EAR_IN = "#c79f93";
const SCUTE = "#e7b23d";
const SCUTE_DARK = "#c48f26";
const TALON = "#1c1714";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

/** A symmetric outline: the right half from bottom to top, then the points on the centre line, then the left half. */
function mirrored(right: readonly OutlinePoint[], centre: readonly OutlinePoint[]): OutlinePoint[] {
  const left = [...right].reverse().map((p): OutlinePoint => (p.length === 3 ? [-p[0], p[1], "sharp"] : [-p[0], p[1]]));
  return [...right, ...centre, ...left];
}

/** A flight feather drawn up its shaft, round-tipped. `w` is the half width. */
const quill = (len: number, w: number) =>
  mirrored(
    [
      [0.3 * w, 0, "sharp"],
      [0.85 * w, 0.22 * len],
      [w, 0.7 * len],
      [0.6 * w, 0.94 * len],
    ],
    [[0, len]],
  );

/** An eagle's outer primary: broad at the base, then notched into a narrow "finger" tip. */
const fingered = (len: number, w: number) =>
  mirrored(
    [
      [0.3 * w, 0, "sharp"],
      [0.85 * w, 0.2 * len],
      [w, 0.46 * len],
      [0.55 * w, 0.6 * len],
      [0.48 * w, 0.9 * len],
    ],
    [[0, len]],
  );

/** A short pointed contour feather for the body, neck and legs. */
const contour = (len: number, w: number) =>
  mirrored(
    [
      [0.35 * w, 0, "sharp"],
      [w, 0.42 * len],
      [0.65 * w, 0.8 * len],
    ],
    [[0, len]],
  );

/** The dark shaft streak down the middle of a covert. */
const streak = (len: number, w: number) =>
  mirrored(
    [
      [0.08 * w, 0.05 * len, "sharp"],
      [0.2 * w, 0.4 * len],
      [0.13 * w, 0.72 * len],
    ],
    [[0, 0.86 * len]],
  );

export default function build() {
  const b = createBuilder({ name: "griffin" });

  // ---- Lion body, tail and neck ----------------------------------------------------------------------------------
  // One continuous tube runs from the tail tip through the breast and up the neck; w/h are full width and height.
  const stations = [
    { at: [0, 1.18, -1.9], w: 0.08, h: 0.1 },
    { at: [0, 1.0, -1.38], w: 0.12, h: 0.14 },
    { at: [0, 0.99, -0.76], w: 0.2, h: 0.22 },
    { at: [0, 1.02, -0.58], w: 0.46, h: 0.5 },
    { at: [0, 0.98, -0.2], w: 0.4, h: 0.44 },
    { at: [0, 1.02, 0.2], w: 0.48, h: 0.6 },
    { at: [0, 1.1, 0.46], w: 0.42, h: 0.52 },
    { at: [0, 1.17, 0.6], w: 0.26, h: 0.3 },
    { at: [0, 1.32, 0.62], w: 0.32, h: 0.32 },
    { at: [0, 1.5, 0.72], w: 0.26, h: 0.26 },
    { at: [0, 1.62, 0.8], w: 0.2, h: 0.2 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[3];
  const chestT = curve.knots[7];
  const neckT = curve.knots[8];
  const hips = b.joint("hips", { at: stations[3].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, chestT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", curve.slice(chestT, 1), {
    parent: chest,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 8, role: "tail", group: "tail" });
  const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
  const zAt = (t: number) => curve.at(t).z;
  const body = b.loft(stations, {
    bone: [tail, hips, spine, neck],
    color: (t) => (t < hipsT ? LION : t < neckT ? LION : WHITE),
    bands: [
      [0.56, LION],
      [neckT, CHEST_LIGHT],
      [1, WHITE],
    ],
    sectors: [
      [-40, 40, LION_BACK],
      [130, 230, LION_BELLY],
    ],
    shift: (t) => [0, -0.05 * bump(t, 0.66, 0.14) + 0.02 * bump(t, 0.42, 0.1)],
    sides: 16,
    group: "body",
  });

  // One contour feather lying on the skin at `p` (a surface frame, +Y out), its tip flowing along `flow` and lifted a
  // little off the surface, so rows of them shingle.
  const shingle = (p: Frame, flow: Vector3, len: number, w: number, color: string, lift: number, group: string) => {
    const n = p.axis;
    const y = flow
      .clone()
      .addScaledVector(n, -flow.dot(n))
      .normalize()
      .multiplyScalar(Math.cos(14 * DEG))
      .addScaledVector(n, Math.sin(14 * DEG))
      .normalize();
    return b.extrude(contour(len, w), {
      at: p.moved([0, lift, 0]),
      x: new Vector3().crossVectors(y, n).normalize(),
      y,
      thickness: [0.008, 0.003],
      smoothing: 1,
      color,
      group,
    });
  };

  // The round front of the breast, shingled downward.
  const breast = b.surface(body).around([0, 1.1, 0.45]);
  for (const [el, n0] of [
    [28, 4],
    [8, 5],
    [-12, 6],
    [-32, 5],
    [-52, 4],
  ])
    for (let i = 0; i < n0; i++) {
      const hit = breast.at((i - (n0 - 1) / 2) * 17, el);
      if (hit) shingle(hit, new Vector3(0, -1, -0.3), 0.15, 0.056, i % 2 ? CHEST : CHEST_DARK, 0.004, "body");
    }

  // The eagle half: rows of golden-brown contour feathers over the chest and shoulders, fading into the tawny loin.
  for (let r = 0; r < 8; r++) {
    const t = 0.995 - r * 0.063;
    const bodyT = hipsT + t * (neckT - hipsT);
    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = body.at(bodyT, ((i + (r % 2) * 0.5) * 360) / count);
      // Dark brown breast in a regular two-tone scale pattern, lightening toward the loin.
      const color = (i + r) % 2 ? (r < 6 ? CHEST : CHEST_LIGHT) : r < 3 ? CHEST_DARK : r < 6 ? CHEST : CHEST_LIGHT;
      shingle(p, p.tangent.negate(), 0.17, 0.056, color, 0.002 + 0.003 * ((i + r) % 2), "body");
    }
  }

  // ---- Head ------------------------------------------------------------------------------------------------------
  // Hackles: white at the throat, golden where the neck meets the breast, every tip pointing down the neck.
  for (let r = 0; r < 9; r++) {
    const t = 0.95 - r * 0.1;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const p = body.at(neckT + t * (1 - neckT), ((i + (r % 2) * 0.5) * 360) / count);
      const color = t > 0.45 ? (i % 2 ? WHITE : WHITE_SHADE) : t > 0.25 ? CHEST_LIGHT : CHEST;
      const lift = 0.002 + 0.003 * ((i + r) % 2);
      shingle(p, p.tangent.negate(), 0.12 + 0.05 * (1 - t), 0.045 + 0.01 * (1 - t), color, lift, "neck");
    }
  }

  const headDir: V3 = [0, -0.2, 1];
  const skull = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: headDir, role: "head", group: "head" });
  // Head units: +x the griffin's left, +y up, +z forward along the head.
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const cranium = b.loft(
    [
      { at: head.p([0, -0.01, -0.12]), w: 0.17, h: 0.18 },
      { at: head.p([0, 0.03, -0.02]), w: 0.22, h: 0.21 },
      { at: head.p([0, 0.035, 0.07]), w: 0.2, h: 0.18 },
      { at: head.p([0, 0.01, 0.13]), w: 0.14, h: 0.13 },
    ],
    { bone: skull, color: WHITE, sides: 16, group: "head" },
  );
  // Nape feathers sweeping back over the top of the neck.
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 9; i++) {
      const p = cranium.at(0.1 + r * 0.13, -120 + (i + (r % 2) * 0.5) * 30);
      shingle(p, p.tangent.negate(), 0.1, 0.035, i % 2 ? WHITE : WHITE_SHADE, 0.002 + 0.002 * (i % 2), "head");
    }

  // Hooked upper beak: one tapering sweep along the culmen that curls down into the hook.
  const beakPath = bezier(
    head.p([0, 0.02, 0.09]),
    head.p([0, 0.045, 0.22]),
    head.p([0, 0.01, 0.33]),
    head.p([0, -0.1, 0.31]),
  );
  b.sweep(
    beakPath,
    (t) => {
      const k = Math.pow(1 - t, 0.85);
      return [0.048 * k + 0.004, 0.058 * k + 0.004];
    },
    {
      bone: skull,
      bands: [
        [0.72, BEAK],
        [1, BEAK_TIP],
      ],
      caps: { start: "round", end: "point" },
      sides: 14,
      group: "head",
    },
  );
  // The waxy cere wrapping the base of the beak: a lathed collar with both walls drawn.
  const cereAxis = beakPath.tangentAt(0.12);
  const cere = b.lathe(
    [
      [0.046, 0],
      [0.064, 0.004],
      [0.063, 0.03],
      [0.053, 0.052],
      [0.044, 0.046],
      [0.048, 0.02],
    ],
    {
      at: offset(beakPath.at(0.1), cereAxis, -0.03),
      axis: cereAxis,
      bone: skull,
      smoothing: 1,
      color: CERE,
      group: "head",
      name: "cere",
    },
  );
  const cereSkin = b.surface(cere);
  // Lower mandible on its own jaw joint, tucked under the hook.
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.03, 0.06],
    aim: [0, -0.02, 0.25],
    role: "jaw",
    group: "jaw",
  });
  b.sweep([jaw.at, head.p([0, -0.02, 0.25])], (t) => [0.044 - 0.028 * t, 0.024 - 0.012 * t], {
    bone: jaw,
    color: BEAK,
    sides: 12,
    group: "jaw",
  });

  const face = b.surface(cranium);
  for (const [s, side] of SIDES) {
    // Nostril slit on the side of the cere.
    const nostril = cereSkin.ray(head.p([s * 0.3, 0.035, 0.14]), head.d([-s, 0, 0]));
    if (nostril)
      b.stick(new SphereGeometry(0.009, 8, 6), TALON, nostril, {
        embed: 0.5,
        scale: [1.6, 1, 0.8],
        bone: skull,
        group: "head",
      });

    // Eye: a lathed ring of dark bare skin, a golden iris dome and a black pupil dome, gazing out and forward.
    const socket = face.ray(head.p([s * 0.4, 0.045, 0.055]), head.d([-s, 0, 0]));
    if (!socket) throw new Error("griffin: no skull under the eye");
    const gaze = head.d([s * 0.8, 0.05, 0.6]).normalize();
    b.lathe(
      [
        [0.024, 0],
        [0.036, 0],
        [0.034, 0.008],
        [0.027, 0.012],
      ],
      {
        at: offset(socket, gaze, -0.004),
        axis: gaze,
        bone: skull,
        color: EYE_SKIN,
        group: "head",
        name: `eyeRing${side}`,
      },
    );
    const irisAt = offset(socket, gaze, -0.006);
    b.lathe(
      [
        [0, 0],
        [0.027, 0],
        [0.025, 0.008],
        [0.016, 0.015],
        [0, 0.018],
      ],
      { at: irisAt, axis: gaze, bone: skull, smoothing: 1, color: IRIS, group: "head", name: `eye${side}` },
    );
    b.lathe(
      [
        [0, 0],
        [0.012, 0],
        [0.01, 0.004],
        [0, 0.0065],
      ],
      { at: offset(irisAt, gaze, 0.013), axis: gaze, bone: skull, smoothing: 1, color: PUPIL, group: "head" },
    );
    b.part(new SphereGeometry(0.004, 8, 6), GLINT, {
      bone: skull,
      at: offset(offset(irisAt, gaze, 0.019), head.d([0, 1, 0]), 0.006),
      group: "head",
    });

    // The eagle's scowl: a flat brow shelf jutting out over the eye.
    b.extrude(
      [
        [-0.075, -0.025, "sharp"],
        [0.07, -0.025, "sharp"],
        [0.06, 0.008],
        [0.025, 0.03],
        [-0.035, 0.028],
      ],
      {
        at: offset(offset(socket, head.d([0, 1, 0]), 0.03), head.d([-s, 0, 0]), 0.01),
        x: head.d([0, 0, 1]),
        y: head.d([s, -0.25, 0]),
        thickness: 0.018,
        bevel: 0.006,
        smoothing: 1,
        bone: skull,
        color: WHITE_SHADE,
        group: "head",
        name: `brow${side}`,
      },
    );

    // Upright pointed ears behind the eyes, facing forward, with a pale inner ear.
    const ear = b.extrude(
      [
        [-0.035, 0, "sharp"],
        [0.038, 0, "sharp"],
        [0.034, 0.07],
        [0.004, 0.15, "sharp"],
        [-0.03, 0.075],
      ],
      {
        at: head.p([s * 0.07, 0.09, -0.06]),
        x: head.d([s, 0.15, 0.35]),
        y: head.d([s * 0.3, 1, -0.35]),
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        bone: skull,
        color: WHITE_SHADE,
        group: "head",
        name: `ear${side}`,
      },
    );
    b.extrude(
      [
        [-0.02, 0.02],
        [0.022, 0.02],
        [0.02, 0.07],
        [0.003, 0.12, "sharp"],
        [-0.018, 0.07],
      ],
      {
        at: ear.moved([0, 0, s * 0.0082]),
        x: ear.dir([1, 0, 0]),
        y: ear.dir([0, 1, 0]),
        thickness: 0.002,
        smoothing: 1,
        bone: skull,
        color: EAR_IN,
        group: "head",
      },
    );
  }

  // ---- Wings ----------------------------------------------------------------------------------------------------
  // Each wing lies in a plane raised 12° outward. u runs 0..3 along the arm: humerus, forearm, hand.
  const DIHEDRAL = 12 * DEG;
  const remigeDeg = [106, 95, 86, 22]; // feather direction at u = 0..3: degrees from the span toward the back
  for (const [s, side] of SIDES) {
    const g = `wing${side}`;
    const normal = new Vector3(-s * Math.sin(DIHEDRAL), Math.cos(DIHEDRAL), 0);
    const span = new Vector3(s * Math.cos(DIHEDRAL), Math.sin(DIHEDRAL), 0);
    const back = new Vector3(0, 0, -1);
    const onWing = (out: number, z: number) => new Vector3(s * 0.16, 1.34, 0).addScaledVector(span, out).setZ(z);
    const keys = [onWing(0, 0.26), onWing(0.46, 0.1), onWing(0.96, 0.22), onWing(1.36, 0.13)];
    const arm = b.chain(g, keys, {
      parent: chest,
      up: normal,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
      group: g,
    });
    b.sweep(arm, (t) => [0.075 - 0.04 * t, 0.05 - 0.024 * t], { color: WING_ARM, group: g });

    const segment = (u: number) => Math.min(2, Math.floor(u));
    const along = (u: number) => lerp(keys[segment(u)], keys[segment(u) + 1], u - segment(u));
    const degAt = (u: number) => {
      const i = segment(u);
      return remigeDeg[i] + (remigeDeg[i + 1] - remigeDeg[i]) * (u - i);
    };
    const toward = (deg: number) =>
      span
        .clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(back, Math.sin(deg * DEG));
    // A feather lying flat in the wing plane, rooted `behind` the bone line and `lift` above it.
    const feather = (
      u: number,
      behind: number,
      lift: number,
      outline: OutlinePoint[],
      thickness: readonly [number, number],
      color: string,
      bone: Joint,
    ) => {
      const y = toward(degAt(u));
      return b.extrude(outline, {
        at: along(u).addScaledVector(back, behind).addScaledVector(normal, lift),
        x: new Vector3().crossVectors(y, normal),
        y,
        thickness,
        smoothing: 1,
        bone,
        color,
        group: g,
      });
    };
    // A pale shaft laid along the top face of a flight feather.
    const shaft = (f: Part, len: number, thickness: readonly [number, number], bone: Joint) => {
      const base = f.local([0, 0.02, thickness[0] / 2 + 0.0006]);
      const tip = f.local([0, 0.9 * len, thickness[1] / 2 + 0.0006]);
      const l = base.distanceTo(tip);
      b.extrude(
        [
          [-0.0045, 0],
          [0.0045, 0],
          [0.0012, l],
          [-0.0012, l],
        ],
        { at: base, x: f.dir([1, 0, 0]), y: tip.sub(base), thickness: 0.0012, bone, color: RACHIS, group: g },
      );
    };
    // Coverts: gold with a dark shaft streak laid on the sloping top face; the lesser coverts are dark all over.
    const covert = (u: number, behind: number, lift: number, len: number, w: number, color: string, bone: Joint) => {
      const th = [0.008, 0.003] as const;
      const f = feather(u, behind, lift, quill(len, w), th, color, bone);
      if (color === STREAK) return;
      const base = f.local([0, 0, th[0] / 2 + 0.0006]);
      const tip = f.local([0, len, th[1] / 2 + 0.0006]);
      b.extrude(streak(base.distanceTo(tip), w), {
        at: base,
        x: f.dir([1, 0, 0]),
        y: tip.sub(base),
        thickness: 0.0012,
        bone,
        color: STREAK,
        group: g,
      });
    };

    // Primaries: nine from the hand, fanned from straight back to far out, in three groups on digit joints.
    const PRIM = [0.74, 0.8, 0.86, 0.9, 0.92, 0.92, 0.88, 0.8, 0.68];
    const primTh = [0.011, 0.004] as const;
    for (let k = 0; k < 3; k++) {
      const midU = 2.02 + ((3 * k + 1) / 8) * 0.96;
      const root = along(midU);
      const digit = b.chain(`primaries${k + 1}${side}`, [root, offset(root, toward(degAt(midU)), PRIM[3 * k + 1])], {
        parent: arm.joints[2],
        up: normal,
        names: [`primaries${k + 1}${side}`],
        role: "digit",
        group: g,
      }).joints[0];
      for (let j = 0; j < 3; j++) {
        const i = 3 * k + j;
        const u = 2.02 + (i / 8) * 0.96;
        const outline = i >= 5 ? fingered(PRIM[i], 0.07) : quill(PRIM[i], 0.075);
        const f = feather(u, 0, 0.005 * (i % 2), outline, primTh, PRIMARY, digit);
        shaft(f, PRIM[i], primTh, digit);
      }
    }
    // Secondaries along the forearm, straight back.
    const secTh = [0.011, 0.004] as const;
    for (let i = 0; i < 10; i++) {
      const u = 1.04 + (i / 9) * 0.92;
      const len = 0.6 - 0.03 * Math.cos((i / 9) * Math.PI);
      const f = feather(u, 0, 0.014 + 0.005 * (i % 2), quill(len, 0.062), secTh, SECONDARY, arm.joints[1]);
      shaft(f, len, secTh, arm.joints[1]);
    }
    // Tertials along the humerus, angled in toward the back.
    for (let i = 0; i < 5; i++) {
      const u = 0.15 + i * 0.19;
      const len = 0.36 + 0.05 * i;
      feather(u, 0, 0.028 + 0.005 * (i % 2), quill(len, 0.066), secTh, TERTIAL, arm.joints[0]);
    }
    // Three rows of coverts over the feather roots and the arm: greater and median gold, lesser dark.
    for (let i = 0; i < 17; i++) {
      const u = 0.3 + (i / 16) * 2.58;
      covert(u, 0.035, 0.042 + 0.004 * (i % 2), u > 2 ? 0.27 : 0.32, 0.05, GOLD, arm.joints[segment(u)]);
    }
    for (let i = 0; i < 14; i++) {
      const u = 0.2 + (i / 13) * 2.45;
      covert(u, 0, 0.054 + 0.004 * (i % 2), 0.16, 0.043, GOLD_LIGHT, arm.joints[segment(u)]);
    }
    for (let i = 0; i < 16; i++) {
      const u = 0.05 + (i / 15) * 2.85;
      covert(u, -0.04, 0.066 + 0.004 * (i % 2), 0.12, 0.036, STREAK, arm.joints[segment(u)]);
    }
  }

  // ---- Eagle forelegs -------------------------------------------------------------------------------------------
  for (const [s, side] of SIDES) {
    const g = `legF${side}`;
    const foot = new Vector3(s * 0.21, 0.075, 0.5);
    const leg = b.chain(
      g,
      limb(
        [s * 0.17, 1.0, 0.36],
        foot,
        [0.38, 0.34, 0.3],
        [
          [0, 0, -1],
          [0, 0, 1],
        ],
      ),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
        contact: [s * 0.21, 0, 0.56],
        group: g,
      },
    );
    const wrist = leg.joints[2];
    const tCuff = leg.ts[2];
    // Feathered "trousers" down to the wrist, then a bare yellow tarsus ringed with scutes.
    const scutes: [number, string][] = [[tCuff, CHEST]];
    for (let k = 1; k <= 8; k++) scutes.push([tCuff + ((1 - tCuff) * k) / 8, k % 2 ? SCUTE : SCUTE_DARK]);
    const legTube = b.sweep(
      leg,
      (t) =>
        t < tCuff - 0.04
          ? 0.105 - 0.035 * (t / tCuff)
          : t < tCuff
            ? 0.072 - 0.75 * (t - tCuff + 0.04)
            : 0.042 - 0.006 * ((t - tCuff) / (1 - tCuff)),
      { bands: scutes, sides: 12, group: g },
    );
    for (let r = 0; r < 5; r++) {
      const t = 0.2 + r * ((tCuff - 0.24) / 4);
      for (let i = 0; i < 10; i++) {
        const p = legTube.at(t, (i + (r % 2) * 0.5) * 36);
        shingle(p, p.tangent, 0.13, 0.045, (i + r) % 2 ? CHEST_LIGHT : CHEST, 0.002 + 0.003 * (i % 2), g);
      }
    }
    // A flared feather cuff over the top of the tarsus.
    const cuffAt = leg.at(tCuff);
    b.lathe(
      [
        [0.046, 0],
        [0.082, 0],
        [0.076, 0.035],
        [0.066, 0.085],
        [0.052, 0.085],
        [0.05, 0.03],
      ],
      {
        at: offset(cuffAt, cuffAt, -0.02),
        axis: cuffAt.axis.clone().negate(),
        bone: leg.joints[1],
        segments: 11,
        color: CHEST,
        group: g,
        name: `cuff${side}`,
      },
    );

    // Foot: a lathed pad, three toes forward and the hallux back, each on two joints, each with a hooked talon.
    const ball = leg.at(1).at;
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.056, 0.02],
        [0.04, 0.046],
        [0, 0.056],
      ],
      { at: [ball.x, 0, ball.z], bone: wrist, smoothing: 1, color: SCUTE, group: g, name: `footPad${side}` },
    );
    [
      { yaw: s * 30, len: 0.15 },
      { yaw: 0, len: 0.17 },
      { yaw: -s * 26, len: 0.14 },
      { yaw: 180 - s * 12, len: 0.1 },
    ].forEach(({ yaw, len }, k) => {
      const d = new Vector3(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG));
      const knuckle = ball
        .clone()
        .addScaledVector(d, len * 0.45)
        .setY(0.027);
      const end = ball.clone().addScaledVector(d, len).setY(0.02);
      const toe = b.chain(`toe${k + 1}${side}`, catmull([ball, knuckle, end]), {
        parent: wrist,
        names: [`toe${k + 1}a${side}`, `toe${k + 1}b${side}`],
        role: "digit",
        group: g,
      });
      b.sweep(toe, [0.03, 0.025, 0.02], {
        bands: [
          [0.3, SCUTE],
          [0.5, SCUTE_DARK],
          [0.7, SCUTE],
          [0.85, SCUTE_DARK],
          [1, SCUTE],
        ],
        group: g,
      });
      const talonTip = offset(end, d, k === 3 ? 0.1 : 0.085).setY(0.004);
      b.sweep(bezier(end, offset(end, d, 0.05).setY(0.042), talonTip), [0.017, 0], {
        bone: toe.joints[1],
        color: TALON,
        caps: { start: "round", end: "point" },
        group: g,
      });
    });
  }

  // ---- Lion hind legs -------------------------------------------------------------------------------------------
  const pawR = 0.045;
  for (const [s, side] of SIDES) {
    const g = `legH${side}`;
    const hind = b.chain(
      g,
      [
        [s * 0.17, 0.98, -0.56],
        [s * 0.2, 0.6, -0.36],
        [s * 0.2, 0.25, -0.62],
        [s * 0.2, pawR, -0.53],
        [s * 0.2, pawR, -0.4],
      ],
      {
        parent: hips,
        names: ["hip", "knee", "hock", "paw"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.2, 0, -0.46],
        group: g,
      },
    );
    const [, t1, t2, t3] = hind.ts;
    // Heavy haunch, lean shank, slim ankle; ry runs front to back. The sweep stops at the paw joint, and its radius
    // t runs 0..1 over that range.
    const keys: [number, number, number][] = [
      [0, 0.16, 0.22],
      [t1 / t3, 0.085, 0.1],
      [t2 / t3, 0.055, 0.068],
      [1, pawR, pawR],
    ];
    const radius = (t: number): [number, number] => {
      const next = keys.findIndex((k) => k[0] > t);
      const i = next < 0 ? 2 : Math.min(next - 1, 2);
      const [ta, xa, ya] = keys[i];
      const [tb, xb, yb] = keys[i + 1];
      const k = Math.min(Math.max((t - ta) / (tb - ta), 0), 1);
      const e = k * k * (3 - 2 * k);
      return [xa + (xb - xa) * e, ya + (yb - ya) * e];
    };
    b.sweep(hind, radius, {
      to: t3,
      color: LION,
      sides: 16,
      caps: { start: "round", end: "flat" },
      group: g,
    });
    // A lathed paw dome under four round toes.
    const paw = hind.joints[3];
    const heel = hind.at(t3).at;
    const tip = hind.at(1).at;
    b.lathe(
      [
        [0, 0],
        [0.085, 0],
        [0.095, 0.025],
        [0.084, 0.056],
        [0.05, 0.08],
        [0, 0.085],
      ],
      {
        at: [heel.x, 0, (heel.z + tip.z) / 2],
        bone: paw,
        smoothing: 1,
        color: LION,
        group: g,
        name: `paw${side}`,
      },
    );
    for (const [dx, dz] of [
      [-0.05, -0.02],
      [-0.018, 0],
      [0.018, 0],
      [0.05, -0.02],
    ])
      b.part(new SphereGeometry(0.034, b.segments(12), b.segments(10)), LION, {
        bone: paw,
        at: [tip.x + dx * s, 0.034 * 0.85, tip.z + dz],
        scale: [1, 0.85, 1.15],
        group: g,
      });
  }

  // ---- Lion tail tuft --------------------------------------------------------------------------------------------
  const tuftBase = tail.at(0.94);
  b.lathe(
    [
      [0, 0],
      [0.045, 0.01],
      [0.08, 0.07],
      [0.075, 0.14],
      [0.045, 0.21],
      [0, 0.28, "sharp"],
    ],
    { at: tuftBase, axis: tuftBase, segments: 9, spin: 20, smoothing: 1, color: TUFT, group: "tail", name: "tuft" },
  );
  b.ring(tail.at(0.97), { count: 7, radius: 0.04, tilt: 45 }, (lock) =>
    b.extrude(
      [
        [-0.026, 0, "sharp"],
        [0.026, 0, "sharp"],
        [0.03, 0.07],
        [0.008, 0.17, "sharp"],
        [-0.016, 0.09],
      ],
      {
        at: lock,
        x: lock.dir([1, 0, 0]),
        y: lock.axis,
        thickness: [0.016, 0.004],
        smoothing: 2,
        color: TUFT_DARK,
        group: "tail",
        name: "tuftLock",
      },
    ),
  );

  // Rest pose: the beak just open so the two mandibles read apart.
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
