// PICO-8 Rooster: a small, proud farmyard bird built from faceted primitives and square-cell paints.
// The whole model uses only the sixteen PICO-8 colours; every paint is quantised to one 12 mm texel.
import { BoxGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { cellPaint, pixelArt, stepped } from "../kits/pixel";
import { catmull, bezier } from "../src/path";

export const meta = {
  name: "PICO-8 Rooster",
  description: "A proud pixel-art rooster with a red comb, golden hackles, iridescent sickle tail, wings, scaly legs and planted toes.",
  builtBy: "GPT-6 Astra",
};

// Canonical PICO-8 palette. Paints and pixel drawings never leave this set.
const BLACK = "#000000";
const NAVY = "#1d2b53";
const PURPLE = "#7e2553";
const GREEN_DARK = "#008751";
const BROWN = "#ab5236";
const WHITE = "#fff1e8";
const RED = "#ff004d";
const ORANGE = "#ffa300";
const YELLOW = "#ffec27";
const GREEN = "#00e436";
const BLUE = "#29adff";
const INDIGO = "#83769c";
const PINK = "#ff77a8";
const PEACH = "#ffccaa";

const TEXEL = 0.012;

const BODY = cellPaint(TEXEL, (c) => {
  const light = 0.38 + c.n.y * 0.28 + c.n.z * 0.18;
  return c.pick([NAVY, GREEN_DARK, GREEN, YELLOW], light);
}, { dither: true });
const BODY_DARK = cellPaint(TEXEL, (c) => c.random(3) < 0.2 ? NAVY : c.pick([NAVY, GREEN_DARK, GREEN], 0.45), { dither: true });
const HACKLE = cellPaint(TEXEL, (c) => c.random(5) < 0.18 ? ORANGE : c.pick([BROWN, ORANGE, YELLOW], 0.56 + c.n.y * 0.2), { dither: true });
const RED_PIX = cellPaint(TEXEL, (c) => c.random(7) < 0.2 ? PURPLE : c.pick([PURPLE, RED, PINK], 0.63 + c.n.y * 0.18), { dither: true });
const BEAK_PIX = cellPaint(TEXEL, (c) => c.random(4) < 0.18 ? BROWN : c.pick([ORANGE, YELLOW, PEACH], 0.52 + c.n.y * 0.22), { dither: true });
const LEG_PIX = cellPaint(TEXEL, (c) => c.random(5) < 0.2 ? BROWN : c.pick([BROWN, ORANGE, PEACH], 0.38 + c.n.y * 0.2), { dither: true });
const TAIL_BLUE = cellPaint(TEXEL, (c) => c.random(5) < 0.22 ? NAVY : c.pick([PURPLE, NAVY, BLUE, INDIGO], 0.48 + c.n.y * 0.14), { dither: true });
const TAIL_GREEN = cellPaint(TEXEL, (c) => c.random(5) < 0.18 ? NAVY : c.pick([GREEN_DARK, GREEN, BLUE, INDIGO], 0.4 + c.n.y * 0.2), { dither: true });

const EYE_TEXTURE = pixelArt([
  "........",
  ".wwwwww.",
  ".wkkkww.",
  ".wkbkww.",
  ".wkkkww.",
  ".wwwwww.",
  "........",
], { w: WHITE, k: BLACK, b: BLUE });

const FEATHER_TEXTURE = pixelArt([
  "....y...",
  "...yyy..",
  "..yyyy..",
  "..y..y..",
  ".y....y.",
  ".y....y.",
  "y......y",
  "y......y",
  "........",
], { y: YELLOW });

export default function build() {
  const b = createBuilder({ name: "pico8Rooster", detail: 0.72, paintSize: 1024 });

  // Skeleton first: hips, a low body-to-neck spine, and a forward-facing head.
  const hips = b.joint("hips", { at: [0, 0.31, -0.03], role: "spine", group: "body" });
  const spine = b.chain("spine", [
    [0, 0.31, -0.13],
    [0, 0.35, -0.01],
    [0, 0.39, 0.12],
  ], { parent: hips, role: "spine", group: "body" });
  const neck = b.chain("neck", catmull([
    [0, 0.39, 0.12],
    [0, 0.47, 0.18],
    [0, 0.56, 0.22],
    [0, 0.60, 0.24],
  ]), { parent: spine.joints[1], count: 3, role: "neck", group: "neck" });
  const stations = [
    { at: [0, 0.30, -0.18] as const, w: 0.13, h: 0.12 },
    { at: [0, 0.33, -0.06] as const, w: 0.25, h: 0.25 },
    { at: [0, 0.37, 0.08] as const, w: 0.27, h: 0.27 },
    { at: [0, 0.41, 0.16] as const, w: 0.22, h: 0.22 },
    { at: [0, 0.48, 0.19] as const, w: 0.18, h: 0.18 },
    { at: [0, 0.56, 0.22] as const, w: 0.16, h: 0.16 },
  ];
  b.loft(stations, {
    bone: [hips, spine, neck],
    color: BODY,
    sectors: [[125, 235, BODY_DARK]],
    group: "body",
  });

  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.06, 1], role: "head", group: "head" });
  b.part(new SphereGeometry(1, b.segments(8), b.segments(6)), BODY, {
    bone: head,
    at: head.local([0, 0.045, 0.015]),
    scale: [0.145, 0.14, 0.16],
    group: "head",
    name: "pixelHead",
  });

  // Pixel eyes are little cubes, so the pupil stays a true square texel from every angle.
  for (const s of [1, -1]) {
    b.part(new BoxGeometry(0.042, 0.036, 0.012), WHITE, {
      texture: EYE_TEXTURE,
      bone: head,
      at: head.local([s * 0.07, 0.075, 0.132]),
      dir: head.dir([0, 0, 1]),
      axis: "z",
      group: "face",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
  }

  // Three-lobed comb, plus the red wattles under the cheeks.
  const comb = stepped([
    [-2, 2], [-3, 3], [-2, 3], [-3, 3], [-2, 2],
  ], TEXEL, { rows: true });
  b.extrude(comb, {
    at: head.local([0, 0.05, 0.02]),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.018,
    color: RED_PIX,
    bone: head,
    group: "head",
    name: "comb",
  });
  for (const s of [1, -1]) {
    b.part(new SphereGeometry(1, b.segments(6), b.segments(4)), RED_PIX, {
      bone: head,
      at: head.local([s * 0.055, -0.065, 0.105]),
      scale: [0.032, 0.05, 0.018],
      group: "head",
      name: `wattle${s > 0 ? "L" : "R"}`,
    });
  }

  // Upper and lower beaks are separate bones so the jaw can open in a flex shot.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.135, -0.028]),
    dir: head.dir([0, 0.8, -0.25]),
    role: "jaw",
    group: "jaw",
  });
  b.spike(head.local([0, 0.14, 0.005]), head.dir([0, 0.9, -0.15]), 0.085, 0.035, {
    bone: head,
    color: BEAK_PIX,
    group: "jaw",
    name: "upperBeak",
  });
  b.spike(jaw, jaw, 0.064, 0.024, { color: BEAK_PIX, group: "jaw", name: "lowerBeak" });
  b.pose(jaw, { axis: jaw.dir([1, 0, 0]), deg: -10 });

  // Golden hackle: layered pointed feathers down the front of the neck and breast.
  for (const [i, z] of [0.23, 0.19, 0.15, 0.1, 0.05].entries()) {
    const root: [number, number, number] = [0, 0.59 - i * 0.035, z];
    const tip: [number, number, number] = [0, 0.49 - i * 0.045, z + 0.06];
    b.sweep(bezier(root, [0, root[1] - 0.02, z + 0.035], tip), [0.028, 0.004], {
      color: HACKLE,
      caps: { end: "point" },
      group: "neck",
      name: `hackle${i}`,
    });
  }
  // A few cross cards make the cape read as square feather pixels even in side view.
  b.cards(
    [frame([0.0, 0.57, 0.24], [0, 0, 1]), frame([0.0, 0.52, 0.22], [0, 0, 1])],
    FEATHER_TEXTURE,
    { size: [0.045, 0.09], lean: 5, flow: [0, -0.2, 1], cross: true, color: WHITE, group: "neck" },
  );

  // Wings held slightly out: each arm has three digit chains joined by a feather membrane.
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const wing = b.chain(`wing${side}`, [
      [s * 0.12, 0.43, 0.07],
      [s * 0.25, 0.44, 0.04],
      [s * 0.37, 0.40, 0.01],
    ], { parent: spine.joints[1], role: "wing", group: `wing${side}` });
    b.sweep(wing, [0.045, 0.026], { color: BODY_DARK, section: "box", group: `wing${side}` });
    const tips = [
      [s * 0.48, 0.39, -0.06] as [number, number, number],
      [s * 0.50, 0.32, -0.16] as [number, number, number],
      [s * 0.44, 0.26, -0.25] as [number, number, number],
    ];
    const fingers = tips.map((tip, i) => {
      const finger = b.chain(`primary${i + 1}${side}`, catmull([
        [s * 0.35, 0.40 - i * 0.015, 0.0],
        [s * 0.43, 0.37 - i * 0.04, -0.07 - i * 0.04],
        tip,
      ]), { parent: wing.joints[1], role: "digit", group: `wing${side}` });
      b.sweep(finger, [0.018, 0.005], { color: TAIL_BLUE, caps: { end: "point" }, group: `wing${side}` });
      return finger;
    });
    b.membrane(fingers[0], fingers[1], { thickness: 0.012, color: BODY_DARK, scallop: 0.08, group: `wing${side}` });
    b.membrane(fingers[1], fingers[2], { thickness: 0.012, color: BODY, scallop: 0.08, group: `wing${side}` });
    for (let i = 0; i < 3; i++) {
      b.sweep(bezier(
        [s * (0.2 + i * 0.04), 0.48 - i * 0.025, 0.08 - i * 0.035],
        [s * (0.3 + i * 0.05), 0.50 - i * 0.03, 0.03 - i * 0.05],
        [s * (0.42 + i * 0.04), 0.43 - i * 0.04, -0.04 - i * 0.07],
      ), [0.014, 0.003], { color: HACKLE, caps: { end: "point" }, group: `wing${side}`, name: `coverts${i}${side}` });
    }
  }

  // Five sweeping tail sickles, alternating the blue-violet and green PICO-8 ramps.
  const tailTips: Array<[number, number, number]> = [
    [-0.11, 0.58, -0.31], [-0.055, 0.64, -0.35], [0, 0.68, -0.38], [0.055, 0.64, -0.35], [0.11, 0.58, -0.31],
  ];
  tailTips.forEach((tip, i) => {
    const x = tip[0];
    const tailPath = bezier(
      [x * 0.45, 0.40, -0.12],
      [x * 1.1, 0.47 + (2 - Math.abs(i - 2)) * 0.025, -0.27],
      [x, tip[1] - 0.04, -0.25],
      tip,
    );
    b.sweep(tailPath, [0.033, 0.004], {
      color: i % 2 ? TAIL_GREEN : TAIL_BLUE,
      caps: { end: "point" },
      group: "tail",
      name: `sickle${i}`,
    });
    b.sweep(tailPath.slice(0.08, 0.92), [0.006, 0.002], {
      color: i === 2 ? YELLOW : INDIGO,
      caps: { end: "point" },
      group: "tail",
      name: `sickleShaft${i}`,
    });
  });

  // Scaly legs, backward spurs, and four planted toes per side.
  for (const [s, side] of [[1, "L"], [-1, "R"]] as const) {
    const contact: [number, number, number] = [s * 0.09, 0.055, 0.09];
    const points = limb(
      [s * 0.09, 0.31, -0.02],
      contact,
      [0.12, 0.11, 0.09, 0.07],
      [[0, 0, 1], [0, 0, -1], [0, 0, 1]],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${side}`, points, {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.09],
      group: `leg${side}`,
    });
    b.sweep(leg, [0.026, 0.014], { color: LEG_PIX, section: "box", bands: [[0.25, BROWN], [0.5, ORANGE], [0.75, BROWN]], group: `leg${side}`, name: `scalyLeg${side}` });
    const foot = leg.at(1);
    b.spike(foot.moved([0, 0, -0.022]), [0, -0.55, -1], 0.064, 0.014, { color: BROWN, group: `leg${side}`, name: `spur${side}` });
    for (const [dx, dz] of [[-0.028, 0.03], [0, 0.04], [0.028, 0.03], [0, -0.026]]) {
      b.spike(foot.moved([dx, 0, 0]), [s * dx * 1.6, -0.42, dz > 0 ? 1 : -1], 0.075, 0.012, { color: LEG_PIX, group: `leg${side}`, name: `toe${side}` });
    }
  }

  return b.root;
}
