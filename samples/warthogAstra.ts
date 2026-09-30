// Warthog · Astra
// A stylised common warthog in a standing rest pose.
import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { catmull } from "../src/path";

export const meta = {
  name: "Warthog · Astra",
  description:
    "A low-poly common warthog with a broad head, facial warts, paired curved tusks, separate jaw, bristled mane, upright tufted tail, and split hooves.",
};

const HIDE = "#665b50";
const HIDE_DARK = "#403831";
const HIDE_BELLY = "#8a7868";
const SNOUT = "#28221d";
const WART = "#51463e";
const IVORY = "#e7dfcf";
const IVORY_TIP = "#fff8e8";
const MANE = "#251d19";
const MANE_TIP = "#4a392d";
const EYE = "#11100e";
const EYE_GLINT = "#f1e8d7";
const EAR_INNER = "#865f50";
const HOOF = "#201a17";
const MOUTH = "#1d1512";

export default function build() {
  const b = createBuilder({ name: "warthogAstra", detail: 0.85 });

  // The spine is deliberately low and heavy: with the legs it puts the shoulder at 0.75m.
  const root = b.joint("root", { at: [0, 0.60, -0.22], role: "spine", group: "body" });
  const spinePath = catmull([
    [0, 0.62, -0.52],
    [0, 0.66, -0.30],
    [0, 0.69, -0.02],
    [0, 0.70, 0.22],
    [0, 0.68, 0.39],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spine1", "spine2", "chest", "neck", "neckEnd"],
    role: "spine",
    group: "body",
  });

  const bodyStations = [
    { at: [0, 0.62, -0.52] as const, w: 0.23, h: 0.25 },
    { at: [0, 0.66, -0.34] as const, w: 0.29, h: 0.34 },
    { at: [0, 0.69, -0.08] as const, w: 0.34, h: 0.40 },
    { at: [0, 0.70, 0.16] as const, w: 0.33, h: 0.40 },
    { at: [0, 0.68, 0.37] as const, w: 0.25, h: 0.31 },
  ];
  const body = b.loft(bodyStations, {
    bone: [root, spine],
    color: HIDE,
    sectors: [
      [-58, 58, HIDE_DARK],
      [118, 242, HIDE_BELLY],
    ],
    smooth: false,
  });

  // Neck and long, slightly downturned skull.
  const neckEnd = spine.tip ?? spine.joints[spine.joints.length - 1];
  const head = b.joint("head", {
    parent: neckEnd,
    at: [0, 0.68, 0.39],
    dir: [0, -0.13, 1],
    role: "head",
    group: "head",
  });
  const headStations = [
    { at: head.local([0, -0.04, 0.01]), w: 0.27, h: 0.27 },
    { at: head.local([0, 0.14, 0.01]), w: 0.28, h: 0.25 },
    { at: head.local([0, 0.34, -0.01]), w: 0.24, h: 0.19 },
    { at: head.local([0, 0.53, -0.03]), w: 0.20, h: 0.14 },
    { at: head.local([0, 0.65, -0.04]), w: 0.18, h: 0.12 },
  ];
  b.loft(headStations, {
    bone: head,
    color: HIDE,
    sectors: [[-72, 72, HIDE_DARK]],
    smooth: false,
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.10, -0.10]),
    dir: head.dir([0, 1, -0.05]),
    role: "jaw",
    group: "head",
  });
  const jawPath = catmull([
    jaw.local([0, 0.00, 0]),
    jaw.local([0, 0.18, -0.01]),
    jaw.local([0, 0.40, -0.02]),
    jaw.local([0, 0.58, -0.03]),
  ]);
  b.sweep(jawPath, (t) => 0.075 - t * 0.028, {
    bone: jaw,
    color: HIDE,
    section: "box",
    caps: "round",
  });

  const snout = head.local([0, 0.67, -0.04]);
  b.part(new CylinderGeometry(0.09, 0.10, 0.035, b.segments(8)), SNOUT, {
    bone: head,
    at: snout,
    dir: head.dir([0, 1, 0]),
  });
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(0.020, b.segments(6), b.segments(4)), MOUTH, {
      bone: head,
      at: head.local([s * 0.040, 0.68, 0.005]),
    });
  }

  // Eyes are high on the skull and slightly behind the wart shelf.
  for (const s of [1, -1]) {
    const eyeAt = head.local([s * 0.145, 0.18, 0.125]);
    b.part(new SphereGeometry(0.047, b.segments(8), b.segments(6)), WART, { bone: head, at: eyeAt });
    b.part(new SphereGeometry(0.028, b.segments(8), b.segments(6)), EYE, {
      bone: head,
      at: head.local([s * 0.164, 0.20, 0.135]),
    });
    b.part(new SphereGeometry(0.007, b.segments(5), b.segments(4)), EYE_GLINT, {
      bone: head,
      at: head.local([s * 0.174, 0.19, 0.153]),
    });

    // Two characteristic wart bosses per cheek.
    b.part(new SphereGeometry(0.047, b.segments(7), b.segments(5)), WART, {
      bone: head,
      at: head.local([s * 0.19, 0.16, 0.015]),
      scale: [1.1, 0.8, 0.9],
    });
    b.part(new SphereGeometry(0.055, b.segments(7), b.segments(5)), WART, {
      bone: head,
      at: head.local([s * 0.18, 0.34, -0.015]),
      scale: [0.85, 0.9, 0.75],
    });

    // Ears point out and up from the back of the skull.
    const earAt = head.local([s * 0.16, 0.02, 0.15]);
    b.part(new ConeGeometry(0.075, 0.15, 4), HIDE_DARK, {
      bone: head,
      at: earAt,
      dir: head.dir([s * 0.8, -0.12, 0.85]),
      scale: [0.72, 1, 0.62],
    });
    b.part(new ConeGeometry(0.046, 0.10, 4), EAR_INNER, {
      bone: head,
      at: head.local([s * 0.17, 0.018, 0.16]),
      dir: head.dir([s * 0.8, -0.12, 0.85]),
      scale: [0.72, 1, 0.55],
    });

    // Upper tusks arc up and inward; lower tusks rise from the jaw to hone against them.
    const upperTusk = catmull([
      head.local([s * 0.12, 0.48, -0.04]),
      head.local([s * 0.20, 0.51, 0.00]),
      head.local([s * 0.22, 0.55, 0.14]),
      head.local([s * 0.13, 0.57, 0.24]),
    ]);
    b.sweep(upperTusk, (t) => 0.034 * (1 - 0.78 * t), {
      bone: head,
      color: IVORY,
      caps: { start: "flat", end: "point" },
      bands: [[0.72, IVORY_TIP], [1, IVORY_TIP]],
    });
    const lowerTusk = catmull([
      jaw.local([s * 0.070, 0.45, 0.00]),
      jaw.local([s * 0.095, 0.47, 0.045]),
      jaw.local([s * 0.11, 0.48, 0.14]),
    ]);
    b.sweep(lowerTusk, (t) => 0.021 * (1 - 0.80 * t), {
      bone: jaw,
      color: IVORY_TIP,
      caps: { start: "flat", end: "point" },
    });
  }
  b.sweep(
    catmull([head.local([0, 0.36, -0.095]), head.local([0, 0.56, -0.11]), jaw.local([0, 0.58, -0.07])]),
    0.009,
    { bone: jaw, color: MOUTH, caps: "flat" },
  );

  // A tail chain rises from the rump; a ring of short spikes makes its coarse tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.66, -0.52],
      [0, 0.76, -0.65],
      [0, 0.92, -0.72],
      [0, 1.08, -0.70],
    ]),
    { parent: root, names: ["tailBase", "tailMid", "tailTip"], role: "tail", group: "tail" },
  );
  b.sweep(tail, (t) => 0.047 * (1 - t) + 0.016, {
    bone: tail,
    color: HIDE_DARK,
    caps: { start: "round", end: "point" },
  });
  const tailTip = tail.tip ?? tail.joints[tail.joints.length - 1];
  b.ring(tailTip, { count: 7, radius: 0.032 }, (item) => {
    b.spike(item, item, 0.085, 0.012, { color: MANE_TIP, caps: "point" });
  });

  // A visible comb of coarse upright bristles follows the dorsal contour.
  for (const t of [0.04, 0.13, 0.23, 0.34, 0.46, 0.58, 0.69, 0.80, 0.90]) {
    const at = body.at(t, 0);
    b.spike(at, at, 0.13, 0.024, {
      color: MANE,
      caps: "point",
    });
  }

  // Four planted, slightly splayed two-bone legs. The hoof boxes are split down the middle.
  const legs = [
    { side: 1, z: -0.34, label: "L", bend: [0, 0, 1] as const },
    { side: -1, z: -0.34, label: "R", bend: [0, 0, -1] as const },
    { side: 1, z: 0.24, label: "L", bend: [0, 0, -1] as const },
    { side: -1, z: 0.24, label: "R", bend: [0, 0, 1] as const },
  ];
  for (const leg of legs) {
    const x = leg.side * 0.225;
    const hip = [x, 0.62, leg.z] as const;
    const foot = [x * 1.02, 0.050, leg.z + (leg.z > 0 ? 0.018 : -0.012)] as const;
    const points = limb(hip, foot, [0.285, 0.275], leg.bend);
    const chain = b.chain(`leg${leg.label}${leg.z > 0 ? "Front" : "Hind"}`, points, {
      parent: root,
      names: [`hip${leg.label}${leg.z > 0 ? "F" : "H"}`, `knee${leg.label}${leg.z > 0 ? "F" : "H"}`, `hoof${leg.label}${leg.z > 0 ? "F" : "H"}`],
      role: "leg",
      group: "legs",
    });
    b.sweep(chain, [0.073, 0.055], {
      bone: chain,
      color: HIDE_DARK,
      section: "box",
      caps: "round",
    });
    const hoof = chain.tip ?? chain.joints[chain.joints.length - 1];
    for (const toe of [-1, 1]) {
      b.part(new BoxGeometry(0.046, 0.055, 0.13), HOOF, {
        bone: hoof,
        at: hoof.local([toe * 0.025, -0.028, 0.035]),
        rotation: [0, toe * 5, 0],
      });
    }
  }

  // The loft supplies the angular shoulder and hip planes; no filler volume is needed.

  return b.root;
}
