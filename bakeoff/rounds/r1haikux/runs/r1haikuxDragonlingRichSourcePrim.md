```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, scales, smoothstep, spots } from "agentic-3js-builder";
import type { Builder, Chain } from "agentic-3js-builder";

export const meta = {
  name: "Baby dragon",
  description:
    "A house-cat-sized teal baby dragon sitting proudly beside its speckled, broken eggshell: buttery belly, orange back spines, amber wing skin, a toothy grin and a wisp of smoke from one nostril.",
};

const UP = new THREE.Vector3(0, 1, 0);

// Paints ---------------------------------------------------------------------

const TEAL = scales(["#2fb8a4", "#24a392", "#1f8f82"], "#12524b", { size: 0.03, width: 0.16, seed: 7 });
const BUTTER = scales(["#fbe9a0", "#f5dc84"], "#d9b25a", { size: 0.024, width: 0.14, seed: 11 });

/** Teal scales over the back and head, fading to a buttery belly and chest. */
const HIDE = paint((p, n, s) => {
  const underside = smoothstep(0.12, 0.075, p.y);
  const chest = smoothstep(0.3, 0.75, n.z) * smoothstep(0.1, 0.16, p.y) * (1 - smoothstep(0.23, 0.29, p.y));
  return mix(TEAL.at(p, n, s), BUTTER.at(p, n, s), Math.max(underside, 0.85 * chest));
});

/** Cream eggshell speckled with brown. */
const SHELL = spots("#f5ecd4", ["#8b5a35", "#6e4226", "#a06f43"], { size: 0.03, amount: 0.45, seed: 5 });

const SPINE = "#f2913a";
const HORN = "#f2e2b8";
const TOOTH = "#fffaf0";
const CLAW = "#f4ead6";
const WING_BONE = "#17766e";
const SMOKE = "#e6eaf0";
const MOUTH = "#8c2b3b";
const NOSTRIL = "#1e2d2c";
const BLUSH = "#ff8fa3";
const SPADE = "#f29a3b";

// Helpers --------------------------------------------------------------------

const bodyRy = (t: number) => 0.08 + 0.016 * Math.sin(Math.PI * t);

const legRadius = (t: number) =>
  t < 0.4 ? 0.04 - 0.008 * (t / 0.4) : t < 0.58 ? 0.032 - 0.012 * ((t - 0.4) / 0.18) : 0.02;

const mirrored = (s: number, x: number, y: number, z: number): [number, number, number] => [s * x, y, z];

/** Amber eyes: a dark pupil, a warm iris and a small glint, all aimed along the eye's own axis. */
function eyeInk(s: number) {
  const iris = new THREE.Vector3(s * 0.709, 0.253, 0.659).normalize();
  const glint = iris.clone().multiplyScalar(0.7).addScaledVector(UP, 0.7).normalize();
  return paint((_p, n) => {
    if (n.dot(glint) > 0.9) return "#ffffff";
    const d = n.dot(iris);
    return d > 0.8 ? "#1d1109" : d > 0.45 ? "#e8801c" : "#f7c23a";
  });
}

/** Translucent-looking amber skin: deeper where it meets the body, paler toward the edges. */
function wingSkin(s: number) {
  return gradient("#f0a040", "#ffd98a", mirrored(s, 0.05, 0.3, 0), mirrored(s, 0.33, 0.28, -0.08));
}

/** Stubby orange spines standing up along a chain's back (the side facing world up). */
function crest(b: Builder, chain: Chain, ts: number[], rise: (t: number) => number, size: (t: number) => number) {
  for (const t of ts) {
    const point = chain.at(t);
    const tangent = point.tangent;
    const dorsal = UP.clone().addScaledVector(tangent, -UP.dot(tangent)).normalize();
    const base = point.at.addScaledVector(dorsal, rise(t));
    const dir = dorsal.addScaledVector(tangent, -0.45).normalize();
    b.spike(base.toArray(), dir.toArray(), size(t), 0.011, {
      color: SPINE,
      bone: chain.jointAt(t),
      name: "spine",
    });
  }
}

// Model ----------------------------------------------------------------------

export default function babyDragon() {
  const b = createBuilder({ name: "baby-dragon", detail: 1, paintSize: 1024 });

  // Skeleton: pelvis, spine, neck and head, lower jaw, tail.
  b.joint("pelvis", { at: [0, 0.07, -0.02] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.085, -0.02],
      [0, 0.152, 0],
      [0, 0.218, 0.04],
      [0, 0.268, 0.09],
    ],
    { parent: "pelvis", names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.268, 0.09],
      [0, 0.31, 0.14],
      [0, 0.35, 0.19],
      [0, 0.368, 0.225],
    ],
    { parent: "spine3", names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.335, 0.26], dir: [0, -0.2, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.058, -0.05],
      [0.012, 0.046, -0.13],
      [0.05, 0.036, -0.2],
      [0.095, 0.03, -0.25],
      [0.12, 0.028, -0.28],
    ],
    { parent: "pelvis", names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // Chubby torso, neck and tail: one smooth skin bending with its bones.
  b.sweep(spine, (t: number): [number, number] => [0.072 + 0.02 * Math.sin(Math.PI * t), bodyRy(t)], {
    color: HIDE,
    name: "torso",
  });
  b.sweep(neck, (t: number) => 0.043 - 0.007 * t, { color: HIDE, name: "neck" });
  b.sweep(tail, (t: number) => 0.043 - 0.02 * t, { color: HIDE, name: "tail" });

  // Head: big round skull, teal snout, buttery lower jaw, dark mouth between them.
  b.part(new THREE.SphereGeometry(0.08, b.segments(14), b.segments(10)), HIDE, {
    at: [0, 0.385, 0.255],
    bone: "head",
    scale: [1, 0.92, 1.05],
    name: "head",
  });
  b.capsule([0, 0.378, 0.31], [0, 0.374, 0.375], [0.042, 0.038], { color: HIDE, bone: "head", name: "snout" });
  b.capsule([0, 0.33, 0.27], [0, 0.33, 0.355], [0.03, 0.024], { color: MOUTH, bone: "head", name: "mouth" });
  b.capsule([0, 0.335, 0.26], [0, 0.31, 0.36], [0.03, 0.024], { color: BUTTER, bone: "jaw", name: "jaw" });

  // Toothy grin: upper teeth hang from the snout, lower teeth rise from the jaw.
  for (const x of [-0.03, -0.015, 0, 0.015, 0.03]) {
    b.spike([x, 0.337, 0.35], [0, -1, 0], 0.02, 0.0065, { color: TOOTH, bone: "head", name: "tooth" });
    b.spike([x, 0.326, 0.35], [0, 1, 0], 0.018, 0.006, { color: TOOTH, bone: "jaw", name: "tooth" });
  }

  // Stubby horns on the crown.
  // (Built per side below.)

  // Body spines, down the back, neck and tail.
  crest(
    b,
    spine,
    [0.12, 0.25, 0.38, 0.5, 0.62, 0.74, 0.86],
    (t) => 0.85 * bodyRy(t),
    (t) => 0.036 - 0.012 * t,
  );
  crest(
    b,
    neck,
    [0.35, 0.7],
    (t) => 0.85 * (0.043 - 0.007 * t),
    () => 0.024,
  );
  crest(
    b,
    tail,
    [0.2, 0.45, 0.7],
    (t) => 0.8 * (0.043 - 0.02 * t),
    (t) => 0.02 - 0.006 * t,
  );

  // Sides: legs, front arms, wings, eyes, cheeks, nostrils, horns.
  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    // Legs: chunky haunches folded under the body, feet flat and forward.
    const leg = b.chain(
      `leg${S}`,
      [
        mirrored(s, 0.08, 0.085, 0),
        mirrored(s, 0.112, 0.06, 0.1),
        mirrored(s, 0.078, 0.03, 0.085),
        mirrored(s, 0.08, 0.02, 0.2),
      ],
      { parent: "pelvis", names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`], role: "leg" },
    );
    b.sweep(leg, legRadius, { color: HIDE, name: `leg${S}` });
    b.part(new THREE.SphereGeometry(0.056, b.segments(12), b.segments(9)), HIDE, {
      at: mirrored(s, 0.078, 0.085, 0.02),
      bone: `hip${S}`,
      name: "haunch",
    });
    for (const dx of [-0.013, 0, 0.013]) {
      b.spike([s * 0.08 + dx, 0.016, 0.212], [0, -0.25, 1], 0.016, 0.005, {
        color: CLAW,
        bone: `toe${S}`,
        name: "claw",
      });
    }

    // Front arms: propped forward, paws on the floor.
    const arm = b.chain(
      `arm${S}`,
      [
        mirrored(s, 0.07, 0.2, 0.08),
        mirrored(s, 0.105, 0.14, 0.1),
        mirrored(s, 0.085, 0.05, 0.15),
        mirrored(s, 0.08, 0.025, 0.19),
      ],
      { parent: "spine3", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, (t: number) => 0.026 - 0.008 * t, { color: HIDE, name: `arm${S}` });
    b.part(new THREE.SphereGeometry(0.03, b.segments(12), b.segments(9)), HIDE, {
      at: mirrored(s, 0.08, 0.026, 0.19),
      bone: `hand${S}`,
      scale: [1.05, 0.6, 1.15],
      name: "paw",
    });
    for (const dx of [-0.011, 0, 0.011]) {
      b.spike([s * 0.08 + dx, 0.02, 0.218], [0, -0.2, 1], 0.014, 0.004, {
        color: CLAW,
        bone: `hand${S}`,
        name: "claw",
      });
    }

    // Oversized wings: a raised arm, three fingers fanning from the wrist, amber skin between them.
    const shoulder = mirrored(s, 0.045, 0.29, 0);
    const elbow