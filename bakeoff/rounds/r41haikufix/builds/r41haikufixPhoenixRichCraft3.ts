import * as THREE from "three";
import { catmull, countershade, createBuilder, gradient, limb, rng } from "../../../../src/index";
import { animeEye, cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "phoenix",
  description: "A phoenix with flame plumage and wings spread, in a stylized anime-game look.",
};

// Palette
const RED = "#e5322d";
const ORANGE = "#ff8a1c";
const YELLOW = "#ffd33d";
const CREAM = "#fff1c2";
const BEAK = "#f2b441";
const LEG = "#e8a33a";
const INK_DARK = "#22112f";

type Outline = Array<[number, number] | [number, number, "sharp"]>;

/** A flame-tongue outline: wide at the base, tapering to one sharp tip at `len`. */
function plume(len: number, wid: number): Outline {
  return [
    [0, 0],
    [wid, len * 0.35],
    [wid * 0.45, len * 0.8],
    [0, len, "sharp"],
    [-wid * 0.45, len * 0.8],
    [-wid, len * 0.35],
  ];
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);

  // Paints: warm on top, cool shadow below, flame gradients across the plumage.
  const BODY = cel(countershade(RED, YELLOW, { level: 0.15 }));
  const WING = cel(gradient(RED, ORANGE, [0.15, 1.0, 0], [1.25, 1.1, -0.2]));
  const TAIL = cel(gradient(RED, YELLOW, [0, 0.6, -0.2], [0, 0.4, -0.9]));
  const HEAD = cel(gradient(ORANGE, YELLOW, [0, 1.35, 0.3], [0, 1.7, 0.5]));

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.62, 0] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.62, 0],
      [0, 0.8, 0.1],
      [0, 0.96, 0.2],
      [0, 1.1, 0.27],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.1, 0.27],
      [0, 1.28, 0.34],
      [0, 1.42, 0.4],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.5, 0.44], aim: [0, 1.7, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.44, 0.56], aim: [0, 1.42, 0.7], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.62, -0.02],
      [0, 0.56, -0.25],
      [0, 0.48, -0.5],
      [0, 0.42, -0.72],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // Body and neck
  b.sweep(spine, (t: number) => [0.13 + 0.07 * Math.sin(Math.PI * t), 0.15 + 0.06 * Math.sin(Math.PI * t)], {
    color: BODY,
  });
  b.sweep(neck, [0.075, 0.06], { color: BODY });

  // Head: a chunky sphere with big anime eyes drawn on it
  const HEAD_C: [number, number, number] = [0, 1.52, 0.44];
  const skull = b.part(new THREE.SphereGeometry(0.19, 16, 12), HEAD, {
    bone: head,
    at: HEAD_C,
    scale: [1, 0.96, 1.08],
  });
  const skin = b.surface(skull);
  const EYE = animeEye({ iris: ORANGE, irisLight: "#ffe27a", irisDark: "#a8300e" });
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 38, 8);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.07, 0.095], mirror: s > 0 });
  }

  // Beak: upper on the head, lower on the jaw so it can open
  b.spike([0, 1.5, 0.6], [0, 1.42, 0.8], null, 0.06, { color: BEAK, bone: head });
  b.spike([0, 1.44, 0.56], [0, 1.4, 0.74], null, 0.04, { color: BEAK, bone: jaw });

  // Crest of flame tongues, fanned back over the skull
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i);
    const len = 0.3 - 0.035 * a;
    const base: [number, number, number] = [i * 0.035, 1.66, 0.46 - 0.03 * a];
    const crest = b.extrude(plume(len, 0.045), {
      at: base,
      x: [1, 0, 0],
      y: [0, 0.9, -0.42 - 0.03 * a],
      thickness: 0.02,
      bevel: 0.006,
      smoothing: 1,
      color: i % 2 === 0 ? ORANGE : YELLOW,
      bone: head,
    });
    glow(crest, 0.8);
  }

  // Wings: spread out to each side, with trailing flame feathers
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wingPts: [number, number, number][] = [
      [s * 0.12, 0.95, 0.04],
      [s * 0.5, 1.05, 0.0],
      [s * 0.92, 1.12, -0.08],
      [s * 1.2, 1.1, -0.16],
    ];
    const wing = b.chain(`wing${S}`, catmull(wingPts), {
      parent: spine.joints[1],
      names: [`armW${S}`, `foreW${S}`, `handW${S}`, `tipW${S}`],
      role: "wing",
    });
    b.sweep(wing, (t: number) => 0.07 * (1 - t) + 0.02, { color: WING });

    // Trailing primaries lying back from the wing
    b.along(wing, 6, (at) => {
      const len = 0.28 + 0.1 * rand();
      b.extrude(plume(len, 0.05), {
        at,
        x: [1, 0, 0],
        y: [0, 0.3, -1],
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: rand() > 0.5 ? RED : ORANGE,
      });
    });

    // Glowing ember at each wing tip
    glow(
      b.part(new THREE.SphereGeometry(0.05, 8, 6), YELLOW, {
        bone: wing.tip ?? wing.joints[wing.joints.length - 1],
        at: wingPts[3],
      }),
      1,
    );
  }

  // Tail: a sweep with flame blades fanning off it
  b.sweep(tail, (t: number) => 0.07 * (1 - t) + 0.02, { color: TAIL });
  let k = 0;
  b.along(tail, 5, (at) => {
    const len = 0.36 - 0.04 * k;
    const color = k % 3 === 0 ? RED : k % 3 === 1 ? ORANGE : YELLOW;
    const blade = b.extrude(plume(len, 0.06), {
      at,
      x: [1, 0, 0],
      y: [0, 1, -0.3],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      color,
    });
    if (color === YELLOW) glow(blade, 0.7);
    k++;
  });

  // Legs: short, sturdy, with three forward toes and talons
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.12, 0.62, 0.0], [s * 0.12, 0.03, 0.08], [0.32, 0.3], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    const ankleAt: [number, number, number] = [s * 0.12, 0.03, 0.08];
    for (const j of [-1, 0, 1]) {
      const toe: [number, number, number] = [s * 0.12 + j * 0.04, 0.02, 0.18];
      b.rod(ankleAt, toe, 0.02, { color: LEG, bone: ankle });
      b.spike(toe, [toe[0], 0.0, toe[2] + 0.07], null, 0.012, { color: INK_DARK, bone: ankle });
    }
  }

  // Soft cream breast feathers
  b.part(new THREE.SphereGeometry(0.15, 12, 8), CREAM, {
    bone: spine.joints[1],
    at: [0, 0.86, 0.14],
    scale: [0.9, 0.7, 0.8],
  });

  return b.root;
}
