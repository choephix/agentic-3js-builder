import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description: "A phoenix in flight, wings flung open, with crimson-to-gold plumage, flame crest, ribbon tail and drifting embers.",
};

const CRIMSON = "#9b0f23";
const ORANGE = "#ff6a1a";
const GOLD = "#ffc53d";
const AMBER = "#ffa500";
const DARK = "#1d0600";
const BEAK = "#e8a317";

/** Crimson at the body, orange through the wings, gold at the wing tips and tail ends. */
const fire = paint((p) => {
  const d = Math.min(Math.hypot(p.x * 0.7, (p.y - 1.55) * 1.2, p.z * 0.9) / 1.2, 1);
  return d < 0.5 ? mix(CRIMSON, ORANGE, d * 2) : mix(ORANGE, GOLD, (d - 0.5) * 2);
});

/** A flame-shaped plume from the skull outward. */
const plume = (L: number, w: number) => [
  [0, -w * 0.25],
  [L * 0.2, w],
  [L * 0.65, w * 0.85],
  [L, 0, "sharp"],
  [L * 0.65, -w * 0.8],
  [L * 0.2, -w],
];

export default function build() {
  const b = createBuilder({ name: "phoenix", detail: 1, paintSize: 1024 });

  // ---- Skeleton -------------------------------------------------------------
  const body = b.joint("body", { at: [0, 1.5, 0], dir: [0, 0, 1], role: "spine" });
  b.joint("tail", { parent: "body", at: [0, 1.5, -0.5], dir: [0, -0.1, -1], role: "tail" });
  b.joint("neck", { parent: "body", at: [0, 1.56, 0.3], dir: [0, 0.3, 1], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.62, 0.42], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.6, 0.5], dir: [0, 0, 1], role: "jaw" });

  // ---- Body: a tapered lathe along z ------------------------------------
  b.lathe(
    [
      [0, -0.6],
      [0.09, -0.55],
      [0.18, -0.3],
      [0.22, 0],
      [0.2, 0.25],
      [0.12, 0.45],
      [0, 0.52],
    ],
    { color: fire, at: [0, 1.5, 0], axis: [0, 0, 1], segments: 12, smoothing: 1, bone: "body", name: "torso" },
  );

  // ---- Neck and head ----------------------------------------------------
  b.capsule([0, 1.55, 0.3], [0, 1.62, 0.44], 0.07, { color: fire, bone: "neck" });
  b.part(new THREE.SphereGeometry(0.11, 14, 10), fire, { at: [0, 1.62, 0.42], bone: "head", name: "skull" });

  // Glowing amber eyes with dark pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), AMBER, {
      at: [0.075 * s, 1.66, 0.5],
      bone: "head",
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), DARK, {
      at: [0.095 * s, 1.665, 0.535],
      bone: "head",
      name: s > 0 ? "pupilL" : "pupilR",
    });
  }

  // Golden hooked beak: upper on the head, lower on the jaw.
  const beakGold = gradient(BEAK, GOLD, [0, 1.6, 0.5], [0, 1.6, 0.75]);
  b.sweep(
    catmull([
      [0, 1.68, 0.48],
      [0, 1.67, 0.62],
      [0, 1.6, 0.73],
      [0, 1.53, 0.7],
    ]),
    (t: number) => 0.05 * (1 - t) + 0.008,
    { color: beakGold, bone: "head", name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 1.6, 0.5],
      [0, 1.59, 0.62],
      [0, 1.57, 0.7],
    ]),
    (t: number) => 0.035 * (1 - t) + 0.007,
    { color: beakGold, bone: "jaw", name: "beakLower" },
  );

  // ---- Flame crest: five plumes sweeping back over the skull -------------
  const crest = gradient(CRIMSON, GOLD, [0, 1.66, 0.42], [0, 1.84, 0.2]);
  [-0.05, -0.025, 0, 0.025, 0.05].forEach((x, i) => {
    const lift = i === 2 ? 1.1 : 0.9;
    b.sweep(
      catmull([
        [x, 1.69, 0.44],
        [x * 1.4, 1.69 + 0.09 * lift, 0.34],
        [x * 1.8, 1.69 + 0.15 * lift, 0.22],
        [x * 1.6, 1.69 + 0.11 * lift, 0.1],
      ]),
      (t: number) => 0.022 * (1 - t) + 0.003,
      { color: crest, bone: "head", name: `crest${i + 1}` },
    );
  });

  // ---- Wings ------------------------------------------------------------
  const buildWing = (s: 1 | -1) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(
      `wing${side}`,
      catmull([
        [0.12 * s, 1.56, 0.12],
        [0.45 * s, 1.66, 0.22],
        [0.85 * s, 1.66, 0.05],
        [1.35 * s, 1.5, -0.32],
      ]),
      { role: "wing", parent: body, names: [`arm${side}`, `forearm${side}`, `hand${side}`] },
    );

    // Primary feathers at the outer hand, long and trailing.
    for (let i = 0; i < 7; i++) {
      const t = 0.6 + i * 0.065;
      const cp = chain.at(t);
      const xd = cp.tangent.clone().add(new THREE.Vector3(0, 0, -0.5)).normalize();
      const L = 0.4 - i * 0.02;
      b.extrude(plume(L, 0.06), {
        color: fire,
        at: cp,
        x: xd,
        y: [0, 0, 1],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        name: `primary${side}${i + 1}`,
      });
    }

    // Secondary feathers along the forearm, overlapping the body side.
    for (let i = 0; i < 7; i++) {
      const t = 0.22 + i * 0.06;
      const cp = chain.at(t);
      const xd = cp.tangent.clone().add(new THREE.Vector3(0, 0, -0.35)).normalize();
      b.extrude(plume(0.28, 0.07), {
        color: fire,
        at: cp,
        x: xd,
        y: [0, 0, 1],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        name: `secondary${side}${i + 1}`,
      });
    }
  };
  buildWing(1);
  buildWing(-1);

  // ---- Ribbon tail: long trailing sweeps from the rump ------------------
  const tailRibbon = (k: number) => {
    const sx = (k - 2) * 0.05;
    const reach = 1 - Math.abs(k - 2) * 0.12;
    b.sweep(
      catmull([
        [sx, 1.5, -0.5],
        [sx * 1.8, 1.43, -0.95],
        [sx * 3, 1.3, -1.45],
        [sx * 3.6, 1.12 + 0.05 * k, -1.5 - 0.5 * reach],
      ]),
      (t: number): [number, number] => [0.04 * (1 - 0.6 * t) + 0.005, 0.005],
      { section: "box", color: fire, bone: "tail", name: `tailRibbon${k + 1}` },
    );
  };
  for (let k = 0; k < 5; k++) tailRibbon(k);

  // ---- Embers and sparks drifting off the wings -------------------------
  const r = rng(11);
  const emberColors = ["#ffd34d", "#ff8a1f", "#fff1a8"];
  for (let i = 0; i < 28; i++) {
    const s = r() < 0.5 ? 1 : -1;
    const x = s * (0.5 + r() * 1.1);
    const y = 1.2 + r() * 0.9;
    const z = -0.6 + r() * 0.9;
    const size = 0.012 + r() * 0.01;
    b.part(new THREE.IcosahedronGeometry(size, 0), emberColors[i % emberColors.length], {
      at: new THREE.Vector3(x, y, z),
      bone: "body",
      name: `ember${i + 1}`,
    });
  }

  return b.root;
}
